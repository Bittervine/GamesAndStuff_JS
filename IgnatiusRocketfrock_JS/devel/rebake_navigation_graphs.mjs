#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
    applyAtlasManifestsToWorld,
    applyEditorLevelToWorld,
    applyEnemyDefinitionCatalog,
    createInitialGameState,
    DEFAULT_TUNING
} from '../src/core/simulation.js';
import {
    bakeEnemyNavigationGraph,
    enemyNavigationProfileKey,
    normalizeEnemyNavigationProfile
} from '../src/core/enemy-navigation.js';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REFERENCE_ROOT = path.resolve(SCRIPT_DIR, '..');
const RESOURCES_ROOT = path.join(REFERENCE_ROOT, 'resources');
const LEVELS_ROOT = path.join(RESOURCES_ROOT, 'levels');
const ENEMY_CATALOG_PATH = path.join(RESOURCES_ROOT, 'characters', 'ct_enemies_001.json');
const TUNING_PATH = path.join(RESOURCES_ROOT, 'config', 'tuning.json');

function parseArgs(argv) {
    const options = {
        write: false,
        check: false,
        levelNames: [],
        verbose: false
    };
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === '--write') options.write = true;
        else if (arg === '--check') options.check = true;
        else if (arg === '--verbose') options.verbose = true;
        else if (arg === '--level') {
            const value = argv[++index];
            if (!value) throw new Error('--level requires a level id or filename');
            options.levelNames.push(value.endsWith('.json') ? value : `${value}.json`);
        } else if (arg === '--help' || arg === '-h') {
            options.help = true;
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }
    if (options.write && options.check) {
        throw new Error('--write and --check are mutually exclusive');
    }
    return options;
}

function usage() {
    console.log(`Usage: node reference/devel/rebake_navigation_graphs.mjs [--write|--check] [--verbose] [--level level_004]\n\n` +
        `Without --write, prints a deterministic dry-run summary.\n` +
        `--write rewrites only levels whose navigationGraphs differ.\n` +
        `--check exits non-zero if any authored level needs a rebake. level_temp.json is scratch playtest data and is skipped unless named explicitly with --level.`);
}

async function readJson(filePath) {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

function wizardNavigationProfile(tuning = DEFAULT_TUNING) {
    const width = Math.max(8, Number(tuning?.playerWidth) || DEFAULT_TUNING.playerWidth);
    const height = Math.max(24, Number(tuning?.playerHeight) || DEFAULT_TUNING.playerHeight);
    const gravity = Math.max(1, Number(tuning?.gravity) || DEFAULT_TUNING.gravity);
    const safeImpactSpeed = Math.max(0, Number(tuning?.fallDamageSafeImpactSpeed) || DEFAULT_TUNING.fallDamageSafeImpactSpeed);
    return normalizeEnemyNavigationProfile({
        bodyWidth: width,
        bodyHeight: height,
        runSpeed: Math.max(1, Number(tuning?.maxRunSpeed) || DEFAULT_TUNING.maxRunSpeed),
        groundAcceleration: Math.max(1, Number(tuning?.groundAcceleration) || DEFAULT_TUNING.groundAcceleration),
        jumpHeight: Math.max(0, Number(tuning?.ordinaryJumpHeight) || DEFAULT_TUNING.ordinaryJumpHeight),
        gravity,
        maxFallDistance: safeImpactSpeed > 0 ? safeImpactSpeed * safeImpactSpeed / (2 * gravity) : 0,
        maxStepHeight: height * 0.20,
        maxStepGap: Math.max(10, Math.min(28, width * 0.32 || 18)),
        edgeInset: Math.max(6, width * 0.22 || 10),
        bodyClearance: Math.max(10, width * 0.34 || 12)
    });
}

function navigationProfileForEnemy(enemy) {
    const width = Math.max(8, Number(enemy?.width) || 48);
    const height = Math.max(24, Number(enemy?.height) || 120);
    return normalizeEnemyNavigationProfile({
        bodyWidth: width,
        bodyHeight: height,
        runSpeed: Math.max(1, Number(enemy?.runSpeed) || 1),
        groundAcceleration: Math.max(1, Number(enemy?.runAcceleration) || 1),
        jumpHeight: Math.max(0, Number(enemy?.jumpHeight) || 0),
        gravity: Math.max(1, Number(enemy?.jumpGravity) || 1),
        maxFallDistance: Math.max(0, Number(enemy?.maxFallDistance) || 0),
        maxStepHeight: Math.max(0, Number(enemy?.maxStepHeight) || 0),
        maxStepGap: Math.max(10, Math.min(28, width * 0.32 || 18)),
        edgeInset: Math.max(6, width * 0.22 || 10),
        bodyClearance: Math.max(10, width * 0.34 || 12)
    });
}

async function loadAtlasManifestsForWorld(world) {
    const atlasIds = [...new Set((world?.visuals || [])
        .filter((visual) => visual?.kind === 'atlasSprite' && !visual.entityId)
        .map((visual) => String(visual.atlasId || '').trim())
        .filter(Boolean))].sort();
    const manifests = new Map();
    for (const atlasId of atlasIds) {
        const atlasPath = path.join(RESOURCES_ROOT, 'atlases', `${atlasId}.json`);
        manifests.set(atlasId, await readJson(atlasPath));
    }
    return manifests;
}

function stableJson(value) {
    return JSON.stringify(value);
}

async function bakeLevel(levelPath, enemyCatalog, gameTuning) {
    const document = await readJson(levelPath);
    const level = document?.level && typeof document.level === 'object' ? document.level : document;
    const state = createInitialGameState({ tuning: gameTuning });
    applyEnemyDefinitionCatalog(state, enemyCatalog);
    if (!applyEditorLevelToWorld(state, level)) {
        throw new Error(`Could not load ${path.basename(levelPath)} into the portable simulation`);
    }

    // Level Editor navigation is based only on authored terrain placements.
    // Entity artwork/collision is intentionally excluded from the static hunter graph.
    state.world.visuals = (state.world.visuals || []).filter((visual) => !visual?.entityId);
    const atlasManifests = await loadAtlasManifestsForWorld(state.world);
    applyAtlasManifestsToWorld(state, atlasManifests);

    const profilesById = new Map([["wizard", wizardNavigationProfile(state.tuning)]]);
    for (const enemy of state.enemies || []) {
        if (String(enemy?.strategy || 'simple_patrol') !== 'hunter') continue;
        const profile = navigationProfileForEnemy(enemy);
        profilesById.set(enemyNavigationProfileKey(profile), profile);
    }

    const navigationWorld = {
        segments: state.world.segments || [],
        collisionPolygons: state.world.collisionPolygons || [],
        solids: [],
        navigationBlockers: Array.isArray(level.navigationBlockers) ? level.navigationBlockers : []
    };
    const profiles = [...profilesById.entries()].map(([id, profile]) => bakeEnemyNavigationGraph(navigationWorld, profile, {
        id,
        label: id === "wizard"
            ? `Wizard · body ${profile.bodyWidth}×${profile.bodyHeight} · stride ${profile.maxStepHeight}`
            : `Run ${profile.runSpeed}, jump ${profile.jumpHeight}, body ${profile.bodyWidth}×${profile.bodyHeight}`
    }));
    const next = { version: 2, profiles };
    const previous = level.navigationGraphs && typeof level.navigationGraphs === 'object'
        ? level.navigationGraphs
        : { version: 2, profiles: [] };
    return { document, level, previous, next };
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
        usage();
        return;
    }
    const [enemyCatalog, gameTuning] = await Promise.all([
        readJson(ENEMY_CATALOG_PATH),
        readJson(TUNING_PATH)
    ]);
    const allNames = (await fs.readdir(LEVELS_ROOT))
        .filter((name) => /^level_[A-Za-z0-9_]+\.json$/.test(name) && name !== 'level_temp.json')
        .sort();
    const names = options.levelNames.length ? options.levelNames : allNames;
    let changed = 0;
    let totalProfiles = 0;
    let totalEdges = 0;
    for (const name of names) {
        const levelPath = path.join(LEVELS_ROOT, name);
        const { document, level, previous, next } = await bakeLevel(levelPath, enemyCatalog, gameTuning);
        const differs = stableJson(previous) !== stableJson(next);
        totalProfiles += next.profiles.length;
        totalEdges += next.profiles.reduce((sum, graph) => sum + (graph.edges?.length || 0), 0);
        if (differs) changed += 1;
        if (differs && options.verbose) {
            const oldProfiles = Array.isArray(previous) ? previous : (Array.isArray(previous?.profiles) ? previous.profiles : []);
            const oldById = new Map(oldProfiles.map((graph) => [String(graph?.id || ''), graph]));
            for (const graph of next.profiles) {
                const old = oldById.get(String(graph.id));
                if (!old) {
                    console.log(`      + profile ${graph.id}`);
                    continue;
                }
                const supportNote = old.supportSignature === graph.supportSignature ? 'supports=same' : 'supports=DIFF';
                const oldEdges = Array.isArray(old.edges) ? old.edges : [];
                const edgeNote = stableJson(oldEdges) === stableJson(graph.edges) ? 'edges=same' : `edges=${oldEdges.length}->${graph.edges.length}`;
                console.log(`      ${graph.id}: ${supportNote}, ${edgeNote}`);
            }
            for (const old of oldProfiles) {
                if (!next.profiles.some((graph) => graph.id === old?.id)) console.log(`      - profile ${old?.id || '(missing id)'}`);
            }
        }
        console.log(`${differs ? 'CHANGE' : 'OK    '} ${name}: ${next.profiles.length} profile(s), ${next.profiles.reduce((sum, graph) => sum + (graph.edges?.length || 0), 0)} edge(s)`);
        if (differs && options.write) {
            level.navigationGraphs = next;
            await fs.writeFile(levelPath, `${JSON.stringify(document, null, 4)}\n`, 'utf8');
        }
    }
    console.log(`Rebake summary: ${names.length} level(s), ${changed} changed, ${totalProfiles} profile(s), ${totalEdges} edge(s).`);
    if (options.check && changed > 0) process.exitCode = 1;
}

main().catch((error) => {
    console.error(error?.stack || String(error));
    process.exitCode = 1;
});
