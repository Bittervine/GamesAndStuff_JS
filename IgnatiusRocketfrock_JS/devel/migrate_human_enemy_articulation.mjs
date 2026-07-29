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

function readJson(filename) {
    return JSON.parse(fs.readFileSync(path.join(ASSETS, filename), "utf8"));
}

function writeJson(filename, value) {
    fs.writeFileSync(path.join(ASSETS, filename), `${JSON.stringify(value, null, 2)}\n`);
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function createAssetMap(rig, atlas) {
    const result = new Map();
    for (const [partName, part] of Object.entries(rig.parts || {})) {
        const frame = atlas.frames?.[part.frame];
        if (!frame) throw new Error(`Missing atlas frame ${part.frame} for ${partName}.`);
        result.set(partName, { width: frame.w, height: frame.h, frameId: part.frame });
    }
    return result;
}

function copyClip(source, animationId, note) {
    const clip = clone(source);
    clip.animationId = animationId;
    clip.meta = {
        ...(clip.meta || {}),
        version: Math.max(1, Number(clip.meta?.version) || 1),
        note
    };
    return clip;
}

function stripPartFromClip(clip, partName) {
    delete clip.referencePose?.[partName];
    delete clip.tracks?.[partName];
}

function constantTrack(value) {
    return [{ time: 0, value, easing: "linear" }];
}

function buildTrack(times, values) {
    return times.map((time, index) => ({ time, value: values[index], easing: "easeInOut" }));
}

function add(base, deltas) {
    return deltas.map((delta) => Number((base + delta).toFixed(9)));
}

const atlas = readJson("ct_atlas_enemy_030.json");
const sourceRig032 = readJson("ct_rig_enemy_032.json");
const sourceClips = Object.fromEntries(
    ["idle", "walk", "attack", "hurt", "death"].map((slot) => [slot, readJson(`ct_anim_enemy_032_${slot}.json`)])
);

function makeSwordRig(enemyId, bodyFrame, headFrame, keepArmColorExchange) {
    const rig = clone(sourceRig032);
    rig.rigId = `ct_rig_enemy_${enemyId}`;
    rig.meta = {
        version: Math.max(1, Number(rig.meta?.version) || 1),
        note: `Revision 405 articulated Human Raider ${enemyId}. Split upper/lower arms, split upper/lower legs, separate feet, and the sword rig are backported from the refined Enemy 032 articulation set.`
    };
    rig.parts.torso.frame = bodyFrame;
    rig.parts.head.frame = headFrame;
    for (const partName of ["leftUpperArm", "leftLowerArm", "rightUpperArm", "rightLowerArm"]) {
        if (!keepArmColorExchange) delete rig.parts[partName].colorExchange;
    }
    return rig;
}

const rig030 = makeSwordRig("030", "body_00", "head_00", false);
const rig031 = makeSwordRig("031", "body_01", "head_01", true);
writeJson("ct_rig_enemy_030.json", rig030);
writeJson("ct_rig_enemy_031.json", rig031);

for (const enemyId of ["030", "031"]) {
    for (const slot of ["idle", "walk", "attack", "hurt", "death"]) {
        writeJson(
            `ct_anim_enemy_${enemyId}_${slot}.json`,
            copyClip(
                sourceClips[slot],
                `ct_anim_enemy_${enemyId}_${slot}`,
                `Revision 405 ${enemyId === "030" ? "Human Raider" : "Human Raider II"} articulated ${slot} clip. Backported from the refined Enemy 032 split-limb animation set while retaining this enemy's own body and head artwork and the sword.`
            )
        );
    }
}

const rig032 = clone(sourceRig032);
rig032.rigId = "ct_rig_enemy_032";
rig032.meta = {
    version: Math.max(1, Number(rig032.meta?.version) || 1),
    note: "Revision 405 Human Knife Thrower. Uses previously unused body_02/head_02 artwork, the articulated human limb rig, no held sword, and a hidden authored throwing-knife launch marker attached to the attack animation."
};
rig032.parts.torso.frame = "body_02";
rig032.parts.head.frame = "head_02";
rig032.drawOrder = rig032.drawOrder.filter((partName) => partName !== "weapon");
delete rig032.parts.weapon;
delete rig032.pivots.weapon;
for (const partName of ["leftUpperArm", "leftLowerArm", "rightUpperArm", "rightLowerArm"]) {
    delete rig032.parts[partName].colorExchange;
}
rig032.pivots.throwingKnife = { x: 0.5, y: 0.5 };
rig032.parts.throwingKnife = {
    frame: "dagger",
    role: "throwingKnifeLaunchMarker",
    tags: ["projectile", "throwingKnife", "hiddenLaunchMarker"],
    offset: { x: -10, y: -260 },
    scale: 0.22,
    targetHeight: 10,
    alpha: 0,
    projectile: {
        enabled: true,
        id: "throwingKnife",
        animationSlot: "attack",
        launchType: "straight",
        releaseTime: 0.34,
        projectileKind: "throwingKnife"
    }
};
rig032.drawOrder.push("throwingKnife");
writeJson("ct_rig_enemy_032.json", rig032);

function addHiddenKnifePart(clip, knifePose) {
    clip.referencePose.throwingKnife = clone(knifePose);
    clip.tracks.throwingKnife = {
        x: constantTrack(knifePose.x),
        y: constantTrack(knifePose.y),
        rotation: constantTrack(knifePose.rotation),
        scale: constantTrack(knifePose.scale),
        alpha: constantTrack(0)
    };
}

const idleBase = normalizeAnimationClip(sourceClips.idle, "Enemy 032 source idle");
const idlePoseWithSword = sampleAnimationClip(idleBase, 0);
const idlePose = clone(idlePoseWithSword);
delete idlePose.weapon;
const placeholderKnifePose = {
    x: idlePose.rightLowerArm.x,
    y: idlePose.rightLowerArm.y,
    rotation: 0,
    scale: 0.22,
    alpha: 0
};

for (const slot of ["idle", "walk", "hurt", "death"]) {
    const clip = copyClip(
        sourceClips[slot],
        `ct_anim_enemy_032_${slot}`,
        `Revision 405 Human Knife Thrower ${slot} clip. Derived from the refined articulated human animation, with the held sword removed and a hidden throwing-knife launch marker retained only for the ranged combat profile.`
    );
    stripPartFromClip(clip, "weapon");
    addHiddenKnifePart(clip, placeholderKnifePose);
    writeJson(`ct_anim_enemy_032_${slot}.json`, clip);
}

const times = [0, 0.12, 0.24, 0.34, 0.46, 0.62];
const throwClip = {
    meta: {
        version: 1,
        note: "Revision 405 Human Knife Thrower attack. The right arm cocks behind the shoulder, leads with the elbow, snaps forward at 0.34 seconds, and follows through while the opposite arm and legs counterbalance. The hidden dagger marker defines the launch point for a three-knife volley."
    },
    animationId: "ct_anim_enemy_032_attack",
    duration: 0.62,
    loop: false,
    mirrorable: true,
    playback: clone(sourceClips.attack.playback),
    rootMotion: { enabled: false, xTrack: null, yTrack: null },
    referencePose: clone(idlePose),
    tracks: {}
};

const torso = idlePose.torso;
throwClip.tracks.torso = {
    x: buildTrack(times, add(torso.x, [0, -1.5, -3.5, 4.5, 2.0, 0])),
    y: buildTrack(times, add(torso.y, [0, -0.5, -1.0, -1.0, -0.3, 0])),
    rotation: buildTrack(times, add(torso.rotation, [0, -0.035, -0.075, 0.085, 0.035, 0])),
    scale: constantTrack(torso.scale),
    alpha: constantTrack(torso.alpha)
};

const rotationDeltas = {
    head: [0, -0.018, -0.035, 0.035, 0.018, 0],
    rightUpperArm: [0, 0.34, 0.62, -1.02, -0.34, 0],
    rightLowerArm: [0, 0.58, 0.96, -1.26, -0.38, 0],
    leftUpperArm: [0, -0.05, -0.12, 0.20, 0.10, 0],
    leftLowerArm: [0, -0.08, -0.16, 0.28, 0.12, 0],
    rightUpperLeg: [0, -0.03, -0.08, -0.14, -0.07, 0],
    rightLowerLeg: [0, 0.05, 0.10, 0.16, 0.08, 0],
    rightFoot: [0, 0.03, 0.06, 0.10, 0.05, 0],
    leftUpperLeg: [0, 0.02, 0.05, 0.10, 0.05, 0],
    leftLowerLeg: [0, 0.04, 0.08, 0.12, 0.06, 0],
    leftFoot: [0, 0.02, 0.04, 0.07, 0.03, 0]
};
for (const partName of rig032.drawOrder) {
    if (partName === "torso" || partName === "throwingKnife") continue;
    const pose = idlePose[partName];
    const deltas = rotationDeltas[partName] || new Array(times.length).fill(0);
    throwClip.tracks[partName] = {
        rotation: buildTrack(times, add(pose.rotation, deltas)),
        scale: constantTrack(pose.scale),
        alpha: constantTrack(pose.alpha)
    };
}
addHiddenKnifePart(throwClip, placeholderKnifePose);

const assetMap032 = createAssetMap(rig032, atlas);
const baked = bakeParentConstraintTracks(throwClip, rig032, assetMap032, {
    tolerance: 0.16,
    maxDepth: 10,
    label: "Enemy 032 throwing attack"
});
throwClip.meta.bakedParentConstraintParts = baked.parts;
throwClip.meta.bakedPositionKeyCount = baked.keyCount;
const normalizedThrow = normalizeAnimationClip(throwClip, "Enemy 032 throwing attack");
const releasePose = sampleAnimationClip(normalizedThrow, 0.34);
const knifeOrigin = parentConstraintRigPoint(
    rig032,
    "rightLowerArm",
    { x: 0.78, y: 0.9 },
    releasePose.rightLowerArm,
    assetMap032
) || { x: releasePose.rightLowerArm.x, y: releasePose.rightLowerArm.y };
throwClip.referencePose.throwingKnife = {
    x: knifeOrigin.x,
    y: knifeOrigin.y,
    rotation: 0,
    scale: 0.22,
    alpha: 0
};
throwClip.tracks.throwingKnife = {
    x: constantTrack(knifeOrigin.x),
    y: constantTrack(knifeOrigin.y),
    rotation: constantTrack(0),
    scale: constantTrack(0.22),
    alpha: constantTrack(0)
};
writeJson("ct_anim_enemy_032_attack.json", throwClip);

const char030 = readJson("ct_char_enemy_030.json");
char030.meta = { version: 3, note: "Revision 405 Human Raider with fully articulated split limbs and dedicated animation files backported from the refined Enemy 032 set." };
char030.animationMap = Object.fromEntries(["idle", "walk", "attack", "hurt", "death"].map((slot) => [slot, `ct_anim_enemy_030_${slot}.json`]));
writeJson("ct_char_enemy_030.json", char030);

const char031 = readJson("ct_char_enemy_031.json");
char031.meta = { version: 3, note: "Revision 405 Human Raider II with fully articulated split limbs and its own exact copies of the refined sword animation set." };
char031.animationMap = Object.fromEntries(["idle", "walk", "attack", "hurt", "death"].map((slot) => [slot, `ct_anim_enemy_031_${slot}.json`]));
writeJson("ct_char_enemy_031.json", char031);

const char032 = readJson("ct_char_enemy_032.json");
char032.meta = { version: 3, note: "Revision 405 Human Knife Thrower using unused body_02/head_02 artwork, no held sword, and a three-knife ranged attack launched from an authored hidden hand marker." };
char032.displayName = "Human Knife Thrower";
char032.projectilePart = "throwingKnife";
writeJson("ct_char_enemy_032.json", char032);

const humanParts = readJson("ct_human_parts_030.json");
humanParts.meta = {
    ...(humanParts.meta || {}),
    version: Math.max(3, Number(humanParts.meta?.version) || 1),
    note: "Revision 405 modular human manifest. Enemies 030 and 031 now use the articulated split-limb sword rig, while Enemy 032 uses body_02/head_02 and the dagger projectile without a held sword."
};
const commonSplit = {
    leftArmUpper: "arm_upper_01",
    leftArmLower: "arm_lower_01",
    rightArmUpper: "arm_upper_00",
    rightArmLower: "arm_lower_00",
    leftLegUpper: "leg_upper_01",
    leftLegLower: "leg_lower_01",
    leftFoot: "foot_01",
    rightLegUpper: "leg_upper_00",
    rightLegLower: "leg_lower_00",
    rightFoot: "foot_00"
};
humanParts.assemblies.enemy_030 = { body: "body_00", head: "head_00", ...commonSplit, weapon: "sword" };
humanParts.assemblies.enemy_031 = { body: "body_01", head: "head_01", ...commonSplit, weapon: "sword", armColorExchange: clone(humanParts.assemblies.enemy_031.armColorExchange) };
humanParts.assemblies.enemy_032 = { body: "body_02", head: "head_02", ...commonSplit, projectile: "dagger" };
writeJson("ct_human_parts_030.json", humanParts);

const catalog = readJson("ct_enemies_001.json");
catalog.meta = {
    ...(catalog.meta || {}),
    version: Math.max(45, Number(catalog.meta?.version) || 1),
    revision: 405,
    note: "Revision 405 backports articulated limbs and refined animations to Human Raiders 030/031, and converts Enemy 032 into a body_02/head_02 three-knife ranged attacker."
};
for (const enemyId of ["enemy_030", "enemy_031"]) {
    const entry = catalog.enemies[enemyId];
    entry.defaultSize.h = 194;
    entry.description = enemyId === "enemy_030"
        ? "A modular human sword enemy using body_00/head_00 with the fully articulated split-limb rig and refined animation set."
        : "A modular human sword enemy using body_01/head_01 with an exact articulated copy of the refined sword animation set.";
}
const knife = catalog.enemies.enemy_032;
knife.label = "Human Knife Thrower";
knife.icon = "🗡";
knife.defaultSize.h = 194;
Object.assign(knife.defaults, {
    attackMode: "projectile",
    attackRange: 440,
    attackVerticalRange: 220,
    attackDuration: 0.62,
    attackHitTime: 0.34,
    attackCooldown: 0.55,
    preferredAttackRange: 270,
    preferredAttackMinRange: 120,
    projectileKind: "throwingKnife",
    projectileLaunchType: "straight",
    projectileReleaseTime: 0.34,
    projectilePartName: "throwingKnife",
    projectileFrameId: "dagger",
    projectileSpeed: 380,
    projectileGravity: 0,
    projectileLifetime: 2.2,
    projectileRadius: 5,
    projectileDamage: 8,
    projectileCooldown: 0.55,
    projectileHomingStrength: 0,
    projectileVolleyCount: 3,
    projectileVolleyHalfAngle: 8,
    projectileKnockbackX: 180,
    projectileKnockbackY: -90,
    attackLungeDistance: 0,
    attackLungeSpeed: 0
});
knife.description = "A blonde human knife thrower using body_02/head_02. He performs an articulated throwing motion and releases a three-knife fan from the dagger artwork in the shared human atlas.";
writeJson("ct_enemies_001.json", catalog);

const generator = readJson("level-generator-enemies.json");
generator.enemies.enemy_030.headroom = 190;
generator.enemies.enemy_031.headroom = 190;
generator.enemies.enemy_032 = {
    ...generator.enemies.enemy_032,
    placementClass: "groundRanged",
    difficultyCost: 3.4,
    minWalkableWidth: 360,
    headroom: 190,
    patrolRoom: 260,
    notes: "Dormant metadata for the articulated Human Knife Thrower. It uses body_02/head_02 and releases a three-knife ranged fan; it remains excluded from ordinary generated levels until the human family is tuned."
};
writeJson("level-generator-enemies.json", generator);

const levelPath = path.join(ASSETS, "level_001.json");
const level = JSON.parse(fs.readFileSync(levelPath, "utf8"));
for (const entity of level.entities || []) {
    if (entity.enemyCatalogId === "enemy_030" || entity.enemyCatalogId === "enemy_031") {
        entity.h = 194;
        entity.notes = catalog.enemies[entity.enemyCatalogId].description;
    }
}
fs.writeFileSync(levelPath, `${JSON.stringify(level, null, 4)}\n`);

const obsoleteDuplicate = path.join(ASSETS, "ct_rig_enemy_030 .json");
if (fs.existsSync(obsoleteDuplicate)) fs.unlinkSync(obsoleteDuplicate);

console.log(JSON.stringify({
    backported: ["enemy_030", "enemy_031"],
    knifeThrower: "enemy_032",
    knifeOrigin,
    releaseTime: 0.34,
    volleyCount: 3,
    bodyFrame: "body_02",
    headFrame: "head_02"
}, null, 2));
