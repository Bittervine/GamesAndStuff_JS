import {
    CAVE_PERIMETER_GENERATOR,
    generateCavePerimeterPlacements
} from "./cave-window-decoration.js";

export const AUTOMATIC_LEVEL_GENERATOR_VERSION = 7;
export const AUTOMATIC_LEVEL_GENERATOR_ID = "automatic-level-generator-4";

const GENERATED_PLAYER_BODY_WIDTH = 34;
const BRANCH_SHAFT_SIDE_CLEARANCE = 8;
const BRANCH_SHAFT_WIDTH = 116;
const BRANCH_STAIR_LATERAL_OFFSET = 23;

export const LEVEL_GENERATOR_STAGE_ORDER = Object.freeze([
    "route",
    "cavern",
    "traversal",
    "endpoints",
    "encounters",
    "rewards",
    "decoration",
    "validation"
]);

export const LEVEL_GENERATOR_REGISTRIES = Object.freeze({
    route: Object.freeze([
        Object.freeze({ id: "macro-room-route-v2", label: "Macro room-and-tunnel route v2" }),
        Object.freeze({ id: "progression-route-v1", label: "Progression route v1 (legacy)" })
    ]),
    cavern: Object.freeze([
        Object.freeze({ id: "room-and-tunnel-cavern-v2", label: "Room-and-tunnel cavern v2" }),
        Object.freeze({ id: "ellipse-cavern-v1", label: "Overlapping ellipse cavern v1 (legacy)" }),
        Object.freeze({ id: "route-preview-only", label: "Route preview only (legacy)" })
    ]),
    traversal: Object.freeze([
        Object.freeze({ id: "forgiving-traversal-v1", label: "Forgiving traversal v1" }),
        Object.freeze({ id: "not-generated-yet", label: "Not generated (legacy)" })
    ]),
    endpoints: Object.freeze([
        Object.freeze({ id: "grounded-chamber-endpoints-v2", label: "Grounded chamber endpoints v2" }),
        Object.freeze({ id: "safe-endpoints-v1", label: "Safe supported endpoints v1 (legacy)" }),
        Object.freeze({ id: "abstract-right-exit-v1", label: "Abstract endpoints (legacy)" })
    ]),
    encounters: Object.freeze([
        Object.freeze({ id: "difficulty-budgeted-encounters-v1", label: "Difficulty-budgeted encounters v1" }),
        Object.freeze({ id: "not-generated-yet", label: "No encounters (legacy)" })
    ]),
    rewards: Object.freeze([
        Object.freeze({ id: "basic-rewards-v1", label: "Purposeful branches and contextual rewards v1" }),
        Object.freeze({ id: "not-generated-yet", label: "No rewards (legacy)" })
    ]),
    decoration: Object.freeze([
        Object.freeze({ id: "perimeter-decoration-v1", label: "Protected cave perimeter decoration v1" }),
        Object.freeze({ id: "suppressed-by-theme", label: "Suppressed by theme" }),
        Object.freeze({ id: "not-generated-yet", label: "No decoration (legacy)" })
    ]),
    validation: Object.freeze([
        Object.freeze({ id: "room-and-tunnel-validation-v2", label: "Room-and-tunnel cavern validation v2" }),
        Object.freeze({ id: "playable-reward-cavern-validation-v1", label: "Playable reward cavern validation v1 (legacy)" }),
        Object.freeze({ id: "playable-encounter-cavern-validation-v1", label: "Playable encounter cavern validation v1 (legacy)" }),
        Object.freeze({ id: "playable-empty-cavern-validation-v1", label: "Playable empty cavern validation v1 (legacy)" }),
        Object.freeze({ id: "route-graph-validation-v1", label: "Route graph validation v1 (legacy)" })
    ])
});


export const DEFAULT_GENERATOR_STAGE_REVISIONS = Object.freeze({
    route: 0,
    cavern: 0,
    traversal: 0,
    endpoints: 0,
    encounters: 0,
    rewards: 0,
    decoration: 0,
    validation: 0
});

export const STAGE_SPECIFIC_REGENERATION_OPTIONS = Object.freeze([
    Object.freeze({ id: "encounters", label: "Encounters only", dependentStages: Object.freeze(["encounters", "validation"]) }),
    Object.freeze({ id: "rewards", label: "Rewards + branch detours", dependentStages: Object.freeze(["rewards", "traversal", "cavern", "endpoints", "validation"]) }),
    Object.freeze({ id: "validation", label: "Validation only", dependentStages: Object.freeze(["validation"]) })
]);

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
    branching: 0.35,
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
        calmDistance: 980,
        minimumEncounterSpacing: 700,
        landingBuffer: 132,
        spawnSafetyBuffer: 150,
        maximumEncounterShare: 0.72
    }),
    rewards: Object.freeze({
        endpointExclusionDistance: 760,
        minimumRewardSpacing: 480,
        branchChestScore: 100,
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
        route: "macro-room-route-v2",
        cavern: "room-and-tunnel-cavern-v2",
        traversal: "forgiving-traversal-v1",
        endpoints: "grounded-chamber-endpoints-v2",
        encounters: "difficulty-budgeted-encounters-v1",
        rewards: "basic-rewards-v1",
        decoration: "perimeter-decoration-v1",
        validation: "room-and-tunnel-validation-v2"
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
            calmDistance: clampNumber(encountersSource.calmDistance, 760, 1400, DEFAULT_THEME.encounters.calmDistance),
            minimumEncounterSpacing: clampNumber(encountersSource.minimumEncounterSpacing, 420, 1200, DEFAULT_THEME.encounters.minimumEncounterSpacing),
            landingBuffer: clampNumber(encountersSource.landingBuffer, 80, 220, DEFAULT_THEME.encounters.landingBuffer),
            spawnSafetyBuffer: clampNumber(encountersSource.spawnSafetyBuffer, 80, 260, DEFAULT_THEME.encounters.spawnSafetyBuffer),
            maximumEncounterShare: clampNumber(encountersSource.maximumEncounterShare, 0.35, 0.9, DEFAULT_THEME.encounters.maximumEncounterShare)
        },
        rewards: {
            endpointExclusionDistance: clampNumber(rewardsSource.endpointExclusionDistance, 420, 1400, DEFAULT_THEME.rewards.endpointExclusionDistance),
            minimumRewardSpacing: clampNumber(rewardsSource.minimumRewardSpacing, 240, 1000, DEFAULT_THEME.rewards.minimumRewardSpacing),
            branchChestScore: Math.round(clampNumber(rewardsSource.branchChestScore, 25, 1000, DEFAULT_THEME.rewards.branchChestScore)),
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
        branching: clamp01(source.branching ?? base.branching),
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
        const requested = String(source[stage] || "");
        normalized[stage] = registry.some((entry) => entry.id === requested)
            ? requested
            : (registry[0]?.id || "");
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

function generationOwnershipRunId(record) {
    return String(record?.generationRunId || record?.generation?.runId || record?.manualizedFromGeneration?.runId || "");
}

function hasGenerationStageProvenance(record, stage) {
    if (!record || generationOwnershipStage(record) !== stage) return false;
    return record.generatedBy === AUTOMATIC_LEVEL_GENERATOR_ID
        || String(record.generatedBy || "").startsWith("automatic-level-generator")
        || Boolean(record.manualizedFromGeneration);
}

export function generatorRegistryEntry(stage, id) {
    return (LEVEL_GENERATOR_REGISTRIES[stage] || []).find((entry) => entry.id === id) || null;
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

export function parseEnemySelection(expression, availableEnemyIds = []) {
    const source = String(expression ?? "").trim();
    const available = [...new Set((availableEnemyIds || []).map((id) => String(id)).filter(Boolean))]
        .map((id) => ({ id, number: enemyNumber(id) }))
        .filter((entry) => Number.isInteger(entry.number) && entry.number >= 0)
        .sort((a, b) => a.number - b.number || a.id.localeCompare(b.id));
    const errors = [];
    if (!source) {
        return { valid: false, expression: source, resolvedIds: [], errors: ["Enter at least one enemy number or range."] };
    }

    const includeRanges = [];
    const excludeRanges = [];
    for (const rawToken of source.split(",")) {
        const token = rawToken.trim();
        if (!token) {
            errors.push("Empty enemy-selection token.");
            continue;
        }
        const excluded = token.startsWith("!");
        const body = excluded ? token.slice(1).trim() : token;
        const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(body);
        if (!match) {
            errors.push(`Invalid enemy token “${token}”.`);
            continue;
        }
        const start = Number(match[1]);
        const end = match[2] === undefined ? start : Number(match[2]);
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < 0) {
            errors.push(`Enemy token “${token}” is outside the supported range.`);
            continue;
        }
        if (start > end) {
            errors.push(`Enemy range “${token}” runs backwards.`);
            continue;
        }
        (excluded ? excludeRanges : includeRanges).push([start, end]);
    }

    if (!includeRanges.length && !errors.length) {
        includeRanges.push([0, Number.MAX_SAFE_INTEGER]);
    }
    const resolvedIds = available
        .filter((entry) => rangeListIncludes(includeRanges, entry.number) && !rangeListIncludes(excludeRanges, entry.number))
        .map((entry) => entry.id);
    return {
        valid: errors.length === 0,
        expression: source,
        resolvedIds,
        errors
    };
}

function collectAutomaticLevelRouteCandidates(options = {}) {
    const theme = normalizeGeneratorTheme(options.theme);
    const settings = normalizeGeneratorSettings(options.settings, theme.defaults);
    const implementations = normalizeGeneratorImplementations(options.implementations || theme.implementations);
    if (!["macro-room-route-v2", "progression-route-v1"].includes(implementations.route)) {
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
    const macroPlan = implementations.route === "macro-room-route-v2"
        ? buildMacroRoutePlan({
            theme,
            settings,
            rng: createNamedRandomStream(seed, `${generatorStageStreamName("route", stageRevisions)}:macro-layout`, 0)
        })
        : null;
    const candidates = [];
    const rejected = [];
    for (const attempt of attemptNumbers) {
        const rng = createNamedRandomStream(seed, generatorStageStreamName("route", stageRevisions), attempt);
        const graph = implementations.route === "macro-room-route-v2"
            ? buildMacroRoomRouteCandidate({ theme, settings, rng, attempt, macroPlan })
            : buildLegacyProgressionRouteCandidate({ theme, settings, rng, attempt });
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
        macroPlan,
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
    const runId = `alg3_${hashGeneratorSeed(identity).toString(16).padStart(8, "0")}`;
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
        catalogId: cleanId(source.catalogId || "cavern-platform-generation-v1", "cavern-platform-generation-v1"),
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
        return {
            rewardId: String(rewardId),
            entityType: String(entry.entityType || rewardId),
            category,
            contexts: normalizeStringArray(entry.contexts),
            weight: clampNumber(entry.weight, 0.05, 20, 1),
            minimumSupportWidth: clampNumber(entry.minimumSupportWidth, 80, 1200, 220),
            edgeClearance: clampNumber(entry.edgeClearance, 16, 280, 64),
            verticalOffset: clampNumber(entry.verticalOffset, 0, 320, 0),
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


function routeBranchDescriptors(route) {
    const nodes = Array.isArray(route?.nodes) ? route.nodes : [];
    const edges = Array.isArray(route?.edges) ? route.edges : [];
    const grouped = groupBy(nodes.filter((node) => !node.mandatory && node.branchId), (node) => node.branchId);
    return [...grouped.entries()].map(([branchId, branchNodes]) => {
        const sortedNodes = [...branchNodes].sort((a, b) => Number(a.progress) - Number(b.progress));
        const branchEdges = edges.filter((edge) => edge.branchId === branchId);
        const rewardNode = [...sortedNodes].reverse().find((node) => node.kind === "optionalReward") || sortedNodes.at(-1);
        return {
            branchId,
            nodes: sortedNodes,
            edges: branchEdges,
            rewardNodeId: rewardNode?.id || "",
            rewardX: rewardNode ? Number(rewardNode.x) || 0 : 0,
            rewardY: rewardNode ? Number(rewardNode.y) || 0 : 0,
            progress: rewardNode ? Number(rewardNode.progress) || 0 : 0,
            depth: sortedNodes.length,
            verticalExcursion: sortedNodes.length
                ? Math.max(...sortedNodes.map((node) => Number(node.y) || 0)) - Math.min(...sortedNodes.map((node) => Number(node.y) || 0))
                : 0
        };
    }).filter((branch) => branch.rewardNodeId && branch.edges.length >= 2)
        .sort((a, b) => a.progress - b.progress || a.branchId.localeCompare(b.branchId));
}

function planBasicRewards({ route, theme, settings, rng, runId, implementationId }) {
    const allBranches = routeBranchDescriptors(route);
    const routeNodes = Array.isArray(route?.nodes) ? route.nodes : [];
    const entranceX = Number(routeNodes.find((node) => node.id === route?.startNodeId)?.x) || 0;
    const exitX = Number(routeNodes.find((node) => node.id === route?.exitNodeId)?.x) || 0;
    const branches = allBranches.filter((branch) =>
        Math.min(Math.abs(branch.rewardX - entranceX), Math.abs(branch.rewardX - exitX)) >= theme.rewards.endpointExclusionDistance
    );
    if (implementationId !== "basic-rewards-v1" || settings.rewardDensity <= 0.001 || !branches.length) {
        return {
            version: 1,
            generatorId: implementationId,
            runId,
            selectedBranchIds: [],
            rankedBranchIds: [],
            targetBranchCount: 0,
            availableBranchIds: branches.map((branch) => branch.branchId),
            contextualRewardTarget: 0,
            allowThoughts: false
        };
    }
    let target = Math.round(branches.length * settings.rewardDensity);
    if (settings.rewardDensity >= 0.24 && target === 0) target = 1;
    target = Math.min(branches.length, target);
    const ranked = rng.shuffle(branches).map((branch) => ({
        branch,
        score: branch.depth * 2.4
            + Math.min(2, branch.verticalExcursion / Math.max(1, theme.route.verticalStep))
            + (branch.progress > 1.5 ? 1 : 0)
            + rng.range(0, 1.5)
    })).sort((a, b) => b.score - a.score || a.branch.branchId.localeCompare(b.branch.branchId));
    const mainNodes = (route?.nodes || []).filter((node) => node.mandatory).length;
    const contextualRewardTarget = Math.min(
        theme.rewards.maximumContextualPowerUps,
        Math.max(0, Math.floor(settings.rewardDensity * (1 + mainNodes / 5.5)))
    );
    return {
        version: 1,
        generatorId: implementationId,
        runId,
        selectedBranchIds: ranked.slice(0, target).map((entry) => entry.branch.branchId).sort(),
        rankedBranchIds: ranked.map((entry) => entry.branch.branchId),
        targetBranchCount: target,
        availableBranchIds: branches.map((branch) => branch.branchId),
        contextualRewardTarget,
        allowThoughts: Boolean(settings.allowThoughts && theme.rewards.maximumThoughts > 0 && theme.rewards.thoughts.length)
    };
}

function emptyRewardPopulation(runId, implementationId = "not-generated-yet", plan = null) {
    return {
        version: 1,
        generatorId: String(implementationId || "not-generated-yet"),
        runId: String(runId || ""),
        selectedBranchIds: normalizeStringArray(plan?.selectedBranchIds),
        rankedBranchIds: normalizeStringArray(plan?.rankedBranchIds),
        targetBranchCount: Math.max(0, Math.floor(Number(plan?.targetBranchCount) || 0)),
        availableBranchIds: normalizeStringArray(plan?.availableBranchIds),
        contextualRewardTarget: Math.max(0, Math.floor(Number(plan?.contextualRewardTarget) || 0)),
        rewards: [],
        entities: []
    };
}

function instantiateGeneratedCatalogEntity({ id, type, definition, x, y, runId, role, support, branchId, routeNodeId, context, overrides = {} }) {
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
        generationBranchId: branchId || undefined,
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

function buildBasicRewards({
    route,
    traversal,
    endpoints,
    cavern,
    encounters,
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
    const endpointXs = [
        finiteNumber(endpoints?.entrance?.x, supportById.get(traversal.startSupportId)?.centerX || 0),
        finiteNumber(endpoints?.exit?.x, supportById.get(traversal.exitSupportId)?.centerX || 0)
    ];
    const maximumRouteProgress = Math.max(1, ...(route?.nodes || []).filter((node) => node.mandatory).map((node) => Number(node.progress) || 0));

    const addReward = ({ type, support, context, branchId = "", routeNodeId = "", x = support.centerX, overrides = {} }) => {
        const metadata = metadataByType.get(type);
        const definition = entityCatalog.get(type);
        if (!metadata || !definition || !support) return null;
        const normalizedProgress = supportProgress(support, routeNodeById, routeEdgeById) / maximumRouteProgress;
        if (normalizedProgress < metadata.minimumProgress || normalizedProgress > metadata.maximumProgress) return null;
        if (support.walkableWidth < metadata.minimumSupportWidth) return null;
        const halfWidth = definition.defaultSize.w * 0.5;
        const left = support.walkableLeftX + metadata.edgeClearance + halfWidth;
        const right = support.walkableRightX - metadata.edgeClearance - halfWidth;
        if (left > right) return null;
        const resolvedX = clamp(x, left, right);
        const resolvedY = support.surfaceY - metadata.verticalOffset;
        if (endpointXs.some((endpointX) => Math.abs(resolvedX - endpointX) < theme.rewards.endpointExclusionDistance)) return null;
        if (occupiedPositions.some((point) => Math.abs(point.x - resolvedX) < theme.rewards.minimumRewardSpacing && Math.abs(point.y - resolvedY) < 180)) return null;
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
            branchId,
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
            branchId: branchId || "",
            x: entity.x,
            y: entity.y
        });
        occupiedSupportIds.add(support.id);
        occupiedPositions.push({ x: entity.x, y: entity.y });
        return entity;
    };

    for (const branchId of rewardPlan.selectedBranchIds) {
        const branchNodes = (route?.nodes || []).filter((node) => node.branchId === branchId).sort((a, b) => Number(a.progress) - Number(b.progress));
        const rewardNode = [...branchNodes].reverse().find((node) => node.kind === "optionalReward") || branchNodes.at(-1);
        const support = supports.find((candidate) => candidate.branchId === branchId && candidate.routeNodeId === rewardNode?.id);
        addReward({
            type: "treasureChest",
            support,
            context: "branchDestination",
            branchId,
            routeNodeId: rewardNode?.id,
            overrides: { scoreValue: theme.rewards.branchChestScore }
        });
    }

    const mainSupportCandidates = supports.filter((support) =>
        support.mandatory && support.role === "routeFloor" && support.routeNodeId
    ).map((support) => ({
        support,
        progress: supportProgress(support, routeNodeById, routeEdgeById)
    })).filter((candidate) => {
        const normalizedProgress = candidate.progress / Math.max(1, (route?.nodes || []).filter((node) => node.mandatory).length - 1);
        return normalizedProgress >= 0.16 && normalizedProgress <= 0.88;
    });

    const contextual = [];
    for (const encounter of encounters?.encounters || []) {
        let context = "";
        if (encounter.enemyId === "enemy_005") context = "beforeBatEncounter";
        else if (encounter.placementClass === "groundRanged") context = "beforeRangedEncounter";
        else if ((Number(encounter.difficultyCost) || 0) >= 5.5) context = "beforeLargeEncounter";
        else if ((Number(encounter.groupSize) || 0) >= 3) context = "beforeDenseEncounter";
        if (!context) continue;
        const priorCandidates = [...mainSupportCandidates]
            .filter((candidate) => candidate.progress < encounter.progress - 0.25 && !occupiedSupportIds.has(candidate.support.id))
            .sort((a, b) => b.progress - a.progress)
            .slice(0, 3);
        const prior = priorCandidates.length ? rng.pick(priorCandidates) : null;
        if (!prior) continue;
        contextual.push({ context, support: prior.support, priority: 3 + (Number(encounter.difficultyCost) || 0), encounter, randomOrder: rng.float() });
    }
    for (const transition of traversal?.transitions || []) {
        if (!transition.mandatory) continue;
        if ((transition.gap || 0) < 82 && (transition.rise || 0) < 64 && (transition.drop || 0) < 150) continue;
        const support = supportById.get(transition.fromSupportId);
        if (!support || !support.mandatory || occupiedSupportIds.has(support.id)) continue;
        contextual.push({ context: "beforeDemandingMovement", support, priority: 2 + (transition.gap || 0) / 80 + (transition.rise || 0) / 70, transition, randomOrder: rng.float() });
    }
    contextual.sort((a, b) => (b.priority + b.randomOrder * 1.25) - (a.priority + a.randomOrder * 1.25) || a.support.centerX - b.support.centerX);
    let contextualPlaced = 0;
    const usedContextualTypes = new Set();
    for (const candidate of contextual) {
        if (contextualPlaced >= rewardPlan.contextualRewardTarget) break;
        if (occupiedSupportIds.has(candidate.support.id)) continue;
        const metadataCandidates = rewardMetadataForContext(rewardGenerationCatalog, candidate.context)
            .map((metadata) => ({ metadata, weight: metadata.weight }))
            .filter((entry) => entityCatalog.has(entry.metadata.entityType) && !usedContextualTypes.has(entry.metadata.entityType));
        const selected = weightedRandomChoice(metadataCandidates, rng);
        if (!selected) continue;
        const entity = addReward({
            type: selected.metadata.entityType,
            support: candidate.support,
            context: candidate.context,
            routeNodeId: candidate.support.routeNodeId
        });
        if (entity) {
            contextualPlaced += 1;
            usedContextualTypes.add(selected.metadata.entityType);
        }
    }

    if (rewardPlan.allowThoughts && rng.chance(theme.rewards.thoughtChance)) {
        const encounterSupportIds = new Set((encounters?.encounters || []).map((encounter) => encounter.supportId));
        const candidates = mainSupportCandidates.filter((candidate) =>
            !occupiedSupportIds.has(candidate.support.id)
            && !encounterSupportIds.has(candidate.support.id)
            && candidate.progress >= 2.5
        );
        const selected = candidates.length ? rng.pick(candidates) : null;
        const text = theme.rewards.thoughts.length ? rng.pick(theme.rewards.thoughts) : "";
        if (selected && text) {
            addReward({
                type: "thoughtTrigger",
                support: selected.support,
                context: "quietRoute",
                routeNodeId: selected.support.routeNodeId,
                overrides: { thoughtText: text }
            });
        }
    }

    return {
        version: 1,
        generatorId: "basic-rewards-v1",
        runId,
        selectedBranchIds: [...rewardPlan.selectedBranchIds],
        availableBranchIds: [...rewardPlan.availableBranchIds],
        contextualRewardTarget: rewardPlan.contextualRewardTarget,
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


function rotatedPlacementBounds(placement) {
    const x = finiteNumber(placement?.x, 0);
    const y = finiteNumber(placement?.y, 0);
    const w = Math.max(0, finiteNumber(placement?.w, 0));
    const h = Math.max(0, finiteNumber(placement?.h, 0));
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
        const bounds = rotatedPlacementBounds(placement);
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
        const bounds = rotatedPlacementBounds(placement);
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
        for (const placement of placements) overlapArea += rectangleIntersectionArea(supportRect, rotatedPlacementBounds(placement));
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
            const vertical = cavernVerticalRangeAt(cavern.profile, x);
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

    const v2 = cavern.generatorId === "room-and-tunnel-cavern-v2";
    if (v2) {
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
    if (v2 && metrics.minimumEndpointSideClearance < theme.cavern.endpointSideClearance - 20) {
        errors.push(`An endpoint door is only ${roundCoordinate(metrics.minimumEndpointSideClearance)} units from the dark cave boundary.`);
    }
    if (metrics.maximumDoorFloorError > 2) errors.push(`An endpoint doorway floats ${roundCoordinate(metrics.maximumDoorFloorError)} units above or below its support.`);

    for (const room of cavern.rooms || []) {
        metrics.largestRoomWidthScreens = Math.max(metrics.largestRoomWidthScreens, finiteNumber(room.widthScreens, 0));
        metrics.largestRoomHeightScreens = Math.max(metrics.largestRoomHeightScreens, finiteNumber(room.heightScreens, 0));
        if (room.widthScreens > 4.01 || room.heightScreens > 3.01) errors.push(`Macro room “${room.id}” exceeds the 4×3-screen design ceiling.`);
    }
    if (v2 && !metrics.macroRoomCount) errors.push("The room-and-tunnel cavern contains no macro room.");
    if (v2 && metrics.largestRoomWidthScreens <= 1 && metrics.largestRoomHeightScreens <= 1) errors.push("The room-and-tunnel cavern never opens beyond a single screen.");

    for (const key of ["minimumPlatformCeilingClearance", "minimumPlatformFloorClearance", "minimumPlatformWallClearance", "minimumEndpointSideClearance"]) {
        if (!Number.isFinite(metrics[key])) metrics[key] = 0;
    }
    metrics.maximumSupportForegroundCoverage = Math.round(metrics.maximumSupportForegroundCoverage * 10000) / 10000;
    return { valid: errors.length === 0, qualityScore: Math.max(0, 100 - errors.length * 35 - warnings.length * 2), errors, warnings, metrics };
}

export function generateAutomaticLevelDraft(options = {}) {
    const theme = normalizeGeneratorTheme(options.theme);
    const implementations = normalizeGeneratorImplementations(options.implementations || theme.implementations);
    if (!["room-and-tunnel-cavern-v2", "ellipse-cavern-v1"].includes(implementations.cavern)) throw new Error(`Unsupported cavern builder “${implementations.cavern}”.`);
    if (implementations.traversal !== "forgiving-traversal-v1") throw new Error(`Unsupported traversal builder “${implementations.traversal}”.`);
    if (!["grounded-chamber-endpoints-v2", "safe-endpoints-v1"].includes(implementations.endpoints)) throw new Error(`Unsupported endpoint placer “${implementations.endpoints}”.`);
    if (!["difficulty-budgeted-encounters-v1", "not-generated-yet"].includes(implementations.encounters)) throw new Error(`Unsupported encounter populator “${implementations.encounters}”.`);
    if (!["basic-rewards-v1", "not-generated-yet"].includes(implementations.rewards)) throw new Error(`Unsupported reward populator “${implementations.rewards}”.`);
    if (!["perimeter-decoration-v1", "suppressed-by-theme", "not-generated-yet"].includes(implementations.decoration)) throw new Error(`Unsupported decoration populator “${implementations.decoration}”.`);
    if (!["room-and-tunnel-validation-v2", "playable-reward-cavern-validation-v1", "playable-encounter-cavern-validation-v1", "playable-empty-cavern-validation-v1"].includes(implementations.validation)) throw new Error(`Unsupported level validator “${implementations.validation}”.`);

    const assetCatalog = normalizeGenerationAssetCatalog(options.assetCatalog);
    if (!assetCatalog.assets.length) throw new Error("The generation platform catalog is empty.");
    for (const requiredRole of ["routeFloor", "landingPlatform", "doorSupport", ...(implementations.rewards === "basic-rewards-v1" ? ["branchStep", "shaftBridge"] : [])]) {
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
        for (const requiredType of ["treasureChest", "speedShotPickup", "shieldPickup", "randomWrenchPickup", "fuel", "thoughtTrigger"]) {
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
                rng: rewardsRng,
                runId: routeGeneration.runId,
                implementationId: implementations.rewards
            });
            const traversal = buildForgivingTraversal({
                route: routeGeneration.route,
                theme,
                settings: routeGeneration.settings,
                implementations,
                assetCatalog,
                rng: traversalRng,
                runId: routeGeneration.runId,
                selectedBranchIds: rewardPlan.targetBranchCount > 0
                    ? (rewardPlan.rankedBranchIds || rewardPlan.selectedBranchIds)
                    : [],
                branchTargetCount: rewardPlan.targetBranchCount ?? rewardPlan.selectedBranchIds.length
            });
            const effectiveRewardPlan = {
                ...rewardPlan,
                selectedBranchIds: [...traversal.materializedBranchIds]
            };
            const endpoints = buildSafeEndpoints({
                route: routeGeneration.route,
                traversal,
                theme,
                implementations,
                rng: endpointRng,
                runId: routeGeneration.runId,
                destinationLevel: String(options.destinationLevel || "")
            });
            const cavern = implementations.cavern === "room-and-tunnel-cavern-v2"
                ? buildRoomAndTunnelCavern({
                    route: routeGeneration.route,
                    traversal,
                    endpoints,
                    theme,
                    seed: routeGeneration.seed,
                    runId: routeGeneration.runId,
                    generatorId: implementations.cavern
                })
                : buildEllipseCavern({
                    route: routeGeneration.route,
                    traversal,
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
            const rewards = implementations.rewards === "basic-rewards-v1"
                ? buildBasicRewards({
                    route: routeGeneration.route,
                    traversal,
                    endpoints,
                    cavern,
                    encounters,
                    theme,
                    settings: routeGeneration.settings,
                    rewardPlan: effectiveRewardPlan,
                    rewardGenerationCatalog,
                    entityCatalog,
                    rng: rewardsRng,
                    runId: routeGeneration.runId
                })
                : emptyRewardPopulation(routeGeneration.runId, implementations.rewards, effectiveRewardPlan);
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
        const rewardCandidateReady = implementations.rewards !== "basic-rewards-v1"
            || completeCandidates.some((candidate) =>
                candidate.traversal.requestedBranchCount === 0
                || candidate.traversal.materializedBranchIds.length > 0
            );
        if (geometryCandidatesTried >= 12 && completeCandidates.length >= 6 && rewardCandidateReady) break;
    }

    if (!completeCandidates.length) {
        const detail = geometryRejected.slice(0, 4).map((item) => `Attempt ${item.attempt}: ${item.reason}`).join(" ");
        throw new Error(`No collision-safe cavern candidate was found after ${geometryCandidatesTried} route attempts.${detail ? ` ${detail}` : ""}`);
    }
    const branchCoverage = (candidate) => {
        const requested = Math.max(0, Number(candidate.traversal.requestedBranchCount) || 0);
        const materialized = candidate.traversal.materializedBranchIds.length;
        return requested > 0 ? materialized / requested : 1;
    };
    completeCandidates.sort((a, b) =>
        branchCoverage(b) - branchCoverage(a) ||
        b.traversal.materializedBranchIds.length - a.traversal.materializedBranchIds.length ||
        b.validation.qualityScore - a.validation.qualityScore ||
        a.validation.warnings.length - b.validation.warnings.length ||
        b.routeGeneration.route.validation.qualityScore - a.routeGeneration.route.validation.qualityScore ||
        a.routeGeneration.attempt - b.routeGeneration.attempt
    );
    const selected = completeCandidates[0];
    const { routeGeneration, traversal, endpoints, cavern, world, encounters, rewards, validation } = selected;
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
        requirePerimeter: Boolean(options.requirePopulatedPerimeter) && implementations.validation === "room-and-tunnel-validation-v2"
    });
    const presentationValidation = validateGeneratedCavernPresentation({
        cavern,
        traversal,
        endpoints,
        rewards,
        decoration,
        theme,
        requirePerimeter: Boolean(options.requirePopulatedPerimeter) && implementations.validation === "room-and-tunnel-validation-v2"
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
                bombingBatCount: encounters.entities.filter((entity) => entity.enemyCatalogId === "enemy_005").length,
                budget: encounters.budget,
                spentBudget: encounters.spentBudget
            },
            rewards: {
                materializedBranchCount: rewards.selectedBranchIds.length,
                rewardCount: rewards.entities.length,
                chestCount: rewards.entities.filter((entity) => entity.type === "treasureChest").length,
                powerUpCount: rewards.entities.filter((entity) => ["speedShotPickup", "shieldPickup", "randomWrenchPickup"].includes(entity.type)).length,
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
        caveWindow: JSON.parse(JSON.stringify(cavern.caveWindow)),
        world: JSON.parse(JSON.stringify(world)),
        requiredAtlasIds: [...new Set([
            ...placements.map((placement) => placement.atlasId),
            "it_atlas_001"
        ])].sort()
    };
}


function emptyEncounterPopulation(runId, implementationId = "not-generated-yet") {
    return {
        version: 1,
        generatorId: String(implementationId || "not-generated-yet"),
        runId: String(runId || ""),
        budget: 0,
        spentBudget: 0,
        calmDistance: 0,
        minimumEncounterSpacing: 0,
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
    rng,
    runId
}) {
    const metadataById = new Map((enemyGenerationCatalog?.enemies || []).map((entry) => [entry.enemyId, entry]));
    const allowed = normalizeStringArray(resolvedEnemyIds).filter((enemyId) => metadataById.has(enemyId) && enemyCatalog.has(enemyId));
    const routeNodes = new Map((route?.nodes || []).map((node) => [node.id, node]));
    const maxProgress = Math.max(1, ...[...routeNodes.values()].map((node) => finiteNumber(node.progress, 0)));
    const endpointX = [
        finiteNumber(endpoints?.entrance?.x, traversal?.supports?.find((support) => support.id === traversal?.startSupportId)?.centerX || 0),
        finiteNumber(endpoints?.exit?.x, traversal?.supports?.find((support) => support.id === traversal?.exitSupportId)?.centerX || 0)
    ];
    const maximumAwareness = Math.max(0, ...allowed.map((enemyId) => finiteNumber(enemyCatalog.get(enemyId)?.defaults?.awarenessRange, 0)));
    const calmDistance = Math.max(theme.encounters.calmDistance, maximumAwareness + theme.encounters.spawnSafetyBuffer);
    const spacing = theme.encounters.minimumEncounterSpacing * (0.9 + settings.safety * 0.18);
    const routeFloorSupports = (traversal?.supports || []).filter((support) => (
        support?.mandatory && support.role === "routeFloor" && support.routeNodeId
    ));
    const budget = settings.enemyDensity <= 0.001 ? 0 : Math.max(1, Math.round(
        routeFloorSupports.length
        * settings.enemyDensity
        * (2.15 + settings.difficulty * 1.55)
        * (0.88 + (1 - settings.safety) * 0.12)
    ));
    const maximumEncounters = settings.enemyDensity <= 0.001 ? 0 : Math.max(1, Math.round(
        routeFloorSupports.length
        * theme.encounters.maximumEncounterShare
        * settings.enemyDensity
        * (0.78 + settings.difficulty * 0.34)
    ));
    if (!allowed.length || !budget || !maximumEncounters) {
        return {
            ...emptyEncounterPopulation(runId, "difficulty-budgeted-encounters-v1"),
            budget,
            calmDistance: roundCoordinate(calmDistance),
            minimumEncounterSpacing: roundCoordinate(spacing),
            allowedEnemyIds: allowed
        };
    }

    const candidates = rng.shuffle(routeFloorSupports).map((support) => {
        const node = routeNodes.get(support.routeNodeId);
        const progress = clamp01(finiteNumber(node?.progress, 0) / maxProgress);
        const vertical = cavernVerticalRangeAt(cavern?.profile, support.centerX);
        const headroom = vertical ? support.surfaceY - vertical.top : 0;
        const endpointDistance = Math.min(...endpointX.map((x) => Math.abs(support.centerX - x)));
        return {
            support,
            progress,
            headroom,
            endpointDistance,
            order: progress + rng.range(-0.08, 0.08)
        };
    }).filter((candidate) => candidate.endpointDistance >= calmDistance)
        .sort((a, b) => a.order - b.order);

    const encounters = [];
    const entities = [];
    let spentBudget = 0;
    let lastEnemyId = "";
    let hunterPlaced = false;
    const hunterRequired = settings.enemyDensity >= 0.45
        && settings.difficulty >= 0.34
        && allowed.some((enemyId) => metadataById.get(enemyId)?.requiresNavigation);
    for (const candidate of candidates) {
        if (encounters.length >= maximumEncounters) break;
        if (spentBudget >= budget) break;
        if (encounters.some((encounter) => Math.abs(encounter.x - candidate.support.centerX) < spacing)) continue;
        const remaining = budget - spentBudget;
        const fitting = allowed.map((enemyId) => {
            const metadata = metadataById.get(enemyId);
            const definition = enemyCatalog.get(enemyId);
            const groupSize = encounterGroupSize(metadata, settings, remaining, rng);
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
            rng,
            runId
        });
        if (!built.entities.length) continue;
        encounters.push(built.encounter);
        entities.push(...built.entities);
        spentBudget += selected.totalCost;
        lastEnemyId = selected.enemyId;
        if (selected.metadata.requiresNavigation) hunterPlaced = true;
    }

    return {
        version: 1,
        generatorId: "difficulty-budgeted-encounters-v1",
        runId,
        budget,
        spentBudget: roundCoordinate(spentBudget),
        calmDistance: roundCoordinate(calmDistance),
        minimumEncounterSpacing: roundCoordinate(spacing),
        maximumEncounters,
        allowedEnemyIds: allowed,
        encounters,
        entities
    };
}

function encounterGroupSize(metadata, settings, remainingBudget, rng) {
    const affordableMax = Math.floor((remainingBudget + 1e-6) / metadata.difficultyCost);
    const maximum = Math.min(metadata.groupMax, affordableMax);
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

function instantiateGeneratedEncounter({ encounterId, candidate, selected, theme, rng, runId }) {
    const { support, progress, headroom } = candidate;
    const { enemyId, metadata, definition, groupSize, totalCost } = selected;
    const entities = metadata.placementClass === "flyingBomber"
        ? instantiateFlyingEnemyGroup({ encounterId, support, headroom, enemyId, metadata, definition, groupSize, rng, runId })
        : instantiateGroundEnemyGroup({ encounterId, support, enemyId, metadata, definition, groupSize, theme, rng, runId });
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

function instantiateGroundEnemyGroup({ encounterId, support, enemyId, metadata, definition, groupSize, theme, rng, runId }) {
    const bodyWidth = definition.defaultSize.w;
    const landingBuffer = Math.max(metadata.landingBuffer, theme.encounters.landingBuffer);
    const left = support.walkableLeftX + metadata.edgeClearance + landingBuffer;
    const right = support.walkableRightX - metadata.edgeClearance;
    const available = Math.max(0, right - left);
    if (available < bodyWidth) return [];
    const spacing = groupSize > 1 ? Math.min(metadata.minGroupSpacing, Math.max(bodyWidth * 0.9, available / Math.max(1, groupSize - 1))) : 0;
    const center = right - bodyWidth * 0.5 - rng.range(0, Math.max(0, Math.min(36, available - bodyWidth)));
    const entities = [];
    for (let index = 0; index < groupSize; index += 1) {
        const offset = groupSize > 1 ? (index - (groupSize - 1) * 0.5) * spacing : 0;
        const x = clamp(center + offset, left + bodyWidth * 0.5, right - bodyWidth * 0.5);
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
        entity.x = roundCoordinate(x);
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

function instantiateFlyingEnemyGroup({ encounterId, support, headroom, enemyId, metadata, definition, groupSize, rng, runId }) {
    const bodyHeight = definition.defaultSize.h;
    const bodyWidth = definition.defaultSize.w;
    const spacing = Math.max(metadata.minGroupSpacing, Math.min(104, bodyWidth * 1.45));
    const desiredHeight = clamp(
        metadata.spawnHeightMin + (metadata.spawnHeightMax - metadata.spawnHeightMin) * rng.range(0.35, 0.8),
        metadata.spawnHeightMin,
        Math.min(metadata.spawnHeightMax, headroom - bodyHeight - 72)
    );
    if (!Number.isFinite(desiredHeight) || desiredHeight < metadata.spawnHeightMin - 0.01) return [];
    const entities = [];
    for (let index = 0; index < groupSize; index += 1) {
        const offset = (index - (groupSize - 1) * 0.5) * spacing;
        const entity = baseGeneratedEnemyEntity({
            id: `${encounterId}_${enemyId}_${String(index + 1).padStart(2, "0")}`,
            encounterId,
            support,
            enemyId,
            metadata,
            definition,
            runId
        });
        entity.x = roundCoordinate(support.centerX + offset);
        entity.y = roundCoordinate(support.surfaceY - desiredHeight + (index % 2 ? 10 : -10));
        entity.facing = index % 2 ? 1 : -1;
        entity.patrolDistance = roundCoordinate(Math.max(finiteNumber(entity.patrolDistance, 120), spacing * Math.max(1, groupSize - 1) + 80));
        entity.bomberInitialDelay = roundCoordinate(finiteNumber(entity.bomberInitialDelay, 0.5) + index * 0.22);
        entity.flightPhaseOffset = roundCoordinate(index / Math.max(1, groupSize));
        entities.push(entity);
    }
    return entities;
}

function cavernVerticalRangeAt(profile, x) {
    const samples = Array.isArray(profile) ? profile : [];
    if (!samples.length) return null;
    if (x <= samples[0].x) return { top: samples[0].top, bottom: samples[0].bottom };
    if (x >= samples.at(-1).x) return { top: samples.at(-1).top, bottom: samples.at(-1).bottom };
    for (let index = 1; index < samples.length; index += 1) {
        const right = samples[index];
        if (x > right.x) continue;
        const left = samples[index - 1];
        const t = (x - left.x) / Math.max(1e-6, right.x - left.x);
        return { top: lerp(left.top, right.top, t), bottom: lerp(left.bottom, right.bottom, t) };
    }
    return null;
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
        invalidSpawnCount: 0
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
        const vertical = cavernVerticalRangeAt(cavern.profile, entity.x);
        const top = entity.y - definition.defaultSize.h;
        if (!vertical || top < vertical.top + 20 || entity.y > vertical.bottom + 1) {
            metrics.invalidSpawnCount += 1;
            errors.push(`Enemy “${entity.id}” does not fit inside the generated cave opening.`);
        }
        if (metadata.placementClass === "flyingBomber") {
            metrics.flyingEnemyCount += 1;
            metrics.bombingBatCount += enemyId === "enemy_005" ? 1 : 0;
            if (entity.y >= support.surfaceY - 60) errors.push(`Flying enemy “${entity.id}” is too close to its route support.`);
        } else {
            metrics.groundEnemyCount += 1;
            if (Math.abs(entity.y - support.surfaceY) > 2) errors.push(`Ground enemy “${entity.id}” is not seated on its assigned support.`);
            const halfWidth = definition.defaultSize.w * 0.5;
            const leftLimit = support.walkableLeftX + metadata.edgeClearance;
            const rightLimit = support.walkableRightX - metadata.edgeClearance;
            if (entity.x - halfWidth < leftLimit - 0.01 || entity.x + halfWidth > rightLimit + 0.01) errors.push(`Ground enemy “${entity.id}” does not have the required authored walkable-edge clearance.`);
            if (entity.x - halfWidth < support.walkableLeftX + Math.max(metadata.landingBuffer, theme.encounters.landingBuffer) - 0.01) errors.push(`Ground enemy “${entity.id}” intrudes into the protected incoming landing area.`);
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
            metrics.bombingBatGroups += record.enemyId === "enemy_005" ? 1 : 0;
            if (record.enemyId === "enemy_005" && (group.length < 2 || group.length > 3)) errors.push(`Bombing Bat encounter “${record.id}” must contain two or three bats.`);
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
    if (metrics.budget > 0 && metrics.spentBudget < metrics.budget * 0.36 && entities.length) warnings.push("Encounter population used less than 36% of its available difficulty budget.");
    let qualityScore = 100 - errors.length * 45 - warnings.length * 2;
    if (metrics.budget > 0) qualityScore -= Math.max(0, 0.52 - metrics.spentBudget / metrics.budget) * 18;
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
    const route = value.route || {};
    const encounters = value.encounters || {};
    const endpointEntities = Array.isArray(value.endpointEntities) ? value.endpointEntities : [];
    const encounterEntities = Array.isArray(value.encounterEntities) ? value.encounterEntities : [];
    const theme = normalizeGeneratorTheme(value.theme);
    const settings = normalizeGeneratorSettings(value.settings, theme.defaults);
    const rewardGenerationCatalog = normalizeRewardGenerationCatalog(value.rewardGenerationCatalog);
    const entityCatalog = normalizeInteractiveEntityCatalog(value.entityCatalog);
    const metadataByType = new Map(rewardGenerationCatalog.rewards.map((entry) => [entry.entityType, entry]));
    const supports = new Map((traversal.supports || []).map((support) => [support.id, support]));
    const routeNodes = new Map((route.nodes || []).map((node) => [node.id, node]));
    const selectedBranches = new Set(normalizeStringArray(rewards.selectedBranchIds));
    const errors = [];
    const warnings = [];
    const metrics = {
        rewardCount: entities.length,
        chestCount: 0,
        powerUpCount: 0,
        utilityCount: 0,
        thoughtCount: 0,
        materializedBranchCount: selectedBranches.size,
        rewardedBranchCount: 0,
        minimumRewardSpacing: Infinity,
        minimumRewardEndpointDistance: Infinity,
        inaccessibleRewardCount: 0,
        endpointCrowdingCount: 0,
        rewardEnemyOverlapCount: 0
    };
    const rewardIds = new Set();
    const rewardRecords = Array.isArray(rewards.rewards) ? rewards.rewards : [];
    const recordByEntityId = new Map(rewardRecords.map((record) => [record.entityId, record]));
    const entranceX = supports.get(traversal.startSupportId)?.centerX || 0;
    const exitX = supports.get(traversal.exitSupportId)?.centerX || 0;
    const byBranch = groupBy(entities.filter((entity) => entity.generationBranchId), (entity) => entity.generationBranchId);

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
        const halfWidth = definition.defaultSize.w * 0.5;
        if (support.walkableWidth < metadata.minimumSupportWidth - 0.01) errors.push(`Reward “${entity.id}” is on a support narrower than its metadata permits.`);
        if (entity.x - halfWidth < support.walkableLeftX + metadata.edgeClearance - 0.01 || entity.x + halfWidth > support.walkableRightX - metadata.edgeClearance + 0.01) {
            metrics.inaccessibleRewardCount += 1;
            errors.push(`Reward “${entity.id}” lacks safe authored walkable-edge clearance.`);
        }
        const vertical = cavernVerticalRangeAt(cavern.profile, entity.x);
        const top = entity.y - definition.defaultSize.h;
        if (!vertical || top < vertical.top + 10 || entity.y > vertical.bottom + 1) {
            metrics.inaccessibleRewardCount += 1;
            errors.push(`Reward “${entity.id}” does not fit inside the generated cave opening.`);
        }
        if (metadata.category === "treasure") {
            metrics.chestCount += 1;
            if (entity.type !== "treasureChest") errors.push(`Treasure reward “${entity.id}” is not a treasure chest.`);
            if (!entity.generationBranchId || !selectedBranches.has(entity.generationBranchId)) errors.push(`Treasure chest “${entity.id}” is not attached to a selected optional branch.`);
            if (!support.branchId || support.branchId !== entity.generationBranchId) errors.push(`Treasure chest “${entity.id}” is not seated on its branch support.`);
            const node = routeNodes.get(entity.routeNodeId);
            if (node?.kind !== "optionalReward") errors.push(`Treasure chest “${entity.id}” is not placed at an optional reward destination.`);
            if (Math.abs(entity.y - support.surfaceY) > 2) errors.push(`Treasure chest “${entity.id}” is not seated on its support surface.`);
            if (!(Number(entity.scoreValue) > 0)) errors.push(`Treasure chest “${entity.id}” has no positive Score reward.`);
        } else if (metadata.category === "powerUp") {
            metrics.powerUpCount += 1;
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
                errors.push(`Reward “${entity.id}” overlaps generated enemy “${enemy.id}”.`);
                break;
            }
        }
        for (let second = first + 1; second < entities.length; second += 1) {
            const other = entities[second];
            const distanceX = Math.abs((Number(entity.x) || 0) - (Number(other.x) || 0));
            const distanceY = Math.abs((Number(entity.y) || 0) - (Number(other.y) || 0));
            if (distanceY < 180) metrics.minimumRewardSpacing = Math.min(metrics.minimumRewardSpacing, distanceX);
        }
    }

    for (const branchId of selectedBranches) {
        const branchEntities = byBranch.get(branchId) || [];
        const chests = branchEntities.filter((entity) => entity.type === "treasureChest");
        if (chests.length !== 1) errors.push(`Materialized branch “${branchId}” must contain exactly one treasure chest.`);
        else metrics.rewardedBranchCount += 1;
        const branchSupports = (traversal.supports || []).filter((support) => support.branchId === branchId);
        const branchTransitions = (traversal.transitions || []).filter((transition) => transition.branchId === branchId);
        if (!branchSupports.length || branchTransitions.length < 2) errors.push(`Materialized branch “${branchId}” has no complete traversal geometry.`);
        if (branchTransitions.some((transition) => !transition.valid)) errors.push(`Materialized branch “${branchId}” contains an invalid transition.`);
    }
    for (const branchId of normalizeStringArray(traversal.materializedBranchIds)) {
        if (!selectedBranches.has(branchId)) errors.push(`Traversal materialized unselected branch “${branchId}”.`);
    }
    for (const branchId of selectedBranches) {
        if (!normalizeStringArray(traversal.materializedBranchIds).includes(branchId)) errors.push(`Selected reward branch “${branchId}” was not materialized by traversal.`);
    }
    if (settings.rewardDensity <= 0.001 && (entities.length || selectedBranches.size)) errors.push("Zero reward density must produce no rewards and no materialized optional branches.");
    if (metrics.thoughtCount > theme.rewards.maximumThoughts) errors.push("Generated narrative thoughts exceed the theme maximum.");
    if (endpointEntities.some((entity) => !hasGenerationStageProvenance(entity, "endpoints"))) errors.push("Beginning and end doors must remain owned by the Endpoint Placer or be explicit manual replacements for it.");
    if (endpointEntities.some((entity) => entity?.manualizedFromGeneration)) warnings.push("One or more generated endpoint doors were converted to manual ownership.");
    if (!Number.isFinite(metrics.minimumRewardSpacing)) metrics.minimumRewardSpacing = 0;
    if (!Number.isFinite(metrics.minimumRewardEndpointDistance)) metrics.minimumRewardEndpointDistance = 0;
    if (entities.length > 1 && metrics.minimumRewardSpacing > 0 && metrics.minimumRewardSpacing < theme.rewards.minimumRewardSpacing - 0.01) errors.push("Generated rewards are packed more tightly than the configured readable spacing.");
    if (selectedBranches.size && metrics.rewardedBranchCount !== selectedBranches.size) errors.push("Not every materialized optional branch has a meaningful treasure destination.");
    if (settings.rewardDensity > 0.22 && (rewards.availableBranchIds || []).length && !selectedBranches.size) warnings.push("Reward density requested a branch reward, but no branch was selected.");
    if (settings.rewardDensity > 0.6 && entities.length < selectedBranches.size + 1) warnings.push("High reward density produced few contextual rewards beyond branch treasure.");

    let qualityScore = 100 - errors.length * 45 - warnings.length * 2;
    qualityScore -= Math.max(0, selectedBranches.size - metrics.rewardedBranchCount) * 18;
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

export function reanchorGeneratedEncounterStage(existingGeneration, nextGeneration, records = []) {
    const oldSupports = new Map((existingGeneration?.traversal?.supports || []).map((support) => [support.id, support]));
    const newSupports = new Map((nextGeneration?.traversal?.supports || []).map((support) => [support.id, support]));
    const entities = (Array.isArray(records) ? records : []).map((record) => JSON.parse(JSON.stringify(record)));
    for (const entity of entities) {
        const supportId = entity.generationSupportId || entity.manualizedFromGeneration?.supportId;
        const oldSupport = oldSupports.get(supportId);
        const newSupport = newSupports.get(supportId);
        if (!oldSupport || !newSupport) throw new Error(`Existing encounter object “${entity.id}” lost support “${supportId}” during the reward reroll.`);
        entity.x = finiteNumber(entity.x, 0) + finiteNumber(newSupport.centerX, 0) - finiteNumber(oldSupport.centerX, 0);
        entity.y = finiteNumber(entity.y, 0) + finiteNumber(newSupport.surfaceY, 0) - finiteNumber(oldSupport.surfaceY, 0);
    }
    const encounters = JSON.parse(JSON.stringify(existingGeneration?.encounters || { encounters: [] }));
    for (const encounter of encounters.encounters || []) {
        const oldSupport = oldSupports.get(encounter.supportId);
        const newSupport = newSupports.get(encounter.supportId);
        if (!oldSupport || !newSupport) throw new Error(`Existing encounter “${encounter.id}” lost support “${encounter.supportId}” during the reward reroll.`);
        encounter.x = finiteNumber(encounter.x, 0) + finiteNumber(newSupport.centerX, 0) - finiteNumber(oldSupport.centerX, 0);
        encounter.y = finiteNumber(encounter.y, 0) + finiteNumber(newSupport.surfaceY, 0) - finiteNumber(oldSupport.surfaceY, 0);
    }
    return { encounters, entities };
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
            branchId: transition.branchId ? String(transition.branchId) : undefined,
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
            branchId: support.branchId ? String(support.branchId) : undefined
        })),
        transitions,
        calmZones: endpointSupports.map((support, index) => ({
            id: index === 0 ? "entrance-calm-zone" : "exit-calm-zone",
            x: finiteNumber(support.centerX, 0),
            y: finiteNumber(support.surfaceY, 0),
            radius: calmDistance,
            role: index === 0 ? "entrance" : "exit"
        })),
        branchShafts: (generation.traversal?.branchShafts || []).map((shaft) => ({
            branchId: String(shaft.branchId || ""),
            leftX: finiteNumber(shaft.leftX, 0),
            rightX: finiteNumber(shaft.rightX, 0),
            topY: finiteNumber(shaft.topY, Math.min(
                finiteNumber(supportById.get(shaft.nearSupportId)?.surfaceY, 0),
                finiteNumber(supportById.get(shaft.farSupportId)?.surfaceY, 0)
            )),
            bottomY: finiteNumber(shaft.bottomY, finiteNumber(supportById.get(shaft.firstBranchSupportId)?.surfaceY, 0)),
            valid: finiteNumber(shaft.width, 0) >= BRANCH_SHAFT_WIDTH
        })),
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
            branchId: reward.branchId ? String(reward.branchId) : undefined
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
        invalidOptionalTransitions: 0,
        minimumTransitionGap: Infinity,
        minimumBranchSurfaceClearance: Infinity,
        branchShaftCount: 0,
        minimumBranchShaftWidth: Infinity,
        minimumBranchEntryOpening: Infinity,
        minimumBranchStepWalkableWidth: Infinity,
        blockedSupportPairs: 0,
        placementSupportMismatchCount: 0,
        manualizedPlacementMismatchCount: 0,
        recoveryPlatformCount: supports.filter((support) => support.role === "recoveryPlatform").length,
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
            else metrics.invalidOptionalTransitions += 1;
            errors.push(`${transition.mandatory ? "Mandatory" : "Optional"} transition “${transition.id}” exceeds the forgiving movement envelope (gap ${transition.gap}, rise ${transition.rise}, drop ${transition.drop}, exposed landing ${transition.exposedLandingWidth ?? 0}).`);
        }
    }

    if (!Number.isFinite(metrics.minimumTransitionGap)) metrics.minimumTransitionGap = 0;

    const connectedSupportPairs = new Set();
    for (const transition of transitions) {
        connectedSupportPairs.add(`${transition.fromSupportId}|${transition.toSupportId}`);
        connectedSupportPairs.add(`${transition.toSupportId}|${transition.fromSupportId}`);
    }
    for (let firstIndex = 0; firstIndex < supports.length; firstIndex += 1) {
        const first = supports[firstIndex];
        for (let secondIndex = firstIndex + 1; secondIndex < supports.length; secondIndex += 1) {
            const second = supports[secondIndex];
            if (connectedSupportPairs.has(`${first.id}|${second.id}`)) continue;
            const overlap = Math.min(
                first.centerX + first.width * 0.5,
                second.centerX + second.width * 0.5
            ) - Math.max(
                first.centerX - first.width * 0.5,
                second.centerX - second.width * 0.5
            );
            if (overlap <= 24) continue;
            const upper = first.surfaceY <= second.surfaceY ? first : second;
            const lower = upper === first ? second : first;
            const upperBottom = upper.surfaceY + upper.height * (1 - upper.surfaceYRatio);
            const bodyClearance = lower.surfaceY - upperBottom;
            const includesRecoveryPlatform = first.role === "recoveryPlatform" || second.role === "recoveryPlatform";
            if (!includesRecoveryPlatform && first.mandatory && second.mandatory && bodyClearance < 96) {
                metrics.blockedSupportPairs += 1;
                errors.push(`Supports “${upper.id}” and “${lower.id}” form a blocked vertical sandwich with only ${roundCoordinate(bodyClearance)} units of clear space.`);
            }
            const branchSupport = first.branchId ? first : second.branchId ? second : null;
            const mandatorySupport = first.mandatory ? first : second.mandatory ? second : null;
            const crossesBranchBoundary = branchSupport && mandatorySupport;
            if (crossesBranchBoundary) {
                const surfaceClearance = branchSupport.surfaceY - mandatorySupport.surfaceY;
                metrics.minimumBranchSurfaceClearance = Math.min(metrics.minimumBranchSurfaceClearance, surfaceClearance);
                const mandatoryBodyBottom = mandatorySupport.surfaceY
                    + mandatorySupport.height * (1 - mandatorySupport.surfaceYRatio);
                const corridorClearance = branchSupport.surfaceY - mandatoryBodyBottom;
                if (surfaceClearance <= 0) {
                    errors.push(`Optional support “${branchSupport.id}” crosses above the mandatory traversal corridor near “${mandatorySupport.id}”.`);
                } else if (corridorClearance < 92) {
                    errors.push(`Optional support “${branchSupport.id}” leaves only ${roundCoordinate(corridorClearance)} units below mandatory support “${mandatorySupport.id}”.`);
                }
            }
        }
    }
    if (!Number.isFinite(metrics.minimumBranchSurfaceClearance)) metrics.minimumBranchSurfaceClearance = 0;

    const branchShafts = Array.isArray(traversal.branchShafts) ? traversal.branchShafts : [];
    const materializedBranchIds = normalizeStringArray(traversal.materializedBranchIds);
    metrics.branchShaftCount = branchShafts.length;
    for (const branchId of materializedBranchIds) {
        const shaft = branchShafts.find((candidate) => candidate.branchId === branchId);
        if (!shaft) {
            errors.push(`Materialized branch “${branchId}” has no collision-safe entry shaft.`);
            continue;
        }
        const nearSupport = bySupportId.get(shaft.nearSupportId);
        const farSupport = bySupportId.get(shaft.farSupportId);
        const firstSupport = bySupportId.get(shaft.firstBranchSupportId);
        if (!nearSupport?.mandatory || !farSupport?.mandatory || !firstSupport || firstSupport.branchId !== branchId) {
            errors.push(`Branch shaft “${branchId}” does not connect two mandatory supports to its first optional foothold.`);
            continue;
        }
        const shaftWidth = finiteNumber(shaft.width, finiteNumber(shaft.rightX) - finiteNumber(shaft.leftX));
        metrics.minimumBranchShaftWidth = Math.min(metrics.minimumBranchShaftWidth, shaftWidth);
        if (shaftWidth < BRANCH_SHAFT_WIDTH - 0.5) errors.push(`Branch shaft “${branchId}” is only ${roundCoordinate(shaftWidth)} units wide.`);
        const firstLeft = firstSupport.centerX - firstSupport.width * 0.5;
        const firstRight = firstSupport.centerX + firstSupport.width * 0.5;
        if (firstLeft < shaft.leftX - 0.5 || firstRight > shaft.rightX + 0.5) {
            errors.push(`First foothold “${firstSupport.id}” does not fit inside branch shaft “${branchId}”.`);
        }
        const entryOpening = Math.max(firstLeft - shaft.leftX, shaft.rightX - firstRight);
        metrics.minimumBranchEntryOpening = Math.min(metrics.minimumBranchEntryOpening, entryOpening);
        if (entryOpening < GENERATED_PLAYER_BODY_WIDTH + 8 - 0.5) {
            errors.push(`Branch shaft “${branchId}” leaves only ${roundCoordinate(entryOpening)} units beside its first foothold.`);
        }
        const branchSupports = supports
            .filter((support) => support.branchId === branchId)
            .sort((left, right) => String(left.routeNodeId || "").localeCompare(String(right.routeNodeId || "")));
        const shaftSteps = branchSupports.slice(0, 2);
        if (shaftSteps.length < 2 || shaftSteps.some((support) => support.role !== "branchStep")) {
            errors.push(`Branch “${branchId}” must begin with two narrow, alternating shaft footholds.`);
        }
        for (const support of shaftSteps) {
            metrics.minimumBranchStepWalkableWidth = Math.min(metrics.minimumBranchStepWalkableWidth, support.walkableWidth || 0);
            if ((support.walkableWidth || 0) < GENERATED_PLAYER_BODY_WIDTH + 12) {
                errors.push(`Branch foothold “${support.id}” is too narrow for Ignatius to stand and turn safely.`);
            }
        }
        const lowerLandings = branchSupports.slice(2);
        if (!lowerLandings.length || lowerLandings.some((support) => (support.walkableWidth || 0) < 150)) {
            errors.push(`Branch “${branchId}” does not open into broad lower return landings.`);
        }
    }
    if (!Number.isFinite(metrics.minimumBranchShaftWidth)) metrics.minimumBranchShaftWidth = 0;
    if (!Number.isFinite(metrics.minimumBranchEntryOpening)) metrics.minimumBranchEntryOpening = 0;
    if (!Number.isFinite(metrics.minimumBranchStepWalkableWidth)) metrics.minimumBranchStepWalkableWidth = 0;

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
        if (!pointInsideCavernProfile(cavern.profile, support.centerX, support.surfaceY - 4)) {
            errors.push(`Support “${support.id}” lies outside the generated cave opening.`);
        }
    }

    if (metrics.maxMandatoryGap > theme.traversal.mandatoryGap * 0.94) warnings.push("At least one mandatory jump approaches the configured conservative gap limit.");
    if (metrics.minimumBranchSurfaceClearance > 0 && metrics.minimumBranchSurfaceClearance < 300) warnings.push("An optional branch passes fairly close to the mandatory traversal corridor.");
    if (metrics.recoveryPlatformCount === 0 && settings.safety > 0.8) warnings.push("High safety was requested, but no transition needed a distinct recovery platform.");

    let qualityScore = routeValidation.qualityScore * 0.42 + 58;
    qualityScore -= errors.length * 45;
    qualityScore -= warnings.length * 1.5;
    qualityScore -= Math.max(0, metrics.maxMandatoryGap - theme.traversal.mandatoryGap * 0.75) * 0.035;
    qualityScore = Math.max(0, Math.min(100, Math.round(qualityScore * 10) / 10));
    return { valid: errors.length === 0, qualityScore, errors, warnings, metrics };
}

function buildForgivingTraversal({
    route,
    theme,
    settings,
    implementations,
    assetCatalog,
    rng,
    runId,
    selectedBranchIds = [],
    branchTargetCount = null
}) {
    const nodes = Array.isArray(route?.nodes) ? route.nodes : [];
    const edges = Array.isArray(route?.edges) ? route.edges : [];
    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const requestedBranchIds = normalizeStringArray(selectedBranchIds);
    const desiredBranchCount = Math.max(0, Math.min(
        requestedBranchIds.length,
        Number.isFinite(Number(branchTargetCount))
            ? Math.floor(Number(branchTargetCount))
            : requestedBranchIds.length
    ));
    const materializedBranches = new Set();
    const branchRejections = [];
    const branchShafts = [];
    const supports = [];
    const placements = [];
    const nodeSupport = new Map();
    const edgeSupportIds = new Map();
    const mandatoryEdgeChains = new Map();
    let order = 1000;

    const addSupport = (spec) => {
        const selection = spec.selection || selectGenerationAsset(assetCatalog, spec.role, spec.targetWidth, rng, spec.role === "doorSupport", spec.maximumWidth);
        if (!selection) throw new Error(`No generation asset can satisfy role “${spec.role}”.`);
        const id = spec.id;
        const mirrorX = selection.asset.mirror && rng.chance(0.42);
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
            branchId: spec.branchId || undefined,
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

    const supportRoleForNode = (node) => node.kind === "entrance" || node.kind === "exit"
        ? "doorSupport"
        : node.mandatory
            ? "routeFloor"
            : node.kind === "optionalReward"
                ? "landingPlatform"
                : "branchStep";

    const supportTargetWidthForNode = (node, role) => role === "doorSupport"
        ? theme.traversal.endpointWidth
        : node.kind === "optionalReward"
            ? theme.traversal.intermediateWidth * 0.88
            : !node.mandatory
                ? 64
                : node.kind === "chamber" || node.kind === "recovery"
                    ? theme.traversal.chamberWidth
                    : theme.traversal.traversalWidth;

    for (const node of nodes.filter((candidate) => candidate.mandatory)) {
        const role = supportRoleForNode(node);
        const support = addSupport({
            id: `support_${node.id}`,
            role,
            targetWidth: supportTargetWidthForNode(node, role),
            maximumWidth: role === "doorSupport"
                ? Infinity
                : supportTargetWidthForNode(node, role) * (node.kind === "chamber" || node.kind === "recovery" ? 1.12 : 1.18),
            centerX: node.x,
            surfaceY: node.y,
            mandatory: true,
            routeNodeId: node.id
        });
        nodeSupport.set(node.id, support);
    }

    const requestedBranchEntryNodeIds = new Set(edges
        .filter((edge) => edge.mandatory === false && requestedBranchIds.includes(edge.branchId))
        .filter((edge) => nodeById.get(edge.from)?.mandatory !== false && nodeById.get(edge.to)?.mandatory === false)
        .map((edge) => edge.from));
    const shaftRequestedEdgeIds = new Set(edges
        .filter((edge) => edge.mandatory !== false && requestedBranchEntryNodeIds.has(edge.from))
        .map((edge) => edge.id));
    const transitions = [];

    const processEdge = (edge, disableShaftReservation = false) => {
        const startSupport = nodeSupport.get(edge.from);
        const endSupport = nodeSupport.get(edge.to);
        if (!startSupport || !endSupport) throw new Error(`Route edge “${edge.id}” is missing one of its supports.`);
        const mandatory = edge.mandatory !== false;
        const distanceX = Math.abs(endSupport.centerX - startSupport.centerX);
        const distanceY = Math.abs(endSupport.surfaceY - startSupport.surfaceY);
        const direction = Math.sign(endSupport.centerX - startSupport.centerX) || 1;
        const widthScale = mandatory ? (0.96 + settings.safety * 0.12) : 0.58;
        const reserveBranchShaft = mandatory && shaftRequestedEdgeIds.has(edge.id) && !disableShaftReservation;
        const intermediateWidth = theme.traversal.intermediateWidth * widthScale;
        const candidateIntermediateWidth = reserveBranchShaft
            ? 206
            : intermediateWidth;
        const reservedShaftWidth = reserveBranchShaft ? BRANCH_SHAFT_WIDTH : 0;
        const intermediateRole = reserveBranchShaft
            ? "shaftBridge"
            : mandatory
                ? "landingPlatform"
                : "branchStep";
        const minimumGap = mandatory ? 12 : 4;
        const preferredMaximumGap = mandatory
            ? theme.traversal.mandatoryGap
            : theme.traversal.mandatoryGap * 1.18;
        const edgeSurfaceAt = (t) => lerp(startSupport.surfaceY, endSupport.surfaceY, t);
        let intermediateCount = -1;
        let selectedIntermediateAssets = [];
        let selectedGaps = [];

        for (let count = 0; count <= 10; count += 1) {
            const maximumIntermediateWidth = count > 0
                ? (distanceX - startSupport.width * 0.5 - endSupport.width * 0.5 - minimumGap * (count + 1)) / count
                : Infinity;
            const selections = Array.from({ length: count }, () =>
                selectGenerationAsset(
                    assetCatalog,
                    intermediateRole,
                    Math.min(candidateIntermediateWidth, maximumIntermediateWidth),
                    rng,
                    false,
                    maximumIntermediateWidth
                )
            );
            if (selections.some((selection) => !selection)) continue;
            const occupiedWidth = startSupport.width * 0.5
                + endSupport.width * 0.5
                + selections.reduce((sum, selection) => sum + selection.width, 0);
            const gapCount = count + 1;
            const totalFree = distanceX - occupiedWidth;
            const candidateWalkableInsets = [
                { left: startSupport.walkableLeftInset, right: startSupport.walkableRightInset },
                ...selections.map((selection) => {
                    const conservativeInset = selection.width * Math.max(
                        selection.asset.walkableLeftInsetRatio,
                        selection.asset.walkableRightInsetRatio
                    );
                    return { left: conservativeInset, right: conservativeInset };
                }),
                { left: endSupport.walkableLeftInset, right: endSupport.walkableRightInset }
            ];
            let candidateGaps = [];
            if (reserveBranchShaft) {
                const maximumPhysicalGaps = Array.from({ length: gapCount }, (_, index) =>
                    Math.max(minimumGap, preferredMaximumGap
                        - candidateWalkableInsets[index].right
                        - candidateWalkableInsets[index + 1].left)
                );
                const shaftIndex = maximumPhysicalGaps
                    .map((maximum, index) => ({ maximum, index }))
                    .filter((entry) => entry.maximum >= reservedShaftWidth - 0.01)
                    .sort((a, b) => b.maximum - a.maximum || a.index - b.index)[0]?.index;
                if (!Number.isInteger(shaftIndex)) continue;
                candidateGaps = Array.from({ length: gapCount }, () => minimumGap);
                candidateGaps[shaftIndex] = reservedShaftWidth;
                let remaining = totalFree - candidateGaps.reduce((sum, gap) => sum + gap, 0);
                if (remaining < -0.01) continue;
                const allocationOrder = [
                    ...candidateGaps.map((_, index) => index).filter((index) => index !== shaftIndex),
                    shaftIndex
                ];
                for (const index of allocationOrder) {
                    if (remaining <= 0.01) break;
                    const capacity = Math.max(0, maximumPhysicalGaps[index] - candidateGaps[index]);
                    const amount = Math.min(capacity, remaining);
                    candidateGaps[index] += amount;
                    remaining -= amount;
                }
                if (remaining > 0.05) continue;
            } else {
                const candidateGap = totalFree / gapCount;
                const overlappingOptionalPair = !mandatory && count === 0 && candidateGap < minimumGap;
                if ((!overlappingOptionalPair && candidateGap < minimumGap) || candidateGap > preferredMaximumGap) continue;
                let candidateWalkableGapValid = true;
                for (let index = 1; index < candidateWalkableInsets.length; index += 1) {
                    const walkableGap = Math.max(0, candidateGap)
                        + candidateWalkableInsets[index - 1].right
                        + candidateWalkableInsets[index].left;
                    if (walkableGap > preferredMaximumGap + 0.5) candidateWalkableGapValid = false;
                }
                if (!candidateWalkableGapValid) continue;
                candidateGaps = Array.from({ length: gapCount }, () => candidateGap);
            }
            const candidateSurfaces = [startSupport.surfaceY];
            for (let index = 1; index <= count; index += 1) candidateSurfaces.push(edgeSurfaceAt(index / (count + 1)));
            candidateSurfaces.push(endSupport.surfaceY);
            let candidateVerticalValid = true;
            for (let index = 1; index < candidateSurfaces.length; index += 1) {
                const stepRise = Math.max(0, candidateSurfaces[index - 1] - candidateSurfaces[index]);
                const stepDrop = Math.max(0, candidateSurfaces[index] - candidateSurfaces[index - 1]);
                const riseLimit = theme.traversal.mandatoryRise * (mandatory ? 1 : 1.18);
                const dropLimit = theme.traversal.mandatoryDrop * (mandatory ? 1 : 1.2);
                const returnLimit = theme.traversal.mandatoryRise * 1.18;
                if (stepRise > riseLimit || stepDrop > dropLimit) candidateVerticalValid = false;
                if (!mandatory && (stepRise > returnLimit || stepDrop > returnLimit)) candidateVerticalValid = false;
            }
            if (!candidateVerticalValid) continue;
            intermediateCount = count;
            selectedIntermediateAssets = selections;
            selectedGaps = candidateGaps;
            break;
        }

        if (intermediateCount < 0) {
            if (reserveBranchShaft) return processEdge(edge, true);
            throw new Error(`Route edge “${edge.id}” cannot fit collision-safe platforms across ${roundCoordinate(distanceX)} horizontal and ${roundCoordinate(distanceY)} vertical units.`);
        }

        const intermediate = [];
        for (let index = 1; index <= intermediateCount; index += 1) {
            const t = index / (intermediateCount + 1);
            intermediate.push(addSupport({
                id: `support_${edge.id}_${String(index).padStart(2, "0")}`,
                role: intermediateRole,
                targetWidth: intermediateWidth,
                selection: selectedIntermediateAssets[index - 1],
                centerX: lerp(startSupport.centerX, endSupport.centerX, t),
                surfaceY: edgeSurfaceAt(t),
                mandatory,
                routeEdgeId: edge.id,
                branchId: edge.branchId
            }));
        }

        let cursor = startSupport.centerX + direction * startSupport.width * 0.5;
        for (const support of intermediate) {
            cursor += direction * (selectedGaps[intermediate.indexOf(support)] + support.width * 0.5);
            moveSupportCenter(support, cursor);
            cursor += direction * support.width * 0.5;
        }
        const chain = [startSupport, ...intermediate, endSupport];
        edgeSupportIds.set(edge.id, intermediate.map((support) => support.id));
        for (let index = 1; index < chain.length; index += 1) {
            transitions.push(classifyTraversalTransition(chain[index - 1], chain[index], edge, theme));
        }
        if (mandatory) mandatoryEdgeChains.set(edge.id, chain);
        return chain;
    };

    for (const edge of edges.filter((candidate) => candidate.mandatory !== false)) processEdge(edge);

    const physicalGapBetween = (left, right, direction) => direction > 0
        ? right.centerX - right.width * 0.5 - (left.centerX + left.width * 0.5)
        : left.centerX - left.width * 0.5 - (right.centerX + right.width * 0.5);

    const walkableInsetToward = (support, direction, trailing) => {
        if (direction > 0) return trailing ? support.walkableRightInset : support.walkableLeftInset;
        return trailing ? support.walkableLeftInset : support.walkableRightInset;
    };

    const redistributeMandatoryEdgeForShaft = (edge, chain, firstBranchWidth) => {
        if (!edge || !Array.isArray(chain) || chain.length < 2) return null;
        const direction = Math.sign(chain.at(-1).centerX - chain[0].centerX) || 1;
        const currentGaps = [];
        const maximumGaps = [];
        for (let index = 1; index < chain.length; index += 1) {
            const previous = chain[index - 1];
            const current = chain[index];
            currentGaps.push(physicalGapBetween(previous, current, direction));
            maximumGaps.push(Math.max(12,
                theme.traversal.mandatoryGap
                - walkableInsetToward(previous, direction, true)
                - walkableInsetToward(current, direction, false)
            ));
        }
        const totalFree = currentGaps.reduce((sum, gap) => sum + gap, 0);
        const shaftGap = Math.max(
            BRANCH_SHAFT_WIDTH,
            firstBranchWidth + GENERATED_PLAYER_BODY_WIDTH + BRANCH_SHAFT_SIDE_CLEARANCE
        );
        const candidates = currentGaps
            .map((gap, index) => ({ index, gap, maximum: maximumGaps[index] }))
            .filter((entry) => entry.maximum >= shaftGap - 0.01)
            .sort((a, b) => b.gap - a.gap || b.maximum - a.maximum || a.index - b.index);
        for (const candidate of candidates) {
            const gaps = Array.from({ length: currentGaps.length }, () => 12);
            gaps[candidate.index] = Math.max(gaps[candidate.index], shaftGap);
            let remaining = totalFree - gaps.reduce((sum, gap) => sum + gap, 0);
            if (remaining < -0.01) continue;
            const allocationOrder = [
                ...gaps.map((_, index) => index).filter((index) => index !== candidate.index),
                candidate.index
            ];
            for (const index of allocationOrder) {
                if (remaining <= 0.01) break;
                const capacity = Math.max(0, maximumGaps[index] - gaps[index]);
                const amount = Math.min(capacity, remaining);
                gaps[index] += amount;
                remaining -= amount;
            }
            if (remaining > 0.05) continue;

            const savedCenters = chain.slice(1, -1).map((support) => support.centerX);
            let cursor = chain[0].centerX + direction * chain[0].width * 0.5;
            for (let index = 1; index < chain.length - 1; index += 1) {
                const support = chain[index];
                cursor += direction * (gaps[index - 1] + support.width * 0.5);
                moveSupportCenter(support, cursor);
                cursor += direction * support.width * 0.5;
            }
            const rebuilt = [];
            for (let index = 1; index < chain.length; index += 1) {
                const transition = classifyTraversalTransition(chain[index - 1], chain[index], edge, theme);
                if (!transition.valid) {
                    savedCenters.forEach((center, savedIndex) => moveSupportCenter(chain[savedIndex + 1], center));
                    rebuilt.length = 0;
                    break;
                }
                rebuilt.push(transition);
            }
            if (!rebuilt.length) continue;
            for (let index = transitions.length - 1; index >= 0; index -= 1) {
                if (transitions[index].routeEdgeId === edge.id) transitions.splice(index, 1);
            }
            transitions.push(...rebuilt);
            const previous = chain[candidate.index];
            const current = chain[candidate.index + 1];
            const near = direction > 0
                ? previous.centerX + previous.width * 0.5
                : previous.centerX - previous.width * 0.5;
            const far = direction > 0
                ? current.centerX - current.width * 0.5
                : current.centerX + current.width * 0.5;
            return {
                x: roundCoordinate((near + far) * 0.5),
                direction,
                previousSupport: previous,
                nextSupport: current,
                edge,
                chain,
                savedCenters,
                transitionSnapshot: rebuilt
            };
        }
        return null;
    };

    const branchSupportCollidesWithMandatoryCorridor = (branchSupports) => {
        const mandatorySupports = supports.filter((support) => support.mandatory);
        for (const branchSupport of branchSupports) {
            const left = branchSupport.centerX - branchSupport.width * 0.5;
            const right = branchSupport.centerX + branchSupport.width * 0.5;
            for (const mandatorySupport of mandatorySupports) {
                const mandatoryLeft = mandatorySupport.centerX - mandatorySupport.width * 0.5;
                const mandatoryRight = mandatorySupport.centerX + mandatorySupport.width * 0.5;
                if (right <= mandatoryLeft || left >= mandatoryRight) continue;
                const mandatoryBottom = mandatorySupport.surfaceY
                    + mandatorySupport.height * (1 - mandatorySupport.surfaceYRatio);
                if (branchSupport.surfaceY - mandatoryBottom < 92) return true;
            }
        }
        return false;
    };

    for (const branchId of requestedBranchIds) {
        if (materializedBranches.size >= desiredBranchCount) break;
        const branchNodes = nodes
            .filter((node) => node.branchId === branchId && node.mandatory === false)
            .sort((left, right) => Number(left.progress) - Number(right.progress));
        const entryEdge = edges.find((edge) => edge.branchId === branchId
            && edge.mandatory === false
            && nodeById.get(edge.from)?.mandatory !== false
            && nodeById.get(edge.to)?.mandatory === false);
        if (!entryEdge || !branchNodes.length) {
            branchRejections.push({ branchId, reason: "Branch reservation is missing its entry edge or authored nodes." });
            continue;
        }
        const outgoingMainEdge = edges.find((edge) => edge.mandatory !== false && edge.from === entryEdge.from);
        const mainChain = mandatoryEdgeChains.get(outgoingMainEdge?.id);
        const firstSelection = selectGenerationAsset(assetCatalog, "branchStep", 70, rng, false);
        if (!outgoingMainEdge || !mainChain || !firstSelection) {
            branchRejections.push({ branchId, reason: "Branch entry has no usable outgoing main chain or stair asset." });
            continue;
        }

        const supportCountBefore = supports.length;
        const placementCountBefore = placements.length;
        const transitionCountBefore = transitions.length;
        const chainCentersBefore = mainChain.slice(1, -1).map((support) => support.centerX);
        const oldMainTransitions = transitions
            .filter((transition) => transition.routeEdgeId === outgoingMainEdge.id)
            .map((transition) => JSON.parse(JSON.stringify(transition)));
        const shaft = redistributeMandatoryEdgeForShaft(outgoingMainEdge, mainChain, firstSelection.width);
        if (!shaft) {
            branchRejections.push({ branchId, reason: "The outgoing mandatory chain cannot reserve a collision-safe stairwell gap." });
            continue;
        }

        const createdNodeIds = [];
        const createdEdgeIds = [];
        try {
            const startSupport = nodeSupport.get(entryEdge.from);
            const returnStep = theme.traversal.mandatoryRise * 0.95;
            const branchSupports = [];
            for (let index = 0; index < branchNodes.length; index += 1) {
                const node = branchNodes[index];
                const isRewardLanding = node.kind === "optionalReward";
                const isShaftStep = index < 2 && !isRewardLanding;
                const role = isShaftStep ? "branchStep" : "landingPlatform";
                const selection = isShaftStep ? firstSelection : null;
                const centerX = isShaftStep
                    ? shaft.x + (index === 0 ? 1 : -1) * shaft.direction * BRANCH_STAIR_LATERAL_OFFSET
                    : shaft.x + shaft.direction * (165 + (index - 2) * 190);
                const surfaceY = startSupport.surfaceY + returnStep * (index + 1);
                const targetWidth = isShaftStep
                    ? 70
                    : isRewardLanding
                        ? theme.traversal.intermediateWidth * 0.9
                        : 206;
                const support = addSupport({
                    id: `support_${node.id}`,
                    role,
                    targetWidth,
                    selection,
                    centerX,
                    surfaceY,
                    mandatory: false,
                    routeNodeId: node.id,
                    branchId
                });
                nodeSupport.set(node.id, support);
                createdNodeIds.push(node.id);
                branchSupports.push(support);
            }
            const firstBranchSupport = branchSupports[0];
            const entryTransition = classifyTraversalTransition(shaft.previousSupport, firstBranchSupport, entryEdge, theme);
            if (!entryTransition.valid) {
                throw new Error(`Branch “${branchId}” cannot enter the reserved stairwell safely.`);
            }
            transitions.push(entryTransition);
            edgeSupportIds.set(entryEdge.id, []);
            createdEdgeIds.push(entryEdge.id);
            const branchEdges = edges.filter((edge) => edge.branchId === branchId
                && edge.mandatory === false
                && nodeById.get(edge.from)?.mandatory === false
                && nodeById.get(edge.to)?.mandatory === false);
            for (const edge of branchEdges) {
                processEdge(edge);
                createdEdgeIds.push(edge.id);
            }
            const branchTransitions = transitions.filter((transition) => transition.branchId === branchId);
            if (!branchTransitions.length || branchTransitions.some((transition) => !transition.valid)) {
                throw new Error(`Branch “${branchId}” did not produce a complete bidirectional traversal.`);
            }
            if (branchSupportCollidesWithMandatoryCorridor(
                supports.filter((support) => support.branchId === branchId)
            )) {
                throw new Error(`Branch “${branchId}” intrudes into the mandatory collision corridor.`);
            }
            const shaftLeft = Math.min(
                shaft.previousSupport.centerX + shaft.direction * shaft.previousSupport.width * 0.5,
                shaft.nextSupport.centerX - shaft.direction * shaft.nextSupport.width * 0.5
            );
            const shaftRight = Math.max(
                shaft.previousSupport.centerX + shaft.direction * shaft.previousSupport.width * 0.5,
                shaft.nextSupport.centerX - shaft.direction * shaft.nextSupport.width * 0.5
            );
            branchShafts.push({
                branchId,
                routeEdgeId: outgoingMainEdge.id,
                entrySupportId: startSupport.id,
                nearSupportId: shaft.previousSupport.id,
                farSupportId: shaft.nextSupport.id,
                centerX: shaft.x,
                leftX: roundCoordinate(shaftLeft),
                rightX: roundCoordinate(shaftRight),
                width: roundCoordinate(shaftRight - shaftLeft),
                firstBranchSupportId: firstBranchSupport.id
            });
            materializedBranches.add(branchId);
        } catch (error) {
            branchRejections.push({ branchId, reason: String(error?.message || error) });
            for (let index = branchShafts.length - 1; index >= 0; index -= 1) {
                if (branchShafts[index].branchId === branchId) branchShafts.splice(index, 1);
            }
            supports.splice(supportCountBefore);
            placements.splice(placementCountBefore);
            transitions.splice(transitionCountBefore);
            for (let index = transitions.length - 1; index >= 0; index -= 1) {
                if (transitions[index].routeEdgeId === outgoingMainEdge.id) transitions.splice(index, 1);
            }
            transitions.push(...oldMainTransitions);
            chainCentersBefore.forEach((center, index) => moveSupportCenter(mainChain[index + 1], center));
            for (const nodeId of createdNodeIds) nodeSupport.delete(nodeId);
            for (const edgeId of createdEdgeIds) edgeSupportIds.delete(edgeId);
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
    for (const transition of [...transitions]) {
        if (!transition.mandatory || settings.safety < 0.5) continue;
        const from = supports.find((support) => support.id === transition.fromSupportId);
        const to = supports.find((support) => support.id === transition.toSupportId);
        if (!from || !to) continue;
        const deservesRecovery = transition.gap > 82 || transition.drop > 150;
        if (!deservesRecovery || !rng.chance(0.35 + settings.safety * 0.45)) continue;
        const centerX = (from.centerX + to.centerX) * 0.5;
        const surfaceY = Math.max(from.surfaceY, to.surfaceY) + 165;
        if (existing.some((support) => Math.abs(support.centerX - centerX) < 170 && Math.abs(support.surfaceY - surfaceY) < 115)) continue;
        const support = addSupport({
            id: `support_recovery_${String(supports.length + 1).padStart(3, "0")}`,
            role: "recoveryPlatform",
            targetWidth: theme.traversal.intermediateWidth * 0.88,
            centerX,
            surfaceY,
            mandatory: false,
            routeEdgeId: transition.routeEdgeId
        });
        existing.push(support);
    }

    const desiredMovingCount = settings.length === "grand" ? 3 : settings.length === "extended" ? 2 : settings.length === "standard" ? 1 : 0;
    const movingCandidates = rng.shuffle(supports.filter((support) => support.role === "landingPlatform" && support.mandatory && support.routeEdgeId));
    for (let index = 0; index < Math.min(desiredMovingCount, movingCandidates.length); index += 1) {
        const support = movingCandidates[index];
        const placement = placements.find((candidate) => candidate.id === support.placementId);
        if (!placement) continue;
        placement.movement = {
            version: 1,
            pattern: "shuttle",
            activation: "automatic",
            endOffsetX: roundCoordinate(rng.range(-28, 28)),
            endOffsetY: roundCoordinate((index % 2 === 0 ? -1 : 1) * rng.range(72, 118)),
            speed: roundCoordinate(rng.range(76, 104)),
            initialDelay: roundCoordinate(rng.range(0, 0.75)),
            triggerDelay: 0,
            startPause: roundCoordinate(rng.range(0.65, 1.1)),
            endPause: roundCoordinate(rng.range(0.65, 1.1)),
            fadeDuration: 0.2,
            hiddenDuration: 1.25
        };
        placement.generationRole = "movingLandingPlatform";
        support.moving = true;
    }

    const materializedOptionalEdges = edges.filter((edge) => edge.mandatory === false
        && materializedBranches.has(edge.branchId)
        && nodeById.get(edge.to)?.mandatory === false);
    return {
        version: 1,
        generatorId: implementations.traversal,
        startSupportId: nodeSupport.get(route.startNodeId)?.id || "",
        exitSupportId: nodeSupport.get(route.exitNodeId)?.id || "",
        supports,
        transitions,
        mandatorySupportPath: mandatorySupportPath.filter(Boolean),
        requestedBranchIds,
        requestedBranchCount: desiredBranchCount,
        branchRejections,
        branchShafts,
        materializedBranchIds: [...materializedBranches].sort(),
        materializedOptionalRouteNodeIds: nodes.filter((node) => !node.mandatory && materializedBranches.has(node.branchId)).map((node) => node.id),
        materializedOptionalRouteEdgeIds: materializedOptionalEdges.map((edge) => edge.id),
        previewOnlyMergeEdgeIds: edges.filter((edge) => edge.mandatory === false
            && materializedBranches.has(edge.branchId)
            && nodeById.get(edge.to)?.mandatory !== false).map((edge) => edge.id),
        reservedOptionalRouteNodeIds: nodes.filter((node) => !node.mandatory && !materializedBranches.has(node.branchId)).map((node) => node.id),
        reservedOptionalRouteEdgeIds: edges.filter((edge) => edge.mandatory === false && !materializedBranches.has(edge.branchId)).map((edge) => edge.id),
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
    const riseLimit = mandatory ? theme.traversal.mandatoryRise : theme.traversal.mandatoryRise * 1.18;
    const dropLimit = mandatory ? theme.traversal.mandatoryDrop : theme.traversal.mandatoryDrop * 1.2;
    const requiredExposedLandingWidth = mandatory ? 56 : GENERATED_PLAYER_BODY_WIDTH + 8;
    const verticalClearanceValid = Math.max(rise, drop) <= 48 || exposedLandingWidth >= requiredExposedLandingWidth;
    const returnLimit = theme.traversal.mandatoryRise * 1.18;
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
        branchId: edge.branchId || undefined,
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

function selectGenerationAsset(catalog, role, targetWidth, rng, doorSupport = false, maximumWidth = Infinity) {
    const candidates = catalog.assets
        .filter((asset) => asset.roles.includes(role))
        .map((asset) => {
            const minimumRequestedWidth = role === "branchStep" ? 48 : 64;
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
        const legacySide = role === "entrance" ? -1 : 1;
        const inwardSide = role === "entrance" ? 1 : -1;
        const side = implementations.endpoints === "grounded-chamber-endpoints-v2" ? inwardSide : legacySide;
        const requestedOffset = support.width * (implementations.endpoints === "grounded-chamber-endpoints-v2" ? 0.13 : 0.24);
        const minimumX = support.walkableLeftX + width * 0.5 + 48;
        const maximumX = support.walkableRightX - width * 0.5 - 48;
        const x = clamp(support.centerX + side * requestedOffset, minimumX, maximumX);
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
        version: 1,
        generatorId: implementations.endpoints,
        entrance: { nodeId: route.startNodeId, supportId: entranceSupport.id, entityId: entrance.id },
        exit: { nodeId: route.exitNodeId, supportId: exitSupport.id, entityId: exit.id },
        entities,
        calmDistance: theme.endpoints.calmDistance,
        variation: rng.float()
    };
}

function buildRoomAndTunnelCavern({ route, traversal, endpoints, theme, seed, runId, generatorId }) {
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
        rx = Math.max(rx, support.width * 0.5 + theme.cavern.platformWallClearanceX);
        const platformDepth = support.height * (1 - support.surfaceYRatio);
        const desiredTop = support.surfaceY - theme.cavern.platformCeilingClearance;
        const desiredBottom = support.surfaceY + platformDepth + theme.cavern.platformFloorClearance;
        const minimumHalfHeight = (desiredBottom - desiredTop) * 0.5;
        const supportHalfWidth = support.width * 0.5;
        const supportEdgeRatio = clamp(supportHalfWidth / Math.max(1, rx), 0, 0.92);
        const supportEdgeFactor = Math.sqrt(Math.max(0.15, 1 - supportEdgeRatio * supportEdgeRatio));
        // The ellipse must provide the requested top and bottom clearance across the
        // whole collision-bearing support, not merely at its centre point.
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
        if (room) rooms.push({ ...room, nodeId: node.id, supportId: support.id, x: support.centerX, y: centerY, rx, ry });
        return stamp;
    });
    if (!stamps.length) throw new Error("Room-and-tunnel cavern builder received no traversal supports.");

    const minX = Math.min(...stamps.map((stamp) => stamp.x - stamp.rx * 0.96));
    const maxX = Math.max(...stamps.map((stamp) => stamp.x + stamp.rx * 0.96));
    const span = maxX - minX;
    const step = Math.max(theme.cavern.sampleStep, span / 52);
    const samplePositions = [minX, maxX, ...stamps.map((stamp) => stamp.x)];
    for (const stamp of stamps) {
        if (stamp.kind === "macroRoom" || stamp.kind === "endpointChamber") {
            samplePositions.push(stamp.x - stamp.rx * 0.58, stamp.x + stamp.rx * 0.58);
        }
    }
    for (let x = minX; x < maxX + step * 0.25; x += step) samplePositions.push(Math.min(maxX, x));
    const uniqueSamplePositions = [...new Set(samplePositions.map((x) => roundCoordinate(x)))].sort((a, b) => a - b);
    const profile = [];
    for (const sampleX of uniqueSamplePositions) {
        let top = Infinity;
        let bottom = -Infinity;
        for (const stamp of stamps) {
            const dx = (sampleX - stamp.x) / stamp.rx;
            if (Math.abs(dx) >= 1) continue;
            const halfHeight = stamp.ry * Math.sqrt(Math.max(0, 1 - dx * dx));
            top = Math.min(top, stamp.y - halfHeight);
            bottom = Math.max(bottom, stamp.y + halfHeight);
        }
        if (Number.isFinite(top) && Number.isFinite(bottom)) profile.push({ x: roundCoordinate(sampleX), top, bottom });
    }
    smoothCavernProfile(profile, "top", 2);
    smoothCavernProfile(profile, "bottom", 2);
    const points = [
        ...profile.map((sample, index) => ({ id: `generated_cave_top_${String(index + 1).padStart(3, "0")}`, x: sample.x, y: roundCoordinate(sample.top), mode: "smooth" })),
        ...[...profile].reverse().map((sample, index) => ({ id: `generated_cave_bottom_${String(index + 1).padStart(3, "0")}`, x: sample.x, y: roundCoordinate(sample.bottom), mode: "smooth" }))
    ];
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
        version: 2,
        generatorId,
        runId,
        macroPatternId: route?.macro?.patternId || "",
        macroPatternLabel: route?.macro?.patternLabel || "",
        rooms: rooms.map((room) => Object.fromEntries(Object.entries(room).map(([key, value]) => [key, typeof value === "number" ? roundCoordinate(value) : value]))),
        stamps: stamps.map((stamp) => Object.fromEntries(Object.entries(stamp).map(([key, value]) => [key, typeof value === "number" ? roundCoordinate(value) : value]))),
        profile: profile.map((sample) => ({ x: roundCoordinate(sample.x), top: roundCoordinate(sample.top), bottom: roundCoordinate(sample.bottom) })),
        bounds: Object.fromEntries(Object.entries(bounds).map(([key, value]) => [key, roundCoordinate(value)])),
        endpointPositions: endpointEntities.map((entity) => ({ id: entity.id, role: entity.portalRole, x: entity.x, y: entity.y })),
        caveWindow: {
            version: 1,
            enabled: true,
            feather: 118,
            parallax: 1.08,
            decoration: {
                seed: hashGeneratorSeed(`${seed}:cavern:${runId}`) % 1000000,
                spacing: 180,
                scale: 2.15,
                brightness: 0.46,
                saturation: 0.68
            },
            points
        }
    };
}

function buildEllipseCavern({ route, traversal, theme, seed, runId, generatorId }) {
    const nodeIds = new Set((route.nodes || []).map((node) => node.id));
    const stamps = traversal.supports.map((support) => {
        const endpoint = support.id === traversal.startSupportId || support.id === traversal.exitSupportId;
        const chamber = endpoint || Boolean(support.routeNodeId && nodeIds.has(support.routeNodeId));
        return {
            id: `cavern_stamp_${support.id}`,
            x: support.centerX,
            y: support.surfaceY - theme.cavern.floorOffsetY,
            rx: endpoint ? theme.cavern.chamberRadiusX + 85 : chamber ? theme.cavern.chamberRadiusX : theme.cavern.corridorRadiusX,
            ry: endpoint ? theme.cavern.chamberRadiusY + 55 : chamber ? theme.cavern.chamberRadiusY : theme.cavern.corridorRadiusY,
            sourceSupportId: support.id
        };
    });
    if (!stamps.length) throw new Error("Cavern builder received no traversal supports.");
    const minX = Math.min(...stamps.map((stamp) => stamp.x - stamp.rx * 0.93));
    const maxX = Math.max(...stamps.map((stamp) => stamp.x + stamp.rx * 0.93));
    const span = maxX - minX;
    const step = Math.max(theme.cavern.sampleStep, span / 26);
    const samplePositions = [minX, maxX, ...stamps.map((stamp) => stamp.x)];
    for (let x = minX; x < maxX + step * 0.25; x += step) samplePositions.push(Math.min(maxX, x));
    const uniqueSamplePositions = [...new Set(samplePositions.map((x) => roundCoordinate(x)))].sort((a, b) => a - b);
    const profile = [];
    for (const sampleX of uniqueSamplePositions) {
        let top = Infinity;
        let bottom = -Infinity;
        for (const stamp of stamps) {
            const dx = (sampleX - stamp.x) / stamp.rx;
            if (Math.abs(dx) >= 1) continue;
            const halfHeight = stamp.ry * Math.sqrt(Math.max(0, 1 - dx * dx));
            top = Math.min(top, stamp.y - halfHeight);
            bottom = Math.max(bottom, stamp.y + halfHeight);
        }
        if (Number.isFinite(top) && Number.isFinite(bottom)) profile.push({ x: roundCoordinate(sampleX), top, bottom });
    }
    smoothCavernProfile(profile, "top", 2);
    smoothCavernProfile(profile, "bottom", 2);
    const points = [
        ...profile.map((sample, index) => ({ id: `generated_cave_top_${String(index + 1).padStart(3, "0")}`, x: sample.x, y: roundCoordinate(sample.top), mode: "smooth" })),
        ...[...profile].reverse().map((sample, index) => ({ id: `generated_cave_bottom_${String(index + 1).padStart(3, "0")}`, x: sample.x, y: roundCoordinate(sample.bottom), mode: "smooth" }))
    ];
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const bounds = {
        x: Math.min(...xs),
        y: Math.min(...ys),
        w: Math.max(...xs) - Math.min(...xs),
        h: Math.max(...ys) - Math.min(...ys)
    };
    return {
        version: 1,
        generatorId,
        runId,
        stamps: stamps.map((stamp) => ({ ...stamp, x: roundCoordinate(stamp.x), y: roundCoordinate(stamp.y), rx: roundCoordinate(stamp.rx), ry: roundCoordinate(stamp.ry) })),
        profile: profile.map((sample) => ({ x: roundCoordinate(sample.x), top: roundCoordinate(sample.top), bottom: roundCoordinate(sample.bottom) })),
        bounds: Object.fromEntries(Object.entries(bounds).map(([key, value]) => [key, roundCoordinate(value)])),
        caveWindow: {
            version: 1,
            enabled: true,
            feather: 140,
            parallax: 1.1,
            decoration: {
                seed: hashGeneratorSeed(`${seed}:cavern:${runId}`) % 1000000,
                spacing: 210,
                scale: 2,
                brightness: 0.4,
                saturation: 0.62
            },
            points
        }
    };
}

function smoothCavernProfile(profile, key, passes) {
    const openingEdge = key === "top" ? Math.min : Math.max;
    for (let pass = 0; pass < passes; pass += 1) {
        const values = profile.map((sample) => sample[key]);
        for (let index = 1; index < profile.length - 1; index += 1) {
            const smoothed = values[index - 1] * 0.24 + values[index] * 0.52 + values[index + 1] * 0.24;
            // Smoothing may widen the cave opening, but must never shave away the
            // ellipse union that was built around traversal supports.
            profile[index][key] = openingEdge(values[index], smoothed);
        }
    }
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

function pointInsideCavernProfile(profile, x, y) {
    if (!Array.isArray(profile) || profile.length < 2) return false;
    if (x < profile[0].x || x > profile.at(-1).x) return false;
    for (let index = 1; index < profile.length; index += 1) {
        const a = profile[index - 1];
        const b = profile[index];
        if (x < a.x || x > b.x) continue;
        const t = Math.abs(b.x - a.x) < 0.001 ? 0 : (x - a.x) / (b.x - a.x);
        const top = lerp(a.top, b.top, t);
        const bottom = lerp(a.bottom, b.bottom, t);
        return y >= top && y <= bottom;
    }
    return false;
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
        optionalNodeCount: 0,
        branchCount: 0,
        minNodeDistance: Infinity,
        edgeCrossings: 0,
        backtrackEdges: 0,
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
    const optionalNodes = nodes.filter((node) => !node.mandatory);
    metrics.mainNodeCount = mainNodes.length;
    metrics.optionalNodeCount = optionalNodes.length;
    metrics.branchCount = new Set(optionalNodes.map((node) => node.branchId).filter(Boolean)).size;
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
        if (exit.x < rightmostX - 1) errors.push("The exit is not the rightmost route node.");
        if (exit.x <= start.x) errors.push("The route exit must be to the right of its entrance.");
    }

    for (let aIndex = 0; aIndex < nodes.length; aIndex += 1) {
        for (let bIndex = aIndex + 1; bIndex < nodes.length; bIndex += 1) {
            metrics.minNodeDistance = Math.min(metrics.minNodeDistance, distance(nodes[aIndex], nodes[bIndex]));
        }
    }
    if (!Number.isFinite(metrics.minNodeDistance)) metrics.minNodeDistance = 0;
    if (metrics.minNodeDistance < 135) errors.push("Two route nodes are too close to read or build independently.");
    else if (metrics.minNodeDistance < 190) warnings.push("Some route nodes are close; later geometry must preserve separate landing space.");

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
        for (let index = 1; index < mainNodes.length; index += 1) spacings.push(distance(mainNodes[index - 1], mainNodes[index]));
        metrics.averageMainSpacing = average(spacings);
        const ys = mainNodes.map((node) => node.y);
        metrics.verticalSpan = Math.max(...ys) - Math.min(...ys);
    }
    const maximumRouteEdgeLength = graph?.generatorId === "macro-room-route-v2" || graph?.macro?.patternId
        ? theme.route.nodeSpacing * 5
        : theme.route.nodeSpacing * 2.25;
    if (metrics.maxEdgeLength > maximumRouteEdgeLength) errors.push("A route connection is too long for a useful chamber-to-chamber plan.");
    const maxBacktracks = graph?.generatorId === "macro-room-route-v2" || graph?.macro?.patternId
        ? Math.max(2, Math.ceil((mainNodes.length - 1) * 0.55))
        : Math.max(1, Math.ceil((mainNodes.length - 1) * (0.05 + settings.winding * 0.16)));
    if (metrics.backtrackEdges > maxBacktracks) errors.push("The route backtracks too often for the selected macro pattern.");

    const branches = groupBy(optionalNodes, (node) => node.branchId || "");
    for (const [branchId, branchNodes] of branches) {
        if (!branchId) continue;
        const sorted = [...branchNodes].sort((a, b) => Number(a.progress) - Number(b.progress));
        const first = sorted[0];
        const last = sorted.at(-1);
        const entryEdge = edges.find((edge) => edge.to === first.id && byId.get(edge.from)?.mandatory);
        const mergeEdge = edges.find((edge) => edge.from === last.id && byId.get(edge.to)?.mandatory);
        if (!entryEdge || !mergeEdge) errors.push(`Optional branch “${branchId}” does not cleanly leave and rejoin the mandatory route.`);
        if (entryEdge && mergeEdge && Number(byId.get(mergeEdge.to)?.progress) <= Number(byId.get(entryEdge.from)?.progress)) {
            errors.push(`Optional branch “${branchId}” merges before it begins.`);
        }
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
    const targetSpan = macroAnchorValues.length > 1
        ? (Math.max(...macroAnchorValues) - Math.min(...macroAnchorValues)) * finiteNumber(graph?.macro?.halfSpan, theme.route.macroVerticalSpan * 0.55)
        : theme.route.verticalStep * (0.55 + settings.verticality * 4.2);
    qualityScore -= Math.min(12, Math.abs(metrics.verticalSpan - targetSpan) / Math.max(100, targetSpan) * 18);
    const targetBranches = desiredBranchCount(mainNodes.length, settings.branching);
    qualityScore -= Math.abs(metrics.branchCount - targetBranches) * 6;
    const targetSpacing = theme.route.nodeSpacing * Math.sqrt(1 + settings.verticality * 0.22);
    qualityScore -= Math.min(12, Math.abs(metrics.averageMainSpacing - targetSpacing) / Math.max(1, theme.route.nodeSpacing) * 18);
    if (settings.winding > 0.7 && metrics.backtrackEdges === 0) qualityScore -= 4;
    if (graph?.generatorId === "macro-room-route-v2" || graph?.macro?.patternId) qualityScore += 15;
    if (settings.verticality > 0.55 && longestFlatRun(mainNodes, theme.route.verticalStep * 0.22) > 4 && !graph?.macro?.patternId?.startsWith("l-")) qualityScore -= 7;
    if (graph?.generatorId === "macro-room-route-v2" || graph?.macro?.patternId) {
        const expectedRooms = desiredMacroRoomCount(settings.length);
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

export function normalizeLevelGeneration(value) {
    if (!value || typeof value !== "object" || !value.route) return null;
    const route = value.route && typeof value.route === "object" ? value.route : {};
    const nodes = Array.isArray(route.nodes) ? route.nodes.map((node, index) => ({
        id: String(node?.id || `route_node_${index}`),
        kind: String(node?.kind || "chamber"),
        x: finiteNumber(node?.x, 0),
        y: finiteNumber(node?.y, 0),
        progress: finiteNumber(node?.progress, index),
        mandatory: Boolean(node?.mandatory),
        branchId: node?.branchId ? String(node.branchId) : undefined,
        label: node?.label ? String(node.label) : undefined,
        macroPatternId: node?.macroPatternId ? String(node.macroPatternId) : undefined,
        macroRoomId: node?.macroRoomId ? String(node.macroRoomId) : undefined,
        roomWidthScreens: Number.isFinite(Number(node?.roomWidthScreens)) ? Number(node.roomWidthScreens) : undefined,
        roomHeightScreens: Number.isFinite(Number(node?.roomHeightScreens)) ? Number(node.roomHeightScreens) : undefined,
        rareLargeRoom: node?.rareLargeRoom ? true : undefined
    })) : [];
    const ids = new Set(nodes.map((node) => node.id));
    const edges = Array.isArray(route.edges) ? route.edges
        .filter((edge) => edge && ids.has(String(edge.from)) && ids.has(String(edge.to)))
        .map((edge, index) => ({
            id: String(edge.id || `route_edge_${index}`),
            from: String(edge.from),
            to: String(edge.to),
            mandatory: Boolean(edge.mandatory),
            branchId: edge.branchId ? String(edge.branchId) : undefined
        })) : [];
    return {
        version: Math.max(1, Math.floor(Number(value.version) || AUTOMATIC_LEVEL_GENERATOR_VERSION)),
        generatorId: String(value.generatorId || AUTOMATIC_LEVEL_GENERATOR_ID),
        runId: String(value.runId || route.runId || ""),
        themeId: String(value.themeId || DEFAULT_THEME.themeId),
        seed: String(value.seed ?? "0"),
        attempt: Math.max(1, Math.floor(Number(value.attempt) || 1)),
        attemptsTried: Math.max(1, Math.floor(Number(value.attemptsTried) || 1)),
        stageRevisions: normalizeGeneratorStageRevisions(value.stageRevisions),
        implementations: normalizeGeneratorImplementations(value.implementations),
        settings: normalizeGeneratorSettings(value.settings),
        resolvedEnemyIds: normalizeStringArray(value.resolvedEnemyIds),
        route: {
            version: Math.max(1, Math.floor(Number(route.version) || 1)),
            runId: String(route.runId || value.runId || ""),
            generatorId: String(route.generatorId || "progression-route-v1"),
            startNodeId: String(route.startNodeId || nodes.find((node) => node.kind === "entrance")?.id || ""),
            exitNodeId: String(route.exitNodeId || nodes.find((node) => node.kind === "exit")?.id || ""),
            macro: route.macro && typeof route.macro === "object" ? JSON.parse(JSON.stringify(route.macro)) : undefined,
            nodes,
            edges,
            validation: normalizeGenerationValidation(route.validation || value.validation)
        },
        cavern: value.cavern && typeof value.cavern === "object" ? JSON.parse(JSON.stringify(value.cavern)) : undefined,
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

const MACRO_ROUTE_PATTERN_LABELS = Object.freeze({
    rolling: "Rolling chambers",
    "z-down": "Descending Z",
    "z-up": "Ascending Z",
    "l-down": "Descending L",
    "l-up": "Ascending L",
    valley: "Deep valley",
    terraces: "Stepped terraces"
});

function chooseMacroPattern(settings, rng) {
    const verticality = clamp01(settings.verticality);
    const values = [
        { value: "rolling", weight: Math.max(0.08, 0.48 - verticality * 0.35) },
        { value: "z-down", weight: 0.12 + verticality * 0.22 },
        { value: "z-up", weight: 0.12 + verticality * 0.22 },
        { value: "l-down", weight: 0.1 + verticality * 0.18 },
        { value: "l-up", weight: 0.1 + verticality * 0.18 },
        { value: "valley", weight: 0.16 + verticality * 0.14 },
        { value: "terraces", weight: 0.18 + verticality * 0.16 }
    ];
    return weightedRandomChoice(values, rng)?.value || "rolling";
}

function macroPatternAnchors(patternId, rng) {
    if (patternId === "z-down") return [[0, -0.7], [0.28, -0.7], [0.72, 0.7], [1, 0.7]];
    if (patternId === "z-up") return [[0, 0.7], [0.28, 0.7], [0.72, -0.7], [1, -0.7]];
    if (patternId === "l-down") return [[0, -0.62], [0.58, -0.62], [1, 0.72]];
    if (patternId === "l-up") return [[0, 0.62], [0.58, 0.62], [1, -0.72]];
    if (patternId === "valley") return [[0, -0.28], [0.22, -0.18], [0.52, 0.78], [0.8, -0.08], [1, -0.24]];
    if (patternId === "terraces") {
        const direction = rng.chance(0.5) ? 1 : -1;
        return [[0, -0.62 * direction], [0.27, -0.62 * direction], [0.4, 0], [0.68, 0], [0.81, 0.62 * direction], [1, 0.62 * direction]];
    }
    const direction = rng.chance(0.5) ? 1 : -1;
    return [[0, -0.2 * direction], [0.22, 0.52 * direction], [0.48, -0.58 * direction], [0.74, 0.42 * direction], [1, -0.12 * direction]];
}

function interpolateMacroAnchors(anchors, progress) {
    const p = clamp01(progress);
    for (let index = 1; index < anchors.length; index += 1) {
        const left = anchors[index - 1];
        const right = anchors[index];
        if (p > right[0]) continue;
        const span = Math.max(0.0001, right[0] - left[0]);
        const t = clamp01((p - left[0]) / span);
        const eased = t * t * (3 - 2 * t);
        return lerp(left[1], right[1], eased);
    }
    return anchors.at(-1)?.[1] || 0;
}

function desiredMacroRoomCount(length) {
    if (length === "compact") return 1;
    if (length === "standard") return 2;
    if (length === "extended") return 3;
    return 4;
}

function buildMacroRoutePlan({ theme, settings, rng }) {
    const mainCount = LEVEL_LENGTH_PRESETS[settings.length]?.mainNodes || LEVEL_LENGTH_PRESETS.standard.mainNodes;
    const patternId = chooseMacroPattern(settings, rng);
    const anchors = macroPatternAnchors(patternId, rng);
    const lengthScale = settings.length === "compact" ? 0.8 : settings.length === "extended" ? 1.13 : settings.length === "grand" ? 1.28 : 1;
    const halfSpan = theme.route.macroVerticalSpan * (0.35 + clamp01(settings.verticality) * 0.65) * lengthScale;
    const targetRoomCount = desiredMacroRoomCount(settings.length);
    const candidateIndices = Array.from({ length: Math.max(0, mainCount - 4) }, (_, index) => index + 2);
    const turnIndices = anchors.slice(1, -1).map(([progress]) => Math.round(progress * (mainCount - 1))).filter((index) => index >= 2 && index <= mainCount - 3);
    const preferred = [...new Set([
        ...turnIndices,
        Math.round((mainCount - 1) * 0.25),
        Math.round((mainCount - 1) * 0.52),
        Math.round((mainCount - 1) * 0.76),
        ...rng.shuffle(candidateIndices)
    ])].filter((index) => index >= 2 && index <= mainCount - 3);
    const roomIndices = [];
    for (const index of preferred) {
        if (roomIndices.length >= targetRoomCount) break;
        if (roomIndices.some((other) => Math.abs(other - index) < 2)) continue;
        roomIndices.push(index);
    }
    roomIndices.sort((a, b) => a - b);
    const rooms = roomIndices.map((nodeIndex, roomIndex) => {
        const rareLargeRoom = settings.length === "grand" && roomIndex === Math.floor(roomIndices.length / 2) && rng.chance(0.34);
        const widthScreens = rareLargeRoom
            ? rng.range(3.15, 4)
            : rng.range(1.25, settings.length === "compact" ? 1.85 : 2.45);
        const heightScreens = rareLargeRoom
            ? rng.range(2.25, 3)
            : rng.range(1.15, 2.05);
        return {
            id: `macro_room_${String(roomIndex + 1).padStart(2, "0")}`,
            nodeIndex,
            widthScreens: roundCoordinate(Math.min(4, widthScreens * theme.route.roomScale)),
            heightScreens: roundCoordinate(Math.min(3, heightScreens * theme.route.roomScale)),
            rareLargeRoom
        };
    });
    return {
        version: 1,
        patternId,
        patternLabel: MACRO_ROUTE_PATTERN_LABELS[patternId] || patternId,
        anchors: anchors.map(([progress, value]) => ({ progress, value })),
        halfSpan: roundCoordinate(halfSpan),
        rooms
    };
}

function macroRouteGridPosition(patternId, index, count) {
    const last = Math.max(1, count - 1);
    const progress = index / last;
    const local = (value, from, to) => clamp01((value - from) / Math.max(1, to - from));

    if (patternId === "z-down" || patternId === "z-up") {
        const down = patternId === "z-down";
        const gy = progress < 0.3
            ? (down ? -0.82 : 0.82)
            : progress < 0.68
                ? lerp(down ? -0.82 : 0.82, down ? 0.72 : -0.72, local(progress, 0.3, 0.68))
                : (down ? 0.72 : -0.72);
        return { gx: index, gy };
    }

    if (patternId === "l-down" || patternId === "l-up") {
        const down = patternId === "l-down";
        const turnStart = Math.max(3, Math.floor(last * 0.3));
        const turnEnd = Math.max(turnStart + 3, Math.floor(last * 0.56));
        if (index <= turnStart) return { gx: index, gy: down ? -0.78 : 0.78 };
        if (index <= turnEnd) {
            const t = local(index, turnStart, turnEnd);
            const turnAdvance = (turnEnd - turnStart) * 0.82;
            return { gx: turnStart + t * turnAdvance, gy: lerp(down ? -0.78 : 0.78, down ? 0.72 : -0.72, t) };
        }
        const turnAdvance = (turnEnd - turnStart) * 0.82;
        const t = local(index, turnEnd, last);
        return { gx: turnStart + turnAdvance + t * (last - turnEnd + 2), gy: down ? 0.72 : -0.72 };
    }

    if (patternId === "valley") {
        const gy = progress < 0.5
            ? lerp(-0.55, 0.88, progress * 2)
            : lerp(0.88, -0.48, (progress - 0.5) * 2);
        return { gx: index, gy };
    }

    if (patternId === "terraces") {
        const level = progress < 0.34 ? -0.65 : progress < 0.67 ? 0 : 0.65;
        return { gx: index, gy: level };
    }

    const wave = Math.sin(progress * Math.PI * 2.25) * 0.62;
    return { gx: index, gy: wave };
}

function buildMacroRoomRouteCandidate({ theme, settings, rng, attempt, macroPlan }) {
    const mainCount = LEVEL_LENGTH_PRESETS[settings.length]?.mainNodes || LEVEL_LENGTH_PRESETS.standard.mainNodes;
    const spacing = theme.route.nodeSpacing;
    const startX = theme.route.startX;
    const baselineY = theme.route.baselineY;
    const roomByNode = new Map((macroPlan?.rooms || []).map((room) => [room.nodeIndex, room]));
    const mainNodes = [];
    for (let index = 0; index < mainCount; index += 1) {
        const progress = index / Math.max(1, mainCount - 1);
        const grid = macroRouteGridPosition(macroPlan?.patternId || "rolling", index, mainCount);
        const jitterX = index === 0 || index === mainCount - 1 ? 0 : rng.range(-1, 1) * spacing * settings.winding * 0.035;
        const jitterY = index === 0 || index === mainCount - 1 ? 0 : rng.range(-0.06, 0.06) * theme.route.verticalStep * settings.winding;
        const x = startX + grid.gx * spacing + jitterX;
        const rawY = baselineY + grid.gy * (macroPlan?.halfSpan || theme.route.macroVerticalSpan * 0.55) + jitterY;
        const y = index === 0
            ? rawY
            : clamp(
                rawY,
                mainNodes.at(-1).y - theme.traversal.mandatoryRise * 0.9,
                mainNodes.at(-1).y + theme.traversal.mandatoryDrop * 0.68
            );
        const room = roomByNode.get(index);
        const kind = index === 0
            ? "entrance"
            : index === mainCount - 1
                ? "exit"
                : room
                    ? "chamber"
                    : (index % 4 === 0 && settings.safety > 0.58 ? "recovery" : "traversal");
        mainNodes.push({
            id: `route_main_${String(index).padStart(3, "0")}`,
            kind,
            x: roundCoordinate(x),
            y: roundCoordinate(y),
            progress: index,
            mandatory: true,
            label: index === 0 ? "Entrance" : index === mainCount - 1 ? "Exit" : room ? `Room ${room.id.split("_").at(-1)}` : `Main ${index}`,
            macroPatternId: macroPlan?.patternId || "rolling",
            macroRoomId: room?.id,
            roomWidthScreens: room?.widthScreens,
            roomHeightScreens: room?.heightScreens,
            rareLargeRoom: room?.rareLargeRoom || undefined
        });
    }

    const nodes = [...mainNodes];
    const edges = [];
    for (let index = 0; index < mainNodes.length - 1; index += 1) {
        edges.push({
            id: `route_main_edge_${String(index).padStart(3, "0")}`,
            from: mainNodes[index].id,
            to: mainNodes[index + 1].id,
            mandatory: true
        });
    }

    appendOptionalBranches({ nodes, edges, mainNodes, theme, settings, rng });
    return {
        version: 2,
        attempt,
        startNodeId: mainNodes[0].id,
        exitNodeId: mainNodes.at(-1).id,
        macro: JSON.parse(JSON.stringify(macroPlan || {})),
        nodes,
        edges
    };
}

function appendOptionalBranches({ nodes, edges, mainNodes, theme, settings, rng }) {
    const mainCount = mainNodes.length;
    const spacing = theme.route.nodeSpacing;
    const verticalStep = theme.route.verticalStep;
    const baselineY = theme.route.baselineY;
    const ys = mainNodes.map((node) => node.y);
    const minY = Math.min(...ys) - verticalStep * 2.8;
    const maxY = Math.max(...ys) + verticalStep * 3.6;
    const branchCount = desiredBranchCount(mainCount, settings.branching);
    const allStarts = Array.from({ length: Math.max(0, mainCount - 4) }, (_, index) => index + 1);
    const shaftFriendlyStarts = allStarts.filter((index) => {
        const node = mainNodes[index];
        const next = mainNodes[index + 1];
        return node?.kind === "traversal"
            && next?.kind === "traversal"
            && Math.abs(next.y - node.y) <= theme.traversal.mandatoryRise * 1.45;
    });
    const starts = [
        ...rng.shuffle(shaftFriendlyStarts),
        ...rng.shuffle(allStarts.filter((index) => !shaftFriendlyStarts.includes(index)))
    ];
    const occupiedIntervals = [];
    let builtBranches = 0;
    for (const startIndex of starts) {
        if (builtBranches >= branchCount) break;
        const maxSpan = Math.min(4, mainCount - 1 - startIndex);
        if (maxSpan < 2) continue;
        const span = rng.int(2, maxSpan);
        const mergeIndex = startIndex + span;
        if (mergeIndex >= mainCount) continue;
        if (occupiedIntervals.some(([a, b]) => startIndex <= b + 1 && mergeIndex >= a - 1)) continue;
        const startNode = mainNodes[startIndex];
        const mergeNode = mainNodes[mergeIndex];
        const branchId = `branch_${String(builtBranches + 1).padStart(2, "0")}`;
        const branchNodeCount = 5;
        const offset = verticalStep * (1.82 + settings.verticality * 0.52 + settings.branching * 0.18);
        const branchNodes = [];
        for (let branchIndex = 0; branchIndex < branchNodeCount; branchIndex += 1) {
            const t = (branchIndex + 1) / (branchNodeCount + 1);
            const arc = Math.sin(Math.PI * t);
            let x = lerp(startNode.x, mergeNode.x, t) + rng.range(-0.14, 0.14) * spacing * settings.winding;
            x = Math.min(mainNodes.at(-1).x - spacing * 0.18, x);
            const mandatoryRouteY = lerp(startNode.y, mergeNode.y, t);
            const y = clamp(mandatoryRouteY + offset * arc + rng.range(-0.12, 0.12) * verticalStep, minY, maxY);
            const node = {
                id: `route_${branchId}_${String(branchIndex + 1).padStart(2, "0")}`,
                kind: branchIndex === branchNodeCount - 1 ? "optionalReward" : "optionalTraversal",
                x: roundCoordinate(x),
                y: roundCoordinate(y),
                progress: startIndex + t * span,
                mandatory: false,
                branchId,
                label: `Optional ${builtBranches + 1}.${branchIndex + 1}`
            };
            nudgeNodeAway(node, nodes, verticalStep * 0.82, 1, baselineY, Math.max(Math.abs(minY - baselineY), Math.abs(maxY - baselineY)));
            nodes.push(node);
            branchNodes.push(node);
        }
        const branchChain = [startNode, ...branchNodes, mergeNode];
        for (let index = 0; index < branchChain.length - 1; index += 1) {
            edges.push({
                id: `route_${branchId}_edge_${String(index).padStart(2, "0")}`,
                from: branchChain[index].id,
                to: branchChain[index + 1].id,
                mandatory: false,
                branchId
            });
        }
        occupiedIntervals.push([startIndex, mergeIndex]);
        builtBranches += 1;
    }
}

function buildLegacyProgressionRouteCandidate({ theme, settings, rng, attempt }) {
    const mainCount = LEVEL_LENGTH_PRESETS[settings.length]?.mainNodes || LEVEL_LENGTH_PRESETS.standard.mainNodes;
    const spacing = theme.route.nodeSpacing;
    const verticalStep = theme.route.verticalStep;
    const startX = theme.route.startX;
    const baselineY = theme.route.baselineY;
    const maxLevel = Math.max(1, Math.round(1 + settings.verticality * 3));
    const maxVertical = verticalStep * maxLevel;
    const mainNodes = [];
    let level = 0;
    let flatRun = 0;
    let previousX = startX;
    for (let index = 0; index < mainCount; index += 1) {
        const progress = index / Math.max(1, mainCount - 1);
        let x;
        if (index === 0) x = startX;
        else if (index === mainCount - 1) x = startX + spacing * (mainCount - 1);
        else {
            const nominal = startX + spacing * index;
            const jitter = rng.range(-1, 1) * spacing * settings.winding * 0.06;
            x = Math.max(previousX + spacing * 0.84, nominal + jitter);
        }

        if (index > 0 && index < mainCount - 1) {
            const moveChance = 0.12 + settings.verticality * 0.67;
            let delta = 0;
            if (rng.chance(moveChance) || (flatRun >= 2 && settings.verticality > 0.35)) {
                const upwardBias = level >= maxLevel ? -1 : level <= -maxLevel ? 1 : 0;
                delta = upwardBias || (rng.chance(0.5) ? -1 : 1);
                if (Math.abs(level + delta) > maxLevel) delta = 0;
            }
            if (delta === 0) flatRun += 1;
            else flatRun = 0;
            level += delta;
        }
        const wobble = index === 0 || index === mainCount - 1 ? 0 : rng.range(-0.12, 0.12) * verticalStep * settings.winding;
        const y = baselineY + level * verticalStep + wobble;
        const kind = index === 0
            ? "entrance"
            : index === mainCount - 1
                ? "exit"
                : (index % 4 === 0 ? (settings.safety > 0.58 ? "recovery" : "chamber") : (index % 3 === 0 ? "chamber" : "traversal"));
        mainNodes.push({
            id: `route_main_${String(index).padStart(3, "0")}`,
            kind,
            x: roundCoordinate(x),
            y: roundCoordinate(clamp(y, baselineY - maxVertical, baselineY + maxVertical)),
            progress: index,
            mandatory: true,
            label: index === 0 ? "Entrance" : index === mainCount - 1 ? "Exit" : `Main ${index}`
        });
        previousX = x;
    }

    const nodes = [...mainNodes];
    const edges = [];
    for (let index = 0; index < mainNodes.length - 1; index += 1) {
        edges.push({
            id: `route_main_edge_${String(index).padStart(3, "0")}`,
            from: mainNodes[index].id,
            to: mainNodes[index + 1].id,
            mandatory: true
        });
    }

    const branchCount = desiredBranchCount(mainCount, settings.branching);
    const starts = rng.shuffle(Array.from({ length: Math.max(0, mainCount - 4) }, (_, index) => index + 1));
    const occupiedIntervals = [];
    let builtBranches = 0;
    for (const startIndex of starts) {
        if (builtBranches >= branchCount) break;
        const maxSpan = Math.min(4, mainCount - 1 - startIndex);
        if (maxSpan < 2) continue;
        const span = rng.int(2, maxSpan);
        const mergeIndex = startIndex + span;
        if (mergeIndex >= mainCount) continue;
        if (occupiedIntervals.some(([a, b]) => startIndex <= b + 1 && mergeIndex >= a - 1)) continue;
        const startNode = mainNodes[startIndex];
        const mergeNode = mainNodes[mergeIndex];
        const branchId = `branch_${String(builtBranches + 1).padStart(2, "0")}`;
        // Materialized treasure detours use three authored steps: one narrow shaft
        // landing in a reserved main-route gap, one clearance step, and one reward
        // destination. Unselected branches retain the same graph shape as preview data.
        const branchNodeCount = 5;
        const midpointY = (startNode.y + mergeNode.y) * 0.5;
        const upperRoom = midpointY - (baselineY - maxVertical);
        const lowerRoom = (baselineY + maxVertical) - midpointY;
        const interiorMainNodes = mainNodes.slice(startIndex + 1, mergeIndex);
        const averageInteriorDeviation = interiorMainNodes.length
            ? average(interiorMainNodes.map((node) => {
                const t = (Number(node.progress) - startIndex) / span;
                return node.y - lerp(startNode.y, mergeNode.y, t);
            }))
            : 0;
        // Solid atlas platforms make upper parallel routes behave like low ceilings.
        // Generator 3 therefore reserves optional reward detours below the mandatory
        // spine, where they remain readable and can double as forgiving recovery paths.
        // Preserve the intermediate calculations as diagnostics for future one-way assets.
        void averageInteriorDeviation;
        void upperRoom;
        void lowerRoom;
        const side = 1;
        // Optional routes should feel distinct without becoming decorative, unreachable
        // balconies. Keep the arc within the same conservative movement envelope that
        // the traversal builder will later enforce between authored collision shapes.
        const offset = verticalStep * (1.82 + settings.verticality * 0.52 + settings.branching * 0.18);
        const branchNodes = [];
        for (let branchIndex = 0; branchIndex < branchNodeCount; branchIndex += 1) {
            const t = (branchIndex + 1) / (branchNodeCount + 1);
            const arc = Math.sin(Math.PI * t);
            let x = lerp(startNode.x, mergeNode.x, t);
            x += rng.range(-0.14, 0.14) * spacing * settings.winding;
            x = Math.min(mainNodes.at(-1).x - spacing * 0.18, x);
            const branchProgress = startIndex + t * span;
            const lowerMainIndex = Math.max(0, Math.min(mainNodes.length - 1, Math.floor(branchProgress)));
            const upperMainIndex = Math.max(0, Math.min(mainNodes.length - 1, Math.ceil(branchProgress)));
            const localProgress = branchProgress - lowerMainIndex;
            const mandatoryRouteY = lerp(
                mainNodes[lowerMainIndex].y,
                mainNodes[upperMainIndex].y,
                localProgress
            );
            let y = mandatoryRouteY + side * offset * arc;
            y += rng.range(-0.12, 0.12) * verticalStep;
            y = clamp(y, baselineY - maxVertical - verticalStep * 0.9, baselineY + maxVertical + verticalStep * 3.2);
            const node = {
                id: `route_${branchId}_${String(branchIndex + 1).padStart(2, "0")}`,
                kind: branchIndex === branchNodeCount - 1 ? "optionalReward" : "optionalTraversal",
                x: roundCoordinate(x),
                y: roundCoordinate(y),
                progress: startIndex + t * span,
                mandatory: false,
                branchId,
                label: `Optional ${builtBranches + 1}.${branchIndex + 1}`
            };
            nudgeNodeAway(node, nodes, verticalStep * 0.82, side, baselineY, maxVertical + verticalStep * 3.4);
            nodes.push(node);
            branchNodes.push(node);
        }
        const branchChain = [startNode, ...branchNodes, mergeNode];
        for (let index = 0; index < branchChain.length - 1; index += 1) {
            edges.push({
                id: `route_${branchId}_edge_${String(index).padStart(2, "0")}`,
                from: branchChain[index].id,
                to: branchChain[index + 1].id,
                mandatory: false,
                branchId
            });
        }
        occupiedIntervals.push([startIndex, mergeIndex]);
        builtBranches += 1;
    }

    return {
        version: 1,
        attempt,
        startNodeId: mainNodes[0].id,
        exitNodeId: mainNodes.at(-1).id,
        nodes,
        edges
    };
}

function desiredBranchCount(mainNodeCount, branching) {
    const maximum = Math.max(0, Math.floor((mainNodeCount - 3) / 3));
    return Math.min(maximum, Math.max(0, Math.round(clamp01(branching) * (1 + mainNodeCount / 6))));
}

function nudgeNodeAway(node, otherNodes, minimumDistance, side, baselineY, maxVertical) {
    let tries = 0;
    while (tries < 8) {
        const closest = Math.min(...otherNodes.map((other) => distance(node, other)));
        if (closest >= minimumDistance) return;
        node.y = roundCoordinate(clamp(node.y + side * minimumDistance * 0.42, baselineY - maxVertical, baselineY + maxVertical));
        node.x = roundCoordinate(node.x + minimumDistance * 0.12);
        tries += 1;
    }
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

function rangeListIncludes(ranges, value) {
    return ranges.some(([start, end]) => value >= start && value <= end);
}

function enemyNumber(id) {
    const match = /(\d+)$/.exec(String(id));
    return match ? Number(match[1]) : NaN;
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
