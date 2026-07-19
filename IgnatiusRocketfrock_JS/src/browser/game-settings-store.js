import { DEFAULT_GAME_SETTINGS, normalizeGameSettings } from "../shared/game-settings-data.js";

export const GAME_SETTINGS_STORAGE_KEY = "ignatius_rocketfrock_game_settings_v2";

export function loadStoredGameSettings(storage = globalThis.localStorage) {
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

export function saveStoredGameSettings(settings, storage = globalThis.localStorage) {
    const normalized = normalizeGameSettings(settings);
    if (!storage || typeof storage.setItem !== "function") return normalized;
    try {
        storage.setItem(GAME_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
        console.warn("Could not save Ignatius Rocketfrock settings.", error);
    }
    return normalized;
}
