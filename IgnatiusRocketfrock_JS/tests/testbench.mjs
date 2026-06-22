import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { computeResponsiveViewportMetrics, computeTimedTextViewportLayout } from "../src/presentation/canvas-renderer.js";
import { RocketfrockInput } from "../src/browser/browser-input.js";
import {
    colorMapCacheKey,
    normalizeLevelColorMap,
    remapRgb,
    selectiveHueWeight
} from "../src/presentation/level-color-map.js";
import {
    atlasNodeToPlacementWorld,
    duplicateLevelPlacement,
    LEVEL_BACKGROUND_COLOR,
    placementCenter,
    placementCorners,
    pointInPlacement,
    worldToPlacementLocal
} from "../src/shared/level-transform.js";
import {
    animationTimeFromPhase,
    blendAnimationPoses,
    normalizeAnimationClip,
    sampleAnimationClip,
    sampleAnimationClipAtPlayhead,
    sampleAnimationTrack
} from "../src/shared/animation-data.js";
import {
    addAtlasFrameToRig,
    addRigPartToAnimation,
    animationFilenameForCharacterSlot,
    CHARACTER_PROJECT_FILE_KIND,
    classifyCharacterProjectJson,
    createBlankCharacterProject,
    inventoryCharacterProjectJson,
    moveRigPartToBack,
    moveRigPartToFront,
    normalizeAnimationSlot,
    normalizeCharacterSlug,
    resolveCharacterProjectReference
} from "../src/tools/character-editor/character-project.js";
import {
    createEditableAnimationClip,
    deleteAnimationKeyframe,
    duplicateEditableAnimationClip,
    getAnimationTrack,
    serializeEditableAnimationClip,
    updateAnimationClipMetadata,
    updateAnimationKeyframe,
    upsertAnimationKeyframe
} from "../src/tools/character-editor/animation-editor.js";
import {
    atlasFrameFromDrag,
    atlasToCanvasPoint,
    atlasViewTransform,
    canvasToAtlasPoint,
    createAtlasFrame,
    duplicateAtlasFrame,
    hitTestAtlasFrames,
    moveAtlasFrame,
    renameAtlasFrame,
    resizeAtlasFrame,
    uniqueAtlasFrameId,
    validateAtlasFrames,
    zoomAtlasViewAtCanvasPoint
} from "../src/tools/character-editor/atlas-editor.js";
import {
    characterProjectDirtySummary,
    characterProjectHasUnsavedChanges,
    createCharacterDirtyTracker,
    markCharacterProjectClean,
    markCharacterProjectDirty
} from "../src/tools/character-editor/character-dirty-state.js";
import {
    TRANSFORM_EDIT_PROPERTY,
    canvasToPreviewPoint,
    characterViewTransform,
    geometryToCanvas,
    hitTestPartGeometry,
    partRectangleGeometry,
    previewToCanvasPoint,
    rotationFromPointerDrag,
    zoomCharacterViewAtCanvasPoint
} from "../src/tools/character-editor/character-editor-view.js";
import {
    animationPoseToRuntimeTransforms,
    applyRuntimeProjectileHandoffVisibility,
    buildRuntimeCharacterDrawCommands,
    createRuntimeCharacterSetupPose,
    loadRuntimeCharacterProject,
    normalizeRuntimeCharacterRig,
    resolveRuntimeAnimationSlot,
    sampleRuntimeCharacterPose
} from "../src/presentation/character-runtime.js";
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
    applyCharacterCombatProfiles,
    applyAtlasManifestsToWorld,
    defaultNextLevelId,
    setWorldEntityState,
    damagePlayer
} from "../src/core/simulation.js";

function testSourceOrganization() {
    const expectedFiles = [
        "../index.html",
        "../asset-editor.html",
        "../level-editor.html",
        "../character-editor.html",
        "../renderer-smoke.html",
        "../ARCHITECTURE.md",
        "../package.json",
        "../src/core/simulation.js",
        "../src/browser/browser-input.js",
        "../src/browser/game-bootstrap.js",
        "../src/presentation/canvas-renderer.js",
        "../src/presentation/character-runtime.js",
        "../src/presentation/level-color-map.js",
        "../src/shared/animation-data.js",
        "../src/shared/level-transform.js",
        "../src/tools/character-editor/animation-editor.js",
        "../src/tools/character-editor/atlas-editor.js",
        "../src/tools/character-editor/character-dirty-state.js",
        "../src/tools/character-editor/character-editor-view.js",
        "../src/tools/character-editor/character-project.js"
    ];
    for (const relativePath of expectedFiles) {
        assert.equal(existsSync(new URL(relativePath, import.meta.url)), true, `${relativePath} should exist in the organized source tree`);
    }

    const retiredFiles = [
        "../IgnatiusRocketfrock_SIM.js",
        "../IgnatiusRocketfrock_RENDER.js",
        "../IgnatiusRocketfrock_GAME.js",
        "../IgnatiusRocketfrock_INPUT.js",
        "../IgnatiusRocketfrock_JS.html",
        "../asset_tool.html",
        "../level_editor.html",
        "../character_tool.html",
        "../renderer_smoke.html"
    ];
    for (const relativePath of retiredFiles) {
        assert.equal(existsSync(new URL(relativePath, import.meta.url)), false, `${relativePath} should remain retired`);
    }

    const looseRootScripts = readdirSync(new URL("../", import.meta.url), { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
        .map((entry) => entry.name);
    assert.deepEqual(looseRootScripts, [], "production JavaScript modules should not drift back into the project root");

    const packageMetadata = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    assert.equal(packageMetadata.type, "module", "package metadata should declare ES modules explicitly");
    assert.equal(packageMetadata.scripts?.test, "node tests/testbench.mjs", "package metadata should expose the aggregate test command");

    const architecture = readFileSync(new URL("../ARCHITECTURE.md", import.meta.url), "utf8");
    assert.ok(architecture.includes("PORTABLE CORE"), "architecture map should classify portable core modules");
    assert.ok(architecture.includes("RocketfrockCore/Simulation.h/.cpp"), "architecture map should preserve the future C++ correspondence");
    assert.ok(architecture.includes("Known temporary boundary violation"), "architecture map should record current boundary debt explicitly");

    const gameHtml = readFileSync(new URL("../game.html", import.meta.url), "utf8");
    assert.ok(gameHtml.includes('./src/browser/game-bootstrap.js'), "game page should load the reorganized browser bootstrap");
    const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    assert.ok(indexHtml.includes('asset-editor.html') && indexHtml.includes('level-editor.html') && indexHtml.includes('character-editor.html'), "landing page should link to the renamed tools");
}

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

function testTimedTextViewportLayout() {
    const centered = computeTimedTextViewportLayout(80, 200, 0, 5);
    assert.equal(centered.centered, true, "short story text should be vertically centered");
    approx(centered.contentOffset, 60, 0.000001, "short story text should receive a centered top offset");
    assert.equal(centered.maxScroll, 0, "short story text should not create a scrollbar");

    const starting = computeTimedTextViewportLayout(320, 200, 0, 5);
    assert.equal(starting.centered, false, "long story text should use scrolling");
    approx(starting.scrollOffset, 0, 0.000001, "long story text should begin at the top");
    approx(starting.maxScroll, 120, 0.000001, "scroll distance should equal content overflow");

    const finished = computeTimedTextViewportLayout(320, 200, 5, 5);
    approx(finished.scrollOffset, 120, 0.000001, "long story text should reach the final line before timeout");
    approx(finished.contentOffset, -120, 0.000001, "scrolling should move content upward by its overflow");
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



async function testGenericRuntimeCharacterProject() {
    const jsonByUrl = new Map();
    for (const filename of [
        "ct_char_enemy_001.json",
        "ct_rig_enemy_001.json",
        "ct_atlas_enemy_001.json",
        "ct_anim_enemy_001_idle.json",
        "ct_anim_enemy_001_walk.json",
        "ct_anim_enemy_001_attack.json",
        "ct_anim_enemy_001_hurt.json",
        "ct_anim_enemy_001_death.json"
    ]) {
        jsonByUrl.set(`assets/${filename}`, JSON.parse(readFileSync(`./assets/${filename}`, "utf8")));
    }
    const drawCalls = [];
    const project = await loadRuntimeCharacterProject("assets/ct_char_enemy_001.json", {
        loadJson: async (url) => {
            assert.ok(jsonByUrl.has(url), `runtime loader should resolve known project URL ${url}`);
            return JSON.parse(JSON.stringify(jsonByUrl.get(url)));
        },
        loadImage: async (url) => ({ width: 1536, height: 1152, naturalWidth: 1536, naturalHeight: 1152, url }),
        createCanvas: (width, height) => ({
            width,
            height,
            getContext: () => ({
                drawImage: (...args) => drawCalls.push(args)
            })
        })
    });

    assert.equal(project.characterId, "ct_char_enemy_001", "runtime loader should retain the character ID");
    assert.equal(project.rig.drawOrder.length, 8, "generic runtime rig should preserve every enemy part");
    assert.equal(project.animations.size, 5, "runtime loader should load all mapped enemy animations");
    assert.equal(drawCalls.length, 8, "runtime loader should crop one atlas frame for every rig part");
    assert.equal(resolveRuntimeAnimationSlot(project, "attack"), "attack", "requested mapped animation should resolve directly");
    assert.equal(resolveRuntimeAnimationSlot(project, "missing"), "idle", "missing slots should fall back to idle");

    const sampled = sampleRuntimeCharacterPose(project, "walk", 0.2);
    assert.equal(sampled.slot, "walk", "runtime character sampler should use the requested walk slot");
    const transforms = animationPoseToRuntimeTransforms(sampled.pose, project.rig, 2, 0.75);
    const commands = buildRuntimeCharacterDrawCommands(project, transforms);
    assert.deepEqual(commands.map((command) => command.partName), project.rig.drawOrder, "draw commands should follow rig draw order");
    assert.ok(commands.every((command) => Number.isFinite(command.spriteScale) && command.spriteScale > 0), "draw commands should have finite positive scales");

    const arbitraryRig = normalizeRuntimeCharacterRig({
        rigId: "tiny",
        drawOrder: ["wing", "body"],
        global: { scale: 1 },
        pivots: { wing: { x: 0.1, y: 0.2 } },
        parts: {
            body: { frame: "body", offset: { x: 3, y: 4 }, targetHeight: 20 },
            wing: { frame: "wing", offset: { x: -2, y: 1 }, targetHeight: 10 }
        }
    });
    assert.deepEqual(arbitraryRig.drawOrder, ["wing", "body"], "generic rigs must not assume wizard or humanoid part names");
    const setupPose = createRuntimeCharacterSetupPose(arbitraryRig);
    assert.equal(setupPose.wing.x, -2, "setup pose should use rig offsets");
    assert.equal(arbitraryRig.pivots.body.x, 0.5, "missing pivots should receive a safe frame-centre default");

    const state = createInitialGameState();
    const level = {
        levelId: "runtime_character_test",
        playerStart: { x: 0, y: 600 },
        entities: [{
            id: "skeleton_runtime_001",
            type: "characterEnemy",
            characterId: "ct_char_enemy_001",
            x: 400,
            y: 600,
            w: 72,
            h: 150,
            facing: -1,
            animationSlot: "idle",
            renderScale: 0.8
        }]
    };
    assert.equal(applyEditorLevelToWorld(state, level), true, "runtime character level entity should apply");
    const enemy = state.enemies.find((item) => item.id === "skeleton_runtime_001");
    assert.ok(enemy, "character enemy should enter simulation presentation state");
    assert.equal(enemy.characterId, "ct_char_enemy_001", "character enemy should retain its project ID");
    assert.equal(enemy.facing, -1, "character enemy should retain authored facing");
    assert.equal(enemy.animationSlot, "idle", "character enemy should retain authored animation slot");
    assert.equal(enemy.maxHealth, 100, "character enemy should retain serializable maximum health");
    assert.equal(enemy.combatState, "alive", "fresh character enemy should begin alive");
}

async function testGoblinRuntimeCharacterProjects() {
    const jsonByUrl = new Map();
    for (const filename of [
        "ct_char_enemy_002.json",
        "ct_char_enemy_003.json",
        "ct_rig_enemy_002.json",
        "ct_atlas_enemy_002.json",
        "ct_anim_enemy_002_idle.json",
        "ct_anim_enemy_002_walk.json",
        "ct_anim_enemy_002_attack.json",
        "ct_anim_enemy_002_hurt.json",
        "ct_anim_enemy_002_death.json",
        "ct_anim_enemy_003_idle.json",
        "ct_anim_enemy_003_walk.json",
        "ct_anim_enemy_003_attack.json",
        "ct_anim_enemy_003_hurt.json",
        "ct_anim_enemy_003_death.json"
    ]) {
        jsonByUrl.set(`assets/${filename}`, JSON.parse(readFileSync(`./assets/${filename}`, "utf8")));
    }
    const loader = {
        loadJson: async (url) => {
            assert.ok(jsonByUrl.has(url), `goblin runtime loader should resolve ${url}`);
            return JSON.parse(JSON.stringify(jsonByUrl.get(url)));
        },
        loadImage: async (url) => ({ width: 1371, height: 979, naturalWidth: 1371, naturalHeight: 979, url }),
        createCanvas: (width, height) => ({
            width,
            height,
            getContext: () => ({ drawImage: () => {} })
        })
    };

    const fireball = await loadRuntimeCharacterProject("assets/ct_char_enemy_002.json", loader);
    const musket = await loadRuntimeCharacterProject("assets/ct_char_enemy_003.json", loader);

    assert.equal(fireball.characterId, "ct_char_enemy_002", "fireball goblin should keep its character ID");
    assert.equal(musket.characterId, "ct_char_enemy_003", "musket goblin should keep its character ID");
    assert.equal(fireball.rig.parts.leftArm.frame, "leftArmOpen", "fireball goblin should override its correctly identified casting arm frame");
    assert.equal(fireball.rig.parts.weapon.frame, "musket", "shared weapon slot may retain a valid atlas frame even when hidden");
    assert.equal(fireball.rig.parts.weapon.alpha, 0, "fireball should not be attached to the Fireball Goblin rig");
    assert.equal(musket.rig.parts.leftArm.frame, "leftArmOpen", "shared goblin rig should retain the open casting arm as a hidden swappable part");
    assert.equal(musket.rig.parts.leftArmClosed.frame, "leftArmClosed", "musket goblin should use the dedicated corrected closed left support arm");
    assert.equal(musket.rig.parts.rightArm.frame, "rightArmClosed", "musket goblin should use the corrected closed right trigger arm");
    assert.equal(musket.rig.parts.weapon.frame, "musket", "musket goblin should use the musket frame");
    assert.deepEqual(
        fireball.rig.drawOrder,
        jsonByUrl.get("assets/ct_rig_enemy_002.json").drawOrder,
        "runtime goblin rig should preserve the user-authored depth-first order"
    );
    assert.equal(fireball.atlasAssets.get("fireball")?.frameId, "fireball", "runtime project should expose the authored fireball atlas resource");
    assert.equal(musket.atlasAssets.get("cannonball")?.frameId, "cannonball", "runtime project should expose unattached cannonball atlas resources");
    assert.equal(fireball.animations.size, 5, "fireball goblin should resolve its dedicated animation set");
    assert.equal(musket.animations.size, 5, "musket goblin should resolve its dedicated weapon-aware animation set");
    assert.equal(fireball.projectiles.size, 1, "Fireball Goblin should activate only its selected projectile part");
    assert.equal(musket.projectiles.size, 1, "Musket Goblin should activate only its selected projectile part");
    const fireballProjectile = fireball.projectiles.get("fireball");
    const musketProjectile = musket.projectiles.get("cannonball");
    assert.equal(fireballProjectile.launchType, "homing_lo", "Fireball Goblin rig should tag the fireball as low-homing");
    assert.equal(fireballProjectile.animationSlot, "attack", "fireball handoff should be attached to the attack slot");
    approx(fireballProjectile.releaseTime, 0.372, 0.000001, "fireball handoff should use the explicit authored release time");
    assert.ok(fireballProjectile.localX > 200 && fireballProjectile.localY < -180, "fireball release should sample the ground-normalized authored attack position");
    assert.equal(musketProjectile.launchType, "ballistic", "Musket Goblin rig should tag the cannonball as ballistic");
    approx(musketProjectile.releaseTime, 0.49531814840382643, 0.000001, "cannonball handoff should use the explicit authored release time");
    assert.ok(musketProjectile.localX > 180 && musketProjectile.localY < -220, "cannonball release should sample the ground-normalized muzzle position");
    const beforeRelease = sampleRuntimeCharacterPose(fireball, "attack", 0.35);
    const beforeTransforms = animationPoseToRuntimeTransforms(beforeRelease.pose, fireball.rig, 1, 1);
    assert.equal(applyRuntimeProjectileHandoffVisibility(fireball, "attack", 0.35, beforeTransforms), 0, "projectile rig part should remain visible before handoff");
    const released = sampleRuntimeCharacterPose(fireball, "attack", fireballProjectile.releaseTime);
    const releasedTransforms = animationPoseToRuntimeTransforms(released.pose, fireball.rig, 1, 1);
    assert.equal(applyRuntimeProjectileHandoffVisibility(fireball, "attack", fireballProjectile.releaseTime, releasedTransforms), 1, "projectile rig part should be hidden at handoff");
    assert.equal(releasedTransforms.fireball.alpha, 0, "released fireball should no longer remain attached to the character pose");
}

function testEnemyCatalogAndLevelEditorIntegration() {
    const catalog = JSON.parse(readFileSync("./assets/ct_enemies_001.json", "utf8"));
    const skeleton = catalog.enemies?.enemy_001;
    assert.ok(skeleton, "enemy catalog should register enemy_001");
    assert.equal(skeleton.characterId, "ct_char_enemy_001", "enemy_001 should reference its generic character project");
    assert.equal(skeleton.defaults.behavior, "patrol", "Skeleton Guard should default to patrol behaviour");
    assert.ok(skeleton.defaults.patrolDistance > 0, "Skeleton Guard should have a visible default patrol span");
    assert.ok(skeleton.defaults.attackDamage > 0, "Skeleton Guard should have authored melee damage");
    assert.ok(skeleton.defaults.attackRange > 0, "Skeleton Guard should have authored melee reach");
    assert.ok(skeleton.defaults.chaseSpeed > skeleton.defaults.walkSpeed, "alert Skeleton Guard should rush faster than it patrols");
    assert.ok(skeleton.defaults.attackCooldown < 0.25, "Skeleton Guard should chain rapid sword chops");
    const levelOne = JSON.parse(readFileSync("./assets/level_001.json", "utf8"));
    assert.ok(levelOne.entities.some((entity) => entity.characterId === "ct_char_enemy_002"), "level_001 should contain a Fireball Goblin");
    assert.ok(levelOne.entities.some((entity) => entity.characterId === "ct_char_enemy_003"), "level_001 should contain a Musket Goblin");

    const editorHtml = readFileSync(new URL("../level-editor.html", import.meta.url), "utf8");
    assert.ok(editorHtml.includes("ENEMY_CATALOG_URL"), "level editor should load the explicit enemy catalog");
    assert.ok(editorHtml.includes('value="enemy_001"'), "level editor palette should expose the Skeleton Guard");
    assert.ok(editorHtml.includes('id="enemy-settings-row"'), "level editor should expose character-enemy behaviour controls");
    assert.ok(editorHtml.includes("drawCharacterEnemyPreview"), "level editor should preview enemies through the generic character renderer");
    assert.ok(editorHtml.includes("snapCharacterEnemyToNearbyGround"), "placed enemies should snap their feet to authored support lines");
    assert.ok(editorHtml.includes('id="inspect-enemy-health"'), "level editor should expose enemy health authoring");
    assert.ok(editorHtml.includes('id="inspect-enemy-attack-damage"'), "level editor should expose enemy melee damage");
    assert.ok(editorHtml.includes('id="inspect-enemy-attack-range"'), "level editor should expose enemy melee reach");
    assert.ok(editorHtml.includes('id="inspect-enemy-chase-speed"'), "level editor should expose alerted chase speed");
    assert.ok(editorHtml.includes('id="inspect-enemy-awareness-range"'), "level editor should expose stationary-guard awareness range");

    const level = JSON.parse(readFileSync("./assets/level_001.json", "utf8"));
    const placed = level.entities.find((entity) => entity.id === "enemy_001_001");
    assert.ok(placed, "level_001 should include the first placed Skeleton Guard");
    assert.equal(placed.type, "characterEnemy", "placed Skeleton Guard should use the generic runtime entity type");
    assert.equal(placed.behavior, "patrol", "placed Skeleton Guard should use simulation-owned patrol behaviour");
}

function testCharacterEnemyPatrolBehavior() {
    const state = createInitialGameState();
    assert.equal(applyEditorLevelToWorld(state, {
        levelId: "enemy_patrol_test",
        playerStart: { x: -300, y: 600 },
        entities: [{
            id: "patrol_enemy",
            type: "characterEnemy",
            characterId: "ct_char_enemy_001",
            x: 100,
            y: 600,
            w: 72,
            h: 150,
            facing: 1,
            behavior: "patrol",
            patrolDistance: 80,
            walkSpeed: 60,
            idleDuration: 0,
            turnPause: 0,
            renderScale: 0.8,
            targetAnchor: { x: 0.5, y: 0.4 }
        }]
    }), true, "patrol test level should apply");
    state.world.segments = [{ id: "patrol_floor", kind: "walkable", x1: -100, y1: 600, x2: 300, y2: 600 }];
    state.world.collisionPolygons = [];
    state.world.solids = [];
    state.story.portalIntro = null;
    state.story.portalExit = null;
    state.story.mailboxEvent = null;

    const enemy = state.enemies.find((item) => item.id === "patrol_enemy");
    const target = state.targets.find((item) => item.enemyId === enemy.id);
    assert.equal(enemy.movementPhase, "idle", "patrolling enemy should begin with an idle phase");
    stepSimulation(state, createInputFrame(), FIXED_DT);
    assert.equal(enemy.animationSlot, "walk", "patrolling enemy should switch to its walk animation when idle time expires");

    stepMany(state, 20);
    approx(enemy.x, 120, 0.01, "patrolling enemy should move at its authored walk speed");
    assert.equal(enemy.y, 600, "patrolling enemy should keep its feet on the support line");
    approx(target.x, enemy.x, 0.001, "homing target should follow the moving enemy");

    stepMany(state, 20);
    approx(enemy.x, 140, 0.01, "patrolling enemy should stop at the authored patrol limit");
    assert.equal(enemy.facing, -1, "patrolling enemy should turn around at the patrol limit");
    assert.equal(enemy.animationSlot, "idle", "turning enemy should enter its idle animation during the pause");

    stepSimulation(state, createInputFrame(), FIXED_DT);
    stepSimulation(state, createInputFrame(), FIXED_DT);
    assert.ok(enemy.x < 140, "enemy should resume walking in the opposite direction after turning");
    assert.equal(enemy.animationSlot, "walk", "enemy should return to the walk animation after turning");

    const guardState = createInitialGameState();
    applyEditorLevelToWorld(guardState, {
        levelId: "enemy_guard_test",
        playerStart: { x: -300, y: 600 },
        entities: [{
            id: "guard_enemy",
            type: "characterEnemy",
            characterId: "ct_char_enemy_001",
            x: 100,
            y: 600,
            behavior: "guard",
            patrolDistance: 200,
            walkSpeed: 60
        }]
    });
    guardState.world.segments = [{ id: "guard_floor", kind: "walkable", x1: -100, y1: 600, x2: 300, y2: 600 }];
    guardState.world.collisionPolygons = [];
    guardState.world.solids = [];
    stepMany(guardState, 120);
    const guard = guardState.enemies.find((item) => item.id === "guard_enemy");
    assert.equal(guard.x, 100, "stand-guard behaviour should not move the enemy");
    assert.equal(guard.animationSlot, "idle", "stand-guard behaviour should remain in idle animation");
}

function testCharacterEnemyAggressiveChaseAndCombo() {
    const state = createInitialGameState({
        tuning: {
            healthRegenDelay: 99
        }
    });
    applyEditorLevelToWorld(state, {
        levelId: "enemy_aggression_test",
        playerStart: { x: 10, y: 600 },
        entities: [{
            id: "rush_guard",
            type: "characterEnemy",
            characterId: "ct_char_enemy_001",
            x: 100,
            y: 600,
            w: 72,
            h: 150,
            facing: -1,
            behavior: "patrol",
            patrolDistance: 300,
            walkSpeed: 40,
            chaseSpeed: 180,
            awarenessVerticalRange: 180,
            awarenessHoldDuration: 1,
            attackDamage: 0,
            attackRange: 66,
            attackVerticalRange: 110,
            attackDuration: 0.44,
            attackHitTime: 0.36,
            attackCooldown: 0.12,
            attackLungeDistance: 20,
            attackLungeSpeed: 180
        }]
    });
    state.world.solids = [];
    state.world.segments = [{ id: "rush_floor", kind: "walkable", x1: -200, y1: 600, x2: 400, y2: 600 }];
    state.world.collisionPolygons = [];
    state.story.portalIntro = null;
    state.story.portalExit = null;
    state.story.mailboxEvent = null;
    state.player.x = 10;
    state.player.y = 600;
    state.player.onGround = true;
    state.player.wasOnGround = true;

    const enemy = state.enemies.find((item) => item.id === "rush_guard");
    const attackStartX = enemy.x;
    stepSimulation(state, createInputFrame(), FIXED_DT);
    assert.equal(enemy.alerted, true, "patroller should become alert when Ignatius enters its patrol span");
    assert.equal(enemy.combatState, "attacking", "an alert guard already in sword range should attack immediately");
    assert.ok(state.debug.lastEvents.some((event) => event.type === "ENEMY_ALERTED"), "first awareness should emit an alert event");

    stepMany(state, 22);
    assert.ok(enemy.x < attackStartX - 15, "attack wind-up should lunge the guard close enough for visible sword contact");
    assert.equal(enemy.attackHitApplied, true, "rapid clip should apply its strike on the visible downstroke");

    stepMany(state, 17);
    assert.equal(enemy.combatState, "attacking", "short recovery should already have started the next chop");
    assert.ok(enemy.animationTime < 0.2, "second chop should restart the authored attack clip rather than lingering in recovery");

    const chaseState = createInitialGameState();
    applyEditorLevelToWorld(chaseState, {
        levelId: "enemy_chase_speed_test",
        playerStart: { x: -20, y: 600 },
        entities: [{
            id: "chase_guard",
            type: "characterEnemy",
            characterId: "ct_char_enemy_001",
            x: 100,
            y: 600,
            behavior: "patrol",
            patrolDistance: 300,
            walkSpeed: 40,
            chaseSpeed: 180,
            attackRange: 50,
            attackDamage: 0
        }]
    });
    chaseState.world.solids = [];
    chaseState.world.segments = [{ id: "chase_floor", kind: "walkable", x1: -200, y1: 600, x2: 400, y2: 600 }];
    chaseState.world.collisionPolygons = [];
    chaseState.story.portalIntro = null;
    chaseState.story.portalExit = null;
    chaseState.story.mailboxEvent = null;
    chaseState.player.x = -20;
    chaseState.player.y = 600;
    chaseState.player.onGround = true;
    chaseState.player.wasOnGround = true;
    const chaser = chaseState.enemies.find((item) => item.id === "chase_guard");
    stepMany(chaseState, 10);
    assert.equal(chaser.movementPhase, "chase", "alert enemy outside sword reach should use the chase phase");
    assert.ok(chaser.x < 75, "chase movement should be substantially faster than the 40-unit patrol pace");
    assert.equal(chaser.animationSlot, "walk", "rapid pursuit should reuse the authored walking animation");
}

function addTestRocket(state, overrides = {}) {
    const projectile = {
        id: overrides.id || `test_rocket_${state.projectiles.length + 1}`,
        kind: "homingRocket",
        state: "launched",
        x: overrides.x ?? 0,
        y: overrides.y ?? 50,
        vx: overrides.vx ?? 12000,
        vy: overrides.vy ?? 0,
        targetId: overrides.targetId ?? null,
        upLaunchTimer: overrides.upLaunchTimer ?? 999,
        age: 0,
        lifetime: overrides.lifetime ?? 2,
        explosionTimer: 0,
        radius: overrides.radius ?? 6,
        damage: overrides.damage ?? 55,
        trail: []
    };
    state.projectiles.push(projectile);
    return projectile;
}

function testCharacterEnemyRocketCombat() {
    const state = createInitialGameState();
    assert.equal(applyEditorLevelToWorld(state, {
        levelId: "enemy_combat_test",
        playerStart: { x: -200, y: 600 },
        entities: [{
            id: "combat_guard",
            type: "characterEnemy",
            characterId: "ct_char_enemy_001",
            x: 180,
            y: 100,
            w: 72,
            h: 150,
            health: 100,
            behavior: "guard",
            facing: -1,
            hurtDuration: 0.48,
            deathDuration: 1.18
        }, {
            id: "reserve_guard",
            type: "characterEnemy",
            characterId: "ct_char_enemy_001",
            x: 520,
            y: 100,
            w: 72,
            h: 150,
            health: 100,
            behavior: "guard",
            facing: -1
        }]
    }), true, "enemy combat test level should apply");
    state.world.solids = [];
    state.world.segments = [];
    state.world.collisionPolygons = [];
    state.story.portalIntro = null;
    state.story.portalExit = null;
    state.story.mailboxEvent = null;

    const enemy = state.enemies.find((item) => item.id === "combat_guard");
    const target = state.targets.find((item) => item.enemyId === enemy.id);
    const reserveTarget = state.targets.find((item) => item.enemyId === "reserve_guard");
    enemy.combatState = "attacking";
    enemy.movementPhase = "attack";
    enemy.animationSlot = "attack";
    enemy.attackTimer = 0.3;
    enemy.attackHitApplied = false;
    const first = addTestRocket(state, { id: "combat_hit_1" });
    stepSimulation(state, createInputFrame(), FIXED_DT);

    assert.equal(first.state, "exploding", "rocket should explode on the enemy body");
    assert.equal(enemy.health, 45, "first rocket should subtract its serialized damage");
    assert.equal(enemy.maxHealth, 100, "enemy maximum health should remain stable after damage");
    assert.equal(enemy.combatState, "hurt", "surviving enemy should enter hurt combat state");
    assert.equal(enemy.animationSlot, "hurt", "surviving Skeleton Guard should play the authored hurt clip");
    assert.equal(enemy.attackTimer, 0, "rocket hurt should interrupt an in-progress melee attack");
    assert.ok(enemy.hitFlashTimer > 0, "enemy hit should start a renderer-facing flash timer");
    assert.ok(enemy.healthBarTimer > 0, "enemy hit should temporarily reveal its health bar");
    assert.equal(target.state, "active", "surviving enemy should remain a homing target");
    assert.ok(state.debug.lastEvents.some((event) => event.type === "ENEMY_DAMAGED" && event.enemyId === enemy.id), "damage should emit an enemy event");

    state.projectiles = [];
    stepMany(state, Math.ceil(enemy.hurtDuration / FIXED_DT) + 2);
    assert.equal(enemy.combatState, "alive", "enemy should leave hurt state after the authored recoil duration");
    assert.equal(enemy.animationSlot, "idle", "guard enemy should return to idle after hurt recovery");

    const second = addTestRocket(state, { id: "combat_hit_2" });
    stepSimulation(state, createInputFrame(), FIXED_DT);
    assert.equal(second.state, "exploding", "lethal rocket should still resolve as an enemy impact");
    assert.equal(enemy.health, 0, "second rocket should defeat the damaged guard");
    assert.equal(enemy.combatState, "dead", "lethal damage should enter dead combat state");
    assert.equal(enemy.animationSlot, "death", "lethal damage should select the authored death clip");
    assert.equal(enemy.movementPhase, "dead", "defeated guard should stop patrol movement");
    assert.equal(enemy.renderOpacity, 1, "defeated enemy should initially remain fully opaque");
    assert.equal(target.state, "inactive", "defeated enemy should leave the homing target pool");
    assert.equal(reserveTarget.state, "active", "other living enemies should remain targetable");
    assert.ok(state.debug.lastEvents.some((event) => event.type === "ENEMY_DEFEATED" && event.enemyId === enemy.id), "lethal damage should emit a defeat event");

    state.projectiles = [];
    stepSimulation(state, createInputFrame({ weaponPressed: true, weaponHeld: true }), FIXED_DT);
    assert.equal(state.projectiles[0].targetId, reserveTarget.id, "new rockets should retarget the next living enemy");

    const deadX = enemy.x;
    state.projectiles = [];
    stepMany(state, 100);
    assert.equal(enemy.x, deadX, "defeated enemy should remain stationary");
    assert.equal(enemy.animationSlot, "death", "defeated enemy should remain on its non-looping death presentation");
    assert.equal(enemy.renderOpacity, 1, "defeated enemy should remain fully opaque for the first two seconds");

    stepMany(state, 90);
    assert.ok(enemy.renderOpacity > 0.5 && enemy.renderOpacity < 0.75, "defeated enemy should fade gradually after the two-second hold");

    stepMany(state, 120);
    assert.equal(enemy.renderOpacity, 0, "defeated enemy should be fully transparent after the three-second fade");
}

function testCharacterEnemyMeleeAttack() {
    const state = createInitialGameState({
        tuning: {
            healthRegenDelay: 0.4,
            healthRegenRate: 20,
            playerDamageInvulnerabilitySeconds: 0.3
        }
    });
    assert.equal(applyEditorLevelToWorld(state, {
        levelId: "enemy_melee_test",
        playerStart: { x: 0, y: 600 },
        entities: [{
            id: "melee_guard",
            type: "characterEnemy",
            characterId: "ct_char_enemy_001",
            x: 76,
            y: 600,
            w: 72,
            h: 150,
            facing: -1,
            behavior: "guard",
            health: 100,
            attackDamage: 25,
            attackRange: 92,
            attackVerticalRange: 110,
            attackDuration: 0.3,
            attackHitTime: 0.1,
            attackCooldown: 0.4,
            attackKnockbackX: 280,
            attackKnockbackY: -210
        }]
    }), true, "melee combat test level should apply");
    state.world.solids = [];
    state.world.segments = [{ id: "melee_floor", kind: "walkable", x1: -200, y1: 600, x2: 300, y2: 600 }];
    state.world.collisionPolygons = [];
    state.story.portalIntro = null;
    state.story.portalExit = null;
    state.story.mailboxEvent = null;
    state.player.x = 0;
    state.player.y = 600;
    state.player.onGround = true;
    state.player.wasOnGround = true;

    const enemy = state.enemies.find((item) => item.id === "melee_guard");
    stepSimulation(state, createInputFrame(), FIXED_DT);
    assert.equal(enemy.combatState, "attacking", "guard should enter an explicit attack combat state");
    assert.equal(enemy.animationSlot, "attack", "guard should use the authored attack clip");
    assert.equal(enemy.facing, -1, "guard should face Ignatius when the attack begins");
    assert.ok(state.debug.lastEvents.some((event) => event.type === "ENEMY_ATTACK_STARTED"), "attack start should emit an event");

    stepMany(state, 7);
    approx(state.health.amount, 75, 0.001, "sword hit should subtract authored damage once");
    assert.ok(state.health.invulnerabilityTimer > 0, "successful hit should start player damage invulnerability");
    assert.ok(state.player.vx < -200, "sword hit should knock Ignatius away from the attacker");
    assert.ok(state.player.vy < 0, "sword hit should lift Ignatius with authored knockback");
    assert.ok(state.debug.lastEvents.some((event) => event.type === "ENEMY_ATTACK_HIT"), "successful sword hit should emit a hit event");

    const healthAfterHit = state.health.amount;
    stepMany(state, 8);
    approx(state.health.amount, healthAfterHit, 0.001, "one sword swing should never deal damage more than once");
    stepMany(state, 20);
    assert.notEqual(enemy.combatState, "attacking", "guard should leave attack state when the authored clip duration ends");

    state.player.x = -300;
    state.player.y = 600;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.onGround = true;
    stepMany(state, 30);
    assert.ok(state.health.amount > healthAfterHit, "health should begin regenerating after the configured delay");
    assert.ok(
        state.debug.lastEvents.some((event) => event.type === "PLAYER_HEALTH_REGEN_STARTED"),
        "health regeneration should emit presentation feedback"
    );
}

function testEnemyMeleeBlockedByTerrain() {
    const state = createInitialGameState();
    applyEditorLevelToWorld(state, {
        levelId: "enemy_melee_cover_test",
        playerStart: { x: -20, y: 600 },
        entities: [{
            id: "blocked_melee_guard",
            type: "characterEnemy",
            characterId: "ct_char_enemy_001",
            x: 76,
            y: 600,
            w: 72,
            h: 150,
            facing: -1,
            behavior: "guard",
            attackRange: 110,
            attackVerticalRange: 120,
            attackDamage: 25
        }]
    });
    state.world.solids = [{ id: "melee_wall", kind: "wall", x: 28, y: 390, w: 18, h: 210 }];
    state.world.segments = [];
    state.world.collisionPolygons = [];
    state.story.portalIntro = null;
    state.story.portalExit = null;
    state.story.mailboxEvent = null;
    state.player.x = -20;
    state.player.y = 600;
    state.player.onGround = true;
    state.player.wasOnGround = true;

    const enemy = state.enemies.find((item) => item.id === "blocked_melee_guard");
    stepMany(state, 20);
    assert.equal(enemy.animationSlot, "idle", "blocking terrain should keep the guard from starting a melee swing through a wall");
    approx(state.health.amount, state.health.max, 0.001, "wall should shield Ignatius from melee damage");
    assert.equal(
        state.debug.lastEvents.some((event) => event.type === "ENEMY_ATTACK_STARTED"),
        false,
        "blocked melee line of sight should not emit an attack start"
    );
}

function testFireballGoblinProjectileAttack() {
    const state = createInitialGameState({
        tuning: {
            playerDamageInvulnerabilitySeconds: 0.1,
            healthRegenDelay: 99
        }
    });
    applyEditorLevelToWorld(state, {
        levelId: "fireball_goblin_test",
        playerStart: { x: 0, y: 600 },
        entities: [{
            id: "fireball_goblin",
            type: "characterEnemy",
            characterId: "ct_char_enemy_002",
            x: 210,
            y: 600,
            w: 72,
            h: 148,
            facing: -1,
            behavior: "guard",
            health: 80,
            attackMode: "projectile",
            attackRange: 340,
            attackVerticalRange: 180,
            attackDuration: 0.4,
            attackHitTime: 0.1,
            attackCooldown: 0.12,
            projectileCooldown: 0.8,
            projectileKind: "fireball",
            projectileSpeed: 260,
            projectileGravity: 0,
            projectileLifetime: 3.2,
            projectileRadius: 14,
            projectileDamage: 12,
            projectileHomingStrength: 1.1,
            preferredAttackRange: 220,
            preferredAttackMinRange: 90,
            awarenessRange: 360,
            awarenessVerticalRange: 200
        }]
    });
    applyCharacterCombatProfiles(state, new Map([["ct_char_enemy_002", {
        attackDuration: 0.62,
        projectiles: [{
            partName: "fireball",
            frameId: "fireball",
            animationSlot: "attack",
            launchType: "homing_lo",
            projectileKind: "fireball",
            releaseTime: 0.372,
            localX: 235.0526306831884,
            localY: -244.29922123959187,
            rigScale: 0.5
        }]
    }]]));
    state.world.solids = [];
    state.world.segments = [{ id: "floor", kind: "walkable", x1: -300, y1: 600, x2: 400, y2: 600 }];
    state.world.collisionPolygons = [];
    state.story.portalIntro = null;
    state.story.portalExit = null;
    state.story.mailboxEvent = null;
    state.player.x = 0;
    state.player.y = 600;
    state.player.onGround = true;
    state.player.wasOnGround = true;

    const enemy = state.enemies.find((item) => item.id === "fireball_goblin");
    stepMany(state, 20);
    assert.ok(state.debug.lastEvents.some((event) => event.type === "ENEMY_ATTACK_STARTED" && event.enemyId === enemy.id), "fireball goblin should start a ranged attack");
    assert.equal(state.projectiles.some((item) => item.owner === "enemy" && item.enemyId === enemy.id), false, "fireball should remain animation-owned before its explicit release time");
    stepMany(state, 8);
    const projectile = state.projectiles.find((item) => item.owner === "enemy" && item.enemyId === enemy.id);
    assert.ok(projectile, "fireball goblin should spawn an enemy projectile");
    assert.equal(projectile.kind, "enemyFireball", "fireball goblin should launch the fireball projectile kind");
    assert.equal(projectile.launchType, "homing_lo", "released fireball should retain the tagged launch type");
    const firedEvent = state.debug.lastEvents.find((event) => event.type === "ENEMY_PROJECTILE_FIRED" && event.enemyId === enemy.id);
    approx(firedEvent.x, 92.474, 0.01, "fireball should transfer from the sampled animated world X");
    approx(firedEvent.y, 477.85, 0.01, "fireball should transfer from the sampled animated world Y");
    const startHealth = state.health.amount;
    stepMany(state, 180);
    assert.ok(state.health.amount < startHealth, `fireball projectile should eventually hurt the player, before ${startHealth}, after ${state.health.amount}`);
    assert.ok(state.debug.lastEvents.some((event) => event.type === "ENEMY_PROJECTILE_IMPACTED" && event.impactKind === "player"), "fireball impact should emit a player-impact event");
}

function testMusketGoblinProjectileAttack() {
    const state = createInitialGameState({
        tuning: {
            playerDamageInvulnerabilitySeconds: 0.1,
            healthRegenDelay: 99
        }
    });
    applyEditorLevelToWorld(state, {
        levelId: "musket_goblin_test",
        playerStart: { x: 0, y: 600 },
        entities: [{
            id: "musket_goblin",
            type: "characterEnemy",
            characterId: "ct_char_enemy_003",
            x: 250,
            y: 600,
            w: 76,
            h: 148,
            facing: -1,
            behavior: "guard",
            health: 90,
            attackMode: "projectile",
            attackRange: 420,
            attackVerticalRange: 220,
            attackDuration: 0.42,
            attackHitTime: 0.1,
            attackCooldown: 0.12,
            projectileCooldown: 0.9,
            projectileKind: "musketBall",
            projectileSpeed: 380,
            projectileGravity: 820,
            projectileLifetime: 3.1,
            projectileRadius: 7,
            projectileDamage: 18,
            projectileHomingStrength: 0,
            preferredAttackRange: 250,
            preferredAttackMinRange: 120,
            awarenessRange: 430,
            awarenessVerticalRange: 220
        }]
    });
    applyCharacterCombatProfiles(state, new Map([["ct_char_enemy_003", {
        attackDuration: 0.62,
        projectiles: [{
            partName: "cannonball",
            frameId: "cannonball",
            animationSlot: "attack",
            launchType: "ballistic",
            projectileKind: "musketBall",
            releaseTime: 0.49531814840382643,
            localX: 189.17163009094236,
            localY: -286.5805672576993,
            rigScale: 0.5
        }]
    }]]));
    state.world.solids = [];
    state.world.segments = [{ id: "floor", kind: "walkable", x1: -300, y1: 600, x2: 500, y2: 600 }];
    state.world.collisionPolygons = [];
    state.story.portalIntro = null;
    state.story.portalExit = null;
    state.story.mailboxEvent = null;
    state.player.x = 0;
    state.player.y = 600;
    state.player.onGround = true;
    state.player.wasOnGround = true;

    stepMany(state, 24);
    assert.equal(state.projectiles.some((item) => item.owner === "enemy"), false, "cannonball should remain attached before its explicit release time");
    stepMany(state, 10);
    const projectile = state.projectiles.find((item) => item.owner === "enemy");
    assert.ok(projectile, "musket goblin should spawn an enemy projectile");
    assert.equal(projectile.kind, "enemyMusketBall", "musket goblin should launch the musket ball projectile kind");
    assert.equal(projectile.launchType, "ballistic", "released cannonball should retain the tagged ballistic launch type");
    assert.ok(projectile.gravity > 0, "musket ball should use ballistic gravity rather than a straight-line shot");
    const startHealth = state.health.amount;
    stepMany(state, 180);
    assert.ok(state.health.amount < startHealth, `musket ball should eventually hit the player, before ${startHealth}, after ${state.health.amount}`);
    assert.ok(state.debug.lastEvents.some((event) => event.type === "ENEMY_PROJECTILE_FIRED" && event.projectileKind === "enemyMusketBall"), "musket shot should emit a firing event");
}

function testPlayerDamageInvulnerability() {
    const state = createInitialGameState({
        tuning: {
            playerDamageInvulnerabilitySeconds: 0.2,
            healthRegenDelay: 99
        }
    });
    const first = damagePlayer(state, 18, "first_hit");
    const blocked = damagePlayer(state, 18, "second_hit");
    assert.equal(first.damage, 18, "first damage source should apply fully");
    assert.equal(blocked.damage, 0, "immediate repeated damage should be blocked");
    approx(state.health.amount, 82, 0.001, "blocked damage should not reduce health");
    stepMany(state, Math.ceil(0.2 / FIXED_DT) + 1);
    const third = damagePlayer(state, 18, "third_hit");
    assert.equal(third.damage, 18, "damage should apply again after invulnerability expires");
    approx(state.health.amount, 64, 0.001, "post-invulnerability hit should reduce health");
}

function testDamagingAndKillableSurfaceHazards() {
    const state = createInitialGameState({
        tuning: {
            hazardContactDamage: 20,
            playerDamageInvulnerabilitySeconds: 0.4,
            healthRegenDelay: 99
        }
    });
    state.world.solids = [];
    state.world.collisionPolygons = [];
    state.world.segments = [{ id: "spike_line", kind: "damaging", x1: -100, y1: 600, x2: 100, y2: 600 }];
    state.player.x = 0;
    state.player.y = 600;
    state.player.spawnX = 0;
    state.player.spawnY = 600;
    state.player.onGround = true;
    state.player.wasOnGround = true;

    stepSimulation(state, createInputFrame(), FIXED_DT);
    approx(state.health.amount, 80, 0.001, "damaging collision line should hurt Ignatius");
    assert.ok(state.debug.lastEvents.some((event) => event.type === "PLAYER_HAZARD_CONTACT" && event.kind === "damaging"), "damaging contact should emit a hazard event");
    stepSimulation(state, createInputFrame(), FIXED_DT);
    approx(state.health.amount, 80, 0.001, "damage invulnerability should prevent per-tick hazard shredding");

    state.world.segments[0].kind = "killable";
    state.player.x = 0;
    state.player.y = 600;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.onGround = true;
    state.player.wasOnGround = true;
    stepSimulation(state, createInputFrame(), FIXED_DT);
    approx(state.health.amount, 0, 0.001, "killable collision line should defeat Ignatius even during ordinary invulnerability");
    assert.ok(state.debug.lastEvents.some((event) => event.type === "PLAYER_DEFEATED"), "lethal hazard should emit player defeat");
}

function testTerrainInterceptsRocketBeforeEnemy() {
    const state = createInitialGameState();
    applyEditorLevelToWorld(state, {
        levelId: "enemy_cover_test",
        playerStart: { x: -200, y: 600 },
        entities: [{
            id: "covered_guard",
            type: "characterEnemy",
            characterId: "ct_char_enemy_001",
            x: 210,
            y: 100,
            w: 72,
            h: 150,
            health: 100,
            behavior: "guard"
        }]
    });
    state.world.solids = [{ id: "cover_wall", kind: "wall", x: 90, y: -20, w: 20, h: 150 }];
    state.world.segments = [];
    state.world.collisionPolygons = [];
    state.story.portalIntro = null;
    state.story.portalExit = null;
    state.story.mailboxEvent = null;

    const enemy = state.enemies.find((item) => item.id === "covered_guard");
    const rocket = addTestRocket(state, { id: "cover_test", vx: 15000 });
    stepSimulation(state, createInputFrame(), FIXED_DT);

    assert.equal(rocket.state, "exploding", "rocket should explode on the nearer wall");
    assert.equal(enemy.health, 100, "terrain in front of an enemy should absorb the rocket");
    const impact = state.debug.lastEvents.findLast((event) => event.type === "ROCKET_IMPACTED");
    assert.equal(impact.reason, "cover_wall", "impact should identify the nearer terrain obstacle");
    assert.equal(impact.impactKind, "terrain", "impact event should classify terrain interception");
}

function testBreakableCrateReactiveObject() {
    const catalog = JSON.parse(readFileSync(new URL("../assets/it_entities_001.json", import.meta.url), "utf8"));
    const definition = catalog.entities.breakableCrate;
    const levelEditorSource = readFileSync(new URL("../level-editor.html", import.meta.url), "utf8");
    assert.ok(levelEditorSource.includes("reactive-settings-row"), "Level Editor should expose reactive-object tuning fields");
    assert.ok(levelEditorSource.includes("inspect-reactive-damaged-health"), "Level Editor should author the damaged-state threshold");

    const state = createInitialGameState();
    const entity = {
        id: "breakable_crate_test",
        type: definition.type,
        catalogId: catalog.catalogId,
        x: 100,
        y: 100,
        w: definition.defaultSize.w,
        h: definition.defaultSize.h,
        state: definition.defaultState,
        visualStates: Object.fromEntries(Object.entries(definition.states).map(([id, record]) => [id, record.visuals])),
        stateLabels: Object.fromEntries(Object.entries(definition.states).map(([id, record]) => [id, record.label || id])),
        ...structuredClone(definition.defaults)
    };
    assert.equal(applyEditorLevelToWorld(state, {
        levelId: "reactive_crate_test",
        world: { bounds: { x: -300, y: -200, w: 900, h: 700 }, resetY: 900 },
        playerStart: { x: -200, y: 600 },
        entities: [entity]
    }), true, "breakable crate level should apply");
    state.world.solids.push({ id: "wall_behind_crate", kind: "wall", x: 175, y: 0, w: 20, h: 130 });
    state.world.segments = [];
    state.world.collisionPolygons = [];
    state.story.portalIntro = null;
    state.story.portalExit = null;
    state.story.mailboxEvent = null;

    const object = state.reactiveObjects.find((item) => item.id === entity.id);
    assert.ok(object, "reactive object should be normalized into authoritative gameState");
    assert.equal(object.health, 60, "reactive object should begin at authored health");
    assert.ok(state.world.solids.some((solid) => solid.reactiveObjectId === object.id), "intact crate should contribute blocking player collision");
    assert.ok(state.world.visuals.some((visual) => visual.entityId === object.id && visual.entityState === "intact"), "intact visual should be active initially");

    const firstRocket = addTestRocket(state, { id: "crate_hit_1", x: 0, y: 60, vx: 12000, damage: 35 });
    stepSimulation(state, createInputFrame(), FIXED_DT);
    assert.equal(firstRocket.state, "exploding", "rocket should explode on the reactive object");
    assert.equal(object.health, 25, "rocket damage should reduce reactive-object health");
    assert.equal(object.state, "damaged", "crossing the threshold should select the damaged state");
    assert.ok(state.world.solids.some((solid) => solid.reactiveObjectId === object.id), "damaged crate should remain solid");
    assert.ok(state.world.visuals.some((visual) => visual.entityId === object.id && visual.entityState === "damaged"), "damaged state should refresh the entity visual");
    const firstImpact = state.debug.lastEvents.findLast((event) => event.type === "ROCKET_IMPACTED");
    assert.equal(firstImpact.impactKind, "reactiveObject", "reactive object should intercept the rocket before terrain behind it");
    assert.equal(firstImpact.reason, object.id, "rocket impact should identify the reactive object");

    state.projectiles = [];
    const smokeBeforeDestruction = state.effects.smokePuffs.length;
    const secondRocket = addTestRocket(state, { id: "crate_hit_2", x: 0, y: 60, vx: 12000, damage: 30 });
    stepSimulation(state, createInputFrame(), FIXED_DT);
    assert.equal(secondRocket.state, "exploding", "lethal rocket should still resolve against the crate");
    assert.equal(object.health, 0, "lethal damage should clamp reactive-object health to zero");
    assert.equal(object.state, "destroyed", "lethal damage should select the destroyed state");
    assert.equal(state.world.solids.some((solid) => solid.reactiveObjectId === object.id), false, "destroyed crate should remove its blocking collision");
    assert.equal(state.world.visuals.some((visual) => visual.entityId === object.id), false, "destroyed state with no visuals should remove the crate artwork");
    assert.ok(state.effects.smokePuffs.length > smokeBeforeDestruction, "destruction should add a smoke-heavy feedback burst");
    assert.ok(state.debug.lastEvents.some((event) => event.type === "REACTIVE_OBJECT_DESTROYED" && event.objectId === object.id), "destruction should emit an authoritative event");

    const restored = restoreGameState(serializeGameState(state));
    assert.equal(restored.reactiveObjects[0].state, "destroyed", "reactive-object state should survive serialization");
    assert.equal(restored.reactiveObjects[0].health, 0, "reactive-object health should survive serialization");
    assert.equal(restored.world.solids.some((solid) => solid.reactiveObjectId === object.id), false, "serialized destroyed state should keep collision removed");
}

function testEditorDropdownContrast() {
    const editorFiles = [
        "../character-editor.html",
        "../level-editor.html",
        "../asset-editor.html"
    ];
    for (const filename of editorFiles) {
        const html = readFileSync(new URL(filename, import.meta.url), "utf8");
        assert.ok(html.includes("<select"), `${filename} should contain dropdown controls`);
        assert.ok(html.includes("color-scheme: dark"), `${filename} should request dark native controls`);
        assert.ok(html.includes("select option"), `${filename} should explicitly style opened dropdown items`);
        assert.ok(html.includes("select optgroup"), `${filename} should explicitly style dropdown groups`);
        assert.ok(html.includes("option:checked"), `${filename} should provide a readable selected-option treatment`);
    }
}

function testCharacterProjectWorkspace() {
    assert.equal(normalizeCharacterSlug("  Brass Bat!  "), "brass_bat", "character names should become stable file slugs");
    const project = createBlankCharacterProject("Brass Bat");
    assert.equal(project.filenames.character, "ct_char_brass_bat_1.json", "blank project should use consistent character filenames");
    assert.equal(project.character.rig, project.filenames.rig, "blank character should reference its generated rig");
    assert.equal(project.rig.atlasManifest, project.filenames.atlas, "blank rig should reference its generated atlas manifest");
    assert.equal(project.atlas.image, project.filenames.image, "blank atlas should reference its generated PNG name");
    assert.equal(project.character.animationMap.idle, project.filenames.animation, "blank character should map an editable idle animation");
    assert.equal(normalizeAnimationSlot(" Heavy Slash! "), "heavy_slash", "animation slots should become stable identifiers");
    assert.equal(
        animationFilenameForCharacterSlot(project.character, "Heavy Slash"),
        "ct_anim_brass_bat_1_heavy_slash.json",
        "duplicated animation filenames should derive from the character ID and slot"
    );
    normalizeAnimationClip(project.animations.idle, "blank project idle");

    assert.equal(classifyCharacterProjectJson(project.character), CHARACTER_PROJECT_FILE_KIND.CHARACTER, "character JSON should classify correctly");
    assert.equal(classifyCharacterProjectJson(project.rig), CHARACTER_PROJECT_FILE_KIND.RIG, "rig JSON should classify correctly");
    assert.equal(classifyCharacterProjectJson(project.atlas), CHARACTER_PROJECT_FILE_KIND.ATLAS, "atlas JSON should classify correctly");
    assert.equal(classifyCharacterProjectJson(project.animations.idle), CHARACTER_PROJECT_FILE_KIND.ANIMATION, "animation JSON should classify correctly");

    const inventory = inventoryCharacterProjectJson([
        { name: project.filenames.character, data: project.character },
        { name: project.filenames.rig, data: project.rig },
        { name: project.filenames.atlas, data: project.atlas },
        { name: project.filenames.animation, data: project.animations.idle }
    ]);
    assert.equal(inventory.character.length, 1, "workspace inventory should find one character definition");
    assert.equal(inventory.animation.length, 1, "workspace inventory should find one animation");

    const available = [
        `characters/brass/${project.filenames.character}`,
        `characters/brass/${project.filenames.rig}`,
        `characters/brass/${project.filenames.atlas}`
    ];
    assert.equal(
        resolveCharacterProjectReference(available[0], project.character.rig, available),
        available[1],
        "relative project references should resolve inside a selected folder"
    );
    assert.equal(
        resolveCharacterProjectReference("unrelated/location.json", project.character.rig, available),
        available[1],
        "a unique basename should provide the portable multi-file fallback"
    );

    const toolHtml = readFileSync(new URL("../character-editor.html", import.meta.url), "utf8");
    assert.ok(toolHtml.includes("Character project"), "character tool should expose project selection");
    assert.ok(toolHtml.includes("New character"), "character tool should expose blank project creation");
    assert.ok(toolHtml.includes("project-directory"), "character tool should expose directory selection where supported");
    assert.ok(toolHtml.includes("atlas-image-file"), "character tool should expose an explicit atlas PNG picker");
    assert.ok(toolHtml.includes("Character JSON"), "character tool should expose character-definition editing and export");
    assert.ok(toolHtml.includes("Atlas JSON"), "character tool should expose atlas-manifest editing and export");
    assert.ok(toolHtml.includes("Atlas parts"), "character tool should expose atlas rectangle authoring mode");
    assert.ok(toolHtml.includes("Add selected to rig"), "character tool should expose atlas-frame to rig assignment");
    assert.ok(toolHtml.includes("Enemy 001: Skeleton Guard"), "character tool should expose enemy_001 as a known project");
    assert.ok(toolHtml.includes("Enemy 002: Fireball Goblin"), "character tool should expose the Fireball Goblin as a known project");
    assert.ok(toolHtml.includes("Enemy 003: Musket Goblin"), "character tool should expose the Musket Goblin as a known project");
    assert.ok(toolHtml.includes('enemy_001: "assets/ct_char_enemy_001.json"'), "known enemy_001 project should use the numbered enemy filename convention");
    assert.ok(toolHtml.includes('enemy_002: "assets/ct_char_enemy_002.json"'), "known enemy_002 project should resolve to its character definition");
    assert.ok(toolHtml.includes('enemy_003: "assets/ct_char_enemy_003.json"'), "known enemy_003 project should resolve to its character definition");
    assert.ok(toolHtml.includes("applyCharacterRigOverrides(loadedRig, state.character)"), "character tool should apply character-level goblin part overrides while loading known projects");
    assert.ok(toolHtml.includes('id="apply-preview-alpha"'), "character tool should expose an animation-preview alpha toggle");
    assert.ok(toolHtml.includes('id="projectile-enabled"') && toolHtml.includes('id="projectile-release-time"'), "character tool should expose projectile tagging and explicit release-time controls");
    assert.ok(toolHtml.includes('id="projectile-active-character"'), "character tool should select which shared-rig projectile belongs to the current character variant");
    assert.ok(toolHtml.includes('value="ballistic"') && toolHtml.includes('value="homing_lo"'), "projectile editor should expose ballistic and low-homing launch types");
    assert.ok(toolHtml.includes("projectilePartFinalKeyTime") && toolHtml.includes("Final keyed time"), "projectile editor should show the selected part's final keyed time as a reference");
    assert.ok(toolHtml.includes("selected part is fully opaque") && toolHtml.includes("ghosted between 10% and 50%"), "character tool should explain selected and unselected alpha-preview behaviour");
    assert.ok(toolHtml.includes("clamp(effectiveAlpha, 0.1, 0.5)"), "alpha-off preview should cap unselected parts between ten and fifty percent opacity");
    assert.ok(toolHtml.includes('id="quick-toolbar"') && toolHtml.includes('id="quick-select"') && toolHtml.includes('id="quick-adjust"'), "character tool should expose Select and Adjust shortcuts above the canvas");
    assert.ok(toolHtml.includes('id="quick-visibility"') && toolHtml.includes('id="quick-to-back"') && toolHtml.includes('id="quick-to-front"'), "character toolbar should expose visibility and draw-order shortcuts");
    assert.ok(toolHtml.includes('id="animation-dock"') && toolHtml.includes('class="dock-playhead"'), "character tool should expose the wide bottom animation dock");
    assert.ok(toolHtml.includes('id="track-step-back"') && toolHtml.includes('&lt;--') && toolHtml.includes('&lt;-') && toolHtml.includes('PLAY/PAUSE') && toolHtml.includes('-&gt;') && toolHtml.includes('--&gt;'), "animation dock should expose global and track-specific keyframe navigation buttons");
    assert.ok(toolHtml.includes("beginTransformKeyDrag") && toolHtml.includes("dragTransformKey"), "bottom timeline should support dragging grouped transform key times");
    assert.ok(toolHtml.includes("event.button !== 2") && toolHtml.includes('contextmenu'), "right-button dragging should pan the character and atlas preview without opening a context menu");
    assert.ok(toolHtml.includes("GROUND · y = 0 · drag label") && toolHtml.includes("beginGroundGuideDrag") && toolHtml.includes("drawGroundGuide"), "character tool should show a draggable view-only runtime-ground guide");
    assert.ok(toolHtml.includes("PANEL_STORAGE_KEY") && toolHtml.includes("setupCollapsiblePanels") && toolHtml.includes("localStorage.setItem"), "right-side panels should collapse and remember their state in local storage");
    assert.ok(toolHtml.includes("selectPartFromCanvas") && toolHtml.includes('setAnimationTool("adjust")'), "canvas Select mode should choose a rig box and return to Adjust mode");
    assert.ok(toolHtml.includes("toggleSelectedPartVisibility"), "quick toolbar should author visible/hidden alpha keys");
    assert.ok(toolHtml.includes("Unsaved change status"), "character tool should expose independent dirty-state status");
    assert.ok(toolHtml.includes("part-to-back"), "character tool should expose a selected-part To Back control");
    assert.ok(toolHtml.includes("part-to-front"), "character tool should expose a selected-part To Front control");

    const levelEditorHtml = readFileSync(new URL("../level-editor.html", import.meta.url), "utf8");
    assert.ok(levelEditorHtml.includes("const placement = placeAsset(point);"), "level editor should inspect whether asset placement succeeded");
    assert.ok(levelEditorHtml.includes('setTool("select");'), "successful asset placement should return the level editor to Select mode");
    assert.ok(levelEditorHtml.includes("Select tool active for fine-tuning"), "level editor should explain the automatic tool switch");
    assert.ok(levelEditorHtml.includes('id="copy-asset"'), "level editor should expose Copy asset beside placement tools");
    assert.ok(levelEditorHtml.includes("duplicateLevelPlacement(source"), "Copy asset should preserve the selected placement through the shared duplication helper");
    assert.ok(levelEditorHtml.includes("snapWizardDoorToNearbyGround"), "level editor should snap wizard entry/exit doors to nearby authored collision lines");
    assert.ok(levelEditorHtml.includes("wizard_entry_door") && levelEditorHtml.includes("wizard_exit_door"), "level editor should expose dedicated entry and exit door types");
    assert.ok(!levelEditorHtml.includes('data-entity="wizardStart"'), "the retired wizard-start entity should not remain in the palette");
    assert.ok(!levelEditorHtml.includes('globalCompositeOperation = "destination-out"'), "editor cutout masks should not erase the canvas alpha");
    const rendererSource = readFileSync(new URL("../src/presentation/canvas-renderer.js", import.meta.url), "utf8");
    assert.ok(rendererSource.includes("ctx.fillStyle = LEVEL_BACKGROUND_COLOR"), "runtime cutout masks should repaint the shared cave backing");
    assert.ok(!rendererSource.includes('globalCompositeOperation = "destination-out"'), "runtime cutout masks should not erase canvas alpha");

    const frame = { x: 10, y: 20, w: 80, h: 120 };
    const { partName, removedParts } = addAtlasFrameToRig(project.rig, "leftArm", frame);
    assert.equal(partName, "leftArm", "frame assignment should use the frame ID as the initial rig-part ID");
    assert.deepEqual(removedParts, ["root"], "the first real rig part should remove the blank placeholder");
    assert.equal(project.rig.parts.leftArm.frame, "leftArm", "new rig parts should reference the selected atlas frame");
    assert.equal(project.rig.parts.leftArm.targetHeight, 120, "new rig parts should begin at the frame's source height");
    addRigPartToAnimation(project.animations.idle, partName, removedParts);
    assert.equal(project.animations.idle.referencePose.root, undefined, "animation synchronization should remove the placeholder pose");
    assert.equal(project.animations.idle.referencePose.leftArm.scale, 1, "animation synchronization should add a complete default transform");
    normalizeAnimationClip(project.animations.idle, "rig-synchronized blank project idle");

    project.rig.drawOrder.push("torso", "head");
    project.rig.parts.torso = { frame: "torso" };
    project.rig.parts.head = { frame: "head" };
    project.rig.pivots.torso = { x: 0.5, y: 0.5 };
    project.rig.pivots.head = { x: 0.5, y: 0.5 };
    assert.equal(moveRigPartToFront(project.rig, "leftArm"), true, "To Front should report a changed draw order");
    assert.deepEqual(project.rig.drawOrder, ["torso", "head", "leftArm"], "To Front should make the selected part draw last");
    assert.equal(moveRigPartToBack(project.rig, "leftArm"), true, "To Back should report a changed draw order");
    assert.deepEqual(project.rig.drawOrder, ["leftArm", "torso", "head"], "To Back should make the selected part draw first");
    assert.equal(moveRigPartToBack(project.rig, "leftArm"), false, "moving an already rear-most part should be a no-op");
}

function testSelectiveLevelColorMap() {
    const colorMap = normalizeLevelColorMap({
        enabled: true,
        sourceHue: 0,
        range: 30,
        feather: 15,
        rotation: 120
    });
    assert.equal(colorMapCacheKey(colorMap), "1:0:30:15:120", "colour-map settings should produce a stable cache key");
    assert.equal(selectiveHueWeight(0, colorMap), 1, "the selected hue centre should receive the full rotation");
    assert.equal(selectiveHueWeight(180, colorMap), 0, "distant hues should remain untouched");

    const rotatedRed = remapRgb(255, 0, 0, colorMap);
    assert.ok(rotatedRed[1] >= 250 && rotatedRed[0] <= 5 && rotatedRed[2] <= 5, `red should rotate to green, got ${rotatedRed}`);
    assert.deepEqual(remapRgb(0, 0, 255, colorMap), [0, 0, 255], "blue outside the selected range should remain blue");
    assert.deepEqual(remapRgb(128, 128, 128, colorMap), [128, 128, 128], "neutral greys should remain unchanged");

    const levelEditorHtml = readFileSync(new URL("../level-editor.html", import.meta.url), "utf8");
    assert.ok(levelEditorHtml.includes('id="color-map-enabled"'), "level editor should expose the level colour-map panel");
    assert.ok(levelEditorHtml.includes("createColorMappedCanvas"), "level editor should build cached recoloured atlases");
    const rendererSource = readFileSync(new URL("../src/presentation/canvas-renderer.js", import.meta.url), "utf8");
    assert.ok(rendererSource.includes("environmentColorMapKey"), "runtime should track the active atlas colour cache key");
    assert.ok(rendererSource.includes("atlas.renderImage = createColorMappedCanvas"), "runtime should rebuild atlas caches only when settings change");
    const gameSource = readFileSync(new URL("../src/browser/game-bootstrap.js", import.meta.url), "utf8");
    assert.ok(gameSource.includes("renderer.syncEnvironmentColorMap(gameState.world.colorMap)"), "runtime should build the colour cache during level startup");
    assert.ok(!rendererSource.includes("this.syncEnvironmentColorMap(state.world?.colorMap)"), "normal render frames should not rebuild or rescan colour caches");
}

function testLevelPlacementCopy() {
    assert.equal(LEVEL_BACKGROUND_COLOR, "rgb(6, 6, 12)", "cutout masks should reveal the shared deep-blue cave backing");
    const original = {
        id: "ledge_004",
        kind: "atlasAsset",
        atlasId: "at_atlas_002",
        assetId: "ledge",
        x: 320,
        y: 480,
        w: 222,
        h: 91,
        mirrorX: true,
        mirrorY: true,
        rotation: 0.73,
        layer: "decorFront",
        collisionFromManifest: true,
        notes: "keep me"
    };
    const copy = duplicateLevelPlacement(original, { id: "ledge_005", dx: 24, dy: -24 });
    assert.notEqual(copy, original, "copy should be a distinct placement object");
    assert.equal(copy.id, "ledge_005", "copy should receive its own identifier");
    assert.equal(copy.x, 344, "copy should move slightly right");
    assert.equal(copy.y, 456, "copy should move slightly up");
    assert.equal(copy.w, original.w, "copy should preserve width");
    assert.equal(copy.h, original.h, "copy should preserve height");
    assert.equal(copy.mirrorX, true, "copy should preserve horizontal mirroring");
    assert.equal(copy.mirrorY, true, "copy should preserve vertical mirroring");
    assert.equal(copy.rotation, original.rotation, "copy should preserve rotation");
    assert.equal(copy.layer, original.layer, "copy should preserve layer");
    assert.equal(copy.collisionFromManifest, original.collisionFromManifest, "copy should preserve collision settings");
    assert.equal(original.id, "ledge_004", "copying should not mutate the source placement");
}

function testLevelPlacementTransforms() {
    const placement = {
        x: 100,
        y: 200,
        w: 80,
        h: 40,
        rotation: Math.PI / 2,
        mirrorX: true,
        mirrorY: true
    };
    assert.deepEqual(placementCenter(placement), { x: 140, y: 220 }, "placement center should use the unrotated box center");
    const corners = placementCorners(placement);
    approx(corners[0].x, 160, 0.000001, "rotated top-left x");
    approx(corners[0].y, 180, 0.000001, "rotated top-left y");
    assert.equal(pointInPlacement({ x: 140, y: 220 }, placement), true, "center should hit a rotated placement");
    assert.equal(pointInPlacement({ x: 100, y: 200 }, placement), false, "old unrotated corner should not necessarily hit after rotation");
    const local = worldToPlacementLocal(placement, 140, 220);
    approx(local.x, 40, 0.000001, "center inverse local x");
    approx(local.y, 20, 0.000001, "center inverse local y");
    const node = atlasNodeToPlacementWorld(placement, { w: 100, h: 50 }, { x: 10, y: 5 });
    approx(node.x, 124, 0.000001, "mirrored and rotated atlas node x");
    approx(node.y, 252, 0.000001, "mirrored and rotated atlas node y");
}

function testEditorLevelTransformRuntime() {
    const state = createInitialGameState();
    const level = {
        levelId: "transform_test",
        world: { bounds: { x: 0, y: 0, w: 800, h: 600 }, resetY: 900 },
        playerStart: { x: 20, y: 100 },
        atlasRefs: [{ atlasId: "test_atlas", manifest: "assets/test_atlas.json", image: "assets/test_atlas.png" }],
        colorMap: { enabled: true, sourceHue: 210, range: 70, feather: 20, rotation: 45 },
        placements: [{
            id: "rotated_asset",
            kind: "atlasAsset",
            atlasId: "test_atlas",
            assetId: "beam",
            x: 100,
            y: 200,
            w: 80,
            h: 40,
            mirrorX: false,
            mirrorY: true,
            rotation: Math.PI / 2,
            layer: "terrain",
            collisionFromManifest: true
        }],
        entities: []
    };
    assert.equal(applyEditorLevelToWorld(state, level), true, "transformed level should apply");
    const visual = state.world.visuals.find((item) => item.id === "rotated_asset");
    assert.equal(visual.mirrorY, true, "vertical mirror should survive level loading");
    assert.equal(state.world.colorMap.enabled, true, "level colour-map settings should survive level loading");
    assert.equal(state.world.colorMap.rotation, 45, "level hue rotation should survive level loading");
    approx(visual.rotation, Math.PI / 2, 0.000001, "rotation should survive level loading");
    const manifest = {
        frames: { beam: { x: 0, y: 0, w: 100, h: 50 } },
        objects: {
            beam: {
                nodes: [{ id: "a", x: 0, y: 0 }, { id: "b", x: 100, y: 0 }],
                lines: [{ id: "top", from: "a", to: "b", kind: "blockable" }]
            }
        }
    };
    assert.equal(applyAtlasManifestsToWorld(state, new Map([["test_atlas", { manifest }]])), true, "transformed collision should apply");
    const segment = state.world.segments.find((item) => item.visualId === "rotated_asset");
    approx(segment.x1, 120, 0.000001, "rotated collision x1");
    approx(segment.y1, 180, 0.000001, "rotated collision y1");
    approx(segment.x2, 120, 0.000001, "rotated collision x2");
    approx(segment.y2, 260, 0.000001, "rotated collision y2");
}

function testPlayerStartSnapsToNearbyGround() {
    const manifest = {
        frames: { platform: { x: 0, y: 0, w: 200, h: 40 } },
        objects: {
            platform: {
                nodes: [{ id: "a", x: 0, y: 0 }, { id: "b", x: 200, y: 0 }],
                lines: [{ id: "top", from: "a", to: "b", kind: "blockable" }]
            }
        }
    };
    const nearbyLevel = {
        levelId: "nearby_ground_snap",
        world: { bounds: { x: -200, y: -200, w: 800, h: 800 }, resetY: 900 },
        playerStart: { x: 100, y: 100 },
        atlasRefs: [],
        placements: [{
            id: "platform_001",
            kind: "atlasAsset",
            atlasId: "test_atlas",
            assetId: "platform",
            x: 0,
            y: 106,
            w: 200,
            h: 40,
            collisionFromManifest: true
        }],
        entities: []
    };
    const nearby = createInitialGameState();
    assert.equal(applyEditorLevelToWorld(nearby, nearbyLevel), true, "nearby-ground level should apply");
    assert.equal(applyAtlasManifestsToWorld(nearby, new Map([["test_atlas", { manifest }]])), true, "nearby platform collision should apply");
    approx(nearby.world.start.y, 106, 0.000001, "playerStart should snap down to nearby support");
    approx(nearby.player.y, 106, 0.000001, "runtime player should use snapped start height");
    approx(nearby.player.spawnY, 106, 0.000001, "respawn height should use snapped start height");
    assert.equal(nearby.player.onGround, true, "snapped player should begin grounded");
    assert.ok(nearby.debug.lastEvents.some((event) => event.type === "PLAYER_START_SNAPPED_TO_GROUND"), "ground snap should be visible in debug events");

    const distantLevel = structuredClone(nearbyLevel);
    distantLevel.levelId = "distant_ground_no_snap";
    distantLevel.placements[0].y = 180;
    const distant = createInitialGameState();
    applyEditorLevelToWorld(distant, distantLevel);
    applyAtlasManifestsToWorld(distant, new Map([["test_atlas", { manifest }]]));
    approx(distant.world.start.y, 100, 0.000001, "ground farther than half a wizard height should not move playerStart");
}

function testInteractiveItemAtlasAndEntityVisuals() {
    const atlas = JSON.parse(readFileSync(new URL("../assets/it_atlas_001.json", import.meta.url), "utf8"));
    const catalog = JSON.parse(readFileSync(new URL("../assets/it_entities_001.json", import.meta.url), "utf8"));
    assert.equal(atlas.atlasId, "it_atlas_001", "interactive atlas should use its dedicated atlas id");
    assert.equal(atlas.image, "it_atlas_001.png", "interactive atlas should reference the user-supplied PNG name");
    assert.equal(Object.keys(atlas.frames).length, 42, "interactive atlas should expose all authored item frames");
    assert.ok(atlas.frames.mailbox_with_letter && atlas.frames.portal_foreground && atlas.frames.letter_scroll, "story-item frames should be present");
    assert.ok(catalog.entities.mailbox && catalog.entities.treasureChest && catalog.entities.wizard_entry_door && catalog.entities.wizard_exit_door, "catalog should define mailboxes plus dedicated wizard entry/exit doors");
    assert.ok(catalog.entities.breakableCrate, "interactive catalog should expose the first reactive destructible object");
    assert.deepEqual(Object.keys(catalog.entities.breakableCrate.states), ["intact", "damaged", "destroyed"], "breakable crate should author explicit intact, damaged, and destroyed visuals");
    assert.equal(catalog.entities.wizard_exit_door.defaults.mirrorX, true, "exit doorway should be mirrored by default");
    assert.deepEqual(catalog.entities.wizard_entry_door.defaultSize, { w: 75, h: 98.5 }, "new entry doors should use the half-size doorway dimensions");
    assert.deepEqual(catalog.entities.wizard_exit_door.defaultSize, { w: 75, h: 98.5 }, "new exit doors should use the half-size doorway dimensions");
    approx(catalog.entities.wizard_entry_door.defaults.floorAnchorYFactor, 239 / 263, 0.0000001, "door floors should align to the bottom of the meeting door leaves rather than the sprite bottom");
    approx(catalog.entities.wizard_entry_door.defaults.wizardInsideScale, 0.84, 0.0000001, "door transitions should use a slightly reduced inside-wizard scale");
    const openPortal = catalog.entities.wizard_entry_door.states.open.visuals;
    assert.equal(openPortal.length, 2, "open portal should use background and foreground visuals");
    assert.equal(openPortal[1].layer, "actorFront", "portal foreground should render after the player");
    assert.deepEqual(atlas.frames.mailbox_with_letter, { x: 24, y: 0, w: 185, h: 265 }, "letter mailbox frame should match the revised pixel-aligned atlas");
    assert.deepEqual(atlas.frames.mailbox_empty, { x: 269, y: 0, w: 185, h: 265 }, "empty mailbox frame should share the same pixel dimensions");
    assert.deepEqual(atlas.frames.portal_closed, { x: 28, y: 289, w: 183, h: 263 }, "closed portal frame should match the revised atlas");
    assert.deepEqual(atlas.frames.portal_open, { x: 352, y: 290, w: 208, h: 263 }, "open portal frame should match the revised atlas");
    assert.deepEqual(atlas.frames.portal_foreground, { x: 223, y: 291, w: 114, h: 263 }, "foreground portal frame should match the revised atlas");
    approx(openPortal[0].widthFactor, 208 / 183, 0.0000001, "open portal should preserve source-pixel scale");
    approx(openPortal[0].offsetXFactor, 25 / 366, 0.0000001, "open portal should keep its left edge aligned");
    approx(openPortal[1].widthFactor, 114 / 183, 0.0000001, "foreground portal should preserve source-pixel scale");
    approx(openPortal[1].offsetXFactor, -69 / 366, 0.0000001, "foreground portal should keep its left edge aligned");

    const levelOne = JSON.parse(readFileSync(new URL("../assets/level_001.json", import.meta.url), "utf8"));
    const levelEntryDoor = levelOne.entities.find((entity) => entity.type === "wizard_entry_door");
    const levelExitDoor = levelOne.entities.find((entity) => entity.type === "wizard_exit_door");
    assert.deepEqual({ w: levelEntryDoor.w, h: levelEntryDoor.h }, { w: 125, h: 164 }, "level_001 entry doorway should be half its revision-087 size");
    assert.deepEqual({ w: levelExitDoor.w, h: levelExitDoor.h }, { w: 125, h: 164 }, "level_001 exit doorway should be half its revision-087 size");

    const state = createInitialGameState();
    const mailboxDef = catalog.entities.mailbox;
    const fuelDef = catalog.entities.fuel;
    const targetDef = catalog.entities.targetDummy;
    const level = {
        levelId: "interactive_items_test",
        world: { bounds: { x: 0, y: 0, w: 1000, h: 700 }, resetY: 900 },
        playerStart: { x: 80, y: 500 },
        atlasRefs: catalog.atlasRefs,
        placements: [],
        entities: [
            {
                id: "mailbox_test",
                type: "mailbox",
                x: 200,
                y: 500,
                w: mailboxDef.defaultSize.w,
                h: mailboxDef.defaultSize.h,
                state: mailboxDef.defaultState,
                visualStates: Object.fromEntries(Object.entries(mailboxDef.states).map(([id, def]) => [id, def.visuals]))
            },
            {
                id: "fuel_test",
                type: "fuel",
                x: 400,
                y: 360,
                w: fuelDef.defaultSize.w,
                h: fuelDef.defaultSize.h,
                radius: fuelDef.defaults.radius,
                amount: fuelDef.defaults.amount,
                state: fuelDef.defaultState,
                visualStates: Object.fromEntries(Object.entries(fuelDef.states).map(([id, def]) => [id, def.visuals]))
            },
            {
                id: "target_test",
                type: "targetDummy",
                x: 600,
                y: 500,
                w: targetDef.defaultSize.w,
                h: targetDef.defaultSize.h,
                health: targetDef.defaults.health,
                targetAnchor: targetDef.defaults.targetAnchor,
                targetRadius: targetDef.defaults.targetRadius,
                showTargetMarker: targetDef.defaults.showTargetMarker,
                state: targetDef.defaultState,
                visualStates: Object.fromEntries(Object.entries(targetDef.states).map(([id, def]) => [id, def.visuals]))
            }
        ]
    };
    assert.equal(applyEditorLevelToWorld(state, level), true, "interactive item entities should apply to the runtime world");
    assert.ok(state.world.visuals.some((visual) => visual.entityId === "mailbox_test" && visual.assetId === "mailbox_with_letter"), "mailbox state should become an atlas visual");
    assert.ok(state.world.visuals.some((visual) => visual.entityId === "fuel_test" && visual.assetId === "rocket_fuel_canister"), "fuel should become an atlas visual");
    assert.equal(state.pickups[0].visualized, true, "atlas-backed fuel should suppress the old debug-circle rendering");
    assert.equal(state.enemies[0].visualized, true, "atlas-backed target dummy should be recognized as artwork-backed");
    approx(state.targets[0].x, 600, 0.000001, "target dummy homing point should be centered on the bullseye");
    approx(state.targets[0].y, 500 - targetDef.defaultSize.h * 0.5, 0.000001, "target dummy homing point should use the belly bullseye height");
    assert.equal(state.targets[0].showMarker, false, "artwork-backed target dummy should suppress the old dot and pulse marker");
}


function testMailboxLetterSequence() {
    const catalog = JSON.parse(readFileSync(new URL("../assets/it_entities_001.json", import.meta.url), "utf8"));
    const mailboxDef = catalog.entities.mailbox;
    const state = createInitialGameState();
    const level = {
        levelId: "mailbox_story_test",
        world: { bounds: { x: -200, y: -200, w: 1000, h: 900 }, resetY: 1000 },
        playerStart: { x: 192, y: 500 },
        atlasRefs: catalog.atlasRefs,
        placements: [],
        entities: [{
            id: "mailbox_story",
            type: "mailbox",
            x: 256,
            y: 500,
            w: 55,
            h: 80,
            state: mailboxDef.defaultState,
            visualStates: Object.fromEntries(Object.entries(mailboxDef.states).map(([id, def]) => [id, def.visuals])),
            ...structuredClone(mailboxDef.defaults)
        }]
    };

    assert.equal(applyEditorLevelToWorld(state, level), true, "mailbox story level should apply");
    assert.equal(state.story.mailboxEvent, null, "no mailbox should be active before proximity");
    assert.equal(state.story.mailboxEvents.length, 1, "each mailbox should receive its own runtime story record");
    assert.equal(state.story.mailboxEvents[0].phase, "armed", "mailbox story should wait for proximity");
    assert.equal(state.story.mailboxEvents[0].letterDuration, 14, "mailbox letters should use the slower readable default duration");
    assert.equal(state.story.mailboxEvents[0].thoughtDuration, 9, "mailbox thoughts should use the slower readable default duration");
    assert.ok(state.world.visuals.some((visual) => visual.entityId === "mailbox_story" && visual.assetId === "mailbox_with_letter"), "mailbox should initially show the letter state");

    stepSimulation(state, createInputFrame({ moveRight: true, weaponPressed: true }), FIXED_DT);
    assert.equal(state.story.mailboxEvent.phase, "letter", "approaching the mailbox should open the letter");
    assert.equal(state.world.entityStates.mailbox_story, "empty", "mailbox should switch to its empty artwork immediately");
    assert.ok(state.world.visuals.some((visual) => visual.entityId === "mailbox_story" && visual.assetId === "mailbox_empty"), "empty mailbox visual should replace the letter state");
    approx(state.player.x, 192, 0.000001, "mailbox story should lock movement");
    assert.equal(state.projectiles.length, 0, "mailbox story should suppress weapon input");

    assert.ok(state.story.mailboxEvent.thoughtText.includes("How kind of him!"), "mailbox story should preserve Ignatius's single thought text");
    assert.ok(state.story.mailboxEvent.thoughtText.includes("brochures"), "the single thought should retain the full response");
    assert.equal("thoughts" in state.story.mailboxEvent, false, "runtime mailbox state should no longer split thoughts into multiple bubbles");
    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    assert.equal(state.story.mailboxEvent.phase, "thought", "jump should advance from the letter to the thought");
    stepSimulation(state, createInputFrame({ jumpHeld: false }), FIXED_DT);
    assert.equal(state.story.mailboxEvent.phase, "thought", "releasing jump should not close the thought automatically");
    stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
    assert.equal(state.story.mailboxEvent, null, "closing the thought should clear the active mailbox pointer");
    assert.equal(state.story.mailboxEvents[0].completed, true, "mailbox event should complete only once");
    assert.ok(state.debug.lastEvents.some((event) => event.type === "MAILBOX_EVENT_COMPLETE"), "mailbox sequence should emit a completion event");

    stepMany(state, 5, () => createInputFrame({ moveRight: true }));
    assert.ok(state.player.vx > 0, "control should return after the mailbox sequence");
}

function testPortalEntranceSequence() {
    const catalog = JSON.parse(readFileSync(new URL("../assets/it_entities_001.json", import.meta.url), "utf8"));
    const portalDef = catalog.entities.wizard_entry_door;
    const visualStates = Object.fromEntries(Object.entries(portalDef.states).map(([id, def]) => [id, def.visuals]));
    const state = createInitialGameState();
    const level = {
        levelId: "portal_intro_test",
        world: { bounds: { x: -300, y: -300, w: 1400, h: 1000 }, resetY: 900 },
        atlasRefs: catalog.atlasRefs,
        placements: [],
        entities: [{
            id: "entrance_test",
            type: "wizard_entry_door",
            x: 0,
            y: 520,
            w: 250,
            h: 328,
            state: "closed",
            visualStates,
            portalRole: "entrance",
            emergeDistance: 160,
            walkDirection: 1,
            walkSpeed: 120,
            closedDuration: 0.1,
            openDuration: 0.1,
            clearDuration: 0.1,
            closeDuration: 0.1
        }]
    };

    assert.equal(applyEditorLevelToWorld(state, level), true, "portal intro level should apply");
    state.world.solids.push({ id: "portal_test_floor", kind: "floor", x: -500, y: 520, w: 2000, h: 100 });
    assert.equal(state.player.visible, false, "wizard should be hidden behind the initially closed portal");
    approx(state.player.renderScale, 0.84, 0.000001, "wizard should begin the doorway sequence at the reduced inside scale");
    assert.equal(state.world.entityStates.entrance_test, "closed", "portal should begin closed");
    const closedVisual = state.world.visuals.find((visual) => visual.entityId === "entrance_test" && visual.assetId === "portal_closed");
    assert.ok(closedVisual, "closed portal visual should be active first");
    approx(closedVisual.y, 520 - 328 * (239 / 263), 0.000001, "door artwork should place its leaf threshold on the authored floor line");

    stepMany(state, 20, () => createInputFrame({ moveRight: true, jumpPressed: true, jumpHeld: true }));
    assert.equal(state.world.entityStates.entrance_test, "open", "portal should open before the wizard emerges");
    assert.ok(state.world.visuals.some((visual) => visual.entityId === "entrance_test" && visual.layer === "actorFront"), "open portal should add its foreground masking layer");
    assert.equal(state.projectiles.length, 0, "player input should remain locked during the entrance sequence");
    assert.ok(state.player.renderScale > 0.84 && state.player.renderScale < 1, "wizard should scale toward full height while walking out");

    stepMany(state, 180, () => createInputFrame());
    assert.equal(state.story.portalIntro.active, false, "entrance sequence should finish");
    assert.equal(state.player.visible, true, "wizard should be visible after walking out");
    approx(state.player.renderScale, 1, 0.000001, "wizard should finish the entrance at full scale");
    approx(state.player.x, 160, 0.001, "wizard should finish at the entry door's authored emergence distance");
    approx(state.player.y, 520, 0.001, "wizard should finish on the entry door baseline");
    assert.equal(state.world.entityStates.entrance_test, "closed", "portal should close after the wizard clears it");
    assert.ok(state.debug.lastEvents.some((event) => event.type === "PORTAL_INTRO_COMPLETE"), "sequence should emit a completion event");

    assert.equal(setWorldEntityState(state, "entrance_test", "open"), true, "runtime entity state helper should reopen the portal");
    assert.ok(state.world.visuals.some((visual) => visual.entityId === "entrance_test" && visual.assetId === "portal_open"), "state helper should rebuild the entity visuals");
}

function testPortalExitSequence() {
    const catalog = JSON.parse(readFileSync(new URL("../assets/it_entities_001.json", import.meta.url), "utf8"));
    const def = catalog.entities.wizard_exit_door;
    const visualStates = Object.fromEntries(Object.entries(def.states).map(([id, stateDef]) => [id, stateDef.visuals]));
    const state = createInitialGameState();
    const level = {
        levelId: "level_009",
        world: { bounds: { x: -200, y: -200, w: 1200, h: 900 }, resetY: 1000 },
        playerStart: { x: 300, y: 520 },
        atlasRefs: catalog.atlasRefs,
        placements: [],
        entities: [{
            id: "exit_test",
            type: "wizard_exit_door",
            x: 330,
            y: 520,
            w: 250,
            h: 328,
            state: "closed",
            visualStates,
            mirrorX: true,
            portalRole: "exit",
            walkDirection: 1,
            triggerDistance: 80,
            destinationLevel: "level_012",
            openDuration: 0.05,
            closeDuration: 0.05,
            walkSpeed: 400
        }]
    };
    assert.equal(applyEditorLevelToWorld(state, level), true, "exit-door level should apply");
    assert.equal(state.story.portalExit.requestedLevelId, "level_012", "explicit destination levels should be preserved");
    stepMany(state, 20, () => createInputFrame());
    assert.ok(state.player.visible, "wizard should remain visible while walking into the exit doorway");
    assert.ok(state.player.renderScale < 1 && state.player.renderScale > 0.84, "wizard should scale down while entering the exit doorway");
    stepMany(state, 35, () => createInputFrame());
    assert.equal(state.story.levelTransitionRequest.requestedLevelId, "level_012", "walking through the exit should request its destination level");
    assert.equal(state.story.levelTransitionRequest.fallbackLevelId, "level_009", "exit requests should name the current level as fallback");
    assert.equal(state.player.visible, false, "wizard should be hidden after entering the exit door");
    approx(state.player.renderScale, 1, 0.000001, "hidden player scale should reset before the destination level is applied");
    assert.equal(defaultNextLevelId("level_009"), "level_010", "default destinations should increment numbered levels");
}

function testCharacterAtlasEditorOperations() {
    const atlas = { atlasId: "test", image: "test.png", frames: {}, objects: {} };
    const rig = {
        drawOrder: ["arm"],
        pivots: { arm: { x: 0.5, y: 0.5 } },
        parts: { arm: { frame: "arm", targetHeight: 64 } }
    };
    createAtlasFrame(atlas, "arm", { x: 10.2, y: 20.8, w: 30.4, h: 40.6 });
    assert.deepEqual(atlas.frames.arm, { x: 10, y: 21, w: 30, h: 41 }, "frame creation should normalize to pixel rectangles");
    assert.equal(atlas.objects.arm.frame, "arm", "frame creation should create a matching atlas object");
    assert.equal(uniqueAtlasFrameId(atlas, "arm"), "arm_2", "duplicate frame IDs should receive a stable suffix");

    const duplicateId = duplicateAtlasFrame(atlas, "arm", "arm_copy", 8);
    assert.equal(duplicateId, "arm_copy", "duplicate should use the requested free ID");
    assert.deepEqual(atlas.frames.arm_copy, { x: 18, y: 29, w: 30, h: 41 }, "duplicate should offset its rectangle");

    const renamed = renameAtlasFrame(atlas, rig, "arm", "left_arm");
    assert.equal(renamed, "left_arm", "rename should return the new ID");
    assert.equal(rig.parts.arm.frame, "left_arm", "renaming a frame should update rig references");
    assert.equal(atlas.objects.left_arm.frame, "left_arm", "renaming should update atlas object references");

    const moved = moveAtlasFrame(atlas.frames.left_arm, -999, 999, 100, 100);
    assert.deepEqual(moved, { x: 0, y: 59, w: 30, h: 41 }, "frame movement should remain inside image bounds");
    const resized = resizeAtlasFrame({ x: 20, y: 20, w: 30, h: 30 }, "nw", 10, 5, 100, 100);
    assert.deepEqual(resized, { x: 30, y: 25, w: 20, h: 25 }, "corner resize should move the requested edges");
    const drawn = atlasFrameFromDrag({ x: 80, y: 70 }, { x: 30, y: 20 }, 100, 100);
    assert.deepEqual(drawn, { x: 30, y: 20, w: 50, h: 50 }, "drawing should work in any drag direction");

    assert.equal(hitTestAtlasFrames({ x: 30, y: 25 }, { selected: resized }, "selected", 3)?.mode, "resize", "selected corners should resize");
    assert.equal(hitTestAtlasFrames({ x: 40, y: 35 }, { selected: resized }, "selected", 3)?.mode, "move", "frame interiors should move");

    const validation = validateAtlasFrames(atlas, 100, 100, rig);
    assert.equal(validation.valid, true, "valid frame data should pass validation");
    atlas.frames.bad = { x: 95, y: 95, w: 20, h: 20 };
    assert.equal(validateAtlasFrames(atlas, 100, 100, rig).valid, false, "out-of-bounds frames should fail validation");

    const view = atlasViewTransform({ canvasWidth: 800, canvasHeight: 600, imageWidth: 200, imageHeight: 100, zoom: 2, panX: 20, panY: -10 });
    const atlasPoint = { x: 75, y: 30 };
    const canvasPoint = atlasToCanvasPoint(atlasPoint, view);
    const roundTrip = canvasToAtlasPoint(canvasPoint, view);
    approx(roundTrip.x, atlasPoint.x, 0.000001, "atlas view x round trip");
    approx(roundTrip.y, atlasPoint.y, 0.000001, "atlas view y round trip");
    const zoomed = zoomAtlasViewAtCanvasPoint(
        { zoom: 1, panX: 0, panY: 0 },
        canvasPoint,
        2,
        { canvasWidth: 800, canvasHeight: 600, imageWidth: 200, imageHeight: 100, minZoom: 0.1, maxZoom: 8 }
    );
    const zoomedView = atlasViewTransform({ canvasWidth: 800, canvasHeight: 600, imageWidth: 200, imageHeight: 100, ...zoomed });
    const anchored = atlasToCanvasPoint(canvasToAtlasPoint(canvasPoint, atlasViewTransform({ canvasWidth: 800, canvasHeight: 600, imageWidth: 200, imageHeight: 100, zoom: 1, panX: 0, panY: 0 })), zoomedView);
    approx(anchored.x, canvasPoint.x, 0.000001, "atlas zoom should anchor x beneath the pointer");
    approx(anchored.y, canvasPoint.y, 0.000001, "atlas zoom should anchor y beneath the pointer");
}

function testNumberedEnemy001Assets() {
    const atlasCases = [
        ["./assets/at_atlas_002.json", 1500, 1600, 43],
        ["./assets/at_atlas_003.json", 1599, 1609, 21]
    ];
    for (const [filename, imageWidth, imageHeight, expectedCount] of atlasCases) {
        const atlas = JSON.parse(readFileSync(filename, "utf8"));
        assert.equal(Object.keys(atlas.frames).length, expectedCount, `${filename} should contain every detected visual island`);
        assert.equal(Object.keys(atlas.objects).length, expectedCount, `${filename} should have one object per frame`);
        for (const [objectId, object] of Object.entries(atlas.objects)) {
            const frame = atlas.frames[object.frame];
            assert.ok(frame, `${filename} object ${objectId} should reference an existing frame`);
            assert.ok(frame.x >= 0 && frame.y >= 0 && frame.w > 0 && frame.h > 0, `${filename} frame ${object.frame} should be valid`);
            assert.ok(frame.x + frame.w <= imageWidth && frame.y + frame.h <= imageHeight, `${filename} frame ${object.frame} should remain inside the PNG`);
            const nodeIds = new Set(object.nodes.map((node) => node.id));
            assert.ok(object.lines.length >= 3, `${filename} object ${objectId} should have a closed blockable outline`);
            assert.ok(object.lines.every((line) => line.kind === "blockable"), `${filename} object ${objectId} should use blockable collision lines`);
            assert.ok(object.lines.every((line) => nodeIds.has(line.from) && nodeIds.has(line.to)), `${filename} object ${objectId} lines should reference valid nodes`);
            assert.ok(object.nodes.every((node) => node.x >= 0 && node.y >= 0 && node.x <= frame.w && node.y <= frame.h), `${filename} object ${objectId} nodes should remain local to the frame`);
        }
    }

    const character = JSON.parse(readFileSync("./assets/ct_char_enemy_001.json", "utf8"));
    const rig = JSON.parse(readFileSync("./assets/ct_rig_enemy_001.json", "utf8"));
    const atlas = JSON.parse(readFileSync("./assets/ct_atlas_enemy_001.json", "utf8"));
    const idle = JSON.parse(readFileSync("./assets/ct_anim_enemy_001_idle.json", "utf8"));
    const walk = JSON.parse(readFileSync("./assets/ct_anim_enemy_001_walk.json", "utf8"));
    const attack = JSON.parse(readFileSync("./assets/ct_anim_enemy_001_attack.json", "utf8"));
    const hurt = JSON.parse(readFileSync("./assets/ct_anim_enemy_001_hurt.json", "utf8"));
    const death = JSON.parse(readFileSync("./assets/ct_anim_enemy_001_death.json", "utf8"));
    assert.equal(character.characterId, "ct_char_enemy_001", "enemy character ID should follow the numbered enemy convention");
    assert.equal(character.rig, "ct_rig_enemy_001.json", "enemy character should reference its numbered rig filename");
    assert.equal(character.animationMap.idle, "ct_anim_enemy_001_idle.json", "enemy character should reference its numbered idle filename");
    assert.equal(character.animationMap.walk, "ct_anim_enemy_001_walk.json", "enemy character should reference its numbered walk filename");
    assert.equal(character.animationMap.attack, "ct_anim_enemy_001_attack.json", "enemy character should reference its numbered attack filename");
    assert.equal(character.animationMap.hurt, "ct_anim_enemy_001_hurt.json", "enemy character should reference its numbered hurt filename");
    assert.equal(character.animationMap.death, "ct_anim_enemy_001_death.json", "enemy character should reference its numbered death filename");
    assert.equal(rig.rigId, "ct_rig_enemy_001", "enemy rig ID should follow the numbered enemy convention");
    assert.equal(rig.atlasManifest, "ct_atlas_enemy_001.json", "enemy rig should reference the numbered atlas manifest");
    assert.equal(atlas.atlasId, "ct_atlas_enemy_001", "enemy atlas ID should follow the numbered enemy convention");
    assert.equal(atlas.image, "ct_atlas_enemy_001.png", "enemy atlas should reference the renamed PNG");
    assert.deepEqual(
        rig.drawOrder,
        ["leftLeg", "leftArm", "rightLeg", "torso", "head", "sword", "rightArm", "shield"],
        "enemy_001 should preserve the user-authored back-to-front layer order"
    );
    assert.equal(Object.keys(atlas.frames).length, 8, "enemy_001 atlas should use semantic frame IDs for all parts");
    for (const partName of rig.drawOrder) {
        assert.ok(rig.parts[partName], `enemy_001 rig should define ${partName}`);
        assert.ok(atlas.frames[rig.parts[partName].frame], `enemy_001 rig part ${partName} should reference an atlas frame`);
        assert.ok(idle.referencePose[partName], `enemy_001 idle should contain ${partName}`);
        assert.ok(walk.referencePose[partName], `enemy_001 walk should contain ${partName}`);
        assert.ok(attack.referencePose[partName], `enemy_001 attack should contain ${partName}`);
        assert.ok(hurt.referencePose[partName], `enemy_001 hurt should contain ${partName}`);
        assert.ok(death.referencePose[partName], `enemy_001 death should contain ${partName}`);
    }

    const goblinFireballCharacter = JSON.parse(readFileSync("./assets/ct_char_enemy_002.json", "utf8"));
    const goblinMusketCharacter = JSON.parse(readFileSync("./assets/ct_char_enemy_003.json", "utf8"));
    const goblinRig = JSON.parse(readFileSync("./assets/ct_rig_enemy_002.json", "utf8"));
    const goblinAtlas = JSON.parse(readFileSync("./assets/ct_atlas_enemy_002.json", "utf8"));
    assert.equal(goblinFireballCharacter.characterId, "ct_char_enemy_002", "fireball goblin character ID should follow numbered enemy convention");
    assert.equal(goblinMusketCharacter.characterId, "ct_char_enemy_003", "musket goblin character ID should follow numbered enemy convention");
    assert.equal(goblinRig.rigId, "ct_rig_enemy_002", "shared goblin rig should use the next numbered rig filename");
    assert.equal(goblinAtlas.atlasId, "ct_atlas_enemy_002", "shared goblin atlas should use the next numbered atlas filename");
    assert.ok(goblinAtlas.frames.fireball, "goblin atlas should include the fireball projectile frame");
    assert.ok(goblinAtlas.frames.cannonball, "goblin atlas should include the cannonball projectile frame");
    assert.ok(goblinAtlas.frames.musket, "goblin atlas should include the musket frame");
    assert.equal(goblinAtlas.frames.leftArmOpen.x, 409, "open left casting arm should retain its correct atlas rectangle");
    assert.equal(goblinAtlas.frames.leftArmClosed.x, 865, "closed left arm should use the formerly mislabelled right-side rectangle");
    assert.equal(goblinAtlas.frames.rightArmClosed.x, 432, "closed right arm should use the formerly mislabelled left-side rectangle");
    assert.equal(goblinAtlas.frames.leftLeg.x, 586, "left leg should use the corrected front-leg rectangle");
    assert.equal(goblinAtlas.frames.rightLeg.x, 335, "right leg should use the corrected rear-leg rectangle");
    assert.equal(goblinAtlas.objects.fireball.type, "projectileSprite", "fireball should remain in the atlas as an unattached projectile resource");
    assert.equal(goblinAtlas.objects.cannonball.type, "projectileSprite", "cannonball should remain in the atlas as an unattached projectile resource");
    assert.equal(goblinFireballCharacter.rigPartOverrides.weapon.alpha, 0, "fireball goblin should hide the shared weapon slot instead of attaching the projectile");
    assert.equal(goblinFireballCharacter.projectilePart, "fireball", "Fireball Goblin should select the fireball from the shared projectile rig parts");
    assert.equal(goblinMusketCharacter.projectilePart, "cannonball", "Musket Goblin should select the cannonball from the shared projectile rig parts");
    assert.deepEqual(goblinFireballCharacter.rigPartOverrides.weapon.offset, { x: 145, y: -179 }, "hidden Fireball Goblin weapon slot should retain the baked ground-normalized setup offset");
    assert.equal(goblinMusketCharacter.rigPartOverrides.weapon.frame, "musket", "musket goblin should keep the musket attached to its rig");
    assert.equal(goblinMusketCharacter.rigPartOverrides.leftArm, undefined, "musket goblin should use the dedicated leftArmClosed rig part instead of duplicating it through leftArm");
    assert.deepEqual(goblinRig.drawOrder, ["leftArm", "leftArmClosed", "leftLeg", "rightLeg", "head", "torso", "weapon", "rightArm", "cannonball", "fireball"], "goblin draw order should preserve the accepted user-authored depth order including previewable projectile parts");
    assert.ok(goblinRig.parts.leftArmClosed, "shared goblin rig should retain the alternate closed left arm as an independently animatable part");
    assert.equal(goblinRig.parts.fireball.projectile.launchType, "homing_lo", "fireball rig part should be tagged as low-homing");
    approx(goblinRig.parts.fireball.projectile.releaseTime, 0.372, 0.000001, "fireball rig part should carry an explicit release time");
    assert.equal(goblinRig.parts.cannonball.projectile.launchType, "ballistic", "cannonball rig part should be tagged as ballistic");
    approx(goblinRig.parts.cannonball.projectile.releaseTime, 0.49531814840382643, 0.000001, "cannonball rig part should carry an explicit release time");

    const fireIdle = JSON.parse(readFileSync("./assets/ct_anim_enemy_002_idle.json", "utf8"));
    const fireAttack = JSON.parse(readFileSync("./assets/ct_anim_enemy_002_attack.json", "utf8"));
    const musketIdle = JSON.parse(readFileSync("./assets/ct_anim_enemy_003_idle.json", "utf8"));
    const musketAttack = JSON.parse(readFileSync("./assets/ct_anim_enemy_003_attack.json", "utf8"));
    assert.equal(goblinRig.global.groundOffset, 0, "goblin ground correction should be baked into authored coordinates rather than applied at runtime");
    approx(fireIdle.tracks.rightLeg.y[0].value, -130.05551366037764, 0.000001, "Fireball Goblin right foot should use the baked +52 ground normalization");
    approx(fireIdle.tracks.leftLeg.y[0].value, -137.7019415206407, 0.000001, "Fireball Goblin left foot should use the baked +52 ground normalization");
    assert.equal(fireIdle.tracks.leftArm.alpha[0].value, 0, "Fireball Goblin idle should hide the open casting arm");
    assert.equal(fireIdle.tracks.leftArmClosed.alpha[0].value, 1, "Fireball Goblin idle should show the closed alternate arm");
    assert.deepEqual(
        { x: musketIdle.referencePose.rightLeg.x, y: musketIdle.referencePose.rightLeg.y, rotation: musketIdle.referencePose.rightLeg.rotation },
        { x: fireIdle.tracks.rightLeg.x[0].value, y: fireIdle.tracks.rightLeg.y[0].value, rotation: fireIdle.tracks.rightLeg.rotation[0].value },
        "Musket Goblin idle should inherit the corrected compact right-leg placement"
    );
    assert.deepEqual(
        { x: musketIdle.referencePose.leftLeg.x, y: musketIdle.referencePose.leftLeg.y, rotation: musketIdle.referencePose.leftLeg.rotation },
        { x: fireIdle.tracks.leftLeg.x[0].value, y: fireIdle.tracks.leftLeg.y[0].value, rotation: fireIdle.tracks.leftLeg.rotation[0].value },
        "Musket Goblin idle should inherit the corrected compact left-leg placement"
    );
    assert.ok(fireAttack.tracks.fireball, "Fireball Goblin attack should retain the authored fireball spawn cue");
    assert.ok(musketAttack.tracks.cannonball, "Musket Goblin attack should author a cannonball spawn cue");
    assert.equal(musketAttack.tracks.leftArm.alpha[0].value, 0, "Musket Goblin attack should keep the open casting arm hidden");
    assert.equal(musketAttack.tracks.leftArmClosed.alpha[0].value, 1, "Musket Goblin attack should begin with the closed front arm visible");

    const goblinAnimationFiles = [
        "ct_anim_enemy_002_walk.json", "ct_anim_enemy_002_attack.json", "ct_anim_enemy_002_hurt.json", "ct_anim_enemy_002_death.json",
        "ct_anim_enemy_003_idle.json", "ct_anim_enemy_003_walk.json", "ct_anim_enemy_003_attack.json", "ct_anim_enemy_003_hurt.json", "ct_anim_enemy_003_death.json"
    ];
    const requiredGoblinBodyParts = goblinRig.drawOrder.filter((partName) => {
        const frameName = goblinRig.parts?.[partName]?.frame;
        return goblinAtlas.objects?.[frameName]?.type !== "projectileSprite";
    });
    for (const filename of goblinAnimationFiles) {
        const rawAnimation = JSON.parse(readFileSync(`./assets/${filename}`, "utf8"));
        for (const partName of requiredGoblinBodyParts) {
            assert.ok(rawAnimation.referencePose[partName], `${filename} should carry a reference transform for body part ${partName}`);
        }
        const animation = normalizeAnimationClip(rawAnimation, filename);
        const keyTimes = new Set([0, Number(rawAnimation.duration || 0)]);
        for (const partTracks of Object.values(rawAnimation.tracks || {})) {
            for (const track of Object.values(partTracks || {})) {
                for (const key of track || []) keyTimes.add(Number(key.time));
            }
        }
        for (const time of keyTimes) {
            const pose = sampleAnimationClip(animation, time);
            assert.ok(Object.values(pose).every((part) => Object.values(part).every(Number.isFinite)), `${filename} should sample to finite transforms at ${time}`);
        }
    }

    const assertFiniteClip = (clip, times, label) => {
        const normalized = normalizeAnimationClip(clip, label);
        for (const time of times) {
            const pose = sampleAnimationClip(normalized, time);
            assert.ok(Object.values(pose).every((part) => Object.values(part).every(Number.isFinite)), `${label} should sample to finite transforms at ${time}`);
        }
    };

    assertFiniteClip(idle, [0, 0.6, 1.2], "enemy_001 idle");
    assertFiniteClip(walk, [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8], "enemy_001 walk");
    assertFiniteClip(attack, [0, 0.073333, 0.158889, 0.207778, 0.293333, 0.366667, 0.44], "enemy_001 attack");
    assertFiniteClip(hurt, [0, 0.12, 0.24, 0.36, 0.48], "enemy_001 hurt");
    assertFiniteClip(death, [0, 0.18, 0.36, 0.56, 0.78, 1.0, 1.18], "enemy_001 death");
    assert.equal(attack.loop, false, "enemy_001 attack should be a one-shot clip");
    const swordRaised = attack.tracks.sword.y.find((key) => Math.abs(key.time - 0.207778) < 0.000001);
    const swordDown = attack.tracks.sword.y.find((key) => Math.abs(key.time - 0.366667) < 0.000001);
    assert.ok(swordRaised.value < -300, "enemy_001 attack should raise the sword above the head");
    assert.ok(swordDown.value > -160, "enemy_001 attack should finish the slash forward and down");
    assert.ok(attack.tracks.sword.x.find((key) => Math.abs(key.time - 0.366667) < 0.000001).value >= 190, "enemy_001 attack should carry the sword far enough forward for contact");
    assert.equal(attack.duration, 0.44, "enemy_001 attack should be a rapid one-shot chop");
    assert.equal(walk.duration, 0.8, "enemy_001 walk should contain one brisk two-step cycle");
    assert.ok(walk.tracks.leftLeg.rotation.length >= 9, "enemy_001 walk should author a complete alternating leg cycle");
    assert.ok(walk.tracks.rightLeg.y.some((key) => key.value < -170), "enemy_001 walk should lift the swinging right foot");
    assert.ok(walk.tracks.leftLeg.y.some((key) => key.value < -170), "enemy_001 walk should lift the swinging left foot");
}

function testCharacterDirtyTracking() {
    const tracker = createCharacterDirtyTracker();
    assert.equal(characterProjectHasUnsavedChanges(tracker), false, "fresh projects should be clean");
    markCharacterProjectDirty(tracker, "atlas");
    markCharacterProjectDirty(tracker, "animation", "run");
    markCharacterProjectDirty(tracker, "animation", "idle");
    let summary = characterProjectDirtySummary(tracker);
    assert.equal(summary.atlas, true, "atlas dirty state should be independent");
    assert.deepEqual(summary.animations, ["idle", "run"], "animation dirty states should be tracked per clip");
    markCharacterProjectClean(tracker, "animation", "run");
    summary = characterProjectDirtySummary(tracker);
    assert.deepEqual(summary.animations, ["idle"], "saving one animation should not clean another");
    markCharacterProjectClean(tracker);
    assert.equal(characterProjectHasUnsavedChanges(tracker), false, "cleaning the project should clear every document");
}

function testCharacterToolDirectTransformGeometry() {
    assert.equal(TRANSFORM_EDIT_PROPERTY, "transform", "combined transform mode should have a stable property id");
    const view = characterViewTransform({
        canvasWidth: 1160,
        canvasHeight: 660,
        zoom: 2,
        panX: 40,
        panY: -20,
        facing: 1
    });
    const previewPoint = { x: 75, y: -130 };
    const canvasPoint = previewToCanvasPoint(previewPoint, view);
    const roundTrip = canvasToPreviewPoint(canvasPoint, view);
    approx(roundTrip.x, previewPoint.x, 0.000001, "view transform x round trip");
    approx(roundTrip.y, previewPoint.y, 0.000001, "view transform y round trip");

    const geometry = partRectangleGeometry(
        { x: 20, y: 30, angle: Math.PI / 4, targetHeight: 100 },
        { width: 80, height: 100 },
        { x: 0.5, y: 0.5 }
    );
    const canvasGeometry = geometryToCanvas(geometry, view);
    assert.equal(hitTestPartGeometry(canvasGeometry.center, canvasGeometry)?.mode, "move", "rectangle center should start an XY drag");
    assert.equal(hitTestPartGeometry(canvasGeometry.corners[0], canvasGeometry)?.mode, "rotate", "rectangle corner should start a rotation drag");
    assert.equal(hitTestPartGeometry({ x: -999, y: -999 }, canvasGeometry), null, "outside point should not begin an edit");

    const rotated = rotationFromPointerDrag(0.25, { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 });
    approx(rotated, 0.25 + Math.PI / 2, 0.000001, "corner drag should add pointer angle delta");

    const zoomed = zoomCharacterViewAtCanvasPoint(
        { zoom: 1, panX: 0, panY: 0 },
        canvasPoint,
        2,
        { canvasWidth: 1160, canvasHeight: 660, facing: 1, minZoom: 0.25, maxZoom: 6 }
    );
    const zoomedView = characterViewTransform({
        canvasWidth: 1160,
        canvasHeight: 660,
        zoom: zoomed.zoom,
        panX: zoomed.panX,
        panY: zoomed.panY,
        facing: 1
    });
    const anchored = previewToCanvasPoint(canvasToPreviewPoint(canvasPoint, characterViewTransform({
        canvasWidth: 1160,
        canvasHeight: 660,
        zoom: 1,
        panX: 0,
        panY: 0,
        facing: 1
    })), zoomedView);
    approx(anchored.x, canvasPoint.x, 0.000001, "zoom should keep pointer anchor x fixed");
    approx(anchored.y, canvasPoint.y, 0.000001, "zoom should keep pointer anchor y fixed");

    const toolHtml = readFileSync(new URL("../character-editor.html", import.meta.url), "utf8");
    assert.ok(toolHtml.includes("X, Y and Angle (drag)"), "character tool should expose combined transform editing");
    assert.ok(toolHtml.includes("beginPartTransformDrag"), "character tool should wire direct part dragging");
    assert.ok(toolHtml.includes("Use the mouse wheel over the canvas"), "character tool should document direct wheel preview zooming");
    assert.ok(!toolHtml.includes("if (!event.ctrlKey)"), "character preview zoom should not require Ctrl");
    assert.ok(toolHtml.includes("Base rig / setup values"), "character tool should distinguish base rig values from animation keys");
    assert.ok(toolHtml.includes("keyValue.disabled = transformMode"), "combined transform mode should disable the scalar value field");
    assert.ok(toolHtml.includes("function rigSetupTransform(partName)"), "character tool should synthesize setup transforms for rig parts missing from an animation clip");
    assert.ok(toolHtml.includes("authored ? { ...setup, ...authored } : setup"), "missing animation parts should remain selectable and movable from their rig setup pose");
    assert.ok(toolHtml.includes("els.applyPreviewAlpha.checked"), "sprite drawing should switch between edit visibility and effective alpha preview");
}

function testDataDrivenRunAnimation() {
    const rawClip = JSON.parse(readFileSync(new URL("../assets/ct_anim_wizard_run_1.json", import.meta.url), "utf8"));
    const clip = normalizeAnimationClip(rawClip, "wizard run animation");
    const expectedParts = ["leftArm", "leftFoot", "rocket", "rightFoot", "robe", "head", "hat", "rightArm"];

    assert.equal(clip.animationId, "ct_anim_wizard_run_1", "run clip id should be stable");
    assert.equal(clip.loop, true, "run clip should loop");
    assert.equal(clip.duration, 0.72, "run clip duration should remain explicit data");
    assert.deepStrictEqual(Object.keys(clip.referencePose), expectedParts, "run clip should define every rig part");
    assert.equal(clip.playback.baseCyclesPerSecond, 0.55, "run playback base cadence should come from JSON");
    assert.equal(clip.playback.speedCyclesPerSecond, 2.6, "run playback speed response should come from JSON");

    for (const partName of expectedParts) {
        const partTracks = clip.tracks[partName];
        assert.ok(partTracks, `${partName} should have an animation track group`);
        for (const property of ["x", "y", "rotation"]) {
            const track = partTracks[property];
            assert.ok(Array.isArray(track) && track.length >= 1, `${partName}.${property} should have keyframes`);
            assert.equal(track[0].time, 0, `${partName}.${property} should begin at time zero`);
            assert.equal(track[track.length - 1].time, clip.duration, `${partName}.${property} should close at the clip duration`);
            approx(track[0].value, track[track.length - 1].value, 0.000001, `${partName}.${property} loop closure`);
        }
    }

    for (let sampleIndex = 0; sampleIndex <= 48; sampleIndex += 1) {
        const time = clip.duration * sampleIndex / 48;
        const pose = sampleAnimationClip(clip, time);
        for (const partName of expectedParts) {
            for (const property of ["x", "y", "rotation", "scale", "alpha"]) {
                assert.ok(Number.isFinite(pose[partName][property]), `${partName}.${property} should be finite at sample ${sampleIndex}`);
            }
        }
    }

    const loopStart = sampleAnimationClip(clip, 0);
    const loopEnd = sampleAnimationClip(clip, clip.duration);
    assert.deepStrictEqual(loopEnd, loopStart, "loop end should wrap exactly to loop start");

    const halfMotion = blendAnimationPoses(clip.referencePose, sampleAnimationClip(clip, clip.duration * 0.25), 0.5);
    assert.ok(Number.isFinite(halfMotion.leftFoot.x), "pose blending should produce finite transforms");

    const rendererSource = readFileSync(new URL("../src/presentation/canvas-renderer.js", import.meta.url), "utf8");
    const gameSource = readFileSync(new URL("../src/browser/game-bootstrap.js", import.meta.url), "utf8");
    const gameHtml = readFileSync(new URL("../game.html", import.meta.url), "utf8");
    assert.equal(rendererSource.includes("computeLegacyGroundAnimationPose"), false, "legacy procedural run should be removed");
    assert.equal(rendererSource.includes("comparisonPose"), false, "legacy comparison drawing should be removed");
    assert.equal(gameSource.includes("cycleAnimationMode"), false, "animation comparison mode should be removed from the game");
    assert.equal(gameHtml.includes("toggle-animation-mode"), false, "animation comparison button should be removed from the game UI");
}

function testAnimationEditorOperations() {
    const rawClip = JSON.parse(readFileSync(new URL("../assets/ct_anim_wizard_run_1.json", import.meta.url), "utf8"));
    const editable = createEditableAnimationClip(rawClip, "editable run");
    const originalTrack = getAnimationTrack(editable, "hat", "rotation", false);
    const originalCount = originalTrack.length;

    const insertedIndex = upsertAnimationKeyframe(editable, "hat", "rotation", {
        time: 0.111,
        value: 0.25,
        easing: "easeInOut"
    });
    let track = getAnimationTrack(editable, "hat", "rotation", false);
    assert.equal(track.length, originalCount + 1, "adding a keyframe should increase the track length");
    approx(track[insertedIndex].time, 0.111, 0.000001, "inserted key time");
    approx(track[insertedIndex].value, 0.25, 0.000001, "inserted key value");

    const movedIndex = updateAnimationKeyframe(editable, "hat", "rotation", insertedIndex, {
        time: 0.112,
        value: 0.3,
        easing: "easeOut"
    });
    track = getAnimationTrack(editable, "hat", "rotation", false);
    approx(track[movedIndex].time, 0.112, 0.000001, "moved key time");
    approx(track[movedIndex].value, 0.3, 0.000001, "edited key value");
    assert.equal(track[movedIndex].easing, "easeOut", "edited easing should persist");

    assert.equal(deleteAnimationKeyframe(editable, "hat", "rotation", movedIndex), true, "selected key should delete");
    assert.equal(getAnimationTrack(editable, "hat", "rotation", false).length, originalCount, "deleting should restore track length");

    updateAnimationClipMetadata(editable, {
        animationId: "ct_anim_wizard_run_metadata_test",
        duration: 1.25,
        loop: false,
        mirrorable: false,
        playback: {
            idleThreshold: 0.08,
            baseCyclesPerSecond: 0.8,
            speedCyclesPerSecond: 2.2,
            maxSpeedRatio: 1.7
        }
    });
    assert.equal(editable.animationId, "ct_anim_wizard_run_metadata_test", "animation ID metadata should be editable");
    assert.equal(editable.duration, 1.25, "animation duration metadata should be editable");
    assert.equal(editable.loop, false, "loop metadata should be editable");
    assert.equal(editable.mirrorable, false, "mirrorable metadata should be editable");
    assert.equal(editable.playback.maxSpeedRatio, 1.7, "playback metadata should be editable");
    assert.throws(
        () => updateAnimationClipMetadata(editable, { duration: 0.1 }),
        /final key/,
        "shortening duration past existing keys should be rejected rather than destroying authored timing"
    );

    const duplicate = duplicateEditableAnimationClip(editable, "ct_anim_wizard_run_duplicate_test");
    assert.equal(duplicate.animationId, "ct_anim_wizard_run_duplicate_test", "animation duplication should assign a fresh ID");
    assert.notEqual(duplicate, editable, "animation duplication should create a separate object");
    duplicate.tracks.hat.rotation[0].value += 1;
    assert.notEqual(duplicate.tracks.hat.rotation[0].value, editable.tracks.hat.rotation[0].value, "editing a duplicate should not mutate its source");

    const serialized = serializeEditableAnimationClip(editable, "serialized editable run");
    assert.equal(serialized._normalizedAnimationClip, undefined, "editor metadata should not leak into exported JSON");
    assert.equal(serialized.sourceUrl, undefined, "source URL should not leak into exported JSON");
    normalizeAnimationClip(serialized, "round-tripped editor animation");

    const toolHtml = readFileSync(new URL("../character-editor.html", import.meta.url), "utf8");
    assert.ok(toolHtml.includes("Animation track"), "character tool should expose animation track editing");
    assert.ok(toolHtml.includes("Add at playhead"), "character tool should expose keyframe creation");
    assert.ok(toolHtml.includes("Drag a diamond") || toolHtml.includes("drag a yellow corner"), "character tool should explain direct keyframe manipulation");
    assert.ok(toolHtml.includes("previewSelectedKeyValue"), "numeric key values should preview and commit directly");
    assert.ok(toolHtml.includes('id="animation-duration"'), "character tool should expose animation duration metadata");
    assert.ok(toolHtml.includes('id="animation-mirrorable"'), "character tool should expose animation mirroring metadata");
    assert.ok(toolHtml.includes('id="duplicate-animation"'), "character tool should expose animation duplication");
    assert.ok(toolHtml.includes("duplicateCurrentAnimation"), "character tool should wire animation duplication into the current project");
}

function testAnimationEasingModes() {
    const track = [
        { time: 0, value: 0, easing: "linear" },
        { time: 1, value: 10, easing: "linear" }
    ];
    approx(sampleAnimationTrack(track, 0.5, 1, false), 5, 0.000001, "linear keyframe interpolation");
    approx(sampleAnimationTrack(track, 2, 1, false), 10, 0.000001, "one-shot tracks should clamp at their final key");
    approx(sampleAnimationTrack(track, 1.25, 1, true), 2.5, 0.000001, "looped tracks should wrap after their duration");

    const stepTrack = [
        { time: 0, value: 3, easing: "step" },
        { time: 1, value: 9, easing: "linear" }
    ];
    approx(sampleAnimationTrack(stepTrack, 0.75, 1, false), 3, 0.000001, "step keyframe interpolation");

    const easeTrack = [
        { time: 0, value: 0, easing: "easeInOut" },
        { time: 1, value: 10, easing: "linear" }
    ];
    approx(sampleAnimationTrack(easeTrack, 0.25, 1, false), 1.25, 0.000001, "ease-in-out first quarter");
    approx(sampleAnimationTrack(easeTrack, 0.75, 1, false), 8.75, 0.000001, "ease-in-out third quarter");

    const loopedClip = normalizeAnimationClip({
        animationId: "editor_terminal_key_test",
        duration: 1,
        loop: true,
        referencePose: { part: { x: 0, y: 0, rotation: 0, scale: 1, alpha: 1 } },
        tracks: {
            part: {
                x: [
                    { time: 0, value: 0, easing: "linear" },
                    { time: 1, value: 25, easing: "linear" }
                ]
            }
        }
    }, "editor terminal key test");
    approx(sampleAnimationClip(loopedClip, 1).part.x, 0, 0.000001, "runtime loop sampling should still wrap at the duration");
    approx(sampleAnimationClipAtPlayhead(loopedClip, 1).part.x, 25, 0.000001, "editor playhead sampling should expose the editable terminal key");
    const toolHtml = readFileSync(new URL("../character-editor.html", import.meta.url), "utf8");
    assert.ok(toolHtml.includes("sampleAnimationClipAtPlayhead"), "Puppet Forge should use terminal-aware playhead sampling");
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
    stepMany(state, 260, () => createInputFrame());
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
    assert.equal(DEFAULT_TUNING.rocketProjectileDamage, 55, "enemy combat should use the current two-hit Skeleton Guard damage");
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

function testCollisionAreaRejectsShallowCornerEntry() {
    const state = createInitialGameState();
    state.world.solids = [];
    state.world.segments = [];
    state.world.collisionPolygons = [{
        id: "corner_block",
        kind: "blockable",
        points: [
            { x: 100, y: 100 },
            { x: 300, y: 100 },
            { x: 300, y: 300 },
            { x: 100, y: 300 }
        ]
    }];
    state.player.x = 84;
    state.player.y = 108;
    state.player.vx = 360;
    state.player.vy = 0;
    state.player.onGround = false;

    stepSimulation(state, createInputFrame(), FIXED_DT);

    const rect = {
        left: state.player.x - state.player.width / 2,
        right: state.player.x + state.player.width / 2,
        top: state.player.y - state.player.height,
        bottom: state.player.y
    };
    assert.ok(rect.right <= 100.06, `shallow corner entry should push the wizard back outside, got right=${rect.right}`);
    assert.equal(state.player.vx, 0, "corner rejection should remove velocity into the rock");
    assert.ok(state.debug.lastEvents.some((event) => event.type === "PLAYER_COLLISION_RECOVERED"), "corner recovery should be visible in debug history");
}

function testCollisionAreaPushesEmbeddedPlayerToNearestSide() {
    const state = createInitialGameState();
    state.world.solids = [];
    state.world.segments = [];
    state.world.collisionPolygons = [{
        id: "embedded_block",
        kind: "blockable",
        points: [
            { x: 100, y: 100 },
            { x: 300, y: 100 },
            { x: 300, y: 300 },
            { x: 100, y: 300 }
        ]
    }];
    state.player.x = 200;
    state.player.y = 290;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.onGround = false;

    stepSimulation(state, createInputFrame(), FIXED_DT);

    assert.ok(state.player.y - state.player.height >= 299.94, `embedded wizard should be expelled through the nearer bottom edge, got top=${state.player.y - state.player.height}`);
    assert.equal(state.player.onGround, false, "downward recovery should not falsely mark the wizard grounded");
    assert.equal(state.collisions.playerTouching.up, true, "downward recovery should report rock contact above the wizard");
    assert.equal(state.collisions.lastResolution.direction, "down", "nearest-edge recovery should choose the bottom edge");
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

    stepMany(state, 260, () => createInputFrame());
    let mailboxAdvanceSafety = 0;
    while (state.story.mailboxEvent?.active && mailboxAdvanceSafety < 8) {
        stepSimulation(state, createInputFrame({ jumpPressed: true, jumpHeld: true }), FIXED_DT);
        stepSimulation(state, createInputFrame({ jumpReleased: true, jumpHeld: false }), FIXED_DT);
        mailboxAdvanceSafety += 1;
    }
    stepMany(state, 30, () => createInputFrame());
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



function testControlKeysLaunchWeapon() {
    const target = {
        addEventListener() {}
    };
    const input = new RocketfrockInput(target);

    for (const code of ["ControlLeft", "ControlRight"]) {
        let prevented = false;
        input.onKeyDown({
            code,
            repeat: false,
            preventDefault() {
                prevented = true;
            }
        });
        const pressed = input.sample();
        assert.equal(prevented, true, `${code} should suppress the browser's default shortcut handling`);
        assert.equal(pressed.weaponHeld, true, `${code} should hold the weapon input`);
        assert.equal(pressed.weaponPressed, true, `${code} should produce a fresh weapon press`);
        assert.equal(pressed.moveLeft, false, `${code} should not move left`);
        assert.equal(pressed.moveRight, false, `${code} should not move right`);

        input.onKeyUp({
            code,
            repeat: false,
            preventDefault() {}
        });
        const released = input.sample();
        assert.equal(released.weaponHeld, false, `${code} release should clear the weapon input`);
        assert.equal(released.weaponReleased, true, `${code} should produce a weapon release`);
    }
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
    ["source organization and architecture map", testSourceOrganization],
    ["left and right Ctrl weapon binding", testControlKeysLaunchWeapon],
    ["timed story text layout", testTimedTextViewportLayout],
    ["responsive viewport scaling", testResponsiveViewportScaling],
    ["selective level colour map", testSelectiveLevelColorMap],
    ["level placement copy and cutout backing", testLevelPlacementCopy],
    ["level placement transforms", testLevelPlacementTransforms],
    ["editor level transform runtime", testEditorLevelTransformRuntime],
    ["player start snaps to nearby ground", testPlayerStartSnapsToNearbyGround],
    ["interactive item atlas and entity visuals", testInteractiveItemAtlasAndEntityVisuals],
    ["scripted mailbox letter", testMailboxLetterSequence],
    ["scripted portal entrance", testPortalEntranceSequence],
    ["scripted portal exit", testPortalExitSequence],
    ["editor dropdown contrast", testEditorDropdownContrast],
    ["generic runtime character project", testGenericRuntimeCharacterProject],
    ["goblin runtime character projects", testGoblinRuntimeCharacterProjects],
    ["enemy catalog and Level Editor integration", testEnemyCatalogAndLevelEditorIntegration],
    ["simulation-owned character enemy patrol", testCharacterEnemyPatrolBehavior],
    ["character enemy aggressive chase and combo", testCharacterEnemyAggressiveChaseAndCombo],
    ["character enemy rocket combat", testCharacterEnemyRocketCombat],
    ["character enemy melee attack", testCharacterEnemyMeleeAttack],
    ["terrain shields player from enemy melee", testEnemyMeleeBlockedByTerrain],
    ["fireball goblin projectile attack", testFireballGoblinProjectileAttack],
    ["musket goblin projectile attack", testMusketGoblinProjectileAttack],
    ["player damage invulnerability", testPlayerDamageInvulnerability],
    ["damaging and killable surface hazards", testDamagingAndKillableSurfaceHazards],
    ["terrain intercepts rocket before enemy", testTerrainInterceptsRocketBeforeEnemy],
    ["breakable crate reactive object", testBreakableCrateReactiveObject],
    ["character project workspace", testCharacterProjectWorkspace],
    ["character atlas editor operations", testCharacterAtlasEditorOperations],
    ["numbered enemy_001 authored assets", testNumberedEnemy001Assets],
    ["character project dirty tracking", testCharacterDirtyTracking],
    ["character tool direct transform geometry", testCharacterToolDirectTransformGeometry],
    ["data-driven wizard run animation", testDataDrivenRunAnimation],
    ["animation editor keyframe operations", testAnimationEditorOperations],
    ["animation easing modes", testAnimationEasingModes],
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
    ["collision area rejects shallow corner entry", testCollisionAreaRejectsShallowCornerEntry],
    ["collision area pushes embedded player to nearest side", testCollisionAreaPushesEmbeddedPlayerToNearestSide],
    ["rocket impacts atlas collision lines and areas", testRocketImpactsAtlasCollisionLinesAndAreas],
    ["rocket launch ignores unrelated atlas areas", testRocketLaunchDoesNotFalseHitUnrelatedAtlasArea],
    ["manual reset", testReset]
];

for (const [name, fn] of tests) {
    await fn();
    console.log(`PASS ${name}`);
}

console.log("PASS IgnatiusRocketfrock headless tests");
