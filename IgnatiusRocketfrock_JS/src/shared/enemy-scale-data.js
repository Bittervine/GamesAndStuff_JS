function finiteNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

export function normalizeEnemyScale(value, fallback = 1) {
    return Math.max(0.05, finiteNumber(value, fallback));
}

export function scaledEnemyDimensions(enemy, fallbackWidth = 72, fallbackHeight = 150) {
    const scale = normalizeEnemyScale(enemy?.scale, 1);
    return {
        scale,
        baseWidth: Math.max(1, finiteNumber(enemy?.w ?? enemy?.width, fallbackWidth)),
        baseHeight: Math.max(1, finiteNumber(enemy?.h ?? enemy?.height, fallbackHeight)),
        width: Math.max(1, finiteNumber(enemy?.w ?? enemy?.width, fallbackWidth)) * scale,
        height: Math.max(1, finiteNumber(enemy?.h ?? enemy?.height, fallbackHeight)) * scale
    };
}

export function scaledEnemyRenderScale(enemy, fallback = 1) {
    return Math.max(0.05, finiteNumber(enemy?.renderScale, fallback)) * normalizeEnemyScale(enemy?.scale, 1);
}

export function scaledEnemyProjectileRadius(enemy, fallback = 12) {
    return Math.max(1, finiteNumber(enemy?.projectileRadius, fallback)) * normalizeEnemyScale(enemy?.scale, 1);
}
