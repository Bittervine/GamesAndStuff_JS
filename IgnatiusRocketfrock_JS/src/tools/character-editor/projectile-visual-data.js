function cleanText(value) {
    return String(value ?? "").trim();
}

export function projectileVisualHandoffOptions(character, rig) {
    const parts = rig?.parts && typeof rig.parts === "object" ? rig.parts : {};
    const authored = Array.isArray(character?.attackParts)
        ? character.attackParts.map(cleanText).filter(Boolean)
        : (cleanText(character?.attackPart) ? [cleanText(character.attackPart)] : []);
    const candidates = authored.length
        ? authored
        : Object.keys(parts).filter((partName) => {
            const handoff = parts[partName]?.attackHandoff;
            return handoff && typeof handoff === "object" && handoff.enabled !== false;
        });

    const byFrame = new Map();
    for (const partName of candidates) {
        const part = parts[partName];
        const handoff = part?.attackHandoff;
        if (!part || !handoff || typeof handoff !== "object" || handoff.enabled === false) continue;
        const frameId = cleanText(part.frame);
        if (!frameId) continue;
        const existing = byFrame.get(frameId);
        if (existing) {
            existing.partNames.push(partName);
        } else {
            byFrame.set(frameId, { frameId, partNames: [partName] });
        }
    }

    return [...byFrame.values()].map((entry) => ({
        ...entry,
        label: entry.partNames.length === 1
            ? `${entry.frameId} (${entry.partNames[0]})`
            : `${entry.frameId} (${entry.partNames.join(", ")})`
    }));
}

export function projectileVisualMode(defaults, character, rig) {
    const visualCharacterId = cleanText(defaults?.projectileVisualCharacterId);
    const visualFrameId = cleanText(defaults?.projectileVisualFrameId);
    if (!visualCharacterId && !visualFrameId) return "kind";

    const currentCharacterId = cleanText(character?.characterId);
    if (currentCharacterId && visualCharacterId === currentCharacterId && visualFrameId) {
        const handoffFrames = projectileVisualHandoffOptions(character, rig);
        if (handoffFrames.some((entry) => entry.frameId === visualFrameId)) return "handoff";
    }
    return "custom";
}
