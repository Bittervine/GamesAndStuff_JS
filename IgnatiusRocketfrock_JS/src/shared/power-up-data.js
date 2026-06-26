export const POWER_UP_EFFECT_IDS = Object.freeze({
    ROCKET_OVERDRIVE: "rocketOverdrive"
});

export const POWER_UP_STACKING_RULES = Object.freeze({
    REFRESH: "refresh",
    EXTEND: "extend",
    IGNORE: "ignore"
});

const BUILTIN_POWER_UP_EFFECTS = Object.freeze({
    [POWER_UP_EFFECT_IDS.ROCKET_OVERDRIVE]: Object.freeze({
        version: 1,
        id: POWER_UP_EFFECT_IDS.ROCKET_OVERDRIVE,
        label: "Rocket Overdrive",
        durationSeconds: 8,
        permanent: false,
        stacking: POWER_UP_STACKING_RULES.REFRESH,
        clearOnDeath: true,
        hud: Object.freeze({
            iconFrame: "powerup_icon_lightning",
            glowFrame: "powerup_glow_white",
            glowTint: "#ffb52f",
            priority: 100
        }),
        rocket: Object.freeze({
            launchCooldownMultiplier: 0.5,
            launchFuelCostMultiplier: 0.5
        })
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

export function powerUpEffectDefinition(effectId) {
    return BUILTIN_POWER_UP_EFFECTS[String(effectId || "")] || null;
}

export function normalizePowerUpEffectDefinition(rawDefinition, fallbackId = "") {
    const source = rawDefinition && typeof rawDefinition === "object" ? rawDefinition : {};
    const builtin = powerUpEffectDefinition(source.id || fallbackId) || {};
    const id = String(source.id || builtin.id || fallbackId || "").trim();
    if (!id) return null;
    const permanent = source.permanent ?? builtin.permanent ?? false;
    const durationSeconds = permanent
        ? 0
        : Math.max(0.1, finiteNumber(source.durationSeconds, finiteNumber(builtin.durationSeconds, 10)));
    const hudSource = source.hud && typeof source.hud === "object" ? source.hud : {};
    const builtinHud = builtin.hud || {};
    const rocketSource = source.rocket && typeof source.rocket === "object" ? source.rocket : {};
    const builtinRocket = builtin.rocket || {};
    return {
        version: 1,
        id,
        label: String(source.label || builtin.label || id),
        durationSeconds,
        permanent: Boolean(permanent),
        stacking: normalizeStacking(source.stacking || builtin.stacking),
        clearOnDeath: source.clearOnDeath ?? builtin.clearOnDeath ?? true,
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
            ))
        }
    };
}

export function normalizePowerUpPickup(rawPickup) {
    const source = rawPickup && typeof rawPickup === "object" ? rawPickup : {};
    const builtin = powerUpEffectDefinition(source.effectId || POWER_UP_EFFECT_IDS.ROCKET_OVERDRIVE);
    const authoredEffect = source.effect || {
        ...(builtin || {}),
        id: source.effectId || builtin?.id,
        durationSeconds: source.durationSeconds ?? builtin?.durationSeconds,
        permanent: source.permanent ?? builtin?.permanent,
        stacking: source.stacking || builtin?.stacking,
        clearOnDeath: source.clearOnDeath ?? builtin?.clearOnDeath
    };
    const effect = normalizePowerUpEffectDefinition(
        authoredEffect,
        source.effectId || POWER_UP_EFFECT_IDS.ROCKET_OVERDRIVE
    );
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
    const raw = state?.statusEffects?.active?.[String(effectId || "")];
    if (!raw) return null;
    const normalized = normalizeActivePowerUpEffect(raw);
    if (!normalized) return null;
    if (!normalized.definition.permanent && normalized.remainingSeconds <= 0) return null;
    return normalized;
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
