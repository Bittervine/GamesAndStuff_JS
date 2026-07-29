export const CHARACTER_SOUND_SLOTS = Object.freeze(["attack", "hurt", "death"]);

export function normalizeCharacterSoundReference(value) {
    const reference = String(value || "").trim().replace(/\\/g, "/");
    return reference.toLowerCase().endsWith(".wav") ? reference : "";
}

export function normalizeCharacterSounds(value) {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const sounds = {};
    for (const slot of CHARACTER_SOUND_SLOTS) {
        const reference = normalizeCharacterSoundReference(source[slot]);
        if (reference) sounds[slot] = reference;
    }
    return sounds;
}

export function characterSoundReference(value, slot) {
    return normalizeCharacterSounds(value)[String(slot || "").trim().toLowerCase()] || "";
}
