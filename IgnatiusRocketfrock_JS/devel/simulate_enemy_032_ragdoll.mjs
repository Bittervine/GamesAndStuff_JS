#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
    normalizeAnimationClip,
    sampleAnimationClip
} from "../src/shared/animation-data.js";
import {
    bakeParentConstraintTracks,
    parentConstraintRigPoint
} from "../src/tools/character-editor/parent-constraint-data.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = path.join(ROOT, "resources", "characters");
const OUTPUT = path.join(ASSETS, "ct_anim_enemy_032_death.json");
const TRACE_OUTPUT = path.join(ROOT, "devel", "enemy_032_ragdoll_trace.json");

function readJson(filename) {
    return JSON.parse(fs.readFileSync(path.join(ASSETS, filename), "utf8"));
}

function writeJson(filename, value) {
    fs.writeFileSync(filename, `${JSON.stringify(value, null, 2)}\n`);
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
}

function wrapAngle(value) {
    let angle = value;
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
}

function angleBetween(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
}

function distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

function rotatePoint(point, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: point.x * cos - point.y * sin,
        y: point.x * sin + point.y * cos
    };
}

function inverseRotatePoint(point, angle) {
    return rotatePoint(point, -angle);
}

function addPoint(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
}

function subtractPoint(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
}

function pointAlong(origin, length, angle) {
    return {
        x: origin.x + Math.cos(angle) * length,
        y: origin.y + Math.sin(angle) * length
    };
}

function buildAssetMap(rig, atlas) {
    const result = new Map();
    for (const [partName, part] of Object.entries(rig.parts || {})) {
        const frame = atlas.frames?.[part.frame];
        if (!frame) {
            throw new Error(`Missing atlas frame ${part.frame} for ${partName}.`);
        }
        result.set(partName, { width: frame.w, height: frame.h, frameId: part.frame });
    }
    return result;
}

function spriteDimensions(rig, atlas, partName, transform) {
    const part = rig.parts[partName];
    const frame = atlas.frames[part.frame];
    const height = part.targetHeight * transform.scale;
    return {
        width: frame.w / frame.h * height,
        height
    };
}

function spritePoint(rig, atlas, partName, transform, normalizedPoint) {
    const dimensions = spriteDimensions(rig, atlas, partName, transform);
    const pivot = rig.pivots[partName];
    const local = {
        x: (normalizedPoint.x - pivot.x) * dimensions.width,
        y: (normalizedPoint.y - pivot.y) * dimensions.height
    };
    return addPoint(transform, rotatePoint(local, transform.rotation));
}

function spriteMaximumY(rig, atlas, partName, transform) {
    const corners = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 }
    ];
    return Math.max(...corners.map((point) => spritePoint(rig, atlas, partName, transform, point).y));
}

function localAttachment(torso, point) {
    return inverseRotatePoint(subtractPoint(point, torso), torso.rotation);
}

function worldAttachment(torso, localPoint) {
    return addPoint(torso, rotatePoint(localPoint, torso.rotation));
}

function relativeAngle(childAngle, parentAngle) {
    return wrapAngle(childAngle - parentAngle);
}

function applySoftLimit(joint, parentAngle, minimum, maximum, stiffness, timeStep) {
    const relative = relativeAngle(joint.angle, parentAngle);
    const target = clamp(relative, minimum, maximum);
    const error = wrapAngle(target - relative);
    if (Math.abs(error) < 1e-8) {
        return;
    }
    joint.angularVelocity += error * stiffness * timeStep;
    joint.angularVelocity *= 0.88;
}

function integratePendulum(joint, length, gravity, damping, timeStep) {
    const safeLength = Math.max(10, length);
    const acceleration = -(gravity / safeLength) * Math.sin(joint.angle - Math.PI / 2);
    joint.angularVelocity += acceleration * timeStep;
    joint.angularVelocity *= damping;
    joint.angle = wrapAngle(joint.angle + joint.angularVelocity * timeStep);
}

function createRotationTrack(samples, partName) {
    return samples.map((sample) => ({
        time: sample.time,
        value: sample.rotations[partName],
        easing: "linear"
    }));
}

function createPositionTrack(samples, axis) {
    return samples.map((sample) => ({
        time: sample.time,
        value: sample.torso[axis],
        easing: "linear"
    }));
}

function constantTrack(value) {
    return [{ time: 0, value, easing: "linear" }];
}

const rig = readJson("ct_rig_enemy_032.json");
const atlas = readJson("ct_atlas_enemy_030.json");
const idleClip = normalizeAnimationClip(readJson("ct_anim_enemy_032_idle.json"), "Enemy 032 idle");
const oldDeath = readJson("ct_anim_enemy_032_death.json");
const idlePose = sampleAnimationClip(idleClip, 0);
const assetMap = buildAssetMap(rig, atlas);

const floorY = Math.max(
    spriteMaximumY(rig, atlas, "leftFoot", idlePose.leftFoot),
    spriteMaximumY(rig, atlas, "rightFoot", idlePose.rightFoot)
);

const initialTorso = clone(idlePose.torso);
const rootLocal = {
    leftShoulder: localAttachment(initialTorso, idlePose.leftUpperArm),
    rightShoulder: localAttachment(initialTorso, idlePose.rightUpperArm),
    leftHip: localAttachment(initialTorso, idlePose.leftUpperLeg),
    rightHip: localAttachment(initialTorso, idlePose.rightUpperLeg),
    neck: localAttachment(initialTorso, idlePose.head)
};

const initialPoints = {
    leftShoulder: clone(idlePose.leftUpperArm),
    rightShoulder: clone(idlePose.rightUpperArm),
    leftElbow: clone(idlePose.leftLowerArm),
    rightElbow: clone(idlePose.rightLowerArm),
    leftHip: clone(idlePose.leftUpperLeg),
    rightHip: clone(idlePose.rightUpperLeg),
    leftKnee: clone(idlePose.leftLowerLeg),
    rightKnee: clone(idlePose.rightLowerLeg),
    leftAnkle: clone(idlePose.leftFoot),
    rightAnkle: clone(idlePose.rightFoot),
    rightWrist: clone(idlePose.weapon)
};
initialPoints.leftWrist = spritePoint(
    rig,
    atlas,
    "leftLowerArm",
    idlePose.leftLowerArm,
    { x: 0.78, y: 0.9 }
);

const lengths = {
    leftUpperArm: distance(initialPoints.leftShoulder, initialPoints.leftElbow),
    leftLowerArm: distance(initialPoints.leftElbow, initialPoints.leftWrist),
    rightUpperArm: distance(initialPoints.rightShoulder, initialPoints.rightElbow),
    rightLowerArm: distance(initialPoints.rightElbow, initialPoints.rightWrist),
    leftUpperLeg: distance(initialPoints.leftHip, initialPoints.leftKnee),
    leftLowerLeg: distance(initialPoints.leftKnee, initialPoints.leftAnkle),
    rightUpperLeg: distance(initialPoints.rightHip, initialPoints.rightKnee),
    rightLowerLeg: distance(initialPoints.rightKnee, initialPoints.rightAnkle)
};

const initialSegmentAngles = {
    leftUpperArm: angleBetween(initialPoints.leftShoulder, initialPoints.leftElbow),
    leftLowerArm: angleBetween(initialPoints.leftElbow, initialPoints.leftWrist),
    rightUpperArm: angleBetween(initialPoints.rightShoulder, initialPoints.rightElbow),
    rightLowerArm: angleBetween(initialPoints.rightElbow, initialPoints.rightWrist),
    leftUpperLeg: angleBetween(initialPoints.leftHip, initialPoints.leftKnee),
    leftLowerLeg: angleBetween(initialPoints.leftKnee, initialPoints.leftAnkle),
    rightUpperLeg: angleBetween(initialPoints.rightHip, initialPoints.rightKnee),
    rightLowerLeg: angleBetween(initialPoints.rightKnee, initialPoints.rightAnkle)
};

const rotationOffsets = {};
for (const partName of Object.keys(initialSegmentAngles)) {
    rotationOffsets[partName] = wrapAngle(idlePose[partName].rotation - initialSegmentAngles[partName]);
}
const footOffsets = {
    leftFoot: wrapAngle(idlePose.leftFoot.rotation - idlePose.leftLowerLeg.rotation),
    rightFoot: wrapAngle(idlePose.rightFoot.rotation - idlePose.rightLowerLeg.rotation)
};
const weaponOffset = wrapAngle(idlePose.weapon.rotation - idlePose.rightLowerArm.rotation);

const joints = {};
for (const [name, angle] of Object.entries(initialSegmentAngles)) {
    joints[name] = { angle, angularVelocity: 0 };
}

const initialRelative = {
    leftShoulder: relativeAngle(joints.leftUpperArm.angle, initialTorso.rotation),
    rightShoulder: relativeAngle(joints.rightUpperArm.angle, initialTorso.rotation),
    leftElbow: relativeAngle(joints.leftLowerArm.angle, joints.leftUpperArm.angle),
    rightElbow: relativeAngle(joints.rightLowerArm.angle, joints.rightUpperArm.angle),
    leftHip: relativeAngle(joints.leftUpperLeg.angle, initialTorso.rotation),
    rightHip: relativeAngle(joints.rightUpperLeg.angle, initialTorso.rotation),
    leftKnee: relativeAngle(joints.leftLowerLeg.angle, joints.leftUpperLeg.angle),
    rightKnee: relativeAngle(joints.rightLowerLeg.angle, joints.rightUpperLeg.angle)
};

const jointLimits = {
    shoulder: 0.48,
    elbow: 0.62,
    hip: 0.42,
    knee: 0.72,
    neck: 0.28
};

const duration = 1.85;
const timeStep = 1 / 120;
const sampleRate = 30;
const gravity = 520;
const torso = {
    x: initialTorso.x,
    y: initialTorso.y,
    rotation: initialTorso.rotation,
    velocityX: -1.2,
    velocityY: 0,
    angularVelocity: -0.035
};
const head = {
    relativeRotation: wrapAngle(idlePose.head.rotation - initialTorso.rotation),
    angularVelocity: 0
};

const torsoDimensions = spriteDimensions(rig, atlas, "torso", idlePose.torso);
const torsoPivot = rig.pivots.torso;
const samples = [];
const trace = [];
let nextSampleTime = 1 / sampleRate;

function torsoMaximumY() {
    return spriteMaximumY(rig, atlas, "torso", {
        x: torso.x,
        y: torso.y,
        rotation: torso.rotation,
        scale: idlePose.torso.scale
    });
}

function recordSample(time) {
    const rotations = {};
    for (const partName of Object.keys(initialSegmentAngles)) {
        rotations[partName] = wrapAngle(joints[partName].angle + rotationOffsets[partName]);
    }
    rotations.leftFoot = wrapAngle(rotations.leftLowerLeg + footOffsets.leftFoot);
    rotations.rightFoot = wrapAngle(rotations.rightLowerLeg + footOffsets.rightFoot);
    rotations.torso = torso.rotation;
    rotations.head = wrapAngle(torso.rotation + head.relativeRotation);
    rotations.weapon = wrapAngle(rotations.rightLowerArm + weaponOffset);
    samples.push({
        time: Number(time.toFixed(6)),
        torso: {
            x: Number(torso.x.toFixed(6)),
            y: Number(torso.y.toFixed(6)),
            rotation: Number(torso.rotation.toFixed(6))
        },
        rotations: Object.fromEntries(Object.entries(rotations).map(([name, value]) => [name, Number(value.toFixed(6))]))
    });
}

recordSample(0);

for (let step = 1; step <= Math.ceil(duration / timeStep); step += 1) {
    const time = Math.min(duration, step * timeStep);
    const support = Math.pow(clamp(1 - time / 0.18, 0, 1), 2);
    const angularSupport = Math.pow(clamp(1 - time / 0.12, 0, 1), 2);

    torso.velocityY += gravity * (1 - support) * timeStep;
    torso.velocityX *= 0.9985;
    torso.velocityY *= 0.999;
    torso.angularVelocity += (-1.85 * (1 - angularSupport)) * timeStep;
    torso.angularVelocity *= 0.997;
    torso.x += torso.velocityX * timeStep;
    torso.y += torso.velocityY * timeStep;
    torso.rotation = wrapAngle(torso.rotation + torso.angularVelocity * timeStep);

    if (support > 0) {
        const yError = initialTorso.y - torso.y;
        torso.velocityY += yError * support * 28 * timeStep;
        torso.y += yError * support * 0.04;
    }

    for (const [name, joint] of Object.entries(joints)) {
        integratePendulum(joint, lengths[name], gravity, 0.994, timeStep);
    }

    applySoftLimit(joints.leftUpperArm, torso.rotation,
        initialRelative.leftShoulder - jointLimits.shoulder,
        initialRelative.leftShoulder + jointLimits.shoulder, 48, timeStep);
    applySoftLimit(joints.rightUpperArm, torso.rotation,
        initialRelative.rightShoulder - jointLimits.shoulder,
        initialRelative.rightShoulder + jointLimits.shoulder, 48, timeStep);
    applySoftLimit(joints.leftLowerArm, joints.leftUpperArm.angle,
        initialRelative.leftElbow - jointLimits.elbow,
        initialRelative.leftElbow + jointLimits.elbow, 52, timeStep);
    applySoftLimit(joints.rightLowerArm, joints.rightUpperArm.angle,
        initialRelative.rightElbow - jointLimits.elbow,
        initialRelative.rightElbow + jointLimits.elbow, 52, timeStep);
    applySoftLimit(joints.leftUpperLeg, torso.rotation,
        initialRelative.leftHip - jointLimits.hip,
        initialRelative.leftHip + jointLimits.hip, 60, timeStep);
    applySoftLimit(joints.rightUpperLeg, torso.rotation,
        initialRelative.rightHip - jointLimits.hip,
        initialRelative.rightHip + jointLimits.hip, 60, timeStep);
    applySoftLimit(joints.leftLowerLeg, joints.leftUpperLeg.angle,
        initialRelative.leftKnee - jointLimits.knee,
        initialRelative.leftKnee + jointLimits.knee, 58, timeStep);
    applySoftLimit(joints.rightLowerLeg, joints.rightUpperLeg.angle,
        initialRelative.rightKnee - jointLimits.knee,
        initialRelative.rightKnee + jointLimits.knee, 58, timeStep);

    const leftHip = worldAttachment(torso, rootLocal.leftHip);
    const rightHip = worldAttachment(torso, rootLocal.rightHip);
    const leftKnee = pointAlong(leftHip, lengths.leftUpperLeg, joints.leftUpperLeg.angle);
    const rightKnee = pointAlong(rightHip, lengths.rightUpperLeg, joints.rightUpperLeg.angle);
    const leftAnkle = pointAlong(leftKnee, lengths.leftLowerLeg, joints.leftLowerLeg.angle);
    const rightAnkle = pointAlong(rightKnee, lengths.rightLowerLeg, joints.rightLowerLeg.angle);

    const ankleFloor = floorY - 27;
    for (const [ankle, lowerJoint] of [
        [leftAnkle, joints.leftLowerLeg],
        [rightAnkle, joints.rightLowerLeg]
    ]) {
        if (ankle.y > ankleFloor) {
            const penetration = ankle.y - ankleFloor;
            lowerJoint.angle -= Math.sign(Math.cos(lowerJoint.angle) || 1) * penetration * 0.006;
            lowerJoint.angularVelocity *= 0.45;
            torso.velocityY *= 0.96;
        }
    }

    const torsoPenetration = torsoMaximumY() - floorY;
    if (torsoPenetration > 0) {
        torso.y -= torsoPenetration;
        if (torso.velocityY > 0) torso.velocityY *= -0.04;
        torso.velocityX *= 0.88;
        torso.angularVelocity *= 0.93;
    }

    const targetHeadRelative = clamp(
        wrapAngle(idlePose.head.rotation - idlePose.torso.rotation) - torso.angularVelocity * 0.18,
        -jointLimits.neck,
        jointLimits.neck
    );
    head.angularVelocity += (targetHeadRelative - head.relativeRotation) * 34 * timeStep;
    head.angularVelocity *= 0.90;
    head.relativeRotation = clamp(
        head.relativeRotation + head.angularVelocity * timeStep,
        -jointLimits.neck,
        jointLimits.neck
    );

    if (time + 1e-9 >= nextSampleTime || step === Math.ceil(duration / timeStep)) {
        recordSample(Math.min(duration, nextSampleTime));
        nextSampleTime += 1 / sampleRate;
    }

    if (step % 4 === 0) {
        trace.push({
            time: Number(time.toFixed(4)),
            torso: {
                x: Number(torso.x.toFixed(4)),
                y: Number(torso.y.toFixed(4)),
                rotation: Number(torso.rotation.toFixed(4))
            },
            floorY: Number(floorY.toFixed(4)),
            leftAnkleY: Number(leftAnkle.y.toFixed(4)),
            rightAnkleY: Number(rightAnkle.y.toFixed(4))
        });
    }
}

if (samples.at(-1).time < duration) {
    recordSample(duration);
}

const clip = {
    meta: {
        version: 1,
        note: "Revision 397 Enemy 032 death clip generated by a deterministic offline 2D ragdoll approximation. Gravity, a nearly invisible backward impulse, soft anatomical joint limits, floor contact, and stiff ankles drive the collapse from the authoritative idle pose.",
        ragdoll: {
            solver: "articulated angular dynamics with soft limits",
            gravity,
            timeStep,
            sampleRate,
            floorY,
            initialPush: {
                velocityX: -1.2,
                angularVelocity: -0.035
            },
            jointLimitsRadians: jointLimits,
            stiffAnkles: true
        }
    },
    animationId: "ct_anim_enemy_032_death",
    duration,
    loop: false,
    mirrorable: true,
    playback: clone(oldDeath.playback),
    rootMotion: { enabled: false, xTrack: null, yTrack: null },
    referencePose: clone(idlePose),
    tracks: {}
};

for (const partName of rig.drawOrder) {
    const pose = idlePose[partName];
    clip.tracks[partName] = {
        rotation: createRotationTrack(samples, partName),
        scale: constantTrack(pose.scale),
        alpha: constantTrack(pose.alpha)
    };
}
clip.tracks.torso.x = createPositionTrack(samples, "x");
clip.tracks.torso.y = createPositionTrack(samples, "y");

const baked = bakeParentConstraintTracks(clip, rig, assetMap, {
    tolerance: 0.16,
    maxDepth: 10,
    label: "Enemy 032 deterministic ragdoll death"
});
clip.meta.bakedParentConstraintParts = baked.parts;
clip.meta.bakedPositionKeyCount = baked.keyCount;

writeJson(OUTPUT, clip);
writeJson(TRACE_OUTPUT, {
    meta: clip.meta.ragdoll,
    torsoDimensions,
    torsoPivot,
    trace
});
console.log(`Wrote ${path.relative(ROOT, OUTPUT)} and ${path.relative(ROOT, TRACE_OUTPUT)}.`);
