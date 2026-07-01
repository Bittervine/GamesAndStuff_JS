#!/usr/bin/env python3
"""Benchmark Ignatius Rocketfrock WebGL2 hybrid vs Canvas 2D renderers.

The script drives the existing browser game through Playwright, loads level_002
through the browser-copy playtest path, seeds a paused boss-arena rocket
explosion scene, and samples the game's own debug render diagnostics.
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_NODE = Path(r"C:\Portable\NodeJS\node.exe")
DEFAULT_PLAYWRIGHT_DIR = Path(r"C:\Portable\Playwright")
DEFAULT_URL = "http://127.0.0.1:8000/IgnatiusRocketfrock_JS/game.html"
DEFAULT_LEVEL = PROJECT_ROOT / "assets" / "level_002.json"


def first_existing(paths: list[Path]) -> Path | None:
    for path in paths:
        if path.is_file():
            return path
    return None


def default_browser_exe() -> Path | None:
    configured = os.environ.get("ROCKETFROCK_BROWSER_EXE")
    if configured:
        return Path(configured)
    home = Path.home()
    return first_existing(
        [
            Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
            Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
            home / "AppData/Local/Google/Chrome/Application/chrome.exe",
            home / "AppData/Local/Programs/Opera/opera.exe",
            home / "AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe",
        ]
    )


RUNNER_JS = r"""
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const require = createRequire(CONFIG.playwrightPackageJson);
const { chromium } = require("playwright");
const config = JSON.parse(await readFile(CONFIG.configPath, "utf8"));
const level = await readFile(config.levelPath, "utf8");

function urlFor(webglValue) {
    const url = new URL(config.url);
    url.searchParams.set("playtest_browser_copy", "1");
    url.searchParams.set("webgl", webglValue);
    return url.href;
}

function parseDebug(text) {
    const render = /render:([^\s]+) avg:([\d.]+)ms last:([\d.]+)ms observed:([\d.]+)fps world:([\d.]+) actors:([\d.]+) foreground:([\d.]+) mask:([\d.]+) overlay:([\d.]+)/.exec(text || "");
    const gpu = /gpu draws:(\d+) quads:(\d+) uploads:(\d+) updates:(\d+) layers:(\d+) textures:(\d+)( CONTEXT-LOST)?/.exec(text || "");
    const visuals = /visuals considered:(\d+) drawn:(\d+) culled:(\d+) spatial:(\d+) dynamic considered:(\d+) drawn:(\d+) culled:(\d+) foreground-cache hit:(\d+) miss:(\d+) mask-cache:(hit|miss)/.exec(text || "");
    if (!render) return null;
    return {
        backend: render[1],
        avgMs: Number(render[2]),
        lastMs: Number(render[3]),
        observedFps: Number(render[4]),
        worldMs: Number(render[5]),
        actorsMs: Number(render[6]),
        foregroundMs: Number(render[7]),
        maskMs: Number(render[8]),
        overlayMs: Number(render[9]),
        gpuDraws: gpu ? Number(gpu[1]) : 0,
        gpuQuads: gpu ? Number(gpu[2]) : 0,
        gpuUploads: gpu ? Number(gpu[3]) : 0,
        gpuUpdates: gpu ? Number(gpu[4]) : 0,
        gpuLayers: gpu ? Number(gpu[5]) : 0,
        gpuTextures: gpu ? Number(gpu[6]) : 0,
        contextLost: Boolean(gpu?.[7]),
        visualsConsidered: visuals ? Number(visuals[1]) : 0,
        visualsDrawn: visuals ? Number(visuals[2]) : 0,
        visualsCulled: visuals ? Number(visuals[3]) : 0,
        dynamicDrawn: visuals ? Number(visuals[6]) : 0,
        maskCache: visuals ? visuals[10] : ""
    };
}

function mean(values) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function median(values) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function summarize(run) {
    const samples = run.samples;
    const raf = run.rafDeltas.filter((value) => value > 0 && value < 250);
    return {
        id: run.id,
        backend: samples.at(-1)?.backend || "unknown",
        medianLastMs: median(samples.map((sample) => sample.lastMs)),
        meanLastMs: mean(samples.map((sample) => sample.lastMs)),
        finalAvgMs: samples.at(-1)?.avgMs || 0,
        medianObservedFps: median(samples.map((sample) => sample.observedFps)),
        meanObservedFps: mean(samples.map((sample) => sample.observedFps)),
        meanRafFps: raf.length ? 1000 / mean(raf) : 0,
        worldMs: mean(samples.map((sample) => sample.worldMs)),
        actorsMs: mean(samples.map((sample) => sample.actorsMs)),
        foregroundMs: mean(samples.map((sample) => sample.foregroundMs)),
        maskMs: mean(samples.map((sample) => sample.maskMs)),
        overlayMs: mean(samples.map((sample) => sample.overlayMs)),
        gpuDraws: Math.round(mean(samples.map((sample) => sample.gpuDraws))),
        gpuQuads: Math.round(mean(samples.map((sample) => sample.gpuQuads))),
        gpuUpdates: Math.round(mean(samples.map((sample) => sample.gpuUpdates))),
        gpuLayers: Math.round(mean(samples.map((sample) => sample.gpuLayers))),
        gpuTextures: Math.round(mean(samples.map((sample) => sample.gpuTextures))),
        visualsDrawn: Math.round(mean(samples.map((sample) => sample.visualsDrawn))),
        visualsCulled: Math.round(mean(samples.map((sample) => sample.visualsCulled))),
        dynamicDrawn: Math.round(mean(samples.map((sample) => sample.dynamicDrawn))),
        maskCacheHitRate: samples.length ? samples.filter((sample) => sample.maskCache === "hit").length / samples.length : 0,
        contextLost: samples.some((sample) => sample.contextLost)
    };
}

function seedBossExplosionScene() {
    const state = window.getRocketfrockState?.();
    if (!state) return;
    state.story.portalIntro = null;
    state.story.portalExit = null;
    state.story.mailboxEvent = null;
    state.player.visible = true;
    Object.assign(state.player, {
        x: 17000,
        y: 900,
        spawnX: 17000,
        spawnY: 900,
        facing: 1,
        vx: 0,
        vy: 0,
        onGround: true,
        deathPhase: "none"
    });
    state.camera.x = 17000;
    state.camera.y = 650;
    const blastX = 17090;
    const blastY = 705;
    state.projectiles = [
        {
            id: "bench_rocket_explosion",
            owner: "player",
            isRocket: true,
            state: "exploding",
            x: blastX,
            y: blastY,
            vx: 0,
            vy: 0,
            facing: 1,
            age: 0.11,
            lifetime: 1.2,
            explosionTimer: 0.14,
            radius: 18,
            visualScale: 1.7,
            explosionVisualScale: 1.7,
            areaDamageRadius: 156,
            damage: 1,
            frameId: "rocket_projectile",
            characterId: "ct_char_wizard_1",
            trail: [
                { x: blastX - 120, y: blastY + 26, time: 0 },
                { x: blastX - 70, y: blastY + 12, time: 0.04 },
                { x: blastX - 28, y: blastY - 4, time: 0.08 }
            ]
        }
    ];
    state.effects = state.effects && typeof state.effects === "object"
        ? state.effects
        : { nextPuffId: 1, smokePuffs: [] };
    const puffs = [];
    for (let i = 0; i < 32; i += 1) {
        const u = i / 32;
        const angle = u * Math.PI * 2 + (i % 5) * 0.11;
        const distance = 18 + (i % 7) * 7;
        puffs.push({
            id: `bench_impact_puff_${i}`,
            kind: "rocketImpactSmokePuff",
            x: blastX + Math.cos(angle) * distance,
            y: blastY + Math.sin(angle) * distance,
            vx: Math.cos(angle) * (95 + (i % 4) * 18),
            vy: Math.sin(angle) * (70 + (i % 6) * 12) - 10,
            age: 0.22 + (i % 6) * 0.015,
            lifetime: 0.82 + (i % 5) * 0.035,
            radius: 9 + (i % 8),
            sparkleSeed: 1300 + i * 41,
            colorIndex: null
        });
    }
    state.effects.nextPuffId = 10000;
    state.effects.smokePuffs = [
        ...(Array.isArray(state.effects.smokePuffs)
            ? state.effects.smokePuffs.filter((puff) => !String(puff?.id || "").startsWith("bench_"))
            : []),
        ...puffs
    ];
    window.setRocketfrockState?.(state);
    window.__rocketfrockDev?.pause?.();
}

async function runOne(browser, testCase, measured, index) {
    const context = await browser.newContext({
        viewport: { width: config.viewportWidth, height: config.viewportHeight },
        deviceScaleFactor: config.dpr,
        colorScheme: "dark"
    });
    await context.addInitScript(({ level, settings }) => {
        localStorage.setItem("ignatius_level_editor_v2", level);
        localStorage.setItem("ignatius_rocketfrock_game_settings_v1", JSON.stringify(settings));
    }, { level, settings: config.settings });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    await page.goto(testCase.url, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForFunction(() => {
        const loading = document.querySelector("#loading-screen");
        const title = document.querySelector("#title-screen");
        return loading?.hidden === true && title && title.hidden === false;
    }, null, { timeout: 120000 });
    await page.keyboard.press("Space");
    await page.waitForFunction(() => document.body.classList.contains("game-running"), null, { timeout: 30000 });
    await page.evaluate(seedBossExplosionScene);
    await page.evaluate(() => {
        const debug = document.getElementById("debug");
        if (debug) debug.hidden = false;
        window.__benchRafDeltas = [];
        let last = performance.now();
        let active = true;
        window.__stopBenchRaf = () => { active = false; };
        requestAnimationFrame(function record(now) {
            if (!active) return;
            window.__benchRafDeltas.push(now - last);
            last = now;
            requestAnimationFrame(record);
        });
    });
    await page.waitForTimeout(measured ? config.settleMs : Math.max(1000, Math.floor(config.settleMs * 0.5)));
    const samples = [];
    const sampleCount = measured ? config.samples : Math.max(6, Math.floor(config.samples / 2));
    for (let i = 0; i < sampleCount; i += 1) {
        await page.waitForTimeout(config.sampleIntervalMs);
        const parsed = parseDebug(await page.locator("#debug").textContent());
        if (parsed) samples.push(parsed);
    }
    const rafDeltas = await page.evaluate(() => {
        window.__stopBenchRaf?.();
        return window.__benchRafDeltas || [];
    });
    await context.close();
    if (!samples.length) {
        throw new Error(`${testCase.id} run ${index} produced no debug samples. Console errors: ${consoleErrors.join(" | ")}`);
    }
    return { id: testCase.id, measured, index, samples, rafDeltas, consoleErrors };
}

const launchOptions = {
    headless: config.headless,
    args: [
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--disable-backgrounding-occluded-windows",
        "--disable-features=CalculateNativeWinOcclusion",
        "--autoplay-policy=no-user-gesture-required"
    ]
};
if (config.browserExe) {
    launchOptions.executablePath = config.browserExe;
}

const testCases = [
    { id: "webgl2", url: urlFor("1") },
    { id: "canvas2d", url: urlFor("0") }
];

console.log(`Browser: ${config.browserExe || "Playwright default Chromium"}`);
console.log(`Mode: ${config.headless ? "headless" : "headed"}; viewport ${config.viewportWidth}x${config.viewportHeight}; DPR ${config.dpr}`);
console.log(`Level: ${config.levelPath}`);
console.log("Scene: paused level_002 boss arena with seeded rocket explosion");

const browser = await chromium.launch(launchOptions);
try {
    const measuredRuns = [];
    for (const testCase of testCases) {
        for (let i = 1; i <= config.warmups; i += 1) {
            const run = await runOne(browser, testCase, false, i);
            console.log(`warmup ${testCase.id} #${i}: ${JSON.stringify(summarize(run))}`);
        }
        for (let i = 1; i <= config.runs; i += 1) {
            const run = await runOne(browser, testCase, true, i);
            measuredRuns.push(run);
            console.log(`measured ${testCase.id} #${i}: ${JSON.stringify(summarize(run))}`);
        }
    }
    const final = {};
    for (const testCase of testCases) {
        const runs = measuredRuns.filter((run) => run.id === testCase.id).map(summarize);
        final[testCase.id] = {
            runs: runs.length,
            backend: [...new Set(runs.map((run) => run.backend))].join(","),
            medianLastMs: median(runs.map((run) => run.medianLastMs)),
            meanLastMs: mean(runs.map((run) => run.meanLastMs)),
            finalAvgMs: mean(runs.map((run) => run.finalAvgMs)),
            medianObservedFps: median(runs.map((run) => run.medianObservedFps)),
            meanRafFps: mean(runs.map((run) => run.meanRafFps)),
            worldMs: mean(runs.map((run) => run.worldMs)),
            actorsMs: mean(runs.map((run) => run.actorsMs)),
            maskMs: mean(runs.map((run) => run.maskMs)),
            gpuUpdates: Math.round(mean(runs.map((run) => run.gpuUpdates))),
            gpuLayers: Math.round(mean(runs.map((run) => run.gpuLayers))),
            gpuTextures: Math.round(mean(runs.map((run) => run.gpuTextures))),
            visualsDrawn: Math.round(mean(runs.map((run) => run.visualsDrawn))),
            dynamicDrawn: Math.round(mean(runs.map((run) => run.dynamicDrawn))),
            contextLost: runs.some((run) => run.contextLost)
        };
    }
    console.log("\nFinal comparison");
    for (const [id, stats] of Object.entries(final)) {
        console.log(`${id.padEnd(8)} backend=${stats.backend.padEnd(13)} median=${stats.medianLastMs.toFixed(2)}ms avg=${stats.meanLastMs.toFixed(2)}ms observed=${stats.medianObservedFps.toFixed(1)}fps raf=${stats.meanRafFps.toFixed(1)}fps gpuUpdates=${stats.gpuUpdates} dynamicDrawn=${stats.dynamicDrawn}`);
    }
    const webgl = final.webgl2;
    const canvas = final.canvas2d;
    if (webgl && canvas && canvas.medianLastMs > 0) {
        const delta = ((webgl.medianLastMs - canvas.medianLastMs) / canvas.medianLastMs) * 100;
        console.log(`WebGL2 median render time is ${Math.abs(delta).toFixed(1)}% ${delta >= 0 ? "slower" : "faster"} than Canvas 2D in this run.`);
    }
} finally {
    await browser.close();
}
"""


def write_runner(config_path: Path, playwright_dir: Path) -> Path:
    runner = RUNNER_JS.replace(
        "CONFIG.playwrightPackageJson",
        json.dumps(str(playwright_dir / "package.json")),
    ).replace(
        "CONFIG.configPath",
        json.dumps(str(config_path)),
    )
    handle = tempfile.NamedTemporaryFile("w", suffix=".mjs", delete=False, encoding="utf-8")
    with handle:
        handle.write(runner)
    return Path(handle.name)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Compare Ignatius Rocketfrock WebGL2 hybrid and Canvas 2D renderer diagnostics."
    )
    parser.add_argument("--url", default=DEFAULT_URL, help="game.html URL served by the local web server")
    parser.add_argument("--level", default=str(DEFAULT_LEVEL), help="level JSON to load through playtest_browser_copy")
    parser.add_argument("--runs", type=int, default=5, help="measured runs per renderer")
    parser.add_argument("--warmups", type=int, default=2, help="warmup runs per renderer")
    parser.add_argument("--samples", type=int, default=30, help="debug samples per measured run")
    parser.add_argument("--sample-interval-ms", type=int, default=200, help="delay between debug samples")
    parser.add_argument("--settle-ms", type=int, default=3500, help="settle time before measured sampling")
    parser.add_argument("--viewport", default="1280x720", help="browser viewport, such as 1280x720")
    parser.add_argument("--dpr", type=float, default=1.0, help="device pixel ratio")
    parser.add_argument("--node", default=str(DEFAULT_NODE), help="Node executable")
    parser.add_argument("--playwright-dir", default=str(DEFAULT_PLAYWRIGHT_DIR), help="directory containing Playwright package.json")
    parser.add_argument("--browser-exe", default=str(default_browser_exe() or ""), help="Chrome/Opera/Chromium executable; empty uses Playwright default")
    parser.add_argument("--headed", action="store_true", help="show the browser window; closer to manual browser testing")
    return parser.parse_args()


def viewport_parts(value: str) -> tuple[int, int]:
    try:
        width_text, height_text = value.lower().split("x", 1)
        width = max(1, int(width_text))
        height = max(1, int(height_text))
        return width, height
    except Exception as error:
        raise SystemExit(f"Invalid --viewport {value!r}; expected WIDTHxHEIGHT") from error


def main() -> int:
    args = parse_args()
    node = Path(args.node)
    playwright_dir = Path(args.playwright_dir)
    level = Path(args.level)
    browser_exe = Path(args.browser_exe) if args.browser_exe else None
    width, height = viewport_parts(args.viewport)

    if not node.is_file():
        raise SystemExit(f"Node executable not found: {node}")
    if not (playwright_dir / "package.json").is_file():
        raise SystemExit(f"Playwright package.json not found: {playwright_dir / 'package.json'}")
    if not level.is_file():
        raise SystemExit(f"Level file not found: {level}")
    if browser_exe and not browser_exe.is_file():
        raise SystemExit(f"Browser executable not found: {browser_exe}")

    config = {
        "url": args.url,
        "levelPath": str(level),
        "browserExe": str(browser_exe) if browser_exe else "",
        "headless": not args.headed,
        "viewportWidth": width,
        "viewportHeight": height,
        "dpr": args.dpr,
        "runs": max(1, args.runs),
        "warmups": max(0, args.warmups),
        "samples": max(1, args.samples),
        "sampleIntervalMs": max(16, args.sample_interval_ms),
        "settleMs": max(0, args.settle_ms),
        "settings": {
            "version": 4,
            "sfxVolume": 0,
            "musicVolume": 0,
            "difficulty": "normal",
            "renderingQuality": "medium",
            "autoFullscreen": False,
            "showMinimap": True,
        },
    }

    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as handle:
        json.dump(config, handle)
        config_path = Path(handle.name)
    runner_path = write_runner(config_path, playwright_dir)
    try:
        completed = subprocess.run(
            [str(node), str(runner_path)],
            cwd=str(playwright_dir),
            text=True,
            check=False,
        )
        return completed.returncode
    finally:
        for path in (runner_path, config_path):
            try:
                path.unlink()
            except OSError:
                pass


if __name__ == "__main__":
    sys.exit(main())
