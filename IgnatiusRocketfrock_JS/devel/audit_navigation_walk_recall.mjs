#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { probeEnemyNavigationWalkingEndpoint } from '../src/core/simulation.js';
import { buildCanonicalNavigationWorld, rebakeAndVerifyNavigation } from '../src/tools/navigation-rebake.js';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REFERENCE_ROOT = path.resolve(SCRIPT_DIR, '..');
const RESOURCES_ROOT = path.join(REFERENCE_ROOT, 'resources');
const LEVELS_ROOT = path.join(RESOURCES_ROOT, 'levels');

function parseArgs(argv) {
    const options = { levels: [], campaign: false, profile: 'wizard', allProfiles: false, failOnMiss: false, verbose: false };
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === '--level') options.levels.push(String(argv[++index] || '').replace(/\.json$/i, ''));
        else if (arg === '--campaign') options.campaign = true;
        else if (arg === '--profile') options.profile = String(argv[++index] || 'wizard');
        else if (arg === '--all-profiles') options.allProfiles = true;
        else if (arg === '--fail-on-miss') options.failOnMiss = true;
        else if (arg === '--verbose') options.verbose = true;
        else if (arg === '--help' || arg === '-h') options.help = true;
        else throw new Error(`Unknown argument: ${arg}`);
    }
    return options;
}

async function readJson(filePath) { return JSON.parse(await fs.readFile(filePath, 'utf8')); }

async function contextForLevel(level) {
    const tuning = await readJson(path.join(RESOURCES_ROOT, 'config', 'tuning.json'));
    const enemyCatalog = await readJson(path.join(RESOURCES_ROOT, 'characters', 'ct_enemies_001.json'));
    const source = level?.level && typeof level.level === 'object' ? level.level : level;
    const refByAtlasId = new Map((source?.atlasRefs || []).map((ref) => [String(ref?.atlasId || ''), String(ref?.manifest || '')]));
    const atlasIds = [...new Set((source?.placements || [])
        .filter((placement) => placement?.kind === 'atlasAsset' && placement?.collisionFromManifest !== false)
        .map((placement) => String(placement.atlasId || 'at_atlas_001').trim())
        .filter(Boolean))];
    const manifestByAtlasId = {};
    for (const atlasId of atlasIds) {
        const relativePath = (refByAtlasId.get(atlasId) || `atlases/${atlasId}.json`).replace(/^resources\//, '');
        manifestByAtlasId[atlasId] = await readJson(path.join(RESOURCES_ROOT, relativePath));
    }
    return { tuning, enemyCatalog, manifestByAtlasId };
}

function pairKey(from, to) { return `${from}\u0000${to}`; }

async function levelNames(options) {
    if (options.levels.length) return options.levels.map((name) => name.endsWith('.json') ? name : `${name}.json`);
    if (!options.campaign) return ['level_004.json'];
    return (await fs.readdir(LEVELS_ROOT))
        .filter((name) => /^level_\d+\.json$/i.test(name))
        .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

const options = parseArgs(process.argv.slice(2));
if (options.help) {
    console.log('Usage: node reference/devel/audit_navigation_walk_recall.mjs [--level level_004 | --campaign] [--profile wizard|substring] [--all-profiles] [--fail-on-miss] [--verbose]');
    process.exit(0);
}

let totalProbes = 0;
let totalCrossings = 0;
let totalReciprocal = 0;
const misses = [];
const levels = await levelNames(options);
for (const levelName of levels) {
    const level = await readJson(path.join(LEVELS_ROOT, levelName));
    const context = await contextForLevel(level);
    const { world } = buildCanonicalNavigationWorld(level, context);
    const rebaked = rebakeAndVerifyNavigation(level, context, { verifyBySimulation: false, includeWizard: true });
    const profiles = rebaked.profiles.filter((graph) => options.allProfiles || String(graph.id || '').includes(options.profile));
    for (const graph of profiles) {
        const directed = new Map();
        for (const support of graph.supports || []) {
            for (const direction of [-1, 1]) {
                totalProbes += 1;
                const result = probeEnemyNavigationWalkingEndpoint(world, graph, support.id, direction);
                if (result.status !== 'crossed' || !result.reachedSupportId || result.reachedSupportId === support.id) continue;
                totalCrossings += 1;
                directed.set(pairKey(support.id, result.reachedSupportId), result);
                if (options.verbose) console.log(`${levelName} ${graph.id}: ${support.id} -> ${result.reachedSupportId} (${direction < 0 ? 'left' : 'right'}, ${result.ticks} ticks)`);
            }
        }
        const seen = new Set();
        for (const [key, forward] of directed) {
            const [from, to] = key.split('\u0000');
            const reverse = directed.get(pairKey(to, from));
            if (!reverse) continue;
            const canonical = [from, to].sort().join('\u0000');
            if (seen.has(canonical)) continue;
            seen.add(canonical);
            totalReciprocal += 1;
            const fromSupport = (graph.supports || []).find((support) => support.id === from);
            const toSupport = (graph.supports || []).find((support) => support.id === to);
            if (!fromSupport || !toSupport || (fromSupport.walkRegionId && fromSupport.walkRegionId === toSupport.walkRegionId)) continue;
            misses.push({ level: levelName, profile: graph.id, from, to, fromRegion: fromSupport.walkRegionId || null, toRegion: toSupport.walkRegionId || null, forward, reverse });
            console.log(`MISS ${levelName} ${graph.id}: runtime walks both ways but cyan is split: ${from} <-> ${to}`);
        }
    }
}

console.log(`Navigation walking recall: ${levels.length} level(s), ${totalProbes} endpoint probe(s), ${totalCrossings} directed crossing(s), ${totalReciprocal} reciprocal crossing pair(s), ${misses.length} missed cyan connection(s).`);
if (options.failOnMiss && misses.length) process.exitCode = 1;
