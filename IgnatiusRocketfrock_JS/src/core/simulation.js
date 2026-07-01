import {
    STORY_READING_CHARACTERS_PER_SECOND,
    storyCharacterCount,
    storyReadingDuration
} from "../shared/story-reading.js";
import { atlasNodeToPlacementWorld, normalizeRotationRadians } from "../shared/level-transform.js";
import { characterEnemyMeleeAttackRect, enemyProjectileHitbox } from "../shared/actor-geometry.js";
import { normalizeLevelColorMap } from "../shared/level-color-map-data.js";
import { normalizeCaveWindow } from "../shared/cave-window-data.js";
import {
    deriveCaveFullBlackKillBoundary,
    rectFullyOutsideCaveKillBoundary
} from "../shared/cave-kill-boundary-data.js";
import { normalizeMovingPlatform } from "../shared/moving-platform-data.js";
import {
    isSignalEmitterEntity,
    isSignalReceiverEntity,
    normalizeSignalChannel,
    normalizeSignalEmitter,
    normalizeSignalReceiver
} from "../shared/signal-channel-data.js";
import { normalizeLevelMusic } from "../shared/music-data.js";
import { normalizeEnemyScale, scaledEnemyDimensions, scaledEnemyProjectileRadius, scaledEnemyRenderScale } from "../shared/enemy-scale-data.js";
import {
    enemyEntityFromDefinition,
    normalizeAutoSpawnEnemies,
    normalizeEnemyDefinitionCatalog,
    normalizeEnemySpawner,
    resolveAutoSpawnEnemyIds
} from "../shared/auto-spawn-enemy-data.js";
import {
    OVERDRIVE_PASSIVE_FUEL_RECOVERY_DRAIN_FACTOR,
    POWER_UP_EFFECT_IDS,
    WRENCH_POWER_UP_EFFECT_IDS,
    activePowerUpEffect,
    activeWrenchPowerUpEffect,
    normalizeActivePowerUpEffect,
    normalizePowerUpPickup,
    powerUpEffectDefinition,
    rocketPowerUpMultipliers,
    wrenchRocketGlowAtlasFrameId
} from "../shared/power-up-data.js";
import {
    difficultyDamageScale,
    normalizeGameSettings,
    renderingParticleScale
} from "../shared/game-settings-data.js";
import {
    queryWorldCollisionPolygons,
    queryWorldSegments,
    queryWorldSolids
} from "./world-collision-index.js";
import {
    buildEnemyNavigationEdges,
    ENEMY_DROP_SOURCE_CLEARANCE_HEIGHT_FACTOR,
    buildEnemyNavigationSupports,
    enemyNavigationEdgeMapFromFlat,
    enemyNavigationProfileKey,
    enemyNavigationSupportsSignature,
    findBakedEnemyNavigationGraph,
    findEnemyNavigationSupport,
    navigationSupportById,
    planEnemyNavigationRoute,
    supportPoint
} from "./enemy-navigation.js";

export const FIXED_DT = 1 / 60;
const AUTOMATIC_STEP_HEIGHT_RATIO = 0.2;

export function ordinaryJumpVelocity(gravity, jumpHeight) {
    const resolvedGravity = Math.max(1, Number(gravity) || 1);
    const resolvedHeight = Math.max(1, Number(jumpHeight) || 1);
    return -Math.sqrt(2 * resolvedGravity * resolvedHeight);
}

const MOVING_PLATFORM_NAVIGATION_CACHE = new WeakMap();
const STATIC_ENEMY_NAVIGATION_CACHE = new WeakMap();

const WIZARD_DOOR_FLOOR_ANCHOR_Y_FACTOR = 239 / 263;
const DEFAULT_WIZARD_DOOR_INSIDE_SCALE = 0.84;
const ENEMY_COMBAT_STATE = Object.freeze({
    ALIVE: "alive",
    HURT: "hurt",
    ATTACKING: "attacking",
    DEATH_PENDING_LANDING: "death_pending_landing",
    DEAD: "dead"
});

export const DEFAULT_TUNING = Object.freeze({
    timestep: FIXED_DT,
    wizardHeight: 104,
    playerWidth: 34,
    playerHeight: 104,
    gravity: 1490,
    ordinaryJumpHeight: 200,
    terminalVelocity: 2500,
    playerDropThroughGraceSeconds: 0.18,
    fallDamageEnabled: true,
    fallDamageSafeImpactSpeed: 1441,
    fallDamagePerWizardHeight: 10,
    jumpVelocity: ordinaryJumpVelocity(1490, 200),
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
    rocketProjectileSpeed: 520,
    rocketProjectileUpLaunchSeconds: 0.32,
    rocketProjectileInitialHomingStrength: 6.7,
    rocketProjectileHomingStrength: 4.8,
    rocketProjectileLifetime: 4.6,
    rocketProjectileExplosionSeconds: 0.24,
    rocketProjectileImpactRadius: 24,
    rocketProjectileDamage: 30,
    standardRocketSecondarySplashDamage: 1,
    standardRocketSecondarySplashRadiusWizardHeights: 1,
    enemyHitFlashSeconds: 0.16,
    enemyHealthBarSeconds: 1.4,
    enemyDefaultHurtSeconds: 0.48,
    enemyDefaultDeathSeconds: 1.18,
    enemyCorpseHoldSeconds: 2,
    enemyCorpseFadeSeconds: 3,
    enemyDefaultRunSpeed: 150,
    enemyDefaultJumpHeight: 118,
    enemyDefaultJumpGravity: 1250,
    enemyDefaultMaxFallDistance: 280,
    enemyDefaultGlareSeconds: 5,
    enemyDefaultRepathSeconds: 0.3,
    enemyDefaultHomeRetrySeconds: 4,
    enemyDefaultAwarenessRange: 300,
    enemyDefaultAwarenessViewHalfAngle: 60,
    enemyDefaultAwarenessHoldSeconds: 1.2,
    enemyDefaultAttackDamage: 24,
    enemyDefaultAttackRange: 66,
    enemyDefaultAttackVerticalRange: 104,
    enemyDefaultAttackDuration: 0.44,
    enemyDefaultAttackHitTime: 0.36,
    enemyDefaultAttackCooldown: 0.12,
    enemyDefaultAttackLungeDistance: 20,
    enemyDefaultAttackLungeSpeed: 180,
    enemyDefaultAttackKnockbackX: 330,
    enemyDefaultAttackKnockbackY: -250,
    enemyDefaultAttackMode: "melee",
    enemyDefaultPreferredAttackRange: 180,
    enemyDefaultProjectileKind: "fireball",
    enemyDefaultProjectileSpeed: 320,
    enemyDefaultProjectileGravity: 0,
    enemyDefaultProjectileLifetime: 4.2,
    enemyDefaultProjectileRadius: 14,
    enemyDefaultProjectileDamage: 18,
    enemyDefaultProjectileCooldown: 0.9,
    enemyDefaultProjectileHomingStrength: 0,
    enemyDefaultProjectileKnockbackX: 180,
    enemyDefaultProjectileKnockbackY: -120,
    playerDamageInvulnerabilitySeconds: 0.45,
    playerHitFlashSeconds: 0.24,
    playerCrushConfirmTicks: 3,
    playerCrushClosingDistanceEpsilon: 0.0001,
    playerDeathCoverSeconds: 0.42,
    playerDeathBurstSeconds: 0.72,
    playerDeathAfterglowSeconds: 2,
    playerDeathCoverParticleCount: 102,
    playerDeathBurstParticleCount: 72,
    hazardContactDamage: 20,
    rocketImpactSmokePuffs: 12,
    rocketImpactSmokeLifetime: 0.82,
    reactiveObjectDestructionSmokePuffs: 18,
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
        moveAxis: 0,
        jumpPressed: false,
        jumpHeld: false,
        jumpReleased: false,
        boostPressed: false,
        boostHeld: false,
        boostReleased: false,
        weaponPressed: false,
        weaponHeld: false,
        weaponReleased: false,
        interactPressed: false,
        interactHeld: false,
        interactReleased: false,
        dropPressed: false,
        dropHeld: false,
        dropReleased: false,
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
        moveAxis: input.moveAxis,
        jumpHeld: input.jumpHeld,
        boostHeld: input.boostHeld,
        weaponHeld: input.weaponHeld,
        interactHeld: input.interactHeld,
        dropHeld: input.dropHeld,
        aimVector: input.aimVector,
        aimTarget: input.aimTarget
    });
}

export function createInitialGameState(overrides = {}) {
    const tuning = deepClone(DEFAULT_TUNING);
    if (overrides.tuning) {
        Object.assign(tuning, overrides.tuning);
    }
    tuning.ordinaryJumpHeight = Math.max(1, Number(tuning.ordinaryJumpHeight) || DEFAULT_TUNING.ordinaryJumpHeight);
    tuning.jumpVelocity = ordinaryJumpVelocity(tuning.gravity, tuning.ordinaryJumpHeight);

    const world = createTestArena(tuning);
    const spawn = overrides.spawn || world.start || { x: 120, y: 600 };
    const settings = normalizeGameSettings(overrides.settings);

    const state = {
        meta: {
            schemaVersion: 1,
            build: "248-test-runner-diagnostics",
            note: "Gameplay state only. Browser, canvas, image and renderer resources are deliberately outside gameState."
        },
        clock: {
            tick: 0,
            time: 0,
            fixedDt: tuning.timestep
        },
        random: {
            seed: (Math.floor(Number(overrides.randomSeed)) >>> 0) || 0x1a2b3c4d,
            levelLoadCount: 0
        },
        tuning,
        settings,
        enemyCatalog: normalizeEnemyDefinitionCatalog(overrides.enemyCatalog),
        characterCombatProfiles: {},
        world,
        camera: {
            x: spawn.x,
            y: spawn.y - 170,
            zoom: 1,
            mode: "follow",
            viewportWidth: 1280,
            viewportHeight: 720
        },
        player: {
            id: "ignatius",
            x: (spawn || world.start || { x: 120, y: 600 }).x,
            y: (spawn || world.start || { x: 120, y: 600 }).y,
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
            ordinaryJumpActive: false,
            ordinaryJumpStartY: null,
            ordinaryJumpApexY: null,
            lowHealthPulse: 0,
            visible: true,
            renderScale: 1,
            supportId: null,
            dropThroughTimer: 0,
            crushCandidateTicks: 0,
            crushCandidateKey: null,
            crushCandidateDetail: null,
            combatState: "alive",
            targetable: true,
            deathPhase: "none",
            deathPhaseTimer: 0,
            deathElapsed: 0,
            deathSourceId: null,
            deathResetReason: null
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
            invulnerabilityTimer: 0,
            regenerating: false,
            low: false
        },
        score: 0,
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
            nextProjectileId: 1,
        },
        projectiles: [],
        reactiveObjects: [],
        treasureChests: [],
        effects: {
            nextPuffId: 1,
            smokePuffs: []
        },
        targets: [
            { id: "homing_dot", kind: "debugHomingDot", x: 1800, y: 395, radius: 15, state: "active" }
        ],
        enemies: [
            { id: "dummy_001", kind: "targetDummy", x: 1750, y: 580, width: 42, height: 80, health: 100, state: "idle" },
            { id: "dummy_002", kind: "targetDummy", x: 3660, y: 580, width: 42, height: 80, health: 100, state: "idle" }
        ],
        pickups: [
            { id: "fuel_001", entityId: "fuel_001", kind: "fuel", pickupKind: "fuel", x: 835, y: 315, radius: 14, amount: 40, collected: false },
            { id: "fuel_002", entityId: "fuel_002", kind: "fuel", pickupKind: "fuel", x: 3070, y: 115, radius: 14, amount: 40, collected: false }
        ],
        inventory: {
            items: {}
        },
        statusEffects: {
            active: {}
        },
        collisions: {
            playerTouching: { left: false, right: false, up: false, down: false },
            lastResolution: null
        },
        story: {
            levelTitle: "Ignatius Rocketfrock and the Gallery of Sensibly Spaced Ledges",
            portalIntro: null,
            portalExit: null,
            mailboxEvent: null,
            mailboxEvents: [],
            levelTransitionRequest: null
        },
        debug: {
            paused: false,
            showHitboxes: false,
            showVelocity: false,
            showCollision: false,
            showAssetGuides: false,
            showPuppetGuide: false,
            showInput: true,
            eventFilterText: "-FUEL_CHANGED",
            eventFilterIncludeInput: false,
            inputConsoleLogging: false,
            lastEvents: [],
            lastInputFrame: createInputFrame(),
            exportedAt: null
        }
    };

    addEvent(state, "TEST_ARENA_CREATED", { solids: state.world.solids.length, segments: state.world.segments?.length ?? 0 });
    return state;
}

export function applyEnemyDefinitionCatalog(state, catalog) {
    if (!state || typeof state !== "object") return false;
    state.enemyCatalog = normalizeEnemyDefinitionCatalog(catalog);
    return Object.keys(state.enemyCatalog.enemies).length > 0;
}

function createTestArena(tuning) {
    // This is a compact headless-test fixture, not the browser game's authored level.
    // Browser play loads assets/level_001.json and replaces this world before play.
    // Keep this arena deliberately small: tests need a floor at y=600, side walls,
    // a valid atlas visual for optional manifest-collision checks, and a little room
    // for run/jump/rocket mechanics.
    const atlasId = "at_atlas_001";
    const solids = [
        { id: "left_wall", kind: "wall", x: -320, y: -520, w: 60, h: 1580 },
        { id: "right_wall", kind: "wall", x: 2360, y: -520, w: 60, h: 1580 },
        { id: "test_floor", kind: "floor", x: -260, y: 600, w: 2620, h: 110 }
    ];
    const visuals = [
        {
            id: "test_floor_art",
            kind: "atlasSprite",
            atlasId,
            assetId: "floor_cold_platform",
            frame: "floor_cold_platform",
            x: -260,
            y: 600,
            w: 2620,
            h: 110,
            layer: "terrain",
            collisionFromManifest: false,
            note: "Visual marker for the headless test arena. Authored gameplay levels come from assets/level_001.json."
        }
    ];

    return {
        levelId: "headless_test_arena",
        gravityDirection: { x: 0, y: 1 },
        bounds: { x: -360, y: -520, w: 2820, h: 1580 },
        resetY: 1080,
        start: { x: 135, y: 520 },
        atlasManifests: [
            "assets/at_atlas_001.json"
        ],
        visuals,
        movingPlatforms: [],
        signalChannels: {},
        signalEmitters: [],
        signalReceivers: [],
        caveWindow: normalizeCaveWindow(null),
        caveKillBoundary: deriveCaveFullBlackKillBoundary(null),
        solids,
        segments: [],
        collisionMode: "fallbackRectangles",
        labels: [
            { text: "headless test arena", x: 20, y: 555 },
            { text: "browser play loads assets/level_001.json", x: 520, y: 555 }
        ]
    };
}

export function applyAtlasManifestsToWorld(state, environmentManifests) {
    if (!state?.world || !environmentManifests || typeof environmentManifests.get !== "function") {
        return false;
    }

    const segments = [];
    const polygons = [];
    const visuals = Array.isArray(state.world.visuals) ? state.world.visuals : [];

    for (const visual of visuals) {
        if (visual.kind !== "atlasSprite" || visual.collisionFromManifest === false || visual.layer === "caveForeground") {
            continue;
        }

        const atlasRecord = environmentManifests.get(visual.atlasId);
        const manifest = atlasRecord?.manifest || atlasRecord;
        if (!manifest?.objects || !manifest?.frames) {
            continue;
        }

        const assetId = visual.assetId || visual.frame;
        const frameName = visual.frame || assetId;
        const object = manifest.objects[assetId] || manifest.objects[frameName];
        const frame = manifest.frames[frameName] || manifest.frames[assetId];
        if (!object || !frame || !Array.isArray(object.nodes) || !Array.isArray(object.lines)) {
            continue;
        }

        const nodeById = new Map(object.nodes.map((node) => [node.id, node]));
        for (const line of object.lines) {
            if (!isSolidSegmentKind(line.kind)) {
                continue;
            }

            const a = nodeById.get(line.from);
            const b = nodeById.get(line.to);
            if (!a || !b) {
                continue;
            }

            const p1 = atlasNodeToWorld(visual, frame, a);
            const p2 = atlasNodeToWorld(visual, frame, b);
            if (Math.hypot(p2.x - p1.x, p2.y - p1.y) < 1) {
                continue;
            }

            segments.push({
                id: `${visual.id || assetId}_${line.id || segments.length}`,
                kind: line.kind,
                x1: p1.x,
                y1: p1.y,
                x2: p2.x,
                y2: p2.y,
                visualId: visual.id,
                movingPlatformId: visual.movement ? visual.id : undefined,
                assetId,
                lineId: line.id,
                tags: Array.isArray(line.tags) ? line.tags.slice() : []
            });
        }

        const collisionLoops = findClosedCollisionLoops(object);
        for (const loop of collisionLoops) {
            const points = loop.points
                .map((point) => atlasNodeToWorld(visual, frame, point))
                .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
            if (points.length < 3 || Math.abs(polygonArea(points)) < 4) {
                continue;
            }
            polygons.push({
                id: `${visual.id || assetId}_area_${polygons.length}`,
                kind: loop.kind,
                points,
                visualId: visual.id,
                movingPlatformId: visual.movement ? visual.id : undefined,
                assetId,
                lineIds: loop.lineIds.slice()
            });
        }
    }

    if (!segments.length && !polygons.length) {
        state.world.collisionMode = "fallbackRectangles";
        state.world.collisionSegmentCount = 0;
        state.world.collisionPolygonCount = 0;
        state.world.collisionPolygons = [];
        return false;
    }

    state.world.segments = segments;
    state.world.collisionPolygons = polygons;
    bindMovingPlatformCollision(state, segments, polygons);
    state.world.solids = (state.world.solids || []).filter((solid) => solid.kind === "wall" || solid.reactiveObjectId || solid.signalReceiverId);
    state.world.collisionMode = polygons.length ? "atlasSegmentsAndAreas" : "atlasSegments";
    state.world.collisionSegmentCount = segments.length;
    state.world.collisionPolygonCount = polygons.length;
    let startSnap = null;
    let doorSnaps = [];
    let enemySnaps = [];
    if (!state.world.playerStartGroundSnapResolved) {
        state.world.playerStartGroundSnapResolved = true;
        doorSnaps = snapWizardDoorsToNearbyGround(state);
        enemySnaps = snapCharacterEnemiesToNearbyGround(state);
        const entryDoor = wizardEntryDoorEntity(state.world.entities || []);
        if (entryDoor) {
            applyEntryDoorAsPlayerStart(state, entryDoor, { resetPlayer: true });
            startSnap = snapPlayerStartToNearbyGround(state);
            configurePortalIntro(state, state.world.entities || []);
            configurePortalExit(state, state.world.entities || []);
        } else {
            startSnap = snapPlayerStartToNearbyGround(state);
        }
    }
    addEvent(state, "ATLAS_COLLISION_APPLIED", {
        segments: segments.length,
        polygons: polygons.length,
        playerStartSnapped: Boolean(startSnap),
        wizardDoorsSnapped: doorSnaps.length,
        characterEnemiesSnapped: enemySnaps.length
    });
    return true;
}

export function snapPlayerStartToNearbyGround(state, maxDistance = null) {
    const start = state?.world?.start;
    if (!start || !Number.isFinite(Number(start.x)) || !Number.isFinite(Number(start.y))) {
        return null;
    }

    const playerWidth = Math.max(1, Number(state.player?.width) || Number(state.tuning?.playerWidth) || DEFAULT_TUNING.playerWidth);
    const wizardHeight = Math.max(1, Number(state.player?.height) || Number(state.tuning?.wizardHeight) || DEFAULT_TUNING.wizardHeight);
    const requestedLimit = maxDistance === null || maxDistance === undefined ? wizardHeight * 0.5 : Number(maxDistance);
    const limit = Math.max(0, Number.isFinite(requestedLimit) ? requestedLimit : wizardHeight * 0.5);
    const startX = Number(start.x);
    const startY = Number(start.y);
    const samples = [startX, startX - playerWidth * 0.42, startX + playerWidth * 0.42];
    let best = null;

    const supportQueryBounds = {
        minX: Math.min(...samples) - 2,
        minY: startY - limit - 2,
        maxX: Math.max(...samples) + 2,
        maxY: startY + limit + 2
    };
    for (const segment of queryWorldSegments(state.world, supportQueryBounds)) {
        if (segment.kind !== "walkable" && segment.kind !== "blockable") {
            continue;
        }
        if (Math.abs(Number(segment.x2) - Number(segment.x1)) < 0.001) {
            continue;
        }
        for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
            const y = segmentYAtX(segment, samples[sampleIndex]);
            if (y === null) {
                continue;
            }
            const delta = y - startY;
            if (Math.abs(delta) > limit) {
                continue;
            }
            const score = Math.abs(delta) + sampleIndex * 0.001;
            if (!best || score < best.score) {
                best = { y, delta, score, segment, sampleX: samples[sampleIndex] };
            }
        }
    }

    if (!best) {
        return null;
    }

    start.y = best.y;
    if (state.player) {
        state.player.y = best.y;
        state.player.spawnY = best.y;
        state.player.vy = 0;
        state.player.onGround = true;
        state.player.wasOnGround = true;
    }
    const intro = state.story?.portalIntro;
    if (intro) {
        intro.groundY = best.y;
    }
    addEvent(state, "PLAYER_START_SNAPPED_TO_GROUND", {
        fromY: round(startY),
        toY: round(best.y),
        delta: round(best.delta),
        segmentId: best.segment.id,
        kind: best.segment.kind
    });
    return {
        fromY: startY,
        y: best.y,
        delta: best.delta,
        segmentId: best.segment.id,
        kind: best.segment.kind,
        sampleX: best.sampleX
    };
}

function atlasNodeToWorld(visual, frame, node) {
    return atlasNodeToPlacementWorld(visual, frame, node);
}


function findClosedCollisionLoops(object) {
    if (!object || !Array.isArray(object.nodes) || !Array.isArray(object.lines)) {
        return [];
    }

    const nodeById = new Map(object.nodes.map((node) => [node.id, node]));
    const blockerLines = object.lines.filter((line) => isAreaBlockingSegmentKind(line.kind) && nodeById.has(line.from) && nodeById.has(line.to));
    const loops = findClosedLoopsFromLines(blockerLines, nodeById);
    if (loops.length) {
        return loops;
    }

    const solidLines = object.lines.filter((line) => isSolidSegmentKind(line.kind) && nodeById.has(line.from) && nodeById.has(line.to));
    return findClosedLoopsFromLines(solidLines, nodeById).filter((loop) => loop.lines.some((line) => isAreaBlockingSegmentKind(line.kind)));
}

function findClosedLoopsFromLines(lines, nodeById) {
    const components = collectLineComponents(lines);
    const loops = [];

    for (const component of components) {
        if (component.length < 3) {
            continue;
        }
        const degree = new Map();
        for (const line of component) {
            degree.set(line.from, (degree.get(line.from) || 0) + 1);
            degree.set(line.to, (degree.get(line.to) || 0) + 1);
        }
        if ([...degree.values()].some((count) => count !== 2)) {
            continue;
        }

        const ordered = orderClosedLineLoop(component, nodeById);
        if (!ordered || ordered.points.length < 3) {
            continue;
        }
        const area = polygonArea(ordered.points);
        if (Math.abs(area) < 4) {
            continue;
        }
        loops.push({
            kind: collisionLoopKind(component),
            points: area < 0 ? ordered.points.slice().reverse() : ordered.points,
            lineIds: component.map((line) => line.id || ""),
            lines: component
        });
    }

    return loops;
}

function collectLineComponents(lines) {
    const byNode = new Map();
    for (const line of lines) {
        if (!byNode.has(line.from)) byNode.set(line.from, []);
        if (!byNode.has(line.to)) byNode.set(line.to, []);
        byNode.get(line.from).push(line);
        byNode.get(line.to).push(line);
    }

    const components = [];
    const seen = new Set();
    for (const line of lines) {
        const lineKey = line.id || `${line.from}->${line.to}`;
        if (seen.has(lineKey)) {
            continue;
        }
        const stack = [line];
        const component = [];
        while (stack.length) {
            const current = stack.pop();
            const key = current.id || `${current.from}->${current.to}`;
            if (seen.has(key)) {
                continue;
            }
            seen.add(key);
            component.push(current);
            for (const nodeId of [current.from, current.to]) {
                for (const next of byNode.get(nodeId) || []) {
                    const nextKey = next.id || `${next.from}->${next.to}`;
                    if (!seen.has(nextKey)) {
                        stack.push(next);
                    }
                }
            }
        }
        components.push(component);
    }
    return components;
}

function orderClosedLineLoop(lines, nodeById) {
    const adjacency = new Map();
    for (const line of lines) {
        if (!adjacency.has(line.from)) adjacency.set(line.from, []);
        if (!adjacency.has(line.to)) adjacency.set(line.to, []);
        adjacency.get(line.from).push({ to: line.to, line });
        adjacency.get(line.to).push({ to: line.from, line });
    }

    const start = lines[0].from;
    let current = start;
    let previous = null;
    const used = new Set();
    const points = [];

    for (let guard = 0; guard < lines.length + 2; guard += 1) {
        const node = nodeById.get(current);
        if (!node) {
            return null;
        }
        points.push({ x: node.x, y: node.y });
        const candidates = adjacency.get(current) || [];
        const nextEdge = candidates.find((candidate) => {
            const key = candidate.line.id || `${candidate.line.from}->${candidate.line.to}`;
            return candidate.to !== previous && !used.has(key);
        }) || candidates.find((candidate) => {
            const key = candidate.line.id || `${candidate.line.from}->${candidate.line.to}`;
            return !used.has(key);
        });
        if (!nextEdge) {
            return null;
        }
        const key = nextEdge.line.id || `${nextEdge.line.from}->${nextEdge.line.to}`;
        used.add(key);
        previous = current;
        current = nextEdge.to;
        if (current === start) {
            return used.size === lines.length ? { points } : null;
        }
    }

    return null;
}

function collisionLoopKind(lines) {
    if (lines.some((line) => line.kind === "killable")) return "killable";
    if (lines.some((line) => line.kind === "damaging")) return "damaging";
    return "blockable";
}

function polygonArea(points) {
    let area = 0;
    for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        area += a.x * b.y - b.x * a.y;
    }
    return area * 0.5;
}


function normalizeAtlasManifestPath(path) {
    return String(path || "");
}

function normalizeAtlasId(atlasId) {
    return String(atlasId || "");
}

function editorEntityVisuals(entity) {
    if (!entity || typeof entity !== "object") return [];
    const states = entity.visualStates && typeof entity.visualStates === "object" ? entity.visualStates : null;
    const selected = states ? states[entity.state] || states[Object.keys(states)[0]] : null;
    if (Array.isArray(selected)) return selected;
    if (Array.isArray(selected?.visuals)) return selected.visuals;
    if (Array.isArray(entity.visuals)) return entity.visuals;
    if (entity.visual && typeof entity.visual === "object") return [entity.visual];
    return [];
}

function editorEntityVisualToWorld(entity, visual, index, stateName = entity.state || "") {
    const baseW = Math.max(1, Number(entity.w) || 42);
    const baseH = Math.max(1, Number(entity.h) || 80);
    const widthFactor = Number(visual.widthFactor ?? 1) || 1;
    const heightFactor = Number(visual.heightFactor ?? 1) || 1;
    const w = Math.max(1, baseW * widthFactor);
    const h = Math.max(1, baseH * heightFactor);
    const direction = entity.mirrorX ? -1 : 1;
    const offsetX = ((Number(visual.offsetX) || 0) + (Number(visual.offsetXFactor) || 0) * baseW) * direction;
    const offsetY = (Number(visual.offsetY) || 0) + (Number(visual.offsetYFactor) || 0) * baseH;
    const floorAnchorYFactor = entityFloorAnchorYFactor(entity);
    return {
        id: `${entity.id || entity.type || "entity"}_${stateName || "default"}_visual_${index + 1}`,
        kind: "atlasSprite",
        atlasId: normalizeAtlasId(visual.atlasId || "it_atlas_001"),
        assetId: visual.assetId,
        frame: visual.frame || visual.assetId,
        x: (Number(entity.x) || 0) + offsetX - w * 0.5,
        y: (Number(entity.y) || 0) + offsetY - h * floorAnchorYFactor,
        w,
        h,
        mirrorX: Boolean(entity.mirrorX) !== Boolean(visual.mirrorX),
        mirrorY: Boolean(entity.mirrorY) !== Boolean(visual.mirrorY),
        rotation: normalizeRotationRadians(visual.rotation, visual.angle) + normalizeRotationRadians(entity.rotation, entity.angle),
        alpha: Number(visual.alpha ?? 1),
        layer: visual.layer || "decorFront",
        collisionFromManifest: entity.collisionFromManifest !== false && visual.collisionFromManifest !== false,
        entityId: entity.id || "",
        entityType: entity.type || entity.kind || "",
        entityState: stateName || ""
    };
}

function worldEntityById(state, entityId) {
    return (state.world?.entities || []).find((entity) => entity.id === entityId) || null;
}

export function setWorldEntityState(state, entityId, nextState) {
    const entity = worldEntityById(state, entityId);
    if (!entity || !entity.visualStates || !entity.visualStates[nextState]) {
        return false;
    }
    entity.state = nextState;
    if (!state.world.entityStates) state.world.entityStates = {};
    state.world.entityStates[entityId] = nextState;
    state.world.visuals = (state.world.visuals || []).filter((visual) => visual.entityId !== entityId);
    const visuals = editorEntityVisuals(entity);
    visuals.forEach((visual, index) => {
        if (visual?.assetId) state.world.visuals.push(editorEntityVisualToWorld(entity, visual, index, nextState));
    });
    state.world.visuals.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return true;
}

function isReactiveWorldEntity(entity) {
    const type = String(entity?.type || entity?.kind || "");
    return entity?.reactiveKind === "destructible" ||
        type === "breakableCrate" ||
        type === "destructibleBarrier";
}

function reactiveObjectCollisionRect(object) {
    const width = Math.max(1, Number(object?.width) || 1);
    const height = Math.max(1, Number(object?.height) || 1);
    const insetX = clamp(Number(object?.collisionInsetX) || 0, 0, width * 0.45);
    const insetTop = clamp(Number(object?.collisionInsetTop) || 0, 0, height * 0.9);
    const insetBottom = clamp(Number(object?.collisionInsetBottom) || 0, 0, height * 0.9 - insetTop);
    return {
        x: (Number(object?.x) || 0) - width * 0.5 + insetX,
        y: (Number(object?.y) || 0) - height + insetTop,
        w: Math.max(1, width - insetX * 2),
        h: Math.max(1, height - insetTop - insetBottom)
    };
}

function reactiveObjectStateIsActive(object) {
    return object?.state !== "destroyed" && object?.state !== "inactive" && Number(object?.health) > 0;
}

function reactiveObjectBlocksPlayer(object) {
    if (!object?.blocksPlayer || !reactiveObjectStateIsActive(object)) return false;
    const states = Array.isArray(object.collisionStates) ? object.collisionStates : null;
    return !states || states.includes(object.state);
}

function reactiveObjectBlocksProjectiles(object) {
    if (!object?.blocksProjectiles || !reactiveObjectStateIsActive(object)) return false;
    const states = Array.isArray(object.projectileCollisionStates) ? object.projectileCollisionStates : object.collisionStates;
    return !Array.isArray(states) || states.includes(object.state);
}

function syncReactiveObjectCollision(state, object) {
    if (!state?.world || !object?.id) return;
    state.world.solids = (state.world.solids || []).filter((solid) => solid.reactiveObjectId !== object.id);
    if (!reactiveObjectBlocksPlayer(object)) return;
    state.world.solids.push({
        id: `${object.id}_reactive_solid`,
        kind: "reactiveObject",
        reactiveObjectId: object.id,
        ...reactiveObjectCollisionRect(object)
    });
}

function setReactiveObjectState(state, object, nextState) {
    if (!object || object.state === nextState) return false;
    const previousState = object.state;
    object.state = nextState;
    const sourceEntity = worldEntityById(state, object.entityId || object.id);
    if (sourceEntity) {
        sourceEntity.state = nextState;
        sourceEntity.health = object.health;
        if (!setWorldEntityState(state, sourceEntity.id, nextState)) {
            if (!state.world.entityStates) state.world.entityStates = {};
            state.world.entityStates[sourceEntity.id] = nextState;
        }
    }
    syncReactiveObjectCollision(state, object);
    addEvent(state, "REACTIVE_OBJECT_STATE_CHANGED", {
        objectId: object.id,
        previousState,
        state: nextState,
        health: round(object.health)
    });
    return true;
}

function isWizardEntryDoor(entity) {
    return Boolean(entity) && (entity.type === "wizard_entry_door" || entity.kind === "wizard_entry_door");
}

function isWizardExitDoor(entity) {
    return Boolean(entity) && (entity.type === "wizard_exit_door" || entity.kind === "wizard_exit_door");
}

function hasLivingBoss(state) {
    return (state?.enemies || []).some((enemy) => enemy?.isBoss === true && Number(enemy.health) > 0);
}

function isWizardDoor(entity) {
    return isWizardEntryDoor(entity) || isWizardExitDoor(entity);
}

function entityFloorAnchorYFactor(entity) {
    const authored = Number(entity?.floorAnchorYFactor);
    if (Number.isFinite(authored)) return clamp(authored, 0, 1);
    return isWizardDoor(entity) ? WIZARD_DOOR_FLOOR_ANCHOR_Y_FACTOR : 1;
}

function wizardDoorInsideScale(entity) {
    const authored = Number(entity?.wizardInsideScale);
    return clamp(Number.isFinite(authored) ? authored : DEFAULT_WIZARD_DOOR_INSIDE_SCALE, 0.5, 1);
}

function wizardEntryDoorEntity(entities) {
    return (entities || []).find(isWizardEntryDoor) || null;
}

function wizardExitDoorEntity(entities) {
    return (entities || []).find(isWizardExitDoor) || null;
}

export function defaultNextLevelId(levelId) {
    const match = /^level_(\d+)$/i.exec(String(levelId || ""));
    if (!match) return "level_001";
    return `level_${String(Number(match[1]) + 1).padStart(match[1].length, "0")}`;
}

function doorWalkDirection(door, fallback = 1) {
    const value = Number(door?.walkDirection ?? door?.exitDirection);
    if (value < 0) return -1;
    if (value > 0) return 1;
    return fallback < 0 ? -1 : 1;
}

function refreshEntityVisuals(state, entity) {
    if (!entity?.id) return;
    state.world.visuals = (state.world.visuals || []).filter((visual) => visual.entityId !== entity.id);
    editorEntityVisuals(entity).forEach((visual, index) => {
        if (visual?.assetId) state.world.visuals.push(editorEntityVisualToWorld(entity, visual, index, entity.state || ""));
    });
    state.world.visuals.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function snapEntityBaselineToNearbyGround(state, entity, maxDistance = null) {
    if (!entity || !Number.isFinite(Number(entity.x)) || !Number.isFinite(Number(entity.y))) return null;
    const wizardHeight = Math.max(1, Number(state.player?.height) || Number(state.tuning?.wizardHeight) || DEFAULT_TUNING.wizardHeight);
    const requested = maxDistance ?? entity.groundSnapDistance ?? wizardHeight * 0.5;
    const limit = Math.max(0, Number(requested) || wizardHeight * 0.5);
    const width = Math.max(16, Number(entity.w) || Number(state.player?.width) || 36);
    const x = Number(entity.x);
    const y = Number(entity.y);
    const samples = [x, x - width * 0.32, x + width * 0.32];
    let best = null;
    const supportQueryBounds = {
        minX: Math.min(...samples) - 2,
        minY: y - limit - 2,
        maxX: Math.max(...samples) + 2,
        maxY: y + limit + 2
    };
    for (const segment of queryWorldSegments(state.world, supportQueryBounds)) {
        if (segment.kind !== "walkable" && segment.kind !== "blockable") continue;
        if (Math.abs(Number(segment.x2) - Number(segment.x1)) < 0.001) continue;
        for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
            const supportY = segmentYAtX(segment, samples[sampleIndex]);
            if (supportY === null) continue;
            const delta = supportY - y;
            if (Math.abs(delta) > limit) continue;
            const score = Math.abs(delta) + sampleIndex * 0.001;
            if (!best || score < best.score) best = { supportY, delta, score, segment };
        }
    }
    if (!best) return null;
    entity.y = best.supportY;
    refreshEntityVisuals(state, entity);
    addEvent(state, "WIZARD_DOOR_SNAPPED_TO_GROUND", {
        doorId: entity.id,
        fromY: round(y),
        toY: round(best.supportY),
        delta: round(best.delta),
        segmentId: best.segment.id
    });
    return { entityId: entity.id, fromY: y, y: best.supportY, delta: best.delta, segmentId: best.segment.id };
}

export function snapWizardDoorsToNearbyGround(state) {
    const results = [];
    for (const entity of state.world?.entities || []) {
        if (!isWizardEntryDoor(entity) && !isWizardExitDoor(entity)) continue;
        const result = snapEntityBaselineToNearbyGround(state, entity);
        if (result) results.push(result);
    }
    return results;
}

function applyEntryDoorAsPlayerStart(state, entryDoor, { resetPlayer = false } = {}) {
    if (!entryDoor) return false;
    const direction = doorWalkDirection(entryDoor, 1);
    const distance = Math.max(48, Number(entryDoor.emergeDistance) || Math.max(120, Number(entryDoor.w) || 150));
    const start = {
        x: Number(entryDoor.x) + direction * distance,
        y: Number(entryDoor.y)
    };
    state.world.start = start;
    if (resetPlayer && state.player) {
        state.player.x = start.x;
        state.player.y = start.y;
        state.player.spawnX = start.x;
        state.player.spawnY = start.y;
        state.player.vx = 0;
        state.player.vy = 0;
        state.player.renderScale = 1;
        state.player.onGround = true;
        state.player.wasOnGround = true;
        state.camera.x = start.x;
        state.camera.y = start.y - 170;
    }
    return true;
}

function configurePortalIntro(state, entities) {
    const portal = wizardEntryDoorEntity(entities);
    if (!portal) {
        state.story.portalIntro = null;
        state.player.visible = true;
        state.player.renderScale = 1;
        return false;
    }

    const finalX = state.world.start.x;
    const finalY = state.world.start.y;
    const direction = doorWalkDirection(portal, 1);
    const hiddenX = Number(portal.x || 0) - direction * Math.max(12, Number(portal.w || 150) * 0.08);
    const distance = Math.abs(finalX - hiddenX);
    const walkSpeed = Math.max(40, Number(portal.walkSpeed) || 105);
    const walkDuration = Math.max(0.7, distance / walkSpeed);

    state.story.portalIntro = {
        active: true,
        portalId: portal.id,
        phase: "closed",
        phaseTime: 0,
        direction,
        insideScale: wizardDoorInsideScale(portal),
        hiddenX,
        finalX,
        groundY: finalY,
        walkDuration,
        closedDuration: Math.max(0, Number(portal.closedDuration) || 0.55),
        openDuration: Math.max(0.05, Number(portal.openDuration) || 0.38),
        clearDuration: Math.max(0, Number(portal.clearDuration) || 0.28),
        closeDuration: Math.max(0.05, Number(portal.closeDuration) || 0.42)
    };
    setWorldEntityState(state, portal.id, "closed");
    state.player.visible = false;
    state.player.renderScale = state.story.portalIntro.insideScale;
    state.player.x = hiddenX;
    state.player.y = finalY;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.facing = direction;
    state.player.onGround = true;
    state.player.wasOnGround = true;
    state.camera.x = Number(portal.x) || finalX;
    state.camera.y = finalY - 170;
    addEvent(state, "PORTAL_INTRO_STARTED", { portalId: portal.id });
    return true;
}

function advancePortalIntroPhase(state, intro, phase) {
    intro.phase = phase;
    intro.phaseTime = 0;
    if (phase === "opening") {
        setWorldEntityState(state, intro.portalId, "open");
        addEvent(state, "PORTAL_OPENED", { portalId: intro.portalId });
    } else if (phase === "emerging") {
        state.player.visible = true;
        addEvent(state, "PLAYER_EMERGING_FROM_PORTAL", { portalId: intro.portalId });
    } else if (phase === "closing") {
        addEvent(state, "PORTAL_CLOSING", { portalId: intro.portalId });
    } else if (phase === "complete") {
        setWorldEntityState(state, intro.portalId, "closed");
        intro.active = false;
        state.player.visible = true;
        state.player.renderScale = 1;
        state.player.x = intro.finalX;
        state.player.y = intro.groundY;
        state.player.vx = 0;
        state.player.vy = 0;
        state.player.onGround = true;
        state.player.wasOnGround = true;
        state.player.spawnX = intro.finalX;
        state.player.spawnY = intro.groundY;
        addEvent(state, "PORTAL_INTRO_COMPLETE", { portalId: intro.portalId });
    }
}

function updatePortalIntro(state, dt) {
    const intro = state.story?.portalIntro;
    if (!intro?.active) return false;

    const p = state.player;
    intro.phaseTime += dt;
    p.ax = 0;
    p.ay = 0;
    p.vy = 0;
    p.facing = intro.direction;
    p.onGround = true;
    p.wasOnGround = true;

    if (intro.phase === "closed") {
        p.visible = false;
        p.renderScale = intro.insideScale;
        p.x = intro.hiddenX;
        p.vx = 0;
        if (intro.phaseTime >= intro.closedDuration) advancePortalIntroPhase(state, intro, "opening");
    } else if (intro.phase === "opening") {
        p.visible = false;
        p.renderScale = intro.insideScale;
        p.x = intro.hiddenX;
        p.vx = 0;
        if (intro.phaseTime >= intro.openDuration) advancePortalIntroPhase(state, intro, "emerging");
    } else if (intro.phase === "emerging") {
        const t = clamp(intro.phaseTime / Math.max(0.001, intro.walkDuration), 0, 1);
        const eased = t * t * (3 - 2 * t);
        p.visible = true;
        p.renderScale = intro.insideScale + (1 - intro.insideScale) * eased;
        p.x = intro.hiddenX + (intro.finalX - intro.hiddenX) * eased;
        p.y = intro.groundY;
        p.vx = (intro.finalX - intro.hiddenX) / Math.max(0.001, intro.walkDuration);
        if (t >= 1) advancePortalIntroPhase(state, intro, "clear");
    } else if (intro.phase === "clear") {
        p.visible = true;
        p.renderScale = 1;
        p.x = intro.finalX;
        p.y = intro.groundY;
        p.vx = 0;
        if (intro.phaseTime >= intro.clearDuration) advancePortalIntroPhase(state, intro, "closing");
    } else if (intro.phase === "closing") {
        p.visible = true;
        p.renderScale = 1;
        p.x = intro.finalX;
        p.y = intro.groundY;
        p.vx = 0;
        if (intro.phaseTime >= intro.closeDuration * 0.5 && state.world.entityStates?.[intro.portalId] !== "closed") {
            setWorldEntityState(state, intro.portalId, "closed");
            addEvent(state, "PORTAL_CLOSED", { portalId: intro.portalId });
        }
        if (intro.phaseTime >= intro.closeDuration) advancePortalIntroPhase(state, intro, "complete");
    }

    state.camera.x += (p.x + 80 * intro.direction - state.camera.x) * Math.min(1, dt * 5);
    state.camera.y += (p.y - 170 - state.camera.y) * Math.min(1, dt * 5);
    return true;
}

function configurePortalExit(state, entities) {
    const portal = wizardExitDoorEntity(entities);
    if (!portal) {
        state.story.portalExit = null;
        return false;
    }
    const direction = doorWalkDirection(portal, 1);
    const requestedDestination = String(portal.destinationLevel || portal.destination || "").trim();
    state.story.portalExit = {
        active: false,
        completed: false,
        portalId: portal.id,
        phase: "armed",
        phaseTime: 0,
        direction,
        insideScale: wizardDoorInsideScale(portal),
        triggerDistance: Math.max(24, Number(portal.triggerDistance) || 96),
        verticalTolerance: Math.max(32, Number(portal.verticalTolerance) || Math.max(state.player.height, Number(portal.h) || 197)),
        walkSpeed: Math.max(40, Number(portal.walkSpeed) || 105),
        openDuration: Math.max(0.05, Number(portal.openDuration) || 0.38),
        closeDuration: Math.max(0.05, Number(portal.closeDuration) || 0.42),
        requestedLevelId: requestedDestination || defaultNextLevelId(state.world.levelId),
        approachX: null,
        hiddenX: Number(portal.x || 0) + direction * Math.max(10, Number(portal.w || 150) * 0.10),
        groundY: Number(portal.y) || state.player.y
    };
    setWorldEntityState(state, portal.id, "closed");
    return true;
}

function startPortalExit(state, exit) {
    exit.active = true;
    exit.phase = "opening";
    exit.phaseTime = 0;
    exit.approachX = state.player.x;
    exit.groundY = Number(worldEntityById(state, exit.portalId)?.y) || state.player.y;
    setWorldEntityState(state, exit.portalId, "open");
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.renderScale = 1;
    addEvent(state, "PORTAL_EXIT_OPENED", { portalId: exit.portalId, destinationLevel: exit.requestedLevelId });
}

function updatePortalExit(state, dt) {
    const exit = state.story?.portalExit;
    if (!exit || exit.completed) return false;
    const portal = worldEntityById(state, exit.portalId);
    if (!portal) return false;

    if (!exit.active) {
        if (hasLivingBoss(state)) {
            exit.lockedByBoss = true;
            if (state.world.entityStates?.[exit.portalId] !== "closed") {
                setWorldEntityState(state, exit.portalId, "closed");
            }
            return false;
        }
        exit.lockedByBoss = false;
        const horizontalDistance = Math.abs(state.player.x - Number(portal.x || 0));
        const verticalDistance = Math.abs(state.player.y - Number(portal.y || 0));
        if (horizontalDistance > exit.triggerDistance || verticalDistance > exit.verticalTolerance) return false;
        startPortalExit(state, exit);
    }

    const p = state.player;
    exit.phaseTime += dt;
    p.ax = 0;
    p.ay = 0;
    p.vy = 0;
    p.onGround = true;
    p.wasOnGround = true;
    p.facing = exit.direction;

    if (exit.phase === "opening") {
        p.vx = 0;
        p.renderScale = 1;
        if (exit.phaseTime >= exit.openDuration) {
            exit.phase = "entering";
            exit.phaseTime = 0;
            exit.walkDuration = Math.max(0.55, Math.abs(exit.hiddenX - exit.approachX) / exit.walkSpeed);
            addEvent(state, "PLAYER_ENTERING_PORTAL", { portalId: exit.portalId });
        }
    } else if (exit.phase === "entering") {
        const t = clamp(exit.phaseTime / Math.max(0.001, exit.walkDuration), 0, 1);
        const eased = t * t * (3 - 2 * t);
        p.visible = true;
        p.renderScale = 1 + (exit.insideScale - 1) * eased;
        p.x = exit.approachX + (exit.hiddenX - exit.approachX) * eased;
        p.y = exit.groundY;
        p.vx = (exit.hiddenX - exit.approachX) / Math.max(0.001, exit.walkDuration);
        if (t >= 1) {
            p.visible = false;
            p.vx = 0;
            exit.phase = "closing";
            exit.phaseTime = 0;
        }
    } else if (exit.phase === "closing") {
        p.visible = false;
        p.renderScale = exit.insideScale;
        p.x = exit.hiddenX;
        p.y = exit.groundY;
        p.vx = 0;
        if (exit.phaseTime >= exit.closeDuration * 0.5 && state.world.entityStates?.[exit.portalId] !== "closed") {
            setWorldEntityState(state, exit.portalId, "closed");
        }
        if (exit.phaseTime >= exit.closeDuration) {
            exit.phase = "awaitingLevel";
            exit.completed = true;
            p.renderScale = 1;
            state.story.levelTransitionRequest = {
                portalId: exit.portalId,
                requestedLevelId: exit.requestedLevelId,
                fallbackLevelId: state.world.levelId
            };
            addEvent(state, "LEVEL_TRANSITION_REQUESTED", state.story.levelTransitionRequest);
        }
    }

    state.camera.x += (Number(portal.x) - state.camera.x) * Math.min(1, dt * 5);
    state.camera.y += (exit.groundY - 170 - state.camera.y) * Math.min(1, dt * 5);
    return true;
}

function mailboxStoryEntities(entities) {
    return (entities || []).filter((entity) => {
        const mailbox = (entity.type === "mailbox" || entity.kind === "mailbox")
            && (entity.interaction === "editorLetter" || entity.mailboxRole === "editorLetter");
        const locationThought = (entity.type === "thoughtTrigger" || entity.kind === "thoughtTrigger")
            && entity.interaction === "locationThought";
        return mailbox || locationThought;
    });
}

function normalizeMailboxThoughtText(mailbox) {
    const thoughtText = String(mailbox?.thoughtText || "").trim();
    return thoughtText || "How kind of him! I hope I can make him proud. This cave doesn’t look quite like it did in the brochures, but I’m sure it will be fine.";
}

function mailboxStoryRecord(state, mailbox) {
    const locationThought = (mailbox.type === "thoughtTrigger" || mailbox.kind === "thoughtTrigger")
        && mailbox.interaction === "locationThought";
    const initialState = mailbox.state || (locationThought ? "available" : "letterAvailable");
    const consumedState = locationThought ? "consumed" : "empty";
    const letterText = locationThought ? "" : (mailbox.letterText || "Dear Ignatius,\n\nPlease proceed boldly!\n\nSincerely,\nYour humble editor,\nWilfred of Bittervine");
    const thoughtText = normalizeMailboxThoughtText(mailbox);
    const completed = initialState === consumedState;
    return {
        active: false,
        completed,
        storyKind: locationThought ? "locationThought" : "mailbox",
        consumedState,
        mailboxId: mailbox.id,
        phase: completed ? "complete" : "armed",
        phaseTime: 0,
        triggerDistance: Math.max(8, Number(mailbox.triggerDistance) || 72),
        verticalTolerance: Math.max(24, Number(mailbox.verticalTolerance) || Math.max(state.player.height * 0.75, Number(mailbox.h) || 80)),
        readingCharactersPerSecond: STORY_READING_CHARACTERS_PER_SECOND,
        letterCharacterCount: storyCharacterCount(letterText),
        thoughtCharacterCount: storyCharacterCount(thoughtText),
        letterDuration: storyReadingDuration(letterText),
        thoughtDuration: storyReadingDuration(thoughtText),
        letterAtlasId: mailbox.letterAtlasId || "it_atlas_001",
        letterAssetId: mailbox.letterAssetId || "letter_scroll",
        thoughtAtlasId: mailbox.thoughtAtlasId || "it_atlas_001",
        thoughtAssetId: mailbox.thoughtAssetId || "thought_bubble_large",
        letterTitle: mailbox.letterTitle || "A Letter from Your Humble Editor",
        letterText,
        thoughtText,
        startedAt: null,
        completedAt: null
    };
}

function configureMailboxStory(state, entities) {
    state.story.mailboxEvents = mailboxStoryEntities(entities).map((mailbox) => mailboxStoryRecord(state, mailbox));
    state.story.mailboxEvent = null;
    return state.story.mailboxEvents.length > 0;
}

function startMailboxStory(state, story) {
    story.active = true;
    story.completed = false;
    story.phase = story.storyKind === "locationThought" ? "thought" : "letter";
    story.phaseTime = 0;
    story.startedAt = state.clock.time;
    state.story.mailboxEvent = story;
    setWorldEntityState(state, story.mailboxId, story.consumedState || "empty");
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.ax = 0;
    state.player.ay = 0;
    if (story.storyKind === "locationThought") {
        addEvent(state, "LOCATION_THOUGHT_TRIGGERED", { triggerId: story.mailboxId });
    } else {
        addEvent(state, "MAILBOX_LETTER_OPENED", { mailboxId: story.mailboxId });
    }
}

function advanceMailboxStory(state, story, phase, reason) {
    story.phase = phase;
    story.phaseTime = 0;
    if (phase === "thought") {
        const eventType = story.storyKind === "locationThought" ? "LOCATION_THOUGHT_SHOWN" : "MAILBOX_THOUGHT_SHOWN";
        addEvent(state, eventType, story.storyKind === "locationThought"
            ? { triggerId: story.mailboxId, reason }
            : { mailboxId: story.mailboxId, reason });
    } else if (phase === "complete") {
        story.active = false;
        story.completed = true;
        story.completedAt = state.clock.time;
        state.player.vx = 0;
        state.player.vy = 0;
        state.story.mailboxEvent = null;
        const eventType = story.storyKind === "locationThought" ? "LOCATION_THOUGHT_COMPLETE" : "MAILBOX_EVENT_COMPLETE";
        addEvent(state, eventType, story.storyKind === "locationThought"
            ? { triggerId: story.mailboxId, reason }
            : { mailboxId: story.mailboxId, reason });
    }
}

function updateMailboxStory(state, input, dt) {
    let story = state.story?.mailboxEvent || null;
    if (!story) {
        for (const candidate of state.story?.mailboxEvents || []) {
            if (candidate.completed || candidate.active) continue;
            const mailbox = worldEntityById(state, candidate.mailboxId);
            if (!mailbox) continue;
            const horizontalDistance = Math.abs(state.player.x - (Number(mailbox.x) || 0));
            const verticalDistance = Math.abs(state.player.y - (Number(mailbox.y) || 0));
            if (horizontalDistance <= candidate.triggerDistance && verticalDistance <= candidate.verticalTolerance) {
                story = candidate;
                startMailboxStory(state, story);
                break;
            }
        }
        if (!story) return false;
    }

    const mailbox = worldEntityById(state, story.mailboxId);
    if (!mailbox) {
        story.completed = true;
        story.phase = "complete";
        state.story.mailboxEvent = null;
        return false;
    }

    const startedThisFrame = story.phaseTime === 0 && story.startedAt === state.clock.time;
    const p = state.player;
    story.phaseTime += dt;
    p.ax = 0;
    p.ay = 0;
    p.vx = 0;
    p.vy = 0;
    p.onGround = true;
    p.wasOnGround = true;

    const skipped = !startedThisFrame && Boolean(input.jumpPressed || input.weaponPressed);
    if (story.phase === "letter" && (skipped || story.phaseTime >= story.letterDuration)) {
        if (story.thoughtText.trim()) advanceMailboxStory(state, story, "thought", skipped ? "jump" : "timeout");
        else advanceMailboxStory(state, story, "complete", skipped ? "jump" : "timeout");
    } else if (story.phase === "thought" && (skipped || story.phaseTime >= story.thoughtDuration)) {
        advanceMailboxStory(state, story, "complete", skipped ? "jump" : "timeout");
    }

    const focusX = story.phase === "thought"
        ? p.x + 165
        : (p.x + (Number(mailbox.x) || p.x)) * 0.5;
    state.camera.x += (focusX - state.camera.x) * Math.min(1, dt * 5);
    state.camera.y += (p.y - 170 - state.camera.y) * Math.min(1, dt * 5);
    return true;
}


function signalChannelRecord(state, channel, create = false) {
    if (!state?.world) return null;
    const normalizedChannel = normalizeSignalChannel(channel);
    if (!state.world.signalChannels || typeof state.world.signalChannels !== "object") {
        if (!create) return null;
        state.world.signalChannels = {};
    }
    if (!state.world.signalChannels[normalizedChannel] && create) {
        state.world.signalChannels[normalizedChannel] = {
            channel: normalizedChannel,
            active: false,
            revision: 0,
            lastSourceId: null,
            lastEmittedAt: null
        };
    }
    return state.world.signalChannels[normalizedChannel] || null;
}

export function emitSignalChannel(state, channel, options = {}) {
    const record = signalChannelRecord(state, channel, true);
    if (!record) return null;
    const nextActive = options.toggle === true
        ? !record.active
        : options.active === undefined
            ? record.active
            : Boolean(options.active);
    record.active = nextActive;
    record.revision += 1;
    record.lastSourceId = options.sourceId ? String(options.sourceId) : null;
    record.lastEmittedAt = state.clock?.time ?? 0;
    addEvent(state, "SIGNAL_CHANNEL_EMITTED", {
        channel: record.channel,
        active: record.active,
        revision: record.revision,
        sourceId: record.lastSourceId
    });
    return record;
}

function signalReceiverCollisionRect(receiver) {
    const width = Math.max(1, Number(receiver?.collisionWidth) || Number(receiver?.width) || 1);
    const height = Math.max(1, Number(receiver?.collisionHeight) || Number(receiver?.height) || 1);
    const offsetX = Number(receiver?.collisionOffsetX) || 0;
    const offsetY = Number(receiver?.collisionOffsetY) || 0;
    const insetX = clamp(Number(receiver?.collisionInsetX) || 0, 0, width * 0.45);
    const insetTop = clamp(Number(receiver?.collisionInsetTop) || 0, 0, height * 0.9);
    const insetBottom = clamp(Number(receiver?.collisionInsetBottom) || 0, 0, height * 0.9 - insetTop);
    return {
        x: (Number(receiver?.x) || 0) + offsetX - width * 0.5 + insetX,
        y: (Number(receiver?.y) || 0) + offsetY - height + insetTop,
        w: Math.max(1, width - insetX * 2),
        h: Math.max(1, height - insetTop - insetBottom)
    };
}

function syncSignalReceiverCollision(state, receiver) {
    if (!state?.world || !receiver?.id) return;
    state.world.solids = (state.world.solids || []).filter((solid) => solid.signalReceiverId !== receiver.id);
    if (!receiver.blocksPlayer || receiver.open) return;
    state.world.solids.push({
        id: `${receiver.id}_signal_solid`,
        kind: "signalGate",
        signalReceiverId: receiver.id,
        ...signalReceiverCollisionRect(receiver)
    });
}

function updateSignalReceivers(state) {
    for (const receiver of state.world?.signalReceivers || []) {
        const channel = signalChannelRecord(state, receiver.channel, true);
        const open = receiver.invertSignal ? !channel.active : channel.active;
        if (receiver.open === open) continue;
        receiver.open = open;
        const nextState = open ? receiver.openState : receiver.closedState;
        if (!setWorldEntityState(state, receiver.id, nextState)) {
            const entity = worldEntityById(state, receiver.id);
            if (entity) entity.state = nextState;
            state.world.entityStates[receiver.id] = nextState;
        }
        syncSignalReceiverCollision(state, receiver);
        addEvent(state, open ? "SIGNAL_GATE_OPENED" : "SIGNAL_GATE_CLOSED", {
            gateId: receiver.id,
            channel: receiver.channel,
            state: nextState
        });
    }
}

function configureSignalSystem(state, entities = []) {
    if (!state?.world) return;
    state.world.signalChannels = {};
    state.world.signalEmitters = entities
        .filter(isSignalEmitterEntity)
        .map((entity) => normalizeSignalEmitter(entity))
        .filter(Boolean);
    state.world.signalReceivers = entities
        .filter(isSignalReceiverEntity)
        .map((entity) => normalizeSignalReceiver(entity))
        .filter(Boolean)
        .map((receiver) => ({ ...receiver, open: false }));
    for (const emitter of state.world.signalEmitters) {
        signalChannelRecord(state, emitter.channel, true);
    }
    for (const receiver of state.world.signalReceivers) {
        signalChannelRecord(state, receiver.channel, true);
        syncSignalReceiverCollision(state, receiver);
    }
    for (const platform of state.world.movingPlatforms || []) {
        if (platform.movement?.activation === "signal") {
            signalChannelRecord(state, platform.movement.signalChannel, true);
        }
    }
    updateSignalReceivers(state);
}

function inventoryItemCount(state, itemId) {
    return Math.max(0, Number(state.inventory?.items?.[String(itemId || "")]) || 0);
}

function addInventoryItem(state, itemId, amount = 1) {
    const id = String(itemId || "").trim();
    if (!id) return 0;
    if (!state.inventory || typeof state.inventory !== "object") state.inventory = { items: {} };
    if (!state.inventory.items || typeof state.inventory.items !== "object") state.inventory.items = {};
    const next = inventoryItemCount(state, id) + Math.max(0, Math.floor(Number(amount) || 0));
    state.inventory.items[id] = next;
    return next;
}

function consumeInventoryItem(state, itemId, amount = 1) {
    const id = String(itemId || "").trim();
    const requested = Math.max(0, Math.floor(Number(amount) || 0));
    const current = inventoryItemCount(state, id);
    if (!id || requested <= 0 || current < requested) return false;
    const next = current - requested;
    if (next > 0) state.inventory.items[id] = next;
    else delete state.inventory.items[id];
    return true;
}

function ensureStatusEffects(state) {
    if (!state.statusEffects || typeof state.statusEffects !== "object") {
        state.statusEffects = { active: {} };
    }
    if (!state.statusEffects.active || typeof state.statusEffects.active !== "object") {
        state.statusEffects.active = {};
    }
    return state.statusEffects.active;
}

function activatePowerUpEffect(state, pickup) {
    const powerUp = normalizePowerUpPickup(pickup?.powerUp || pickup);
    const definition = powerUp?.effect || powerUpEffectDefinition(powerUp?.effectId);
    if (!definition) return false;

    const activeEffects = ensureStatusEffects(state);
    const replacedEffectIds = [];
    if (definition.exclusiveGroup && definition.groupId) {
        for (const [effectId, raw] of Object.entries(activeEffects)) {
            const active = normalizeActivePowerUpEffect(raw);
            if (!active || active.id === definition.id) continue;
            if (active.definition.groupId !== definition.groupId) continue;
            replacedEffectIds.push(active.id);
            delete activeEffects[effectId];
            addEvent(state, "POWER_UP_EFFECT_CANCELLED", {
                effectId: active.id,
                replacementEffectId: definition.id,
                groupId: definition.groupId,
                pickupId: pickup?.id || null
            });
        }
    }

    const existing = normalizeActivePowerUpEffect(activeEffects[definition.id]);
    let next = existing;
    let eventType = replacedEffectIds.length ? "POWER_UP_EFFECT_REPLACED" : "POWER_UP_EFFECT_ACTIVATED";
    if (!existing) {
        next = normalizeActivePowerUpEffect({
            id: definition.id,
            definition,
            remainingSeconds: definition.durationSeconds,
            sourceId: pickup?.id || null,
            activatedAt: state.clock.time,
            refreshCount: 0
        });
    } else if (definition.stacking === "extend" && !definition.permanent) {
        next.remainingSeconds += definition.durationSeconds;
        next.refreshCount += 1;
        next.sourceId = pickup?.id || next.sourceId;
        eventType = "POWER_UP_EFFECT_EXTENDED";
    } else if (definition.stacking === "refresh" && !definition.permanent) {
        next.remainingSeconds = definition.durationSeconds;
        next.refreshCount += 1;
        next.sourceId = pickup?.id || next.sourceId;
        next.activatedAt = state.clock.time;
        eventType = "POWER_UP_EFFECT_REFRESHED";
    } else {
        eventType = "POWER_UP_EFFECT_IGNORED";
    }

    activeEffects[definition.id] = next;
    addEvent(state, eventType, {
        effectId: definition.id,
        pickupId: pickup?.id || null,
        remainingSeconds: next?.remainingSeconds,
        permanent: definition.permanent,
        refreshCount: next?.refreshCount || 0,
        groupId: definition.groupId || null,
        replacedEffectIds
    });
    return true;
}

function updateStatusEffects(state, dt) {
    const activeEffects = ensureStatusEffects(state);
    for (const [effectId, raw] of Object.entries(activeEffects)) {
        const active = normalizeActivePowerUpEffect(raw);
        if (!active) {
            delete activeEffects[effectId];
            continue;
        }
        if (active.definition.permanent) {
            activeEffects[active.id] = active;
            if (effectId !== active.id) delete activeEffects[effectId];
            continue;
        }
        active.remainingSeconds = Math.max(0, active.remainingSeconds - Math.max(0, dt));
        if (active.remainingSeconds <= 0) {
            delete activeEffects[effectId];
            addEvent(state, "POWER_UP_EFFECT_EXPIRED", { effectId: active.id });
        } else {
            activeEffects[active.id] = active;
            if (effectId !== active.id) delete activeEffects[effectId];
        }
    }
}

function clearDeathResetPowerUps(state) {
    const activeEffects = ensureStatusEffects(state);
    for (const [effectId, raw] of Object.entries(activeEffects)) {
        const active = normalizeActivePowerUpEffect(raw);
        if (!active || active.definition.clearOnDeath) {
            delete activeEffects[effectId];
        }
    }
}

function rerollRandomPowerUpPickup(state, pickup) {
    if (!pickup || !Array.isArray(pickup.randomEffectIds) || !pickup.randomEffectIds.length) return false;
    pickup.randomRollCount = Math.max(0, Math.floor(Number(pickup.randomRollCount) || 0)) + 1;
    const effectId = randomPowerUpEffectId(state, pickup.id, pickup.randomEffectIds, pickup.randomRollCount);
    const nextPowerUp = normalizePowerUpPickup({
        effectId,
        radius: pickup.radius,
        atlasId: pickup.powerUp?.atlasId || "it_atlas_001",
        glowFrame: pickup.powerUp?.glowFrame || "powerup_glow_white"
    });
    if (!nextPowerUp) return false;
    pickup.powerUp = nextPowerUp;
    pickup.pickupKind = nextPowerUp.effectId;
    addEvent(state, "POWER_UP_PICKUP_REROLLED", {
        pickupId: pickup.id,
        effectId: nextPowerUp.effectId,
        rollCount: pickup.randomRollCount
    });
    return true;
}

function updatePickupRespawns(state, dt) {
    for (const pickup of state.pickups || []) {
        if (!pickup.collected || !(Number(pickup.respawnSeconds) > 0)) continue;
        pickup.respawnTimer = Math.max(0, (Number(pickup.respawnTimer) || 0) - Math.max(0, dt));
        if (pickup.respawnTimer > 0) continue;
        if (Array.isArray(pickup.randomEffectIds) && pickup.randomEffectIds.length) {
            rerollRandomPowerUpPickup(state, pickup);
        }
        pickup.collected = false;
        addEvent(state, "POWER_UP_PICKUP_RESPAWNED", {
            pickupId: pickup.id,
            effectId: pickup.powerUp?.effectId || null,
            respawnSeconds: pickup.respawnSeconds
        });
    }
}

function updatePickups(state) {
    const playerCenterY = state.player.y - state.player.height * 0.5;
    for (const pickup of state.pickups || []) {
        if (pickup.collected) continue;
        const pickupCenterY = Number.isFinite(Number(pickup.centerY))
            ? Number(pickup.centerY)
            : (Number(pickup.y) || 0) - (Number(pickup.height) || 0) * 0.5;
        const reach = Math.max(1, Number(pickup.radius) || 14) + state.player.width * 0.45;
        if (Math.hypot(state.player.x - pickup.x, playerCenterY - pickupCenterY) > reach) continue;

        pickup.collected = true;
        pickup.respawnTimer = Math.max(0, Number(pickup.respawnSeconds) || 0);
        if (pickup.kind === "fuel" || pickup.pickupKind === "fuel") {
            const before = state.fuel.amount;
            state.fuel.amount = clamp(state.fuel.amount + Math.max(0, Number(pickup.amount) || 0), 0, state.fuel.max);
            addEvent(state, "FUEL_PICKUP_COLLECTED", {
                pickupId: pickup.id,
                amount: round(state.fuel.amount - before),
                fuel: round(state.fuel.amount)
            });
        } else if (pickup.kind === "powerUp" || pickup.powerUp) {
            activatePowerUpEffect(state, pickup);
            addEvent(state, "POWER_UP_PICKUP_COLLECTED", {
                pickupId: pickup.id,
                effectId: pickup.powerUp?.effectId || null,
                respawnSeconds: pickup.respawnSeconds
            });
        } else {
            const itemId = String(pickup.pickupKind || pickup.kind || "item");
            const count = addInventoryItem(state, itemId, pickup.amount);
            addEvent(state, "ITEM_PICKUP_COLLECTED", {
                pickupId: pickup.id,
                itemId,
                amount: Math.max(1, Math.floor(Number(pickup.amount) || 1)),
                count
            });
        }
    }
}

function treasureChestLike(entity) {
    const type = String(entity?.type || entity?.kind || "");
    return type === "treasureChest" || entity?.interaction === "openChest";
}

function normalizedScoreValue(value, fallback = 100) {
    const numeric = Number(value);
    return Math.max(1, Math.floor(Number.isFinite(numeric) ? numeric : fallback));
}

function normalizedScore(state) {
    const numeric = Number(state?.score);
    return Math.max(0, Math.floor(Number.isFinite(numeric) ? numeric : 0));
}

export function addScore(state, amount, detail = {}) {
    if (!state || typeof state !== "object") return 0;
    const requested = Math.max(0, Math.floor(Number(amount) || 0));
    const previousScore = normalizedScore(state);
    const score = Math.max(0, previousScore + requested);
    state.score = score;
    if (score !== previousScore) {
        addEvent(state, "SCORE_CHANGED", {
            amount: score - previousScore,
            previousScore,
            score,
            sourceId: detail.sourceId || null,
            x: Number.isFinite(Number(detail.x)) ? Number(detail.x) : null,
            y: Number.isFinite(Number(detail.y)) ? Number(detail.y) : null
        });
    }
    return score;
}

function treasureChestCollectionRect(chest) {
    const width = Math.max(1, Number(chest?.width) || 130);
    const height = Math.max(1, Number(chest?.height) || 150);
    const distance = Math.max(8, Number(chest?.collectionDistance) || 88);
    return {
        x: (Number(chest?.x) || 0) - width * 0.5 - distance,
        y: (Number(chest?.y) || 0) - height - distance * 0.55,
        w: width + distance * 2,
        h: height + distance * 1.1
    };
}

function setTreasureChestState(state, chest, nextState) {
    if (!chest || chest.state === nextState) return false;
    const previousState = chest.state;
    chest.state = nextState;
    const entity = worldEntityById(state, chest.entityId || chest.id);
    if (entity) {
        entity.state = nextState;
        entity.collected = chest.collected === true;
        entity.scoreValue = chest.scoreValue;
        entity.collectionDistance = chest.collectionDistance;
        if (!setWorldEntityState(state, entity.id, nextState)) {
            if (!state.world.entityStates) state.world.entityStates = {};
            state.world.entityStates[entity.id] = nextState;
        }
    }
    addEvent(state, "TREASURE_CHEST_STATE_CHANGED", {
        chestId: chest.id,
        previousState,
        state: nextState
    });
    return true;
}

function updateTreasureChests(state, dt) {
    for (const chest of state.treasureChests || []) {
        if (chest.collected) {
            if (chest.state === "openLoot") {
                chest.lootDisplayTimer = Math.max(0, (Number(chest.lootDisplayTimer) || 0) - Math.max(0, dt));
                if (chest.lootDisplayTimer <= 0) {
                    setTreasureChestState(state, chest, "openEmpty");
                }
            }
            continue;
        }
        if (state.player?.targetable === false || state.player?.visible === false) continue;
        if (!rectsOverlap(getPlayerRect(state), treasureChestCollectionRect(chest))) continue;

        chest.collected = true;
        chest.lootDisplayTimer = Math.max(FIXED_DT, Number(chest.lootDisplaySeconds) || 0.8);
        setTreasureChestState(state, chest, "openLoot");
        const score = addScore(state, chest.scoreValue, {
            sourceId: chest.id,
            x: chest.x,
            y: chest.y - chest.height * 0.82
        });
        addEvent(state, "TREASURE_CHEST_COLLECTED", {
            chestId: chest.id,
            scoreValue: chest.scoreValue,
            score
        });
    }
}

function nearestSignalEmitter(state) {
    let nearest = null;
    const playerCenterY = state.player.y - state.player.height * 0.5;
    for (const emitter of state.world?.signalEmitters || []) {
        const entity = worldEntityById(state, emitter.id);
        if (!entity) continue;
        const entityCenterY = (Number(entity.y) || 0) - (Number(entity.h) || 80) * 0.5;
        const distance = Math.hypot(state.player.x - (Number(entity.x) || 0), playerCenterY - entityCenterY);
        if (distance > emitter.triggerDistance) continue;
        if (!nearest || distance < nearest.distance) nearest = { emitter, entity, distance };
    }
    return nearest;
}

function updateSignalEmitters(state, input) {
    if (!input.interactPressed) return false;
    const match = nearestSignalEmitter(state);
    if (!match) return false;
    const { emitter, entity } = match;

    if (emitter.interaction === "keyhole") {
        if (emitter.oneShot && entity.state === "unlocked") {
            addEvent(state, "KEYHOLE_ALREADY_UNLOCKED", { keyholeId: emitter.id, channel: emitter.channel });
            return true;
        }
        if (inventoryItemCount(state, emitter.requiredKey) <= 0) {
            addEvent(state, "KEYHOLE_MISSING_KEY", {
                keyholeId: emitter.id,
                channel: emitter.channel,
                requiredKey: emitter.requiredKey
            });
            return true;
        }
        if (emitter.consumeKey) consumeInventoryItem(state, emitter.requiredKey, 1);
        if (!setWorldEntityState(state, emitter.id, "unlocked")) {
            entity.state = "unlocked";
            state.world.entityStates[emitter.id] = "unlocked";
        }
        emitSignalChannel(state, emitter.channel, { sourceId: emitter.id, active: true });
        addEvent(state, "KEYHOLE_UNLOCKED", {
            keyholeId: emitter.id,
            channel: emitter.channel,
            requiredKey: emitter.requiredKey,
            consumed: emitter.consumeKey
        });
        return true;
    }

    const nextOn = entity.state !== "on";
    if (!setWorldEntityState(state, emitter.id, nextOn ? "on" : "off")) {
        entity.state = nextOn ? "on" : "off";
        state.world.entityStates[emitter.id] = entity.state;
    }
    emitSignalChannel(state, emitter.channel, { sourceId: emitter.id, active: nextOn });
    addEvent(state, "LEVER_SWITCH_TOGGLED", {
        switchId: emitter.id,
        channel: emitter.channel,
        active: nextOn
    });
    return true;
}


function createMovingPlatformRuntimes(visuals = []) {
    return visuals
        .filter((visual) => visual?.kind === "atlasSprite" && visual.movement)
        .map((visual, index) => {
            const movement = normalizeMovingPlatform(visual.movement);
            const initialDelay = movement?.initialDelay || 0;
            const phase = initialDelay > 0
                ? "initialDelay"
                : movement?.activation !== "automatic"
                    ? "waitForTrigger"
                    : "startPause";
            return {
                id: visual.id || `movingPlatform_${index + 1}`,
                visualId: visual.id || `movingPlatform_${index + 1}`,
                movement,
                startX: Number(visual.x) || 0,
                startY: Number(visual.y) || 0,
                endX: (Number(visual.x) || 0) + (movement?.endOffsetX || 0),
                endY: (Number(visual.y) || 0) + (movement?.endOffsetY || 0),
                phase,
                phaseTimer: phase === "initialDelay"
                    ? initialDelay
                    : phase === "startPause"
                        ? movement?.startPause || 0
                        : 0,
                cycleCount: 0,
                lastSignalRevision: 0,
                opacity: 1,
                baseAlpha: Number.isFinite(Number(visual.alpha)) ? Number(visual.alpha) : 1,
                collisionAttached: true,
                lastDeltaX: 0,
                lastDeltaY: 0,
                segments: [],
                polygons: []
            };
        });
}

function movingPlatformVisual(state, platform) {
    return (state.world?.visuals || []).find((visual) => visual.id === platform.visualId) || null;
}

function movingPlatformOwnsCollisionId(platform, collisionId) {
    if (!collisionId) {
        return false;
    }
    return (platform.segments || []).some((segment) => segment.id === collisionId) ||
        (platform.polygons || []).some((polygon) => polygon.id === collisionId);
}

function syncMovingPlatformCollisionCounts(state) {
    if (!state.world) {
        return;
    }
    state.world.collisionSegmentCount = (state.world.segments || []).length;
    state.world.collisionPolygonCount = (state.world.collisionPolygons || []).length;
}

function setMovingPlatformCollisionAttached(state, platform, attached) {
    const shouldAttach = Boolean(attached);
    if (platform.collisionAttached === shouldAttach) {
        return;
    }
    const segmentIds = new Set((platform.segments || []).map((segment) => segment.id));
    const polygonIds = new Set((platform.polygons || []).map((polygon) => polygon.id));
    if (shouldAttach) {
        const currentSegmentIds = new Set((state.world.segments || []).map((segment) => segment.id));
        const currentPolygonIds = new Set((state.world.collisionPolygons || []).map((polygon) => polygon.id));
        for (const segment of platform.segments || []) {
            if (!currentSegmentIds.has(segment.id)) {
                state.world.segments.push(segment);
            }
        }
        for (const polygon of platform.polygons || []) {
            if (!currentPolygonIds.has(polygon.id)) {
                state.world.collisionPolygons.push(polygon);
            }
        }
    } else {
        state.world.segments = (state.world.segments || []).filter((segment) => !segmentIds.has(segment.id));
        state.world.collisionPolygons = (state.world.collisionPolygons || []).filter((polygon) => !polygonIds.has(polygon.id));
        if (movingPlatformOwnsCollisionId(platform, state.player?.supportId)) {
            state.player.supportId = null;
            state.player.onGround = false;
        }
        for (const enemy of state.enemies || []) {
            if (enemy?.kind !== "characterEnemy" || !movingPlatformOwnsCollisionId(platform, enemy.supportId)) {
                continue;
            }
            enemy.supportId = null;
            enemy.ridingPlatformId = null;
            enemy.currentSupportId = null;
        }
    }
    platform.collisionAttached = shouldAttach;
    syncMovingPlatformCollisionCounts(state);
}

function bindMovingPlatformCollision(state, allSegments, allPolygons) {
    const platforms = state.world?.movingPlatforms || [];
    for (const platform of platforms) {
        platform.segments = allSegments.filter((segment) => segment.movingPlatformId === platform.id || segment.visualId === platform.visualId);
        platform.polygons = allPolygons.filter((polygon) => polygon.movingPlatformId === platform.id || polygon.visualId === platform.visualId);
        platform.collisionAttached = true;
    }
}

function translateMovingPlatformGeometry(platform, dx, dy) {
    for (const segment of platform.segments || []) {
        segment.x1 += dx;
        segment.y1 += dy;
        segment.x2 += dx;
        segment.y2 += dy;
    }
    for (const polygon of platform.polygons || []) {
        for (const point of polygon.points || []) {
            point.x += dx;
            point.y += dy;
        }
    }
}

function setMovingPlatformPosition(state, platform, x, y) {
    const visual = movingPlatformVisual(state, platform);
    if (!visual) {
        return { dx: 0, dy: 0 };
    }
    const previousX = Number(visual.x) || 0;
    const previousY = Number(visual.y) || 0;
    const nextX = Number(x) || 0;
    const nextY = Number(y) || 0;
    const dx = nextX - previousX;
    const dy = nextY - previousY;
    if (Math.abs(dx) <= 0.0000001 && Math.abs(dy) <= 0.0000001) {
        return { dx: 0, dy: 0 };
    }

    const carryingPlayer = platform.collisionAttached &&
        state.player?.onGround === true &&
        movingPlatformOwnsCollisionId(platform, state.player.supportId);
    const carryingEnemies = platform.collisionAttached
        ? (state.enemies || []).filter((enemy) => (
            enemy?.kind === "characterEnemy" &&
            enemy.airborne !== true &&
            movingPlatformOwnsCollisionId(platform, enemy.supportId)
        ))
        : [];
    visual.x = nextX;
    visual.y = nextY;
    platform.lastDeltaX = (Number(platform.lastDeltaX) || 0) + dx;
    platform.lastDeltaY = (Number(platform.lastDeltaY) || 0) + dy;
    translateMovingPlatformGeometry(platform, dx, dy);
    if (carryingPlayer) {
        state.player.x += dx;
        state.player.y += dy;
    }
    for (const enemy of carryingEnemies) {
        enemy.x += dx;
        enemy.y += dy;
        enemy.ridingPlatformId = platform.id;
        syncCharacterEnemyTarget(state, enemy);
    }
    return { dx, dy };
}

function setMovingPlatformOpacity(state, platform, opacity) {
    const visual = movingPlatformVisual(state, platform);
    platform.opacity = clamp(Number(opacity) || 0, 0, 1);
    if (visual) {
        visual.alpha = platform.baseAlpha * platform.opacity;
    }
}

function enterMovingPlatformPhase(state, platform, phase, duration = 0) {
    platform.phase = phase;
    platform.phaseTimer = Math.max(0, Number(duration) || 0);
    if (phase === "fadeOutEnd" || phase === "fadeOutStart") {
        setMovingPlatformCollisionAttached(state, platform, false);
    }
    if (phase === "hiddenEnd") {
        setMovingPlatformPosition(state, platform, platform.startX, platform.startY);
        setMovingPlatformOpacity(state, platform, 0);
    }
    if (phase === "hiddenStart") {
        setMovingPlatformOpacity(state, platform, 0);
    }
}

function resetMovingPlatformAtStart(state, platform) {
    setMovingPlatformPosition(state, platform, platform.startX, platform.startY);
    setMovingPlatformOpacity(state, platform, 1);
    setMovingPlatformCollisionAttached(state, platform, true);
    platform.cycleCount += 1;
    if (platform.movement.activation !== "automatic") {
        enterMovingPlatformPhase(state, platform, "waitForTrigger", 0);
    } else {
        enterMovingPlatformPhase(state, platform, "startPause", platform.movement.startPause);
    }
}

function beginMovingPlatformAction(state, platform) {
    if (platform.movement.pattern === "vanishRespawn") {
        enterMovingPlatformPhase(state, platform, "fadeOutStart", platform.movement.fadeDuration);
    } else {
        enterMovingPlatformPhase(state, platform, "moveToEnd", 0);
    }
}

function platformTriggeredByRider(state, platform) {
    if (!platform.collisionAttached) {
        return false;
    }
    if (state.player?.onGround === true && movingPlatformOwnsCollisionId(platform, state.player.supportId)) {
        return true;
    }
    return (state.enemies || []).some((enemy) => (
        enemy?.kind === "characterEnemy" &&
        enemy.combatState !== ENEMY_COMBAT_STATE.DEAD &&
        enemy.airborne !== true &&
        movingPlatformOwnsCollisionId(platform, enemy.supportId)
    ));
}

function platformTriggeredBySignal(state, platform) {
    const channel = signalChannelRecord(state, platform.movement?.signalChannel, false);
    const revision = Math.max(0, Number(channel?.revision) || 0);
    if (revision <= Math.max(0, Number(platform.lastSignalRevision) || 0)) return false;
    platform.lastSignalRevision = revision;
    addEvent(state, "MOVING_PLATFORM_SIGNAL_TRIGGERED", {
        platformId: platform.id,
        channel: channel.channel,
        revision
    });
    return true;
}

function consumeMovingPlatformTimer(platform, dt) {
    const consumed = Math.min(Math.max(0, platform.phaseTimer), Math.max(0, dt));
    platform.phaseTimer = Math.max(0, platform.phaseTimer - consumed);
    if (platform.phaseTimer <= 0.000000001) {
        platform.phaseTimer = 0;
    }
    return consumed;
}

function movePlatformToward(state, platform, targetX, targetY, dt) {
    const visual = movingPlatformVisual(state, platform);
    if (!visual) {
        return true;
    }
    const dx = targetX - visual.x;
    const dy = targetY - visual.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 0.0001) {
        setMovingPlatformPosition(state, platform, targetX, targetY);
        return true;
    }
    const travel = Math.min(distance, platform.movement.speed * Math.max(0, dt));
    const scale = travel / distance;
    setMovingPlatformPosition(state, platform, visual.x + dx * scale, visual.y + dy * scale);
    return travel >= distance - 0.0001;
}

function updateMovingPlatform(state, platform, dt) {
    let remaining = Math.max(0, dt);
    for (let guard = 0; guard < 12; guard += 1) {
        const movement = platform.movement;
        if (!movement) {
            return;
        }

        if (platform.phase === "waitForTrigger") {
            const triggered = movement.activation === "signal"
                ? platformTriggeredBySignal(state, platform)
                : platformTriggeredByRider(state, platform);
            if (triggered) {
                if (movement.triggerDelay > 0) {
                    enterMovingPlatformPhase(state, platform, "triggerDelay", movement.triggerDelay);
                } else {
                    beginMovingPlatformAction(state, platform);
                }
                continue;
            }
            return;
        }

        if (["initialDelay", "triggerDelay", "startPause", "endPause", "hiddenEnd", "hiddenStart"].includes(platform.phase)) {
            const consumed = consumeMovingPlatformTimer(platform, remaining);
            remaining -= consumed;
            if (platform.phaseTimer > 0) {
                return;
            }
            const completedPhase = platform.phase;
            if (completedPhase === "initialDelay") {
                if (movement.activation !== "automatic") {
                    enterMovingPlatformPhase(state, platform, "waitForTrigger", 0);
                } else {
                    enterMovingPlatformPhase(state, platform, "startPause", movement.startPause);
                }
            } else if (completedPhase === "triggerDelay" || completedPhase === "startPause") {
                beginMovingPlatformAction(state, platform);
            } else if (completedPhase === "endPause") {
                if (movement.pattern === "shuttle") {
                    enterMovingPlatformPhase(state, platform, "moveToStart", 0);
                } else {
                    enterMovingPlatformPhase(state, platform, "fadeOutEnd", movement.fadeDuration);
                }
            } else if (completedPhase === "hiddenEnd" || completedPhase === "hiddenStart") {
                enterMovingPlatformPhase(state, platform, "fadeInStart", movement.fadeDuration);
            }
            continue;
        }

        if (platform.phase === "moveToEnd") {
            const arrived = movePlatformToward(state, platform, platform.endX, platform.endY, remaining);
            if (!arrived) {
                return;
            }
            enterMovingPlatformPhase(state, platform, "endPause", movement.endPause);
            remaining = 0;
            continue;
        }

        if (platform.phase === "moveToStart") {
            const arrived = movePlatformToward(state, platform, platform.startX, platform.startY, remaining);
            if (!arrived) {
                return;
            }
            resetMovingPlatformAtStart(state, platform);
            remaining = 0;
            continue;
        }

        if (platform.phase === "fadeOutEnd" || platform.phase === "fadeOutStart") {
            const duration = Math.max(0, movement.fadeDuration);
            if (duration <= 0) {
                setMovingPlatformOpacity(state, platform, 0);
                enterMovingPlatformPhase(
                    state,
                    platform,
                    platform.phase === "fadeOutEnd" ? "hiddenEnd" : "hiddenStart",
                    movement.hiddenDuration
                );
                continue;
            }
            const consumed = Math.min(remaining, platform.phaseTimer);
            platform.phaseTimer = Math.max(0, platform.phaseTimer - consumed);
            if (platform.phaseTimer <= 0.000000001) platform.phaseTimer = 0;
            remaining -= consumed;
            setMovingPlatformOpacity(state, platform, platform.phaseTimer / duration);
            if (platform.phaseTimer > 0) {
                return;
            }
            enterMovingPlatformPhase(
                state,
                platform,
                platform.phase === "fadeOutEnd" ? "hiddenEnd" : "hiddenStart",
                movement.hiddenDuration
            );
            continue;
        }

        if (platform.phase === "fadeInStart") {
            const duration = Math.max(0, movement.fadeDuration);
            if (duration <= 0) {
                resetMovingPlatformAtStart(state, platform);
                continue;
            }
            const consumed = Math.min(remaining, platform.phaseTimer);
            platform.phaseTimer = Math.max(0, platform.phaseTimer - consumed);
            if (platform.phaseTimer <= 0.000000001) platform.phaseTimer = 0;
            remaining -= consumed;
            setMovingPlatformOpacity(state, platform, 1 - platform.phaseTimer / duration);
            if (platform.phaseTimer > 0) {
                return;
            }
            resetMovingPlatformAtStart(state, platform);
            continue;
        }

        resetMovingPlatformAtStart(state, platform);
        if (remaining <= 0) {
            return;
        }
    }
}

function updateMovingPlatforms(state, dt) {
    for (const platform of state.world?.movingPlatforms || []) {
        platform.lastDeltaX = 0;
        platform.lastDeltaY = 0;
    }
    for (const platform of state.world?.movingPlatforms || []) {
        updateMovingPlatform(state, platform, dt);
    }
}


function createCharacterEnemyRuntime(state, entity, index = 0) {
    const x = Number(entity.x) || 0;
    const y = Number(entity.y) || 0;
    const dimensions = scaledEnemyDimensions(entity, 72, 150);
    const enemyScale = normalizeEnemyScale(entity.scale, 1);
    const width = dimensions.width;
    const height = dimensions.height;
    const anchor = entity.targetAnchor && typeof entity.targetAnchor === "object" ? entity.targetAnchor : null;
    const anchorX = clamp(Number(anchor?.x ?? 0.5), 0, 1);
    const anchorY = clamp(Number(anchor?.y ?? 0.42), 0, 1);
    const facing = Number(entity.facing) < 0 ? -1 : 1;
    const requestedStrategy = String(entity.strategy || "").trim().toLowerCase();
    const strategy = requestedStrategy === "hunter"
        ? "hunter"
        : requestedStrategy === "bomber"
            ? "bomber"
            : requestedStrategy === "simple_patrol"
                ? "simple_patrol"
                : "sentry";
    const locomotion = String(entity.locomotion || "").trim().toLowerCase() === "flying"
        ? "flying"
        : "ground";
    const isSimplePatrol = strategy === "simple_patrol";
    const patrolDistance = Math.max(0, finiteNumberOr(entity.patrolDistance, 0));
    const idleDuration = Math.max(0, finiteNumberOr(entity.idleDuration, 1.1));
    const health = Math.max(0, finiteNumberOr(entity.health, 60));
    return {
        id: entity.id || `characterEnemy_${index + 1}`,
        kind: "characterEnemy",
        isBoss: entity.isBoss === true,
        bossName: String(entity.bossName || "").trim() || "Boss",
        bossDefeatSignalChannel: entity.bossDefeatSignalChannel ? normalizeSignalChannel(entity.bossDefeatSignalChannel) : null,
        bossDefeatEmitted: false,
        autoSpawned: entity.autoSpawned === true,
        enemyDefinitionId: entity.enemyDefinitionId ? String(entity.enemyDefinitionId) : null,
        enemySpawnerId: entity.enemySpawnerId ? String(entity.enemySpawnerId) : null,
        characterId: String(entity.characterId || entity.characterProject || "ct_char_enemy_001"),
        x,
        y,
        spawnX: x,
        spawnY: y,
        width,
        height,
        scale: enemyScale,
        health,
        maxHealth: health,
        combatState: health > 0 ? "alive" : "dead",
        state: health > 0 ? "idle" : "death",
        animationSlot: health > 0 ? "idle" : "death",
        animationTime: Number.isFinite(Number(entity.animationTime)) ? Number(entity.animationTime) : 0,
        animationTimeOffset: Number(entity.animationTimeOffset) || 0,
        facing,
        strategy,
        locomotion,
        aiState: health <= 0 ? "dead" : (locomotion === "flying" ? "fly" : (strategy === "hunter" ? "patrol" : strategy)),
        engaged: false,
        patrolDistance,
        patrolMinX: x - patrolDistance * 0.5,
        patrolMaxX: x + patrolDistance * 0.5,
        homePatrolMinX: x - patrolDistance * 0.5,
        homePatrolMaxX: x + patrolDistance * 0.5,
        temporaryPatrolMinX: null,
        temporaryPatrolMaxX: null,
        homeSupportId: null,
        currentSupportId: null,
        supportId: null,
        ridingPlatformId: null,
        route: [],
        routeIndex: 0,
        routeTargetSupportId: null,
        routeTargetX: null,
        routeRepathTimer: 0,
        navigationFailureCount: 0,
        airborne: locomotion === "flying",
        velocityX: 0,
        velocityY: 0,
        groundVelocityX: 0,
        routeTraversalPhase: null,
        routeTraversalEdgeIndex: -1,
        airTimer: 0,
        airTraversalType: null,
        airSourceSupportId: null,
        airSourceObstacleId: null,
        airTargetSupportId: null,
        walkSpeed: Math.max(0, finiteNumberOr(entity.walkSpeed, 56)),
        runSpeed: Math.max(0, finiteNumberOr(entity.runSpeed, state.tuning.enemyDefaultRunSpeed)),
        runAcceleration: Math.max(1, finiteNumberOr(entity.runAcceleration, state.tuning.groundAcceleration)),
        jumpHeight: Math.max(0, finiteNumberOr(entity.jumpHeight, state.tuning.enemyDefaultJumpHeight)),
        jumpGravity: Math.max(1, finiteNumberOr(entity.jumpGravity, state.tuning.enemyDefaultJumpGravity)),
        maxFallDistance: Math.max(0, finiteNumberOr(entity.maxFallDistance, state.tuning.enemyDefaultMaxFallDistance)),
        unreachableGlareDuration: Math.max(0, finiteNumberOr(entity.unreachableGlareDuration, state.tuning.enemyDefaultGlareSeconds)),
        glareTimer: 0,
        routeRepathInterval: Math.max(FIXED_DT, finiteNumberOr(entity.routeRepathInterval, state.tuning.enemyDefaultRepathSeconds)),
        homeRetryInterval: Math.max(FIXED_DT, finiteNumberOr(entity.homeRetryInterval, state.tuning.enemyDefaultHomeRetrySeconds)),
        homeRetryTimer: 0,
        awarenessRange: Math.max(0, finiteNumberOr(entity.awarenessRange, state.tuning.enemyDefaultAwarenessRange)),
        awarenessHoldDuration: Math.max(0, finiteNumberOr(entity.awarenessHoldDuration, state.tuning.enemyDefaultAwarenessHoldSeconds)),
        awarenessViewHalfAngle: clamp(finiteNumberOr(entity.awarenessViewHalfAngle, state.tuning.enemyDefaultAwarenessViewHalfAngle), 0, 180),
        awarenessTimer: 0,
        alerted: false,
        lastSeenPlayerX: null,
        lastSeenPlayerY: null,
        lastSeenAt: null,
        lastSeenSupportId: null,
        glareFocusX: null,
        glareFocusY: null,
        idleDuration,
        turnPause: Math.max(0, finiteNumberOr(entity.turnPause, 0.5)),
        maxStepHeight: Math.max(0, finiteNumberOr(entity.maxStepHeight, 26)),
        maxDropDistance: Math.max(0, finiteNumberOr(entity.maxDropDistance, 34)),
        groundSnapDistance: Math.max(0, finiteNumberOr(entity.groundSnapDistance, 96)),
        movementPhase: health <= 0 ? "dead" : (locomotion === "flying" ? "fly" : (isSimplePatrol && patrolDistance > 0 ? "idle" : "guard")),
        phaseTimer: locomotion === "flying" ? 0 : (isSimplePatrol && patrolDistance > 0 ? idleDuration : 0),
        flightBaseY: y,
        flightTime: Math.max(0, finiteNumberOr(entity.flightTime, 0)),
        flightPhaseOffset: finiteNumberOr(entity.flightPhaseOffset, 0),
        flightAmplitude: Math.max(0, finiteNumberOr(entity.flightAmplitude, 16)),
        flightCyclesPerSecond: Math.max(0, finiteNumberOr(entity.flightCyclesPerSecond, 0.58)),
        bomberHorizontalSpeed: Math.max(0, finiteNumberOr(entity.bomberHorizontalSpeed, finiteNumberOr(entity.runSpeed, 150))),
        bomberHoverHeight: Math.max(16, finiteNumberOr(entity.bomberHoverHeight, 180)),
        bomberDropTolerance: Math.max(1, finiteNumberOr(entity.bomberDropTolerance, 34)),
        bomberDropHeightTolerance: Math.max(4, finiteNumberOr(entity.bomberDropHeightTolerance, 36)),
        bomberRetreatDistance: Math.max(0, finiteNumberOr(entity.bomberRetreatDistance, 120)),
        bomberObstacleClearance: Math.max(8, finiteNumberOr(entity.bomberObstacleClearance, 56)),
        bomberScreenTopMargin: Math.max(20, finiteNumberOr(entity.bomberScreenTopMargin, 72)),
        bomberSteeringResponse: Math.max(0.5, finiteNumberOr(entity.bomberSteeringResponse, 4.5)),
        bomberWanderAmplitude: Math.max(0, finiteNumberOr(entity.bomberWanderAmplitude, 28)),
        bomberApproachArcHeight: Math.max(0, finiteNumberOr(entity.bomberApproachArcHeight, 64)),
        bomberDropTimer: Math.max(0, finiteNumberOr(entity.bomberInitialDelay, 0.4)),
        bomberState: strategy === "bomber" ? "perched" : null,
        bomberPerchX: x,
        bomberPerchY: y,
        deathFlightSpeed: Math.max(1, finiteNumberOr(entity.deathFlightSpeed, 520)),
        deathFlightLift: Math.max(0, finiteNumberOr(entity.deathFlightLift, 210)),
        deathFlightGravity: finiteNumberOr(entity.deathFlightGravity, 90),
        deathFlyOffDistance: Math.max(1, finiteNumberOr(entity.deathFlyOffDistance, 720)),
        deathFlightStarted: false,
        deathFlightStartX: x,
        deathFlightStartY: y,
        deathFlightDirection: facing,
        hurtDuration: Math.max(FIXED_DT, finiteNumberOr(entity.hurtDuration, state.tuning.enemyDefaultHurtSeconds)),
        deathDuration: Math.max(FIXED_DT, finiteNumberOr(entity.deathDuration, state.tuning.enemyDefaultDeathSeconds)),
        attackDamage: Math.max(0, finiteNumberOr(entity.attackDamage, state.tuning.enemyDefaultAttackDamage)),
        attackRange: Math.max(1, finiteNumberOr(entity.attackRange, state.tuning.enemyDefaultAttackRange)),
        attackVerticalRange: Math.max(1, finiteNumberOr(entity.attackVerticalRange, state.tuning.enemyDefaultAttackVerticalRange)),
        attackDuration: Math.max(FIXED_DT, finiteNumberOr(entity.attackDuration, state.tuning.enemyDefaultAttackDuration)),
        attackHitTime: Math.max(0, finiteNumberOr(entity.attackHitTime, state.tuning.enemyDefaultAttackHitTime)),
        attackCooldown: Math.max(0, finiteNumberOr(entity.attackCooldown, state.tuning.enemyDefaultAttackCooldown)),
        attackMode: String(entity.attackMode || state.tuning.enemyDefaultAttackMode || "melee") === "projectile" ? "projectile" : "melee",
        preferredAttackRange: Math.max(0, finiteNumberOr(entity.preferredAttackRange, state.tuning.enemyDefaultPreferredAttackRange)),
        preferredAttackMinRange: Math.max(0, finiteNumberOr(entity.preferredAttackMinRange, Math.min((Number(entity.attackRange) || state.tuning.enemyDefaultAttackRange) * 0.45, state.tuning.enemyDefaultPreferredAttackRange * 0.6))),
        projectileKind: String(entity.projectileKind || state.tuning.enemyDefaultProjectileKind || "fireball"),
        projectileLaunchType: String(entity.projectileLaunchType || ""),
        projectileReleaseTime: Math.max(0, finiteNumberOr(entity.projectileReleaseTime, entity.attackHitTime ?? state.tuning.enemyDefaultAttackHitTime)),
        projectilePartName: entity.projectilePartName ? String(entity.projectilePartName) : null,
        projectileFrameId: entity.projectileFrameId ? String(entity.projectileFrameId) : null,
        projectileOriginLocalX: Number.isFinite(Number(entity.projectileOriginLocalX)) ? Number(entity.projectileOriginLocalX) : null,
        projectileOriginLocalY: Number.isFinite(Number(entity.projectileOriginLocalY)) ? Number(entity.projectileOriginLocalY) : null,
        projectileRigScale: Math.max(0.0001, finiteNumberOr(entity.projectileRigScale, 1)),
        projectileSpeed: Math.max(1, finiteNumberOr(entity.projectileSpeed, state.tuning.enemyDefaultProjectileSpeed)),
        projectileGravity: finiteNumberOr(entity.projectileGravity, state.tuning.enemyDefaultProjectileGravity),
        projectileLifetime: Math.max(FIXED_DT, finiteNumberOr(entity.projectileLifetime, state.tuning.enemyDefaultProjectileLifetime)),
        projectileRadius: scaledEnemyProjectileRadius(entity, state.tuning.enemyDefaultProjectileRadius),
        projectileDamage: Math.max(0, finiteNumberOr(entity.projectileDamage, state.tuning.enemyDefaultProjectileDamage)),
        projectileCooldown: Math.max(0, finiteNumberOr(entity.projectileCooldown, state.tuning.enemyDefaultProjectileCooldown)),
        projectileHomingStrength: Math.max(0, finiteNumberOr(entity.projectileHomingStrength, state.tuning.enemyDefaultProjectileHomingStrength)),
        projectileKnockbackX: Math.max(0, finiteNumberOr(entity.projectileKnockbackX, state.tuning.enemyDefaultProjectileKnockbackX)),
        projectileKnockbackY: finiteNumberOr(entity.projectileKnockbackY, state.tuning.enemyDefaultProjectileKnockbackY),
        attackLungeDistance: Math.max(0, finiteNumberOr(entity.attackLungeDistance, state.tuning.enemyDefaultAttackLungeDistance)),
        attackLungeSpeed: Math.max(0, finiteNumberOr(entity.attackLungeSpeed, state.tuning.enemyDefaultAttackLungeSpeed)),
        attackKnockbackX: Math.max(0, finiteNumberOr(entity.attackKnockbackX, state.tuning.enemyDefaultAttackKnockbackX)),
        attackKnockbackY: finiteNumberOr(entity.attackKnockbackY, state.tuning.enemyDefaultAttackKnockbackY),
        attackTimer: 0,
        attackCooldownTimer: 0,
        attackLungeRemaining: 0,
        attackHitApplied: false,
        hurtTimer: 0,
        deathTimer: health <= 0 ? Math.max(FIXED_DT, finiteNumberOr(entity.deathDuration, state.tuning.enemyDefaultDeathSeconds)) : 0,
        deathPendingLanding: false,
        deathElapsed: 0,
        corpseHoldDuration: Math.max(0, finiteNumberOr(entity.corpseHoldDuration, state.tuning.enemyCorpseHoldSeconds)),
        corpseFadeDuration: Math.max(0, finiteNumberOr(entity.corpseFadeDuration, state.tuning.enemyCorpseFadeSeconds)),
        renderOpacity: 1,
        hitFlashTimer: 0,
        hitFlashDuration: state.tuning.enemyHitFlashSeconds,
        healthBarTimer: 0,
        lastDamagedAt: null,
        lastHitBy: null,
        renderScale: scaledEnemyRenderScale(entity, 1),
        renderOffsetX: (Number(entity.renderOffsetX) || 0) * enemyScale,
        renderOffsetY: (Number(entity.renderOffsetY) || 0) * enemyScale,
        visualized: false,
        targetAnchorX: anchorX,
        targetAnchorY: anchorY,
        targetX: x - width * 0.5 + anchorX * width,
        targetY: y - height + anchorY * height,
        targetRadius: Math.max(4, Number(entity.targetRadius) || Math.min(width, height) * 0.16),
        showTargetMarker: entity.showTargetMarker === true
    };
}

export function applyEditorLevelToWorld(state, editorLevel) {
    if (!state?.world || !editorLevel || typeof editorLevel !== "object") {
        return false;
    }

    const random = ensureRandomState(state);
    random.levelLoadCount += 1;
    const source = editorLevel.level || editorLevel;
    const autoSpawnEnemies = normalizeAutoSpawnEnemies(source.autoSpawnEnemies);
    const caveWindow = normalizeCaveWindow(source.caveWindow || source.visuals?.caveWindow);
    const caveKillBoundary = deriveCaveFullBlackKillBoundary(caveWindow);
    const placements = Array.isArray(source.placements) ? source.placements : [];
    const entities = Array.isArray(source.entities) ? source.entities : [];
    const entryDoorSource = wizardEntryDoorEntity(entities);
    const playerStart = entryDoorSource
        ? {
            x: Number(entryDoorSource.x) + doorWalkDirection(entryDoorSource, 1) * Math.max(48, Number(entryDoorSource.emergeDistance) || Math.max(120, Number(entryDoorSource.w) || 150)),
            y: Number(entryDoorSource.y) || 360
        }
        : null;

    const visuals = [];
    for (const placement of placements) {
        if (!placement) {
            continue;
        }

        if (placement.kind === "cutoutMask") {
            visuals.push({
                id: placement.id || `cutoutMask_${visuals.length}`,
                kind: "cutoutMask",
                x: Number(placement.x) || 0,
                y: Number(placement.y) || 0,
                w: Math.max(1, Number(placement.w) || 64),
                h: Math.max(1, Number(placement.h) || 64),
                layer: placement.layer || "mask",
                order: Number.isFinite(Number(placement.order)) ? Number(placement.order) : visuals.length,
                notes: placement.notes || ""
            });
            continue;
        }

        if (placement.kind !== "atlasAsset" && placement.kind !== "asset") {
            continue;
        }
        const assetId = placement.assetId || placement.frame;
        if (!assetId) {
            continue;
        }
        const layer = placement.layer || "terrain";
        const movement = layer === "caveForeground" ? null : normalizeMovingPlatform(placement.movement);
        visuals.push({
            id: placement.id || `${assetId}_${visuals.length}`,
            kind: "atlasSprite",
            atlasId: normalizeAtlasId(placement.atlasId || source.atlasId || "at_atlas_001"),
            assetId,
            frame: placement.frame || assetId,
            x: Number(placement.x) || 0,
            y: Number(placement.y) || 0,
            w: Math.max(1, Number(placement.w) || 64),
            h: Math.max(1, Number(placement.h) || 64),
            mirrorX: Boolean(placement.mirrorX),
            mirrorY: Boolean(placement.mirrorY),
            rotation: normalizeRotationRadians(placement.rotation, placement.angle),
            layer,
            collisionFromManifest: layer === "caveForeground" ? false : placement.collisionFromManifest !== false,
            foregroundBrightness: Number.isFinite(Number(placement.foregroundBrightness)) ? Number(placement.foregroundBrightness) : undefined,
            foregroundSaturation: Number.isFinite(Number(placement.foregroundSaturation)) ? Number(placement.foregroundSaturation) : undefined,
            foregroundOutwardX: Number.isFinite(Number(placement.foregroundOutwardX)) ? Number(placement.foregroundOutwardX) : undefined,
            foregroundOutwardY: Number.isFinite(Number(placement.foregroundOutwardY)) ? Number(placement.foregroundOutwardY) : undefined,
            foregroundFadeStart: Number.isFinite(Number(placement.foregroundFadeStart)) ? Number(placement.foregroundFadeStart) : undefined,
            foregroundFadeEnd: Number.isFinite(Number(placement.foregroundFadeEnd)) ? Number(placement.foregroundFadeEnd) : undefined,
            alpha: Number.isFinite(Number(placement.alpha)) ? Number(placement.alpha) : undefined,
            generatedBy: placement.generatedBy || undefined,
            caveCategory: placement.caveCategory || undefined,
            movement: movement || undefined,
            dynamicPosition: Boolean(movement),
            order: Number.isFinite(Number(placement.order)) ? Number(placement.order) : visuals.length
        });
    }
    const runtimeEntities = deepClone(entities);
    for (const entity of runtimeEntities) {
        editorEntityVisuals(entity).forEach((visual, index) => {
            if (visual?.assetId) visuals.push(editorEntityVisualToWorld(entity, visual, index, entity.state || ""));
        });
    }
    const enemySpawners = runtimeEntities
        .filter((entity) => String(entity?.type || entity?.kind || "") === "enemySpawner")
        .map((entity, index) => {
            const config = normalizeEnemySpawner(entity);
            return {
                id: String(entity.id || `enemy_spawner_${index + 1}`),
                entityId: String(entity.id || `enemy_spawner_${index + 1}`),
                x: Number(entity.x) || 0,
                y: Number(entity.y) || 0,
                width: Math.max(1, Number(entity.w) || Number(entity.width) || 64),
                height: Math.max(1, Number(entity.h) || Number(entity.height) || 64),
                groundSnapDistance: Math.max(24, Number(entity.groundSnapDistance) || 96),
                disableSignalChannel: entity.disableSignalChannel ? normalizeSignalChannel(entity.disableSignalChannel) : null,
                ...config,
                intervalSeconds: 1,
                timer: 1,
                rollCount: 0,
                spawnCount: 0,
                onScreen: false,
                lastResolvedEnemyIds: [],
                lastError: null
            };
        });

    visuals.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (!visuals.length && !playerStart && !entities.length) {
        return false;
    }

    const bounds = source.world?.bounds || source.bounds || estimateEditorLevelBounds(visuals, playerStart, entities);
    const atlasManifests = Array.isArray(source.atlasRefs)
        ? source.atlasRefs.map((ref) => ref.manifest).filter(Boolean).map(normalizeAtlasManifestPath)
        : ["assets/at_atlas_001.json"];
    state.world = {
        ...state.world,
        levelId: source.levelId || source.id || "browser_copy_playtest",
        bounds,
        resetY: Number(source.world?.resetY ?? source.resetY) || bounds.y + bounds.h + 240,
        start: playerStart ? { x: Number(playerStart.x) || 120, y: Number(playerStart.y) || 360 } : state.world.start,
        atlasManifests,
        colorMap: normalizeLevelColorMap(source.colorMap),
        music: normalizeLevelMusic(source.music),
        autoSpawnEnemies: {
            ...autoSpawnEnemies,
            intervalSeconds: 1,
            timer: 1,
            rollCount: 0,
            spawnCount: 0,
            lastResolvedEnemyIds: [],
            lastError: null
        },
        enemySpawners,
        caveWindow,
        caveKillBoundary,
        visuals,
        movingPlatforms: createMovingPlatformRuntimes(visuals),
        signalChannels: {},
        signalEmitters: [],
        signalReceivers: [],
        entities: runtimeEntities,
        entityStates: Object.fromEntries(runtimeEntities.filter((entity) => entity.id).map((entity) => [entity.id, entity.state || ""])),
        solids: [
            { id: "left_wall", kind: "wall", x: bounds.x - 80, y: bounds.y - 400, w: 60, h: bounds.h + 800 },
            { id: "right_wall", kind: "wall", x: bounds.x + bounds.w + 20, y: bounds.y - 400, w: 60, h: bounds.h + 800 }
        ],
        segments: [],
        collisionMode: "editorLevelPendingManifest",
        collisionSegmentCount: 0,
        labels: [
            { text: source.levelId || "loaded level", x: (playerStart?.x ?? 120) - 30, y: (playerStart?.y ?? 360) - 70 }
        ],
        navigationGraphs: deepClone(source.navigationGraphs || { version: 1, profiles: [] }),
        navigationBlockers: deepClone(source.navigationBlockers || []),
        playerStartGroundSnapResolved: false
    };
    state.story.portalIntro = null;
    state.story.portalExit = null;
    state.story.mailboxEvent = null;
    state.story.mailboxEvents = [];
    state.story.levelTransitionRequest = null;

    if (playerStart) {
        state.player.x = state.world.start.x;
        state.player.y = state.world.start.y;
        state.player.spawnX = state.world.start.x;
        state.player.spawnY = state.world.start.y;
        state.player.vx = 0;
        state.player.vy = 0;
        state.player.renderScale = 1;
        state.player.onGround = false;
        state.player.wasOnGround = false;
        state.player.airBoostArmed = false;
        state.camera.x = state.player.x;
        state.camera.y = state.player.y - 170;
    }

    configurePortalIntro(state, runtimeEntities);
    configurePortalExit(state, runtimeEntities);
    configureMailboxStory(state, runtimeEntities);
    configureSignalSystem(state, runtimeEntities);

    const targetLike = (entity) => entity.type === "targetDummy" || entity.kind === "targetDummy";
    const targetDummies = runtimeEntities.filter(targetLike).map((entity, index) => {
        const x = Number(entity.x) || 0;
        const y = Number(entity.y) || 0;
        const width = Number(entity.w) || 42;
        const height = Number(entity.h) || 80;
        const visualized = editorEntityVisuals(entity).length > 0;
        const anchor = entity.targetAnchor && typeof entity.targetAnchor === "object" ? entity.targetAnchor : null;
        const anchorX = clamp(Number(anchor?.x ?? 0.5), 0, 1);
        const anchorY = clamp(Number(anchor?.y ?? (visualized ? 0.52 : 0.5)), 0, 1);
        const health = Math.max(0, finiteNumberOr(entity.health, 100));
        return {
            id: entity.id || `targetDummy_${index + 1}`,
            kind: "targetDummy",
            x,
            y,
            width,
            height,
            health,
            maxHealth: health,
            combatState: health > 0 ? "alive" : "dead",
            state: health > 0 ? "idle" : "destroyed",
            hitFlashTimer: 0,
            hitFlashDuration: state.tuning.enemyHitFlashSeconds,
            healthBarTimer: 0,
            visualized,
            targetX: x - width * 0.5 + anchorX * width,
            targetY: y - height + anchorY * height,
            targetRadius: Math.max(4, Number(entity.targetRadius) || Math.min(width, height) * 0.12),
            showTargetMarker: entity.showTargetMarker ?? !visualized
        };
    });

    const characterEnemyLike = (entity) =>
        entity.type === "characterEnemy" ||
        entity.kind === "characterEnemy" ||
        (entity.type === "enemy" && (entity.characterId || entity.characterProject));
    const characterEnemies = runtimeEntities.filter(characterEnemyLike).map((entity, index) =>
        createCharacterEnemyRuntime(state, entity, index)
    );
    state.enemies = [...targetDummies, ...characterEnemies];

    const pickupLike = (entity) => {
        const type = String(entity.type || entity.kind || "");
        return Boolean(entity.pickupKind) || Boolean(entity.effectId) || Array.isArray(entity.randomEffectIds) || [
            "fuel",
            "fuelPickup",
            "overdrivePickup",
            "shieldPickup",
            "randomWrenchPickup",
            "ornateKeyPickup",
            "ironKeyPickup",
            "magicRingPickup",
            "herbPickupBlue",
            "herbPickupPurple",
            "herbPickupYellow",
            "mushroomPickup"
        ].includes(type);
    };
    state.pickups = runtimeEntities.filter(pickupLike).map((entity, index) => {
        const type = String(entity.type || entity.kind || "");
        const randomEffectIds = type === "randomWrenchPickup" || Array.isArray(entity.randomEffectIds)
            ? normalizedRandomEffectPool(entity.randomEffectIds)
            : [];
        const randomRollCount = Math.max(0, Math.floor(Number(entity.randomRollCount) || 0));
        const selectedRandomEffectId = randomEffectIds.length
            ? randomPowerUpEffectId(state, entity.id || `random_powerup_${index + 1}`, randomEffectIds, randomRollCount)
            : null;
        const authoredEffectId = selectedRandomEffectId || entity.effectId ||
            (type === "overdrivePickup"
                ? POWER_UP_EFFECT_IDS.OVERDRIVE
                : (type === "shieldPickup" ? POWER_UP_EFFECT_IDS.SHIELD : null));
        const powerUp = authoredEffectId
            ? normalizePowerUpPickup({
                ...entity,
                effectId: authoredEffectId,
                iconFrame: randomEffectIds.length ? undefined : entity.iconFrame,
                glowTint: randomEffectIds.length ? undefined : entity.glowTint
            })
            : null;
        const pickupKind = String(entity.pickupKind || (type === "fuel" ? "fuel" : entity.kind || type || "item"));
        const kind = powerUp ? "powerUp" : (pickupKind === "fuel" ? "fuel" : "item");
        const width = Math.max(1, Number(entity.w) || Number(entity.width) || (powerUp ? 96 : 42));
        const height = Math.max(1, Number(entity.h) || Number(entity.height) || (powerUp ? 96 : 80));
        const respawnSeconds = powerUp
            ? Math.max(0, finiteNumberOr(entity.respawnSeconds, 60))
            : Math.max(0, finiteNumberOr(entity.respawnSeconds, 0));
        const collected = entity.state === "collected";
        return {
            id: entity.id || `${pickupKind}_${index + 1}`,
            entityId: entity.id || `${pickupKind}_${index + 1}`,
            kind,
            pickupKind: powerUp ? powerUp.effectId : pickupKind,
            powerUp,
            x: Number(entity.x) || 0,
            y: Number(entity.y) || 0,
            centerY: (Number(entity.y) || 0) - height * 0.5,
            width,
            height,
            radius: Math.max(4, Number(entity.radius) || powerUp?.radius || Math.min(width, height) * 0.42),
            amount: Math.max(1, Number(entity.amount) || (kind === "fuel" ? 40 : 1)),
            collected,
            respawnSeconds,
            respawnTimer: collected ? respawnSeconds : 0,
            randomEffectIds,
            randomRollCount,
            visualized: editorEntityVisuals(entity).length > 0
        };
    });
    if (!state.inventory || typeof state.inventory !== "object") state.inventory = { items: {} };
    if (!state.inventory.items || typeof state.inventory.items !== "object") state.inventory.items = {};

    state.score = normalizedScore(state);
    state.treasureChests = runtimeEntities.filter(treasureChestLike).map((entity, index) => {
        const width = Math.max(1, Number(entity.w) || Number(entity.width) || 130);
        const height = Math.max(1, Number(entity.h) || Number(entity.height) || 150);
        const authoredState = String(entity.state || "openLoot");
        const collected = entity.collected === true || authoredState === "openEmpty";
        return {
            id: entity.id || `treasureChest_${index + 1}`,
            entityId: entity.id || `treasureChest_${index + 1}`,
            x: Number(entity.x) || 0,
            y: Number(entity.y) || 0,
            width,
            height,
            scoreValue: normalizedScoreValue(entity.scoreValue, 100),
            collectionDistance: Math.max(8, finiteNumberOr(entity.collectionDistance, 88)),
            lootDisplaySeconds: Math.max(FIXED_DT, finiteNumberOr(entity.lootDisplaySeconds, 0.8)),
            lootDisplayTimer: collected && authoredState === "openLoot"
                ? Math.max(FIXED_DT, finiteNumberOr(entity.lootDisplaySeconds, 0.8))
                : 0,
            collected,
            state: collected ? "openEmpty" : (authoredState === "openEmpty" ? "openEmpty" : "openLoot")
        };
    });

    state.reactiveObjects = runtimeEntities.filter(isReactiveWorldEntity).map((entity, index) => {
        const authoredHealth = finiteNumberOr(entity.health, 60);
        const maxHealth = Math.max(1, finiteNumberOr(entity.maxHealth, authoredHealth));
        const initialState = String(entity.state || "intact");
        const health = initialState === "destroyed" || initialState === "inactive"
            ? 0
            : clamp(finiteNumberOr(entity.currentHealth, authoredHealth), 0, maxHealth);
        const damagedHealthThreshold = clamp(
            finiteNumberOr(entity.damagedHealthThreshold, maxHealth * 0.5),
            0,
            maxHealth
        );
        return {
            id: entity.id || `reactiveObject_${index + 1}`,
            entityId: entity.id || `reactiveObject_${index + 1}`,
            kind: String(entity.reactiveKind || "destructible"),
            type: String(entity.type || entity.kind || "reactiveObject"),
            x: Number(entity.x) || 0,
            y: Number(entity.y) || 0,
            width: Math.max(1, Number(entity.w) || Number(entity.width) || 80),
            height: Math.max(1, Number(entity.h) || Number(entity.height) || 80),
            health,
            maxHealth,
            state: health <= 0 ? "destroyed" : initialState,
            intactState: String(entity.intactState || "intact"),
            damagedState: String(entity.damagedState || "damaged"),
            destroyedState: String(entity.destroyedState || "destroyed"),
            damagedHealthThreshold,
            projectileDamageMultiplier: Math.max(0, finiteNumberOr(entity.projectileDamageMultiplier, 1)),
            blocksPlayer: entity.blocksPlayer !== false,
            blocksProjectiles: entity.blocksProjectiles !== false,
            collisionStates: Array.isArray(entity.collisionStates) ? entity.collisionStates.slice() : ["intact", "damaged"],
            projectileCollisionStates: Array.isArray(entity.projectileCollisionStates)
                ? entity.projectileCollisionStates.slice()
                : ["intact", "damaged"],
            collisionInsetX: Math.max(0, finiteNumberOr(entity.collisionInsetX, 0)),
            collisionInsetTop: Math.max(0, finiteNumberOr(entity.collisionInsetTop, 0)),
            collisionInsetBottom: Math.max(0, finiteNumberOr(entity.collisionInsetBottom, 0)),
            lastDamagedAt: null,
            lastHitBy: null
        };
    });
    for (const object of state.reactiveObjects) {
        syncReactiveObjectCollision(state, object);
    }

    state.targets = state.enemies.length ? state.enemies.map((enemy) => ({
        id: `${enemy.id}_target`,
        kind: "targetDummyBullseye",
        enemyId: enemy.id,
        x: enemy.targetX,
        y: enemy.targetY,
        radius: enemy.targetRadius,
        state: enemy.health > 0 ? "active" : "inactive",
        showMarker: enemy.showTargetMarker
    })) : [
        { id: "homing_dot", kind: "debugHomingDot", x: state.player.x + 520, y: state.player.y - 160, radius: 15, state: "active", showMarker: true }
    ];

    state.story.levelTitle = source.title || source.levelTitle || "Ignatius Rocketfrock and the Loaded Level of Reasonable Expectations";
    addEvent(state, "EDITOR_LEVEL_APPLIED", { placements: visuals.length, entities: entities.length });
    return true;
}

function applyCharacterCombatProfileToEnemy(state, enemy) {
    if (!isCharacterEnemyState(enemy)) return false;
    const profile = state.characterCombatProfiles?.[enemy.characterId];
    if (!profile || typeof profile !== "object") return false;
    const projectiles = Array.isArray(profile.projectiles) ? profile.projectiles : [];
    const projectile = projectiles.find((item) => String(item?.animationSlot || "attack") === "attack") || projectiles[0];
    if (!projectile) return false;

    const releaseTime = Math.max(0, finiteNumberOr(projectile.releaseTime, enemy.attackHitTime));
    enemy.attackMode = "projectile";
    enemy.attackDuration = Math.max(
        FIXED_DT,
        releaseTime + FIXED_DT,
        finiteNumberOr(profile.attackDuration, enemy.attackDuration)
    );
    enemy.attackHitTime = releaseTime;
    enemy.projectileReleaseTime = releaseTime;
    enemy.projectileLaunchType = String(projectile.launchType || enemy.projectileLaunchType || "straight");
    enemy.projectilePartName = projectile.partName ? String(projectile.partName) : enemy.projectilePartName;
    enemy.projectileFrameId = projectile.frameId ? String(projectile.frameId) : enemy.projectileFrameId;
    enemy.projectileKind = String(projectile.projectileKind || enemy.projectileKind || "fireball");
    enemy.projectileOriginLocalX = finiteNumberOr(projectile.localX, enemy.projectileOriginLocalX);
    enemy.projectileOriginLocalY = finiteNumberOr(projectile.localY, enemy.projectileOriginLocalY);
    enemy.projectileRigScale = Math.max(0.0001, finiteNumberOr(projectile.rigScale, enemy.projectileRigScale));
    return true;
}

export function applyCharacterCombatProfiles(state, profiles) {
    const profileMap = profiles instanceof Map
        ? profiles
        : new Map(Object.entries(profiles && typeof profiles === "object" ? profiles : {}));
    state.characterCombatProfiles = Object.fromEntries(
        [...profileMap.entries()].map(([characterId, profile]) => [String(characterId), deepClone(profile)])
    );
    let applied = 0;
    for (const enemy of state.enemies || []) {
        if (applyCharacterCombatProfileToEnemy(state, enemy)) applied += 1;
    }
    if (applied > 0) {
        addEvent(state, "CHARACTER_COMBAT_PROFILES_APPLIED", { enemies: applied });
    }
    return applied;
}

function estimateEditorLevelBounds(visuals, playerStart, entities) {
    const points = [];
    for (const visual of visuals) {
        points.push({ x: visual.x, y: visual.y });
        points.push({ x: visual.x + visual.w, y: visual.y + visual.h });
    }
    if (playerStart) points.push({ x: Number(playerStart.x) || 0, y: Number(playerStart.y) || 0 });
    for (const entity of entities) points.push({ x: Number(entity.x) || 0, y: Number(entity.y) || 0 });
    if (!points.length) return { x: -320, y: -460, w: 5200, h: 1500 };
    const minX = Math.min(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxX = Math.max(...points.map((p) => p.x));
    const maxY = Math.max(...points.map((p) => p.y));
    return {
        x: Math.floor(minX - 520),
        y: Math.floor(minY - 520),
        w: Math.ceil(maxX - minX + 1040),
        h: Math.ceil(maxY - minY + 1040)
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

function finiteNumberOr(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function stableStringHash(value) {
    let hash = 2166136261 >>> 0;
    for (const character of String(value || "")) {
        hash ^= character.charCodeAt(0);
        hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash >>> 0;
}

function mixedUint32(value) {
    let x = value >>> 0;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d) >>> 0;
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b) >>> 0;
    x ^= x >>> 16;
    return x >>> 0;
}

function ensureRandomState(state) {
    if (!state.random || typeof state.random !== "object") {
        state.random = { seed: 0x1a2b3c4d, levelLoadCount: 0 };
    }
    state.random.seed = (Math.floor(Number(state.random.seed)) >>> 0) || 0x1a2b3c4d;
    state.random.levelLoadCount = Math.max(0, Math.floor(Number(state.random.levelLoadCount) || 0));
    return state.random;
}

function deterministicPowerUpIndex(state, pickupId, rollCount, poolLength) {
    const random = ensureRandomState(state);
    const salt = stableStringHash(`${pickupId}:${random.levelLoadCount}:${Math.max(0, Math.floor(Number(rollCount) || 0))}`);
    return mixedUint32(random.seed ^ salt) % Math.max(1, poolLength);
}

function normalizedRandomEffectPool(effectIds) {
    const source = Array.isArray(effectIds) && effectIds.length ? effectIds : WRENCH_POWER_UP_EFFECT_IDS;
    return source
        .map((effectId) => powerUpEffectDefinition(effectId)?.id)
        .filter((effectId, index, all) => effectId && all.indexOf(effectId) === index);
}

function randomPowerUpEffectId(state, pickupId, effectIds, rollCount = 0) {
    const pool = normalizedRandomEffectPool(effectIds);
    if (!pool.length) return null;
    return pool[deterministicPowerUpIndex(state, pickupId, rollCount, pool.length)];
}

function autoSpawnRandomUnit(state, rollCount, channel) {
    const random = ensureRandomState(state);
    const salt = stableStringHash([
        "auto-spawn-enemy",
        state.world?.levelId || "level",
        random.levelLoadCount,
        Math.max(0, Math.floor(Number(rollCount) || 0)),
        String(channel || "roll")
    ].join(":"));
    return mixedUint32(random.seed ^ salt) / 4294967296;
}

function enemySpawnerRandomUnit(state, spawnerId, rollCount, channel) {
    const random = ensureRandomState(state);
    const salt = stableStringHash([
        "enemy-spawner",
        state.world?.levelId || "level",
        random.levelLoadCount,
        String(spawnerId || "enemySpawner"),
        Math.max(0, Math.floor(Number(rollCount) || 0)),
        String(channel || "roll")
    ].join(":"));
    return mixedUint32(random.seed ^ salt) / 4294967296;
}

function cameraVisibleWorldRect(state) {
    const camera = state.camera || {};
    const width = Math.max(1, Number(camera.viewportWidth) || 1280);
    const height = Math.max(1, Number(camera.viewportHeight) || 720);
    return {
        x: (Number(camera.x) || Number(state.player?.x) || 0) - width * 0.5,
        y: (Number(camera.y) || Number(state.player?.y) || 0) - height * 0.56,
        w: width,
        h: height
    };
}

function enemySpawnerOnScreen(state, spawner) {
    const width = Math.max(1, Number(spawner?.width) || 64);
    const height = Math.max(1, Number(spawner?.height) || 64);
    return rectsOverlap(cameraVisibleWorldRect(state), {
        x: (Number(spawner?.x) || 0) - width * 0.5,
        y: (Number(spawner?.y) || 0) - height,
        w: width,
        h: height
    });
}

function expectedAutoSpawnDirection(state) {
    const playerX = Number(state.player?.x) || 0;
    const entities = state.world?.entities || [];
    const exitDoor = wizardExitDoorEntity(entities);
    const exitDx = Number(exitDoor?.x) - playerX;
    if (Number.isFinite(exitDx) && Math.abs(exitDx) > 1) return exitDx < 0 ? -1 : 1;
    const entryDoor = wizardEntryDoorEntity(entities);
    const authoredRouteDx = Number(exitDoor?.x) - Number(entryDoor?.x);
    if (Number.isFinite(authoredRouteDx) && Math.abs(authoredRouteDx) > 1) return authoredRouteDx < 0 ? -1 : 1;
    return 1;
}

function autoSpawnBand(state, direction, enemyWidth, distanceUnit) {
    const camera = state.camera || {};
    const zoom = Math.max(0.1, Number(camera.zoom) || 1);
    const viewportWidth = Math.max(320, Number(camera.viewportWidth) || 1280 / zoom);
    const halfWidth = viewportWidth * 0.5;
    const edgeX = (Number(camera.x) || Number(state.player?.x) || 0) + direction * halfWidth;
    const bodyInset = Math.max(4, Math.max(1, Number(enemyWidth) || 1) * 0.52);
    const nearDistance = viewportWidth * 0.1;
    const farDistance = viewportWidth;
    const nearCenterDistance = nearDistance + bodyInset;
    const farCenterDistance = farDistance + bodyInset;
    const bandA = edgeX + direction * nearCenterDistance;
    const bandB = edgeX + direction * farCenterDistance;
    const minX = Math.min(bandA, bandB);
    const maxX = Math.max(bandA, bandB);
    const desiredDistance = nearCenterDistance + (farCenterDistance - nearCenterDistance) * clamp(Number(distanceUnit) || 0, 0, 1);
    const desiredX = edgeX + direction * desiredDistance;
    return { viewportWidth, edgeX, minX, maxX, desiredX, bodyInset };
}

function autoSpawnGroundPosition(state, enemy, band) {
    const supports = buildEnemyNavigationSupports(state.world, characterEnemyNavigationOptions(enemy, state));
    let best = null;
    for (const support of supports) {
        const minX = Math.max(Number(support.xMin) + band.bodyInset, band.minX);
        const maxX = Math.min(Number(support.xMax) - band.bodyInset, band.maxX);
        if (!Number.isFinite(minX) || !Number.isFinite(maxX) || minX > maxX) continue;
        const x = clamp(band.desiredX, minX, maxX);
        const point = supportPoint(support, x, 0);
        if (!point || !Number.isFinite(point.y)) continue;
        const slopeDx = Number(support.x2) - Number(support.x1);
        const slope = Math.abs(slopeDx) > 0.001
            ? (Number(support.y2) - Number(support.y1)) / slopeDx
            : 0;
        if (characterEnemyBodyBlockedAt(state, enemy, x, point.y, {
            ignoreSupportId: support.id,
            groundSlope: slope
        })) continue;
        const overlapsEnemy = (state.enemies || []).some((other) =>
            Number(other?.health) > 0 &&
            Math.abs((Number(other.x) || 0) - x) < (Math.max(1, Number(other.width) || 1) + enemy.width) * 0.5 + 24 &&
            Math.abs((Number(other.y) || 0) - point.y) < Math.max(enemy.height, Number(other.height) || 1)
        );
        if (overlapsEnemy) continue;
        const score = Math.abs(x - band.desiredX) + Math.abs(point.y - (Number(state.player?.y) || point.y)) * 0.08;
        if (!best || score < best.score) best = { x, y: point.y, support, score };
    }
    return best;
}

function autoSpawnFlyingPosition(state, enemy, band, verticalUnit) {
    const bounds = state.world?.bounds || { x: -100000, y: -100000, w: 200000, h: 200000 };
    const halfWidth = enemy.width * 0.5;
    const minX = Math.max(band.minX, Number(bounds.x) + halfWidth);
    const maxX = Math.min(band.maxX, Number(bounds.x) + Number(bounds.w) - halfWidth);
    if (!Number.isFinite(minX) || !Number.isFinite(maxX) || minX > maxX) return null;
    const x = clamp(band.desiredX, minX, maxX);
    const camera = state.camera || {};
    const zoom = Math.max(0.1, Number(camera.zoom) || 1);
    const viewportHeight = Math.max(240, Number(camera.viewportHeight) || 720 / zoom);
    const top = (Number(camera.y) || Number(state.player?.y) || 0) - viewportHeight * 0.5;
    const bottom = top + viewportHeight;
    const y = clamp(
        top + viewportHeight * (0.25 + clamp(Number(verticalUnit) || 0, 0, 1) * 0.42),
        Number(bounds.y) + enemy.height + 12,
        Number(bounds.y) + Number(bounds.h) - 12
    );
    if (y < top - enemy.height || y > bottom + enemy.height) return null;
    return { x, y, support: null };
}

function autoSpawnTargetForEnemy(enemy) {
    return {
        id: `${enemy.id}_target`,
        kind: "targetDummyBullseye",
        enemyId: enemy.id,
        x: enemy.targetX,
        y: enemy.targetY,
        radius: enemy.targetRadius,
        state: enemy.health > 0 ? "active" : "inactive",
        showMarker: enemy.showTargetMarker
    };
}

function activateSpawnedEnemy(state, enemy, position, { flash = false } = {}) {
    const flying = String(enemy.locomotion || "").trim().toLowerCase() === "flying";
    enemy.x = position.x;
    enemy.y = position.y;
    enemy.spawnX = position.x;
    enemy.spawnY = position.y;
    enemy.targetX = enemy.x - enemy.width * 0.5 + enemy.targetAnchorX * enemy.width;
    enemy.targetY = enemy.y - enemy.height + enemy.targetAnchorY * enemy.height;
    enemy.facing = (Number(state.player?.x) || 0) < enemy.x ? -1 : 1;
    enemy.awarenessTimer = Math.max(2, Number(enemy.awarenessHoldDuration) || 0);
    enemy.alerted = true;
    enemy.engaged = true;
    enemy.lastSeenPlayerX = Number(state.player?.x) || 0;
    enemy.lastSeenPlayerY = Number(state.player?.y) || 0;
    enemy.lastSeenAt = Number(state.clock?.time) || 0;
    enemy.routeRepathTimer = 0;
    if (flying) {
        enemy.bomberPerchX = position.x;
        enemy.bomberPerchY = position.y;
        enemy.flightBaseY = position.y;
        enemy.aiState = enemy.strategy === "bomber" ? "bomber" : "fly";
        enemy.movementPhase = "noticed_player";
    } else {
        enemy.strategy = "hunter";
        enemy.aiState = "pursue";
        enemy.movementPhase = "pursue";
        enemy.supportId = position.support?.id || null;
        enemy.currentSupportId = position.support?.id || null;
        enemy.homeSupportId = position.support?.id || null;
        enemy.airborne = false;
    }
    if (flash) enemy.hitFlashTimer = Math.max(Number(enemy.hitFlashTimer) || 0, 0.24);
    applyCharacterCombatProfileToEnemy(state, enemy);
    state.enemies = Array.isArray(state.enemies) ? state.enemies : [];
    state.enemies.push(enemy);
    state.targets = (state.targets || []).filter((target) => target.kind !== "debugHomingDot");
    state.targets.push(autoSpawnTargetForEnemy(enemy));
    return enemy;
}

function spawnPositionOverlapsActor(state, enemy, x, y) {
    const rect = {
        x: x - enemy.width * 0.5,
        y: y - enemy.height,
        w: enemy.width,
        h: enemy.height
    };
    if (rectsOverlap(rect, getPlayerRect(state))) return true;
    return (state.enemies || []).some((other) => {
        if (!other || Number(other.health) <= 0) return false;
        const width = Math.max(1, Number(other.width) || 1);
        const height = Math.max(1, Number(other.height) || 1);
        return rectsOverlap(rect, {
            x: (Number(other.x) || 0) - width * 0.5,
            y: (Number(other.y) || 0) - height,
            w: width,
            h: height
        });
    });
}

function emitEnemySpawnerFlash(state, enemy) {
    const centerX = Number(enemy.x) || 0;
    const centerY = (Number(enemy.y) || 0) - Math.max(16, Number(enemy.height) || 80) * 0.48;
    const baseRadius = Math.max(22, Math.min(54, Math.max(Number(enemy.width) || 0, Number(enemy.height) || 0) * 0.34));
    addSmokePuff(state, {
        kind: "enemyTeleportFlash",
        x: centerX,
        y: centerY,
        lifetime: 0.36,
        radius: baseRadius,
        colorIndex: 0
    });
    const particleScale = renderingParticleScale(state.settings);
    const count = Math.max(6, Math.round(10 * particleScale));
    for (let index = 0; index < count; index += 1) {
        const angle = Math.PI * 2 * index / count + enemySpawnerRandomUnit(state, enemy.id, index + 1, "flash-angle") * 0.34;
        const speed = 80 + enemySpawnerRandomUnit(state, enemy.id, index + 1, "flash-speed") * 95;
        addSmokePuff(state, {
            kind: "enemyTeleportSpark",
            x: centerX + Math.cos(angle) * baseRadius * 0.16,
            y: centerY + Math.sin(angle) * baseRadius * 0.16,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 18,
            lifetime: 0.28 + enemySpawnerRandomUnit(state, enemy.id, index + 1, "flash-life") * 0.16,
            radius: 2.2 + (index % 3) * 0.65,
            colorIndex: index % 3,
            rotation: angle,
            spin: (index % 2 ? 1 : -1) * 8
        });
    }
}

function spawnAutomaticEnemy(state, runtimeConfig) {
    const selection = resolveAutoSpawnEnemyIds(runtimeConfig, state.enemyCatalog);
    runtimeConfig.lastResolvedEnemyIds = selection.resolvedIds.slice();
    if (!selection.valid || !selection.resolvedIds.length) {
        runtimeConfig.lastError = selection.valid ? "The configured enemy pool resolves to no available enemies." : selection.errors.join(" ");
        return null;
    }
    runtimeConfig.lastError = null;
    const rollCount = Math.max(1, Math.floor(Number(runtimeConfig.rollCount) || 1));
    const selectedIndex = Math.min(
        selection.resolvedIds.length - 1,
        Math.floor(autoSpawnRandomUnit(state, rollCount, "enemy") * selection.resolvedIds.length)
    );
    const enemyDefinitionId = selection.resolvedIds[selectedIndex];
    const spawnIndex = Math.max(0, Math.floor(Number(runtimeConfig.spawnCount) || 0)) + 1;
    const id = `auto_spawn_enemy_${String(spawnIndex).padStart(4, "0")}`;
    const preliminaryEntity = enemyEntityFromDefinition(state.enemyCatalog, enemyDefinitionId, {
        id,
        x: Number(state.player?.x) || 0,
        y: Number(state.player?.y) || 0,
        autoSpawned: true,
        enemyDefinitionId
    });
    if (!preliminaryEntity) return null;
    const flying = String(preliminaryEntity.locomotion || "").trim().toLowerCase() === "flying";
    preliminaryEntity.strategy = flying
        ? String(preliminaryEntity.strategy || "bomber")
        : "hunter";
    const enemy = createCharacterEnemyRuntime(state, preliminaryEntity, (state.enemies || []).length);
    const direction = expectedAutoSpawnDirection(state);
    const band = autoSpawnBand(
        state,
        direction,
        enemy.width,
        autoSpawnRandomUnit(state, rollCount, "distance")
    );
    const position = flying
        ? autoSpawnFlyingPosition(state, enemy, band, autoSpawnRandomUnit(state, rollCount, "vertical"))
        : autoSpawnGroundPosition(state, enemy, band);
    if (!position) {
        runtimeConfig.lastError = "No safe off-screen spawn position exists in the forward route band.";
        return null;
    }

    activateSpawnedEnemy(state, enemy, position);
    runtimeConfig.spawnCount = spawnIndex;
    addEvent(state, "AUTO_ENEMY_SPAWNED", {
        enemyId: enemy.id,
        enemyDefinitionId,
        direction,
        x: round(enemy.x),
        y: round(enemy.y),
        distanceBeyondScreen: round(Math.max(0, Math.abs(enemy.x - band.edgeX) - enemy.width * 0.5))
    });
    return enemy;
}

function enemySpawnerGroundPosition(state, enemy, spawner) {
    const snapDistance = Math.max(24, Number(spawner.groundSnapDistance) || Number(enemy.groundSnapDistance) || 96);
    const support = findCharacterEnemyGroundSupport(
        state,
        Number(spawner.x) || 0,
        Number(spawner.y) || 0,
        snapDistance,
        snapDistance,
        enemy.width
    );
    if (!support) return null;
    const x = Number(spawner.x) || 0;
    const y = support.y;
    if (characterEnemyBodyBlockedAt(state, enemy, x, y, {
        ignoreSupportId: support.id,
        groundSlope: Number(support.slope) || 0
    })) return null;
    if (spawnPositionOverlapsActor(state, enemy, x, y)) return null;
    return { x, y, support };
}

function enemySpawnerFlyingPosition(state, enemy, spawner) {
    const x = Number(spawner.x) || 0;
    const y = Number(spawner.y) || 0;
    const bounds = state.world?.bounds;
    if (bounds) {
        const halfWidth = enemy.width * 0.5;
        if (x - halfWidth < Number(bounds.x) || x + halfWidth > Number(bounds.x) + Number(bounds.w)) return null;
        if (y - enemy.height < Number(bounds.y) || y > Number(bounds.y) + Number(bounds.h)) return null;
    }
    if (characterEnemyBodyBlockedAt(state, enemy, x, y)) return null;
    if (spawnPositionOverlapsActor(state, enemy, x, y)) return null;
    return { x, y, support: null };
}

function spawnEnemyFromSpawner(state, spawner) {
    const selection = resolveAutoSpawnEnemyIds(spawner, state.enemyCatalog);
    spawner.lastResolvedEnemyIds = selection.resolvedIds.slice();
    if (!selection.valid || !selection.resolvedIds.length) {
        spawner.lastError = selection.valid ? "The configured enemy pool resolves to no available enemies." : selection.errors.join(" ");
        return null;
    }
    spawner.lastError = null;
    const rollCount = Math.max(1, Math.floor(Number(spawner.rollCount) || 1));
    const selectedIndex = Math.min(
        selection.resolvedIds.length - 1,
        Math.floor(enemySpawnerRandomUnit(state, spawner.id, rollCount, "enemy") * selection.resolvedIds.length)
    );
    const enemyDefinitionId = selection.resolvedIds[selectedIndex];
    const spawnIndex = Math.max(0, Math.floor(Number(spawner.spawnCount) || 0)) + 1;
    const safeSpawnerId = String(spawner.id || "enemy_spawner").replace(/[^a-z0-9_]+/gi, "_");
    const id = `${safeSpawnerId}_enemy_${String(spawnIndex).padStart(4, "0")}`;
    const preliminaryEntity = enemyEntityFromDefinition(state.enemyCatalog, enemyDefinitionId, {
        id,
        x: Number(spawner.x) || 0,
        y: Number(spawner.y) || 0,
        autoSpawned: true,
        enemySpawnerId: spawner.id,
        enemyDefinitionId
    });
    if (!preliminaryEntity) return null;
    const flying = String(preliminaryEntity.locomotion || "").trim().toLowerCase() === "flying";
    preliminaryEntity.strategy = flying
        ? String(preliminaryEntity.strategy || "bomber")
        : "hunter";
    const enemy = createCharacterEnemyRuntime(state, preliminaryEntity, (state.enemies || []).length);
    const position = flying
        ? enemySpawnerFlyingPosition(state, enemy, spawner)
        : enemySpawnerGroundPosition(state, enemy, spawner);
    if (!position) {
        spawner.lastError = "The spawner position is blocked, occupied, or has no suitable ground for the selected enemy.";
        return null;
    }

    activateSpawnedEnemy(state, enemy, position, { flash: true });
    emitEnemySpawnerFlash(state, enemy);
    spawner.spawnCount = spawnIndex;
    addEvent(state, "ENEMY_SPAWNER_SPAWNED", {
        spawnerId: spawner.id,
        enemyId: enemy.id,
        enemyDefinitionId,
        x: round(enemy.x),
        y: round(enemy.y)
    });
    return enemy;
}

function updateEnemySpawners(state, dt) {
    for (const spawner of state.world?.enemySpawners || []) {
        const interval = Math.max(FIXED_DT, Number(spawner.intervalSeconds) || 1);
        const disabled = spawner.disableSignalChannel
            ? signalChannelRecord(state, spawner.disableSignalChannel, false)?.active === true
            : false;
        if (disabled) {
            spawner.onScreen = false;
            spawner.timer = interval;
            continue;
        }
        const onScreen = enemySpawnerOnScreen(state, spawner);
        spawner.onScreen = onScreen;
        if (!onScreen || Number(spawner.probabilityPercent) <= 0) {
            // Off-screen spawners are completely dormant. They do not accumulate
            // elapsed time and therefore cannot fire immediately when scrolled into view.
            spawner.timer = interval;
            continue;
        }
        spawner.timer = Math.max(-interval * 4, (Number(spawner.timer) || interval) - Math.max(0, Number(dt) || 0));
        let safety = 0;
        while (spawner.timer <= 0 && safety < 4) {
            spawner.timer += interval;
            spawner.rollCount = Math.max(0, Math.floor(Number(spawner.rollCount) || 0)) + 1;
            const chance = clamp(Number(spawner.probabilityPercent) || 0, 0, 100) / 100;
            if (enemySpawnerRandomUnit(state, spawner.id, spawner.rollCount, "chance") < chance) {
                spawnEnemyFromSpawner(state, spawner);
            }
            safety += 1;
        }
    }
}

function updateAutomaticEnemySpawning(state, dt) {
    const runtimeConfig = state.world?.autoSpawnEnemies;
    if (!runtimeConfig || runtimeConfig.enabled !== true || Number(runtimeConfig.probabilityPercent) <= 0) {
        if (runtimeConfig) runtimeConfig.timer = Math.max(FIXED_DT, Number(runtimeConfig.intervalSeconds) || 1);
        return;
    }
    const interval = Math.max(FIXED_DT, Number(runtimeConfig.intervalSeconds) || 1);
    runtimeConfig.timer = Math.max(-interval * 4, (Number(runtimeConfig.timer) || interval) - Math.max(0, Number(dt) || 0));
    let safety = 0;
    while (runtimeConfig.timer <= 0 && safety < 4) {
        runtimeConfig.timer += interval;
        runtimeConfig.rollCount = Math.max(0, Math.floor(Number(runtimeConfig.rollCount) || 0)) + 1;
        const chance = clamp(Number(runtimeConfig.probabilityPercent) || 0, 0, 100) / 100;
        if (autoSpawnRandomUnit(state, runtimeConfig.rollCount, "chance") < chance) {
            spawnAutomaticEnemy(state, runtimeConfig);
        }
        safety += 1;
    }
}

function pruneFinishedAutomaticEnemies(state) {
    const removedIds = new Set((state.enemies || [])
        .filter((enemy) => enemy?.autoSpawned === true && Number(enemy.health) <= 0 && Number(enemy.renderOpacity) <= 0)
        .map((enemy) => enemy.id));
    if (!removedIds.size) return;
    state.enemies = (state.enemies || []).filter((enemy) => !removedIds.has(enemy.id));
    state.targets = (state.targets || []).filter((target) => !removedIds.has(target.enemyId));
}

function sanitizeInput(inputFrame) {
    return createInputFrame(inputFrame || {});
}

function isCharacterEnemyState(enemy) {
    return enemy?.kind === "characterEnemy";
}

function snapCharacterEnemiesToNearbyGround(state) {
    const snapped = [];
    const sourceEntities = state.world?.entities || [];
    for (const enemy of state.enemies || []) {
        if (!isCharacterEnemyState(enemy) || enemy.locomotion === "flying") {
            continue;
        }
        const support = findCharacterEnemyGroundSupport(
            state,
            enemy.x,
            enemy.y,
            enemy.groundSnapDistance,
            enemy.groundSnapDistance,
            enemy.width
        );
        if (!support) {
            continue;
        }
        const fromY = enemy.y;
        enemy.y = support.y;
        enemy.spawnY = support.y;
        setCharacterEnemyGroundSupportIdentity(state, enemy, support);
        syncCharacterEnemyTarget(state, enemy);
        const source = sourceEntities.find((entity) => entity.id === enemy.id);
        if (source) {
            source.y = support.y;
        }
        snapped.push({
            enemyId: enemy.id,
            fromY,
            y: support.y,
            delta: support.y - fromY,
            supportId: support.id
        });
    }
    return snapped;
}

function movingPlatformForCollisionId(state, collisionId) {
    if (!collisionId) return null;
    return (state.world?.movingPlatforms || []).find((platform) => movingPlatformOwnsCollisionId(platform, collisionId)) || null;
}

function setCharacterEnemyGroundSupportIdentity(state, enemy, support) {
    enemy.supportId = support?.id || null;
    enemy.ridingPlatformId = movingPlatformForCollisionId(state, enemy.supportId)?.id || null;
}

function findCharacterEnemyGroundSupport(state, x, referenceY, maxStepUp, maxDrop, width = 1, options = {}) {
    const samples = [x, x - Math.max(0, width) * 0.24, x + Math.max(0, width) * 0.24];
    let best = null;
    const consider = (y, id, kind, sampleIndex, slope = 0) => {
        if (!Number.isFinite(y)) {
            return;
        }
        const delta = y - referenceY;
        if (delta < -Math.max(0, maxStepUp) || delta > Math.max(0, maxDrop)) {
            return;
        }
        const score = options.preferHighest && delta <= 0
            ? delta + sampleIndex * 0.0001
            : sampleIndex * 100000 + Math.abs(delta);
        if (!best || score < best.score) {
            best = { y, delta, id, kind, slope: finiteNumberOr(slope, 0), score };
        }
    };

    const supportQueryBounds = {
        minX: Math.min(...samples) - 2,
        minY: referenceY - Math.max(0, maxStepUp) - 2,
        maxX: Math.max(...samples) + 2,
        maxY: referenceY + Math.max(0, maxDrop) + 2
    };
    for (const segment of queryWorldSegments(state.world, supportQueryBounds)) {
        if (segment.kind !== "walkable" && segment.kind !== "blockable") {
            continue;
        }
        if (Math.abs(Number(segment.x2) - Number(segment.x1)) < 0.001) {
            continue;
        }
        const dx = Number(segment.x2) - Number(segment.x1);
        const slope = Math.abs(dx) > 0.001
            ? (Number(segment.y2) - Number(segment.y1)) / dx
            : 0;
        for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
            const y = segmentYAtX(segment, samples[sampleIndex]);
            if (y !== null) {
                consider(y, segment.id || "segment", segment.kind, sampleIndex, slope);
            }
        }
    }

    for (const solid of queryWorldSolids(state.world, supportQueryBounds)) {
        for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
            const sampleX = samples[sampleIndex];
            if (sampleX < solid.x - 0.001 || sampleX > solid.x + solid.w + 0.001) {
                continue;
            }
            consider(solid.y, solid.id || "solid", solid.kind || "solid", sampleIndex, 0);
        }
    }

    return best;
}

function setCharacterEnemyAnimation(enemy, slot) {
    const normalized = String(slot || "idle");
    if (enemy.animationSlot !== normalized) {
        enemy.animationSlot = normalized;
        enemy.state = normalized;
        enemy.animationTime = 0;
    }
}

function syncCharacterEnemyTarget(state, enemy) {
    const anchorX = clamp(Number(enemy.targetAnchorX ?? 0.5), 0, 1);
    const anchorY = clamp(Number(enemy.targetAnchorY ?? 0.42), 0, 1);
    enemy.targetX = enemy.x - enemy.width * 0.5 + anchorX * enemy.width;
    enemy.targetY = enemy.y - enemy.height + anchorY * enemy.height;
    const target = (state.targets || []).find((item) => item.enemyId === enemy.id);
    if (target) {
        target.x = enemy.targetX;
        target.y = enemy.targetY;
        target.radius = enemy.targetRadius;
        target.state = enemy.health > 0 ? "active" : "inactive";
    }
}

function characterEnemyBodyBlockedAt(state, enemy, x, groundY, options = {}) {
    const bodyWidth = Math.max(8, enemy.width * 0.58);
    const baseFootClearance = Math.max(8, Math.min(18, enemy.height * 0.12));
    // Ground movement represents the actor by an upright body rectangle while its
    // feet follow a sloped support. On a sufficiently steep downhill segment, the
    // uphill half of that same support can otherwise intrude into the probe and be
    // mistaken for a wall. Raise only the occupancy probe's lower edge by the
    // terrain rise across half the probe width; the actor position and shared swept
    // airborne collision geometry remain unchanged.
    const groundSlope = Math.abs(finiteNumberOr(options.groundSlope, 0));
    const slopeClearance = Math.min(enemy.height * 0.35, bodyWidth * 0.5 * groundSlope);
    const footClearance = baseFootClearance + slopeClearance;
    const headClearance = Math.max(2, Math.min(10, enemy.height * 0.04));
    const rect = {
        x: x - bodyWidth * 0.5,
        y: groundY - enemy.height + headClearance,
        w: bodyWidth,
        h: Math.max(1, enemy.height - headClearance - footClearance)
    };

    for (const solid of queryWorldSolids(state.world, rect)) {
        if (options.ignoreObstacleId && solid.id === options.ignoreObstacleId) {
            continue;
        }
        if (rectsOverlap(rect, solid)) {
            return true;
        }
    }
    for (const polygon of queryWorldCollisionPolygons(state.world, rect)) {
        if (options.ignoreObstacleId && polygon.id === options.ignoreObstacleId) {
            continue;
        }
        if (isAreaBlockingSegmentKind(polygon.kind) && polygonOverlapsRect(polygon, rect)) {
            return true;
        }
    }
    for (const segment of queryWorldSegments(state.world, rect)) {
        if (options.ignoreSupportId && (segment.id === options.ignoreSupportId || options.ignoreSupportId.startsWith(`${segment.id}_nav_`))) {
            continue;
        }
        // A green walkable line is a one-way floor: it supports feet from
        // above but must never become a horizontal wall through an actor's
        // torso while the actor walks underneath it.
        if (!isAreaBlockingSegmentKind(segment.kind)) {
            continue;
        }
        if (segmentRectIntersection(
            { x: segment.x1, y: segment.y1 },
            { x: segment.x2, y: segment.y2 },
            rect
        )) {
            return true;
        }
    }
    return false;
}

function pauseAndTurnCharacterEnemy(enemy) {
    enemy.facing *= -1;
    enemy.movementPhase = "idle";
    enemy.phaseTimer = Math.max(0, enemy.turnPause);
    setCharacterEnemyAnimation(enemy, "idle");
}

function characterEnemyAttackBlockedByTerrain(state, enemy) {
    const player = state.player;
    const start = {
        x: enemy.x,
        y: enemy.y - enemy.height * 0.5
    };
    const end = {
        x: player.x,
        y: player.y - player.height * 0.5
    };

    const terrainQueryBounds = {
        minX: Math.min(start.x, end.x),
        minY: Math.min(start.y, end.y),
        maxX: Math.max(start.x, end.x),
        maxY: Math.max(start.y, end.y)
    };
    for (const solid of queryWorldSolids(state.world, terrainQueryBounds)) {
        if (segmentRectIntersection(start, end, solid)) {
            return true;
        }
    }
    for (const segment of queryWorldSegments(state.world, terrainQueryBounds)) {
        if (!isAreaBlockingSegmentKind(segment.kind) && segment.kind !== "walkable") {
            continue;
        }
        if (segmentSegmentIntersection(start, end, { x: segment.x1, y: segment.y1 }, { x: segment.x2, y: segment.y2 })) {
            return true;
        }
    }
    for (const polygon of queryWorldCollisionPolygons(state.world, terrainQueryBounds)) {
        if (!isAreaBlockingSegmentKind(polygon.kind)) {
            continue;
        }
        if (pointInPolygon(start, polygon) || pointInPolygon(end, polygon) || firstSegmentPolygonBoundaryIntersection(start, end, polygon)) {
            return true;
        }
    }
    return false;
}

function playerIsAvailableCombatTarget(state) {
    const player = state.player;
    return Boolean(
        player &&
        player.visible !== false &&
        player.combatState !== "dead" &&
        player.targetable !== false
    );
}

function characterEnemyCanReachPlayer(state, enemy) {
    if (!playerIsAvailableCombatTarget(state)) {
        return false;
    }
    const playerRect = getPlayerRect(state);
    const attackRect = characterEnemyMeleeAttackRect(enemy);
    return rectsOverlap(playerRect, attackRect) && !characterEnemyAttackBlockedByTerrain(state, enemy);
}

function characterEnemyCanUseProjectile(state, enemy) {
    const player = state.player;
    if (!playerIsAvailableCombatTarget(state)) {
        return false;
    }
    const horizontalDistance = Math.abs(player.x - enemy.x);
    if (horizontalDistance < Math.max(0, Number(enemy.preferredAttackMinRange) || 0)) {
        return false;
    }
    return characterEnemyCanAttackFromPoint(state, enemy, { x: enemy.x, y: enemy.y });
}

function enemyProjectileSpawnPointAt(enemy, x, y, facing = enemy.facing) {
    const hasAuthoredOrigin = enemy.projectileOriginLocalX !== null && enemy.projectileOriginLocalX !== undefined &&
        enemy.projectileOriginLocalY !== null && enemy.projectileOriginLocalY !== undefined;
    const localX = Number(enemy.projectileOriginLocalX);
    const localY = Number(enemy.projectileOriginLocalY);
    const direction = Number(facing) < 0 ? -1 : 1;
    if (hasAuthoredOrigin && Number.isFinite(localX) && Number.isFinite(localY)) {
        const authoredScale = Math.max(0.0001, Number(enemy.projectileRigScale) || 1) * Math.max(0.05, Number(enemy.renderScale) || 1);
        return {
            x: x + localX * authoredScale * direction,
            y: y + localY * authoredScale
        };
    }
    return {
        x: x + direction * Math.max(16, enemy.width * 0.18),
        y: y - enemy.height * 0.67
    };
}

function enemyProjectileSpawnPoint(enemy) {
    return enemyProjectileSpawnPointAt(enemy, enemy.x, enemy.y, enemy.facing);
}

function solveBallisticLaunchVelocity(origin, target, launchSpeed, gravity) {
    const dx = target.x - origin.x;
    const dyUp = origin.y - target.y;
    const x = Math.abs(dx);
    const speed = Math.max(1, Number(launchSpeed) || 1);
    const g = Math.max(0.0001, Math.abs(Number(gravity) || 0.0001));
    if (x <= 0.0001) {
        return { x: 0, y: -speed };
    }
    const speedSq = speed * speed;
    const discriminant = speedSq * speedSq - g * (g * x * x + 2 * dyUp * speedSq);
    if (discriminant < 0) {
        return null;
    }
    const root = Math.sqrt(discriminant);
    const tanTheta = (speedSq + root) / (g * x);
    const cosTheta = 1 / Math.sqrt(1 + tanTheta * tanTheta);
    const sinTheta = tanTheta * cosTheta;
    const direction = dx < 0 ? -1 : 1;
    return {
        x: direction * speed * cosTheta,
        y: -speed * sinTheta
    };
}


function solveCharacterEnemyBallisticVelocity(enemy, origin, target) {
    const gravity = Number(enemy.projectileGravity) || 980;
    let launchSpeed = Math.max(1, Number(enemy.projectileSpeed) || 1);
    let velocity = solveBallisticLaunchVelocity(origin, target, launchSpeed, gravity);
    if (!velocity) {
        for (const multiplier of [1.1, 1.2, 1.35, 1.5, 1.75, 2]) {
            velocity = solveBallisticLaunchVelocity(origin, target, launchSpeed * multiplier, gravity);
            if (velocity) {
                launchSpeed *= multiplier;
                break;
            }
        }
    }
    return velocity ? { ...velocity, gravity, launchSpeed } : null;
}

function characterEnemyProjectilePathClearFromPoint(state, enemy, point) {
    const player = state.player;
    const facing = player.x < point.x ? -1 : 1;
    const origin = enemyProjectileSpawnPointAt(enemy, point.x, point.y, facing);
    const target = {
        x: player.x,
        y: player.y - player.height * 0.56
    };
    const radius = Math.max(1, Number(enemy.projectileRadius) || 1);
    const launchType = String(enemy.projectileLaunchType || (enemy.projectileKind === "musketBall" ? "ballistic" : "homing_lo"));

    if (launchType !== "ballistic") {
        const probe = { x: target.x, y: target.y, radius };
        return !findProjectileTerrainImpact(state, probe, origin.x, origin.y);
    }

    const ballistic = solveCharacterEnemyBallisticVelocity(enemy, origin, target);
    if (!ballistic || Math.abs(ballistic.x) < 0.0001) {
        return false;
    }
    const flightTime = (target.x - origin.x) / ballistic.x;
    if (!Number.isFinite(flightTime) || flightTime <= 0) {
        return false;
    }
    const sampleCount = Math.max(8, Math.min(80, Math.ceil(Math.abs(target.x - origin.x) / 18)));
    let previous = origin;
    for (let index = 1; index <= sampleCount; index += 1) {
        const time = flightTime * index / sampleCount;
        const next = {
            x: origin.x + ballistic.x * time,
            y: origin.y + ballistic.y * time + 0.5 * ballistic.gravity * time * time,
            radius
        };
        if (findProjectileTerrainImpact(state, next, previous.x, previous.y)) {
            return false;
        }
        previous = next;
    }
    return true;
}

function launchCharacterEnemyProjectile(state, enemy) {
    const player = state.player;
    const origin = String(enemy.projectileLaunchType || "") === "drop"
        ? {
            x: enemy.x,
            y: enemy.y + Math.max(4, enemy.height * 0.48)
        }
        : enemyProjectileSpawnPoint(enemy);
    const target = {
        x: player.x,
        y: player.y - player.height * 0.56
    };

    const projectileKind = String(enemy.projectileKind || "fireball");
    const launchType = String(enemy.projectileLaunchType || (projectileKind === "musketBall" ? "ballistic" : "homing_lo"));
    let vx = 0;
    let vy = 0;
    let gravity = Number(enemy.projectileGravity) || 0;
    let homingStrength = 0;
    let radius = Math.max(1, Number(enemy.projectileRadius) || 12);
    let damage = Math.max(0, Number(enemy.projectileDamage) || 0);
    let knockbackX = Math.max(0, Number(enemy.projectileKnockbackX) || 0);
    let knockbackY = Number(enemy.projectileKnockbackY) || 0;
    let lifetime = Math.max(FIXED_DT, Number(enemy.projectileLifetime) || 1);
    let trail = [];

    if (launchType === "drop") {
        vx = finiteNumberOr(enemy.velocityX, 0) * 0.18;
        vy = Math.max(0, Number(enemy.projectileSpeed) || 40);
        gravity = Math.max(1, Number(enemy.projectileGravity) || 900);
        homingStrength = 0;
        radius = Math.max(5, radius);
    } else if (launchType === "ballistic") {
        const ballistic = solveCharacterEnemyBallisticVelocity(enemy, origin, target);
        gravity = ballistic?.gravity || gravity || 980;
        const launchSpeed = ballistic?.launchSpeed || Math.max(1, Number(enemy.projectileSpeed) || 1);
        if (ballistic) {
            vx = ballistic.x;
            vy = ballistic.y;
        } else {
            const aim = normalizeVector({ x: target.x - origin.x, y: target.y - origin.y });
            vx = aim.x * launchSpeed;
            vy = aim.y * launchSpeed;
        }
        radius = Math.max(3, radius);
    } else {
        const aim = normalizeVector({ x: target.x - origin.x, y: target.y - origin.y });
        vx = aim.x * enemy.projectileSpeed;
        vy = aim.y * enemy.projectileSpeed;
        gravity = 0;
        if (launchType === "homing_hi" || launchType === "pathing_hi") {
            homingStrength = Math.max(2.4, Number(enemy.projectileHomingStrength) || 0);
        } else if (launchType === "homing_lo" || launchType === "pathing_lo") {
            homingStrength = Math.max(0.65, Number(enemy.projectileHomingStrength) || 0);
        } else {
            homingStrength = 0;
        }
        radius = Math.max(6, radius);
        trail = [{ x: origin.x, y: origin.y, time: state.clock.time }];
    }

    const projectile = {
        id: `enemy_projectile_${String(state.weapons.nextProjectileId).padStart(3, "0")}`,
        owner: "enemy",
        enemyId: enemy.id,
        characterId: enemy.characterId,
        frameId: enemy.projectileFrameId,
        projectilePartName: enemy.projectilePartName,
        launchType,
        kind: projectileKind === "musketBall" || launchType === "ballistic"
            ? "enemyMusketBall"
            : projectileKind === "rock" || projectileKind === "bomb"
                ? "enemyRock"
                : "enemyFireball",
        state: "launched",
        x: origin.x,
        y: origin.y,
        vx,
        vy,
        gravity,
        homingStrength,
        facing: enemy.facing,
        targetId: "player",
        age: 0,
        lifetime,
        explosionTimer: 0,
        radius,
        damage,
        knockbackX,
        knockbackY,
        trail
    };
    state.weapons.nextProjectileId += 1;
    state.projectiles.push(projectile);
    return projectile;
}

function characterEnemyRunSpeed(enemy, tuning = DEFAULT_TUNING) {
    return Math.max(0, finiteNumberOr(enemy?.runSpeed, tuning?.enemyDefaultRunSpeed));
}

function characterEnemyCanNoticePlayer(state, enemy) {
    const player = state.player;
    if (!playerIsAvailableCombatTarget(state)) {
        return false;
    }

    const enemyCenterY = enemy.y - enemy.height * 0.5;
    const playerCenterY = player.y - player.height * 0.5;
    const dx = player.x - enemy.x;
    const dy = playerCenterY - enemyCenterY;
    const awarenessRange = Math.max(0, Number(enemy.awarenessRange) || 0);
    const distance = Math.hypot(dx, dy);
    if (distance > awarenessRange) {
        return false;
    }
    if (distance <= 0.0001) {
        return true;
    }

    const facing = enemy.facing < 0 ? -1 : 1;
    const halfAngleDegrees = clamp(
        finiteNumberOr(enemy.awarenessViewHalfAngle, state.tuning.enemyDefaultAwarenessViewHalfAngle),
        0,
        180
    );
    const minimumForwardDot = Math.cos(halfAngleDegrees * Math.PI / 180);
    // Flying bombers judge their facing cone in the horizontal plane. Using the full
    // two-dimensional direction made a wizard standing below a bat appear outside a
    // narrow cone even when he was plainly in front of it. The range check above still
    // uses the real two-dimensional distance.
    const forwardDot = enemy.strategy === "bomber" && enemy.locomotion === "flying"
        ? (Math.abs(dx) <= 0.0001 ? 1 : Math.sign(dx) * facing)
        : dx * facing / distance;

    // Awareness is intentionally independent of collision geometry. Pillars, doors,
    // walkable lines, and blockable areas may obstruct movement or an actual attack,
    // but they do not make Ignatius invisible. Distance and the authored facing cone are
    // the only first-notice gates.
    return forwardDot + 1e-9 >= minimumForwardDot;
}

function updateCharacterEnemyAwareness(state, enemy, dt) {
    const wasAlerted = enemy.alerted === true;
    if (characterEnemyCanNoticePlayer(state, enemy)) {
        enemy.awarenessTimer = Math.max(FIXED_DT, Number(enemy.awarenessHoldDuration) || state.tuning.enemyDefaultAwarenessHoldSeconds || 1.2);
    } else {
        enemy.awarenessTimer = Math.max(0, (Number(enemy.awarenessTimer) || 0) - dt);
    }
    enemy.alerted = enemy.awarenessTimer > 0;

    if (enemy.alerted && !wasAlerted) {
        addEvent(state, "ENEMY_ALERTED", { enemyId: enemy.id });
    } else if (!enemy.alerted && wasAlerted) {
        addEvent(state, "ENEMY_ALERT_LOST", { enemyId: enemy.id });
    }
    return enemy.alerted;
}

function findCharacterEnemyWalkingSupport(state, enemy, candidateX, direction) {
    const authoredStepHeight = Math.max(0, Number(enemy.maxStepHeight) || 0);
    const automaticStepHeight = Math.max(authoredStepHeight, enemy.height * AUTOMATIC_STEP_HEIGHT_RATIO);
    const directSupport = findCharacterEnemyGroundSupport(
        state,
        candidateX,
        enemy.y,
        authoredStepHeight,
        enemy.maxDropDistance,
        enemy.width
    );
    const stepProbeX = candidateX + (direction < 0 ? -1 : 1) * Math.max(2, enemy.width * 0.14);
    const steppedSupport = findCharacterEnemyGroundSupport(
        state,
        stepProbeX,
        enemy.y,
        automaticStepHeight,
        enemy.maxDropDistance,
        enemy.width,
        { preferHighest: true }
    );
    const directClear = Boolean(directSupport) && !characterEnemyBodyBlockedAt(state, enemy, candidateX, directSupport.y, {
        groundSlope: directSupport.slope
    });
    const steppedClear = Boolean(steppedSupport) && !characterEnemyBodyBlockedAt(state, enemy, candidateX, steppedSupport.y, {
        groundSlope: steppedSupport.slope,
        ignoreSupportId: steppedSupport.id
    });

    // Preserve ordinary slope and moving-platform support selection. Only switch
    // to the automatic step candidate when it is a distinct, genuinely higher
    // surface inside one fifth of the actor's height.
    if (steppedSupport
        && directSupport
        && steppedSupport.id !== directSupport.id
        && Math.abs(steppedSupport.slope) < 0.08
        && Math.abs(directSupport.slope) < 0.08
        && steppedSupport.y < directSupport.y - 0.05
        && steppedClear) return steppedSupport;
    if (directClear) return directSupport;
    if (steppedClear) return steppedSupport;
    return null;
}

function moveCharacterEnemyToward(state, enemy, targetX, speed, dt, stopDistance = 0) {
    const dx = targetX - enemy.x;
    const distance = Math.abs(dx);
    const remainingDistance = Math.max(0, distance - Math.max(0, stopDistance));
    if (remainingDistance <= 0.0001 || speed <= 0 || dt <= 0) {
        return 0;
    }

    const direction = dx < 0 ? -1 : 1;
    let candidateX = enemy.x + direction * Math.min(remainingDistance, speed * dt);
    if (enemy.strategy === "simple_patrol" && enemy.patrolDistance > 0) {
        candidateX = clamp(candidateX, enemy.patrolMinX, enemy.patrolMaxX);
    }
    if (Math.abs(candidateX - enemy.x) <= 0.0001) {
        return 0;
    }

    const support = findCharacterEnemyWalkingSupport(state, enemy, candidateX, direction);
    if (!support) return 0;

    const moved = Math.abs(candidateX - enemy.x);
    enemy.facing = direction;
    enemy.x = candidateX;
    enemy.y = support.y;
    setCharacterEnemyGroundSupportIdentity(state, enemy, support);
    return moved;
}

function advanceCharacterEnemyAttackLunge(state, enemy, dt, elapsed, hitTime) {
    if (enemy.attackHitApplied || elapsed > hitTime || enemy.attackLungeRemaining <= 0) {
        return;
    }
    const player = state.player;
    const dx = player.x - enemy.x;
    if (Math.abs(dx) <= 0.001) {
        return;
    }

    enemy.facing = dx < 0 ? -1 : 1;
    const stopDistance = Math.max(
        Number(enemy.attackRange) || 1,
        (Math.max(1, Number(enemy.width) || 1) + Math.max(1, Number(player.width) || 1)) * 0.5 - 4
    );
    const speed = Math.min(
        Math.max(0, Number(enemy.attackLungeSpeed) || 0),
        enemy.attackLungeRemaining / Math.max(FIXED_DT, dt)
    );
    const moved = moveCharacterEnemyToward(state, enemy, player.x, speed, dt, stopDistance);
    enemy.attackLungeRemaining = Math.max(0, enemy.attackLungeRemaining - moved);
}

function startCharacterEnemyAttack(state, enemy) {
    enemy.attackDamage = Math.max(0, finiteNumberOr(enemy.attackDamage, state.tuning.enemyDefaultAttackDamage));
    enemy.attackRange = Math.max(1, finiteNumberOr(enemy.attackRange, state.tuning.enemyDefaultAttackRange));
    enemy.attackVerticalRange = Math.max(1, finiteNumberOr(enemy.attackVerticalRange, state.tuning.enemyDefaultAttackVerticalRange));
    enemy.attackDuration = Math.max(FIXED_DT, finiteNumberOr(enemy.attackDuration, state.tuning.enemyDefaultAttackDuration));
    enemy.attackHitTime = Math.max(0, finiteNumberOr(enemy.projectileReleaseTime, finiteNumberOr(enemy.attackHitTime, state.tuning.enemyDefaultAttackHitTime)));
    enemy.attackCooldown = Math.max(0, finiteNumberOr(enemy.attackCooldown, state.tuning.enemyDefaultAttackCooldown));
    enemy.attackMode = String(enemy.attackMode || state.tuning.enemyDefaultAttackMode || "melee") === "projectile" ? "projectile" : "melee";
    enemy.projectileSpeed = Math.max(1, finiteNumberOr(enemy.projectileSpeed, state.tuning.enemyDefaultProjectileSpeed));
    enemy.projectileGravity = finiteNumberOr(enemy.projectileGravity, state.tuning.enemyDefaultProjectileGravity);
    enemy.projectileLifetime = Math.max(FIXED_DT, finiteNumberOr(enemy.projectileLifetime, state.tuning.enemyDefaultProjectileLifetime));
    enemy.projectileRadius = Math.max(1, finiteNumberOr(enemy.projectileRadius, state.tuning.enemyDefaultProjectileRadius));
    enemy.projectileDamage = Math.max(0, finiteNumberOr(enemy.projectileDamage, state.tuning.enemyDefaultProjectileDamage));
    enemy.projectileCooldown = Math.max(0, finiteNumberOr(enemy.projectileCooldown, state.tuning.enemyDefaultProjectileCooldown));
    enemy.projectileHomingStrength = Math.max(0, finiteNumberOr(enemy.projectileHomingStrength, state.tuning.enemyDefaultProjectileHomingStrength));
    enemy.projectileKnockbackX = Math.max(0, finiteNumberOr(enemy.projectileKnockbackX, state.tuning.enemyDefaultProjectileKnockbackX));
    enemy.projectileKnockbackY = finiteNumberOr(enemy.projectileKnockbackY, state.tuning.enemyDefaultProjectileKnockbackY);
    enemy.attackLungeDistance = Math.max(0, finiteNumberOr(enemy.attackLungeDistance, state.tuning.enemyDefaultAttackLungeDistance));
    enemy.attackLungeSpeed = Math.max(0, finiteNumberOr(enemy.attackLungeSpeed, state.tuning.enemyDefaultAttackLungeSpeed));
    enemy.attackKnockbackX = Math.max(0, finiteNumberOr(enemy.attackKnockbackX, state.tuning.enemyDefaultAttackKnockbackX));
    enemy.attackKnockbackY = finiteNumberOr(enemy.attackKnockbackY, state.tuning.enemyDefaultAttackKnockbackY);
    const dx = state.player.x - enemy.x;
    if (Math.abs(dx) > 0.001) {
        enemy.facing = dx < 0 ? -1 : 1;
    }
    enemy.combatState = ENEMY_COMBAT_STATE.ATTACKING;
    enemy.movementPhase = "attack";
    enemy.attackTimer = Math.max(FIXED_DT, Number(enemy.attackDuration) || state.tuning.enemyDefaultAttackDuration || 0.44);
    enemy.attackLungeRemaining = enemy.attackMode === "projectile" ? 0 : Math.max(0, Number(enemy.attackLungeDistance) || 0);
    enemy.attackHitApplied = false;
    setCharacterEnemyAnimation(enemy, "attack");
    addEvent(state, "ENEMY_ATTACK_STARTED", {
        enemyId: enemy.id,
        damage: round(enemy.attackMode === "projectile" ? enemy.projectileDamage : enemy.attackDamage),
        attackMode: enemy.attackMode,
        facing: enemy.facing
    });
}

function updateCharacterEnemyAttack(state, enemy, dt) {
    const duration = Math.max(FIXED_DT, Number(enemy.attackDuration) || state.tuning.enemyDefaultAttackDuration || 0.44);
    const previousElapsed = duration - Math.max(0, Number(enemy.attackTimer) || 0);
    enemy.attackTimer = Math.max(0, (Number(enemy.attackTimer) || 0) - dt);
    const elapsed = duration - enemy.attackTimer;
    const hitTime = clamp(Number(enemy.attackHitTime) || 0, 0, duration);

    enemy.combatState = ENEMY_COMBAT_STATE.ATTACKING;
    enemy.movementPhase = "attack";
    setCharacterEnemyAnimation(enemy, "attack");
    advanceCharacterEnemyAttackLunge(state, enemy, dt, elapsed, hitTime);

    if (!enemy.attackHitApplied && previousElapsed <= hitTime && elapsed >= hitTime) {
        enemy.attackHitApplied = true;
        if (enemy.attackMode === "projectile") {
            const projectile = launchCharacterEnemyProjectile(state, enemy);
            if (projectile) {
                addEvent(state, "ENEMY_PROJECTILE_FIRED", {
                    enemyId: enemy.id,
                    projectileId: projectile.id,
                    projectileKind: projectile.kind,
                    projectilePartName: projectile.projectilePartName,
                    launchType: projectile.launchType,
                    x: round(projectile.x),
                    y: round(projectile.y)
                });
            } else {
                addEvent(state, "ENEMY_ATTACK_MISSED", { enemyId: enemy.id, reason: "projectileLaunchFailed" });
            }
        } else if (characterEnemyCanReachPlayer(state, enemy)) {
            const result = damagePlayer(state, enemy.attackDamage, enemy.id, {
                knockbackX: enemy.facing * enemy.attackKnockbackX,
                knockbackY: enemy.attackKnockbackY
            });
            addEvent(state, result.damage > 0 ? "ENEMY_ATTACK_HIT" : "ENEMY_ATTACK_BLOCKED", {
                enemyId: enemy.id,
                damage: round(result.damage),
                health: round(state.health.amount)
            });
        } else {
            addEvent(state, "ENEMY_ATTACK_MISSED", { enemyId: enemy.id });
        }
    }

    if (enemy.attackTimer <= 0) {
        enemy.combatState = ENEMY_COMBAT_STATE.ALIVE;
        enemy.movementPhase = "idle";
        enemy.phaseTimer = 0;
        enemy.attackCooldownTimer = Math.max(0, enemy.attackMode === "projectile" ? (Number(enemy.projectileCooldown) || 0) : (Number(enemy.attackCooldown) || 0));
        enemy.attackLungeRemaining = 0;
        enemy.attackHitApplied = false;
        setCharacterEnemyAnimation(enemy, "idle");
        addEvent(state, "ENEMY_ATTACK_ENDED", { enemyId: enemy.id });
    }
    syncCharacterEnemyTarget(state, enemy);
}


function characterEnemyAttackBlockedFromPoint(state, enemy, originX, originY) {
    const player = state.player;
    const start = {
        x: originX,
        y: originY - enemy.height * 0.5
    };
    const end = {
        x: player.x,
        y: player.y - player.height * 0.5
    };

    const terrainQueryBounds = {
        minX: Math.min(start.x, end.x),
        minY: Math.min(start.y, end.y),
        maxX: Math.max(start.x, end.x),
        maxY: Math.max(start.y, end.y)
    };
    for (const solid of queryWorldSolids(state.world, terrainQueryBounds)) {
        if (segmentRectIntersection(start, end, solid)) {
            return true;
        }
    }
    for (const segment of queryWorldSegments(state.world, terrainQueryBounds)) {
        if (!isAreaBlockingSegmentKind(segment.kind) && segment.kind !== "walkable") {
            continue;
        }
        if (segmentSegmentIntersection(start, end, { x: segment.x1, y: segment.y1 }, { x: segment.x2, y: segment.y2 })) {
            return true;
        }
    }
    for (const polygon of queryWorldCollisionPolygons(state.world, terrainQueryBounds)) {
        if (!isAreaBlockingSegmentKind(polygon.kind)) {
            continue;
        }
        if (pointInPolygon(start, polygon) || pointInPolygon(end, polygon) || firstSegmentPolygonBoundaryIntersection(start, end, polygon)) {
            return true;
        }
    }
    return false;
}

function characterEnemySupportSlope(support) {
    const dx = Number(support?.x2) - Number(support?.x1);
    return Math.abs(dx) > 0.001
        ? (Number(support?.y2) - Number(support?.y1)) / dx
        : 0;
}

function characterEnemyNavigationOptions(enemy, state = null) {
    return {
        bodyWidth: Math.max(8, Number(enemy.width) || 48),
        bodyHeight: Math.max(24, Number(enemy.height) || 120),
        maxStepHeight: Math.max(0, Number(enemy.maxStepHeight) || 0),
        maxStepGap: Math.max(10, Math.min(28, Number(enemy.width) * 0.32 || 18)),
        jumpHeight: Math.max(0, Number(enemy.jumpHeight) || 0),
        gravity: Math.max(1, Number(enemy.jumpGravity) || 1),
        runSpeed: Math.max(1, characterEnemyRunSpeed(enemy, state?.tuning) || 1),
        groundAcceleration: Math.max(1, Number(enemy.runAcceleration) || state?.tuning?.groundAcceleration || 950),
        maxFallDistance: Math.max(0, Number(enemy.maxFallDistance) || 0),
        edgeInset: Math.max(6, Number(enemy.width) * 0.22 || 10),
        bodyClearance: Math.max(10, Number(enemy.width) * 0.34 || 12)
    };
}

function characterEnemyNavigationAdjustedEdge(state, edge, graph = null) {
    let adjustedCost = Math.max(0, Number(edge?.cost) || 0);
    const blockers = state.world?.navigationBlockers || [];
    for (const blockerId of edge?.blockerIds || []) {
        const blocker = blockers.find((item) => item.id === blockerId);
        const stateValue = state.world?.entityStates?.[blockerId] ?? blocker?.state ?? blocker?.closedState ?? "closed";
        const openStates = Array.isArray(blocker?.openStates) ? blocker.openStates : ["open", "opened", "destroyed", "disabled"];
        if (!openStates.includes(String(stateValue))) {
            return null;
        }
    }
    for (const rule of graph?.dynamicCostRules || []) {
        const matchesEdge = Array.isArray(rule.edgeIds) && rule.edgeIds.includes(edge.id);
        const matchesBlocker = rule.blockerId && (edge?.blockerIds || []).includes(rule.blockerId);
        if (!matchesEdge && !matchesBlocker) {
            continue;
        }
        const blockerId = String(rule.blockerId || "");
        const blocker = blockers.find((item) => item.id === blockerId);
        const stateValue = state.world?.entityStates?.[blockerId] ?? blocker?.state ?? rule.defaultState ?? "closed";
        const activeStates = Array.isArray(rule.activeStates) ? rule.activeStates : ["closed", "locked", "intact", "active"];
        if (!activeStates.includes(String(stateValue))) {
            continue;
        }
        if (rule.disabledWhenActive === true) {
            return null;
        }
        adjustedCost += Math.max(0, Number(rule.penalty) || 0);
    }
    return adjustedCost === Number(edge.cost) ? edge : { ...edge, cost: adjustedCost };
}

function characterEnemyTraversalAllowedFromSupport(edge, sourceSupport) {
    if (!edge || sourceSupport?.kind !== "walkable") {
        return true;
    }
    const launchY = Number(edge.launchY);
    const landingY = Number(edge.landingY);
    if (!Number.isFinite(launchY) || !Number.isFinite(landingY) || landingY <= launchY + 0.001) {
        return true;
    }
    // Monsters may descend from a green one-way line only by walking off the
    // authored endpoint. Reject old baked jump arcs and malformed drop edges
    // before the planner can turn them into an endless hop-and-land loop.
    if (edge.type !== "drop" || edge.walkOff !== true) {
        return false;
    }
    const vx = Number(edge.vx) || 0;
    const launchX = Number(edge.launchX);
    const landingX = Number(edge.landingX);
    if (Math.abs(vx) <= 0.001 || !Number.isFinite(launchX) || !Number.isFinite(landingX)) {
        return false;
    }
    const sourceEdgeX = vx < 0 ? Number(sourceSupport.xMin) : Number(sourceSupport.xMax);
    const span = Math.max(0, Number(sourceSupport.xMax) - Number(sourceSupport.xMin));
    const endpointTolerance = Math.max(3, Math.min(8, span * 0.04));
    if (!Number.isFinite(sourceEdgeX) || Math.abs(launchX - sourceEdgeX) > endpointTolerance) {
        return false;
    }
    return vx < 0 ? landingX < launchX - 0.001 : landingX > launchX + 0.001;
}

function movingPlatformAtEndpoint(state, platform, endpoint, tolerance = 1.5) {
    const visual = movingPlatformVisual(state, platform);
    if (!visual) return false;
    const targetX = endpoint === "end" ? platform.endX : platform.startX;
    const targetY = endpoint === "end" ? platform.endY : platform.startY;
    return Math.hypot((Number(visual.x) || 0) - targetX, (Number(visual.y) || 0) - targetY) <= tolerance;
}

function movingPlatformNavigationSupports(state) {
    const supports = [];
    for (const platform of state.world?.movingPlatforms || []) {
        if (platform.movement?.pattern !== "shuttle" || !["automatic", "rider"].includes(platform.movement?.activation)) {
            continue;
        }
        const visual = movingPlatformVisual(state, platform);
        if (!visual) continue;
        const currentOffsetX = (Number(visual.x) || 0) - platform.startX;
        const currentOffsetY = (Number(visual.y) || 0) - platform.startY;
        const candidates = (platform.segments || [])
            .filter((segment) => ["walkable", "blockable"].includes(segment.kind))
            .map((segment) => {
                const x1 = Number(segment.x1) || 0;
                const y1 = Number(segment.y1) || 0;
                const x2 = Number(segment.x2) || 0;
                const y2 = Number(segment.y2) || 0;
                const dx = x2 - x1;
                return {
                    segment,
                    x1,
                    y1,
                    x2,
                    y2,
                    length: Math.hypot(dx, y2 - y1),
                    midpointY: (y1 + y2) * 0.5,
                    horizontalShare: Math.abs(dx) / Math.max(0.001, Math.hypot(dx, y2 - y1))
                };
            })
            .filter((candidate) => candidate.length >= 12 && candidate.horizontalShare >= 0.78);
        if (!candidates.length) continue;
        const topY = Math.min(...candidates.map((candidate) => candidate.midpointY));
        const topCandidates = candidates.filter((candidate) => candidate.midpointY <= topY + 8);
        for (const candidate of topCandidates) {
            const base = {
                kind: "movingPlatform",
                x1: candidate.x1 - currentOffsetX,
                y1: candidate.y1 - currentOffsetY,
                x2: candidate.x2 - currentOffsetX,
                y2: candidate.y2 - currentOffsetY,
                movingPlatformId: platform.id,
                collisionId: candidate.segment.id,
                sourcePolygonId: `movingPlatform:${platform.id}`,
                obstacleXMin: null,
                obstacleXMax: null
            };
            const pairId = `${platform.id}:${candidate.segment.id}`;
            for (const endpoint of ["start", "end"]) {
                const offsetX = endpoint === "end" ? platform.endX - platform.startX : 0;
                const offsetY = endpoint === "end" ? platform.endY - platform.startY : 0;
                const x1 = base.x1 + offsetX;
                const y1 = base.y1 + offsetY;
                const x2 = base.x2 + offsetX;
                const y2 = base.y2 + offsetY;
                supports.push({
                    ...base,
                    id: `moving:${pairId}:${endpoint}`,
                    x1,
                    y1,
                    x2,
                    y2,
                    xMin: Math.min(x1, x2),
                    xMax: Math.max(x1, x2),
                    platformEndpoint: endpoint,
                    platformPairId: pairId
                });
            }
        }
    }
    return supports;
}

function movingPlatformNavigationBundle(state, options, staticSupports, staticEdgeMap) {
    const world = state.world;
    if (!world || !(staticEdgeMap instanceof Map)) {
        return { supports: staticSupports, edgeMap: staticEdgeMap };
    }
    const platformSupports = movingPlatformNavigationSupports(state);
    if (!platformSupports.length) {
        return { supports: staticSupports, edgeMap: staticEdgeMap };
    }
    const platformSignature = platformSupports.map((support) => [
        support.id,
        support.x1,
        support.y1,
        support.x2,
        support.y2
    ].join(":")).join("|");
    const cacheKey = `${enemyNavigationProfileKey(options)}::${enemyNavigationSupportsSignature(staticSupports)}::${platformSignature}`;
    let worldCache = MOVING_PLATFORM_NAVIGATION_CACHE.get(world);
    if (!worldCache) {
        worldCache = new Map();
        MOVING_PLATFORM_NAVIGATION_CACHE.set(world, worldCache);
    }
    const cached = worldCache.get(cacheKey);
    if (cached) {
        const edgeMap = new Map();
        for (const support of cached.supports) {
            const staticEdges = staticEdgeMap.get(support.id);
            edgeMap.set(support.id, staticEdges ? [...staticEdges, ...(cached.extraEdges.get(support.id) || [])] : [...(cached.extraEdges.get(support.id) || [])]);
        }
        return { supports: cached.supports, edgeMap };
    }

    const supports = [...staticSupports, ...platformSupports];
    const generated = buildEnemyNavigationEdges(supports, { ...options, world });
    const extraEdges = new Map(supports.map((support) => [support.id, []]));
    const supportById = new Map(supports.map((support) => [support.id, support]));
    for (const [fromId, edges] of generated) {
        const from = supportById.get(fromId);
        for (const edge of edges || []) {
            const to = supportById.get(edge.to);
            const involvesPlatform = Boolean(from?.movingPlatformId || to?.movingPlatformId);
            if (!involvesPlatform) continue;
            if (from?.movingPlatformId && to?.movingPlatformId) continue;
            // Boarding and disembarking are deliberate ground-level transfers.
            // Hunters never guess ballistic jumps toward a platform that may move.
            if (edge.type === "step") {
                extraEdges.get(fromId).push({ ...edge, movingPlatformTransfer: true });
            }
        }
    }

    const pairs = new Map();
    for (const support of platformSupports) {
        const pair = pairs.get(support.platformPairId) || {};
        pair[support.platformEndpoint] = support;
        pairs.set(support.platformPairId, pair);
    }
    for (const pair of pairs.values()) {
        if (!pair.start || !pair.end) continue;
        const platform = (world.movingPlatforms || []).find((item) => item.id === pair.start.movingPlatformId);
        if (!platform) continue;
        const startCenterX = (pair.start.xMin + pair.start.xMax) * 0.5;
        const endCenterX = (pair.end.xMin + pair.end.xMax) * 0.5;
        const startY = (pair.start.y1 + pair.start.y2) * 0.5;
        const endY = (pair.end.y1 + pair.end.y2) * 0.5;
        const travelDistance = Math.hypot(endCenterX - startCenterX, endY - startY);
        const pauseCost = (Math.max(0, platform.movement.startPause) + Math.max(0, platform.movement.endPause)) * options.runSpeed;
        const cost = travelDistance + pauseCost;
        extraEdges.get(pair.start.id).push({
            id: `ride:${platform.id}:start:end`,
            type: "ride",
            from: pair.start.id,
            to: pair.end.id,
            launchX: startCenterX,
            launchY: startY,
            landingX: endCenterX,
            landingY: endY,
            direction: endCenterX < startCenterX ? -1 : 1,
            cost,
            platformId: platform.id,
            collisionId: pair.start.collisionId,
            fromEndpoint: "start",
            toEndpoint: "end",
            blockerIds: []
        });
        extraEdges.get(pair.end.id).push({
            id: `ride:${platform.id}:end:start`,
            type: "ride",
            from: pair.end.id,
            to: pair.start.id,
            launchX: endCenterX,
            launchY: endY,
            landingX: startCenterX,
            landingY: startY,
            direction: startCenterX < endCenterX ? -1 : 1,
            cost,
            platformId: platform.id,
            collisionId: pair.end.collisionId,
            fromEndpoint: "end",
            toEndpoint: "start",
            blockerIds: []
        });
    }
    worldCache.set(cacheKey, { supports, extraEdges });
    const edgeMap = new Map();
    for (const support of supports) {
        const staticEdges = staticEdgeMap.get(support.id);
        edgeMap.set(support.id, staticEdges ? [...staticEdges, ...(extraEdges.get(support.id) || [])] : [...(extraEdges.get(support.id) || [])]);
    }
    return { supports, edgeMap };
}

function movingPlatformSupportAvailable(state, support) {
    if (!support?.movingPlatformId) return true;
    const platform = (state.world?.movingPlatforms || []).find((item) => item.id === support.movingPlatformId);
    return Boolean(platform?.collisionAttached && movingPlatformAtEndpoint(state, platform, support.platformEndpoint));
}

function translatedRiderNavigationSupport(state, enemy, supports) {
    const platform = movingPlatformForCollisionId(state, enemy.supportId);
    if (!platform) return null;
    const routeEdge = enemy.route?.[enemy.routeIndex];
    const preferredId = routeEdge?.type === "ride" && routeEdge.platformId === platform.id
        ? routeEdge.from
        : enemy.currentSupportId;
    const fixed = navigationSupportById(supports, preferredId) || supports.find((support) => (
        support.movingPlatformId === platform.id && support.collisionId === enemy.supportId && support.platformEndpoint === "start"
    ));
    if (!fixed) return null;
    const visual = movingPlatformVisual(state, platform);
    if (!visual) return null;
    const endpointX = fixed.platformEndpoint === "end" ? platform.endX : platform.startX;
    const endpointY = fixed.platformEndpoint === "end" ? platform.endY : platform.startY;
    const dx = (Number(visual.x) || 0) - endpointX;
    const dy = (Number(visual.y) || 0) - endpointY;
    const support = {
        ...fixed,
        x1: fixed.x1 + dx,
        y1: fixed.y1 + dy,
        x2: fixed.x2 + dx,
        y2: fixed.y2 + dy,
        xMin: fixed.xMin + dx,
        xMax: fixed.xMax + dx
    };
    return { support, x: enemy.x, y: enemy.y, delta: 0, score: -1 };
}

function staticEnemyNavigationBundle(state, options) {
    const world = state.world;
    const solids = world?.solids || [];
    const segments = world?.segments || [];
    const polygons = world?.collisionPolygons || [];
    let cache = STATIC_ENEMY_NAVIGATION_CACHE.get(world);
    if (!cache
        || cache.solids !== solids
        || cache.segments !== segments
        || cache.polygons !== polygons
        || cache.solidCount !== solids.length
        || cache.segmentCount !== segments.length
        || cache.polygonCount !== polygons.length) {
        cache = {
            solids,
            segments,
            polygons,
            solidCount: solids.length,
            segmentCount: segments.length,
            polygonCount: polygons.length,
            profiles: new Map()
        };
        STATIC_ENEMY_NAVIGATION_CACHE.set(world, cache);
    }

    const profileKey = enemyNavigationProfileKey(options);
    const cached = cache.profiles.get(profileKey);
    if (cached) return cached;

    const liveSupports = buildEnemyNavigationSupports(world, options);
    const supportSignature = enemyNavigationSupportsSignature(liveSupports);
    const candidateGraph = findBakedEnemyNavigationGraph(world?.navigationGraphs, options);
    const bakedGraph = candidateGraph?.supportSignature === supportSignature
        ? candidateGraph
        : null;
    const staticSupports = bakedGraph?.supports?.length ? bakedGraph.supports : liveSupports;
    const staticEdgeMap = bakedGraph?.edges?.length
        ? enemyNavigationEdgeMapFromFlat(bakedGraph.edges, staticSupports)
        : buildEnemyNavigationEdges(staticSupports, { ...options, world });
    const bundle = { staticSupports, staticEdgeMap, bakedGraph };
    cache.profiles.set(profileKey, bundle);
    return bundle;
}

function characterEnemyNavigationContext(state, enemy) {
    const options = characterEnemyNavigationOptions(enemy, state);
    const { staticSupports, staticEdgeMap, bakedGraph } = staticEnemyNavigationBundle(state, options);
    const movingBundle = movingPlatformNavigationBundle(state, options, staticSupports, staticEdgeMap);
    const supports = movingBundle.supports;
    const rawEdgeMap = movingBundle.edgeMap;
    const edgeMap = new Map();
    for (const support of supports) {
        edgeMap.set(support.id, (rawEdgeMap.get(support.id) || [])
            .map((edge) => characterEnemyNavigationAdjustedEdge(state, edge, bakedGraph))
            .filter((edge) => edge && characterEnemyTraversalAllowedFromSupport(edge, support)));
    }
    const riderCurrent = translatedRiderNavigationSupport(state, enemy, supports);
    const current = riderCurrent || findEnemyNavigationSupport(supports.filter((support) => movingPlatformSupportAvailable(state, support)), enemy.x, enemy.y, {
        maxRise: Math.max(8, Number(enemy.maxStepHeight) || 0),
        maxDrop: Math.max(12, Number(enemy.maxDropDistance) || 0),
        width: enemy.width,
        sampleHalfWidthFactor: enemy.currentSupportId ? 0.48 : 0.22,
        preferredSupportId: enemy.currentSupportId
    });
    if (current) {
        enemy.currentSupportId = current.support.id;
        if (!enemy.homeSupportId) {
            enemy.homeSupportId = current.support.id;
            enemy.spawnY = current.y;
        }
    }
    enemy.navigationGraphSource = bakedGraph ? "baked" : "runtime";
    enemy.navigationGraphId = bakedGraph?.id || null;
    return { supports, current, edgeMap, bakedGraph };
}

function characterEnemyPlayerSupport(state, enemy, supports) {
    return findEnemyNavigationSupport(supports.filter((support) => movingPlatformSupportAvailable(state, support)), state.player.x, state.player.y, {
        maxRise: Math.max(40, Number(enemy.jumpHeight) || 0) + 80,
        maxDrop: Math.max(160, Number(enemy.maxFallDistance) || 0) + 160,
        width: state.player.width
    });
}

function characterEnemyRoute(state, enemy, supports, startSupportId, targetSupportId, edgeMap = null, targetX = null) {
    return planEnemyNavigationRoute(
        supports,
        startSupportId,
        targetSupportId,
        {
            ...characterEnemyNavigationOptions(enemy, state),
            edgeMap,
            startX: enemy.x,
            targetX
        }
    );
}

function characterEnemyReadyToAttackFromCurrentPosition(state, enemy) {
    if (enemy.attackMode !== "projectile") {
        return characterEnemyCanReachPlayer(state, enemy);
    }
    if (!characterEnemyCanUseProjectile(state, enemy)) {
        return false;
    }
    const horizontalDistance = Math.abs(state.player.x - enemy.x);
    return horizontalDistance >= Math.max(0, Number(enemy.preferredAttackMinRange) || 0);
}

function characterEnemyCanUseLocalGroundPursuit(state, enemy) {
    if (enemy.attackMode === "projectile" || !state.player?.targetable) {
        return false;
    }
    const automaticStepHeight = Math.max(0, enemy.height * AUTOMATIC_STEP_HEIGHT_RATIO);
    const verticalTolerance = Math.max(
        8,
        Number(enemy.maxStepHeight) || 0,
        automaticStepHeight
    );
    if (Math.abs((Number(state.player.y) || 0) - (Number(enemy.y) || 0)) > verticalTolerance + 2) {
        return false;
    }
    const playerGround = findCharacterEnemyGroundSupport(
        state,
        Number(state.player.x) || 0,
        Number(state.player.y) || 0,
        verticalTolerance + 2,
        verticalTolerance + 8,
        Math.max(8, Number(state.player.width) || enemy.width)
    );
    const enemyGround = findCharacterEnemyGroundSupport(
        state,
        Number(enemy.x) || 0,
        Number(enemy.y) || 0,
        verticalTolerance + 2,
        verticalTolerance + 8,
        enemy.width
    );
    if (!playerGround || !enemyGround) {
        return false;
    }
    return Math.abs(playerGround.y - enemyGround.y) <= verticalTolerance + 2;
}

function updateCharacterEnemyLocalGroundPursuit(state, enemy, dt) {
    if (!characterEnemyCanUseLocalGroundPursuit(state, enemy)) {
        return false;
    }
    const dx = (Number(state.player.x) || 0) - (Number(enemy.x) || 0);
    if (Math.abs(dx) > 0.001) {
        enemy.facing = dx < 0 ? -1 : 1;
    }
    enemy.engaged = true;
    enemy.alerted = true;
    enemy.aiState = "pursue";
    clearCharacterEnemyNavigationPlan(enemy);
    enemy.routeRepathTimer = Math.max(FIXED_DT, Number(enemy.routeRepathInterval) || FIXED_DT);

    if (enemy.attackCooldownTimer <= 0 && characterEnemyReadyToAttackFromCurrentPosition(state, enemy)) {
        startCharacterEnemyAttack(state, enemy);
        return true;
    }

    const stopDistance = Math.max(4, Math.min(
        Math.max(1, Number(enemy.attackRange) || 1) * 0.72,
        Math.max(6, Math.abs(dx) - 1)
    ));
    const speed = Math.max(1, Number(enemy.runSpeed) || Number(enemy.walkSpeed) || 1);
    const moved = moveCharacterEnemyToward(state, enemy, state.player.x, speed, dt, stopDistance);
    if (moved > 0) {
        enemy.movementPhase = "local_pursuit";
        setCharacterEnemyAnimation(enemy, "walk");
    } else {
        enemy.movementPhase = "pursue";
        setCharacterEnemyAnimation(enemy, "idle");
    }
    return true;
}

function characterEnemyCanAttackFromPoint(state, enemy, point) {
    const horizontalDistance = Math.abs(state.player.x - point.x);
    const enemyCenterY = point.y - enemy.height * 0.55;
    const playerCenterY = state.player.y - state.player.height * 0.5;
    if (Math.abs(playerCenterY - enemyCenterY) > Math.max(1, Number(enemy.attackVerticalRange) || 1)) {
        return false;
    }
    if (horizontalDistance > Math.max(1, Number(enemy.attackRange) || 1)) {
        return false;
    }
    if (enemy.attackMode === "projectile") {
        const minimumRange = Math.max(0, Number(enemy.preferredAttackMinRange) || 0);
        if (horizontalDistance < minimumRange * 0.72) {
            return false;
        }
        return characterEnemyProjectilePathClearFromPoint(state, enemy, point);
    }
    return !characterEnemyAttackBlockedFromPoint(state, enemy, point.x, point.y);
}

function characterEnemyAttackCandidateXs(enemy, support, playerX, preferredRange) {
    const supportInset = Math.min(
        Math.max(4, Number(enemy.width) * 0.35 || 4),
        Math.max(0, (support.xMax - support.xMin) * 0.45)
    );
    const supportMin = support.xMin + supportInset;
    const supportMax = support.xMax - supportInset;
    if (supportMax < supportMin) {
        return [(support.xMin + support.xMax) * 0.5];
    }

    const attackRange = Math.max(1, Number(enemy.attackRange) || 1);
    const minimumRange = Math.max(0, Number(enemy.preferredAttackMinRange) || 0);
    const windowMin = Math.max(supportMin, playerX - attackRange);
    const windowMax = Math.min(supportMax, playerX + attackRange);
    if (windowMax < windowMin) {
        return [];
    }

    const values = [
        playerX - preferredRange,
        playerX + preferredRange,
        playerX - minimumRange,
        playerX + minimumRange,
        enemy.x,
        windowMin,
        windowMax,
        (windowMin + windowMax) * 0.5
    ];
    if (enemy.attackMode === "projectile") {
        const width = Math.max(0, windowMax - windowMin);
        const desiredSpacing = Math.max(18, Math.min(44, Number(enemy.width) * 0.48 || 32));
        const intervals = Math.max(1, Math.min(28, Math.ceil(width / desiredSpacing)));
        for (let index = 0; index <= intervals; index += 1) {
            values.push(windowMin + width * index / intervals);
        }
    }

    const unique = new Map();
    for (const value of values) {
        const x = clamp(Number(value) || 0, windowMin, windowMax);
        unique.set(x.toFixed(3), x);
    }
    return [...unique.values()];
}

function chooseCharacterEnemyAttackPlan(state, enemy, navigation) {
    const startSupport = navigation.current?.support;
    if (!startSupport) {
        return null;
    }
    const player = state.player;
    const preferredRange = enemy.attackMode === "projectile"
        ? Math.max(0, Number(enemy.preferredAttackRange) || Number(enemy.attackRange) * 0.72)
        : Math.max(10, Math.min(Number(enemy.attackRange) * 0.72, Number(enemy.attackRange) - 4));
    const edgeMap = navigation.edgeMap || buildEnemyNavigationEdges(navigation.supports, {
        ...characterEnemyNavigationOptions(enemy, state),
        world: state.world
    });

    const bestAttackPositionOnSupport = (support, route) => {
        const arrivalX = route.edges.at(-1)?.landingX ?? enemy.x;
        let best = null;
        for (const candidateX of characterEnemyAttackCandidateXs(enemy, support, player.x, preferredRange)) {
            const point = supportPoint(support, candidateX, Math.max(4, enemy.width * 0.35));
            if (characterEnemyBodyBlockedAt(state, enemy, point.x, point.y, { groundSlope: characterEnemySupportSlope(support) })) {
                continue;
            }
            if (!characterEnemyCanAttackFromPoint(state, enemy, point)) {
                continue;
            }
            const horizontalDistance = Math.abs(player.x - point.x);
            const rangeError = Math.abs(horizontalDistance - preferredRange);
            const travelDistance = Math.abs(point.x - arrivalX);
            const score = route.cost + travelDistance + rangeError * 1.6 + Math.abs(point.y - player.y) * 0.18;
            if (!best || score < best.score) {
                best = {
                    kind: "attack_position",
                    supportId: support.id,
                    targetX: point.x,
                    targetY: point.y,
                    route,
                    score
                };
            }
        }
        return best;
    };

    const playerSupport = characterEnemyPlayerSupport(state, enemy, navigation.supports);
    if (playerSupport) {
        const targetRegionIds = new Set([playerSupport.support.id]);
        const pending = [playerSupport.support.id];
        while (pending.length) {
            const supportId = pending.shift();
            for (const edge of edgeMap.get(supportId) || []) {
                if (edge.type !== "step" || targetRegionIds.has(edge.to)) {
                    continue;
                }
                targetRegionIds.add(edge.to);
                pending.push(edge.to);
            }
        }

        let targetRegionPlan = null;
        let routeToPlayer = null;
        for (const supportId of targetRegionIds) {
            const support = navigationSupportById(navigation.supports, supportId);
            if (!support) {
                continue;
            }
            const route = characterEnemyRoute(state, enemy, navigation.supports, startSupport.id, support.id, edgeMap);
            if (!route) {
                continue;
            }
            if (support.id === playerSupport.support.id) {
                routeToPlayer = route;
            }
            const candidate = bestAttackPositionOnSupport(support, route);
            if (candidate && (!targetRegionPlan || candidate.score < targetRegionPlan.score)) {
                targetRegionPlan = candidate;
            }
        }
        if (targetRegionPlan) {
            return targetRegionPlan;
        }
        if (routeToPlayer) {
            const approachSide = enemy.x <= player.x ? -1 : 1;
            const approach = supportPoint(
                playerSupport.support,
                player.x + approachSide * Math.max(12, Math.min(preferredRange, Number(enemy.attackRange) * 0.82)),
                Math.max(4, enemy.width * 0.35)
            );
            routeToPlayer = characterEnemyRoute(
                state,
                enemy,
                navigation.supports,
                startSupport.id,
                playerSupport.support.id,
                edgeMap,
                approach.x
            ) || routeToPlayer;
            return {
                kind: "pursue",
                supportId: playerSupport.support.id,
                targetX: approach.x,
                targetY: approach.y,
                route: routeToPlayer,
                score: routeToPlayer.cost + Math.abs(approach.x - player.x)
            };
        }
    }

    let fallback = null;
    for (const support of navigation.supports) {
        const route = characterEnemyRoute(state, enemy, navigation.supports, startSupport.id, support.id, edgeMap);
        if (!route) {
            continue;
        }
        const candidate = bestAttackPositionOnSupport(support, route);
        if (candidate && (!fallback || candidate.score < fallback.score)) {
            fallback = candidate;
        }
    }
    return fallback;
}

function alertCharacterEnemyFromPlayerDamage(state, enemy) {
    if (!isCharacterEnemyState(enemy)) {
        return;
    }

    const wasAlerted = enemy.alerted === true;
    enemy.awarenessTimer = Math.max(
        FIXED_DT,
        Number(enemy.awarenessHoldDuration) || state.tuning.enemyDefaultAwarenessHoldSeconds || 1.2
    );
    enemy.alerted = true;
    enemy.engaged = true;

    const navigation = enemy.strategy === "hunter"
        ? characterEnemyNavigationContext(state, enemy)
        : null;
    rememberCharacterEnemyPlayerPosition(state, enemy, navigation);

    const dx = (Number(state.player.x) || 0) - (Number(enemy.x) || 0);
    if (Math.abs(dx) > 0.001) {
        enemy.facing = dx < 0 ? -1 : 1;
    }

    if (enemy.strategy === "hunter") {
        enemy.glareFocusX = null;
        enemy.glareFocusY = null;
        if (enemy.aiState !== "pursue") {
            clearCharacterEnemyNavigationPlan(enemy);
            enemy.aiState = "pursue";
            enemy.routeRepathTimer = 0;
        }
    }

    if (!wasAlerted) {
        addEvent(state, "ENEMY_ALERTED", {
            enemyId: enemy.id,
            reason: "player_damage"
        });
    }
}

function rememberCharacterEnemyPlayerPosition(state, enemy, navigation) {
    enemy.lastSeenPlayerX = Number(state.player.x) || 0;
    enemy.lastSeenPlayerY = Number(state.player.y) || 0;
    enemy.lastSeenAt = Number(state.clock?.time) || 0;
    const support = navigation
        ? characterEnemyPlayerSupport(state, enemy, navigation.supports)
        : null;
    enemy.lastSeenSupportId = support?.support?.id || null;
}

function chooseCharacterEnemyLastSeenPlan(state, enemy, navigation) {
    const startSupport = navigation.current?.support;
    const hasLastSeenX = typeof enemy.lastSeenPlayerX === "number" && Number.isFinite(enemy.lastSeenPlayerX);
    const hasLastSeenY = typeof enemy.lastSeenPlayerY === "number" && Number.isFinite(enemy.lastSeenPlayerY);
    const targetX = hasLastSeenX ? enemy.lastSeenPlayerX : NaN;
    const targetY = hasLastSeenY ? enemy.lastSeenPlayerY : NaN;
    if (!startSupport || !hasLastSeenX || !hasLastSeenY) {
        return null;
    }

    const edgeMap = navigation.edgeMap || buildEnemyNavigationEdges(navigation.supports, {
        ...characterEnemyNavigationOptions(enemy, state),
        world: state.world
    });
    const inset = Math.max(4, enemy.width * 0.35);
    let best = null;

    for (const support of navigation.supports) {
        const point = supportPoint(support, targetX, inset);
        if (characterEnemyBodyBlockedAt(state, enemy, point.x, point.y, { groundSlope: characterEnemySupportSlope(support) })) {
            continue;
        }
        const route = characterEnemyRoute(
            state,
            enemy,
            navigation.supports,
            startSupport.id,
            support.id,
            edgeMap,
            point.x
        );
        if (!route) {
            continue;
        }
        const remainingDistance = Math.hypot(point.x - targetX, point.y - targetY);
        const arrivalX = route.edges.at(-1)?.landingX ?? enemy.x;
        const travelCost = route.cost + Math.abs(point.x - arrivalX);
        const candidate = {
            kind: "last_seen",
            supportId: support.id,
            targetX: point.x,
            targetY: point.y,
            route,
            remainingDistance,
            score: travelCost
        };
        if (!best ||
            candidate.remainingDistance < best.remainingDistance - 0.25 ||
            (Math.abs(candidate.remainingDistance - best.remainingDistance) <= 0.25 && candidate.score < best.score)) {
            best = candidate;
        }
    }
    return best;
}

function characterEnemyReachedNavigationTarget(enemy, navigation, tolerance = 3) {
    if (!enemy.routeTargetSupportId || !Number.isFinite(Number(enemy.routeTargetX))) {
        return false;
    }
    const currentSupportId = navigation.current?.support?.id || enemy.currentSupportId;
    return currentSupportId === enemy.routeTargetSupportId &&
        enemy.routeIndex >= (enemy.route?.length || 0) &&
        Math.abs(enemy.x - Number(enemy.routeTargetX)) <= Math.max(0.5, tolerance);
}

function updateCharacterEnemyLastSeenInvestigation(state, enemy, navigation, dt, options = {}) {
    const allowGlare = options.allowGlare !== false;
    if (!(typeof enemy.lastSeenPlayerX === "number" && Number.isFinite(enemy.lastSeenPlayerX)) ||
        !(typeof enemy.lastSeenPlayerY === "number" && Number.isFinite(enemy.lastSeenPlayerY))) {
        if (allowGlare) {
            enterCharacterEnemyGlare(state, enemy);
        }
        return;
    }

    if (enemy.aiState !== "investigate_last_seen") {
        if (!characterEnemyHasCommittedTraversal(enemy)) {
            clearCharacterEnemyNavigationPlan(enemy);
        }
        enemy.aiState = "investigate_last_seen";
        enemy.movementPhase = "investigate_last_seen";
        enemy.routeRepathTimer = 0;
        enemy.navigationFailureCount = 0;
        addEvent(state, "ENEMY_INVESTIGATING_LAST_SEEN", {
            enemyId: enemy.id,
            x: round(enemy.lastSeenPlayerX),
            y: round(enemy.lastSeenPlayerY)
        });
    }

    enemy.engaged = true;
    enemy.alerted = true;
    enemy.routeRepathTimer = Math.max(0, (Number(enemy.routeRepathTimer) || 0) - dt);

    if (characterEnemyReachedNavigationTarget(enemy, navigation)) {
        if (allowGlare) {
            enterCharacterEnemyGlare(state, enemy, {
                focusX: enemy.lastSeenPlayerX,
                focusY: enemy.lastSeenPlayerY
            });
        } else {
            enemy.movementPhase = "investigate_last_seen";
            setCharacterEnemyAnimation(enemy, "idle");
        }
        return;
    }

    if ((enemy.routeRepathTimer <= 0 || !enemy.routeTargetSupportId) && !characterEnemyHasCommittedTraversal(enemy)) {
        const plan = chooseCharacterEnemyLastSeenPlan(state, enemy, navigation);
        if (!plan) {
            if (allowGlare) {
                enterCharacterEnemyGlare(state, enemy, {
                    focusX: enemy.lastSeenPlayerX,
                    focusY: enemy.lastSeenPlayerY
                });
            } else {
                enemy.movementPhase = "investigate_last_seen";
                setCharacterEnemyAnimation(enemy, "idle");
            }
            return;
        }
        setCharacterEnemyNavigationPlan(enemy, plan);
        enemy.lastSeenRemainingDistance = plan.remainingDistance;
        if (characterEnemyReachedNavigationTarget(enemy, navigation)) {
            if (allowGlare) {
                enterCharacterEnemyGlare(state, enemy, {
                    focusX: enemy.lastSeenPlayerX,
                    focusY: enemy.lastSeenPlayerY
                });
            } else {
                enemy.movementPhase = "investigate_last_seen";
                setCharacterEnemyAnimation(enemy, "idle");
            }
            return;
        }
    }

    if (!followCharacterEnemyNavigationPlan(state, enemy, navigation, dt)) {
        enemy.navigationFailureCount = (Number(enemy.navigationFailureCount) || 0) + 1;
        if (enemy.navigationFailureCount >= 2) {
            enterCharacterEnemyGlare(state, enemy, {
                focusX: enemy.lastSeenPlayerX,
                focusY: enemy.lastSeenPlayerY
            });
        } else {
            clearCharacterEnemyNavigationPlan(enemy);
            enemy.routeRepathTimer = 0;
        }
        return;
    }

    enemy.navigationFailureCount = 0;
    enemy.movementPhase = "investigate_last_seen";
    if (!enemy.airborne && characterEnemyReachedNavigationTarget(enemy, navigation)) {
        if (allowGlare) {
            enterCharacterEnemyGlare(state, enemy, {
                focusX: enemy.lastSeenPlayerX,
                focusY: enemy.lastSeenPlayerY
            });
        } else {
            setCharacterEnemyAnimation(enemy, "idle");
        }
    }
}

function setCharacterEnemyNavigationPlan(enemy, plan) {
    enemy.route = Array.isArray(plan?.route?.edges) ? plan.route.edges.map((edge) => ({ ...edge })) : [];
    enemy.routeIndex = 0;
    enemy.routeTraversalPhase = null;
    enemy.routeTraversalEdgeIndex = -1;
    enemy.groundVelocityX = 0;
    enemy.routeTargetSupportId = plan?.supportId || null;
    enemy.routeTargetX = Number.isFinite(Number(plan?.targetX)) ? Number(plan.targetX) : null;
    enemy.routeTargetY = Number.isFinite(Number(plan?.targetY)) ? Number(plan.targetY) : null;
    enemy.routePurpose = plan?.kind ? String(plan.kind) : null;
    enemy.routeRepathTimer = Math.max(FIXED_DT, Number(enemy.routeRepathInterval) || FIXED_DT);
}

function clearCharacterEnemyNavigationPlan(enemy) {
    enemy.route = [];
    enemy.routeIndex = 0;
    enemy.routeTraversalPhase = null;
    enemy.routeTraversalEdgeIndex = -1;
    enemy.groundVelocityX = 0;
    enemy.routeTargetSupportId = null;
    enemy.routeTargetX = null;
    enemy.routeTargetY = null;
    enemy.routePurpose = null;
}

function beginCharacterEnemyAirTraversal(enemy, edge) {
    enemy.routeTraversalPhase = null;
    enemy.routeTraversalEdgeIndex = -1;
    enemy.groundVelocityX = 0;
    enemy.airborne = true;
    enemy.supportId = null;
    enemy.ridingPlatformId = null;
    enemy.airTimer = 0;
    enemy.airTraversalType = edge.type || null;
    enemy.airSourceSupportId = edge.from || enemy.currentSupportId || null;
    enemy.airSourceObstacleId = edge.fromObstacleId || null;
    enemy.airTargetSupportId = edge.to;
    enemy.velocityX = Number(edge.vx) || 0;
    enemy.velocityY = Number(edge.vy) || 0;
    enemy.x = Number(edge.launchX);
    enemy.y = Number(edge.launchY);
    enemy.aiState = edge.type === "drop" ? "drop" : "jump";
    enemy.movementPhase = enemy.aiState;
    if (Math.abs(enemy.velocityX) > 0.001) {
        enemy.facing = enemy.velocityX < 0 ? -1 : 1;
    }
    setCharacterEnemyAnimation(enemy, "walk");
}

function updateCharacterEnemyAirTraversal(state, enemy, dt, supports) {
    if (!enemy.airborne) {
        return false;
    }

    enemy.airTimer = Math.max(0, Number(enemy.airTimer) || 0) + dt;
    enemy.velocityY = (Number(enemy.velocityY) || 0) + Math.max(1, Number(enemy.jumpGravity) || 1) * dt;

    const previousX = enemy.x;
    const previousY = enemy.y;
    const nextX = previousX + (Number(enemy.velocityX) || 0) * dt;
    const nextY = previousY + (Number(enemy.velocityY) || 0) * dt;
    const sourceSupport = navigationSupportById(supports, enemy.airSourceSupportId);
    const sourceIgnoreIds = [enemy.airSourceSupportId, enemy.airSourceObstacleId].filter(Boolean);
    const sourcePolygon = state.world?.collisionPolygons?.find((polygon) => polygon.id === enemy.airSourceObstacleId) || null;
    if (sourcePolygon) {
        const lineIds = new Set((sourcePolygon.lineIds || []).map((id) => String(id)));
        for (const segment of state.world?.segments || []) {
            if (
                segment.visualId === sourcePolygon.visualId &&
                (!lineIds.size || lineIds.has(String(segment.lineId || "")))
            ) {
                sourceIgnoreIds.push(segment.id);
            }
        }
    }
    const dropDepartureIgnoresSourceAt = (x, y) => {
        if (enemy.airTraversalType !== "drop" || !sourceSupport) {
            return false;
        }
        const sourcePoint = supportPoint(sourceSupport, clamp(x, sourceSupport.xMin, sourceSupport.xMax), 0);
        const departureDrop = Math.max(
            6,
            Math.min(
                enemy.height * ENEMY_DROP_SOURCE_CLEARANCE_HEIGHT_FACTOR,
                enemy.width * 0.8
            )
        );
        if (Math.abs(Number(enemy.velocityX) || 0) <= 0.001) {
            // Monsters never intentionally drop through a one-way floor. A
            // stale or malformed zero-horizontal drop edge must collide with
            // its source support immediately rather than bypassing the line.
            return false;
        }
        const direction = enemy.velocityX < 0 ? -1 : 1;
        const obstacleEdge = direction < 0
            ? (Number.isFinite(sourceSupport.obstacleXMin) ? sourceSupport.obstacleXMin : sourceSupport.xMin)
            : (Number.isFinite(sourceSupport.obstacleXMax) ? sourceSupport.obstacleXMax : sourceSupport.xMax);
        const clearCenterX = obstacleEdge + direction * (enemy.width * 0.5 + 2);
        const clearedHorizontally = direction < 0 ? x <= clearCenterX : x >= clearCenterX;
        return !clearedHorizontally && y <= sourcePoint.y + departureDrop + 0.5 && enemy.airTimer <= 1;
    };

    const horizontalIgnoreIds = dropDepartureIgnoresSourceAt(nextX, previousY)
        ? sourceIgnoreIds
        : [];
    const horizontalCollision = findActorHorizontalSweepCollision(
        state,
        enemy,
        previousX,
        nextX,
        { ignoreIds: horizontalIgnoreIds }
    );
    enemy.x = horizontalCollision ? horizontalCollision.x : nextX;
    if (horizontalCollision) {
        enemy.velocityX = 0;
    }

    let departingSource = dropDepartureIgnoresSourceAt(enemy.x, nextY);
    if (!departingSource && enemy.airTraversalType !== "drop" && sourceSupport) {
        const sourcePoint = supportPoint(sourceSupport, clamp(enemy.x, sourceSupport.xMin, sourceSupport.xMax), 0);
        const departedHorizontally = enemy.x < sourceSupport.xMin - enemy.width * 0.5 || enemy.x > sourceSupport.xMax + enemy.width * 0.5;
        const departedVertically = nextY > sourcePoint.y + Math.max(4, enemy.height * 0.08);
        departingSource = !departedHorizontally && !departedVertically && enemy.airTimer <= 1;
    }
    const verticalIgnoreIds = departingSource ? sourceIgnoreIds : [];
    const verticalCollision = findActorVerticalSweepCollision(
        state,
        enemy,
        previousY,
        nextY,
        { ignoreIds: verticalIgnoreIds }
    );
    enemy.y = verticalCollision ? verticalCollision.y : nextY;

    if (verticalCollision?.ceiling) {
        enemy.velocityY = 0;
    } else if (verticalCollision) {
        enemy.velocityX = 0;
        enemy.velocityY = 0;
        enemy.airborne = false;
        enemy.airTimer = 0;
        enemy.airTraversalType = null;
        const intendedSupportId = enemy.airTargetSupportId;
        const landedSupport = findEnemyNavigationSupport(supports, enemy.x, enemy.y, {
            maxRise: 5,
            maxDrop: 5,
            width: enemy.width,
            sampleHalfWidthFactor: 0.48,
            preferredSupportId: intendedSupportId
        });
        enemy.currentSupportId = landedSupport?.support?.id || null;
        const physicalSupport = findCharacterEnemyGroundSupport(
            state,
            enemy.x,
            enemy.y,
            Math.max(5, enemy.maxStepHeight),
            Math.max(5, enemy.maxDropDistance),
            enemy.width
        );
        setCharacterEnemyGroundSupportIdentity(state, enemy, physicalSupport);
        enemy.airSourceSupportId = null;
        enemy.airSourceObstacleId = null;
        enemy.airTargetSupportId = null;

        if (intendedSupportId && enemy.currentSupportId !== intendedSupportId) {
            clearCharacterEnemyNavigationPlan(enemy);
            enemy.routeRepathTimer = 0;
            if (enemy.currentSupportId) {
                // Full-body collision can safely catch a hunter on a neighbouring
                // ledge or on the top of the same obstacle before the baked arc's
                // nominal landing point. That is a valid landing, not a failed
                // traversal. Pull the feet onto the usable part of that support,
                // then replan from the support actually reached.
                const recoveredSupport = landedSupport.support;
                const recoveredPoint = supportPoint(
                    recoveredSupport,
                    enemy.x,
                    Math.min(Math.max(2, enemy.width * 0.1), Math.max(0, (recoveredSupport.xMax - recoveredSupport.xMin) * 0.4))
                );
                enemy.x = recoveredPoint.x;
                enemy.y = recoveredPoint.y;
                enemy.navigationFailureCount = 0;
                enemy.aiState = enemy.engaged ? "pursue" : "return_home";
                enemy.movementPhase = enemy.aiState;
                setCharacterEnemyAnimation(enemy, "walk");
            } else {
                enemy.navigationFailureCount = (Number(enemy.navigationFailureCount) || 0) + 1;
                if (enemy.navigationFailureCount >= 2) {
                    enterCharacterEnemyGlare(state, enemy);
                } else {
                    enemy.aiState = enemy.engaged ? "pursue" : "return_home";
                    enemy.movementPhase = enemy.aiState;
                    setCharacterEnemyAnimation(enemy, "idle");
                }
            }
            return true;
        }

        enemy.aiState = enemy.engaged ? "pursue" : "return_home";
        enemy.movementPhase = enemy.aiState;
        if (enemy.route?.[enemy.routeIndex]?.to === enemy.currentSupportId) {
            enemy.routeIndex += 1;
        }
        enemy.routeTraversalPhase = null;
        enemy.routeTraversalEdgeIndex = -1;
        enemy.groundVelocityX = 0;
        setCharacterEnemyAnimation(enemy, "walk");
        return true;
    }

    const bottom = Number(state.world?.bounds?.y || 0) + Number(state.world?.bounds?.h || 1200) + 500;
    if (enemy.airTimer > 4 || enemy.y > bottom) {
        enemy.airborne = false;
        enemy.velocityX = 0;
        enemy.velocityY = 0;
        enemy.airTraversalType = null;
        enemy.airSourceSupportId = null;
        enemy.airSourceObstacleId = null;
        enemy.airTargetSupportId = null;
        clearCharacterEnemyNavigationPlan(enemy);
        enemy.navigationFailureCount = (Number(enemy.navigationFailureCount) || 0) + 1;
        enemy.aiState = "unreachable_glare";
        enemy.glareTimer = Math.max(0, Number(enemy.unreachableGlareDuration) || 0);
        enemy.movementPhase = "glare";
        setCharacterEnemyAnimation(enemy, "idle");
        return true;
    }
    return true;
}

function characterEnemyHasCommittedTraversal(enemy) {
    return enemy.routeTraversalPhase === "approach_run_up" || enemy.routeTraversalPhase === "run_up";
}

function prepareCharacterEnemyRunUp(enemy, edge) {
    enemy.routeTraversalPhase = "approach_run_up";
    enemy.routeTraversalEdgeIndex = enemy.routeIndex;
    enemy.groundVelocityX = 0;
    enemy.movementPhase = "approach_run_up";
}

function followCharacterEnemyJumpRunUp(state, enemy, edge, speed, dt) {
    const runUpX = Number(edge.runUpX);
    const launchX = Number(edge.launchX);
    const requiredVelocity = Number(edge.vx) || 0;
    const direction = requiredVelocity < 0 ? -1 : 1;
    const acceleration = Math.max(1, Number(edge.groundAcceleration) || Number(enemy.runAcceleration) || state.tuning.groundAcceleration || 950);
    const targetSpeed = Math.max(1, Math.min(speed, Math.abs(requiredVelocity)));
    const arrivalTolerance = Math.max(1.5, speed * dt * 0.75);

    if (enemy.routeTraversalEdgeIndex !== enemy.routeIndex || !characterEnemyHasCommittedTraversal(enemy)) {
        prepareCharacterEnemyRunUp(enemy, edge);
    }

    if (enemy.routeTraversalPhase === "approach_run_up") {
        const distance = Math.abs(enemy.x - runUpX);
        if (distance > arrivalTolerance) {
            const moved = moveCharacterEnemyToward(state, enemy, runUpX, speed, dt, 0);
            if (moved <= 0) {
                return false;
            }
            enemy.movementPhase = "approach_run_up";
            setCharacterEnemyAnimation(enemy, "walk");
            return true;
        }
        enemy.x = runUpX;
        enemy.y = Number.isFinite(Number(edge.runUpY)) ? Number(edge.runUpY) : enemy.y;
        enemy.routeTraversalPhase = "run_up";
        enemy.groundVelocityX = 0;
    }

    const distanceToLaunch = Math.abs(launchX - enemy.x);
    if (distanceToLaunch <= arrivalTolerance) {
        enemy.x = launchX;
        enemy.y = Number(edge.launchY);
        beginCharacterEnemyAirTraversal(enemy, edge);
        return true;
    }

    const currentSpeed = Math.abs(Number(enemy.groundVelocityX) || 0);
    const nextSpeed = Math.min(targetSpeed, currentSpeed + acceleration * dt);
    const moved = moveCharacterEnemyToward(state, enemy, launchX, Math.max(1, nextSpeed), dt, 0);
    if (moved <= 0) {
        return false;
    }
    enemy.groundVelocityX = direction * nextSpeed;
    enemy.facing = direction;
    enemy.movementPhase = "run_up";
    setCharacterEnemyAnimation(enemy, "walk");

    if (Math.abs(launchX - enemy.x) <= arrivalTolerance) {
        enemy.x = launchX;
        enemy.y = Number(edge.launchY);
        beginCharacterEnemyAirTraversal(enemy, edge);
    }
    return true;
}

function followCharacterEnemyNavigationPlan(state, enemy, navigation, dt) {
    if (enemy.airborne) {
        return updateCharacterEnemyAirTraversal(state, enemy, dt, navigation.supports);
    }
    const current = navigation.current?.support;
    if (!current) {
        return false;
    }
    enemy.currentSupportId = current.id;

    while (enemy.routeIndex < (enemy.route?.length || 0) && enemy.route[enemy.routeIndex].to === current.id) {
        enemy.routeIndex += 1;
    }
    const edge = enemy.route?.[enemy.routeIndex];
    const speed = characterEnemyRunSpeed(enemy, state.tuning);
    if (edge) {
        if (edge.from !== current.id || !characterEnemyTraversalAllowedFromSupport(edge, current)) {
            enemy.routeTraversalPhase = null;
            enemy.routeTraversalEdgeIndex = -1;
            enemy.groundVelocityX = 0;
            return false;
        }
        if (edge.type === "ride") {
            const platform = (state.world?.movingPlatforms || []).find((item) => item.id === edge.platformId);
            if (!platform || !platform.collisionAttached || !movingPlatformOwnsCollisionId(platform, enemy.supportId)) {
                return false;
            }
            enemy.ridingPlatformId = platform.id;
            enemy.groundVelocityX = 0;
            enemy.movementPhase = "ride_platform";
            const nextEdge = enemy.route?.[enemy.routeIndex + 1];
            const visual = movingPlatformVisual(state, platform);
            let positionedForExit = false;
            if (visual && nextEdge?.from === edge.to && Number.isFinite(Number(nextEdge.launchX))) {
                const destinationX = edge.toEndpoint === "end" ? platform.endX : platform.startX;
                const localExitX = Number(nextEdge.launchX) - destinationX;
                const movingExitX = (Number(visual.x) || 0) + localExitX;
                const moved = moveCharacterEnemyToward(state, enemy, movingExitX, speed, dt, 0);
                positionedForExit = moved > 0;
            }
            setCharacterEnemyAnimation(enemy, positionedForExit ? "walk" : "idle");
            if (!movingPlatformAtEndpoint(state, platform, edge.toEndpoint)) {
                return true;
            }
            enemy.currentSupportId = edge.to;
            enemy.routeIndex += 1;
            enemy.routeTraversalPhase = null;
            enemy.routeTraversalEdgeIndex = -1;
            return true;
        }
        if (edge.type === "jump" && Number.isFinite(Number(edge.runUpX)) && Math.abs(Number(edge.vx) || 0) > 0.001) {
            return followCharacterEnemyJumpRunUp(state, enemy, edge, speed, dt);
        }
        const launchSupport = navigationSupportById(navigation.supports, edge.from);
        const landingSupport = navigationSupportById(navigation.supports, edge.to);
        const platformSupport = launchSupport?.movingPlatformId ? launchSupport : landingSupport?.movingPlatformId ? landingSupport : null;
        if (platformSupport) {
            const platform = (state.world?.movingPlatforms || []).find((item) => item.id === platformSupport.movingPlatformId);
            const requiredEndpoint = launchSupport?.movingPlatformId
                ? launchSupport.platformEndpoint
                : landingSupport.platformEndpoint;
            if (!platform || !platform.collisionAttached || !movingPlatformAtEndpoint(state, platform, requiredEndpoint)) {
                enemy.groundVelocityX = 0;
                enemy.movementPhase = "wait_for_platform";
                setCharacterEnemyAnimation(enemy, "idle");
                return true;
            }
        }
        const distanceToLaunch = Math.abs(enemy.x - edge.launchX);
        if (distanceToLaunch > Math.max(2, speed * dt * 1.25)) {
            const moved = moveCharacterEnemyToward(state, enemy, edge.launchX, speed, dt, 0);
            if (moved <= 0) {
                return false;
            }
            enemy.movementPhase = "pursue";
            setCharacterEnemyAnimation(enemy, "walk");
            return true;
        }
        if (edge.type === "step") {
            if (characterEnemyBodyBlockedAt(state, enemy, edge.landingX, edge.landingY, {
                groundSlope: characterEnemySupportSlope(landingSupport)
            })) {
                return false;
            }
            enemy.x = edge.landingX;
            enemy.y = edge.landingY;
            enemy.currentSupportId = edge.to;
            if (landingSupport?.movingPlatformId) {
                enemy.supportId = landingSupport.collisionId;
                enemy.ridingPlatformId = landingSupport.movingPlatformId;
            } else {
                const physicalSupport = findCharacterEnemyGroundSupport(
                    state,
                    enemy.x,
                    enemy.y,
                    Math.max(4, enemy.maxStepHeight),
                    Math.max(4, enemy.maxDropDistance),
                    enemy.width
                );
                setCharacterEnemyGroundSupportIdentity(state, enemy, physicalSupport);
            }
            enemy.routeIndex += 1;
            enemy.routeTraversalPhase = null;
            enemy.routeTraversalEdgeIndex = -1;
            enemy.groundVelocityX = 0;
            enemy.movementPhase = "pursue";
            setCharacterEnemyAnimation(enemy, "walk");
            return true;
        }
        beginCharacterEnemyAirTraversal(enemy, edge);
        return true;
    }

    const targetSupport = navigationSupportById(navigation.supports, enemy.routeTargetSupportId) || current;
    const finalPoint = supportPoint(targetSupport, Number(enemy.routeTargetX) || enemy.x, Math.max(4, enemy.width * 0.3));
    if (Math.abs(enemy.x - finalPoint.x) <= 2) {
        enemy.x = finalPoint.x;
        enemy.y = finalPoint.y;
        if (enemy.engaged && (enemy.routePurpose === "attack_position" || enemy.routePurpose === "pursue")) {
            const dx = state.player.x - enemy.x;
            if (Math.abs(dx) > 0.001) {
                enemy.facing = dx < 0 ? -1 : 1;
            }
        }
        return true;
    }
    const moved = moveCharacterEnemyToward(state, enemy, finalPoint.x, speed, dt, 0);
    if (moved <= 0) {
        return false;
    }
    enemy.movementPhase = "position_for_attack";
    setCharacterEnemyAnimation(enemy, "walk");
    return true;
}

function enterCharacterEnemyGlare(state, enemy, options = {}) {
    clearCharacterEnemyNavigationPlan(enemy);
    enemy.engaged = false;
    enemy.alerted = false;
    enemy.aiState = "unreachable_glare";
    enemy.glareTimer = Math.max(0, Number(enemy.unreachableGlareDuration) || state.tuning.enemyDefaultGlareSeconds || 5);
    enemy.glareFocusX = typeof options.focusX === "number" && Number.isFinite(options.focusX)
        ? options.focusX
        : (typeof enemy.lastSeenPlayerX === "number" && Number.isFinite(enemy.lastSeenPlayerX)
            ? enemy.lastSeenPlayerX
            : state.player.x);
    enemy.glareFocusY = typeof options.focusY === "number" && Number.isFinite(options.focusY)
        ? options.focusY
        : (typeof enemy.lastSeenPlayerY === "number" && Number.isFinite(enemy.lastSeenPlayerY)
            ? enemy.lastSeenPlayerY
            : state.player.y);
    enemy.movementPhase = "glare";
    setCharacterEnemyAnimation(enemy, "idle");
    addEvent(state, "ENEMY_TARGET_UNREACHABLE", {
        enemyId: enemy.id,
        focusX: round(enemy.glareFocusX),
        focusY: round(enemy.glareFocusY)
    });
}

function enterCharacterEnemyStrandedPatrol(state, enemy, navigation) {
    clearCharacterEnemyNavigationPlan(enemy);
    const support = navigation.current?.support;
    const inset = Math.max(4, enemy.width * 0.42);
    enemy.temporaryPatrolMinX = support ? Math.min(support.xMax, support.xMin + inset) : enemy.x - 40;
    enemy.temporaryPatrolMaxX = support ? Math.max(support.xMin, support.xMax - inset) : enemy.x + 40;
    enemy.aiState = "stranded_patrol";
    enemy.movementPhase = "idle";
    enemy.phaseTimer = Math.max(0, Number(enemy.turnPause) || 0);
    enemy.homeRetryTimer = Math.max(FIXED_DT, Number(enemy.homeRetryInterval) || state.tuning.enemyDefaultHomeRetrySeconds || 4);
    setCharacterEnemyAnimation(enemy, "idle");
    addEvent(state, "ENEMY_STRANDED", { enemyId: enemy.id, supportId: support?.id || null });
}

function updateCharacterEnemyPatrolRange(state, enemy, dt, minX, maxX, phase = "patrol") {
    if (enemy.walkSpeed <= 0 || maxX - minX <= 1) {
        enemy.movementPhase = phase === "stranded_patrol" ? "stranded_patrol" : "guard";
        setCharacterEnemyAnimation(enemy, "idle");
        return;
    }
    if (enemy.movementPhase !== "walk" && enemy.movementPhase !== phase) {
        enemy.movementPhase = "idle";
        setCharacterEnemyAnimation(enemy, "idle");
        enemy.phaseTimer = Math.max(0, (Number(enemy.phaseTimer) || 0) - dt);
        if (enemy.phaseTimer <= 0) {
            enemy.movementPhase = phase;
            setCharacterEnemyAnimation(enemy, "walk");
        }
        return;
    }

    setCharacterEnemyAnimation(enemy, "walk");
    const direction = enemy.facing < 0 ? -1 : 1;
    const unclampedX = enemy.x + direction * enemy.walkSpeed * dt;
    const candidateX = clamp(unclampedX, minX, maxX);
    const reachedBoundary = Math.abs(candidateX - unclampedX) > 0.0001 ||
        candidateX <= minX + 0.001 || candidateX >= maxX - 0.001;
    const automaticStepHeight = Math.max(0, enemy.height * AUTOMATIC_STEP_HEIGHT_RATIO);
    const support = findCharacterEnemyGroundSupport(
        state,
        candidateX,
        enemy.y,
        Math.max(Number(enemy.maxStepHeight) || 0, automaticStepHeight),
        enemy.maxDropDistance,
        enemy.width
    );
    if (!support || characterEnemyBodyBlockedAt(state, enemy, candidateX, support.y, {
        groundSlope: support.slope,
        ignoreSupportId: support.id
    })) {
        pauseAndTurnCharacterEnemy(enemy);
        return;
    }
    enemy.x = candidateX;
    enemy.y = support.y;
    setCharacterEnemyGroundSupportIdentity(state, enemy, support);
    enemy.movementPhase = phase;
    if (reachedBoundary) {
        pauseAndTurnCharacterEnemy(enemy);
    }
}

function updateHunterCharacterEnemy(state, enemy, dt) {
    const navigation = characterEnemyNavigationContext(state, enemy);
    if (enemy.airborne) {
        updateCharacterEnemyAirTraversal(state, enemy, dt, navigation.supports);
        syncCharacterEnemyTarget(state, enemy);
        return;
    }

    const seesPlayer = characterEnemyCanNoticePlayer(state, enemy);
    if (seesPlayer) {
        enemy.awarenessTimer = Math.max(
            FIXED_DT,
            Number(enemy.awarenessHoldDuration) || state.tuning.enemyDefaultAwarenessHoldSeconds || 1.2
        );
        rememberCharacterEnemyPlayerPosition(state, enemy, navigation);
        enemy.glareFocusX = null;
        enemy.glareFocusY = null;
        if (enemy.aiState === "investigate_last_seen") {
            clearCharacterEnemyNavigationPlan(enemy);
            enemy.aiState = "pursue";
            enemy.movementPhase = "pursue";
            enemy.routeRepathTimer = 0;
            addEvent(state, "ENEMY_REACQUIRED_PLAYER", { enemyId: enemy.id });
        }
        if (!enemy.engaged && enemy.aiState === "patrol") {
            enemy.engaged = true;
            enemy.alerted = true;
            enemy.aiState = "pursue";
            enemy.routeRepathTimer = 0;
            clearCharacterEnemyNavigationPlan(enemy);
            addEvent(state, "ENEMY_ALERTED", { enemyId: enemy.id });
        }
    } else {
        const hasLastSeen = typeof enemy.lastSeenPlayerX === "number" && Number.isFinite(enemy.lastSeenPlayerX) &&
            typeof enemy.lastSeenPlayerY === "number" && Number.isFinite(enemy.lastSeenPlayerY);
        if (enemy.engaged && !hasLastSeen) {
            rememberCharacterEnemyPlayerPosition(state, enemy, navigation);
            enemy.awarenessTimer = Math.max(
                FIXED_DT,
                Number(enemy.awarenessHoldDuration) || state.tuning.enemyDefaultAwarenessHoldSeconds || 1.2
            );
        } else {
            enemy.awarenessTimer = Math.max(0, (Number(enemy.awarenessTimer) || 0) - dt);
        }
    }
    const hasRecentSight = seesPlayer || enemy.awarenessTimer > 0;

    if (enemy.aiState === "unreachable_glare") {
        const focusX = typeof enemy.glareFocusX === "number" && Number.isFinite(enemy.glareFocusX)
            ? enemy.glareFocusX
            : state.player.x;
        const dx = focusX - enemy.x;
        if (Math.abs(dx) > 0.001) {
            enemy.facing = dx < 0 ? -1 : 1;
        }
        enemy.glareTimer = Math.max(0, (Number(enemy.glareTimer) || 0) - dt);
        enemy.routeRepathTimer = Math.max(0, (Number(enemy.routeRepathTimer) || 0) - dt);
        if (seesPlayer && enemy.routeRepathTimer <= 0) {
            const plan = chooseCharacterEnemyAttackPlan(state, enemy, navigation);
            enemy.routeRepathTimer = Math.max(FIXED_DT, Number(enemy.routeRepathInterval) || FIXED_DT);
            if (plan) {
                enemy.engaged = true;
                enemy.alerted = true;
                enemy.aiState = "pursue";
                setCharacterEnemyNavigationPlan(enemy, plan);
                addEvent(state, "ENEMY_REENGAGED", { enemyId: enemy.id });
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
        }
        enemy.movementPhase = "glare";
        setCharacterEnemyAnimation(enemy, "idle");
        if (enemy.glareTimer <= 0) {
            enemy.aiState = "return_home";
            enemy.routeRepathTimer = 0;
        }
        syncCharacterEnemyTarget(state, enemy);
        return;
    }

    if (enemy.engaged && !seesPlayer) {
        if (hasRecentSight && enemy.routeTargetSupportId) {
            // Keep executing a route chosen while the target was visible. This is
            // especially important for ranged backpedalling: turning away to create
            // space briefly moves Ignatius outside the facing cone, but should not
            // cancel the already committed tactical movement.
            if (!followCharacterEnemyNavigationPlan(state, enemy, navigation, dt)) {
                clearCharacterEnemyNavigationPlan(enemy);
                enemy.routeRepathTimer = 0;
            }
            syncCharacterEnemyTarget(state, enemy);
            return;
        }
        updateCharacterEnemyLastSeenInvestigation(state, enemy, navigation, dt, {
            // Awareness hold keeps the engagement alive and delays the glare/give-up
            // sequence. It must not make a hunter stand motionless while its last
            // genuinely seen target has already moved onto another support.
            allowGlare: !hasRecentSight
        });
        syncCharacterEnemyTarget(state, enemy);
        return;
    }

    if (enemy.aiState === "return_home") {
        const atHome = enemy.homeSupportId === navigation.current?.support?.id && Math.abs(enemy.x - enemy.spawnX) <= 6;
        if (atHome) {
            enemy.x = enemy.spawnX;
            enemy.y = navigation.current?.y ?? enemy.y;
            enemy.aiState = "patrol";
            enemy.movementPhase = "idle";
            enemy.phaseTimer = Math.max(0, Number(enemy.idleDuration) || 0);
            enemy.temporaryPatrolMinX = null;
            enemy.temporaryPatrolMaxX = null;
            clearCharacterEnemyNavigationPlan(enemy);
            setCharacterEnemyAnimation(enemy, "idle");
            addEvent(state, "ENEMY_RETURNED_HOME", { enemyId: enemy.id });
            syncCharacterEnemyTarget(state, enemy);
            return;
        }
        enemy.routeRepathTimer = Math.max(0, (Number(enemy.routeRepathTimer) || 0) - dt);
        if ((enemy.routeRepathTimer <= 0 || !enemy.route?.length) && !characterEnemyHasCommittedTraversal(enemy)) {
            const homeSupport = navigationSupportById(navigation.supports, enemy.homeSupportId);
            const route = homeSupport && navigation.current
                ? characterEnemyRoute(state, enemy, navigation.supports, navigation.current.support.id, homeSupport.id, navigation.edgeMap)
                : null;
            if (!route) {
                enterCharacterEnemyStrandedPatrol(state, enemy, navigation);
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
            setCharacterEnemyNavigationPlan(enemy, {
                supportId: homeSupport.id,
                targetX: enemy.spawnX,
                targetY: enemy.spawnY,
                route
            });
        }
        if (!followCharacterEnemyNavigationPlan(state, enemy, navigation, dt)) {
            enterCharacterEnemyStrandedPatrol(state, enemy, navigation);
        }
        syncCharacterEnemyTarget(state, enemy);
        return;
    }

    if (enemy.aiState === "stranded_patrol") {
        enemy.homeRetryTimer = Math.max(0, (Number(enemy.homeRetryTimer) || 0) - dt);
        if (seesPlayer) {
            if (updateCharacterEnemyLocalGroundPursuit(state, enemy, dt)) {
                addEvent(state, "ENEMY_REENGAGED_LOCAL", { enemyId: enemy.id });
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
            const plan = chooseCharacterEnemyAttackPlan(state, enemy, navigation);
            if (plan) {
                enemy.engaged = true;
                enemy.alerted = true;
                enemy.aiState = "pursue";
                setCharacterEnemyNavigationPlan(enemy, plan);
                addEvent(state, "ENEMY_ALERTED", { enemyId: enemy.id });
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
        }
        if (enemy.homeRetryTimer <= 0) {
            enemy.homeRetryTimer = Math.max(FIXED_DT, Number(enemy.homeRetryInterval) || state.tuning.enemyDefaultHomeRetrySeconds || 4);
            const homeSupport = navigationSupportById(navigation.supports, enemy.homeSupportId);
            const route = homeSupport && navigation.current
                ? characterEnemyRoute(state, enemy, navigation.supports, navigation.current.support.id, homeSupport.id, navigation.edgeMap)
                : null;
            if (route) {
                enemy.aiState = "return_home";
                setCharacterEnemyNavigationPlan(enemy, {
                    supportId: homeSupport.id,
                    targetX: enemy.spawnX,
                    targetY: enemy.spawnY,
                    route
                });
                addEvent(state, "ENEMY_HOME_ROUTE_RECOVERED", { enemyId: enemy.id });
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
        }
        updateCharacterEnemyPatrolRange(
            state,
            enemy,
            dt,
            finiteNumberOr(enemy.temporaryPatrolMinX, enemy.x - 40),
            finiteNumberOr(enemy.temporaryPatrolMaxX, enemy.x + 40),
            "stranded_patrol"
        );
        syncCharacterEnemyTarget(state, enemy);
        return;
    }

    if (enemy.engaged) {
        enemy.routeRepathTimer = Math.max(0, (Number(enemy.routeRepathTimer) || 0) - dt);
        const currentSupportId = navigation.current?.support?.id || null;
        const reachedPlannedSupport = !enemy.routeTargetSupportId || enemy.routeTargetSupportId === currentSupportId;
        if (seesPlayer && enemy.attackCooldownTimer <= 0 && reachedPlannedSupport) {
            const canAttack = characterEnemyReadyToAttackFromCurrentPosition(state, enemy);
            if (canAttack) {
                startCharacterEnemyAttack(state, enemy);
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
        }
        if (seesPlayer && (enemy.routeRepathTimer <= 0 || !enemy.routeTargetSupportId) && !characterEnemyHasCommittedTraversal(enemy)) {
            const plan = chooseCharacterEnemyAttackPlan(state, enemy, navigation);
            if (!plan) {
                if (updateCharacterEnemyLocalGroundPursuit(state, enemy, dt)) {
                    syncCharacterEnemyTarget(state, enemy);
                    return;
                }
                enterCharacterEnemyGlare(state, enemy);
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
            setCharacterEnemyNavigationPlan(enemy, plan);
        }
        if (!followCharacterEnemyNavigationPlan(state, enemy, navigation, dt)) {
            if (seesPlayer && updateCharacterEnemyLocalGroundPursuit(state, enemy, dt)) {
                enemy.navigationFailureCount = 0;
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
            enemy.navigationFailureCount = (Number(enemy.navigationFailureCount) || 0) + 1;
            if (enemy.navigationFailureCount >= 2) {
                enterCharacterEnemyGlare(state, enemy);
            } else {
                enemy.routeRepathTimer = 0;
            }
        } else {
            enemy.navigationFailureCount = 0;
        }
        syncCharacterEnemyTarget(state, enemy);
        return;
    }

    enemy.aiState = "patrol";
    enemy.alerted = false;
    updateCharacterEnemyPatrolRange(
        state,
        enemy,
        dt,
        finiteNumberOr(enemy.homePatrolMinX, enemy.patrolMinX),
        finiteNumberOr(enemy.homePatrolMaxX, enemy.patrolMaxX),
        "patrol"
    );
    syncCharacterEnemyTarget(state, enemy);
}

function updateFlyingCharacterEnemy(state, enemy, dt) {
    enemy.supportId = null;
    enemy.ridingPlatformId = null;
    enemy.currentSupportId = null;
    enemy.airborne = true;
    enemy.flightTime = Math.max(0, Number(enemy.flightTime) || 0) + Math.max(0, Number(dt) || 0);

    if ((Number(enemy.hurtTimer) || 0) > 0) {
        enemy.hurtTimer = Math.max(0, enemy.hurtTimer - dt);
        enemy.combatState = ENEMY_COMBAT_STATE.HURT;
    } else if (enemy.combatState === ENEMY_COMBAT_STATE.HURT) {
        enemy.combatState = ENEMY_COMBAT_STATE.ALIVE;
    }

    const amplitude = Math.max(0, Number(enemy.flightAmplitude) || 0);
    const cycles = Math.max(0, Number(enemy.flightCyclesPerSecond) || 0);
    const phase = (enemy.flightTime * cycles + (Number(enemy.flightPhaseOffset) || 0)) * Math.PI * 2;

    if (enemy.strategy === "bomber") {
        const player = state.player;
        const seesPlayer = characterEnemyCanNoticePlayer(state, enemy);
        if (seesPlayer) {
            enemy.awarenessTimer = Math.max(
                FIXED_DT,
                Number(enemy.awarenessHoldDuration) || state.tuning.enemyDefaultAwarenessHoldSeconds || 1.2
            );
        } else {
            enemy.awarenessTimer = Math.max(0, (Number(enemy.awarenessTimer) || 0) - dt);
        }

        const active = seesPlayer || enemy.awarenessTimer > 0;
        const horizontalSpeed = Math.max(0, Number(enemy.bomberHorizontalSpeed) || Number(enemy.walkSpeed) || 0);
        const tolerance = Math.max(1, Number(enemy.bomberDropTolerance) || 34);
        const perchX = finiteNumberOr(enemy.bomberPerchX, enemy.spawnX);
        const perchY = finiteNumberOr(enemy.bomberPerchY, enemy.spawnY);

        if (!active) {
            const patrolDistance = Math.max(0, Number(enemy.patrolDistance) || 0);
            const patrolHalf = patrolDistance * 0.5;
            const patrolMinX = perchX - patrolHalf;
            const patrolMaxX = perchX + patrolHalf;
            const outsidePerchArea = enemy.x < patrolMinX - 4 || enemy.x > patrolMaxX + 4 || Math.abs(enemy.y - perchY) > 12;
            if (outsidePerchArea) {
                const dxHome = perchX - enemy.x;
                const dyHome = perchY - enemy.y;
                const distanceHome = Math.hypot(dxHome, dyHome);
                const step = Math.min(distanceHome, horizontalSpeed * dt);
                const nx = distanceHome > 0 ? dxHome / distanceHome : 0;
                const ny = distanceHome > 0 ? dyHome / distanceHome : 0;
                enemy.x += nx * step;
                enemy.y += ny * step;
                enemy.velocityX = nx * horizontalSpeed;
                enemy.velocityY = ny * horizontalSpeed;
                if (Math.abs(dxHome) > 0.001) enemy.facing = dxHome < 0 ? -1 : 1;
                enemy.bomberState = "returning";
                enemy.movementPhase = "return_to_perch";
                enemy.aiState = "return_to_perch";
            } else if (patrolDistance > 0) {
                const patrolSpeed = Math.max(0, Number(enemy.walkSpeed) || horizontalSpeed * 0.5);
                const direction = Number(enemy.facing) < 0 ? -1 : 1;
                let nextX = enemy.x + direction * patrolSpeed * dt;
                if (nextX <= patrolMinX) {
                    nextX = patrolMinX;
                    enemy.facing = 1;
                } else if (nextX >= patrolMaxX) {
                    nextX = patrolMaxX;
                    enemy.facing = -1;
                }
                enemy.x = nextX;
                enemy.y = perchY + Math.sin(phase) * amplitude;
                enemy.velocityX = (Number(enemy.facing) < 0 ? -1 : 1) * patrolSpeed;
                enemy.velocityY = 0;
                enemy.bomberState = "perch_patrol";
                enemy.movementPhase = "perch_patrol";
                enemy.aiState = "perch_patrol";
            } else {
                enemy.x = perchX;
                enemy.y = perchY;
                enemy.velocityX = 0;
                enemy.velocityY = 0;
                enemy.bomberState = "perched";
                enemy.movementPhase = "perched";
                enemy.aiState = "perched";
            }
            enemy.alerted = false;
        } else {
            const targetX = Number(player?.x) || enemy.x;
            const playerY = Number(player?.y) || perchY;
            const hoverHeight = Math.max(16, Number(enemy.bomberHoverHeight) || 180);
            const desiredHoverY = playerY - hoverHeight;
            const approximateViewportHalfHeight = 270 / Math.max(0.5, Number(state.camera?.zoom) || 1);
            const screenTop = (Number(state.camera?.y) || desiredHoverY) - approximateViewportHalfHeight;
            const topMargin = Math.max(20, Number(enemy.bomberScreenTopMargin) || 72);
            const targetY = Math.max(screenTop + topMargin + enemy.height * 0.5, desiredHoverY);
            const wander = Math.sin(phase * 0.57 + (Number(enemy.flightPhaseOffset) || 0) * 3.1) *
                Math.max(0, Number(enemy.bomberWanderAmplitude) || 0);
            const playerDxBeforeSteering = targetX - enemy.x;
            const approachDistance = Math.max(140, hoverHeight * 1.35);
            const approachBlend = Math.min(1, Math.abs(playerDxBeforeSteering) / approachDistance);
            // Keep a little lateral life even after the bat reaches its bombing station.
            // The previous curve faded to exactly zero over Ignatius, which made the last
            // part of every run look like a ruler-straight homing line.
            const wanderBlend = 0.32 + approachBlend * 0.68;
            const approachArcHeight = Math.max(0, Number(enemy.bomberApproachArcHeight) || 0);
            const approachArc = Math.sin(approachBlend * Math.PI * 0.5) * approachArcHeight;
            let desiredX = targetX + wander * wanderBlend;
            let desiredY = targetY + Math.sin(phase * 0.83) * Math.min(18, amplitude) - approachArc;
            const obstacleMargin = Math.max(8, Number(enemy.bomberObstacleClearance) || 56);
            const clearance = Math.max(enemy.width, enemy.height) * 0.5 + obstacleMargin;
            // Use a compact body probe while retaining the larger clearance value for
            // steering offsets. A clearance-sized circle around the whole sprite extends
            // through the floor whenever the bat is perched and prevents take-off.
            const flightProbeRadius = Math.max(
                8,
                Math.min(
                    Math.min(enemy.width, enemy.height) * 0.28 + obstacleMargin * 0.35,
                    Math.max(8, enemy.height * 0.5 - 4)
                )
            );
            // Enemy x/y uses a feet-position convention. Terrain probes, however, expect
            // a center point. Probing from the feet made a perched bomber permanently
            // overlap the platform beneath it, so every attempted take-off was rejected.
            const enemyCenterY = enemy.y - enemy.height * 0.5;
            const desiredCenterY = desiredY - enemy.height * 0.5;
            const directProbe = {
                x: desiredX,
                y: desiredCenterY,
                radius: flightProbeRadius
            };
            const directHit = findProjectileTerrainImpact(state, directProbe, enemy.x, enemyCenterY);
            if (directHit) {
                const sidestep = enemy.x <= directHit.x ? -1 : 1;
                desiredX += sidestep * clearance * 1.4;
                desiredY = Math.min(desiredY, directHit.y - clearance);
            }
            const dx = desiredX - enemy.x;
            const dy = desiredY - enemy.y;
            const distance = Math.hypot(dx, dy);
            const nx = distance > 0 ? dx / distance : 0;
            const ny = distance > 0 ? dy / distance : 0;
            const steering = Math.min(1, Math.max(0.5, Number(enemy.bomberSteeringResponse) || 4.5) * dt);
            const arrivalRadius = Math.max(tolerance * 2.4, hoverHeight * 0.42, 72);
            const arrivalScale = Math.max(0.22, Math.min(1, distance / arrivalRadius));
            const targetVx = nx * horizontalSpeed * arrivalScale;
            const targetVy = ny * horizontalSpeed * arrivalScale;
            enemy.velocityX += (targetVx - (Number(enemy.velocityX) || 0)) * steering;
            enemy.velocityY += (targetVy - (Number(enemy.velocityY) || 0)) * steering;
            const speedNow = Math.hypot(enemy.velocityX, enemy.velocityY);
            if (speedNow > horizontalSpeed && speedNow > 0) {
                enemy.velocityX = enemy.velocityX / speedNow * horizontalSpeed;
                enemy.velocityY = enemy.velocityY / speedNow * horizontalSpeed;
            }
            const nextX = enemy.x + enemy.velocityX * dt;
            const nextY = enemy.y + enemy.velocityY * dt;
            const movementProbe = {
                x: nextX,
                y: nextY - enemy.height * 0.5,
                radius: flightProbeRadius
            };
            if (!findProjectileTerrainImpact(state, movementProbe, enemy.x, enemyCenterY)) {
                enemy.x = nextX;
                enemy.y = nextY;
            } else {
                enemy.velocityX *= -0.35;
                enemy.velocityY = -Math.abs(enemy.velocityY || horizontalSpeed * 0.35);
            }
            if (Math.abs(dx) > 0.001) enemy.facing = dx < 0 ? -1 : 1;
            enemy.bomberDropTimer = Math.max(0, (Number(enemy.bomberDropTimer) || 0) - dt);
            const dropHeightTolerance = Math.max(4, Number(enemy.bomberDropHeightTolerance) || 36);
            const nearBombingHeight = Math.abs(enemy.y - targetY) <= dropHeightTolerance;
            const verticallyAbove = enemy.y < playerY - 24;
            const dropDx = targetX - enemy.x;
            if (Math.abs(dropDx) <= tolerance && nearBombingHeight && verticallyAbove && enemy.bomberDropTimer <= 0) {
                enemy.projectileLaunchType = "drop";
                enemy.attackMode = "projectile";
                const projectile = launchCharacterEnemyProjectile(state, enemy);
                if (projectile) {
                    addEvent(state, "ENEMY_PROJECTILE_FIRED", {
                        enemyId: enemy.id,
                        projectileId: projectile.id,
                        projectileKind: projectile.kind,
                        projectilePartName: projectile.projectilePartName,
                        launchType: projectile.launchType,
                        x: round(projectile.x),
                        y: round(projectile.y)
                    });
                }
                enemy.bomberDropTimer = Math.max(0.1, Number(enemy.projectileCooldown) || 1.4);
            }
            enemy.bomberState = "attacking";
            enemy.movementPhase = "bombing_run";
            enemy.aiState = "bomber";
            enemy.alerted = true;
        }
    } else {
        const speed = Math.max(0, Number(enemy.walkSpeed) || 0);
        const patrolDistance = Math.max(0, Number(enemy.patrolDistance) || 0);
        if (speed > 0 && patrolDistance > 0) {
            const direction = Number(enemy.facing) < 0 ? -1 : 1;
            const patrolMinX = finiteNumberOr(enemy.patrolMinX, enemy.spawnX - patrolDistance * 0.5);
            const patrolMaxX = finiteNumberOr(enemy.patrolMaxX, enemy.spawnX + patrolDistance * 0.5);
            let nextX = enemy.x + direction * speed * dt;
            if (nextX <= patrolMinX) {
                nextX = patrolMinX;
                enemy.facing = 1;
            } else if (nextX >= patrolMaxX) {
                nextX = patrolMaxX;
                enemy.facing = -1;
            }
            enemy.x = nextX;
        }
        enemy.y = finiteNumberOr(enemy.flightBaseY, enemy.spawnY) + Math.sin(phase) * amplitude;
        enemy.velocityX = (Number(enemy.facing) < 0 ? -1 : 1) * speed;
        enemy.velocityY = Math.cos(phase) * amplitude * cycles * Math.PI * 2;
        enemy.movementPhase = "fly";
        enemy.aiState = "fly";
        enemy.alerted = false;
    }
    setCharacterEnemyAnimation(enemy, "fly");
    syncCharacterEnemyTarget(state, enemy);
}

function beginDeadFlyingCharacterEnemy(state, enemy) {
    if (enemy.deathFlightStarted) {
        return;
    }
    const playerDx = (Number(enemy.x) || 0) - (Number(state.player?.x) || 0);
    const direction = Math.abs(playerDx) > 1
        ? (playerDx < 0 ? -1 : 1)
        : (Number(enemy.facing) < 0 ? -1 : 1);
    enemy.deathFlightStarted = true;
    enemy.deathFlightStartX = Number(enemy.x) || 0;
    enemy.deathFlightStartY = Number(enemy.y) || 0;
    enemy.deathFlightDirection = direction;
    enemy.facing = direction;
    enemy.velocityX = direction * Math.max(1, Number(enemy.deathFlightSpeed) || 520);
    enemy.velocityY = -Math.max(0, Number(enemy.deathFlightLift) || 210);
    enemy.renderOpacity = 1;
}

function updateDeadFlyingCharacterEnemy(state, enemy, dt) {
    beginDeadFlyingCharacterEnemy(state, enemy);
    enemy.deathElapsed = Math.max(0, Number(enemy.deathElapsed) || 0) + Math.max(0, Number(dt) || 0);
    enemy.x += (Number(enemy.velocityX) || 0) * dt;
    enemy.y += (Number(enemy.velocityY) || 0) * dt;
    enemy.velocityY = (Number(enemy.velocityY) || 0) + (Number(enemy.deathFlightGravity) || 0) * dt;
    enemy.movementPhase = "death_fly_off";
    enemy.aiState = "dead";
    enemy.airborne = true;
    setCharacterEnemyAnimation(enemy, "fly");

    const distance = Math.hypot(
        enemy.x - finiteNumberOr(enemy.deathFlightStartX, enemy.spawnX),
        enemy.y - finiteNumberOr(enemy.deathFlightStartY, enemy.spawnY)
    );
    enemy.renderOpacity = distance >= Math.max(1, Number(enemy.deathFlyOffDistance) || 720) ? 0 : 1;
    syncCharacterEnemyTarget(state, enemy);
}

function beginCharacterEnemyDeath(state, enemy) {
    enemy.health = 0;
    enemy.deathPendingLanding = false;
    enemy.combatState = ENEMY_COMBAT_STATE.DEAD;
    enemy.state = "death";
    enemy.movementPhase = "dead";
    enemy.attackTimer = 0;
    enemy.attackLungeRemaining = 0;
    enemy.attackHitApplied = false;
    enemy.hurtTimer = 0;
    enemy.velocityX = 0;
    enemy.velocityY = 0;
    enemy.deathTimer = Math.max(
        FIXED_DT,
        Number(enemy.deathDuration) || state.tuning.enemyDefaultDeathSeconds || 1.18
    );
    enemy.deathElapsed = 0;
    enemy.renderOpacity = 1;
    setCharacterEnemyAnimation(enemy, "death");
}

function deferCharacterEnemyDeathUntilLanding(enemy) {
    enemy.health = 0;
    enemy.deathPendingLanding = true;
    enemy.combatState = ENEMY_COMBAT_STATE.DEATH_PENDING_LANDING;
    enemy.attackTimer = 0;
    enemy.attackLungeRemaining = 0;
    enemy.attackHitApplied = false;
    enemy.hurtTimer = 0;
    enemy.deathTimer = 0;
    enemy.deathElapsed = 0;
    enemy.renderOpacity = 1;
}

function updateDeadCharacterEnemyPhysics(state, enemy, dt) {
    if ((Number(enemy.deathTimer) || 0) > 0) {
        return;
    }

    if (enemy.airborne !== true) {
        const support = findCharacterEnemyGroundSupport(
            state,
            enemy.x,
            enemy.y,
            Math.max(2, Number(enemy.maxStepHeight) || 0),
            Math.max(4, Number(enemy.maxDropDistance) || 0),
            enemy.width
        );
        if (support && Math.abs(support.y - enemy.y) <= Math.max(4, Number(enemy.maxDropDistance) || 0)) {
            enemy.y = support.y;
            enemy.velocityX = 0;
            enemy.velocityY = 0;
            setCharacterEnemyGroundSupportIdentity(state, enemy, support);
            return;
        }
        enemy.airborne = true;
        enemy.supportId = null;
        enemy.ridingPlatformId = null;
    }

    enemy.airTimer = Math.max(0, Number(enemy.airTimer) || 0) + dt;
    enemy.velocityY = (Number(enemy.velocityY) || 0) + Math.max(1, Number(enemy.jumpGravity) || 1) * dt;

    const previousX = enemy.x;
    const previousY = enemy.y;
    const nextX = previousX + (Number(enemy.velocityX) || 0) * dt;
    const horizontalCollision = findActorHorizontalSweepCollision(state, enemy, previousX, nextX);
    enemy.x = horizontalCollision ? horizontalCollision.x : nextX;
    if (horizontalCollision) {
        enemy.velocityX = 0;
    }

    const nextY = previousY + (Number(enemy.velocityY) || 0) * dt;
    const verticalCollision = findActorVerticalSweepCollision(state, enemy, previousY, nextY);
    enemy.y = verticalCollision ? verticalCollision.y : nextY;
    if (verticalCollision?.ceiling) {
        enemy.velocityY = 0;
    } else if (verticalCollision) {
        enemy.velocityX = 0;
        enemy.velocityY = 0;
        enemy.airborne = false;
        enemy.airTimer = 0;
        const support = findCharacterEnemyGroundSupport(
            state,
            enemy.x,
            enemy.y,
            Math.max(5, Number(enemy.maxStepHeight) || 0),
            Math.max(5, Number(enemy.maxDropDistance) || 0),
            enemy.width
        );
        setCharacterEnemyGroundSupportIdentity(state, enemy, support);
    }
}

function updateDeadEnemyPresentation(state, enemy, dt) {
    const holdDuration = Math.max(0, finiteNumberOr(enemy.corpseHoldDuration, state.tuning.enemyCorpseHoldSeconds));
    const fadeDuration = Math.max(0, finiteNumberOr(enemy.corpseFadeDuration, state.tuning.enemyCorpseFadeSeconds));
    enemy.deathElapsed = Math.max(0, Number(enemy.deathElapsed) || 0) + Math.max(0, Number(dt) || 0);
    if (enemy.deathElapsed <= holdDuration) {
        enemy.renderOpacity = 1;
        return;
    }
    if (fadeDuration <= 0) {
        enemy.renderOpacity = 0;
        return;
    }
    enemy.renderOpacity = clamp(1 - (enemy.deathElapsed - holdDuration) / fadeDuration, 0, 1);
}

function updateCharacterEnemies(state, dt) {
    for (const enemy of state.enemies || []) {
        enemy.hitFlashTimer = Math.max(0, (Number(enemy.hitFlashTimer) || 0) - dt);
        enemy.healthBarTimer = Math.max(0, (Number(enemy.healthBarTimer) || 0) - dt);

        if (!isCharacterEnemyState(enemy)) {
            if (enemy.health <= 0) {
                enemy.combatState = "dead";
                enemy.state = "destroyed";
            } else if (enemy.state === "hurt" && enemy.hitFlashTimer <= 0) {
                enemy.combatState = "alive";
                enemy.state = "idle";
            }
            continue;
        }

        enemy.animationTime = Math.max(0, Number(enemy.animationTime) || 0) + dt;
        enemy.attackCooldownTimer = Math.max(0, (Number(enemy.attackCooldownTimer) || 0) - dt);

        if (
            enemy.health <= 0 &&
            enemy.locomotion !== "flying" &&
            enemy.airborne === true &&
            enemy.combatState !== ENEMY_COMBAT_STATE.DEAD &&
            enemy.deathPendingLanding !== true
        ) {
            deferCharacterEnemyDeathUntilLanding(enemy);
        }

        if (enemy.deathPendingLanding === true) {
            enemy.health = 0;
            enemy.combatState = ENEMY_COMBAT_STATE.DEATH_PENDING_LANDING;
            enemy.attackTimer = 0;
            enemy.attackLungeRemaining = 0;
            enemy.attackHitApplied = false;
            enemy.hurtTimer = 0;
            enemy.deathElapsed = 0;
            enemy.renderOpacity = 1;

            if (enemy.airborne === true) {
                const navigation = characterEnemyNavigationContext(state, enemy);
                updateCharacterEnemyAirTraversal(state, enemy, dt, navigation.supports);
            }

            if (enemy.airborne === true) {
                enemy.combatState = ENEMY_COMBAT_STATE.DEATH_PENDING_LANDING;
                syncCharacterEnemyTarget(state, enemy);
                continue;
            }

            beginCharacterEnemyDeath(state, enemy);
            syncCharacterEnemyTarget(state, enemy);
            continue;
        }

        if (enemy.health <= 0 || enemy.combatState === ENEMY_COMBAT_STATE.DEAD) {
            enemy.health = 0;
            enemy.combatState = ENEMY_COMBAT_STATE.DEAD;
            enemy.movementPhase = "dead";
            enemy.attackTimer = 0;
            enemy.attackLungeRemaining = 0;
            enemy.attackHitApplied = false;
            enemy.deathTimer = Math.max(0, (Number(enemy.deathTimer) || 0) - dt);
            if (enemy.locomotion === "flying") {
                updateDeadFlyingCharacterEnemy(state, enemy, dt);
                continue;
            }
            updateDeadCharacterEnemyPhysics(state, enemy, dt);
            updateDeadEnemyPresentation(state, enemy, dt);
            setCharacterEnemyAnimation(enemy, "death");
            syncCharacterEnemyTarget(state, enemy);
            continue;
        }

        enemy.deathElapsed = 0;
        enemy.renderOpacity = 1;

        if (enemy.locomotion === "flying") {
            updateFlyingCharacterEnemy(state, enemy, dt);
            continue;
        }

        if (enemy.combatState === ENEMY_COMBAT_STATE.ATTACKING || (Number(enemy.attackTimer) || 0) > 0) {
            updateCharacterEnemyAttack(state, enemy, dt);
            continue;
        }

        if ((Number(enemy.hurtTimer) || 0) > 0) {
            enemy.hurtTimer = Math.max(0, enemy.hurtTimer - dt);
            enemy.combatState = "hurt";
            if (enemy.strategy === "hunter" && enemy.airborne) {
                const navigation = characterEnemyNavigationContext(state, enemy);
                updateCharacterEnemyAirTraversal(state, enemy, dt, navigation.supports);
            }
            enemy.movementPhase = "hurt";
            setCharacterEnemyAnimation(enemy, "hurt");
            syncCharacterEnemyTarget(state, enemy);
            continue;
        }
        if (enemy.combatState === ENEMY_COMBAT_STATE.HURT) {
            enemy.combatState = ENEMY_COMBAT_STATE.ALIVE;
            enemy.movementPhase = "idle";
            enemy.phaseTimer = Math.max(Number(enemy.phaseTimer) || 0, Math.min(0.18, Number(enemy.turnPause) || 0));
        }

        if (enemy.strategy === "hunter") {
            updateHunterCharacterEnemy(state, enemy, dt);
            continue;
        }

        const alerted = updateCharacterEnemyAwareness(state, enemy, dt);
        if (alerted) {
            const dx = state.player.x - enemy.x;
            if (Math.abs(dx) > 0.001) {
                enemy.facing = dx < 0 ? -1 : 1;
            }

            if (enemy.attackMode === "projectile") {
                const horizontalDistance = Math.abs(dx);
                if (enemy.attackCooldownTimer <= 0 && characterEnemyCanUseProjectile(state, enemy)) {
                    startCharacterEnemyAttack(state, enemy);
                    syncCharacterEnemyTarget(state, enemy);
                    continue;
                }

                const preferredRange = Math.max(0, Number(enemy.preferredAttackRange) || Number(enemy.attackRange) * 0.72 || 0);
                const minRange = Math.max(0, Number(enemy.preferredAttackMinRange) || Math.min(preferredRange * 0.55, Number(enemy.attackRange) * 0.45 || 0));
                let moved = 0;
                if (horizontalDistance > Math.max(preferredRange, Math.min(Number(enemy.attackRange) || 0, preferredRange + 1))) {
                    moved = moveCharacterEnemyToward(
                        state,
                        enemy,
                        state.player.x,
                        characterEnemyRunSpeed(enemy, state.tuning),
                        dt,
                        Math.max(0, preferredRange)
                    );
                } else if (horizontalDistance < minRange && preferredRange > 0) {
                    const desiredX = state.player.x - enemy.facing * preferredRange;
                    moved = moveCharacterEnemyToward(
                        state,
                        enemy,
                        desiredX,
                        characterEnemyRunSpeed(enemy, state.tuning),
                        dt,
                        0
                    );
                }
                if (moved > 0) {
                    enemy.movementPhase = "chase";
                    setCharacterEnemyAnimation(enemy, "walk");
                } else {
                    enemy.movementPhase = "alert";
                    setCharacterEnemyAnimation(enemy, "idle");
                }
                syncCharacterEnemyTarget(state, enemy);
                continue;
            }

            if (enemy.attackCooldownTimer <= 0 && characterEnemyCanReachPlayer(state, enemy)) {
                startCharacterEnemyAttack(state, enemy);
                syncCharacterEnemyTarget(state, enemy);
                continue;
            }

            const stopDistance = Math.max(
                Number(enemy.attackRange) || 1,
                (Math.max(1, Number(enemy.width) || 1) + Math.max(1, Number(state.player.width) || 1)) * 0.5 - 4
            );
            const moved = moveCharacterEnemyToward(
                state,
                enemy,
                state.player.x,
                characterEnemyRunSpeed(enemy, state.tuning),
                dt,
                stopDistance
            );
            if (moved > 0) {
                enemy.movementPhase = "chase";
                setCharacterEnemyAnimation(enemy, "walk");
            } else {
                enemy.movementPhase = "alert";
                setCharacterEnemyAnimation(enemy, "idle");
            }
            syncCharacterEnemyTarget(state, enemy);
            continue;
        }

        if (enemy.strategy !== "simple_patrol" || enemy.patrolDistance <= 0 || enemy.walkSpeed <= 0) {
            enemy.movementPhase = "guard";
            setCharacterEnemyAnimation(enemy, "idle");
            syncCharacterEnemyTarget(state, enemy);
            continue;
        }

        if (enemy.movementPhase !== "walk") {
            enemy.movementPhase = "idle";
            setCharacterEnemyAnimation(enemy, "idle");
            enemy.phaseTimer = Math.max(0, (Number(enemy.phaseTimer) || 0) - dt);
            if (enemy.phaseTimer <= 0) {
                enemy.movementPhase = "walk";
                setCharacterEnemyAnimation(enemy, "walk");
            }
            syncCharacterEnemyTarget(state, enemy);
            continue;
        }

        setCharacterEnemyAnimation(enemy, "walk");
        const direction = enemy.facing < 0 ? -1 : 1;
        const unclampedX = enemy.x + direction * enemy.walkSpeed * dt;
        const candidateX = clamp(unclampedX, enemy.patrolMinX, enemy.patrolMaxX);
        const reachedBoundary = Math.abs(candidateX - unclampedX) > 0.0001 ||
            candidateX <= enemy.patrolMinX + 0.001 || candidateX >= enemy.patrolMaxX - 0.001;
        const support = findCharacterEnemyWalkingSupport(state, enemy, candidateX, direction);
        if (!support) {
            pauseAndTurnCharacterEnemy(enemy);
            syncCharacterEnemyTarget(state, enemy);
            continue;
        }

        enemy.x = candidateX;
        enemy.y = support.y;
        setCharacterEnemyGroundSupportIdentity(state, enemy, support);
        if (reachedBoundary) {
            pauseAndTurnCharacterEnemy(enemy);
        }
        syncCharacterEnemyTarget(state, enemy);
    }
}

function applyPlayerCaveKillBoundary(state) {
    const player = state.player;
    const boundary = state.world?.caveKillBoundary;
    if (!player || playerDeathActive(state) || player.combatState === "dead" || !player.targetable) {
        return false;
    }
    const rect = getPlayerRect(state);
    if (!rectFullyOutsideCaveKillBoundary(boundary, rect)) {
        return false;
    }

    addEvent(state, "PLAYER_CAVE_BLACK_BOUNDARY_CROSSED", {
        boundarySource: boundary.source || "caveFullBlackOutset",
        x: round(player.x),
        y: round(player.y),
        rect: {
            x: round(rect.x),
            y: round(rect.y),
            w: round(rect.w),
            h: round(rect.h)
        }
    });
    return triggerPlayerDeath(state, {
        sourceId: boundary.source || "caveFullBlackOutset",
        resetReason: "crossedCaveFullBlackBoundary",
        cause: "caveFullBlackBoundary"
    });
}

function playerDeathActive(state) {
    const phase = state.player?.deathPhase;
    return phase === "cover" || phase === "burst" || phase === "afterglow";
}

function updatePlayerDeath(state, dt) {
    const player = state.player;
    if (!playerDeathActive(state)) {
        return false;
    }

    updateMovingPlatforms(state, dt);
    updateProjectiles(state, dt);
    updateWorldEffects(state, dt);
    player.deathElapsed = Math.max(0, Number(player.deathElapsed) || 0) + dt;
    player.deathPhaseTimer = Math.max(0, (Number(player.deathPhaseTimer) || 0) - dt);

    if (player.deathPhase === "cover" && player.deathPhaseTimer <= 0) {
        removePlayerDeathCoverSparks(state);
        player.visible = false;
        player.deathPhase = "burst";
        player.deathPhaseTimer = Math.max(FIXED_DT, Number(state.tuning.playerDeathBurstSeconds) || 0.72);
        emitPlayerDeathBurst(state);
        addEvent(state, "PLAYER_DEATH_BURST", {
            sourceId: player.deathSourceId || "unknown",
            x: round(player.x),
            y: round(player.y)
        });
    } else if (player.deathPhase === "burst" && player.deathPhaseTimer <= 0) {
        player.deathPhase = "afterglow";
        player.deathPhaseTimer = Math.max(FIXED_DT, Number(state.tuning.playerDeathAfterglowSeconds) || 2);
        addEvent(state, "PLAYER_DEATH_AFTERGLOW", {
            sourceId: player.deathSourceId || "unknown",
            x: round(player.x),
            y: round(player.y)
        });
    } else if (player.deathPhase === "afterglow" && player.deathPhaseTimer <= 0) {
        resetPlayer(state, player.deathResetReason || "defeated");
    }
    return true;
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
    updateStatusEffects(state, dt);
    updatePickupRespawns(state, dt);
    state.debug.lastInputFrame = deepClone(input);
    state.collisions.playerTouching = { left: false, right: false, up: false, down: false };
    state.collisions.lastResolution = null;

    if (!playerDeathActive(state) && state.health.amount <= 0) {
        triggerPlayerDeath(state, {
            sourceId: "healthZero",
            resetReason: "healthDepleted",
            cause: "healthDepleted"
        });
    }
    if (updatePlayerDeath(state, dt)) {
        return state;
    }
    if (applyPlayerCaveKillBoundary(state)) {
        return state;
    }

    if (updatePortalIntro(state, dt)) {
        return;
    }
    if (updateMailboxStory(state, input, dt)) {
        return;
    }
    if (updatePortalExit(state, dt)) {
        return;
    }

    updateTreasureChests(state, dt);
    updatePickups(state);
    updateSignalEmitters(state, input);
    updateSignalReceivers(state);
    updateMovingPlatforms(state, dt);
    updateAutomaticEnemySpawning(state, dt);
    updateEnemySpawners(state, dt);
    updateCharacterEnemies(state, dt);
    pruneFinishedAutomaticEnemies(state);
    if (playerDeathActive(state)) {
        return state;
    }

    p.dropThroughTimer = Math.max(0, (Number(p.dropThroughTimer) || 0) - Math.max(0, Number(dt) || 0));
    if (input.dropHeld || input.dropPressed) {
        p.dropThroughTimer = Math.max(
            p.dropThroughTimer,
            Math.max(FIXED_DT, Number(t.playerDropThroughGraceSeconds) || 0.18)
        );
    }

    const wasOnGround = p.onGround;
    p.wasOnGround = wasOnGround;
    p.ax = 0;
    p.ay = t.gravity;

    const digitalMoveAxis = (input.moveRight ? 1 : 0) - (input.moveLeft ? 1 : 0);
    const analogMoveAxis = Number.isFinite(input.moveAxis) ? clamp(input.moveAxis, -1, 1) : 0;
    const moveAxis = Math.abs(analogMoveAxis) > 0.001 ? analogMoveAxis : digitalMoveAxis;
    if (Math.abs(moveAxis) > 0.001) {
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
        t.jumpVelocity = ordinaryJumpVelocity(t.gravity, t.ordinaryJumpHeight);
        p.vy = t.jumpVelocity;
        p.ordinaryJumpActive = true;
        p.ordinaryJumpStartY = p.y;
        p.ordinaryJumpApexY = null;
        p.onGround = false;
        p.supportId = null;
        p.airborneTime = 0;
        p.airBoostArmed = false;
        addEvent(state, "PLAYER_JUMPED", { x: round(p.x), y: round(p.y), vx: round(p.vx), vy: round(p.vy) });
    } else if ((input.jumpPressed || input.boostPressed) && !wasOnGround && !rocket.attachedBoosting) {
        if (p.airBoostArmed) {
            p.airBoostArmed = false;
            startAttachedBoost(state);
        } else {
            addEvent(state, "PLAYER_BOOST_BLOCKED", { reason: "jumpNotReleased" });
        }
    }

    if (rocket.attachedBoosting) {
        const boostIntentHeld = input.jumpHeld || input.boostHeld;
        const shouldStop = !boostIntentHeld || fuel.amount <= 0;
        if (shouldStop) {
            stopAttachedBoost(state, fuel.amount <= 0 ? "fuelEmpty" : "boostReleased");
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
        launchHomingRocket(state);
    }
    updateProjectiles(state, dt);
    updateWorldEffects(state, dt);
    if (playerDeathActive(state)) {
        return state;
    }

    moveAndCollideX(state, p.vx * dt);
    integratePlayerVerticalMotion(state, dt, wasOnGround);
    if (playerDeathActive(state)) {
        return state;
    }
    if (resolvePlayerPenetrations(state, wasOnGround)) {
        return state;
    }
    if (applyPlayerCaveKillBoundary(state)) {
        return state;
    }
    applyPlayerSurfaceHazards(state);
    if (playerDeathActive(state)) {
        return state;
    }
    updatePickups(state);

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
    p.ordinaryJumpActive = false;
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

function rotateVector(vector, radians) {
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return {
        x: vector.x * cos - vector.y * sin,
        y: vector.x * sin + vector.y * cos
    };
}

function deterministicRocketLaunchUnit(state, volleyId, channel, jitterId = null) {
    const random = ensureRandomState(state);
    const saltParts = [
        String(channel || "rocket-launch"),
        state.world?.levelId || "level",
        random.levelLoadCount,
        String(volleyId || "volley")
    ];
    if (jitterId !== null && jitterId !== undefined) {
        saltParts.push(String(jitterId));
    }
    const salt = stableStringHash(saltParts.join(":"));
    return mixedUint32(random.seed ^ salt) / 4294967296;
}

function deterministicRocketLaunchAngleJitterDegrees(state, volleyId, maximumDegrees, jitterId = null) {
    const magnitude = Math.max(0, Number(maximumDegrees) || 0);
    if (magnitude <= 0) return 0;
    const unit = deterministicRocketLaunchUnit(state, volleyId, "rocket-launch-angle-jitter", jitterId);
    return (unit * 2 - 1) * magnitude;
}

function sortTargetsByDistance(targets, originX, originY) {
    return targets.slice().sort((left, right) => {
        const leftDx = Number(left.x) - originX;
        const leftDy = Number(left.y) - originY;
        const rightDx = Number(right.x) - originX;
        const rightDy = Number(right.y) - originY;
        const distanceDifference = (leftDx * leftDx + leftDy * leftDy) - (rightDx * rightDx + rightDy * rightDy);
        if (Math.abs(distanceDifference) > 0.0001) return distanceDifference;
        return String(left.id).localeCompare(String(right.id));
    });
}

function orderedForwardTargets(state) {
    const activeTargets = (state.targets || []).filter((target) => target.state === "active");
    if (!activeTargets.length) return [];
    const player = state.player || { x: 0, y: 0, height: 0, facing: 1 };
    const facing = player.facing < 0 ? -1 : 1;
    const originX = Number(player.x) || 0;
    const originY = (Number(player.y) || 0) - (Number(player.height) || 0) * 0.72;
    return sortTargetsByDistance(
        activeTargets.filter((target) => (Number(target.x) - originX) * facing >= -0.001),
        originX,
        originY
    );
}

function orderedHomingTargets(state) {
    const activeTargets = (state.targets || []).filter((target) => target.state === "active");
    if (!activeTargets.length) return [];
    const player = state.player || { x: 0, y: 0, height: 0, facing: 1 };
    const originX = Number(player.x) || 0;
    const originY = (Number(player.y) || 0) - (Number(player.height) || 0) * 0.72;
    const forwardTargets = orderedForwardTargets(state);
    return forwardTargets.length
        ? forwardTargets
        : sortTargetsByDistance(activeTargets, originX, originY);
}

function activeRocketProfile(state) {
    return activeWrenchPowerUpEffect(state)?.definition?.rocket || {
        projectileCount: 1,
        damageMultiplier: 1,
        radiusMultiplier: 1,
        visualScale: 1,
        glowTint: null,
        speedMultiplier: 1,
        homingStrengthMultiplier: 1,
        homing: true,
        launchMode: "up",
        launchSequenceIntervalSeconds: 0,
        initialAnglesDegrees: [0],
        initialAngleJitterDegrees: 0,
        homingMeanderIntervalSeconds: 0,
        homingMeanderTurnDegrees: 0,
        separateTargets: false,
        aimAtNearestForwardTarget: false,
        areaDamageRadiusWizardHeights: 0,
        boomerang: false,
        phasesThroughObstacles: false
    };
}

function launchHomingRocket(state) {
    const t = state.tuning;
    const weapons = state.weapons;
    const powerUpMultipliers = rocketPowerUpMultipliers(state);
    const activeWrenchEffect = activeWrenchPowerUpEffect(state);
    const rocketProfile = activeWrenchEffect?.definition?.rocket || activeRocketProfile(state);
    const wrenchEffectId = activeWrenchEffect?.id || null;
    const wrenchGlowTint = String(rocketProfile.glowTint || activeWrenchEffect?.definition?.hud?.glowTint || "").trim() || null;
    const wrenchGlowFrameId = wrenchRocketGlowAtlasFrameId(wrenchEffectId);
    const launchCost = Math.max(0, t.rocketLaunchCost * powerUpMultipliers.launchFuelCostMultiplier);
    if (state.fuel.amount < launchCost) {
        addEvent(state, "ROCKET_LAUNCH_BLOCKED", { reason: "fuel", fuel: round(state.fuel.amount), requiredFuel: round(launchCost) });
        return false;
    }

    const p = state.player;
    const projectileCount = Math.max(1, Math.floor(Number(rocketProfile.projectileCount) || 1));
    const targets = orderedHomingTargets(state);
    const launchOrigin = {
        x: Number(p.x) || 0,
        y: (Number(p.y) || 0) - (Number(p.height) || 0) * 0.72
    };
    const defaultDirection = rocketProfile.launchMode === "forward"
        ? { x: p.facing < 0 ? -1 : 1, y: 0 }
        : { x: 0, y: -1 };
    const aimedTarget = rocketProfile.aimAtNearestForwardTarget
        ? orderedForwardTargets(state)[0] || null
        : null;
    const aimedVector = aimedTarget
        ? { x: Number(aimedTarget.x) - launchOrigin.x, y: Number(aimedTarget.y) - launchOrigin.y }
        : null;
    const baseDirection = aimedVector && Math.hypot(aimedVector.x, aimedVector.y) > 0.0001
        ? normalizeVector(aimedVector)
        : defaultDirection;
    const angles = Array.isArray(rocketProfile.initialAnglesDegrees) && rocketProfile.initialAnglesDegrees.length
        ? rocketProfile.initialAnglesDegrees
        : [0];
    const projectileSpeed = t.rocketProjectileSpeed * Math.max(0.05, Number(rocketProfile.speedMultiplier) || 1);
    const projectileDamage = Math.max(0, (t.rocketProjectileDamage ?? 30) * Math.max(0, Number(rocketProfile.damageMultiplier) || 0));
    const projectileRadius = 15 * Math.max(0.1, Number(rocketProfile.radiusMultiplier) || 1);
    const launchSequenceIntervalSeconds = Math.max(0, Number(rocketProfile.launchSequenceIntervalSeconds) || 0);
    const areaDamageRadius = Math.max(0, Number(rocketProfile.areaDamageRadiusWizardHeights) || 0) * Math.max(1, Number(t.wizardHeight) || Number(p.height) || 104);
    const standardRocketSecondarySplashDamage = wrenchEffectId
        ? 0
        : Math.max(0, Number(t.standardRocketSecondarySplashDamage) || 0);
    const standardRocketSecondarySplashRadius = standardRocketSecondarySplashDamage > 0
        ? Math.max(0, Number(t.standardRocketSecondarySplashRadiusWizardHeights) || 0) * Math.max(1, Number(t.wizardHeight) || Number(p.height) || 104)
        : 0;
    const volleyId = `rocket_volley_${state.clock.tick}_${weapons.nextProjectileId}`;
    const spawnedIds = [];

    const initialAngleJitterDegrees = Math.max(0, Number(rocketProfile.initialAngleJitterDegrees) || 0);
    const homingMeanderIntervalSeconds = Math.max(0, Number(rocketProfile.homingMeanderIntervalSeconds) || 0);
    const homingMeanderTurnDegrees = Math.max(0, Number(rocketProfile.homingMeanderTurnDegrees) || 0);
    const volleyAngleJitterDegrees = deterministicRocketLaunchAngleJitterDegrees(
        state,
        volleyId,
        initialAngleJitterDegrees
    );
    for (let index = 0; index < projectileCount; index += 1) {
        const authoredAngleDegrees = Number(angles[index % angles.length]) || 0;
        const jitterDegrees = volleyAngleJitterDegrees;
        const angleDegrees = authoredAngleDegrees + jitterDegrees;
        const launchDir = rotateVector(baseDirection, angleDegrees * Math.PI / 180);
        const target = rocketProfile.homing && targets.length
            ? targets[rocketProfile.separateTargets ? index % targets.length : 0]
            : aimedTarget;
        const launchDelay = launchSequenceIntervalSeconds * index;
        const lateral = launchSequenceIntervalSeconds > 0 ? 0 : index - (projectileCount - 1) * 0.5;
        const perpendicular = { x: -baseDirection.y, y: baseDirection.x };
        const spawnX = launchOrigin.x + perpendicular.x * lateral * 7;
        const spawnY = launchOrigin.y + perpendicular.y * lateral * 7;
        const meanderInitialTimer = homingMeanderIntervalSeconds > 0 && homingMeanderTurnDegrees > 0
            ? homingMeanderIntervalSeconds * (0.35 + deterministicRocketLaunchUnit(
                state,
                volleyId,
                "rocket-homing-meander-delay",
                `projectile_${index}`
            ) * 0.5)
            : 0;
        const projectile = {
            id: `rocket_${String(weapons.nextProjectileId).padStart(3, "0")}`,
            volleyId,
            kind: rocketProfile.boomerang ? "boomerangRocket" : (rocketProfile.homing ? "homingRocket" : "dartRocket"),
            owner: "player",
            isRocket: true,
            state: launchDelay > 0 ? "queued" : "launched",
            launchDelay,
            launchFromPlayerOnActivation: launchDelay > 0,
            x: spawnX,
            y: spawnY,
            vx: launchDir.x * projectileSpeed,
            vy: launchDir.y * projectileSpeed,
            facing: p.facing,
            targetId: target ? target.id : null,
            homing: Boolean(rocketProfile.homing),
            homingStrength: Math.max(0, t.rocketProjectileHomingStrength * (Number(rocketProfile.homingStrengthMultiplier) || 0)),
            initialHomingStrength: Math.max(0, t.rocketProjectileInitialHomingStrength * (Number(rocketProfile.homingStrengthMultiplier) || 0)),
            projectileSpeed,
            launchAngleJitterDegrees: jitterDegrees,
            volleyLaunchAngleJitterDegrees: volleyAngleJitterDegrees,
            homingMeanderIntervalSeconds,
            homingMeanderTurnDegrees,
            homingMeanderTimer: meanderInitialTimer,
            homingMeanderStep: 0,
            homingMeanderLastTurn: 0,
            upLaunchTimer: rocketProfile.launchMode === "up" ? Math.max(0, t.rocketProjectileUpLaunchSeconds ?? 0.32) : 0,
            age: 0,
            lifetime: t.rocketProjectileLifetime,
            explosionTimer: 0,
            radius: projectileRadius,
            visualScale: Math.max(0.1, Number(rocketProfile.visualScale) || 1),
            wrenchEffectId,
            wrenchGlowTint,
            wrenchGlowFrameId,
            explosionVisualScale: Math.max(1, Number(rocketProfile.visualScale) || 1),
            damage: projectileDamage,
            areaDamageRadius,
            secondaryEnemySplashDamage: standardRocketSecondarySplashDamage,
            secondaryEnemySplashRadius: standardRocketSecondarySplashRadius,
            boomerang: Boolean(rocketProfile.boomerang),
            piercesEnemies: Boolean(rocketProfile.piercesEnemies),
            phasesThroughObstacles: Boolean(rocketProfile.phasesThroughObstacles),
            boomerangMode: rocketProfile.boomerang ? "outbound" : null,
            boomerangOutboundTimer: rocketProfile.boomerang
                ? Math.max(0, t.rocketProjectileUpLaunchSeconds ?? 0.32)
                : 0,
            boomerangReturnStartedAt: null,
            boomerangRefundFuel: rocketProfile.boomerang ? launchCost * 0.5 : 0,
            frameId: "rocket_projectile",
            characterId: "ct_char_wizard_1",
            trail: launchDelay > 0
                ? []
                : [{ x: spawnX, y: spawnY, time: state.clock.time }]
        };
        weapons.nextProjectileId += 1;
        state.projectiles.push(projectile);
        spawnedIds.push(projectile.id);
    }

    state.fuel.amount = clamp(state.fuel.amount - launchCost, 0, state.fuel.max);
    markRocketUse(state);
    addEvent(state, "ROCKET_LAUNCHED", {
        id: spawnedIds[0],
        projectileIds: spawnedIds,
        projectileCount,
        targetIds: state.projectiles
            .filter((projectile) => projectile.volleyId === volleyId)
            .map((projectile) => projectile.targetId || null),
        fuel: round(state.fuel.amount),
        fuelCost: round(launchCost),
        wrenchEffectId
    });
    return true;
}

function beginBoomerangReturn(state, projectile, reason) {
    if (!projectile?.boomerang || projectile.boomerangMode === "returning") return false;
    projectile.boomerangMode = "returning";
    projectile.boomerangReturnStartedAt = state.clock.time;
    projectile.targetId = null;
    projectile.upLaunchTimer = 0;
    projectile.boomerangOutboundTimer = 0;
    const target = {
        x: state.player.x,
        y: state.player.y - state.player.height * 0.55
    };
    const desired = normalizeVector({ x: target.x - projectile.x, y: target.y - projectile.y });
    const speed = Math.max(1, Number(projectile.projectileSpeed) || state.tuning.rocketProjectileSpeed);
    projectile.vx = desired.x * speed;
    projectile.vy = desired.y * speed;
    addEvent(state, "BOOMERANG_ROCKET_RETURNING", {
        id: projectile.id,
        reason,
        refundFuel: round(projectile.boomerangRefundFuel || 0)
    });
    return true;
}

function applyRocketHomingMeander(state, projectile, dt) {
    const interval = Math.max(0, Number(projectile.homingMeanderIntervalSeconds) || 0);
    const turnDegrees = Math.max(0, Number(projectile.homingMeanderTurnDegrees) || 0);
    if (interval <= 0 || turnDegrees <= 0 || dt <= 0) return;
    projectile.homingMeanderTimer = (Number(projectile.homingMeanderTimer) || 0) - dt;
    let guard = 0;
    while (projectile.homingMeanderTimer <= 0 && guard < 4) {
        const step = Math.max(0, Math.floor(Number(projectile.homingMeanderStep) || 0));
        const unit = deterministicRocketLaunchUnit(
            state,
            projectile.volleyId || projectile.id || "rocket",
            "rocket-homing-meander-turn",
            `${projectile.id || "projectile"}:${step}`
        );
        const direction = unit < 0.5 ? -1 : 1;
        const rotated = rotateVector(
            { x: Number(projectile.vx) || 0, y: Number(projectile.vy) || 0 },
            direction * turnDegrees * Math.PI / 180
        );
        projectile.vx = rotated.x;
        projectile.vy = rotated.y;
        projectile.homingMeanderLastTurn = direction;
        projectile.homingMeanderLastTurnDegrees = direction * turnDegrees;
        projectile.homingMeanderStep = step + 1;
        projectile.homingMeanderTimer += interval;
        guard += 1;
    }
}

function completeBoomerangReturn(state, projectile) {
    const before = state.fuel.amount;
    state.fuel.amount = clamp(
        state.fuel.amount + Math.max(0, Number(projectile.boomerangRefundFuel) || 0),
        0,
        state.fuel.max
    );
    projectile.state = "spent";
    addEvent(state, "BOOMERANG_ROCKET_CAUGHT", {
        id: projectile.id,
        refundedFuel: round(state.fuel.amount - before),
        fuel: round(state.fuel.amount)
    });
}

function applyStandardRocketSecondarySplash(state, projectile, excludedEnemyId = null) {
    const damage = Math.max(0, Number(projectile?.secondaryEnemySplashDamage) || 0);
    const radius = Math.max(0, Number(projectile?.secondaryEnemySplashRadius) || 0);
    if (damage <= 0 || radius <= 0) {
        return { enemyIds: [], damageEvents: 0 };
    }

    const enemyIds = [];
    const splashProjectile = { ...projectile, damage };
    for (const enemy of state.enemies || []) {
        if (!enemy || enemy.id === excludedEnemyId || enemy.health <= 0 || enemy.combatState === "dead") continue;
        if (!circleRectOverlap(projectile.x, projectile.y, radius, enemyProjectileHitbox(enemy))) continue;
        const result = applyProjectileDamageToEnemy(state, splashProjectile, enemy);
        if (result.damage <= 0) continue;
        enemyIds.push(enemy.id);
    }

    addEvent(state, "STANDARD_ROCKET_SECONDARY_SPLASH_APPLIED", {
        id: projectile.id,
        radius: round(radius),
        damage: round(damage),
        excludedEnemyId,
        enemyIds
    });
    return { enemyIds, damageEvents: enemyIds.length };
}

function applyPlayerProjectileAreaDamage(state, projectile) {
    const radius = Math.max(0, Number(projectile.areaDamageRadius) || 0);
    if (radius <= 0) return { enemyIds: [], objectIds: [], damageEvents: 0 };
    const enemyIds = [];
    const objectIds = [];
    for (const enemy of state.enemies || []) {
        if (!enemy || enemy.health <= 0 || enemy.combatState === "dead") continue;
        if (!circleRectOverlap(projectile.x, projectile.y, radius, enemyProjectileHitbox(enemy))) continue;
        applyProjectileDamageToEnemy(state, projectile, enemy);
        enemyIds.push(enemy.id);
    }
    for (const object of state.reactiveObjects || []) {
        if (!reactiveObjectBlocksProjectiles(object)) continue;
        if (!circleRectOverlap(projectile.x, projectile.y, radius, reactiveObjectCollisionRect(object))) continue;
        applyProjectileDamageToReactiveObject(state, projectile, object);
        objectIds.push(object.id);
    }
    addEvent(state, "ROCKET_AREA_DAMAGE_APPLIED", {
        id: projectile.id,
        radius: round(radius),
        enemyIds,
        objectIds
    });
    return { enemyIds, objectIds, damageEvents: enemyIds.length + objectIds.length };
}

function detonatePlayerProjectile(state, projectile, reason, detail = {}) {
    const area = applyPlayerProjectileAreaDamage(state, projectile);
    explodeProjectile(state, projectile, reason, {
        ...detail,
        areaDamageRadius: Math.max(0, Number(projectile.areaDamageRadius) || 0),
        areaEnemyIds: area.enemyIds,
        areaObjectIds: area.objectIds,
        areaHitCount: area.damageEvents
    });
}

function updateProjectiles(state, dt) {
    const t = state.tuning;

    for (const projectile of state.projectiles) {
        if (projectile.state === "queued") {
            projectile.launchDelay = Math.max(0, (Number(projectile.launchDelay) || 0) - dt);
            if (projectile.launchDelay > 0) continue;
            if (projectile.launchFromPlayerOnActivation) {
                projectile.x = state.player.x;
                projectile.y = state.player.y - state.player.height * 0.72;
            }
            projectile.state = "launched";
            projectile.launchFromPlayerOnActivation = false;
            projectile.age = 0;
            projectile.trail = [{ x: projectile.x, y: projectile.y, time: state.clock.time }];
            addEvent(state, "ROCKET_SEQUENCE_SHOT_LAUNCHED", {
                id: projectile.id,
                volleyId: projectile.volleyId || null,
                wrenchEffectId: projectile.wrenchEffectId || null
            });
        }

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

        if (projectile.isRocket) {
            projectile.upLaunchTimer = Math.max(0, (projectile.upLaunchTimer ?? 0) - dt);
            projectile.boomerangOutboundTimer = Math.max(0, (projectile.boomerangOutboundTimer ?? 0) - dt);
            if (projectile.boomerangMode === "returning") {
                const returnTarget = {
                    x: state.player.x,
                    y: state.player.y - state.player.height * 0.55
                };
                const desired = normalizeVector({ x: returnTarget.x - projectile.x, y: returnTarget.y - projectile.y });
                const speed = Math.max(1, Number(projectile.projectileSpeed) || t.rocketProjectileSpeed);
                const desiredVx = desired.x * speed;
                const desiredVy = desired.y * speed;
                const blend = clamp(Math.max(7.2, Number(projectile.homingStrength) || 0) * 1.5 * dt, 0, 1);
                projectile.vx += (desiredVx - projectile.vx) * blend;
                projectile.vy += (desiredVy - projectile.vy) * blend;
                const nextSpeed = Math.hypot(projectile.vx, projectile.vy) || 1;
                projectile.vx = projectile.vx / nextSpeed * speed;
                projectile.vy = projectile.vy / nextSpeed * speed;
            } else if (projectile.homing) {
                let target = findTargetById(state, projectile.targetId);
                if (!target && projectile.boomerang && projectile.boomerangOutboundTimer <= 0) {
                    beginBoomerangReturn(state, projectile, "targetUnavailable");
                } else {
                    target = target || findHomingTarget(state);
                    if (target) {
                        projectile.targetId = target.id;
                        applyRocketHomingMeander(state, projectile, dt);
                        const desired = normalizeVector({ x: target.x - projectile.x, y: target.y - projectile.y });
                        const speed = Math.max(1, Number(projectile.projectileSpeed) || t.rocketProjectileSpeed);
                        const desiredVx = desired.x * speed;
                        const desiredVy = desired.y * speed;
                        const normalHomingStrength = Number(projectile.homingStrength) || t.rocketProjectileHomingStrength;
                        const initialHomingStrength = Number(projectile.initialHomingStrength) || t.rocketProjectileInitialHomingStrength || normalHomingStrength;
                        const homingStrength = projectile.upLaunchTimer > 0
                            ? Math.max(normalHomingStrength, initialHomingStrength)
                            : normalHomingStrength;
                        const blend = clamp(homingStrength * dt, 0, 1);
                        projectile.vx += (desiredVx - projectile.vx) * blend;
                        projectile.vy += (desiredVy - projectile.vy) * blend;
                        const nextSpeed = Math.hypot(projectile.vx, projectile.vy) || 1;
                        projectile.vx = projectile.vx / nextSpeed * speed;
                        projectile.vy = projectile.vy / nextSpeed * speed;
                    }
                }
            }
        } else if (projectile.kind === "enemyFireball") {
            const playerTarget = state.player.visible === false ? null : { x: state.player.x, y: state.player.y - state.player.height * 0.56 };
            if (playerTarget) {
                const speed = Math.hypot(projectile.vx, projectile.vy) || Math.max(1, Number(projectile.projectileSpeed) || 1);
                const desired = normalizeVector({ x: playerTarget.x - projectile.x, y: playerTarget.y - projectile.y });
                const desiredVx = desired.x * speed;
                const desiredVy = desired.y * speed;
                const blend = clamp((Number(projectile.homingStrength) || 0) * dt, 0, 1);
                projectile.vx += (desiredVx - projectile.vx) * blend;
                projectile.vy += (desiredVy - projectile.vy) * blend;
                const nextSpeed = Math.hypot(projectile.vx, projectile.vy) || 1;
                projectile.vx = projectile.vx / nextSpeed * speed;
                projectile.vy = projectile.vy / nextSpeed * speed;
            }
        }

        if (!projectile.isRocket) {
            projectile.vy += (Number(projectile.gravity) || 0) * dt;
        }

        const previousX = projectile.x;
        const previousY = projectile.y;
        projectile.x += projectile.vx * dt;
        projectile.y += projectile.vy * dt;

        if (projectile.isRocket) {
            recordProjectileTrail(state, projectile);
        } else if (projectile.kind === "enemyFireball") {
            if (state.settings?.renderingQuality !== "low") {
                recordEnemyFireballTrail(state, projectile);
            } else if (Array.isArray(projectile.trail) && projectile.trail.length) {
                projectile.trail.length = 0;
            }
        }

        if (projectile.boomerangMode === "returning") {
            const start = { x: previousX, y: previousY };
            const end = { x: projectile.x, y: projectile.y };
            const radius = Math.max(0, Number(projectile.radius) || 0);
            const catchImpact = sweptCircleRectImpact(start, end, radius, getPlayerRect(state));
            const enemyImpact = findProjectileEnemyImpact(state, projectile, previousX, previousY);
            const reactiveImpact = projectile.phasesThroughObstacles
                ? null
                : findProjectileReactiveObjectImpact(state, projectile, previousX, previousY);
            const terrainImpact = projectile.phasesThroughObstacles
                ? null
                : findProjectileTerrainImpact(state, projectile, previousX, previousY);
            const impacts = [
                catchImpact ? { ...catchImpact, impactKind: "playerCatch", priority: 0 } : null,
                enemyImpact ? { ...enemyImpact, impactKind: "enemy", priority: 1 } : null,
                reactiveImpact ? { ...reactiveImpact, impactKind: "reactiveObject", priority: 2 } : null,
                terrainImpact ? { ...terrainImpact, impactKind: "terrain", priority: 3 } : null
            ].filter(Boolean).sort((a, b) => (a.t - b.t) || (a.priority - b.priority));
            const impact = impacts[0] || null;

            if (impact?.impactKind === "playerCatch") {
                projectile.x = impact.x;
                projectile.y = impact.y;
                completeBoomerangReturn(state, projectile);
            } else if (impact?.impactKind === "enemy") {
                projectile.x = impact.x;
                projectile.y = impact.y;
                const damageResult = applyProjectileDamageToEnemy(state, projectile, impact.enemy);
                explodeProjectile(state, projectile, impact.enemy.id, {
                    impactKind: "enemy",
                    enemyId: impact.enemy.id,
                    damage: damageResult.damage,
                    health: damageResult.health,
                    defeated: damageResult.defeated,
                    boomerangReturning: true
                });
            } else if (impact?.impactKind === "reactiveObject") {
                projectile.x = impact.x;
                projectile.y = impact.y;
                const damageResult = applyProjectileDamageToReactiveObject(state, projectile, impact.object);
                explodeProjectile(state, projectile, impact.object.id, {
                    impactKind: "reactiveObject",
                    objectId: impact.object.id,
                    damage: damageResult.damage,
                    health: damageResult.health,
                    state: damageResult.state,
                    destroyed: damageResult.destroyed,
                    boomerangReturning: true
                });
            } else if (impact?.impactKind === "terrain") {
                projectile.x = impact.x;
                projectile.y = impact.y;
                explodeProjectile(state, projectile, impact.id, {
                    impactKind: "terrain",
                    boomerangReturning: true
                });
            } else if (state.clock.time - (Number(projectile.boomerangReturnStartedAt) || state.clock.time) >= 4) {
                projectile.state = "spent";
                addEvent(state, "BOOMERANG_ROCKET_RETURN_FAILED", { id: projectile.id });
            }
            continue;
        }

        if (projectile.owner === "enemy") {
            const playerImpact = findProjectilePlayerImpact(state, projectile, previousX, previousY);
            const reactiveImpact = findProjectileReactiveObjectImpact(state, projectile, previousX, previousY);
            const terrainImpact = findProjectileTerrainImpact(state, projectile, previousX, previousY);
            const impacts = [
                playerImpact ? { ...playerImpact, impactKind: "player", priority: 0 } : null,
                reactiveImpact ? { ...reactiveImpact, impactKind: "reactiveObject", priority: 1 } : null,
                terrainImpact ? { ...terrainImpact, impactKind: "terrain", priority: 2 } : null
            ].filter(Boolean).sort((a, b) => (a.t - b.t) || (a.priority - b.priority));
            const impact = impacts[0] || null;
            if (impact?.impactKind === "player") {
                projectile.x = impact.x;
                projectile.y = impact.y;
                const damageResult = applyProjectileDamageToPlayer(state, projectile);
                explodeProjectile(state, projectile, state.player.id || "player", {
                    impactKind: "player",
                    damage: damageResult.damage,
                    health: damageResult.health,
                    defeated: damageResult.defeated,
                    blocked: damageResult.blocked
                });
                continue;
            }
            if (impact?.impactKind === "reactiveObject") {
                projectile.x = impact.x;
                projectile.y = impact.y;
                const damageResult = applyProjectileDamageToReactiveObject(state, projectile, impact.object);
                explodeProjectile(state, projectile, impact.object.id, {
                    impactKind: "reactiveObject",
                    objectId: impact.object.id,
                    damage: damageResult.damage,
                    health: damageResult.health,
                    state: damageResult.state,
                    destroyed: damageResult.destroyed
                });
                continue;
            }
            if (impact?.impactKind === "terrain") {
                projectile.x = impact.x;
                projectile.y = impact.y;
                explodeProjectile(state, projectile, impact.id, { impactKind: "terrain" });
                continue;
            }
            if (projectile.age >= projectile.lifetime) {
                explodeProjectile(state, projectile, "lifetime");
            }
            continue;
        }

        const enemyImpact = findProjectileEnemyImpact(state, projectile, previousX, previousY);
        const reactiveImpact = projectile.phasesThroughObstacles
            ? null
            : findProjectileReactiveObjectImpact(state, projectile, previousX, previousY);
        const terrainImpact = projectile.phasesThroughObstacles
            ? null
            : findProjectileTerrainImpact(state, projectile, previousX, previousY);
        const impacts = [
            enemyImpact ? { ...enemyImpact, impactKind: "enemy", priority: 0 } : null,
            reactiveImpact ? { ...reactiveImpact, impactKind: "reactiveObject", priority: 1 } : null,
            terrainImpact ? { ...terrainImpact, impactKind: "terrain", priority: 2 } : null
        ].filter(Boolean).sort((a, b) => (a.t - b.t) || (a.priority - b.priority));
        const impact = impacts[0] || null;
        if (impact?.impactKind === "enemy") {
            projectile.x = impact.x;
            projectile.y = impact.y;
            if (projectile.areaDamageRadius > 0) {
                detonatePlayerProjectile(state, projectile, impact.enemy.id, {
                    impactKind: "enemy",
                    enemyId: impact.enemy.id
                });
            } else {
                const damageResult = applyProjectileDamageToEnemy(state, projectile, impact.enemy);
                const secondarySplash = applyStandardRocketSecondarySplash(state, projectile, impact.enemy.id);
                if (projectile.boomerang && damageResult.defeated) {
                    emitProjectileImpactSmoke(state, projectile, { impactKind: "enemy" });
                    addEvent(state, "BOOMERANG_ROCKET_TARGET_DESTROYED", {
                        id: projectile.id,
                        enemyId: impact.enemy.id,
                        damage: damageResult.damage
                    });
                    beginBoomerangReturn(state, projectile, "targetDestroyed");
                } else {
                    explodeProjectile(state, projectile, impact.enemy.id, {
                        impactKind: "enemy",
                        enemyId: impact.enemy.id,
                        damage: damageResult.damage,
                        health: damageResult.health,
                        defeated: damageResult.defeated,
                        secondarySplashEnemyIds: secondarySplash.enemyIds
                    });
                }
            }
            continue;
        }
        if (impact?.impactKind === "reactiveObject") {
            projectile.x = impact.x;
            projectile.y = impact.y;
            if (projectile.areaDamageRadius > 0) {
                detonatePlayerProjectile(state, projectile, impact.object.id, {
                    impactKind: "reactiveObject",
                    objectId: impact.object.id
                });
            } else {
                const damageResult = applyProjectileDamageToReactiveObject(state, projectile, impact.object);
                const secondarySplash = applyStandardRocketSecondarySplash(state, projectile);
                if (projectile.boomerang && damageResult.destroyed) {
                    emitProjectileImpactSmoke(state, projectile, { impactKind: "reactiveObject" });
                    beginBoomerangReturn(state, projectile, "objectDestroyed");
                } else {
                    explodeProjectile(state, projectile, impact.object.id, {
                        impactKind: "reactiveObject",
                        objectId: impact.object.id,
                        damage: damageResult.damage,
                        health: damageResult.health,
                        state: damageResult.state,
                        destroyed: damageResult.destroyed,
                        secondarySplashEnemyIds: secondarySplash.enemyIds
                    });
                }
            }
            continue;
        }
        if (impact?.impactKind === "terrain") {
            projectile.x = impact.x;
            projectile.y = impact.y;
            if (projectile.areaDamageRadius > 0) {
                detonatePlayerProjectile(state, projectile, impact.id, { impactKind: "terrain" });
            } else {
                const secondarySplash = applyStandardRocketSecondarySplash(state, projectile);
                explodeProjectile(state, projectile, impact.id, {
                    impactKind: "terrain",
                    secondarySplashEnemyIds: secondarySplash.enemyIds
                });
            }
            continue;
        }

        if (projectile.age >= projectile.lifetime) {
            if (projectile.boomerang) {
                beginBoomerangReturn(state, projectile, "lifetimeMiss");
            } else if (projectile.areaDamageRadius > 0) {
                detonatePlayerProjectile(state, projectile, "lifetime");
            } else {
                explodeProjectile(state, projectile, "lifetime");
            }
        }
    }

    state.projectiles = state.projectiles.filter((projectile) => projectile.state !== "spent");
}

function recordProjectileTrail(state, projectile) {
    if (!Array.isArray(projectile.trail)) {
        projectile.trail = [];
    }

    const previous = projectile.trail[projectile.trail.length - 1];
    const spacing = 12;
    if (!previous || Math.hypot(projectile.x - previous.x, projectile.y - previous.y) >= spacing) {
        projectile.trail.push({
            x: round(projectile.x),
            y: round(projectile.y),
            time: Number(state.clock.time.toFixed(4))
        });
    }

    const particleScale = renderingParticleScale(state.settings);
    const puffSpacing = Math.max(1, (state.tuning.rocketSmokePuffSpacing ?? 16) / particleScale);
    const previousPuff = projectile.lastSmokePuff || null;
    if (!previousPuff || Math.hypot(projectile.x - previousPuff.x, projectile.y - previousPuff.y) >= puffSpacing) {
        addRocketSmokePuff(state, projectile);
        projectile.lastSmokePuff = { x: projectile.x, y: projectile.y };
    }

    const maxTrailAge = 0.42 * rocketTrailDurationScale(state, projectile);
    const cutoff = state.clock.time - maxTrailAge;
    while (projectile.trail.length > 2 && projectile.trail[0].time < cutoff) {
        projectile.trail.shift();
    }
    while (projectile.trail.length > 24) {
        projectile.trail.shift();
    }
}

function rocketTrailDurationScale(state, projectile) {
    const standardSpeed = Math.max(1, Number(state.tuning?.rocketProjectileSpeed) || 1);
    const projectileSpeed = Math.max(
        1,
        Number(projectile.projectileSpeed) || Math.hypot(Number(projectile.vx) || 0, Number(projectile.vy) || 0) || standardSpeed
    );
    return clamp(standardSpeed / projectileSpeed, 0.25, 2.5);
}

function recordEnemyFireballTrail(state, projectile) {
    if (!Array.isArray(projectile.trail)) {
        projectile.trail = [];
    }
    const speed = Math.hypot(projectile.vx || 0, projectile.vy || 0) || 1;
    const tailX = -(projectile.vx || 0) / speed;
    const tailY = -(projectile.vy || 0) / speed;
    const lateralX = -tailY;
    const lateralY = tailX;
    const radius = Math.max(2, Number(projectile.radius) || 10);
    const emitCount = 3;
    const idSeed = String(projectile.id || projectile.enemyId || "enemy_fireball")
        .split("")
        .reduce((acc, ch, index) => (acc + ch.charCodeAt(0) * (index + 17)) % 1000003, 0);

    for (let i = 0; i < emitCount; i += 1) {
        const seed = idSeed + state.clock.tick * 101 + i * 977;
        const lateralNoise = hash01(seed + 13) * 2 - 1;
        const backwardNoise = hash01(seed + 29);
        const heat = hash01(seed + 47);
        const spawnBack = radius * (0.18 + backwardNoise * 0.4);
        const spawnSide = lateralNoise * radius * (0.12 + heat * 0.48);
        const colorBand = heat > 0.82 ? "yellow" : heat > 0.4 ? "orange" : "red";
        projectile.trail.push({
            x: round(projectile.x + tailX * spawnBack + lateralX * spawnSide),
            y: round(projectile.y + tailY * spawnBack + lateralY * spawnSide),
            vx: round(tailX * (18 + hash01(seed + 61) * 36) + lateralX * lateralNoise * (8 + hash01(seed + 79) * 20)),
            vy: round(tailY * (18 + hash01(seed + 97) * 36) + lateralY * lateralNoise * (8 + hash01(seed + 131) * 20)),
            birth: Number(state.clock.time.toFixed(4)),
            lifetime: Number((0.14 + heat * 0.18 + hash01(seed + 173) * 0.06).toFixed(4)),
            radius: Number(Math.min(
                radius * 0.18,
                radius * (0.055 + heat * 0.085) + hash01(seed + 211) * 0.35
            ).toFixed(3)),
            heat: Number(heat.toFixed(4)),
            colorBand
        });
    }

    const cutoff = state.clock.time - 0.42;
    while (projectile.trail.length > 0) {
        const age = state.clock.time - (projectile.trail[0].birth ?? state.clock.time);
        if (projectile.trail[0].birth >= cutoff && age <= (projectile.trail[0].lifetime ?? 0.3)) {
            break;
        }
        projectile.trail.shift();
    }
    while (projectile.trail.length > 48) {
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
    const durationScale = rocketTrailDurationScale(state, projectile);
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
        lifetime: Math.max(0.14, (state.tuning.rocketSmokePuffLifetime ?? 1.5) * 0.23 * durationScale),
        radius: (7 + (seed % 6)) * Math.max(0.6, (state.tuning.rocketSmokePuffScale ?? 1.5) * 0.72),
        sparkleSeed: seed,
        trailTint: String(projectile.wrenchGlowTint || "").trim() || null
    });

    while (state.effects.smokePuffs.length > (state.tuning.rocketSmokeMaxPuffs ?? 180)) {
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
        radius: ["wizardDeathCoverSpark", "wizardDeathBurstParticle", "wizardCrushParticle", "enemyProjectileImpactPuff", "enemyTeleportFlash", "enemyTeleportSpark"].includes(spec.kind)
            ? (spec.radius ?? 4)
            : (spec.radius ?? 12) * (state.tuning.rocketSmokePuffScale ?? 1.5),
        sparkleSeed: spec.sparkleSeed ?? seed,
        gravity: Number(spec.gravity) || 0,
        colorIndex: Math.max(0, Math.round(Number(spec.colorIndex) || 0)),
        rotation: Number(spec.rotation) || 0,
        spin: Number(spec.spin) || 0,
        delay: Math.max(0, Number(spec.delay) || 0),
        impactWizardAccent: spec.impactWizardAccent === true
    });

    while (state.effects.smokePuffs.length > (state.tuning.rocketSmokeMaxPuffs ?? 180)) {
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
    const particleScale = renderingParticleScale(state.settings);
    const interval = Math.max(0.015, (state.tuning.attachedBoostSmokePuffInterval ?? 0.065) / particleScale);
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
    const particleScale = renderingParticleScale(state.settings);
    const authoredCount = Math.max(0, Number(count) || 0);
    const total = authoredCount <= 1
        ? Math.floor(authoredCount)
        : Math.max(1, Math.round(authoredCount * particleScale));
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
        puff.vy = (puff.vy || 0) + (Number(puff.gravity) || 0) * dt;
        puff.x += (puff.vx || 0) * dt;
        puff.y += (puff.vy || 0) * dt;
        puff.rotation = (Number(puff.rotation) || 0) + (Number(puff.spin) || 0) * dt;
        puff.vx *= Math.max(0, 1 - 0.45 * dt);
        puff.vy *= Math.max(0, 1 - 0.25 * dt);
    }
    state.effects.smokePuffs = state.effects.smokePuffs.filter((puff) => puff.age < puff.lifetime);
}

function explodeProjectile(state, projectile, reason, detail = {}) {
    if (projectile.state === "exploding" || projectile.state === "spent") {
        return;
    }
    projectile.impactKind = detail.impactKind || "unknown";
    projectile.impactReason = reason;
    emitProjectileImpactSmoke(state, projectile, detail);
    projectile.state = "exploding";
    projectile.vx = 0;
    projectile.vy = 0;
    projectile.explosionTimer = state.tuning.rocketProjectileExplosionSeconds;
    const eventType = projectile.owner === "enemy" ? "ENEMY_PROJECTILE_IMPACTED" : "ROCKET_IMPACTED";
    addEvent(state, eventType, {
        id: projectile.id,
        reason,
        x: round(projectile.x),
        y: round(projectile.y),
        ...detail
    });
}

function emitProjectileImpactSmoke(state, projectile, detail = {}) {
    const t = state.tuning;
    const particleScale = renderingParticleScale(state.settings);
    const authoredBase = projectile.owner === "enemy"
        ? (t.enemyProjectileImpactSmokePuffs ?? Math.max(0, Math.round((t.rocketImpactSmokePuffs ?? 24) * 0.25)))
        : (t.rocketImpactSmokePuffs ?? 12);
    const count = Math.max(0, Math.round(authoredBase * particleScale));
    const incomingSpeed = Math.hypot(projectile.vx || 0, projectile.vy || 0);
    const incomingAngle = Math.atan2(projectile.vy || 0, projectile.vx || 1);

    for (let i = 0; i < count; i += 1) {
        const u = count <= 1 ? 0 : i / (count - 1);
        const seed = (state.clock.tick * 97 + i * 131 + Math.floor(projectile.x * 3 + projectile.y * 5)) % 10000;
        const angle = incomingAngle + Math.PI + (u - 0.5) * Math.PI * 1.55 + (hash01(seed) - 0.5) * 0.65;
        const speed = 60 + incomingSpeed * (0.08 + hash01(seed + 19) * 0.13) + i * 2.2;
        const offset = 5 + hash01(seed + 41) * 16;
        const enemyProjectile = projectile.owner === "enemy";
        const hitWizard = enemyProjectile && detail.impactKind === "player";
        addSmokePuff(state, {
            kind: enemyProjectile ? "enemyProjectileImpactPuff" : "rocketImpactSmokePuff",
            x: projectile.x + Math.cos(angle) * offset,
            y: projectile.y + Math.sin(angle) * offset,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 18 + hash01(seed + 73) * 42,
            lifetime: enemyProjectile
                ? Math.max(0.18, (t.enemyProjectileImpactLifetime ?? 0.28) * (0.88 + hash01(seed + 101) * 0.32))
                : (t.rocketImpactSmokeLifetime ?? 0.82) * (0.72 + hash01(seed + 101) * 0.34),
            radius: enemyProjectile
                ? 3 + hash01(seed + 157) * 4
                : 8 + hash01(seed + 157) * 8,
            colorIndex: enemyProjectile ? 0 : null,
            impactWizardAccent: hitWizard
        });
    }
}

function hash01(seed) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
}

function findHomingTarget(state) {
    const activeTargets = (state.targets || []).filter((target) => target.state === "active");
    if (!activeTargets.length) {
        return null;
    }

    const player = state.player || { x: 0, y: 0, height: 0, facing: 1 };
    const facing = player.facing < 0 ? -1 : 1;
    const originX = Number(player.x) || 0;
    const originY = (Number(player.y) || 0) - (Number(player.height) || 0) * 0.72;
    const forwardTargets = activeTargets.filter((target) => (Number(target.x) - originX) * facing >= -0.001);
    const candidates = forwardTargets.length ? forwardTargets : activeTargets;

    return candidates.reduce((best, target) => {
        const dx = Number(target.x) - originX;
        const dy = Number(target.y) - originY;
        const distanceSquared = dx * dx + dy * dy;
        if (!best || distanceSquared < best.distanceSquared - 0.0001 ||
            (Math.abs(distanceSquared - best.distanceSquared) <= 0.0001 && String(target.id) < String(best.target.id))) {
            return { target, distanceSquared };
        }
        return best;
    }, null)?.target || null;
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

function findProjectileReactiveObjectImpact(state, projectile, previousX, previousY) {
    const start = { x: previousX, y: previousY };
    const end = { x: projectile.x, y: projectile.y };
    const radius = Math.max(0, projectile.radius || 0);
    let best = null;

    for (const object of state.reactiveObjects || []) {
        if (!reactiveObjectBlocksProjectiles(object)) continue;
        const hit = sweptCircleRectImpact(start, end, radius, reactiveObjectCollisionRect(object));
        if (!hit || (best && hit.t >= best.t)) continue;
        best = { t: hit.t, x: hit.x, y: hit.y, object };
    }
    return best;
}

function applyProjectileDamageToReactiveObject(state, projectile, object) {
    const before = Math.max(0, Number(object.health) || 0);
    const requestedDamage = Math.max(0, Number(projectile.damage ?? state.tuning.rocketProjectileDamage) || 0);
    const scaledDamage = requestedDamage * Math.max(0, Number(object.projectileDamageMultiplier) || 0);
    const damage = Math.min(before, scaledDamage);
    object.health = Math.max(0, before - scaledDamage);
    object.lastDamagedAt = state.clock.time;
    object.lastHitBy = projectile.id;

    let nextState = object.intactState || "intact";
    if (object.health <= 0) nextState = object.destroyedState || "destroyed";
    else if (object.health <= object.damagedHealthThreshold) nextState = object.damagedState || "damaged";
    setReactiveObjectState(state, object, nextState);

    const sourceEntity = worldEntityById(state, object.entityId || object.id);
    if (sourceEntity) sourceEntity.health = object.health;
    const destroyed = object.health <= 0;
    if (destroyed) emitReactiveObjectDestructionSmoke(state, object);
    addEvent(state, destroyed ? "REACTIVE_OBJECT_DESTROYED" : "REACTIVE_OBJECT_DAMAGED", {
        objectId: object.id,
        projectileId: projectile.id,
        damage: round(damage),
        health: round(object.health),
        maxHealth: round(object.maxHealth),
        state: object.state
    });
    return { damage, health: object.health, state: object.state, destroyed };
}

function emitReactiveObjectDestructionSmoke(state, object) {
    const rect = reactiveObjectCollisionRect(object);
    const count = Math.max(0, Math.floor(state.tuning.reactiveObjectDestructionSmokePuffs ?? 18));
    for (let i = 0; i < count; i += 1) {
        const seed = state.clock.tick * 109 + i * 149 + Math.floor(object.x * 7 + object.y * 11);
        const angle = -Math.PI + hash01(seed) * Math.PI;
        const speed = 45 + hash01(seed + 17) * 150;
        addSmokePuff(state, {
            kind: "reactiveObjectDestructionSmokePuff",
            x: rect.x + rect.w * hash01(seed + 31),
            y: rect.y + rect.h * hash01(seed + 47),
            vx: Math.cos(angle) * speed,
            vy: -35 - Math.abs(Math.sin(angle)) * speed - hash01(seed + 61) * 55,
            lifetime: (state.tuning.rocketSmokePuffLifetime ?? 1.5) * (0.9 + hash01(seed + 79) * 0.8),
            radius: 9 + hash01(seed + 97) * 13
        });
    }
}

function findProjectilePlayerImpact(state, projectile, previousX, previousY) {
    if (!playerIsAvailableCombatTarget(state)) {
        return null;
    }
    const hit = sweptCircleRectImpact(
        { x: previousX, y: previousY },
        { x: projectile.x, y: projectile.y },
        Math.max(0, projectile.radius || 0),
        getPlayerRect(state)
    );
    if (!hit) {
        return null;
    }
    return { t: hit.t, x: hit.x, y: hit.y };
}

function applyProjectileDamageToPlayer(state, projectile) {
    const result = damagePlayer(state, projectile.damage, projectile.enemyId || projectile.id, {
        knockbackX: (projectile.vx || 0) < 0 ? -Math.abs(projectile.knockbackX || 0) : Math.abs(projectile.knockbackX || 0),
        knockbackY: projectile.knockbackY || 0
    });
    return {
        damage: result.damage,
        health: state.health.amount,
        defeated: state.health.amount <= 0,
        blocked: result.damage <= 0
    };
}

function findProjectileEnemyImpact(state, projectile, previousX, previousY) {
    const start = { x: previousX, y: previousY };
    const end = { x: projectile.x, y: projectile.y };
    const radius = Math.max(0, projectile.radius || 0);
    let best = null;

    for (const enemy of state.enemies || []) {
        if (!enemy || enemy.health <= 0 || enemy.combatState === "dead") {
            continue;
        }
        const hit = sweptCircleRectImpact(start, end, radius, enemyProjectileHitbox(enemy));
        if (!hit || (best && hit.t >= best.t)) {
            continue;
        }
        best = {
            t: hit.t,
            x: hit.x,
            y: hit.y,
            enemy
        };
    }
    return best;
}

function applyProjectileDamageToEnemy(state, projectile, enemy) {
    const before = Math.max(0, Number(enemy.health) || 0);
    const requestedDamage = Math.max(0, Number(projectile.damage ?? state.tuning.rocketProjectileDamage) || 0);
    const damage = Math.min(before, requestedDamage);
    enemy.maxHealth = Math.max(before, Number(enemy.maxHealth) || before);
    enemy.health = Math.max(0, before - requestedDamage);
    enemy.lastDamagedAt = state.clock.time;
    enemy.lastHitBy = projectile.id;
    enemy.hitFlashDuration = Math.max(FIXED_DT, Number(enemy.hitFlashDuration) || state.tuning.enemyHitFlashSeconds || 0.16);
    enemy.hitFlashTimer = enemy.hitFlashDuration;
    enemy.healthBarTimer = Math.max(0, state.tuning.enemyHealthBarSeconds ?? 1.4);
    if (damage > 0) {
        alertCharacterEnemyFromPlayerDamage(state, enemy);
    }

    const defeated = enemy.health <= 0;
    if (defeated) {
        enemy.health = 0;
        if (
            isCharacterEnemyState(enemy) &&
            enemy.locomotion !== "flying" &&
            enemy.airborne === true
        ) {
            deferCharacterEnemyDeathUntilLanding(enemy);
        } else if (isCharacterEnemyState(enemy)) {
            beginCharacterEnemyDeath(state, enemy);
        } else {
            enemy.combatState = ENEMY_COMBAT_STATE.DEAD;
            enemy.state = "destroyed";
            enemy.movementPhase = "dead";
            enemy.attackTimer = 0;
            enemy.attackHitApplied = false;
            enemy.hurtTimer = 0;
            enemy.deathTimer = Math.max(FIXED_DT, Number(enemy.deathDuration) || state.tuning.enemyDefaultDeathSeconds || 1.18);
            enemy.deathElapsed = 0;
            enemy.renderOpacity = 1;
        }
    } else {
        enemy.combatState = ENEMY_COMBAT_STATE.HURT;
        enemy.state = "hurt";
        if (isCharacterEnemyState(enemy)) {
            enemy.attackTimer = 0;
            enemy.attackLungeRemaining = 0;
            enemy.attackHitApplied = false;
            enemy.attackCooldownTimer = Math.max(Number(enemy.attackCooldownTimer) || 0, Number(enemy.attackCooldown) || 0);
            enemy.hurtTimer = Math.max(FIXED_DT, Number(enemy.hurtDuration) || state.tuning.enemyDefaultHurtSeconds || 0.48);
            enemy.movementPhase = "hurt";
            setCharacterEnemyAnimation(enemy, "hurt");
        }
    }

    const target = (state.targets || []).find((item) => item.enemyId === enemy.id);
    if (target) {
        target.state = defeated ? "inactive" : "active";
        target.x = enemy.targetX ?? target.x;
        target.y = enemy.targetY ?? target.y;
    }

    addEvent(state, defeated ? "ENEMY_DEFEATED" : "ENEMY_DAMAGED", {
        enemyId: enemy.id,
        projectileId: projectile.id,
        damage: round(damage),
        health: round(enemy.health),
        maxHealth: round(enemy.maxHealth),
        deferredUntilLanding: enemy.deathPendingLanding === true
    });
    if (defeated && enemy.isBoss === true && enemy.bossDefeatEmitted !== true) {
        enemy.bossDefeatEmitted = true;
        addEvent(state, "BOSS_DEFEATED", {
            enemyId: enemy.id,
            bossName: enemy.bossName,
            signalChannel: enemy.bossDefeatSignalChannel
        });
        if (enemy.bossDefeatSignalChannel) {
            emitSignalChannel(state, enemy.bossDefeatSignalChannel, { sourceId: enemy.id, active: true });
            updateSignalReceivers(state);
        }
    }
    return {
        damage,
        health: enemy.health,
        defeated,
        deferredUntilLanding: enemy.deathPendingLanding === true
    };
}

function findProjectileTerrainImpact(state, projectile, previousX, previousY) {
    const start = { x: previousX, y: previousY };
    const end = { x: projectile.x, y: projectile.y };
    const radius = Math.max(0, projectile.radius || 0);
    let best = null;

    const terrainQueryBounds = {
        minX: Math.min(start.x, end.x) - radius,
        minY: Math.min(start.y, end.y) - radius,
        maxX: Math.max(start.x, end.x) + radius,
        maxY: Math.max(start.y, end.y) + radius
    };

    function record(hit) {
        if (!hit) return;
        if (!best || hit.t < best.t) {
            best = hit;
        }
    }

    for (const solid of queryWorldSolids(state.world, terrainQueryBounds)) {
        if (solid.reactiveObjectId) continue;
        const hit = sweptCircleRectImpact(start, end, radius, solid);
        if (hit) {
            record({
                t: hit.t,
                x: hit.x,
                y: hit.y,
                id: solid.id || "solid",
                kind: solid.kind || "blockable"
            });
        }
    }

    for (const segment of queryWorldSegments(state.world, terrainQueryBounds)) {
        if (segment.kind === "walkable" || !isSolidSegmentKind(segment.kind)) {
            continue;
        }
        const hit = sweptCircleSegmentImpact(start, end, radius, segment);
        if (hit) {
            record({
                t: hit.t,
                x: hit.x,
                y: hit.y,
                id: segment.id || "segment",
                kind: segment.kind
            });
        }
    }

    for (const polygon of queryWorldCollisionPolygons(state.world, terrainQueryBounds)) {
        if (!isAreaBlockingSegmentKind(polygon.kind)) {
            continue;
        }
        const hit = sweptCirclePolygonImpact(start, end, radius, polygon);
        if (hit) {
            record({
                t: hit.t,
                x: hit.x,
                y: hit.y,
                id: polygon.id || "collisionArea",
                kind: polygon.kind
            });
        }
    }

    return best;
}

function sweptCircleRectImpact(start, end, radius, rect) {
    if (circleRectOverlap(start.x, start.y, radius, rect)) {
        return { t: 0, x: start.x, y: start.y };
    }
    if (circleRectOverlap(end.x, end.y, radius, rect)) {
        return { t: 1, x: end.x, y: end.y };
    }

    const expanded = {
        x: rect.x - radius,
        y: rect.y - radius,
        w: rect.w + radius * 2,
        h: rect.h + radius * 2
    };
    const hit = segmentRectIntersection(start, end, expanded);
    if (hit) {
        return hit;
    }
    return null;
}

function sweptCircleSegmentImpact(start, end, radius, segment) {
    const a = { x: segment.x1, y: segment.y1 };
    const b = { x: segment.x2, y: segment.y2 };
    const crossing = segmentSegmentIntersection(start, end, a, b);
    if (crossing) {
        return crossing;
    }

    const distanceStart = pointSegmentDistance(start, a, b);
    if (distanceStart <= radius) {
        return { t: 0, x: start.x, y: start.y };
    }

    const distanceEnd = pointSegmentDistance(end, a, b);
    if (distanceEnd <= radius) {
        return { t: 1, x: end.x, y: end.y };
    }

    if (segmentSegmentDistance(start, end, a, b) <= radius) {
        return closestPathImpactPoint(start, end, a, b);
    }

    return null;
}

function sweptCirclePolygonImpact(start, end, radius, polygon) {
    const points = Array.isArray(polygon.points) ? polygon.points : [];
    if (points.length < 3) {
        return null;
    }

    if (pointInPolygon(start, polygon)) {
        return { t: 0, x: start.x, y: start.y };
    }
    if (pointInPolygon(end, polygon)) {
        const crossing = firstSegmentPolygonBoundaryIntersection(start, end, polygon);
        return crossing || { t: 1, x: end.x, y: end.y };
    }

    const boundaryHit = firstSegmentPolygonBoundaryIntersection(start, end, polygon);
    if (boundaryHit) {
        return boundaryHit;
    }

    let nearest = null;
    for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        if (pointSegmentDistance(end, a, b) <= radius) {
            const candidate = closestPathImpactPoint(start, end, a, b);
            if (!nearest || candidate.t < nearest.t) {
                nearest = candidate;
            }
        }
    }
    return nearest;
}

function firstSegmentPolygonBoundaryIntersection(start, end, polygon) {
    const points = polygon.points || [];
    let best = null;
    for (let i = 0; i < points.length; i += 1) {
        const hit = segmentSegmentIntersection(start, end, points[i], points[(i + 1) % points.length]);
        if (hit && (!best || hit.t < best.t)) {
            best = hit;
        }
    }
    return best;
}

function pointInPolygon(point, polygon) {
    const points = polygon.points || [];
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
        const a = points[i];
        const b = points[j];
        const dy = b.y - a.y;
        if (Math.abs(dy) < 0.000001) {
            continue;
        }
        const intersects = ((a.y > point.y) !== (b.y > point.y)) &&
            point.x < (b.x - a.x) * (point.y - a.y) / dy + a.x;
        if (intersects) {
            inside = !inside;
        }
    }
    return inside;
}

function segmentRectIntersection(start, end, rect) {
    const points = [
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.w, y: rect.y },
        { x: rect.x + rect.w, y: rect.y + rect.h },
        { x: rect.x, y: rect.y + rect.h }
    ];
    if (pointInRect(start, rect)) {
        return { t: 0, x: start.x, y: start.y };
    }
    let best = null;
    for (let i = 0; i < points.length; i += 1) {
        const hit = segmentSegmentIntersection(start, end, points[i], points[(i + 1) % points.length]);
        if (hit && (!best || hit.t < best.t)) {
            best = hit;
        }
    }
    return best;
}

function pointInRect(point, rect) {
    return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
}

function segmentSegmentIntersection(a, b, c, d) {
    const rx = b.x - a.x;
    const ry = b.y - a.y;
    const sx = d.x - c.x;
    const sy = d.y - c.y;
    const denom = cross(rx, ry, sx, sy);
    const qpx = c.x - a.x;
    const qpy = c.y - a.y;

    if (Math.abs(denom) < 0.000001) {
        return null;
    }

    const t = cross(qpx, qpy, sx, sy) / denom;
    const u = cross(qpx, qpy, rx, ry) / denom;
    if (t < -0.0001 || t > 1.0001 || u < -0.0001 || u > 1.0001) {
        return null;
    }

    const clampedT = clamp(t, 0, 1);
    return {
        t: clampedT,
        x: a.x + rx * clampedT,
        y: a.y + ry * clampedT
    };
}

function cross(ax, ay, bx, by) {
    return ax * by - ay * bx;
}

function pointSegmentDistance(point, a, b) {
    const closest = closestPointOnSegment(point, a, b);
    return Math.hypot(point.x - closest.x, point.y - closest.y);
}

function segmentSegmentDistance(a, b, c, d) {
    if (segmentSegmentIntersection(a, b, c, d)) {
        return 0;
    }
    return Math.min(
        pointSegmentDistance(a, c, d),
        pointSegmentDistance(b, c, d),
        pointSegmentDistance(c, a, b),
        pointSegmentDistance(d, a, b)
    );
}

function closestPathImpactPoint(start, end, a, b) {
    const samples = [
        closestPointOnSegment(a, start, end),
        closestPointOnSegment(b, start, end),
        closestPointOnSegment(start, start, end),
        closestPointOnSegment(end, start, end)
    ];
    let best = samples[0];
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const candidate of samples) {
        const distance = pointSegmentDistance(candidate, a, b);
        if (distance < bestDistance) {
            bestDistance = distance;
            best = candidate;
        }
    }
    return {
        t: segmentParameter(start, end, best),
        x: best.x,
        y: best.y
    };
}

function closestPointOnSegment(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared <= 0.000001) {
        return { x: a.x, y: a.y };
    }
    const t = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared, 0, 1);
    return {
        x: a.x + dx * t,
        y: a.y + dy * t
    };
}

function segmentParameter(start, end, point) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared <= 0.000001) {
        return 0;
    }
    return clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1);
}

function collisionIdIgnored(id, options = {}) {
    if (!id) {
        return false;
    }
    const value = String(id);
    for (const ignored of options.ignoreIds || []) {
        const ignoredValue = String(ignored || "");
        if (!ignoredValue) {
            continue;
        }
        if (value === ignoredValue || value.startsWith(`${ignoredValue}_nav_`) || ignoredValue.startsWith(`${value}_nav_`)) {
            return true;
        }
    }
    return false;
}

function findActorHorizontalSweepCollision(state, actor, previousX, nextX, options = {}) {
    const dx = nextX - previousX;
    if (Math.abs(dx) <= 0.000001) {
        return null;
    }
    const previousLeft = previousX - actor.width / 2;
    const previousRight = previousX + actor.width / 2;
    const currentLeft = nextX - actor.width / 2;
    const currentRight = nextX + actor.width / 2;
    const top = actor.y - actor.height;
    const bottom = actor.y;
    const ySamples = [
        actor.y - actor.height * 0.84,
        actor.y - actor.height * 0.50,
        actor.y - actor.height * 0.16
    ];
    const skin = 3;
    const collisionQueryBounds = {
        minX: Math.min(previousLeft, currentLeft) - skin,
        minY: top - skin,
        maxX: Math.max(previousRight, currentRight) + skin,
        maxY: bottom + skin
    };
    let best = null;
    const consider = (contactX, detail) => {
        if (!Number.isFinite(contactX)) {
            return;
        }
        if (dx > 0) {
            if (previousRight > contactX + skin || currentRight < contactX - skin) {
                return;
            }
            if (!best || contactX < best.contactX) {
                best = { contactX, x: contactX - actor.width / 2, side: "right", ...detail };
            }
        } else {
            if (previousLeft < contactX - skin || currentLeft > contactX + skin) {
                return;
            }
            if (!best || contactX > best.contactX) {
                best = { contactX, x: contactX + actor.width / 2, side: "left", ...detail };
            }
        }
    };

    for (const solid of queryWorldSolids(state.world, collisionQueryBounds)) {
        if (collisionIdIgnored(solid.id, options) || bottom <= solid.y + 0.05 || top >= solid.y + solid.h - 0.05) {
            continue;
        }
        consider(dx > 0 ? solid.x : solid.x + solid.w, {
            id: solid.id,
            kind: solid.kind || "solid",
            source: "solid"
        });
    }

    for (const segment of queryWorldSegments(state.world, collisionQueryBounds)) {
        if (collisionIdIgnored(segment.id, options) || segment.kind === "walkable") {
            continue;
        }
        if (Math.abs(segment.y2 - segment.y1) <= Math.abs(segment.x2 - segment.x1) * 0.75) {
            continue;
        }
        for (const y of ySamples) {
            const x = segmentXAtY(segment, y);
            if (x !== null) {
                consider(x, {
                    id: segment.id,
                    kind: segment.kind,
                    source: "segment"
                });
            }
        }
    }

    for (const polygon of queryWorldCollisionPolygons(state.world, collisionQueryBounds)) {
        if (collisionIdIgnored(polygon.id, options) || !isAreaBlockingSegmentKind(polygon.kind)) {
            continue;
        }
        for (const y of ySamples) {
            for (const interval of polygonXIntervalsAtY(polygon, y)) {
                consider(dx > 0 ? interval[0] : interval[1], {
                    id: polygon.id,
                    kind: polygon.kind,
                    source: "polygon"
                });
            }
        }
    }
    return best;
}

function findActorVerticalSweepCollision(state, actor, previousY, nextY, options = {}) {
    const dy = nextY - previousY;
    if (Math.abs(dy) <= 0.000001) {
        return null;
    }
    const samples = [
        actor.x,
        actor.x - actor.width * 0.42,
        actor.x + actor.width * 0.42
    ];
    const previousTop = previousY - actor.height;
    const currentTop = nextY - actor.height;
    const skin = 3;
    const collisionQueryBounds = {
        minX: Math.min(...samples) - skin,
        minY: Math.min(previousTop, currentTop, previousY, nextY) - skin,
        maxX: Math.max(...samples) + skin,
        maxY: Math.max(previousTop, currentTop, previousY, nextY) + skin
    };
    let best = null;
    const consider = (surfaceY, detail, ceiling = false) => {
        if (!Number.isFinite(surfaceY)) {
            return;
        }
        if (!ceiling) {
            if (previousY > surfaceY + skin || nextY < surfaceY - skin) {
                return;
            }
            if (!best || surfaceY < best.surfaceY) {
                best = { surfaceY, y: surfaceY, ceiling: false, ...detail };
            }
        } else {
            if (previousTop < surfaceY - skin || currentTop > surfaceY + skin) {
                return;
            }
            if (!best || !best.ceiling || surfaceY > best.surfaceY) {
                best = { surfaceY, y: surfaceY + actor.height, ceiling: true, ...detail };
            }
        }
    };

    for (const solid of queryWorldSolids(state.world, collisionQueryBounds)) {
        if (collisionIdIgnored(solid.id, options)) {
            continue;
        }
        if (!samples.some((x) => x >= solid.x - 0.001 && x <= solid.x + solid.w + 0.001)) {
            continue;
        }
        if (dy > 0) {
            consider(solid.y, { id: solid.id, kind: solid.kind || "solid", source: "solid" });
        } else {
            consider(solid.y + solid.h, { id: solid.id, kind: solid.kind || "solid", source: "solid" }, true);
        }
    }

    for (const segment of queryWorldSegments(state.world, collisionQueryBounds)) {
        if (collisionIdIgnored(segment.id, options) || !isSolidSegmentKind(segment.kind) || Math.abs(segment.x2 - segment.x1) < 0.001) {
            continue;
        }
        if (options.ignoreWalkable && segment.kind === "walkable") {
            continue;
        }
        for (const x of samples) {
            const y = segmentYAtX(segment, x);
            if (y === null) {
                continue;
            }
            if (dy > 0) {
                consider(y, { id: segment.id, kind: segment.kind, source: "segment" });
            } else if (segment.kind !== "walkable") {
                consider(y, { id: segment.id, kind: segment.kind, source: "segment" }, true);
            }
        }
    }

    for (const polygon of queryWorldCollisionPolygons(state.world, collisionQueryBounds)) {
        if (collisionIdIgnored(polygon.id, options) || !isAreaBlockingSegmentKind(polygon.kind)) {
            continue;
        }
        for (const x of samples) {
            for (const interval of polygonYIntervalsAtX(polygon, x)) {
                if (dy > 0) {
                    consider(interval[0], { id: polygon.id, kind: polygon.kind, source: "polygon" });
                } else {
                    consider(interval[1], { id: polygon.id, kind: polygon.kind, source: "polygon" }, true);
                }
            }
        }
    }
    return best;
}

function tryActorStepUp(state, actor, previousX, nextX, maxStepHeight, options = {}) {
    const originalX = actor.x;
    const originalY = actor.y;
    const maximum = Math.max(0, Math.floor(Number(maxStepHeight) || 0));
    if (maximum < 1) return null;

    const direction = Math.sign(nextX - previousX) || 1;
    const probeX = nextX + direction * Math.min(6, Math.max(2, actor.width * 0.15));
    for (let step = 1; step <= maximum; step += 1) {
        actor.x = previousX;
        actor.y = originalY - step;
        const horizontalCollision = findActorHorizontalSweepCollision(state, actor, previousX, probeX, options);
        if (horizontalCollision) continue;

        actor.x = probeX;
        const landing = findActorVerticalSweepCollision(state, actor, originalY - step, originalY + 1, options);
        if (!landing || landing.ceiling) continue;
        if (landing.y >= originalY - 0.05 || landing.y < originalY - maximum - 0.5) continue;

        actor.x = originalX;
        actor.y = originalY;
        return { x: probeX, y: landing.y, height: originalY - landing.y, id: landing.id, kind: landing.kind, source: landing.source };
    }

    actor.x = originalX;
    actor.y = originalY;
    return null;
}

function moveAndCollideX(state, dx) {
    const p = state.player;
    if (dx === 0) {
        return;
    }
    const previousX = p.x;
    const nextX = previousX + dx;
    const collision = findActorHorizontalSweepCollision(state, p, previousX, nextX);
    if (!collision) {
        p.x = nextX;
        return;
    }
    if (p.onGround && p.vy >= 0) {
        const stepped = tryActorStepUp(state, p, previousX, nextX, p.height * AUTOMATIC_STEP_HEIGHT_RATIO, {
            ignoreWalkable: (Number(p.dropThroughTimer) || 0) > 0
        });
        if (stepped) {
            p.x = stepped.x;
            landPlayerOn(state, stepped.y, true, stepped.id, stepped.kind);
            state.collisions.lastResolution = {
                axis: "step",
                height: round(stepped.height),
                id: stepped.id,
                kind: stepped.kind,
                source: stepped.source
            };
            return;
        }
    }
    p.x = collision.x;
    p.vx = 0;
    if (collision.side === "right") {
        state.collisions.playerTouching.right = true;
    } else {
        state.collisions.playerTouching.left = true;
    }
    state.collisions.lastResolution = {
        axis: "x",
        id: collision.id,
        kind: collision.kind,
        source: collision.source
    };
}

function integratePlayerVerticalMotion(state, dt, wasOnGround) {
    const p = state.player;
    const t = state.tuning;

    if (!p.ordinaryJumpActive || state.equipment.rocket.attachedBoosting) {
        p.vy += t.gravity * dt;
        p.vy = Math.min(p.vy, t.terminalVelocity);
        applyAttachedHoverGovernor(state, dt);
        moveAndCollideY(state, p.vy * dt, wasOnGround);
        return;
    }

    const gravity = Math.max(1, Number(t.gravity) || DEFAULT_TUNING.gravity);
    const initialVy = p.vy;
    const finalVy = Math.min(initialVy + gravity * dt, t.terminalVelocity);
    const crossesApex = initialVy < 0 && finalVy >= 0;

    if (!crossesApex) {
        const effectiveAcceleration = (finalVy - initialVy) / Math.max(0.000001, dt);
        const dy = initialVy * dt + 0.5 * effectiveAcceleration * dt * dt;
        p.vy = finalVy;
        moveAndCollideY(state, dy, wasOnGround);
        return;
    }

    const apexTime = Math.min(dt, Math.max(0, -initialVy / gravity));
    const apexDisplacement = initialVy * apexTime + 0.5 * gravity * apexTime * apexTime;
    p.vy = 0;
    moveAndCollideY(state, apexDisplacement, wasOnGround);
    if (!p.ordinaryJumpActive || state.collisions.playerTouching.up) return;

    p.ordinaryJumpApexY = p.y;
    addEvent(state, "PLAYER_JUMP_APEX", {
        x: round(p.x),
        y: round(p.y),
        height: round((Number.isFinite(Number(p.ordinaryJumpStartY)) ? Number(p.ordinaryJumpStartY) : p.y) - p.y),
        configuredHeight: round(t.ordinaryJumpHeight)
    });

    const remaining = Math.max(0, dt - apexTime);
    p.vy = Math.min(gravity * remaining, t.terminalVelocity);
    if (remaining > 0) {
        moveAndCollideY(state, 0.5 * gravity * remaining * remaining, false);
    }
}

function moveAndCollideY(state, dy, wasOnGround) {
    const p = state.player;
    const previousY = p.y;
    const nextY = previousY + dy;
    p.onGround = false;
    p.supportId = null;
    const collision = findActorVerticalSweepCollision(state, p, previousY, nextY, {
        ignoreWalkable: (Number(p.dropThroughTimer) || 0) > 0
    });
    p.y = collision ? collision.y : nextY;
    if (!collision) {
        return;
    }
    if (collision.ceiling) {
        p.vy = 0;
        p.ordinaryJumpActive = false;
        state.collisions.playerTouching.up = true;
        state.collisions.lastResolution = {
            axis: "y",
            id: collision.id,
            kind: collision.kind,
            source: collision.source,
            ceiling: true
        };
        return;
    }
    landPlayerOn(state, collision.y, wasOnGround, collision.id, collision.kind);
}

function resolvePlayerPenetrations(state, wasOnGround) {
    const maxPasses = 8;
    const corrections = [];

    for (let pass = 0; pass < maxPasses; pass += 1) {
        const rect = getPlayerRect(state);
        const blockers = playerPenetrationBlockers(state, rect);
        const candidates = blockers.flatMap((blocker) => blocker.candidates);

        if (!candidates.length) {
            clearPlayerCrushCandidate(state, "noPenetration");
            break;
        }

        candidates.sort((a, b) => {
            const distanceDelta = a.distance - b.distance;
            if (Math.abs(distanceDelta) > 0.000001) {
                return distanceDelta;
            }
            return depenetrationDirectionPriority(state.player, a.direction) -
                depenetrationDirectionPriority(state.player, b.direction);
        });

        const nearestDistance = candidates[0].distance;
        const nearestCandidates = candidates.filter((candidate) => (
            Math.abs(candidate.distance - nearestDistance) <= 0.000001
        ));
        let best = nearestCandidates[0];
        let crushProbe = playerCrushProbeForCandidate(state, rect, best);
        for (const candidate of nearestCandidates) {
            const candidateProbe = playerCrushProbeForCandidate(state, rect, candidate);
            if (!candidateProbe) {
                best = candidate;
                crushProbe = null;
                break;
            }
            if (!crushProbe) {
                best = candidate;
                crushProbe = candidateProbe;
            }
        }

        if (crushProbe) {
            return advancePlayerCrushCandidate(state, crushProbe);
        }

        clearPlayerCrushCandidate(state, "safeDepenetration");
        applyPlayerDepenetration(state, best, wasOnGround);
        corrections.push(best);
    }

    if (corrections.length) {
        const last = corrections[corrections.length - 1];
        addEvent(state, "PLAYER_COLLISION_RECOVERED", {
            passes: corrections.length,
            direction: last.direction,
            distance: round(corrections.reduce((sum, correction) => sum + correction.distance, 0)),
            source: last.source,
            id: last.id,
            kind: last.kind
        });
    }
    return false;
}

function playerPenetrationBlockers(state, rect) {
    const blockers = [];

    for (const solid of queryWorldSolids(state.world, rect)) {
        if (!rectsOverlap(rect, solid)) {
            continue;
        }
        const detail = collisionBodyDetail(solid, "solid");
        blockers.push({
            ...detail,
            candidates: rectDepenetrationCandidates(rect, solid, detail)
        });
    }

    for (const polygon of queryWorldCollisionPolygons(state.world, rect)) {
        if (!isAreaBlockingSegmentKind(polygon.kind) || !polygonOverlapsRect(polygon, rect)) {
            continue;
        }
        const detail = collisionBodyDetail(polygon, "polygon");
        blockers.push({
            ...detail,
            candidates: polygonDepenetrationCandidates(rect, polygon, detail)
        });
    }

    return blockers;
}

function collisionBodyDetail(collider, source) {
    const movingPlatformId = collider?.movingPlatformId || null;
    const id = collider?.id || `${source}_collision`;
    return {
        id,
        kind: collider?.kind || (source === "solid" ? "solid" : "blockable"),
        source,
        movingPlatformId,
        bodyKey: movingPlatformId ? `platform:${movingPlatformId}` : `${source}:${id}`
    };
}

function playerCrushProbeForCandidate(state, rect, candidate) {
    const translatedRect = translateRect(rect, candidate.dx, candidate.dy);
    const direction = {
        x: candidate.dx === 0 ? 0 : Math.sign(candidate.dx),
        y: candidate.dy === 0 ? 0 : Math.sign(candidate.dy)
    };
    const obstructions = playerBlockingBodiesAtRect(state, translatedRect, direction);
    const sourceBody = {
        bodyKey: candidate.bodyKey,
        id: candidate.id,
        source: candidate.source,
        movingPlatformId: candidate.movingPlatformId || null
    };

    for (const obstruction of obstructions) {
        if (obstruction.bodyKey === sourceBody.bodyKey) {
            continue;
        }
        const sourceDelta = collisionBodyMovementDelta(state, sourceBody);
        const obstructionDelta = collisionBodyMovementDelta(state, obstruction);
        const closingDistance =
            (sourceDelta.x - obstructionDelta.x) * direction.x +
            (sourceDelta.y - obstructionDelta.y) * direction.y;
        const epsilon = Math.max(0, Number(state.tuning.playerCrushClosingDistanceEpsilon) || 0);
        if (closingDistance <= epsilon) {
            continue;
        }

        const bodyKeys = [sourceBody.bodyKey, obstruction.bodyKey].sort();
        const axis = direction.x !== 0 ? "x" : "y";
        return {
            key: `${bodyKeys[0]}|${bodyKeys[1]}|${axis}`,
            axis,
            direction: candidate.direction,
            distance: candidate.distance,
            closingDistance,
            sourceId: sourceBody.id,
            sourceType: sourceBody.source,
            sourcePlatformId: sourceBody.movingPlatformId,
            obstructionId: obstruction.id,
            obstructionType: obstruction.source,
            obstructionPlatformId: obstruction.movingPlatformId || null
        };
    }
    return null;
}

function playerBlockingBodiesAtRect(state, rect, direction) {
    const bodies = [];
    const seen = new Set();
    const add = (detail) => {
        if (!detail?.bodyKey || seen.has(detail.bodyKey)) {
            return;
        }
        seen.add(detail.bodyKey);
        bodies.push(detail);
    };

    for (const solid of queryWorldSolids(state.world, rect)) {
        if (rectsOverlap(rect, solid)) {
            add(collisionBodyDetail(solid, "solid"));
        }
    }
    for (const polygon of queryWorldCollisionPolygons(state.world, rect)) {
        if (isAreaBlockingSegmentKind(polygon.kind) && polygonOverlapsRect(polygon, rect)) {
            add(collisionBodyDetail(polygon, "polygon"));
        }
    }
    for (const segment of queryWorldSegments(state.world, rect)) {
        if (!isSolidSegmentKind(segment.kind)) {
            continue;
        }
        const intersects = Boolean(segmentRectIntersection(
            { x: segment.x1, y: segment.y1 },
            { x: segment.x2, y: segment.y2 },
            rect
        ));
        const isSupport = direction.y > 0 && segment.id === state.player.supportId;
        if (intersects || isSupport) {
            add(collisionBodyDetail(segment, "segment"));
        }
    }
    return bodies;
}

function collisionBodyMovementDelta(state, body) {
    if (!body?.movingPlatformId) {
        return { x: 0, y: 0 };
    }
    const platform = (state.world.movingPlatforms || []).find((item) => item.id === body.movingPlatformId);
    if (!platform || platform.collisionAttached === false) {
        return { x: 0, y: 0 };
    }
    return {
        x: Number(platform.lastDeltaX) || 0,
        y: Number(platform.lastDeltaY) || 0
    };
}

function advancePlayerCrushCandidate(state, probe) {
    const player = state.player;
    const sameCandidate = player.crushCandidateKey === probe.key;
    player.crushCandidateTicks = sameCandidate
        ? Math.max(0, Number(player.crushCandidateTicks) || 0) + 1
        : 1;
    player.crushCandidateKey = probe.key;
    player.crushCandidateDetail = deepClone(probe);

    if (player.crushCandidateTicks === 2) {
        addEvent(state, "PLAYER_CRUSH_WARNING", {
            consecutiveTicks: player.crushCandidateTicks,
            ...probe
        });
    }

    const confirmTicks = Math.max(1, Math.round(Number(state.tuning.playerCrushConfirmTicks) || 3));
    if (player.crushCandidateTicks < confirmTicks) {
        return false;
    }

    triggerPlayerCrushDeath(state, probe);
    return true;
}

function clearPlayerCrushCandidate(state, reason) {
    const player = state.player;
    const previousTicks = Math.max(0, Number(player.crushCandidateTicks) || 0);
    if (previousTicks >= 2) {
        addEvent(state, "PLAYER_CRUSH_NEAR_MISS", {
            consecutiveTicks: previousTicks,
            reason,
            ...(player.crushCandidateDetail || {})
        });
    }
    player.crushCandidateTicks = 0;
    player.crushCandidateKey = null;
    player.crushCandidateDetail = null;
}

function triggerPlayerCrushDeath(state, probe) {
    const player = state.player;
    if (playerDeathActive(state)) {
        return;
    }

    addEvent(state, "PLAYER_CRUSHED", {
        consecutiveTicks: player.crushCandidateTicks,
        x: round(player.x),
        y: round(player.y),
        ...probe
    });
    triggerPlayerDeath(state, {
        sourceId: "crushingPlatform",
        resetReason: "crushed",
        cause: "crushed"
    });
}

function triggerPlayerDeath(state, options = {}) {
    const player = state.player;
    if (!player || playerDeathActive(state)) {
        return false;
    }

    const sourceId = options.sourceId || "unknown";
    const resetReason = options.resetReason || "defeated";
    const cause = options.cause || "healthDepleted";
    stopAttachedBoost(state, cause);
    state.health.amount = 0;
    state.health.regenerating = false;
    state.health.invulnerabilityTimer = 0;
    player.vx = 0;
    player.vy = 0;
    player.ax = 0;
    player.ay = 0;
    player.visible = true;
    player.combatState = "dead";
    player.targetable = false;
    player.deathPhase = "cover";
    player.deathPhaseTimer = Math.max(FIXED_DT, Number(state.tuning.playerDeathCoverSeconds) || 0.42);
    player.deathElapsed = 0;
    player.deathSourceId = sourceId;
    player.deathResetReason = resetReason;
    removePlayerDeathCoverSparks(state);
    emitPlayerDeathCoverSparks(state);

    addEvent(state, "PLAYER_DEATH_ANIMATION_STARTED", {
        sourceId,
        cause,
        phase: "cover",
        x: round(player.x),
        y: round(player.y)
    });
    addEvent(state, "PLAYER_DEFEATED", { sourceId, cause });
    return true;
}

function removePlayerDeathCoverSparks(state) {
    if (!Array.isArray(state.effects?.smokePuffs)) {
        return;
    }
    state.effects.smokePuffs = state.effects.smokePuffs.filter((puff) => puff.kind !== "wizardDeathCoverSpark");
}

function emitPlayerDeathCoverSparks(state) {
    const player = state.player;
    const particleScale = renderingParticleScale(state.settings);
    const authoredCount = Math.max(1, Math.round(Number(state.tuning.playerDeathCoverParticleCount) || 72));
    const count = Math.max(30, Math.round(authoredCount * particleScale));
    const centerX = player.x;
    const centerY = player.y - player.height * 0.52;
    const coverSeconds = Math.max(FIXED_DT, Number(state.tuning.playerDeathCoverSeconds) || 0.42);

    for (let i = 0; i < count; i += 1) {
        const seed = state.clock.tick * 211 + i * 151 + Math.floor(centerX * 7 + centerY * 11);
        addSmokePuff(state, {
            kind: "wizardDeathCoverSpark",
            x: centerX + (hash01(seed + 17) - 0.5) * player.width * 1.05,
            y: centerY + (hash01(seed + 37) - 0.5) * player.height * 0.98,
            lifetime: coverSeconds + 0.08,
            radius: 2.8 + hash01(seed + 59) * 4.8,
            colorIndex: i % 3,
            rotation: hash01(seed + 79) * Math.PI * 2,
            spin: (hash01(seed + 97) - 0.5) * 8,
            delay: hash01(seed + 113) * coverSeconds * 0.68
        });
    }
}

function emitPlayerDeathBurst(state) {
    const player = state.player;
    const particleScale = renderingParticleScale(state.settings);
    const authoredCount = Math.max(1, Math.round(Number(state.tuning.playerDeathBurstParticleCount) || 64));
    const count = Math.max(28, Math.round(authoredCount * particleScale));
    const centerX = player.x;
    const centerY = player.y - player.height * 0.52;

    for (let i = 0; i < count; i += 1) {
        const seed = state.clock.tick * 193 + i * 137 + Math.floor(centerX * 7 + centerY * 11);
        const offsetX = (hash01(seed + 61) - 0.5) * player.width * 0.9;
        const offsetY = (hash01(seed + 83) - 0.5) * player.height * 0.9;
        const outwardAngle = Math.atan2(offsetY, offsetX || 0.001);
        const angle = outwardAngle + (hash01(seed + 19) - 0.5) * 1.1;
        const speed = (180 + hash01(seed + 29) * 470) * 0.75;
        const radialScale = 0.72 + hash01(seed + 47) * 0.55;
        addSmokePuff(state, {
            kind: "wizardDeathBurstParticle",
            x: centerX + offsetX,
            y: centerY + offsetY,
            vx: Math.cos(angle) * speed * radialScale,
            vy: Math.sin(angle) * speed - 75,
            gravity: 720 + hash01(seed + 101) * 300,
            lifetime: (0.54 + hash01(seed + 127) * 0.58) * 0.5,
            radius: 2.5 + hash01(seed + 149) * 5.1,
            colorIndex: i % 3,
            rotation: hash01(seed + 173) * Math.PI * 2,
            spin: (hash01(seed + 197) - 0.5) * 20
        });
    }
}

function rectDepenetrationCandidates(rect, solid, detail) {
    const separation = 0.02;
    return [
        depenetrationCandidate("left", solid.x - (rect.x + rect.w) - separation, 0, detail),
        depenetrationCandidate("right", solid.x + solid.w - rect.x + separation, 0, detail),
        depenetrationCandidate("up", 0, solid.y - (rect.y + rect.h) - separation, detail),
        depenetrationCandidate("down", 0, solid.y + solid.h - rect.y + separation, detail)
    ];
}

function polygonDepenetrationCandidates(rect, polygon, detail = null) {
    const bounds = polygonBounds(polygon);
    if (!bounds) {
        return [];
    }

    const collisionDetail = detail || collisionBodyDetail(polygon, "polygon");
    const separation = 0.02;
    const limits = {
        left: Math.max(0, rect.x + rect.w - bounds.minX) + 2,
        right: Math.max(0, bounds.maxX - rect.x) + 2,
        up: Math.max(0, rect.y + rect.h - bounds.minY) + 2,
        down: Math.max(0, bounds.maxY - rect.y) + 2
    };

    return [
        depenetrationCandidate("left", -findPolygonExitDistance(polygon, rect, -1, 0, limits.left) - separation, 0, collisionDetail),
        depenetrationCandidate("right", findPolygonExitDistance(polygon, rect, 1, 0, limits.right) + separation, 0, collisionDetail),
        depenetrationCandidate("up", 0, -findPolygonExitDistance(polygon, rect, 0, -1, limits.up) - separation, collisionDetail),
        depenetrationCandidate("down", 0, findPolygonExitDistance(polygon, rect, 0, 1, limits.down) + separation, collisionDetail)
    ];
}

function depenetrationCandidate(direction, dx, dy, detail) {
    return {
        direction,
        dx,
        dy,
        distance: Math.abs(dx) + Math.abs(dy),
        ...detail
    };
}

function depenetrationDirectionPriority(player, direction) {
    if (direction === "left" && player.vx > 0) return 0;
    if (direction === "right" && player.vx < 0) return 0;
    if (direction === "up" && player.vy > 0) return 0;
    if (direction === "down" && player.vy < 0) return 0;
    if (direction === "up") return 1;
    if (direction === "down") return 2;
    return 3;
}

function findPolygonExitDistance(polygon, rect, stepX, stepY, maxDistance) {
    if (!(maxDistance > 0)) {
        return 0;
    }

    const scanStep = 1;
    let previousDistance = 0;
    for (let distance = Math.min(scanStep, maxDistance); distance <= maxDistance + 0.000001; distance = Math.min(distance + scanStep, maxDistance)) {
        const moved = translateRect(rect, stepX * distance, stepY * distance);
        if (!polygonOverlapsRect(polygon, moved)) {
            let low = previousDistance;
            let high = distance;
            for (let iteration = 0; iteration < 12; iteration += 1) {
                const middle = (low + high) * 0.5;
                if (polygonOverlapsRect(polygon, translateRect(rect, stepX * middle, stepY * middle))) {
                    low = middle;
                } else {
                    high = middle;
                }
            }
            return high;
        }
        if (distance >= maxDistance) {
            break;
        }
        previousDistance = distance;
    }
    return maxDistance;
}

function polygonBounds(polygon) {
    const points = polygon.points || [];
    if (points.length < 3) {
        return null;
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const point of points) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
    }
    return { minX, minY, maxX, maxY };
}

function translateRect(rect, dx, dy) {
    return {
        x: rect.x + dx,
        y: rect.y + dy,
        w: rect.w,
        h: rect.h
    };
}

function polygonOverlapsRect(polygon, rect) {
    const inset = 0.05;
    const innerRect = {
        x: rect.x + inset,
        y: rect.y + inset,
        w: rect.w - inset * 2,
        h: rect.h - inset * 2
    };
    if (innerRect.w <= 0 || innerRect.h <= 0) {
        return false;
    }

    const corners = [
        { x: innerRect.x, y: innerRect.y },
        { x: innerRect.x + innerRect.w, y: innerRect.y },
        { x: innerRect.x + innerRect.w, y: innerRect.y + innerRect.h },
        { x: innerRect.x, y: innerRect.y + innerRect.h }
    ];
    if (corners.some((corner) => pointInPolygon(corner, polygon))) {
        return true;
    }

    const points = polygon.points || [];
    if (points.some((point) => pointInRect(point, innerRect))) {
        return true;
    }

    for (let i = 0; i < points.length; i += 1) {
        if (segmentRectIntersection(points[i], points[(i + 1) % points.length], innerRect)) {
            return true;
        }
    }
    return false;
}

function applyPlayerDepenetration(state, correction, wasOnGround) {
    const p = state.player;
    p.x += correction.dx;
    p.y += correction.dy;

    if (correction.direction === "left") {
        if (p.vx > 0) p.vx = 0;
        state.collisions.playerTouching.right = true;
    } else if (correction.direction === "right") {
        if (p.vx < 0) p.vx = 0;
        state.collisions.playerTouching.left = true;
    } else if (correction.direction === "up") {
        if (p.vy >= 0) {
            landPlayerOn(state, p.y, wasOnGround, correction.id, correction.kind);
        } else {
            state.collisions.playerTouching.down = true;
        }
    } else if (correction.direction === "down") {
        if (p.vy < 0) p.vy = 0;
        p.onGround = false;
        state.collisions.playerTouching.up = true;
    }

    state.collisions.lastResolution = {
        axis: "depenetration",
        direction: correction.direction,
        distance: correction.distance,
        source: correction.source,
        id: correction.id,
        kind: correction.kind
    };
}

function resolveSegmentYCollisions(state, previousY, dy, wasOnGround) {
    if (!Array.isArray(state.world.segments) || state.world.segments.length === 0 || dy === 0) {
        return;
    }

    const p = state.player;
    const samples = [
        p.x,
        p.x - p.width * 0.42,
        p.x + p.width * 0.42
    ];
    const skin = 3;
    const collisionQueryBounds = {
        minX: Math.min(...samples) - skin,
        minY: Math.min(previousY - p.height, p.y - p.height, previousY, p.y) - skin,
        maxX: Math.max(...samples) + skin,
        maxY: Math.max(previousY - p.height, p.y - p.height, previousY, p.y) + skin
    };
    let best = null;

    for (const segment of queryWorldSegments(state.world, collisionQueryBounds)) {
        if (!isSolidSegmentKind(segment.kind)) {
            continue;
        }
        if (Math.abs(segment.x2 - segment.x1) < 0.001) {
            continue;
        }

        for (const x of samples) {
            const y = segmentYAtX(segment, x);
            if (y === null) {
                continue;
            }

            if (dy > 0) {
                if (previousY <= y + skin && p.y >= y - skin) {
                    if (!best || y < best.y) {
                        best = { y, segment };
                    }
                }
            } else if (dy < 0 && segment.kind !== "walkable") {
                const previousTop = previousY - p.height;
                const currentTop = p.y - p.height;
                if (previousTop >= y - skin && currentTop <= y + skin) {
                    if (!best || y > best.y) {
                        best = { y, segment, ceiling: true };
                    }
                }
            }
        }
    }

    if (!best) {
        return;
    }

    if (best.ceiling) {
        p.y = best.y + p.height;
        p.vy = 0;
        state.collisions.playerTouching.up = true;
        state.collisions.lastResolution = { axis: "y", segmentId: best.segment.id, kind: best.segment.kind };
        return;
    }

    landPlayerOn(state, best.y, wasOnGround, best.segment.id, best.segment.kind);
}

function resolveSegmentXCollisions(state, previousX, dx) {
    if (!Array.isArray(state.world.segments) || state.world.segments.length === 0 || dx === 0) {
        return;
    }

    const p = state.player;
    const previousLeft = previousX - p.width / 2;
    const previousRight = previousX + p.width / 2;
    const currentLeft = p.x - p.width / 2;
    const currentRight = p.x + p.width / 2;
    const ySamples = [
        p.y - p.height * 0.84,
        p.y - p.height * 0.50,
        p.y - p.height * 0.16
    ];
    const skin = 3;
    const collisionQueryBounds = {
        minX: Math.min(previousLeft, currentLeft) - skin,
        minY: Math.min(...ySamples) - skin,
        maxX: Math.max(previousRight, currentRight) + skin,
        maxY: Math.max(...ySamples) + skin
    };
    let best = null;

    for (const segment of queryWorldSegments(state.world, collisionQueryBounds)) {
        if (segment.kind === "walkable") {
            continue;
        }
        // Shallow ledge tops are resolved by vertical landing/ceiling checks. Treat only
        // steep sides as horizontal blockers, otherwise a top slope can behave like an
        // invisible wall while running across it.
        if (Math.abs(segment.y2 - segment.y1) <= Math.abs(segment.x2 - segment.x1) * 0.75) {
            continue;
        }

        for (const y of ySamples) {
            const x = segmentXAtY(segment, y);
            if (x === null) {
                continue;
            }
            if (dx > 0 && previousRight <= x + skin && currentRight >= x - skin) {
                if (!best || x < best.x) {
                    best = { x, segment, side: "right" };
                }
            } else if (dx < 0 && previousLeft >= x - skin && currentLeft <= x + skin) {
                if (!best || x > best.x) {
                    best = { x, segment, side: "left" };
                }
            }
        }
    }

    if (!best) {
        return;
    }

    if (best.side === "right") {
        p.x = best.x - p.width / 2;
        state.collisions.playerTouching.right = true;
    } else {
        p.x = best.x + p.width / 2;
        state.collisions.playerTouching.left = true;
    }
    p.vx = 0;
    state.collisions.lastResolution = { axis: "x", segmentId: best.segment.id, kind: best.segment.kind };
}


function resolvePolygonYCollisions(state, previousY, dy, wasOnGround) {
    if (!Array.isArray(state.world.collisionPolygons) || state.world.collisionPolygons.length === 0 || dy === 0) {
        return;
    }

    const p = state.player;
    const samples = [
        p.x,
        p.x - p.width * 0.42,
        p.x + p.width * 0.42
    ];
    const previousTop = previousY - p.height;
    const currentTop = p.y - p.height;
    const skin = 3;
    const collisionQueryBounds = {
        minX: Math.min(...samples) - skin,
        minY: Math.min(previousTop, currentTop, previousY, p.y) - skin,
        maxX: Math.max(...samples) + skin,
        maxY: Math.max(previousTop, currentTop, previousY, p.y) + skin
    };
    let best = null;

    for (const polygon of queryWorldCollisionPolygons(state.world, collisionQueryBounds)) {
        if (!isAreaBlockingSegmentKind(polygon.kind)) {
            continue;
        }
        for (const x of samples) {
            const intervals = polygonYIntervalsAtX(polygon, x);
            for (const interval of intervals) {
                if (dy > 0) {
                    const y = interval[0];
                    if (previousY <= y + skin && p.y >= y - skin) {
                        if (!best || y < best.y) {
                            best = { y, polygon };
                        }
                    }
                } else if (dy < 0) {
                    const y = interval[1];
                    if (previousTop >= y - skin && currentTop <= y + skin) {
                        if (!best || y > best.y) {
                            best = { y, polygon, ceiling: true };
                        }
                    }
                }
            }
        }
    }

    if (!best) {
        return;
    }

    if (best.ceiling) {
        p.y = best.y + p.height;
        p.vy = 0;
        state.collisions.playerTouching.up = true;
        state.collisions.lastResolution = { axis: "y", polygonId: best.polygon.id, kind: best.polygon.kind };
        return;
    }

    landPlayerOn(state, best.y, wasOnGround, best.polygon.id, best.polygon.kind);
}

function resolvePolygonXCollisions(state, previousX, dx) {
    if (!Array.isArray(state.world.collisionPolygons) || state.world.collisionPolygons.length === 0 || dx === 0) {
        return;
    }

    const p = state.player;
    const previousLeft = previousX - p.width / 2;
    const previousRight = previousX + p.width / 2;
    const currentLeft = p.x - p.width / 2;
    const currentRight = p.x + p.width / 2;
    const ySamples = [
        p.y - p.height * 0.84,
        p.y - p.height * 0.50,
        p.y - p.height * 0.16
    ];
    const skin = 3;
    const collisionQueryBounds = {
        minX: Math.min(previousLeft, currentLeft) - skin,
        minY: Math.min(...ySamples) - skin,
        maxX: Math.max(previousRight, currentRight) + skin,
        maxY: Math.max(...ySamples) + skin
    };
    let best = null;

    for (const polygon of queryWorldCollisionPolygons(state.world, collisionQueryBounds)) {
        if (!isAreaBlockingSegmentKind(polygon.kind)) {
            continue;
        }
        for (const y of ySamples) {
            const intervals = polygonXIntervalsAtY(polygon, y);
            for (const interval of intervals) {
                if (dx > 0) {
                    const x = interval[0];
                    if (previousRight <= x + skin && currentRight >= x - skin) {
                        if (!best || x < best.x) {
                            best = { x, polygon, side: "right" };
                        }
                    }
                } else if (dx < 0) {
                    const x = interval[1];
                    if (previousLeft >= x - skin && currentLeft <= x + skin) {
                        if (!best || x > best.x) {
                            best = { x, polygon, side: "left" };
                        }
                    }
                }
            }
        }
    }

    if (!best) {
        return;
    }

    if (best.side === "right") {
        p.x = best.x - p.width / 2;
        state.collisions.playerTouching.right = true;
    } else {
        p.x = best.x + p.width / 2;
        state.collisions.playerTouching.left = true;
    }
    p.vx = 0;
    state.collisions.lastResolution = { axis: "x", polygonId: best.polygon.id, kind: best.polygon.kind };
}

function polygonXIntervalsAtY(polygon, y) {
    const intersections = [];
    const points = polygon.points || [];
    for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        if ((a.y > y) === (b.y > y)) {
            continue;
        }
        const t = (y - a.y) / (b.y - a.y);
        intersections.push(a.x + (b.x - a.x) * t);
    }
    intersections.sort((a, b) => a - b);
    const intervals = [];
    for (let i = 0; i + 1 < intersections.length; i += 2) {
        intervals.push([intersections[i], intersections[i + 1]]);
    }
    return intervals;
}

function polygonYIntervalsAtX(polygon, x) {
    const intersections = [];
    const points = polygon.points || [];
    for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        if ((a.x > x) === (b.x > x)) {
            continue;
        }
        const t = (x - a.x) / (b.x - a.x);
        intersections.push(a.y + (b.y - a.y) * t);
    }
    intersections.sort((a, b) => a - b);
    const intervals = [];
    for (let i = 0; i + 1 < intersections.length; i += 2) {
        intervals.push([intersections[i], intersections[i + 1]]);
    }
    return intervals;
}

function landPlayerOn(state, y, wasOnGround, id, kind = "blockable") {
    const p = state.player;
    p.ordinaryJumpActive = false;
    const impactVy = Math.max(0, p.vy || 0);
    p.y = y;
    p.vy = 0;
    p.onGround = true;
    p.supportId = id || null;
    p.airBoostArmed = false;
    state.collisions.playerTouching.down = true;
    if (state.equipment.rocket.attachedBoosting) {
        stopAttachedBoost(state, "landed");
    }
    state.collisions.lastResolution = { axis: "y", id, kind };
    if (!wasOnGround) {
        const fallDamage = applyFallDamageOnLanding(state, impactVy, id, kind);
        p.vx = approach(p.vx, 0, state.tuning.landingFriction * state.clock.fixedDt);
        addEvent(state, "PLAYER_LANDED", {
            solidId: id,
            kind,
            x: round(p.x),
            y: round(p.y),
            vx: round(p.vx),
            impactVy: round(impactVy),
            fallDamage: round(fallDamage)
        });
    }
}

function applyFallDamageOnLanding(state, impactVy, id, kind) {
    const t = state.tuning;
    if (t.fallDamageEnabled === false || impactVy <= 0) {
        return 0;
    }

    const safeImpactSpeed = Math.max(0, t.fallDamageSafeImpactSpeed ?? 0);
    const gravity = Math.max(1, t.gravity ?? DEFAULT_TUNING.gravity);
    const wizardHeight = Math.max(1, t.wizardHeight ?? t.playerHeight ?? DEFAULT_TUNING.wizardHeight);
    const damagePerWizardHeight = Math.max(0, t.fallDamagePerWizardHeight ?? 10);
    const excessImpactEnergy = Math.max(0, impactVy * impactVy - safeImpactSpeed * safeImpactSpeed);
    const excessWizardHeights = excessImpactEnergy / (2 * gravity * wizardHeight);
    const damage = excessWizardHeights * damagePerWizardHeight;

    if (damage <= 0.0001) {
        return 0;
    }

    const result = damagePlayer(state, damage, "fallDamage", { bypassInvulnerability: true });
    addEvent(state, "PLAYER_FALL_DAMAGE", {
        amount: round(result.damage),
        impactVy: round(impactVy),
        safeImpactSpeed: round(safeImpactSpeed),
        excessWizardHeights: round(excessWizardHeights),
        solidId: id,
        kind
    });
    return result.damage;
}

function isSolidSegmentKind(kind) {
    return kind === "walkable" || kind === "blockable" || kind === "damaging" || kind === "killable";
}

function isAreaBlockingSegmentKind(kind) {
    return kind === "blockable" || kind === "damaging" || kind === "killable";
}

function segmentYAtX(segment, x) {
    const minX = Math.min(segment.x1, segment.x2) - 0.001;
    const maxX = Math.max(segment.x1, segment.x2) + 0.001;
    if (x < minX || x > maxX) {
        return null;
    }
    const dx = segment.x2 - segment.x1;
    if (Math.abs(dx) < 0.001) {
        return null;
    }
    const t = (x - segment.x1) / dx;
    if (t < -0.001 || t > 1.001) {
        return null;
    }
    return segment.y1 + (segment.y2 - segment.y1) * t;
}

function segmentXAtY(segment, y) {
    const minY = Math.min(segment.y1, segment.y2) - 0.001;
    const maxY = Math.max(segment.y1, segment.y2) + 0.001;
    if (y < minY || y > maxY) {
        return null;
    }
    const dy = segment.y2 - segment.y1;
    if (Math.abs(dy) < 0.001) {
        return null;
    }
    const t = (y - segment.y1) / dy;
    if (t < -0.001 || t > 1.001) {
        return null;
    }
    return segment.x1 + (segment.x2 - segment.x1) * t;
}

function expandedRect(rect, amount) {
    return {
        x: rect.x - amount,
        y: rect.y - amount,
        w: rect.w + amount * 2,
        h: rect.h + amount * 2
    };
}

function polygonTouchesRect(polygon, rect) {
    const touchRect = expandedRect(rect, 0.25);
    if (polygonOverlapsRect(polygon, touchRect)) {
        return true;
    }
    const points = polygon.points || [];
    for (let i = 0; i < points.length; i += 1) {
        if (segmentRectIntersection(points[i], points[(i + 1) % points.length], touchRect)) {
            return true;
        }
    }
    return false;
}

function findPlayerSurfaceHazard(state) {
    const rect = expandedRect(getPlayerRect(state), 0.25);
    for (const solid of queryWorldSolids(state.world, rect)) {
        if ((solid.kind === "damaging" || solid.kind === "killable") && rectsOverlap(rect, solid)) {
            return { id: solid.id || "solidHazard", kind: solid.kind };
        }
    }
    for (const segment of queryWorldSegments(state.world, rect)) {
        if (segment.kind !== "damaging" && segment.kind !== "killable") {
            continue;
        }
        if (segmentRectIntersection({ x: segment.x1, y: segment.y1 }, { x: segment.x2, y: segment.y2 }, rect)) {
            return { id: segment.id || "segmentHazard", kind: segment.kind };
        }
    }
    for (const polygon of queryWorldCollisionPolygons(state.world, rect)) {
        if ((polygon.kind === "damaging" || polygon.kind === "killable") && polygonTouchesRect(polygon, rect)) {
            return { id: polygon.id || "polygonHazard", kind: polygon.kind };
        }
    }
    return null;
}

function applyPlayerSurfaceHazards(state) {
    const hazard = findPlayerSurfaceHazard(state);
    if (!hazard) {
        return false;
    }
    const lethal = hazard.kind === "killable";
    const result = damagePlayer(
        state,
        lethal ? state.health.max : state.tuning.hazardContactDamage,
        hazard.id,
        {
            bypassInvulnerability: lethal,
            bypassDifficulty: lethal,
            knockbackY: lethal ? 0 : -180
        }
    );
    if (result.damage > 0) {
        addEvent(state, "PLAYER_HAZARD_CONTACT", {
            hazardId: hazard.id,
            kind: hazard.kind,
            damage: round(result.damage),
            health: round(state.health.amount)
        });
    }
    return result.damage > 0;
}

function updateFuelRecharge(state, dt) {
    const fuel = state.fuel;
    const t = state.tuning;
    const rocket = state.equipment.rocket;
    const overdriveActive = Boolean(activePowerUpEffect(state, POWER_UP_EFFECT_IDS.OVERDRIVE));
    const overdriveRecoveryRate = overdriveActive
        ? Math.max(0, Number(t.attachedBoostDrainRate) || 0) * OVERDRIVE_PASSIVE_FUEL_RECOVERY_DRAIN_FACTOR
        : 0;

    fuel.amount = clamp(fuel.amount, 0, fuel.max);

    updateBoostKickGroundRecharge(state, dt);

    let normalRecoveryRate = 0;
    if (!rocket.attachedBoosting) {
        if (fuel.rechargeDelayTimer > 0) {
            fuel.rechargeDelayTimer = Math.max(0, fuel.rechargeDelayTimer - dt);
        } else if (t.fuelRechargeRequiresGround !== false && !fuel.rechargeLatched) {
            if (state.player.onGround) {
                fuel.rechargeLatched = true;
                addEvent(state, "FUEL_RECHARGE_STARTED", { grounded: true });
                normalRecoveryRate = Math.max(0, Number(t.rechargeRate) || 0);
            }
        } else {
            normalRecoveryRate = Math.max(0, Number(t.rechargeRate) || 0);
        }
    }

    const recoveryRate = Math.max(overdriveRecoveryRate, normalRecoveryRate);
    const cap = overdriveActive
        ? fuel.max
        : clamp(fuel.rechargeCap, 0, fuel.max);
    if (fuel.amount < cap) {
        const previous = fuel.amount;
        fuel.amount = Math.min(cap, fuel.amount + recoveryRate * dt);
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
    health.invulnerabilityTimer = Math.max(0, (Number(health.invulnerabilityTimer) || 0) - dt);
    health.low = health.amount <= t.lowHealthThreshold;

    const rawLastDamagedAt = health.lastDamagedAt;
    const lastDamagedAt = rawLastDamagedAt !== null && rawLastDamagedAt !== undefined && Number.isFinite(Number(rawLastDamagedAt))
        ? Number(rawLastDamagedAt)
        : null;
    const delayElapsed = lastDamagedAt === null || state.clock.time - lastDamagedAt >= t.healthRegenDelay;
    const shouldRegenerate = delayElapsed && health.amount > 0 && health.amount < health.max && t.healthRegenRate > 0;
    if (shouldRegenerate) {
        const wasRegenerating = health.regenerating === true;
        health.regenerating = true;
        const before = health.amount;
        health.amount = Math.min(health.max, health.amount + t.healthRegenRate * dt);
        if (!wasRegenerating) {
            addEvent(state, "PLAYER_HEALTH_REGEN_STARTED", { health: round(before) });
        }
        if (health.amount >= health.max) {
            health.regenerating = false;
            addEvent(state, "PLAYER_HEALTH_REGEN_COMPLETED", { health: round(health.amount) });
        }
    } else if (health.regenerating) {
        health.regenerating = false;
        addEvent(state, "PLAYER_HEALTH_REGEN_STOPPED", { health: round(health.amount) });
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
    const upwardLead = clamp(Math.min(0, p.vy) * 0.12, -120, 0);
    const descendingLead = p.onGround
        ? 0
        : clamp((Math.max(0, p.vy) - 35) * 0.42, 0, 260);
    const targetX = p.x + lookAhead;
    const targetY = p.y - 170 + upwardLead + descendingLead;
    const blendRate = descendingLead > 0 ? 0.00008 : 0.001;
    const blend = 1 - Math.pow(blendRate, dt);
    state.camera.x += (targetX - state.camera.x) * blend;
    state.camera.y += (targetY - state.camera.y) * blend;
}

export function damagePlayer(state, amount = 34, sourceId = "debug", options = {}) {
    const health = state.health;
    const baseDamage = Math.max(0, Number(amount) || 0);
    const damageScale = options.bypassDifficulty === true ? 1 : difficultyDamageScale(state.settings);
    const requestedDamage = baseDamage * damageScale;
    const before = clamp(Number(health.amount) || 0, 0, health.max);
    const shielded = options.bypassInvulnerability !== true && Boolean(
        activePowerUpEffect(state, POWER_UP_EFFECT_IDS.SHIELD)
    );
    const damageInvulnerable = options.bypassInvulnerability !== true && (Number(health.invulnerabilityTimer) || 0) > 0;
    const blocked = shielded || damageInvulnerable;
    if (requestedDamage <= 0 || before <= 0 || blocked) {
        return {
            damage: 0,
            health: before,
            defeated: before <= 0,
            blocked,
            blockedBy: shielded ? "shield" : (damageInvulnerable ? "damageInvulnerability" : null)
        };
    }

    const damage = Math.min(before, requestedDamage);
    health.amount = Math.max(0, before - requestedDamage);
    health.lastDamagedAt = state.clock.time;
    if (health.regenerating) {
        addEvent(state, "PLAYER_HEALTH_REGEN_STOPPED", {
            health: round(health.amount),
            reason: "damaged"
        });
    }
    health.regenerating = false;
    health.invulnerabilityTimer = Math.max(
        0,
        Number(options.invulnerabilitySeconds ?? state.tuning.playerDamageInvulnerabilitySeconds) || 0
    );

    if (Number.isFinite(Number(options.knockbackX))) {
        state.player.vx = Number(options.knockbackX);
    }
    if (Number.isFinite(Number(options.knockbackY))) {
        state.player.vy = Number(options.knockbackY);
        state.player.onGround = false;
    }

    const defeated = health.amount <= 0;
    addEvent(state, "PLAYER_DAMAGED", {
        amount: round(damage),
        baseAmount: round(baseDamage),
        difficultyScale: round(damageScale),
        sourceId,
        health: round(health.amount),
        defeated
    });
    if (defeated) {
        triggerPlayerDeath(state, {
            sourceId,
            resetReason: "healthDepleted",
            cause: options.cause || "healthDepleted"
        });
    }
    return {
        damage,
        health: health.amount,
        defeated,
        blocked: false
    };
}

export function resetPlayer(state, reason = "manualReset") {
    const p = state.player;
    stopAttachedBoost(state, "reset");
    clearDeathResetPowerUps(state);
    p.x = p.spawnX;
    p.y = p.spawnY;
    p.vx = 0;
    p.vy = 0;
    p.onGround = false;
    p.supportId = null;
    p.dropThroughTimer = 0;
    p.wasOnGround = false;
    p.airBoostArmed = false;
    p.ordinaryJumpActive = false;
    p.ordinaryJumpStartY = null;
    p.ordinaryJumpApexY = null;
    p.facing = 1;
    p.visible = true;
    p.renderScale = 1;
    p.crushCandidateTicks = 0;
    p.crushCandidateKey = null;
    p.crushCandidateDetail = null;
    p.combatState = "alive";
    p.targetable = true;
    p.deathPhase = "none";
    p.deathPhaseTimer = 0;
    p.deathElapsed = 0;
    p.deathSourceId = null;
    p.deathResetReason = null;
    state.fuel.amount = state.tuning.initialFuel;
    state.fuel.rechargeDelayTimer = 0;
    state.fuel.rechargeLatched = false;
    state.equipment.rocket.boostKickCharge = state.tuning.attachedBoostKickChargeMax ?? 1;
    state.equipment.rocket.boostBurstTimer = 0;
    state.equipment.rocket.boostAccelerationNow = 0;
    state.equipment.rocket.boostVisualPowerNow = 0;
    state.equipment.rocket.attachedSmokeTimer = 0;
    state.projectiles.length = 0;
    if (state.effects?.smokePuffs) {
        state.effects.smokePuffs.length = 0;
    }
    state.health.amount = state.health.max;
    state.health.lastDamagedAt = null;
    state.health.invulnerabilityTimer = 0;
    state.health.regenerating = false;
    state.health.low = false;
    addEvent(state, "PLAYER_RESET", { reason });
}

function round(value) {
    return Number(value.toFixed(3));
}
