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
const level = config.syntheticLive ? "" : await readFile(config.levelPath, "utf8");

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

const SYNTHETIC_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Rocketfrock Synthetic GPU Sprite Bench</title>
<style>
html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #06060c; color: #f2edf8; font-family: system-ui, sans-serif; }
canvas { position: fixed; inset: 0; width: 100vw; height: 100vh; display: block; }
#panel { position: fixed; left: 12px; top: 12px; z-index: 10; width: min(520px, calc(100vw - 24px)); padding: 12px; border: 1px solid rgba(201,167,255,0.3); border-radius: 8px; background: rgba(18, 14, 26, 0.88); box-shadow: 0 18px 50px rgba(0,0,0,0.38); }
#controls { display: grid; grid-template-columns: auto 1fr auto; gap: 8px; align-items: center; margin-bottom: 8px; }
#controls select, #controls input { min-width: 0; }
#debug { margin: 0; white-space: pre-wrap; font: 12px/1.35 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
</style>
</head>
<body>
<canvas id="glstage"></canvas>
<canvas id="c2dstage"></canvas>
<div id="panel">
  <div id="controls">
    <label for="mode">mode</label>
    <select id="mode">
      <option value="webgl-cached">WebGL cached sprites</option>
      <option value="webgl-upload">WebGL full-canvas upload</option>
      <option value="canvas2d">Canvas2D sprites</option>
    </select>
    <button id="reset" type="button">reset stats</button>
    <label for="sprites">sprites</label>
    <input id="sprites" type="range" min="100" max="12000" step="100" value="2000">
    <output id="spriteValue">2000</output>
  </div>
  <pre id="debug">starting...</pre>
</div>
<script>
(() => {
  const initialMode = "__SYNTHETIC_MODE__";
  const initialSprites = __SYNTHETIC_SPRITES__;
  const glCanvas = document.getElementById("glstage");
  const canvas2d = document.getElementById("c2dstage");
  const modeEl = document.getElementById("mode");
  const spriteEl = document.getElementById("sprites");
  const spriteValue = document.getElementById("spriteValue");
  const debug = document.getElementById("debug");
  modeEl.value = initialMode;
  spriteEl.value = String(initialSprites);
  spriteValue.value = String(initialSprites);

  const gl = glCanvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
    desynchronized: true
  });
  const ctx = canvas2d.getContext("2d", { alpha: false, desynchronized: true });
  const layer = document.createElement("canvas");
  const layerCtx = layer.getContext("2d", { alpha: true, desynchronized: true });
  const stamp = document.createElement("canvas");
  stamp.width = 64;
  stamp.height = 64;
  const stampCtx = stamp.getContext("2d");
  const g = stampCtx.createRadialGradient(32, 32, 1, 32, 32, 32);
  g.addColorStop(0, "rgba(255,245,190,0.95)");
  g.addColorStop(0.22, "rgba(255,170,74,0.72)");
  g.addColorStop(0.58, "rgba(172,136,190,0.34)");
  g.addColorStop(1, "rgba(30,24,40,0)");
  stampCtx.fillStyle = g;
  stampCtx.fillRect(0, 0, 64, 64);

  function shader(type, source) {
    const item = gl.createShader(type);
    gl.shaderSource(item, source);
    gl.compileShader(item);
    if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(item));
    return item;
  }
  function program(vs, fs) {
    const item = gl.createProgram();
    gl.attachShader(item, shader(gl.VERTEX_SHADER, vs));
    gl.attachShader(item, shader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(item);
    if (!gl.getProgramParameter(item, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(item));
    return item;
  }

  let programInfo = null;
  let smokeTexture = null;
  let layerTexture = null;
  let buffer = null;
  let vertexData = new Float32Array(0);
  let sprites = [];
  let samples = [];
  let lastNow = performance.now();
  let frame = 0;
  let textureUploads = 0;
  let textureUpdates = 0;
  let lastUploadBytes = 0;

  if (gl) {
    const prog = program(
      "#version 300 es\\nprecision highp float; in vec2 a_position; in vec2 a_uv; in vec4 a_color; uniform vec2 u_resolution; out vec2 v_uv; out vec4 v_color; void main(){ vec2 clip=vec2(a_position.x/u_resolution.x*2.0-1.0, 1.0-a_position.y/u_resolution.y*2.0); gl_Position=vec4(clip,0.0,1.0); v_uv=a_uv; v_color=a_color; }",
      "#version 300 es\\nprecision mediump float; uniform sampler2D u_texture; in vec2 v_uv; in vec4 v_color; out vec4 outColor; void main(){ vec4 texel=texture(u_texture,v_uv); outColor=vec4(texel.rgb*v_color.rgb*v_color.a, texel.a*v_color.a); }"
    );
    programInfo = {
      program: prog,
      position: gl.getAttribLocation(prog, "a_position"),
      uv: gl.getAttribLocation(prog, "a_uv"),
      color: gl.getAttribLocation(prog, "a_color"),
      resolution: gl.getUniformLocation(prog, "u_resolution"),
      texture: gl.getUniformLocation(prog, "u_texture")
    };
    buffer = gl.createBuffer();
    smokeTexture = createTexture(stamp);
    layerTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, layerTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  function createTexture(source) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.bindTexture(gl.TEXTURE_2D, null);
    textureUploads += 1;
    return texture;
  }

  function resize() {
    const dpr = Math.max(1, Math.min(2, devicePixelRatio || 1));
    const width = Math.max(1, Math.floor(innerWidth * dpr));
    const height = Math.max(1, Math.floor(innerHeight * dpr));
    for (const c of [glCanvas, canvas2d, layer]) {
      if (c.width !== width || c.height !== height) {
        c.width = width;
        c.height = height;
      }
    }
  }

  function rebuildSprites() {
    const count = Math.max(1, Number(spriteEl.value) || 1);
    spriteValue.value = String(count);
    sprites = Array.from({ length: count }, (_, i) => ({
      x: (i * 97) % Math.max(1, glCanvas.width),
      y: (i * 53) % Math.max(1, glCanvas.height),
      vx: ((i % 17) - 8) * 0.23,
      vy: (((i * 3) % 19) - 9) * 0.18,
      size: 18 + (i % 11) * 2.8,
      phase: i * 0.37
    }));
    vertexData = new Float32Array(count * 6 * 8);
  }

  function writeVertex(offset, x, y, u, v, r, g, b, a) {
    vertexData[offset] = x;
    vertexData[offset + 1] = y;
    vertexData[offset + 2] = u;
    vertexData[offset + 3] = v;
    vertexData[offset + 4] = r;
    vertexData[offset + 5] = g;
    vertexData[offset + 6] = b;
    vertexData[offset + 7] = a;
  }

  function updateSprites(dt) {
    const w = Math.max(1, glCanvas.width);
    const h = Math.max(1, glCanvas.height);
    for (const sprite of sprites) {
      sprite.x += sprite.vx * dt;
      sprite.y += sprite.vy * dt;
      if (sprite.x < -80) sprite.x += w + 160;
      if (sprite.x > w + 80) sprite.x -= w + 160;
      if (sprite.y < -80) sprite.y += h + 160;
      if (sprite.y > h + 80) sprite.y -= h + 160;
    }
  }

  function setupGlFrame() {
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(6 / 255, 6 / 255, 12 / 255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(programInfo.program);
    gl.uniform2f(programInfo.resolution, glCanvas.width, glCanvas.height);
    gl.uniform1i(programInfo.texture, 0);
  }

  function drawWebglCached() {
    setupGlFrame();
    let offset = 0;
    for (let i = 0; i < sprites.length; i += 1) {
      const sprite = sprites[i];
      const pulse = 0.72 + Math.sin(frame * 0.025 + sprite.phase) * 0.22;
      const half = sprite.size * pulse;
      const x0 = sprite.x - half;
      const y0 = sprite.y - half;
      const x1 = sprite.x + half;
      const y1 = sprite.y + half;
      const r = 1;
      const g = 0.62 + (i % 5) * 0.055;
      const b = 0.32 + (i % 7) * 0.035;
      const a = 0.34;
      writeVertex(offset, x0, y0, 0, 1, r, g, b, a); offset += 8;
      writeVertex(offset, x1, y0, 1, 1, r, g, b, a); offset += 8;
      writeVertex(offset, x1, y1, 1, 0, r, g, b, a); offset += 8;
      writeVertex(offset, x0, y0, 0, 1, r, g, b, a); offset += 8;
      writeVertex(offset, x1, y1, 1, 0, r, g, b, a); offset += 8;
      writeVertex(offset, x0, y1, 0, 0, r, g, b, a); offset += 8;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData.subarray(0, offset), gl.DYNAMIC_DRAW);
    const stride = 8 * 4;
    gl.enableVertexAttribArray(programInfo.position);
    gl.vertexAttribPointer(programInfo.position, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(programInfo.uv);
    gl.vertexAttribPointer(programInfo.uv, 2, gl.FLOAT, false, stride, 2 * 4);
    gl.enableVertexAttribArray(programInfo.color);
    gl.vertexAttribPointer(programInfo.color, 4, gl.FLOAT, false, stride, 4 * 4);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, smokeTexture);
    gl.drawArrays(gl.TRIANGLES, 0, offset / 8);
    return { drawCalls: 1, quads: sprites.length, textureUpdates: 0 };
  }

  function drawFullScreenLayer() {
    const w = glCanvas.width;
    const h = glCanvas.height;
    const data = new Float32Array([
      0, 0, 0, 1, 1, 1, 1, 1,  w, 0, 1, 1, 1, 1, 1, 1,  w, h, 1, 0, 1, 1, 1, 1,
      0, 0, 0, 1, 1, 1, 1, 1,  w, h, 1, 0, 1, 1, 1, 1,  0, h, 0, 0, 1, 1, 1, 1
    ]);
    setupGlFrame();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    const stride = 8 * 4;
    gl.enableVertexAttribArray(programInfo.position);
    gl.vertexAttribPointer(programInfo.position, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(programInfo.uv);
    gl.vertexAttribPointer(programInfo.uv, 2, gl.FLOAT, false, stride, 2 * 4);
    gl.enableVertexAttribArray(programInfo.color);
    gl.vertexAttribPointer(programInfo.color, 4, gl.FLOAT, false, stride, 4 * 4);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, layerTexture);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function drawWebglUpload() {
    layerCtx.setTransform(1, 0, 0, 1, 0, 0);
    layerCtx.clearRect(0, 0, layer.width, layer.height);
    layerCtx.globalCompositeOperation = "source-over";
    for (let i = 0; i < sprites.length; i += 1) {
      const sprite = sprites[i];
      const pulse = 0.72 + Math.sin(frame * 0.025 + sprite.phase) * 0.22;
      const size = sprite.size * pulse * 2;
      layerCtx.globalAlpha = 0.34;
      layerCtx.drawImage(stamp, sprite.x - size * 0.5, sprite.y - size * 0.5, size, size);
    }
    gl.bindTexture(gl.TEXTURE_2D, layerTexture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    if (frame === 0 || drawWebglUpload.lastWidth !== layer.width || drawWebglUpload.lastHeight !== layer.height) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, layer);
      textureUploads += 1;
      drawWebglUpload.lastWidth = layer.width;
      drawWebglUpload.lastHeight = layer.height;
    } else {
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, layer);
      textureUpdates += 1;
    }
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    lastUploadBytes = layer.width * layer.height * 4;
    drawFullScreenLayer();
    return { drawCalls: 1, quads: 1, textureUpdates: 1 };
  }

  function drawCanvas2d() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "rgb(6,6,12)";
    ctx.fillRect(0, 0, canvas2d.width, canvas2d.height);
    ctx.globalCompositeOperation = "source-over";
    for (let i = 0; i < sprites.length; i += 1) {
      const sprite = sprites[i];
      const pulse = 0.72 + Math.sin(frame * 0.025 + sprite.phase) * 0.22;
      const size = sprite.size * pulse * 2;
      ctx.globalAlpha = 0.34;
      ctx.drawImage(stamp, sprite.x - size * 0.5, sprite.y - size * 0.5, size, size);
    }
    return { drawCalls: sprites.length, quads: sprites.length, textureUpdates: 0 };
  }

  function draw(now) {
    resize();
    if (!sprites.length || sprites.length !== Number(spriteEl.value)) rebuildSprites();
    const dt = Math.min(64, now - lastNow);
    lastNow = now;
    updateSprites(dt);
    const mode = modeEl.value;
    glCanvas.hidden = mode === "canvas2d";
    canvas2d.hidden = mode !== "canvas2d";
    const start = performance.now();
    let diag = { drawCalls: 0, quads: 0, textureUpdates: 0 };
    if (!gl && mode !== "canvas2d") {
      debug.textContent = "WebGL2 unavailable in this browser.";
      requestAnimationFrame(draw);
      return;
    }
    if (mode === "webgl-cached") diag = drawWebglCached();
    else if (mode === "webgl-upload") diag = drawWebglUpload();
    else diag = drawCanvas2d();
    const frameMs = performance.now() - start;
    samples.push({ frameMs, rafMs: dt });
    if (samples.length > 180) samples.shift();
    const sorted = samples.map(s => s.frameMs).sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] || 0;
    const avg = samples.reduce((sum, s) => sum + s.frameMs, 0) / samples.length;
    const rafAvg = samples.reduce((sum, s) => sum + s.rafMs, 0) / samples.length;
    const fps = rafAvg > 0 ? 1000 / rafAvg : 0;
    const uploadMb = mode === "webgl-upload" ? (lastUploadBytes * fps / 1048576) : 0;
    debug.textContent =
      "mode: " + mode + "\\n" +
      "sprites: " + sprites.length + "\\n" +
      "fps: " + fps.toFixed(1) + "\\n" +
      "frame median: " + median.toFixed(3) + " ms\\n" +
      "frame avg: " + avg.toFixed(3) + " ms\\n" +
      "last frame: " + frameMs.toFixed(3) + " ms\\n" +
      "draw calls: " + diag.drawCalls + "\\n" +
      "quads: " + diag.quads + "\\n" +
      "texture uploads total: " + textureUploads + "\\n" +
      "texture updates total: " + textureUpdates + "\\n" +
      "estimated upload bandwidth: " + uploadMb.toFixed(1) + " MB/s";
    frame += 1;
    requestAnimationFrame(draw);
  }

  spriteEl.addEventListener("input", rebuildSprites);
  modeEl.addEventListener("change", () => { samples = []; frame = 0; textureUpdates = 0; lastUploadBytes = 0; });
  document.getElementById("reset").addEventListener("click", () => { samples = []; textureUploads = 0; textureUpdates = 0; });
  addEventListener("resize", () => { resize(); rebuildSprites(); });
  resize();
  rebuildSprites();
  requestAnimationFrame(draw);
})();
</script>
</body>
</html>`;

async function runSyntheticLive(browser) {
    const context = await browser.newContext({
        viewport: { width: config.viewportWidth, height: config.viewportHeight },
        deviceScaleFactor: config.dpr,
        colorScheme: "dark"
    });
    const page = await context.newPage();
    const html = SYNTHETIC_HTML
        .replace("__SYNTHETIC_MODE__", config.syntheticMode)
        .replace("__SYNTHETIC_SPRITES__", String(config.syntheticSprites));
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    console.log("Synthetic live sprite benchmark is running.");
    console.log("Use the on-page mode dropdown to compare cached GPU sprites, full-canvas uploads, and Canvas2D.");
    if (config.syntheticSeconds > 0) {
        await page.waitForTimeout(config.syntheticSeconds * 1000);
        console.log(await page.locator("#debug").textContent());
    } else {
        console.log("Close the browser tab/window or press Ctrl+C to stop.");
        await page.waitForEvent("close", { timeout: 0 });
    }
    await context.close();
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
    if (config.syntheticLive) {
        await runSyntheticLive(browser);
    } else {
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
    parser.add_argument("--synthetic-live", action="store_true", help="open a live sprite-only GPU/Canvas benchmark page")
    parser.add_argument("--synthetic-mode", choices=["webgl-cached", "webgl-upload", "canvas2d"], default="webgl-cached", help="initial live synthetic benchmark mode")
    parser.add_argument("--synthetic-sprites", type=int, default=2000, help="initial sprite count for the synthetic live benchmark")
    parser.add_argument("--synthetic-seconds", type=float, default=0, help="auto-close synthetic benchmark after N seconds; 0 keeps it open")
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
        "headless": (not args.headed) and not (args.synthetic_live and args.synthetic_seconds <= 0),
        "viewportWidth": width,
        "viewportHeight": height,
        "dpr": args.dpr,
        "syntheticLive": bool(args.synthetic_live),
        "syntheticMode": args.synthetic_mode,
        "syntheticSprites": max(1, args.synthetic_sprites),
        "syntheticSeconds": max(0, args.synthetic_seconds),
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
