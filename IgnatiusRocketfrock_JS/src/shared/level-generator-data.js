import {
    CAVE_PERIMETER_GENERATOR,
    generateCavePerimeterPlacements
} from "./cave-window-decoration.js";

export const AUTOMATIC_LEVEL_GENERATOR_VERSION = 18;
export const AUTOMATIC_LEVEL_GENERATOR_ID = "automatic-level-generator-9";

const GENERATED_PLAYER_BODY_WIDTH = 34;
const GENERATED_PLAYER_BODY_HEIGHT = 104;
const GENERATED_STATIC_HEADROOM = 112;
const BRANCH_SHAFT_SIDE_CLEARANCE = 8;
const BRANCH_SHAFT_WIDTH = 116;
const BRANCH_STAIR_LATERAL_OFFSET = 20;

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
        Object.freeze({ id: "the-path74-route-v4", label: "Standard" }),
        Object.freeze({ id: "mostly-horizontal-route-v1", label: "Mostly horizontal" })
    ]),
    cavern: Object.freeze([
        Object.freeze({ id: "the-path74-contour-cavern-v4", label: "Standard" }),
        Object.freeze({ id: "wide-upper-contour-cavern-v1", label: "Wide, upward-expanding" })
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

const LEGACY_GENERATOR_IMPLEMENTATION_ALIASES = Object.freeze({
    route: Object.freeze({
        "spatial-lane-route-v3": "the-path74-route-v4",
        "macro-room-route-v2": "the-path74-route-v4",
        "progression-route-v1": "mostly-horizontal-route-v1"
    }),
    cavern: Object.freeze({
        "contour-cavern-v3": "the-path74-contour-cavern-v4",
        "room-and-tunnel-cavern-v2": "the-path74-contour-cavern-v4",
        "ellipse-cavern-v1": "the-path74-contour-cavern-v4",
        "route-preview-only": "the-path74-contour-cavern-v4"
    }),
    traversal: Object.freeze({
        "longform-organic-traversal-v5": "layered-safety-network-traversal-v6",
        "organic-layered-traversal-v4": "layered-safety-network-traversal-v6",
        "layered-recovery-traversal-v3": "layered-safety-network-traversal-v6",
        "spaced-platform-traversal-v2": "layered-safety-network-traversal-v6",
        "forgiving-traversal-v1": "layered-safety-network-traversal-v6",
        "not-generated-yet": "layered-safety-network-traversal-v6"
    }),
    endpoints: Object.freeze({
        "safe-endpoints-v1": "grounded-chamber-endpoints-v2",
        "abstract-right-exit-v1": "grounded-chamber-endpoints-v2"
    }),
    validation: Object.freeze({
        "folded-cavern-validation-v3": "the-path74-cavern-validation-v4",
        "room-and-tunnel-validation-v2": "the-path74-cavern-validation-v4",
        "playable-reward-cavern-validation-v1": "the-path74-cavern-validation-v4",
        "playable-encounter-cavern-validation-v1": "the-path74-cavern-validation-v4",
        "playable-empty-cavern-validation-v1": "the-path74-cavern-validation-v4",
        "route-graph-validation-v1": "the-path74-cavern-validation-v4"
    })
});

const INTERNAL_GENERATOR_IMPLEMENTATIONS = Object.freeze({
    encounters: Object.freeze(new Set(["not-generated-yet"])),
    rewards: Object.freeze(new Set(["not-generated-yet"])),
    decoration: Object.freeze(new Set(["suppressed-by-theme", "not-generated-yet"]))
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
        route: "the-path74-route-v4",
        cavern: "the-path74-contour-cavern-v4",
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
        const migrated = LEGACY_GENERATOR_IMPLEMENTATION_ALIASES[stage]?.[requested] || requested;
        normalized[stage] = registry.some((entry) => entry.id === migrated)
            ? migrated
            : INTERNAL_GENERATOR_IMPLEMENTATIONS[stage]?.has(migrated)
                ? migrated
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
    if (!["the-path74-route-v4", "mostly-horizontal-route-v1"].includes(implementations.route)) {
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
        perchChestTarget: Math.max(0, Math.floor(Number(plan?.perchChestTarget) || 0)),
        selectedPerchSupportIds: normalizeStringArray(plan?.selectedPerchSupportIds),
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
    const selectedPerchSupportIds = [];
    const perchChestTarget = Math.max(0, Math.floor(Number(rewardPlan?.perchChestTarget) || 0));
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
        // Narrative thought triggers are invisible activation regions, not physical
        // pickups that must fit completely on top of a support. Their authored
        // minimum support width and edge clearance are sufficient; applying the
        // trigger rectangle half-width here would reject otherwise quiet route
        // supports produced by ThePath74.
        const halfWidth = type === "thoughtTrigger" ? 0 : definition.defaultSize.w * 0.5;
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

    if (perchChestTarget > 0) {
        const perchCandidates = rng.shuffle(supports.filter((support) =>
            support.secondaryPlatform
            && support.rewardPerch
            && !occupiedSupportIds.has(support.id)
        )).sort((left, right) => supportProgress(left, routeNodeById, routeEdgeById)
            - supportProgress(right, routeNodeById, routeEdgeById));
        for (const support of perchCandidates) {
            if (selectedPerchSupportIds.length >= perchChestTarget) break;
            const entity = addReward({
                type: "treasureChest",
                support,
                context: "secondaryPerch",
                routeNodeId: support.routeNodeId,
                overrides: { scoreValue: theme.rewards.branchChestScore }
            });
            if (entity) selectedPerchSupportIds.push(support.id);
        }
    }

    const mainSupportCandidates = supports.filter((support) =>
        ((support.mandatory && ["routeFloor", "landingPlatform"].includes(support.role) && support.routeNodeId)
            || (support.secondaryPlatform && support.rewardPerch))
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
        const thoughtMetadata = metadataByType.get("thoughtTrigger");
        const text = theme.rewards.thoughts.length ? rng.pick(theme.rewards.thoughts) : "";
        const candidates = rng.shuffle(supports
            .filter((support) => support.mandatory && ["routeFloor", "landingPlatform"].includes(support.role))
            .map((support) => ({ support, progress: supportProgress(support, routeNodeById, routeEdgeById) }))
            .filter((candidate) => {
                const normalizedProgress = candidate.progress / maximumRouteProgress;
                return !occupiedSupportIds.has(candidate.support.id)
                    && !encounterSupportIds.has(candidate.support.id)
                    && candidate.support.walkableWidth >= finiteNumber(thoughtMetadata?.minimumSupportWidth, 0)
                    && normalizedProgress >= finiteNumber(thoughtMetadata?.minimumProgress, 0)
                    && normalizedProgress <= finiteNumber(thoughtMetadata?.maximumProgress, 1);
            }));
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
        version: 1,
        generatorId: "basic-rewards-v1",
        runId,
        selectedBranchIds: [...rewardPlan.selectedBranchIds],
        availableBranchIds: [...rewardPlan.availableBranchIds],
        contextualRewardTarget: rewardPlan.contextualRewardTarget,
        perchChestTarget,
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

    const v2 = ["the-path74-contour-cavern-v4", "wide-upper-contour-cavern-v1"].includes(cavern.generatorId);
    const wideUpperCavern = cavern.generatorId === "wide-upper-contour-cavern-v1";
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
        const maximumRoomWidthScreens = wideUpperCavern ? 5.6 : 4.01;
        const maximumRoomHeightScreens = wideUpperCavern ? 2.4 : 3.01;
        if (room.widthScreens > maximumRoomWidthScreens || room.heightScreens > maximumRoomHeightScreens) {
            errors.push(`Macro room “${room.id}” exceeds the ${maximumRoomWidthScreens}×${maximumRoomHeightScreens}-screen design ceiling.`);
        }
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
            const usePerchTreasure = implementations.traversal === "layered-safety-network-traversal-v6";
            const traversal = buildForgivingTraversal({
                route: routeGeneration.route,
                theme,
                settings: routeGeneration.settings,
                implementations,
                assetCatalog,
                rng: traversalRng,
                runId: routeGeneration.runId,
                selectedBranchIds: usePerchTreasure
                    ? []
                    : rewardPlan.targetBranchCount > 0
                        ? (rewardPlan.rankedBranchIds || rewardPlan.selectedBranchIds)
                        : [],
                branchTargetCount: usePerchTreasure
                    ? 0
                    : rewardPlan.targetBranchCount ?? rewardPlan.selectedBranchIds.length
            });
            const effectiveRewardPlan = {
                ...rewardPlan,
                selectedBranchIds: [...traversal.materializedBranchIds],
                perchChestTarget: usePerchTreasure ? rewardPlan.targetBranchCount : 0
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
        requirePerimeter: Boolean(options.requirePopulatedPerimeter) && implementations.validation === "the-path74-cavern-validation-v4"
    });
    const presentationValidation = validateGeneratedCavernPresentation({
        cavern,
        traversal,
        endpoints,
        rewards,
        decoration,
        theme,
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
    const routeEdgesById = new Map((route?.edges || []).map((edge) => [edge.id, edge]));
    const maxProgress = Math.max(1, ...[...routeNodes.values()].map((node) => finiteNumber(node.progress, 0)));
    const endpointX = [
        finiteNumber(endpoints?.entrance?.x, traversal?.supports?.find((support) => support.id === traversal?.startSupportId)?.centerX || 0),
        finiteNumber(endpoints?.exit?.x, traversal?.supports?.find((support) => support.id === traversal?.exitSupportId)?.centerX || 0)
    ];
    const maximumAwareness = Math.max(0, ...allowed.map((enemyId) => finiteNumber(enemyCatalog.get(enemyId)?.defaults?.awarenessRange, 0)));
    const calmDistance = Math.max(theme.encounters.calmDistance, maximumAwareness + theme.encounters.spawnSafetyBuffer);
    const spacing = theme.encounters.minimumEncounterSpacing * (0.9 + settings.safety * 0.18);
    const encounterSupports = (traversal?.supports || []).filter((support) => (
        support?.mandatory
        && !support.moving
        && (support.routeNodeId || support.routeEdgeId)
        && ["routeFloor", "landingPlatform", "recoveryPlatform"].includes(support.role)
    ));
    const budget = settings.enemyDensity <= 0.001 ? 0 : Math.max(1, Math.round(
        encounterSupports.length
        * settings.enemyDensity
        * (2.15 + settings.difficulty * 1.55)
        * (0.88 + (1 - settings.safety) * 0.12)
    ));
    const maximumEncounters = settings.enemyDensity <= 0.001 ? 0 : Math.max(1, Math.round(
        encounterSupports.length
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

    const candidates = rng.shuffle(encounterSupports).map((support) => {
        const node = routeNodes.get(support.routeNodeId);
        const routeEdge = routeEdgesById.get(support.routeEdgeId);
        const fromNode = routeNodes.get(routeEdge?.from);
        const toNode = routeNodes.get(routeEdge?.to);
        const progressValue = node
            ? finiteNumber(node.progress, 0)
            : (finiteNumber(fromNode?.progress, 0) + finiteNumber(toNode?.progress, 0)) * 0.5;
        const progress = clamp01(progressValue / maxProgress);
        const vertical = cavernVerticalRangeAt(cavern, support.centerX, support.surfaceY);
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

function cavernVerticalRangeAt(cavernOrProfile, x, preferredY = NaN) {
    const cavern = cavernOrProfile && !Array.isArray(cavernOrProfile) ? cavernOrProfile : null;
    if (["the-path74-contour-cavern-v4", "wide-upper-contour-cavern-v1"].includes(cavern?.generatorId)) {
        const ranges = cavernPolygonVerticalRanges(cavern?.caveWindow?.points, x);
        if (!ranges.length) return null;
        if (Number.isFinite(preferredY)) {
            const containing = ranges.find((range) => preferredY >= range.top - 0.001 && preferredY <= range.bottom + 0.001);
            if (containing) return containing;
            return [...ranges].sort((a, b) => Math.min(Math.abs(preferredY - a.top), Math.abs(preferredY - a.bottom)) - Math.min(Math.abs(preferredY - b.top), Math.abs(preferredY - b.bottom)))[0];
        }
        return [...ranges].sort((a, b) => (b.bottom - b.top) - (a.bottom - a.top))[0];
    }
    const samples = Array.isArray(cavernOrProfile) ? cavernOrProfile : cavern?.profile;
    if (!Array.isArray(samples) || !samples.length) return null;
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
        const vertical = cavernVerticalRangeAt(cavern, entity.x, entity.y);
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
    const selectedPerches = new Set(normalizeStringArray(rewards.selectedPerchSupportIds));
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
            const perchTreasure = entity.generationContext === "secondaryPerch";
            if (perchTreasure) {
                if (!selectedPerches.has(support.id)) errors.push(`Treasure chest “${entity.id}” is not attached to a selected upper reward perch.`);
                if (!support.secondaryPlatform || !support.rewardPerch) errors.push(`Treasure chest “${entity.id}” is not seated on an authored secondary reward perch.`);
                if (entity.generationBranchId) errors.push(`Perch treasure “${entity.id}” should not claim optional-branch ownership.`);
                metrics.rewardedPerchCount += 1;
            } else {
                if (!entity.generationBranchId || !selectedBranches.has(entity.generationBranchId)) errors.push(`Treasure chest “${entity.id}” is not attached to a selected optional branch.`);
                if (!support.branchId || support.branchId !== entity.generationBranchId) errors.push(`Treasure chest “${entity.id}” is not seated on its branch support.`);
                const node = routeNodes.get(entity.routeNodeId);
                if (node?.kind !== "optionalReward") errors.push(`Treasure chest “${entity.id}” is not placed at an optional reward destination.`);
            }
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
    if (settings.rewardDensity <= 0.001 && (entities.length || selectedBranches.size || selectedPerches.size)) errors.push("Zero reward density must produce no rewards, optional branches, or reward perches.");
    if (metrics.thoughtCount > theme.rewards.maximumThoughts) errors.push("Generated narrative thoughts exceed the theme maximum.");
    if (endpointEntities.some((entity) => !hasGenerationStageProvenance(entity, "endpoints"))) errors.push("Beginning and end doors must remain owned by the Endpoint Placer or be explicit manual replacements for it.");
    if (endpointEntities.some((entity) => entity?.manualizedFromGeneration)) warnings.push("One or more generated endpoint doors were converted to manual ownership.");
    if (!Number.isFinite(metrics.minimumRewardSpacing)) metrics.minimumRewardSpacing = 0;
    if (!Number.isFinite(metrics.minimumRewardEndpointDistance)) metrics.minimumRewardEndpointDistance = 0;
    if (entities.length > 1 && metrics.minimumRewardSpacing > 0 && metrics.minimumRewardSpacing < theme.rewards.minimumRewardSpacing - 0.01) errors.push("Generated rewards are packed more tightly than the configured readable spacing.");
    if (selectedBranches.size && metrics.rewardedBranchCount !== selectedBranches.size) errors.push("Not every materialized optional branch has a meaningful treasure destination.");
    if (selectedPerches.size && metrics.rewardedPerchCount !== selectedPerches.size) errors.push("Not every selected upper reward perch has a meaningful treasure destination.");
    if (settings.rewardDensity > 0.22 && (rewards.availableBranchIds || []).length && !selectedBranches.size && !selectedPerches.size) warnings.push("Reward density requested treasure, but neither a branch nor an upper reward perch was selected.");
    if (settings.rewardDensity > 0.6 && entities.length < selectedBranches.size + selectedPerches.size + 1) warnings.push("High reward density produced few contextual rewards beyond treasure placements.");

    let qualityScore = 100 - errors.length * 45 - warnings.length * 2;
    qualityScore -= Math.max(0, selectedBranches.size - metrics.rewardedBranchCount) * 18;
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
        oneWayPlatformOverlapCount: 0,
        placementSupportMismatchCount: 0,
        manualizedPlacementMismatchCount: 0,
        recoveryPlatformCount: supports.filter((support) => support.role === "recoveryPlatform").length,
        recoveryLaneCount: 0,
        recoveryLaneGapCount: 0,
        recoveryGapOverlapViolationCount: 0,
        recoveryUpperGapCoverageCount: 0,
        movingThinAssetViolationCount: 0,
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
        longMainPlatformShare: 0,
        secondaryPlatformCount: supports.filter((support) => support.secondaryPlatform).length,
        secondaryRewardPerchCount: supports.filter((support) => support.rewardPerch).length,
        recoveryRequiredGapCount: 0,
        recoveryBacktrackReachableCount: 0,
        recoveryReturnLiftCount: supports.filter((support) => support.recoveryReturnLift).length,
        lowerRouteSupportCount: supports.filter((support) => support.lowerRoute).length,
        tertiaryRecoveryCount: supports.filter((support) => support.tertiaryRecovery).length,
        layeredNetworkLaneCount: 0,
        protectedLowerGapCount: 0,
        unprotectedLowerGapCount: 0,
        minimumStaticHeadroom: Infinity,
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
            else metrics.invalidOptionalTransitions += 1;
            errors.push(`${transition.mandatory ? "Mandatory" : "Optional"} transition “${transition.id}” exceeds the forgiving movement envelope (gap ${transition.gap}, rise ${transition.rise}, drop ${transition.drop}, exposed landing ${transition.exposedLandingWidth ?? 0}).`);
        }
    }

    if (!Number.isFinite(metrics.minimumTransitionGap)) metrics.minimumTransitionGap = 0;

    if (["layered-safety-network-traversal-v6", "longform-organic-traversal-v5", "organic-layered-traversal-v4", "layered-recovery-traversal-v3", "spaced-platform-traversal-v2"].includes(traversal.generatorId)) {
        const layeredSafetyNetwork = traversal.generatorId === "layered-safety-network-traversal-v6";
        const longformOrganic = layeredSafetyNetwork || traversal.generatorId === "longform-organic-traversal-v5";
        const organicLayered = longformOrganic || traversal.generatorId === "organic-layered-traversal-v4";
        const layeredRecovery = organicLayered || traversal.generatorId === "layered-recovery-traversal-v3";
        const routeNodeById = new Map((route?.nodes || []).map((node) => [node.id, node]));
        const routeEdges = (route?.edges || []).filter((edge) => edge.mandatory !== false);
        for (const edge of routeEdges) {
            const edgeSupports = supports.filter((support) => support.routeEdgeId === edge.id);
            const edgeTransitions = transitions.filter((transition) => transition.routeEdgeId === edge.id && transition.mandatory);
            const vertical = edge.intendedDirection === "climb" || edge.intendedDirection === "descend";
            if (vertical) {
                const movingSupports = edgeSupports.filter((support) => support.moving && support.movementAxis === "vertical");
                const staticSupports = edgeSupports.filter((support) => !support.moving);
                metrics.verticalMovingPlatformCount += movingSupports.length;
                metrics.staticVerticalIntermediateCount += staticSupports.length;
                if (movingSupports.length !== 1 || staticSupports.length) {
                    errors.push(`Vertical route edge “${edge.id}” must use exactly one moving platform and no static staircase supports.`);
                }
                const movingSupport = movingSupports[0];
                const placement = movingSupport ? placementById.get(movingSupport.placementId) : null;
                const fromNode = routeNodeById.get(edge.from);
                const toNode = routeNodeById.get(edge.to);
                const expectedOffsetY = organicLayered
                    ? finiteNumber(bySupportId.get(edge.to ? `support_${edge.to}` : "")?.surfaceY, finiteNumber(toNode?.y, 0))
                        - finiteNumber(bySupportId.get(edge.from ? `support_${edge.from}` : "")?.surfaceY, finiteNumber(fromNode?.y, 0))
                    : finiteNumber(toNode?.y, 0) - finiteNumber(fromNode?.y, 0);
                if (layeredRecovery) {
                    const movingAsset = movingSupport ? catalogByAsset.get(`${movingSupport.atlasId}:${movingSupport.assetId}`) : null;
                    if (!movingAsset?.roles.includes("movingPlatform")) {
                        metrics.movingThinAssetViolationCount += 1;
                        errors.push(`Vertical route edge “${edge.id}” does not use the reserved thin moving-platform style.`);
                    }
                }
                if (!placement?.movement || placement.movement.pattern !== "shuttle") {
                    errors.push(`Vertical route edge “${edge.id}” is missing its automatic shuttle movement.`);
                } else {
                    if (Math.abs(finiteNumber(placement.movement.endOffsetX, 0)) > 0.5) errors.push(`Vertical route edge “${edge.id}” moves sideways instead of remaining a vertical lift.`);
                    if (Math.abs(finiteNumber(placement.movement.endOffsetY, 0) - expectedOffsetY) > 1) errors.push(`Vertical route edge “${edge.id}” does not span the complete planned climb or drop.`);
                }
                if (edgeTransitions.length !== 2 || edgeTransitions.some((transition) => !transition.movingPlatformTransfer)) {
                    errors.push(`Vertical route edge “${edge.id}” must expose start and end moving-platform transfers.`);
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
                if (organicLayered && jumpTransitions.length) {
                    const orderedSupports = [bySupportId.get(jumpTransitions[0].fromSupportId), ...jumpTransitions.map((transition) => bySupportId.get(transition.toSupportId))].filter(Boolean);
                    for (const support of orderedSupports) {
                        metrics.maximumHorizontalRouteOffset = Math.max(metrics.maximumHorizontalRouteOffset, Math.abs(finiteNumber(support.routeOffsetY, 0)));
                    }
                    let previousVerticalSign = 0;
                    for (let index = 1; index < orderedSupports.length; index += 1) {
                        const delta = finiteNumber(orderedSupports[index].surfaceY, 0) - finiteNumber(orderedSupports[index - 1].surfaceY, 0);
                        const heightDelta = Math.abs(delta);
                        metrics.minimumOrganicHeightDelta = Math.min(metrics.minimumOrganicHeightDelta, heightDelta);
                        if ((longformOrganic || orderedSupports.length >= 3) && heightDelta < 32) {
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
        const mainStaticSupports = supports.filter((support) => support.mandatory && !support.moving && support.role !== "doorSupport");
        if (mainStaticSupports.length) {
            metrics.averageMainStaticPlatformWidth = roundCoordinate(mainStaticSupports.reduce((sum, support) => sum + finiteNumber(support.walkableWidth, support.width), 0) / mainStaticSupports.length);
            const longformSpanSupports = mainStaticSupports.filter((support) => support.routeEdgeId);
            const longformSharePopulation = longformSpanSupports.length ? longformSpanSupports : mainStaticSupports;
            metrics.longMainPlatformShare = Math.round(longformSharePopulation.filter((support) => support.atlasId === "at_atlas_004" || finiteNumber(support.walkableWidth, 0) >= 520).length / longformSharePopulation.length * 10000) / 10000;
        }
        if (layeredRecovery) {
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
                    if (longformOrganic && !layeredSafetyNetwork) {
                        const recoverySupportId = String(upperGap.recoverySupportId || "");
                        const returnTransition = transitions.find((transition) => transition.recoverySupportId === recoverySupportId && transition.spacingStyle === "recoveryBacktrack" && transition.valid);
                        if (returnTransition) metrics.recoveryBacktrackReachableCount += 1;
                        else errors.push(`Recovery support “${recoverySupportId || "unknown"}” does not provide a safe backtracking return to the main route.`);
                    }
                }
                if (layeredSafetyNetwork && lane.layeredNetwork) {
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
                    if (layeredSafetyNetwork) {
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
            }
            if (!recoveryLanes.length && settings.safety >= 0.5) warnings.push("The layered traversal produced no staggered recovery floor.");
            if (longformOrganic && metrics.recoveryRequiredGapCount !== metrics.horizontalJumpGapCount) errors.push("Not every upper-route jump gap has a dedicated recovery platform below it.");
            if (longformOrganic && !layeredSafetyNetwork && metrics.recoveryBacktrackReachableCount !== metrics.recoveryRequiredGapCount) errors.push("One or more recovery platforms cannot return the player to the main route.");
            if (layeredSafetyNetwork && metrics.layeredNetworkLaneCount !== recoveryLanes.length) errors.push("A recovery lane was not materialized as a complete upper/lower safety network.");
            if (layeredSafetyNetwork && metrics.recoveryBacktrackReachableCount !== metrics.layeredNetworkLaneCount) errors.push("One or more lower recovery routes cannot return the player to the upper route.");
            if (layeredSafetyNetwork && metrics.protectedLowerGapCount !== metrics.recoveryLaneGapCount) errors.push("One or more lower-route gaps lack tertiary recovery.");
            if (longformOrganic && metrics.secondaryPlatformCount !== metrics.secondaryRewardPerchCount) errors.push("A generated secondary platform is not marked as a reward perch.");
            if (metrics.movingThinAssetViolationCount > 0) errors.push("One or more vertical lifts use ordinary static-platform artwork.");
        }
        if (!Number.isFinite(metrics.minimumHorizontalJumpGap)) metrics.minimumHorizontalJumpGap = 0;
        if (!Number.isFinite(metrics.minimumOrganicHeightDelta)) metrics.minimumOrganicHeightDelta = 0;
        if (metrics.staticVerticalIntermediateCount > 0) errors.push("ThePath74 vertical traversal still contains static staircase supports.");
        if (metrics.horizontalJumpGapCount > 0 && metrics.maximumHorizontalRouteOffset < (organicLayered ? 72 : layeredRecovery ? 48 : 18)) warnings.push("Horizontal platform sequences remained unusually close to the abstract route height.");
        if (organicLayered && metrics.organicSameHeightAdjacentCount > 0) errors.push("The organic upper route still contains a same-height platform row.");
        if (longformOrganic && metrics.mainStaticPlatformCount >= 3 && metrics.longMainPlatformShare < 0.4) errors.push("The longform traversal did not use long platforms for enough of the main route.");
    } else if (!Number.isFinite(metrics.minimumHorizontalJumpGap)) {
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
            if (overlap <= 24) continue;
            const upper = first.surfaceY <= second.surfaceY ? first : second;
            const lower = upper === first ? second : first;
            const upperBottom = upper.surfaceY + upper.height * (1 - upper.surfaceYRatio);
            const bodyClearance = lower.surfaceY - upperBottom;
            const includesRecoveryPlatform = first.role === "recoveryPlatform" || second.role === "recoveryPlatform";
            const includesMovingPlatform = Boolean(first.moving || second.moving);
            const connectedContinuousGround = (
                (first.role === "runAndGunGround" && second.role === "runAndGunGround")
                || (connectedPair && first.runAndGunGround && second.runAndGunGround)
                || (first.continuousLowerGround && second.continuousLowerGround)
            );
            if (enforceLayeredStaticHeadroom && !includesMovingPlatform && !connectedContinuousGround) {
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
    if (!Number.isFinite(metrics.minimumStaticHeadroom)) metrics.minimumStaticHeadroom = 0;

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
    const recoveryLanes = [];
    const supports = [];
    const placements = [];
    let entranceDoorSupportSelection = null;
    const nodeSupport = new Map();
    const edgeSupportIds = new Map();
    const mandatoryEdgeChains = new Map();
    let order = 1000;
    const useLayeredSafetyNetworkTraversal = implementations.traversal === "layered-safety-network-traversal-v6";
    const useRunAndGunRoute = implementations.route === "mostly-horizontal-route-v1";
    const useLongformOrganicTraversal = useLayeredSafetyNetworkTraversal || implementations.traversal === "longform-organic-traversal-v5";
    const useOrganicLayeredTraversal = useLongformOrganicTraversal || implementations.traversal === "organic-layered-traversal-v4";
    const useLayeredRecoveryTraversal = useOrganicLayeredTraversal || implementations.traversal === "layered-recovery-traversal-v3";
    const useSpacedPlatformTraversal = useLayeredRecoveryTraversal || implementations.traversal === "spaced-platform-traversal-v2";
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

    const supportRoleForNode = (node) => node.kind === "entrance" || node.kind === "exit"
        ? "doorSupport"
        : node.mandatory
            ? (useRunAndGunRoute
                ? "runAndGunGround"
                : verticalLandingNodeIds.has(node.id)
                    ? "landingPlatform"
                    : node.kind === "chamber" || node.kind === "recovery"
                        ? "routeFloor"
                        : useSpacedPlatformTraversal
                            ? "landingPlatform"
                            : "routeFloor")
            : node.kind === "optionalReward"
                ? "landingPlatform"
                : "branchStep";

    const supportTargetWidthForNode = (node, role) => {
        if (role === "doorSupport") return theme.traversal.endpointWidth;
        if (node.kind === "optionalReward") return theme.traversal.intermediateWidth * 0.88;
        if (!node.mandatory) return 64;
        if (useRunAndGunRoute) {
            if (node.kind === "chamber" || node.kind === "recovery") return theme.traversal.chamberWidth * 1.45;
            if (verticalLandingNodeIds.has(node.id)) return theme.traversal.intermediateWidth * 1.45;
            return theme.traversal.traversalWidth * 1.65;
        }
        if (useLongformOrganicTraversal) {
            if (node.kind === "chamber" || node.kind === "recovery") return theme.traversal.chamberWidth * 0.8;
            if (verticalLandingNodeIds.has(node.id)) return theme.traversal.intermediateWidth * 1.12;
            return theme.traversal.intermediateWidth * 1.24;
        }
        if (useSpacedPlatformTraversal) {
            if (useOrganicLayeredTraversal) {
                if (node.kind === "chamber" || node.kind === "recovery") return theme.traversal.chamberWidth * 0.76;
                if (verticalLandingNodeIds.has(node.id)) return theme.traversal.intermediateWidth * 0.96;
                return theme.traversal.intermediateWidth * 0.92;
            }
            if (verticalLandingNodeIds.has(node.id)) {
                return node.kind === "chamber" || node.kind === "recovery"
                    ? theme.traversal.chamberWidth * 0.78
                    : theme.traversal.intermediateWidth * (useLayeredRecoveryTraversal ? 1.06 : 0.82);
            }
            return node.kind === "chamber" || node.kind === "recovery"
                ? theme.traversal.chamberWidth
                : theme.traversal.intermediateWidth * (useLayeredRecoveryTraversal ? 1.08 : 0.82);
        }
        if (role === "landingPlatform") return theme.traversal.intermediateWidth * 1.08;
        return node.kind === "chamber" || node.kind === "recovery"
            ? theme.traversal.chamberWidth
            : theme.traversal.traversalWidth;
    };

    for (const node of nodes.filter((candidate) => candidate.mandatory)) {
        const role = supportRoleForNode(node);
        const support = addSupport({
            id: `support_${node.id}`,
            role,
            targetWidth: supportTargetWidthForNode(node, role),
            maximumWidth: role === "doorSupport" || (useRunAndGunRoute && role === "runAndGunGround")
                ? Infinity
                : supportTargetWidthForNode(node, role) * (useRunAndGunRoute
                    ? (node.kind === "chamber" || node.kind === "recovery" ? 1.32 : 1.28)
                    : node.kind === "chamber" || node.kind === "recovery"
                        ? (useLongformOrganicTraversal ? 1.22 : 1.12)
                        : useLongformOrganicTraversal ? 1.24 : useSpacedPlatformTraversal ? 1.08 : 1.18),
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

    if (useOrganicLayeredTraversal) {
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
            const minimumMagnitude = useRunAndGunRoute ? 4 : node.kind === "chamber" || node.kind === "recovery" ? 18 : 28;
            const maximumMagnitude = useRunAndGunRoute ? 18 : node.kind === "chamber" || node.kind === "recovery" ? 44 : 56;
            let offset = rng.range(minimumMagnitude, maximumMagnitude) * (rng.chance(0.5) ? -1 : 1);
            if (incomingHorizontal && previousSupport) {
                const previousOffset = finiteNumber(previousSupport.routeOffsetY, previousSupport.surfaceY - finiteNumber(previousNode.y, previousSupport.surfaceY));
                const minimumDifference = useRunAndGunRoute ? 8 : useLongformOrganicTraversal ? 36 : 28;
                if (Math.abs(offset - previousOffset) < minimumDifference) {
                    const flipped = -Math.sign(offset || 1) * Math.max(minimumMagnitude, Math.abs(offset));
                    offset = Math.abs(flipped - previousOffset) >= minimumDifference
                        ? flipped
                        : previousOffset + (previousOffset >= 0 ? -minimumDifference : minimumDifference);
                }
            }
            offset = clamp(offset, useRunAndGunRoute ? -18 : -56, useRunAndGunRoute ? 18 : 56);
            moveSupportSurface(support, node.y + offset);
            support.routeOffsetY = roundCoordinate(support.surfaceY - node.y);
            support.platformHeightStyle = "organicAnchor";
        }
    }


    if (useLongformOrganicTraversal && !useRunAndGunRoute) {
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

    const requestedBranchEntryNodeIds = new Set(edges
        .filter((edge) => edge.mandatory === false && requestedBranchIds.includes(edge.branchId))
        .filter((edge) => nodeById.get(edge.from)?.mandatory !== false && nodeById.get(edge.to)?.mandatory === false)
        .map((edge) => edge.from));
    const shaftRequestedEdgeIds = new Set(edges
        .filter((edge) => edge.mandatory !== false && requestedBranchEntryNodeIds.has(edge.from))
        .map((edge) => edge.id));
    const transitions = [];

    const distributedHorizontalGaps = (totalFree, gapCount, minimumGap, maximumGap) => {
        if (gapCount <= 0 || totalFree < minimumGap * gapCount - 0.01 || totalFree > maximumGap * gapCount + 0.01) return null;
        const gaps = Array.from({ length: gapCount }, () => totalFree / gapCount);
        for (let index = 0; index < gapCount - 1; index += 1) {
            const roomBelow = gaps[index] - minimumGap;
            const roomAbove = maximumGap - gaps[index];
            const nextRoomBelow = gaps[index + 1] - minimumGap;
            const nextRoomAbove = maximumGap - gaps[index + 1];
            const shiftLimit = Math.min(22, roomBelow, roomAbove, nextRoomBelow, nextRoomAbove);
            if (shiftLimit <= 0.5) continue;
            const shift = rng.range(-shiftLimit, shiftLimit);
            gaps[index] += shift;
            gaps[index + 1] -= shift;
        }
        return gaps.map(roundCoordinate);
    };

    const buildSpacedHorizontalEdge = (edge) => {
        const startSupport = nodeSupport.get(edge.from);
        const endSupport = nodeSupport.get(edge.to);
        if (!startSupport || !endSupport) return null;
        let distanceX = Math.abs(endSupport.centerX - startSupport.centerX);
        const direction = Math.sign(endSupport.centerX - startSupport.centerX) || 1;
        const reserveBranchShaft = useLongformOrganicTraversal && shaftRequestedEdgeIds.has(edge.id);
        if (reserveBranchShaft) {
            const requiredDistance = startSupport.width * 0.5 + endSupport.width * 0.5 + BRANCH_SHAFT_WIDTH;
            if (distanceX < requiredDistance) {
                moveSupportCenter(endSupport, startSupport.centerX + direction * requiredDistance);
                endSupport.routeOffsetX = roundCoordinate(endSupport.centerX - finiteNumber(nodeById.get(edge.to)?.x, endSupport.centerX));
                distanceX = requiredDistance;
            }
        }
        const shortLongformEdge = useLongformOrganicTraversal && distanceX < 520;
        const minimumGap = roundCoordinate(shortLongformEdge
            ? 34 + settings.safety * 6
            : (useOrganicLayeredTraversal ? 70 : useLayeredRecoveryTraversal ? 64 : 44)
                + settings.safety * (useOrganicLayeredTraversal ? 12 : useLayeredRecoveryTraversal ? 14 : 12));
        const maximumGap = roundCoordinate(Math.min(
            theme.traversal.mandatoryGap * (useOrganicLayeredTraversal ? 0.84 : useLayeredRecoveryTraversal ? 0.84 : 0.58),
            useOrganicLayeredTraversal ? 126 : useLayeredRecoveryTraversal ? 126 : 88
        ));
        const standardTargetWidth = theme.traversal.intermediateWidth * rng.range(
            useOrganicLayeredTraversal ? 0.86 : useLayeredRecoveryTraversal ? 0.68 : 0.72,
            useOrganicLayeredTraversal ? 1.22 : useLayeredRecoveryTraversal ? 0.98 : 0.88
        );
        const useLongAuthoredPlatform = useLongformOrganicTraversal
            ? distanceX >= 520
            : useLayeredRecoveryTraversal
                && distanceX >= (useOrganicLayeredTraversal ? 960 : 1500)
                && rng.chance(clamp(
                    (useOrganicLayeredTraversal ? 0.48 : 0.24) + (distanceX - (useOrganicLayeredTraversal ? 960 : 1500)) / (useOrganicLayeredTraversal ? 5200 : 7000),
                    useOrganicLayeredTraversal ? 0.48 : 0.24,
                    useOrganicLayeredTraversal ? 0.74 : 0.48
                ));
        const targetWidth = useLongAuthoredPlatform
            ? Math.min(
                distanceX * rng.range(useLongformOrganicTraversal ? 0.38 : useOrganicLayeredTraversal ? 0.24 : 0.18, useLongformOrganicTraversal ? 0.62 : useOrganicLayeredTraversal ? 0.42 : 0.28),
                rng.range(useLongformOrganicTraversal ? 720 : useOrganicLayeredTraversal ? 560 : 420, useLongformOrganicTraversal ? 1480 : useOrganicLayeredTraversal ? 1040 : 720)
            )
            : standardTargetWidth;
        let selectedIntermediateAssets = null;
        let selectedGaps = null;
        let selectedSurfaces = null;

        const buildVariedSurfaces = (count) => {
            if (!useLayeredRecoveryTraversal || count <= 0) return [];
            const riseLimit = theme.traversal.mandatoryRise * (useOrganicLayeredTraversal ? 0.96 : 0.92);
            const dropLimit = Math.min(theme.traversal.mandatoryDrop * (useOrganicLayeredTraversal ? 0.78 : 0.72), useOrganicLayeredTraversal ? 208 : 194);
            const minimumHeightStep = useLongformOrganicTraversal ? 36 : useOrganicLayeredTraversal ? 36 : 0;
            let best = null;
            let bestScore = -Infinity;
            const attemptCount = useOrganicLayeredTraversal ? 240 : 56;
            for (let attempt = 0; attempt < attemptCount; attempt += 1) {
                const surfaces = [];
                let previous = startSupport.surfaceY;
                let sign = rng.chance(0.5) ? -1 : 1;
                let valid = true;
                for (let index = 1; index <= count; index += 1) {
                    const t = index / (count + 1);
                    const baseline = lerp(startSupport.surfaceY, endSupport.surfaceY, t);
                    const remaining = count + 1 - index;
                    if (rng.chance(useOrganicLayeredTraversal ? 0.46 : 0.72)) sign *= -1;
                    const desiredAmplitude = rng.range(
                        useOrganicLayeredTraversal ? 46 : 58,
                        Math.min(useOrganicLayeredTraversal ? 164 : 148, theme.traversal.mandatoryDrop * (useOrganicLayeredTraversal ? 0.68 : 0.62))
                    );
                    const desired = (useOrganicLayeredTraversal ? previous : baseline)
                        + sign * desiredAmplitude
                        + rng.range(useOrganicLayeredTraversal ? -18 : -24, useOrganicLayeredTraversal ? 18 : 24);
                    const routeEnvelope = useLongformOrganicTraversal ? 224 : useOrganicLayeredTraversal ? 188 : Infinity;
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
                    if (useOrganicLayeredTraversal && Math.abs(surface - previous) < minimumHeightStep) {
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
                    if (useOrganicLayeredTraversal && heightDelta < minimumHeightStep) valid = false;
                }
                if (!valid) continue;
                const offsets = surfaces.map((surface, index) => Math.abs(surface - lerp(
                    startSupport.surfaceY,
                    endSupport.surfaceY,
                    (index + 1) / (count + 1)
                )));
                const verticalRange = Math.max(...complete) - Math.min(...complete);
                if (useOrganicLayeredTraversal && verticalRange < (count >= 2 ? 76 : 42)) continue;
                let verticalDirectionChanges = 0;
                let previousSign = 0;
                for (let index = 1; index < complete.length; index += 1) {
                    const currentSign = Math.sign(complete[index] - complete[index - 1]);
                    if (currentSign && previousSign && currentSign !== previousSign) verticalDirectionChanges += 1;
                    if (currentSign) previousSign = currentSign;
                }
                const score = verticalRange * (useOrganicLayeredTraversal ? 2.1 : 1.5)
                    + offsets.reduce((sum, value) => sum + value, 0)
                    + verticalDirectionChanges * (useOrganicLayeredTraversal ? 48 : 34)
                    + (useOrganicLayeredTraversal ? rng.range(0, 18) : 0);
                if (score > bestScore) {
                    bestScore = score;
                    best = surfaces;
                }
            }
            return best;
        };

        const minimumIntermediateCount = useLongformOrganicTraversal
            ? 0
            : useOrganicLayeredTraversal && distanceX >= 650 ? 1 : 0;
        const preferredCount = clamp(
            Math.round((distanceX - startSupport.width * 0.5 - endSupport.width * 0.5) / Math.max(180, targetWidth + (minimumGap + maximumGap) * 0.5)) - 1,
            minimumIntermediateCount,
            14
        );
        const countCandidates = useLongformOrganicTraversal
            ? Array.from({ length: 11 }, (_entry, index) => index).filter((count) => count >= minimumIntermediateCount)
            : [];
        if (!useLongformOrganicTraversal) {
            for (let offset = 0; offset <= 14; offset += 1) {
                for (const count of [preferredCount - offset, preferredCount + offset]) {
                    if (count < minimumIntermediateCount || count > 14 || countCandidates.includes(count)) continue;
                    countCandidates.push(count);
                }
            }
        }

        for (const count of countCandidates) {
            const gapCount = count + 1;
            const endpointHalfWidth = startSupport.width * 0.5 + endSupport.width * 0.5;
            const maximumIntermediateWidth = count > 0
                ? (distanceX - endpointHalfWidth - minimumGap * gapCount) / count
                : Infinity;
            if (count > 0 && maximumIntermediateWidth < 92) continue;
            const desiredOrdinaryGap = clamp(72 + settings.safety * 8 + rng.range(-8, 12), minimumGap, maximumGap - 4);
            const desiredGapTotal = reserveBranchShaft
                ? BRANCH_SHAFT_WIDTH + desiredOrdinaryGap * Math.max(0, gapCount - 1)
                : desiredOrdinaryGap * gapCount;
            const desiredIntermediateWidth = count > 0
                ? (distanceX - endpointHalfWidth - desiredGapTotal) / count
                : 0;
            if (count > 0 && desiredIntermediateWidth < 92) continue;
            const selections = Array.from({ length: count }, (_entry, index) => {
                const widthVariation = useOrganicLayeredTraversal && !useLongformOrganicTraversal
                    ? rng.range(index % 2 ? 0.74 : 0.88, index % 2 ? 1.06 : 1.18)
                    : 1;
                const requestedWidth = useLongformOrganicTraversal
                    ? Math.min(maximumIntermediateWidth, desiredIntermediateWidth * rng.range(0.96, 1.04))
                    : Math.min(targetWidth * widthVariation, maximumIntermediateWidth);
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
            const shaftCandidates = reserveBranchShaft
                ? maximumPhysicalGaps
                    .map((maximum, index) => ({ maximum, index }))
                    .filter((entry) => entry.maximum >= BRANCH_SHAFT_WIDTH - 0.01)
                    .sort((left, right) => right.maximum - left.maximum || left.index - right.index)
                : [{ index: -1 }];
            for (const shaftCandidate of shaftCandidates) {
                const proposed = Array.from({ length: gapCount }, () => minimumGap);
                if (reserveBranchShaft) proposed[shaftCandidate.index] = BRANCH_SHAFT_WIDTH;
                let remaining = totalFree - proposed.reduce((sum, value) => sum + value, 0);
                const maximumTotal = maximumPhysicalGaps.reduce((sum, value) => sum + value, 0);
                if (remaining < -0.01 || totalFree > maximumTotal + 0.05) continue;
                const allocationOrder = rng.shuffle(proposed.map((_value, index) => index));
                if (reserveBranchShaft) {
                    allocationOrder.splice(allocationOrder.indexOf(shaftCandidate.index), 1);
                    allocationOrder.push(shaftCandidate.index);
                }
                while (remaining > 0.01) {
                    let allocated = false;
                    for (const index of allocationOrder) {
                        if (remaining <= 0.01) break;
                        const capacity = Math.max(0, maximumPhysicalGaps[index] - proposed[index]);
                        if (capacity <= 0.01) continue;
                        const fairShare = remaining / Math.max(1, allocationOrder.filter((candidateIndex) => maximumPhysicalGaps[candidateIndex] - proposed[candidateIndex] > 0.01).length);
                        const amount = Math.min(capacity, Math.max(0.01, fairShare), remaining);
                        proposed[index] += amount;
                        remaining -= amount;
                        allocated = true;
                    }
                    if (!allocated) break;
                }
                if (remaining <= 0.05) {
                    gaps = proposed.map(roundCoordinate);
                    break;
                }
            }
            if (!gaps) continue;
            const walkableGapsValid = gaps.every((gap, index) => (
                gap + widthEntries[index].right + widthEntries[index + 1].left
            ) <= theme.traversal.mandatoryGap - 0.5);
            if (!walkableGapsValid) continue;
            const surfaces = buildVariedSurfaces(count);
            if (useOrganicLayeredTraversal && count > 0 && !surfaces) continue;
            if (useLongformOrganicTraversal && count === 0 && Math.abs(endSupport.surfaceY - startSupport.surfaceY) < 32) continue;
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
            support.platformSpacingStyle = useOrganicLayeredTraversal ? "organicUpperRoute" : useLayeredRecoveryTraversal ? "staggeredUpperRoute" : "openJumpSequence";
            if (useOrganicLayeredTraversal) support.platformHeightStyle = "organicStep";
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
            transition.spacingStyle = useOrganicLayeredTraversal ? "organicUpperRoute" : useLayeredRecoveryTraversal ? "staggeredUpperRoute" : "openJumpSequence";
            if (useLongformOrganicTraversal && Math.abs(chain[index].surfaceY - chain[index - 1].surfaceY) < 32) {
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
        const overlap = roundCoordinate(rng.range(30, 46));
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
            const stepOffset = Math.sin(Math.PI * 2 * estimatedProgress) * rng.range(5, 16);
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
        if (finalOverlap < 18 || !intermediate.length) {
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

    const buildMovingVerticalEdge = (edge) => {
        const startSupport = nodeSupport.get(edge.from);
        const endSupport = nodeSupport.get(edge.to);
        if (!startSupport || !endSupport) throw new Error(`Vertical edge “${edge.id}” is missing a landing support.`);
        const selection = selectGenerationAsset(
            assetCatalog,
            useLayeredRecoveryTraversal ? "movingPlatform" : "landingPlatform",
            theme.traversal.intermediateWidth * (useLayeredRecoveryTraversal ? 0.86 : 0.78),
            rng,
            false,
            theme.traversal.intermediateWidth * (useLayeredRecoveryTraversal ? 1.02 : 0.98)
        );
        if (!selection) throw new Error(`Vertical edge “${edge.id}” cannot find a moving-platform asset.`);
        const side = movingVerticalEdgeCount % 2 === 0 ? 1 : -1;
        movingVerticalEdgeCount += 1;
        const support = addSupport({
            id: `support_${edge.id}_moving`,
            role: "landingPlatform",
            targetWidth: theme.traversal.intermediateWidth * (useLayeredRecoveryTraversal ? 0.86 : 0.78),
            selection,
            centerX: startSupport.centerX,
            surfaceY: startSupport.surfaceY,
            mandatory: true,
            routeEdgeId: edge.id
        });
        const boardingGap = roundCoordinate(rng.range(38, 62));
        const centerX = side > 0
            ? Math.min(startSupport.walkableRightX, endSupport.walkableRightX) + boardingGap + support.width * 0.5 - support.walkableLeftInset
            : Math.max(startSupport.walkableLeftX, endSupport.walkableLeftX) - boardingGap - (support.width * 0.5 - support.walkableRightInset);
        moveSupportCenter(support, centerX);
        support.moving = true;
        support.movementAxis = "vertical";
        support.movementStartSupportId = startSupport.id;
        support.movementEndSupportId = endSupport.id;
        support.movementDistance = roundCoordinate(endSupport.surfaceY - startSupport.surfaceY);
        support.platformSpacingStyle = "movingShaft";
        support.movingVisualStyle = useLayeredRecoveryTraversal ? "thinOnly" : "legacyLanding";

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

    const processEdge = (edge, disableShaftReservation = false) => {
        if (useSpacedPlatformTraversal && edge.mandatory !== false) {
            if (edge.intendedDirection === "climb" || edge.intendedDirection === "descend") {
                return buildMovingVerticalEdge(edge);
            }
            if ((edge.intendedDirection === "left" || edge.intendedDirection === "right") && !disableShaftReservation) {
                if (useRunAndGunRoute) {
                    const groundChain = buildRunAndGunHorizontalEdge(edge);
                    if (groundChain) return groundChain;
                    throw new Error(`Horizontal route edge “${edge.id}” could not realize a continuous overlapping run-and-gun ground path.`);
                }
                const spacedChain = buildSpacedHorizontalEdge(edge);
                if (spacedChain) return spacedChain;
                if (useLongformOrganicTraversal) throw new Error(`Horizontal route edge “${edge.id}” could not realize the required longform jump sequence (distance ${roundCoordinate(Math.abs((nodeSupport.get(edge.to)?.centerX || 0) - (nodeSupport.get(edge.from)?.centerX || 0)))}, widths ${roundCoordinate(nodeSupport.get(edge.from)?.width || 0)}/${roundCoordinate(nodeSupport.get(edge.to)?.width || 0)}, surfaces ${roundCoordinate(nodeSupport.get(edge.from)?.surfaceY || 0)}/${roundCoordinate(nodeSupport.get(edge.to)?.surfaceY || 0)}).`);
                const startSupport = nodeSupport.get(edge.from);
                const endSupport = nodeSupport.get(edge.to);
                const shortTransition = startSupport && endSupport
                    ? classifyTraversalTransition(startSupport, endSupport, edge, theme)
                    : null;
                if (shortTransition?.valid) {
                    shortTransition.routeEdgeDirection = edge.intendedDirection;
                    shortTransition.spacingStyle = "shortAnchorPair";
                    edgeSupportIds.set(edge.id, []);
                    transitions.push(shortTransition);
                    const shortChain = [startSupport, endSupport];
                    mandatoryEdgeChains.set(edge.id, shortChain);
                    return shortChain;
                }
            }
        }
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

        const directTransition = classifyTraversalTransition(startSupport, endSupport, edge, theme);
        if (directTransition.valid && !reserveBranchShaft) {
            edgeSupportIds.set(edge.id, []);
            transitions.push(directTransition);
            const directChain = [startSupport, endSupport];
            if (mandatory) mandatoryEdgeChains.set(edge.id, directChain);
            return directChain;
        }

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
            const climbing = endSupport.surfaceY < startSupport.surfaceY;
            const verticalLimit = climbing
                ? theme.traversal.mandatoryRise * 0.9
                : theme.traversal.mandatoryDrop * 0.72;
            const transitionCount = Math.max(
                2,
                Math.ceil(distanceY / Math.max(40, verticalLimit)),
                Math.ceil(distanceX / Math.max(180, theme.traversal.intermediateWidth * 0.72))
            );
            const stairCount = transitionCount - 1;
            if (distanceY < 42 || stairCount > 18) {
                throw new Error(`Route edge “${edge.id}” cannot fit collision-safe platforms across ${roundCoordinate(distanceX)} horizontal and ${roundCoordinate(distanceY)} vertical units.`);
            }
            const stairSelections = Array.from({ length: stairCount }, () =>
                selectGenerationAsset(assetCatalog, mandatory ? "landingPlatform" : "branchStep", theme.traversal.intermediateWidth * 0.82, rng, false, Infinity)
            );
            if (stairSelections.some((selection) => !selection)) {
                throw new Error(`Route edge “${edge.id}” cannot find staircase platform assets.`);
            }
            const stairSupports = [];
            const horizontalStep = (endSupport.centerX - startSupport.centerX) / transitionCount;
            const useShaftZigzag = Math.abs(horizontalStep) < 64;
            const shaftZigzagAmplitude = useShaftZigzag ? 118 : 0;
            for (let index = 1; index <= stairCount; index += 1) {
                const t = index / transitionCount;
                const shaftOffset = useShaftZigzag ? (index % 2 === 0 ? -shaftZigzagAmplitude : shaftZigzagAmplitude) : 0;
                const centerX = lerp(startSupport.centerX, endSupport.centerX, t) + shaftOffset;
                stairSupports.push(addSupport({
                    id: `support_${edge.id}_stair_${String(index).padStart(2, "0")}`,
                    role: mandatory ? "landingPlatform" : "branchStep",
                    targetWidth: theme.traversal.intermediateWidth * 0.82,
                    selection: stairSelections[index - 1],
                    centerX,
                    surfaceY: edgeSurfaceAt(t),
                    mandatory,
                    routeEdgeId: edge.id,
                    branchId: edge.branchId
                }));
            }
            const stairChain = [startSupport, ...stairSupports, endSupport];
            const stairTransitions = [];
            for (let index = 1; index < stairChain.length; index += 1) {
                const transition = classifyTraversalTransition(stairChain[index - 1], stairChain[index], edge, theme);
                if (!transition.valid) {
                    throw new Error(`Route edge “${edge.id}” staircase failed between ${stairChain[index - 1].id} and ${stairChain[index].id}: gap ${transition.gap}, rise ${transition.rise}, drop ${transition.drop}, exposed landing ${transition.exposedLandingWidth}.`);
                }
                stairTransitions.push(transition);
            }
            edgeSupportIds.set(edge.id, stairSupports.map((support) => support.id));
            transitions.push(...stairTransitions);
            if (mandatory) mandatoryEdgeChains.set(edge.id, stairChain);
            return stairChain;
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

    const secondaryPlatforms = [];
    if (useLongformOrganicTraversal) {
        const secondaryLimit = settings.length === "grand" ? 5 : settings.length === "extended" ? 4 : settings.length === "standard" ? 3 : 2;
        const candidates = rng.shuffle(supports.filter((support) => support.mandatory
            && !support.moving
            && support.role !== "doorSupport"
            && support.atlasId === "at_atlas_004"
            && support.walkableWidth >= 360));
        for (const parent of candidates) {
            if (secondaryPlatforms.length >= secondaryLimit) break;
            const targetWidth = clamp(parent.walkableWidth * rng.range(0.3, 0.48), 220, 460);
            const selection = selectGenerationAsset(assetCatalog, "landingPlatform", targetWidth, rng, false, Math.min(500, parent.walkableWidth * 0.58));
            if (!selection) continue;
            const surfaceY = roundCoordinate(parent.surfaceY - rng.range(
                useLayeredSafetyNetworkTraversal ? 82 : 76,
                useLayeredSafetyNetworkTraversal ? 108 : 104
            ));
            let centerX = null;
            for (const side of rng.shuffle([-1, 1])) {
                const overhang = rng.range(52, 76);
                const candidateCenterX = useLayeredSafetyNetworkTraversal
                    ? (side < 0
                        ? parent.walkableLeftX - overhang - selection.width * 0.5
                        : parent.walkableRightX + overhang + selection.width * 0.5)
                    : (side < 0
                        ? parent.walkableLeftX + selection.width * 0.5 - overhang
                        : parent.walkableRightX - selection.width * 0.5 + overhang);
                const conflicts = supports.some((support) => {
                    if (support.id === parent.id) return false;
                    const overlap = Math.min(candidateCenterX + selection.width * 0.5, support.centerX + support.width * 0.5)
                        - Math.max(candidateCenterX - selection.width * 0.5, support.centerX - support.width * 0.5);
                    if (useLayeredSafetyNetworkTraversal) {
                        if (overlap <= 24) return false;
                        const candidateBottom = surfaceY + selection.height * (1 - selection.asset.surfaceYRatio);
                        const supportBottom = support.surfaceY + support.height * (1 - support.surfaceYRatio);
                        const clearance = surfaceY <= support.surfaceY
                            ? support.surfaceY - candidateBottom
                            : surfaceY - supportBottom;
                        return clearance < GENERATED_STATIC_HEADROOM;
                    }
                    return overlap > 48 && Math.abs(surfaceY - support.surfaceY) < 92;
                });
                if (!conflicts) {
                    centerX = roundCoordinate(candidateCenterX);
                    break;
                }
            }
            if (!Number.isFinite(centerX)) continue;
            const support = addSupport({
                id: `support_secondary_${String(secondaryPlatforms.length + 1).padStart(2, "0")}_${parent.id}`,
                role: "landingPlatform",
                targetWidth,
                selection,
                centerX,
                surfaceY,
                mandatory: false,
                routeEdgeId: parent.routeEdgeId
            });
            support.role = "secondaryPlatform";
            support.secondaryPlatform = true;
            support.rewardPerch = true;
            support.parentSupportId = parent.id;
            support.platformSpacingStyle = useLayeredSafetyNetworkTraversal ? "detachedSecondaryRewardPerch" : "secondaryRewardPerch";
            const placement = placements.find((candidate) => candidate.id === support.placementId);
            if (placement) {
                placement.generationRole = "secondaryPlatform";
                placement.parentSupportId = parent.id;
                placement.rewardPerch = true;
            }
            const up = classifyTraversalTransition(parent, support, { id: `secondary_${parent.id}`, mandatory: false }, theme);
            const down = classifyTraversalTransition(support, parent, { id: `secondary_${parent.id}`, mandatory: false }, theme);
            if (!up.valid || !down.valid
                || up.gap > theme.traversal.mandatoryGap
                || down.gap > theme.traversal.mandatoryGap) {
                supports.splice(supports.indexOf(support), 1);
                if (placement) placements.splice(placements.indexOf(placement), 1);
                continue;
            }
            for (const transition of [up, down]) {
                transition.mandatory = false;
                transition.spacingStyle = useLayeredSafetyNetworkTraversal ? "detachedSecondaryRewardPerch" : "secondaryRewardPerch";
                transition.secondaryPlatformId = support.id;
                transition.parentSupportId = parent.id;
            }
            transitions.push(up, down);
            secondaryPlatforms.push(support);
        }
    }

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
        const existingShaftIndex = currentGaps.findIndex((gap) => gap >= shaftGap - 0.5);
        if (existingShaftIndex >= 0) {
            const previous = chain[existingShaftIndex];
            const current = chain[existingShaftIndex + 1];
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
                savedCenters: chain.slice(1, -1).map((support) => support.centerX),
                transitionSnapshot: transitions.filter((transition) => transition.routeEdgeId === edge.id).map((transition) => JSON.parse(JSON.stringify(transition)))
            };
        }
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
            const returnStep = theme.traversal.mandatoryRise * 0.92;
            const branchEntrySurfaceY = shaft.previousSupport.surfaceY + returnStep;
            const branchSupports = [];
            for (let index = 0; index < branchNodes.length; index += 1) {
                const node = branchNodes[index];
                const isRewardLanding = node.kind === "optionalReward";
                const isShaftStep = index < 2 && !isRewardLanding;
                const role = isShaftStep ? "branchStep" : "landingPlatform";
                const selection = isShaftStep ? firstSelection : null;
                const centerX = isShaftStep
                    ? shaft.x + (index === 0 ? BRANCH_STAIR_LATERAL_OFFSET : -(BRANCH_STAIR_LATERAL_OFFSET + 4)) * shaft.direction
                    : shaft.x + shaft.direction * (165 + (index - 2) * 190);
                const surfaceY = branchEntrySurfaceY + returnStep * index;
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

    const safeStaticSurfaceBelow = (centerX, width, preferredSurfaceY, ignoredIds = []) => {
        const ignored = new Set(ignoredIds);
        let surfaceY = preferredSurfaceY;
        for (const other of supports) {
            if (ignored.has(other.id) || other.moving) continue;
            const overlap = Math.min(centerX + width * 0.5, other.centerX + other.width * 0.5)
                - Math.max(centerX - width * 0.5, other.centerX - other.width * 0.5);
            if (overlap <= 24) continue;
            const otherBottom = other.surfaceY + other.height * (1 - other.surfaceYRatio);
            surfaceY = Math.max(surfaceY, otherBottom + GENERATED_STATIC_HEADROOM + 2);
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

    if (useLayeredSafetyNetworkTraversal) {
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
            const slopeStep = rng.range(30, 38);
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
                        otherBottom + GENERATED_STATIC_HEADROOM + 2 - spec.progressionIndex * slopeStep
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
    } else if (useLongformOrganicTraversal) {
        const horizontalEdgeCandidates = edges.filter((edge) => edge.mandatory !== false
            && (edge.intendedDirection === "left" || edge.intendedDirection === "right"))
            .map((edge) => ({ edge, chain: mandatoryEdgeChains.get(edge.id) || [] }))
            .filter((entry) => entry.chain.length >= 2);
        for (const { edge, chain } of horizontalEdgeCandidates) {
            const ordered = [...chain].sort((left, right) => left.centerX - right.centerX);
            const upperGaps = [];
            const laneSupports = [];
            for (let index = 1; index < ordered.length; index += 1) {
                const left = ordered[index - 1];
                const right = ordered[index];
                const gapLeft = finiteNumber(left.walkableRightX, left.centerX + left.width * 0.5);
                const gapRight = finiteNumber(right.walkableLeftX, right.centerX - right.width * 0.5);
                if (gapRight - gapLeft < 28) continue;
                const gap = {
                    leftX: roundCoordinate(gapLeft),
                    rightX: roundCoordinate(gapRight),
                    centerX: roundCoordinate((gapLeft + gapRight) * 0.5),
                    width: roundCoordinate(gapRight - gapLeft),
                    leftSupportId: left.id,
                    rightSupportId: right.id
                };
                const lowerMain = left.surfaceY >= right.surfaceY ? left : right;
                const branchShaft = branchShafts.find((shaft) => shaft.routeEdgeId === edge.id
                    && new Set([shaft.nearSupportId, shaft.farSupportId]).has(left.id)
                    && new Set([shaft.nearSupportId, shaft.farSupportId]).has(right.id));
                if (branchShaft) {
                    const support = supports.find((candidate) => candidate.id === branchShaft.firstBranchSupportId);
                    if (!support) throw new Error(`Branch shaft on “${edge.id}” is missing its recovery foothold.`);
                    support.gapRecovery = true;
                    support.platformSpacingStyle = "branchShaftGapRecovery";
                    support.recoveryLaneId = `recovery_lane_${edge.id}`;
                    support.protectsUpperGapIndex = upperGaps.length;
                    support.protectsUpperGapCenterX = gap.centerX;
                    support.recoveryReturnSupportId = branchShaft.nearSupportId;
                    gap.recoverySupportId = support.id;
                    upperGaps.push(gap);
                    laneSupports.push(support);
                    existing.push(support);
                    const returnSupport = supports.find((candidate) => candidate.id === branchShaft.nearSupportId);
                    if (!returnSupport) throw new Error(`Branch shaft on “${edge.id}” is missing its return landing.`);
                    const returnTransition = classifyTraversalTransition(support, returnSupport, edge, theme);
                    if (!returnTransition.valid) throw new Error(`Branch shaft recovery under “${edge.id}” cannot return the player to the main route.`);
                    returnTransition.mandatory = false;
                    returnTransition.spacingStyle = "recoveryBacktrack";
                    returnTransition.recoverySupportId = support.id;
                    returnTransition.recoveryReturnSupportId = returnSupport.id;
                    transitions.push(returnTransition);
                    continue;
                }
                const targetWidth = Math.max(gap.width + 250, theme.traversal.intermediateWidth * 1.45);
                const maximumWidth = Math.min(760, Math.max(targetWidth + 120, gap.width + 360));
                const selection = selectGenerationAsset(assetCatalog, "recoveryPlatform", targetWidth, rng, false, maximumWidth);
                if (!selection) throw new Error(`Horizontal gap on “${edge.id}” cannot find a recovery platform.`);
                let recoverySpec = null;
                const lowerIsLeft = lowerMain.centerX < gap.centerX;
                const desiredOverlap = 108;
                const anchoredCenterX = lowerIsLeft
                    ? lowerMain.walkableRightX - desiredOverlap + selection.width * 0.5
                    : lowerMain.walkableLeftX + desiredOverlap - selection.width * 0.5;
                for (const offset of [94, 102, 108, 112]) {
                    const surfaceY = roundCoordinate(lowerMain.surfaceY + offset);
                    for (const nudge of [0, lowerIsLeft ? 18 : -18, lowerIsLeft ? -18 : 18]) {
                        const centerX = roundCoordinate(anchoredCenterX + nudge);
                        const recoveryLeft = centerX - selection.width * 0.5;
                        const recoveryRight = centerX + selection.width * 0.5;
                        const overlapWithLower = Math.min(recoveryRight, lowerMain.walkableRightX)
                            - Math.max(recoveryLeft, lowerMain.walkableLeftX);
                        const exposedReturnWidth = lowerIsLeft
                            ? Math.max(0, recoveryLeft - lowerMain.walkableLeftX)
                            : Math.max(0, lowerMain.walkableRightX - recoveryRight);
                        const coversGap = recoveryLeft <= gap.centerX && recoveryRight >= gap.centerX;
                        const conflicts = supports.some((support) => {
                            if (support.id === left.id || support.id === right.id || support.role === "recoveryPlatform") return false;
                            const overlap = Math.min(recoveryRight, support.centerX + support.width * 0.5)
                                - Math.max(recoveryLeft, support.centerX - support.width * 0.5);
                            return overlap > 64 && Math.abs(surfaceY - support.surfaceY) < 82;
                        });
                        if (overlapWithLower >= 88 && exposedReturnWidth >= 48 && coversGap && !conflicts) {
                            recoverySpec = { centerX, surfaceY };
                            break;
                        }
                    }
                    if (recoverySpec) break;
                }
                if (!recoverySpec) throw new Error(`Horizontal gap on “${edge.id}” cannot place a safe backtracking recovery platform.`);
                const support = addSupport({
                    id: `support_${edge.id}_recovery_${String(index).padStart(2, "0")}`,
                    role: "recoveryPlatform",
                    targetWidth,
                    selection,
                    centerX: recoverySpec.centerX,
                    surfaceY: recoverySpec.surfaceY,
                    mandatory: false,
                    routeEdgeId: edge.id
                });
                support.platformSpacingStyle = "guaranteedGapRecovery";
                support.recoveryLaneId = `recovery_lane_${edge.id}`;
                support.protectsUpperGapIndex = upperGaps.length;
                support.protectsUpperGapCenterX = gap.centerX;
                support.recoveryReturnSupportId = lowerMain.id;
                gap.recoverySupportId = support.id;
                upperGaps.push(gap);
                laneSupports.push(support);
                existing.push(support);

                for (const source of [left, right]) {
                    const fall = classifyTraversalTransition(source, support, edge, theme);
                    if (!fall.valid) continue;
                    fall.mandatory = false;
                    fall.spacingStyle = "fallRecovery";
                    fall.recoverySupportId = support.id;
                    transitions.push(fall);
                }
                const returnTransition = classifyTraversalTransition(support, lowerMain, edge, theme);
                if (!returnTransition.valid) throw new Error(`Recovery platform under “${edge.id}” cannot return the player to the lower main landing.`);
                returnTransition.mandatory = false;
                returnTransition.spacingStyle = "recoveryBacktrack";
                returnTransition.recoverySupportId = support.id;
                returnTransition.recoveryReturnSupportId = lowerMain.id;
                transitions.push(returnTransition);
            }
            if (!upperGaps.length) continue;
            laneSupports.sort((left, right) => left.centerX - right.centerX);
            const lowerGaps = [];
            for (let index = 1; index < laneSupports.length; index += 1) {
                const left = laneSupports[index - 1];
                const right = laneSupports[index];
                const gapLeft = finiteNumber(left.walkableRightX, left.centerX + left.width * 0.5);
                const gapRight = finiteNumber(right.walkableLeftX, right.centerX - right.width * 0.5);
                const width = gapRight - gapLeft;
                if (width < 34 || width > theme.traversal.mandatoryGap + 8) continue;
                const overlapsUpperGap = upperGaps.some((upperGap) => Math.min(gapRight, upperGap.rightX) - Math.max(gapLeft, upperGap.leftX) > 1);
                if (overlapsUpperGap) continue;
                lowerGaps.push({
                    leftX: roundCoordinate(gapLeft),
                    rightX: roundCoordinate(gapRight),
                    centerX: roundCoordinate((gapLeft + gapRight) * 0.5),
                    width: roundCoordinate(width)
                });
            }
            recoveryLanes.push({
                id: `recovery_lane_${edge.id}`,
                routeEdgeId: edge.id,
                supportIds: laneSupports.map((support) => support.id),
                upperGaps,
                lowerGaps,
                staggered: true,
                guaranteedPerGap: true
            });
        }
    } else if (useLayeredRecoveryTraversal) {
        const recoveryLaneLimit = settings.length === "grand" ? 3 : settings.length === "extended" ? 2 : 1;
        const horizontalEdgeCandidates = edges.filter((edge) => edge.mandatory !== false
            && (edge.intendedDirection === "left" || edge.intendedDirection === "right"))
            .map((edge) => {
                const chain = mandatoryEdgeChains.get(edge.id) || [];
                const span = chain.length
                    ? Math.max(...chain.map((support) => support.centerX + support.width * 0.5))
                        - Math.min(...chain.map((support) => support.centerX - support.width * 0.5))
                    : 0;
                return { edge, span, chainLength: chain.length };
            })
            .filter((entry) => entry.span >= 560 && entry.chainLength >= 3)
            .sort((left, right) => right.span - left.span || String(left.edge.id).localeCompare(String(right.edge.id)));
        for (const candidate of horizontalEdgeCandidates) {
            if (recoveryLanes.length >= recoveryLaneLimit) break;
            const edge = candidate.edge;
            const chain = mandatoryEdgeChains.get(edge.id);
            if (!Array.isArray(chain) || chain.length < 3) continue;
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
                    width: roundCoordinate(gapRight - gapLeft)
                });
            }
            if (!upperGaps.length) continue;

            const edgeLeft = Math.min(...ordered.map((support) => finiteNumber(support.walkableLeftX, support.centerX - support.width * 0.5)));
            const edgeRight = Math.max(...ordered.map((support) => finiteNumber(support.walkableRightX, support.centerX + support.width * 0.5)));
            const chainIds = new Set(chain.map((support) => support.id));
            const baseSurfaceY = Math.max(...chain.map((support) => support.surfaceY));
            let recoverySurfaceY = null;
            for (const offset of [188, 220, 252, 286, 322]) {
                const candidateY = baseSurfaceY + offset;
                const conflicts = supports.some((support) => {
                    if (chainIds.has(support.id) || support.role === "recoveryPlatform") return false;
                    const overlap = Math.min(edgeRight, support.centerX + support.width * 0.5)
                        - Math.max(edgeLeft, support.centerX - support.width * 0.5);
                    return overlap > 72 && Math.abs(support.surfaceY - candidateY) < 145;
                });
                if (!conflicts) {
                    recoverySurfaceY = roundCoordinate(candidateY);
                    break;
                }
            }
            if (!Number.isFinite(recoverySurfaceY)) continue;

            const laneSupports = [];
            for (let index = 0; index < upperGaps.length; index += 1) {
                const gap = upperGaps[index];
                const leftBoundary = index === 0
                    ? edgeLeft
                    : (upperGaps[index - 1].centerX + gap.centerX) * 0.5;
                const rightBoundary = index === upperGaps.length - 1
                    ? edgeRight
                    : (gap.centerX + upperGaps[index + 1].centerX) * 0.5;
                const cellWidth = Math.max(0, rightBoundary - leftBoundary);
                const desiredLowerGap = roundCoordinate(rng.range(68, 102));
                const maximumWidth = Math.max(118, cellWidth - desiredLowerGap);
                const targetWidth = Math.min(
                    maximumWidth,
                    Math.max(
                        gap.width + 128,
                        cellWidth * rng.range(useOrganicLayeredTraversal ? 0.76 : 0.58, useOrganicLayeredTraversal ? 0.88 : 0.72),
                        theme.traversal.intermediateWidth * rng.range(1.0, useOrganicLayeredTraversal ? 2.8 : 1.5)
                    )
                );
                const selection = selectGenerationAsset(
                    assetCatalog,
                    "recoveryPlatform",
                    targetWidth,
                    rng,
                    false,
                    maximumWidth
                );
                if (!selection) continue;
                const support = addSupport({
                    id: `support_${edge.id}_recovery_${String(index + 1).padStart(2, "0")}`,
                    role: "recoveryPlatform",
                    targetWidth,
                    selection,
                    centerX: gap.centerX,
                    surfaceY: recoverySurfaceY,
                    mandatory: false,
                    routeEdgeId: edge.id
                });
                support.platformSpacingStyle = "staggeredRecoveryLane";
                support.recoveryLaneId = `recovery_lane_${edge.id}`;
                support.protectsUpperGapIndex = index;
                laneSupports.push(support);
                existing.push(support);
            }
            if (!laneSupports.length) continue;

            laneSupports.sort((left, right) => left.centerX - right.centerX);
            const lowerGaps = [];
            for (let index = 1; index < laneSupports.length; index += 1) {
                const left = laneSupports[index - 1];
                const right = laneSupports[index];
                const gapLeft = finiteNumber(left.walkableRightX, left.centerX + left.width * 0.5);
                const gapRight = finiteNumber(right.walkableLeftX, right.centerX - right.width * 0.5);
                if (gapRight - gapLeft < 34) continue;
                lowerGaps.push({
                    leftX: roundCoordinate(gapLeft),
                    rightX: roundCoordinate(gapRight),
                    centerX: roundCoordinate((gapLeft + gapRight) * 0.5),
                    width: roundCoordinate(gapRight - gapLeft)
                });
            }
            recoveryLanes.push({
                id: `recovery_lane_${edge.id}`,
                routeEdgeId: edge.id,
                surfaceY: recoverySurfaceY,
                supportIds: laneSupports.map((support) => support.id),
                upperGaps,
                lowerGaps,
                staggered: true
            });
        }
    } else {
        const recoveryLimit = useSpacedPlatformTraversal
            ? (settings.length === "grand" ? 4 : settings.length === "extended" ? 3 : settings.length === "standard" ? 2 : 1)
            : Infinity;
        let generatedRecoveryCount = 0;
        for (const transition of [...transitions]) {
            if (!transition.mandatory || settings.safety < 0.5 || transition.movingPlatformTransfer) continue;
            if (generatedRecoveryCount >= recoveryLimit) break;
            const from = supports.find((support) => support.id === transition.fromSupportId);
            const to = supports.find((support) => support.id === transition.toSupportId);
            if (!from || !to) continue;
            const deservesRecovery = useSpacedPlatformTraversal
                ? transition.gap > 122 || transition.drop > 180
                : transition.gap > 82 || transition.drop > 150;
            const recoveryChance = useSpacedPlatformTraversal
                ? 0.08 + settings.safety * 0.18
                : 0.35 + settings.safety * 0.45;
            if (!deservesRecovery || !rng.chance(recoveryChance)) continue;
            const centerX = (from.centerX + to.centerX) * 0.5;
            const surfaceY = Math.max(from.surfaceY, to.surfaceY) + (useSpacedPlatformTraversal ? 190 : 165);
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
            generatedRecoveryCount += 1;
        }
    }

    if (!useSpacedPlatformTraversal) {
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
        recoveryLanes,
        secondaryPlatformIds: secondaryPlatforms.map((support) => support.id),
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

function selectGenerationAsset(catalog, role, targetWidth, rng, doorSupport = false, maximumWidth = Infinity, constraints = null) {
    const requiredCollisionMode = constraints?.collisionMode === "oneWay" || constraints?.collisionMode === "blockable"
        ? constraints.collisionMode
        : null;
    const candidates = catalog.assets
        .filter((asset) => asset.roles.includes(role))
        .filter((asset) => !requiredCollisionMode || asset.collisionMode === requiredCollisionMode)
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
        const x = implementations.endpoints === "grounded-chamber-endpoints-v2"
            ? role === "entrance" ? minimumX : maximumX
            : clamp(support.centerX + side * requestedOffset, minimumX, maximumX);
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
    const wideUpperCavern = generatorId === "wide-upper-contour-cavern-v1";
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
    if (["the-path74", "mostly-horizontal"].includes(route?.macro?.patternId)) {
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
        const extraRoomTarget = Math.max(2, Math.min(4, Math.ceil(mainGroundSupports.length / 7)));
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
                    theme.cavern.roomRadiusXMin * 2.15
                ),
                theme.cavern.roomRadiusXMin * 1.9,
                theme.cavern.roomRadiusXMax * 1.4
            );
            const roomCenterX = support.centerX + (index % 2 === 0 ? -1 : 1) * Math.min(300, rx * 0.18);
            const ry = clamp(
                Math.max(540, theme.cavern.roomRadiusYMin * 1.02),
                theme.cavern.roomRadiusYMin,
                Math.min(620, theme.cavern.roomRadiusYMax * 0.62)
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

    if (!stamps.length) throw new Error("Room-and-tunnel cavern builder received no traversal supports.");

    const minX = Math.min(...stamps.map((stamp) => stamp.x - stamp.rx * 0.96));
    const maxX = Math.max(...stamps.map((stamp) => stamp.x + stamp.rx * 0.96));
    const span = maxX - minX;
    const step = Math.max(theme.cavern.sampleStep, span / 52);
    const samplePositions = [minX, maxX, ...stamps.map((stamp) => stamp.x)];
    for (const stamp of stamps) {
        if (["macroRoom", "thePathRoom", "endpointChamber"].includes(stamp.kind)) samplePositions.push(stamp.x - stamp.rx * 0.58, stamp.x + stamp.rx * 0.58);
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

    const contourResult = ["the-path74-contour-cavern-v4", "wide-upper-contour-cavern-v1"].includes(generatorId) ? traceCavernOccupancyContour(stamps, theme) : null;
    const rawPoints = contourResult?.points || [
        ...profile.map((sample) => ({ x: sample.x, y: roundCoordinate(sample.top) })),
        ...[...profile].reverse().map((sample) => ({ x: sample.x, y: roundCoordinate(sample.bottom) }))
    ];
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
        version: generatorId === "wide-upper-contour-cavern-v1" ? 5 : 4,
        generatorId,
        runId,
        macroPatternId: route?.macro?.patternId || "",
        macroPatternLabel: route?.macro?.patternLabel || "",
        rooms: rooms.map((room) => Object.fromEntries(Object.entries(room).map(([key, value]) => [key, typeof value === "number" ? roundCoordinate(value) : value]))),
        stamps: stamps.map((stamp) => Object.fromEntries(Object.entries(stamp).map(([key, value]) => [key, typeof value === "number" ? roundCoordinate(value) : value]))),
        profile: profile.map((sample) => ({ x: roundCoordinate(sample.x), top: roundCoordinate(sample.top), bottom: roundCoordinate(sample.bottom) })),
        contour: contourResult?.metadata,
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
        optionalNodeCount: 0,
        branchCount: 0,
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
    const mostlyHorizontalCandidate = graph?.macro?.patternId === "mostly-horizontal";
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
    const thePath74Route = graph?.generatorId === "the-path74-route-v4" || graph?.macro?.patternId === "the-path74" || mostlyHorizontalRoute;
    const maximumRouteEdgeLength = thePath74Route
        ? finiteNumber(graph?.macro?.maximumEdgeLength, theme.route.nodeSpacing * 3.2)
        : theme.route.nodeSpacing * 2.25;
    if (metrics.maxEdgeLength > maximumRouteEdgeLength) errors.push("A route connection is too long for a useful chamber-to-chamber plan.");
    const maxBacktracks = mostlyHorizontalRoute
        ? 0
        : thePath74Route
            ? Math.max(2, Math.ceil((mainNodes.length - 1) * 0.62))
            : Math.max(1, Math.ceil((mainNodes.length - 1) * (0.05 + settings.winding * 0.16)));
    if (metrics.backtrackEdges > maxBacktracks) errors.push("The route backtracks too often for the selected macro pattern.");
    const foldedRoute = !mostlyHorizontalRoute && (graph?.version >= 3 || Array.isArray(graph?.macro?.spatialAnchors));
    if (foldedRoute && settings.length !== "compact" && settings.winding >= 0.2 && metrics.backtrackEdges === 0) {
        errors.push("The folded route contains no mandatory leftward phase.");
    }
    const maximumAspectRatio = mostlyHorizontalRoute
        ? (settings.length === "compact" ? 40 : 100)
        : thePath74Route
            ? (settings.length === "compact" ? 12 : 10)
            : settings.length === "compact" ? 8.5 : settings.length === "grand" ? 4.8 : 5.2;
    if ((foldedRoute || mostlyHorizontalRoute) && metrics.aspectRatio > maximumAspectRatio) errors.push(`The route is still too wide and shallow (${roundCoordinate(metrics.aspectRatio)}:1).`);
    else if (foldedRoute && settings.length !== "compact" && metrics.aspectRatio > maximumAspectRatio * 0.86) warnings.push("The route remains close to the maximum wide-corridor aspect ratio.");
    if (foldedRoute && settings.length !== "compact" && metrics.horizontalDirectionChanges < 2) warnings.push("The route has too little horizontal rhythm for a folded cavern.");
    if (foldedRoute && settings.verticality >= 0.45 && metrics.occupiedLaneCount < 2) errors.push("The route does not occupy multiple vertically separated lanes.");
    if (mostlyHorizontalRoute) {
        const verticalSegments = Array.isArray(graph?.macro?.segments)
            ? graph.macro.segments.filter((segment) => segment.direction === "up" || segment.direction === "down")
            : [];
        if (verticalSegments.some((segment) => finiteNumber(segment.length, 0) < 1 || finiteNumber(segment.length, 0) > 2)) {
            errors.push("Mostly horizontal routes may use only one- or two-cell vertical steps.");
        }
        if (metrics.backtrackEdges !== 0) errors.push("Mostly horizontal routes must advance steadily toward the exit.");
        if (metrics.horizontalTravel < metrics.verticalTravel * 5) errors.push("The mostly horizontal route contains too much vertical travel.");
    }

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
    const targetSpan = thePath74Route
        ? finiteNumber(graph?.macro?.targetVerticalSpan, metrics.verticalSpan)
        : macroAnchorValues.length > 1
            ? (Math.max(...macroAnchorValues) - Math.min(...macroAnchorValues)) * finiteNumber(graph?.macro?.halfSpan, theme.route.macroVerticalSpan * 0.55)
            : theme.route.verticalStep * (0.55 + settings.verticality * 4.2);
    qualityScore -= Math.min(18, Math.abs(metrics.verticalSpan - targetSpan) / Math.max(100, targetSpan) * 22);
    const targetBranches = desiredBranchCount(mainNodes.length, settings.branching);
    qualityScore -= Math.abs(metrics.branchCount - targetBranches) * 6;
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
    } else if (settings.winding > 0.7 && metrics.backtrackEdges === 0) {
        qualityScore -= 4;
    }
    if (settings.verticality > 0.55 && longestFlatRun(mainNodes, theme.route.verticalStep * 0.22) > 4 && !graph?.macro?.patternId?.startsWith("l-")) qualityScore -= 7;
    if (graph?.macro?.patternId) {
        const expectedRooms = thePath74Route ? 3 : desiredMacroRoomCount(settings.length);
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
            branchId: edge.branchId ? String(edge.branchId) : undefined,
            intendedDirection: edge.intendedDirection ? String(edge.intendedDirection) : undefined
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
    "compact-arc": "Compact vertical arc",
    rolling: "Folded rolling route",
    "z-down": "Descending switchback",
    "z-up": "Ascending switchback",
    "l-down": "Descending hook",
    "l-up": "Ascending hook",
    valley: "Folded valley",
    terraces: "Stacked terraces"
});

function chooseMacroPattern(settings, rng) {
    if (settings.length === "compact" && clamp01(settings.verticality) < 0.2 && clamp01(settings.winding) < 0.2) return "compact-arc";
    const verticality = clamp01(settings.verticality);
    const winding = clamp01(settings.winding);
    const values = [
        { value: "rolling", weight: Math.max(0.06, 0.32 - verticality * 0.12) },
        { value: "z-down", weight: 0.16 + verticality * 0.2 + winding * 0.12 },
        { value: "z-up", weight: 0.16 + verticality * 0.2 + winding * 0.12 },
        { value: "l-down", weight: 0.1 + verticality * 0.12 },
        { value: "l-up", weight: 0.1 + verticality * 0.12 },
        { value: "valley", weight: 0.14 + verticality * 0.12 + winding * 0.08 },
        { value: "terraces", weight: 0.18 + verticality * 0.18 + winding * 0.1 }
    ];
    return weightedRandomChoice(values, rng)?.value || "terraces";
}

function spatialPatternControlPoints(patternId) {
    if (patternId === "compact-arc") return [[0, -0.92], [1.05, -0.92], [2.2, 0.92], [3.2, 0.92], [4.35, -0.88], [5.45, -0.88], [6.35, 0.08], [7.2, 0.08]];
    if (patternId === "z-down") return [[0, -0.92], [3.7, -0.92], [2.2, -0.05], [0.85, -0.05], [2.45, 0.92], [5.3, 0.92], [6.05, 0.34], [7.2, 0.34]];
    if (patternId === "z-up") return [[0, 0.92], [3.7, 0.92], [2.2, 0.05], [0.85, 0.05], [2.45, -0.92], [5.3, -0.92], [6.05, -0.34], [7.2, -0.34]];
    if (patternId === "l-down") return [[0, -0.82], [3.9, -0.82], [2.15, 0.72], [5.45, 0.72], [6.05, 0.14], [7.2, 0.14]];
    if (patternId === "l-up") return [[0, 0.82], [3.9, 0.82], [2.15, -0.72], [5.45, -0.72], [6.05, -0.14], [7.2, -0.14]];
    if (patternId === "valley") return [[0, -0.68], [3.05, 0.86], [1.25, 0.86], [4.25, -0.58], [7.2, -0.58]];
    if (patternId === "terraces") return [[0, -0.92], [3.05, -0.92], [1.45, 0], [4.35, 0], [2.65, 0.92], [5.35, 0.92], [6.0, 0.34], [7.2, 0.34]];
    return [[0, -0.12], [2.7, -0.72], [1.25, 0.18], [4.55, 0.68], [3.25, 0.08], [7.2, 0.08]];
}

function spatialAnchorsForPattern(patternId, spacing, halfSpan) {
    const controls = spatialPatternControlPoints(patternId);
    const lengths = [];
    let total = 0;
    for (let index = 1; index < controls.length; index += 1) {
        const [ax, ay] = controls[index - 1];
        const [bx, by] = controls[index];
        total += Math.hypot((bx - ax) * spacing, (by - ay) * halfSpan);
        lengths.push(total);
    }
    return controls.map(([gx, gy], index) => ({
        progress: index === 0 ? 0 : lengths[index - 1] / Math.max(1, total),
        gx,
        gy
    }));
}

function sampleSpatialAnchors(anchors, progress) {
    const p = clamp01(progress);
    for (let index = 1; index < anchors.length; index += 1) {
        const left = anchors[index - 1];
        const right = anchors[index];
        if (p > right.progress) continue;
        const t = clamp01((p - left.progress) / Math.max(0.0001, right.progress - left.progress));
        return { gx: lerp(left.gx, right.gx, t), gy: lerp(left.gy, right.gy, t) };
    }
    const last = anchors.at(-1) || { gx: 0, gy: 0 };
    return { gx: last.gx, gy: last.gy };
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
    appendOptionalBranches({ nodes, edges, mainNodes, theme, settings, rng });
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
    const cellSizeY = clamp(theme.route.verticalStep * 0.68, 96, 136);
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
    appendOptionalBranches({ nodes, edges, mainNodes, theme, settings, rng });
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
            patternLabel: "Mostly horizontal run-and-gun route",
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

function buildMacroRoutePlan({ theme, settings, rng }) {
    const mainCount = LEVEL_LENGTH_PRESETS[settings.length]?.mainNodes || LEVEL_LENGTH_PRESETS.standard.mainNodes;
    const patternId = chooseMacroPattern(settings, rng);
    const lengthScale = settings.length === "compact" ? 0.78 : settings.length === "extended" ? 1.36 : settings.length === "grand" ? 1.72 : 1;
    const horizontalScale = settings.length === "compact" ? 1 : settings.length === "standard" ? 1.16 : settings.length === "extended" ? 1.55 : 2;
    const halfSpan = theme.route.macroVerticalSpan * (0.48 + clamp01(settings.verticality) * 0.52) * lengthScale;
    const spatialAnchors = spatialAnchorsForPattern(patternId, theme.route.nodeSpacing, halfSpan).map((anchor) => ({ ...anchor, gx: anchor.gx * horizontalScale }));
    const targetRoomCount = desiredMacroRoomCount(settings.length);
    const candidateIndices = Array.from({ length: Math.max(0, mainCount - 4) }, (_, index) => index + 2);
    const turnIndices = spatialAnchors.slice(1, -1)
        .map((anchor) => Math.round(anchor.progress * (mainCount - 1)))
        .filter((index) => index >= 2 && index <= mainCount - 3);
    const preferred = [...new Set([
        ...turnIndices,
        Math.round((mainCount - 1) * 0.26),
        Math.round((mainCount - 1) * 0.53),
        Math.round((mainCount - 1) * 0.78),
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
        version: 2,
        patternId,
        patternLabel: MACRO_ROUTE_PATTERN_LABELS[patternId] || patternId,
        anchors: spatialAnchors.map(({ progress, gy }) => ({ progress, value: gy })),
        spatialAnchors: spatialAnchors.map((anchor) => ({
            progress: roundCoordinate(anchor.progress),
            gx: roundCoordinate(anchor.gx),
            gy: roundCoordinate(anchor.gy)
        })),
        halfSpan: roundCoordinate(halfSpan),
        targetAspectRatio: settings.length === "compact" ? 6.8 : settings.length === "grand" ? 3.6 : settings.length === "extended" ? 3.5 : 3.35,
        horizontalScale: roundCoordinate(horizontalScale),
        rooms
    };
}

function spatialNodeProgresses(anchors, count) {
    const progressValues = [...new Set((anchors || []).map((anchor) => clamp01(anchor.progress)))].sort((a, b) => a - b);
    if (!progressValues.length || progressValues[0] > 0) progressValues.unshift(0);
    if (progressValues.at(-1) < 1) progressValues.push(1);
    while (progressValues.length < count) {
        let largestIndex = 0;
        let largestSpan = -1;
        for (let index = 1; index < progressValues.length; index += 1) {
            const span = progressValues[index] - progressValues[index - 1];
            if (span > largestSpan) {
                largestSpan = span;
                largestIndex = index;
            }
        }
        progressValues.splice(largestIndex, 0, (progressValues[largestIndex - 1] + progressValues[largestIndex]) * 0.5);
    }
    while (progressValues.length > count && progressValues.length > 2) {
        let removeIndex = 1;
        let smallestCost = Infinity;
        for (let index = 1; index < progressValues.length - 1; index += 1) {
            const isAnchor = (anchors || []).some((anchor) => Math.abs(anchor.progress - progressValues[index]) < 0.000001);
            if (isAnchor) continue;
            const cost = progressValues[index + 1] - progressValues[index - 1];
            if (cost < smallestCost) {
                smallestCost = cost;
                removeIndex = index;
            }
        }
        progressValues.splice(removeIndex, 1);
    }
    return progressValues;
}

function macroRouteGridPosition(macroPlan, progress) {
    return sampleSpatialAnchors(macroPlan?.spatialAnchors || spatialAnchorsForPattern(macroPlan?.patternId || "terraces", 1, 1), progress);
}

function buildMacroRoomRouteCandidate({ theme, settings, rng, attempt, macroPlan }) {
    const mainCount = LEVEL_LENGTH_PRESETS[settings.length]?.mainNodes || LEVEL_LENGTH_PRESETS.standard.mainNodes;
    const spacing = theme.route.nodeSpacing;
    const startX = theme.route.startX;
    const baselineY = theme.route.baselineY;
    const halfSpan = macroPlan?.halfSpan || theme.route.macroVerticalSpan * 0.72;
    const roomByNode = new Map((macroPlan?.rooms || []).map((room) => [room.nodeIndex, room]));
    const nodeProgresses = spatialNodeProgresses(macroPlan?.spatialAnchors || [], mainCount);
    const sampled = nodeProgresses.map((progress) => macroRouteGridPosition(macroPlan, progress));
    const exitGridX = sampled.at(-1)?.gx || 7.2;
    const mainNodes = [];
    for (let index = 0; index < mainCount; index += 1) {
        const progress = index / Math.max(1, mainCount - 1);
        const grid = sampled[index];
        const endpoint = index === 0 || index === mainCount - 1;
        const jitterX = endpoint ? 0 : rng.range(-1, 1) * spacing * settings.winding * 0.045;
        const jitterY = endpoint ? 0 : rng.range(-0.055, 0.055) * theme.route.verticalStep * settings.winding;
        const x = endpoint
            ? startX + grid.gx * spacing
            : clamp(startX + grid.gx * spacing + jitterX, startX + spacing * 0.36, startX + (exitGridX - 0.28) * spacing);
        const y = baselineY + grid.gy * halfSpan + jitterY;
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
            macroPatternId: macroPlan?.patternId || "terraces",
            spatialLane: Math.round(grid.gy * 2) / 2,
            macroRoomId: room?.id,
            roomWidthScreens: room?.widthScreens,
            roomHeightScreens: room?.heightScreens,
            rareLargeRoom: room?.rareLargeRoom || undefined
        });
    }

    const nodes = [...mainNodes];
    const edges = [];
    for (let index = 0; index < mainNodes.length - 1; index += 1) {
        const from = mainNodes[index];
        const to = mainNodes[index + 1];
        const deltaX = to.x - from.x;
        const deltaY = to.y - from.y;
        edges.push({
            id: `route_main_edge_${String(index).padStart(3, "0")}`,
            from: from.id,
            to: to.id,
            mandatory: true,
            intendedDirection: Math.abs(deltaY) > Math.abs(deltaX) * 0.65 ? (deltaY > 0 ? "descend" : "climb") : (deltaX < 0 ? "left" : "right")
        });
    }

    appendOptionalBranches({ nodes, edges, mainNodes, theme, settings, rng });
    return {
        version: 3,
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
