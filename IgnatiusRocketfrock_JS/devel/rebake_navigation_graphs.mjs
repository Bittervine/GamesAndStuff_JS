#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { rebakeAndVerifyNavigation } from '../src/tools/navigation-rebake.js';

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
        verbose: false,
        nrOfAltJumps: 6
    };
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === '--write') options.write = true;
        else if (arg === '--check') options.check = true;
        else if (arg === '--verbose') options.verbose = true;
        else if (arg === '--nr-of-alt-jumps') {
            const value = Number(argv[++index]);
            if (!Number.isFinite(value) || value < 0) throw new Error('--nr-of-alt-jumps requires a non-negative integer');
            options.nrOfAltJumps = Math.floor(value);
        } else if (arg === '--level') {
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
        `--write rewrites only levels whose heuristic navigation graph differs; unchanged verified/failed evidence is preserved.\n` +
        `--check ignores verification status metadata and exits non-zero only when an authored numeric level needs a heuristic rebake. level_tNN fixtures and level_temp.json are skipped unless named explicitly with --level.`);
}

async function readJson(filePath) {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function loadAtlasManifestsForLevel(level) {
    const refByAtlasId = new Map((level?.atlasRefs || []).map((ref) => [String(ref?.atlasId || ''), String(ref?.manifest || '')]));
    const atlasIds = [...new Set((level?.placements || [])
        .filter((placement) => placement?.kind === 'atlasAsset' && placement?.collisionFromManifest !== false)
        .map((placement) => String(placement.atlasId || 'at_atlas_001').trim())
        .filter(Boolean))].sort();
    const manifests = {};
    for (const atlasId of atlasIds) {
        const manifestPath = (refByAtlasId.get(atlasId) || `atlases/${atlasId}.json`).replace(/^resources\//, '');
        manifests[atlasId] = await readJson(path.join(RESOURCES_ROOT, manifestPath));
    }
    return manifests;
}

function stableJson(value) {
    return JSON.stringify(value);
}

function heuristicEdgeShape(edge) {
    if (!edge || typeof edge !== 'object') return edge;
    const { verification, verificationFailure, verificationDiagnostics, ...shape } = edge;
    return shape;
}

function heuristicGraphShape(collection) {
    const source = collection && typeof collection === 'object' ? collection : { version: 2, profiles: [] };
    return {
        ...source,
        profiles: (Array.isArray(source.profiles) ? source.profiles : []).map((graph) => {
            const build = graph?.build && typeof graph.build === 'object'
                ? Object.fromEntries(Object.entries(graph.build).filter(([key]) => key !== 'simulationCheck' && key !== 'verificationInputSignature'))
                : graph?.build;
            return {
                ...graph,
                build,
                edges: (graph?.edges || []).map(heuristicEdgeShape)
            };
        })
    };
}

async function bakeLevel(levelPath, enemyCatalog, gameTuning, nrOfAltJumps) {
    const document = await readJson(levelPath);
    const level = document?.level && typeof document.level === 'object' ? document.level : document;
    const manifestByAtlasId = await loadAtlasManifestsForLevel(level);
    const result = rebakeAndVerifyNavigation(document, {
        manifestByAtlasId,
        enemyCatalog,
        tuning: gameTuning
    }, {
        verifyBySimulation: false,
        preserveMatchingVerification: true,
        includeWizard: true,
        stepTransitionMethod: 'stride_arc',
        compareStepMethods: false,
        nrOfAltJumps
    });
    const nextDocument = result.level;
    const nextLevel = nextDocument?.level && typeof nextDocument.level === 'object' ? nextDocument.level : nextDocument;
    const previous = level.navigationGraphs && typeof level.navigationGraphs === 'object'
        ? level.navigationGraphs
        : { version: 2, profiles: [] };
    const next = nextLevel.navigationGraphs || { version: 2, profiles: [] };
    return { document, level, previous, next, summary: result.summary || {} };
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
        .filter((name) => /^level_\d+\.json$/.test(name))
        .sort();
    const names = options.levelNames.length ? options.levelNames : allNames;
    let changed = 0;
    let totalProfiles = 0;
    let totalEdges = 0;
    for (const name of names) {
        const levelPath = path.join(LEVELS_ROOT, name);
        const { document, level, previous, next, summary } = await bakeLevel(levelPath, enemyCatalog, gameTuning, options.nrOfAltJumps);
        const differs = stableJson(heuristicGraphShape(previous)) !== stableJson(heuristicGraphShape(next));
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
                const edgeNote = stableJson(oldEdges.map(heuristicEdgeShape)) === stableJson((graph.edges || []).map(heuristicEdgeShape))
                    ? 'edges=same'
                    : `edges=${oldEdges.length}->${graph.edges.length}`;
                console.log(`      ${graph.id}: ${supportNote}, ${edgeNote}`);
            }
            for (const old of oldProfiles) {
                if (!next.profiles.some((graph) => graph.id === old?.id)) console.log(`      - profile ${old?.id || '(missing id)'}`);
            }
        }
        console.log(`${differs ? 'CHANGE' : 'OK    '} ${name}: ${next.profiles.length} profile(s), ${next.profiles.reduce((sum, graph) => sum + (graph.edges?.length || 0), 0)} edge(s)${options.verbose ? `, heuristic ${(Number(summary.heuristicElapsedMs) || 0).toFixed(1)} ms, alt=${summary.nrOfAltJumps ?? options.nrOfAltJumps}` : ''}`);
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
