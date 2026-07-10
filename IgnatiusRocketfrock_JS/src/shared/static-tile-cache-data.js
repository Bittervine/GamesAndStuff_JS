export const STATIC_TILE_BAKE_MODES = Object.freeze(["off", "tiles", "full"]);
export const STATIC_TILE_SIZE = 256;
export const STATIC_TILE_GUTTER = 1;
export const STATIC_TILE_SLOT_SIZE = STATIC_TILE_SIZE + STATIC_TILE_GUTTER * 2;
export const STATIC_TILE_NORMAL_MARGIN_SCREENS = 1;
export const STATIC_TILE_RETENTION_MARGIN_SCREENS = 2;
export const STATIC_TILE_PREDICTION_SECONDS = 2;

function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

export function normalizeStaticTileBakeMode(value, fallback = "off") {
    const candidate = String(value || "").trim().toLowerCase();
    return STATIC_TILE_BAKE_MODES.includes(candidate) ? candidate : fallback;
}

export function staticTileViewRect(view, parallaxOffset = null) {
    const zoom = Math.max(0.0001, finiteNumber(view?.zoom, 1));
    const width = Math.max(1, finiteNumber(view?.virtualW, finiteNumber(view?.w, 1) / zoom));
    const height = Math.max(1, finiteNumber(view?.virtualH, finiteNumber(view?.h, 1) / zoom));
    return {
        x: finiteNumber(view?.x, 0) + finiteNumber(parallaxOffset?.x, 0),
        y: finiteNumber(view?.y, 0) + finiteNumber(parallaxOffset?.y, 0),
        w: width,
        h: height
    };
}

export function expandStaticTileRect(rect, marginX = 0, marginY = marginX) {
    const x = finiteNumber(rect?.x, 0);
    const y = finiteNumber(rect?.y, 0);
    const w = Math.max(0, finiteNumber(rect?.w, 0));
    const h = Math.max(0, finiteNumber(rect?.h, 0));
    const mx = Math.max(0, finiteNumber(marginX, 0));
    const my = Math.max(0, finiteNumber(marginY, mx));
    return {
        x: x - mx,
        y: y - my,
        w: w + mx * 2,
        h: h + my * 2
    };
}

export function unionStaticTileRects(a, b) {
    if (!a) return b ? { ...b } : null;
    if (!b) return { ...a };
    const minX = Math.min(a.x, b.x);
    const minY = Math.min(a.y, b.y);
    const maxX = Math.max(a.x + a.w, b.x + b.w);
    const maxY = Math.max(a.y + a.h, b.y + b.h);
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function translateStaticTileRect(rect, dx = 0, dy = 0) {
    return {
        x: finiteNumber(rect?.x, 0) + finiteNumber(dx, 0),
        y: finiteNumber(rect?.y, 0) + finiteNumber(dy, 0),
        w: Math.max(0, finiteNumber(rect?.w, 0)),
        h: Math.max(0, finiteNumber(rect?.h, 0))
    };
}

export function staticTileCacheRegions(view, options = {}) {
    const visible = staticTileViewRect(view, options.parallaxOffset);
    const velocityX = finiteNumber(options.velocityX, 0);
    const velocityY = finiteNumber(options.velocityY, 0);
    const predictionSeconds = Math.max(0, finiteNumber(options.predictionSeconds, STATIC_TILE_PREDICTION_SECONDS));
    const tileSize = Math.max(1, finiteNumber(options.tileSize, STATIC_TILE_SIZE));
    const bakeMarginScreens = Math.max(0, finiteNumber(options.bakeMarginScreens, STATIC_TILE_NORMAL_MARGIN_SCREENS));
    const retentionMarginScreens = Math.max(bakeMarginScreens, finiteNumber(options.retentionMarginScreens, STATIC_TILE_RETENTION_MARGIN_SCREENS));

    const normalBake = expandStaticTileRect(
        visible,
        visible.w * bakeMarginScreens,
        visible.h * bakeMarginScreens
    );
    const normalRetention = expandStaticTileRect(
        visible,
        visible.w * retentionMarginScreens,
        visible.h * retentionMarginScreens
    );
    const predictedVisible = translateStaticTileRect(
        visible,
        velocityX * predictionSeconds,
        velocityY * predictionSeconds
    );
    const corridor = expandStaticTileRect(
        unionStaticTileRects(visible, predictedVisible),
        tileSize,
        tileSize
    );

    return {
        visible,
        predictedVisible,
        bakeRects: [normalBake, corridor],
        retentionRects: [normalRetention, corridor]
    };
}

export function staticTileRangeForRect(rect, tileSize = STATIC_TILE_SIZE) {
    const size = Math.max(1, Math.floor(finiteNumber(tileSize, STATIC_TILE_SIZE)));
    const x = finiteNumber(rect?.x, 0);
    const y = finiteNumber(rect?.y, 0);
    const w = Math.max(0, finiteNumber(rect?.w, 0));
    const h = Math.max(0, finiteNumber(rect?.h, 0));
    const epsilon = 0.000001;
    return {
        minTileX: Math.floor(x / size),
        maxTileX: Math.floor((x + Math.max(0, w - epsilon)) / size),
        minTileY: Math.floor(y / size),
        maxTileY: Math.floor((y + Math.max(0, h - epsilon)) / size)
    };
}

export function staticTileRect(tileX, tileY, tileSize = STATIC_TILE_SIZE) {
    const size = Math.max(1, Math.floor(finiteNumber(tileSize, STATIC_TILE_SIZE)));
    return {
        x: Math.floor(finiteNumber(tileX, 0)) * size,
        y: Math.floor(finiteNumber(tileY, 0)) * size,
        w: size,
        h: size
    };
}

export function staticTileRecordKey(layer, tileX, tileY) {
    return `${String(layer || "terrain")}:${Math.floor(finiteNumber(tileX, 0))}:${Math.floor(finiteNumber(tileY, 0))}`;
}

export function staticTileRectIntersects(a, b) {
    if (!a || !b) return false;
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function staticTileRectIntersectsAny(rect, candidates = []) {
    return candidates.some((candidate) => staticTileRectIntersects(rect, candidate));
}

export function staticTilePriority(tileRectValue, regions, velocityX = 0, velocityY = 0, layerBias = 0) {
    const tile = tileRectValue || { x: 0, y: 0, w: 0, h: 0 };
    const visible = regions?.visible || { x: 0, y: 0, w: 0, h: 0 };
    const predicted = regions?.predictedVisible || visible;
    if (staticTileRectIntersects(tile, visible)) return layerBias;

    const tileCenterX = tile.x + tile.w * 0.5;
    const tileCenterY = tile.y + tile.h * 0.5;
    const predictedCenterX = predicted.x + predicted.w * 0.5;
    const predictedCenterY = predicted.y + predicted.h * 0.5;
    const dx = tileCenterX - predictedCenterX;
    const dy = tileCenterY - predictedCenterY;
    const distance = Math.hypot(dx, dy);
    const speed = Math.hypot(velocityX, velocityY);
    const forwardBonus = speed > 0.0001
        ? -((dx * velocityX + dy * velocityY) / speed) * 0.15
        : 0;
    return 1000 + distance + forwardBonus + layerBias;
}
