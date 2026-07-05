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

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function createAssetMap(rig, atlas) {
    const assetMap = new Map();
    for (const [partName, part] of Object.entries(rig.parts || {})) {
        const frame = atlas.frames?.[part.frame];
        if (!frame) {
            throw new Error(`Enemy 032 part ${partName} references missing atlas frame ${part.frame}.`);
        }
        assetMap.set(partName, { width: frame.w, height: frame.h, frameId: part.frame });
    }
    return assetMap;
}

function constant(value) {
    return [{ time: 0, value, easing: "linear" }];
}

function buildTrack(times, values, easing = "easeInOut") {
    if (!Array.isArray(values) || values.length !== times.length) {
        throw new Error(`Track value count ${values?.length ?? 0} does not match time count ${times.length}.`);
    }
    return values.map((value, index) => ({ time: times[index], value, easing }));
}

function addDeltas(base, deltas) {
    return deltas.map((delta) => Number((base + delta).toFixed(6)));
}

function addOffsets(base, offsets) {
    return offsets.map((offset) => Number((base + offset).toFixed(6)));
}

function createClip({
    animationId,
    duration,
    loop,
    playback,
    note,
    times,
    torsoOffsets,
    rotationDeltas,
    rig,
    idlePose,
    assetMap,
    bakeLabel
}) {
    const clip = {
        meta: {
            version: 1,
            note
        },
        animationId,
        duration,
        loop,
        mirrorable: true,
        playback: deepClone(playback),
        rootMotion: { enabled: false, xTrack: null, yTrack: null },
        referencePose: deepClone(idlePose),
        tracks: {}
    };

    const torsoPose = idlePose.torso;
    clip.tracks.torso = {
        x: buildTrack(times, addOffsets(torsoPose.x, torsoOffsets.x)),
        y: buildTrack(times, addOffsets(torsoPose.y, torsoOffsets.y)),
        rotation: buildTrack(times, addDeltas(torsoPose.rotation, torsoOffsets.rotation)),
        scale: constant(torsoPose.scale),
        alpha: constant(torsoPose.alpha)
    };

    for (const partName of rig.drawOrder) {
        if (partName === "torso") {
            continue;
        }
        const pose = idlePose[partName];
        if (!pose) {
            throw new Error(`Enemy 032 idle pose is missing rig part ${partName}.`);
        }
        const deltas = rotationDeltas[partName] || new Array(times.length).fill(0);
        clip.tracks[partName] = {
            rotation: buildTrack(times, addDeltas(pose.rotation, deltas)),
            scale: constant(pose.scale),
            alpha: constant(pose.alpha)
        };
    }

    const baked = bakeParentConstraintTracks(clip, rig, assetMap, {
        tolerance: 0.18,
        maxDepth: 10,
        label: bakeLabel
    });
    clip.meta.bakedParentConstraintParts = baked.parts;
    clip.meta.bakedPositionKeyCount = baked.keyCount;
    return clip;
}

const rig = readJson("ct_rig_enemy_032.json");
const atlas = readJson("ct_atlas_enemy_030.json");
const idle = normalizeAnimationClip(readJson("ct_anim_enemy_032_idle.json"), "Enemy 032 user idle");
const idlePose = sampleAnimationClip(idle, 0);
const previousAttack = readJson("ct_anim_enemy_032_attack.json");
const previousHurt = readJson("ct_anim_enemy_032_hurt.json");
const assetMap = createAssetMap(rig, atlas);

const hurt = createClip({
    animationId: "ct_anim_enemy_032_hurt",
    duration: 0.48,
    loop: true,
    playback: previousHurt.playback,
    note: "Revision 397 Enemy 032 hurt clip rebuilt directly from the authoritative idle stance. The reaction is deliberately tiny: a brief head-and-chest twitch, a slight hand response, and nearly imperceptible leg motion while the taller split-limb body remains at the idle/walk height.",
    times: [0, 0.10, 0.22, 0.34, 0.48],
    torsoOffsets: {
        x: [0, -0.7, -0.25, 0, 0],
        y: [0, -0.15, -0.05, 0, 0],
        rotation: [0, -0.025, -0.01, 0.003, 0]
    },
    rotationDeltas: {
        head: [0, -0.035, -0.015, 0.002, 0],
        weapon: [0, 0.015, 0.006, 0, 0],
        rightUpperArm: [0, 0.04, 0.018, -0.004, 0],
        rightLowerArm: [0, 0.055, 0.024, -0.005, 0],
        leftUpperArm: [0, 0.035, 0.016, 0.003, 0],
        leftLowerArm: [0, 0.05, 0.022, 0.004, 0],
        rightUpperLeg: [0, -0.005, -0.002, 0, 0],
        rightLowerLeg: [0, 0.006, 0.002, 0, 0],
        rightFoot: [0, -0.004, -0.002, 0, 0],
        leftUpperLeg: [0, 0.004, 0.002, 0, 0],
        leftLowerLeg: [0, 0.005, 0.002, 0, 0],
        leftFoot: [0, 0.002, 0, 0, 0]
    },
    rig,
    idlePose,
    assetMap,
    bakeLabel: "Enemy 032 hurt rebuilt from user idle"
});

const attack = createClip({
    animationId: "ct_anim_enemy_032_attack",
    duration: 0.46,
    loop: false,
    playback: previousAttack.playback,
    note: "Revision 396 Enemy 032 attack clip keeps the body at the idle-height baseline, preserves the existing broad sword attack idea, and refines it into a more anatomical wind-up, elbow-led slash, and follow-through with only a restrained bracing step in the legs.",
    times: [0, 0.10, 0.22, 0.34, 0.46],
    torsoOffsets: {
        x: [0, -1.5, 3.8, 1.2, 0],
        y: [0, -0.5, -0.8, -0.2, 0],
        rotation: [0, -0.04, 0.06, 0.02, 0]
    },
    rotationDeltas: {
        head: [0, -0.02, 0.04, 0.02, 0],
        weapon: [0, -0.18, -1.22, 0.42, 0],
        rightUpperArm: [0, -0.10, -0.82, 0.12, 0],
        rightLowerArm: [0, -0.24, -1.28, -0.04, 0],
        leftUpperArm: [0, 0.06, 0.20, 0.08, 0],
        leftLowerArm: [0, 0.10, 0.26, 0.12, 0],
        rightUpperLeg: [0, -0.05, -0.12, -0.04, 0],
        rightLowerLeg: [0, 0.06, 0.16, 0.08, 0],
        rightFoot: [0, -0.04, -0.10, 0.03, 0],
        leftUpperLeg: [0, 0.03, 0.08, 0.03, 0],
        leftLowerLeg: [0, 0.06, 0.12, 0.05, 0],
        leftFoot: [0, 0.02, 0.04, 0.01, 0]
    },
    rig,
    idlePose,
    assetMap,
    bakeLabel: "Enemy 032 attack rebuilt from user idle and walk"
});

writeJson("ct_anim_enemy_032_hurt.json", hurt);
writeJson("ct_anim_enemy_032_attack.json", attack);
console.log("Wrote rebuilt Enemy 032 hurt and attack clips. Death is generated by simulate_enemy_032_ragdoll.mjs.");
