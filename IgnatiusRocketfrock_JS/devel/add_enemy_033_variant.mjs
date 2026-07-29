#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHARACTER_RESOURCES = path.join(ROOT, "resources", "characters");
const SLOTS = ["idle", "walk", "attack", "hurt", "death"];

async function readJson(relativePath) {
    return JSON.parse(await readFile(path.join(ROOT, relativePath), "utf8"));
}

async function writeJson(relativePath, value) {
    await writeFile(path.join(ROOT, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function clone(value) {
    return structuredClone(value);
}

const character032 = await readJson("resources/characters/ct_char_enemy_032.json");
const character033 = clone(character032);
character033.meta = {
    version: 1,
    note: "Revision 406 Human Knife Thrower II. Exact animation/rig behavior clone of the current Enemy 032 thrower, using fresh body_03/head_03 artwork and its own character identity."
};
character033.characterId = "ct_char_enemy_033";
character033.displayName = "Human Knife Thrower II";
character033.rig = "ct_rig_enemy_033.json";
character033.animationMap = Object.fromEntries(SLOTS.map((slot) => [slot, `ct_anim_enemy_033_${slot}.json`]));
await writeJson("resources/characters/ct_char_enemy_033.json", character033);

const rig033 = clone(await readJson("resources/characters/ct_rig_enemy_032.json"));
rig033.meta = {
    version: 1,
    note: "Revision 406 Human Knife Thrower II rig. Cloned from the current Enemy 032 articulated throwing rig, selecting fresh body_03/head_03 artwork while retaining the invisible dagger launch marker."
};
rig033.rigId = "ct_rig_enemy_033";
rig033.parts.torso.frame = "body_03";
rig033.parts.head.frame = "head_03";
await writeJson("resources/characters/ct_rig_enemy_033.json", rig033);

for (const slot of SLOTS) {
    const animation = clone(await readJson(`resources/characters/ct_anim_enemy_032_${slot}.json`));
    animation.animationId = `ct_anim_enemy_033_${slot}`;
    animation.meta = animation.meta || {};
    animation.meta.note = `Revision 406 Human Knife Thrower II ${slot} clip. Exact motion copy of the current user-authored Enemy 032 ${slot} clip for the body_03/head_03 variant.`;
    await writeJson(`resources/characters/ct_anim_enemy_033_${slot}.json`, animation);
}

const catalog = await readJson("resources/characters/ct_enemies_001.json");
catalog.enemies.enemy_032.defaults.projectileVolleyHalfAngle = 5;
const enemy033 = clone(catalog.enemies.enemy_032);
enemy033.label = "Human Knife Thrower II";
enemy033.characterId = "ct_char_enemy_033";
enemy033.description = "A dark-haired human knife thrower using the fresh body_03/head_03 pair. He shares Enemy 032's user-authored articulated throw and releases three non-spinning, point-first daggers in a +/-5 degree fan.";
catalog.enemies.enemy_033 = enemy033;
await writeJson("resources/characters/ct_enemies_001.json", catalog);

const parts = await readJson("resources/characters/ct_human_parts_030.json");
const assembly033 = clone(parts.assemblies.enemy_032);
assembly033.body = "body_03";
assembly033.head = "head_03";
parts.assemblies.enemy_033 = assembly033;
await writeJson("resources/characters/ct_human_parts_030.json", parts);

const generator = await readJson("resources/generator/level-generator-enemies.json");
generator.enemies.enemy_033 = clone(generator.enemies.enemy_032);
generator.enemies.enemy_033.notes = "Dormant metadata for Human Knife Thrower II. It uses body_03/head_03 and shares Enemy 032's three-knife +/-5 degree point-first volley; it remains excluded from ordinary generated levels until the human family is tuned.";
await writeJson("resources/generator/level-generator-enemies.json", generator);

for (const levelName of ["level_001.json", "level_002.json"]) {
    const level = await readJson(`resources/levels/${levelName}`);
    let changed = false;
    for (const entity of level.entities || []) {
        if (entity.enemyCatalogId === "enemy_032" && entity.projectileVolleyHalfAngle !== 5) {
            entity.projectileVolleyHalfAngle = 5;
            changed = true;
        }
    }
    if (changed) {
        await writeJson(`resources/levels/${levelName}`, level);
    }
}

console.log(`Enemy 033 regenerated from the current Enemy 032 resources in ${CHARACTER_RESOURCES}.`);
