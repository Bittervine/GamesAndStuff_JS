import {
    applyEditorLevelToWorld,
    applyEnemyDefinitionCatalog,
    createInitialGameState,
    createInputFrame
} from "../core/simulation.js";
import { createRenderer } from "../presentation/canvas-renderer.js";

const STORAGE_KEY = "ignatius_level_editor_v2";
const canvas = document.getElementById("stage");
const viewport = document.getElementById("viewport");
const levelSelect = document.getElementById("level");
const zoomInput = document.getElementById("zoom");
const fitButton = document.getElementById("fit");
const resetButton = document.getElementById("reset");
const readoutMain = document.getElementById("readout-main");
const readoutCamera = document.getElementById("readout-camera");
const loading = document.getElementById("loading");

const params = new URLSearchParams(location.search);
const requestedLevel = ["level_001", "level_002", "browser_copy"].includes(params.get("level"))
    ? params.get("level")
    : "level_002";
const initialZoom = clamp(Number(params.get("zoom")) || 0.55, 0.02, 5);
levelSelect.value = requestedLevel;
zoomInput.value = String(initialZoom);

let level = null;
let renderer = null;
let gameState = null;
let drag = null;
let camera = {
    x: Number(params.get("x")) || 0,
    y: Number(params.get("y")) || 0,
    zoom: initialZoom
};
let needsFit = !params.has("x") || !params.has("y");
let lastNow = performance.now();
let lastReadoutAt = -Infinity;
let cadenceSamples = [];
let worstCadence = 0;
let running = true;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
}

async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return response.json();
}

function loadBrowserCopy() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("No browser-saved Level Editor copy exists.");
    return JSON.parse(raw);
}

async function loadRequestedLevel() {
    return requestedLevel === "browser_copy"
        ? loadBrowserCopy()
        : fetchJson(`assets/${requestedLevel}.json`);
}

function enemyCharacterUrls(catalog) {
    return [...new Set(Object.values(catalog?.enemies || {})
        .map((definition) => {
            const configured = String(definition?.characterUrl || definition?.characterId || "").trim();
            if (!configured) return "";
            const withExtension = configured.endsWith(".json") ? configured : `${configured}.json`;
            return withExtension.startsWith("assets/") ? withExtension : `assets/${withExtension}`;
        })
        .filter(Boolean))];
}

function environmentManifestUrls(source) {
    return Array.isArray(source?.atlasRefs)
        ? source.atlasRefs.map((ref) => String(ref?.manifest || "")).filter(Boolean)
        : [];
}

function worldBounds() {
    const bounds = level?.world?.bounds || gameState?.world?.bounds || { x: 0, y: 0, w: 1280, h: 720 };
    return {
        x: Number(bounds.x) || 0,
        y: Number(bounds.y) || 0,
        w: Math.max(1, Number(bounds.w) || 1280),
        h: Math.max(1, Number(bounds.h) || 720)
    };
}

function canvasCssSize() {
    return {
        width: Math.max(1, viewport.clientWidth),
        height: Math.max(1, viewport.clientHeight)
    };
}

function fitLevel() {
    const bounds = worldBounds();
    const size = canvasCssSize();
    const margin = 36;
    camera.zoom = clamp(Math.min(
        (size.width - margin * 2) / bounds.w,
        (size.height - margin * 2) / bounds.h
    ), 0.02, 5);
    camera.x = bounds.x - margin / camera.zoom;
    camera.y = bounds.y - margin / camera.zoom;
    zoomInput.value = camera.zoom.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
    needsFit = false;
}

function screenToWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: camera.x + (clientX - rect.left) / camera.zoom,
        y: camera.y + (clientY - rect.top) / camera.zoom
    };
}

function applyViewOverride() {
    renderer?.setViewOverride({ x: camera.x, y: camera.y, cssZoom: camera.zoom });
}

function resetStats() {
    cadenceSamples = [];
    worstCadence = 0;
    lastNow = performance.now();
    lastReadoutAt = -Infinity;
}

function updateReadout(now) {
    if (now - lastReadoutAt < 200) return;
    lastReadoutAt = now;
    const diagnostics = renderer?.getPerformanceDiagnostics?.() || {};
    const averageCadence = cadenceSamples.length
        ? cadenceSamples.reduce((sum, value) => sum + value, 0) / cadenceSamples.length
        : 0;
    const fps = averageCadence > 0 ? 1000 / averageCadence : 0;
    readoutMain.textContent = [
        "Canvas2D game renderer",
        `cadence ${fps.toFixed(1)} fps (${averageCadence.toFixed(1)} ms, worst ${worstCadence.toFixed(1)})`,
        `submit ${Number(diagnostics.frameMs || 0).toFixed(1)} ms`,
        `avg submit ${Number(diagnostics.averageFrameMs || 0).toFixed(1)} ms`,
        `world ${Number(diagnostics.worldMs || 0).toFixed(1)}`,
        `actors ${Number(diagnostics.actorsMs || 0).toFixed(1)}`,
        `foreground ${Number(diagnostics.foregroundMs || 0).toFixed(1)}`,
        `mask ${Number(diagnostics.maskMs || 0).toFixed(1)}`,
        `visuals ${Number(diagnostics.visualsDrawn || 0)}/${Number(diagnostics.visualsConsidered || 0)}`
    ].join(" · ");
    readoutCamera.textContent = `x:${camera.x.toFixed(0)} y:${camera.y.toFixed(0)} zoom:${camera.zoom.toFixed(3)}`;
}

function frame(now) {
    if (!running) return;
    const interval = Math.max(0, now - lastNow);
    lastNow = now;
    if (interval < 5000) {
        cadenceSamples.push(interval);
        if (cadenceSamples.length > 60) cadenceSamples.shift();
        worstCadence = Math.max(worstCadence, interval);
    }

    const dt = clamp(interval / 1000, 0, 0.08) || 1 / 60;
    gameState.clock.time += dt;
    applyViewOverride();
    renderer.render(gameState, createInputFrame(), dt);
    updateReadout(now);
    requestAnimationFrame(frame);
}

async function start() {
    try {
        const [loadedLevel, enemyCatalog] = await Promise.all([
            loadRequestedLevel(),
            fetchJson("assets/ct_enemies_001.json")
        ]);
        level = loadedLevel;
        gameState = createInitialGameState();
        applyEnemyDefinitionCatalog(gameState, enemyCatalog);
        if (!applyEditorLevelToWorld(gameState, level)) {
            throw new Error("The selected level could not be converted to runtime world data.");
        }
        renderer = await createRenderer(canvas, {
            preferWebGL2: false,
            environmentAtlasManifestUrls: environmentManifestUrls(level),
            enemyCharacterUrls: enemyCharacterUrls(enemyCatalog),
            onProgress: ({ progress, label }) => {
                loading.textContent = `${label} · ${Math.round(clamp(progress, 0, 1) * 100)}%`;
            }
        });
        renderer.syncCaveWindow(gameState.world.caveWindow);
        renderer.syncEnvironmentColorMap(gameState.world.colorMap);
        if (needsFit) fitLevel();
        applyViewOverride();
        loading.hidden = true;
        resetStats();
        requestAnimationFrame(frame);
    } catch (error) {
        loading.textContent = `Baseline could not start: ${error.message}`;
        console.error(error);
    }
}

canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.button !== 1 && event.button !== 2) return;
    event.preventDefault();
    canvas.setPointerCapture?.(event.pointerId);
    drag = {
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        cameraX: camera.x,
        cameraY: camera.y
    };
    canvas.classList.add("dragging");
});

canvas.addEventListener("pointermove", (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    camera.x = drag.cameraX - (event.clientX - drag.clientX) / camera.zoom;
    camera.y = drag.cameraY - (event.clientY - drag.clientY) / camera.zoom;
});

function finishDrag(event) {
    if (!drag || (event?.pointerId !== undefined && event.pointerId !== drag.pointerId)) return;
    drag = null;
    canvas.classList.remove("dragging");
}

canvas.addEventListener("pointerup", finishDrag);
canvas.addEventListener("pointercancel", finishDrag);
canvas.addEventListener("contextmenu", (event) => event.preventDefault());

canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const before = screenToWorld(event.clientX, event.clientY);
    camera.zoom = clamp(camera.zoom * (event.deltaY < 0 ? 1.12 : 0.89), 0.02, 5);
    const after = screenToWorld(event.clientX, event.clientY);
    camera.x += before.x - after.x;
    camera.y += before.y - after.y;
    zoomInput.value = camera.zoom.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}, { passive: false });

zoomInput.addEventListener("change", () => {
    const size = canvasCssSize();
    const centerX = camera.x + size.width * 0.5 / camera.zoom;
    const centerY = camera.y + size.height * 0.5 / camera.zoom;
    camera.zoom = clamp(Number(zoomInput.value) || camera.zoom, 0.02, 5);
    camera.x = centerX - size.width * 0.5 / camera.zoom;
    camera.y = centerY - size.height * 0.5 / camera.zoom;
    zoomInput.value = String(camera.zoom);
});

fitButton.addEventListener("click", fitLevel);
resetButton.addEventListener("click", resetStats);
levelSelect.addEventListener("change", () => {
    const next = new URL(location.href);
    next.searchParams.set("level", levelSelect.value);
    next.searchParams.delete("x");
    next.searchParams.delete("y");
    location.href = next.href;
});
window.addEventListener("resize", () => {
    if (needsFit) fitLevel();
});
window.addEventListener("beforeunload", () => {
    running = false;
});

globalThis.__ignatiusCanvasBaseline = {
    get camera() { return { ...camera }; },
    get diagnostics() { return renderer?.getPerformanceDiagnostics?.() || null; },
    fitLevel,
    resetStats
};

start();
