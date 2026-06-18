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

    const world = createTestArena(tuning);
    const spawn = overrides.spawn || world.start || { x: 120, y: 600 };

    const state = {
        meta: {
            schemaVersion: 1,
            build: "035-test-arena-cleanup",
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
            levelTitle: "Ignatius Rocketfrock and the Gallery of Sensibly Spaced Ledges"
        },
        debug: {
            paused: false,
            showHitboxes: false,
            showVelocity: false,
            showCollision: false,
            showAssetGuides: false,
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
    state.world.solids = (state.world.solids || []).filter((solid) => solid.kind === "wall");
    state.world.collisionMode = polygons.length ? "atlasSegmentsAndAreas" : "atlasSegments";
    state.world.collisionSegmentCount = segments.length;
    state.world.collisionPolygonCount = polygons.length;
    addEvent(state, "ATLAS_COLLISION_APPLIED", { segments: segments.length, polygons: polygons.length });
    return true;
}

function atlasNodeToWorld(visual, frame, node) {
    const localX = visual.mirrorX ? frame.w - node.x : node.x;
    return {
        x: visual.x + localX / Math.max(1, frame.w) * visual.w,
        y: visual.y + node.y / Math.max(1, frame.h) * visual.h
    };
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

export function applyEditorLevelToWorld(state, editorLevel) {
    if (!state?.world || !editorLevel || typeof editorLevel !== "object") {
        return false;
    }

    const source = editorLevel.level || editorLevel;
    const placements = Array.isArray(source.placements) ? source.placements : [];
    const entities = Array.isArray(source.entities) ? source.entities : [];
    const playerStart = source.playerStart || source.wizardStart || source.start || null;

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
            layer: placement.layer || "terrain",
            collisionFromManifest: placement.collisionFromManifest !== false,
            order: Number.isFinite(Number(placement.order)) ? Number(placement.order) : visuals.length
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
        visuals,
        solids: [
            { id: "left_wall", kind: "wall", x: bounds.x - 80, y: bounds.y - 400, w: 60, h: bounds.h + 800 },
            { id: "right_wall", kind: "wall", x: bounds.x + bounds.w + 20, y: bounds.y - 400, w: 60, h: bounds.h + 800 }
        ],
        segments: [],
        collisionMode: "editorLevelPendingManifest",
        collisionSegmentCount: 0,
        labels: [
            { text: source.levelId || "loaded level", x: (playerStart?.x ?? 120) - 30, y: (playerStart?.y ?? 360) - 70 }
        ]
    };

    if (playerStart) {
        state.player.x = state.world.start.x;
        state.player.y = state.world.start.y;
        state.player.spawnX = state.world.start.x;
        state.player.spawnY = state.world.start.y;
        state.player.vx = 0;
        state.player.vy = 0;
        state.player.onGround = false;
        state.player.wasOnGround = false;
        state.player.airBoostArmed = false;
        state.camera.x = state.player.x;
        state.camera.y = state.player.y - 170;
    }

    const targetLike = (entity) => entity.type === "targetDummy" || entity.kind === "targetDummy";
    state.enemies = entities.filter(targetLike).map((entity, index) => ({
        id: entity.id || `targetDummy_${index + 1}`,
        kind: "targetDummy",
        x: Number(entity.x) || 0,
        y: Number(entity.y) || 0,
        width: Number(entity.w) || 42,
        height: Number(entity.h) || 80,
        health: 100,
        state: "idle"
    }));

    const fuelLike = (entity) => entity.type === "fuel" || entity.kind === "fuel" || entity.type === "fuelPickup" || entity.kind === "fuelPickup";
    state.pickups = entities.filter(fuelLike).map((entity, index) => ({
        id: entity.id || `fuel_${index + 1}`,
        kind: "fuel",
        x: Number(entity.x) || 0,
        y: Number(entity.y) || 0,
        radius: Number(entity.radius) || 14,
        amount: Number(entity.amount) || 40,
        collected: false
    }));

    const firstEnemy = state.enemies[0];
    state.targets = [
        firstEnemy ?
            { id: "homing_dot", kind: "debugHomingDot", x: firstEnemy.x, y: firstEnemy.y - 120, radius: 15, state: "active" } :
            { id: "homing_dot", kind: "debugHomingDot", x: state.player.x + 520, y: state.player.y - 160, radius: 15, state: "active" }
    ];

    state.story.levelTitle = source.title || source.levelTitle || "Ignatius Rocketfrock and the Loaded Level of Reasonable Expectations";
    addEvent(state, "EDITOR_LEVEL_APPLIED", { placements: visuals.length, entities: entities.length });
    return true;
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

        const previousX = projectile.x;
        const previousY = projectile.y;
        projectile.x += projectile.vx * dt;
        projectile.y += projectile.vy * dt;
        recordProjectileTrail(state, projectile);

        const terrainImpact = findProjectileTerrainImpact(state, projectile, previousX, previousY);
        if (terrainImpact) {
            projectile.x = terrainImpact.x;
            projectile.y = terrainImpact.y;
            explodeProjectile(state, projectile, terrainImpact.id);
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

function moveAndCollideX(state, dx) {
    const p = state.player;
    if (dx === 0) {
        return;
    }

    const previousX = p.x;
    p.x += dx;
    let rect = getPlayerRect(state);
    for (const solid of state.world.solids || []) {
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

    resolveSegmentXCollisions(state, previousX, dx);
    resolvePolygonXCollisions(state, previousX, dx);
}

function moveAndCollideY(state, dy, wasOnGround) {
    const p = state.player;
    const previousY = p.y;
    p.y += dy;
    p.onGround = false;

    let rect = getPlayerRect(state);
    for (const solid of state.world.solids || []) {
        if (!rectsOverlap(rect, solid)) {
            continue;
        }
        if (dy > 0) {
            landPlayerOn(state, solid.y, wasOnGround, solid.id);
        } else if (dy < 0) {
            p.y = solid.y + solid.h + p.height;
            p.vy = 0;
            state.collisions.playerTouching.up = true;
        }
        state.collisions.lastResolution = { axis: "y", solidId: solid.id };
        rect = getPlayerRect(state);
    }

    resolveSegmentYCollisions(state, previousY, dy, wasOnGround);
    resolvePolygonYCollisions(state, previousY, dy, wasOnGround);
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
        p.vx = approach(p.vx, 0, state.tuning.landingFriction * state.clock.fixedDt);
        addEvent(state, "PLAYER_LANDED", { solidId: id, kind, x: round(p.x), y: round(p.y), vx: round(p.vx) });
    }
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
