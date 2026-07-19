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

export const GAME_RENDERING_MODE_PRESETS = Object.freeze([
    Object.freeze({
        id: "hardwareRegular",
        label: "Hardware regular",
        detail: "WebGL2",
        useHardwareRendering: true,
        usePixmapPyramids: true,
        bakingMode: "off"
    }),
    Object.freeze({
        id: "hardwareSpeedhack",
        label: "Hardware + speedhack",
        detail: "WebGL2 + baked tiles",
        useHardwareRendering: true,
        usePixmapPyramids: true,
        bakingMode: "tiles"
    }),
    Object.freeze({
        id: "softwareRegular",
        label: "Software regular",
        detail: "Canvas2D + pixmap pyramids",
        useHardwareRendering: false,
        usePixmapPyramids: true,
        bakingMode: "off"
    }),
    Object.freeze({
        id: "softwareSpeedhack",
        label: "Software + speedhack",
        detail: "Canvas2D + baked tiles + pixmap pyramids",
        useHardwareRendering: false,
        usePixmapPyramids: true,
        bakingMode: "tiles"
    })
]);

export const DEFAULT_GAME_SETTINGS = Object.freeze({
    version: 10,
    sfxVolume: 0.8,
    musicVolume: 0.1,
    difficulty: "normal",
    renderingQuality: "medium",
    fullscreen: true,
    showMinimap: true,
    renderingMode: "hardwareRegular",
    developmentMode: true
});

function clamp01(value, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(0, Math.min(1, number));
}

function normalizedBoolean(value, fallback) {
    return typeof value === "boolean" ? value : fallback;
}

function presetId(value, presets, fallback) {
    const candidate = String(value || "").trim().toLowerCase();
    const preset = presets.find((entry) => entry.id.toLowerCase() === candidate);
    return preset?.id || fallback;
}

export function gameRenderingModePreset(settingsOrId) {
    const id = typeof settingsOrId === "string"
        ? presetId(settingsOrId, GAME_RENDERING_MODE_PRESETS, DEFAULT_GAME_SETTINGS.renderingMode)
        : normalizeGameSettings(settingsOrId).renderingMode;
    return GAME_RENDERING_MODE_PRESETS.find((preset) => preset.id === id) || GAME_RENDERING_MODE_PRESETS[0];
}

export function normalizeGameSettings(value = {}) {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const renderingMode = presetId(
        source.renderingMode,
        GAME_RENDERING_MODE_PRESETS,
        DEFAULT_GAME_SETTINGS.renderingMode
    );
    const mode = GAME_RENDERING_MODE_PRESETS.find((preset) => preset.id === renderingMode) || GAME_RENDERING_MODE_PRESETS[0];
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
        fullscreen: normalizedBoolean(source.fullscreen, DEFAULT_GAME_SETTINGS.fullscreen),
        showMinimap: normalizedBoolean(source.showMinimap, DEFAULT_GAME_SETTINGS.showMinimap),
        renderingMode,
        developmentMode: normalizedBoolean(source.developmentMode, DEFAULT_GAME_SETTINGS.developmentMode),
        useHardwareRendering: mode.useHardwareRendering,
        usePixmapPyramids: mode.usePixmapPyramids,
        bakingMode: mode.bakingMode
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
