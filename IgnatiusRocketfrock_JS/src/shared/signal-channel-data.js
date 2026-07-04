export const DEFAULT_SIGNAL_CHANNEL = "A";

export const SIGNAL_EMITTER_TYPES = Object.freeze([
    "leverSwitch",
    "keyholeSwitch"
]);

export const SIGNAL_EMITTER_INTERACTIONS = Object.freeze([
    "toggle",
    "keyhole"
]);

export const SIGNAL_RECEIVER_TYPES = Object.freeze([
    "spikedGate",
    "hangingGate"
]);

export function normalizeSignalChannel(value, fallback = DEFAULT_SIGNAL_CHANNEL) {
    const fallbackText = String(fallback ?? DEFAULT_SIGNAL_CHANNEL).trim() || DEFAULT_SIGNAL_CHANNEL;
    const text = String(value ?? "").trim();
    return (text || fallbackText).slice(0, 64);
}

export function isSignalEmitterEntity(entity) {
    if (!entity || typeof entity !== "object") return false;
    const type = String(entity.type || "");
    const interaction = String(entity.interaction || "");
    return SIGNAL_EMITTER_TYPES.includes(type) || SIGNAL_EMITTER_INTERACTIONS.includes(interaction);
}

export function isSignalReceiverEntity(entity) {
    if (!entity || typeof entity !== "object") return false;
    const type = String(entity.type || "");
    return SIGNAL_RECEIVER_TYPES.includes(type) || entity.signalReceiver === true;
}

export function normalizeSignalReceiver(entity) {
    if (!isSignalReceiverEntity(entity)) return null;
    const width = Math.max(1, finiteNumber(entity.w ?? entity.width, 96));
    const height = Math.max(1, finiteNumber(entity.h ?? entity.height, 180));
    const collisionWidth = Math.max(1, finiteNumber(entity.collisionWidth, width));
    const collisionHeight = Math.max(1, finiteNumber(entity.collisionHeight, height));
    return {
        id: String(entity.id || ""),
        type: String(entity.type || "signalReceiver"),
        channel: normalizeSignalChannel(entity.channel),
        x: finiteNumber(entity.x, 0),
        y: finiteNumber(entity.y, 0),
        width,
        height,
        collisionWidth,
        collisionHeight,
        collisionOffsetX: finiteNumber(entity.collisionOffsetX, 0),
        collisionOffsetY: finiteNumber(entity.collisionOffsetY, 0),
        blocksPlayer: entity.blocksPlayer !== false,
        collisionInsetX: Math.max(0, finiteNumber(entity.collisionInsetX, collisionWidth * 0.16)),
        collisionInsetTop: Math.max(0, finiteNumber(entity.collisionInsetTop, 4)),
        collisionInsetBottom: Math.max(0, finiteNumber(entity.collisionInsetBottom, 0)),
        closedState: String(entity.closedState || "closed"),
        openState: String(entity.openState || "open"),
        invertSignal: entity.invertSignal === true
    };
}

export function normalizeSignalEmitter(entity) {
    if (!isSignalEmitterEntity(entity)) return null;
    const type = String(entity.type || "");
    const interaction = type === "keyholeSwitch" || entity.interaction === "keyhole"
        ? "keyhole"
        : "toggle";
    return {
        id: String(entity.id || ""),
        type: type || (interaction === "keyhole" ? "keyholeSwitch" : "leverSwitch"),
        interaction,
        channel: normalizeSignalChannel(entity.channel),
        triggerDistance: Math.max(8, finiteNumber(entity.triggerDistance, 72)),
        requiredKey: interaction === "keyhole" ? String(entity.requiredKey || "ironKey") : "",
        consumeKey: interaction === "keyhole" ? entity.consumeKey !== false : false,
        oneShot: interaction === "keyhole" ? entity.oneShot !== false : false
    };
}

function finiteNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}
