import { ANIMATION_TRANSFORM_PROPERTIES } from "./animation-editor.js";

const PROPERTY_ORDER = new Map(
    ANIMATION_TRANSFORM_PROPERTIES.map((property, index) => [property, index])
);

export function animationDopesheetRows(rawClip, minimumKeyframes = 2) {
    const minimum = Math.max(1, Math.floor(Number(minimumKeyframes) || 1));
    const rows = [];

    for (const [partName, partTracks] of Object.entries(rawClip?.tracks || {})) {
        if (!partTracks || typeof partTracks !== "object" || Array.isArray(partTracks)) {
            continue;
        }
        for (const [property, track] of Object.entries(partTracks)) {
            if (!ANIMATION_TRANSFORM_PROPERTIES.includes(property) || !Array.isArray(track) || track.length < minimum) {
                continue;
            }
            const keys = track
                .map((key, index) => ({
                    index,
                    time: Number(key?.time),
                    value: Number(key?.value),
                    easing: String(key?.easing || "linear")
                }))
                .filter((key) => Number.isFinite(key.time))
                .sort((a, b) => a.time - b.time || a.index - b.index);
            if (keys.length < minimum) {
                continue;
            }
            rows.push({
                partName,
                property,
                keyCount: keys.length,
                keys
            });
        }
    }

    return rows.sort((a, b) => {
        const partOrder = a.partName.localeCompare(b.partName);
        if (partOrder !== 0) {
            return partOrder;
        }
        const aOrder = PROPERTY_ORDER.get(a.property) ?? Number.MAX_SAFE_INTEGER;
        const bOrder = PROPERTY_ORDER.get(b.property) ?? Number.MAX_SAFE_INTEGER;
        return aOrder - bOrder || a.property.localeCompare(b.property);
    });
}
