const VALID_UPGRADE_KINDS = new Set(["healthUpgrade", "fuelUpgrade", "regenUpgrade", "speedUpgrade"]);

function finiteNumber(value, fallback = 0) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
}

function cleanString(value) {
    return String(value || "").trim();
}

export function normalizeEnemyDropEntry(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const itemId = cleanString(raw.itemId || raw.item || raw.id);
    if (!itemId) return null;
    return {
        itemId,
        chance: Math.max(0, Math.min(1, finiteNumber(raw.chance, 1)))
    };
}

export function normalizeCharacterDropProfile(character) {
    const source = character && typeof character === "object" ? character : {};
    const drops = Array.isArray(source.drops)
        ? source.drops.map(normalizeEnemyDropEntry).filter(Boolean)
        : [];
    return { drops };
}

export function normalizeLootItem(raw, itemId = "") {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const id = cleanString(itemId || raw.itemId || raw.id);
    if (!id) return null;
    const upgradeKind = cleanString(raw.upgradeKind);
    const kind = upgradeKind && VALID_UPGRADE_KINDS.has(upgradeKind)
        ? "upgrade"
        : (cleanString(raw.kind) || "item");
    const width = Math.max(1, finiteNumber(raw.width ?? raw.w, kind === "score" ? 52 : 68));
    const height = Math.max(1, finiteNumber(raw.height ?? raw.h, kind === "score" ? 52 : 88));
    return {
        itemId: id,
        kind,
        pickupKind: cleanString(raw.pickupKind || upgradeKind || id),
        upgradeKind: VALID_UPGRADE_KINDS.has(upgradeKind) ? upgradeKind : "",
        amount: Math.max(1, Math.floor(finiteNumber(raw.amount, 1))),
        scoreValue: Math.max(0, Math.floor(finiteNumber(raw.scoreValue, 0))),
        atlasId: cleanString(raw.atlasId || "it_atlas_001"),
        assetId: cleanString(raw.assetId),
        width,
        height,
        radius: Math.max(4, finiteNumber(raw.radius, Math.min(width, height) * 0.42)),
        dropOffsetY: Math.max(0, finiteNumber(raw.dropOffsetY, 0)),
        bob: raw.bob !== false
    };
}

export function normalizeLootCatalog(raw) {
    const source = raw && typeof raw === "object" ? raw : {};
    const items = {};
    for (const [itemId, item] of Object.entries(source.items || {})) {
        const normalized = normalizeLootItem(item, itemId);
        if (normalized) items[normalized.itemId] = normalized;
    }
    return { items };
}
