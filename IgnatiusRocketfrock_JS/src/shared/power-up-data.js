export const POWER_UP_EFFECT_IDS = Object.freeze({
    OVERDRIVE: "overdrive",
    FLIGHT: "flight",
    SHIELD: "shield",
    WRENCH_TRIPLE: "wrenchYellow",
    WRENCH_DART: "wrenchCyan",
    WRENCH_BURST: "wrenchGreen",
    WRENCH_BIGBOMB: "wrenchRed",
    WRENCH_BOOMERANG: "wrenchMagenta",
    WRENCH_PHASE: "wrenchBlue"
});

const RETIRED_ROCKET_OVERDRIVE_ID = "rocketOverdrive";
const RETIRED_WRENCH_TWIN_ID = "wrenchTwin";

export const POWER_UP_GROUP_IDS = Object.freeze({
    WRENCH: "wrench"
});

export const NON_HOMING_ROCKET_SPEED_FACTOR = 2;
export const HOMING_TRIPLE_MEANDER_INTERVAL_SECONDS = 0.16;
export const HOMING_TRIPLE_MEANDER_TURN_DEGREES = 7;
export const OVERDRIVE_PASSIVE_FUEL_RECOVERY_DRAIN_FACTOR = 0.9;

function defaultPowerUpPickupWorldScale(effectId) {
    return effectId === POWER_UP_EFFECT_IDS.FLIGHT ? 1.2 : 1;
}

export const DEFAULT_WRENCH_POWER_UP_EFFECT_ID = POWER_UP_EFFECT_IDS.WRENCH_DART;

export const WRENCH_POWER_UP_EFFECT_IDS = Object.freeze([
    POWER_UP_EFFECT_IDS.WRENCH_TRIPLE,
    POWER_UP_EFFECT_IDS.WRENCH_DART,
    POWER_UP_EFFECT_IDS.WRENCH_BURST,
    POWER_UP_EFFECT_IDS.WRENCH_BIGBOMB,
    POWER_UP_EFFECT_IDS.WRENCH_BOOMERANG,
    POWER_UP_EFFECT_IDS.WRENCH_PHASE
]);

export const WRENCH_ROCKET_GLOW_ATLAS_FRAMES = Object.freeze({
    [POWER_UP_EFFECT_IDS.WRENCH_TRIPLE]: "rocket_projectile_glow_wrench_yellow",
    [POWER_UP_EFFECT_IDS.WRENCH_DART]: "rocket_projectile_glow_wrench_cyan",
    [POWER_UP_EFFECT_IDS.WRENCH_BURST]: "rocket_projectile_glow_wrench_green",
    [POWER_UP_EFFECT_IDS.WRENCH_BIGBOMB]: "rocket_projectile_glow_wrench_red",
    [POWER_UP_EFFECT_IDS.WRENCH_BOOMERANG]: "rocket_projectile_glow_wrench_magenta",
    [POWER_UP_EFFECT_IDS.WRENCH_PHASE]: "rocket_projectile_glow_wrench_blue"
});

export const POWER_UP_STACKING_RULES = Object.freeze({
    REFRESH: "refresh",
    EXTEND: "extend",
    IGNORE: "ignore"
});

const DEFAULT_ROCKET_PROFILE = Object.freeze({
    launchFuelCostMultiplier: 1,
    projectileCount: 1,
    damageMultiplier: 1,
    radiusMultiplier: 1,
    visualScale: 1,
    glowTint: null,
    speedMultiplier: 1,
    homingStrengthMultiplier: 1,
    homing: true,
    launchMode: "up",
    launchSequenceIntervalSeconds: 0,
    initialAnglesDegrees: Object.freeze([0]),
    initialAngleJitterDegrees: 0,
    homingMeanderIntervalSeconds: 0,
    homingMeanderTurnDegrees: 0,
    separateTargets: false,
    aimAtNearestForwardTarget: false,
    areaDamageRadiusWizardHeights: 0,
    boomerang: false,
    piercesEnemies: false,
    phasesThroughObstacles: false
});

function wrenchEffect({ id, label, glowTint, rocket }) {
    return Object.freeze({
        version: 1,
        id,
        label,
        durationSeconds: 20,
        permanent: false,
        stacking: POWER_UP_STACKING_RULES.REFRESH,
        clearOnDeath: true,
        groupId: POWER_UP_GROUP_IDS.WRENCH,
        exclusiveGroup: true,
        hud: Object.freeze({
            iconFrame: "powerup_icon_wrench",
            glowFrame: "powerup_glow_white",
            glowTint,
            priority: 200
        }),
        rocket: Object.freeze({ ...DEFAULT_ROCKET_PROFILE, glowTint, ...rocket })
    });
}

const BUILTIN_POWER_UP_EFFECTS = Object.freeze({
    [POWER_UP_EFFECT_IDS.SHIELD]: Object.freeze({
        version: 1,
        id: POWER_UP_EFFECT_IDS.SHIELD,
        label: "Shield",
        durationSeconds: 10,
        permanent: false,
        stacking: POWER_UP_STACKING_RULES.REFRESH,
        clearOnDeath: true,
        groupId: null,
        exclusiveGroup: false,
        hud: Object.freeze({
            iconFrame: "powerup_icon_shield",
            glowFrame: "powerup_glow_white",
            glowTint: "#008cff",
            priority: 150
        }),
        rocket: DEFAULT_ROCKET_PROFILE
    }),
    [POWER_UP_EFFECT_IDS.OVERDRIVE]: Object.freeze({
        version: 1,
        id: POWER_UP_EFFECT_IDS.OVERDRIVE,
        label: "Overdrive",
        durationSeconds: 20,
        permanent: false,
        stacking: POWER_UP_STACKING_RULES.REFRESH,
        clearOnDeath: true,
        groupId: null,
        exclusiveGroup: false,
        hud: Object.freeze({
            iconFrame: "powerup_icon_lightning",
            glowFrame: "powerup_glow_white",
            glowTint: "#ffb52f",
            priority: 100
        }),
        rocket: Object.freeze({
            ...DEFAULT_ROCKET_PROFILE,
            launchFuelCostMultiplier: 0.5
        })
    }),
    [POWER_UP_EFFECT_IDS.FLIGHT]: Object.freeze({
        version: 1,
        id: POWER_UP_EFFECT_IDS.FLIGHT,
        label: "Flight",
        durationSeconds: 60,
        permanent: false,
        stacking: POWER_UP_STACKING_RULES.REFRESH,
        clearOnDeath: true,
        groupId: null,
        exclusiveGroup: false,
        hud: Object.freeze({
            iconFrame: "rocket_fuel_canister",
            glowFrame: "powerup_glow_white",
            glowTint: "#ff8c32",
            priority: 190
        }),
        rocket: DEFAULT_ROCKET_PROFILE
    }),
    [POWER_UP_EFFECT_IDS.WRENCH_TRIPLE]: wrenchEffect({
        id: POWER_UP_EFFECT_IDS.WRENCH_TRIPLE,
        label: POWER_UP_EFFECT_IDS.WRENCH_TRIPLE,
        glowTint: "#ffff00",
        rocket: {
            launchFuelCostMultiplier: 0.5,
            projectileCount: 5,
            damageMultiplier: 1 / 5,
            radiusMultiplier: 0.6,
            visualScale: 0.62,
            speedMultiplier: NON_HOMING_ROCKET_SPEED_FACTOR,
            homing: false,
            launchMode: "forward",
            initialAnglesDegrees: Object.freeze([-7.5, -3.75, 0, 3.75, 7.5]),
            aimAtNearestForwardTarget: true
        }
    }),
    [POWER_UP_EFFECT_IDS.WRENCH_DART]: wrenchEffect({
        id: POWER_UP_EFFECT_IDS.WRENCH_DART,
        label: POWER_UP_EFFECT_IDS.WRENCH_DART,
        glowTint: "#00ffff",
        rocket: {
            launchFuelCostMultiplier: 0.5,
            damageMultiplier: 1,
            speedMultiplier: NON_HOMING_ROCKET_SPEED_FACTOR,
            homing: false,
            launchMode: "forward",
            piercesEnemies: false
        }
    }),
    [POWER_UP_EFFECT_IDS.WRENCH_BURST]: wrenchEffect({
        id: POWER_UP_EFFECT_IDS.WRENCH_BURST,
        label: POWER_UP_EFFECT_IDS.WRENCH_BURST,
        glowTint: "#00ff00",
        rocket: {
            launchFuelCostMultiplier: 0.5,
            damageMultiplier: 1,
            speedMultiplier: NON_HOMING_ROCKET_SPEED_FACTOR,
            homing: false,
            launchMode: "forward",
            aimAtNearestForwardTarget: true
        }
    }),
    [POWER_UP_EFFECT_IDS.WRENCH_BIGBOMB]: wrenchEffect({
        id: POWER_UP_EFFECT_IDS.WRENCH_BIGBOMB,
        label: POWER_UP_EFFECT_IDS.WRENCH_BIGBOMB,
        glowTint: "#ff0000",
        rocket: {
            launchFuelCostMultiplier: 3,
            damageMultiplier: 4,
            radiusMultiplier: 1.7,
            visualScale: 1.7,
            speedMultiplier: 0.5,
            homingStrengthMultiplier: 0.5,
            launchMode: "forward",
            areaDamageRadiusWizardHeights: 1.5
        }
    }),
    [POWER_UP_EFFECT_IDS.WRENCH_BOOMERANG]: wrenchEffect({
        id: POWER_UP_EFFECT_IDS.WRENCH_BOOMERANG,
        label: POWER_UP_EFFECT_IDS.WRENCH_BOOMERANG,
        glowTint: "#ff00ff",
        rocket: {
            launchFuelCostMultiplier: 0.5,
            launchMode: "forward",
            boomerang: true
        }
    }),
    [POWER_UP_EFFECT_IDS.WRENCH_PHASE]: wrenchEffect({
        id: POWER_UP_EFFECT_IDS.WRENCH_PHASE,
        label: POWER_UP_EFFECT_IDS.WRENCH_PHASE,
        glowTint: "#0000ff",
        rocket: {
            launchFuelCostMultiplier: 0.5,
            projectileCount: 3,
            damageMultiplier: 1 / 3,
            radiusMultiplier: 0.6,
            visualScale: 0.62,
            initialAnglesDegrees: Object.freeze([-12, 0, 12]),
            homingMeanderIntervalSeconds: HOMING_TRIPLE_MEANDER_INTERVAL_SECONDS,
            homingMeanderTurnDegrees: HOMING_TRIPLE_MEANDER_TURN_DEGREES,
            separateTargets: true
        }
    })
});

function finiteNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function normalizeStacking(value) {
    return Object.values(POWER_UP_STACKING_RULES).includes(value)
        ? value
        : POWER_UP_STACKING_RULES.REFRESH;
}

function canonicalEffectId(effectId) {
    return String(effectId || "").trim();
}

function isRetiredPowerUpEffectId(effectId) {
    const id = canonicalEffectId(effectId);
    return id === RETIRED_ROCKET_OVERDRIVE_ID || id === RETIRED_WRENCH_TWIN_ID;
}

function normalizeAngles(value, fallback) {
    const source = Array.isArray(value) && value.length ? value : fallback;
    return source.map((angle) => finiteNumber(angle, 0));
}

export function powerUpEffectDefinition(effectId) {
    if (isRetiredPowerUpEffectId(effectId)) return null;
    return BUILTIN_POWER_UP_EFFECTS[canonicalEffectId(effectId)] || null;
}

export function powerUpHudLabel(definition) {
    const id = canonicalEffectId(definition?.id);
    const label = String(definition?.label || id);
    const wrenchPrefix = "wrench";
    if (definition?.groupId === POWER_UP_GROUP_IDS.WRENCH && id.startsWith(wrenchPrefix) && id.length > wrenchPrefix.length) {
        return id.slice(wrenchPrefix.length);
    }
    return label;
}

export function normalizeWrenchPowerUpEffectId(value, fallback = DEFAULT_WRENCH_POWER_UP_EFFECT_ID) {
    const requested = canonicalEffectId(value || fallback);
    return WRENCH_POWER_UP_EFFECT_IDS.includes(requested)
        ? requested
        : DEFAULT_WRENCH_POWER_UP_EFFECT_ID;
}

export function wrenchRocketGlowAtlasFrameId(effectId) {
    return WRENCH_ROCKET_GLOW_ATLAS_FRAMES[canonicalEffectId(effectId)] || null;
}

export function normalizePowerUpEffectDefinition(rawDefinition, fallbackId = "") {
    const source = rawDefinition && typeof rawDefinition === "object" ? rawDefinition : {};
    const sourceId = canonicalEffectId(source.id || fallbackId);
    if (isRetiredPowerUpEffectId(sourceId)) return null;
    const builtin = powerUpEffectDefinition(sourceId) || {};
    const id = canonicalEffectId(sourceId || builtin.id || fallbackId);
    if (!id) return null;
    const permanent = source.permanent ?? builtin.permanent ?? false;
    const durationSeconds = permanent
        ? 0
        : Math.max(0.1, finiteNumber(source.durationSeconds, finiteNumber(builtin.durationSeconds, 10)));
    const hudSource = source.hud && typeof source.hud === "object" ? source.hud : {};
    const builtinHud = builtin.hud || {};
    const rocketSource = source.rocket && typeof source.rocket === "object" ? source.rocket : {};
    const builtinRocket = builtin.rocket || DEFAULT_ROCKET_PROFILE;
    const projectileCount = Math.max(1, Math.floor(finiteNumber(
        rocketSource.projectileCount,
        finiteNumber(builtinRocket.projectileCount, 1)
    )));
    return {
        version: 1,
        id,
        label: String(source.label || builtin.label || id),
        durationSeconds,
        permanent: Boolean(permanent),
        stacking: normalizeStacking(source.stacking || builtin.stacking),
        clearOnDeath: source.clearOnDeath ?? builtin.clearOnDeath ?? true,
        groupId: source.groupId === null
            ? null
            : String(source.groupId || builtin.groupId || "").trim() || null,
        exclusiveGroup: Boolean(source.exclusiveGroup ?? builtin.exclusiveGroup ?? false),
        hud: {
            iconFrame: String(hudSource.iconFrame || builtinHud.iconFrame || "powerup_icon_spark"),
            glowFrame: String(hudSource.glowFrame || builtinHud.glowFrame || "powerup_glow_white"),
            glowTint: String(hudSource.glowTint || builtinHud.glowTint || "#ffffff"),
            priority: finiteNumber(hudSource.priority, finiteNumber(builtinHud.priority, 0))
        },
        rocket: {
            launchFuelCostMultiplier: Math.max(0, finiteNumber(
                rocketSource.launchFuelCostMultiplier,
                finiteNumber(builtinRocket.launchFuelCostMultiplier, 1)
            )),
            projectileCount,
            damageMultiplier: Math.max(0, finiteNumber(
                rocketSource.damageMultiplier,
                finiteNumber(builtinRocket.damageMultiplier, 1)
            )),
            radiusMultiplier: Math.max(0.1, finiteNumber(
                rocketSource.radiusMultiplier,
                finiteNumber(builtinRocket.radiusMultiplier, 1)
            )),
            visualScale: Math.max(0.1, finiteNumber(
                rocketSource.visualScale,
                finiteNumber(builtinRocket.visualScale, 1)
            )),
            glowTint: rocketSource.glowTint === null
                ? null
                : String(rocketSource.glowTint || builtinRocket.glowTint || "").trim() || null,
            speedMultiplier: Math.max(0.05, finiteNumber(
                rocketSource.speedMultiplier,
                finiteNumber(builtinRocket.speedMultiplier, 1)
            )),
            homingStrengthMultiplier: Math.max(0, finiteNumber(
                rocketSource.homingStrengthMultiplier,
                finiteNumber(builtinRocket.homingStrengthMultiplier, 1)
            )),
            homing: Boolean(rocketSource.homing ?? builtinRocket.homing ?? true),
            launchMode: String(rocketSource.launchMode || builtinRocket.launchMode || "up") === "forward"
                ? "forward"
                : "up",
            launchSequenceIntervalSeconds: Math.max(0, finiteNumber(
                rocketSource.launchSequenceIntervalSeconds,
                finiteNumber(builtinRocket.launchSequenceIntervalSeconds, 0)
            )),
            initialAnglesDegrees: normalizeAngles(
                rocketSource.initialAnglesDegrees,
                builtinRocket.initialAnglesDegrees || [0]
            ).slice(0, projectileCount),
            initialAngleJitterDegrees: Math.max(0, finiteNumber(
                rocketSource.initialAngleJitterDegrees,
                finiteNumber(builtinRocket.initialAngleJitterDegrees, 0)
            )),
            homingMeanderIntervalSeconds: Math.max(0, finiteNumber(
                rocketSource.homingMeanderIntervalSeconds,
                finiteNumber(builtinRocket.homingMeanderIntervalSeconds, 0)
            )),
            homingMeanderTurnDegrees: Math.max(0, finiteNumber(
                rocketSource.homingMeanderTurnDegrees,
                finiteNumber(builtinRocket.homingMeanderTurnDegrees, 0)
            )),
            separateTargets: Boolean(rocketSource.separateTargets ?? builtinRocket.separateTargets ?? false),
            aimAtNearestForwardTarget: Boolean(
                rocketSource.aimAtNearestForwardTarget ?? builtinRocket.aimAtNearestForwardTarget ?? false
            ),
            areaDamageRadiusWizardHeights: Math.max(0, finiteNumber(
                rocketSource.areaDamageRadiusWizardHeights,
                finiteNumber(builtinRocket.areaDamageRadiusWizardHeights, 0)
            )),
            boomerang: Boolean(rocketSource.boomerang ?? builtinRocket.boomerang ?? false),
            piercesEnemies: Boolean(rocketSource.piercesEnemies ?? builtinRocket.piercesEnemies ?? false),
            phasesThroughObstacles: Boolean(rocketSource.phasesThroughObstacles ?? builtinRocket.phasesThroughObstacles ?? false)
        }
    };
}

export function normalizePowerUpPickup(rawPickup) {
    const source = rawPickup && typeof rawPickup === "object" ? rawPickup : {};
    const requestedId = canonicalEffectId(source.effectId || POWER_UP_EFFECT_IDS.OVERDRIVE);
    if (isRetiredPowerUpEffectId(requestedId)) return null;
    const builtin = powerUpEffectDefinition(requestedId);
    const hasAuthoredEffect = source.effect && typeof source.effect === "object";
    if (!builtin && !hasAuthoredEffect) return null;
    const authoredEffect = hasAuthoredEffect ? source.effect : {
        ...builtin,
        id: requestedId || builtin?.id,
        durationSeconds: source.durationSeconds ?? builtin?.durationSeconds,
        permanent: source.permanent ?? builtin?.permanent,
        stacking: source.stacking || builtin?.stacking,
        clearOnDeath: source.clearOnDeath ?? builtin?.clearOnDeath,
        groupId: source.groupId ?? builtin?.groupId,
        exclusiveGroup: source.exclusiveGroup ?? builtin?.exclusiveGroup
    };
    const effect = normalizePowerUpEffectDefinition(authoredEffect, requestedId);
    if (!effect) return null;
    return {
        version: 1,
        effectId: effect.id,
        effect,
        radius: Math.max(4, finiteNumber(source.radius, 30)),
        worldScale: Math.max(0.1, finiteNumber(source.worldScale, defaultPowerUpPickupWorldScale(effect.id))),
        atlasId: String(source.atlasId || "it_atlas_001"),
        iconFrame: String(source.iconFrame || effect.hud.iconFrame),
        glowFrame: String(source.glowFrame || effect.hud.glowFrame),
        glowTint: String(source.glowTint || effect.hud.glowTint)
    };
}

export function normalizeActivePowerUpEffect(rawEffect) {
    const source = rawEffect && typeof rawEffect === "object" ? rawEffect : {};
    const requestedId = canonicalEffectId(source.id || source.definition?.id);
    if (isRetiredPowerUpEffectId(requestedId)) return null;
    const definition = normalizePowerUpEffectDefinition(source.definition, source.id);
    if (!definition) return null;
    return {
        version: 1,
        id: definition.id,
        definition,
        remainingSeconds: definition.permanent
            ? null
            : Math.max(0, finiteNumber(source.remainingSeconds, definition.durationSeconds)),
        sourceId: source.sourceId ? String(source.sourceId) : null,
        activatedAt: Math.max(0, finiteNumber(source.activatedAt, 0)),
        refreshCount: Math.max(0, Math.floor(finiteNumber(source.refreshCount, 0)))
    };
}

export function activePowerUpEffect(state, effectId) {
    const canonicalId = canonicalEffectId(effectId);
    const raw = state?.statusEffects?.active?.[canonicalId];
    if (!raw) return null;
    const normalized = normalizeActivePowerUpEffect(raw);
    if (!normalized) return null;
    if (!normalized.definition.permanent && normalized.remainingSeconds <= 0) return null;
    return normalized;
}

export function activePowerUpEffectInGroup(state, groupId) {
    const requestedGroup = String(groupId || "");
    return Object.values(state?.statusEffects?.active || {})
        .map((raw) => normalizeActivePowerUpEffect(raw))
        .filter((effect) => effect && effect.definition.groupId === requestedGroup)
        .filter((effect) => effect.definition.permanent || effect.remainingSeconds > 0)
        .sort((left, right) => {
            const activationDifference = right.activatedAt - left.activatedAt;
            if (Math.abs(activationDifference) > 0.000001) return activationDifference;
            return left.id < right.id ? -1 : (left.id > right.id ? 1 : 0);
        })[0] || null;
}

export function activeWrenchPowerUpEffect(state) {
    return activePowerUpEffectInGroup(state, POWER_UP_GROUP_IDS.WRENCH);
}

export function prioritizedActivePowerUpEffect(state) {
    const active = Object.values(state?.statusEffects?.active || {})
        .map((raw) => normalizeActivePowerUpEffect(raw))
        .filter((effect) => effect && (effect.definition.permanent || effect.remainingSeconds > 0));
    active.sort((left, right) => {
        const leftBuiltinPriority = powerUpEffectDefinition(left.id)?.hud?.priority;
        const rightBuiltinPriority = powerUpEffectDefinition(right.id)?.hud?.priority;
        const leftPriority = Math.max(
            finiteNumber(left.definition.hud.priority, 0),
            finiteNumber(leftBuiltinPriority, 0)
        );
        const rightPriority = Math.max(
            finiteNumber(right.definition.hud.priority, 0),
            finiteNumber(rightBuiltinPriority, 0)
        );
        const priorityDifference = rightPriority - leftPriority;
        if (Math.abs(priorityDifference) > 0.000001) return priorityDifference;
        const activationDifference = right.activatedAt - left.activatedAt;
        if (Math.abs(activationDifference) > 0.000001) return activationDifference;
        return left.id < right.id ? -1 : (left.id > right.id ? 1 : 0);
    });
    return active[0] || null;
}

export function rocketPowerUpMultipliers(state) {
    let launchFuelCostMultiplier = 1;
    for (const raw of Object.values(state?.statusEffects?.active || {})) {
        const active = normalizeActivePowerUpEffect(raw);
        if (!active || (!active.definition.permanent && active.remainingSeconds <= 0)) continue;
        launchFuelCostMultiplier *= active.definition.rocket.launchFuelCostMultiplier;
    }
    return {
        launchFuelCostMultiplier: Math.max(0, launchFuelCostMultiplier)
    };
}
