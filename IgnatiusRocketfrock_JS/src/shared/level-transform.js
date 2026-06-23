export const LEVEL_BACKGROUND_COLOR = "rgb(6, 6, 12)";

export function normalizeRotationRadians(value, fallbackDegrees = 0) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
        return numeric;
    }
    const degrees = Number(fallbackDegrees);
    return Number.isFinite(degrees) ? degrees * Math.PI / 180 : 0;
}

export function placementCenter(placement) {
    const x = Number(placement?.x) || 0;
    const y = Number(placement?.y) || 0;
    const w = Math.max(0, Number(placement?.w) || 0);
    const h = Math.max(0, Number(placement?.h) || 0);
    return { x: x + w * 0.5, y: y + h * 0.5 };
}

export function duplicateLevelPlacement(placement, options = {}) {
    if (!placement || typeof placement !== "object") {
        throw new TypeError("A placement object is required.");
    }
    const clone = JSON.parse(JSON.stringify(placement));
    const newId = String(options.id || "").trim();
    if (!newId) {
        throw new TypeError("A unique identifier is required for the copied placement.");
    }
    const dx = Number.isFinite(Number(options.dx)) ? Number(options.dx) : 16;
    const dy = Number.isFinite(Number(options.dy)) ? Number(options.dy) : -16;
    clone.id = newId;
    clone.x = (Number(placement.x) || 0) + dx;
    clone.y = (Number(placement.y) || 0) + dy;
    return clone;
}

export function placementLocalToWorld(placement, localX, localY) {
    const center = placementCenter(placement);
    const w = Math.max(0, Number(placement?.w) || 0);
    const h = Math.max(0, Number(placement?.h) || 0);
    const rotation = normalizeRotationRadians(placement?.rotation, placement?.angle);
    const dx = Number(localX) - w * 0.5;
    const dy = Number(localY) - h * 0.5;
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);
    return {
        x: center.x + dx * cosine - dy * sine,
        y: center.y + dx * sine + dy * cosine
    };
}

export function worldToPlacementLocal(placement, worldX, worldY) {
    const center = placementCenter(placement);
    const w = Math.max(0, Number(placement?.w) || 0);
    const h = Math.max(0, Number(placement?.h) || 0);
    const rotation = normalizeRotationRadians(placement?.rotation, placement?.angle);
    const dx = Number(worldX) - center.x;
    const dy = Number(worldY) - center.y;
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);
    return {
        x: w * 0.5 + dx * cosine + dy * sine,
        y: h * 0.5 - dx * sine + dy * cosine
    };
}

export function pointInPlacement(point, placement) {
    const local = worldToPlacementLocal(placement, point?.x, point?.y);
    const w = Math.max(0, Number(placement?.w) || 0);
    const h = Math.max(0, Number(placement?.h) || 0);
    return local.x >= 0 && local.x <= w && local.y >= 0 && local.y <= h;
}

export function placementCorners(placement) {
    const w = Math.max(0, Number(placement?.w) || 0);
    const h = Math.max(0, Number(placement?.h) || 0);
    return [
        placementLocalToWorld(placement, 0, 0),
        placementLocalToWorld(placement, w, 0),
        placementLocalToWorld(placement, w, h),
        placementLocalToWorld(placement, 0, h)
    ];
}

export function atlasNodeToPlacementWorld(placement, frame, node) {
    const frameW = Math.max(1, Number(frame?.w) || 1);
    const frameH = Math.max(1, Number(frame?.h) || 1);
    const w = Math.max(0, Number(placement?.w) || 0);
    const h = Math.max(0, Number(placement?.h) || 0);
    const sourceX = Number(node?.x) || 0;
    const sourceY = Number(node?.y) || 0;
    const mirroredX = placement?.mirrorX ? frameW - sourceX : sourceX;
    const mirroredY = placement?.mirrorY ? frameH - sourceY : sourceY;
    return placementLocalToWorld(
        placement,
        mirroredX / frameW * w,
        mirroredY / frameH * h
    );
}
