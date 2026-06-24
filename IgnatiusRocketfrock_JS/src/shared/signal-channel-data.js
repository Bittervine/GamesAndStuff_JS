export const DEFAULT_SIGNAL_CHANNEL = "A";

export const SIGNAL_EMITTER_TYPES = Object.freeze([
    "leverSwitch",
    "keyholeSwitch"
]);

export const SIGNAL_EMITTER_INTERACTIONS = Object.freeze([
    "toggle",
    "keyhole"
]);

export function normalizeSignalChannel(value, fallback = DEFAULT_SIGNAL_CHANNEL) {
    const fallbackText = String(fallback ?? DEFAULT_SIGNAL_CHANNEL).trim() || DEFAULT_SIGNAL_CHANNEL;
    const text = String(value ?? "").trim();
    return (text || fallbackText).slice(0, 64);
}

export function isSignalEmitterEntity(entity) {
    if (!entity || typeof entity !== "object") return false;
    const type = String(entity.type || entity.kind || "");
    const interaction = String(entity.interaction || "");
    return SIGNAL_EMITTER_TYPES.includes(type) || SIGNAL_EMITTER_INTERACTIONS.includes(interaction);
}

export function normalizeSignalEmitter(entity) {
    if (!isSignalEmitterEntity(entity)) return null;
    const type = String(entity.type || entity.kind || "");
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
