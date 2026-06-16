import {
    FIXED_DT,
    DEFAULT_TUNING,
    createInitialGameState,
    createInputFrame,
    stepSimulation,
    resetPlayer,
    cloneGameState,
    serializeGameState
} from "./IgnatiusRocketfrock_SIM.js";
import { RocketfrockInput } from "./IgnatiusRocketfrock_INPUT.js";
import { createRenderer } from "./IgnatiusRocketfrock_RENDER.js";

const canvas = document.getElementById("stage");
const fuelText = document.getElementById("fuel-text");
const fuelFill = document.getElementById("fuel-fill");
const healthText = document.getElementById("health-text");
const healthFill = document.getElementById("health-fill");
const debugEl = document.getElementById("debug");
const tuningControlsEl = document.getElementById("tuning-controls");
const tuningJsonEl = document.getElementById("tuning-json");
const tuningMessageEl = document.getElementById("tuning-message");
const toggleTuningButton = document.getElementById("toggle-tuning");
const applyTuningJsonButton = document.getElementById("apply-tuning-json");
const copyTuningJsonButton = document.getElementById("copy-tuning-json");
const refreshTuningJsonButton = document.getElementById("refresh-tuning-json");
const tuningPanel = document.getElementById("tuning");

let gameState = createInitialGameState();
const input = new RocketfrockInput(window);
const renderer = await createRenderer(canvas);
let accumulator = 0;
let lastNow = performance.now();
let lastInputFrame = createInputFrame();
let devSingleStepArmed = false;
const tuningSliders = new Map();

setupTuningControls();
setupTuningJsonControls();

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
        stepSimulation(gameState, inputFrame, FIXED_DT);
        accumulator -= FIXED_DT;
        safety += 1;
    }

    lastInputFrame = inputFrame;
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
    if (inputFrame.toggleDebugPanelPressed) {
        debugEl.hidden = !debugEl.hidden;
    }
}

function updateHud() {
    const fuelPercent = gameState.fuel.amount / gameState.fuel.max * 100;
    const healthPercent = gameState.health.amount / gameState.health.max * 100;
    fuelFill.style.width = `${fuelPercent.toFixed(1)}%`;
    healthFill.style.width = `${healthPercent.toFixed(1)}%`;
    fuelText.textContent = `${gameState.fuel.amount.toFixed(1)} / ${gameState.fuel.max}  cap ${gameState.fuel.rechargeCap}${gameState.tuning.fuelRechargeRequiresGround !== false ? "  grounded recharge" : ""}`;
    healthText.textContent = `${gameState.health.amount.toFixed(1)} / ${gameState.health.max}`;
}

function updateDebugText() {
    const p = gameState.player;
    const fuel = gameState.fuel;
    const inputText = gameState.debug.showInput
        ? `input L:${Number(lastInputFrame.moveLeft)} R:${Number(lastInputFrame.moveRight)} jump:${Number(lastInputFrame.jumpHeld)} weapon:${Number(lastInputFrame.weaponHeld)}`
        : "input hidden";
    const events = gameState.debug.lastEvents
        .slice(-8)
        .map((event) => `${String(event.tick).padStart(5, " ")} ${event.type}`)
        .join("\n");

    debugEl.textContent = [
        `${gameState.debug.paused ? "PAUSED" : "RUNNING"}  tick:${gameState.clock.tick}  t:${gameState.clock.time.toFixed(2)}`,
        `pos (${p.x.toFixed(1)}, ${p.y.toFixed(1)})  vel (${p.vx.toFixed(1)}, ${p.vy.toFixed(1)})`,
        `ground:${p.onGround}  facing:${p.facing > 0 ? "right" : "left"}  boost:${gameState.equipment.rocket.attachedBoosting}  hoverA:${gameState.equipment.rocket.boostAccelerationNow.toFixed(0)}  hoverLimit:${gameState.tuning.attachedBoostHoverFallSpeed.toFixed(0)}`,
        `fuel:${fuel.amount.toFixed(2)}  delay:${fuel.rechargeDelayTimer.toFixed(2)}  cap:${fuel.rechargeCap}  rechargeLatched:${fuel.rechargeLatched ? "yes" : "no"}  groundRecharge:${gameState.tuning.fuelRechargeRequiresGround !== false}  kick:${gameState.equipment.rocket.boostKickCharge.toFixed(2)}  smokeDown:${(gameState.tuning.attachedBoostSmokePuffDownSpeed ?? 170).toFixed(0)}  bulbFlash:${(gameState.equipment.rocket.fuelBulbFlashTimer ?? 0).toFixed(2)}`,
        `rockets:${gameState.projectiles.length}  smoke:${gameState.effects?.smokePuffs?.length ?? 0}  upLaunch:${gameState.tuning.rocketProjectileUpLaunchSeconds.toFixed(2)}  homing:${gameState.tuning.rocketProjectileHomingStrength.toFixed(2)}  target:${gameState.targets[0].x.toFixed(0)},${gameState.targets[0].y.toFixed(0)}`,
        inputText,
        "events:",
        events
    ].join("\n");
}

function setupTuningControls() {
    const controls = [
        { key: "gravity", label: "Gravity", min: 800, max: 2200, step: 10 },
        { key: "jumpVelocity", label: "Jump velocity", min: -1050, max: -450, step: 5 },
        { key: "maxRunSpeed", label: "Max run speed", min: 180, max: 620, step: 5 },
        { key: "groundAcceleration", label: "Ground accel", min: 800, max: 5000, step: 25 },
        { key: "groundFriction", label: "Ground friction", min: 400, max: 4500, step: 25 },
        { key: "attachedBoostStartImpulse", label: "Boost kick impulse", min: -900, max: -20, step: 5 },
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
        { key: "rocketSmokePuffLifetime", label: "Smoke puff lifetime", min: 0.4, max: 6, step: 0.1 },
        { key: "rocketSmokePuffSpacing", label: "Smoke puff spacing", min: 2, max: 34, step: 1 },
        { key: "rocketSmokePuffScale", label: "Smoke puff scale", min: 0.5, max: 2.5, step: 0.05 },
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
    toggleTuningButton.addEventListener("click", () => {
        const collapsed = tuningPanel.classList.toggle("collapsed");
        toggleTuningButton.textContent = collapsed ? "Expand" : "Collapse";
    });

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
    }
};

requestAnimationFrame(frame);
