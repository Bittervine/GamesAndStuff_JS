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
    groundAcceleration: 2700,
    airAcceleration: 820,
    groundFriction: 2200,
    landingFriction: 550,
    airDrag: 0.12,
    attachedBoostAcceleration: -1580,
    attachedBoostStartImpulse: -260,
    attachedBoostStartMaxDownwardVelocity: 120,
    attachedBoostInitialAcceleration: -3050,
    attachedBoostSustainAcceleration: -1500,
    attachedBoostBurstDuration: 0.5,
    attachedBoostHoverFallSpeed: 36,
    attachedBoostHoverBrakeAcceleration: 3600,
    attachedBoostVisualIdlePower: 0.45,
    attachedBoostKickChargeMax: 1,
    attachedBoostKickChargeRechargeRate: 999,
    attachedBoostKickRechargeInstant: true,
    attachedBoostAllowSustainWithoutKickCharge: true,
    attachedBoostMinFuelScale: 0.68,
    attachedBoostFuelPowerCurve: 0.55,
    fuelMax: 100,
    initialFuel: 50,
    baseRechargeCap: 25,
    rechargeDelayAfterUse: 2,
    rechargeRate: 45,
    attachedBoostDrainRate: 10,
    rocketLaunchCost: 10,
    rocketLaunchCooldown: 0.35,
    rocketProjectileSpeed: 520,
    rocketProjectileUpLaunchSeconds: 0.32,
    rocketProjectileHomingStrength: 3.2,
    rocketProjectileLifetime: 4.6,
    rocketProjectileExplosionSeconds: 0.42,
    rocketProjectileImpactRadius: 24,
    rocketSmokePuffLifetime: 2.8,
    rocketSmokePuffSpacing: 13,
    rocketSmokeMaxPuffs: 260,
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
        ...overrides
    };
}

export function createInitialGameState(overrides = {}) {
    const tuning = deepClone(DEFAULT_TUNING);
    if (overrides.tuning) {
        Object.assign(tuning, overrides.tuning);
    }

    const world = createPhaseOneArena(tuning);
    const spawn = overrides.spawn || { x: 210, y: 600 };

    const state = {
        meta: {
            schemaVersion: 1,
            build: "phase-1.004-physics-arena",
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
            lowHealthPulse: 0
        },
        fuel: {
            amount: tuning.initialFuel,
            max: tuning.fuelMax,
            rechargeCap: tuning.baseRechargeCap,
            rechargeDelayTimer: 0,
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
                lastBoostStartTick: null,
                lastBoostEndTick: null
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
            { id: "fuel_001", kind: "fuel", x: 735, y: 300, radius: 14, amount: 10, collected: false },
            { id: "fuel_002", kind: "fuel", x: 1840, y: 120, radius: 14, amount: 10, collected: false }
        ],
        collisions: {
            playerTouching: { left: false, right: false, up: false, down: false },
            lastResolution: null
        },
        story: {
            levelTitle: "Ignatius Rocketfrock and the Arena of Preliminary Liability"
        },
        debug: {
            paused: false,
            showHitboxes: true,
            showVelocity: true,
            showCollision: true,
            showInput: true,
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
    const solids = [
        { id: "floor_left", kind: "floor", x: -260, y: 600, w: 1080, h: 90 },
        { id: "floor_right", kind: "floor", x: 1120, y: 600, w: 1920, h: 90 },
        { id: "left_wall", kind: "wall", x: -320, y: -360, w: 60, h: 1050 },
        { id: "right_wall", kind: "wall", x: 3040, y: -360, w: 60, h: 1050 },
        { id: "platform_1wh", kind: "platform", x: 520, y: 600 - wh, w: 180, h: 26 },
        { id: "platform_2wh", kind: "platform", x: 650, y: 600 - wh * 2, w: 230, h: 26 },
        { id: "platform_3wh", kind: "platform", x: 1240, y: 600 - wh * 3, w: 240, h: 26 },
        { id: "shaft_left", kind: "shaftWall", x: 1670, y: 100, w: 42, h: 500 },
        { id: "shaft_right", kind: "shaftWall", x: 1980, y: 100, w: 42, h: 500 },
        { id: "shaft_mid_platform", kind: "platform", x: 1765, y: 420, w: 120, h: 24 },
        { id: "high_boost_ledge", kind: "platform", x: 1760, y: 190, w: 140, h: 26 },
        { id: "right_test_platform", kind: "platform", x: 2310, y: 465, w: 260, h: 26 }
    ];

    return {
        levelId: "phase1_physics_arena",
        gravityDirection: { x: 0, y: 1 },
        bounds: { x: -320, y: -420, w: 3420, h: 1110 },
        resetY: 930,
        start: { x: 210, y: 600 },
        solids,
        labels: [
            { text: "1WH", x: 580, y: 600 - wh - 12 },
            { text: "2WH", x: 720, y: 600 - wh * 2 - 12 },
            { text: "3WH", x: 1315, y: 600 - wh * 3 - 12 },
            { text: "wide gap", x: 930, y: 570 },
            { text: "boost shaft", x: 1770, y: 565 },
            { text: "homing dot", x: 835, y: 386 }
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

    if (input.jumpPressed && wasOnGround) {
        p.vy = t.jumpVelocity;
        p.onGround = false;
        p.airborneTime = 0;
        addEvent(state, "PLAYER_JUMPED", { x: round(p.x), y: round(p.y), vx: round(p.vx), vy: round(p.vy) });
    } else if (input.jumpPressed && !wasOnGround && !rocket.attachedBoosting && fuel.amount > 0) {
        startAttachedBoost(state);
    }

    if (rocket.attachedBoosting) {
        const shouldStop = input.jumpReleased || !input.jumpHeld || fuel.amount <= 0;
        if (shouldStop) {
            stopAttachedBoost(state, fuel.amount <= 0 ? "fuelEmpty" : "jumpReleased");
        } else {
            rocket.attachedBoostTime += dt;
            rocket.boostBurstTimer = Math.max(0, rocket.boostBurstTimer - dt);
            rocket.boostAccelerationNow = 0;
            rocket.boostVisualPowerNow = Math.max(0.1, t.attachedBoostVisualIdlePower ?? 0.45);
            const used = Math.min(fuel.amount, t.attachedBoostDrainRate * dt);
            fuel.amount = clamp(fuel.amount - used, 0, fuel.max);
            fuel.lastUsedAt = state.clock.time;
            fuel.rechargeDelayTimer = t.rechargeDelayAfterUse;
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

function startAttachedBoost(state) {
    const rocket = state.equipment.rocket;
    const p = state.player;
    const t = state.tuning;
    const kickCharge = clamp(rocket.boostKickCharge ?? t.attachedBoostKickChargeMax ?? 1, 0, t.attachedBoostKickChargeMax ?? 1);
    const hasKickCharge = kickCharge > 0.001;
    rocket.attachedBoosting = true;
    rocket.state = "attachedBoosting";
    rocket.attachedBoostTime = 0;
    rocket.boostBurstTimer = hasKickCharge ? Math.max(0, t.attachedBoostBurstDuration ?? 0.5) : 0;
    rocket.boostKickCharge = 0;
    rocket.boostAccelerationNow = 0;
    rocket.boostVisualPowerNow = Math.max(0.1, t.attachedBoostVisualIdlePower ?? 0.45);
    rocket.lastBoostStartTick = state.clock.tick;
    const impulse = hasKickCharge ? t.attachedBoostStartImpulse : 0;
    if (impulse !== 0) {
        p.vy = Math.min(p.vy, t.attachedBoostStartMaxDownwardVelocity) + impulse;
    }
    state.fuel.rechargeDelayTimer = state.tuning.rechargeDelayAfterUse;
    state.fuel.lastUsedAt = state.clock.time;
    addEvent(state, "PLAYER_BOOST_STARTED", {
        fuel: round(state.fuel.amount),
        impulse: round(impulse),
        kickCharge: round(rocket.boostKickCharge)
    });
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
        rocket.boostVisualPowerNow = Math.max(t.attachedBoostVisualIdlePower ?? 0.45, gravityCancelPower);
    } else {
        rocket.boostAccelerationNow = 0;
        rocket.boostVisualPowerNow = Math.max(0.1, t.attachedBoostVisualIdlePower ?? 0.45);
    }
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
    rocket.lastBoostEndTick = state.clock.tick;
    state.fuel.rechargeDelayTimer = state.tuning.rechargeDelayAfterUse;
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
    state.fuel.lastUsedAt = state.clock.time;
    state.fuel.rechargeDelayTimer = t.rechargeDelayAfterUse;
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
        lifetime: state.tuning.rocketSmokePuffLifetime ?? 2.8,
        radius: 10 + (seed % 9),
        sparkleSeed: seed
    });

    while (state.effects.smokePuffs.length > (state.tuning.rocketSmokeMaxPuffs ?? 260)) {
        state.effects.smokePuffs.shift();
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
    projectile.state = "exploding";
    projectile.vx = 0;
    projectile.vy = 0;
    projectile.explosionTimer = state.tuning.rocketProjectileExplosionSeconds;
    addEvent(state, "ROCKET_IMPACTED", { id: projectile.id, reason, x: round(projectile.x), y: round(projectile.y) });
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

    if (rocket.attachedBoosting) {
        return;
    }

    if (fuel.rechargeDelayTimer > 0) {
        fuel.rechargeDelayTimer = Math.max(0, fuel.rechargeDelayTimer - dt);
        return;
    }

    const kickMax = Math.max(0, t.attachedBoostKickChargeMax ?? 1);
    rocket.boostKickCharge = clamp(rocket.boostKickCharge ?? kickMax, 0, kickMax);
    if (rocket.boostKickCharge < kickMax) {
        const previous = rocket.boostKickCharge;
        if (t.attachedBoostKickRechargeInstant !== false) {
            rocket.boostKickCharge = kickMax;
        } else {
            rocket.boostKickCharge = Math.min(kickMax, rocket.boostKickCharge + Math.max(0, t.attachedBoostKickChargeRechargeRate ?? 1) * dt);
        }
        if (previous !== rocket.boostKickCharge) {
            addEvent(state, "BOOST_KICK_RECHARGED", { charge: round(rocket.boostKickCharge) });
        }
        if (rocket.boostKickCharge < kickMax) {
            return;
        }
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
    p.facing = 1;
    state.fuel.amount = state.tuning.initialFuel;
    state.fuel.rechargeDelayTimer = 0;
    state.equipment.rocket.boostKickCharge = state.tuning.attachedBoostKickChargeMax ?? 1;
    state.equipment.rocket.boostBurstTimer = 0;
    state.equipment.rocket.boostAccelerationNow = 0;
    state.equipment.rocket.boostVisualPowerNow = 0;
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
