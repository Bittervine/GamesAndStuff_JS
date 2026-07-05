export const GAME_DIFFICULTY_PRESETS = Object.freeze([
    Object.freeze({ id: "easy", label: "Easy", damageScale: 0.75 }),
    Object.freeze({ id: "normal", label: "Normal", damageScale: 1 }),
    Object.freeze({ id: "hard", label: "Hard", damageScale: 1.5 })
]);

export const GAME_RENDERING_QUALITY_PRESETS = Object.freeze([
    Object.freeze({ id: "low", label: "Low", particleScale: 0.5 }),
    Object.freeze({ id: "medium", label: "Medium", particleScale: 1 }),
    Object.freeze({ id: "high", label: "High", particleScale: 1.5 })
]);

export const DEFAULT_GAME_SETTINGS = Object.freeze({
    version: 5,
    sfxVolume: 0.8,
    musicVolume: 0.1,
    difficulty: "normal",
    renderingQuality: "medium",
    autoFullscreen: true,
    showMinimap: true,
    useHardwareRendering: false,
    usePixmapPyramids: true
});

function clamp01(value, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        return fallback;
    }
    return Math.max(0, Math.min(1, number));
}

function normalizedBoolean(value, fallback) {
    return typeof value === "boolean" ? value : fallback;
}

function presetId(value, presets, fallback) {
    const candidate = String(value || "").trim().toLowerCase();
    return presets.some((preset) => preset.id === candidate) ? candidate : fallback;
}

export function normalizeGameSettings(value = {}) {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    return {
        version: DEFAULT_GAME_SETTINGS.version,
        sfxVolume: clamp01(source.sfxVolume, DEFAULT_GAME_SETTINGS.sfxVolume),
        musicVolume: clamp01(source.musicVolume, DEFAULT_GAME_SETTINGS.musicVolume),
        difficulty: presetId(source.difficulty, GAME_DIFFICULTY_PRESETS, DEFAULT_GAME_SETTINGS.difficulty),
        renderingQuality: presetId(
            source.renderingQuality,
            GAME_RENDERING_QUALITY_PRESETS,
            DEFAULT_GAME_SETTINGS.renderingQuality
        ),
        autoFullscreen: normalizedBoolean(source.autoFullscreen, DEFAULT_GAME_SETTINGS.autoFullscreen),
        showMinimap: normalizedBoolean(source.showMinimap, DEFAULT_GAME_SETTINGS.showMinimap),
        useHardwareRendering: normalizedBoolean(source.useHardwareRendering, DEFAULT_GAME_SETTINGS.useHardwareRendering),
        usePixmapPyramids: normalizedBoolean(source.usePixmapPyramids, DEFAULT_GAME_SETTINGS.usePixmapPyramids)
    };
}

export function gameDifficultyPreset(settingsOrId) {
    const id = typeof settingsOrId === "string"
        ? settingsOrId
        : normalizeGameSettings(settingsOrId).difficulty;
    return GAME_DIFFICULTY_PRESETS.find((preset) => preset.id === id) || GAME_DIFFICULTY_PRESETS[1];
}

export function gameRenderingQualityPreset(settingsOrId) {
    const id = typeof settingsOrId === "string"
        ? settingsOrId
        : normalizeGameSettings(settingsOrId).renderingQuality;
    return GAME_RENDERING_QUALITY_PRESETS.find((preset) => preset.id === id) || GAME_RENDERING_QUALITY_PRESETS[1];
}

export function difficultyDamageScale(settingsOrId) {
    return gameDifficultyPreset(settingsOrId).damageScale;
}

export function renderingParticleScale(settingsOrId) {
    return gameRenderingQualityPreset(settingsOrId).particleScale;
}
