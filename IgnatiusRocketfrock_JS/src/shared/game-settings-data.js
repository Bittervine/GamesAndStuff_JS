// Product-development switch. This is intentionally independent from build
// mode and the user-facing developmentMode setting. Keep enabled until the
// product itself is ready to stop surfacing intrusive diagnostic alerts.
export const DEVELOPMENT = true;

export const GAME_INPUT_ACTIONS = Object.freeze([
    Object.freeze({ id: "up", label: "Up", advanced: false }),
    Object.freeze({ id: "down", label: "Down (slam)", advanced: false }),
    Object.freeze({ id: "left", label: "Left", advanced: false }),
    Object.freeze({ id: "right", label: "Right", advanced: false }),
    Object.freeze({ id: "fire", label: "Fire", advanced: false }),
    Object.freeze({ id: "lunge", label: "Lunge", advanced: false }),
    Object.freeze({ id: "pause", label: "Pause", advanced: false }),
    Object.freeze({ id: "upLeft", label: "Up + Left", advanced: true }),
    Object.freeze({ id: "upRight", label: "Up + Right", advanced: true }),
    Object.freeze({ id: "downLeft", label: "Down + Left", advanced: true }),
    Object.freeze({ id: "downRight", label: "Down + Right", advanced: true })
]);

const GAME_INPUT_ACTION_IDS = new Set(GAME_INPUT_ACTIONS.map((action) => action.id));

export const DEFAULT_INPUT_BINDINGS = Object.freeze({
    up: Object.freeze(["keyboard:ArrowUp", "keyboard:KeyW", "gamepad:south", "gamepad:dpadUp"]),
    down: Object.freeze(["keyboard:ArrowDown", "keyboard:KeyS", "gamepad:dpadDown"]),
    left: Object.freeze(["keyboard:ArrowLeft", "keyboard:KeyA", "gamepad:dpadLeft"]),
    right: Object.freeze(["keyboard:ArrowRight", "keyboard:KeyD", "gamepad:dpadRight"]),
    fire: Object.freeze([
        "keyboard:KeyF", "keyboard:ControlLeft", "keyboard:ControlRight",
        "gamepad:east", "gamepad:leftShoulder", "gamepad:rightShoulder", "gamepad:leftTrigger", "gamepad:rightTrigger"
    ]),
    lunge: Object.freeze(["keyboard:KeyX", "keyboard:AltLeft", "keyboard:AltRight", "keyboard:ShiftLeft", "keyboard:ShiftRight", "gamepad:west"]),
    pause: Object.freeze(["keyboard:Space", "gamepad:back"]),
    upLeft: Object.freeze([]),
    upRight: Object.freeze([]),
    downLeft: Object.freeze([]),
    downRight: Object.freeze([])
});

function cloneDefaultInputBindings() {
    return Object.fromEntries(GAME_INPUT_ACTIONS.map((action) => [action.id, [...DEFAULT_INPUT_BINDINGS[action.id]]]));
}

function validInputBindingToken(value) {
    const token = String(value || "").trim();
    if (!token || token === "keyboard:Escape") return "";
    if (token.startsWith("keyboard:")) return token.length > "keyboard:".length ? token : "";
    if (token.startsWith("gamepad:")) return token.length > "gamepad:".length ? token : "";
    return "";
}

export function normalizeInputBindings(value = null) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return cloneDefaultInputBindings();
    }
    const normalized = Object.fromEntries(GAME_INPUT_ACTIONS.map((action) => [action.id, []]));
    const claimed = new Set();
    for (const action of GAME_INPUT_ACTIONS) {
        const sourceBindings = Array.isArray(value[action.id]) ? value[action.id] : [];
        for (const rawBinding of sourceBindings) {
            const binding = validInputBindingToken(rawBinding);
            if (!binding || claimed.has(binding)) continue;
            normalized[action.id].push(binding);
            claimed.add(binding);
        }
    }
    return normalized;
}

export function assignInputBinding(bindings, actionId, binding, replaceBinding = "") {
    if (!GAME_INPUT_ACTION_IDS.has(actionId)) return normalizeInputBindings(bindings);
    const token = validInputBindingToken(binding);
    if (!token) return normalizeInputBindings(bindings);
    const normalized = normalizeInputBindings(bindings);
    for (const action of GAME_INPUT_ACTIONS) {
        normalized[action.id] = normalized[action.id].filter((candidate) => candidate !== token);
    }
    const target = normalized[actionId];
    const replaceIndex = replaceBinding ? target.indexOf(replaceBinding) : -1;
    if (replaceIndex >= 0) target.splice(replaceIndex, 1, token);
    else target.push(token);
    return normalizeInputBindings(normalized);
}

export function removeInputBinding(bindings, actionId, binding) {
    if (!GAME_INPUT_ACTION_IDS.has(actionId)) return normalizeInputBindings(bindings);
    const normalized = normalizeInputBindings(bindings);
    normalized[actionId] = normalized[actionId].filter((candidate) => candidate !== binding);
    return normalizeInputBindings(normalized);
}

export const GAME_DIFFICULTY_PRESETS = Object.freeze([
    Object.freeze({ id: "easy", label: "Easy", damageScale: 1 }),
    Object.freeze({ id: "normal", label: "Normal", damageScale: 2 }),
    Object.freeze({ id: "hard", label: "Hard", damageScale: 4 })
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
    version: 12,
    sfxVolume: 0.8,
    musicVolume: 0.1,
    difficulty: "normal",
    renderingQuality: "medium",
    fullscreen: true,
    showMinimap: true,
    renderingMode: "hardwareRegular",
    developmentMode: true,
    inputBindings: DEFAULT_INPUT_BINDINGS,
    tuningOverrides: Object.freeze({})
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
        inputBindings: normalizeInputBindings(source.inputBindings),
        tuningOverrides: source.tuningOverrides && typeof source.tuningOverrides === "object" && !Array.isArray(source.tuningOverrides)
            ? { ...source.tuningOverrides }
            : {},
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
