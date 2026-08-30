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
    const options = { levelNames: [], verbose: false };
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === '--verbose') options.verbose = true;
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
    return options;
}

function usage() {
    console.log('Usage: node reference/devel/compare_enemy_navigation_step_methods.mjs [--level level_006] [--verbose]\n\n' +
        'Bakes hunter graphs with both the legacy height/gap step test and the new stride-arc step test, then compares directed transition semantics.');
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

function edgeKey(edge) {
    return `${edge.type}|${edge.from}|${edge.to}|${edge.direction}`;
}

function countByType(keys, byKey) {
    const counts = { step: 0, jump: 0, drop: 0, other: 0 };
    for (const key of keys) {
        const type = String(byKey.get(key)?.type || "other");
        if (Object.hasOwn(counts, type)) counts[type] += 1;
        else counts.other += 1;
    }
    return counts;
}

function supportProjectionEquivalent(left, right, tolerance = 0.001) {
    if (!left || !right) return false;
    for (const field of ["x1", "y1", "x2", "y2", "xMin", "xMax"]) {
        if (Math.abs(Number(left[field]) - Number(right[field])) > tolerance) return false;
    }
    return String(left.kind || "") === String(right.kind || "") &&
        String(left.source || "") === String(right.source || "") &&
        String(left.sourcePolygonId || "") === String(right.sourcePolygonId || "") &&
        String(left.movingPlatformId || "") === String(right.movingPlatformId || "");
}

function reachablePairs(graph, projectedSupportIds = null) {
    const adjacency = new Map((graph.supports || []).map((support) => [String(support.id), []]));
    for (const edge of graph.edges || []) {
        if (!adjacency.has(String(edge.from))) adjacency.set(String(edge.from), []);
        adjacency.get(String(edge.from)).push(String(edge.to));
    }
    const projected = projectedSupportIds instanceof Set
        ? projectedSupportIds
        : new Set(adjacency.keys());
    const pairs = new Set();
    for (const start of projected) {
        if (!adjacency.has(start)) continue;
        const queue = [start];
        const seen = new Set([start]);
        for (let index = 0; index < queue.length; index += 1) {
            const current = queue[index];
            for (const next of adjacency.get(current) || []) {
                if (seen.has(next)) continue;
                seen.add(next);
                queue.push(next);
                if (projected.has(next)) pairs.add(`${start}|${next}`);
            }
        }
    }
    return pairs;
}

function profileComparison(legacy, stride) {
    const legacyByKey = new Map((legacy.edges || []).map((edge) => [edgeKey(edge), edge]));
    const strideByKey = new Map((stride.edges || []).map((edge) => [edgeKey(edge), edge]));
    const legacyOnly = [...legacyByKey.keys()].filter((key) => !strideByKey.has(key)).sort();
    const strideOnly = [...strideByKey.keys()].filter((key) => !legacyByKey.has(key)).sort();
    // The stride extractor may split a physical support differently from the
    // legacy extractor. Comparing arbitrary raw support IDs then reports
    // "lost" reachability merely because one endpoint no longer exists in
    // the alternate partition. Project both transitive closures onto support
    // IDs shared by the two graphs while still allowing paths through every
    // intermediate node in each graph.
    const legacySupportById = new Map((legacy.supports || []).map((support) => [String(support.id), support]));
    const strideSupportById = new Map((stride.supports || []).map((support) => [String(support.id), support]));
    const legacySupportIds = new Set(legacySupportById.keys());
    const strideSupportIds = new Set(strideSupportById.keys());
    const commonSupportIds = new Set([...legacySupportIds].filter((id) => (
        strideSupportById.has(id) && supportProjectionEquivalent(legacySupportById.get(id), strideSupportById.get(id))
    )));
    const legacyReachability = reachablePairs(legacy, commonSupportIds);
    const strideReachability = reachablePairs(stride, commonSupportIds);
    const legacyReachOnly = [...legacyReachability].filter((key) => !strideReachability.has(key));
    const strideReachOnly = [...strideReachability].filter((key) => !legacyReachability.has(key));
    const legacySteps = (legacy.edges || []).filter((edge) => edge.type === 'step').length;
    const strideSteps = (stride.edges || []).filter((edge) => edge.type === 'step').length;
    return {
        legacyEdges: legacy.edges?.length || 0,
        strideEdges: stride.edges?.length || 0,
        legacySteps,
        strideSteps,
        legacySupports: legacySupportIds.size,
        strideSupports: strideSupportIds.size,
        commonSupports: commonSupportIds.size,
        legacyOnly,
        strideOnly,
        legacyOnlyByType: countByType(legacyOnly, legacyByKey),
        strideOnlyByType: countByType(strideOnly, strideByKey),
        legacyReachOnly,
        strideReachOnly,
        legacyByKey,
        strideByKey
    };
}

async function compareLevel(levelPath, enemyCatalog, tuning) {
    const document = await readJson(levelPath);
    const level = document?.level && typeof document.level === 'object' ? document.level : document;
    const context = {
        manifestByAtlasId: await loadAtlasManifestsForLevel(level),
        enemyCatalog,
        tuning
    };
    const commonOptions = {
        verifyBySimulation: false,
        preserveMatchingVerification: false,
        includeWizard: false,
        compareStepMethods: false
    };
    const legacyResult = rebakeAndVerifyNavigation(document, context, {
        ...commonOptions,
        stepTransitionMethod: 'legacy'
    });
    const strideResult = rebakeAndVerifyNavigation(document, context, {
        ...commonOptions,
        stepTransitionMethod: 'stride_arc'
    });
    const legacyById = new Map((legacyResult.profiles || []).map((graph) => [String(graph.id || ''), graph]));
    const strideById = new Map((strideResult.profiles || []).map((graph) => [String(graph.id || ''), graph]));
    const profileIds = [...new Set([...legacyById.keys(), ...strideById.keys()])].sort();
    const comparisons = [];
    for (const id of profileIds) {
        const legacy = legacyById.get(id);
        const stride = strideById.get(id);
        if (!legacy || !stride) throw new Error(`Canonical navigation comparison lost mobility profile ${id}.`);
        comparisons.push({ id, profile: stride.profile || legacy.profile || {}, legacy, stride, ...profileComparison(legacy, stride) });
    }
    return comparisons;
}

function describeEdge(edge) {
    const launch = `(${Number(edge.launchX).toFixed(1)},${Number(edge.launchY).toFixed(1)})`;
    const landing = `(${Number(edge.landingX).toFixed(1)},${Number(edge.landingY).toFixed(1)})`;
    return `${edge.type} ${edge.direction} ${edge.from} -> ${edge.to} ${launch} -> ${landing}`;
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
        usage();
        return;
    }
    const [enemyCatalog, tuning] = await Promise.all([readJson(ENEMY_CATALOG_PATH), readJson(TUNING_PATH)]);
    const allNames = (await fs.readdir(LEVELS_ROOT)).filter((name) => /^level_[A-Za-z0-9_]+\.json$/.test(name) && name !== 'level_temp.json').sort();
    const names = options.levelNames.length ? options.levelNames : allNames;
    const totals = {
        levels: names.length,
        levelsWithHunters: 0,
        profiles: 0,
        legacyEdges: 0,
        strideEdges: 0,
        legacySteps: 0,
        strideSteps: 0,
        legacyOnly: 0,
        strideOnly: 0,
        legacyReachOnly: 0,
        strideReachOnly: 0,
        legacyOnlyByType: { step: 0, jump: 0, drop: 0, other: 0 },
        strideOnlyByType: { step: 0, jump: 0, drop: 0, other: 0 }
    };

    for (const name of names) {
        const comparisons = await compareLevel(path.join(LEVELS_ROOT, name), enemyCatalog, tuning);
        if (comparisons.length) totals.levelsWithHunters += 1;
        const levelLegacyOnly = comparisons.reduce((sum, item) => sum + item.legacyOnly.length, 0);
        const levelStrideOnly = comparisons.reduce((sum, item) => sum + item.strideOnly.length, 0);
        const levelLegacyReachOnly = comparisons.reduce((sum, item) => sum + item.legacyReachOnly.length, 0);
        const levelStrideReachOnly = comparisons.reduce((sum, item) => sum + item.strideReachOnly.length, 0);
        const levelLegacyEdges = comparisons.reduce((sum, item) => sum + item.legacyEdges, 0);
        const levelStrideEdges = comparisons.reduce((sum, item) => sum + item.strideEdges, 0);
        const levelLegacySteps = comparisons.reduce((sum, item) => sum + item.legacySteps, 0);
        const levelStrideSteps = comparisons.reduce((sum, item) => sum + item.strideSteps, 0);
        totals.profiles += comparisons.length;
        totals.legacyEdges += levelLegacyEdges;
        totals.strideEdges += levelStrideEdges;
        totals.legacySteps += levelLegacySteps;
        totals.strideSteps += levelStrideSteps;
        totals.legacyOnly += levelLegacyOnly;
        totals.strideOnly += levelStrideOnly;
        totals.legacyReachOnly += levelLegacyReachOnly;
        totals.strideReachOnly += levelStrideReachOnly;
        for (const type of ["step", "jump", "drop", "other"]) {
            totals.legacyOnlyByType[type] += comparisons.reduce((sum, item) => sum + item.legacyOnlyByType[type], 0);
            totals.strideOnlyByType[type] += comparisons.reduce((sum, item) => sum + item.strideOnlyByType[type], 0);
        }
        if (comparisons.length) {
            console.log(`${name}: ${comparisons.length} profile(s), legacy ${levelLegacyEdges} edges/${levelLegacySteps} step, stride-arc ${levelStrideEdges} edges/${levelStrideSteps} step, legacy-only ${levelLegacyOnly}, stride-only ${levelStrideOnly}, common-equivalent-support reachability legacy-only ${levelLegacyReachOnly}, stride-only ${levelStrideReachOnly}`);
        }
        if (options.verbose) {
            for (const item of comparisons) {
                console.log(`  ${item.id}: legacy ${item.legacyEdges}/${item.legacySteps} step/${item.legacySupports} supports, stride-arc ${item.strideEdges}/${item.strideSteps} step/${item.strideSupports} supports, ${item.commonSupports} common supports`);
                console.log(`    edge-only by type: legacy ${JSON.stringify(item.legacyOnlyByType)}, stride ${JSON.stringify(item.strideOnlyByType)}; reachability-only legacy ${item.legacyReachOnly.length}, stride ${item.strideReachOnly.length}`);
                for (const key of item.strideOnly) console.log(`    + stride ${describeEdge(item.strideByKey.get(key))}`);
                for (const key of item.legacyOnly) console.log(`    - legacy ${describeEdge(item.legacyByKey.get(key))}`);
                for (const key of item.legacyReachOnly.slice(0, 50)) {
                    const [from, to] = key.split('|');
                    console.log(`    ! legacy-only reachability ${from} -> ${to}`);
                }
                if (item.legacyReachOnly.length > 50) console.log(`    ! ... ${item.legacyReachOnly.length - 50} more legacy-only reachable pairs`);
            }
        }
    }

    console.log(`Comparison summary: ${totals.levels} level(s), ${totals.levelsWithHunters} with hunters, ${totals.profiles} profile(s).`);
    console.log(`  Legacy:     ${totals.legacyEdges} edges, ${totals.legacySteps} step transitions.`);
    console.log(`  Stride-arc: ${totals.strideEdges} edges, ${totals.strideSteps} step transitions.`);
    console.log(`  Semantic differences: ${totals.strideOnly} stride-only, ${totals.legacyOnly} legacy-only directed transitions.`);
    console.log(`    Stride-only by type: step ${totals.strideOnlyByType.step}, jump ${totals.strideOnlyByType.jump}, drop ${totals.strideOnlyByType.drop}, other ${totals.strideOnlyByType.other}.`);
    console.log(`    Legacy-only by type: step ${totals.legacyOnlyByType.step}, jump ${totals.legacyOnlyByType.jump}, drop ${totals.legacyOnlyByType.drop}, other ${totals.legacyOnlyByType.other}.`);
    console.log(`  Common-equivalent-support reachability differences: ${totals.strideReachOnly} stride-only, ${totals.legacyReachOnly} legacy-only ordered support pairs.`);
}

main().catch((error) => {
    console.error(error?.stack || String(error));
    process.exitCode = 1;
});
