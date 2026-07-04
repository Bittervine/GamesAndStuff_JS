function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function normalizedWorldBounds(worldBounds) {
    const x = finiteNumber(worldBounds?.x, 0);
    const y = finiteNumber(worldBounds?.y, 0);
    const w = Math.max(1, finiteNumber(worldBounds?.w, 1));
    const h = Math.max(1, finiteNumber(worldBounds?.h, 1));
    return { x, y, w, h };
}

export function computeWorldParallaxOffset(view, worldBounds, parallax = 1, {
    min = 0.25,
    max = 1.25
} = {}) {
    const zoom = Math.max(0.0001, finiteNumber(view?.zoom, 1));
    const virtualWidth = Math.max(1, finiteNumber(view?.virtualW, finiteNumber(view?.w, 1) / zoom));
    const virtualHeight = Math.max(1, finiteNumber(view?.virtualH, finiteNumber(view?.h, 1) / zoom));
    const cameraX = finiteNumber(view?.x, 0) + virtualWidth * 0.5;
    const cameraY = finiteNumber(view?.y, 0) + virtualHeight * 0.56;
    const bounds = normalizedWorldBounds(worldBounds);
    const anchorX = bounds.x + bounds.w * 0.5;
    const anchorY = bounds.y + bounds.h * 0.5;
    const lower = Math.min(finiteNumber(min, 0.25), finiteNumber(max, 1.25));
    const upper = Math.max(finiteNumber(min, 0.25), finiteNumber(max, 1.25));
    const factor = Math.max(lower, Math.min(upper, finiteNumber(parallax, 1)));
    const extraScroll = factor - 1;
    return {
        x: (cameraX - anchorX) * extraScroll,
        y: (cameraY - anchorY) * extraScroll
    };
}
