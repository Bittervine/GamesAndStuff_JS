import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { computeResponsiveViewportMetrics } from "./IgnatiusRocketfrock_RENDER.js";
import {
    FIXED_DT,
    DEFAULT_TUNING,
    createInitialGameState,
    createInputFrame,
    createSubstepInputFrame,
    stepSimulation,
    cloneGameState,
    serializeGameState,
    restoreGameState,
    resetPlayer,
    applyEditorLevelToWorld,
    applyAtlasManifestsToWorld
} from "./IgnatiusRocketfrock_SIM.js";

function approx(actual, expected, tolerance, label) {
    assert.ok(
        Math.abs(actual - expected) <= tolerance,
        `${label}: expected ${expected} +/- ${tolerance}, got ${actual}`
    );
}

function stepMany(state, frames, inputFactory = () => createInputFrame()) {
    for (let i = 0; i < frames; i += 1) {
        const input = inputFactory(i, state);
        stepSimulation(state, input, FIXED_DT);
    }
    return state;
}

function settleOnGround(state) {
    stepMany(state, 90, () => createInputFrame());
    assert.ok(state.player.onGround, "expected player to settle on the floor");
    approx(state.player.y, 600, 0.001, "floor contact y");
}

function releaseJumpAfterTakeoff(state) {
    stepSimulation(state, createInputFrame({ jumpReleased: true, jumpHeld: false }), FIXED_DT);
}

function testResponsiveViewportScaling() {
    const phone = computeResponsiveViewportMetrics(390, 844, 2, 600);
    assert.equal(phone.backingWidth, 780, "phone backing width should still match the real canvas pixels");
    approx(phone.cssScale, 0.65, 0.001, "phone CSS scale should fit 600 virtual pixels into 390 CSS pixels");
    approx(phone.virtualWidth, 600, 0.001, "narrow screens should see a 600-unit-wide virtual viewport");
    approx(phone.zoom, 1.3, 0.001, "phone world-to-canvas zoom should include DPR and the responsive scale");

    const desktop = computeResponsiveViewportMetrics(1280, 720, 1.5, 600);
    approx(desktop.cssScale, 1, 0.001, "desktop scale should not shrink");
    approx(desktop.virtualWidth, 1280, 0.001, "wide screens should keep their real CSS width");
    approx(desktop.zoom, 1.5, 0.001, "desktop zoom should remain DPR-only");
}

function testStateSerialization() {
    const state = createInitialGameState();
    stepSimulation(state, createInputFrame(), FIXED_DT);
    const cloned = cloneGameState(state);
    assert.deepStrictEqual(cloned, state, "clone should be structurally identical");
    const restored = restoreGameState(serializeGameState(state));
    assert.deepStrictEqual(restored, state, "serialized state should restore cleanly");
    assert.equal(typeof JSON.stringify(state), "string", "gameState should be JSON serializable");
}

function testHeadlessSteppingAndFloorCollision() {
    const state = createInitialGameState();
    settleOnGround(state);
    assert.equal(state.player.vy, 0, "vertical velocity should be zero on settled floor");
    assert.ok(state.debug.lastEvents.some((event) => event.type === "PLAYER_LANDED"), "landing should be logged");
}

function testLeftRightSymmetry() {
    const right = createInitialGameState();
    const left = createInitialGameState();
    settleOnGround(right);
    settleOnGround(left);

    stepMany(right, 30, () => createInputFrame({ moveRight: true }));
    stepMany(left, 30, () => createInputFrame({ moveLeft: true }));

    assert.ok(right.player.x > right.world.start.x + 60, `expected right run to move forward, got x=${right.player.x}`);
    assert.ok(left.player.x < left.world.start.x - 60, `expected left run to move backward, got x=${left.player.x}`);
    approx(Math.abs(right.player.vx), Math.abs(left.player.vx), 0.001, "mirrored run velocity magnitude");
    assert.equal(right.player.facing, 1, "right run should face right");
    assert.equal(left.player.facing, -1, "left run should face left");
}

function testJumpTransition() {
    const state = createInitialGameState();
    settleOnGround(state);
    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    assert.equal(state.player.onGround, false, "jump should leave the ground");
    assert.ok(state.player.vy < -650, `jump should set upward velocity, got ${state.player.vy}`);
    assert.ok(state.debug.lastEvents.some((event) => event.type === "PLAYER_JUMPED"), "jump event should be logged");
}

function testAttachedBoostStateAndFuelDrain() {
    const state = createInitialGameState();
    settleOnGround(state);
    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    releaseJumpAfterTakeoff(state);
    stepMany(state, 7, () => createInputFrame({ jumpHeld: false }));

    const beforeFuel = state.fuel.amount;
    const beforeVy = state.player.vy;
    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    assert.equal(state.equipment.rocket.attachedBoosting, true, "second jump press in air should start attached boost");
    stepMany(state, 20, () => createInputFrame({ jumpHeld: true }));
    assert.ok(state.fuel.amount < beforeFuel - 2.5, `fuel should drain while boosting, before ${beforeFuel}, after ${state.fuel.amount}`);
    assert.ok(state.player.vy > beforeVy - 340, "held rocket should not stack a sustained upward acceleration on top of the double-jump kick");

    stepSimulation(state, createInputFrame({ jumpReleased: true, jumpHeld: false }), FIXED_DT);
    assert.equal(state.equipment.rocket.attachedBoosting, false, "jump release should stop attached boost");
    assert.ok(state.debug.lastEvents.some((event) => event.type === "PLAYER_BOOST_STARTED"), "boost start event should be logged");
    assert.ok(state.debug.lastEvents.some((event) => event.type === "PLAYER_BOOST_ENDED"), "boost end event should be logged");
}

function testDoubleJumpKickAndHoverGovernor() {
    const state = createInitialGameState();
    settleOnGround(state);
    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    releaseJumpAfterTakeoff(state);
    stepMany(state, 9, () => createInputFrame({ jumpHeld: false }));

    const beforeBoostVy = state.player.vy;
    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    const afterKickVy = state.player.vy;
    assert.ok(afterKickVy < beforeBoostVy - 180, `rocket firing should add a one-shot double-jump kick, before ${beforeBoostVy}, after ${afterKickVy}`);

    stepMany(state, 8, () => createInputFrame({ jumpHeld: true }));
    assert.ok(state.player.vy > afterKickVy, `holding rocket while rising should not add extra upward velocity, afterKick ${afterKickVy}, now ${state.player.vy}`);

    state.player.vy = 620;
    stepMany(state, 36, () => createInputFrame({ jumpHeld: true }));
    assert.ok(
        state.player.vy <= state.tuning.attachedBoostHoverFallSpeed + 4,
        `hover governor should reduce fast falls to the configured slow-fall speed, got ${state.player.vy}`
    );
    assert.ok(state.player.vy >= 0, `hover governor should not convert falling into upward flight, got ${state.player.vy}`);
    assert.ok(state.equipment.rocket.boostAccelerationNow <= 0, "hover governor should only apply upward correction while trimming a fall");
}

function testBoostKickCannotBeTapExploited() {
    const state = createInitialGameState();
    settleOnGround(state);
    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    releaseJumpAfterTakeoff(state);
    stepMany(state, 7, () => createInputFrame({ jumpHeld: false }));

    const beforeFirstKickVy = state.player.vy;
    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    const firstKickVy = state.player.vy;
    assert.ok(firstKickVy < beforeFirstKickVy - 180, `first air boost should spend the charged double-jump kick, before ${beforeFirstKickVy}, after ${firstKickVy}`);
    assert.equal(state.equipment.rocket.boostKickCharge, 0, "charged kick should be empty immediately after firing the rocket");

    stepSimulation(state, createInputFrame({ jumpReleased: true, jumpHeld: false }), FIXED_DT);
    stepMany(state, 6, () => createInputFrame({ jumpHeld: false }));
    const beforeSecondTapVy = state.player.vy;
    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    const secondTapVy = state.player.vy;
    assert.ok(secondTapVy > beforeSecondTapVy - 80, `rapid second tap should not receive another full kick, before ${beforeSecondTapVy}, after ${secondTapVy}`);

    stepSimulation(state, createInputFrame({ jumpReleased: true, jumpHeld: false }), FIXED_DT);
    state.player.y = 600;
    state.player.vy = 0;
    state.player.onGround = true;
    state.fuel.rechargeDelayTimer = state.tuning.rechargeDelayAfterUse;
    stepSimulation(state, createInputFrame(), FIXED_DT);
    assert.ok(state.equipment.rocket.boostKickCharge > 0.99, "kick charge should recharge as soon as Ignatius has landed, even during fuel recharge delay");
}

function testBoostKickCostsFuelAndRechargesOnLanding() {
    const costly = createInitialGameState({
        tuning: {
            attachedBoostKickFuelCost: 10,
            attachedBoostDrainRate: 0
        }
    });
    settleOnGround(costly);
    stepSimulation(costly, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    releaseJumpAfterTakeoff(costly);
    stepMany(costly, 7, () => createInputFrame({ jumpHeld: false }));
    costly.fuel.amount = 10;
    costly.equipment.rocket.boostKickCharge = 1;
    const beforeKickFuel = costly.fuel.amount;
    const beforeKickVy = costly.player.vy;
    stepSimulation(costly, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    assert.ok(costly.player.vy < beforeKickVy - 180, `kick should fire when at least 10 fuel is available, before ${beforeKickVy}, after ${costly.player.vy}`);
    approx(costly.fuel.amount, beforeKickFuel - 10, 0.001, "boost kick should spend its 10-fuel cost immediately");
    approx(costly.equipment.rocket.boostKickCharge, 0, 0.001, "boost kick charge should be spent by the kick");

    stepSimulation(costly, createInputFrame({ jumpReleased: true, jumpHeld: false }), FIXED_DT);
    costly.player.y = 600;
    costly.player.vy = 0;
    costly.player.onGround = true;
    costly.fuel.rechargeDelayTimer = costly.tuning.rechargeDelayAfterUse;
    stepSimulation(costly, createInputFrame(), FIXED_DT);
    assert.ok(costly.equipment.rocket.boostKickCharge > 0.99, "landing should recharge the kick even before fuel recharge starts");
    approx(costly.fuel.amount, 0, 0.001, "fuel should still wait for its recharge delay after landing");

    const lowFuel = createInitialGameState({
        tuning: {
            attachedBoostKickFuelCost: 10,
            attachedBoostDrainRate: 0
        }
    });
    settleOnGround(lowFuel);
    stepSimulation(lowFuel, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    releaseJumpAfterTakeoff(lowFuel);
    stepMany(lowFuel, 7, () => createInputFrame({ jumpHeld: false }));
    lowFuel.fuel.amount = 9;
    lowFuel.equipment.rocket.boostKickCharge = 1;
    const beforeLowFuelVy = lowFuel.player.vy;
    stepSimulation(lowFuel, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    assert.ok(lowFuel.player.vy > beforeLowFuelVy - 80, `less than 10 fuel should not fire the kick, before ${beforeLowFuelVy}, after ${lowFuel.player.vy}`);
    assert.ok(lowFuel.equipment.rocket.boostKickCharge > 0.99, "failed low-fuel kick should not spend the landing-recharged kick charge");
}

function testHomingRocketLaunch() {
    const state = createInitialGameState();
    settleOnGround(state);
    const target = state.targets[0];
    const startDistance = Math.hypot(target.x - state.player.x, target.y - (state.player.y - state.player.height * 0.72));
    stepSimulation(state, createInputFrame({ weaponPressed: true, weaponHeld: true }), FIXED_DT);
    assert.equal(state.projectiles.length, 1, "weapon press should launch one test rocket");
    assert.equal(state.projectiles[0].targetId, target.id, "test rocket should target the homing dot");
    assert.equal(state.projectiles[0].vx, 0, "test rocket should launch straight up before homing");
    assert.ok(state.projectiles[0].vy < -400, "test rocket should launch upward before turning");
    assert.ok(state.projectiles[0].upLaunchTimer > 0, "test rocket should have a straight-up launch timer");
    assert.ok(state.fuel.amount <= state.tuning.initialFuel - state.tuning.rocketLaunchCost, "rocket launch should spend fuel");
    stepMany(state, 95, () => createInputFrame());
    assert.ok(state.projectiles.length >= 1, "rocket should still be inspectable after a short flight");
    const rocket = state.projectiles[0];
    const flightDistance = Math.hypot(target.x - rocket.x, target.y - rocket.y);
    assert.ok(flightDistance < startDistance - 430, `homing rocket should close distance to dot after its upward launch, start ${startDistance}, now ${flightDistance}`);
}

function testRocketTrailTracksCurvedPathAndPersistsAfterExplosion() {
    const state = createInitialGameState();
    settleOnGround(state);
    stepSimulation(state, createInputFrame({ weaponPressed: true, weaponHeld: true }), FIXED_DT);
    stepMany(state, 75, () => createInputFrame());
    assert.equal(state.projectiles.length, 1, "rocket should still exist while trail is inspected");
    const trail = state.projectiles[0].trail;
    assert.ok(Array.isArray(trail), "rocket should expose a serializable trail array");
    assert.ok(trail.length > 12, `rocket trail should retain path samples, got ${trail.length}`);
    const xSpan = Math.max(...trail.map((point) => point.x)) - Math.min(...trail.map((point) => point.x));
    const ySpan = Math.max(...trail.map((point) => point.y)) - Math.min(...trail.map((point) => point.y));
    assert.ok(xSpan > 80, `homing trail should bend sideways after the upward launch, xSpan=${xSpan}`);
    assert.ok(ySpan > 120, `rocket trail should show the vertical launch path, ySpan=${ySpan}`);

    const smokeCountDuringFlight = state.effects.smokePuffs.length;
    assert.ok(smokeCountDuringFlight > 8, `world-managed smoke puffs should be emitted during flight, got ${smokeCountDuringFlight}`);
    state.projectiles[0].age = state.projectiles[0].lifetime;
    stepSimulation(state, createInputFrame(), FIXED_DT);
    assert.ok(state.effects.smokePuffs.length > smokeCountDuringFlight, "rocket impact should add smoke puffs instead of depending on a rendered explosion ring");
    stepMany(state, Math.ceil(state.tuning.rocketProjectileExplosionSeconds / FIXED_DT) + 2, () => createInputFrame());
    assert.equal(state.projectiles.length, 0, "rocket should be gone after explosion cleanup");
    assert.ok(state.effects.smokePuffs.length > 0, "world-managed smoke puffs should remain after the rocket is gone");
}


function testAttachedRocketSmokeAndVisualPower() {
    const state = createInitialGameState();
    settleOnGround(state);
    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    releaseJumpAfterTakeoff(state);
    stepMany(state, 7, () => createInputFrame({ jumpHeld: false }));

    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    const kickPower = state.equipment.rocket.boostVisualPowerNow;
    assert.ok(kickPower > state.tuning.attachedBoostSustainVisualPower, `kick puff power should be visually stronger than sustain, got ${kickPower}`);
    const smokeAfterKick = state.effects.smokePuffs.filter((puff) => puff.kind === "attachedRocketSmokePuff").length;
    assert.ok(smokeAfterKick >= 4, `attached boost kick should emit downward smoke puffs, got ${smokeAfterKick}`);

    stepMany(state, Math.ceil(state.tuning.attachedBoostBurstDuration / FIXED_DT) + 4, () => createInputFrame({ jumpHeld: true }));
    assert.ok(
        state.equipment.rocket.boostVisualPowerNow <= kickPower,
        `sustain puff power should settle below kick puff power, kick ${kickPower}, sustain ${state.equipment.rocket.boostVisualPowerNow}`
    );
    const attachedPuffs = state.effects.smokePuffs.filter((puff) => puff.kind === "attachedRocketSmokePuff");
    assert.ok(attachedPuffs.length > smokeAfterKick, "held sustain should keep adding attached boost smoke puffs");
    assert.ok(attachedPuffs.some((puff) => puff.vy > 70), "attached boost puffs should travel downward from the nozzle");
}


function targetImpactSpeedForExtraFallWh(state, extraWizardHeights) {
    const t = state.tuning;
    const safeImpactSpeed = t.fallDamageSafeImpactSpeed;
    return Math.sqrt(safeImpactSpeed * safeImpactSpeed + 2 * t.gravity * t.wizardHeight * extraWizardHeights);
}

function forceLandingAtImpactSpeed(state, impactSpeed) {
    state.player.x = state.world.start.x;
    state.player.y = 580;
    state.player.vy = impactSpeed - state.tuning.gravity * FIXED_DT;
    state.player.onGround = false;
    state.player.wasOnGround = false;
    state.player.airborneTime = 1;
    stepSimulation(state, createInputFrame(), FIXED_DT);
    assert.ok(state.player.onGround, "forced impact should land on the test floor");
}

function testFallDamageIgnoresNormalDoubleJumpHeight() {
    const state = createInitialGameState();
    settleOnGround(state);
    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    stepSimulation(state, createInputFrame({ jumpReleased: true, jumpHeld: false }), FIXED_DT);
    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    stepSimulation(state, createInputFrame({ jumpReleased: true, jumpHeld: false }), FIXED_DT);

    stepMany(state, 240, () => createInputFrame());
    assert.ok(state.player.onGround, "quick double-jump arc should land back on the floor");
    approx(state.health.amount, state.health.max, 0.001, "quick double-jump landing should be harmless");
    assert.ok(
        !state.debug.lastEvents.some((event) => event.type === "PLAYER_FALL_DAMAGE"),
        "harmless double-jump landing should not emit fall damage"
    );
}

function testFallDamageUsesExcessKineticEnergy() {
    const state = createInitialGameState();
    settleOnGround(state);
    const oneExtraWhImpact = targetImpactSpeedForExtraFallWh(state, 1);
    forceLandingAtImpactSpeed(state, oneExtraWhImpact);
    approx(state.health.amount, 90, 0.05, "one extra wizard-height impact should deal 10 HP");
    assert.ok(state.debug.lastEvents.some((event) => event.type === "PLAYER_FALL_DAMAGE"), "damaging landing should emit fall damage event");

    const terminal = createInitialGameState();
    settleOnGround(terminal);
    forceLandingAtImpactSpeed(terminal, terminal.tuning.terminalVelocity);
    approx(terminal.health.amount, 0, 0.001, "terminal-velocity impact should be lethal from full health");
}

function testFuelRechargeDelayGroundRequirementAndCap() {
    const state = createInitialGameState();
    settleOnGround(state);
    state.fuel.amount = 0;
    state.fuel.rechargeDelayTimer = state.tuning.rechargeDelayAfterUse;
    stepMany(state, 60, () => createInputFrame());
    approx(state.fuel.amount, 0, 0.001, "fuel should not recharge during delay");
    stepMany(state, 180, () => createInputFrame());
    assert.ok(state.fuel.amount > 40, `fuel should recharge quickly after the grounded delay, got ${state.fuel.amount}`);
    stepMany(state, 600, () => createInputFrame());
    approx(state.fuel.amount, state.fuel.rechargeCap, 0.001, "fuel should recharge only to cap");

    const airborne = createInitialGameState();
    airborne.player.y = -2000;
    airborne.player.vy = 0;
    airborne.player.onGround = false;
    airborne.fuel.amount = 0;
    airborne.fuel.rechargeDelayTimer = 0;
    airborne.equipment.rocket.boostKickCharge = 0;
    stepMany(airborne, 50, () => createInputFrame({ jumpHeld: false }));
    approx(airborne.fuel.amount, 0, 0.001, "fuel should not recharge while airborne");
    approx(airborne.equipment.rocket.boostKickCharge, 0, 0.001, "kick charge should not recharge while airborne");
}

function testPhase1013TuningDefaultsDebugPoseAndFuelBulbFlash() {
    assert.equal(DEFAULT_TUNING.attachedBoostStartImpulse, -700, "Phase 1.015 should bake in the current preferred boost kick");
    assert.equal(DEFAULT_TUNING.attachedBoostKickFuelCost, 10, "Phase 1.015 should make the double-jump kick cost 10 fuel");
    assert.equal(DEFAULT_TUNING.rechargeDelayAfterUse, 1, "Phase 1.015 should bake in the current recharge delay");
    assert.equal(DEFAULT_TUNING.rechargeRate, 52, "Phase 1.015 should bake in the current recharge rate");
    assert.equal(DEFAULT_TUNING.rocketLaunchCost, 30, "Phase 1.015 should bake in the current rocket launch cost");
    assert.equal(DEFAULT_TUNING.groundAcceleration, 950, "Phase 1.015 should bake in the softer ground acceleration");
    assert.equal(DEFAULT_TUNING.groundFriction, 900, "Phase 1.015 should bake in the softer ground friction");
    assert.equal(DEFAULT_TUNING.attachedBoostSmokePuffInterval, 0.035);
    assert.equal(DEFAULT_TUNING.attachedBoostSmokePuffDownSpeed, 700);
    assert.equal(DEFAULT_TUNING.rocketSmokePuffLifetime, 1.5);
    assert.equal(DEFAULT_TUNING.rocketSmokePuffSpacing, 3);
    assert.equal(DEFAULT_TUNING.rocketSmokePuffScale, 1.5);
    assert.equal(DEFAULT_TUNING.rocketImpactSmokePuffs, 24, "rocket impacts should use smoke puffs instead of a drawn explosion ring");
    assert.equal(DEFAULT_TUNING.terminalVelocity, 2500, "terminal velocity should allow very long falls to be lethal");
    assert.equal(DEFAULT_TUNING.fallDamageEnabled, true, "fall damage should be enabled by default");
    assert.equal(DEFAULT_TUNING.fallDamageSafeImpactSpeed, 1441, "normal quick double-jump landing should be harmless");
    assert.equal(DEFAULT_TUNING.fallDamagePerWizardHeight, 10, "fall damage should scale as 10 HP per excess wizard-height");
    assert.equal(DEFAULT_TUNING.rocketFuelBulbScale, 2.4);
    assert.equal(DEFAULT_TUNING.rocketFuelBulbEnabled, true, "rocket fuel bulb should be enabled by default");
    assert.equal(DEFAULT_TUNING.poseBlendSpeed, 14, "pose transitions should blend by default");

    const defaults = createInitialGameState();
    assert.equal(defaults.debug.showHitboxes, false, "hitboxes should be hidden by default");
    assert.equal(defaults.debug.showVelocity, false, "velocity vector should be hidden by default");

    const state = createInitialGameState();
    settleOnGround(state);
    state.equipment.rocket.boostKickCharge = 0;
    state.fuel.rechargeDelayTimer = 0;
    stepSimulation(state, createInputFrame(), FIXED_DT);
    assert.ok(state.equipment.rocket.boostKickCharge > 0.99, "grounded recharge should refill the kick charge");
    assert.ok(state.equipment.rocket.fuelBulbFlashTimer > 0, "kick recharge should trigger a short bulb flash for the renderer");
}

function testFuelRechargeLatchAfterGroundedStart() {
    const state = createInitialGameState();
    settleOnGround(state);
    state.fuel.amount = 40;
    state.fuel.rechargeDelayTimer = 0;
    state.fuel.rechargeLatched = false;

    stepSimulation(state, createInputFrame(), FIXED_DT);
    assert.equal(state.fuel.rechargeLatched, true, "grounded recharge should latch once it starts");
    assert.ok(state.fuel.amount > 40, `fuel should begin recharging on the ground, got ${state.fuel.amount}`);

    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    assert.equal(state.player.onGround, false, "normal jump should leave the ground");
    const airborneFuel = state.fuel.amount;
    stepMany(state, 12, () => createInputFrame());
    assert.ok(state.fuel.amount > airborneFuel, `latched recharge should continue in the air until the rocket is used, before ${airborneFuel}, after ${state.fuel.amount}`);

    state.fuel.amount = 100;
    stepSimulation(state, createInputFrame({ weaponPressed: true, weaponHeld: true }), FIXED_DT);
    assert.equal(state.fuel.rechargeLatched, false, "firing the rocket should clear the recharge latch");
}


function testSingleJumpPressIsNotReusedAcrossCatchupSubsteps() {
    const state = createInitialGameState();
    settleOnGround(state);

    const browserFrameInput = createInputFrame({ jumpPressed: true, jumpHeld: true });
    stepSimulation(state, createSubstepInputFrame(browserFrameInput, 0), FIXED_DT);
    assert.equal(state.player.onGround, false, "first catch-up substep should perform the ground jump");
    const afterJumpVy = state.player.vy;

    stepSimulation(state, createSubstepInputFrame(browserFrameInput, 1), FIXED_DT);
    assert.equal(state.equipment.rocket.attachedBoosting, false, "same physical key press must not become a boost on the second catch-up substep");
    assert.ok(state.player.vy > afterJumpVy, "second catch-up substep should only apply normal gravity while Up is held");
    assert.ok(
        !state.debug.lastEvents.some((event) => event.type === "PLAYER_BOOST_STARTED"),
        "holding the original jump press during catch-up should not log a boost start"
    );

    stepSimulation(state, createInputFrame({ jumpReleased: true, jumpHeld: false }), FIXED_DT);
    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    assert.equal(state.equipment.rocket.attachedBoosting, true, "a later distinct airborne jump press should still start the boost");
}

function testAirBoostRequiresReleaseAfterGroundJump() {
    const state = createInitialGameState();
    settleOnGround(state);

    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    assert.equal(state.player.airBoostArmed, false, "ground jump should disarm air boost until jump is released");

    stepMany(state, 12, () => createInputFrame({ jumpHeld: true }));
    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    assert.equal(state.equipment.rocket.attachedBoosting, false, "held or repeated jump input should not start boost before release");
    assert.ok(state.debug.lastEvents.some((event) => event.type === "PLAYER_BOOST_BLOCKED" && event.reason === "jumpNotReleased"), "blocked boost should explain that jump was not released");

    stepSimulation(state, createInputFrame({ jumpReleased: true, jumpHeld: false }), FIXED_DT);
    assert.equal(state.player.airBoostArmed, true, "airborne jump release should arm the air boost");
    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    assert.equal(state.equipment.rocket.attachedBoosting, true, "pressing jump again after release should start boost");
}

function testWallCollision() {
    const state = createInitialGameState();
    state.player.x = -245;
    state.player.y = 600;
    state.player.onGround = true;
    stepMany(state, 30, () => createInputFrame({ moveLeft: true }));
    assert.ok(state.player.x >= -243, `left wall should stop player, got x=${state.player.x}`);
    assert.equal(state.player.vx, 0, "wall collision should zero horizontal velocity");
}


function testClosedAtlasLoopCreatesCollisionArea() {
    const state = createInitialGameState();
    state.world.visuals = [{
        id: "test_loop_visual",
        kind: "atlasSprite",
        atlasId: "test_atlas",
        assetId: "test_square",
        frame: "test_square",
        x: 310,
        y: 496,
        w: 100,
        h: 104,
        collisionFromManifest: true
    }];
    state.world.solids = [];
    const manifest = {
        atlasId: "test_atlas",
        frames: {
            test_square: { x: 0, y: 0, w: 100, h: 100 }
        },
        objects: {
            test_square: {
                id: "test_square",
                frame: "test_square",
                nodes: [
                    { id: "a", x: 0, y: 0 },
                    { id: "b", x: 100, y: 0 },
                    { id: "c", x: 100, y: 100 },
                    { id: "d", x: 0, y: 100 }
                ],
                lines: [
                    { id: "l1", kind: "blockable", from: "a", to: "b" },
                    { id: "l2", kind: "blockable", from: "b", to: "c" },
                    { id: "l3", kind: "blockable", from: "c", to: "d" },
                    { id: "l4", kind: "blockable", from: "d", to: "a" }
                ]
            }
        }
    };

    assert.equal(applyAtlasManifestsToWorld(state, new Map([["test_atlas", { manifest }]])), true, "atlas collision should apply");
    assert.equal(state.world.collisionPolygons.length, 1, "closed blockable loop should become a collision area");
    state.world.solids.push({ id: "test_floor", kind: "floor", x: -1000, y: 600, w: 4000, h: 60 });
    state.player.x = 240;
    state.player.y = 600;
    state.player.vx = 360;
    state.player.vy = 0;
    state.player.onGround = true;
    stepMany(state, 80, () => createInputFrame({ moveRight: true }));
    assert.ok(state.player.x <= 294, `closed blockable area should stop the player before entry, got x=${state.player.x}`);
    assert.ok(!state.world.collisionPolygons.some((polygon) => polygon.points.length < 3), "collision areas should be valid polygons");
}

function testRocketImpactsAtlasCollisionLinesAndAreas() {
    const lineState = createInitialGameState();
    lineState.targets = [];
    lineState.world.solids = [];
    lineState.world.segments = [{
        id: "test_blockable_line",
        kind: "blockable",
        x1: 100,
        y1: 20,
        x2: 100,
        y2: 120
    }];
    lineState.world.collisionPolygons = [];
    lineState.projectiles.push({
        id: "rocket_line_test",
        kind: "homingRocket",
        state: "launched",
        x: 80,
        y: 70,
        vx: 720,
        vy: 0,
        targetId: null,
        upLaunchTimer: 999,
        age: 0,
        lifetime: 2,
        explosionTimer: 0,
        radius: 8,
        trail: []
    });
    stepSimulation(lineState, createInputFrame(), FIXED_DT);
    assert.equal(lineState.projectiles[0].state, "exploding", "rocket should explode on a blockable atlas line");
    assert.equal(lineState.debug.lastEvents.at(-1).type, "ROCKET_IMPACTED", "line impact should emit rocket impact event");
    assert.equal(lineState.debug.lastEvents.at(-1).reason, "test_blockable_line", "impact event should identify the collision line");

    const areaState = createInitialGameState();
    areaState.targets = [];
    areaState.world.solids = [];
    areaState.world.segments = [];
    areaState.world.collisionPolygons = [{
        id: "test_blockable_area",
        kind: "blockable",
        points: [
            { x: 120, y: 40 },
            { x: 160, y: 40 },
            { x: 160, y: 90 },
            { x: 120, y: 90 }
        ]
    }];
    areaState.projectiles.push({
        id: "rocket_area_test",
        kind: "homingRocket",
        state: "launched",
        x: 90,
        y: 65,
        vx: 2400,
        vy: 0,
        targetId: null,
        upLaunchTimer: 999,
        age: 0,
        lifetime: 2,
        explosionTimer: 0,
        radius: 4,
        trail: []
    });
    stepSimulation(areaState, createInputFrame(), FIXED_DT);
    assert.equal(areaState.projectiles[0].state, "exploding", "rocket should explode on a closed blockable collision area");
    assert.equal(areaState.debug.lastEvents.at(-1).type, "ROCKET_IMPACTED", "area impact should emit rocket impact event");
    assert.equal(areaState.debug.lastEvents.at(-1).reason, "test_blockable_area", "impact event should identify the collision area");
}


function testRocketLaunchDoesNotFalseHitUnrelatedAtlasArea() {
    const level = JSON.parse(readFileSync("./assets/level_001.json", "utf8"));
    const atlas = JSON.parse(readFileSync("./assets/at_atlas_001.json", "utf8"));
    const state = createInitialGameState();
    assert.equal(applyEditorLevelToWorld(state, level), true, "level_001 should apply");
    assert.equal(applyAtlasManifestsToWorld(state, new Map([["at_atlas_001", { manifest: atlas }]])), true, "at_atlas_001 collision should apply");

    stepMany(state, 180, () => createInputFrame());
    assert.ok(state.player.onGround, "player should settle before firing");
    const launchFrame = createInputFrame({ weaponPressed: true, weaponHeld: true });
    stepSimulation(state, launchFrame, FIXED_DT);

    assert.equal(state.projectiles.length, 1, "rocket should exist after launch");
    assert.equal(state.projectiles[0].state, "launched", "rocket should not instantly explode from an unrelated collision area");
    assert.ok(!state.debug.lastEvents.some((event) => event.type === "ROCKET_IMPACTED"), "rocket should not report an immediate terrain impact at launch");
}

function testReset() {
    const state = createInitialGameState();
    state.player.x = 999;
    state.player.y = 999;
    state.player.vx = 120;
    state.player.vy = 400;
    resetPlayer(state, "test");
    assert.equal(state.player.x, state.player.spawnX, "reset x");
    assert.equal(state.player.y, state.player.spawnY, "reset y");
    assert.equal(state.player.vx, 0, "reset vx");
    assert.equal(state.player.vy, 0, "reset vy");
}


function testAttachedSmokeDownSpeedTuning() {
    const state = createInitialGameState({
        tuning: {
            attachedBoostSmokePuffDownSpeed: 260,
            attachedBoostSmokePuffSideSpeed: 20,
            attachedBoostSmokePuffSpeedJitter: 0
        }
    });
    settleOnGround(state);
    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    releaseJumpAfterTakeoff(state);
    stepMany(state, 3, () => createInputFrame({ jumpHeld: false }));
    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    const attachedPuffs = state.effects.smokePuffs.filter((puff) => puff.kind === "attachedRocketSmokePuff");
    assert.ok(attachedPuffs.length >= 4, "expected attached boost smoke puffs");
    const maxVy = Math.max(...attachedPuffs.map((puff) => puff.vy));
    assert.ok(maxVy >= 210, `expected smoke down speed tuning to affect vy, got ${maxVy}`);
}

const tests = [
    ["responsive viewport scaling", testResponsiveViewportScaling],
    ["state serialization and cloning", testStateSerialization],
    ["headless stepping and floor collision", testHeadlessSteppingAndFloorCollision],
    ["left/right movement symmetry", testLeftRightSymmetry],
    ["jump transition", testJumpTransition],
    ["attached boost and fuel drain", testAttachedBoostStateAndFuelDrain],
    ["double-jump kick and hover governor", testDoubleJumpKickAndHoverGovernor],
    ["boost kick cannot be tap exploited", testBoostKickCannotBeTapExploited],
    ["boost kick costs fuel and recharges on landing", testBoostKickCostsFuelAndRechargesOnLanding],
    ["homing rocket launch", testHomingRocketLaunch],
    ["rocket trail tracks curved path and persists", testRocketTrailTracksCurvedPathAndPersistsAfterExplosion],
    ["attached boost smoke and visual power", testAttachedRocketSmokeAndVisualPower],
    ["attached smoke down speed tuning", testAttachedSmokeDownSpeedTuning],
    ["fall damage ignores normal double-jump height", testFallDamageIgnoresNormalDoubleJumpHeight],
    ["fall damage uses excess kinetic energy", testFallDamageUsesExcessKineticEnergy],
    ["fuel recharge delay, ground requirement and cap", testFuelRechargeDelayGroundRequirementAndCap],
    ["fuel recharge latch after grounded start", testFuelRechargeLatchAfterGroundedStart],
    ["Phase 1.015 tuning defaults, debug pose blending and fuel bulb flash", testPhase1013TuningDefaultsDebugPoseAndFuelBulbFlash],
    ["single jump press is not reused across catch-up substeps", testSingleJumpPressIsNotReusedAcrossCatchupSubsteps],
    ["air boost requires release after ground jump", testAirBoostRequiresReleaseAfterGroundJump],
    ["wall collision", testWallCollision],
    ["closed atlas loop creates collision area", testClosedAtlasLoopCreatesCollisionArea],
    ["rocket impacts atlas collision lines and areas", testRocketImpactsAtlasCollisionLinesAndAreas],
    ["rocket launch ignores unrelated atlas areas", testRocketLaunchDoesNotFalseHitUnrelatedAtlasArea],
    ["manual reset", testReset]
];

for (const [name, fn] of tests) {
    fn();
    console.log(`PASS ${name}`);
}

console.log("PASS IgnatiusRocketfrock Phase 1 headless tests");
