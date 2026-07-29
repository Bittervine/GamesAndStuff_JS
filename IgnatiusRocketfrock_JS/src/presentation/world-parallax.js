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

export function computeWorldParallaxOffsetAtPointInto(target, point, worldBounds, parallax = 1, {
    min = 0.25,
    max = 1.25
} = {}) {
    const output = target && typeof target === "object" ? target : {};
    const bounds = normalizedWorldBounds(worldBounds);
    const anchorX = bounds.x + bounds.w * 0.5;
    const anchorY = bounds.y + bounds.h * 0.5;
    const lower = Math.min(finiteNumber(min, 0.25), finiteNumber(max, 1.25));
    const upper = Math.max(finiteNumber(min, 0.25), finiteNumber(max, 1.25));
    const factor = Math.max(lower, Math.min(upper, finiteNumber(parallax, 1)));
    const extraScroll = factor - 1;
    output.x = (finiteNumber(point?.x, 0) - anchorX) * extraScroll;
    output.y = (finiteNumber(point?.y, 0) - anchorY) * extraScroll;
    return output;
}

export function computeWorldParallaxOffsetAtPoint(point, worldBounds, parallax = 1, options = {}) {
    return computeWorldParallaxOffsetAtPointInto({}, point, worldBounds, parallax, options);
}

export function computeWorldParallaxOffsetInto(target, view, worldBounds, parallax = 1, options = {}) {
    const zoom = Math.max(0.0001, finiteNumber(view?.zoom, 1));
    const virtualWidth = Math.max(1, finiteNumber(view?.virtualW, finiteNumber(view?.w, 1) / zoom));
    const virtualHeight = Math.max(1, finiteNumber(view?.virtualH, finiteNumber(view?.h, 1) / zoom));
    return computeWorldParallaxOffsetAtPointInto(target, {
        x: finiteNumber(view?.x, 0) + virtualWidth * 0.5,
        y: finiteNumber(view?.y, 0) + virtualHeight * 0.56
    }, worldBounds, parallax, options);
}

export function computeWorldParallaxOffset(view, worldBounds, parallax = 1, options = {}) {
    return computeWorldParallaxOffsetInto({}, view, worldBounds, parallax, options);
}
