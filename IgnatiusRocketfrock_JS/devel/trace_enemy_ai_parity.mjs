import { readFileSync } from "node:fs";
import {
    FIXED_DT,
    applyAtlasManifestsToWorld,
    applyCharacterCombatProfiles,
    applyEditorLevelToWorld,
    createInitialGameState,
    createInputFrame,
    stepSimulation
} from "../src/core/simulation.js";

const RESOURCE_ROOT = new URL("../resources/", import.meta.url);

function readResourceJson(relativePath) {
    return JSON.parse(readFileSync(new URL(relativePath, RESOURCE_ROOT), "utf8"));
}

function argumentValue(name, fallback = "") {
    const prefix = `--${name}=`;
    const arg = process.argv.slice(2).find((value) => value.startsWith(prefix));
    return arg ? arg.slice(prefix.length) : fallback;
}

function nullableNumber(value) {
    return value === null || value === undefined || !Number.isFinite(Number(value)) ? null : Number(value);
}

function traceRow(state, enemy, frame) {
    const routeIndex = Number(enemy.routeIndex) || 0;
    const edge = Array.isArray(enemy.route) ? enemy.route[routeIndex] || null : null;
    return {
        frame,
        tick: Number(state.clock?.tick) || 0,
        x: Number(enemy.currentTransform?.x) || 0,
        y: Number(enemy.currentTransform?.y) || 0,
        velocityX: Number(enemy.velocityX) || 0,
        velocityY: Number(enemy.velocityY) || 0,
        groundVelocityX: Number(enemy.groundVelocityX) || 0,
        facing: Number(enemy.facing) < 0 ? -1 : 1,
        supportId: enemy.supportId || "",
        currentSupportId: enemy.currentSupportId || "",
        aiState: enemy.aiState || "",
        combatState: enemy.combatState || "",
        movementPhase: enemy.movementPhase || "",
        engaged: enemy.engaged === true,
        alerted: enemy.alerted === true,
        airborne: enemy.airborne === true,
        awarenessTimer: Number(enemy.awarenessTimer) || 0,
        attackTimer: Number(enemy.attackTimer) || 0,
        attackCooldownTimer: Number(enemy.attackCooldownTimer) || 0,
        routePurpose: enemy.routePurpose || "",
        routeIndex,
        routeLength: Array.isArray(enemy.route) ? enemy.route.length : 0,
        routeEdgeFrom: edge?.from || "",
        routeEdgeTo: edge?.to || "",
        routeEdgeType: edge?.type || "",
        routeEdgeDirection: edge?.direction || "",
        routeTraversalPhase: enemy.routeTraversalPhase || "",
        routeTraversalEdgeIndex: Number.isFinite(Number(enemy.routeTraversalEdgeIndex)) ? Number(enemy.routeTraversalEdgeIndex) : -1,
        airTraversalType: enemy.airTraversalType || "",
        airSourceSupportId: enemy.airSourceSupportId || "",
        airTargetSupportId: enemy.airTargetSupportId || "",
        lastSeenSupportId: enemy.lastSeenSupportId || "",
        lastSeenPlayerX: nullableNumber(enemy.lastSeenPlayerX),
        lastSeenPlayerY: nullableNumber(enemy.lastSeenPlayerY),
        routeObservedTargetSupportId: enemy.routeObservedTargetSupportId || "",
        routeObservedTargetX: nullableNumber(enemy.routeObservedTargetX),
        routeObservedTargetY: nullableNumber(enemy.routeObservedTargetY),
        routeRepathTimer: Number(enemy.routeRepathTimer) || 0,
        navigationFailureCount: Number(enemy.navigationFailureCount) || 0,
        hunterWatchdogElapsed: Number(enemy.hunterWatchdogElapsed) || 0,
        hunterWatchdogTimeoutCount: Number(enemy.hunterWatchdogTimeoutCount) || 0,
        projectileCount: Array.isArray(state.projectiles) ? state.projectiles.filter((projectile) => projectile.enemyId === enemy.id).length : 0
    };
}

function createLevelT11TraceState() {
    const level = readResourceJson("levels/level_t11.json");
    const enemyCatalog = readResourceJson("characters/ct_enemies_001.json");
    const state = createInitialGameState({ enemyCatalog });
    if (!applyEditorLevelToWorld(state, level)) {
        throw new Error("Could not apply level_t11");
    }
    const manifests = new Map();
    for (const ref of level.atlasRefs || []) {
        manifests.set(ref.atlasId, { manifest: readResourceJson(ref.manifest) });
    }
    if (!applyAtlasManifestsToWorld(state, manifests)) {
        throw new Error("Could not hydrate level_t11 collision manifests");
    }
    applyCharacterCombatProfiles(state, new Map([["ct_char_enemy_010", {
        attackDuration: 0.62,
        handoffs: [{
            partName: "fireball",
            frameId: "fireball",
            animationSlot: "attack",
            releaseTime: 0.372,
            detach: true,
            localX: 235.0526306831884,
            localY: -192.29922123959187,
            rigScale: 0.5
        }]
    }]]));
    state.story.portalIntro = null;
    state.story.portalExit = null;
    state.story.mailboxEvent = null;
    state.health.amount = 999;
    state.health.max = 999;
    state.player.currentTransform.x = 6000;
    state.player.currentTransform.y = 12558;
    state.player.onGround = true;
    state.player.wasOnGround = true;
    state.player.visible = true;
    state.player.targetable = true;

    const enemy = state.enemies.find((candidate) => candidate.id === "enemy_010_002");
    if (!enemy) throw new Error("level_t11 is missing enemy_010_002");
    enemy.awarenessRange = 2000;
    enemy.facing = 1;
    enemy.projectileDamage = 0;
    enemy.projectileKnockbackX = 0;
    enemy.projectileKnockbackY = 0;
    return { state, enemy };
}

const frames = Math.max(1, Math.min(2000, Number(argumentValue("frames", "360")) || 360));
const { state, enemy } = createLevelT11TraceState();
console.log(JSON.stringify(traceRow(state, enemy, 0)));
for (let frame = 1; frame <= frames; frame += 1) {
    stepSimulation(state, createInputFrame(), FIXED_DT);
    console.log(JSON.stringify(traceRow(state, enemy, frame)));
}
