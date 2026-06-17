export const FIXED_DT = 1 / 60;

export const DEFAULT_TUNING = Object.freeze({
    timestep: FIXED_DT,
    wizardHeight: 104,
    playerWidth: 34,
    playerHeight: 104,
    gravity: 1490,
    terminalVelocity: 1500,
    jumpVelocity: -775,
    maxRunSpeed: 360,
    groundAcceleration: 950,
    airAcceleration: 820,
    groundFriction: 900,
    landingFriction: 550,
    airDrag: 0.12,
    attachedBoostAcceleration: -1580,
    attachedBoostStartImpulse: -700,
    attachedBoostKickFuelCost: 10,
    attachedBoostStartMaxDownwardVelocity: 120,
    attachedBoostInitialAcceleration: -3050,
    attachedBoostSustainAcceleration: -1500,
    attachedBoostBurstDuration: 0.5,
    attachedBoostHoverFallSpeed: 36,
    attachedBoostHoverBrakeAcceleration: 3600,
    attachedBoostVisualIdlePower: 0.32,
    attachedBoostKickVisualPower: 1.08,
    attachedBoostSustainVisualPower: 0.36,
    attachedBoostSmokeKickPuffs: 7,
    attachedBoostSmokePuffInterval: 0.035,
    attachedBoostSmokePuffDownSpeed: 700,
    attachedBoostSmokePuffSideSpeed: 42,
    attachedBoostSmokePuffSpeedJitter: 36,
    attachedBoostKickChargeMax: 1,
    attachedBoostKickChargeRechargeRate: 999,
    attachedBoostKickRechargeInstant: true,
    attachedBoostAllowSustainWithoutKickCharge: true,
    attachedBoostMinFuelScale: 0.68,
    attachedBoostFuelPowerCurve: 0.55,
    fuelMax: 100,
    initialFuel: 100,
    baseRechargeCap: 100,
    fuelRechargeRequiresGround: true,
    rechargeDelayAfterUse: 1,
    rechargeRate: 52,
    attachedBoostDrainRate: 40,
    rocketLaunchCost: 30,
    rocketLaunchCooldown: 0.35,
    rocketProjectileSpeed: 520,
    rocketProjectileUpLaunchSeconds: 0.32,
    rocketProjectileHomingStrength: 3.2,
    rocketProjectileLifetime: 4.6,
    rocketProjectileExplosionSeconds: 0.42,
    rocketProjectileImpactRadius: 24,
    rocketImpactSmokePuffs: 24,
    rocketSmokePuffLifetime: 1.5,
    rocketSmokePuffSpacing: 3,
    rocketSmokeMaxPuffs: 260,
    rocketSmokePuffScale: 1.5,
    rocketFuelBulbEnabled: true,
    rocketFuelBulbLowThreshold: 25,
    rocketFuelBulbMediumThreshold: 60,
    rocketFuelBulbPulseWhenRecharging: true,
    rocketFuelBulbFlashOnKickRecharge: true,
    rocketFuelBulbScale: 2.4,
    poseBlendSpeed: 14,
    maxHealth: 100,
    lowHealthThreshold: 34,
    healthRegenDelay: 5,
    healthRegenRate: 4,
    maxDebugEvents: 14
});

export function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

export function createInputFrame(overrides = {}) {
    return {
        moveLeft: false,
        moveRight: false,
        jumpPressed: false,
        jumpHeld: false,
        jumpReleased: false,
        weaponPressed: false,
        weaponHeld: false,
        weaponReleased: false,
        aimVector: { x: 1, y: 0 },
        aimTarget: null,
        pausePressed: false,
        stepPressed: false,
        resetPressed: false,
        toggleHitboxesPressed: false,
        toggleVelocityPressed: false,
        toggleCollisionPressed: false,
        exportStatePressed: false,
        toggleInputConsoleLogPressed: false,
        toggleDebugPanelPressed: false,
        ...overrides
    };
}

export function createSubstepInputFrame(inputFrame, substepIndex = 0) {
    const input = createInputFrame(inputFrame || {});
    if (substepIndex <= 0) {
        return input;
    }

    // Held states continue across catch-up sim steps, but edge-triggered presses/releases
    // must only be consumed by the first fixed step for a browser frame. Otherwise a slow
    // render frame can turn one physical Up press into jump on substep 0 and boost on substep 1.
    return createInputFrame({
        moveLeft: input.moveLeft,
        moveRight: input.moveRight,
        jumpHeld: input.jumpHeld,
        weaponHeld: input.weaponHeld,
        aimVector: input.aimVector,
        aimTarget: input.aimTarget
    });
}

export function createInitialGameState(overrides = {}) {
    const tuning = deepClone(DEFAULT_TUNING);
    if (overrides.tuning) {
        Object.assign(tuning, overrides.tuning);
    }

    const world = createPhaseOneArena(tuning);
    const spawn = overrides.spawn || { x: 120, y: 600 };

    const state = {
        meta: {
            schemaVersion: 1,
            build: "theme-a-002-arena-and-atlas-tool",
            note: "Gameplay state only. Browser, canvas, image and renderer resources are deliberately outside gameState."
        },
        clock: {
            tick: 0,
            time: 0,
            fixedDt: tuning.timestep
        },
        tuning,
        world,
        camera: {
            x: spawn.x,
            y: spawn.y - 170,
            zoom: 1,
            mode: "follow"
        },
        player: {
            id: "ignatius",
            x: spawn.x,
            y: spawn.y,
            spawnX: spawn.x,
            spawnY: spawn.y,
            vx: 0,
            vy: 0,
            ax: 0,
            ay: 0,
            width: tuning.playerWidth,
            height: tuning.playerHeight,
            facing: 1,
            onGround: false,
            wasOnGround: false,
            airborneTime: 0,
            coyoteTimer: 0,
            airBoostArmed: false,
            lowHealthPulse: 0
        },
        fuel: {
            amount: tuning.initialFuel,
            max: tuning.fuelMax,
            rechargeCap: tuning.baseRechargeCap,
            rechargeDelayTimer: 0,
            rechargeLatched: false,
            lastUsedAt: null
        },
        health: {
            amount: tuning.maxHealth,
            max: tuning.maxHealth,
            lastDamagedAt: null,
            low: false
        },
        equipment: {
            mounted: "rocket",
            rocket: {
                state: "mountedReady",
                attachedBoosting: false,
                attachedBoostTime: 0,
                boostKickCharge: tuning.attachedBoostKickChargeMax,
                boostBurstTimer: 0,
                boostAccelerationNow: 0,
                boostVisualPowerNow: 0,
                attachedSmokeTimer: 0,
                lastBoostStartTick: null,
                lastBoostEndTick: null,
                fuelBulbFlashTimer: 0
            },
            weaponInputVisibleOnly: false
        },
        hat: {
            state: "worn",
            x: spawn.x,
            y: spawn.y - tuning.playerHeight,
            vx: 0,
            vy: 0
        },
        weapons: {
            current: "rocket",
            launchCooldownTimer: 0,
            nextProjectileId: 1,
            launchedThisPhase: false
        },
        projectiles: [],
        effects: {
            nextPuffId: 1,
            smokePuffs: []
        },
        targets: [
            { id: "homing_dot", kind: "debugHomingDot", x: 890, y: 410, radius: 15, state: "active" }
        ],
        enemies: [
            { id: "dummy_001", kind: "targetDummy", x: 1030, y: 560, width: 42, height: 80, health: 100, state: "idle" },
            { id: "dummy_002", kind: "targetDummy", x: 2080, y: 330, width: 42, height: 80, health: 100, state: "idle" }
        ],
        pickups: [
            { id: "fuel_001", kind: "fuel", x: 735, y: 300, radius: 14, amount: 40, collected: false },
            { id: "fuel_002", kind: "fuel", x: 1840, y: 120, radius: 14, amount: 40, collected: false }
        ],
        collisions: {
            playerTouching: { left: false, right: false, up: false, down: false },
            lastResolution: null
        },
        story: {
            levelTitle: "Ignatius Rocketfrock and the Courtyard of Dubiously Stable Masonry"
        },
        debug: {
            paused: false,
            showHitboxes: false,
            showVelocity: false,
            showCollision: false,
            showInput: true,
            eventFilterText: "-FUEL_CHANGED",
            eventFilterIncludeInput: false,
            inputConsoleLogging: false,
            lastEvents: [],
            lastInputFrame: createInputFrame(),
            exportedAt: null
        }
    };

    addEvent(state, "ARENA_CREATED", { solids: state.world.solids.length });
    return state;
}

function createPhaseOneArena(tuning) {
    const wh = tuning.wizardHeight;
    const solids = [];
    const visuals = [];

    const addIsland = (options) => {
        visuals.push({
            id: `${options.id}_art`,
            kind: "atlasSprite",
            atlasId: options.atlasId || "themeA1",
            frame: options.frame,
            x: options.visual.x,
            y: options.visual.y,
            w: options.visual.w,
            h: options.visual.h,
            mirrorX: Boolean(options.mirrorX),
            layer: options.layer || "terrain"
        });

        if (options.solid) {
            solids.push({
                id: options.id,
                kind: options.kind || "platform",
                x: options.solid.x,
                y: options.solid.y,
                w: options.solid.w,
                h: options.solid.h,
                visualId: `${options.id}_art`
            });
        }
    };

    solids.push(
        { id: "left_wall", kind: "wall", x: -320, y: -360, w: 60, h: 1320 },
        { id: "right_wall", kind: "wall", x: 3940, y: -360, w: 60, h: 1320 }
    );

    // New arena layout: a compact cavern courtyard made from whole atlas islands,
    // not an attempt to force the art into the older abstract calibration arrangement.
    addIsland({
        id: "start_courtyard",
        kind: "floor",
        frame: "floor_big_moss",
        visual: { x: -150, y: 445, w: 650, h: 318 },
        solid: { x: -120, y: 600, w: 560, h: 92 }
    });
    addIsland({
        id: "central_terrace",
        kind: "floor",
        frame: "floor_long_terrace",
        visual: { x: 520, y: 480, w: 1100, h: 238 },
        solid: { x: 560, y: 600, w: 980, h: 92 }
    });
    addIsland({
        id: "east_courtyard",
        kind: "floor",
        frame: "floor_mossy_low",
        visual: { x: 1730, y: 502, w: 810, h: 208 },
        solid: { x: 1770, y: 600, w: 730, h: 90 }
    });
    addIsland({
        id: "far_right_perch",
        kind: "floor",
        frame: "floor_hanging_right",
        visual: { x: 2810, y: 448, w: 720, h: 254 },
        solid: { x: 2860, y: 600, w: 620, h: 90 }
    });

    // Left-to-middle stepping route.
    addIsland({
        id: "left_step_one",
        kind: "platform",
        frame: "ledge_left_chunk",
        visual: { x: 285, y: 382, w: 225, h: 145 },
        solid: { x: 298, y: 600 - wh, w: 184, h: 26 }
    });
    addIsland({
        id: "left_step_two",
        kind: "platform",
        frame: "ledge_flat_long_a",
        visual: { x: 560, y: 373, w: 340, h: 103 },
        solid: { x: 585, y: 600 - wh - 6, w: 285, h: 28 }
    });
    addIsland({
        id: "central_upper_platform",
        kind: "platform",
        frame: "ledge_flat_long_b",
        visual: { x: 960, y: 300, w: 395, h: 104 },
        solid: { x: 995, y: 600 - wh * 2, w: 330, h: 30 }
    });
    addIsland({
        id: "crystal_roof_platform",
        kind: "platform",
        frame: "ledge_blue_crystals",
        visual: { x: 1350, y: 188, w: 430, h: 120 },
        solid: { x: 1386, y: 600 - wh * 3, w: 352, h: 30 }
    });

    // Central ruins and alternate upper route.
    addIsland({
        id: "hanging_walkway",
        kind: "platform",
        frame: "hanging_ledge",
        visual: { x: 1955, y: 232, w: 290, h: 198 },
        solid: { x: 2000, y: 330, w: 210, h: 28 }
    });
    addIsland({
        id: "cold_gallery",
        kind: "platform",
        frame: "floor_cold_platform",
        visual: { x: 2265, y: 286, w: 470, h: 118 },
        solid: { x: 2295, y: 342, w: 412, h: 30 }
    });
    addIsland({
        id: "mossy_balcony",
        kind: "platform",
        frame: "ledge_mossy_right",
        visual: { x: 2940, y: 254, w: 520, h: 186 },
        solid: { x: 2978, y: 376, w: 445, h: 32 }
    });

    // Right-side boost practice pocket.
    addIsland({
        id: "shaft_left_art",
        frame: "pillar_plain",
        visual: { x: 2475, y: 260, w: 145, h: 228 },
        solid: null,
        layer: "decorBack"
    });
    addIsland({
        id: "shaft_right_art",
        frame: "pillar_broken",
        visual: { x: 2705, y: 235, w: 140, h: 250 },
        solid: null,
        layer: "decorBack"
    });
    solids.push(
        { id: "boost_pocket_left", kind: "shaftWall", x: 2558, y: 180, w: 34, h: 430 },
        { id: "boost_pocket_right", kind: "shaftWall", x: 2776, y: 180, w: 34, h: 430 }
    );
    addIsland({
        id: "boost_pocket_low",
        kind: "platform",
        frame: "ledge_small_flat",
        visual: { x: 2595, y: 430, w: 165, h: 61 },
        solid: { x: 2616, y: 466, w: 126, h: 22 }
    });
    addIsland({
        id: "boost_pocket_mid",
        kind: "platform",
        frame: "ledge_small_round",
        visual: { x: 2592, y: 327, w: 205, h: 72 },
        solid: { x: 2610, y: 366, w: 148, h: 24 }
    });
    addIsland({
        id: "boost_pocket_top",
        kind: "platform",
        frame: "ledge_purple_crystals",
        visual: { x: 2540, y: 180, w: 290, h: 124 },
        solid: { x: 2576, y: 245, w: 220, h: 26 }
    });

    // Additional small route pieces.
    addIsland({
        id: "mid_small_round",
        kind: "platform",
        frame: "ledge_small_round",
        visual: { x: 1640, y: 350, w: 185, h: 64 },
        solid: { x: 1656, y: 384, w: 138, h: 24 }
    });
    addIsland({
        id: "mid_small_flat",
        kind: "platform",
        frame: "ledge_small_flat",
        visual: { x: 1495, y: 430, w: 155, h: 56 },
        solid: { x: 1514, y: 462, w: 122, h: 22 }
    });

    visuals.push(
        { id: "decor_arch_back", kind: "atlasSprite", atlasId: "themeA1", frame: "arch_ruin", x: 820, y: 372, w: 470, h: 238, layer: "decorBack", mirrorX: false },
        { id: "decor_pillar_round", kind: "atlasSprite", atlasId: "themeA1", frame: "pillar_round", x: 720, y: 365, w: 135, h: 223, layer: "decorFront" },
        { id: "decor_pillar_cap", kind: "atlasSprite", atlasId: "themeA1", frame: "pillar_plain", x: 1395, y: 365, w: 132, h: 223, layer: "decorFront" },
        { id: "decor_stairs_right", kind: "atlasSprite", atlasId: "themeA1", frame: "ruin_stairs", x: 3350, y: 500, w: 170, h: 120, layer: "decorFront" },
        { id: "decor_barrier", kind: "atlasSprite", atlasId: "themeA1", frame: "wood_barrier_low", x: 2060, y: 540, w: 164, h: 74, layer: "decorFront" },
        { id: "decor_spikes", kind: "atlasSprite", atlasId: "themeA1", frame: "wood_spikes_low", x: 943, y: 540, w: 190, h: 68, layer: "decorFront" },
        { id: "decor_lantern_a", kind: "atlasSprite", atlasId: "themeA1", frame: "lantern_gold_small", x: 1550, y: 300, w: 40, h: 82, layer: "decorFront" },
        { id: "decor_lantern_b", kind: "atlasSprite", atlasId: "themeA1", frame: "lantern_silver_tall", x: 2425, y: 246, w: 38, h: 90, layer: "decorFront" },
        { id: "decor_skulls", kind: "atlasSprite", atlasId: "themeA1", frame: "skull_pile_small", x: 3080, y: 540, w: 110, h: 62, layer: "decorFront" }
    );

    return {
        levelId: "theme_a_test_arena_rebuilt",
        themeId: "themeA",
        gravityDirection: { x: 0, y: 1 },
        bounds: { x: -320, y: -420, w: 4300, h: 1360 },
        resetY: 1020,
        start: { x: 120, y: 600 },
        atlasManifests: ["assets/theme_A_atlas_1_manifest.json"],
        visuals,
        solids,
        labels: [
            { text: "start courtyard", x: 90, y: 565 },
            { text: "upper route", x: 1060, y: 250 },
            { text: "ruin gallery", x: 2220, y: 310 },
            { text: "boost pocket", x: 2584, y: 160 },
            { text: "wide run-up", x: 620, y: 565 },
            { text: "homing dot", x: 1060, y: 196 }
        ]
    };
}

export function cloneGameState(state) {
    return deepClone(state);
}

export function serializeGameState(state) {
    return JSON.stringify(state);
}

export function restoreGameState(serialized) {
    return JSON.parse(serialized);
}

export function addEvent(state, type, detail = {}) {
    const event = {
        tick: state.clock.tick,
        time: Number(state.clock.time.toFixed(4)),
        type,
        ...deepClone(detail)
    };
    state.debug.lastEvents.push(event);
    while (state.debug.lastEvents.length > state.tuning.maxDebugEvents) {
        state.debug.lastEvents.shift();
    }
    return event;
}

export function getPlayerRect(state) {
    const p = state.player;
    return {
        x: p.x - p.width / 2,
        y: p.y - p.height,
        w: p.width,
        h: p.height
    };
}

function rectsOverlap(a, b) {
    return a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y;
}

function approach(value, target, amount) {
    if (value < target) {
        return Math.min(value + amount, target);
    }
    if (value > target) {
        return Math.max(value - amount, target);
    }
    return target;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function sanitizeInput(inputFrame) {
    return createInputFrame(inputFrame || {});
}

export function stepSimulation(state, inputFrame = createInputFrame(), dt = state.clock.fixedDt || FIXED_DT) {
    const input = sanitizeInput(inputFrame);
    const p = state.player;
    const t = state.tuning;
    const fuel = state.fuel;
    const rocket = state.equipment.rocket;

    rocket.fuelBulbFlashTimer = Math.max(0, (rocket.fuelBulbFlashTimer ?? 0) - dt);

    state.clock.tick += 1;
    state.clock.time += dt;
    state.debug.lastInputFrame = deepClone(input);
    state.collisions.playerTouching = { left: false, right: false, up: false, down: false };
    state.collisions.lastResolution = null;

    const wasOnGround = p.onGround;
    p.wasOnGround = wasOnGround;
    p.ax = 0;
    p.ay = t.gravity;

    const moveAxis = (input.moveRight ? 1 : 0) - (input.moveLeft ? 1 : 0);
    if (moveAxis !== 0) {
        p.facing = moveAxis > 0 ? 1 : -1;
        const accel = wasOnGround ? t.groundAcceleration : t.airAcceleration;
        p.vx += moveAxis * accel * dt;
        p.ax = moveAxis * accel;
    } else if (wasOnGround) {
        p.vx = approach(p.vx, 0, t.groundFriction * dt);
    } else {
        p.vx *= Math.max(0, 1 - t.airDrag * dt);
    }

    p.vx = clamp(p.vx, -t.maxRunSpeed, t.maxRunSpeed);

    if (input.jumpReleased && !wasOnGround) {
        p.airBoostArmed = true;
    }

    if (input.jumpPressed && wasOnGround) {
        p.vy = t.jumpVelocity;
        p.onGround = false;
        p.airborneTime = 0;
        p.airBoostArmed = false;
        addEvent(state, "PLAYER_JUMPED", { x: round(p.x), y: round(p.y), vx: round(p.vx), vy: round(p.vy) });
    } else if (input.jumpPressed && !wasOnGround && !rocket.attachedBoosting) {
        if (p.airBoostArmed) {
            p.airBoostArmed = false;
            startAttachedBoost(state);
        } else {
            addEvent(state, "PLAYER_BOOST_BLOCKED", { reason: "jumpNotReleased" });
        }
    }

    if (rocket.attachedBoosting) {
        const shouldStop = input.jumpReleased || !input.jumpHeld || fuel.amount <= 0;
        if (shouldStop) {
            stopAttachedBoost(state, fuel.amount <= 0 ? "fuelEmpty" : "jumpReleased");
        } else {
            rocket.attachedBoostTime += dt;
            rocket.boostBurstTimer = Math.max(0, rocket.boostBurstTimer - dt);
            rocket.boostAccelerationNow = 0;
            rocket.boostVisualPowerNow = attachedBoostVisualPower(state);
            emitAttachedBoostSmoke(state, dt);
            const used = Math.min(fuel.amount, t.attachedBoostDrainRate * dt);
            fuel.amount = clamp(fuel.amount - used, 0, fuel.max);
            markRocketUse(state);
            if (fuel.amount <= 0) {
                stopAttachedBoost(state, "fuelEmpty");
            }
        }
    } else {
        rocket.boostAccelerationNow = 0;
        rocket.boostVisualPowerNow = 0;
    }

    if (input.weaponPressed) {
        launchHomingRocket(state, input);
    }
    updateProjectiles(state, dt);
    updateWorldEffects(state, dt);

    p.vy += t.gravity * dt;
    p.vy = Math.min(p.vy, t.terminalVelocity);
    applyAttachedHoverGovernor(state, dt);

    moveAndCollideX(state, p.vx * dt);
    moveAndCollideY(state, p.vy * dt, wasOnGround);

    if (!p.onGround) {
        p.airborneTime += dt;
    } else {
        p.airborneTime = 0;
    }

    if (p.y > state.world.resetY) {
        resetPlayer(state, "fellOutOfArena");
    }

    updateFuelRecharge(state, dt);
    updateHealth(state, dt);
    updateHat(state);
    updateCameraHint(state, dt);

    return state;
}

function markRocketUse(state) {
    state.fuel.lastUsedAt = state.clock.time;
    state.fuel.rechargeDelayTimer = state.tuning.rechargeDelayAfterUse;
    state.fuel.rechargeLatched = false;
}

function startAttachedBoost(state) {
    const rocket = state.equipment.rocket;
    const p = state.player;
    const t = state.tuning;
    const kickMax = t.attachedBoostKickChargeMax ?? 1;
    const kickCharge = clamp(rocket.boostKickCharge ?? kickMax, 0, kickMax);
    const kickFuelCost = Math.max(0, t.attachedBoostKickFuelCost ?? 10);
    const hasKickCharge = kickCharge > 0.001 && state.fuel.amount >= kickFuelCost;
    const canSustainWithoutKick = t.attachedBoostAllowSustainWithoutKickCharge !== false && state.fuel.amount > 0;

    if (!hasKickCharge && !canSustainWithoutKick) {
        addEvent(state, "PLAYER_BOOST_BLOCKED", {
            reason: state.fuel.amount < kickFuelCost ? "kickFuel" : "kickCharge",
            fuel: round(state.fuel.amount),
            kickFuelCost: round(kickFuelCost),
            kickCharge: round(kickCharge)
        });
        return false;
    }

    rocket.attachedBoosting = true;
    rocket.state = "attachedBoosting";
    rocket.attachedBoostTime = 0;
    rocket.boostBurstTimer = hasKickCharge ? Math.max(0, t.attachedBoostBurstDuration ?? 0.5) : 0;
    if (hasKickCharge) {
        rocket.boostKickCharge = 0;
        state.fuel.amount = clamp(state.fuel.amount - kickFuelCost, 0, state.fuel.max);
    }
    rocket.boostAccelerationNow = 0;
    rocket.boostVisualPowerNow = attachedBoostVisualPower(state);
    rocket.attachedSmokeTimer = 0;
    rocket.lastBoostStartTick = state.clock.tick;
    emitAttachedBoostSmokeBurst(state, hasKickCharge ? (t.attachedBoostSmokeKickPuffs ?? 7) : 3);
    const impulse = hasKickCharge ? t.attachedBoostStartImpulse : 0;
    if (impulse !== 0) {
        p.vy = Math.min(p.vy, t.attachedBoostStartMaxDownwardVelocity) + impulse;
    }
    markRocketUse(state);
    addEvent(state, "PLAYER_BOOST_STARTED", {
        fuel: round(state.fuel.amount),
        impulse: round(impulse),
        kickCharge: round(rocket.boostKickCharge),
        kickFuelCost: hasKickCharge ? round(kickFuelCost) : 0
    });
    return true;
}

function getAttachedBoostAcceleration(state) {
    const t = state.tuning;
    const rocket = state.equipment.rocket;
    const fuelRatio = clamp(state.fuel.amount / Math.max(1, state.fuel.max), 0, 1);
    const curve = Math.max(0.05, t.attachedBoostFuelPowerCurve ?? 0.55);
    const fuelScale = (t.attachedBoostMinFuelScale ?? 0.68) + (1 - (t.attachedBoostMinFuelScale ?? 0.68)) * Math.pow(fuelRatio, curve);
    const burstDuration = Math.max(0.04, t.attachedBoostBurstDuration ?? 0.5);
    const burstBlend = clamp((rocket.boostBurstTimer ?? 0) / burstDuration, 0, 1);
    const shapedBurst = burstBlend * burstBlend;
    const initial = t.attachedBoostInitialAcceleration ?? t.attachedBoostAcceleration;
    const sustain = t.attachedBoostSustainAcceleration ?? t.attachedBoostAcceleration;
    return (sustain + (initial - sustain) * shapedBurst) * fuelScale;
}

function applyAttachedHoverGovernor(state, dt) {
    const rocket = state.equipment.rocket;
    if (!rocket.attachedBoosting || state.fuel.amount <= 0) {
        return;
    }

    const t = state.tuning;
    const p = state.player;
    const slowFallSpeed = Math.max(0, t.attachedBoostHoverFallSpeed ?? 36);
    const brakeAcceleration = Math.max(0, t.attachedBoostHoverBrakeAcceleration ?? 3600);

    // The Phase 1.004 rocket autopilot is a fall governor, not a sustained upward engine.
    // It never makes an upward velocity more upward. It only trims excessive downward speed.
    if (p.vy > slowFallSpeed) {
        const before = p.vy;
        p.vy = Math.max(slowFallSpeed, p.vy - brakeAcceleration * dt);
        const correction = (p.vy - before) / Math.max(0.0001, dt);
        rocket.boostAccelerationNow = correction;
        p.ay += correction;
        const gravityCancelPower = clamp(Math.abs(correction) / Math.max(1, t.gravity), 0, 1.2);
        rocket.boostVisualPowerNow = Math.max(attachedBoostVisualPower(state), gravityCancelPower * 0.72);
    } else {
        rocket.boostAccelerationNow = 0;
        rocket.boostVisualPowerNow = attachedBoostVisualPower(state);
    }
}

function attachedBoostVisualPower(state) {
    const t = state.tuning;
    const rocket = state.equipment.rocket;
    const burstDuration = Math.max(0.04, t.attachedBoostBurstDuration ?? 0.5);
    const burstBlend = clamp((rocket.boostBurstTimer ?? 0) / burstDuration, 0, 1);
    const kickPower = t.attachedBoostKickVisualPower ?? 1.08;
    const sustainPower = t.attachedBoostSustainVisualPower ?? t.attachedBoostVisualIdlePower ?? 0.36;
    return Math.max(0.08, sustainPower + (kickPower - sustainPower) * burstBlend);
}

function stopAttachedBoost(state, reason) {
    const rocket = state.equipment.rocket;
    if (!rocket.attachedBoosting) {
        return;
    }
    rocket.attachedBoosting = false;
    rocket.state = "mountedReady";
    rocket.attachedBoostTime = 0;
    rocket.boostBurstTimer = 0;
    rocket.boostAccelerationNow = 0;
    rocket.boostVisualPowerNow = 0;
    rocket.attachedSmokeTimer = 0;
    rocket.lastBoostEndTick = state.clock.tick;
    markRocketUse(state);
    addEvent(state, "PLAYER_BOOST_ENDED", { reason, fuel: round(state.fuel.amount) });
}

function launchHomingRocket(state, input) {
    const t = state.tuning;
    const weapons = state.weapons;
    if (weapons.launchCooldownTimer > 0) {
        addEvent(state, "ROCKET_LAUNCH_BLOCKED", { reason: "cooldown" });
        return false;
    }
    if (state.fuel.amount < t.rocketLaunchCost) {
        addEvent(state, "ROCKET_LAUNCH_BLOCKED", { reason: "fuel", fuel: round(state.fuel.amount) });
        return false;
    }

    const p = state.player;
    const target = findHomingTarget(state);
    const launchDir = { x: 0, y: -1 };
    const projectile = {
        id: `rocket_${String(weapons.nextProjectileId).padStart(3, "0")}`,
        kind: "homingRocket",
        state: "launched",
        x: p.x,
        y: p.y - p.height * 0.72,
        vx: launchDir.x * t.rocketProjectileSpeed,
        vy: launchDir.y * t.rocketProjectileSpeed,
        facing: p.facing,
        targetId: target ? target.id : null,
        upLaunchTimer: Math.max(0, t.rocketProjectileUpLaunchSeconds ?? 0.32),
        age: 0,
        lifetime: t.rocketProjectileLifetime,
        explosionTimer: 0,
        radius: 15,
        trail: [
            { x: p.x, y: p.y - p.height * 0.72, time: state.clock.time }
        ]
    };

    weapons.nextProjectileId += 1;
    weapons.launchCooldownTimer = t.rocketLaunchCooldown;
    weapons.launchedThisPhase = true;
    state.projectiles.push(projectile);
    state.fuel.amount = clamp(state.fuel.amount - t.rocketLaunchCost, 0, state.fuel.max);
    markRocketUse(state);
    addEvent(state, "ROCKET_LAUNCHED", { id: projectile.id, targetId: projectile.targetId, fuel: round(state.fuel.amount) });
    return true;
}

function updateProjectiles(state, dt) {
    const t = state.tuning;
    const weapons = state.weapons;
    weapons.launchCooldownTimer = Math.max(0, weapons.launchCooldownTimer - dt);

    for (const projectile of state.projectiles) {
        projectile.age += dt;
        if (projectile.state === "exploding") {
            projectile.explosionTimer -= dt;
            if (projectile.explosionTimer <= 0) {
                projectile.state = "spent";
            }
            continue;
        }

        if (projectile.state !== "launched") {
            continue;
        }

        projectile.upLaunchTimer = Math.max(0, (projectile.upLaunchTimer ?? 0) - dt);
        const target = findTargetById(state, projectile.targetId) || findHomingTarget(state);
        if (target && projectile.upLaunchTimer <= 0) {
            projectile.targetId = target.id;
            const desired = normalizeVector({ x: target.x - projectile.x, y: target.y - projectile.y });
            const desiredVx = desired.x * t.rocketProjectileSpeed;
            const desiredVy = desired.y * t.rocketProjectileSpeed;
            const blend = clamp(t.rocketProjectileHomingStrength * dt, 0, 1);
            projectile.vx += (desiredVx - projectile.vx) * blend;
            projectile.vy += (desiredVy - projectile.vy) * blend;
            const speed = Math.hypot(projectile.vx, projectile.vy) || 1;
            projectile.vx = projectile.vx / speed * t.rocketProjectileSpeed;
            projectile.vy = projectile.vy / speed * t.rocketProjectileSpeed;
            if (distance(projectile, target) <= (target.radius || t.rocketProjectileImpactRadius) + projectile.radius) {
                explodeProjectile(state, projectile, "target");
                continue;
            }
        }

        projectile.x += projectile.vx * dt;
        projectile.y += projectile.vy * dt;
        recordProjectileTrail(state, projectile);

        for (const solid of state.world.solids) {
            if (circleRectOverlap(projectile.x, projectile.y, projectile.radius, solid)) {
                explodeProjectile(state, projectile, solid.id);
                break;
            }
        }

        if (projectile.age >= projectile.lifetime) {
            explodeProjectile(state, projectile, "lifetime");
        }
    }

    state.projectiles = state.projectiles.filter((projectile) => projectile.state !== "spent");
}

function recordProjectileTrail(state, projectile) {
    if (!Array.isArray(projectile.trail)) {
        projectile.trail = [];
    }

    const previous = projectile.trail[projectile.trail.length - 1];
    const spacing = 8;
    if (!previous || Math.hypot(projectile.x - previous.x, projectile.y - previous.y) >= spacing) {
        projectile.trail.push({
            x: round(projectile.x),
            y: round(projectile.y),
            time: Number(state.clock.time.toFixed(4))
        });
    }

    const puffSpacing = Math.max(1, state.tuning.rocketSmokePuffSpacing ?? 13);
    const previousPuff = projectile.lastSmokePuff || null;
    if (!previousPuff || Math.hypot(projectile.x - previousPuff.x, projectile.y - previousPuff.y) >= puffSpacing) {
        addRocketSmokePuff(state, projectile);
        projectile.lastSmokePuff = { x: projectile.x, y: projectile.y };
    }

    const maxTrailAge = 2.15;
    const cutoff = state.clock.time - maxTrailAge;
    while (projectile.trail.length > 2 && projectile.trail[0].time < cutoff) {
        projectile.trail.shift();
    }
    while (projectile.trail.length > 180) {
        projectile.trail.shift();
    }
}

function addRocketSmokePuff(state, projectile) {
    if (!state.effects) {
        state.effects = { nextPuffId: 1, smokePuffs: [] };
    }
    if (!Array.isArray(state.effects.smokePuffs)) {
        state.effects.smokePuffs = [];
    }

    const speed = Math.hypot(projectile.vx, projectile.vy) || 1;
    const tailX = -projectile.vx / speed;
    const tailY = -projectile.vy / speed;
    const seed = Math.floor((projectile.x * 17 + projectile.y * 31 + state.clock.tick * 7) % 100000);
    const id = state.effects.nextPuffId || 1;
    state.effects.nextPuffId = id + 1;
    state.effects.smokePuffs.push({
        id: `smoke_${String(id).padStart(4, "0")}`,
        kind: "rocketSmokePuff",
        x: round(projectile.x + tailX * projectile.radius * 0.85),
        y: round(projectile.y + tailY * projectile.radius * 0.85),
        vx: round(tailX * 8),
        vy: round(tailY * 8 - 10),
        age: 0,
        lifetime: state.tuning.rocketSmokePuffLifetime ?? 1.5,
        radius: (10 + (seed % 9)) * (state.tuning.rocketSmokePuffScale ?? 1.5),
        sparkleSeed: seed
    });

    while (state.effects.smokePuffs.length > (state.tuning.rocketSmokeMaxPuffs ?? 260)) {
        state.effects.smokePuffs.shift();
    }
}


function addSmokePuff(state, spec) {
    if (!state.effects) {
        state.effects = { nextPuffId: 1, smokePuffs: [] };
    }
    if (!Array.isArray(state.effects.smokePuffs)) {
        state.effects.smokePuffs = [];
    }

    const id = state.effects.nextPuffId || 1;
    state.effects.nextPuffId = id + 1;
    const seed = Math.floor(((spec.x || 0) * 17 + (spec.y || 0) * 31 + state.clock.tick * 7 + id * 13) % 100000);
    state.effects.smokePuffs.push({
        id: `smoke_${String(id).padStart(4, "0")}`,
        kind: spec.kind || "rocketSmokePuff",
        x: round(spec.x || 0),
        y: round(spec.y || 0),
        vx: round(spec.vx || 0),
        vy: round(spec.vy || 0),
        age: 0,
        lifetime: spec.lifetime ?? state.tuning.rocketSmokePuffLifetime ?? 1.5,
        radius: (spec.radius ?? 12) * (state.tuning.rocketSmokePuffScale ?? 1.5),
        sparkleSeed: spec.sparkleSeed ?? seed
    });

    while (state.effects.smokePuffs.length > (state.tuning.rocketSmokeMaxPuffs ?? 260)) {
        state.effects.smokePuffs.shift();
    }
}

function attachedRocketNozzlePoint(state) {
    const p = state.player;
    return {
        x: p.x - p.facing * 28,
        y: p.y - p.height * 0.42
    };
}

function emitAttachedBoostSmoke(state, dt) {
    const rocket = state.equipment.rocket;
    const interval = Math.max(0.025, state.tuning.attachedBoostSmokePuffInterval ?? 0.065);
    rocket.attachedSmokeTimer = (rocket.attachedSmokeTimer ?? 0) - dt;
    while (rocket.attachedSmokeTimer <= 0) {
        emitAttachedBoostSmokeBurst(state, 1);
        rocket.attachedSmokeTimer += interval;
    }
}

function emitAttachedBoostSmokeBurst(state, count) {
    const rocket = state.equipment.rocket;
    const p = state.player;
    const t = state.tuning;
    const nozzle = attachedRocketNozzlePoint(state);
    const power = clamp(rocket.boostVisualPowerNow || attachedBoostVisualPower(state), 0.18, 1.25);
    const total = Math.max(0, Math.floor(count));
    const downSpeed = Math.max(0, t.attachedBoostSmokePuffDownSpeed ?? 170);
    const sideSpeed = Math.max(0, t.attachedBoostSmokePuffSideSpeed ?? 42);
    const speedJitter = Math.max(0, t.attachedBoostSmokePuffSpeedJitter ?? 36);

    for (let i = 0; i < total; i += 1) {
        const wobble = ((state.clock.tick * 37 + i * 53) % 100) / 100 - 0.5;
        const spread = ((state.clock.tick * 19 + i * 29) % 100) / 100 - 0.5;
        addSmokePuff(state, {
            kind: "attachedRocketSmokePuff",
            x: nozzle.x + spread * 9,
            y: nozzle.y + i * 2,
            vx: p.vx * 0.10 + spread * sideSpeed - p.facing * 8,
            vy: downSpeed * (0.45 + power * 0.55) + wobble * speedJitter,
            lifetime: 1.6 + power * 0.65,
            radius: 8 + power * 9 + (i % 3) * 1.5
        });
    }
}

function updateWorldEffects(state, dt) {
    if (!state.effects || !Array.isArray(state.effects.smokePuffs)) {
        return;
    }
    for (const puff of state.effects.smokePuffs) {
        puff.age += dt;
        puff.x += (puff.vx || 0) * dt;
        puff.y += (puff.vy || 0) * dt;
        puff.vx *= Math.max(0, 1 - 0.45 * dt);
        puff.vy *= Math.max(0, 1 - 0.25 * dt);
    }
    state.effects.smokePuffs = state.effects.smokePuffs.filter((puff) => puff.age < puff.lifetime);
}

function explodeProjectile(state, projectile, reason) {
    if (projectile.state === "exploding" || projectile.state === "spent") {
        return;
    }
    emitProjectileImpactSmoke(state, projectile);
    projectile.state = "exploding";
    projectile.vx = 0;
    projectile.vy = 0;
    projectile.explosionTimer = state.tuning.rocketProjectileExplosionSeconds;
    addEvent(state, "ROCKET_IMPACTED", { id: projectile.id, reason, x: round(projectile.x), y: round(projectile.y) });
}

function emitProjectileImpactSmoke(state, projectile) {
    const t = state.tuning;
    const count = Math.max(0, Math.floor(t.rocketImpactSmokePuffs ?? 24));
    const incomingSpeed = Math.hypot(projectile.vx || 0, projectile.vy || 0);
    const incomingAngle = Math.atan2(projectile.vy || 0, projectile.vx || 1);

    for (let i = 0; i < count; i += 1) {
        const u = count <= 1 ? 0 : i / (count - 1);
        const seed = (state.clock.tick * 97 + i * 131 + Math.floor(projectile.x * 3 + projectile.y * 5)) % 10000;
        const angle = incomingAngle + Math.PI + (u - 0.5) * Math.PI * 1.55 + (hash01(seed) - 0.5) * 0.65;
        const speed = 60 + incomingSpeed * (0.08 + hash01(seed + 19) * 0.13) + i * 2.2;
        const offset = 5 + hash01(seed + 41) * 16;
        addSmokePuff(state, {
            kind: "rocketImpactSmokePuff",
            x: projectile.x + Math.cos(angle) * offset,
            y: projectile.y + Math.sin(angle) * offset,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 18 + hash01(seed + 73) * 42,
            lifetime: (t.rocketSmokePuffLifetime ?? 1.5) * (0.75 + hash01(seed + 101) * 0.65),
            radius: 8 + hash01(seed + 157) * 10
        });
    }
}

function hash01(seed) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
}

function findHomingTarget(state) {
    return state.targets.find((target) => target.state === "active") || null;
}

function findTargetById(state, id) {
    if (!id) {
        return null;
    }
    return state.targets.find((target) => target.id === id && target.state === "active") || null;
}

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalizeVector(v) {
    const length = Math.hypot(v.x, v.y) || 1;
    return { x: v.x / length, y: v.y / length };
}

function circleRectOverlap(cx, cy, radius, rect) {
    const closestX = clamp(cx, rect.x, rect.x + rect.w);
    const closestY = clamp(cy, rect.y, rect.y + rect.h);
    return Math.hypot(cx - closestX, cy - closestY) <= radius;
}

function moveAndCollideX(state, dx) {
    const p = state.player;
    if (dx === 0) {
        return;
    }

    p.x += dx;
    let rect = getPlayerRect(state);
    for (const solid of state.world.solids) {
        if (!rectsOverlap(rect, solid)) {
            continue;
        }
        if (dx > 0) {
            p.x = solid.x - p.width / 2;
            state.collisions.playerTouching.right = true;
        } else {
            p.x = solid.x + solid.w + p.width / 2;
            state.collisions.playerTouching.left = true;
        }
        p.vx = 0;
        state.collisions.lastResolution = { axis: "x", solidId: solid.id };
        rect = getPlayerRect(state);
    }
}

function moveAndCollideY(state, dy, wasOnGround) {
    const p = state.player;
    p.y += dy;
    p.onGround = false;

    let rect = getPlayerRect(state);
    for (const solid of state.world.solids) {
        if (!rectsOverlap(rect, solid)) {
            continue;
        }
        if (dy > 0) {
            p.y = solid.y;
            p.vy = 0;
            p.onGround = true;
            p.airBoostArmed = false;
            state.collisions.playerTouching.down = true;
            if (state.equipment.rocket.attachedBoosting) {
                stopAttachedBoost(state, "landed");
            }
            if (!wasOnGround) {
                p.vx = approach(p.vx, 0, state.tuning.landingFriction * state.clock.fixedDt);
                addEvent(state, "PLAYER_LANDED", { solidId: solid.id, x: round(p.x), y: round(p.y), vx: round(p.vx) });
            }
        } else if (dy < 0) {
            p.y = solid.y + solid.h + p.height;
            p.vy = 0;
            state.collisions.playerTouching.up = true;
        }
        state.collisions.lastResolution = { axis: "y", solidId: solid.id };
        rect = getPlayerRect(state);
    }
}

function updateFuelRecharge(state, dt) {
    const fuel = state.fuel;
    const t = state.tuning;
    const rocket = state.equipment.rocket;

    fuel.amount = clamp(fuel.amount, 0, fuel.max);

    updateBoostKickGroundRecharge(state, dt);

    if (rocket.attachedBoosting) {
        return;
    }

    if (fuel.rechargeDelayTimer > 0) {
        fuel.rechargeDelayTimer = Math.max(0, fuel.rechargeDelayTimer - dt);
        return;
    }

    if (t.fuelRechargeRequiresGround !== false && !fuel.rechargeLatched) {
        if (!state.player.onGround) {
            return;
        }
        fuel.rechargeLatched = true;
        addEvent(state, "FUEL_RECHARGE_STARTED", { grounded: true });
    }

    const cap = clamp(fuel.rechargeCap, 0, fuel.max);
    if (fuel.amount < cap) {
        const previous = fuel.amount;
        fuel.amount = Math.min(cap, fuel.amount + t.rechargeRate * dt);
        if (Math.floor(previous) !== Math.floor(fuel.amount)) {
            addEvent(state, "FUEL_CHANGED", { amount: round(fuel.amount), cap });
        }
    }
}

function updateBoostKickGroundRecharge(state, dt) {
    const rocket = state.equipment.rocket;
    const t = state.tuning;
    const kickMax = Math.max(0, t.attachedBoostKickChargeMax ?? 1);
    rocket.boostKickCharge = clamp(rocket.boostKickCharge ?? kickMax, 0, kickMax);

    if (!state.player.onGround || rocket.boostKickCharge >= kickMax) {
        return;
    }

    const previous = rocket.boostKickCharge;
    if (t.attachedBoostKickRechargeInstant !== false) {
        rocket.boostKickCharge = kickMax;
    } else {
        rocket.boostKickCharge = Math.min(kickMax, rocket.boostKickCharge + Math.max(0, t.attachedBoostKickChargeRechargeRate ?? 1) * dt);
    }

    if (previous !== rocket.boostKickCharge) {
        if (t.rocketFuelBulbFlashOnKickRecharge !== false) {
            rocket.fuelBulbFlashTimer = 0.45;
        }
        addEvent(state, "BOOST_KICK_RECHARGED", { charge: round(rocket.boostKickCharge), grounded: true });
    }
}

function updateHealth(state, dt) {
    const health = state.health;
    const t = state.tuning;
    health.low = health.amount <= t.lowHealthThreshold;

    if (state.clock.time - health.lastDamagedAt >= t.healthRegenDelay && health.amount < health.max) {
        health.amount = Math.min(health.max, health.amount + t.healthRegenRate * dt);
    }

    state.player.lowHealthPulse = health.low ? (Math.sin(state.clock.time * 9) + 1) * 0.5 : 0;
}

function updateHat(state) {
    const hat = state.hat;
    if (hat.state === "worn") {
        hat.x = state.player.x;
        hat.y = state.player.y - state.player.height;
        hat.vx = state.player.vx;
        hat.vy = state.player.vy;
    }
}

function updateCameraHint(state, dt) {
    const p = state.player;
    const lookAhead = 150 * p.facing;
    const verticalLead = clamp(p.vy * 0.12, -120, 90);
    const targetX = p.x + lookAhead;
    const targetY = p.y - 170 + verticalLead;
    const blend = 1 - Math.pow(0.001, dt);
    state.camera.x += (targetX - state.camera.x) * blend;
    state.camera.y += (targetY - state.camera.y) * blend;
}

export function damagePlayer(state, amount = 34, sourceId = "debug") {
    state.health.amount = clamp(state.health.amount - amount, 0, state.health.max);
    state.health.lastDamagedAt = state.clock.time;
    addEvent(state, "PLAYER_DAMAGED", { amount, sourceId, health: round(state.health.amount) });
}

export function resetPlayer(state, reason = "manualReset") {
    const p = state.player;
    stopAttachedBoost(state, "reset");
    p.x = p.spawnX;
    p.y = p.spawnY;
    p.vx = 0;
    p.vy = 0;
    p.onGround = false;
    p.wasOnGround = false;
    p.airBoostArmed = false;
    p.facing = 1;
    state.fuel.amount = state.tuning.initialFuel;
    state.fuel.rechargeDelayTimer = 0;
    state.fuel.rechargeLatched = false;
    state.equipment.rocket.boostKickCharge = state.tuning.attachedBoostKickChargeMax ?? 1;
    state.equipment.rocket.boostBurstTimer = 0;
    state.equipment.rocket.boostAccelerationNow = 0;
    state.equipment.rocket.boostVisualPowerNow = 0;
    state.equipment.rocket.attachedSmokeTimer = 0;
    state.weapons.launchCooldownTimer = 0;
    state.projectiles.length = 0;
    if (state.effects?.smokePuffs) {
        state.effects.smokePuffs.length = 0;
    }
    state.health.amount = state.health.max;
    state.health.low = false;
    addEvent(state, "PLAYER_RESET", { reason });
}

function round(value) {
    return Number(value.toFixed(3));
}
