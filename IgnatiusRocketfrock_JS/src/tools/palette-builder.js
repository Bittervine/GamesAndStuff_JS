import {
    animationPoseToRuntimeTransforms,
    applyRuntimeProjectileHandoffVisibility,
    buildRuntimeCharacterDrawCommands,
    loadRuntimeCharacterProject,
    resolveRuntimeAnimationSlot,
    sampleRuntimeCharacterPose
} from "../presentation/character-runtime.js";
import { scaledEnemyRenderScale } from "../shared/enemy-scale-data.js";
import { sha256Hex } from "./resource-hash.js";

const BUILDER_VERSION = 2;
const BUILDER_ID = "browser-html-js";
const DEFAULT_CELL_SIZE = 64;
const DEFAULT_MAX_SIZE = 8192;
const DEFAULT_PADDING_RATIO = 0.08;
const RESOURCE_INDEX = "resources.json";
const ENTITY_CATALOG = "items/it_entities_001.json";
const ENEMY_CATALOG = "characters/ct_enemies_001.json";
const OUTPUT_IMAGE_NAME = "thumbnails.png";
const OUTPUT_JSON_NAME = "thumbnails.json";
const REFERENCE_BASE_URL = new URL("../../", import.meta.url);
const RESOURCE_BASE_URL = new URL("../../resources/", import.meta.url);

const ui = {
    cellSize: document.getElementById("cell-size"),
    maxSize: document.getElementById("max-size"),
    chooseFolderButton: document.getElementById("choose-folder"),
    clearFolderButton: document.getElementById("clear-folder"),
    outputFolder: document.getElementById("output-folder"),
    buildButton: document.getElementById("build-button"),
    verifyButton: document.getElementById("verify-button"),
    status: document.getElementById("status"),
    progressBar: document.getElementById("progress-bar"),
    summary: document.getElementById("summary"),
    previewCanvas: document.getElementById("preview-canvas"),
    downloadImage: document.getElementById("download-image"),
    downloadJson: document.getElementById("download-json"),
    log: document.getElementById("log")
};

const projectHost = window.IgnatiusProjectHost?.get();
let latestBuild = null;
let busy = false;

class ResourceCache {
    constructor() {
        this.referenceBytesCache = new Map();
        this.resourceBytesCache = new Map();
        this.referenceJsonCache = new Map();
        this.resourceJsonCache = new Map();
        this.resourceImageCache = new Map();
        this.sourceHashes = new Map();
    }

    async referenceBytes(path) {
        const key = String(path);
        if (!this.referenceBytesCache.has(key)) {
            this.referenceBytesCache.set(key, this.#fetchBytes(new URL(key, REFERENCE_BASE_URL), key));
        }
        return this.referenceBytesCache.get(key);
    }

    async resourceBytes(path) {
        const key = String(path).replace(/^resources\//, "");
        if (!this.resourceBytesCache.has(key)) {
            this.resourceBytesCache.set(key, this.#fetchResourceBytes(key));
        }
        return this.resourceBytesCache.get(key);
    }

    async referenceJson(path) {
        const key = String(path);
        if (!this.referenceJsonCache.has(key)) {
            this.referenceJsonCache.set(key, this.referenceBytes(key).then((bytes) => JSON.parse(new TextDecoder().decode(bytes))));
        }
        return this.referenceJsonCache.get(key);
    }

    async resourceJson(path) {
        const key = String(path);
        if (!this.resourceJsonCache.has(key)) {
            this.resourceJsonCache.set(key, this.resourceBytes(key).then((bytes) => JSON.parse(new TextDecoder().decode(bytes))));
        }
        return this.resourceJsonCache.get(key);
    }

    async resourceImage(path) {
        const key = String(path);
        if (!this.resourceImageCache.has(key)) {
            this.resourceImageCache.set(key, this.resourceBytes(key).then((bytes) => createImageSourceFromBytes(bytes)));
        }
        return this.resourceImageCache.get(key);
    }

    async #fetchBytes(url, sourceKey) {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to load ${sourceKey}: ${response.status} ${response.statusText}`);
        const bytes = await response.arrayBuffer();
        const digest = await sha256Hex(bytes);
        this.sourceHashes.set(sourceKey, digest);
        return bytes;
    }

    async #fetchResourceBytes(sourceKey) {
        if (projectHost) {
            const blob = await projectHost.readResourceBlob(sourceKey, { prompt: false });
            if (blob !== null) {
                const bytes = await blob.arrayBuffer();
                const digest = await sha256Hex(bytes);
                this.sourceHashes.set(sourceKey, digest);
                return bytes;
            }
        }
        return this.#fetchBytes(new URL(sourceKey, RESOURCE_BASE_URL), sourceKey);
    }

    async sourceRecords(paths) {
        const normalized = [...new Set([...paths].map((value) => String(value)).filter(Boolean))].sort();
        const records = [];
        for (const path of normalized) {
            if (!this.sourceHashes.has(path)) {
                if (isResourceRelativePath(path)) await this.resourceBytes(path);
                else await this.referenceBytes(path);
            }
            records.push({ path, sha256: this.sourceHashes.get(path) || "" });
        }
        return records;
    }
}

function setBusy(nextBusy) {
    busy = Boolean(nextBusy);
    ui.buildButton.disabled = busy;
    ui.verifyButton.disabled = busy;
    ui.chooseFolderButton.disabled = busy || !projectHost || projectHost.mode === "native" || !("showDirectoryPicker" in window);
    ui.clearFolderButton.disabled = busy || projectHost?.mode === "native";
}

function setStatus(message, tone = "info") {
    ui.status.textContent = message;
    ui.status.className = `status ${tone}`;
}

function setProgress(completed, total) {
    const safeTotal = Math.max(1, Number(total) || 1);
    const percent = Math.max(0, Math.min(100, (Math.max(0, Number(completed) || 0) / safeTotal) * 100));
    ui.progressBar.style.width = `${percent.toFixed(1)}%`;
}

function appendLog(message = "") {
    ui.log.value += `${message}\n`;
    ui.log.scrollTop = ui.log.scrollHeight;
}

function clearLog() {
    ui.log.value = "";
}

function clearSummary() {
    ui.summary.innerHTML = "";
}

function renderSummary(metrics) {
    ui.summary.innerHTML = "";
    const entries = [
        ["Assets", metrics.assetCount],
        ["Entities", metrics.entityCount],
        ["Enemies", metrics.enemyCount],
        ["Entries", metrics.entryCount],
        ["Sheet", `${metrics.width} × ${metrics.height}`],
        ["Cell", `${metrics.cellSize}px`]
    ];
    for (const [label, value] of entries) {
        const box = document.createElement("div");
        box.className = "metric";
        box.innerHTML = `<span class="muted">${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong>`;
        ui.summary.appendChild(box);
    }
}

function updateOutputFolderLabel() {
    ui.outputFolder.value = projectHost?.connected ? `${projectHost.displayName}/palette` : "(not connected)";
}

function isResourceRelativePath(path) {
    const normalized = String(path || "").replace(/^resources\//, "");
    if (normalized === RESOURCE_INDEX) return true;
    return ["atlases/", "characters/", "config/", "editor/", "fonts/", "generator/", "items/", "levels/", "music/", "palette/", "sfx/", "ui/"].some((prefix) => normalized.startsWith(prefix));
}

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function cloneCanvas(sourceCanvas) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, sourceCanvas.width || 1);
    canvas.height = Math.max(1, sourceCanvas.height || 1);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(sourceCanvas, 0, 0);
    return canvas;
}

function nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function canvasToPngBlob(canvas) {
    if (typeof canvas.toBlob === "function") {
        return await new Promise((resolve, reject) => {
            canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not encode thumbnails.png.")), "image/png");
        });
    }
    if (typeof canvas.toBuffer === "function") {
        const buffer = await canvas.toBuffer("png");
        return new Blob([buffer], { type: "image/png" });
    }
    throw new Error("This browser cannot encode PNG output.");
}

async function createImageSourceFromBytes(bytes) {
    const blob = new Blob([bytes], { type: "image/png" });
    if ("createImageBitmap" in window) {
        return await createImageBitmap(blob);
    }
    return await new Promise((resolve, reject) => {
        const image = new Image();
        const url = URL.createObjectURL(blob);
        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to decode image."));
        };
        image.src = url;
    });
}

function createCanvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.ceil(width));
    canvas.height = Math.max(1, Math.ceil(height));
    return canvas;
}

function safeNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function placeholderThumbnail(text, size = 256, outline = true) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");
    const margin = Math.max(8, Math.floor(size / 12));
    const cyan = "rgba(86,230,255,0.88)";
    const fill = "rgba(86,230,255,0.12)";
    if (outline) {
        const radius = Math.max(4, Math.floor(size / 14));
        roundRectPath(ctx, margin, margin, size - margin * 2, size - margin * 2, radius);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.lineWidth = Math.max(2, Math.floor(size / 64));
        ctx.strokeStyle = cyan;
        ctx.stroke();
    }
    const label = String(text).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) || "?";
    const fontSize = Math.max(14, Math.floor(size / 5));
    ctx.fillStyle = cyan;
    ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, size / 2, size / 2);
    return canvas;
}

function roundRectPath(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
}

function alphaBounds(source, sx = 0, sy = 0, sw = null, sh = null) {
    const width = Math.max(1, Number(source?.width || source?.naturalWidth) || 1);
    const height = Math.max(1, Number(source?.height || source?.naturalHeight) || 1);
    const x = Math.max(0, Math.min(width - 1, Math.floor(sx || 0)));
    const y = Math.max(0, Math.min(height - 1, Math.floor(sy || 0)));
    const sampleWidth = Math.max(1, Math.min(width - x, Math.floor(sw || width)));
    const sampleHeight = Math.max(1, Math.min(height - y, Math.floor(sh || height)));
    const downscale = Math.min(1, 256 / sampleWidth, 256 / sampleHeight);
    const probeWidth = Math.max(1, Math.ceil(sampleWidth * downscale));
    const probeHeight = Math.max(1, Math.ceil(sampleHeight * downscale));
    const probe = createCanvas(probeWidth, probeHeight);
    const ctx = probe.getContext("2d", { willReadFrequently: true });
    ctx.clearRect(0, 0, probeWidth, probeHeight);
    ctx.drawImage(source, x, y, sampleWidth, sampleHeight, 0, 0, probeWidth, probeHeight);
    const pixels = ctx.getImageData(0, 0, probeWidth, probeHeight).data;
    let minX = probeWidth;
    let minY = probeHeight;
    let maxX = -1;
    let maxY = -1;
    for (let py = 0; py < probeHeight; py += 1) {
        for (let px = 0; px < probeWidth; px += 1) {
            if (pixels[(py * probeWidth + px) * 4 + 3] <= 4) continue;
            minX = Math.min(minX, px);
            minY = Math.min(minY, py);
            maxX = Math.max(maxX, px);
            maxY = Math.max(maxY, py);
        }
    }
    if (maxX < minX || maxY < minY) return null;
    minX = Math.max(0, minX - 1);
    minY = Math.max(0, minY - 1);
    maxX = Math.min(probeWidth - 1, maxX + 1);
    maxY = Math.min(probeHeight - 1, maxY + 1);
    const localX = minX / downscale;
    const localY = minY / downscale;
    const localRight = Math.min(sampleWidth, (maxX + 1) / downscale);
    const localBottom = Math.min(sampleHeight, (maxY + 1) / downscale);
    return { x: x + localX, y: y + localY, w: Math.max(1, localRight - localX), h: Math.max(1, localBottom - localY) };
}

function cropVisibleToCanvas(source, bounds = null) {
    const visible = bounds || alphaBounds(source);
    if (!visible) return null;
    const canvas = createCanvas(visible.w, visible.h);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(source, visible.x, visible.y, visible.w, visible.h, 0, 0, visible.w, visible.h);
    return canvas;
}

function fitIntoCell(source, cellSize) {
    const cell = createCanvas(cellSize, cellSize);
    const ctx = cell.getContext("2d");
    const visibleBounds = alphaBounds(source);
    if (!visibleBounds) return cell;
    const padding = Math.max(2, Math.round(cellSize * DEFAULT_PADDING_RATIO));
    const available = Math.max(1, cellSize - padding * 2);
    const scale = Math.min(available / visibleBounds.w, available / visibleBounds.h);
    const width = Math.max(1, Math.round(visibleBounds.w * scale));
    const height = Math.max(1, Math.round(visibleBounds.h * scale));
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
        source,
        visibleBounds.x,
        visibleBounds.y,
        visibleBounds.w,
        visibleBounds.h,
        Math.floor((cellSize - width) / 2),
        Math.floor((cellSize - height) / 2),
        width,
        height
    );
    return cell;
}

function relativeAtlasManifestPath(atlasId) {
    const folder = String(atlasId).startsWith("it_atlas_") ? "items" : "atlases";
    return `${folder}/${atlasId}.json`;
}

async function loadAtlasManifest(cache, atlasId) {
    const manifestPath = relativeAtlasManifestPath(atlasId);
    const manifest = await cache.resourceJson(manifestPath);
    const imageName = String(manifest.image || `${atlasId}.png`);
    const imagePath = `${manifestPath.slice(0, manifestPath.lastIndexOf("/") + 1)}${imageName}`;
    const image = await cache.resourceImage(imagePath);
    return { manifestPath, manifest, imagePath, image };
}

async function frameCanvas(cache, atlasStore, atlasId, assetId) {
    if (!atlasStore.has(atlasId)) atlasStore.set(atlasId, loadAtlasManifest(cache, atlasId));
    const { manifest, image } = await atlasStore.get(atlasId);
    const frame = manifest?.frames?.[assetId];
    if (!frame || typeof frame !== "object") return null;
    const x = Math.floor(safeNumber(frame.x));
    const y = Math.floor(safeNumber(frame.y));
    const w = Math.max(1, Math.floor(safeNumber(frame.w, 1)));
    const h = Math.max(1, Math.floor(safeNumber(frame.h, 1)));
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, x, y, w, h, 0, 0, w, h);
    return { canvas, frame: { x, y, w, h } };
}

function entityFloorAnchor(entity) {
    return safeNumber(entity?.floorAnchorYFactor, 1);
}

async function composeCatalogEntity(cache, definition, atlasStore) {
    const states = definition?.states || { default: {} };
    const defaultState = String(definition?.defaultState || Object.keys(states)[0] || "default");
    const stateData = states[defaultState] || {};
    const visuals = Array.isArray(stateData.visuals) ? stateData.visuals : [];
    if (!visuals.length) return placeholderThumbnail(definition?.type || definition?.label || "E");
    const defaultSize = definition?.defaultSize || {};
    const defaults = definition?.defaults || {};
    const entity = {
        w: Math.max(1, safeNumber(defaultSize.w, 64)),
        h: Math.max(1, safeNumber(defaultSize.h, 64)),
        mirrorX: Boolean(defaults.mirrorX),
        floorAnchorYFactor: safeNumber(defaults.floorAnchorYFactor, 1)
    };
    const layers = [];
    const bounds = { minX: Number.POSITIVE_INFINITY, minY: Number.POSITIVE_INFINITY, maxX: Number.NEGATIVE_INFINITY, maxY: Number.NEGATIVE_INFINITY };
    for (const visual of visuals) {
        if (!visual || typeof visual !== "object") continue;
        const atlasId = String(visual.atlasId || "");
        const assetId = String(visual.assetId || "");
        if (!atlasId || !assetId) continue;
        const resolved = await frameCanvas(cache, atlasStore, atlasId, assetId);
        if (!resolved) continue;
        const widthFactor = safeNumber(visual.widthFactor, 1) || 1;
        const heightFactor = safeNumber(visual.heightFactor, 1) || 1;
        const width = Math.max(1, entity.w * widthFactor);
        const height = Math.max(1, entity.h * heightFactor);
        const direction = entity.mirrorX ? -1 : 1;
        const offsetX = (safeNumber(visual.offsetX) + safeNumber(visual.offsetXFactor) * entity.w) * direction;
        const offsetY = safeNumber(visual.offsetY) + safeNumber(visual.offsetYFactor) * entity.h;
        const left = offsetX - width * 0.5;
        const top = offsetY - height * entityFloorAnchor(entity);
        bounds.minX = Math.min(bounds.minX, left);
        bounds.minY = Math.min(bounds.minY, top);
        bounds.maxX = Math.max(bounds.maxX, left + width);
        bounds.maxY = Math.max(bounds.maxY, top + height);
        layers.push({ image: resolved.canvas, left, top, width, height, mirror: Boolean(visual.mirrorX) !== entity.mirrorX, alpha: safeNumber(visual.alpha, 1) });
    }
    if (!layers.length) return placeholderThumbnail(definition?.type || "E");
    const scale = 4;
    const margin = 24;
    const canvas = createCanvas((bounds.maxX - bounds.minX) * scale + margin * 2, (bounds.maxY - bounds.minY) * scale + margin * 2);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    for (const layer of layers) {
        const width = Math.max(1, Math.round(layer.width * scale));
        const height = Math.max(1, Math.round(layer.height * scale));
        const x = Math.round((layer.left - bounds.minX) * scale + margin);
        const y = Math.round((layer.top - bounds.minY) * scale + margin);
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, layer.alpha));
        ctx.translate(x + width / 2, y + height / 2);
        ctx.scale(layer.mirror ? -1 : 1, 1);
        ctx.drawImage(layer.image, -width / 2, -height / 2, width, height);
        ctx.restore();
    }
    return cropVisibleToCanvas(canvas) || canvas;
}

function transformedCommandBounds(command) {
    const source = command?.asset?.canvas || command?.asset?.image;
    const transform = command?.transform;
    if (!source || !transform) return null;
    const visible = alphaBounds(source);
    if (!visible) return null;
    const left = (safeNumber(command.drawX) + visible.x) * safeNumber(command.spriteScale, 1);
    const top = (safeNumber(command.drawY) + visible.y) * safeNumber(command.spriteScale, 1);
    const right = (safeNumber(command.drawX) + visible.x + visible.w) * safeNumber(command.spriteScale, 1);
    const bottom = (safeNumber(command.drawY) + visible.y + visible.h) * safeNumber(command.spriteScale, 1);
    const angle = safeNumber(transform.angle, 0);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const tx = safeNumber(transform.x, 0);
    const ty = safeNumber(transform.y, 0);
    const corners = [
        [left, top],
        [right, top],
        [right, bottom],
        [left, bottom]
    ].map(([x, y]) => ({ x: tx + x * cos - y * sin, y: ty + x * sin + y * cos }));
    const xs = corners.map((corner) => corner.x);
    const ys = corners.map((corner) => corner.y);
    return {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys)
    };
}

function mergeBounds(boundsList) {
    const valid = boundsList.filter(Boolean);
    if (!valid.length) return null;
    return valid.reduce((acc, value) => ({
        minX: Math.min(acc.minX, value.minX),
        minY: Math.min(acc.minY, value.minY),
        maxX: Math.max(acc.maxX, value.maxX),
        maxY: Math.max(acc.maxY, value.maxY)
    }), { minX: Number.POSITIVE_INFINITY, minY: Number.POSITIVE_INFINITY, maxX: Number.NEGATIVE_INFINITY, maxY: Number.NEGATIVE_INFINITY });
}

function renderCharacterCommands(commands, padding = 18) {
    const filtered = commands.filter((command) => (command?.transform?.alpha ?? 1) > 0 && (command?.asset?.canvas || command?.asset?.image));
    const bounds = mergeBounds(filtered.map(transformedCommandBounds));
    if (!bounds) return null;
    const canvas = createCanvas(bounds.maxX - bounds.minX + padding * 2, bounds.maxY - bounds.minY + padding * 2);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    const offsetX = padding - bounds.minX;
    const offsetY = padding - bounds.minY;
    for (const command of filtered) {
        const source = command.asset.canvas || command.asset.image;
        ctx.save();
        ctx.globalAlpha = safeNumber(command.transform.alpha, 1);
        ctx.translate(offsetX + safeNumber(command.transform.x, 0), offsetY + safeNumber(command.transform.y, 0));
        ctx.rotate(safeNumber(command.transform.angle, 0));
        ctx.scale(safeNumber(command.spriteScale, 1), safeNumber(command.spriteScale, 1));
        ctx.drawImage(source, safeNumber(command.drawX, 0), safeNumber(command.drawY, 0));
        ctx.restore();
    }
    return cropVisibleToCanvas(canvas) || canvas;
}

function previewCharacterThumbnailCommands(project, requestedSlot = "idle", actorScale = 1) {
    const resolvedSlot = resolveRuntimeAnimationSlot(project, requestedSlot);
    const clip = resolvedSlot ? project.animations?.get(resolvedSlot) : null;
    const duration = Math.max(0, safeNumber(clip?.duration, 0));
    const candidateTimes = resolvedSlot === "idle" || duration <= 0.0001 ? [0] : [0, duration * 0.25, duration * 0.5, duration * 0.75];
    let best = [];
    let bestScore = Number.NEGATIVE_INFINITY;
    for (const timeSeconds of candidateTimes) {
        const sampled = sampleRuntimeCharacterPose(project, resolvedSlot || requestedSlot || "idle", timeSeconds);
        const transforms = animationPoseToRuntimeTransforms(sampled.pose, project.rig, 1, actorScale);
        applyRuntimeProjectileHandoffVisibility(project, sampled.slot, timeSeconds, transforms);
        const commands = buildRuntimeCharacterDrawCommands(project, transforms);
        const bounds = mergeBounds(commands.map(transformedCommandBounds));
        if (!bounds) continue;
        const width = Math.max(1, bounds.maxX - bounds.minX);
        const height = Math.max(1, bounds.maxY - bounds.minY);
        const score = width * height + width * 8 + height * 12;
        if (score > bestScore) {
            bestScore = score;
            best = commands;
        }
    }
    return best;
}

async function buildAssetEntries(cache, cellSize, sourceFiles, progress) {
    const index = await cache.resourceJson(RESOURCE_INDEX);
    sourceFiles.add(RESOURCE_INDEX);
    const atlasStore = new Map();
    const entries = [];
    const atlasIds = Array.isArray(index.assetAtlasIds) ? index.assetAtlasIds.map(String) : [];
    let processedAtlases = 0;
    for (const atlasId of atlasIds) {
        const atlas = await loadAtlasManifest(cache, atlasId);
        atlasStore.set(atlasId, Promise.resolve(atlas));
        sourceFiles.add(atlas.manifestPath);
        sourceFiles.add(atlas.imagePath);
        const frames = atlas.manifest.frames || {};
        const objects = atlas.manifest.objects || {};
        for (const [assetId, rawFrame] of Object.entries(frames)) {
            if (!rawFrame || typeof rawFrame !== "object") continue;
            const frame = {
                x: Math.floor(safeNumber(rawFrame.x)),
                y: Math.floor(safeNumber(rawFrame.y)),
                w: Math.max(1, Math.floor(safeNumber(rawFrame.w, 1))),
                h: Math.max(1, Math.floor(safeNumber(rawFrame.h, 1)))
            };
            const objectData = objects?.[assetId] && typeof objects[assetId] === "object" ? objects[assetId] : {};
            const frameCanvasObject = createCanvas(frame.w, frame.h);
            frameCanvasObject.getContext("2d").drawImage(atlas.image, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);
            const visible = alphaBounds(frameCanvasObject);
            const tagsRaw = objectData.tags || objectData.generationTags || [];
            const tags = Array.isArray(tagsRaw) ? tagsRaw.map(String) : typeof tagsRaw === "string" ? [String(tagsRaw)] : [];
            const assetType = String(objectData.type || "asset");
            entries.push({
                key: `asset:${atlasId}:${assetId}`,
                kind: "asset",
                identifier: `${atlasId}:${assetId}`,
                label: String(assetId),
                category: assetType,
                searchable: [atlasId, assetId, assetType, ...tags].join(" "),
                source: {
                    atlasId,
                    assetId: String(assetId),
                    manifest: atlas.manifestPath,
                    image: atlas.imagePath
                },
                metadata: {
                    frame,
                    type: assetType,
                    tags,
                    paletteOrder: safeNumber(objectData.paletteOrder)
                },
                image: fitIntoCell(visible ? frameCanvasObject : placeholderThumbnail(assetId, Math.max(128, cellSize * 4)), cellSize)
            });
        }
        processedAtlases += 1;
        progress(`Asset atlases ${processedAtlases}/${atlasIds.length}`, processedAtlases, Math.max(1, atlasIds.length));
        await nextFrame();
    }
    entries.sort((a, b) => {
        const order = safeNumber(a.metadata.paletteOrder) - safeNumber(b.metadata.paletteOrder);
        if (Math.abs(order) > 1e-9) return order;
        const atlasDiff = String(a.source.atlasId).localeCompare(String(b.source.atlasId));
        return atlasDiff || String(a.source.assetId).localeCompare(String(b.source.assetId));
    });
    return { entries, atlasStore, count: entries.length };
}

async function buildEntityEntries(cache, cellSize, sourceFiles, atlasStore, progress) {
    const entries = [];
    const entityCatalog = await cache.resourceJson(ENTITY_CATALOG);
    sourceFiles.add(ENTITY_CATALOG);
    const entityDefinitions = Object.entries(entityCatalog.entities || {}).filter(([, value]) => value && typeof value === "object");
    let processedEntities = 0;
    for (const [entityType, rawDefinition] of entityDefinitions) {
        const definition = { ...rawDefinition, type: entityType };
        const preview = await composeCatalogEntity(cache, definition, atlasStore);
        const defaultSize = definition.defaultSize || {};
        entries.push({
            key: `entity:${entityType}`,
            kind: "entity",
            identifier: String(entityType),
            label: String(definition.label || entityType),
            category: String(definition.category || "Entity"),
            searchable: [entityType, definition.label || "", definition.description || ""].join(" "),
            source: { catalog: ENTITY_CATALOG, entityType: String(entityType) },
            metadata: {
                entityKind: "catalog",
                originalSize: {
                    w: Math.max(1, Math.floor(safeNumber(defaultSize.w, 64))),
                    h: Math.max(1, Math.floor(safeNumber(defaultSize.h, 64)))
                }
            },
            image: fitIntoCell(preview, cellSize)
        });
        processedEntities += 1;
        progress(`Entities ${processedEntities}/${entityDefinitions.length}`, processedEntities, Math.max(1, entityDefinitions.length));
        if (processedEntities % 4 === 0) await nextFrame();
    }
    for (const atlasPromise of atlasStore.values()) {
        const atlas = await atlasPromise;
        sourceFiles.add(atlas.manifestPath);
        sourceFiles.add(atlas.imagePath);
    }

    const enemyCatalog = await cache.resourceJson(ENEMY_CATALOG);
    sourceFiles.add(ENEMY_CATALOG);
    const enemyDefinitions = Object.entries(enemyCatalog.enemies || {}).filter(([, value]) => value && typeof value === "object");
    let processedEnemies = 0;
    for (const [enemyId, rawDefinition] of enemyDefinitions) {
        const characterId = String(rawDefinition.characterId || "");
        const configuredUrl = String(rawDefinition.characterUrl || characterId);
        const withExtension = configuredUrl ? (configuredUrl.endsWith(".json") ? configuredUrl : `${configuredUrl}.json`) : "";
        const characterPath = withExtension ? (withExtension.includes("/") ? withExtension : `characters/${withExtension}`) : "";
        let preview = placeholderThumbnail(String(rawDefinition.label || enemyId));
        let renderInfo = { renderer: "placeholder" };
        if (characterPath) {
            try {
                const project = await loadRuntimeCharacterProject(characterPath, {
                    usePixmapPyramids: false,
                    loadJson: (url) => cache.resourceJson(String(url).replace(/^resources\//, "")),
                    loadImage: (url) => cache.resourceImage(String(url).replace(/^resources\//, ""))
                });
                sourceFiles.add(characterPath);
                if (project.sourceUrl) sourceFiles.add(project.sourceUrl.replace(/^resources\//, ""));
                if (project.rigUrl) sourceFiles.add(project.rigUrl.replace(/^resources\//, ""));
                if (project.atlas?.sourceUrl) sourceFiles.add(project.atlas.sourceUrl.replace(/^resources\//, ""));
                if (project.atlas?.imageUrl) sourceFiles.add(project.atlas.imageUrl.replace(/^resources\//, ""));
                for (const animationUrl of project.animationSources?.values?.() || []) {
                    sourceFiles.add(String(animationUrl).replace(/^resources\//, ""));
                }
                for (const supplementalAtlas of project.supplementalAtlases || []) {
                    if (supplementalAtlas?.sourceUrl) sourceFiles.add(String(supplementalAtlas.sourceUrl).replace(/^resources\//, ""));
                    if (supplementalAtlas?.imageUrl) sourceFiles.add(String(supplementalAtlas.imageUrl).replace(/^resources\//, ""));
                }
                const entity = {
                    characterId,
                    w: Math.max(1, safeNumber(rawDefinition.defaultSize?.w, 72)),
                    h: Math.max(1, safeNumber(rawDefinition.defaultSize?.h, 150)),
                    scale: 1,
                    ...(rawDefinition.defaults && typeof rawDefinition.defaults === "object" ? rawDefinition.defaults : {})
                };
                const requestedSlot = entity.animationSlot || "idle";
                const commands = previewCharacterThumbnailCommands(project, requestedSlot, scaledEnemyRenderScale(entity, 0.8));
                preview = renderCharacterCommands(commands) || preview;
                renderInfo = {
                    renderer: "runtime-character-project",
                    animationSlot: requestedSlot,
                    colorExchangeApplied: [...(project.assets?.values?.() || [])].some((asset) => asset?.colorExchange)
                };
            } catch (error) {
                appendLog(`Warning: could not compose ${enemyId} from ${characterPath}: ${error.message || error}`);
            }
        }
        const defaultSize = rawDefinition.defaultSize || {};
        entries.push({
            key: `entity:${enemyId}`,
            kind: "entity",
            identifier: String(enemyId),
            label: String(rawDefinition.label || enemyId),
            category: "Enemy",
            searchable: [enemyId, rawDefinition.label || "", rawDefinition.description || "", characterId].join(" "),
            source: {
                catalog: ENEMY_CATALOG,
                enemyId: String(enemyId),
                characterId,
                character: characterPath
            },
            metadata: {
                entityKind: "enemy",
                thumbnailRender: renderInfo,
                originalSize: {
                    w: Math.max(1, Math.floor(safeNumber(defaultSize.w, 72))),
                    h: Math.max(1, Math.floor(safeNumber(defaultSize.h, 150)))
                }
            },
            image: fitIntoCell(preview, cellSize)
        });
        processedEnemies += 1;
        progress(`Enemies ${processedEnemies}/${enemyDefinitions.length}`, processedEnemies, Math.max(1, enemyDefinitions.length));
        await nextFrame();
    }

    return { entries, entityCount: entityDefinitions.length, enemyCount: enemyDefinitions.length };
}

async function digestSourceRecords(records, cellSize, maxSize) {
    const lines = [`builder=${BUILDER_ID}`, `version=${BUILDER_VERSION}`, `cell=${cellSize}`, `max=${maxSize}`];
    for (const record of records) {
        lines.push(`${record.path}\0${record.sha256}`);
    }
    return await sha256Hex(lines.join("\n"));
}

async function buildOutputs({ cellSize, maxSize, progress }) {
    if (cellSize <= 0) throw new Error("Thumbnail cell size must be positive.");
    if (maxSize <= 0 || maxSize > 8192) throw new Error("Maximum sheet size must be between 1 and 8192.");
    if (cellSize > maxSize) throw new Error("Thumbnail cell size cannot exceed the maximum sheet size.");

    const cache = new ResourceCache();
    const sourceFiles = new Set([
        "palette-builder.html",
        "src/tools/palette-builder.js",
        "src/tools/resource-hash.js",
        "src/presentation/character-runtime.js",
        "src/presentation/pixmap-pyramid.js",
        "src/presentation/sprite-color-exchange.js",
        "src/shared/animation-data.js",
        "src/shared/character-sound-data.js",
        "src/shared/color-exchange-data.js",
        "src/shared/enemy-drop-data.js",
        "src/shared/enemy-scale-data.js",
        "src/shared/presentation-transform-data.js",
        "src/shared/resource-paths.js"
    ]);
    progress("Loading asset atlases…", 0, 1);
    const assetResult = await buildAssetEntries(cache, cellSize, sourceFiles, progress);
    const entityResult = await buildEntityEntries(cache, cellSize, sourceFiles, assetResult.atlasStore, progress);
    const entries = [...assetResult.entries, ...entityResult.entries];
    if (!entries.length) throw new Error("No palette entries were found.");

    const columns = Math.max(1, Math.ceil(Math.sqrt(entries.length)));
    const rows = Math.ceil(entries.length / columns);
    const width = columns * cellSize;
    const height = rows * cellSize;
    if (width > maxSize || height > maxSize) {
        const capacity = Math.floor(maxSize / cellSize) ** 2;
        throw new Error(`${entries.length} thumbnails at ${cellSize}px require ${width}×${height}, exceeding the ${maxSize}px ceiling. Capacity at these settings is ${capacity} cells.`);
    }

    const sheetCanvas = createCanvas(width, height);
    const sheetContext = sheetCanvas.getContext("2d");
    const jsonEntries = [];
    for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        const column = index % columns;
        const row = Math.floor(index / columns);
        const x = column * cellSize;
        const y = row * cellSize;
        sheetContext.drawImage(entry.image, x, y);
        jsonEntries.push({
            key: entry.key,
            kind: entry.kind,
            id: entry.identifier,
            label: entry.label,
            category: entry.category,
            searchable: entry.searchable,
            thumbnail: { x, y, w: cellSize, h: cellSize },
            source: entry.source,
            ...entry.metadata
        });
        if (index % 64 === 0) {
            progress(`Packing sheet ${index + 1}/${entries.length}`, index + 1, Math.max(1, entries.length));
            await nextFrame();
        }
    }
    const sources = await cache.sourceRecords(sourceFiles);
    const sourceDigest = await digestSourceRecords(sources, cellSize, maxSize);
    const payload = {
        formatVersion: 1,
        generatorVersion: BUILDER_VERSION,
        generatorId: BUILDER_ID,
        image: OUTPUT_IMAGE_NAME,
        cellSize,
        maxSize,
        width,
        height,
        entryCount: jsonEntries.length,
        sourceDigest,
        sources,
        entries: jsonEntries
    };
    const jsonText = `${JSON.stringify(payload, null, 2)}\n`;
    const imageBlob = await canvasToPngBlob(sheetCanvas);
    const jsonBlob = new Blob([jsonText], { type: "application/json" });
    return {
        imageBlob,
        jsonBlob,
        payload,
        sheetCanvas,
        metrics: {
            assetCount: assetResult.count,
            entityCount: entityResult.entityCount,
            enemyCount: entityResult.enemyCount,
            entryCount: jsonEntries.length,
            width,
            height,
            cellSize
        }
    };
}

async function verifyExistingCache({ cellSize, maxSize }) {
    const cache = new ResourceCache();
    const payload = await cache.resourceJson(`palette/${OUTPUT_JSON_NAME}`);
    if (payload.formatVersion !== 1) throw new Error(`Unexpected cache format version: ${payload.formatVersion}`);
    if (payload.generatorId !== BUILDER_ID || payload.generatorVersion !== BUILDER_VERSION) {
        throw new Error("This cache was produced by the retired generator. Rebuild it with Palette Thumbnail Builder.");
    }
    if (!Array.isArray(payload.sources) || !payload.sources.length) throw new Error("The existing cache has no source inventory.");
    if (payload.cellSize !== cellSize || payload.maxSize !== maxSize) {
        throw new Error(`The existing cache was built with ${payload.cellSize}px cells and a ${payload.maxSize}px maximum.`);
    }
    const records = await cache.sourceRecords(payload.sources.map((record) => String(record.path || "")).filter(Boolean));
    const currentDigest = await digestSourceRecords(records, cellSize, maxSize);
    if (currentDigest !== payload.sourceDigest) throw new Error("The cache is stale: one or more source files changed.");
    return {
        entryCount: payload.entryCount || payload.entries?.length || 0,
        width: payload.width || 0,
        height: payload.height || 0,
        cellSize: payload.cellSize || 0,
        generatorVersion: payload.generatorVersion || 0,
        generatorId: payload.generatorId || "unknown"
    };
}

function readSettings() {
    const cellSize = Math.max(1, Math.floor(safeNumber(ui.cellSize.value, DEFAULT_CELL_SIZE)));
    const maxSize = Math.max(cellSize, Math.floor(safeNumber(ui.maxSize.value, DEFAULT_MAX_SIZE)));
    ui.maxSize.value = String(maxSize);
    return { cellSize, maxSize };
}

function previewCanvasFromBuild(sheetCanvas) {
    const canvas = ui.previewCanvas;
    canvas.width = sheetCanvas.width;
    canvas.height = sheetCanvas.height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(sheetCanvas, 0, 0);
}

function updateDownloadLink(anchor, blob, filename) {
    if (anchor.dataset.url) URL.revokeObjectURL(anchor.dataset.url);
    const url = URL.createObjectURL(blob);
    anchor.dataset.url = url;
    anchor.href = url;
    anchor.download = filename;
    anchor.setAttribute("aria-disabled", "false");
}

async function writeOutputsToDirectory(build, prompt = false) {
    if (!projectHost) return false;
    if (!await projectHost.ensureConnected({ prompt })) return false;
    await projectHost.saveBlob("palette", OUTPUT_IMAGE_NAME, build.imageBlob, { prompt: false });
    await projectHost.saveBlob("palette", OUTPUT_JSON_NAME, build.jsonBlob, { prompt: false });
    return true;
}

async function runBuild() {
    if (busy) return;
    clearLog();
    clearSummary();
    setBusy(true);
    setProgress(0, 1);
    try {
        const settings = readSettings();
        appendLog(`Building palette thumbnails with ${settings.cellSize}px cells and a ${settings.maxSize}px ceiling…`);
        setStatus("Building thumbnails…", "info");
        const build = await buildOutputs({
            ...settings,
            progress(label, completed, total) {
                setStatus(label, "info");
                setProgress(completed, total);
            }
        });
        latestBuild = build;
        previewCanvasFromBuild(build.sheetCanvas);
        updateDownloadLink(ui.downloadImage, build.imageBlob, OUTPUT_IMAGE_NAME);
        updateDownloadLink(ui.downloadJson, build.jsonBlob, OUTPUT_JSON_NAME);
        renderSummary(build.metrics);
        appendLog(`Built ${build.metrics.entryCount} entries (${build.metrics.assetCount} assets, ${build.metrics.entityCount} entities, ${build.metrics.enemyCount} enemies).`);
        appendLog(`Sheet size: ${build.metrics.width}×${build.metrics.height}.`);
        if (projectHost?.connected) {
            await writeOutputsToDirectory(build);
            appendLog(`Wrote ${OUTPUT_IMAGE_NAME} and ${OUTPUT_JSON_NAME} to resources/palette.`);
            setStatus("Build complete and written to resources/palette.", "success");
        } else {
            appendLog("Build complete. Use the download links or choose an output folder.");
            setStatus("Build complete. Use the download links or choose an output folder.", "success");
        }
        setProgress(1, 1);
    } catch (error) {
        console.error(error);
        appendLog(`Error: ${error.message || error}`);
        setStatus(`Build failed: ${error.message || error}`, "error");
    } finally {
        setBusy(false);
    }
}

async function runVerify() {
    if (busy) return;
    clearLog();
    clearSummary();
    setBusy(true);
    setProgress(0, 1);
    try {
        const settings = readSettings();
        appendLog(`Verifying existing resources/palette/${OUTPUT_JSON_NAME}…`);
        setStatus("Verifying existing cache…", "info");
        const result = await verifyExistingCache(settings);
        renderSummary({
            assetCount: "—",
            entityCount: "—",
            enemyCount: "—",
            entryCount: result.entryCount,
            width: result.width,
            height: result.height,
            cellSize: result.cellSize
        });
        appendLog(`Cache is current: ${result.entryCount} entries, ${result.width}×${result.height} at ${result.cellSize}px.`);
        appendLog(`Generator: ${result.generatorId || "unknown"} v${result.generatorVersion || "?"}.`);
        setStatus("Existing cache is current.", "success");
        setProgress(1, 1);
    } catch (error) {
        console.error(error);
        appendLog(`Cache is stale: ${error.message || error}`);
        setStatus(`Cache is stale: ${error.message || error}`, "error");
    } finally {
        setBusy(false);
    }
}

async function chooseOutputFolder() {
    if (!projectHost) {
        setStatus("The shared project host is unavailable.", "error");
        return;
    }
    try {
        const before = projectHost.snapshot();
        const after = await projectHost.chooseResourcesDirectory();
        updateOutputFolderLabel();
        if (after.selectionVersion !== before.selectionVersion) {
            latestBuild = null;
            for (const anchor of [ui.downloadImage, ui.downloadJson]) {
                if (anchor.dataset.url) URL.revokeObjectURL(anchor.dataset.url);
                delete anchor.dataset.url;
                anchor.removeAttribute("href");
                anchor.setAttribute("aria-disabled", "true");
            }
            clearSummary();
            appendLog("Resources folder changed. Rebuild before writing palette outputs so inputs and outputs come from the same tree.");
            setStatus(`Selected project resources: ${projectHost.displayName}. Rebuild thumbnails for this tree.`, "success");
        } else {
            setStatus(`Selected project resources: ${projectHost.displayName}`, "success");
        }
    } catch (error) {
        if (error?.name === "AbortError") return;
        console.error(error);
        setStatus(`Could not select the resources folder: ${error.message || error}`, "error");
    }
}

async function clearOutputFolder() {
    if (projectHost?.mode !== "browser") return;
    await projectHost.forgetResourcesDirectory();
    updateOutputFolderLabel();
    setStatus("Project folder forgotten; using download links only.", "info");
}

async function bootstrap() {
    if (projectHost) {
        projectHost.subscribe(() => updateOutputFolderLabel());
        await projectHost.initialize();
    }
    updateOutputFolderLabel();
    ui.chooseFolderButton.disabled = !projectHost || projectHost.mode === "native" || !("showDirectoryPicker" in window);
    ui.clearFolderButton.disabled = !projectHost || projectHost.mode === "native";
    ui.chooseFolderButton.addEventListener("click", chooseOutputFolder);
    ui.clearFolderButton.addEventListener("click", clearOutputFolder);
    ui.buildButton.addEventListener("click", runBuild);
    ui.verifyButton.addEventListener("click", runVerify);
    ui.downloadImage.addEventListener("click", (event) => {
        if (!latestBuild) event.preventDefault();
    });
    ui.downloadJson.addEventListener("click", (event) => {
        if (!latestBuild) event.preventDefault();
    });
    setStatus("Ready.", "info");
    appendLog("Open this page through the local development server, then click Build thumbnails.");
}

export { buildOutputs, verifyExistingCache };

bootstrap().catch((error) => setStatus(error.message || String(error), "error"));
