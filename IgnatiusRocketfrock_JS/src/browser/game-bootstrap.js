import {
    FIXED_DT,
    DEFAULT_TUNING,
    createInitialGameState,
    createInputFrame,
    createSubstepInputFrame,
    stepSimulation,
    preparePresentationFrame,
    readPresentationSnapDiagnostics,
    snapPresentationSubject,
    applyAtlasManifestsToWorld,
    applyEditorLevelToWorld,
    applyEnemyDefinitionCatalog,
    applyCharacterCombatProfiles,
    applyCharacterDropProfiles,
    applyLootCatalog,
    teleportPlayer,
    resetPlayer,
    cloneGameState,
    serializeGameState,
    syncEnemyTuningHealthScales,
    normalizePlayerProgression,
    applyPlayerProgression,
    defaultNextLevelId,
    addEvent,
    recordDebugExceptionAlert
} from "../core/simulation.js";
import { RocketfrockInput } from "./browser-input.js";
import { GamepadHaptics } from "./gamepad-haptics.js";
import { createRenderer } from "../presentation/canvas-renderer.js";
import { createTitleCardAnimator } from "../presentation/title-card-animation.js";
import { normalizeCaveWindow } from "../shared/cave-window-data.js";
import { collectLevelEnemyCharacterIds } from "../shared/auto-spawn-enemy-data.js";
import {
    DEVELOPMENT,
    DEFAULT_INPUT_BINDINGS,
    GAME_INPUT_ACTIONS,
    assignInputBinding,
    gameDifficultyPreset,
    gameRenderingModePreset,
    gameRenderingQualityPreset,
    normalizeGameSettings,
    removeInputBinding
} from "../shared/game-settings-data.js";
import { loadStoredGameSettings, saveStoredGameSettings } from "./game-settings-store.js";
import {
    DOUBLE_JUMP_PHYSICS_CONSISTENT_APEX,
    DOUBLE_JUMP_PHYSICS_FIXED_IMPULSE,
    applyGameTuningValues,
    createGameTuningOverrides,
    loadInstalledGameTuning,
    normalizeGameTuningOverrides,
    resolveGameTuning
} from "../shared/game-tuning-data.js";
import {
    AUTOSAVE_SLOT_ID,
    MANUAL_SAVE_SLOT_IDS,
    createSaveGameRecord,
    saveGameSlotLabel
} from "../shared/save-game-data.js";
import {
    loadManualSaveGames,
    loadStoredAutosave,
    loadStoredSaveGame,
    saveStoredSaveGame
} from "./save-game-store.js";
import { normalizeLevelMusic, normalizeMusicCatalog } from "../shared/music-data.js";
import { powerUpHudLabel, shortestRemainingActivePowerUpEffect } from "../shared/power-up-data.js";
import { createMusicDirector } from "./music-director.js";
import { createSoundEffectsDirector } from "./sound-effects-director.js";
import {
    detectElectronWindowBridge,
    readFullscreenState,
    setFullscreenState
} from "./electron-window-bridge.js";
import { calculateHudPanelScale } from "./hud-panel-layout.js";
import { computeFullscreenPresentationMetrics } from "../shared/fullscreen-presentation-data.js";
import { MicroStutterProfiler } from "./micro-stutter-profiler.js";
import {
    commitGameplayRecordingFrame,
    createGameplayRecording,
    createGameplayRecordingFrame,
    finalizeGameplayRecording,
    inputFrameFromSnapshot,
    normalizeGameplayRecording,
    normalizeLaunchLevelQuery,
    playbackUrlFromQueryValue,
    recordingFrameDtSeconds,
    sanitizeRecordingFilename,
    snapshotGameplayDebug
} from "./gameplay-recording.js";
import { ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER } from "../shared/experimental-renderer-flags.js";
import { resourceUrl } from "../shared/resource-paths.js";
import {
    CREDITS_RESOURCE_PATH,
    CREDITS_SCROLL_PIXELS_PER_SECOND,
    isCreditsDestinationLevel,
    parseCreditsMarkdown
} from "../shared/credits-data.js";
import { shownTransformOf } from "../shared/presentation-transform-data.js";
import {
    computeMinimapGeometry,
    minimapPointInsideGameplayPerimeter,
    minimapTeleportAllowed,
    minimapTeleportDestination
} from "../presentation/minimap-data.js";
import { BrowserGameplayRecordingSpool } from "./gameplay-recording-spool.js";
import { applyBuildRevisionToDocument } from "../shared/build-revision.js";

const canvas = document.getElementById("stage");
const fuelText = document.getElementById("fuel-text");
const fuelFill = document.getElementById("fuel-fill");
const healthText = document.getElementById("health-text");
const healthFill = document.getElementById("health-fill");
const levelTitleText = document.getElementById("level-title-text");
const scoreText = document.getElementById("score-text");
const powerText = document.getElementById("power-text");
const powerTime = document.getElementById("power-time");
const powerFill = document.getElementById("power-fill");
const bossHud = document.getElementById("boss-hud");
const bossName = document.getElementById("boss-name");
const bossHealthText = document.getElementById("boss-health-text");
const bossHealthFill = document.getElementById("boss-health-fill");
const debugEl = document.getElementById("debug");
const eventFilterEl = document.getElementById("event-filter");
const assetGuidesButton = document.getElementById("toggle-asset-guides");
const puppetGuideButton = document.getElementById("toggle-puppet-guide");
const debugPanelButton = document.getElementById("toggle-debug-panel");
const helpPanelButton = document.getElementById("toggle-help-panel");
const microProfilerButton = document.getElementById("toggle-micro-profiler");
const gameplayRecordingButton = document.getElementById("toggle-gameplay-recording");
const gameplayPlaybackButton = document.getElementById("load-gameplay-playback");
const gameplayPlaybackFileInput = document.getElementById("gameplay-playback-file");
const helpPanel = document.getElementById("help-panel");
const toolLinks = document.getElementById("tool-links");
const loadingScreen = document.getElementById("loading-screen");
const loadingPercent = document.getElementById("loading-percent");
const loadingTrack = document.getElementById("loading-track");
const loadingBarFill = document.getElementById("loading-bar-fill");
const loadingDetail = document.getElementById("loading-detail");
const startupStudioSplash = document.getElementById("startup-studio-splash");
const startupStudioLogo = document.getElementById("startup-studio-logo");
const titleScreen = document.getElementById("title-screen");
const titleCardArt = document.getElementById("title-card-art");
const creditsScreen = document.getElementById("credits-screen");
const creditsTrack = document.getElementById("credits-track");
const titleActions = document.getElementById("title-actions");
const titleStartButton = document.getElementById("title-start-button");
const titleResumeButton = document.getElementById("title-resume-button");
const titleLoadButton = document.getElementById("title-load-button");
const titleSettingsButton = document.getElementById("title-settings-button");
const titleExitDesktopButton = document.getElementById("title-exit-desktop-button");
const titleActionButtons = [titleStartButton, titleResumeButton, titleLoadButton, titleSettingsButton, titleExitDesktopButton].filter(Boolean);
let titleCardAnimator = null;
if (titleCardArt instanceof HTMLCanvasElement) {
    void createTitleCardAnimator(titleCardArt)
        .then((animator) => { titleCardAnimator = animator; })
        .catch((error) => { console.warn("Unable to initialize animated title card.", error); });
}
const hudPanelGroup = document.getElementById("hud");
const metersPanel = document.getElementById("meters");
const minimapPanel = document.getElementById("game-menu-controls");
const minimapCanvas = document.getElementById("minimap-canvas");
const minimapContext = minimapCanvas?.getContext?.("2d") || null;
const openGameMenuButton = document.getElementById("open-game-menu");
const fullscreenToggleButton = document.getElementById("fullscreen-toggle");
const gameMenuDialog = document.getElementById("game-menu-dialog");
const gameMenuTitle = document.getElementById("game-menu-title");
const gameMenuSubtitle = document.getElementById("game-menu-subtitle");
const gameMenuBackButton = document.getElementById("game-menu-back");
const gameMenuMain = document.getElementById("game-menu-main");
const gameSettingsPanel = document.getElementById("game-settings-panel");
const gameSaveSlotsPanel = document.getElementById("game-save-slots-panel");
const gameSaveSlotButtons = [...document.querySelectorAll("[data-save-slot]")];
const gameMenuSaveButton = document.getElementById("game-menu-save");
const gameMenuLoadButton = document.getElementById("game-menu-load");
const gameMenuSettingsButton = document.getElementById("game-menu-settings");
const gameMenuExitTitleButton = document.getElementById("game-menu-exit-title");
const sfxVolumeInput = document.getElementById("sfx-volume");
const sfxVolumeValue = document.getElementById("sfx-volume-value");
const musicVolumeInput = document.getElementById("music-volume");
const musicVolumeValue = document.getElementById("music-volume-value");
const difficultyValue = document.getElementById("difficulty-value");
const difficultyButtons = [...document.querySelectorAll("[data-difficulty]")];
const renderingQualityValue = document.getElementById("rendering-quality-value");
const renderingQualityButtons = [...document.querySelectorAll("[data-rendering-quality]")];
const fullscreenInput = document.getElementById("fullscreen-setting");
const showMinimapInput = document.getElementById("show-minimap");
const renderingModeValue = document.getElementById("rendering-mode-value");
const renderingModeStatus = document.getElementById("rendering-mode-status");
const renderingModeSelect = document.getElementById("rendering-mode-select");
const controlsSettingsButton = document.getElementById("controls-settings-button");
const gameControlsPanel = document.getElementById("game-controls-panel");
const controlBindingsMain = document.getElementById("control-bindings-main");
const controlBindingsAdvanced = document.getElementById("control-bindings-advanced");
const controlBindingsAdvancedToggle = document.getElementById("control-bindings-advanced-toggle");
const controlBindingsResetButton = document.getElementById("control-bindings-reset");
const developmentFeaturesButton = document.getElementById("development-features-button");
const gameDevelopmentPanel = document.getElementById("game-development-panel");
const developmentAssetGuidesInput = document.getElementById("development-asset-guides");
const developmentCameraLineInput = document.getElementById("development-camera-line");
const developmentEnemyGuideInput = document.getElementById("development-enemy-guide");
const developmentDebugPanelInput = document.getElementById("development-debug-panel");
const developmentDebugLoggingInput = document.getElementById("development-debug-logging");
const developmentGameTuningButton = document.getElementById("development-game-tuning");
const gameTuningPanel = document.getElementById("game-tuning-panel");
const tuningRunSpeedInput = document.getElementById("tuning-run-speed");
const tuningRunSpeedValue = document.getElementById("tuning-run-speed-value");
const tuningLungeSpeedInput = document.getElementById("tuning-lunge-speed");
const tuningLungeSpeedValue = document.getElementById("tuning-lunge-speed-value");
const tuningJumpHeightInput = document.getElementById("tuning-jump-height");
const tuningJumpHeightValue = document.getElementById("tuning-jump-height-value");
const tuningGravityInput = document.getElementById("tuning-gravity");
const tuningGravityValue = document.getElementById("tuning-gravity-value");
const tuningRocketDamageInput = document.getElementById("tuning-rocket-damage");
const tuningRocketDamageValue = document.getElementById("tuning-rocket-damage-value");
const tuningRocketDurationInput = document.getElementById("tuning-rocket-duration");
const tuningRocketDurationValue = document.getElementById("tuning-rocket-duration-value");
const tuningDoubleJumpPhysicsSelect = document.getElementById("tuning-double-jump-physics");
const tuningResetButton = document.getElementById("tuning-reset");
const developmentRecordingButton = document.getElementById("development-recording");
const developmentPlaybackButton = document.getElementById("development-playback");

const GAME_REVISION = await applyBuildRevisionToDocument();
const START_LEVEL_ID = "level_001";
const launchParams = new URLSearchParams(window.location.search || "");
const launchLevelSpecified = launchParams.has("level");
const launchLevelQuery = launchParams.get("level");
const launchLevelId = launchLevelSpecified
    ? normalizeLaunchLevelQuery(launchLevelQuery, "")
    : START_LEVEL_ID;
const launchEditorPlaytest = launchParams.get("playtest_browser_copy") === "1";
const launchRecordRequested = ["1", "true", "on", "yes"].includes(String(launchParams.get("record") || "").trim().toLowerCase());
const launchPlaybackUrl = playbackUrlFromQueryValue(launchParams.get("playback"));
const launchPlaybackPauseAtSec = finiteNonNegativeNumber(launchParams.get("playback_pause"), null);
const STARTUP_STUDIO_SPLASH_FADE_IN_MS = 500;
const STARTUP_STUDIO_SPLASH_HOLD_MS = 2000;
const STARTUP_STUDIO_SPLASH_FADE_OUT_MS = 500;
const STARTUP_STUDIO_SPLASH_TOTAL_MS = STARTUP_STUDIO_SPLASH_FADE_IN_MS
    + STARTUP_STUDIO_SPLASH_HOLD_MS
    + STARTUP_STUDIO_SPLASH_FADE_OUT_MS;
const pendingStartupExceptionAlerts = [];
const MAX_GAMEPLAY_RECORDING_BLOB_FALLBACK_BYTES = 32 * 1024 * 1024;
let fatalRuntimeFailure = false;
let fatalRuntimeMessage = "";
let fatalRuntimePanel = null;

if (launchLevelSpecified && !launchLevelId) {
    failStartup(`Requested launch level "${String(launchLevelQuery || "").trim()}" is invalid. Expected level_###, a numeric level id, or level_temp for a Level Editor playtest.`);
}

async function loadBundledProximityTextFonts() {
    if (!document.fonts?.load) return;
    await Promise.allSettled([
        document.fonts.load("700 16px 'Ignatius Inter'"),
        document.fonts.load("700 16px 'Ignatius Caveat'")
    ]);
}

const assetUrl = resourceUrl;

let displayedLoadingProgress = 0;
let activeCaveWindow = normalizeCaveWindow(null);
let renderer;
const electronWindowBridge = detectElectronWindowBridge(window);
const storedGameSettings = loadStoredGameSettings();
const installedGameTuning = await loadInstalledGameTuning({
    fallback: DEFAULT_TUNING,
    onException: (incident) => pendingStartupExceptionAlerts.push(incident)
});
storedGameSettings.tuningOverrides = normalizeGameTuningOverrides(
    storedGameSettings.tuningOverrides,
    installedGameTuning
);
let launchPlaybackRecording = null;
if (launchPlaybackUrl) {
    showLoadingScreen("Loading gameplay recording", 0.01);
    launchPlaybackRecording = await loadHostedGameplayRecording(launchPlaybackUrl);
}
let gameState = launchPlaybackRecording?.initialState
    ? cloneGameState(launchPlaybackRecording.initialState)
    : createInitialGameState({
        settings: storedGameSettings,
        tuning: resolveGameTuning(installedGameTuning, storedGameSettings.tuningOverrides),
        randomSeed: launchPlaybackRecording?.initial?.randomSeed || browserRandomSeed()
    });
gameState.settings = normalizeGameSettings(gameState.settings);
for (const incident of pendingStartupExceptionAlerts.splice(0)) {
    recordDebugExceptionAlert(gameState, incident);
}
const musicBaseUrl = resourceUrl("music/");
const soundEffectsBaseUrl = resourceUrl("");
const musicDirector = createMusicDirector({ volume: gameState.settings.musicVolume, baseUrl: musicBaseUrl });
const soundEffectsDirector = createSoundEffectsDirector({ volume: gameState.settings.sfxVolume, baseUrl: soundEffectsBaseUrl });
let musicCatalog = normalizeMusicCatalog(null);
let lootCatalog = { items: {}, pools: {} };
let activeLevelMusic = normalizeLevelMusic(null);
let gameMenuView = "menu";
let controlBindingCapture = null;
let controlBindingsAdvancedOpen = false;
let saveSlotMode = "load";
let gameMenuPreviousPause = false;
let pageFocusLost = document.hidden;
let effectiveSfxVolume = pageFocusLost ? 0 : gameState.settings.sfxVolume;
let fullscreenActive = false;
let fullscreenRequestPending = false;
let stopElectronFullscreenListener = null;
let titleScreenActive = true;
let startupStudioSplashActive = false;
let creditsActive = false;
let creditsElapsedSeconds = 0;
let creditsHeldGamepadButtons = new Set();
let gameHasStarted = false;
let minimapResizeObserver = null;
let minimapLastDrawAt = -Infinity;
let minimapLastSizeKey = "";
let hudPanelScale = 1;
let enemyDefinitionCatalog = { enemies: {} };
let staticBakeFailureNoticeKey = "";
let activeNoticeOverlay = null;
const preferWebGL2Renderer = shouldPreferWebGL2Renderer();
const activePixmapPyramids = Boolean(gameState.settings.usePixmapPyramids);
let activeHardwareRendering = false;
let activeBakingMode = gameState.settings.bakingMode;
const hudBackdropBlurDisabled = shouldDisableHudBackdropBlur();
document.documentElement.classList.toggle("dev-no-hud-blur", hudBackdropBlurDisabled);
gameState.debug.revision = GAME_REVISION;
addEvent(gameState, `BUILD_REVISION_${GAME_REVISION}`);
const input = new RocketfrockInput(window, gameState.settings.inputBindings);
const gamepadHaptics = new GamepadHaptics();
gamepadHaptics.prime(gameState.debug.lastEvents);
showLoadingScreen("Loading bundled text fonts", 0.015);
await loadBundledProximityTextFonts();
showLoadingScreen("Loading level data", 0.02);
try {
    await loadEnemyDefinitionCatalog();
    await loadLootCatalog();
} catch (error) {
    failStartup(`Required gameplay catalogs could not be loaded: ${error?.message || error}`, error);
}
await loadMusicCatalog();
await soundEffectsDirector.load(assetUrl("sfx/sound-effects.json")).catch((error) => console.warn("Sound effects unavailable:", error));
const loadedBrowserCopy = !launchPlaybackRecording && !launchLevelSpecified && maybeApplyBrowserCopyLevel();
if (launchPlaybackRecording?.initialState?.world?.levelId) {
    syncPresentationFromWorldState();
} else if (!loadedBrowserCopy) {
    await applyRequiredLevel(launchLevelId);
}
setLoadingProgress(0.1, "Level data ready");
try {
    renderer = await createRenderer(canvas, {
        preferWebGL2: preferWebGL2Renderer,
        usePixmapPyramids: gameState.settings.usePixmapPyramids,
        environmentAtlasManifestUrls: gameState.world.atlasManifests,
        enemyCharacterUrls: requiredEnemyCharacterProjectUrls(gameState.world),
        onStaticBakeFailure: handleStaticBakeRendererFailure,
        onRecoverableException: (incident) => recordDebugExceptionAlert(gameState, incident),
        onProgress: ({ progress, label }) => {
            setLoadingProgress(0.1 + clamp01(progress) * 0.85, label);
        }
    });
} catch (error) {
    failStartup(`Game assets could not be loaded: ${error.message}`, error);
}
activeHardwareRendering = String(renderer.getPerformanceDiagnostics?.().backend || "").startsWith("webgl2");
renderer.syncCaveWindow(activeCaveWindow);
syncLoadedCharacterCombatProfiles();
if (!applyLoadedAtlasCollisions()) {
    failStartup("Required atlas collision data could not be applied. Check resources/atlases/at_atlas_001.json and the level atlasRefs.");
}
// Build any level-wide recoloured atlas copies once during level startup. The
// render loop only compares the cache key and uses ordinary drawImage calls.
setLoadingProgress(0.965, preferWebGL2Renderer ? "Uploading persistent renderer textures" : "Preparing environment textures");
renderer.syncEnvironmentColorMap(gameState.world.colorMap, gameState.world.colorExchange);
setLoadingProgress(0.98, "Prewarming level foreground textures");
renderer.prewarmLevelPresentationCaches?.(gameState.world);
setLoadingProgress(0.99, "Preparing the first frame");
let accumulator = 0;
let lastRafNow = performance.now();
let lastCallbackArrivalNow = performance.now();
let lastInputFrame = createInputFrame();
let devSingleStepArmed = false;
const hudRenderCache = Object.create(null);
let levelTransitionLoading = false;
const microStutterProfiler = new MicroStutterProfiler();
let updateMicroProfilerControls = () => {};
let updateGameplayRecordingControls = () => {};
let updateGameplayPlaybackControls = () => {};
let updateDebugLoggingControls = () => {};
let gameplayRecording = null;
let gameplayRecordingClockSec = 0;
let gameplayRecordingFrameIndex = 0;
let gameplayRecordingSpool = null;
let gameplayLastRecordingSpool = null;
const gameplayRetainedRecordings = new Map();
const gameplayRecordingSaveTasks = new Map();
let gameplayPlayback = null;
let gameplayDebugLog = null;
let gameplayDebugLogLastSampleMs = 0;
let processedDebugExceptionSequence = 0;
let debugExceptionAlertActive = false;
let debugExceptionAlertFilename = "";
let debugExceptionAlertSummary = "";

await recoverRetainedGameplayRecordings();
setupPanelToggleButtons();
setupTitleScreen();
setupMinimap();
setupGameMenuAndSettings();
setLoadingProgress(1, "Ready");
const shouldAutoStartGameplay = loadedBrowserCopy || launchLevelSpecified || launchRecordRequested;
const shouldShowStartupStudioSplash = !launchPlaybackRecording && !shouldAutoStartGameplay;
startupStudioSplashActive = shouldShowStartupStudioSplash;
showTitleScreen();
if (launchPlaybackRecording) {
    await startGameplayPlayback(launchPlaybackRecording, {
        source: launchPlaybackUrl,
        pauseAtSec: launchPlaybackPauseAtSec,
        restoreInitialState: true
    });
} else if (shouldAutoStartGameplay) {
    startGameFromTitle();
    if (launchRecordRequested) {
        startGameplayRecording("launch-query");
    }
}
await nextPaint();
hideLoadingScreen();
if (shouldShowStartupStudioSplash) {
    await playStartupStudioSplash();
}

function browserRandomSeed() {
    if (globalThis.crypto?.getRandomValues) {
        const seed = new Uint32Array(1);
        globalThis.crypto.getRandomValues(seed);
        if (seed[0]) return seed[0];
    }
    return (Math.floor(Date.now() ^ performance.now() * 1000) >>> 0) || 0x1a2b3c4d;
}

function finiteNonNegativeNumber(value, fallback = null) {
    if (value == null || value === "") return fallback;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
}

async function loadHostedGameplayRecording(url) {
    try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`${response.status}`);
        }
        return normalizeGameplayRecording(await response.json());
    } catch (error) {
        failStartup(`Gameplay recording could not be loaded: ${url}.`, error);
    }
}

function syncPresentationFromWorldState() {
    activeCaveWindow = normalizeCaveWindow(gameState.world?.caveWindow);
    activeLevelMusic = normalizeLevelMusic(gameState.world?.music);
    renderer?.syncCaveWindow(activeCaveWindow);
    musicDirector?.setTrack(activeLevelMusic.trackId);
}

function clamp01(value) {
    return Math.max(0, Math.min(1, Number(value) || 0));
}

function shouldDisableHudBackdropBlur() {
    const params = new URLSearchParams(window.location.search || "");
    const rawValue = params.get("hudblur") ?? params.get("backdrop");
    return rawValue != null && ["0", "false", "off", "none"].includes(String(rawValue).trim().toLowerCase());
}

function shouldPreferWebGL2Renderer() {
    const params = new URLSearchParams(window.location.search || "");
    const rawValue = params.get("webgl") ?? params.get("webgl2");
    if (rawValue != null) {
        const value = String(rawValue).trim().toLowerCase();
        if (["0", "false", "off", "canvas", "canvas2d", "cpu"].includes(value)) {
            return false;
        }
        return ["1", "true", "on", "webgl", "webgl2", "gpu"].includes(value);
    }
    return Boolean(gameState.settings?.useHardwareRendering);
}

function startMicroStutterProfiler(options = {}) {
    const status = microStutterProfiler.start(options);
    renderer?.setStaticTileDiagnosticsEnabled?.(true);
    return status;
}

function stopMicroStutterProfiler() {
    const status = microStutterProfiler.stop();
    renderer?.setStaticTileDiagnosticsEnabled?.(false);
    return status;
}

function microStutterProfilerExtra() {
    const rendererStats = renderer?.getPerformanceDiagnostics?.() || null;
    return {
        revision: GAME_REVISION,
        levelId: gameState.world?.levelId || START_LEVEL_ID,
        renderer: rendererStats,
        settings: {
            difficulty: gameState.settings?.difficulty || "normal",
            renderingQuality: gameState.settings?.renderingQuality || "medium",
            useHardwareRendering: Boolean(gameState.settings?.useHardwareRendering),
            developmentMode: Boolean(gameState.settings?.developmentMode),
            usePixmapPyramids: Boolean(gameState.settings?.usePixmapPyramids),
            bakingMode: gameState.settings?.bakingMode || "off"
        },
        camera: {
            currentX: Number(gameState.camera?.currentTransform?.x) || 0,
            currentY: Number(gameState.camera?.currentTransform?.y) || 0,
            shownX: Number(gameState.camera?.shownTransform?.x) || 0,
            shownY: Number(gameState.camera?.shownTransform?.y) || 0,
            viewportWidth: Number(gameState.camera?.viewportWidth) || 0,
            viewportHeight: Number(gameState.camera?.viewportHeight) || 0
        }
    };
}

function downloadMicroStutterProfile(filename = "") {
    const text = microStutterProfiler.exportJson(microStutterProfilerExtra());
    const safeName = String(filename || `ignatius_microstutter_rev${GAME_REVISION}_${Date.now()}.json`).replace(/[^a-z0-9_.-]+/gi, "_");
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    return { filename: safeName, bytes: text.length };
}

async function copyMicroStutterProfileToClipboard() {
    const text = microStutterProfiler.exportJson(microStutterProfilerExtra());
    window.__rocketfrockLastMicroStutterProfile = text;
    if (!navigator.clipboard?.writeText) {
        console.log("Micro-stutter profile clipboard export is unavailable; JSON is available as window.__rocketfrockLastMicroStutterProfile.");
        throw new Error("Clipboard export is not available in this browser context.");
    }
    await navigator.clipboard.writeText(text);
    return { bytes: text.length, samples: microStutterProfiler.status().capturedFrames };
}

function startGameplayRecording(source = "manual") {
    if (gameplayPlayback?.active) {
        console.warn("Gameplay recording is disabled while playback is active.");
        return null;
    }
    if (gameplayRecording) return gameplayRecording;

    try {
        gameplayRecording = createGameplayRecording({
            revision: GAME_REVISION,
            levelId: gameState.world?.levelId || START_LEVEL_ID,
            initialState: cloneGameState(gameState),
            settings: normalizeGameSettings(gameState.settings),
            source,
            retainFrames: false
        });
        gameplayRecordingClockSec = 0;
        gameplayRecordingFrameIndex = 0;
        gameplayRecordingSpool = new BrowserGameplayRecordingSpool({
            recordingId: `rev${GAME_REVISION}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            recording: gameplayRecording
        });
        window.__rocketfrockLastGameplayRecording = gameplayRecording;
        window.__rocketfrockLastGameplayRecordingJson = "";
        addEvent(gameState, "GAMEPLAY_RECORDING_STARTED", { source, levelId: gameplayRecording.levelId });
        updateGameplayRecordingControls("Recording gameplay to bounded browser storage. Click again to stop and save JSON.");
        updateGameplayPlaybackControls();
        return gameplayRecording;
    } catch (error) {
        if (gameplayRecordingSpool) void gameplayRecordingSpool.discard();
        gameplayRecording = null;
        gameplayRecordingSpool = null;
        console.warn("Gameplay recording could not start; gameplay will continue.", error);
        recordDebugExceptionAlert(gameState, {
            type: "gameplayRecordingStartFailure",
            error: String(error?.message || error),
            message: "Gameplay recording could not start; gameplay continued without recording"
        });
        updateGameplayRecordingControls("Recording could not start; gameplay is unaffected.");
        updateGameplayPlaybackControls();
        return null;
    }
}

function stopGameplayRecording(reason = "manual", { save = true } = {}) {
    if (!gameplayRecording) {
        updateGameplayRecordingControls();
        return null;
    }
    const finished = finalizeGameplayRecording(gameplayRecording, { reason });
    const spool = gameplayRecordingSpool;
    gameplayRecording = null;
    gameplayRecordingSpool = null;
    gameplayRecordingClockSec = 0;
    gameplayRecordingFrameIndex = 0;
    window.__rocketfrockLastGameplayRecording = finished;
    rememberGameplayRecordingSpool(finished, spool, "retained");
    updateGameplayRecordingControls(`Recording stopped: ${finished.summary.frames} frame${finished.summary.frames === 1 ? "" : "s"}.`);
    updateGameplayPlaybackControls();
    addEvent(gameState, "GAMEPLAY_RECORDING_STOPPED", { reason, frames: finished.summary.frames });
    if (save) {
        void saveGameplayRecordingJson(finished, spool);
    } else if (spool) {
        forgetGameplayRecordingSpool(spool);
        void spool.discard();
    }
    return finished;
}

function stopGameplayRecordingAfterFailure(message, error = null) {
    const spool = gameplayRecordingSpool;
    const frames = Math.max(0, Math.floor(Number(gameplayRecording?.summary?.frames) || 0));
    gameplayRecording = null;
    gameplayRecordingSpool = null;
    gameplayRecordingClockSec = 0;
    gameplayRecordingFrameIndex = 0;
    if (spool) void spool.discard();
    console.warn(message, error || "");
    recordDebugExceptionAlert(gameState, {
        type: "gameplayRecordingStorageFailure",
        error: String(error?.message || error || ""),
        frames,
        message
    });
    updateGameplayRecordingControls(`${message} Gameplay is unaffected.`);
    updateGameplayPlaybackControls();
    addEvent(gameState, "GAMEPLAY_RECORDING_STOPPED", { reason: "storage-failure", frames });
}

function rememberGameplayRecordingSpool(recording, spool, state = "retained") {
    if (!spool) return;
    gameplayRetainedRecordings.set(spool.recordingId, { recording, spool, state });
    gameplayLastRecordingSpool = spool;
}

function forgetGameplayRecordingSpool(spool) {
    if (!spool) return;
    gameplayRetainedRecordings.delete(spool.recordingId);
    if (gameplayLastRecordingSpool === spool) {
        const retained = [...gameplayRetainedRecordings.values()];
        gameplayLastRecordingSpool = retained.length ? retained[retained.length - 1].spool : null;
        if (gameplayLastRecordingSpool) {
            const recovered = gameplayRetainedRecordings.get(gameplayLastRecordingSpool.recordingId);
            if (recovered?.recording) window.__rocketfrockLastGameplayRecording = recovered.recording;
        }
    }
}

function releaseGameplayRecordingSpool(spool) {
    if (!spool) return;
    forgetGameplayRecordingSpool(spool);
    void spool.discard();
}

async function recoverRetainedGameplayRecordings() {
    try {
        const recovered = await BrowserGameplayRecordingSpool.recoverRetainedRecordings();
        for (const item of recovered) {
            try {
                await item.spool.markState("retained", item.recording);
            } catch (error) {
                console.warn("Recovered gameplay recording metadata could not be refreshed.", error);
            }
            gameplayRetainedRecordings.set(item.spool.recordingId, {
                recording: item.recording,
                spool: item.spool,
                state: "retained"
            });
        }
        const latest = recovered[recovered.length - 1] || null;
        if (latest) {
            gameplayLastRecordingSpool = latest.spool;
            window.__rocketfrockLastGameplayRecording = latest.recording;
            window.__rocketfrockLastGameplayRecordingJson = "";
            console.info(`Recovered ${recovered.length} retained gameplay recording${recovered.length === 1 ? "" : "s"} from browser storage.`);
        }
    } catch (error) {
        console.warn("Retained gameplay recordings could not be recovered; gameplay is unaffected.", error);
    }
}

function recordGameplayFrame({ requestedAtMs, callbackArrivalMs, callbackEntryGapMs, rafGapMs, realDt, inputFrame, fixedSteps, accumulatorMs, interpolationBlend }) {
    if (!gameplayRecording || !gameplayRecordingSpool) return;
    try {
        gameplayRecordingClockSec += Math.max(0, Number(realDt) || 0);
        const frame = createGameplayRecordingFrame(gameplayRecording, {
            index: gameplayRecordingFrameIndex,
            recordingTimeSec: gameplayRecordingClockSec,
            gameTimeSec: gameState.clock?.time || 0,
            tick: gameState.clock?.tick || 0,
            requestedAtMs,
            callbackArrivalMs,
            callbackEntryGapMs,
            rafGapMs,
            realDtMs: realDt * 1000,
            fixedSteps,
            accumulatorMs,
            interpolationBlend,
            input: inputFrame,
            debug: snapshotGameplayDebug(gameState)
        });
        if (!frame || !gameplayRecordingSpool.enqueueFrame(frame)) {
            const status = gameplayRecordingSpool.status();
            stopGameplayRecordingAfterFailure(
                "Gameplay recording stopped because bounded browser storage could not accept another frame.",
                status.error ? new Error(status.error) : null
            );
            return;
        }
        commitGameplayRecordingFrame(gameplayRecording, frame);
        gameplayRecordingFrameIndex += 1;
    } catch (error) {
        stopGameplayRecordingAfterFailure(
            "Gameplay recording stopped after an allocation or serialization failure.",
            error
        );
    }
}

function startGameplayDebugLogging(source = "development-menu") {
    if (gameplayDebugLog) {
        updateDebugLoggingControls();
        return gameplayDebugLog;
    }
    gameplayDebugLog = {
        startedAtIso: new Date().toISOString(),
        source,
        rows: [JSON.stringify({
            type: "debugLogStart",
            revision: GAME_REVISION,
            levelId: gameState.world?.levelId || START_LEVEL_ID,
            startedAtIso: new Date().toISOString(),
            source,
            settings: normalizeGameSettings(gameState.settings)
        })]
    };
    gameplayDebugLogLastSampleMs = 0;
    updateDebugLoggingControls("Debug logging is collecting one structured snapshot per second.");
    addEvent(gameState, "DEBUG_LOGGING_STARTED", { source });
    return gameplayDebugLog;
}

function appendGameplayDebugLogSample(nowMs) {
    if (!gameplayDebugLog) return;
    const sampleMs = Number(nowMs) || performance.now();
    if (gameplayDebugLogLastSampleMs > 0 && sampleMs - gameplayDebugLogLastSampleMs < 1000) return;
    gameplayDebugLogLastSampleMs = sampleMs;
    gameplayDebugLog.rows.push(JSON.stringify({
        type: "runtimeSnapshot",
        revision: GAME_REVISION,
        sampledAtIso: new Date().toISOString(),
        sampledAtMs: sampleMs,
        levelId: gameState.world?.levelId || START_LEVEL_ID,
        gameTimeSec: Number(gameState.clock?.time) || 0,
        tick: Number(gameState.clock?.tick) || 0,
        debug: snapshotGameplayDebug(gameState),
        renderer: renderer?.getPerformanceDiagnostics?.() || null,
        recording: Boolean(gameplayRecording),
        playback: Boolean(gameplayPlayback?.active)
    }));
}

function stopGameplayDebugLogging(reason = "development-menu", { save = true } = {}) {
    if (!gameplayDebugLog) {
        updateDebugLoggingControls();
        return null;
    }
    const finished = gameplayDebugLog;
    finished.rows.push(JSON.stringify({
        type: "debugLogStop",
        revision: GAME_REVISION,
        stoppedAtIso: new Date().toISOString(),
        reason,
        snapshots: Math.max(0, finished.rows.length - 1)
    }));
    gameplayDebugLog = null;
    gameplayDebugLogLastSampleMs = 0;
    const text = `${finished.rows.join("\n")}\n`;
    const safeLevel = sanitizeRecordingFilename(gameState.world?.levelId || START_LEVEL_ID, START_LEVEL_ID).replace(/\.json$/i, "");
    const filename = sanitizeRecordingFilename(`ignatius_debug_rev${GAME_REVISION}_${safeLevel}_${Date.now()}.ndjson`);
    window.__rocketfrockLastDebugLog = text;
    if (save) downloadTextFile(filename, text, "application/x-ndjson");
    updateDebugLoggingControls(save
        ? `Downloaded ${Math.max(0, finished.rows.length - 2)} debug snapshots as ${filename}.`
        : "Debug logging stopped.");
    addEvent(gameState, "DEBUG_LOGGING_STOPPED", { reason, save });
    return { filename, text, rows: finished.rows.length };
}

function toggleGameplayDebugLogging(source = "development-menu") {
    return gameplayDebugLog
        ? stopGameplayDebugLogging(source)
        : startGameplayDebugLogging(source);
}

function processDebugExceptionAlerts() {
    const latestSequence = Number(gameState.debug?.exceptionAlertSequence) || 0;
    if (latestSequence < processedDebugExceptionSequence) {
        processedDebugExceptionSequence = 0;
    }
    if (latestSequence <= processedDebugExceptionSequence) return;
    const pending = (Array.isArray(gameState.debug?.exceptionAlerts) ? gameState.debug.exceptionAlerts : [])
        .filter((incident) => (Number(incident?.sequence) || 0) > processedDebugExceptionSequence)
        .sort((left, right) => (Number(left?.sequence) || 0) - (Number(right?.sequence) || 0));
    if (!pending.length) return;

    const safeLevel = sanitizeRecordingFilename(gameState.world?.levelId || START_LEVEL_ID, START_LEVEL_ID)
        .replace(/\.json$/i, "");
    const filename = sanitizeRecordingFilename(
        `ignatius_exception_rev${GAME_REVISION}_${safeLevel}_tick${gameState.clock?.tick || 0}_${Date.now()}.ndjson`
    );
    const header = {
        type: "ignatius.exceptionLog",
        revision: GAME_REVISION,
        levelId: gameState.world?.levelId || START_LEVEL_ID,
        createdAtIso: new Date().toISOString(),
        development: DEVELOPMENT,
        platform: "browser"
    };
    const rows = pending.map((incident) => ({
        ...incident,
        type: "debugException",
        exceptionType: incident.type || "unknown",
        revision: GAME_REVISION,
        levelId: gameState.world?.levelId || START_LEVEL_ID,
        capturedAtIso: new Date().toISOString(),
        debug: snapshotGameplayDebug(gameState),
        renderer: renderer?.getPerformanceDiagnostics?.() || null
    }));
    const text = `${[header, ...rows].map((row) => JSON.stringify(row)).join("\n")}\n`;
    window.__rocketfrockLastExceptionLog = text;
    window.__rocketfrockLastExceptionLogFilename = filename;
    downloadTextFile(filename, text, "application/x-ndjson");

    processedDebugExceptionSequence = Math.max(
        processedDebugExceptionSequence,
        ...pending.map((incident) => Number(incident?.sequence) || 0)
    );
    const lastIncident = pending[pending.length - 1];
    debugExceptionAlertFilename = filename;
    debugExceptionAlertSummary = String(lastIncident.message ||
        `${lastIncident.exceptionType || lastIncident.type || "runtime exception"}: ${lastIncident.resourceUrl || lastIncident.enemyId || "unexpected fallback"}`);

    if (DEVELOPMENT && debugEl) {
        debugExceptionAlertActive = true;
        debugEl.hidden = false;
        debugEl.classList.add("exception-alert");
        if (debugPanelButton) {
            debugPanelButton.textContent = "Debug panel: on";
            debugPanelButton.setAttribute("aria-pressed", "true");
        }
        if (developmentDebugPanelInput) developmentDebugPanelInput.checked = true;
        updateDebugText();
    }
}

function gameplayRecordingJsonParts(recording) {
    const metadata = { ...recording };
    delete metadata.frames;
    delete metadata.summary;
    let prefix = JSON.stringify(metadata, null, 2);
    if (prefix.endsWith("}")) prefix = prefix.slice(0, -1);
    prefix += ',\n  "frames": [\n';
    const summaryText = JSON.stringify(recording.summary || {}, null, 2)
        .split("\n")
        .map((line, index) => index === 0 ? line : `  ${line}`)
        .join("\n");
    const suffix = `\n  ],\n  "summary": ${summaryText}\n}\n`;
    return { prefix, suffix };
}

function gameplayRecordingJsonStream(recording, spool) {
    const encoder = new TextEncoder();
    const { prefix, suffix } = gameplayRecordingJsonParts(recording);
    let stage = 0;
    let chunkIndex = 0;
    return new ReadableStream({
        async pull(controller) {
            try {
                if (stage === 0) {
                    controller.enqueue(encoder.encode(prefix));
                    stage = 1;
                    return;
                }
                if (stage === 1 && chunkIndex < spool.nextChunkIndex) {
                    const text = await spool.readChunk(chunkIndex);
                    if (text === null) throw new Error(`Gameplay recording storage is missing chunk ${chunkIndex}.`);
                    controller.enqueue(encoder.encode(`${chunkIndex ? ",\n" : ""}${text}`));
                    chunkIndex += 1;
                    return;
                }
                if (stage <= 1) {
                    controller.enqueue(encoder.encode(suffix));
                    stage = 2;
                    return;
                }
                controller.close();
            } catch (error) {
                controller.error(error);
            }
        }
    });
}

async function gameplayRecordingJsonText(recording, spool) {
    if (!spool) return JSON.stringify(recording, null, 2);
    if (!(await spool.close())) throw new Error(spool.status().error || "Gameplay recording storage could not be finalized.");
    return new Response(gameplayRecordingJsonStream(recording, spool), {
        headers: { "content-type": "application/json" }
    }).text();
}

async function saveGameplayRecordingJson(recording, spool = null) {
    if (spool) {
        const existing = gameplayRecordingSaveTasks.get(spool.recordingId);
        if (existing) return existing;
    }
    const saveTask = saveGameplayRecordingJsonOwned(recording, spool);
    if (!spool) return saveTask;
    gameplayRecordingSaveTasks.set(spool.recordingId, saveTask);
    updateGameplayRecordingControls();
    try {
        return await saveTask;
    } finally {
        if (gameplayRecordingSaveTasks.get(spool.recordingId) === saveTask) {
            gameplayRecordingSaveTasks.delete(spool.recordingId);
        }
        updateGameplayRecordingControls();
    }
}

async function saveGameplayRecordingJsonOwned(recording, spool = null) {
    const safeLevel = sanitizeRecordingFilename(recording?.levelId || START_LEVEL_ID, START_LEVEL_ID).replace(/\.json$/i, "");
    const filename = sanitizeRecordingFilename(`ignatius_recording_rev${GAME_REVISION}_${safeLevel}_${Date.now()}.json`);

    if (!spool) {
        const text = JSON.stringify(recording, null, 2);
        window.__rocketfrockLastGameplayRecordingJson = text;
        downloadTextFile(filename, text, "application/json");
        updateGameplayRecordingControls(`Downloaded ${recording.summary.frames} recorded frames as ${filename}.`);
        return { filename, bytes: text.length, method: "download" };
    }

    // The picker must be invoked before the first await so a stop-recording click
    // still carries browser user activation. Convert rejection to a value
    // immediately so cancellation cannot become an unhandled promise while the
    // IndexedDB spool is being finalized.
    let pickerResultPromise = null;
    if (window.showSaveFilePicker) {
        try {
            pickerResultPromise = window.showSaveFilePicker({
                suggestedName: filename,
                types: [{
                    description: "Ignatius gameplay recording",
                    accept: { "application/json": [".json"] }
                }]
            }).then(
                (handle) => ({ handle, error: null }),
                (error) => ({ handle: null, error })
            );
        } catch (error) {
            pickerResultPromise = Promise.resolve({ handle: null, error });
        }
    }

    try {
        await spool.retain(recording, "saving");
    } catch (error) {
        const status = spool.status();
        forgetGameplayRecordingSpool(spool);
        void spool.discard();
        updateGameplayRecordingControls("Recording could not be finalized from browser storage; gameplay is unaffected.");
        recordDebugExceptionAlert(gameState, {
            type: "gameplayRecordingFinalizeFailure",
            error: status.error || String(error?.message || error),
            message: "Gameplay recording storage could not be finalized"
        });
        return null;
    }

    window.__rocketfrockLastGameplayRecordingJson = "";
    if (pickerResultPromise) {
        const pickerResult = await pickerResultPromise;
        if (pickerResult.handle) {
            let writable = null;
            try {
                writable = await pickerResult.handle.createWritable();
                const { prefix, suffix } = gameplayRecordingJsonParts(recording);
                await writable.write(prefix);
                await spool.forEachChunk(async (text, index) => {
                    await writable.write(`${index ? ",\n" : ""}${text}`);
                });
                await writable.write(suffix);
                await writable.close();
                releaseGameplayRecordingSpool(spool);
                updateGameplayRecordingControls(`Saved ${recording.summary.frames} recorded frames to ${filename}.`);
                return { filename, frames: recording.summary.frames, method: "file-system-access-stream" };
            } catch (error) {
                try { await writable?.abort?.(); } catch {}
                console.warn("Gameplay recording file write failed; trying the bounded browser-download fallback.", error);
                try { await spool.markState("save-failed", recording); } catch {}
            }
        } else if (pickerResult.error?.name === "AbortError") {
            try { await spool.markState("retained", recording); } catch {}
            rememberGameplayRecordingSpool(recording, spool, "retained");
            updateGameplayRecordingControls(`Recording retained in browser storage: ${recording.summary.frames} frames.`);
            return { filename, frames: recording.summary.frames, method: "save-cancelled" };
        } else if (pickerResult.error) {
            console.warn("Gameplay recording save picker failed; trying the bounded browser-download fallback.", pickerResult.error);
        }
    }

    const { prefix, suffix } = gameplayRecordingJsonParts(recording);
    const status = spool.status();
    // UTF-8 requires at most three bytes per UTF-16 code unit for JSON text.
    // Using that conservative bound keeps the Blob fallback capped even when
    // authored identifiers contain non-ASCII text.
    const estimatedBytes = new TextEncoder().encode(prefix).byteLength
        + new TextEncoder().encode(suffix).byteLength
        + Math.max(0, Number(status.serializedCharacters) || 0) * 3
        + Math.max(0, Number(status.chunkCount) - 1) * 2;
    if (estimatedBytes > MAX_GAMEPLAY_RECORDING_BLOB_FALLBACK_BYTES) {
        try { await spool.markState("export-unavailable", recording); } catch {}
        rememberGameplayRecordingSpool(recording, spool, "export-unavailable");
        updateGameplayRecordingControls(
            `Recording retained in browser storage (${recording.summary.frames} frames). This browser cannot stream a file download of this size.`
        );
        return {
            filename,
            frames: recording.summary.frames,
            method: "retained-streaming-unavailable",
            estimatedBytes
        };
    }

    try {
        const blob = await new Response(gameplayRecordingJsonStream(recording, spool), {
            headers: { "content-type": "application/json" }
        }).blob();
        downloadBlobFile(filename, blob);
        releaseGameplayRecordingSpool(spool);
        updateGameplayRecordingControls(`Downloaded ${recording.summary.frames} recorded frames as ${filename}.`);
        return { filename, bytes: blob.size, method: "bounded-blob-download" };
    } catch (error) {
        console.warn("Gameplay recording export failed; the capture remains in browser storage.", error);
        try { await spool.markState("save-failed", recording); } catch {}
        rememberGameplayRecordingSpool(recording, spool, "save-failed");
        recordDebugExceptionAlert(gameState, {
            type: "gameplayRecordingExportFailure",
            error: String(error?.message || error),
            message: "Gameplay recording export failed; capture remains in browser storage"
        });
        updateGameplayRecordingControls("Recording export failed; capture remains in browser storage.");
        return null;
    }
}

function downloadTextFile(filename, text, mimeType = "text/plain") {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = sanitizeRecordingFilename(filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function downloadBlobFile(filename, blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = sanitizeRecordingFilename(filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function createGameplayPlaybackRuntime(recording, { source = "manual", pauseAtSec = null } = {}) {
    return {
        active: true,
        source,
        recording,
        frames: recording.frames || [],
        index: 0,
        pauseAtSec: Number.isFinite(Number(pauseAtSec)) ? Math.max(0, Number(pauseAtSec)) : null,
        pauseTriggered: false,
        pausedForKey: false,
        lastFrame: null
    };
}

async function startGameplayPlayback(recordingLike, { source = "manual", pauseAtSec = null, restoreInitialState = true } = {}) {
    const recording = normalizeGameplayRecording(recordingLike);
    if (gameplayRecording) {
        stopGameplayRecording("playback-started", { save: false });
    }
    if (restoreInitialState && !(await restoreGameplayPlaybackInitialState(recording))) {
        return null;
    }
    gameplayPlayback = createGameplayPlaybackRuntime(recording, { source, pauseAtSec });
    titleScreenActive = false;
    gameHasStarted = true;
    input.clear();
    setGamePaused(false, { clearInput: true });
    syncTitleScreenUi();
    syncGameAudioState();
    addEvent(gameState, "GAMEPLAY_PLAYBACK_STARTED", {
        source,
        levelId: recording.levelId,
        frames: recording.frames.length,
        pauseAtSec: gameplayPlayback.pauseAtSec
    });
    updateGameplayPlaybackControls();
    updateGameplayRecordingControls("Recording disabled during playback.");
    return gameplayPlayback;
}

async function restoreGameplayPlaybackInitialState(recording) {
    showLoadingScreen("Preparing gameplay playback", 0.04);
    try {
        gameState = cloneGameState(recording.initialState);
        gameState.settings = normalizeGameSettings(gameState.settings);
        gameState.debug.revision = GAME_REVISION;
        syncPresentationFromWorldState();
        setLoadingProgress(0.18, "Loading playback renderer assets");
        await syncRendererLevelAssets(gameState.world, {
            characterStart: 0.18,
            characterSpan: 0.30,
            atlasStart: 0.48,
            atlasSpan: 0.36
        });
        renderer.syncCaveWindow(activeCaveWindow);
        if (!applyLoadedAtlasCollisionsOrException("gameplay playback restore")) {
            throw new Error("Required atlas collision data could not be applied while restoring gameplay playback.");
        }
        renderer.syncEnvironmentColorMap(gameState.world.colorMap, gameState.world.colorExchange);
        renderer.prewarmLevelPresentationCaches?.(gameState.world);
        accumulator = 0;
        lastRafNow = performance.now();
        lastCallbackArrivalNow = performance.now();
        lastInputFrame = createInputFrame();
        levelTransitionLoading = false;
        setLoadingProgress(1, "Playback ready");
        await nextPaint();
        return true;
    } catch (error) {
        const detail = error instanceof Error ? error.message : String(error || "unknown error");
        latchFatalRuntimeFailure(`Ignatius could not safely continue because gameplay playback restoration failed. ${detail}`, error);
        return false;
    } finally {
        hideLoadingScreen();
    }
}

function takeGameplayPlaybackFrame() {
    if (!gameplayPlayback?.active) return { kind: "inactive" };
    if (gameplayPlayback.pausedForKey) return { kind: "paused" };
    const frame = gameplayPlayback.frames[gameplayPlayback.index];
    if (!frame) {
        stopGameplayPlayback("complete");
        return { kind: "complete" };
    }
    gameplayPlayback.index += 1;
    gameplayPlayback.lastFrame = frame;
    if (gameplayPlayback.pauseAtSec != null && !gameplayPlayback.pauseTriggered && Number(frame.recordingTimeSec) >= gameplayPlayback.pauseAtSec) {
        gameplayPlayback.pauseTriggered = true;
        gameplayPlayback.pausedForKey = true;
        updateGameplayPlaybackControls(`Playback paused at ${Number(frame.recordingTimeSec).toFixed(3)}s. Press any key to continue.`);
    }
    return { kind: "frame", frame };
}

function resumeGameplayPlaybackFromPause() {
    if (!gameplayPlayback?.active || !gameplayPlayback.pausedForKey) return false;
    gameplayPlayback.pausedForKey = false;
    updateGameplayPlaybackControls();
    return true;
}

function stopGameplayPlayback(reason = "manual") {
    if (!gameplayPlayback) {
        updateGameplayPlaybackControls();
        return false;
    }
    const framesPlayed = gameplayPlayback.index;
    const levelId = gameplayPlayback.recording?.levelId || gameState.world?.levelId || START_LEVEL_ID;
    gameplayPlayback = null;
    if (gameState.story) {
        gameState.story.levelTransitionRequest = null;
    }
    addEvent(gameState, "GAMEPLAY_PLAYBACK_STOPPED", { reason, levelId, framesPlayed });
    updateGameplayPlaybackControls(`Playback ${reason}. Played ${framesPlayed} frame${framesPlayed === 1 ? "" : "s"}.`);
    updateGameplayRecordingControls();
    return true;
}

async function loadGameplayRecordingFromFile(file) {
    const text = await file.text();
    return normalizeGameplayRecording(text);
}

function setLoadingProgress(progress, label = "Loading game assets") {
    displayedLoadingProgress = Math.max(displayedLoadingProgress, clamp01(progress));
    const percent = Math.round(displayedLoadingProgress * 100);
    if (loadingPercent) {
        loadingPercent.textContent = `${percent}%`;
    }
    if (loadingBarFill) {
        loadingBarFill.style.width = `${percent}%`;
    }
    if (loadingDetail) {
        loadingDetail.textContent = String(label || "Loading game assets");
    }
    loadingTrack?.setAttribute("aria-valuenow", String(percent));
}

function showLoadingScreen(label = "Loading game assets", progress = 0) {
    displayedLoadingProgress = clamp01(progress);
    if (loadingScreen) {
        loadingScreen.hidden = false;
        loadingScreen.style.opacity = "1";
    }
    setLoadingProgress(displayedLoadingProgress, label);
}

function hideLoadingScreen() {
    if (!loadingScreen) {
        return;
    }
    loadingScreen.style.opacity = "0";
    window.setTimeout(() => {
        loadingScreen.hidden = true;
    }, 190);
}

function nextPaint() {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

function syncLoadedCharacterCombatProfiles() {
    const projects = [...renderer.getRuntimeCharacterProjects().values()];
    soundEffectsDirector.setCharacterSounds(projects.map((project) => ({
        characterId: project.characterId,
        sounds: project.sounds
    })));
    applyLootCatalog(gameState, lootCatalog);
    applyCharacterDropProfiles(gameState, new Map(projects.map((project) => [project.characterId, {
        drops: project.dropProfile?.drops || []
    }])));
    const profiles = new Map();
    for (const project of projects) {
        const handoffs = project.attackHandoffs instanceof Map ? [...project.attackHandoffs.values()] : [];
        if (!handoffs.length && !project.animations.get("attack")?.duration) {
            continue;
        }
        profiles.set(project.characterId, {
            characterId: project.characterId,
            attackDuration: project.animations.get("attack")?.duration,
            handoffs: handoffs.map((handoff) => ({ ...handoff }))
        });
    }
    return applyCharacterCombatProfiles(gameState, profiles);
}

async function loadEnemyDefinitionCatalog() {
    const url = assetUrl("characters/ct_enemies_001.json");
    try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error(`${response.status}`);
        const catalog = await response.json();
        if (!applyEnemyDefinitionCatalog(gameState, catalog)) {
            throw new Error(`Enemy definition catalog ${url} contains no usable enemies.`);
        }
        enemyDefinitionCatalog = catalog;
        return enemyDefinitionCatalog;
    } catch (error) {
        recordDebugExceptionAlert(gameState, {
            type: "enemyCatalogFailure",
            resourceUrl: url,
            error: String(error?.message || error),
            message: "Required enemy catalog could not be loaded"
        });
        throw error;
    }
}

function resolveEnemyCharacterProjectUrl(catalog, characterId) {
    const normalizedCharacterId = String(characterId || "").trim();
    let configured = normalizedCharacterId;
    for (const definition of Object.values(catalog?.enemies || {})) {
        if (String(definition?.characterId || "").trim() !== normalizedCharacterId) continue;
        configured = String(definition?.characterUrl || normalizedCharacterId).trim();
        break;
    }
    if (!configured) return "";
    const withExtension = configured.endsWith(".json") ? configured : `${configured}.json`;
    return withExtension.includes("/") ? withExtension : `characters/${withExtension}`;
}

function requiredEnemyCharacterProjectUrls(level = gameState.world) {
    return collectLevelEnemyCharacterIds(level, enemyDefinitionCatalog)
        .map((characterId) => resolveEnemyCharacterProjectUrl(enemyDefinitionCatalog, characterId))
        .filter(Boolean);
}

async function syncRendererLevelAssets(level = gameState.world, options = {}) {
    const characterStart = Number(options.characterStart) || 0;
    const characterSpan = Number(options.characterSpan) || 0;
    const atlasStart = Number(options.atlasStart) || 0;
    const atlasSpan = Number(options.atlasSpan) || 0;
    await renderer.ensureCharacterProjects(requiredEnemyCharacterProjectUrls(level), {
        onProgress: ({ progress, label }) => {
            if (characterSpan > 0) setLoadingProgress(characterStart + clamp01(progress) * characterSpan, label);
        }
    });
    await renderer.ensureEnvironmentAtlases(gameState.world.atlasManifests, {
        onProgress: ({ progress, label }) => {
            if (atlasSpan > 0) setLoadingProgress(atlasStart + clamp01(progress) * atlasSpan, label);
        }
    });
    syncLoadedCharacterCombatProfiles();
}

function maybeApplyBrowserCopyLevel() {
    if (!launchEditorPlaytest) {
        return false;
    }
    try {
        const raw = localStorage.getItem("ignatius_level_editor_v2");
        if (!raw) {
            console.warn("Playtest requested, but no browser-saved level editor copy was found.");
            return false;
        }
        const level = JSON.parse(raw);
        const applied = applyEditorLevelToWorld(gameState, level);
        if (!applied) {
            console.warn("Playtest requested, but the browser-saved level could not be applied.");
        } else {
            syncPresentationLevelData(level);
        }
        return applied;
    } catch (error) {
        console.warn("Playtest requested, but loading the browser-saved level failed.", error);
        return false;
    }
}

async function loadLootCatalog() {
    const url = assetUrl("items/it_loot_001.json");
    try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error(`${response.status}`);
        const catalog = await response.json();
        if (!applyLootCatalog(gameState, catalog)) {
            throw new Error(`Enemy loot catalog ${url} contains no usable items.`);
        }
        lootCatalog = catalog;
        return lootCatalog;
    } catch (error) {
        recordDebugExceptionAlert(gameState, {
            type: "lootCatalogFailure",
            resourceUrl: url,
            error: String(error?.message || error),
            message: "Required enemy loot catalog could not be loaded"
        });
        throw error;
    }
}

async function loadMusicCatalog() {
    const url = assetUrl("music/music.json");
    try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
            console.warn(`Music catalog could not be loaded: ${url} (${response.status}).`);
            musicDirector.setCatalog(musicCatalog);
            return musicCatalog;
        }
        musicCatalog = normalizeMusicCatalog(await response.json());
    } catch (error) {
        console.warn(`Music catalog could not be loaded: ${url}.`, error);
        musicCatalog = normalizeMusicCatalog(null);
    }
    musicDirector.setCatalog(musicCatalog);
    return musicCatalog;
}

async function applyRequiredDefaultLevel() {
    return applyRequiredLevel(START_LEVEL_ID);
}

async function applyRequiredLevel(levelId = START_LEVEL_ID) {
    const id = normalizedLevelId(levelId, START_LEVEL_ID);
    const url = assetUrl(`levels/${id}.json`);
    let response;
    try {
        response = await fetch(url, { cache: "no-store" });
    } catch (error) {
        failStartup(`Required level file could not be loaded: ${url}. Serve the project from a local web server and make sure the file exists.`, error);
    }

    if (!response.ok) {
        failStartup(`Required level file is missing or unavailable: ${url} (${response.status}).`);
    }

    let level;
    try {
        level = await response.json();
    } catch (error) {
        failStartup(`Required level file is not valid JSON: ${url}.`, error);
    }

    if (!applyEditorLevelToWorld(gameState, level)) {
        failStartup(`Required level file could not be applied: ${url}.`);
    }
    syncPresentationLevelData(level);
    return id;
}

function syncPresentationLevelData(level) {
    activeCaveWindow = normalizeCaveWindow(level?.caveWindow || level?.visuals?.caveWindow);
    activeLevelMusic = normalizeLevelMusic(level?.music);
    renderer?.syncCaveWindow(activeCaveWindow);
    musicDirector.setTrack(activeLevelMusic.trackId);
}

function normalizedLevelId(value, fallback = START_LEVEL_ID) {
    return normalizeLaunchLevelQuery(value, fallback);
}

function currentSaveGameRecord(slotId) {
    return createSaveGameRecord({
        slotId,
        levelId: gameState.world?.levelId || START_LEVEL_ID,
        levelTitle: gameState.world?.title || gameState.story?.levelTitle || "Ignatius Rocketfrock",
        checkpointId: "",
        checkpointLabel: "Level start",
        score: gameState.score,
        campaign: {
            playerProgression: normalizePlayerProgression(gameState.playerProgression)
        }
    });
}

function storedResumeSave() {
    return loadStoredAutosave();
}

function saveResumeLevelId(levelId) {
    const id = normalizedLevelId(levelId, "");
    if (!id) return false;
    const record = createSaveGameRecord({
        ...currentSaveGameRecord(AUTOSAVE_SLOT_ID),
        slotId: AUTOSAVE_SLOT_ID,
        levelId: id,
        levelTitle: gameState.world?.title || gameState.story?.levelTitle || id.replace("_", " ")
    });
    if (!saveStoredSaveGame(AUTOSAVE_SLOT_ID, record)) return false;
    syncTitleScreenUi();
    addEvent(gameState, "AUTOSAVE_WRITTEN", { levelId: id });
    return true;
}

function saveManualSlot(slotId) {
    const existing = loadStoredSaveGame(slotId);
    if (existing && !globalThis.confirm?.(`Overwrite ${saveGameSlotLabel(slotId)}?`)) {
        return false;
    }
    if (!saveStoredSaveGame(slotId, currentSaveGameRecord(slotId))) {
        showGameNotice("The save could not be written. Check browser storage permissions or available storage space.");
        return false;
    }
    syncSaveSlotUi();
    addEvent(gameState, "MANUAL_SAVE_WRITTEN", { slotId, levelId: gameState.world?.levelId });
    return true;
}

async function fetchOptionalLevel(levelId) {
    const id = normalizedLevelId(levelId);
    const url = assetUrl(`levels/${id}.json`);
    try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.warn(`Could not load optional level ${url}.`, error);
        return null;
    }
}

function requestSkipToNextLevel() {
    if (!DEVELOPMENT || fatalRuntimeFailure) return false;
    if (titleScreenActive || !gameHasStarted || gameplayPlayback?.active || levelTransitionLoading) {
        return false;
    }
    const currentLevelId = normalizedLevelId(gameState.world?.levelId, START_LEVEL_ID);
    const requestedLevelId = defaultNextLevelId(currentLevelId);
    gameState.story.levelTransitionRequest = {
        portalId: "keyboard_f8",
        requestedLevelId,
        fallbackLevelId: currentLevelId
    };
    addEvent(gameState, "LEVEL_TRANSITION_REQUESTED", gameState.story.levelTransitionRequest);
    return true;
}

function heldCreditsGamepadButtonKeys() {
    const held = new Set();
    try {
        const pads = typeof navigator?.getGamepads === "function" ? navigator.getGamepads() : [];
        for (const pad of pads || []) {
            if (!pad?.connected) continue;
            for (let index = 0; index < (pad.buttons?.length || 0); index += 1) {
                const button = pad.buttons[index];
                if (button?.pressed || Number(button?.value) > 0.5) {
                    held.add(`${pad.index}:${index}`);
                }
            }
        }
    } catch {
        // Gamepad input is optional. Keyboard/pointer interruption remains available.
    }
    return held;
}

function updateCreditsGamepadInterrupt() {
    if (!creditsActive) return false;
    const held = heldCreditsGamepadButtonKeys();
    const freshPress = [...held].some((key) => !creditsHeldGamepadButtons.has(key));
    creditsHeldGamepadButtons = held;
    if (freshPress) return finishCreditsRoll("interrupted");
    return false;
}

async function startCreditsRoll() {
    const response = await fetch(resourceUrl(CREDITS_RESOURCE_PATH), { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`Required credits document ${CREDITS_RESOURCE_PATH} could not be loaded (${response.status}).`);
    }
    const entries = parseCreditsMarkdown(await response.text());
    if (!entries.some((entry) => entry.text)) {
        throw new Error(`Required credits document ${CREDITS_RESOURCE_PATH} contains no credit lines.`);
    }
    if (!creditsScreen || !creditsTrack) {
        throw new Error("Credits presentation elements are unavailable.");
    }

    creditsTrack.replaceChildren(...entries.map((entry) => {
        const line = document.createElement("div");
        line.className = `credits-line ${entry.type}`;
        line.textContent = entry.text || "";
        return line;
    }));
    creditsElapsedSeconds = 0;
    creditsActive = true;
    creditsHeldGamepadButtons = heldCreditsGamepadButtonKeys();
    titleScreenActive = false;
    gameHasStarted = false;
    levelTransitionLoading = false;
    accumulator = 0;
    input.clear();
    setGamePaused(true, { clearInput: true });
    creditsScreen.hidden = false;
    document.body.classList.add("credits-screen-active");
    syncTitleScreenUi();
    updateCreditsRoll(0);
    creditsScreen.focus({ preventScroll: true });
    addEvent(gameState, "CREDITS_STARTED");
    return true;
}

function finishCreditsRoll(reason = "complete") {
    if (!creditsActive) return false;
    creditsActive = false;
    creditsElapsedSeconds = 0;
    creditsHeldGamepadButtons = new Set();
    if (creditsScreen) creditsScreen.hidden = true;
    if (creditsTrack) creditsTrack.style.transform = "translate3d(-50%, 100vh, 0)";
    document.body.classList.remove("credits-screen-active");
    addEvent(gameState, "CREDITS_FINISHED", { reason });
    showTitleScreen();
    return true;
}

function updateCreditsRoll(realDt) {
    if (!creditsActive || !creditsTrack) return;
    creditsElapsedSeconds += Math.max(0, Math.min(0.1, Number(realDt) || 0));
    const viewportHeight = Math.max(1, globalThis.innerHeight || document.documentElement?.clientHeight || 720);
    const y = viewportHeight - creditsElapsedSeconds * CREDITS_SCROLL_PIXELS_PER_SECOND;
    creditsTrack.style.transform = `translate3d(-50%, ${y.toFixed(2)}px, 0)`;
    const contentHeight = Math.max(1, creditsTrack.scrollHeight || 1);
    if (y + contentHeight < -Math.max(40, viewportHeight * 0.06)) {
        finishCreditsRoll("complete");
    }
}

function interruptCreditsRoll(event) {
    if (!creditsActive || event?.repeat) return false;
    event?.preventDefault?.();
    event?.stopImmediatePropagation?.();
    return finishCreditsRoll("interrupted");
}

function processLevelTransitionRequest() {
    if (fatalRuntimeFailure) return;
    const request = gameState.story?.levelTransitionRequest;
    if (!request || levelTransitionLoading) return;
    if (gameplayPlayback?.active) return;

    if (gameplayRecording) {
        stopGameplayRecording("level-transition");
    }
    gameState.story.levelTransitionRequest = null;
    levelTransitionLoading = true;
    accumulator = 0;
    input.clear();
    void loadRequestedLevel(request)
        .catch(() => {
            // loadRequestedLevel reports the fatal transition once through failStartup.
            // Consume that deliberate rejection so it does not become an unhandled promise.
        })
        .finally(() => {
            if (!fatalRuntimeFailure) levelTransitionLoading = false;
        });
}

async function loadRequestedLevel(request) {
    showLoadingScreen("Loading next level", 0.04);
    try {
        const rawRequestedLevelId = String(request.requestedLevelId || "").trim();
        if (isCreditsDestinationLevel(rawRequestedLevelId)) {
            setLoadingProgress(0.5, "Preparing credits");
            return await startCreditsRoll();
        }
        const currentLevelId = normalizedLevelId(request.fallbackLevelId || gameState.world.levelId);
        const requestedLevelId = normalizedLevelId(rawRequestedLevelId, currentLevelId);
        const loadedLevelId = requestedLevelId;
        const level = await fetchOptionalLevel(requestedLevelId);
        if (!level) {
            throw new Error(`Required destination level ${requestedLevelId} could not be loaded.`);
        }
        setLoadingProgress(0.22, `Loaded ${loadedLevelId}`);
        if (!applyEditorLevelToWorld(gameState, level)) {
            throw new Error(`Level transition failed while applying ${loadedLevelId}.`);
        }
        applyPlayerProgression(gameState, gameState.playerProgression, { refillResources: true });
        syncPresentationLevelData(level);
        await syncRendererLevelAssets(level, {
            characterStart: 0.22,
            characterSpan: 0.30,
            atlasStart: 0.52,
            atlasSpan: 0.36
        });
        if (!applyLoadedAtlasCollisionsOrException(`level transition to ${loadedLevelId}`)) {
            throw new Error(`Required atlas collision data could not be applied for ${loadedLevelId}.`);
        }
        renderer.syncEnvironmentColorMap(gameState.world.colorMap, gameState.world.colorExchange);
        setLoadingProgress(0.9, "Prewarming level foreground textures");
        renderer.prewarmLevelPresentationCaches?.(gameState.world);
        accumulator = 0;
        addEvent(gameState, "LEVEL_TRANSITION_COMPLETE", {
            requestedLevelId,
            loadedLevelId,
            usedFallback: false
        });
        saveResumeLevelId(loadedLevelId);
        setLoadingProgress(1, "Level ready");
        await nextPaint();
        void attemptVisibleLevelMusicStart();
        return true;
    } catch (error) {
        setGamePaused(true, { clearInput: true });
        const detail = error instanceof Error ? error.message : String(error || "unknown error");
        failStartup(`Ignatius could not safely continue because an essential level transition failed. ${detail}`, error);
        return false;
    } finally {
        hideLoadingScreen();
    }
}

function latchFatalRuntimeFailure(message, error) {
    const fatalMessage = String(message || "Ignatius could not safely continue.");
    console.error(fatalMessage, error || "");
    fatalRuntimeFailure = true;
    fatalRuntimeMessage = fatalRuntimeMessage || fatalMessage;
    if (loadingScreen) {
        loadingScreen.hidden = true;
    }
    if (!fatalRuntimePanel) {
        fatalRuntimePanel = document.createElement("div");
        fatalRuntimePanel.setAttribute("role", "alert");
        fatalRuntimePanel.style.position = "fixed";
        fatalRuntimePanel.style.inset = "24px auto auto 24px";
        fatalRuntimePanel.style.maxWidth = "720px";
        fatalRuntimePanel.style.zIndex = "10001";
        fatalRuntimePanel.style.padding = "16px 18px";
        fatalRuntimePanel.style.border = "1px solid rgba(255, 120, 120, 0.65)";
        fatalRuntimePanel.style.borderRadius = "14px";
        fatalRuntimePanel.style.background = "rgba(22, 10, 14, 0.96)";
        fatalRuntimePanel.style.color = "#ffe8e8";
        fatalRuntimePanel.style.font = "14px/1.45 system-ui, sans-serif";
        document.body.appendChild(fatalRuntimePanel);
    }
    fatalRuntimePanel.textContent = fatalRuntimeMessage;
    return fatalRuntimeMessage;
}

function failStartup(message, error) {
    throw new Error(latchFatalRuntimeFailure(message, error));
}

function showGameNotice(message, options = {}) {
    if (activeNoticeOverlay?.parentNode) {
        activeNoticeOverlay.remove();
    }
    const overlay = document.createElement("div");
    activeNoticeOverlay = overlay;
    overlay.setAttribute("role", "alertdialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "10002";
    overlay.style.display = "grid";
    overlay.style.placeItems = "center";
    overlay.style.padding = "24px";
    overlay.style.background = "rgba(0, 0, 0, 0.36)";
    const card = document.createElement("div");
    card.style.maxWidth = "520px";
    card.style.minWidth = "min(420px, calc(100vw - 48px))";
    card.style.padding = "18px 20px 16px";
    card.style.border = "2px solid rgba(201, 167, 255, 0.72)";
    card.style.borderRadius = "18px";
    card.style.background = "rgba(20, 13, 30, 0.97)";
    card.style.color = "#f7edff";
    card.style.boxShadow = "0 18px 60px rgba(0, 0, 0, 0.45)";
    card.style.font = "15px/1.45 system-ui, sans-serif";
    const body = document.createElement("div");
    body.textContent = String(message || "Notice");
    body.style.whiteSpace = "pre-line";
    body.style.marginBottom = "16px";
    const buttonRow = document.createElement("div");
    buttonRow.style.display = "flex";
    buttonRow.style.justifyContent = "flex-end";
    const okButton = document.createElement("button");
    okButton.type = "button";
    okButton.textContent = options.okText || "OK";
    okButton.style.padding = "9px 18px";
    okButton.style.border = "1px solid rgba(247, 237, 255, 0.72)";
    okButton.style.borderRadius = "12px";
    okButton.style.background = "rgba(94, 67, 132, 0.92)";
    okButton.style.color = "#fff";
    okButton.style.font = "700 13px/1 system-ui, sans-serif";
    okButton.addEventListener("click", () => {
        overlay.remove();
        if (activeNoticeOverlay === overlay) activeNoticeOverlay = null;
    });
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) okButton.click();
    });
    buttonRow.append(okButton);
    card.append(body, buttonRow);
    overlay.append(card);
    document.body.append(overlay);
    okButton.focus({ preventScroll: true });
    return overlay;
}

function handleStaticBakeRendererFailure(payload = {}) {
    const detail = String(payload.detail || payload.status?.status || "").trim();
    const message = String(payload.message || "Could not allocate memory for baked layers. Falling back to normal rendering.");
    const key = `${message}|${detail}`;
    if (staticBakeFailureNoticeKey === key) return;
    staticBakeFailureNoticeKey = key;
    window.setTimeout(() => {
        const currentMode = gameState.settings?.renderingMode || "hardwareRegular";
        gameState.settings = saveStoredGameSettings({
            ...normalizeGameSettings(gameState.settings),
            renderingMode: currentMode.startsWith("software") ? "softwareRegular" : "hardwareRegular"
        });
        activeBakingMode = "off";
        syncGameSettingsUi();
        const suffix = detail ? `\n\n${detail}` : "";
        showGameNotice(`${message}${suffix}`, { okText: "OK" });
    }, 0);
}

function setupTitleScreen() {
    window.addEventListener("keydown", (event) => {
        if (creditsActive) interruptCreditsRoll(event);
    }, { capture: true });
    creditsScreen?.addEventListener("pointerdown", (event) => {
        interruptCreditsRoll(event);
    });

    titleStartButton?.addEventListener("click", (event) => {
        event.preventDefault();
        void startNewGameFromTitle();
    });
    titleResumeButton?.addEventListener("click", (event) => {
        event.preventDefault();
        void resumeGameFromTitle();
    });
    titleLoadButton?.addEventListener("click", (event) => {
        event.preventDefault();
        setGameMenuView("load");
        openGameMenu("load");
    });
    titleSettingsButton?.addEventListener("click", (event) => {
        event.preventDefault();
        openGameMenu("settings");
    });
    titleExitDesktopButton?.addEventListener("click", (event) => {
        event.preventDefault();
        void exitToDesktop();
    });
    titleActions?.addEventListener("keydown", handleTitleMenuNavigationKey);
    window.addEventListener("keydown", handleRuntimeHotkeyKeydown, { capture: true, passive: false });
}

function handleTitleMenuNavigationKey(event) {
    if (!titleScreenActive || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    const enabledButtons = titleActionButtons.filter((button) => !button.disabled);
    if (!enabledButtons.length) return;
    event.preventDefault();
    const currentIndex = Math.max(0, enabledButtons.indexOf(document.activeElement));
    let nextIndex = currentIndex;
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = enabledButtons.length - 1;
    else {
        const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
        nextIndex = (currentIndex + direction + enabledButtons.length) % enabledButtons.length;
    }
    enabledButtons[nextIndex].focus({ preventScroll: true });
}

function handleRuntimeHotkeyKeydown(event) {
    if (DEVELOPMENT
        && event.code === "F8"
        && !event.repeat
        && !controlBindingCapture
        && !input.isGameplayKey(event.code)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        requestSkipToNextLevel();
        return;
    }
    handleGameplayPlaybackResumeKeydown(event);
}

function handleGameplayPlaybackResumeKeydown(event) {
    if (!gameplayPlayback?.pausedForKey) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    resumeGameplayPlaybackFromPause();
}

async function waitForStartupStudioLogo() {
    if (!startupStudioLogo) return false;
    if (startupStudioLogo.complete && startupStudioLogo.naturalWidth > 0) return true;
    try {
        await startupStudioLogo.decode();
        return startupStudioLogo.naturalWidth > 0;
    } catch (error) {
        console.warn("Startup studio logo unavailable; continuing directly to the title screen.", error);
        return false;
    }
}

async function playStartupStudioSplash() {
    if (!startupStudioSplash || !startupStudioLogo || !startupStudioSplashActive) {
        startupStudioSplashActive = false;
        syncTitleScreenUi();
        return false;
    }
    if (!await waitForStartupStudioLogo()) {
        startupStudioSplashActive = false;
        startupStudioSplash.hidden = true;
        syncTitleScreenUi();
        return false;
    }

    startupStudioSplash.hidden = false;
    startupStudioSplash.classList.remove("active");
    await nextPaint();
    startupStudioSplash.classList.add("active");
    await new Promise((resolve) => window.setTimeout(resolve, STARTUP_STUDIO_SPLASH_TOTAL_MS));
    startupStudioSplash.classList.remove("active");
    startupStudioSplash.hidden = true;
    startupStudioSplashActive = false;
    syncTitleScreenUi();
    return true;
}

function showTitleScreen() {
    creditsActive = false;
    creditsElapsedSeconds = 0;
    creditsHeldGamepadButtons = new Set();
    if (creditsScreen) creditsScreen.hidden = true;
    document.body.classList.remove("credits-screen-active");
    titleScreenActive = true;
    gameHasStarted = false;
    titleCardAnimator?.resetClock();
    setGamePaused(true, { clearInput: true });
    syncTitleScreenUi();
}

function startGameFromTitle() {
    if (!titleScreenActive || startupStudioSplashActive) return;
    titleScreenActive = false;
    gameHasStarted = true;
    input.clear();
    setGamePaused(false, { clearInput: true });
    syncTitleScreenUi();
    void musicDirector.unlock();
    void soundEffectsDirector.unlock();
    void applyFullscreenPreference();
}

async function startNewGameFromTitle() {
    if (!titleScreenActive || startupStudioSplashActive) return false;
    void musicDirector.unlock();
    void soundEffectsDirector.unlock();
    void applyFullscreenPreference();
    const loaded = await restartCurrentLevel({
        levelId: START_LEVEL_ID,
        loadingLabel: "Starting new game",
        useBrowserCopy: false,
        playerProgression: {
            lungeUnlocked: true,
            fallImpactExplosionUnlocked: true,
            fallDamageReductionUnlocked: false
        }
    });
    if (!loaded) return false;
    saveResumeLevelId(START_LEVEL_ID);
    startGameFromTitle();
    return true;
}

async function loadSaveGameRecord(record, { startFromTitle = titleScreenActive } = {}) {
    if (!record?.levelId) return false;
    const levelAvailable = Boolean(await fetchOptionalLevel(record.levelId));
    if (!levelAvailable) {
        showGameNotice(`The saved level ${record.levelId} is not available.`);
        return false;
    }
    const loaded = await restartCurrentLevel({
        levelId: record.levelId,
        loadingLabel: "Loading saved game",
        useBrowserCopy: false,
        playerProgression: record.campaign?.playerProgression || {}
    });
    if (!loaded) return false;
    gameState.score = Math.max(0, Number(record.score) || 0);
    saveResumeLevelId(record.levelId);
    if (startFromTitle) {
        startGameFromTitle();
    } else {
        titleScreenActive = false;
        gameHasStarted = true;
        setGamePaused(false, { clearInput: true });
        syncTitleScreenUi();
    }
    return true;
}

async function resumeGameFromTitle() {
    if (!titleScreenActive || startupStudioSplashActive) return false;
    void applyFullscreenPreference();
    const autosave = storedResumeSave();
    if (!autosave) {
        syncTitleScreenUi();
        return false;
    }
    if (titleResumeButton) {
        titleResumeButton.disabled = true;
        titleResumeButton.setAttribute("aria-busy", "true");
    }
    void musicDirector.unlock();
    void soundEffectsDirector.unlock();
    try {
        return await loadSaveGameRecord(autosave, { startFromTitle: true });
    } finally {
        titleResumeButton?.removeAttribute("aria-busy");
        syncTitleScreenUi();
    }
}

async function exitToDesktop() {
    if (electronWindowBridge && typeof electronWindowBridge.quit === "function") {
        await electronWindowBridge.quit();
        return;
    }
    window.close();
    setTimeout(() => {
        if (!window.closed) {
            showGameNotice("This browser does not allow a webpage to close its tab. You can close this tab or window normally.");
        }
    }, 0);
}

function syncTitleScreenUi() {
    if (titleScreen) titleScreen.hidden = !titleScreenActive || startupStudioSplashActive;
    document.body.classList.toggle("title-screen-active", titleScreenActive);
    document.body.classList.toggle("game-running", gameHasStarted && !titleScreenActive);
    if (gameMenuExitTitleButton) gameMenuExitTitleButton.hidden = titleScreenActive;
    if (gameMenuSaveButton) gameMenuSaveButton.hidden = titleScreenActive;
    const autosave = storedResumeSave();
    if (titleResumeButton) {
        titleResumeButton.disabled = !autosave;
        titleResumeButton.setAttribute("aria-disabled", autosave ? "false" : "true");
        titleResumeButton.title = autosave
            ? `Resume ${autosave.levelTitle}`
            : "No autosave is available yet";
    }
    syncGameAudioState();
}

function setupMinimap() {
    if (!hudPanelGroup || !metersPanel || !minimapPanel || !minimapCanvas || !minimapContext) {
        return;
    }
    const syncSize = () => {
        syncHudPanelsToViewport();
        resizeMinimapToLevel();
        drawMinimap(true);
    };
    if (typeof ResizeObserver === "function") {
        minimapResizeObserver = new ResizeObserver(syncSize);
        minimapResizeObserver.observe(metersPanel);
    }
    window.addEventListener("resize", syncSize, { passive: true });
    window.visualViewport?.addEventListener("resize", syncSize, { passive: true });
    window.addEventListener("beforeunload", () => {
        minimapResizeObserver?.disconnect?.();
        window.visualViewport?.removeEventListener("resize", syncSize);
    }, { once: true });
    syncSize();
}

function syncHudPanelsToViewport() {
    if (!hudPanelGroup || !metersPanel) return false;
    const viewportWidth = Math.max(1, document.documentElement.clientWidth || window.innerWidth || 1);
    const viewportHeight = Math.max(1, document.documentElement.clientHeight || window.innerHeight || 1);
    const hudStyle = getComputedStyle(hudPanelGroup);
    const minimapStyle = minimapPanel ? getComputedStyle(minimapPanel) : null;
    const leftInset = Math.max(0, Number.parseFloat(hudStyle.left) || 0);
    const topInset = Math.max(0, Number.parseFloat(hudStyle.top) || 0);
    const rightInset = Math.max(0, Number.parseFloat(minimapStyle?.right) || leftInset);
    const panelGap = Math.max(4, Math.min(12, viewportWidth * 0.015));
    const fullscreenPresentation = computeFullscreenPresentationMetrics(
        viewportWidth,
        viewportHeight,
        fullscreenActive
    );
    const nextScale = calculateHudPanelScale({
        viewportWidth,
        viewportHeight,
        panelWidth: metersPanel.offsetWidth,
        panelHeight: metersPanel.offsetHeight,
        leftInset,
        rightInset: minimapPanel?.hidden ? leftInset : rightInset,
        topInset,
        bottomInset: topInset,
        panelGap,
        minimapVisible: Boolean(minimapPanel && !minimapPanel.hidden),
        maximumScale: fullscreenPresentation.referenceActive ? fullscreenPresentation.scale : 1
    });
    const changed = Math.abs(nextScale - hudPanelScale) > 0.0001;
    hudPanelScale = nextScale;
    document.documentElement.style.setProperty("--hud-panel-scale", nextScale.toFixed(5));
    document.body.classList.toggle("minimap-hidden", Boolean(minimapPanel?.hidden));
    return changed;
}

function minimapGeometry() {
    return computeMinimapGeometry({
        world: gameState.world || {},
        caveWindow: activeCaveWindow,
        player: shownTransformOf(gameState.player)
    });
}

function minimapBounds(geometry = minimapGeometry()) {
    return geometry.bounds;
}


function resizeMinimapToLevel(bounds = minimapBounds()) {
    if (!metersPanel || !minimapPanel || !minimapCanvas) return false;
    const meterRect = metersPanel.getBoundingClientRect();
    if (!(meterRect.height > 0)) return false;
    const worldWidth = Math.max(1, bounds.maxX - bounds.minX);
    const worldHeight = Math.max(1, bounds.maxY - bounds.minY);
    const inset = 8;
    const panelHeight = Math.max(1, Math.round(meterRect.height * 10) / 10);
    const drawableHeight = Math.max(1, panelHeight - inset * 2);
    const aspectWidth = Math.ceil(inset * 2 + drawableHeight * worldWidth / worldHeight);
    const panelWidth = Math.max(1, Math.min(Math.round(meterRect.width), aspectWidth));
    minimapPanel.style.width = `${panelWidth}px`;
    minimapPanel.style.height = `${panelHeight}px`;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const backingWidth = Math.max(1, Math.round(panelWidth * dpr));
    const backingHeight = Math.max(1, Math.round(panelHeight * dpr));
    const sizeKey = `${backingWidth}x${backingHeight}`;
    if (sizeKey === minimapLastSizeKey) return false;
    minimapCanvas.width = backingWidth;
    minimapCanvas.height = backingHeight;
    minimapLastSizeKey = sizeKey;
    minimapLastDrawAt = -Infinity;
    return true;
}

function drawMinimap(force = false) {
    if (minimapPanel?.hidden) return;
    const geometry = minimapGeometry();
    const bounds = minimapBounds(geometry);
    if (resizeMinimapToLevel(bounds)) force = true;
    if (!minimapCanvas || !minimapContext || minimapCanvas.width <= 1 || minimapCanvas.height <= 1) return;
    const now = performance.now();
    if (!force && now - minimapLastDrawAt < 90) return;
    minimapLastDrawAt = now;

    const ctx = minimapContext;
    const width = minimapCanvas.width;
    const height = minimapCanvas.height;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssWidth = width / dpr;
    const cssHeight = height / dpr;
    const worldWidth = Math.max(1, bounds.maxX - bounds.minX);
    const worldHeight = Math.max(1, bounds.maxY - bounds.minY);
    const inset = 8;
    const scale = Math.min(
        Math.max(0.0001, (cssWidth - inset * 2) / worldWidth),
        Math.max(0.0001, (cssHeight - inset * 2) / worldHeight)
    );
    const offsetX = (cssWidth - worldWidth * scale) * 0.5 - bounds.minX * scale;
    const offsetY = (cssHeight - worldHeight * scale) * 0.5 - bounds.minY * scale;
    const point = (x, y) => ({ x: offsetX + x * scale, y: offsetY + y * scale });

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    const cavePoints = geometry.gameplayBoundaryOutline;
    if (cavePoints.length >= 3) {
        ctx.beginPath();
        const first = point(cavePoints[0].x, cavePoints[0].y);
        ctx.moveTo(first.x, first.y);
        for (let index = 1; index < cavePoints.length; index += 1) {
            const next = point(cavePoints[index].x, cavePoints[index].y);
            ctx.lineTo(next.x, next.y);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(63,51,81,0.56)";
        ctx.fill();
        ctx.strokeStyle = "rgba(201,167,255,0.72)";
        ctx.lineWidth = 1.1;
        ctx.stroke();
    }

    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(216,190,126,0.78)";
    ctx.lineWidth = Math.max(1, Math.min(2.4, scale * 14));
    for (const segment of geometry.staticSegments) {
        const a = point(Number(segment.x1) || 0, Number(segment.y1) || 0);
        const b = point(Number(segment.x2) || 0, Number(segment.y2) || 0);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
    }

    const renderedView = renderer?.getLastComputedView?.();
    const viewport = renderedView || renderer?.getViewportMetrics?.();
    if (viewport) {
        const virtualW = Number(viewport.virtualW) || 0;
        const virtualH = Number(viewport.virtualH) || 0;
        const cameraTransform = shownTransformOf(gameState.camera);
        const renderedLeft = Number(renderedView?.x);
        const renderedTop = Number(renderedView?.y);
        const cameraLeft = Number.isFinite(renderedLeft)
            ? renderedLeft
            : (Number(cameraTransform.x) || 0) - virtualW * 0.5;
        const cameraTop = Number.isFinite(renderedTop)
            ? renderedTop
            : (Number(cameraTransform.y) || 0) - virtualH * 0.56;
        const cameraPoint = point(cameraLeft, cameraTop);
        ctx.strokeStyle = "rgba(115,211,124,0.58)";
        ctx.lineWidth = 1;
        ctx.strokeRect(cameraPoint.x, cameraPoint.y, virtualW * scale, virtualH * scale);
    }

    for (const visual of gameState.world?.visuals || []) {
        if (visual?.entityType !== "wizard_exit_door") continue;
        const centerX = (Number(visual.x) || 0) + (Number(visual.w) || 0) * 0.5;
        const centerY = (Number(visual.y) || 0) + (Number(visual.h) || 0) * 0.5;
        const exitPoint = point(centerX, centerY);
        ctx.fillStyle = "rgba(255,112,211,0.95)";
        ctx.beginPath();
        ctx.arc(exitPoint.x, exitPoint.y, 3.1, 0, Math.PI * 2);
        ctx.fill();
    }
    for (const entity of gameState.world?.entities || []) {
        if (entity?.type !== "wizard_exit_point") continue;
        const exitPoint = point(Number(entity.x) || 0, Number(entity.y) || 0);
        ctx.fillStyle = "rgba(255,112,211,0.95)";
        ctx.beginPath();
        ctx.arc(exitPoint.x, exitPoint.y, 3.1, 0, Math.PI * 2);
        ctx.fill();
    }

    const playerTransform = shownTransformOf(gameState.player);
    const playerPoint = point(Number(playerTransform.x) || 0, Number(playerTransform.y) || 0);
    ctx.fillStyle = "#73d37c";
    ctx.strokeStyle = "rgba(0,0,0,0.8)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(playerPoint.x, playerPoint.y, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

function minimapWorldPointFromClick(event, geometry = minimapGeometry()) {
    if (!minimapCanvas || !geometry?.bounds) return null;
    const rect = minimapCanvas.getBoundingClientRect();
    const clientX = Number(event?.clientX);
    const clientY = Number(event?.clientY);
    if (!(rect.width > 0) || !(rect.height > 0) || !Number.isFinite(clientX) || !Number.isFinite(clientY)) return null;
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return null;
    const bounds = geometry.bounds;
    const worldWidth = Math.max(1, bounds.maxX - bounds.minX);
    const worldHeight = Math.max(1, bounds.maxY - bounds.minY);
    const inset = 8;
    const scale = Math.min(
        Math.max(0.0001, (rect.width - inset * 2) / worldWidth),
        Math.max(0.0001, (rect.height - inset * 2) / worldHeight)
    );
    const offsetX = (rect.width - worldWidth * scale) * 0.5 - bounds.minX * scale;
    const offsetY = (rect.height - worldHeight * scale) * 0.5 - bounds.minY * scale;
    return {
        x: ((clientX - rect.left) - offsetX) / scale,
        y: ((clientY - rect.top) - offsetY) / scale
    };
}

function minimapTeleportEnabled() {
    return minimapTeleportAllowed(DEVELOPMENT, launchEditorPlaytest);
}

function tryTeleportPlayerFromMinimapClick(event) {
    if (!minimapTeleportEnabled()
        || !gameHasStarted
        || titleScreenActive
        || isGameMenuOpen()
        || gameState.player?.combatState !== "alive") {
        return false;
    }
    const worldPoint = minimapWorldPointFromClick(event);
    if (!worldPoint || !minimapPointInsideGameplayPerimeter(gameState.world, activeCaveWindow, worldPoint)) return false;
    const teleportPoint = minimapTeleportDestination(gameState.world, worldPoint);
    input.clear();
    const teleported = teleportPlayer(gameState, teleportPoint.x, teleportPoint.y, "minimapDevelopmentTeleport");
    if (teleported) drawMinimap(true);
    return teleported;
}

function setupGameMenuAndSettings() {
    if (!gameMenuDialog || (!openGameMenuButton && !metersPanel)) return;

    document.body.classList.toggle("electron", Boolean(electronWindowBridge));
    if (gameMenuExitTitleButton) {
        gameMenuExitTitleButton.textContent = "Exit to Title";
        gameMenuExitTitleButton.setAttribute("aria-label", "Exit to Title");
    }

    openGameMenuButton?.addEventListener("click", (event) => {
        if (tryTeleportPlayerFromMinimapClick(event)) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        if (isGameMenuOpen()) closeGameMenu();
        else openGameMenu("menu");
    });
    metersPanel?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openGameMenu("menu");
    });
    metersPanel?.addEventListener("keydown", (event) => {
        if (!["Enter", "NumpadEnter", "Space"].includes(event.code)) return;
        event.preventDefault();
        event.stopPropagation();
        openGameMenu("menu");
    });
    fullscreenToggleButton?.addEventListener("click", () => void toggleFullscreen());
    gameMenuSaveButton?.addEventListener("click", () => setGameMenuView("save"));
    gameMenuLoadButton?.addEventListener("click", () => setGameMenuView("load"));
    gameMenuSettingsButton?.addEventListener("click", () => setGameMenuView("settings"));
    controlsSettingsButton?.addEventListener("click", () => setGameMenuView("controls"));
    developmentFeaturesButton?.addEventListener("click", () => setGameMenuView("development"));
    developmentGameTuningButton?.addEventListener("click", () => setGameMenuView("tuning"));
    gameMenuBackButton?.addEventListener("click", () => {
        if (controlBindingCapture) { cancelControlBindingCapture(); return; }
        if (gameMenuView === "tuning") setGameMenuView("development");
        else if (gameMenuView === "development" || gameMenuView === "controls") setGameMenuView("settings");
        else if (gameMenuView !== "menu" && !titleScreenActive) setGameMenuView("menu");
        else closeGameMenu();
    });
    for (const button of gameSaveSlotButtons) {
        button.addEventListener("click", () => void handleSaveSlotSelection(button.dataset.saveSlot));
    }
    gameMenuExitTitleButton?.addEventListener("click", () => void exitToTitleFromMenu());

    gameMenuDialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        if (controlBindingCapture) { cancelControlBindingCapture(); return; }
        if (gameMenuView === "tuning") setGameMenuView("development");
        else if (gameMenuView === "development" || gameMenuView === "controls") setGameMenuView("settings");
        else if (gameMenuView !== "menu" && !titleScreenActive) setGameMenuView("menu");
        else closeGameMenu();
    });
    gameMenuDialog.addEventListener("close", restorePauseAfterMenu);
    gameMenuDialog.addEventListener("click", (event) => {
        if (event.target === gameMenuDialog) {
            event.preventDefault();
            event.stopPropagation();
        }
    });

    window.addEventListener("keydown", handleMenuAndFullscreenKeydown, { passive: false });
    window.addEventListener("pointerdown", unlockMusicFromGesture, { capture: true, passive: true });
    window.addEventListener("keydown", unlockMusicFromGesture, { capture: true, passive: true });
    window.addEventListener("blur", pauseForPageFocusLoss);
    window.addEventListener("focus", restorePageFocusAudioState);
    document.addEventListener("visibilitychange", handlePageVisibilityChange);

    sfxVolumeInput?.addEventListener("input", () => updatePersistentGameSettings({
        sfxVolume: Number(sfxVolumeInput.value)
    }));
    musicVolumeInput?.addEventListener("input", () => updatePersistentGameSettings({
        musicVolume: Number(musicVolumeInput.value)
    }));
    fullscreenInput?.addEventListener("change", () => {
        updatePersistentGameSettings({ fullscreen: fullscreenInput.checked });
        void requestFullscreenState(fullscreenInput.checked);
    });
    showMinimapInput?.addEventListener("change", () => {
        updatePersistentGameSettings({ showMinimap: showMinimapInput.checked });
    });
    for (const button of difficultyButtons) {
        button.addEventListener("click", () => updatePersistentGameSettings({
            difficulty: button.dataset.difficulty
        }));
    }
    for (const button of renderingQualityButtons) {
        button.addEventListener("click", () => updatePersistentGameSettings({
            renderingQuality: button.dataset.renderingQuality
        }));
    }
    renderingModeSelect?.addEventListener("change", () => {
        const renderingMode = renderingModeSelect.value;
        if (renderingMode?.endsWith("Speedhack")) staticBakeFailureNoticeKey = "";
        updatePersistentGameSettings({ renderingMode });
    });

    controlBindingsAdvancedToggle?.addEventListener("click", () => {
        cancelControlBindingCapture();
        controlBindingsAdvancedOpen = !controlBindingsAdvancedOpen;
        syncControlBindingsUi();
    });
    controlBindingsResetButton?.addEventListener("click", () => {
        if (!window.confirm("Reset all controls to their defaults?")) return;
        cancelControlBindingCapture();
        updatePersistentGameSettings({ inputBindings: DEFAULT_INPUT_BINDINGS });
    });

    tuningRunSpeedInput?.addEventListener("input", () => updateSimpleGameTuning("maxRunSpeed", Number(tuningRunSpeedInput.value)));
    tuningLungeSpeedInput?.addEventListener("input", () => updateSimpleGameTuning("playerLungeSpeed", Number(tuningLungeSpeedInput.value)));
    tuningJumpHeightInput?.addEventListener("input", () => updateSimpleGameTuning("ordinaryJumpHeight", Number(tuningJumpHeightInput.value)));
    tuningGravityInput?.addEventListener("input", () => updateSimpleGameTuning("gravity", Number(tuningGravityInput.value)));
    tuningRocketDamageInput?.addEventListener("input", () => updateSimpleGameTuning("rocketDamagePercent", Number(tuningRocketDamageInput.value)));
    tuningRocketDurationInput?.addEventListener("input", () => updateSimpleGameTuning("rocketDurationPercent", Number(tuningRocketDurationInput.value)));
    tuningDoubleJumpPhysicsSelect?.addEventListener("change", () => updateSimpleGameTuning(
        "doubleJumpPhysics",
        tuningDoubleJumpPhysicsSelect.value === DOUBLE_JUMP_PHYSICS_CONSISTENT_APEX
            ? DOUBLE_JUMP_PHYSICS_CONSISTENT_APEX
            : DOUBLE_JUMP_PHYSICS_FIXED_IMPULSE
    ));
    tuningResetButton?.addEventListener("click", resetSimpleGameTuning);

    document.addEventListener("fullscreenchange", () => {
        fullscreenActive = Boolean(document.fullscreenElement);
        if (!electronWindowBridge && gameState.settings?.fullscreen !== fullscreenActive) {
            gameState.settings = saveStoredGameSettings({
                ...normalizeGameSettings(gameState.settings),
                fullscreen: fullscreenActive
            });
        }
        syncFullscreenUi();
        syncGameSettingsUi();
    });
    if (electronWindowBridge && typeof electronWindowBridge.onFullscreenChanged === "function") {
        stopElectronFullscreenListener = electronWindowBridge.onFullscreenChanged((active) => {
            fullscreenActive = Boolean(active);
            if (gameState.settings?.fullscreen !== fullscreenActive) {
                gameState.settings = saveStoredGameSettings({
                    ...normalizeGameSettings(gameState.settings),
                    fullscreen: fullscreenActive
                });
            }
            syncFullscreenUi();
            syncGameSettingsUi();
        });
    }
    window.addEventListener("beforeunload", () => {
        if (typeof stopElectronFullscreenListener === "function") stopElectronFullscreenListener();
        if (gameplayDebugLog) stopGameplayDebugLogging("page-unload", { save: false });
        soundEffectsDirector.dispose();
        musicDirector.dispose();
    }, { once: true });

    syncGameSettingsUi();
    syncSaveSlotUi();
    setGameMenuView("menu");
    void initializeFullscreenUi();
}

function handleMenuAndFullscreenKeydown(event) {
    if (isGameMenuOpen()) {
        if (controlBindingCapture && !event.repeat) {
            event.preventDefault();
            if (event.code === "Escape") cancelControlBindingCapture();
            else completeControlBindingCapture(`keyboard:${event.code}`);
            return;
        }
        if (handleGameMenuNavigationKey(event)) return;
        if (event.code === "Escape" && !event.repeat) {
            event.preventDefault();
            if (gameMenuView === "tuning") setGameMenuView("development");
            else if (gameMenuView === "development" || gameMenuView === "controls") setGameMenuView("settings");
            else if (gameMenuView !== "menu") setGameMenuView("menu");
            else closeGameMenu();
        }
        return;
    }

    if (event.code === "F11" && !event.repeat && !input.isGameplayKey("F11")) {
        event.preventDefault();
        void toggleFullscreen();
        return;
    }

    if (event.code === "Escape" && !event.repeat && !titleScreenActive) {
        event.preventDefault();
        openGameMenu("menu");
    }
}

function visibleDialogFocusItems() {
    const view = gameMenuView === "settings"
        ? gameSettingsPanel
        : (gameMenuView === "controls"
            ? gameControlsPanel
            : (gameMenuView === "development"
                ? gameDevelopmentPanel
                : (gameMenuView === "tuning"
                    ? gameTuningPanel
                    : (gameMenuView === "save" || gameMenuView === "load" ? gameSaveSlotsPanel : gameMenuMain))));
    if (!view) {
        return [];
    }
    const candidates = [
        gameMenuBackButton,
        ...view.querySelectorAll("button, input, select, textarea, [tabindex]")
    ];
    return candidates.filter((element, index) => {
        if (!element || candidates.indexOf(element) !== index) return false;
        if (element.hidden || element.disabled || element.getAttribute("aria-disabled") === "true") return false;
        return element.offsetParent !== null;
    });
}

function focusDialogItem(delta) {
    const items = visibleDialogFocusItems();
    if (!items.length) {
        return;
    }
    let index = items.indexOf(document.activeElement);
    if (index < 0) {
        index = delta > 0 ? -1 : 0;
    }
    items[(index + delta + items.length) % items.length]?.focus();
}

function focusDialogBoundary(last = false) {
    const items = visibleDialogFocusItems();
    if (!items.length) {
        return;
    }
    items[last ? items.length - 1 : 0]?.focus();
}

function adjustRangeFromKeyboard(input, direction, largeStep = false) {
    const min = Number(input.min || 0);
    const max = Number(input.max || 1);
    const step = Math.max(Number(input.step) || 0.01, 0.01) * (largeStep ? 10 : 5);
    const value = Math.max(min, Math.min(max, Number(input.value) + direction * step));
    input.value = String(value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
}

function moveWithinChoiceGroup(button, direction) {
    const group = button.closest(".settings-choice-grid");
    if (!group) {
        return false;
    }
    const choices = [...group.querySelectorAll("button:not(:disabled)")];
    const index = choices.indexOf(button);
    if (index < 0 || choices.length < 2) {
        return false;
    }
    const next = choices[(index + direction + choices.length) % choices.length];
    next.focus();
    next.click();
    return true;
}

function handleGameMenuNavigationKey(event) {
    if (event.repeat && event.code !== "ArrowLeft" && event.code !== "ArrowRight") {
        event.preventDefault();
        return true;
    }
    const target = document.activeElement;
    if (event.code === "ArrowDown") {
        event.preventDefault();
        focusDialogItem(1);
        return true;
    }
    if (event.code === "ArrowUp") {
        event.preventDefault();
        focusDialogItem(-1);
        return true;
    }
    if (event.code === "Home") {
        event.preventDefault();
        focusDialogBoundary(false);
        return true;
    }
    if (event.code === "End") {
        event.preventDefault();
        focusDialogBoundary(true);
        return true;
    }
    if (event.code === "Tab") {
        event.preventDefault();
        focusDialogItem(event.shiftKey ? -1 : 1);
        return true;
    }
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
        const direction = event.code === "ArrowRight" ? 1 : -1;
        if (target instanceof HTMLInputElement && target.type === "range") {
            event.preventDefault();
            adjustRangeFromKeyboard(target, direction, event.shiftKey);
            return true;
        }
        if (target instanceof HTMLInputElement && target.type === "checkbox") {
            event.preventDefault();
            target.checked = direction > 0;
            target.dispatchEvent(new Event("change", { bubbles: true }));
            return true;
        }
        if (target instanceof HTMLButtonElement && moveWithinChoiceGroup(target, direction)) {
            event.preventDefault();
            return true;
        }
        return false;
    }
    if (event.code === "Enter" || event.code === "NumpadEnter" || event.code === "Space") {
        if (target instanceof HTMLInputElement && target.type === "range") {
            return true;
        }
        event.preventDefault();
        if (target instanceof HTMLInputElement && target.type === "checkbox") {
            target.click();
        } else if (target && typeof target.click === "function") {
            target.click();
        } else {
            focusDialogBoundary(false);
        }
        return true;
    }
    return false;
}

function isGameMenuOpen() {
    return Boolean(gameMenuDialog?.open);
}

function openGameMenu(initialView = "menu") {
    if (!gameMenuDialog || isGameMenuOpen()) return;
    gameMenuPreviousPause = Boolean(gameState.debug.paused);
    setGamePaused(true, { clearInput: true });
    setGameMenuView(initialView);
    document.body.classList.add("game-menu-open");
    openGameMenuButton?.setAttribute("aria-pressed", "true");
    metersPanel?.setAttribute("aria-expanded", "true");
    if (typeof gameMenuDialog.showModal === "function") gameMenuDialog.showModal();
    else gameMenuDialog.setAttribute("open", "");
    focusDialogBoundary(false);
}

function closeGameMenu() {
    if (!gameMenuDialog || !isGameMenuOpen()) return;
    setGamePaused(gameMenuPreviousPause);
    if (typeof gameMenuDialog.close === "function") gameMenuDialog.close();
    else {
        gameMenuDialog.removeAttribute("open");
        restorePauseAfterMenu();
    }
}

function syncSaveSlotUi() {
    const saves = loadManualSaveGames();
    for (const [index, button] of gameSaveSlotButtons.entries()) {
        const slotId = MANUAL_SAVE_SLOT_IDS[index] || button.dataset.saveSlot;
        const save = saves[index];
        const title = document.createElement("strong");
        title.textContent = saveGameSlotLabel(slotId);
        const level = document.createElement("span");
        level.textContent = save ? save.levelTitle : "Empty";
        const checkpoint = document.createElement("small");
        checkpoint.textContent = save
            ? `${save.checkpointLabel || "Level start"} · ${new Date(save.savedAt).toLocaleString()}`
            : (saveSlotMode === "save" ? "Save current level here" : "No saved game");
        button.replaceChildren(title, level, checkpoint);
        button.disabled = saveSlotMode === "load" && !save;
        button.setAttribute("aria-disabled", button.disabled ? "true" : "false");
    }
}

async function handleSaveSlotSelection(slotId) {
    if (!MANUAL_SAVE_SLOT_IDS.includes(slotId)) return false;
    if (saveSlotMode === "save") {
        if (saveManualSlot(slotId)) setGameMenuView("menu");
        return true;
    }
    const save = loadStoredSaveGame(slotId);
    if (!save) {
        syncSaveSlotUi();
        return false;
    }
    const startFromTitle = titleScreenActive;
    closeGameMenu();
    return loadSaveGameRecord(save, { startFromTitle });
}

async function exitToTitleFromMenu() {
    if (isGameMenuOpen()) closeGameMenu();
    showTitleScreen();
}

async function restartCurrentLevel() {
    const options = arguments[0] && typeof arguments[0] === "object" ? arguments[0] : {};
    const targetLevelId = normalizedLevelId(options.levelId || gameState.world?.levelId || START_LEVEL_ID, START_LEVEL_ID);
    const useBrowserCopy = options.useBrowserCopy !== false;
    showLoadingScreen(options.loadingLabel || "Restarting level", 0.04);
    setGamePaused(true, { clearInput: true });
    try {
        const preservedSettings = normalizeGameSettings(gameState.settings);
        const preservedProgression = normalizePlayerProgression(
            options.playerProgression !== undefined ? options.playerProgression : gameState.playerProgression
        );
        gameState = createInitialGameState({
            settings: preservedSettings,
            tuning: resolveGameTuning(installedGameTuning, preservedSettings.tuningOverrides),
            randomSeed: browserRandomSeed(),
            playerProgression: preservedProgression
        });
        if (gameplayRecording) {
            stopGameplayRecording("level-restart", { save: false });
        }
        if (gameplayPlayback) {
            stopGameplayPlayback("level-restart");
        }
        gameState.debug.revision = GAME_REVISION;
        addEvent(gameState, `BUILD_REVISION_${GAME_REVISION}`);
        applyEnemyDefinitionCatalog(gameState, enemyDefinitionCatalog);
        activeCaveWindow = normalizeCaveWindow(null);
        activeLevelMusic = normalizeLevelMusic(null);
        setLoadingProgress(0.12, "Resetting level data");
        const loadedBrowserCopy = useBrowserCopy && maybeApplyBrowserCopyLevel();
        if (!loadedBrowserCopy) {
            await applyRequiredLevel(targetLevelId);
        }
        setLoadingProgress(0.24, "Level data ready");
        activeHardwareRendering = String(renderer.getPerformanceDiagnostics?.().backend || "").startsWith("webgl2");
        renderer.syncCaveWindow(activeCaveWindow);
        await syncRendererLevelAssets(gameState.world, {
            characterStart: 0.24,
            characterSpan: 0.28,
            atlasStart: 0.52,
            atlasSpan: 0.36
        });
        if (!applyLoadedAtlasCollisionsOrException("level restart")) {
            throw new Error(`Required atlas collision data could not be applied for ${targetLevelId}.`);
        }
        renderer.syncEnvironmentColorMap(gameState.world.colorMap, gameState.world.colorExchange);
        setLoadingProgress(0.9, "Prewarming level foreground textures");
        renderer.prewarmLevelPresentationCaches?.(gameState.world);
        accumulator = 0;
        lastRafNow = performance.now();
        lastCallbackArrivalNow = performance.now();
        lastInputFrame = createInputFrame();
        devSingleStepArmed = false;
        levelTransitionLoading = false;
        input.clear();
        syncGameSettingsUi();
        syncSimpleGameTuningUi();
        updateHud();
        updateDebugText();
        setLoadingProgress(1, "Level ready");
        await nextPaint();
        return true;
    } catch (error) {
        const detail = error instanceof Error ? error.message : String(error || "unknown error");
        latchFatalRuntimeFailure(`Ignatius could not safely continue because an essential level restart failed. ${detail}`, error);
        return false;
    } finally {
        hideLoadingScreen();
    }
}

function restorePauseAfterMenu() {
    document.body.classList.remove("game-menu-open");
    openGameMenuButton?.setAttribute("aria-pressed", "false");
    metersPanel?.setAttribute("aria-expanded", "false");
    setGamePaused(gameMenuPreviousPause, { clearInput: true });
}

function isGameAudioMuted() {
    return Boolean(titleScreenActive || gameState.debug.paused || pageFocusLost);
}

function syncGameAudioState() {
    const muted = isGameAudioMuted();
    effectiveSfxVolume = muted ? 0 : clamp01(gameState.settings?.sfxVolume);
    musicDirector.setMuted(muted);
    soundEffectsDirector.setMuted(muted);
    return muted;
}

function setGamePaused(paused, { clearInput = false } = {}) {
    gameState.debug.paused = fatalRuntimeFailure ? true : Boolean(paused);
    if (clearInput) {
        input.clear();
    }
    syncGameAudioState();
    return gameState.debug.paused;
}

function pauseForPageFocusLoss() {
    pageFocusLost = true;
    syncGameAudioState();
    if (creditsActive) {
        setGamePaused(true, { clearInput: true });
        return;
    }
    if (titleScreenActive) {
        setGamePaused(true, { clearInput: true });
        return;
    }
    if (!isGameMenuOpen()) {
        openGameMenu();
    } else {
        setGamePaused(true, { clearInput: true });
    }
}

function restorePageFocusAudioState() {
    pageFocusLost = Boolean(document.hidden);
    syncGameAudioState();
}

function handlePageVisibilityChange() {
    if (document.hidden) {
        pauseForPageFocusLoss();
    } else {
        restorePageFocusAudioState();
    }
}

function setGameMenuView(view) {
    const validViews = new Set(["menu", "settings", "controls", "development", "tuning", "save", "load"]);
    if (view !== "controls") cancelControlBindingCapture();
    gameMenuView = validViews.has(view) ? view : "menu";
    saveSlotMode = gameMenuView === "save" ? "save" : "load";
    const inSettings = gameMenuView === "settings";
    const inControls = gameMenuView === "controls";
    const inDevelopment = gameMenuView === "development";
    const inTuning = gameMenuView === "tuning";
    const inSaveSlots = gameMenuView === "save" || gameMenuView === "load";
    if (gameMenuMain) gameMenuMain.hidden = gameMenuView !== "menu";
    if (gameSettingsPanel) gameSettingsPanel.hidden = !inSettings;
    if (gameControlsPanel) gameControlsPanel.hidden = !inControls;
    if (gameDevelopmentPanel) gameDevelopmentPanel.hidden = !inDevelopment;
    if (gameTuningPanel) gameTuningPanel.hidden = !inTuning;
    if (gameSaveSlotsPanel) gameSaveSlotsPanel.hidden = !inSaveSlots;

    const title = inSettings
        ? "Settings"
        : (inControls
            ? "Controls"
            : (inDevelopment
                ? "Development features"
                : (inTuning
                    ? "Game tuning"
                    : (gameMenuView === "save" ? "Save Game" : (gameMenuView === "load" ? "Load Game" : (titleScreenActive ? "Menu" : "Paused"))))));
    const subtitle = inSettings
        ? "Tune the machinery without disturbing the cave dust."
        : (inControls
            ? "Select an action to change its keyboard or gamepad bindings."
            : (inDevelopment
                ? "Compact guides and diagnostics for testing this build."
                : (inTuning
                    ? "Overrides are saved automatically. Reset returns to resources/config/tuning.json."
                    : (gameMenuView === "save"
                        ? `Current: ${gameState.world?.title || gameState.story?.levelTitle || gameState.world?.levelId || START_LEVEL_ID}. Progress resumes from level start.`
                        : (gameMenuView === "load"
                            ? "Choose a saved level to continue from its checkpoint."
                            : (titleScreenActive ? "Choose where to go next." : "The cave can wait. Probably."))))));
    if (gameMenuTitle) gameMenuTitle.textContent = title;
    if (gameMenuSubtitle) gameMenuSubtitle.textContent = subtitle;
    if (gameMenuBackButton) gameMenuBackButton.textContent = "BACK";
    if (gameMenuExitTitleButton) gameMenuExitTitleButton.hidden = titleScreenActive;
    if (gameMenuSaveButton) gameMenuSaveButton.hidden = titleScreenActive;
    if (inSaveSlots) syncSaveSlotUi();
    if (inTuning) syncSimpleGameTuningUi();
    if (inControls) syncControlBindingsUi();
    if (isGameMenuOpen()) focusDialogBoundary(false);
}

function gameInputBindingLabel(binding) {
    if (!binding) return "Unbound";
    if (binding.startsWith("keyboard:")) {
        const code = binding.slice("keyboard:".length);
        const named = {
            ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→",
            Space: "Space", Enter: "Enter", NumpadEnter: "Num Enter",
            ControlLeft: "Left Ctrl", ControlRight: "Right Ctrl",
            ShiftLeft: "Left Shift", ShiftRight: "Right Shift",
            AltLeft: "Left Alt", AltRight: "Right Alt",
            MetaLeft: "Left Meta", MetaRight: "Right Meta",
            Backspace: "Backspace", Delete: "Delete", Tab: "Tab"
        };
        if (named[code]) return named[code];
        if (/^Key[A-Z]$/.test(code)) return code.slice(3);
        if (/^Digit\d$/.test(code)) return code.slice(5);
        if (/^Numpad\d$/.test(code)) return `Num ${code.slice(6)}`;
        return code.replace(/^Numpad/, "Num ");
    }
    if (binding.startsWith("gamepad:")) {
        const name = binding.slice("gamepad:".length);
        const labels = {
            south: "Gamepad South", east: "Gamepad East", west: "Gamepad West", north: "Gamepad North",
            leftShoulder: "L1", rightShoulder: "R1", leftTrigger: "L2", rightTrigger: "R2",
            back: "Back / Select", start: "Start", leftStick: "L3", rightStick: "R3",
            dpadUp: "D-pad ↑", dpadDown: "D-pad ↓", dpadLeft: "D-pad ←", dpadRight: "D-pad →", home: "Home"
        };
        return labels[name] || name.replace(/^button/, "Gamepad button ");
    }
    return binding;
}

function beginControlBindingCapture(actionId, replaceBinding = "") {
    controlBindingCapture = { actionId, replaceBinding };
    input.clearPendingBindingPresses();
    syncControlBindingsUi();
}

function cancelControlBindingCapture() {
    if (!controlBindingCapture) return;
    controlBindingCapture = null;
    input.clearPendingBindingPresses();
    syncControlBindingsUi();
}

function controlBindingCandidateFits(actionId, candidateBindings) {
    const previousSettings = gameState.settings;
    const previousCapture = controlBindingCapture;
    gameState.settings = {
        ...normalizeGameSettings(previousSettings),
        inputBindings: candidateBindings
    };
    controlBindingCapture = null;
    syncControlBindingsUi();
    const rows = gameControlsPanel?.querySelectorAll?.(".control-binding-row") || [];
    const row = Array.from(rows).find((candidate) => candidate.dataset.actionId === actionId);
    const slots = row?.querySelector?.(".control-binding-slots");
    const fits = !slots || slots.clientWidth <= 0 || slots.scrollWidth <= slots.clientWidth + 1;
    gameState.settings = previousSettings;
    controlBindingCapture = previousCapture;
    syncControlBindingsUi();
    return fits;
}

function completeControlBindingCapture(binding) {
    if (!controlBindingCapture || binding === "keyboard:Escape") return;
    const { actionId, replaceBinding } = controlBindingCapture;
    const candidateBindings = assignInputBinding(gameState.settings.inputBindings, actionId, binding, replaceBinding);
    if (!controlBindingCandidateFits(actionId, candidateBindings)) return;
    controlBindingCapture = null;
    updatePersistentGameSettings({ inputBindings: candidateBindings });
}

function removeControlBinding(actionId, binding) {
    updatePersistentGameSettings({
        inputBindings: removeInputBinding(gameState.settings.inputBindings, actionId, binding)
    });
}

function renderControlBindingRows(container, advanced) {
    if (!container) return;
    container.replaceChildren();
    const settings = normalizeGameSettings(gameState.settings);
    for (const action of GAME_INPUT_ACTIONS.filter((candidate) => Boolean(candidate.advanced) === advanced)) {
        const row = document.createElement("div");
        row.className = `control-binding-row${advanced ? " advanced" : ""}`;
        row.dataset.actionId = action.id;
        row.tabIndex = 0;
        row.setAttribute("role", "button");
        row.setAttribute("aria-label", `Add a binding for ${action.label}`);

        const name = document.createElement("div");
        name.className = "control-binding-name";
        name.textContent = action.label;
        const slots = document.createElement("div");
        slots.className = "control-binding-slots";

        const capturing = controlBindingCapture?.actionId === action.id;
        if (capturing) {
            const message = document.createElement("span");
            message.className = "control-binding-capture-message";
            message.textContent = "Press key to use or hit Escape...";
            slots.append(message);
        } else {
            if (action.id === "pause") {
                const fixed = document.createElement("span");
                fixed.className = "control-binding-fixed";
                fixed.textContent = "Esc (fixed)";
                slots.append(fixed);
            }
            for (const binding of settings.inputBindings[action.id] || []) {
                const chip = document.createElement("button");
                chip.type = "button";
                chip.className = "control-binding-chip";
                chip.textContent = gameInputBindingLabel(binding);
                chip.setAttribute("aria-label", `Unbind ${gameInputBindingLabel(binding)} from ${action.label}`);
                chip.addEventListener("click", (event) => {
                    event.stopPropagation();
                    removeControlBinding(action.id, binding);
                });
                slots.append(chip);
            }
        }

        const beginCaptureFromRow = (event) => {
            if (event?.target?.closest?.(".control-binding-chip, .control-binding-fixed")) return;
            beginControlBindingCapture(action.id);
        };
        row.addEventListener("click", beginCaptureFromRow);
        row.addEventListener("keydown", (event) => {
            if (event?.target?.closest?.(".control-binding-chip, .control-binding-fixed")) return;
            if (!['Enter', 'NumpadEnter', 'Space'].includes(event.code)) return;
            event.preventDefault();
            event.stopPropagation();
            beginControlBindingCapture(action.id);
        });
        row.append(name, slots);
        container.append(row);
    }
}

function syncControlBindingsUi() {
    if (controlBindingsAdvanced) controlBindingsAdvanced.hidden = !controlBindingsAdvancedOpen;
    if (controlBindingsAdvancedToggle) {
        controlBindingsAdvancedToggle.setAttribute("aria-expanded", String(controlBindingsAdvancedOpen));
        controlBindingsAdvancedToggle.textContent = controlBindingsAdvancedOpen ? "Hide advanced bindings" : "Advanced bindings...";
    }
    renderControlBindingRows(controlBindingsMain, false);
    renderControlBindingRows(controlBindingsAdvanced, true);
}

function updatePersistentGameSettings(patch) {
    gameState.settings = saveStoredGameSettings({
        ...normalizeGameSettings(gameState.settings),
        ...patch
    });
    syncGameSettingsUi();
}

function activeRenderingModeId() {
    const software = !activeHardwareRendering;
    const speedhack = activeBakingMode === "tiles";
    if (software) return speedhack ? "softwareSpeedhack" : "softwareRegular";
    return speedhack ? "hardwareSpeedhack" : "hardwareRegular";
}

function syncGameSettingsUi() {
    gameState.settings = normalizeGameSettings(gameState.settings);
    const settings = gameState.settings;
    const difficulty = gameDifficultyPreset(settings);
    const quality = gameRenderingQualityPreset(settings);
    const renderingMode = gameRenderingModePreset(settings);
    input.setInputBindings(settings.inputBindings);
    if (gameMenuView === "controls") syncControlBindingsUi();
    if (sfxVolumeInput) sfxVolumeInput.value = String(settings.sfxVolume);
    if (musicVolumeInput) musicVolumeInput.value = String(settings.musicVolume);
    if (fullscreenInput) fullscreenInput.checked = Boolean(settings.fullscreen);
    if (showMinimapInput) showMinimapInput.checked = Boolean(settings.showMinimap);
    syncDevelopmentToolVisibility();
    syncStaticBakeRendererSetting();
    if (minimapPanel) minimapPanel.hidden = !settings.showMinimap;
    syncHudPanelsToViewport();
    if (settings.showMinimap) {
        resizeMinimapToLevel();
        drawMinimap(true);
    }
    if (sfxVolumeValue) sfxVolumeValue.textContent = `${Math.round(settings.sfxVolume * 100)}%`;
    if (musicVolumeValue) musicVolumeValue.textContent = `${Math.round(settings.musicVolume * 100)}%`;
    musicDirector.setVolume(settings.musicVolume);
    soundEffectsDirector.setVolume(settings.sfxVolume);
    syncGameAudioState();
    if (difficultyValue) difficultyValue.textContent = difficulty.label;
    if (renderingQualityValue) renderingQualityValue.textContent = quality.label;
    if (renderingModeValue) renderingModeValue.textContent = renderingMode.label;
    if (renderingModeSelect) renderingModeSelect.value = settings.renderingMode;
    for (const button of difficultyButtons) {
        button.setAttribute("aria-pressed", String(button.dataset.difficulty === settings.difficulty));
    }
    for (const button of renderingQualityButtons) {
        button.setAttribute("aria-pressed", String(button.dataset.renderingQuality === settings.renderingQuality));
    }
    if (renderingModeStatus) {
        renderingModeStatus.textContent = activeRenderingModeId() === settings.renderingMode
            ? `${renderingMode.detail} is active.`
            : `${renderingMode.detail} will be active after reloading the game.`;
    }
}

async function initializeFullscreenUi() {
    fullscreenActive = await readFullscreenState(electronWindowBridge, document);
    syncFullscreenUi();
    syncGameSettingsUi();
}

async function requestFullscreenState(nextState) {
    if (fullscreenRequestPending) return fullscreenActive;
    const enabled = Boolean(nextState);
    if (enabled === fullscreenActive) return fullscreenActive;
    fullscreenRequestPending = true;
    try {
        fullscreenActive = await setFullscreenState(enabled, electronWindowBridge, document);
    } catch (error) {
        console.warn("Fullscreen could not be changed.", error);
        fullscreenActive = await readFullscreenState(electronWindowBridge, document);
    } finally {
        fullscreenRequestPending = false;
        syncFullscreenUi();
        syncGameSettingsUi();
    }
    return fullscreenActive;
}

async function toggleFullscreen() {
    const next = !fullscreenActive;
    gameState.settings = saveStoredGameSettings({
        ...normalizeGameSettings(gameState.settings),
        fullscreen: next
    });
    return requestFullscreenState(next);
}

async function applyFullscreenPreference() {
    if (!gameState.settings?.fullscreen || fullscreenActive || fullscreenRequestPending) return fullscreenActive;
    if (!electronWindowBridge && navigator.userActivation && !navigator.userActivation.isActive) {
        return fullscreenActive;
    }
    return requestFullscreenState(true);
}

function unlockMusicFromGesture() {
    void musicDirector.unlock();
    void soundEffectsDirector.unlock();
}

function attemptVisibleLevelMusicStart() {
    if (titleScreenActive || isGameAudioMuted()) return Promise.resolve(false);
    return musicDirector.unlock();
}

function syncFullscreenUi() {
    renderer?.setFullscreenPresentationEnabled?.(fullscreenActive);
    syncHudPanelsToViewport();
    if (fullscreenToggleButton) {
        fullscreenToggleButton.hidden = false;
        fullscreenToggleButton.textContent = fullscreenActive ? "WINDOWED" : "FULLSCREEN";
        fullscreenToggleButton.setAttribute("aria-pressed", String(fullscreenActive));
        fullscreenToggleButton.setAttribute("aria-label", fullscreenActive ? "Exit fullscreen" : "Enter fullscreen");
    }
    if (fullscreenInput) fullscreenInput.checked = Boolean(gameState.settings?.fullscreen);
}

function staticBakeRendererAvailable() {
    return Boolean(
        ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER &&
        renderer?.supportsExperimentalStaticLayerBakeRenderer?.() !== false
    );
}

function syncDevelopmentToolVisibility() {
    if (toolLinks) toolLinks.hidden = !Boolean(gameState.settings?.developmentMode);
}

function syncStaticBakeRendererSetting() {
    const settings = normalizeGameSettings(gameState.settings);
    const requestedHardware = Boolean(settings.useHardwareRendering);
    if (requestedHardware !== activeHardwareRendering) return;
    const requestedMode = settings.bakingMode === "tiles" && staticBakeRendererAvailable() ? "tiles" : "off";
    renderer?.setStaticLayerBakeMode?.(requestedMode);
    activeBakingMode = requestedMode;
}

function setupPanelToggleButtons() {
    const updateAssetGuides = () => {
        const active = Boolean(gameState.debug.showAssetGuides);
        if (assetGuidesButton) {
            assetGuidesButton.textContent = `Asset guides: ${active ? "on" : "off"}`;
            assetGuidesButton.setAttribute("aria-pressed", active ? "true" : "false");
        }
        if (developmentAssetGuidesInput) developmentAssetGuidesInput.checked = active;
    };

    const updateCameraLine = () => {
        const active = Boolean(gameState.debug.showCameraLine);
        if (developmentCameraLineInput) developmentCameraLineInput.checked = active;
    };

    const updatePuppetGuide = () => {
        const active = Boolean(gameState.debug.showPuppetGuide);
        if (puppetGuideButton) {
            puppetGuideButton.textContent = `Enemy guide: ${active ? "on" : "off"}`;
            puppetGuideButton.setAttribute("aria-pressed", active ? "true" : "false");
        }
        if (developmentEnemyGuideInput) developmentEnemyGuideInput.checked = active;
    };

    const updateDebugPanel = () => {
        const visible = Boolean(debugEl && !debugEl.hidden);
        if (debugPanelButton) {
            debugPanelButton.textContent = `Debug panel: ${visible ? "on" : "off"}`;
            debugPanelButton.setAttribute("aria-pressed", visible ? "true" : "false");
        }
        if (developmentDebugPanelInput) developmentDebugPanelInput.checked = visible;
        if (visible) {
            updateDebugText();
        }
    };


    const updateHelpPanel = () => {
        if (!helpPanelButton || !helpPanel) {
            return;
        }
        const visible = !helpPanel.hidden;
        helpPanelButton.textContent = `Help panel: ${visible ? "on" : "off"}`;
        helpPanelButton.setAttribute("aria-pressed", visible ? "true" : "false");
    };

    updateMicroProfilerControls = (message = "") => {
        const status = microStutterProfiler.status();
        if (microProfilerButton) {
            microProfilerButton.textContent = `Profiler: ${status.enabled ? "on" : "off"}`;
            microProfilerButton.setAttribute("aria-pressed", status.enabled ? "true" : "false");
            microProfilerButton.title = message || (status.enabled
                ? "Recording every callback, frame phase, shown transform, and renderer mode. Click again to stop and copy JSON."
                : "Click to start a fresh micro-stutter recording; click again to stop and copy JSON.");
        }
    };

    updateGameplayRecordingControls = (message = "") => {
        const active = Boolean(gameplayRecording);
        const saving = gameplayRecordingSaveTasks.size > 0;
        const retainedCount = gameplayRetainedRecordings.size;
        const disabled = Boolean(gameplayPlayback?.active);
        const stateLabel = active ? "On" : saving ? "Saving" : retainedCount ? `Retained ${retainedCount}` : "Off";
        const title = message || (disabled
            ? "Gameplay recording is disabled while playback is active."
            : active
                ? "Click to stop gameplay recording and save JSON."
                : saving
                    ? "A stopped recording is being saved. You may start another capture without invalidating it."
                    : retainedCount
                        ? `${retainedCount} recording${retainedCount === 1 ? " is" : "s are"} retained in browser storage. A new capture will not delete them.`
                        : "Click to start gameplay recording from the current state.");
        if (gameplayRecordingButton) {
            gameplayRecordingButton.textContent = `Recording: ${stateLabel}`;
            gameplayRecordingButton.setAttribute("aria-pressed", active ? "true" : "false");
            gameplayRecordingButton.disabled = disabled;
            gameplayRecordingButton.title = title;
        }
        if (developmentRecordingButton) {
            developmentRecordingButton.textContent = `Recording: ${stateLabel}`;
            developmentRecordingButton.setAttribute("aria-pressed", active ? "true" : "false");
            developmentRecordingButton.disabled = disabled;
            developmentRecordingButton.title = title;
        }
    };

    updateGameplayPlaybackControls = (message = "") => {
        const active = Boolean(gameplayPlayback?.active);
        const paused = Boolean(gameplayPlayback?.pausedForKey);
        const label = active ? `Playback: ${paused ? "Paused" : "On"}` : "Playback JSON...";
        const title = message || (active
            ? "Playback is active. Press any key when paused, or use the developer console to stop playback."
            : "Load a gameplay recording JSON and replay it visually.");
        if (gameplayPlaybackButton) {
            gameplayPlaybackButton.textContent = label;
            gameplayPlaybackButton.setAttribute("aria-pressed", active ? "true" : "false");
            gameplayPlaybackButton.title = title;
        }
        if (developmentPlaybackButton) {
            developmentPlaybackButton.textContent = label;
            developmentPlaybackButton.setAttribute("aria-pressed", active ? "true" : "false");
            developmentPlaybackButton.disabled = Boolean(gameplayRecording);
            developmentPlaybackButton.title = gameplayRecording
                ? "Gameplay playback is disabled while recording is active."
                : title;
        }
    };

    updateDebugLoggingControls = (message = "") => {
        const active = Boolean(gameplayDebugLog);
        if (developmentDebugLoggingInput) {
            developmentDebugLoggingInput.checked = active;
            developmentDebugLoggingInput.title = message || (active
                ? "One structured runtime snapshot is being collected per second. Disable to download the log."
                : "Enable periodic structured runtime snapshots. The browser downloads the NDJSON log when disabled.");
        }
    };

    const copyCurrentMicroProfile = (message = "Copying micro-stutter profile to the clipboard…") => {
        updateMicroProfilerControls(message);
        copyMicroStutterProfileToClipboard()
            .then(({ bytes, samples }) => {
                updateMicroProfilerControls(`Copied ${samples} samples (${bytes} bytes) to the clipboard.`);
                console.log(`Micro-stutter profile copied to clipboard (${samples} samples, ${bytes} bytes).`);
            })
            .catch((error) => {
                updateMicroProfilerControls("Clipboard copy failed; profile JSON was logged and saved on window.__rocketfrockLastMicroStutterProfile.");
                console.warn("Micro-stutter profile clipboard copy failed.", error);
                console.log(window.__rocketfrockLastMicroStutterProfile);
            });
    };


    debugEl.hidden = true;
    helpPanel.hidden = true;

    assetGuidesButton?.addEventListener("click", () => {
        gameState.debug.showAssetGuides = !gameState.debug.showAssetGuides;
        updateAssetGuides();
    });

    puppetGuideButton?.addEventListener("click", () => {
        gameState.debug.showPuppetGuide = !gameState.debug.showPuppetGuide;
        updatePuppetGuide();
    });

    debugPanelButton?.addEventListener("click", () => {
        debugEl.hidden = !debugEl.hidden;
        updateDebugPanel();
    });

    developmentAssetGuidesInput?.addEventListener("change", () => {
        gameState.debug.showAssetGuides = developmentAssetGuidesInput.checked;
        updateAssetGuides();
    });

    developmentCameraLineInput?.addEventListener("change", () => {
        gameState.debug.showCameraLine = developmentCameraLineInput.checked;
        updateCameraLine();
    });

    developmentEnemyGuideInput?.addEventListener("change", () => {
        gameState.debug.showPuppetGuide = developmentEnemyGuideInput.checked;
        updatePuppetGuide();
    });

    developmentDebugPanelInput?.addEventListener("change", () => {
        if (debugEl) debugEl.hidden = !developmentDebugPanelInput.checked;
        updateDebugPanel();
    });

    developmentDebugLoggingInput?.addEventListener("change", () => {
        if (developmentDebugLoggingInput.checked) startGameplayDebugLogging("development-menu");
        else stopGameplayDebugLogging("development-menu");
    });

    helpPanelButton?.addEventListener("click", () => {
        helpPanel.hidden = !helpPanel.hidden;
        updateHelpPanel();
    });


    microProfilerButton?.addEventListener("click", () => {
        if (!microStutterProfiler.isEnabled()) {
            startMicroStutterProfiler({
                label: "button-all-frames",
                thresholdMs: 0,
                rafGapMs: 0,
                maxSamples: 900
            });
                    updateMicroProfilerControls("Recording every frame. Click Profiler again immediately after a visible hitch to stop and copy.");
            return;
        }
        stopMicroStutterProfiler();
            copyCurrentMicroProfile();
    });


    gameplayRecordingButton?.addEventListener("click", () => {
        if (gameplayRecording) {
            stopGameplayRecording("button");
            return;
        }
        startGameplayRecording("button");
    });

    gameplayPlaybackButton?.addEventListener("click", () => {
        if (gameplayPlayback?.active) {
            stopGameplayPlayback("button");
            return;
        }
        gameplayPlaybackFileInput?.click();
    });


    developmentRecordingButton?.addEventListener("click", () => {
        if (gameplayRecording) stopGameplayRecording("development-menu");
        else startGameplayRecording("development-menu");
    });

    developmentPlaybackButton?.addEventListener("click", () => {
        if (gameplayRecording) return;
        if (gameplayPlayback?.active) {
            stopGameplayPlayback("development-menu");
            return;
        }
        gameplayPlaybackFileInput?.click();
    });

    gameplayPlaybackFileInput?.addEventListener("change", () => {
        const file = gameplayPlaybackFileInput.files?.[0] || null;
        gameplayPlaybackFileInput.value = "";
        if (!file) return;
        loadGameplayRecordingFromFile(file)
            .then((recording) => startGameplayPlayback(recording, { source: file.name, restoreInitialState: true }))
            .catch((error) => {
                console.warn("Gameplay playback file could not be loaded.", error);
                showGameNotice(`Could not load gameplay playback JSON.\n\n${error.message}`, { okText: "OK" });
            });
    });


    updateAssetGuides();
    updateCameraLine();
    updatePuppetGuide();
    updateDebugPanel();
    updateHelpPanel();
    updateMicroProfilerControls();
    updateGameplayRecordingControls();
    updateGameplayPlaybackControls();
    updateDebugLoggingControls();
    syncDevelopmentToolVisibility();
    syncStaticBakeRendererSetting();
}

function applyLoadedAtlasCollisions() {
    if (!renderer || typeof renderer.getEnvironmentManifests !== "function") {
        return false;
    }
    return applyAtlasManifestsToWorld(gameState, renderer.getEnvironmentManifests());
}

function applyLoadedAtlasCollisionsOrException(context) {
    if (applyLoadedAtlasCollisions()) return true;
    const message = `Atlas collision fallback remained active during ${context}`;
    console.error(message);
    recordDebugExceptionAlert(gameState, {
        type: "atlasCollisionFallback",
        context,
        atlasManifests: [...(gameState.world?.atlasManifests || [])],
        message
    });
    return false;
}

function frame(now) {
    if (fatalRuntimeFailure) {
        accumulator = 0;
        if (gameState?.debug) gameState.debug.paused = true;
        input.clear();
        syncGameAudioState();
        return;
    }
    const callbackArrivalNow = performance.now();
    const callbackEntryGapMs = Math.max(0, callbackArrivalNow - lastCallbackArrivalNow);
    lastCallbackArrivalNow = callbackArrivalNow;
    const profileEnabled = microStutterProfiler.isEnabled();
    const profileStartMs = profileEnabled ? callbackArrivalNow : 0;
    const callbackLatenessMs = profileEnabled ? Math.max(0, callbackArrivalNow - now) : 0;
    if (profileEnabled) {
        lastProfilerCallbackEntryMs = profileStartMs;
    } else {
        }
    const rafGapMs = Math.max(0, now - lastRafNow);
    const measuredRealDt = Math.min(0.1, callbackEntryGapMs / 1000);
    let realDt = measuredRealDt;
    lastRafNow = now;
    if (creditsActive) {
        accumulator = 0;
        input.clear();
        if (!updateCreditsGamepadInterrupt()) updateCreditsRoll(realDt);
        syncGameAudioState();
        requestAnimationFrame(frame);
        return;
    }
    let profileAfterInputMs = profileStartMs;
    let profileBeforeSimulationMs = profileStartMs;
    let profileAfterSimulationMs = profileStartMs;
    let profileAfterPostSimulationMs = profileStartMs;
    let profileAfterRenderMs = profileStartMs;
    let profileAfterHudMs = profileStartMs;

    let inputFrame = createInputFrame();
    const playbackResult = gameplayPlayback?.active ? takeGameplayPlaybackFrame() : { kind: "inactive" };
    if (playbackResult.kind === "frame") {
        inputFrame = inputFrameFromSnapshot(playbackResult.frame.input);
        realDt = recordingFrameDtSeconds(playbackResult.frame);
    } else if (playbackResult.kind === "paused" || playbackResult.kind === "complete") {
        realDt = 0;
    } else {
        inputFrame = input.sample({ consumeGameplayEdges: false });
        if (controlBindingCapture) {
            const binding = input.takeBindingPress();
            if (binding && !binding.startsWith("keyboard:")) completeControlBindingCapture(binding);
        }
        if (!isGameMenuOpen() && !titleScreenActive) {
            if (inputFrame.pausePressed) {
                openGameMenu("menu");
                inputFrame.pausePressed = false;
            }
            handleDebugInput(inputFrame);
        }
    }
    syncGameAudioState();
    const viewportMetrics = renderer.getViewportMetrics?.();
    if (viewportMetrics) {
        gameState.camera.viewportWidth = Math.max(1, Number(viewportMetrics.virtualW) || gameState.camera.viewportWidth || 1280);
        gameState.camera.viewportHeight = Math.max(1, Number(viewportMetrics.virtualH) || gameState.camera.viewportHeight || 720);
    }
    if (profileEnabled) profileAfterInputMs = performance.now();

    if (levelTransitionLoading) {
        accumulator = 0;
    } else if (!gameState.debug.paused) {
        accumulator += realDt;
    } else if (devSingleStepArmed) {
        accumulator += FIXED_DT;
        devSingleStepArmed = false;
    }

    if (profileEnabled) profileBeforeSimulationMs = performance.now();
    let safety = 0;
    while (!levelTransitionLoading && accumulator >= FIXED_DT && safety < 8) {
        const stepInput = createSubstepInputFrame(inputFrame, safety);
        stepSimulation(gameState, stepInput, FIXED_DT);
        soundEffectsDirector.processEvents(gameState.debug?.lastEvents, gameState);
        soundEffectsDirector.processState(gameState, gameState.clock?.fixedDt || (1 / 60));
        processDebugExceptionAlerts();
        if (safety === 0) {
            input.consumeGameplayEdges(stepInput);
        }
        accumulator -= FIXED_DT;
        safety += 1;
    }
    if (profileEnabled) profileAfterSimulationMs = performance.now();

    lastInputFrame = inputFrame;
    if (!gameplayPlayback?.active) {
        gamepadHaptics.update(gameState, inputFrame);
    }
    const presentationBlend = gameState.debug.paused
        ? 1
        : clamp01(accumulator / FIXED_DT);
    preparePresentationFrame(gameState, presentationBlend);
    if (profileEnabled) profileAfterPostSimulationMs = performance.now();
    renderer.render(gameState, inputFrame, realDt);
    if (profileEnabled) profileAfterRenderMs = performance.now();
    recordGameplayFrame({
        requestedAtMs: now,
        callbackArrivalMs: callbackArrivalNow,
        callbackEntryGapMs,
        rafGapMs,
        realDt,
        inputFrame,
        fixedSteps: safety,
        accumulatorMs: accumulator * 1000,
        interpolationBlend: presentationBlend
    });
    appendGameplayDebugLogSample(callbackArrivalNow);
    processLevelTransitionRequest();
    updateHud();
    if (profileEnabled) profileAfterHudMs = performance.now();
    updateDebugText();
    if (profileEnabled) {
        const profileEndMs = performance.now();
        const inputMs = profileAfterInputMs - profileStartMs;
        const simulationMs = profileAfterSimulationMs - profileBeforeSimulationMs;
        const postSimulationMs = profileAfterPostSimulationMs - profileAfterSimulationMs;
        const renderMs = profileAfterRenderMs - profileAfterPostSimulationMs;
        const hudMs = profileAfterHudMs - profileAfterRenderMs;
        const debugMs = profileEndMs - profileAfterHudMs;
        const workMs = profileEndMs - profileStartMs;
        const rendererDiagnostics = renderer.getPerformanceDiagnostics?.() || null;
        const playerCurrent = gameState.player?.currentTransform || gameState.player || {};
        const playerShown = gameState.player?.shownTransform || playerCurrent;
        const cameraCurrent = gameState.camera?.currentTransform || gameState.camera || {};
        const cameraShown = gameState.camera?.shownTransform || cameraCurrent;
        microStutterProfiler.recordFrame({
            tick: gameState.clock.tick,
            time: gameState.clock.time,
            workMs,
            rafGapMs,
            callbackEntryGapMs,
            callbackLatenessMs,
            realDtMs: realDt * 1000,
            fixedSteps: safety,
            accumulatorMs: accumulator * 1000,
            interpolationBlend: presentationBlend,
            inputMs,
            simulationMs,
            postSimulationMs,
            renderMs,
            hudMs,
            debugMs,
            otherMs: Math.max(0, workMs - inputMs - simulationMs - postSimulationMs - renderMs - hudMs - debugMs),
            paused: gameState.debug.paused,
            titleScreen: titleScreenActive,
            renderMode: {
                backend: rendererDiagnostics?.backend || "unknown",
                bakingMode: rendererDiagnostics?.staticBakeMode || gameState.settings?.bakingMode || "off",
                hardwareRequested: Boolean(gameState.settings?.useHardwareRendering)
            },
            presentation: {
                playerCurrentX: Number(playerCurrent.x) || 0,
                playerCurrentY: Number(playerCurrent.y) || 0,
                playerShownX: Number(playerShown.x) || 0,
                playerShownY: Number(playerShown.y) || 0,
                cameraCurrentX: Number(cameraCurrent.x) || 0,
                cameraCurrentY: Number(cameraCurrent.y) || 0,
                cameraShownX: Number(cameraShown.x) || 0,
                cameraShownY: Number(cameraShown.y) || 0
            },
            presentationSnap: readPresentationSnapDiagnostics(),
            renderer: rendererDiagnostics
        });
    }
    requestAnimationFrame(frame);
}

function handleDebugInput(inputFrame) {
    if (fatalRuntimeFailure) return;
    if (inputFrame.debugPausePressed) {
        setGamePaused(!gameState.debug.paused);
    }
    if (inputFrame.stepPressed) {
        setGamePaused(true);
        devSingleStepArmed = true;
    }
    if (inputFrame.resetPressed) {
        resetPlayer(gameState, "manualShortcut");
    }
    if (inputFrame.toggleHitboxesPressed) {
        gameState.debug.showHitboxes = !gameState.debug.showHitboxes;
    }
    if (inputFrame.toggleVelocityPressed) {
        gameState.debug.showVelocity = !gameState.debug.showVelocity;
    }
    if (inputFrame.toggleCollisionPressed) {
        gameState.debug.showCollision = !gameState.debug.showCollision;
    }
    if (inputFrame.exportStatePressed) {
        exportState();
    }
    if (inputFrame.toggleInputConsoleLogPressed) {
        const next = !input.isConsoleLoggingEnabled();
        input.setConsoleLogging(next);
        gameState.debug.inputConsoleLogging = next;
        console.log(`Rocketfrock input console logging ${next ? "enabled" : "disabled"}`);
    }
    if (inputFrame.toggleDebugPanelPressed) {
        debugEl.hidden = !debugEl.hidden;
        if (debugPanelButton) {
            const visible = !debugEl.hidden;
            debugPanelButton.textContent = `Debug panel: ${visible ? "on" : "off"}`;
            debugPanelButton.setAttribute("aria-pressed", visible ? "true" : "false");
            if (visible) {
                updateDebugText();
            }
        }
    }
}


function displayedLevelNumber(levelId) {
    const match = /^level_(\d+)$/i.exec(String(levelId || ""));
    return match ? Math.max(1, Number(match[1]) || 1) : null;
}


function activeBossEnemy() {
    const bosses = (gameState.enemies || []).filter((enemy) => enemy?.isBoss === true && Number(enemy.health) > 0);
    return bosses.find((enemy) => enemy.engaged === true || enemy.alerted === true || Number(enemy.health) < Number(enemy.maxHealth)) || null;
}

function setHudText(cacheKey, element, text) {
    if (!element || hudRenderCache[cacheKey] === text) {
        return;
    }
    hudRenderCache[cacheKey] = text;
    element.textContent = text;
}

function setHudTitle(cacheKey, element, text) {
    if (!element || hudRenderCache[cacheKey] === text) {
        return;
    }
    hudRenderCache[cacheKey] = text;
    element.title = text;
}

function setHudWidth(cacheKey, element, width) {
    if (!element || hudRenderCache[cacheKey] === width) {
        return;
    }
    hudRenderCache[cacheKey] = width;
    element.style.width = width;
}

function setHudHidden(cacheKey, element, hidden) {
    if (!element || hudRenderCache[cacheKey] === hidden) {
        return;
    }
    hudRenderCache[cacheKey] = hidden;
    element.hidden = hidden;
}

function setHudClass(cacheKey, element, className, enabled) {
    if (!element || hudRenderCache[cacheKey] === enabled) {
        return;
    }
    hudRenderCache[cacheKey] = enabled;
    element.classList.toggle(className, enabled);
}

function updateBossHud() {
    if (!bossHud) return;
    const boss = activeBossEnemy();
    setHudHidden("bossHidden", bossHud, !boss);
    if (!boss) return;
    const maximum = Math.max(1, Number(boss.maxHealth) || Number(boss.health) || 1);
    const current = Math.max(0, Math.min(maximum, Number(boss.health) || 0));
    setHudText("bossName", bossName, String(boss.bossName || "Boss"));
    setHudText("bossHealthText", bossHealthText, `${Math.round(current)} / ${Math.round(maximum)} HP`);
    setHudWidth("bossHealthWidth", bossHealthFill, `${(current / maximum * 100).toFixed(1)}%`);
}

function updateHud() {
    drawMinimap();
    updateBossHud();
    const levelNumber = displayedLevelNumber(gameState.world?.levelId);
    const levelTitle = String(gameState.story?.levelTitle || "Untitled Cave").trim() || "Untitled Cave";
    const displayedLevelTitle = levelNumber === null ? levelTitle : `Level ${levelNumber}: ${levelTitle}`;
    setHudText("levelTitleText", levelTitleText, displayedLevelTitle);
    setHudTitle("levelTitleTitle", levelTitleText, displayedLevelTitle);
    setHudText("scoreText", scoreText, `Score: ${Math.max(0, Math.floor(Number(gameState.score) || 0))}`);

    const fuelPercent = Math.max(0, Math.min(100, gameState.fuel.amount / Math.max(1, gameState.fuel.max) * 100));
    const healthPercent = Math.max(0, Math.min(100, gameState.health.amount / Math.max(1, gameState.health.max) * 100));
    setHudWidth("fuelWidth", fuelFill, `${fuelPercent.toFixed(1)}%`);
    setHudWidth("healthWidth", healthFill, `${healthPercent.toFixed(1)}%`);
    setHudClass("healthRegenerating", healthFill, "regenerating", gameState.health.regenerating === true);
    setHudClass("healthRecentlyDamaged", healthFill, "recently-damaged", (Number(gameState.health.invulnerabilityTimer) || 0) > 0);
    setHudText("fuelText", fuelText, `${Math.round(gameState.fuel.amount)} / ${Math.round(gameState.fuel.max)} %`);
    setHudText("healthText", healthText, `${Math.round(gameState.health.amount)} / ${Math.round(gameState.health.max)} HP`);

    const displayedEffect = shortestRemainingActivePowerUpEffect(gameState);
    if (!displayedEffect) {
        setHudText("powerText", powerText, "Powerup:");
        setHudText("powerTime", powerTime, "");
        setHudWidth("powerWidth", powerFill, "0%");
        return;
    }

    setHudText("powerText", powerText, `Powerup: ${powerUpHudLabel(displayedEffect.definition)}`);
    if (displayedEffect.definition.permanent) {
        setHudText("powerTime", powerTime, "∞");
        setHudWidth("powerWidth", powerFill, "100%");
        return;
    }

    const totalSeconds = Math.max(0.1, Number(displayedEffect.definition.durationSeconds) || 0.1);
    const remainingSeconds = Math.max(0, Math.min(totalSeconds, Number(displayedEffect.remainingSeconds) || 0));
    const displayedRemaining = remainingSeconds.toFixed(1);
    const displayedTotal = Number.isInteger(totalSeconds) ? totalSeconds.toFixed(0) : totalSeconds.toFixed(1);
    setHudText("powerTime", powerTime, `${displayedRemaining} / ${displayedTotal} s`);
    setHudWidth("powerWidth", powerFill, `${(remainingSeconds / totalSeconds * 100).toFixed(1)}%`);
}

function updateDebugText() {
    if (!debugEl || debugEl.hidden) {
        return;
    }
    const p = gameState.player;
    const fuel = gameState.fuel;
    const inputText = gameState.debug.showInput
        ? `input L:${Number(lastInputFrame.moveLeft)} R:${Number(lastInputFrame.moveRight)} jump:${Number(lastInputFrame.jumpHeld)} interact:${Number(lastInputFrame.interactHeld)} weapon:${Number(lastInputFrame.weaponHeld)}`
        : "input hidden";
    const events = filteredDebugEvents(gameState.debug.lastEvents, gameState.debug.eventFilterText)
        .slice(-8)
        .map((event) => `${String(event.tick).padStart(5, " ")} ${event.type}`)
        .join("\n");
    const inputEvents = input.getRecentEvents(6)
        .map((event) => `${event.time.toFixed(3)} ${event.kind.padEnd(5)} ${event.code}${event.repeat ? " repeat" : ""}`)
        .join("\n");

    const animation = renderer.getAnimationDiagnostics?.() || {};
    const animationText = animation.available
        ? `anim:${animation.mode || "data"} clip:${animation.clipId || "none"}`
        : "anim:unavailable clip:none";

    const viewport = renderer.getViewportMetrics?.() || {};
    const viewText = viewport.clientW
        ? `view css:${viewport.clientW.toFixed(0)}x${viewport.clientH.toFixed(0)} virt:${viewport.virtualW.toFixed(0)}x${viewport.virtualH.toFixed(0)} scale:${viewport.cssScale.toFixed(2)}`
        : "view pending";
    const runtimeProjects = renderer.getRuntimeCharacterProjects?.() || new Map();
    const characterText = `characters:${[...runtimeProjects.keys()].join(",") || "none"}`;
    const performanceStats = renderer.getPerformanceDiagnostics?.() || {};
    const performanceText = Number.isFinite(performanceStats.averageFrameMs)
        ? `render:${performanceStats.backend || "canvas2d"} avg:${performanceStats.averageFrameMs.toFixed(2)}ms last:${performanceStats.frameMs.toFixed(2)}ms observed:${performanceStats.observedFps.toFixed(0)}fps world:${performanceStats.worldMs.toFixed(2)} actors:${performanceStats.actorsMs.toFixed(2)} foreground:${performanceStats.foregroundMs.toFixed(2)} mask:${performanceStats.maskMs.toFixed(2)} overlay:${performanceStats.overlayMs.toFixed(2)}`
        : "render diagnostics pending";
    const gpuPerformanceText = String(performanceStats.backend || "").startsWith("webgl2")
        ? `gpu draws:${performanceStats.gpuDrawCalls || 0} quads:${performanceStats.gpuQuads || 0} uploads:${performanceStats.gpuTextureUploads || 0} updates:${performanceStats.gpuTextureUpdates || 0} layers:${performanceStats.gpuCanvasLayerUploads || 0} textures:${performanceStats.gpuTextureCount || 0} resident:${((performanceStats.gpuResidentTextureBytes || 0) / (1024 * 1024)).toFixed(1)}MiB${performanceStats.gpuContextLost ? " CONTEXT-LOST" : ""}`
        : "gpu: Canvas 2D fallback";
    const visualPerformanceText = Number.isFinite(performanceStats.visualsConsidered)
        ? `visuals considered:${performanceStats.visualsConsidered} drawn:${performanceStats.visualsDrawn} culled:${performanceStats.visualsCulled} spatial:${performanceStats.visualsSpatialCulled || 0} dynamic considered:${performanceStats.dynamicConsidered} drawn:${performanceStats.dynamicDrawn} culled:${performanceStats.dynamicCulled} foreground-cache hit:${performanceStats.foregroundCacheHits} miss:${performanceStats.foregroundCacheMisses} mask-cache:${performanceStats.maskReused ? "hit" : "miss"}`
        : "visual diagnostics pending";
    const profilerStatus = microStutterProfiler.status();
    const profilerText = profilerStatus.enabled || profilerStatus.capturedFrames
        ? `microProfiler:${profilerStatus.enabled ? "on" : "off"} samples:${profilerStatus.capturedFrames}/${profilerStatus.totalFrames} threshold:${profilerStatus.thresholdMs}ms gap:${profilerStatus.rafGapMs}ms maxWork:${profilerStatus.summary.maxWorkMs.toFixed(2)} maxRaf:${profilerStatus.summary.maxRafGapMs.toFixed(2)} maxEntry:${profilerStatus.summary.maxCallbackEntryGapMs.toFixed(2)} marks:${profilerStatus.marks.length} long:${profilerStatus.summary.longFrames}`
        : "microProfiler:off";
    const staticBakeStatus = renderer?.getStaticLayerBakeStatus?.() || { enabled: false, ready: false, bytes: 0, chunks: 0, mode: "off", status: "off" };
    const staticBakeText = `staticBake:${staticBakeStatus.enabled ? "on" : "off"}/${staticBakeStatus.ready ? "ready" : "not-ready"} mode:${staticBakeStatus.mode || "off"} ${Math.round((staticBakeStatus.bytes || 0) / 1048576)}MiB chunks:${staticBakeStatus.chunks || 0} failures:${staticBakeStatus.failures || 0} ${staticBakeStatus.status || ""}`;

    debugEl.textContent = [
        ...(debugExceptionAlertActive
            ? [`DEBUG EXCEPTION LOG WRITTEN: ${debugExceptionAlertFilename || "downloaded log"}`, debugExceptionAlertSummary || "Hunter watchdog recovery was required."]
            : []),
        `rev:${GAME_REVISION}  hudBlur:${hudBackdropBlurDisabled ? "off" : "on"}  ${gameState.debug.paused ? "PAUSED" : "RUNNING"}  tick:${gameState.clock.tick}  t:${gameState.clock.time.toFixed(2)}`,
        `difficulty:${gameState.settings?.difficulty || "normal"} damageScale:${gameDifficultyPreset(gameState.settings).damageScale.toFixed(2)} quality:${gameState.settings?.renderingQuality || "medium"} particleScale:${gameRenderingQualityPreset(gameState.settings).particleScale.toFixed(2)} music:${Math.round((gameState.settings?.musicVolume ?? 0.1) * 100)}% sfx:${Math.round(effectiveSfxVolume * 100)}% track:${activeLevelMusic.trackId} audio:${isGameAudioMuted() ? "muted" : (musicDirector.isUnlocked() ? "on" : "locked")}`,
        viewText,
        performanceText,
        gpuPerformanceText,
        visualPerformanceText,
        profilerText,
        staticBakeText,
        characterText,
        animationText,
        `intro:${gameState.story?.portalIntro?.active ? gameState.story.portalIntro.phase : "complete/off"}  exit:${gameState.story?.portalExit?.active ? gameState.story.portalExit.phase : (gameState.story?.portalExit ? "armed" : "off")}  mailbox:${gameState.story?.mailboxEvent?.active ? gameState.story.mailboxEvent.phase : "armed/off"}  playerVisible:${p.visible !== false}`,
        `pos (${p.currentTransform.x.toFixed(1)}, ${p.currentTransform.y.toFixed(1)})  vel (${p.vx.toFixed(1)}, ${p.vy.toFixed(1)})`,
        `ground:${p.onGround}  facing:${p.facing > 0 ? "right" : "left"}  boost:${gameState.equipment.rocket.attachedBoosting}  crush:${p.crushCandidateTicks || 0}/${gameState.tuning.playerCrushConfirmTicks || 3}  death:${p.deathPhase || "none"}/${(p.deathPhaseTimer || 0).toFixed(2)}  hoverA:${gameState.equipment.rocket.boostAccelerationNow.toFixed(0)}  hoverLimit:${gameState.tuning.attachedBoostHoverFallSpeed.toFixed(0)}`,
        `fuel:${fuel.amount.toFixed(2)}  delay:${fuel.rechargeDelayTimer.toFixed(2)}  cap:${fuel.rechargeCap}  rechargeLatched:${fuel.rechargeLatched ? "yes" : "no"}  groundRecharge:${gameState.tuning.fuelRechargeRequiresGround !== false}  kick:${gameState.equipment.rocket.boostKickCharge.toFixed(2)}  smokeDown:${(gameState.tuning.attachedBoostSmokePuffDownSpeed ?? 170).toFixed(0)}  bulbFlash:${(gameState.equipment.rocket.fuelBulbFlashTimer ?? 0).toFixed(2)}`,
        `rockets:${gameState.projectiles.length}  smoke:${gameState.effects?.smokePuffs?.length ?? 0}  collision:${gameState.world.collisionMode || "rectangles"} seg:${gameState.world.segments?.length ?? 0}  initialTurn:${gameState.tuning.rocketProjectileUpLaunchSeconds.toFixed(2)}@${gameState.tuning.rocketProjectileInitialHomingStrength.toFixed(2)}  homing:${gameState.tuning.rocketProjectileHomingStrength.toFixed(2)}  target:${gameState.targets[0] ? `${gameState.targets[0].x.toFixed(0)},${gameState.targets[0].y.toFixed(0)}` : "none"}`,
        inputText + `  inputConsole:${input.isConsoleLoggingEnabled() ? "on" : "off"}  assetGuides:${gameState.debug.showAssetGuides ? "on" : "off"}  cameraLine:${gameState.debug.showCameraLine ? "on" : "off"}  puppetGuide:${gameState.debug.showPuppetGuide ? "on" : "off"}`,
        `eventFilter:${gameState.debug.eventFilterText || "(none)"}`,
        "events:",
        events || "(none after filter)",
        "key events:",
        inputEvents || "(none)"
    ].join("\n");
}

function filteredDebugEvents(events, filterText = "") {
    const tokens = String(filterText || "")
        .split(/[\s,]+/)
        .map((token) => token.trim())
        .filter(Boolean);
    if (!tokens.length) {
        return events;
    }

    const include = tokens.filter((token) => !token.startsWith("-"));
    const exclude = tokens.filter((token) => token.startsWith("-")).map((token) => token.slice(1));
    return events.filter((event) => {
        const type = event.type || "";
        if (exclude.some((token) => type.includes(token))) {
            return false;
        }
        return include.length === 0 || include.some((token) => type.includes(token));
    });
}

function applyTuningSideEffects(key) {
    if (key === "gravity" || key === "ordinaryJumpHeight") {
        gameState.tuning.jumpVelocity = -Math.sqrt(
            2 * Math.max(1, Number(gameState.tuning.gravity) || 1)
            * Math.max(1, Number(gameState.tuning.ordinaryJumpHeight) || 1)
        );
    }
    if (key === "maxRunSpeed") {
        applyPlayerProgression(gameState);
        const speedLimit = gameState.tuning.maxRunSpeed * (gameState.playerStats?.movementSpeedScale || 1);
        gameState.player.vx = Math.max(-speedLimit, Math.min(speedLimit, gameState.player.vx));
    }
    if (key === "attachedBoostKickChargeMax") {
        gameState.equipment.rocket.boostKickCharge = Math.min(gameState.equipment.rocket.boostKickCharge, gameState.tuning.attachedBoostKickChargeMax);
    }
    if (["fuelMax", "baseRechargeCap", "initialFuel", "rechargeRate", "healthRegenRate", "maxHealth", "attachedBoostDrainRate", "rocketLaunchCost"].includes(key)) {
        applyPlayerProgression(gameState);
    }
    if (key === "meleeEnemyHealthScale" || key === "rangedEnemyHealthScale") {
        syncEnemyTuningHealthScales(gameState);
    }
    gameState.clock.fixedDt = gameState.tuning.timestep || FIXED_DT;
}

function persistCurrentGameTuning() {
    const tuningOverrides = createGameTuningOverrides(gameState.tuning, installedGameTuning);
    gameState.settings = saveStoredGameSettings({
        ...normalizeGameSettings(gameState.settings),
        tuningOverrides
    });
}

function updateSimpleGameTuning(key, value) {
    const previousLungeDuration = key === "playerLungeSpeed"
        ? Math.max(0, Number(gameState.tuning.playerLungeDistance) || 0) / Math.max(0.000001, Number(gameState.tuning.playerLungeSpeed) || 0)
        : 0;
    const resolved = applyGameTuningValues(gameState.tuning, { [key]: value });
    gameState.tuning[key] = resolved[key];
    if (key === "playerLungeSpeed" && previousLungeDuration > 0) {
        gameState.tuning.playerLungeDistance = gameState.tuning.playerLungeSpeed * previousLungeDuration;
    }
    applyTuningSideEffects(key);
    persistCurrentGameTuning();
    syncSimpleGameTuningUi();
}

function resetSimpleGameTuning() {
    const previousHealthMax = Math.max(1, Number(gameState.health?.max) || 1);
    const previousFuelMax = Math.max(1, Number(gameState.fuel?.max) || 1);
    gameState.tuning = { ...gameState.tuning, ...installedGameTuning };
    for (const key of Object.keys(installedGameTuning)) applyTuningSideEffects(key);
    applyPlayerProgression(gameState);
    if (gameState.health) {
        const healthFraction = Math.max(0, Math.min(1, (Number(gameState.health.amount) || 0) / previousHealthMax));
        gameState.health.amount = gameState.health.max * healthFraction;
    }
    if (gameState.fuel) {
        const fuelFraction = Math.max(0, Math.min(1, (Number(gameState.fuel.amount) || 0) / previousFuelMax));
        gameState.fuel.amount = gameState.fuel.max * fuelFraction;
    }
    gameState.settings = saveStoredGameSettings({
        ...normalizeGameSettings(gameState.settings),
        tuningOverrides: {}
    });
    syncSimpleGameTuningUi();
}

function syncSimpleGameTuningUi() {
    if (tuningRunSpeedInput) tuningRunSpeedInput.value = String(gameState.tuning.maxRunSpeed);
    if (tuningRunSpeedValue) tuningRunSpeedValue.textContent = String(Math.round(gameState.tuning.maxRunSpeed));
    if (tuningLungeSpeedInput) tuningLungeSpeedInput.value = String(gameState.tuning.playerLungeSpeed);
    if (tuningLungeSpeedValue) tuningLungeSpeedValue.textContent = `${Math.round(gameState.tuning.playerLungeSpeed)} px/s`;
    if (tuningJumpHeightInput) tuningJumpHeightInput.value = String(gameState.tuning.ordinaryJumpHeight);
    if (tuningJumpHeightValue) tuningJumpHeightValue.textContent = String(Math.round(gameState.tuning.ordinaryJumpHeight));
    if (tuningGravityInput) tuningGravityInput.value = String(gameState.tuning.gravity);
    if (tuningGravityValue) tuningGravityValue.textContent = String(Math.round(gameState.tuning.gravity));
    if (tuningRocketDamageInput) tuningRocketDamageInput.value = String(gameState.tuning.rocketDamagePercent);
    if (tuningRocketDamageValue) tuningRocketDamageValue.textContent = `${Math.round(gameState.tuning.rocketDamagePercent)}%`;
    if (tuningRocketDurationInput) tuningRocketDurationInput.value = String(gameState.tuning.rocketDurationPercent);
    if (tuningRocketDurationValue) tuningRocketDurationValue.textContent = `${Math.round(gameState.tuning.rocketDurationPercent)}%`;
    if (tuningDoubleJumpPhysicsSelect) {
        tuningDoubleJumpPhysicsSelect.value = gameState.tuning.doubleJumpPhysics === DOUBLE_JUMP_PHYSICS_CONSISTENT_APEX
            ? DOUBLE_JUMP_PHYSICS_CONSISTENT_APEX
            : DOUBLE_JUMP_PHYSICS_FIXED_IMPULSE;
    }
}

async function exportState() {
    const serialized = serializeGameState(gameState);
    gameState.debug.exportedAt = gameState.clock.time;
    console.log("Ignatius Rocketfrock exported gameState", cloneGameState(gameState));
    try {
        await navigator.clipboard.writeText(serialized);
        console.log("gameState copied to clipboard");
    } catch (error) {
        console.log("Clipboard export blocked by browser permissions; state was logged to console instead.");
    }
}

window.getRocketfrockState = () => cloneGameState(gameState);
window.setRocketfrockState = (nextState) => {
    gameState = cloneGameState(nextState);
    gamepadHaptics.reset(gameState.debug?.lastEvents || []);
    soundEffectsDirector.reset();
    gameState.settings = normalizeGameSettings(gameState.settings);
    syncGameSettingsUi();
    syncGameAudioState();
};
window.getRocketfrockPose = () => ({
    player: cloneGameState(gameState.player),
    rocket: cloneGameState(gameState.equipment.rocket),
    rig: renderer.getRigMetrics(gameState)
});
window.__rocketfrockDev = {
    pause() {
        setGamePaused(true);
    },
    resume() {
        setGamePaused(false);
    },
    reset() {
        gameState = createInitialGameState({
            settings: gameState.settings,
            tuning: resolveGameTuning(installedGameTuning, gameState.settings?.tuningOverrides),
            enemyCatalog: gameState.enemyCatalog,
            playerProgression: gameState.playerProgression
        });
        gameState.debug.revision = GAME_REVISION;
        gamepadHaptics.reset(gameState.debug.lastEvents);
        soundEffectsDirector.reset();
        syncLoadedCharacterCombatProfiles();
        if (!applyLoadedAtlasCollisionsOrException("development reset")) {
            latchFatalRuntimeFailure("Ignatius could not safely continue because atlas collision restoration failed during the development reset.");
            return false;
        }
        syncGameSettingsUi();
        syncGameAudioState();
    },
    setPhase(phase) {
        renderer.forcePhase = phase;
    },
    setTuning(nextTuning) {
        gameState.tuning = applyGameTuningValues(gameState.tuning, nextTuning);
        for (const key of Object.keys(nextTuning || {})) applyTuningSideEffects(key);
        persistCurrentGameTuning();
        syncSimpleGameTuningUi();
    },
    clearForcedPhase() {
        renderer.forcePhase = null;
    },
    setPlayerPose({ x = 210, y = 600, facing = 1, vx = 0, vy = 0, onGround = true } = {}) {
        Object.assign(gameState.player, { facing, vx, vy, onGround });
        gameState.player.currentTransform.x = x;
        gameState.player.currentTransform.y = y;
        gameState.camera.currentTransform.x = x + 150 * facing;
        gameState.camera.currentTransform.y = y - 170;
        snapPresentationSubject(gameState.player, "developmentPose", "player");
        snapPresentationSubject(gameState.camera, "developmentPose:camera", "camera");
    },
    getRigMetrics() {
        return renderer.getRigMetrics(gameState);
    },
    getInputEvents(limit = 20) {
        return input.getRecentEvents(limit);
    },
    gameplayRecording: {
        start(source = "dev-console") {
            return startGameplayRecording(source);
        },
        stop(reason = "dev-console") {
            return stopGameplayRecording(reason);
        },
        status() {
            return {
                recording: Boolean(gameplayRecording),
                frames: Math.max(0, Math.floor(Number(gameplayRecording?.summary?.frames) || 0)),
                playback: Boolean(gameplayPlayback?.active),
                playbackPaused: Boolean(gameplayPlayback?.pausedForKey),
                playbackIndex: gameplayPlayback?.index || 0,
                playbackFrames: gameplayPlayback?.frames?.length || 0
            };
        },
        export() {
            if (gameplayRecording) {
                return Promise.reject(new Error("Stop gameplay recording before exporting it from the development console."));
            }
            const recording = window.__rocketfrockLastGameplayRecording;
            if (!recording) return "";
            if (gameplayLastRecordingSpool) return gameplayRecordingJsonText(recording, gameplayLastRecordingSpool);
            return Array.isArray(recording.frames) ? JSON.stringify(recording, null, 2) : window.__rocketfrockLastGameplayRecordingJson || "";
        },
        save() {
            if (gameplayRecording) {
                return Promise.reject(new Error("Stop gameplay recording before saving it from the development console."));
            }
            const recording = window.__rocketfrockLastGameplayRecording;
            if (!recording) return null;
            if (gameplayLastRecordingSpool) return saveGameplayRecordingJson(recording, gameplayLastRecordingSpool);
            return Array.isArray(recording.frames) ? saveGameplayRecordingJson(recording) : null;
        },
        retained() {
            return [...gameplayRetainedRecordings.values()].map(({ recording, spool, state }) => ({
                recordingId: spool.recordingId,
                state,
                levelId: recording?.levelId || "",
                frames: Math.max(0, Math.floor(Number(recording?.summary?.frames) || 0)),
                stoppedAtIso: recording?.stoppedAtIso || null
            }));
        },
        saveRetained(recordingId = "") {
            const selected = recordingId
                ? gameplayRetainedRecordings.get(String(recordingId))
                : [...gameplayRetainedRecordings.values()].at(-1);
            if (!selected) return null;
            window.__rocketfrockLastGameplayRecording = selected.recording;
            gameplayLastRecordingSpool = selected.spool;
            return saveGameplayRecordingJson(selected.recording, selected.spool);
        },
        discardRetained(recordingId = "") {
            const selected = recordingId
                ? gameplayRetainedRecordings.get(String(recordingId))
                : [...gameplayRetainedRecordings.values()].at(-1);
            if (!selected) return false;
            if (gameplayRecordingSaveTasks.has(selected.spool.recordingId)) {
                updateGameplayRecordingControls("That recording is still being saved and cannot be discarded yet.");
                return false;
            }
            forgetGameplayRecordingSpool(selected.spool);
            void selected.spool.discard();
            updateGameplayRecordingControls("Retained recording discarded.");
            return true;
        }
    },
    gameplayPlayback: {
        async start(recording, options = {}) {
            return startGameplayPlayback(recording, { source: "dev-console", restoreInitialState: true, ...options });
        },
        stop(reason = "dev-console") {
            return stopGameplayPlayback(reason);
        },
        resume() {
            return resumeGameplayPlaybackFromPause();
        },
        status() {
            return {
                active: Boolean(gameplayPlayback?.active),
                pausedForKey: Boolean(gameplayPlayback?.pausedForKey),
                index: gameplayPlayback?.index || 0,
                frames: gameplayPlayback?.frames?.length || 0,
                source: gameplayPlayback?.source || ""
            };
        }
    },
    profiler: {
        start(options = {}) {
            return startMicroStutterProfiler(options);
        },
        stop() {
            return stopMicroStutterProfiler();
        },
        clear() {
            return microStutterProfiler.clear();
        },
        status() {
            return microStutterProfiler.status();
        },
        export() {
            return microStutterProfiler.exportJson(microStutterProfilerExtra());
        },
        copy() {
            return microStutterProfiler.copyToClipboard(microStutterProfilerExtra());
        },
        download(filename = "") {
            return downloadMicroStutterProfile(filename);
        }
    },
    staticBakeRenderer: {
        isAvailable() {
            return Boolean(ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER && renderer?.supportsExperimentalStaticLayerBakeRenderer?.() !== false);
        },
        setMode(mode = "off") {
            if (!ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER) {
                return { enabled: false, ready: false, mode: "off", status: "disabled by ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER" };
            }
            return renderer?.setStaticLayerBakeMode?.(mode);
        },
        enable(mode = "full") {
            return this.setMode(mode);
        },
        disable() {
            return this.setMode("off");
        },
        status() {
            return renderer?.getStaticLayerBakeStatus?.();
        }
    },
    startMicroStutterProfiler(options = {}) {
        return startMicroStutterProfiler(options);
    },
    stopMicroStutterProfiler() {
        return stopMicroStutterProfiler();
    },
    exportMicroStutterProfile() {
        return microStutterProfiler.exportJson(microStutterProfilerExtra());
    },
    setInputConsoleLogging(enabled) {
        input.setConsoleLogging(enabled);
        gameState.debug.inputConsoleLogging = input.isConsoleLoggingEnabled();
    },
    getAudioState() {
        return {
            muted: isGameAudioMuted(),
            musicVolume: musicDirector.getEffectiveVolume(),
            sfxVolume: effectiveSfxVolume
        };
    }
};

requestAnimationFrame(frame);
