import {
    AUTOSAVE_SLOT_ID,
    MANUAL_SAVE_SLOT_IDS,
    SAVE_GAME_SCHEMA,
    SAVE_GAME_SCHEMA_VERSION,
    normalizeSaveGameRecord
} from "../shared/save-game-data.js";

export const SAVE_GAME_STORAGE_PREFIX = "ignatius_rocketfrock_save_v2_";

function storageKey(slotId) {
    return `${SAVE_GAME_STORAGE_PREFIX}${slotId}`;
}

export function loadStoredSaveGame(slotId, storage = globalThis.localStorage) {
    if (!storage || typeof storage.getItem !== "function") return null;
    try {
        const raw = storage.getItem(storageKey(slotId));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed?.schema !== SAVE_GAME_SCHEMA || Number(parsed?.schemaVersion) !== SAVE_GAME_SCHEMA_VERSION) {
            console.warn(`Ignored incompatible Ignatius Rocketfrock save ${slotId}.`);
            return null;
        }
        return normalizeSaveGameRecord(parsed, slotId);
    } catch (error) {
        console.warn(`Could not load Ignatius Rocketfrock save ${slotId}.`, error);
        return null;
    }
}

export function saveStoredSaveGame(slotId, record, storage = globalThis.localStorage) {
    const normalized = normalizeSaveGameRecord({ ...record, slotId }, slotId);
    if (!storage || typeof storage.setItem !== "function") return normalized;
    try {
        storage.setItem(storageKey(slotId), JSON.stringify(normalized));
    } catch (error) {
        console.warn(`Could not save Ignatius Rocketfrock slot ${slotId}.`, error);
    }
    return normalized;
}

export function clearStoredSaveGame(slotId, storage = globalThis.localStorage) {
    if (!storage || typeof storage.removeItem !== "function") return;
    try {
        storage.removeItem(storageKey(slotId));
    } catch (error) {
        console.warn(`Could not clear Ignatius Rocketfrock slot ${slotId}.`, error);
    }
}

export function loadManualSaveGames(storage = globalThis.localStorage) {
    return MANUAL_SAVE_SLOT_IDS.map((slotId) => loadStoredSaveGame(slotId, storage));
}

export function loadStoredAutosave(storage = globalThis.localStorage) {
    return loadStoredSaveGame(AUTOSAVE_SLOT_ID, storage);
}
