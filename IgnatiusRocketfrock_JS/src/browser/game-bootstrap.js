import {
    FIXED_DT,
    DEFAULT_TUNING,
    createInitialGameState,
    createInputFrame,
    createSubstepInputFrame,
    stepSimulation,
    applyAtlasManifestsToWorld,
    applyEditorLevelToWorld,
    applyCharacterCombatProfiles,
    resetPlayer,
    cloneGameState,
    serializeGameState,
    addEvent
} from "../core/simulation.js";
import { RocketfrockInput } from "./browser-input.js";
import { GamepadHaptics } from "./gamepad-haptics.js";
import { createRenderer } from "../presentation/canvas-renderer.js";
import { normalizeCaveWindow } from "../shared/cave-window-data.js";
import {
    gameDifficultyPreset,
    gameRenderingQualityPreset,
    normalizeGameSettings
} from "../shared/game-settings-data.js";
import { loadStoredGameSettings, saveStoredGameSettings } from "./game-settings-store.js";
import { normalizeLevelMusic } from "../shared/music-data.js";
import { prioritizedActivePowerUpEffect } from "../shared/power-up-data.js";
import { createMusicDirector } from "./music-director.js";
import {
    detectElectronWindowBridge,
    readFullscreenState,
    setFullscreenState
} from "./electron-window-bridge.js";

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
const debugEl = document.getElementById("debug");
const tuningControlsEl = document.getElementById("tuning-controls");
const tuningJsonEl = document.getElementById("tuning-json");
const tuningMessageEl = document.getElementById("tuning-message");
const eventFilterEl = document.getElementById("event-filter");
const assetGuidesButton = document.getElementById("toggle-asset-guides");
const puppetGuideButton = document.getElementById("toggle-puppet-guide");
const debugPanelButton = document.getElementById("toggle-debug-panel");
const gameTuningButton = document.getElementById("toggle-game-tuning");
const helpPanelButton = document.getElementById("toggle-help-panel");
const helpPanel = document.getElementById("help-panel");
const toolLinks = document.getElementById("tool-links");
const applyTuningJsonButton = document.getElementById("apply-tuning-json");
const copyTuningJsonButton = document.getElementById("copy-tuning-json");
const refreshTuningJsonButton = document.getElementById("refresh-tuning-json");
const tuningPanel = document.getElementById("tuning");
const loadingScreen = document.getElementById("loading-screen");
const loadingPercent = document.getElementById("loading-percent");
const loadingTrack = document.getElementById("loading-track");
const loadingBarFill = document.getElementById("loading-bar-fill");
const loadingDetail = document.getElementById("loading-detail");
const titleScreen = document.getElementById("title-screen");
const titleStartButton = document.getElementById("title-start-button");
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
const gameMenuSettingsButton = document.getElementById("game-menu-settings");
const gameMenuRestartButton = document.getElementById("game-menu-restart");
const gameMenuExitTitleButton = document.getElementById("game-menu-exit-title");
const gameMenuExitDesktopButton = document.getElementById("game-menu-exit-desktop");
const sfxVolumeInput = document.getElementById("sfx-volume");
const sfxVolumeValue = document.getElementById("sfx-volume-value");
const musicVolumeInput = document.getElementById("music-volume");
const musicVolumeValue = document.getElementById("music-volume-value");
const difficultyValue = document.getElementById("difficulty-value");
const difficultyButtons = [...document.querySelectorAll("[data-difficulty]")];
const renderingQualityValue = document.getElementById("rendering-quality-value");
const renderingQualityButtons = [...document.querySelectorAll("[data-rendering-quality]")];
const autoFullscreenRow = document.getElementById("auto-fullscreen-row");
const autoFullscreenInput = document.getElementById("auto-fullscreen");

const GAME_REVISION = "252";

let displayedLoadingProgress = 0;
let activeCaveWindow = normalizeCaveWindow(null);
let renderer;
const electronWindowBridge = detectElectronWindowBridge(window);
let gameState = createInitialGameState({ settings: loadStoredGameSettings(), randomSeed: browserRandomSeed() });
const musicDirector = createMusicDirector({ volume: gameState.settings.musicVolume });
let activeLevelMusic = normalizeLevelMusic(null);
let gameMenuView = "menu";
let gameMenuPreviousPause = false;
let pageFocusLost = document.hidden;
let effectiveSfxVolume = pageFocusLost ? 0 : gameState.settings.sfxVolume;
let fullscreenActive = false;
let fullscreenRequestPending = false;
let stopElectronFullscreenListener = null;
let titleScreenActive = true;
let gameHasStarted = false;
let suppressPostTitleStartInputUntil = 0;
let minimapResizeObserver = null;
let minimapLastDrawAt = -Infinity;
let minimapLastSizeKey = "";
gameState.debug.revision = GAME_REVISION;
addEvent(gameState, `BUILD_REVISION_${GAME_REVISION}`);
const input = new RocketfrockInput(window);
const gamepadHaptics = new GamepadHaptics();
gamepadHaptics.prime(gameState.debug.lastEvents);
showLoadingScreen("Loading level data", 0.02);
const loadedBrowserCopy = maybeApplyBrowserCopyLevel();
if (!loadedBrowserCopy) {
    await applyRequiredDefaultLevel();
}
setLoadingProgress(0.1, "Level data ready");
try {
    renderer = await createRenderer(canvas, {
        environmentAtlasManifestUrls: gameState.world.atlasManifests,
        onProgress: ({ progress, label }) => {
            setLoadingProgress(0.1 + clamp01(progress) * 0.85, label);
        }
    });
} catch (error) {
    failStartup(`Game assets could not be loaded: ${error.message}`, error);
}
renderer.syncCaveWindow(activeCaveWindow);
syncLoadedCharacterCombatProfiles();
if (!applyLoadedAtlasCollisions()) {
    failStartup("Required atlas collision data could not be applied. Check assets/at_atlas_001.json and the level atlasRefs.");
}
// Build any level-wide recoloured atlas copies once during level startup. The
// render loop only compares the cache key and uses ordinary drawImage calls.
renderer.syncEnvironmentColorMap(gameState.world.colorMap);
setLoadingProgress(0.98, "Preparing the first frame");
let accumulator = 0;
let lastNow = performance.now();
let lastInputFrame = createInputFrame();
let devSingleStepArmed = false;
let levelTransitionLoading = false;
const tuningSliders = new Map();

setupTuningControls();
setupTuningJsonControls();
setupPanelToggleButtons();
setupTitleScreen();
setupMinimap();
setupGameMenuAndSettings();
setLoadingProgress(1, "Ready");
showTitleScreen();
await nextPaint();
hideLoadingScreen();

function browserRandomSeed() {
    if (globalThis.crypto?.getRandomValues) {
        const seed = new Uint32Array(1);
        globalThis.crypto.getRandomValues(seed);
        if (seed[0]) return seed[0];
    }
    return (Math.floor(Date.now() ^ performance.now() * 1000) >>> 0) || 0x1a2b3c4d;
}

function clamp01(value) {
    return Math.max(0, Math.min(1, Number(value) || 0));
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
    const profiles = new Map();
    for (const project of renderer.getRuntimeCharacterProjects().values()) {
        const projectiles = project.projectiles instanceof Map ? [...project.projectiles.values()] : [];
        if (!projectiles.length) {
            continue;
        }
        profiles.set(project.characterId, {
            characterId: project.characterId,
            attackDuration: project.animations.get("attack")?.duration,
            projectiles: projectiles.map((projectile) => ({ ...projectile }))
        });
    }
    return applyCharacterCombatProfiles(gameState, profiles);
}

function maybeApplyBrowserCopyLevel() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("playtest_browser_copy") !== "1") {
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

async function applyRequiredDefaultLevel() {
    const url = "assets/level_001.json";
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
}

function syncPresentationLevelData(level) {
    activeCaveWindow = normalizeCaveWindow(level?.caveWindow || level?.visuals?.caveWindow);
    activeLevelMusic = normalizeLevelMusic(level?.music);
    renderer?.syncCaveWindow(activeCaveWindow);
    musicDirector.setTune(activeLevelMusic.tuneId);
}

function normalizedLevelId(value, fallback = "level_001") {
    const match = /^level_(\d+)$/i.exec(String(value || "").trim());
    if (!match) return fallback;
    return `level_${match[1].padStart(3, "0")}`;
}

async function fetchOptionalLevel(levelId) {
    const id = normalizedLevelId(levelId);
    const url = `assets/${id}.json`;
    try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.warn(`Could not load optional level ${url}.`, error);
        return null;
    }
}

function processLevelTransitionRequest() {
    const request = gameState.story?.levelTransitionRequest;
    if (!request || levelTransitionLoading) return;
    gameState.story.levelTransitionRequest = null;
    levelTransitionLoading = true;
    void loadRequestedLevel(request).finally(() => {
        levelTransitionLoading = false;
    });
}

async function loadRequestedLevel(request) {
    showLoadingScreen("Loading next level", 0.04);
    try {
        const currentLevelId = normalizedLevelId(request.fallbackLevelId || gameState.world.levelId);
        const requestedLevelId = normalizedLevelId(request.requestedLevelId, currentLevelId);
        let loadedLevelId = requestedLevelId;
        let level = await fetchOptionalLevel(requestedLevelId);
        if (!level) {
            loadedLevelId = currentLevelId;
            level = await fetchOptionalLevel(currentLevelId);
        }
        if (!level) {
            console.error(`Level transition failed: neither ${requestedLevelId} nor fallback ${currentLevelId} could be loaded.`);
            gameState.player.visible = true;
            return false;
        }
        setLoadingProgress(0.22, `Loaded ${loadedLevelId}`);
        if (!applyEditorLevelToWorld(gameState, level)) {
            console.error(`Level transition failed while applying ${loadedLevelId}.`);
            gameState.player.visible = true;
            return false;
        }
        syncPresentationLevelData(level);
        await renderer.ensureEnvironmentAtlases(gameState.world.atlasManifests, {
            onProgress: ({ progress, label }) => {
                setLoadingProgress(0.22 + clamp01(progress) * 0.66, label);
            }
        });
        syncLoadedCharacterCombatProfiles();
        if (!applyLoadedAtlasCollisions()) {
            console.error(`Level transition loaded ${loadedLevelId}, but its atlas collision could not be applied.`);
        }
        renderer.syncEnvironmentColorMap(gameState.world.colorMap);
        accumulator = 0;
        addEvent(gameState, "LEVEL_TRANSITION_COMPLETE", {
            requestedLevelId,
            loadedLevelId,
            usedFallback: loadedLevelId !== requestedLevelId
        });
        setLoadingProgress(1, "Level ready");
        await nextPaint();
        void attemptVisibleLevelMusicStart();
        return true;
    } finally {
        hideLoadingScreen();
    }
}

function failStartup(message, error) {
    console.error(message, error || "");
    if (loadingScreen) {
        loadingScreen.hidden = true;
    }
    const panel = document.createElement("div");
    panel.setAttribute("role", "alert");
    panel.style.position = "fixed";
    panel.style.inset = "24px auto auto 24px";
    panel.style.maxWidth = "720px";
    panel.style.zIndex = "10001";
    panel.style.padding = "16px 18px";
    panel.style.border = "1px solid rgba(255, 120, 120, 0.65)";
    panel.style.borderRadius = "14px";
    panel.style.background = "rgba(22, 10, 14, 0.96)";
    panel.style.color = "#ffe8e8";
    panel.style.font = "14px/1.45 system-ui, sans-serif";
    panel.textContent = message;
    document.body.appendChild(panel);
    throw new Error(message);
}

function setupTitleScreen() {
    titleStartButton?.addEventListener("click", (event) => {
        event.preventDefault();
        startGameFromTitle();
    });

    window.addEventListener("keydown", handleTitleStartKeydown, { capture: true, passive: false });
    window.addEventListener("pointerdown", handleTitleStartPointer, { capture: true, passive: false });
    window.addEventListener("mousedown", handleTitleStartPointer, { capture: true, passive: false });
    window.addEventListener("touchstart", handleTitleStartPointer, { capture: true, passive: false });
}

function handleTitleStartKeydown(event) {
    if (!titleScreenActive && shouldSuppressPostTitleStartInput()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
    }
    if (!titleScreenActive || isGameMenuOpen() || event.repeat || shouldIgnoreTitleStartTarget(event.target)) {
        return;
    }
    if (["Escape", "Tab", "F11"].includes(event.code) || event.altKey || event.ctrlKey || event.metaKey) {
        return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    startGameFromTitle();
}

function handleTitleStartPointer(event) {
    if (!titleScreenActive && shouldSuppressPostTitleStartInput()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
    }
    if (!titleScreenActive || isGameMenuOpen() || shouldIgnoreTitleStartTarget(event.target)) {
        return;
    }
    if (event.button !== undefined && event.button !== 0) {
        return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    startGameFromTitle();
}

function shouldSuppressPostTitleStartInput() {
    return performance.now() < suppressPostTitleStartInputUntil;
}

function shouldIgnoreTitleStartTarget(target) {
    return Boolean(target instanceof Element && target.closest([
        "#title-manual-link",
        "#game-menu-controls",
        "#game-menu-dialog",
        "input",
        "select",
        "textarea",
        "label",
        "[data-ignore-game-pointer]"
    ].join(",")));
}

function showTitleScreen() {
    titleScreenActive = true;
    gameHasStarted = false;
    setGamePaused(true, { clearInput: true });
    syncTitleScreenUi();
}

function titleStartRequested(inputFrame) {
    return Boolean(inputFrame?.jumpPressed);
}

function startGameFromTitle() {
    if (!titleScreenActive) {
        return;
    }
    titleScreenActive = false;
    gameHasStarted = true;
    suppressPostTitleStartInputUntil = performance.now() + 360;
    input.clear();
    setGamePaused(false, { clearInput: true });
    syncTitleScreenUi();
    void musicDirector.unlock();
    void applyAutoFullscreenPolicy();
}

function syncTitleScreenUi() {
    if (titleScreen) {
        titleScreen.hidden = !titleScreenActive;
    }
    document.body.classList.toggle("title-screen-active", titleScreenActive);
    document.body.classList.toggle("game-running", gameHasStarted && !titleScreenActive);
    if (gameMenuExitTitleButton) {
        gameMenuExitTitleButton.hidden = titleScreenActive;
    }
    syncGameAudioState();
}

function setupMinimap() {
    if (!metersPanel || !minimapPanel || !minimapCanvas || !minimapContext) {
        return;
    }
    const syncSize = () => {
        resizeMinimapToLevel();
        drawMinimap(true);
    };
    if (typeof ResizeObserver === "function") {
        minimapResizeObserver = new ResizeObserver(syncSize);
        minimapResizeObserver.observe(metersPanel);
    }
    window.addEventListener("resize", syncSize, { passive: true });
    window.addEventListener("beforeunload", () => minimapResizeObserver?.disconnect?.(), { once: true });
    syncSize();
}

function minimapBounds() {
    const world = gameState.world || {};
    const bounds = world.bounds || {};
    let minX = Number(bounds.x);
    let minY = Number(bounds.y);
    let maxX = minX + Number(bounds.w);
    let maxY = minY + Number(bounds.h);
    const points = activeCaveWindow?.enabled && Array.isArray(activeCaveWindow.points)
        ? activeCaveWindow.points
        : [];
    if (points.length >= 3) {
        minX = Math.min(...points.map((point) => Number(point.x) || 0));
        minY = Math.min(...points.map((point) => Number(point.y) || 0));
        maxX = Math.max(...points.map((point) => Number(point.x) || 0));
        maxY = Math.max(...points.map((point) => Number(point.y) || 0));
    }
    if (![minX, minY, maxX, maxY].every(Number.isFinite) || maxX <= minX || maxY <= minY) {
        minX = (Number(gameState.player?.x) || 0) - 800;
        minY = (Number(gameState.player?.y) || 0) - 500;
        maxX = minX + 1600;
        maxY = minY + 1000;
    }
    const padX = Math.max(80, (maxX - minX) * 0.035);
    const padY = Math.max(80, (maxY - minY) * 0.05);
    return {
        minX: minX - padX,
        minY: minY - padY,
        maxX: maxX + padX,
        maxY: maxY + padY
    };
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
    const panelWidth = Math.max(48, Math.ceil(inset * 2 + drawableHeight * worldWidth / worldHeight));
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
    const bounds = minimapBounds();
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
    const background = ctx.createLinearGradient(0, 0, 0, cssHeight);
    background.addColorStop(0, "rgba(15,12,22,0.98)");
    background.addColorStop(1, "rgba(5,5,10,0.98)");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    const cavePoints = activeCaveWindow?.enabled && Array.isArray(activeCaveWindow.points)
        ? activeCaveWindow.points
        : [];
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
    ctx.strokeStyle = "rgba(214,188,121,0.76)";
    ctx.lineWidth = Math.max(1, Math.min(3, scale * 18));
    for (const segment of gameState.world?.segments || []) {
        if (segment?.kind && segment.kind !== "blockable") continue;
        const a = point(Number(segment.x1) || 0, Number(segment.y1) || 0);
        const b = point(Number(segment.x2) || 0, Number(segment.y2) || 0);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
    }
    ctx.fillStyle = "rgba(214,188,121,0.28)";
    for (const solid of gameState.world?.solids || []) {
        const topLeft = point(Number(solid.x) || 0, Number(solid.y) || 0);
        ctx.fillRect(
            topLeft.x,
            topLeft.y,
            Math.max(1, (Number(solid.w) || 0) * scale),
            Math.max(1, (Number(solid.h) || 0) * scale)
        );
    }

    const viewport = renderer?.getViewportMetrics?.();
    if (viewport) {
        const virtualW = Number(viewport.virtualW) || 0;
        const virtualH = Number(viewport.virtualH) || 0;
        const cameraLeft = (Number(gameState.camera?.x) || 0) - virtualW * 0.5;
        const cameraTop = (Number(gameState.camera?.y) || 0) - virtualH * 0.56;
        const cameraPoint = point(cameraLeft, cameraTop);
        ctx.strokeStyle = "rgba(115,211,124,0.58)";
        ctx.lineWidth = 1;
        ctx.strokeRect(cameraPoint.x, cameraPoint.y, virtualW * scale, virtualH * scale);
    }

    for (const visual of gameState.world?.visuals || []) {
        if (visual?.entityType !== "wizard_exit_door" && visual?.entityType !== "magicPortal") continue;
        const centerX = (Number(visual.x) || 0) + (Number(visual.w) || 0) * 0.5;
        const centerY = (Number(visual.y) || 0) + (Number(visual.h) || 0) * 0.5;
        const exitPoint = point(centerX, centerY);
        ctx.fillStyle = "rgba(255,112,211,0.95)";
        ctx.beginPath();
        ctx.arc(exitPoint.x, exitPoint.y, 3.1, 0, Math.PI * 2);
        ctx.fill();
    }

    const playerPoint = point(Number(gameState.player?.x) || 0, Number(gameState.player?.y) || 0);
    ctx.fillStyle = "#73d37c";
    ctx.strokeStyle = "rgba(0,0,0,0.8)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(playerPoint.x, playerPoint.y, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(242,237,248,0.75)";
    ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("CLICK FOR MENU", cssWidth - 8, cssHeight - 6);
    ctx.restore();
}

function setupGameMenuAndSettings() {
    if (!gameMenuDialog || !openGameMenuButton) {
        return;
    }

    const isElectron = Boolean(electronWindowBridge);
    document.body.classList.toggle("electron", isElectron);
    if (fullscreenToggleButton) {
        fullscreenToggleButton.hidden = isElectron;
    }
    if (toolLinks) {
        toolLinks.hidden = isElectron;
    }
    if (gameMenuExitTitleButton) {
        gameMenuExitTitleButton.textContent = "Exit to Title";
        gameMenuExitTitleButton.setAttribute("aria-label", "Exit to Title");
        gameMenuExitTitleButton.hidden = titleScreenActive;
    }
    if (gameMenuExitDesktopButton) {
        gameMenuExitDesktopButton.hidden = !electronWindowBridge;
    }
    if (autoFullscreenRow) {
        autoFullscreenRow.hidden = Boolean(electronWindowBridge);
    }

    openGameMenuButton.addEventListener("click", () => {
        if (isGameMenuOpen()) {
            closeGameMenu();
        } else {
            openGameMenu();
        }
    });
    fullscreenToggleButton?.addEventListener("click", () => {
        if (electronWindowBridge) {
            return;
        }
        void toggleFullscreen();
    });
    gameMenuSettingsButton?.addEventListener("click", () => setGameMenuView("settings"));
    gameMenuBackButton?.addEventListener("click", () => {
        if (gameMenuView === "settings") {
            setGameMenuView("menu");
        } else {
            closeGameMenu();
        }
    });
    gameMenuRestartButton?.addEventListener("click", () => {
        void restartLevelFromMenu();
    });
    gameMenuExitTitleButton?.addEventListener("click", () => {
        void exitToTitleFromMenu();
    });
    gameMenuExitDesktopButton?.addEventListener("click", () => {
        if (electronWindowBridge && typeof electronWindowBridge.quit === "function") {
            void electronWindowBridge.quit();
        }
    });

    gameMenuDialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        if (gameMenuView === "settings") {
            setGameMenuView("menu");
        } else {
            closeGameMenu();
        }
    });
    gameMenuDialog.addEventListener("close", restorePauseAfterMenu);
    gameMenuDialog.addEventListener("click", (event) => {
        if (event.target === gameMenuDialog) {
            event.preventDefault();
            event.stopPropagation();
        }
    });

    window.addEventListener("keydown", handleMenuAndFullscreenKeydown, { passive: false });
    window.addEventListener("pointerdown", maybeApplyAutoFullscreenFromGameplayGesture, { capture: true, passive: true });
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
    autoFullscreenInput?.addEventListener("change", () => {
        updatePersistentGameSettings({ autoFullscreen: autoFullscreenInput.checked });
        void applyAutoFullscreenPolicy();
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

    document.addEventListener("fullscreenchange", () => {
        fullscreenActive = Boolean(document.fullscreenElement);
        syncFullscreenUi();
    });
    if (electronWindowBridge && typeof electronWindowBridge.onFullscreenChanged === "function") {
        stopElectronFullscreenListener = electronWindowBridge.onFullscreenChanged((active) => {
            fullscreenActive = Boolean(active);
            syncFullscreenUi();
        });
    }
    window.addEventListener("beforeunload", () => {
        if (typeof stopElectronFullscreenListener === "function") {
            stopElectronFullscreenListener();
        }
        musicDirector.dispose();
    }, { once: true });

    syncGameSettingsUi();
    setGameMenuView("menu");
    void initializeFullscreenUi();
}

function handleMenuAndFullscreenKeydown(event) {
    if (isGameMenuOpen()) {
        if (handleGameMenuNavigationKey(event)) {
            return;
        }
        if (event.code === "Escape" && !event.repeat) {
            event.preventDefault();
            if (gameMenuView === "settings") {
                setGameMenuView("menu");
            } else {
                closeGameMenu();
            }
        }
        return;
    }

    if (event.code === "Escape" && !event.repeat) {
        event.preventDefault();
        openGameMenu();
        return;
    }

    if (event.code === "KeyP" && !event.repeat && !electronWindowBridge && gameState.settings?.autoFullscreen) {
        const willPause = !gameState.debug.paused;
        void requestFullscreenState(!willPause);
        return;
    }

    maybeApplyAutoFullscreenFromGameplayGesture(event);
}

function visibleDialogFocusItems() {
    const view = gameMenuView === "settings" ? gameSettingsPanel : gameMenuMain;
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

function openGameMenu() {
    if (!gameMenuDialog || isGameMenuOpen()) {
        return;
    }
    gameMenuPreviousPause = Boolean(gameState.debug.paused);
    setGamePaused(true, { clearInput: true });
    setGameMenuView("menu");
    document.body.classList.add("game-menu-open");
    openGameMenuButton?.setAttribute("aria-pressed", "true");
    if (typeof gameMenuDialog.showModal === "function") {
        gameMenuDialog.showModal();
    } else {
        gameMenuDialog.setAttribute("open", "");
    }
    gameMenuSettingsButton?.focus();
    void applyAutoFullscreenPolicy();
}

function closeGameMenu() {
    if (!gameMenuDialog || !isGameMenuOpen()) {
        return;
    }
    // Restore the intended play state before requesting fullscreen. This keeps
    // requestFullscreen inside the resume click/key gesture required by browsers.
    setGamePaused(gameMenuPreviousPause);
    if (typeof gameMenuDialog.close === "function") {
        gameMenuDialog.close();
    } else {
        gameMenuDialog.removeAttribute("open");
        restorePauseAfterMenu();
    }
    void applyAutoFullscreenPolicy();
}

async function restartLevelFromMenu() {
    const returnToTitle = titleScreenActive;
    if (isGameMenuOpen()) {
        closeGameMenu();
    }
    await restartCurrentLevel();
    if (returnToTitle) {
        showTitleScreen();
    } else {
        titleScreenActive = false;
        gameHasStarted = true;
        setGamePaused(false, { clearInput: true });
        syncTitleScreenUi();
        void applyAutoFullscreenPolicy();
    }
}

async function exitToTitleFromMenu() {
    if (isGameMenuOpen()) {
        closeGameMenu();
    }
    await restartCurrentLevel();
    showTitleScreen();
}

async function restartCurrentLevel() {
    showLoadingScreen("Restarting level", 0.04);
    setGamePaused(true, { clearInput: true });
    try {
        const preservedSettings = normalizeGameSettings(gameState.settings);
        gameState = createInitialGameState({ settings: preservedSettings, randomSeed: browserRandomSeed() });
        gameState.debug.revision = GAME_REVISION;
        addEvent(gameState, `BUILD_REVISION_${GAME_REVISION}`);
        activeCaveWindow = normalizeCaveWindow(null);
        activeLevelMusic = normalizeLevelMusic(null);
        setLoadingProgress(0.12, "Resetting level data");
        const loadedBrowserCopy = maybeApplyBrowserCopyLevel();
        if (!loadedBrowserCopy) {
            await applyRequiredDefaultLevel();
        }
        setLoadingProgress(0.24, "Level data ready");
        renderer.syncCaveWindow(activeCaveWindow);
        await renderer.ensureEnvironmentAtlases(gameState.world.atlasManifests, {
            onProgress: ({ progress, label }) => {
                setLoadingProgress(0.24 + clamp01(progress) * 0.64, label);
            }
        });
        syncLoadedCharacterCombatProfiles();
        if (!applyLoadedAtlasCollisions()) {
            console.error("Restarted level, but its atlas collision data could not be applied.");
        }
        renderer.syncEnvironmentColorMap(gameState.world.colorMap);
        accumulator = 0;
        lastNow = performance.now();
        lastInputFrame = createInputFrame();
        devSingleStepArmed = false;
        levelTransitionLoading = false;
        input.clear();
        syncGameSettingsUi();
        syncSlidersFromTuning();
        syncTuningJson();
        updateHud();
        updateDebugText();
        setLoadingProgress(1, "Level ready");
        await nextPaint();
    } finally {
        hideLoadingScreen();
    }
}

function restorePauseAfterMenu() {
    document.body.classList.remove("game-menu-open");
    openGameMenuButton?.setAttribute("aria-pressed", "false");
    setGamePaused(gameMenuPreviousPause, { clearInput: true });
}

function isGameAudioMuted() {
    return Boolean(titleScreenActive || gameState.debug.paused || pageFocusLost);
}

function syncGameAudioState() {
    const muted = isGameAudioMuted();
    effectiveSfxVolume = muted ? 0 : clamp01(gameState.settings?.sfxVolume);
    musicDirector.setMuted(muted);
    return muted;
}

function setGamePaused(paused, { clearInput = false } = {}) {
    gameState.debug.paused = Boolean(paused);
    if (clearInput) {
        input.clear();
    }
    syncGameAudioState();
    return gameState.debug.paused;
}

function pauseForPageFocusLoss() {
    pageFocusLost = true;
    syncGameAudioState();
    if (titleScreenActive) {
        setGamePaused(true, { clearInput: true });
        return;
    }
    if (!isGameMenuOpen()) {
        openGameMenu();
    } else {
        setGamePaused(true, { clearInput: true });
    }
    void applyAutoFullscreenPolicy();
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
    gameMenuView = view === "settings" ? "settings" : "menu";
    const inSettings = gameMenuView === "settings";
    if (gameMenuMain) gameMenuMain.hidden = inSettings;
    if (gameSettingsPanel) gameSettingsPanel.hidden = !inSettings;
    if (gameMenuTitle) gameMenuTitle.textContent = inSettings ? "Settings" : (titleScreenActive ? "Menu" : "Paused");
    if (gameMenuSubtitle) {
        gameMenuSubtitle.textContent = inSettings
            ? "Tune the machinery without disturbing the cave dust."
            : (titleScreenActive ? "Choose where to go next." : "The cave can wait. Probably.");
    }
    if (gameMenuBackButton) gameMenuBackButton.textContent = "BACK";
    if (gameMenuExitTitleButton) gameMenuExitTitleButton.hidden = titleScreenActive;
    if (isGameMenuOpen()) {
        (inSettings ? sfxVolumeInput : gameMenuSettingsButton)?.focus();
    }
}

function updatePersistentGameSettings(patch) {
    gameState.settings = saveStoredGameSettings({
        ...normalizeGameSettings(gameState.settings),
        ...patch
    });
    syncGameSettingsUi();
}

function syncGameSettingsUi() {
    gameState.settings = normalizeGameSettings(gameState.settings);
    const settings = gameState.settings;
    const difficulty = gameDifficultyPreset(settings);
    const quality = gameRenderingQualityPreset(settings);
    if (sfxVolumeInput) sfxVolumeInput.value = String(settings.sfxVolume);
    if (musicVolumeInput) musicVolumeInput.value = String(settings.musicVolume);
    if (autoFullscreenInput) autoFullscreenInput.checked = Boolean(settings.autoFullscreen);
    if (autoFullscreenRow) autoFullscreenRow.hidden = Boolean(electronWindowBridge);
    if (sfxVolumeValue) sfxVolumeValue.textContent = `${Math.round(settings.sfxVolume * 100)}%`;
    if (musicVolumeValue) musicVolumeValue.textContent = `${Math.round(settings.musicVolume * 100)}%`;
    musicDirector.setVolume(settings.musicVolume);
    syncGameAudioState();
    if (difficultyValue) difficultyValue.textContent = difficulty.label;
    if (renderingQualityValue) renderingQualityValue.textContent = quality.label;
    for (const button of difficultyButtons) {
        button.setAttribute("aria-pressed", String(button.dataset.difficulty === settings.difficulty));
    }
    for (const button of renderingQualityButtons) {
        button.setAttribute("aria-pressed", String(button.dataset.renderingQuality === settings.renderingQuality));
    }
}

async function initializeFullscreenUi() {
    fullscreenActive = await readFullscreenState(electronWindowBridge, document);
    syncFullscreenUi();
}

async function requestFullscreenState(nextState) {
    if (fullscreenRequestPending || electronWindowBridge) {
        return fullscreenActive;
    }
    const enabled = Boolean(nextState);
    if (enabled === fullscreenActive) {
        return fullscreenActive;
    }
    fullscreenRequestPending = true;
    try {
        fullscreenActive = await setFullscreenState(enabled, null, document);
    } catch (error) {
        console.warn("Fullscreen could not be changed.", error);
        fullscreenActive = await readFullscreenState(null, document);
    } finally {
        fullscreenRequestPending = false;
        syncFullscreenUi();
    }
    return fullscreenActive;
}

async function toggleFullscreen() {
    if (electronWindowBridge) {
        return fullscreenActive;
    }
    return requestFullscreenState(!fullscreenActive);
}

function shouldAutomaticallyUseFullscreen() {
    return !electronWindowBridge &&
        Boolean(gameState.settings?.autoFullscreen) &&
        !titleScreenActive &&
        !isGameMenuOpen() &&
        !gameState.debug.paused;
}

async function applyAutoFullscreenPolicy() {
    if (electronWindowBridge) {
        return;
    }
    await requestFullscreenState(shouldAutomaticallyUseFullscreen());
}

function maybeApplyAutoFullscreenFromGameplayGesture(event) {
    if (!shouldAutomaticallyUseFullscreen() || fullscreenActive || fullscreenRequestPending) {
        return;
    }
    const target = event?.target;
    if (target instanceof Element && target.closest("button, a, input, select, textarea, label, dialog, [data-ignore-game-pointer]")) {
        return;
    }
    if (event?.type === "keydown" && ["Escape", "Tab", "F11", "KeyP", "KeyO"].includes(event.code)) {
        return;
    }
    void requestFullscreenState(true);
}


function unlockMusicFromGesture() {
    void musicDirector.unlock();
}

function attemptVisibleLevelMusicStart() {
    if (titleScreenActive || isGameAudioMuted()) {
        return Promise.resolve(false);
    }
    // Attempt as soon as the first level frame is visible. Browsers that still
    // require a fresh user gesture fall back to unlockMusicFromGesture below.
    return musicDirector.unlock();
}

function syncFullscreenUi() {
    if (!fullscreenToggleButton) {
        return;
    }
    if (electronWindowBridge) {
        fullscreenToggleButton.hidden = true;
        fullscreenToggleButton.setAttribute("aria-pressed", "false");
        return;
    }
    fullscreenToggleButton.textContent = fullscreenActive ? "WINDOWED" : "FULLSCREEN";
    fullscreenToggleButton.setAttribute("aria-pressed", String(fullscreenActive));
    fullscreenToggleButton.setAttribute("aria-label", fullscreenActive ? "Exit fullscreen" : "Enter fullscreen");
}

function setupPanelToggleButtons() {
    const updateAssetGuides = () => {
        if (!assetGuidesButton) {
            return;
        }
        assetGuidesButton.textContent = `Asset guides: ${gameState.debug.showAssetGuides ? "on" : "off"}`;
        assetGuidesButton.setAttribute("aria-pressed", gameState.debug.showAssetGuides ? "true" : "false");
    };

    const updatePuppetGuide = () => {
        if (!puppetGuideButton) {
            return;
        }
        puppetGuideButton.textContent = `Puppet guide: ${gameState.debug.showPuppetGuide ? "on" : "off"}`;
        puppetGuideButton.setAttribute("aria-pressed", gameState.debug.showPuppetGuide ? "true" : "false");
    };

    const updateDebugPanel = () => {
        if (!debugPanelButton || !debugEl) {
            return;
        }
        const visible = !debugEl.hidden;
        debugPanelButton.textContent = `Debug panel: ${visible ? "on" : "off"}`;
        debugPanelButton.setAttribute("aria-pressed", visible ? "true" : "false");
    };

    const updateGameTuning = () => {
        if (!gameTuningButton || !tuningPanel) {
            return;
        }
        const visible = !tuningPanel.hidden;
        gameTuningButton.textContent = `Game tuning: ${visible ? "on" : "off"}`;
        gameTuningButton.setAttribute("aria-pressed", visible ? "true" : "false");
    };

    const updateHelpPanel = () => {
        if (!helpPanelButton || !helpPanel) {
            return;
        }
        const visible = !helpPanel.hidden;
        helpPanelButton.textContent = `Help panel: ${visible ? "on" : "off"}`;
        helpPanelButton.setAttribute("aria-pressed", visible ? "true" : "false");
    };

    debugEl.hidden = true;
    tuningPanel.hidden = true;
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

    gameTuningButton?.addEventListener("click", () => {
        tuningPanel.hidden = !tuningPanel.hidden;
        updateGameTuning();
    });

    helpPanelButton?.addEventListener("click", () => {
        helpPanel.hidden = !helpPanel.hidden;
        updateHelpPanel();
    });

    updateAssetGuides();
    updatePuppetGuide();
    updateDebugPanel();
    updateGameTuning();
    updateHelpPanel();
}

function applyLoadedAtlasCollisions() {
    if (!renderer || typeof renderer.getEnvironmentManifests !== "function") {
        return false;
    }
    return applyAtlasManifestsToWorld(gameState, renderer.getEnvironmentManifests());
}

function frame(now) {
    const realDt = Math.min(0.08, (now - lastNow) / 1000);
    lastNow = now;
    let inputFrame = input.sample();
    if (titleScreenActive && !isGameMenuOpen() && titleStartRequested(inputFrame)) {
        startGameFromTitle();
        // Consume the title gesture until the physical gamepad control is released.
        // Clearing the input alone would otherwise turn a held A button into a new
        // jump edge on the following animation frame.
        input.suppressJumpUntilRelease();
        inputFrame = createInputFrame();
    }
    if (!isGameMenuOpen() && !titleScreenActive) {
        handleDebugInput(inputFrame);
    }
    syncGameAudioState();

    if (!gameState.debug.paused) {
        accumulator += realDt;
    } else if (devSingleStepArmed) {
        accumulator += FIXED_DT;
        devSingleStepArmed = false;
    }

    let safety = 0;
    while (accumulator >= FIXED_DT && safety < 8) {
        const stepInput = createSubstepInputFrame(inputFrame, safety);
        stepSimulation(gameState, stepInput, FIXED_DT);
        accumulator -= FIXED_DT;
        safety += 1;
    }

    lastInputFrame = inputFrame;
    gamepadHaptics.update(gameState, inputFrame);
    processLevelTransitionRequest();
    renderer.render(gameState, inputFrame, realDt);
    updateHud();
    updateDebugText();
    requestAnimationFrame(frame);
}

function handleDebugInput(inputFrame) {
    if (inputFrame.pausePressed) {
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
        }
    }
}


function displayedLevelNumber(levelId) {
    const match = /^level_(\d+)$/i.exec(String(levelId || ""));
    return match ? Math.max(1, Number(match[1]) || 1) : null;
}

function updateHud() {
    drawMinimap();
    const levelNumber = displayedLevelNumber(gameState.world?.levelId);
    const levelTitle = String(gameState.story?.levelTitle || "Untitled Cave").trim() || "Untitled Cave";
    if (levelTitleText) {
        levelTitleText.textContent = levelNumber === null ? levelTitle : `Level ${levelNumber}: ${levelTitle}`;
        levelTitleText.title = levelTitleText.textContent;
    }
    if (scoreText) {
        scoreText.textContent = `Score: ${Math.max(0, Math.floor(Number(gameState.score) || 0))}`;
    }

    const fuelPercent = Math.max(0, Math.min(100, gameState.fuel.amount / Math.max(1, gameState.fuel.max) * 100));
    const healthPercent = Math.max(0, Math.min(100, gameState.health.amount / Math.max(1, gameState.health.max) * 100));
    fuelFill.style.width = `${fuelPercent.toFixed(1)}%`;
    healthFill.style.width = `${healthPercent.toFixed(1)}%`;
    healthFill.classList.toggle("regenerating", gameState.health.regenerating === true);
    healthFill.classList.toggle("recently-damaged", (Number(gameState.health.invulnerabilityTimer) || 0) > 0);
    fuelText.textContent = `${Math.round(gameState.fuel.amount)} / ${Math.round(gameState.fuel.max)} %`;
    healthText.textContent = `${Math.round(gameState.health.amount)} / ${Math.round(gameState.health.max)} HP`;

    const displayedEffect = prioritizedActivePowerUpEffect(gameState);
    if (!displayedEffect) {
        powerText.textContent = "Powerup:";
        powerTime.textContent = "";
        powerFill.style.width = "0%";
        return;
    }

    powerText.textContent = `Powerup: ${displayedEffect.definition.label}`;
    if (displayedEffect.definition.permanent) {
        powerTime.textContent = "∞";
        powerFill.style.width = "100%";
        return;
    }

    const totalSeconds = Math.max(0.1, Number(displayedEffect.definition.durationSeconds) || 0.1);
    const remainingSeconds = Math.max(0, Math.min(totalSeconds, Number(displayedEffect.remainingSeconds) || 0));
    const displayedRemaining = remainingSeconds.toFixed(1);
    const displayedTotal = Number.isInteger(totalSeconds) ? totalSeconds.toFixed(0) : totalSeconds.toFixed(1);
    powerTime.textContent = `${displayedRemaining} / ${displayedTotal} s`;
    powerFill.style.width = `${(remainingSeconds / totalSeconds * 100).toFixed(1)}%`;
}

function updateDebugText() {
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
        ? `render avg:${performanceStats.averageFrameMs.toFixed(2)}ms last:${performanceStats.frameMs.toFixed(2)}ms observed:${performanceStats.observedFps.toFixed(0)}fps world:${performanceStats.worldMs.toFixed(2)} actors:${performanceStats.actorsMs.toFixed(2)} foreground:${performanceStats.foregroundMs.toFixed(2)} mask:${performanceStats.maskMs.toFixed(2)} overlay:${performanceStats.overlayMs.toFixed(2)}`
        : "render diagnostics pending";
    const visualPerformanceText = Number.isFinite(performanceStats.visualsConsidered)
        ? `visuals considered:${performanceStats.visualsConsidered} drawn:${performanceStats.visualsDrawn} culled:${performanceStats.visualsCulled} spatial:${performanceStats.visualsSpatialCulled || 0} dynamic considered:${performanceStats.dynamicConsidered} drawn:${performanceStats.dynamicDrawn} culled:${performanceStats.dynamicCulled} foreground-cache hit:${performanceStats.foregroundCacheHits} miss:${performanceStats.foregroundCacheMisses} mask-cache:${performanceStats.maskReused ? "hit" : "miss"}`
        : "visual diagnostics pending";

    debugEl.textContent = [
        `rev:${GAME_REVISION}  ${gameState.debug.paused ? "PAUSED" : "RUNNING"}  tick:${gameState.clock.tick}  t:${gameState.clock.time.toFixed(2)}`,
        `difficulty:${gameState.settings?.difficulty || "normal"} damageScale:${gameDifficultyPreset(gameState.settings).damageScale.toFixed(2)} quality:${gameState.settings?.renderingQuality || "medium"} particleScale:${gameRenderingQualityPreset(gameState.settings).particleScale.toFixed(2)} music:${Math.round((gameState.settings?.musicVolume ?? 0.1) * 100)}% sfx:${Math.round(effectiveSfxVolume * 100)}% tune:${activeLevelMusic.tuneId} audio:${isGameAudioMuted() ? "muted" : (musicDirector.isUnlocked() ? "on" : "locked")}`,
        viewText,
        performanceText,
        visualPerformanceText,
        characterText,
        animationText,
        `intro:${gameState.story?.portalIntro?.active ? gameState.story.portalIntro.phase : "complete/off"}  exit:${gameState.story?.portalExit?.active ? gameState.story.portalExit.phase : (gameState.story?.portalExit ? "armed" : "off")}  mailbox:${gameState.story?.mailboxEvent?.active ? gameState.story.mailboxEvent.phase : "armed/off"}  playerVisible:${p.visible !== false}`,
        `pos (${p.x.toFixed(1)}, ${p.y.toFixed(1)})  vel (${p.vx.toFixed(1)}, ${p.vy.toFixed(1)})`,
        `ground:${p.onGround}  facing:${p.facing > 0 ? "right" : "left"}  boost:${gameState.equipment.rocket.attachedBoosting}  crush:${p.crushCandidateTicks || 0}/${gameState.tuning.playerCrushConfirmTicks || 3}  death:${p.deathPhase || "none"}/${(p.deathPhaseTimer || 0).toFixed(2)}  hoverA:${gameState.equipment.rocket.boostAccelerationNow.toFixed(0)}  hoverLimit:${gameState.tuning.attachedBoostHoverFallSpeed.toFixed(0)}`,
        `fuel:${fuel.amount.toFixed(2)}  delay:${fuel.rechargeDelayTimer.toFixed(2)}  cap:${fuel.rechargeCap}  rechargeLatched:${fuel.rechargeLatched ? "yes" : "no"}  groundRecharge:${gameState.tuning.fuelRechargeRequiresGround !== false}  kick:${gameState.equipment.rocket.boostKickCharge.toFixed(2)}  smokeDown:${(gameState.tuning.attachedBoostSmokePuffDownSpeed ?? 170).toFixed(0)}  bulbFlash:${(gameState.equipment.rocket.fuelBulbFlashTimer ?? 0).toFixed(2)}`,
        `rockets:${gameState.projectiles.length}  smoke:${gameState.effects?.smokePuffs?.length ?? 0}  collision:${gameState.world.collisionMode || "rectangles"} seg:${gameState.world.segments?.length ?? 0}  upLaunch:${gameState.tuning.rocketProjectileUpLaunchSeconds.toFixed(2)}  homing:${gameState.tuning.rocketProjectileHomingStrength.toFixed(2)}  target:${gameState.targets[0] ? `${gameState.targets[0].x.toFixed(0)},${gameState.targets[0].y.toFixed(0)}` : "none"}`,
        inputText + `  inputConsole:${input.isConsoleLoggingEnabled() ? "on" : "off"}  assetGuides:${gameState.debug.showAssetGuides ? "on" : "off"}  puppetGuide:${gameState.debug.showPuppetGuide ? "on" : "off"}`,
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

function setupTuningControls() {
    const controls = [
        { key: "gravity", label: "Gravity", min: 800, max: 2200, step: 10 },
        { key: "jumpVelocity", label: "Jump velocity", min: -1050, max: -450, step: 5 },
        { key: "maxRunSpeed", label: "Max run speed", min: 180, max: 620, step: 5 },
        { key: "groundAcceleration", label: "Ground accel", min: 800, max: 5000, step: 25 },
        { key: "groundFriction", label: "Ground friction", min: 400, max: 4500, step: 25 },
        { key: "attachedBoostStartImpulse", label: "Boost kick impulse", min: -900, max: -20, step: 5 },
        { key: "attachedBoostKickFuelCost", label: "Boost kick fuel cost", min: 0, max: 50, step: 1 },
        { key: "attachedBoostBurstDuration", label: "Kick/burst charge seconds", min: 0.05, max: 1.2, step: 0.01 },
        { key: "attachedBoostHoverFallSpeed", label: "Hover slow-fall speed", min: 0, max: 260, step: 2 },
        { key: "attachedBoostHoverBrakeAcceleration", label: "Hover braking accel", min: 400, max: 7000, step: 50 },
        { key: "attachedBoostVisualIdlePower", label: "Hover idle exhaust", min: 0.05, max: 1.1, step: 0.05 },
        { key: "attachedBoostKickVisualPower", label: "Kick puff power", min: 0.2, max: 1.8, step: 0.05 },
        { key: "attachedBoostSustainVisualPower", label: "Sustain puff power", min: 0.05, max: 1.2, step: 0.05 },
        { key: "attachedBoostSmokePuffInterval", label: "Attached smoke spacing", min: 0.025, max: 0.18, step: 0.005 },
        { key: "attachedBoostSmokePuffDownSpeed", label: "Attached smoke down speed", min: 20, max: 900, step: 10 },
        { key: "attachedBoostSmokePuffSideSpeed", label: "Attached smoke side spread", min: 0, max: 160, step: 4 },
        { key: "attachedBoostSmokePuffSpeedJitter", label: "Attached smoke speed jitter", min: 0, max: 180, step: 4 },
        { key: "attachedBoostDrainRate", label: "Boost drain", min: 10, max: 240, step: 2 },
        { key: "rocketProjectileUpLaunchSeconds", label: "Rocket straight-up time", min: 0, max: 1.0, step: 0.01 },
        { key: "rocketProjectileHomingStrength", label: "Homing", min: 0, max: 9, step: 0.1 },
        { key: "rocketProjectileSpeed", label: "Rocket speed", min: 180, max: 920, step: 10 },
        { key: "rocketProjectileDamage", label: "Rocket damage", min: 0, max: 200, step: 5 },
        { key: "hazardContactDamage", label: "Hazard contact damage", min: 0, max: 100, step: 1 },
        { key: "playerDamageInvulnerabilitySeconds", label: "Damage invulnerability", min: 0, max: 2, step: 0.05 },
        { key: "healthRegenDelay", label: "Health regen delay", min: 0, max: 15, step: 0.25 },
        { key: "healthRegenRate", label: "Health regen rate", min: 0, max: 30, step: 0.5 },
        { key: "rocketSmokePuffLifetime", label: "Smoke puff lifetime", min: 0.4, max: 6, step: 0.1 },
        { key: "rocketSmokePuffSpacing", label: "Smoke puff spacing", min: 2, max: 34, step: 1 },
        { key: "rocketSmokePuffScale", label: "Smoke puff scale", min: 0.5, max: 2.5, step: 0.05 },
        { key: "rocketImpactSmokePuffs", label: "Impact smoke puffs", min: 0, max: 60, step: 1 },
        { key: "rechargeRate", label: "Recharge", min: 10, max: 360, step: 2 },
        { key: "rocketLaunchCost", label: "Rocket launch cost", min: 0, max: 100, step: 1 },
        { key: "rocketFuelBulbLowThreshold", label: "Bulb red threshold", min: 0, max: 100, step: 1 },
        { key: "rocketFuelBulbMediumThreshold", label: "Bulb yellow threshold", min: 0, max: 100, step: 1 },
        { key: "rocketFuelBulbScale", label: "Bulb scale", min: 0.35, max: 2.4, step: 0.05 },
        { key: "poseBlendSpeed", label: "Pose blend speed", min: 0, max: 30, step: 0.5 }
    ];

    for (const spec of controls) {
        const label = document.createElement("label");
        const name = document.createElement("span");
        const range = document.createElement("input");
        const value = document.createElement("span");
        name.textContent = spec.label;
        range.type = "range";
        range.min = spec.min;
        range.max = spec.max;
        range.step = spec.step;
        range.value = gameState.tuning[spec.key] ?? DEFAULT_TUNING[spec.key];
        value.textContent = formatTuningValue(range.value);
        range.addEventListener("input", () => {
            gameState.tuning[spec.key] = Number(range.value);
            applyTuningSideEffects(spec.key);
            value.textContent = formatTuningValue(range.value);
            syncTuningJson();
            showTuningMessage("");
        });
        label.append(name, range, value);
        tuningControlsEl.append(label);
        tuningSliders.set(spec.key, { range, value });
    }

    syncTuningJson();
}

function setupTuningJsonControls() {
    if (eventFilterEl) {
        eventFilterEl.value = gameState.debug.eventFilterText || "";
        eventFilterEl.addEventListener("input", () => {
            gameState.debug.eventFilterText = eventFilterEl.value;
        });
    }

    refreshTuningJsonButton.addEventListener("click", () => {
        syncTuningJson();
        showTuningMessage("JSON refreshed from current tuning.");
    });

    copyTuningJsonButton.addEventListener("click", async () => {
        syncTuningJson();
        try {
            await navigator.clipboard.writeText(tuningJsonEl.value);
            showTuningMessage("Tuning JSON copied to clipboard.");
        } catch (error) {
            tuningJsonEl.focus();
            tuningJsonEl.select();
            showTuningMessage("Clipboard blocked. The JSON is selected for manual copy.");
        }
    });

    applyTuningJsonButton.addEventListener("click", () => {
        try {
            const parsed = JSON.parse(tuningJsonEl.value);
            if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
                throw new Error("The tuning JSON must be an object.");
            }
            Object.assign(gameState.tuning, parsed);
            for (const key of Object.keys(parsed)) {
                applyTuningSideEffects(key);
            }
            syncSlidersFromTuning();
            syncTuningJson();
            showTuningMessage("Applied tuning JSON.");
        } catch (error) {
            showTuningMessage(`Could not apply JSON:
${error.message}`);
        }
    });
}

function applyTuningSideEffects(key) {
    if (key === "maxRunSpeed") {
        gameState.player.vx = Math.max(-gameState.tuning.maxRunSpeed, Math.min(gameState.tuning.maxRunSpeed, gameState.player.vx));
    }
    if (key === "attachedBoostKickChargeMax") {
        gameState.equipment.rocket.boostKickCharge = Math.min(gameState.equipment.rocket.boostKickCharge, gameState.tuning.attachedBoostKickChargeMax);
    }
    if (["fuelMax", "baseRechargeCap", "initialFuel", "rechargeRate", "attachedBoostDrainRate", "rocketLaunchCost"].includes(key)) {
        gameState.fuel.max = gameState.tuning.fuelMax;
        gameState.fuel.rechargeCap = Math.min(gameState.tuning.baseRechargeCap, gameState.fuel.max);
        gameState.fuel.amount = Math.min(gameState.fuel.amount, gameState.fuel.max);
    }
    gameState.clock.fixedDt = gameState.tuning.timestep || FIXED_DT;
}

function syncTuningJson() {
    tuningJsonEl.value = JSON.stringify(gameState.tuning, null, 4);
}

function syncSlidersFromTuning() {
    for (const [key, refs] of tuningSliders) {
        const value = gameState.tuning[key] ?? DEFAULT_TUNING[key];
        refs.range.value = value;
        refs.value.textContent = formatTuningValue(value);
        applyTuningSideEffects(key);
    }
}

function showTuningMessage(message) {
    tuningMessageEl.textContent = message;
}

function formatTuningValue(value) {
    const n = Number(value);
    return Number.isInteger(n) ? String(n) : n.toFixed(1);
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
        gameState = createInitialGameState({ settings: gameState.settings });
        gameState.debug.revision = GAME_REVISION;
        gamepadHaptics.reset(gameState.debug.lastEvents);
        applyLoadedAtlasCollisions();
        syncGameSettingsUi();
        syncGameAudioState();
    },
    setPhase(phase) {
        renderer.forcePhase = phase;
    },
    setTuning(nextTuning) {
        Object.assign(gameState.tuning, nextTuning);
        syncSlidersFromTuning();
        syncTuningJson();
    },
    clearForcedPhase() {
        renderer.forcePhase = null;
    },
    setPlayerPose({ x = 210, y = 600, facing = 1, vx = 0, vy = 0, onGround = true } = {}) {
        Object.assign(gameState.player, { x, y, facing, vx, vy, onGround });
        gameState.camera.x = x + 150 * facing;
        gameState.camera.y = y - 170;
    },
    getRigMetrics() {
        return renderer.getRigMetrics(gameState);
    },
    getInputEvents(limit = 20) {
        return input.getRecentEvents(limit);
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
