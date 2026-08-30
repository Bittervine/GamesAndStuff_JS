import {
    STORY_READING_CHARACTERS_PER_SECOND,
    storyCharacterCount,
    storyReadingDuration
} from "../shared/story-reading.js";
import { atlasNodeToPlacementWorld, normalizeRotationRadians, placementLocalToWorld } from "../shared/level-transform.js";
import { characterEnemyMeleeAttackRect, enemyProjectileHitbox } from "../shared/actor-geometry.js";
import { normalizeLevelColorMap } from "../shared/level-color-map-data.js";
import { normalizeLevelColorExchange } from "../shared/color-exchange-data.js";
import {
    BACKGROUND_LAYER,
    CAVE_FOREGROUND_LAYER_ID,
    normalizeLevelLayerVisuals
} from "../shared/level-layer-data.js";
import { normalizeCaveWindow } from "../shared/cave-window-data.js";
import {
    cameraLinePointAtDistance,
    nearestCameraLinePoint,
    normalizeCameraLine
} from "../shared/camera-line-data.js";
import {
    deriveCaveFullBlackKillBoundary,
    evaluateCaveBoundaryRect
} from "../shared/cave-kill-boundary-data.js";
import {
    MIN_MOVING_PLATFORM_SWING_PERIOD,
    movingPlatformEasedProgress,
    movingPlatformSwingStartPhase,
    normalizeMovingPlatform
} from "../shared/moving-platform-data.js";
import {
    createAnimationClock,
    createTransformTriplet,
    currentTransformOf,
    ensureAnimationClock,
    ensureTransformTriplet,
    showInterpolatedAnimationClock,
    showInterpolatedTransform,
    snapAnimationClock,
    snapTransformTriplet,
    snapshotAnimationClock,
    snapshotTransform
} from "../shared/presentation-transform-data.js";
import {
    isSignalEmitterEntity,
    isSignalReceiverEntity,
    SIGNAL_DISAPPEAR_FADE_SECONDS,
    normalizeSignalChannel,
    normalizeSignalEmitter,
    normalizeSignalReceiver
} from "../shared/signal-channel-data.js";
import { normalizeLevelMusic } from "../shared/music-data.js";
import { normalizeCharacterDropProfile, normalizeLootCatalog } from "../shared/enemy-drop-data.js";
import { normalizeEnemyScale, scaledEnemyDimensions, scaledEnemyProjectileRadius, scaledEnemyRenderScale } from "../shared/enemy-scale-data.js";
import {
    enemyEntityFromDefinition,
    normalizeAutoSpawnEnemies,
    normalizeEnemyDefinitionCatalog,
    normalizeEnemySpawner,
    resolveAutoSpawnEnemyIds
} from "../shared/auto-spawn-enemy-data.js";
import {
    OVERDRIVE_PASSIVE_FUEL_RECOVERY_DRAIN_FACTOR,
    MAGIC_RING_PANIC_SECONDS,
    POWER_UP_EFFECT_IDS,
    WRENCH_POWER_UP_EFFECT_IDS,
    normalizeWrenchPowerUpEffectId,
    activePowerUpEffect,
    activeWrenchPowerUpEffect,
    normalizeActivePowerUpEffect,
    normalizePowerUpPickup,
    powerUpEffectDefinition,
    rocketPowerUpMultipliers,
    wrenchRocketGlowAtlasFrameId
} from "../shared/power-up-data.js";
import {
    difficultyDamageScale,
    normalizeGameSettings,
    renderingParticleScale
} from "../shared/game-settings-data.js";
import {
    queryWorldCollisionPolygons,
    queryWorldSegments,
    queryWorldSegmentsFromCollisionAssets,
    queryWorldSolids
} from "./world-collision-index.js";
import {
    buildEnemyNavigationEdges,
    ENEMY_DROP_SOURCE_CLEARANCE_HEIGHT_FACTOR,
    ENEMY_DROP_SOURCE_CLEARANCE_WIDTH_FACTOR,
    ENEMY_NAVIGATION_GRAPH_BUILD_METHOD,
    buildEnemyNavigationSupports,
    enemyNavigationEdgeMapFromFlat,
    enemyNavigationEdgeRuntimeAllowed,
    enemyNavigationSupportCollisionId,
    enemyNavigationSupportPhysicalOwnerId,
    enemyNavigationSupportsShareEndpoint,
    ENEMY_NAVIGATION_VERIFICATION_FAILED,
    ENEMY_NAVIGATION_VERIFICATION_VERIFIED,
    enemyNavigationRouteFromSearch,
    enemyNavigationTraversalAllowedFromSupport,
    enemyNavigationProfileKey,
    enemyNavigationSupportsSignature,
    findBakedEnemyNavigationGraph,
    findEnemyNavigationSupport,
    navigationSupportById,
    normalizeEnemyNavigationProfile,
    planEnemyNavigationRoute,
    planEnemyNavigationRoutesFrom,
    rebuildEnemyNavigationWalkRegions,
    supportPoint
} from "./enemy-navigation.js";

export const FIXED_DT = 1 / 60;
export const PICKUP_PROXIMITY_DISTANCE_SCALE = 0.67;
const AUTOMATIC_STEP_HEIGHT_RATIO = 0.2;
const PLAYER_STANDABLE_SLOPE_RATIO = 0.75;
const PLAYER_MAX_WALKABLE_SLOPE_RATIO = 5.671281819617707; // tan(80 degrees)
const PLAYER_WALKABLE_SEAM_MAX_DISTANCE = 1.0;
const PLAYER_WALKABLE_SEAM_MIN_TANGENT_DOT = 0.9993908270190958; // cos(2 degrees)
function playerAutomaticStepHeight(player) {
    return Math.max(0, player.height * AUTOMATIC_STEP_HEIGHT_RATIO);
}

function playerSegmentIsStandable(segment) {
    if (!segment || !isSolidSegmentKind(segment.kind)) {
        return false;
    }
    const dx = Number(segment.x2) - Number(segment.x1);
    const dy = Number(segment.y2) - Number(segment.y1);
    if (Math.abs(dx) <= 0.001) {
        return false;
    }
    const slopeRatio = segment.kind === "walkable"
        ? PLAYER_MAX_WALKABLE_SLOPE_RATIO
        : PLAYER_STANDABLE_SLOPE_RATIO;
    return Math.abs(dy) <= Math.abs(dx) * slopeRatio;
}

function isMusketProjectileKind(projectileKind) {
    return projectileKind === "musketBall" || projectileKind === "musketMortar";
}

function enemyProjectileKindDefinition(state, projectileKind) {
    const raw = state?.enemyCatalog?.projectileKinds?.[String(projectileKind || "")];
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
}

function enemyProjectileAreaDamageRadius(state, enemy) {
    const wizardHeight = Math.max(1, Number(state?.tuning?.wizardHeight) || Number(state?.player?.height) || 104);
    return Math.max(0, Number(enemy?.projectileAreaDamageRadiusWizardHeights) || 0) * wizardHeight;
}
const FLIGHT_MOVEMENT_SPEED_MULTIPLIER = 1.5;
const HOMING_TARGET_SEARCH_INTERVAL_SECONDS = 0.25;

const PRESENTATION_SNAP_DIAGNOSTICS = {
    sequence: 0,
    total: 0,
    lastReason: "",
    lastSubject: "",
    lastKind: ""
};

function recordPresentationSnap(reason, subject, kind) {
    PRESENTATION_SNAP_DIAGNOSTICS.sequence += 1;
    PRESENTATION_SNAP_DIAGNOSTICS.total += 1;
    PRESENTATION_SNAP_DIAGNOSTICS.lastReason = String(reason || "unspecified");
    PRESENTATION_SNAP_DIAGNOSTICS.lastSubject = String(subject || "subject");
    PRESENTATION_SNAP_DIAGNOSTICS.lastKind = String(kind || "transform");
}

export function readPresentationSnapDiagnostics() {
    return {
        sequence: PRESENTATION_SNAP_DIAGNOSTICS.sequence,
        total: PRESENTATION_SNAP_DIAGNOSTICS.total,
        lastReason: PRESENTATION_SNAP_DIAGNOSTICS.lastReason,
        lastSubject: PRESENTATION_SNAP_DIAGNOSTICS.lastSubject,
        lastKind: PRESENTATION_SNAP_DIAGNOSTICS.lastKind
    };
}

function visitPresentationSubjects(state, callback) {
    if (!state || typeof callback !== "function") return;
    callback(ensureTransformTriplet(state.camera), "camera");
    callback(ensureTransformTriplet(state.player), "player");
    callback(ensureTransformTriplet(state.hat), "hat");
    for (const enemy of state.enemies || []) {
        ensureAnimationClock(enemy);
        callback(ensureTransformTriplet(enemy), `enemy:${enemy.id || "unknown"}`);
    }
    for (const projectile of state.projectiles || []) {
        callback(ensureTransformTriplet(projectile), `projectile:${projectile.id || "unknown"}`);
    }
    for (const visual of state.world?.visuals || []) {
        if (visual?.dynamicPosition) {
            callback(initializeDynamicVisualTransform(visual), `visual:${visual.id || "unknown"}`);
        }
    }
}

export function snapshotSimulationPresentation(state) {
    visitPresentationSubjects(state, (subject) => {
        snapshotTransform(subject);
        snapshotAnimationClock(subject?.animationClock);
    });
    return state;
}

export function preparePresentationFrame(state, blend = 1) {
    const resolvedBlend = clamp(Number(blend) || 0, 0, 1);
    visitPresentationSubjects(state, (subject) => {
        showInterpolatedTransform(subject, resolvedBlend);
        showInterpolatedAnimationClock(subject?.animationClock, resolvedBlend);
    });
    return state;
}

export function snapPresentationSubject(subject, reason = "unspecified", subjectLabel = "subject") {
    const transformSnapped = snapTransformTriplet(subject);
    const animationSnapped = snapAnimationClock(subject?.animationClock);
    if (transformSnapped || animationSnapped) {
        recordPresentationSnap(
            reason,
            subjectLabel,
            transformSnapped && animationSnapped ? "transform+animation" : (transformSnapped ? "transform" : "animation")
        );
    }
    return subject;
}

export function snapPresentationAnimationClock(subject, reason = "animationClock", subjectLabel = "subject") {
    if (snapAnimationClock(subject?.animationClock)) {
        recordPresentationSnap(reason, subjectLabel, "animation");
    }
    return subject;
}

export function snapAllPresentationSubjects(state, reason = "allPresentationSubjects") {
    visitPresentationSubjects(state, (subject, subjectLabel) => snapPresentationSubject(subject, reason, subjectLabel));
    return state;
}

function setCurrentUniformScale(subject, scale) {
    const transform = currentTransformOf(subject);
    const resolved = Math.max(0.0001, Number(scale) || 1);
    transform.scaleX = resolved;
    transform.scaleY = resolved;
    return resolved;
}

export function ordinaryJumpVelocity(gravity, jumpHeight) {
    const resolvedGravity = Math.max(1, Number(gravity) || 1);
    const resolvedHeight = Math.max(1, Number(jumpHeight) || 1);
    return -Math.sqrt(2 * resolvedGravity * resolvedHeight);
}

export function doubleJumpLaunchVelocity(tuning, currentVerticalVelocity) {
    const currentVy = Number(currentVerticalVelocity) || 0;
    if (String(tuning?.doubleJumpPhysics || "consistentApex") !== "consistentApex") {
        const maxDownwardVelocity = Number(tuning?.attachedBoostStartMaxDownwardVelocity) || 0;
        const impulse = Number(tuning?.attachedBoostStartImpulse) || 0;
        return Math.min(currentVy, maxDownwardVelocity) + impulse;
    }
    const jumpSpeed = Math.abs(ordinaryJumpVelocity(tuning?.gravity, tuning?.ordinaryJumpHeight));
    return currentVy < 0
        ? -Math.sqrt(currentVy * currentVy + jumpSpeed * jumpSpeed)
        : -jumpSpeed;
}

const STATIC_ENEMY_NAVIGATION_CACHE = new WeakMap();
const CHARACTER_ENEMY_TRAVERSAL_EDGE_CACHE = new WeakMap();

const WIZARD_DOOR_FLOOR_ANCHOR_Y_FACTOR = 239 / 263;
const DEFAULT_WIZARD_DOOR_INSIDE_SCALE = 0.84;
const ENEMY_COMBAT_STATE = Object.freeze({
    ALIVE: "alive",
    HURT: "hurt",
    ATTACKING: "attacking",
    DEATH_PENDING_LANDING: "death_pending_landing",
    DEAD: "dead"
});

export const DEFAULT_TUNING = Object.freeze({
    timestep: FIXED_DT,
    wizardHeight: 104,
    playerWidth: 34,
    playerHeight: 104,
    gravity: 1490,
    ordinaryJumpHeight: 200,
    terminalVelocity: 2500,
    playerDropThroughGraceSeconds: 0.18,
    fallDamageEnabled: true,
    fallDamageSafeImpactSpeed: 1441,
    fallDamagePerWizardHeight: 10,
    playerFallDamageMultiplier: 0.5,
    playerFallImpactExplosionCooldownSeconds: 5,
    playerFallImpactExplosionDamage: 60,
    jumpVelocity: ordinaryJumpVelocity(1490, 200),
    maxRunSpeed: 360,
    groundAcceleration: 950,
    airAcceleration: 820,
    groundFriction: 900,
    flightVerticalSpeed: 300,
    flightVerticalAcceleration: 900,
    doubleJumpPhysics: "consistentApex",
    landingFriction: 550,
    airDrag: 0.12,
    waterHorizontalSpeedScale: 0.45,
    waterHorizontalAccelerationScale: 0.5,
    waterGravityBuoyancyRatio: 0.92,
    waterSwimAcceleration: 550,
    waterLinearDrag: 2.4,
    waterQuadraticDrag: 0.003,
    waterHorizontalLinearDrag: 2.8,
    waterHorizontalQuadraticDrag: 0.0015,
    attachedBoostAcceleration: -1580,
    attachedBoostStartImpulse: -600,
    attachedBoostKickFuelCost: 5,
    attachedBoostStartMaxDownwardVelocity: 120,
    attachedBoostInitialAcceleration: -3050,
    attachedBoostSustainAcceleration: -1500,
    attachedBoostBurstDuration: 0.5,
    attachedBoostHoverFallSpeed: 36,
    attachedBoostHoverBrakeAcceleration: 3600,
    attachedBoostVisualIdlePower: 0.32,
    attachedBoostKickVisualPower: 1.08,
    attachedBoostSustainVisualPower: 0.36,
    attachedBoostSmokeKickPuffs: 7,
    attachedBoostSmokePuffInterval: 0.035,
    attachedBoostSmokePuffDownSpeed: 700,
    attachedBoostSmokePuffSideSpeed: 42,
    attachedBoostSmokePuffSpeedJitter: 36,
    playerLungeChargeSeconds: 0.5,
    playerFireHoldLungeSeconds: 0.25,
    playerLungeCooldownSeconds: 5,
    playerLungeDistance: 850,
    playerLungeSpeed: 1600,
    playerLungeDamage: 45,
    playerLungeHitboxHeight: 78,
    attachedBoostKickChargeMax: 1,
    attachedBoostKickChargeRechargeRate: 999,
    attachedBoostKickRechargeInstant: true,
    attachedBoostAllowSustainWithoutKickCharge: true,
    attachedBoostMinFuelScale: 0.68,
    attachedBoostFuelPowerCurve: 0.55,
    fuelMax: 100,
    initialFuel: 100,
    baseRechargeCap: 100,
    fuelRechargeRequiresGround: true,
    rechargeDelayAfterUse: 1,
    rechargeRate: 52,
    attachedBoostDrainRate: 40,
    rocketLaunchCost: 30,
    rocketProjectileSpeed: 500,
    rocketProjectileUpLaunchSeconds: 0.32,
    rocketProjectileInitialHomingStrength: 6.42,
    rocketProjectileHomingStrength: 4.8,
    rocketProjectileMaxTravelDistance: 1800,
    rocketProjectileUnwrenchedMaxTravelDistance: 600,
    rocketTargetSearchDistance: 1500,
    rocketLifetimeExplosionOffscreenMargin: 100,
    rocketProjectileExplosionSeconds: 0.24,
    rocketProjectileImpactRadius: 24,
    rocketProjectileDamage: 30,
    flightStandardRocketDamageMultiplier: 0.5,
    standardRocketSecondarySplashDamage: 1,
    standardRocketSecondarySplashRadiusWizardHeights: 1,
    enemyHitFlashSeconds: 0.16,
    enemyHealthBarSeconds: 1.4,
    enemyDefaultHurtSeconds: 0.48,
    enemyDefaultDeathSeconds: 1.18,
    enemyCorpseHoldSeconds: 2,
    enemyCorpseFadeSeconds: 3,
    enemyDefaultRunSpeed: 150,
    meleeEnemyHealthScale: 1,
    meleeEnemyRunSpeedScale: 1,
    meleeEnemyAttackRateScale: 1,
    rangedEnemyHealthScale: 1,
    rangedEnemyRunSpeedScale: 1,
    rangedEnemyAttackRateScale: 1,
    rangedEnemyProjectileSpeedScale: 1,
    enemyDefaultJumpHeight: 118,
    enemyDefaultJumpGravity: 1250,
    enemyDefaultMaxFallDistance: 280,
    enemyDefaultGlareSeconds: 5,
    enemyDefaultRepathSeconds: 0.3,
    enemyDefaultHomeRetrySeconds: 4,
    enemyDefaultAwarenessRange: 300,
    enemyDefaultAwarenessViewHalfAngle: 60,
    enemyDefaultAwarenessHoldSeconds: 1.2,
    enemyDefaultAttackDamage: 24,
    enemyDefaultAttackRange: 66,
    enemyDefaultAttackVerticalRange: 104,
    enemyDefaultAttackDuration: 0.44,
    enemyDefaultAttackHitTime: 0.36,
    enemyDefaultAttackCooldown: 0.12,
    enemyDefaultAttackKnockbackX: 330,
    enemyDefaultAttackKnockbackY: -250,
    enemyDefaultAttackMode: "melee",
    enemyDefaultPreferredAttackRange: 180,
    enemyDefaultProjectileKind: "fireball",
    enemyDefaultProjectileSpeed: 320,
    enemyDefaultProjectileGravity: 0,
    enemyDefaultProjectileLifetime: 4.2,
    enemyDefaultProjectileRadius: 14,
    enemyDefaultProjectileDamage: 18,
    enemyDefaultProjectileCooldown: 0.9,
    enemyDefaultProjectileHomingStrength: 0,
    enemyDefaultProjectileKnockbackX: 180,
    enemyDefaultProjectileKnockbackY: -120,
    playerDamageInvulnerabilitySeconds: 0.45,
    playerContactDamageInvulnerabilitySeconds: 0.45,
    playerContactDamageKnockbackX: 95,
    playerContactDamageKnockbackY: -70,
    playerHitFlashSeconds: 0.24,
    playerCrushConfirmTicks: 3,
    playerCrushClosingDistanceEpsilon: 0.0001,
    playerDeathCoverSeconds: 0.42,
    playerDeathBurstSeconds: 0.72,
    playerDeathAfterglowSeconds: 2,
    playerDeathCoverParticleCount: 102,
    playerDeathBurstParticleCount: 72,
    hazardContactDamage: 20,
    rocketImpactSmokePuffs: 12,
    rocketImpactSmokeLifetime: 0.82,
    reactiveObjectDestructionSmokePuffs: 18,
    rocketSmokePuffLifetime: 1.5,
    rocketSmokePuffSpacing: 3,
    rocketSmokeMaxPuffs: 260,
    rocketSmokePuffScale: 1.5,
    rocketFuelBulbEnabled: true,
    rocketFuelBulbLowThreshold: 25,
    rocketFuelBulbMediumThreshold: 60,
    rocketFuelBulbPulseWhenRecharging: true,
    rocketFuelBulbFlashOnKickRecharge: true,
    rocketFuelBulbScale: 2.4,
    poseBlendSpeed: 14,
    maxHealth: 100,
    lowHealthThreshold: 34,
    healthRegenDelay: 5,
    healthRegenRate: 4,
    maxDebugEvents: 14
});

export const PLAYER_PROGRESSION_SCHEMA_VERSION = 2;
export const PLAYER_UPGRADE_KINDS = Object.freeze({
    HEALTH: "healthUpgrade",
    FUEL: "fuelUpgrade",
    REGEN: "regenUpgrade",
    SPEED: "speedUpgrade"
});
export const PLAYER_UPGRADE_BALANCE = Object.freeze({
    maxScale: 2,
    healthPerLevel: 20,
    fuelPerLevel: 20,
    regenRatePerLevel: 0.15,
    movementSpeedPerLevel: 0.10
});

function normalizedUpgradeLevel(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.max(0, Math.min(999, Math.trunc(numeric))) : 0;
}

function asymptoticUpgradeScale(level, firstGainFraction) {
    const normalizedLevel = normalizedUpgradeLevel(level);
    const maximumScale = Math.max(1, Number(PLAYER_UPGRADE_BALANCE.maxScale) || 2);
    const gainFraction = clamp(Number(firstGainFraction) || 0, 0, 0.999999);
    const remainingFraction = Math.pow(1 - gainFraction, normalizedLevel);
    return clamp(maximumScale - (maximumScale - 1) * remainingFraction, 1, maximumScale);
}

export function normalizePlayerProgression(value = {}) {
    const source = value && typeof value === "object" && !Array.isArray(value)
        ? (value.playerProgression && typeof value.playerProgression === "object" && !Array.isArray(value.playerProgression)
            ? value.playerProgression
            : value)
        : {};
    const collectedUpgradeIds = [...new Set(
        (Array.isArray(source.collectedUpgradeIds) ? source.collectedUpgradeIds : [])
            .map((id) => String(id || "").trim())
            .filter(Boolean)
    )].sort();
    return {
        schemaVersion: PLAYER_PROGRESSION_SCHEMA_VERSION,
        healthLevel: normalizedUpgradeLevel(source.healthLevel),
        fuelLevel: normalizedUpgradeLevel(source.fuelLevel),
        regenLevel: normalizedUpgradeLevel(source.regenLevel),
        speedLevel: normalizedUpgradeLevel(source.speedLevel),
        lungeUnlocked: source.lungeUnlocked === undefined ? true : Boolean(source.lungeUnlocked),
        fallImpactExplosionUnlocked: source.fallImpactExplosionUnlocked === undefined ? true : Boolean(source.fallImpactExplosionUnlocked),
        fallDamageReductionUnlocked: source.fallDamageReductionUnlocked === undefined ? true : Boolean(source.fallDamageReductionUnlocked),
        collectedUpgradeIds
    };
}

export function playerProgressionStats(tuning = DEFAULT_TUNING, progression = {}) {
    const normalized = normalizePlayerProgression(progression);
    const regenScale = 1 + normalized.regenLevel * PLAYER_UPGRADE_BALANCE.regenRatePerLevel;
    const baseMaxHealth = Math.max(1, Number(tuning.maxHealth) || DEFAULT_TUNING.maxHealth);
    const healthFirstGainFraction = PLAYER_UPGRADE_BALANCE.healthPerLevel / baseMaxHealth;
    const movementSpeedScale = asymptoticUpgradeScale(normalized.speedLevel, PLAYER_UPGRADE_BALANCE.movementSpeedPerLevel);
    const maxHealth = baseMaxHealth * asymptoticUpgradeScale(normalized.healthLevel, healthFirstGainFraction);
    const maxFuel = Math.max(1, Number(tuning.fuelMax) || DEFAULT_TUNING.fuelMax)
        + normalized.fuelLevel * PLAYER_UPGRADE_BALANCE.fuelPerLevel;
    const rechargeCap = Math.max(0, Number(tuning.baseRechargeCap) || 0)
        + normalized.fuelLevel * PLAYER_UPGRADE_BALANCE.fuelPerLevel;
    return {
        maxHealth,
        maxFuel,
        rechargeCap: Math.min(maxFuel, rechargeCap),
        healthRegenRate: Math.max(0, Number(tuning.healthRegenRate) || 0) * regenScale,
        fuelRechargeRate: Math.max(0, Number(tuning.rechargeRate) || 0) * regenScale,
        movementSpeedScale,
        healthLevel: normalized.healthLevel,
        fuelLevel: normalized.fuelLevel,
        regenLevel: normalized.regenLevel,
        speedLevel: normalized.speedLevel
    };
}

export function applyPlayerProgression(state, progression = state?.playerProgression, {
    refillResources = false,
    addCapacityToCurrent = false
} = {}) {
    if (!state || typeof state !== "object") return null;
    const previousHealthMax = Math.max(0, Number(state.health?.max) || 0);
    const previousFuelMax = Math.max(0, Number(state.fuel?.max) || 0);
    const normalized = normalizePlayerProgression(progression);
    const stats = playerProgressionStats(state.tuning || DEFAULT_TUNING, normalized);
    state.playerProgression = normalized;
    state.playerStats = stats;
    state.health = state.health || {};
    state.fuel = state.fuel || {};
    state.health.max = stats.maxHealth;
    state.fuel.max = stats.maxFuel;
    state.fuel.rechargeCap = stats.rechargeCap;
    if (refillResources) {
        state.health.amount = stats.maxHealth;
        state.fuel.amount = stats.maxFuel;
    } else if (addCapacityToCurrent) {
        state.health.amount = Math.min(stats.maxHealth, Math.max(0, Number(state.health.amount) || 0) + Math.max(0, stats.maxHealth - previousHealthMax));
        state.fuel.amount = Math.min(stats.maxFuel, Math.max(0, Number(state.fuel.amount) || 0) + Math.max(0, stats.maxFuel - previousFuelMax));
    } else {
        state.health.amount = Math.min(stats.maxHealth, Math.max(0, Number(state.health.amount) || 0));
        state.fuel.amount = Math.min(stats.maxFuel, Math.max(0, Number(state.fuel.amount) || 0));
    }
    return stats;
}

function playerProgressionLevel(state, property) {
    return normalizedUpgradeLevel(state?.playerProgression?.[property]);
}

function effectiveHealthRegenRate(state) {
    return Math.max(0, Number(state?.tuning?.healthRegenRate) || 0)
        * (1 + playerProgressionLevel(state, "regenLevel") * PLAYER_UPGRADE_BALANCE.regenRatePerLevel);
}

function effectiveFuelRechargeRate(state) {
    return Math.max(0, Number(state?.tuning?.rechargeRate) || 0)
        * (1 + playerProgressionLevel(state, "regenLevel") * PLAYER_UPGRADE_BALANCE.regenRatePerLevel);
}

function playerMovementSpeedScale(state) {
    return asymptoticUpgradeScale(
        playerProgressionLevel(state, "speedLevel"),
        PLAYER_UPGRADE_BALANCE.movementSpeedPerLevel
    );
}

function normalizedPlayerUpgradeKind(value) {
    const kind = String(value || "").trim();
    return Object.values(PLAYER_UPGRADE_KINDS).includes(kind) ? kind : "";
}

export function playerUpgradeMessage(upgradeKind) {
    const kind = normalizedPlayerUpgradeKind(upgradeKind);
    if (kind === PLAYER_UPGRADE_KINDS.HEALTH) return "Max health upgraded!";
    if (kind === PLAYER_UPGRADE_KINDS.FUEL) return "Max fuel upgraded!";
    if (kind === PLAYER_UPGRADE_KINDS.REGEN) return "Regeneration upgraded!";
    if (kind === PLAYER_UPGRADE_KINDS.SPEED) return "Speed has been upgraded!";
    return "";
}

export function requestScreenMessage(state, message, detail = {}) {
    const text = String(message || "").trim();
    if (!state || !text) return null;
    return addEvent(state, "SCREEN_MESSAGE_REQUESTED", {
        message: text,
        messageKind: String(detail.messageKind || detail.kind || "notice").trim() || "notice",
        sourceId: detail.sourceId || null,
        duration: Math.max(0.5, Number(detail.duration) || 2.6)
    });
}

export function playerUpgradeCollectionId(levelId, pickupId) {
    const normalizedLevelId = String(levelId || "").trim() || "unknown_level";
    const normalizedPickupId = String(pickupId || "").trim();
    return normalizedPickupId ? `${normalizedLevelId}:${normalizedPickupId}` : "";
}

export function collectPlayerUpgrade(state, upgradeKind, pickupId = "") {
    const kind = normalizedPlayerUpgradeKind(upgradeKind);
    if (!state || !kind) return false;
    const normalized = normalizePlayerProgression(state.playerProgression);
    const stablePickupId = String(pickupId || "").trim();
    const collectionId = playerUpgradeCollectionId(state.world?.levelId, stablePickupId);
    if (collectionId && normalized.collectedUpgradeIds.includes(collectionId)) return false;
    const levelProperty = kind === PLAYER_UPGRADE_KINDS.HEALTH
        ? "healthLevel"
        : kind === PLAYER_UPGRADE_KINDS.FUEL
            ? "fuelLevel"
            : kind === PLAYER_UPGRADE_KINDS.REGEN
                ? "regenLevel"
                : "speedLevel";
    normalized[levelProperty] = normalizedUpgradeLevel(normalized[levelProperty] + 1);
    if (collectionId) normalized.collectedUpgradeIds = [...normalized.collectedUpgradeIds, collectionId].sort();
    const stats = applyPlayerProgression(state, normalized, { addCapacityToCurrent: true });
    const message = playerUpgradeMessage(kind);
    addEvent(state, "PLAYER_UPGRADE_COLLECTED", {
        pickupId: stablePickupId || null,
        collectionId: collectionId || null,
        upgradeKind: kind,
        message,
        healthLevel: normalized.healthLevel,
        fuelLevel: normalized.fuelLevel,
        regenLevel: normalized.regenLevel,
        speedLevel: normalized.speedLevel,
        maxHealth: round(stats.maxHealth),
        maxFuel: round(stats.maxFuel),
        healthRegenRate: round(stats.healthRegenRate),
        fuelRechargeRate: round(stats.fuelRechargeRate),
        movementSpeedScale: round(stats.movementSpeedScale)
    });
    requestScreenMessage(state, message, {
        sourceId: stablePickupId || collectionId || kind,
        messageKind: "permanentUpgrade",
        duration: 2.8
    });
    return true;
}

export function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

export function createInputFrame(overrides = {}) {
    return {
        moveLeft: false,
        moveRight: false,
        moveAxis: 0,
        jumpPressed: false,
        jumpHeld: false,
        jumpReleased: false,
        boostPressed: false,
        boostHeld: false,
        boostReleased: false,
        lungePressed: false,
        lungeHeld: false,
        lungeReleased: false,
        weaponPressed: false,
        weaponHeld: false,
        weaponReleased: false,
        interactPressed: false,
        interactHeld: false,
        interactReleased: false,
        dropPressed: false,
        dropHeld: false,
        dropReleased: false,
        aimVector: { x: 1, y: 0 },
        aimTarget: null,
        pausePressed: false,
        stepPressed: false,
        resetPressed: false,
        toggleHitboxesPressed: false,
        toggleVelocityPressed: false,
        toggleCollisionPressed: false,
        exportStatePressed: false,
        toggleInputConsoleLogPressed: false,
        toggleDebugPanelPressed: false,
        ...overrides
    };
}

function cloneInputFrameForDebug(inputFrame) {
    const input = createInputFrame(inputFrame || {});
    input.aimVector = {
        x: Number(input.aimVector?.x) || 0,
        y: Number(input.aimVector?.y) || 0
    };
    input.aimTarget = input.aimTarget
        ? { x: Number(input.aimTarget.x) || 0, y: Number(input.aimTarget.y) || 0 }
        : null;
    return input;
}

export function createSubstepInputFrame(inputFrame, substepIndex = 0) {
    const input = createInputFrame(inputFrame || {});
    if (substepIndex <= 0) {
        return input;
    }

    // Held states continue across catch-up sim steps, but edge-triggered presses/releases
    // must only be consumed by the first fixed step for a browser frame. Otherwise a slow
    // render frame can turn one physical Up press into jump on substep 0 and boost on substep 1.
    return createInputFrame({
        moveLeft: input.moveLeft,
        moveRight: input.moveRight,
        moveAxis: input.moveAxis,
        jumpHeld: input.jumpHeld,
        boostHeld: input.boostHeld,
        lungeHeld: input.lungeHeld,
        weaponHeld: input.weaponHeld,
        interactHeld: input.interactHeld,
        dropHeld: input.dropHeld,
        aimVector: input.aimVector,
        aimTarget: input.aimTarget
    });
}

export function createInitialGameState(overrides = {}) {
    const tuning = deepClone(DEFAULT_TUNING);
    if (overrides.tuning) {
        Object.assign(tuning, overrides.tuning);
    }
    tuning.ordinaryJumpHeight = Math.max(1, Number(tuning.ordinaryJumpHeight) || DEFAULT_TUNING.ordinaryJumpHeight);
    tuning.jumpVelocity = ordinaryJumpVelocity(tuning.gravity, tuning.ordinaryJumpHeight);

    const world = createTestArena(tuning);
    const spawn = overrides.spawn || world.start || { x: 120, y: 600 };
    const settings = normalizeGameSettings(overrides.settings);
    const playerProgression = normalizePlayerProgression(overrides.playerProgression || overrides.progression);
    const playerStats = playerProgressionStats(tuning, playerProgression);

    const state = {
        meta: {
            schemaVersion: 1,
            build: "248-test-runner-diagnostics",
            note: "Gameplay state only. Browser, canvas, image and renderer resources are deliberately outside gameState."
        },
        clock: {
            tick: 0,
            time: 0,
            fixedDt: tuning.timestep
        },
        random: {
            seed: (Math.floor(Number(overrides.randomSeed)) >>> 0) || 0x1a2b3c4d,
            levelLoadCount: 0
        },
        tuning,
        settings,
        playerProgression,
        playerStats,
        enemyCatalog: normalizeEnemyDefinitionCatalog(overrides.enemyCatalog),
        lootCatalog: normalizeLootCatalog(overrides.lootCatalog),
        characterCombatProfiles: {},
        characterDropProfiles: {},
        world,
        camera: {
            ...createTransformTriplet({ x: spawn.x, y: spawn.y - 170 }),
            zoom: 1,
            mode: "follow",
            viewportWidth: 1280,
            viewportHeight: 720,
            guideDirection: 0,
            guideAlongSpeed: 0,
            guideLastAlong: 0,
            guideLastAlongValid: false,
            guideNearest: null,
            guideLookAhead: null,
            guideNominalOffsetY: -170
        },
        player: {
            id: "ignatius",
            ...createTransformTriplet({
                x: (spawn || world.start || { x: 120, y: 600 }).x,
                y: (spawn || world.start || { x: 120, y: 600 }).y,
                scaleX: 1,
                scaleY: 1,
                alpha: 1
            }),
            spawnX: spawn.x,
            spawnY: spawn.y,
            vx: 0,
            vy: 0,
            ax: 0,
            ay: 0,
            width: tuning.playerWidth,
            height: tuning.playerHeight,
            facing: 1,
            onGround: false,
            wasOnGround: false,
            airborneTime: 0,
            coyoteTimer: 0,
            airBoostArmed: false,
            lungeCharging: false,
            lungeActive: false,
            lungeChargeTime: 0,
            lungeHoldPending: false,
            fireHoldLungePending: false,
            fireHoldLungeTime: 0,
            lungeChargeUsesFire: false,
            lungeCooldownTimer: 0,
            lungeDistanceRemaining: 0,
            lungeDirection: 1,
            lungeSequence: 0,
            lungeHitEnemyIds: [],
            fallImpactExplosionCooldownTimer: 0,
            bodySlamCommitted: false,
            bodySlamImmunityTimer: 0,
            ordinaryJumpActive: false,
            ordinaryJumpStartY: null,
            ordinaryJumpApexY: null,
            lowHealthPulse: 0,
            visible: true,
            supportId: null,
            groundStride: null,
            dropThroughTimer: 0,
            inWater: false,
            waterSubmersion: 0,
            waterRegionId: null,
            crushCandidateTicks: 0,
            crushCandidateKey: null,
            crushCandidateDetail: null,
            combatState: "alive",
            targetable: true,
            deathPhase: "none",
            deathPhaseTimer: 0,
            deathElapsed: 0,
            deathSourceId: null,
            deathResetReason: null
        },
        fuel: {
            amount: playerStats.maxFuel,
            max: playerStats.maxFuel,
            rechargeCap: playerStats.rechargeCap,
            rechargeDelayTimer: 0,
            rechargeLatched: false,
            lastUsedAt: null
        },
        health: {
            amount: playerStats.maxHealth,
            max: playerStats.maxHealth,
            lastDamagedAt: null,
            invulnerabilityTimer: 0,
            contactInvulnerabilityTimer: 0,
            regenerating: false,
            low: false
        },
        score: 0,
        equipment: {
            mounted: "rocket",
            rocket: {
                state: "mountedReady",
                attachedBoosting: false,
                attachedBoostTime: 0,
                boostKickCharge: tuning.attachedBoostKickChargeMax,
                boostBurstTimer: 0,
                boostAccelerationNow: 0,
                boostVisualPowerNow: 0,
                attachedSmokeTimer: 0,
                lastBoostStartTick: null,
                lastBoostEndTick: null,
                fuelBulbFlashTimer: 0
            },
            weaponInputVisibleOnly: false
        },
        hat: {
            state: "worn",
            ...createTransformTriplet({ x: spawn.x, y: spawn.y - tuning.playerHeight }),
            vx: 0,
            vy: 0
        },
        weapons: {
            current: "rocket",
            nextProjectileId: 1,
        },
        projectiles: [],
        reactiveObjects: [],
        treasureChests: [],
        effects: {
            nextPuffId: 1,
            smokePuffs: []
        },
        targets: [],
        enemies: [],
        pickups: [
            { id: "fuel_001", entityId: "fuel_001", kind: "fuel", pickupKind: "fuel", x: 835, y: 315, radius: 14, amount: 40, collected: false },
            { id: "fuel_002", entityId: "fuel_002", kind: "fuel", pickupKind: "fuel", x: 3070, y: 115, radius: 14, amount: 40, collected: false }
        ],
        inventory: {
            items: {}
        },
        statusEffects: {
            active: {}
        },
        collisions: {
            playerTouching: { left: false, right: false, up: false, down: false },
            lastResolution: null
        },
        story: {
            levelTitle: "Ignatius Rocketfrock and the Gallery of Sensibly Spaced Ledges",
            portalIntro: null,
            portalExit: null,
            mailboxEvent: null,
            mailboxEvents: [],
            cutscene: null,
            cutsceneScripts: [],
            symbolTriggers: [],
            overheadSymbol: null,
            proximityTexts: [],
            levelTransitionRequest: null
        },
        debug: {
            paused: false,
            showHitboxes: false,
            showVelocity: false,
            showCollision: false,
            showAssetGuides: false,
            showCameraLine: false,
            showPuppetGuide: false,
            showInput: true,
            eventFilterText: "-FUEL_CHANGED",
            eventFilterIncludeInput: false,
            inputConsoleLogging: false,
            lastEvents: [],
            exceptionAlertSequence: 0,
            exceptionAlerts: [],
            lastInputFrame: createInputFrame(),
            exportedAt: null
        }
    };

    state.enemies = [
        createCharacterEnemyRuntime(state, {
            id: "enemy_900_001",
            type: "characterEnemy",
            enemyCatalogId: "enemy_900",
            characterId: "ct_char_enemy_900",
            x: 1750,
            y: 580,
            strategy: "passive",
            facing: -1,
            patrolDistance: 0,
            walkSpeed: 0,
            runSpeed: 0,
            idleDuration: 1,
            turnPause: 0,
            health: 90,
            scale: 1,
            attackDamage: 0,
            attackRange: 0,
            attackCooldown: 0,
            awarenessRange: 0,
            awarenessHoldDuration: 0,
            awarenessViewHalfAngle: 0,
            jumpHeight: 0,
            unreachableGlareDuration: 0,
            targetAnchor: { x: 0.5, y: 0.5 },
            targetRadius: 16,
            showTargetMarker: false
        }, 0),
        createCharacterEnemyRuntime(state, {
            id: "enemy_900_002",
            type: "characterEnemy",
            enemyCatalogId: "enemy_900",
            characterId: "ct_char_enemy_900",
            x: 3660,
            y: 580,
            strategy: "passive",
            facing: -1,
            patrolDistance: 0,
            walkSpeed: 0,
            runSpeed: 0,
            idleDuration: 1,
            turnPause: 0,
            health: 90,
            scale: 1,
            attackDamage: 0,
            attackRange: 0,
            attackCooldown: 0,
            awarenessRange: 0,
            awarenessHoldDuration: 0,
            awarenessViewHalfAngle: 0,
            jumpHeight: 0,
            unreachableGlareDuration: 0,
            targetAnchor: { x: 0.5, y: 0.5 },
            targetRadius: 16,
            showTargetMarker: false
        }, 1)
    ];

    addEvent(state, "TEST_ARENA_CREATED", { solids: state.world.solids.length, segments: state.world.segments?.length ?? 0 });
    return state;
}

export function applyEnemyDefinitionCatalog(state, catalog) {
    if (!state || typeof state !== "object") return false;
    state.enemyCatalog = normalizeEnemyDefinitionCatalog(catalog);
    return Object.keys(state.enemyCatalog.enemies).length > 0;
}

function createTestArena(tuning) {
    // This is a compact headless-test fixture, not the browser game's authored level.
    // Browser play loads resources/levels/level_001.json and replaces this world before play.
    // Keep this arena deliberately small: tests need a floor at y=600,
    // a valid atlas visual for optional manifest-collision checks, and a little room
    // for run/jump/rocket mechanics.
    const atlasId = "at_atlas_001";
    const solids = [
        { id: "test_floor", kind: "floor", x: -260, y: 600, w: 2620, h: 110 }
    ];
    const visuals = [
        {
            id: "test_floor_art",
            kind: "atlasSprite",
            atlasId,
            assetId: "floor_cold_platform",
            frame: "floor_cold_platform",
            x: -260,
            y: 600,
            w: 2620,
            h: 110,
            layer: "terrain",
            collisionFromManifest: false,
            note: "Visual marker for the headless test arena. Authored gameplay levels come from resources/levels/level_001.json."
        }
    ];

    return {
        levelId: "headless_test_arena",
        gravityDirection: { x: 0, y: 1 },
        bounds: { x: -360, y: -520, w: 2820, h: 1580 },
        start: { x: 135, y: 520 },
        atlasManifests: [
            "atlases/at_atlas_001.json"
        ],
        visuals,
        movingPlatforms: [],
        signalChannels: {},
        signalEmitters: [],
        signalReceivers: [],
        layerVisuals: normalizeLevelLayerVisuals(null),
        caveWindow: normalizeCaveWindow(null),
        caveKillBoundary: deriveCaveFullBlackKillBoundary(null),
        cameraLine: normalizeCameraLine(null),
        solids,
        segments: [],
        collisionMode: "fallbackRectangles",
        labels: [
            { text: "headless test arena", x: 20, y: 555 },
            { text: "browser play loads resources/levels/level_001.json", x: 520, y: 555 }
        ]
    };
}

export function applyAtlasManifestsToWorld(state, environmentManifests) {
    if (!state?.world || !environmentManifests || typeof environmentManifests.get !== "function") {
        return false;
    }

    const segments = [];
    const polygons = [];
    const visuals = Array.isArray(state.world.visuals) ? state.world.visuals : [];
    for (const visual of visuals) {
        if (visual.kind !== "atlasSprite") {
            continue;
        }

        const atlasRecord = environmentManifests.get(visual.atlasId);
        const manifest = atlasRecord?.manifest || atlasRecord;
        if (!manifest?.objects || !manifest?.frames) {
            continue;
        }

        const assetId = visual.assetId || visual.frame;
        const frameName = visual.frame || assetId;
        const object = manifest.objects[assetId] || manifest.objects[frameName];
        const frame = manifest.frames[frameName] || manifest.frames[assetId];
        if (!object || !frame) {
            continue;
        }

        visual.blendMode = object.blendMode === "brightenOnly" ? "brightenOnly" : "alpha";
        if (visual.collisionFromManifest === false || visual.layer === CAVE_FOREGROUND_LAYER_ID || (visual.layer === BACKGROUND_LAYER && !visual.entityId)) {
            continue;
        }
        if (!Array.isArray(object.nodes) || !Array.isArray(object.lines)) {
            continue;
        }

        const nodeById = new Map(object.nodes.map((node) => [node.id, node]));
        for (const line of object.lines) {
            if (!isSolidSegmentKind(line.kind)) {
                continue;
            }

            const a = nodeById.get(line.from);
            const b = nodeById.get(line.to);
            if (!a || !b) {
                continue;
            }

            const p1 = atlasNodeToWorld(visual, frame, a);
            const p2 = atlasNodeToWorld(visual, frame, b);
            if (Math.hypot(p2.x - p1.x, p2.y - p1.y) < 1) {
                continue;
            }

            segments.push({
                id: `${visual.id || assetId}_${line.id || segments.length}`,
                kind: line.kind,
                x1: p1.x,
                y1: p1.y,
                x2: p2.x,
                y2: p2.y,
                visualId: visual.id,
                movingPlatformId: visual.movement ? visual.id : undefined,
                atlasId: visual.atlasId,
                assetId,
                lineId: line.id,
                tags: Array.isArray(line.tags) ? line.tags.slice() : []
            });
        }

        const collisionLoops = findClosedCollisionLoops(object);
        for (const loop of collisionLoops) {
            const points = loop.points
                .map((point) => atlasNodeToWorld(visual, frame, point))
                .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
            if (points.length < 3 || Math.abs(polygonArea(points)) < 4) {
                continue;
            }
            polygons.push({
                id: `${visual.id || assetId}_area_${polygons.length}`,
                kind: loop.kind,
                points,
                visualId: visual.id,
                movingPlatformId: visual.movement ? visual.id : undefined,
                atlasId: visual.atlasId,
                assetId,
                lineIds: loop.lineIds.slice()
            });
        }
    }

    if (!segments.length && !polygons.length) {
        state.world.collisionMode = "fallbackRectangles";
        state.world.collisionSegmentCount = 0;
        state.world.collisionPolygonCount = 0;
        state.world.collisionPolygons = [];
        return false;
    }

    state.world.segments = segments;
    state.world.collisionPolygons = polygons;
    bindMovingPlatformCollision(state, segments, polygons);
    state.world.solids = (state.world.solids || []).filter((solid) => solid.kind === "wall" || solid.reactiveObjectId || solid.signalReceiverId);
    state.world.collisionMode = polygons.length ? "atlasSegmentsAndAreas" : "atlasSegments";
    state.world.collisionSegmentCount = segments.length;
    state.world.collisionPolygonCount = polygons.length;
    let startSnap = null;
    let doorSnaps = [];
    let enemySnaps = [];
    if (!state.world.playerStartGroundSnapResolved) {
        state.world.playerStartGroundSnapResolved = true;
        doorSnaps = snapWizardDoorsToNearbyGround(state);
        enemySnaps = snapCharacterEnemiesToNearbyGround(state);
        const entryDoor = wizardEntryPortalEntity(state.world.entities || []);
        if (entryDoor) {
            applyEntryPortalAsPlayerStart(state, entryDoor, { resetPlayer: true });
            startSnap = snapPlayerStartToNearbyGround(state);
            configurePortalIntro(state, state.world.entities || []);
            configurePortalExit(state, state.world.entities || []);
        } else {
            startSnap = snapPlayerStartToNearbyGround(state);
        }
    }
    addEvent(state, "ATLAS_COLLISION_APPLIED", {
        segments: segments.length,
        polygons: polygons.length,
        playerStartSnapped: Boolean(startSnap),
        wizardDoorsSnapped: doorSnaps.length,
        characterEnemiesSnapped: enemySnaps.length
    });
    return true;
}

export function snapPlayerStartToNearbyGround(state, maxDistance = null) {
    const start = state?.world?.start;
    if (!start || !Number.isFinite(Number(start.x)) || !Number.isFinite(Number(start.y))) {
        return null;
    }

    const playerWidth = Math.max(1, Number(state.player?.width) || Number(state.tuning?.playerWidth) || DEFAULT_TUNING.playerWidth);
    const wizardHeight = Math.max(1, Number(state.player?.height) || Number(state.tuning?.wizardHeight) || DEFAULT_TUNING.wizardHeight);
    const requestedLimit = maxDistance === null || maxDistance === undefined ? wizardHeight * 0.5 : Number(maxDistance);
    const limit = Math.max(0, Number.isFinite(requestedLimit) ? requestedLimit : wizardHeight * 0.5);
    const startX = Number(start.x);
    const startY = Number(start.y);
    const samples = [startX, startX - playerWidth * 0.42, startX + playerWidth * 0.42];
    let best = null;

    const supportQueryBounds = {
        minX: Math.min(...samples) - 2,
        minY: startY - limit - 2,
        maxX: Math.max(...samples) + 2,
        maxY: startY + limit + 2
    };
    for (const segment of queryWorldSegments(state.world, supportQueryBounds)) {
        if (!isSolidSegmentKind(segment.kind)) {
            continue;
        }
        if (Math.abs(Number(segment.x2) - Number(segment.x1)) < 0.001) {
            continue;
        }
        for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
            const y = segmentYAtX(segment, samples[sampleIndex]);
            if (y === null) {
                continue;
            }
            const delta = y - startY;
            if (Math.abs(delta) > limit) {
                continue;
            }
            if (!groundSupportHasBodyClearance(state, startX, y, playerWidth, wizardHeight, (Number(segment.y2) - Number(segment.y1)) / (Number(segment.x2) - Number(segment.x1)), segment.id)) {
                continue;
            }
            const score = Math.abs(delta) + sampleIndex * 0.001;
            if (!best || score < best.score) {
                best = { y, delta, score, segment, sampleX: samples[sampleIndex] };
            }
        }
    }

    if (!best) {
        return null;
    }

    start.y = best.y;
    if (state.player) {
        state.player.currentTransform.y = best.y;
        state.player.spawnY = best.y;
        state.player.vy = 0;
        state.player.onGround = true;
        state.player.wasOnGround = true;
        state.player.airBoostArmed = true;
    }
    const intro = state.story?.portalIntro;
    if (intro) {
        intro.groundY = best.y;
    }
    addEvent(state, "PLAYER_START_SNAPPED_TO_GROUND", {
        fromY: round(startY),
        toY: round(best.y),
        delta: round(best.delta),
        segmentId: best.segment.id,
        kind: best.segment.kind
    });
    return {
        fromY: startY,
        y: best.y,
        delta: best.delta,
        segmentId: best.segment.id,
        kind: best.segment.kind,
        sampleX: best.sampleX
    };
}

function atlasNodeToWorld(visual, frame, node) {
    return atlasNodeToPlacementWorld(visual, frame, node);
}


function findClosedCollisionLoops(object) {
    if (!object || !Array.isArray(object.nodes) || !Array.isArray(object.lines)) {
        return [];
    }

    const nodeById = new Map(object.nodes.map((node) => [node.id, node]));
    const waterLines = object.lines.filter((line) => line.kind === "water" && nodeById.has(line.from) && nodeById.has(line.to));
    const waterLoops = findClosedLoopsFromLines(waterLines, nodeById);
    const blockerLines = object.lines.filter((line) => isAreaBlockingSegmentKind(line.kind) && nodeById.has(line.from) && nodeById.has(line.to));
    const blockerLoops = findClosedLoopsFromLines(blockerLines, nodeById);
    if (blockerLoops.length) {
        return [...blockerLoops, ...waterLoops];
    }

    const solidLines = object.lines.filter((line) => isSolidSegmentKind(line.kind) && nodeById.has(line.from) && nodeById.has(line.to));
    const fallbackBlockers = findClosedLoopsFromLines(solidLines, nodeById)
        .filter((loop) => loop.lines.some((line) => isAreaBlockingSegmentKind(line.kind)));
    return [...fallbackBlockers, ...waterLoops];
}

function findClosedLoopsFromLines(lines, nodeById) {
    const components = collectLineComponents(lines);
    const loops = [];

    for (const component of components) {
        if (component.length < 3) {
            continue;
        }
        const degree = new Map();
        for (const line of component) {
            degree.set(line.from, (degree.get(line.from) || 0) + 1);
            degree.set(line.to, (degree.get(line.to) || 0) + 1);
        }
        if ([...degree.values()].some((count) => count !== 2)) {
            continue;
        }

        const ordered = orderClosedLineLoop(component, nodeById);
        if (!ordered || ordered.points.length < 3) {
            continue;
        }
        const area = polygonArea(ordered.points);
        if (Math.abs(area) < 4) {
            continue;
        }
        loops.push({
            kind: collisionLoopKind(component),
            points: area < 0 ? ordered.points.slice().reverse() : ordered.points,
            lineIds: component.map((line) => line.id || ""),
            lines: component
        });
    }

    return loops;
}

function collectLineComponents(lines) {
    const byNode = new Map();
    for (const line of lines) {
        if (!byNode.has(line.from)) byNode.set(line.from, []);
        if (!byNode.has(line.to)) byNode.set(line.to, []);
        byNode.get(line.from).push(line);
        byNode.get(line.to).push(line);
    }

    const components = [];
    const seen = new Set();
    for (const line of lines) {
        const lineKey = line.id || `${line.from}->${line.to}`;
        if (seen.has(lineKey)) {
            continue;
        }
        const stack = [line];
        const component = [];
        while (stack.length) {
            const current = stack.pop();
            const key = current.id || `${current.from}->${current.to}`;
            if (seen.has(key)) {
                continue;
            }
            seen.add(key);
            component.push(current);
            for (const nodeId of [current.from, current.to]) {
                for (const next of byNode.get(nodeId) || []) {
                    const nextKey = next.id || `${next.from}->${next.to}`;
                    if (!seen.has(nextKey)) {
                        stack.push(next);
                    }
                }
            }
        }
        components.push(component);
    }
    return components;
}

function orderClosedLineLoop(lines, nodeById) {
    const adjacency = new Map();
    for (const line of lines) {
        if (!adjacency.has(line.from)) adjacency.set(line.from, []);
        if (!adjacency.has(line.to)) adjacency.set(line.to, []);
        adjacency.get(line.from).push({ to: line.to, line });
        adjacency.get(line.to).push({ to: line.from, line });
    }

    const start = lines[0].from;
    let current = start;
    let previous = null;
    const used = new Set();
    const points = [];

    for (let guard = 0; guard < lines.length + 2; guard += 1) {
        const node = nodeById.get(current);
        if (!node) {
            return null;
        }
        points.push({ x: node.x, y: node.y });
        const candidates = adjacency.get(current) || [];
        const nextEdge = candidates.find((candidate) => {
            const key = candidate.line.id || `${candidate.line.from}->${candidate.line.to}`;
            return candidate.to !== previous && !used.has(key);
        }) || candidates.find((candidate) => {
            const key = candidate.line.id || `${candidate.line.from}->${candidate.line.to}`;
            return !used.has(key);
        });
        if (!nextEdge) {
            return null;
        }
        const key = nextEdge.line.id || `${nextEdge.line.from}->${nextEdge.line.to}`;
        used.add(key);
        previous = current;
        current = nextEdge.to;
        if (current === start) {
            return used.size === lines.length ? { points } : null;
        }
    }

    return null;
}

function collisionLoopKind(lines) {
    if (lines.some((line) => line.kind === "water")) return "water";
    if (lines.some((line) => line.kind === "killable")) return "killable";
    if (lines.some((line) => line.kind === "damaging")) return "damaging";
    return "blockable";
}

function polygonArea(points) {
    let area = 0;
    for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        area += a.x * b.y - b.x * a.y;
    }
    return area * 0.5;
}


function normalizeAtlasManifestPath(path) {
    return String(path || "");
}

function normalizeAtlasId(atlasId) {
    return String(atlasId || "");
}

function editorEntityVisuals(entity) {
    if (!entity || typeof entity !== "object") return [];
    const states = entity.visualStates && typeof entity.visualStates === "object" ? entity.visualStates : null;
    const selected = states ? states[entity.state] || states[Object.keys(states)[0]] : null;
    if (Array.isArray(selected)) return selected;
    if (Array.isArray(selected?.visuals)) return selected.visuals;
    return [];
}

const PICKUP_ENTITY_TYPES = new Set([
    "fuel",
    "fuelPickup",
    "overdrivePickup",
    "shieldPickup",
    "wrenchPickup",
    "randomWrenchPickup",
    "ornateKeyPickup",
    "ironKeyPickup",
    "magicRingPickup",
    PLAYER_UPGRADE_KINDS.HEALTH,
    PLAYER_UPGRADE_KINDS.FUEL,
    PLAYER_UPGRADE_KINDS.REGEN,
    PLAYER_UPGRADE_KINDS.SPEED,
    "pickup"
]);

function isPickupEntity(entity) {
    if (!entity || typeof entity !== "object") return false;
    return Boolean(entity.pickupKind)
        || Boolean(entity.effectId)
        || Array.isArray(entity.randomEffectIds)
        || PICKUP_ENTITY_TYPES.has(String(entity.type || ""));
}

function checkpointRuneLike(entity) {
    if (!entity || typeof entity !== "object") return false;
    return String(entity.type || "") === "checkpointRune" || String(entity.interaction || "") === "checkpoint";
}

function checkpointVisualAssetId(entity, visual, stateName) {
    const assetId = String(visual?.assetId || "");
    if (checkpointRuneLike(entity) && stateName === "inactive" && assetId === "rune_marker") {
        return "rune_marker_inactive";
    }
    return assetId;
}

function editorEntityVisualToWorld(entity, visual, index, stateName = entity.state || "") {
    const baseW = Math.max(1, Number(entity.w) || 42);
    const baseH = Math.max(1, Number(entity.h) || 80);
    const widthFactor = Number(visual.widthFactor ?? 1) || 1;
    const heightFactor = Number(visual.heightFactor ?? 1) || 1;
    const w = Math.max(1, baseW * widthFactor);
    const h = Math.max(1, baseH * heightFactor);
    const direction = entity.mirrorX ? -1 : 1;
    const offsetX = ((Number(visual.offsetX) || 0) + (Number(visual.offsetXFactor) || 0) * baseW) * direction;
    const offsetY = (Number(visual.offsetY) || 0) + (Number(visual.offsetYFactor) || 0) * baseH;
    const floorAnchorYFactor = entityFloorAnchorYFactor(entity);
    return {
        id: `${entity.id || entity.type || "entity"}_${stateName || "default"}_visual_${index + 1}`,
        kind: "atlasSprite",
        atlasId: normalizeAtlasId(visual.atlasId || "it_atlas_001"),
        assetId: checkpointVisualAssetId(entity, visual, stateName),
        frame: checkpointVisualAssetId(entity, visual, stateName),
        x: (Number(entity.x) || 0) + offsetX - w * 0.5,
        y: (Number(entity.y) || 0) + offsetY - h * floorAnchorYFactor,
        w,
        h,
        mirrorX: Boolean(entity.mirrorX) !== Boolean(visual.mirrorX),
        mirrorY: Boolean(entity.mirrorY) !== Boolean(visual.mirrorY),
        rotation: normalizeRotationRadians(visual.rotation) + normalizeRotationRadians(entity.rotation),
        alpha: Number(visual.alpha ?? 1),
        layer: visual.layer || "decorFront",
        collisionFromManifest: entity.collisionFromManifest !== false && visual.collisionFromManifest !== false,
        entityId: entity.id || "",
        entityType: entity.type || "",
        entityState: stateName || "",
        pickupPresentation: isPickupEntity(entity)
    };
}

function worldEntityById(state, entityId) {
    return (state.world?.entities || []).find((entity) => entity.id === entityId) || null;
}

const ENTITY_VISUAL_CACHE_TOPOLOGY_FIELDS = Object.freeze([
    "kind",
    "atlasId",
    "x",
    "y",
    "w",
    "h",
    "mirrorX",
    "mirrorY",
    "rotation",
    "layer",
    "onTop",
    "order",
    "dynamicPosition",
    "movementId",
    "entityId"
]);

function entityVisualTopologyMatches(current, next) {
    return ENTITY_VISUAL_CACHE_TOPOLOGY_FIELDS.every((field) => Object.is(current?.[field], next?.[field]));
}

function replaceObjectContents(target, source) {
    for (const key of Object.keys(target)) delete target[key];
    Object.assign(target, source);
}

export function setWorldEntityState(state, entityId, nextState) {
    const entity = worldEntityById(state, entityId);
    if (!entity || !entity.visualStates || !entity.visualStates[nextState]) {
        return false;
    }
    entity.state = nextState;
    if (!state.world.entityStates) state.world.entityStates = {};
    state.world.entityStates[entityId] = nextState;
    const worldVisuals = Array.isArray(state.world.visuals) ? state.world.visuals : [];
    const currentVisuals = worldVisuals.filter((visual) => visual.entityId === entityId);
    const nextVisuals = editorEntityVisuals(entity)
        .map((visual, index) => visual?.assetId ? editorEntityVisualToWorld(entity, visual, index, nextState) : null)
        .filter(Boolean);
    const canPatchVisualsInPlace = currentVisuals.length === nextVisuals.length
        && currentVisuals.every((visual, index) => entityVisualTopologyMatches(visual, nextVisuals[index]));
    if (canPatchVisualsInPlace) {
        currentVisuals.forEach((visual, index) => replaceObjectContents(visual, nextVisuals[index]));
        return true;
    }
    state.world.visuals = worldVisuals.filter((visual) => visual.entityId !== entityId);
    state.world.visuals.push(...nextVisuals);
    state.world.visuals.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return true;
}

function isReactiveWorldEntity(entity) {
    const type = String(entity?.type || "");
    return entity?.reactiveKind === "destructible" ||
        type === "breakableCrate" ||
        type === "destructibleBarrier";
}

function reactiveObjectCollisionRect(object) {
    const width = Math.max(1, Number(object?.width) || 1);
    const height = Math.max(1, Number(object?.height) || 1);
    const insetX = clamp(Number(object?.collisionInsetX) || 0, 0, width * 0.45);
    const insetTop = clamp(Number(object?.collisionInsetTop) || 0, 0, height * 0.9);
    const insetBottom = clamp(Number(object?.collisionInsetBottom) || 0, 0, height * 0.9 - insetTop);
    return {
        x: (Number(object?.x) || 0) - width * 0.5 + insetX,
        y: (Number(object?.y) || 0) - height + insetTop,
        w: Math.max(1, width - insetX * 2),
        h: Math.max(1, height - insetTop - insetBottom)
    };
}

function reactiveObjectStateIsActive(object) {
    return object?.state !== "destroyed" && object?.state !== "inactive" && Number(object?.health) > 0;
}

function reactiveObjectBlocksPlayer(object) {
    if (!object?.blocksPlayer || !reactiveObjectStateIsActive(object)) return false;
    const states = Array.isArray(object.collisionStates) ? object.collisionStates : null;
    return !states || states.includes(object.state);
}

function reactiveObjectBlocksProjectiles(object) {
    if (!object?.blocksProjectiles || !reactiveObjectStateIsActive(object)) return false;
    const states = Array.isArray(object.projectileCollisionStates) ? object.projectileCollisionStates : object.collisionStates;
    return !Array.isArray(states) || states.includes(object.state);
}

function syncReactiveObjectCollision(state, object) {
    if (!state?.world || !object?.id) return;
    state.world.solids = (state.world.solids || []).filter((solid) => solid.reactiveObjectId !== object.id);
    if (!reactiveObjectBlocksPlayer(object)) return;
    state.world.solids.push({
        id: `${object.id}_reactive_solid`,
        kind: "reactiveObject",
        reactiveObjectId: object.id,
        ...reactiveObjectCollisionRect(object)
    });
}

function setReactiveObjectState(state, object, nextState) {
    if (!object || object.state === nextState) return false;
    const previousState = object.state;
    object.state = nextState;
    const sourceEntity = worldEntityById(state, object.entityId || object.id);
    if (sourceEntity) {
        sourceEntity.state = nextState;
        sourceEntity.health = object.health;
        if (!setWorldEntityState(state, sourceEntity.id, nextState)) {
            if (!state.world.entityStates) state.world.entityStates = {};
            state.world.entityStates[sourceEntity.id] = nextState;
        }
    }
    syncReactiveObjectCollision(state, object);
    addEvent(state, "REACTIVE_OBJECT_STATE_CHANGED", {
        objectId: object.id,
        previousState,
        state: nextState,
        health: round(object.health)
    });
    return true;
}

function isWizardEntryDoor(entity) {
    return Boolean(entity) && entity.type === "wizard_entry_door";
}

function isWizardExitDoor(entity) {
    return Boolean(entity) && entity.type === "wizard_exit_door";
}

function isWizardEntryPoint(entity) {
    return Boolean(entity) && entity.type === "wizard_entry_point";
}

function isWizardExitPoint(entity) {
    return Boolean(entity) && entity.type === "wizard_exit_point";
}

function isWizardEntryPortal(entity) {
    return isWizardEntryDoor(entity) || isWizardEntryPoint(entity);
}

function isWizardExitPortal(entity) {
    return isWizardExitDoor(entity) || isWizardExitPoint(entity);
}

function hasLivingBoss(state) {
    return (state?.enemies || []).some((enemy) => enemy?.isBoss === true && Number(enemy.health) > 0);
}

function isWizardDoor(entity) {
    return isWizardEntryDoor(entity) || isWizardExitDoor(entity);
}

function isWizardPortal(entity) {
    return isWizardEntryPortal(entity) || isWizardExitPortal(entity);
}

function entityFloorAnchorYFactor(entity) {
    const authored = Number(entity?.floorAnchorYFactor);
    if (Number.isFinite(authored)) return clamp(authored, 0, 1);
    return isWizardDoor(entity) ? WIZARD_DOOR_FLOOR_ANCHOR_Y_FACTOR : 1;
}

function wizardDoorInsideScale(entity) {
    const authored = Number(entity?.wizardInsideScale);
    return clamp(Number.isFinite(authored) ? authored : DEFAULT_WIZARD_DOOR_INSIDE_SCALE, 0.5, 1);
}

function wizardEntryPortalEntity(entities) {
    return (entities || []).find(isWizardEntryPortal) || null;
}

function wizardExitPortalEntity(entities) {
    return (entities || []).find(isWizardExitPortal) || null;
}

export function defaultNextLevelId(levelId) {
    const match = /^level_(\d+)$/i.exec(String(levelId || ""));
    if (!match) return "level_001";
    return `level_${String(Number(match[1]) + 1).padStart(match[1].length, "0")}`;
}

function doorWalkDirection(door, fallback = 1) {
    const value = Number(door?.walkDirection ?? door?.exitDirection);
    if (value < 0) return -1;
    if (value > 0) return 1;
    return fallback < 0 ? -1 : 1;
}

function refreshEntityVisuals(state, entity) {
    if (!entity?.id) return;
    state.world.visuals = (state.world.visuals || []).filter((visual) => visual.entityId !== entity.id);
    editorEntityVisuals(entity).forEach((visual, index) => {
        if (visual?.assetId) state.world.visuals.push(editorEntityVisualToWorld(entity, visual, index, entity.state || ""));
    });
    state.world.visuals.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function snapEntityBaselineToNearbyGround(state, entity, maxDistance = null) {
    if (!entity || !Number.isFinite(Number(entity.x)) || !Number.isFinite(Number(entity.y))) return null;
    const wizardHeight = Math.max(1, Number(state.player?.height) || Number(state.tuning?.wizardHeight) || DEFAULT_TUNING.wizardHeight);
    const requested = maxDistance ?? entity.groundSnapDistance ?? wizardHeight * 0.5;
    const limit = Math.max(0, Number(requested) || wizardHeight * 0.5);
    const width = Math.max(16, Number(entity.w) || Number(state.player?.width) || 36);
    const x = Number(entity.x);
    const y = Number(entity.y);
    const samples = [x, x - width * 0.32, x + width * 0.32];
    let best = null;
    const supportQueryBounds = {
        minX: Math.min(...samples) - 2,
        minY: y - limit - 2,
        maxX: Math.max(...samples) + 2,
        maxY: y + limit + 2
    };
    for (const segment of queryWorldSegments(state.world, supportQueryBounds)) {
        if (segment.kind !== "walkable" && segment.kind !== "blockable") continue;
        if (Math.abs(Number(segment.x2) - Number(segment.x1)) < 0.001) continue;
        for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
            const supportY = segmentYAtX(segment, samples[sampleIndex]);
            if (supportY === null) continue;
            const delta = supportY - y;
            if (Math.abs(delta) > limit) continue;
            const score = Math.abs(delta) + sampleIndex * 0.001;
            if (!best || score < best.score) best = { supportY, delta, score, segment };
        }
    }
    if (!best) return null;
    entity.y = best.supportY;
    refreshEntityVisuals(state, entity);
    addEvent(state, "WIZARD_DOOR_SNAPPED_TO_GROUND", {
        doorId: entity.id,
        fromY: round(y),
        toY: round(best.supportY),
        delta: round(best.delta),
        segmentId: best.segment.id
    });
    return { entityId: entity.id, fromY: y, y: best.supportY, delta: best.delta, segmentId: best.segment.id };
}

export function snapWizardDoorsToNearbyGround(state) {
    const results = [];
    for (const entity of state.world?.entities || []) {
        if (!isWizardPortal(entity)) continue;
        const result = snapEntityBaselineToNearbyGround(state, entity);
        if (result) results.push(result);
    }
    return results;
}

function applyEntryPortalAsPlayerStart(state, entryPortal, { resetPlayer = false } = {}) {
    if (!entryPortal) return false;
    const isPoint = isWizardEntryPoint(entryPortal);
    const direction = doorWalkDirection(entryPortal, 1);
    const distance = isPoint ? 0 : Math.max(48, Number(entryPortal.emergeDistance) || Math.max(120, Number(entryPortal.w) || 150));
    const start = {
        x: Number(entryPortal.x) + direction * distance,
        y: Number(entryPortal.y)
    };
    state.world.start = start;
    if (resetPlayer && state.player) {
        state.player.currentTransform.x = start.x;
        state.player.currentTransform.y = start.y;
        state.player.spawnX = start.x;
        state.player.spawnY = start.y;
        state.player.vx = 0;
        state.player.vy = 0;
        setCurrentUniformScale(state.player, 1);
        state.player.onGround = true;
        state.player.wasOnGround = true;
        state.camera.currentTransform.x = start.x;
        state.camera.currentTransform.y = start.y - 170;
        resetCameraLineTracking(state);
    }
    return true;
}

function entryPortalPlayerStart(entryPortal) {
    if (!entryPortal) return null;
    const distance = isWizardEntryPoint(entryPortal)
        ? 0
        : Math.max(48, Number(entryPortal.emergeDistance) || Math.max(120, Number(entryPortal.w) || 150));
    const authoredX = Number(entryPortal.x);
    const authoredY = Number(entryPortal.y);
    return {
        x: (Number.isFinite(authoredX) ? authoredX : 0) + doorWalkDirection(entryPortal, 1) * distance,
        y: Number.isFinite(authoredY) ? authoredY : 360
    };
}

function configurePortalIntro(state, entities) {
    const portal = wizardEntryPortalEntity(entities);
    if (!portal || isWizardEntryPoint(portal)) {
        state.story.portalIntro = null;
        state.player.visible = true;
        setCurrentUniformScale(state.player, 1);
        return false;
    }

    const finalX = state.world.start.x;
    const finalY = state.world.start.y;
    const direction = doorWalkDirection(portal, 1);
    const hiddenX = Number(portal.x || 0) - direction * Math.max(12, Number(portal.w || 150) * 0.08);
    const distance = Math.abs(finalX - hiddenX);
    const walkSpeed = Math.max(40, Number(portal.walkSpeed) || 105);
    const walkDuration = Math.max(0.7, distance / walkSpeed);

    state.story.portalIntro = {
        active: true,
        portalId: portal.id,
        phase: "closed",
        phaseTime: 0,
        direction,
        insideScale: wizardDoorInsideScale(portal),
        hiddenX,
        finalX,
        groundY: finalY,
        walkDuration,
        closedDuration: Math.max(0, Number(portal.closedDuration) || 0.55),
        openDuration: Math.max(0.05, Number(portal.openDuration) || 0.38),
        clearDuration: Math.max(0, Number(portal.clearDuration) || 0.28),
        closeDuration: Math.max(0.05, Number(portal.closeDuration) || 0.42)
    };
    setWorldEntityState(state, portal.id, "closed");
    state.player.visible = false;
    setCurrentUniformScale(state.player, state.story.portalIntro.insideScale);
    state.player.currentTransform.x = hiddenX;
    state.player.currentTransform.y = finalY;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.facing = direction;
    state.player.onGround = true;
    state.player.wasOnGround = true;
    state.camera.currentTransform.x = Number(portal.x) || finalX;
    state.camera.currentTransform.y = finalY - 170;
    resetCameraLineTracking(state);
    addEvent(state, "PORTAL_INTRO_STARTED", { portalId: portal.id });
    return true;
}

function advancePortalIntroPhase(state, intro, phase) {
    intro.phase = phase;
    intro.phaseTime = 0;
    if (phase === "opening") {
        setWorldEntityState(state, intro.portalId, "open");
        addEvent(state, "PORTAL_OPENED", { portalId: intro.portalId });
    } else if (phase === "emerging") {
        state.player.visible = true;
        addEvent(state, "PLAYER_EMERGING_FROM_PORTAL", { portalId: intro.portalId });
    } else if (phase === "closing") {
        addEvent(state, "PORTAL_CLOSING", { portalId: intro.portalId });
    } else if (phase === "complete") {
        setWorldEntityState(state, intro.portalId, "closed");
        intro.active = false;
        state.player.visible = true;
        setCurrentUniformScale(state.player, 1);
        state.player.currentTransform.x = intro.finalX;
        state.player.currentTransform.y = intro.groundY;
        state.player.vx = 0;
        state.player.vy = 0;
        state.player.onGround = true;
        state.player.wasOnGround = true;
        state.player.spawnX = intro.finalX;
        state.player.spawnY = intro.groundY;
        addEvent(state, "PORTAL_INTRO_COMPLETE", { portalId: intro.portalId });
    }
}

function updatePortalIntro(state, dt) {
    const intro = state.story?.portalIntro;
    if (!intro?.active) return false;

    const p = state.player;
    intro.phaseTime += dt;
    p.ax = 0;
    p.ay = 0;
    p.vy = 0;
    p.facing = intro.direction;
    p.onGround = true;
    p.wasOnGround = true;

    if (intro.phase === "closed") {
        p.visible = false;
        setCurrentUniformScale(p, intro.insideScale);
        p.currentTransform.x = intro.hiddenX;
        p.vx = 0;
        if (intro.phaseTime >= intro.closedDuration) advancePortalIntroPhase(state, intro, "opening");
    } else if (intro.phase === "opening") {
        p.visible = false;
        setCurrentUniformScale(p, intro.insideScale);
        p.currentTransform.x = intro.hiddenX;
        p.vx = 0;
        if (intro.phaseTime >= intro.openDuration) advancePortalIntroPhase(state, intro, "emerging");
    } else if (intro.phase === "emerging") {
        const t = clamp(intro.phaseTime / Math.max(0.001, intro.walkDuration), 0, 1);
        const eased = t * t * (3 - 2 * t);
        p.visible = true;
        setCurrentUniformScale(p, intro.insideScale + (1 - intro.insideScale) * eased);
        p.currentTransform.x = intro.hiddenX + (intro.finalX - intro.hiddenX) * eased;
        p.currentTransform.y = intro.groundY;
        p.vx = (intro.finalX - intro.hiddenX) / Math.max(0.001, intro.walkDuration);
        if (t >= 1) advancePortalIntroPhase(state, intro, "clear");
    } else if (intro.phase === "clear") {
        p.visible = true;
        setCurrentUniformScale(p, 1);
        p.currentTransform.x = intro.finalX;
        p.currentTransform.y = intro.groundY;
        p.vx = 0;
        if (intro.phaseTime >= intro.clearDuration) advancePortalIntroPhase(state, intro, "closing");
    } else if (intro.phase === "closing") {
        p.visible = true;
        setCurrentUniformScale(p, 1);
        p.currentTransform.x = intro.finalX;
        p.currentTransform.y = intro.groundY;
        p.vx = 0;
        if (intro.phaseTime >= intro.closeDuration * 0.5 && state.world.entityStates?.[intro.portalId] !== "closed") {
            setWorldEntityState(state, intro.portalId, "closed");
            addEvent(state, "PORTAL_CLOSED", { portalId: intro.portalId });
        }
        if (intro.phaseTime >= intro.closeDuration) advancePortalIntroPhase(state, intro, "complete");
    }

    state.camera.currentTransform.x += (p.currentTransform.x + 80 * intro.direction - state.camera.currentTransform.x) * Math.min(1, dt * 5);
    state.camera.currentTransform.y += (p.currentTransform.y - 170 - state.camera.currentTransform.y) * Math.min(1, dt * 5);
    return true;
}

function configurePortalExit(state, entities) {
    const portal = wizardExitPortalEntity(entities);
    if (!portal) {
        state.story.portalExit = null;
        return false;
    }
    const direction = doorWalkDirection(portal, 1);
    const requestedDestination = String(portal.destinationLevel || portal.destination || "").trim();
    state.story.portalExit = {
        active: false,
        completed: false,
        instant: isWizardExitPoint(portal),
        portalId: portal.id,
        phase: "armed",
        phaseTime: 0,
        direction,
        insideScale: isWizardExitPoint(portal) ? 1 : wizardDoorInsideScale(portal),
        triggerDistance: Math.max(24, Number(portal.triggerDistance) || (isWizardExitPoint(portal) ? 64 : 96)),
        verticalTolerance: Math.max(32, Number(portal.verticalTolerance) || Math.max(state.player.height, Number(portal.h) || 197)),
        walkSpeed: Math.max(40, Number(portal.walkSpeed) || 105),
        openDuration: Math.max(0.05, Number(portal.openDuration) || 0.38),
        closeDuration: Math.max(0.05, Number(portal.closeDuration) || 0.42),
        requestedLevelId: requestedDestination || defaultNextLevelId(state.world.levelId),
        approachX: null,
        hiddenX: Number(portal.x || 0) + direction * Math.max(10, Number(portal.w || 150) * 0.10),
        groundY: Number(portal.y) || state.player.currentTransform.y
    };
    if (!isWizardExitPoint(portal)) setWorldEntityState(state, portal.id, "closed");
    return true;
}

function completeImmediateExit(state, exit) {
    exit.active = true;
    exit.completed = true;
    exit.phase = "awaitingLevel";
    exit.phaseTime = 0;
    state.story.levelTransitionRequest = {
        portalId: exit.portalId,
        requestedLevelId: exit.requestedLevelId,
        fallbackLevelId: state.world.levelId
    };
    addEvent(state, "LEVEL_TRANSITION_REQUESTED", state.story.levelTransitionRequest);
}

function startPortalExit(state, exit) {
    exit.active = true;
    exit.phase = "opening";
    exit.phaseTime = 0;
    exit.approachX = state.player.currentTransform.x;
    exit.groundY = Number(worldEntityById(state, exit.portalId)?.y) || state.player.currentTransform.y;
    setWorldEntityState(state, exit.portalId, "open");
    detachPlayerFromMovingPlatformSupport(state);
    state.player.vx = 0;
    state.player.vy = 0;
    setCurrentUniformScale(state.player, 1);
    addEvent(state, "PORTAL_EXIT_OPENED", { portalId: exit.portalId, destinationLevel: exit.requestedLevelId });
}

function updatePortalExit(state, dt) {
    const exit = state.story?.portalExit;
    if (!exit || exit.completed) return false;
    const portal = worldEntityById(state, exit.portalId);
    if (!portal) return false;

    if (!exit.active) {
        if (hasLivingBoss(state)) {
            exit.lockedByBoss = true;
            if (!exit.instant && state.world.entityStates?.[exit.portalId] !== "closed") {
                setWorldEntityState(state, exit.portalId, "closed");
            }
            return false;
        }
        exit.lockedByBoss = false;
        const horizontalDistance = Math.abs(state.player.currentTransform.x - Number(portal.x || 0));
        const verticalDistance = Math.abs(state.player.currentTransform.y - Number(portal.y || 0));
        if (horizontalDistance > exit.triggerDistance || verticalDistance > exit.verticalTolerance) return false;
        if (exit.instant) {
            completeImmediateExit(state, exit);
            return true;
        }
        startPortalExit(state, exit);
    }

    const p = state.player;
    exit.phaseTime += dt;
    p.ax = 0;
    p.ay = 0;
    p.vy = 0;
    p.onGround = true;
    p.wasOnGround = true;
    p.facing = exit.direction;

    if (exit.phase === "opening") {
        p.vx = 0;
        setCurrentUniformScale(p, 1);
        if (exit.phaseTime >= exit.openDuration) {
            exit.phase = "entering";
            exit.phaseTime = 0;
            exit.walkDuration = Math.max(0.55, Math.abs(exit.hiddenX - exit.approachX) / exit.walkSpeed);
            addEvent(state, "PLAYER_ENTERING_PORTAL", { portalId: exit.portalId });
        }
    } else if (exit.phase === "entering") {
        const t = clamp(exit.phaseTime / Math.max(0.001, exit.walkDuration), 0, 1);
        const eased = t * t * (3 - 2 * t);
        p.visible = true;
        setCurrentUniformScale(p, 1 + (exit.insideScale - 1) * eased);
        p.currentTransform.x = exit.approachX + (exit.hiddenX - exit.approachX) * eased;
        p.currentTransform.y = exit.groundY;
        p.vx = (exit.hiddenX - exit.approachX) / Math.max(0.001, exit.walkDuration);
        if (t >= 1) {
            p.visible = false;
            p.vx = 0;
            exit.phase = "closing";
            exit.phaseTime = 0;
        }
    } else if (exit.phase === "closing") {
        p.visible = false;
        setCurrentUniformScale(p, exit.insideScale);
        p.currentTransform.x = exit.hiddenX;
        p.currentTransform.y = exit.groundY;
        p.vx = 0;
        if (exit.phaseTime >= exit.closeDuration * 0.5 && state.world.entityStates?.[exit.portalId] !== "closed") {
            setWorldEntityState(state, exit.portalId, "closed");
        }
        if (exit.phaseTime >= exit.closeDuration) {
            exit.phase = "awaitingLevel";
            exit.completed = true;
            setCurrentUniformScale(p, 1);
            state.story.levelTransitionRequest = {
                portalId: exit.portalId,
                requestedLevelId: exit.requestedLevelId,
                fallbackLevelId: state.world.levelId
            };
            addEvent(state, "LEVEL_TRANSITION_REQUESTED", state.story.levelTransitionRequest);
        }
    }

    state.camera.currentTransform.x += (Number(portal.x) - state.camera.currentTransform.x) * Math.min(1, dt * 5);
    state.camera.currentTransform.y += (exit.groundY - 170 - state.camera.currentTransform.y) * Math.min(1, dt * 5);
    return true;
}

function mailboxStoryEntities(entities) {
    return (entities || []).filter((entity) => {
        const mailbox = entity.type === "mailbox"
            && (entity.interaction === "editorLetter" || entity.mailboxRole === "editorLetter");
        const locationThought = entity.type === "thoughtTrigger"
            && entity.interaction === "locationThought";
        return mailbox || locationThought;
    });
}

function normalizeMailboxThoughtText(mailbox) {
    const thoughtText = String(mailbox?.thoughtText || "").trim();
    return thoughtText || "How kind of him! I hope I can make him proud. This cave doesn’t look quite like it did in the brochures, but I’m sure it will be fine.";
}

function mailboxStoryRecord(state, mailbox) {
    const locationThought = (mailbox.type === "thoughtTrigger" || mailbox.kind === "thoughtTrigger")
        && mailbox.interaction === "locationThought";
    const initialState = mailbox.state || (locationThought ? "available" : "letterAvailable");
    const consumedState = locationThought ? "consumed" : "empty";
    const letterText = locationThought ? "" : (mailbox.letterText || "Dear Ignatius,\n\nPlease proceed boldly!\n\nSincerely,\nYour humble editor,\nWilfred of Bittervine");
    const thoughtText = normalizeMailboxThoughtText(mailbox);
    const completed = initialState === consumedState;
    return {
        active: false,
        completed,
        storyKind: locationThought ? "locationThought" : "mailbox",
        consumedState,
        mailboxId: mailbox.id,
        phase: completed ? "complete" : "armed",
        phaseTime: 0,
        triggerDistance: Math.max(8, Number(mailbox.triggerDistance) || 72),
        verticalTolerance: Math.max(24, Number(mailbox.verticalTolerance) || Math.max(state.player.height * 0.75, Number(mailbox.h) || 80)),
        readingCharactersPerSecond: STORY_READING_CHARACTERS_PER_SECOND,
        letterCharacterCount: storyCharacterCount(letterText),
        thoughtCharacterCount: storyCharacterCount(thoughtText),
        letterDuration: storyReadingDuration(letterText),
        thoughtDuration: storyReadingDuration(thoughtText),
        letterAtlasId: mailbox.letterAtlasId || "it_atlas_001",
        letterAssetId: mailbox.letterAssetId || "letter_scroll",
        thoughtAtlasId: mailbox.thoughtAtlasId || "it_atlas_001",
        thoughtAssetId: mailbox.thoughtAssetId || "thought_bubble_large",
        letterTitle: mailbox.letterTitle || "A Letter from Your Humble Editor",
        letterText,
        thoughtText,
        startedAt: null,
        completedAt: null
    };
}

function configureMailboxStory(state, entities) {
    state.story.mailboxEvents = mailboxStoryEntities(entities).map((mailbox) => mailboxStoryRecord(state, mailbox));
    state.story.mailboxEvent = null;
    return state.story.mailboxEvents.length > 0;
}

function configureOverheadSymbolTriggers(state, entities) {
    state.story.symbolTriggers = (entities || []).filter((entity) =>
        (entity.type === "questionMarkTrigger" || entity.type === "exclamationMarkTrigger")
        && entity.interaction === "playerOverheadSymbol"
    ).map((entity) => ({
        id: String(entity.id || ""),
        type: entity.type,
        completed: entity.state === "consumed",
        triggerDistance: Math.max(8, Number(entity.triggerDistance) || 96),
        verticalTolerance: Math.max(24, Number(entity.verticalTolerance) || 150),
        duration: Math.max(0.1, Number(entity.duration) || 2),
        atlasId: entity.symbolAtlasId || "it_atlas_001",
        assetId: entity.symbolAssetId || (entity.type === "questionMarkTrigger" ? "thought_bubble_question" : "thought_bubble_exclamation")
    }));
    state.story.overheadSymbol = null;
}

function cutsceneScriptEntities(entities) {
    return (entities || []).filter((entity) =>
        entity?.type === "cutsceneTrigger" || entity?.interaction === "scriptedCutscene"
    );
}

function tokenizeCutsceneScriptLine(line) {
    const tokens = [];
    let token = "";
    let quote = null;
    let escaped = false;
    const flush = () => {
        if (token.length > 0) {
            tokens.push(token);
            token = "";
        }
    };
    for (const ch of String(line || "")) {
        if (escaped) {
            token += ch === "n" ? "\n" : ch === "t" ? "\t" : ch;
            escaped = false;
            continue;
        }
        if (quote) {
            if (ch === "\\") {
                escaped = true;
            } else if (ch === quote) {
                quote = null;
            } else {
                token += ch;
            }
            continue;
        }
        if (ch === '"' || ch === "'") {
            quote = ch;
        } else if (/\s/.test(ch)) {
            flush();
        } else {
            token += ch;
        }
    }
    if (escaped) token += "\\";
    if (quote) return { tokens, error: "unterminated quoted string" };
    flush();
    return { tokens, error: null };
}

function parseCutsceneScript(scriptText) {
    const commands = [];
    const errors = [];
    const lines = String(scriptText || "").replace(/\r/g, "").split("\n");
    lines.forEach((rawLine, index) => {
        const lineNumber = index + 1;
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) return;
        const parsed = tokenizeCutsceneScriptLine(line);
        if (parsed.error) {
            errors.push(`Line ${lineNumber}: ${parsed.error}.`);
            return;
        }
        const tokens = parsed.tokens;
        const type = String(tokens[0] || "").toUpperCase();
        if (type === "GOTO") {
            if (tokens.length < 3 || tokens.length > 5) {
                errors.push(`Line ${lineNumber}: GOTO expects <character> <x> or <character> <x> <y> [speed].`);
                return;
            }
            const x = Number(tokens[2]);
            const followGround = tokens.length === 3;
            const y = followGround ? null : Number(tokens[3]);
            const speed = tokens.length >= 5 ? Number(tokens[4]) : null;
            if (!Number.isInteger(x) || (!followGround && !Number.isInteger(y))) {
                errors.push(`Line ${lineNumber}: GOTO x and y must be integer level coordinates.`);
                return;
            }
            if (speed !== null && (!Number.isFinite(speed) || speed <= 0)) {
                errors.push(`Line ${lineNumber}: GOTO speed must be a positive pixels/second value.`);
                return;
            }
            commands.push({ type, lineNumber, characterId: String(tokens[1] || ""), x, y, speed, followGround });
            return;
        }
        if (type === "ANIM") {
            if (tokens.length !== 3) {
                errors.push(`Line ${lineNumber}: ANIM expects <character> <animation_name>.`);
                return;
            }
            commands.push({ type, lineNumber, characterId: String(tokens[1] || ""), animationName: String(tokens[2] || "") });
            return;
        }
        if (type === "SAY" || type === "THINK") {
            if (tokens.length < 3) {
                errors.push(`Line ${lineNumber}: ${type} expects <character> <"text">.`);
                return;
            }
            const text = tokens.slice(2).join(" ");
            commands.push({
                type,
                lineNumber,
                characterId: String(tokens[1] || ""),
                text,
                characterCount: storyCharacterCount(text),
                duration: storyReadingDuration(text)
            });
            return;
        }
        if (type === "DELAY") {
            if (tokens.length !== 2) {
                errors.push(`Line ${lineNumber}: DELAY expects <seconds>.`);
                return;
            }
            const duration = Number(tokens[1]);
            if (!Number.isFinite(duration) || duration < 0) {
                errors.push(`Line ${lineNumber}: DELAY seconds must be zero or greater.`);
                return;
            }
            commands.push({ type, lineNumber, duration });
            return;
        }
        errors.push(`Line ${lineNumber}: unknown cutscene command "${tokens[0]}".`);
    });
    return { commands, errors };
}

function cutsceneScriptRecord(state, entity) {
    const parsed = parseCutsceneScript(entity?.script);
    const completed = String(entity?.state || "available") === "consumed";
    const participantEnemyIds = [...new Set(parsed.commands
        .map((command) => String(command?.characterId || ""))
        .filter((characterId) => characterId && characterId !== "wizard"))];
    return {
        id: String(entity?.id || ""),
        entityId: String(entity?.id || ""),
        active: false,
        completed,
        triggerDistance: Math.max(8, Number(entity?.triggerDistance) || 96),
        verticalTolerance: Math.max(24, Number(entity?.verticalTolerance) || Math.max(state.player.height * 0.75, Number(entity?.h) || 160)),
        speechAtlasId: String(entity?.speechAtlasId || "it_atlas_001"),
        speechAssetId: String(entity?.speechAssetId || "speech_bubble_large"),
        thoughtAtlasId: String(entity?.thoughtAtlasId || "it_atlas_001"),
        thoughtAssetId: String(entity?.thoughtAssetId || "thought_bubble_large"),
        scriptText: String(entity?.script || ""),
        commands: parsed.commands,
        parseErrors: parsed.errors,
        participantEnemyIds,
        commandIndex: 0,
        commandTime: 0,
        commandStartedAt: null,
        startedAt: null,
        completedAt: null,
        animationOverrides: {}
    };
}

function configureCutsceneScripts(state, entities) {
    state.story.cutsceneScripts = cutsceneScriptEntities(entities).map((entity) => cutsceneScriptRecord(state, entity));
    state.story.cutscene = null;
    return state.story.cutsceneScripts.length > 0;
}

function cutsceneCharacter(state, characterId) {
    const id = String(characterId || "");
    if (id === "wizard") return { kind: "wizard", id, actor: state.player };
    const enemy = (state.enemies || []).find((candidate) => candidate?.id === id || candidate?.entityId === id);
    return enemy ? { kind: "enemy", id, actor: enemy } : null;
}

function cutsceneEnemyIsAlive(enemy) {
    return Boolean(enemy) && Number(enemy.health) > 0 && enemy.combatState !== ENEMY_COMBAT_STATE.DEAD && enemy.combatState !== "dead";
}

function cutsceneScriptInvalidParticipant(state, script) {
    for (const characterId of script?.participantEnemyIds || []) {
        const character = cutsceneCharacter(state, characterId);
        if (!character || character.kind !== "enemy") {
            return { characterId, reason: "missing" };
        }
        if (!cutsceneEnemyIsAlive(character.actor)) {
            return { characterId, reason: "dead" };
        }
    }
    return null;
}

function cutsceneEnemyProtected(state, enemy) {
    const script = state.story?.cutscene;
    if (!script?.active || !enemy) return false;
    return (script.participantEnemyIds || []).some((characterId) =>
        enemy.id === characterId || enemy.entityId === characterId
    );
}

function playerStorySequenceInvulnerable(state) {
    return Boolean(state.story?.cutscene?.active || state.story?.portalExit?.active);
}

function cutsceneCharacterNormalSpeed(state, character) {
    if (!character) return 0;
    if (character.kind === "wizard") return Math.max(1, Number(state.tuning?.maxRunSpeed) || 360);
    return Math.max(1, Number(character.actor?.runSpeed) || Number(character.actor?.walkSpeed) || 56);
}

function cutsceneCharacterPosition(character) {
    if (!character) return { x: 0, y: 0 };
    if (character.kind === "wizard") {
        return {
            x: Number(character.actor?.currentTransform?.x) || 0,
            y: Number(character.actor?.currentTransform?.y) || 0
        };
    }
    return {
        x: Number(character.actor?.currentTransform?.x) || 0,
        y: Number(character.actor?.currentTransform?.y) || 0
    };
}

function cutsceneGroundFollowSupport(state, character, x, referenceY) {
    if (!character?.actor || character.actor.locomotion === "flying") return null;
    const actor = character.actor;
    const automaticStepHeight = character.kind === "wizard"
        ? playerAutomaticStepHeight(actor)
        : Math.max(Number(actor.maxStepHeight) || 0, (Number(actor.height) || 0) * AUTOMATIC_STEP_HEIGHT_RATIO);
    const maximumDrop = automaticStepHeight;
    return findCharacterEnemyGroundSupport(
        state,
        x,
        referenceY,
        Math.max(4, automaticStepHeight),
        Math.max(4, maximumDrop),
        actor.width,
        { bodyHeight: actor.height }
    );
}

function detachCutsceneCharacterFromMovingPlatform(character) {
    if (!character?.actor) return;
    const actor = character.actor;
    if (character.kind === "wizard") {
        actor.supportId = null;
        actor.groundStride = null;
        return;
    }
    actor.supportId = null;
    actor.ridingPlatformId = null;
    actor.currentSupportId = null;
}

function setCutsceneCharacterMotion(state, character, x, y, vx, vy) {
    if (!character) return;
    const actor = character.actor;
    if (character.kind === "wizard") {
        actor.currentTransform.x = x;
        actor.currentTransform.y = y;
        actor.vx = vx;
        actor.vy = vy;
        actor.ax = 0;
        actor.ay = 0;
        actor.onGround = true;
        actor.wasOnGround = true;
        actor.groundStride = null;
        actor.ordinaryJumpActive = false;
        if (Math.abs(vx) > 0.001) actor.facing = vx < 0 ? -1 : 1;
        return;
    }
    actor.currentTransform.x = x;
    actor.currentTransform.y = y;
    actor.velocityX = vx;
    actor.velocityY = vy;
    actor.groundVelocityX = vx;
    actor.airborne = actor.locomotion === "flying";
    if (Math.abs(vx) > 0.001) actor.facing = vx < 0 ? -1 : 1;
    syncCharacterEnemyTarget(state, actor);
}

function releaseCutsceneWizardGotoMotion(state, character) {
    if (!character || character.kind !== "wizard" || !character.actor) return;
    const player = character.actor;
    player.vx = 0;
    player.vy = 0;
    player.ax = 0;
    player.ay = 0;
    player.groundStride = null;
    player.ordinaryJumpActive = false;

    const support = findCharacterEnemyGroundSupport(
        state,
        player.currentTransform.x,
        player.currentTransform.y,
        2,
        2,
        player.width
    );
    if (support) {
        player.currentTransform.y = support.y;
        player.onGround = true;
        player.wasOnGround = true;
        player.supportId = support.id || null;
        player.airborneTime = 0;
        player.airBoostArmed = true;
    } else {
        player.onGround = false;
        player.wasOnGround = false;
        player.supportId = null;
        player.airborneTime = 0;
    }
}

function releaseCutsceneCharacterGotoMotion(state, character) {
    if (character?.kind === "wizard") {
        releaseCutsceneWizardGotoMotion(state, character);
        return;
    }
    releaseCutsceneEnemyGotoMotion(state, character);
}

function releaseCutsceneEnemyGotoMotion(state, character) {
    if (!character || character.kind !== "enemy" || !character.actor) return;
    const enemy = character.actor;
    if (enemy.locomotion === "flying") {
        // GOTO owns velocity while active, but releasing it should not rewrite
        // the flying enemy's frozen AI state. Restore only physical/presentation
        // invariants; ordinary AI will resume from its prior state afterward.
        enemy.airborne = true;
        enemy.velocityX = 0;
        enemy.velocityY = 0;
        enemy.groundVelocityX = 0;
        setCharacterEnemyAnimation(enemy, "fly");
        syncCharacterEnemyTarget(state, enemy);
        return;
    }

    enemy.airTimer = 0;
    enemy.airTraversalType = null;
    enemy.airSourceSupportId = null;
    enemy.airSourceObstacleId = null;
    enemy.airTargetSupportId = null;
    enemy.velocityX = 0;
    enemy.velocityY = 0;
    enemy.groundVelocityX = 0;

    const support = findCharacterEnemyGroundSupport(
        state,
        enemy.currentTransform.x,
        enemy.currentTransform.y,
        2,
        2,
        enemy.width
    );
    if (support) {
        enemy.currentTransform.y = support.y;
        enemy.airborne = false;
        enemy.currentSupportId = null;
        setCharacterEnemyGroundSupportIdentity(state, enemy, support);
    } else {
        enemy.airborne = true;
        enemy.supportId = null;
        enemy.ridingPlatformId = null;
        enemy.currentSupportId = null;
        enemy.movementPhase = "air";
    }
    syncCharacterEnemyTarget(state, enemy);
}

function restoreCutsceneEnemyAnimation(script, character) {
    if (!character || character.kind !== "enemy") return;
    const override = script.animationOverrides?.[character.id];
    const defaultSlot = character.actor?.locomotion === "flying" ? "fly" : "idle";
    setCharacterEnemyAnimation(character.actor, override?.slot || defaultSlot);
}

function setCutsceneAnimationOverride(state, script, characterId, animationName) {
    const character = cutsceneCharacter(state, characterId);
    if (!character) return false;
    const slot = String(animationName || "idle");
    script.animationOverrides[character.id] = { slot, startedAt: state.clock.time };
    if (character.kind === "enemy") setCharacterEnemyAnimation(character.actor, slot);
    return true;
}

function advanceCutsceneEnemyAnimations(state, script, dt, activeGotoCharacterId = null) {
    for (const [characterId, override] of Object.entries(script.animationOverrides || {})) {
        if (characterId === "wizard" || characterId === activeGotoCharacterId) continue;
        const character = cutsceneCharacter(state, characterId);
        if (!character || character.kind !== "enemy") continue;
        if (character.actor.animationSlot !== override.slot) setCharacterEnemyAnimation(character.actor, override.slot);
        character.actor.animationClock.current = Math.max(0, Number(character.actor.animationClock.current) || 0) + dt;
    }
}

function cutsceneRuntimeError(state, script, command, message) {
    addEvent(state, "CUTSCENE_SCRIPT_ERROR", {
        triggerId: script.entityId,
        lineNumber: command?.lineNumber || 0,
        message
    });
}

function skipCutsceneScript(state, script, issue) {
    script.active = false;
    script.completed = true;
    script.commandIndex = 0;
    script.commandTime = 0;
    script.commandStartedAt = null;
    script.startedAt = null;
    script.completedAt = state.clock.time;
    script.animationOverrides = {};
    state.story.cutscene = null;
    if (script.entityId) setWorldEntityState(state, script.entityId, "consumed");
    addEvent(state, "CUTSCENE_SCRIPT_SKIPPED", {
        triggerId: script.entityId,
        characterId: issue?.characterId || null,
        reason: issue?.reason || "invalidParticipant"
    });
}

function startCutsceneScript(state, script) {
    const invalidParticipant = cutsceneScriptInvalidParticipant(state, script);
    if (invalidParticipant) {
        skipCutsceneScript(state, script, invalidParticipant);
        return false;
    }

    script.active = true;
    script.completed = false;
    script.commandIndex = 0;
    script.commandTime = 0;
    script.commandStartedAt = null;
    script.startedAt = state.clock.time;
    script.completedAt = null;
    script.animationOverrides = {};
    state.story.cutscene = script;
    if (script.entityId) setWorldEntityState(state, script.entityId, "consumed");
    if (state.equipment?.rocket?.attachedBoosting) {
        // Player-held boost is an input-driven action. End it when story control
        // starts; passive Flight power-up physics may continue independently.
        stopAttachedBoost(state, "cutscene");
    }
    if (state.player.onGround) {
        // Ground movement is player intent and stops when story control begins.
        state.player.vx = 0;
        state.player.vy = 0;
    }
    // Airborne velocity is passive physics and continues until/unless a
    // GOTO wizard command explicitly takes ownership of movement.
    state.player.ax = 0;
    state.player.ay = 0;
    addEvent(state, "CUTSCENE_SCRIPT_STARTED", { triggerId: script.entityId });
    if (script.parseErrors.length) {
        for (const message of script.parseErrors) cutsceneRuntimeError(state, script, null, message);
    }
    return true;
}

function completeCutsceneScript(state, script) {
    script.active = false;
    script.completed = true;
    script.completedAt = state.clock.time;
    script.commandTime = 0;
    script.commandStartedAt = null;
    for (const characterId of Object.keys(script.animationOverrides || {})) {
        const character = cutsceneCharacter(state, characterId);
        if (character?.kind === "enemy") {
            // ANIM owns presentation only. Releasing an override must not erase
            // passive jump/fall momentum that continued during the cutscene.
            setCharacterEnemyAnimation(character.actor, character.actor?.locomotion === "flying" ? "fly" : "idle");
        }
    }
    script.animationOverrides = {};
    if (state.player.onGround) {
        state.player.vx = 0;
        state.player.vy = 0;
    }
    state.story.cutscene = null;
    addEvent(state, "CUTSCENE_SCRIPT_COMPLETED", { triggerId: script.entityId });
}

function updateCutsceneCamera(state, dt) {
    const p = state.player;
    state.camera.currentTransform.x += (p.currentTransform.x - state.camera.currentTransform.x) * Math.min(1, dt * 5);
    state.camera.currentTransform.y += (p.currentTransform.y - 170 - state.camera.currentTransform.y) * Math.min(1, dt * 5);
}

function updateCutsceneScript(state, input, dt) {
    let script = state.story?.cutscene || null;
    if (!script && state.player?.lungeActive) return false;
    if (!script) {
        for (const candidate of state.story?.cutsceneScripts || []) {
            if (candidate.completed || candidate.active) continue;
            const entity = worldEntityById(state, candidate.entityId);
            if (!entity || state.player.visible === false || state.player.combatState === "dead") continue;
            const horizontalDistance = Math.abs(state.player.currentTransform.x - (Number(entity.x) || 0));
            const verticalDistance = Math.abs(state.player.currentTransform.y - (Number(entity.y) || 0));
            if (horizontalDistance <= candidate.triggerDistance && verticalDistance <= candidate.verticalTolerance) {
                if (startCutsceneScript(state, candidate)) script = candidate;
                break;
            }
        }
        if (!script) return false;
    }

    if (script.parseErrors.length || script.commands.length === 0 || script.commandIndex >= script.commands.length) {
        completeCutsceneScript(state, script);
        return false;
    }

    const command = script.commands[script.commandIndex];
    const activeGotoCharacterId = command?.type === "GOTO" ? command.characterId : null;
    advanceCutsceneEnemyAnimations(state, script, dt, activeGotoCharacterId);
    const commandStarting = script.commandStartedAt === null;
    if (commandStarting) script.commandStartedAt = state.clock.time;

    if (command.type === "ANIM") {
        if (!setCutsceneAnimationOverride(state, script, command.characterId, command.animationName)) {
            cutsceneRuntimeError(state, script, command, `Unknown character "${command.characterId}".`);
        }
        script.commandIndex += 1;
        script.commandTime = 0;
        script.commandStartedAt = null;
    } else if (command.type === "GOTO") {
        const character = cutsceneCharacter(state, command.characterId);
        if (character && commandStarting) {
            // A GOTO command owns authored motion. Detach only when the command
            // actually starts so SAY/DELAY participants may still ride platforms.
            detachCutsceneCharacterFromMovingPlatform(character);
            if (character.kind === "enemy") {
                // A scripted relocation invalidates any route planned from the
                // actor's old support/position. Force ordinary AI to replan from
                // the authored endpoint once the cutscene releases it.
                clearCharacterEnemyNavigationPlan(character.actor);
                character.actor.routeRepathTimer = 0;
                character.actor.navigationFailureCount = 0;
            }
        }
        if (!character) {
            cutsceneRuntimeError(state, script, command, `Unknown character "${command.characterId}".`);
            script.commandIndex += 1;
            script.commandTime = 0;
            script.commandStartedAt = null;
        } else {
            const position = cutsceneCharacterPosition(character);
            const speed = command.speed ?? cutsceneCharacterNormalSpeed(state, character);
            if (command.followGround === true) {
                if (character.kind === "enemy" && character.actor.locomotion === "flying") {
                    cutsceneRuntimeError(state, script, command, `X-only GOTO requires a ground character; "${command.characterId}" is flying.`);
                    releaseCutsceneCharacterGotoMotion(state, character);
                    restoreCutsceneEnemyAnimation(script, character);
                    script.commandIndex += 1;
                    script.commandTime = 0;
                    script.commandStartedAt = null;
                } else {
                    const dx = command.x - position.x;
                const distance = Math.abs(dx);
                if (distance <= 0.5) {
                    const support = cutsceneGroundFollowSupport(state, character, command.x, position.y);
                    if (support) setCutsceneCharacterMotion(state, character, command.x, support.y, 0, 0);
                    releaseCutsceneCharacterGotoMotion(state, character);
                    restoreCutsceneEnemyAnimation(script, character);
                    script.commandIndex += 1;
                    script.commandTime = 0;
                    script.commandStartedAt = null;
                } else {
                    const direction = dx < 0 ? -1 : 1;
                    const travel = Math.min(distance, Math.max(0, speed) * dt);
                    const arrived = travel >= distance - 0.000001;
                    const nextX = arrived ? command.x : position.x + direction * travel;
                    const support = cutsceneGroundFollowSupport(state, character, nextX, position.y);
                    if (!support) {
                        cutsceneRuntimeError(state, script, command, `X-only GOTO lost walkable/blockable ground before X=${command.x}.`);
                        releaseCutsceneCharacterGotoMotion(state, character);
                        restoreCutsceneEnemyAnimation(script, character);
                        script.commandIndex += 1;
                        script.commandTime = 0;
                        script.commandStartedAt = null;
                    } else {
                        setCutsceneCharacterMotion(state, character, nextX, support.y, arrived ? 0 : direction * speed, 0);
                        if (character.kind === "enemy") {
                            if (character.actor.animationSlot !== "walk") setCharacterEnemyAnimation(character.actor, "walk");
                            character.actor.animationClock.current = Math.max(0, Number(character.actor.animationClock.current) || 0) + dt;
                        }
                        script.commandTime += dt;
                        if (arrived) {
                            releaseCutsceneCharacterGotoMotion(state, character);
                            restoreCutsceneEnemyAnimation(script, character);
                            script.commandIndex += 1;
                            script.commandTime = 0;
                            script.commandStartedAt = null;
                        }
                    }
                }
                }
            } else {
                const dx = command.x - position.x;
                const dy = command.y - position.y;
                const distance = Math.hypot(dx, dy);
                if (distance <= 0.5) {
                    setCutsceneCharacterMotion(state, character, command.x, command.y, 0, 0);
                    releaseCutsceneCharacterGotoMotion(state, character);
                    restoreCutsceneEnemyAnimation(script, character);
                    script.commandIndex += 1;
                    script.commandTime = 0;
                    script.commandStartedAt = null;
                } else {
                    const travel = Math.min(distance, Math.max(0, speed) * dt);
                    const ux = dx / distance;
                    const uy = dy / distance;
                    const arrived = travel >= distance - 0.000001;
                    setCutsceneCharacterMotion(
                        state,
                        character,
                        arrived ? command.x : position.x + ux * travel,
                        arrived ? command.y : position.y + uy * travel,
                        arrived ? 0 : ux * speed,
                        arrived ? 0 : uy * speed
                    );
                    if (character.kind === "enemy") {
                        const locomotionSlot = character.actor.locomotion === "flying" ? "fly" : "walk";
                        if (character.actor.animationSlot !== locomotionSlot) setCharacterEnemyAnimation(character.actor, locomotionSlot);
                        character.actor.animationClock.current = Math.max(0, Number(character.actor.animationClock.current) || 0) + dt;
                    }
                    script.commandTime += dt;
                    if (arrived) {
                        releaseCutsceneCharacterGotoMotion(state, character);
                        restoreCutsceneEnemyAnimation(script, character);
                        script.commandIndex += 1;
                        script.commandTime = 0;
                        script.commandStartedAt = null;
                    }
                }
            }
        }
    } else if (command.type === "SAY" || command.type === "THINK") {
        const character = cutsceneCharacter(state, command.characterId);
        if (!character) {
            cutsceneRuntimeError(state, script, command, `Unknown character "${command.characterId}".`);
            script.commandIndex += 1;
            script.commandTime = 0;
            script.commandStartedAt = null;
        } else {
            const startedThisFrame = script.commandTime <= 0.000001;
            script.commandTime += dt;
            const skipped = !startedThisFrame && Boolean(input.jumpPressed || input.weaponPressed);
            if (skipped || script.commandTime >= command.duration) {
                script.commandIndex += 1;
                script.commandTime = 0;
                script.commandStartedAt = null;
            }
        }
    } else if (command.type === "DELAY") {
        script.commandTime += dt;
        if (script.commandTime >= command.duration) {
            script.commandIndex += 1;
            script.commandTime = 0;
            script.commandStartedAt = null;
        }
    }

    if (script.commandIndex >= script.commands.length) {
        completeCutsceneScript(state, script);
        return false;
    }

    state.player.ax = 0;
    state.player.ay = 0;
    updateCutsceneCamera(state, dt);
    return true;
}

function proximityTextEntities(entities) {
    return (entities || []).filter((entity) =>
        entity?.type === "proximityText" || entity?.interaction === "proximityText"
    );
}

function normalizeProximityTextFontFamily(value) {
    const family = String(value || "inter").trim().toLowerCase();
    return family === "caveat" || family === "cursive" ? "caveat" : "inter";
}

function proximityTextNumber(entity, field, fallback) {
    const value = Number(entity?.[field]);
    return Number.isFinite(value) ? value : fallback;
}

function proximityTextRecord(entity) {
    const initialState = String(entity?.state || "armed");
    const completed = initialState === "complete";
    return {
        id: String(entity?.id || ""),
        entityId: String(entity?.id || ""),
        x: proximityTextNumber(entity, "x", 0),
        y: proximityTextNumber(entity, "y", 0),
        triggerX: proximityTextNumber(entity, "x", 0) + proximityTextNumber(entity, "triggerOffsetX", 0),
        triggerY: proximityTextNumber(entity, "y", 0) + proximityTextNumber(entity, "triggerOffsetY", 0),
        triggerDistance: Math.max(8, proximityTextNumber(entity, "triggerDistance", 300)),
        text: String(entity?.text || "Lorem ipsum"),
        fontSize: Math.max(8, proximityTextNumber(entity, "fontSize", 100)),
        fontFamily: normalizeProximityTextFontFamily(entity?.fontFamily),
        color: String(entity?.color || "#723891"),
        outlineWidth: Math.max(0, proximityTextNumber(entity, "outlineWidth", 3)),
        outlineColor: String(entity?.outlineColor || "#0f0113"),
        fadeInDuration: Math.max(0.01, proximityTextNumber(entity, "fadeInDuration", 1)),
        displayDuration: Math.max(0, proximityTextNumber(entity, "displayDuration", 5)),
        fadeOutDuration: Math.max(0.01, proximityTextNumber(entity, "fadeOutDuration", 1)),
        phase: completed ? "complete" : "armed",
        phaseTime: 0,
        alpha: 0,
        active: false,
        completed
    };
}

function configureProximityTexts(state, entities) {
    state.story.proximityTexts = proximityTextEntities(entities).map(proximityTextRecord);
    return state.story.proximityTexts.length > 0;
}

function updateProximityTexts(state, dt) {
    const player = state.player;
    const playerX = Number(player?.currentTransform?.x) || Number(player?.x) || 0;
    const playerY = (Number(player?.currentTransform?.y) || Number(player?.y) || 0) - Math.max(1, Number(player?.height) || 104) * 0.5;
    for (const notification of state.story?.proximityTexts || []) {
        if (notification.completed) continue;
        if (notification.phase === "armed") {
            if (player?.visible === false || player?.combatState === "dead") continue;
            if (Math.hypot(playerX - notification.triggerX, playerY - notification.triggerY) > notification.triggerDistance) continue;
            notification.phase = "fadeIn";
            notification.phaseTime = 0;
            notification.alpha = 0;
            notification.active = true;
            addEvent(state, "PROXIMITY_TEXT_TRIGGERED", { sourceId: notification.entityId });
        }

        notification.phaseTime += dt;
        if (notification.phase === "fadeIn") {
            notification.alpha = clamp(notification.phaseTime / notification.fadeInDuration, 0, 1);
            if (notification.phaseTime >= notification.fadeInDuration) {
                notification.phase = "display";
                notification.phaseTime = 0;
                notification.alpha = 1;
            }
        } else if (notification.phase === "display") {
            notification.alpha = 1;
            if (notification.phaseTime >= notification.displayDuration) {
                notification.phase = "fadeOut";
                notification.phaseTime = 0;
            }
        } else if (notification.phase === "fadeOut") {
            notification.alpha = 1 - clamp(notification.phaseTime / notification.fadeOutDuration, 0, 1);
            if (notification.phaseTime >= notification.fadeOutDuration) {
                notification.phase = "complete";
                notification.phaseTime = 0;
                notification.alpha = 0;
                notification.active = false;
                notification.completed = true;
                if (notification.entityId) setWorldEntityState(state, notification.entityId, "complete");
                addEvent(state, "PROXIMITY_TEXT_COMPLETED", { sourceId: notification.entityId });
            }
        }
    }
}

function updateOverheadSymbol(state, dt) {
    const active = state.story?.overheadSymbol;
    if (active) {
        active.remaining = Math.max(0, (Number(active.remaining) || 0) - dt);
        if (active.remaining <= 0) state.story.overheadSymbol = null;
    }
    if (state.story?.overheadSymbol) return;
    for (const trigger of state.story?.symbolTriggers || []) {
        if (trigger.completed) continue;
        const entity = worldEntityById(state, trigger.id);
        if (!entity) { trigger.completed = true; continue; }
        const horizontalDistance = Math.abs(state.player.currentTransform.x - (Number(entity.x) || 0));
        const verticalDistance = Math.abs(state.player.currentTransform.y - (Number(entity.y) || 0));
        if (horizontalDistance > trigger.triggerDistance || verticalDistance > trigger.verticalTolerance) continue;
        trigger.completed = true;
        if (!setWorldEntityState(state, trigger.id, "consumed")) {
            entity.state = "consumed";
            if (!state.world.entityStates) state.world.entityStates = {};
            state.world.entityStates[trigger.id] = "consumed";
        }
        state.story.overheadSymbol = {
            triggerId: trigger.id,
            atlasId: trigger.atlasId,
            assetId: trigger.assetId,
            remaining: trigger.duration,
            duration: trigger.duration
        };
        addEvent(state, trigger.type === "questionMarkTrigger" ? "PLAYER_QUESTION_MARK_TRIGGERED" : "PLAYER_EXCLAMATION_MARK_TRIGGERED", { triggerId: trigger.id });
        break;
    }
}

function startMailboxStory(state, story) {
    story.active = true;
    story.completed = false;
    story.phase = story.storyKind === "locationThought" ? "thought" : "letter";
    story.phaseTime = 0;
    story.startedAt = state.clock.time;
    state.story.mailboxEvent = story;
    setWorldEntityState(state, story.mailboxId, story.consumedState || "empty");
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.ax = 0;
    state.player.ay = 0;
    if (story.storyKind === "locationThought") {
        addEvent(state, "LOCATION_THOUGHT_TRIGGERED", { triggerId: story.mailboxId });
    } else {
        addEvent(state, "MAILBOX_LETTER_OPENED", { mailboxId: story.mailboxId });
    }
}

function advanceMailboxStory(state, story, phase, reason) {
    story.phase = phase;
    story.phaseTime = 0;
    if (phase === "thought") {
        const eventType = story.storyKind === "locationThought" ? "LOCATION_THOUGHT_SHOWN" : "MAILBOX_THOUGHT_SHOWN";
        addEvent(state, eventType, story.storyKind === "locationThought"
            ? { triggerId: story.mailboxId, reason }
            : { mailboxId: story.mailboxId, reason });
    } else if (phase === "complete") {
        story.active = false;
        story.completed = true;
        story.completedAt = state.clock.time;
        state.player.vx = 0;
        state.player.vy = 0;
        state.story.mailboxEvent = null;
        const eventType = story.storyKind === "locationThought" ? "LOCATION_THOUGHT_COMPLETE" : "MAILBOX_EVENT_COMPLETE";
        addEvent(state, eventType, story.storyKind === "locationThought"
            ? { triggerId: story.mailboxId, reason }
            : { mailboxId: story.mailboxId, reason });
    }
}

function updateMailboxStory(state, input, dt) {
    let story = state.story?.mailboxEvent || null;
    if (!story && state.player?.lungeActive) return false;
    if (!story) {
        for (const candidate of state.story?.mailboxEvents || []) {
            if (candidate.completed || candidate.active) continue;
            const mailbox = worldEntityById(state, candidate.mailboxId);
            if (!mailbox) continue;
            const horizontalDistance = Math.abs(state.player.currentTransform.x - (Number(mailbox.x) || 0));
            const verticalDistance = Math.abs(state.player.currentTransform.y - (Number(mailbox.y) || 0));
            if (horizontalDistance <= candidate.triggerDistance && verticalDistance <= candidate.verticalTolerance) {
                story = candidate;
                startMailboxStory(state, story);
                break;
            }
        }
        if (!story) return false;
    }

    const mailbox = worldEntityById(state, story.mailboxId);
    if (!mailbox) {
        story.completed = true;
        story.phase = "complete";
        state.story.mailboxEvent = null;
        return false;
    }

    const startedThisFrame = story.phaseTime === 0 && story.startedAt === state.clock.time;
    const p = state.player;
    story.phaseTime += dt;
    p.ax = 0;
    p.ay = 0;
    p.vx = 0;
    p.vy = 0;
    p.onGround = true;
    p.wasOnGround = true;

    const skipped = !startedThisFrame && Boolean(input.jumpPressed || input.weaponPressed);
    if (story.phase === "letter" && (skipped || story.phaseTime >= story.letterDuration)) {
        if (story.thoughtText.trim()) advanceMailboxStory(state, story, "thought", skipped ? "jump" : "timeout");
        else advanceMailboxStory(state, story, "complete", skipped ? "jump" : "timeout");
    } else if (story.phase === "thought" && (skipped || story.phaseTime >= story.thoughtDuration)) {
        advanceMailboxStory(state, story, "complete", skipped ? "jump" : "timeout");
    }

    const focusX = story.phase === "thought"
        ? p.currentTransform.x + 165
        : (p.currentTransform.x + (Number(mailbox.x) || p.currentTransform.x)) * 0.5;
    state.camera.currentTransform.x += (focusX - state.camera.currentTransform.x) * Math.min(1, dt * 5);
    state.camera.currentTransform.y += (p.currentTransform.y - 170 - state.camera.currentTransform.y) * Math.min(1, dt * 5);
    return true;
}


function signalChannelRecord(state, channel, create = false) {
    if (!state?.world) return null;
    const normalizedChannel = normalizeSignalChannel(channel);
    if (!state.world.signalChannels || typeof state.world.signalChannels !== "object") {
        if (!create) return null;
        state.world.signalChannels = {};
    }
    if (!state.world.signalChannels[normalizedChannel] && create) {
        state.world.signalChannels[normalizedChannel] = {
            channel: normalizedChannel,
            active: false,
            revision: 0,
            lastSourceId: null,
            lastEmittedAt: null
        };
    }
    return state.world.signalChannels[normalizedChannel] || null;
}

export function emitSignalChannel(state, channel, options = {}) {
    const record = signalChannelRecord(state, channel, true);
    if (!record) return null;
    const nextActive = options.toggle === true
        ? !record.active
        : options.active === undefined
            ? record.active
            : Boolean(options.active);
    record.active = nextActive;
    record.revision += 1;
    record.lastSourceId = options.sourceId ? String(options.sourceId) : null;
    record.lastEmittedAt = state.clock?.time ?? 0;
    addEvent(state, "SIGNAL_CHANNEL_EMITTED", {
        channel: record.channel,
        active: record.active,
        revision: record.revision,
        sourceId: record.lastSourceId
    });
    return record;
}

function setWorldEntityLogicalState(state, entityId, nextState) {
    const entity = worldEntityById(state, entityId);
    if (entity) entity.state = nextState;
    if (!state.world.entityStates) state.world.entityStates = {};
    state.world.entityStates[entityId] = nextState;
    return Boolean(entity);
}

function setSignalEntityOpacity(state, entityId, previousOpacity, nextOpacity) {
    const previous = clamp(Number(previousOpacity) || 0, 0, 1);
    const next = clamp(Number(nextOpacity) || 0, 0, 1);
    const factor = previous > 0.000001 ? next / previous : 0;
    for (const visual of state.world?.visuals || []) {
        if (visual.entityId !== entityId) continue;
        visual.alpha = clamp((Number(visual.alpha ?? 1) || 0) * factor, 0, 1);
    }
}

function beginSignalEntityFade(target) {
    target.fading = true;
    target.fadeElapsed = 0;
    target.fadeOpacity = 1;
}

function updateSignalEntityFade(state, target, dt) {
    if (!target?.fading) return false;
    const previousOpacity = clamp(Number(target.fadeOpacity ?? 1), 0, 1);
    target.fadeElapsed = Math.max(0, Number(target.fadeElapsed) || 0) + Math.max(0, Number(dt) || 0);
    const nextOpacity = 1 - clamp(target.fadeElapsed / SIGNAL_DISAPPEAR_FADE_SECONDS, 0, 1);
    setSignalEntityOpacity(state, target.id, previousOpacity, nextOpacity);
    target.fadeOpacity = nextOpacity;
    if (nextOpacity > 0) return false;
    target.fading = false;
    return true;
}

function removeSignalEntityFromWorld(state, target) {
    if (!state?.world || !target?.id || target.removed) return false;
    const entityId = target.id;
    target.removed = true;
    target.fading = false;
    target.fadeOpacity = 0;

    // Signal gates are ordinary atlas-backed entity visuals. Their authored collision
    // lines/polygons live separately from the synthetic signal receiver solid, so all
    // geometry owned by the disappearing visuals must leave the world with the entity.
    const removedVisualIds = new Set(
        (state.world.visuals || [])
            .filter((visual) => visual.entityId === entityId)
            .map((visual) => visual.id)
            .filter(Boolean)
    );
    const removedCollisionIds = new Set();
    for (const segment of state.world.segments || []) {
        if (removedVisualIds.has(segment.visualId) && segment.id) removedCollisionIds.add(segment.id);
    }
    for (const polygon of state.world.collisionPolygons || []) {
        if (removedVisualIds.has(polygon.visualId) && polygon.id) removedCollisionIds.add(polygon.id);
    }
    for (const solid of state.world.solids || []) {
        if (solid.signalReceiverId === entityId && solid.id) removedCollisionIds.add(solid.id);
    }

    state.world.visuals = (state.world.visuals || []).filter((visual) => visual.entityId !== entityId);
    state.world.entities = (state.world.entities || []).filter((entity) => entity?.id !== entityId);
    state.world.solids = (state.world.solids || []).filter((solid) => solid.signalReceiverId !== entityId);
    state.world.segments = (state.world.segments || []).filter((segment) => !removedVisualIds.has(segment.visualId));
    state.world.collisionPolygons = (state.world.collisionPolygons || []).filter((polygon) => !removedVisualIds.has(polygon.visualId));
    syncMovingPlatformCollisionCounts(state);

    if (removedCollisionIds.has(state.player?.supportId)) {
        state.player.supportId = null;
        state.player.onGround = false;
    }
    for (const enemy of state.enemies || []) {
        if (enemy?.kind !== "characterEnemy" || !removedCollisionIds.has(enemy.supportId)) continue;
        enemy.supportId = null;
        enemy.ridingPlatformId = null;
        enemy.currentSupportId = null;
        if (enemy.locomotion !== "flying") enemy.airborne = true;
    }

    if (state.world.entityStates) delete state.world.entityStates[entityId];
    return true;
}

function signalReceiverCollisionRect(receiver) {
    const width = Math.max(1, Number(receiver?.collisionWidth) || Number(receiver?.width) || 1);
    const height = Math.max(1, Number(receiver?.collisionHeight) || Number(receiver?.height) || 1);
    const offsetX = Number(receiver?.collisionOffsetX) || 0;
    const offsetY = Number(receiver?.collisionOffsetY) || 0;
    const insetX = clamp(Number(receiver?.collisionInsetX) || 0, 0, width * 0.45);
    const insetTop = clamp(Number(receiver?.collisionInsetTop) || 0, 0, height * 0.9);
    const insetBottom = clamp(Number(receiver?.collisionInsetBottom) || 0, 0, height * 0.9 - insetTop);
    return {
        x: (Number(receiver?.x) || 0) + offsetX - width * 0.5 + insetX,
        y: (Number(receiver?.y) || 0) + offsetY - height + insetTop,
        w: Math.max(1, width - insetX * 2),
        h: Math.max(1, height - insetTop - insetBottom)
    };
}

function syncSignalReceiverCollision(state, receiver) {
    if (!state?.world || !receiver?.id) return;
    state.world.solids = (state.world.solids || []).filter((solid) => solid.signalReceiverId !== receiver.id);
    if (!receiver.blocksPlayer || receiver.removed) return;
    state.world.solids.push({
        id: `${receiver.id}_signal_solid`,
        kind: "signalGate",
        signalReceiverId: receiver.id,
        ...signalReceiverCollisionRect(receiver)
    });
}

function updateSignalReceivers(state, dt = 0) {
    for (const receiver of state.world?.signalReceivers || []) {
        if (receiver.removed) continue;
        const channel = signalChannelRecord(state, receiver.channel, true);
        const open = receiver.invertSignal ? !channel.active : channel.active;
        if (!receiver.open && open) {
            receiver.open = true;
            setWorldEntityLogicalState(state, receiver.id, receiver.openState);
            beginSignalEntityFade(receiver);
            syncSignalReceiverCollision(state, receiver);
            addEvent(state, "SIGNAL_GATE_OPENED", {
                gateId: receiver.id,
                channel: receiver.channel,
                state: receiver.openState
            });
        }
        if (receiver.open && updateSignalEntityFade(state, receiver, dt)) {
            removeSignalEntityFromWorld(state, receiver);
        }
    }
    state.world.signalReceivers = (state.world.signalReceivers || []).filter((receiver) => !receiver.removed);
}

function configureSignalSystem(state, entities = []) {
    if (!state?.world) return;
    state.world.signalChannels = {};
    state.world.signalEmitters = entities
        .filter(isSignalEmitterEntity)
        .map((entity) => normalizeSignalEmitter(entity))
        .filter(Boolean)
        .map((emitter) => ({ ...emitter, playerNearby: false, fading: false, fadeElapsed: 0, fadeOpacity: 1, removed: false }));
    state.world.signalReceivers = entities
        .filter(isSignalReceiverEntity)
        .map((entity) => normalizeSignalReceiver(entity))
        .filter(Boolean)
        .map((receiver) => ({ ...receiver, open: false, fading: false, fadeElapsed: 0, fadeOpacity: 1, removed: false }));
    for (const emitter of state.world.signalEmitters) {
        signalChannelRecord(state, emitter.channel, true);
    }
    for (const receiver of state.world.signalReceivers) {
        signalChannelRecord(state, receiver.channel, true);
        syncSignalReceiverCollision(state, receiver);
    }
    for (const platform of state.world.movingPlatforms || []) {
        if (platform.movement?.activation === "signal") {
            signalChannelRecord(state, platform.movement.signalChannel, true);
        }
    }
    updateSignalReceivers(state);
}

function inventoryItemCount(state, itemId) {
    return Math.max(0, Number(state.inventory?.items?.[String(itemId || "")]) || 0);
}

function addInventoryItem(state, itemId, amount = 1) {
    const id = String(itemId || "").trim();
    if (!id) return 0;
    if (!state.inventory || typeof state.inventory !== "object") state.inventory = { items: {} };
    if (!state.inventory.items || typeof state.inventory.items !== "object") state.inventory.items = {};
    const next = inventoryItemCount(state, id) + Math.max(0, Math.floor(Number(amount) || 0));
    state.inventory.items[id] = next;
    return next;
}

function consumeInventoryItem(state, itemId, amount = 1) {
    const id = String(itemId || "").trim();
    const requested = Math.max(0, Math.floor(Number(amount) || 0));
    const current = inventoryItemCount(state, id);
    if (!id || requested <= 0 || current < requested) return false;
    const next = current - requested;
    if (next > 0) state.inventory.items[id] = next;
    else delete state.inventory.items[id];
    return true;
}

function ensureStatusEffects(state) {
    if (!state.statusEffects || typeof state.statusEffects !== "object") {
        state.statusEffects = { active: {} };
    }
    if (!state.statusEffects.active || typeof state.statusEffects.active !== "object") {
        state.statusEffects.active = {};
    }
    return state.statusEffects.active;
}

function activatePowerUpEffect(state, pickup) {
    const powerUp = normalizePowerUpPickup(pickup?.powerUp || pickup);
    const definition = powerUp?.effect || powerUpEffectDefinition(powerUp?.effectId);
    if (!definition) return false;

    const activeEffects = ensureStatusEffects(state);
    const replacedEffectIds = [];
    if (definition.exclusiveGroup && definition.groupId) {
        for (const [effectId, raw] of Object.entries(activeEffects)) {
            const active = normalizeActivePowerUpEffect(raw);
            if (!active || active.id === definition.id) continue;
            if (active.definition.groupId !== definition.groupId) continue;
            replacedEffectIds.push(active.id);
            delete activeEffects[effectId];
            addEvent(state, "POWER_UP_EFFECT_CANCELLED", {
                effectId: active.id,
                replacementEffectId: definition.id,
                groupId: definition.groupId,
                pickupId: pickup?.id || null
            });
        }
    }

    const existing = normalizeActivePowerUpEffect(activeEffects[definition.id]);
    let next = existing;
    let eventType = replacedEffectIds.length ? "POWER_UP_EFFECT_REPLACED" : "POWER_UP_EFFECT_ACTIVATED";
    if (!existing) {
        next = normalizeActivePowerUpEffect({
            id: definition.id,
            definition,
            remainingSeconds: definition.durationSeconds,
            sourceId: pickup?.id || null,
            activatedAt: state.clock.time,
            refreshCount: 0
        });
    } else if (definition.stacking === "extend" && !definition.permanent) {
        next.remainingSeconds += definition.durationSeconds;
        next.refreshCount += 1;
        next.sourceId = pickup?.id || next.sourceId;
        eventType = "POWER_UP_EFFECT_EXTENDED";
    } else if (definition.stacking === "refresh" && !definition.permanent) {
        next.remainingSeconds = definition.durationSeconds;
        next.refreshCount += 1;
        next.sourceId = pickup?.id || next.sourceId;
        next.activatedAt = state.clock.time;
        eventType = "POWER_UP_EFFECT_REFRESHED";
    } else {
        eventType = "POWER_UP_EFFECT_IGNORED";
    }

    activeEffects[definition.id] = next;

    if (definition.id === POWER_UP_EFFECT_IDS.FLIGHT) {
        const rocket = state.equipment.rocket;
        const boostWasActive = Boolean(rocket.attachedBoosting);
        rocket.attachedBoosting = false;
        rocket.state = "flight";
        rocket.attachedBoostTime = 0;
        rocket.boostBurstTimer = 0;
        rocket.boostAccelerationNow = 0;
        rocket.boostVisualPowerNow = Math.max(0.18, Number(state.tuning.attachedBoostVisualIdlePower) || 0);
        rocket.attachedSmokeTimer = 0;
        state.player.ordinaryJumpActive = false;
        state.player.airBoostArmed = false;
        const flightSpeed = Math.max(1, Number(state.tuning.flightVerticalSpeed) || DEFAULT_TUNING.flightVerticalSpeed)
            * playerMovementSpeedScale(state);
        state.player.vy = clamp(state.player.vy, -flightSpeed, flightSpeed);
        if (boostWasActive) {
            addEvent(state, "PLAYER_BOOST_ENDED", { reason: "flightActivated" });
        }
    }

    addEvent(state, eventType, {
        effectId: definition.id,
        pickupId: pickup?.id || null,
        remainingSeconds: next?.remainingSeconds,
        permanent: definition.permanent,
        refreshCount: next?.refreshCount || 0,
        groupId: definition.groupId || null,
        replacedEffectIds
    });
    return true;
}

function updateStatusEffects(state, dt) {
    const activeEffects = ensureStatusEffects(state);
    for (const [effectId, raw] of Object.entries(activeEffects)) {
        const active = normalizeActivePowerUpEffect(raw);
        if (!active) {
            delete activeEffects[effectId];
            continue;
        }
        if (active.definition.permanent) {
            activeEffects[active.id] = active;
            if (effectId !== active.id) delete activeEffects[effectId];
            continue;
        }
        active.remainingSeconds = Math.max(0, active.remainingSeconds - Math.max(0, dt));
        if (active.remainingSeconds <= 0) {
            delete activeEffects[effectId];
            addEvent(state, "POWER_UP_EFFECT_EXPIRED", { effectId: active.id });
        } else {
            activeEffects[active.id] = active;
            if (effectId !== active.id) delete activeEffects[effectId];
        }
    }
}

function clearDeathResetPowerUps(state) {
    const activeEffects = ensureStatusEffects(state);
    for (const [effectId, raw] of Object.entries(activeEffects)) {
        const active = normalizeActivePowerUpEffect(raw);
        if (!active || active.definition.clearOnDeath) {
            delete activeEffects[effectId];
        }
    }
}

function clearLevelStartTransientStatus(state) {
    // Permanent upgrades live in playerProgression and are deliberately retained.
    // A successful level load starts from clean transient movement/status state.
    state.statusEffects = { active: {} };
    if (state.health) {
        state.health.lastDamagedAt = null;
        state.health.invulnerabilityTimer = 0;
        state.health.contactInvulnerabilityTimer = 0;
        state.health.regenerating = false;
        state.health.low = false;
    }
    if (state.fuel) {
        state.fuel.rechargeDelayTimer = 0;
        state.fuel.rechargeLatched = false;
    }
    const rocket = state.equipment?.rocket;
    if (rocket) {
        rocket.state = "mountedReady";
        rocket.attachedBoosting = false;
        rocket.attachedBoostTime = 0;
        rocket.boostKickCharge = state.tuning?.attachedBoostKickChargeMax ?? 1;
        rocket.boostBurstTimer = 0;
        rocket.boostAccelerationNow = 0;
        rocket.boostVisualPowerNow = 0;
        rocket.attachedSmokeTimer = 0;
        rocket.fuelBulbFlashTimer = 0;
    }
    if (state.player) {
        state.player.vx = 0;
        state.player.vy = 0;
        state.player.ax = 0;
        state.player.ay = 0;
        state.player.onGround = false;
        state.player.wasOnGround = false;
        state.player.airborneTime = 0;
        state.player.coyoteTimer = 0;
        state.player.supportId = null;
        state.player.groundStride = null;
        state.player.dropThroughTimer = 0;
        state.player.inWater = false;
        state.player.waterSubmersion = 0;
        state.player.waterRegionId = null;
        state.player.crushCandidateTicks = 0;
        state.player.crushCandidateKey = null;
        state.player.crushCandidateDetail = null;
        state.player.airBoostArmed = false;
        state.player.ordinaryJumpActive = false;
        state.player.ordinaryJumpStartY = null;
        state.player.ordinaryJumpApexY = null;
        clearPlayerLungeState(state);
        state.player.fallImpactExplosionCooldownTimer = 0;
        state.player.bodySlamCommitted = false;
        state.player.bodySlamImmunityTimer = 0;
        state.player.lowHealthPulse = 0;
    }
    // Projectiles and transient world particles belong to the level that emitted
    // them. A level boundary is a hard simulation boundary: none may hitchhike
    // into the newly loaded world.
    if (Array.isArray(state.projectiles)) state.projectiles.length = 0;
    if (Array.isArray(state.effects?.smokePuffs)) state.effects.smokePuffs.length = 0;
}

function updatePickupRespawns(state, dt) {
    for (const pickup of state.pickups || []) {
        if (!pickup.collected || !(Number(pickup.respawnSeconds) > 0)) continue;
        pickup.respawnTimer = Math.max(0, (Number(pickup.respawnTimer) || 0) - Math.max(0, dt));
        if (pickup.respawnTimer > 0) continue;
        respawnPickup(state, pickup, "timer");
    }
}

function respawnPickup(state, pickup, reason) {
    if (!pickup?.collected || !(Number(pickup.respawnSeconds) > 0) || pickup.kind === "upgrade" || pickup.upgradeKind) {
        return false;
    }
    pickup.collected = false;
    pickup.respawnTimer = 0;
    setWorldEntityState(state, pickup.entityId || pickup.id, "available");
    addEvent(state, "POWER_UP_PICKUP_RESPAWNED", {
        pickupId: pickup.id,
        effectId: pickup.powerUp?.effectId || null,
        respawnSeconds: pickup.respawnSeconds,
        reason
    });
    return true;
}

function respawnDeathEligiblePickups(state) {
    for (const pickup of state.pickups || []) {
        respawnPickup(state, pickup, "playerDeath");
    }
}

function updatePickups(state) {
    const playerRect = getPlayerRect(state);
    const playerCenterX = playerRect.x + playerRect.w * 0.5;
    const playerCenterY = playerRect.y + playerRect.h * 0.5;
    for (const pickup of state.pickups || []) {
        if (pickup.collected) continue;
        const pickupCenterY = Number.isFinite(Number(pickup.centerY))
            ? Number(pickup.centerY)
            : (Number(pickup.y) || 0) - (Number(pickup.height) || 0) * 0.5;
        const reach = Math.max(1, Number(pickup.radius) || 14) + playerRect.w * 0.45;
        const pickupDistance = Math.hypot(playerCenterX - pickup.x, playerCenterY - pickupCenterY)
            * PICKUP_PROXIMITY_DISTANCE_SCALE;
        if (pickupDistance > reach) continue;

        pickup.collected = true;
        pickup.respawnTimer = Math.max(0, Number(pickup.respawnSeconds) || 0);
        const entity = worldEntityById(state, pickup.entityId || pickup.id);
        if (entity) {
            entity.state = "collected";
            setWorldEntityState(state, entity.id, "collected");
        }
        if (pickup.kind === "score" || Number(pickup.scoreValue) > 0) {
            const scoreValue = Math.max(1, Math.floor(Number(pickup.scoreValue) || Number(pickup.amount) || 1));
            const score = addScore(state, scoreValue, {
                sourceId: pickup.id,
                x: pickup.x,
                y: pickupCenterY
            });
            addEvent(state, "SCORE_PICKUP_COLLECTED", { pickupId: pickup.id, scoreValue, score });
        } else if (pickup.kind === "upgrade" || pickup.upgradeKind) {
            collectPlayerUpgrade(state, pickup.upgradeKind || pickup.pickupKind, pickup.id);
        } else if (pickup.kind === "fuel" || pickup.pickupKind === "fuel") {
            const flightPickup = {
                ...pickup,
                kind: "powerUp",
                pickupKind: POWER_UP_EFFECT_IDS.FLIGHT,
                powerUp: normalizePowerUpPickup({
                    effectId: POWER_UP_EFFECT_IDS.FLIGHT,
                    radius: pickup.radius
                })
            };
            activatePowerUpEffect(state, flightPickup);
            addEvent(state, "POWER_UP_PICKUP_COLLECTED", {
                pickupId: pickup.id,
                effectId: POWER_UP_EFFECT_IDS.FLIGHT,
                respawnSeconds: pickup.respawnSeconds
            });
        } else if (pickup.kind === "powerUp" || pickup.powerUp) {
            activatePowerUpEffect(state, pickup);
            addEvent(state, "POWER_UP_PICKUP_COLLECTED", {
                pickupId: pickup.id,
                effectId: pickup.powerUp?.effectId || null,
                respawnSeconds: pickup.respawnSeconds
            });
        } else {
            const itemId = String(pickup.pickupKind || pickup.kind || "item");
            const count = addInventoryItem(state, itemId, pickup.amount);
            addEvent(state, "ITEM_PICKUP_COLLECTED", {
                pickupId: pickup.id,
                itemId,
                amount: Math.max(1, Math.floor(Number(pickup.amount) || 1)),
                count
            });
        }
    }
}

function checkpointActivationRect(entity) {
    const width = Math.max(1, Number(entity?.w) || 70);
    const height = Math.max(1, Number(entity?.h) || 88);
    const distance = Math.max(0, Number(entity?.activationDistance) || 20);
    return {
        x: (Number(entity?.x) || 0) - width * 0.5 - distance,
        y: (Number(entity?.y) || 0) - height - distance,
        w: width + distance * 2,
        h: height + distance * 2
    };
}

function activateCheckpointRune(state, checkpoint) {
    if (!state?.player || !checkpoint?.id || checkpoint.state === "active") return false;
    for (const entity of state.world?.entities || []) {
        if (!checkpointRuneLike(entity) || entity.id === checkpoint.id || entity.state !== "active") continue;
        if (!setWorldEntityState(state, entity.id, "inactive")) {
            entity.state = "inactive";
            state.world.entityStates[entity.id] = "inactive";
        }
    }

    const player = state.player;
    player.spawnX = player.currentTransform.x;
    player.spawnY = player.currentTransform.y;
    if (!setWorldEntityState(state, checkpoint.id, "active")) {
        checkpoint.state = "active";
        state.world.entityStates[checkpoint.id] = "active";
    }
    addEvent(state, "CHECKPOINT_ACTIVATED", {
        checkpointId: checkpoint.id,
        x: round(player.spawnX),
        y: round(player.spawnY)
    });
    return true;
}

function updateCheckpointRunes(state) {
    const player = state?.player;
    if (!player || playerDeathActive(state) || player.combatState === "dead" || !player.targetable || !player.onGround) {
        return false;
    }
    const playerRect = getPlayerRect(state);
    const candidates = (state.world?.entities || [])
        .filter((entity) => checkpointRuneLike(entity) && entity.state !== "active" && rectsOverlap(playerRect, checkpointActivationRect(entity)))
        .sort((a, b) => Math.hypot(player.currentTransform.x - (Number(a.x) || 0), player.currentTransform.y - (Number(a.y) || 0))
            - Math.hypot(player.currentTransform.x - (Number(b.x) || 0), player.currentTransform.y - (Number(b.y) || 0)));
    return candidates.length ? activateCheckpointRune(state, candidates[0]) : false;
}

function treasureChestLike(entity) {
    const type = String(entity?.type || "");
    return type === "treasureChest" || entity?.interaction === "openChest";
}

function normalizedScoreValue(value, fallback = 100) {
    const numeric = Number(value);
    return Math.max(1, Math.floor(Number.isFinite(numeric) ? numeric : fallback));
}

function normalizedScore(state) {
    const numeric = Number(state?.score);
    return Math.max(0, Math.floor(Number.isFinite(numeric) ? numeric : 0));
}

export function addScore(state, amount, detail = {}) {
    if (!state || typeof state !== "object") return 0;
    const requested = Math.max(0, Math.floor(Number(amount) || 0));
    const previousScore = normalizedScore(state);
    const score = Math.max(0, previousScore + requested);
    state.score = score;
    if (score !== previousScore) {
        addEvent(state, "SCORE_CHANGED", {
            amount: score - previousScore,
            previousScore,
            score,
            sourceId: detail.sourceId || null,
            x: Number.isFinite(Number(detail.x)) ? Number(detail.x) : null,
            y: Number.isFinite(Number(detail.y)) ? Number(detail.y) : null
        });
    }
    return score;
}

function treasureChestCollectionRect(chest) {
    const width = Math.max(1, Number(chest?.width) || 130);
    const height = Math.max(1, Number(chest?.height) || 150);
    const distance = Math.max(8, Number(chest?.collectionDistance) || 88);
    return {
        x: (Number(chest?.x) || 0) - width * 0.5 - distance,
        y: (Number(chest?.y) || 0) - height - distance * 0.55,
        w: width + distance * 2,
        h: height + distance * 1.1
    };
}

function setTreasureChestState(state, chest, nextState) {
    if (!chest || chest.state === nextState) return false;
    const previousState = chest.state;
    chest.state = nextState;
    const entity = worldEntityById(state, chest.entityId || chest.id);
    if (entity) {
        entity.state = nextState;
        entity.collected = chest.collected === true;
        entity.scoreValue = chest.scoreValue;
        entity.collectionDistance = chest.collectionDistance;
        if (!setWorldEntityState(state, entity.id, nextState)) {
            if (!state.world.entityStates) state.world.entityStates = {};
            state.world.entityStates[entity.id] = nextState;
        }
    }
    addEvent(state, "TREASURE_CHEST_STATE_CHANGED", {
        chestId: chest.id,
        previousState,
        state: nextState
    });
    return true;
}

function updateTreasureChests(state, dt) {
    for (const chest of state.treasureChests || []) {
        if (chest.collected) {
            if (chest.state === "openLoot") {
                setTreasureChestState(state, chest, "openEmpty");
            }
            continue;
        }
        if (state.player?.targetable === false || state.player?.visible === false) continue;
        if (!rectsOverlap(getPlayerRect(state), treasureChestCollectionRect(chest))) continue;

        chest.collected = true;
        setTreasureChestState(state, chest, "openEmpty");
        const score = addScore(state, chest.scoreValue, {
            sourceId: chest.id,
            x: chest.x,
            y: chest.y - chest.height * 0.82
        });
        addEvent(state, "TREASURE_CHEST_COLLECTED", {
            chestId: chest.id,
            scoreValue: chest.scoreValue,
            score
        });
    }
}

function signalEmitterCenter(entity) {
    const height = Math.max(1, Number(entity?.h) || 80);
    const authoredFloorAnchor = Number(entity?.floorAnchorYFactor);
    const floorAnchorYFactor = Number.isFinite(authoredFloorAnchor)
        ? clamp(authoredFloorAnchor, 0, 1)
        : 1;
    return {
        x: Number(entity?.x) || 0,
        y: (Number(entity?.y) || 0) + height * (0.5 - floorAnchorYFactor)
    };
}

function signalEmitterPlayerDistance(state, entity) {
    const playerRect = getPlayerRect(state);
    const width = Math.max(1, Number(entity?.w) || 1);
    const height = Math.max(1, Number(entity?.h) || 1);
    const authoredFloorAnchor = Number(entity?.floorAnchorYFactor);
    const floorAnchorYFactor = Number.isFinite(authoredFloorAnchor)
        ? clamp(authoredFloorAnchor, 0, 1)
        : 1;
    const entityRect = {
        x: (Number(entity?.x) || 0) - width * 0.5,
        y: (Number(entity?.y) || 0) - height * floorAnchorYFactor,
        w: width,
        h: height
    };
    const dx = Math.max(entityRect.x - (playerRect.x + playerRect.w), playerRect.x - (entityRect.x + entityRect.w), 0);
    const dy = Math.max(entityRect.y - (playerRect.y + playerRect.h), playerRect.y - (entityRect.y + entityRect.h), 0);
    return Math.hypot(dx, dy);
}

function signalEmitterPlayerIsNearby(state, entity) {
    return signalEmitterPlayerDistance(state, entity) <= Math.max(1, Number(state.player?.width) || Number(state.tuning?.playerWidth) || 1);
}

function updateProximitySignalEmitters(state) {
    if (state.player?.visible === false || state.player?.combatState === "dead") return false;
    const playerCenterY = state.player.currentTransform.y - state.player.height * 0.5;
    let triggered = false;
    for (const emitter of state.world?.signalEmitters || []) {
        if (emitter.interaction !== "proximitySignal") continue;
        const entity = worldEntityById(state, emitter.id);
        if (!entity || entity.state === "triggered" || state.world?.entityStates?.[emitter.id] === "triggered") continue;
        const center = signalEmitterCenter(entity);
        const distance = Math.hypot(state.player.currentTransform.x - center.x, playerCenterY - center.y);
        if (distance > emitter.triggerDistance) continue;
        if (!setWorldEntityState(state, emitter.id, "triggered")) {
            entity.state = "triggered";
            if (!state.world.entityStates) state.world.entityStates = {};
            state.world.entityStates[emitter.id] = "triggered";
        }
        emitSignalChannel(state, emitter.channel, { sourceId: emitter.id, active: true });
        addEvent(state, "PROXIMITY_SIGNAL_TRIGGERED", {
            triggerId: emitter.id,
            channel: emitter.channel
        });
        triggered = true;
    }
    return triggered;
}

function updateSignalEmitters(state, input, dt = 0) {
    void input;
    let triggered = updateProximitySignalEmitters(state);
    for (const emitter of state.world?.signalEmitters || []) {
        if (emitter.interaction === "keyhole" && updateSignalEntityFade(state, emitter, dt)) {
            removeSignalEntityFromWorld(state, emitter);
        }
    }
    state.world.signalEmitters = (state.world.signalEmitters || []).filter((emitter) => !emitter.removed);
    if (state.player?.visible === false || state.player?.combatState === "dead") return triggered;

    for (const emitter of state.world?.signalEmitters || []) {
        if (emitter.interaction === "proximitySignal") continue;
        const entity = worldEntityById(state, emitter.id);
        if (!entity) continue;
        const nearby = signalEmitterPlayerIsNearby(state, entity);
        const entered = nearby && !emitter.playerNearby;
        emitter.playerNearby = nearby;
        if (!entered) continue;

        if (emitter.interaction === "keyhole") {
            if (emitter.oneShot && entity.state === "unlocked") continue;
            if (inventoryItemCount(state, emitter.requiredKey) <= 0) {
                addEvent(state, "KEYHOLE_MISSING_KEY", {
                    keyholeId: emitter.id,
                    channel: emitter.channel,
                    requiredKey: emitter.requiredKey
                });
                triggered = true;
                continue;
            }
            if (emitter.consumeKey) consumeInventoryItem(state, emitter.requiredKey, 1);
            setWorldEntityLogicalState(state, emitter.id, "unlocked");
            beginSignalEntityFade(emitter);
            emitSignalChannel(state, emitter.channel, { sourceId: emitter.id, active: true });
            addEvent(state, "KEYHOLE_UNLOCKED", {
                keyholeId: emitter.id,
                channel: emitter.channel,
                requiredKey: emitter.requiredKey,
                consumed: emitter.consumeKey
            });
            triggered = true;
            continue;
        }

        const nextOn = entity.state !== "on";
        if (!setWorldEntityState(state, emitter.id, nextOn ? "on" : "off")) {
            setWorldEntityLogicalState(state, emitter.id, nextOn ? "on" : "off");
        }
        emitSignalChannel(state, emitter.channel, { sourceId: emitter.id, active: nextOn });
        addEvent(state, "LEVER_SWITCH_TOGGLED", {
            switchId: emitter.id,
            channel: emitter.channel,
            active: nextOn
        });
        triggered = true;
    }
    return triggered;
}


function initializeDynamicVisualTransform(visual) {
    if (!visual?.dynamicPosition || visual.currentTransform) return visual;
    Object.assign(visual, createTransformTriplet({
        x: Number(visual.x) || 0,
        y: Number(visual.y) || 0,
        angle: normalizeRotationRadians(visual.rotation),
        alpha: Number.isFinite(Number(visual.alpha)) ? Number(visual.alpha) : 1
    }));
    delete visual.x;
    delete visual.y;
    delete visual.rotation;
    delete visual.alpha;
    return visual;
}

function initializeDynamicVisualTransforms(visuals = []) {
    for (const visual of visuals) initializeDynamicVisualTransform(visual);
    return visuals;
}

function createMovingPlatformRuntimes(visuals = []) {
    return visuals
        .filter((visual) => visual?.kind === "atlasSprite" && visual.movement)
        .map((visual, index) => {
            const movement = normalizeMovingPlatform(visual.movement);
            const initialDelay = movement?.initialDelay || 0;
            const automaticSwing = movement?.motionType === "swing" && movement?.activation === "automatic";
            const phase = initialDelay > 0
                ? "initialDelay"
                : movement?.activation !== "automatic"
                    ? "waitForTrigger"
                    : automaticSwing
                        ? "swing"
                        : "startPause";
            const startX = Number(visual.x) || 0;
            const startY = Number(visual.y) || 0;
            const startAngle = normalizeRotationRadians(visual.rotation);
            const pivot = placementLocalToWorld({
                x: startX,
                y: startY,
                w: Number(visual.w) || 0,
                h: Number(visual.h) || 0,
                rotation: startAngle
            }, movement?.pivotX || 0, movement?.pivotY || 0);
            return {
                id: visual.id || `movingPlatform_${index + 1}`,
                visualId: visual.id || `movingPlatform_${index + 1}`,
                movement,
                startX,
                startY,
                startAngle,
                endX: startX + (movement?.endOffsetX || 0),
                endY: startY + (movement?.endOffsetY || 0),
                pivotWorldX: pivot.x,
                pivotWorldY: pivot.y,
                currentSwingAngle: movement?.motionType === "swing" ? movement.initialAngle : 0,
                previousSwingAngle: movement?.motionType === "swing" ? movement.initialAngle : 0,
                swingElapsed: 0,
                swingHazardContact: null,
                blockedPlayerCrushProbe: null,
                phase,
                phaseTimer: phase === "initialDelay"
                    ? initialDelay
                    : phase === "startPause"
                        ? movement?.startPause || 0
                        : 0,
                phaseElapsed: 0,
                cycleCount: 0,
                lastSignalRevision: 0,
                opacity: 1,
                baseAlpha: Number.isFinite(Number(visual.alpha)) ? Number(visual.alpha) : 1,
                collisionAttached: true,
                lastDeltaX: 0,
                lastDeltaY: 0,
                projectileSweepActive: false,
                projectileSweepDeltaX: 0,
                projectileSweepDeltaY: 0,
                projectileSweepStartAngle: movement?.motionType === "swing" ? movement.initialAngle : 0,
                projectileSweepEndAngle: movement?.motionType === "swing" ? movement.initialAngle : 0,
                segments: [],
                polygons: [],
                baseSegments: [],
                basePolygons: []
            };
        });
}

function movingPlatformVisual(state, platform) {
    return (state.world?.visuals || []).find((visual) => visual.id === platform.visualId) || null;
}


function rotatePointAroundMovingPlatformPivot(x, y, platform, angleRadians) {
    const dx = (Number(x) || 0) - platform.pivotWorldX;
    const dy = (Number(y) || 0) - platform.pivotWorldY;
    const cosine = Math.cos(angleRadians);
    const sine = Math.sin(angleRadians);
    return {
        x: platform.pivotWorldX + dx * cosine - dy * sine,
        y: platform.pivotWorldY + dx * sine + dy * cosine
    };
}

function movingPlatformSwingVisualTransform(platform, visual, angleDegrees) {
    const swingRadians = (Number(angleDegrees) || 0) * Math.PI / 180;
    const baseCenterX = platform.startX + (Number(visual?.w) || 0) * 0.5;
    const baseCenterY = platform.startY + (Number(visual?.h) || 0) * 0.5;
    const center = rotatePointAroundMovingPlatformPivot(baseCenterX, baseCenterY, platform, swingRadians);
    return {
        x: center.x - (Number(visual?.w) || 0) * 0.5,
        y: center.y - (Number(visual?.h) || 0) * 0.5,
        angle: platform.startAngle + swingRadians
    };
}

function movingPlatformCollisionIds(platform) {
    return [
        ...(platform?.segments || []).map((segment) => segment.id),
        ...(platform?.polygons || []).map((polygon) => polygon.id)
    ].filter(Boolean);
}

function movingPlatformSwingPointDelta(platform, fromAngleDegrees, toAngleDegrees, x, y) {
    const deltaRadians = ((Number(toAngleDegrees) || 0) - (Number(fromAngleDegrees) || 0)) * Math.PI / 180;
    if (Math.abs(deltaRadians) <= 0.000000001) return { x: 0, y: 0 };
    const next = rotatePointAroundMovingPlatformPivot(x, y, platform, deltaRadians);
    return { x: next.x - x, y: next.y - y };
}

function moveSwingPlayerWithWorldCollision(state, platform, targetX, targetY) {
    const player = state.player;
    const ignoreIds = movingPlatformCollisionIds(platform);
    const previousX = player.currentTransform.x;
    const previousY = player.currentTransform.y;
    const horizontal = findActorHorizontalSweepCollision(state, player, previousX, targetX, { ignoreIds });
    player.currentTransform.x = horizontal ? horizontal.x : targetX;
    if (horizontal) {
        player.vx = 0;
        if (horizontal.side === "right") state.collisions.playerTouching.right = true;
        else state.collisions.playerTouching.left = true;
        state.collisions.lastResolution = {
            axis: "platform-carry-x",
            id: horizontal.id,
            kind: horizontal.kind,
            source: horizontal.source
        };
    }

    const vertical = findActorVerticalSweepCollision(state, player, previousY, targetY, {
        ignoreIds,
        ignoreWalkable: (Number(player.dropThroughTimer) || 0) > 0,
        preferredSupportId: player.supportId || ""
    });
    if (!vertical) {
        player.currentTransform.y = targetY;
    } else if (vertical.ceiling) {
        player.currentTransform.y = vertical.y;
        if (player.vy < 0) player.vy = 0;
        player.ordinaryJumpActive = false;
        state.collisions.playerTouching.up = true;
        state.collisions.lastResolution = {
            axis: "platform-carry-y",
            id: vertical.id,
            kind: vertical.kind,
            source: vertical.source,
            ceiling: true
        };
    } else {
        landPlayerOn(state, vertical.y, true, vertical.id, vertical.kind);
        state.collisions.lastResolution = {
            axis: "platform-carry-y",
            id: vertical.id,
            kind: vertical.kind,
            source: vertical.source
        };
    }
    player.groundStride = null;
}

function moveCharacterEnemyWithWorldCollision(state, platform, enemy, targetX, targetY) {
    const ignoreIds = movingPlatformCollisionIds(platform);
    const previousX = enemy.currentTransform.x;
    const previousY = enemy.currentTransform.y;
    const horizontal = findActorHorizontalSweepCollision(state, enemy, previousX, targetX, { ignoreIds, blockAllBlockableLines: enemy.locomotion === "flying" });
    enemy.currentTransform.x = horizontal ? horizontal.x : targetX;
    if (horizontal) {
        enemy.velocityX = 0;
        enemy.groundVelocityX = 0;
    }

    const vertical = findActorVerticalSweepCollision(state, enemy, previousY, targetY, {
        ignoreIds,
        preferredSupportId: enemy.supportId || "",
        blockAllBlockableLines: enemy.locomotion === "flying"
    });
    enemy.currentTransform.y = vertical ? vertical.y : targetY;
    if (vertical?.ceiling) {
        if ((Number(enemy.velocityY) || 0) < 0) enemy.velocityY = 0;
    } else if (vertical) {
        enemy.velocityY = 0;
        enemy.airborne = false;
        setCharacterEnemyGroundSupportIdentity(state, enemy, { id: vertical.id, kind: vertical.kind });
    }
}

function movingPlatformPreviousSegment(segment, platform, previousAngleDegrees) {
    const deltaRadians = ((Number(platform.currentSwingAngle) || 0) - (Number(previousAngleDegrees) || 0)) * Math.PI / 180;
    if (Math.abs(deltaRadians) <= 0.000000001) return segment;
    const a = rotatePointAroundMovingPlatformPivot(segment.x1, segment.y1, platform, -deltaRadians);
    const b = rotatePointAroundMovingPlatformPivot(segment.x2, segment.y2, platform, -deltaRadians);
    return { ...segment, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
}

function movingPlatformSegmentCanCatchActor(
    segment,
    previousSegment,
    actorX,
    actorFootY,
    actorVerticalVelocity = 0,
    sampleDuration = 0
) {
    if (segment.kind !== "walkable") return true;
    if (!playerSegmentIsStandable(segment)) return false;
    const previousSurfaceY = segmentYAtX(previousSegment, actorX);
    const currentSurfaceY = segmentYAtX(segment, actorX);
    if (previousSurfaceY === null || currentSurfaceY === null) return false;
    const previousRelativeY = actorFootY - previousSurfaceY;
    const predictedActorFootY = actorFootY + (Number(actorVerticalVelocity) || 0) * Math.max(0, Number(sampleDuration) || 0);
    const nextRelativeY = predictedActorFootY - currentSurfaceY;
    return previousRelativeY <= 2.5 && nextRelativeY >= -2.5;
}

function setMovingPlatformSwingAngle(state, platform, angleDegrees, { carry = true, updateGeometry = true } = {}) {
    const visual = movingPlatformVisual(state, platform);
    if (!visual) return;
    const visualTransform = currentTransformOf(visual);
    const previousSwingAngle = Number(platform.currentSwingAngle) || 0;
    const nextSwingAngle = Number(angleDegrees) || 0;
    const previousX = Number(visualTransform.x) || 0;
    const previousY = Number(visualTransform.y) || 0;
    const next = movingPlatformSwingVisualTransform(platform, visual, nextSwingAngle);
    const carryingPlayer = carry && platform.collisionAttached &&
        state.player?.onGround === true &&
        movingPlatformOwnsCollisionId(platform, state.player.supportId);
    const carryingEnemies = carry && platform.collisionAttached
        ? (state.enemies || []).filter((enemy) => (
            enemy?.kind === "characterEnemy" &&
            enemy.airborne !== true &&
            movingPlatformOwnsCollisionId(platform, enemy.supportId)
        ))
        : [];

    visualTransform.x = next.x;
    visualTransform.y = next.y;
    visualTransform.angle = next.angle;
    platform.currentSwingAngle = nextSwingAngle;
    platform.lastDeltaX = (Number(platform.lastDeltaX) || 0) + next.x - previousX;
    platform.lastDeltaY = (Number(platform.lastDeltaY) || 0) + next.y - previousY;
    if (carry && platform.collisionAttached && Math.abs(nextSwingAngle - previousSwingAngle) > 0.000000001) {
        if (platform.projectileSweepActive !== true) {
            platform.projectileSweepStartAngle = previousSwingAngle;
        }
        platform.projectileSweepEndAngle = nextSwingAngle;
        platform.projectileSweepActive = true;
    }

    if (updateGeometry && platform.baseSegments?.length === platform.segments?.length) {
        const relativeRadians = (nextSwingAngle - platform.movement.initialAngle) * Math.PI / 180;
        for (let index = 0; index < platform.segments.length; index += 1) {
            const segment = platform.segments[index];
            const base = platform.baseSegments[index];
            const p1 = rotatePointAroundMovingPlatformPivot(base.x1, base.y1, platform, relativeRadians);
            const p2 = rotatePointAroundMovingPlatformPivot(base.x2, base.y2, platform, relativeRadians);
            segment.x1 = p1.x;
            segment.y1 = p1.y;
            segment.x2 = p2.x;
            segment.y2 = p2.y;
        }
        for (let polygonIndex = 0; polygonIndex < platform.polygons.length; polygonIndex += 1) {
            const polygon = platform.polygons[polygonIndex];
            const base = platform.basePolygons[polygonIndex];
            if (!base || base.points?.length !== polygon.points?.length) continue;
            for (let pointIndex = 0; pointIndex < polygon.points.length; pointIndex += 1) {
                const point = rotatePointAroundMovingPlatformPivot(
                    base.points[pointIndex].x,
                    base.points[pointIndex].y,
                    platform,
                    relativeRadians
                );
                polygon.points[pointIndex].x = point.x;
                polygon.points[pointIndex].y = point.y;
            }
        }
    }

    const riderDeltaRadians = (nextSwingAngle - previousSwingAngle) * Math.PI / 180;
    if (carryingPlayer && Math.abs(riderDeltaRadians) > 0.000000001) {
        const nextPlayer = rotatePointAroundMovingPlatformPivot(
            state.player.currentTransform.x,
            state.player.currentTransform.y,
            platform,
            riderDeltaRadians
        );
        moveSwingPlayerWithWorldCollision(state, platform, nextPlayer.x, nextPlayer.y);
    }
    for (const enemy of carryingEnemies) {
        if (Math.abs(riderDeltaRadians) > 0.000000001) {
            const nextEnemy = rotatePointAroundMovingPlatformPivot(
                enemy.currentTransform.x,
                enemy.currentTransform.y,
                platform,
                riderDeltaRadians
            );
            moveCharacterEnemyWithWorldCollision(state, platform, enemy, nextEnemy.x, nextEnemy.y);
        }
        revalidateCharacterEnemyMovingPlatformSupport(state, platform, enemy);
        enemy.ridingPlatformId = movingPlatformOwnsCollisionId(platform, enemy.supportId) ? platform.id : null;
        syncCharacterEnemyTarget(state, enemy);
    }
}

function initializeMovingPlatformTransforms(state) {
    for (const platform of state.world?.movingPlatforms || []) {
        if (platform.movement?.motionType !== "swing") continue;
        setMovingPlatformSwingAngle(state, platform, platform.movement.initialAngle, {
            carry: false,
            updateGeometry: false
        });
    }
}

function movingPlatformOwnsCollisionId(platform, collisionId) {
    if (!collisionId) {
        return false;
    }
    return (platform.segments || []).some((segment) => segment.id === collisionId) ||
        (platform.polygons || []).some((polygon) => polygon.id === collisionId);
}

function movingPlatformOwnsWalkableSupportId(platform, collisionId) {
    if (!collisionId) return false;
    return (platform.segments || []).some((segment) => segment.id === collisionId && segment.kind === "walkable");
}

function detachPlayerFromMovingWalkableSupportForDropThrough(state) {
    const player = state.player;
    if (!player?.onGround || (Number(player.dropThroughTimer) || 0) <= 0 || !player.supportId) return;
    const platform = (state.world?.movingPlatforms || []).find((item) =>
        item?.collisionAttached !== false && movingPlatformOwnsWalkableSupportId(item, player.supportId)
    );
    if (!platform) return;
    player.onGround = false;
    player.supportId = null;
    player.groundStride = null;
}

function syncMovingPlatformCollisionCounts(state) {
    if (!state.world) {
        return;
    }
    state.world.collisionSegmentCount = (state.world.segments || []).length;
    state.world.collisionPolygonCount = (state.world.collisionPolygons || []).length;
}

function movingPlatformEnemyEmbeddedInSolidGeometry(platform, enemy) {
    const width = Math.max(1, Number(enemy?.width) || 1);
    const height = Math.max(1, Number(enemy?.height) || 1);
    const sideInset = Math.min(width * 0.2, Math.max(1, width * 0.04));
    const headInset = Math.min(height * 0.12, Math.max(1, height * 0.03));
    const footInset = Math.min(height * 0.22, Math.max(3, height * 0.08));
    const rect = {
        x: (Number(enemy?.currentTransform?.x) || 0) - width * 0.5 + sideInset,
        y: (Number(enemy?.currentTransform?.y) || 0) - height + headInset,
        w: Math.max(1, width - sideInset * 2),
        h: Math.max(1, height - headInset - footInset)
    };
    if ((platform.polygons || []).some((polygon) => (
        isAreaBlockingSegmentKind(polygon.kind) && polygonOverlapsRect(polygon, rect)
    ))) return true;
    return (platform.segments || []).some((segment) => (
        isAreaBlockingSegmentKind(segment.kind) && segmentRectIntersection(
            { x: segment.x1, y: segment.y1 },
            { x: segment.x2, y: segment.y2 },
            rect
        )
    ));
}

function characterEnemyRecoveryRect(enemy) {
    const width = Math.max(1, Number(enemy?.width) || 1);
    const height = Math.max(1, Number(enemy?.height) || 1);
    const sideInset = Math.min(width * 0.2, Math.max(1, width * 0.04));
    const headInset = Math.min(height * 0.12, Math.max(1, height * 0.03));
    const footInset = Math.min(height * 0.22, Math.max(3, height * 0.08));
    return {
        x: (Number(enemy?.currentTransform?.x) || 0) - width * 0.5 + sideInset,
        y: (Number(enemy?.currentTransform?.y) || 0) - height + headInset,
        w: Math.max(1, width - sideInset * 2),
        h: Math.max(1, height - headInset - footInset)
    };
}

function characterEnemyPenetrationBlockers(state, rect, options = {}) {
    const blockers = [];
    const ignoreIds = new Set(options.ignoreIds || []);
    for (const solid of queryWorldSolids(state.world, rect)) {
        if (ignoreIds.has(solid.id) || !rectsOverlap(rect, solid)) continue;
        blockers.push(collisionBodyDetail(solid, "solid"));
    }
    for (const polygon of queryWorldCollisionPolygons(state.world, rect)) {
        if (ignoreIds.has(polygon.id) || !isAreaBlockingSegmentKind(polygon.kind) || !polygonOverlapsRect(polygon, rect)) continue;
        blockers.push(collisionBodyDetail(polygon, "polygon"));
    }
    return blockers;
}

export function characterEnemyNavigationStepLandingPenetratesForeignBlocker(
    state,
    enemy,
    landingX,
    landingY,
    destinationObstacleId = null
) {
    const probe = {
        ...enemy,
        currentTransform: {
            ...(enemy?.currentTransform || {}),
            x: Number(landingX) || 0,
            y: Number(landingY) || 0
        }
    };
    const ignoreIds = destinationObstacleId ? [destinationObstacleId] : [];
    return characterEnemyPenetrationBlockers(state, characterEnemyRecoveryRect(probe), { ignoreIds }).length > 0;
}

function characterEnemyMateriallyEmbeddedInBlockable(state, enemy) {
    const rect = characterEnemyRecoveryRect(enemy);
    const point = { x: rect.x + rect.w * 0.5, y: rect.y + rect.h * 0.5 };
    const query = { x: point.x - 0.5, y: point.y - 0.5, w: 1, h: 1 };
    for (const solid of queryWorldSolids(state.world, query)) {
        if (pointInRect(point, solid)) return true;
    }
    for (const polygon of queryWorldCollisionPolygons(state.world, query)) {
        if (isAreaBlockingSegmentKind(polygon.kind) && pointInPolygon(point, polygon)) return true;
    }
    return false;
}

function characterEnemyRecoveryDirectionPriority(enemy, direction) {
    const vx = Number(enemy?.velocityX) || 0;
    const vy = Number(enemy?.velocityY) || 0;
    const directionVectors = {
        left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1],
        "up-left": [-Math.SQRT1_2, -Math.SQRT1_2], "up-right": [Math.SQRT1_2, -Math.SQRT1_2],
        "down-left": [-Math.SQRT1_2, Math.SQRT1_2], "down-right": [Math.SQRT1_2, Math.SQRT1_2]
    };
    const vector = directionVectors[direction] || [0, 0];
    if (vx * vector[0] + vy * vector[1] < -0.000001) return 0;
    if (direction === "up") return 1;
    if (direction.startsWith("up-")) return 2;
    if (direction === "down") return 3;
    if (direction.startsWith("down-")) return 4;
    return 5;
}

function findCharacterEnemyRecoveryCandidate(state, enemy, rect, ignoreIds, maxRecoveryDistance, collision) {
    const diagonal = Math.SQRT1_2;
    const directions = [
        { direction: "left", ux: -1, uy: 0 },
        { direction: "right", ux: 1, uy: 0 },
        { direction: "up", ux: 0, uy: -1 },
        { direction: "down", ux: 0, uy: 1 },
        { direction: "up-left", ux: -diagonal, uy: -diagonal },
        { direction: "up-right", ux: diagonal, uy: -diagonal },
        { direction: "down-left", ux: -diagonal, uy: diagonal },
        { direction: "down-right", ux: diagonal, uy: diagonal }
    ];
    const candidates = [];
    for (const direction of directions) {
        let previousDistance = 0;
        for (let distance = Math.min(1, maxRecoveryDistance); distance <= maxRecoveryDistance + 0.000001; distance = Math.min(distance + 1, maxRecoveryDistance)) {
            const movedRect = {
                x: rect.x + direction.ux * distance,
                y: rect.y + direction.uy * distance,
                w: rect.w,
                h: rect.h
            };
            if (!characterEnemyPenetrationBlockers(state, movedRect, { ignoreIds }).length) {
                let low = previousDistance;
                let high = distance;
                for (let refine = 0; refine < 12; refine += 1) {
                    const middle = (low + high) * 0.5;
                    const middleRect = {
                        x: rect.x + direction.ux * middle,
                        y: rect.y + direction.uy * middle,
                        w: rect.w,
                        h: rect.h
                    };
                    if (characterEnemyPenetrationBlockers(state, middleRect, { ignoreIds }).length) low = middle;
                    else high = middle;
                }
                const separationDistance = Math.min(maxRecoveryDistance, high + 0.05);
                candidates.push({
                    direction: direction.direction,
                    dx: direction.ux * separationDistance,
                    dy: direction.uy * separationDistance,
                    distance: separationDistance,
                    id: collision?.id || "worldCollision",
                    kind: collision?.kind || "blockable"
                });
                break;
            }
            if (distance >= maxRecoveryDistance) break;
            previousDistance = distance;
        }
    }
    candidates.sort((a, b) => {
        const distanceDelta = a.distance - b.distance;
        if (Math.abs(distanceDelta) > 0.000001) return distanceDelta;
        return characterEnemyRecoveryDirectionPriority(enemy, a.direction) - characterEnemyRecoveryDirectionPriority(enemy, b.direction);
    });
    return candidates[0] || null;
}

function finalizeCharacterEnemyCollisionRecovery(state, enemy, totalDx, totalDy, corrections) {
    const previousNavigationSupportId = enemy.currentSupportId || null;
    enemy.velocityX = 0;
    enemy.velocityY = 0;
    enemy.groundVelocityX = 0;
    clearCharacterEnemyNavigationPlan(enemy);
    enemy.supportId = null;
    enemy.ridingPlatformId = null;
    enemy.currentSupportId = null;

    if (enemy.locomotion === "flying") {
        enemy.flightBaseY = finiteNumberOr(enemy.flightBaseY, enemy.currentTransform.y) + totalDy;
        enemy.airborne = true;
    } else {
        const tolerance = Math.max(5, Math.min(18, Math.max(1, Number(enemy.height) || 1) * 0.12));
        const support = findCharacterEnemyGroundSupport(
            state,
            enemy.currentTransform.x,
            enemy.currentTransform.y,
            tolerance,
            tolerance,
            enemy.width,
            { bodyHeight: enemy.height }
        );
        if (support) {
            enemy.currentTransform.y = support.y;
            enemy.airborne = false;
            setCharacterEnemyGroundSupportIdentity(state, enemy, support);
            // Penetration recovery may run on an otherwise valid overlapping floor
            // seam. Preserve navigation ownership only when it exactly matches the
            // physical support recovered under the actor; aliases or changed supports
            // are deliberately left for the normal navigation resolver.
            if (previousNavigationSupportId && previousNavigationSupportId === support.id) {
                enemy.currentSupportId = previousNavigationSupportId;
            }
        } else {
            enemy.airborne = true;
            enemy.airTimer = 0;
        }
    }

    const last = corrections[corrections.length - 1];
    addEvent(state, "ENEMY_COLLISION_RECOVERED", {
        enemyId: enemy.id,
        passes: corrections.length,
        direction: last?.direction || null,
        distance: round(Math.hypot(totalDx, totalDy)),
        collisionId: last?.id || null,
        collisionKind: last?.kind || null
    });
    syncCharacterEnemyTarget(state, enemy);
}

function killCharacterEnemyTrappedInSolidGeometry(state, enemy, collision = null) {
    if (enemy?.kind !== "characterEnemy" || enemy.combatState === ENEMY_COMBAT_STATE.DEAD || Number(enemy.health) <= 0) {
        return false;
    }
    const collisionId = collision?.id || "worldCollision";
    enemy.lastHitBy = collisionId;
    enemy.supportId = null;
    enemy.ridingPlatformId = null;
    enemy.currentSupportId = null;
    beginCharacterEnemyDeath(state, enemy);
    // No valid nearby world position exists. Keep the last-resort corpse fixed
    // at the failure site so its death presentation can finish and any blocked
    // corpse-time drop is deterministically culled instead of waiting forever.
    enemy.airborne = false;
    enemy.airTimer = 0;
    finalizeEnemyDefeatTransaction(state, enemy, {
        sourceId: collisionId,
        damage: round(Math.max(0, Number(enemy.maxHealth) || 0)),
        health: 0,
        maxHealth: round(Math.max(0, Number(enemy.maxHealth) || 0)),
        deferredUntilLanding: false
    });
    addEvent(state, "ENEMY_TRAPPED_IN_SOLID", {
        enemyId: enemy.id,
        collisionId,
        collisionKind: collision?.kind || "blockable"
    });
    syncCharacterEnemyTarget(state, enemy);
    return true;
}

function resolveCharacterEnemyPenetrations(state, enemy, options = {}) {
    if (enemy?.kind !== "characterEnemy" || enemy.combatState === ENEMY_COMBAT_STATE.DEAD || Number(enemy.health) <= 0) {
        return { recovered: false, killed: false };
    }

    const recoveryRect = characterEnemyRecoveryRect(enemy);
    const coreEmbedded = characterEnemyMateriallyEmbeddedInBlockable(state, enemy);
    const explicitTransitionRecovery = options.allowShallowOverlap === true;
    const initialIgnoreIds = new Set(options.ignoreIds || []);
    if (!coreEmbedded && !explicitTransitionRecovery && enemy.airborne !== true && enemy.supportId) {
        initialIgnoreIds.add(enemy.supportId);
    }
    const allBlockers = characterEnemyPenetrationBlockers(state, recoveryRect, { ignoreIds: initialIgnoreIds });
    if (!allBlockers.length) {
        enemy.penetrationRecoveryTicks = 0;
        enemy.penetrationRecoveryProbeX = null;
        enemy.penetrationRecoveryProbeY = null;
        return { recovered: false, killed: false, passes: 0 };
    }

    if (!explicitTransitionRecovery && enemy.locomotion !== "flying" && enemy.airborne === true) {
        // Airborne ground traversal may begin a tick partially inside nearby
        // volume collision. Only a deep torso embed that survives one complete
        // normal physics tick is considered stuck.
        if (!coreEmbedded) {
            enemy.penetrationRecoveryTicks = 0;
            return { recovered: false, killed: false, passes: 0 };
        }
        enemy.penetrationRecoveryTicks = Math.max(0, Math.floor(Number(enemy.penetrationRecoveryTicks) || 0)) + 1;
        if (enemy.penetrationRecoveryTicks < 2) {
            return { recovered: false, killed: false, passes: 0 };
        }
    } else if (!explicitTransitionRecovery && !coreEmbedded) {
        // Shallow overlap is common while a grounded actor is actively traversing
        // a step or polygon seam. Recover only if essentially the same overlap
        // persists at the same world position across ticks.
        const probeX = Number(enemy.penetrationRecoveryProbeX);
        const probeY = Number(enemy.penetrationRecoveryProbeY);
        const hasProbe = Number.isFinite(probeX) && Number.isFinite(probeY);
        const movedSinceProbe = hasProbe && Math.hypot(enemy.currentTransform.x - probeX, enemy.currentTransform.y - probeY) > 0.25;
        enemy.penetrationRecoveryProbeX = enemy.currentTransform.x;
        enemy.penetrationRecoveryProbeY = enemy.currentTransform.y;
        if (!hasProbe || movedSinceProbe) {
            enemy.penetrationRecoveryTicks = 1;
            return { recovered: false, killed: false, passes: 0 };
        }
        enemy.penetrationRecoveryTicks = Math.max(1, Math.floor(Number(enemy.penetrationRecoveryTicks) || 1)) + 1;
        if (enemy.penetrationRecoveryTicks < 2) {
            return { recovered: false, killed: false, passes: 0 };
        }
    } else {
        enemy.penetrationRecoveryTicks = 0;
        enemy.penetrationRecoveryProbeX = null;
        enemy.penetrationRecoveryProbeY = null;
    }

    const ignoreIds = new Set(initialIgnoreIds);
    // A grounded actor may have a shallow overlap with its own sloped polygonal
    // support. Ignore that support only for shallow/persistent recovery; a torso
    // core actually inside the support remains a real embed and must be fixed.
    if (!coreEmbedded && !explicitTransitionRecovery && enemy.airborne !== true && enemy.supportId) {
        ignoreIds.add(enemy.supportId);
    }

    // Recovery is deliberately bounded. 50% of the full enemy diagonal is
    // generous enough for authored seams/corners, but too short to become a
    // visible teleport across substantial terrain.
    const maxRecoveryDistance = Math.hypot(Math.max(1, Number(enemy.width) || 1), Math.max(1, Number(enemy.height) || 1)) * 0.50;
    const blockers = characterEnemyPenetrationBlockers(state, characterEnemyRecoveryRect(enemy), { ignoreIds });
    const best = findCharacterEnemyRecoveryCandidate(
        state,
        enemy,
        characterEnemyRecoveryRect(enemy),
        ignoreIds,
        maxRecoveryDistance,
        blockers[0] || allBlockers[0]
    );
    enemy.penetrationRecoveryTicks = 0;
    enemy.penetrationRecoveryProbeX = null;
    enemy.penetrationRecoveryProbeY = null;
    if (best) {
        enemy.currentTransform.x += best.dx;
        enemy.currentTransform.y += best.dy;
        finalizeCharacterEnemyCollisionRecovery(state, enemy, best.dx, best.dy, [best]);
        return { recovered: true, killed: false, passes: 1 };
    }
    const killed = killCharacterEnemyTrappedInSolidGeometry(state, enemy, blockers[0] || allBlockers[0]);
    return { recovered: false, killed, passes: 0 };
}

function recoverCharacterEnemiesEmbeddedByMovingPlatform(state, platform) {
    for (const enemy of state.enemies || []) {
        if (enemy?.kind !== "characterEnemy" || enemy.combatState === ENEMY_COMBAT_STATE.DEAD || Number(enemy.health) <= 0) continue;
        if (!movingPlatformEnemyEmbeddedInSolidGeometry(platform, enemy)) continue;
        const recovery = resolveCharacterEnemyPenetrations(state, enemy, { allowAirborneGround: true, allowShallowOverlap: true });
        if (recovery.killed || !movingPlatformEnemyEmbeddedInSolidGeometry(platform, enemy)) continue;
        crushCharacterEnemyByMovingPlatform(state, platform, enemy, { skipRecovery: true });
    }
}

function setMovingPlatformCollisionAttached(state, platform, attached) {
    const shouldAttach = Boolean(attached);
    if (platform.collisionAttached === shouldAttach) {
        return;
    }
    const segmentIds = new Set((platform.segments || []).map((segment) => segment.id));
    const polygonIds = new Set((platform.polygons || []).map((polygon) => polygon.id));
    if (shouldAttach) {
        const currentSegmentIds = new Set((state.world.segments || []).map((segment) => segment.id));
        const currentPolygonIds = new Set((state.world.collisionPolygons || []).map((polygon) => polygon.id));
        for (const segment of platform.segments || []) {
            if (!currentSegmentIds.has(segment.id)) {
                state.world.segments.push(segment);
            }
        }
        for (const polygon of platform.polygons || []) {
            if (!currentPolygonIds.has(polygon.id)) {
                state.world.collisionPolygons.push(polygon);
            }
        }
        recoverCharacterEnemiesEmbeddedByMovingPlatform(state, platform);
    } else {
        state.world.segments = (state.world.segments || []).filter((segment) => !segmentIds.has(segment.id));
        state.world.collisionPolygons = (state.world.collisionPolygons || []).filter((polygon) => !polygonIds.has(polygon.id));
        if (movingPlatformOwnsCollisionId(platform, state.player?.supportId)) {
            state.player.supportId = null;
            state.player.onGround = false;
        }
        for (const enemy of state.enemies || []) {
            if (enemy?.kind !== "characterEnemy" || !movingPlatformOwnsCollisionId(platform, enemy.supportId)) {
                continue;
            }
            enemy.supportId = null;
            enemy.ridingPlatformId = null;
            enemy.currentSupportId = null;
            if (enemy.locomotion !== "flying") enemy.airborne = true;
        }
    }
    platform.collisionAttached = shouldAttach;
    syncMovingPlatformCollisionCounts(state);
}

function bindMovingPlatformCollision(state, allSegments, allPolygons) {
    const platforms = state.world?.movingPlatforms || [];
    for (const platform of platforms) {
        platform.segments = allSegments.filter((segment) => segment.movingPlatformId === platform.id || segment.visualId === platform.visualId);
        platform.polygons = allPolygons.filter((polygon) => polygon.movingPlatformId === platform.id || polygon.visualId === platform.visualId);
        platform.baseSegments = platform.segments.map((segment) => ({ ...segment }));
        platform.basePolygons = platform.polygons.map((polygon) => ({
            ...polygon,
            points: (polygon.points || []).map((point) => ({ ...point }))
        }));
        platform.collisionAttached = true;
    }
}

function translateMovingPlatformGeometry(platform, dx, dy) {
    for (const segment of platform.segments || []) {
        segment.x1 += dx;
        segment.y1 += dy;
        segment.x2 += dx;
        segment.y2 += dy;
    }
    for (const polygon of platform.polygons || []) {
        for (const point of polygon.points || []) {
            point.x += dx;
            point.y += dy;
        }
    }
}

function revalidateCharacterEnemyMovingPlatformSupport(state, platform, enemy) {
    if (!movingPlatformOwnsCollisionId(platform, enemy?.supportId)) return;
    const tolerance = Math.max(6, (Number(enemy.height) || 0) * 0.08);
    const support = findCharacterEnemyGroundSupport(
        state,
        enemy.currentTransform.x,
        enemy.currentTransform.y,
        tolerance,
        tolerance,
        enemy.width
    );
    if (support && movingPlatformOwnsCollisionId(platform, support.id)) {
        setCharacterEnemyGroundSupportIdentity(state, enemy, support);
        enemy.airborne = false;
        return;
    }
    setCharacterEnemyGroundSupportIdentity(state, enemy, support);
    enemy.airborne = !support;
    if (!support) enemy.currentSupportId = null;
}

function movingPlatformTranslationSampleCount(state, distance) {
    const player = state?.player;
    const maximumSampleTravel = Math.max(
        2,
        Math.min(Math.max(1, Number(player?.width) || 1), Math.max(1, Number(player?.height) || 1)) * 0.1
    );
    return Math.max(1, Math.ceil(Math.max(0, Number(distance) || 0) / maximumSampleTravel));
}

function moveMovingPlatformPositionSwept(state, platform, targetX, targetY, duration = 0) {
    const visual = movingPlatformVisual(state, platform);
    if (!visual) return;
    const visualTransform = currentTransformOf(visual);
    const startX = Number(visualTransform.x) || 0;
    const startY = Number(visualTransform.y) || 0;
    const totalDx = (Number(targetX) || 0) - startX;
    const totalDy = (Number(targetY) || 0) - startY;
    const distance = Math.hypot(totalDx, totalDy);
    if (distance <= 0.0000001) return;
    const sampleCount = movingPlatformTranslationSampleCount(state, distance);
    const sampleDuration = Math.max(0, Number(duration) || 0) / sampleCount;
    let previousX = startX;
    let previousY = startY;
    for (let sampleIndex = 1; sampleIndex <= sampleCount; sampleIndex += 1) {
        const t = sampleIndex / sampleCount;
        const nextX = startX + totalDx * t;
        const nextY = startY + totalDy * t;
        setMovingPlatformPosition(state, platform, nextX, nextY);
        sampleMovingPlatformTranslationActorInteractions(
            state,
            platform,
            nextX - previousX,
            nextY - previousY,
            sampleDuration
        );
        previousX = nextX;
        previousY = nextY;
    }
}

function setMovingPlatformPosition(state, platform, x, y, { carry = true } = {}) {
    const visual = movingPlatformVisual(state, platform);
    if (!visual) {
        return { dx: 0, dy: 0 };
    }
    const visualTransform = currentTransformOf(visual);
    const previousX = Number(visualTransform.x) || 0;
    const previousY = Number(visualTransform.y) || 0;
    const nextX = Number(x) || 0;
    const nextY = Number(y) || 0;
    const dx = nextX - previousX;
    const dy = nextY - previousY;
    if (Math.abs(dx) <= 0.0000001 && Math.abs(dy) <= 0.0000001) {
        return { dx: 0, dy: 0 };
    }

    const carryingPlayer = carry && platform.collisionAttached &&
        state.player?.onGround === true &&
        movingPlatformOwnsCollisionId(platform, state.player.supportId);
    const carryingEnemies = carry && platform.collisionAttached
        ? (state.enemies || []).filter((enemy) => (
            enemy?.kind === "characterEnemy" &&
            enemy.airborne !== true &&
            movingPlatformOwnsCollisionId(platform, enemy.supportId)
        ))
        : [];
    visualTransform.x = nextX;
    visualTransform.y = nextY;
    platform.lastDeltaX = (Number(platform.lastDeltaX) || 0) + dx;
    platform.lastDeltaY = (Number(platform.lastDeltaY) || 0) + dy;
    if (carry && platform.collisionAttached) {
        platform.projectileSweepDeltaX = (Number(platform.projectileSweepDeltaX) || 0) + dx;
        platform.projectileSweepDeltaY = (Number(platform.projectileSweepDeltaY) || 0) + dy;
        platform.projectileSweepActive = true;
    }
    translateMovingPlatformGeometry(platform, dx, dy);
    if (carryingPlayer) {
        moveSwingPlayerWithWorldCollision(
            state,
            platform,
            state.player.currentTransform.x + dx,
            state.player.currentTransform.y + dy
        );
        // A platform moved the stride origin while the target remained in world
        // space. Re-plan from the carried position instead of stretching the
        // pending step across two independently moving frames of reference.
        state.player.groundStride = null;
    }
    for (const enemy of carryingEnemies) {
        moveCharacterEnemyWithWorldCollision(
            state,
            platform,
            enemy,
            enemy.currentTransform.x + dx,
            enemy.currentTransform.y + dy
        );
        revalidateCharacterEnemyMovingPlatformSupport(state, platform, enemy);
        enemy.ridingPlatformId = movingPlatformOwnsCollisionId(platform, enemy.supportId) ? platform.id : null;
        syncCharacterEnemyTarget(state, enemy);
    }
    return { dx, dy };
}

function setMovingPlatformOpacity(state, platform, opacity) {
    const visual = movingPlatformVisual(state, platform);
    platform.opacity = clamp(Number(opacity) || 0, 0, 1);
    if (visual) {
        currentTransformOf(visual).alpha = platform.baseAlpha * platform.opacity;
    }
}

function enterMovingPlatformPhase(state, platform, phase, duration = 0) {
    platform.phase = phase;
    platform.phaseTimer = Math.max(0, Number(duration) || 0);
    platform.phaseElapsed = 0;
    if (phase === "fadeOutEnd" || phase === "fadeOutStart") {
        setMovingPlatformCollisionAttached(state, platform, false);
    }
    if (phase === "hiddenEnd") {
        setMovingPlatformPosition(state, platform, platform.startX, platform.startY);
        setMovingPlatformOpacity(state, platform, 0);
    }
    if (phase === "hiddenStart") {
        setMovingPlatformOpacity(state, platform, 0);
    }
}

function resetMovingPlatformAtStart(state, platform) {
    if (platform.movement.motionType === "swing") {
        setMovingPlatformSwingAngle(state, platform, platform.movement.initialAngle);
        platform.swingElapsed = 0;
    } else {
        setMovingPlatformPosition(state, platform, platform.startX, platform.startY);
    }
    setMovingPlatformOpacity(state, platform, 1);
    setMovingPlatformCollisionAttached(state, platform, true);
    platform.cycleCount += 1;
    if (platform.movement.activation !== "automatic") {
        enterMovingPlatformPhase(state, platform, "waitForTrigger", 0);
    } else if (platform.movement.motionType === "swing") {
        enterMovingPlatformPhase(state, platform, "swing", 0);
    } else {
        enterMovingPlatformPhase(state, platform, "startPause", platform.movement.startPause);
    }
}

function beginMovingPlatformAction(state, platform) {
    if (platform.movement.motionType === "swing") {
        platform.swingElapsed = 0;
        enterMovingPlatformPhase(state, platform, "swing", 0);
    } else if (platform.movement.pattern === "vanishRespawn") {
        enterMovingPlatformPhase(state, platform, "fadeOutStart", platform.movement.fadeDuration);
    } else {
        enterMovingPlatformPhase(state, platform, "moveToEnd", 0);
    }
}

function platformTriggeredByRider(state, platform) {
    if (!platform.collisionAttached) {
        return false;
    }
    if (state.player?.onGround === true && movingPlatformOwnsCollisionId(platform, state.player.supportId)) {
        return true;
    }
    return (state.enemies || []).some((enemy) => (
        enemy?.kind === "characterEnemy" &&
        enemy.combatState !== ENEMY_COMBAT_STATE.DEAD &&
        enemy.airborne !== true &&
        movingPlatformOwnsCollisionId(platform, enemy.supportId)
    ));
}

function platformTriggeredBySignal(state, platform) {
    const channel = signalChannelRecord(state, platform.movement?.signalChannel, false);
    const revision = Math.max(0, Number(channel?.revision) || 0);
    if (revision <= Math.max(0, Number(platform.lastSignalRevision) || 0)) return false;
    platform.lastSignalRevision = revision;
    addEvent(state, "MOVING_PLATFORM_SIGNAL_TRIGGERED", {
        platformId: platform.id,
        channel: channel.channel,
        revision
    });
    return true;
}

function consumeMovingPlatformTimer(platform, dt) {
    const consumed = Math.min(Math.max(0, platform.phaseTimer), Math.max(0, dt));
    platform.phaseTimer = Math.max(0, platform.phaseTimer - consumed);
    if (platform.phaseTimer <= 0.000000001) {
        platform.phaseTimer = 0;
    }
    return consumed;
}

function movePlatformToward(state, platform, targetX, targetY, dt) {
    const visual = movingPlatformVisual(state, platform);
    if (!visual) {
        return true;
    }
    const visualTransform = currentTransformOf(visual);
    if (platform.movement.easing !== "linear") {
        const movingToEnd = platform.phase === "moveToEnd";
        const sourceX = movingToEnd ? platform.startX : platform.endX;
        const sourceY = movingToEnd ? platform.startY : platform.endY;
        const totalDx = targetX - sourceX;
        const totalDy = targetY - sourceY;
        const totalDistance = Math.hypot(totalDx, totalDy);
        if (totalDistance <= 0.0001) {
            setMovingPlatformPosition(state, platform, targetX, targetY);
            return true;
        }
        const duration = totalDistance / Math.max(1, platform.movement.speed);
        platform.phaseElapsed = Math.min(duration, (Number(platform.phaseElapsed) || 0) + Math.max(0, dt));
        const rawProgress = duration > 0 ? platform.phaseElapsed / duration : 1;
        const easedProgress = movingPlatformEasedProgress(rawProgress, platform.movement.easing);
        moveMovingPlatformPositionSwept(
            state,
            platform,
            sourceX + totalDx * easedProgress,
            sourceY + totalDy * easedProgress,
            dt
        );
        return rawProgress >= 1 - 0.0000001;
    }
    const dx = targetX - visualTransform.x;
    const dy = targetY - visualTransform.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 0.0001) {
        setMovingPlatformPosition(state, platform, targetX, targetY);
        return true;
    }
    const travel = Math.min(distance, platform.movement.speed * Math.max(0, dt));
    const scale = travel / distance;
    moveMovingPlatformPositionSwept(
        state,
        platform,
        visualTransform.x + dx * scale,
        visualTransform.y + dy * scale,
        dt
    );
    return travel >= distance - 0.0001;
}

function movingPlatformSwingSampleCount(state, platform, sweepDuration) {
    const movement = platform?.movement;
    if (!movement || sweepDuration <= 0) return 1;
    let maxRadius = 0;
    for (const segment of platform.baseSegments || []) {
        maxRadius = Math.max(
            maxRadius,
            Math.hypot(Number(segment.x1) - platform.pivotWorldX, Number(segment.y1) - platform.pivotWorldY),
            Math.hypot(Number(segment.x2) - platform.pivotWorldX, Number(segment.y2) - platform.pivotWorldY)
        );
    }
    for (const polygon of platform.basePolygons || []) {
        for (const point of polygon.points || []) {
            maxRadius = Math.max(
                maxRadius,
                Math.hypot(Number(point.x) - platform.pivotWorldX, Number(point.y) - platform.pivotWorldY)
            );
        }
    }
    if (maxRadius <= 0.000001) return 1;
    const period = Math.max(MIN_MOVING_PLATFORM_SWING_PERIOD, Number(movement.swingPeriod) || MIN_MOVING_PLATFORM_SWING_PERIOD);
    const amplitudeRadians = Math.max(0, Number(movement.angleAmplitude) || 0) * Math.PI / 180;
    const angularTravelBound = amplitudeRadians * Math.PI * 2 * sweepDuration / period;
    const player = state?.player;
    const maximumSampleTravel = Math.max(
        2,
        Math.min(Math.max(1, Number(player?.width) || 1), Math.max(1, Number(player?.height) || 1)) * 0.1
    );
    return Math.max(1, Math.ceil(angularTravelBound * maxRadius / maximumSampleTravel));
}

function updateMovingPlatform(state, platform, dt) {
    let remaining = Math.max(0, dt);
    for (let guard = 0; guard < 12; guard += 1) {
        const movement = platform.movement;
        if (!movement) {
            return;
        }

        if (platform.phase === "waitForTrigger") {
            const triggered = movement.activation === "signal"
                ? platformTriggeredBySignal(state, platform)
                : platformTriggeredByRider(state, platform);
            if (triggered) {
                if (movement.triggerDelay > 0) {
                    enterMovingPlatformPhase(state, platform, "triggerDelay", movement.triggerDelay);
                } else {
                    beginMovingPlatformAction(state, platform);
                }
                continue;
            }
            return;
        }

        if (["initialDelay", "triggerDelay", "startPause", "endPause", "hiddenEnd", "hiddenStart"].includes(platform.phase)) {
            const consumed = consumeMovingPlatformTimer(platform, remaining);
            remaining -= consumed;
            if (platform.phaseTimer > 0) {
                return;
            }
            const completedPhase = platform.phase;
            if (completedPhase === "initialDelay") {
                if (movement.activation !== "automatic") {
                    enterMovingPlatformPhase(state, platform, "waitForTrigger", 0);
                } else if (movement.motionType === "swing") {
                    beginMovingPlatformAction(state, platform);
                } else {
                    enterMovingPlatformPhase(state, platform, "startPause", movement.startPause);
                }
            } else if (completedPhase === "triggerDelay" || completedPhase === "startPause") {
                beginMovingPlatformAction(state, platform);
            } else if (completedPhase === "endPause") {
                if (movement.pattern === "shuttle") {
                    enterMovingPlatformPhase(state, platform, "moveToStart", 0);
                } else {
                    enterMovingPlatformPhase(state, platform, "fadeOutEnd", movement.fadeDuration);
                }
            } else if (completedPhase === "hiddenEnd" || completedPhase === "hiddenStart") {
                enterMovingPlatformPhase(state, platform, "fadeInStart", movement.fadeDuration);
            }
            continue;
        }

        if (platform.phase === "swing") {
            const period = Math.max(MIN_MOVING_PLATFORM_SWING_PERIOD, movement.swingPeriod);
            const startElapsed = Number(platform.swingElapsed) || 0;
            const sweepDuration = Math.max(0, Number(remaining) || 0);
            sampleMovingPlatformSwingPlayerInteractions(state, platform, platform.currentSwingAngle, 0);
            const sampleCount = movingPlatformSwingSampleCount(state, platform, sweepDuration);
            const sampleDuration = sampleCount > 0 ? sweepDuration / sampleCount : 0;
            const startPhase = movingPlatformSwingStartPhase(movement);
            for (let sampleIndex = 1; sampleIndex <= sampleCount; sampleIndex += 1) {
                const sampleT = sampleIndex / sampleCount;
                const elapsed = startElapsed + sweepDuration * sampleT;
                const phase = startPhase + Math.PI * 2 * elapsed / period;
                const previousAngle = platform.currentSwingAngle;
                setMovingPlatformSwingAngle(state, platform, movement.angleAmplitude * Math.sin(phase));
                sampleMovingPlatformSwingPlayerInteractions(state, platform, previousAngle, sampleDuration);
            }
            platform.swingElapsed = (startElapsed + sweepDuration) % period;
            return;
        }

        if (platform.phase === "moveToEnd") {
            const arrived = movePlatformToward(state, platform, platform.endX, platform.endY, remaining);
            if (!arrived) {
                return;
            }
            enterMovingPlatformPhase(state, platform, "endPause", movement.endPause);
            remaining = 0;
            continue;
        }

        if (platform.phase === "moveToStart") {
            const arrived = movePlatformToward(state, platform, platform.startX, platform.startY, remaining);
            if (!arrived) {
                return;
            }
            resetMovingPlatformAtStart(state, platform);
            remaining = 0;
            continue;
        }

        if (platform.phase === "fadeOutEnd" || platform.phase === "fadeOutStart") {
            const duration = Math.max(0, movement.fadeDuration);
            if (duration <= 0) {
                setMovingPlatformOpacity(state, platform, 0);
                enterMovingPlatformPhase(
                    state,
                    platform,
                    platform.phase === "fadeOutEnd" ? "hiddenEnd" : "hiddenStart",
                    movement.hiddenDuration
                );
                continue;
            }
            const consumed = Math.min(remaining, platform.phaseTimer);
            platform.phaseTimer = Math.max(0, platform.phaseTimer - consumed);
            if (platform.phaseTimer <= 0.000000001) platform.phaseTimer = 0;
            remaining -= consumed;
            setMovingPlatformOpacity(state, platform, platform.phaseTimer / duration);
            if (platform.phaseTimer > 0) {
                return;
            }
            enterMovingPlatformPhase(
                state,
                platform,
                platform.phase === "fadeOutEnd" ? "hiddenEnd" : "hiddenStart",
                movement.hiddenDuration
            );
            continue;
        }

        if (platform.phase === "fadeInStart") {
            const duration = Math.max(0, movement.fadeDuration);
            if (duration <= 0) {
                resetMovingPlatformAtStart(state, platform);
                continue;
            }
            const consumed = Math.min(remaining, platform.phaseTimer);
            platform.phaseTimer = Math.max(0, platform.phaseTimer - consumed);
            if (platform.phaseTimer <= 0.000000001) platform.phaseTimer = 0;
            remaining -= consumed;
            setMovingPlatformOpacity(state, platform, 1 - platform.phaseTimer / duration);
            if (platform.phaseTimer > 0) {
                return;
            }
            resetMovingPlatformAtStart(state, platform);
            continue;
        }

        resetMovingPlatformAtStart(state, platform);
        if (remaining <= 0) {
            return;
        }
    }
}

function updateMovingPlatforms(state, dt) {
    for (const platform of state.world?.movingPlatforms || []) {
        platform.lastDeltaX = 0;
        platform.lastDeltaY = 0;
        platform.previousSwingAngle = Number(platform.currentSwingAngle) || 0;
        platform.projectileSweepActive = false;
        platform.projectileSweepDeltaX = 0;
        platform.projectileSweepDeltaY = 0;
        platform.projectileSweepStartAngle = Number(platform.currentSwingAngle) || 0;
        platform.projectileSweepEndAngle = Number(platform.currentSwingAngle) || 0;
        platform.swingHazardContact = null;
        platform.blockedPlayerCrushProbe = null;
    }
    for (const platform of state.world?.movingPlatforms || []) {
        updateMovingPlatform(state, platform, dt);
    }
    if (!playerDeathActive(state)) {
        const blockedProbe = (state.world?.movingPlatforms || [])
            .map((platform) => platform.blockedPlayerCrushProbe)
            .find(Boolean);
        if (blockedProbe) {
            advancePlayerCrushCandidate(state, blockedProbe);
        } else if (state.player?.crushCandidateDetail?.sourceType === "segment"
            && state.player.crushCandidateDetail.sourcePlatformId) {
            clearPlayerCrushCandidate(state, "movingLineReleased");
        }
    }
}

function resetMovingPlatforms(state, reason = "playerReset") {
    let resetCount = 0;
    for (const platform of state.world?.movingPlatforms || []) {
        const movement = platform.movement;
        if (!movement || movement.persistent) continue;
        if (movement.motionType === "swing") {
            setMovingPlatformSwingAngle(state, platform, movement.initialAngle, { carry: false });
            platform.previousSwingAngle = movement.initialAngle;
            platform.swingElapsed = 0;
                    platform.swingHazardContact = null;
        } else {
            setMovingPlatformPosition(state, platform, platform.startX, platform.startY, { carry: false });
        }
        setMovingPlatformOpacity(state, platform, 1);
        setMovingPlatformCollisionAttached(state, platform, true);
        recoverCharacterEnemiesEmbeddedByMovingPlatform(state, platform);
        for (const enemy of state.enemies || []) {
            if (enemy?.kind !== "characterEnemy" || !movingPlatformOwnsCollisionId(platform, enemy.supportId)) continue;
            revalidateCharacterEnemyMovingPlatformSupport(state, platform, enemy);
            enemy.ridingPlatformId = movingPlatformOwnsCollisionId(platform, enemy.supportId) ? platform.id : null;
            syncCharacterEnemyTarget(state, enemy);
        }
        const visual = movingPlatformVisual(state, platform);
        if (visual) snapPresentationSubject(visual, `${reason}:movingPlatformReset`, `visual:${platform.visualId}`);
        platform.lastDeltaX = 0;
        platform.lastDeltaY = 0;
        platform.cycleCount = 0;
        const signal = movement.activation === "signal"
            ? signalChannelRecord(state, movement.signalChannel, false)
            : null;
        platform.lastSignalRevision = Math.max(0, Number(signal?.revision) || 0);
        if (movement.initialDelay > 0) {
            enterMovingPlatformPhase(state, platform, "initialDelay", movement.initialDelay);
        } else if (movement.activation !== "automatic") {
            enterMovingPlatformPhase(state, platform, "waitForTrigger", 0);
        } else if (movement.motionType === "swing") {
            enterMovingPlatformPhase(state, platform, "swing", 0);
        } else {
            enterMovingPlatformPhase(state, platform, "startPause", movement.startPause);
        }
        resetCount += 1;
    }
    if (resetCount > 0) addEvent(state, "MOVING_PLATFORMS_RESET", { reason, count: resetCount });
    return resetCount;
}



function characterEnemyIsRanged(enemy) {
    return String(enemy?.attackMode || "melee") === "projectile";
}

function positiveEnemyTuningScale(value) {
    return Math.max(0.01, Number(value) || 1);
}

function characterEnemyHealthScale(enemy, tuning = DEFAULT_TUNING) {
    return positiveEnemyTuningScale(characterEnemyIsRanged(enemy)
        ? tuning?.rangedEnemyHealthScale
        : tuning?.meleeEnemyHealthScale);
}

function characterEnemyRunSpeedScale(enemy, tuning = DEFAULT_TUNING) {
    return positiveEnemyTuningScale(characterEnemyIsRanged(enemy)
        ? tuning?.rangedEnemyRunSpeedScale
        : tuning?.meleeEnemyRunSpeedScale);
}

function characterEnemyAttackRateScale(enemy, tuning = DEFAULT_TUNING) {
    return positiveEnemyTuningScale(characterEnemyIsRanged(enemy)
        ? tuning?.rangedEnemyAttackRateScale
        : tuning?.meleeEnemyAttackRateScale);
}

function characterEnemyProjectileSpeed(enemy, tuning = DEFAULT_TUNING) {
    const baseSpeed = Math.max(1, finiteNumberOr(enemy?.projectileSpeed, tuning?.enemyDefaultProjectileSpeed));
    return baseSpeed * positiveEnemyTuningScale(tuning?.rangedEnemyProjectileSpeedScale);
}

function syncCharacterEnemyHealthScale(state, enemy) {
    if (!enemy || enemy.kind !== "characterEnemy") {
        return;
    }
    const previousScale = positiveEnemyTuningScale(enemy.tuningHealthScaleApplied);
    const previousMax = Math.max(0, Number(enemy.maxHealth) || 0);
    const baseMax = Math.max(0, Number(enemy.tuningBaseMaxHealth) || (previousMax / previousScale) || Number(enemy.health) || 0);
    const nextScale = characterEnemyHealthScale(enemy, state?.tuning);
    enemy.tuningBaseMaxHealth = baseMax;
    if (Math.abs(nextScale - previousScale) <= 0.000001 && previousMax > 0) {
        enemy.tuningHealthScaleApplied = nextScale;
        return;
    }
    const healthFraction = previousMax > 0
        ? clamp((Number(enemy.health) || 0) / previousMax, 0, 1)
        : ((Number(enemy.health) || 0) > 0 ? 1 : 0);
    const nextMax = baseMax * nextScale;
    enemy.maxHealth = nextMax;
    enemy.tuningHealthScaleApplied = nextScale;
    if ((Number(enemy.health) || 0) <= 0 || enemy.combatState === ENEMY_COMBAT_STATE.DEAD) {
        enemy.health = 0;
    } else {
        enemy.health = nextMax * healthFraction;
    }
}

export function syncEnemyTuningHealthScales(state) {
    for (const enemy of state?.enemies || []) {
        syncCharacterEnemyHealthScale(state, enemy);
    }
}

function createCharacterEnemyRuntime(state, entity, index = 0) {
    const x = Number(entity.x) || 0;
    const y = Number(entity.y) || 0;
    const dimensions = scaledEnemyDimensions(entity, 72, 150);
    const enemyScale = normalizeEnemyScale(entity.scale, 1);
    const width = dimensions.width;
    const height = dimensions.height;
    const anchor = entity.targetAnchor && typeof entity.targetAnchor === "object" ? entity.targetAnchor : null;
    const anchorX = clamp(Number(anchor?.x ?? 0.5), 0, 1);
    const anchorY = clamp(Number(anchor?.y ?? 0.42), 0, 1);
    const facing = Number(entity.facing) < 0 ? -1 : 1;
    // SDL preserves the authored strategy string verbatim. Only exact known
    // values enter their specialized branches later in the state machine.
    const strategy = entity.strategy === undefined || entity.strategy === null
        ? "sentry"
        : String(entity.strategy);
    const locomotion = (entity.locomotion === undefined || entity.locomotion === null
        ? "ground"
        : String(entity.locomotion)) === "flying"
        ? "flying"
        : "ground";
    const isPassive = strategy === "passive";
    const isSimplePatrol = strategy === "simple_patrol";
    const patrolDistance = Math.max(0, finiteNumberOr(entity.patrolDistance, 0));
    const idleDuration = Math.max(0, finiteNumberOr(entity.idleDuration, 1.1));
    const attackMode = String(entity.attackType || state.tuning.enemyDefaultAttackMode || "melee") === "projectile" ? "projectile" : "melee";
    const projectileKind = String(entity.projectileKind || state.tuning.enemyDefaultProjectileKind || "fireball");
    const projectileDefaults = enemyProjectileKindDefinition(state, projectileKind);
    const authoredDamage = Math.max(0, finiteNumberOr(
        entity.damage,
        attackMode === "projectile"
            ? state.tuning.enemyDefaultProjectileDamage
            : state.tuning.enemyDefaultAttackDamage
    ));
    const contactDamageBase = authoredDamage;
    const tuningBaseMaxHealth = Math.max(0, finiteNumberOr(entity.health, 90));
    const tuningHealthScaleApplied = characterEnemyHealthScale({ attackMode }, state.tuning);
    const health = tuningBaseMaxHealth * tuningHealthScaleApplied;
    const renderScale = scaledEnemyRenderScale(entity, 1);
    const animationTime = Number.isFinite(Number(entity.animationTime)) ? Number(entity.animationTime) : 0;
    const enemyId = entity.id || `characterEnemy_${index + 1}`;
    const characterId = String(entity.characterId || entity.characterProject || "ct_char_enemy_001");
    const loadedDropProfile = state.characterDropProfiles?.[characterId] || {};
    const bossDropProfile = normalizeCharacterDropProfile(entity);
    const usesBossDropTable = entity.isBoss === true;
    const dropTable = (usesBossDropTable
        ? bossDropProfile.drops
        : (Array.isArray(loadedDropProfile.drops) ? loadedDropProfile.drops : [])
    ).map((entry) => ({ ...entry }));
    const loopAnimationVariant = resolveLoopAnimationVariant(state, entity, enemyId, characterId, x, y);
    const bomberMeanderVariant = resolveBomberMeanderVariant(state, entity, enemyId, characterId, x, y);
    return {
        id: enemyId,
        kind: "characterEnemy",
        isBoss: entity.isBoss === true,
        bossName: String(entity.bossName || "").trim() || "Boss",
        bossDefeatSignalChannel: entity.bossDefeatSignalChannel ? normalizeSignalChannel(entity.bossDefeatSignalChannel) : null,
        bossDefeatEmitted: false,
        autoSpawned: entity.autoSpawned === true,
        enemyDefinitionId: entity.enemyDefinitionId ? String(entity.enemyDefinitionId) : null,
        enemySpawnerId: entity.enemySpawnerId ? String(entity.enemySpawnerId) : null,
        characterId,
        bossDropTable: bossDropProfile.drops.map((entry) => ({ ...entry })),
        usesBossDropTable,
        dropTable,
        dropsEmitted: false,
        ...createTransformTriplet({ x, y, scaleX: renderScale, scaleY: renderScale, alpha: 1 }),
        animationClock: createAnimationClock(animationTime),
        spawnX: finiteNumberOr(entity.spawnX, x),
        spawnY: finiteNumberOr(entity.spawnY, y),
        width,
        height,
        enemyScale,
        health,
        maxHealth: health,
        tuningBaseMaxHealth,
        tuningHealthScaleApplied,
        combatState: health > 0 ? "alive" : "dead",
        simulationDormant: false,
        penetrationRecoveryTicks: 0,
        penetrationRecoveryProbeX: null,
        penetrationRecoveryProbeY: null,
        state: health > 0 ? "idle" : "death",
        animationSlot: health > 0 ? "idle" : "death",
        animationTimeOffset: Number(entity.animationTimeOffset) || 0,
        loopAnimationPhaseVariation: loopAnimationVariant.phaseVariation,
        loopAnimationPeriodVariation: loopAnimationVariant.periodVariation,
        loopAnimationPhaseOffsetCycles: loopAnimationVariant.phaseOffsetCycles,
        loopAnimationPeriodScale: loopAnimationVariant.periodScale,
        facing,
        strategy,
        locomotion,
        hunterPursuePlayerSupport: entity.hunterPursuePlayerSupport === true || String(entity.projectileLaunchType || "").startsWith("pathing_"),
        aiState: health <= 0 ? "dead" : (isPassive ? "idle" : (locomotion === "flying" ? "fly" : (strategy === "hunter" ? "patrol" : strategy))),
        engaged: false,
        patrolDistance,
        patrolMinX: x - patrolDistance * 0.5,
        patrolMaxX: x + patrolDistance * 0.5,
        homePatrolMinX: x - patrolDistance * 0.5,
        homePatrolMaxX: x + patrolDistance * 0.5,
        temporaryPatrolMinX: null,
        temporaryPatrolMaxX: null,
        homeSupportId: null,
        currentSupportId: null,
        supportId: null,
        ridingPlatformId: null,
        groundStride: null,
        route: [],
        routeIndex: 0,
        routeTargetSupportId: null,
        routeTargetX: null,
        routeTargetY: null,
        routePurpose: null,
        routeObservedTargetSupportId: null,
        routeObservedTargetX: null,
        routeObservedTargetY: null,
        routeRepathTimer: 0,
        navigationFailureCount: 0,
        navigationTransitionFailures: {},
        navigationLastFailedTransitionKey: null,
        hunterWatchdogX: null,
        hunterWatchdogY: null,
        hunterWatchdogElapsed: 0,
        hunterWatchdogTimeoutCount: 0,
        hunterWatchdogRecoveryTimer: 0,
        airborne: locomotion === "flying",
        velocityX: 0,
        velocityY: 0,
        groundVelocityX: 0,
        routeTraversalPhase: null,
        routeTraversalEdgeIndex: -1,
        airTimer: 0,
        airTraversalType: null,
        airSourceSupportId: null,
        airSourceObstacleId: null,
        airTargetSupportId: null,
        walkSpeed: Math.max(0, finiteNumberOr(entity.walkSpeed, 56)),
        runSpeed: Math.max(0, finiteNumberOr(entity.runSpeed, state.tuning.enemyDefaultRunSpeed)),
        runAcceleration: Math.max(1, finiteNumberOr(entity.runAcceleration, state.tuning.groundAcceleration)),
        jumpHeight: Math.max(0, finiteNumberOr(entity.jumpHeight, state.tuning.enemyDefaultJumpHeight)),
        jumpGravity: Math.max(1, finiteNumberOr(entity.jumpGravity, state.tuning.enemyDefaultJumpGravity)),
        maxFallDistance: Math.max(0, finiteNumberOr(entity.maxFallDistance, state.tuning.enemyDefaultMaxFallDistance)),
        unreachableGlareDuration: Math.max(0, finiteNumberOr(entity.unreachableGlareDuration, state.tuning.enemyDefaultGlareSeconds)),
        glareTimer: 0,
        routeRepathInterval: Math.max(FIXED_DT, finiteNumberOr(entity.routeRepathInterval, state.tuning.enemyDefaultRepathSeconds)),
        homeRetryInterval: Math.max(FIXED_DT, finiteNumberOr(entity.homeRetryInterval, state.tuning.enemyDefaultHomeRetrySeconds)),
        homeRetryTimer: 0,
        awarenessRange: Math.max(0, finiteNumberOr(entity.awarenessRange, state.tuning.enemyDefaultAwarenessRange)),
        awarenessHoldDuration: Math.max(0, finiteNumberOr(entity.awarenessHoldDuration, state.tuning.enemyDefaultAwarenessHoldSeconds)),
        awarenessViewHalfAngle: clamp(finiteNumberOr(entity.awarenessViewHalfAngle, state.tuning.enemyDefaultAwarenessViewHalfAngle), 0, 180),
        deaf: entity.deaf === true,
        awarenessTimer: 0,
        alerted: false,
        panicTimer: 0,
        panicPhase: null,
        panicPhaseTimer: 0,
        panicMoveDirection: facing,
        panicAttackAngle: facing < 0 ? Math.PI : 0,
        panicChoiceCount: 0,
        lastSeenPlayerX: null,
        lastSeenPlayerY: null,
        lastSeenAt: null,
        lastSeenSupportId: null,
        glareFocusX: null,
        glareFocusY: null,
        idleDuration,
        turnPause: Math.max(0, finiteNumberOr(entity.turnPause, 0.5)),
        maxStepHeight: Math.max(0, finiteNumberOr(entity.maxStepHeight, 26)),
        maxDropDistance: Math.max(0, finiteNumberOr(entity.maxDropDistance, 34)),
        groundSnapDistance: Math.max(0, finiteNumberOr(entity.groundSnapDistance, 96)),
        movementPhase: health <= 0 ? "dead" : (locomotion === "flying" ? "fly" : (isPassive ? "idle" : (isSimplePatrol && patrolDistance > 0 ? "idle" : "guard"))),
        phaseTimer: locomotion === "flying" ? 0 : (isPassive ? 0 : (isSimplePatrol && patrolDistance > 0 ? idleDuration : 0)),
        flightBaseY: y,
        flightTime: Math.max(0, finiteNumberOr(entity.flightTime, 0)),
        flightPhaseOffset: finiteNumberOr(entity.flightPhaseOffset, 0),
        flightAmplitude: Math.max(0, finiteNumberOr(entity.flightAmplitude, 16)),
        flightCyclesPerSecond: Math.max(0, finiteNumberOr(entity.flightCyclesPerSecond, 0.58)),
        bomberHorizontalSpeed: Math.max(0, finiteNumberOr(entity.bomberHorizontalSpeed, Math.max(150, finiteNumberOr(entity.runSpeed, state.tuning.enemyDefaultRunSpeed)))),
        bomberHoverHeight: Math.max(16, finiteNumberOr(entity.bomberHoverHeight, 180)),
        bomberDropTolerance: Math.max(1, finiteNumberOr(entity.bomberDropTolerance, 34)),
        bomberDropHeightTolerance: Math.max(4, finiteNumberOr(entity.bomberDropHeightTolerance, 36)),
        bomberRetreatDistance: Math.max(0, finiteNumberOr(entity.bomberRetreatDistance, 120)),
        bomberObstacleClearance: Math.max(8, finiteNumberOr(entity.bomberObstacleClearance, 56)),
        bomberScreenTopMargin: Math.max(20, finiteNumberOr(entity.bomberScreenTopMargin, 72)),
        bomberSteeringResponse: Math.max(0.5, finiteNumberOr(entity.bomberSteeringResponse, 4.5)),
        bomberWanderAmplitude: Math.max(0, finiteNumberOr(entity.bomberWanderAmplitude, 28)),
        bomberObstacleProbeTimer: 0,
        bomberAvoidanceOffsetX: 0,
        bomberAvoidanceOffsetY: 0,
        bomberMeanderPhaseX: bomberMeanderVariant.phaseX,
        bomberMeanderPhaseY: bomberMeanderVariant.phaseY,
        bomberMeanderRateScale: bomberMeanderVariant.rateScale,
        bomberMeanderAmplitudeScale: bomberMeanderVariant.amplitudeScale,
        bomberMeanderBiasX: bomberMeanderVariant.biasX,
        bomberMeanderBiasY: bomberMeanderVariant.biasY,
        bomberApproachArcHeight: Math.max(0, finiteNumberOr(entity.bomberApproachArcHeight, 64)),
        bomberDropTimer: Math.max(0, finiteNumberOr(entity.bomberInitialDelay, 0.4)),
        bomberState: strategy === "bomber" ? "perched" : null,
        bomberPerchX: x,
        bomberPerchY: y,
        deathFlightSpeed: Math.max(1, finiteNumberOr(entity.deathFlightSpeed, 520)),
        deathFlightLift: Math.max(0, finiteNumberOr(entity.deathFlightLift, 210)),
        deathFlightGravity: finiteNumberOr(entity.deathFlightGravity, 90),
        deathFlyOffDistance: Math.max(1, finiteNumberOr(entity.deathFlyOffDistance, 720)),
        deathFlightStarted: false,
        deathFlightStartX: x,
        deathFlightStartY: y,
        deathFlightDirection: facing,
        hurtDuration: Math.max(FIXED_DT, finiteNumberOr(entity.hurtDuration, state.tuning.enemyDefaultHurtSeconds)),
        deathDuration: Math.max(FIXED_DT, finiteNumberOr(entity.deathDuration, state.tuning.enemyDefaultDeathSeconds)),
        damage: authoredDamage,
        contactDamageBase,
        attackDamage: authoredDamage,
        attackRange: attackMode === "projectile"
            ? Math.max(1, finiteNumberOr(entity.attackRange, state.tuning.enemyDefaultAttackRange))
            : 0,
        attackVerticalRange: Math.max(1, finiteNumberOr(entity.attackVerticalRange, state.tuning.enemyDefaultAttackVerticalRange)),
        attackDuration: Math.max(FIXED_DT, finiteNumberOr(entity.attackDuration, state.tuning.enemyDefaultAttackDuration)),
        attackHitTime: Math.max(0, finiteNumberOr(entity.attackHitTime, state.tuning.enemyDefaultAttackHitTime)),
        attackCooldown: Math.max(0, finiteNumberOr(
            entity.attackCooldown,
            attackMode === "projectile" ? state.tuning.enemyDefaultProjectileCooldown : state.tuning.enemyDefaultAttackCooldown
        )),
        immuneToInterrupts: entity.immuneToInterrupts === true,
        attackMode,
        attackType: attackMode,
        preferredAttackRange: Math.max(0, finiteNumberOr(entity.preferredAttackRange, state.tuning.enemyDefaultPreferredAttackRange)),
        preferredAttackMinRange: Math.max(0, finiteNumberOr(entity.preferredAttackMinRange, Math.min((Number(entity.attackRange) || state.tuning.enemyDefaultAttackRange) * 0.45, state.tuning.enemyDefaultPreferredAttackRange * 0.6))),
        projectileKind,
        projectileLaunchType: String(entity.projectileLaunchType || ""),
        projectileReleaseTime: Math.max(0, finiteNumberOr(entity.projectileReleaseTime, entity.attackHitTime ?? state.tuning.enemyDefaultAttackHitTime)),
        projectilePartName: entity.projectilePartName ? String(entity.projectilePartName) : null,
        projectileFrameId: entity.projectileFrameId ? String(entity.projectileFrameId) : null,
        projectileVisualCharacterId: String(entity.projectileVisualCharacterId || projectileDefaults.visualCharacterId || ""),
        projectileVisualFrameId: String(entity.projectileVisualFrameId || projectileDefaults.visualFrameId || ""),
        projectileOriginLocalX: Object.prototype.hasOwnProperty.call(entity, "projectileOriginLocalX") && entity.projectileOriginLocalX !== null
            ? finiteNumberOr(entity.projectileOriginLocalX, 0)
            : 0,
        projectileOriginLocalY: Object.prototype.hasOwnProperty.call(entity, "projectileOriginLocalY") && entity.projectileOriginLocalY !== null
            ? finiteNumberOr(entity.projectileOriginLocalY, 0)
            : 0,
        hasProjectileOriginLocal: Object.prototype.hasOwnProperty.call(entity, "projectileOriginLocalX")
            && entity.projectileOriginLocalX !== null
            && Object.prototype.hasOwnProperty.call(entity, "projectileOriginLocalY")
            && entity.projectileOriginLocalY !== null,
        projectileRigScale: Math.max(0.0001, finiteNumberOr(entity.projectileRigScale, 1)),
        projectileSpeed: Math.max(1, finiteNumberOr(entity.projectileSpeed, state.tuning.enemyDefaultProjectileSpeed)),
        projectileGravity: finiteNumberOr(entity.projectileGravity, state.tuning.enemyDefaultProjectileGravity),
        projectileLifetime: Math.max(FIXED_DT, finiteNumberOr(entity.projectileLifetime, state.tuning.enemyDefaultProjectileLifetime)),
        projectileRadius: scaledEnemyProjectileRadius(entity, state.tuning.enemyDefaultProjectileRadius),
        projectileDamage: authoredDamage,
        projectileCooldown: Math.max(0, finiteNumberOr(entity.attackCooldown, state.tuning.enemyDefaultProjectileCooldown)),
        projectileHomingStrength: Math.max(0, finiteNumberOr(entity.projectileHomingStrength, state.tuning.enemyDefaultProjectileHomingStrength)),
        projectilePathMargin: Math.max(0, finiteNumberOr(entity.projectilePathMargin, 0)),
        projectileVolleyCount: clamp(Math.round(finiteNumberOr(entity.spreadCount, 1)), 1, 15),
        projectileVolleyHalfAngle: Math.max(0, finiteNumberOr(entity.spreadAngle, 0)),
        meleeHitRange: Math.max(0, finiteNumberOr(entity.meleeHitRange, 0)),
        projectileRendererKind: String(entity.projectileRendererKind || projectileDefaults.rendererKind || "enemyFireball"),
        projectileVisualScale: Math.max(0.01, finiteNumberOr(entity.projectileVisualScale, finiteNumberOr(projectileDefaults.visualScale, 1))),
        projectileRotationSpeedDegrees: finiteNumberOr(entity.projectileRotationSpeedDegrees, finiteNumberOr(projectileDefaults.rotationSpeedDegrees, 0)),
        projectileOrientToVelocity: entity.projectileOrientToVelocity === undefined ? projectileDefaults.orientToVelocity === true : entity.projectileOrientToVelocity === true,
        projectileTrailEffect: String(entity.projectileTrailEffect || projectileDefaults.trailEffect || "none"),
        projectileImpactEffect: String(entity.projectileImpactEffect || projectileDefaults.impactEffect || "sparks"),
        projectileExplosionEffect: String(entity.projectileExplosionEffect || projectileDefaults.explosionEffect || "impact"),
        projectileExplosionVisualScale: Math.max(0.01, finiteNumberOr(entity.projectileExplosionVisualScale, finiteNumberOr(projectileDefaults.explosionVisualScale, 1))),
        projectileAreaDamageRadiusWizardHeights: Math.max(0, finiteNumberOr(entity.projectileAreaDamageRadiusWizardHeights, finiteNumberOr(projectileDefaults.areaDamageRadiusWizardHeights, 0))),
        projectileKnockbackX: finiteNumberOr(entity.projectileKnockbackX, state.tuning.enemyDefaultProjectileKnockbackX),
        projectileKnockbackY: finiteNumberOr(entity.projectileKnockbackY, state.tuning.enemyDefaultProjectileKnockbackY),
        lungeRangeMax: Math.max(0, finiteNumberOr(entity.lungeRangeMax, 0)),
        lungeRangeMin: Math.max(0, finiteNumberOr(entity.lungeRangeMin, 0)),
        lungeSpeed: Math.max(0, finiteNumberOr(entity.lungeSpeed, 0)),
        lungeTargetDist: Math.max(0, finiteNumberOr(entity.lungeTargetDist, 0)),
        attackKnockbackX: Math.max(0, finiteNumberOr(entity.attackKnockbackX, state.tuning.enemyDefaultAttackKnockbackX)),
        attackKnockbackY: finiteNumberOr(entity.attackKnockbackY, state.tuning.enemyDefaultAttackKnockbackY),
        attackTimer: 0,
        attackCooldownTimer: 0,
        attackLungeActive: false,
        attackLungeStarted: false,
        attackLungeTargetX: null,
        attackLungeStartTime: 0,
        attackLungeImpactTime: 0,
        attackLungeVisualLaunchTime: 0,
        attackLungeRateScale: 1,
        attackHandoffDelay: 0,
        attackRuntimeDuration: 0,
        attackHitApplied: false,
        hurtTimer: 0,
        deathTimer: health <= 0 ? Math.max(FIXED_DT, finiteNumberOr(entity.deathDuration, state.tuning.enemyDefaultDeathSeconds)) : 0,
        deathPendingLanding: false,
        deathElapsed: 0,
        corpseHoldDuration: Math.max(0, finiteNumberOr(entity.corpseHoldDuration, state.tuning.enemyCorpseHoldSeconds)),
        corpseFadeDuration: Math.max(0, finiteNumberOr(entity.corpseFadeDuration, state.tuning.enemyCorpseFadeSeconds)),
        hitFlashTimer: 0,
        hitFlashDuration: state.tuning.enemyHitFlashSeconds,
        healthBarTimer: 0,
        lastDamagedAt: null,
        lastHitBy: null,
        // Keep artwork offsets in authored character-local units. Presentation
        // multiplies them by renderScale, which already includes enemyScale, so
        // pre-scaling here would move the artwork origin by enemyScale twice.
        renderOffsetX: Number(entity.renderOffsetX) || 0,
        renderOffsetY: Number(entity.renderOffsetY) || 0,
        // Historical name: true suppresses the ordinary enemy presentation; debug guides may still render.
        visualized: entity.visualized === true,
        targetAnchorX: anchorX,
        targetAnchorY: anchorY,
        targetX: x - width * 0.5 + anchorX * width,
        targetY: y - height + anchorY * height,
        targetRadius: Math.max(4, Number(entity.targetRadius) || Math.min(width, height) * 0.16),
        showTargetMarker: entity.showTargetMarker === true
    };
}

export function applyEditorLevelToWorld(state, editorLevel) {
    if (!state?.world || !editorLevel || typeof editorLevel !== "object") {
        return false;
    }

    const random = ensureRandomState(state);
    random.levelLoadCount += 1;
    const source = editorLevel.level || editorLevel;
    const autoSpawnEnemies = normalizeAutoSpawnEnemies(source.autoSpawnEnemies);
    const caveWindow = normalizeCaveWindow(source.caveWindow);
    const layerVisuals = normalizeLevelLayerVisuals(source.layerVisuals);
    const caveKillBoundary = deriveCaveFullBlackKillBoundary(caveWindow);
    const placements = Array.isArray(source.placements) ? source.placements : [];
    const entities = Array.isArray(source.entities) ? source.entities : [];
    const enemyCatalog = normalizeEnemyDefinitionCatalog(state.enemyCatalog);
    const entryPortalSource = wizardEntryPortalEntity(entities);
    const playerStart = entryPortalPlayerStart(entryPortalSource);

    const visuals = [];
    for (const placement of placements) {
        if (!placement) {
            continue;
        }

        if (placement.kind === "cutoutMask") {
            visuals.push({
                id: placement.id || `cutoutMask_${visuals.length}`,
                kind: "cutoutMask",
                x: Number(placement.x) || 0,
                y: Number(placement.y) || 0,
                w: Math.max(1, Number(placement.w) || 64),
                h: Math.max(1, Number(placement.h) || 64),
                layer: placement.layer || "mask",
                order: Number.isFinite(Number(placement.order)) ? Number(placement.order) : visuals.length,
                notes: placement.notes || ""
            });
            continue;
        }

        if (placement.kind !== "atlasAsset") {
            continue;
        }
        const assetId = placement.assetId;
        if (!assetId) {
            continue;
        }
        const layer = placement.layer || "terrain";
        const foreground = layer === CAVE_FOREGROUND_LAYER_ID;
        const background = layer === BACKGROUND_LAYER;
        const inertCosmetic = background || foreground;
        const movement = inertCosmetic ? null : normalizeMovingPlatform(placement.movement);
        const authoredX = Number(placement.x) || 0;
        const authoredY = Number(placement.y) || 0;
        const authoredW = Math.max(1, Number(placement.w) || 64);
        const authoredH = Math.max(1, Number(placement.h) || 64);
        const layerScale = foreground
            ? layerVisuals.foreground.scale
            : background
                ? layerVisuals.background.scale
                : 1;
        const width = authoredW * layerScale;
        const height = authoredH * layerScale;
        visuals.push({
            id: placement.id || `${assetId}_${visuals.length}`,
            kind: "atlasSprite",
            atlasId: normalizeAtlasId(placement.atlasId || "at_atlas_001"),
            assetId,
            frame: assetId,
            x: authoredX + (authoredW - width) * 0.5,
            y: authoredY + (authoredH - height) * 0.5,
            w: width,
            h: height,
            mirrorX: Boolean(placement.mirrorX),
            mirrorY: Boolean(placement.mirrorY),
            rotation: normalizeRotationRadians(placement.rotation),
            layer,
            onTop: placement.onTop === true,
            blendOverlaps: placement.blendOverlaps !== false,
            collisionFromManifest: inertCosmetic ? false : placement.collisionFromManifest !== false,
            foregroundBrightness: foreground ? layerVisuals.foreground.brightness : undefined,
            foregroundSaturation: Number.isFinite(Number(placement.foregroundSaturation)) ? Number(placement.foregroundSaturation) : undefined,
            backgroundBrightness: background ? layerVisuals.background.brightness : undefined,
            alpha: Number.isFinite(Number(placement.alpha)) ? Number(placement.alpha) : undefined,
            generatedBy: placement.generatedBy || undefined,
            caveCategory: placement.caveCategory || undefined,
            movement: movement || undefined,
            dynamicPosition: Boolean(movement),
            order: Number.isFinite(Number(placement.order)) ? Number(placement.order) : visuals.length
        });
    }
    const runtimeEntities = deepClone(entities).map((entity) => {
        const type = String(entity?.type || "");
        const enemyCatalogId = String(entity?.enemyCatalogId || "");
        if ((type === "characterEnemy" || type === "enemy") && enemyCatalogId) {
            const definition = enemyCatalog.enemies[enemyCatalogId];
            if (definition) {
                return {
                    ...deepClone(definition.defaults || {}),
                    ...entity,
                    enemyCatalogId,
                    characterId: String(entity.characterId || definition.characterId),
                    w: Math.max(1, Number(entity.w) || definition.defaultSize.w),
                    h: Math.max(1, Number(entity.h) || definition.defaultSize.h)
                };
            }
        }
        return entity;
    });
    for (const entity of runtimeEntities) {
        editorEntityVisuals(entity).forEach((visual, index) => {
            if (visual?.assetId) visuals.push(editorEntityVisualToWorld(entity, visual, index, entity.state || ""));
        });
    }
    const enemySpawners = runtimeEntities
        .filter((entity) => String(entity?.type || "") === "enemySpawner")
        .map((entity, index) => {
            const config = normalizeEnemySpawner(entity);
            return {
                id: String(entity.id || `enemy_spawner_${index + 1}`),
                entityId: String(entity.id || `enemy_spawner_${index + 1}`),
                x: Number(entity.x) || 0,
                y: Number(entity.y) || 0,
                width: Math.max(1, Number(entity.w) || 64),
                height: Math.max(1, Number(entity.h) || 64),
                groundSnapDistance: Math.max(24, Number(entity.groundSnapDistance) || 96),
                disableSignalChannel: entity.disableSignalChannel ? normalizeSignalChannel(entity.disableSignalChannel) : null,
                ...config,
                intervalSeconds: 1,
                timer: 1,
                rollCount: 0,
                spawnCount: 0,
                onScreen: false,
                lastResolvedEnemyIds: [],
                lastError: null
            };
        });

    visuals.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const authoredBounds = source.world?.bounds;
    const hasAuthoredBounds = Boolean(
        authoredBounds &&
        Number.isFinite(Number(authoredBounds.x)) &&
        Number.isFinite(Number(authoredBounds.y)) &&
        Number.isFinite(Number(authoredBounds.w)) &&
        Number.isFinite(Number(authoredBounds.h)) &&
        Number(authoredBounds.w) > 0 &&
        Number(authoredBounds.h) > 0
    );
    if (!visuals.length && !playerStart && !entities.length && !hasAuthoredBounds) {
        return false;
    }

    clearLevelStartTransientStatus(state);

    const bounds = hasAuthoredBounds
        ? {
            x: Number(authoredBounds.x),
            y: Number(authoredBounds.y),
            w: Number(authoredBounds.w),
            h: Number(authoredBounds.h)
        }
        : estimateEditorLevelBounds(visuals, playerStart, entities);
    const atlasManifests = Array.isArray(source.atlasRefs)
        ? source.atlasRefs.map((ref) => ref.manifest).filter(Boolean).map(normalizeAtlasManifestPath)
        : ["atlases/at_atlas_001.json"];
    state.world = {
        ...state.world,
        levelId: source.levelId || "browser_copy_playtest",
        bounds,
        start: playerStart ? { x: Number(playerStart.x) || 120, y: Number(playerStart.y) || 360 } : state.world.start,
        atlasManifests,
        colorMap: normalizeLevelColorMap(source.colorMap),
        colorExchange: normalizeLevelColorExchange(source.colorExchange),
        music: normalizeLevelMusic(source.music),
        layerVisuals,
        autoSpawnEnemies: {
            ...autoSpawnEnemies,
            intervalSeconds: 1,
            timer: 1,
            rollCount: 0,
            spawnCount: 0,
            lastResolvedEnemyIds: [],
            lastError: null
        },
        enemySpawners,
        caveWindow,
        caveKillBoundary,
        cameraLine: normalizeCameraLine(source.cameraLine),
        visuals,
        movingPlatforms: createMovingPlatformRuntimes(visuals),
        signalChannels: {},
        signalEmitters: [],
        signalReceivers: [],
        entities: runtimeEntities,
        entityStates: Object.fromEntries(runtimeEntities.filter((entity) => entity.id).map((entity) => [entity.id, entity.state || ""])),
        solids: [],
        segments: [],
        collisionMode: "editorLevelPendingManifest",
        collisionSegmentCount: 0,
        labels: [
            { text: source.levelId || "loaded level", x: (playerStart?.x ?? 120) - 30, y: (playerStart?.y ?? 360) - 70 }
        ],
        navigationGraphs: deepClone(source.navigationGraphs || { version: 1, profiles: [] }),
        navigationBlockers: deepClone(source.navigationBlockers || []),
        playerStartGroundSnapResolved: false
    };
    initializeDynamicVisualTransforms(state.world.visuals);
    initializeMovingPlatformTransforms(state);
    state.story.portalIntro = null;
    state.story.portalExit = null;
    state.story.mailboxEvent = null;
    state.story.mailboxEvents = [];
    state.story.cutscene = null;
    state.story.cutsceneScripts = [];
    state.story.symbolTriggers = [];
    state.story.overheadSymbol = null;
    state.story.proximityTexts = [];
    state.story.levelTransitionRequest = null;

    if (playerStart) {
        state.player.currentTransform.x = state.world.start.x;
        state.player.currentTransform.y = state.world.start.y;
        state.player.spawnX = state.world.start.x;
        state.player.spawnY = state.world.start.y;
        state.player.vx = 0;
        state.player.vy = 0;
        setCurrentUniformScale(state.player, 1);
        state.player.onGround = false;
        state.player.wasOnGround = false;
        state.player.airBoostArmed = false;
        state.camera.currentTransform.x = state.player.currentTransform.x;
        state.camera.currentTransform.y = state.player.currentTransform.y - 170;
        resetCameraLineTracking(state);
    }

    configurePortalIntro(state, runtimeEntities);
    configurePortalExit(state, runtimeEntities);
    configureMailboxStory(state, runtimeEntities);
    configureCutsceneScripts(state, runtimeEntities);
    configureOverheadSymbolTriggers(state, runtimeEntities);
    configureProximityTexts(state, runtimeEntities);
    configureSignalSystem(state, runtimeEntities);

    const legacyTrainingEnemy = (entity) => {
        if (entity?.type !== "targetDummy") return entity;
        return {
            ...entity,
            type: "characterEnemy",
            enemyCatalogId: "enemy_900",
            characterId: "ct_char_enemy_900",
            strategy: "passive",
            showTargetMarker: false
        };
    };

    const characterEnemyLike = (entity) =>
        entity.type === "characterEnemy" ||
        entity.type === "targetDummy" ||
        (entity.type === "enemy" && (entity.characterId || entity.characterProject));
    const characterEnemies = runtimeEntities.filter(characterEnemyLike).map((entity, index) =>
        createCharacterEnemyRuntime(state, legacyTrainingEnemy(entity), index)
    );
    state.enemies = characterEnemies;

    state.pickups = runtimeEntities.filter(isPickupEntity).map((entity, index) => {
        const type = String(entity.type || "");
        const isWrenchPickup = type === "wrenchPickup" || type === "randomWrenchPickup";
        const authoredEffectId = isWrenchPickup
            ? normalizeWrenchPowerUpEffectId(entity.wrenchEffectId || entity.effectId)
            : (entity.effectId ||
                (type === "overdrivePickup"
                    ? POWER_UP_EFFECT_IDS.OVERDRIVE
                    : (type === "shieldPickup"
                        ? POWER_UP_EFFECT_IDS.SHIELD
                        : (type === "magicRingPickup" || entity.pickupKind === "magicRing"
                            ? POWER_UP_EFFECT_IDS.MAGIC_RING
                            : ((type === "fuel" || type === "fuelPickup") ? POWER_UP_EFFECT_IDS.FLIGHT : null)))));
        const powerUp = authoredEffectId
            ? normalizePowerUpPickup({
                ...entity,
                effectId: authoredEffectId
            })
            : null;
        const pickupKind = String(entity.pickupKind || (type === "fuel" ? "fuel" : type || "item"));
        const upgradeKind = normalizedPlayerUpgradeKind(entity.upgradeKind || pickupKind || type);
        const kind = upgradeKind ? "upgrade" : (powerUp ? "powerUp" : (pickupKind === "fuel" ? "fuel" : "item"));
        const width = Math.max(1, Number(entity.w) || (powerUp ? 96 : 42));
        const height = Math.max(1, Number(entity.h) || (powerUp ? 96 : 80));
        const respawnSeconds = upgradeKind
            ? 0
            : (powerUp
                ? Math.max(0, finiteNumberOr(entity.respawnSeconds, 60))
                : Math.max(0, finiteNumberOr(entity.respawnSeconds, 0)));
        const id = entity.id || `${pickupKind}_${index + 1}`;
        const collectionId = upgradeKind ? playerUpgradeCollectionId(state.world.levelId, id) : "";
        const collected = entity.state === "collected"
            || (collectionId && state.playerProgression.collectedUpgradeIds.includes(collectionId));
        return {
            id,
            entityId: id,
            collectionId,
            kind,
            pickupKind: upgradeKind || (powerUp ? powerUp.effectId : pickupKind),
            upgradeKind,
            powerUp,
            x: Number(entity.x) || 0,
            y: Number(entity.y) || 0,
            centerY: (Number(entity.y) || 0) - height * 0.5,
            width,
            height,
            radius: Math.max(4, Number(entity.radius) || powerUp?.radius || Math.min(width, height) * 0.42),
            amount: Math.max(1, Number(entity.amount) || (kind === "fuel" ? 40 : 1)),
            collected,
            respawnSeconds,
            respawnTimer: collected ? respawnSeconds : 0,
            randomEffectIds: [],
            randomRollCount: 0,
            visualized: editorEntityVisuals(entity).length > 0
        };
    });
    for (const pickup of state.pickups) {
        if (!pickup.collected) continue;
        setWorldEntityState(state, pickup.entityId || pickup.id, "collected");
    }
    if (!state.inventory || typeof state.inventory !== "object") state.inventory = { items: {} };
    if (!state.inventory.items || typeof state.inventory.items !== "object") state.inventory.items = {};

    state.score = normalizedScore(state);
    state.treasureChests = runtimeEntities.filter(treasureChestLike).map((entity, index) => {
        const width = Math.max(1, Number(entity.w) || 130);
        const height = Math.max(1, Number(entity.h) || 150);
        const authoredState = String(entity.state || "openLoot");
        const collected = entity.collected === true || authoredState === "openEmpty";
        return {
            id: entity.id || `treasureChest_${index + 1}`,
            entityId: entity.id || `treasureChest_${index + 1}`,
            x: Number(entity.x) || 0,
            y: Number(entity.y) || 0,
            width,
            height,
            scoreValue: normalizedScoreValue(entity.scoreValue, 100),
            collectionDistance: Math.max(8, finiteNumberOr(entity.collectionDistance, 88)),
            lootDisplaySeconds: Math.max(FIXED_DT, finiteNumberOr(entity.lootDisplaySeconds, 0.8)),
            lootDisplayTimer: collected && authoredState === "openLoot"
                ? Math.max(FIXED_DT, finiteNumberOr(entity.lootDisplaySeconds, 0.8))
                : 0,
            collected,
            state: collected ? "openEmpty" : (authoredState === "openEmpty" ? "openEmpty" : "openLoot")
        };
    });

    state.reactiveObjects = runtimeEntities.filter(isReactiveWorldEntity).map((entity, index) => {
        const authoredHealth = finiteNumberOr(entity.health, 90);
        const maxHealth = Math.max(1, finiteNumberOr(entity.maxHealth, authoredHealth));
        const initialState = String(entity.state || "intact");
        const health = initialState === "destroyed" || initialState === "inactive"
            ? 0
            : clamp(finiteNumberOr(entity.currentHealth, authoredHealth), 0, maxHealth);
        const damagedHealthThreshold = clamp(
            finiteNumberOr(entity.damagedHealthThreshold, maxHealth * 0.5),
            0,
            maxHealth
        );
        return {
            id: entity.id || `reactiveObject_${index + 1}`,
            entityId: entity.id || `reactiveObject_${index + 1}`,
            kind: String(entity.reactiveKind || "destructible"),
            type: String(entity.type || "reactiveObject"),
            x: Number(entity.x) || 0,
            y: Number(entity.y) || 0,
            width: Math.max(1, Number(entity.w) || 80),
            height: Math.max(1, Number(entity.h) || 80),
            health,
            maxHealth,
            state: health <= 0 ? "destroyed" : initialState,
            intactState: String(entity.intactState || "intact"),
            damagedState: String(entity.damagedState || "damaged"),
            destroyedState: String(entity.destroyedState || "destroyed"),
            damagedHealthThreshold,
            projectileDamageMultiplier: Math.max(0, finiteNumberOr(entity.projectileDamageMultiplier, 1)),
            blocksPlayer: entity.blocksPlayer !== false,
            blocksProjectiles: entity.blocksProjectiles !== false,
            collisionStates: Array.isArray(entity.collisionStates) ? entity.collisionStates.slice() : ["intact", "damaged"],
            projectileCollisionStates: Array.isArray(entity.projectileCollisionStates)
                ? entity.projectileCollisionStates.slice()
                : ["intact", "damaged"],
            collisionInsetX: Math.max(0, finiteNumberOr(entity.collisionInsetX, 0)),
            collisionInsetTop: Math.max(0, finiteNumberOr(entity.collisionInsetTop, 0)),
            collisionInsetBottom: Math.max(0, finiteNumberOr(entity.collisionInsetBottom, 0)),
            lastDamagedAt: null,
            lastHitBy: null
        };
    });
    for (const object of state.reactiveObjects) {
        syncReactiveObjectCollision(state, object);
    }

    state.targets = state.enemies.map((enemy) => ({
        id: `${enemy.id}_target`,
        kind: "enemyBullseye",
        enemyId: enemy.id,
        x: enemy.targetX,
        y: enemy.targetY,
        radius: enemy.targetRadius,
        state: enemy.health > 0 ? "active" : "inactive",
        showMarker: enemy.showTargetMarker
    }));

    state.story.levelTitle = source.title || source.levelTitle || "Ignatius Rocketfrock and the Loaded Level of Reasonable Expectations";
    snapAllPresentationSubjects(state, "editorLevelApplied");
    addEvent(state, "EDITOR_LEVEL_APPLIED", { placements: visuals.length, entities: entities.length });
    return true;
}

function applyCharacterCombatProfileToEnemy(state, enemy) {
    if (!isCharacterEnemyState(enemy) || enemy.strategy === "passive") return false;
    const profile = state.characterCombatProfiles?.[enemy.characterId];
    if (!profile || typeof profile !== "object") return false;
    const handoffs = Array.isArray(profile.handoffs) ? profile.handoffs : [];
    const attackHandoffs = handoffs
        .filter((item) => String(item?.animationSlot || "attack") === "attack")
        .map((handoff) => ({
            releaseTime: Math.max(0, finiteNumberOr(handoff?.releaseTime, enemy.attackHitTime)),
            partName: handoff?.partName ? String(handoff.partName) : null,
            frameId: handoff?.frameId ? String(handoff.frameId) : null,
            detach: handoff?.detach === true,
            originLocalX: finiteNumberOr(handoff?.localX, 0),
            originLocalY: finiteNumberOr(handoff?.localY, 0),
            hasOriginLocal: Number.isFinite(Number(handoff?.localX)) && Number.isFinite(Number(handoff?.localY)),
            rigScale: Math.max(0.0001, finiteNumberOr(handoff?.rigScale, 1))
        }))
        .sort((a, b) => a.releaseTime - b.releaseTime);
    if (!attackHandoffs.length && !Number.isFinite(Number(profile.attackDuration))) return false;

    enemy.attackHandoffs = attackHandoffs;
    enemy.nextAttackHandoffIndex = 0;
    enemy.attackDuration = Math.max(
        FIXED_DT,
        Number(enemy.attackDuration) || 0,
        attackHandoffs.length ? attackHandoffs[attackHandoffs.length - 1].releaseTime + FIXED_DT : 0,
        Number.isFinite(Number(profile.attackDuration)) ? Number(profile.attackDuration) : 0
    );
    if (attackHandoffs.length) {
        const first = attackHandoffs[0];
        enemy.attackHitTime = first.releaseTime;
        if (first.detach) {
            enemy.projectileReleaseTime = enemy.attackHitTime;
            enemy.projectilePartName = first.partName;
            enemy.projectileFrameId = first.frameId;
            enemy.projectileOriginLocalX = first.originLocalX;
            enemy.projectileOriginLocalY = first.originLocalY;
            enemy.hasProjectileOriginLocal = first.hasOriginLocal === true;
            enemy.projectileRigScale = Math.max(0.0001, first.rigScale);
        }
    }
    return true;
}

export function applyCharacterCombatProfiles(state, profiles) {
    const profileMap = profiles instanceof Map
        ? profiles
        : new Map(Object.entries(profiles && typeof profiles === "object" ? profiles : {}));
    state.characterCombatProfiles = Object.fromEntries(
        [...profileMap.entries()].map(([characterId, profile]) => [String(characterId), deepClone(profile)])
    );
    let applied = 0;
    for (const enemy of state.enemies || []) {
        if (applyCharacterCombatProfileToEnemy(state, enemy)) applied += 1;
    }
    if (applied > 0) {
        syncEnemyTuningHealthScales(state);
        addEvent(state, "CHARACTER_COMBAT_PROFILES_APPLIED", { enemies: applied });
    }
    return applied;
}

export function applyLootCatalog(state, catalog) {
    state.lootCatalog = normalizeLootCatalog(catalog);
    return Object.keys(state.lootCatalog.items).length;
}

export function applyCharacterDropProfiles(state, profiles) {
    const profileMap = profiles instanceof Map
        ? profiles
        : new Map(Object.entries(profiles && typeof profiles === "object" ? profiles : {}));
    state.characterDropProfiles = Object.fromEntries(
        [...profileMap.entries()].map(([characterId, profile]) => [String(characterId), deepClone(profile)])
    );
    let applied = 0;
    for (const enemy of state.enemies || []) {
        const profile = state.characterDropProfiles[enemy.characterId];
        if (!profile) continue;
        enemy.dropTable = (enemy.usesBossDropTable
            ? (Array.isArray(enemy.bossDropTable) ? enemy.bossDropTable : [])
            : (Array.isArray(profile.drops) ? profile.drops : [])
        ).map((entry) => ({ ...entry }));
        applied += 1;
    }
    if (applied > 0) addEvent(state, "CHARACTER_DROP_PROFILES_APPLIED", { enemies: applied });
    return applied;
}

function estimateEditorLevelBounds(visuals, playerStart, entities) {
    const points = [];
    for (const visual of visuals) {
        points.push({ x: visual.x, y: visual.y });
        points.push({ x: visual.x + visual.w, y: visual.y + visual.h });
    }
    if (playerStart) points.push({ x: Number(playerStart.x) || 0, y: Number(playerStart.y) || 0 });
    for (const entity of entities) points.push({ x: Number(entity.x) || 0, y: Number(entity.y) || 0 });
    if (!points.length) return { x: -320, y: -460, w: 5200, h: 1500 };
    const minX = Math.min(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y));
    const maxX = Math.max(...points.map((point) => point.x));
    const maxY = Math.max(...points.map((point) => point.y));
    return {
        x: Math.floor(minX - 520),
        y: Math.floor(minY - 520),
        w: Math.ceil(maxX - minX + 1040),
        h: Math.ceil(maxY - minY + 1040)
    };
}


export function cloneGameState(state) {
    return deepClone(state);
}

export function serializeGameState(state) {
    return JSON.stringify(state);
}

export function restoreGameState(serialized) {
    return JSON.parse(serialized);
}

export function addEvent(state, type, detail = {}) {
    const event = {
        tick: state.clock.tick,
        time: Number(state.clock.time.toFixed(4)),
        type,
        ...deepClone(detail)
    };
    state.debug.lastEvents.push(event);
    while (state.debug.lastEvents.length > state.tuning.maxDebugEvents) {
        state.debug.lastEvents.shift();
    }
    return event;
}

export function getPlayerRect(state) {
    const p = state.player;
    return {
        x: p.currentTransform.x - p.width / 2,
        y: p.currentTransform.y - p.height,
        w: p.width,
        h: p.height
    };
}

function rectsOverlap(a, b) {
    return a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y;
}

function approach(value, target, amount) {
    if (value < target) {
        return Math.min(value + amount, target);
    }
    if (value > target) {
        return Math.max(value - amount, target);
    }
    return target;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function finiteNumberOr(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function stableStringHash(value) {
    let hash = 2166136261 >>> 0;
    for (const character of String(value || "")) {
        hash ^= character.charCodeAt(0);
        hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash >>> 0;
}

function mixedUint32(value) {
    let x = value >>> 0;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d) >>> 0;
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b) >>> 0;
    x ^= x >>> 16;
    return x >>> 0;
}

function deterministicEnemyUnit(identity, salt) {
    return mixedUint32(stableStringHash(`${salt}|${identity}`)) / 4294967296;
}

function deterministicEnemyIdentity(state, entity, enemyId, characterId, x, y) {
    const hasAuthoredId = String(entity.id || "").trim().length > 0;
    const fallbackPosition = hasAuthoredId ? "" : `|${Math.round(x * 1000)}|${Math.round(y * 1000)}`;
    return [
        String(state?.world?.levelId || ""),
        String(enemyId || ""),
        String(entity.enemyCatalogId || entity.enemyDefinitionId || ""),
        String(characterId || "")
    ].join("|") + fallbackPosition;
}

function resolveLoopAnimationVariant(state, entity, enemyId, characterId, x, y) {
    const phaseVariation = clamp(Math.abs(finiteNumberOr(entity.loopAnimationPhaseVariation, 0)), 0, 1);
    const periodVariation = clamp(Math.abs(finiteNumberOr(entity.loopAnimationPeriodVariation, 0)), 0, 0.95);
    const identity = deterministicEnemyIdentity(state, entity, enemyId, characterId, x, y);
    const explicitPhase = Number(entity.loopAnimationPhaseOffsetCycles);
    const explicitPeriod = Number(entity.loopAnimationPeriodScale);
    const phaseOffsetCycles = Number.isFinite(explicitPhase)
        ? explicitPhase
        : phaseVariation > 0
            ? (deterministicEnemyUnit(identity, "loop-animation-phase") * 2 - 1) * phaseVariation
            : 0;
    const periodScale = Number.isFinite(explicitPeriod) && explicitPeriod > 0
        ? explicitPeriod
        : periodVariation > 0
            ? Math.max(0.05, 1 + (deterministicEnemyUnit(identity, "loop-animation-period") * 2 - 1) * periodVariation)
            : 1;
    return {
        phaseVariation,
        periodVariation,
        phaseOffsetCycles,
        periodScale
    };
}

function resolveBomberMeanderVariant(state, entity, enemyId, characterId, x, y) {
    const identity = deterministicEnemyIdentity(state, entity, enemyId, characterId, x, y);
    return {
        phaseX: finiteNumberOr(entity.bomberMeanderPhaseX, deterministicEnemyUnit(identity, "bomber-meander-phase-x") * Math.PI * 2),
        phaseY: finiteNumberOr(entity.bomberMeanderPhaseY, deterministicEnemyUnit(identity, "bomber-meander-phase-y") * Math.PI * 2),
        rateScale: Math.max(0.2, finiteNumberOr(entity.bomberMeanderRateScale, 0.82 + deterministicEnemyUnit(identity, "bomber-meander-rate") * 0.36)),
        amplitudeScale: Math.max(0, finiteNumberOr(entity.bomberMeanderAmplitudeScale, 0.85 + deterministicEnemyUnit(identity, "bomber-meander-amplitude") * 0.30)),
        biasX: clamp(finiteNumberOr(entity.bomberMeanderBiasX, deterministicEnemyUnit(identity, "bomber-meander-bias-x") * 2 - 1), -1, 1),
        biasY: clamp(finiteNumberOr(entity.bomberMeanderBiasY, deterministicEnemyUnit(identity, "bomber-meander-bias-y") * 2 - 1), -1, 1)
    };
}

function ensureRandomState(state) {
    if (!state.random || typeof state.random !== "object") {
        state.random = { seed: 0x1a2b3c4d, levelLoadCount: 0 };
    }
    state.random.seed = (Math.floor(Number(state.random.seed)) >>> 0) || 0x1a2b3c4d;
    state.random.levelLoadCount = Math.max(0, Math.floor(Number(state.random.levelLoadCount) || 0));
    return state.random;
}

function autoSpawnRandomUnit(state, rollCount, channel) {
    const random = ensureRandomState(state);
    const salt = stableStringHash([
        "auto-spawn-enemy",
        state.world?.levelId || "level",
        random.levelLoadCount,
        Math.max(0, Math.floor(Number(rollCount) || 0)),
        String(channel || "roll")
    ].join(":"));
    return mixedUint32(random.seed ^ salt) / 4294967296;
}

function enemySpawnerRandomUnit(state, spawnerId, rollCount, channel) {
    const random = ensureRandomState(state);
    const salt = stableStringHash([
        "enemy-spawner",
        state.world?.levelId || "level",
        random.levelLoadCount,
        String(spawnerId || "enemySpawner"),
        Math.max(0, Math.floor(Number(rollCount) || 0)),
        String(channel || "roll")
    ].join(":"));
    return mixedUint32(random.seed ^ salt) / 4294967296;
}

function cameraVisibleWorldRect(state) {
    const camera = state.camera || {};
    const width = Math.max(1, Number(camera.viewportWidth) || 1280);
    const height = Math.max(1, Number(camera.viewportHeight) || 720);
    return {
        x: (Number(camera.currentTransform.x) || Number(state.player?.currentTransform.x) || 0) - width * 0.5,
        y: (Number(camera.currentTransform.y) || Number(state.player?.currentTransform.y) || 0) - height * 0.56,
        w: width,
        h: height
    };
}

function enemySpawnerOnScreen(state, spawner) {
    const width = Math.max(1, Number(spawner?.width) || 64);
    const height = Math.max(1, Number(spawner?.height) || 64);
    return rectsOverlap(cameraVisibleWorldRect(state), {
        x: (Number(spawner?.x) || 0) - width * 0.5,
        y: (Number(spawner?.y) || 0) - height,
        w: width,
        h: height
    });
}

function expectedAutoSpawnDirection(state) {
    const playerX = Number(state.player?.currentTransform.x) || 0;
    const entities = state.world?.entities || [];
    const exitDoor = wizardExitPortalEntity(entities);
    const exitDx = Number(exitDoor?.x) - playerX;
    if (Number.isFinite(exitDx) && Math.abs(exitDx) > 1) return exitDx < 0 ? -1 : 1;
    const entryDoor = wizardEntryPortalEntity(entities);
    const authoredRouteDx = Number(exitDoor?.x) - Number(entryDoor?.x);
    if (Number.isFinite(authoredRouteDx) && Math.abs(authoredRouteDx) > 1) return authoredRouteDx < 0 ? -1 : 1;
    return 1;
}

function autoSpawnBand(state, direction, enemyWidth, distanceUnit) {
    const camera = state.camera || {};
    const zoom = Math.max(0.1, Number(camera.zoom) || 1);
    const viewportWidth = Math.max(320, Number(camera.viewportWidth) || 1280 / zoom);
    const halfWidth = viewportWidth * 0.5;
    const edgeX = (Number(camera.currentTransform.x) || Number(state.player?.currentTransform.x) || 0) + direction * halfWidth;
    const bodyInset = Math.max(4, Math.max(1, Number(enemyWidth) || 1) * 0.52);
    const nearDistance = viewportWidth * 0.1;
    const farDistance = viewportWidth;
    const nearCenterDistance = nearDistance + bodyInset;
    const farCenterDistance = farDistance + bodyInset;
    const bandA = edgeX + direction * nearCenterDistance;
    const bandB = edgeX + direction * farCenterDistance;
    const minX = Math.min(bandA, bandB);
    const maxX = Math.max(bandA, bandB);
    const desiredDistance = nearCenterDistance + (farCenterDistance - nearCenterDistance) * clamp(Number(distanceUnit) || 0, 0, 1);
    const desiredX = edgeX + direction * desiredDistance;
    return { viewportWidth, edgeX, minX, maxX, desiredX, bodyInset };
}

function autoSpawnGroundPosition(state, enemy, band) {
    const supports = buildEnemyNavigationSupports(state.world, characterEnemyNavigationOptions(enemy, state));
    let best = null;
    for (const support of supports) {
        const minX = Math.max(Number(support.xMin) + band.bodyInset, band.minX);
        const maxX = Math.min(Number(support.xMax) - band.bodyInset, band.maxX);
        if (!Number.isFinite(minX) || !Number.isFinite(maxX) || minX > maxX) continue;
        const x = clamp(band.desiredX, minX, maxX);
        const point = supportPoint(support, x, 0);
        if (!point || !Number.isFinite(point.y)) continue;
        const slopeDx = Number(support.x2) - Number(support.x1);
        const slope = Math.abs(slopeDx) > 0.001
            ? (Number(support.y2) - Number(support.y1)) / slopeDx
            : 0;
        if (characterEnemyBodyBlockedAt(state, enemy, x, point.y, {
            ignoreSupportId: support.id,
            groundSlope: slope
        })) continue;
        const overlapsEnemy = (state.enemies || []).some((other) =>
            Number(other?.health) > 0 &&
            Math.abs((Number(other.x) || 0) - x) < (Math.max(1, Number(other.width) || 1) + enemy.width) * 0.5 + 24 &&
            Math.abs((Number(other.y) || 0) - point.y) < Math.max(enemy.height, Number(other.height) || 1)
        );
        if (overlapsEnemy) continue;
        const score = Math.abs(x - band.desiredX) + Math.abs(point.y - (Number(state.player?.currentTransform.y) || point.y)) * 0.08;
        if (!best || score < best.score) best = { x, y: point.y, support, score };
    }
    return best;
}

function autoSpawnFlyingPosition(state, enemy, band, verticalUnit) {
    const bounds = state.world?.bounds || { x: -100000, y: -100000, w: 200000, h: 200000 };
    const halfWidth = enemy.width * 0.5;
    const minX = Math.max(band.minX, Number(bounds.x) + halfWidth);
    const maxX = Math.min(band.maxX, Number(bounds.x) + Number(bounds.w) - halfWidth);
    if (!Number.isFinite(minX) || !Number.isFinite(maxX) || minX > maxX) return null;
    const x = clamp(band.desiredX, minX, maxX);
    const camera = state.camera || {};
    const zoom = Math.max(0.1, Number(camera.zoom) || 1);
    const viewportHeight = Math.max(240, Number(camera.viewportHeight) || 720 / zoom);
    const top = (Number(camera.currentTransform.y) || Number(state.player?.currentTransform.y) || 0) - viewportHeight * 0.5;
    const bottom = top + viewportHeight;
    const y = clamp(
        top + viewportHeight * (0.25 + clamp(Number(verticalUnit) || 0, 0, 1) * 0.42),
        Number(bounds.y) + enemy.height + 12,
        Number(bounds.y) + Number(bounds.h) - 12
    );
    if (y < top - enemy.height || y > bottom + enemy.height) return null;
    return { x, y, support: null };
}

function autoSpawnTargetForEnemy(enemy) {
    return {
        id: `${enemy.id}_target`,
        kind: "enemyBullseye",
        enemyId: enemy.id,
        x: enemy.targetX,
        y: enemy.targetY,
        radius: enemy.targetRadius,
        state: enemy.health > 0 ? "active" : "inactive",
        showMarker: enemy.showTargetMarker
    };
}

function activateSpawnedEnemy(state, enemy, position, { flash = false } = {}) {
    const flying = String(enemy.locomotion || "").trim().toLowerCase() === "flying";
    enemy.currentTransform.x = position.x;
    enemy.currentTransform.y = position.y;
    enemy.spawnX = position.x;
    enemy.spawnY = position.y;
    enemy.targetX = enemy.currentTransform.x - enemy.width * 0.5 + enemy.targetAnchorX * enemy.width;
    enemy.targetY = enemy.currentTransform.y - enemy.height + enemy.targetAnchorY * enemy.height;
    enemy.facing = (Number(state.player?.currentTransform.x) || 0) < enemy.currentTransform.x ? -1 : 1;
    enemy.awarenessTimer = Math.max(2, Number(enemy.awarenessHoldDuration) || 0);
    enemy.alerted = true;
    enemy.engaged = true;
    enemy.lastSeenPlayerX = Number(state.player?.currentTransform.x) || 0;
    enemy.lastSeenPlayerY = Number(state.player?.currentTransform.y) || 0;
    enemy.lastSeenAt = Number(state.clock?.time) || 0;
    enemy.routeRepathTimer = 0;
    if (flying) {
        enemy.bomberPerchX = position.x;
        enemy.bomberPerchY = position.y;
        enemy.flightBaseY = position.y;
        enemy.aiState = enemy.strategy === "bomber" ? "bomber" : "fly";
        enemy.movementPhase = "noticed_player";
    } else {
        enemy.strategy = "hunter";
        enemy.aiState = "pursue";
        enemy.movementPhase = "pursue";
        enemy.supportId = position.support?.id || null;
        enemy.currentSupportId = position.support?.id || null;
        enemy.homeSupportId = position.support?.id || null;
        enemy.airborne = false;
    }
    if (flash) enemy.hitFlashTimer = Math.max(Number(enemy.hitFlashTimer) || 0, 0.24);
    applyCharacterCombatProfileToEnemy(state, enemy);
    state.enemies = Array.isArray(state.enemies) ? state.enemies : [];
    state.enemies.push(enemy);
    state.targets.push(autoSpawnTargetForEnemy(enemy));
    return enemy;
}

function spawnPositionOverlapsActor(state, enemy, x, y) {
    const rect = {
        x: x - enemy.width * 0.5,
        y: y - enemy.height,
        w: enemy.width,
        h: enemy.height
    };
    if (rectsOverlap(rect, getPlayerRect(state))) return true;
    return (state.enemies || []).some((other) => {
        if (!other || Number(other.health) <= 0) return false;
        const width = Math.max(1, Number(other.width) || 1);
        const height = Math.max(1, Number(other.height) || 1);
        return rectsOverlap(rect, {
            x: (Number(other.x) || 0) - width * 0.5,
            y: (Number(other.y) || 0) - height,
            w: width,
            h: height
        });
    });
}

function emitEnemySpawnerFlash(state, enemy) {
    const centerX = Number(enemy.currentTransform.x) || 0;
    const centerY = (Number(enemy.currentTransform.y) || 0) - Math.max(16, Number(enemy.height) || 80) * 0.48;
    const baseRadius = Math.max(22, Math.min(54, Math.max(Number(enemy.width) || 0, Number(enemy.height) || 0) * 0.34));
    addSmokePuff(state, {
        kind: "enemyTeleportFlash",
        x: centerX,
        y: centerY,
        lifetime: 0.36,
        radius: baseRadius,
        colorIndex: 0
    });
    const particleScale = renderingParticleScale(state.settings);
    const count = Math.max(6, Math.round(10 * particleScale));
    for (let index = 0; index < count; index += 1) {
        const angle = Math.PI * 2 * index / count + enemySpawnerRandomUnit(state, enemy.id, index + 1, "flash-angle") * 0.34;
        const speed = 80 + enemySpawnerRandomUnit(state, enemy.id, index + 1, "flash-speed") * 95;
        addSmokePuff(state, {
            kind: "enemyTeleportSpark",
            x: centerX + Math.cos(angle) * baseRadius * 0.16,
            y: centerY + Math.sin(angle) * baseRadius * 0.16,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 18,
            lifetime: 0.28 + enemySpawnerRandomUnit(state, enemy.id, index + 1, "flash-life") * 0.16,
            radius: 2.2 + (index % 3) * 0.65,
            colorIndex: index % 3,
            rotation: angle,
            spin: (index % 2 ? 1 : -1) * 8
        });
    }
}

function spawnAutomaticEnemy(state, runtimeConfig) {
    const selection = resolveAutoSpawnEnemyIds(runtimeConfig, state.enemyCatalog);
    runtimeConfig.lastResolvedEnemyIds = selection.resolvedIds.slice();
    if (!selection.valid || !selection.resolvedIds.length) {
        runtimeConfig.lastError = selection.valid ? "The configured enemy pool resolves to no available enemies." : selection.errors.join(" ");
        return null;
    }
    runtimeConfig.lastError = null;
    const rollCount = Math.max(1, Math.floor(Number(runtimeConfig.rollCount) || 1));
    const selectedIndex = Math.min(
        selection.resolvedIds.length - 1,
        Math.floor(autoSpawnRandomUnit(state, rollCount, "enemy") * selection.resolvedIds.length)
    );
    const enemyDefinitionId = selection.resolvedIds[selectedIndex];
    const spawnIndex = Math.max(0, Math.floor(Number(runtimeConfig.spawnCount) || 0)) + 1;
    const id = `auto_spawn_enemy_${String(spawnIndex).padStart(4, "0")}`;
    const preliminaryEntity = enemyEntityFromDefinition(state.enemyCatalog, enemyDefinitionId, {
        id,
        x: Number(state.player?.currentTransform.x) || 0,
        y: Number(state.player?.currentTransform.y) || 0,
        autoSpawned: true,
        enemyDefinitionId
    });
    if (!preliminaryEntity) return null;
    const flying = String(preliminaryEntity.locomotion || "").trim().toLowerCase() === "flying";
    preliminaryEntity.strategy = flying
        ? String(preliminaryEntity.strategy || "bomber")
        : "hunter";
    const enemy = createCharacterEnemyRuntime(state, preliminaryEntity, (state.enemies || []).length);
    const direction = expectedAutoSpawnDirection(state);
    const band = autoSpawnBand(
        state,
        direction,
        enemy.width,
        autoSpawnRandomUnit(state, rollCount, "distance")
    );
    const position = flying
        ? autoSpawnFlyingPosition(state, enemy, band, autoSpawnRandomUnit(state, rollCount, "vertical"))
        : autoSpawnGroundPosition(state, enemy, band);
    if (!position) {
        runtimeConfig.lastError = "No safe off-screen spawn position exists in the forward route band.";
        return null;
    }

    activateSpawnedEnemy(state, enemy, position);
    runtimeConfig.spawnCount = spawnIndex;
    addEvent(state, "AUTO_ENEMY_SPAWNED", {
        enemyId: enemy.id,
        enemyDefinitionId,
        direction,
        x: round(enemy.currentTransform.x),
        y: round(enemy.currentTransform.y),
        distanceBeyondScreen: round(Math.max(0, Math.abs(enemy.currentTransform.x - band.edgeX) - enemy.width * 0.5))
    });
    return enemy;
}

function enemySpawnerGroundPosition(state, enemy, spawner) {
    const snapDistance = Math.max(24, Number(spawner.groundSnapDistance) || Number(enemy.groundSnapDistance) || 96);
    const support = findCharacterEnemyGroundSupport(
        state,
        Number(spawner.x) || 0,
        Number(spawner.y) || 0,
        snapDistance,
        snapDistance,
        enemy.width
    );
    if (!support) return null;
    const x = Number(spawner.x) || 0;
    const y = support.y;
    if (characterEnemyBodyBlockedAt(state, enemy, x, y, {
        ignoreSupportId: support.id,
        groundSlope: Number(support.slope) || 0
    })) return null;
    if (spawnPositionOverlapsActor(state, enemy, x, y)) return null;
    return { x, y, support };
}

function enemySpawnerFlyingPosition(state, enemy, spawner) {
    const x = Number(spawner.x) || 0;
    const y = Number(spawner.y) || 0;
    const bounds = state.world?.bounds;
    if (bounds) {
        const halfWidth = enemy.width * 0.5;
        if (x - halfWidth < Number(bounds.x) || x + halfWidth > Number(bounds.x) + Number(bounds.w)) return null;
        if (y - enemy.height < Number(bounds.y) || y > Number(bounds.y) + Number(bounds.h)) return null;
    }
    if (characterEnemyBodyBlockedAt(state, enemy, x, y)) return null;
    if (spawnPositionOverlapsActor(state, enemy, x, y)) return null;
    return { x, y, support: null };
}

function spawnEnemyFromSpawner(state, spawner) {
    const selection = resolveAutoSpawnEnemyIds(spawner, state.enemyCatalog);
    spawner.lastResolvedEnemyIds = selection.resolvedIds.slice();
    if (!selection.valid || !selection.resolvedIds.length) {
        spawner.lastError = selection.valid ? "The configured enemy pool resolves to no available enemies." : selection.errors.join(" ");
        return null;
    }
    spawner.lastError = null;
    const rollCount = Math.max(1, Math.floor(Number(spawner.rollCount) || 1));
    const selectedIndex = Math.min(
        selection.resolvedIds.length - 1,
        Math.floor(enemySpawnerRandomUnit(state, spawner.id, rollCount, "enemy") * selection.resolvedIds.length)
    );
    const enemyDefinitionId = selection.resolvedIds[selectedIndex];
    const spawnIndex = Math.max(0, Math.floor(Number(spawner.spawnCount) || 0)) + 1;
    const safeSpawnerId = String(spawner.id || "enemy_spawner").replace(/[^a-z0-9_]+/gi, "_");
    const id = `${safeSpawnerId}_enemy_${String(spawnIndex).padStart(4, "0")}`;
    const preliminaryEntity = enemyEntityFromDefinition(state.enemyCatalog, enemyDefinitionId, {
        id,
        x: Number(spawner.x) || 0,
        y: Number(spawner.y) || 0,
        autoSpawned: true,
        enemySpawnerId: spawner.id,
        enemyDefinitionId
    });
    if (!preliminaryEntity) return null;
    const flying = String(preliminaryEntity.locomotion || "").trim().toLowerCase() === "flying";
    preliminaryEntity.strategy = flying
        ? String(preliminaryEntity.strategy || "bomber")
        : "hunter";
    const enemy = createCharacterEnemyRuntime(state, preliminaryEntity, (state.enemies || []).length);
    const position = flying
        ? enemySpawnerFlyingPosition(state, enemy, spawner)
        : enemySpawnerGroundPosition(state, enemy, spawner);
    if (!position) {
        spawner.lastError = "The spawner position is blocked, occupied, or has no suitable ground for the selected enemy.";
        return null;
    }

    activateSpawnedEnemy(state, enemy, position, { flash: true });
    emitEnemySpawnerFlash(state, enemy);
    spawner.spawnCount = spawnIndex;
    addEvent(state, "ENEMY_SPAWNER_SPAWNED", {
        spawnerId: spawner.id,
        enemyId: enemy.id,
        enemyDefinitionId,
        x: round(enemy.currentTransform.x),
        y: round(enemy.currentTransform.y)
    });
    return enemy;
}

function updateEnemySpawners(state, dt) {
    for (const spawner of state.world?.enemySpawners || []) {
        const interval = Math.max(FIXED_DT, Number(spawner.intervalSeconds) || 1);
        const disabled = spawner.disableSignalChannel
            ? signalChannelRecord(state, spawner.disableSignalChannel, false)?.active === true
            : false;
        if (disabled) {
            spawner.onScreen = false;
            spawner.timer = interval;
            continue;
        }
        const onScreen = enemySpawnerOnScreen(state, spawner);
        spawner.onScreen = onScreen;
        if (!onScreen || Number(spawner.probabilityPercent) <= 0) {
            // Off-screen spawners are completely dormant. They do not accumulate
            // elapsed time and therefore cannot fire immediately when scrolled into view.
            spawner.timer = interval;
            continue;
        }
        spawner.timer = Math.max(-interval * 4, (Number(spawner.timer) || interval) - Math.max(0, Number(dt) || 0));
        let safety = 0;
        while (spawner.timer <= 0 && safety < 4) {
            spawner.timer += interval;
            spawner.rollCount = Math.max(0, Math.floor(Number(spawner.rollCount) || 0)) + 1;
            const chance = clamp(Number(spawner.probabilityPercent) || 0, 0, 100) / 100;
            if (enemySpawnerRandomUnit(state, spawner.id, spawner.rollCount, "chance") < chance) {
                spawnEnemyFromSpawner(state, spawner);
            }
            safety += 1;
        }
    }
}

function updateAutomaticEnemySpawning(state, dt) {
    const runtimeConfig = state.world?.autoSpawnEnemies;
    if (!runtimeConfig || runtimeConfig.enabled !== true || Number(runtimeConfig.probabilityPercent) <= 0) {
        if (runtimeConfig) runtimeConfig.timer = Math.max(FIXED_DT, Number(runtimeConfig.intervalSeconds) || 1);
        return;
    }
    const interval = Math.max(FIXED_DT, Number(runtimeConfig.intervalSeconds) || 1);
    runtimeConfig.timer = Math.max(-interval * 4, (Number(runtimeConfig.timer) || interval) - Math.max(0, Number(dt) || 0));
    let safety = 0;
    while (runtimeConfig.timer <= 0 && safety < 4) {
        runtimeConfig.timer += interval;
        runtimeConfig.rollCount = Math.max(0, Math.floor(Number(runtimeConfig.rollCount) || 0)) + 1;
        const chance = clamp(Number(runtimeConfig.probabilityPercent) || 0, 0, 100) / 100;
        if (autoSpawnRandomUnit(state, runtimeConfig.rollCount, "chance") < chance) {
            spawnAutomaticEnemy(state, runtimeConfig);
        }
        safety += 1;
    }
}

function pruneFinishedAutomaticEnemies(state) {
    const removedIds = new Set((state.enemies || [])
        .filter((enemy) => enemy?.autoSpawned === true
            && Number(enemy.health) <= 0
            && Number(enemy.currentTransform.alpha) <= 0
            && !groundCharacterEnemyHasPendingCorpseDrop(enemy))
        .map((enemy) => enemy.id));
    if (!removedIds.size) return;
    state.enemies = (state.enemies || []).filter((enemy) => !removedIds.has(enemy.id));
    state.targets = (state.targets || []).filter((target) => !removedIds.has(target.enemyId));
}

function sanitizeInput(inputFrame) {
    return createInputFrame(inputFrame || {});
}

function isCharacterEnemyState(enemy) {
    return enemy?.kind === "characterEnemy";
}

function snapCharacterEnemiesToNearbyGround(state) {
    const snapped = [];
    const sourceEntities = state.world?.entities || [];
    for (const enemy of state.enemies || []) {
        if (!isCharacterEnemyState(enemy) || enemy.locomotion === "flying") {
            continue;
        }
        const support = findCharacterEnemyGroundSupport(
            state,
            enemy.currentTransform.x,
            enemy.currentTransform.y,
            enemy.groundSnapDistance,
            enemy.groundSnapDistance,
            enemy.width,
            { bodyHeight: enemy.height }
        );
        if (!support) {
            continue;
        }
        const fromY = enemy.currentTransform.y;
        enemy.currentTransform.y = support.y;
        enemy.spawnY = support.y;
        setCharacterEnemyGroundSupportIdentity(state, enemy, support);
        syncCharacterEnemyTarget(state, enemy);
        const source = sourceEntities.find((entity) => entity.id === enemy.id);
        if (source) {
            source.y = support.y;
        }
        snapped.push({
            enemyId: enemy.id,
            fromY,
            y: support.y,
            delta: support.y - fromY,
            supportId: support.id
        });
    }
    return snapped;
}

function detachPlayerFromMovingPlatformSupport(state) {
    const player = state?.player;
    if (!player || !movingPlatformForCollisionId(state, player.supportId)) return false;
    player.supportId = null;
    player.onGround = false;
    player.wasOnGround = false;
    player.groundStride = null;
    return true;
}

function movingPlatformForCollisionId(state, collisionId) {
    if (!collisionId) return null;
    return (state.world?.movingPlatforms || []).find((platform) => movingPlatformOwnsCollisionId(platform, collisionId)) || null;
}

function setCharacterEnemyGroundSupportIdentity(state, enemy, support) {
    enemy.supportId = support?.id || null;
    enemy.ridingPlatformId = movingPlatformForCollisionId(state, enemy.supportId)?.id || null;
}


function groundSupportHasBodyClearance(state, x, groundY, width, bodyHeight, groundSlope = 0, supportId = null) {
    const safeHeight = Math.max(0, Number(bodyHeight) || 0);
    if (safeHeight <= 0) return true;
    const bodyWidth = Math.max(8, Math.max(0, Number(width) || 0) * 0.58);
    const baseFootClearance = Math.max(8, Math.min(18, safeHeight * 0.12));
    const slopeClearance = Math.min(safeHeight * 0.35, bodyWidth * 0.5 * Math.abs(Number(groundSlope) || 0));
    const footClearance = baseFootClearance + slopeClearance;
    const headClearance = Math.max(2, Math.min(10, safeHeight * 0.04));
    const probeTop = groundY - safeHeight + headClearance;
    const probeBottom = groundY - footClearance;
    if (probeBottom <= probeTop) return true;
    const query = { x: x - bodyWidth * 0.5, y: probeTop, w: bodyWidth, h: probeBottom - probeTop };
    for (const solid of queryWorldSolids(state.world, query)) {
        if (rectsOverlap(query, solid)) return false;
    }
    for (const polygon of queryWorldCollisionPolygons(state.world, query)) {
        if (!isAreaBlockingSegmentKind(polygon.kind) || !Array.isArray(polygon.points) || polygon.points.length < 3) continue;
        if (polygonOverlapsRect(polygon, query)) return false;
    }
    for (const segment of queryWorldSegments(state.world, query)) {
        if (segment.id === supportId || !isAreaBlockingSegmentKind(segment.kind)) continue;
        if (segmentRectIntersection(
            { x: segment.x1, y: segment.y1 },
            { x: segment.x2, y: segment.y2 },
            query
        )) return false;
    }
    return true;
}

function findCharacterEnemyGroundSupport(state, x, referenceY, maxStepUp, maxDrop, width = 1, options = {}) {
    const samples = [x, x - Math.max(0, width) * 0.24, x + Math.max(0, width) * 0.24];
    let best = null;
    const consider = (y, id, kind, sampleIndex, slope = 0) => {
        if (!Number.isFinite(y)) {
            return;
        }
        const delta = y - referenceY;
        if (delta < -Math.max(0, maxStepUp) || delta > Math.max(0, maxDrop)) {
            return;
        }
        const score = options.preferHighest && delta <= 0
            ? delta + sampleIndex * 0.0001
            : sampleIndex * 100000 + Math.abs(delta);
        if (!groundSupportHasBodyClearance(state, x, y, width, options.bodyHeight, slope, id)) {
            return;
        }
        if (!best || score < best.score) {
            best = { y, delta, id, kind, slope: finiteNumberOr(slope, 0), score };
        }
    };

    const supportQueryBounds = {
        minX: Math.min(...samples) - 2,
        minY: referenceY - Math.max(0, maxStepUp) - 2,
        maxX: Math.max(...samples) + 2,
        maxY: referenceY + Math.max(0, maxDrop) + 2
    };
    for (const segment of queryWorldSegments(state.world, supportQueryBounds)) {
        if (!isSolidSegmentKind(segment.kind)) {
            continue;
        }
        if (Math.abs(Number(segment.x2) - Number(segment.x1)) < 0.001) {
            continue;
        }
        const dx = Number(segment.x2) - Number(segment.x1);
        const dy = Number(segment.y2) - Number(segment.y1);
        if (segment.kind !== "walkable" && Math.abs(dy) > Math.abs(dx) * PLAYER_STANDABLE_SLOPE_RATIO) {
            continue;
        }
        const slope = Math.abs(dx) > 0.001 ? dy / dx : 0;
        for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
            const y = segmentYAtX(segment, samples[sampleIndex]);
            if (y !== null) {
                consider(y, segment.id || "segment", segment.kind, sampleIndex, slope);
            }
        }
    }

    for (const solid of queryWorldSolids(state.world, supportQueryBounds)) {
        for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
            const sampleX = samples[sampleIndex];
            if (sampleX < solid.x - 0.001 || sampleX > solid.x + solid.w + 0.001) {
                continue;
            }
            consider(solid.y, solid.id || "solid", solid.kind || "solid", sampleIndex, 0);
        }
    }

    return best;
}

function setCharacterEnemyAnimation(enemy, slot) {
    const normalized = String(slot || "idle");
    if (enemy.animationSlot !== normalized) {
        enemy.animationSlot = normalized;
        enemy.state = normalized;
        enemy.animationClock.current = 0;
        snapPresentationAnimationClock(enemy, "animationSlotChanged", `enemy:${enemy.id || "unknown"}`);
    }
}

function syncCharacterEnemyTarget(state, enemy) {
    const anchorX = clamp(Number(enemy.targetAnchorX ?? 0.5), 0, 1);
    const anchorY = clamp(Number(enemy.targetAnchorY ?? 0.42), 0, 1);
    enemy.targetX = enemy.currentTransform.x - enemy.width * 0.5 + anchorX * enemy.width;
    enemy.targetY = enemy.currentTransform.y - enemy.height + anchorY * enemy.height;
    const target = (state.targets || []).find((item) => item.enemyId === enemy.id);
    if (target) {
        target.x = enemy.targetX;
        target.y = enemy.targetY;
        target.radius = enemy.targetRadius;
        target.state = enemy.health > 0 ? "active" : "inactive";
    }
}

function characterEnemyBodyBlockedAt(state, enemy, x, groundY, options = {}) {
    const bodyWidth = Math.max(8, enemy.width * 0.58);
    const baseFootClearance = Math.max(8, Math.min(18, enemy.height * 0.12));
    // Ground movement represents the actor by an upright body rectangle while its
    // feet follow a sloped support. On a sufficiently steep downhill segment, the
    // uphill half of that same support can otherwise intrude into the probe and be
    // mistaken for a wall. Raise only the occupancy probe's lower edge by the
    // terrain rise across half the probe width; the actor position and shared swept
    // airborne collision geometry remain unchanged.
    const groundSlope = Math.abs(finiteNumberOr(options.groundSlope, 0));
    const slopeClearance = Math.min(enemy.height * 0.35, bodyWidth * 0.5 * groundSlope);
    const footClearance = baseFootClearance + slopeClearance;
    const headClearance = Math.max(2, Math.min(10, enemy.height * 0.04));
    const rect = {
        x: x - bodyWidth * 0.5,
        y: groundY - enemy.height + headClearance,
        w: bodyWidth,
        h: Math.max(1, enemy.height - headClearance - footClearance)
    };

    for (const solid of queryWorldSolids(state.world, rect)) {
        if (options.ignoreObstacleId && solid.id === options.ignoreObstacleId) {
            continue;
        }
        if (rectsOverlap(rect, solid)) {
            return true;
        }
    }
    for (const polygon of queryWorldCollisionPolygons(state.world, rect)) {
        if (options.ignoreObstacleId && polygon.id === options.ignoreObstacleId) {
            continue;
        }
        if ((isAreaBlockingSegmentKind(polygon.kind) || polygon.kind === "water") && polygonOverlapsRect(polygon, rect)) {
            return true;
        }
    }
    for (const segment of queryWorldSegments(state.world, rect)) {
        if (options.ignoreSupportId && (segment.id === options.ignoreSupportId || options.ignoreSupportId.startsWith(`${segment.id}_nav_`))) {
            continue;
        }
        // A green walkable line is a one-way floor: it supports feet from
        // above but must never become a horizontal wall through an actor's
        // torso while the actor walks underneath it.
        if (!isAreaBlockingSegmentKind(segment.kind)) {
            continue;
        }
        if (segmentRectIntersection(
            { x: segment.x1, y: segment.y1 },
            { x: segment.x2, y: segment.y2 },
            rect
        )) {
            return true;
        }
    }
    return false;
}

function pauseAndTurnCharacterEnemy(enemy) {
    enemy.facing *= -1;
    enemy.groundVelocityX = 0;
    enemy.movementPhase = "idle";
    enemy.phaseTimer = Math.max(0, enemy.turnPause);
    setCharacterEnemyAnimation(enemy, "idle");
}

function characterEnemyAttackSegmentBlockedByTerrain(state, start, end) {
    const terrainQueryBounds = {
        minX: Math.min(start.x, end.x),
        minY: Math.min(start.y, end.y),
        maxX: Math.max(start.x, end.x),
        maxY: Math.max(start.y, end.y)
    };
    for (const solid of queryWorldSolids(state.world, terrainQueryBounds)) {
        if (segmentRectIntersection(start, end, solid)) {
            return true;
        }
    }
    for (const segment of queryWorldSegments(state.world, terrainQueryBounds)) {
        if (!isAreaBlockingSegmentKind(segment.kind) && segment.kind !== "walkable") {
            continue;
        }
        if (segmentSegmentIntersection(start, end, { x: segment.x1, y: segment.y1 }, { x: segment.x2, y: segment.y2 })) {
            return true;
        }
    }
    for (const polygon of queryWorldCollisionPolygons(state.world, terrainQueryBounds)) {
        if (!isAreaBlockingSegmentKind(polygon.kind)) {
            continue;
        }
        if (pointInPolygon(start, polygon) || pointInPolygon(end, polygon) || firstSegmentPolygonBoundaryIntersection(start, end, polygon)) {
            return true;
        }
    }
    return false;
}

function characterEnemyAttackBlockedByTerrain(state, enemy) {
    const player = state.player;
    return characterEnemyAttackSegmentBlockedByTerrain(state, {
        x: enemy.currentTransform.x,
        y: enemy.currentTransform.y - enemy.height * 0.5
    }, {
        x: player.currentTransform.x,
        y: player.currentTransform.y - player.height * 0.5
    });
}

function playerIsAvailableCombatTarget(state) {
    const player = state.player;
    return Boolean(
        player &&
        player.visible !== false &&
        player.combatState !== "dead" &&
        player.targetable !== false
    );
}

function playerConcealedFromEnemyPerception(state) {
    return Boolean(activePowerUpEffect(state, POWER_UP_EFFECT_IDS.MAGIC_RING));
}

function characterEnemyCanReachPlayer(state, enemy) {
    if (!playerIsAvailableCombatTarget(state)) {
        return false;
    }
    const playerRect = getPlayerRect(state);
    const attackRect = characterEnemyMeleeAttackRect(enemy);
    return rectsOverlap(playerRect, attackRect) && !characterEnemyAttackBlockedByTerrain(state, enemy);
}

function characterEnemyCanUseProjectile(state, enemy) {
    const player = state.player;
    if (!playerIsAvailableCombatTarget(state)) {
        return false;
    }
    // Alert memory may keep a ranged enemy pursuing after Ignatius leaves view, but
    // firing requires a fresh sighting inside the authored awareness range and cone.
    if (!characterEnemyCanNoticePlayer(state, enemy)) {
        return false;
    }
    const horizontalDistance = Math.abs(player.currentTransform.x - enemy.currentTransform.x);
    if (horizontalDistance < Math.max(0, Number(enemy.preferredAttackMinRange) || 0)) {
        return false;
    }
    return characterEnemyProjectilePathClearFromPoint(state, enemy, { x: enemy.currentTransform.x, y: enemy.currentTransform.y });
}

function characterEnemyArtworkOriginAt(enemy, x, y, facing = enemy.facing) {
    const direction = Number(facing) < 0 ? -1 : 1;
    const actorScale = Math.max(0.05, Number(enemy.currentTransform?.scaleX) || 1);
    return {
        x: x + direction * finiteNumberOr(enemy.renderOffsetX, 0) * actorScale,
        y: y + finiteNumberOr(enemy.renderOffsetY, 0) * actorScale
    };
}

function enemyProjectileSpawnPointAt(enemy, x, y, facing = enemy.facing) {
    const hasLegacyAuthoredOrigin = enemy.hasProjectileOriginLocal === undefined
        && enemy.projectileOriginLocalX !== null && enemy.projectileOriginLocalX !== undefined
        && enemy.projectileOriginLocalY !== null && enemy.projectileOriginLocalY !== undefined;
    const hasAuthoredOrigin = enemy.hasProjectileOriginLocal === true || hasLegacyAuthoredOrigin;
    const localX = Number(enemy.projectileOriginLocalX);
    const localY = Number(enemy.projectileOriginLocalY);
    const direction = Number(facing) < 0 ? -1 : 1;
    if (hasAuthoredOrigin && Number.isFinite(localX) && Number.isFinite(localY)) {
        const artworkOrigin = characterEnemyArtworkOriginAt(enemy, x, y, facing);
        const authoredScale = Math.max(0.0001, Number(enemy.projectileRigScale) || 1) * Math.max(0.05, Number(enemy.currentTransform.scaleX) || 1);
        return {
            x: artworkOrigin.x + localX * authoredScale * direction,
            y: artworkOrigin.y + localY * authoredScale
        };
    }
    return {
        x: x + direction * Math.max(16, enemy.width * 0.18),
        y: y - enemy.height * 0.67
    };
}

function enemyProjectileSpawnPoint(enemy) {
    return enemyProjectileSpawnPointAt(enemy, enemy.currentTransform.x, enemy.currentTransform.y, enemy.facing);
}

function solveBallisticLaunchVelocity(origin, target, launchSpeed, gravity) {
    const dx = target.x - origin.x;
    const dyUp = origin.y - target.y;
    const x = Math.abs(dx);
    const speed = Math.max(1, Number(launchSpeed) || 1);
    const g = Math.max(0.0001, Math.abs(Number(gravity) || 0.0001));
    if (x <= 0.0001) {
        return { x: 0, y: -speed };
    }
    const speedSq = speed * speed;
    const discriminant = speedSq * speedSq - g * (g * x * x + 2 * dyUp * speedSq);
    if (discriminant < 0) {
        return null;
    }
    const root = Math.sqrt(discriminant);
    const tanTheta = (speedSq + root) / (g * x);
    const cosTheta = 1 / Math.sqrt(1 + tanTheta * tanTheta);
    const sinTheta = tanTheta * cosTheta;
    const direction = dx < 0 ? -1 : 1;
    return {
        x: direction * speed * cosTheta,
        y: -speed * sinTheta
    };
}


function solveCharacterEnemyBallisticVelocity(enemy, origin, target, tuning = DEFAULT_TUNING) {
    const gravity = Number(enemy.projectileGravity) || 980;
    let launchSpeed = characterEnemyProjectileSpeed(enemy, tuning);
    let velocity = solveBallisticLaunchVelocity(origin, target, launchSpeed, gravity);
    if (!velocity) {
        for (const multiplier of [1.1, 1.2, 1.35, 1.5, 1.75, 2]) {
            velocity = solveBallisticLaunchVelocity(origin, target, launchSpeed * multiplier, gravity);
            if (velocity) {
                launchSpeed *= multiplier;
                break;
            }
        }
    }
    return velocity ? { ...velocity, gravity, launchSpeed } : null;
}

function characterEnemyProjectileVolleyAngleOffsets(enemy) {
    const count = clamp(Math.round(finiteNumberOr(enemy?.projectileVolleyCount, 1)), 1, 15);
    const halfAngleDegrees = clamp(finiteNumberOr(enemy?.projectileVolleyHalfAngle, 0), 0, 180);
    if (count <= 1 || halfAngleDegrees <= 0) {
        return [0];
    }
    const step = (halfAngleDegrees * 2) / (count - 1);
    return Array.from({ length: count }, (_, index) => (-halfAngleDegrees + step * index) * Math.PI / 180);
}

function characterEnemyStraightProjectileCanHitPlayer(state, enemy, origin, baseAim, angleOffset, speed, lifetime, radius) {
    const direction = rotateVector(baseAim, angleOffset);
    const end = {
        x: origin.x + direction.x * speed * lifetime,
        y: origin.y + direction.y * speed * lifetime
    };
    const playerImpact = sweptCircleRectImpact(origin, end, radius, getPlayerRect(state));
    if (!playerImpact) {
        return false;
    }
    const terrainImpact = findProjectileTerrainImpact(
        state,
        { x: end.x, y: end.y, radius },
        origin.x,
        origin.y,
        { includeReactiveObjects: true }
    );
    return !terrainImpact || terrainImpact.t > playerImpact.t + 0.000001;
}

function characterEnemyProjectilePathClearFromPoint(state, enemy, point) {
    const player = state.player;
    const facing = player.currentTransform.x < point.x ? -1 : 1;
    const launchType = String(enemy.projectileLaunchType || (isMusketProjectileKind(enemy.projectileKind) ? "ballistic" : "homing_lo"));
    const origin = launchType === "drop"
        ? {
            x: point.x,
            y: point.y + Math.max(4, enemy.height * 0.48)
        }
        : enemyProjectileSpawnPointAt(enemy, point.x, point.y, facing);
    const target = {
        x: player.currentTransform.x,
        y: player.currentTransform.y - player.height * 0.56
    };
    const radius = Math.max(1, Number(enemy.projectileRadius) || 1);
    const lifetime = Math.max(FIXED_DT, Number(enemy.projectileLifetime) || 1);

    if (launchType === "drop") {
        const gravity = Math.max(1, Number(enemy.projectileGravity) || 900);
        const initialVy = characterEnemyProjectileSpeed(enemy, state.tuning);
        const verticalDistance = target.y - origin.y;
        if (verticalDistance <= 0) {
            return false;
        }
        const discriminant = initialVy * initialVy + 2 * gravity * verticalDistance;
        const flightTime = (-initialVy + Math.sqrt(Math.max(0, discriminant))) / gravity;
        if (!Number.isFinite(flightTime) || flightTime <= 0 || flightTime > lifetime) {
            return false;
        }
        const initialVx = finiteNumberOr(enemy.velocityX, 0) * 0.18;
        const impactX = origin.x + initialVx * flightTime;
        const hitAllowance = Math.max(4, player.width * 0.5 + radius);
        if (Math.abs(impactX - player.currentTransform.x) > hitAllowance) {
            return false;
        }
        const sampleCount = Math.max(8, Math.min(80, Math.ceil(verticalDistance / 18)));
        let previous = origin;
        for (let index = 1; index <= sampleCount; index += 1) {
            const time = flightTime * index / sampleCount;
            const next = {
                x: origin.x + initialVx * time,
                y: origin.y + initialVy * time + 0.5 * gravity * time * time,
                radius
            };
            if (findProjectileTerrainImpact(state, next, previous.x, previous.y, { includeReactiveObjects: true })) {
                return false;
            }
            previous = next;
        }
        return true;
    }

    if (launchType !== "ballistic") {
        const speed = characterEnemyProjectileSpeed(enemy, state.tuning);
        const straightRange = speed * lifetime;
        if (launchType === "pathing_lo" || launchType === "pathing_hi") {
            const dx = target.x - origin.x;
            const dy = target.y - origin.y;
            const distance = Math.hypot(dx, dy);
            return distance <= straightRange + Math.max(48, Number(enemy.projectilePathMargin) || 0);
        }
        const baseAim = normalizeVector({ x: target.x - origin.x, y: target.y - origin.y });
        return characterEnemyProjectileVolleyAngleOffsets(enemy).some((angleOffset) =>
            characterEnemyStraightProjectileCanHitPlayer(
                state,
                enemy,
                origin,
                baseAim,
                angleOffset,
                speed,
                lifetime,
                radius
            )
        );
    }

    const ballistic = solveCharacterEnemyBallisticVelocity(enemy, origin, target, state.tuning);
    if (!ballistic || Math.abs(ballistic.x) < 0.0001) {
        return false;
    }
    const flightTime = (target.x - origin.x) / ballistic.x;
    if (!Number.isFinite(flightTime) || flightTime <= 0 || flightTime > lifetime) {
        return false;
    }
    const sampleCount = Math.max(8, Math.min(80, Math.ceil(Math.abs(target.x - origin.x) / 18)));
    let previous = origin;
    for (let index = 1; index <= sampleCount; index += 1) {
        const time = flightTime * index / sampleCount;
        const next = {
            x: origin.x + ballistic.x * time,
            y: origin.y + ballistic.y * time + 0.5 * ballistic.gravity * time * time,
            radius
        };
        if (findProjectileTerrainImpact(state, next, previous.x, previous.y, { includeReactiveObjects: true })) {
            return false;
        }
        previous = next;
    }
    return true;
}

function pathingProjectileProbe(state, projectile, direction, distance, extraRadius = 0) {
    const dir = normalizeVector(direction);
    if (Math.abs(dir.x) < 0.000001 && Math.abs(dir.y) < 0.000001) {
        return { distance: 0, impact: null, probeDistance: 0 };
    }
    const probeDistance = Math.max(1, Number(distance) || 0);
    const probeRadius = Math.max(1, Number(projectile.radius) || 1) + Math.max(0, Number(extraRadius) || 0);
    const startX = projectile.currentTransform.x;
    const startY = projectile.currentTransform.y;
    const endX = startX + dir.x * probeDistance;
    const endY = startY + dir.y * probeDistance;
    const probe = {
        currentTransform: { x: endX, y: endY },
        radius: probeRadius
    };
    const impact = findProjectileTerrainImpact(
        state,
        probe,
        startX,
        startY,
        { includeReactiveObjects: true }
    );
    return {
        distance: impact ? probeDistance * clamp(impact.t, 0, 1) : probeDistance,
        impact,
        probeDistance
    };
}

function pathingProjectileProbeClearDistance(state, projectile, direction, distance, extraRadius = 0) {
    return pathingProjectileProbe(state, projectile, direction, distance, extraRadius).distance;
}


function pathingProjectileDesiredDirection(state, projectile, target) {
    const currentSpeed = Math.hypot(Number(projectile.vx) || 0, Number(projectile.vy) || 0) || Math.max(1, Number(projectile.projectileSpeed) || 1);
    const targetVector = {
        x: target.x - projectile.currentTransform.x,
        y: target.y - projectile.currentTransform.y
    };
    const targetDistance = Math.hypot(targetVector.x, targetVector.y);
    const targetDir = normalizeVector(targetVector);
    const currentDir = normalizeVector({ x: Number(projectile.vx) || targetDir.x, y: Number(projectile.vy) || targetDir.y });
    const probeAngle = 15 * Math.PI / 180;
    const avoidTurnAngle = 48 * Math.PI / 180;
    const clearance = Math.max(100, Number(projectile.pathMargin) || 0, Math.max(10, Number(projectile.radius) || 0) + 4);
    const agility = Math.max(0.01, Number(projectile.homingStrength) || 0.01);
    const turnThirtySeconds = (Math.PI / 6) / agility;
    const c = Math.max(128, currentSpeed * turnThirtySeconds);
    const dangerProbeDistance = Math.max(320, c + clearance + Math.max(24, Number(projectile.radius) || 0) * 2);
    const losProbeDistance = Math.min(Math.max(1, targetDistance), 1400);
    const losExtraRadius = Math.max(4, Math.min(18, (Number(projectile.radius) || 0) * 0.35));
    const directProbe = pathingProjectileProbe(state, projectile, targetDir, losProbeDistance, losExtraRadius);
    const directClearDistance = directProbe.distance;
    const hasLineOfSightToWizard = targetDistance <= losProbeDistance + 0.5 && directClearDistance >= targetDistance - Math.max(1, Number(projectile.radius) || 0) * 0.25;

    const forwardDir = currentDir;
    const downDir = rotateVector(currentDir, probeAngle);
    const upDir = rotateVector(currentDir, -probeAngle);
    const probeExtraRadius = Math.max(8, Math.min(20, (Number(projectile.radius) || 0) * 0.5));
    const forwardClearDistance = pathingProjectileProbeClearDistance(state, projectile, forwardDir, dangerProbeDistance, probeExtraRadius);
    const downClearDistance = pathingProjectileProbeClearDistance(state, projectile, downDir, dangerProbeDistance, probeExtraRadius);
    const upClearDistance = pathingProjectileProbeClearDistance(state, projectile, upDir, dangerProbeDistance, probeExtraRadius);
    const forwardDanger = forwardClearDistance < dangerProbeDistance - 0.5;
    const targetPathDanger = directClearDistance < Math.min(targetDistance, losProbeDistance) - Math.max(2, Number(projectile.radius) || 0) * 0.25;
    const upBeatsForward = upClearDistance > forwardClearDistance + 4;
    const downBeatsForward = downClearDistance > forwardClearDistance + 4;
    const imminentDanger = forwardDanger || targetPathDanger || upBeatsForward || downBeatsForward;

    const upAlignment = Math.max(0, upDir.x * targetDir.x + upDir.y * targetDir.y);
    const downAlignment = Math.max(0, downDir.x * targetDir.x + downDir.y * targetDir.y);
    const upBias = upClearDistance + upAlignment * (dangerProbeDistance * 0.05);
    const downBias = downClearDistance + downAlignment * (dangerProbeDistance * 0.05);

    const directImpact = directProbe.impact || null;
    const forcedSide = directImpact && targetPathDanger
        ? directImpact.y >= projectile.currentTransform.y - Math.max(4, Number(projectile.radius) || 0) * 0.4 ? "up" : "down"
        : null;

    let decision = "home";
    let chosenDir = targetDir;
    if (hasLineOfSightToWizard && !imminentDanger) {
        decision = "home_clear_los";
        chosenDir = targetDir;
        projectile.pathingAvoidanceSide = null;
    } else if (imminentDanger || !hasLineOfSightToWizard) {
        const previousSide = projectile.pathingAvoidanceSide === "down" ? "down" : projectile.pathingAvoidanceSide === "up" ? "up" : null;
        const decisiveMargin = forcedSide ? 160 : 12;
        let side = forcedSide || previousSide || "up";
        if (upBias > downBias + decisiveMargin) {
            side = "up";
        } else if (downBias > upBias + decisiveMargin) {
            side = "down";
        }
        projectile.pathingAvoidanceSide = side;
        if (side === "up") {
            decision = hasLineOfSightToWizard ? "avoid_up_imminent" : "avoid_up_no_los";
            chosenDir = rotateVector(targetDir, -avoidTurnAngle);
        } else {
            decision = hasLineOfSightToWizard ? "avoid_down_imminent" : "avoid_down_no_los";
            chosenDir = rotateVector(targetDir, avoidTurnAngle);
        }
    }

    if (projectile.debugGuidanceCapture) {
        if (!Array.isArray(projectile.debugGuidanceTrace)) {
            projectile.debugGuidanceTrace = [];
        }
        if (projectile.debugGuidanceTrace.length < (projectile.debugGuidanceTraceLimit || 120)) {
            projectile.debugGuidanceTrace.push({
                time: Number(state.clock?.time) || 0,
                projectileX: projectile.currentTransform.x,
                projectileY: projectile.currentTransform.y,
                targetX: target.x,
                targetY: target.y,
                targetDistance,
                currentSpeed,
                c,
                clearance,
                directProbeDistance: losProbeDistance,
                directClearDistance,
                hasLineOfSightToWizard,
                dangerProbeDistance,
                forwardClearDistance,
                upClearDistance,
                downClearDistance,
                forwardDanger,
                upBeatsForward,
                downBeatsForward,
                targetPathDanger,
                imminentDanger,
                upBias,
                downBias,
                forcedSide,
                directImpactX: directImpact ? directImpact.x : null,
                directImpactY: directImpact ? directImpact.y : null,
                directImpactId: directImpact ? directImpact.id : null,
                currentHeadingDeg: Math.atan2(currentDir.y, currentDir.x) * 180 / Math.PI,
                targetHeadingDeg: Math.atan2(targetDir.y, targetDir.x) * 180 / Math.PI,
                chosenHeadingDeg: Math.atan2(chosenDir.y, chosenDir.x) * 180 / Math.PI,
                decision
            });
        }
    }

    return chosenDir;
}


export function launchCharacterEnemyProjectile(state, enemy, angleOffset = 0, volley = null) {
    const player = state.player;
    const origin = String(enemy.projectileLaunchType || "") === "drop"
        ? {
            x: enemy.currentTransform.x,
            y: enemy.currentTransform.y + Math.max(4, enemy.height * 0.48)
        }
        : enemyProjectileSpawnPoint(enemy);
    const target = {
        x: player.currentTransform.x,
        y: player.currentTransform.y - player.height * 0.56
    };
    const panicAim = (Number(enemy.panicTimer) || 0) > 0
        ? { x: Math.cos(Number(enemy.panicAttackAngle) || 0), y: Math.sin(Number(enemy.panicAttackAngle) || 0) }
        : null;

    const projectileKind = String(enemy.projectileKind || "fireball");
    const launchType = String(enemy.projectileLaunchType || (isMusketProjectileKind(projectileKind) ? "ballistic" : "homing_lo"));
    let vx = 0;
    let vy = 0;
    let gravity = Number(enemy.projectileGravity) || 0;
    let homingStrength = 0;
    let radius = Math.max(1, Number(enemy.projectileRadius) || 12);
    let damage = Math.max(0, Number(enemy.projectileDamage) || 0);
    let knockbackX = Math.max(0, Number(enemy.projectileKnockbackX) || 0);
    let knockbackY = Number(enemy.projectileKnockbackY) || 0;
    let lifetime = Math.max(FIXED_DT, Number(enemy.projectileLifetime) || 1);
    let trail = [];

    const tunedProjectileSpeed = characterEnemyProjectileSpeed(enemy, state.tuning);

    if (launchType === "drop") {
        vx = finiteNumberOr(enemy.velocityX, 0) * 0.18;
        vy = tunedProjectileSpeed;
        gravity = Math.max(1, Number(enemy.projectileGravity) || 900);
        homingStrength = 0;
        radius = Math.max(5, radius);
    } else if (launchType === "ballistic") {
        const ballistic = panicAim ? null : solveCharacterEnemyBallisticVelocity(enemy, origin, target, state.tuning);
        gravity = ballistic?.gravity || gravity || 980;
        const launchSpeed = ballistic?.launchSpeed || tunedProjectileSpeed;
        if (ballistic) {
            vx = ballistic.x;
            vy = ballistic.y;
        } else {
            const baseAim = panicAim || normalizeVector({ x: target.x - origin.x, y: target.y - origin.y });
            const aim = rotateVector(baseAim, angleOffset);
            vx = aim.x * launchSpeed;
            vy = aim.y * launchSpeed;
        }
        radius = Math.max(3, radius);
    } else {
        const baseAim = panicAim || normalizeVector({ x: target.x - origin.x, y: target.y - origin.y });
        const aim = rotateVector(baseAim, angleOffset);
        vx = aim.x * tunedProjectileSpeed;
        vy = aim.y * tunedProjectileSpeed;
        gravity = 0;
        if (launchType === "pathing_hi") {
            homingStrength = Math.max(0.8, Number(enemy.projectileHomingStrength) || 0);
        } else if (launchType === "pathing_lo") {
            homingStrength = Math.max(0.2, Number(enemy.projectileHomingStrength) || 0);
        } else if (launchType === "homing_hi") {
            homingStrength = Math.max(2.4, Number(enemy.projectileHomingStrength) || 0);
        } else if (launchType === "homing_lo") {
            homingStrength = Math.max(0.65, Number(enemy.projectileHomingStrength) || 0);
        } else {
            homingStrength = 0;
        }
        radius = Math.max(6, radius);
        trail = [{ x: origin.x, y: origin.y, time: state.clock.time }];
    }

    const projectile = {
        id: `enemy_projectile_${String(state.weapons.nextProjectileId).padStart(3, "0")}`,
        owner: "enemy",
        enemyId: enemy.id,
        characterId: enemy.projectileVisualCharacterId || enemy.characterId,
        frameId: enemy.projectileVisualFrameId || enemy.projectileFrameId,
        projectilePartName: enemy.projectilePartName,
        launchType,
        kind: String(enemy.projectileRendererKind || "enemyFireball"),
        state: "launched",
        activeSinceTick: state.clock.tick,
        ...createTransformTriplet({ x: origin.x, y: origin.y, angle: Math.atan2(vy, vx) }),
        vx,
        vy,
        gravity,
        homingStrength,
        facing: enemy.facing,
        targetId: "player",
        age: 0,
        lifetime,
        explosionTimer: 0,
        radius,
        damage,
        knockbackX,
        knockbackY,
        areaDamageRadius: enemyProjectileAreaDamageRadius(state, enemy),
        visualScale: Math.max(0.05, Number(enemy.projectileVisualScale) || 1),
        rotationSpeed: finiteNumberOr(enemy.projectileRotationSpeedDegrees, 0) * Math.PI / 180,
        orientToVelocity: enemy.projectileOrientToVelocity === true,
        trailEffect: String(enemy.projectileTrailEffect || "none"),
        impactEffect: String(enemy.projectileImpactEffect || "sparks"),
        explosionEffect: String(enemy.projectileExplosionEffect || "impact"),
        explosionVisualScale: Math.max(0.05, Number(enemy.projectileExplosionVisualScale) || 1),
        trail: String(enemy.projectileTrailEffect || "none") === "none" ? [] : trail,
        projectileKind,
        visualStyle: String(enemy.projectileTrailEffect || "none") === "undeath" ? "undeath" : null,
        pathMargin: Math.max(0, Number(enemy.projectilePathMargin) || 0),
        projectileSpeed: tunedProjectileSpeed,
        volleyId: volley?.id || null,
        volleyIndex: Number.isFinite(Number(volley?.index)) ? Number(volley.index) : 0,
        volleyCount: Math.max(1, Math.round(finiteNumberOr(volley?.count, 1))),
        volleyAngleOffsetDegrees: angleOffset * 180 / Math.PI
    };
    state.weapons.nextProjectileId += 1;
    state.projectiles.push(projectile);
    return projectile;
}

function launchCharacterEnemyProjectileVolley(state, enemy) {
    const angleOffsets = characterEnemyProjectileVolleyAngleOffsets(enemy);
    const volleyId = `enemy_volley_${state.clock.tick}_${String(state.weapons.nextProjectileId).padStart(3, "0")}`;
    return angleOffsets.map((angleOffset, index) => launchCharacterEnemyProjectile(state, enemy, angleOffset, {
        id: volleyId,
        index,
        count: angleOffsets.length
    }));
}

function characterEnemyRunSpeed(enemy, tuning = DEFAULT_TUNING) {
    const baseSpeed = Math.max(0, finiteNumberOr(enemy?.runSpeed, tuning?.enemyDefaultRunSpeed));
    return baseSpeed * characterEnemyRunSpeedScale(enemy, tuning);
}

function characterEnemyCanNoticePlayer(state, enemy) {
    const player = state.player;
    if (!playerIsAvailableCombatTarget(state) || playerConcealedFromEnemyPerception(state)) {
        return false;
    }

    const enemyCenterY = enemy.currentTransform.y - enemy.height * 0.5;
    const playerCenterY = player.currentTransform.y - player.height * 0.5;
    const dx = player.currentTransform.x - enemy.currentTransform.x;
    const dy = playerCenterY - enemyCenterY;
    const awarenessRange = Math.max(0, Number(enemy.awarenessRange) || 0);
    const distance = Math.hypot(dx, dy);
    if (distance > awarenessRange) {
        return false;
    }
    if (distance <= 0.0001) {
        return true;
    }

    const facing = enemy.facing < 0 ? -1 : 1;
    const authoredHalfAngleDegrees = Number(enemy.awarenessViewHalfAngle);
    const halfAngleDegrees = clamp(
        Number.isFinite(authoredHalfAngleDegrees) && authoredHalfAngleDegrees > 0
            ? authoredHalfAngleDegrees
            : state.tuning.enemyDefaultAwarenessViewHalfAngle,
        0,
        180
    );
    const minimumForwardDot = Math.cos(halfAngleDegrees * Math.PI / 180);
    // Flying bombers judge their facing cone in the horizontal plane. Using the full
    // two-dimensional direction made a wizard standing below a bat appear outside a
    // narrow cone even when he was plainly in front of it. The range check above still
    // uses the real two-dimensional distance.
    const forwardDot = enemy.strategy === "bomber" && enemy.locomotion === "flying"
        ? (Math.abs(dx) <= 0.0001 ? 1 : Math.sign(dx) * facing)
        : dx * facing / distance;

    // Awareness is intentionally independent of collision geometry. Pillars, doors,
    // walkable lines, and blockable areas may obstruct movement or an actual attack,
    // but they do not make Ignatius invisible. Distance and the authored facing cone are
    // the only first-notice gates.
    return forwardDot + 1e-9 >= minimumForwardDot;
}

function updateCharacterEnemyAwareness(state, enemy, dt) {
    const wasAlerted = enemy.alerted === true;
    if (characterEnemyCanNoticePlayer(state, enemy)) {
        enemy.awarenessTimer = Math.max(FIXED_DT, Number(enemy.awarenessHoldDuration) || state.tuning.enemyDefaultAwarenessHoldSeconds || 1.2);
    } else {
        enemy.awarenessTimer = Math.max(0, (Number(enemy.awarenessTimer) || 0) - dt);
    }
    enemy.alerted = enemy.awarenessTimer > 0;

    if (enemy.alerted && !wasAlerted) {
        addEvent(state, "ENEMY_ALERTED", { enemyId: enemy.id });
    } else if (!enemy.alerted && wasAlerted) {
        addEvent(state, "ENEMY_ALERT_LOST", { enemyId: enemy.id });
    }
    return enemy.alerted;
}

function findCharacterEnemyWalkingSupport(state, enemy, candidateX, direction) {
    const authoredStepHeight = Math.max(0, Number(enemy.maxStepHeight) || 0);
    const automaticStepHeight = Math.max(authoredStepHeight, enemy.height * AUTOMATIC_STEP_HEIGHT_RATIO);
    const directSupport = findCharacterEnemyGroundSupport(
        state,
        candidateX,
        enemy.currentTransform.y,
        authoredStepHeight,
        automaticStepHeight,
        enemy.width
    );
    const stepProbeX = candidateX + (direction < 0 ? -1 : 1) * Math.max(2, enemy.width * 0.14);
    const steppedSupport = findCharacterEnemyGroundSupport(
        state,
        stepProbeX,
        enemy.currentTransform.y,
        automaticStepHeight,
        automaticStepHeight,
        enemy.width,
        { preferHighest: true }
    );
    const directClear = Boolean(directSupport) && !characterEnemyBodyBlockedAt(state, enemy, candidateX, directSupport.y, {
        groundSlope: directSupport.slope
    });
    const steppedClear = Boolean(steppedSupport) && !characterEnemyBodyBlockedAt(state, enemy, candidateX, steppedSupport.y, {
        groundSlope: steppedSupport.slope,
        ignoreSupportId: steppedSupport.id
    });

    // Preserve ordinary slope and moving-platform support selection. Only switch
    // to the automatic step candidate when it is a distinct, genuinely higher
    // surface inside one fifth of the actor's height.
    if (steppedSupport
        && directSupport
        && steppedSupport.id !== directSupport.id
        && Math.abs(steppedSupport.slope) < 0.08
        && Math.abs(directSupport.slope) < 0.08
        && steppedSupport.y < directSupport.y - 0.05
        && steppedClear) return steppedSupport;
    if (directClear) return directSupport;
    if (steppedClear) return steppedSupport;
    return null;
}


function characterEnemyAutomaticStepHeight(enemy) {
    return Math.max(
        Math.max(0, Number(enemy?.maxStepHeight) || 0),
        Math.max(0, Number(enemy?.height) || 0) * AUTOMATIC_STEP_HEIGHT_RATIO
    );
}

function currentCharacterEnemyGroundStrideSupportGeometry(state, enemy) {
    const supportId = enemy?.supportId;
    if (!supportId) return null;
    for (const support of state.world?.segments || []) {
        if (support.id !== supportId || !playerSegmentIsStandable(support)) continue;
        return {
            id: support.id,
            kind: support.kind,
            source: "segment",
            visualId: String(support.visualId || ""),
            x1: Number(support.x1),
            y1: Number(support.y1),
            x2: Number(support.x2),
            y2: Number(support.y2)
        };
    }
    for (const solid of state.world?.solids || []) {
        if (solid.id !== supportId) continue;
        return {
            id: solid.id,
            kind: solid.kind || "solid",
            source: "solid",
            visualId: String(solid.visualId || ""),
            x1: Number(solid.x),
            y1: Number(solid.y),
            x2: Number(solid.x) + Number(solid.w),
            y2: Number(solid.y)
        };
    }
    for (const polygon of state.world?.collisionPolygons || []) {
        if (polygon.id !== supportId || !Array.isArray(polygon.points) || polygon.points.length < 2) continue;
        let best = null;
        let bestDistance = Infinity;
        for (let index = 0; index < polygon.points.length; index += 1) {
            const a = polygon.points[index];
            const b = polygon.points[(index + 1) % polygon.points.length];
            const probe = { kind: polygon.kind, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
            if (!playerSegmentIsStandable(probe)) continue;
            const y = segmentYAtX(probe, enemy.currentTransform.x);
            if (y === null) continue;
            const distance = Math.abs(y - enemy.currentTransform.y);
            if (distance < bestDistance) {
                bestDistance = distance;
                best = {
                    id: polygon.id,
                    kind: polygon.kind,
                    source: "polygon",
                    visualId: String(polygon.visualId || ""),
                    x1: Number(a.x),
                    y1: Number(a.y),
                    x2: Number(b.x),
                    y2: Number(b.y)
                };
            }
        }
        if (best) return best;
    }
    return null;
}

function characterEnemyGroundStrideHeldSupportYAtX(state, enemy, x) {
    const support = currentCharacterEnemyGroundStrideSupportGeometry(state, enemy);
    if (support) {
        const y = segmentYAtX(support, x);
        if (y !== null) return y;
    }
    return null;
}

function characterEnemyWalkingSupportIsContinuation(state, enemy, support) {
    const heldId = String(enemy?.supportId || "");
    const nextId = String(support?.id || "");
    if (!heldId || !nextId || heldId === nextId) return true;
    // Enemy ground following uses the same authored-family continuation rule
    // as the wizard. Curved assets are commonly authored as several adjacent
    // walkable line segments; those vertices are not steps or one-way seams.
    if (supportFamilyId(heldId) === supportFamilyId(nextId)) return true;
    const held = findWorldSegmentById(state, heldId);
    const candidate = findWorldSegmentById(state, nextId);
    if (!held || !candidate || !playerSegmentIsStandable(held) || !playerSegmentIsStandable(candidate)) return false;
    const heldDx = Number(held.x2) - Number(held.x1);
    const heldDy = Number(held.y2) - Number(held.y1);
    const candidateDx = Number(candidate.x2) - Number(candidate.x1);
    const candidateDy = Number(candidate.y2) - Number(candidate.y1);
    const heldLength = Math.hypot(heldDx, heldDy);
    const candidateLength = Math.hypot(candidateDx, candidateDy);
    if (heldLength <= 0.001 || candidateLength <= 0.001) return false;
    const tangentDot = Math.abs((heldDx * candidateDx + heldDy * candidateDy) / (heldLength * candidateLength));
    if (tangentDot < PLAYER_WALKABLE_SEAM_MIN_TANGENT_DOT) return false;
    return segmentSegmentDistance(
        { x: Number(held.x1), y: Number(held.y1) },
        { x: Number(held.x2), y: Number(held.y2) },
        { x: Number(candidate.x1), y: Number(candidate.y1) },
        { x: Number(candidate.x2), y: Number(candidate.y2) }
    ) <= PLAYER_WALKABLE_SEAM_MAX_DISTANCE;
}

function characterEnemyWalkingSupportMatchesNavigationSupport(physicalSupport, navigationSupport, x) {
    if (!physicalSupport || !navigationSupport) return false;
    const physicalId = String(physicalSupport.id || "");
    const navigationCollisionId = String(enemyNavigationSupportCollisionId(navigationSupport) || "");
    if (physicalId && navigationCollisionId && physicalId === navigationCollisionId) return true;

    const xMin = Number(navigationSupport.xMin);
    const xMax = Number(navigationSupport.xMax);
    if (!Number.isFinite(xMin) || !Number.isFinite(xMax) || x < xMin - 0.001 || x > xMax + 0.001) return false;
    const navigationY = supportPoint(navigationSupport, clamp(x, xMin, xMax), 0).y;
    return Number.isFinite(Number(physicalSupport.y)) && Math.abs(Number(physicalSupport.y) - navigationY) <= 0.75;
}

function findCharacterEnemyGroundStrideCollision(state, enemy, previousX, nextX) {
    const dx = nextX - previousX;
    if (Math.abs(dx) <= 0.000001 || enemy?.airborne) return null;
    const previousLeft = previousX - enemy.width * 0.5;
    const previousRight = previousX + enemy.width * 0.5;
    const currentLeft = nextX - enemy.width * 0.5;
    const currentRight = nextX + enemy.width * 0.5;
    const top = enemy.currentTransform.y - enemy.height;
    const bottom = enemy.currentTransform.y;
    const ySamples = [
        enemy.currentTransform.y - enemy.height * 0.84,
        enemy.currentTransform.y - enemy.height * 0.50,
        enemy.currentTransform.y - enemy.height * 0.16,
        enemy.currentTransform.y - 0.5
    ];
    const skin = 3;
    const maximumReach = characterEnemyAutomaticStepHeight(enemy);
    const queryBounds = {
        minX: Math.min(previousLeft, currentLeft) - skin,
        minY: top - skin,
        maxX: Math.max(previousRight, currentRight) + skin,
        maxY: bottom + skin
    };
    const collisionAssetBounds = {
        minX: Math.min(queryBounds.minX, previousLeft) - maximumReach,
        minY: Math.min(queryBounds.minY, top) - maximumReach,
        maxX: Math.max(queryBounds.maxX, previousRight) + maximumReach,
        maxY: Math.max(queryBounds.maxY, bottom) + maximumReach
    };
    let best = null;
    const consider = (contactX, detail) => {
        if (!Number.isFinite(contactX)) return;
        if (dx > 0) {
            if (previousRight > contactX + 0.05 || currentRight < contactX - skin) return;
            if (!best || contactX < best.contactX - 0.000001) best = { contactX, x: contactX - enemy.width * 0.5, side: "right", ...detail };
        } else {
            if (previousLeft < contactX - 0.05 || currentLeft > contactX + skin) return;
            if (!best || contactX > best.contactX + 0.000001) best = { contactX, x: contactX + enemy.width * 0.5, side: "left", ...detail };
        }
    };

    for (const solid of queryWorldSolids(state.world, queryBounds)) {
        if (bottom <= solid.y + 0.05 || top >= solid.y + solid.h - 0.05) continue;
        consider(dx > 0 ? solid.x : solid.x + solid.w, { id: solid.id, kind: solid.kind || "solid", source: "solid" });
    }

    const heldSupport = currentCharacterEnemyGroundStrideSupportGeometry(state, enemy);
    for (const segment of queryWorldSegmentsFromCollisionAssets(state.world, collisionAssetBounds)) {
        if (segment.kind === "walkable" || !isAreaBlockingSegmentKind(segment.kind)) continue;
        const standable = playerSegmentIsStandable(segment);
        if (standable && heldSupport && Math.abs(Number(segment.x2) - Number(segment.x1)) > 0.05) {
            const a = { x: Number(segment.x1), y: Number(segment.y1) };
            const b = { x: Number(segment.x2), y: Number(segment.y2) };
            const endpoint = dx > 0 ? (a.x <= b.x ? a : b) : (a.x >= b.x ? a : b);
            const supportY = segmentYAtX(heldSupport, endpoint.x);
            if (supportY !== null) {
                const gap = supportY - endpoint.y;
                if (gap > 0.05 && gap < enemy.height - 0.05) {
                    consider(endpoint.x, { id: segment.id, kind: segment.kind, source: "segmentEndpoint", endpoint });
                }
            }
        }
        if (standable) continue;
        for (const y of ySamples) {
            const x = segmentXAtY(segment, y);
            if (x !== null) consider(x, { id: segment.id, kind: segment.kind, source: "segment" });
        }
    }

    const heldSupportNextY = heldSupport ? segmentYAtX(heldSupport, nextX) : null;
    const heldSupportContinues = heldSupportNextY !== null
        && Math.abs(heldSupportNextY - enemy.currentTransform.y) <= maximumReach + skin + 0.05;
    for (const polygon of queryWorldCollisionPolygons(state.world, queryBounds)) {
        if (!isAreaBlockingSegmentKind(polygon.kind)) continue;
        if (heldSupportContinues && heldSupport?.visualId && polygon.visualId === heldSupport.visualId) continue;
        for (const y of ySamples) {
            for (const interval of polygonXIntervalsAtY(polygon, y)) {
                consider(dx > 0 ? interval[0] : interval[1], { id: polygon.id, kind: polygon.kind, source: "polygon" });
            }
        }
    }
    return best;
}

function characterEnemyGroundStrideFootOrigin(state, enemy, collision, contactActorX, direction) {
    const contactX = Number.isFinite(Number(collision?.contactX))
        ? Number(collision.contactX)
        : contactActorX + direction * enemy.width * 0.5;
    const maximumReach = characterEnemyAutomaticStepHeight(enemy);
    const supportY = characterEnemyGroundStrideHeldSupportYAtX(state, enemy, contactX);
    if (supportY !== null && Math.abs(supportY - enemy.currentTransform.y) <= maximumReach + 3.05) {
        return { x: contactX, y: supportY };
    }
    return { x: contactX, y: enemy.currentTransform.y };
}

function planCharacterEnemyGroundStride(state, enemy, collision, previousX, nextX) {
    const direction = Math.sign(nextX - previousX);
    if (!collision || enemy?.airborne || !direction) return null;
    const contactActorX = Number.isFinite(Number(collision.x))
        ? Number(collision.x)
        : Number(collision.contactX) - direction * enemy.width * 0.5;
    const footOrigin = characterEnemyGroundStrideFootOrigin(state, enemy, collision, contactActorX, direction);
    const maximumReach = characterEnemyAutomaticStepHeight(enemy);
    if (collision.source === "segmentEndpoint" && collision.endpoint
        && Math.hypot(collision.endpoint.x - footOrigin.x, collision.endpoint.y - footOrigin.y) > maximumReach + 0.05) return null;

    const contactBounds = {
        minX: contactActorX - enemy.width * 0.5,
        minY: footOrigin.y - enemy.height,
        maxX: contactActorX + enemy.width * 0.5,
        maxY: footOrigin.y
    };
    const strideCandidateBounds = {
        minX: contactBounds.minX - maximumReach,
        minY: contactBounds.minY - maximumReach,
        maxX: contactBounds.maxX + maximumReach,
        maxY: contactBounds.maxY + maximumReach
    };
    const candidateEdges = groundStrideCandidateEdges(state, strideCandidateBounds);
    const minimumForward = Math.min(maximumReach, 0.05);
    const sweepResult = groundStrideSweepFootholdFromCandidates(candidateEdges, footOrigin, maximumReach, direction, minimumForward);
    if (!sweepResult?.foothold || !sweepResult?.targetSupport) return null;
    const foothold = sweepResult.foothold;
    if ((foothold.x - footOrigin.x) * direction < minimumForward - 0.000001) return null;
    const triggerClearance = groundStrideTriggerClearancePoint(candidateEdges, collision, footOrigin, maximumReach);
    const clearancePoint = {
        x: footOrigin.x,
        y: Math.min(footOrigin.y, foothold.y, sweepResult.clearancePoint?.y ?? footOrigin.y, triggerClearance?.y ?? footOrigin.y)
    };
    const startX = footOrigin.x - direction * enemy.width * 0.5;
    const startY = footOrigin.y;
    const cornerX = clearancePoint.x - direction * enemy.width * 0.5;
    const cornerY = clearancePoint.y;
    const targetX = foothold.x - direction * enemy.width * 0.5;
    const targetY = foothold.y;
    if ((targetX - startX) * direction < minimumForward - 0.000001) return null;
    const cornerDistance = Math.hypot(cornerX - startX, cornerY - startY);
    const landingDistance = Math.hypot(targetX - cornerX, targetY - cornerY);
    const length = cornerDistance + landingDistance;
    if (!Number.isFinite(length) || length <= 0.0001 || !Number.isFinite(cornerDistance)) return null;
    const path = {
        start: { x: startX, y: startY },
        corner: { x: cornerX, y: cornerY },
        target: { x: targetX, y: targetY },
        candidateEdges
    };
    if (groundStrideBodyPathBlocked(state, path, enemy, maximumReach)) return null;
    return {
        active: true,
        direction,
        startX,
        startY,
        cornerX,
        cornerY,
        cornerDistance,
        targetX,
        targetY,
        footStartX: footOrigin.x,
        footStartY: footOrigin.y,
        footholdX: foothold.x,
        footholdY: foothold.y,
        strideProgress: 0,
        strideLength: length,
        targetSupportId: sweepResult.targetSupport.id || null,
        targetSupportKind: sweepResult.targetSupport.kind || "blockable",
        targetSupportSource: sweepResult.targetSupport.source || collision.source,
        riserId: collision.id || null
    };
}

function characterEnemyGroundStrideExpectedPose(stride) {
    const progress = clamp(Number(stride?.strideProgress) || 0, 0, Number(stride?.strideLength) || 0);
    const cornerDistance = clamp(Number(stride?.cornerDistance) || 0, 0, Number(stride?.strideLength) || 0);
    if (cornerDistance > 0.000001 && progress < cornerDistance) {
        const fraction = progress / cornerDistance;
        return {
            x: stride.startX + (stride.cornerX - stride.startX) * fraction,
            y: stride.startY + (stride.cornerY - stride.startY) * fraction
        };
    }
    const landingLength = Math.max(0.000001, Number(stride?.strideLength) - cornerDistance);
    const fraction = clamp((progress - cornerDistance) / landingLength, 0, 1);
    return {
        x: stride.cornerX + (stride.targetX - stride.cornerX) * fraction,
        y: stride.cornerY + (stride.targetY - stride.cornerY) * fraction
    };
}

function advanceCharacterEnemyGroundStride(state, enemy, distanceThisFrame) {
    const stride = enemy.groundStride;
    if (!stride?.active) return { handled: false, remaining: distanceThisFrame, consumed: 0 };
    const direction = Math.sign(distanceThisFrame);
    const expected = characterEnemyGroundStrideExpectedPose(stride);
    const displaced = Math.hypot(enemy.currentTransform.x - expected.x, enemy.currentTransform.y - expected.y);
    if (enemy.airborne || (direction && direction !== stride.direction) || displaced > Math.max(4, enemy.width * 0.20)) {
        enemy.groundStride = null;
        return { handled: false, remaining: distanceThisFrame, consumed: 0 };
    }
    if (!direction) return { handled: true, remaining: 0, consumed: 0 };
    const budget = Math.abs(distanceThisFrame);
    const previousProgress = Math.max(0, Number(stride.strideProgress) || 0);
    const nextProgress = Math.min(stride.strideLength, previousProgress + budget);
    const cornerDistance = clamp(Number(stride.cornerDistance) || 0, 0, stride.strideLength);
    if (cornerDistance > 0.000001 && nextProgress < cornerDistance) {
        const fraction = nextProgress / cornerDistance;
        enemy.currentTransform.x = stride.startX + (stride.cornerX - stride.startX) * fraction;
        enemy.currentTransform.y = stride.startY + (stride.cornerY - stride.startY) * fraction;
    } else {
        const landingLength = Math.max(0.000001, stride.strideLength - cornerDistance);
        const fraction = clamp((nextProgress - cornerDistance) / landingLength, 0, 1);
        enemy.currentTransform.x = stride.cornerX + (stride.targetX - stride.cornerX) * fraction;
        enemy.currentTransform.y = stride.cornerY + (stride.targetY - stride.cornerY) * fraction;
    }
    stride.strideProgress = nextProgress;
    const consumed = nextProgress - previousProgress;
    if (nextProgress + 0.0001 < stride.strideLength) return { handled: true, remaining: 0, consumed };
    const remainingBudget = Math.max(0, budget - consumed);
    enemy.currentTransform.x = stride.targetX;
    enemy.currentTransform.y = stride.targetY;
    setCharacterEnemyGroundSupportIdentity(state, enemy, {
        id: stride.targetSupportId,
        kind: stride.targetSupportKind,
        source: stride.targetSupportSource
    });
    enemy.groundStride = null;
    return { handled: true, remaining: direction * remainingBudget, consumed };
}

function findLegacyCharacterEnemyGroundSupport(state, x, authoredY, width, maxDeltaY) {
    const safeWidth = Math.max(16, Number(width) || 0);
    const samples = [x, x - safeWidth * 0.24, x + safeWidth * 0.24];
    let best = null;
    let bestScore = Number.POSITIVE_INFINITY;
    const consider = (a, b, id, kind) => {
        if (kind !== "walkable" && kind !== "blockable") return;
        const dx = Number(b.x) - Number(a.x);
        if (Math.abs(dx) < 0.001) return;
        const dy = Number(b.y) - Number(a.y);
        if (kind === "blockable" && Math.abs(dy) > Math.abs(dx) * PLAYER_STANDABLE_SLOPE_RATIO) return;
        const slope = dy / dx;
        for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
            const t = (samples[sampleIndex] - Number(a.x)) / dx;
            if (t < -0.001 || t > 1.001) continue;
            const y = Number(a.y) + (Number(b.y) - Number(a.y)) * t;
            const delta = y - authoredY;
            if (Math.abs(delta) > maxDeltaY) continue;
            const score = Math.abs(delta) + sampleIndex * 0.001;
            if (score < bestScore) {
                bestScore = score;
                best = { id, kind, y, delta, slope, score };
            }
        }
    };

    const supportQueryBounds = {
        minX: Math.min(...samples) - 2,
        minY: authoredY - Math.max(0, maxDeltaY) - 2,
        maxX: Math.max(...samples) + 2,
        maxY: authoredY + Math.max(0, maxDeltaY) + 2
    };
    for (const segment of queryWorldSegments(state.world, supportQueryBounds)) {
        consider(
            { x: Number(segment.x1), y: Number(segment.y1) },
            { x: Number(segment.x2), y: Number(segment.y2) },
            segment.id || "segment",
            segment.kind
        );
    }
    for (const polygon of queryWorldCollisionPolygons(state.world, supportQueryBounds)) {
        const points = Array.isArray(polygon?.points) ? polygon.points : [];
        if (points.length < 2) continue;
        const polygonId = polygon.id || "polygon";
        for (let index = 0; index < points.length; index += 1) {
            const a = points[index];
            const b = points[(index + 1) % points.length];
            consider(a, b, `${polygonId}_edge_${index}`, polygon.kind);
        }
    }
    for (const solid of queryWorldSolids(state.world, supportQueryBounds)) {
        if (solid.kind !== "walkable" && solid.kind !== "blockable") continue;
        for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
            const sampleX = samples[sampleIndex];
            if (sampleX < solid.x - 0.001 || sampleX > solid.x + solid.w + 0.001) continue;
            const delta = solid.y - authoredY;
            if (Math.abs(delta) > maxDeltaY) continue;
            const score = Math.abs(delta) + sampleIndex * 0.001;
            if (score < bestScore) {
                bestScore = score;
                best = { id: solid.id || "solid", kind: solid.kind, y: solid.y, delta, slope: 0, score };
            }
        }
    }
    return best;
}

function beginCharacterEnemyUnsupportedFall(enemy, horizontalVelocity = null) {
    if (!enemy || enemy.locomotion === "flying" || enemy.airborne === true) return false;
    const inheritedHorizontalVelocity = Number.isFinite(Number(horizontalVelocity))
        ? Number(horizontalVelocity)
        : (Number(enemy.groundVelocityX) || 0);
    enemy.airborne = true;
    enemy.airTimer = 0;
    const committedStep = enemy.routeTraversalPhase === "ground_step"
        && Number(enemy.routeTraversalEdgeIndex) === Number(enemy.routeIndex)
        ? enemy.route?.[enemy.routeIndex] || null
        : null;
    enemy.airTraversalType = "fall";
    enemy.airSourceSupportId = enemy.currentSupportId || null;
    enemy.airSourceObstacleId = enemy.supportId || null;
    // A short physical loss of support while traversing an ordinary ground step
    // does not cancel the manoeuvre. Preserve the destination so the normal air
    // landing resolver can complete the step if the intended region is reached.
    enemy.airTargetSupportId = committedStep?.type === "step" ? committedStep.to || null : null;
    enemy.supportId = null;
    enemy.ridingPlatformId = null;
    enemy.groundStride = null;
    enemy.velocityX = inheritedHorizontalVelocity;
    enemy.velocityY = Math.max(0, Number(enemy.velocityY) || 0);
    enemy.groundVelocityX = 0;
    enemy.movementPhase = "air";
    if (Math.abs(enemy.velocityX) > 0.001) enemy.facing = enemy.velocityX < 0 ? -1 : 1;
    return true;
}

function moveLegacyCharacterEnemyTowardCollisionAware(state, enemy, targetX, speed, dt, stopDistance = 0) {
    const dx = targetX - enemy.currentTransform.x;
    const distance = Math.abs(dx);
    const remainingDistance = Math.max(0, distance - Math.max(0, stopDistance));
    if (remainingDistance <= 0.0001 || speed <= 0 || dt <= 0) return 0;

    const direction = dx < 0 ? -1 : 1;
    let candidateX = enemy.currentTransform.x + direction * Math.min(remainingDistance, speed * dt);
    if (enemy.strategy === "simple_patrol" && enemy.patrolDistance > 0) {
        candidateX = clamp(candidateX, enemy.patrolMinX, enemy.patrolMaxX);
    }
    if (Math.abs(candidateX - enemy.currentTransform.x) <= 0.0001) return 0;

    const supportDelta = Math.max(
        Number(enemy.maxDropDistance) || 0,
        Math.max(Number(enemy.maxStepHeight) || 0, (Number(enemy.height) || 0) * 0.20)
    );
    let support = findLegacyCharacterEnemyGroundSupport(
        state,
        candidateX,
        enemy.currentTransform.y,
        enemy.width,
        supportDelta
    );
    const legacySupportClear = Boolean(support) && !characterEnemyBodyBlockedAt(
        state,
        enemy,
        candidateX,
        support.y,
        { groundSlope: support.slope }
    );
    if (!legacySupportClear) {
        support = findCharacterEnemyWalkingSupport(state, enemy, candidateX, direction);
    }
    if (!support) return 0;

    const moved = Math.abs(candidateX - enemy.currentTransform.x);
    enemy.facing = direction;
    enemy.currentTransform.x = candidateX;
    enemy.currentTransform.y = support.y;
    setCharacterEnemyGroundSupportIdentity(state, enemy, support);
    return moved;
}

function updateCharacterEnemyPassiveGroundMotion(state, enemy, dt) {
    if (!enemy || enemy.locomotion === "flying" || enemy.airborne === true || dt <= 0) return 0;
    const previousX = enemy.currentTransform.x;
    const moved = moveCharacterEnemyToward(
        state,
        enemy,
        previousX,
        0,
        dt,
        0,
        true
    );
    enemy.velocityX = dt > 0 ? (enemy.currentTransform.x - previousX) / dt : 0;
    if (enemy.airborne !== true) enemy.velocityY = 0;
    return moved;
}

function characterEnemyControlledGroundVelocity(state, enemy, targetX, speed, dt, stopDistance = 0, brakeAtTarget = true) {
    const safeDt = Math.max(0, Number(dt) || 0);
    const requestedSpeed = Math.max(0, Number(speed) || 0);
    const currentVelocity = Number(enemy.groundVelocityX) || 0;
    if (safeDt <= 0) return currentVelocity;

    let effectiveTargetX = Number(targetX) || 0;
    if (enemy.strategy === "simple_patrol" && enemy.patrolDistance > 0) {
        effectiveTargetX = clamp(effectiveTargetX, enemy.patrolMinX, enemy.patrolMaxX);
    }
    const dx = effectiveTargetX - enemy.currentTransform.x;
    const direction = dx < -0.0001 ? -1 : dx > 0.0001 ? 1 : 0;
    const remainingDistance = Math.max(0, Math.abs(dx) - Math.max(0, Number(stopDistance) || 0));
    const acceleration = Math.max(1, Number(enemy.runAcceleration) || Number(state.tuning.groundAcceleration) || 950);
    const friction = Math.max(1, Number(state.tuning.groundFriction) || 900);

    if (!direction || requestedSpeed <= 0 || remainingDistance <= 0.0001) {
        return approach(currentVelocity, 0, friction * safeDt);
    }

    let desiredSpeed = requestedSpeed;
    if (brakeAtTarget) {
        // AI chooses whether to press left/right; the same ground-friction rule as
        // Ignatius determines how early that input must be released to stop at a
        // spatial goal. This may overshoot and reverse by a small physical amount,
        // but never snaps position or momentum.
        desiredSpeed = Math.min(desiredSpeed, Math.sqrt(Math.max(0, 2 * friction * remainingDistance)));
    }
    const desiredVelocity = direction * desiredSpeed;
    const sameDirection = currentVelocity * direction > 0;
    const slowingInCurrentDirection = sameDirection && Math.abs(currentVelocity) > desiredSpeed + 0.0001;
    const controlRate = slowingInCurrentDirection ? friction : acceleration;
    return approach(currentVelocity, desiredVelocity, controlRate * safeDt);
}

function moveCharacterEnemyToward(
    state, enemy, targetX, speed, dt, stopDistance = 0, brakeAtTarget = true, allowedNavigationSupports = null,
    allowUnsupportedFall = true
) {
    if (dt <= 0) return 0;
    let effectiveTargetX = Number(targetX) || 0;
    if (enemy.strategy === "simple_patrol" && enemy.patrolDistance > 0) {
        effectiveTargetX = clamp(effectiveTargetX, enemy.patrolMinX, enemy.patrolMaxX);
    }
    const controlledVelocityX = characterEnemyControlledGroundVelocity(
        state, enemy, effectiveTargetX, speed, dt, stopDistance, brakeAtTarget
    );
    const moveDirection = controlledVelocityX < -0.0001 ? -1 : controlledVelocityX > 0.0001 ? 1 : 0;

    if (enemy.groundStride?.active) {
        if (!moveDirection || moveDirection !== enemy.groundStride.direction) {
            enemy.groundStride = null;
        } else {
            enemy.facing = moveDirection;
            const advanced = advanceCharacterEnemyGroundStride(state, enemy, controlledVelocityX * dt);
            if (advanced.handled) {
                if (advanced.consumed > 0 && dt > 0) {
                    enemy.groundVelocityX = moveDirection * (advanced.consumed / dt);
                } else {
                    enemy.groundVelocityX = controlledVelocityX;
                }
                return advanced.consumed;
            }
        }
    }

    enemy.groundVelocityX = controlledVelocityX;
    if (!moveDirection || Math.abs(controlledVelocityX) * dt <= 0.000001) return 0;

    // A held authored surface can be physically solid without being walkable by
    // the ground locomotion controller (for example a blockable 45-degree
    // slope). Do not reinterpret that deliberate standability rejection as an
    // unsupported ledge and grant horizontal falling motion. Walkable ladder
    // segments retain their separate, much steeper standable allowance.
    const heldGroundSegment = enemy.supportId ? findWorldSegmentById(state, enemy.supportId) : null;
    const nonWalkableGroundUnderfoot = (heldGroundSegment && !playerSegmentIsStandable(heldGroundSegment))
        || queryWorldSegments(state.world, {
            minX: enemy.currentTransform.x - 2,
            minY: enemy.currentTransform.y - 2,
            maxX: enemy.currentTransform.x + 2,
            maxY: enemy.currentTransform.y + 2
        }).some((segment) => {
            if (!isSolidSegmentKind(segment.kind) || playerSegmentIsStandable(segment)) return false;
            const y = segmentYAtX(segment, enemy.currentTransform.x);
            return y !== null && Math.abs(y - enemy.currentTransform.y) <= 2;
        });
    if (nonWalkableGroundUnderfoot) {
        enemy.groundVelocityX = 0;
        return 0;
    }

    const previousX = enemy.currentTransform.x;
    const candidateX = previousX + controlledVelocityX * dt;
    const committedBudget = Math.abs(candidateX - previousX);
    const collision = findCharacterEnemyGroundStrideCollision(state, enemy, previousX, candidateX);
    if (collision) {
        const stride = planCharacterEnemyGroundStride(state, enemy, collision, previousX, candidateX);
        const contactX = Number.isFinite(Number(collision.x))
            ? Number(collision.x)
            : Number(collision.contactX) - moveDirection * enemy.width * 0.5;
        const travelToContact = Math.min(committedBudget, Math.max(0, Math.abs(contactX - previousX)));
        enemy.facing = moveDirection;
        enemy.currentTransform.x = contactX;
        if (!stride) {
            enemy.groundVelocityX = 0;
            return travelToContact;
        }
        enemy.groundStride = stride;
        enemy.currentTransform.x = stride.startX;
        enemy.currentTransform.y = stride.startY;
        const strideBudget = Math.max(0, committedBudget - travelToContact);
        if (strideBudget <= 0.000001) return travelToContact;
        const advanced = advanceCharacterEnemyGroundStride(state, enemy, moveDirection * strideBudget);
        const moved = travelToContact + (advanced.handled ? advanced.consumed : 0);
        if (moved > 0 && dt > 0) enemy.groundVelocityX = moveDirection * (moved / dt);
        return moved;
    }

    const support = findCharacterEnemyWalkingSupport(state, enemy, candidateX, moveDirection);
    const allowedSupports = Array.isArray(allowedNavigationSupports)
        ? allowedNavigationSupports
        : (allowedNavigationSupports ? [allowedNavigationSupports] : []);
    const explicitTraversalSupport = support && allowedSupports.some((navigationSupport) =>
        characterEnemyWalkingSupportMatchesNavigationSupport(support, navigationSupport, candidateX)
    );
    if (support && !explicitTraversalSupport && !characterEnemyWalkingSupportIsContinuation(state, enemy, support)) {
        // A nearby but unrelated surface is not an unsupported fall. Refuse the
        // attempted ground motion in place so a committed step can report a real
        // block instead of falling through bookkeeping ambiguity.
        enemy.groundVelocityX = 0;
        return 0;
    }
    if (!support) {
        if (!allowUnsupportedFall) {
            enemy.groundVelocityX = 0;
            return 0;
        }
        const moved = Math.abs(candidateX - previousX);
        enemy.facing = moveDirection;
        enemy.currentTransform.x = candidateX;
        beginCharacterEnemyUnsupportedFall(enemy, controlledVelocityX);
        return moved;
    }

    const moved = Math.abs(candidateX - previousX);
    enemy.facing = moveDirection;
    enemy.currentTransform.x = candidateX;
    enemy.currentTransform.y = support.y;
    setCharacterEnemyGroundSupportIdentity(state, enemy, support);
    enemy.groundVelocityX = controlledVelocityX;
    return moved;
}

function characterEnemyAuthoredScale(enemy) {
    return normalizeEnemyScale(enemy?.enemyScale ?? enemy?.scale, 1);
}

function characterEnemyMeleeHitRange(enemy) {
    return Math.max(0, Number(enemy.meleeHitRange) || 0) * characterEnemyAuthoredScale(enemy);
}

function characterEnemyCloseAttackRange(enemy) {
    return characterEnemyMeleeHitRange(enemy);
}

function characterEnemyLungeTargetDistance(enemy) {
    return Math.max(0, Number(enemy.lungeTargetDist) || 0) * characterEnemyAuthoredScale(enemy);
}

function characterEnemyHasLungeAttack(enemy) {
    const lungeMin = Math.max(characterEnemyCloseAttackRange(enemy), Math.max(0, Number(enemy.lungeRangeMin) || 0));
    const lungeMax = Math.max(0, Number(enemy.lungeRangeMax) || 0);
    return enemy.attackMode !== "projectile"
        && enemy.locomotion !== "flying"
        && lungeMax > 0
        && lungeMax + 0.001 >= lungeMin
        && Math.max(0, Number(enemy.lungeSpeed) || 0) > 0
        && Math.max(0, Number(enemy.lungeTargetDist) || 0) > 0;
}

function characterEnemyNearestMeleeAttackReadyX(enemy, playerX, fromX) {
    const closeRange = characterEnemyCloseAttackRange(enemy);
    const candidates = [clamp(fromX, playerX - closeRange, playerX + closeRange)];
    if (characterEnemyHasLungeAttack(enemy)) {
        const lungeMin = Math.max(closeRange, Math.max(0, Number(enemy.lungeRangeMin) || 0));
        const lungeMax = Math.max(lungeMin, Math.max(0, Number(enemy.lungeRangeMax) || 0));
        candidates.push(
            clamp(fromX, playerX - lungeMax, playerX - lungeMin),
            clamp(fromX, playerX + lungeMin, playerX + lungeMax)
        );
    }
    return candidates.reduce((best, candidate) =>
        Math.abs(candidate - fromX) < Math.abs(best - fromX) ? candidate : best
    );
}

function characterEnemyLungePathClear(state, enemy, targetX, origin = null) {
    const startX = finiteNumberOr(origin?.x, enemy.currentTransform.x);
    const startY = finiteNumberOr(origin?.y, enemy.currentTransform.y);
    const dx = targetX - startX;
    if (Math.abs(dx) <= 0.001) return true;
    const direction = dx < 0 ? -1 : 1;
    const probe = {
        ...enemy,
        currentTransform: { ...enemy.currentTransform, x: startX, y: startY },
        previousTransform: { ...(enemy.previousTransform || enemy.currentTransform), x: startX, y: startY },
        presentationTransform: { ...(enemy.presentationTransform || enemy.currentTransform), x: startX, y: startY }
    };
    const step = Math.max(4, Math.min(10, Math.max(1, Number(enemy.width) || 1) * 0.12));
    let remaining = Math.abs(dx);
    let guard = 0;
    while (remaining > 0.001 && guard < 512) {
        guard += 1;
        const advance = Math.min(step, remaining);
        const candidateX = probe.currentTransform.x + direction * advance;
        const support = findCharacterEnemyWalkingSupport(state, probe, candidateX, direction);
        if (!support || characterEnemyBodyBlockedAt(state, probe, candidateX, support.y, { groundSlope: support.slope })) {
            return false;
        }
        if (Math.abs(support.y - probe.currentTransform.y) > Math.max(
            Number(enemy.maxDropDistance) || 0,
            Number(enemy.maxStepHeight) || 0,
            4
        ) + 0.001) {
            return false;
        }
        probe.currentTransform.x = candidateX;
        probe.currentTransform.y = support.y;
        remaining -= advance;
    }
    return remaining <= 0.001;
}

function characterEnemyCanStartMeleeAttackFromPoint(state, enemy, point) {
    if (!playerIsAvailableCombatTarget(state)) return false;
    const player = state.player;
    const horizontalDistance = Math.abs(player.currentTransform.x - point.x);
    const enemyCenterY = point.y - enemy.height * 0.55;
    const playerCenterY = player.currentTransform.y - player.height * 0.5;
    if (Math.abs(playerCenterY - enemyCenterY) > Math.max(1, Number(enemy.attackVerticalRange) || 1)) {
        return false;
    }

    const closeAttackRange = characterEnemyCloseAttackRange(enemy);
    if (horizontalDistance <= closeAttackRange) {
        return !characterEnemyAttackBlockedFromPoint(state, enemy, point.x, point.y);
    }

    if (!characterEnemyHasLungeAttack(enemy)) {
        return false;
    }

    const lungeMin = Math.max(closeAttackRange, Number(enemy.lungeRangeMin) || 0);
    const lungeMax = Math.max(0, Number(enemy.lungeRangeMax) || 0);
    if (lungeMax + 0.001 < lungeMin
        || horizontalDistance + 0.001 < lungeMin
        || horizontalDistance - 0.001 > lungeMax) {
        return false;
    }
    const facing = player.currentTransform.x < point.x ? -1 : 1;
    const targetX = player.currentTransform.x - facing * characterEnemyLungeTargetDistance(enemy);
    if ((targetX - point.x) * facing <= 0.001) return false;
    return characterEnemyLungePathClear(state, enemy, targetX, point);
}

function attackAuthoredImpactTime(enemy, duration) {
    const firstHandoff = Array.isArray(enemy.attackHandoffs) && enemy.attackHandoffs.length
        ? enemy.attackHandoffs[0]
        : null;
    return clamp(finiteNumberOr(firstHandoff?.releaseTime, enemy.attackHitTime), 0, Math.max(FIXED_DT, duration));
}

function attackVisualElapsed(enemy, realElapsed, authoredDuration) {
    if (enemy.attackLungeActive !== true
        || enemy.attackLungeStarted !== true
        || (Number(enemy.attackHandoffDelay) || 0) <= 0) {
        return clamp(realElapsed, 0, authoredDuration);
    }
    const holdStart = clamp(Number(enemy.attackLungeStartTime) || 0, 0, authoredDuration);
    const holdEnd = Math.max(holdStart, Number(enemy.attackLungeImpactTime) || holdStart);
    if (realElapsed <= holdStart + 0.000001) return clamp(realElapsed, 0, authoredDuration);
    if (realElapsed <= holdEnd + 0.000001) return holdStart;
    return clamp(realElapsed - (Number(enemy.attackHandoffDelay) || 0), 0, authoredDuration);
}

function moveCharacterEnemyLungeToward(state, enemy, targetX, speed, dt) {
    if (!(speed > 0) || !(dt > 0)) return 0;
    const maxStep = Math.max(4, Math.min(10, Math.max(1, Number(enemy.width) || 1) * 0.12));
    let remainingDt = dt;
    let movedTotal = 0;
    let guard = 0;
    while (remainingDt > 0.000001 && guard < 512) {
        guard += 1;
        const remainingDistance = Math.abs(targetX - enemy.currentTransform.x);
        if (remainingDistance <= 0.0001) break;
        const stepDistance = Math.min(remainingDistance, speed * remainingDt, maxStep);
        if (stepDistance <= 0.000001) break;
        const stepDt = stepDistance / speed;
        const lungeDirection = targetX < enemy.currentTransform.x ? -1 : 1;
        enemy.groundVelocityX = lungeDirection * speed;
        const moved = moveCharacterEnemyToward(state, enemy, targetX, speed, stepDt, 0, false);
        movedTotal += moved;
        remainingDt = Math.max(0, remainingDt - stepDt);
        if (moved + 0.001 < stepDistance) break;
    }
    if (Math.abs(targetX - enemy.currentTransform.x) <= 0.001) {
        // A committed lunge is an explicit manoeuvre with a locked physical end
        // point. Reaching it consumes the burst velocity; do not let ordinary
        // ground friction coast the enemy beyond the locked target during the
        // held impact/follow-through frames.
        enemy.groundVelocityX = 0;
    }
    return movedTotal;
}

function advanceCharacterEnemyAttackLunge(state, enemy, previousElapsed, elapsed) {
    if (enemy.attackLungeActive !== true || enemy.locomotion === "flying" || enemy.airborne === true) {
        return 0;
    }
    const speed = Math.max(0, Number(enemy.lungeSpeed) || 0);
    if (!(speed > 0) || !playerIsAvailableCombatTarget(state)) {
        return 0;
    }

    const lungeStartTime = Math.max(0, Number(enemy.attackLungeStartTime) || 0);
    const attackRateScale = Math.max(0.0001, Number(enemy.attackLungeRateScale) || characterEnemyAttackRateScale(enemy, state.tuning));
    if (enemy.attackLungeStarted !== true) {
        if ((Number(elapsed) || 0) + 0.000001 < lungeStartTime) return 0;
        const targetX = state.player.currentTransform.x - enemy.facing * characterEnemyLungeTargetDistance(enemy);
        if ((targetX - enemy.currentTransform.x) * enemy.facing <= 0.001
            || !characterEnemyLungePathClear(state, enemy, targetX)) {
            const authoredDuration = Math.max(FIXED_DT, Number(enemy.attackDuration) || state.tuning.enemyDefaultAttackDuration || 0.44);
            clearCharacterEnemyAttackLunge(enemy);
            enemy.attackRuntimeDuration = authoredDuration;
            enemy.attackTimer = Math.max(0, authoredDuration - Math.max(0, Number(elapsed) || 0));
            return 0;
        }

        const authoredDuration = Math.max(FIXED_DT, Number(enemy.attackDuration) || state.tuning.enemyDefaultAttackDuration || 0.44);
        const travelTime = Math.abs(targetX - enemy.currentTransform.x) / speed;
        // attackTimer advances in attack-clock seconds. Convert the real world-space
        // travel duration into that clock so lungeSpeed remains true px/s even when
        // global melee attack-rate tuning changes wind-up/follow-through speed.
        const handoffDelay = Math.max(0, travelTime * attackRateScale);
        const realImpact = lungeStartTime + handoffDelay;
        enemy.attackLungeTargetX = targetX;
        enemy.attackLungeImpactTime = realImpact;
        enemy.attackHandoffDelay = handoffDelay;
        enemy.attackRuntimeDuration = Math.max(authoredDuration, Number(enemy.attackRuntimeDuration) || authoredDuration) + handoffDelay;
        enemy.attackTimer = Math.max(0, Number(enemy.attackTimer) || 0) + handoffDelay;
        enemy.attackLungeStarted = true;
        addEvent(state, "ENEMY_LUNGE_STARTED", {
            enemyId: enemy.id,
            targetX: round(targetX),
            speed: round(speed)
        });
    }

    const targetX = Number(enemy.attackLungeTargetX);
    if (!Number.isFinite(targetX)) return 0;
    const activeStart = Math.max(Number(previousElapsed) || 0, lungeStartTime);
    const activeEnd = Math.min(Number(elapsed) || 0, Number(enemy.attackLungeImpactTime) || 0);
    const lungeAttackDt = Math.max(0, activeEnd - activeStart);
    if (lungeAttackDt <= 0.000001) return 0;
    const lungeRealDt = lungeAttackDt / attackRateScale;
    const remainingBefore = Math.abs(targetX - enemy.currentTransform.x);
    const expectedMove = Math.min(remainingBefore, speed * lungeRealDt);
    const moved = moveCharacterEnemyLungeToward(state, enemy, targetX, speed, lungeRealDt);

    // Once an in-flight burst physically reaches a wall, ledge, or other newly
    // introduced obstruction, that position is the end of the lunge. Do not hold
    // the impact pose waiting for the travel time to the now-unreachable target,
    // and do not resume toward it if the obstruction later disappears.
    if (expectedMove > 0.001
        && moved + 0.001 < expectedMove
        && Math.abs(targetX - enemy.currentTransform.x) > 0.001) {
        const oldDelay = Math.max(0, Number(enemy.attackHandoffDelay) || 0);
        const consumedDelay = Math.max(0, activeStart - lungeStartTime)
            + (moved / speed) * attackRateScale;
        const newDelay = Math.min(oldDelay, consumedDelay);
        const unusedDelay = Math.max(0, oldDelay - newDelay);
        enemy.attackHandoffDelay = newDelay;
        enemy.attackLungeImpactTime = lungeStartTime + newDelay;
        enemy.attackLungeTargetX = enemy.currentTransform.x;
        enemy.attackRuntimeDuration = Math.max(0, Number(enemy.attackRuntimeDuration) || 0) - unusedDelay;
        enemy.attackTimer = Math.max(0, Number(enemy.attackTimer) || 0) - unusedDelay;
        addEvent(state, "ENEMY_LUNGE_BLOCKED", {
            enemyId: enemy.id,
            x: round(enemy.currentTransform.x)
        });
    }
    return moved;
}

function clearCharacterEnemyAttackLunge(enemy) {
    enemy.attackLungeActive = false;
    enemy.attackLungeStarted = false;
    enemy.attackLungeTargetX = null;
    enemy.attackLungeStartTime = 0;
    enemy.attackLungeImpactTime = 0;
    enemy.attackLungeVisualLaunchTime = 0;
    enemy.attackLungeRateScale = 1;
    enemy.attackHandoffDelay = 0;
    enemy.attackRuntimeDuration = 0;
}

function startCharacterEnemyAttack(state, enemy) {
    const dx = state.player.currentTransform.x - enemy.currentTransform.x;
    if (Math.abs(dx) > 0.001) {
        enemy.facing = dx < 0 ? -1 : 1;
    }
    clearCharacterEnemyAttackLunge(enemy);

    const authoredDuration = Math.max(
        FIXED_DT,
        Number(enemy.attackDuration) > 0
            ? Number(enemy.attackDuration)
            : state.tuning.enemyDefaultAttackDuration
    );
    enemy.attackHitTime = Math.max(
        0,
        Number(enemy.projectileReleaseTime) > 0
            ? Number(enemy.projectileReleaseTime)
            : (Number(enemy.attackHitTime) || 0)
    );

    if (enemy.attackMode !== "projectile" && characterEnemyHasLungeAttack(enemy)) {
        const horizontalDistance = Math.abs(dx);
        const closeAttackRange = characterEnemyCloseAttackRange(enemy);
        const lungeMin = Math.max(closeAttackRange, Number(enemy.lungeRangeMin) || 0);
        const lungeMax = Math.max(0, Number(enemy.lungeRangeMax) || 0);
        if (lungeMax + 0.001 >= lungeMin
            && horizontalDistance > closeAttackRange + 0.001
            && horizontalDistance + 0.001 >= lungeMin
            && horizontalDistance - 0.001 <= lungeMax) {
            const targetX = state.player.currentTransform.x - enemy.facing * characterEnemyLungeTargetDistance(enemy);
            if ((targetX - enemy.currentTransform.x) * enemy.facing > 0.001
                && characterEnemyLungePathClear(state, enemy, targetX)) {
                const authoredImpact = attackAuthoredImpactTime(enemy, authoredDuration);
                enemy.attackLungeActive = true;
                enemy.attackLungeTargetX = null;
                enemy.attackLungeStartTime = authoredImpact;
                enemy.attackLungeImpactTime = authoredImpact;
                enemy.attackLungeVisualLaunchTime = authoredImpact;
                enemy.attackLungeRateScale = characterEnemyAttackRateScale(enemy, state.tuning);
                enemy.attackHandoffDelay = 0;
                enemy.attackRuntimeDuration = authoredDuration;
            }
        }
    }

    enemy.combatState = ENEMY_COMBAT_STATE.ATTACKING;
    enemy.movementPhase = "attack";
    enemy.attackRuntimeDuration = Math.max(authoredDuration, Number(enemy.attackRuntimeDuration) || 0);
    enemy.attackTimer = enemy.attackRuntimeDuration;
    enemy.attackHitApplied = false;
    enemy.nextAttackHandoffIndex = 0;
    setCharacterEnemyAnimation(enemy, "attack");
    enemy.animationClock.current = 0;
    addEvent(state, "ENEMY_ATTACK_STARTED", {
        enemyId: enemy.id,
        characterId: enemy.characterId,
        damage: round(enemy.attackMode === "projectile" ? enemy.projectileDamage : enemy.attackDamage),
        attackMode: enemy.attackMode,
        lunge: enemy.attackLungeActive === true,
        facing: enemy.facing
    });
}

function enemyAttackHandoffPoint(enemy, handoff) {
    const direction = Number(enemy.facing) < 0 ? -1 : 1;
    if (handoff?.hasOriginLocal) {
        const artworkOrigin = characterEnemyArtworkOriginAt(
            enemy,
            enemy.currentTransform.x,
            enemy.currentTransform.y,
            enemy.facing
        );
        const authoredScale = Math.max(0.0001, Number(handoff.rigScale) || 1)
            * Math.max(0.05, Number(enemy.currentTransform?.scaleX) || 1);
        return {
            x: artworkOrigin.x + finiteNumberOr(handoff.originLocalX, 0) * authoredScale * direction,
            y: artworkOrigin.y + finiteNumberOr(handoff.originLocalY, 0) * authoredScale
        };
    }
    return {
        x: enemy.currentTransform.x + direction * Math.max(8, enemy.width * 0.28),
        y: enemy.currentTransform.y - enemy.height * 0.5
    };
}

function applyCharacterEnemyAttackHandoff(enemy, handoff) {
    if (!handoff || typeof handoff !== "object") return;
    enemy.attackHitTime = Math.max(0, finiteNumberOr(handoff.releaseTime, enemy.attackHitTime));
    if (handoff.detach === true) {
        enemy.projectileReleaseTime = enemy.attackHitTime;
        enemy.projectilePartName = handoff.partName ? String(handoff.partName) : enemy.projectilePartName;
        enemy.projectileFrameId = handoff.frameId ? String(handoff.frameId) : enemy.projectileFrameId;
        enemy.projectileOriginLocalX = finiteNumberOr(handoff.originLocalX, 0);
        enemy.projectileOriginLocalY = finiteNumberOr(handoff.originLocalY, 0);
        enemy.hasProjectileOriginLocal = handoff.hasOriginLocal === true;
        enemy.projectileRigScale = Math.max(0.0001, finiteNumberOr(handoff.rigScale, enemy.projectileRigScale));
    }
}

function applyCharacterEnemyMeleeHandoff(state, enemy, handoff) {
    {
        const hitRange = characterEnemyMeleeHitRange(enemy);
        const handoffPoint = enemyAttackHandoffPoint(enemy, handoff);
        const direction = enemy.facing < 0 ? -1 : 1;
        // Positive meleeHitRange uses the same horizontal reference as lunge
        // distances: the enemy's grounded base position. The authored handoff
        // still supplies the strike height and timing, while the horizontal
        // segment reaches from the base out to the authored visible reach.
        const strikeStart = { x: enemy.currentTransform.x, y: handoffPoint.y };
        const strikeEnd = { x: enemy.currentTransform.x + direction * hitRange, y: handoffPoint.y };
        const strikeTolerance = Math.max(4, Math.min(10, Math.max(1, Number(enemy.height) || 1) * 0.05));
        const playerRect = getPlayerRect(state);
        const strikePlayerRect = {
            x: playerRect.x - strikeTolerance,
            y: playerRect.y - strikeTolerance,
            w: playerRect.w + strikeTolerance * 2,
            h: playerRect.h + strikeTolerance * 2
        };
        const playerHit = playerIsAvailableCombatTarget(state)
            ? segmentRectIntersection(strikeStart, strikeEnd, strikePlayerRect)
            : null;
        let blocked = false;
        if (playerHit) {
            const hitPoint = {
                x: strikeStart.x + (strikeEnd.x - strikeStart.x) * playerHit.t,
                y: strikeStart.y + (strikeEnd.y - strikeStart.y) * playerHit.t
            };
            blocked = characterEnemyAttackSegmentBlockedByTerrain(state, strikeStart, hitPoint);
        }
        if (!playerHit || blocked) {
            addEvent(state, "ENEMY_ATTACK_MISSED", {
                enemyId: enemy.id,
                handoffPartName: handoff?.partName || null,
                x: round(strikeEnd.x),
                y: round(strikeEnd.y),
                reach: round(hitRange)
            });
            return false;
        }
    }
    const result = damagePlayer(state, enemy.attackDamage, enemy.id, {
        knockbackX: enemy.facing * enemy.attackKnockbackX,
        knockbackY: enemy.attackKnockbackY
    });
    addEvent(state, result.damage > 0 ? "ENEMY_ATTACK_HIT" : "ENEMY_ATTACK_BLOCKED", {
        enemyId: enemy.id,
        damage: round(result.damage),
        health: round(result.health)
    });
    return result.damage > 0;
}

function updateCharacterEnemyAttack(state, enemy, dt) {
    const authoredDuration = Math.max(FIXED_DT, Number(enemy.attackDuration) || state.tuning.enemyDefaultAttackDuration || 0.44);
    const runtimeDuration = Math.max(authoredDuration, Number(enemy.attackRuntimeDuration) || authoredDuration);
    const attackDt = Math.max(0, Number(dt) || 0) * characterEnemyAttackRateScale(enemy, state.tuning);
    const previousElapsed = runtimeDuration - Math.max(0, Number(enemy.attackTimer) || 0);
    enemy.attackTimer = Math.max(0, (Number(enemy.attackTimer) || 0) - attackDt);
    const elapsed = runtimeDuration - enemy.attackTimer;
    const hitTime = clamp(Number(enemy.attackHitTime) || 0, 0, authoredDuration);

    if (enemy.attackLungeActive !== true) {
        enemy.facing = (Number(enemy.panicTimer) || 0) > 0
            ? (Math.cos(Number(enemy.panicAttackAngle) || 0) < 0 ? -1 : 1)
            : (state.player.currentTransform.x < enemy.currentTransform.x ? -1 : 1);
    }
    enemy.combatState = ENEMY_COMBAT_STATE.ATTACKING;
    enemy.movementPhase = enemy.attackLungeStarted === true ? "lunge" : "attack";
    setCharacterEnemyAnimation(enemy, "attack");
    const lungeMoved = advanceCharacterEnemyAttackLunge(state, enemy, previousElapsed, elapsed);
    if (enemy.airborne !== true && lungeMoved <= 0.000001) {
        updateCharacterEnemyPassiveGroundMotion(state, enemy, dt);
    }
    enemy.animationClock.current = attackVisualElapsed(enemy, elapsed, authoredDuration);

    const handoffs = Array.isArray(enemy.attackHandoffs) && enemy.attackHandoffs.length
        ? enemy.attackHandoffs
        : [{
            releaseTime: hitTime,
            detach: enemy.attackMode === "projectile",
            partName: enemy.projectilePartName,
            frameId: enemy.projectileFrameId,
            originLocalX: enemy.projectileOriginLocalX,
            originLocalY: enemy.projectileOriginLocalY,
            hasOriginLocal: enemy.hasProjectileOriginLocal === true || (
                enemy.hasProjectileOriginLocal === undefined
                && enemy.projectileOriginLocalX !== null && enemy.projectileOriginLocalX !== undefined
                && enemy.projectileOriginLocalY !== null && enemy.projectileOriginLocalY !== undefined
            ),
            rigScale: enemy.projectileRigScale
        }];
    let handoffIndex = clamp(Math.round(finiteNumberOr(enemy.nextAttackHandoffIndex, 0)), 0, handoffs.length);
    while (handoffIndex < handoffs.length) {
        const handoff = handoffs[handoffIndex];
        const authoredReleaseTime = clamp(finiteNumberOr(handoff.releaseTime, hitTime), 0, authoredDuration);
        const releaseTime = authoredReleaseTime
            + (authoredReleaseTime + 0.000001 >= Math.max(0, Number(enemy.attackLungeStartTime) || 0)
                ? Math.max(0, Number(enemy.attackHandoffDelay) || 0)
                : 0);
        if (!(previousElapsed <= releaseTime + 0.000001 && elapsed + 0.000001 >= releaseTime)) {
            break;
        }
        applyCharacterEnemyAttackHandoff(enemy, handoff);
        if (enemy.attackMode === "projectile") {
            const projectiles = ((Number(enemy.panicTimer) || 0) > 0 || characterEnemyCanUseProjectile(state, enemy))
                ? launchCharacterEnemyProjectileVolley(state, enemy)
                : [];
            if (projectiles.length > 0) {
                for (const projectile of projectiles) {
                    addEvent(state, "ENEMY_PROJECTILE_FIRED", {
                        enemyId: enemy.id,
                        characterId: enemy.characterId,
                        projectileId: projectile.id,
                        projectileKind: projectile.projectileKind,
                        projectilePartName: projectile.projectilePartName,
                        launchType: projectile.launchType,
                        volleyId: projectile.volleyId,
                        volleyIndex: projectile.volleyIndex,
                        volleyCount: projectile.volleyCount,
                        volleyAngleOffsetDegrees: round(projectile.volleyAngleOffsetDegrees),
                        x: round(projectile.currentTransform.x),
                        y: round(projectile.currentTransform.y)
                    });
                }
            } else {
                addEvent(state, "ENEMY_ATTACK_MISSED", { enemyId: enemy.id, reason: "noClearProjectileShot" });
            }
        } else {
            applyCharacterEnemyMeleeHandoff(state, enemy, handoff);
        }
        handoffIndex += 1;
        enemy.nextAttackHandoffIndex = handoffIndex;
    }
    enemy.attackHitApplied = handoffIndex >= handoffs.length;

    if (enemy.attackTimer <= 0) {
        const completedLunge = enemy.attackLungeStarted === true;
        enemy.combatState = ENEMY_COMBAT_STATE.ALIVE;
        enemy.movementPhase = "idle";
        enemy.phaseTimer = 0;
        enemy.attackCooldownTimer = Math.max(0, Number(enemy.attackCooldown) || 0);
        if (completedLunge) {
            // A committed lunge changes the enemy's world position without
            // advancing its pre-attack route. Discard that stale plan so the
            // cooldown tick replans from the actual post-lunge position.
            clearCharacterEnemyNavigationPlan(enemy);
        }
        clearCharacterEnemyAttackLunge(enemy);
        enemy.attackHitApplied = false;
        enemy.nextAttackHandoffIndex = 0;
        setCharacterEnemyAnimation(enemy, "idle");
        addEvent(state, "ENEMY_ATTACK_ENDED", { enemyId: enemy.id });
    }
    syncCharacterEnemyTarget(state, enemy);
}


function characterEnemyAttackBlockedFromPoint(state, enemy, originX, originY) {
    const player = state.player;
    const start = {
        x: originX,
        y: originY - enemy.height * 0.5
    };
    const end = {
        x: player.currentTransform.x,
        y: player.currentTransform.y - player.height * 0.5
    };

    const terrainQueryBounds = {
        minX: Math.min(start.x, end.x),
        minY: Math.min(start.y, end.y),
        maxX: Math.max(start.x, end.x),
        maxY: Math.max(start.y, end.y)
    };
    for (const solid of queryWorldSolids(state.world, terrainQueryBounds)) {
        if (segmentRectIntersection(start, end, solid)) {
            return true;
        }
    }
    for (const segment of queryWorldSegments(state.world, terrainQueryBounds)) {
        if (!isAreaBlockingSegmentKind(segment.kind) && segment.kind !== "walkable") {
            continue;
        }
        if (segmentSegmentIntersection(start, end, { x: segment.x1, y: segment.y1 }, { x: segment.x2, y: segment.y2 })) {
            return true;
        }
    }
    for (const polygon of queryWorldCollisionPolygons(state.world, terrainQueryBounds)) {
        if (!isAreaBlockingSegmentKind(polygon.kind)) {
            continue;
        }
        if (pointInPolygon(start, polygon) || pointInPolygon(end, polygon) || firstSegmentPolygonBoundaryIntersection(start, end, polygon)) {
            return true;
        }
    }
    return false;
}

function characterEnemySupportSlope(support) {
    const dx = Number(support?.x2) - Number(support?.x1);
    return Math.abs(dx) > 0.001
        ? (Number(support?.y2) - Number(support?.y1)) / dx
        : 0;
}

function characterEnemyNavigationOptions(enemy, state = null) {
    return {
        bodyWidth: Math.max(8, Number(enemy.width) || 48),
        bodyHeight: Math.max(24, Number(enemy.height) || 120),
        maxStepHeight: Math.max(0, Number(enemy.maxStepHeight) || 0),
        maxStepGap: Math.max(10, Math.min(28, Number(enemy.width) * 0.32 || 18)),
        jumpHeight: Math.max(0, Number(enemy.jumpHeight) || 0),
        gravity: Math.max(1, Number(enemy.jumpGravity) || 1),
        runSpeed: Math.max(1, Number(enemy.runSpeed) || 1),
        groundAcceleration: Math.max(1, Number(enemy.runAcceleration) || 1),
        maxFallDistance: Math.max(0, Number(enemy.maxFallDistance) || 0),
        edgeInset: Math.max(6, Number(enemy.width) * 0.22 || 10),
        bodyClearance: Math.max(10, Number(enemy.width) * 0.34 || 12)
    };
}

function characterEnemyNavigationAdjustedEdge(state, edge, graph = null) {
    let adjustedCost = Math.max(0, Number(edge?.cost) || 0);
    const blockers = state.world?.navigationBlockers || [];
    for (const blockerId of edge?.blockerIds || []) {
        const blocker = blockers.find((item) => item.id === blockerId);
        const stateValue = state.world?.entityStates?.[blockerId] ?? blocker?.state ?? blocker?.closedState ?? "closed";
        const openStates = Array.isArray(blocker?.openStates) ? blocker.openStates : ["open", "opened", "destroyed", "disabled"];
        if (!openStates.includes(String(stateValue))) {
            return null;
        }
    }
    for (const rule of graph?.dynamicCostRules || []) {
        const matchesEdge = Array.isArray(rule.edgeIds) && rule.edgeIds.includes(edge.id);
        const matchesBlocker = rule.blockerId && (edge?.blockerIds || []).includes(rule.blockerId);
        if (!matchesEdge && !matchesBlocker) {
            continue;
        }
        const blockerId = String(rule.blockerId || "");
        const blocker = blockers.find((item) => item.id === blockerId);
        const stateValue = state.world?.entityStates?.[blockerId] ?? blocker?.state ?? rule.defaultState ?? "closed";
        const activeStates = Array.isArray(rule.activeStates) ? rule.activeStates : ["closed", "locked", "intact", "active"];
        if (!activeStates.includes(String(stateValue))) {
            continue;
        }
        if (rule.disabledWhenActive === true) {
            return null;
        }
        adjustedCost += Math.max(0, Number(rule.penalty) || 0);
    }
    return adjustedCost === Number(edge.cost) ? edge : { ...edge, cost: adjustedCost };
}

function staticEnemyNavigationBundle(state, options) {
    const world = state.world;
    const solids = world?.solids || [];
    const segments = world?.segments || [];
    const polygons = world?.collisionPolygons || [];
    let cache = STATIC_ENEMY_NAVIGATION_CACHE.get(world);
    if (!cache
        || cache.solids !== solids
        || cache.segments !== segments
        || cache.polygons !== polygons
        || cache.solidCount !== solids.length
        || cache.segmentCount !== segments.length
        || cache.polygonCount !== polygons.length) {
        cache = {
            solids,
            segments,
            polygons,
            solidCount: solids.length,
            segmentCount: segments.length,
            polygonCount: polygons.length,
            profiles: new Map()
        };
        STATIC_ENEMY_NAVIGATION_CACHE.set(world, cache);
    }

    const profileKey = enemyNavigationProfileKey(options);
    const cached = cache.profiles.get(profileKey);
    if (cached) return cached;

    const liveSupports = buildEnemyNavigationSupports(world, options);
    const supportSignature = enemyNavigationSupportsSignature(liveSupports);
    const candidateGraph = findBakedEnemyNavigationGraph(world?.navigationGraphs, options);
    const candidateBuildMethod = String(candidateGraph?.build?.method || "");
    const bakedGraph = candidateGraph?.supportSignature === supportSignature
        && candidateBuildMethod === ENEMY_NAVIGATION_GRAPH_BUILD_METHOD
        ? candidateGraph
        : null;
    const staticSupports = bakedGraph?.supports?.length ? bakedGraph.supports : liveSupports;
    const enforceAdvisoryHeuristics = bakedGraph?.build?.enforceAdvisoryHeuristics === true;
    const enforcedAdvisoryHeuristics = Array.isArray(bakedGraph?.build?.enforcedAdvisoryHeuristics)
        ? bakedGraph.build.enforcedAdvisoryHeuristics
        : null;
    let staticEdgeMap = bakedGraph?.edges?.length
        ? enemyNavigationEdgeMapFromFlat(bakedGraph.edges, staticSupports)
        : buildEnemyNavigationEdges(staticSupports, { ...options, world });
    if (enforceAdvisoryHeuristics) {
        staticEdgeMap = new Map([...staticEdgeMap.entries()].map(([supportId, edges]) => [
            supportId,
            edges.filter((edge) => enemyNavigationEdgeRuntimeAllowed(edge, {
                enforceAdvisoryHeuristics: true,
                enforcedAdvisoryHeuristics
            }))
        ]));
    }
    const bundle = { staticSupports, staticEdgeMap, bakedGraph };
    cache.profiles.set(profileKey, bundle);
    return bundle;
}

function characterEnemyNavigationContext(state, enemy) {
    const options = characterEnemyNavigationOptions(enemy, state);
    const { staticSupports: supports, staticEdgeMap: rawEdgeMap, bakedGraph } = staticEnemyNavigationBundle(state, options);
    let edgeMap = rawEdgeMap;
    if ((state.world?.navigationBlockers?.length || 0) > 0 || (bakedGraph?.dynamicCostRules?.length || 0) > 0) {
        edgeMap = new Map();
        for (const support of supports) {
            edgeMap.set(support.id, (rawEdgeMap.get(support.id) || [])
                .map((edge) => characterEnemyNavigationAdjustedEdge(state, edge, bakedGraph))
                .filter((edge) => edge && enemyNavigationTraversalAllowedFromSupport(edge, support, supports, options)));
        }
    } else {
        const cached = CHARACTER_ENEMY_TRAVERSAL_EDGE_CACHE.get(rawEdgeMap);
        if (cached?.supports === supports) {
            edgeMap = cached.edgeMap;
        } else {
            edgeMap = new Map();
            for (const support of supports) {
                edgeMap.set(support.id, (rawEdgeMap.get(support.id) || [])
                    .filter((edge) => enemyNavigationTraversalAllowedFromSupport(edge, support, supports, options)));
            }
            CHARACTER_ENEMY_TRAVERSAL_EDGE_CACHE.set(rawEdgeMap, { supports, edgeMap });
        }
    }
    const ridingMovingPlatform = Boolean(
        enemy.supportId && movingPlatformForCollisionId(state, enemy.supportId)
    );
    const strideOwnedSupport = enemy.groundStride?.active && enemy.currentSupportId
        ? navigationSupportById(supports, enemy.currentSupportId)
        : null;
    const current = ridingMovingPlatform
        ? null
        : strideOwnedSupport
            ? { support: strideOwnedSupport, x: enemy.currentTransform.x, y: enemy.currentTransform.y, delta: 0, score: 0 }
            : findEnemyNavigationSupport(supports, enemy.currentTransform.x, enemy.currentTransform.y, {
                maxRise: Math.max(8, Number(enemy.maxStepHeight) || 0),
                maxDrop: Math.max(12, Number(enemy.maxDropDistance) || 0),
                width: enemy.width,
                sampleHalfWidthFactor: enemy.currentSupportId ? 0.48 : 0.22,
                preferredSupportId: enemy.currentSupportId
            });
    if (ridingMovingPlatform) {
        enemy.currentSupportId = null;
    } else if (current) {
        enemy.currentSupportId = current.support.id;
        if (!enemy.homeSupportId) {
            enemy.homeSupportId = current.support.id;
            enemy.spawnY = current.y;
        }
    }
    enemy.navigationGraphSource = bakedGraph ? "baked" : "runtime";
    enemy.navigationGraphId = bakedGraph?.id || null;
    edgeMap = characterEnemyNavigationReliabilityAdjustedEdgeMap(state, enemy, edgeMap);
    return { supports, current, edgeMap, bakedGraph };
}

const CHARACTER_ENEMY_TRANSITION_RETRY_PENALTY = 50000;
const CHARACTER_ENEMY_TRANSITION_BLOCK_SECONDS = 8;

function characterEnemyNavigationTransitionKey(edge) {
    // Reliability is attached to the logical directed manoeuvre, not to one
    // sampled ballistic arc. Atomic graph construction can retain several
    // launch/landing samples for the same jump; letting each sample own an
    // independent strike counter would allow an A->B failure loop to cycle
    // through near-identical arcs forever. Keep manoeuvre types separate so a
    // failed step can still fall back to a jump (or a failed jump to a drop).
    return [
        String(edge?.type || "edge"),
        String(edge?.from || ""),
        String(edge?.to || "")
    ].join("|");
}

function characterEnemyNavigationTransitionFailureMap(enemy) {
    if (!enemy.navigationTransitionFailures || typeof enemy.navigationTransitionFailures !== "object" || Array.isArray(enemy.navigationTransitionFailures)) {
        enemy.navigationTransitionFailures = {};
    }
    return enemy.navigationTransitionFailures;
}

function characterEnemyNavigationTransitionFailureRecord(enemy, edge) {
    const key = characterEnemyNavigationTransitionKey(edge);
    return characterEnemyNavigationTransitionFailureMap(enemy)[key] || null;
}

function characterEnemyNavigationReliabilityAdjustedEdgeMap(state, enemy, edgeMap) {
    const failures = characterEnemyNavigationTransitionFailureMap(enemy);
    const keys = Object.keys(failures);
    if (!keys.length) return edgeMap;

    const now = Number(state.clock?.time) || 0;
    let changed = false;
    const adjusted = new Map();
    for (const [supportId, edges] of edgeMap?.entries?.() || []) {
        const nextEdges = [];
        for (const edge of edges || []) {
            const key = characterEnemyNavigationTransitionKey(edge);
            const record = failures[key];
            if (!record) {
                nextEdges.push(edge);
                continue;
            }

            let count = Math.max(0, Number(record.count) || 0);
            let blockedUntil = Math.max(0, Number(record.blockedUntil) || 0);
            if (count >= 2 && blockedUntil > now + 0.000001) {
                changed = true;
                continue;
            }
            if (count >= 2 && blockedUntil <= now + 0.000001) {
                // A blocked edge gets another chance eventually. Keep one strike
                // against it so the planner still prefers a clean alternative.
                count = 1;
                blockedUntil = 0;
                record.count = count;
                record.blockedUntil = blockedUntil;
            }
            if (count > 0) {
                changed = true;
                nextEdges.push({
                    ...edge,
                    cost: Math.max(0, Number(edge.cost) || 0) + CHARACTER_ENEMY_TRANSITION_RETRY_PENALTY * count
                });
            } else {
                nextEdges.push(edge);
            }
        }
        adjusted.set(supportId, nextEdges);
    }
    return changed ? adjusted : edgeMap;
}

function recordCharacterEnemyNavigationTransitionFailure(state, enemy, edge, actualSupportId = null, reason = "physical_failure") {
    if (!edge) return;
    const key = characterEnemyNavigationTransitionKey(edge);
    const failures = characterEnemyNavigationTransitionFailureMap(enemy);
    const previous = failures[key] || {};
    // Reliability belongs to this directed manoeuvre family, not to the immediately
    // preceding navigation action. In an A->B->A loop the enemy must traverse
    // A->B successfully before it can retry the bad B->C edge; that successful
    // edge must not erase the first B->C strike. Two clean failures of this same
    // manoeuvre count as two strikes even if physical recovery classifies the
    // wrong landing slightly differently. Only a successful traversal of this
    // manoeuvre resets its sequence.
    const expectedSupportId = String(edge.to || "") || null;
    const actual = actualSupportId ? String(actualSupportId) : null;
    const normalizedReason = String(reason || "physical_failure");
    const count = Math.max(0, Number(previous.count) || 0) + 1;
    const now = Number(state.clock?.time) || 0;
    failures[key] = {
        count,
        blockedUntil: count >= 2 ? now + CHARACTER_ENEMY_TRANSITION_BLOCK_SECONDS : 0,
        lastFailureTime: now,
        expectedSupportId,
        actualSupportId: actual,
        reason: normalizedReason
    };
    enemy.navigationLastFailedTransitionKey = key;
}

function recordCharacterEnemyNavigationTransitionSuccess(enemy, edge) {
    if (!edge) return;
    const key = characterEnemyNavigationTransitionKey(edge);
    const failures = characterEnemyNavigationTransitionFailureMap(enemy);
    if (Object.prototype.hasOwnProperty.call(failures, key)) delete failures[key];
    // Only proving this same directed edge works clears its reliability history.
    // Success elsewhere may simply be the route back to another retry.
    if (enemy.navigationLastFailedTransitionKey === key) enemy.navigationLastFailedTransitionKey = null;
}

function characterEnemyPlayerSupport(state, enemy, supports) {
    if (state.player.onGround && state.player.supportId && movingPlatformForCollisionId(state, state.player.supportId)) {
        return null;
    }
    return findEnemyNavigationSupport(supports, state.player.currentTransform.x, state.player.currentTransform.y, {
        maxRise: Math.max(40, Number(enemy.jumpHeight) || 0) + 80,
        maxDrop: Math.max(160, Number(enemy.maxFallDistance) || 0) + 160,
        width: state.player.width
    });
}

function characterEnemyRoute(state, enemy, supports, startSupportId, targetSupportId, edgeMap = null, targetX = null) {
    return planEnemyNavigationRoute(
        supports,
        startSupportId,
        targetSupportId,
        {
            ...characterEnemyNavigationOptions(enemy, state),
            edgeMap,
            startX: enemy.currentTransform.x,
            targetX
        }
    );
}

function characterEnemyRouteSearch(state, enemy, supports, startSupportId, edgeMap = null) {
    return planEnemyNavigationRoutesFrom(
        supports,
        startSupportId,
        {
            ...characterEnemyNavigationOptions(enemy, state),
            world: state.world,
            edgeMap,
            startX: enemy.currentTransform.x
        }
    );
}

function characterEnemyReadyToAttackFromCurrentPosition(state, enemy) {
    if (enemy.locomotion !== "flying" && enemy.airborne !== true && Math.abs(Number(enemy.groundVelocityX) || 0) > 0.05) {
        return false;
    }
    if (enemy.attackMode !== "projectile") {
        return characterEnemyCanStartMeleeAttackFromPoint(state, enemy, {
            x: enemy.currentTransform.x,
            y: enemy.currentTransform.y
        });
    }
    if (!characterEnemyCanUseProjectile(state, enemy)) {
        return false;
    }
    const horizontalDistance = Math.abs(state.player.currentTransform.x - enemy.currentTransform.x);
    return horizontalDistance >= Math.max(0, Number(enemy.preferredAttackMinRange) || 0);
}

function characterEnemyCanUseLocalGroundPursuit(state, enemy) {
    if (!state.player?.targetable) {
        return false;
    }

    // Exact support identity is the strongest possible same-floor proof. Do this
    // before the vertical-tolerance fallback: two actors can be far apart in Y
    // while standing on the same long authored incline, and a navigation-graph
    // failure must not make that continuous support look unreachable.
    const playerSupportId = String(state.player.supportId || "");
    const enemySupportId = String(enemy.supportId || "");
    const enemyNavigationSupportId = String(enemy.currentSupportId || "");
    if (playerSupportId && (playerSupportId === enemySupportId || playerSupportId === enemyNavigationSupportId)) {
        return true;
    }

    const automaticStepHeight = Math.max(0, enemy.height * AUTOMATIC_STEP_HEIGHT_RATIO);
    const verticalTolerance = Math.max(
        8,
        Number(enemy.maxStepHeight) || 0,
        automaticStepHeight
    );
    if (Math.abs((Number(state.player.currentTransform.y) || 0) - (Number(enemy.currentTransform.y) || 0)) > verticalTolerance + 2) {
        return false;
    }
    const playerGround = findCharacterEnemyGroundSupport(
        state,
        Number(state.player.currentTransform.x) || 0,
        Number(state.player.currentTransform.y) || 0,
        verticalTolerance + 2,
        verticalTolerance + 8,
        Math.max(8, Number(state.player.width) || enemy.width)
    );
    const enemyGround = findCharacterEnemyGroundSupport(
        state,
        Number(enemy.currentTransform.x) || 0,
        Number(enemy.currentTransform.y) || 0,
        verticalTolerance + 2,
        verticalTolerance + 8,
        enemy.width
    );
    if (!playerGround || !enemyGround) {
        return false;
    }
    return Math.abs(playerGround.y - enemyGround.y) <= verticalTolerance + 2;
}

function updateCharacterEnemyLocalGroundPursuit(state, enemy, dt) {
    if (!characterEnemyCanUseLocalGroundPursuit(state, enemy)) {
        return false;
    }
    const dx = (Number(state.player.currentTransform.x) || 0) - (Number(enemy.currentTransform.x) || 0);
    if (Math.abs(dx) > 0.001) {
        enemy.facing = dx < 0 ? -1 : 1;
    }

    const commitLocalPursuit = () => {
        enemy.engaged = true;
        enemy.alerted = true;
        enemy.aiState = "pursue";
        // A successful local move/attack proves that the current failure streak
        // has been recovered from. Do not carry stale graph failures into the
        // next decision and immediately fall back into unreachable glare.
        enemy.navigationFailureCount = 0;
        clearCharacterEnemyNavigationPlan(enemy);
        enemy.routeRepathTimer = Math.max(FIXED_DT, Number(enemy.routeRepathInterval) || FIXED_DT);
    };

    if (enemy.attackCooldownTimer <= 0 && characterEnemyReadyToAttackFromCurrentPosition(state, enemy)) {
        commitLocalPursuit();
        startCharacterEnemyAttack(state, enemy);
        return true;
    }

    const targetX = enemy.attackMode === "projectile"
        ? state.player.currentTransform.x
        : characterEnemyNearestMeleeAttackReadyX(enemy, state.player.currentTransform.x, enemy.currentTransform.x);
    const stopDistance = enemy.attackMode === "projectile"
        ? Math.max(4, Math.min(
            Math.max(1, Number(enemy.attackRange) || 1) * 0.72,
            Math.max(6, Math.abs(dx) - 1)
        ))
        : 0;
    if (enemy.attackMode !== "projectile" && Math.abs(targetX - enemy.currentTransform.x) <= 0.0001) {
        commitLocalPursuit();
        enemy.movementPhase = "position_for_attack";
        setCharacterEnemyAnimation(enemy, "idle");
        return true;
    }
    const speed = Math.max(1, characterEnemyRunSpeed(enemy, state.tuning));
    const moved = moveCharacterEnemyToward(state, enemy, targetX, speed, dt, stopDistance, true, null, false);
    if (moved <= 0) {
        const remainingToGoal = Math.max(0, Math.abs(targetX - enemy.currentTransform.x) - stopDistance);
        const settleDirection = targetX < enemy.currentTransform.x ? -1 : 1;
        const settleX = targetX - settleDirection * stopDistance;
        const settleSupport = remainingToGoal <= 2
            ? findCharacterEnemyWalkingSupport(state, enemy, settleX, settleDirection)
            : null;
        if (remainingToGoal <= 2 && settleSupport && Math.abs(Number(enemy.groundVelocityX) || 0) <= 0.05) {
            commitLocalPursuit();
            enemy.movementPhase = "position_for_attack";
            setCharacterEnemyAnimation(enemy, "idle");
            return true;
        }
        // Same-height or even same-support evidence is only permission to try the
        // cheap local path. If geometry blocks the actual step, preserve the
        // caller's glare/stranded/routed state and let graph recovery decide.
        return false;
    }

    commitLocalPursuit();
    enemy.movementPhase = "local_pursuit";
    setCharacterEnemyAnimation(enemy, "walk");
    return true;
}

function characterEnemyCanAttackFromPoint(state, enemy, point) {
    const horizontalDistance = Math.abs(state.player.currentTransform.x - point.x);
    if (enemy.attackMode === "projectile") {
        const minimumRange = Math.max(0, Number(enemy.preferredAttackMinRange) || 0);
        if (horizontalDistance < minimumRange * 0.72) {
            return false;
        }
        // Ranged attackRange is a preferred-position hint, not a hard firing limit.
        // Actual firing is constrained by awareness, projectile lifetime, trajectory,
        // and terrain clearance.
        return characterEnemyProjectilePathClearFromPoint(state, enemy, point);
    }
    return characterEnemyCanStartMeleeAttackFromPoint(state, enemy, point);
}

function characterEnemyAttackCandidateXs(enemy, support, playerX, preferredRange, arrivalX = enemy.currentTransform.x) {
    const supportInset = Math.min(
        Math.max(4, Number(enemy.width) * 0.35 || 4),
        Math.max(0, (support.xMax - support.xMin) * 0.45)
    );
    const supportMin = support.xMin + supportInset;
    const supportMax = support.xMax - supportInset;
    if (supportMax < supportMin) {
        return [(support.xMin + support.xMax) * 0.5];
    }

    const hasLunge = characterEnemyHasLungeAttack(enemy);
    const closeAttackRange = characterEnemyCloseAttackRange(enemy);
    const attackRange = enemy.attackMode === "projectile"
        ? Math.max(1, Number(enemy.attackRange) || 1)
        : (hasLunge
            ? Math.max(1, Number(enemy.lungeRangeMax) || 1)
            : closeAttackRange);
    const minimumRange = enemy.attackMode === "projectile"
        ? Math.max(0, Number(enemy.preferredAttackMinRange) || 0)
        : 0;
    const windowMin = enemy.attackMode === "projectile"
        ? supportMin
        : Math.max(supportMin, playerX - attackRange);
    const windowMax = enemy.attackMode === "projectile"
        ? supportMax
        : Math.min(supportMax, playerX + attackRange);
    if (windowMax < windowMin) {
        return [];
    }

    const values = [
        enemy.currentTransform.x,
        arrivalX,
        windowMin,
        windowMax,
        (windowMin + windowMax) * 0.5
    ];
    if (enemy.attackMode === "projectile") {
        values.push(
            playerX - preferredRange,
            playerX + preferredRange,
            playerX - minimumRange,
            playerX + minimumRange
        );
        const width = Math.max(0, windowMax - windowMin);
        const desiredSpacing = Math.max(18, Math.min(44, Number(enemy.width) * 0.48 || 32));
        const intervals = Math.max(1, Math.min(28, Math.ceil(width / desiredSpacing)));
        for (let index = 0; index <= intervals; index += 1) {
            values.push(windowMin + width * index / intervals);
        }
    } else {
        // A melee hunter has two useful tactical regions: anywhere inside direct
        // swing reach, or the lunge band. Seed the nearest boundaries of both.
        // Current/arrival positions are also candidates, so an enemy already in
        // either valid region simply holds ground instead of backing away.
        values.push(playerX - closeAttackRange, playerX + closeAttackRange);
        if (hasLunge) {
            const lungeMin = Math.max(closeAttackRange, Math.max(0, Number(enemy.lungeRangeMin) || 0));
            const lungeMax = Math.max(lungeMin, Math.max(0, Number(enemy.lungeRangeMax) || 0));
            values.push(
                playerX - lungeMin,
                playerX + lungeMin,
                playerX - lungeMax,
                playerX + lungeMax
            );
        }
    }

    const unique = new Map();
    for (const value of values) {
        const x = clamp(Number(value) || 0, windowMin, windowMax);
        unique.set(x.toFixed(3), x);
    }
    return [...unique.values()];
}

function chooseCharacterEnemyAttackPlan(state, enemy, navigation) {
    const startSupport = navigation.current?.support;
    if (!startSupport) {
        return null;
    }
    const player = state.player;
    const preferredRange = enemy.attackMode === "projectile"
        ? Math.max(0, Number(enemy.preferredAttackRange) || Number(enemy.attackRange) * 0.72)
        : characterEnemyCloseAttackRange(enemy);
    const edgeMap = navigation.edgeMap || buildEnemyNavigationEdges(navigation.supports, {
        ...characterEnemyNavigationOptions(enemy, state),
        world: state.world
    });
    const routeSearch = characterEnemyRouteSearch(
        state,
        enemy,
        navigation.supports,
        startSupport.id,
        edgeMap
    );
    if (!routeSearch) {
        return null;
    }

    const bestAttackPositionOnSupport = (support, route) => {
        const arrivalX = route.edges.at(-1)?.landingX ?? enemy.currentTransform.x;
        let best = null;
        for (const candidateX of characterEnemyAttackCandidateXs(enemy, support, player.currentTransform.x, preferredRange, arrivalX)) {
            const point = supportPoint(support, candidateX, Math.max(4, enemy.width * 0.35));
            if (characterEnemyBodyBlockedAt(state, enemy, point.x, point.y, { groundSlope: characterEnemySupportSlope(support) })) {
                continue;
            }
            if (!characterEnemyCanAttackFromPoint(state, enemy, point)) {
                continue;
            }
            const horizontalDistance = Math.abs(player.currentTransform.x - point.x);
            const rangeError = enemy.attackMode === "projectile"
                ? Math.abs(horizontalDistance - preferredRange)
                : 0;
            const travelDistance = Math.abs(point.x - arrivalX);
            // Melee plans choose the attack-ready position requiring the least
            // travel. Ranged plans retain their authored preferred-range bias.
            const score = route.cost + travelDistance + rangeError * 1.6 + Math.abs(point.y - player.currentTransform.y) * 0.18;
            if (!best || score < best.score) {
                best = {
                    kind: "attack_position",
                    supportId: support.id,
                    targetX: point.x,
                    targetY: point.y,
                    route,
                    score
                };
            }
        }
        return best;
    };

    const playerSupport = characterEnemyPlayerSupport(state, enemy, navigation.supports);
    if (playerSupport) {
        let routeToPlayer = enemyNavigationRouteFromSearch(routeSearch, playerSupport.support.id);

        if (enemy.hunterPursuePlayerSupport === true && routeToPlayer) {
            const exactSupportPlan = bestAttackPositionOnSupport(playerSupport.support, routeToPlayer);
            if (exactSupportPlan) {
                return exactSupportPlan;
            }
            const approachSide = enemy.currentTransform.x <= player.currentTransform.x ? -1 : 1;
            const approach = supportPoint(
                playerSupport.support,
                player.currentTransform.x + approachSide * (enemy.attackMode === "projectile"
                    ? Math.max(12, Math.min(preferredRange, Number(enemy.attackRange) * 0.82))
                    : Math.max(12, preferredRange)),
                Math.max(4, enemy.width * 0.35)
            );
            routeToPlayer = enemyNavigationRouteFromSearch(routeSearch, playerSupport.support.id, approach.x) || routeToPlayer;
            return {
                kind: "pursue",
                supportId: playerSupport.support.id,
                targetX: approach.x,
                targetY: approach.y,
                route: routeToPlayer,
                score: routeToPlayer.cost + Math.abs(approach.x - player.currentTransform.x)
            };
        }

        const targetRegionIds = new Set([playerSupport.support.id]);
        const pending = [playerSupport.support.id];
        while (pending.length) {
            const supportId = pending.shift();
            for (const edge of edgeMap.get(supportId) || []) {
                if (edge.type !== "step" || targetRegionIds.has(edge.to)) {
                    continue;
                }
                targetRegionIds.add(edge.to);
                pending.push(edge.to);
            }
        }

        let targetRegionPlan = null;
        for (const supportId of targetRegionIds) {
            const support = navigationSupportById(navigation.supports, supportId);
            if (!support) {
                continue;
            }
            const route = support.id === playerSupport.support.id
                ? routeToPlayer
                : enemyNavigationRouteFromSearch(routeSearch, support.id);
            if (!route) {
                continue;
            }
            const candidate = bestAttackPositionOnSupport(support, route);
            if (candidate && (!targetRegionPlan || candidate.score < targetRegionPlan.score)) {
                targetRegionPlan = candidate;
            }
        }
        if (targetRegionPlan) {
            return targetRegionPlan;
        }
        if (routeToPlayer) {
            const approachSide = enemy.currentTransform.x <= player.currentTransform.x ? -1 : 1;
            const approach = supportPoint(
                playerSupport.support,
                player.currentTransform.x + approachSide * (enemy.attackMode === "projectile"
                    ? Math.max(12, Math.min(preferredRange, Number(enemy.attackRange) * 0.82))
                    : Math.max(12, preferredRange)),
                Math.max(4, enemy.width * 0.35)
            );
            routeToPlayer = enemyNavigationRouteFromSearch(routeSearch, playerSupport.support.id, approach.x) || routeToPlayer;
            return {
                kind: "pursue",
                supportId: playerSupport.support.id,
                targetX: approach.x,
                targetY: approach.y,
                route: routeToPlayer,
                score: routeToPlayer.cost + Math.abs(approach.x - player.currentTransform.x)
            };
        }
    }

    let fallback = null;
    for (const support of navigation.supports) {
        const route = enemyNavigationRouteFromSearch(routeSearch, support.id);
        if (!route) {
            continue;
        }
        const candidate = bestAttackPositionOnSupport(support, route);
        if (candidate && (!fallback || candidate.score < fallback.score)) {
            fallback = candidate;
        }
    }
    if (fallback) {
        return fallback;
    }

    // If the hunter can see Ignatius but no reachable firing or melee point exists
    // yet, keep closing on the nearest reachable support instead of immediately
    // entering the static unreachable glare. This preserves the useful "go look
    // where he is" behaviour for pillars and blockable geometry that split a floor,
    // while still allowing truly unreachable high platforms to fall through to the
    // glare/stranded-home recovery path.
    const approach = chooseCharacterEnemyReachableApproachPlan(
        state,
        enemy,
        navigation,
        player.currentTransform.x,
        player.currentTransform.y,
        "blocked_approach",
        routeSearch
    );
    const verticalApproachLimit = Math.max(
        80,
        Math.max(0, Number(enemy.jumpHeight) || 0) + Math.max(0, Number(enemy.maxStepHeight) || 0) + 30
    );
    return approach && Math.abs((Number(approach.targetY) || 0) - (Number(player.currentTransform.y) || 0)) <= verticalApproachLimit
        ? approach
        : null;
}

function characterEnemyPanicIdentity(state, enemy) {
    return `${String(state.world?.levelId || "")}|${String(enemy.id || "")}|${Math.max(0, Math.floor(Number(enemy.panicChoiceCount) || 0))}`;
}

function chooseCharacterEnemyPanicMove(state, enemy) {
    const identity = characterEnemyPanicIdentity(state, enemy);
    const direction = deterministicEnemyUnit(identity, "magic-ring-panic-move-direction") < 0.5 ? -1 : 1;
    enemy.panicMoveDirection = direction;
    enemy.panicPhase = "move";
    enemy.panicPhaseTimer = 0.42 + deterministicEnemyUnit(identity, "magic-ring-panic-move-duration") * 0.46;
    enemy.panicChoiceCount = Math.max(0, Math.floor(Number(enemy.panicChoiceCount) || 0)) + 1;
}

function chooseCharacterEnemyPanicAttack(state, enemy) {
    const identity = characterEnemyPanicIdentity(state, enemy);
    const angle = deterministicEnemyUnit(identity, "magic-ring-panic-attack-angle") * Math.PI * 2;
    const direction = Math.cos(angle) < 0 ? -1 : 1;
    enemy.panicMoveDirection = direction;
    enemy.panicAttackAngle = angle;
    enemy.panicPhase = "attack";
    enemy.panicPhaseTimer = 0.32;
    enemy.panicChoiceCount = Math.max(0, Math.floor(Number(enemy.panicChoiceCount) || 0)) + 1;
}

function beginCharacterEnemyPanic(state, enemy) {
    if (!isCharacterEnemyState(enemy) || enemy.strategy === "passive" || enemy.health <= 0) return false;
    const wasPanicking = (Number(enemy.panicTimer) || 0) > 0;
    enemy.panicTimer = MAGIC_RING_PANIC_SECONDS;
    enemy.alerted = true;
    enemy.engaged = true;
    enemy.awarenessTimer = 0;
    enemy.glareFocusX = null;
    enemy.glareFocusY = null;
    enemy.route = [];
    enemy.routeIndex = 0;
    enemy.routePurpose = null;
    enemy.routeTargetSupportId = null;
    enemy.routeTargetX = null;
    enemy.routeTargetY = null;
    enemy.routeRepathTimer = 0;
    if (!wasPanicking || !enemy.panicPhase) chooseCharacterEnemyPanicMove(state, enemy);
    enemy.attackCooldownTimer = Math.min(Math.max(0, Number(enemy.attackCooldownTimer) || 0), 0.2);
    if (!wasPanicking) addEvent(state, "ENEMY_PANICKED", { enemyId: enemy.id, reason: "unseen_player_damage" });
    return true;
}

function endCharacterEnemyPanic(enemy) {
    enemy.panicTimer = 0;
    enemy.panicPhase = null;
    enemy.panicPhaseTimer = 0;
    enemy.alerted = false;
    enemy.engaged = false;
    enemy.awarenessTimer = 0;
    enemy.attackTimer = 0;
    clearCharacterEnemyAttackLunge(enemy);
    enemy.attackHitApplied = false;
    enemy.nextAttackHandoffIndex = 0;
    enemy.combatState = ENEMY_COMBAT_STATE.ALIVE;
    enemy.aiState = enemy.locomotion === "flying" ? "fly" : (enemy.strategy === "hunter" ? "patrol" : enemy.strategy);
    enemy.movementPhase = enemy.locomotion === "flying" ? "fly" : "guard";
    enemy.lastSeenPlayerX = null;
    enemy.lastSeenPlayerY = null;
    enemy.lastSeenAt = null;
    enemy.lastSeenSupportId = null;
    enemy.route = [];
    enemy.routeIndex = 0;
    enemy.routePurpose = null;
    enemy.routeTargetSupportId = null;
    enemy.routeTargetX = null;
    enemy.routeTargetY = null;
    enemy.groundVelocityX = 0;
    enemy.velocityX = 0;
    if (enemy.locomotion !== "flying") enemy.velocityY = 0;
    setCharacterEnemyAnimation(enemy, "idle");
}

function updateCharacterEnemyPanic(state, enemy, dt) {
    if ((Number(enemy.panicTimer) || 0) <= 0) return false;
    enemy.panicTimer = Math.max(0, (Number(enemy.panicTimer) || 0) - Math.max(0, dt));
    if (enemy.panicTimer <= 0) {
        endCharacterEnemyPanic(enemy);
        addEvent(state, "ENEMY_PANIC_ENDED", { enemyId: enemy.id });
        syncCharacterEnemyTarget(state, enemy);
        return true;
    }

    if ((Number(enemy.hurtTimer) || 0) > 0) {
        enemy.hurtTimer = Math.max(0, enemy.hurtTimer - dt);
        enemy.combatState = ENEMY_COMBAT_STATE.HURT;
        enemy.movementPhase = "panic_hurt";
        setCharacterEnemyAnimation(enemy, "hurt");
        syncCharacterEnemyTarget(state, enemy);
        return true;
    }

    if (enemy.combatState === ENEMY_COMBAT_STATE.ATTACKING || (Number(enemy.attackTimer) || 0) > 0) {
        updateCharacterEnemyAttack(state, enemy, dt);
        if (enemy.combatState !== ENEMY_COMBAT_STATE.ATTACKING && (Number(enemy.attackTimer) || 0) <= 0) {
            chooseCharacterEnemyPanicMove(state, enemy);
        }
        syncCharacterEnemyTarget(state, enemy);
        return true;
    }

    enemy.combatState = ENEMY_COMBAT_STATE.ALIVE;
    enemy.aiState = "panic";
    enemy.panicPhaseTimer = Math.max(0, (Number(enemy.panicPhaseTimer) || 0) - Math.max(0, dt));
    if (enemy.panicPhase === "attack") {
        if (enemy.attackCooldownTimer <= 0) {
            const panicFacing = Math.cos(Number(enemy.panicAttackAngle) || 0) < 0 ? -1 : 1;
            startCharacterEnemyAttack(state, enemy);
            enemy.facing = panicFacing;
            clearCharacterEnemyAttackLunge(enemy);
        } else {
            chooseCharacterEnemyPanicMove(state, enemy);
        }
        syncCharacterEnemyTarget(state, enemy);
        return true;
    }

    const direction = Number(enemy.panicMoveDirection) < 0 ? -1 : 1;
    enemy.facing = direction;
    if (enemy.locomotion === "flying") {
        const bomberSpeed = Number(enemy.bomberHorizontalSpeed) || 0;
        const speed = Math.max(40, bomberSpeed > 0 ? bomberSpeed : Math.max(120, Number(enemy.runSpeed) || 0));
        const movement = moveFlyingCharacterEnemyWithWorldCollision(
            state,
            enemy,
            enemy.currentTransform.x + direction * speed * Math.max(0, dt),
            enemy.currentTransform.y
        );
        enemy.velocityX = Math.max(0, dt) > 0 ? movement.dx / dt : 0;
        if (movement.blockedX) enemy.panicMoveDirection = -direction;
        enemy.movementPhase = movement.blockedX ? "panic_stuck" : "panic_move";
        setCharacterEnemyAnimation(enemy, "fly");
    } else {
        const speed = Math.max(40, characterEnemyRunSpeed(enemy, state.tuning) * 0.7);
        const moved = moveCharacterEnemyToward(state, enemy, enemy.currentTransform.x + direction * 120, speed, dt, 0);
        enemy.movementPhase = moved > 0 ? "panic_move" : "panic_stuck";
        setCharacterEnemyAnimation(enemy, moved > 0 ? "walk" : "idle");
    }
    if (enemy.panicPhaseTimer <= 0) chooseCharacterEnemyPanicAttack(state, enemy);
    syncCharacterEnemyTarget(state, enemy);
    return true;
}

function alertCharacterEnemyFromPlayerDamage(state, enemy) {
    if (!isCharacterEnemyState(enemy)) {
        return;
    }
    if (enemy.strategy === "passive") {
        return;
    }
    if (playerConcealedFromEnemyPerception(state)) {
        beginCharacterEnemyPanic(state, enemy);
        return;
    }

    const wasAlerted = enemy.alerted === true;
    enemy.awarenessTimer = Math.max(
        FIXED_DT,
        Number(enemy.awarenessHoldDuration) || state.tuning.enemyDefaultAwarenessHoldSeconds || 1.2
    );
    enemy.alerted = true;
    enemy.engaged = true;

    // Damage already arrives after this tick's enemy-AI update. Building the full
    // navigation context again here duplicates support/edge work on the exact frame
    // of impact and is unnecessary for preserving the last-seen coordinates. The
    // hunter's ordinary update resolves its current/player supports on the next fixed
    // step, where route planning belongs.
    rememberCharacterEnemyPlayerPosition(state, enemy, null);

    const dx = (Number(state.player.currentTransform.x) || 0) - (Number(enemy.currentTransform.x) || 0);
    if (Math.abs(dx) > 0.001) {
        enemy.facing = dx < 0 ? -1 : 1;
    }

    if (enemy.strategy === "hunter") {
        enemy.glareFocusX = null;
        enemy.glareFocusY = null;
        if (enemy.aiState !== "pursue") {
            clearCharacterEnemyNavigationPlan(enemy);
            enemy.aiState = "pursue";
            enemy.routeRepathTimer = 0;
        }
    }

    if (!wasAlerted) {
        addEvent(state, "ENEMY_ALERTED", {
            enemyId: enemy.id,
            reason: "player_damage"
        });
    }
}

function alertCharacterEnemiesFromPlayerAudibleExplosion(state, projectile) {
    if (!projectile || projectile.owner !== "player" || projectile.isRocket !== true) {
        return;
    }
    if (!playerIsAvailableCombatTarget(state) || playerConcealedFromEnemyPerception(state)) {
        return;
    }

    const explosionX = Number(projectile.currentTransform?.x) || 0;
    const explosionY = Number(projectile.currentTransform?.y) || 0;
    const playerX = Number(state.player?.currentTransform?.x) || 0;
    const playerY = Number(state.player?.currentTransform?.y) || 0;
    const playerCenterY = playerY - (Number(state.player?.height) || 0) * 0.5;

    for (const enemy of state.enemies || []) {
        if (!isCharacterEnemyState(enemy) || enemy.strategy === "passive" || enemy.deaf === true) continue;
        if (enemy.combatState === ENEMY_COMBAT_STATE.DEAD || (Number(enemy.health) || 0) <= 0) continue;

        const awarenessRange = Math.max(0, Number(enemy.awarenessRange) || 0);
        if (awarenessRange <= 0) continue;
        const enemyX = Number(enemy.currentTransform?.x) || 0;
        const enemyCenterY = (Number(enemy.currentTransform?.y) || 0) - (Number(enemy.height) || 0) * 0.5;
        if (Math.hypot(explosionX - enemyX, explosionY - enemyCenterY) > awarenessRange * 0.5 + 1e-9) continue;
        if (Math.hypot(playerX - enemyX, playerCenterY - enemyCenterY) > awarenessRange + 1e-9) continue;

        const wasAlerted = enemy.alerted === true;
        enemy.awarenessTimer = Math.max(
            FIXED_DT,
            Number(enemy.awarenessHoldDuration) || state.tuning.enemyDefaultAwarenessHoldSeconds || 1.2
        );
        enemy.alerted = true;
        enemy.engaged = true;
        rememberCharacterEnemyPlayerPosition(state, enemy, null);

        const dx = playerX - enemyX;
        if (Math.abs(dx) > 0.001) {
            enemy.facing = dx < 0 ? -1 : 1;
        }
        if (enemy.strategy === "hunter") {
            enemy.glareFocusX = null;
            enemy.glareFocusY = null;
            if (enemy.aiState !== "pursue") {
                clearCharacterEnemyNavigationPlan(enemy);
                enemy.aiState = "pursue";
            }
            enemy.routeRepathTimer = 0;
        }

        if (!wasAlerted) {
            addEvent(state, "ENEMY_ALERTED", {
                enemyId: enemy.id,
                reason: projectile.kind === "fallImpactExplosion" ? "body_slam_heard" : "rocket_heard"
            });
        }
    }
}

function rememberCharacterEnemyPlayerPosition(state, enemy, navigation) {
    enemy.lastSeenPlayerX = Number(state.player.currentTransform.x) || 0;
    enemy.lastSeenPlayerY = Number(state.player.currentTransform.y) || 0;
    enemy.lastSeenAt = Number(state.clock?.time) || 0;
    const support = navigation
        ? characterEnemyPlayerSupport(state, enemy, navigation.supports)
        : null;
    enemy.lastSeenSupportId = support?.support?.id || null;
}

function chooseCharacterEnemyReachableApproachPlan(state, enemy, navigation, targetX, targetY, kind = "pursue", sharedRouteSearch = null) {
    const startSupport = navigation.current?.support;
    const resolvedTargetX = Number(targetX);
    const resolvedTargetY = Number(targetY);
    if (!startSupport || !Number.isFinite(resolvedTargetX) || !Number.isFinite(resolvedTargetY)) {
        return null;
    }

    const edgeMap = navigation.edgeMap || buildEnemyNavigationEdges(navigation.supports, {
        ...characterEnemyNavigationOptions(enemy, state),
        world: state.world
    });
    const routeSearch = sharedRouteSearch || characterEnemyRouteSearch(
        state,
        enemy,
        navigation.supports,
        startSupport.id,
        edgeMap
    );
    if (!routeSearch) {
        return null;
    }
    const inset = Math.max(4, enemy.width * 0.35);
    let best = null;

    for (const support of navigation.supports) {
        if (support.id !== startSupport.id && !(routeSearch.stateIndicesBySupport.get(support.id)?.length)) {
            continue;
        }
        const point = supportPoint(support, resolvedTargetX, inset);
        if (characterEnemyBodyBlockedAt(state, enemy, point.x, point.y, { groundSlope: characterEnemySupportSlope(support) })) {
            continue;
        }
        const route = enemyNavigationRouteFromSearch(routeSearch, support.id, point.x);
        if (!route) {
            continue;
        }
        const remainingDistance = Math.hypot(point.x - resolvedTargetX, point.y - resolvedTargetY);
        const arrivalX = route.edges.at(-1)?.landingX ?? enemy.currentTransform.x;
        const travelCost = route.cost + Math.abs(point.x - arrivalX);
        const candidate = {
            kind,
            supportId: support.id,
            targetX: point.x,
            targetY: point.y,
            route,
            remainingDistance,
            score: travelCost
        };
        if (!best ||
            candidate.remainingDistance < best.remainingDistance - 0.25 ||
            (Math.abs(candidate.remainingDistance - best.remainingDistance) <= 0.25 && candidate.score < best.score)) {
            best = candidate;
        }
    }
    return best;
}

function chooseCharacterEnemyLastSeenPlan(state, enemy, navigation) {
    const hasLastSeenX = typeof enemy.lastSeenPlayerX === "number" && Number.isFinite(enemy.lastSeenPlayerX);
    const hasLastSeenY = typeof enemy.lastSeenPlayerY === "number" && Number.isFinite(enemy.lastSeenPlayerY);
    if (!hasLastSeenX || !hasLastSeenY) {
        return null;
    }
    return chooseCharacterEnemyReachableApproachPlan(
        state,
        enemy,
        navigation,
        enemy.lastSeenPlayerX,
        enemy.lastSeenPlayerY,
        "last_seen"
    );
}

function characterEnemyNavigationTargetPoint(enemy, navigation) {
    if (!enemy.routeTargetSupportId || !Number.isFinite(Number(enemy.routeTargetX))) {
        return null;
    }
    const targetSupport = navigationSupportById(navigation.supports, enemy.routeTargetSupportId) ||
        navigation.current?.support || null;
    if (!targetSupport) {
        return null;
    }
    return supportPoint(
        targetSupport,
        Number(enemy.routeTargetX),
        Math.max(4, enemy.width * 0.3)
    );
}

function characterEnemyReachedNavigationTarget(enemy, navigation, tolerance = 3) {
    const targetPoint = characterEnemyNavigationTargetPoint(enemy, navigation);
    if (!targetPoint) {
        return false;
    }
    const currentSupportId = navigation.current?.support?.id || enemy.currentSupportId;
    const physicallySettled = enemy.airborne === true || Math.abs(Number(enemy.groundVelocityX) || 0) <= 0.05;
    return currentSupportId === enemy.routeTargetSupportId &&
        enemy.routeIndex >= (enemy.route?.length || 0) &&
        Math.abs(enemy.currentTransform.x - targetPoint.x) <= Math.max(0.5, tolerance) &&
        physicallySettled;
}

function updateCharacterEnemyLastSeenInvestigation(state, enemy, navigation, dt, options = {}) {
    const allowGlare = options.allowGlare !== false;
    if (!(typeof enemy.lastSeenPlayerX === "number" && Number.isFinite(enemy.lastSeenPlayerX)) ||
        !(typeof enemy.lastSeenPlayerY === "number" && Number.isFinite(enemy.lastSeenPlayerY))) {
        if (allowGlare) {
            enterCharacterEnemyGlare(state, enemy);
        }
        return;
    }

    if (enemy.aiState !== "investigate_last_seen") {
        if (!characterEnemyHasCommittedTraversal(enemy)) {
            clearCharacterEnemyNavigationPlan(enemy);
        }
        enemy.aiState = "investigate_last_seen";
        enemy.movementPhase = "investigate_last_seen";
        enemy.routeRepathTimer = 0;
        enemy.navigationFailureCount = 0;
        addEvent(state, "ENEMY_INVESTIGATING_LAST_SEEN", {
            enemyId: enemy.id,
            x: round(enemy.lastSeenPlayerX),
            y: round(enemy.lastSeenPlayerY)
        });
    }

    enemy.engaged = true;
    enemy.alerted = true;
    enemy.routeRepathTimer = Math.max(0, (Number(enemy.routeRepathTimer) || 0) - dt);

    if (characterEnemyReachedNavigationTarget(enemy, navigation)) {
        if (allowGlare) {
            enterCharacterEnemyGlare(state, enemy, {
                focusX: enemy.lastSeenPlayerX,
                focusY: enemy.lastSeenPlayerY
            });
        } else {
            enemy.movementPhase = "last_seen_hold";
            setCharacterEnemyAnimation(enemy, "idle");
        }
        return;
    }

    if (!enemy.routeTargetSupportId && !characterEnemyHasCommittedTraversal(enemy)) {
        const plan = chooseCharacterEnemyLastSeenPlan(state, enemy, navigation);
        if (!plan) {
            if (allowGlare) {
                enterCharacterEnemyGlare(state, enemy, {
                    focusX: enemy.lastSeenPlayerX,
                    focusY: enemy.lastSeenPlayerY
                });
            } else {
                enemy.movementPhase = "last_seen_hold";
                setCharacterEnemyAnimation(enemy, "idle");
            }
            return;
        }
        setCharacterEnemyNavigationPlan(enemy, plan);
        enemy.lastSeenRemainingDistance = plan.remainingDistance;
        if (characterEnemyReachedNavigationTarget(enemy, navigation)) {
            if (allowGlare) {
                enterCharacterEnemyGlare(state, enemy, {
                    focusX: enemy.lastSeenPlayerX,
                    focusY: enemy.lastSeenPlayerY
                });
            } else {
                enemy.movementPhase = "investigate_last_seen";
                setCharacterEnemyAnimation(enemy, "idle");
            }
            return;
        }
    }

    if (!followCharacterEnemyNavigationPlan(state, enemy, navigation, dt)) {
        enemy.navigationFailureCount = (Number(enemy.navigationFailureCount) || 0) + 1;
        if (enemy.navigationFailureCount >= 2) {
            enterCharacterEnemyGlare(state, enemy, {
                focusX: enemy.lastSeenPlayerX,
                focusY: enemy.lastSeenPlayerY
            });
        } else {
            clearCharacterEnemyNavigationPlan(enemy);
            enemy.routeRepathTimer = 0;
        }
        return;
    }

    enemy.navigationFailureCount = 0;
    enemy.movementPhase = "investigate_last_seen";
    if (!enemy.airborne && characterEnemyReachedNavigationTarget(enemy, navigation)) {
        if (allowGlare) {
            enterCharacterEnemyGlare(state, enemy, {
                focusX: enemy.lastSeenPlayerX,
                focusY: enemy.lastSeenPlayerY
            });
        } else {
            enemy.movementPhase = "last_seen_hold";
            setCharacterEnemyAnimation(enemy, "idle");
        }
    }
}

function setCharacterEnemyNavigationPlan(enemy, plan) {
    enemy.route = Array.isArray(plan?.route?.edges) ? plan.route.edges.map((edge) => ({ ...edge })) : [];
    enemy.routeIndex = 0;
    enemy.routeTraversalPhase = null;
    enemy.routeTraversalEdgeIndex = -1;
    // A new route changes intent, not actor momentum. Replanning while moving
    // must not act as an invisible brake.
    enemy.routeTargetSupportId = plan?.supportId || null;
    enemy.routeTargetX = Number.isFinite(Number(plan?.targetX)) ? Number(plan.targetX) : null;
    enemy.routeTargetY = Number.isFinite(Number(plan?.targetY)) ? Number(plan.targetY) : null;
    enemy.routePurpose = plan?.kind ? String(plan.kind) : null;
    enemy.routeObservedTargetSupportId = null;
    enemy.routeObservedTargetX = null;
    enemy.routeObservedTargetY = null;
    enemy.routeRepathTimer = Math.max(FIXED_DT, Number(enemy.routeRepathInterval) || FIXED_DT);
}

function rememberCharacterEnemyRoutePlayerTarget(state, enemy) {
    enemy.routeObservedTargetSupportId = enemy.lastSeenSupportId || null;
    enemy.routeObservedTargetX = Number(state.player.currentTransform.x) || 0;
    enemy.routeObservedTargetY = Number(state.player.currentTransform.y) || 0;
}

function setCharacterEnemyAttackNavigationPlan(state, enemy, plan) {
    setCharacterEnemyNavigationPlan(enemy, plan);
    rememberCharacterEnemyRoutePlayerTarget(state, enemy);
}

function characterEnemyHasRoutePlayerTargetSnapshot(enemy) {
    return typeof enemy.routeObservedTargetX === "number" && Number.isFinite(enemy.routeObservedTargetX) &&
        typeof enemy.routeObservedTargetY === "number" && Number.isFinite(enemy.routeObservedTargetY);
}

function characterEnemyRoutePlayerTargetMoved(state, enemy) {
    if (!characterEnemyHasRoutePlayerTargetSnapshot(enemy)) {
        return false;
    }
    const supportChanged = (enemy.routeObservedTargetSupportId || null) !== (enemy.lastSeenSupportId || null);
    const movementThreshold = Math.max(24, Math.min(64, (Number(enemy.width) || 0) * 0.5));
    return supportChanged || Math.hypot(
        (Number(state.player.currentTransform.x) || 0) - Number(enemy.routeObservedTargetX),
        (Number(state.player.currentTransform.y) || 0) - Number(enemy.routeObservedTargetY)
    ) >= movementThreshold;
}

function clearCharacterEnemyNavigationPlan(enemy) {
    enemy.route = [];
    enemy.routeIndex = 0;
    enemy.routeTraversalPhase = null;
    enemy.routeTraversalEdgeIndex = -1;
    // Route state is planning state. Clearing it must not erase physical momentum.
    enemy.routeTargetSupportId = null;
    enemy.routeTargetX = null;
    enemy.routeTargetY = null;
    enemy.routePurpose = null;
    enemy.routeObservedTargetSupportId = null;
    enemy.routeObservedTargetX = null;
    enemy.routeObservedTargetY = null;
}

function beginCharacterEnemyAirTraversal(enemy, edge, horizontalVelocity = null) {
    const inheritedHorizontalVelocity = Number.isFinite(Number(horizontalVelocity))
        ? Number(horizontalVelocity)
        : (Number(enemy.groundVelocityX) || 0);
    enemy.routeTraversalPhase = null;
    enemy.routeTraversalEdgeIndex = -1;
    enemy.groundVelocityX = 0;
    enemy.airborne = true;
    enemy.supportId = null;
    enemy.ridingPlatformId = null;
    enemy.airTimer = 0;
    enemy.airTraversalType = edge.type || null;
    enemy.airSourceSupportId = edge.from || enemy.currentSupportId || null;
    enemy.airSourceObstacleId = edge.fromObstacleId || null;
    enemy.airTargetSupportId = edge.to;
    enemy.velocityX = inheritedHorizontalVelocity;
    enemy.velocityY = Number(edge.vy) || 0;
    enemy.aiState = edge.type === "drop" ? "drop" : "jump";
    enemy.movementPhase = enemy.aiState;
    if (Math.abs(enemy.velocityX) > 0.001) {
        enemy.facing = enemy.velocityX < 0 ? -1 : 1;
    }
    setCharacterEnemyAnimation(enemy, "walk");
}

function enemyNavigationLandingTargetCompatibility(supports, targetSupportId, landingCollision) {
    const targetSupport = navigationSupportById(supports, targetSupportId);
    if (!targetSupport || !landingCollision) return { compatible: false, reason: null };
    const contactX = Number(landingCollision.contactX);
    const contactY = Number(landingCollision.surfaceY);
    if (!Number.isFinite(contactX) || !Number.isFinite(contactY)) return { compatible: false, reason: null };

    const endpointTolerance = 0.75;
    const verticalTolerance = 4;
    const targetSampleX = clamp(contactX, targetSupport.xMin, targetSupport.xMax);
    const targetY = supportPoint(targetSupport, targetSampleX, 0).y;
    const contactOnTargetGeometry = contactX >= targetSupport.xMin - endpointTolerance
        && contactX <= targetSupport.xMax + endpointTolerance
        && Math.abs(targetY - contactY) <= verticalTolerance;
    const collisionId = String(landingCollision.id || "");
    if (contactOnTargetGeometry && collisionId === enemyNavigationSupportCollisionId(targetSupport)) {
        return { compatible: true, reason: "authored_support" };
    }

    const targetOwnerId = enemyNavigationSupportPhysicalOwnerId(targetSupport);
    for (const support of supports || []) {
        if (!support || enemyNavigationSupportCollisionId(support) !== collisionId) continue;
        if (!targetOwnerId || enemyNavigationSupportPhysicalOwnerId(support) !== targetOwnerId) continue;
        if (!enemyNavigationSupportsShareEndpoint(targetSupport, support, endpointTolerance)) continue;
        const sharedPoints = [
            [targetSupport.x1, targetSupport.y1],
            [targetSupport.x2, targetSupport.y2]
        ].filter(([tx, ty]) => [
            [support.x1, support.y1],
            [support.x2, support.y2]
        ].some(([sx, sy]) => Math.hypot(Number(tx) - Number(sx), Number(ty) - Number(sy)) <= endpointTolerance));
        if (sharedPoints.some(([x, y]) => Math.hypot(contactX - Number(x), contactY - Number(y)) <= verticalTolerance)) {
            return { compatible: true, reason: "shared_endpoint" };
        }
    }
    return { compatible: false, reason: null };
}

function updateCharacterEnemyAirTraversal(state, enemy, dt, supports, diagnostics = null) {
    if (!enemy.airborne) {
        return false;
    }

    enemy.airTimer = Math.max(0, Number(enemy.airTimer) || 0) + dt;
    enemy.velocityY = (Number(enemy.velocityY) || 0) + Math.max(1, Number(enemy.jumpGravity) || 1) * dt;

    const previousX = enemy.currentTransform.x;
    const previousY = enemy.currentTransform.y;
    const nextX = previousX + (Number(enemy.velocityX) || 0) * dt;
    const nextY = previousY + (Number(enemy.velocityY) || 0) * dt;
    const sourceSupport = navigationSupportById(supports, enemy.airSourceSupportId);
    const activeAirEdge = enemy.route?.[enemy.routeIndex] || null;
    const committedDownThroughOneWay = enemy.airTraversalType === "jump"
        && sourceSupport?.kind === "walkable"
        && activeAirEdge?.type === "jump"
        && Number(activeAirEdge.landingY) > Number(activeAirEdge.launchY) + 0.001;
    // Atomic navigation fragments carry _nav_N IDs, while collision still
    // knows the authored parent line/polygon ID. Ignore both identities during
    // committed source departure so a jump-down through a split green platform
    // does not immediately collide with its own physical parent line.
    const sourceIgnoreIds = [...new Set([
        enemy.airSourceSupportId,
        sourceSupport ? enemyNavigationSupportCollisionId(sourceSupport) : null,
        enemy.airSourceObstacleId
    ].filter(Boolean))];
    const sourcePolygon = state.world?.collisionPolygons?.find((polygon) => polygon.id === enemy.airSourceObstacleId) || null;
    if (sourcePolygon) {
        const lineIds = new Set((sourcePolygon.lineIds || []).map((id) => String(id)));
        for (const segment of state.world?.segments || []) {
            if (
                segment.visualId === sourcePolygon.visualId &&
                (!lineIds.size || lineIds.has(String(segment.lineId || "")))
            ) {
                sourceIgnoreIds.push(segment.id);
            }
        }
    }
    const dropDepartureIgnoresSourceAt = (x, y) => {
        // A committed downward jump from a green one-way support is allowed to
        // pass back through that same source line. Ignore only source identities;
        // every other support remains collision-active.
        if (committedDownThroughOneWay) return true;
        if (enemy.airTraversalType !== "drop" || !sourceSupport) {
            return false;
        }
        const sourcePoint = supportPoint(sourceSupport, clamp(x, sourceSupport.xMin, sourceSupport.xMax), 0);
        const departureDrop = Math.max(
            6,
            Math.min(
                enemy.height * ENEMY_DROP_SOURCE_CLEARANCE_HEIGHT_FACTOR,
                enemy.width * ENEMY_DROP_SOURCE_CLEARANCE_WIDTH_FACTOR
            )
        );
        if (Math.abs(Number(enemy.velocityX) || 0) <= 0.001) {
            // Monsters never intentionally drop through a one-way floor. A
            // stale or malformed zero-horizontal drop edge must collide with
            // its source support immediately rather than bypassing the line.
            return false;
        }
        const direction = enemy.velocityX < 0 ? -1 : 1;
        const obstacleEdge = direction < 0
            ? (Number.isFinite(sourceSupport.obstacleXMin) ? sourceSupport.obstacleXMin : sourceSupport.xMin)
            : (Number.isFinite(sourceSupport.obstacleXMax) ? sourceSupport.obstacleXMax : sourceSupport.xMax);
        const clearCenterX = obstacleEdge + direction * (enemy.width * 0.5 + 2);
        const clearedHorizontally = direction < 0 ? x <= clearCenterX : x >= clearCenterX;
        return !clearedHorizontally && y <= sourcePoint.y + departureDrop + 0.5 && enemy.airTimer <= 1;
    };

    const horizontalIgnoreIds = dropDepartureIgnoresSourceAt(nextX, previousY)
        ? sourceIgnoreIds
        : [];
    const horizontalCollision = findActorHorizontalSweepCollision(
        state,
        enemy,
        previousX,
        nextX,
        { ignoreIds: horizontalIgnoreIds, blockWater: true }
    );
    enemy.currentTransform.x = horizontalCollision ? horizontalCollision.x : nextX;
    if (horizontalCollision) {
        if (diagnostics && !diagnostics.firstHorizontalCollision) {
            diagnostics.firstHorizontalCollision = {
                id: horizontalCollision.id || null,
                kind: horizontalCollision.kind || null,
                source: horizontalCollision.source || null,
                x: enemy.currentTransform.x,
                y: previousY,
                tick: diagnostics.airTicks || 0
            };
        }
        enemy.velocityX = 0;
    }

    let departingSource = dropDepartureIgnoresSourceAt(enemy.currentTransform.x, nextY);
    if (!departingSource && enemy.airTraversalType !== "drop" && sourceSupport) {
        const sourcePoint = supportPoint(sourceSupport, clamp(enemy.currentTransform.x, sourceSupport.xMin, sourceSupport.xMax), 0);
        const departedHorizontally = enemy.currentTransform.x < sourceSupport.xMin - enemy.width * 0.5 || enemy.currentTransform.x > sourceSupport.xMax + enemy.width * 0.5;
        const departedVertically = nextY > sourcePoint.y + Math.max(4, enemy.height * 0.08);
        departingSource = !departedHorizontally && !departedVertically && enemy.airTimer <= 1;
    }
    const verticalIgnoreIds = departingSource ? sourceIgnoreIds : [];
    const verticalCollision = findActorVerticalSweepCollision(
        state,
        enemy,
        previousY,
        nextY,
        { ignoreIds: verticalIgnoreIds, blockWater: true }
    );
    enemy.currentTransform.y = verticalCollision ? verticalCollision.y : nextY;
    enemy.movementPhase = "air";

    if (verticalCollision?.ceiling) {
        if (diagnostics && !diagnostics.firstCeilingCollision) {
            diagnostics.firstCeilingCollision = {
                id: verticalCollision.id || null,
                kind: verticalCollision.kind || null,
                source: verticalCollision.source || null,
                x: enemy.currentTransform.x,
                y: enemy.currentTransform.y,
                tick: diagnostics.airTicks || 0
            };
        }
        enemy.velocityY = 0;
    } else if (verticalCollision) {
        const landingVelocityX = Number(enemy.velocityX) || 0;
        enemy.velocityX = 0;
        enemy.velocityY = 0;
        enemy.groundVelocityX = landingVelocityX;
        enemy.airborne = false;
        enemy.airTimer = 0;
        enemy.airTraversalType = null;
        const intendedSupportId = enemy.airTargetSupportId;
        const sourceSupportId = enemy.airSourceSupportId;
        const traversalEdge = enemy.route?.[enemy.routeIndex] || null;
        const landingCollision = {
            id: verticalCollision.id || null,
            kind: verticalCollision.kind || null,
            source: verticalCollision.source || null,
            x: enemy.currentTransform.x,
            y: enemy.currentTransform.y,
            contactX: Number.isFinite(Number(verticalCollision.contactX)) ? Number(verticalCollision.contactX) : enemy.currentTransform.x,
            surfaceY: Number.isFinite(Number(verticalCollision.surfaceY)) ? Number(verticalCollision.surfaceY) : enemy.currentTransform.y,
            tick: diagnostics?.airTicks || 0
        };
        const landedSupport = findEnemyNavigationSupport(supports, enemy.currentTransform.x, enemy.currentTransform.y, {
            maxRise: 5,
            maxDrop: 5,
            width: enemy.width,
            sampleHalfWidthFactor: 0.48,
            contactX: landingCollision.contactX,
            preferredSupportId: intendedSupportId
        });
        const resolvedSupportId = landedSupport?.support?.id || null;
        const targetCompatibility = intendedSupportId
            ? enemyNavigationLandingTargetCompatibility(supports, intendedSupportId, landingCollision)
            : { compatible: false, reason: null };
        // Exact navigation-support resolution is stronger evidence than the
        // collision-owner compatibility fallback. The old ordering could report
        // landed_on_wrong_support even when resolvedSupportId === intendedSupportId.
        const landedOnIntendedSupport = Boolean(intendedSupportId) &&
            (resolvedSupportId === intendedSupportId || targetCompatibility.compatible);
        enemy.currentSupportId = landedOnIntendedSupport
            ? intendedSupportId
            : resolvedSupportId;
        if (diagnostics) {
            diagnostics.landingCollision = landingCollision;
            diagnostics.resolvedSupportId = resolvedSupportId;
            diagnostics.landedSupportId = enemy.currentSupportId;
            diagnostics.landingTargetCompatibility = targetCompatibility.reason;
        }
        const physicalSupport = findCharacterEnemyGroundSupport(
            state,
            enemy.currentTransform.x,
            enemy.currentTransform.y,
            Math.max(5, enemy.maxStepHeight),
            Math.max(5, enemy.maxDropDistance),
            enemy.width
        );
        setCharacterEnemyGroundSupportIdentity(state, enemy, physicalSupport);
        enemy.airSourceSupportId = null;
        enemy.airSourceObstacleId = null;
        enemy.airTargetSupportId = null;

        if (intendedSupportId && !landedOnIntendedSupport) {
            if (traversalEdge?.to === intendedSupportId) {
                recordCharacterEnemyNavigationTransitionFailure(
                    state,
                    enemy,
                    traversalEdge,
                    enemy.currentSupportId,
                    sourceSupportId && enemy.currentSupportId === sourceSupportId
                        ? "returned_to_source_support"
                        : "landed_on_wrong_support"
                );
            }
            clearCharacterEnemyNavigationPlan(enemy);
            enemy.routeRepathTimer = 0;
            if (enemy.currentSupportId) {
                // Full-body collision can safely catch a hunter on a neighbouring
                // ledge or on the top of the same obstacle before the baked arc's
                // nominal landing point. That is a valid landing, not a failed
                // traversal. Pull the feet onto the usable part of that support,
                // then replan from the support actually reached.
                const recoveredSupport = landedSupport.support;
                const recoveredPoint = supportPoint(
                    recoveredSupport,
                    enemy.currentTransform.x,
                    Math.min(Math.max(2, enemy.width * 0.1), Math.max(0, (recoveredSupport.xMax - recoveredSupport.xMin) * 0.4))
                );
                enemy.currentTransform.x = recoveredPoint.x;
                enemy.currentTransform.y = recoveredPoint.y;
                if (sourceSupportId && enemy.currentSupportId === sourceSupportId) {
                    enemy.navigationFailureCount = (Number(enemy.navigationFailureCount) || 0) + 1;
                    if (enemy.navigationFailureCount >= 2) {
                        enterCharacterEnemyGlare(state, enemy);
                    } else {
                        enemy.aiState = enemy.engaged ? "pursue" : "return_home";
                        enemy.movementPhase = enemy.aiState;
                        setCharacterEnemyAnimation(enemy, "idle");
                    }
                } else {
                    enemy.navigationFailureCount = 0;
                    enemy.aiState = enemy.engaged ? "pursue" : "return_home";
                    enemy.movementPhase = enemy.aiState;
                    setCharacterEnemyAnimation(enemy, "walk");
                }
            } else {
                enemy.navigationFailureCount = (Number(enemy.navigationFailureCount) || 0) + 1;
                if (enemy.navigationFailureCount >= 2) {
                    enterCharacterEnemyGlare(state, enemy);
                } else {
                    enemy.aiState = enemy.engaged ? "pursue" : "return_home";
                    enemy.movementPhase = enemy.aiState;
                    setCharacterEnemyAnimation(enemy, "idle");
                }
            }
            return true;
        }

        enemy.aiState = enemy.engaged ? "pursue" : "return_home";
        enemy.movementPhase = enemy.aiState;
        if (traversalEdge?.to === enemy.currentSupportId) {
            recordCharacterEnemyNavigationTransitionSuccess(enemy, traversalEdge);
        }
        if (enemy.route?.[enemy.routeIndex]?.to === enemy.currentSupportId) {
            enemy.routeIndex += 1;
        }
        enemy.routeTraversalPhase = null;
        enemy.routeTraversalEdgeIndex = -1;
        setCharacterEnemyAnimation(enemy, "walk");
        return true;
    }

    const bottom = Number(state.world?.bounds?.y || 0) + Number(state.world?.bounds?.h || 1200) + 500;
    const airTraversalTimeoutSeconds = 10;
    // After 10 seconds the falling distance will be higher than any reasonably authored level.
    if (enemy.airTimer > airTraversalTimeoutSeconds || enemy.currentTransform.y > bottom) {
        if (diagnostics) diagnostics.timedOut = true;
        enemy.airborne = false;
        enemy.velocityX = 0;
        enemy.velocityY = 0;
        enemy.airTraversalType = null;
        enemy.airSourceSupportId = null;
        enemy.airSourceObstacleId = null;
        enemy.airTargetSupportId = null;
        clearCharacterEnemyNavigationPlan(enemy);
        enemy.navigationFailureCount = (Number(enemy.navigationFailureCount) || 0) + 1;
        enemy.aiState = "unreachable_glare";
        enemy.glareTimer = Math.max(0, Number(enemy.unreachableGlareDuration) || 0);
        enemy.movementPhase = "glare";
        setCharacterEnemyAnimation(enemy, "idle");
        return true;
    }
    return true;
}

function enemyNavigationRunUpBlockedWithinStepsAdvisory(world, edge, supports = [], rawProfile = {}, maxSteps = 1) {
    if ((edge?.type !== "jump" && edge?.type !== "drop") || !Number.isFinite(Number(edge.runUpX)) || Math.abs(Number(edge.vx) || 0) <= 0.001) {
        return null;
    }
    const profile = normalizeEnemyNavigationProfile(rawProfile || {});
    const supportById = new Map((supports || []).map((support) => [String(support?.id || ""), support]));
    const sourceSupport = supportById.get(String(edge.from || "")) || null;
    const initialX = Number(edge.runUpX);
    const runUpSupport = Array.isArray(edge.runUpSupportIds)
        ? edge.runUpSupportIds.map((id) => supportById.get(String(id || ""))).find((support) =>
            support && initialX >= Number(support.xMin) - 0.05 && initialX <= Number(support.xMax) + 0.05)
        : null;
    const initialPhysicalSupport = runUpSupport || sourceSupport;
    const initialY = Number.isFinite(Number(edge.runUpY))
        ? Number(edge.runUpY)
        : (initialPhysicalSupport ? supportPoint(initialPhysicalSupport, initialX, 0).y : Number(edge.launchY));
    const state = {
        world,
        tuning: {
            ...DEFAULT_TUNING,
            groundAcceleration: profile.groundAcceleration,
            gravity: profile.gravity
        }
    };
    const enemy = {
        id: "navigation_run_up_advisory_probe",
        strategy: "hunter",
        locomotion: "ground",
        currentTransform: { x: initialX, y: initialY, scaleX: 1, scaleY: 1 },
        previousTransform: { x: initialX, y: initialY, scaleX: 1, scaleY: 1 },
        width: profile.bodyWidth,
        height: profile.bodyHeight,
        maxStepHeight: profile.maxStepHeight,
        maxDropDistance: profile.maxFallDistance,
        maxFallDistance: profile.maxFallDistance,
        runSpeed: profile.runSpeed,
        runAcceleration: profile.groundAcceleration,
        jumpHeight: profile.jumpHeight,
        jumpGravity: profile.gravity,
        velocityX: 0,
        velocityY: 0,
        groundVelocityX: 0,
        airborne: false,
        supportId: initialPhysicalSupport ? enemyNavigationSupportCollisionId(initialPhysicalSupport) : null,
        currentSupportId: initialPhysicalSupport?.id || edge.from || null,
        ridingPlatformId: null,
        groundStride: null,
        route: [{ ...edge }],
        routeIndex: 0,
        routeTraversalPhase: null,
        routeTraversalEdgeIndex: -1,
        patrolDistance: 0,
        facing: Number(edge.vx) < 0 ? -1 : 1,
        movementPhase: "idle",
        aiState: "pursue",
        engaged: false,
        navigationFailureCount: 0,
        navigationTransitionFailures: {},
        navigationLastFailedTransitionKey: null,
        unreachableGlareDuration: 0,
        animationSlot: "idle",
        state: "idle",
        animationClock: { previous: 0, current: 0 }
    };
    const requiredVelocity = Math.abs(Number(edge.vx) || 0);
    const acceleration = Math.max(1, Number(edge.groundAcceleration) || profile.groundAcceleration);
    const direction = Number(edge.vx) < 0 ? -1 : 1;
    const limit = Math.max(1, Math.floor(Number(maxSteps) || 1));
    for (let tick = 1; tick <= limit; tick += 1) {
        const currentSpeed = Math.abs(Number(enemy.groundVelocityX) || 0);
        const nextSpeed = Math.max(1, Math.min(profile.runSpeed, requiredVelocity, currentSpeed + acceleration * FIXED_DT));
        const startX = Number(enemy.currentTransform.x);
        const startY = Number(enemy.currentTransform.y);
        const attemptedX = startX + direction * Math.min(Math.abs(Number(edge.launchX) - startX), nextSpeed * FIXED_DT);
        const advanced = followCharacterEnemyBallisticRunUp(state, enemy, edge, profile.runSpeed, FIXED_DT);
        if (!advanced) {
            return {
                tick,
                startX: roundedForDiagnostic(startX),
                startY: roundedForDiagnostic(startY),
                attemptedX: roundedForDiagnostic(attemptedX)
            };
        }
        if (enemy.airborne) return null;
    }
    return null;
}

export function enemyNavigationRunUpFirstStepAdvisory(world, edge, supports = [], rawProfile = {}) {
    return enemyNavigationRunUpBlockedWithinStepsAdvisory(world, edge, supports, rawProfile, 1);
}

export function enemyNavigationRunUpFirstFourStepsAdvisory(world, edge, supports = [], rawProfile = {}) {
    return enemyNavigationRunUpBlockedWithinStepsAdvisory(world, edge, supports, rawProfile, 4);
}

const NAVIGATION_LANDING_SALVAGE_MAX_STEP_HOPS = 2;

function navigationSimulationEdgeUsableForConnectivity(edge) {
    if (edge?.type !== "step" && edge?.type !== "jump" && edge?.type !== "drop") return true;
    return String(edge?.verification || "").trim().toLowerCase() === ENEMY_NAVIGATION_VERIFICATION_VERIFIED;
}

function navigationSimulationReachable(edges, fromSupportId, toSupportId) {
    const from = String(fromSupportId || "");
    const to = String(toSupportId || "");
    if (!from || !to) return false;
    if (from === to) return true;
    const adjacency = new Map();
    for (const edge of edges || []) {
        if (!navigationSimulationEdgeUsableForConnectivity(edge)) continue;
        const edgeFrom = String(edge?.from || "");
        const edgeTo = String(edge?.to || "");
        if (!edgeFrom || !edgeTo) continue;
        if (!adjacency.has(edgeFrom)) adjacency.set(edgeFrom, []);
        adjacency.get(edgeFrom).push(edgeTo);
    }
    const visited = new Set([from]);
    const queue = [from];
    for (let index = 0; index < queue.length; index += 1) {
        for (const next of adjacency.get(queue[index]) || []) {
            if (next === to) return true;
            if (visited.has(next)) continue;
            visited.add(next);
            queue.push(next);
        }
    }
    return false;
}

function navigationSimulationStepHops(edges, fromSupportId, toSupportId, maxHops = NAVIGATION_LANDING_SALVAGE_MAX_STEP_HOPS) {
    const from = String(fromSupportId || "");
    const to = String(toSupportId || "");
    if (!from || !to || from === to) return null;
    const adjacency = new Map();
    for (const edge of edges || []) {
        if (edge?.type !== "step" || String(edge?.verification || "").trim().toLowerCase() !== ENEMY_NAVIGATION_VERIFICATION_VERIFIED) continue;
        const edgeFrom = String(edge?.from || "");
        const edgeTo = String(edge?.to || "");
        if (!edgeFrom || !edgeTo) continue;
        if (!adjacency.has(edgeFrom)) adjacency.set(edgeFrom, []);
        adjacency.get(edgeFrom).push(edgeTo);
    }
    let frontier = new Set([from]);
    const visited = new Set(frontier);
    const limit = Math.max(1, Math.floor(Number(maxHops) || NAVIGATION_LANDING_SALVAGE_MAX_STEP_HOPS));
    for (let depth = 1; depth <= limit; depth += 1) {
        const nextFrontier = new Set();
        for (const current of frontier) {
            for (const next of adjacency.get(current) || []) {
                if (next === to) return depth;
                if (visited.has(next)) continue;
                visited.add(next);
                nextFrontier.add(next);
            }
        }
        frontier = nextFrontier;
        if (!frontier.size) break;
    }
    return null;
}

function navigationSimulationSalvageEdgeId(edge, landedSupportId, usedIds) {
    const safe = String(landedSupportId || "support").replace(/[^A-Za-z0-9_-]+/g, "_");
    const sourceId = String(edge?.id || "nav_edge");
    const base = `${sourceId}_simulation_salvage_${safe}`;
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) id = `${base}_${suffix++}`;
    usedIds.add(id);
    return id;
}


// Development/navigation-recall oracle: deliberately bypasses the baked route
// graph and asks the real ground locomotion to walk out of one persistent
// support endpoint. This is the complementary check to simulation proof:
// proof rejects bad geometric proposals, while this probe can expose a valid
// walking connection that geometry forgot to propose at all.
export function probeEnemyNavigationWalkingEndpoint(world, graph, fromSupportId, direction, options = {}) {
    const profile = normalizeEnemyNavigationProfile(graph?.profile || {});
    const supports = Array.isArray(graph?.supports) ? graph.supports : [];
    const sourceSupport = navigationSupportById(supports, String(fromSupportId || ""));
    const walkDirection = Math.sign(Number(direction) || 0);
    if (!sourceSupport || !walkDirection) return { status: "invalid", fromSupportId: sourceSupport?.id || null, reachedSupportId: null, ticks: 0 };

    const width = Math.max(8, Number(profile.bodyWidth) || 48);
    const height = Math.max(24, Number(profile.bodyHeight) || 120);
    const inset = Math.max(2, Math.min(width * 0.18, Math.max(2, (sourceSupport.xMax - sourceSupport.xMin) * 0.25)));
    const startX = walkDirection > 0
        ? Math.max(sourceSupport.xMin, sourceSupport.xMax - inset)
        : Math.min(sourceSupport.xMax, sourceSupport.xMin + inset);
    const startY = supportPoint(sourceSupport, startX, 0).y;
    const probeDistance = Math.max(
        72,
        width * 1.5,
        Math.max(Number(profile.maxStepHeight) || 0, height * 0.20) * 3
    );
    const targetX = startX + walkDirection * Math.max(probeDistance, Number(options.probeDistance) || 0);
    const maxTicks = Math.max(1, Math.floor(Number(options.maxTicks) || 180));
    const state = {
        world,
        tuning: {
            ...DEFAULT_TUNING,
            groundAcceleration: profile.groundAcceleration,
            gravity: profile.gravity
        }
    };
    const enemy = {
        id: "navigation_walk_recall_probe",
        strategy: "hunter",
        locomotion: "ground",
        currentTransform: { x: startX, y: startY, scaleX: 1, scaleY: 1 },
        previousTransform: { x: startX, y: startY, scaleX: 1, scaleY: 1 },
        width,
        height,
        maxStepHeight: profile.maxStepHeight,
        maxDropDistance: profile.maxFallDistance,
        maxFallDistance: profile.maxFallDistance,
        runSpeed: profile.runSpeed,
        runAcceleration: profile.groundAcceleration,
        jumpHeight: profile.jumpHeight,
        jumpGravity: profile.gravity,
        velocityX: 0,
        velocityY: 0,
        groundVelocityX: 0,
        airborne: false,
        supportId: sourceSupport.sourcePolygonId || String(sourceSupport.id || "").replace(/_nav_\d+$/, ""),
        currentSupportId: sourceSupport.id,
        ridingPlatformId: null,
        patrolDistance: 0,
        facing: walkDirection,
        movementPhase: "walk",
        animationSlot: "walk",
        state: "walk",
        animationClock: { previous: 0, current: 0 }
    };

    let lastResolved = sourceSupport;
    for (let tick = 1; tick <= maxTicks; tick += 1) {
        const moved = moveCharacterEnemyToward(state, enemy, targetX, Math.max(1, profile.runSpeed), FIXED_DT, 0);
        const resolved = findEnemyNavigationSupport(supports, enemy.currentTransform.x, enemy.currentTransform.y, {
            maxRise: Math.max(4, Number(profile.maxStepHeight) || 0, height * 0.20),
            maxDrop: Math.max(4, Number(profile.maxFallDistance) || 0),
            width
        });
        if (resolved?.support) {
            lastResolved = resolved.support;
            if (resolved.support.id !== sourceSupport.id) {
                return {
                    status: "crossed",
                    fromSupportId: sourceSupport.id,
                    reachedSupportId: resolved.support.id,
                    ticks: tick,
                    finalX: enemy.currentTransform.x,
                    finalY: enemy.currentTransform.y,
                    physicalSupportId: enemy.supportId || null
                };
            }
        }
        if (moved <= 0.000001) {
            return {
                status: "blocked",
                fromSupportId: sourceSupport.id,
                reachedSupportId: null,
                ticks: tick,
                finalX: enemy.currentTransform.x,
                finalY: enemy.currentTransform.y,
                physicalSupportId: enemy.supportId || null
            };
        }
        if ((targetX - enemy.currentTransform.x) * walkDirection <= 0.5) break;
    }
    return {
        status: "no_crossing",
        fromSupportId: sourceSupport.id,
        reachedSupportId: lastResolved?.id !== sourceSupport.id ? lastResolved?.id || null : null,
        ticks: maxTicks,
        finalX: enemy.currentTransform.x,
        finalY: enemy.currentTransform.y,
        physicalSupportId: enemy.supportId || null
    };
}

export function verifyEnemyNavigationGraphBySimulation(world, graph, options = {}) {
    const fixedDt = FIXED_DT;
    const profile = normalizeEnemyNavigationProfile(graph?.profile || {});
    const supports = Array.isArray(graph?.supports) ? graph.supports : [];
    const sourceGraphEdges = Array.isArray(graph?.edges) ? graph.edges : [];
    const maxRunUpTicks = Math.max(1, Math.floor(Number(options.maxRunUpTicks) || 600));
    const maxStepTicks = Math.max(1, Math.floor(Number(options.maxStepTicks) || 600));
    const maxAirTicks = Math.max(1, Math.floor(Number(options.maxAirTicks) || 600));
    const onProgress = typeof options.onProgress === "function" ? options.onProgress : null;
    const progressInterval = Math.max(1, Math.floor(Number(options.progressInterval) || 25));
    const reuseExistingVerification = options.reuseExistingVerification === true;
    const totalCandidateEdges = sourceGraphEdges.reduce((sum, edge) => sum + ((edge?.type === "step" || edge?.type === "jump" || edge?.type === "drop") ? 1 : 0), 0);
    const totalCheckedEdges = sourceGraphEdges.reduce((sum, edge) => {
        if (edge?.type !== "step" && edge?.type !== "jump" && edge?.type !== "drop") return sum;
        const verification = String(edge?.verification || "").trim().toLowerCase();
        return sum + ((reuseExistingVerification && (verification === ENEMY_NAVIGATION_VERIFICATION_VERIFIED || verification === ENEMY_NAVIGATION_VERIFICATION_FAILED)) ? 0 : 1);
    }, 0);
    const startedAt = typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
    const failures = [];
    const verifiedEdges = [];
    const wrongSupportCandidates = [];
    let checkedEdges = 0;
    let checkedSteps = 0;
    let checkedJumps = 0;
    let checkedDrops = 0;
    let reusedEdges = 0;

    const supportById = new Map(supports.map((support) => [support.id, support]));
    const state = {
        world,
        tuning: {
            ...DEFAULT_TUNING,
            groundAcceleration: profile.groundAcceleration,
            gravity: profile.gravity
        }
    };

    const makeProbeEnemy = (edge) => {
        const sourceSupport = supportById.get(edge.from) || null;
        const targetSupport = supportById.get(edge.to) || null;
        let initialX = (edge.type === "jump" || edge.type === "drop") && Number.isFinite(Number(edge.runUpX))
            ? Number(edge.runUpX)
            : Number(edge.launchX);
        if (edge.type === "step" && sourceSupport) {
            const sourceCenter = (Number(sourceSupport.xMin) + Number(sourceSupport.xMax)) * 0.5;
            const targetCenter = targetSupport ? (Number(targetSupport.xMin) + Number(targetSupport.xMax)) * 0.5 : Number(edge.landingX);
            const direction = Math.sign(Number(edge.landingX) - Number(edge.launchX))
                || Math.sign(targetCenter - sourceCenter)
                || Math.sign(Number(edge.launchX) - sourceCenter)
                || 1;
            const inset = Math.max(2, Math.min(profile.edgeInset, Math.max(2, (sourceSupport.xMax - sourceSupport.xMin) * 0.25)));
            const runInDistance = Math.min(192, Math.max(profile.bodyWidth * 1.5, profile.runSpeed * 0.35));
            initialX = direction > 0
                ? Math.max(sourceSupport.xMin + inset, Number(edge.launchX) - runInDistance)
                : Math.min(sourceSupport.xMax - inset, Number(edge.launchX) + runInDistance);
            initialX = Math.max(sourceSupport.xMin, Math.min(sourceSupport.xMax, initialX));
        }
        const usesRunUp = (edge.type === "jump" || edge.type === "drop") && Number.isFinite(Number(edge.runUpX));
        const runUpSupport = usesRunUp
            ? (Array.isArray(edge.runUpSupportIds)
                ? edge.runUpSupportIds.map((id) => supportById.get(String(id || ""))).find((support) =>
                    support && initialX >= Number(support.xMin) - 0.05 && initialX <= Number(support.xMax) + 0.05)
                : null)
            : null;
        const initialPhysicalSupport = runUpSupport || sourceSupport;
        const fallbackY = initialPhysicalSupport
            ? supportPoint(initialPhysicalSupport, initialX, 0).y
            : Number(edge.launchY);
        const initialY = usesRunUp && Number.isFinite(Number(edge.runUpY))
            ? Number(edge.runUpY)
            : fallbackY;
        return {
            id: "navigation_simulation_probe",
            strategy: "hunter",
            locomotion: "ground",
            currentTransform: { x: initialX, y: initialY, scaleX: 1, scaleY: 1 },
            previousTransform: { x: initialX, y: initialY, scaleX: 1, scaleY: 1 },
            width: profile.bodyWidth,
            height: profile.bodyHeight,
            maxStepHeight: profile.maxStepHeight,
            maxDropDistance: profile.maxFallDistance,
            maxFallDistance: profile.maxFallDistance,
            runSpeed: profile.runSpeed,
            runAcceleration: profile.groundAcceleration,
            jumpHeight: profile.jumpHeight,
            jumpGravity: profile.gravity,
            velocityX: 0,
            velocityY: 0,
            groundVelocityX: 0,
            airborne: false,
            airTimer: 0,
            airTraversalType: null,
            airSourceSupportId: null,
            airSourceObstacleId: null,
            airTargetSupportId: null,
            supportId: initialPhysicalSupport ? enemyNavigationSupportCollisionId(initialPhysicalSupport) : null,
            currentSupportId: initialPhysicalSupport?.id || edge.from || null,
            ridingPlatformId: null,
            groundStride: null,
            route: [{ ...edge }],
            routeIndex: 0,
            routeTraversalPhase: null,
            routeTraversalEdgeIndex: -1,
            routeRepathTimer: 0,
            patrolDistance: 0,
            facing: Number(edge.vx) < 0 ? -1 : 1,
            movementPhase: "idle",
            aiState: "pursue",
            engaged: false,
            navigationFailureCount: 0,
            navigationTransitionFailures: {},
            navigationLastFailedTransitionKey: null,
            unreachableGlareDuration: 0,
            animationSlot: "idle",
            state: "idle",
            animationClock: { previous: 0, current: 0 }
        };
    };

    const failureRecord = (edge, index, reason, diagnostics, enemy, runUpTicks, stepTicks, airTicks) => ({
        edgeId: edge.id || `nav_edge_${index + 1}`,
        type: edge.type,
        from: edge.from,
        to: edge.to,
        reason,
        runUpTicks,
        stepTicks,
        airTicks,
        collisionId: diagnostics.firstHorizontalCollision?.id || diagnostics.firstCeilingCollision?.id || diagnostics.landingCollision?.id || null,
        landingCollisionId: diagnostics.landingCollision?.id || null,
        resolvedSupportId: diagnostics.resolvedSupportId || null,
        landedSupportId: diagnostics.landedSupportId || null,
        landingTargetCompatibility: diagnostics.landingTargetCompatibility || null,
        landingContactX: Number.isFinite(Number(diagnostics.landingCollision?.contactX)) ? roundedForDiagnostic(diagnostics.landingCollision.contactX) : null,
        landingContactY: Number.isFinite(Number(diagnostics.landingCollision?.surfaceY)) ? roundedForDiagnostic(diagnostics.landingCollision.surfaceY) : null,
        finalX: roundedForDiagnostic(enemy.currentTransform.x),
        finalY: roundedForDiagnostic(enemy.currentTransform.y)
    });

    const cachedFailureRecord = (edge, index) => {
        const diagnostics = edge?.verificationDiagnostics || {};
        return {
            edgeId: edge.id || `nav_edge_${index + 1}`,
            type: edge.type,
            from: edge.from,
            to: edge.to,
            reason: String(edge.verificationFailure || "simulation_failed"),
            runUpTicks: Math.max(0, Math.floor(Number(diagnostics.runUpTicks) || 0)),
            stepTicks: Math.max(0, Math.floor(Number(diagnostics.stepTicks) || 0)),
            airTicks: Math.max(0, Math.floor(Number(diagnostics.airTicks) || 0)),
            collisionId: diagnostics.collisionId || null,
            landingCollisionId: diagnostics.landingCollisionId || null,
            resolvedSupportId: diagnostics.resolvedSupportId || null,
            landedSupportId: diagnostics.landedSupportId || null,
            landingTargetCompatibility: diagnostics.landingTargetCompatibility || null,
            landingContactX: Number.isFinite(Number(diagnostics.landingContactX)) ? roundedForDiagnostic(diagnostics.landingContactX) : null,
            landingContactY: Number.isFinite(Number(diagnostics.landingContactY)) ? roundedForDiagnostic(diagnostics.landingContactY) : null,
            finalX: roundedForDiagnostic(diagnostics.finalX),
            finalY: roundedForDiagnostic(diagnostics.finalY)
        };
    };

    for (let index = 0; index < sourceGraphEdges.length; index += 1) {
        const edge = sourceGraphEdges[index];
        if (edge?.type !== "step" && edge?.type !== "jump" && edge?.type !== "drop") {
            verifiedEdges.push(edge);
            continue;
        }
        const existingVerification = String(edge?.verification || "").trim().toLowerCase();
        if (reuseExistingVerification
            && (existingVerification === ENEMY_NAVIGATION_VERIFICATION_VERIFIED || existingVerification === ENEMY_NAVIGATION_VERIFICATION_FAILED)) {
            reusedEdges += 1;
            verifiedEdges.push(edge);
            if (existingVerification === ENEMY_NAVIGATION_VERIFICATION_FAILED) {
                const failure = cachedFailureRecord(edge, index);
                failures.push(failure);
                if (String(failure.reason || "").trim().toLowerCase() === "landed_wrong_support") {
                    wrongSupportCandidates.push({ edge: { ...edge }, failure });
                }
            }
            continue;
        }
        checkedEdges += 1;
        if (edge.type === "step") checkedSteps += 1;
        else if (edge.type === "jump") checkedJumps += 1;
        else checkedDrops += 1;

        const enemy = makeProbeEnemy(edge);
        const diagnostics = { airTicks: 0, stepTicks: 0 };
        let runUpTicks = 0;
        let stepTicks = 0;
        let failureReason = null;

        if (edge.type === "step") {
            while (enemy.routeIndex === 0 && stepTicks < maxStepTicks) {
                stepTicks += 1;
                diagnostics.stepTicks = stepTicks;
                const currentSupport = supportById.get(String(enemy.currentSupportId || "")) || supportById.get(String(edge.from || "")) || null;
                const advanced = followCharacterEnemyNavigationPlan(state, enemy, {
                    supports,
                    current: currentSupport ? { support: currentSupport } : null
                }, fixedDt);
                if (!advanced) {
                    // A committed ground step may finish while resolving a brief
                    // unsupported fall. If that landing already advanced the route,
                    // the probe completed successfully even though there is no further
                    // route target for this isolated verifier fixture to follow.
                    if (enemy.routeIndex !== 0 && enemy.currentSupportId === edge.to) break;
                    failureReason = "step_blocked";
                    break;
                }
            }
            if (!failureReason && (enemy.routeIndex === 0 || enemy.currentSupportId !== edge.to)) failureReason = "step_timeout";
        } else if ((edge.type === "jump" || edge.type === "drop") && Number.isFinite(Number(edge.runUpX)) && Math.abs(Number(edge.vx) || 0) > 0.001) {
            while (!enemy.airborne && runUpTicks < maxRunUpTicks) {
                runUpTicks += 1;
                const advanced = followCharacterEnemyBallisticRunUp(state, enemy, edge, profile.runSpeed, fixedDt);
                if (!advanced) {
                    failureReason = "run_up_blocked";
                    break;
                }
            }
            if (!failureReason && !enemy.airborne) failureReason = "run_up_timeout";
        } else if ((edge.type === "jump" || edge.type === "drop") && Math.abs(Number(edge.vx) || 0) > 0.001) {
            // Non-vertical ballistic motion must be earned through the proven
            // ground run-up. Treat stale/malformed baked edges as failed
            // predictions instead of letting simulation inject edge.vx.
            failureReason = "missing_physical_run_up";
        } else if (edge.type !== "step" && !failureReason) {
            beginCharacterEnemyAirTraversal(enemy, edge);
        }

        let airTicks = 0;
        while (!failureReason && enemy.airborne && airTicks < maxAirTicks) {
            airTicks += 1;
            diagnostics.airTicks = airTicks;
            updateCharacterEnemyAirTraversal(state, enemy, fixedDt, supports, diagnostics);
        }
        if (!failureReason && enemy.airborne) failureReason = "air_timeout";

        const landedSupportId = diagnostics.landedSupportId || enemy.currentSupportId || null;
        if (edge.type !== "step" && !failureReason && landedSupportId !== edge.to) {
            if (diagnostics.firstHorizontalCollision) failureReason = "hit_wall";
            else if (diagnostics.firstCeilingCollision) failureReason = "hit_ceiling";
            else if (landedSupportId === edge.from) failureReason = "landed_source";
            else if (landedSupportId) failureReason = "landed_wrong_support";
            else if (diagnostics.timedOut) failureReason = "air_timeout";
            else failureReason = "no_support_landing";
        }

        if (failureReason) {
            const failure = failureRecord(edge, index, failureReason, diagnostics, enemy, runUpTicks, stepTicks, airTicks);
            failures.push(failure);
            if (failureReason === "landed_wrong_support") {
                wrongSupportCandidates.push({ edge: { ...edge }, failure });
            }
            verifiedEdges.push({
                ...edge,
                verification: ENEMY_NAVIGATION_VERIFICATION_FAILED,
                verificationFailure: failureReason,
                verificationDiagnostics: {
                    collisionId: failure.collisionId,
                    landingCollisionId: failure.landingCollisionId,
                    resolvedSupportId: failure.resolvedSupportId,
                    landedSupportId: failure.landedSupportId,
                    landingTargetCompatibility: failure.landingTargetCompatibility,
                    landingContactX: failure.landingContactX,
                    landingContactY: failure.landingContactY,
                    runUpTicks: failure.runUpTicks,
                    stepTicks: failure.stepTicks,
                    airTicks: failure.airTicks,
                    finalX: failure.finalX,
                    finalY: failure.finalY
                }
            });
        } else {
            verifiedEdges.push({
                ...edge,
                verification: ENEMY_NAVIGATION_VERIFICATION_VERIFIED,
                verificationFailure: undefined,
                verificationDiagnostics: undefined
            });
        }
        if (onProgress && (checkedEdges % progressInterval === 0 || checkedEdges === totalCheckedEdges)) {
            onProgress({
                checkedEdges,
                totalCheckedEdges,
                rejectedEdges: failures.length,
                checkedSteps,
                checkedJumps,
                checkedDrops
            });
        }
    }

    let salvageProofChecks = 0;
    let salvagedEdges = 0;
    if (options.salvageWrongSupportLandings !== false && wrongSupportCandidates.length > 0) {
        const connectivityEdges = verifiedEdges.filter(navigationSimulationEdgeUsableForConnectivity);
        const usedIds = new Set(verifiedEdges.map((edge) => String(edge?.id || "")).filter(Boolean));
        for (const candidate of wrongSupportCandidates) {
            const sourceEdge = candidate.edge;
            const failure = candidate.failure;
            const landedSupportId = String(failure?.landedSupportId || "");
            if (!landedSupportId || landedSupportId === String(sourceEdge?.from || "")) continue;
            const landedSupport = supportById.get(landedSupportId) || null;
            if (!landedSupport) continue;
            const stepHopsToIntendedTarget = navigationSimulationStepHops(
                verifiedEdges,
                landedSupportId,
                sourceEdge.to,
                NAVIGATION_LANDING_SALVAGE_MAX_STEP_HOPS
            );
            if (!stepHopsToIntendedTarget) continue;
            if (navigationSimulationReachable(connectivityEdges, sourceEdge.from, landedSupportId)) continue;

            const recoveredPoint = supportPoint(landedSupport, Number(failure.finalX), 0);
            const salvageMetadata = {
                kind: "landed_wrong_support",
                sourceEdgeId: sourceEdge.id || failure.edgeId,
                intendedTargetSupportId: sourceEdge.to,
                landedSupportId,
                stepHopsToIntendedTarget
            };
            const salvageEdge = {
                ...sourceEdge,
                id: navigationSimulationSalvageEdgeId(sourceEdge, landedSupportId, usedIds),
                to: landedSupportId,
                toObstacleId: landedSupport.sourcePolygonId || undefined,
                landingX: roundedForDiagnostic(recoveredPoint.x),
                landingY: roundedForDiagnostic(recoveredPoint.y),
                verification: "unverified",
                verificationFailure: undefined,
                verificationDiagnostics: undefined,
                heuristicRejectors: [],
                heuristicDiagnostics: {},
                simulationSalvage: salvageMetadata
            };
            salvageProofChecks += 1;
            const proof = verifyEnemyNavigationGraphBySimulation(world, {
                ...graph,
                edges: [salvageEdge]
            }, {
                maxRunUpTicks,
                maxStepTicks,
                maxAirTicks,
                progressInterval: 1,
                salvageWrongSupportLandings: false
            });
            const provenEdge = proof.graph?.edges?.[0];
            if (String(provenEdge?.verification || "").trim().toLowerCase() !== ENEMY_NAVIGATION_VERIFICATION_VERIFIED) continue;
            verifiedEdges.push({
                ...provenEdge,
                simulationSalvage: salvageMetadata
            });
            connectivityEdges.push(provenEdge);
            salvagedEdges += 1;
        }
    }

    const finishedAt = typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
    const verifiedGraph = rebuildEnemyNavigationWalkRegions({
            ...graph,
            edges: verifiedEdges,
            build: {
                ...(graph?.build || {}),
                simulationCheck: {
                    enabled: true,
                    fixedStep: 1 / 60,
                    verifiedTypes: ["step", "jump", "drop"],
                    checkedEdges: totalCandidateEdges,
                    simulatedEdges: checkedEdges + salvageProofChecks,
                    reusedEdges,
                    rejectedEdges: failures.length,
                    failedEdges: failures.length,
                    unverifiedEdges: 0,
                    salvageProofChecks,
                    salvagedEdges
                }
            }
        });
    return {
        graph: verifiedGraph,
        failures,
        summary: {
            checkedEdges,
            simulatedEdges: checkedEdges + salvageProofChecks,
            candidateEdges: totalCandidateEdges,
            reusedEdges,
            checkedSteps,
            checkedJumps,
            checkedDrops,
            rejectedEdges: failures.length,
            failedEdges: failures.length,
            verifiedEdges: totalCandidateEdges - failures.length,
            unverifiedEdges: 0,
            retainedEdges: verifiedEdges.length,
            salvageProofChecks,
            salvagedEdges,
            elapsedMs: Math.max(0, finishedAt - startedAt)
        }
    };
}

function roundedForDiagnostic(value) {
    return Math.round((Number(value) || 0) * 1000) / 1000;
}

function characterEnemyHasCommittedTraversal(enemy) {
    if (enemy.airborne === true) return true;
    const runUpPhase = enemy.routeTraversalPhase === "approach_run_up" || enemy.routeTraversalPhase === "run_up";
    const routeIndex = Number(enemy.routeIndex) || 0;
    const traversalEdgeIndex = Number.isFinite(Number(enemy.routeTraversalEdgeIndex))
        ? Number(enemy.routeTraversalEdgeIndex)
        : -1;
    const validRouteEdge = Array.isArray(enemy.route) && traversalEdgeIndex >= 0 &&
        traversalEdgeIndex === routeIndex && traversalEdgeIndex < enemy.route.length;
    return runUpPhase && validRouteEdge;
}

function characterEnemyNavigationAtomicBaseSupportId(id) {
    return String(id || "").replace(/_nav_\d+$/, "");
}

function characterEnemyCommittedRunUpOnAllowedSupport(enemy, edge, currentSupport) {
    if (!edge || (edge.type !== "jump" && edge.type !== "drop") || !currentSupport || !characterEnemyHasCommittedTraversal(enemy)) return false;
    if (!Number.isFinite(Number(edge.runUpX)) || Math.abs(Number(edge.vx) || 0) <= 0.001) return false;
    const allowed = Array.isArray(edge.runUpSupportIds) ? edge.runUpSupportIds.map(String) : [];
    if (allowed.length) return allowed.includes(String(currentSupport.id || ""));
    // Compatibility fallback for transient/dynamic edges created before the
    // explicit run-up chain metadata was attached.
    return characterEnemyNavigationAtomicBaseSupportId(currentSupport.id) ===
        characterEnemyNavigationAtomicBaseSupportId(edge.from);
}

function prepareCharacterEnemyRunUp(enemy, edge) {
    enemy.routeTraversalPhase = "approach_run_up";
    enemy.routeTraversalEdgeIndex = enemy.routeIndex;
    enemy.movementPhase = "approach_run_up";
}

function followCharacterEnemyBallisticRunUp(state, enemy, edge, speed, dt) {
    const runUpX = Number(edge.runUpX);
    const launchX = Number(edge.launchX);
    const requiredVelocity = Number(edge.vx) || 0;
    const direction = requiredVelocity < 0 ? -1 : 1;
    const acceleration = Math.max(1, Number(edge.groundAcceleration) || Number(enemy.runAcceleration) || state.tuning.groundAcceleration || 950);
    const targetSpeed = Math.min(Math.max(0, speed), Math.abs(requiredVelocity));
    const arrivalTolerance = 0.05;

    if (enemy.routeTraversalEdgeIndex !== enemy.routeIndex || !characterEnemyHasCommittedTraversal(enemy)) {
        prepareCharacterEnemyRunUp(enemy, edge);
    }

    if (enemy.routeTraversalPhase === "approach_run_up") {
        // runUpX is the MINIMUM runway boundary, not a point the actor must
        // servo onto exactly. Any settled position farther away from the launch
        // point provides at least as much proven acceleration distance. Treating
        // runUpX as an exact target made the controller hunt back and forth by
        // fractions of a pixel before otherwise valid jumps.
        const runwaySurplus = (runUpX - enemy.currentTransform.x) * direction;
        const approachSpeed = Math.abs(Number(enemy.groundVelocityX) || 0);
        const settleSpeed = 0.05;
        if (runwaySurplus >= -arrivalTolerance) {
            if (approachSpeed > settleSpeed) {
                const moved = moveCharacterEnemyToward(
                    state, enemy, enemy.currentTransform.x, 0, dt, 0, true
                );
                if (enemy.airborne) return false;
                enemy.movementPhase = "approach_run_up";
                setCharacterEnemyAnimation(enemy, moved > 0.0001 ? "walk" : "idle");
                return true;
            }
            enemy.routeTraversalPhase = "run_up";
        } else {
            // We are launch-ward of the minimum runway boundary. Move back
            // through it monotonically; once enough runway exists, release input
            // and let ordinary ground friction settle the actor. No exact-point
            // reversal is required.
            const moved = moveCharacterEnemyToward(state, enemy, runUpX, speed, dt, 0, false);
            if ((moved <= 0 && approachSpeed <= settleSpeed) || enemy.airborne) {
                return false;
            }
            enemy.movementPhase = "approach_run_up";
            setCharacterEnemyAnimation(enemy, moved > 0.0001 ? "walk" : "idle");
            return true;
        }
    }

    const distanceToLaunch = Math.abs(launchX - enemy.currentTransform.x);
    const launchTolerance = 0.05;
    const requiredSpeedTolerance = Math.max(0.001, targetSpeed * 0.002);
    const currentSpeed = Math.abs(Number(enemy.groundVelocityX) || 0);
    if (distanceToLaunch <= launchTolerance && currentSpeed + requiredSpeedTolerance >= targetSpeed) {
        const takeoffVelocityX = enemy.groundVelocityX;
        beginCharacterEnemyAirTraversal(enemy, edge, takeoffVelocityX);
        return true;
    }

    const nextSpeed = Math.min(targetSpeed, currentSpeed + acceleration * dt);
    enemy.groundVelocityX = direction * nextSpeed;

    // launchX is a real ballistic boundary, but fixed-step ground motion must not
    // require the actor center to land on that mathematical x at the end of a
    // 60 Hz tick. If this tick physically crosses the launch boundary at the
    // required speed, consume only the ground-time needed to reach it and take
    // off there. This is continuous sub-step integration, not a position snap.
    const distanceAlongRun = (launchX - enemy.currentTransform.x) * direction;
    const launchCrossingThisTick = distanceAlongRun >= -launchTolerance
        && distanceAlongRun <= nextSpeed * dt + launchTolerance
        && nextSpeed + requiredSpeedTolerance >= targetSpeed;
    if (launchCrossingThisTick) {
        const launchDt = nextSpeed > 0
            ? clamp(Math.max(0, distanceAlongRun) / nextSpeed, 0, dt)
            : 0;
        if (launchDt > 0.0000001) {
            const movedToLaunch = moveCharacterEnemyToward(
                state, enemy, launchX, nextSpeed, launchDt, 0, false
            );
            if (movedToLaunch <= 0 || enemy.airborne) return false;
        }
        if (Math.abs(launchX - enemy.currentTransform.x) <= launchTolerance) {
            const takeoffVelocityX = enemy.groundVelocityX;
            beginCharacterEnemyAirTraversal(enemy, edge, takeoffVelocityX);
            return true;
        }
    }

    const moved = moveCharacterEnemyToward(state, enemy, launchX, nextSpeed, dt, 0, false);
    if (moved <= 0 || enemy.airborne) {
        return false;
    }
    enemy.facing = direction;
    enemy.movementPhase = "run_up";
    setCharacterEnemyAnimation(enemy, "walk");

    if (Math.abs(launchX - enemy.currentTransform.x) <= launchTolerance &&
        Math.abs(Number(enemy.groundVelocityX) || 0) + requiredSpeedTolerance >= targetSpeed) {
        const takeoffVelocityX = enemy.groundVelocityX;
        beginCharacterEnemyAirTraversal(enemy, edge, takeoffVelocityX);
    }
    return true;
}

function characterEnemyNavigationZeroLengthSeam(edge, fromSupport, toSupport) {
    if (edge?.type !== "step" || !fromSupport || !toSupport) return false;
    const travel = Math.hypot(
        (Number(edge.landingX) || 0) - (Number(edge.launchX) || 0),
        (Number(edge.landingY) || 0) - (Number(edge.launchY) || 0)
    );
    return travel <= 0.1 && enemyNavigationSupportsShareEndpoint(fromSupport, toSupport, 0.75);
}

function characterEnemyNavigationSeamCrossTargetX(enemy, edge, fromSupport, toSupport) {
    const seamX = Number(edge?.landingX);
    if (!Number.isFinite(seamX) || !fromSupport || !toSupport) return { x: seamX, direction: 0 };
    const fromMid = (Number(fromSupport.xMin) + Number(fromSupport.xMax)) * 0.5;
    const toMid = (Number(toSupport.xMin) + Number(toSupport.xMax)) * 0.5;
    let direction = toMid < fromMid - 0.0001 ? -1 : toMid > fromMid + 0.0001 ? 1 : 0;
    if (!direction) {
        const fromX = Number(edge?.launchX);
        const toX = Number(edge?.landingX);
        direction = toX < fromX ? -1 : toX > fromX ? 1 : 0;
    }
    if (!direction) return { x: seamX, direction: 0 };

    const span = Math.max(0, Number(toSupport.xMax) - Number(toSupport.xMin));
    const inset = Math.min(
        Math.max(0.05, span * 0.25),
        Math.max(0.75, (Number(enemy?.width) || 0) * 0.02)
    );
    const margin = Math.min(0.02, span * 0.1);
    const minX = Number(toSupport.xMin) + margin;
    const maxX = Number(toSupport.xMax) - margin;
    const candidate = seamX + direction * inset;
    return {
        x: minX <= maxX ? clamp(candidate, minX, maxX) : toMid,
        direction
    };
}

function characterEnemyNavigationStepCrossTargetX(enemy, edge, fromSupport, toSupport, zeroLengthSeam = false) {
    const seamTarget = characterEnemyNavigationSeamCrossTargetX(enemy, edge, fromSupport, toSupport);
    if (zeroLengthSeam || !fromSupport || !toSupport || !seamTarget.direction) return seamTarget;

    const span = Math.max(0, Number(toSupport.xMax) - Number(toSupport.xMin));
    const bodyCrossInset = Math.max(2, (Number(enemy?.width) || 0) * 0.5 + 2);
    const inset = Math.min(bodyCrossInset, Math.max(0.05, span * 0.5));
    const margin = Math.min(0.02, span * 0.1);
    const minX = Number(toSupport.xMin) + margin;
    const maxX = Number(toSupport.xMax) - margin;
    const landingX = Number(edge?.landingX);
    const candidate = landingX + seamTarget.direction * inset;
    return {
        x: minX <= maxX ? clamp(candidate, minX, maxX) : (Number(toSupport.xMin) + Number(toSupport.xMax)) * 0.5,
        direction: seamTarget.direction
    };
}

function followCharacterEnemyNavigationPlan(state, enemy, navigation, dt) {
    if (enemy.airborne) {
        return updateCharacterEnemyAirTraversal(state, enemy, dt, navigation.supports);
    }
    const current = navigation.current?.support;
    if (!current) {
        return false;
    }
    enemy.currentSupportId = current.id;

    while (enemy.routeIndex < (enemy.route?.length || 0) && enemy.route[enemy.routeIndex].to === current.id) {
        enemy.routeIndex += 1;
    }
    const edge = enemy.route?.[enemy.routeIndex];
    const speed = characterEnemyRunSpeed(enemy, state.tuning);
    if (edge) {
        const committedSiblingRunUp = characterEnemyCommittedRunUpOnAllowedSupport(enemy, edge, current);
        const traversalSourceSupport = committedSiblingRunUp
            ? (navigationSupportById(navigation.supports, edge.from) || current)
            : current;
        if ((!committedSiblingRunUp && edge.from !== current.id) || !enemyNavigationTraversalAllowedFromSupport(
            edge,
            traversalSourceSupport,
            navigation.supports,
            characterEnemyNavigationOptions(enemy, state)
        )) {
            enemy.routeTraversalPhase = null;
            enemy.routeTraversalEdgeIndex = -1;
            return false;
        }
        if ((edge.type === "jump" || edge.type === "drop") && Number.isFinite(Number(edge.runUpX)) && Math.abs(Number(edge.vx) || 0) > 0.001) {
            const followed = followCharacterEnemyBallisticRunUp(state, enemy, edge, speed, dt);
            if (!followed) {
                recordCharacterEnemyNavigationTransitionFailure(state, enemy, edge, current.id, "run_up_blocked");
                clearCharacterEnemyNavigationPlan(enemy);
                enemy.routeRepathTimer = 0;
            }
            return followed;
        }
        const launchSupport = navigationSupportById(navigation.supports, edge.from);
        const landingSupport = navigationSupportById(navigation.supports, edge.to);
        const zeroLengthSeam = characterEnemyNavigationZeroLengthSeam(edge, launchSupport, landingSupport);
        if ((edge.type === "jump" || edge.type === "drop") && Math.abs(Number(edge.vx) || 0) > 0.001 &&
            !Number.isFinite(Number(edge.runUpX))) {
            recordCharacterEnemyNavigationTransitionFailure(state, enemy, edge, current.id, "missing_physical_run_up");
            clearCharacterEnemyNavigationPlan(enemy);
            enemy.routeRepathTimer = 0;
            return false;
        }
        const distanceToLaunch = Math.abs(enemy.currentTransform.x - edge.launchX);
        const standingBallisticLaunch = (edge.type === "jump" || edge.type === "drop") && Math.abs(Number(edge.vx) || 0) <= 0.001;
        const committedGroundStep = edge.type === "step" && enemy.routeTraversalPhase === "ground_step" && enemy.routeTraversalEdgeIndex === enemy.routeIndex;
        const groundStepTraversal = edge.type === "step";
        const standingLaunchTolerance = 2;
        const standingLaunchSettleSpeed = 0.05;
        const launchPositionTolerance = standingBallisticLaunch ? standingLaunchTolerance : 0.05;
        const launchSettleSpeed = standingBallisticLaunch ? standingLaunchSettleSpeed : 0.001;
        const launchGroundSpeed = Math.abs(Number(enemy.groundVelocityX) || 0);
        if (!zeroLengthSeam && !groundStepTraversal && !committedGroundStep &&
            (distanceToLaunch > launchPositionTolerance || (standingBallisticLaunch && launchGroundSpeed > standingLaunchSettleSpeed))) {
            // Ground steps are ordinary physical locomotion: launchX is a graph
            // boundary, not an exact actor-center rendezvous. Commit directly to the
            // landing and let ground stride/support physics decide whether the seam
            // is traversable. Ballistic launches still settle near their launch point.
            const launchStopDistance = standingBallisticLaunch ? standingLaunchTolerance : 0;
            const moved = moveCharacterEnemyToward(state, enemy, edge.launchX, speed, dt, launchStopDistance, true);
            if ((moved <= 0 && distanceToLaunch > launchPositionTolerance && launchGroundSpeed <= launchSettleSpeed) || enemy.airborne) {
                recordCharacterEnemyNavigationTransitionFailure(state, enemy, edge, current.id, "launch_approach_blocked");
                clearCharacterEnemyNavigationPlan(enemy);
                enemy.routeRepathTimer = 0;
                return false;
            }
            enemy.movementPhase = "pursue";
            setCharacterEnemyAnimation(enemy, moved > 0.0001 ? "walk" : "idle");
            return true;
        }
        if (edge.type === "step") {
            enemy.routeTraversalPhase = "ground_step";
            enemy.routeTraversalEdgeIndex = enemy.routeIndex;
            if (characterEnemyBodyBlockedAt(state, enemy, edge.landingX, edge.landingY, {
                groundSlope: characterEnemySupportSlope(landingSupport)
            })) {
                recordCharacterEnemyNavigationTransitionFailure(state, enemy, edge, current.id, "step_landing_blocked");
                clearCharacterEnemyNavigationPlan(enemy);
                enemy.routeRepathTimer = 0;
                return false;
            }
            const destinationObstacleId = edge.toObstacleId || landingSupport?.sourcePolygonId || null;
            if (characterEnemyNavigationStepLandingPenetratesForeignBlocker(
                state,
                enemy,
                edge.landingX,
                edge.landingY,
                destinationObstacleId
            )) {
                recordCharacterEnemyNavigationTransitionFailure(state, enemy, edge, current.id, "step_landing_penetration");
                clearCharacterEnemyNavigationPlan(enemy);
                enemy.routeRepathTimer = 0;
                return false;
            }

            // A navigation step is a plan, not a transport operation. Walk the
            // physical actor toward the planned foothold and let ordinary ground
            // support/collision decide whether the seam can actually be crossed.
            // The old code snapped directly to landingX/Y, which allowed a bad
            // cyan step edge to teleport an enemy across a disconnected gap.
            const seamTarget = characterEnemyNavigationStepCrossTargetX(
                enemy, edge, launchSupport, landingSupport, zeroLengthSeam
            );
            const stepTargetX = Number.isFinite(Number(seamTarget.x)) ? Number(seamTarget.x) : Number(edge.landingX);
            const arrivalTolerance = zeroLengthSeam ? 0.15 : Math.max(1.5, speed * dt * 0.75);
            const distanceToLanding = Math.abs(enemy.currentTransform.x - stepTargetX);
            if (distanceToLanding > 0.05) {
                const moved = moveCharacterEnemyToward(
                    state, enemy, stepTargetX, speed, dt, 0, !zeroLengthSeam,
                    [launchSupport, landingSupport].filter(Boolean)
                );
                if (moved <= 0) {
                    recordCharacterEnemyNavigationTransitionFailure(
                        state,
                        enemy,
                        edge,
                        current.id,
                        "step_physical_traversal_failed"
                    );
                    clearCharacterEnemyNavigationPlan(enemy);
                    enemy.routeRepathTimer = 0;
                    return false;
                }
                // A short unsupported phase can be the physical downhill part of
                // an otherwise ordinary ground step. Keep the committed route and
                // let the landing resolver decide whether the destination was reached.
                if (enemy.airborne) return true;
            }
            const seamProgress = zeroLengthSeam && seamTarget.direction
                ? seamTarget.direction * (enemy.currentTransform.x - Number(edge.landingX))
                : 0;
            const seamCrossed = zeroLengthSeam && seamTarget.direction && seamProgress >= 0.025;

            const physicalSupport = findCharacterEnemyGroundSupport(
                state,
                enemy.currentTransform.x,
                enemy.currentTransform.y,
                Math.max(4, Number(enemy.maxStepHeight) || 0),
                Math.max(4, Number(enemy.maxDropDistance) || 0),
                enemy.width
            );
            const reachedNavigationSupport = findEnemyNavigationSupport(
                navigation.supports,
                enemy.currentTransform.x,
                enemy.currentTransform.y,
                {
                    maxRise: 5,
                    maxDrop: 5,
                    width: enemy.width,
                    sampleHalfWidthFactor: 0.48,
                    preferredSupportId: edge.to
                }
            );
            const reachedDestination = Boolean(physicalSupport) && (
                zeroLengthSeam ? seamCrossed : reachedNavigationSupport?.support?.id === edge.to
            );
            if (!reachedDestination && Math.abs(enemy.currentTransform.x - stepTargetX) > arrivalTolerance) {
                enemy.routeTraversalPhase = "ground_step";
                enemy.routeTraversalEdgeIndex = enemy.routeIndex;
                enemy.movementPhase = "pursue";
                setCharacterEnemyAnimation(enemy, "walk");
                return true;
            }
            if (!reachedDestination) {
                recordCharacterEnemyNavigationTransitionFailure(
                    state,
                    enemy,
                    edge,
                    reachedNavigationSupport?.support?.id || current.id,
                    "step_wrong_support"
                );
                clearCharacterEnemyNavigationPlan(enemy);
                enemy.routeRepathTimer = 0;
                return false;
            }
            enemy.currentSupportId = edge.to;
            setCharacterEnemyGroundSupportIdentity(state, enemy, physicalSupport);
            recordCharacterEnemyNavigationTransitionSuccess(enemy, edge);
            enemy.routeIndex += 1;
            enemy.routeTraversalPhase = null;
            enemy.routeTraversalEdgeIndex = -1;
            enemy.movementPhase = "pursue";
            setCharacterEnemyAnimation(enemy, "walk");
            return true;
        }
        beginCharacterEnemyAirTraversal(enemy, edge, enemy.groundVelocityX);
        return true;
    }

    const targetSupport = navigationSupportById(navigation.supports, enemy.routeTargetSupportId);
    const currentWalkRegionId = current.walkRegionId || null;
    const targetWalkRegionId = targetSupport?.walkRegionId || null;
    const onTargetSupportOrRegion = current.id === enemy.routeTargetSupportId || Boolean(
        currentWalkRegionId && targetWalkRegionId && currentWalkRegionId === targetWalkRegionId
    );
    if (enemy.routeTargetSupportId && enemy.routeIndex >= (enemy.route?.length || 0) && !onTargetSupportOrRegion) {
        // A completed route cannot be followed as a mere X target after physics has
        // moved the actor onto a different walk region. This was the rev530 level_003
        // watchdog case: a zero-edge return-home plan survived a fall to the lower
        // grass floor and then idled forever directly below home. Force the caller to
        // clear/replan immediately instead of waiting three seconds for the watchdog.
        return false;
    }

    const finalPoint = characterEnemyNavigationTargetPoint(enemy, navigation);
    if (!finalPoint) {
        return false;
    }
    const finalMovementPhase = enemy.routePurpose === "return_home"
        ? "return_home"
        : enemy.routePurpose === "last_seen"
            ? "investigate_last_seen"
            : enemy.routePurpose === "blocked_approach"
                ? "blocked_approach"
                : "position_for_attack";
    const finalDistance = Math.abs(enemy.currentTransform.x - finalPoint.x);
    const finalGroundSpeed = Math.abs(Number(enemy.groundVelocityX) || 0);
    if (finalDistance <= 2 && finalGroundSpeed <= 0.05) {
        if (enemy.engaged && (enemy.routePurpose === "attack_position" || enemy.routePurpose === "pursue" || enemy.routePurpose === "blocked_approach")) {
            const dx = state.player.currentTransform.x - enemy.currentTransform.x;
            if (Math.abs(dx) > 0.001) {
                enemy.facing = dx < 0 ? -1 : 1;
            }
        }
        enemy.movementPhase = enemy.routePurpose === "last_seen" &&
            characterEnemyReachedNavigationTarget(enemy, navigation, 2)
            ? "last_seen_hold"
            : finalMovementPhase;
        setCharacterEnemyAnimation(enemy, "idle");
        return true;
    }
    // Final navigation targets are tolerance regions, not mathematical points.
    // Once inside the 2 px arrival band, release directional input and let real
    // ground friction settle the actor instead of commanding a left/right
    // reversal every time discrete integration crosses the exact coordinate.
    const moved = moveCharacterEnemyToward(state, enemy, finalPoint.x, speed, dt, 2, true);
    if (moved <= 0 && finalDistance > 2) {
        return false;
    }
    enemy.movementPhase = enemy.routePurpose === "return_home"
        ? "return_home"
        : enemy.routePurpose === "last_seen"
            ? "investigate_last_seen"
            : "pursue";
    setCharacterEnemyAnimation(enemy, "walk");
    return true;
}

const CHARACTER_ENEMY_REENGAGE_COOLDOWN_SECONDS = 2;
const CHARACTER_ENEMY_HUNTER_WATCHDOG_PROGRESS_DISTANCE = 20;
const CHARACTER_ENEMY_HUNTER_WATCHDOG_TIMEOUT_SECONDS = 3;
const CHARACTER_ENEMY_HUNTER_WATCHDOG_RETURN_HOME_TIMEOUTS = 3;
const CHARACTER_ENEMY_HUNTER_WATCHDOG_GUARD_TIMEOUTS = 4;
const CHARACTER_ENEMY_HUNTER_WATCHDOG_RECOVERY_SECONDS = 1.5;

function resetCharacterEnemyHunterWatchdog(enemy, resetTimeoutCount = true) {
    enemy.hunterWatchdogX = Number(enemy.currentTransform.x) || 0;
    enemy.hunterWatchdogY = Number(enemy.currentTransform.y) || 0;
    enemy.hunterWatchdogElapsed = 0;
    if (resetTimeoutCount) {
        enemy.hunterWatchdogTimeoutCount = 0;
    }
}

function characterEnemyHunterWatchdogActive(enemy) {
    if (enemy.strategy !== "hunter" || enemy.locomotion !== "ground" || enemy.health <= 0) {
        return false;
    }
    if (enemy.combatState === ENEMY_COMBAT_STATE.ATTACKING || enemy.combatState === ENEMY_COMBAT_STATE.HURT ||
        enemy.combatState === ENEMY_COMBAT_STATE.DEAD || enemy.deathPendingLanding === true) {
        return false;
    }
    if (enemy.movementPhase === "glare" || enemy.movementPhase === "position_for_attack" ||
        enemy.movementPhase === "last_seen_hold") {
        return false;
    }
    // The recovery timer may outlive the short stranded-patrol state. It must
    // not keep the watchdog armed after normal patrol resumes, otherwise an
    // ordinary idle patrol can be reported as a stall.
    if (enemy.aiState === "stranded_patrol" && (Number(enemy.hunterWatchdogTimeoutCount) || 0) > 0) {
        return true;
    }
    return enemy.engaged === true || enemy.airborne === true || characterEnemyHasCommittedTraversal(enemy) ||
        enemy.aiState === "pursue" || enemy.aiState === "investigate_last_seen" ||
        enemy.aiState === "return_home" || enemy.aiState === "jump" || enemy.aiState === "drop";
}

function characterEnemyHunterWatchdogPaused(enemy) {
    if (enemy.combatState === ENEMY_COMBAT_STATE.ATTACKING || enemy.combatState === ENEMY_COMBAT_STATE.HURT ||
        enemy.combatState === ENEMY_COMBAT_STATE.DEAD || enemy.deathPendingLanding === true) {
        return true;
    }
    return enemy.movementPhase === "glare" || enemy.movementPhase === "position_for_attack" ||
        enemy.movementPhase === "last_seen_hold";
}

export function recordDebugExceptionAlert(state, incident = {}) {
    if (!state || typeof state !== "object") return null;
    if (!state.debug || typeof state.debug !== "object") state.debug = {};
    state.debug.exceptionAlertSequence = (Number(state.debug.exceptionAlertSequence) || 0) + 1;
    const recorded = {
        ...incident,
        type: String(incident?.type || "unexpectedRuntimeFallback"),
        sequence: state.debug.exceptionAlertSequence,
        tick: Number.isFinite(Number(incident?.tick)) ? Number(incident.tick) : (Number(state.clock?.tick) || 0),
        time: Number.isFinite(Number(incident?.time)) ? Number(incident.time) : (Number(state.clock?.time) || 0)
    };
    if (!Array.isArray(state.debug.exceptionAlerts)) state.debug.exceptionAlerts = [];
    state.debug.exceptionAlerts.push(recorded);
    while (state.debug.exceptionAlerts.length > 32) state.debug.exceptionAlerts.shift();
    return recorded;
}

function recordCharacterEnemyHunterWatchdogException(state, enemy, timeoutCount, recoveryAction) {
    const incident = {
        type: "hunterWatchdogTimeout",
        enemyId: enemy.id || null,
        enemyCatalogId: enemy.enemyCatalogId || null,
        characterId: enemy.characterId || null,
        timeoutCount,
        recoveryAction,
        x: Number(enemy.currentTransform?.x) || 0,
        y: Number(enemy.currentTransform?.y) || 0,
        vx: Number(enemy.velocityX) || 0,
        vy: Number(enemy.velocityY) || 0,
        watchdogX: Number.isFinite(Number(enemy.hunterWatchdogX)) ? Number(enemy.hunterWatchdogX) : null,
        watchdogY: Number.isFinite(Number(enemy.hunterWatchdogY)) ? Number(enemy.hunterWatchdogY) : null,
        watchdogElapsed: Number(enemy.hunterWatchdogElapsed) || 0,
        aiState: enemy.aiState || null,
        movementPhase: enemy.movementPhase || null,
        combatState: enemy.combatState || null,
        engaged: enemy.engaged === true,
        alerted: enemy.alerted === true,
        airborne: enemy.airborne === true,
        supportId: enemy.supportId || null,
        currentSupportId: enemy.currentSupportId || null,
        homeSupportId: enemy.homeSupportId || null,
        routePurpose: enemy.routePurpose || null,
        routeIndex: Number(enemy.routeIndex) || 0,
        routeLength: Array.isArray(enemy.route) ? enemy.route.length : 0,
        routeTargetSupportId: enemy.routeTargetSupportId || null,
        routeTargetX: Number.isFinite(Number(enemy.routeTargetX)) ? Number(enemy.routeTargetX) : null,
        routeTargetY: Number.isFinite(Number(enemy.routeTargetY)) ? Number(enemy.routeTargetY) : null,
        routeTraversalPhase: enemy.routeTraversalPhase || null,
        routeTraversalEdgeIndex: Number.isFinite(Number(enemy.routeTraversalEdgeIndex))
            ? Number(enemy.routeTraversalEdgeIndex)
            : -1,
        airTraversalType: enemy.airTraversalType || null,
        airSourceSupportId: enemy.airSourceSupportId || null,
        airTargetSupportId: enemy.airTargetSupportId || null,
        lastSeenPlayerX: Number.isFinite(Number(enemy.lastSeenPlayerX)) ? Number(enemy.lastSeenPlayerX) : null,
        lastSeenPlayerY: Number.isFinite(Number(enemy.lastSeenPlayerY)) ? Number(enemy.lastSeenPlayerY) : null,
        lastSeenSupportId: enemy.lastSeenSupportId || null,
        spawnX: Number(enemy.spawnX) || 0,
        spawnY: Number(enemy.spawnY) || 0,
        playerX: Number(state.player?.currentTransform?.x) || 0,
        playerY: Number(state.player?.currentTransform?.y) || 0
    };
    return recordDebugExceptionAlert(state, incident);
}

function abortCharacterEnemyTraversalForWatchdog(state, enemy) {
    enemy.velocityX = 0;
    enemy.velocityY = 0;
    enemy.groundVelocityX = 0;
    enemy.routeTraversalPhase = null;
    enemy.routeTraversalEdgeIndex = -1;
    enemy.airTimer = 0;
    enemy.airTraversalType = null;
    enemy.airSourceSupportId = null;
    enemy.airSourceObstacleId = null;
    enemy.airTargetSupportId = null;

    const support = findCharacterEnemyGroundSupport(
        state,
        enemy.currentTransform.x,
        enemy.currentTransform.y,
        Math.max(8, Number(enemy.groundSnapDistance) || 0, Number(enemy.maxStepHeight) || 0),
        Math.max(12, Number(enemy.groundSnapDistance) || 0, Number(enemy.maxDropDistance) || 0),
        enemy.width
    );
    if (support) {
        enemy.currentTransform.y = support.y;
        enemy.airborne = false;
        setCharacterEnemyGroundSupportIdentity(state, enemy, support);
    } else {
        // A watchdog recovery in mid-air must still obey gravity rather than
        // pinning the enemy in place. The normal hunter air integrator will
        // settle it onto the next valid support before another route is chosen.
        enemy.airborne = true;
        enemy.velocityY = Math.max(0, Number(enemy.velocityY) || 0);
    }
}

function onCharacterEnemyHunterWatchdogTimeout(state, enemy) {
    const returnHomeAlreadyFailed = enemy.aiState === "return_home" &&
        (Number(enemy.hunterWatchdogTimeoutCount) || 0) >= CHARACTER_ENEMY_HUNTER_WATCHDOG_RETURN_HOME_TIMEOUTS;
    enemy.hunterWatchdogTimeoutCount = (Number(enemy.hunterWatchdogTimeoutCount) || 0) + 1;
    const timeoutCount = enemy.hunterWatchdogTimeoutCount;
    const recoveryAction = returnHomeAlreadyFailed
        ? "guard_current_support"
        : timeoutCount >= CHARACTER_ENEMY_HUNTER_WATCHDOG_RETURN_HOME_TIMEOUTS
            ? "return_home"
            : "local_recovery";
    // Capture the full stalled interval before refreshing the anchor.
    recordCharacterEnemyHunterWatchdogException(state, enemy, timeoutCount, recoveryAction);
    resetCharacterEnemyHunterWatchdog(enemy, false);
    abortCharacterEnemyTraversalForWatchdog(state, enemy);
    clearCharacterEnemyNavigationPlan(enemy);
    enemy.routeRepathTimer = 0;

    if (returnHomeAlreadyFailed && timeoutCount >= CHARACTER_ENEMY_HUNTER_WATCHDOG_GUARD_TIMEOUTS) {
        enemy.engaged = false;
        enemy.alerted = false;
        enemy.aiState = "guard";
        enemy.movementPhase = "guard";
        enemy.hunterWatchdogRecoveryTimer = 0;
        enemy.phaseTimer = 0;
        setCharacterEnemyAnimation(enemy, "idle");
        addEvent(state, "ENEMY_HUNTER_WATCHDOG_GUARD", {
            enemyId: enemy.id,
            timeoutCount,
            recoveryAction
        });
        return;
    }

    if (timeoutCount >= CHARACTER_ENEMY_HUNTER_WATCHDOG_RETURN_HOME_TIMEOUTS) {
        enemy.engaged = false;
        enemy.alerted = false;
        enemy.aiState = "return_home";
        enemy.movementPhase = "return_home";
        enemy.unreachableReengageCooldownTimer = CHARACTER_ENEMY_REENGAGE_COOLDOWN_SECONDS;
        enemy.hunterWatchdogRecoveryTimer = 0;
        setCharacterEnemyAnimation(enemy, "idle");
        addEvent(state, "ENEMY_HUNTER_WATCHDOG_RETURN_HOME", {
            enemyId: enemy.id,
            timeoutCount,
            recoveryAction
        });
        return;
    }

    const navigation = characterEnemyNavigationContext(state, enemy);
    enterCharacterEnemyStrandedPatrol(state, enemy, navigation);
    enemy.hunterWatchdogRecoveryTimer = CHARACTER_ENEMY_HUNTER_WATCHDOG_RECOVERY_SECONDS;
    enemy.phaseTimer = 0;
    enemy.movementPhase = "stranded_patrol";
    const minX = Number(enemy.temporaryPatrolMinX);
    const maxX = Number(enemy.temporaryPatrolMaxX);
    if (Number.isFinite(minX) && Number.isFinite(maxX)) {
        enemy.facing = (maxX - enemy.currentTransform.x) >= (enemy.currentTransform.x - minX) ? 1 : -1;
    }
    setCharacterEnemyAnimation(enemy, "walk");
    addEvent(state, "ENEMY_HUNTER_WATCHDOG_RECOVERY", {
        enemyId: enemy.id,
        timeoutCount,
        recoveryAction,
        supportId: navigation.current?.support?.id || null
    });
}

function updateCharacterEnemyHunterWatchdog(state, enemy, dt) {
    enemy.hunterWatchdogRecoveryTimer = Math.max(
        0,
        (Number(enemy.hunterWatchdogRecoveryTimer) || 0) - Math.max(0, Number(dt) || 0)
    );

    if (enemy.strategy !== "hunter" || enemy.locomotion !== "ground" || enemy.health <= 0) {
        resetCharacterEnemyHunterWatchdog(enemy, true);
        return;
    }

    // Intentional holds and reactions pause the watchdog. They do not erase
    // accumulated failures or replace the persistent position anchor.
    if (characterEnemyHunterWatchdogPaused(enemy)) {
        return;
    }

    if (!characterEnemyHunterWatchdogActive(enemy)) {
        resetCharacterEnemyHunterWatchdog(enemy, true);
        return;
    }

    const x = Number(enemy.currentTransform.x) || 0;
    const y = Number(enemy.currentTransform.y) || 0;
    if (!Number.isFinite(Number(enemy.hunterWatchdogX)) || !Number.isFinite(Number(enemy.hunterWatchdogY))) {
        resetCharacterEnemyHunterWatchdog(enemy, false);
        return;
    }

    const distance = Math.hypot(x - Number(enemy.hunterWatchdogX), y - Number(enemy.hunterWatchdogY));
    if (distance >= CHARACTER_ENEMY_HUNTER_WATCHDOG_PROGRESS_DISTANCE) {
        // Real displacement refreshes the timer, but a recovery shuffle must
        // not forgive earlier stalls and reopen the same failed hunt forever.
        resetCharacterEnemyHunterWatchdog(enemy, false);
        return;
    }

    enemy.hunterWatchdogElapsed = Math.max(0, Number(enemy.hunterWatchdogElapsed) || 0) + Math.max(0, Number(dt) || 0);
    if (enemy.hunterWatchdogElapsed + 0.000001 < CHARACTER_ENEMY_HUNTER_WATCHDOG_TIMEOUT_SECONDS) {
        return;
    }

    onCharacterEnemyHunterWatchdogTimeout(state, enemy);
}

function enterCharacterEnemyGlare(state, enemy, options = {}) {
    clearCharacterEnemyNavigationPlan(enemy);
    rememberCharacterEnemyRoutePlayerTarget(state, enemy);
    enemy.routeRepathTimer = Math.max(1, (Number(enemy.routeRepathInterval) || FIXED_DT) * 3);
    enemy.engaged = false;
    enemy.alerted = false;
    enemy.unreachableReengageCooldownTimer = 0;
    enemy.aiState = "unreachable_glare";
    enemy.glareTimer = Math.max(0, Number(enemy.unreachableGlareDuration) || state.tuning.enemyDefaultGlareSeconds || 5);
    enemy.glareFocusX = typeof options.focusX === "number" && Number.isFinite(options.focusX)
        ? options.focusX
        : (typeof enemy.lastSeenPlayerX === "number" && Number.isFinite(enemy.lastSeenPlayerX)
            ? enemy.lastSeenPlayerX
            : state.player.currentTransform.x);
    enemy.glareFocusY = typeof options.focusY === "number" && Number.isFinite(options.focusY)
        ? options.focusY
        : (typeof enemy.lastSeenPlayerY === "number" && Number.isFinite(enemy.lastSeenPlayerY)
            ? enemy.lastSeenPlayerY
            : state.player.currentTransform.y);
    const glareDx = enemy.glareFocusX - enemy.currentTransform.x;
    if (Math.abs(glareDx) > 0.001) {
        enemy.facing = glareDx < 0 ? -1 : 1;
    }
    enemy.movementPhase = "glare";
    setCharacterEnemyAnimation(enemy, "idle");
    addEvent(state, "ENEMY_TARGET_UNREACHABLE", {
        enemyId: enemy.id,
        focusX: round(enemy.glareFocusX),
        focusY: round(enemy.glareFocusY)
    });
}

function enterCharacterEnemyStrandedPatrol(state, enemy, navigation) {
    clearCharacterEnemyNavigationPlan(enemy);
    const support = navigation.current?.support;
    const inset = Math.max(4, enemy.width * 0.42);
    enemy.temporaryPatrolMinX = support ? Math.min(support.xMax, support.xMin + inset) : enemy.currentTransform.x - 40;
    enemy.temporaryPatrolMaxX = support ? Math.max(support.xMin, support.xMax - inset) : enemy.currentTransform.x + 40;
    enemy.aiState = "stranded_patrol";
    enemy.movementPhase = "idle";
    enemy.phaseTimer = Math.max(0, Number(enemy.turnPause) || 0);
    enemy.homeRetryTimer = Math.max(FIXED_DT, Number(enemy.homeRetryInterval) || state.tuning.enemyDefaultHomeRetrySeconds || 4);
    setCharacterEnemyAnimation(enemy, "idle");
    addEvent(state, "ENEMY_STRANDED", { enemyId: enemy.id, supportId: support?.id || null });
}

function updateCharacterEnemyPatrolRange(state, enemy, dt, minX, maxX, phase = "patrol") {
    if (enemy.walkSpeed <= 0 || maxX - minX <= 1) {
        enemy.movementPhase = phase === "stranded_patrol" ? "stranded_patrol" : "guard";
        setCharacterEnemyAnimation(enemy, "idle");
        return;
    }
    if (enemy.movementPhase !== "walk" && enemy.movementPhase !== phase) {
        enemy.movementPhase = "idle";
        setCharacterEnemyAnimation(enemy, "idle");
        enemy.phaseTimer = Math.max(0, (Number(enemy.phaseTimer) || 0) - dt);
        if (enemy.phaseTimer <= 0) {
            enemy.movementPhase = phase;
            setCharacterEnemyAnimation(enemy, "walk");
        }
        return;
    }

    setCharacterEnemyAnimation(enemy, "walk");
    const direction = enemy.facing < 0 ? -1 : 1;
    const boundaryX = direction < 0 ? minX : maxX;
    const moved = moveCharacterEnemyToward(state, enemy, boundaryX, enemy.walkSpeed, dt, 0, true);
    if (moved <= 0 && Math.abs(enemy.groundVelocityX) <= 0.05) {
        pauseAndTurnCharacterEnemy(enemy);
        return;
    }
    enemy.movementPhase = enemy.airborne ? "air" : phase;
    if (!enemy.airborne && Math.abs(enemy.currentTransform.x - boundaryX) <= 1 && Math.abs(enemy.groundVelocityX) <= 0.05) {
        pauseAndTurnCharacterEnemy(enemy);
    }
}

function updateHunterCharacterEnemy(state, enemy, dt) {
    // Match the SDL hunter state-machine normalization. Restored states may carry
    // a tactical pursue state without the redundant engaged flag.
    if (!enemy.engaged && (enemy.aiState === "pursue" || enemy.aiState === "investigate_last_seen")) {
        enemy.engaged = true;
        enemy.alerted = true;
    }

    const seesPlayer = enemy.airborne ? false : characterEnemyCanNoticePlayer(state, enemy);
    if (!enemy.airborne && !enemy.engaged && enemy.aiState === "patrol" && !seesPlayer) {
        const { bakedGraph } = staticEnemyNavigationBundle(state, characterEnemyNavigationOptions(enemy, state));
        enemy.navigationGraphSource = bakedGraph ? "baked" : "runtime";
        enemy.navigationGraphId = bakedGraph?.id || null;
        enemy.alerted = false;
        updateCharacterEnemyPatrolRange(
            state,
            enemy,
            dt,
            finiteNumberOr(enemy.homePatrolMinX, enemy.patrolMinX),
            finiteNumberOr(enemy.homePatrolMaxX, enemy.patrolMaxX),
            "patrol"
        );
        syncCharacterEnemyTarget(state, enemy);
        return;
    }
    const navigation = characterEnemyNavigationContext(state, enemy);
    if (enemy.airborne) {
        updateCharacterEnemyAirTraversal(state, enemy, dt, navigation.supports);
        syncCharacterEnemyTarget(state, enemy);
        return;
    }

    if (seesPlayer) {
        enemy.awarenessTimer = Math.max(
            FIXED_DT,
            Number(enemy.awarenessHoldDuration) || state.tuning.enemyDefaultAwarenessHoldSeconds || 1.2
        );
        rememberCharacterEnemyPlayerPosition(state, enemy, navigation);
        enemy.glareFocusX = null;
        enemy.glareFocusY = null;
        if (enemy.aiState === "investigate_last_seen") {
            clearCharacterEnemyNavigationPlan(enemy);
            enemy.aiState = "pursue";
            enemy.movementPhase = "pursue";
            enemy.routeRepathTimer = 0;
            addEvent(state, "ENEMY_REACQUIRED_PLAYER", { enemyId: enemy.id });
        }
        if (!enemy.engaged && enemy.aiState === "patrol") {
            enemy.engaged = true;
            enemy.alerted = true;
            enemy.aiState = "pursue";
            enemy.routeRepathTimer = 0;
            clearCharacterEnemyNavigationPlan(enemy);
            addEvent(state, "ENEMY_ALERTED", { enemyId: enemy.id });
        }
    } else {
        const hasLastSeen = typeof enemy.lastSeenPlayerX === "number" && Number.isFinite(enemy.lastSeenPlayerX) &&
            typeof enemy.lastSeenPlayerY === "number" && Number.isFinite(enemy.lastSeenPlayerY);
        if (enemy.engaged && !hasLastSeen) {
            rememberCharacterEnemyPlayerPosition(state, enemy, navigation);
            enemy.awarenessTimer = Math.max(
                FIXED_DT,
                Number(enemy.awarenessHoldDuration) || state.tuning.enemyDefaultAwarenessHoldSeconds || 1.2
            );
        } else {
            enemy.awarenessTimer = Math.max(0, (Number(enemy.awarenessTimer) || 0) - dt);
        }
    }
    const hasRecentSight = seesPlayer || enemy.awarenessTimer > 0;

    if (enemy.aiState === "unreachable_glare") {
        const focusX = typeof enemy.glareFocusX === "number" && Number.isFinite(enemy.glareFocusX)
            ? enemy.glareFocusX
            : state.player.currentTransform.x;
        const dx = focusX - enemy.currentTransform.x;
        if (Math.abs(dx) > 0.001) {
            enemy.facing = dx < 0 ? -1 : 1;
        }
        enemy.glareTimer = Math.max(0, (Number(enemy.glareTimer) || 0) - dt);
        enemy.routeRepathTimer = Math.max(0, (Number(enemy.routeRepathTimer) || 0) - dt);

        // Fresh sight on the same physical floor is stronger evidence than the
        // failed graph route that put the hunter into glare. Recover immediately,
        // without waiting for the graph-repath timer. This is especially important
        // when both actors literally hold the same authored support line.
        if (seesPlayer && updateCharacterEnemyLocalGroundPursuit(state, enemy, dt)) {
            addEvent(state, "ENEMY_REENGAGED_LOCAL", { enemyId: enemy.id, reason: "glare_same_floor" });
            syncCharacterEnemyTarget(state, enemy);
            return;
        }
        if (seesPlayer && characterEnemyRoutePlayerTargetMoved(state, enemy)) {
            enemy.routeRepathTimer = 0;
        }
        if (seesPlayer && enemy.routeRepathTimer <= 0) {
            const plan = chooseCharacterEnemyAttackPlan(state, enemy, navigation);
            rememberCharacterEnemyRoutePlayerTarget(state, enemy);
            enemy.routeRepathTimer = Math.max(1, (Number(enemy.routeRepathInterval) || FIXED_DT) * 3);
            if (plan && plan.kind !== "blocked_approach") {
                enemy.engaged = true;
                enemy.alerted = true;
                enemy.aiState = "pursue";
                setCharacterEnemyAttackNavigationPlan(state, enemy, plan);
                addEvent(state, "ENEMY_REENGAGED", { enemyId: enemy.id });
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
        }
        enemy.movementPhase = "glare";
        setCharacterEnemyAnimation(enemy, "idle");
        if (enemy.glareTimer <= 0) {
            enemy.aiState = "return_home";
            enemy.unreachableReengageCooldownTimer = CHARACTER_ENEMY_REENGAGE_COOLDOWN_SECONDS;
            enemy.routeRepathTimer = 0;
        }
        syncCharacterEnemyTarget(state, enemy);
        return;
    }

    if (enemy.engaged && !seesPlayer) {
        if (hasRecentSight && enemy.routeTargetSupportId) {
            // Keep executing a route chosen while the target was visible. This is
            // especially important for ranged backpedalling: turning away to create
            // space briefly moves Ignatius outside the facing cone, but should not
            // cancel the already committed tactical movement.
            if (!followCharacterEnemyNavigationPlan(state, enemy, navigation, dt)) {
                clearCharacterEnemyNavigationPlan(enemy);
                enemy.routeRepathTimer = 0;
            }
            syncCharacterEnemyTarget(state, enemy);
            return;
        }
        updateCharacterEnemyLastSeenInvestigation(state, enemy, navigation, dt, {
            // Awareness hold keeps the engagement alive and delays the glare/give-up
            // sequence. It must not make a hunter stand motionless while its last
            // genuinely seen target has already moved onto another support.
            allowGlare: !hasRecentSight
        });
        syncCharacterEnemyTarget(state, enemy);
        return;
    }

    if (enemy.aiState === "return_home") {
        enemy.unreachableReengageCooldownTimer = Math.max(
            0,
            (Number(enemy.unreachableReengageCooldownTimer) || 0) - dt
        );
        const watchdogForcedReturnHome = (Number(enemy.hunterWatchdogTimeoutCount) || 0) >=
            CHARACTER_ENEMY_HUNTER_WATCHDOG_RETURN_HOME_TIMEOUTS;
        if (seesPlayer && enemy.unreachableReengageCooldownTimer <= 0 && !watchdogForcedReturnHome) {
            const canAttack = characterEnemyReadyToAttackFromCurrentPosition(state, enemy);
            if (canAttack) {
                enemy.engaged = true;
                enemy.alerted = true;
                enemy.aiState = "pursue";
                enemy.unreachableReengageCooldownTimer = 0;
                startCharacterEnemyAttack(state, enemy);
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
            const plan = chooseCharacterEnemyAttackPlan(state, enemy, navigation);
            if (plan && plan.kind !== "blocked_approach") {
                enemy.engaged = true;
                enemy.alerted = true;
                enemy.aiState = "pursue";
                enemy.unreachableReengageCooldownTimer = 0;
                setCharacterEnemyAttackNavigationPlan(state, enemy, plan);
                addEvent(state, "ENEMY_REENGAGED", { enemyId: enemy.id, reason: "return_home_sight" });
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
        }
        const homeSupport = navigationSupportById(navigation.supports, enemy.homeSupportId);
        const homePoint = homeSupport
            ? supportPoint(homeSupport, enemy.spawnX, Math.max(4, enemy.width * 0.3))
            : null;
        const atHome = homePoint && enemy.homeSupportId === navigation.current?.support?.id &&
            Math.abs(enemy.currentTransform.x - homePoint.x) <= 6;
        if (atHome) {
            enemy.currentTransform.x = homePoint.x;
            enemy.currentTransform.y = homePoint.y;
            enemy.aiState = "patrol";
            enemy.movementPhase = "idle";
            enemy.phaseTimer = Math.max(0, Number(enemy.idleDuration) || 0);
            enemy.temporaryPatrolMinX = null;
            enemy.temporaryPatrolMaxX = null;
            clearCharacterEnemyNavigationPlan(enemy);
            setCharacterEnemyAnimation(enemy, "idle");
            addEvent(state, "ENEMY_RETURNED_HOME", { enemyId: enemy.id });
            syncCharacterEnemyTarget(state, enemy);
            return;
        }
        enemy.routeRepathTimer = Math.max(0, (Number(enemy.routeRepathTimer) || 0) - dt);
        if (!enemy.routeTargetSupportId && !characterEnemyHasCommittedTraversal(enemy)) {
            const homeSupport = navigationSupportById(navigation.supports, enemy.homeSupportId);
            const route = homeSupport && navigation.current
                ? characterEnemyRoute(state, enemy, navigation.supports, navigation.current.support.id, homeSupport.id, navigation.edgeMap)
                : null;
            if (!route) {
                enterCharacterEnemyStrandedPatrol(state, enemy, navigation);
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
            setCharacterEnemyNavigationPlan(enemy, {
                kind: "return_home",
                supportId: homeSupport.id,
                targetX: enemy.spawnX,
                targetY: enemy.spawnY,
                route
            });
        }
        if (!followCharacterEnemyNavigationPlan(state, enemy, navigation, dt)) {
            enterCharacterEnemyStrandedPatrol(state, enemy, navigation);
        }
        syncCharacterEnemyTarget(state, enemy);
        return;
    }

    if (enemy.aiState === "stranded_patrol") {
        enemy.homeRetryTimer = Math.max(0, (Number(enemy.homeRetryTimer) || 0) - dt);
        const watchdogRecovering = (Number(enemy.hunterWatchdogRecoveryTimer) || 0) > 0;
        if (seesPlayer && !watchdogRecovering) {
            if (updateCharacterEnemyLocalGroundPursuit(state, enemy, dt)) {
                addEvent(state, "ENEMY_REENGAGED_LOCAL", { enemyId: enemy.id });
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
            const plan = chooseCharacterEnemyAttackPlan(state, enemy, navigation);
            if (plan) {
                enemy.engaged = true;
                enemy.alerted = true;
                enemy.aiState = "pursue";
                setCharacterEnemyAttackNavigationPlan(state, enemy, plan);
                addEvent(state, "ENEMY_ALERTED", { enemyId: enemy.id });
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
        }
        if (enemy.homeRetryTimer <= 0 && !watchdogRecovering) {
            enemy.homeRetryTimer = Math.max(FIXED_DT, Number(enemy.homeRetryInterval) || state.tuning.enemyDefaultHomeRetrySeconds || 4);
            const homeSupport = navigationSupportById(navigation.supports, enemy.homeSupportId);
            const route = homeSupport && navigation.current
                ? characterEnemyRoute(state, enemy, navigation.supports, navigation.current.support.id, homeSupport.id, navigation.edgeMap)
                : null;
            if (route) {
                enemy.aiState = "return_home";
                setCharacterEnemyNavigationPlan(enemy, {
                    supportId: homeSupport.id,
                    targetX: enemy.spawnX,
                    targetY: enemy.spawnY,
                    route
                });
                addEvent(state, "ENEMY_HOME_ROUTE_RECOVERED", { enemyId: enemy.id });
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
        }
        updateCharacterEnemyPatrolRange(
            state,
            enemy,
            dt,
            finiteNumberOr(enemy.temporaryPatrolMinX, enemy.currentTransform.x - 40),
            finiteNumberOr(enemy.temporaryPatrolMaxX, enemy.currentTransform.x + 40),
            "stranded_patrol"
        );
        syncCharacterEnemyTarget(state, enemy);
        return;
    }

    if (enemy.engaged) {
        enemy.routeRepathTimer = Math.max(0, (Number(enemy.routeRepathTimer) || 0) - dt);
        const currentSupportId = navigation.current?.support?.id || null;
        const reachedPlannedSupport = !enemy.routeTargetSupportId || enemy.routeTargetSupportId === currentSupportId;
        const mayInterruptApproachToFire = enemy.attackMode === "projectile" || reachedPlannedSupport;
        if (seesPlayer && enemy.attackCooldownTimer <= 0 && mayInterruptApproachToFire) {
            const canAttack = characterEnemyReadyToAttackFromCurrentPosition(state, enemy);
            if (canAttack) {
                startCharacterEnemyAttack(state, enemy);
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
        }
        const routeNeedsRefresh = !enemy.routeTargetSupportId || (
            enemy.routeRepathTimer <= 0 && (
                !characterEnemyHasRoutePlayerTargetSnapshot(enemy) ||
                characterEnemyRoutePlayerTargetMoved(state, enemy) ||
                characterEnemyReachedNavigationTarget(enemy, navigation)
            )
        );
        if (seesPlayer && routeNeedsRefresh && !characterEnemyHasCommittedTraversal(enemy)) {
            const plan = chooseCharacterEnemyAttackPlan(state, enemy, navigation);
            if (!plan) {
                rememberCharacterEnemyRoutePlayerTarget(state, enemy);
                if (updateCharacterEnemyLocalGroundPursuit(state, enemy, dt)) {
                    syncCharacterEnemyTarget(state, enemy);
                    return;
                }
                enterCharacterEnemyGlare(state, enemy);
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
            setCharacterEnemyAttackNavigationPlan(state, enemy, plan);
        } else if (seesPlayer && enemy.routeRepathTimer <= 0) {
            // The player is still close to the target snapshot used by this route.
            // Keep the valid plan instead of rebuilding the whole navigation search.
            enemy.routeRepathTimer = Math.max(FIXED_DT, Number(enemy.routeRepathInterval) || FIXED_DT);
        }
        if (!followCharacterEnemyNavigationPlan(state, enemy, navigation, dt)) {
            if (seesPlayer && updateCharacterEnemyLocalGroundPursuit(state, enemy, dt)) {
                enemy.navigationFailureCount = 0;
                syncCharacterEnemyTarget(state, enemy);
                return;
            }
            enemy.navigationFailureCount = (Number(enemy.navigationFailureCount) || 0) + 1;
            if (enemy.navigationFailureCount >= 2) {
                enterCharacterEnemyGlare(state, enemy);
            } else {
                enemy.routeRepathTimer = 0;
            }
        } else {
            enemy.navigationFailureCount = 0;
            if (seesPlayer &&
                enemy.routePurpose === "blocked_approach" &&
                characterEnemyReachedNavigationTarget(enemy, navigation) &&
                !characterEnemyReadyToAttackFromCurrentPosition(state, enemy)) {
                enterCharacterEnemyGlare(state, enemy, {
                    focusX: state.player.currentTransform.x,
                    focusY: state.player.currentTransform.y
                });
            }
        }
        syncCharacterEnemyTarget(state, enemy);
        return;
    }

    enemy.aiState = "patrol";
    enemy.alerted = false;
    updateCharacterEnemyPatrolRange(
        state,
        enemy,
        dt,
        finiteNumberOr(enemy.homePatrolMinX, enemy.patrolMinX),
        finiteNumberOr(enemy.homePatrolMaxX, enemy.patrolMaxX),
        "patrol"
    );
    syncCharacterEnemyTarget(state, enemy);
}

function moveFlyingCharacterEnemyWithWorldCollision(state, enemy, targetX, targetY) {
    const previousX = enemy.currentTransform.x;
    const previousY = enemy.currentTransform.y;
    const horizontal = findActorHorizontalSweepCollision(state, enemy, previousX, targetX, {
        blockWater: false,
        blockAllBlockableLines: true
    });
    enemy.currentTransform.x = horizontal ? horizontal.x : targetX;
    const vertical = findActorVerticalSweepCollision(state, enemy, previousY, targetY, {
        ignoreWalkable: true,
        blockWater: false,
        blockAllBlockableLines: true
    });
    enemy.currentTransform.y = vertical ? vertical.y : targetY;
    enemy.supportId = null;
    enemy.ridingPlatformId = null;
    enemy.currentSupportId = null;
    enemy.airborne = true;
    return {
        blockedX: Boolean(horizontal),
        blockedY: Boolean(vertical),
        dx: enemy.currentTransform.x - previousX,
        dy: enemy.currentTransform.y - previousY
    };
}

function updateFlyingCharacterEnemy(state, enemy, dt) {
    enemy.supportId = null;
    enemy.ridingPlatformId = null;
    enemy.currentSupportId = null;
    enemy.airborne = true;
    enemy.flightTime = Math.max(0, Number(enemy.flightTime) || 0) + Math.max(0, Number(dt) || 0);

    if ((Number(enemy.hurtTimer) || 0) > 0) {
        enemy.hurtTimer = Math.max(0, enemy.hurtTimer - dt);
        enemy.combatState = ENEMY_COMBAT_STATE.HURT;
    } else if (enemy.combatState === ENEMY_COMBAT_STATE.HURT) {
        enemy.combatState = ENEMY_COMBAT_STATE.ALIVE;
    }

    const amplitude = Math.max(0, Number(enemy.flightAmplitude) || 0);
    const cycles = Math.max(0, Number(enemy.flightCyclesPerSecond) || 0);
    const phase = (enemy.flightTime * cycles + (Number(enemy.flightPhaseOffset) || 0)) * Math.PI * 2;

    if (enemy.strategy === "bomber") {
        const player = state.player;
        const seesPlayer = characterEnemyCanNoticePlayer(state, enemy);
        if (seesPlayer) {
            enemy.awarenessTimer = Math.max(
                FIXED_DT,
                Number(enemy.awarenessHoldDuration) || state.tuning.enemyDefaultAwarenessHoldSeconds || 1.2
            );
        } else {
            enemy.awarenessTimer = Math.max(0, (Number(enemy.awarenessTimer) || 0) - dt);
        }

        const active = seesPlayer || enemy.awarenessTimer > 0;
        const horizontalSpeed = Math.max(0, (Number(enemy.bomberHorizontalSpeed) || Number(enemy.walkSpeed) || 0) * characterEnemyRunSpeedScale(enemy, state.tuning));
        const tolerance = Math.max(1, Number(enemy.bomberDropTolerance) || 34);
        const perchX = finiteNumberOr(enemy.bomberPerchX, enemy.spawnX);
        const perchY = finiteNumberOr(enemy.bomberPerchY, enemy.spawnY);

        if (!active) {
            const patrolDistance = Math.max(0, Number(enemy.patrolDistance) || 0);
            const patrolHalf = patrolDistance * 0.5;
            const patrolMinX = perchX - patrolHalf;
            const patrolMaxX = perchX + patrolHalf;
            const outsidePerchArea = enemy.currentTransform.x < patrolMinX - 4 || enemy.currentTransform.x > patrolMaxX + 4 || Math.abs(enemy.currentTransform.y - perchY) > 12;
            if (outsidePerchArea) {
                const dxHome = perchX - enemy.currentTransform.x;
                const dyHome = perchY - enemy.currentTransform.y;
                const distanceHome = Math.hypot(dxHome, dyHome);
                const step = Math.min(distanceHome, horizontalSpeed * dt);
                const nx = distanceHome > 0 ? dxHome / distanceHome : 0;
                const ny = distanceHome > 0 ? dyHome / distanceHome : 0;
                const movement = moveFlyingCharacterEnemyWithWorldCollision(
                    state, enemy, enemy.currentTransform.x + nx * step, enemy.currentTransform.y + ny * step
                );
                enemy.velocityX = dt > 0 ? movement.dx / dt : 0;
                enemy.velocityY = dt > 0 ? movement.dy / dt : 0;
                if (Math.abs(dxHome) > 0.001) enemy.facing = dxHome < 0 ? -1 : 1;
                enemy.bomberState = "returning";
                enemy.movementPhase = "return_to_perch";
                enemy.aiState = "return_to_perch";
            } else if (patrolDistance > 0) {
                const patrolSpeed = Math.max(0, Number(enemy.walkSpeed) || horizontalSpeed * 0.5);
                const direction = Number(enemy.facing) < 0 ? -1 : 1;
                let nextX = enemy.currentTransform.x + direction * patrolSpeed * dt;
                if (nextX <= patrolMinX) {
                    nextX = patrolMinX;
                    enemy.facing = 1;
                } else if (nextX >= patrolMaxX) {
                    nextX = patrolMaxX;
                    enemy.facing = -1;
                }
                const movement = moveFlyingCharacterEnemyWithWorldCollision(
                    state, enemy, nextX, perchY + Math.sin(phase) * amplitude
                );
                if (movement.blockedX) enemy.facing = Number(enemy.facing) < 0 ? 1 : -1;
                enemy.velocityX = dt > 0 ? movement.dx / dt : 0;
                enemy.velocityY = dt > 0 ? movement.dy / dt : 0;
                enemy.bomberState = "perch_patrol";
                enemy.movementPhase = "perch_patrol";
                enemy.aiState = "perch_patrol";
            } else {
                const movement = moveFlyingCharacterEnemyWithWorldCollision(state, enemy, perchX, perchY);
                enemy.velocityX = dt > 0 ? movement.dx / dt : 0;
                enemy.velocityY = dt > 0 ? movement.dy / dt : 0;
                enemy.bomberState = "perched";
                enemy.movementPhase = "perched";
                enemy.aiState = "perched";
            }
            enemy.alerted = false;
        } else {
            const targetX = Number(player?.currentTransform.x) || enemy.currentTransform.x;
            const playerY = Number(player?.currentTransform.y) || perchY;
            const hoverHeight = Math.max(16, Number(enemy.bomberHoverHeight) || 180);
            const desiredHoverY = playerY - hoverHeight;
            const approximateViewportHalfHeight = 270 / Math.max(0.5, Number(state.camera?.zoom) || 1);
            const screenTop = (Number(state.camera?.currentTransform.y) || desiredHoverY) - approximateViewportHalfHeight;
            const topMargin = Math.max(20, Number(enemy.bomberScreenTopMargin) || 72);
            const targetY = Math.max(screenTop + topMargin + enemy.height * 0.5, desiredHoverY);
            const playerDxBeforeSteering = targetX - enemy.currentTransform.x;
            const playerDyBeforeSteering = targetY - enemy.currentTransform.y;
            const approachDistance = Math.max(140, hoverHeight * 1.35);
            const stationDistance = Math.hypot(playerDxBeforeSteering, playerDyBeforeSteering);
            const approachBlend = Math.min(1, stationDistance / approachDistance);
            // Keep the complete deterministic swarm pattern at the bombing station.
            // Bats circle through the true vertical drop lane and release only while crossing it.
            const meanderClock = enemy.flightTime * Math.max(0.05, cycles) * Math.PI * 2 *
                Math.max(0.2, Number(enemy.bomberMeanderRateScale) || 1);
            const horizontalPattern =
                (Number(enemy.bomberMeanderBiasX) || 0) * 0.34 +
                Math.sin(meanderClock * 0.61 + (Number(enemy.bomberMeanderPhaseX) || 0)) * 0.46 +
                Math.sin(meanderClock * 1.17 + (Number(enemy.bomberMeanderPhaseY) || 0)) * 0.20;
            const verticalPattern =
                (Number(enemy.bomberMeanderBiasY) || 0) * 0.24 +
                Math.sin(meanderClock * 0.53 + (Number(enemy.bomberMeanderPhaseY) || 0)) * 0.52 +
                Math.sin(meanderClock * 1.31 + (Number(enemy.bomberMeanderPhaseX) || 0)) * 0.24;
            const authoredWanderAmplitude = Math.max(0, Number(enemy.bomberWanderAmplitude) || 0);
            const individualAmplitudeScale = Math.max(0, Number(enemy.bomberMeanderAmplitudeScale) || 0);
            const horizontalMeanderAmplitude = authoredWanderAmplitude * individualAmplitudeScale * 2.5;
            const verticalMeanderAmplitude = Math.min(64, authoredWanderAmplitude * individualAmplitudeScale * 1.05);
            const approachArcHeight = Math.max(0, Number(enemy.bomberApproachArcHeight) || 0);
            const approachArc = Math.sin(approachBlend * Math.PI * 0.5) * approachArcHeight;
            let desiredX = targetX + horizontalPattern * horizontalMeanderAmplitude;
            let desiredY = targetY + verticalPattern * verticalMeanderAmplitude - approachArc;
            const obstacleMargin = Math.max(8, Number(enemy.bomberObstacleClearance) || 56);
            const clearance = Math.max(enemy.width, enemy.height) * 0.5 + obstacleMargin;
            // Use a compact body probe while retaining the larger clearance value for
            // steering offsets. A clearance-sized circle around the whole sprite extends
            // through the floor whenever the bat is perched and prevents take-off.
            const flightProbeRadius = Math.max(
                8,
                Math.min(
                    Math.min(enemy.width, enemy.height) * 0.28 + obstacleMargin * 0.35,
                    Math.max(8, enemy.height * 0.5 - 4)
                )
            );
            // Enemy x/y uses a feet-position convention. Terrain probes, however, expect
            // a center point. Probing from the feet made a perched bomber permanently
            // overlap the platform beneath it, so every attempted take-off was rejected.
            const enemyCenterY = enemy.currentTransform.y - enemy.height * 0.5;
            const desiredCenterY = desiredY - enemy.height * 0.5;
            const directProbe = {
                x: desiredX,
                y: desiredCenterY,
                radius: flightProbeRadius
            };
            enemy.bomberObstacleProbeTimer = Math.max(0, (Number(enemy.bomberObstacleProbeTimer) || 0) - dt);
            if (enemy.bomberObstacleProbeTimer <= 0) {
                enemy.bomberAvoidanceOffsetX = 0;
                enemy.bomberAvoidanceOffsetY = 0;
                const directHit = findProjectileTerrainImpact(state, directProbe, enemy.currentTransform.x, enemyCenterY);
                if (directHit) {
                    const sidestep = enemy.currentTransform.x <= directHit.x ? -1 : 1;
                    enemy.bomberAvoidanceOffsetX = sidestep * clearance * 1.4;
                    enemy.bomberAvoidanceOffsetY = Math.min(0, directHit.y - clearance - desiredY);
                }
                enemy.bomberObstacleProbeTimer = 0.1;
            }
            desiredX += Number(enemy.bomberAvoidanceOffsetX) || 0;
            desiredY += Number(enemy.bomberAvoidanceOffsetY) || 0;
            const dx = desiredX - enemy.currentTransform.x;
            const dy = desiredY - enemy.currentTransform.y;
            const distance = Math.hypot(dx, dy);
            const nx = distance > 0 ? dx / distance : 0;
            const ny = distance > 0 ? dy / distance : 0;
            const steering = Math.min(1, Math.max(0.5, Number(enemy.bomberSteeringResponse) || 4.5) * dt);
            const arrivalRadius = Math.max(tolerance * 2.4, hoverHeight * 0.42, 72);
            const arrivalScale = Math.max(0.22, Math.min(1, distance / arrivalRadius));
            const targetVx = nx * horizontalSpeed * arrivalScale;
            const targetVy = ny * horizontalSpeed * arrivalScale;
            enemy.velocityX += (targetVx - (Number(enemy.velocityX) || 0)) * steering;
            enemy.velocityY += (targetVy - (Number(enemy.velocityY) || 0)) * steering;
            const speedNow = Math.hypot(enemy.velocityX, enemy.velocityY);
            if (speedNow > horizontalSpeed && speedNow > 0) {
                enemy.velocityX = enemy.velocityX / speedNow * horizontalSpeed;
                enemy.velocityY = enemy.velocityY / speedNow * horizontalSpeed;
            }
            const nextX = enemy.currentTransform.x + enemy.velocityX * dt;
            const nextY = enemy.currentTransform.y + enemy.velocityY * dt;
            const movementProbe = {
                x: nextX,
                y: nextY - enemy.height * 0.5,
                radius: flightProbeRadius
            };
            if (!findProjectileTerrainImpact(state, movementProbe, enemy.currentTransform.x, enemyCenterY)) {
                enemy.currentTransform.x = nextX;
                enemy.currentTransform.y = nextY;
            } else {
                enemy.velocityX *= -0.35;
                enemy.velocityY = -Math.abs(enemy.velocityY || horizontalSpeed * 0.35);
            }
            if (Math.abs(dx) > 0.001) enemy.facing = dx < 0 ? -1 : 1;
            enemy.bomberDropTimer = Math.max(0, (Number(enemy.bomberDropTimer) || 0) - dt * characterEnemyAttackRateScale(enemy, state.tuning));
            const dropHeightTolerance = Math.max(4, Number(enemy.bomberDropHeightTolerance) || 36);
            const nearBombingHeight = Math.abs(enemy.currentTransform.y - targetY) <= dropHeightTolerance;
            const verticallyAbove = enemy.currentTransform.y < playerY - 24;
            const dropDx = targetX - enemy.currentTransform.x;
            enemy.projectileLaunchType = "drop";
            enemy.attackMode = "projectile";
            const directDropTolerance = Math.min(tolerance, Math.max(8, Math.min(12, enemy.width * 0.15)));
            const readyToCheckDropPath = seesPlayer &&
                Math.abs(dropDx) <= directDropTolerance &&
                nearBombingHeight &&
                verticallyAbove &&
                enemy.bomberDropTimer <= 0;
            if (readyToCheckDropPath && characterEnemyProjectilePathClearFromPoint(
                state,
                enemy,
                { x: enemy.currentTransform.x, y: enemy.currentTransform.y }
            )) {
                const projectile = launchCharacterEnemyProjectile(state, enemy);
                if (projectile) {
                    addEvent(state, "ENEMY_PROJECTILE_FIRED", {
                        enemyId: enemy.id,
                        characterId: enemy.characterId,
                        projectileId: projectile.id,
                        projectileKind: projectile.kind,
                        projectilePartName: projectile.projectilePartName,
                        launchType: projectile.launchType,
                        x: round(projectile.currentTransform.x),
                        y: round(projectile.currentTransform.y)
                    });
                }
                enemy.bomberDropTimer = Math.max(0.1, Number(enemy.projectileCooldown) || 1.4);
            }
            enemy.bomberState = "attacking";
            enemy.movementPhase = "bombing_run";
            enemy.aiState = "bomber";
            enemy.alerted = true;
        }
    } else {
        const speed = Math.max(0, Number(enemy.walkSpeed) || 0);
        const patrolDistance = Math.max(0, Number(enemy.patrolDistance) || 0);
        let nextX = enemy.currentTransform.x;
        if (speed > 0 && patrolDistance > 0) {
            const direction = Number(enemy.facing) < 0 ? -1 : 1;
            const patrolMinX = finiteNumberOr(enemy.patrolMinX, enemy.spawnX - patrolDistance * 0.5);
            const patrolMaxX = finiteNumberOr(enemy.patrolMaxX, enemy.spawnX + patrolDistance * 0.5);
            nextX = enemy.currentTransform.x + direction * speed * dt;
            if (nextX <= patrolMinX) {
                nextX = patrolMinX;
                enemy.facing = 1;
            } else if (nextX >= patrolMaxX) {
                nextX = patrolMaxX;
                enemy.facing = -1;
            }
        }
        const nextY = finiteNumberOr(enemy.flightBaseY, enemy.spawnY) + Math.sin(phase) * amplitude;
        const movement = moveFlyingCharacterEnemyWithWorldCollision(state, enemy, nextX, nextY);
        if (movement.blockedX) enemy.facing = Number(enemy.facing) < 0 ? 1 : -1;
        enemy.velocityX = dt > 0 ? movement.dx / dt : 0;
        enemy.velocityY = dt > 0 ? movement.dy / dt : 0;
        enemy.movementPhase = "fly";
        enemy.aiState = "fly";
        enemy.alerted = false;
    }
    setCharacterEnemyAnimation(enemy, "fly");
    syncCharacterEnemyTarget(state, enemy);
}

function beginDeadFlyingCharacterEnemy(state, enemy) {
    if (enemy.deathFlightStarted) {
        return;
    }
    const playerDx = (Number(enemy.currentTransform.x) || 0) - (Number(state.player?.currentTransform.x) || 0);
    const direction = Math.abs(playerDx) > 1
        ? (playerDx < 0 ? -1 : 1)
        : (Number(enemy.facing) < 0 ? -1 : 1);
    enemy.deathFlightStarted = true;
    enemy.deathFlightStartX = Number(enemy.currentTransform.x) || 0;
    enemy.deathFlightStartY = Number(enemy.currentTransform.y) || 0;
    enemy.deathFlightDirection = direction;
    enemy.facing = direction;
    enemy.velocityX = direction * Math.max(1, Number(enemy.deathFlightSpeed) || 520);
    enemy.velocityY = -Math.max(0, Number(enemy.deathFlightLift) || 210);
    enemy.currentTransform.alpha = 1;
}

function updateDeadFlyingCharacterEnemy(state, enemy, dt) {
    if (enemy.simulationDormant === true) return;
    beginDeadFlyingCharacterEnemy(state, enemy);
    enemy.deathElapsed = Math.max(0, Number(enemy.deathElapsed) || 0) + Math.max(0, Number(dt) || 0);
    enemy.currentTransform.x += (Number(enemy.velocityX) || 0) * dt;
    enemy.currentTransform.y += (Number(enemy.velocityY) || 0) * dt;
    enemy.velocityY = (Number(enemy.velocityY) || 0) + (Number(enemy.deathFlightGravity) || 0) * dt;
    enemy.movementPhase = "death_fly_off";
    enemy.aiState = "dead";
    enemy.airborne = true;
    setCharacterEnemyAnimation(enemy, "fly");

    const flyOffDistance = Math.max(1, Number(enemy.deathFlyOffDistance) || 720);
    const flightSpeed = Math.max(1, Number(enemy.deathFlightSpeed) || 520);
    const fadeDuration = Math.max(0, finiteNumberOr(enemy.corpseFadeDuration, state.tuning.enemyCorpseFadeSeconds));
    const fadeStartElapsed = flyOffDistance / flightSpeed;
    const fadeElapsed = Math.max(0, enemy.deathElapsed - fadeStartElapsed);
    enemy.currentTransform.alpha = fadeElapsed <= 0
        ? 1
        : (fadeDuration <= 0 ? 0 : clamp(1 - fadeElapsed / fadeDuration, 0, 1));
    if (enemy.currentTransform.alpha <= 0) {
        enemy.velocityX = 0;
        enemy.velocityY = 0;
        enemy.simulationDormant = true;
    }
    syncCharacterEnemyTarget(state, enemy);
}

function beginCharacterEnemyDeath(state, enemy) {
    enemy.health = 0;
    enemy.deathPendingLanding = false;
    enemy.combatState = ENEMY_COMBAT_STATE.DEAD;
    enemy.state = "death";
    enemy.movementPhase = "dead";
    enemy.attackTimer = 0;
    clearCharacterEnemyAttackLunge(enemy);
    enemy.attackHitApplied = false;
    enemy.hurtTimer = 0;
    enemy.velocityX = 0;
    enemy.velocityY = 0;
    enemy.deathTimer = Math.max(
        FIXED_DT,
        Number(enemy.deathDuration) || state.tuning.enemyDefaultDeathSeconds || 1.18
    );
    enemy.deathElapsed = 0;
    enemy.currentTransform.alpha = 1;
    setCharacterEnemyAnimation(enemy, "death");
}

function deferCharacterEnemyDeathUntilLanding(enemy) {
    enemy.health = 0;
    enemy.deathPendingLanding = true;
    enemy.combatState = ENEMY_COMBAT_STATE.DEATH_PENDING_LANDING;
    enemy.attackTimer = 0;
    clearCharacterEnemyAttackLunge(enemy);
    enemy.attackHitApplied = false;
    enemy.hurtTimer = 0;
    enemy.deathTimer = 0;
    enemy.deathElapsed = 0;
    enemy.currentTransform.alpha = 1;
}

function groundCharacterEnemyHasPendingCorpseDrop(enemy) {
    return enemy?.kind === "characterEnemy"
        && enemy.locomotion !== "flying"
        && enemy.dropsEmitted !== true;
}

function updateDeadEnemyPresentation(state, enemy, dt) {
    const holdDuration = Math.max(0, finiteNumberOr(enemy.corpseHoldDuration, state.tuning.enemyCorpseHoldSeconds));
    const fadeDuration = Math.max(0, finiteNumberOr(enemy.corpseFadeDuration, state.tuning.enemyCorpseFadeSeconds));
    enemy.deathElapsed = Math.max(0, Number(enemy.deathElapsed) || 0) + Math.max(0, Number(dt) || 0);
    if (enemy.deathElapsed <= holdDuration) {
        enemy.currentTransform.alpha = 1;
        return;
    }
    const keepActiveForPendingGroundDrop = groundCharacterEnemyHasPendingCorpseDrop(enemy);
    if (fadeDuration <= 0) {
        enemy.currentTransform.alpha = 0;
        if (!keepActiveForPendingGroundDrop) {
            enemy.velocityX = 0;
            enemy.velocityY = 0;
            enemy.simulationDormant = true;
        }
        return;
    }
    enemy.currentTransform.alpha = clamp(1 - (enemy.deathElapsed - holdDuration) / fadeDuration, 0, 1);
    if (enemy.currentTransform.alpha <= 0 && !keepActiveForPendingGroundDrop) {
        enemy.velocityX = 0;
        enemy.velocityY = 0;
        enemy.simulationDormant = true;
    }
}

function releaseCharacterEnemyIfGroundSupportLost(state, enemy) {
    if (!enemy || enemy.locomotion === "flying" || enemy.airborne === true || !enemy.supportId) return false;
    const movingSupport = Boolean(movingPlatformForCollisionId(state, enemy.supportId));
    const namedDynamicSupport = String(enemy.supportId).endsWith("_reactive_solid") || String(enemy.supportId).endsWith("_signal_solid");
    const currentDynamicSolid = (state.world?.solids || []).some((solid) => (
        solid.id === enemy.supportId && (solid.runtimeDynamic === true || solid.reactiveObjectId || solid.signalReceiverId)
    ));
    if (!movingSupport && !namedDynamicSupport && !currentDynamicSolid) return false;
    const tolerance = Math.max(2, Math.min(8, (Number(enemy.height) || 0) * 0.08));
    const support = findCharacterEnemyGroundSupport(
        state,
        enemy.currentTransform.x,
        enemy.currentTransform.y,
        tolerance,
        tolerance,
        enemy.width,
        { bodyHeight: enemy.height }
    );
    if (support) {
        enemy.currentTransform.y = support.y;
        setCharacterEnemyGroundSupportIdentity(state, enemy, support);
        return false;
    }

    enemy.supportId = null;
    enemy.ridingPlatformId = null;
    enemy.currentSupportId = null;
    enemy.airborne = true;
    enemy.airTimer = 0;
    enemy.airTraversalType = null;
    enemy.airSourceSupportId = null;
    enemy.airSourceObstacleId = null;
    enemy.airTargetSupportId = null;
    enemy.velocityX = Number(enemy.groundVelocityX) || 0;
    enemy.groundVelocityX = 0;
    enemy.velocityY = Math.max(0, Number(enemy.velocityY) || 0);
    clearCharacterEnemyNavigationPlan(enemy);
    return true;
}

function updateCharacterEnemyPassiveFall(state, enemy, dt, options = {}) {
    if (!enemy?.airborne || enemy.locomotion === "flying") return false;
    const stepDt = Math.max(0, Number(dt) || 0);
    enemy.airTimer = Math.max(0, Number(enemy.airTimer) || 0) + stepDt;
    enemy.velocityY = (Number(enemy.velocityY) || 0) + Math.max(1, Number(enemy.jumpGravity) || 1) * stepDt;
    const previousX = enemy.currentTransform.x;
    const previousY = enemy.currentTransform.y;
    const nextX = previousX + (Number(enemy.velocityX) || 0) * stepDt;
    const nextY = previousY + (Number(enemy.velocityY) || 0) * stepDt;
    const horizontal = findActorHorizontalSweepCollision(state, enemy, previousX, nextX, { blockWater: true });
    enemy.currentTransform.x = horizontal ? horizontal.x : nextX;
    if (horizontal) enemy.velocityX = 0;
    const vertical = findActorVerticalSweepCollision(state, enemy, previousY, nextY, { blockWater: true });
    enemy.currentTransform.y = vertical ? vertical.y : nextY;
    enemy.movementPhase = "air";
    if (vertical?.ceiling) {
        enemy.velocityY = 0;
    } else if (vertical) {
        const landingVelocityX = Number(enemy.velocityX) || 0;
        enemy.velocityX = 0;
        enemy.velocityY = 0;
        enemy.groundVelocityX = landingVelocityX;
        enemy.airborne = false;
        enemy.airTimer = 0;
        const support = findCharacterEnemyGroundSupport(
            state,
            enemy.currentTransform.x,
            enemy.currentTransform.y,
            Math.max(5, Number(enemy.maxStepHeight) || 0),
            Math.max(5, Number(enemy.maxDropDistance) || 0),
            enemy.width,
            { bodyHeight: enemy.height }
        );
        setCharacterEnemyGroundSupportIdentity(state, enemy, support);
        enemy.currentSupportId = null;
        enemy.movementPhase = "idle";
    }
    if (options.preserveAnimation !== true) {
        setCharacterEnemyAnimation(enemy, enemy.airborne ? "walk" : "idle");
    }
    syncCharacterEnemyTarget(state, enemy);
    return true;
}

function updateCharacterEnemies(state, dt) {
    for (const enemy of state.enemies || []) {
        if (enemy.simulationDormant === true) continue;
        if (enemy.airborne === true && enemy.groundStride?.active) enemy.groundStride = null;
        enemy.hitFlashTimer = Math.max(0, (Number(enemy.hitFlashTimer) || 0) - dt);
        enemy.healthBarTimer = Math.max(0, (Number(enemy.healthBarTimer) || 0) - dt);

        if (!isCharacterEnemyState(enemy)) {
            if (enemy.health <= 0) {
                enemy.combatState = "dead";
                enemy.state = "destroyed";
            } else if (enemy.state === "hurt" && enemy.hitFlashTimer <= 0) {
                enemy.combatState = "alive";
                enemy.state = "idle";
            }
            continue;
        }

        syncCharacterEnemyHealthScale(state, enemy);
        const collisionRecovery = resolveCharacterEnemyPenetrations(state, enemy);
        if (collisionRecovery.recovered || collisionRecovery.killed) continue;
        const attackRateScale = characterEnemyAttackRateScale(enemy, state.tuning);
        const animationDt = (enemy.combatState === ENEMY_COMBAT_STATE.ATTACKING || (Number(enemy.attackTimer) || 0) > 0)
            ? dt * attackRateScale
            : dt;
        enemy.animationClock.current = Math.max(0, Number(enemy.animationClock.current) || 0) + animationDt;
        enemy.attackCooldownTimer = Math.max(0, (Number(enemy.attackCooldownTimer) || 0) - dt * attackRateScale);

        if (
            enemy.health <= 0 &&
            enemy.locomotion !== "flying" &&
            enemy.airborne === true &&
            enemy.combatState !== ENEMY_COMBAT_STATE.DEAD &&
            enemy.deathPendingLanding !== true
        ) {
            deferCharacterEnemyDeathUntilLanding(enemy);
        }

        if (enemy.deathPendingLanding === true) {
            enemy.health = 0;
            enemy.combatState = ENEMY_COMBAT_STATE.DEATH_PENDING_LANDING;
            enemy.attackTimer = 0;
            clearCharacterEnemyAttackLunge(enemy);
            enemy.attackHitApplied = false;
            enemy.hurtTimer = 0;
            enemy.deathElapsed = 0;
            enemy.currentTransform.alpha = 1;

            if (enemy.airborne === true) {
                const navigation = characterEnemyNavigationContext(state, enemy);
                updateCharacterEnemyAirTraversal(state, enemy, dt, navigation.supports);
            }

            if (enemy.airborne === true) {
                enemy.combatState = ENEMY_COMBAT_STATE.DEATH_PENDING_LANDING;
                syncCharacterEnemyTarget(state, enemy);
                continue;
            }

            beginCharacterEnemyDeath(state, enemy);
            syncCharacterEnemyTarget(state, enemy);
            continue;
        }

        if (enemy.health <= 0 || enemy.combatState === ENEMY_COMBAT_STATE.DEAD) {
            enemy.health = 0;
            enemy.combatState = ENEMY_COMBAT_STATE.DEAD;
            enemy.movementPhase = "dead";
            enemy.attackTimer = 0;
            clearCharacterEnemyAttackLunge(enemy);
            enemy.attackHitApplied = false;
            enemy.deathTimer = Math.max(0, (Number(enemy.deathTimer) || 0) - dt);
            if (enemy.locomotion === "flying") {
                updateDeadFlyingCharacterEnemy(state, enemy, dt);
                continue;
            }
            releaseCharacterEnemyIfGroundSupportLost(state, enemy);
            if (enemy.airborne === true) updateCharacterEnemyPassiveFall(state, enemy, dt, { preserveAnimation: true });
            cullPendingGroundCharacterEnemyDropIfOffWorld(state, enemy);
            emitGroundCharacterEnemyDropsAtCorpseIfReady(state, enemy);
            updateDeadEnemyPresentation(state, enemy, dt);
            enemy.movementPhase = "dead";
            setCharacterEnemyAnimation(enemy, "death");
            syncCharacterEnemyTarget(state, enemy);
            continue;
        }

        if (enemy.locomotion !== "flying") {
            releaseCharacterEnemyIfGroundSupportLost(state, enemy);
            if (enemy.airborne === true && enemy.strategy !== "hunter") {
                updateCharacterEnemyPassiveFall(state, enemy, dt);
                continue;
            }
        }

        if (enemy.strategy === "passive") {
            if (enemy.locomotion !== "flying" && enemy.airborne !== true) {
                updateCharacterEnemyPassiveGroundMotion(state, enemy, dt);
            }
            enemy.combatState = ENEMY_COMBAT_STATE.ALIVE;
            enemy.state = enemy.health > 0 ? "idle" : "death";
            enemy.movementPhase = enemy.health > 0 ? "idle" : "dead";
            enemy.alerted = false;
            enemy.engaged = false;
            enemy.awarenessTimer = 0;
            enemy.attackTimer = 0;
            enemy.attackCooldownTimer = 0;
            clearCharacterEnemyAttackLunge(enemy);
            enemy.attackHitApplied = false;
            enemy.hurtTimer = 0;
            setCharacterEnemyAnimation(enemy, enemy.health > 0 ? "idle" : "death");
            syncCharacterEnemyTarget(state, enemy);
            continue;
        }

        enemy.deathElapsed = 0;
        enemy.currentTransform.alpha = 1;

        // Match SDL's established ordering for ordinary grounded non-hunters:
        // awareness advances once before panic/attack/hurt can consume the fixed-step turn.
        let groundedNonHunterAlerted = null;
        if (enemy.strategy !== "hunter" && enemy.locomotion !== "flying") {
            groundedNonHunterAlerted = updateCharacterEnemyAwareness(state, enemy, dt);
            enemy.engaged = groundedNonHunterAlerted;
        }

        if (updateCharacterEnemyPanic(state, enemy, dt)) {
            continue;
        }

        if (enemy.locomotion === "flying") {
            updateFlyingCharacterEnemy(state, enemy, dt);
            continue;
        }

        if (enemy.combatState === ENEMY_COMBAT_STATE.ATTACKING || (Number(enemy.attackTimer) || 0) > 0) {
            updateCharacterEnemyAttack(state, enemy, dt);
            continue;
        }

        if ((Number(enemy.hurtTimer) || 0) > 0) {
            enemy.hurtTimer = Math.max(0, enemy.hurtTimer - dt);
            enemy.combatState = "hurt";
            if (enemy.strategy === "hunter" && enemy.airborne) {
                const navigation = characterEnemyNavigationContext(state, enemy);
                updateCharacterEnemyAirTraversal(state, enemy, dt, navigation.supports);
            } else if (enemy.airborne !== true) {
                updateCharacterEnemyPassiveGroundMotion(state, enemy, dt);
            }
            enemy.movementPhase = "hurt";
            setCharacterEnemyAnimation(enemy, "hurt");
            syncCharacterEnemyTarget(state, enemy);
            continue;
        }
        if (enemy.combatState === ENEMY_COMBAT_STATE.HURT) {
            enemy.combatState = ENEMY_COMBAT_STATE.ALIVE;
            enemy.movementPhase = "idle";
            enemy.phaseTimer = Math.max(Number(enemy.phaseTimer) || 0, Math.min(0.18, Number(enemy.turnPause) || 0));
        }

        if (enemy.strategy === "hunter") {
            const previousHunterX = enemy.currentTransform.x;
            updateHunterCharacterEnemy(state, enemy, dt);
            updateCharacterEnemyHunterWatchdog(state, enemy, dt);
            if (!enemy.airborne) {
                // Match SDL's post-hunter displacement bookkeeping. Ballistic edge
                // velocity owns airborne traversal, so only derive velocity while grounded.
                enemy.velocityX = (enemy.currentTransform.x - previousHunterX) / Math.max(0.001, dt);
                enemy.velocityY = 0;
                if (enemy.animationSlot === "idle") {
                    enemy.velocityX = 0;
                }
            }
            continue;
        }

        const alerted = groundedNonHunterAlerted === null
            ? updateCharacterEnemyAwareness(state, enemy, dt)
            : groundedNonHunterAlerted;
        if (alerted) {
            enemy.aiState = "engaged";
            const dx = state.player.currentTransform.x - enemy.currentTransform.x;
            if (Math.abs(dx) > 0.001) {
                enemy.facing = dx < 0 ? -1 : 1;
            }

            if (enemy.attackMode === "projectile") {
                const horizontalDistance = Math.abs(dx);
                if (enemy.attackCooldownTimer <= 0 && Math.abs(Number(enemy.groundVelocityX) || 0) <= 0.05 && characterEnemyCanUseProjectile(state, enemy)) {
                    startCharacterEnemyAttack(state, enemy);
                    syncCharacterEnemyTarget(state, enemy);
                    continue;
                }

                const preferredRange = Math.max(0, Number(enemy.preferredAttackRange) || Number(enemy.attackRange) * 0.72 || 0);
                const minRange = Math.max(0, Number(enemy.preferredAttackMinRange) || Math.min(preferredRange * 0.55, Number(enemy.attackRange) * 0.45 || 0));
                let moved = 0;
                if (horizontalDistance > Math.max(preferredRange, Math.min(Number(enemy.attackRange) || 0, preferredRange + 1))) {
                    moved = moveLegacyCharacterEnemyTowardCollisionAware(
                        state,
                        enemy,
                        state.player.currentTransform.x,
                        characterEnemyRunSpeed(enemy, state.tuning),
                        dt,
                        Math.max(0, preferredRange)
                    );
                } else if (horizontalDistance < minRange && preferredRange > 0) {
                    const desiredX = state.player.currentTransform.x - enemy.facing * preferredRange;
                    moved = moveLegacyCharacterEnemyTowardCollisionAware(
                        state,
                        enemy,
                        desiredX,
                        characterEnemyRunSpeed(enemy, state.tuning),
                        dt,
                        0
                    );
                }
                if (moved > 0) {
                    enemy.movementPhase = "chase";
                    setCharacterEnemyAnimation(enemy, "walk");
                } else {
                    enemy.movementPhase = "alert";
                    setCharacterEnemyAnimation(enemy, "idle");
                }
                syncCharacterEnemyTarget(state, enemy);
                continue;
            }

            if (enemy.attackCooldownTimer <= 0 && characterEnemyReadyToAttackFromCurrentPosition(state, enemy)) {
                startCharacterEnemyAttack(state, enemy);
                syncCharacterEnemyTarget(state, enemy);
                continue;
            }

            const stopDistance = Math.max(
                Number(enemy.attackRange) || 1,
                (Math.max(1, Number(enemy.width) || 1) + Math.max(1, Number(state.player.width) || 1)) * 0.5 - 4
            );
            const moved = moveLegacyCharacterEnemyTowardCollisionAware(
                state,
                enemy,
                state.player.currentTransform.x,
                characterEnemyRunSpeed(enemy, state.tuning),
                dt,
                stopDistance
            );
            if (moved > 0) {
                enemy.movementPhase = "chase";
                setCharacterEnemyAnimation(enemy, "walk");
            } else {
                enemy.movementPhase = "alert";
                setCharacterEnemyAnimation(enemy, "idle");
            }
            syncCharacterEnemyTarget(state, enemy);
            continue;
        }

        if (enemy.strategy !== "simple_patrol" || enemy.patrolDistance <= 0 || enemy.walkSpeed <= 0) {
            updateCharacterEnemyPassiveGroundMotion(state, enemy, dt);
            enemy.movementPhase = "guard";
            setCharacterEnemyAnimation(enemy, "idle");
            syncCharacterEnemyTarget(state, enemy);
            continue;
        }

        if (enemy.movementPhase !== "walk") {
            updateCharacterEnemyPassiveGroundMotion(state, enemy, dt);
            enemy.movementPhase = "idle";
            setCharacterEnemyAnimation(enemy, "idle");
            enemy.phaseTimer = Math.max(0, (Number(enemy.phaseTimer) || 0) - dt);
            if (enemy.phaseTimer <= 0) {
                enemy.movementPhase = "walk";
                setCharacterEnemyAnimation(enemy, "walk");
            }
            syncCharacterEnemyTarget(state, enemy);
            continue;
        }

        setCharacterEnemyAnimation(enemy, "walk");
        const direction = enemy.facing < 0 ? -1 : 1;
        const boundaryX = direction < 0 ? enemy.patrolMinX : enemy.patrolMaxX;
        const moved = moveLegacyCharacterEnemyTowardCollisionAware(
            state,
            enemy,
            boundaryX,
            Math.max(1, enemy.walkSpeed),
            dt
        );
        if (moved <= 0.0001 && Math.abs(enemy.groundVelocityX) <= 0.05) {
            pauseAndTurnCharacterEnemy(enemy);
            syncCharacterEnemyTarget(state, enemy);
            continue;
        }
        if (!enemy.airborne && Math.abs(enemy.currentTransform.x - boundaryX) <= 1 && Math.abs(enemy.groundVelocityX) <= 0.05) {
            pauseAndTurnCharacterEnemy(enemy);
        }
        syncCharacterEnemyTarget(state, enemy);
    }
}

function caveBoundaryParallaxOffset(state) {
    const bounds = state.world?.bounds || {};
    const camera = state.camera?.currentTransform || state.camera || {};
    const parallaxX = clamp(Number(state.world?.layerVisuals?.foreground?.parallaxX) || 1, 0.01, 1.25);
    const parallaxY = clamp(Number(state.world?.layerVisuals?.foreground?.parallaxY) || 1, 0.01, 1.25);
    const worldCenterX = (Number(bounds.x) || 0) + Math.max(0, Number(bounds.w) || 0) * 0.5;
    const worldCenterY = (Number(bounds.y) || 0) + Math.max(0, Number(bounds.h) || 0) * 0.5;
    return {
        x: ((Number(camera.x) || 0) - worldCenterX) * (parallaxX - 1),
        y: ((Number(camera.y) || 0) - worldCenterY) * (parallaxY - 1)
    };
}

function caveBoundaryQueryRect(state) {
    const rect = getPlayerRect(state);
    const parallaxOffset = caveBoundaryParallaxOffset(state);
    // Foreground points render at authoredPoint - parallaxOffset. Moving the
    // wizard query by +parallaxOffset compares against that same apparent line.
    return {
        x: rect.x + parallaxOffset.x,
        y: rect.y + parallaxOffset.y,
        w: rect.w,
        h: rect.h
    };
}

function markCaveBoundaryTouching(state, inwardNormal) {
    const touching = state.collisions?.playerTouching;
    if (!touching) return;
    if (Math.abs(inwardNormal.x) >= Math.abs(inwardNormal.y)) {
        if (inwardNormal.x > 0) touching.left = true;
        else touching.right = true;
    } else if (inwardNormal.y > 0) {
        touching.up = true;
    } else {
        touching.down = true;
    }
}

function applyPlayerCaveBoundary(state) {
    const player = state.player;
    const boundary = state.world?.caveKillBoundary;
    if (!player || playerDeathActive(state) || player.combatState === "dead" || !player.targetable) {
        return false;
    }

    let blocked = false;
    for (let iteration = 0; iteration < 6; iteration += 1) {
        const contact = evaluateCaveBoundaryRect(boundary, caveBoundaryQueryRect(state));
        if (!contact.outside) {
            if (blocked) {
                addEvent(state, "PLAYER_CAVE_BLACK_BOUNDARY_BLOCKED", {
                    boundarySource: boundary.source || "caveFullBlackOutset",
                    x: round(player.currentTransform.x),
                    y: round(player.currentTransform.y)
                });
            }
            return false;
        }

        if (contact.kind === "killable") {
            const rect = getPlayerRect(state);
            addEvent(state, "PLAYER_CAVE_BLACK_BOUNDARY_CROSSED", {
                boundarySource: boundary.source || "caveFullBlackOutset",
                x: round(player.currentTransform.x),
                y: round(player.currentTransform.y),
                rect: {
                    x: round(rect.x),
                    y: round(rect.y),
                    w: round(rect.w),
                    h: round(rect.h)
                }
            });
            return triggerPlayerDeath(state, {
                sourceId: boundary.source || "caveFullBlackOutset",
                resetReason: "crossedCaveFullBlackBoundary",
                cause: "caveFullBlackBoundary"
            });
        }

        blocked = true;
        player.currentTransform.x += contact.correction.x;
        player.currentTransform.y += contact.correction.y;
        const inwardSpeed = player.vx * contact.inwardNormal.x + player.vy * contact.inwardNormal.y;
        if (inwardSpeed < 0) {
            player.vx -= contact.inwardNormal.x * inwardSpeed;
            player.vy -= contact.inwardNormal.y * inwardSpeed;
        }
        markCaveBoundaryTouching(state, contact.inwardNormal);
    }

    if (blocked) {
        addEvent(state, "PLAYER_CAVE_BLACK_BOUNDARY_BLOCKED", {
            boundarySource: boundary.source || "caveFullBlackOutset",
            x: round(player.currentTransform.x),
            y: round(player.currentTransform.y)
        });
    }
    return false;
}

function applyPlayerWorldBoundsKill(state) {
    const player = state.player;
    const bounds = state.world?.bounds;
    if (!player || playerDeathActive(state) || player.combatState === "dead" || !player.targetable ||
        !bounds || ![bounds.x, bounds.y, bounds.w, bounds.h].every(Number.isFinite) || bounds.w <= 0 || bounds.h <= 0) {
        return false;
    }


    const rect = getPlayerRect(state);
    const right = bounds.x + bounds.w;
    const bottom = bounds.y + bounds.h;
    const crossedLeft = rect.x < bounds.x;
    const crossedRight = rect.x + rect.w > right;
    const crossedTop = rect.y < bounds.y;
    const crossedBottom = rect.y + rect.h > bottom;
    if (!crossedLeft && !crossedRight && !crossedTop && !crossedBottom) {
        return false;
    }

    const sides = [];
    if (crossedLeft) sides.push("left");
    if (crossedRight) sides.push("right");
    if (crossedTop) sides.push("top");
    if (crossedBottom) sides.push("bottom");
    addEvent(state, "PLAYER_WORLD_BOUNDS_CROSSED", {
        side: sides.join("+"),
        x: round(player.currentTransform.x),
        y: round(player.currentTransform.y)
    });
    return triggerPlayerDeath(state, {
        sourceId: "worldBounds",
        resetReason: "worldBounds",
        cause: "worldBounds"
    });
}

function playerDeathActive(state) {
    const phase = state.player?.deathPhase;
    return phase === "cover" || phase === "burst" || phase === "afterglow";
}

function updatePlayerDeath(state, dt) {
    const player = state.player;
    if (!playerDeathActive(state)) {
        return false;
    }

    updateMovingPlatforms(state, dt);
    updateProjectiles(state, dt);
    updateWorldEffects(state, dt);
    player.deathElapsed = Math.max(0, Number(player.deathElapsed) || 0) + dt;
    player.deathPhaseTimer = Math.max(0, (Number(player.deathPhaseTimer) || 0) - dt);

    if (player.deathPhase === "cover" && player.deathPhaseTimer <= 0) {
        removePlayerDeathCoverSparks(state);
        player.visible = false;
        player.deathPhase = "burst";
        player.deathPhaseTimer = Math.max(FIXED_DT, Number(state.tuning.playerDeathBurstSeconds) || 0.72);
        emitPlayerDeathBurst(state);
        addEvent(state, "PLAYER_DEATH_BURST", {
            sourceId: player.deathSourceId || "unknown",
            x: round(player.currentTransform.x),
            y: round(player.currentTransform.y)
        });
    } else if (player.deathPhase === "burst" && player.deathPhaseTimer <= 0) {
        player.deathPhase = "afterglow";
        player.deathPhaseTimer = Math.max(FIXED_DT, Number(state.tuning.playerDeathAfterglowSeconds) || 2);
        addEvent(state, "PLAYER_DEATH_AFTERGLOW", {
            sourceId: player.deathSourceId || "unknown",
            x: round(player.currentTransform.x),
            y: round(player.currentTransform.y)
        });
    } else if (player.deathPhase === "afterglow" && player.deathPhaseTimer <= 0) {
        resetPlayer(state, player.deathResetReason || "defeated");
    }
    return true;
}

function activeCutsceneGotoCharacterId(state) {
    const script = state.story?.cutscene;
    const command = script?.commands?.[script.commandIndex];
    return command?.type === "GOTO" ? command.characterId : null;
}

function detachActiveCutsceneGotoCharacter(state) {
    const characterId = activeCutsceneGotoCharacterId(state);
    if (!characterId) return;
    const character = cutsceneCharacter(state, characterId);
    if (character) detachCutsceneCharacterFromMovingPlatform(character);
}

function cutsceneEnemyHasAnimationOverride(state, enemy) {
    const overrides = state.story?.cutscene?.animationOverrides || {};
    return Object.keys(overrides).some((characterId) =>
        characterId !== "wizard" && (enemy?.id === characterId || enemy?.entityId === characterId)
    );
}

function updateCutscenePlayerPassiveMotion(state, dt) {
    const p = state.player;
    if (!p) return;

    const safeDt = Math.max(0, Number(dt) || 0);
    // Drop-through is a brief physical grace period, not player intent. Time
    // continues during story control so one-way floors become solid again on
    // schedule instead of remaining pass-through for the whole cutscene.
    p.dropThroughTimer = Math.max(0, (Number(p.dropThroughTimer) || 0) - safeDt);
    if (activeCutsceneGotoCharacterId(state) === "wizard") return;

    if (state.equipment?.rocket?.attachedBoosting) {
        // Defensive mirror of startCutsceneScript(): held backpack boost must
        // never become free thrust merely because normal input handling is paused.
        stopAttachedBoost(state, "cutscene");
    }

    const waterBefore = refreshPlayerWaterState(state);
    const flightActive = flightPowerUpActive(state) && !waterBefore.inWater && !p.bodySlamCommitted;
    const rocket = state.equipment?.rocket;
    if (!flightActive && rocket?.state === "flight") {
        rocket.state = "mountedReady";
        rocket.attachedBoostTime = 0;
        rocket.boostAccelerationNow = 0;
        rocket.boostVisualPowerNow = 0;
        rocket.attachedSmokeTimer = 0;
    }
    const wasOnGround = Boolean(p.onGround);
    if (wasOnGround && !waterBefore.inWater && !flightActive) {
        p.airborneTime = 0;
        return;
    }

    p.groundStride = null;
    p.wasOnGround = wasOnGround;
    p.ax = 0;

    const movementSpeedScale = playerMovementSpeedScale(state);
    if (waterBefore.inWater) {
        p.vx = applyWaterDrag(
            p.vx,
            waterBefore.submersion,
            state.tuning.waterHorizontalLinearDrag,
            state.tuning.waterHorizontalQuadraticDrag,
            safeDt
        );
    } else if (flightActive) {
        p.vx = approach(p.vx, 0, state.tuning.groundFriction * movementSpeedScale * safeDt);
    } else {
        p.vx *= Math.max(0, 1 - Math.max(0, Number(state.tuning?.airDrag) || 0) * safeDt);
    }

    const passiveSpeedLimit = Math.max(1, Number(state.tuning.maxRunSpeed) || DEFAULT_TUNING.maxRunSpeed)
        * movementSpeedScale
        * (waterBefore.inWater
            ? Math.max(0.05, Number(state.tuning.waterHorizontalSpeedScale) || 0.45)
            : (flightActive ? FLIGHT_MOVEMENT_SPEED_MULTIPLIER : 1));
    p.vx = clamp(p.vx, -passiveSpeedLimit, passiveSpeedLimit);
    moveAndCollideX(state, p.vx * safeDt);

    if (waterBefore.inWater) {
        integratePlayerWaterMotion(state, createInputFrame(), safeDt, wasOnGround, waterBefore);
    } else {
        // This shared path preserves ordinary jump/fall integration and applies
        // the Flight power-up governor identically to normal gameplay.
        integratePlayerVerticalMotion(state, createInputFrame(), safeDt, wasOnGround, false);
    }
    if (resolvePlayerPenetrations(state, wasOnGround)) return;

    const waterAfter = refreshPlayerWaterState(state);
    if (waterAfter.inWater && state.equipment?.rocket?.attachedBoosting) {
        stopAttachedBoost(state, "water");
    }
    if (!p.onGround) p.airborneTime = Math.max(0, Number(p.airborneTime) || 0) + safeDt;
    else p.airborneTime = 0;
}

function updateCutsceneEnemyPassiveMotion(state, dt) {
    const activeGotoCharacterId = activeCutsceneGotoCharacterId(state);
    for (const enemy of state.enemies || []) {
        if (!enemy || enemy.simulationDormant === true) continue;
        enemy.hitFlashTimer = Math.max(0, (Number(enemy.hitFlashTimer) || 0) - dt);
        enemy.healthBarTimer = Math.max(0, (Number(enemy.healthBarTimer) || 0) - dt);

        if (enemy.kind !== "characterEnemy") {
            if (enemy.health <= 0) {
                enemy.combatState = ENEMY_COMBAT_STATE.DEAD;
                enemy.state = "destroyed";
            } else if (enemy.state === "hurt" && enemy.hitFlashTimer <= 0) {
                enemy.combatState = ENEMY_COMBAT_STATE.ALIVE;
                enemy.state = "idle";
            }
            continue;
        }

        // Script participants are protected from damage, and an active GOTO owns
        // its actor completely. Other enemies keep only passive physics/presentation.
        const gotoOwnsEnemy = activeGotoCharacterId && (enemy.id === activeGotoCharacterId || enemy.entityId === activeGotoCharacterId);
        if (gotoOwnsEnemy) continue;
        const collisionRecovery = resolveCharacterEnemyPenetrations(state, enemy);
        if (collisionRecovery.recovered || collisionRecovery.killed) continue;

        if (enemy.deathPendingLanding === true) {
            enemy.health = 0;
            enemy.combatState = ENEMY_COMBAT_STATE.DEATH_PENDING_LANDING;
            enemy.attackTimer = 0;
            clearCharacterEnemyAttackLunge(enemy);
            enemy.attackHitApplied = false;
            enemy.hurtTimer = 0;
            enemy.deathElapsed = 0;
            enemy.currentTransform.alpha = 1;
            enemy.animationClock.current = Math.max(0, Number(enemy.animationClock.current) || 0) + dt;
            if (enemy.airborne === true) {
                const navigation = characterEnemyNavigationContext(state, enemy);
                updateCharacterEnemyAirTraversal(state, enemy, dt, navigation.supports);
            }
            if (enemy.airborne === true) {
                enemy.combatState = ENEMY_COMBAT_STATE.DEATH_PENDING_LANDING;
                syncCharacterEnemyTarget(state, enemy);
                continue;
            }
            beginCharacterEnemyDeath(state, enemy);
            syncCharacterEnemyTarget(state, enemy);
            continue;
        }

        if (enemy.health <= 0 || enemy.combatState === ENEMY_COMBAT_STATE.DEAD) {
            enemy.health = 0;
            enemy.combatState = ENEMY_COMBAT_STATE.DEAD;
            enemy.movementPhase = "dead";
            enemy.attackTimer = 0;
            clearCharacterEnemyAttackLunge(enemy);
            enemy.attackHitApplied = false;
            enemy.deathTimer = Math.max(0, (Number(enemy.deathTimer) || 0) - dt);
            enemy.animationClock.current = Math.max(0, Number(enemy.animationClock.current) || 0) + dt;
            if (enemy.locomotion === "flying") {
                updateDeadFlyingCharacterEnemy(state, enemy, dt);
            } else {
                releaseCharacterEnemyIfGroundSupportLost(state, enemy);
                if (enemy.airborne === true) updateCharacterEnemyPassiveFall(state, enemy, dt, { preserveAnimation: true });
                cullPendingGroundCharacterEnemyDropIfOffWorld(state, enemy);
                emitGroundCharacterEnemyDropsAtCorpseIfReady(state, enemy);
                updateDeadEnemyPresentation(state, enemy, dt);
                enemy.movementPhase = "dead";
                setCharacterEnemyAnimation(enemy, "death");
                syncCharacterEnemyTarget(state, enemy);
            }
            continue;
        }

        const hadHurtPresentation = (Number(enemy.hurtTimer) || 0) > 0 || enemy.combatState === ENEMY_COMBAT_STATE.HURT;
        const hasAnimationOverride = cutsceneEnemyHasAnimationOverride(state, enemy);
        if (hadHurtPresentation) {
            enemy.hurtTimer = Math.max(0, (Number(enemy.hurtTimer) || 0) - dt);
        }

        // Flying locomotion is autonomous flight behavior, so living flyers stay
        // paused with AI. Ground actors are carried by moving platforms; an already-
        // airborne jump/fall keeps its ballistic motion through the cutscene.
        if (enemy.locomotion !== "flying" && enemy.airborne === true) {
            if (!hasAnimationOverride) {
                enemy.animationClock.current = Math.max(0, Number(enemy.animationClock.current) || 0) + dt;
            }
            const navigation = characterEnemyNavigationContext(state, enemy);
            updateCharacterEnemyAirTraversal(state, enemy, dt, navigation.supports);
        } else if (hadHurtPresentation && !hasAnimationOverride) {
            enemy.animationClock.current = Math.max(0, Number(enemy.animationClock.current) || 0) + dt;
        }

        if (hadHurtPresentation) {
            if (enemy.hurtTimer > 0) {
                enemy.combatState = ENEMY_COMBAT_STATE.HURT;
                enemy.movementPhase = "hurt";
                if (!hasAnimationOverride) setCharacterEnemyAnimation(enemy, "hurt");
            } else {
                enemy.combatState = ENEMY_COMBAT_STATE.ALIVE;
                enemy.movementPhase = enemy.airborne === true ? "air" : "idle";
                if (!hasAnimationOverride) setCharacterEnemyAnimation(enemy, enemy.airborne === true ? "walk" : "idle");
            }
        }
        syncCharacterEnemyTarget(state, enemy);
    }
}

function updateCutsceneWorldSimulation(state, dt) {
    // AI decisions and spawners stay frozen, but passive world motion continues.
    // GOTO takes ownership before platform carry; everyone else may ride naturally.
    detachActiveCutsceneGotoCharacter(state);
    updateSignalReceivers(state, dt);
    updateMovingPlatforms(state, dt);
    updateCutscenePlayerPassiveMotion(state, dt);
    updateCutsceneEnemyPassiveMotion(state, dt);
    updateProjectiles(state, dt);
    updateWorldEffects(state, dt);
    updateFuelRecharge(state, dt);
    updateHealth(state, dt);
    updateHat(state);
}

function updatePortalExitWorldSimulation(state, dt) {
    // The exit animation owns only the wizard. Everything else continues as a
    // normal gameplay frame so enemies and already-airborne projectiles do not
    // freeze while the door opens/closes.
    updateSignalReceivers(state, dt);
    updateMovingPlatforms(state, dt);
    updateAutomaticEnemySpawning(state, dt);
    updateEnemySpawners(state, dt);
    updateCharacterEnemies(state, dt);
    pruneFinishedAutomaticEnemies(state);
    updateProjectiles(state, dt);
    updateWorldEffects(state, dt);
    updateFuelRecharge(state, dt);
    updateHealth(state, dt);
    updateHat(state);
}


function clearPlayerLungeState(state) {
    const p = state.player;
    if (!p) return;
    p.lungeCharging = false;
    p.lungeActive = false;
    p.lungeChargeTime = 0;
    p.lungeHoldPending = false;
    p.fireHoldLungePending = false;
    p.fireHoldLungeTime = 0;
    p.lungeChargeUsesFire = false;
    p.lungeCooldownTimer = 0;
    p.lungeDistanceRemaining = 0;
    p.lungeHitEnemyIds = [];
    p.height = state.tuning.playerHeight;
    const rocket = state.equipment?.rocket;
    if (rocket?.state === "lunge") {
        rocket.state = "mountedReady";
    }
    if (rocket) {
        rocket.boostAccelerationNow = 0;
        rocket.boostVisualPowerNow = 0;
        rocket.attachedSmokeTimer = 0;
    }
}

function playerLungeHitboxHeight(state) {
    const standingHeight = Math.max(8, Number(state.tuning.playerHeight) || DEFAULT_TUNING.playerHeight);
    return clamp(Number(state.tuning.playerLungeHitboxHeight) || standingHeight, 8, standingHeight);
}

function setPlayerLungeHitbox(state, active) {
    state.player.height = active ? playerLungeHitboxHeight(state) : state.tuning.playerHeight;
}

function cancelPlayerLungeCharge(state, reason = "cancelled") {
    const p = state.player;
    if (!p.lungeCharging) return false;
    p.lungeCharging = false;
    p.lungeChargeTime = 0;
    p.lungeChargeUsesFire = false;
    state.equipment.rocket.attachedSmokeTimer = 0;
    setPlayerLungeHitbox(state, false);
    addEvent(state, "PLAYER_LUNGE_CHARGE_CANCELLED", { reason });
    return true;
}

function startPlayerLungeCharge(state, useFireButton = false) {
    const p = state.player;
    if (!state.playerProgression?.lungeUnlocked) return false;
    if (p.lungeCharging || p.lungeActive || !p.onGround || flightPowerUpActive(state) || p.inWater) return false;
    if (state.equipment.rocket.attachedBoosting) stopAttachedBoost(state, "lungeCharge");
    p.lungeCharging = true;
    p.lungeChargeTime = 0;
    p.lungeChargeUsesFire = useFireButton === true;
    p.vx = 0;
    p.ax = 0;
    p.groundStride = null;
    state.equipment.rocket.attachedSmokeTimer = 0;
    setPlayerLungeHitbox(state, true);
    addEvent(state, "PLAYER_LUNGE_CHARGE_STARTED", { x: round(p.currentTransform.x), y: round(p.currentTransform.y) });
    return true;
}

function startPlayerLunge(state) {
    const p = state.player;
    const t = state.tuning;
    if (!p.lungeCharging || p.lungeChargeTime + 1e-9 < t.playerLungeChargeSeconds) return false;
    if (flightPowerUpActive(state) || p.inWater) {
        cancelPlayerLungeCharge(state, p.inWater ? "water" : "flight");
        return false;
    }
    if (!p.onGround || p.lungeCooldownTimer > 1e-9) return false;
    const fuelCost = Math.max(0, Number(t.attachedBoostKickFuelCost) || 0);
    if (state.fuel.amount + 1e-9 < fuelCost) {
        cancelPlayerLungeCharge(state, "fuelEmpty");
        addEvent(state, "PLAYER_LUNGE_BLOCKED", { reason: "fuelEmpty" });
        return false;
    }
    state.fuel.amount = clamp(state.fuel.amount - fuelCost, 0, state.fuel.max);
    markRocketUse(state);
    p.lungeCharging = false;
    p.lungeChargeUsesFire = false;
    p.lungeActive = true;
    p.lungeChargeTime = Math.max(p.lungeChargeTime, t.playerLungeChargeSeconds);
    p.lungeCooldownTimer = Math.max(0, Number(t.playerLungeCooldownSeconds) || 0);
    p.lungeDistanceRemaining = Math.max(0, Number(t.playerLungeDistance) || 0);
    p.lungeDirection = p.facing >= 0 ? 1 : -1;
    p.lungeSequence = (Number(p.lungeSequence) || 0) + 1;
    p.lungeHitEnemyIds = [];
    p.vx = p.lungeDirection * Math.max(0, Number(t.playerLungeSpeed) || 0);
    p.vy = 0;
    p.ax = 0;
    p.ay = 0;
    p.onGround = false;
    p.supportId = null;
    p.groundStride = null;
    p.ordinaryJumpActive = false;
    p.airBoostArmed = false;
    setPlayerLungeHitbox(state, true);
    const rocket = state.equipment.rocket;
    rocket.state = "lunge";
    rocket.attachedBoosting = false;
    rocket.attachedBoostTime = 0;
    rocket.boostAccelerationNow = 0;
    rocket.boostVisualPowerNow = 1;
    rocket.attachedSmokeTimer = 0;
    addEvent(state, "PLAYER_LUNGE_STARTED", { direction: p.lungeDirection, distance: round(p.lungeDistanceRemaining) });
    return true;
}

function finishPlayerLunge(state, reason = "complete") {
    const p = state.player;
    if (!p.lungeActive) return false;
    p.lungeActive = false;
    p.lungeDistanceRemaining = 0;
    p.vx = 0;
    p.vy = 0;
    p.ax = 0;
    p.ay = state.tuning.gravity;
    p.lungeHitEnemyIds = [];
    setPlayerLungeHitbox(state, false);
    const rocket = state.equipment.rocket;
    if (rocket.state === "lunge") rocket.state = "mountedReady";
    rocket.boostAccelerationNow = 0;
    rocket.boostVisualPowerNow = 0;
    rocket.attachedSmokeTimer = 0;
    addEvent(state, "PLAYER_LUNGE_ENDED", { reason, x: round(p.currentTransform.x), y: round(p.currentTransform.y) });
    return true;
}

function updatePlayerLungeCooldown(state, dt) {
    const p = state.player;
    p.lungeCooldownTimer = Math.max(0, (Number(p.lungeCooldownTimer) || 0) - Math.max(0, dt));
}

function updatePlayerFallImpactExplosionCooldown(state, dt) {
    const p = state.player;
    p.fallImpactExplosionCooldownTimer = Math.max(
        0,
        (Number(p.fallImpactExplosionCooldownTimer) || 0) - Math.max(0, dt)
    );
}

function updatePlayerBodySlamImmunityTimer(state, dt) {
    const p = state.player;
    p.bodySlamImmunityTimer = Math.max(0, (Number(p.bodySlamImmunityTimer) || 0) - Math.max(0, dt));
}

function playerFallWouldDamageAtSpeed(state, verticalSpeed) {
    const t = state.tuning;
    if (t.fallDamageEnabled === false || Math.max(0, Number(t.fallDamagePerWizardHeight) || 0) <= 0) return false;
    return Math.max(0, Number(verticalSpeed) || 0) > Math.max(0, Number(t.fallDamageSafeImpactSpeed) || 0) + 1e-9;
}

function updatePlayerBodySlamCommitment(state, input, flightActive) {
    const p = state.player;
    if (p.bodySlamCommitted) return true;
    if (!state.playerProgression?.fallImpactExplosionUnlocked
        || p.onGround
        || p.inWater
        || flightActive
        || p.lungeCharging
        || p.lungeActive
        || !input.dropHeld
        || (Number(p.fallImpactExplosionCooldownTimer) || 0) > 1e-9
        || !playerFallWouldDamageAtSpeed(state, p.vy)) {
        return false;
    }

    // Intentional approximation: contact or another ordinary hit may land on the
    // tick immediately before the descent is fast enough to commit. We deliberately
    // do not delay or retroactively undo damage just to predict a slam one tick ahead.
    p.bodySlamCommitted = true;
    p.ordinaryJumpActive = false;
    p.airBoostArmed = false;
    if (state.equipment.rocket.attachedBoosting) stopAttachedBoost(state, "bodySlamCommitted");
    addEvent(state, "PLAYER_BODY_SLAM_COMMITTED", {
        x: round(p.currentTransform.x),
        y: round(p.currentTransform.y),
        vy: round(p.vy)
    });
    return true;
}

function cancelPlayerBodySlamCommitment(state, reason = "cancelled") {
    const p = state.player;
    if (!p?.bodySlamCommitted) return false;
    p.bodySlamCommitted = false;
    addEvent(state, "PLAYER_BODY_SLAM_CANCELLED", { reason });
    return true;
}

function finishPlayerBodySlamOnLanding(state) {
    const p = state.player;
    if (!p?.bodySlamCommitted) return false;
    p.bodySlamCommitted = false;
    const immunitySeconds = Math.max(0, Number(state.tuning.playerContactDamageInvulnerabilitySeconds) || 0);
    p.bodySlamImmunityTimer = Math.max(Number(p.bodySlamImmunityTimer) || 0, immunitySeconds);
    state.health.contactInvulnerabilityTimer = Math.max(Number(state.health.contactInvulnerabilityTimer) || 0, immunitySeconds);
    addEvent(state, "PLAYER_BODY_SLAM_LANDED", {
        x: round(p.currentTransform.x),
        y: round(p.currentTransform.y),
        immunitySeconds: round(immunitySeconds)
    });
    return true;
}

function playerCanStartHeldLungeCharge(state, input, flightActive, allowWeaponInput = false) {
    const p = state.player;
    if (!state.playerProgression?.lungeUnlocked
        || p.lungeCharging
        || p.lungeActive
        || !p.onGround
        || p.inWater
        || flightActive) {
        return false;
    }
    const digitalMoveAxis = (input.moveRight ? 1 : 0) - (input.moveLeft ? 1 : 0);
    const analogMoveAxis = Number.isFinite(input.moveAxis) ? clamp(input.moveAxis, -1, 1) : 0;
    if (Math.abs(digitalMoveAxis) > 0.001 || Math.abs(analogMoveAxis) > 0.001) return false;
    if (input.jumpPressed || input.jumpHeld || input.boostPressed || input.boostHeld
        || input.dropPressed || input.dropHeld) {
        return false;
    }
    if (!allowWeaponInput && input.weaponPressed) return false;
    return Math.abs(Number(p.vx) || 0) <= 0.001 && Math.abs(Number(p.vy) || 0) <= 0.001;
}

function updatePlayerFireHoldLungeInputState(state, input, dt, flightActive) {
    const p = state.player;

    if (p.lungeCharging) {
        p.fireHoldLungePending = false;
        p.fireHoldLungeTime = 0;
        if (p.lungeChargeUsesFire) {
            input.lungeHeld = Boolean(input.lungeHeld || input.weaponHeld);
            input.lungeReleased = Boolean(input.lungeReleased || input.weaponReleased);
            input.weaponPressed = false;
            input.weaponHeld = false;
            input.weaponReleased = false;
        }
        return;
    }

    if (p.lungeActive) {
        p.fireHoldLungePending = false;
        p.fireHoldLungeTime = 0;
        return;
    }

    if (!p.fireHoldLungePending) {
        if (!(state.playerProgression?.lungeUnlocked && input.weaponPressed && input.weaponHeld)) return;
        p.fireHoldLungePending = true;
        p.fireHoldLungeTime = 0;
        // Fire always keeps its ordinary button-down action. Holding the same press
        // merely arms an alternate lunge that waits until Ignatius is grounded and
        // completely still before its hold timer begins.
    }

    if (!input.weaponHeld || input.weaponReleased) {
        p.fireHoldLungePending = false;
        p.fireHoldLungeTime = 0;
        return;
    }

    const canStartTimer = playerCanStartHeldLungeCharge(state, input, flightActive, true);
    if (!canStartTimer) {
        p.fireHoldLungeTime = 0;
        return;
    }

    const threshold = Math.max(0.01, Number(state.tuning.playerFireHoldLungeSeconds) || 0.25);
    p.fireHoldLungeTime = Math.min(threshold, (Number(p.fireHoldLungeTime) || 0) + Math.max(0, dt));
    if (p.fireHoldLungeTime + 1e-9 < threshold) return;

    p.fireHoldLungePending = false;
    p.fireHoldLungeTime = 0;
    p.lungeChargeUsesFire = true;
    input.lungePressed = true;
    input.lungeHeld = true;
    input.weaponPressed = false;
    input.weaponHeld = false;
    input.weaponReleased = false;
}

function updatePlayerLungeInputState(state, input, dt, flightActive) {
    const p = state.player;
    if (p.lungeActive) {
        input.jumpPressed = false;
        input.jumpHeld = false;
        input.jumpReleased = false;
        input.boostPressed = false;
        input.boostHeld = false;
        input.boostReleased = false;
        input.weaponPressed = false;
        input.weaponHeld = false;
        input.weaponReleased = false;
        input.dropPressed = false;
        input.dropHeld = false;
        input.dropReleased = false;
        input.interactPressed = false;
        input.interactHeld = false;
        input.interactReleased = false;
        input.lungePressed = false;
        input.lungeHeld = false;
        input.lungeReleased = false;
        return;
    }

    if (p.lungeCharging && (flightActive || p.inWater)) {
        cancelPlayerLungeCharge(state, p.inWater ? "water" : "flight");
    }

    if (p.lungeCharging && (input.jumpPressed || input.boostPressed || input.dropPressed || input.dropHeld || input.weaponPressed)) {
        cancelPlayerLungeCharge(state, input.weaponPressed ? "weapon" : ((input.dropPressed || input.dropHeld) ? "drop" : "jump"));
        input.jumpPressed = false;
        input.jumpHeld = false;
        input.boostPressed = false;
        input.boostHeld = false;
        input.dropPressed = false;
        input.dropHeld = false;
        input.weaponPressed = false;
        input.weaponHeld = false;
    }

    if (!p.lungeCharging && p.lungeChargeUsesFire && input.lungePressed && input.lungeHeld) {
        if (!startPlayerLungeCharge(state, true)) p.lungeChargeUsesFire = false;
    }

    if (!p.lungeCharging) {
        if (!p.lungeHoldPending && state.playerProgression?.lungeUnlocked && input.lungePressed && input.lungeHeld) {
            p.lungeHoldPending = true;
        }
        if (p.lungeHoldPending && (!input.lungeHeld || input.lungeReleased)) {
            p.lungeHoldPending = false;
        }
        if (p.lungeHoldPending && playerCanStartHeldLungeCharge(state, input, flightActive, false)) {
            p.lungeHoldPending = false;
            startPlayerLungeCharge(state, false);
        }
    }
    if (!p.lungeCharging) return;
    p.lungeHoldPending = false;

    // Facing is part of the charge state. Apply the current tick's turn input
    // before an automatic threshold/cooldown launch captures lungeDirection.
    const digitalMoveAxis = (input.moveRight ? 1 : 0) - (input.moveLeft ? 1 : 0);
    const analogMoveAxis = Number.isFinite(input.moveAxis) ? clamp(input.moveAxis, -1, 1) : 0;
    const chargeMoveAxis = Math.abs(analogMoveAxis) > 0.001 ? analogMoveAxis : digitalMoveAxis;
    if (Math.abs(chargeMoveAxis) > 0.001) p.facing = chargeMoveAxis > 0 ? 1 : -1;

    const chargeSeconds = Math.max(0, Number(state.tuning.playerLungeChargeSeconds) || 0);
    let charged = p.lungeChargeTime + 1e-9 >= chargeSeconds;
    // Treat release as an aggregate action release. Native may receive a physical
    // release edge for one mapped key while another Alt/Shift/gamepad binding is
    // still held; that must not cancel the shared lunge action.
    if (!charged && !input.lungeHeld && (input.lungeReleased || !input.lungePressed)) {
        cancelPlayerLungeCharge(state, "releasedEarly");
        return;
    }
    if (!charged && input.lungeHeld) {
        p.lungeChargeTime = Math.min(chargeSeconds, p.lungeChargeTime + Math.max(0, dt));
        charged = p.lungeChargeTime + 1e-9 >= chargeSeconds;
    }
    if (charged) {
        p.lungeChargeTime = Math.max(p.lungeChargeTime, chargeSeconds);
        if (p.lungeCooldownTimer > 1e-9 && !input.lungeHeld) {
            cancelPlayerLungeCharge(state, "releasedDuringCooldown");
            return;
        }
        startPlayerLunge(state);
    }
}

function movePlayerLungeX(state, dx) {
    const p = state.player;
    const previousX = p.currentTransform.x;
    const nextX = previousX + dx;
    const collision = findActorHorizontalSweepCollision(state, p, previousX, nextX);
    p.groundStride = null;
    if (!collision) {
        p.currentTransform.x = nextX;
        return { blocked: false, traveled: Math.abs(dx), previousX };
    }
    p.currentTransform.x = collision.x;
    p.vx = 0;
    if (collision.side === "right") state.collisions.playerTouching.right = true;
    else state.collisions.playerTouching.left = true;
    state.collisions.lastResolution = { axis: "x", id: collision.id, kind: collision.kind, source: collision.source };
    return { blocked: true, traveled: Math.abs(p.currentTransform.x - previousX), previousX };
}

function damageEnemiesFromPlayerLunge(state, previousX, currentX) {
    const p = state.player;
    const hitIds = new Set(Array.isArray(p.lungeHitEnemyIds) ? p.lungeHitEnemyIds : []);
    const sweptRect = {
        x: Math.min(previousX, currentX) - p.width / 2,
        y: p.currentTransform.y - p.height,
        w: Math.abs(currentX - previousX) + p.width,
        h: p.height
    };
    for (const enemy of state.enemies || []) {
        if (!enemy?.id || hitIds.has(enemy.id) || enemy.visible === false || Number(enemy.health) <= 0 || enemy.combatState === "dead") continue;
        if (!rectsOverlap(sweptRect, enemyProjectileHitbox(enemy))) continue;
        hitIds.add(enemy.id);
        applyProjectileDamageToEnemy(state, {
            id: `player_lunge_${p.lungeSequence}`,
            damage: Math.max(0, Number(state.tuning.playerLungeDamage) || 0)
        }, enemy);
    }
    p.lungeHitEnemyIds = [...hitIds];
}

function advancePlayerLunge(state, dt) {
    const p = state.player;
    if (!p.lungeActive) return false;
    const speed = Math.max(0, Number(state.tuning.playerLungeSpeed) || 0);
    const stepDistance = Math.min(Math.max(0, Number(p.lungeDistanceRemaining) || 0), speed * Math.max(0, dt));
    if (stepDistance <= 0.000001) {
        finishPlayerLunge(state, "complete");
        return true;
    }
    p.vx = p.lungeDirection * speed;
    p.vy = 0;
    p.ax = 0;
    p.ay = 0;
    const movement = movePlayerLungeX(state, p.lungeDirection * stepDistance);
    damageEnemiesFromPlayerLunge(state, movement.previousX, p.currentTransform.x);
    p.lungeDistanceRemaining = Math.max(0, p.lungeDistanceRemaining - movement.traveled);
    emitPlayerLungeSmoke(state, dt, 5);
    if (movement.blocked) finishPlayerLunge(state, "blocked");
    else if (p.lungeDistanceRemaining <= 0.000001) finishPlayerLunge(state, "complete");
    return true;
}

export function stepSimulation(state, inputFrame = createInputFrame(), dt = state.clock.fixedDt || FIXED_DT) {
    snapshotSimulationPresentation(state);
    const input = sanitizeInput(inputFrame);
    const p = state.player;
    if (p.lungeActive) {
        input.interactPressed = false;
        input.interactHeld = false;
        input.interactReleased = false;
    }
    const t = state.tuning;
    const fuel = state.fuel;
    const rocket = state.equipment.rocket;

    rocket.fuelBulbFlashTimer = Math.max(0, (rocket.fuelBulbFlashTimer ?? 0) - dt);

    state.clock.tick += 1;
    state.clock.time += dt;
    updateStatusEffects(state, dt);
    updatePickupRespawns(state, dt);
    state.debug.lastInputFrame = cloneInputFrameForDebug(input);
    state.collisions.playerTouching = { left: false, right: false, up: false, down: false };
    state.collisions.lastResolution = null;

    if (!playerDeathActive(state) && state.health.amount <= 0) {
        triggerPlayerDeath(state, {
            sourceId: "healthZero",
            resetReason: "healthDepleted",
            cause: "healthDepleted"
        });
    }
    if (updatePlayerDeath(state, dt)) {
        return state;
    }

    if (state.story?.cutscene?.active) {
        updateCutsceneWorldSimulation(state, dt);
        updateCutsceneScript(state, input, dt);
        return state;
    }

    updateProximityTexts(state, dt);
    updateOverheadSymbol(state, dt);
    if (updatePortalIntro(state, dt)) {
        return;
    }
    if (updateMailboxStory(state, input, dt)) {
        return;
    }
    if (updatePortalExit(state, dt)) {
        updatePortalExitWorldSimulation(state, dt);
        return state;
    }
    if (updateCutsceneScript(state, input, dt)) {
        updateCutsceneWorldSimulation(state, dt);
        return state;
    }
    if (applyPlayerWorldBoundsKill(state)) {
        return state;
    }
    if (applyPlayerCaveBoundary(state)) {
        return state;
    }

    updateCheckpointRunes(state);
    updateTreasureChests(state, dt);
    updatePickups(state);
    const waterBefore = refreshPlayerWaterState(state);
    if (waterBefore.inWater && rocket.attachedBoosting) {
        stopAttachedBoost(state, "water");
    }
    const flightActive = flightPowerUpActive(state) && !waterBefore.inWater && !p.bodySlamCommitted;
    if (!flightActive && rocket.state === "flight") {
        rocket.state = "mountedReady";
        rocket.attachedBoostTime = 0;
        rocket.boostAccelerationNow = 0;
        rocket.boostVisualPowerNow = 0;
        rocket.attachedSmokeTimer = 0;
    }
    updateSignalEmitters(state, input, dt);
    updateSignalReceivers(state, dt);
    updatePlayerLungeCooldown(state, dt);
    updatePlayerFallImpactExplosionCooldown(state, dt);
    updatePlayerBodySlamImmunityTimer(state, dt);
    updatePlayerFireHoldLungeInputState(state, input, dt, flightActive);
    updatePlayerLungeInputState(state, input, dt, flightActive);
    updatePlayerBodySlamCommitment(state, input, flightActive);
    if (p.bodySlamCommitted) {
        input.jumpPressed = false;
        input.jumpHeld = false;
        input.jumpReleased = false;
        input.boostPressed = false;
        input.boostHeld = false;
        input.boostReleased = false;
    }
    if (p.lungeCharging) {
        emitPlayerLungeSmoke(state, dt, playerLungeChargeSmokeDensity(state));
    }

    // Drop-through intent must be visible to moving-platform carry/catch in the
    // same fixed tick. Otherwise a moving green support gets one extra physics
    // turn to carry or re-catch the wizard before ordinary one-way logic runs.
    p.dropThroughTimer = Math.max(0, (Number(p.dropThroughTimer) || 0) - Math.max(0, Number(dt) || 0));
    const dropIntent = Boolean(input.dropHeld || input.dropPressed);
    const mayStartDropThrough = flightActive || waterBefore.inWater || (p.onGround && !input.jumpPressed) || (!p.onGround && p.vy >= 0);
    if (dropIntent && mayStartDropThrough) {
        p.dropThroughTimer = Math.max(
            p.dropThroughTimer,
            Math.max(FIXED_DT, Number(t.playerDropThroughGraceSeconds) || 0.18)
        );
    }
    detachPlayerFromMovingWalkableSupportForDropThrough(state);

    const surfaceHazardPlayerRectStart = getPlayerRect(state);
    updateMovingPlatforms(state, dt);
    updateAutomaticEnemySpawning(state, dt);
    updateEnemySpawners(state, dt);
    updateCharacterEnemies(state, dt);
    pruneFinishedAutomaticEnemies(state);
    if (playerDeathActive(state)) {
        return state;
    }

    const wasOnGround = p.onGround;
    const horizontalVelocityBeforeControl = p.vx;
    p.wasOnGround = wasOnGround;
    p.ax = 0;
    p.ay = t.gravity;

    const digitalMoveAxis = (input.moveRight ? 1 : 0) - (input.moveLeft ? 1 : 0);
    const analogMoveAxis = Number.isFinite(input.moveAxis) ? clamp(input.moveAxis, -1, 1) : 0;
    const moveAxis = Math.abs(analogMoveAxis) > 0.001 ? analogMoveAxis : digitalMoveAxis;
    const movementSpeedScale = playerMovementSpeedScale(state);
    if (p.lungeActive) {
        p.vx = p.lungeDirection * Math.max(0, Number(t.playerLungeSpeed) || 0);
        p.vy = 0;
        p.ax = 0;
        p.ay = 0;
    } else if (p.lungeCharging) {
        if (Math.abs(moveAxis) > 0.001) p.facing = moveAxis > 0 ? 1 : -1;
        if (waterBefore.inWater) {
            p.vx = applyWaterDrag(p.vx, waterBefore.submersion, t.waterHorizontalLinearDrag, t.waterHorizontalQuadraticDrag, dt);
        } else if (wasOnGround) {
            p.vx = approach(p.vx, 0, t.groundFriction * movementSpeedScale * dt);
        } else {
            p.vx *= Math.max(0, 1 - t.airDrag * dt);
        }
        p.ax = dt > 0 ? (p.vx - horizontalVelocityBeforeControl) / dt : 0;
    } else {
        if (waterBefore.inWater) {
            const submergedControl = Math.max(0.12, waterBefore.submersion);
            if (Math.abs(moveAxis) > 0.001) {
                p.facing = moveAxis > 0 ? 1 : -1;
                const accel = t.groundAcceleration * movementSpeedScale
                    * Math.max(0, Number(t.waterHorizontalAccelerationScale) || 0)
                    * submergedControl;
                p.vx += moveAxis * accel * dt;
                p.ax = moveAxis * accel;
            }
            p.vx = applyWaterDrag(
                p.vx,
                waterBefore.submersion,
                t.waterHorizontalLinearDrag,
                t.waterHorizontalQuadraticDrag,
                dt
            );
        } else if (Math.abs(moveAxis) > 0.001) {
            p.facing = moveAxis > 0 ? 1 : -1;
            const accel = ((wasOnGround || flightActive) ? t.groundAcceleration : t.airAcceleration) * movementSpeedScale;
            p.vx += moveAxis * accel * dt;
            p.ax = moveAxis * accel;
        } else if (wasOnGround || flightActive) {
            p.vx = approach(p.vx, 0, t.groundFriction * movementSpeedScale * dt);
        } else {
            p.vx *= Math.max(0, 1 - t.airDrag * dt);
        }

        const levelGroundSpeedLimit = t.maxRunSpeed * movementSpeedScale
            * (waterBefore.inWater
                ? Math.max(0.05, Number(t.waterHorizontalSpeedScale) || 0.45)
                : (flightActive ? FLIGHT_MOVEMENT_SPEED_MULTIPLIER : 1));
        const horizontalSpeedLimit = (!waterBefore.inWater && !flightActive && wasOnGround)
            ? playerGroundedHorizontalSpeedLimit(state, levelGroundSpeedLimit)
            : levelGroundSpeedLimit;
        p.vx = clamp(p.vx, -horizontalSpeedLimit, horizontalSpeedLimit);
        p.ax = dt > 0 ? (p.vx - horizontalVelocityBeforeControl) / dt : 0;
    }

    if (!p.lungeActive && !p.lungeCharging && !flightActive && !waterBefore.inWater) {
        if (input.jumpReleased && !wasOnGround) {
            p.airBoostArmed = true;
        }

        if (input.jumpPressed && wasOnGround) {
            t.jumpVelocity = ordinaryJumpVelocity(t.gravity, t.ordinaryJumpHeight);
            p.vy = t.jumpVelocity;
            p.ordinaryJumpActive = true;
            p.ordinaryJumpStartY = p.currentTransform.y;
            p.ordinaryJumpApexY = null;
            p.onGround = false;
            p.supportId = null;
            p.groundStride = null;
            p.airborneTime = 0;
            p.airBoostArmed = false;
            addEvent(state, "PLAYER_JUMPED", { x: round(p.currentTransform.x), y: round(p.currentTransform.y), vx: round(p.vx), vy: round(p.vy) });
        } else if ((input.jumpPressed || input.boostPressed) && !wasOnGround && !rocket.attachedBoosting) {
            if (p.airBoostArmed) {
                p.airBoostArmed = false;
                startAttachedBoost(state);
            } else {
                addEvent(state, "PLAYER_BOOST_BLOCKED", { reason: "jumpNotReleased" });
            }
        }
    }

    if (!p.lungeActive && !p.lungeCharging && !flightActive && rocket.attachedBoosting) {
        const boostIntentHeld = input.jumpHeld || input.boostHeld;
        const shouldStop = !boostIntentHeld || fuel.amount <= 0;
        if (shouldStop) {
            stopAttachedBoost(state, fuel.amount <= 0 ? "fuelEmpty" : "boostReleased");
        } else {
            rocket.attachedBoostTime += dt;
            rocket.boostBurstTimer = Math.max(0, rocket.boostBurstTimer - dt);
            rocket.boostAccelerationNow = 0;
            rocket.boostVisualPowerNow = attachedBoostVisualPower(state);
            emitAttachedBoostSmoke(state, dt);
            const used = Math.min(fuel.amount, t.attachedBoostDrainRate * dt);
            fuel.amount = clamp(fuel.amount - used, 0, fuel.max);
            markRocketUse(state);
            if (fuel.amount <= 0) {
                stopAttachedBoost(state, "fuelEmpty");
            }
        }
    } else if (!flightActive) {
        rocket.boostAccelerationNow = 0;
        rocket.boostVisualPowerNow = 0;
    }

    if (!p.lungeActive && !p.lungeCharging && input.weaponPressed) {
        launchHomingRocket(state);
    }
    updateProjectiles(state, dt);
    updateWorldEffects(state, dt);
    if (playerDeathActive(state)) {
        return state;
    }

    const lungeOwnedMovement = p.lungeActive;
    if (lungeOwnedMovement) {
        advancePlayerLunge(state, dt);
        if (!p.lungeActive && resolvePlayerPenetrations(state, false)) return state;
    } else {
        if (waterBefore.inWater || flightActive || !p.onGround) {
            p.groundStride = null;
        }
        // Horizontal collision and grounded support resolution intentionally run
        // before vertical gravity integration. Tiny upward platform seams can expose
        // a steep side edge only after gravity nudges the feet downward; probing
        // horizontal walls after that nudge would incorrectly turn the seam into a wall.
        const groundStrideHandled = moveAndCollideX(state, p.vx * dt);
        if (!groundStrideHandled) {
            if (waterBefore.inWater) {
                integratePlayerWaterMotion(state, input, dt, wasOnGround, waterBefore);
            } else {
                integratePlayerVerticalMotion(state, input, dt, wasOnGround, Boolean(input.dropHeld || input.dropPressed));
            }
            if (playerDeathActive(state)) {
                return state;
            }
            if (resolvePlayerPenetrations(state, wasOnGround)) {
                return state;
            }
        }
    }
    updatePlayerBodySlamCommitment(state, input, flightActive);
    const waterAfter = refreshPlayerWaterState(state);
    if (waterAfter.inWater) cancelPlayerBodySlamCommitment(state, "water");
    if (waterAfter.inWater && rocket.attachedBoosting) {
        stopAttachedBoost(state, "water");
    }
    if (applyPlayerWorldBoundsKill(state)) {
        return state;
    }
    if (applyPlayerCaveBoundary(state)) {
        return state;
    }
    applyPlayerSurfaceHazards(state, surfaceHazardPlayerRectStart);
    if (playerDeathActive(state)) {
        return state;
    }
    updateEnemyContactDamage(state);
    if (playerDeathActive(state)) {
        return state;
    }
    updatePickups(state);

    if (!p.onGround) {
        p.airborneTime += dt;
    } else {
        p.airborneTime = 0;
    }

    updateFuelRecharge(state, dt);
    updateHealth(state, dt);
    updateHat(state);
    updateCameraHint(state, dt);

    return state;
}

function markRocketUse(state) {
    state.fuel.lastUsedAt = state.clock.time;
    state.fuel.rechargeDelayTimer = state.tuning.rechargeDelayAfterUse;
    state.fuel.rechargeLatched = false;
}

function startAttachedBoost(state) {
    const rocket = state.equipment.rocket;
    const p = state.player;
    const t = state.tuning;
    if (p?.inWater) {
        addEvent(state, "PLAYER_BOOST_BLOCKED", { reason: "water" });
        return false;
    }
    const kickMax = t.attachedBoostKickChargeMax ?? 1;
    const kickCharge = clamp(rocket.boostKickCharge ?? kickMax, 0, kickMax);
    const kickFuelCost = Math.max(0, t.attachedBoostKickFuelCost ?? 5);
    const hasKickCharge = kickCharge > 0.001 && state.fuel.amount >= kickFuelCost;
    const canSustainWithoutKick = t.attachedBoostAllowSustainWithoutKickCharge !== false && state.fuel.amount > 0;

    if (!hasKickCharge && !canSustainWithoutKick) {
        addEvent(state, "PLAYER_BOOST_BLOCKED", {
            reason: state.fuel.amount < kickFuelCost ? "kickFuel" : "kickCharge",
            fuel: round(state.fuel.amount),
            kickFuelCost: round(kickFuelCost),
            kickCharge: round(kickCharge)
        });
        return false;
    }

    rocket.attachedBoosting = true;
    p.ordinaryJumpActive = false;
    rocket.state = "attachedBoosting";
    rocket.attachedBoostTime = 0;
    rocket.boostBurstTimer = hasKickCharge ? Math.max(0, t.attachedBoostBurstDuration ?? 0.5) : 0;
    if (hasKickCharge) {
        rocket.boostKickCharge = 0;
        state.fuel.amount = clamp(state.fuel.amount - kickFuelCost, 0, state.fuel.max);
    }
    rocket.boostAccelerationNow = 0;
    rocket.boostVisualPowerNow = attachedBoostVisualPower(state);
    rocket.attachedSmokeTimer = 0;
    rocket.lastBoostStartTick = state.clock.tick;
    emitAttachedBoostSmokeBurst(state, hasKickCharge ? (t.attachedBoostSmokeKickPuffs ?? 7) : 3);
    const launchVelocityBefore = p.vy;
    if (hasKickCharge) {
        p.vy = doubleJumpLaunchVelocity(t, p.vy);
    }
    markRocketUse(state);
    addEvent(state, "PLAYER_BOOST_STARTED", {
        fuel: round(state.fuel.amount),
        doubleJumpPhysics: t.doubleJumpPhysics || "consistentApex",
        launchVelocity: round(p.vy),
        velocityDelta: round(p.vy - launchVelocityBefore),
        kickCharge: round(rocket.boostKickCharge),
        kickFuelCost: hasKickCharge ? round(kickFuelCost) : 0
    });
    return true;
}

function getAttachedBoostAcceleration(state) {
    const t = state.tuning;
    const rocket = state.equipment.rocket;
    const fuelRatio = clamp(state.fuel.amount / Math.max(1, state.fuel.max), 0, 1);
    const curve = Math.max(0.05, t.attachedBoostFuelPowerCurve ?? 0.55);
    const fuelScale = (t.attachedBoostMinFuelScale ?? 0.68) + (1 - (t.attachedBoostMinFuelScale ?? 0.68)) * Math.pow(fuelRatio, curve);
    const burstDuration = Math.max(0.04, t.attachedBoostBurstDuration ?? 0.5);
    const burstBlend = clamp((rocket.boostBurstTimer ?? 0) / burstDuration, 0, 1);
    const shapedBurst = burstBlend * burstBlend;
    const initial = t.attachedBoostInitialAcceleration ?? t.attachedBoostAcceleration;
    const sustain = t.attachedBoostSustainAcceleration ?? t.attachedBoostAcceleration;
    return (sustain + (initial - sustain) * shapedBurst) * fuelScale;
}

function flightPowerUpActive(state) {
    return Boolean(activePowerUpEffect(state, POWER_UP_EFFECT_IDS.FLIGHT));
}

function applyFlightGovernor(state, input, dt) {
    if (!flightPowerUpActive(state)) return;

    const safeDt = Math.max(0.0001, Number(dt) || FIXED_DT);
    const upIntent = Boolean(input?.jumpHeld || input?.jumpPressed || input?.boostHeld || input?.boostPressed);
    const downIntent = Boolean(input?.dropHeld || input?.dropPressed);
    const verticalInput = (downIntent ? 1 : 0) - (upIntent ? 1 : 0);
    const movementScale = playerMovementSpeedScale(state);
    const speed = Math.max(1, Number(state.tuning.flightVerticalSpeed) || DEFAULT_TUNING.flightVerticalSpeed)
        * movementScale * FLIGHT_MOVEMENT_SPEED_MULTIPLIER;
    const acceleration = Math.max(1, Number(state.tuning.flightVerticalAcceleration) || DEFAULT_TUNING.flightVerticalAcceleration) * movementScale;
    const targetVelocity = verticalInput * speed;
    const previousVelocity = state.player.vy;

    state.player.vy = approach(state.player.vy, targetVelocity, acceleration * safeDt);
    state.player.ay = (state.player.vy - previousVelocity) / safeDt;
    state.player.ordinaryJumpActive = false;
    state.player.airBoostArmed = false;

    const rocket = state.equipment.rocket;
    rocket.attachedBoosting = false;
    rocket.state = "flight";
    rocket.attachedBoostTime = (Number(rocket.attachedBoostTime) || 0) + safeDt;
    rocket.boostBurstTimer = 0;
    rocket.boostAccelerationNow = state.player.ay;
    rocket.boostVisualPowerNow = verticalInput < -0.001 ? 0.9 : (verticalInput > 0.001 ? 0.24 : 0.48);
    emitAttachedBoostSmoke(state, safeDt);
}

function applyAttachedHoverGovernor(state, dt) {
    const rocket = state.equipment.rocket;
    if (!rocket.attachedBoosting || state.fuel.amount <= 0) {
        return;
    }

    const t = state.tuning;
    const p = state.player;
    const slowClimbSpeed = -Math.max(0, t.attachedBoostHoverFallSpeed ?? 36);
    const brakeAcceleration = Math.max(0, t.attachedBoostHoverBrakeAcceleration ?? 3600);

    // The hover governor now holds Ignatius in a gentle upward drift. It still
    // refuses to pile extra force onto a faster rocket-kick ascent; once the
    // burst slows below the target climb, it trims gravity back toward the same
    // speed magnitude the old hover used for sinking.
    if (p.vy > slowClimbSpeed) {
        const before = p.vy;
        p.vy = Math.max(slowClimbSpeed, p.vy - brakeAcceleration * dt);
        const correction = (p.vy - before) / Math.max(0.0001, dt);
        rocket.boostAccelerationNow = correction;
        p.ay += correction;
        const gravityCancelPower = clamp(Math.abs(correction) / Math.max(1, t.gravity), 0, 1.2);
        rocket.boostVisualPowerNow = Math.max(attachedBoostVisualPower(state), gravityCancelPower * 0.72);
    } else {
        rocket.boostAccelerationNow = 0;
        rocket.boostVisualPowerNow = attachedBoostVisualPower(state);
    }
}

function attachedBoostVisualPower(state) {
    const t = state.tuning;
    const rocket = state.equipment.rocket;
    const burstDuration = Math.max(0.04, t.attachedBoostBurstDuration ?? 0.5);
    const burstBlend = clamp((rocket.boostBurstTimer ?? 0) / burstDuration, 0, 1);
    const kickPower = t.attachedBoostKickVisualPower ?? 1.08;
    const sustainPower = t.attachedBoostSustainVisualPower ?? t.attachedBoostVisualIdlePower ?? 0.36;
    return Math.max(0.08, sustainPower + (kickPower - sustainPower) * burstBlend);
}

function stopAttachedBoost(state, reason) {
    const rocket = state.equipment.rocket;
    if (!rocket.attachedBoosting) {
        return;
    }
    rocket.attachedBoosting = false;
    rocket.state = "mountedReady";
    rocket.attachedBoostTime = 0;
    rocket.boostBurstTimer = 0;
    rocket.boostAccelerationNow = 0;
    rocket.boostVisualPowerNow = 0;
    rocket.attachedSmokeTimer = 0;
    rocket.lastBoostEndTick = state.clock.tick;
    markRocketUse(state);
    addEvent(state, "PLAYER_BOOST_ENDED", { reason, fuel: round(state.fuel.amount) });
}

function rotateVector(vector, radians) {
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return {
        x: vector.x * cos - vector.y * sin,
        y: vector.x * sin + vector.y * cos
    };
}

function deterministicRocketLaunchUnit(state, volleyId, channel, jitterId = null) {
    const random = ensureRandomState(state);
    const saltParts = [
        String(channel || "rocket-launch"),
        state.world?.levelId || "level",
        random.levelLoadCount,
        String(volleyId || "volley")
    ];
    if (jitterId !== null && jitterId !== undefined) {
        saltParts.push(String(jitterId));
    }
    const salt = stableStringHash(saltParts.join(":"));
    return mixedUint32(random.seed ^ salt) / 4294967296;
}

function deterministicRocketLaunchAngleJitterDegrees(state, volleyId, maximumDegrees, jitterId = null) {
    const magnitude = Math.max(0, Number(maximumDegrees) || 0);
    if (magnitude <= 0) return 0;
    const unit = deterministicRocketLaunchUnit(state, volleyId, "rocket-launch-angle-jitter", jitterId);
    return (unit * 2 - 1) * magnitude;
}

function rocketTargetHasLineOfSight(state, origin, target) {
    const start = { x: Number(origin.x) || 0, y: Number(origin.y) || 0 };
    const end = { x: Number(target.x) || 0, y: Number(target.y) || 0 };
    const terrainQueryBounds = {
        minX: Math.min(start.x, end.x),
        minY: Math.min(start.y, end.y),
        maxX: Math.max(start.x, end.x),
        maxY: Math.max(start.y, end.y)
    };
    for (const solid of queryWorldSolids(state.world, terrainQueryBounds)) {
        if (segmentRectIntersection(start, end, solid)) {
            return false;
        }
    }
    for (const segment of queryWorldSegments(state.world, terrainQueryBounds)) {
        // Player rockets deliberately pass through one-way (green/walkable)
        // platforms. Target visibility must use the same obstacle rule or an
        // enemy standing on a green platform is incorrectly ranked as hidden.
        if (segment.kind === "walkable" || !isAreaBlockingSegmentKind(segment.kind)) {
            continue;
        }
        if (segmentSegmentIntersection(start, end, { x: segment.x1, y: segment.y1 }, { x: segment.x2, y: segment.y2 })) {
            return false;
        }
    }
    for (const polygon of queryWorldCollisionPolygons(state.world, terrainQueryBounds)) {
        if (!isAreaBlockingSegmentKind(polygon.kind)) {
            continue;
        }
        if (pointInPolygon(start, polygon) || pointInPolygon(end, polygon) || firstSegmentPolygonBoundaryIntersection(start, end, polygon)) {
            return false;
        }
    }
    return true;
}

function sortRocketTargets(state, targets, originX, originY, facing, options = {}) {
    const origin = { x: originX, y: originY };
    const requireForward = options.requireForward === true;
    return targets
        .filter((target) => !requireForward || (Number(target.x) - originX) * facing >= -0.001)
        .map((target) => {
            const dx = Number(target.x) - originX;
            const dy = Number(target.y) - originY;
            return {
                target,
                hasLineOfSight: rocketTargetHasLineOfSight(state, origin, target),
                isForward: dx * facing >= -0.001,
                distanceSquared: dx * dx + dy * dy
            };
        })
        .sort((left, right) => {
            if (left.hasLineOfSight !== right.hasLineOfSight) return left.hasLineOfSight ? -1 : 1;
            if (!requireForward && left.isForward !== right.isForward) return left.isForward ? -1 : 1;
            const distanceDifference = left.distanceSquared - right.distanceSquared;
            if (Math.abs(distanceDifference) > 0.0001) return distanceDifference;
            return String(left.target.id).localeCompare(String(right.target.id));
        })
        .map((entry) => entry.target);
}

function sortRocketTargetsByHeading(state, targets, originX, originY, headingX, headingY) {
    const headingLength = Math.hypot(Number(headingX) || 0, Number(headingY) || 0);
    const heading = headingLength > 0.000001
        ? { x: headingX / headingLength, y: headingY / headingLength }
        : { x: 1, y: 0 };
    const origin = { x: originX, y: originY };
    return targets
        .map((target) => {
            const dx = Number(target.x) - originX;
            const dy = Number(target.y) - originY;
            const distanceSquared = dx * dx + dy * dy;
            const distance = Math.sqrt(Math.max(0.000001, distanceSquared));
            const alignment = (dx * heading.x + dy * heading.y) / distance;
            return {
                target,
                hasLineOfSight: rocketTargetHasLineOfSight(state, origin, target),
                alignment,
                distanceSquared
            };
        })
        .filter((entry) => entry.alignment >= -0.000001)
        .sort((left, right) => {
            if (left.hasLineOfSight !== right.hasLineOfSight) return left.hasLineOfSight ? -1 : 1;
            const alignmentDifference = right.alignment - left.alignment;
            if (Math.abs(alignmentDifference) > 0.0000001) return alignmentDifference;
            const distanceDifference = left.distanceSquared - right.distanceSquared;
            if (Math.abs(distanceDifference) > 0.0001) return distanceDifference;
            return String(left.target.id).localeCompare(String(right.target.id));
        })
        .map((entry) => entry.target);
}

function rotateVelocityToward(projectile, desired, speed, maxTurnRadians) {
    const currentAngle = Math.atan2(Number(projectile.vy) || 0, Number(projectile.vx) || 0);
    const desiredAngle = Math.atan2(Number(desired.y) || 0, Number(desired.x) || 0);
    let delta = desiredAngle - currentAngle;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    const turn = clamp(delta, -Math.max(0, maxTurnRadians), Math.max(0, maxTurnRadians));
    const nextAngle = currentAngle + turn;
    projectile.vx = Math.cos(nextAngle) * speed;
    projectile.vy = Math.sin(nextAngle) * speed;
}

function homingTargetSearchRange(state) {
    return Math.max(1, Number(state.tuning?.rocketTargetSearchDistance) || 1500);
}

function projectileBeyondLifetimeExplosionMargin(state, projectile) {
    const visible = cameraVisibleWorldRect(state);
    const margin = Math.max(0, Number(state.tuning?.rocketLifetimeExplosionOffscreenMargin) || 0);
    const x = Number(projectile?.currentTransform?.x) || 0;
    const y = Number(projectile?.currentTransform?.y) || 0;
    const dx = x < visible.x ? visible.x - x : (x > visible.x + visible.w ? x - (visible.x + visible.w) : 0);
    const dy = y < visible.y ? visible.y - y : (y > visible.y + visible.h ? y - (visible.y + visible.h) : 0);
    return Math.hypot(dx, dy) > margin;
}

function homingTargetWithinRange(state, target, originX, originY) {
    if (!target || target.state !== "active") return false;

    const enemyId = String(target.enemyId || "").trim();
    const enemy = enemyId
        ? (state.enemies || []).find((candidate) => candidate?.id === enemyId)
        : null;
    if (enemy && (enemy.visible === false || Number(enemy.health) <= 0)) return false;

    const dx = (Number(target.x) || 0) - (Number(originX) || 0);
    const dy = (Number(target.y) || 0) - (Number(originY) || 0);
    const range = homingTargetSearchRange(state);
    return dx * dx + dy * dy <= range * range;
}

function orderedForwardTargets(state, originX, originY, facing) {
    const activeTargets = (state.targets || []).filter((target) => homingTargetWithinRange(state, target, originX, originY));
    if (!activeTargets.length) return [];
    return sortRocketTargets(state, activeTargets, originX, originY, facing, { requireForward: true });
}

function orderedHomingTargets(state, originX, originY, facing) {
    const activeTargets = (state.targets || []).filter((target) => homingTargetWithinRange(state, target, originX, originY));
    if (!activeTargets.length) return [];
    return sortRocketTargets(state, activeTargets, originX, originY, facing);
}

function orderedHeadingHomingTargets(state, originX, originY, headingX, headingY) {
    const activeTargets = (state.targets || []).filter((target) => homingTargetWithinRange(state, target, originX, originY));
    if (!activeTargets.length) return [];
    return sortRocketTargetsByHeading(state, activeTargets, originX, originY, headingX, headingY);
}

function activeRocketProfile(state) {
    return activeWrenchPowerUpEffect(state)?.definition?.rocket || {
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
        initialAnglesDegrees: [0],
        initialAngleJitterDegrees: 0,
        homingMeanderIntervalSeconds: 0,
        homingMeanderTurnDegrees: 0,
        homingTurnDegreesPerWorldUnit: 0,
        homingPreferForwardAlignment: false,
        separateTargets: false,
        aimAtNearestForwardTarget: false,
        areaDamageRadiusWizardHeights: 0,
        boomerang: false,
        phasesThroughObstacles: false
    };
}

function launchHomingRocket(state) {
    const t = state.tuning;
    if (state.player?.inWater) {
        addEvent(state, "ROCKET_LAUNCH_BLOCKED", { reason: "water" });
        return false;
    }
    const weapons = state.weapons;
    const powerUpMultipliers = rocketPowerUpMultipliers(state);
    const activeWrenchEffect = activeWrenchPowerUpEffect(state);
    const rocketProfile = activeWrenchEffect?.definition?.rocket || activeRocketProfile(state);
    const wrenchEffectId = activeWrenchEffect?.id || null;
    const wrenchGlowTint = String(rocketProfile.glowTint || activeWrenchEffect?.definition?.hud?.glowTint || "").trim() || null;
    const wrenchGlowFrameId = wrenchRocketGlowAtlasFrameId(wrenchEffectId);
    const launchCost = Math.max(0, t.rocketLaunchCost * powerUpMultipliers.launchFuelCostMultiplier);
    if (state.fuel.amount < launchCost) {
        addEvent(state, "ROCKET_LAUNCH_BLOCKED", { reason: "fuel", fuel: round(state.fuel.amount), requiredFuel: round(launchCost) });
        return false;
    }

    const p = state.player;
    const projectileCount = Math.max(1, Math.floor(Number(rocketProfile.projectileCount) || 1));
    const launchOrigin = {
        x: Number(p.currentTransform.x) || 0,
        y: (Number(p.currentTransform.y) || 0) - (Number(p.height) || 0) * 0.72
    };
    const launchFacing = p.facing < 0 ? -1 : 1;
    const defaultDirection = rocketProfile.launchMode === "forward"
        ? { x: p.facing < 0 ? -1 : 1, y: 0 }
        : { x: 0, y: -1 };
    const targets = rocketProfile.homingPreferForwardAlignment
        ? orderedHeadingHomingTargets(state, launchOrigin.x, launchOrigin.y, defaultDirection.x, defaultDirection.y)
        : orderedHomingTargets(state, launchOrigin.x, launchOrigin.y, launchFacing);
    const aimedTarget = rocketProfile.aimAtNearestForwardTarget
        ? orderedForwardTargets(state, launchOrigin.x, launchOrigin.y, launchFacing)[0] || null
        : null;
    const aimedVector = aimedTarget
        ? { x: Number(aimedTarget.x) - launchOrigin.x, y: Number(aimedTarget.y) - launchOrigin.y }
        : null;
    const baseDirection = aimedVector && Math.hypot(aimedVector.x, aimedVector.y) > 0.0001
        ? normalizeVector(aimedVector)
        : defaultDirection;
    const angles = Array.isArray(rocketProfile.initialAnglesDegrees) && rocketProfile.initialAnglesDegrees.length
        ? rocketProfile.initialAnglesDegrees
        : [0];
    const flightActive = flightPowerUpActive(state);
    const projectileSpeed = t.rocketProjectileSpeed
        * Math.max(0.05, Number(rocketProfile.speedMultiplier) || 1)
        * playerMovementSpeedScale(state)
        * (flightActive ? FLIGHT_MOVEMENT_SPEED_MULTIPLIER : 1);
    const flightStandardRocketDamageMultiplier = !activeWrenchEffect && flightActive
        ? Math.max(0, Number(t.flightStandardRocketDamageMultiplier) || 0)
        : 1;
    const projectileDamage = Math.max(0,
        (t.rocketProjectileDamage ?? 30)
        * Math.max(0, Number(rocketProfile.damageMultiplier) || 0)
        * flightStandardRocketDamageMultiplier
    );
    const projectileRadius = 15 * Math.max(0.1, Number(rocketProfile.radiusMultiplier) || 1);
    const launchSequenceIntervalSeconds = Math.max(0, Number(rocketProfile.launchSequenceIntervalSeconds) || 0);
    const areaDamageRadius = Math.max(0, Number(rocketProfile.areaDamageRadiusWizardHeights) || 0) * Math.max(1, Number(t.wizardHeight) || Number(p.height) || 104);
    const standardRocketSecondarySplashDamage = wrenchEffectId
        ? 0
        : Math.max(0, Number(t.standardRocketSecondarySplashDamage) || 0) * flightStandardRocketDamageMultiplier;
    const standardRocketSecondarySplashRadius = standardRocketSecondarySplashDamage > 0
        ? Math.max(0, Number(t.standardRocketSecondarySplashRadiusWizardHeights) || 0) * Math.max(1, Number(t.wizardHeight) || Number(p.height) || 104)
        : 0;
    const volleyId = `rocket_volley_${state.clock.tick}_${weapons.nextProjectileId}`;
    const spawnedIds = [];

    const initialAngleJitterDegrees = Math.max(0, Number(rocketProfile.initialAngleJitterDegrees) || 0);
    const homingMeanderIntervalSeconds = Math.max(0, Number(rocketProfile.homingMeanderIntervalSeconds) || 0);
    const homingMeanderTurnDegrees = Math.max(0, Number(rocketProfile.homingMeanderTurnDegrees) || 0);
    const homingTurnDegreesPerWorldUnit = Math.max(0, Number(rocketProfile.homingTurnDegreesPerWorldUnit) || 0);
    const volleyAngleJitterDegrees = deterministicRocketLaunchAngleJitterDegrees(
        state,
        volleyId,
        initialAngleJitterDegrees
    );
    for (let index = 0; index < projectileCount; index += 1) {
        const authoredAngleDegrees = Number(angles[index % angles.length]) || 0;
        const jitterDegrees = volleyAngleJitterDegrees;
        const angleDegrees = authoredAngleDegrees + jitterDegrees;
        const launchDir = rotateVector(baseDirection, angleDegrees * Math.PI / 180);
        const target = rocketProfile.homing && targets.length
            ? targets[rocketProfile.separateTargets ? index % targets.length : 0]
            : aimedTarget;
        const launchDelay = launchSequenceIntervalSeconds * index;
        const lateral = launchSequenceIntervalSeconds > 0 ? 0 : index - (projectileCount - 1) * 0.5;
        const perpendicular = { x: -baseDirection.y, y: baseDirection.x };
        const spawnX = launchOrigin.x + perpendicular.x * lateral * 7;
        const spawnY = launchOrigin.y + perpendicular.y * lateral * 7;
        const meanderInitialTimer = homingMeanderIntervalSeconds > 0 && homingMeanderTurnDegrees > 0
            ? homingMeanderIntervalSeconds * (0.35 + deterministicRocketLaunchUnit(
                state,
                volleyId,
                "rocket-homing-meander-delay",
                `projectile_${index}`
            ) * 0.5)
            : 0;
        const projectile = {
            id: `rocket_${String(weapons.nextProjectileId).padStart(3, "0")}`,
            volleyId,
            kind: rocketProfile.boomerang ? "boomerangRocket" : (rocketProfile.homing ? "homingRocket" : "dartRocket"),
            owner: "player",
            isRocket: true,
            state: launchDelay > 0 ? "queued" : "launched",
            activeSinceTick: launchDelay > 0 ? null : state.clock.tick,
            launchDelay,
            launchFromPlayerOnActivation: launchDelay > 0,
            ...createTransformTriplet({
                x: spawnX,
                y: spawnY,
                angle: Math.atan2(launchDir.y, launchDir.x),
                scaleX: Math.max(0.1, Number(rocketProfile.visualScale) || 1),
                scaleY: Math.max(0.1, Number(rocketProfile.visualScale) || 1)
            }),
            vx: launchDir.x * projectileSpeed,
            vy: launchDir.y * projectileSpeed,
            facing: p.facing,
            targetId: target ? target.id : null,
            homingTargetSearchTimer: target ? HOMING_TARGET_SEARCH_INTERVAL_SECONDS : 0,
            homing: Boolean(rocketProfile.homing),
            homingStrength: Math.max(0, t.rocketProjectileHomingStrength * (Number(rocketProfile.homingStrengthMultiplier) || 0)),
            initialHomingStrength: Math.max(0, t.rocketProjectileInitialHomingStrength * (Number(rocketProfile.homingStrengthMultiplier) || 0)),
            projectileSpeed,
            launchAngleJitterDegrees: jitterDegrees,
            volleyLaunchAngleJitterDegrees: volleyAngleJitterDegrees,
            homingMeanderIntervalSeconds,
            homingMeanderTurnDegrees,
            homingTurnDegreesPerWorldUnit,
            homingPreferForwardAlignment: Boolean(rocketProfile.homingPreferForwardAlignment),
            homingMeanderTimer: meanderInitialTimer,
            homingMeanderStep: 0,
            homingMeanderLastTurn: 0,
            upLaunchTimer: rocketProfile.launchMode === "up" ? Math.max(0, t.rocketProjectileUpLaunchSeconds ?? 0.32) : 0,
            age: 0,
            lifetime: Math.max(0.001, (wrenchEffectId
                ? t.rocketProjectileMaxTravelDistance
                : t.rocketProjectileUnwrenchedMaxTravelDistance) / Math.max(0.001, projectileSpeed)),
            explosionTimer: 0,
            radius: projectileRadius,
            wrenchEffectId,
            wrenchGlowTint,
            wrenchGlowFrameId,
            explosionVisualScale: Math.max(1, Number(rocketProfile.visualScale) || 1),
            damage: projectileDamage,
            areaDamageRadius,
            secondaryEnemySplashDamage: standardRocketSecondarySplashDamage,
            secondaryEnemySplashRadius: standardRocketSecondarySplashRadius,
            boomerang: Boolean(rocketProfile.boomerang),
            piercesEnemies: Boolean(rocketProfile.piercesEnemies),
            phasesThroughObstacles: Boolean(rocketProfile.phasesThroughObstacles),
            boomerangMode: rocketProfile.boomerang ? "outbound" : null,
            boomerangOutboundTimer: rocketProfile.boomerang
                ? Math.max(0, t.rocketProjectileUpLaunchSeconds ?? 0.32)
                : 0,
            boomerangReturnStartedAt: null,
            boomerangRefundFuel: rocketProfile.boomerang ? launchCost * 0.5 : 0,
            frameId: "rocket_projectile",
            characterId: "ct_char_wizard_1",
            trail: launchDelay > 0
                ? []
                : [{ x: spawnX, y: spawnY, time: state.clock.time }]
        };
        weapons.nextProjectileId += 1;
        state.projectiles.push(projectile);
        spawnedIds.push(projectile.id);
    }

    state.fuel.amount = clamp(state.fuel.amount - launchCost, 0, state.fuel.max);
    markRocketUse(state);
    addEvent(state, "ROCKET_LAUNCHED", {
        id: spawnedIds[0],
        projectileIds: spawnedIds,
        projectileCount,
        targetIds: state.projectiles
            .filter((projectile) => projectile.volleyId === volleyId)
            .map((projectile) => projectile.targetId || null),
        fuel: round(state.fuel.amount),
        fuelCost: round(launchCost),
        wrenchEffectId
    });
    return true;
}

function beginBoomerangReturn(state, projectile, reason) {
    if (!projectile?.boomerang || projectile.boomerangMode === "returning") return false;
    projectile.boomerangMode = "returning";
    projectile.boomerangReturnStartedAt = state.clock.time;
    projectile.targetId = null;
    projectile.upLaunchTimer = 0;
    projectile.boomerangOutboundTimer = 0;
    const target = {
        x: state.player.currentTransform.x,
        y: state.player.currentTransform.y - state.player.height * 0.55
    };
    const desired = normalizeVector({ x: target.x - projectile.currentTransform.x, y: target.y - projectile.currentTransform.y });
    const speed = Math.max(1, Number(projectile.projectileSpeed) || state.tuning.rocketProjectileSpeed);
    projectile.vx = desired.x * speed;
    projectile.vy = desired.y * speed;
    addEvent(state, "BOOMERANG_ROCKET_RETURNING", {
        id: projectile.id,
        reason,
        refundFuel: round(projectile.boomerangRefundFuel || 0)
    });
    return true;
}

function applyRocketHomingMeander(state, projectile, dt) {
    const interval = Math.max(0, Number(projectile.homingMeanderIntervalSeconds) || 0);
    const turnDegrees = Math.max(0, Number(projectile.homingMeanderTurnDegrees) || 0);
    if (interval <= 0 || turnDegrees <= 0 || dt <= 0) return;
    projectile.homingMeanderTimer = (Number(projectile.homingMeanderTimer) || 0) - dt;
    let guard = 0;
    while (projectile.homingMeanderTimer <= 0 && guard < 4) {
        const step = Math.max(0, Math.floor(Number(projectile.homingMeanderStep) || 0));
        const unit = deterministicRocketLaunchUnit(
            state,
            projectile.volleyId || projectile.id || "rocket",
            "rocket-homing-meander-turn",
            `${projectile.id || "projectile"}:${step}`
        );
        const direction = unit < 0.5 ? -1 : 1;
        const rotated = rotateVector(
            { x: Number(projectile.vx) || 0, y: Number(projectile.vy) || 0 },
            direction * turnDegrees * Math.PI / 180
        );
        projectile.vx = rotated.x;
        projectile.vy = rotated.y;
        projectile.homingMeanderLastTurn = direction;
        projectile.homingMeanderLastTurnDegrees = direction * turnDegrees;
        projectile.homingMeanderStep = step + 1;
        projectile.homingMeanderTimer += interval;
        guard += 1;
    }
}

function completeBoomerangReturn(state, projectile) {
    const before = state.fuel.amount;
    state.fuel.amount = clamp(
        state.fuel.amount + Math.max(0, Number(projectile.boomerangRefundFuel) || 0),
        0,
        state.fuel.max
    );
    projectile.state = "spent";
    addEvent(state, "BOOMERANG_ROCKET_CAUGHT", {
        id: projectile.id,
        refundedFuel: round(state.fuel.amount - before),
        fuel: round(state.fuel.amount)
    });
}

function applyStandardRocketSecondarySplash(state, projectile, excludedEnemyId = null) {
    const damage = Math.max(0, Number(projectile?.secondaryEnemySplashDamage) || 0);
    const radius = Math.max(0, Number(projectile?.secondaryEnemySplashRadius) || 0);
    if (damage <= 0 || radius <= 0) {
        return { enemyIds: [], damageEvents: 0 };
    }

    const enemyIds = [];
    const splashProjectile = { ...projectile, damage };
    for (const enemy of state.enemies || []) {
        if (!enemy || enemy.id === excludedEnemyId || enemy.health <= 0 || enemy.combatState === "dead") continue;
        if (!circleRectOverlap(projectile.currentTransform.x, projectile.currentTransform.y, radius, enemyProjectileHitbox(enemy))) continue;
        const result = applyProjectileDamageToEnemy(state, splashProjectile, enemy);
        if (result.damage <= 0) continue;
        enemyIds.push(enemy.id);
    }

    addEvent(state, "STANDARD_ROCKET_SECONDARY_SPLASH_APPLIED", {
        id: projectile.id,
        radius: round(radius),
        damage: round(damage),
        excludedEnemyId,
        enemyIds
    });
    return { enemyIds, damageEvents: enemyIds.length };
}

function applyPlayerProjectileAreaDamage(state, projectile) {
    const radius = Math.max(0, Number(projectile.areaDamageRadius) || 0);
    if (radius <= 0) return { enemyIds: [], objectIds: [], damageEvents: 0 };
    const enemyIds = [];
    const objectIds = [];
    for (const enemy of state.enemies || []) {
        if (!enemy || enemy.health <= 0 || enemy.combatState === "dead") continue;
        if (!circleRectOverlap(projectile.currentTransform.x, projectile.currentTransform.y, radius, enemyProjectileHitbox(enemy))) continue;
        applyProjectileDamageToEnemy(state, projectile, enemy);
        enemyIds.push(enemy.id);
    }
    for (const object of state.reactiveObjects || []) {
        if (!reactiveObjectBlocksProjectiles(object)) continue;
        if (!circleRectOverlap(projectile.currentTransform.x, projectile.currentTransform.y, radius, reactiveObjectCollisionRect(object))) continue;
        applyProjectileDamageToReactiveObject(state, projectile, object);
        objectIds.push(object.id);
    }
    addEvent(state, "ROCKET_AREA_DAMAGE_APPLIED", {
        id: projectile.id,
        radius: round(radius),
        enemyIds,
        objectIds
    });
    return { enemyIds, objectIds, damageEvents: enemyIds.length + objectIds.length };
}

function detonatePlayerProjectile(state, projectile, reason, detail = {}) {
    const area = applyPlayerProjectileAreaDamage(state, projectile);
    explodeProjectile(state, projectile, reason, {
        ...detail,
        areaDamageRadius: Math.max(0, Number(projectile.areaDamageRadius) || 0),
        areaEnemyIds: area.enemyIds,
        areaObjectIds: area.objectIds,
        areaHitCount: area.damageEvents
    });
}

function updateProjectiles(state, dt) {
    const t = state.tuning;
    let homingTargetSearchPerformed = false;

    for (const projectile of state.projectiles) {
        if (projectile.state === "queued") {
            projectile.launchDelay = Math.max(0, (Number(projectile.launchDelay) || 0) - dt);
            if (projectile.launchDelay > 0) continue;
            if (projectile.launchFromPlayerOnActivation) {
                projectile.currentTransform.x = state.player.currentTransform.x;
                projectile.currentTransform.y = state.player.currentTransform.y - state.player.height * 0.72;
            }
            projectile.state = "launched";
            projectile.activeSinceTick = state.clock.tick;
            projectile.launchFromPlayerOnActivation = false;
            projectile.age = 0;
            projectile.trail = [{ x: projectile.currentTransform.x, y: projectile.currentTransform.y, time: state.clock.time }];
            addEvent(state, "ROCKET_SEQUENCE_SHOT_LAUNCHED", {
                id: projectile.id,
                volleyId: projectile.volleyId || null,
                wrenchEffectId: projectile.wrenchEffectId || null
            });
        }

        projectile.age += dt;
        if (projectile.state === "exploding") {
            if (projectile.visualStyle === "undeath") {
                pruneEnemyFireballTrail(state, projectile);
            }
            projectile.explosionTimer -= dt;
            if (projectile.explosionTimer <= 0) {
                projectile.state = projectile.visualStyle === "undeath" && projectile.trail?.length
                    ? "trailFading"
                    : "spent";
            }
            continue;
        }

        if (projectile.state === "trailFading") {
            pruneEnemyFireballTrail(state, projectile);
            if (!projectile.trail?.length) {
                projectile.state = "spent";
            }
            continue;
        }

        if (projectile.state !== "launched") {
            continue;
        }

        if (projectile.isRocket) {
            projectile.upLaunchTimer = Math.max(0, (projectile.upLaunchTimer ?? 0) - dt);
            projectile.boomerangOutboundTimer = Math.max(0, (projectile.boomerangOutboundTimer ?? 0) - dt);
            if (projectile.boomerangMode === "returning") {
                const returnTarget = {
                    x: state.player.currentTransform.x,
                    y: state.player.currentTransform.y - state.player.height * 0.55
                };
                const desired = normalizeVector({ x: returnTarget.x - projectile.currentTransform.x, y: returnTarget.y - projectile.currentTransform.y });
                const speed = Math.max(1, Number(projectile.projectileSpeed) || t.rocketProjectileSpeed);
                const desiredVx = desired.x * speed;
                const desiredVy = desired.y * speed;
                const blend = clamp(Math.max(7.2, Number(projectile.homingStrength) || 0) * 1.5 * dt, 0, 1);
                projectile.vx += (desiredVx - projectile.vx) * blend;
                projectile.vy += (desiredVy - projectile.vy) * blend;
                const nextSpeed = Math.hypot(projectile.vx, projectile.vy) || 1;
                projectile.vx = projectile.vx / nextSpeed * speed;
                projectile.vy = projectile.vy / nextSpeed * speed;
            } else if (projectile.homing) {
                const originX = Number(projectile.currentTransform.x) || 0;
                const originY = Number(projectile.currentTransform.y) || 0;
                let target = findTargetById(state, projectile.targetId, originX, originY);
                if (target && projectile.homingPreferForwardAlignment) {
                    const targetDx = Number(target.x) - originX;
                    const targetDy = Number(target.y) - originY;
                    const headingDot = targetDx * (Number(projectile.vx) || 0) + targetDy * (Number(projectile.vy) || 0);
                    if (headingDot < -0.000001) {
                        target = null;
                        projectile.targetId = null;
                        projectile.homingTargetSearchTimer = 0;
                    }
                }
                if (!target && projectile.targetId) {
                    projectile.targetId = null;
                    projectile.homingTargetSearchTimer = 0;
                }
                if (!target && projectile.boomerang && projectile.boomerangOutboundTimer <= 0) {
                    beginBoomerangReturn(state, projectile, "targetUnavailable");
                } else {
                    projectile.homingTargetSearchTimer = Math.max(0, (Number(projectile.homingTargetSearchTimer) || 0) - dt);
                    if (!target && projectile.homingTargetSearchTimer <= 0 && !homingTargetSearchPerformed) {
                        homingTargetSearchPerformed = true;
                        target = projectile.homingPreferForwardAlignment
                            ? findHeadingHomingTarget(state, originX, originY, projectile.vx, projectile.vy)
                            : findHomingTarget(state, originX, originY, projectile.facing < 0 ? -1 : 1);
                        projectile.homingTargetSearchTimer = HOMING_TARGET_SEARCH_INTERVAL_SECONDS;
                    }
                    if (target) {
                        projectile.targetId = target.id;
                        applyRocketHomingMeander(state, projectile, dt);
                        const desired = normalizeVector({ x: target.x - projectile.currentTransform.x, y: target.y - projectile.currentTransform.y });
                        const speed = Math.max(1, Number(projectile.projectileSpeed) || t.rocketProjectileSpeed);
                        const homingTurnDegreesPerWorldUnit = Math.max(0, Number(projectile.homingTurnDegreesPerWorldUnit) || 0);
                        if (homingTurnDegreesPerWorldUnit > 0) {
                            const travelSpeed = Math.hypot(Number(projectile.vx) || 0, Number(projectile.vy) || 0);
                            const maxTurnRadians = homingTurnDegreesPerWorldUnit * travelSpeed * dt * Math.PI / 180;
                            rotateVelocityToward(projectile, desired, speed, maxTurnRadians);
                        } else {
                            const desiredVx = desired.x * speed;
                            const desiredVy = desired.y * speed;
                            const normalHomingStrength = Number(projectile.homingStrength) || t.rocketProjectileHomingStrength;
                            const initialHomingStrength = Number(projectile.initialHomingStrength) || t.rocketProjectileInitialHomingStrength || normalHomingStrength;
                            const homingStrength = projectile.upLaunchTimer > 0
                                ? Math.max(normalHomingStrength, initialHomingStrength)
                                : normalHomingStrength;
                            const blend = clamp(homingStrength * dt, 0, 1);
                            projectile.vx += (desiredVx - projectile.vx) * blend;
                            projectile.vy += (desiredVy - projectile.vy) * blend;
                            const nextSpeed = Math.hypot(projectile.vx, projectile.vy) || 1;
                            projectile.vx = projectile.vx / nextSpeed * speed;
                            projectile.vy = projectile.vy / nextSpeed * speed;
                        }
                    }
                }
            }
        } else if (projectile.owner === "enemy" && (Number(projectile.homingStrength) || 0) > 0) {
            const playerTarget = state.player.visible === false ? null : { x: state.player.currentTransform.x, y: state.player.currentTransform.y - state.player.height * 0.56 };
            if (playerTarget) {
                const speed = Math.hypot(projectile.vx, projectile.vy) || Math.max(1, Number(projectile.projectileSpeed) || 1);
                const desired = projectile.launchType === "pathing_lo" || projectile.launchType === "pathing_hi"
                    ? pathingProjectileDesiredDirection(state, projectile, playerTarget)
                    : normalizeVector({ x: playerTarget.x - projectile.currentTransform.x, y: playerTarget.y - projectile.currentTransform.y });
                const desiredVx = desired.x * speed;
                const desiredVy = desired.y * speed;
                const blend = clamp((Number(projectile.homingStrength) || 0) * dt, 0, 1);
                projectile.vx += (desiredVx - projectile.vx) * blend;
                projectile.vy += (desiredVy - projectile.vy) * blend;
                const nextSpeed = Math.hypot(projectile.vx, projectile.vy) || 1;
                projectile.vx = projectile.vx / nextSpeed * speed;
                projectile.vy = projectile.vy / nextSpeed * speed;
            }
        }

        if (!projectile.isRocket) {
            projectile.vy += (Number(projectile.gravity) || 0) * dt;
        }

        if (Math.hypot(Number(projectile.vx) || 0, Number(projectile.vy) || 0) > 0.000001) {
            projectile.currentTransform.angle = Math.atan2(Number(projectile.vy) || 0, Number(projectile.vx) || 0);
        }
        const previousX = projectile.currentTransform.x;
        const previousY = projectile.currentTransform.y;
        projectile.currentTransform.x += projectile.vx * dt;
        projectile.currentTransform.y += projectile.vy * dt;

        if (projectile.isRocket) {
            recordProjectileTrail(state, projectile);
        } else if (projectile.owner === "enemy" && projectile.trailEffect !== "none") {
            if (projectile.trailEffect === "undeath" || projectile.trailEffect === "fire") {
                if (projectile.trailEffect === "undeath" || state.settings?.renderingQuality !== "low") {
                    recordEnemyFireballTrail(state, projectile);
                } else if (Array.isArray(projectile.trail) && projectile.trail.length) {
                    projectile.trail.length = 0;
                }
            } else if (projectile.trailEffect === "sparks") {
                recordEnemySparkTrail(state, projectile);
            }
        }

        if (projectile.boomerangMode === "returning") {
            const start = { x: previousX, y: previousY };
            const end = { x: projectile.currentTransform.x, y: projectile.currentTransform.y };
            const radius = Math.max(0, Number(projectile.radius) || 0);
            const catchImpact = sweptCircleRectImpact(start, end, radius, getPlayerRect(state));
            const enemyImpact = findProjectileEnemyImpact(state, projectile, previousX, previousY);
            const reactiveImpact = projectile.phasesThroughObstacles
                ? null
                : findProjectileReactiveObjectImpact(state, projectile, previousX, previousY);
            const terrainImpact = projectile.phasesThroughObstacles
                ? null
                : findProjectileTerrainImpact(state, projectile, previousX, previousY, { includeMovingPlatformSweep: true });
            const impacts = [
                catchImpact ? { ...catchImpact, impactKind: "playerCatch", priority: 0 } : null,
                enemyImpact ? { ...enemyImpact, impactKind: "enemy", priority: 1 } : null,
                reactiveImpact ? { ...reactiveImpact, impactKind: "reactiveObject", priority: 2 } : null,
                terrainImpact ? { ...terrainImpact, impactKind: "terrain", priority: 3 } : null
            ].filter(Boolean).sort((a, b) => (a.t - b.t) || (a.priority - b.priority));
            const impact = impacts[0] || null;

            if (impact?.impactKind === "playerCatch") {
                projectile.currentTransform.x = impact.x;
                projectile.currentTransform.y = impact.y;
                completeBoomerangReturn(state, projectile);
            } else if (impact?.impactKind === "enemy") {
                projectile.currentTransform.x = impact.x;
                projectile.currentTransform.y = impact.y;
                const damageResult = applyProjectileDamageToEnemy(state, projectile, impact.enemy);
                explodeProjectile(state, projectile, impact.enemy.id, {
                    impactKind: "enemy",
                    enemyId: impact.enemy.id,
                    damage: damageResult.damage,
                    health: damageResult.health,
                    defeated: damageResult.defeated,
                    boomerangReturning: true
                });
            } else if (impact?.impactKind === "reactiveObject") {
                projectile.currentTransform.x = impact.x;
                projectile.currentTransform.y = impact.y;
                const damageResult = applyProjectileDamageToReactiveObject(state, projectile, impact.object);
                explodeProjectile(state, projectile, impact.object.id, {
                    impactKind: "reactiveObject",
                    objectId: impact.object.id,
                    damage: damageResult.damage,
                    health: damageResult.health,
                    state: damageResult.state,
                    destroyed: damageResult.destroyed,
                    boomerangReturning: true
                });
            } else if (impact?.impactKind === "terrain") {
                projectile.currentTransform.x = impact.x;
                projectile.currentTransform.y = impact.y;
                explodeProjectile(state, projectile, impact.id, {
                    impactKind: "terrain",
                    boomerangReturning: true
                });
            } else if (state.clock.time - (Number(projectile.boomerangReturnStartedAt) || state.clock.time) >= 4) {
                projectile.state = "spent";
                addEvent(state, "BOOMERANG_ROCKET_RETURN_FAILED", { id: projectile.id });
            }
            continue;
        }

        if (projectile.owner === "enemy") {
            const explosiveAreaProjectile = Math.max(0, Number(projectile.areaDamageRadius) || 0) > 0;
            const playerImpact = findProjectilePlayerImpact(state, projectile, previousX, previousY);
            const reactiveImpact = findProjectileReactiveObjectImpact(state, projectile, previousX, previousY);
            const terrainImpact = findProjectileTerrainImpact(state, projectile, previousX, previousY, { includeMovingPlatformSweep: true });
            const impacts = [
                playerImpact ? { ...playerImpact, impactKind: "player", priority: 0 } : null,
                reactiveImpact ? { ...reactiveImpact, impactKind: "reactiveObject", priority: 1 } : null,
                terrainImpact ? { ...terrainImpact, impactKind: "terrain", priority: 2 } : null
            ].filter(Boolean).sort((a, b) => (a.t - b.t) || (a.priority - b.priority));
            const impact = impacts[0] || null;
            if (impact?.impactKind === "player") {
                projectile.currentTransform.x = impact.x;
                projectile.currentTransform.y = impact.y;
                if (explosiveAreaProjectile) {
                    detonateEnemyProjectile(state, projectile, state.player.id || "player", {
                        impactKind: "player"
                    });
                    continue;
                }
                const damageResult = applyProjectileDamageToPlayer(state, projectile);
                explodeProjectile(state, projectile, state.player.id || "player", {
                    impactKind: "player",
                    damage: damageResult.damage,
                    health: damageResult.health,
                    defeated: damageResult.defeated,
                    blocked: damageResult.blocked
                });
                continue;
            }
            if (impact?.impactKind === "reactiveObject") {
                projectile.currentTransform.x = impact.x;
                projectile.currentTransform.y = impact.y;
                if (explosiveAreaProjectile) {
                    detonateEnemyProjectile(state, projectile, impact.object.id, {
                        impactKind: "reactiveObject",
                        objectId: impact.object.id
                    });
                    continue;
                }
                const damageResult = applyProjectileDamageToReactiveObject(state, projectile, impact.object);
                explodeProjectile(state, projectile, impact.object.id, {
                    impactKind: "reactiveObject",
                    objectId: impact.object.id,
                    damage: damageResult.damage,
                    health: damageResult.health,
                    state: damageResult.state,
                    destroyed: damageResult.destroyed
                });
                continue;
            }
            if (impact?.impactKind === "terrain") {
                projectile.currentTransform.x = impact.x;
                projectile.currentTransform.y = impact.y;
                if (explosiveAreaProjectile) {
                    detonateEnemyProjectile(state, projectile, impact.id, { impactKind: "terrain" });
                } else {
                    explodeProjectile(state, projectile, impact.id, { impactKind: "terrain" });
                }
                continue;
            }
            if (projectile.age >= projectile.lifetime) {
                explodeProjectile(state, projectile, "lifetime");
            }
            continue;
        }

        const enemyImpact = findProjectileEnemyImpact(state, projectile, previousX, previousY);
        const reactiveImpact = projectile.phasesThroughObstacles
            ? null
            : findProjectileReactiveObjectImpact(state, projectile, previousX, previousY);
        const terrainImpact = projectile.phasesThroughObstacles
            ? null
            : findProjectileTerrainImpact(state, projectile, previousX, previousY, { includeMovingPlatformSweep: true });
        const impacts = [
            enemyImpact ? { ...enemyImpact, impactKind: "enemy", priority: 0 } : null,
            reactiveImpact ? { ...reactiveImpact, impactKind: "reactiveObject", priority: 1 } : null,
            terrainImpact ? { ...terrainImpact, impactKind: "terrain", priority: 2 } : null
        ].filter(Boolean).sort((a, b) => (a.t - b.t) || (a.priority - b.priority));
        const impact = impacts[0] || null;
        if (impact?.impactKind === "enemy") {
            projectile.currentTransform.x = impact.x;
            projectile.currentTransform.y = impact.y;
            if (projectile.areaDamageRadius > 0) {
                detonatePlayerProjectile(state, projectile, impact.enemy.id, {
                    impactKind: "enemy",
                    enemyId: impact.enemy.id
                });
            } else {
                const damageResult = applyProjectileDamageToEnemy(state, projectile, impact.enemy);
                const secondarySplash = applyStandardRocketSecondarySplash(state, projectile, impact.enemy.id);
                if (projectile.boomerang && damageResult.defeated) {
                    emitProjectileImpactSmoke(state, projectile, { impactKind: "enemy" });
                    addEvent(state, "BOOMERANG_ROCKET_TARGET_DESTROYED", {
                        id: projectile.id,
                        enemyId: impact.enemy.id,
                        damage: damageResult.damage
                    });
                    beginBoomerangReturn(state, projectile, "targetDestroyed");
                } else {
                    explodeProjectile(state, projectile, impact.enemy.id, {
                        impactKind: "enemy",
                        enemyId: impact.enemy.id,
                        damage: damageResult.damage,
                        health: damageResult.health,
                        defeated: damageResult.defeated,
                        secondarySplashEnemyIds: secondarySplash.enemyIds
                    });
                }
            }
            continue;
        }
        if (impact?.impactKind === "reactiveObject") {
            projectile.currentTransform.x = impact.x;
            projectile.currentTransform.y = impact.y;
            if (projectile.areaDamageRadius > 0) {
                detonatePlayerProjectile(state, projectile, impact.object.id, {
                    impactKind: "reactiveObject",
                    objectId: impact.object.id
                });
            } else {
                const damageResult = applyProjectileDamageToReactiveObject(state, projectile, impact.object);
                const secondarySplash = applyStandardRocketSecondarySplash(state, projectile);
                if (projectile.boomerang && damageResult.destroyed) {
                    emitProjectileImpactSmoke(state, projectile, { impactKind: "reactiveObject" });
                    beginBoomerangReturn(state, projectile, "objectDestroyed");
                } else {
                    explodeProjectile(state, projectile, impact.object.id, {
                        impactKind: "reactiveObject",
                        objectId: impact.object.id,
                        damage: damageResult.damage,
                        health: damageResult.health,
                        state: damageResult.state,
                        destroyed: damageResult.destroyed,
                        secondarySplashEnemyIds: secondarySplash.enemyIds
                    });
                }
            }
            continue;
        }
        if (impact?.impactKind === "terrain") {
            projectile.currentTransform.x = impact.x;
            projectile.currentTransform.y = impact.y;
            if (projectile.areaDamageRadius > 0) {
                detonatePlayerProjectile(state, projectile, impact.id, { impactKind: "terrain" });
            } else {
                const secondarySplash = applyStandardRocketSecondarySplash(state, projectile);
                explodeProjectile(state, projectile, impact.id, {
                    impactKind: "terrain",
                    secondarySplashEnemyIds: secondarySplash.enemyIds
                });
            }
            continue;
        }

        if (projectile.age >= projectile.lifetime) {
            if (projectile.boomerang) {
                beginBoomerangReturn(state, projectile, "lifetimeMiss");
            } else if (projectileBeyondLifetimeExplosionMargin(state, projectile)) {
                projectile.state = "spent";
                addEvent(state, "ROCKET_LIFETIME_CULLED", {
                    id: projectile.id,
                    x: round(projectile.currentTransform.x),
                    y: round(projectile.currentTransform.y)
                });
            } else if (projectile.areaDamageRadius > 0) {
                detonatePlayerProjectile(state, projectile, "lifetime");
            } else {
                explodeProjectile(state, projectile, "lifetime");
            }
        }
    }

    state.projectiles = state.projectiles.filter((projectile) => projectile.state !== "spent");
}

function recordProjectileTrail(state, projectile) {
    if (!Array.isArray(projectile.trail)) {
        projectile.trail = [];
    }

    const previous = projectile.trail[projectile.trail.length - 1];
    const spacing = 12;
    if (!previous || Math.hypot(projectile.currentTransform.x - previous.x, projectile.currentTransform.y - previous.y) >= spacing) {
        projectile.trail.push({
            x: round(projectile.currentTransform.x),
            y: round(projectile.currentTransform.y),
            time: Number(state.clock.time.toFixed(4))
        });
    }

    const particleScale = renderingParticleScale(state.settings);
    const puffSpacing = Math.max(1, (state.tuning.rocketSmokePuffSpacing ?? 16) / particleScale);
    const previousPuff = projectile.lastSmokePuff || null;
    if (!previousPuff || Math.hypot(projectile.currentTransform.x - previousPuff.x, projectile.currentTransform.y - previousPuff.y) >= puffSpacing) {
        addRocketSmokePuff(state, projectile);
        projectile.lastSmokePuff = { x: projectile.currentTransform.x, y: projectile.currentTransform.y };
    }

    const maxTrailAge = 0.42 * rocketTrailDurationScale(state, projectile);
    const cutoff = state.clock.time - maxTrailAge;
    while (projectile.trail.length > 2 && projectile.trail[0].time < cutoff) {
        projectile.trail.shift();
    }
    while (projectile.trail.length > 24) {
        projectile.trail.shift();
    }
}

function rocketTrailDurationScale(state, projectile) {
    const standardSpeed = Math.max(1, Number(state.tuning?.rocketProjectileSpeed) || 1);
    const projectileSpeed = Math.max(
        1,
        Number(projectile.projectileSpeed) || Math.hypot(Number(projectile.vx) || 0, Number(projectile.vy) || 0) || standardSpeed
    );
    return clamp(standardSpeed / projectileSpeed, 0.25, 2.5);
}

function recordEnemySparkTrail(state, projectile) {
    const previous = projectile.lastSparkTrailPoint || null;
    const x = Number(projectile.currentTransform.x) || 0;
    const y = Number(projectile.currentTransform.y) || 0;
    if (previous && Math.hypot(x - previous.x, y - previous.y) < 9) return;
    projectile.lastSparkTrailPoint = { x, y };
    const speed = Math.hypot(Number(projectile.vx) || 0, Number(projectile.vy) || 0) || 1;
    const tailX = -(Number(projectile.vx) || 0) / speed;
    const tailY = -(Number(projectile.vy) || 0) / speed;
    addSmokePuff(state, {
        kind: "enemyProjectileImpactPuff",
        x: x + tailX * Math.max(2, Number(projectile.radius) || 4),
        y: y + tailY * Math.max(2, Number(projectile.radius) || 4),
        vx: tailX * 18,
        vy: tailY * 18 - 8,
        lifetime: 0.16,
        radius: Math.max(1.5, Math.min(4, (Number(projectile.radius) || 4) * 0.35))
    });
}

const UNDEATH_TRAIL_EMIT_COUNT = 3;
const UNDEATH_TRAIL_DENSITY_SCALE = 0.9375;
const UNDEATH_TRAIL_LOW_QUALITY_DENSITY_SCALE = 0.75;
const UNDEATH_TRAIL_LIFETIME_SCALE = 2;
const UNDEATH_TRAIL_RADIUS_SCALE = 2;
const UNDEATH_TRAIL_SIZE_VARIATION = 0.25;
const UNDEATH_TRAIL_WIDTH_SCALE = 0.6;
const UNDEATH_TRAIL_MAX_PARTICLES = 158;

function recordEnemyFireballTrail(state, projectile) {
    if (!Array.isArray(projectile.trail)) {
        projectile.trail = [];
    }
    const speed = Math.hypot(projectile.vx || 0, projectile.vy || 0) || 1;
    const tailX = -(projectile.vx || 0) / speed;
    const tailY = -(projectile.vy || 0) / speed;
    const lateralX = -tailY;
    const lateralY = tailX;
    const radius = Math.max(2, Number(projectile.radius) || 10);
    const undeath = projectile.visualStyle === "undeath";
    let emitCount = 3;
    if (undeath) {
        const qualityDensityScale = state.settings?.renderingQuality === "low"
            ? UNDEATH_TRAIL_LOW_QUALITY_DENSITY_SCALE
            : 1;
        const exactEmitCount = UNDEATH_TRAIL_EMIT_COUNT * UNDEATH_TRAIL_DENSITY_SCALE * qualityDensityScale;
        const accumulatedEmitCount = Math.max(0, Number(projectile.undeathTrailEmissionRemainder) || 0) + exactEmitCount;
        emitCount = Math.floor(accumulatedEmitCount);
        projectile.undeathTrailEmissionRemainder = accumulatedEmitCount - emitCount;
    }
    const idSeed = String(projectile.id || projectile.enemyId || "enemy_fireball")
        .split("")
        .reduce((acc, ch, index) => (acc + ch.charCodeAt(0) * (index + 17)) % 1000003, 0);

    for (let i = 0; i < emitCount; i += 1) {
        const seed = idSeed + state.clock.tick * 101 + i * 977;
        const lateralNoise = hash01(seed + 13) * 2 - 1;
        const backwardNoise = hash01(seed + 29);
        const heat = hash01(seed + 47);
        const spawnBack = radius * (0.18 + backwardNoise * 0.4);
        const spawnSide = lateralNoise * radius * (0.12 + heat * 0.48);
        if (undeath) {
            const orbitAngle = hash01(seed + 19) * Math.PI * 2;
            const orbitDistance = radius * (0.18 + hash01(seed + 37) * 0.82) * UNDEATH_TRAIL_WIDTH_SCALE;
            const outwardSpeed = (5 + hash01(seed + 61) * 13) * UNDEATH_TRAIL_WIDTH_SCALE;
            const driftJitter = 4 * UNDEATH_TRAIL_WIDTH_SCALE;
            const orbitX = Math.cos(orbitAngle);
            const orbitY = Math.sin(orbitAngle);
            const sizeVariation = 1 - UNDEATH_TRAIL_SIZE_VARIATION + hash01(seed + 239) * UNDEATH_TRAIL_SIZE_VARIATION * 2;
            projectile.trail.push({
                x: round(projectile.currentTransform.x + orbitX * orbitDistance),
                y: round(projectile.currentTransform.y + orbitY * orbitDistance),
                vx: round(orbitX * outwardSpeed + (hash01(seed + 79) * 2 - 1) * driftJitter),
                vy: round(orbitY * outwardSpeed + (hash01(seed + 97) * 2 - 1) * driftJitter),
                birth: Number(state.clock.time.toFixed(4)),
                lifetime: Number(((0.22 + heat * 0.18 + hash01(seed + 173) * 0.08) * UNDEATH_TRAIL_LIFETIME_SCALE).toFixed(4)),
                radius: Number(((radius * (0.11 + heat * 0.09) + hash01(seed + 211) * 0.45) * UNDEATH_TRAIL_RADIUS_SCALE * sizeVariation).toFixed(3)),
                bubble: true,
                hue: Number((0.45 + heat * 0.35).toFixed(4))
            });
            continue;
        }
        const colorBand = heat > 0.82 ? "yellow" : heat > 0.4 ? "orange" : "red";
        projectile.trail.push({
            x: round(projectile.currentTransform.x + tailX * spawnBack + lateralX * spawnSide),
            y: round(projectile.currentTransform.y + tailY * spawnBack + lateralY * spawnSide),
            vx: round(tailX * (18 + hash01(seed + 61) * 36) + lateralX * lateralNoise * (8 + hash01(seed + 79) * 20)),
            vy: round(tailY * (18 + hash01(seed + 97) * 36) + lateralY * lateralNoise * (8 + hash01(seed + 131) * 20)),
            birth: Number(state.clock.time.toFixed(4)),
            lifetime: Number((0.14 + heat * 0.18 + hash01(seed + 173) * 0.06).toFixed(4)),
            radius: Number(Math.min(
                radius * 0.18,
                radius * (0.055 + heat * 0.085) + hash01(seed + 211) * 0.35
            ).toFixed(3)),
            heat: Number(heat.toFixed(4)),
            colorBand
        });
    }

    pruneEnemyFireballTrail(state, projectile);
}

function pruneEnemyFireballTrail(state, projectile) {
    if (!Array.isArray(projectile.trail)) {
        projectile.trail = [];
        return;
    }
    const undeath = projectile.visualStyle === "undeath";
    const cutoff = state.clock.time - (undeath ? 1.12 : 0.42);
    while (projectile.trail.length > 0) {
        const particle = projectile.trail[0];
        const birth = Number(particle.birth);
        const lifetime = Number(particle.lifetime);
        if (!Number.isFinite(birth) || !Number.isFinite(lifetime)) {
            projectile.trail.shift();
            continue;
        }
        const age = state.clock.time - birth;
        if (birth >= cutoff && age <= lifetime) {
            break;
        }
        projectile.trail.shift();
    }
    while (projectile.trail.length > (undeath ? UNDEATH_TRAIL_MAX_PARTICLES : 48)) {
        projectile.trail.shift();
    }
}

function addRocketSmokePuff(state, projectile) {
    if (!state.effects) {
        state.effects = { nextPuffId: 1, smokePuffs: [] };
    }
    if (!Array.isArray(state.effects.smokePuffs)) {
        state.effects.smokePuffs = [];
    }

    const speed = Math.hypot(projectile.vx, projectile.vy) || 1;
    const durationScale = rocketTrailDurationScale(state, projectile);
    const tailX = -projectile.vx / speed;
    const tailY = -projectile.vy / speed;
    const seed = Math.floor((projectile.currentTransform.x * 17 + projectile.currentTransform.y * 31 + state.clock.tick * 7) % 100000);
    const id = state.effects.nextPuffId || 1;
    state.effects.nextPuffId = id + 1;
    state.effects.smokePuffs.push({
        id: `smoke_${String(id).padStart(4, "0")}`,
        kind: "rocketSmokePuff",
        x: round(projectile.currentTransform.x + tailX * projectile.radius * 0.85),
        y: round(projectile.currentTransform.y + tailY * projectile.radius * 0.85),
        vx: round(tailX * 8),
        vy: round(tailY * 8 - 10),
        age: 0,
        lifetime: Math.max(0.14, (state.tuning.rocketSmokePuffLifetime ?? 1.5) * 0.23 * durationScale),
        radius: (7 + (seed % 6)) * Math.max(0.6, (state.tuning.rocketSmokePuffScale ?? 1.5) * 0.72),
        sparkleSeed: seed,
        trailTint: String(projectile.wrenchGlowTint || "").trim() || null
    });

    while (state.effects.smokePuffs.length > (state.tuning.rocketSmokeMaxPuffs ?? 180)) {
        state.effects.smokePuffs.shift();
    }
}


function addSmokePuff(state, spec) {
    if (!state.effects) {
        state.effects = { nextPuffId: 1, smokePuffs: [] };
    }
    if (!Array.isArray(state.effects.smokePuffs)) {
        state.effects.smokePuffs = [];
    }

    const id = state.effects.nextPuffId || 1;
    state.effects.nextPuffId = id + 1;
    const seed = Math.floor(((spec.x || 0) * 17 + (spec.y || 0) * 31 + state.clock.tick * 7 + id * 13) % 100000);
    state.effects.smokePuffs.push({
        id: `smoke_${String(id).padStart(4, "0")}`,
        kind: spec.kind || "rocketSmokePuff",
        x: round(spec.x || 0),
        y: round(spec.y || 0),
        vx: round(spec.vx || 0),
        vy: round(spec.vy || 0),
        age: 0,
        lifetime: spec.lifetime ?? state.tuning.rocketSmokePuffLifetime ?? 1.5,
        radius: ["wizardDeathCoverSpark", "wizardDeathBurstParticle", "wizardCrushParticle", "enemyProjectileImpactPuff", "enemyTeleportFlash", "enemyTeleportSpark"].includes(spec.kind)
            ? (spec.radius ?? 4)
            : (spec.radius ?? 12) * (state.tuning.rocketSmokePuffScale ?? 1.5),
        sparkleSeed: spec.sparkleSeed ?? seed,
        gravity: Number(spec.gravity) || 0,
        colorIndex: Math.max(0, Math.round(Number(spec.colorIndex) || 0)),
        rotation: Number(spec.rotation) || 0,
        spin: Number(spec.spin) || 0,
        delay: Math.max(0, Number(spec.delay) || 0),
        impactWizardAccent: spec.impactWizardAccent === true
    });

    while (state.effects.smokePuffs.length > (state.tuning.rocketSmokeMaxPuffs ?? 180)) {
        state.effects.smokePuffs.shift();
    }
}

function attachedRocketNozzlePoint(state) {
    const p = state.player;
    const nozzleBackOffset = 18.5;
    const nozzleHeightRatio = 0.30;
    const nozzleDownCorrection = -2;
    return {
        x: p.currentTransform.x - p.facing * nozzleBackOffset,
        y: p.currentTransform.y - p.height * nozzleHeightRatio + nozzleDownCorrection
    };
}


function playerLungeRocketNozzlePoint(state) {
    const p = state.player;
    const direction = p.lungeActive ? p.lungeDirection : (p.facing >= 0 ? 1 : -1);
    return {
        x: p.currentTransform.x - direction * 36,
        y: p.currentTransform.y - Math.min(state.tuning.playerHeight, 104) * 0.56
    };
}

function playerLungeChargeSmokeDensity(state) {
    const chargeSeconds = Math.max(0.000001, Number(state.tuning.playerLungeChargeSeconds) || 0.5);
    return clamp((Number(state.player.lungeChargeTime) || 0) / chargeSeconds, 0, 1);
}

function emitPlayerLungeSmoke(state, dt, densityMultiplier = 1) {
    const rocket = state.equipment.rocket;
    const particleScale = renderingParticleScale(state.settings);
    const interval = Math.max(0.015, (state.tuning.attachedBoostSmokePuffInterval ?? 0.065) / particleScale);
    const density = Math.max(0, Number(densityMultiplier) || 0);
    rocket.attachedSmokeTimer = Math.max(0, Number(rocket.attachedSmokeTimer) || 0) + Math.max(0, dt) * density;
    let safety = 0;
    while (rocket.attachedSmokeTimer + 1e-12 >= interval && safety < 32) {
        emitPlayerLungeSmokeBurst(state, 1);
        rocket.attachedSmokeTimer -= interval;
        safety += 1;
    }
}

function emitPlayerLungeSmokeBurst(state, count) {
    const p = state.player;
    const direction = p.lungeActive ? p.lungeDirection : (p.facing >= 0 ? 1 : -1);
    const nozzle = playerLungeRocketNozzlePoint(state);
    const particleScale = renderingParticleScale(state.settings);
    const authoredCount = Math.max(0, Number(count) || 0);
    const total = authoredCount <= 1 ? Math.floor(authoredCount) : Math.max(1, Math.round(authoredCount * particleScale));
    for (let i = 0; i < total; i += 1) {
        const wobble = ((state.clock.tick * 37 + i * 53) % 100) / 100 - 0.5;
        const spread = ((state.clock.tick * 19 + i * 29) % 100) / 100 - 0.5;
        addSmokePuff(state, {
            kind: "attachedRocketSmokePuff",
            x: nozzle.x - direction * i * 2,
            y: nozzle.y + spread * 10,
            vx: -direction * (520 + Math.abs(wobble) * 180) + p.vx * 0.08,
            vy: spread * 100,
            lifetime: 1.75,
            radius: 12 + (i % 3) * 2
        });
    }
}

function emitAttachedBoostSmoke(state, dt) {
    const rocket = state.equipment.rocket;
    const particleScale = renderingParticleScale(state.settings);
    const interval = Math.max(0.015, (state.tuning.attachedBoostSmokePuffInterval ?? 0.065) / particleScale);
    rocket.attachedSmokeTimer = (rocket.attachedSmokeTimer ?? 0) - dt;
    while (rocket.attachedSmokeTimer <= 0) {
        emitAttachedBoostSmokeBurst(state, 1);
        rocket.attachedSmokeTimer += interval;
    }
}

function emitAttachedBoostSmokeBurst(state, count) {
    const rocket = state.equipment.rocket;
    const p = state.player;
    const t = state.tuning;
    const nozzle = attachedRocketNozzlePoint(state);
    const power = clamp(rocket.boostVisualPowerNow || attachedBoostVisualPower(state), 0.18, 1.25);
    const particleScale = renderingParticleScale(state.settings);
    const authoredCount = Math.max(0, Number(count) || 0);
    const total = authoredCount <= 1
        ? Math.floor(authoredCount)
        : Math.max(1, Math.round(authoredCount * particleScale));
    const downSpeed = Math.max(0, t.attachedBoostSmokePuffDownSpeed ?? 170);
    const sideSpeed = Math.max(0, t.attachedBoostSmokePuffSideSpeed ?? 42);
    const speedJitter = Math.max(0, t.attachedBoostSmokePuffSpeedJitter ?? 36);

    for (let i = 0; i < total; i += 1) {
        const wobble = ((state.clock.tick * 37 + i * 53) % 100) / 100 - 0.5;
        const spread = ((state.clock.tick * 19 + i * 29) % 100) / 100 - 0.5;
        addSmokePuff(state, {
            kind: "attachedRocketSmokePuff",
            x: nozzle.x + spread * 9,
            y: nozzle.y + i * 2,
            vx: p.vx * 0.10 + spread * sideSpeed - p.facing * 8,
            vy: downSpeed * (0.45 + power * 0.55) + wobble * speedJitter,
            lifetime: 1.6 + power * 0.65,
            radius: 8 + power * 9 + (i % 3) * 1.5
        });
    }
}

function updateWorldEffects(state, dt) {
    if (!state.effects || !Array.isArray(state.effects.smokePuffs)) {
        return;
    }
    for (const puff of state.effects.smokePuffs) {
        puff.age += dt;
        puff.vy = (puff.vy || 0) + (Number(puff.gravity) || 0) * dt;
        puff.x += (puff.vx || 0) * dt;
        puff.y += (puff.vy || 0) * dt;
        puff.rotation = (Number(puff.rotation) || 0) + (Number(puff.spin) || 0) * dt;
        puff.vx *= Math.max(0, 1 - 0.45 * dt);
        puff.vy *= Math.max(0, 1 - 0.25 * dt);
    }
    state.effects.smokePuffs = state.effects.smokePuffs.filter((puff) => puff.age < puff.lifetime);
}

function explodeProjectile(state, projectile, reason, detail = {}) {
    if (projectile.state === "exploding" || projectile.state === "spent") {
        return;
    }
    alertCharacterEnemiesFromPlayerAudibleExplosion(state, projectile);
    projectile.impactKind = detail.impactKind || "unknown";
    projectile.impactReason = reason;
    if (projectile.owner !== "enemy" || projectile.impactEffect !== "none") {
        emitProjectileImpactSmoke(state, projectile, detail);
    }
    projectile.state = "exploding";
    projectile.vx = 0;
    projectile.vy = 0;
    projectile.explosionTimer = state.tuning.rocketProjectileExplosionSeconds;
    const eventType = projectile.owner === "enemy" ? "ENEMY_PROJECTILE_IMPACTED" : "ROCKET_IMPACTED";
    addEvent(state, eventType, {
        id: projectile.id,
        reason,
        x: round(projectile.currentTransform.x),
        y: round(projectile.currentTransform.y),
        ...detail
    });
}

function emitProjectileImpactSmoke(state, projectile, detail = {}) {
    const t = state.tuning;
    const particleScale = renderingParticleScale(state.settings);
    const authoredBase = projectile.owner === "enemy"
        ? (t.enemyProjectileImpactSmokePuffs ?? Math.max(0, Math.round((t.rocketImpactSmokePuffs ?? 24) * 0.25)))
        : (t.rocketImpactSmokePuffs ?? 12);
    const count = Math.max(0, Math.round(authoredBase * particleScale));
    const incomingSpeed = Math.hypot(projectile.vx || 0, projectile.vy || 0);
    const incomingAngle = Math.atan2(projectile.vy || 0, projectile.vx || 1);

    for (let i = 0; i < count; i += 1) {
        const u = count <= 1 ? 0 : i / (count - 1);
        const seed = (state.clock.tick * 97 + i * 131 + Math.floor(projectile.currentTransform.x * 3 + projectile.currentTransform.y * 5)) % 10000;
        const angle = incomingAngle + Math.PI + (u - 0.5) * Math.PI * 1.55 + (hash01(seed) - 0.5) * 0.65;
        const speed = 60 + incomingSpeed * (0.08 + hash01(seed + 19) * 0.13) + i * 2.2;
        const offset = 5 + hash01(seed + 41) * 16;
        const enemyProjectile = projectile.owner === "enemy";
        const hitWizard = enemyProjectile && detail.impactKind === "player";
        addSmokePuff(state, {
            kind: enemyProjectile ? "enemyProjectileImpactPuff" : "rocketImpactSmokePuff",
            x: projectile.currentTransform.x + Math.cos(angle) * offset,
            y: projectile.currentTransform.y + Math.sin(angle) * offset,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 18 + hash01(seed + 73) * 42,
            lifetime: enemyProjectile
                ? Math.max(0.18, (t.enemyProjectileImpactLifetime ?? 0.28) * (0.88 + hash01(seed + 101) * 0.32))
                : (t.rocketImpactSmokeLifetime ?? 0.82) * (0.72 + hash01(seed + 101) * 0.34),
            radius: enemyProjectile
                ? 3 + hash01(seed + 157) * 4
                : 8 + hash01(seed + 157) * 8,
            colorIndex: enemyProjectile ? 0 : null,
            impactWizardAccent: hitWizard
        });
    }
}

function hash01(seed) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
}

function findHomingTarget(state, originX, originY, facing) {
    return orderedHomingTargets(state, originX, originY, facing)[0] || null;
}

function findHeadingHomingTarget(state, originX, originY, headingX, headingY) {
    return orderedHeadingHomingTargets(state, originX, originY, headingX, headingY)[0] || null;
}

function findTargetById(state, id, originX, originY) {
    if (!id) {
        return null;
    }
    const target = state.targets.find((candidate) => candidate.id === id && candidate.state === "active") || null;
    return homingTargetWithinRange(state, target, originX, originY) ? target : null;
}

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalizeVector(v) {
    const length = Math.hypot(v.x, v.y) || 1;
    return { x: v.x / length, y: v.y / length };
}

function circleRectOverlap(cx, cy, radius, rect) {
    const closestX = clamp(cx, rect.x, rect.x + rect.w);
    const closestY = clamp(cy, rect.y, rect.y + rect.h);
    return Math.hypot(cx - closestX, cy - closestY) <= radius;
}

function findProjectileReactiveObjectImpact(state, projectile, previousX, previousY) {
    const start = { x: previousX, y: previousY };
    const end = { x: projectile.currentTransform.x, y: projectile.currentTransform.y };
    const radius = Math.max(0, projectile.radius || 0);
    let best = null;

    for (const object of state.reactiveObjects || []) {
        if (!reactiveObjectBlocksProjectiles(object)) continue;
        const hit = sweptCircleRectImpact(start, end, radius, reactiveObjectCollisionRect(object));
        if (!hit || (best && hit.t >= best.t)) continue;
        best = { t: hit.t, x: hit.x, y: hit.y, object };
    }
    return best;
}

function applyProjectileDamageToReactiveObject(state, projectile, object) {
    const before = Math.max(0, Number(object.health) || 0);
    const requestedDamage = Math.max(0, Number(projectile.damage ?? state.tuning.rocketProjectileDamage) || 0);
    const scaledDamage = requestedDamage * Math.max(0, Number(object.projectileDamageMultiplier) || 0);
    const damage = Math.min(before, scaledDamage);
    object.health = Math.max(0, before - scaledDamage);
    object.lastDamagedAt = state.clock.time;
    object.lastHitBy = projectile.id;

    let nextState = object.intactState || "intact";
    if (object.health <= 0) nextState = object.destroyedState || "destroyed";
    else if (object.health <= object.damagedHealthThreshold) nextState = object.damagedState || "damaged";
    setReactiveObjectState(state, object, nextState);

    const sourceEntity = worldEntityById(state, object.entityId || object.id);
    if (sourceEntity) sourceEntity.health = object.health;
    const destroyed = object.health <= 0;
    if (destroyed) emitReactiveObjectDestructionSmoke(state, object);
    addEvent(state, destroyed ? "REACTIVE_OBJECT_DESTROYED" : "REACTIVE_OBJECT_DAMAGED", {
        objectId: object.id,
        projectileId: projectile.id,
        damage: round(damage),
        health: round(object.health),
        maxHealth: round(object.maxHealth),
        state: object.state
    });
    return { damage, health: object.health, state: object.state, destroyed };
}

function emitReactiveObjectDestructionSmoke(state, object) {
    const rect = reactiveObjectCollisionRect(object);
    const count = Math.max(0, Math.floor(state.tuning.reactiveObjectDestructionSmokePuffs ?? 18));
    for (let i = 0; i < count; i += 1) {
        const seed = state.clock.tick * 109 + i * 149 + Math.floor(object.x * 7 + object.y * 11);
        const angle = -Math.PI + hash01(seed) * Math.PI;
        const speed = 45 + hash01(seed + 17) * 150;
        addSmokePuff(state, {
            kind: "reactiveObjectDestructionSmokePuff",
            x: rect.x + rect.w * hash01(seed + 31),
            y: rect.y + rect.h * hash01(seed + 47),
            vx: Math.cos(angle) * speed,
            vy: -35 - Math.abs(Math.sin(angle)) * speed - hash01(seed + 61) * 55,
            lifetime: (state.tuning.rocketSmokePuffLifetime ?? 1.5) * (0.9 + hash01(seed + 79) * 0.8),
            radius: 9 + hash01(seed + 97) * 13
        });
    }
}

function findProjectilePlayerImpact(state, projectile, previousX, previousY) {
    if (!playerIsAvailableCombatTarget(state)) {
        return null;
    }
    const hit = sweptCircleRectImpact(
        { x: previousX, y: previousY },
        { x: projectile.currentTransform.x, y: projectile.currentTransform.y },
        Math.max(0, projectile.radius || 0),
        getPlayerRect(state)
    );
    if (!hit) {
        return null;
    }
    return { t: hit.t, x: hit.x, y: hit.y };
}

function applyProjectileDamageToPlayer(state, projectile) {
    const result = damagePlayer(state, projectile.damage, projectile.enemyId || projectile.id, {
        knockbackX: (projectile.vx || 0) < 0 ? -Math.abs(projectile.knockbackX || 0) : Math.abs(projectile.knockbackX || 0),
        knockbackY: projectile.knockbackY || 0
    });
    return {
        damage: result.damage,
        health: state.health.amount,
        defeated: state.health.amount <= 0,
        blocked: result.damage <= 0
    };
}

function applyEnemyProjectileAreaDamage(state, projectile) {
    const radius = Math.max(0, Number(projectile.areaDamageRadius) || 0);
    if (radius <= 0 || !playerIsAvailableCombatTarget(state)) {
        return { damage: 0, health: state.health.amount, defeated: false, blocked: true, hitPlayer: false };
    }
    if (!circleRectOverlap(
        projectile.currentTransform.x,
        projectile.currentTransform.y,
        radius,
        getPlayerRect(state)
    )) {
        return { damage: 0, health: state.health.amount, defeated: false, blocked: true, hitPlayer: false };
    }

    const dx = (Number(state.player.currentTransform.x) || 0) - (Number(projectile.currentTransform.x) || 0);
    const knockbackDirection = Math.abs(dx) > 0.0001
        ? (dx < 0 ? -1 : 1)
        : ((Number(projectile.vx) || 0) < 0 ? -1 : 1);
    const result = damagePlayer(state, projectile.damage, projectile.enemyId || projectile.id, {
        knockbackX: knockbackDirection * Math.abs(projectile.knockbackX || 0),
        knockbackY: projectile.knockbackY || 0
    });
    const areaResult = {
        damage: result.damage,
        health: state.health.amount,
        defeated: state.health.amount <= 0,
        blocked: result.damage <= 0,
        hitPlayer: true
    };
    addEvent(state, "ENEMY_PROJECTILE_AREA_DAMAGE_APPLIED", {
        id: projectile.id,
        projectileKind: projectile.projectileKind || null,
        radius: round(radius),
        damage: round(areaResult.damage),
        health: round(areaResult.health),
        defeated: areaResult.defeated,
        blocked: areaResult.blocked
    });
    return areaResult;
}

function detonateEnemyProjectile(state, projectile, reason, detail = {}) {
    const area = applyEnemyProjectileAreaDamage(state, projectile);
    explodeProjectile(state, projectile, reason, {
        ...detail,
        areaDamageRadius: Math.max(0, Number(projectile.areaDamageRadius) || 0),
        areaDamage: Math.max(0, Number(projectile.damage) || 0),
        areaHitPlayer: area.hitPlayer,
        areaDamageApplied: area.damage,
        health: area.hitPlayer ? area.health : detail.health,
        defeated: area.hitPlayer ? area.defeated : detail.defeated,
        blocked: area.hitPlayer ? area.blocked : detail.blocked
    });
    return area;
}

function enemyDropRandomUnit(state, enemy, channel) {
    const random = ensureRandomState(state);
    const salt = stableStringHash([
        "enemy-drop",
        state.world?.levelId || "level",
        random.levelLoadCount,
        enemy?.id || "enemy",
        String(channel || "roll")
    ].join(":"));
    return mixedUint32(random.seed ^ salt) / 4294967296;
}

function lootPickupCollectionId(state, pickupId, item) {
    return item?.kind === "upgrade" && item?.upgradeKind
        ? playerUpgradeCollectionId(state.world?.levelId, pickupId)
        : "";
}

function enemyLootPickupId(enemy, itemId, ordinal, channel) {
    const safeOrdinal = Math.max(0, Math.floor(Number(ordinal) || 0));
    const safeChannel = String(channel || "direct").replace(/[^a-z0-9_]+/gi, "_");
    return `drop_${enemy.id}_${safeChannel}_${safeOrdinal}_${itemId}`;
}

function enemyDropSpawnInsideBlockableRegion(state, x, spawnY, width, height) {
    const query = {
        x: (Number(x) || 0) - Math.max(1, Number(width) || 1) * 0.5,
        y: (Number(spawnY) || 0) - Math.max(1, Number(height) || 1),
        w: Math.max(1, Number(width) || 1),
        h: Math.max(1, Number(height) || 1)
    };
    for (const solid of queryWorldSolids(state.world, query)) {
        if (rectsOverlap(query, solid)) return { id: solid.id || "solid", kind: solid.kind || "blockable" };
    }
    for (const polygon of queryWorldCollisionPolygons(state.world, query)) {
        if (isAreaBlockingSegmentKind(polygon.kind) && polygonOverlapsRect(polygon, query)) {
            return { id: polygon.id || "collisionArea", kind: polygon.kind || "blockable" };
        }
    }
    return null;
}

function cullPendingGroundCharacterEnemyDropIfOffWorld(state, enemy) {
    if (!groundCharacterEnemyHasPendingCorpseDrop(enemy) || enemy.combatState !== ENEMY_COMBAT_STATE.DEAD) return false;
    const bounds = state.world?.bounds;
    if (!bounds) return false;
    const margin = Math.max(128, Math.max(1, Number(enemy.height) || 1) * 2);
    const boundsBottom = Number(bounds.y) + Number(bounds.h);
    const resetY = Number(state.world?.resetY);
    const lowerLimit = Math.max(
        Number.isFinite(boundsBottom) ? boundsBottom : -Infinity,
        Number.isFinite(resetY) ? resetY : -Infinity
    ) + margin;
    if (!Number.isFinite(lowerLimit) || Number(enemy.currentTransform?.y) <= lowerLimit) return false;
    enemy.dropsEmitted = true;
    addEvent(state, "ENEMY_LOOT_CULLED_OFF_WORLD", {
        enemyId: enemy.id,
        characterId: enemy.characterId,
        x: round(Number(enemy.currentTransform?.x) || 0),
        y: round(Number(enemy.currentTransform?.y) || 0)
    });
    return true;
}

function spawnEnemyLootPickup(state, enemy, itemId, ordinal, channel) {
    const item = state.lootCatalog?.items?.[itemId];
    if (!item) return null;
    const safeOrdinal = Math.max(0, Math.floor(Number(ordinal) || 0));
    const pickupId = enemyLootPickupId(enemy, item.itemId, safeOrdinal, channel);
    const collectionId = lootPickupCollectionId(state, pickupId, item);
    if (collectionId && state.playerProgression?.collectedUpgradeIds?.includes(collectionId)) return null;
    const spread = safeOrdinal > 0
        ? (enemyDropRandomUnit(state, enemy, `${channel}:spread:${safeOrdinal}`) * 2 - 1) * 28
        : 0;
    const width = Math.max(1, Number(item.width) || 52);
    const height = Math.max(1, Number(item.height) || 52);
    const dropOffsetY = Math.max(0, Number(item.dropOffsetY) || 0);
    const spawnX = (Number(enemy.currentTransform?.x) || Number(enemy.x) || 0) + spread;
    const spawnY = (Number(enemy.currentTransform?.y) || Number(enemy.y) || 0) - dropOffsetY;
    const centerY = spawnY - height * 0.5;
    const blocked = enemyDropSpawnInsideBlockableRegion(state, spawnX, spawnY, width, height);
    if (blocked) {
        addEvent(state, "ENEMY_LOOT_CULLED_BLOCKED", {
            enemyId: enemy.id,
            characterId: enemy.characterId,
            itemId: item.itemId,
            collisionId: blocked.id,
            collisionKind: blocked.kind
        });
        return null;
    }
    const pickup = {
        id: pickupId,
        entityId: pickupId,
        collectionId,
        kind: item.kind || "item",
        pickupKind: item.pickupKind || item.itemId,
        upgradeKind: item.upgradeKind || "",
        x: spawnX,
        y: spawnY,
        centerY,
        width,
        height,
        radius: Math.max(4, Number(item.radius) || Math.min(width, height) * 0.42),
        amount: Math.max(1, Math.floor(Number(item.amount) || 1)),
        scoreValue: Math.max(0, Math.floor(Number(item.scoreValue) || 0)),
        atlasId: item.atlasId || "it_atlas_001",
        assetId: item.assetId || "",
        bob: item.bob !== false,
        dropped: true,
        collected: false,
        respawnSeconds: 0,
        respawnTimer: 0,
        randomEffectIds: [],
        randomRollCount: 0,
        visualized: false
    };
    state.pickups.push(pickup);
    addEvent(state, "ENEMY_LOOT_DROPPED", {
        enemyId: enemy.id,
        characterId: enemy.characterId,
        pickupId,
        itemId: item.itemId,
        dropGroupId: String(channel || "").startsWith("group:") ? String(channel).slice(6) : null
    });
    return pickup;
}

function selectEnemyDropEntry(state, enemy, entries) {
    let cursor = enemyDropRandomUnit(state, enemy, "table:select");
    for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        const chance = Math.max(0, Math.min(1, Number(entry?.chance) || 0));
        if (!(chance > 0) || !state.lootCatalog?.items?.[entry.itemId]) continue;
        cursor -= chance;
        if (cursor < 0) return { entry, index };
    }
    return null;
}

function emitEnemyDrops(state, enemy) {
    if (!enemy || enemy.dropsEmitted) return 0;
    enemy.dropsEmitted = true;
    const entries = Array.isArray(enemy.dropTable) ? enemy.dropTable : [];
    const selected = selectEnemyDropEntry(state, enemy, entries);
    if (!selected) return 0;
    return spawnEnemyLootPickup(state, enemy, selected.entry.itemId, selected.index, "table") ? 1 : 0;
}

function finalizeEnemyDefeatTransaction(state, enemy, eventDetails = {}) {
    if (!enemy) return;
    if (enemy.kind !== "characterEnemy" || enemy.locomotion === "flying") {
        emitEnemyDrops(state, enemy);
    }
    addEvent(state, "ENEMY_DEFEATED", {
        enemyId: enemy.id,
        characterId: enemy.characterId,
        ...eventDetails
    });
    if (enemy.isBoss === true && enemy.bossDefeatEmitted !== true) {
        enemy.bossDefeatEmitted = true;
        addEvent(state, "BOSS_DEFEATED", {
            enemyId: enemy.id,
            characterId: enemy.characterId,
            bossName: enemy.bossName,
            signalChannel: enemy.bossDefeatSignalChannel
        });
        if (enemy.bossDefeatSignalChannel) {
            emitSignalChannel(state, enemy.bossDefeatSignalChannel, { sourceId: enemy.id, active: true });
            updateSignalReceivers(state);
        }
    }
}

function emitGroundCharacterEnemyDropsAtCorpseIfReady(state, enemy) {
    if (!enemy || enemy.kind !== "characterEnemy" || enemy.locomotion === "flying" || enemy.dropsEmitted) return 0;
    if (enemy.combatState !== ENEMY_COMBAT_STATE.DEAD || enemy.airborne === true || Number(enemy.deathTimer) > 0) return 0;
    return emitEnemyDrops(state, enemy);
}

function findProjectileEnemyImpact(state, projectile, previousX, previousY) {
    const start = { x: previousX, y: previousY };
    const end = { x: projectile.currentTransform.x, y: projectile.currentTransform.y };
    const radius = Math.max(0, projectile.radius || 0);
    let best = null;

    for (const enemy of state.enemies || []) {
        if (!enemy || enemy.health <= 0 || enemy.combatState === "dead") {
            continue;
        }
        const hit = sweptCircleRectImpact(start, end, radius, enemyProjectileHitbox(enemy));
        if (!hit || (best && hit.t >= best.t)) {
            continue;
        }
        best = {
            t: hit.t,
            x: hit.x,
            y: hit.y,
            enemy
        };
    }
    return best;
}

function applyProjectileDamageToEnemy(state, projectile, enemy) {
    const before = Math.max(0, Number(enemy.health) || 0);
    if (cutsceneEnemyProtected(state, enemy)) {
        return {
            damage: 0,
            health: before,
            defeated: false,
            deferredUntilLanding: false,
            blocked: true
        };
    }
    const requestedDamage = Math.max(0, Number(projectile.damage ?? state.tuning.rocketProjectileDamage) || 0);
    const damage = Math.min(before, requestedDamage);
    enemy.maxHealth = Math.max(before, Number(enemy.maxHealth) || before);
    enemy.health = Math.max(0, before - requestedDamage);
    enemy.lastDamagedAt = state.clock.time;
    enemy.lastHitBy = projectile.id;
    enemy.hitFlashDuration = Math.max(FIXED_DT, Number(enemy.hitFlashDuration) || state.tuning.enemyHitFlashSeconds || 0.16);
    enemy.hitFlashTimer = enemy.hitFlashDuration;
    enemy.healthBarTimer = Math.max(0, state.tuning.enemyHealthBarSeconds ?? 1.4);
    const preserveAttackThroughDamage = isCharacterEnemyState(enemy)
        && enemy.immuneToInterrupts === true
        && (enemy.combatState === ENEMY_COMBAT_STATE.ATTACKING || (Number(enemy.attackTimer) || 0) > 0);
    const preDamageFacing = enemy.facing;
    if (damage > 0) {
        alertCharacterEnemyFromPlayerDamage(state, enemy);
        if (preserveAttackThroughDamage) enemy.facing = preDamageFacing;
    }

    const defeated = enemy.health <= 0;
    if (defeated) {
        enemy.health = 0;
        if (
            isCharacterEnemyState(enemy) &&
            enemy.locomotion !== "flying" &&
            enemy.airborne === true
        ) {
            deferCharacterEnemyDeathUntilLanding(enemy);
        } else if (isCharacterEnemyState(enemy)) {
            beginCharacterEnemyDeath(state, enemy);
        } else {
            enemy.combatState = ENEMY_COMBAT_STATE.DEAD;
            enemy.state = "destroyed";
            enemy.movementPhase = "dead";
            enemy.attackTimer = 0;
            enemy.attackHitApplied = false;
            enemy.hurtTimer = 0;
            enemy.deathTimer = Math.max(FIXED_DT, Number(enemy.deathDuration) || state.tuning.enemyDefaultDeathSeconds || 1.18);
            enemy.deathElapsed = 0;
            enemy.currentTransform.alpha = 1;
        }
    } else if (!preserveAttackThroughDamage) {
        enemy.combatState = ENEMY_COMBAT_STATE.HURT;
        enemy.state = "hurt";
        if (isCharacterEnemyState(enemy)) {
            enemy.attackTimer = 0;
            clearCharacterEnemyAttackLunge(enemy);
            enemy.attackHitApplied = false;
            enemy.attackCooldownTimer = Math.max(Number(enemy.attackCooldownTimer) || 0, Number(enemy.attackCooldown) || 0);
            enemy.hurtTimer = Math.max(FIXED_DT, Number(enemy.hurtDuration) || state.tuning.enemyDefaultHurtSeconds || 0.48);
            enemy.movementPhase = "hurt";
            setCharacterEnemyAnimation(enemy, "hurt");
        }
    }

    const target = (state.targets || []).find((item) => item.enemyId === enemy.id);
    if (target) {
        target.state = defeated ? "inactive" : "active";
        target.x = enemy.targetX ?? target.x;
        target.y = enemy.targetY ?? target.y;
    }

    const damageEventDetails = {
        projectileId: projectile.id,
        damage: round(damage),
        health: round(enemy.health),
        maxHealth: round(enemy.maxHealth),
        deferredUntilLanding: enemy.deathPendingLanding === true
    };
    if (defeated) {
        finalizeEnemyDefeatTransaction(state, enemy, damageEventDetails);
    } else {
        addEvent(state, "ENEMY_DAMAGED", {
            enemyId: enemy.id,
            characterId: enemy.characterId,
            ...damageEventDetails
        });
    }
    return {
        damage,
        health: enemy.health,
        defeated,
        deferredUntilLanding: enemy.deathPendingLanding === true
    };
}

function findProjectileTerrainImpact(state, projectile, previousX, previousY, options = {}) {
    const start = { x: previousX, y: previousY };
    const projectileTransform = currentTransformOf(projectile);
    const end = { x: projectileTransform.x, y: projectileTransform.y };
    const radius = Math.max(0, projectile.radius || 0);
    const activeSinceTick = Number(projectile.activeSinceTick);
    const includeMovingPlatformSweep = options.includeMovingPlatformSweep === true
        && (!Number.isFinite(activeSinceTick) || activeSinceTick < state.clock.tick);
    let best = null;

    const terrainQueryBounds = {
        minX: Math.min(start.x, end.x) - radius,
        minY: Math.min(start.y, end.y) - radius,
        maxX: Math.max(start.x, end.x) + radius,
        maxY: Math.max(start.y, end.y) + radius
    };

    function record(hit) {
        if (!hit) return;
        if (!best || hit.t < best.t) {
            best = hit;
        }
    }

    for (const solid of queryWorldSolids(state.world, terrainQueryBounds)) {
        if (solid.reactiveObjectId && options.includeReactiveObjects !== true) continue;
        const hit = sweptCircleRectImpact(start, end, radius, solid);
        if (hit) {
            record({
                t: hit.t,
                x: hit.x,
                y: hit.y,
                id: solid.id || "solid",
                kind: solid.kind || "blockable"
            });
        }
    }

    for (const segment of queryWorldSegments(state.world, terrainQueryBounds)) {
        if (segment.kind === "walkable" || !isSolidSegmentKind(segment.kind)) {
            continue;
        }
        const movingPlatform = movingPlatformForCollisionId(state, segment.id);
        if (includeMovingPlatformSweep && movingPlatform?.collisionAttached && movingPlatform.projectileSweepActive === true) {
            continue;
        }
        const hit = sweptCircleSegmentImpact(start, end, radius, segment);
        if (hit) {
            record({
                t: hit.t,
                x: hit.x,
                y: hit.y,
                id: segment.id || "segment",
                kind: segment.kind
            });
        }
    }

    for (const polygon of queryWorldCollisionPolygons(state.world, terrainQueryBounds)) {
        if (!isAreaBlockingSegmentKind(polygon.kind)) {
            continue;
        }
        const movingPlatform = movingPlatformForCollisionId(state, polygon.id);
        if (includeMovingPlatformSweep && movingPlatform?.collisionAttached && movingPlatform.projectileSweepActive === true) {
            continue;
        }
        const hit = sweptCirclePolygonImpact(start, end, radius, polygon);
        if (hit) {
            record({
                t: hit.t,
                x: hit.x,
                y: hit.y,
                id: polygon.id || "collisionArea",
                kind: polygon.kind
            });
        }
    }


    if (includeMovingPlatformSweep) {
        for (const platform of state.world?.movingPlatforms || []) {
            if (!platform?.collisionAttached || platform.projectileSweepActive !== true) continue;
            let relativeStart = start;
            if (platform.movement?.motionType === "swing") {
                const deltaRadians = ((Number(platform.projectileSweepEndAngle) || 0)
                    - (Number(platform.projectileSweepStartAngle) || 0)) * Math.PI / 180;
                if (Math.abs(deltaRadians) <= 0.000000001) continue;
                relativeStart = rotatePointAroundMovingPlatformPivot(start.x, start.y, platform, deltaRadians);
            } else {
                const platformDx = Number(platform.projectileSweepDeltaX) || 0;
                const platformDy = Number(platform.projectileSweepDeltaY) || 0;
                if (Math.abs(platformDx) <= 0.000000001 && Math.abs(platformDy) <= 0.000000001) continue;
                relativeStart = { x: start.x + platformDx, y: start.y + platformDy };
            }
            const recordRelative = (hit, id, kind) => {
                if (!hit) return;
                record({
                    t: hit.t,
                    x: start.x + (end.x - start.x) * hit.t,
                    y: start.y + (end.y - start.y) * hit.t,
                    id,
                    kind
                });
            };
            for (const segment of platform.segments || []) {
                if (segment.kind === "walkable" || !isSolidSegmentKind(segment.kind)) continue;
                recordRelative(
                    sweptCircleSegmentImpact(relativeStart, end, radius, segment),
                    segment.id || "segment",
                    segment.kind
                );
            }
            for (const polygon of platform.polygons || []) {
                if (!isAreaBlockingSegmentKind(polygon.kind)) continue;
                recordRelative(
                    sweptCirclePolygonImpact(relativeStart, end, radius, polygon),
                    polygon.id || "collisionArea",
                    polygon.kind
                );
            }
        }
    }

    return best;
}

function sweptCircleRectImpact(start, end, radius, rect) {
    if (circleRectOverlap(start.x, start.y, radius, rect)) {
        return { t: 0, x: start.x, y: start.y };
    }
    if (circleRectOverlap(end.x, end.y, radius, rect)) {
        return { t: 1, x: end.x, y: end.y };
    }

    const expanded = {
        x: rect.x - radius,
        y: rect.y - radius,
        w: rect.w + radius * 2,
        h: rect.h + radius * 2
    };
    const hit = segmentRectIntersection(start, end, expanded);
    if (hit) {
        return hit;
    }
    return null;
}

function sweptCircleSegmentImpact(start, end, radius, segment) {
    const a = { x: segment.x1, y: segment.y1 };
    const b = { x: segment.x2, y: segment.y2 };
    const crossing = segmentSegmentIntersection(start, end, a, b);
    if (crossing) {
        return crossing;
    }

    const distanceStart = pointSegmentDistance(start, a, b);
    if (distanceStart <= radius) {
        return { t: 0, x: start.x, y: start.y };
    }

    const distanceEnd = pointSegmentDistance(end, a, b);
    if (distanceEnd <= radius) {
        return { t: 1, x: end.x, y: end.y };
    }

    if (segmentSegmentDistance(start, end, a, b) <= radius) {
        return closestPathImpactPoint(start, end, a, b);
    }

    return null;
}

function sweptCirclePolygonImpact(start, end, radius, polygon) {
    const points = Array.isArray(polygon.points) ? polygon.points : [];
    if (points.length < 3) {
        return null;
    }

    if (pointInPolygon(start, polygon)) {
        return { t: 0, x: start.x, y: start.y };
    }
    if (pointInPolygon(end, polygon)) {
        const crossing = firstSegmentPolygonBoundaryIntersection(start, end, polygon);
        return crossing || { t: 1, x: end.x, y: end.y };
    }

    const boundaryHit = firstSegmentPolygonBoundaryIntersection(start, end, polygon);
    if (boundaryHit) {
        return boundaryHit;
    }

    let nearest = null;
    for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        const candidate = sweptCircleSegmentImpact(start, end, radius, {
            x1: a.x,
            y1: a.y,
            x2: b.x,
            y2: b.y
        });
        if (candidate && (!nearest || candidate.t < nearest.t)) {
            nearest = candidate;
        }
    }
    return nearest;
}

function firstSegmentPolygonBoundaryIntersection(start, end, polygon) {
    const points = polygon.points || [];
    let best = null;
    for (let i = 0; i < points.length; i += 1) {
        const hit = segmentSegmentIntersection(start, end, points[i], points[(i + 1) % points.length]);
        if (hit && (!best || hit.t < best.t)) {
            best = hit;
        }
    }
    return best;
}

function pointInPolygon(point, polygon) {
    const points = polygon.points || [];
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
        const a = points[i];
        const b = points[j];
        const dy = b.y - a.y;
        if (Math.abs(dy) < 0.000001) {
            continue;
        }
        const intersects = ((a.y > point.y) !== (b.y > point.y)) &&
            point.x < (b.x - a.x) * (point.y - a.y) / dy + a.x;
        if (intersects) {
            inside = !inside;
        }
    }
    return inside;
}

function segmentRectIntersection(start, end, rect) {
    const points = [
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.w, y: rect.y },
        { x: rect.x + rect.w, y: rect.y + rect.h },
        { x: rect.x, y: rect.y + rect.h }
    ];
    if (pointInRect(start, rect)) {
        return { t: 0, x: start.x, y: start.y };
    }
    let best = null;
    for (let i = 0; i < points.length; i += 1) {
        const hit = segmentSegmentIntersection(start, end, points[i], points[(i + 1) % points.length]);
        if (hit && (!best || hit.t < best.t)) {
            best = hit;
        }
    }
    return best;
}

function pointInRect(point, rect) {
    return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
}

function segmentSegmentIntersection(a, b, c, d) {
    const rx = b.x - a.x;
    const ry = b.y - a.y;
    const sx = d.x - c.x;
    const sy = d.y - c.y;
    const denom = cross(rx, ry, sx, sy);
    const qpx = c.x - a.x;
    const qpy = c.y - a.y;

    if (Math.abs(denom) < 0.000001) {
        return null;
    }

    const t = cross(qpx, qpy, sx, sy) / denom;
    const u = cross(qpx, qpy, rx, ry) / denom;
    if (t < -0.0001 || t > 1.0001 || u < -0.0001 || u > 1.0001) {
        return null;
    }

    const clampedT = clamp(t, 0, 1);
    return {
        t: clampedT,
        x: a.x + rx * clampedT,
        y: a.y + ry * clampedT
    };
}

function cross(ax, ay, bx, by) {
    return ax * by - ay * bx;
}

function pointSegmentDistance(point, a, b) {
    const closest = closestPointOnSegment(point, a, b);
    return Math.hypot(point.x - closest.x, point.y - closest.y);
}

function segmentSegmentDistance(a, b, c, d) {
    if (segmentSegmentIntersection(a, b, c, d)) {
        return 0;
    }
    return Math.min(
        pointSegmentDistance(a, c, d),
        pointSegmentDistance(b, c, d),
        pointSegmentDistance(c, a, b),
        pointSegmentDistance(d, a, b)
    );
}

function closestPathImpactPoint(start, end, a, b) {
    const samples = [
        closestPointOnSegment(a, start, end),
        closestPointOnSegment(b, start, end),
        closestPointOnSegment(start, start, end),
        closestPointOnSegment(end, start, end)
    ];
    let best = samples[0];
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const candidate of samples) {
        const distance = pointSegmentDistance(candidate, a, b);
        if (distance < bestDistance) {
            bestDistance = distance;
            best = candidate;
        }
    }
    return {
        t: segmentParameter(start, end, best),
        x: best.x,
        y: best.y
    };
}

function closestPointOnSegment(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared <= 0.000001) {
        return { x: a.x, y: a.y };
    }
    const t = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared, 0, 1);
    return {
        x: a.x + dx * t,
        y: a.y + dy * t
    };
}

function segmentParameter(start, end, point) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared <= 0.000001) {
        return 0;
    }
    return clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1);
}

function collisionIdIgnored(id, options = {}) {
    if (!id) {
        return false;
    }
    const value = String(id);
    for (const ignored of options.ignoreIds || []) {
        const ignoredValue = String(ignored || "");
        if (!ignoredValue) {
            continue;
        }
        if (value === ignoredValue || value.startsWith(`${ignoredValue}_nav_`) || ignoredValue.startsWith(`${value}_nav_`)) {
            return true;
        }
    }
    return false;
}

function supportFamilyId(id) {
    const value = String(id || "");
    const match = value.match(/^(.*)_(?:walkable|blockable|damaging|killable)_\d+$/);
    return match ? match[1] : value;
}

function findWorldSegmentById(state, id) {
    if (!id || !Array.isArray(state?.world?.segments)) {
        return null;
    }
    return state.world.segments.find((segment) => segment?.id === id) || null;
}

function playerSupportIsContinuation(state, preferredSupportId, candidateSegment, preferredSupportSegment = null) {
    const preferredId = String(preferredSupportId || "");
    if (!preferredId || !candidateSegment?.id) {
        return false;
    }
    if (supportFamilyId(candidateSegment.id) === supportFamilyId(preferredId)) {
        return true;
    }
    const held = preferredSupportSegment || findWorldSegmentById(state, preferredId);
    if (held?.kind !== "walkable" || candidateSegment.kind !== "walkable") {
        return false;
    }
    if (!playerSegmentIsStandable(held) || !playerSegmentIsStandable(candidateSegment)) {
        return false;
    }
    const heldDx = Number(held.x2) - Number(held.x1);
    const heldDy = Number(held.y2) - Number(held.y1);
    const candidateDx = Number(candidateSegment.x2) - Number(candidateSegment.x1);
    const candidateDy = Number(candidateSegment.y2) - Number(candidateSegment.y1);
    const heldLength = Math.hypot(heldDx, heldDy);
    const candidateLength = Math.hypot(candidateDx, candidateDy);
    if (heldLength <= 0.001 || candidateLength <= 0.001) {
        return false;
    }
    const tangentDot = Math.abs((heldDx * candidateDx + heldDy * candidateDy) / (heldLength * candidateLength));
    if (tangentDot < PLAYER_WALKABLE_SEAM_MIN_TANGENT_DOT) {
        return false;
    }
    return segmentSegmentDistance(
        { x: Number(held.x1), y: Number(held.y1) },
        { x: Number(held.x2), y: Number(held.y2) },
        { x: Number(candidateSegment.x1), y: Number(candidateSegment.y1) },
        { x: Number(candidateSegment.x2), y: Number(candidateSegment.y2) }
    ) <= PLAYER_WALKABLE_SEAM_MAX_DISTANCE;
}

function supportPreferenceScore(detail, options = {}) {
    // Support choice is geometric: the uppermost valid support at the actor's
    // foot position wins. The previous support is only a sub-pixel tie-breaker
    // so equal seams do not flicker between neighbouring authored lines.
    let score = 0;
    const id = String(detail?.id || "");
    const preferredId = String(options.preferredSupportId || "");
    if (preferredId && id) {
        if (id === preferredId) {
            score -= 0.001;
        } else if (supportFamilyId(id) === supportFamilyId(preferredId)) {
            score -= 0.0005;
        }
    }
    return score;
}

function currentPlayerSupportIsWalkable(state) {
    const segment = findWorldSegmentById(state, state?.player?.supportId);
    return segment?.kind === "walkable";
}

function expandedPlayerCollisionAssetBounds(state, queryBounds) {
    const p = state?.player;
    if (!p) return queryBounds;
    const transform = currentTransformOf(p);
    const reach = playerAutomaticStepHeight(p);
    const left = Number(transform.x) - p.width * 0.5;
    const right = Number(transform.x) + p.width * 0.5;
    const top = Number(transform.y) - p.height;
    const bottom = Number(transform.y);
    return {
        minX: Math.min(Number(queryBounds?.minX), left) - reach,
        minY: Math.min(Number(queryBounds?.minY), top) - reach,
        maxX: Math.max(Number(queryBounds?.maxX), right) + reach,
        maxY: Math.max(Number(queryBounds?.maxY), bottom) + reach
    };
}

function collisionSegmentCandidates(state, actor, queryBounds) {
    if (actor === state?.player) {
        return queryWorldSegmentsFromCollisionAssets(state.world, expandedPlayerCollisionAssetBounds(state, queryBounds));
    }
    return queryWorldSegments(state.world, queryBounds);
}

function playerGroundedHorizontalSpeedLimit(state, levelGroundSpeedLimit) {
    const speedLimit = Math.max(0, Number(levelGroundSpeedLimit) || 0);
    const player = state?.player;
    if (!player?.onGround || !player.supportId || speedLimit <= 0) {
        return speedLimit;
    }
    const segment = findWorldSegmentById(state, player.supportId);
    if (!segment || !isSolidSegmentKind(segment.kind)) {
        return speedLimit;
    }
    const dx = Number(segment.x2) - Number(segment.x1);
    const dy = Number(segment.y2) - Number(segment.y1);
    const tangentLength = Math.hypot(dx, dy);
    if (!Number.isFinite(tangentLength) || tangentLength <= 0.000001) {
        return speedLimit;
    }
    // vx is authored as the horizontal component, while grounded support
    // following supplies the matching vertical displacement. Scale vx by the
    // support tangent so the wizard's own run vector never exceeds the same
    // speed available on level ground. External platform carry is applied
    // separately and is intentionally unaffected.
    return speedLimit * Math.abs(dx) / tangentLength;
}

function segmentSurfaceDeltaAtX(segment, x, y, extrapolate = false) {
    const dx = Number(segment?.x2) - Number(segment?.x1);
    if (Math.abs(dx) < 0.001 || !Number.isFinite(x) || !Number.isFinite(y)) {
        return null;
    }
    const t = (x - Number(segment.x1)) / dx;
    if (!extrapolate && (t < -0.001 || t > 1.001)) {
        return null;
    }
    const surfaceY = Number(segment.y1) + (Number(segment.y2) - Number(segment.y1)) * t;
    return y - surfaceY;
}

function findActorSweptGroundSupport(state, actor, previousX, previousY, nextX, options = {}) {
    if (!state?.world || !actor || !Number.isFinite(previousX) || !Number.isFinite(previousY) || !Number.isFinite(nextX)) {
        return null;
    }
    const stepUp = Math.max(0, Number(options.maxStepUp) || 0);
    const drop = Math.max(0, Number(options.maxDrop) || 0);
    const skin = Math.max(2, Number(options.skin) || 3);
    const samples = [
        { offset: 0, order: 0 },
        { offset: -actor.width * 0.42, order: 1 },
        { offset: actor.width * 0.42, order: 2 }
    ];
    const horizontalTravel = Math.abs(nextX - previousX);
    const maxFootOffset = Math.max(...samples.map((sample) => Math.abs(sample.offset)));
    const queryBounds = {
        minX: Math.min(previousX, nextX) - maxFootOffset - skin,
        minY: previousY - stepUp - horizontalTravel - skin,
        maxX: Math.max(previousX, nextX) + maxFootOffset + skin,
        maxY: previousY + drop + horizontalTravel + skin
    };
    let best = null;
    const preferredSupportSegment = findWorldSegmentById(state, options.preferredSupportId);

    for (const segment of collisionSegmentCandidates(state, actor, queryBounds)) {
        if (collisionIdIgnored(segment.id, options) || !isSolidSegmentKind(segment.kind) || Math.abs(segment.x2 - segment.x1) < 0.001) {
            continue;
        }
        if (options.ignoreWalkable && segment.kind === "walkable") {
            continue;
        }
        if (!playerSegmentIsStandable(segment)) {
            continue;
        }
        const dx = Number(segment.x2) - Number(segment.x1);
        const slope = Math.abs(dx) > 0.001 ? (Number(segment.y2) - Number(segment.y1)) / dx : 0;
        const slopeTravelAllowance = horizontalTravel * Math.abs(slope);

        for (const sample of samples) {
            const start = { x: previousX + sample.offset, y: previousY };
            const end = { x: nextX + sample.offset, y: previousY };
            const nextSurfaceY = segmentYAtX(segment, end.x);
            if (nextSurfaceY === null) {
                continue;
            }
            const previousDelta = segmentSurfaceDeltaAtX(segment, start.x, start.y, true);
            const nextDelta = segmentSurfaceDeltaAtX(segment, end.x, end.y, true);
            if (previousDelta === null || nextDelta === null) {
                continue;
            }
            // Y grows downward. A support collision happens when a foot sweep
            // starts on the standing/up side of the line and ends on the
            // down/pass-through side. This handles the fast-step bridge ramp
            // without giving green walkables priority over yellow blockables.
            // A downhill foot sweep moves farther onto the standing/up side,
            // so it does not qualify here. Downhill retention comes from the
            // ordinary grounded support snap once slope-follow travel is
            // speed-bounded. Colour only controls one-way drop-through behaviour.
            const upSideTolerance = segment.kind === "walkable" ? 0.5 : skin;
            const crossedFromUpToDown = previousDelta <= upSideTolerance && nextDelta >= -skin && nextDelta >= previousDelta - 0.0001;
            if (!crossedFromUpToDown) {
                continue;
            }
            const hit = segmentSegmentIntersection(
                start,
                end,
                { x: segment.x1, y: segment.y1 },
                { x: segment.x2, y: segment.y2 }
            );
            const currentSupportContinuation = playerSupportIsContinuation(state, options.preferredSupportId, segment, preferredSupportSegment);
            const wasAlreadyOnLine = Math.abs(previousDelta) <= skin;
            if (!hit && !currentSupportContinuation && !wasAlreadyOnLine) {
                continue;
            }
            const delta = nextSurfaceY - previousY;
            const continuingSupport = currentSupportContinuation || wasAlreadyOnLine;
            const continuationSlopeAllowance = continuingSupport ? slopeTravelAllowance : 0;
            if (delta < -stepUp - continuationSlopeAllowance - skin || delta > drop + continuationSlopeAllowance + skin) {
                continue;
            }
            if (!continuingSupport && delta < -0.05) {
                const hitX = hit ? Number(hit.x) : end.x;
                const reachDistance = Math.hypot(hitX - start.x, nextSurfaceY - previousY);
                if (reachDistance > stepUp + 0.05) {
                    continue;
                }
            }
            // Among physically crossed supports, the uppermost line at the new
            // foot position is the floor. Previous-support identity only breaks
            // equal-height seams.
            const score = sample.order * 100000 + nextSurfaceY + (hit ? Math.max(0, Number(hit.t) || 0) * 0.0001 : 0.0002) + supportPreferenceScore({ id: segment.id, kind: segment.kind }, options);
            if (!best || score < best.score) {
                best = {
                    y: nextSurfaceY,
                    delta,
                    score,
                    id: segment.id,
                    kind: segment.kind,
                    source: "segment",
                    swept: true
                };
            }
        }
    }
    return best;
}

function uppermostSupportCandidate(left, right) {
    if (!left) return right || null;
    if (!right) return left;
    if (Math.abs(left.y - right.y) > 0.000001) {
        return left.y < right.y ? left : right;
    }
    return (left.score || 0) <= (right.score || 0) ? left : right;
}

function findActorHorizontalSweepCollision(state, actor, previousX, nextX, options = {}) {
    const actorTransform = currentTransformOf(actor);
    const dx = nextX - previousX;
    if (Math.abs(dx) <= 0.000001) {
        return null;
    }
    const previousLeft = previousX - actor.width / 2;
    const previousRight = previousX + actor.width / 2;
    const currentLeft = nextX - actor.width / 2;
    const currentRight = nextX + actor.width / 2;
    const top = actorTransform.y - actor.height;
    const bottom = actorTransform.y;
    const ySamples = [
        actorTransform.y - actor.height * 0.84,
        actorTransform.y - actor.height * 0.50,
        actorTransform.y - actor.height * 0.16
    ];
    const skin = 3;
    const collisionQueryBounds = {
        minX: Math.min(previousLeft, currentLeft) - skin,
        minY: top - skin,
        maxX: Math.max(previousRight, currentRight) + skin,
        maxY: bottom + skin
    };
    let best = null;
    const consider = (contactX, detail) => {
        if (!Number.isFinite(contactX)) {
            return;
        }
        if (dx > 0) {
            if (previousRight > contactX + skin || currentRight < contactX - skin) {
                return;
            }
            if (!best || contactX < best.contactX) {
                best = { contactX, x: contactX - actor.width / 2, side: "right", ...detail };
            }
        } else {
            if (previousLeft < contactX - skin || currentLeft > contactX + skin) {
                return;
            }
            if (!best || contactX > best.contactX) {
                best = { contactX, x: contactX + actor.width / 2, side: "left", ...detail };
            }
        }
    };

    for (const solid of queryWorldSolids(state.world, collisionQueryBounds)) {
        if (collisionIdIgnored(solid.id, options) || bottom <= solid.y + 0.05 || top >= solid.y + solid.h - 0.05) {
            continue;
        }
        consider(dx > 0 ? solid.x : solid.x + solid.w, {
            id: solid.id,
            kind: solid.kind || "solid",
            source: "solid"
        });
    }

    for (const segment of collisionSegmentCandidates(state, actor, collisionQueryBounds)) {
        if (collisionIdIgnored(segment.id, options) || segment.kind === "walkable") {
            continue;
        }
        if (options.blockAllBlockableLines === true) {
            const xCandidates = [];
            const addEndpoint = (x, y) => {
                if (y >= top - 0.000001 && y <= bottom + 0.000001) xCandidates.push(x);
            };
            addEndpoint(segment.x1, segment.y1);
            addEndpoint(segment.x2, segment.y2);
            const segmentDy = segment.y2 - segment.y1;
            if (Math.abs(segmentDy) > 0.000001) {
                for (const bandY of [top, bottom]) {
                    const u = (bandY - segment.y1) / segmentDy;
                    if (u >= -0.000001 && u <= 1.000001) {
                        xCandidates.push(segment.x1 + (segment.x2 - segment.x1) * clamp(u, 0, 1));
                    }
                }
            } else if (segment.y1 >= top - 0.000001 && segment.y1 <= bottom + 0.000001) {
                xCandidates.push(segment.x1, segment.x2);
            }
            if (xCandidates.length) {
                consider(dx > 0 ? Math.min(...xCandidates) : Math.max(...xCandidates), {
                    id: segment.id,
                    kind: segment.kind,
                    source: "segment"
                });
            }
            continue;
        }
        if (Math.abs(segment.y2 - segment.y1) <= Math.abs(segment.x2 - segment.x1) * 0.75) {
            continue;
        }
        for (const y of ySamples) {
            const x = segmentXAtY(segment, y);
            if (x !== null) {
                consider(x, {
                    id: segment.id,
                    kind: segment.kind,
                    source: "segment"
                });
            }
        }
    }

    for (const polygon of queryWorldCollisionPolygons(state.world, collisionQueryBounds)) {
        const blocksActor = isAreaBlockingSegmentKind(polygon.kind) || (options.blockWater && polygon.kind === "water");
        if (collisionIdIgnored(polygon.id, options) || !blocksActor) {
            continue;
        }
        for (const y of ySamples) {
            for (const interval of polygonXIntervalsAtY(polygon, y)) {
                consider(dx > 0 ? interval[0] : interval[1], {
                    id: polygon.id,
                    kind: polygon.kind,
                    source: "polygon"
                });
            }
        }
    }
    return best;
}

function findActorGroundSupportAtX(state, actor, x, referenceY, maxStepUp, maxDrop, options = {}) {
    if (!state?.world || !actor || !Number.isFinite(Number(x)) || !Number.isFinite(Number(referenceY))) {
        return null;
    }
    const width = Math.max(1, Number(actor.width) || 1);
    const samples = [
        x,
        x - width * 0.42,
        x + width * 0.42
    ];
    const stepUp = Math.max(0, Number(maxStepUp) || 0);
    const drop = Math.max(0, Number(maxDrop) || 0);
    const skin = 3;
    const queryBounds = {
        minX: Math.min(...samples) - skin,
        minY: referenceY - stepUp - skin,
        maxX: Math.max(...samples) + skin,
        maxY: referenceY + drop + skin
    };
    let best = null;
    const preferredSupportSegment = findWorldSegmentById(state, options.preferredSupportId);
    const consider = (surfaceY, detail, sampleIndex) => {
        if (!Number.isFinite(surfaceY)) {
            return;
        }
        const delta = surfaceY - referenceY;
        const preferredId = String(options.preferredSupportId || "");
        const continuingSupport = preferredId && supportFamilyId(detail?.id || "") === supportFamilyId(preferredId);
        const upwardAllowance = continuingSupport ? stepUp + skin : stepUp;
        if (delta < -upwardAllowance - 0.05 || delta > drop + skin) {
            return;
        }
        // Smaller Y is physically higher on screen. At the actor's central
        // foot X, the uppermost valid support wins; side samples are fallback
        // stability probes and must not pull the center foot up a neighbouring
        // slope. Kind and colour do not override geometry.
        const score = sampleIndex * 100000 + surfaceY + supportPreferenceScore(detail, options);
        if (!best || score < best.score) {
            best = { y: surfaceY, delta, score, ...detail };
        }
    };

    for (const segment of collisionSegmentCandidates(state, actor, queryBounds)) {
        if (collisionIdIgnored(segment.id, options) || !isSolidSegmentKind(segment.kind) || Math.abs(segment.x2 - segment.x1) < 0.001) {
            continue;
        }
        if (options.ignoreWalkable && segment.kind === "walkable") {
            continue;
        }
        if (!playerSegmentIsStandable(segment)) {
            continue;
        }
        if (options.ignoreUncrossedWalkable && segment.kind === "walkable"
            && !playerSupportIsContinuation(state, options.preferredSupportId, segment, preferredSupportSegment)) {
            continue;
        }
        for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
            const surfaceY = segmentYAtX(segment, samples[sampleIndex]);
            if (surfaceY !== null) {
                consider(surfaceY, { id: segment.id, kind: segment.kind, source: "segment" }, sampleIndex);
            }
        }
    }

    return best;
}

function findActorVerticalSweepCollision(state, actor, previousY, nextY, options = {}) {
    const actorTransform = currentTransformOf(actor);
    const dy = nextY - previousY;
    if (Math.abs(dy) <= 0.000001) {
        return null;
    }
    const samples = [
        actorTransform.x,
        actorTransform.x - actor.width * 0.42,
        actorTransform.x + actor.width * 0.42
    ];
    const previousTop = previousY - actor.height;
    const currentTop = nextY - actor.height;
    const skin = 3;
    const collisionQueryBounds = {
        minX: Math.min(...samples) - skin,
        minY: Math.min(previousTop, currentTop, previousY, nextY) - skin,
        maxX: Math.max(...samples) + skin,
        maxY: Math.max(previousTop, currentTop, previousY, nextY) + skin
    };
    let best = null;
    const actorSupportSegment = findWorldSegmentById(state, options.preferredSupportId || actor.supportId);
    const actorOnWalkableSupport = actorSupportSegment?.kind === "walkable" || options.preferWalkable === true;
    const consider = (surfaceY, detail, ceiling = false, sampleIndex = 0) => {
        if (!Number.isFinite(surfaceY)) {
            return;
        }
        if (!ceiling) {
            if (actorOnWalkableSupport && detail?.kind !== "walkable" && previousY > surfaceY + 0.05) {
                return;
            }
            if (previousY > surfaceY + skin || nextY < surfaceY - skin) {
                return;
            }
            const score = sampleIndex * 100000 + surfaceY;
            if (!best || score < best.score) {
                best = { surfaceY, y: surfaceY, contactX: samples[sampleIndex], ceiling: false, score, ...detail };
            }
        } else {
            if (previousTop < surfaceY - skin || currentTop > surfaceY + skin) {
                return;
            }
            if (!best || !best.ceiling || surfaceY > best.surfaceY) {
                best = { surfaceY, y: surfaceY + actor.height, contactX: samples[sampleIndex], ceiling: true, ...detail };
            }
        }
    };

    for (const solid of queryWorldSolids(state.world, collisionQueryBounds)) {
        if (collisionIdIgnored(solid.id, options)) {
            continue;
        }
        if (!samples.some((x) => x >= solid.x - 0.001 && x <= solid.x + solid.w + 0.001)) {
            continue;
        }
        const sampleIndex = samples.findIndex((x) => x >= solid.x - 0.001 && x <= solid.x + solid.w + 0.001);
        if (dy > 0) {
            consider(solid.y, { id: solid.id, kind: solid.kind || "solid", source: "solid" }, false, Math.max(0, sampleIndex));
        } else {
            consider(solid.y + solid.h, { id: solid.id, kind: solid.kind || "solid", source: "solid" }, true, Math.max(0, sampleIndex));
        }
    }

    for (const segment of collisionSegmentCandidates(state, actor, collisionQueryBounds)) {
        if (collisionIdIgnored(segment.id, options) || !isSolidSegmentKind(segment.kind) || Math.abs(segment.x2 - segment.x1) < 0.001) {
            continue;
        }
        if (options.ignoreWalkable && segment.kind === "walkable") {
            continue;
        }
        if (dy > 0 && options.blockAllBlockableLines !== true && !playerSegmentIsStandable(segment)) {
            continue;
        }
        for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
            const x = samples[sampleIndex];
            const y = segmentYAtX(segment, x);
            if (y === null) {
                continue;
            }
            if (dy > 0) {
                if (segment.kind === "walkable") {
                    const previousDelta = previousY - y;
                    const nextDelta = nextY - y;
                    if (previousDelta > 0.5 || nextDelta < -skin) {
                        continue;
                    }
                }
                consider(y, { id: segment.id, kind: segment.kind, source: "segment" }, false, sampleIndex);
            } else if (segment.kind !== "walkable") {
                consider(y, { id: segment.id, kind: segment.kind, source: "segment" }, true, sampleIndex);
            }
        }
    }

    for (const polygon of queryWorldCollisionPolygons(state.world, collisionQueryBounds)) {
        const blocksActor = isAreaBlockingSegmentKind(polygon.kind) || (options.blockWater && polygon.kind === "water");
        if (collisionIdIgnored(polygon.id, options) || !blocksActor) {
            continue;
        }
        for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
            const x = samples[sampleIndex];
            for (const interval of polygonYIntervalsAtX(polygon, x)) {
                if (dy > 0) {
                    consider(interval[0], { id: polygon.id, kind: polygon.kind, source: "polygon" }, false, sampleIndex);
                } else {
                    consider(interval[1], { id: polygon.id, kind: polygon.kind, source: "polygon" }, true, sampleIndex);
                }
            }
        }
    }
    return best;
}

function sameStridePoint(a, b, tolerance = 0.08) {
    return Math.abs(Number(a?.x) - Number(b?.x)) <= tolerance &&
        Math.abs(Number(a?.y) - Number(b?.y)) <= tolerance;
}

function currentGroundStrideSupportGeometry(state) {
    const supportId = state.player?.supportId;
    if (!supportId) return null;
    for (const support of state.world?.segments || []) {
        if (support.id !== supportId || !playerSegmentIsStandable(support)) continue;
        return {
            id: support.id,
            kind: support.kind,
            source: "segment",
            visualId: String(support.visualId || ""),
            x1: Number(support.x1),
            y1: Number(support.y1),
            x2: Number(support.x2),
            y2: Number(support.y2)
        };
    }
    for (const solid of state.world?.solids || []) {
        if (solid.id !== supportId) continue;
        return {
            id: solid.id,
            kind: solid.kind || "solid",
            source: "solid",
            visualId: String(solid.visualId || ""),
            x1: Number(solid.x),
            y1: Number(solid.y),
            x2: Number(solid.x) + Number(solid.w),
            y2: Number(solid.y)
        };
    }
    for (const polygon of state.world?.collisionPolygons || []) {
        if (polygon.id !== supportId || !Array.isArray(polygon.points) || polygon.points.length < 2) continue;
        let best = null;
        let bestDistance = Infinity;
        for (let index = 0; index < polygon.points.length; index += 1) {
            const a = polygon.points[index];
            const b = polygon.points[(index + 1) % polygon.points.length];
            const probe = { kind: polygon.kind, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
            if (!playerSegmentIsStandable(probe)) continue;
            const y = segmentYAtX(probe, state.player.currentTransform.x);
            if (y === null) continue;
            const distance = Math.abs(y - state.player.currentTransform.y);
            if (distance < bestDistance) {
                bestDistance = distance;
                best = {
                    id: polygon.id,
                    kind: polygon.kind,
                    source: "polygon",
                    visualId: String(polygon.visualId || ""),
                    x1: Number(a.x),
                    y1: Number(a.y),
                    x2: Number(b.x),
                    y2: Number(b.y)
                };
            }
        }
        if (best) return best;
    }
    return null;
}

function findPlayerGroundStrideCollision(state, previousX, nextX) {
    const p = state.player;
    const dx = nextX - previousX;
    if (Math.abs(dx) <= 0.000001) return null;
    const previousLeft = previousX - p.width * 0.5;
    const previousRight = previousX + p.width * 0.5;
    const currentLeft = nextX - p.width * 0.5;
    const currentRight = nextX + p.width * 0.5;
    const top = p.currentTransform.y - p.height;
    const bottom = p.currentTransform.y;
    // This near-foot probe is not an ordinary wall response. It only notices
    // that grounded horizontal travel would enter low collision geometry and
    // hands that discontinuity to the reach-circle stride solver.
    const ySamples = [
        p.currentTransform.y - p.height * 0.84,
        p.currentTransform.y - p.height * 0.50,
        p.currentTransform.y - p.height * 0.16,
        p.currentTransform.y - 0.5
    ];
    const skin = 3;
    const queryBounds = {
        minX: Math.min(previousLeft, currentLeft) - skin,
        minY: top - skin,
        maxX: Math.max(previousRight, currentRight) + skin,
        maxY: bottom + skin
    };
    let best = null;
    const consider = (contactX, detail) => {
        if (!Number.isFinite(contactX)) return;
        if (dx > 0) {
            if (previousRight > contactX + 0.05 || currentRight < contactX - skin) return;
            if (!best || contactX < best.contactX - 0.000001) {
                best = { contactX, x: contactX - p.width * 0.5, side: "right", ...detail };
            }
        } else {
            if (previousLeft < contactX - 0.05 || currentLeft > contactX + skin) return;
            if (!best || contactX > best.contactX + 0.000001) {
                best = { contactX, x: contactX + p.width * 0.5, side: "left", ...detail };
            }
        }
    };

    for (const solid of queryWorldSolids(state.world, queryBounds)) {
        if (bottom <= solid.y + 0.05 || top >= solid.y + solid.h - 0.05) continue;
        consider(dx > 0 ? solid.x : solid.x + solid.w, {
            id: solid.id,
            kind: solid.kind || "solid",
            source: "solid"
        });
    }

    const heldSupport = currentGroundStrideSupportGeometry(state);
    const heldSupportNextY = heldSupport ? segmentYAtX(heldSupport, nextX) : null;
    const heldSupportContinues = heldSupportNextY !== null &&
        Math.abs(heldSupportNextY - p.currentTransform.y) <= playerAutomaticStepHeight(p) + skin + 0.05;
    for (const segment of queryWorldSegmentsFromCollisionAssets(state.world, expandedPlayerCollisionAssetBounds(state, queryBounds))) {
        if (segment.kind === "walkable" || !isAreaBlockingSegmentKind(segment.kind)) continue;
        const standable = playerSegmentIsStandable(segment);
        if (standable && heldSupport && Math.abs(Number(segment.x2) - Number(segment.x1)) > 0.05) {
            const a = { x: Number(segment.x1), y: Number(segment.y1) };
            const b = { x: Number(segment.x2), y: Number(segment.y2) };
            const endpoint = dx > 0 ? (a.x <= b.x ? a : b) : (a.x >= b.x ? a : b);
            const supportY = segmentYAtX(heldSupport, endpoint.x);
            if (supportY !== null) {
                const gap = supportY - endpoint.y;
                if (gap > 0.05 && gap < p.height - 0.05) {
                    consider(endpoint.x, { id: segment.id, kind: segment.kind, source: "segmentEndpoint" });
                }
            }
        }
        if (standable) continue;
        for (const y of ySamples) {
            const x = segmentXAtY(segment, y);
            if (x !== null) consider(x, { id: segment.id, kind: segment.kind, source: "segment" });
        }
    }

    for (const polygon of queryWorldCollisionPolygons(state.world, queryBounds)) {
        if (!isAreaBlockingSegmentKind(polygon.kind)) continue;
        // While the held authored support still continues under the wizard, the
        // filled blockable area belonging to that same atlas placement is the
        // terrain *below* the support, not a new obstacle to step over. Let the
        // ordinary slope-follow path remain authoritative. A different placement
        // can still trigger the stride solver, as can this placement once its held
        // support actually ends.
        if (heldSupportContinues && heldSupport?.visualId && polygon.visualId === heldSupport.visualId) continue;
        for (const y of ySamples) {
            for (const interval of polygonXIntervalsAtY(polygon, y)) {
                consider(dx > 0 ? interval[0] : interval[1], {
                    id: polygon.id,
                    kind: polygon.kind,
                    source: "polygon"
                });
            }
        }
    }
    return best;
}

function groundStrideFootOrigin(state, collision, contactActorX, direction) {
    const p = state.player;
    const contactX = Number.isFinite(Number(collision?.contactX))
        ? Number(collision.contactX)
        : contactActorX + direction * p.width * 0.5;
    const maximumReach = playerAutomaticStepHeight(p);

    const support = currentGroundStrideSupportGeometry(state);
    if (support) {
        const supportY = segmentYAtX(support, contactX);
        if (supportY !== null && Math.abs(supportY - p.currentTransform.y) <= maximumReach + 3.05) {
            return { x: contactX, y: supportY };
        }
    }

    // Polygon support IDs are uncommon for authored atlas collision because
    // the matching line IDs normally win support selection, but direct runtime
    // polygons are valid collision geometry and may be the held support.
    for (const polygon of state.world?.collisionPolygons || []) {
        if (polygon.id !== p.supportId || !Array.isArray(polygon.points) || polygon.points.length < 2) continue;
        let bestY = null;
        for (let index = 0; index < polygon.points.length; index += 1) {
            const a = polygon.points[index];
            const b = polygon.points[(index + 1) % polygon.points.length];
            const probe = { kind: polygon.kind, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
            if (!playerSegmentIsStandable(probe)) continue;
            const y = segmentYAtX(probe, contactX);
            if (y === null || Math.abs(y - p.currentTransform.y) > maximumReach + 3.05) continue;
            if (bestY === null || y < bestY) bestY = y;
        }
        if (bestY !== null) return { x: contactX, y: bestY };
    }

    return { x: contactX, y: p.currentTransform.y };
}

function groundStrideCircleIntersections(a, b, center, radius) {
    const dx = Number(b.x) - Number(a.x);
    const dy = Number(b.y) - Number(a.y);
    const fx = Number(a.x) - Number(center.x);
    const fy = Number(a.y) - Number(center.y);
    const aa = dx * dx + dy * dy;
    if (!Number.isFinite(aa) || aa <= 0.0000001) return [];
    const bb = 2 * (fx * dx + fy * dy);
    const cc = fx * fx + fy * fy - radius * radius;
    const discriminant = bb * bb - 4 * aa * cc;
    if (!Number.isFinite(discriminant) || discriminant < -0.000001) return [];
    const root = Math.sqrt(Math.max(0, discriminant));
    const roots = [(-bb - root) / (2 * aa), (-bb + root) / (2 * aa)];
    const out = [];
    for (const t of roots) {
        if (t < -0.000001 || t > 1.000001) continue;
        const clampedT = clamp(t, 0, 1);
        const point = { x: Number(a.x) + dx * clampedT, y: Number(a.y) + dy * clampedT };
        if (!out.some((candidate) => sameStridePoint(candidate, point, 0.001))) out.push(point);
    }
    return out;
}

function groundStrideArcSweepParameter(point, center, direction) {
    const forward = (Number(point.x) - Number(center.x)) * direction;
    if (forward < -0.05) return null;
    const vertical = Number(point.y) - Number(center.y);
    const sweep = Math.atan2(Math.max(0, forward), -vertical);
    return sweep <= Math.PI + 0.0001 ? sweep : null;
}

function groundStrideSupportGeometryFromSegment(segment) {
    return {
        id: segment.id,
        kind: segment.kind,
        source: "segment",
        x1: Number(segment.x1),
        y1: Number(segment.y1),
        x2: Number(segment.x2),
        y2: Number(segment.y2)
    };
}

function groundStrideCandidateEdges(state, bounds) {
    const edges = [];
    const seen = new Set();
    const add = (support, a, b, standable, blocksBody, edgeKey = "") => {
        if (![a.x, a.y, b.x, b.y].every(Number.isFinite)) return;
        if (Math.hypot(b.x - a.x, b.y - a.y) <= 0.000001) return;
        const key = `${support.source}|${support.id}|${edgeKey}|${a.x.toFixed(6)}|${a.y.toFixed(6)}|${b.x.toFixed(6)}|${b.y.toFixed(6)}`;
        if (seen.has(key)) return;
        seen.add(key);
        edges.push({ key, support, a, b, standable, blocksBody });
    };

    for (const segment of queryWorldSegmentsFromCollisionAssets(state.world, bounds)) {
        if (!isSolidSegmentKind(segment.kind)) continue;
        const support = groundStrideSupportGeometryFromSegment(segment);
        add(
            support,
            { x: support.x1, y: support.y1 },
            { x: support.x2, y: support.y2 },
            playerSegmentIsStandable(segment),
            segment.kind !== "walkable" && isAreaBlockingSegmentKind(segment.kind),
            "segment"
        );
    }

    for (const solid of queryWorldSolids(state.world, bounds)) {
        const left = Number(solid.x);
        const top = Number(solid.y);
        const right = left + Number(solid.w);
        const bottom = top + Number(solid.h);
        const support = {
            id: solid.id,
            kind: solid.kind || "solid",
            source: "solid",
            x1: left,
            y1: top,
            x2: right,
            y2: top
        };
        add(support, { x: left, y: top }, { x: right, y: top }, true, true, "top");
        add(support, { x: right, y: top }, { x: right, y: bottom }, false, true, "right");
        add(support, { x: right, y: bottom }, { x: left, y: bottom }, false, true, "bottom");
        add(support, { x: left, y: bottom }, { x: left, y: top }, false, true, "left");
    }

    for (const polygon of queryWorldCollisionPolygons(state.world, bounds)) {
        if (!Array.isArray(polygon.points) || polygon.points.length < 2 || !isAreaBlockingSegmentKind(polygon.kind)) continue;
        for (let index = 0; index < polygon.points.length; index += 1) {
            const a = { x: Number(polygon.points[index].x), y: Number(polygon.points[index].y) };
            const b = { x: Number(polygon.points[(index + 1) % polygon.points.length].x), y: Number(polygon.points[(index + 1) % polygon.points.length].y) };
            const probe = { kind: polygon.kind, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
            const support = {
                id: polygon.id,
                kind: polygon.kind,
                source: "polygon",
                x1: a.x,
                y1: a.y,
                x2: b.x,
                y2: b.y
            };
            add(support, a, b, playerSegmentIsStandable(probe), true, `polygon:${index}`);
        }
    }
    return edges;
}

function groundStrideEdgeParameter(edge, point) {
    const dx = edge.b.x - edge.a.x;
    const dy = edge.b.y - edge.a.y;
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq <= 0.0000001) return 0;
    return clamp(((point.x - edge.a.x) * dx + (point.y - edge.a.y) * dy) / lengthSq, 0, 1);
}

function groundStrideGlideFoothold(edges, blockerContacts, contactPoint, footOrigin, maximumReach, direction, minimumForward) {
    const startRadius = Math.hypot(contactPoint.x - footOrigin.x, contactPoint.y - footOrigin.y);
    const candidates = [];
    for (const blockerContact of blockerContacts) {
        const blocker = blockerContact.edge;
        const dx = blocker.b.x - blocker.a.x;
        const dy = blocker.b.y - blocker.a.y;
        const lengthSq = dx * dx + dy * dy;
        if (lengthSq <= 0.0000001) continue;
        const startT = groundStrideEdgeParameter(blocker, contactPoint);
        const closestT = clamp(-((blocker.a.x - footOrigin.x) * dx + (blocker.a.y - footOrigin.y) * dy) / lengthSq, 0, 1);
        for (const edge of edges) {
            if (!edge.standable) continue;
            const hit = segmentSegmentIntersection(blocker.a, blocker.b, edge.a, edge.b);
            if (!hit) continue;
            const point = { x: hit.x, y: hit.y };
            const forward = (point.x - footOrigin.x) * direction;
            const radius = Math.hypot(point.x - footOrigin.x, point.y - footOrigin.y);
            if (forward < minimumForward - 0.000001 || radius > maximumReach + 0.05 || radius > startRadius + 0.05) continue;
            const candidateT = groundStrideEdgeParameter(blocker, point);
            const towardClosest = closestT - startT;
            const towardCandidate = candidateT - startT;
            if (Math.abs(towardClosest) > 0.000001 && towardCandidate * towardClosest < -0.000001) continue;
            if (Math.abs(towardCandidate) > Math.abs(towardClosest) + 0.0001) continue;
            candidates.push({ point, support: edge.support, radius, forward });
        }
    }
    candidates.sort((left, right) => {
        if (Math.abs(left.radius - right.radius) > 0.000001) return right.radius - left.radius;
        return right.forward - left.forward;
    });
    return candidates[0] || null;
}

function groundStrideSweepFootholdFromCandidates(edges, footOrigin, maximumReach, direction, minimumForward = 0.05) {
    // The foot itself follows the fixed-radius movement-facing arc. Candidate
    // lines are intersected analytically with that circle, so the result does
    // not depend on angle sampling. Only after the first steep contact C is
    // found may the contact glide inward along that same exposed edge.
    const contacts = [];
    for (const edge of edges) {
        for (const point of groundStrideCircleIntersections(edge.a, edge.b, footOrigin, maximumReach)) {
            const sweep = groundStrideArcSweepParameter(point, footOrigin, direction);
            if (sweep === null) continue;
            contacts.push({ point, edge, sweep });
        }
    }
    contacts.sort((left, right) => left.sweep - right.sweep);
    if (!contacts.length) return null;

    let index = 0;
    while (index < contacts.length) {
        const sweep = contacts[index].sweep;
        const group = [];
        while (index < contacts.length && Math.abs(contacts[index].sweep - sweep) <= 0.000001) {
            group.push(contacts[index]);
            index += 1;
        }
        const point = group[0].point;
        const forward = (point.x - footOrigin.x) * direction;
        const standable = group.filter((contact) => contact.edge.standable);
        const blockers = group.filter((contact) => !contact.edge.standable && contact.edge.blocksBody);
        if (standable.length && forward >= minimumForward - 0.000001) {
            standable.sort((left, right) => {
                const extent = (contact) => Math.max(
                    (contact.edge.a.x - contact.point.x) * direction,
                    (contact.edge.b.x - contact.point.x) * direction
                );
                return extent(right) - extent(left);
            });
            return {
                foothold: { ...standable[0].point },
                targetSupport: standable[0].edge.support,
                clearancePoint: { ...standable[0].point }
            };
        }
        if (blockers.length) {
            const glide = groundStrideGlideFoothold(edges, blockers, point, footOrigin, maximumReach, direction, minimumForward);
            if (!glide) return null;
            return {
                foothold: { ...glide.point },
                targetSupport: glide.support,
                clearancePoint: { ...point }
            };
        }
        // A non-blocking one-way line at the very top of the arc with no
        // forward progress does not end the search; continue around the arc.
    }
    return null;
}

function groundStrideTriggerClearancePoint(candidateEdges, collision, footOrigin, maximumReach) {
    let best = null;
    for (const edge of candidateEdges) {
        if (!edge.blocksBody || edge.support.id !== collision?.id) continue;
        const points = [edge.a, edge.b, ...groundStrideCircleIntersections(edge.a, edge.b, footOrigin, maximumReach)];
        for (const point of points) {
            const reach = Math.hypot(point.x - footOrigin.x, point.y - footOrigin.y);
            if (reach > maximumReach + 0.05) continue;
            if (!best || point.y < best.y - 0.000001) best = { ...point };
        }
    }
    return best;
}

function groundStrideConvexHull(points) {
    const sorted = [...points]
        .filter((point) => Number.isFinite(point?.x) && Number.isFinite(point?.y))
        .sort((left, right) => left.x - right.x || left.y - right.y);
    const unique = [];
    for (const point of sorted) {
        if (!unique.length || !sameStridePoint(unique[unique.length - 1], point, 0.000001)) unique.push(point);
    }
    if (unique.length <= 2) return unique;
    const turn = (a, b, c) => cross(b.x - a.x, b.y - a.y, c.x - a.x, c.y - a.y);
    const lower = [];
    for (const point of unique) {
        while (lower.length >= 2 && turn(lower[lower.length - 2], lower[lower.length - 1], point) <= 0.0000001) lower.pop();
        lower.push(point);
    }
    const upper = [];
    for (let index = unique.length - 1; index >= 0; index -= 1) {
        const point = unique[index];
        while (upper.length >= 2 && turn(upper[upper.length - 2], upper[upper.length - 1], point) <= 0.0000001) upper.pop();
        upper.push(point);
    }
    lower.pop();
    upper.pop();
    return lower.concat(upper);
}

function groundStridePointInsideConvexHull(point, hull, tolerance = 0.02) {
    if (!Array.isArray(hull) || hull.length < 3) return false;
    let sign = 0;
    for (let index = 0; index < hull.length; index += 1) {
        const a = hull[index];
        const b = hull[(index + 1) % hull.length];
        const value = cross(b.x - a.x, b.y - a.y, point.x - a.x, point.y - a.y);
        if (Math.abs(value) <= tolerance) continue;
        const nextSign = Math.sign(value);
        if (!sign) sign = nextSign;
        else if (nextSign !== sign) return false;
    }
    return true;
}

function groundStrideSegmentsIntersectInclusive(a, b, c, d, tolerance = 0.02) {
    if (segmentSegmentIntersection(a, b, c, d)) return true;
    return pointSegmentDistance(a, c, d) <= tolerance ||
        pointSegmentDistance(b, c, d) <= tolerance ||
        pointSegmentDistance(c, a, b) <= tolerance ||
        pointSegmentDistance(d, a, b) <= tolerance;
}

function groundStrideSweptBodyHull(player, from, to, automaticStepHeight) {
    // Inset the collision rectangle by a fraction of a pixel. The sweep may
    // touch a riser at the initial contact or a floor at the landing pose, but
    // the body volume itself must never pass through collision geometry.
    const inset = 0.35;
    const halfWidth = Math.max(0.5, player.width * 0.5 - inset);
    const topOffset = -player.height + inset;
    // The bottom automatic-step-height band is resolved by the foot arc itself.
    // Only the body above that band must remain collision-free during a stride.
    const bottomOffset = -Math.max(inset, Number(automaticStepHeight) || 0) - inset;
    const cornersAt = (pose) => [
        { x: pose.x - halfWidth, y: pose.y + topOffset },
        { x: pose.x + halfWidth, y: pose.y + topOffset },
        { x: pose.x + halfWidth, y: pose.y + bottomOffset },
        { x: pose.x - halfWidth, y: pose.y + bottomOffset }
    ];
    return groundStrideConvexHull([...cornersAt(from), ...cornersAt(to)]);
}

function groundStrideEdgeIntersectsSweptBody(edge, hull) {
    if (!Array.isArray(hull) || hull.length < 3) return false;
    if (groundStridePointInsideConvexHull(edge.a, hull) || groundStridePointInsideConvexHull(edge.b, hull)) return true;
    for (let index = 0; index < hull.length; index += 1) {
        if (groundStrideSegmentsIntersectInclusive(edge.a, edge.b, hull[index], hull[(index + 1) % hull.length])) return true;
    }
    return false;
}

function groundStrideEdgeSupportsPose(edge, pose, player, tolerance = 3.05) {
    if (!edge?.standable || !pose || !player) return false;
    const probe = { kind: edge.support?.kind || "blockable", x1: edge.a.x, y1: edge.a.y, x2: edge.b.x, y2: edge.b.y };
    for (const x of [pose.x, pose.x - player.width * 0.42, pose.x + player.width * 0.42]) {
        const y = segmentYAtX(probe, x);
        if (y !== null && Math.abs(y - pose.y) <= tolerance) return true;
    }
    return false;
}

function groundStrideBodyPathBlocked(state, stridePath, actor = state.player, automaticStepHeight = playerAutomaticStepHeight(actor)) {
    const bodyLegs = [
        [stridePath.start, stridePath.corner],
        [stridePath.corner, stridePath.target]
    ];

    for (const edge of stridePath.candidateEdges || []) {
        if (!edge.blocksBody) continue;
        // A standable surface geometrically touching the feet at the start or
        // landing pose is an allowed boundary regardless of support ID. Closed
        // atlas loops often expose both a polygon support ID and authored line
        // IDs for the same physical floor. Steep sides remain blocking.
        if (groundStrideEdgeSupportsPose(edge, stridePath.start, actor) || groundStrideEdgeSupportsPose(edge, stridePath.target, actor)) continue;
        for (const [from, to] of bodyLegs) {
            const hull = groundStrideSweptBodyHull(actor, from, to, automaticStepHeight);
            if (groundStrideEdgeIntersectsSweptBody(edge, hull)) return true;
        }
    }
    return false;
}

function planPlayerGroundStride(state, collision, previousX, nextX) {
    const p = state.player;
    const direction = Math.sign(nextX - previousX);
    if (!collision || !p.onGround || p.vy < -0.000001 || !direction) return null;

    const contactActorX = Number.isFinite(Number(collision.x))
        ? Number(collision.x)
        : Number(collision.contactX) - direction * p.width * 0.5;
    const footOrigin = groundStrideFootOrigin(state, collision, contactActorX, direction);
    const maximumReach = playerAutomaticStepHeight(p);

    // A disconnected standable line can itself be the thing that stopped the
    // leading foot even though it has no authored riser. In that case the
    // exposed endpoint must be inside the same fixed reach circle. This is a
    // reach check on the actual contact geometry, not a riser classification.
    if (collision.source === "segmentEndpoint") {
        const target = findWorldSegmentById(state, collision.id);
        if (target) {
            const a = { x: Number(target.x1), y: Number(target.y1) };
            const b = { x: Number(target.x2), y: Number(target.y2) };
            const endpoint = direction > 0 ? (a.x <= b.x ? a : b) : (a.x >= b.x ? a : b);
            if (Math.hypot(endpoint.x - footOrigin.x, endpoint.y - footOrigin.y) > maximumReach + 0.05) return null;
        }
    }

    // The grounded discontinuity detector is the only trigger. Once blocked, query
    // the player hitbox at that exact contact pose expanded by the complete
    // automatic-step reach, then include every authored collision line owned by
    // each overlapping atlas placement. The obstacle that triggered the sweep
    // has no privileged "riser" or "upper endpoint" role.
    const contactBounds = {
        minX: contactActorX - p.width * 0.5,
        minY: footOrigin.y - p.height,
        maxX: contactActorX + p.width * 0.5,
        maxY: footOrigin.y
    };
    const strideCandidateBounds = {
        minX: contactBounds.minX - maximumReach,
        minY: contactBounds.minY - maximumReach,
        maxX: contactBounds.maxX + maximumReach,
        maxY: contactBounds.maxY + maximumReach
    };
    const candidateEdges = groundStrideCandidateEdges(state, strideCandidateBounds);
    const sweepResult = groundStrideSweepFootholdFromCandidates(candidateEdges, footOrigin, maximumReach, direction, Math.min(maximumReach, 0.05));
    if (!sweepResult?.foothold || !sweepResult?.targetSupport) return null;

    const foothold = sweepResult.foothold;
    const targetSupport = sweepResult.targetSupport;
    if ((foothold.x - footOrigin.x) * direction < Math.min(maximumReach, 0.05) - 0.000001) return null;

    const triggerClearance = groundStrideTriggerClearancePoint(candidateEdges, collision, footOrigin, maximumReach);
    const clearancePoint = {
        x: footOrigin.x,
        y: Math.min(footOrigin.y, foothold.y, sweepResult.clearancePoint?.y ?? footOrigin.y, triggerClearance?.y ?? footOrigin.y)
    };

    const startX = footOrigin.x - direction * p.width * 0.5;
    const startY = footOrigin.y;
    const cornerX = clearancePoint.x - direction * p.width * 0.5;
    const cornerY = clearancePoint.y;
    const targetX = foothold.x - direction * p.width * 0.5;
    const targetY = foothold.y;
    if ((targetX - startX) * direction < Math.min(maximumReach, 0.05) - 0.000001) return null;

    const cornerDistance = Math.hypot(cornerX - startX, cornerY - startY);
    const landingDistance = Math.hypot(targetX - cornerX, targetY - cornerY);
    const length = cornerDistance + landingDistance;
    if (!Number.isFinite(length) || length <= 0.0001 || !Number.isFinite(cornerDistance)) return null;

    const path = {
        footOrigin,
        clearancePoint,
        foothold,
        start: { x: startX, y: startY },
        corner: { x: cornerX, y: cornerY },
        target: { x: targetX, y: targetY },
        targetSupport,
        candidateEdges
    };
    if (groundStrideBodyPathBlocked(state, path)) return null;

    return {
        active: true,
        direction,
        startX,
        startY,
        cornerX,
        cornerY,
        cornerDistance,
        targetX,
        targetY,
        footStartX: footOrigin.x,
        footStartY: footOrigin.y,
        footholdX: foothold.x,
        footholdY: foothold.y,
        strideProgress: 0,
        strideLength: length,
        targetSupportId: targetSupport.id || null,
        targetSupportKind: targetSupport.kind || "blockable",
        targetSupportSource: targetSupport.source || collision.source,
        // Retained for recording/debug schema compatibility. It identifies the
        // ordinary horizontal blocker that triggered the geometric stride; the
        // planner no longer treats it as a riser or excludes it from geometry.
        riserId: collision.id || null
    };
}

function advancePlayerGroundStride(state, distanceThisFrame) {
    const p = state.player;
    const stride = p.groundStride;
    if (!stride?.active) return { handled: false, remaining: distanceThisFrame };
    const direction = Math.sign(distanceThisFrame);
    if ((!direction && Math.abs(distanceThisFrame) > 0.000001) || (direction && direction !== stride.direction) || !p.onGround || p.vy < -0.000001) {
        p.groundStride = null;
        return { handled: false, remaining: distanceThisFrame };
    }
    if (!direction) return { handled: true, remaining: 0 };

    const budget = Math.abs(distanceThisFrame);
    const previousProgress = Math.max(0, Number(stride.strideProgress) || 0);
    const nextProgress = Math.min(stride.strideLength, previousProgress + budget);
    const cornerDistance = clamp(Number(stride.cornerDistance) || 0, 0, stride.strideLength);
    if (cornerDistance > 0.000001 && nextProgress < cornerDistance) {
        const fraction = nextProgress / cornerDistance;
        p.currentTransform.x = stride.startX + (stride.cornerX - stride.startX) * fraction;
        p.currentTransform.y = stride.startY + (stride.cornerY - stride.startY) * fraction;
    } else {
        const landingLength = Math.max(0.000001, stride.strideLength - cornerDistance);
        const fraction = clamp((nextProgress - cornerDistance) / landingLength, 0, 1);
        p.currentTransform.x = stride.cornerX + (stride.targetX - stride.cornerX) * fraction;
        p.currentTransform.y = stride.cornerY + (stride.targetY - stride.cornerY) * fraction;
    }
    p.vy = 0;
    p.onGround = true;
    p.ordinaryJumpActive = false;
    stride.strideProgress = nextProgress;
    state.collisions.lastResolution = {
        axis: "ground-stride",
        id: stride.riserId,
        targetSupportId: stride.targetSupportId,
        progress: round(nextProgress),
        length: round(stride.strideLength)
    };

    if (nextProgress + 0.0001 < stride.strideLength) {
        return { handled: true, remaining: 0 };
    }

    const remainingBudget = Math.max(0, budget - (stride.strideLength - previousProgress));
    p.currentTransform.x = stride.targetX;
    p.currentTransform.y = stride.targetY;
    p.supportId = stride.targetSupportId || null;
    p.airBoostArmed = true;
    p.groundStride = null;
    return { handled: true, remaining: direction * remainingBudget };
}

function moveAndCollideX(state, dx) {
    const p = state.player;
    if (dx === 0) {
        if (p.groundStride?.active) p.groundStride = null;
        return false;
    }

    if (p.groundStride?.active) {
        const advanced = advancePlayerGroundStride(state, dx);
        if (advanced.handled) {
            if (Math.abs(advanced.remaining) > 0.000001) {
                moveAndCollideX(state, advanced.remaining);
            }
            return true;
        }
    }

    const previousX = p.currentTransform.x;
    const nextX = previousX + dx;
    if (p.onGround && p.vy >= 0) {
        const strideCollision = findPlayerGroundStrideCollision(state, previousX, nextX);
        if (strideCollision) {
            const stride = planPlayerGroundStride(state, strideCollision, previousX, nextX);
            if (stride) {
                p.groundStride = stride;
                p.currentTransform.x = stride.startX;
                p.currentTransform.y = stride.startY;
                const travelToContact = Math.min(Math.abs(dx), Math.abs(stride.startX - previousX));
                const strideBudget = Math.max(0, Math.abs(dx) - travelToContact) * stride.direction;
                if (Math.abs(strideBudget) <= 0.000001) return true;
                const advanced = advancePlayerGroundStride(state, strideBudget);
                if (advanced.handled && Math.abs(advanced.remaining) > 0.000001) moveAndCollideX(state, advanced.remaining);
                return advanced.handled;
            }
            // A low collision sample is still a real grounded obstruction. If
            // the circle solver cannot find a safe foothold, stop at contact
            // instead of entering the area and relying on depenetration.
            p.currentTransform.x = strideCollision.x;
            p.vx = 0;
            if (strideCollision.side === "right") state.collisions.playerTouching.right = true;
            else state.collisions.playerTouching.left = true;
            state.collisions.lastResolution = {
                axis: "x",
                id: strideCollision.id,
                kind: strideCollision.kind,
                source: strideCollision.source
            };
            return true;
        }
    }
    const collision = findActorHorizontalSweepCollision(state, p, previousX, nextX);
    if (!collision) {
        const wasSupportedByWalkable = currentPlayerSupportIsWalkable(state);
        const supportOptions = {
            ignoreWalkable: (Number(p.dropThroughTimer) || 0) > 0,
            ignoreUncrossedWalkable: true,
            preferredSupportId: p.supportId || "",
            preferWalkable: wasSupportedByWalkable
        };
        const automaticStepHeight = playerAutomaticStepHeight(p);
        let sweptSupport = null;
        if (p.onGround && p.vy >= 0) {
            sweptSupport = findActorSweptGroundSupport(state, p, previousX, p.currentTransform.y, nextX, {
                ...supportOptions,
                maxStepUp: automaticStepHeight,
                maxDrop: automaticStepHeight
            });
        }
        p.currentTransform.x = nextX;
        if (p.onGround && p.vy >= 0) {
            const snappedSupport = findActorGroundSupportAtX(state, p, p.currentTransform.x, p.currentTransform.y, automaticStepHeight, automaticStepHeight, supportOptions);
            const slopeFollow = uppermostSupportCandidate(sweptSupport, snappedSupport);
            if (slopeFollow) {
                landPlayerOn(state, slopeFollow.y, true, slopeFollow.id, slopeFollow.kind);
                state.collisions.lastResolution = {
                    axis: slopeFollow === sweptSupport ? "ground-sweep" : "ground-snap",
                    id: slopeFollow.id,
                    kind: slopeFollow.kind,
                    source: slopeFollow.source,
                    delta: round(slopeFollow.delta)
                };
            }
        }
        return false;
    }

    if (p.onGround && p.vy >= 0) {
        const stride = planPlayerGroundStride(state, collision, previousX, nextX);
        if (stride) {
            p.groundStride = stride;
            p.currentTransform.x = stride.startX;
            p.currentTransform.y = stride.startY;
            const travelToContact = Math.min(Math.abs(dx), Math.abs(stride.startX - previousX));
            const strideBudget = Math.max(0, Math.abs(dx) - travelToContact) * stride.direction;
            if (Math.abs(strideBudget) <= 0.000001) {
                return true;
            }
            const advanced = advancePlayerGroundStride(state, strideBudget);
            if (advanced.handled && Math.abs(advanced.remaining) > 0.000001) {
                moveAndCollideX(state, advanced.remaining);
            }
            return advanced.handled;
        }
    }

    p.currentTransform.x = collision.x;
    p.vx = 0;
    if (collision.side === "right") {
        state.collisions.playerTouching.right = true;
    } else {
        state.collisions.playerTouching.left = true;
    }
    state.collisions.lastResolution = {
        axis: "x",
        id: collision.id,
        kind: collision.kind,
        source: collision.source
    };
    return false;
}

function integratePlayerVerticalMotion(state, input, dt, wasOnGround, doubleGravityHeld = false) {
    const p = state.player;
    const t = state.tuning;
    if (flightPowerUpActive(state) && !p.bodySlamCommitted) {
        applyFlightGovernor(state, input, dt);
        moveAndCollideY(state, p.vy * dt, wasOnGround);
        return;
    }
    const gravity = Math.max(1, Number(t.gravity) || DEFAULT_TUNING.gravity);
    const effectiveGravity = gravity * (doubleGravityHeld ? 2 : 1);
    const initialVy = p.vy;

    if (!p.ordinaryJumpActive || state.equipment.rocket.attachedBoosting) {
        // Down is a true gravity modifier, not a jump-only brake. Holding it
        // doubles downward acceleration during both ascent and descent. The
        // input layer independently grants one-way-platform drop-through, so
        // falling with Down combines faster descent with passage through green
        // walkable lines.
        p.ay = effectiveGravity;
        p.vy += effectiveGravity * dt;
        p.vy = Math.min(p.vy, t.terminalVelocity);
        applyAttachedHoverGovernor(state, dt);
        // Re-test commitment after this tick's acceleration but before collision.
        // Otherwise a fall can cross the damage threshold and land in the same tick
        // without ever observing the valid Down-held committed state.
        updatePlayerBodySlamCommitment(state, input, false);
        moveAndCollideY(state, p.vy * dt, wasOnGround);
        return;
    }

    p.ay = effectiveGravity;
    const finalVy = Math.min(initialVy + effectiveGravity * dt, t.terminalVelocity);
    const crossesApex = initialVy < 0 && finalVy >= 0;

    if (!crossesApex) {
        const effectiveAcceleration = (finalVy - initialVy) / Math.max(0.000001, dt);
        const dy = initialVy * dt + 0.5 * effectiveAcceleration * dt * dt;
        p.vy = finalVy;
        updatePlayerBodySlamCommitment(state, input, false);
        moveAndCollideY(state, dy, wasOnGround);
        return;
    }

    const apexTime = Math.min(dt, Math.max(0, -initialVy / effectiveGravity));
    const apexDisplacement = initialVy * apexTime + 0.5 * effectiveGravity * apexTime * apexTime;
    p.vy = 0;
    moveAndCollideY(state, apexDisplacement, wasOnGround);
    if (!p.ordinaryJumpActive || state.collisions.playerTouching.up) return;

    p.ordinaryJumpApexY = p.currentTransform.y;
    addEvent(state, "PLAYER_JUMP_APEX", {
        x: round(p.currentTransform.x),
        y: round(p.currentTransform.y),
        height: round((Number.isFinite(Number(p.ordinaryJumpStartY)) ? Number(p.ordinaryJumpStartY) : p.currentTransform.y) - p.currentTransform.y),
        configuredHeight: round(t.ordinaryJumpHeight),
        brakedHeight: doubleGravityHeld ? round((Number(t.ordinaryJumpHeight) || DEFAULT_TUNING.ordinaryJumpHeight) * 0.5) : null
    });

    const remaining = Math.max(0, dt - apexTime);
    p.ay = effectiveGravity;
    p.vy = Math.min(effectiveGravity * remaining, t.terminalVelocity);
    updatePlayerBodySlamCommitment(state, input, false);
    if (remaining > 0) {
        moveAndCollideY(state, 0.5 * effectiveGravity * remaining * remaining, false);
    }
}

function moveAndCollideY(state, dy, wasOnGround) {
    const p = state.player;
    const previousY = p.currentTransform.y;
    const nextY = previousY + dy;
    const previousSupportId = p.supportId || "";
    const previousSupportWasWalkable = currentPlayerSupportIsWalkable(state);
    p.onGround = false;
    p.supportId = null;
    const collision = findActorVerticalSweepCollision(state, p, previousY, nextY, {
        ignoreWalkable: (Number(p.dropThroughTimer) || 0) > 0,
        preferredSupportId: previousSupportId,
        preferWalkable: previousSupportWasWalkable
    });
    p.currentTransform.y = collision ? collision.y : nextY;
    if (!collision) {
        return;
    }
    if (collision.ceiling) {
        p.vy = 0;
        p.ordinaryJumpActive = false;
        state.collisions.playerTouching.up = true;
        state.collisions.lastResolution = {
            axis: "y",
            id: collision.id,
            kind: collision.kind,
            source: collision.source,
            ceiling: true
        };
        return;
    }
    landPlayerOn(state, collision.y, wasOnGround, collision.id, collision.kind);
}

function resolvePlayerPenetrations(state, wasOnGround, options = {}) {
    const maxPasses = 8;
    const corrections = [];
    const trackCrush = options.trackCrush !== false;
    const emitRecovery = options.emitRecovery !== false;

    for (let pass = 0; pass < maxPasses; pass += 1) {
        const rect = getPlayerRect(state);
        const blockers = playerPenetrationBlockers(state, rect, options);
        const candidates = blockers.flatMap((blocker) => blocker.candidates);

        if (!candidates.length) {
            if (trackCrush && !movingPlatformLineCrushStillActive(state)) {
                clearPlayerCrushCandidate(state, "noPenetration");
            }
            break;
        }

        candidates.sort((a, b) => {
            const distanceDelta = a.distance - b.distance;
            if (Math.abs(distanceDelta) > 0.000001) {
                return distanceDelta;
            }
            return depenetrationDirectionPriority(state.player, a.direction) -
                depenetrationDirectionPriority(state.player, b.direction);
        });

        const nearestDistance = candidates[0].distance;
        const nearestCandidates = candidates.filter((candidate) => (
            Math.abs(candidate.distance - nearestDistance) <= 0.000001
        ));
        let best = nearestCandidates[0];
        let crushProbe = playerCrushProbeForCandidate(state, rect, best);
        for (const candidate of nearestCandidates) {
            const candidateProbe = playerCrushProbeForCandidate(state, rect, candidate);
            if (!candidateProbe) {
                best = candidate;
                crushProbe = null;
                break;
            }
            if (!crushProbe) {
                best = candidate;
                crushProbe = candidateProbe;
            }
        }

        if (crushProbe) {
            if (trackCrush) return advancePlayerCrushCandidate(state, crushProbe);
            break;
        }

        if (trackCrush) clearPlayerCrushCandidate(state, "safeDepenetration");
        applyPlayerDepenetration(state, best, wasOnGround);
        corrections.push(best);
    }

    if (corrections.length && emitRecovery) {
        const last = corrections[corrections.length - 1];
        addEvent(state, "PLAYER_COLLISION_RECOVERED", {
            passes: corrections.length,
            direction: last.direction,
            distance: round(corrections.reduce((sum, correction) => sum + correction.distance, 0)),
            source: last.source,
            id: last.id,
            kind: last.kind
        });
    }
    return false;
}

function playerWalkableSupportOverride(state) {
    const player = state?.player;
    if (!player?.onGround || !player.supportId) {
        return null;
    }
    const segment = findWorldSegmentById(state, player.supportId);
    if (!segment || segment.kind !== "walkable") {
        return null;
    }
    const supportY = segmentYAtX(segment, player.currentTransform.x);
    if (supportY === null || Math.abs(supportY - player.currentTransform.y) > 6) {
        return null;
    }
    const uppermost = findActorGroundSupportAtX(
        state,
        player,
        player.currentTransform.x,
        supportY,
        playerAutomaticStepHeight(player),
        playerAutomaticStepHeight(player),
        { ignoreWalkable: (Number(player.dropThroughTimer) || 0) > 0, preferredSupportId: player.supportId || "" }
    );
    if (uppermost && uppermost.id !== segment.id && uppermost.y < supportY - 0.1) {
        return null;
    }
    return { segment, point: { x: player.currentTransform.x, y: supportY } };
}

function colliderContainsWalkableSupportPoint(collider, source, support) {
    if (!support?.point || !collider) {
        return false;
    }
    if (source === "solid") {
        return pointInRect(support.point, collider);
    }
    if (source === "polygon") {
        return pointInPolygon(support.point, collider);
    }
    return false;
}

function playerPenetrationBlockers(state, rect, options = {}) {
    const blockers = [];
    const walkableOverride = playerWalkableSupportOverride(state);
    const ignoreMovingPlatformId = String(options.ignoreMovingPlatformId || "");

    for (const solid of queryWorldSolids(state.world, rect)) {
        if (ignoreMovingPlatformId && solid.movingPlatformId === ignoreMovingPlatformId) continue;
        if (!rectsOverlap(rect, solid)) {
            continue;
        }
        if (colliderContainsWalkableSupportPoint(solid, "solid", walkableOverride)) {
            continue;
        }
        const detail = collisionBodyDetail(solid, "solid");
        blockers.push({
            ...detail,
            candidates: rectDepenetrationCandidates(rect, solid, detail)
        });
    }

    for (const polygon of queryWorldCollisionPolygons(state.world, rect)) {
        if (ignoreMovingPlatformId && polygon.movingPlatformId === ignoreMovingPlatformId) continue;
        if (!isAreaBlockingSegmentKind(polygon.kind) || !polygonOverlapsRect(polygon, rect)) {
            continue;
        }
        if (colliderContainsWalkableSupportPoint(polygon, "polygon", walkableOverride)) {
            continue;
        }
        const detail = collisionBodyDetail(polygon, "polygon");
        blockers.push({
            ...detail,
            candidates: polygonDepenetrationCandidates(rect, polygon, detail)
        });
    }

    return blockers;
}

function collisionBodyDetail(collider, source) {
    const movingPlatformId = collider?.movingPlatformId || null;
    const id = collider?.id || `${source}_collision`;
    return {
        id,
        kind: collider?.kind || (source === "solid" ? "solid" : "blockable"),
        source,
        movingPlatformId,
        bodyKey: movingPlatformId ? `platform:${movingPlatformId}` : `${source}:${id}`
    };
}

function playerCrushProbeForCandidate(state, rect, candidate) {
    const translatedRect = translateRect(rect, candidate.dx, candidate.dy);
    const direction = {
        x: candidate.dx === 0 ? 0 : Math.sign(candidate.dx),
        y: candidate.dy === 0 ? 0 : Math.sign(candidate.dy)
    };
    const obstructions = playerBlockingBodiesAtRect(state, translatedRect, direction);
    const sourceBody = {
        bodyKey: candidate.bodyKey,
        id: candidate.id,
        source: candidate.source,
        movingPlatformId: candidate.movingPlatformId || null
    };

    for (const obstruction of obstructions) {
        if (obstruction.bodyKey === sourceBody.bodyKey) {
            continue;
        }
        const samplePoint = {
            x: translatedRect.x + translatedRect.w * 0.5,
            y: translatedRect.y + translatedRect.h * 0.5
        };
        const sourceDelta = collisionBodyMovementDelta(state, sourceBody, samplePoint);
        const obstructionDelta = collisionBodyMovementDelta(state, obstruction, samplePoint);
        const closingDistance =
            (sourceDelta.x - obstructionDelta.x) * direction.x +
            (sourceDelta.y - obstructionDelta.y) * direction.y;
        const epsilon = Math.max(0, Number(state.tuning.playerCrushClosingDistanceEpsilon) || 0);
        if (closingDistance <= epsilon) {
            continue;
        }

        const bodyKeys = [sourceBody.bodyKey, obstruction.bodyKey].sort();
        const axis = direction.x !== 0 ? "x" : "y";
        return {
            key: `${bodyKeys[0]}|${bodyKeys[1]}|${axis}`,
            axis,
            direction: candidate.direction,
            distance: candidate.distance,
            closingDistance,
            sourceId: sourceBody.id,
            sourceType: sourceBody.source,
            sourcePlatformId: sourceBody.movingPlatformId,
            obstructionId: obstruction.id,
            obstructionType: obstruction.source,
            obstructionPlatformId: obstruction.movingPlatformId || null
        };
    }
    return null;
}

function playerBlockingBodiesAtRect(state, rect, direction) {
    const bodies = [];
    const seen = new Set();
    const add = (detail) => {
        if (!detail?.bodyKey || seen.has(detail.bodyKey)) {
            return;
        }
        seen.add(detail.bodyKey);
        bodies.push(detail);
    };

    for (const solid of queryWorldSolids(state.world, rect)) {
        if (rectsOverlap(rect, solid)) {
            add(collisionBodyDetail(solid, "solid"));
        }
    }
    for (const polygon of queryWorldCollisionPolygons(state.world, rect)) {
        if (isAreaBlockingSegmentKind(polygon.kind) && polygonOverlapsRect(polygon, rect)) {
            add(collisionBodyDetail(polygon, "polygon"));
        }
    }
    for (const segment of queryWorldSegments(state.world, rect)) {
        if (!isSolidSegmentKind(segment.kind)) {
            continue;
        }
        const intersects = Boolean(segmentRectIntersection(
            { x: segment.x1, y: segment.y1 },
            { x: segment.x2, y: segment.y2 },
            rect
        ));
        const isSupport = direction.y > 0 && segment.id === state.player.supportId;
        if (intersects || isSupport) {
            add(collisionBodyDetail(segment, "segment"));
        }
    }
    return bodies;
}

function collisionBodyMovementDelta(state, body, samplePoint = null) {
    if (!body?.movingPlatformId) {
        return { x: 0, y: 0 };
    }
    const platform = (state.world.movingPlatforms || []).find((item) => item.id === body.movingPlatformId);
    if (!platform || platform.collisionAttached === false) {
        return { x: 0, y: 0 };
    }
    if (platform.movement?.motionType === "swing" && samplePoint && Number.isFinite(samplePoint.x) && Number.isFinite(samplePoint.y)) {
        const deltaRadians = ((Number(platform.currentSwingAngle) || 0) - (Number(platform.previousSwingAngle) || 0)) * Math.PI / 180;
        if (Math.abs(deltaRadians) > 0.000000001) {
            const previousPoint = rotatePointAroundMovingPlatformPivot(samplePoint.x, samplePoint.y, platform, -deltaRadians);
            return { x: samplePoint.x - previousPoint.x, y: samplePoint.y - previousPoint.y };
        }
    }
    return {
        x: Number(platform.lastDeltaX) || 0,
        y: Number(platform.lastDeltaY) || 0
    };
}

function advancePlayerCrushCandidate(state, probe) {
    const player = state.player;
    const sameCandidate = player.crushCandidateKey === probe.key;
    player.crushCandidateTicks = sameCandidate
        ? Math.max(0, Number(player.crushCandidateTicks) || 0) + 1
        : 1;
    player.crushCandidateKey = probe.key;
    player.crushCandidateDetail = deepClone(probe);

    if (player.crushCandidateTicks === 2) {
        addEvent(state, "PLAYER_CRUSH_WARNING", {
            consecutiveTicks: player.crushCandidateTicks,
            ...probe
        });
    }

    const confirmTicks = Math.max(1, Math.round(Number(state.tuning.playerCrushConfirmTicks) || 3));
    if (player.crushCandidateTicks < confirmTicks) {
        return false;
    }

    triggerPlayerCrushDeath(state, probe);
    return true;
}

function clearPlayerCrushCandidate(state, reason) {
    const player = state.player;
    const previousTicks = Math.max(0, Number(player.crushCandidateTicks) || 0);
    if (previousTicks >= 2) {
        addEvent(state, "PLAYER_CRUSH_NEAR_MISS", {
            consecutiveTicks: previousTicks,
            reason,
            ...(player.crushCandidateDetail || {})
        });
    }
    player.crushCandidateTicks = 0;
    player.crushCandidateKey = null;
    player.crushCandidateDetail = null;
}

function triggerPlayerCrushDeath(state, probe) {
    const player = state.player;
    if (playerDeathActive(state)) {
        return;
    }

    addEvent(state, "PLAYER_CRUSHED", {
        consecutiveTicks: player.crushCandidateTicks,
        x: round(player.currentTransform.x),
        y: round(player.currentTransform.y),
        ...probe
    });
    triggerPlayerDeath(state, {
        sourceId: "crushingPlatform",
        resetReason: "crushed",
        cause: "crushed"
    });
}

function triggerPlayerDeath(state, options = {}) {
    const player = state.player;
    if (!player || playerDeathActive(state)) {
        return false;
    }

    const sourceId = options.sourceId || "unknown";
    const resetReason = options.resetReason || "defeated";
    const cause = options.cause || "healthDepleted";
    detachPlayerFromMovingPlatformSupport(state);
    stopAttachedBoost(state, cause);
    clearPlayerLungeState(state);
    player.bodySlamCommitted = false;
    player.bodySlamImmunityTimer = 0;
    state.health.amount = 0;
    state.health.regenerating = false;
    state.health.invulnerabilityTimer = 0;
    state.health.contactInvulnerabilityTimer = 0;
    player.vx = 0;
    player.vy = 0;
    player.ax = 0;
    player.ay = 0;
    player.visible = true;
    player.combatState = "dead";
    player.targetable = false;
    player.deathPhase = "cover";
    player.deathPhaseTimer = Math.max(FIXED_DT, Number(state.tuning.playerDeathCoverSeconds) || 0.42);
    player.deathElapsed = 0;
    player.deathSourceId = sourceId;
    player.deathResetReason = resetReason;
    respawnDeathEligiblePickups(state);
    removePlayerDeathCoverSparks(state);
    emitPlayerDeathCoverSparks(state);

    addEvent(state, "PLAYER_DEATH_ANIMATION_STARTED", {
        sourceId,
        cause,
        phase: "cover",
        x: round(player.currentTransform.x),
        y: round(player.currentTransform.y)
    });
    addEvent(state, "PLAYER_DEFEATED", { sourceId, cause });
    return true;
}

function removePlayerDeathCoverSparks(state) {
    if (!Array.isArray(state.effects?.smokePuffs)) {
        return;
    }
    state.effects.smokePuffs = state.effects.smokePuffs.filter((puff) => puff.kind !== "wizardDeathCoverSpark");
}

function emitPlayerDeathCoverSparks(state) {
    const player = state.player;
    const particleScale = renderingParticleScale(state.settings);
    const authoredCount = Math.max(1, Math.round(Number(state.tuning.playerDeathCoverParticleCount) || 72));
    const count = Math.max(30, Math.round(authoredCount * particleScale));
    const centerX = player.currentTransform.x;
    const centerY = player.currentTransform.y - player.height * 0.52;
    const coverSeconds = Math.max(FIXED_DT, Number(state.tuning.playerDeathCoverSeconds) || 0.42);

    for (let i = 0; i < count; i += 1) {
        const seed = state.clock.tick * 211 + i * 151 + Math.floor(centerX * 7 + centerY * 11);
        addSmokePuff(state, {
            kind: "wizardDeathCoverSpark",
            x: centerX + (hash01(seed + 17) - 0.5) * player.width * 1.05,
            y: centerY + (hash01(seed + 37) - 0.5) * player.height * 0.98,
            lifetime: coverSeconds + 0.08,
            radius: 2.8 + hash01(seed + 59) * 4.8,
            colorIndex: i % 3,
            rotation: hash01(seed + 79) * Math.PI * 2,
            spin: (hash01(seed + 97) - 0.5) * 8,
            delay: hash01(seed + 113) * coverSeconds * 0.68
        });
    }
}

function emitPlayerDeathBurst(state) {
    const player = state.player;
    const particleScale = renderingParticleScale(state.settings);
    const authoredCount = Math.max(1, Math.round(Number(state.tuning.playerDeathBurstParticleCount) || 64));
    const count = Math.max(28, Math.round(authoredCount * particleScale));
    const centerX = player.currentTransform.x;
    const centerY = player.currentTransform.y - player.height * 0.52;

    for (let i = 0; i < count; i += 1) {
        const seed = state.clock.tick * 193 + i * 137 + Math.floor(centerX * 7 + centerY * 11);
        const offsetX = (hash01(seed + 61) - 0.5) * player.width * 0.9;
        const offsetY = (hash01(seed + 83) - 0.5) * player.height * 0.9;
        const outwardAngle = Math.atan2(offsetY, offsetX || 0.001);
        const angle = outwardAngle + (hash01(seed + 19) - 0.5) * 1.1;
        const speed = (180 + hash01(seed + 29) * 470) * 0.75;
        const radialScale = 0.72 + hash01(seed + 47) * 0.55;
        addSmokePuff(state, {
            kind: "wizardDeathBurstParticle",
            x: centerX + offsetX,
            y: centerY + offsetY,
            vx: Math.cos(angle) * speed * radialScale,
            vy: Math.sin(angle) * speed - 75,
            gravity: 720 + hash01(seed + 101) * 300,
            lifetime: (0.54 + hash01(seed + 127) * 0.58) * 0.5,
            radius: 2.5 + hash01(seed + 149) * 5.1,
            colorIndex: i % 3,
            rotation: hash01(seed + 173) * Math.PI * 2,
            spin: (hash01(seed + 197) - 0.5) * 20
        });
    }
}

function rectDepenetrationCandidates(rect, solid, detail) {
    const separation = 0.02;
    return [
        depenetrationCandidate("left", solid.x - (rect.x + rect.w) - separation, 0, detail),
        depenetrationCandidate("right", solid.x + solid.w - rect.x + separation, 0, detail),
        depenetrationCandidate("up", 0, solid.y - (rect.y + rect.h) - separation, detail),
        depenetrationCandidate("down", 0, solid.y + solid.h - rect.y + separation, detail)
    ];
}

function polygonDepenetrationCandidates(rect, polygon, detail = null) {
    const bounds = polygonBounds(polygon);
    if (!bounds) {
        return [];
    }

    const collisionDetail = detail || collisionBodyDetail(polygon, "polygon");
    const separation = 0.02;
    const limits = {
        left: Math.max(0, rect.x + rect.w - bounds.minX) + 2,
        right: Math.max(0, bounds.maxX - rect.x) + 2,
        up: Math.max(0, rect.y + rect.h - bounds.minY) + 2,
        down: Math.max(0, bounds.maxY - rect.y) + 2
    };

    return [
        depenetrationCandidate("left", -findPolygonExitDistance(polygon, rect, -1, 0, limits.left) - separation, 0, collisionDetail),
        depenetrationCandidate("right", findPolygonExitDistance(polygon, rect, 1, 0, limits.right) + separation, 0, collisionDetail),
        depenetrationCandidate("up", 0, -findPolygonExitDistance(polygon, rect, 0, -1, limits.up) - separation, collisionDetail),
        depenetrationCandidate("down", 0, findPolygonExitDistance(polygon, rect, 0, 1, limits.down) + separation, collisionDetail)
    ];
}

function depenetrationCandidate(direction, dx, dy, detail) {
    return {
        direction,
        dx,
        dy,
        distance: Math.abs(dx) + Math.abs(dy),
        ...detail
    };
}

function depenetrationDirectionPriority(player, direction) {
    if (direction === "left" && player.vx > 0) return 0;
    if (direction === "right" && player.vx < 0) return 0;
    if (direction === "up" && player.vy > 0) return 0;
    if (direction === "down" && player.vy < 0) return 0;
    if (direction === "up") return 1;
    if (direction === "down") return 2;
    return 3;
}

function findPolygonExitDistance(polygon, rect, stepX, stepY, maxDistance) {
    if (!(maxDistance > 0)) {
        return 0;
    }

    const scanStep = 1;
    let previousDistance = 0;
    for (let distance = Math.min(scanStep, maxDistance); distance <= maxDistance + 0.000001; distance = Math.min(distance + scanStep, maxDistance)) {
        const moved = translateRect(rect, stepX * distance, stepY * distance);
        if (!polygonOverlapsRect(polygon, moved)) {
            let low = previousDistance;
            let high = distance;
            for (let iteration = 0; iteration < 12; iteration += 1) {
                const middle = (low + high) * 0.5;
                if (polygonOverlapsRect(polygon, translateRect(rect, stepX * middle, stepY * middle))) {
                    low = middle;
                } else {
                    high = middle;
                }
            }
            return high;
        }
        if (distance >= maxDistance) {
            break;
        }
        previousDistance = distance;
    }
    return maxDistance;
}

function polygonBounds(polygon) {
    const points = polygon.points || [];
    if (points.length < 3) {
        return null;
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const point of points) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
    }
    return { minX, minY, maxX, maxY };
}

function translateRect(rect, dx, dy) {
    return {
        x: rect.x + dx,
        y: rect.y + dy,
        w: rect.w,
        h: rect.h
    };
}

function polygonOverlapsRect(polygon, rect) {
    const inset = 0.05;
    const innerRect = {
        x: rect.x + inset,
        y: rect.y + inset,
        w: rect.w - inset * 2,
        h: rect.h - inset * 2
    };
    if (innerRect.w <= 0 || innerRect.h <= 0) {
        return false;
    }

    const corners = [
        { x: innerRect.x, y: innerRect.y },
        { x: innerRect.x + innerRect.w, y: innerRect.y },
        { x: innerRect.x + innerRect.w, y: innerRect.y + innerRect.h },
        { x: innerRect.x, y: innerRect.y + innerRect.h }
    ];
    if (corners.some((corner) => pointInPolygon(corner, polygon))) {
        return true;
    }

    const points = polygon.points || [];
    if (points.some((point) => pointInRect(point, innerRect))) {
        return true;
    }

    for (let i = 0; i < points.length; i += 1) {
        if (segmentRectIntersection(points[i], points[(i + 1) % points.length], innerRect)) {
            return true;
        }
    }
    return false;
}

function applyPlayerDepenetration(state, correction, wasOnGround) {
    const p = state.player;
    p.currentTransform.x += correction.dx;
    p.currentTransform.y += correction.dy;

    if (correction.direction === "left") {
        if (p.vx > 0) p.vx = 0;
        state.collisions.playerTouching.right = true;
    } else if (correction.direction === "right") {
        if (p.vx < 0) p.vx = 0;
        state.collisions.playerTouching.left = true;
    } else if (correction.direction === "up") {
        if (p.vy >= 0) {
            landPlayerOn(state, p.currentTransform.y, wasOnGround, correction.id, correction.kind);
        } else {
            state.collisions.playerTouching.down = true;
        }
    } else if (correction.direction === "down") {
        if (p.vy < 0) p.vy = 0;
        p.onGround = false;
        state.collisions.playerTouching.up = true;
    }

    state.collisions.lastResolution = {
        axis: "depenetration",
        direction: correction.direction,
        distance: correction.distance,
        source: correction.source,
        id: correction.id,
        kind: correction.kind
    };
}

function resolveSegmentYCollisions(state, previousY, dy, wasOnGround) {
    if (!Array.isArray(state.world.segments) || state.world.segments.length === 0 || dy === 0) {
        return;
    }

    const p = state.player;
    const samples = [
        p.currentTransform.x,
        p.currentTransform.x - p.width * 0.42,
        p.currentTransform.x + p.width * 0.42
    ];
    const skin = 3;
    const collisionQueryBounds = {
        minX: Math.min(...samples) - skin,
        minY: Math.min(previousY - p.height, p.currentTransform.y - p.height, previousY, p.currentTransform.y) - skin,
        maxX: Math.max(...samples) + skin,
        maxY: Math.max(previousY - p.height, p.currentTransform.y - p.height, previousY, p.currentTransform.y) + skin
    };
    let best = null;

    for (const segment of queryWorldSegments(state.world, collisionQueryBounds)) {
        if (!isSolidSegmentKind(segment.kind)) {
            continue;
        }
        if (Math.abs(segment.x2 - segment.x1) < 0.001) {
            continue;
        }

        for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
            const x = samples[sampleIndex];
            const y = segmentYAtX(segment, x);
            if (y === null) {
                continue;
            }

            if (dy > 0) {
                if (previousY <= y + skin && p.currentTransform.y >= y - skin) {
                    if (!best || y < best.y) {
                        best = { y, segment };
                    }
                }
            } else if (dy < 0 && segment.kind !== "walkable") {
                const previousTop = previousY - p.height;
                const currentTop = p.currentTransform.y - p.height;
                if (previousTop >= y - skin && currentTop <= y + skin) {
                    if (!best || y > best.y) {
                        best = { y, segment, ceiling: true };
                    }
                }
            }
        }
    }

    if (!best) {
        return;
    }

    if (best.ceiling) {
        p.currentTransform.y = best.y + p.height;
        p.vy = 0;
        state.collisions.playerTouching.up = true;
        state.collisions.lastResolution = { axis: "y", segmentId: best.segment.id, kind: best.segment.kind };
        return;
    }

    landPlayerOn(state, best.y, wasOnGround, best.segment.id, best.segment.kind);
}

function resolveSegmentXCollisions(state, previousX, dx) {
    if (!Array.isArray(state.world.segments) || state.world.segments.length === 0 || dx === 0) {
        return;
    }

    const p = state.player;
    const previousLeft = previousX - p.width / 2;
    const previousRight = previousX + p.width / 2;
    const currentLeft = p.currentTransform.x - p.width / 2;
    const currentRight = p.currentTransform.x + p.width / 2;
    const ySamples = [
        p.currentTransform.y - p.height * 0.84,
        p.currentTransform.y - p.height * 0.50,
        p.currentTransform.y - p.height * 0.16
    ];
    const skin = 3;
    const collisionQueryBounds = {
        minX: Math.min(previousLeft, currentLeft) - skin,
        minY: Math.min(...ySamples) - skin,
        maxX: Math.max(previousRight, currentRight) + skin,
        maxY: Math.max(...ySamples) + skin
    };
    let best = null;

    for (const segment of queryWorldSegments(state.world, collisionQueryBounds)) {
        if (segment.kind === "walkable") {
            continue;
        }
        // Shallow ledge tops are resolved by vertical landing/ceiling checks. Treat only
        // steep sides as horizontal blockers, otherwise a top slope can behave like an
        // invisible wall while running across it.
        if (Math.abs(segment.y2 - segment.y1) <= Math.abs(segment.x2 - segment.x1) * 0.75) {
            continue;
        }

        for (const y of ySamples) {
            const x = segmentXAtY(segment, y);
            if (x === null) {
                continue;
            }
            if (dx > 0 && previousRight <= x + skin && currentRight >= x - skin) {
                if (!best || x < best.x) {
                    best = { x, segment, side: "right" };
                }
            } else if (dx < 0 && previousLeft >= x - skin && currentLeft <= x + skin) {
                if (!best || x > best.x) {
                    best = { x, segment, side: "left" };
                }
            }
        }
    }

    if (!best) {
        return;
    }

    if (best.side === "right") {
        p.currentTransform.x = best.x - p.width / 2;
        state.collisions.playerTouching.right = true;
    } else {
        p.currentTransform.x = best.x + p.width / 2;
        state.collisions.playerTouching.left = true;
    }
    p.vx = 0;
    state.collisions.lastResolution = { axis: "x", segmentId: best.segment.id, kind: best.segment.kind };
}


function resolvePolygonYCollisions(state, previousY, dy, wasOnGround) {
    if (!Array.isArray(state.world.collisionPolygons) || state.world.collisionPolygons.length === 0 || dy === 0) {
        return;
    }

    const p = state.player;
    const samples = [
        p.currentTransform.x,
        p.currentTransform.x - p.width * 0.42,
        p.currentTransform.x + p.width * 0.42
    ];
    const previousTop = previousY - p.height;
    const currentTop = p.currentTransform.y - p.height;
    const skin = 3;
    const collisionQueryBounds = {
        minX: Math.min(...samples) - skin,
        minY: Math.min(previousTop, currentTop, previousY, p.currentTransform.y) - skin,
        maxX: Math.max(...samples) + skin,
        maxY: Math.max(previousTop, currentTop, previousY, p.currentTransform.y) + skin
    };
    let best = null;

    for (const polygon of queryWorldCollisionPolygons(state.world, collisionQueryBounds)) {
        if (!isAreaBlockingSegmentKind(polygon.kind)) {
            continue;
        }
        for (const x of samples) {
            const intervals = polygonYIntervalsAtX(polygon, x);
            for (const interval of intervals) {
                if (dy > 0) {
                    const y = interval[0];
                    if (previousY <= y + skin && p.currentTransform.y >= y - skin) {
                        if (!best || y < best.y) {
                            best = { y, polygon };
                        }
                    }
                } else if (dy < 0) {
                    const y = interval[1];
                    if (previousTop >= y - skin && currentTop <= y + skin) {
                        if (!best || y > best.y) {
                            best = { y, polygon, ceiling: true };
                        }
                    }
                }
            }
        }
    }

    if (!best) {
        return;
    }

    if (best.ceiling) {
        p.currentTransform.y = best.y + p.height;
        p.vy = 0;
        state.collisions.playerTouching.up = true;
        state.collisions.lastResolution = { axis: "y", polygonId: best.polygon.id, kind: best.polygon.kind };
        return;
    }

    landPlayerOn(state, best.y, wasOnGround, best.polygon.id, best.polygon.kind);
}

function resolvePolygonXCollisions(state, previousX, dx) {
    if (!Array.isArray(state.world.collisionPolygons) || state.world.collisionPolygons.length === 0 || dx === 0) {
        return;
    }

    const p = state.player;
    const previousLeft = previousX - p.width / 2;
    const previousRight = previousX + p.width / 2;
    const currentLeft = p.currentTransform.x - p.width / 2;
    const currentRight = p.currentTransform.x + p.width / 2;
    const ySamples = [
        p.currentTransform.y - p.height * 0.84,
        p.currentTransform.y - p.height * 0.50,
        p.currentTransform.y - p.height * 0.16
    ];
    const skin = 3;
    const collisionQueryBounds = {
        minX: Math.min(previousLeft, currentLeft) - skin,
        minY: Math.min(...ySamples) - skin,
        maxX: Math.max(previousRight, currentRight) + skin,
        maxY: Math.max(...ySamples) + skin
    };
    let best = null;

    for (const polygon of queryWorldCollisionPolygons(state.world, collisionQueryBounds)) {
        if (!isAreaBlockingSegmentKind(polygon.kind)) {
            continue;
        }
        for (const y of ySamples) {
            const intervals = polygonXIntervalsAtY(polygon, y);
            for (const interval of intervals) {
                if (dx > 0) {
                    const x = interval[0];
                    if (previousRight <= x + skin && currentRight >= x - skin) {
                        if (!best || x < best.x) {
                            best = { x, polygon, side: "right" };
                        }
                    }
                } else if (dx < 0) {
                    const x = interval[1];
                    if (previousLeft >= x - skin && currentLeft <= x + skin) {
                        if (!best || x > best.x) {
                            best = { x, polygon, side: "left" };
                        }
                    }
                }
            }
        }
    }

    if (!best) {
        return;
    }

    if (best.side === "right") {
        p.currentTransform.x = best.x - p.width / 2;
        state.collisions.playerTouching.right = true;
    } else {
        p.currentTransform.x = best.x + p.width / 2;
        state.collisions.playerTouching.left = true;
    }
    p.vx = 0;
    state.collisions.lastResolution = { axis: "x", polygonId: best.polygon.id, kind: best.polygon.kind };
}

function polygonXIntervalsAtY(polygon, y) {
    const intersections = [];
    const points = polygon.points || [];
    for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        if ((a.y > y) === (b.y > y)) {
            continue;
        }
        const t = (y - a.y) / (b.y - a.y);
        intersections.push(a.x + (b.x - a.x) * t);
    }
    intersections.sort((a, b) => a - b);
    const intervals = [];
    for (let i = 0; i + 1 < intersections.length; i += 2) {
        intervals.push([intersections[i], intersections[i + 1]]);
    }
    return intervals;
}

function polygonYIntervalsAtX(polygon, x) {
    const intersections = [];
    const points = polygon.points || [];
    for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        if ((a.x > x) === (b.x > x)) {
            continue;
        }
        const t = (x - a.x) / (b.x - a.x);
        intersections.push(a.y + (b.y - a.y) * t);
    }
    intersections.sort((a, b) => a - b);
    const intervals = [];
    for (let i = 0; i + 1 < intersections.length; i += 2) {
        intervals.push([intersections[i], intersections[i + 1]]);
    }
    return intervals;
}


function applyWaterDrag(velocity, submersion, linearDrag, quadraticDrag, dt) {
    const immersed = clamp(Number(submersion) || 0, 0, 1);
    if (immersed <= 0 || Math.abs(velocity) <= 0.000001) {
        return velocity;
    }
    const coefficient = immersed * (
        Math.max(0, Number(linearDrag) || 0) +
        Math.max(0, Number(quadraticDrag) || 0) * Math.abs(velocity)
    );
    return velocity / (1 + coefficient * Math.max(0, Number(dt) || 0));
}

function actorWaterImmersion(state, actor) {
    if (!state?.world || !actor) {
        return { inWater: false, submersion: 0, regionId: null, surfaceY: null };
    }
    const transform = currentTransformOf(actor);
    const width = Math.max(1, Number(actor.width) || 1);
    const height = Math.max(1, Number(actor.height) || 1);
    const top = Number(transform.y) - height;
    const bottom = Number(transform.y);
    const samples = [
        Number(transform.x),
        Number(transform.x) - width * 0.36,
        Number(transform.x) + width * 0.36
    ];
    const bounds = {
        minX: Math.min(...samples),
        minY: top,
        maxX: Math.max(...samples),
        maxY: bottom
    };
    let totalOverlap = 0;
    let primaryOverlap = 0;
    let regionId = null;
    let surfaceY = null;

    for (const polygon of queryWorldCollisionPolygons(state.world, bounds)) {
        if (polygon?.kind !== "water") {
            continue;
        }
        let polygonOverlap = 0;
        let polygonSurface = null;
        for (const x of samples) {
            for (const interval of polygonYIntervalsAtX(polygon, x)) {
                const overlap = Math.max(0, Math.min(bottom, interval[1]) - Math.max(top, interval[0]));
                if (overlap <= 0) {
                    continue;
                }
                polygonOverlap += overlap;
                polygonSurface = polygonSurface === null ? interval[0] : Math.min(polygonSurface, interval[0]);
            }
        }
        totalOverlap += polygonOverlap;
        if (polygonOverlap > primaryOverlap) {
            primaryOverlap = polygonOverlap;
            regionId = polygon.id || null;
            surfaceY = polygonSurface;
        }
    }

    const submersion = clamp(totalOverlap / (height * samples.length), 0, 1);
    return {
        inWater: submersion > 0.0001,
        submersion,
        regionId,
        surfaceY
    };
}

function refreshPlayerWaterState(state, options = {}) {
    const previous = Boolean(state.player?.inWater);
    const immersion = actorWaterImmersion(state, state.player);
    state.player.inWater = immersion.inWater;
    state.player.waterSubmersion = immersion.submersion;
    state.player.waterRegionId = immersion.regionId;
    if (options.emitEvents !== false && immersion.inWater !== previous) {
        addEvent(state, immersion.inWater ? "PLAYER_ENTERED_WATER" : "PLAYER_LEFT_WATER", {
            regionId: immersion.regionId,
            submersion: round(immersion.submersion),
            x: round(state.player.currentTransform.x),
            y: round(state.player.currentTransform.y),
            vy: round(state.player.vy)
        });
    }
    return immersion;
}

function integratePlayerWaterMotion(state, input, dt, wasOnGround, immersion) {
    const p = state.player;
    const t = state.tuning;
    const safeDt = Math.max(0.000001, Number(dt) || FIXED_DT);
    const submersion = clamp(Number(immersion?.submersion) || 0, 0, 1);
    const upIntent = Boolean(input?.jumpHeld || input?.jumpPressed || input?.boostHeld || input?.boostPressed);
    const downIntent = Boolean(input?.dropHeld || input?.dropPressed);
    const verticalInput = (downIntent ? 1 : 0) - (upIntent ? 1 : 0);
    const gravity = Math.max(1, Number(t.gravity) || DEFAULT_TUNING.gravity);
    const buoyancyRatio = clamp(Number(t.waterGravityBuoyancyRatio) || 0, 0, 0.99);
    const acceleration = gravity * (1 - buoyancyRatio * submersion)
        + verticalInput * Math.max(0, Number(t.waterSwimAcceleration) || 0) * submersion;
    const previousVy = p.vy;
    p.vy += acceleration * safeDt;
    p.vy = applyWaterDrag(
        p.vy,
        submersion,
        t.waterLinearDrag,
        t.waterQuadraticDrag,
        safeDt
    );
    p.vy = Math.min(p.vy, t.terminalVelocity);
    p.ay = (p.vy - previousVy) / safeDt;
    p.ordinaryJumpActive = false;
    p.airBoostArmed = false;
    moveAndCollideY(state, p.vy * safeDt, wasOnGround);
}

function landPlayerOn(state, y, wasOnGround, id, kind = "blockable") {
    const p = state.player;
    p.ordinaryJumpActive = false;
    const impactVy = Math.max(0, p.vy || 0);
    p.currentTransform.y = y;
    p.vy = 0;
    p.onGround = true;
    p.supportId = id || null;
    // Being grounded grants the rocket kick. A normal ground jump disarms it
    // until that same Up press has been released, while walking or dropping
    // off support preserves it for the first distinct airborne Up press.
    p.airBoostArmed = true;
    state.collisions.playerTouching.down = true;
    if (state.equipment.rocket.attachedBoosting) {
        stopAttachedBoost(state, "landed");
    }
    state.collisions.lastResolution = { axis: "y", id, kind };
    if (!wasOnGround) {
        const fallDamage = applyFallDamageOnLanding(state, impactVy, id, kind);
        p.vx = approach(p.vx, 0, state.tuning.landingFriction * state.clock.fixedDt);
        addEvent(state, "PLAYER_LANDED", {
            solidId: id,
            kind,
            x: round(p.currentTransform.x),
            y: round(p.currentTransform.y),
            vx: round(p.vx),
            impactVy: round(impactVy),
            fallDamage: round(fallDamage)
        });
    }
}

function triggerPlayerFallImpactExplosion(state) {
    const p = state.player;
    if (!state.playerProgression?.fallImpactExplosionUnlocked) return false;
    if (!p || (Number(p.fallImpactExplosionCooldownTimer) || 0) > 1e-9) return false;

    const redRocket = powerUpEffectDefinition(POWER_UP_EFFECT_IDS.WRENCH_BIGBOMB)?.rocket || {};
    const wizardHeight = Math.max(1, Number(state.tuning.wizardHeight) || Number(p.height) || DEFAULT_TUNING.wizardHeight);
    const damage = Math.max(0, Number(state.tuning.playerFallImpactExplosionDamage) || 0);
    const areaDamageRadius = Math.max(0, Number(redRocket.areaDamageRadiusWizardHeights) || 0) * wizardHeight;
    if (damage <= 0 || areaDamageRadius <= 0) return false;

    const projectileId = `fall_impact_${String(state.weapons.nextProjectileId).padStart(3, "0")}`;
    state.weapons.nextProjectileId += 1;
    const projectile = {
        id: projectileId,
        kind: "fallImpactExplosion",
        owner: "player",
        isRocket: true,
        state: "launched",
        activeSinceTick: state.clock.tick,
        ...createTransformTriplet({
            x: Number(p.currentTransform.x) || 0,
            y: Number(p.currentTransform.y) || 0,
            angle: 0,
            scaleX: Math.max(0.1, Number(redRocket.visualScale) || 1),
            scaleY: Math.max(0.1, Number(redRocket.visualScale) || 1)
        }),
        vx: 0,
        vy: 0,
        age: 0,
        lifetime: 0,
        explosionTimer: 0,
        radius: 15 * Math.max(0.1, Number(redRocket.radiusMultiplier) || 1),
        explosionVisualScale: Math.max(1, Number(redRocket.visualScale) || 1),
        damage,
        areaDamageRadius,
        frameId: "rocket_projectile",
        characterId: "ct_char_wizard_1",
        trail: []
    };
    state.projectiles.push(projectile);
    detonatePlayerProjectile(state, projectile, "fallImpact", { impactKind: "fallImpact" });
    p.fallImpactExplosionCooldownTimer = Math.max(0, Number(state.tuning.playerFallImpactExplosionCooldownSeconds) || 0);
    addEvent(state, "PLAYER_FALL_IMPACT_EXPLOSION", {
        id: projectileId,
        x: round(projectile.currentTransform.x),
        y: round(projectile.currentTransform.y),
        damage: round(damage),
        radius: round(areaDamageRadius),
        cooldown: round(p.fallImpactExplosionCooldownTimer)
    });
    return true;
}

function applyFallDamageOnLanding(state, impactVy, id, kind) {
    const t = state.tuning;
    if (t.fallDamageEnabled === false || impactVy <= 0) {
        finishPlayerBodySlamOnLanding(state);
        return 0;
    }

    const safeImpactSpeed = Math.max(0, t.fallDamageSafeImpactSpeed ?? 0);
    const gravity = Math.max(1, t.gravity ?? DEFAULT_TUNING.gravity);
    const wizardHeight = Math.max(1, t.wizardHeight ?? t.playerHeight ?? DEFAULT_TUNING.wizardHeight);
    const damagePerWizardHeight = Math.max(0, t.fallDamagePerWizardHeight ?? 10);
    const excessImpactEnergy = Math.max(0, impactVy * impactVy - safeImpactSpeed * safeImpactSpeed);
    const excessWizardHeights = excessImpactEnergy / (2 * gravity * wizardHeight);
    const originalDamage = excessWizardHeights * damagePerWizardHeight;

    if (originalDamage <= 0.0001) {
        finishPlayerBodySlamOnLanding(state);
        return 0;
    }

    const fallDamageMultiplier = state.playerProgression?.fallDamageReductionUnlocked
        ? clamp(Number(t.playerFallDamageMultiplier) || 0, 0, 1)
        : 1;
    const damage = originalDamage * fallDamageMultiplier;
    const bodySlamWasCommitted = Boolean(state.player.bodySlamCommitted);
    const result = damagePlayer(state, damage, "fallDamage", { bypassInvulnerability: true });
    const impactExplosionTriggered = bodySlamWasCommitted && triggerPlayerFallImpactExplosion(state);
    finishPlayerBodySlamOnLanding(state);
    addEvent(state, "PLAYER_FALL_DAMAGE", {
        amount: round(result.damage),
        originalAmount: round(originalDamage),
        impactVy: round(impactVy),
        safeImpactSpeed: round(safeImpactSpeed),
        excessWizardHeights: round(excessWizardHeights),
        impactExplosionTriggered,
        solidId: id,
        kind
    });
    return result.damage;
}

function isSolidSegmentKind(kind) {
    return kind === "walkable" || kind === "blockable" || kind === "damaging" || kind === "killable";
}

function isAreaBlockingSegmentKind(kind) {
    return kind === "blockable" || kind === "damaging" || kind === "killable";
}

const SEGMENT_COORDINATE_EPSILON = 0.001;

function segmentYAtX(segment, x) {
    const minX = Math.min(segment.x1, segment.x2) - SEGMENT_COORDINATE_EPSILON;
    const maxX = Math.max(segment.x1, segment.x2) + SEGMENT_COORDINATE_EPSILON;
    if (x < minX || x > maxX) {
        return null;
    }
    const dx = segment.x2 - segment.x1;
    if (Math.abs(dx) < SEGMENT_COORDINATE_EPSILON) {
        return null;
    }
    const t = (x - segment.x1) / dx;
    if (t < -SEGMENT_COORDINATE_EPSILON || t > 1 + SEGMENT_COORDINATE_EPSILON) {
        return null;
    }
    return segment.y1 + (segment.y2 - segment.y1) * t;
}

function segmentXAtY(segment, y) {
    const minY = Math.min(segment.y1, segment.y2) - 0.001;
    const maxY = Math.max(segment.y1, segment.y2) + 0.001;
    if (y < minY || y > maxY) {
        return null;
    }
    const dy = segment.y2 - segment.y1;
    if (Math.abs(dy) < 0.001) {
        return null;
    }
    const t = (y - segment.y1) / dy;
    if (t < -0.001 || t > 1.001) {
        return null;
    }
    return segment.x1 + (segment.x2 - segment.x1) * t;
}

function expandedRect(rect, amount) {
    return {
        x: rect.x - amount,
        y: rect.y - amount,
        w: rect.w + amount * 2,
        h: rect.h + amount * 2
    };
}

function polygonTouchesRect(polygon, rect) {
    const touchRect = expandedRect(rect, 0.25);
    if (polygonOverlapsRect(polygon, touchRect)) {
        return true;
    }
    const points = polygon.points || [];
    for (let i = 0; i < points.length; i += 1) {
        if (segmentRectIntersection(points[i], points[(i + 1) % points.length], touchRect)) {
            return true;
        }
    }
    return false;
}

function recordMovingPlatformSwingHazard(platform, id, kind) {
    if (kind !== "damaging" && kind !== "killable") return;
    const previous = platform.swingHazardContact;
    if (!previous || kind === "killable" || previous.kind !== "killable") {
        platform.swingHazardContact = { id, kind };
    }
}


function movingPlatformPreviousTranslatedSegment(segment, dx, dy) {
    return {
        ...segment,
        x1: segment.x1 - dx,
        y1: segment.y1 - dy,
        x2: segment.x2 - dx,
        y2: segment.y2 - dy
    };
}

function movingPlatformActorRect(actor) {
    return {
        x: actor.currentTransform.x - actor.width * 0.5,
        y: actor.currentTransform.y - actor.height,
        w: actor.width,
        h: actor.height
    };
}

function movingPlatformBlockedLineCrushProbe(state, platform, segment, moveDx, moveDy, beforeX, beforeY) {
    const player = state.player;
    const desiredDistance = Math.hypot(moveDx, moveDy);
    if (desiredDistance <= 0.000001) return null;
    const actualDx = player.currentTransform.x - beforeX;
    const actualDy = player.currentTransform.y - beforeY;
    const directionX = Math.abs(moveDx) >= Math.abs(moveDy) ? Math.sign(moveDx) : 0;
    const directionY = directionX === 0 ? Math.sign(moveDy) : 0;
    const desiredAlong = moveDx * directionX + moveDy * directionY;
    const actualAlong = actualDx * directionX + actualDy * directionY;
    if (desiredAlong <= 0.000001 || actualAlong >= desiredAlong - 0.25) return null;
    const playerRect = getPlayerRect(state);
    if (!segmentRectIntersection(
        { x: segment.x1, y: segment.y1 },
        { x: segment.x2, y: segment.y2 },
        expandedRect(playerRect, 0.25)
    )) return null;

    const resolution = state.collisions?.lastResolution;
    const obstructionId = resolution?.id || "worldCollision";
    const obstructionType = resolution?.source || "world";
    const direction = directionX > 0 ? "right" : directionX < 0 ? "left" : directionY > 0 ? "down" : "up";
    const axis = directionX !== 0 ? "x" : "y";
    const bodyKeys = [`platform:${platform.id}`, `${obstructionType}:${obstructionId}`].sort();
    return {
        key: `${bodyKeys[0]}|${bodyKeys[1]}|${axis}`,
        axis,
        direction,
        distance: Math.max(0, desiredAlong - actualAlong),
        closingDistance: Math.max(0, desiredAlong - actualAlong),
        sourceId: segment.id || "movingPlatformLine",
        sourceType: "segment",
        sourcePlatformId: platform.id,
        obstructionId,
        obstructionType,
        obstructionPlatformId: null
    };
}

function movingPlatformLineCrushStillActive(state) {
    const detail = state.player?.crushCandidateDetail;
    if (!detail || detail.sourceType !== "segment" || !detail.sourcePlatformId || !detail.sourceId) return false;
    const platform = (state.world?.movingPlatforms || []).find((item) => item.id === detail.sourcePlatformId);
    if (!platform || platform.collisionAttached === false) return false;
    const segment = (platform.segments || []).find((item) => item.id === detail.sourceId);
    if (!segment) return false;
    return Boolean(segmentRectIntersection(
        { x: segment.x1, y: segment.y1 },
        { x: segment.x2, y: segment.y2 },
        expandedRect(getPlayerRect(state), 0.25)
    ));
}

function crushCharacterEnemyByMovingPlatform(state, platform, enemy, options = {}) {
    if (!enemy || enemy.combatState === ENEMY_COMBAT_STATE.DEAD || enemy.health <= 0) return;
    if (options.skipRecovery !== true) {
        const recovery = resolveCharacterEnemyPenetrations(state, enemy, { allowAirborneGround: true, allowShallowOverlap: true });
        if (recovery.killed) return;
        if (recovery.recovered && !movingPlatformEnemyEmbeddedInSolidGeometry(platform, enemy)) return;
    }
    enemy.lastHitBy = platform.id;
    enemy.supportId = null;
    enemy.ridingPlatformId = null;
    enemy.currentSupportId = null;
    beginCharacterEnemyDeath(state, enemy);
    finalizeEnemyDefeatTransaction(state, enemy, {
        sourceId: platform.id,
        damage: round(Math.max(0, Number(enemy.maxHealth) || 0)),
        health: 0,
        maxHealth: round(Math.max(0, Number(enemy.maxHealth) || 0)),
        deferredUntilLanding: false
    });
    addEvent(state, "ENEMY_CRUSHED_BY_MOVING_PLATFORM", {
        enemyId: enemy.id,
        platformId: platform.id
    });
    syncCharacterEnemyTarget(state, enemy);
}

function movingPlatformPlayerInteractionLocked(state) {
    if (state.story?.portalExit?.active === true) return true;
    return activeCutsceneGotoCharacterId(state) === "wizard";
}

function movingPlatformEnemyInteractionLocked(state, enemy) {
    const characterId = activeCutsceneGotoCharacterId(state);
    return Boolean(characterId) && (enemy?.id === characterId || enemy?.entityId === characterId);
}

function sampleMovingPlatformTranslationActorInteractions(state, platform, dx, dy, sampleDuration = 0) {
    if (!platform?.collisionAttached || (Math.abs(dx) <= 0.000000001 && Math.abs(dy) <= 0.000000001)) return;

    if (!playerDeathActive(state)) {
        const hazardRect = expandedRect(getPlayerRect(state), 0.25);
        for (const segment of platform.segments || []) {
            if (segment.kind !== "damaging" && segment.kind !== "killable") continue;
            if (segmentRectIntersection(
                { x: segment.x1, y: segment.y1 },
                { x: segment.x2, y: segment.y2 },
                hazardRect
            )) recordMovingPlatformSwingHazard(platform, segment.id || "movingSegmentHazard", segment.kind);
        }
        for (const polygon of platform.polygons || []) {
            if (polygon.kind !== "damaging" && polygon.kind !== "killable") continue;
            if (polygonOverlapsRect(polygon, hazardRect)) {
                recordMovingPlatformSwingHazard(platform, polygon.id || "movingPolygonHazard", polygon.kind);
            }
        }
    }

    const player = state.player;
    const playerWasOnGround = player.onGround === true;
    const playerIsRider = playerWasOnGround && movingPlatformOwnsCollisionId(platform, player.supportId);
    const playerInteractionLocked = movingPlatformPlayerInteractionLocked(state);
    if (!playerDeathActive(state) && !playerInteractionLocked && !playerIsRider) {
        const playerRect = getPlayerRect(state);
        let solidContact = (platform.polygons || []).some((polygon) => (
            isAreaBlockingSegmentKind(polygon.kind) && polygonOverlapsRect(polygon, playerRect)
        ));
        let caughtSupport = null;
        let contactSegment = null;
        if (!solidContact) {
            for (const segment of platform.segments || []) {
                if (!isSolidSegmentKind(segment.kind)) continue;
                if (!segmentRectIntersection(
                    { x: segment.x1, y: segment.y1 },
                    { x: segment.x2, y: segment.y2 },
                    playerRect
                )) continue;
                const previousSegment = movingPlatformPreviousTranslatedSegment(segment, dx, dy);
                if (segment.kind === "walkable" && (Number(player.dropThroughTimer) || 0) > 0) continue;
                if (!movingPlatformSegmentCanCatchActor(
                    segment,
                    previousSegment,
                    player.currentTransform.x,
                    player.currentTransform.y,
                    player.vy,
                    sampleDuration
                )) continue;
                solidContact = true;
                contactSegment = segment;
                if (segment.kind === "walkable" && playerSegmentIsStandable(segment)) caughtSupport = segment;
                break;
            }
        }
        if (solidContact) {
            const beforeX = player.currentTransform.x;
            const beforeY = player.currentTransform.y;
            moveSwingPlayerWithWorldCollision(
                state,
                platform,
                player.currentTransform.x + dx,
                player.currentTransform.y + dy
            );
            if (caughtSupport) {
                const supportY = segmentYAtX(caughtSupport, player.currentTransform.x);
                if (supportY !== null && player.currentTransform.y <= supportY + 6) {
                    landPlayerOn(state, supportY, playerWasOnGround, caughtSupport.id, caughtSupport.kind);
                }
            } else if (contactSegment && contactSegment.kind !== "walkable") {
                const crushProbe = movingPlatformBlockedLineCrushProbe(
                    state,
                    platform,
                    contactSegment,
                    dx,
                    dy,
                    beforeX,
                    beforeY
                );
                if (crushProbe) platform.blockedPlayerCrushProbe = crushProbe;
            }
        }
    }

    for (const enemy of state.enemies || []) {
        if (enemy?.kind !== "characterEnemy" || enemy.combatState === ENEMY_COMBAT_STATE.DEAD) continue;
        if (movingPlatformEnemyInteractionLocked(state, enemy)) continue;
        if (enemy.airborne !== true && movingPlatformOwnsCollisionId(platform, enemy.supportId)) continue;
        const enemyRect = movingPlatformActorRect(enemy);
        let contact = (platform.polygons || []).some((polygon) => (
            isAreaBlockingSegmentKind(polygon.kind) && polygonOverlapsRect(polygon, enemyRect)
        ));
        let caughtSupport = null;
        if (!contact) {
            for (const segment of platform.segments || []) {
                if (!isSolidSegmentKind(segment.kind)) continue;
                if (!segmentRectIntersection(
                    { x: segment.x1, y: segment.y1 },
                    { x: segment.x2, y: segment.y2 },
                    enemyRect
                )) continue;
                const previousSegment = movingPlatformPreviousTranslatedSegment(segment, dx, dy);
                if (!movingPlatformSegmentCanCatchActor(
                    segment,
                    previousSegment,
                    enemy.currentTransform.x,
                    enemy.currentTransform.y,
                    enemy.velocityY,
                    sampleDuration
                )) continue;
                contact = true;
                if (segment.kind === "walkable" && playerSegmentIsStandable(segment)) caughtSupport = segment;
                break;
            }
        }
        if (!contact) continue;
        const beforeX = enemy.currentTransform.x;
        const beforeY = enemy.currentTransform.y;
        moveCharacterEnemyWithWorldCollision(
            state,
            platform,
            enemy,
            enemy.currentTransform.x + dx,
            enemy.currentTransform.y + dy
        );
        if (enemy.locomotion === "flying") {
            enemy.flightBaseY = finiteNumberOr(enemy.flightBaseY, enemy.spawnY) + (enemy.currentTransform.y - beforeY);
            enemy.airborne = true;
            enemy.supportId = null;
            enemy.ridingPlatformId = null;
            enemy.currentSupportId = null;
            caughtSupport = null;
        }
        if (caughtSupport) {
            const supportY = segmentYAtX(caughtSupport, enemy.currentTransform.x);
            if (supportY !== null && enemy.currentTransform.y <= supportY + Math.max(6, enemy.height * 0.08)) {
                enemy.currentTransform.y = supportY;
                enemy.airborne = false;
                setCharacterEnemyGroundSupportIdentity(state, enemy, { id: caughtSupport.id, kind: caughtSupport.kind });
            }
        }
        const expectedDistance = Math.hypot(dx, dy);
        const actualDistance = Math.hypot(enemy.currentTransform.x - beforeX, enemy.currentTransform.y - beforeY);
        if (!caughtSupport && expectedDistance > 0.25 && actualDistance < expectedDistance - 0.25) {
            const postRect = movingPlatformActorRect(enemy);
            const stillIntersecting = (platform.polygons || []).some((polygon) => (
                isAreaBlockingSegmentKind(polygon.kind) && polygonOverlapsRect(polygon, postRect)
            )) || (platform.segments || []).some((segment) => (
                isSolidSegmentKind(segment.kind) && segment.kind !== "walkable" && segmentRectIntersection(
                    { x: segment.x1, y: segment.y1 },
                    { x: segment.x2, y: segment.y2 },
                    postRect
                )
            ));
            if (stillIntersecting) {
                crushCharacterEnemyByMovingPlatform(state, platform, enemy);
                continue;
            }
        }
        syncCharacterEnemyTarget(state, enemy);
    }
}

function sampleMovingPlatformSwingPlayerInteractions(state, platform, previousAngle = platform?.currentSwingAngle, sampleDuration = 0) {
    if (!platform?.collisionAttached) return;

    const player = state.player;
    const playerWasOnGround = player.onGround === true;
    const playerIsRider = playerWasOnGround && movingPlatformOwnsCollisionId(platform, player.supportId);
    const playerInteractionLocked = movingPlatformPlayerInteractionLocked(state);
    if (!playerDeathActive(state)) {
        const hazardRect = expandedRect(getPlayerRect(state), 0.25);
        for (const segment of platform.segments || []) {
            if (segment.kind !== "damaging" && segment.kind !== "killable") continue;
            if (segmentRectIntersection(
                { x: segment.x1, y: segment.y1 },
                { x: segment.x2, y: segment.y2 },
                hazardRect
            )) {
                recordMovingPlatformSwingHazard(platform, segment.id || "movingSegmentHazard", segment.kind);
            }
        }
        for (const polygon of platform.polygons || []) {
            if (polygon.kind !== "damaging" && polygon.kind !== "killable") continue;
            if (polygonOverlapsRect(polygon, hazardRect)) {
                recordMovingPlatformSwingHazard(platform, polygon.id || "movingPolygonHazard", polygon.kind);
            }
        }
    }

    if (!playerDeathActive(state) && !playerInteractionLocked && !playerIsRider) {
        const playerRect = getPlayerRect(state);
        let solidContact = (platform.polygons || []).some((polygon) => (
            isAreaBlockingSegmentKind(polygon.kind) && polygonOverlapsRect(polygon, playerRect)
        ));
        let caughtSupport = null;
        let contactSegment = null;
        if (!solidContact) {
            for (const segment of platform.segments || []) {
                if (!isSolidSegmentKind(segment.kind)) continue;
                if (!segmentRectIntersection(
                    { x: segment.x1, y: segment.y1 },
                    { x: segment.x2, y: segment.y2 },
                    playerRect
                )) continue;
                const previousSegment = movingPlatformPreviousSegment(segment, platform, previousAngle);
                if (segment.kind === "walkable" && (Number(player.dropThroughTimer) || 0) > 0) continue;
                if (!movingPlatformSegmentCanCatchActor(
                    segment,
                    previousSegment,
                    player.currentTransform.x,
                    player.currentTransform.y,
                    player.vy,
                    sampleDuration
                )) continue;
                solidContact = true;
                contactSegment = segment;
                if (segment.kind === "walkable" && playerSegmentIsStandable(segment)) caughtSupport = segment;
                break;
            }
        }
        if (solidContact) {
            const beforeX = player.currentTransform.x;
            const beforeY = player.currentTransform.y;
            const delta = movingPlatformSwingPointDelta(
                platform,
                previousAngle,
                platform.currentSwingAngle,
                player.currentTransform.x,
                player.currentTransform.y
            );
            moveSwingPlayerWithWorldCollision(
                state,
                platform,
                player.currentTransform.x + delta.x,
                player.currentTransform.y + delta.y
            );
            resolvePlayerPenetrations(state, player.onGround, {
                trackCrush: false,
                emitRecovery: false,
                ignoreMovingPlatformId: platform.id
            });
            if (caughtSupport) {
                const supportY = segmentYAtX(caughtSupport, player.currentTransform.x);
                if (supportY !== null && player.currentTransform.y <= supportY + 6) {
                    landPlayerOn(state, supportY, playerWasOnGround, caughtSupport.id, caughtSupport.kind);
                }
            } else if (contactSegment && contactSegment.kind !== "walkable") {
                const crushProbe = movingPlatformBlockedLineCrushProbe(
                    state,
                    platform,
                    contactSegment,
                    delta.x,
                    delta.y,
                    beforeX,
                    beforeY
                );
                if (crushProbe) platform.blockedPlayerCrushProbe = crushProbe;
            }
        }
    }

    const deltaAngle = (Number(platform.currentSwingAngle) || 0) - (Number(previousAngle) || 0);
    if (Math.abs(deltaAngle) <= 0.000000001) return;
    for (const enemy of state.enemies || []) {
        if (enemy?.kind !== "characterEnemy" || enemy.combatState === ENEMY_COMBAT_STATE.DEAD) continue;
        if (movingPlatformEnemyInteractionLocked(state, enemy)) continue;
        if (enemy.airborne !== true && movingPlatformOwnsCollisionId(platform, enemy.supportId)) continue;
        const enemyRect = {
            x: enemy.currentTransform.x - enemy.width * 0.5,
            y: enemy.currentTransform.y - enemy.height,
            w: enemy.width,
            h: enemy.height
        };
        let contact = (platform.polygons || []).some((polygon) => (
            isAreaBlockingSegmentKind(polygon.kind) && polygonOverlapsRect(polygon, enemyRect)
        ));
        let caughtSupport = null;
        if (!contact) {
            for (const segment of platform.segments || []) {
                if (!isSolidSegmentKind(segment.kind)) continue;
                if (!segmentRectIntersection(
                    { x: segment.x1, y: segment.y1 },
                    { x: segment.x2, y: segment.y2 },
                    enemyRect
                )) continue;
                const previousSegment = movingPlatformPreviousSegment(segment, platform, previousAngle);
                if (!movingPlatformSegmentCanCatchActor(
                    segment,
                    previousSegment,
                    enemy.currentTransform.x,
                    enemy.currentTransform.y,
                    enemy.velocityY,
                    sampleDuration
                )) continue;
                contact = true;
                if (segment.kind === "walkable" && playerSegmentIsStandable(segment)) caughtSupport = segment;
                break;
            }
        }
        if (!contact) continue;
        const beforeX = enemy.currentTransform.x;
        const beforeY = enemy.currentTransform.y;
        const delta = movingPlatformSwingPointDelta(
            platform,
            previousAngle,
            platform.currentSwingAngle,
            enemy.currentTransform.x,
            enemy.currentTransform.y
        );
        moveCharacterEnemyWithWorldCollision(
            state,
            platform,
            enemy,
            enemy.currentTransform.x + delta.x,
            enemy.currentTransform.y + delta.y
        );
        if (enemy.locomotion === "flying") {
            enemy.flightBaseY = finiteNumberOr(enemy.flightBaseY, enemy.spawnY) + (enemy.currentTransform.y - beforeY);
            enemy.airborne = true;
            enemy.supportId = null;
            enemy.ridingPlatformId = null;
            enemy.currentSupportId = null;
            caughtSupport = null;
        }
        if (caughtSupport) {
            const supportY = segmentYAtX(caughtSupport, enemy.currentTransform.x);
            if (supportY !== null && enemy.currentTransform.y <= supportY + Math.max(6, enemy.height * 0.08)) {
                enemy.currentTransform.y = supportY;
                enemy.airborne = false;
                setCharacterEnemyGroundSupportIdentity(state, enemy, { id: caughtSupport.id, kind: caughtSupport.kind });
            }
        }
        const expectedDistance = Math.hypot(delta.x, delta.y);
        const actualDistance = Math.hypot(enemy.currentTransform.x - beforeX, enemy.currentTransform.y - beforeY);
        if (!caughtSupport && expectedDistance > 0.25 && actualDistance < expectedDistance - 0.25) {
            const postRect = movingPlatformActorRect(enemy);
            const stillIntersecting = (platform.polygons || []).some((polygon) => (
                isAreaBlockingSegmentKind(polygon.kind) && polygonOverlapsRect(polygon, postRect)
            )) || (platform.segments || []).some((segment) => (
                isSolidSegmentKind(segment.kind) && segment.kind !== "walkable" && segmentRectIntersection(
                    { x: segment.x1, y: segment.y1 },
                    { x: segment.x2, y: segment.y2 },
                    postRect
                )
            ));
            if (stillIntersecting) {
                crushCharacterEnemyByMovingPlatform(state, platform, enemy);
                continue;
            }
        }
        syncCharacterEnemyTarget(state, enemy);
    }
}

function movingPlatformSwingHazardAtRect(state) {
    let damaging = null;
    for (const platform of state.world?.movingPlatforms || []) {
        if (!platform.swingHazardContact) continue;
        if (platform.swingHazardContact.kind === "killable") return platform.swingHazardContact;
        if (!damaging && platform.swingHazardContact.kind === "damaging") damaging = platform.swingHazardContact;
    }
    return damaging;
}

function findPlayerSurfaceHazard(state, previousPlayerRect = null) {
    const rect = expandedRect(getPlayerRect(state), 0.25);
    const previousRect = previousPlayerRect ? expandedRect(previousPlayerRect, 0.25) : rect;
    let damaging = null;
    const consider = (hazard) => {
        if (!hazard) return null;
        if (hazard.kind === "killable") return hazard;
        if (!damaging && hazard.kind === "damaging") damaging = hazard;
        return null;
    };
    for (const solid of queryWorldSolids(state.world, rect)) {
        if ((solid.kind === "damaging" || solid.kind === "killable") && rectsOverlap(rect, solid)) {
            const lethal = consider({ id: solid.id || "solidHazard", kind: solid.kind });
            if (lethal) return lethal;
        }
    }
    for (const segment of queryWorldSegments(state.world, rect)) {
        if (segment.kind !== "damaging" && segment.kind !== "killable") continue;
        if (segmentRectIntersection({ x: segment.x1, y: segment.y1 }, { x: segment.x2, y: segment.y2 }, rect)) {
            const lethal = consider({ id: segment.id || "segmentHazard", kind: segment.kind });
            if (lethal) return lethal;
        }
    }
    for (const polygon of queryWorldCollisionPolygons(state.world, rect)) {
        if ((polygon.kind === "damaging" || polygon.kind === "killable") && polygonTouchesRect(polygon, rect)) {
            const lethal = consider({ id: polygon.id || "polygonHazard", kind: polygon.kind });
            if (lethal) return lethal;
        }
    }
    const swept = movingPlatformSwingHazardAtRect(state, rect, previousRect);
    if (swept?.kind === "killable") return swept;
    return damaging || swept;
}

function applyPlayerSurfaceHazards(state, previousPlayerRect = null) {
    const hazard = findPlayerSurfaceHazard(state, previousPlayerRect);
    if (!hazard) {
        return false;
    }
    const lethal = hazard.kind === "killable";
    const result = damagePlayer(
        state,
        lethal ? state.health.max : state.tuning.hazardContactDamage,
        hazard.id,
        {
            bypassInvulnerability: lethal,
            bypassDifficulty: lethal,
            knockbackY: lethal ? 0 : -180
        }
    );
    if (result.damage > 0) {
        addEvent(state, "PLAYER_HAZARD_CONTACT", {
            hazardId: hazard.id,
            kind: hazard.kind,
            damage: round(result.damage),
            health: round(state.health.amount)
        });
    }
    return result.damage > 0;
}

function updateFuelRecharge(state, dt) {
    const fuel = state.fuel;
    const t = state.tuning;
    const rocket = state.equipment.rocket;
    const overdriveActive = Boolean(activePowerUpEffect(state, POWER_UP_EFFECT_IDS.OVERDRIVE));
    const flightActive = Boolean(activePowerUpEffect(state, POWER_UP_EFFECT_IDS.FLIGHT));
    const passiveFuelRecoveryActive = overdriveActive || flightActive;
    const passiveFuelRecoveryRate = passiveFuelRecoveryActive
        ? Math.max(0, Number(t.attachedBoostDrainRate) || 0) * OVERDRIVE_PASSIVE_FUEL_RECOVERY_DRAIN_FACTOR
        : 0;

    fuel.amount = clamp(fuel.amount, 0, fuel.max);

    updateBoostKickGroundRecharge(state, dt);

    let normalRecoveryRate = 0;
    if (!rocket.attachedBoosting) {
        if (fuel.rechargeDelayTimer > 0) {
            fuel.rechargeDelayTimer = Math.max(0, fuel.rechargeDelayTimer - dt);
        } else if (t.fuelRechargeRequiresGround !== false && !fuel.rechargeLatched) {
            if (state.player.onGround) {
                fuel.rechargeLatched = true;
                addEvent(state, "FUEL_RECHARGE_STARTED", { grounded: true });
                normalRecoveryRate = effectiveFuelRechargeRate(state);
            }
        } else {
            normalRecoveryRate = effectiveFuelRechargeRate(state);
        }
    }

    const recoveryRate = Math.max(passiveFuelRecoveryRate, normalRecoveryRate);
    const cap = passiveFuelRecoveryActive
        ? fuel.max
        : clamp(fuel.rechargeCap, 0, fuel.max);
    if (fuel.amount < cap) {
        const previous = fuel.amount;
        fuel.amount = Math.min(cap, fuel.amount + recoveryRate * dt);
        if (Math.floor(previous) !== Math.floor(fuel.amount)) {
            addEvent(state, "FUEL_CHANGED", { amount: round(fuel.amount), cap });
        }
    }
}

function updateBoostKickGroundRecharge(state, dt) {
    const rocket = state.equipment.rocket;
    const t = state.tuning;
    const kickMax = Math.max(0, t.attachedBoostKickChargeMax ?? 1);
    rocket.boostKickCharge = clamp(rocket.boostKickCharge ?? kickMax, 0, kickMax);

    if (!state.player.onGround || rocket.boostKickCharge >= kickMax) {
        return;
    }

    const previous = rocket.boostKickCharge;
    if (t.attachedBoostKickRechargeInstant !== false) {
        rocket.boostKickCharge = kickMax;
    } else {
        rocket.boostKickCharge = Math.min(kickMax, rocket.boostKickCharge + Math.max(0, t.attachedBoostKickChargeRechargeRate ?? 1) * dt);
    }

    if (previous !== rocket.boostKickCharge) {
        if (t.rocketFuelBulbFlashOnKickRecharge !== false) {
            rocket.fuelBulbFlashTimer = 0.45;
        }
        addEvent(state, "BOOST_KICK_RECHARGED", { charge: round(rocket.boostKickCharge), grounded: true });
    }
}

function enemyContactBodyRect(enemy) {
    return {
        x: (Number(enemy.currentTransform.x) || 0) - Math.max(1, Number(enemy.width) || 1) * 0.5,
        y: (Number(enemy.currentTransform.y) || 0) - Math.max(1, Number(enemy.height) || 1),
        w: Math.max(1, Number(enemy.width) || 1),
        h: Math.max(1, Number(enemy.height) || 1)
    };
}

function updateEnemyContactDamage(state) {
    if (!playerIsAvailableCombatTarget(state)) return;
    const playerRect = getPlayerRect(state);
    let strongest = null;

    for (const enemy of state.enemies || []) {
        if (enemy.strategy === "passive") continue;
        if ((Number(enemy.health) || 0) <= 0) continue;
        if (enemy.combatState === ENEMY_COMBAT_STATE.DEAD || enemy.state === "destroyed") continue;
        // A committed melee lunge resolves damage through its authored melee
        // handoff. Do not stack the separate body-contact damage channel on top.
        if (enemy.attackLungeActive === true && enemy.attackMode !== "projectile") continue;
        if (!rectsOverlap(playerRect, enemyContactBodyRect(enemy))) continue;

        const contactDamage = Math.max(0, finiteNumberOr(
            enemy.contactDamageBase,
            Math.max(Number(enemy.damage) || 0, Number(enemy.attackDamage) || 0, Number(enemy.projectileDamage) || 0)
        )) * 0.25;
        if (contactDamage <= 0) continue;
        if (!strongest || contactDamage > strongest.damage) {
            strongest = { enemy, damage: contactDamage };
        }
    }

    if (!strongest) return;
    const contactDirection = state.player.currentTransform.x < strongest.enemy.currentTransform.x
        ? -1
        : (state.player.currentTransform.x > strongest.enemy.currentTransform.x
            ? 1
            : (strongest.enemy.facing < 0 ? 1 : -1));
    const result = damagePlayer(state, strongest.damage, strongest.enemy.id, {
        invulnerabilityTimerKey: "contactInvulnerabilityTimer",
        invulnerabilitySeconds: state.tuning.playerContactDamageInvulnerabilitySeconds,
        knockbackX: contactDirection * Math.max(0, Number(state.tuning.playerContactDamageKnockbackX) || 0),
        knockbackY: Number(state.tuning.playerContactDamageKnockbackY) || 0,
        cause: "enemyContact"
    });
    addEvent(state, result.damage > 0 ? "ENEMY_CONTACT_HIT" : "ENEMY_CONTACT_BLOCKED", {
        enemyId: strongest.enemy.id,
        damage: round(result.damage),
        health: round(state.health.amount)
    });
}

function updateHealth(state, dt) {
    const health = state.health;
    const t = state.tuning;
    health.invulnerabilityTimer = Math.max(0, (Number(health.invulnerabilityTimer) || 0) - dt);
    health.contactInvulnerabilityTimer = Math.max(0, (Number(health.contactInvulnerabilityTimer) || 0) - dt);
    const lowHealthRatio = clamp((Number(t.lowHealthThreshold) || 0) / Math.max(1, Number(t.maxHealth) || DEFAULT_TUNING.maxHealth), 0, 1);
    health.low = health.amount / Math.max(1, health.max) <= lowHealthRatio;

    const rawLastDamagedAt = health.lastDamagedAt;
    const lastDamagedAt = rawLastDamagedAt !== null && rawLastDamagedAt !== undefined && Number.isFinite(Number(rawLastDamagedAt))
        ? Number(rawLastDamagedAt)
        : null;
    const delayElapsed = lastDamagedAt === null || state.clock.time - lastDamagedAt >= t.healthRegenDelay;
    const healthRegenRate = effectiveHealthRegenRate(state);
    const shouldRegenerate = delayElapsed && health.amount > 0 && health.amount < health.max && healthRegenRate > 0;
    if (shouldRegenerate) {
        const wasRegenerating = health.regenerating === true;
        health.regenerating = true;
        const before = health.amount;
        health.amount = Math.min(health.max, health.amount + healthRegenRate * dt);
        if (!wasRegenerating) {
            addEvent(state, "PLAYER_HEALTH_REGEN_STARTED", { health: round(before) });
        }
        if (health.amount >= health.max) {
            health.regenerating = false;
            addEvent(state, "PLAYER_HEALTH_REGEN_COMPLETED", { health: round(health.amount) });
        }
    } else if (health.regenerating) {
        health.regenerating = false;
        addEvent(state, "PLAYER_HEALTH_REGEN_STOPPED", { health: round(health.amount) });
    }

    state.player.lowHealthPulse = health.low ? (Math.sin(state.clock.time * 9) + 1) * 0.5 : 0;
}

function updateHat(state) {
    const hat = state.hat;
    if (hat.state === "worn") {
        hat.currentTransform.x = state.player.currentTransform.x;
        hat.currentTransform.y = state.player.currentTransform.y - state.player.height;
        hat.vx = state.player.vx;
        hat.vy = state.player.vy;
    }
}

function resetCameraLineTracking(state) {
    const camera = state.camera;
    camera.guideDirection = 0;
    camera.guideAlongSpeed = 0;
    camera.guideLastAlong = 0;
    camera.guideLastAlongValid = false;
    camera.guideNearest = null;
    camera.guideLookAhead = null;
    camera.guideNominalOffsetY = -170;
}

function smoothCameraGuideInfluence(distance, influenceDistance) {
    const raw = clamp(1 - distance / Math.max(1, influenceDistance), 0, 1);
    return raw * raw * (3 - 2 * raw);
}

function cameraLineNominalOffsetY(state, dt, normalOffset = 170) {
    const camera = state.camera;
    const cameraLine = state.world?.cameraLine;
    const fallbackOffset = -Math.abs(normalOffset);
    const clearGuideDebug = () => {
        camera.guideNearest = null;
        camera.guideLookAhead = null;
        camera.guideNominalOffsetY = fallbackOffset;
    };
    if (!cameraLine?.enabled || !Array.isArray(cameraLine.samples) || cameraLine.samples.length < 2) {
        camera.guideLastAlongValid = false;
        camera.guideAlongSpeed = 0;
        camera.guideDirection = 0;
        clearGuideDebug();
        return fallbackOffset;
    }

    const player = state.player;
    const nearest = nearestCameraLinePoint(cameraLine, player.currentTransform);
    if (!nearest || nearest.distance > cameraLine.influenceDistance) {
        camera.guideLastAlongValid = false;
        camera.guideAlongSpeed = 0;
        camera.guideDirection = 0;
        clearGuideDebug();
        return fallbackOffset;
    }

    const projectedVelocity = (Number(player.vx) || 0) * nearest.tangentX + (Number(player.vy) || 0) * nearest.tangentY;
    let measuredAlongSpeed = projectedVelocity;
    if (camera.guideLastAlongValid && dt > 0) {
        const rawAlongSpeed = clamp((nearest.along - camera.guideLastAlong) / dt, -1200, 1200);
        const alongBlend = 1 - Math.pow(0.025, dt);
        camera.guideAlongSpeed += (rawAlongSpeed - camera.guideAlongSpeed) * alongBlend;
        measuredAlongSpeed = Math.abs(camera.guideAlongSpeed) >= 12 ? camera.guideAlongSpeed : projectedVelocity;
    } else {
        camera.guideAlongSpeed = projectedVelocity;
    }
    camera.guideLastAlong = nearest.along;
    camera.guideLastAlongValid = true;

    // Horizontal look-ahead already follows the wizard's committed facing.
    // Camera-line elevation must follow that same choice immediately, even
    // while turnaround inertia still carries the wizard in the old direction.
    const facingAlong = (player.facing < 0 ? -1 : 1) * nearest.tangentX;
    if (Math.abs(nearest.tangentX) >= 0.1) {
        camera.guideDirection = facingAlong >= 0 ? 1 : -1;
    } else if (Math.abs(measuredAlongSpeed) >= 22) {
        // A nearly vertical guide has no meaningful left/right side.
        camera.guideDirection = measuredAlongSpeed >= 0 ? 1 : -1;
    }

    const direction = Number(camera.guideDirection) || 0;
    if (!direction) {
        camera.guideNearest = { x: nearest.x, y: nearest.y };
        camera.guideLookAhead = null;
        camera.guideNominalOffsetY = fallbackOffset;
        return fallbackOffset;
    }

    const lookAhead = cameraLinePointAtDistance(
        cameraLine,
        nearest.along + direction * cameraLine.lookAheadDistance
    );
    const verticalChange = (lookAhead?.y ?? nearest.y) - nearest.y;
    const descentAmount = clamp(verticalChange / Math.max(1, Math.abs(normalOffset) * 2), 0, 1);
    const guidedOffset = clamp(
        fallbackOffset + descentAmount * Math.abs(normalOffset) * 2,
        -Math.abs(normalOffset),
        Math.abs(normalOffset)
    );
    const influence = smoothCameraGuideInfluence(nearest.distance, cameraLine.influenceDistance);
    const nominalOffset = clamp(
        fallbackOffset + (guidedOffset - fallbackOffset) * influence,
        -Math.abs(normalOffset),
        Math.abs(normalOffset)
    );
    camera.guideNearest = { x: nearest.x, y: nearest.y };
    camera.guideLookAhead = lookAhead ? { x: lookAhead.x, y: lookAhead.y } : null;
    camera.guideNominalOffsetY = nominalOffset;
    return nominalOffset;
}

const CAMERA_REPOSITION_BLEND_RATE = 0.03162277660168379;
const CAMERA_EDGE_CATCHUP_ZONE_RATIO = 0.125;
const CAMERA_EDGE_CATCHUP_RATE = 5;

function cameraEdgeCatchupAxis(value, lowerVisibleEdge, upperVisibleEdge, subjectLower, subjectUpper, zoneSize) {
    const zone = Math.max(1, Number(zoneSize) || 1);
    const lowerDistance = subjectLower - lowerVisibleEdge;
    const upperDistance = upperVisibleEdge - subjectUpper;
    const lowerPressure = clamp(1 - lowerDistance / zone, 0, 1);
    const upperPressure = clamp(1 - upperDistance / zone, 0, 1);
    if (lowerPressure <= 0 && upperPressure <= 0) {
        return { pressure: 0, target: value };
    }
    if (lowerPressure >= upperPressure) {
        return { pressure: lowerPressure, target: value - Math.max(0, zone - lowerDistance) };
    }
    return { pressure: upperPressure, target: value + Math.max(0, zone - upperDistance) };
}

function cameraEdgeCatchupPlan(state) {
    const camera = state.camera;
    const player = state.player;
    const width = Math.max(1, Number(camera.viewportWidth) || 1280);
    const height = Math.max(1, Number(camera.viewportHeight) || 720);
    const cameraX = Number(camera.currentTransform.x) || 0;
    const cameraY = Number(camera.currentTransform.y) || 0;
    const left = cameraX - width * 0.5;
    const right = cameraX + width * 0.5;
    const top = cameraY - height * 0.56;
    const bottom = top + height;
    const playerX = Number(player.currentTransform.x) || 0;
    const playerY = Number(player.currentTransform.y) || 0;
    const playerLeft = playerX - Math.max(1, Number(player.width) || 1) * 0.5;
    const playerRight = playerX + Math.max(1, Number(player.width) || 1) * 0.5;
    const playerTop = playerY - Math.max(1, Number(player.height) || 1);
    const playerBottom = playerY;
    const x = cameraEdgeCatchupAxis(
        cameraX, left, right, playerLeft, playerRight, width * CAMERA_EDGE_CATCHUP_ZONE_RATIO
    );
    const y = cameraEdgeCatchupAxis(
        cameraY, top, bottom, playerTop, playerBottom, height * CAMERA_EDGE_CATCHUP_ZONE_RATIO
    );
    return { x, y };
}

function applyCameraEdgeCatchupAxis(current, plan, dt) {
    const pressure = clamp(Number(plan?.pressure) || 0, 0, 1);
    if (pressure <= 0) return current;
    if (pressure >= 0.999999) return Number(plan.target) || current;
    // The ordinary camera remains untouched until the player enters the final
    // 1/8 of the viewport. Inside that zone the additional tracing rate rises
    // as p^2/(1-p), tending to infinity at the actual screen edge.
    const rate = CAMERA_EDGE_CATCHUP_RATE * pressure * pressure / Math.max(0.000001, 1 - pressure);
    const blend = 1 - Math.exp(-rate * Math.max(0, Number(dt) || 0));
    return current + ((Number(plan.target) || current) - current) * blend;
}

function keepPlayerInsideCameraViewport(state) {
    const camera = state.camera;
    const player = state.player;
    const width = Math.max(1, Number(camera.viewportWidth) || 1280);
    const height = Math.max(1, Number(camera.viewportHeight) || 720);
    const playerX = Number(player.currentTransform.x) || 0;
    const playerY = Number(player.currentTransform.y) || 0;
    const halfPlayerWidth = Math.max(1, Number(player.width) || 1) * 0.5;
    const playerHeight = Math.max(1, Number(player.height) || 1);
    const playerLeft = playerX - halfPlayerWidth;
    const playerRight = playerX + halfPlayerWidth;
    const playerTop = playerY - playerHeight;
    const playerBottom = playerY;

    let left = camera.currentTransform.x - width * 0.5;
    let right = camera.currentTransform.x + width * 0.5;
    if (playerLeft < left) camera.currentTransform.x += playerLeft - left;
    else if (playerRight > right) camera.currentTransform.x += playerRight - right;

    let top = camera.currentTransform.y - height * 0.56;
    let bottom = top + height;
    if (playerTop < top) camera.currentTransform.y += playerTop - top;
    else if (playerBottom > bottom) camera.currentTransform.y += playerBottom - bottom;
}

function updateCameraHint(state, dt) {
    const p = state.player;
    const edgeCatchup = cameraEdgeCatchupPlan(state);
    const lookAhead = 150 * p.facing;
    const upwardLead = clamp(Math.min(0, p.vy) * 0.12, -120, 0);
    const descendingLead = p.onGround
        ? 0
        : clamp((Math.max(0, p.vy) - 35) * 0.42, 0, 260);
    const targetX = p.currentTransform.x + lookAhead;
    const nominalOffsetY = cameraLineNominalOffsetY(state, dt, 170);
    const targetY = p.currentTransform.y + nominalOffsetY + upwardLead + descendingLead;
    const blendRate = descendingLead > 0 ? 0.00008 : CAMERA_REPOSITION_BLEND_RATE;
    const blend = 1 - Math.pow(blendRate, dt);
    state.camera.currentTransform.x += (targetX - state.camera.currentTransform.x) * blend;
    state.camera.currentTransform.y += (targetY - state.camera.currentTransform.y) * blend;
    state.camera.currentTransform.x = applyCameraEdgeCatchupAxis(state.camera.currentTransform.x, edgeCatchup.x, dt);
    state.camera.currentTransform.y = applyCameraEdgeCatchupAxis(state.camera.currentTransform.y, edgeCatchup.y, dt);
    keepPlayerInsideCameraViewport(state);
}

function playerShieldBlocksDamage(state, bypassInvulnerability = false) {
    return bypassInvulnerability !== true && Boolean(
        state.player?.lungeActive
        || state.player?.bodySlamCommitted
        || (Number(state.player?.bodySlamImmunityTimer) || 0) > 1e-9
        || activePowerUpEffect(state, POWER_UP_EFFECT_IDS.SHIELD)
    );
}

function playerSuppressesKnockback(state) {
    const input = state?.debug?.lastInputFrame;
    return Boolean(input?.dropHeld || input?.dropPressed);
}

export function damagePlayer(state, amount = 34, sourceId = "debug", options = {}) {
    const health = state.health;
    const baseDamage = Math.max(0, Number(amount) || 0);
    const damageScale = options.bypassDifficulty === true ? 1 : difficultyDamageScale(state.settings);
    const requestedDamage = baseDamage * damageScale;
    const before = clamp(Number(health.amount) || 0, 0, health.max);
    const storyInvulnerable = playerStorySequenceInvulnerable(state);
    const shielded = playerShieldBlocksDamage(state, options.bypassInvulnerability);
    const invulnerabilityTimerKey = String(options.invulnerabilityTimerKey || "invulnerabilityTimer");
    const damageInvulnerable = options.bypassInvulnerability !== true && (Number(health[invulnerabilityTimerKey]) || 0) > 0;
    const blocked = storyInvulnerable || shielded || damageInvulnerable;
    if (requestedDamage <= 0 || before <= 0 || blocked) {
        return {
            damage: 0,
            health: before,
            defeated: before <= 0,
            blocked,
            blockedBy: storyInvulnerable ? "storySequence" : (shielded ? "shield" : (damageInvulnerable ? invulnerabilityTimerKey : null))
        };
    }

    const damage = Math.min(before, requestedDamage);
    health.amount = Math.max(0, before - requestedDamage);
    health.lastDamagedAt = state.clock.time;
    if (health.regenerating) {
        addEvent(state, "PLAYER_HEALTH_REGEN_STOPPED", {
            health: round(health.amount),
            reason: "damaged"
        });
    }
    health.regenerating = false;
    health[invulnerabilityTimerKey] = Math.max(
        0,
        Number(options.invulnerabilitySeconds ?? state.tuning.playerDamageInvulnerabilitySeconds) || 0
    );

    const suppressKnockback = playerSuppressesKnockback(state);
    if (!suppressKnockback && Number.isFinite(Number(options.knockbackX))) {
        state.player.vx = Number(options.knockbackX);
    }
    if (!suppressKnockback && Number.isFinite(Number(options.knockbackY))) {
        state.player.vy = Number(options.knockbackY);
        state.player.onGround = false;
        state.player.supportId = null;
        state.player.groundStride = null;
    }

    const defeated = health.amount <= 0;
    addEvent(state, "PLAYER_DAMAGED", {
        amount: round(damage),
        baseAmount: round(baseDamage),
        difficultyScale: round(damageScale),
        sourceId,
        health: round(health.amount),
        defeated
    });
    if (defeated) {
        triggerPlayerDeath(state, {
            sourceId,
            resetReason: "healthDepleted",
            cause: options.cause || "healthDepleted"
        });
    }
    return {
        damage,
        health: health.amount,
        defeated,
        blocked: false
    };
}


export function teleportPlayer(state, x, y, reason = "developmentTeleport") {
    const targetX = Number(x);
    const targetY = Number(y);
    if (!Number.isFinite(targetX) || !Number.isFinite(targetY) || !state?.player || !state?.camera) return false;
    const p = state.player;
    stopAttachedBoost(state, "teleport");
    clearPlayerLungeState(state);
    p.bodySlamCommitted = false;
    p.bodySlamImmunityTimer = 0;
    p.currentTransform.x = targetX;
    p.currentTransform.y = targetY;
    p.vx = 0;
    p.vy = 0;
    p.onGround = false;
    p.supportId = null;
    p.groundStride = null;
    p.dropThroughTimer = 0;
    p.inWater = false;
    p.waterSubmersion = 0;
    p.waterRegionId = null;
    p.wasOnGround = false;
    p.airBoostArmed = false;
    p.ordinaryJumpActive = false;
    p.ordinaryJumpStartY = null;
    p.ordinaryJumpApexY = null;
    p.crushCandidateTicks = 0;
    p.crushCandidateKey = null;
    p.crushCandidateDetail = null;
    state.camera.currentTransform.x = targetX;
    state.camera.currentTransform.y = targetY - 170;
    resetCameraLineTracking(state);
    snapPresentationSubject(p, reason, "player");
    snapPresentationSubject(state.camera, `${reason}:camera`, "camera");
    addEvent(state, "PLAYER_TELEPORTED", { reason, x: targetX, y: targetY });
    return true;
}

export function resetPlayer(state, reason = "manualReset") {
    const p = state.player;
    stopAttachedBoost(state, "reset");
    clearPlayerLungeState(state);
    p.fallImpactExplosionCooldownTimer = 0;
    p.bodySlamCommitted = false;
    p.bodySlamImmunityTimer = 0;
    clearDeathResetPowerUps(state);
    p.onGround = false;
    p.supportId = null;
    resetMovingPlatforms(state, reason);
    p.currentTransform.x = p.spawnX;
    p.currentTransform.y = p.spawnY;
    p.vx = 0;
    p.vy = 0;
    p.onGround = false;
    p.supportId = null;
    p.groundStride = null;
    p.dropThroughTimer = 0;
    p.inWater = false;
    p.waterSubmersion = 0;
    p.waterRegionId = null;
    p.wasOnGround = false;
    p.airBoostArmed = false;
    p.ordinaryJumpActive = false;
    p.ordinaryJumpStartY = null;
    p.ordinaryJumpApexY = null;
    p.facing = 1;
    p.visible = true;
    setCurrentUniformScale(p, 1);
    p.crushCandidateTicks = 0;
    p.crushCandidateKey = null;
    p.crushCandidateDetail = null;
    p.combatState = "alive";
    p.targetable = true;
    p.deathPhase = "none";
    p.deathPhaseTimer = 0;
    p.deathElapsed = 0;
    p.deathSourceId = null;
    p.deathResetReason = null;
    state.fuel.amount = state.fuel.max;
    state.fuel.rechargeDelayTimer = 0;
    state.fuel.rechargeLatched = false;
    state.equipment.rocket.state = "mountedReady";
    state.equipment.rocket.attachedBoosting = false;
    state.equipment.rocket.attachedBoostTime = 0;
    state.equipment.rocket.boostKickCharge = state.tuning.attachedBoostKickChargeMax ?? 1;
    state.equipment.rocket.boostBurstTimer = 0;
    state.equipment.rocket.boostAccelerationNow = 0;
    state.equipment.rocket.boostVisualPowerNow = 0;
    state.equipment.rocket.attachedSmokeTimer = 0;
    state.projectiles.length = 0;
    if (state.effects?.smokePuffs) {
        state.effects.smokePuffs.length = 0;
    }
    state.health.amount = state.health.max;
    state.health.lastDamagedAt = null;
    state.health.invulnerabilityTimer = 0;
    state.health.contactInvulnerabilityTimer = 0;
    state.health.regenerating = false;
    state.health.low = false;
    state.camera.currentTransform.x = p.spawnX;
    state.camera.currentTransform.y = p.spawnY - 170;
    resetCameraLineTracking(state);
    snapPresentationSubject(p, reason, "player");
    snapPresentationSubject(state.camera, `${reason}:camera`, "camera");
    addEvent(state, "PLAYER_RESET", { reason });
}

function round(value) {
    return Number(value.toFixed(3));
}
