export const SAVE_GAME_SCHEMA = "ignatius.saveGame";
export const SAVE_GAME_SCHEMA_VERSION = 2;
export const MANUAL_SAVE_SLOT_IDS = Object.freeze(["slot1", "slot2", "slot3"]);
export const AUTOSAVE_SLOT_ID = "autosave";

function normalizedString(value, fallback = "") {
    const text = String(value ?? "").trim();
    return text || fallback;
}

function normalizedLevelId(value, fallback = "level_001") {
    const match = /^level_(\d+)$/i.exec(normalizedString(value));
    if (!match) return fallback;
    return `level_${match[1].padStart(3, "0")}`;
}

function normalizedSlotId(value, fallback = "slot1") {
    const candidate = normalizedString(value).toLowerCase();
    return candidate === AUTOSAVE_SLOT_ID || MANUAL_SAVE_SLOT_IDS.includes(candidate)
        ? candidate
        : fallback;
}

function normalizedTimestamp(value) {
    const date = new Date(value || 0);
    return Number.isFinite(date.getTime()) ? date.toISOString() : new Date(0).toISOString();
}

function normalizedScore(value) {
    const score = Number(value);
    return Number.isFinite(score) ? Math.max(0, Math.trunc(score)) : 0;
}

export function normalizeSaveGameRecord(value = {}, fallbackSlotId = "slot1") {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const levelId = normalizedLevelId(source.levelId, "level_001");
    return {
        schema: SAVE_GAME_SCHEMA,
        schemaVersion: SAVE_GAME_SCHEMA_VERSION,
        slotId: normalizedSlotId(source.slotId, normalizedSlotId(fallbackSlotId)),
        savedAt: normalizedTimestamp(source.savedAt),
        levelId,
        levelTitle: normalizedString(source.levelTitle, levelId.replace("_", " ")),
        checkpointId: normalizedString(source.checkpointId),
        checkpointLabel: normalizedString(source.checkpointLabel, "Level start"),
        score: normalizedScore(source.score),
        campaign: source.campaign && typeof source.campaign === "object" && !Array.isArray(source.campaign)
            ? structuredClone(source.campaign)
            : {}
    };
}

export function createSaveGameRecord({
    slotId,
    levelId,
    levelTitle,
    checkpointId = "",
    checkpointLabel = "Level start",
    score = 0,
    campaign = {},
    savedAt = new Date().toISOString()
} = {}) {
    return normalizeSaveGameRecord({
        slotId,
        levelId,
        levelTitle,
        checkpointId,
        checkpointLabel,
        score,
        campaign,
        savedAt
    }, slotId);
}

export function saveGameSlotLabel(slotId) {
    const normalized = normalizedSlotId(slotId);
    if (normalized === AUTOSAVE_SLOT_ID) return "Autosave";
    return `Slot ${MANUAL_SAVE_SLOT_IDS.indexOf(normalized) + 1}`;
}

export function describeSaveGameRecord(record) {
    const save = normalizeSaveGameRecord(record, record?.slotId);
    const checkpoint = save.checkpointLabel || (save.checkpointId ? save.checkpointId : "Level start");
    return `${save.levelTitle}\n${checkpoint}\n${new Date(save.savedAt).toLocaleString()}`;
}
