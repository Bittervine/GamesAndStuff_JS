#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { verifyEnemyNavigationGraphBySimulation } from '../src/core/simulation.js';
import {
    buildCanonicalNavigationWorld,
    rebakeAndVerifyNavigation
} from '../src/tools/navigation-rebake.js';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REFERENCE_ROOT = path.resolve(SCRIPT_DIR, '..');
const PROJECT_ROOT = path.resolve(REFERENCE_ROOT, '..');
const RESOURCES_ROOT = path.join(REFERENCE_ROOT, 'resources');
const LEVELS_ROOT = path.join(RESOURCES_ROOT, 'levels');
const ENEMY_CATALOG_PATH = path.join(RESOURCES_ROOT, 'characters', 'ct_enemies_001.json');
const TUNING_PATH = path.join(RESOURCES_ROOT, 'config', 'tuning.json');

function parseArgs(argv) {
    const options = {
        levelNames: [],
        profileFilters: [],
        nativePath: '',
        chunkSize: 256,
        startEdge: 1,
        maxEdges: null,
        campaign: false,
        fullGraph: false,
        buildParity: false,
        collectMismatches: 1,
        verbose: false
    };
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === '--level') {
            const value = argv[++index];
            if (!value) throw new Error('--level requires a level id or filename');
            options.levelNames.push(value.endsWith('.json') ? value : `${value}.json`);
        } else if (arg === '--profile') {
            const value = argv[++index];
            if (!value) throw new Error('--profile requires a graph id or substring');
            options.profileFilters.push(value);
        } else if (arg === '--native') {
            const value = argv[++index];
            if (!value) throw new Error('--native requires the IgnatiusTests executable path');
            options.nativePath = path.resolve(value);
        } else if (arg === '--chunk-size') {
            const value = Number(argv[++index]);
            if (!Number.isFinite(value) || value < 1) throw new Error('--chunk-size requires a positive integer');
            options.chunkSize = Math.max(1, Math.floor(value));
        } else if (arg === '--start-edge') {
            const value = Number(argv[++index]);
            if (!Number.isFinite(value) || value < 1) throw new Error('--start-edge requires a positive 1-based edge index');
            options.startEdge = Math.max(1, Math.floor(value));
        } else if (arg === '--max-edges') {
            const value = Number(argv[++index]);
            if (!Number.isFinite(value) || value < 1) throw new Error('--max-edges requires a positive integer');
            options.maxEdges = Math.max(1, Math.floor(value));
        } else if (arg === '--campaign') {
            options.campaign = true;
        } else if (arg === '--full-graph') {
            options.fullGraph = true;
        } else if (arg === '--build-parity') {
            options.buildParity = true;
        } else if (arg === '--collect-mismatches') {
            const value = Number(argv[++index]);
            if (!Number.isFinite(value) || value < 1) throw new Error('--collect-mismatches requires a positive integer');
            options.collectMismatches = Math.max(1, Math.floor(value));
        } else if (arg === '--verbose') {
            options.verbose = true;
        } else if (arg === '--help' || arg === '-h') {
            options.help = true;
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }
    return options;
}

function usage() {
    console.log('Usage: node reference/devel/check_navigation_simulation_parity.mjs [--level level_t01 | --campaign] [--profile filter] [--native path] [--chunk-size 256] [--start-edge 1] [--max-edges N] [--full-graph] [--build-parity] [--collect-mismatches N] [--verbose]');
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

async function findNativeExecutable(explicitPath) {
    const candidates = explicitPath ? [explicitPath] : [
        path.join(PROJECT_ROOT, 'build-linux', 'IgnatiusTests'),
        path.join(PROJECT_ROOT, 'build', 'Release', 'IgnatiusTests.exe'),
        path.join(PROJECT_ROOT, 'build', 'RelWithDebInfo', 'IgnatiusTests.exe'),
        path.join(PROJECT_ROOT, 'build-windows', 'Release', 'IgnatiusTests.exe')
    ];
    for (const candidate of candidates) {
        try {
            await fs.access(candidate);
            return candidate;
        } catch {
            // Keep looking.
        }
    }
    throw new Error(`Could not find IgnatiusTests. Build it first or pass --native. Tried:\n${candidates.join('\n')}`);
}

function candidateEdge(edge) {
    return edge?.type === 'step' || edge?.type === 'jump' || edge?.type === 'drop';
}

function normalizedNullable(value) {
    return value === undefined || value === null || value === '' ? null : value;
}

function rounded(value) {
    if (value === undefined || value === null || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? Math.round(number * 1000) / 1000 : null;
}

function normalizedDiagnostics(edge) {
    const diagnostics = edge?.verificationDiagnostics;
    if (!diagnostics || typeof diagnostics !== 'object') return null;
    return {
        collisionId: normalizedNullable(diagnostics.collisionId),
        landingCollisionId: normalizedNullable(diagnostics.landingCollisionId),
        resolvedSupportId: normalizedNullable(diagnostics.resolvedSupportId),
        landedSupportId: normalizedNullable(diagnostics.landedSupportId),
        landingTargetCompatibility: normalizedNullable(diagnostics.landingTargetCompatibility),
        landingContactX: rounded(diagnostics.landingContactX),
        landingContactY: rounded(diagnostics.landingContactY),
        runUpTicks: Math.max(0, Math.trunc(Number(diagnostics.runUpTicks) || 0)),
        stepTicks: Math.max(0, Math.trunc(Number(diagnostics.stepTicks) || 0)),
        airTicks: Math.max(0, Math.trunc(Number(diagnostics.airTicks) || 0)),
        finalX: rounded(diagnostics.finalX),
        finalY: rounded(diagnostics.finalY)
    };
}

function normalizedSalvage(edge) {
    const salvage = edge?.simulationSalvage;
    if (!salvage || typeof salvage !== 'object') return null;
    return {
        kind: normalizedNullable(salvage.kind),
        sourceEdgeId: normalizedNullable(salvage.sourceEdgeId),
        intendedTargetSupportId: normalizedNullable(salvage.intendedTargetSupportId),
        landedSupportId: normalizedNullable(salvage.landedSupportId),
        stepHopsToIntendedTarget: Math.max(0, Math.trunc(Number(salvage.stepHopsToIntendedTarget) || 0))
    };
}

function edgeProofShape(edge) {
    return {
        id: String(edge?.id || ''),
        type: String(edge?.type || ''),
        from: String(edge?.from || ''),
        to: String(edge?.to || ''),
        verification: normalizedNullable(edge?.verification),
        verificationFailure: normalizedNullable(edge?.verificationFailure),
        verificationDiagnostics: normalizedDiagnostics(edge),
        simulationSalvage: normalizedSalvage(edge)
    };
}

function walkRegionShape(region) {
    return {
        id: String(region?.id || ''),
        supportIds: Array.isArray(region?.supportIds) ? [...region.supportIds].map(String) : [],
        geometryDependencyIds: Array.isArray(region?.geometryDependencyIds) ? [...region.geometryDependencyIds].map(String) : [],
        verification: normalizedNullable(region?.verification)
    };
}

function profileBuildShape(profile) {
    return {
        bodyWidth: rounded(profile?.bodyWidth),
        bodyHeight: rounded(profile?.bodyHeight),
        runSpeed: rounded(profile?.runSpeed),
        groundAcceleration: rounded(profile?.groundAcceleration),
        jumpHeight: rounded(profile?.jumpHeight),
        gravity: rounded(profile?.gravity),
        maxFallDistance: rounded(profile?.maxFallDistance),
        maxStepHeight: rounded(profile?.maxStepHeight),
        maxStepGap: rounded(profile?.maxStepGap),
        edgeInset: rounded(profile?.edgeInset),
        bodyClearance: rounded(profile?.bodyClearance),
        stepTransitionMethod: String(profile?.stepTransitionMethod || '')
    };
}

function supportBuildShape(support) {
    return {
        id: String(support?.id || ''),
        kind: String(support?.kind || ''),
        x1: rounded(support?.x1),
        y1: rounded(support?.y1),
        x2: rounded(support?.x2),
        y2: rounded(support?.y2),
        xMin: rounded(support?.xMin),
        xMax: rounded(support?.xMax),
        sourcePolygonId: normalizedNullable(support?.sourcePolygonId),
        obstacleXMin: rounded(support?.obstacleXMin),
        obstacleXMax: rounded(support?.obstacleXMax),
        strideBoundaryXMin: rounded(support?.strideBoundaryXMin),
        strideBoundaryXMax: rounded(support?.strideBoundaryXMax),
        sourceVisualId: normalizedNullable(support?.sourceVisualId),
        sourceAssetId: normalizedNullable(support?.sourceAssetId),
        sourceAtlasId: normalizedNullable(support?.sourceAtlasId),
        geometryDependencyIds: Array.isArray(support?.geometryDependencyIds) ? [...support.geometryDependencyIds].map(String) : [],
        walkRegionId: normalizedNullable(support?.walkRegionId)
    };
}

function edgeBuildShape(edge) {
    return {
        id: String(edge?.id || ''),
        type: String(edge?.type || ''),
        direction: String(edge?.direction || ''),
        from: String(edge?.from || ''),
        to: String(edge?.to || ''),
        launchX: rounded(edge?.launchX),
        launchY: rounded(edge?.launchY),
        landingX: rounded(edge?.landingX),
        landingY: rounded(edge?.landingY),
        vx: rounded(edge?.vx),
        vy: rounded(edge?.vy),
        flightTime: edge?.flightTime === undefined || edge?.flightTime === null ? null : Math.round(Number(edge.flightTime) * 1_000_000) / 1_000_000,
        fromObstacleId: normalizedNullable(edge?.fromObstacleId),
        toObstacleId: normalizedNullable(edge?.toObstacleId),
        walkOff: edge?.walkOff === undefined || edge?.walkOff === null ? null : Boolean(edge.walkOff),
        takeoffClearance: rounded(edge?.takeoffClearance),
        cost: rounded(edge?.cost),
        blockerIds: Array.isArray(edge?.blockerIds) ? [...edge.blockerIds].map(String) : [],
        runUpX: rounded(edge?.runUpX),
        runUpY: rounded(edge?.runUpY),
        runUpDistance: rounded(edge?.runUpDistance),
        requiredLaunchSpeed: rounded(edge?.requiredLaunchSpeed),
        groundAcceleration: rounded(edge?.groundAcceleration),
        geometryDependencyIds: Array.isArray(edge?.geometryDependencyIds) ? [...edge.geometryDependencyIds].map(String) : [],
        candidateWalkRegionId: normalizedNullable(edge?.candidateWalkRegionId),
        walkRegionDependencyIds: Array.isArray(edge?.walkRegionDependencyIds) ? [...edge.walkRegionDependencyIds].map(String) : [],
        verification: normalizedNullable(edge?.verification),
        verificationFailure: normalizedNullable(edge?.verificationFailure),
        heuristicRejectors: Array.isArray(edge?.heuristicRejectors) ? [...edge.heuristicRejectors].map(String) : [],
        heuristicDiagnostics: edge?.heuristicDiagnostics && typeof edge.heuristicDiagnostics === 'object' ? edge.heuristicDiagnostics : {}
    };
}

function graphBuildShape(graph) {
    return {
        version: Math.trunc(Number(graph?.version) || 0),
        id: String(graph?.id || ''),
        label: String(graph?.label || ''),
        profile: profileBuildShape(graph?.profile || {}),
        supports: (graph?.supports || []).map(supportBuildShape),
        supportSignature: String(graph?.supportSignature || ''),
        edges: (graph?.edges || []).map(edgeBuildShape),
        walkRegions: (graph?.walkRegions || []).map(walkRegionShape),
        dynamicCostRules: Array.isArray(graph?.dynamicCostRules) ? graph.dynamicCostRules : [],
        build: {
            method: String(graph?.build?.method || ''),
            stepTransitionMethod: String(graph?.build?.stepTransitionMethod || ''),
            samplesPerSecond: Math.trunc(Number(graph?.build?.samplesPerSecond) || 0),
            generatedBy: String(graph?.build?.generatedBy || ''),
            advisoryHeuristicSchema: Math.trunc(Number(graph?.build?.advisoryHeuristicSchema) || 0),
            advisoryHeuristics: Array.isArray(graph?.build?.advisoryHeuristics) ? [...graph.build.advisoryHeuristics].map(String) : []
        }
    };
}

function firstDifference(left, right, prefix = '') {
    if (Object.is(left, right)) return null;
    if (typeof left !== typeof right) return `${prefix}: ${JSON.stringify(left)} !== ${JSON.stringify(right)}`;
    if (left === null || right === null || typeof left !== 'object') return `${prefix}: ${JSON.stringify(left)} !== ${JSON.stringify(right)}`;
    if (Array.isArray(left) !== Array.isArray(right)) return `${prefix}: array/object mismatch`;
    if (Array.isArray(left)) {
        if (left.length !== right.length) return `${prefix}.length: ${left.length} !== ${right.length}`;
        for (let index = 0; index < left.length; index += 1) {
            const difference = firstDifference(left[index], right[index], `${prefix}[${index}]`);
            if (difference) return difference;
        }
        return null;
    }
    const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
    for (const key of keys) {
        const difference = firstDifference(left[key], right[key], prefix ? `${prefix}.${key}` : key);
        if (difference) return difference;
    }
    return null;
}

async function nativeVerify(nativePath, tempDirectory, world, graph, options, sequence) {
    const requestPath = path.join(tempDirectory, `request_${sequence}.json`);
    await fs.writeFile(requestPath, JSON.stringify({ version: 1, world, graph, options }), 'utf8');
    const result = spawnSync(nativePath, ['--navigation-simulation-oracle', requestPath], {
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        // Intentionally no wall-clock timeout here. Campaign-scale navigation
        // proofs can legitimately take minutes on a development machine, and
        // the caller already bounds raw-proof work by chunk size when desired.
        maxBuffer: 64 * 1024 * 1024
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
        throw new Error(`Native navigation oracle failed (${result.status}):\n${result.stderr || result.stdout}`);
    }
    const text = String(result.stdout || '').trim();
    try {
        return JSON.parse(text);
    } catch (error) {
        throw new Error(`Native navigation oracle returned invalid JSON: ${error.message}\n${text.slice(0, 2000)}`);
    }
}

async function nativeBuild(nativePath, tempDirectory, world, graph, sequence) {
    const requestPath = path.join(tempDirectory, `build_request_${sequence}.json`);
    const metadata = {
        id: graph?.id || '',
        label: graph?.label || '',
        stepTransitionMethod: graph?.build?.stepTransitionMethod || graph?.profile?.stepTransitionMethod || 'stride_arc',
        dynamicCostRules: graph?.dynamicCostRules || [],
        generatedBy: graph?.build?.generatedBy || 'Ignatius Rocketfrock Level Editor'
    };
    await fs.writeFile(requestPath, JSON.stringify({ version: 1, mode: 'build', world, profile: graph?.profile || {}, metadata }), 'utf8');
    const result = spawnSync(nativePath, ['--navigation-simulation-oracle', requestPath], {
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Native navigation build oracle failed (${result.status}):\n${result.stderr || result.stdout}`);
    const text = String(result.stdout || '').trim();
    try {
        return JSON.parse(text);
    } catch (error) {
        throw new Error(`Native navigation build oracle returned invalid JSON: ${error.message}\n${text.slice(0, 2000)}`);
    }
}

function recordMismatch(state, message) {
    state.messages.push(message);
    console.error(`\nMISMATCH ${state.messages.length}/${state.limit}: ${message}`);
    return state.messages.length >= state.limit;
}

function matchingProfile(graph, filters) {
    if (!filters.length) return true;
    const haystack = `${String(graph?.id || '')} ${String(graph?.label || '')}`.toLowerCase();
    return filters.some((filter) => haystack.includes(String(filter).toLowerCase()));
}

async function checkLevel(name, sharedContext, nativePath, tempDirectory, options, sequenceRef, mismatchState) {
    const levelPath = path.join(LEVELS_ROOT, name);
    const document = await readJson(levelPath);
    const level = document?.level && typeof document.level === 'object' ? document.level : document;
    const manifestByAtlasId = await loadAtlasManifestsForLevel(level);
    const context = { ...sharedContext, manifestByAtlasId };
    const { world } = buildCanonicalNavigationWorld(document, context);
    const candidate = rebakeAndVerifyNavigation(document, context, {
        verifyBySimulation: false,
        preserveMatchingVerification: false,
        includeWizard: true,
        stepTransitionMethod: 'stride_arc',
        compareStepMethods: false
    });
    const profiles = candidate.profiles.filter((graph) => matchingProfile(graph, options.profileFilters));
    if (!profiles.length) throw new Error(`${name}: no navigation profile matched --profile filter(s)`);

    for (const graph of profiles) {
        if (options.buildParity && mismatchState.messages.length < mismatchState.limit) {
            const nativeBuilt = await nativeBuild(nativePath, tempDirectory, world, graph, sequenceRef.value++);
            const buildDifference = firstDifference(graphBuildShape(graph), graphBuildShape(nativeBuilt?.graph || {}), 'graph');
            if (buildDifference) {
                recordMismatch(mismatchState, `${name} ${graph.id}: JS/C++ graph-build mismatch: ${buildDifference}`);
            } else if (options.verbose) {
                process.stdout.write(`${name} ${graph.id}: graph build OK\n`);
            }
        }
        let checked = 0;
        const allEdges = (graph.edges || []).filter(candidateEdge);
        if (options.fullGraph) {
            process.stdout.write(`${name} ${graph.id}: ${allEdges.length} candidate proof(s), full graph`);
            const jsVerification = verifyEnemyNavigationGraphBySimulation(world, graph, {
                salvageWrongSupportLandings: true
            });
            const nativeVerification = await nativeVerify(nativePath, tempDirectory, world, graph, {
                maxRunUpTicks: 600,
                maxAirTicks: 600,
                maxStepTicks: 600,
                salvageWrongSupportLandings: true
            }, sequenceRef.value++);
            const jsResults = jsVerification.graph.edges.map(edgeProofShape);
            const nativeResults = (nativeVerification.edges || []).map(edgeProofShape);
            const edgeDifference = firstDifference(jsResults, nativeResults, 'edges');
            if (edgeDifference) {
                const jsIds = new Set(jsResults.map((edge) => edge.id));
                const nativeIds = new Set(nativeResults.map((edge) => edge.id));
                const jsOnly = jsResults.filter((edge) => !nativeIds.has(edge.id)).map((edge) => edge.id).slice(0, 12);
                const nativeOnly = nativeResults.filter((edge) => !jsIds.has(edge.id)).map((edge) => edge.id).slice(0, 12);
                recordMismatch(mismatchState, `${name} ${graph.id}: JS/C++ full-graph edge mismatch: ${edgeDifference}\nJS-only edge IDs: ${JSON.stringify(jsOnly)}\nC++-only edge IDs: ${JSON.stringify(nativeOnly)}\nJS summary: ${JSON.stringify(jsVerification.summary)}\nC++ summary: ${JSON.stringify(nativeVerification.summary)}`);
                if (mismatchState.messages.length >= mismatchState.limit) return checked;
                continue;
            }
            const jsRegions = (jsVerification.graph.walkRegions || []).map(walkRegionShape);
            const nativeRegions = (nativeVerification.walkRegions || []).map(walkRegionShape);
            const regionDifference = firstDifference(jsRegions, nativeRegions, 'walkRegions');
            if (regionDifference) {
                recordMismatch(mismatchState, `${name} ${graph.id}: JS/C++ full-graph walk-region mismatch: ${regionDifference}`);
                if (mismatchState.messages.length >= mismatchState.limit) return checked;
                continue;
            }
            const jsSummary = {
                checkedEdges: jsVerification.summary.checkedEdges,
                checkedSteps: jsVerification.summary.checkedSteps,
                checkedJumps: jsVerification.summary.checkedJumps,
                checkedDrops: jsVerification.summary.checkedDrops,
                failedEdges: jsVerification.summary.failedEdges ?? jsVerification.summary.rejectedEdges,
                verifiedEdges: jsVerification.summary.verifiedEdges,
                salvageProofChecks: jsVerification.summary.salvageProofChecks ?? 0,
                salvagedEdges: jsVerification.summary.salvagedEdges ?? 0,
                retainedEdges: jsVerification.summary.retainedEdges
            };
            const nativeSummary = {
                checkedEdges: nativeVerification.summary.checkedEdges,
                checkedSteps: nativeVerification.summary.checkedSteps,
                checkedJumps: nativeVerification.summary.checkedJumps,
                checkedDrops: nativeVerification.summary.checkedDrops,
                failedEdges: nativeVerification.summary.failedEdges,
                verifiedEdges: nativeVerification.summary.verifiedEdges,
                salvageProofChecks: nativeVerification.summary.salvageProofChecks ?? 0,
                salvagedEdges: nativeVerification.summary.salvagedEdges ?? 0,
                retainedEdges: nativeVerification.summary.retainedEdges
            };
            const summaryDifference = firstDifference(jsSummary, nativeSummary, 'summary');
            if (summaryDifference) {
                recordMismatch(mismatchState, `${name} ${graph.id}: JS/C++ full-graph summary mismatch: ${summaryDifference}`);
                if (mismatchState.messages.length >= mismatchState.limit) return checked;
                continue;
            }
            process.stdout.write(' OK\n');
            continue;
        }
        const startOffset = Math.min(allEdges.length, Math.max(0, options.startEdge - 1));
        const endOffset = options.maxEdges === null
            ? allEdges.length
            : Math.min(allEdges.length, startOffset + options.maxEdges);
        const edges = allEdges.slice(startOffset, endOffset);
        const rangeSuffix = startOffset === 0 && endOffset === allEdges.length
            ? ''
            : `, range ${startOffset + 1}-${endOffset} of ${allEdges.length}`;
        process.stdout.write(`${name} ${graph.id}: ${edges.length} candidate proof(s)${rangeSuffix}`);
        for (let offset = 0; offset < edges.length; offset += options.chunkSize) {
            const chunkEdges = edges.slice(offset, offset + options.chunkSize);
            const globalOffset = startOffset + offset;
            const chunkGraph = { ...graph, edges: chunkEdges };
            const jsVerification = verifyEnemyNavigationGraphBySimulation(world, chunkGraph, {
                salvageWrongSupportLandings: false
            });
            const nativeVerification = await nativeVerify(nativePath, tempDirectory, world, chunkGraph, {
                maxRunUpTicks: 600,
                maxAirTicks: 600,
                maxStepTicks: 600,
                salvageWrongSupportLandings: false
            }, sequenceRef.value++);

            if (nativeVerification?.version !== 1) throw new Error(`${name} ${graph.id}: native oracle version mismatch`);
            const jsResults = jsVerification.graph.edges.map(edgeProofShape);
            const nativeResults = (nativeVerification.edges || []).map(edgeProofShape);
            const difference = firstDifference(jsResults, nativeResults, 'edges');
            if (difference) {
                const localIndex = (() => {
                    for (let index = 0; index < Math.min(jsResults.length, nativeResults.length); index += 1) {
                        if (firstDifference(jsResults[index], nativeResults[index], '')) return index;
                    }
                    return -1;
                })();
                const edge = localIndex >= 0 ? chunkEdges[localIndex] : null;
                recordMismatch(mismatchState, `${name} ${graph.id}: JS/C++ proof mismatch at candidate ${globalOffset + Math.max(0, localIndex) + 1}/${allEdges.length}${edge?.id ? ` (${edge.id})` : ''}: ${difference}\nJS: ${JSON.stringify(localIndex >= 0 ? jsResults[localIndex] : jsResults)}\nC++: ${JSON.stringify(localIndex >= 0 ? nativeResults[localIndex] : nativeResults)}`);
                if (mismatchState.messages.length >= mismatchState.limit) return checked;
                continue;
            }
            const jsSummary = {
                checkedEdges: jsVerification.summary.checkedEdges,
                checkedSteps: jsVerification.summary.checkedSteps,
                checkedJumps: jsVerification.summary.checkedJumps,
                checkedDrops: jsVerification.summary.checkedDrops,
                failedEdges: jsVerification.summary.failedEdges ?? jsVerification.summary.rejectedEdges,
                verifiedEdges: jsVerification.summary.verifiedEdges
            };
            const nativeSummary = {
                checkedEdges: nativeVerification.summary.checkedEdges,
                checkedSteps: nativeVerification.summary.checkedSteps,
                checkedJumps: nativeVerification.summary.checkedJumps,
                checkedDrops: nativeVerification.summary.checkedDrops,
                failedEdges: nativeVerification.summary.failedEdges,
                verifiedEdges: nativeVerification.summary.verifiedEdges
            };
            const summaryDifference = firstDifference(jsSummary, nativeSummary, 'summary');
            if (summaryDifference) {
                recordMismatch(mismatchState, `${name} ${graph.id}: JS/C++ summary mismatch: ${summaryDifference}`);
                if (mismatchState.messages.length >= mismatchState.limit) return checked;
                continue;
            }
            checked += chunkEdges.length;
            if (options.verbose) process.stdout.write(`\n  ${globalOffset + 1}-${globalOffset + chunkEdges.length}: OK`);
            else process.stdout.write('.');
        }
        process.stdout.write(` ${checked ? 'OK' : 'EMPTY'}\n`);
    }
    return profiles.reduce((sum, graph) => {
        const count = (graph.edges || []).filter(candidateEdge).length;
        if (options.fullGraph) return sum + count;
        const startOffset = Math.min(count, Math.max(0, options.startEdge - 1));
        const endOffset = options.maxEdges === null ? count : Math.min(count, startOffset + options.maxEdges);
        return sum + Math.max(0, endOffset - startOffset);
    }, 0);
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
        usage();
        return;
    }
    const nativePath = await findNativeExecutable(options.nativePath);
    const [enemyCatalog, tuning] = await Promise.all([readJson(ENEMY_CATALOG_PATH), readJson(TUNING_PATH)]);
    if (options.campaign && options.levelNames.length) throw new Error('--campaign cannot be combined with --level');
    const levelNames = options.campaign
        ? (await fs.readdir(LEVELS_ROOT)).filter((name) => /^level_\d+\.json$/i.test(name)).sort()
        : (options.levelNames.length ? options.levelNames : ['level_t01.json']);
    const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'ignatius-navigation-parity-'));
    const sequenceRef = { value: 1 };
    const mismatchState = { limit: options.collectMismatches, messages: [] };
    let total = 0;
    try {
        for (const name of levelNames) {
            if (mismatchState.messages.length >= mismatchState.limit) break;
            try {
                total += await checkLevel(name, { enemyCatalog, tuning }, nativePath, tempDirectory, options, sequenceRef, mismatchState);
            } catch (error) {
                recordMismatch(mismatchState, `${name}: ${error?.stack || error}`);
            }
        }
    } finally {
        await fs.rm(tempDirectory, { recursive: true, force: true });
    }
    console.log(`Navigation simulation parity: ${total} JS/C++ candidate proof(s) matched.`);
    if (mismatchState.messages.length) {
        console.error(`Navigation differential verification found ${mismatchState.messages.length} mismatch(es).`);
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error?.stack || String(error));
    process.exitCode = 1;
});
