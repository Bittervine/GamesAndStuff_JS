export const MOVING_PLATFORM_PATTERNS = Object.freeze([
    "shuttle",
    "loopRespawn",
    "vanishRespawn"
]);

export const MOVING_PLATFORM_ACTIVATIONS = Object.freeze([
    "automatic",
    "rider"
]);

export const DEFAULT_MOVING_PLATFORM = Object.freeze({
    version: 1,
    pattern: "shuttle",
    activation: "automatic",
    endOffsetX: 0,
    endOffsetY: -240,
    speed: 120,
    initialDelay: 0,
    triggerDelay: 0.35,
    startPause: 0.75,
    endPause: 0.75,
    fadeDuration: 0.2,
    hiddenDuration: 1.25
});

function finiteNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function nonNegative(value, fallback) {
    return Math.max(0, finiteNumber(value, fallback));
}

export function movingPlatformHasEndpoint(value) {
    const pattern = typeof value === "string" ? value : value?.pattern;
    return pattern !== "vanishRespawn";
}

export function movingPlatformUsesFade(value) {
    const pattern = typeof value === "string" ? value : value?.pattern;
    return pattern === "loopRespawn" || pattern === "vanishRespawn";
}

export function normalizeMovingPlatform(value, options = {}) {
    if (!value || typeof value !== "object" || value.enabled === false) {
        return null;
    }

    const defaults = {
        ...DEFAULT_MOVING_PLATFORM,
        ...(options.defaults && typeof options.defaults === "object" ? options.defaults : {})
    };
    const requestedPattern = String(value.pattern || defaults.pattern);
    const requestedActivation = typeof value.activation === "object"
        ? String(value.activation.type || defaults.activation)
        : String(value.activation || defaults.activation);
    const pattern = MOVING_PLATFORM_PATTERNS.includes(requestedPattern)
        ? requestedPattern
        : defaults.pattern;
    const activation = MOVING_PLATFORM_ACTIVATIONS.includes(requestedActivation)
        ? requestedActivation
        : defaults.activation;

    return {
        version: 1,
        pattern,
        activation,
        endOffsetX: finiteNumber(value.endOffsetX ?? value.endOffset?.x, defaults.endOffsetX),
        endOffsetY: finiteNumber(value.endOffsetY ?? value.endOffset?.y, defaults.endOffsetY),
        speed: Math.max(1, finiteNumber(value.speed, defaults.speed)),
        initialDelay: nonNegative(value.initialDelay, defaults.initialDelay),
        triggerDelay: nonNegative(value.triggerDelay, defaults.triggerDelay),
        startPause: nonNegative(value.startPause, defaults.startPause),
        endPause: nonNegative(value.endPause, defaults.endPause),
        fadeDuration: nonNegative(value.fadeDuration, defaults.fadeDuration),
        hiddenDuration: Math.max(0.05, finiteNumber(value.hiddenDuration, defaults.hiddenDuration))
    };
}

export function createDefaultMovingPlatform(overrides = {}) {
    return normalizeMovingPlatform({
        ...DEFAULT_MOVING_PLATFORM,
        ...overrides
    });
}

export function movingPlatformEndPosition(placement, movement = placement?.movement) {
    const normalized = normalizeMovingPlatform(movement);
    const startX = finiteNumber(placement?.x, 0);
    const startY = finiteNumber(placement?.y, 0);
    return {
        x: startX + (normalized?.endOffsetX || 0),
        y: startY + (normalized?.endOffsetY || 0)
    };
}
