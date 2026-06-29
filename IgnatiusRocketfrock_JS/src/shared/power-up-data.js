export const POWER_UP_EFFECT_IDS = Object.freeze({
    SPEED_SHOT: "speedShot",
    SHIELD: "shield",
    // Compatibility alias for revision-211/212 data and saved snapshots.
    ROCKET_OVERDRIVE: "speedShot",
    WRENCH_TRIPLE: "wrenchTriple",
    WRENCH_DART: "wrenchDart",
    WRENCH_TWIN: "wrenchTwin",
    WRENCH_BIGBOMB: "wrenchBigbomb",
    WRENCH_BOOMERANG: "wrenchBoomerang"
});

export const POWER_UP_GROUP_IDS = Object.freeze({
    WRENCH: "wrench"
});

export const WRENCH_POWER_UP_EFFECT_IDS = Object.freeze([
    POWER_UP_EFFECT_IDS.WRENCH_TRIPLE,
    POWER_UP_EFFECT_IDS.WRENCH_DART,
    POWER_UP_EFFECT_IDS.WRENCH_TWIN,
    POWER_UP_EFFECT_IDS.WRENCH_BIGBOMB,
    POWER_UP_EFFECT_IDS.WRENCH_BOOMERANG
]);

export const WRENCH_ROCKET_GLOW_ATLAS_FRAMES = Object.freeze({
    [POWER_UP_EFFECT_IDS.WRENCH_TRIPLE]: "rocket_projectile_glow_wrench_triple",
    [POWER_UP_EFFECT_IDS.WRENCH_DART]: "rocket_projectile_glow_wrench_dart",
    [POWER_UP_EFFECT_IDS.WRENCH_TWIN]: "rocket_projectile_glow_wrench_twin",
    [POWER_UP_EFFECT_IDS.WRENCH_BIGBOMB]: "rocket_projectile_glow_wrench_bigbomb",
    [POWER_UP_EFFECT_IDS.WRENCH_BOOMERANG]: "rocket_projectile_glow_wrench_boomerang"
});

export const POWER_UP_STACKING_RULES = Object.freeze({
    REFRESH: "refresh",
    EXTEND: "extend",
    IGNORE: "ignore"
});

const DEFAULT_ROCKET_PROFILE = Object.freeze({
    launchCooldownMultiplier: 1,
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
    initialAnglesDegrees: Object.freeze([0]),
    separateTargets: false,
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
        durationSeconds: 30,
        permanent: false,
        stacking: POWER_UP_STACKING_RULES.REFRESH,
        clearOnDeath: true,
        groupId: POWER_UP_GROUP_IDS.WRENCH,
        exclusiveGroup: true,
        hud: Object.freeze({
            iconFrame: "powerup_icon_wrench",
            glowFrame: "powerup_glow_white",
            glowTint,
            priority: 50
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
    [POWER_UP_EFFECT_IDS.SPEED_SHOT]: Object.freeze({
        version: 1,
        id: POWER_UP_EFFECT_IDS.SPEED_SHOT,
        label: "Speed Shot",
        durationSeconds: 30,
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
            launchCooldownMultiplier: 0.5,
            launchFuelCostMultiplier: 0.5
        })
    }),
    [POWER_UP_EFFECT_IDS.WRENCH_TRIPLE]: wrenchEffect({
        id: POWER_UP_EFFECT_IDS.WRENCH_TRIPLE,
        label: "Triple",
        glowTint: "#ffff00",
        rocket: {
            projectileCount: 3,
            damageMultiplier: 1 / 2,
            radiusMultiplier: 0.6,
            visualScale: 0.62,
            initialAnglesDegrees: Object.freeze([-12, 0, 12]),
            separateTargets: true
        }
    }),
    [POWER_UP_EFFECT_IDS.WRENCH_DART]: wrenchEffect({
        id: POWER_UP_EFFECT_IDS.WRENCH_DART,
        label: "Dart",
        glowTint: "#00ffff",
        rocket: {
            launchFuelCostMultiplier: 2 / 3,
            damageMultiplier: 1,
            homing: false,
            launchMode: "forward",
            piercesEnemies: false
        }
    }),
    [POWER_UP_EFFECT_IDS.WRENCH_TWIN]: wrenchEffect({
        id: POWER_UP_EFFECT_IDS.WRENCH_TWIN,
        label: "Twin",
        glowTint: "#00ff00",
        rocket: {
            projectileCount: 2,
            damageMultiplier: 1 / 3,
            radiusMultiplier: 0.8,
            visualScale: 0.8,
            initialAnglesDegrees: Object.freeze([-7, 7]),
            separateTargets: true,
            phasesThroughObstacles: true
        }
    }),
    [POWER_UP_EFFECT_IDS.WRENCH_BIGBOMB]: wrenchEffect({
        id: POWER_UP_EFFECT_IDS.WRENCH_BIGBOMB,
        label: "Bigbomb",
        glowTint: "#ff0000",
        rocket: {
            launchFuelCostMultiplier: 3,
            damageMultiplier: 3,
            radiusMultiplier: 1.7,
            visualScale: 1.7,
            speedMultiplier: 0.5,
            homingStrengthMultiplier: 0.5,
            areaDamageRadiusWizardHeights: 1.5
        }
    }),
    [POWER_UP_EFFECT_IDS.WRENCH_BOOMERANG]: wrenchEffect({
        id: POWER_UP_EFFECT_IDS.WRENCH_BOOMERANG,
        label: "Boomerang",
        glowTint: "#ff00ff",
        rocket: {
            boomerang: true
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
    const id = String(effectId || "").trim();
    return id === "rocketOverdrive" ? POWER_UP_EFFECT_IDS.SPEED_SHOT : id;
}

function normalizeAngles(value, fallback) {
    const source = Array.isArray(value) && value.length ? value : fallback;
    return source.map((angle) => finiteNumber(angle, 0));
}

export function powerUpEffectDefinition(effectId) {
    return BUILTIN_POWER_UP_EFFECTS[canonicalEffectId(effectId)] || null;
}

export function isWrenchPowerUpEffectId(effectId) {
    return WRENCH_POWER_UP_EFFECT_IDS.includes(canonicalEffectId(effectId));
}

export function wrenchRocketGlowAtlasFrameId(effectId) {
    return WRENCH_ROCKET_GLOW_ATLAS_FRAMES[canonicalEffectId(effectId)] || null;
}

export function normalizePowerUpEffectDefinition(rawDefinition, fallbackId = "") {
    const source = rawDefinition && typeof rawDefinition === "object" ? rawDefinition : {};
    const sourceId = canonicalEffectId(source.id || fallbackId);
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
            launchCooldownMultiplier: Math.max(0.05, finiteNumber(
                rocketSource.launchCooldownMultiplier,
                finiteNumber(builtinRocket.launchCooldownMultiplier, 1)
            )),
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
            initialAnglesDegrees: normalizeAngles(
                rocketSource.initialAnglesDegrees,
                builtinRocket.initialAnglesDegrees || [0]
            ).slice(0, projectileCount),
            separateTargets: Boolean(rocketSource.separateTargets ?? builtinRocket.separateTargets ?? false),
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
    const requestedId = canonicalEffectId(source.effectId || POWER_UP_EFFECT_IDS.SPEED_SHOT);
    const builtin = powerUpEffectDefinition(requestedId);
    const authoredEffect = source.effect || {
        ...(builtin || {}),
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
        atlasId: String(source.atlasId || "it_atlas_001"),
        iconFrame: String(source.iconFrame || effect.hud.iconFrame),
        glowFrame: String(source.glowFrame || effect.hud.glowFrame),
        glowTint: String(source.glowTint || effect.hud.glowTint)
    };
}

export function normalizeActivePowerUpEffect(rawEffect) {
    const source = rawEffect && typeof rawEffect === "object" ? rawEffect : {};
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
    const raw = state?.statusEffects?.active?.[canonicalId] ||
        (canonicalId === POWER_UP_EFFECT_IDS.SPEED_SHOT ? state?.statusEffects?.active?.rocketOverdrive : null);
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
        const priorityDifference = right.definition.hud.priority - left.definition.hud.priority;
        if (Math.abs(priorityDifference) > 0.000001) return priorityDifference;
        const activationDifference = right.activatedAt - left.activatedAt;
        if (Math.abs(activationDifference) > 0.000001) return activationDifference;
        return left.id < right.id ? -1 : (left.id > right.id ? 1 : 0);
    });
    return active[0] || null;
}

export function rocketPowerUpMultipliers(state) {
    let launchCooldownMultiplier = 1;
    let launchFuelCostMultiplier = 1;
    for (const raw of Object.values(state?.statusEffects?.active || {})) {
        const active = normalizeActivePowerUpEffect(raw);
        if (!active || (!active.definition.permanent && active.remainingSeconds <= 0)) continue;
        launchCooldownMultiplier *= active.definition.rocket.launchCooldownMultiplier;
        launchFuelCostMultiplier *= active.definition.rocket.launchFuelCostMultiplier;
    }
    return {
        launchCooldownMultiplier: Math.max(0.05, launchCooldownMultiplier),
        launchFuelCostMultiplier: Math.max(0, launchFuelCostMultiplier)
    };
}
