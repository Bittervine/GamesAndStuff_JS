#!/usr/bin/env node
import { readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_EXTENSIONS = new Set([".html", ".js", ".mjs"]);
const SKIP_DIRECTORIES = new Set([".build", ".git", "devel", "dist", "electron", "node_modules", "tests", "__pycache__"]);
const APPROVED_DIRECT_CANVAS_OWNERS = new Map([
    ["asset-editor.html", "standalone atlas authoring surface"],
    ["character-editor.html", "standalone Puppet Forge authoring surfaces"],
    ["level-editor.html", "standalone Level Editor scene, palettes, and caches"],
    ["src/tools/level-editor-2.js", "development-only baseline-to-editor migration scaffold"],
    ["src/browser/game-bootstrap.js", "small HUD minimap only"],
    ["src/presentation", "game presentation backend and visual caches"]
]);
const CANVAS_PATTERN = /getContext\(["']2d["']\)|\.(?:arc|beginPath|clearRect|createImageData|drawImage|fillRect|fillText|putImageData|strokeRect|strokeText)\s*\(/g;

async function walk(directory, output = []) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) continue;
        const path = join(directory, entry.name);
        if (entry.isDirectory()) await walk(path, output);
        else if (entry.isFile() && SOURCE_EXTENSIONS.has(extname(entry.name).toLowerCase())) output.push(path);
    }
    return output;
}

function approvedOwner(relativePath) {
    if (APPROVED_DIRECT_CANVAS_OWNERS.has(relativePath)) return APPROVED_DIRECT_CANVAS_OWNERS.get(relativePath);
    for (const [prefix, reason] of APPROVED_DIRECT_CANVAS_OWNERS) {
        if (relativePath.startsWith(`${prefix}/`)) return reason;
    }
    return "";
}

const rows = [];
for (const path of await walk(PROJECT_ROOT)) {
    const source = await readFile(path, "utf8");
    const matches = source.match(CANVAS_PATTERN) || [];
    if (!matches.length) continue;
    const relativePath = relative(PROJECT_ROOT, path).replaceAll("\\", "/");
    rows.push({
        path: relativePath,
        calls: matches.length,
        reason: approvedOwner(relativePath)
    });
}
rows.sort((left, right) => left.path.localeCompare(right.path));
console.log("Direct Canvas 2D ownership audit");
for (const row of rows) {
    console.log(`${row.reason ? "OK" : "UNAPPROVED"}\t${String(row.calls).padStart(4)}\t${row.path}${row.reason ? `\t${row.reason}` : ""}`);
}
const unapproved = rows.filter((row) => !row.reason);
if (unapproved.length) {
    console.error(`Renderer boundary audit failed: ${unapproved.length} unapproved direct Canvas owner${unapproved.length === 1 ? "" : "s"}.`);
    process.exitCode = 1;
} else {
    console.log(`PASS renderer boundary audit (${rows.length} approved owner files).`);
}
