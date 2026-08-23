import { DEFAULT_GAME_SETTINGS, normalizeGameSettings } from "../shared/game-settings-data.js";

export const GAME_SETTINGS_STORAGE_KEY = "ignatius_rocketfrock_game_settings_v2";

function resolvedStorage(storage) {
    if (storage !== undefined) return storage;
    try {
        return globalThis.localStorage;
    } catch (error) {
        console.warn("Ignatius Rocketfrock settings storage is unavailable.", error);
        return null;
    }
}

export function loadStoredGameSettings(storage) {
    storage = resolvedStorage(storage);
    if (!storage || typeof storage.getItem !== "function") {
        return normalizeGameSettings(DEFAULT_GAME_SETTINGS);
    }
    try {
        const raw = storage.getItem(GAME_SETTINGS_STORAGE_KEY);
        return raw ? normalizeGameSettings(JSON.parse(raw)) : normalizeGameSettings(DEFAULT_GAME_SETTINGS);
    } catch (error) {
        console.warn("Could not load Ignatius Rocketfrock settings; defaults will be used.", error);
        return normalizeGameSettings(DEFAULT_GAME_SETTINGS);
    }
}

export function saveStoredGameSettings(settings, storage) {
    const normalized = normalizeGameSettings(settings);
    storage = resolvedStorage(storage);
    if (!storage || typeof storage.setItem !== "function") return normalized;
    try {
        storage.setItem(GAME_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
        console.warn("Could not save Ignatius Rocketfrock settings.", error);
    }
    return normalized;
}
