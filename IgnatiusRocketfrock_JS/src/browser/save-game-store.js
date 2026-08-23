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

function resolvedStorage(storage) {
    if (storage !== undefined) return storage;
    try {
        return globalThis.localStorage;
    } catch (error) {
        console.warn("Ignatius Rocketfrock browser storage is unavailable.", error);
        return null;
    }
}

export function loadStoredSaveGame(slotId, storage) {
    storage = resolvedStorage(storage);
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

export function saveStoredSaveGame(slotId, record, storage) {
    const normalized = normalizeSaveGameRecord({ ...record, slotId }, slotId);
    storage = resolvedStorage(storage);
    if (!storage || typeof storage.setItem !== "function") return null;
    try {
        storage.setItem(storageKey(slotId), JSON.stringify(normalized));
        return normalized;
    } catch (error) {
        console.warn(`Could not save Ignatius Rocketfrock slot ${slotId}.`, error);
        return null;
    }
}

export function clearStoredSaveGame(slotId, storage) {
    storage = resolvedStorage(storage);
    if (!storage || typeof storage.removeItem !== "function") return;
    try {
        storage.removeItem(storageKey(slotId));
    } catch (error) {
        console.warn(`Could not clear Ignatius Rocketfrock slot ${slotId}.`, error);
    }
}

export function loadManualSaveGames(storage) {
    const resolved = resolvedStorage(storage);
    return MANUAL_SAVE_SLOT_IDS.map((slotId) => loadStoredSaveGame(slotId, resolved));
}

export function loadStoredAutosave(storage) {
    return loadStoredSaveGame(AUTOSAVE_SLOT_ID, resolvedStorage(storage));
}
