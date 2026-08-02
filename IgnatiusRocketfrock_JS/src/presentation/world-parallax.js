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

function clampedFactor(value, fallback, min, max) {
    const lower = Math.min(finiteNumber(min, 0.01), finiteNumber(max, 1.25));
    const upper = Math.max(finiteNumber(min, 0.01), finiteNumber(max, 1.25));
    return Math.max(lower, Math.min(upper, finiteNumber(value, fallback)));
}

export function computeWorldParallaxOffsetAtPointInto(
    target,
    point,
    worldBounds,
    parallaxX = 1,
    parallaxY = 1,
    {
        minX = 0.01,
        maxX = 1.25,
        minY = minX,
        maxY = maxX
    } = {}
) {
    const output = target && typeof target === "object" ? target : {};
    const bounds = normalizedWorldBounds(worldBounds);
    const anchorX = bounds.x + bounds.w * 0.5;
    const anchorY = bounds.y + bounds.h * 0.5;
    const factorX = clampedFactor(parallaxX, 1, minX, maxX);
    const factorY = clampedFactor(parallaxY, 1, minY, maxY);
    output.x = (finiteNumber(point?.x, 0) - anchorX) * (factorX - 1);
    output.y = (finiteNumber(point?.y, 0) - anchorY) * (factorY - 1);
    return output;
}

export function computeWorldParallaxOffsetAtPoint(point, worldBounds, parallaxX = 1, parallaxY = 1, options = {}) {
    return computeWorldParallaxOffsetAtPointInto({}, point, worldBounds, parallaxX, parallaxY, options);
}

export function computeWorldParallaxOffsetInto(target, view, worldBounds, parallaxX = 1, parallaxY = 1, options = {}) {
    const zoom = Math.max(0.0001, finiteNumber(view?.zoom, 1));
    const virtualWidth = Math.max(1, finiteNumber(view?.virtualW, finiteNumber(view?.w, 1) / zoom));
    const virtualHeight = Math.max(1, finiteNumber(view?.virtualH, finiteNumber(view?.h, 1) / zoom));
    const explicitAnchorX = view?.parallaxAnchorX;
    const explicitAnchorY = view?.parallaxAnchorY;
    const anchorX = explicitAnchorX !== null && explicitAnchorX !== undefined && Number.isFinite(Number(explicitAnchorX))
        ? Number(explicitAnchorX)
        : finiteNumber(view?.x, 0) + virtualWidth * 0.5;
    const anchorY = explicitAnchorY !== null && explicitAnchorY !== undefined && Number.isFinite(Number(explicitAnchorY))
        ? Number(explicitAnchorY)
        : finiteNumber(view?.y, 0) + virtualHeight * 0.56;
    return computeWorldParallaxOffsetAtPointInto(target, {
        x: anchorX,
        y: anchorY
    }, worldBounds, parallaxX, parallaxY, options);
}

export function computeWorldParallaxOffset(view, worldBounds, parallaxX = 1, parallaxY = 1, options = {}) {
    return computeWorldParallaxOffsetInto({}, view, worldBounds, parallaxX, parallaxY, options);
}
