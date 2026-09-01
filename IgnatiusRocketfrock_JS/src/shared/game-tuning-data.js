export const TUNING_SCHEMA_VERSION = 1;
export const DOUBLE_JUMP_PHYSICS_FIXED_IMPULSE = "fixedImpulse";
export const DOUBLE_JUMP_PHYSICS_CONSISTENT_APEX = "consistentApex";

export const SHARED_GAME_TUNING_KEYS = Object.freeze([
    "gravity",
    "ordinaryJumpHeight",
    "terminalVelocity",
    "maxRunSpeed",
    "groundAcceleration",
    "airAcceleration",
    "groundFriction",
    "landingFriction",
    "airDrag",
    "playerDropThroughGraceSeconds",
    "flightVerticalSpeed",
    "flightVerticalAcceleration",
    "doubleJumpPhysics",
    "attachedBoostStartImpulse",
    "attachedBoostKickFuelCost",
    "attachedBoostStartMaxDownwardVelocity",
    "attachedBoostBurstDuration",
    "attachedBoostHoverFallSpeed",
    "attachedBoostHoverBrakeAcceleration",
    "playerLungeChargeSeconds",
    "playerFireHoldLungeSeconds",
    "playerLungeCooldownSeconds",
    "playerLungeDistance",
    "playerLungeSpeed",
    "playerLungeDamage",
    "playerLungeHitboxHeight",
    "attachedBoostDrainRate",
    "fuelMax",
    "baseRechargeCap",
    "fuelRechargeRequiresGround",
    "rechargeDelayAfterUse",
    "rechargeRate",
    "rocketLaunchCost",
    "rocketProjectileSpeed",
    "rocketProjectileUpLaunchSeconds",
    "rocketProjectileInitialHomingStrength",
    "rocketProjectileHomingStrength",
    "rocketDurationPercent",
    "rocketDamagePercent",
    "rocketProjectileMaxTravelDistance",
    "rocketProjectileUnwrenchedMaxTravelDistance",
    "rocketTargetSearchDistance",
    "rocketLifetimeExplosionOffscreenMargin",
    "rocketProjectileDamage",
    "flightStandardRocketDamageMultiplier",
    "standardRocketSecondarySplashDamage",
    "standardRocketSecondarySplashRadiusWizardHeights",
    "maxHealth",
    "lowHealthThreshold",
    "healthRegenDelay",
    "healthRegenRate",
    "playerDamageInvulnerabilitySeconds",
    "playerContactDamageInvulnerabilitySeconds",
    "playerContactDamageKnockbackX",
    "playerContactDamageKnockbackY",
    "hazardContactDamage",
    "fallDamageEnabled",
    "fallDamageSafeImpactSpeed",
    "fallDamagePerWizardHeight",
    "playerFallDamageMultiplier",
    "playerFallImpactExplosionCooldownSeconds",
    "playerFallImpactExplosionDamage",
    "meleeEnemyHealthScale",
    "meleeEnemyRunSpeedScale",
    "meleeEnemyAttackRateScale",
    "rangedEnemyHealthScale",
    "rangedEnemyRunSpeedScale",
    "rangedEnemyAttackRateScale",
    "rangedEnemyProjectileSpeedScale"
]);

const NUMBER_RULES = Object.freeze({
    gravity: [1, 10000],
    ordinaryJumpHeight: [1, 5000],
    terminalVelocity: [1, 20000],
    maxRunSpeed: [1, 5000],
    groundAcceleration: [0, 50000],
    airAcceleration: [0, 50000],
    groundFriction: [0, 50000],
    landingFriction: [0, 50000],
    airDrag: [0, 100],
    playerDropThroughGraceSeconds: [0, 10],
    flightVerticalSpeed: [0, 5000],
    flightVerticalAcceleration: [0, 50000],
    attachedBoostStartImpulse: [-20000, 20000],
    attachedBoostKickFuelCost: [0, 100000],
    attachedBoostStartMaxDownwardVelocity: [-20000, 20000],
    attachedBoostBurstDuration: [0, 60],
    attachedBoostHoverFallSpeed: [0, 5000],
    attachedBoostHoverBrakeAcceleration: [0, 50000],
    playerLungeChargeSeconds: [0.05, 10],
    playerFireHoldLungeSeconds: [0.01, 5],
    playerLungeCooldownSeconds: [0, 60],
    playerLungeDistance: [1, 100000],
    playerLungeSpeed: [1, 50000],
    playerLungeDamage: [0, 1000000],
    playerLungeHitboxHeight: [8, 5000],
    attachedBoostDrainRate: [0, 100000],
    fuelMax: [1, 100000],
    baseRechargeCap: [0, 100000],
    rechargeDelayAfterUse: [0, 3600],
    rechargeRate: [0, 100000],
    rocketLaunchCost: [0, 100000],
    rocketProjectileSpeed: [1, 50000],
    rocketProjectileUpLaunchSeconds: [0, 60],
    rocketProjectileInitialHomingStrength: [0, 1000],
    rocketProjectileHomingStrength: [0, 1000],
    rocketDurationPercent: [1, 1000],
    rocketDamagePercent: [1, 1000],
    rocketProjectileMaxTravelDistance: [1, 1000000],
    rocketProjectileUnwrenchedMaxTravelDistance: [1, 1000000],
    rocketTargetSearchDistance: [1, 1000000],
    rocketLifetimeExplosionOffscreenMargin: [0, 1000000],
    rocketProjectileDamage: [0, 1000000],
    flightStandardRocketDamageMultiplier: [0, 1000],
    standardRocketSecondarySplashDamage: [0, 1000000],
    standardRocketSecondarySplashRadiusWizardHeights: [0, 1000],
    maxHealth: [1, 1000000],
    lowHealthThreshold: [0, 1000000],
    healthRegenDelay: [0, 3600],
    healthRegenRate: [0, 100000],
    playerDamageInvulnerabilitySeconds: [0, 3600],
    playerContactDamageInvulnerabilitySeconds: [0, 3600],
    playerContactDamageKnockbackX: [0, 10000],
    playerContactDamageKnockbackY: [-10000, 10000],
    hazardContactDamage: [0, 1000000],
    fallDamageSafeImpactSpeed: [0, 100000],
    fallDamagePerWizardHeight: [0, 100000],
    playerFallDamageMultiplier: [0, 1],
    playerFallImpactExplosionCooldownSeconds: [0, 60],
    playerFallImpactExplosionDamage: [0, 1000000],
    meleeEnemyHealthScale: [0.01, 1000],
    meleeEnemyRunSpeedScale: [0.01, 1000],
    meleeEnemyAttackRateScale: [0.01, 1000],
    rangedEnemyHealthScale: [0.01, 1000],
    rangedEnemyRunSpeedScale: [0.01, 1000],
    rangedEnemyAttackRateScale: [0.01, 1000],
    rangedEnemyProjectileSpeedScale: [0.01, 1000]
});

const BOOLEAN_KEYS = new Set(["fuelRechargeRequiresGround", "fallDamageEnabled"]);

function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeDoubleJumpPhysics(value, fallback) {
    const candidate = String(value || "").trim();
    if (candidate === DOUBLE_JUMP_PHYSICS_FIXED_IMPULSE || candidate === DOUBLE_JUMP_PHYSICS_CONSISTENT_APEX) {
        return candidate;
    }
    return fallback === DOUBLE_JUMP_PHYSICS_CONSISTENT_APEX
        ? DOUBLE_JUMP_PHYSICS_CONSISTENT_APEX
        : DOUBLE_JUMP_PHYSICS_FIXED_IMPULSE;
}

function normalizedNumber(value, fallback, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(min, Math.min(max, number));
}

export function applyGameTuningValues(baseTuning, source = {}) {
    const base = isPlainObject(baseTuning) ? baseTuning : {};
    const input = isPlainObject(source) ? source : {};
    const result = { ...base };
    for (const key of SHARED_GAME_TUNING_KEYS) {
        if (!Object.prototype.hasOwnProperty.call(input, key)) continue;
        if (key === "doubleJumpPhysics") {
            result[key] = normalizeDoubleJumpPhysics(input[key], base[key]);
        } else if (BOOLEAN_KEYS.has(key)) {
            result[key] = typeof input[key] === "boolean" ? input[key] : Boolean(base[key]);
        } else {
            const [min, max] = NUMBER_RULES[key];
            result[key] = normalizedNumber(input[key], Number(base[key]), min, max);
        }
    }
    return result;
}

export function gameTuningValidationIssues(value, fallback = {}) {
    if (!isPlainObject(value)) return ["tuning root is not an object"];
    const normalized = applyGameTuningValues(fallback, value);
    const issues = [];
    for (const key of SHARED_GAME_TUNING_KEYS) {
        if (!Object.prototype.hasOwnProperty.call(value, key)) {
            issues.push(`${key}: missing`);
            continue;
        }
        const authored = value[key];
        if (key === "doubleJumpPhysics") {
            if (authored !== DOUBLE_JUMP_PHYSICS_FIXED_IMPULSE && authored !== DOUBLE_JUMP_PHYSICS_CONSISTENT_APEX) {
                issues.push(`${key}: invalid value`);
            }
        } else if (BOOLEAN_KEYS.has(key)) {
            if (typeof authored !== "boolean") issues.push(`${key}: expected boolean`);
        } else if (typeof authored !== "number" || !Number.isFinite(authored)) {
            issues.push(`${key}: expected finite number`);
        } else if (Math.abs(authored - normalized[key]) > 1e-9) {
            issues.push(`${key}: outside supported range`);
        }
    }
    const unknownKeys = Object.keys(value).filter((key) => key !== "schemaVersion" && !SHARED_GAME_TUNING_KEYS.includes(key));
    for (const key of unknownKeys) issues.push(`${key}: unknown key`);
    return issues;
}

export function gameTuningToJson(tuning = {}) {
    const result = { schemaVersion: TUNING_SCHEMA_VERSION };
    for (const key of SHARED_GAME_TUNING_KEYS) {
        result[key] = tuning[key];
    }
    return result;
}

export function createGameTuningOverrides(tuning, installedTuning) {
    const result = {};
    for (const key of SHARED_GAME_TUNING_KEYS) {
        const current = tuning?.[key];
        const installed = installedTuning?.[key];
        const equal = typeof current === "number" && typeof installed === "number"
            ? Math.abs(current - installed) <= 1e-9
            : current === installed;
        if (!equal) result[key] = current;
    }
    return result;
}

export function resolveGameTuning(installedTuning, overrides = {}) {
    return applyGameTuningValues(installedTuning, overrides);
}

export function normalizeGameTuningOverrides(overrides, installedTuning) {
    return createGameTuningOverrides(resolveGameTuning(installedTuning, overrides), installedTuning);
}

export async function loadInstalledGameTuning({
    fallback,
    url = "resources/config/tuning.json",
    fetchImpl = globalThis.fetch,
    onException = null
} = {}) {
    const emergencyFallback = { ...fallback };
    if (typeof fetchImpl !== "function") return emergencyFallback;
    try {
        const response = await fetchImpl(url, { cache: "no-store" });
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        const parsed = await response.json();
        if (!isPlainObject(parsed)) throw new Error("tuning.json must contain an object");
        if (Number(parsed.schemaVersion) !== TUNING_SCHEMA_VERSION) {
            throw new Error(`unsupported tuning schemaVersion ${parsed.schemaVersion}`);
        }
        const issues = gameTuningValidationIssues(parsed, emergencyFallback);
        if (issues.length) {
            console.warn(`Invalid tuning.json values were normalized: ${issues.join(", ")}`);
            onException?.({
                type: "gameTuningFallback",
                resourceUrl: url,
                issues,
                message: `tuning.json required fallback or clamping for ${issues.length} field(s)`
            });
        }
        return applyGameTuningValues(emergencyFallback, parsed);
    } catch (error) {
        console.warn("Could not load resources/config/tuning.json; compiled emergency defaults will be used.", error);
        onException?.({
            type: "gameTuningFallback",
            resourceUrl: url,
            error: String(error?.message || error),
            message: "tuning.json could not be loaded; compiled emergency defaults are active"
        });
        return emergencyFallback;
    }
}
