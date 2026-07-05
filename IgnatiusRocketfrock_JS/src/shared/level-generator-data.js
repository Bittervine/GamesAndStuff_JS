import {
    CAVE_PERIMETER_GENERATOR,
    generateCavePerimeterPlacements
} from "./cave-window-decoration.js";
import { normalizeLevelLayerVisuals } from "./level-layer-data.js";
import { parseEnemySelection } from "./enemy-pool-data.js";
export { parseEnemySelection } from "./enemy-pool-data.js";

export const AUTOMATIC_LEVEL_GENERATOR_VERSION = 36;
export const AUTOMATIC_LEVEL_GENERATOR_ID = "automatic-level-generator-9";

const GENERATED_PLAYER_BODY_WIDTH = 34;
const GENERATED_STATIC_HEADROOM = 112;
export const GENERATED_MINIMUM_VERTICAL_PLATFORM_SEPARATION = 180;
export const GENERATED_MOVING_PLATFORM_RIDER_CLEARANCE = 180;
export const GENERATED_TREASURE_CHEST_SPACING_PX = 500;
export const GENERATED_POWER_UP_SPACING_PX = 3000;
export const GENERATED_MONSTER_SPACING_PX = 300;
export const DOMED_CAVERN_UPWARD_EXPANSION_FACTOR = 1.5;

export const LEVEL_GENERATOR_STAGE_ORDER = Object.freeze([
    "route",
    "traversal",
    "endpoints",
    "cavern",
    "encounters",
    "rewards",
    "decoration",
    "validation"
]);

export const LEVEL_GENERATOR_REGISTRIES = Object.freeze({
    route: Object.freeze([
        Object.freeze({ id: "mostly-horizontal-route-v1", label: "Horizontal" }),
        Object.freeze({ id: "the-path74-route-v4", label: "Standard" }),
        Object.freeze({ id: "rising-snake-route-v1", label: "Rising Snake" })
    ]),
    cavern: Object.freeze([
        Object.freeze({ id: "wide-upper-contour-cavern-v1", label: "Domed" }),
        Object.freeze({ id: "the-path74-contour-cavern-v4", label: "Standard" })
    ]),
    traversal: Object.freeze([
        Object.freeze({ id: "layered-safety-network-traversal-v6", label: "Standard" })
    ]),
    endpoints: Object.freeze([
        Object.freeze({ id: "grounded-chamber-endpoints-v2", label: "Standard" })
    ]),
    encounters: Object.freeze([
        Object.freeze({ id: "difficulty-budgeted-encounters-v1", label: "Standard" })
    ]),
    rewards: Object.freeze([
        Object.freeze({ id: "basic-rewards-v1", label: "Standard" })
    ]),
    decoration: Object.freeze([
        Object.freeze({ id: "perimeter-decoration-v1", label: "Standard" })
    ]),
    validation: Object.freeze([
        Object.freeze({ id: "the-path74-cavern-validation-v4", label: "Standard" })
    ])
});

const INTERNAL_GENERATOR_IMPLEMENTATIONS = Object.freeze({
    encounters: Object.freeze(new Set(["not-generated-yet"])),
    rewards: Object.freeze(new Set(["not-generated-yet"])),
    decoration: Object.freeze(new Set(["suppressed-by-theme", "not-generated-yet"]))
});

export const LEVEL_LENGTH_PRESETS = Object.freeze({
    compact: Object.freeze({ id: "compact", label: "Compact", mainNodes: 8 }),
    standard: Object.freeze({ id: "standard", label: "Standard", mainNodes: 12 }),
    extended: Object.freeze({ id: "extended", label: "Extended", mainNodes: 17 }),
    grand: Object.freeze({ id: "grand", label: "Grand", mainNodes: 23 })
});

export const DEFAULT_GENERATOR_SETTINGS = Object.freeze({
    length: "standard",
    verticality: 0.45,
    winding: 0.35,
    difficulty: 0.35,
    safety: 0.72,
    enemyDensity: 0.42,
    rewardDensity: 0.38,
    allowThoughts: false,
    allowedEnemies: "1-999"
});

const DEFAULT_THEME = Object.freeze({
    themeId: "earth-cavern",
    label: "Earth Cavern",
    description: "Existing cavern materials with their authored colours.",
    defaults: DEFAULT_GENERATOR_SETTINGS,
    route: Object.freeze({
        nodeSpacing: 900,
        verticalStep: 190,
        startX: 640,
        baselineY: 900,
        candidateAttempts: 40,
        macroVerticalSpan: 760,
        roomScale: 1
    }),
    cavern: Object.freeze({
        chamberRadiusX: 720,
        chamberRadiusY: 560,
        corridorRadiusX: 500,
        corridorRadiusY: 455,
        endpointRadiusX: 900,
        endpointRadiusY: 650,
        roomRadiusXMin: 850,
        roomRadiusXMax: 2560,
        roomRadiusYMin: 520,
        roomRadiusYMax: 1080,
        floorOffsetY: 115,
        sampleStep: 140,
        worldMargin: 220,
        platformWallClearanceX: 250,
        platformFloorClearance: 250,
        platformCeilingClearance: 340,
        endpointSideClearance: 520
    }),
    traversal: Object.freeze({
        maxHopX: 275,
        maxHopRise: 88,
        mandatoryGap: 128,
        mandatoryRise: 112,
        mandatoryDrop: 270,
        endpointWidth: 720,
        chamberWidth: 420,
        traversalWidth: 340,
        intermediateWidth: 250
    }),
    endpoints: Object.freeze({
        doorWidth: 125,
        doorHeight: 164,
        calmDistance: 300
    }),
    encounters: Object.freeze({
        calmDistance: 520,
        minimumEncounterSpacing: 700,
        landingBuffer: 132,
        spawnSafetyBuffer: 150,
        maximumEncounterShare: 0.72
    }),
    rewards: Object.freeze({
        endpointExclusionDistance: 300,
        minimumRewardSpacing: 480,
        treasureChestScore: 100,
        maximumContextualPowerUps: 3,
        thoughtChance: 0.34,
        maximumThoughts: 1,
        thoughts: Object.freeze([])
    }),
    decoration: Object.freeze({
        populatePerimeter: true,
        protectGameplay: true,
        supportPaddingX: 34,
        supportPaddingY: 58,
        endpointPadding: 150,
        rewardPadding: 56
    }),
    colorMap: Object.freeze({
        enabled: false,
        sourceHue: 28,
        range: 100,
        feather: 28,
        rotation: 0,
        atlasIds: ["at_atlas_001", "at_atlas_002", "at_atlas_003"]
    }),
    implementations: Object.freeze({
        route: "mostly-horizontal-route-v1",
        cavern: "wide-upper-contour-cavern-v1",
        traversal: "layered-safety-network-traversal-v6",
        endpoints: "grounded-chamber-endpoints-v2",
        encounters: "difficulty-budgeted-encounters-v1",
        rewards: "basic-rewards-v1",
        decoration: "perimeter-decoration-v1",
        validation: "the-path74-cavern-validation-v4"
    })
});

export function normalizeGeneratorTheme(value) {
    const source = value && typeof value === "object" ? value : {};
    const defaults = normalizeGeneratorSettings(source.defaults || DEFAULT_THEME.defaults);
    const routeSource = source.route && typeof source.route === "object" ? source.route : {};
    const cavernSource = source.cavern && typeof source.cavern === "object" ? source.cavern : {};
    const traversalSource = source.traversal && typeof source.traversal === "object" ? source.traversal : {};
    const endpointsSource = source.endpoints && typeof source.endpoints === "object" ? source.endpoints : {};
    const encountersSource = source.encounters && typeof source.encounters === "object" ? source.encounters : {};
    const rewardsSource = source.rewards && typeof source.rewards === "object" ? source.rewards : {};
    const decorationSource = source.decoration && typeof source.decoration === "object" ? source.decoration : {};
    const colorMapSource = source.colorMap && typeof source.colorMap === "object" ? source.colorMap : DEFAULT_THEME.colorMap;
    const implementations = normalizeGeneratorImplementations(source.implementations || DEFAULT_THEME.implementations);
    return {
        themeId: cleanId(source.themeId || source.id || DEFAULT_THEME.themeId, DEFAULT_THEME.themeId),
        label: String(source.label || source.name || DEFAULT_THEME.label),
        description: String(source.description || ""),
        defaults,
        route: {
            nodeSpacing: clampNumber(routeSource.nodeSpacing, 360, 900, DEFAULT_THEME.route.nodeSpacing),
            verticalStep: clampNumber(routeSource.verticalStep, 120, 320, DEFAULT_THEME.route.verticalStep),
            startX: finiteNumber(routeSource.startX, DEFAULT_THEME.route.startX),
            baselineY: finiteNumber(routeSource.baselineY, DEFAULT_THEME.route.baselineY),
            candidateAttempts: Math.round(clampNumber(routeSource.candidateAttempts, 8, 64, DEFAULT_THEME.route.candidateAttempts)),
            macroVerticalSpan: clampNumber(routeSource.macroVerticalSpan, 360, 1400, DEFAULT_THEME.route.macroVerticalSpan),
            roomScale: clampNumber(routeSource.roomScale, 0.65, 1.35, DEFAULT_THEME.route.roomScale)
        },
        cavern: {
            chamberRadiusX: clampNumber(cavernSource.chamberRadiusX, 420, 1400, DEFAULT_THEME.cavern.chamberRadiusX),
            chamberRadiusY: clampNumber(cavernSource.chamberRadiusY, 380, 1000, DEFAULT_THEME.cavern.chamberRadiusY),
            corridorRadiusX: clampNumber(cavernSource.corridorRadiusX, 360, 900, DEFAULT_THEME.cavern.corridorRadiusX),
            corridorRadiusY: clampNumber(cavernSource.corridorRadiusY, 340, 900, DEFAULT_THEME.cavern.corridorRadiusY),
            endpointRadiusX: clampNumber(cavernSource.endpointRadiusX, 620, 1600, DEFAULT_THEME.cavern.endpointRadiusX),
            endpointRadiusY: clampNumber(cavernSource.endpointRadiusY, 480, 1200, DEFAULT_THEME.cavern.endpointRadiusY),
            roomRadiusXMin: clampNumber(cavernSource.roomRadiusXMin, 640, 1800, DEFAULT_THEME.cavern.roomRadiusXMin),
            roomRadiusXMax: clampNumber(cavernSource.roomRadiusXMax, 900, 2560, DEFAULT_THEME.cavern.roomRadiusXMax),
            roomRadiusYMin: clampNumber(cavernSource.roomRadiusYMin, 420, 900, DEFAULT_THEME.cavern.roomRadiusYMin),
            roomRadiusYMax: clampNumber(cavernSource.roomRadiusYMax, 620, 1080, DEFAULT_THEME.cavern.roomRadiusYMax),
            floorOffsetY: clampNumber(cavernSource.floorOffsetY, 70, 220, DEFAULT_THEME.cavern.floorOffsetY),
            sampleStep: clampNumber(cavernSource.sampleStep, 80, 220, DEFAULT_THEME.cavern.sampleStep),
            worldMargin: clampNumber(cavernSource.worldMargin, 140, 420, DEFAULT_THEME.cavern.worldMargin),
            platformWallClearanceX: clampNumber(cavernSource.platformWallClearanceX, 160, 520, DEFAULT_THEME.cavern.platformWallClearanceX),
            platformFloorClearance: clampNumber(cavernSource.platformFloorClearance, 170, 480, DEFAULT_THEME.cavern.platformFloorClearance),
            platformCeilingClearance: clampNumber(cavernSource.platformCeilingClearance, 240, 680, DEFAULT_THEME.cavern.platformCeilingClearance),
            endpointSideClearance: clampNumber(cavernSource.endpointSideClearance, 360, 900, DEFAULT_THEME.cavern.endpointSideClearance)
        },
        traversal: {
            maxHopX: clampNumber(traversalSource.maxHopX, 190, 340, DEFAULT_THEME.traversal.maxHopX),
            maxHopRise: clampNumber(traversalSource.maxHopRise, 60, 125, DEFAULT_THEME.traversal.maxHopRise),
            mandatoryGap: clampNumber(traversalSource.mandatoryGap, 80, 170, DEFAULT_THEME.traversal.mandatoryGap),
            mandatoryRise: clampNumber(traversalSource.mandatoryRise, 80, 145, DEFAULT_THEME.traversal.mandatoryRise),
            mandatoryDrop: clampNumber(traversalSource.mandatoryDrop, 180, 360, DEFAULT_THEME.traversal.mandatoryDrop),
            endpointWidth: clampNumber(traversalSource.endpointWidth, 620, 900, DEFAULT_THEME.traversal.endpointWidth),
            chamberWidth: clampNumber(traversalSource.chamberWidth, 340, 560, DEFAULT_THEME.traversal.chamberWidth),
            traversalWidth: clampNumber(traversalSource.traversalWidth, 280, 440, DEFAULT_THEME.traversal.traversalWidth),
            intermediateWidth: clampNumber(traversalSource.intermediateWidth, 210, 330, DEFAULT_THEME.traversal.intermediateWidth)
        },
        endpoints: {
            doorWidth: clampNumber(endpointsSource.doorWidth, 90, 170, DEFAULT_THEME.endpoints.doorWidth),
            doorHeight: clampNumber(endpointsSource.doorHeight, 120, 220, DEFAULT_THEME.endpoints.doorHeight),
            calmDistance: clampNumber(endpointsSource.calmDistance, 220, 520, DEFAULT_THEME.endpoints.calmDistance)
        },
        encounters: {
            calmDistance: clampNumber(encountersSource.calmDistance, 300, 900, DEFAULT_THEME.encounters.calmDistance),
            minimumEncounterSpacing: clampNumber(encountersSource.minimumEncounterSpacing, 420, 1200, DEFAULT_THEME.encounters.minimumEncounterSpacing),
            landingBuffer: clampNumber(encountersSource.landingBuffer, 80, 220, DEFAULT_THEME.encounters.landingBuffer),
            spawnSafetyBuffer: clampNumber(encountersSource.spawnSafetyBuffer, 80, 260, DEFAULT_THEME.encounters.spawnSafetyBuffer),
            maximumEncounterShare: clampNumber(encountersSource.maximumEncounterShare, 0.35, 0.9, DEFAULT_THEME.encounters.maximumEncounterShare)
        },
        rewards: {
            endpointExclusionDistance: clampNumber(rewardsSource.endpointExclusionDistance, 240, 900, DEFAULT_THEME.rewards.endpointExclusionDistance),
            minimumRewardSpacing: clampNumber(rewardsSource.minimumRewardSpacing, 240, 1000, DEFAULT_THEME.rewards.minimumRewardSpacing),
            treasureChestScore: Math.round(clampNumber(rewardsSource.treasureChestScore, 25, 1000, DEFAULT_THEME.rewards.treasureChestScore)),
            maximumContextualPowerUps: Math.round(clampNumber(rewardsSource.maximumContextualPowerUps, 0, 8, DEFAULT_THEME.rewards.maximumContextualPowerUps)),
            thoughtChance: clamp01(rewardsSource.thoughtChance ?? DEFAULT_THEME.rewards.thoughtChance),
            maximumThoughts: Math.round(clampNumber(rewardsSource.maximumThoughts, 0, 3, DEFAULT_THEME.rewards.maximumThoughts)),
            thoughts: normalizeStringArray(rewardsSource.thoughts || DEFAULT_THEME.rewards.thoughts)
        },
        decoration: {
            populatePerimeter: decorationSource.populatePerimeter !== false,
            protectGameplay: decorationSource.protectGameplay !== false,
            supportPaddingX: clampNumber(decorationSource.supportPaddingX, 0, 180, DEFAULT_THEME.decoration.supportPaddingX),
            supportPaddingY: clampNumber(decorationSource.supportPaddingY, 0, 220, DEFAULT_THEME.decoration.supportPaddingY),
            endpointPadding: clampNumber(decorationSource.endpointPadding, 40, 320, DEFAULT_THEME.decoration.endpointPadding),
            rewardPadding: clampNumber(decorationSource.rewardPadding, 0, 160, DEFAULT_THEME.decoration.rewardPadding)
        },
        colorMap: {
            enabled: Boolean(colorMapSource.enabled),
            sourceHue: finiteNumber(colorMapSource.sourceHue, DEFAULT_THEME.colorMap.sourceHue),
            range: clampNumber(colorMapSource.range, 0, 360, DEFAULT_THEME.colorMap.range),
            feather: clampNumber(colorMapSource.feather, 0, 180, DEFAULT_THEME.colorMap.feather),
            rotation: clampNumber(colorMapSource.rotation, -360, 360, DEFAULT_THEME.colorMap.rotation),
            atlasIds: normalizeStringArray(colorMapSource.atlasIds || DEFAULT_THEME.colorMap.atlasIds)
        },
        implementations
    };
}

export function normalizeGeneratorSettings(value, fallback = DEFAULT_GENERATOR_SETTINGS) {
    const source = value && typeof value === "object" ? value : {};
    const base = fallback && typeof fallback === "object" ? fallback : DEFAULT_GENERATOR_SETTINGS;
    const requestedLength = String(source.length || base.length || DEFAULT_GENERATOR_SETTINGS.length);
    return {
        length: LEVEL_LENGTH_PRESETS[requestedLength] ? requestedLength : DEFAULT_GENERATOR_SETTINGS.length,
        verticality: clamp01(source.verticality ?? base.verticality),
        winding: clamp01(source.winding ?? base.winding),
        difficulty: clamp01(source.difficulty ?? base.difficulty),
        safety: clamp01(source.safety ?? base.safety),
        enemyDensity: clamp01(source.enemyDensity ?? base.enemyDensity),
        rewardDensity: clamp01(source.rewardDensity ?? base.rewardDensity),
        allowThoughts: Boolean(source.allowThoughts ?? base.allowThoughts ?? DEFAULT_GENERATOR_SETTINGS.allowThoughts),
        allowedEnemies: String(source.allowedEnemies ?? base.allowedEnemies ?? DEFAULT_GENERATOR_SETTINGS.allowedEnemies).trim() || "1-999"
    };
}

export function normalizeGeneratorImplementations(value) {
    const source = value && typeof value === "object" ? value : {};
    const normalized = {};
    for (const stage of LEVEL_GENERATOR_STAGE_ORDER) {
        const registry = LEVEL_GENERATOR_REGISTRIES[stage] || [];
        const requested = String(source[stage] || "").trim();
        if (!requested) {
            normalized[stage] = registry[0]?.id || "";
            continue;
        }
        if (registry.some((entry) => entry.id === requested) || INTERNAL_GENERATOR_IMPLEMENTATIONS[stage]?.has(requested)) {
            normalized[stage] = requested;
            continue;
        }
        throw new Error(`Unsupported ${stage} generator implementation “${requested}”.`);
    }
    return normalized;
}

export function normalizeGeneratorStageRevisions(value) {
    const source = value && typeof value === "object" ? value : {};
    const result = {};
    for (const stage of LEVEL_GENERATOR_STAGE_ORDER) {
        result[stage] = Math.max(0, Math.min(999999, Math.floor(Number(source[stage]) || 0)));
    }
    return result;
}

export function generatorStageStreamName(stage, stageRevisions = null) {
    const normalizedStage = LEVEL_GENERATOR_STAGE_ORDER.includes(String(stage)) ? String(stage) : "validation";
    const revision = normalizeGeneratorStageRevisions(stageRevisions)[normalizedStage];
    return revision > 0 ? `${normalizedStage}:revision-${revision}` : normalizedStage;
}

export function incrementGeneratorStageRevision(value, stage, amount = 1) {
    const result = normalizeGeneratorStageRevisions(value);
    if (!LEVEL_GENERATOR_STAGE_ORDER.includes(String(stage))) return result;
    result[stage] = Math.max(0, Math.min(999999, result[stage] + Math.max(1, Math.floor(Number(amount) || 1))));
    return result;
}

function generationOwnershipStage(record) {
    return String(record?.generationStage || record?.manualizedFromGeneration?.stage || "");
}

function hasGenerationStageProvenance(record, stage) {
    if (!record || generationOwnershipStage(record) !== stage) return false;
    return record.generatedBy === AUTOMATIC_LEVEL_GENERATOR_ID
        || Boolean(record.manualizedFromGeneration);
}

export function hashGeneratorSeed(value) {
    const text = String(value ?? "0");
    let hash = 0x811c9dc5;
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193);
    }
    hash += hash << 13;
    hash ^= hash >>> 7;
    hash += hash << 3;
    hash ^= hash >>> 17;
    hash += hash << 5;
    return hash >>> 0;
}

export function createNamedRandomStream(seed, streamName, attempt = 0) {
    let state = hashGeneratorSeed(`${String(seed)}::${String(streamName)}::${Math.max(0, Math.floor(Number(attempt) || 0))}`) || 0x6d2b79f5;
    const random = () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
    return Object.freeze({
        float: random,
        range(min, max) {
            const lo = Number(min) || 0;
            const hi = Number(max) || 0;
            return lo + (hi - lo) * random();
        },
        int(min, maxInclusive) {
            const lo = Math.ceil(Number(min) || 0);
            const hi = Math.floor(Number(maxInclusive) || 0);
            if (hi <= lo) return lo;
            return lo + Math.floor(random() * (hi - lo + 1));
        },
        chance(probability) {
            return random() < clamp01(probability);
        },
        pick(values) {
            return Array.isArray(values) && values.length ? values[Math.floor(random() * values.length)] : undefined;
        },
        shuffle(values) {
            const result = Array.isArray(values) ? [...values] : [];
            for (let index = result.length - 1; index > 0; index -= 1) {
                const swapIndex = Math.floor(random() * (index + 1));
                [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
            }
            return result;
        }
    });
}

function collectAutomaticLevelRouteCandidates(options = {}) {
    const theme = normalizeGeneratorTheme(options.theme);
    const settings = normalizeGeneratorSettings(options.settings, theme.defaults);
    const implementations = normalizeGeneratorImplementations(options.implementations || theme.implementations);
    if (!["the-path74-route-v4", "mostly-horizontal-route-v1", "rising-snake-route-v1"].includes(implementations.route)) {
        throw new Error(`Unsupported route generator “${implementations.route}”.`);
    }
    const seed = String(options.seed ?? "0").trim() || "0";
    const stageRevisions = normalizeGeneratorStageRevisions(options.stageRevisions);
    const enemySelection = parseEnemySelection(settings.allowedEnemies, options.availableEnemyIds || []);
    if (!enemySelection.valid) {
        throw new Error(enemySelection.errors.join(" "));
    }

    const attempts = Math.round(clampNumber(options.maxAttempts, 1, 64, theme.route.candidateAttempts));
    const preferredRouteAttempt = Math.floor(Number(options.preferredRouteAttempt) || 0);
    const attemptNumbers = preferredRouteAttempt >= 1 && preferredRouteAttempt <= attempts
        ? [preferredRouteAttempt]
        : Array.from({ length: attempts }, (_, index) => index + 1);
    let representativeMacroPlan = null;
    const candidates = [];
    const rejected = [];
    for (const attempt of attemptNumbers) {
        const rng = createNamedRandomStream(seed, generatorStageStreamName("route", stageRevisions), attempt);
        const macroPlan = null;
        let graph;
        try {
            graph = implementations.route === "mostly-horizontal-route-v1"
                ? buildMostlyHorizontalRouteCandidate({ theme, settings, rng, attempt })
                : implementations.route === "rising-snake-route-v1"
                    ? buildRisingSnakeRouteCandidate({ theme, settings, rng, attempt })
                    : buildThePath74RouteCandidate({ theme, settings, rng, attempt });
        } catch (error) {
            if (rejected.length < 10) rejected.push({ attempt, reasons: [String(error?.message || error)] });
            continue;
        }
        const validation = validateRouteGraph(graph, { settings, theme });
        if (validation.valid) {
            candidates.push({ graph, validation, attempt });
        } else if (rejected.length < 10) {
            rejected.push({ attempt, reasons: validation.errors.slice(0, 3) });
        }
    }
    candidates.sort((a, b) => b.validation.qualityScore - a.validation.qualityScore || a.attempt - b.attempt);
    return {
        theme,
        settings,
        implementations,
        seed,
        stageRevisions,
        enemySelection,
        attempts,
        attemptsInspected: attemptNumbers.length,
        preferredRouteAttempt: preferredRouteAttempt >= 1 && preferredRouteAttempt <= attempts ? preferredRouteAttempt : 0,
        macroPlan: representativeMacroPlan,
        candidates,
        rejected
    };
}

function buildAutomaticLevelRouteResult(context, selected) {
    const { theme, settings, implementations, seed, stageRevisions, enemySelection, attempts, attemptsInspected, candidates, rejected } = context;
    const identity = stableStringify({
        generatorVersion: AUTOMATIC_LEVEL_GENERATOR_VERSION,
        seed,
        themeId: theme.themeId,
        settings,
        implementations,
        routeRevision: stageRevisions.route,
        attempt: selected.attempt
    });
    const runId = `alg9_${hashGeneratorSeed(identity).toString(16).padStart(8, "0")}`;
    const graph = {
        ...selected.graph,
        runId,
        generatorId: implementations.route,
        validation: selected.validation
    };
    return {
        version: AUTOMATIC_LEVEL_GENERATOR_VERSION,
        generatorId: AUTOMATIC_LEVEL_GENERATOR_ID,
        runId,
        themeId: theme.themeId,
        seed,
        attempt: selected.attempt,
        attemptsTried: attemptsInspected || attempts,
        stageRevisions,
        implementations,
        settings,
        resolvedEnemyIds: enemySelection.resolvedIds,
        route: graph,
        validation: selected.validation,
        diagnostics: {
            validCandidates: candidates.length,
            rejectedCandidates: (attemptsInspected || attempts) - candidates.length,
            rejected
        }
    };
}

function throwNoRouteCandidate(context) {
    const detail = context.rejected.flatMap((item) => item.reasons).slice(0, 4).join(" ");
    throw new Error(`No valid route candidate was found after ${context.attemptsInspected || context.attempts} deterministic attempt${(context.attemptsInspected || context.attempts) === 1 ? "" : "s"}.${detail ? ` ${detail}` : ""}`);
}

export function generateAutomaticLevelRoute(options = {}) {
    const context = collectAutomaticLevelRouteCandidates(options);
    if (!context.candidates.length) throwNoRouteCandidate(context);
    return buildAutomaticLevelRouteResult(context, context.candidates[0]);
}

export function normalizeGenerationAssetCatalog(value) {
    const source = value && typeof value === "object" ? value : {};
    const assets = Array.isArray(source.assets) ? source.assets : [];
    return {
        version: Math.max(1, Math.floor(Number(source.version) || 1)),
        catalogId: cleanId(source.catalogId || "cavern-platform-generation-v2", "cavern-platform-generation-v2"),
        assets: assets
            .filter((entry) => entry && entry.atlasId && entry.assetId)
            .map((entry) => ({
                atlasId: String(entry.atlasId),
                assetId: String(entry.assetId),
                roles: normalizeStringArray(entry.roles),
                weight: clampNumber(entry.weight, 0.1, 100, 1),
                nativeWidth: clampNumber(entry.nativeWidth, 16, 4096, 256),
                nativeHeight: clampNumber(entry.nativeHeight, 16, 4096, 96),
                surfaceYRatio: clampNumber(entry.surfaceYRatio, 0, 0.9, 0.16),
                walkableLeftInsetRatio: clampNumber(entry.walkableLeftInsetRatio, 0, 0.8, 0.04),
                walkableRightInsetRatio: clampNumber(entry.walkableRightInsetRatio, 0, 0.8, 0.04),
                scaleMin: clampNumber(entry.scaleMin, 0.2, 5, 0.75),
                scaleMax: clampNumber(entry.scaleMax, 0.2, 5, 1.35),
                minimumDoorWidth: Math.max(0, finiteNumber(entry.minimumDoorWidth, 0)),
                minimumVisibleDepth: Math.max(0, finiteNumber(entry.minimumVisibleDepth, 0)),
                collisionMode: entry.collisionMode === "oneWay" ? "oneWay" : "blockable",
                mirror: entry.mirror !== false
            }))
            .filter((entry) => entry.roles.length && entry.scaleMax >= entry.scaleMin)
    };
}

export function normalizeEnemyGenerationCatalog(value) {
    const source = value && typeof value === "object" ? value : {};
    const rawEnemies = source.enemies && typeof source.enemies === "object" ? source.enemies : {};
    const rawEntries = Array.isArray(rawEnemies)
        ? rawEnemies.map((entry) => [String(entry?.enemyId || ""), entry])
        : Object.entries(rawEnemies);
    const enemies = rawEntries.filter(([enemyId]) => enemyId).map(([enemyId, raw]) => {
        const entry = raw && typeof raw === "object" ? raw : {};
        const placementClass = ["groundMelee", "groundRanged", "flyingBomber"].includes(entry.placementClass)
            ? entry.placementClass
            : "groundMelee";
        let groupMin = Math.round(clampNumber(entry.groupMin, 1, 6, 1));
        let groupMax = Math.round(clampNumber(entry.groupMax, groupMin, 6, groupMin));
        if (placementClass === "flyingBomber") {
            groupMin = Math.max(2, groupMin);
            groupMax = Math.max(groupMin, Math.min(3, groupMax));
        }
        return {
            enemyId: String(enemyId),
            placementClass,
            groupMin,
            groupMax,
            difficultyCost: clampNumber(entry.difficultyCost, 0.25, 20, 2),
            weight: clampNumber(entry.weight, 0.05, 20, 1),
            minDifficulty: clamp01(entry.minDifficulty),
            maxDifficulty: clampNumber(entry.maxDifficulty, 0, 1, 1),
            minWalkableWidth: clampNumber(entry.minWalkableWidth, 100, 1200, 260),
            edgeClearance: clampNumber(entry.edgeClearance, 24, 260, 72),
            landingBuffer: clampNumber(entry.landingBuffer, 40, 280, 120),
            headroom: clampNumber(entry.headroom, 80, 720, 180),
            patrolRoom: clampNumber(entry.patrolRoom, 0, 1000, 180),
            minGroupSpacing: clampNumber(entry.minGroupSpacing, 24, 320, 80),
            spawnHeightMin: clampNumber(entry.spawnHeightMin, 60, 480, 160),
            spawnHeightMax: clampNumber(entry.spawnHeightMax, 60, 620, 260),
            requiresNavigation: Boolean(entry.requiresNavigation),
            preferredProgressMin: clamp01(entry.preferredProgressMin),
            preferredProgressMax: clampNumber(entry.preferredProgressMax, 0, 1, 1),
            notes: String(entry.notes || "")
        };
    }).filter((entry) => entry.maxDifficulty >= entry.minDifficulty && entry.preferredProgressMax >= entry.preferredProgressMin);
    return {
        version: Math.max(1, Math.floor(Number(source.version) || 1)),
        catalogId: cleanId(source.catalogId || "cavern-enemy-generation-v1", "cavern-enemy-generation-v1"),
        enemies
    };
}

export function normalizeRewardGenerationCatalog(value) {
    const source = value && typeof value === "object" ? value : {};
    const rawRewards = source.rewards && typeof source.rewards === "object" ? source.rewards : {};
    const rewards = Object.entries(rawRewards).map(([rewardId, raw]) => {
        const entry = raw && typeof raw === "object" ? raw : {};
        const category = ["treasure", "powerUp", "utility", "narrative", "prop"].includes(entry.category)
            ? entry.category
            : "prop";
        const verticalOffset = clampNumber(entry.verticalOffset, 0, 320, 0);
        return {
            rewardId: String(rewardId),
            entityType: String(entry.entityType || rewardId),
            category,
            contexts: normalizeStringArray(entry.contexts),
            weight: clampNumber(entry.weight, 0.05, 20, 1),
            minimumSupportWidth: clampNumber(entry.minimumSupportWidth, 80, 1200, 220),
            edgeClearance: clampNumber(entry.edgeClearance, 16, 280, 64),
            // Generated power-ups are floor pickups. Their authored position is
            // the bottom centre of the entity, so a zero offset seats them on
            // the support surface and keeps them inside ordinary walking reach.
            verticalOffset: category === "powerUp" ? 0 : verticalOffset,
            minimumProgress: clamp01(entry.minimumProgress),
            maximumProgress: clampNumber(entry.maximumProgress, 0, 1, 1)
        };
    }).filter((entry) => entry.entityType && entry.contexts.length && entry.maximumProgress >= entry.minimumProgress);
    return {
        version: Math.max(1, Math.floor(Number(source.version) || 1)),
        catalogId: cleanId(source.catalogId || "cavern-reward-generation-v1", "cavern-reward-generation-v1"),
        rewards
    };
}

function normalizeInteractiveEntityCatalog(value) {
    if (value instanceof Map) return new Map(value);
    const source = value && typeof value === "object" ? value : {};
    const rawEntities = source.entities && typeof source.entities === "object" ? source.entities : source;
    return new Map(Object.entries(rawEntities || {}).map(([type, raw]) => {
        const entry = raw && typeof raw === "object" ? raw : {};
        return [String(type), {
            type: String(type),
            catalogId: String(entry.catalogId || source.catalogId || "it_entities_001"),
            label: String(entry.label || type),
            description: String(entry.description || entry.label || type),
            defaultState: String(entry.defaultState || Object.keys(entry.states || {})[0] || "default"),
            defaultSize: {
                w: clampNumber(entry.defaultSize?.w, 4, 1200, 72),
                h: clampNumber(entry.defaultSize?.h, 4, 1200, 84)
            },
            defaults: entry.defaults && typeof entry.defaults === "object" ? JSON.parse(JSON.stringify(entry.defaults)) : {},
            states: entry.states && typeof entry.states === "object" ? JSON.parse(JSON.stringify(entry.states)) : {}
        }];
    }));
}

function normalizeEnemyCatalogDefinitions(value) {
    if (value instanceof Map) return new Map(value);
    const source = value && typeof value === "object" ? value : {};
    const rawEnemies = source.enemies && typeof source.enemies === "object" ? source.enemies : source;
    return new Map(Object.entries(rawEnemies || {}).map(([enemyId, raw]) => {
        const entry = raw && typeof raw === "object" ? raw : {};
        return [String(enemyId), {
            enemyId: String(enemyId),
            label: String(entry.label || enemyId),
            characterId: String(entry.characterId || "ct_char_enemy_001"),
            description: String(entry.description || entry.label || enemyId),
            defaultSize: {
                w: clampNumber(entry.defaultSize?.w, 8, 800, 72),
                h: clampNumber(entry.defaultSize?.h, 8, 800, 150)
            },
            defaults: entry.defaults && typeof entry.defaults === "object" ? JSON.parse(JSON.stringify(entry.defaults)) : {}
        }];
    }));
}

function generatedMandatoryRouteDistance(route) {
    const mandatoryNodes = (route?.nodes || [])
        .filter((node) => node?.mandatory !== false)
        .sort((left, right) => finiteNumber(left?.progress, 0) - finiteNumber(right?.progress, 0));
    let routeDistance = 0;
    for (let index = 1; index < mandatoryNodes.length; index += 1) {
        routeDistance += distance(mandatoryNodes[index - 1], mandatoryNodes[index]);
    }
    if (routeDistance <= 0 && mandatoryNodes.length > 1) {
        const xs = mandatoryNodes.map((node) => finiteNumber(node?.x, 0));
        routeDistance = Math.max(...xs) - Math.min(...xs);
    }
    return Math.max(0, routeDistance);
}

function generatedHorizontalRouteSpan(route) {
    const xs = (route?.nodes || [])
        .filter((node) => node?.mandatory !== false)
        .map((node) => finiteNumber(node?.x, NaN))
        .filter(Number.isFinite);
    if (xs.length < 2) return 0;
    return Math.max(0, Math.max(...xs) - Math.min(...xs));
}

function distributedSlotOrder(count) {
    const total = Math.max(0, Math.floor(Number(count) || 0));
    if (total <= 1) return total ? [0] : [];
    const remaining = new Set(Array.from({ length: total }, (_, index) => index));
    const ordered = [];
    const take = (index) => {
        if (!remaining.has(index)) return;
        remaining.delete(index);
        ordered.push(index);
    };
    take(0);
    take(total - 1);
    while (remaining.size) {
        let bestIndex = -1;
        let bestDistance = -1;
        for (const index of remaining) {
            const nearest = Math.min(...ordered.map((used) => Math.abs(index - used)));
            if (nearest > bestDistance || (nearest === bestDistance && index < bestIndex)) {
                bestDistance = nearest;
                bestIndex = index;
            }
        }
        take(bestIndex);
    }
    return ordered;
}

export function generatedMonsterTargetForRoute(
    route,
    settings = {},
    defaultEnemyDensity = DEFAULT_GENERATOR_SETTINGS.enemyDensity
) {
    const enemyDensity = clamp01(settings.enemyDensity ?? defaultEnemyDensity);
    if (enemyDensity <= 0.001) return 0;
    const horizontalSpan = generatedHorizontalRouteSpan(route);
    const baselineTarget = Math.max(1, Math.round(horizontalSpan / GENERATED_MONSTER_SPACING_PX));
    const densityScale = clamp(
        enemyDensity / Math.max(0.001, clamp01(defaultEnemyDensity)),
        0.25,
        2
    );
    return Math.max(1, Math.round(baselineTarget * densityScale));
}

function generatedRouteScaledRewardTarget(route, settings, spacingPx, maximumDensityScale = 1.5) {
    const rewardDensity = clamp01(settings.rewardDensity ?? DEFAULT_GENERATOR_SETTINGS.rewardDensity);
    if (rewardDensity <= 0.001) return 0;
    const routeDistance = generatedMandatoryRouteDistance(route);
    const baselineTarget = Math.max(1, Math.round(routeDistance / Math.max(1, spacingPx)));
    const densityScale = clamp(
        rewardDensity / Math.max(0.001, DEFAULT_GENERATOR_SETTINGS.rewardDensity),
        0.25,
        maximumDensityScale
    );
    return Math.max(1, Math.round(baselineTarget * densityScale));
}

export function generatedTreasureChestTargetForRoute(route, settings = {}) {
    return generatedRouteScaledRewardTarget(route, settings, GENERATED_TREASURE_CHEST_SPACING_PX, 1);
}

export function generatedPowerUpTargetForRoute(route, settings = {}) {
    return generatedRouteScaledRewardTarget(route, settings, GENERATED_POWER_UP_SPACING_PX);
}

function planBasicRewards({ route, theme, settings, runId, implementationId }) {
    const mainNodeCount = (route?.nodes || []).filter((node) => node.mandatory !== false).length;
    const treasureTarget = implementationId === "basic-rewards-v1"
        ? generatedTreasureChestTargetForRoute(route, settings)
        : 0;
    const contextualRewardTarget = implementationId === "basic-rewards-v1"
        ? Math.min(
            theme.rewards.maximumContextualPowerUps,
            Math.max(0, Math.floor(settings.rewardDensity * (1 + mainNodeCount / 5.5)))
        )
        : 0;
    return {
        version: 4,
        generatorId: implementationId,
        runId,
        treasureTarget,
        contextualRewardTarget,
        powerUpTarget: implementationId === "basic-rewards-v1"
            ? generatedPowerUpTargetForRoute(route, settings)
            : 0,
        allowThoughts: Boolean(
            implementationId === "basic-rewards-v1"
            && settings.allowThoughts
            && theme.rewards.maximumThoughts > 0
            && theme.rewards.thoughts.length
        )
    };
}

function emptyRewardPopulation(runId, implementationId = "not-generated-yet", plan = null) {
    return {
        version: 4,
        generatorId: String(implementationId || "not-generated-yet"),
        runId: String(runId || ""),
        treasureTarget: Math.max(0, Math.floor(Number(plan?.treasureTarget) || 0)),
        contextualRewardTarget: Math.max(0, Math.floor(Number(plan?.contextualRewardTarget) || 0)),
        powerUpTarget: Math.max(0, Math.floor(Number(plan?.powerUpTarget) || 0)),
        selectedPerchSupportIds: normalizeStringArray(plan?.selectedPerchSupportIds),
        rewards: [],
        entities: []
    };
}

function instantiateGeneratedCatalogEntity({ id, type, definition, x, y, runId, role, support, routeNodeId, context, overrides = {} }) {
    const visualStates = {};
    const stateLabels = {};
    for (const [stateId, stateDefinition] of Object.entries(definition.states || {})) {
        visualStates[stateId] = JSON.parse(JSON.stringify(stateDefinition?.visuals || []));
        stateLabels[stateId] = String(stateDefinition?.label || stateId);
    }
    return {
        id,
        type,
        catalogId: definition.catalogId || "it_entities_001",
        x: roundCoordinate(x),
        y: roundCoordinate(y),
        w: definition.defaultSize.w,
        h: definition.defaultSize.h,
        state: definition.defaultState,
        visualStates,
        stateLabels,
        ...JSON.parse(JSON.stringify(definition.defaults || {})),
        ...JSON.parse(JSON.stringify(overrides || {})),
        generatedBy: AUTOMATIC_LEVEL_GENERATOR_ID,
        generationRunId: runId,
        generationStage: "rewards",
        generationRole: role,
        generationSupportId: support.id,
        routeNodeId: routeNodeId || support.routeNodeId || undefined,
        generationContext: context,
        generatorId: "basic-rewards-v1",
        notes: `Generated ${definition.label} for ${context} on ${support.id}.`
    };
}

function rewardMetadataForContext(rewardCatalog, context, category = null) {
    return (rewardCatalog?.rewards || []).filter((entry) =>
        entry.contexts.includes(context) && (!category || entry.category === category)
    );
}

function supportProgress(support, routeNodeById, routeEdgeById) {
    const node = routeNodeById.get(support.routeNodeId);
    if (node) return Number(node.progress) || 0;
    const edge = routeEdgeById.get(support.routeEdgeId);
    if (!edge) return 0;
    const from = routeNodeById.get(edge.from);
    const to = routeNodeById.get(edge.to);
    return ((Number(from?.progress) || 0) + (Number(to?.progress) || 0)) * 0.5;
}

function generatedVisualRewardSpacing(theme, leftCategory, rightCategory) {
    if (leftCategory === "treasure" && rightCategory === "treasure") {
        // The target is an average of one chest per 500 route pixels, not a
        // rigid 500-pixel exclusion circle. A smaller local minimum lets bends,
        // stacked lanes, and short supports distribute the target naturally.
        return Math.min(theme.rewards.minimumRewardSpacing, GENERATED_TREASURE_CHEST_SPACING_PX * 0.48);
    }
    if (leftCategory === rightCategory) return theme.rewards.minimumRewardSpacing;
    return Math.max(180, theme.rewards.minimumRewardSpacing * 0.5);
}

function buildBasicRewards({
    route,
    traversal,
    endpoints,
    cavern,
    theme,
    settings,
    rewardPlan,
    rewardGenerationCatalog,
    entityCatalog,
    rng,
    runId
}) {
    if (rewardPlan.generatorId !== "basic-rewards-v1") return emptyRewardPopulation(runId, rewardPlan.generatorId, rewardPlan);
    const metadataByType = new Map((rewardGenerationCatalog?.rewards || []).map((entry) => [entry.entityType, entry]));
    const routeNodeById = new Map((route?.nodes || []).map((node) => [node.id, node]));
    const routeEdgeById = new Map((route?.edges || []).map((edge) => [edge.id, edge]));
    const supports = Array.isArray(traversal?.supports) ? traversal.supports : [];
    const supportById = new Map(supports.map((support) => [support.id, support]));
    const entities = [];
    const rewards = [];
    const occupiedSupportIds = new Set();
    const occupiedPositions = [];
    const selectedPerchSupportIds = [];
    const treasureChestTarget = Math.max(0, Math.floor(Number(rewardPlan?.treasureTarget) || 0));
    const guaranteedPowerUpTarget = Math.max(0, Math.floor(Number(rewardPlan?.powerUpTarget) || 0));
    const endpointXs = [
        finiteNumber(endpoints?.entrance?.x, supportById.get(traversal.startSupportId)?.centerX || 0),
        finiteNumber(endpoints?.exit?.x, supportById.get(traversal.exitSupportId)?.centerX || 0)
    ];
    const maximumRouteProgress = Math.max(1, ...(route?.nodes || []).filter((node) => node.mandatory).map((node) => Number(node.progress) || 0));
    const treasureMetadata = metadataByType.get("treasureChest");
    const treasureDefinition = entityCatalog.get("treasureChest");
    const powerUpMetadata = (rewardGenerationCatalog?.rewards || [])
        .filter((metadata) => metadata.category === "powerUp" && entityCatalog.has(metadata.entityType));
    const powerUpWeightTotal = Math.max(0.001, powerUpMetadata.reduce((sum, metadata) => sum + Math.max(0, metadata.weight), 0));
    const powerUpMinimumSupportWidth = Math.max(0, ...powerUpMetadata.map((metadata) => metadata.minimumSupportWidth));
    const powerUpPlacementOutset = Math.max(0, ...powerUpMetadata.map((metadata) => {
        const definition = entityCatalog.get(metadata.entityType);
        return metadata.edgeClearance + finiteNumber(definition?.defaultSize?.w, 96) * 0.5;
    }));
    const powerUpMinimumProgress = Math.max(0, ...powerUpMetadata.map((metadata) => metadata.minimumProgress));
    const powerUpMaximumProgress = Math.min(1, ...powerUpMetadata.map((metadata) => metadata.maximumProgress));
    const selectPowerUpMetadata = (candidates) => {
        const available = (candidates || []).filter(Boolean);
        if (!available.length) return null;
        const counts = new Map();
        let placedCount = 0;
        for (const reward of rewards) {
            if (reward.category !== "powerUp") continue;
            placedCount += 1;
            counts.set(reward.entityType, (counts.get(reward.entityType) || 0) + 1);
        }
        const scored = available.map((metadata) => ({
            metadata,
            deficit: ((placedCount + 1) * Math.max(0, metadata.weight) / powerUpWeightTotal)
                - (counts.get(metadata.entityType) || 0)
        }));
        const bestDeficit = Math.max(...scored.map((entry) => entry.deficit));
        const nearBest = scored.filter((entry) => entry.deficit >= bestDeficit - 0.24);
        return rng.pick(nearBest)?.metadata || null;
    };
    const thoughtMetadata = metadataByType.get("thoughtTrigger");
    const thoughtReservedSupport = rewardPlan.allowThoughts && thoughtMetadata && entityCatalog.has("thoughtTrigger")
        ? supports
            .filter((support) => support.mandatory && ["routeFloor", "landingPlatform", "runAndGunGround"].includes(support.role))
            .map((support) => {
                const progress = supportProgress(support, routeNodeById, routeEdgeById);
                const normalizedProgress = progress / maximumRouteProgress;
                const left = support.walkableLeftX + finiteNumber(thoughtMetadata.edgeClearance, 0);
                const right = support.walkableRightX - finiteNumber(thoughtMetadata.edgeClearance, 0);
                const x = clamp(support.centerX, left, right);
                return { support, progress, normalizedProgress, left, right, x };
            })
            .filter((candidate) => candidate.left <= candidate.right
                && candidate.support.walkableWidth >= finiteNumber(thoughtMetadata.minimumSupportWidth, 0)
                && candidate.normalizedProgress >= finiteNumber(thoughtMetadata.minimumProgress, 0)
                && candidate.normalizedProgress <= finiteNumber(thoughtMetadata.maximumProgress, 1)
                && !endpointXs.some((endpointX) => Math.abs(candidate.x - endpointX) < theme.rewards.endpointExclusionDistance))
            .sort((left, right) => Math.abs(left.normalizedProgress - 0.5) - Math.abs(right.normalizedProgress - 0.5)
                || left.support.id.localeCompare(right.support.id))[0]?.support || null
        : null;
    if (thoughtReservedSupport) occupiedSupportIds.add(thoughtReservedSupport.id);

    const positionConflicts = (category, x, y) => occupiedPositions.some((point) =>
        Math.abs(point.x - x) < generatedVisualRewardSpacing(theme, category, point.category)
        && Math.abs(point.y - y) < 180
    );

    const addReward = ({ type, support, context, routeNodeId = "", x = null, overrides = {}, reserveSupport = true }) => {
        const metadata = metadataByType.get(type);
        const definition = entityCatalog.get(type);
        if (!metadata || !definition || !support) return null;
        const normalizedProgress = supportProgress(support, routeNodeById, routeEdgeById) / maximumRouteProgress;
        const minimumProgress = metadata.category === "powerUp" ? powerUpMinimumProgress : metadata.minimumProgress;
        const maximumProgress = metadata.category === "powerUp" ? powerUpMaximumProgress : metadata.maximumProgress;
        const minimumSupportWidth = metadata.category === "powerUp" ? powerUpMinimumSupportWidth : metadata.minimumSupportWidth;
        if (normalizedProgress < minimumProgress || normalizedProgress > maximumProgress) return null;
        if (support.walkableWidth < minimumSupportWidth) return null;
        // Narrative thought triggers are invisible activation regions, not physical
        // pickups that must fit completely on top of a support. Their authored
        // minimum support width and edge clearance are sufficient; applying the
        // trigger rectangle half-width here would reject otherwise quiet route
        // supports produced by ThePath74.
        const placementOutset = metadata.category === "powerUp"
            ? powerUpPlacementOutset
            : metadata.edgeClearance + (type === "thoughtTrigger" ? 0 : definition.defaultSize.w * 0.5);
        const left = support.walkableLeftX + placementOutset;
        const right = support.walkableRightX - placementOutset;
        if (left > right) return null;
        const resolvedY = support.surfaceY - metadata.verticalOffset;
        let resolvedX = Number.isFinite(Number(x)) ? clamp(Number(x), left, right) : clamp(support.centerX, left, right);
        if (!Number.isFinite(Number(x)) && metadata.category === "powerUp") {
            const span = Math.max(0, right - left);
            const edgeCandidates = [left, right];
            const innerCandidates = [
                left + span * 0.25,
                left + span * 0.75,
                left + span * 0.5
            ];
            const candidateXs = [...edgeCandidates, ...innerCandidates];
            const available = candidateXs.find((candidateX) =>
                !endpointXs.some((endpointX) => Math.abs(candidateX - endpointX) < theme.rewards.endpointExclusionDistance)
                && !positionConflicts(metadata.category, candidateX, resolvedY)
            );
            if (available !== undefined) resolvedX = available;
        }
        if (endpointXs.some((endpointX) => Math.abs(resolvedX - endpointX) < theme.rewards.endpointExclusionDistance)) return null;
        // Invisible narrative triggers do not compete for visual pickup spacing.
        // They still require their own support and all endpoint/cave clearances.
        if (metadata.category !== "narrative" && positionConflicts(metadata.category, resolvedX, resolvedY)) return null;
        const id = `generated_reward_${String(rewards.length + 1).padStart(3, "0")}_${runId}`;
        const entity = instantiateGeneratedCatalogEntity({
            id,
            type,
            definition,
            x: resolvedX,
            y: resolvedY,
            runId,
            role: metadata.category,
            support,
            routeNodeId,
            context,
            overrides
        });
        entities.push(entity);
        rewards.push({
            id: `reward_${String(rewards.length + 1).padStart(3, "0")}`,
            entityId: entity.id,
            entityType: type,
            category: metadata.category,
            context,
            supportId: support.id,
            routeNodeId: routeNodeId || support.routeNodeId || "",
            x: entity.x,
            y: entity.y
        });
        if (reserveSupport) occupiedSupportIds.add(support.id);
        occupiedPositions.push({ x: entity.x, y: entity.y, category: metadata.category });
        return entity;
    };

    const dedicatedPowerUpPerches = supports.filter((support) =>
        support.secondaryPlatform
        && support.rewardPerch
        && support.powerUpPerch
        && !support.moving
    ).sort((left, right) =>
        finiteNumber(right.secondaryTier, 1) - finiteNumber(left.secondaryTier, 1)
        || left.surfaceY - right.surfaceY
        || supportProgress(left, routeNodeById, routeEdgeById) - supportProgress(right, routeNodeById, routeEdgeById)
        || left.id.localeCompare(right.id)
    );
    const placeSelectedReward = ({ metadata, support, context, routeNodeId = "", x = null, overrides = {}, reserveSupport = true }) => {
        if (!metadata) return null;
        return addReward({
            type: metadata.entityType,
            support,
            context,
            routeNodeId,
            x,
            overrides,
            reserveSupport
        });
    };

    if (treasureChestTarget > 0 && treasureMetadata && treasureDefinition) {
        // The door supports are real walkable space. Seat one chest on the far
        // side of each endpoint platform when the route budget permits it,
        // leaving the portal approach itself protected by endpoint distance.
        const endpointTreasureSupports = [
            { support: supportById.get(traversal.startSupportId), side: "right", role: "entrance" },
            { support: supportById.get(traversal.exitSupportId), side: "left", role: "exit" }
        ];
        const endpointChestOutset = finiteNumber(treasureMetadata.edgeClearance, 0)
            + finiteNumber(treasureDefinition.defaultSize?.w, 96) * 0.5;
        for (const endpoint of endpointTreasureSupports) {
            if (rewards.filter((reward) => reward.category === "treasure").length >= treasureChestTarget) break;
            const support = endpoint.support;
            if (!support) continue;
            const x = endpoint.side === "right"
                ? support.walkableRightX - endpointChestOutset
                : support.walkableLeftX + endpointChestOutset;
            addReward({
                type: "treasureChest",
                support,
                x,
                context: "openRoute",
                routeNodeId: support.routeNodeId,
                overrides: { scoreValue: theme.rewards.treasureChestScore },
                reserveSupport: false
            });
        }

        const preferredPerches = supports.filter((support) =>
            support.secondaryPlatform
            && support.rewardPerch
            && !support.powerUpPerch
            && support.id !== thoughtReservedSupport?.id
        ).sort((left, right) => supportProgress(left, routeNodeById, routeEdgeById)
            - supportProgress(right, routeNodeById, routeEdgeById)
            || left.id.localeCompare(right.id));
        // Upper perches remain valuable detours, but must not greedily consume
        // the complete treasure budget before endpoint and open-route seats are considered.
        const preferredPerchTarget = Math.min(
            preferredPerches.length,
            Math.max(1, Math.round(treasureChestTarget * 0.55))
        );
        for (const perchIndex of distributedSlotOrder(preferredPerches.length)) {
            if (selectedPerchSupportIds.length >= preferredPerchTarget) break;
            const support = preferredPerches[perchIndex];
            const entity = addReward({
                type: "treasureChest",
                support,
                context: "secondaryPerch",
                routeNodeId: support.routeNodeId,
                overrides: { scoreValue: theme.rewards.treasureChestScore },
                reserveSupport: false
            });
            if (entity) selectedPerchSupportIds.push(support.id);
        }
    }

    const overdriveMetadata = metadataByType.get("overdrivePickup");
    const detourOverdriveTarget = overdriveMetadata && guaranteedPowerUpTarget > 0
        ? Math.min(dedicatedPowerUpPerches.length, Math.max(1, Math.round(guaranteedPowerUpTarget * 0.3)))
        : 0;
    let detourOverdriveCount = 0;
    for (const support of dedicatedPowerUpPerches) {
        if (detourOverdriveCount >= detourOverdriveTarget) break;
        const entity = addReward({
            type: "overdrivePickup",
            support,
            context: "detourUpperPerch",
            routeNodeId: support.routeNodeId
        });
        if (entity) detourOverdriveCount += 1;
    }

    const mainSupportCandidates = supports.filter((support) =>
        ((support.mandatory && ["routeFloor", "landingPlatform", "runAndGunGround", "recoveryPlatform", "doorSupport"].includes(support.role) && (support.routeNodeId || support.routeEdgeId))
            || (support.secondaryPlatform && support.rewardPerch))
    ).map((support) => ({
        support,
        progress: supportProgress(support, routeNodeById, routeEdgeById)
    })).filter((candidate) => {
        const normalizedProgress = candidate.progress / Math.max(1, (route?.nodes || []).filter((node) => node.mandatory).length - 1);
        return normalizedProgress >= 0 && normalizedProgress <= 1;
    });

    const contextual = [];
    for (const transition of traversal?.transitions || []) {
        if (!transition.mandatory) continue;
        if ((transition.gap || 0) < 82 && (transition.rise || 0) < 64 && (transition.drop || 0) < 150) continue;
        const support = supportById.get(transition.fromSupportId);
        if (!support || !support.mandatory || occupiedSupportIds.has(support.id)) continue;
        contextual.push({ context: "beforeDemandingMovement", support, priority: 2 + (transition.gap || 0) / 80 + (transition.rise || 0) / 70, transition });
    }
    contextual.sort((a, b) => b.priority - a.priority || a.support.centerX - b.support.centerX || a.support.id.localeCompare(b.support.id));
    let contextualPlaced = 0;
    const usedContextualTypes = new Set();
    for (const candidate of contextual) {
        if (contextualPlaced >= rewardPlan.contextualRewardTarget) break;
        if (occupiedSupportIds.has(candidate.support.id)) continue;
        const metadataCandidates = rewardMetadataForContext(rewardGenerationCatalog, candidate.context)
            .map((metadata) => ({ metadata, weight: metadata.weight }))
            .filter((entry) => entityCatalog.has(entry.metadata.entityType) && !usedContextualTypes.has(entry.metadata.entityType));
        const selectedMetadata = metadataCandidates.length && metadataCandidates.every((entry) => entry.metadata.category === "powerUp")
            ? selectPowerUpMetadata(metadataCandidates.map((entry) => entry.metadata))
            : weightedRandomChoice(metadataCandidates, rng)?.metadata;
        if (!selectedMetadata) continue;
        const entity = placeSelectedReward({
            metadata: selectedMetadata,
            support: candidate.support,
            context: candidate.context,
            routeNodeId: candidate.support.routeNodeId
        });
        if (entity) {
            contextualPlaced += 1;
            usedContextualTypes.add(selectedMetadata.entityType);
        }
    }

    if (contextualPlaced < rewardPlan.contextualRewardTarget) {
        const fallbackSupports = mainSupportCandidates
            .map((candidate) => candidate.support)
            .filter((support) => !occupiedSupportIds.has(support.id))
            .sort((left, right) => supportProgress(left, routeNodeById, routeEdgeById)
                - supportProgress(right, routeNodeById, routeEdgeById)
                || left.id.localeCompare(right.id));
        for (const support of fallbackSupports) {
            if (contextualPlaced >= rewardPlan.contextualRewardTarget) break;
            const unused = powerUpMetadata.filter((metadata) => !usedContextualTypes.has(metadata.entityType));
            const pool = unused.length ? unused : powerUpMetadata;
            const selectedMetadata = selectPowerUpMetadata(pool);
            if (!selectedMetadata) break;
            const entity = placeSelectedReward({
                metadata: selectedMetadata,
                support,
                context: support.secondaryPlatform ? "openUpperPerch" : "openRoute",
                routeNodeId: support.routeNodeId
            });
            if (entity) {
                contextualPlaced += 1;
                usedContextualTypes.add(selectedMetadata.entityType);
            }
        }
    }

    let powerUpCount = rewards.filter((reward) => reward.category === "powerUp").length;
    if (powerUpCount < guaranteedPowerUpTarget) {
        // Keep the route-scaled guarantee owned entirely by the reward stream.
        // Encounter-only rerolls must not shuffle unrelated reward positions.
        const fallbackSupports = mainSupportCandidates
            .map((candidate) => candidate.support)
            .filter((support) => !occupiedSupportIds.has(support.id))
            .sort((left, right) => supportProgress(left, routeNodeById, routeEdgeById)
                - supportProgress(right, routeNodeById, routeEdgeById)
                || left.id.localeCompare(right.id));
        for (const support of fallbackSupports) {
            if (powerUpCount >= guaranteedPowerUpTarget) break;
            const selectedMetadata = selectPowerUpMetadata(powerUpMetadata);
            if (!selectedMetadata) break;
            const entity = placeSelectedReward({
                metadata: selectedMetadata,
                support,
                context: support.secondaryPlatform ? "openUpperPerch" : "openRoute",
                routeNodeId: support.routeNodeId
            });
            if (entity) {
                powerUpCount += 1;
                usedContextualTypes.add(selectedMetadata.entityType);
            }
        }

        // Dense reward settings can legitimately need more pickups than
        // there are distinct supports. Long platforms may therefore host
        // additional pickups, but only at ordinary reward-spacing intervals.
        if (powerUpCount < guaranteedPowerUpTarget) {
            const repeatedSupportSlots = [];
            const slotSpacing = Math.max(240, theme.rewards.minimumRewardSpacing);
            const candidateStep = Math.max(40, slotSpacing / 4);
            const repeatableSupports = supports.filter((support) =>
                !support.moving
                && support.id !== thoughtReservedSupport?.id
                && (support.routeNodeId || support.routeEdgeId)
            ).sort((left, right) => supportProgress(left, routeNodeById, routeEdgeById)
                - supportProgress(right, routeNodeById, routeEdgeById)
                || left.id.localeCompare(right.id));
            repeatableSupports.forEach((support, supportOrder) => {
                const usableLeft = support.walkableLeftX + powerUpPlacementOutset;
                const usableRight = support.walkableRightX - powerUpPlacementOutset;
                if (usableRight < usableLeft) return;
                for (let x = usableLeft; x <= usableRight + 0.01; x += candidateStep) {
                    repeatedSupportSlots.push({
                        support,
                        x,
                        supportOrder,
                        slotRank: Math.round((x - usableLeft) / candidateStep)
                    });
                }
                if (usableRight - usableLeft > 1) {
                    repeatedSupportSlots.push({
                        support,
                        x: usableRight,
                        supportOrder,
                        slotRank: Math.round((usableRight - usableLeft) / candidateStep)
                    });
                }
            });
            repeatedSupportSlots.sort((left, right) =>
                left.slotRank - right.slotRank
                || left.supportOrder - right.supportOrder
                || left.x - right.x
            );
            for (const slot of repeatedSupportSlots) {
                if (powerUpCount >= guaranteedPowerUpTarget) break;
                const selectedMetadata = selectPowerUpMetadata(powerUpMetadata);
                if (!selectedMetadata) break;
                const entity = placeSelectedReward({
                    metadata: selectedMetadata,
                    support: slot.support,
                    x: slot.x,
                    context: slot.support.secondaryPlatform ? "openUpperPerch" : "openRoute",
                    routeNodeId: slot.support.routeNodeId
                });
                if (entity) {
                    powerUpCount += 1;
                    usedContextualTypes.add(selectedMetadata.entityType);
                }
            }
        }
    }

    let treasureChestCount = rewards.filter((reward) => reward.category === "treasure").length;
    if (treasureChestCount < treasureChestTarget && treasureMetadata && treasureDefinition) {
        const placeTreasureChest = (support, x = null) => {
            const context = support.secondaryPlatform
                ? support.rewardPerch ? "secondaryPerch" : "upperPerch"
                : support.role === "upperAccessPlatform"
                    ? "upperAccess"
                    : support.role === "recoveryPlatform"
                        ? "recoveryRoute"
                        : "openRoute";
            const entity = addReward({
                type: "treasureChest",
                support,
                x,
                context,
                routeNodeId: support.routeNodeId,
                overrides: { scoreValue: theme.rewards.treasureChestScore },
                reserveSupport: false
            });
            if (!entity) return null;
            treasureChestCount += 1;
            if (context === "secondaryPerch" && !selectedPerchSupportIds.includes(support.id)) {
                selectedPerchSupportIds.push(support.id);
            }
            return entity;
        };

        if (treasureChestCount < treasureChestTarget) {
            const chestOutset = finiteNumber(treasureMetadata.edgeClearance, 0)
                + finiteNumber(treasureDefinition.defaultSize?.w, 96) * 0.5;
            const candidateStep = Math.max(80, Math.min(160, theme.rewards.minimumRewardSpacing / 3));
            const chestSlots = [];
            const eligibleSupports = supports.filter((support) =>
                !support.moving
                && support.id !== thoughtReservedSupport?.id
                && (support.routeNodeId || support.routeEdgeId)
                && (
                    (support.mandatory && ["routeFloor", "landingPlatform", "runAndGunGround", "doorSupport"].includes(support.role))
                    || support.role === "recoveryPlatform"
                    || support.role === "upperAccessPlatform"
                    || (support.secondaryPlatform && !support.rewardPerch)
                )
                && support.walkableWidth >= finiteNumber(treasureMetadata.minimumSupportWidth, 0)
            );
            for (const support of eligibleSupports) {
                const normalizedProgress = supportProgress(support, routeNodeById, routeEdgeById) / maximumRouteProgress;
                if (normalizedProgress < finiteNumber(treasureMetadata.minimumProgress, 0)
                    || normalizedProgress > finiteNumber(treasureMetadata.maximumProgress, 1)) continue;
                const left = support.walkableLeftX + chestOutset;
                const right = support.walkableRightX - chestOutset;
                if (left > right) continue;
                const span = Math.max(1, right - left);
                for (let x = left; x <= right + 0.01; x += candidateStep) {
                    const localProgress = clamp((x - left) / span, 0, 1);
                    chestSlots.push({
                        support,
                        x,
                        normalizedProgress: clamp(normalizedProgress + (localProgress - 0.5) * 0.45 / maximumRouteProgress, 0, 1)
                    });
                }
                if (right - left > 1) {
                    chestSlots.push({ support, x: right, normalizedProgress });
                }
            }

            const unusedSlots = new Set(chestSlots.map((_, index) => index));
            const remainingTreasureTarget = Math.max(0, treasureChestTarget - treasureChestCount);
            for (let targetIndex = 0; targetIndex < remainingTreasureTarget && treasureChestCount < treasureChestTarget; targetIndex += 1) {
                const desiredProgress = (targetIndex + 0.5) / Math.max(1, remainingTreasureTarget);
                const ordered = [...unusedSlots].sort((leftIndex, rightIndex) => {
                    const left = chestSlots[leftIndex];
                    const right = chestSlots[rightIndex];
                    return Math.abs(left.normalizedProgress - desiredProgress) - Math.abs(right.normalizedProgress - desiredProgress)
                        || left.support.id.localeCompare(right.support.id)
                        || left.x - right.x;
                });
                for (const slotIndex of ordered) {
                    const slot = chestSlots[slotIndex];
                    unusedSlots.delete(slotIndex);
                    if (placeTreasureChest(slot.support, slot.x)) break;
                }
            }

            if (treasureChestCount < treasureChestTarget) {
                for (const slotIndex of unusedSlots) {
                    if (treasureChestCount >= treasureChestTarget) break;
                    const slot = chestSlots[slotIndex];
                    placeTreasureChest(slot.support, slot.x);
                }
            }
        }
    }

    if (rewardPlan.allowThoughts && rng.chance(theme.rewards.thoughtChance)) {
        const text = theme.rewards.thoughts.length ? rng.pick(theme.rewards.thoughts) : "";
        const candidates = thoughtReservedSupport
            ? [{ support: thoughtReservedSupport, progress: supportProgress(thoughtReservedSupport, routeNodeById, routeEdgeById) }]
            : supports
                .filter((support) => support.mandatory && ["routeFloor", "landingPlatform", "runAndGunGround"].includes(support.role))
                .map((support) => ({ support, progress: supportProgress(support, routeNodeById, routeEdgeById) }))
                .filter((candidate) => {
                    const normalizedProgress = candidate.progress / maximumRouteProgress;
                    return !occupiedSupportIds.has(candidate.support.id)
                        && candidate.support.walkableWidth >= finiteNumber(thoughtMetadata?.minimumSupportWidth, 0)
                        && normalizedProgress >= finiteNumber(thoughtMetadata?.minimumProgress, 0)
                        && normalizedProgress <= finiteNumber(thoughtMetadata?.maximumProgress, 1);
                })
                .sort((left, right) => left.progress - right.progress || left.support.id.localeCompare(right.support.id));
        if (text) {
            for (const selected of candidates) {
                const entity = addReward({
                    type: "thoughtTrigger",
                    support: selected.support,
                    context: "quietRoute",
                    routeNodeId: selected.support.routeNodeId,
                    overrides: { thoughtText: text }
                });
                if (entity) break;
            }
        }
    }

    return {
        version: 4,
        generatorId: "basic-rewards-v1",
        runId,
        treasureTarget: treasureChestTarget,
        contextualRewardTarget: rewardPlan.contextualRewardTarget,
        powerUpTarget: guaranteedPowerUpTarget,
        selectedPerchSupportIds,
        rewards,
        entities
    };
}

function generatedDecorationProtectionRegions({ traversal, endpoints, rewards, theme }) {
    if (!theme.decoration.protectGameplay) return [];
    const regions = [];
    const supportPaddingX = theme.decoration.supportPaddingX;
    const supportPaddingY = theme.decoration.supportPaddingY;
    for (const placement of traversal?.placements || []) {
        if (!placement || placement.layer === "caveForeground") continue;
        const x = finiteNumber(placement.x, 0);
        const y = finiteNumber(placement.y, 0);
        const w = Math.max(1, finiteNumber(placement.w, 1));
        const h = Math.max(1, finiteNumber(placement.h, 1));
        regions.push({
            id: `support:${placement.id || regions.length + 1}`,
            x: x - supportPaddingX,
            y: y - supportPaddingY,
            w: w + supportPaddingX * 2,
            h: h + supportPaddingY * 2,
            strict: false,
            allowAccent: true,
            normalOverlapRatio: 0,
            accentOverlapRatio: 0.08
        });
    }
    const strictEntityRegion = (entity, padding, prefix) => {
        const w = Math.max(24, finiteNumber(entity?.w, 96));
        const h = Math.max(24, finiteNumber(entity?.h, 96));
        const x = finiteNumber(entity?.x, 0) - w * 0.5;
        const y = finiteNumber(entity?.y, 0) - h;
        regions.push({
            id: `${prefix}:${entity?.id || regions.length + 1}`,
            x: x - padding,
            y: y - padding,
            w: w + padding * 2,
            h: h + padding * 2,
            strict: true,
            allowAccent: false
        });
    };
    for (const entity of endpoints?.entities || []) {
        strictEntityRegion(entity, theme.decoration.endpointPadding, "endpoint");
    }
    for (const entity of rewards?.entities || []) {
        strictEntityRegion(entity, theme.decoration.rewardPadding, "reward");
    }
    return regions;
}

function rotatedPlacementBounds(placement, scale = 1) {
    const authoredX = finiteNumber(placement?.x, 0);
    const authoredY = finiteNumber(placement?.y, 0);
    const authoredW = Math.max(0, finiteNumber(placement?.w, 0));
    const authoredH = Math.max(0, finiteNumber(placement?.h, 0));
    const normalizedScale = Math.max(0.1, finiteNumber(scale, 1));
    const w = authoredW * normalizedScale;
    const h = authoredH * normalizedScale;
    const x = authoredX + (authoredW - w) * 0.5;
    const y = authoredY + (authoredH - h) * 0.5;
    const rotation = finiteNumber(placement?.rotation, 0);
    const centerX = x + w * 0.5;
    const centerY = y + h * 0.5;
    const cosine = Math.abs(Math.cos(rotation));
    const sine = Math.abs(Math.sin(rotation));
    const extentX = cosine * w * 0.5 + sine * h * 0.5;
    const extentY = sine * w * 0.5 + cosine * h * 0.5;
    return { minX: centerX - extentX, minY: centerY - extentY, maxX: centerX + extentX, maxY: centerY + extentY };
}

function boundsOverlapRect(bounds, region) {
    return bounds.maxX > region.x
        && bounds.minX < region.x + region.w
        && bounds.maxY > region.y
        && bounds.minY < region.y + region.h;
}
function buildGeneratedPerimeterDecoration({
    implementations,
    theme,
    cavern,
    traversal,
    endpoints,
    rewards,
    decorationCatalog,
    seed,
    stageRevisions,
    runId,
    foregroundScale,
    requirePerimeter = false
}) {
    const enabled = theme.decoration.populatePerimeter && implementations.decoration === "perimeter-decoration-v1";
    if (!enabled) {
        return {
            version: 1,
            generatorId: implementations.decoration,
            runId,
            enabled: false,
            placementCount: 0,
            protectionRegionCount: 0,
            suppressedReason: theme.decoration.populatePerimeter ? "implementation-disabled" : "theme-suppressed",
            placements: []
        };
    }
    const catalog = decorationCatalog && typeof decorationCatalog === "object" ? decorationCatalog : null;
    if (!catalog || !["floor", "ceiling", "wall"].some((key) => Array.isArray(catalog[key]) && catalog[key].length)) {
        if (requirePerimeter) throw new Error("The selected theme requires a populated cave perimeter, but no perimeter decoration catalog is available.");
        return {
            version: 1,
            generatorId: implementations.decoration,
            runId,
            enabled: false,
            placementCount: 0,
            protectionRegionCount: 0,
            suppressedReason: "decoration-catalog-unavailable",
            placements: []
        };
    }
    const protectedRegions = generatedDecorationProtectionRegions({ traversal, endpoints, rewards, theme });
    const decorationSeed = hashGeneratorSeed(`${seed}:${generatorStageStreamName("decoration", stageRevisions)}:${runId}`) % 1000000;
    cavern.caveWindow.decoration = {
        ...cavern.caveWindow.decoration,
        seed: decorationSeed
    };
    const generatedPlacements = generateCavePerimeterPlacements({
        caveWindow: cavern.caveWindow,
        catalog,
        decoration: cavern.caveWindow.decoration,
        firstOrder: 30000,
        protectedRegions,
        idPrefix: `generated_cave_fg_${runId}`,
        foregroundScale,
        ownership: {
            generatedBy: AUTOMATIC_LEVEL_GENERATOR_ID,
            generationRunId: runId,
            generationStage: "decoration",
            generationRole: "cavePerimeter",
            decorationGenerator: CAVE_PERIMETER_GENERATOR
        }
    });
    const strictRegions = protectedRegions.filter((region) => region.strict);
    const placements = generatedPlacements.filter((placement) => {
        const bounds = rotatedPlacementBounds(placement, foregroundScale);
        return !strictRegions.some((region) => boundsOverlapRect(bounds, region));
    });
    return {
        version: 1,
        generatorId: implementations.decoration,
        runId,
        enabled: true,
        placementCount: placements.length,
        protectionRegionCount: protectedRegions.length,
        suppressedReason: "",
        placements
    };
}

function rectangleIntersectionArea(left, right) {
    const overlapX = Math.max(0, Math.min(left.maxX, right.maxX) - Math.max(left.minX, right.minX));
    const overlapY = Math.max(0, Math.min(left.maxY, right.maxY) - Math.max(left.minY, right.minY));
    return overlapX * overlapY;
}

export function validateGeneratedCavernPresentation(value = {}) {
    const cavern = value.cavern || {};
    const traversal = value.traversal || {};
    const endpoints = value.endpoints || {};
    const rewards = value.rewards || {};
    const decoration = value.decoration || {};
    const theme = normalizeGeneratorTheme(value.theme);
    const requirePerimeter = Boolean(value.requirePerimeter);
    const errors = [];
    const warnings = [];
    const placements = Array.isArray(decoration.placements) ? decoration.placements : [];
    const foregroundScale = Math.max(0.1, finiteNumber(value.foregroundScale, 1));
    const supportPlacements = Array.isArray(traversal.placements) ? traversal.placements : [];
    const strictRegions = generatedDecorationProtectionRegions({ traversal, endpoints, rewards, theme })
        .filter((region) => region.strict);
    const metrics = {
        perimeterRequired: Boolean(theme.decoration.populatePerimeter && requirePerimeter),
        perimeterEnabled: Boolean(decoration.enabled),
        perimeterPlacementCount: placements.length,
        strictForegroundOverlapCount: 0,
        touchedSupportCount: 0,
        maximumSupportForegroundCoverage: 0,
        minimumPlatformCeilingClearance: Infinity,
        minimumPlatformFloorClearance: Infinity,
        minimumPlatformWallClearance: Infinity,
        minimumEndpointSideClearance: Infinity,
        maximumDoorFloorError: 0,
        macroRoomCount: Array.isArray(cavern.rooms) ? cavern.rooms.length : 0,
        largestRoomWidthScreens: 0,
        largestRoomHeightScreens: 0
    };

    if (theme.decoration.populatePerimeter && requirePerimeter) {
        if (!decoration.enabled) errors.push(`The theme requires a populated perimeter, but decoration is disabled (${decoration.suppressedReason || "unknown reason"}).`);
        if (!placements.length) errors.push("The theme requires visible cave-wall foreground, but no perimeter placements were generated.");
    }

    for (const placement of placements) {
        const bounds = rotatedPlacementBounds(placement, foregroundScale);
        for (const region of strictRegions) {
            if (!boundsOverlapRect(bounds, region)) continue;
            metrics.strictForegroundOverlapCount += 1;
            errors.push(`Foreground placement “${placement.id || "unnamed"}” overlaps protected ${region.id}.`);
            break;
        }
    }

    for (const supportPlacement of supportPlacements) {
        const supportRect = {
            minX: finiteNumber(supportPlacement.x, 0),
            minY: finiteNumber(supportPlacement.y, 0),
            maxX: finiteNumber(supportPlacement.x, 0) + Math.max(1, finiteNumber(supportPlacement.w, 1)),
            maxY: finiteNumber(supportPlacement.y, 0) + Math.max(1, finiteNumber(supportPlacement.h, 1))
        };
        const supportArea = Math.max(1, (supportRect.maxX - supportRect.minX) * (supportRect.maxY - supportRect.minY));
        let overlapArea = 0;
        for (const placement of placements) overlapArea += rectangleIntersectionArea(supportRect, rotatedPlacementBounds(placement, foregroundScale));
        const coverage = Math.min(1, overlapArea / supportArea);
        if (coverage > 0.0001) metrics.touchedSupportCount += 1;
        metrics.maximumSupportForegroundCoverage = Math.max(metrics.maximumSupportForegroundCoverage, coverage);
        if (coverage > 0.1 + 1e-6) errors.push(`Foreground covers ${Math.round(coverage * 1000) / 10}% of platform “${supportPlacement.id || "unnamed"}”.`);
    }

    const stampBySupportId = new Map((cavern.stamps || []).map((stamp) => [stamp.sourceSupportId, stamp]));
    for (const support of traversal.supports || []) {
        const placement = supportPlacements.find((candidate) => candidate.id === support.placementId);
        const stamp = stampBySupportId.get(support.id);
        if (stamp) metrics.minimumPlatformWallClearance = Math.min(metrics.minimumPlatformWallClearance, stamp.rx - support.width * 0.5);
        const sampleXs = [support.walkableLeftX, support.centerX, support.walkableRightX]
            .filter(Number.isFinite);
        for (const x of sampleXs) {
            const vertical = cavernVerticalRangeAt(cavern, x, support.surfaceY);
            if (!vertical) {
                errors.push(`Platform “${support.id}” has no cave opening at x=${roundCoordinate(x)}.`);
                continue;
            }
            const platformBottom = placement
                ? finiteNumber(placement.y, support.surfaceY) + finiteNumber(placement.h, support.height)
                : support.surfaceY + support.height * (1 - support.surfaceYRatio);
            metrics.minimumPlatformCeilingClearance = Math.min(metrics.minimumPlatformCeilingClearance, support.surfaceY - vertical.top);
            metrics.minimumPlatformFloorClearance = Math.min(metrics.minimumPlatformFloorClearance, vertical.bottom - platformBottom);
        }
    }

    const wideUpperCavern = cavern.generatorId === "wide-upper-contour-cavern-v1";
    const tolerance = 42;
    if (metrics.minimumPlatformWallClearance < theme.cavern.platformWallClearanceX - 1) {
        errors.push(`A traversal platform has only ${roundCoordinate(metrics.minimumPlatformWallClearance)} units of horizontal cave-wall clearance.`);
    }
    if (metrics.minimumPlatformCeilingClearance < theme.cavern.platformCeilingClearance - tolerance) {
        errors.push(`A traversal platform has only ${roundCoordinate(metrics.minimumPlatformCeilingClearance)} units of ceiling clearance.`);
    }
    if (metrics.minimumPlatformFloorClearance < theme.cavern.platformFloorClearance - tolerance) {
        errors.push(`A traversal platform has only ${roundCoordinate(metrics.minimumPlatformFloorClearance)} units of floor clearance.`);
    }

    const bounds = cavern.bounds || {};
    for (const entity of endpoints.entities || []) {
        const floorY = finiteNumber(entity.y, 0);
        const endpoint = entity.portalRole === "entrance" ? endpoints.entrance : endpoints.exit;
        const support = (traversal.supports || []).find((candidate) => candidate.id === endpoint?.supportId);
        if (support) metrics.maximumDoorFloorError = Math.max(metrics.maximumDoorFloorError, Math.abs(floorY - support.surfaceY));
        if ([bounds.x, bounds.w].every(Number.isFinite)) {
            const sideClearance = Math.min(entity.x - bounds.x, bounds.x + bounds.w - entity.x);
            metrics.minimumEndpointSideClearance = Math.min(metrics.minimumEndpointSideClearance, sideClearance);
        }
    }
    if (metrics.minimumEndpointSideClearance < theme.cavern.endpointSideClearance - 20) {
        errors.push(`An endpoint door is only ${roundCoordinate(metrics.minimumEndpointSideClearance)} units from the dark cave boundary.`);
    }
    if (metrics.maximumDoorFloorError > 2) errors.push(`An endpoint doorway floats ${roundCoordinate(metrics.maximumDoorFloorError)} units above or below its support.`);

    for (const room of cavern.rooms || []) {
        metrics.largestRoomWidthScreens = Math.max(metrics.largestRoomWidthScreens, finiteNumber(room.widthScreens, 0));
        metrics.largestRoomHeightScreens = Math.max(metrics.largestRoomHeightScreens, finiteNumber(room.heightScreens, 0));
        const maximumRoomWidthScreens = wideUpperCavern ? 5.6 : 4.01;
        const maximumRoomHeightScreens = wideUpperCavern ? 2.4 : 3.01;
        if (room.widthScreens > maximumRoomWidthScreens || room.heightScreens > maximumRoomHeightScreens) {
            errors.push(`Macro room “${room.id}” exceeds the ${maximumRoomWidthScreens}×${maximumRoomHeightScreens}-screen design ceiling.`);
        }
    }
    if (!metrics.macroRoomCount) errors.push("The room-and-tunnel cavern contains no macro room.");
    if (metrics.largestRoomWidthScreens <= 1 && metrics.largestRoomHeightScreens <= 1) errors.push("The room-and-tunnel cavern never opens beyond a single screen.");

    for (const key of ["minimumPlatformCeilingClearance", "minimumPlatformFloorClearance", "minimumPlatformWallClearance", "minimumEndpointSideClearance"]) {
        if (!Number.isFinite(metrics[key])) metrics[key] = 0;
    }
    metrics.maximumSupportForegroundCoverage = Math.round(metrics.maximumSupportForegroundCoverage * 10000) / 10000;
    return { valid: errors.length === 0, qualityScore: Math.max(0, 100 - errors.length * 35 - warnings.length * 2), errors, warnings, metrics };
}

export function generateAutomaticLevelDraft(options = {}) {
    const theme = normalizeGeneratorTheme(options.theme);
    const implementations = normalizeGeneratorImplementations(options.implementations || theme.implementations);
    if (!["the-path74-contour-cavern-v4", "wide-upper-contour-cavern-v1"].includes(implementations.cavern)) throw new Error(`Unsupported cavern builder “${implementations.cavern}”.`);
    if (implementations.traversal !== "layered-safety-network-traversal-v6") throw new Error(`Unsupported traversal builder “${implementations.traversal}”.`);
    if (implementations.endpoints !== "grounded-chamber-endpoints-v2") throw new Error(`Unsupported endpoint placer “${implementations.endpoints}”.`);
    if (!["difficulty-budgeted-encounters-v1", "not-generated-yet"].includes(implementations.encounters)) throw new Error(`Unsupported encounter populator “${implementations.encounters}”.`);
    if (!["basic-rewards-v1", "not-generated-yet"].includes(implementations.rewards)) throw new Error(`Unsupported reward populator “${implementations.rewards}”.`);
    if (!["perimeter-decoration-v1", "suppressed-by-theme", "not-generated-yet"].includes(implementations.decoration)) throw new Error(`Unsupported decoration populator “${implementations.decoration}”.`);
    if (implementations.validation !== "the-path74-cavern-validation-v4") throw new Error(`Unsupported level validator “${implementations.validation}”.`);

    const assetCatalog = normalizeGenerationAssetCatalog(options.assetCatalog);
    if (!assetCatalog.assets.length) throw new Error("The generation platform catalog is empty.");
    for (const requiredRole of [
        "routeFloor",
        "landingPlatform",
        "doorSupport",
        "movingPlatform",
        "recoveryPlatform",
        ...(implementations.route === "mostly-horizontal-route-v1" ? ["runAndGunGround"] : [])
    ]) {
        if (!assetCatalog.assets.some((entry) => entry.roles.includes(requiredRole))) {
            throw new Error(`The generation platform catalog has no “${requiredRole}” asset.`);
        }
    }
    const enemyGenerationCatalog = normalizeEnemyGenerationCatalog(options.enemyGenerationCatalog);
    const enemyCatalog = normalizeEnemyCatalogDefinitions(options.enemyCatalog);
    const rewardGenerationCatalog = normalizeRewardGenerationCatalog(options.rewardGenerationCatalog);
    const entityCatalog = normalizeInteractiveEntityCatalog(options.entityCatalog);
    const decorationCatalog = options.decorationCatalog && typeof options.decorationCatalog === "object"
        ? options.decorationCatalog
        : null;
    if (implementations.encounters === "difficulty-budgeted-encounters-v1" && !enemyGenerationCatalog.enemies.length) {
        throw new Error("The enemy generation metadata catalog is empty.");
    }
    if (implementations.rewards === "basic-rewards-v1") {
        if (!rewardGenerationCatalog.rewards.length) throw new Error("The reward generation metadata catalog is empty.");
        for (const requiredType of ["treasureChest", "overdrivePickup", "shieldPickup", "randomWrenchPickup", "fuel", "thoughtTrigger"]) {
            if (!entityCatalog.has(requiredType)) throw new Error(`The interactive entity catalog is missing “${requiredType}”.`);
        }
    }

    const routeContext = collectAutomaticLevelRouteCandidates({ ...options, theme, implementations });
    if (!routeContext.candidates.length) throwNoRouteCandidate(routeContext);

    const completeCandidates = [];
    const geometryRejected = [];
    let geometryCandidatesTried = 0;
    for (const routeCandidate of routeContext.candidates) {
        geometryCandidatesTried += 1;
        const routeGeneration = buildAutomaticLevelRouteResult(routeContext, routeCandidate);
        try {
            const traversalRng = createNamedRandomStream(routeGeneration.seed, generatorStageStreamName("traversal", routeGeneration.stageRevisions), routeGeneration.attempt);
            const endpointRng = createNamedRandomStream(routeGeneration.seed, generatorStageStreamName("endpoints", routeGeneration.stageRevisions), routeGeneration.attempt);
            const rewardsRng = createNamedRandomStream(routeGeneration.seed, generatorStageStreamName("rewards", routeGeneration.stageRevisions), routeGeneration.attempt);
            const rewardPlan = planBasicRewards({
                route: routeGeneration.route,
                theme,
                settings: routeGeneration.settings,
                runId: routeGeneration.runId,
                implementationId: implementations.rewards
            });
            const traversal = buildStandardTraversal({
                route: routeGeneration.route,
                theme,
                settings: routeGeneration.settings,
                implementations,
                assetCatalog,
                rng: traversalRng,
                runId: routeGeneration.runId
            });
            const endpoints = buildSafeEndpoints({
                route: routeGeneration.route,
                traversal,
                theme,
                implementations,
                rng: endpointRng,
                runId: routeGeneration.runId,
                destinationLevel: String(options.destinationLevel || "")
            });
            const cavern = buildRoomAndTunnelCavern({
                route: routeGeneration.route,
                traversal,
                endpoints,
                theme,
                seed: routeGeneration.seed,
                runId: routeGeneration.runId,
                generatorId: implementations.cavern
            });
            const world = deriveGeneratedWorld(cavern, traversal, theme);
            const emptyCavernValidation = validatePlayableEmptyCavern({
                route: routeGeneration.route,
                traversal,
                endpoints,
                cavern,
                world,
                assetCatalog,
                settings: routeGeneration.settings,
                theme
            });
            if (!emptyCavernValidation.valid) throw new Error(emptyCavernValidation.errors.join(" "));
            const rewards = implementations.rewards === "basic-rewards-v1"
                ? buildBasicRewards({
                    route: routeGeneration.route,
                    traversal,
                    endpoints,
                    cavern,
                    theme,
                    settings: routeGeneration.settings,
                    rewardPlan,
                    rewardGenerationCatalog,
                    entityCatalog,
                    rng: rewardsRng,
                    runId: routeGeneration.runId
                })
                : emptyRewardPopulation(routeGeneration.runId, implementations.rewards, rewardPlan);
            const rewardReservations = buildGeneratedRewardEnemyReservations({
                rewards,
                rewardGenerationCatalog,
                entityCatalog
            });
            const encounters = implementations.encounters === "difficulty-budgeted-encounters-v1"
                ? buildDifficultyBudgetedEncounters({
                    route: routeGeneration.route,
                    traversal,
                    endpoints,
                    cavern,
                    theme,
                    settings: routeGeneration.settings,
                    resolvedEnemyIds: routeGeneration.resolvedEnemyIds,
                    enemyGenerationCatalog,
                    enemyCatalog,
                    rewardReservations,
                    rng: createNamedRandomStream(routeGeneration.seed, generatorStageStreamName("encounters", routeGeneration.stageRevisions), routeGeneration.attempt),
                    runId: routeGeneration.runId
                })
                : emptyEncounterPopulation(routeGeneration.runId, implementations.encounters);
            const encounterValidation = validateGeneratedEncounters({
                encounters,
                entities: encounters.entities,
                traversal,
                endpoints,
                cavern,
                theme,
                settings: routeGeneration.settings,
                resolvedEnemyIds: routeGeneration.resolvedEnemyIds,
                enemyGenerationCatalog,
                enemyCatalog
            });
            const rewardValidation = validateGeneratedRewards({
                rewards,
                entities: rewards.entities,
                traversal,
                endpoints,
                cavern,
                route: routeGeneration.route,
                encounters,
                endpointEntities: endpoints.entities,
                encounterEntities: encounters.entities,
                theme,
                settings: routeGeneration.settings,
                rewardGenerationCatalog,
                entityCatalog
            });
            const validation = combineGeneratorValidations(emptyCavernValidation, encounterValidation, rewardValidation);
            if (!validation.valid) throw new Error(validation.errors.join(" "));
            completeCandidates.push({ routeGeneration, traversal, endpoints, cavern, world, encounters, rewards, validation });
        } catch (error) {
            if (geometryRejected.length < 12) {
                geometryRejected.push({
                    attempt: routeCandidate.attempt,
                    reason: String(error?.message || error).slice(0, 360)
                });
            }
        }
        // Inspect a meaningful pool rather than accepting the first buildable graph.
        // Additional attempts are only needed when geometry candidates are scarce.
        if (geometryCandidatesTried >= 12 && completeCandidates.length >= 6) break;
    }

    if (!completeCandidates.length) {
        const detail = geometryRejected.slice(0, 4).map((item) => `Attempt ${item.attempt}: ${item.reason}`).join(" ");
        throw new Error(`No collision-safe cavern candidate was found after ${geometryCandidatesTried} route attempts.${detail ? ` ${detail}` : ""}`);
    }
    completeCandidates.sort((a, b) =>
        b.validation.qualityScore - a.validation.qualityScore
        || a.validation.warnings.length - b.validation.warnings.length
        || b.routeGeneration.route.validation.qualityScore - a.routeGeneration.route.validation.qualityScore
        || a.routeGeneration.attempt - b.routeGeneration.attempt
    );
    const selected = completeCandidates[0];
    const { routeGeneration, traversal, endpoints, cavern, world, encounters, rewards, validation } = selected;
    const layerVisuals = normalizeLevelLayerVisuals({
        version: 2,
        foreground: { brightness: 0.46 }
    });
    const decoration = buildGeneratedPerimeterDecoration({
        implementations,
        theme,
        cavern,
        traversal,
        endpoints,
        rewards,
        decorationCatalog,
        seed: routeGeneration.seed,
        stageRevisions: routeGeneration.stageRevisions,
        runId: routeGeneration.runId,
        foregroundScale: layerVisuals.foreground.scale,
        requirePerimeter: Boolean(options.requirePopulatedPerimeter) && implementations.validation === "the-path74-cavern-validation-v4"
    });
    const presentationValidation = validateGeneratedCavernPresentation({
        cavern,
        traversal,
        endpoints,
        rewards,
        decoration,
        theme,
        foregroundScale: layerVisuals.foreground.scale,
        requirePerimeter: Boolean(options.requirePopulatedPerimeter) && implementations.validation === "the-path74-cavern-validation-v4"
    });
    if (!presentationValidation.valid) {
        throw new Error(`Generated cavern presentation failed validation: ${presentationValidation.errors.join(" ")}`);
    }
    const finalValidation = {
        valid: validation.valid && presentationValidation.valid,
        qualityScore: Math.round((validation.qualityScore * 0.78 + presentationValidation.qualityScore * 0.22) * 10) / 10,
        errors: [...validation.errors, ...presentationValidation.errors],
        warnings: [...validation.warnings, ...presentationValidation.warnings],
        metrics: { ...validation.metrics, presentation: presentationValidation.metrics }
    };

    const generation = {
        ...routeGeneration,
        implementations,
        cavern,
        traversal: {
            ...traversal,
            placements: undefined
        },
        endpoints: {
            ...endpoints,
            entities: undefined
        },
        encounters: {
            ...encounters,
            entities: undefined
        },
        rewards: {
            ...rewards,
            entities: undefined
        },
        decoration: {
            ...decoration,
            placements: undefined
        },
        validation: finalValidation,
        diagnostics: {
            ...routeGeneration.diagnostics,
            geometryCandidatesTried,
            validGeometryCandidates: completeCandidates.length,
            rejectedGeometryCandidates: geometryCandidatesTried - completeCandidates.length,
            geometryRejected,
            geometry: {
                platformCount: traversal.placements.length,
                transitionCount: traversal.transitions.length,
                cavePointCount: cavern.caveWindow.points.length,
                recoveryPlatformCount: traversal.supports.filter((support) => support.role === "recoveryPlatform").length
            },
            encounters: {
                encounterCount: encounters.encounters.length,
                enemyCount: encounters.entities.length,
                hunterCount: encounters.entities.filter((entity) => entity.strategy === "hunter").length,
                bombingBatCount: encounters.entities.filter((entity) => entity.enemyCatalogId === "enemy_020").length,
                budget: encounters.budget,
                spentBudget: encounters.spentBudget
            },
            rewards: {
                selectedPerchCount: rewards.selectedPerchSupportIds.length,
                rewardCount: rewards.entities.length,
                chestCount: rewards.entities.filter((entity) => entity.type === "treasureChest").length,
                chestTarget: rewards.treasureTarget,
                powerUpCount: rewards.entities.filter((entity) => ["overdrivePickup", "shieldPickup", "randomWrenchPickup"].includes(entity.type)).length,
                powerUpTarget: rewards.powerUpTarget,
                thoughtCount: rewards.entities.filter((entity) => entity.type === "thoughtTrigger").length
            },
            decoration: {
                enabled: decoration.enabled,
                placementCount: decoration.placementCount,
                protectionRegionCount: decoration.protectionRegionCount,
                suppressedReason: decoration.suppressedReason,
                strictOverlapCount: presentationValidation.metrics.strictForegroundOverlapCount,
                touchedSupportCount: presentationValidation.metrics.touchedSupportCount,
                maximumSupportCoverage: presentationValidation.metrics.maximumSupportForegroundCoverage
            },
            macro: {
                patternId: cavern.macroPatternId,
                patternLabel: cavern.macroPatternLabel,
                roomCount: presentationValidation.metrics.macroRoomCount,
                largestRoomWidthScreens: presentationValidation.metrics.largestRoomWidthScreens,
                largestRoomHeightScreens: presentationValidation.metrics.largestRoomHeightScreens
            }
        }
    };
    const placements = [...traversal.placements, ...decoration.placements];
    return {
        generation,
        placements: placements.map((placement) => JSON.parse(JSON.stringify(placement))),
        entities: [...endpoints.entities, ...encounters.entities, ...rewards.entities].map((entity) => JSON.parse(JSON.stringify(entity))),
        layerVisuals: JSON.parse(JSON.stringify(layerVisuals)),
        caveWindow: JSON.parse(JSON.stringify(cavern.caveWindow)),
        world: JSON.parse(JSON.stringify(world)),
        requiredAtlasIds: [...new Set([
            ...placements.map((placement) => placement.atlasId),
            "it_atlas_001"
        ])].sort()
    };
}

function buildGeneratedRewardEnemyReservations({ rewards, rewardGenerationCatalog, entityCatalog }) {
    const metadataByType = new Map((rewardGenerationCatalog?.rewards || []).map((entry) => [entry.entityType, entry]));
    const powerUpDefinitions = (rewardGenerationCatalog?.rewards || [])
        .filter((entry) => entry.category === "powerUp")
        .map((entry) => entityCatalog.get(entry.entityType))
        .filter(Boolean);
    const powerUpWidth = Math.max(0, ...powerUpDefinitions.map((definition) => finiteNumber(definition?.defaultSize?.w, 0)));
    const powerUpHeight = Math.max(0, ...powerUpDefinitions.map((definition) => finiteNumber(definition?.defaultSize?.h, 0)));
    return (rewards?.entities || []).map((entity) => {
        const metadata = metadataByType.get(String(entity?.type || ""));
        if (!metadata || metadata.category === "narrative") return null;
        const definition = entityCatalog.get(String(entity?.type || ""));
        return {
            x: finiteNumber(entity?.x, 0),
            y: finiteNumber(entity?.y, 0),
            w: metadata.category === "powerUp" ? powerUpWidth : finiteNumber(definition?.defaultSize?.w, entity?.w),
            h: metadata.category === "powerUp" ? powerUpHeight : finiteNumber(definition?.defaultSize?.h, entity?.h)
        };
    }).filter(Boolean);
}

function generatedEnemyOverlapsRewardReservations(entity, reservations) {
    return (reservations || []).some((reservation) => {
        const horizontal = Math.abs(finiteNumber(entity?.x, 0) - finiteNumber(reservation?.x, 0));
        const vertical = Math.abs(finiteNumber(entity?.y, 0) - finiteNumber(reservation?.y, 0));
        return horizontal < (finiteNumber(entity?.w, 0) + finiteNumber(reservation?.w, 0)) * 0.55
            && vertical < Math.max(finiteNumber(entity?.h, 0), finiteNumber(reservation?.h, 0)) * 0.72;
    });
}

function emptyEncounterPopulation(runId, implementationId = "not-generated-yet") {
    return {
        version: 2,
        generatorId: String(implementationId || "not-generated-yet"),
        runId: String(runId || ""),
        budget: 0,
        spentBudget: 0,
        calmDistance: 0,
        minimumEncounterSpacing: 0,
        maximumEncounters: 0,
        monsterTarget: 0,
        horizontalSpan: 0,
        targetMonsterSpacing: GENERATED_MONSTER_SPACING_PX,
        encounters: [],
        entities: []
    };
}

function buildDifficultyBudgetedEncounters({
    route,
    traversal,
    endpoints,
    cavern,
    theme,
    settings,
    resolvedEnemyIds,
    enemyGenerationCatalog,
    enemyCatalog,
    rewardReservations = [],
    rng,
    runId
}) {
    const metadataById = new Map((enemyGenerationCatalog?.enemies || []).map((entry) => [entry.enemyId, entry]));
    const allowed = normalizeStringArray(resolvedEnemyIds).filter((enemyId) => metadataById.has(enemyId) && enemyCatalog.has(enemyId));
    const routeNodes = new Map((route?.nodes || []).map((node) => [node.id, node]));
    const routeEdgesById = new Map((route?.edges || []).map((edge) => [edge.id, edge]));
    const maxProgress = Math.max(1, ...[...routeNodes.values()].map((node) => finiteNumber(node.progress, 0)));
    const endpointX = [
        finiteNumber(endpoints?.entrance?.x, traversal?.supports?.find((support) => support.id === traversal?.startSupportId)?.centerX || 0),
        finiteNumber(endpoints?.exit?.x, traversal?.supports?.find((support) => support.id === traversal?.exitSupportId)?.centerX || 0)
    ];
    const horizontalSpan = generatedHorizontalRouteSpan(route);
    const monsterTarget = generatedMonsterTargetForRoute(route, settings, theme?.defaults?.enemyDensity);
    // Endpoint calm space protects the portal animation and immediate footing only.
    // Enemy awareness must not reserve entire screens of otherwise usable level space.
    const calmDistance = Math.max(theme.endpoints.calmDistance, theme.encounters.calmDistance);
    const targetMonsterSpacing = monsterTarget > 0
        ? Math.max(1, horizontalSpan / monsterTarget)
        : GENERATED_MONSTER_SPACING_PX;
    const spacing = clamp(
        targetMonsterSpacing * (0.46 + settings.safety * 0.1),
        180,
        theme.encounters.minimumEncounterSpacing
    );
    const encounterSupports = (traversal?.supports || []).filter((support) => (
        !support.moving
        && (support.routeNodeId || support.routeEdgeId)
        && ((support.mandatory && ["routeFloor", "landingPlatform", "recoveryPlatform", "runAndGunGround"].includes(support.role))
            || (support.secondaryPlatform && support.combatPerch))
    ));
    const maximumUnitCost = Math.max(1, ...allowed.map((enemyId) => finiteNumber(metadataById.get(enemyId)?.difficultyCost, 1)));
    const budget = monsterTarget > 0 ? Math.ceil(monsterTarget * maximumUnitCost) : 0;
    const maximumEncounters = monsterTarget;
    if (!allowed.length || !budget || !maximumEncounters) {
        return {
            ...emptyEncounterPopulation(runId, "difficulty-budgeted-encounters-v1"),
            budget,
            calmDistance: roundCoordinate(calmDistance),
            minimumEncounterSpacing: roundCoordinate(spacing),
            maximumEncounters,
            monsterTarget,
            horizontalSpan: roundCoordinate(horizontalSpan),
            targetMonsterSpacing: roundCoordinate(targetMonsterSpacing),
            allowedEnemyIds: allowed
        };
    }

    const rawCandidates = [];
    for (const support of encounterSupports) {
        const node = routeNodes.get(support.routeNodeId);
        const routeEdge = routeEdgesById.get(support.routeEdgeId);
        const fromNode = routeNodes.get(routeEdge?.from);
        const toNode = routeNodes.get(routeEdge?.to);
        const progressValue = node
            ? finiteNumber(node.progress, 0)
            : (finiteNumber(fromNode?.progress, 0) + finiteNumber(toNode?.progress, 0)) * 0.5;
        const progress = clamp01(progressValue / maxProgress);
        const seatCount = support.secondaryPlatform
            ? 1
            : Math.max(1, Math.ceil(
                finiteNumber(support.walkableWidth, 0)
                / Math.max(280, targetMonsterSpacing * 0.68)
            ));
        const walkableLeft = finiteNumber(support.walkableLeftX, support.centerX - support.walkableWidth * 0.5);
        const walkableRight = finiteNumber(support.walkableRightX, support.centerX + support.walkableWidth * 0.5);
        const inset = Math.min(190, Math.max(42, finiteNumber(support.walkableWidth, 0) * 0.18));
        const firstX = Math.min(walkableRight, walkableLeft + inset);
        const lastX = Math.max(walkableLeft, walkableRight - Math.max(42, inset * 0.62));
        for (let seatIndex = 0; seatIndex < seatCount; seatIndex += 1) {
            const seatX = seatCount <= 1
                ? clamp(finiteNumber(support.centerX, (walkableLeft + walkableRight) * 0.5), firstX, lastX)
                : firstX + (lastX - firstX) * seatIndex / (seatCount - 1);
            const vertical = cavernVerticalRangeAt(cavern, seatX, support.surfaceY);
            const headroom = vertical ? support.surfaceY - vertical.top : 0;
            const endpointDistance = Math.min(...endpointX.map((x) => Math.abs(seatX - x)));
            if (endpointDistance < calmDistance) continue;
            rawCandidates.push({
                support,
                progress,
                headroom,
                cavern,
                endpointDistance,
                seatX: roundCoordinate(seatX),
                seatIndex,
                tieBreaker: rng.float()
            });
        }
    }

    const candidates = [];
    const remainingCandidates = rng.shuffle(rawCandidates);
    const playableLeft = Math.min(...endpointX) + calmDistance;
    const playableRight = Math.max(...endpointX) - calmDistance;
    const desiredSlotCount = Math.max(1, monsterTarget);
    while (remainingCandidates.length) {
        let selectedThisPass = 0;
        for (const slotIndex of distributedSlotOrder(desiredSlotCount)) {
            if (!remainingCandidates.length) break;
            const desiredX = playableRight > playableLeft
                ? playableLeft + (playableRight - playableLeft) * (slotIndex + 0.5) / desiredSlotCount
                : (endpointX[0] + endpointX[1]) * 0.5;
            let bestIndex = 0;
            let bestScore = Infinity;
            for (let index = 0; index < remainingCandidates.length; index += 1) {
                const candidate = remainingCandidates[index];
                const combatPerchBonus = candidate.support.combatPerch ? targetMonsterSpacing * 0.18 : 0;
                const score = Math.abs(candidate.seatX - desiredX) - combatPerchBonus + candidate.tieBreaker * 0.001;
                if (score < bestScore) {
                    bestScore = score;
                    bestIndex = index;
                }
            }
            candidates.push(remainingCandidates.splice(bestIndex, 1)[0]);
            selectedThisPass += 1;
        }
        if (!selectedThisPass) break;
    }

    const endpointPriority = [];
    const prioritizedCandidates = new Set();
    const endpointFallbackCount = 6;
    const addEndpointFallbacks = (endpoint) => {
        const nearest = candidates
            .filter((candidate) => !prioritizedCandidates.has(candidate))
            .sort((left, right) => Math.abs(left.seatX - endpoint) - Math.abs(right.seatX - endpoint)
                || left.tieBreaker - right.tieBreaker)
            .slice(0, endpointFallbackCount);
        for (const candidate of nearest) {
            prioritizedCandidates.add(candidate);
            endpointPriority.push(candidate);
        }
    };
    addEndpointFallbacks(endpointX[0]);
    addEndpointFallbacks(endpointX[1]);
    const orderedCandidates = [
        ...endpointPriority,
        ...candidates.filter((candidate) => !prioritizedCandidates.has(candidate))
    ];

    const encounters = [];
    const entities = [];
    let spentBudget = 0;
    let lastEnemyId = "";
    let hunterPlaced = false;
    const hunterRequired = settings.enemyDensity >= theme.defaults.enemyDensity
        && settings.difficulty >= 0.34
        && allowed.some((enemyId) => metadataById.get(enemyId)?.requiresNavigation);
    for (const candidate of orderedCandidates) {
        if (encounters.length >= maximumEncounters || entities.length >= monsterTarget) break;
        if (spentBudget >= budget) break;
        if (encounters.some((encounter) => Math.abs(encounter.x - candidate.seatX) < spacing)) continue;
        const remaining = budget - spentBudget;
        const remainingMonsterTarget = monsterTarget - entities.length;
        const fitting = allowed.map((enemyId) => {
            const metadata = metadataById.get(enemyId);
            const definition = enemyCatalog.get(enemyId);
            const groupSize = encounterGroupSize(metadata, settings, remaining, remainingMonsterTarget, rng);
            const totalCost = metadata.difficultyCost * groupSize;
            if (groupSize < metadata.groupMin || totalCost > remaining + 0.001) return null;
            if (settings.difficulty < metadata.minDifficulty || settings.difficulty > metadata.maxDifficulty) return null;
            if (candidate.progress < metadata.preferredProgressMin || candidate.progress > metadata.preferredProgressMax) return null;
            if (!supportFitsEnemyEncounter(candidate, metadata, definition, theme)) return null;
            let weight = metadata.weight;
            weight *= 0.82 + candidate.progress * 0.36;
            if (metadata.placementClass === "groundMelee") weight *= 1.18 - candidate.progress * 0.22;
            if (metadata.placementClass === "groundRanged") weight *= 0.65 + candidate.progress * 0.7;
            if (metadata.placementClass === "flyingBomber") weight *= 0.72 + settings.enemyDensity * 0.75;
            if (enemyId === lastEnemyId) weight *= 0.36;
            return { enemyId, metadata, definition, groupSize, totalCost, weight };
        }).filter(Boolean);
        const hunterChoices = fitting.filter((entry) => entry.metadata.requiresNavigation);
        const selected = hunterRequired && !hunterPlaced && candidate.progress >= 0.24 && hunterChoices.length
            ? weightedRandomChoice(hunterChoices, rng)
            : weightedRandomChoice(fitting, rng);
        if (!selected) continue;
        const encounterId = `encounter_${String(encounters.length + 1).padStart(3, "0")}`;
        const built = instantiateGeneratedEncounter({
            encounterId,
            candidate,
            selected,
            theme,
            supports: traversal?.supports || [],
            rng,
            runId
        });
        if (!built.entities.length) continue;
        if (built.entities.some((entity) => endpointX.some((x) => Math.abs(finiteNumber(entity?.x, 0) - x) < calmDistance))) continue;
        if (built.entities.some((entity) => generatedEnemyOverlapsRewardReservations(entity, rewardReservations))) continue;
        if (encounters.some((encounter) => Math.abs(encounter.x - built.encounter.x) < spacing)) continue;
        const overlapsExistingEnemy = built.entities.some((entity) => entities.some((existing) => (
            Math.abs(finiteNumber(entity.x, 0) - finiteNumber(existing.x, 0)) < (finiteNumber(entity.w, 0) + finiteNumber(existing.w, 0)) * 0.62
            && Math.abs(finiteNumber(entity.y, 0) - finiteNumber(existing.y, 0)) < Math.max(finiteNumber(entity.h, 0), finiteNumber(existing.h, 0)) * 0.65
        )));
        if (overlapsExistingEnemy) continue;
        encounters.push(built.encounter);
        entities.push(...built.entities);
        spentBudget += selected.totalCost;
        lastEnemyId = selected.enemyId;
        if (selected.metadata.requiresNavigation) hunterPlaced = true;
    }

    return {
        version: 2,
        generatorId: "difficulty-budgeted-encounters-v1",
        runId,
        budget,
        spentBudget: roundCoordinate(spentBudget),
        calmDistance: roundCoordinate(calmDistance),
        minimumEncounterSpacing: roundCoordinate(spacing),
        maximumEncounters,
        monsterTarget,
        horizontalSpan: roundCoordinate(horizontalSpan),
        targetMonsterSpacing: roundCoordinate(targetMonsterSpacing),
        allowedEnemyIds: allowed,
        encounters,
        entities
    };
}

function encounterGroupSize(metadata, settings, remainingBudget, remainingMonsterTarget, rng) {
    const affordableMax = Math.floor((remainingBudget + 1e-6) / metadata.difficultyCost);
    const maximum = Math.min(metadata.groupMax, affordableMax, Math.max(0, remainingMonsterTarget));
    if (maximum < metadata.groupMin) return 0;
    if (metadata.placementClass === "flyingBomber") {
        return maximum >= 3 && rng.chance(0.28 + settings.difficulty * 0.42) ? 3 : 2;
    }
    return maximum > metadata.groupMin && rng.chance(settings.enemyDensity * 0.35)
        ? rng.int(metadata.groupMin, maximum)
        : metadata.groupMin;
}

function supportFitsEnemyEncounter(candidate, metadata, definition, theme) {
    const support = candidate.support;
    const bodyWidth = definition.defaultSize.w;
    const bodyHeight = definition.defaultSize.h;
    if (support.walkableWidth < metadata.minWalkableWidth) return false;
    if (metadata.placementClass === "flyingBomber") {
        const requiredHeadroom = Math.max(metadata.headroom, metadata.spawnHeightMin + bodyHeight + theme.encounters.spawnSafetyBuffer * 0.35);
        return candidate.headroom >= requiredHeadroom;
    }
    const requiredWidth = Math.max(
        metadata.minWalkableWidth,
        bodyWidth + metadata.edgeClearance * 2 + Math.max(metadata.landingBuffer, theme.encounters.landingBuffer)
    );
    return support.walkableWidth >= requiredWidth
        && candidate.headroom >= Math.max(metadata.headroom, bodyHeight + 36);
}

function weightedRandomChoice(values, rng) {
    if (!values.length) return null;
    const total = values.reduce((sum, value) => sum + Math.max(0, value.weight), 0);
    if (total <= 0) return values[0];
    let cursor = rng.range(0, total);
    for (const value of values) {
        cursor -= Math.max(0, value.weight);
        if (cursor <= 0) return value;
    }
    return values.at(-1);
}

function instantiateGeneratedEncounter({ encounterId, candidate, selected, theme, supports, rng, runId }) {
    const { support, progress, headroom, seatX } = candidate;
    const { enemyId, metadata, definition, groupSize, totalCost } = selected;
    const entities = metadata.placementClass === "flyingBomber"
        ? instantiateFlyingEnemyGroup({ encounterId, support, supports, cavern: candidate.cavern, headroom, preferredX: seatX, enemyId, metadata, definition, groupSize, rng, runId })
        : instantiateGroundEnemyGroup({ encounterId, support, supports, preferredX: seatX, enemyId, metadata, definition, groupSize, theme, rng, runId });
    return {
        encounter: {
            id: encounterId,
            supportId: support.id,
            routeNodeId: support.routeNodeId,
            enemyId,
            placementClass: metadata.placementClass,
            groupSize: entities.length,
            difficultyCost: roundCoordinate(totalCost),
            x: roundCoordinate(average(entities.map((entity) => entity.x))),
            y: roundCoordinate(average(entities.map((entity) => entity.y))),
            progress: roundCoordinate(progress),
            entityIds: entities.map((entity) => entity.id)
        },
        entities
    };
}

function baseGeneratedEnemyEntity({ id, encounterId, support, enemyId, metadata, definition, runId }) {
    return {
        id,
        type: "characterEnemy",
        enemyCatalogId: enemyId,
        characterId: definition.characterId,
        w: definition.defaultSize.w,
        h: definition.defaultSize.h,
        health: 60,
        ...JSON.parse(JSON.stringify(definition.defaults || {})),
        generatedBy: AUTOMATIC_LEVEL_GENERATOR_ID,
        generationRunId: runId,
        generationStage: "encounters",
        generationRole: metadata.placementClass,
        generationEncounterId: encounterId,
        generationSupportId: support.id,
        generationDifficultyCost: metadata.difficultyCost,
        notes: `Generated ${definition.label} encounter on ${support.id}. ${metadata.notes || definition.description}`.trim()
    };
}

const GENERATED_ENEMY_PLATFORM_SIDE_CLEARANCE = 18;
const GENERATED_ENEMY_PLATFORM_VERTICAL_CLEARANCE = 14;

function generatedSupportVisualRect(support, horizontalPadding = 0, verticalPadding = 0) {
    return {
        left: finiteNumber(support?.centerX, 0) - finiteNumber(support?.width, 0) * 0.5 - horizontalPadding,
        right: finiteNumber(support?.centerX, 0) + finiteNumber(support?.width, 0) * 0.5 + horizontalPadding,
        top: finiteNumber(support?.surfaceY, 0) - finiteNumber(support?.height, 0) * finiteNumber(support?.surfaceYRatio, 0) - verticalPadding,
        bottom: finiteNumber(support?.surfaceY, 0) + finiteNumber(support?.height, 0) * (1 - finiteNumber(support?.surfaceYRatio, 0)) + verticalPadding
    };
}

function rectanglesOverlapWithArea(first, second, epsilon = 0.01) {
    return Math.min(first.right, second.right) - Math.max(first.left, second.left) > epsilon
        && Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top) > epsilon;
}

function generatedBlockableSupportRect(support) {
    const visual = generatedSupportVisualRect(support);
    return {
        left: visual.left,
        right: visual.right,
        top: finiteNumber(support?.surfaceY, visual.top),
        bottom: visual.bottom
    };
}

export function generatedMovingPlatformRiderEnvelope(support, movement = {}) {
    const endOffsetX = finiteNumber(movement?.endOffsetX, 0);
    const endOffsetY = finiteNumber(movement?.endOffsetY, 0);
    const startLeft = finiteNumber(support?.centerX, 0) - finiteNumber(support?.width, 0) * 0.5;
    const startRight = finiteNumber(support?.centerX, 0) + finiteNumber(support?.width, 0) * 0.5;
    const startSurfaceY = finiteNumber(support?.surfaceY, 0);
    const platformDepth = finiteNumber(support?.height, 0) * (1 - finiteNumber(support?.surfaceYRatio, 0));
    const sideAllowance = GENERATED_PLAYER_BODY_WIDTH * 0.5;
    return {
        left: roundCoordinate(Math.min(startLeft, startLeft + endOffsetX) - sideAllowance),
        right: roundCoordinate(Math.max(startRight, startRight + endOffsetX) + sideAllowance),
        top: roundCoordinate(Math.min(startSurfaceY, startSurfaceY + endOffsetY) - GENERATED_MOVING_PLATFORM_RIDER_CLEARANCE),
        bottom: roundCoordinate(Math.max(startSurfaceY, startSurfaceY + endOffsetY) + platformDepth)
    };
}

function generatedMovingPlatformVisualSweepRect(support, movement = {}) {
    const start = generatedSupportVisualRect(support);
    const endOffsetX = finiteNumber(movement?.endOffsetX, 0);
    const endOffsetY = finiteNumber(movement?.endOffsetY, 0);
    return {
        left: Math.min(start.left, start.left + endOffsetX),
        right: Math.max(start.right, start.right + endOffsetX),
        top: Math.min(start.top, start.top + endOffsetY),
        bottom: Math.max(start.bottom, start.bottom + endOffsetY)
    };
}

export function generatedMovingPlatformCrushHazards({ support, movement = {}, supports = [] } = {}) {
    if (!support) return [];
    const envelope = generatedMovingPlatformRiderEnvelope(support, movement);
    return supports.filter((other) => other
        && other.id !== support.id
        && !other.moving
        && other.collisionMode !== "oneWay"
        && rectanglesOverlapWithArea(envelope, generatedBlockableSupportRect(other), 1));
}

function generatedGroundEnemyBodyRect(x, y, definition) {
    return {
        left: finiteNumber(x, 0) - finiteNumber(definition?.defaultSize?.w, 0) * 0.5,
        right: finiteNumber(x, 0) + finiteNumber(definition?.defaultSize?.w, 0) * 0.5,
        top: finiteNumber(y, 0) - finiteNumber(definition?.defaultSize?.h, 0),
        // Keep the feet out of the test so overlapping same-height floor pieces
        // remain a valid continuous surface.
        bottom: finiteNumber(y, 0) - 3
    };
}

function generatedGroundEnemyClearsPlatforms({ x, y, definition, assignedSupport, supports }) {
    const body = generatedGroundEnemyBodyRect(x, y, definition);
    for (const other of supports || []) {
        if (!other || other.id === assignedSupport?.id) continue;
        // Overlapping blockable pieces at the same standing height form one floor.
        if (Math.abs(finiteNumber(other.surfaceY, 0) - finiteNumber(y, 0)) <= 2) continue;
        const platform = generatedSupportVisualRect(
            other,
            GENERATED_ENEMY_PLATFORM_SIDE_CLEARANCE,
            GENERATED_ENEMY_PLATFORM_VERTICAL_CLEARANCE
        );
        if (rectanglesOverlapWithArea(body, platform)) return false;
        const shaft = other?.strictShaftClearance ? other.movementShaft : null;
        if (shaft && rectanglesOverlapWithArea(body, shaft)) return false;
    }
    return true;
}

function instantiateGroundEnemyGroup({ encounterId, support, supports, preferredX, enemyId, metadata, definition, groupSize, theme, rng, runId }) {
    const bodyWidth = definition.defaultSize.w;
    const landingBuffer = Math.max(metadata.landingBuffer, theme.encounters.landingBuffer);
    const left = support.walkableLeftX + metadata.edgeClearance + landingBuffer;
    const right = support.walkableRightX - metadata.edgeClearance;
    const available = Math.max(0, right - left);
    if (available < bodyWidth) return [];
    const spacing = groupSize > 1 ? Math.min(metadata.minGroupSpacing, Math.max(bodyWidth * 0.9, available / Math.max(1, groupSize - 1))) : 0;
    const groupWidth = bodyWidth + spacing * Math.max(0, groupSize - 1);
    const minimumCenter = left + groupWidth * 0.5;
    const maximumCenter = right - groupWidth * 0.5;
    if (maximumCenter < minimumCenter - 0.01) return [];

    const preferredCenter = clamp(finiteNumber(preferredX, maximumCenter), minimumCenter, maximumCenter);
    const centerCandidates = [preferredCenter];
    const candidateSteps = 14;
    for (let index = 0; index <= candidateSteps; index += 1) {
        centerCandidates.push(minimumCenter + (maximumCenter - minimumCenter) * index / candidateSteps);
    }
    const uniqueCenters = [...new Set(centerCandidates.map((value) => roundCoordinate(value)))];
    let selectedPositions = null;
    for (const center of uniqueCenters) {
        const positions = [];
        let clear = true;
        for (let index = 0; index < groupSize; index += 1) {
            const offset = groupSize > 1 ? (index - (groupSize - 1) * 0.5) * spacing : 0;
            const x = center + offset;
            if (!generatedGroundEnemyClearsPlatforms({
                x,
                y: support.surfaceY,
                definition,
                assignedSupport: support,
                supports
            })) {
                clear = false;
                break;
            }
            positions.push(roundCoordinate(x));
        }
        if (clear) {
            selectedPositions = positions;
            break;
        }
    }
    if (!selectedPositions) return [];

    const entities = [];
    for (let index = 0; index < groupSize; index += 1) {
        const entity = baseGeneratedEnemyEntity({
            id: `${encounterId}_${enemyId}_${String(index + 1).padStart(2, "0")}`,
            encounterId,
            support,
            enemyId,
            metadata,
            definition,
            runId
        });
        const patrolCapacity = Math.max(0, support.walkableWidth - metadata.edgeClearance * 2 - bodyWidth);
        entity.x = selectedPositions[index];
        entity.y = roundCoordinate(support.surfaceY);
        entity.facing = -1;
        entity.patrolDistance = roundCoordinate(Math.min(
            finiteNumber(definition.defaults?.patrolDistance, metadata.patrolRoom),
            patrolCapacity
        ));
        entity.groundSnapDistance = Math.max(finiteNumber(entity.groundSnapDistance, 96), 96);
        entities.push(entity);
    }
    return entities;
}

function generatedFlyingEnemyBodyRect(x, y, definition) {
    return {
        left: finiteNumber(x, 0) - finiteNumber(definition?.defaultSize?.w, 0) * 0.5,
        right: finiteNumber(x, 0) + finiteNumber(definition?.defaultSize?.w, 0) * 0.5,
        top: finiteNumber(y, 0) - finiteNumber(definition?.defaultSize?.h, 0),
        bottom: finiteNumber(y, 0)
    };
}

function generatedFlyingEnemyClearsPlatforms({ x, y, definition, supports }) {
    const body = generatedFlyingEnemyBodyRect(x, y, definition);
    for (const support of supports || []) {
        if (!support) continue;
        const platform = generatedSupportVisualRect(
            support,
            GENERATED_ENEMY_PLATFORM_SIDE_CLEARANCE,
            GENERATED_ENEMY_PLATFORM_VERTICAL_CLEARANCE
        );
        if (rectanglesOverlapWithArea(body, platform)) return false;
        const shaft = support?.strictShaftClearance ? support.movementShaft : null;
        if (shaft && rectanglesOverlapWithArea(body, shaft)) return false;
    }
    return true;
}

function generatedFlyingEnemyFitsCavern({ x, y, definition, cavern }) {
    const range = cavernVerticalRangeAt(cavern, x, y);
    if (!range) return false;
    const body = generatedFlyingEnemyBodyRect(x, y, definition);
    return body.top >= range.top + 12 && body.bottom <= range.bottom - 12;
}

function instantiateFlyingEnemyGroup({ encounterId, support, supports, cavern, headroom, preferredX, enemyId, metadata, definition, groupSize, rng, runId }) {
    const bodyHeight = definition.defaultSize.h;
    const bodyWidth = definition.defaultSize.w;
    const spacing = Math.max(metadata.minGroupSpacing, Math.min(104, bodyWidth * 1.45));
    const maximumHeight = Math.min(metadata.spawnHeightMax, headroom - bodyHeight - 72);
    const desiredHeight = clamp(
        metadata.spawnHeightMin + (metadata.spawnHeightMax - metadata.spawnHeightMin) * rng.range(0.35, 0.8),
        metadata.spawnHeightMin,
        maximumHeight
    );
    if (!Number.isFinite(desiredHeight) || desiredHeight < metadata.spawnHeightMin - 0.01) return [];

    const groupWidth = bodyWidth + spacing * Math.max(0, groupSize - 1);
    const centerRoom = Math.max(0, support.walkableWidth - groupWidth - metadata.edgeClearance * 2);
    const preferredCenter = clamp(finiteNumber(preferredX, support.centerX), support.centerX - centerRoom * 0.5, support.centerX + centerRoom * 0.5);
    const centerCandidates = [preferredCenter];
    for (const factor of rng.shuffle([-0.5, 0.5, -0.25, 0.25, -0.75, 0.75])) {
        centerCandidates.push(preferredCenter + factor * centerRoom);
    }
    const heightCandidates = [desiredHeight];
    const heightRange = Math.max(0, maximumHeight - metadata.spawnHeightMin);
    for (const factor of rng.shuffle([0, 1, 0.25, 0.5, 0.75])) {
        heightCandidates.push(metadata.spawnHeightMin + heightRange * factor);
    }

    let selectedPositions = null;
    for (const height of heightCandidates) {
        for (const centerX of centerCandidates) {
            const positions = [];
            let clear = true;
            for (let index = 0; index < groupSize; index += 1) {
                const offset = (index - (groupSize - 1) * 0.5) * spacing;
                const x = roundCoordinate(centerX + offset);
                const y = roundCoordinate(support.surfaceY - height + (index % 2 ? 10 : -10));
                if (!generatedFlyingEnemyClearsPlatforms({ x, y, definition, supports })
                    || !generatedFlyingEnemyFitsCavern({ x, y, definition, cavern })) {
                    clear = false;
                    break;
                }
                positions.push({ x, y });
            }
            if (clear) {
                selectedPositions = positions;
                break;
            }
        }
        if (selectedPositions) break;
    }
    if (!selectedPositions) return [];

    const entities = [];
    for (let index = 0; index < groupSize; index += 1) {
        const entity = baseGeneratedEnemyEntity({
            id: `${encounterId}_${enemyId}_${String(index + 1).padStart(2, "0")}`,
            encounterId,
            support,
            enemyId,
            metadata,
            definition,
            runId
        });
        entity.x = selectedPositions[index].x;
        entity.y = selectedPositions[index].y;
        entity.facing = index % 2 ? 1 : -1;
        entity.patrolDistance = roundCoordinate(Math.max(finiteNumber(entity.patrolDistance, 120), spacing * Math.max(1, groupSize - 1) + 80));
        entity.bomberInitialDelay = roundCoordinate(finiteNumber(entity.bomberInitialDelay, 0.5) + index * 0.22);
        entity.flightPhaseOffset = roundCoordinate(index / Math.max(1, groupSize));
        entities.push(entity);
    }
    return entities;
}

function cavernPolygonVerticalRanges(points, x) {
    if (!Array.isArray(points) || points.length < 3) return [];
    const intersections = [];
    for (let index = 0; index < points.length; index += 1) {
        const a = points[index];
        const b = points[(index + 1) % points.length];
        if (Math.abs(b.x - a.x) <= 0.000001) continue;
        const minimumX = Math.min(a.x, b.x);
        const maximumX = Math.max(a.x, b.x);
        if (x < minimumX || x >= maximumX) continue;
        const t = (x - a.x) / (b.x - a.x);
        intersections.push(lerp(a.y, b.y, t));
    }
    intersections.sort((a, b) => a - b);
    const ranges = [];
    for (let index = 1; index < intersections.length; index += 2) {
        ranges.push({ top: intersections[index - 1], bottom: intersections[index] });
    }
    return ranges;
}

function cavernVerticalRangeAt(cavern, x, preferredY = NaN) {
    const ranges = cavernPolygonVerticalRanges(cavern?.caveWindow?.points, x);
    if (!ranges.length) return null;
    if (Number.isFinite(preferredY)) {
        const containing = ranges.find((range) => preferredY >= range.top - 0.001 && preferredY <= range.bottom + 0.001);
        if (containing) return containing;
        return [...ranges].sort((a, b) => Math.min(Math.abs(preferredY - a.top), Math.abs(preferredY - a.bottom)) - Math.min(Math.abs(preferredY - b.top), Math.abs(preferredY - b.bottom)))[0];
    }
    return [...ranges].sort((a, b) => (b.bottom - b.top) - (a.bottom - a.top))[0];
}

export function validateGeneratedEncounters(value = {}) {
    const encounters = value.encounters && typeof value.encounters === "object" ? value.encounters : emptyEncounterPopulation("", "not-generated-yet");
    const entities = Array.isArray(value.entities) ? value.entities : [];
    const traversal = value.traversal || {};
    const endpoints = value.endpoints || {};
    const cavern = value.cavern || {};
    const theme = normalizeGeneratorTheme(value.theme);
    const settings = normalizeGeneratorSettings(value.settings, theme.defaults);
    const enemyGenerationCatalog = normalizeEnemyGenerationCatalog(value.enemyGenerationCatalog);
    const enemyCatalog = normalizeEnemyCatalogDefinitions(value.enemyCatalog);
    const resolved = new Set(normalizeStringArray(value.resolvedEnemyIds));
    const metadataById = new Map(enemyGenerationCatalog.enemies.map((entry) => [entry.enemyId, entry]));
    const supports = new Map((traversal.supports || []).map((support) => [support.id, support]));
    const errors = [];
    const warnings = [];
    const metrics = {
        encounterCount: Array.isArray(encounters.encounters) ? encounters.encounters.length : 0,
        enemyCount: entities.length,
        groundEnemyCount: 0,
        flyingEnemyCount: 0,
        hunterCount: 0,
        bombingBatCount: 0,
        bombingBatGroups: 0,
        minimumEndpointDistance: Infinity,
        minimumEncounterSpacing: Infinity,
        budget: Math.max(0, finiteNumber(encounters.budget, 0)),
        spentBudget: Math.max(0, finiteNumber(encounters.spentBudget, 0)),
        monsterTarget: Math.max(0, Math.floor(finiteNumber(encounters.monsterTarget, 0))),
        horizontalSpan: Math.max(0, finiteNumber(encounters.horizontalSpan, 0)),
        targetMonsterSpacing: Math.max(0, finiteNumber(encounters.targetMonsterSpacing, GENERATED_MONSTER_SPACING_PX)),
        invalidSpawnCount: 0,
        platformEnemyIntrusionCount: 0,
        movingShaftEnemyIntrusionCount: 0,
        upperGroundEnemyCount: 0,
        unreachableUpperGroundEnemyCount: 0
    };
    const entityIds = new Set();
    const byEncounter = groupBy(entities, (entity) => String(entity.generationEncounterId || ""));
    const entranceX = finiteNumber(endpoints?.entrance?.x, supports.get(traversal.startSupportId)?.centerX || 0);
    const exitX = finiteNumber(endpoints?.exit?.x, supports.get(traversal.exitSupportId)?.centerX || 0);
    const calmDistance = Math.max(0, finiteNumber(encounters.calmDistance, theme.encounters.calmDistance));

    for (const entity of entities) {
        if (!entity?.id || entityIds.has(entity.id)) errors.push(`Duplicate or missing generated enemy ID “${entity?.id || "unnamed"}”.`);
        entityIds.add(entity?.id);
        const enemyId = String(entity?.enemyCatalogId || "");
        const metadata = metadataById.get(enemyId);
        const definition = enemyCatalog.get(enemyId);
        const support = supports.get(entity?.generationSupportId);
        if (!hasGenerationStageProvenance(entity, "encounters")) errors.push(`Enemy “${entity?.id}” is missing encounter-generation provenance.`);
        else if (entity?.manualizedFromGeneration) warnings.push(`Enemy “${entity.id}” is a manual replacement for generated encounter content.`);
        if (!resolved.has(enemyId)) errors.push(`Enemy “${entity?.id}” was not allowed by the resolved enemy filter.`);
        if (!metadata || !definition) errors.push(`Enemy “${entity?.id}” lacks generation metadata or a catalog definition.`);
        if (!support) errors.push(`Enemy “${entity?.id}” references missing support “${entity?.generationSupportId || "unknown"}”.`);
        if (!metadata || !definition || !support) continue;
        const endpointDistance = Math.min(Math.abs(entity.x - entranceX), Math.abs(entity.x - exitX));
        metrics.minimumEndpointDistance = Math.min(metrics.minimumEndpointDistance, endpointDistance);
        if (endpointDistance < calmDistance - 0.01) errors.push(`Enemy “${entity.id}” violates the ${roundCoordinate(calmDistance)}-unit calm endpoint zone.`);
        const vertical = cavernVerticalRangeAt(cavern, entity.x, entity.y);
        const top = entity.y - definition.defaultSize.h;
        if (!vertical || top < vertical.top + 20 || entity.y > vertical.bottom + 1) {
            metrics.invalidSpawnCount += 1;
            errors.push(`Enemy “${entity.id}” does not fit inside the generated cave opening.`);
        }
        if (metadata.placementClass === "flyingBomber") {
            metrics.flyingEnemyCount += 1;
            metrics.bombingBatCount += enemyId === "enemy_020" ? 1 : 0;
            if (entity.y >= support.surfaceY - 60) errors.push(`Flying enemy “${entity.id}” is too close to its route support.`);
        } else {
            metrics.groundEnemyCount += 1;
            if (support.secondaryPlatform) {
                metrics.upperGroundEnemyCount += 1;
                const parentId = String(support.parentSupportId || "");
                const hasReachableParentTransition = (traversal.transitions || []).some((transition) => (
                    transition.valid
                    && ((transition.fromSupportId === parentId && transition.toSupportId === support.id)
                        || (transition.fromSupportId === support.id && transition.toSupportId === parentId))
                ));
                const mobileHunter = String(entity.strategy || "") === "hunter"
                    && finiteNumber(entity.jumpHeight, 0) > 0
                    && metadata.requiresNavigation;
                if (!hasReachableParentTransition || !mobileHunter) {
                    metrics.unreachableUpperGroundEnemyCount += 1;
                    errors.push(`Ground enemy “${entity.id}” is stranded on upper support “${support.id}”.`);
                }
            }
            if (Math.abs(entity.y - support.surfaceY) > 2) errors.push(`Ground enemy “${entity.id}” is not seated on its assigned support.`);
            const halfWidth = definition.defaultSize.w * 0.5;
            const leftLimit = support.walkableLeftX + metadata.edgeClearance;
            const rightLimit = support.walkableRightX - metadata.edgeClearance;
            if (entity.x - halfWidth < leftLimit - 0.01 || entity.x + halfWidth > rightLimit + 0.01) errors.push(`Ground enemy “${entity.id}” does not have the required authored walkable-edge clearance.`);
            if (entity.x - halfWidth < support.walkableLeftX + Math.max(metadata.landingBuffer, theme.encounters.landingBuffer) - 0.01) errors.push(`Ground enemy “${entity.id}” intrudes into the protected incoming landing area.`);
        }
        const entityRect = {
            left: entity.x - definition.defaultSize.w * 0.5,
            right: entity.x + definition.defaultSize.w * 0.5,
            top: entity.y - definition.defaultSize.h,
            bottom: entity.y
        };
        const clearOfPlatforms = metadata.placementClass === "flyingBomber"
            ? generatedFlyingEnemyClearsPlatforms({
                x: entity.x,
                y: entity.y,
                definition,
                supports: [...supports.values()]
            })
            : generatedGroundEnemyClearsPlatforms({
                x: entity.x,
                y: entity.y,
                definition,
                assignedSupport: support,
                supports: [...supports.values()]
            });
        if (!clearOfPlatforms) {
            metrics.platformEnemyIntrusionCount += 1;
            errors.push(`Enemy “${entity.id}” is glued to or embedded in generated platform artwork.`);
        }
        for (const moving of supports.values()) {
            const shaft = moving?.strictShaftClearance ? moving.movementShaft : null;
            if (!shaft) continue;
            if (Math.min(shaft.right, entityRect.right) - Math.max(shaft.left, entityRect.left) > 1
                && Math.min(shaft.bottom, entityRect.bottom) - Math.max(shaft.top, entityRect.top) > 1) {
                metrics.movingShaftEnemyIntrusionCount += 1;
                errors.push(`Enemy “${entity.id}” occupies moving-platform shaft “${moving.id}”.`);
            }
        }
        if (String(entity.strategy || "") === "hunter") metrics.hunterCount += 1;
    }

    const encounterRecords = Array.isArray(encounters.encounters) ? encounters.encounters : [];
    for (let first = 0; first < encounterRecords.length; first += 1) {
        for (let second = first + 1; second < encounterRecords.length; second += 1) {
            metrics.minimumEncounterSpacing = Math.min(metrics.minimumEncounterSpacing, Math.abs(encounterRecords[first].x - encounterRecords[second].x));
        }
    }
    if (encounterRecords.length < 2) metrics.minimumEncounterSpacing = encounters.minimumEncounterSpacing || 0;
    const requiredSpacing = Math.max(0, finiteNumber(encounters.minimumEncounterSpacing, 0));
    if (encounterRecords.length > 1 && metrics.minimumEncounterSpacing < requiredSpacing - 0.01) errors.push("Generated encounters are packed more tightly than the configured pacing distance.");

    for (const record of encounterRecords) {
        const group = byEncounter.get(record.id) || [];
        if (group.length !== record.groupSize || group.length !== (record.entityIds || []).length) errors.push(`Encounter “${record.id}” has inconsistent group membership.`);
        const metadata = metadataById.get(record.enemyId);
        if (metadata?.placementClass === "flyingBomber") {
            metrics.bombingBatGroups += record.enemyId === "enemy_020" ? 1 : 0;
            if (record.enemyId === "enemy_020" && (group.length < 2 || group.length > 3)) errors.push(`Bombing Bat encounter “${record.id}” must contain two or three bats.`);
            const sorted = [...group].sort((a, b) => a.x - b.x);
            for (let index = 1; index < sorted.length; index += 1) {
                const separation = sorted[index].x - sorted[index - 1].x;
                if (separation < metadata.minGroupSpacing - 0.01) errors.push(`Flying group “${record.id}” has only ${roundCoordinate(separation)} units between bats.`);
                if (separation > 112) warnings.push(`Flying group “${record.id}” is wider than the standard rocket's weak splash is intended to support.`);
            }
        }
    }

    if (!Number.isFinite(metrics.minimumRewardEndpointDistance)) metrics.minimumRewardEndpointDistance = 0;
    if (!Number.isFinite(metrics.minimumEncounterSpacing)) metrics.minimumEncounterSpacing = 0;
    if (metrics.spentBudget > metrics.budget + 0.01) errors.push("Encounter population exceeded its deterministic difficulty budget.");
    if (settings.enemyDensity > 0.15 && resolved.size && !entities.length) warnings.push("Enemy density requested encounters, but no allowed enemy fit the generated route safely.");
    const targetShortfall = Math.max(0, metrics.monsterTarget - metrics.enemyCount);
    if (targetShortfall > 0 && metrics.monsterTarget > 0) {
        warnings.push(`Generated encounters placed ${metrics.enemyCount} monsters against a horizontal-span target of ${metrics.monsterTarget}.`);
    }
    metrics.monsterTargetAchievement = metrics.monsterTarget > 0
        ? Math.round(metrics.enemyCount / metrics.monsterTarget * 10000) / 10000
        : 1;
    let qualityScore = 100 - errors.length * 45 - warnings.length * 2;
    qualityScore -= Math.max(0, 1 - metrics.monsterTargetAchievement) * 20;
    qualityScore = clamp(Math.round(qualityScore * 10) / 10, 0, 100);
    return { valid: errors.length === 0, qualityScore, errors, warnings, metrics };
}

export function validateGeneratedRewards(value = {}) {
    const rewards = value.rewards && typeof value.rewards === "object"
        ? value.rewards
        : emptyRewardPopulation("", "not-generated-yet");
    const entities = Array.isArray(value.entities) ? value.entities : [];
    const traversal = value.traversal || {};
    const endpoints = value.endpoints || {};
    const cavern = value.cavern || {};
    const endpointEntities = Array.isArray(value.endpointEntities) ? value.endpointEntities : [];
    const encounterEntities = Array.isArray(value.encounterEntities) ? value.encounterEntities : [];
    const theme = normalizeGeneratorTheme(value.theme);
    const settings = normalizeGeneratorSettings(value.settings, theme.defaults);
    const rewardGenerationCatalog = normalizeRewardGenerationCatalog(value.rewardGenerationCatalog);
    const entityCatalog = normalizeInteractiveEntityCatalog(value.entityCatalog);
    const metadataByType = new Map(rewardGenerationCatalog.rewards.map((entry) => [entry.entityType, entry]));
    const supports = new Map((traversal.supports || []).map((support) => [support.id, support]));
    const selectedPerches = new Set(normalizeStringArray(rewards.selectedPerchSupportIds));
    const errors = [];
    const warnings = [];
    const metrics = {
        rewardCount: entities.length,
        chestCount: 0,
        chestTarget: Math.max(0, Math.floor(Number(rewards.treasureTarget) || 0)),
        powerUpCount: 0,
        powerUpTarget: Math.max(0, Math.floor(Number(rewards.powerUpTarget) || 0)),
        utilityCount: 0,
        thoughtCount: 0,
        selectedPerchCount: selectedPerches.size,
        rewardedPerchCount: 0,
        minimumRewardSpacing: Infinity,
        minimumRewardEndpointDistance: Infinity,
        inaccessibleRewardCount: 0,
        endpointCrowdingCount: 0,
        rewardEnemyOverlapCount: 0
    };
    const rewardIds = new Set();
    const rewardRecords = Array.isArray(rewards.rewards) ? rewards.rewards : [];
    const recordByEntityId = new Map(rewardRecords.map((record) => [record.entityId, record]));
    const entranceX = finiteNumber(endpoints?.entrance?.x, supports.get(traversal.startSupportId)?.centerX || 0);
    const exitX = finiteNumber(endpoints?.exit?.x, supports.get(traversal.exitSupportId)?.centerX || 0);

    for (let first = 0; first < entities.length; first += 1) {
        const entity = entities[first];
        if (!entity?.id || rewardIds.has(entity.id)) errors.push(`Duplicate or missing generated reward ID “${entity?.id || "unnamed"}”.`);
        rewardIds.add(entity?.id);
        const metadata = metadataByType.get(String(entity?.type || ""));
        const definition = entityCatalog.get(String(entity?.type || ""));
        const support = supports.get(entity?.generationSupportId);
        const record = recordByEntityId.get(entity?.id);
        if (!hasGenerationStageProvenance(entity, "rewards")) errors.push(`Reward “${entity?.id}” is missing reward-generation provenance.`);
        else if (entity?.manualizedFromGeneration) warnings.push(`Reward “${entity.id}” is a manual replacement for generated reward content.`);
        if (!metadata || !definition) errors.push(`Reward “${entity?.id}” lacks generation metadata or an entity catalog definition.`);
        if (!support) errors.push(`Reward “${entity?.id}” references missing support “${entity?.generationSupportId || "unknown"}”.`);
        if (!record) errors.push(`Reward “${entity?.id}” has no reward-population record.`);
        if (!metadata || !definition || !support) continue;
        const endpointDistance = Math.min(Math.abs(entity.x - entranceX), Math.abs(entity.x - exitX));
        metrics.minimumEndpointDistance = Math.min(metrics.minimumEndpointDistance, endpointDistance);
        if (endpointDistance < theme.rewards.endpointExclusionDistance - 0.01) {
            metrics.endpointCrowdingCount += 1;
            errors.push(`Reward “${entity.id}” violates the ${roundCoordinate(theme.rewards.endpointExclusionDistance)}-unit endpoint exclusion zone.`);
        }
        const halfWidth = entity.type === "thoughtTrigger" ? 0 : definition.defaultSize.w * 0.5;
        if (support.walkableWidth < metadata.minimumSupportWidth - 0.01) errors.push(`Reward “${entity.id}” is on a support narrower than its metadata permits.`);
        if (entity.x - halfWidth < support.walkableLeftX + metadata.edgeClearance - 0.01 || entity.x + halfWidth > support.walkableRightX - metadata.edgeClearance + 0.01) {
            metrics.inaccessibleRewardCount += 1;
            errors.push(`Reward “${entity.id}” lacks safe authored walkable-edge clearance.`);
        }
        const vertical = cavernVerticalRangeAt(cavern, entity.x, entity.y);
        const top = entity.y - definition.defaultSize.h;
        if (!vertical || top < vertical.top + 10 || entity.y > vertical.bottom + 1) {
            metrics.inaccessibleRewardCount += 1;
            errors.push(`Reward “${entity.id}” does not fit inside the generated cave opening.`);
        }
        if (metadata.category === "treasure") {
            metrics.chestCount += 1;
            if (entity.type !== "treasureChest") errors.push(`Treasure reward “${entity.id}” is not a treasure chest.`);
            if (entity.generationContext === "secondaryPerch") {
                if (!selectedPerches.has(support.id)) errors.push(`Treasure chest “${entity.id}” is not attached to a selected upper reward perch.`);
                if (!support.secondaryPlatform || !support.rewardPerch) errors.push(`Treasure chest “${entity.id}” is not seated on an authored secondary reward perch.`);
                metrics.rewardedPerchCount += 1;
            } else if (entity.generationContext === "openRoute") {
                if (!support.mandatory || !["routeFloor", "landingPlatform", "runAndGunGround", "recoveryPlatform", "doorSupport"].includes(support.role)) {
                    errors.push(`Treasure chest “${entity.id}” is not attached to a supported mandatory-route surface.`);
                }
            } else if (entity.generationContext === "upperAccess") {
                if (support.role !== "upperAccessPlatform" || support.moving) {
                    errors.push(`Treasure chest “${entity.id}” is not attached to a static upper-access support.`);
                }
            } else if (entity.generationContext === "upperPerch") {
                if (!support.secondaryPlatform || support.moving) {
                    errors.push(`Treasure chest “${entity.id}” is not attached to a static reachable upper perch.`);
                }
            } else if (entity.generationContext === "recoveryRoute") {
                if (support.role !== "recoveryPlatform" || support.moving) {
                    errors.push(`Treasure chest “${entity.id}” is not attached to a static recovery-route support.`);
                }
            } else {
                errors.push(`Treasure chest “${entity.id}” has unsupported generation context “${entity.generationContext || "unknown"}”.`);
            }
            if (Math.abs(entity.y - support.surfaceY) > 2) errors.push(`Treasure chest “${entity.id}” is not seated on its support surface.`);
            if (!(Number(entity.scoreValue) > 0)) errors.push(`Treasure chest “${entity.id}” has no positive Score reward.`);
        } else if (metadata.category === "powerUp") {
            metrics.powerUpCount += 1;
            if (Math.abs(entity.y - support.surfaceY) > 2) {
                metrics.inaccessibleRewardCount += 1;
                errors.push(`Power-up “${entity.id}” is not seated on its support surface.`);
            }
        } else if (metadata.category === "utility") {
            metrics.utilityCount += 1;
        } else if (metadata.category === "narrative") {
            metrics.thoughtCount += 1;
            if (!settings.allowThoughts) errors.push(`Thought trigger “${entity.id}” was generated while narrative thoughts were disabled.`);
            if (!String(entity.thoughtText || "").trim()) errors.push(`Thought trigger “${entity.id}” has no thought text.`);
        }
        for (const enemy of encounterEntities) {
            const horizontal = Math.abs((Number(entity.x) || 0) - (Number(enemy.x) || 0));
            const verticalDistance = Math.abs((Number(entity.y) || 0) - (Number(enemy.y) || 0));
            if (horizontal < (definition.defaultSize.w + Number(enemy.w || 72)) * 0.55 && verticalDistance < Math.max(definition.defaultSize.h, Number(enemy.h || 120)) * 0.72) {
                metrics.rewardEnemyOverlapCount += 1;
                errors.push(`Reward “${entity.id}” at (${roundCoordinate(entity.x)}, ${roundCoordinate(entity.y)}) on ${support.id} overlaps generated enemy “${enemy.id}” at (${roundCoordinate(enemy.x)}, ${roundCoordinate(enemy.y)}) on ${enemy.generationSupportId || "unknown"}.`);
                break;
            }
        }
        for (let second = first + 1; second < entities.length; second += 1) {
            const other = entities[second];
            const otherMetadata = metadataByType.get(String(other?.type || ""));
            const distanceX = Math.abs((Number(entity.x) || 0) - (Number(other.x) || 0));
            const distanceY = Math.abs((Number(entity.y) || 0) - (Number(other.y) || 0));
            if (metadata.category !== "narrative" && otherMetadata?.category !== "narrative" && distanceY < 180) {
                metrics.minimumRewardSpacing = Math.min(metrics.minimumRewardSpacing, distanceX);
                const requiredSpacing = generatedVisualRewardSpacing(theme, metadata.category, otherMetadata.category);
                if (distanceX < requiredSpacing - 0.01) {
                    errors.push(`Generated rewards “${entity.id}” and “${other.id}” are only ${roundCoordinate(distanceX)} units apart; ${roundCoordinate(requiredSpacing)} is required for their categories.`);
                }
            }
        }
    }

    if (settings.rewardDensity <= 0.001 && (entities.length || selectedPerches.size)) errors.push("Zero reward density must produce no rewards or selected reward perches.");
    if (metrics.chestCount < metrics.chestTarget) errors.push(`Generated rewards contain ${metrics.chestCount} treasure chests but the route-scaled target is ${metrics.chestTarget}.`);
    if (metrics.powerUpCount < metrics.powerUpTarget) errors.push(`Generated rewards contain ${metrics.powerUpCount} power-ups but the route-scaled target is ${metrics.powerUpTarget}.`);
    if (metrics.thoughtCount > theme.rewards.maximumThoughts) errors.push("Generated narrative thoughts exceed the theme maximum.");
    if (endpointEntities.some((entity) => !hasGenerationStageProvenance(entity, "endpoints"))) errors.push("Beginning and end doors must remain owned by the Endpoint Placer or be explicit manual replacements for it.");
    if (endpointEntities.some((entity) => entity?.manualizedFromGeneration)) warnings.push("One or more generated endpoint doors were converted to manual ownership.");
    if (!Number.isFinite(metrics.minimumRewardSpacing)) metrics.minimumRewardSpacing = 0;
    if (!Number.isFinite(metrics.minimumRewardEndpointDistance)) metrics.minimumRewardEndpointDistance = 0;
    if (selectedPerches.size && metrics.rewardedPerchCount !== selectedPerches.size) errors.push("Not every selected upper reward perch has a meaningful treasure destination.");
    if (settings.rewardDensity > 0.6 && metrics.chestCount < metrics.chestTarget) warnings.push("High reward density could not fill its route-scaled treasure target.");

    let qualityScore = 100 - errors.length * 45 - warnings.length * 2;
    qualityScore -= Math.max(0, selectedPerches.size - metrics.rewardedPerchCount) * 18;
    qualityScore = clamp(Math.round(qualityScore * 10) / 10, 0, 100);
    return { valid: errors.length === 0, qualityScore, errors, warnings, metrics };
}

function combineGeneratorValidations(emptyCavernValidation, encounterValidation, rewardValidation = { errors: [], warnings: [], qualityScore: 100, metrics: {} }) {
    const errors = [...(emptyCavernValidation.errors || []), ...(encounterValidation.errors || []), ...(rewardValidation.errors || [])];
    const warnings = [...(emptyCavernValidation.warnings || []), ...(encounterValidation.warnings || []), ...(rewardValidation.warnings || [])];
    const qualityScore = clamp(Math.round((
        finiteNumber(emptyCavernValidation.qualityScore, 0) * 0.58
        + finiteNumber(encounterValidation.qualityScore, 0) * 0.25
        + finiteNumber(rewardValidation.qualityScore, 0) * 0.17
        - errors.length * 20
    ) * 10) / 10, 0, 100);
    return {
        valid: errors.length === 0,
        qualityScore,
        errors,
        warnings,
        metrics: {
            ...(emptyCavernValidation.metrics || {}),
            ...(encounterValidation.metrics || {}),
            ...(rewardValidation.metrics || {})
        }
    };
}

export function validateAutomaticLevelDraftSnapshot(value = {}) {
    const generation = normalizeLevelGeneration(value.generation);
    if (!generation) {
        return {
            valid: false,
            qualityScore: 0,
            errors: ["The level has no normalized Automatic Level Generator metadata."],
            warnings: [],
            metrics: {}
        };
    }
    const theme = normalizeGeneratorTheme(value.theme);
    const assetCatalog = normalizeGenerationAssetCatalog(value.assetCatalog);
    const enemyGenerationCatalog = normalizeEnemyGenerationCatalog(value.enemyGenerationCatalog);
    const rewardGenerationCatalog = normalizeRewardGenerationCatalog(value.rewardGenerationCatalog);
    const enemyCatalog = normalizeEnemyCatalogDefinitions(value.enemyCatalog);
    const entityCatalog = normalizeInteractiveEntityCatalog(value.entityCatalog);
    const generatedPlacements = Array.isArray(value.placements) ? value.placements.map((record) => JSON.parse(JSON.stringify(record))) : [];
    const generatedEntities = Array.isArray(value.entities) ? value.entities.map((record) => JSON.parse(JSON.stringify(record))) : [];
    const endpointEntities = generatedEntities.filter((entity) => generationOwnershipStage(entity) === "endpoints");
    const encounterEntities = generatedEntities.filter((entity) => generationOwnershipStage(entity) === "encounters");
    const rewardEntities = generatedEntities.filter((entity) => generationOwnershipStage(entity) === "rewards");
    const traversalPlacementIds = new Set((generation.traversal?.supports || [])
        .map((support) => String(support?.placementId || ""))
        .filter(Boolean));
    const traversal = {
        ...(generation.traversal || {}),
        placements: generatedPlacements.filter((record) => traversalPlacementIds.has(String(record?.id || "")))
    };
    const endpoints = {
        ...(generation.endpoints || {}),
        entities: endpointEntities
    };
    const encounters = {
        ...(generation.encounters || {}),
        entities: encounterEntities
    };
    const rewards = {
        ...(generation.rewards || {}),
        entities: rewardEntities
    };
    const emptyCavernValidation = validatePlayableEmptyCavern({
        route: generation.route,
        traversal,
        endpoints,
        cavern: generation.cavern,
        world: value.world || generation.world || {},
        assetCatalog,
        settings: generation.settings,
        theme
    });
    const encounterValidation = validateGeneratedEncounters({
        encounters,
        entities: encounterEntities,
        traversal,
        endpoints,
        cavern: generation.cavern,
        theme,
        settings: generation.settings,
        resolvedEnemyIds: generation.resolvedEnemyIds,
        enemyGenerationCatalog,
        enemyCatalog
    });
    const rewardValidation = validateGeneratedRewards({
        rewards,
        entities: rewardEntities,
        traversal,
        endpoints,
        cavern: generation.cavern,
        route: generation.route,
        encounters,
        endpointEntities,
        encounterEntities,
        theme,
        settings: generation.settings,
        rewardGenerationCatalog,
        entityCatalog
    });
    const baseValidation = combineGeneratorValidations(emptyCavernValidation, encounterValidation, rewardValidation);
    const decoration = {
        ...(generation.decoration || {}),
        placements: generatedPlacements.filter((record) => generationOwnershipStage(record) === "decoration")
    };
    const presentationValidation = validateGeneratedCavernPresentation({
        cavern: generation.cavern,
        traversal,
        endpoints,
        rewards,
        decoration,
        theme,
        requirePerimeter: Boolean(generation.decoration?.enabled)
    });
    return {
        valid: baseValidation.valid && presentationValidation.valid,
        qualityScore: Math.round((baseValidation.qualityScore * 0.78 + presentationValidation.qualityScore * 0.22) * 10) / 10,
        errors: [...baseValidation.errors, ...presentationValidation.errors],
        warnings: [...baseValidation.warnings, ...presentationValidation.warnings],
        metrics: { ...baseValidation.metrics, presentation: presentationValidation.metrics }
    };
}

export function buildAutomaticLevelValidationOverlay(generationValue) {
    const generation = normalizeLevelGeneration(generationValue);
    if (!generation) return null;
    const supports = Array.isArray(generation.traversal?.supports) ? generation.traversal.supports : [];
    const supportById = new Map(supports.map((support) => [support.id, support]));
    const transitions = (generation.traversal?.transitions || []).map((transition) => {
        const from = supportById.get(transition.fromSupportId);
        const to = supportById.get(transition.toSupportId);
        if (!from || !to) return null;
        return {
            id: String(transition.id || ""),
            fromSupportId: String(transition.fromSupportId || ""),
            toSupportId: String(transition.toSupportId || ""),
            x1: finiteNumber(from.centerX, 0),
            y1: finiteNumber(from.surfaceY, 0),
            x2: finiteNumber(to.centerX, 0),
            y2: finiteNumber(to.surfaceY, 0),
            mandatory: Boolean(transition.mandatory),
            valid: transition.valid !== false,
            gap: finiteNumber(transition.gap, 0),
            rise: finiteNumber(transition.rise, 0),
            drop: finiteNumber(transition.drop, 0),
            exposedLandingWidth: finiteNumber(transition.exposedLandingWidth, 0)
        };
    }).filter(Boolean);
    const endpointSupports = [generation.traversal?.startSupportId, generation.traversal?.exitSupportId]
        .map((supportId) => supportById.get(supportId))
        .filter(Boolean);
    const calmDistance = Math.max(
        finiteNumber(generation.endpoints?.calmDistance, 0),
        finiteNumber(generation.encounters?.calmDistance, 0)
    );
    return {
        supports: supports.map((support) => ({
            id: String(support.id || ""),
            x1: finiteNumber(support.walkableLeftX, finiteNumber(support.centerX, 0) - finiteNumber(support.walkableWidth, 0) * 0.5),
            x2: finiteNumber(support.walkableRightX, finiteNumber(support.centerX, 0) + finiteNumber(support.walkableWidth, 0) * 0.5),
            y: finiteNumber(support.surfaceY, 0),
            centerX: finiteNumber(support.centerX, 0),
            width: finiteNumber(support.width, 0),
            walkableWidth: finiteNumber(support.walkableWidth, 0),
            mandatory: Boolean(support.mandatory),
            role: String(support.role || "support"),
        })),
        transitions,
        calmZones: endpointSupports.map((support, index) => {
            const endpoint = index === 0 ? generation.endpoints?.entrance : generation.endpoints?.exit;
            return {
                id: index === 0 ? "entrance-calm-zone" : "exit-calm-zone",
                x: finiteNumber(endpoint?.x, finiteNumber(support.centerX, 0)),
                y: finiteNumber(endpoint?.y, finiteNumber(support.surfaceY, 0)),
                radius: calmDistance,
                role: index === 0 ? "entrance" : "exit"
            };
        }),
        encounters: (generation.encounters?.encounters || []).map((encounter) => ({
            id: String(encounter.id || ""),
            x: finiteNumber(encounter.x, 0),
            y: finiteNumber(encounter.y, 0),
            supportId: String(encounter.supportId || ""),
            groupSize: Math.max(0, Math.floor(Number(encounter.groupSize) || 0)),
            placementClass: String(encounter.placementClass || "encounter")
        })),
        rewards: (generation.rewards?.rewards || []).map((reward) => ({
            id: String(reward.id || ""),
            x: finiteNumber(reward.x, 0),
            y: finiteNumber(reward.y, 0),
            supportId: String(reward.supportId || reward.generationSupportId || ""),
            category: String(reward.category || reward.context || "reward"),
        })),
        worldBounds: generation.cavern?.bounds ? JSON.parse(JSON.stringify(generation.cavern.bounds)) : null,
        validation: normalizeGenerationValidation(generation.validation)
    };
}

export function automaticLevelDraftBounds(generation, padding = 180) {
    const cavernBounds = generation?.cavern?.bounds;
    if (cavernBounds && [cavernBounds.x, cavernBounds.y, cavernBounds.w, cavernBounds.h].every(Number.isFinite)) {
        const amount = Math.max(0, Number(padding) || 0);
        return {
            x: cavernBounds.x - amount,
            y: cavernBounds.y - amount,
            w: cavernBounds.w + amount * 2,
            h: cavernBounds.h + amount * 2
        };
    }
    return routeGraphBounds(generation?.route, padding);
}

export function validatePlayableEmptyCavern(value = {}) {
    const route = value.route || {};
    const traversal = value.traversal || {};
    const endpoints = value.endpoints || {};
    const cavern = value.cavern || {};
    const world = value.world || {};
    const theme = normalizeGeneratorTheme(value.theme);
    const settings = normalizeGeneratorSettings(value.settings, theme.defaults);
    const catalog = normalizeGenerationAssetCatalog(value.assetCatalog);
    const errors = [];
    const warnings = [];
    const supports = Array.isArray(traversal.supports) ? traversal.supports : [];
    const transitions = Array.isArray(traversal.transitions) ? traversal.transitions : [];
    const placements = Array.isArray(traversal.placements) ? traversal.placements : [];
    const entities = Array.isArray(endpoints.entities) ? endpoints.entities : [];
    const bySupportId = new Map(supports.map((support) => [support.id, support]));
    const catalogByAsset = new Map(catalog.assets.map((entry) => [`${entry.atlasId}:${entry.assetId}`, entry]));
    const routeValidation = validateRouteGraph(route, { settings, theme });
    errors.push(...routeValidation.errors.map((message) => `Route: ${message}`));

    const metrics = {
        routeQualityScore: routeValidation.qualityScore,
        supportCount: supports.length,
        platformCount: placements.length,
        transitionCount: transitions.length,
        mandatoryTransitionCount: transitions.filter((transition) => transition.mandatory).length,
        invalidMandatoryTransitions: 0,
        invalidNonMandatoryTransitions: 0,
        minimumTransitionGap: Infinity,
        blockedSupportPairs: 0,
        oneWayPlatformOverlapCount: 0,
        misalignedPlatformOverlapCount: 0,
        placementSupportMismatchCount: 0,
        manualizedPlacementMismatchCount: 0,
        recoveryPlatformCount: supports.filter((support) => support.role === "recoveryPlatform").length,
        recoveryLaneCount: 0,
        recoveryLaneGapCount: 0,
        recoveryGapOverlapViolationCount: 0,
        recoveryUpperGapCoverageCount: 0,
        movingThinAssetViolationCount: 0,
        movingShaftIntrusionCount: 0,
        movingPlatformCrushHazardCount: 0,
        movingPlatformSweepOverlapCount: 0,
        verticalMovingPlatformCount: 0,
        staticVerticalIntermediateCount: 0,
        horizontalJumpGapCount: 0,
        minimumHorizontalJumpGap: Infinity,
        maximumHorizontalRouteOffset: 0,
        minimumOrganicHeightDelta: Infinity,
        organicSameHeightAdjacentCount: 0,
        organicHeightDirectionChangeCount: 0,
        longStaticPlatformCount: supports.filter((support) => !support.moving && support.atlasId === "at_atlas_004").length,
        mainStaticPlatformCount: supports.filter((support) => support.mandatory && !support.moving && support.role !== "doorSupport").length,
        averageMainStaticPlatformWidth: 0,
        longPlatformShare: 0,
        secondaryPlatformCount: supports.filter((support) => support.secondaryPlatform).length,
        secondaryRewardPerchCount: supports.filter((support) => support.rewardPerch).length,
        secondaryCombatPerchCount: supports.filter((support) => support.combatPerch).length,
        upperAccessPlatformCount: supports.filter((support) => support.upperAccessPlatform).length,
        minimumUpperLaneRocketClearance: Infinity,
        secondaryPlatformCoverageRatio: 0,
        recoveryRequiredGapCount: 0,
        recoveryBacktrackReachableCount: 0,
        recoveryReturnLiftCount: supports.filter((support) => support.recoveryReturnLift).length,
        lowerRouteSupportCount: supports.filter((support) => support.lowerRoute).length,
        tertiaryRecoveryCount: supports.filter((support) => support.tertiaryRecovery).length,
        layeredNetworkLaneCount: 0,
        protectedLowerGapCount: 0,
        unprotectedLowerGapCount: 0,
        minimumStaticHeadroom: Infinity,
        minimumVerticalPlatformSeparation: Infinity,
        unprotectedUpperGapCount: 0,
        maxMandatoryGap: 0,
        maxMandatoryRise: 0,
        maxMandatoryDrop: 0,
        cavePointCount: cavern?.caveWindow?.points?.length || 0,
        entranceCalmWidth: 0,
        exitCalmWidth: 0
    };

    if (!supports.length || placements.length !== supports.length) errors.push("Traversal did not produce one collision-bearing placement per support.");
    const placementIds = new Set();
    const placementById = new Map();
    for (const placement of placements) {
        if (!placement?.id || placementIds.has(placement.id)) errors.push(`Duplicate or missing generated placement ID “${placement?.id || "unnamed"}”.`);
        placementIds.add(placement?.id);
        placementById.set(placement?.id, placement);
        if (placement?.collisionFromManifest === false) errors.push(`Generated traversal placement “${placement.id}” has collision disabled.`);
        if (!catalogByAsset.has(`${placement?.atlasId}:${placement?.assetId}`)) {
            if (placement?.manualizedFromGeneration) warnings.push(`Manual replacement “${placement?.id}” uses an asset outside the automatic generation catalog; its traversal suitability requires manual review.`);
            else errors.push(`Generated placement “${placement?.id}” is absent from the generation catalog.`);
        }
    }
    for (const support of supports) {
        const placement = placementById.get(support?.placementId);
        if (!placement) {
            metrics.placementSupportMismatchCount += 1;
            errors.push(`Generated support “${support?.id || "unnamed"}” references missing placement “${support?.placementId || "unknown"}”.`);
            continue;
        }
        const expectedX = finiteNumber(support.centerX, 0) - finiteNumber(support.width, 0) * 0.5;
        const expectedY = finiteNumber(support.surfaceY, 0) - finiteNumber(support.height, 0) * finiteNumber(support.surfaceYRatio, 0);
        const mismatch = Math.abs(finiteNumber(placement.x, 0) - expectedX) > 0.75
            || Math.abs(finiteNumber(placement.y, 0) - expectedY) > 0.75
            || Math.abs(finiteNumber(placement.w, 0) - finiteNumber(support.width, 0)) > 0.75
            || Math.abs(finiteNumber(placement.h, 0) - finiteNumber(support.height, 0)) > 0.75
            || String(placement.atlasId || "") !== String(support.atlasId || "")
            || String(placement.assetId || "") !== String(support.assetId || "");
        if (mismatch) {
            metrics.placementSupportMismatchCount += 1;
            if (placement?.manualizedFromGeneration) {
                metrics.manualizedPlacementMismatchCount += 1;
                warnings.push(`Manual replacement “${placement.id}” differs from generated traversal support “${support.id}”; automatic jump guarantees no longer cover that support.`);
            } else {
                errors.push(`Generated placement “${placement.id}” no longer matches traversal support “${support.id}”. Regenerate that stage or convert the edited object to manual ownership.`);
            }
        }
    }

    for (const transition of transitions) {
        const from = bySupportId.get(transition.fromSupportId);
        const to = bySupportId.get(transition.toSupportId);
        if (!from || !to) {
            errors.push(`Traversal transition “${transition.id}” references a missing support.`);
            continue;
        }
        metrics.minimumTransitionGap = Math.min(metrics.minimumTransitionGap, transition.gap || 0);
        if (transition.mandatory) {
            metrics.maxMandatoryGap = Math.max(metrics.maxMandatoryGap, transition.gap || 0);
            metrics.maxMandatoryRise = Math.max(metrics.maxMandatoryRise, transition.rise || 0);
            metrics.maxMandatoryDrop = Math.max(metrics.maxMandatoryDrop, transition.drop || 0);
        }
        if (!transition.valid) {
            if (transition.mandatory) metrics.invalidMandatoryTransitions += 1;
            else metrics.invalidNonMandatoryTransitions += 1;
            errors.push(`${transition.mandatory ? "Mandatory" : "Optional"} transition “${transition.id}” exceeds the movement envelope (gap ${transition.gap}, rise ${transition.rise}, drop ${transition.drop}, exposed landing ${transition.exposedLandingWidth ?? 0}).`);
        }
    }

    if (!Number.isFinite(metrics.minimumTransitionGap)) metrics.minimumTransitionGap = 0;

    
        const routeNodeById = new Map((route?.nodes || []).map((node) => [node.id, node]));
        const routeEdges = (route?.edges || []).filter((edge) => edge.mandatory !== false);
        for (const edge of routeEdges) {
            const edgeSupports = supports.filter((support) => support.routeEdgeId === edge.id);
            const edgeTransitions = transitions.filter((transition) => transition.routeEdgeId === edge.id && transition.mandatory);
            const vertical = edge.intendedDirection === "climb" || edge.intendedDirection === "descend";
            if (vertical) {
                const movingSupports = edgeSupports.filter((support) => support.moving && support.movementAxis === "vertical");
                const staticSupports = edgeSupports.filter((support) => !support.moving);
                const allEdgeTransitions = transitions.filter((transition) => transition.routeEdgeId === edge.id);
                const risingSnakeTraversal = route?.generatorId === "rising-snake-route-v1" || route?.macro?.patternId === "rising-snake";
                metrics.verticalMovingPlatformCount += movingSupports.length;
                metrics.staticVerticalIntermediateCount += staticSupports.length;
                const fromNode = routeNodeById.get(edge.from);
                const toNode = routeNodeById.get(edge.to);
                const expectedOffsetY = finiteNumber(bySupportId.get(edge.to ? `support_${edge.to}` : "")?.surfaceY, finiteNumber(toNode?.y, 0))
                    - finiteNumber(bySupportId.get(edge.from ? `support_${edge.from}` : "")?.surfaceY, finiteNumber(fromNode?.y, 0));
                const validateMovingSupport = () => {
                    if (movingSupports.length !== 1) {
                        errors.push(`Vertical route edge “${edge.id}” must use exactly one moving platform for its elevator path.`);
                        return;
                    }
                    const movingSupport = movingSupports[0];
                    const placement = placementById.get(movingSupport.placementId);
                    const movingAsset = catalogByAsset.get(`${movingSupport.atlasId}:${movingSupport.assetId}`);
                    if (!movingAsset?.roles.includes("movingPlatform")) {
                        metrics.movingThinAssetViolationCount += 1;
                        errors.push(`Vertical route edge “${edge.id}” does not use the reserved thin moving-platform style.`);
                    }
                    if (!placement?.movement || placement.movement.pattern !== "shuttle") {
                        errors.push(`Vertical route edge “${edge.id}” is missing its automatic shuttle movement.`);
                    } else {
                        if (Math.abs(finiteNumber(placement.movement.endOffsetX, 0)) > 0.5) errors.push(`Vertical route edge “${edge.id}” moves sideways instead of remaining a vertical lift.`);
                        if (Math.abs(finiteNumber(placement.movement.endOffsetY, 0) - expectedOffsetY) > 1) errors.push(`Vertical route edge “${edge.id}” does not span the complete planned climb or drop.`);
                    }
                    const movingTransfers = edgeTransitions.filter((transition) => transition.movingPlatformTransfer);
                    if (movingTransfers.length !== 2) errors.push(`Vertical route edge “${edge.id}” must expose start and end moving-platform transfers.`);
                };
                if (risingSnakeTraversal) {
                    const recordedStyle = String(traversal?.verticalTraversalStyles?.[edge.id] || "");
                    const verticalTraversalStyle = recordedStyle || (movingSupports.length && staticSupports.length ? "mix" : movingSupports.length ? "elevator" : "platforms");
                    if (staticSupports.some((support) => support.collisionMode !== "oneWay" || !support.verticalClimbPlatform)) {
                        errors.push(`Rising Snake edge “${edge.id}” uses a static vertical support without a green one-way climbing line.`);
                    }
                    if (verticalTraversalStyle === "elevator") {
                        if (staticSupports.length) errors.push(`Rising Snake elevator edge “${edge.id}” contains unexpected static climbing platforms.`);
                        validateMovingSupport();
                    } else if (verticalTraversalStyle === "platforms") {
                        if (movingSupports.length) errors.push(`Rising Snake platform edge “${edge.id}” contains an unexpected elevator.`);
                        if (!staticSupports.length) errors.push(`Rising Snake platform edge “${edge.id}” contains no green climbing platforms.`);
                        if (edgeTransitions.length !== staticSupports.length + 1 || edgeTransitions.some((transition) => !transition.verticalPlatformClimb)) {
                            errors.push(`Rising Snake platform edge “${edge.id}” does not expose one mandatory jump transition for every climbing step.`);
                        }
                    } else if (verticalTraversalStyle === "mix") {
                        validateMovingSupport();
                        if (!staticSupports.length) errors.push(`Rising Snake mixed edge “${edge.id}” contains no green alternative platforms.`);
                        const greenAlternatives = allEdgeTransitions.filter((transition) => !transition.mandatory && transition.verticalPlatformClimb);
                        if (greenAlternatives.length !== staticSupports.length + 1) {
                            errors.push(`Rising Snake mixed edge “${edge.id}” does not provide a complete optional green-platform alternative.`);
                        }
                    } else {
                        errors.push(`Rising Snake edge “${edge.id}” has unknown vertical traversal style “${verticalTraversalStyle}”.`);
                    }
                } else {
                    if (movingSupports.length !== 1 || staticSupports.length) {
                        errors.push(`Vertical route edge “${edge.id}” must use exactly one moving platform and no static staircase supports.`);
                    }
                    validateMovingSupport();
                }
                continue;
            }

            if (edge.intendedDirection === "left" || edge.intendedDirection === "right") {
                const fromNode = routeNodeById.get(edge.from);
                const toNode = routeNodeById.get(edge.to);
                const endpointPair = fromNode?.kind === "entrance" || fromNode?.kind === "exit" || toNode?.kind === "entrance" || toNode?.kind === "exit";
                const jumpTransitions = edgeTransitions.filter((transition) => ["openJumpSequence", "staggeredUpperRoute", "organicUpperRoute"].includes(transition.spacingStyle));
                for (const transition of jumpTransitions) {
                    metrics.horizontalJumpGapCount += 1;
                    metrics.minimumHorizontalJumpGap = Math.min(metrics.minimumHorizontalJumpGap, finiteNumber(transition.gap, 0));
                    if (finiteNumber(transition.gap, 0) < 34) errors.push(`Horizontal route edge “${edge.id}” contains a platform gap smaller than the intended jump rhythm.`);
                }
                if (!endpointPair && edgeTransitions.some((transition) => transition.spacingStyle === "shortAnchorPair")) {
                    errors.push(`Horizontal route edge “${edge.id}” collapsed into touching anchor platforms away from an endpoint chamber.`);
                }
                for (const support of edgeSupports) {
                    metrics.maximumHorizontalRouteOffset = Math.max(metrics.maximumHorizontalRouteOffset, Math.abs(finiteNumber(support.routeOffsetY, 0)));
                }
                if (jumpTransitions.length) {
                    const orderedSupports = [bySupportId.get(jumpTransitions[0].fromSupportId), ...jumpTransitions.map((transition) => bySupportId.get(transition.toSupportId))].filter(Boolean);
                    for (const support of orderedSupports) {
                        metrics.maximumHorizontalRouteOffset = Math.max(metrics.maximumHorizontalRouteOffset, Math.abs(finiteNumber(support.routeOffsetY, 0)));
                    }
                    let previousVerticalSign = 0;
                    for (let index = 1; index < orderedSupports.length; index += 1) {
                        const delta = finiteNumber(orderedSupports[index].surfaceY, 0) - finiteNumber(orderedSupports[index - 1].surfaceY, 0);
                        const heightDelta = Math.abs(delta);
                        metrics.minimumOrganicHeightDelta = Math.min(metrics.minimumOrganicHeightDelta, heightDelta);
                        if (heightDelta < 32) {
                            metrics.organicSameHeightAdjacentCount += 1;
                            errors.push(`Horizontal route edge “${edge.id}” places consecutive upper platforms on effectively the same height.`);
                        }
                        const verticalSign = Math.sign(delta);
                        if (verticalSign && previousVerticalSign && verticalSign !== previousVerticalSign) metrics.organicHeightDirectionChangeCount += 1;
                        if (verticalSign) previousVerticalSign = verticalSign;
                    }
                    if (orderedSupports.length >= 3) {
                        const surfaces = orderedSupports.map((support) => finiteNumber(support.surfaceY, 0));
                        const heightRange = Math.max(...surfaces) - Math.min(...surfaces);
                        if (heightRange < 58) errors.push(`Horizontal route edge “${edge.id}” does not vary enough vertically to read as organic traversal.`);
                    }
                }
            }
        }
        const secondarySpans = supports.filter((support) => support.secondaryPlatform)
            .map((support) => ({ left: support.walkableLeftX, right: support.walkableRightX }))
            .sort((left, right) => left.left - right.left);
        let secondaryCoverageWidth = 0;
        let activeSecondarySpan = null;
        for (const span of secondarySpans) {
            if (!activeSecondarySpan) activeSecondarySpan = { ...span };
            else if (span.left <= activeSecondarySpan.right) activeSecondarySpan.right = Math.max(activeSecondarySpan.right, span.right);
            else {
                secondaryCoverageWidth += activeSecondarySpan.right - activeSecondarySpan.left;
                activeSecondarySpan = { ...span };
            }
        }
        if (activeSecondarySpan) secondaryCoverageWidth += activeSecondarySpan.right - activeSecondarySpan.left;
        const routeBoundsForSecondaryCoverage = routeGraphBounds(route, 0);
        metrics.secondaryPlatformCoverageRatio = roundCoordinate(secondaryCoverageWidth / Math.max(1, finiteNumber(routeBoundsForSecondaryCoverage?.w, 1)));
        const mostlyHorizontalRoute = route?.generatorId === "mostly-horizontal-route-v1" || route?.macro?.patternId === "mostly-horizontal";
        const risingSnakeRoute = route?.generatorId === "rising-snake-route-v1" || route?.macro?.patternId === "rising-snake";
        if (mostlyHorizontalRoute) {
            for (const support of supports.filter((candidate) => candidate.secondaryPlatform)) {
                const groundParent = bySupportId.get(String(support.groundParentSupportId || ""));
                const accessSupport = bySupportId.get(String(support.accessSupportId || ""));
                if (!groundParent || !accessSupport?.upperAccessPlatform) {
                    errors.push(`Upper platform “${support.id}” is missing its reachable access step or ground parent.`);
                    continue;
                }
                const undersideY = support.surfaceY + support.height * (1 - support.surfaceYRatio);
                const rocketClearance = groundParent.surfaceY - undersideY;
                metrics.minimumUpperLaneRocketClearance = Math.min(metrics.minimumUpperLaneRocketClearance, rocketClearance);
                if (rocketClearance < GENERATED_MINIMUM_VERTICAL_PLATFORM_SEPARATION) {
                    errors.push(`Upper platform “${support.id}” leaves only ${roundCoordinate(rocketClearance)} units beneath it; generated stacked platforms need at least ${GENERATED_MINIMUM_VERTICAL_PLATFORM_SEPARATION}.`);
                }
            }
            if (metrics.upperAccessPlatformCount < metrics.secondaryPlatformCount) {
                errors.push("The Horizontal upper lane is missing one or more intermediate access platforms.");
            }
        }
        if (!Number.isFinite(metrics.minimumUpperLaneRocketClearance)) metrics.minimumUpperLaneRocketClearance = 0;
        const mainStaticSupports = supports.filter((support) => support.mandatory && !support.moving && support.role !== "doorSupport");
        if (mainStaticSupports.length) {
            metrics.averageMainStaticPlatformWidth = roundCoordinate(mainStaticSupports.reduce((sum, support) => sum + finiteNumber(support.walkableWidth, support.width), 0) / mainStaticSupports.length);
            const spanSupports = mainStaticSupports.filter((support) => support.routeEdgeId);
            const sharePopulation = spanSupports.length ? spanSupports : mainStaticSupports;
            metrics.longPlatformShare = Math.round(sharePopulation.filter((support) => support.atlasId === "at_atlas_004" || finiteNumber(support.walkableWidth, 0) >= 520).length / sharePopulation.length * 10000) / 10000;
        }
            const recoveryLanes = Array.isArray(traversal.recoveryLanes) ? traversal.recoveryLanes : [];
            metrics.recoveryLaneCount = recoveryLanes.length;
            for (const lane of recoveryLanes) {
                const laneSupports = normalizeStringArray(lane.supportIds).map((id) => bySupportId.get(id)).filter(Boolean);
                const upperGaps = Array.isArray(lane.upperGaps) ? lane.upperGaps : [];
                const lowerGaps = Array.isArray(lane.lowerGaps) ? lane.lowerGaps : [];
                metrics.recoveryLaneGapCount += lowerGaps.length;
                for (const upperGap of upperGaps) {
                    metrics.recoveryRequiredGapCount += 1;
                    const covered = laneSupports.some((support) => {
                        const left = finiteNumber(support.walkableLeftX, support.centerX - support.width * 0.5);
                        const right = finiteNumber(support.walkableRightX, support.centerX + support.width * 0.5);
                        return left <= finiteNumber(upperGap.centerX, 0) && right >= finiteNumber(upperGap.centerX, 0);
                    });
                    if (covered) metrics.recoveryUpperGapCoverageCount += 1;
                    else {
                        metrics.unprotectedUpperGapCount += 1;
                        errors.push(`Recovery lane “${lane.id}” leaves upper jump gap ${roundCoordinate(finiteNumber(upperGap.centerX, 0))} without a landing below it.`);
                    }
                    
                }
                if (lane.layeredNetwork) {
                    metrics.layeredNetworkLaneCount += 1;
                    const laneReturnLift = bySupportId.get(String(lane.returnLiftId || ""));
                    if (laneReturnLift?.moving && laneReturnLift.recoveryReturnLift) metrics.recoveryBacktrackReachableCount += 1;
                    else errors.push(`Layered recovery lane “${lane.id}” has no functioning backtracking return lift.`);
                }
                for (const lowerGap of lowerGaps) {
                    const overlap = upperGaps.some((upperGap) => Math.min(
                        finiteNumber(lowerGap.rightX, 0),
                        finiteNumber(upperGap.rightX, 0)
                    ) - Math.max(
                        finiteNumber(lowerGap.leftX, 0),
                        finiteNumber(upperGap.leftX, 0)
                    ) > 1);
                    if (overlap) {
                        metrics.recoveryGapOverlapViolationCount += 1;
                        errors.push(`Recovery lane “${lane.id}” places a lower-floor gap underneath an upper-route gap.`);
                    }
                    if (finiteNumber(lowerGap.width, 0) < 34) errors.push(`Recovery lane “${lane.id}” contains an indistinct lower-floor gap.`);
                    if (finiteNumber(lowerGap.width, 0) > theme.traversal.mandatoryGap + 8) errors.push(`Recovery lane “${lane.id}” contains an unsafe lower-floor gap.`);
                    const rescue = bySupportId.get(String(lowerGap.recoverySupportId || ""));
                    const returnLift = bySupportId.get(String(lowerGap.returnLiftId || ""));
                    if (rescue?.tertiaryRecovery && returnLift?.moving && returnLift.recoveryReturnLift) {
                        metrics.protectedLowerGapCount += 1;
                    } else {
                        metrics.unprotectedLowerGapCount += 1;
                        errors.push(`Layered recovery lane “${lane.id}” leaves a lower-route gap without tertiary recovery and a return lift.`);
                    }
                }
            }
            if (!recoveryLanes.length && settings.safety >= 0.5) warnings.push("The layered traversal produced no staggered recovery floor.");
            if (metrics.recoveryRequiredGapCount !== metrics.horizontalJumpGapCount) errors.push("Not every upper-route jump gap has a dedicated recovery platform below it.");
            if (metrics.layeredNetworkLaneCount !== recoveryLanes.length) errors.push("A recovery lane was not materialized as a complete upper/lower safety network.");
            if (metrics.recoveryBacktrackReachableCount !== metrics.layeredNetworkLaneCount) errors.push("One or more lower recovery routes cannot return the player to the upper route.");
            if (metrics.protectedLowerGapCount !== metrics.recoveryLaneGapCount) errors.push("One or more lower-route gaps lack tertiary recovery.");
            if (metrics.secondaryPlatformCount !== metrics.secondaryRewardPerchCount + metrics.secondaryCombatPerchCount) errors.push("A generated secondary platform is not classified as a reward or combat perch.");
            if (metrics.movingThinAssetViolationCount > 0) errors.push("One or more vertical lifts use ordinary static-platform artwork.");
        
        if (!Number.isFinite(metrics.minimumHorizontalJumpGap)) metrics.minimumHorizontalJumpGap = 0;
        if (!Number.isFinite(metrics.minimumOrganicHeightDelta)) metrics.minimumOrganicHeightDelta = 0;
        if (!risingSnakeRoute && metrics.staticVerticalIntermediateCount > 0) errors.push("ThePath74 vertical traversal still contains static staircase supports.");
        if (metrics.horizontalJumpGapCount > 0 && metrics.maximumHorizontalRouteOffset < 72) warnings.push("Horizontal platform sequences remained unusually close to the abstract route height.");
        if (metrics.organicSameHeightAdjacentCount > 0) errors.push("The organic upper route still contains a same-height platform row.");
        if (!risingSnakeRoute && metrics.mainStaticPlatformCount >= 3 && metrics.longPlatformShare < 0.4) errors.push("The Standard traversal did not use long platforms for enough of the main route.");
        if (mostlyHorizontalRoute && metrics.secondaryPlatformCoverageRatio < 0.355) errors.push(`The Horizontal upper lane covers only ${roundCoordinate(metrics.secondaryPlatformCoverageRatio * 100)}% of the route span.`);
     else if (!Number.isFinite(metrics.minimumHorizontalJumpGap)) {
        metrics.minimumHorizontalJumpGap = 0;
    }

    const connectedSupportPairs = new Set();
    for (const transition of transitions) {
        connectedSupportPairs.add(`${transition.fromSupportId}|${transition.toSupportId}`);
        connectedSupportPairs.add(`${transition.toSupportId}|${transition.fromSupportId}`);
    }
    const mandatoryPathIndex = new Map((Array.isArray(traversal.mandatorySupportPath) ? traversal.mandatorySupportPath : [])
        .map((supportId, index) => [supportId, index]));
    const enforceLayeredStaticHeadroom = traversal.generatorId === "layered-safety-network-traversal-v6";
    for (let firstIndex = 0; firstIndex < supports.length; firstIndex += 1) {
        const first = supports[firstIndex];
        for (let secondIndex = firstIndex + 1; secondIndex < supports.length; secondIndex += 1) {
            const second = supports[secondIndex];
            const connectedPair = connectedSupportPairs.has(`${first.id}|${second.id}`);
            const overlap = Math.min(
                first.centerX + first.width * 0.5,
                second.centerX + second.width * 0.5
            ) - Math.max(
                first.centerX - first.width * 0.5,
                second.centerX - second.width * 0.5
            );
            const firstTop = first.surfaceY - first.height * first.surfaceYRatio;
            const firstBottom = firstTop + first.height;
            const secondTop = second.surfaceY - second.height * second.surfaceYRatio;
            const secondBottom = secondTop + second.height;
            const visualOverlapY = Math.min(firstBottom, secondBottom) - Math.max(firstTop, secondTop);
            if (overlap > 1 && visualOverlapY > 1 && (first.collisionMode === "oneWay" || second.collisionMode === "oneWay")) {
                metrics.oneWayPlatformOverlapCount += 1;
                errors.push(`One-way platform “${first.id}” visually overlaps “${second.id}”; green walkable platforms must remain separate.`);
            }
            if (overlap > 1
                && visualOverlapY > 1
                && !first.moving
                && !second.moving
                && first.collisionMode !== "oneWay"
                && second.collisionMode !== "oneWay"
                && Math.abs(first.surfaceY - second.surfaceY) > 1) {
                metrics.misalignedPlatformOverlapCount += 1;
                errors.push(`Platforms “${first.id}” and “${second.id}” visually overlap at different walking heights; separate the step or align the surfaces.`);
            }
            if (overlap <= 24) continue;
            const surfaceSeparation = Math.abs(first.surfaceY - second.surfaceY);
            const movingPair = Boolean(first.moving || second.moving);
            if (!movingPair && surfaceSeparation > 1) {
                metrics.minimumVerticalPlatformSeparation = Math.min(
                    metrics.minimumVerticalPlatformSeparation,
                    surfaceSeparation
                );
                if (surfaceSeparation < GENERATED_MINIMUM_VERTICAL_PLATFORM_SEPARATION - 0.5) {
                    errors.push(`Platforms “${first.id}” and “${second.id}” are vertically separated by only ${roundCoordinate(surfaceSeparation)}; overlapping generated platforms need at least ${GENERATED_MINIMUM_VERTICAL_PLATFORM_SEPARATION}.`);
                }
            }
            const upper = first.surfaceY <= second.surfaceY ? first : second;
            const lower = upper === first ? second : first;
            const upperBottom = upper.surfaceY + upper.height * (1 - upper.surfaceYRatio);
            const bodyClearance = lower.surfaceY - upperBottom;
            const includesRecoveryPlatform = first.role === "recoveryPlatform" || second.role === "recoveryPlatform";
            const includesMovingPlatform = movingPair;
            const connectedContinuousGround = (
                (first.role === "runAndGunGround" && second.role === "runAndGunGround")
                || (connectedPair && first.runAndGunGround && second.runAndGunGround)
                || (first.continuousLowerGround && second.continuousLowerGround)
            );
            if (enforceLayeredStaticHeadroom
                && !includesMovingPlatform
                && !connectedContinuousGround
                && first.collisionMode !== "oneWay"
                && second.collisionMode !== "oneWay") {
                metrics.minimumStaticHeadroom = Math.min(metrics.minimumStaticHeadroom, bodyClearance);
                if (bodyClearance < GENERATED_STATIC_HEADROOM - 0.5) {
                    metrics.blockedSupportPairs += 1;
                    errors.push(`Supports “${upper.id}” and “${lower.id}” leave only ${roundCoordinate(bodyClearance)} units of static headroom; Ignatius needs at least ${GENERATED_STATIC_HEADROOM}.`);
                }
            }
            const oneWayRunAndGunPair = first.role === "runAndGunGround" && second.role === "runAndGunGround";
            if (connectedPair || oneWayRunAndGunPair) continue;
            const firstPathIndex = mandatoryPathIndex.get(first.id);
            const secondPathIndex = mandatoryPathIndex.get(second.id);
            const localPathNeighbours = Number.isInteger(firstPathIndex)
                && Number.isInteger(secondPathIndex)
                && Math.abs(firstPathIndex - secondPathIndex) <= 2;
            const requiredBodyClearance = localPathNeighbours ? 72 : 96;
            if (!includesRecoveryPlatform && !includesMovingPlatform && first.mandatory && second.mandatory && bodyClearance < requiredBodyClearance) {
                metrics.blockedSupportPairs += 1;
                errors.push(`Supports “${upper.id}” and “${lower.id}” form a blocked vertical sandwich with only ${roundCoordinate(bodyClearance)} units of clear space.`);
            }
        }
    }
    if (!Number.isFinite(metrics.minimumStaticHeadroom)) metrics.minimumStaticHeadroom = 0;
    if (!Number.isFinite(metrics.minimumVerticalPlatformSeparation)) metrics.minimumVerticalPlatformSeparation = 0;
    else metrics.minimumVerticalPlatformSeparation = roundCoordinate(metrics.minimumVerticalPlatformSeparation);

    for (const moving of supports.filter((support) => support.moving && support.movementShaft && support.strictShaftClearance)) {
        const placement = placementById.get(moving.placementId);
        const movement = placement?.movement || {};
        const riderEnvelope = generatedMovingPlatformRiderEnvelope(moving, movement);
        const visualSweep = generatedMovingPlatformVisualSweepRect(moving, movement);
        for (const other of supports) {
            if (other.id === moving.id || other.moving) continue;
            if (other.collisionMode === "oneWay") {
                if (rectanglesOverlapWithArea(visualSweep, generatedSupportVisualRect(other), 1)) {
                    metrics.movingPlatformSweepOverlapCount += 1;
                    errors.push(`Moving platform “${moving.id}” sweeps through one-way support “${other.id}”.`);
                }
                continue;
            }
            if (rectanglesOverlapWithArea(riderEnvelope, generatedBlockableSupportRect(other), 1)) {
                metrics.movingShaftIntrusionCount += 1;
                metrics.movingPlatformCrushHazardCount += 1;
                errors.push(`Moving-platform rider corridor “${moving.id}” is obstructed by blockable support “${other.id}”.`);
            }
        }
    }
    const mandatoryPath = Array.isArray(traversal.mandatorySupportPath) ? traversal.mandatorySupportPath : [];
    if (mandatoryPath.length < 2) errors.push("Traversal has no mandatory support path.");
    if (mandatoryPath[0] !== traversal.startSupportId) errors.push("The mandatory support path does not begin at the entrance support.");
    if (mandatoryPath.at(-1) !== traversal.exitSupportId) errors.push("The mandatory support path does not end at the exit support.");
    for (let index = 1; index < mandatoryPath.length; index += 1) {
        const exists = transitions.some((transition) => transition.mandatory && transition.fromSupportId === mandatoryPath[index - 1] && transition.toSupportId === mandatoryPath[index]);
        if (!exists) errors.push(`Mandatory support path is broken between “${mandatoryPath[index - 1]}” and “${mandatoryPath[index]}”.`);
    }

    const entranceDoors = entities.filter((entity) => entity.type === "wizard_entry_door");
    const exitDoors = entities.filter((entity) => entity.type === "wizard_exit_door");
    if (entranceDoors.length !== 1) errors.push("Generated cavern must contain exactly one entrance door.");
    if (exitDoors.length !== 1) errors.push("Generated cavern must contain exactly one exit door.");
    for (const endpoint of [endpoints.entrance, endpoints.exit]) {
        const support = bySupportId.get(endpoint?.supportId);
        const entity = entities.find((candidate) => candidate.id === endpoint?.entityId);
        if (!support || !entity) {
            errors.push("An endpoint is missing its door or support.");
            continue;
        }
        const asset = catalogByAsset.get(`${support.atlasId}:${support.assetId}`);
        if (!asset?.roles.includes("doorSupport")) errors.push(`Endpoint support “${support.id}” is not catalogued as doorSupport.`);
        const requiredWidth = Math.max(560, asset?.minimumDoorWidth || 0, theme.endpoints.calmDistance * 1.8);
        if ((support.walkableWidth || support.width) < requiredWidth) errors.push(`Endpoint support “${support.id}” is too narrow across its authored walkable top for a safe door chamber.`);
        if (support.height < Math.max(110, asset?.minimumVisibleDepth || 0)) errors.push(`Endpoint support “${support.id}” is visually too thin beneath its door.`);
        const floorY = finiteNumber(entity.y, 0);
        if (Math.abs(floorY - support.surfaceY) > 2) errors.push(`Door “${entity.id}” is not seated on its generated support.`);
        if (endpoint === endpoints.entrance) metrics.entranceCalmWidth = support.width;
        else metrics.exitCalmWidth = support.width;
    }

    const points = cavern?.caveWindow?.points;
    if (!cavern?.caveWindow?.enabled || !Array.isArray(points) || points.length < 12) errors.push("Cavern envelope did not produce a usable closed cave window.");
    const bounds = cavern?.bounds;
    if (!bounds || ![bounds.x, bounds.y, bounds.w, bounds.h].every(Number.isFinite) || bounds.w <= 0 || bounds.h <= 0) errors.push("Cavern envelope bounds are invalid.");
    const worldBounds = world?.bounds;
    if (!worldBounds || ![worldBounds.x, worldBounds.y, worldBounds.w, worldBounds.h].every(Number.isFinite)) {
        errors.push("Generated world bounds are invalid.");
    } else if (bounds && (worldBounds.x > bounds.x || worldBounds.y > bounds.y || worldBounds.x + worldBounds.w < bounds.x + bounds.w || worldBounds.y + worldBounds.h < bounds.y + bounds.h)) {
        errors.push("Generated world bounds do not contain the complete cave envelope.");
    }
    for (const support of supports) {
        if (!pointInsideGeneratedCavern(cavern, support.centerX, support.surfaceY - 4)) {
            errors.push(`Support “${support.id}” lies outside the generated cave opening.`);
        }
        if (support.moving && support.movementAxis === "vertical") {
            const placement = placementById.get(support.placementId);
            const endSurfaceY = support.surfaceY + finiteNumber(placement?.movement?.endOffsetY, 0);
            if (!pointInsideGeneratedCavern(cavern, support.centerX, endSurfaceY - 4)) {
                errors.push(`Moving support “${support.id}” leaves the generated cave opening at its far endpoint.`);
            }
        }
    }

    if (metrics.maxMandatoryGap > theme.traversal.mandatoryGap * 0.94) warnings.push("At least one mandatory jump approaches the configured conservative gap limit.");
    if (metrics.recoveryPlatformCount === 0 && settings.safety > 0.8) warnings.push("High safety was requested, but no transition needed a distinct recovery platform.");

    let qualityScore = routeValidation.qualityScore * 0.42 + 58;
    qualityScore -= errors.length * 45;
    qualityScore -= warnings.length * 1.5;
    qualityScore -= Math.max(0, metrics.maxMandatoryGap - theme.traversal.mandatoryGap * 0.75) * 0.035;
    qualityScore = Math.max(0, Math.min(100, Math.round(qualityScore * 10) / 10));
    return { valid: errors.length === 0, qualityScore, errors, warnings, metrics };
}

function buildStandardTraversal({
    route,
    theme,
    settings,
    implementations,
    assetCatalog,
    rng,
    runId
}) {
    const nodes = Array.isArray(route?.nodes) ? route.nodes : [];
    const edges = Array.isArray(route?.edges) ? route.edges : [];
    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const recoveryLanes = [];
    const supports = [];
    const placements = [];
    const movingShaftReservations = [];
    let entranceDoorSupportSelection = null;
    const nodeSupport = new Map();
    const edgeSupportIds = new Map();
    const mandatoryEdgeChains = new Map();
    let order = 1000;
    const useRunAndGunRoute = implementations.route === "mostly-horizontal-route-v1";
    const useRisingSnakeRoute = implementations.route === "rising-snake-route-v1" || route?.macro?.patternId === "rising-snake";
    const verticalTraversalStyles = new Map();
    if (useRisingSnakeRoute) {
        for (const edge of edges.filter((candidate) => candidate.mandatory !== false && (candidate.intendedDirection === "climb" || candidate.intendedDirection === "descend"))) {
            verticalTraversalStyles.set(edge.id, rng.pick(["elevator", "platforms", "mix"]));
        }
    }
    let movingVerticalEdgeCount = 0;

    const addSupport = (spec) => {
        let selection = spec.selection || selectGenerationAsset(
            assetCatalog,
            spec.role,
            spec.targetWidth,
            rng,
            spec.role === "doorSupport",
            spec.maximumWidth,
            spec.requiredCollisionMode ? { collisionMode: spec.requiredCollisionMode } : null
        );
        if (!selection) throw new Error(`No generation asset can satisfy role “${spec.role}”.`);
        if (spec.role === "doorSupport" && spec.endpointRole === "entrance") {
            entranceDoorSupportSelection = selection;
        } else if (spec.role === "doorSupport" && spec.endpointRole === "exit" && entranceDoorSupportSelection) {
            selection = entranceDoorSupportSelection;
        }
        const id = spec.id;
        const randomizedMirrorX = selection.asset.mirror && rng.chance(0.42);
        const mirrorX = typeof spec.mirrorX === "boolean" ? spec.mirrorX : randomizedMirrorX;
        const width = roundCoordinate(selection.width);
        const leftInsetRatio = mirrorX
            ? selection.asset.walkableRightInsetRatio
            : selection.asset.walkableLeftInsetRatio;
        const rightInsetRatio = mirrorX
            ? selection.asset.walkableLeftInsetRatio
            : selection.asset.walkableRightInsetRatio;
        const walkableLeftInset = roundCoordinate(width * leftInsetRatio);
        const walkableRightInset = roundCoordinate(width * rightInsetRatio);
        const centerX = roundCoordinate(spec.centerX);
        const support = {
            id,
            role: spec.role,
            mandatory: Boolean(spec.mandatory),
            routeNodeId: spec.routeNodeId || undefined,
            routeEdgeId: spec.routeEdgeId || undefined,
            centerX,
            surfaceY: roundCoordinate(spec.surfaceY),
            width,
            height: roundCoordinate(selection.height),
            walkableLeftInset,
            walkableRightInset,
            walkableLeftX: roundCoordinate(centerX - width * 0.5 + walkableLeftInset),
            walkableRightX: roundCoordinate(centerX + width * 0.5 - walkableRightInset),
            walkableWidth: roundCoordinate(width - walkableLeftInset - walkableRightInset),
            atlasId: selection.asset.atlasId,
            assetId: selection.asset.assetId,
            surfaceYRatio: selection.asset.surfaceYRatio,
            collisionMode: selection.asset.collisionMode,
            mirrorX,
            placementId: `${id}_placement`
        };
        supports.push(support);
        placements.push({
            id: support.placementId,
            kind: "atlasAsset",
            atlasId: support.atlasId,
            assetId: support.assetId,
            x: roundCoordinate(support.centerX - support.width * 0.5),
            y: roundCoordinate(support.surfaceY - support.height * support.surfaceYRatio),
            w: support.width,
            h: support.height,
            mirrorX,
            mirrorY: false,
            rotation: 0,
            layer: "terrain",
            collisionFromManifest: true,
            generatedBy: AUTOMATIC_LEVEL_GENERATOR_ID,
            generationRunId: runId,
            generationStage: spec.role === "doorSupport" ? "endpoints" : "traversal",
            generationRole: spec.role,
            routeNodeId: spec.routeNodeId || undefined,
            routeEdgeId: spec.routeEdgeId || undefined,
            generatorId: implementations.traversal,
            notes: `Generated ${spec.role} support for ${spec.routeNodeId || spec.routeEdgeId || "route"}.`,
            order: order++
        });
        return support;
    };

    const moveSupportCenter = (support, centerX) => {
        if (!support) return false;
        support.centerX = roundCoordinate(centerX);
        support.walkableLeftX = roundCoordinate(support.centerX - support.width * 0.5 + support.walkableLeftInset);
        support.walkableRightX = roundCoordinate(support.centerX + support.width * 0.5 - support.walkableRightInset);
        const placement = placements.find((candidate) => candidate.id === support.placementId);
        if (placement) placement.x = roundCoordinate(support.centerX - support.width * 0.5);
        return true;
    };

    const moveSupportSurface = (support, surfaceY) => {
        if (!support) return false;
        support.surfaceY = roundCoordinate(surfaceY);
        const placement = placements.find((candidate) => candidate.id === support.placementId);
        if (placement) placement.y = roundCoordinate(support.surfaceY - support.height * support.surfaceYRatio);
        return true;
    };

    const verticalLandingNodeIds = new Set();
    for (const edge of edges.filter((candidate) => candidate.mandatory !== false)) {
        const fromNode = nodeById.get(edge.from);
        const toNode = nodeById.get(edge.to);
        if (!fromNode || !toNode) continue;
        const verticalDistance = Math.abs(toNode.y - fromNode.y);
        const verticalRouteEdge = edge.intendedDirection === "climb" || edge.intendedDirection === "descend";
        if (!verticalRouteEdge && verticalDistance <= theme.traversal.mandatoryDrop * 0.9) continue;
        if (fromNode.kind !== "entrance" && fromNode.kind !== "exit") verticalLandingNodeIds.add(fromNode.id);
        if (toNode.kind !== "entrance" && toNode.kind !== "exit") verticalLandingNodeIds.add(toNode.id);
    }

    const supportRoleForNode = (node) => {
        if (node.kind === "entrance" || node.kind === "exit") return "doorSupport";
        if (useRunAndGunRoute) return "runAndGunGround";
        if (verticalLandingNodeIds.has(node.id)) return "landingPlatform";
        return node.kind === "chamber" || node.kind === "recovery" ? "routeFloor" : "landingPlatform";
    };

    const supportTargetWidthForNode = (node, role) => {
        if (role === "doorSupport") return theme.traversal.endpointWidth;
        if (useRunAndGunRoute) {
            if (node.kind === "chamber" || node.kind === "recovery") return theme.traversal.chamberWidth * 1.45;
            if (verticalLandingNodeIds.has(node.id)) return theme.traversal.intermediateWidth * 1.45;
            return theme.traversal.traversalWidth * 1.65;
        }
        if (node.kind === "chamber" || node.kind === "recovery") return theme.traversal.chamberWidth * 0.8;
        if (verticalLandingNodeIds.has(node.id)) return theme.traversal.intermediateWidth * 1.12;
        return theme.traversal.intermediateWidth * 1.24;
    };

    for (const node of nodes.filter((candidate) => candidate.mandatory)) {
        const role = supportRoleForNode(node);
        const support = addSupport({
            id: `support_${node.id}`,
            role,
            targetWidth: supportTargetWidthForNode(node, role),
            maximumWidth: role === "doorSupport" || (useRunAndGunRoute && role === "runAndGunGround")
                ? Infinity
                : supportTargetWidthForNode(node, role) * (node.kind === "chamber" || node.kind === "recovery" ? 1.22 : 1.24),
            centerX: node.x,
            surfaceY: node.y,
            mandatory: true,
            routeNodeId: node.id,
            endpointRole: role === "doorSupport" ? node.kind : undefined,
            mirrorX: role === "doorSupport" ? node.kind === "exit" : undefined,
            requiredCollisionMode: useRunAndGunRoute && role === "runAndGunGround" ? "blockable" : undefined
        });
        nodeSupport.set(node.id, support);
    }

    
        const orderedMandatoryNodes = nodes
            .filter((node) => node.mandatory !== false)
            .sort((left, right) => finiteNumber(left.progress, 0) - finiteNumber(right.progress, 0));
        for (let index = 1; index < orderedMandatoryNodes.length - 1; index += 1) {
            const node = orderedMandatoryNodes[index];
            const support = nodeSupport.get(node.id);
            if (!support) continue;
            const previousNode = orderedMandatoryNodes[index - 1];
            const previousSupport = nodeSupport.get(previousNode.id);
            const incomingEdge = edges.find((edge) => edge.mandatory !== false && edge.from === previousNode.id && edge.to === node.id);
            const incomingHorizontal = incomingEdge?.intendedDirection === "left" || incomingEdge?.intendedDirection === "right";
            if (useRunAndGunRoute) {
                moveSupportSurface(support, node.y);
                support.routeOffsetY = 0;
                support.platformHeightStyle = "levelRunAndGunAnchor";
                continue;
            }
            const minimumMagnitude = node.kind === "chamber" || node.kind === "recovery" ? 18 : 28;
            const maximumMagnitude = node.kind === "chamber" || node.kind === "recovery" ? 44 : 56;
            let offset = rng.range(minimumMagnitude, maximumMagnitude) * (rng.chance(0.5) ? -1 : 1);
            if (incomingHorizontal && previousSupport) {
                const previousOffset = finiteNumber(previousSupport.routeOffsetY, previousSupport.surfaceY - finiteNumber(previousNode.y, previousSupport.surfaceY));
                const minimumDifference = 36;
                if (Math.abs(offset - previousOffset) < minimumDifference) {
                    const flipped = -Math.sign(offset || 1) * Math.max(minimumMagnitude, Math.abs(offset));
                    offset = Math.abs(flipped - previousOffset) >= minimumDifference
                        ? flipped
                        : previousOffset + (previousOffset >= 0 ? -minimumDifference : minimumDifference);
                }
            }
            offset = clamp(offset, -56, 56);
            moveSupportSurface(support, node.y + offset);
            support.routeOffsetY = roundCoordinate(support.surfaceY - node.y);
            support.platformHeightStyle = "organicAnchor";
        }
    

    if (!useRunAndGunRoute) {
        for (const edge of edges.filter((candidate) => candidate.mandatory !== false
            && (candidate.intendedDirection === "left" || candidate.intendedDirection === "right"))) {
            const fromNode = nodeById.get(edge.from);
            const toNode = nodeById.get(edge.to);
            const fromSupport = nodeSupport.get(edge.from);
            const toSupport = nodeSupport.get(edge.to);
            if (!fromNode || !toNode || !fromSupport || !toSupport) continue;
            const endpointPair = fromNode.kind === "entrance" || fromNode.kind === "exit" || toNode.kind === "entrance" || toNode.kind === "exit";
            if (!endpointPair) continue;
            const direction = Math.sign(toSupport.centerX - fromSupport.centerX) || 1;
            const desiredDistance = fromSupport.width * 0.5 + toSupport.width * 0.5 + 430;
            const currentDistance = Math.abs(toSupport.centerX - fromSupport.centerX);
            if (currentDistance >= desiredDistance) continue;
            const movable = fromNode.kind === "entrance" || fromNode.kind === "exit" ? toSupport : fromSupport;
            const movableDirection = movable === toSupport ? direction : -direction;
            moveSupportCenter(movable, movable.centerX + movableDirection * (desiredDistance - currentDistance));
            movable.routeOffsetX = roundCoordinate(movable.centerX - finiteNumber(nodeById.get(movable.routeNodeId)?.x, movable.centerX));
        }
    }

    if (useRunAndGunRoute) {
        const horizontalDirectionAtSupport = (edge, supportId, incoming) => {
            if (!edge || !["left", "right"].includes(edge.intendedDirection)) return 0;
            const support = nodeSupport.get(supportId);
            const other = nodeSupport.get(incoming ? edge.from : edge.to);
            if (!support || !other) return 0;
            return Math.sign(other.centerX - support.centerX);
        };
        const requiredLiftJunctionGap = theme.traversal.intermediateWidth * 1.02
            + GENERATED_PLAYER_BODY_WIDTH
            + 8;
        for (const edge of edges.filter((candidate) => candidate.mandatory !== false
            && (candidate.intendedDirection === "climb" || candidate.intendedDirection === "descend"))) {
            const startSupport = nodeSupport.get(edge.from);
            const endSupport = nodeSupport.get(edge.to);
            if (!startSupport || !endSupport) continue;
            const incoming = edges.find((candidate) => candidate.mandatory !== false && candidate.to === edge.from);
            const outgoing = edges.find((candidate) => candidate.mandatory !== false && candidate.from === edge.to);
            const incomingOccupiedSide = horizontalDirectionAtSupport(incoming, edge.from, true);
            const outgoingOccupiedSide = horizontalDirectionAtSupport(outgoing, edge.to, false);
            const startFreeSide = incomingOccupiedSide ? -incomingOccupiedSide : 0;
            const endFreeSide = outgoingOccupiedSide ? -outgoingOccupiedSide : 0;
            if (!startFreeSide || !endFreeSide || startFreeSide === endFreeSide) continue;

            const leftSupport = startFreeSide > 0 ? startSupport : endSupport;
            const rightSupport = leftSupport === startSupport ? endSupport : startSupport;
            const currentGap = generatedSupportVisualRect(rightSupport).left - generatedSupportVisualRect(leftSupport).right;
            if (currentGap >= requiredLiftJunctionGap) continue;
            const adjustment = (requiredLiftJunctionGap - currentGap) * 0.5;
            const startProgress = finiteNumber(nodeById.get(edge.from)?.progress, 0);
            const endProgress = finiteNumber(nodeById.get(edge.to)?.progress, startProgress + 1);
            const priorDirection = leftSupport === startSupport ? -1 : 1;
            for (const node of nodes.filter((candidate) => candidate.mandatory !== false)) {
                const support = nodeSupport.get(node.id);
                if (!support) continue;
                const progress = finiteNumber(node.progress, 0);
                let deltaX = 0;
                if (progress <= startProgress) deltaX = priorDirection * adjustment;
                else if (progress >= endProgress) deltaX = -priorDirection * adjustment;
                if (!deltaX) continue;
                moveSupportCenter(support, support.centerX + deltaX);
                support.verticalJunctionOffsetX = roundCoordinate(finiteNumber(support.verticalJunctionOffsetX, 0) + deltaX);
            }
        }
    }

    const transitions = [];

    const buildOrganicHorizontalEdge = (edge) => {
        const startSupport = nodeSupport.get(edge.from);
        const endSupport = nodeSupport.get(edge.to);
        if (!startSupport || !endSupport) return null;
        const distanceX = Math.abs(endSupport.centerX - startSupport.centerX);
        const direction = Math.sign(endSupport.centerX - startSupport.centerX) || 1;
        const shortEdge = distanceX < 520;
        const minimumGap = roundCoordinate(shortEdge
            ? 34 + settings.safety * 6
            : 70
                + settings.safety * 12);
        const maximumGap = roundCoordinate(Math.min(
            theme.traversal.mandatoryGap * 0.84,
            126
        ));
        const standardTargetWidth = theme.traversal.intermediateWidth * rng.range(
            0.86,
            1.22
        );
        const useLongAuthoredPlatform = distanceX >= 520;
        const targetWidth = useLongAuthoredPlatform
            ? Math.min(
                distanceX * rng.range(0.38, 0.62),
                rng.range(720, 1480)
            )
            : standardTargetWidth;
        let selectedIntermediateAssets = null;
        let selectedGaps = null;
        let selectedSurfaces = null;

        const buildVariedSurfaces = (count) => {
            if (count <= 0) return [];
            const riseLimit = theme.traversal.mandatoryRise * 0.96;
            const dropLimit = Math.min(theme.traversal.mandatoryDrop * 0.78, 208);
            const minimumHeightStep = 36;
            let best = null;
            let bestScore = -Infinity;
            const attemptCount = 240;
            for (let attempt = 0; attempt < attemptCount; attempt += 1) {
                const surfaces = [];
                let previous = startSupport.surfaceY;
                let sign = rng.chance(0.5) ? -1 : 1;
                let valid = true;
                for (let index = 1; index <= count; index += 1) {
                    const t = index / (count + 1);
                    const baseline = lerp(startSupport.surfaceY, endSupport.surfaceY, t);
                    const remaining = count + 1 - index;
                    if (rng.chance(0.46)) sign *= -1;
                    const desiredAmplitude = rng.range(
                        46,
                        Math.min(164, theme.traversal.mandatoryDrop * (0.68))
                    );
                    const desired = previous
                        + sign * desiredAmplitude
                        + rng.range(-18, 18);
                    const routeEnvelope = 224;
                    const minimum = Math.max(
                        previous - riseLimit,
                        endSupport.surfaceY - remaining * dropLimit,
                        baseline - routeEnvelope
                    );
                    const maximum = Math.min(
                        previous + dropLimit,
                        endSupport.surfaceY + remaining * riseLimit,
                        baseline + routeEnvelope
                    );
                    if (minimum > maximum) {
                        valid = false;
                        break;
                    }
                    let surface = clamp(desired, minimum, maximum);
                    if (Math.abs(surface - previous) < minimumHeightStep) {
                        const alternatives = [previous - minimumHeightStep, previous + minimumHeightStep]
                            .filter((value) => value >= minimum && value <= maximum)
                            .sort((left, right) => Math.abs(right - baseline) - Math.abs(left - baseline));
                        if (!alternatives.length) {
                            valid = false;
                            break;
                        }
                        surface = alternatives[0];
                    }
                    surfaces.push(roundCoordinate(surface));
                    previous = surface;
                }
                if (!valid) continue;
                const complete = [startSupport.surfaceY, ...surfaces, endSupport.surfaceY];
                for (let index = 1; index < complete.length; index += 1) {
                    const rise = Math.max(0, complete[index - 1] - complete[index]);
                    const drop = Math.max(0, complete[index] - complete[index - 1]);
                    const heightDelta = Math.abs(complete[index] - complete[index - 1]);
                    if (rise > theme.traversal.mandatoryRise || drop > theme.traversal.mandatoryDrop) valid = false;
                    if (heightDelta < minimumHeightStep) valid = false;
                }
                if (!valid) continue;
                const offsets = surfaces.map((surface, index) => Math.abs(surface - lerp(
                    startSupport.surfaceY,
                    endSupport.surfaceY,
                    (index + 1) / (count + 1)
                )));
                const verticalRange = Math.max(...complete) - Math.min(...complete);
                if (verticalRange < (count >= 2 ? 76 : 42)) continue;
                let verticalDirectionChanges = 0;
                let previousSign = 0;
                for (let index = 1; index < complete.length; index += 1) {
                    const currentSign = Math.sign(complete[index] - complete[index - 1]);
                    if (currentSign && previousSign && currentSign !== previousSign) verticalDirectionChanges += 1;
                    if (currentSign) previousSign = currentSign;
                }
                const score = verticalRange * (2.1)
                    + offsets.reduce((sum, value) => sum + value, 0)
                    + verticalDirectionChanges * (48)
                    + rng.range(0, 18);
                if (score > bestScore) {
                    bestScore = score;
                    best = surfaces;
                }
            }
            return best;
        };

        const countCandidates = Array.from({ length: 11 }, (_entry, index) => index);

        for (const count of countCandidates) {
            const gapCount = count + 1;
            const endpointHalfWidth = startSupport.width * 0.5 + endSupport.width * 0.5;
            const maximumIntermediateWidth = count > 0
                ? (distanceX - endpointHalfWidth - minimumGap * gapCount) / count
                : Infinity;
            if (count > 0 && maximumIntermediateWidth < 92) continue;
            const desiredOrdinaryGap = clamp(72 + settings.safety * 8 + rng.range(-8, 12), minimumGap, maximumGap - 4);
            const desiredGapTotal = desiredOrdinaryGap * gapCount;
            const desiredIntermediateWidth = count > 0
                ? (distanceX - endpointHalfWidth - desiredGapTotal) / count
                : 0;
            if (count > 0 && desiredIntermediateWidth < 92) continue;
            const selections = Array.from({ length: count }, (_entry, index) => {
                const requestedWidth = Math.min(maximumIntermediateWidth, desiredIntermediateWidth * rng.range(0.96, 1.04));
                return selectGenerationAsset(
                    assetCatalog,
                    "landingPlatform",
                    requestedWidth,
                    rng,
                    false,
                    maximumIntermediateWidth
                );
            });
            if (selections.some((selection) => !selection)) continue;
            const occupiedWidth = startSupport.width * 0.5
                + endSupport.width * 0.5
                + selections.reduce((sum, selection) => sum + selection.width, 0);
            const totalFree = distanceX - occupiedWidth;
            const widthEntries = [
                { width: startSupport.width, left: startSupport.walkableLeftInset, right: startSupport.walkableRightInset },
                ...selections.map((selection) => ({
                    width: selection.width,
                    left: selection.width * Math.max(selection.asset.walkableLeftInsetRatio, selection.asset.walkableRightInsetRatio),
                    right: selection.width * Math.max(selection.asset.walkableLeftInsetRatio, selection.asset.walkableRightInsetRatio)
                })),
                { width: endSupport.width, left: endSupport.walkableLeftInset, right: endSupport.walkableRightInset }
            ];
            let gaps = null;
            const maximumPhysicalGaps = Array.from({ length: gapCount }, (_entry, index) => Math.max(
                minimumGap,
                Math.min(
                    maximumGap,
                    theme.traversal.mandatoryGap - widthEntries[index].right - widthEntries[index + 1].left - 2
                )
            ));
            const proposed = Array.from({ length: gapCount }, () => minimumGap);
            let remaining = totalFree - proposed.reduce((sum, value) => sum + value, 0);
            const maximumTotal = maximumPhysicalGaps.reduce((sum, value) => sum + value, 0);
            if (remaining >= -0.01 && totalFree <= maximumTotal + 0.05) {
                const allocationOrder = rng.shuffle(proposed.map((_value, index) => index));
                while (remaining > 0.01) {
                    let allocated = false;
                    for (const index of allocationOrder) {
                        if (remaining <= 0.01) break;
                        const capacity = Math.max(0, maximumPhysicalGaps[index] - proposed[index]);
                        if (capacity <= 0.01) continue;
                        const openCount = allocationOrder.filter((candidateIndex) => maximumPhysicalGaps[candidateIndex] - proposed[candidateIndex] > 0.01).length;
                        const amount = Math.min(capacity, Math.max(0.01, remaining / Math.max(1, openCount)), remaining);
                        proposed[index] += amount;
                        remaining -= amount;
                        allocated = true;
                    }
                    if (!allocated) break;
                }
                if (remaining <= 0.05) gaps = proposed.map(roundCoordinate);
            }
            if (!gaps) continue;
            const walkableGapsValid = gaps.every((gap, index) => (
                gap + widthEntries[index].right + widthEntries[index + 1].left
            ) <= theme.traversal.mandatoryGap - 0.5);
            if (!walkableGapsValid) continue;
            const surfaces = buildVariedSurfaces(count);
            if (count > 0 && !surfaces) continue;
            if (count === 0 && Math.abs(endSupport.surfaceY - startSupport.surfaceY) < 32) continue;
            selectedIntermediateAssets = selections;
            selectedGaps = gaps;
            selectedSurfaces = surfaces;
            break;
        }

        if (!selectedIntermediateAssets || !selectedGaps) return null;
        const intermediate = [];
        const amplitude = Math.min(68, theme.traversal.mandatoryRise * 0.58) * rng.range(0.72, 1);
        const arcDirection = rng.chance(0.5) ? -1 : 1;
        for (let index = 1; index <= selectedIntermediateAssets.length; index += 1) {
            const t = index / (selectedIntermediateAssets.length + 1);
            const primaryWave = Math.sin(Math.PI * t) * amplitude * arcDirection;
            const secondaryWave = Math.sin(Math.PI * 2 * t) * amplitude * rng.range(-0.18, 0.18);
            const abstractStartY = finiteNumber(nodeById.get(edge.from)?.y, startSupport.surfaceY);
            const abstractEndY = finiteNumber(nodeById.get(edge.to)?.y, endSupport.surfaceY);
            const routeSurfaceY = lerp(abstractStartY, abstractEndY, t);
            const surfaceY = selectedSurfaces?.[index - 1] ?? routeSurfaceY + primaryWave + secondaryWave;
            const support = addSupport({
                id: `support_${edge.id}_spaced_${String(index).padStart(2, "0")}`,
                role: "landingPlatform",
                targetWidth,
                selection: selectedIntermediateAssets[index - 1],
                centerX: lerp(startSupport.centerX, endSupport.centerX, t),
                surfaceY,
                mandatory: true,
                routeEdgeId: edge.id
            });
            support.routeOffsetY = roundCoordinate(support.surfaceY - routeSurfaceY);
            support.platformSpacingStyle = "organicUpperRoute";
            support.platformHeightStyle = "organicStep";
            intermediate.push(support);
        }

        let cursor = startSupport.centerX + direction * startSupport.width * 0.5;
        for (let index = 0; index < intermediate.length; index += 1) {
            const support = intermediate[index];
            cursor += direction * (selectedGaps[index] + support.width * 0.5);
            moveSupportCenter(support, cursor);
            cursor += direction * support.width * 0.5;
        }
        const chain = [startSupport, ...intermediate, endSupport];
        const edgeTransitions = [];
        for (let index = 1; index < chain.length; index += 1) {
            const transition = classifyTraversalTransition(chain[index - 1], chain[index], edge, theme);
            transition.routeEdgeDirection = edge.intendedDirection;
            transition.spacingStyle = "organicUpperRoute";
            if (Math.abs(chain[index].surfaceY - chain[index - 1].surfaceY) < 32) {
                throw new Error(`Horizontal edge “${edge.id}” places adjacent platforms too close to the same height.`);
            }
            if (!transition.valid) throw new Error(`Horizontal edge “${edge.id}” failed its spaced jump sequence between ${chain[index - 1].id} and ${chain[index].id}: gap ${transition.gap}, rise ${transition.rise}, drop ${transition.drop}, exposed ${transition.exposedLandingWidth}.`);
            edgeTransitions.push(transition);
        }
        edgeSupportIds.set(edge.id, intermediate.map((support) => support.id));
        transitions.push(...edgeTransitions);
        mandatoryEdgeChains.set(edge.id, chain);
        return chain;
    };

    const buildRunAndGunHorizontalEdge = (edge) => {
        const startSupport = nodeSupport.get(edge.from);
        const endSupport = nodeSupport.get(edge.to);
        if (!startSupport || !endSupport) return null;
        const direction = Math.sign(endSupport.centerX - startSupport.centerX) || 1;
        const startEdgeX = direction > 0 ? startSupport.walkableRightX : startSupport.walkableLeftX;
        const endEdgeX = direction > 0 ? endSupport.walkableLeftX : endSupport.walkableRightX;
        const span = Math.max(0, direction * (endEdgeX - startEdgeX));
        const overlap = roundCoordinate(rng.range(112, 148));
        if (span <= overlap) {
            const transition = classifyTraversalTransition(startSupport, endSupport, edge, theme);
            if (!transition.valid) return null;
            transition.routeEdgeDirection = edge.intendedDirection;
            transition.spacingStyle = "runAndGunGround";
            startSupport.runAndGunGround = true;
            endSupport.runAndGunGround = true;
            edgeSupportIds.set(edge.id, []);
            transitions.push(transition);
            const chain = [startSupport, endSupport];
            mandatoryEdgeChains.set(edge.id, chain);
            return chain;
        }

        const intermediate = [];
        let previousEdgeX = startEdgeX;
        for (let index = 0; index < 14; index += 1) {
            const remaining = direction * (endEdgeX - previousEdgeX);
            if (remaining <= -18) break;
            const requestedWidth = clamp(remaining + overlap * 1.4, 300, 1180);
            const maximumWidth = Math.max(340, Math.min(1500, remaining + overlap + 520));
            let selection = selectGenerationAsset(assetCatalog, "runAndGunGround", requestedWidth, rng, false, maximumWidth, { collisionMode: "blockable" });
            if (!selection) selection = selectGenerationAsset(assetCatalog, "runAndGunGround", 1040, rng, false, Infinity, { collisionMode: "blockable" });
            if (!selection) break;
            const estimatedProgress = clamp((direction * (previousEdgeX - startEdgeX) + selection.width * 0.5) / Math.max(1, span), 0.08, 0.94);
            const baselineY = lerp(startSupport.surfaceY, endSupport.surfaceY, estimatedProgress);
            const stepOffset = 0;
            const support = addSupport({
                id: `support_${edge.id}_ground_${String(index + 1).padStart(2, "0")}`,
                role: "runAndGunGround",
                targetWidth: selection.width,
                selection,
                centerX: lerp(startSupport.centerX, endSupport.centerX, estimatedProgress),
                surfaceY: baselineY + stepOffset,
                mandatory: true,
                routeEdgeId: edge.id
            });
            const desiredNearWalkableEdge = previousEdgeX - direction * overlap;
            const centerX = direction > 0
                ? desiredNearWalkableEdge + support.width * 0.5 - support.walkableLeftInset
                : desiredNearWalkableEdge - support.width * 0.5 + support.walkableRightInset;
            moveSupportCenter(support, centerX);
            support.routeOffsetY = roundCoordinate(support.surfaceY - baselineY);
            support.platformSpacingStyle = "runAndGunGround";
            support.runAndGunGround = true;
            const nextEdgeX = direction > 0 ? support.walkableRightX : support.walkableLeftX;
            if (direction * (nextEdgeX - previousEdgeX) < 80) {
                const placement = placements.find((candidate) => candidate.id === support.placementId);
                supports.splice(supports.indexOf(support), 1);
                if (placement) placements.splice(placements.indexOf(placement), 1);
                break;
            }
            intermediate.push(support);
            previousEdgeX = nextEdgeX;
        }

        const finalOverlap = direction > 0
            ? previousEdgeX - endSupport.walkableLeftX
            : endSupport.walkableRightX - previousEdgeX;
        if (finalOverlap < 72 || !intermediate.length) {
            for (const support of intermediate) {
                const placement = placements.find((candidate) => candidate.id === support.placementId);
                supports.splice(supports.indexOf(support), 1);
                if (placement) placements.splice(placements.indexOf(placement), 1);
            }
            return null;
        }
        const chain = [startSupport, ...intermediate, endSupport];
        startSupport.runAndGunGround = true;
        endSupport.runAndGunGround = true;
        const edgeTransitions = [];
        for (let index = 1; index < chain.length; index += 1) {
            const transition = classifyTraversalTransition(chain[index - 1], chain[index], edge, theme);
            transition.routeEdgeDirection = edge.intendedDirection;
            transition.spacingStyle = "runAndGunGround";
            if (!transition.valid) {
                for (const support of intermediate) {
                    const placement = placements.find((candidate) => candidate.id === support.placementId);
                    supports.splice(supports.indexOf(support), 1);
                    if (placement) placements.splice(placements.indexOf(placement), 1);
                }
                return null;
            }
            edgeTransitions.push(transition);
        }
        edgeSupportIds.set(edge.id, intermediate.map((support) => support.id));
        transitions.push(...edgeTransitions);
        mandatoryEdgeChains.set(edge.id, chain);
        return chain;
    };

    const buildStaticVerticalEdge = (edge, { mandatory = true, side = 1, verticalTraversalStyle = "platforms" } = {}) => {
        const startSupport = nodeSupport.get(edge.from);
        const endSupport = nodeSupport.get(edge.to);
        if (!startSupport || !endSupport) throw new Error(`Vertical edge “${edge.id}” is missing a landing support.`);
        const verticalSpan = Math.abs(endSupport.surfaceY - startSupport.surfaceY);
        const minimumTransitions = Math.max(2, Math.ceil(verticalSpan / theme.traversal.mandatoryRise));
        const maximumTransitions = Math.max(minimumTransitions, Math.floor(verticalSpan / 90));
        let transitionCount = minimumTransitions % 2 === 0 ? minimumTransitions : minimumTransitions + 1;
        if (transitionCount > maximumTransitions) transitionCount = maximumTransitions % 2 === 0 ? maximumTransitions : maximumTransitions - 1;
        if (transitionCount < minimumTransitions || transitionCount < 2 || transitionCount % 2 !== 0) {
            throw new Error(`Vertical edge “${edge.id}” cannot fit a green-platform switchback within the jump envelope.`);
        }
        const intermediateCount = transitionCount - 1;
        const selections = [];
        for (let index = 0; index < intermediateCount; index += 1) {
            const targetWidth = rng.range(232, 286);
            const selection = selectGenerationAsset(
                assetCatalog,
                "landingPlatform",
                targetWidth,
                rng,
                false,
                320,
                { collisionMode: "oneWay" }
            );
            if (!selection) throw new Error(`Vertical edge “${edge.id}” cannot find a green one-way climbing platform.`);
            selections.push(selection);
        }
        const baseCenterX = roundCoordinate((startSupport.centerX + endSupport.centerX) * 0.5);
        const selectionWalkableBounds = (selection, centerX) => ({
            left: centerX - selection.width * 0.5 + selection.width * selection.asset.walkableLeftInsetRatio,
            right: centerX + selection.width * 0.5 - selection.width * selection.asset.walkableRightInsetRatio
        });
        const supportWalkableBounds = (support) => ({
            left: finiteNumber(support.walkableLeftX, support.centerX - support.width * 0.5),
            right: finiteNumber(support.walkableRightX, support.centerX + support.width * 0.5)
        });
        const innerBoundsForStep = (stepIndex) => {
            if (stepIndex <= 0) return supportWalkableBounds(startSupport);
            if (stepIndex >= transitionCount) return supportWalkableBounds(endSupport);
            return selectionWalkableBounds(selections[stepIndex - 1], baseCenterX);
        };
        const staticSupports = [];
        const gap = roundCoordinate(rng.range(46, 62));
        for (let stepIndex = 1; stepIndex < transitionCount; stepIndex += 1) {
            const selection = selections[stepIndex - 1];
            const outerColumn = stepIndex % 2 === 1;
            let centerX = baseCenterX;
            if (outerColumn) {
                const previousInner = innerBoundsForStep(stepIndex - 1);
                const nextInner = innerBoundsForStep(stepIndex + 1);
                if (side > 0) {
                    const desiredLeft = Math.max(previousInner.right, nextInner.right) + gap;
                    centerX = desiredLeft + selection.width * 0.5 - selection.width * selection.asset.walkableLeftInsetRatio;
                } else {
                    const desiredRight = Math.min(previousInner.left, nextInner.left) - gap;
                    centerX = desiredRight - selection.width * 0.5 + selection.width * selection.asset.walkableRightInsetRatio;
                }
            }
            const surfaceY = lerp(startSupport.surfaceY, endSupport.surfaceY, stepIndex / transitionCount);
            const support = addSupport({
                id: `support_${edge.id}_green_${String(stepIndex).padStart(2, "0")}`,
                role: "landingPlatform",
                targetWidth: selection.width,
                maximumWidth: 320,
                selection,
                centerX,
                surfaceY,
                mandatory,
                routeEdgeId: edge.id,
                requiredCollisionMode: "oneWay",
                mirrorX: false
            });
            support.verticalClimbPlatform = true;
            support.verticalTraversalStyle = verticalTraversalStyle;
            support.platformSpacingStyle = mandatory ? "risingSnakeGreenClimb" : "risingSnakeMixedGreenAlternative";
            const placement = placements.find((candidate) => candidate.id === support.placementId);
            if (placement) {
                placement.generationRole = "verticalGreenPlatform";
                placement.verticalTraversalStyle = verticalTraversalStyle;
            }
            staticSupports.push(support);
        }
        const chain = [startSupport, ...staticSupports, endSupport];
        const edgeSpec = mandatory ? edge : { ...edge, mandatory: false };
        const edgeTransitions = [];
        for (let index = 1; index < chain.length; index += 1) {
            const transition = classifyTraversalTransition(chain[index - 1], chain[index], edgeSpec, theme);
            transition.spacingStyle = mandatory ? "risingSnakeGreenClimb" : "risingSnakeMixedGreenAlternative";
            transition.verticalPlatformClimb = true;
            transition.verticalTraversalStyle = verticalTraversalStyle;
            if (!transition.valid) {
                throw new Error(`Vertical edge “${edge.id}” green-platform climb is not traversable between ${chain[index - 1].id} and ${chain[index].id} (gap ${transition.gap}, rise ${transition.rise}, drop ${transition.drop}).`);
            }
            edgeTransitions.push(transition);
        }
        transitions.push(...edgeTransitions);
        if (mandatory) {
            edgeSupportIds.set(edge.id, staticSupports.map((support) => support.id));
            mandatoryEdgeChains.set(edge.id, chain);
        }
        return chain;
    };

    const buildMovingVerticalEdge = (edge, verticalTraversalStyle = "elevator") => {
        const startSupport = nodeSupport.get(edge.from);
        const endSupport = nodeSupport.get(edge.to);
        if (!startSupport || !endSupport) throw new Error(`Vertical edge “${edge.id}” is missing a landing support.`);
        const selection = selectGenerationAsset(
            assetCatalog,
            "movingPlatform",
            theme.traversal.intermediateWidth * 0.86,
            rng,
            false,
            theme.traversal.intermediateWidth * 1.02
        );
        if (!selection) throw new Error(`Vertical edge “${edge.id}” cannot find a moving-platform asset.`);
        const preferredSide = movingVerticalEdgeCount % 2 === 0 ? 1 : -1;
        movingVerticalEdgeCount += 1;
        const support = addSupport({
            id: `support_${edge.id}_moving`,
            role: "landingPlatform",
            targetWidth: theme.traversal.intermediateWidth * 0.86,
            selection,
            centerX: startSupport.centerX,
            surfaceY: startSupport.surfaceY,
            mandatory: true,
            routeEdgeId: edge.id
        });
        let chosenCenterX = null;
        let chosenShaft = null;
        if (!useRunAndGunRoute) {
            const boardingGap = roundCoordinate(rng.range(38, 62));
            const centerX = preferredSide > 0
                ? Math.min(startSupport.walkableRightX, endSupport.walkableRightX) + boardingGap + support.width * 0.5 - support.walkableLeftInset
                : Math.max(startSupport.walkableLeftX, endSupport.walkableLeftX) - boardingGap - (support.width * 0.5 - support.walkableRightInset);
            moveSupportCenter(support, centerX);
            chosenCenterX = support.centerX;
        } else {
            const movement = {
                endOffsetX: 0,
                endOffsetY: roundCoordinate(endSupport.surfaceY - startSupport.surfaceY)
            };
            const candidateCenters = [];
            const startVisual = generatedSupportVisualRect(startSupport);
            const endVisual = generatedSupportVisualRect(endSupport);
            if (startVisual.left > endVisual.right) candidateCenters.push((startVisual.left + endVisual.right) * 0.5);
            if (endVisual.left > startVisual.right) candidateCenters.push((endVisual.left + startVisual.right) * 0.5);
            for (const side of [preferredSide, -preferredSide]) {
                const sharedAnchor = side > 0
                    ? Math.min(startSupport.walkableRightX, endSupport.walkableRightX) + support.width * 0.5 - support.walkableLeftInset
                    : Math.max(startSupport.walkableLeftX, endSupport.walkableLeftX) - (support.width * 0.5 - support.walkableRightInset);
                for (const gap of [38, 54, 72, 92, 116, 142, 170, 202, 238, 286]) {
                    candidateCenters.push(sharedAnchor + side * gap);
                }
            }
            for (const centerX of [...new Set(candidateCenters.map((value) => roundCoordinate(value)))]) {
                moveSupportCenter(support, centerX);
                const platformAtEnd = { ...support, surfaceY: endSupport.surfaceY };
                const board = classifyTraversalTransition(startSupport, support, edge, theme);
                const exit = classifyTraversalTransition(platformAtEnd, endSupport, edge, theme);
                if (!board.valid || !exit.valid
                    || board.gap > theme.traversal.mandatoryGap
                    || exit.gap > theme.traversal.mandatoryGap) continue;
                const riderEnvelope = generatedMovingPlatformRiderEnvelope(support, movement);
                if (generatedMovingPlatformCrushHazards({ support, movement, supports }).length) continue;
                if (movingShaftReservations.some((shaft) => rectanglesOverlapWithArea(riderEnvelope, shaft, 4))) continue;
                const visualSweep = generatedMovingPlatformVisualSweepRect(support, movement);
                const crossesOneWay = supports.some((other) => other.id !== support.id
                    && !other.moving
                    && other.collisionMode === "oneWay"
                    && rectanglesOverlapWithArea(visualSweep, generatedSupportVisualRect(other), 1));
                if (crossesOneWay) continue;
                chosenCenterX = support.centerX;
                chosenShaft = riderEnvelope;
                break;
            }
            if (!Number.isFinite(chosenCenterX) || !chosenShaft) {
                const placement = placements.find((candidate) => candidate.id === support.placementId);
                supports.splice(supports.indexOf(support), 1);
                if (placement) placements.splice(placements.indexOf(placement), 1);
                throw new Error(`Vertical edge “${edge.id}” cannot reserve a rider-safe moving-platform shaft clear of blockable geometry.`);
            }
            moveSupportCenter(support, chosenCenterX);
            support.movementShaft = {
                left: roundCoordinate(chosenShaft.left),
                right: roundCoordinate(chosenShaft.right),
                top: roundCoordinate(chosenShaft.top),
                bottom: roundCoordinate(chosenShaft.bottom)
            };
            support.strictShaftClearance = true;
            movingShaftReservations.push({ ...support.movementShaft, supportId: support.id, startSupportId: startSupport.id, endSupportId: endSupport.id });
        }
        support.moving = true;
        support.movementAxis = "vertical";
        support.verticalTraversalStyle = verticalTraversalStyle;
        support.movementStartSupportId = startSupport.id;
        support.movementEndSupportId = endSupport.id;
        support.movementDistance = roundCoordinate(endSupport.surfaceY - startSupport.surfaceY);
        support.platformSpacingStyle = "movingShaft";
        support.movingVisualStyle = "thinOnly";

        const placement = placements.find((candidate) => candidate.id === support.placementId);
        if (!placement) throw new Error(`Vertical edge “${edge.id}” lost its moving-platform placement.`);
        placement.movement = {
            version: 1,
            pattern: "shuttle",
            activation: "automatic",
            endOffsetX: 0,
            endOffsetY: roundCoordinate(endSupport.surfaceY - startSupport.surfaceY),
            speed: roundCoordinate(clamp(Math.abs(endSupport.surfaceY - startSupport.surfaceY) * 0.34, 126, 215)),
            initialDelay: roundCoordinate(rng.range(0, 0.5)),
            triggerDelay: 0,
            startPause: roundCoordinate(rng.range(0.55, 0.9)),
            endPause: roundCoordinate(rng.range(0.55, 0.9)),
            fadeDuration: 0.2,
            hiddenDuration: 1.25
        };
        placement.generationRole = "verticalMovingPlatform";
        placement.routeEdgeDirection = edge.intendedDirection;
        placement.verticalTraversalStyle = verticalTraversalStyle;
        if (support.movementShaft) {
            placement.movementShaft = { ...support.movementShaft };
            placement.movementSafetyEnvelope = { ...support.movementShaft };
        }

        const platformAtEnd = {
            ...support,
            centerX: support.centerX,
            surfaceY: endSupport.surfaceY,
            walkableLeftX: support.walkableLeftX,
            walkableRightX: support.walkableRightX
        };
        const boardTransition = classifyTraversalTransition(startSupport, support, edge, theme);
        const exitTransition = classifyTraversalTransition(platformAtEnd, endSupport, edge, theme);
        for (const [transition, endpoint] of [[boardTransition, "start"], [exitTransition, "end"]]) {
            transition.routeEdgeDirection = edge.intendedDirection;
            transition.movingPlatformTransfer = true;
            transition.movingPlatformId = support.id;
            transition.platformEndpoint = endpoint;
            transition.traversalClass = "movingPlatformBoard";
            if (!transition.valid) throw new Error(`Vertical edge “${edge.id}” moving platform cannot be boarded safely at its ${endpoint} endpoint.`);
        }
        edgeSupportIds.set(edge.id, [support.id]);
        transitions.push(boardTransition, exitTransition);
        const chain = [startSupport, support, endSupport];
        mandatoryEdgeChains.set(edge.id, chain);
        return chain;
    };

    const processEdge = (edge) => {
        if (edge.intendedDirection === "climb" || edge.intendedDirection === "descend") {
            if (useRisingSnakeRoute) {
                const verticalTraversalStyle = verticalTraversalStyles.get(edge.id) || "elevator";
                if (verticalTraversalStyle === "platforms") {
                    const side = movingVerticalEdgeCount % 2 === 0 ? 1 : -1;
                    movingVerticalEdgeCount += 1;
                    return buildStaticVerticalEdge(edge, { mandatory: true, side, verticalTraversalStyle });
                }
                if (verticalTraversalStyle === "mix") {
                    const movingChain = buildMovingVerticalEdge(edge, verticalTraversalStyle);
                    const movingSupport = movingChain[1];
                    const baseCenterX = (nodeSupport.get(edge.from)?.centerX + nodeSupport.get(edge.to)?.centerX) * 0.5;
                    const side = movingSupport?.centerX >= baseCenterX ? -1 : 1;
                    buildStaticVerticalEdge(edge, { mandatory: false, side, verticalTraversalStyle });
                    return movingChain;
                }
                return buildMovingVerticalEdge(edge, verticalTraversalStyle);
            }
            return buildMovingVerticalEdge(edge);
        }
        if (edge.intendedDirection === "left" || edge.intendedDirection === "right") {
            if (useRunAndGunRoute) {
                const groundChain = buildRunAndGunHorizontalEdge(edge);
                if (groundChain) return groundChain;
                throw new Error(`Horizontal route edge “${edge.id}” could not realize a continuous run-and-gun ground path.`);
            }
            const spacedChain = buildOrganicHorizontalEdge(edge);
            if (spacedChain) return spacedChain;
            throw new Error(`Horizontal route edge “${edge.id}” could not realize the required organic jump sequence (distance ${roundCoordinate(Math.abs((nodeSupport.get(edge.to)?.centerX || 0) - (nodeSupport.get(edge.from)?.centerX || 0)))}, widths ${roundCoordinate(nodeSupport.get(edge.from)?.width || 0)}/${roundCoordinate(nodeSupport.get(edge.to)?.width || 0)}, surfaces ${roundCoordinate(nodeSupport.get(edge.from)?.surfaceY || 0)}/${roundCoordinate(nodeSupport.get(edge.to)?.surfaceY || 0)}).`);
        }
        throw new Error(`Mandatory route edge “${edge.id}” has unsupported direction “${edge.intendedDirection}”.`);
    };

    if (useRunAndGunRoute) {
        const verticalEdge = (edge) => edge.intendedDirection === "climb" || edge.intendedDirection === "descend";
        for (const edge of edges.filter((candidate) => !verticalEdge(candidate))) processEdge(edge);
        for (const edge of edges.filter(verticalEdge)) processEdge(edge);
    } else {
        for (const edge of edges) processEdge(edge);
    }

    const secondaryPlatforms = [];
    const upperAccessPlatforms = [];
    const wideUpperCavern = implementations.cavern === "wide-upper-contour-cavern-v1";

    const placementRectForSelection = (selection, centerX, surfaceY) => ({
        left: centerX - selection.width * 0.5,
        right: centerX + selection.width * 0.5,
        top: surfaceY - selection.height * selection.asset.surfaceYRatio,
        bottom: surfaceY + selection.height * (1 - selection.asset.surfaceYRatio)
    });
    const rectIntersects = (a, b, margin = 0) => (
        Math.min(a.right - margin, b.right - margin) - Math.max(a.left + margin, b.left + margin) > 0
        && Math.min(a.bottom - margin, b.bottom - margin) - Math.max(a.top + margin, b.top + margin) > 0
    );
    const secondaryPlacementConflicts = (selection, centerX, surfaceY, parent) => {
        const candidate = placementRectForSelection(selection, centerX, surfaceY);
        for (const shaft of movingShaftReservations) {
            if (rectIntersects(candidate, shaft, 2)) return true;
        }
        for (const other of supports) {
            if (other.id === parent.id) continue;
            const otherRect = {
                left: other.centerX - other.width * 0.5,
                right: other.centerX + other.width * 0.5,
                top: other.surfaceY - other.height * other.surfaceYRatio,
                bottom: other.surfaceY + other.height * (1 - other.surfaceYRatio)
            };
            const overlapX = Math.min(candidate.right, otherRect.right) - Math.max(candidate.left, otherRect.left);
            if (overlapX <= 24) continue;
            const surfaceSeparation = Math.abs(surfaceY - other.surfaceY);
            if (surfaceSeparation > 1 && surfaceSeparation < GENERATED_MINIMUM_VERTICAL_PLATFORM_SEPARATION) return true;
            if (rectIntersects(candidate, otherRect, selection.asset.collisionMode === "oneWay" ? 6 : 24)) return true;
            if (!useRunAndGunRoute) {
                const clearance = candidate.bottom <= otherRect.top
                    ? otherRect.top - candidate.bottom
                    : candidate.top - otherRect.bottom;
                if (clearance < GENERATED_STATIC_HEADROOM) return true;
            }
        }
        return false;
    };
    const addSecondaryPlatform = ({ parent, selection, centerX, surfaceY, combatPerch, powerUpPerch = false, tier = 1 }) => {
        const support = addSupport({
            id: `support_secondary_${String(secondaryPlatforms.length + 1).padStart(2, "0")}_${parent.id}`,
            role: "landingPlatform",
            targetWidth: selection.width,
            selection,
            centerX,
            surfaceY,
            mandatory: false,
            routeNodeId: parent.routeNodeId,
            routeEdgeId: parent.routeEdgeId
        });
        support.role = "secondaryPlatform";
        support.secondaryPlatform = true;
        support.combatPerch = combatPerch;
        support.rewardPerch = !combatPerch;
        support.powerUpPerch = !combatPerch && Boolean(powerUpPerch);
        support.parentSupportId = parent.id;
        support.groundParentSupportId = parent.groundParentSupportId || parent.parentSupportId || parent.id;
        support.accessSupportId = parent.upperAccessPlatform ? parent.id : undefined;
        support.secondaryTier = tier;
        support.platformSpacingStyle = combatPerch
            ? "detachedSecondaryCombatPerch"
            : support.powerUpPerch
                ? "detachedSecondaryPowerUpPerch"
                : "detachedSecondaryRewardPerch";
        const placement = placements.find((candidate) => candidate.id === support.placementId);
        if (placement) {
            placement.generationRole = "secondaryPlatform";
            placement.parentSupportId = parent.id;
            placement.secondaryTier = tier;
            placement.rewardPerch = support.rewardPerch;
            placement.combatPerch = support.combatPerch;
            placement.powerUpPerch = support.powerUpPerch;
        }
        const edgeId = tier === 1 ? `secondary_${parent.id}` : `secondary_tier_${tier}_${parent.id}`;
        const up = classifyTraversalTransition(parent, support, { id: edgeId, mandatory: false }, theme);
        const down = classifyTraversalTransition(support, parent, { id: edgeId, mandatory: false }, theme);
        if (!up.valid || !down.valid || up.gap > theme.traversal.mandatoryGap || down.gap > theme.traversal.mandatoryGap) {
            supports.splice(supports.indexOf(support), 1);
            if (placement) placements.splice(placements.indexOf(placement), 1);
            return null;
        }
        for (const transition of [up, down]) {
            transition.mandatory = false;
            transition.spacingStyle = support.platformSpacingStyle;
            transition.secondaryPlatformId = support.id;
            transition.parentSupportId = parent.id;
            transition.secondaryTier = tier;
        }
        transitions.push(up, down);
        secondaryPlatforms.push(support);
        return support;
    };
    const removeOptionalSupport = (support) => {
        if (!support) return;
        const supportIndex = supports.indexOf(support);
        if (supportIndex >= 0) supports.splice(supportIndex, 1);
        const placement = placements.find((candidate) => candidate.id === support.placementId);
        if (placement) placements.splice(placements.indexOf(placement), 1);
        for (let index = transitions.length - 1; index >= 0; index -= 1) {
            if (transitions[index].fromSupportId === support.id || transitions[index].toSupportId === support.id) {
                transitions.splice(index, 1);
            }
        }
        const accessIndex = upperAccessPlatforms.indexOf(support);
        if (accessIndex >= 0) upperAccessPlatforms.splice(accessIndex, 1);
    };
    const addUpperAccessPlatform = ({ parent, selection, centerX, surfaceY }) => {
        const support = addSupport({
            id: `support_upper_access_${String(upperAccessPlatforms.length + 1).padStart(2, "0")}_${parent.id}`,
            role: "landingPlatform",
            targetWidth: selection.width,
            selection,
            centerX,
            surfaceY,
            mandatory: false,
            routeNodeId: parent.routeNodeId,
            routeEdgeId: parent.routeEdgeId
        });
        support.role = "upperAccessPlatform";
        support.upperAccessPlatform = true;
        support.parentSupportId = parent.id;
        support.groundParentSupportId = parent.groundParentSupportId || parent.id;
        support.platformSpacingStyle = "upperLaneAccessStep";
        const placement = placements.find((candidate) => candidate.id === support.placementId);
        if (placement) {
            placement.generationRole = "upperAccessPlatform";
            placement.parentSupportId = parent.id;
            placement.groundParentSupportId = support.groundParentSupportId;
        }
        const edgeId = `upper_access_${parent.id}_${upperAccessPlatforms.length + 1}`;
        const up = classifyTraversalTransition(parent, support, { id: edgeId, mandatory: false }, theme);
        const down = classifyTraversalTransition(support, parent, { id: edgeId, mandatory: false }, theme);
        if (!up.valid || !down.valid || up.gap > theme.traversal.mandatoryGap || down.gap > theme.traversal.mandatoryGap) {
            removeOptionalSupport(support);
            return null;
        }
        for (const transition of [up, down]) {
            transition.mandatory = false;
            transition.spacingStyle = "upperLaneAccessStep";
            transition.upperAccessPlatformId = support.id;
            transition.parentSupportId = parent.id;
        }
        transitions.push(up, down);
        upperAccessPlatforms.push(support);
        return support;
    };

    if (useRunAndGunRoute) {
        const groundParents = supports
            .filter((support) => support.role === "runAndGunGround" && !support.moving && support.walkableWidth >= 300)
            .sort((left, right) => left.centerX - right.centerX);
        const routeLeft = Math.min(...groundParents.map((support) => support.walkableLeftX));
        const routeRight = Math.max(...groundParents.map((support) => support.walkableRightX));
        const routeSpan = Math.max(1, routeRight - routeLeft);
        const targetCoverage = routeSpan * 0.36;
        const desiredCount = Math.max(
            settings.length === "grand" ? 12 : settings.length === "extended" ? 9 : settings.length === "standard" ? 7 : 4,
            Math.ceil(targetCoverage / 470)
        );
        const targetPositions = Array.from({ length: desiredCount }, (_, index) => (
            routeLeft + routeSpan * ((index + 0.5) / desiredCount)
        ));
        const usedParents = new Set();
        const upperSpans = [];
        const coveredWidth = () => {
            if (!upperSpans.length) return 0;
            const spans = [...upperSpans].sort((a, b) => a.left - b.left);
            let total = 0;
            let active = { ...spans[0] };
            for (const span of spans.slice(1)) {
                if (span.left <= active.right) active.right = Math.max(active.right, span.right);
                else {
                    total += active.right - active.left;
                    active = { ...span };
                }
            }
            return total + active.right - active.left;
        };
        for (let pass = 0; pass < 3 && coveredWidth() < targetCoverage; pass += 1) {
            for (const targetX of targetPositions) {
                if (coveredWidth() >= targetCoverage) break;
                const parentCandidates = groundParents
                    .filter((parent) => !usedParents.has(parent.id) || pass > 0)
                    .sort((left, right) => Math.abs(left.centerX - targetX) - Math.abs(right.centerX - targetX));
                let placed = false;
                for (const parent of parentCandidates.slice(0, 8)) {
                    const branchRole = secondaryPlatforms.length % 4;
                    const combatPerch = branchRole === 0 || branchRole === 2;
                    const powerUpPerch = branchRole === 3;
                    const targetWidth = combatPerch
                        ? clamp(parent.walkableWidth * rng.range(0.48, 0.66), 380, 620)
                        : clamp(parent.walkableWidth * rng.range(0.34, 0.5), 260, 480);
                    const maximumWidth = combatPerch ? 660 : 520;
                    const selection = selectGenerationAsset(assetCatalog, "landingPlatform", targetWidth, rng, false, maximumWidth, { collisionMode: "oneWay" });
                    if (!selection) continue;
                    const accessSelection = selectGenerationAsset(
                        assetCatalog,
                        "landingPlatform",
                        clamp(selection.width * 0.48, 250, 360),
                        rng,
                        false,
                        420,
                        { collisionMode: "oneWay" }
                    );
                    if (!accessSelection) continue;
                    const accessRise = GENERATED_MINIMUM_VERTICAL_PLATFORM_SEPARATION;
                    const upperStepRise = GENERATED_MINIMUM_VERTICAL_PLATFORM_SEPARATION;
                    const accessSurfaceY = roundCoordinate(parent.surfaceY - accessRise);
                    const surfaceY = roundCoordinate(accessSurfaceY - upperStepRise);
                    const halfWalkable = Math.max(1, selection.width * 0.5 - selection.width * selection.asset.walkableLeftInsetRatio);
                    const minimumCenter = parent.walkableLeftX + Math.min(halfWalkable, parent.walkableWidth * 0.45);
                    const maximumCenter = parent.walkableRightX - Math.min(halfWalkable, parent.walkableWidth * 0.45);
                    const centerX = roundCoordinate(clamp(targetX, Math.min(minimumCenter, maximumCenter), Math.max(minimumCenter, maximumCenter)));
                    if (secondaryPlacementConflicts(selection, centerX, surfaceY, parent)) continue;

                    let accessSupport = null;
                    for (const side of rng.shuffle([-1, 1])) {
                        const edgeOffset = Math.max(
                            selection.width * 0.28,
                            selection.width * 0.5 - accessSelection.width * 0.34
                        );
                        const accessCenterX = roundCoordinate(clamp(
                            centerX + side * edgeOffset,
                            parent.walkableLeftX + accessSelection.width * 0.34,
                            parent.walkableRightX - accessSelection.width * 0.34
                        ));
                        if (secondaryPlacementConflicts(accessSelection, accessCenterX, accessSurfaceY, parent)) continue;
                        accessSupport = addUpperAccessPlatform({
                            parent,
                            selection: accessSelection,
                            centerX: accessCenterX,
                            surfaceY: accessSurfaceY
                        });
                        if (accessSupport) break;
                    }
                    if (!accessSupport) continue;
                    if (secondaryPlacementConflicts(selection, centerX, surfaceY, accessSupport)) {
                        removeOptionalSupport(accessSupport);
                        continue;
                    }
                    const support = addSecondaryPlatform({
                        parent: accessSupport,
                        selection,
                        centerX,
                        surfaceY,
                        combatPerch,
                        powerUpPerch,
                        tier: 2
                    });
                    if (!support) {
                        removeOptionalSupport(accessSupport);
                        continue;
                    }
                    support.groundParentSupportId = parent.id;
                    support.accessSupportId = accessSupport.id;
                    const placement = placements.find((candidate) => candidate.id === support.placementId);
                    if (placement) {
                        placement.groundParentSupportId = parent.id;
                        placement.accessSupportId = accessSupport.id;
                    }
                    upperSpans.push({ left: support.walkableLeftX, right: support.walkableRightX });
                    usedParents.add(parent.id);
                    placed = true;
                    break;
                }
                if (!placed && pass === 2) continue;
            }
        }
        if (coveredWidth() < targetCoverage - 1) {
            throw new Error(`Horizontal upper lane covers only ${roundCoordinate(coveredWidth() / routeSpan * 100)}% of the playable span; 36% is required.`);
        }
    } else {
        const baseSecondaryLimit = settings.length === "grand" ? 11 : settings.length === "extended" ? 8 : settings.length === "standard" ? 6 : 4;
        const secondaryLimit = baseSecondaryLimit + (wideUpperCavern ? 2 : 0);
        const secondaryParents = supports.filter((support) => support.mandatory
            && !support.moving
            && support.role !== "doorSupport"
            && support.atlasId === "at_atlas_004"
            && support.walkableWidth >= 360);
        const candidates = rng.shuffle(wideUpperCavern ? [...secondaryParents, ...secondaryParents] : secondaryParents);
        for (const parent of candidates) {
            if (secondaryPlatforms.length >= secondaryLimit) break;
            const branchRole = secondaryPlatforms.length % 4;
            const combatPerch = branchRole === 1 || branchRole === 2;
            const powerUpPerch = branchRole === 3;
            const targetWidth = combatPerch
                ? clamp(parent.walkableWidth * rng.range(0.46, 0.64), 410, 580)
                : clamp(parent.walkableWidth * rng.range(0.3, 0.48), 220, 460);
            const maximumWidth = combatPerch ? Math.min(640, parent.walkableWidth * 0.72) : Math.min(500, parent.walkableWidth * 0.58);
            const selection = selectGenerationAsset(assetCatalog, "landingPlatform", targetWidth, rng, false, maximumWidth);
            if (!selection) continue;
            const surfaceY = roundCoordinate(parent.surfaceY - rng.range(wideUpperCavern ? 104 : 82, wideUpperCavern ? 128 : 108));
            let centerX = null;
            for (const side of rng.shuffle([-1, 1])) {
                const overhang = rng.range(52, 76);
                const candidateCenterX = side < 0
                    ? parent.walkableLeftX - overhang - selection.width * 0.5
                    : parent.walkableRightX + overhang + selection.width * 0.5;
                if (!secondaryPlacementConflicts(selection, candidateCenterX, surfaceY, parent)) {
                    centerX = roundCoordinate(candidateCenterX);
                    break;
                }
            }
            if (!Number.isFinite(centerX)) continue;
            addSecondaryPlatform({ parent, selection, centerX, surfaceY, combatPerch, powerUpPerch });
        }

        // Standard routes used to stop after one shallow side ledge. Extend a
        // subset of those ledges into a second tier so the large upper cavern
        // volume becomes an optional branch rather than empty scenery.
        const extensionTarget = (settings.length === "grand" ? 4 : settings.length === "extended" ? 3 : settings.length === "standard" ? 2 : 1)
            + (wideUpperCavern ? 1 : 0);
        let extensionCount = 0;
        const extensionParents = rng.shuffle(secondaryPlatforms.filter((support) => support.secondaryTier === 1));
        for (const parent of extensionParents) {
            if (extensionCount >= extensionTarget || secondaryPlatforms.length >= secondaryLimit + extensionTarget) break;
            const branchRole = secondaryPlatforms.length % 4;
            const combatPerch = branchRole === 0 || branchRole === 2;
            const powerUpPerch = branchRole === 3;
            const targetWidth = combatPerch
                ? clamp(parent.walkableWidth * rng.range(0.82, 1.12), 340, 520)
                : clamp(parent.walkableWidth * rng.range(0.62, 0.92), 240, 430);
            const maximumWidth = combatPerch ? 560 : 470;
            const selection = selectGenerationAsset(assetCatalog, "landingPlatform", targetWidth, rng, false, maximumWidth, { collisionMode: "oneWay" });
            if (!selection) continue;
            const surfaceY = roundCoordinate(parent.surfaceY - rng.range(132, 178));
            let centerX = null;
            for (const side of rng.shuffle([-1, 1])) {
                const overhang = rng.range(42, 72);
                const candidateCenterX = side < 0
                    ? parent.walkableLeftX - overhang - selection.width * 0.5
                    : parent.walkableRightX + overhang + selection.width * 0.5;
                if (!secondaryPlacementConflicts(selection, candidateCenterX, surfaceY, parent)) {
                    centerX = roundCoordinate(candidateCenterX);
                    break;
                }
            }
            if (!Number.isFinite(centerX)) continue;
            const extension = addSecondaryPlatform({
                parent,
                selection,
                centerX,
                surfaceY,
                combatPerch,
                powerUpPerch,
                tier: 2
            });
            if (extension) extensionCount += 1;
        }
    }

    const mainNodes = nodes.filter((node) => node.mandatory).sort((a, b) => Number(a.progress) - Number(b.progress));
    const mandatorySupportPath = [];
    if (mainNodes.length) mandatorySupportPath.push(nodeSupport.get(mainNodes[0].id)?.id);
    for (let index = 1; index < mainNodes.length; index += 1) {
        const edge = edges.find((candidate) => candidate.mandatory !== false
            && candidate.from === mainNodes[index - 1].id
            && candidate.to === mainNodes[index].id);
        if (!edge) continue;
        mandatorySupportPath.push(...(edgeSupportIds.get(edge.id) || []), nodeSupport.get(mainNodes[index].id)?.id);
    }

    const existing = [...supports];

    const safeStaticSurfaceBelow = (centerX, width, preferredSurfaceY, ignoredIds = []) => {
        const ignored = new Set(ignoredIds);
        let surfaceY = preferredSurfaceY;
        for (const other of supports) {
            if (ignored.has(other.id) || other.moving) continue;
            const overlap = Math.min(centerX + width * 0.5, other.centerX + other.width * 0.5)
                - Math.max(centerX - width * 0.5, other.centerX - other.width * 0.5);
            if (overlap <= 24) continue;
            const otherBottom = other.surfaceY + other.height * (1 - other.surfaceYRatio);
            surfaceY = Math.max(
                surfaceY,
                otherBottom + GENERATED_STATIC_HEADROOM + 2,
                other.surfaceY + GENERATED_MINIMUM_VERTICAL_PLATFORM_SEPARATION
            );
        }
        return roundCoordinate(surfaceY);
    };

    const addRecoveryNetworkLift = ({ id, edge, lowerSupport, upperSupport, spacingStyle }) => {
        if (!lowerSupport || !upperSupport) return null;
        const selection = selectGenerationAsset(
            assetCatalog,
            "movingPlatform",
            theme.traversal.intermediateWidth * 0.82,
            rng,
            false,
            theme.traversal.intermediateWidth * 1.02
        );
        if (!selection) return null;
        const support = addSupport({
            id,
            role: "landingPlatform",
            targetWidth: theme.traversal.intermediateWidth * 0.82,
            selection,
            centerX: lowerSupport.centerX,
            surfaceY: lowerSupport.surfaceY,
            mandatory: false,
            routeEdgeId: edge.id
        });
        const candidateCenters = [];
        for (const reference of [lowerSupport, upperSupport]) {
            candidateCenters.push(
                reference.walkableLeftX - rng.range(42, 64) - support.width * 0.5 + support.walkableRightInset,
                reference.walkableRightX + rng.range(42, 64) + support.width * 0.5 - support.walkableLeftInset
            );
        }
        candidateCenters.push(
            (lowerSupport.walkableLeftX + upperSupport.walkableLeftX) * 0.5 - support.width * 0.5,
            (lowerSupport.walkableRightX + upperSupport.walkableRightX) * 0.5 + support.width * 0.5
        );
        const scanLeft = Math.min(lowerSupport.walkableLeftX, upperSupport.walkableLeftX) - support.width - theme.traversal.mandatoryGap;
        const scanRight = Math.max(lowerSupport.walkableRightX, upperSupport.walkableRightX) + support.width + theme.traversal.mandatoryGap;
        for (let x = scanLeft; x <= scanRight; x += 36) candidateCenters.push(x);
        candidateCenters.sort((a, b) => {
            const aDistance = Math.min(Math.abs(a - lowerSupport.centerX), Math.abs(a - upperSupport.centerX));
            const bDistance = Math.min(Math.abs(b - lowerSupport.centerX), Math.abs(b - upperSupport.centerX));
            return aDistance - bDistance;
        });
        let chosen = null;
        for (const centerX of candidateCenters) {
            moveSupportCenter(support, centerX);
            const platformAtUpper = {
                ...support,
                surfaceY: upperSupport.surfaceY
            };
            const board = classifyTraversalTransition(lowerSupport, support, { ...edge, mandatory: false }, theme);
            const exit = classifyTraversalTransition(platformAtUpper, upperSupport, { ...edge, mandatory: false }, theme);
            const shaftTop = Math.min(lowerSupport.surfaceY, upperSupport.surfaceY);
            const shaftBottom = Math.max(lowerSupport.surfaceY, upperSupport.surfaceY);
            const shaftLeft = support.centerX - support.width * 0.5;
            const shaftRight = support.centerX + support.width * 0.5;
            const blocked = supports.some((other) => {
                if ([support.id, lowerSupport.id, upperSupport.id].includes(other.id) || other.moving) return false;
                const overlap = Math.min(shaftRight, other.centerX + other.width * 0.5)
                    - Math.max(shaftLeft, other.centerX - other.width * 0.5);
                if (overlap <= 26) return false;
                return other.surfaceY > shaftTop + 22 && other.surfaceY < shaftBottom - 22;
            });
            if (board.valid && exit.valid && board.gap <= theme.traversal.mandatoryGap && exit.gap <= theme.traversal.mandatoryGap && !blocked) {
                chosen = { board, exit, endCenterX: support.centerX };
                break;
            }
        }
        if (!chosen) {
            const startCandidates = [
                lowerSupport.walkableLeftX - 52 - support.width * 0.5 + support.walkableRightInset,
                lowerSupport.walkableRightX + 52 + support.width * 0.5 - support.walkableLeftInset,
                lowerSupport.centerX
            ];
            const endCandidates = [
                upperSupport.walkableLeftX - 52 - support.width * 0.5 + support.walkableRightInset,
                upperSupport.walkableRightX + 52 + support.width * 0.5 - support.walkableLeftInset,
                upperSupport.centerX
            ];
            outer:
            for (const startCenterX of startCandidates) {
                moveSupportCenter(support, startCenterX);
                for (const endCenterX of endCandidates) {
                    const deltaX = endCenterX - startCenterX;
                    if (Math.abs(deltaX) > 1400) continue;
                    const platformAtUpper = {
                        ...support,
                        centerX: endCenterX,
                        surfaceY: upperSupport.surfaceY,
                        walkableLeftX: support.walkableLeftX + deltaX,
                        walkableRightX: support.walkableRightX + deltaX
                    };
                    const board = classifyTraversalTransition(lowerSupport, support, { ...edge, mandatory: false }, theme);
                    const exit = classifyTraversalTransition(platformAtUpper, upperSupport, { ...edge, mandatory: false }, theme);
                    if (!board.valid || !exit.valid
                        || board.gap > theme.traversal.mandatoryGap
                        || exit.gap > theme.traversal.mandatoryGap) continue;
                    chosen = { board, exit, endCenterX };
                    break outer;
                }
            }
        }
        if (!chosen) {
            const placement = placements.find((candidate) => candidate.id === support.placementId);
            supports.splice(supports.indexOf(support), 1);
            if (placement) placements.splice(placements.indexOf(placement), 1);
            return null;
        }
        support.role = "recoveryPlatform";
        support.moving = true;
        support.movementAxis = "vertical";
        support.movementStartSupportId = lowerSupport.id;
        support.movementEndSupportId = upperSupport.id;
        support.movementDistance = roundCoordinate(Math.hypot(
            chosen.endCenterX - support.centerX,
            upperSupport.surfaceY - lowerSupport.surfaceY
        ));
        support.platformSpacingStyle = spacingStyle;
        support.movingVisualStyle = "thinOnly";
        support.recoveryReturnLift = true;
        const placement = placements.find((candidate) => candidate.id === support.placementId);
        placement.movement = {
            version: 1,
            pattern: "shuttle",
            activation: "automatic",
            endOffsetX: roundCoordinate(chosen.endCenterX - support.centerX),
            endOffsetY: roundCoordinate(upperSupport.surfaceY - lowerSupport.surfaceY),
            speed: roundCoordinate(clamp(Math.abs(upperSupport.surfaceY - lowerSupport.surfaceY) * 0.34, 126, 215)),
            initialDelay: roundCoordinate(rng.range(0, 0.5)),
            triggerDelay: 0,
            startPause: roundCoordinate(rng.range(0.55, 0.9)),
            endPause: roundCoordinate(rng.range(0.55, 0.9)),
            fadeDuration: 0.2,
            hiddenDuration: 1.25
        };
        placement.generationRole = "recoveryReturnLift";
        placement.recoveryReturnLift = true;
        for (const [transition, endpoint] of [[chosen.board, "lower"], [chosen.exit, "upper"]]) {
            transition.mandatory = false;
            transition.movingPlatformTransfer = true;
            transition.movingPlatformId = support.id;
            transition.platformEndpoint = endpoint;
            transition.spacingStyle = spacingStyle;
            transition.recoverySupportId = lowerSupport.id;
            transition.recoveryReturnSupportId = upperSupport.id;
            transitions.push(transition);
        }
        existing.push(support);
        return support;
    };

    
        const horizontalEdgeCandidates = edges.filter((edge) => edge.mandatory !== false
            && (edge.intendedDirection === "left" || edge.intendedDirection === "right"))
            .map((edge) => ({ edge, chain: mandatoryEdgeChains.get(edge.id) || [] }))
            .filter((entry) => entry.chain.length >= 2);
        for (const { edge, chain } of horizontalEdgeCandidates) {
            const ordered = [...chain].sort((left, right) => left.centerX - right.centerX);
            const upperGaps = [];
            for (let index = 1; index < ordered.length; index += 1) {
                const left = ordered[index - 1];
                const right = ordered[index];
                const gapLeft = finiteNumber(left.walkableRightX, left.centerX + left.width * 0.5);
                const gapRight = finiteNumber(right.walkableLeftX, right.centerX - right.width * 0.5);
                if (gapRight - gapLeft < 28) continue;
                upperGaps.push({
                    leftX: roundCoordinate(gapLeft),
                    rightX: roundCoordinate(gapRight),
                    centerX: roundCoordinate((gapLeft + gapRight) * 0.5),
                    width: roundCoordinate(gapRight - gapLeft),
                    leftSupportId: left.id,
                    rightSupportId: right.id
                });
            }
            if (!upperGaps.length) continue;

            const direction = Math.sign(nodeSupport.get(edge.to).centerX - nodeSupport.get(edge.from).centerX) || 1;
            const progressionGaps = direction > 0 ? upperGaps : [...upperGaps].reverse();
            const deepestUpperBottom = Math.max(...ordered.map((support) =>
                support.surfaceY + support.height * (1 - support.surfaceYRatio)
            ));
            const deepestUpperSurface = Math.max(...ordered.map((support) => support.surfaceY));
            const lowerRouteBaseY = roundCoordinate(Math.max(
                deepestUpperBottom + GENERATED_STATIC_HEADROOM,
                deepestUpperSurface + 188
            ));
            const laneSupports = [];
            const laneSpecs = [];
            const slopeStep = 0;
            for (let index = 0; index < upperGaps.length; index += 1) {
                const gap = upperGaps[index];
                const previousCenter = index > 0 ? upperGaps[index - 1].centerX : ordered[0].walkableLeftX;
                const nextCenter = index < upperGaps.length - 1 ? upperGaps[index + 1].centerX : ordered.at(-1).walkableRightX;
                const leftBoundary = index === 0 ? ordered[0].walkableLeftX : (previousCenter + gap.centerX) * 0.5;
                const rightBoundary = index === upperGaps.length - 1 ? ordered.at(-1).walkableRightX : (gap.centerX + nextCenter) * 0.5;
                const cellWidth = Math.max(260, rightBoundary - leftBoundary);
                const maximumWidth = Math.max(180, cellWidth - 48);
                const targetWidth = Math.min(
                    maximumWidth,
                    clamp(
                        Math.max(gap.width + 170, cellWidth - rng.range(62, 86)),
                        180,
                        980
                    )
                );
                const selection = selectGenerationAsset(assetCatalog, "recoveryPlatform", targetWidth, rng, false, maximumWidth, { collisionMode: "blockable" });
                if (!selection) throw new Error(`Layered recovery on “${edge.id}” cannot find a blockable lower-path platform.`);
                let centerX = roundCoordinate((leftBoundary + rightBoundary) * 0.5);
                const selectedLeft = centerX - selection.width * 0.5 + selection.width * selection.asset.walkableLeftInsetRatio;
                const selectedRight = centerX + selection.width * 0.5 - selection.width * selection.asset.walkableRightInsetRatio;
                if (selectedLeft > gap.centerX) centerX -= selectedLeft - gap.centerX + 18;
                if (selectedRight < gap.centerX) centerX += gap.centerX - selectedRight + 18;
                laneSpecs.push({
                    index,
                    gap,
                    targetWidth,
                    selection,
                    centerX,
                    progressionIndex: progressionGaps.indexOf(gap)
                });
            }

            let sharedLowerBaseY = lowerRouteBaseY;
            for (const spec of laneSpecs) {
                for (const other of supports) {
                    if (other.moving) continue;
                    const overlap = Math.min(spec.centerX + spec.selection.width * 0.5, other.centerX + other.width * 0.5)
                        - Math.max(spec.centerX - spec.selection.width * 0.5, other.centerX - other.width * 0.5);
                    if (overlap <= 24) continue;
                    const otherBottom = other.surfaceY + other.height * (1 - other.surfaceYRatio);
                    sharedLowerBaseY = Math.max(
                        sharedLowerBaseY,
                        otherBottom + GENERATED_STATIC_HEADROOM + 2 - spec.progressionIndex * slopeStep,
                        other.surfaceY + GENERATED_MINIMUM_VERTICAL_PLATFORM_SEPARATION - spec.progressionIndex * slopeStep
                    );
                }
            }
            sharedLowerBaseY = roundCoordinate(sharedLowerBaseY);

            for (const spec of laneSpecs) {
                const { index, gap, targetWidth, selection, centerX, progressionIndex } = spec;
                const leftUpper = supports.find((support) => support.id === gap.leftSupportId);
                const rightUpper = supports.find((support) => support.id === gap.rightSupportId);
                const localUpper = [leftUpper, rightUpper].filter(Boolean);
                const surfaceY = roundCoordinate(sharedLowerBaseY + progressionIndex * slopeStep);
                const support = addSupport({
                    id: `support_${edge.id}_lower_${String(index + 1).padStart(2, "0")}`,
                    role: "recoveryPlatform",
                    targetWidth,
                    selection,
                    centerX,
                    surfaceY,
                    mandatory: false,
                    routeEdgeId: edge.id
                });
                support.platformSpacingStyle = "layeredLowerRoute";
                support.recoveryLaneId = `recovery_lane_${edge.id}`;
                support.lowerRoute = true;
                support.protectsUpperGapIndex = index;
                support.protectsUpperGapCenterX = gap.centerX;
                gap.recoverySupportId = support.id;
                laneSupports.push(support);
                existing.push(support);

                for (const source of localUpper) {
                    const fall = classifyTraversalTransition(source, support, { ...edge, mandatory: false }, theme);
                    if (!fall.valid || fall.gap > theme.traversal.mandatoryGap) continue;
                    fall.mandatory = false;
                    fall.spacingStyle = "fallToLowerRoute";
                    fall.recoverySupportId = support.id;
                    transitions.push(fall);
                }
            }

            laneSupports.sort((left, right) => left.centerX - right.centerX);
            const completeLaneSupports = [];
            for (let pairIndex = 1; pairIndex < laneSupports.length; pairIndex += 1) {
                const left = laneSupports[pairIndex - 1];
                const right = laneSupports[pairIndex];
                if (!completeLaneSupports.length) completeLaneSupports.push(left);
                const direct = classifyTraversalTransition(left, right, { ...edge, mandatory: false }, theme);
                const directWalkableGap = Math.max(0, right.walkableLeftX - left.walkableRightX);
                if (direct.valid && directWalkableGap <= 18) {
                    direct.mandatory = false;
                    direct.spacingStyle = "continuousLowerGround";
                    left.continuousLowerGround = true;
                    right.continuousLowerGround = true;
                    transitions.push(direct);
                    completeLaneSupports.push(right);
                    continue;
                }

                const span = Math.max(0, right.walkableLeftX - left.walkableRightX);
                const overlap = roundCoordinate(rng.range(24, 38));
                const bridges = [];
                let previousWalkableRight = left.walkableRightX;
                for (let bridgeIndex = 0; bridgeIndex < 12; bridgeIndex += 1) {
                    const remaining = right.walkableLeftX - previousWalkableRight;
                    if (remaining <= -16) break;
                    const requestedWidth = clamp(remaining + overlap * 1.4, 220, 760);
                    const maximumWidth = Math.max(280, Math.min(920, remaining + overlap + 420));
                    let selection = selectGenerationAsset(assetCatalog, "recoveryPlatform", requestedWidth, rng, false, maximumWidth, { collisionMode: "blockable" });
                    if (!selection) selection = selectGenerationAsset(assetCatalog, "recoveryPlatform", 420, rng, false, Infinity, { collisionMode: "blockable" });
                    if (!selection) break;
                    const estimatedProgress = clamp((previousWalkableRight - left.walkableRightX + selection.width * 0.5) / Math.max(1, span), 0.08, 0.94);
                    const bridge = addSupport({
                        id: `support_${edge.id}_lower_bridge_${String(pairIndex).padStart(2, "0")}_${String(bridgeIndex + 1).padStart(2, "0")}`,
                        role: "recoveryPlatform",
                        targetWidth: selection.width,
                        selection,
                        centerX: lerp(left.centerX, right.centerX, estimatedProgress),
                        surfaceY: lerp(left.surfaceY, right.surfaceY, estimatedProgress),
                        mandatory: false,
                        routeEdgeId: edge.id
                    });
                    const desiredWalkableLeft = previousWalkableRight - overlap;
                    moveSupportCenter(bridge, desiredWalkableLeft + bridge.width * 0.5 - bridge.walkableLeftInset);
                    bridge.platformSpacingStyle = "continuousLowerGround";
                    bridge.recoveryLaneId = `recovery_lane_${edge.id}`;
                    bridge.lowerRoute = true;
                    bridge.continuousLowerGround = true;
                    if (bridge.walkableRightX - previousWalkableRight < 70) {
                        const placement = placements.find((candidate) => candidate.id === bridge.placementId);
                        supports.splice(supports.indexOf(bridge), 1);
                        if (placement) placements.splice(placements.indexOf(placement), 1);
                        break;
                    }
                    bridges.push(bridge);
                    existing.push(bridge);
                    previousWalkableRight = bridge.walkableRightX;
                }
                if (previousWalkableRight - right.walkableLeftX < 16) {
                    throw new Error(`Layered lower route on “${edge.id}” cannot bridge ${left.id} to ${right.id} with a continuous ground path.`);
                }
                left.continuousLowerGround = true;
                right.continuousLowerGround = true;
                const bridgeChain = [left, ...bridges, right];
                for (let transitionIndex = 1; transitionIndex < bridgeChain.length; transitionIndex += 1) {
                    const transition = classifyTraversalTransition(bridgeChain[transitionIndex - 1], bridgeChain[transitionIndex], { ...edge, mandatory: false }, theme);
                    if (!transition.valid || transition.gap > theme.traversal.mandatoryGap) throw new Error(`Layered lower route bridge on “${edge.id}” is not traversable between ${bridgeChain[transitionIndex - 1].id} and ${bridgeChain[transitionIndex].id} (gap ${transition.gap}, rise ${transition.rise}, drop ${transition.drop}, exposed ${transition.exposedLandingWidth}).`);
                    transition.mandatory = false;
                    transition.spacingStyle = "continuousLowerGround";
                    transitions.push(transition);
                }
                completeLaneSupports.push(...bridges, right);
            }
            if (laneSupports.length === 1) completeLaneSupports.push(laneSupports[0]);
            laneSupports.length = 0;
            laneSupports.push(...completeLaneSupports.sort((left, right) => left.centerX - right.centerX));

            const lowerGaps = [];
            for (let index = 1; index < laneSupports.length; index += 1) {
                const left = laneSupports[index - 1];
                const right = laneSupports[index];

                const gapLeft = finiteNumber(left.walkableRightX, left.centerX + left.width * 0.5);
                const gapRight = finiteNumber(right.walkableLeftX, right.centerX - right.width * 0.5);
                const width = gapRight - gapLeft;
                if (width < 34) continue;
                const lowerGap = {
                    leftX: roundCoordinate(gapLeft),
                    rightX: roundCoordinate(gapRight),
                    centerX: roundCoordinate((gapLeft + gapRight) * 0.5),
                    width: roundCoordinate(width),
                    leftSupportId: left.id,
                    rightSupportId: right.id
                };
                const targetWidth = clamp(Math.max(width + 260, 380), 380, 760);
                const selection = selectGenerationAsset(assetCatalog, "recoveryPlatform", targetWidth, rng, false, 820);
                if (!selection) throw new Error(`Lower gap on “${edge.id}” cannot find a tertiary recovery platform.`);
                const localBottom = Math.max(
                    left.surfaceY + left.height * (1 - left.surfaceYRatio),
                    right.surfaceY + right.height * (1 - right.surfaceYRatio)
                );
                const tertiarySurfaceY = safeStaticSurfaceBelow(
                    lowerGap.centerX,
                    selection.width,
                    Math.max(
                        localBottom + GENERATED_STATIC_HEADROOM + 2,
                        Math.max(left.surfaceY, right.surfaceY) + 190
                    ),
                    [left.id, right.id]
                );
                const rescue = addSupport({
                    id: `support_${edge.id}_tertiary_${String(index).padStart(2, "0")}`,
                    role: "recoveryPlatform",
                    targetWidth,
                    selection,
                    centerX: lowerGap.centerX,
                    surfaceY: tertiarySurfaceY,
                    mandatory: false,
                    routeEdgeId: edge.id
                });
                rescue.platformSpacingStyle = "tertiaryGapRecovery";
                rescue.tertiaryRecovery = true;
                rescue.recoveryLaneId = `recovery_lane_${edge.id}`;
                rescue.protectsLowerGapIndex = lowerGaps.length;
                lowerGap.recoverySupportId = rescue.id;
                existing.push(rescue);
                for (const source of [left, right]) {
                    const fall = classifyTraversalTransition(source, rescue, { ...edge, mandatory: false }, theme);
                    if (!fall.valid || fall.gap > theme.traversal.mandatoryGap) continue;
                    fall.mandatory = false;
                    fall.spacingStyle = "fallToTertiaryRecovery";
                    fall.recoverySupportId = rescue.id;
                    transitions.push(fall);
                }
                let lift = null;
                let lowerReturn = null;
                for (const candidateReturn of [left, right].sort((a, b) => b.surfaceY - a.surfaceY)) {
                    lift = addRecoveryNetworkLift({
                        id: `support_${edge.id}_tertiary_return_${String(index).padStart(2, "0")}`,
                        edge,
                        lowerSupport: rescue,
                        upperSupport: candidateReturn,
                        spacingStyle: "tertiaryRecoveryReturnLift"
                    });
                    if (lift) {
                        lowerReturn = candidateReturn;
                        break;
                    }
                }
                if (!lift || !lowerReturn) throw new Error(`Tertiary recovery under “${edge.id}” cannot place a return lift.`);
                lowerGap.returnLiftId = lift.id;
                lowerGap.returnSupportId = lowerReturn.id;
                lowerGaps.push(lowerGap);
            }

            const progressionLane = direction > 0 ? laneSupports : [...laneSupports].reverse();
            const progressionUpper = direction > 0 ? ordered : [...ordered].reverse();
            let returnLift = null;
            let returnLower = null;
            let returnUpper = null;
            const returnPairs = [];
            for (const lowerCandidate of [progressionLane[0], progressionLane.at(-1), ...progressionLane]) {
                for (const upperCandidate of [progressionUpper[0], progressionUpper.at(-1), ...progressionUpper]) {
                    if (!lowerCandidate || !upperCandidate) continue;
                    returnPairs.push({ lowerCandidate, upperCandidate });
                }
            }
            returnPairs.sort((a, b) =>
                Math.abs(a.lowerCandidate.centerX - a.upperCandidate.centerX)
                    - Math.abs(b.lowerCandidate.centerX - b.upperCandidate.centerX)
            );
            for (const pair of returnPairs) {
                returnLift = addRecoveryNetworkLift({
                    id: `support_${edge.id}_lower_return`,
                    edge,
                    lowerSupport: pair.lowerCandidate,
                    upperSupport: pair.upperCandidate,
                    spacingStyle: "lowerRouteBacktrackLift"
                });
                if (returnLift) {
                    returnLower = pair.lowerCandidate;
                    returnUpper = pair.upperCandidate;
                    break;
                }
            }
            if (!returnLift || !returnLower || !returnUpper) throw new Error(`Layered lower route on “${edge.id}” cannot place its backtracking return lift.`);

            recoveryLanes.push({
                id: `recovery_lane_${edge.id}`,
                routeEdgeId: edge.id,
                surfaceY: roundCoordinate(laneSupports.reduce((sum, support) => sum + support.surfaceY, 0) / laneSupports.length),
                supportIds: laneSupports.map((support) => support.id),
                upperGaps,
                lowerGaps,
                staggered: true,
                guaranteedPerGap: true,
                layeredNetwork: true,
                returnLiftId: returnLift.id,
                returnSupportId: returnUpper.id,
                tertiarySupportIds: lowerGaps.map((gap) => gap.recoverySupportId)
            });
        }
    

    

    return {
        version: 1,
        generatorId: implementations.traversal,
        startSupportId: nodeSupport.get(route.startNodeId)?.id || "",
        exitSupportId: nodeSupport.get(route.exitNodeId)?.id || "",
        supports,
        transitions,
        mandatorySupportPath: mandatorySupportPath.filter(Boolean),
        recoveryLanes,
        secondaryPlatformIds: secondaryPlatforms.map((support) => support.id),
        upperAccessPlatformIds: upperAccessPlatforms.map((support) => support.id),
        verticalTraversalStyles: Object.fromEntries(verticalTraversalStyles),
        placements
    };
}
function classifyTraversalTransition(from, to, edge, theme) {
    const direction = Math.sign(to.centerX - from.centerX) || 1;
    const fromLeft = Number.isFinite(from.walkableLeftX) ? from.walkableLeftX : from.centerX - from.width * 0.5;
    const fromRight = Number.isFinite(from.walkableRightX) ? from.walkableRightX : from.centerX + from.width * 0.5;
    const toLeft = Number.isFinite(to.walkableLeftX) ? to.walkableLeftX : to.centerX - to.width * 0.5;
    const toRight = Number.isFinite(to.walkableRightX) ? to.walkableRightX : to.centerX + to.width * 0.5;
    const gap = Math.max(0, direction > 0 ? toLeft - fromRight : fromLeft - toRight);
    const rise = Math.max(0, from.surfaceY - to.surfaceY);
    const drop = Math.max(0, to.surfaceY - from.surfaceY);
    const exposedLandingWidth = Math.max(0, fromLeft - toLeft, toRight - fromRight);
    const mandatory = edge.mandatory !== false;
    const gapLimit = mandatory ? theme.traversal.mandatoryGap : theme.traversal.mandatoryGap * 1.28;
    const riseLimit = mandatory
        ? theme.traversal.mandatoryRise
        : Math.max(theme.traversal.mandatoryRise * 1.18, GENERATED_MINIMUM_VERTICAL_PLATFORM_SEPARATION);
    const dropLimit = mandatory ? theme.traversal.mandatoryDrop : theme.traversal.mandatoryDrop * 1.2;
    const requiredExposedLandingWidth = mandatory ? 56 : GENERATED_PLAYER_BODY_WIDTH + 8;
    const oneWayPassThrough = (to.collisionMode === "oneWay" && rise > 0)
        || (from.collisionMode === "oneWay" && drop > 0);
    const verticalClearanceValid = oneWayPassThrough
        || Math.max(rise, drop) <= 48
        || exposedLandingWidth >= requiredExposedLandingWidth;
    const returnLimit = Math.max(
        theme.traversal.mandatoryRise * 1.18,
        GENERATED_MINIMUM_VERTICAL_PLATFORM_SEPARATION
    );
    const valid = gap <= gapLimit
        && rise <= riseLimit
        && drop <= dropLimit
        && verticalClearanceValid
        && (mandatory || (rise <= returnLimit && drop <= returnLimit));
    const traversalClass = gap <= 12 && rise <= 28 && drop <= 55
        ? "walk"
        : rise > 72
            ? "easyJump"
            : drop > 120
                ? "controlledDrop"
                : gap > 68
                    ? "easyJump"
                    : "stepJump";
    return {
        id: `transition_${edge.id}_${from.id}_${to.id}`,
        routeEdgeId: edge.id,
        fromSupportId: from.id,
        toSupportId: to.id,
        mandatory,
        bidirectional: !mandatory,
        traversalClass,
        gap: roundCoordinate(gap),
        rise: roundCoordinate(rise),
        drop: roundCoordinate(drop),
        exposedLandingWidth: roundCoordinate(exposedLandingWidth),
        valid
    };
}

function selectGenerationAsset(catalog, role, targetWidth, rng, doorSupport = false, maximumWidth = Infinity, constraints = null) {
    const requiredCollisionMode = constraints?.collisionMode === "oneWay" || constraints?.collisionMode === "blockable"
        ? constraints.collisionMode
        : null;
    const candidates = catalog.assets
        .filter((asset) => asset.roles.includes(role))
        .filter((asset) => !requiredCollisionMode || asset.collisionMode === requiredCollisionMode)
        .map((asset) => {
            const minimumRequestedWidth = 64;
            const requested = Math.max(minimumRequestedWidth, Number(targetWidth) || asset.nativeWidth);
            const scale = clamp(requested / asset.nativeWidth, asset.scaleMin, asset.scaleMax);
            const width = asset.nativeWidth * scale;
            const height = asset.nativeHeight * scale;
            const doorPenalty = doorSupport && (width < Math.max(560, asset.minimumDoorWidth) || height < Math.max(110, asset.minimumVisibleDepth)) ? 10000 : 0;
            const widthPenalty = width > maximumWidth + 0.5 ? 10000 : 0;
            return { asset, scale, width, height, score: Math.abs(width - requested) + doorPenalty + widthPenalty };
        })
        .filter((entry) => entry.score < 10000)
        .sort((a, b) => a.score - b.score || b.asset.weight - a.asset.weight || a.asset.assetId.localeCompare(b.asset.assetId));
    if (!candidates.length) return null;
    const shortlist = candidates.slice(0, Math.min(4, candidates.length));
    const totalWeight = shortlist.reduce((sum, entry) => sum + entry.asset.weight / (1 + entry.score * 0.02), 0);
    let roll = rng.range(0, totalWeight);
    for (const entry of shortlist) {
        roll -= entry.asset.weight / (1 + entry.score * 0.02);
        if (roll <= 0) return entry;
    }
    return shortlist.at(-1);
}

function buildSafeEndpoints({ route, traversal, theme, implementations, rng, runId, destinationLevel }) {
    const supports = new Map(traversal.supports.map((support) => [support.id, support]));
    const entranceSupport = supports.get(traversal.startSupportId);
    const exitSupport = supports.get(traversal.exitSupportId);
    if (!entranceSupport || !exitSupport) throw new Error("Safe endpoint placement could not find both route endpoint supports.");
    const entities = [];
    const makeDoor = (role, support, id) => {
        const width = theme.endpoints.doorWidth;
        const height = theme.endpoints.doorHeight;
        const floorAnchorYFactor = 0.908745247148289;
        const minimumX = support.walkableLeftX + width * 0.5 + 48;
        const maximumX = support.walkableRightX - width * 0.5 - 48;
        const x = role === "entrance" ? minimumX : maximumX;
        const y = support.surfaceY;
        const type = role === "entrance" ? "wizard_entry_door" : "wizard_exit_door";
        const entity = {
            id,
            type,
            catalogId: "it_entities_001",
            x: roundCoordinate(x),
            y: roundCoordinate(y),
            w: width,
            h: height,
            state: "closed",
            visualStates: {
                closed: [{ atlasId: "it_atlas_001", assetId: "portal_closed", layer: "decorFront" }],
                open: [
                    { atlasId: "it_atlas_001", assetId: "portal_open", layer: "decorBack", widthFactor: 1.1366120218579234, heightFactor: 1, offsetXFactor: 0.06830601092896176 },
                    { atlasId: "it_atlas_001", assetId: "portal_foreground", layer: "actorFront", widthFactor: 0.6229508196721312, heightFactor: 1, offsetXFactor: -0.1885245901639344 }
                ]
            },
            stateLabels: { closed: "Closed", open: "Open" },
            interaction: "levelPortal",
            startsOpen: false,
            portalRole: role,
            walkSpeed: 105,
            closedDuration: 0.55,
            openDuration: 0.38,
            clearDuration: 0.28,
            closeDuration: 0.42,
            groundSnapDistance: 72,
            floorAnchorYFactor,
            wizardInsideScale: 0.84,
            walkDirection: 1,
            generatedBy: AUTOMATIC_LEVEL_GENERATOR_ID,
            generationRunId: runId,
            generationStage: "endpoints",
            generationRole: `${role}Door`,
            routeNodeId: role === "entrance" ? route.startNodeId : route.exitNodeId,
            generatorId: implementations.endpoints,
            notes: `Generated safe ${role} door on a catalogued doorSupport platform.`
        };
        if (role === "entrance") {
            entity.mirrorX = false;
            entity.emergeDistance = Math.min(190, support.width * 0.28);
        } else {
            entity.mirrorX = true;
            entity.triggerDistance = 96;
            entity.destinationLevel = destinationLevel;
        }
        entities.push(entity);
        return entity;
    };
    const entrance = makeDoor("entrance", entranceSupport, `generated_entry_${runId}`);
    const exit = makeDoor("exit", exitSupport, `generated_exit_${runId}`);
    return {
        version: 2,
        generatorId: implementations.endpoints,
        entrance: { nodeId: route.startNodeId, supportId: entranceSupport.id, entityId: entrance.id, x: entrance.x, y: entrance.y },
        exit: { nodeId: route.exitNodeId, supportId: exitSupport.id, entityId: exit.id, x: exit.x, y: exit.y },
        entities,
        calmDistance: theme.endpoints.calmDistance,
        variation: rng.float()
    };
}

function polygonSignedAreaSimple(points) {
    let twiceArea = 0;
    for (let index = 0; index < points.length; index += 1) {
        const current = points[index];
        const next = points[(index + 1) % points.length];
        twiceArea += current.x * next.y - next.x * current.y;
    }
    return twiceArea * 0.5;
}

function simplifyCollinearLoop(points) {
    const result = [];
    for (const point of points) {
        while (result.length >= 2) {
            const a = result.at(-2);
            const b = result.at(-1);
            const cross = (b.x - a.x) * (point.y - b.y) - (b.y - a.y) * (point.x - b.x);
            if (Math.abs(cross) > 0.0001) break;
            result.pop();
        }
        result.push(point);
    }
    let changed = true;
    while (changed && result.length > 3) {
        changed = false;
        for (let index = 0; index < result.length; index += 1) {
            const a = result[(index - 1 + result.length) % result.length];
            const b = result[index];
            const c = result[(index + 1) % result.length];
            const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
            if (Math.abs(cross) > 0.0001) continue;
            result.splice(index, 1);
            changed = true;
            break;
        }
    }
    return result;
}

function pointLineDistance(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared <= 0.000001) return Math.hypot(point.x - a.x, point.y - a.y);
    const t = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared, 0, 1);
    return Math.hypot(point.x - (a.x + dx * t), point.y - (a.y + dy * t));
}

function simplifyOpenPolyline(points, tolerance) {
    if (points.length <= 2) return [...points];
    let maximumDistance = 0;
    let splitIndex = -1;
    for (let index = 1; index < points.length - 1; index += 1) {
        const distanceValue = pointLineDistance(points[index], points[0], points.at(-1));
        if (distanceValue <= maximumDistance) continue;
        maximumDistance = distanceValue;
        splitIndex = index;
    }
    if (maximumDistance <= tolerance || splitIndex < 0) return [points[0], points.at(-1)];
    const left = simplifyOpenPolyline(points.slice(0, splitIndex + 1), tolerance);
    const right = simplifyOpenPolyline(points.slice(splitIndex), tolerance);
    return [...left.slice(0, -1), ...right];
}

function polygonSelfIntersects(points) {
    for (let first = 0; first < points.length; first += 1) {
        const a = points[first];
        const b = points[(first + 1) % points.length];
        for (let second = first + 1; second < points.length; second += 1) {
            if (second === first || second === (first + 1) % points.length || (second + 1) % points.length === first) continue;
            const c = points[second];
            const d = points[(second + 1) % points.length];
            if (segmentsIntersect(a, b, c, d)) return true;
        }
    }
    return false;
}

function simplifyClosedContour(points, tolerance) {
    const collinear = simplifyCollinearLoop(points);
    if (collinear.length <= 12) return collinear;
    let firstIndex = 0;
    for (let index = 1; index < collinear.length; index += 1) {
        if (collinear[index].x < collinear[firstIndex].x || (collinear[index].x === collinear[firstIndex].x && collinear[index].y < collinear[firstIndex].y)) firstIndex = index;
    }
    const rotated = [...collinear.slice(firstIndex), ...collinear.slice(0, firstIndex)];
    let splitIndex = 1;
    let farthest = 0;
    for (let index = 1; index < rotated.length; index += 1) {
        const distanceValue = distance(rotated[0], rotated[index]);
        if (distanceValue <= farthest) continue;
        farthest = distanceValue;
        splitIndex = index;
    }
    const firstChain = simplifyOpenPolyline(rotated.slice(0, splitIndex + 1), tolerance);
    const secondChain = simplifyOpenPolyline([...rotated.slice(splitIndex), rotated[0]], tolerance);
    const simplified = simplifyCollinearLoop([...firstChain.slice(0, -1), ...secondChain.slice(0, -1)]);
    if (simplified.length < 8 || polygonSelfIntersects(simplified)) return collinear;
    return simplified;
}

function traceCavernOccupancyContour(stamps, theme) {
    const cellSize = clamp(theme.cavern.sampleStep * 0.72, 82, 112);
    const rawMinX = Math.min(...stamps.map((stamp) => stamp.x - stamp.rx)) - cellSize * 2;
    const rawMinY = Math.min(...stamps.map((stamp) => stamp.y - stamp.ry)) - cellSize * 2;
    const rawMaxX = Math.max(...stamps.map((stamp) => stamp.x + stamp.rx)) + cellSize * 2;
    const rawMaxY = Math.max(...stamps.map((stamp) => stamp.y + stamp.ry)) + cellSize * 2;
    const originX = Math.floor(rawMinX / cellSize) * cellSize;
    const originY = Math.floor(rawMinY / cellSize) * cellSize;
    const columns = Math.ceil((rawMaxX - originX) / cellSize);
    const rows = Math.ceil((rawMaxY - originY) / cellSize);
    const occupied = new Set();
    const key = (column, row) => `${column},${row}`;
    const expansion = cellSize * 0.9;
    for (const stamp of stamps) {
        const expandedRx = stamp.rx + expansion;
        const expandedRy = stamp.ry + expansion;
        const minimumColumn = Math.max(0, Math.floor((stamp.x - expandedRx - originX) / cellSize));
        const maximumColumn = Math.min(columns - 1, Math.ceil((stamp.x + expandedRx - originX) / cellSize));
        const minimumRow = Math.max(0, Math.floor((stamp.y - expandedRy - originY) / cellSize));
        const maximumRow = Math.min(rows - 1, Math.ceil((stamp.y + expandedRy - originY) / cellSize));
        for (let row = minimumRow; row <= maximumRow; row += 1) {
            const centerY = originY + (row + 0.5) * cellSize;
            const dy = (centerY - stamp.y) / expandedRy;
            if (Math.abs(dy) > 1) continue;
            for (let column = minimumColumn; column <= maximumColumn; column += 1) {
                const centerX = originX + (column + 0.5) * cellSize;
                const dx = (centerX - stamp.x) / expandedRx;
                if (dx * dx + dy * dy <= 1) occupied.add(key(column, row));
            }
        }
    }
    if (!occupied.size) throw new Error("Contour cavern occupancy mask is empty.");

    const remaining = new Set(occupied);
    const components = [];
    const neighbours = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (remaining.size) {
        const startKey = remaining.values().next().value;
        const queue = [startKey];
        const component = new Set([startKey]);
        remaining.delete(startKey);
        for (let cursor = 0; cursor < queue.length; cursor += 1) {
            const [column, row] = queue[cursor].split(",").map(Number);
            for (const [dx, dy] of neighbours) {
                const neighbourKey = key(column + dx, row + dy);
                if (!remaining.has(neighbourKey)) continue;
                remaining.delete(neighbourKey);
                component.add(neighbourKey);
                queue.push(neighbourKey);
            }
        }
        components.push(component);
    }
    components.sort((a, b) => b.size - a.size);
    if (components.length > 1 && components[1].size > 2) throw new Error(`Contour cavern occupancy split into ${components.length} disconnected regions.`);
    const primary = components[0];

    const edges = [];
    const addEdge = (sx, sy, ex, ey, direction) => edges.push({ sx, sy, ex, ey, direction, used: false });
    for (const cellKey of primary) {
        const [column, row] = cellKey.split(",").map(Number);
        if (!primary.has(key(column, row - 1))) addEdge(column, row, column + 1, row, 0);
        if (!primary.has(key(column + 1, row))) addEdge(column + 1, row, column + 1, row + 1, 1);
        if (!primary.has(key(column, row + 1))) addEdge(column + 1, row + 1, column, row + 1, 2);
        if (!primary.has(key(column - 1, row))) addEdge(column, row + 1, column, row, 3);
    }
    const outgoing = new Map();
    for (const edge of edges) {
        const vertexKey = key(edge.sx, edge.sy);
        if (!outgoing.has(vertexKey)) outgoing.set(vertexKey, []);
        outgoing.get(vertexKey).push(edge);
    }
    const turnPriority = new Map([[1, 0], [0, 1], [3, 2], [2, 3]]);
    const loops = [];
    for (const initialEdge of edges) {
        if (initialEdge.used) continue;
        const loop = [];
        let edge = initialEdge;
        const startVertex = key(edge.sx, edge.sy);
        let guard = edges.length + 8;
        while (edge && guard-- > 0) {
            edge.used = true;
            loop.push({ x: edge.sx, y: edge.sy });
            const nextVertex = key(edge.ex, edge.ey);
            if (nextVertex === startVertex) break;
            const candidates = (outgoing.get(nextVertex) || []).filter((candidate) => !candidate.used);
            candidates.sort((a, b) => {
                const aTurn = (a.direction - edge.direction + 4) % 4;
                const bTurn = (b.direction - edge.direction + 4) % 4;
                return (turnPriority.get(aTurn) ?? 9) - (turnPriority.get(bTurn) ?? 9);
            });
            edge = candidates[0];
        }
        if (loop.length >= 4) loops.push(loop);
    }
    if (!loops.length) throw new Error("Contour cavern could not trace an outer boundary.");
    loops.sort((a, b) => Math.abs(polygonSignedAreaSimple(b)) - Math.abs(polygonSignedAreaSimple(a)));
    let gridLoop = loops[0];
    if (polygonSignedAreaSimple(gridLoop) < 0) gridLoop = [...gridLoop].reverse();
    const worldLoop = gridLoop.map((point) => ({ x: originX + point.x * cellSize, y: originY + point.y * cellSize }));
    const simplified = simplifyClosedContour(worldLoop, cellSize * 1.24);
    return {
        points: simplified.map((point) => ({ x: roundCoordinate(point.x), y: roundCoordinate(point.y) })),
        metadata: {
            cellSize: roundCoordinate(cellSize),
            columns,
            rows,
            occupiedCellCount: primary.size,
            componentCount: components.length,
            rawPointCount: worldLoop.length,
            simplifiedPointCount: simplified.length
        }
    };
}

function buildRoomAndTunnelCavern({ route, traversal, endpoints, theme, seed, runId, generatorId }) {
    const risingSnakeCavern = route?.macro?.patternId === "rising-snake";
    const wideUpperCavern = generatorId === "wide-upper-contour-cavern-v1" && !risingSnakeCavern;
    const nodeById = new Map((route?.nodes || []).map((node) => [node.id, node]));
    const endpointSupportIds = new Set([traversal.startSupportId, traversal.exitSupportId]);
    const rooms = [];
    const stamps = traversal.supports.map((support) => {
        const node = nodeById.get(support.routeNodeId);
        const endpoint = endpointSupportIds.has(support.id);
        const room = node?.macroRoomId ? {
            id: node.macroRoomId,
            widthScreens: finiteNumber(node.roomWidthScreens, 1.5),
            heightScreens: finiteNumber(node.roomHeightScreens, 1.3),
            rareLargeRoom: Boolean(node.rareLargeRoom)
        } : null;
        let rx = endpoint
            ? theme.cavern.endpointRadiusX
            : room
                ? clamp(room.widthScreens * 1280 * 0.5, theme.cavern.roomRadiusXMin, theme.cavern.roomRadiusXMax)
                : node?.kind === "chamber" || node?.kind === "recovery"
                    ? theme.cavern.chamberRadiusX
                    : theme.cavern.corridorRadiusX;
        let ry = endpoint
            ? theme.cavern.endpointRadiusY
            : room
                ? clamp(room.heightScreens * 720 * 0.5, theme.cavern.roomRadiusYMin, theme.cavern.roomRadiusYMax)
                : node?.kind === "chamber" || node?.kind === "recovery"
                    ? theme.cavern.chamberRadiusY
                    : theme.cavern.corridorRadiusY;
        if (wideUpperCavern) {
            rx = Math.min(theme.cavern.roomRadiusXMax * 1.35, rx * (endpoint ? 1.18 : room ? 1.34 : 1.24));
            ry *= endpoint ? 0.78 : room ? 0.68 : 0.72;
        }
        rx = Math.max(rx, support.width * 0.5 + theme.cavern.platformWallClearanceX);
        const platformDepth = support.height * (1 - support.surfaceYRatio);
        const desiredTop = wideUpperCavern
            ? support.surfaceY - Math.max(440, theme.cavern.platformCeilingClearance * 1.34)
            : support.surfaceY - theme.cavern.platformCeilingClearance;
        const desiredBottom = wideUpperCavern
            ? support.surfaceY + platformDepth + Math.max(240, theme.cavern.platformFloorClearance * 0.92)
            : support.surfaceY + platformDepth + theme.cavern.platformFloorClearance;
        const minimumHalfHeight = (desiredBottom - desiredTop) * 0.5;
        const supportHalfWidth = support.width * 0.5;
        const supportEdgeRatio = clamp(supportHalfWidth / Math.max(1, rx), 0, 0.92);
        const supportEdgeFactor = Math.sqrt(Math.max(0.15, 1 - supportEdgeRatio * supportEdgeRatio));
        ry = Math.max(ry, (minimumHalfHeight + 18) / supportEdgeFactor);
        const centerY = (desiredTop + desiredBottom) * 0.5;
        const stamp = {
            id: `cavern_stamp_${support.id}`,
            x: support.centerX,
            y: centerY,
            rx,
            ry,
            sourceSupportId: support.id,
            routeNodeId: support.routeNodeId || undefined,
            kind: endpoint ? "endpointChamber" : room ? "macroRoom" : node?.kind === "chamber" || node?.kind === "recovery" ? "chamber" : "tunnel"
        };
        if (room) rooms.push({
            ...room,
            nodeId: node.id,
            supportId: support.id,
            x: support.centerX,
            y: centerY,
            rx,
            ry,
            widthScreens: roundCoordinate(rx * 2 / 1280),
            heightScreens: roundCoordinate(ry * 2 / 720)
        });
        return stamp;
    });
    const placementBySupportId = new Map((traversal.placements || []).map((placement) => [placement.id, placement]));
    for (const support of traversal.supports || []) {
        if (!support.moving || support.movementAxis !== "vertical") continue;
        const placement = placementBySupportId.get(support.placementId);
        const offsetY = finiteNumber(placement?.movement?.endOffsetY, 0);
        if (Math.abs(offsetY) < 1) continue;
        const baseStamp = stamps.find((stamp) => stamp.sourceSupportId === support.id);
        if (!baseStamp) continue;
        stamps.push({
            id: `cavern_stamp_${support.id}_shaft`,
            x: support.centerX,
            y: baseStamp.y + offsetY * 0.5,
            rx: Math.max(baseStamp.rx * 0.72, support.width * 0.5 + theme.cavern.platformWallClearanceX),
            ry: Math.abs(offsetY) * 0.5 + Math.max(theme.cavern.platformCeilingClearance, theme.cavern.platformFloorClearance) + support.height * 0.35,
            sourceSupportId: support.id,
            routeEdgeId: support.routeEdgeId || undefined,
            kind: "movingPlatformShaft"
        });
    }
    if (["the-path74", "mostly-horizontal", "rising-snake"].includes(route?.macro?.patternId)) {
        const pathCellSizeX = finiteNumber(route.macro.cellSizeX, theme.route.nodeSpacing * 0.42);
        const pathCellSizeY = finiteNumber(route.macro.cellSizeY, theme.route.verticalStep * 1.35);
        for (const room of route.macro.rooms || []) {
            let rx = clamp(
                finiteNumber(room.semiAxisX, 3) * pathCellSizeX,
                theme.cavern.roomRadiusXMin,
                wideUpperCavern ? theme.cavern.roomRadiusXMax * 1.35 : theme.cavern.roomRadiusXMax
            );
            let ry = clamp(
                finiteNumber(room.semiAxisY, 3) * pathCellSizeY,
                wideUpperCavern ? theme.cavern.roomRadiusYMin * 0.68 : theme.cavern.roomRadiusYMin,
                wideUpperCavern ? theme.cavern.roomRadiusYMax * 0.78 : theme.cavern.roomRadiusYMax
            );
            if (wideUpperCavern) {
                rx = Math.min(theme.cavern.roomRadiusXMax * 1.35, rx * 1.22);
                ry *= 0.82;
            }
            const centerX = finiteNumber(room.centerX, theme.route.startX);
            const routeCenterY = finiteNumber(room.centerY, theme.route.baselineY);
            const centerY = wideUpperCavern
                ? routeCenterY + Math.max(170, theme.cavern.platformFloorClearance * 0.72) - ry
                : routeCenterY - theme.cavern.floorOffsetY;
            const stamp = {
                id: `cavern_stamp_${room.id}`,
                x: centerX,
                y: centerY,
                rx,
                ry,
                routeNodeId: room.nodeId || undefined,
                kind: "thePathRoom"
            };
            stamps.push(stamp);
            rooms.push({
                ...room,
                x: centerX,
                y: centerY,
                rx,
                ry,
                widthScreens: roundCoordinate(rx * 2 / 1280),
                heightScreens: roundCoordinate(ry * 2 / 720)
            });
        }
    }
    if (wideUpperCavern) {
        const mainGroundSupports = (traversal.supports || [])
            .filter((support) => support.mandatory && !support.moving && support.role !== "doorSupport")
            .sort((left, right) => left.centerX - right.centerX);
        const extraRoomTarget = Math.max(4, Math.min(7, Math.ceil(mainGroundSupports.length / 4.5)));
        for (let index = 0; index < extraRoomTarget && mainGroundSupports.length; index += 1) {
            const supportIndex = Math.min(
                mainGroundSupports.length - 1,
                Math.max(0, Math.round((index + 1) * (mainGroundSupports.length - 1) / (extraRoomTarget + 1)))
            );
            const support = mainGroundSupports[supportIndex];
            const platformDepth = support.height * (1 - support.surfaceYRatio);
            const rx = clamp(
                Math.max(
                    support.width * 0.72 + theme.cavern.platformWallClearanceX,
                    theme.cavern.roomRadiusXMin * 2.45
                ),
                theme.cavern.roomRadiusXMin * 2.15,
                theme.cavern.roomRadiusXMax * 1.58
            );
            const roomCenterX = support.centerX + (index % 2 === 0 ? -1 : 1) * Math.min(300, rx * 0.18);
            const ry = clamp(
                Math.max(470, theme.cavern.roomRadiusYMin * 0.88),
                Math.max(440, theme.cavern.roomRadiusYMin * 0.82),
                Math.min(560, theme.cavern.roomRadiusYMax * 0.56)
            );
            const bottomY = support.surfaceY + platformDepth + Math.max(220, theme.cavern.platformFloorClearance * 0.88);
            const centerY = bottomY - ry;
            const roomId = `wide_upper_room_${String(index + 1).padStart(2, "0")}`;
            stamps.push({
                id: `cavern_stamp_${roomId}`,
                x: roomCenterX,
                y: centerY,
                rx,
                ry,
                sourceSupportId: support.id,
                routeNodeId: support.routeNodeId || undefined,
                kind: "wideUpperRoom"
            });
            rooms.push({
                id: roomId,
                nodeId: support.routeNodeId || undefined,
                supportId: support.id,
                x: roomCenterX,
                y: centerY,
                rx,
                ry,
                widthScreens: roundCoordinate(rx * 2 / 1280),
                heightScreens: roundCoordinate(ry * 2 / 720),
                upwardExpansion: true,
                auxiliary: true
            });
        }
    }

    if (wideUpperCavern) {
        const ceilingExpansions = stamps
            .filter((stamp) => stamp.kind !== "movingPlatformShaft" && Number(stamp.ry) > 0)
            .map((stamp) => {
                const originalBottom = stamp.y + stamp.ry;
                const expandedRadiusY = stamp.ry * DOMED_CAVERN_UPWARD_EXPANSION_FACTOR;
                return {
                    ...stamp,
                    id: `${stamp.id}_domed_ceiling`,
                    y: originalBottom - expandedRadiusY,
                    ry: expandedRadiusY,
                    kind: "domedCeilingExpansion",
                    sourceStampId: stamp.id,
                    upwardExpansionFactor: DOMED_CAVERN_UPWARD_EXPANSION_FACTOR
                };
            });
        stamps.push(...ceilingExpansions);
    }

    if (!stamps.length) throw new Error("Room-and-tunnel cavern builder received no traversal supports.");

    const contourResult = traceCavernOccupancyContour(stamps, theme);
    const rawPoints = contourResult.points;
    const pointMode = "smooth";
    const points = rawPoints.map((point, index) => ({
        id: `generated_cave_${String(index + 1).padStart(3, "0")}`,
        x: point.x,
        y: point.y,
        mode: pointMode
    }));
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const bounds = {
        x: Math.min(...xs),
        y: Math.min(...ys),
        w: Math.max(...xs) - Math.min(...xs),
        h: Math.max(...ys) - Math.min(...ys)
    };
    const endpointEntities = endpoints?.entities || [];
    return {
        version: generatorId === "wide-upper-contour-cavern-v1" ? 6 : 4,
        generatorId,
        runId,
        macroPatternId: route?.macro?.patternId || "",
        macroPatternLabel: route?.macro?.patternLabel || "",
        rooms: rooms.map((room) => Object.fromEntries(Object.entries(room).map(([key, value]) => [key, typeof value === "number" ? roundCoordinate(value) : value]))),
        stamps: stamps.map((stamp) => Object.fromEntries(Object.entries(stamp).map(([key, value]) => [key, typeof value === "number" ? roundCoordinate(value) : value]))),
        contour: contourResult?.metadata,
        bounds: Object.fromEntries(Object.entries(bounds).map(([key, value]) => [key, roundCoordinate(value)])),
        endpointPositions: endpointEntities.map((entity) => ({ id: entity.id, role: entity.portalRole, x: entity.x, y: entity.y })),
        caveWindow: {
            version: 1,
            enabled: true,
            feather: 200,
            gradientNoise: {
                seed: hashGeneratorSeed(`${seed}:gradient:${runId}`) % 1000000,
                amplitude: 50,
                period: 50
            },
            decoration: {
                seed: hashGeneratorSeed(`${seed}:cavern:${runId}`) % 1000000,
                saturation: 0.68
            },
            points
        }
    };
}

function deriveGeneratedWorld(cavern, traversal, theme) {
    const bounds = cavern.bounds;
    const margin = theme.cavern.worldMargin;
    const platformBottom = Math.max(...traversal.supports.map((support) => support.surfaceY + support.height * (1 - support.surfaceYRatio)));
    const x = Math.floor(bounds.x - margin);
    const y = Math.floor(bounds.y - margin);
    const right = Math.ceil(bounds.x + bounds.w + margin);
    const bottom = Math.ceil(Math.max(bounds.y + bounds.h + margin, platformBottom + margin));
    return {
        bounds: { x, y, w: right - x, h: bottom - y },
        resetY: bottom + 180
    };
}

function pointInsideGeneratedCavern(cavern, x, y) {
    const range = cavernVerticalRangeAt(cavern, x, y);
    return Boolean(range && y >= range.top - 0.001 && y <= range.bottom + 0.001);
}

export function validateRouteGraph(graph, context = {}) {
    const settings = normalizeGeneratorSettings(context.settings);
    const theme = normalizeGeneratorTheme(context.theme);
    const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
    const edges = Array.isArray(graph?.edges) ? graph.edges : [];
    const errors = [];
    const warnings = [];
    const metrics = {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        mainNodeCount: 0,
        minNodeDistance: Infinity,
        edgeCrossings: 0,
        backtrackEdges: 0,
        horizontalDirectionChanges: 0,
        verticalDirectionChanges: 0,
        longestEastwardRun: 0,
        horizontalTravel: 0,
        verticalTravel: 0,
        routeWidth: 0,
        routeHeight: 0,
        aspectRatio: 0,
        occupiedLaneCount: 0,
        verticalSpan: 0,
        averageMainSpacing: 0,
        maxEdgeLength: 0,
        macroPatternId: String(graph?.macro?.patternId || ""),
        macroRoomCount: Array.isArray(graph?.macro?.rooms) ? graph.macro.rooms.length : 0,
        largestRoomWidthScreens: 0,
        largestRoomHeightScreens: 0
    };
    if (nodes.length < 2) errors.push("The route needs at least an entrance and exit node.");
    const byId = new Map();
    for (const node of nodes) {
        if (!node || !node.id) {
            errors.push("Every route node needs an ID.");
            continue;
        }
        if (byId.has(node.id)) errors.push(`Duplicate route node ID “${node.id}”.`);
        if (!Number.isFinite(Number(node.x)) || !Number.isFinite(Number(node.y))) errors.push(`Route node “${node.id}” has non-finite coordinates.`);
        byId.set(node.id, node);
    }
    const start = byId.get(graph?.startNodeId);
    const exit = byId.get(graph?.exitNodeId);
    if (!start || start.kind !== "entrance") errors.push("The route does not identify a valid entrance node.");
    if (!exit || exit.kind !== "exit") errors.push("The route does not identify a valid exit node.");

    const mainNodes = nodes.filter((node) => node.mandatory).sort((a, b) => Number(a.progress) - Number(b.progress));
    metrics.mainNodeCount = mainNodes.length;
    if (mainNodes[0]?.id !== graph?.startNodeId) errors.push("The mandatory route does not begin at the entrance.");
    if (mainNodes.at(-1)?.id !== graph?.exitNodeId) errors.push("The mandatory route does not end at the exit.");

    const edgeKeys = new Set();
    const outgoing = new Map(nodes.map((node) => [node.id, []]));
    const incoming = new Map(nodes.map((node) => [node.id, []]));
    for (const edge of edges) {
        if (!edge?.from || !edge?.to || !byId.has(edge.from) || !byId.has(edge.to)) {
            errors.push(`Route edge “${edge?.id || "unnamed"}” references a missing node.`);
            continue;
        }
        if (edge.from === edge.to) errors.push(`Route edge “${edge.id || edge.from}” loops to itself.`);
        const key = `${edge.from}->${edge.to}`;
        if (edgeKeys.has(key)) errors.push(`Duplicate route edge “${key}”.`);
        edgeKeys.add(key);
        outgoing.get(edge.from).push(edge.to);
        incoming.get(edge.to).push(edge.from);
        const a = byId.get(edge.from);
        const b = byId.get(edge.to);
        const length = distance(a, b);
        metrics.maxEdgeLength = Math.max(metrics.maxEdgeLength, length);
        if (edge.mandatory !== false && b.x < a.x - theme.route.nodeSpacing * 0.05) metrics.backtrackEdges += 1;
        if (Number(b.progress) <= Number(a.progress)) errors.push(`Route edge “${edge.id || key}” does not advance progression.`);
    }

    for (let index = 0; index < mainNodes.length - 1; index += 1) {
        const from = mainNodes[index].id;
        const to = mainNodes[index + 1].id;
        if (!edges.some((edge) => edge.from === from && edge.to === to && edge.mandatory)) {
            errors.push(`Mandatory route connection ${from} → ${to} is missing.`);
        }
    }

    if (start && exit) {
        const reachable = graphReachable(start.id, outgoing);
        if (!reachable.has(exit.id)) errors.push("The exit is not reachable from the entrance.");
        for (const node of nodes) {
            if (!reachable.has(node.id)) errors.push(`Route node “${node.id}” is unreachable from the entrance.`);
        }
        const reverseReachable = graphReachable(exit.id, incoming);
        for (const node of nodes) {
            if (!reverseReachable.has(node.id)) errors.push(`Route node “${node.id}” cannot rejoin the route before the exit.`);
        }
        const rightmostX = Math.max(...nodes.map((node) => Number(node.x) || 0));
        const risingSnakeCandidate = graph?.generatorId === "rising-snake-route-v1" || graph?.macro?.patternId === "rising-snake";
        if (!risingSnakeCandidate && exit.x < rightmostX - 1) errors.push("The exit is not the rightmost route node.");
        if (exit.x <= start.x) errors.push("The route exit must be to the right of its entrance.");
    }

    for (let aIndex = 0; aIndex < nodes.length; aIndex += 1) {
        for (let bIndex = aIndex + 1; bIndex < nodes.length; bIndex += 1) {
            metrics.minNodeDistance = Math.min(metrics.minNodeDistance, distance(nodes[aIndex], nodes[bIndex]));
        }
    }
    if (!Number.isFinite(metrics.minNodeDistance)) metrics.minNodeDistance = 0;
    const mostlyHorizontalCandidate = graph?.macro?.patternId === "mostly-horizontal";
    const risingSnakeCandidate = graph?.macro?.patternId === "rising-snake";
    const minimumReadableNodeDistance = mostlyHorizontalCandidate ? 84 : 135;
    const warningNodeDistance = mostlyHorizontalCandidate ? 118 : 190;
    if (metrics.minNodeDistance < minimumReadableNodeDistance) errors.push("Two route nodes are too close to read or build independently.");
    else if (metrics.minNodeDistance < warningNodeDistance) warnings.push("Some route nodes are close; later geometry must preserve separate landing space.");

    const segments = edges
        .filter((edge) => edge.mandatory !== false && byId.has(edge.from) && byId.has(edge.to))
        .map((edge) => ({ edge, a: byId.get(edge.from), b: byId.get(edge.to) }));
    for (let aIndex = 0; aIndex < segments.length; aIndex += 1) {
        for (let bIndex = aIndex + 1; bIndex < segments.length; bIndex += 1) {
            const first = segments[aIndex];
            const second = segments[bIndex];
            if ([first.edge.from, first.edge.to].some((id) => id === second.edge.from || id === second.edge.to)) continue;
            if (segmentsIntersect(first.a, first.b, second.a, second.b)) metrics.edgeCrossings += 1;
        }
    }
    if (metrics.edgeCrossings > 0) errors.push(`The abstract route contains ${metrics.edgeCrossings} crossing connection${metrics.edgeCrossings === 1 ? "" : "s"}.`);

    if (mainNodes.length > 1) {
        const spacings = [];
        const horizontalSigns = [];
        const verticalSigns = [];
        let eastwardRun = 0;
        for (let index = 1; index < mainNodes.length; index += 1) {
            const previous = mainNodes[index - 1];
            const current = mainNodes[index];
            const dx = current.x - previous.x;
            const dy = current.y - previous.y;
            spacings.push(distance(previous, current));
            metrics.horizontalTravel += Math.abs(dx);
            metrics.verticalTravel += Math.abs(dy);
            const horizontalSign = Math.abs(dx) >= theme.route.nodeSpacing * 0.08 ? Math.sign(dx) : 0;
            const verticalSign = Math.abs(dy) >= theme.route.verticalStep * 0.22 ? Math.sign(dy) : 0;
            if (horizontalSign) horizontalSigns.push(horizontalSign);
            if (verticalSign) verticalSigns.push(verticalSign);
            if (horizontalSign > 0) {
                eastwardRun += 1;
                metrics.longestEastwardRun = Math.max(metrics.longestEastwardRun, eastwardRun);
            } else if (horizontalSign < 0) {
                eastwardRun = 0;
            }
        }
        for (let index = 1; index < horizontalSigns.length; index += 1) {
            if (horizontalSigns[index] !== horizontalSigns[index - 1]) metrics.horizontalDirectionChanges += 1;
        }
        for (let index = 1; index < verticalSigns.length; index += 1) {
            if (verticalSigns[index] !== verticalSigns[index - 1]) metrics.verticalDirectionChanges += 1;
        }
        metrics.averageMainSpacing = average(spacings);
        const xs = mainNodes.map((node) => node.x);
        const ys = mainNodes.map((node) => node.y);
        metrics.routeWidth = Math.max(...xs) - Math.min(...xs);
        metrics.routeHeight = Math.max(...ys) - Math.min(...ys);
        metrics.verticalSpan = metrics.routeHeight;
        metrics.aspectRatio = metrics.routeWidth / Math.max(1, metrics.routeHeight);
        const laneThreshold = Math.max(480, theme.cavern.corridorRadiusY * 1.05);
        const sortedYs = [...ys].sort((a, b) => a - b);
        let laneCount = sortedYs.length ? 1 : 0;
        let laneMean = sortedYs[0] || 0;
        let laneMembers = 1;
        for (const y of sortedYs.slice(1)) {
            if (y - laneMean > laneThreshold) {
                laneCount += 1;
                laneMean = y;
                laneMembers = 1;
            } else {
                laneMean = (laneMean * laneMembers + y) / (laneMembers + 1);
                laneMembers += 1;
            }
        }
        metrics.occupiedLaneCount = laneCount;
    }
    const mostlyHorizontalRoute = graph?.generatorId === "mostly-horizontal-route-v1" || graph?.macro?.patternId === "mostly-horizontal";
    const risingSnakeRoute = graph?.generatorId === "rising-snake-route-v1" || graph?.macro?.patternId === "rising-snake";
    const thePath74Route = graph?.generatorId === "the-path74-route-v4" || graph?.macro?.patternId === "the-path74" || mostlyHorizontalRoute || risingSnakeRoute;
    const maximumRouteEdgeLength = thePath74Route
        ? finiteNumber(graph?.macro?.maximumEdgeLength, theme.route.nodeSpacing * 3.2)
        : theme.route.nodeSpacing * 2.25;
    if (metrics.maxEdgeLength > maximumRouteEdgeLength) errors.push("A route connection is too long for a useful chamber-to-chamber plan.");
    const maxBacktracks = mostlyHorizontalRoute
        ? 0
        : risingSnakeRoute
            ? 1
        : thePath74Route
            ? Math.max(2, Math.ceil((mainNodes.length - 1) * 0.62))
            : Math.max(1, Math.ceil((mainNodes.length - 1) * (0.05 + settings.winding * 0.16)));
    if (metrics.backtrackEdges > maxBacktracks) errors.push("The route backtracks too often for the selected macro pattern.");
    const foldedRoute = !mostlyHorizontalRoute && !risingSnakeRoute && (graph?.version >= 3 || Array.isArray(graph?.macro?.spatialAnchors));
    if (foldedRoute && settings.length !== "compact" && settings.winding >= 0.2 && metrics.backtrackEdges === 0) {
        errors.push("The folded route contains no mandatory leftward phase.");
    }
    const maximumAspectRatio = mostlyHorizontalRoute
        ? (settings.length === "compact" ? 40 : 100)
        : risingSnakeRoute
            ? 6
        : thePath74Route
            ? (settings.length === "compact" ? 12 : 10)
            : settings.length === "compact" ? 8.5 : settings.length === "grand" ? 4.8 : 5.2;
    if ((foldedRoute || mostlyHorizontalRoute) && metrics.aspectRatio > maximumAspectRatio) errors.push(`The route is still too wide and shallow (${roundCoordinate(metrics.aspectRatio)}:1).`);
    else if (foldedRoute && settings.length !== "compact" && metrics.aspectRatio > maximumAspectRatio * 0.86) warnings.push("The route remains close to the maximum wide-corridor aspect ratio.");
    if (foldedRoute && settings.length !== "compact" && metrics.horizontalDirectionChanges < 2) warnings.push("The route has too little horizontal rhythm for a folded cavern.");
    if (foldedRoute && settings.verticality >= 0.45 && metrics.occupiedLaneCount < 2) errors.push("The route does not occupy multiple vertically separated lanes.");
    if (risingSnakeRoute) {
        const routeSegments = Array.isArray(graph?.macro?.segments) ? graph.macro.segments : [];
        const expectedDirections = ["right", "up", null, "up", "right"];
        if (routeSegments.length !== expectedDirections.length) {
            errors.push("Rising Snake routes must contain exactly five macro segments.");
        } else {
            for (let index = 0; index < expectedDirections.length; index += 1) {
                const segment = routeSegments[index];
                const direction = String(segment?.direction || "");
                const length = finiteNumber(segment?.length, 0);
                if (expectedDirections[index] && direction !== expectedDirections[index]) errors.push(`Rising Snake segment ${index + 1} must travel ${expectedDirections[index]}.`);
                if (index === 2 && !["left", "right"].includes(direction)) errors.push("The middle Rising Snake segment must travel left or right.");
                if (direction === "up" && (length < 1 || length > 2)) errors.push("Rising Snake climbs must be one or two vertical screens tall.");
                if (["left", "right"].includes(direction) && (length < 1 || length > 4)) errors.push("Rising Snake horizontal runs must be one to four screens long.");
            }
        }
        if (metrics.verticalTravel < 1440 - 1) errors.push("Rising Snake routes must climb twice before the exit.");
        if (metrics.backtrackEdges > 1) errors.push("Rising Snake routes may contain only the single optional middle leftward run.");
    }

    if (mostlyHorizontalRoute) {
        const verticalSegments = Array.isArray(graph?.macro?.segments)
            ? graph.macro.segments.filter((segment) => segment.direction === "up" || segment.direction === "down")
            : [];
        if (verticalSegments.some((segment) => finiteNumber(segment.length, 0) < 1 || finiteNumber(segment.length, 0) > 2)) {
            errors.push("Horizontal routes may use only one- or two-cell vertical steps.");
        }
        if (metrics.backtrackEdges !== 0) errors.push("Horizontal routes must advance steadily toward the exit.");
        if (metrics.horizontalTravel < metrics.verticalTravel * 5) errors.push("The horizontal route contains too much vertical travel.");
    }

    for (const room of graph?.macro?.rooms || []) {
        metrics.largestRoomWidthScreens = Math.max(metrics.largestRoomWidthScreens, finiteNumber(room?.widthScreens, 0));
        metrics.largestRoomHeightScreens = Math.max(metrics.largestRoomHeightScreens, finiteNumber(room?.heightScreens, 0));
    }

    let qualityScore = 100;
    qualityScore -= metrics.edgeCrossings * 35;
    qualityScore -= Math.max(0, 210 - metrics.minNodeDistance) * 0.12;
    const macroAnchorValues = Array.isArray(graph?.macro?.anchors)
        ? graph.macro.anchors.map((entry) => finiteNumber(entry?.value, 0))
        : [];
    const targetSpan = thePath74Route
        ? finiteNumber(graph?.macro?.targetVerticalSpan, metrics.verticalSpan)
        : macroAnchorValues.length > 1
            ? (Math.max(...macroAnchorValues) - Math.min(...macroAnchorValues)) * finiteNumber(graph?.macro?.halfSpan, theme.route.macroVerticalSpan * 0.55)
            : theme.route.verticalStep * (0.55 + settings.verticality * 4.2);
    qualityScore -= Math.min(18, Math.abs(metrics.verticalSpan - targetSpan) / Math.max(100, targetSpan) * 22);
    const lengthSpacingScale = settings.length === "compact" ? 1.22 : settings.length === "standard" ? 0.96 : settings.length === "extended" ? 1.02 : 1.15;
    const targetSpacing = thePath74Route
        ? finiteNumber(graph?.macro?.targetAverageNodeSpacing, metrics.averageMainSpacing)
        : theme.route.nodeSpacing * lengthSpacingScale * Math.sqrt(1 + settings.verticality * 0.08);
    qualityScore -= Math.min(12, Math.abs(metrics.averageMainSpacing - targetSpacing) / Math.max(1, theme.route.nodeSpacing) * 16);
    const targetAspect = finiteNumber(graph?.macro?.targetAspectRatio, settings.length === "compact" ? 6.8 : 3.3);
    qualityScore -= Math.min(22, Math.abs(metrics.aspectRatio - targetAspect) * 5.5);
    if (foldedRoute) {
        if (settings.length !== "compact") {
            qualityScore -= Math.max(0, 2 - metrics.horizontalDirectionChanges) * 7;
            qualityScore -= Math.max(0, metrics.longestEastwardRun - Math.ceil((mainNodes.length - 1) * 0.48)) * 2.5;
            const travelExpansion = metrics.horizontalTravel / Math.max(1, metrics.routeWidth);
            if (settings.winding > 0.35 && travelExpansion < 1.22) qualityScore -= 10;
        }
        qualityScore -= Math.max(0, 1 - metrics.verticalDirectionChanges) * 5;
        qualityScore -= Math.max(0, 2 - metrics.occupiedLaneCount) * 8;
    } else if (mostlyHorizontalRoute) {
        qualityScore -= Math.max(0, metrics.verticalTravel * 6 - metrics.horizontalTravel) / Math.max(1, theme.route.nodeSpacing) * 4;
        qualityScore -= Math.max(0, 1 - metrics.verticalDirectionChanges) * 2;
    } else if (risingSnakeRoute) {
        qualityScore -= Math.max(0, 1440 - metrics.verticalTravel) / 180;
        qualityScore -= Math.max(0, metrics.backtrackEdges - 1) * 8;
    } else if (settings.winding > 0.7 && metrics.backtrackEdges === 0) {
        qualityScore -= 4;
    }
    if (settings.verticality > 0.55 && longestFlatRun(mainNodes, theme.route.verticalStep * 0.22) > 4 && !graph?.macro?.patternId?.startsWith("l-")) qualityScore -= 7;
    if (graph?.macro?.patternId) {
        const expectedRooms = risingSnakeRoute ? 2 : thePath74Route ? 3 : desiredMacroRoomCount(settings.length);
        qualityScore -= Math.abs(metrics.macroRoomCount - expectedRooms) * 4;
        if (metrics.macroRoomCount === 0) errors.push("The macro route did not reserve any large cavern room.");
        if (metrics.largestRoomWidthScreens < 1.1 || metrics.largestRoomHeightScreens < 1.05) warnings.push("The largest reserved room is barely larger than one screen.");
    }
    qualityScore -= errors.length * 40;
    qualityScore -= warnings.length * 1.5;
    qualityScore = Math.max(0, Math.min(100, Math.round(qualityScore * 10) / 10));

    return {
        valid: errors.length === 0,
        qualityScore,
        errors,
        warnings,
        metrics
    };
}

export function routeGraphBounds(route, padding = 180) {
    const nodes = Array.isArray(route?.nodes) ? route.nodes : [];
    if (!nodes.length) return null;
    const minX = Math.min(...nodes.map((node) => Number(node.x) || 0));
    const minY = Math.min(...nodes.map((node) => Number(node.y) || 0));
    const maxX = Math.max(...nodes.map((node) => Number(node.x) || 0));
    const maxY = Math.max(...nodes.map((node) => Number(node.y) || 0));
    const amount = Math.max(0, Number(padding) || 0);
    return { x: minX - amount, y: minY - amount, w: maxX - minX + amount * 2, h: maxY - minY + amount * 2 };
}

function normalizeGeneratedCavernRecord(value) {
    if (!value || typeof value !== "object") return undefined;
    return JSON.parse(JSON.stringify(value));
}

export function normalizeLevelGeneration(value) {
    if (!value || typeof value !== "object" || !value.route) return null;
    if (String(value.generatorId || "") !== AUTOMATIC_LEVEL_GENERATOR_ID) {
        throw new Error(`Unsupported automatic level generator record “${String(value.generatorId || "missing generator ID")}”.`);
    }
    const implementations = normalizeGeneratorImplementations(value.implementations);
    const route = value.route && typeof value.route === "object" ? value.route : {};
    if (String(route.generatorId || "") !== implementations.route) {
        throw new Error(`Generated route implementation “${String(route.generatorId || "missing route ID")}” does not match the current record.`);
    }
    const nodes = Array.isArray(route.nodes) ? route.nodes.map((node, index) => ({
        id: String(node?.id || `route_node_${index}`),
        kind: String(node?.kind || "chamber"),
        x: finiteNumber(node?.x, 0),
        y: finiteNumber(node?.y, 0),
        progress: finiteNumber(node?.progress, index),
        mandatory: Boolean(node?.mandatory),
        label: node?.label ? String(node.label) : undefined,
        macroPatternId: node?.macroPatternId ? String(node.macroPatternId) : undefined,
        spatialLane: Number.isFinite(Number(node?.spatialLane)) ? Number(node.spatialLane) : undefined,
        macroRoomId: node?.macroRoomId ? String(node.macroRoomId) : undefined,
        roomWidthScreens: Number.isFinite(Number(node?.roomWidthScreens)) ? Number(node.roomWidthScreens) : undefined,
        roomHeightScreens: Number.isFinite(Number(node?.roomHeightScreens)) ? Number(node.roomHeightScreens) : undefined,
        rareLargeRoom: node?.rareLargeRoom ? true : undefined,
        pathCellIndex: Number.isFinite(Number(node?.pathCellIndex)) ? Number(node.pathCellIndex) : undefined
    })) : [];
    const ids = new Set(nodes.map((node) => node.id));
    const edges = Array.isArray(route.edges) ? route.edges
        .filter((edge) => edge && ids.has(String(edge.from)) && ids.has(String(edge.to)))
        .map((edge, index) => ({
            id: String(edge.id || `route_edge_${index}`),
            from: String(edge.from),
            to: String(edge.to),
            mandatory: Boolean(edge.mandatory),
            intendedDirection: edge.intendedDirection ? String(edge.intendedDirection) : undefined
        })) : [];
    return {
        version: Math.max(1, Math.floor(Number(value.version) || AUTOMATIC_LEVEL_GENERATOR_VERSION)),
        generatorId: AUTOMATIC_LEVEL_GENERATOR_ID,
        runId: String(value.runId || route.runId || ""),
        themeId: String(value.themeId || DEFAULT_THEME.themeId),
        seed: String(value.seed ?? "0"),
        attempt: Math.max(1, Math.floor(Number(value.attempt) || 1)),
        attemptsTried: Math.max(1, Math.floor(Number(value.attemptsTried) || 1)),
        stageRevisions: normalizeGeneratorStageRevisions(value.stageRevisions),
        implementations,
        settings: normalizeGeneratorSettings(value.settings),
        resolvedEnemyIds: normalizeStringArray(value.resolvedEnemyIds),
        route: {
            version: Math.max(1, Math.floor(Number(route.version) || 1)),
            runId: String(route.runId || value.runId || ""),
            generatorId: implementations.route,
            startNodeId: String(route.startNodeId || nodes.find((node) => node.kind === "entrance")?.id || ""),
            exitNodeId: String(route.exitNodeId || nodes.find((node) => node.kind === "exit")?.id || ""),
            macro: route.macro && typeof route.macro === "object" ? JSON.parse(JSON.stringify(route.macro)) : undefined,
            nodes,
            edges,
            validation: normalizeGenerationValidation(route.validation || value.validation)
        },
        cavern: normalizeGeneratedCavernRecord(value.cavern),
        traversal: value.traversal && typeof value.traversal === "object" ? JSON.parse(JSON.stringify(value.traversal)) : undefined,
        endpoints: value.endpoints && typeof value.endpoints === "object" ? JSON.parse(JSON.stringify(value.endpoints)) : undefined,
        encounters: value.encounters && typeof value.encounters === "object" ? JSON.parse(JSON.stringify(value.encounters)) : undefined,
        rewards: value.rewards && typeof value.rewards === "object" ? JSON.parse(JSON.stringify(value.rewards)) : undefined,
        decoration: value.decoration && typeof value.decoration === "object" ? JSON.parse(JSON.stringify(value.decoration)) : undefined,
        replacedLevelShell: value.replacedLevelShell && typeof value.replacedLevelShell === "object"
            ? JSON.parse(JSON.stringify(value.replacedLevelShell))
            : undefined,
        validation: normalizeGenerationValidation(value.validation || route.validation),
        diagnostics: value.diagnostics && typeof value.diagnostics === "object" ? JSON.parse(JSON.stringify(value.diagnostics)) : {}
    };
}

function desiredMacroRoomCount(length) {
    if (length === "compact") return 1;
    if (length === "standard") return 2;
    if (length === "extended") return 3;
    return 4;
}

const THE_PATH74_DIRECTIONS = Object.freeze({
    right: Object.freeze({ dx: 1, dy: 0 }),
    left: Object.freeze({ dx: -1, dy: 0 }),
    up: Object.freeze({ dx: 0, dy: -1 }),
    down: Object.freeze({ dx: 0, dy: 1 })
});

const THE_PATH74_LEFT_TURN = Object.freeze({ right: "up", up: "left", left: "down", down: "right" });
const THE_PATH74_RIGHT_TURN = Object.freeze({ right: "down", down: "left", left: "up", up: "right" });
const THE_PATH74_LENGTHS = Object.freeze({ compact: 8, standard: 12, extended: 17, grand: 23 });
const THE_PATH74_MINIMUM_CELLS = Object.freeze({ compact: 16, standard: 24, extended: 34, grand: 44 });

function thePath74CellKey(cell) {
    return `${cell.gx},${cell.gy}`;
}

function thePath74ChebyshevDistance(a, b) {
    return Math.max(Math.abs(a.gx - b.gx), Math.abs(a.gy - b.gy));
}

function thePath74MovedCell(cell, direction) {
    const vector = THE_PATH74_DIRECTIONS[direction];
    return { gx: cell.gx + vector.dx, gy: cell.gy + vector.dy };
}

function thePath74RequestedLength(rng, direction) {
    return direction === "up" || direction === "down" ? rng.int(1, 4) : rng.int(1, 7);
}

function thePath74StepIsSafe(path, occupied, direction) {
    const current = path.at(-1);
    const candidate = thePath74MovedCell(current, direction);
    const lookahead = thePath74MovedCell(candidate, direction);
    if (occupied.has(thePath74CellKey(candidate)) || occupied.has(thePath74CellKey(lookahead))) return false;
    const localKeys = new Set(path.slice(-2).map(thePath74CellKey));
    for (const oldCell of path) {
        if (localKeys.has(thePath74CellKey(oldCell))) continue;
        if (thePath74ChebyshevDistance(candidate, oldCell) <= 1) return false;
        if (thePath74ChebyshevDistance(lookahead, oldCell) <= 1) return false;
    }
    return true;
}

function buildThePath74GridPlan({ settings, rng }) {
    const totalSegments = THE_PATH74_LENGTHS[settings.length] || THE_PATH74_LENGTHS.standard;
    const middleSegments = Math.max(3, totalSegments - 1);
    const minimumCells = THE_PATH74_MINIMUM_CELLS[settings.length] || THE_PATH74_MINIMUM_CELLS.standard;
    const minimumRows = settings.length === "compact" ? 3 : 5;
    for (let reroll = 0; reroll < 1200; reroll += 1) {
        const path = [{ gx: 0, gy: 0 }];
        const occupied = new Set([thePath74CellKey(path[0])]);
        const segments = [];
        let direction = "right";
        let failed = false;
        for (let segmentIndex = 0; segmentIndex < middleSegments; segmentIndex += 1) {
            const requestedLength = thePath74RequestedLength(rng, direction);
            const startPathIndex = path.length - 1;
            let taken = 0;
            while (taken < requestedLength && thePath74StepIsSafe(path, occupied, direction)) {
                const next = thePath74MovedCell(path.at(-1), direction);
                path.push(next);
                occupied.add(thePath74CellKey(next));
                taken += 1;
            }
            if (!taken) {
                failed = true;
                break;
            }
            segments.push({ direction, requestedLength, length: taken, startPathIndex, endPathIndex: path.length - 1 });
            direction = rng.chance(0.5) ? THE_PATH74_LEFT_TURN[direction] : THE_PATH74_RIGHT_TURN[direction];
        }
        if (failed) continue;
        const finalDirection = "right";
        const requestedLength = thePath74RequestedLength(rng, finalDirection);
        const startPathIndex = path.length - 1;
        let taken = 0;
        while (taken < requestedLength && thePath74StepIsSafe(path, occupied, finalDirection)) {
            const next = thePath74MovedCell(path.at(-1), finalDirection);
            path.push(next);
            occupied.add(thePath74CellKey(next));
            taken += 1;
        }
        if (!taken) continue;
        segments.push({ direction: finalDirection, requestedLength, length: taken, startPathIndex, endPathIndex: path.length - 1 });

        const xs = path.map((cell) => cell.gx);
        const ys = path.map((cell) => cell.gy);
        const horizontalDirections = segments.filter((segment) => segment.direction === "left" || segment.direction === "right").map((segment) => segment.direction);
        const leftwardSegments = horizontalDirections.filter((value) => value === "left").length;
        let horizontalDirectionChanges = 0;
        for (let index = 1; index < horizontalDirections.length; index += 1) {
            if (horizontalDirections[index] !== horizontalDirections[index - 1]) horizontalDirectionChanges += 1;
        }
        if (path.length < minimumCells) continue;
        if (new Set(ys).size < minimumRows) continue;
        if (path.at(-1).gx <= 0 || path.at(-1).gx !== Math.max(...xs)) continue;
        if (settings.length !== "compact" && settings.winding >= 0.2 && leftwardSegments < 1) continue;
        if (settings.length !== "compact" && settings.winding >= 0.45 && horizontalDirectionChanges < 2) continue;
        return {
            version: 1,
            path,
            segments,
            leftwardSegments,
            horizontalDirectionChanges,
            bounds: {
                minGX: Math.min(...xs),
                maxGX: Math.max(...xs),
                minGY: Math.min(...ys),
                maxGY: Math.max(...ys)
            }
        };
    }
    throw new Error("ThePath74 could not find a protected orthogonal route.");
}

function buildMostlyHorizontalGridPlan({ settings, rng }) {
    const horizontalSegmentCounts = Object.freeze({ compact: 4, standard: 6, extended: 8, grand: 11 });
    const horizontalSegmentCount = horizontalSegmentCounts[settings.length] || horizontalSegmentCounts.standard;
    const maximumLane = settings.length === "compact"
        ? 1
        : settings.length === "grand"
            ? 2 + (settings.verticality >= 0.68 ? 1 : 0)
            : 2;
    const path = [{ gx: 0, gy: 0 }];
    const segments = [];
    const baseVerticalCounts = Object.freeze({ compact: 1, standard: 2, extended: 2, grand: 3 });
    const requestedVerticalCount = Math.min(
        horizontalSegmentCount - 1,
        (baseVerticalCounts[settings.length] || baseVerticalCounts.standard) + (settings.verticality >= 0.76 ? 1 : 0)
    );
    const verticalAfter = new Set();
    for (let index = 0; index < requestedVerticalCount; index += 1) {
        const preferred = Math.round((index + 1) * horizontalSegmentCount / (requestedVerticalCount + 1)) - 1;
        const candidates = [preferred, preferred - 1, preferred + 1, preferred - 2, preferred + 2]
            .filter((candidate) => candidate >= 0 && candidate < horizontalSegmentCount - 1 && !verticalAfter.has(candidate));
        if (candidates.length) verticalAfter.add(candidates[rng.int(0, Math.min(2, candidates.length - 1))]);
    }
    let verticalDirection = rng.chance(0.5) ? "up" : "down";
    for (let horizontalIndex = 0; horizontalIndex < horizontalSegmentCount; horizontalIndex += 1) {
        const horizontalLength = rng.int(3, 7);
        const horizontalStart = path.length - 1;
        for (let step = 0; step < horizontalLength; step += 1) {
            path.push(thePath74MovedCell(path.at(-1), "right"));
        }
        segments.push({
            direction: "right",
            requestedLength: horizontalLength,
            length: horizontalLength,
            startPathIndex: horizontalStart,
            endPathIndex: path.length - 1
        });
        if (horizontalIndex >= horizontalSegmentCount - 1 || !verticalAfter.has(horizontalIndex)) continue;

        const currentLane = path.at(-1).gy;
        if (currentLane <= -maximumLane) verticalDirection = "down";
        else if (currentLane >= maximumLane) verticalDirection = "up";
        else if (rng.chance(0.38 + settings.winding * 0.22)) verticalDirection = verticalDirection === "up" ? "down" : "up";
        const verticalLength = rng.int(1, 2);
        const signedLength = verticalDirection === "up" ? -verticalLength : verticalLength;
        if (Math.abs(currentLane + signedLength) > maximumLane) verticalDirection = verticalDirection === "up" ? "down" : "up";
        const verticalStart = path.length - 1;
        for (let step = 0; step < verticalLength; step += 1) {
            path.push(thePath74MovedCell(path.at(-1), verticalDirection));
        }
        segments.push({
            direction: verticalDirection,
            requestedLength: verticalLength,
            length: verticalLength,
            startPathIndex: verticalStart,
            endPathIndex: path.length - 1
        });
    }
    const xs = path.map((cell) => cell.gx);
    const ys = path.map((cell) => cell.gy);
    let verticalDirectionChanges = 0;
    const verticalDirections = segments.filter((segment) => segment.direction === "up" || segment.direction === "down");
    for (let index = 1; index < verticalDirections.length; index += 1) {
        if (verticalDirections[index].direction !== verticalDirections[index - 1].direction) verticalDirectionChanges += 1;
    }
    return {
        version: 1,
        path,
        segments,
        leftwardSegments: 0,
        horizontalDirectionChanges: 0,
        verticalDirectionChanges,
        bounds: {
            minGX: Math.min(...xs),
            maxGX: Math.max(...xs),
            minGY: Math.min(...ys),
            maxGY: Math.max(...ys)
        }
    };
}

function buildRisingSnakeGridPlan({ rng }) {
    for (let reroll = 0; reroll < 120; reroll += 1) {
        const firstHorizontalLength = rng.int(1, 4);
        const firstVerticalLength = rng.int(1, 2);
        const middleDirection = rng.chance(0.5) ? "left" : "right";
        const middleHorizontalLength = rng.int(1, 4);
        const secondVerticalLength = rng.int(1, 2);
        const finalHorizontalLength = rng.int(1, 4);
        const path = [{ gx: 0, gy: 0 }];
        const segments = [];
        const appendSegment = (direction, length) => {
            const startPathIndex = path.length - 1;
            for (let step = 0; step < length; step += 1) path.push(thePath74MovedCell(path.at(-1), direction));
            segments.push({
                direction,
                requestedLength: length,
                length,
                startPathIndex,
                endPathIndex: path.length - 1
            });
        };
        appendSegment("right", firstHorizontalLength);
        appendSegment("up", firstVerticalLength);
        appendSegment(middleDirection, middleHorizontalLength);
        appendSegment("up", secondVerticalLength);
        appendSegment("right", finalHorizontalLength);
        if (path.at(-1).gx <= 0) continue;
        const xs = path.map((cell) => cell.gx);
        const ys = path.map((cell) => cell.gy);
        return {
            version: 1,
            path,
            segments,
            leftwardSegments: middleDirection === "left" ? 1 : 0,
            horizontalDirectionChanges: middleDirection === "left" ? 2 : 0,
            verticalDirectionChanges: 0,
            bounds: {
                minGX: Math.min(...xs),
                maxGX: Math.max(...xs),
                minGY: Math.min(...ys),
                maxGY: Math.max(...ys)
            }
        };
    }
    throw new Error("Rising Snake could not find a route that finishes to the right of its entrance.");
}

function buildThePath74BoundaryLabels(path) {
    const pathKeys = new Set(path.map(thePath74CellKey));
    const boundary = new Map();
    for (const cell of path) {
        for (let dy = -1; dy <= 1; dy += 1) {
            for (let dx = -1; dx <= 1; dx += 1) {
                if (!dx && !dy) continue;
                const candidate = { gx: cell.gx + dx, gy: cell.gy + dy };
                const key = thePath74CellKey(candidate);
                if (!pathKeys.has(key)) boundary.set(key, candidate);
            }
        }
    }
    const labels = new Map();
    for (const [key, boundaryCell] of boundary) {
        let bestIndex = 0;
        let bestDistance = Infinity;
        for (let index = 0; index < path.length; index += 1) {
            const dx = boundaryCell.gx - path[index].gx;
            const dy = boundaryCell.gy - path[index].gy;
            const distanceSquared = dx * dx + dy * dy;
            if (distanceSquared < bestDistance) {
                bestDistance = distanceSquared;
                bestIndex = index;
            }
        }
        labels.set(key, bestIndex);
    }
    return { boundary, labels };
}

function chooseThePath74Rooms(path, rng) {
    const roomCount = rng.int(2, 4);
    const { boundary, labels } = buildThePath74BoundaryLabels(path);
    const allowedIndices = Array.from({ length: Math.max(0, path.length - 8) }, (_, index) => index + 4);
    const minimumGap = Math.max(4, Math.floor(path.length / Math.max(1, roomCount * 3)));
    const chosen = [];
    for (const index of rng.shuffle(allowedIndices)) {
        if (chosen.some((other) => Math.abs(other - index) < minimumGap)) continue;
        chosen.push(index);
        if (chosen.length >= roomCount) break;
    }
    while (chosen.length < roomCount && allowedIndices.length) {
        const fallback = allowedIndices[rng.int(0, allowedIndices.length - 1)];
        if (!chosen.includes(fallback)) chosen.push(fallback);
    }
    chosen.sort((a, b) => a - b);
    const boundaryByPathIndex = new Map();
    for (const [key, pathIndex] of labels) {
        if (!boundaryByPathIndex.has(pathIndex)) boundaryByPathIndex.set(pathIndex, []);
        boundaryByPathIndex.get(pathIndex).push(boundary.get(key));
    }
    return chosen.map((pathIndex, roomIndex) => {
        const boundaryCandidates = boundaryByPathIndex.get(pathIndex) || [];
        const useBoundary = boundaryCandidates.length > 0 && rng.chance(0.6);
        const anchor = useBoundary ? boundaryCandidates[rng.int(0, boundaryCandidates.length - 1)] : path[pathIndex];
        return {
            id: `macro_room_${String(roomIndex + 1).padStart(2, "0")}`,
            pathIndex,
            label: pathIndex + 1,
            anchorSource: useBoundary ? "boundary" : "path",
            gx: anchor.gx,
            gy: anchor.gy,
            semiAxisX: rng.int(2, 4),
            semiAxisY: rng.int(2, 4)
        };
    });
}

function buildThePath74RouteCandidate({ theme, settings, rng, attempt }) {
    const gridPlan = buildThePath74GridPlan({ settings, rng });
    const cellSizeX = clamp(theme.route.nodeSpacing * 0.42, 360, 420);
    const cellSizeY = clamp(theme.route.verticalStep * 1.35, 240, 300);
    const rooms = chooseThePath74Rooms(gridPlan.path, rng);
    const roomByPathIndex = new Map(rooms.map((room) => [room.pathIndex, room]));
    const anchorIndices = new Set([0, gridPlan.path.length - 1, ...gridPlan.segments.map((segment) => segment.endPathIndex), ...rooms.map((room) => room.pathIndex)]);
    const orderedAnchorIndices = [...anchorIndices].sort((a, b) => a - b);
    const mainNodes = orderedAnchorIndices.map((pathIndex, index) => {
        const cell = gridPlan.path[pathIndex];
        const room = roomByPathIndex.get(pathIndex);
        const endpoint = index === 0 || index === orderedAnchorIndices.length - 1;
        return {
            id: `route_main_${String(index).padStart(3, "0")}`,
            kind: index === 0 ? "entrance" : index === orderedAnchorIndices.length - 1 ? "exit" : room ? "chamber" : (index % 5 === 0 && settings.safety > 0.58 ? "recovery" : "traversal"),
            x: roundCoordinate(theme.route.startX + cell.gx * cellSizeX),
            y: roundCoordinate(theme.route.baselineY + cell.gy * cellSizeY),
            progress: index,
            mandatory: true,
            label: index === 0 ? "Entrance" : index === orderedAnchorIndices.length - 1 ? "Exit" : room ? `Room ${room.id.split("_").at(-1)}` : `Turn ${index}`,
            macroPatternId: "the-path74",
            spatialLane: cell.gy,
            pathCellIndex: pathIndex
        };
    });
    const nodeByPathIndex = new Map(mainNodes.map((node) => [node.pathCellIndex, node]));
    const enrichedRooms = rooms.map((room) => {
        const widthScreens = clamp((room.semiAxisX * cellSizeX * 2) / 1280, 1.1, 4);
        const heightScreens = clamp((room.semiAxisY * cellSizeY * 2) / 720, 1.05, 3);
        return {
            ...room,
            nodeId: nodeByPathIndex.get(room.pathIndex)?.id,
            centerX: roundCoordinate(theme.route.startX + room.gx * cellSizeX),
            centerY: roundCoordinate(theme.route.baselineY + room.gy * cellSizeY),
            widthScreens: roundCoordinate(widthScreens),
            heightScreens: roundCoordinate(heightScreens),
            rareLargeRoom: false
        };
    });
    const nodes = [...mainNodes];
    const edges = [];
    for (let index = 0; index < mainNodes.length - 1; index += 1) {
        const from = mainNodes[index];
        const to = mainNodes[index + 1];
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const intendedDirection = Math.abs(dx) >= Math.abs(dy)
            ? (dx < 0 ? "left" : "right")
            : (dy < 0 ? "climb" : "descend");
        edges.push({
            id: `route_main_edge_${String(index).padStart(3, "0")}`,
            from: from.id,
            to: to.id,
            mandatory: true,
            intendedDirection
        });
    }
    const spacings = mainNodes.slice(1).map((node, index) => distance(mainNodes[index], node));
    const worldCellPath = gridPlan.path.map((cell, pathIndex) => ({
        pathIndex,
        gx: cell.gx,
        gy: cell.gy,
        x: roundCoordinate(theme.route.startX + cell.gx * cellSizeX),
        y: roundCoordinate(theme.route.baselineY + cell.gy * cellSizeY)
    }));
    return {
        version: 4,
        attempt,
        startNodeId: mainNodes[0].id,
        exitNodeId: mainNodes.at(-1).id,
        macro: {
            version: 4,
            patternId: "the-path74",
            patternLabel: "ThePath74 protected orthogonal segment route",
            cellSizeX: roundCoordinate(cellSizeX),
            cellSizeY: roundCoordinate(cellSizeY),
            cellPath: worldCellPath,
            segments: gridPlan.segments.map((segment, segmentIndex) => ({ ...segment, id: `the_path74_segment_${String(segmentIndex + 1).padStart(2, "0")}` })),
            rooms: enrichedRooms,
            bounds: gridPlan.bounds,
            leftwardSegments: gridPlan.leftwardSegments,
            horizontalDirectionChanges: gridPlan.horizontalDirectionChanges,
            targetVerticalSpan: roundCoordinate((gridPlan.bounds.maxGY - gridPlan.bounds.minGY) * cellSizeY),
            targetAspectRatio: settings.length === "compact" ? 5.8 : 3.8,
            targetAverageNodeSpacing: roundCoordinate(average(spacings)),
            maximumEdgeLength: roundCoordinate(Math.max(cellSizeX * 7, cellSizeY * 4) + 1)
        },
        nodes,
        edges
    };
}

function buildMostlyHorizontalRouteCandidate({ theme, settings, rng, attempt }) {
    const gridPlan = buildMostlyHorizontalGridPlan({ settings, rng });
    const cellSizeX = clamp(theme.route.nodeSpacing * 0.5, 420, 500);
    const cellSizeY = clamp(theme.route.verticalStep, GENERATED_MINIMUM_VERTICAL_PLATFORM_SEPARATION, 220);
    const rooms = chooseThePath74Rooms(gridPlan.path, rng).map((room) => ({
        ...room,
        semiAxisX: clamp(room.semiAxisX + 1, 3, 5),
        semiAxisY: clamp(room.semiAxisY - 1, 1, 3)
    }));
    const roomByPathIndex = new Map(rooms.map((room) => [room.pathIndex, room]));
    const anchorIndices = new Set([0, gridPlan.path.length - 1, ...gridPlan.segments.map((segment) => segment.endPathIndex), ...rooms.map((room) => room.pathIndex)]);
    const orderedAnchorIndices = [...anchorIndices].sort((a, b) => a - b);
    const mainNodes = orderedAnchorIndices.map((pathIndex, index) => {
        const cell = gridPlan.path[pathIndex];
        const room = roomByPathIndex.get(pathIndex);
        return {
            id: `route_main_${String(index).padStart(3, "0")}`,
            kind: index === 0 ? "entrance" : index === orderedAnchorIndices.length - 1 ? "exit" : room ? "chamber" : "traversal",
            x: roundCoordinate(theme.route.startX + cell.gx * cellSizeX),
            y: roundCoordinate(theme.route.baselineY + cell.gy * cellSizeY),
            progress: index,
            mandatory: true,
            label: index === 0 ? "Entrance" : index === orderedAnchorIndices.length - 1 ? "Exit" : room ? `Room ${room.id.split("_").at(-1)}` : `Ground ${index}`,
            macroPatternId: "mostly-horizontal",
            spatialLane: cell.gy,
            pathCellIndex: pathIndex
        };
    });
    const nodeByPathIndex = new Map(mainNodes.map((node) => [node.pathCellIndex, node]));
    const enrichedRooms = rooms.map((room) => {
        const widthScreens = clamp((room.semiAxisX * cellSizeX * 2) / 1280, 1.4, 5.2);
        const heightScreens = clamp((room.semiAxisY * cellSizeY * 2) / 720, 0.7, 1.8);
        return {
            ...room,
            nodeId: nodeByPathIndex.get(room.pathIndex)?.id,
            centerX: roundCoordinate(theme.route.startX + room.gx * cellSizeX),
            centerY: roundCoordinate(theme.route.baselineY + room.gy * cellSizeY),
            widthScreens: roundCoordinate(widthScreens),
            heightScreens: roundCoordinate(heightScreens),
            rareLargeRoom: false
        };
    });
    const nodes = [...mainNodes];
    const edges = [];
    for (let index = 0; index < mainNodes.length - 1; index += 1) {
        const from = mainNodes[index];
        const to = mainNodes[index + 1];
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        edges.push({
            id: `route_main_edge_${String(index).padStart(3, "0")}`,
            from: from.id,
            to: to.id,
            mandatory: true,
            intendedDirection: Math.abs(dx) >= Math.abs(dy) ? "right" : (dy < 0 ? "climb" : "descend")
        });
    }
    const spacings = mainNodes.slice(1).map((node, index) => distance(mainNodes[index], node));
    const worldCellPath = gridPlan.path.map((cell, pathIndex) => ({
        pathIndex,
        gx: cell.gx,
        gy: cell.gy,
        x: roundCoordinate(theme.route.startX + cell.gx * cellSizeX),
        y: roundCoordinate(theme.route.baselineY + cell.gy * cellSizeY)
    }));
    return {
        version: 5,
        attempt,
        startNodeId: mainNodes[0].id,
        exitNodeId: mainNodes.at(-1).id,
        macro: {
            version: 1,
            patternId: "mostly-horizontal",
            patternLabel: "Horizontal run-and-gun route",
            cellSizeX: roundCoordinate(cellSizeX),
            cellSizeY: roundCoordinate(cellSizeY),
            cellPath: worldCellPath,
            segments: gridPlan.segments.map((segment, segmentIndex) => ({ ...segment, id: `horizontal_segment_${String(segmentIndex + 1).padStart(2, "0")}` })),
            rooms: enrichedRooms,
            bounds: gridPlan.bounds,
            leftwardSegments: 0,
            horizontalDirectionChanges: 0,
            verticalDirectionChanges: gridPlan.verticalDirectionChanges,
            targetVerticalSpan: roundCoordinate((gridPlan.bounds.maxGY - gridPlan.bounds.minGY) * cellSizeY),
            targetAspectRatio: settings.length === "compact" ? 8.5 : settings.length === "grand" ? 13 : 10.5,
            targetAverageNodeSpacing: roundCoordinate(average(spacings)),
            maximumEdgeLength: roundCoordinate(Math.max(cellSizeX * 7, cellSizeY * 2) + 1),
            verticalSegmentMaximum: 2,
            runAndGunGround: true
        },
        nodes,
        edges
    };
}

function buildRisingSnakeRouteCandidate({ theme, settings, rng, attempt }) {
    const gridPlan = buildRisingSnakeGridPlan({ settings, rng });
    const cellSizeX = 1280;
    const cellSizeY = 720;
    const segmentEnds = gridPlan.segments.map((segment) => segment.endPathIndex);
    const roomPathIndices = [segmentEnds[1], segmentEnds[3]];
    const rooms = roomPathIndices.map((pathIndex, index) => {
        const cell = gridPlan.path[pathIndex];
        return {
            id: `macro_room_${String(index + 1).padStart(2, "0")}`,
            pathIndex,
            label: pathIndex + 1,
            anchorSource: "path",
            gx: cell.gx,
            gy: cell.gy,
            semiAxisX: rng.int(1, 2),
            semiAxisY: 1
        };
    });
    const roomByPathIndex = new Map(rooms.map((room) => [room.pathIndex, room]));
    const anchorIndices = [0, ...segmentEnds];
    const mainNodes = anchorIndices.map((pathIndex, index) => {
        const cell = gridPlan.path[pathIndex];
        const room = roomByPathIndex.get(pathIndex);
        return {
            id: `route_main_${String(index).padStart(3, "0")}`,
            kind: index === 0 ? "entrance" : index === anchorIndices.length - 1 ? "exit" : room ? "chamber" : "traversal",
            x: roundCoordinate(theme.route.startX + cell.gx * cellSizeX),
            y: roundCoordinate(theme.route.baselineY + cell.gy * cellSizeY),
            progress: index,
            mandatory: true,
            label: index === 0 ? "Entrance" : index === anchorIndices.length - 1 ? "Exit" : room ? `Rising chamber ${room.id.split("_").at(-1)}` : `Rising turn ${index}`,
            macroPatternId: "rising-snake",
            spatialLane: cell.gy,
            pathCellIndex: pathIndex
        };
    });
    const nodeByPathIndex = new Map(mainNodes.map((node) => [node.pathCellIndex, node]));
    const enrichedRooms = rooms.map((room) => ({
        ...room,
        nodeId: nodeByPathIndex.get(room.pathIndex)?.id,
        centerX: roundCoordinate(theme.route.startX + room.gx * cellSizeX),
        centerY: roundCoordinate(theme.route.baselineY + room.gy * cellSizeY),
        widthScreens: roundCoordinate(clamp(room.semiAxisX * 1.35, 1.35, 2.7)),
        heightScreens: 2,
        rareLargeRoom: false
    }));
    const edges = [];
    for (let index = 0; index < mainNodes.length - 1; index += 1) {
        const from = mainNodes[index];
        const to = mainNodes[index + 1];
        const segment = gridPlan.segments[index];
        edges.push({
            id: `route_main_edge_${String(index).padStart(3, "0")}`,
            from: from.id,
            to: to.id,
            mandatory: true,
            intendedDirection: segment.direction === "up" ? "climb" : segment.direction
        });
    }
    const spacings = mainNodes.slice(1).map((node, index) => distance(mainNodes[index], node));
    const worldCellPath = gridPlan.path.map((cell, pathIndex) => ({
        pathIndex,
        gx: cell.gx,
        gy: cell.gy,
        x: roundCoordinate(theme.route.startX + cell.gx * cellSizeX),
        y: roundCoordinate(theme.route.baselineY + cell.gy * cellSizeY)
    }));
    const xs = mainNodes.map((node) => node.x);
    const ys = mainNodes.map((node) => node.y);
    const routeWidth = Math.max(...xs) - Math.min(...xs);
    const routeHeight = Math.max(...ys) - Math.min(...ys);
    return {
        version: 1,
        attempt,
        startNodeId: mainNodes[0].id,
        exitNodeId: mainNodes.at(-1).id,
        macro: {
            version: 1,
            patternId: "rising-snake",
            patternLabel: "Rising Snake five-segment route",
            cellSizeX,
            cellSizeY,
            cellPath: worldCellPath,
            segments: gridPlan.segments.map((segment, segmentIndex) => ({ ...segment, id: `rising_snake_segment_${String(segmentIndex + 1).padStart(2, "0")}` })),
            rooms: enrichedRooms,
            bounds: gridPlan.bounds,
            leftwardSegments: gridPlan.leftwardSegments,
            horizontalDirectionChanges: gridPlan.horizontalDirectionChanges,
            verticalDirectionChanges: 0,
            targetVerticalSpan: roundCoordinate(routeHeight),
            targetAspectRatio: roundCoordinate(routeWidth / Math.max(1, routeHeight)),
            targetAverageNodeSpacing: roundCoordinate(average(spacings)),
            maximumEdgeLength: roundCoordinate(Math.max(cellSizeX * 4, cellSizeY * 2) + 1),
            verticalSegmentMinimum: 1,
            verticalSegmentMaximum: 2,
            horizontalSegmentMinimum: 1,
            horizontalSegmentMaximum: 4,
            risingSnake: true
        },
        nodes: mainNodes,
        edges
    };
}

function graphReachable(startId, adjacency) {
    const visited = new Set();
    const queue = [startId];
    while (queue.length) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);
        for (const next of adjacency.get(current) || []) if (!visited.has(next)) queue.push(next);
    }
    return visited;
}

function segmentsIntersect(a, b, c, d) {
    const o1 = orientation(a, b, c);
    const o2 = orientation(a, b, d);
    const o3 = orientation(c, d, a);
    const o4 = orientation(c, d, b);
    return o1 !== o2 && o3 !== o4;
}

function orientation(a, b, c) {
    const value = (Number(b.y) - Number(a.y)) * (Number(c.x) - Number(b.x)) - (Number(b.x) - Number(a.x)) * (Number(c.y) - Number(b.y));
    if (Math.abs(value) < 1e-7) return 0;
    return value > 0 ? 1 : 2;
}

function longestFlatRun(nodes, tolerance) {
    let longest = 0;
    let current = 0;
    for (let index = 1; index < nodes.length; index += 1) {
        if (Math.abs(nodes[index].y - nodes[index - 1].y) <= tolerance) current += 1;
        else current = 0;
        longest = Math.max(longest, current);
    }
    return longest;
}

function normalizeGenerationValidation(value) {
    const source = value && typeof value === "object" ? value : {};
    return {
        valid: Boolean(source.valid),
        qualityScore: clampNumber(source.qualityScore, 0, 100, 0),
        errors: normalizeStringArray(source.errors),
        warnings: normalizeStringArray(source.warnings),
        metrics: source.metrics && typeof source.metrics === "object" ? JSON.parse(JSON.stringify(source.metrics)) : {}
    };
}

function stableStringify(value) {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    if (value && typeof value === "object") {
        return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
}

function groupBy(values, keyFn) {
    const result = new Map();
    for (const value of values) {
        const key = keyFn(value);
        if (!result.has(key)) result.set(key, []);
        result.get(key).push(value);
    }
    return result;
}

function normalizeStringArray(value) {
    return [...new Set((Array.isArray(value) ? value : []).map((entry) => String(entry || "").trim()).filter(Boolean))];
}

function cleanId(value, fallback) {
    const cleaned = String(value || "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
    return cleaned || fallback;
}

function finiteNumber(value, fallback) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
}

function clampNumber(value, min, max, fallback) {
    return clamp(finiteNumber(value, fallback), min, max);
}

function clamp01(value) {
    return clamp(finiteNumber(value, 0), 0, 1);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
    return Number(a) + (Number(b) - Number(a)) * Number(t);
}

function distance(a, b) {
    return Math.hypot(Number(a.x) - Number(b.x), Number(a.y) - Number(b.y));
}

function average(values) {
    return values.length ? values.reduce((sum, value) => sum + Number(value), 0) / values.length : 0;
}

function roundCoordinate(value) {
    return Math.round(Number(value) * 1000) / 1000;
}
