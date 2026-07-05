import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
    normalizeAnimationClip,
    sampleAnimationClip
} from "../src/shared/animation-data.js";
import { bakeParentConstraintTracks } from "../src/tools/character-editor/parent-constraint-data.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = path.join(ROOT, "assets");

function readJson(filename) {
    return JSON.parse(fs.readFileSync(path.join(ASSETS, filename), "utf8"));
}

function writeJson(filename, value) {
    fs.writeFileSync(path.join(ASSETS, filename), `${JSON.stringify(value, null, 2)}\n`);
}

const rig = readJson("ct_rig_enemy_032.json");
const atlas = readJson("ct_atlas_enemy_030.json");
const idle = normalizeAnimationClip(readJson("ct_anim_enemy_032_idle.json"), "Enemy 032 idle");
const idlePose = sampleAnimationClip(idle, 0);
const priorHumanWalk = readJson("ct_anim_enemy_030_walk.json");

const duration = 0.8;
const times = [0, 0.2, 0.4, 0.6, 0.8];
const key = (time, value, easing = "easeInOut") => ({ time, value, easing });
const track = (values, easing = "easeInOut") => values.map((value, index) => key(times[index], value, easing));
const constant = (value) => [key(0, value, "linear")];

const rotations = {
    leftUpperArm: [0.46, 0.30, 0.12, 0.29, 0.46],
    leftLowerArm: [0.52, 0.34, 0.08, 0.32, 0.52],
    rightUpperArm: [0.12, 0.19, 0.29, 0.20, 0.12],
    rightLowerArm: [0.08, 0.15, 0.24, 0.16, 0.08],
    weapon: [-0.49, -0.43, -0.34, -0.42, -0.49],

    rightUpperLeg: [-0.22, 0.02, 0.30, 0.08, -0.22],
    rightLowerLeg: [0.03, 0.08, 0.38, 0.52, 0.03],
    rightFoot: [0.07, -0.02, -0.14, 0.14, 0.07],
    leftUpperLeg: [0.28, 0.08, -0.22, 0.02, 0.28],
    leftLowerLeg: [0.42, 0.52, 0.03, 0.08, 0.42],
    leftFoot: [-0.14, 0.14, 0.07, -0.02, -0.14],

    torso: [-0.012, 0.015, -0.012, 0.015, -0.012],
    head: [0.020, 0.005, 0.020, 0.005, 0.020]
};

const walk = {
    meta: {
        version: 1,
        note: "Revision 394 articulated Human Raider III walk cycle. Retargeted from the user-corrected Enemy 032 idle stance and rig: upper limbs drive the stride, lower limbs and feet bend independently, and all parent-pivot positions are baked for runtime playback."
    },
    animationId: "ct_anim_enemy_032_walk",
    duration,
    loop: true,
    mirrorable: true,
    playback: {
        ...priorHumanWalk.playback,
        idleThreshold: 0.04,
        baseCyclesPerSecond: 1.25,
        speedCyclesPerSecond: 1.25,
        maxSpeedRatio: 1.6
    },
    rootMotion: { enabled: false, xTrack: null, yTrack: null },
    referencePose: JSON.parse(JSON.stringify(idlePose)),
    tracks: {}
};

const baseX = idlePose.torso.x;
const baseY = idlePose.torso.y;
walk.tracks.torso = {
    x: track([baseX, baseX + 1.1, baseX, baseX - 1.1, baseX]),
    y: track([baseY, baseY + 3.2, baseY, baseY + 3.2, baseY]),
    rotation: track(rotations.torso),
    scale: constant(idlePose.torso.scale),
    alpha: constant(1)
};

for (const partName of rig.drawOrder) {
    if (partName === "torso") {
        continue;
    }
    const pose = idlePose[partName];
    if (!pose) {
        throw new Error(`Enemy 032 idle pose is missing rig part ${partName}.`);
    }
    const values = rotations[partName] ?? Array(times.length).fill(pose.rotation);
    walk.tracks[partName] = {
        rotation: track(values),
        scale: constant(pose.scale),
        alpha: constant(pose.alpha)
    };
}

const assetMap = new Map();
for (const [partName, part] of Object.entries(rig.parts)) {
    const frame = atlas.frames[part.frame];
    if (!frame) {
        throw new Error(`Enemy 032 part ${partName} references missing atlas frame ${part.frame}.`);
    }
    assetMap.set(partName, { width: frame.w, height: frame.h, frameId: part.frame });
}

const baked = bakeParentConstraintTracks(walk, rig, assetMap, {
    tolerance: 0.18,
    maxDepth: 10,
    label: "Enemy 032 corrected walk"
});
walk.meta.bakedParentConstraintParts = baked.parts;
walk.meta.bakedPositionKeyCount = baked.keyCount;

writeJson("ct_anim_enemy_032_walk.json", walk);
console.log(`Wrote ct_anim_enemy_032_walk.json with ${baked.parts.length} constrained parts and ${baked.keyCount} baked X/Y keys.`);
