import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { TEST_GATE_SHARDS, TEST_SHARDS } from "../tests/test-gate-manifest.mjs";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_PATH = join(PROJECT_ROOT, ".build", "test-gate-report.json");
const DEFAULT_SHARD_TIMEOUT_MS = 300_000;
const FINGERPRINT_ROOT_FILES = new Set([
    "package.json",
    "index.html",
    "game.html",
    "level-editor.html",
    "asset-editor.html",
    "character-editor.html",
    "renderer-smoke.html"
]);
const FINGERPRINT_DIRECTORIES = new Set(["assets", "devel", "electron", "src", "tests"]);
const FINGERPRINT_EXTENSIONS = new Set([".cjs", ".html", ".js", ".json", ".mjs", ".py"]);

function extensionOf(path) {
    const slash = path.lastIndexOf("/");
    const dot = path.lastIndexOf(".");
    return dot > slash ? path.slice(dot).toLowerCase() : "";
}

async function walkFiles(directory, output = []) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        if ([".build", ".git", "dist", "node_modules", "__pycache__"].includes(entry.name)) continue;
        const path = join(directory, entry.name);
        if (entry.isDirectory()) await walkFiles(path, output);
        else if (entry.isFile()) output.push(path);
    }
    return output;
}

export async function testSourceFingerprint() {
    const candidates = [];
    for (const entry of await readdir(PROJECT_ROOT, { withFileTypes: true })) {
        if (entry.isFile() && FINGERPRINT_ROOT_FILES.has(entry.name)) candidates.push(join(PROJECT_ROOT, entry.name));
        if (entry.isDirectory() && FINGERPRINT_DIRECTORIES.has(entry.name)) await walkFiles(join(PROJECT_ROOT, entry.name), candidates);
    }
    const files = candidates
        .filter((path) => FINGERPRINT_EXTENSIONS.has(extensionOf(path.replaceAll("\\", "/"))))
        .sort((left, right) => relative(PROJECT_ROOT, left).localeCompare(relative(PROJECT_ROOT, right)));
    const hash = createHash("sha256");
    for (const path of files) {
        const relativePath = relative(PROJECT_ROOT, path).replaceAll("\\", "/");
        hash.update(relativePath);
        hash.update("\0");
        hash.update(await readFile(path));
        hash.update("\0");
    }
    return hash.digest("hex");
}

async function readReport() {
    try {
        return JSON.parse(await readFile(REPORT_PATH, "utf8"));
    } catch {
        return null;
    }
}

async function writeReport(report) {
    await mkdir(dirname(REPORT_PATH), { recursive: true });
    await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function shardTimeoutMs() {
    const configured = Number(process.env.TEST_SHARD_TIMEOUT_MS);
    return Number.isFinite(configured) && configured > 0 ? Math.round(configured) : DEFAULT_SHARD_TIMEOUT_MS;
}

function runShard(shard, timeoutMs) {
    return new Promise((resolveRun) => {
        const startedAt = Date.now();
        let timedOut = false;
        let finished = false;
        const child = spawn(process.execPath, [
            "--expose-gc",
            "tests/testbench.mjs",
            "--progress",
            `--group=${shard}`
        ], {
            cwd: PROJECT_ROOT,
            stdio: "inherit",
            env: process.env
        });
        const timer = setTimeout(() => {
            timedOut = true;
            child.kill("SIGTERM");
            setTimeout(() => {
                if (!finished) child.kill("SIGKILL");
            }, 2_000).unref();
        }, timeoutMs);
        timer.unref();
        child.once("error", (error) => {
            if (finished) return;
            finished = true;
            clearTimeout(timer);
            resolveRun({
                status: "failed",
                durationMs: Date.now() - startedAt,
                error: error.message
            });
        });
        child.once("exit", (code, signal) => {
            if (finished) return;
            finished = true;
            clearTimeout(timer);
            resolveRun({
                status: timedOut ? "timed-out" : code === 0 ? "passed" : "failed",
                durationMs: Date.now() - startedAt,
                exitCode: Number.isInteger(code) ? code : null,
                signal: signal || null
            });
        });
    });
}

function formatDuration(durationMs) {
    return `${(Math.max(0, Number(durationMs) || 0) / 1000).toFixed(2)} s`;
}

export function availableTestGates() {
    return Object.keys(TEST_GATE_SHARDS);
}

export function testGateShardNames(gate) {
    const normalized = String(gate || "release").trim().toLowerCase();
    const shards = TEST_GATE_SHARDS[normalized];
    if (!shards) throw new Error(`Unknown test gate: ${gate}. Available gates: ${availableTestGates().join(", ")}`);
    return [...shards];
}

export async function runTestGate(gate = "release", options = {}) {
    const normalizedGate = String(gate || "release").trim().toLowerCase();
    const shards = testGateShardNames(normalizedGate);
    const fingerprint = await testSourceFingerprint();
    const previous = options.resume ? await readReport() : null;
    const report = previous?.fingerprint === fingerprint
        ? previous
        : { version: 1, fingerprint, results: {} };
    report.lastGate = normalizedGate;
    report.startedAt = new Date().toISOString();
    report.completedAt = null;
    report.results ||= {};
    const timeoutMs = shardTimeoutMs();
    const rows = [];

    console.log(`\nTEST GATE ${normalizedGate.toUpperCase()} (${shards.length} fresh-process shard${shards.length === 1 ? "" : "s"})`);
    console.log(`Per-shard timeout: ${formatDuration(timeoutMs)}${options.resume ? "; resume enabled" : ""}.`);

    for (let index = 0; index < shards.length; index += 1) {
        const shard = shards[index];
        if (!TEST_SHARDS[shard]) throw new Error(`Gate ${normalizedGate} references unknown shard ${shard}`);
        const prior = report.results[shard];
        if (options.resume && prior?.status === "passed") {
            const skipped = { status: "skipped", durationMs: 0, reason: "already passed for this source fingerprint" };
            rows.push({ shard, ...skipped });
            console.log(`\n[${index + 1}/${shards.length}] SKIP ${shard} (${skipped.reason})`);
            continue;
        }
        console.log(`\n[${index + 1}/${shards.length}] RUN  ${shard}`);
        const result = await runShard(shard, timeoutMs);
        report.results[shard] = {
            ...result,
            completedAt: new Date().toISOString()
        };
        rows.push({ shard, ...result });
        await writeReport(report);
        const label = result.status === "passed" ? "PASS" : result.status === "timed-out" ? "TIMEOUT" : "FAIL";
        console.log(`[${index + 1}/${shards.length}] ${label} ${shard} (${formatDuration(result.durationMs)})`);
    }

    report.completedAt = new Date().toISOString();
    await writeReport(report);

    console.log("\nTEST GATE SUMMARY");
    for (const row of rows) {
        const label = row.status === "passed" ? "PASS" : row.status === "skipped" ? "SKIP" : row.status === "timed-out" ? "TIMEOUT" : "FAIL";
        const detail = row.status === "skipped" ? row.reason : formatDuration(row.durationMs);
        console.log(`${label.padEnd(7)} ${row.shard.padEnd(28)} ${detail}`);
    }
    const unsuccessful = rows.filter((row) => !["passed", "skipped"].includes(row.status));
    console.log(unsuccessful.length
        ? `FAIL ${normalizedGate} gate: ${unsuccessful.length} shard${unsuccessful.length === 1 ? "" : "s"} unsuccessful.`
        : `PASS ${normalizedGate} gate.`);
    return unsuccessful.length ? 1 : 0;
}

export async function testGateReportPath() {
    try {
        await stat(REPORT_PATH);
        return REPORT_PATH;
    } catch {
        return REPORT_PATH;
    }
}
