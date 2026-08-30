import { DEFAULT_SIGNAL_CHANNEL, normalizeSignalChannel } from "./signal-channel-data.js";

export const MOVING_PLATFORM_MOTION_TYPES = Object.freeze([
    "translate",
    "swing"
]);

export const MIN_MOVING_PLATFORM_SWING_PERIOD = 2;
export const MAX_MOVING_PLATFORM_SWING_AMPLITUDE = 180;
export const MAX_MOVING_PLATFORM_PIVOT_DISTANCE = 800;

export const MOVING_PLATFORM_EASINGS = Object.freeze([
    "linear",
    "easeIn",
    "easeOut",
    "easeInOut"
]);

export const MOVING_PLATFORM_PATTERNS = Object.freeze([
    "shuttle",
    "loopRespawn",
    "vanishRespawn"
]);

export const MOVING_PLATFORM_ACTIVATIONS = Object.freeze([
    "automatic",
    "rider",
    "signal"
]);

export const DEFAULT_MOVING_PLATFORM = Object.freeze({
    version: 2,
    motionType: "translate",
    pattern: "shuttle",
    activation: "automatic",
    signalChannel: DEFAULT_SIGNAL_CHANNEL,
    persistent: false,
    endOffsetX: 0,
    endOffsetY: -240,
    speed: 120,
    easing: "linear",
    angleAmplitude: 30,
    initialAngle: 30,
    swingPeriod: 3,
    pivotX: 0,
    pivotY: 0,
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

function boundedSwingPivot(x, y, fallbackX, fallbackY) {
    let pivotX = finiteNumber(x, fallbackX);
    let pivotY = finiteNumber(y, fallbackY);
    const distance = Math.hypot(pivotX, pivotY);
    if (distance > MAX_MOVING_PLATFORM_PIVOT_DISTANCE && distance > 0.000001) {
        const scale = MAX_MOVING_PLATFORM_PIVOT_DISTANCE / distance;
        pivotX *= scale;
        pivotY *= scale;
    }
    return { pivotX, pivotY };
}

export function movingPlatformHasEndpoint(value) {
    const motionType = typeof value === "object" ? value?.motionType : "translate";
    if (motionType === "swing") return false;
    const pattern = typeof value === "string" ? value : value?.pattern;
    return pattern !== "vanishRespawn";
}

export function movingPlatformUsesFade(value) {
    if (typeof value === "object" && value?.motionType === "swing") return false;
    const pattern = typeof value === "string" ? value : value?.pattern;
    return pattern === "loopRespawn" || pattern === "vanishRespawn";
}

export function movingPlatformEasedProgress(t, easing = "linear") {
    const progress = Math.max(0, Math.min(1, finiteNumber(t, 0)));
    switch (easing) {
        case "easeIn":
            return progress * progress;
        case "easeOut":
            return 1 - (1 - progress) * (1 - progress);
        case "easeInOut":
            return progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        case "linear":
        default:
            return progress;
    }
}

export function movingPlatformSwingStartPhase(value) {
    const movement = normalizeMovingPlatform(value);
    if (!movement || movement.motionType !== "swing" || movement.angleAmplitude <= 0.000001) {
        return Math.PI;
    }
    const ratio = Math.max(-1, Math.min(1, movement.initialAngle / movement.angleAmplitude));
    if (Math.abs(ratio) <= 0.0000001) {
        // Canvas/world positive rotation is clockwise on the y-down screen.
        // Starting at the bottom therefore uses negative angular velocity so
        // the first movement is counter-clockwise, as authored.
        return Math.PI;
    }
    const principal = Math.asin(ratio);
    return ratio > 0 ? Math.PI - principal : principal;
}

export function normalizeMovingPlatform(value, options = {}) {
    if (!value || typeof value !== "object" || value.enabled === false) {
        return null;
    }

    const defaults = {
        ...DEFAULT_MOVING_PLATFORM,
        ...(options.defaults && typeof options.defaults === "object" ? options.defaults : {})
    };
    const requestedMotionType = String(value.motionType || defaults.motionType);
    const motionType = MOVING_PLATFORM_MOTION_TYPES.includes(requestedMotionType)
        ? requestedMotionType
        : defaults.motionType;
    const requestedPattern = String(value.pattern || defaults.pattern);
    const requestedActivation = String(value.activation || defaults.activation);
    const requestedEasing = String(value.easing || defaults.easing);
    const pattern = motionType === "swing"
        ? "shuttle"
        : MOVING_PLATFORM_PATTERNS.includes(requestedPattern)
            ? requestedPattern
            : defaults.pattern;
    const activation = MOVING_PLATFORM_ACTIVATIONS.includes(requestedActivation)
        ? requestedActivation
        : defaults.activation;
    const easing = MOVING_PLATFORM_EASINGS.includes(requestedEasing)
        ? requestedEasing
        : defaults.easing;
    const angleAmplitude = Math.min(
        MAX_MOVING_PLATFORM_SWING_AMPLITUDE,
        nonNegative(value.angleAmplitude, defaults.angleAmplitude)
    );
    const requestedInitialAngle = finiteNumber(value.initialAngle, defaults.initialAngle);
    const pivot = boundedSwingPivot(value.pivotX, value.pivotY, defaults.pivotX, defaults.pivotY);

    return {
        version: 2,
        motionType,
        pattern,
        activation,
        signalChannel: normalizeSignalChannel(value.signalChannel, defaults.signalChannel),
        persistent: value.persistent === true,
        endOffsetX: finiteNumber(value.endOffsetX, defaults.endOffsetX),
        endOffsetY: finiteNumber(value.endOffsetY, defaults.endOffsetY),
        speed: Math.max(1, finiteNumber(value.speed, defaults.speed)),
        easing,
        angleAmplitude,
        initialAngle: Math.max(-angleAmplitude, Math.min(angleAmplitude, requestedInitialAngle)),
        swingPeriod: Math.max(MIN_MOVING_PLATFORM_SWING_PERIOD, finiteNumber(value.swingPeriod, defaults.swingPeriod)),
        pivotX: pivot.pivotX,
        pivotY: pivot.pivotY,
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
        x: startX + (normalized?.motionType === "translate" ? normalized.endOffsetX : 0),
        y: startY + (normalized?.motionType === "translate" ? normalized.endOffsetY : 0)
    };
}
