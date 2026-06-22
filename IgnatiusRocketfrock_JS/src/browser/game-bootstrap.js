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
import { createRenderer } from "../presentation/canvas-renderer.js";

const canvas = document.getElementById("stage");
const fuelText = document.getElementById("fuel-text");
const fuelFill = document.getElementById("fuel-fill");
const healthText = document.getElementById("health-text");
const healthFill = document.getElementById("health-fill");
const debugEl = document.getElementById("debug");
const tuningControlsEl = document.getElementById("tuning-controls");
const tuningJsonEl = document.getElementById("tuning-json");
const tuningMessageEl = document.getElementById("tuning-message");
const eventFilterEl = document.getElementById("event-filter");
const assetGuidesButton = document.getElementById("toggle-asset-guides");
const debugPanelButton = document.getElementById("toggle-debug-panel");
const gameTuningButton = document.getElementById("toggle-game-tuning");
const helpPanelButton = document.getElementById("toggle-help-panel");
const helpPanel = document.getElementById("help-panel");
const applyTuningJsonButton = document.getElementById("apply-tuning-json");
const copyTuningJsonButton = document.getElementById("copy-tuning-json");
const refreshTuningJsonButton = document.getElementById("refresh-tuning-json");
const tuningPanel = document.getElementById("tuning");

const GAME_REVISION = "112";

let gameState = createInitialGameState();
gameState.debug.revision = GAME_REVISION;
addEvent(gameState, `BUILD_REVISION_${GAME_REVISION}`);
const input = new RocketfrockInput(window);
const renderer = await createRenderer(canvas);
const loadedBrowserCopy = maybeApplyBrowserCopyLevel();
if (!loadedBrowserCopy) {
    await applyRequiredDefaultLevel();
}
syncLoadedCharacterCombatProfiles();
if (!applyLoadedAtlasCollisions()) {
    failStartup("Required atlas collision data could not be applied. Check assets/at_atlas_001.json and the level atlasRefs.");
}
// Build any level-wide recoloured atlas copies once during level startup. The
// render loop only compares the cache key and uses ordinary drawImage calls.
renderer.syncEnvironmentColorMap(gameState.world.colorMap);
let accumulator = 0;
let lastNow = performance.now();
let lastInputFrame = createInputFrame();
let devSingleStepArmed = false;
let levelTransitionLoading = false;
const tuningSliders = new Map();

setupTuningControls();
setupTuningJsonControls();
setupPanelToggleButtons();

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
    if (!applyEditorLevelToWorld(gameState, level)) {
        console.error(`Level transition failed while applying ${loadedLevelId}.`);
        gameState.player.visible = true;
        return false;
    }
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
    return true;
}

function failStartup(message, error) {
    console.error(message, error || "");
    const panel = document.createElement("div");
    panel.setAttribute("role", "alert");
    panel.style.position = "fixed";
    panel.style.inset = "24px auto auto 24px";
    panel.style.maxWidth = "720px";
    panel.style.zIndex = "9999";
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

function setupPanelToggleButtons() {
    const updateAssetGuides = () => {
        if (!assetGuidesButton) {
            return;
        }
        assetGuidesButton.textContent = `Asset guides: ${gameState.debug.showAssetGuides ? "on" : "off"}`;
        assetGuidesButton.setAttribute("aria-pressed", gameState.debug.showAssetGuides ? "true" : "false");
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
    helpPanel.hidden = false;

    assetGuidesButton?.addEventListener("click", () => {
        gameState.debug.showAssetGuides = !gameState.debug.showAssetGuides;
        updateAssetGuides();
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
    const inputFrame = input.sample();
    handleDebugInput(inputFrame);

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
    processLevelTransitionRequest();
    renderer.render(gameState, inputFrame, realDt);
    updateHud();
    updateDebugText();
    requestAnimationFrame(frame);
}

function handleDebugInput(inputFrame) {
    if (inputFrame.pausePressed) {
        gameState.debug.paused = !gameState.debug.paused;
    }
    if (inputFrame.stepPressed) {
        gameState.debug.paused = true;
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


function updateHud() {
    const fuelPercent = gameState.fuel.amount / gameState.fuel.max * 100;
    const healthPercent = gameState.health.amount / gameState.health.max * 100;
    fuelFill.style.width = `${fuelPercent.toFixed(1)}%`;
    healthFill.style.width = `${healthPercent.toFixed(1)}%`;
    healthFill.classList.toggle("regenerating", gameState.health.regenerating === true);
    healthFill.classList.toggle("recently-damaged", (Number(gameState.health.invulnerabilityTimer) || 0) > 0);
    fuelText.textContent = `${gameState.fuel.amount.toFixed(1)} / ${gameState.fuel.max}  cap ${gameState.fuel.rechargeCap}${gameState.tuning.fuelRechargeRequiresGround !== false ? "  grounded recharge" : ""}`;
    const rawLastDamagedAt = gameState.health.lastDamagedAt;
    const lastDamagedAt = Number(rawLastDamagedAt);
    const regenWait = rawLastDamagedAt !== null && rawLastDamagedAt !== undefined && Number.isFinite(lastDamagedAt)
        ? Math.max(0, gameState.tuning.healthRegenDelay - (gameState.clock.time - lastDamagedAt))
        : 0;
    const healthStatus = gameState.health.regenerating
        ? "  regenerating"
        : (gameState.health.amount < gameState.health.max && regenWait > 0 ? `  regen in ${regenWait.toFixed(1)}s` : "");
    healthText.textContent = `${gameState.health.amount.toFixed(1)} / ${gameState.health.max}${healthStatus}`;
}

function updateDebugText() {
    const p = gameState.player;
    const fuel = gameState.fuel;
    const inputText = gameState.debug.showInput
        ? `input L:${Number(lastInputFrame.moveLeft)} R:${Number(lastInputFrame.moveRight)} jump:${Number(lastInputFrame.jumpHeld)} weapon:${Number(lastInputFrame.weaponHeld)}`
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

    debugEl.textContent = [
        `rev:${GAME_REVISION}  ${gameState.debug.paused ? "PAUSED" : "RUNNING"}  tick:${gameState.clock.tick}  t:${gameState.clock.time.toFixed(2)}`,
        viewText,
        characterText,
        animationText,
        `intro:${gameState.story?.portalIntro?.active ? gameState.story.portalIntro.phase : "complete/off"}  exit:${gameState.story?.portalExit?.active ? gameState.story.portalExit.phase : (gameState.story?.portalExit ? "armed" : "off")}  mailbox:${gameState.story?.mailboxEvent?.active ? gameState.story.mailboxEvent.phase : "armed/off"}  playerVisible:${p.visible !== false}`,
        `pos (${p.x.toFixed(1)}, ${p.y.toFixed(1)})  vel (${p.vx.toFixed(1)}, ${p.vy.toFixed(1)})`,
        `ground:${p.onGround}  facing:${p.facing > 0 ? "right" : "left"}  boost:${gameState.equipment.rocket.attachedBoosting}  hoverA:${gameState.equipment.rocket.boostAccelerationNow.toFixed(0)}  hoverLimit:${gameState.tuning.attachedBoostHoverFallSpeed.toFixed(0)}`,
        `fuel:${fuel.amount.toFixed(2)}  delay:${fuel.rechargeDelayTimer.toFixed(2)}  cap:${fuel.rechargeCap}  rechargeLatched:${fuel.rechargeLatched ? "yes" : "no"}  groundRecharge:${gameState.tuning.fuelRechargeRequiresGround !== false}  kick:${gameState.equipment.rocket.boostKickCharge.toFixed(2)}  smokeDown:${(gameState.tuning.attachedBoostSmokePuffDownSpeed ?? 170).toFixed(0)}  bulbFlash:${(gameState.equipment.rocket.fuelBulbFlashTimer ?? 0).toFixed(2)}`,
        `rockets:${gameState.projectiles.length}  smoke:${gameState.effects?.smokePuffs?.length ?? 0}  collision:${gameState.world.collisionMode || "rectangles"} seg:${gameState.world.segments?.length ?? 0}  upLaunch:${gameState.tuning.rocketProjectileUpLaunchSeconds.toFixed(2)}  homing:${gameState.tuning.rocketProjectileHomingStrength.toFixed(2)}  target:${gameState.targets[0] ? `${gameState.targets[0].x.toFixed(0)},${gameState.targets[0].y.toFixed(0)}` : "none"}`,
        inputText + `  inputConsole:${input.isConsoleLoggingEnabled() ? "on" : "off"}  assetGuides:${gameState.debug.showAssetGuides ? "on" : "off"}`,
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
};
window.getRocketfrockPose = () => ({
    player: cloneGameState(gameState.player),
    rocket: cloneGameState(gameState.equipment.rocket),
    rig: renderer.getRigMetrics(gameState)
});
window.__rocketfrockDev = {
    pause() {
        gameState.debug.paused = true;
    },
    resume() {
        gameState.debug.paused = false;
    },
    reset() {
        gameState = createInitialGameState();
        applyLoadedAtlasCollisions();
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
    }
};

requestAnimationFrame(frame);
