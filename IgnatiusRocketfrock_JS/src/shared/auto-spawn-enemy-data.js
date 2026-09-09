import { parseEnemySelection } from "./enemy-pool-data.js";

export const DEFAULT_AUTO_SPAWN_ENEMIES = Object.freeze({
    enabled: false,
    probabilityPercent: 0,
    enemyPool: "1-900"
});

export const DEFAULT_ENEMY_SPAWNER = Object.freeze({
    probabilityPercent: 10,
    enemyPool: "1-900"
});

export const CHARACTER_ENEMY_BOSS_OVERRIDE_FIELDS = Object.freeze([
    "characterId",
    "characterProject",
    "strategy",
    "walkSpeed",
    "runSpeed",
    "awarenessRange",
    "awarenessViewHalfAngle",
    "awarenessHoldDuration",
    "jumpHeight",
    "unreachableGlareDuration",
    "idleDuration",
    "turnPause",
    "health",
    "scale",
    "damage",
    "contactDamage",
    "attackRange",
    "attackVerticalRange",
    "meleeHitRange",
    "lungeTargetDist",
    "lungeRangeMin",
    "lungeRangeMax",
    "lungeSpeed",
    "attackCooldown",
    "immuneToInterrupts",
    "deaf",
    "preferredAttackRange",
    "preferredAttackMinRange",
    "projectileLaunchType",
    "projectileAimMode",
    "projectileAimAngleDegrees",
    "projectileAngleJitterDegrees",
    "projectileSpeed",
    "projectileGravity",
    "projectileLifetime",
    "projectileRadius",
    "projectileHomingStrength",
    "spreadCount",
    "spreadAngle",
    "projectileRotationSpeedDegrees",
    "projectileVisualScale",
    "projectileVisualScaleJitter",
    "projectileTrailEffect",
    "projectileImpactEffect",
    "projectileExplosionEffect",
    "projectileAreaDamageRadiusWizardHeights",
    "projectileOrientToVelocity"
]);

const CHARACTER_ENEMY_BOSS_OVERRIDE_FIELD_SET = new Set(CHARACTER_ENEMY_BOSS_OVERRIDE_FIELDS);
const CHARACTER_ENEMY_PLACEMENT_FIELDS = new Set([
    "facing",
    "patrolDistance",
    // These are intentionally per-placement phase/stagger values rather than
    // type-wide character tuning.
    "bomberInitialDelay",
    "periodicInitialDelay",
    "flightPhaseOffset",
    "targetRadius"
]);
const CHARACTER_ENEMY_ALWAYS_CATALOG_FIELDS = new Set([
    "characterId",
    "characterProject",
    "w",
    "width",
    "h",
    "height",
    "scale",
    // Structural attack/projectile choices remain catalog-owned even for
    // bosses. Bosses tune the selected attack, not replace its authored rig.
    "attackType",
    "projectileKind",
    "projectilePartName",
    "projectileFrameId",
    "projectileVisualCharacterId",
    "projectileVisualFrameId",
    "projectileOriginLocalX",
    "projectileOriginLocalY",
    "projectileRigScale",
    "projectileRendererKind"
]);

function characterEnemyCatalogOwnsField(definition, key) {
    return CHARACTER_ENEMY_ALWAYS_CATALOG_FIELDS.has(key)
        || CHARACTER_ENEMY_BOSS_OVERRIDE_FIELD_SET.has(key)
        || Object.prototype.hasOwnProperty.call(definition?.defaults || {}, key);
}

export function resolveLevelCharacterEnemyFromCatalog(catalog, entity) {
    if (!entity || typeof entity !== "object" || Array.isArray(entity)) return entity;
    const type = String(entity.type || "");
    const enemyCatalogId = String(entity.enemyCatalogId || "").trim();
    if ((type !== "characterEnemy" && type !== "enemy") || !enemyCatalogId) return entity;
    const definition = catalog?.enemies?.[enemyCatalogId];
    if (!definition) return entity;

    const isBoss = entity.isBoss === true;
    const resolved = {
        ...JSON.parse(JSON.stringify(definition.defaults || {})),
        type,
        enemyCatalogId,
        characterId: definition.characterId,
        w: definition.defaultSize.w,
        h: definition.defaultSize.h
    };
    for (const [key, value] of Object.entries(entity)) {
        const placementField = CHARACTER_ENEMY_PLACEMENT_FIELDS.has(key);
        const catalogField = characterEnemyCatalogOwnsField(definition, key);
        if (catalogField && !placementField && !(isBoss && CHARACTER_ENEMY_BOSS_OVERRIDE_FIELD_SET.has(key))) {
            continue;
        }
        resolved[key] = JSON.parse(JSON.stringify(value));
    }
    return resolved;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function finiteNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

export function normalizeAutoSpawnEnemies(value) {
    const source = value && typeof value === "object" ? value : {};
    const probabilityPercent = clamp(
        finiteNumber(source.probabilityPercent ?? source.probability ?? source.chancePercent, DEFAULT_AUTO_SPAWN_ENEMIES.probabilityPercent),
        0,
        100
    );
    const enemyPool = String(source.enemyPool ?? source.allowedEnemies ?? DEFAULT_AUTO_SPAWN_ENEMIES.enemyPool).trim() || DEFAULT_AUTO_SPAWN_ENEMIES.enemyPool;
    return {
        enabled: source.enabled === true,
        probabilityPercent,
        enemyPool
    };
}

export function normalizeEnemySpawner(value) {
    const source = value && typeof value === "object" ? value : {};
    return {
        probabilityPercent: clamp(
            finiteNumber(source.probabilityPercent ?? source.probability ?? source.chancePercent, DEFAULT_ENEMY_SPAWNER.probabilityPercent),
            0,
            100
        ),
        enemyPool: String(source.enemyPool ?? source.allowedEnemies ?? DEFAULT_ENEMY_SPAWNER.enemyPool).trim() || DEFAULT_ENEMY_SPAWNER.enemyPool
    };
}

export function normalizeEnemyDefinitionCatalog(value) {
    const source = value && typeof value === "object" ? value : {};
    const enemiesSource = source.enemies && typeof source.enemies === "object" && !Array.isArray(source.enemies)
        ? source.enemies
        : source;
    const enemies = {};
    for (const [enemyId, raw] of Object.entries(enemiesSource || {})) {
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
        const characterId = String(raw.characterId || raw.characterProject || "").trim();
        if (!characterId) continue;
        const sizeSource = raw.defaultSize && typeof raw.defaultSize === "object" ? raw.defaultSize : {};
        enemies[String(enemyId)] = {
            id: String(enemyId),
            label: String(raw.label || enemyId),
            characterId,
            defaultSize: {
                w: Math.max(1, finiteNumber(sizeSource.w ?? sizeSource.width, 72)),
                h: Math.max(1, finiteNumber(sizeSource.h ?? sizeSource.height, 150))
            },
            defaults: raw.defaults && typeof raw.defaults === "object" && !Array.isArray(raw.defaults)
                ? JSON.parse(JSON.stringify(raw.defaults))
                : {}
        };
    }
    const projectileKindsSource = source.projectileKinds && typeof source.projectileKinds === "object" && !Array.isArray(source.projectileKinds)
        ? source.projectileKinds
        : {};
    const projectileKinds = {};
    for (const [projectileKind, raw] of Object.entries(projectileKindsSource)) {
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
        projectileKinds[String(projectileKind)] = JSON.parse(JSON.stringify(raw));
    }
    return {
        version: Math.max(1, Math.floor(finiteNumber(source.version ?? source.meta?.version, 1))),
        catalogId: String(source.catalogId || "enemy-definitions"),
        projectileKinds,
        enemies
    };
}

export function resolveLevelCharacterEnemy(catalog, entity) {
    return resolveLevelCharacterEnemyFromCatalog(normalizeEnemyDefinitionCatalog(catalog), entity);
}

export function resolveAutoSpawnEnemyIds(config, catalog) {
    const normalizedConfig = normalizeAutoSpawnEnemies(config);
    const normalizedCatalog = normalizeEnemyDefinitionCatalog(catalog);
    const availableIds = Object.keys(normalizedCatalog.enemies);
    return parseEnemySelection(normalizedConfig.enemyPool, availableIds);
}

export function collectLevelEnemyCharacterIds(level, catalog) {
    const source = level && typeof level === "object" ? level : {};
    const normalizedCatalog = normalizeEnemyDefinitionCatalog(catalog);
    const characterIds = new Set();
    const addCharacterId = (value) => {
        const characterId = String(value || "").trim();
        if (characterId) characterIds.add(characterId);
    };
    const addEnemyDependencies = (enemyId, overrides = null) => {
        const definition = normalizedCatalog.enemies[String(enemyId || "").trim()] || null;
        const defaults = definition?.defaults && typeof definition.defaults === "object" ? definition.defaults : {};
        const explicitSource = overrides && typeof overrides === "object" && !Array.isArray(overrides) ? overrides : {};
        const explicit = definition
            ? resolveLevelCharacterEnemyFromCatalog(normalizedCatalog, {
                ...explicitSource,
                type: String(explicitSource.type || "characterEnemy"),
                enemyCatalogId: String(enemyId || "").trim()
            })
            : explicitSource;
        addCharacterId(explicit.characterId || explicit.characterProject || definition?.characterId);
        const projectileKind = String(explicit.projectileKind || defaults.projectileKind || "").trim();
        const projectileKindDefaults = normalizedCatalog.projectileKinds[projectileKind] || {};
        // Projectile visuals are gameplay assets, not opportunistic renderer decoration.
        // A Kind-default visual must therefore be resident whenever that enemy can fire;
        // otherwise the exact same projectile changes into a primitive fallback depending
        // on whether some unrelated enemy happened to load the shared character atlas.
        addCharacterId(
            explicit.projectileVisualCharacterId
            || defaults.projectileVisualCharacterId
            || projectileKindDefaults.visualCharacterId
        );
    };
    const addEnemyPool = (config) => {
        for (const enemyId of resolveAutoSpawnEnemyIds(config, catalog).resolvedIds) {
            addEnemyDependencies(enemyId);
        }
    };

    const entities = Array.isArray(source.entities)
        ? source.entities
        : Array.isArray(source.world?.entities)
            ? source.world.entities
            : [];
    for (const entity of entities) {
        if (!entity || typeof entity !== "object" || Array.isArray(entity)) continue;
        const type = String(entity.type || "");
        if (type === "characterEnemy" || normalizedCatalog.enemies[type]) {
            const enemyCatalogId = String(entity.enemyCatalogId || (normalizedCatalog.enemies[type] ? type : "")).trim();
            if (enemyCatalogId) addEnemyDependencies(enemyCatalogId, entity);
            else {
                addCharacterId(entity.characterId || entity.characterProject);
                addCharacterId(entity.projectileVisualCharacterId);
            }
        } else if (type === "enemySpawner") {
            const spawner = normalizeEnemySpawner(entity);
            if (spawner.probabilityPercent > 0) addEnemyPool(entity);
        }
    }

    const autoSpawnSource = source.autoSpawnEnemies && typeof source.autoSpawnEnemies === "object"
        ? source.autoSpawnEnemies
        : source.world?.autoSpawnEnemies;
    if (autoSpawnSource && typeof autoSpawnSource === "object") {
        const autoSpawn = normalizeAutoSpawnEnemies(autoSpawnSource);
        if (autoSpawn.enabled && autoSpawn.probabilityPercent > 0) addEnemyPool(autoSpawnSource);
    }

    return [...characterIds].sort();
}

export function enemyEntityFromDefinition(catalog, enemyId, overrides = {}) {
    const normalizedCatalog = normalizeEnemyDefinitionCatalog(catalog);
    const definition = normalizedCatalog.enemies[String(enemyId)];
    if (!definition) return null;
    return {
        id: String(overrides.id || enemyId),
        type: "characterEnemy",
        characterId: definition.characterId,
        w: definition.defaultSize.w,
        h: definition.defaultSize.h,
        ...JSON.parse(JSON.stringify(definition.defaults)),
        ...overrides
    };
}
