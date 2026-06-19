export const ATLAS_HANDLE_NAMES = Object.freeze(["nw", "ne", "se", "sw"]);

export function normalizeAtlasFrameRect(frame) {
    const x = Math.round(Number(frame?.x));
    const y = Math.round(Number(frame?.y));
    const w = Math.round(Number(frame?.w));
    const h = Math.round(Number(frame?.h));
    return {
        x: Number.isFinite(x) ? x : 0,
        y: Number.isFinite(y) ? y : 0,
        w: Number.isFinite(w) ? w : 1,
        h: Number.isFinite(h) ? h : 1
    };
}

export function uniqueAtlasFrameId(atlas, preferred = "frame") {
    const frames = atlas?.frames || {};
    const base = String(preferred || "frame")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || "frame";
    if (!Object.hasOwn(frames, base)) {
        return base;
    }
    let suffix = 2;
    while (Object.hasOwn(frames, `${base}_${suffix}`)) {
        suffix += 1;
    }
    return `${base}_${suffix}`;
}

export function createAtlasFrame(atlas, frameId, rect, options = {}) {
    assertAtlas(atlas);
    const id = String(frameId || "").trim();
    if (!id) {
        throw new Error("Frame ID cannot be empty.");
    }
    if (Object.hasOwn(atlas.frames, id)) {
        throw new Error(`Atlas frame ${id} already exists.`);
    }
    atlas.frames[id] = normalizeAtlasFrameRect(rect);
    if (options.createObject !== false) {
        atlas.objects ||= {};
        atlas.objects[id] = {
            id,
            frame: id,
            type: "characterPart",
            layer: "character",
            mirrorable: true,
            tags: []
        };
    }
    return id;
}

export function duplicateAtlasFrame(atlas, sourceId, preferredId = null, offset = 8) {
    assertAtlas(atlas);
    const source = atlas.frames[sourceId];
    if (!source) {
        throw new Error(`Atlas frame ${sourceId} does not exist.`);
    }
    const id = uniqueAtlasFrameId(atlas, preferredId || `${sourceId}_copy`);
    const rect = normalizeAtlasFrameRect(source);
    rect.x += Math.round(Number(offset) || 0);
    rect.y += Math.round(Number(offset) || 0);
    createAtlasFrame(atlas, id, rect, { createObject: false });
    atlas.objects ||= {};
    const sourceObject = Object.values(atlas.objects).find((entry) => entry?.frame === sourceId);
    atlas.objects[id] = sourceObject
        ? { ...structuredCloneSafe(sourceObject), id, frame: id }
        : {
            id,
            frame: id,
            type: "characterPart",
            layer: "character",
            mirrorable: true,
            tags: []
        };
    return id;
}

export function renameAtlasFrame(atlas, rig, oldId, requestedId) {
    assertAtlas(atlas);
    const nextId = String(requestedId || "").trim();
    if (!atlas.frames[oldId]) {
        throw new Error(`Atlas frame ${oldId} does not exist.`);
    }
    if (!nextId) {
        throw new Error("Frame ID cannot be empty.");
    }
    if (nextId !== oldId && Object.hasOwn(atlas.frames, nextId)) {
        throw new Error(`Atlas frame ${nextId} already exists.`);
    }
    if (nextId === oldId) {
        return oldId;
    }

    const reorderedFrames = {};
    for (const [id, frame] of Object.entries(atlas.frames)) {
        reorderedFrames[id === oldId ? nextId : id] = frame;
    }
    atlas.frames = reorderedFrames;

    if (atlas.objects && typeof atlas.objects === "object") {
        const reorderedObjects = {};
        for (const [objectId, object] of Object.entries(atlas.objects)) {
            const renamedObjectId = objectId === oldId ? nextId : objectId;
            reorderedObjects[renamedObjectId] = {
                ...object,
                id: object?.id === oldId ? nextId : object?.id,
                frame: object?.frame === oldId ? nextId : object?.frame
            };
        }
        atlas.objects = reorderedObjects;
    }

    for (const part of Object.values(rig?.parts || {})) {
        if (part?.frame === oldId) {
            part.frame = nextId;
        }
    }
    return nextId;
}

export function deleteAtlasFrame(atlas, frameId) {
    assertAtlas(atlas);
    if (!Object.hasOwn(atlas.frames, frameId)) {
        return false;
    }
    delete atlas.frames[frameId];
    for (const [objectId, object] of Object.entries(atlas.objects || {})) {
        if (objectId === frameId || object?.frame === frameId) {
            delete atlas.objects[objectId];
        }
    }
    return true;
}

export function clampAtlasFrameRect(frame, imageWidth, imageHeight) {
    const width = Math.max(1, Math.round(Number(imageWidth) || 1));
    const height = Math.max(1, Math.round(Number(imageHeight) || 1));
    const rect = normalizeAtlasFrameRect(frame);
    rect.w = Math.max(1, Math.min(width, rect.w));
    rect.h = Math.max(1, Math.min(height, rect.h));
    rect.x = Math.max(0, Math.min(width - rect.w, rect.x));
    rect.y = Math.max(0, Math.min(height - rect.h, rect.y));
    return rect;
}

export function atlasFrameFromDrag(start, end, imageWidth, imageHeight) {
    const x1 = Math.round(Math.min(Number(start.x), Number(end.x)));
    const y1 = Math.round(Math.min(Number(start.y), Number(end.y)));
    const x2 = Math.round(Math.max(Number(start.x), Number(end.x)));
    const y2 = Math.round(Math.max(Number(start.y), Number(end.y)));
    return clampAtlasFrameRect({ x: x1, y: y1, w: Math.max(1, x2 - x1), h: Math.max(1, y2 - y1) }, imageWidth, imageHeight);
}

export function moveAtlasFrame(startRect, deltaX, deltaY, imageWidth, imageHeight) {
    const rect = normalizeAtlasFrameRect(startRect);
    rect.x += Math.round(Number(deltaX) || 0);
    rect.y += Math.round(Number(deltaY) || 0);
    return clampAtlasFrameRect(rect, imageWidth, imageHeight);
}

export function resizeAtlasFrame(startRect, handle, deltaX, deltaY, imageWidth, imageHeight) {
    const rect = normalizeAtlasFrameRect(startRect);
    let left = rect.x;
    let top = rect.y;
    let right = rect.x + rect.w;
    let bottom = rect.y + rect.h;
    const dx = Math.round(Number(deltaX) || 0);
    const dy = Math.round(Number(deltaY) || 0);

    if (handle.includes("w")) {
        left += dx;
    }
    if (handle.includes("e")) {
        right += dx;
    }
    if (handle.includes("n")) {
        top += dy;
    }
    if (handle.includes("s")) {
        bottom += dy;
    }

    left = Math.max(0, Math.min(Number(imageWidth) - 1, left));
    top = Math.max(0, Math.min(Number(imageHeight) - 1, top));
    right = Math.max(left + 1, Math.min(Number(imageWidth), right));
    bottom = Math.max(top + 1, Math.min(Number(imageHeight), bottom));
    return normalizeAtlasFrameRect({ x: left, y: top, w: right - left, h: bottom - top });
}

export function atlasFrameHandles(frame) {
    const rect = normalizeAtlasFrameRect(frame);
    return {
        nw: { x: rect.x, y: rect.y },
        ne: { x: rect.x + rect.w, y: rect.y },
        se: { x: rect.x + rect.w, y: rect.y + rect.h },
        sw: { x: rect.x, y: rect.y + rect.h }
    };
}

export function hitTestAtlasFrames(point, frames, selectedId = null, tolerance = 7) {
    const px = Number(point?.x);
    const py = Number(point?.y);
    const radius = Math.max(1, Number(tolerance) || 7);
    if (selectedId && frames?.[selectedId]) {
        const handles = atlasFrameHandles(frames[selectedId]);
        for (const handle of ATLAS_HANDLE_NAMES) {
            const target = handles[handle];
            if (Math.hypot(px - target.x, py - target.y) <= radius) {
                return { frameId: selectedId, mode: "resize", handle };
            }
        }
    }
    const entries = Object.entries(frames || {}).reverse();
    for (const [frameId, source] of entries) {
        const rect = normalizeAtlasFrameRect(source);
        if (px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h) {
            return { frameId, mode: "move", handle: null };
        }
    }
    return null;
}

export function validateAtlasFrames(atlas, imageWidth, imageHeight, rig = null) {
    const errors = [];
    const warnings = [];
    const width = Number(imageWidth);
    const height = Number(imageHeight);
    if (!atlas || typeof atlas !== "object") {
        return { valid: false, errors: ["Atlas data is missing."], warnings };
    }
    if (!atlas.frames || typeof atlas.frames !== "object" || Array.isArray(atlas.frames)) {
        return { valid: false, errors: ["Atlas frames must be an object."], warnings };
    }
    const normalizedSignatures = new Map();
    for (const [frameId, frame] of Object.entries(atlas.frames)) {
        if (!String(frameId).trim()) {
            errors.push("A frame has an empty ID.");
        }
        const rect = normalizeAtlasFrameRect(frame);
        if (!Number.isFinite(Number(frame?.x)) || !Number.isFinite(Number(frame?.y)) || !Number.isFinite(Number(frame?.w)) || !Number.isFinite(Number(frame?.h))) {
            errors.push(`${frameId}: x, y, w, and h must be finite numbers.`);
            continue;
        }
        if (rect.w <= 0 || rect.h <= 0) {
            errors.push(`${frameId}: width and height must be positive.`);
        }
        if (rect.x < 0 || rect.y < 0) {
            errors.push(`${frameId}: rectangle begins outside the image.`);
        }
        if (Number.isFinite(width) && Number.isFinite(height) && (rect.x + rect.w > width || rect.y + rect.h > height)) {
            errors.push(`${frameId}: rectangle extends beyond ${width}×${height} image bounds.`);
        }
        const signature = `${rect.x},${rect.y},${rect.w},${rect.h}`;
        const prior = normalizedSignatures.get(signature);
        if (prior) {
            warnings.push(`${frameId} duplicates the exact rectangle used by ${prior}.`);
        } else {
            normalizedSignatures.set(signature, frameId);
        }
    }
    for (const [partId, part] of Object.entries(rig?.parts || {})) {
        if (!atlas.frames[part?.frame]) {
            errors.push(`Rig part ${partId} references missing frame ${part?.frame || "(none)"}.`);
        }
    }
    return { valid: errors.length === 0, errors, warnings };
}

export function atlasViewTransform({ canvasWidth, canvasHeight, imageWidth, imageHeight, zoom = 1, panX = 0, panY = 0 }) {
    return {
        zoom: Math.max(0.01, Number(zoom) || 1),
        originX: Number(canvasWidth) / 2 - Number(imageWidth) / 2 * zoom + Number(panX || 0),
        originY: Number(canvasHeight) / 2 - Number(imageHeight) / 2 * zoom + Number(panY || 0)
    };
}

export function atlasToCanvasPoint(point, view) {
    return {
        x: view.originX + Number(point.x) * view.zoom,
        y: view.originY + Number(point.y) * view.zoom
    };
}

export function canvasToAtlasPoint(point, view) {
    return {
        x: (Number(point.x) - view.originX) / view.zoom,
        y: (Number(point.y) - view.originY) / view.zoom
    };
}

export function zoomAtlasViewAtCanvasPoint(current, canvasPoint, factor, options) {
    const imageWidth = Number(options.imageWidth) || 1;
    const imageHeight = Number(options.imageHeight) || 1;
    const beforeView = atlasViewTransform({ ...options, ...current, imageWidth, imageHeight });
    const imagePoint = canvasToAtlasPoint(canvasPoint, beforeView);
    const nextZoom = clamp((Number(current.zoom) || 1) * Number(factor || 1), options.minZoom ?? 0.05, options.maxZoom ?? 16);
    const base = atlasViewTransform({ ...options, zoom: nextZoom, panX: 0, panY: 0, imageWidth, imageHeight });
    return {
        zoom: nextZoom,
        panX: Number(canvasPoint.x) - (base.originX + imagePoint.x * nextZoom),
        panY: Number(canvasPoint.y) - (base.originY + imagePoint.y * nextZoom)
    };
}

function assertAtlas(atlas) {
    if (!atlas || typeof atlas !== "object") {
        throw new Error("Atlas data is missing.");
    }
    atlas.frames ||= {};
}

function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
