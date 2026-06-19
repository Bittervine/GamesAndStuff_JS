import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { computeResponsiveViewportMetrics } from "./IgnatiusRocketfrock_RENDER.js";
import {
    animationTimeFromPhase,
    blendAnimationPoses,
    normalizeAnimationClip,
    sampleAnimationClip,
    sampleAnimationTrack
} from "./IgnatiusRocketfrock_ANIMATION.js";
import {
    addAtlasFrameToRig,
    addRigPartToAnimation,
    CHARACTER_PROJECT_FILE_KIND,
    classifyCharacterProjectJson,
    createBlankCharacterProject,
    inventoryCharacterProjectJson,
    normalizeCharacterSlug,
    resolveCharacterProjectReference
} from "./IgnatiusRocketfrock_CHARACTER_PROJECT.js";
import {
    createEditableAnimationClip,
    deleteAnimationKeyframe,
    getAnimationTrack,
    serializeEditableAnimationClip,
    updateAnimationKeyframe,
    upsertAnimationKeyframe
} from "./IgnatiusRocketfrock_ANIMATION_EDITOR.js";
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
} from "./IgnatiusRocketfrock_ATLAS_EDITOR.js";
import {
    characterProjectDirtySummary,
    characterProjectHasUnsavedChanges,
    createCharacterDirtyTracker,
    markCharacterProjectClean,
    markCharacterProjectDirty
} from "./IgnatiusRocketfrock_CHARACTER_DIRTY.js";
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
} from "./IgnatiusRocketfrock_CHARACTER_VIEW.js";
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



function testCharacterProjectWorkspace() {
    assert.equal(normalizeCharacterSlug("  Brass Bat!  "), "brass_bat", "character names should become stable file slugs");
    const project = createBlankCharacterProject("Brass Bat");
    assert.equal(project.filenames.character, "ct_char_brass_bat_1.json", "blank project should use consistent character filenames");
    assert.equal(project.character.rig, project.filenames.rig, "blank character should reference its generated rig");
    assert.equal(project.rig.atlasManifest, project.filenames.atlas, "blank rig should reference its generated atlas manifest");
    assert.equal(project.atlas.image, project.filenames.image, "blank atlas should reference its generated PNG name");
    assert.equal(project.character.animationMap.idle, project.filenames.animation, "blank character should map an editable idle animation");
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

    const toolHtml = readFileSync(new URL("./character_tool.html", import.meta.url), "utf8");
    assert.ok(toolHtml.includes("Character project"), "character tool should expose project selection");
    assert.ok(toolHtml.includes("New character"), "character tool should expose blank project creation");
    assert.ok(toolHtml.includes("project-directory"), "character tool should expose directory selection where supported");
    assert.ok(toolHtml.includes("atlas-image-file"), "character tool should expose an explicit atlas PNG picker");
    assert.ok(toolHtml.includes("Character JSON"), "character tool should expose character-definition editing and export");
    assert.ok(toolHtml.includes("Atlas JSON"), "character tool should expose atlas-manifest editing and export");
    assert.ok(toolHtml.includes("Atlas parts"), "character tool should expose atlas rectangle authoring mode");
    assert.ok(toolHtml.includes("Add selected to rig"), "character tool should expose atlas-frame to rig assignment");
    assert.ok(toolHtml.includes("Skeleton Guard"), "character tool should expose the skeleton as a known project");
    assert.ok(toolHtml.includes("Unsaved change status"), "character tool should expose independent dirty-state status");

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

function testRevision064AuthoredAssets() {
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

    const character = JSON.parse(readFileSync("./assets/ct_char_skeleton_1.json", "utf8"));
    const rig = JSON.parse(readFileSync("./assets/ct_rig_skeleton_1.json", "utf8"));
    const atlas = JSON.parse(readFileSync("./assets/ct_atlas_skeleton_1.json", "utf8"));
    const idle = JSON.parse(readFileSync("./assets/ct_anim_skeleton_1_idle.json", "utf8"));
    const walk = JSON.parse(readFileSync("./assets/ct_anim_skeleton_1_walk.json", "utf8"));
    assert.equal(character.animationMap.idle, "ct_anim_skeleton_1_idle.json", "skeleton character should reference the existing idle filename");
    assert.equal(character.animationMap.walk, "ct_anim_skeleton_1_walk.json", "skeleton character should reference the walk filename");
    assert.deepEqual(
        rig.drawOrder,
        ["leftArm", "shield", "leftLeg", "rightLeg", "torso", "head", "sword", "rightArm"],
        "skeleton draw order should keep the rear arm at the bottom and the front arm on top"
    );
    assert.equal(Object.keys(atlas.frames).length, 8, "skeleton atlas should use semantic frame IDs for all parts");
    for (const partName of rig.drawOrder) {
        assert.ok(atlas.frames[rig.parts[partName].frame], `skeleton rig part ${partName} should reference an atlas frame`);
        assert.ok(idle.referencePose[partName], `skeleton idle should contain ${partName}`);
        assert.ok(walk.referencePose[partName], `skeleton walk should contain ${partName}`);
    }

    const expectedAttachmentPosition = (pose, equipmentName) => {
        const attachment = rig.attachments[equipmentName];
        const holderName = attachment.holder;
        const holder = pose[holderName];
        const frame = atlas.frames[rig.parts[holderName].frame];
        const pivot = rig.pivots[holderName];
        const holderPoint = attachment.holderPoint;
        const spriteScale = rig.parts[holderName].targetHeight * holder.scale / frame.h;
        const localX = (holderPoint.x - pivot.x) * frame.w * spriteScale;
        const localY = (holderPoint.y - pivot.y) * frame.h * spriteScale;
        return {
            x: holder.x + localX * Math.cos(holder.rotation) - localY * Math.sin(holder.rotation),
            y: holder.y + localX * Math.sin(holder.rotation) + localY * Math.cos(holder.rotation)
        };
    };
    const assertEquipmentHeld = (clip, times, label) => {
        const normalized = normalizeAnimationClip(clip, label);
        for (const time of times) {
            const pose = sampleAnimationClip(normalized, time);
            for (const equipmentName of ["shield", "sword"]) {
                const expected = expectedAttachmentPosition(pose, equipmentName);
                approx(pose[equipmentName].x, expected.x, 0.001, `${label} ${equipmentName} grip x at ${time}`);
                approx(pose[equipmentName].y, expected.y, 0.001, `${label} ${equipmentName} grip y at ${time}`);
            }
            assert.ok(Object.values(pose).every((part) => Object.values(part).every(Number.isFinite)), `${label} should sample to finite transforms at ${time}`);
        }
    };

    assertEquipmentHeld(idle, [0, 0.6], "skeleton idle");
    assertEquipmentHeld(walk, [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7], "skeleton walk");
    assert.equal(walk.duration, 0.8, "skeleton walk should contain one brisk two-step cycle");
    assert.ok(walk.tracks.leftLeg.rotation.length >= 9, "skeleton walk should author a complete alternating leg cycle");
    assert.ok(walk.tracks.rightLeg.y.some((key) => key.value < -170), "skeleton walk should lift the swinging right foot");
    assert.ok(walk.tracks.leftLeg.y.some((key) => key.value < -170), "skeleton walk should lift the swinging left foot");
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

    const toolHtml = readFileSync(new URL("./character_tool.html", import.meta.url), "utf8");
    assert.ok(toolHtml.includes("X, Y and Angle (drag)"), "character tool should expose combined transform editing");
    assert.ok(toolHtml.includes("beginPartTransformDrag"), "character tool should wire direct part dragging");
    assert.ok(toolHtml.includes("Use the mouse wheel over the canvas"), "character tool should document direct wheel preview zooming");
    assert.ok(!toolHtml.includes("if (!event.ctrlKey)"), "character preview zoom should not require Ctrl");
    assert.ok(toolHtml.includes("Base rig / setup values"), "character tool should distinguish base rig values from animation keys");
    assert.ok(toolHtml.includes("keyValue.disabled = transformMode"), "combined transform mode should disable the scalar value field");
}

function testDataDrivenRunAnimation() {
    const rawClip = JSON.parse(readFileSync(new URL("./assets/ct_anim_wizard_run_1.json", import.meta.url), "utf8"));
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

    const rendererSource = readFileSync(new URL("./IgnatiusRocketfrock_RENDER.js", import.meta.url), "utf8");
    const gameSource = readFileSync(new URL("./IgnatiusRocketfrock_GAME.js", import.meta.url), "utf8");
    const gameHtml = readFileSync(new URL("./game.html", import.meta.url), "utf8");
    assert.equal(rendererSource.includes("computeLegacyGroundAnimationPose"), false, "legacy procedural run should be removed");
    assert.equal(rendererSource.includes("comparisonPose"), false, "legacy comparison drawing should be removed");
    assert.equal(gameSource.includes("cycleAnimationMode"), false, "animation comparison mode should be removed from the game");
    assert.equal(gameHtml.includes("toggle-animation-mode"), false, "animation comparison button should be removed from the game UI");
}

function testAnimationEditorOperations() {
    const rawClip = JSON.parse(readFileSync(new URL("./assets/ct_anim_wizard_run_1.json", import.meta.url), "utf8"));
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

    const serialized = serializeEditableAnimationClip(editable, "serialized editable run");
    assert.equal(serialized._normalizedAnimationClip, undefined, "editor metadata should not leak into exported JSON");
    assert.equal(serialized.sourceUrl, undefined, "source URL should not leak into exported JSON");
    normalizeAnimationClip(serialized, "round-tripped editor animation");

    const toolHtml = readFileSync(new URL("./character_tool.html", import.meta.url), "utf8");
    assert.ok(toolHtml.includes("Animation track"), "character tool should expose animation track editing");
    assert.ok(toolHtml.includes("Add at playhead"), "character tool should expose keyframe creation");
    assert.ok(toolHtml.includes("Drag a diamond") || toolHtml.includes("drag a yellow corner"), "character tool should explain direct keyframe manipulation");
    assert.ok(toolHtml.includes("previewSelectedKeyValue"), "numeric key values should preview and commit directly");
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
    ["character project workspace", testCharacterProjectWorkspace],
    ["character atlas editor operations", testCharacterAtlasEditorOperations],
    ["revision 064 authored assets", testRevision064AuthoredAssets],
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
    ["rocket impacts atlas collision lines and areas", testRocketImpactsAtlasCollisionLinesAndAreas],
    ["rocket launch ignores unrelated atlas areas", testRocketLaunchDoesNotFalseHitUnrelatedAtlasArea],
    ["manual reset", testReset]
];

for (const [name, fn] of tests) {
    fn();
    console.log(`PASS ${name}`);
}

console.log("PASS IgnatiusRocketfrock Phase 1 headless tests");
