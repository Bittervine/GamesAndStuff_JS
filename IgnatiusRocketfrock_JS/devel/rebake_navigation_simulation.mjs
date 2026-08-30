#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { verifyEnemyNavigationGraphBySimulation } from '../src/core/simulation.js';
import {
    buildCanonicalNavigationWorld,
    rebakeAndVerifyNavigation,
    stampNavigationLocalProofHashes
} from '../src/tools/navigation-rebake.js';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REFERENCE_ROOT = path.resolve(SCRIPT_DIR, '..');
const RESOURCES_ROOT = path.join(REFERENCE_ROOT, 'resources');
const LEVELS_ROOT = path.join(RESOURCES_ROOT, 'levels');
const ENEMY_CATALOG_PATH = path.join(RESOURCES_ROOT, 'characters', 'ct_enemies_001.json');
const TUNING_PATH = path.join(RESOURCES_ROOT, 'config', 'tuning.json');
const DEFAULT_CHECKPOINT_DIR = path.resolve(REFERENCE_ROOT, '..', 'devel', 'out', 'navigation-rebake-checkpoints');
const CANDIDATE_TYPES = new Set(['step', 'jump', 'drop']);
const FINAL_STATES = new Set(['verified', 'failed']);

function parseArgs(argv) {
    const options = {
        write: false,
        reset: false,
        levelNames: [],
        chunkSize: 128,
        maxChunks: null,
        checkpointDir: DEFAULT_CHECKPOINT_DIR,
        verbose: false
    };
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === '--write') options.write = true;
        else if (arg === '--reset') options.reset = true;
        else if (arg === '--verbose') options.verbose = true;
        else if (arg === '--level') {
            const value = argv[++index];
            if (!value) throw new Error('--level requires a level id or filename');
            options.levelNames.push(value.endsWith('.json') ? value : `${value}.json`);
        } else if (arg === '--chunk-size') {
            const value = Number(argv[++index]);
            if (!Number.isFinite(value) || value < 1) throw new Error('--chunk-size requires a positive integer');
            options.chunkSize = Math.max(1, Math.floor(value));
        } else if (arg === '--max-chunks') {
            const value = Number(argv[++index]);
            if (!Number.isFinite(value) || value < 1) throw new Error('--max-chunks requires a positive integer');
            options.maxChunks = Math.max(1, Math.floor(value));
        } else if (arg === '--checkpoint-dir') {
            const value = argv[++index];
            if (!value) throw new Error('--checkpoint-dir requires a directory');
            options.checkpointDir = path.resolve(value);
        } else if (arg === '--help' || arg === '-h') {
            options.help = true;
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }
    return options;
}

function usage() {
    console.log('Usage: node reference/devel/rebake_navigation_simulation.mjs [--write] [--level level_004] [--chunk-size 128] [--max-chunks N] [--reset] [--verbose]');
    console.log('');
    console.log('Simulation proofs are checkpointed outside shipped level JSON after every chunk.');
    console.log('A level is written only after every profile is fully proved and a final canonical proof-hash reuse pass succeeds.');
}

async function readJson(filePath) {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

function cloneData(value) {
    return JSON.parse(JSON.stringify(value));
}

function levelObject(document) {
    return document?.level && typeof document.level === 'object' ? document.level : document;
}

function setNavigationGraphs(document, navigationGraphs) {
    const clone = cloneData(document);
    const level = levelObject(clone);
    level.navigationGraphs = cloneData(navigationGraphs);
    return clone;
}

function authoredLevelHash(document) {
    const clone = cloneData(document);
    const level = levelObject(clone);
    if (level && typeof level === 'object') delete level.navigationGraphs;
    return crypto.createHash('sha256').update(JSON.stringify(clone)).digest('hex');
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

function candidateEdge(edge) {
    return CANDIDATE_TYPES.has(String(edge?.type || ''));
}

function finalVerification(edge) {
    return FINAL_STATES.has(String(edge?.verification || '').trim().toLowerCase());
}

function proofCounts(profiles) {
    let candidates = 0;
    let verified = 0;
    let failed = 0;
    let unverified = 0;
    let salvage = 0;
    for (const graph of profiles || []) {
        for (const edge of graph?.edges || []) {
            if (edge?.simulationSalvage) salvage += 1;
            if (!candidateEdge(edge) || edge?.simulationSalvage) continue;
            candidates += 1;
            const state = String(edge?.verification || '').trim().toLowerCase();
            if (state === 'verified') verified += 1;
            else if (state === 'failed') failed += 1;
            else unverified += 1;
        }
    }
    return { candidates, verified, failed, unverified, salvage };
}

function checkpointPath(checkpointDir, levelName) {
    return path.join(checkpointDir, `${levelName.replace(/\.json$/i, '')}.navigation-proof-checkpoint.json`);
}

async function atomicWrite(filePath, text) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const temporary = `${filePath}.tmp-${process.pid}`;
    await fs.writeFile(temporary, text, 'utf8');
    await fs.rename(temporary, filePath);
}

async function loadCheckpoint(filePath, sourceHash, reset) {
    if (reset) {
        await fs.rm(filePath, { force: true });
        return null;
    }
    try {
        const checkpoint = await readJson(filePath);
        if (checkpoint?.version !== 1) throw new Error('unsupported checkpoint version');
        if (checkpoint?.sourceHash !== sourceHash) {
            throw new Error('authored level hash changed');
        }
        if (!checkpoint?.navigationGraphs || !Array.isArray(checkpoint.navigationGraphs.profiles)) {
            throw new Error('checkpoint has no navigation profiles');
        }
        return checkpoint;
    } catch (error) {
        if (error?.code === 'ENOENT') return null;
        console.warn(`Ignoring ${path.basename(filePath)}: ${error.message}`);
        return null;
    }
}

async function saveCheckpoint(filePath, levelName, sourceHash, profiles, status, detail = {}) {
    const counts = proofCounts(profiles);
    const checkpoint = {
        version: 1,
        level: levelName,
        sourceHash,
        status,
        counts,
        detail,
        navigationGraphs: { version: 2, profiles }
    };
    await atomicWrite(filePath, `${JSON.stringify(checkpoint, null, 2)}\n`);
    return counts;
}

function canonicalBake(document, context, verifyBySimulation) {
    return rebakeAndVerifyNavigation(document, context, {
        verifyBySimulation,
        reuseSimulationProofs: true,
        preserveMatchingVerification: true,
        includeWizard: true,
        stepTransitionMethod: 'stride_arc',
        compareStepMethods: false,
        progressInterval: 20
    });
}

function replaceEdgeProofs(graph, provenEdges) {
    const byId = new Map((provenEdges || []).map((edge) => [String(edge?.id || ''), edge]));
    return {
        ...graph,
        edges: (graph?.edges || []).map((edge) => byId.get(String(edge?.id || '')) || edge)
    };
}

function stableJsonValue(value) {
    if (Array.isArray(value)) return value.map(stableJsonValue);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableJsonValue(value[key])]));
}

function proofStateJson(profiles) {
    const clone = cloneData(profiles || []);
    for (const graph of clone) {
        if (graph?.build && typeof graph.build === 'object') delete graph.build.simulationCheck;
    }
    return JSON.stringify(stableJsonValue(clone));
}

function assertCompleteProofState(levelName, profiles, requireWalkRegionHashes = false) {
    for (const graph of profiles || []) {
        for (const edge of graph?.edges || []) {
            if (!candidateEdge(edge)) continue;
            if (!finalVerification(edge)) {
                throw new Error(`${levelName} ${graph.id}: edge ${edge?.id || '<unnamed>'} is not simulation-final`);
            }
            if (!String(edge?.verificationInputHash || '').startsWith('navproof-v')) {
                throw new Error(`${levelName} ${graph.id}: edge ${edge?.id || '<unnamed>'} has no stamped navigation proof hash`);
            }
        }
        if (requireWalkRegionHashes) {
            for (const region of graph?.walkRegions || []) {
                if (!String(region?.verificationInputHash || '').startsWith('navwalkproof-v')) {
                    throw new Error(`${levelName} ${graph.id}: walk region ${region?.id || '<unnamed>'} has no stamped navigation proof hash`);
                }
            }
        }
    }
}

async function prepareLevel(levelName, enemyCatalog, tuning, options, budget) {
    const levelPath = path.join(LEVELS_ROOT, levelName);
    const document = await readJson(levelPath);
    const sourceHash = authoredLevelHash(document);
    const checkpointFile = checkpointPath(options.checkpointDir, levelName);
    const checkpoint = await loadCheckpoint(checkpointFile, sourceHash, options.reset);
    const level = levelObject(document);
    const manifestByAtlasId = await loadAtlasManifestsForLevel(level);
    const context = { enemyCatalog, tuning, manifestByAtlasId };
    const seededDocument = checkpoint
        ? setNavigationGraphs(document, checkpoint.navigationGraphs)
        : document;
    const candidate = canonicalBake(seededDocument, context, false);
    const profiles = candidate.profiles.map((graph) => cloneData(graph));
    const { world } = buildCanonicalNavigationWorld(document, context);

    const initialCounts = proofCounts(profiles);
    console.log(`${levelName}: ${profiles.length} profile(s), ${initialCounts.candidates} candidate edge(s), ${initialCounts.unverified} proof(s) pending${checkpoint ? ' (checkpoint resumed)' : ''}.`);

    for (let profileIndex = 0; profileIndex < profiles.length; profileIndex += 1) {
        let graph = profiles[profileIndex];
        let pending = (graph.edges || []).filter((edge) => candidateEdge(edge) && !edge?.simulationSalvage && !finalVerification(edge));
        if (pending.length > 0) {
            console.log(`  ${graph.id}: ${pending.length} raw proof(s) pending.`);
        }
        while (pending.length > 0) {
            if (options.maxChunks !== null && budget.chunks >= options.maxChunks) {
                const counts = await saveCheckpoint(checkpointFile, levelName, sourceHash, profiles, 'paused', {
                    profileId: graph.id,
                    reason: 'max_chunks'
                });
                console.log(`PAUSED ${levelName}: checkpoint saved with ${counts.unverified} raw proof(s) remaining.`);
                return { complete: false, written: false, counts };
            }
            const chunk = pending.slice(0, options.chunkSize);
            const chunkGraph = { ...graph, edges: chunk };
            const verification = verifyEnemyNavigationGraphBySimulation(world, chunkGraph, {
                salvageWrongSupportLandings: false
            });
            graph = stampNavigationLocalProofHashes(world, replaceEdgeProofs(graph, verification.graph.edges));
            profiles[profileIndex] = graph;
            budget.chunks += 1;
            const counts = await saveCheckpoint(checkpointFile, levelName, sourceHash, profiles, 'raw_proofs', {
                profileId: graph.id,
                chunk: budget.chunks
            });
            if (options.verbose) {
                console.log(`    chunk ${budget.chunks}: ${chunk.length} simulated, ${verification.summary.failedEdges ?? verification.summary.rejectedEdges} failed, ${counts.unverified} level proof(s) remain.`);
            } else {
                process.stdout.write('.');
            }
            pending = (graph.edges || []).filter((edge) => candidateEdge(edge) && !edge?.simulationSalvage && !finalVerification(edge));
        }
        if (!options.verbose) process.stdout.write('\n');

        // Run the whole profile once with cached raw verdicts. This does not
        // resimulate them; it performs the graph-global wrong-support salvage
        // decision and separately proves only any proposed salvage edge(s).
        const finalized = verifyEnemyNavigationGraphBySimulation(world, graph, {
            reuseExistingVerification: true,
            salvageWrongSupportLandings: true
        });
        graph = stampNavigationLocalProofHashes(world, finalized.graph);
        profiles[profileIndex] = graph;
        await saveCheckpoint(checkpointFile, levelName, sourceHash, profiles, 'profile_finalized', {
            profileId: graph.id,
            salvageProofChecks: finalized.summary.salvageProofChecks || 0,
            salvagedEdges: finalized.summary.salvagedEdges || 0
        });
        console.log(`  ${graph.id}: raw proofs complete; ${finalized.summary.salvageProofChecks || 0} salvage proof check(s), ${finalized.summary.salvagedEdges || 0} admitted.`);
    }

    assertCompleteProofState(levelName, profiles, true);
    const stagedProofState = proofStateJson(profiles);
    const stagedDocument = setNavigationGraphs(document, { version: 2, profiles });
    const finalCanonical = canonicalBake(stagedDocument, context, true);
    if (finalCanonical.summary.unverifiedEdges !== 0) {
        throw new Error(`${levelName}: final canonical pass left ${finalCanonical.summary.unverifiedEdges} unverified edge(s)`);
    }
    if (finalCanonical.summary.checkedEdges !== 0) {
        throw new Error(`${levelName}: final canonical pass had to re-simulate ${finalCanonical.summary.checkedEdges} raw edge(s); checkpoint proof hashes were not fully reusable`);
    }
    assertCompleteProofState(levelName, finalCanonical.profiles, true);
    if (proofStateJson(finalCanonical.profiles) !== stagedProofState) {
        throw new Error(`${levelName}: final canonical pass changed navigation proof state beyond transient simulation accounting`);
    }
    const finalCounts = proofCounts(finalCanonical.profiles);
    await saveCheckpoint(checkpointFile, levelName, sourceHash, finalCanonical.profiles, 'complete', {
        canonicalCheckedEdges: finalCanonical.summary.checkedEdges,
        canonicalReusedEdges: finalCanonical.summary.reusedSimulationEdges,
        salvageProofChecks: finalCanonical.summary.salvageProofChecks || 0,
        salvagedEdges: finalCanonical.summary.salvagedEdges || 0
    });

    let written = false;
    if (options.write) {
        await atomicWrite(levelPath, `${JSON.stringify(finalCanonical.level, null, 4)}\n`);
        written = true;
    }
    console.log(`${options.write ? 'WRITE' : 'READY'} ${levelName}: ${finalCounts.verified} verified, ${finalCounts.failed} failed, ${finalCounts.salvage} salvage edge(s); canonical pass simulated ${finalCanonical.summary.checkedEdges} raw edge(s).`);
    return { complete: true, written, counts: finalCounts };
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
        usage();
        return;
    }
    await fs.mkdir(options.checkpointDir, { recursive: true });
    const [enemyCatalog, tuning] = await Promise.all([
        readJson(ENEMY_CATALOG_PATH),
        readJson(TUNING_PATH)
    ]);
    const allNames = (await fs.readdir(LEVELS_ROOT)).filter((name) => /^level_\d+\.json$/i.test(name)).sort();
    const names = options.levelNames.length ? options.levelNames : allNames;
    const budget = { chunks: 0 };
    let completed = 0;
    let written = 0;
    for (const name of names) {
        const result = await prepareLevel(name, enemyCatalog, tuning, options, budget);
        if (!result.complete) break;
        completed += 1;
        if (result.written) written += 1;
    }
    console.log(`Simulation rebake summary: ${completed}/${names.length} level(s) complete, ${written} written, ${budget.chunks} raw simulation chunk(s) executed this run.`);
}

main().catch((error) => {
    console.error(error?.stack || String(error));
    process.exitCode = 1;
});
