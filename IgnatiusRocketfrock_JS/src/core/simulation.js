import { atlasNodeToPlacementWorld, normalizeRotationRadians } from "../shared/level-transform.js";
import { characterEnemyMeleeAttackRect, enemyProjectileHitbox } from "../shared/actor-geometry.js";
import { normalizeLevelColorMap } from "../presentation/level-color-map.js";
import {
    buildEnemyNavigationEdges,
    ENEMY_DROP_SOURCE_CLEARANCE_HEIGHT_FACTOR,
    buildEnemyNavigationSupports,
    enemyNavigationEdgeMapFromFlat,
    enemyNavigationSupportsSignature,
    findBakedEnemyNavigationGraph,
    findEnemyNavigationSupport,
    navigationSupportById,
    planEnemyNavigationRoute,
    supportPoint
} from "./enemy-navigation.js";

export const FIXED_DT = 1 / 60;

const WIZARD_DOOR_FLOOR_ANCHOR_Y_FACTOR = 239 / 263;
const DEFAULT_WIZARD_DOOR_INSIDE_SCALE = 0.84;
const ENEMY_COMBAT_STATE = Object.freeze({
    ALIVE: "alive",
    HURT: "hurt",
    ATTACKING: "attacking",
    DEAD: "dead"
});

export const DEFAULT_TUNING = Object.freeze({
    timestep: FIXED_DT,
    wizardHeight: 104,
    playerWidth: 34,
    playerHeight: 104,
    gravity: 1490,
    terminalVelocity: 2500,
    fallDamageEnabled: true,
    fallDamageSafeImpactSpeed: 1441,
    fallDamagePerWizardHeight: 10,
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
    rocketProjectileDamage: 55,
    enemyHitFlashSeconds: 0.16,
    enemyHealthBarSeconds: 1.4,
    enemyDefaultHurtSeconds: 0.48,
    enemyDefaultDeathSeconds: 1.18,
    enemyCorpseHoldSeconds: 2,
    enemyCorpseFadeSeconds: 3,
    enemyDefaultChaseSpeed: 150,
    enemyDefaultJumpHeight: 118,
    enemyDefaultJumpGravity: 1250,
    enemyDefaultMaxFallDistance: 280,
    enemyDefaultGlareSeconds: 5,
    enemyDefaultRepathSeconds: 0.3,
    enemyDefaultHomeRetrySeconds: 4,
    enemyDefaultAwarenessRange: 300,
    enemyDefaultAwarenessVerticalRange: 190,
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
    hazardContactDamage: 20,
    rocketImpactSmokePuffs: 24,
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
        aimVector: input.aimVector,
        aimTarget: input.aimTarget
    });
}

export function createInitialGameState(overrides = {}) {
    const tuning = deepClone(DEFAULT_TUNING);
    if (overrides.tuning) {
        Object.assign(tuning, overrides.tuning);
    }

    const world = createTestArena(tuning);
    const spawn = overrides.spawn || world.start || { x: 120, y: 600 };

    const state = {
        meta: {
            schemaVersion: 1,
            build: "100-reactive-breakable-crate",
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
            lowHealthPulse: 0,
            visible: true,
            renderScale: 1
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
        reactiveObjects: [],
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
            { id: "fuel_001", kind: "fuel", x: 835, y: 315, radius: 14, amount: 40, collected: false },
            { id: "fuel_002", kind: "fuel", x: 3070, y: 115, radius: 14, amount: 40, collected: false }
        ],
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
        if (visual.kind !== "atlasSprite" || visual.collisionFromManifest === false) {
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
    state.world.solids = (state.world.solids || []).filter((solid) => solid.kind === "wall" || solid.reactiveObjectId);
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

    for (const segment of state.world.segments || []) {
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
    return Boolean(entity) && (
        entity.type === "wizard_entry_door" ||
        entity.kind === "wizard_entry_door" ||
        ((entity.type === "magicPortal" || entity.kind === "magicPortal") &&
            (entity.portalRole === "entrance" || entity.introRole === "entrance" || entity.startSequence === true))
    );
}

function isWizardExitDoor(entity) {
    return Boolean(entity) && (
        entity.type === "wizard_exit_door" ||
        entity.kind === "wizard_exit_door" ||
        ((entity.type === "magicPortal" || entity.kind === "magicPortal") && entity.portalRole === "exit")
    );
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
    for (const segment of state.world.segments || []) {
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
    return (entities || []).filter((entity) =>
        (entity.type === "mailbox" || entity.kind === "mailbox") &&
        (entity.interaction === "editorLetter" || entity.mailboxRole === "editorLetter")
    );
}

function normalizeMailboxThoughtText(mailbox) {
    const directThought = String(mailbox?.thoughtText || "").trim();
    if (directThought) return directThought;
    if (Array.isArray(mailbox?.thoughts)) {
        const legacyThoughts = mailbox.thoughts.map((entry) => String(entry || "").trim()).filter(Boolean);
        if (legacyThoughts.length) return legacyThoughts.join(" ");
    }
    return "How kind of him! I hope I can make him proud. This cave doesn’t look quite like it did in the brochures, but I’m sure it will be fine.";
}

function mailboxStoryRecord(state, mailbox) {
    const initialState = mailbox.state || "letterAvailable";
    return {
        active: false,
        completed: initialState === "empty",
        mailboxId: mailbox.id,
        phase: initialState === "empty" ? "complete" : "armed",
        phaseTime: 0,
        triggerDistance: Math.max(8, Number(mailbox.triggerDistance) || 72),
        verticalTolerance: Math.max(24, Number(mailbox.verticalTolerance) || Math.max(state.player.height * 0.75, Number(mailbox.h) || 80)),
        letterDuration: Math.max(0.25, Number(mailbox.letterDuration) || 14),
        thoughtDuration: Math.max(0.25, Number(mailbox.thoughtDuration) || 9),
        letterAtlasId: mailbox.letterAtlasId || "it_atlas_001",
        letterAssetId: mailbox.letterAssetId || "letter_scroll",
        thoughtAtlasId: mailbox.thoughtAtlasId || "it_atlas_001",
        thoughtAssetId: mailbox.thoughtAssetId || "thought_bubble_large",
        letterTitle: mailbox.letterTitle || "A Letter from Your Humble Editor",
        letterText: mailbox.letterText || "Dear Ignatius,\n\nPlease proceed boldly!\n\nSincerely,\nYour humble editor,\nWilfred of Bittervine",
        thoughtText: normalizeMailboxThoughtText(mailbox),
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
    story.phase = "letter";
    story.phaseTime = 0;
    story.startedAt = state.clock.time;
    state.story.mailboxEvent = story;
    setWorldEntityState(state, story.mailboxId, "empty");
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.ax = 0;
    state.player.ay = 0;
    addEvent(state, "MAILBOX_LETTER_OPENED", { mailboxId: story.mailboxId });
}

function advanceMailboxStory(state, story, phase, reason) {
    story.phase = phase;
    story.phaseTime = 0;
    if (phase === "thought") {
        addEvent(state, "MAILBOX_THOUGHT_SHOWN", { mailboxId: story.mailboxId, reason });
    } else if (phase === "complete") {
        story.active = false;
        story.completed = true;
        story.completedAt = state.clock.time;
        state.player.vx = 0;
        state.player.vy = 0;
        state.story.mailboxEvent = null;
        addEvent(state, "MAILBOX_EVENT_COMPLETE", { mailboxId: story.mailboxId, reason });
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

    const skipped = !startedThisFrame && Boolean(input.jumpPressed);
    if (story.phase === "letter" && (skipped || story.phaseTime >= story.letterDuration)) {
        if (story.thoughtText.trim()) advanceMailboxStory(state, story, "thought", skipped ? "jump" : "timeout");
        else advanceMailboxStory(state, story, "complete", skipped ? "jump" : "timeout");
    } else if (story.phase === "thought" && (skipped || story.phaseTime >= story.thoughtDuration)) {
        advanceMailboxStory(state, story, "complete", skipped ? "jump" : "timeout");
    }

    const focusX = (p.x + (Number(mailbox.x) || p.x)) * 0.5;
    state.camera.x += (focusX - state.camera.x) * Math.min(1, dt * 5);
    state.camera.y += (p.y - 170 - state.camera.y) * Math.min(1, dt * 5);
    return true;
}

export function applyEditorLevelToWorld(state, editorLevel) {
    if (!state?.world || !editorLevel || typeof editorLevel !== "object") {
        return false;
    }

    const source = editorLevel.level || editorLevel;
    const placements = Array.isArray(source.placements) ? source.placements : [];
    const entities = Array.isArray(source.entities) ? source.entities : [];
    const entryDoorSource = wizardEntryDoorEntity(entities);
    const legacyPlayerStart = source.playerStart || source.wizardStart || source.start || null;
    const playerStart = entryDoorSource
        ? {
            x: Number(entryDoorSource.x) + doorWalkDirection(entryDoorSource, 1) * Math.max(48, Number(entryDoorSource.emergeDistance) || Math.max(120, Number(entryDoorSource.w) || 150)),
            y: Number(entryDoorSource.y) || 360
        }
        : legacyPlayerStart;

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
            layer: placement.layer || "terrain",
            collisionFromManifest: placement.collisionFromManifest !== false,
            order: Number.isFinite(Number(placement.order)) ? Number(placement.order) : visuals.length
        });
    }
    const runtimeEntities = deepClone(entities);
    for (const entity of runtimeEntities) {
        editorEntityVisuals(entity).forEach((visual, index) => {
            if (visual?.assetId) visuals.push(editorEntityVisualToWorld(entity, visual, index, entity.state || ""));
        });
    }

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
        visuals,
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
    const characterEnemies = runtimeEntities.filter(characterEnemyLike).map((entity, index) => {
        const x = Number(entity.x) || 0;
        const y = Number(entity.y) || 0;
        const width = Math.max(1, Number(entity.w) || Number(entity.width) || 72);
        const height = Math.max(1, Number(entity.h) || Number(entity.height) || 150);
        const anchor = entity.targetAnchor && typeof entity.targetAnchor === "object" ? entity.targetAnchor : null;
        const anchorX = clamp(Number(anchor?.x ?? 0.5), 0, 1);
        const anchorY = clamp(Number(anchor?.y ?? 0.42), 0, 1);
        const facing = Number(entity.facing) < 0 ? -1 : 1;
        const behavior = String(entity.behavior || "guard") === "patrol" ? "patrol" : "guard";
        const requestedStrategy = String(entity.strategy || "").trim().toLowerCase();
        const strategy = requestedStrategy === "hunter"
            ? "hunter"
            : requestedStrategy === "sentry"
                ? "sentry"
                : requestedStrategy === "simple_patrol"
                    ? "simple_patrol"
                    : (behavior === "patrol" ? "simple_patrol" : "sentry");
        const patrolDistance = Math.max(0, finiteNumberOr(entity.patrolDistance, 0));
        const idleDuration = Math.max(0, finiteNumberOr(entity.idleDuration, 1.1));
        const health = Math.max(0, finiteNumberOr(entity.health, 100));
        return {
            id: entity.id || `characterEnemy_${index + 1}`,
            kind: "characterEnemy",
            characterId: String(entity.characterId || entity.characterProject || "ct_char_enemy_001"),
            x,
            y,
            spawnX: x,
            spawnY: y,
            width,
            height,
            health,
            maxHealth: health,
            combatState: health > 0 ? "alive" : "dead",
            state: health > 0 ? "idle" : "death",
            animationSlot: health > 0 ? "idle" : "death",
            animationTime: Number.isFinite(Number(entity.animationTime)) ? Number(entity.animationTime) : 0,
            animationTimeOffset: Number(entity.animationTimeOffset) || 0,
            facing,
            behavior,
            strategy,
            aiState: health <= 0 ? "dead" : (strategy === "hunter" ? "patrol" : strategy),
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
            route: [],
            routeIndex: 0,
            routeTargetSupportId: null,
            routeTargetX: null,
            routeRepathTimer: 0,
            navigationFailureCount: 0,
            airborne: false,
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
            chaseSpeed: Math.max(0, finiteNumberOr(entity.runSpeed, finiteNumberOr(entity.chaseSpeed, state.tuning.enemyDefaultChaseSpeed))),
            runSpeed: Math.max(0, finiteNumberOr(entity.runSpeed, finiteNumberOr(entity.chaseSpeed, state.tuning.enemyDefaultChaseSpeed))),
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
            awarenessVerticalRange: Math.max(0, finiteNumberOr(entity.awarenessVerticalRange, state.tuning.enemyDefaultAwarenessVerticalRange)),
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
            movementPhase: health <= 0 ? "dead" : (behavior === "patrol" && patrolDistance > 0 ? "idle" : "guard"),
            phaseTimer: behavior === "patrol" && patrolDistance > 0 ? idleDuration : 0,
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
            projectileRadius: Math.max(1, finiteNumberOr(entity.projectileRadius, state.tuning.enemyDefaultProjectileRadius)),
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
            deathElapsed: 0,
            corpseHoldDuration: Math.max(0, finiteNumberOr(entity.corpseHoldDuration, state.tuning.enemyCorpseHoldSeconds)),
            corpseFadeDuration: Math.max(0, finiteNumberOr(entity.corpseFadeDuration, state.tuning.enemyCorpseFadeSeconds)),
            renderOpacity: 1,
            hitFlashTimer: 0,
            hitFlashDuration: state.tuning.enemyHitFlashSeconds,
            healthBarTimer: 0,
            lastDamagedAt: null,
            lastHitBy: null,
            renderScale: Math.max(0.05, Number(entity.renderScale) || 1),
            visualized: false,
            targetAnchorX: anchorX,
            targetAnchorY: anchorY,
            targetX: x - width * 0.5 + anchorX * width,
            targetY: y - height + anchorY * height,
            targetRadius: Math.max(4, Number(entity.targetRadius) || Math.min(width, height) * 0.16),
            showTargetMarker: entity.showTargetMarker === true
        };
    });
    state.enemies = [...targetDummies, ...characterEnemies];

    const fuelLike = (entity) => entity.type === "fuel" || entity.kind === "fuel" || entity.type === "fuelPickup" || entity.kind === "fuelPickup";
    state.pickups = runtimeEntities.filter(fuelLike).map((entity, index) => ({
        id: entity.id || `fuel_${index + 1}`,
        kind: "fuel",
        x: Number(entity.x) || 0,
        y: Number(entity.y) || 0,
        radius: Number(entity.radius) || 14,
        amount: Number(entity.amount) || 40,
        collected: false,
        visualized: editorEntityVisuals(entity).length > 0
    }));

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

export function applyCharacterCombatProfiles(state, profiles) {
    const profileMap = profiles instanceof Map
        ? profiles
        : new Map(Object.entries(profiles && typeof profiles === "object" ? profiles : {}));
    let applied = 0;

    for (const enemy of state.enemies || []) {
        if (!isCharacterEnemyState(enemy)) {
            continue;
        }
        const profile = profileMap.get(enemy.characterId);
        if (!profile || typeof profile !== "object") {
            continue;
        }
        const projectiles = Array.isArray(profile.projectiles) ? profile.projectiles : [];
        const projectile = projectiles.find((item) => String(item?.animationSlot || "attack") === "attack") || projectiles[0];
        if (!projectile) {
            continue;
        }
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
        applied += 1;
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
        if (!isCharacterEnemyState(enemy)) {
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

function findCharacterEnemyGroundSupport(state, x, referenceY, maxStepUp, maxDrop, width = 1) {
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
        const score = sampleIndex * 100000 + Math.abs(delta);
        if (!best || score < best.score) {
            best = { y, delta, id, kind, slope: finiteNumberOr(slope, 0), score };
        }
    };

    for (const segment of state.world?.segments || []) {
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

    for (const solid of state.world?.solids || []) {
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

    for (const solid of state.world?.solids || []) {
        if (options.ignoreObstacleId && solid.id === options.ignoreObstacleId) {
            continue;
        }
        if (rectsOverlap(rect, solid)) {
            return true;
        }
    }
    for (const polygon of state.world?.collisionPolygons || []) {
        if (options.ignoreObstacleId && polygon.id === options.ignoreObstacleId) {
            continue;
        }
        if (isAreaBlockingSegmentKind(polygon.kind) && polygonOverlapsRect(polygon, rect)) {
            return true;
        }
    }
    for (const segment of state.world?.segments || []) {
        if (options.ignoreSupportId && (segment.id === options.ignoreSupportId || options.ignoreSupportId.startsWith(`${segment.id}_nav_`))) {
            continue;
        }
        if (!isSolidSegmentKind(segment.kind)) {
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

    for (const solid of state.world?.solids || []) {
        if (segmentRectIntersection(start, end, solid)) {
            return true;
        }
    }
    for (const segment of state.world?.segments || []) {
        if (!isAreaBlockingSegmentKind(segment.kind) && segment.kind !== "walkable") {
            continue;
        }
        if (segmentSegmentIntersection(start, end, { x: segment.x1, y: segment.y1 }, { x: segment.x2, y: segment.y2 })) {
            return true;
        }
    }
    for (const polygon of state.world?.collisionPolygons || []) {
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
    if (!player || player.visible === false) {
        return false;
    }
    // Health reaching zero is not yet a complete player-death lifecycle. Until a
    // dedicated defeated state hides or disables Ignatius, enemies and projectiles
    // must continue treating the visible player as a live combat target.
    return player.combatState !== "dead" && player.targetable !== false;
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
    const origin = enemyProjectileSpawnPoint(enemy);
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

    if (launchType === "ballistic") {
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
        kind: projectileKind === "musketBall" || launchType === "ballistic" ? "enemyMusketBall" : "enemyFireball",
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
    const forwardDot = dx * facing / distance;

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

function moveCharacterEnemyToward(state, enemy, targetX, speed, dt, stopDistance = 0) {
    const dx = targetX - enemy.x;
    const distance = Math.abs(dx);
    const remainingDistance = Math.max(0, distance - Math.max(0, stopDistance));
    if (remainingDistance <= 0.0001 || speed <= 0 || dt <= 0) {
        return 0;
    }

    const direction = dx < 0 ? -1 : 1;
    let candidateX = enemy.x + direction * Math.min(remainingDistance, speed * dt);
    if (enemy.strategy === "simple_patrol" && enemy.behavior === "patrol" && enemy.patrolDistance > 0) {
        candidateX = clamp(candidateX, enemy.patrolMinX, enemy.patrolMaxX);
    }
    if (Math.abs(candidateX - enemy.x) <= 0.0001) {
        return 0;
    }

    const support = findCharacterEnemyGroundSupport(
        state,
        candidateX,
        enemy.y,
        enemy.maxStepHeight,
        enemy.maxDropDistance,
        enemy.width
    );
    if (!support || characterEnemyBodyBlockedAt(state, enemy, candidateX, support.y, { groundSlope: support.slope })) {
        return 0;
    }

    const moved = Math.abs(candidateX - enemy.x);
    enemy.facing = direction;
    enemy.x = candidateX;
    enemy.y = support.y;
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

    for (const solid of state.world?.solids || []) {
        if (segmentRectIntersection(start, end, solid)) {
            return true;
        }
    }
    for (const segment of state.world?.segments || []) {
        if (!isAreaBlockingSegmentKind(segment.kind) && segment.kind !== "walkable") {
            continue;
        }
        if (segmentSegmentIntersection(start, end, { x: segment.x1, y: segment.y1 }, { x: segment.x2, y: segment.y2 })) {
            return true;
        }
    }
    for (const polygon of state.world?.collisionPolygons || []) {
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
        runSpeed: Math.max(1, Number(enemy.runSpeed) || Number(enemy.chaseSpeed) || 1),
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

function characterEnemyNavigationContext(state, enemy) {
    const options = characterEnemyNavigationOptions(enemy, state);
    const liveSupports = buildEnemyNavigationSupports(state.world, options);
    const candidateGraph = findBakedEnemyNavigationGraph(state.world?.navigationGraphs, options);
    const bakedGraph = candidateGraph?.supportSignature === enemyNavigationSupportsSignature(liveSupports)
        ? candidateGraph
        : null;
    const supports = bakedGraph?.supports?.length ? bakedGraph.supports : liveSupports;
    const rawEdgeMap = bakedGraph?.edges?.length
        ? enemyNavigationEdgeMapFromFlat(bakedGraph.edges, supports)
        : buildEnemyNavigationEdges(supports, { ...options, world: state.world });
    const edgeMap = new Map();
    for (const support of supports) {
        edgeMap.set(support.id, (rawEdgeMap.get(support.id) || [])
            .map((edge) => characterEnemyNavigationAdjustedEdge(state, edge, bakedGraph))
            .filter(Boolean));
    }
    const current = findEnemyNavigationSupport(supports, enemy.x, enemy.y, {
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
    return findEnemyNavigationSupport(supports, state.player.x, state.player.y, {
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
            // A straight gravity drop through a one-way walkable support has no
            // horizontal edge to clear. Ignore only that source support until
            // the body has fallen decisively below it, then ordinary collision
            // resumes for the destination and all other geometry.
            return y <= sourcePoint.y + departureDrop + 0.5 && enemy.airTimer <= 1;
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
    const speed = Math.max(0, Number(enemy.runSpeed) || Number(enemy.chaseSpeed) || 0);
    if (edge) {
        if (edge.from !== current.id) {
            enemy.routeTraversalPhase = null;
            enemy.routeTraversalEdgeIndex = -1;
            enemy.groundVelocityX = 0;
            return false;
        }
        if (edge.type === "jump" && Number.isFinite(Number(edge.runUpX)) && Math.abs(Number(edge.vx) || 0) > 0.001) {
            return followCharacterEnemyJumpRunUp(state, enemy, edge, speed, dt);
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
            const landingSupport = navigationSupportById(navigation.supports, edge.to);
            if (characterEnemyBodyBlockedAt(state, enemy, edge.landingX, edge.landingY, {
                groundSlope: characterEnemySupportSlope(landingSupport)
            })) {
                return false;
            }
            enemy.x = edge.landingX;
            enemy.y = edge.landingY;
            enemy.currentSupportId = edge.to;
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
    const support = findCharacterEnemyGroundSupport(
        state,
        candidateX,
        enemy.y,
        enemy.maxStepHeight,
        enemy.maxDropDistance,
        enemy.width
    );
    if (!support || characterEnemyBodyBlockedAt(state, enemy, candidateX, support.y, { groundSlope: support.slope })) {
        pauseAndTurnCharacterEnemy(enemy);
        return;
    }
    enemy.x = candidateX;
    enemy.y = support.y;
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
                enterCharacterEnemyGlare(state, enemy);
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
            setCharacterEnemyNavigationPlan(enemy, plan);
        }
        if (!followCharacterEnemyNavigationPlan(state, enemy, navigation, dt)) {
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
        if (enemy.health <= 0 || enemy.combatState === ENEMY_COMBAT_STATE.DEAD) {
            enemy.health = 0;
            enemy.combatState = ENEMY_COMBAT_STATE.DEAD;
            enemy.movementPhase = "dead";
            enemy.attackTimer = 0;
            enemy.attackLungeRemaining = 0;
            enemy.attackHitApplied = false;
            enemy.deathTimer = Math.max(0, (Number(enemy.deathTimer) || 0) - dt);
            updateDeadEnemyPresentation(state, enemy, dt);
            setCharacterEnemyAnimation(enemy, "death");
            syncCharacterEnemyTarget(state, enemy);
            continue;
        }

        enemy.deathElapsed = 0;
        enemy.renderOpacity = 1;

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
                        Math.max(0, Number(enemy.chaseSpeed) || state.tuning.enemyDefaultChaseSpeed || 0),
                        dt,
                        Math.max(0, preferredRange)
                    );
                } else if (horizontalDistance < minRange && preferredRange > 0) {
                    const desiredX = state.player.x - enemy.facing * preferredRange;
                    moved = moveCharacterEnemyToward(
                        state,
                        enemy,
                        desiredX,
                        Math.max(0, Number(enemy.chaseSpeed) || state.tuning.enemyDefaultChaseSpeed || 0),
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
                Math.max(0, Number(enemy.chaseSpeed) || state.tuning.enemyDefaultChaseSpeed || 0),
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

        if (enemy.behavior !== "patrol" || enemy.patrolDistance <= 0 || enemy.walkSpeed <= 0) {
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
        const support = findCharacterEnemyGroundSupport(
            state,
            candidateX,
            enemy.y,
            enemy.maxStepHeight,
            enemy.maxDropDistance,
            enemy.width
        );
        if (!support || characterEnemyBodyBlockedAt(state, enemy, candidateX, support.y, { groundSlope: support.slope })) {
            pauseAndTurnCharacterEnemy(enemy);
            syncCharacterEnemyTarget(state, enemy);
            continue;
        }

        enemy.x = candidateX;
        enemy.y = support.y;
        if (reachedBoundary) {
            pauseAndTurnCharacterEnemy(enemy);
        }
        syncCharacterEnemyTarget(state, enemy);
    }
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

    if (updatePortalIntro(state, dt)) {
        return;
    }
    if (updateMailboxStory(state, input, dt)) {
        return;
    }
    if (updatePortalExit(state, dt)) {
        return;
    }

    updateCharacterEnemies(state, dt);

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
        p.vy = t.jumpVelocity;
        p.onGround = false;
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
        launchHomingRocket(state, input);
    }
    updateProjectiles(state, dt);
    updateWorldEffects(state, dt);

    p.vy += t.gravity * dt;
    p.vy = Math.min(p.vy, t.terminalVelocity);
    applyAttachedHoverGovernor(state, dt);

    moveAndCollideX(state, p.vx * dt);
    moveAndCollideY(state, p.vy * dt, wasOnGround);
    resolvePlayerPenetrations(state, wasOnGround);
    applyPlayerSurfaceHazards(state);

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
        damage: Math.max(0, t.rocketProjectileDamage ?? 55),
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

        if (projectile.kind === "homingRocket") {
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

        if (projectile.kind !== "homingRocket") {
            projectile.vy += (Number(projectile.gravity) || 0) * dt;
        }

        const previousX = projectile.x;
        const previousY = projectile.y;
        projectile.x += projectile.vx * dt;
        projectile.y += projectile.vy * dt;

        if (projectile.kind === "homingRocket") {
            recordProjectileTrail(state, projectile);
        } else if (projectile.kind === "enemyFireball") {
            recordEnemyFireballTrail(state, projectile);
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
        const reactiveImpact = findProjectileReactiveObjectImpact(state, projectile, previousX, previousY);
        const terrainImpact = findProjectileTerrainImpact(state, projectile, previousX, previousY);
        const impacts = [
            enemyImpact ? { ...enemyImpact, impactKind: "enemy", priority: 0 } : null,
            reactiveImpact ? { ...reactiveImpact, impactKind: "reactiveObject", priority: 1 } : null,
            terrainImpact ? { ...terrainImpact, impactKind: "terrain", priority: 2 } : null
        ].filter(Boolean).sort((a, b) => (a.t - b.t) || (a.priority - b.priority));
        const impact = impacts[0] || null;
        if (impact?.impactKind === "enemy") {
            projectile.x = impact.x;
            projectile.y = impact.y;
            const damageResult = applyProjectileDamageToEnemy(state, projectile, impact.enemy);
            explodeProjectile(state, projectile, impact.enemy.id, {
                impactKind: "enemy",
                enemyId: impact.enemy.id,
                damage: damageResult.damage,
                health: damageResult.health,
                defeated: damageResult.defeated
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

function recordEnemyFireballTrail(state, projectile) {
    if (!Array.isArray(projectile.trail)) {
        projectile.trail = [];
    }
    const previous = projectile.trail[projectile.trail.length - 1];
    const spacing = Math.max(4, (projectile.radius || 10) * 0.55);
    if (!previous || Math.hypot(projectile.x - previous.x, projectile.y - previous.y) >= spacing) {
        projectile.trail.push({ x: round(projectile.x), y: round(projectile.y), time: Number(state.clock.time.toFixed(4)) });
    }
    const cutoff = state.clock.time - 0.9;
    while (projectile.trail.length > 2 && projectile.trail[0].time < cutoff) {
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

function explodeProjectile(state, projectile, reason, detail = {}) {
    if (projectile.state === "exploding" || projectile.state === "spent") {
        return;
    }
    emitProjectileImpactSmoke(state, projectile);
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

    const defeated = enemy.health <= 0;
    if (defeated) {
        enemy.health = 0;
        enemy.combatState = "dead";
        enemy.state = isCharacterEnemyState(enemy) ? "death" : "destroyed";
        enemy.movementPhase = "dead";
        enemy.attackTimer = 0;
        enemy.attackHitApplied = false;
        enemy.hurtTimer = 0;
        enemy.deathTimer = Math.max(FIXED_DT, Number(enemy.deathDuration) || state.tuning.enemyDefaultDeathSeconds || 1.18);
        enemy.deathElapsed = 0;
        enemy.renderOpacity = 1;
        if (isCharacterEnemyState(enemy)) {
            setCharacterEnemyAnimation(enemy, "death");
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
        maxHealth: round(enemy.maxHealth)
    });
    return { damage, health: enemy.health, defeated };
}

function findProjectileTerrainImpact(state, projectile, previousX, previousY) {
    const start = { x: previousX, y: previousY };
    const end = { x: projectile.x, y: projectile.y };
    const radius = Math.max(0, projectile.radius || 0);
    let best = null;

    function record(hit) {
        if (!hit) return;
        if (!best || hit.t < best.t) {
            best = hit;
        }
    }

    for (const solid of state.world.solids || []) {
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

    for (const segment of state.world.segments || []) {
        if (!isSolidSegmentKind(segment.kind)) {
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

    for (const polygon of state.world.collisionPolygons || []) {
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

    for (const solid of state.world?.solids || []) {
        if (collisionIdIgnored(solid.id, options) || bottom <= solid.y + 0.05 || top >= solid.y + solid.h - 0.05) {
            continue;
        }
        consider(dx > 0 ? solid.x : solid.x + solid.w, {
            id: solid.id,
            kind: solid.kind || "solid",
            source: "solid"
        });
    }

    for (const segment of state.world?.segments || []) {
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

    for (const polygon of state.world?.collisionPolygons || []) {
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

    for (const solid of state.world?.solids || []) {
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

    for (const segment of state.world?.segments || []) {
        if (collisionIdIgnored(segment.id, options) || !isSolidSegmentKind(segment.kind) || Math.abs(segment.x2 - segment.x1) < 0.001) {
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

    for (const polygon of state.world?.collisionPolygons || []) {
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

function moveAndCollideX(state, dx) {
    const p = state.player;
    if (dx === 0) {
        return;
    }
    const previousX = p.x;
    const nextX = previousX + dx;
    const collision = findActorHorizontalSweepCollision(state, p, previousX, nextX);
    p.x = collision ? collision.x : nextX;
    if (!collision) {
        return;
    }
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

function moveAndCollideY(state, dy, wasOnGround) {
    const p = state.player;
    const previousY = p.y;
    const nextY = previousY + dy;
    p.onGround = false;
    const collision = findActorVerticalSweepCollision(state, p, previousY, nextY);
    p.y = collision ? collision.y : nextY;
    if (!collision) {
        return;
    }
    if (collision.ceiling) {
        p.vy = 0;
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
        const candidates = [];

        for (const solid of state.world.solids || []) {
            if (!rectsOverlap(rect, solid)) {
                continue;
            }
            candidates.push(...rectDepenetrationCandidates(rect, solid, {
                id: solid.id,
                kind: solid.kind || "solid",
                source: "solid"
            }));
        }

        for (const polygon of state.world.collisionPolygons || []) {
            if (!isAreaBlockingSegmentKind(polygon.kind) || !polygonOverlapsRect(polygon, rect)) {
                continue;
            }
            candidates.push(...polygonDepenetrationCandidates(rect, polygon));
        }

        if (!candidates.length) {
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

        const best = candidates[0];
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

function polygonDepenetrationCandidates(rect, polygon) {
    const bounds = polygonBounds(polygon);
    if (!bounds) {
        return [];
    }

    const detail = {
        id: polygon.id,
        kind: polygon.kind || "blockable",
        source: "polygon"
    };
    const separation = 0.02;
    const limits = {
        left: Math.max(0, rect.x + rect.w - bounds.minX) + 2,
        right: Math.max(0, bounds.maxX - rect.x) + 2,
        up: Math.max(0, rect.y + rect.h - bounds.minY) + 2,
        down: Math.max(0, bounds.maxY - rect.y) + 2
    };

    return [
        depenetrationCandidate("left", -findPolygonExitDistance(polygon, rect, -1, 0, limits.left) - separation, 0, detail),
        depenetrationCandidate("right", findPolygonExitDistance(polygon, rect, 1, 0, limits.right) + separation, 0, detail),
        depenetrationCandidate("up", 0, -findPolygonExitDistance(polygon, rect, 0, -1, limits.up) - separation, detail),
        depenetrationCandidate("down", 0, findPolygonExitDistance(polygon, rect, 0, 1, limits.down) + separation, detail)
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
    let best = null;

    for (const segment of state.world.segments) {
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
    let best = null;

    for (const segment of state.world.segments) {
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
    let best = null;

    for (const polygon of state.world.collisionPolygons) {
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
    let best = null;

    for (const polygon of state.world.collisionPolygons) {
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
    const impactVy = Math.max(0, p.vy || 0);
    p.y = y;
    p.vy = 0;
    p.onGround = true;
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
    for (const solid of state.world?.solids || []) {
        if ((solid.kind === "damaging" || solid.kind === "killable") && rectsOverlap(rect, solid)) {
            return { id: solid.id || "solidHazard", kind: solid.kind };
        }
    }
    for (const segment of state.world?.segments || []) {
        if (segment.kind !== "damaging" && segment.kind !== "killable") {
            continue;
        }
        if (segmentRectIntersection({ x: segment.x1, y: segment.y1 }, { x: segment.x2, y: segment.y2 }, rect)) {
            return { id: segment.id || "segmentHazard", kind: segment.kind };
        }
    }
    for (const polygon of state.world?.collisionPolygons || []) {
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
    const verticalLead = clamp(p.vy * 0.12, -120, 90);
    const targetX = p.x + lookAhead;
    const targetY = p.y - 170 + verticalLead;
    const blend = 1 - Math.pow(0.001, dt);
    state.camera.x += (targetX - state.camera.x) * blend;
    state.camera.y += (targetY - state.camera.y) * blend;
}

export function damagePlayer(state, amount = 34, sourceId = "debug", options = {}) {
    const health = state.health;
    const requestedDamage = Math.max(0, Number(amount) || 0);
    const before = clamp(Number(health.amount) || 0, 0, health.max);
    const blocked = options.bypassInvulnerability !== true && (Number(health.invulnerabilityTimer) || 0) > 0;
    if (requestedDamage <= 0 || before <= 0 || blocked) {
        return {
            damage: 0,
            health: before,
            defeated: before <= 0,
            blocked
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
        sourceId,
        health: round(health.amount),
        defeated
    });
    if (defeated) {
        addEvent(state, "PLAYER_DEFEATED", { sourceId });
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
    p.x = p.spawnX;
    p.y = p.spawnY;
    p.vx = 0;
    p.vy = 0;
    p.onGround = false;
    p.wasOnGround = false;
    p.airBoostArmed = false;
    p.facing = 1;
    p.visible = true;
    p.renderScale = 1;
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
    state.health.lastDamagedAt = null;
    state.health.invulnerabilityTimer = 0;
    state.health.regenerating = false;
    state.health.low = false;
    addEvent(state, "PLAYER_RESET", { reason });
}

function round(value) {
    return Number(value.toFixed(3));
}
