import { parseEnemySelection } from "./enemy-pool-data.js";

export const DEFAULT_AUTO_SPAWN_ENEMIES = Object.freeze({
    enabled: false,
    probabilityPercent: 0,
    enemyPool: "1-999"
});

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
    return {
        version: Math.max(1, Math.floor(finiteNumber(source.version ?? source.meta?.version, 1))),
        catalogId: String(source.catalogId || "enemy-definitions"),
        enemies
    };
}

export function resolveAutoSpawnEnemyIds(config, catalog) {
    const normalizedConfig = normalizeAutoSpawnEnemies(config);
    const normalizedCatalog = normalizeEnemyDefinitionCatalog(catalog);
    return parseEnemySelection(normalizedConfig.enemyPool, Object.keys(normalizedCatalog.enemies));
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
