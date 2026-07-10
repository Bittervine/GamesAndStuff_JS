import { DEFAULT_GAME_SETTINGS, normalizeGameSettings } from "../shared/game-settings-data.js";

export const GAME_SETTINGS_STORAGE_KEY = "ignatius_rocketfrock_game_settings_v1";

function migrateStoredGameSettings(value) {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const version = Number(source.version) || 1;
    let migrated = source;
    if (version < 3 && Number(source.musicVolume) === 0.6) {
        migrated = {
            ...migrated,
            version: 4,
            musicVolume: DEFAULT_GAME_SETTINGS.musicVolume
        };
    }
    // Revision 499 replaces the legacy baked-layer checkbox with an enum.
    // Explicit old opt-in maps to Full so existing test profiles keep the same
    // renderer; all other old profiles migrate to the safe Off default.
    if (version < 8) {
        migrated = {
            ...migrated,
            version: 8,
            bakingMode: typeof source.bakingMode === "string"
                ? source.bakingMode
                : (source.useBakedLayers === true ? "full" : "off")
        };
    }
    return migrated;
}

export function loadStoredGameSettings(storage = globalThis.localStorage) {
    if (!storage || typeof storage.getItem !== "function") {
        return normalizeGameSettings(DEFAULT_GAME_SETTINGS);
    }
    try {
        const raw = storage.getItem(GAME_SETTINGS_STORAGE_KEY);
        return raw
            ? normalizeGameSettings(migrateStoredGameSettings(JSON.parse(raw)))
            : normalizeGameSettings(DEFAULT_GAME_SETTINGS);
    } catch (error) {
        console.warn("Could not load Ignatius Rocketfrock settings; defaults will be used.", error);
        return normalizeGameSettings(DEFAULT_GAME_SETTINGS);
    }
}

export function saveStoredGameSettings(settings, storage = globalThis.localStorage) {
    const normalized = normalizeGameSettings(settings);
    if (!storage || typeof storage.setItem !== "function") {
        return normalized;
    }
    try {
        storage.setItem(GAME_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
        console.warn("Could not save Ignatius Rocketfrock settings.", error);
    }
    return normalized;
}
