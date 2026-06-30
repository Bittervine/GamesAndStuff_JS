#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const path = resolve(root, "tests/fixtures/level-editor-stress.json");
const source = await readFile(path);
const level = JSON.parse(source);
const placements = Array.isArray(level.placements) ? level.placements : [];
const entities = Array.isArray(level.entities) ? level.entities : [];
const layerCounts = placements.reduce((counts, placement) => {
    const layer = String(placement.layer || "unspecified");
    counts[layer] = (counts[layer] || 0) + 1;
    return counts;
}, {});
const entityCounts = entities.reduce((counts, entity) => {
    const type = String(entity.type || "unknown");
    counts[type] = (counts[type] || 0) + 1;
    return counts;
}, {});
console.log(JSON.stringify({
    fixture: "tests/fixtures/level-editor-stress.json",
    sha256: createHash("sha256").update(source).digest("hex"),
    bytes: source.length,
    placements: placements.length,
    entities: entities.length,
    layerCounts,
    entityCounts,
    cavePoints: level.caveWindow?.points?.length || 0,
    navigationProfiles: level.navigationGraphs?.profiles?.length || 0
}, null, 2));
