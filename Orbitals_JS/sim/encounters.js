/*
 * Encounter director subsystem.
 *
 * Owns encounter state transitions, route entities, mission outcomes,
 * presenter/objective-attacker budgets, and encounter bookkeeping. Detailed
 * enemy presentation flight remains in the enemy/facade layer and is invoked
 * through the small services object passed to updateEncounterDirector().
 */
import * as THREE from '../lib/three.module.js';
import { config } from '../orbitals_config.js';
import { pushEvent } from './events.js';
import {
    createEncounterEntityState,
    createEncounterState,
    resetEncounterDirectorState
} from './state.js';

export function createEncounter(state, options = {}) {
    return createEncounterState(state, options);
}

export function createEncounterEntity(state, options = {}) {
    return createEncounterEntityState(state, options);
}

export function damageEncounterEntity(state, entityId, damage) {
    const entity = (state.encounterEntities || []).find((candidate) => candidate.id === entityId);
    if (!entity || entity.destroyed) {
        return false;
    }
    entity.health = Math.max(0, entity.health - damage);
    if (entity.health <= 0) {
        entity.destroyed = true;
        pushEvent(state, 'encounter-entity-destroyed', {
            entityId: entity.id,
            kind: entity.kind
        });
    }
    return true;
}

export function getEncounterById(state, encounterId) {
    if (!state || !state.encounterDirector || encounterId == null || encounterId < 0) {
        return null;
    }
    return state.encounterDirector.encounters.find((encounter) => encounter.id === encounterId) || null;
}

export function getEncounterAnchorPosition(state, encounter) {
    if (!state || !encounter) {
        return null;
    }
    if (encounter.anchorKind === 'planet') {
        const planet = state.planets[Math.max(0, Math.min(state.planets.length - 1, encounter.anchorPlanetIndex))];
        return planet ? planet.position.clone() : null;
    }
    if (encounter.anchorKind === 'entity') {
        const entity = (state.encounterEntities || []).find((candidate) => candidate.id === encounter.anchorEntityId);
        return entity ? entity.position.clone() : null;
    }
    if (encounter.anchorKind === 'point') {
        return encounter.anchorPoint ? encounter.anchorPoint.clone() : null;
    }
    if (encounter.anchorKind === 'player') {
        return state.ship ? state.ship.position.clone() : null;
    }
    return null;
}

export function getEncounterAnchorVelocity(state, encounter) {
    if (!state || !encounter) {
        return new THREE.Vector3();
    }
    if (encounter.anchorKind === 'planet') {
        const planet = state.planets[Math.max(0, Math.min(state.planets.length - 1, encounter.anchorPlanetIndex))];
        return planet ? planet.velocity.clone() : new THREE.Vector3();
    }
    if (encounter.anchorKind === 'entity') {
        const entity = (state.encounterEntities || []).find((candidate) => candidate.id === encounter.anchorEntityId);
        return entity ? entity.velocity.clone() : new THREE.Vector3();
    }
    return new THREE.Vector3();
}

export function getEncounterEnemies(state, encounter) {
    if (!state || !encounter || !Array.isArray(state.enemies)) {
        return [];
    }
    const ids = new Set(encounter.spawnedEnemyIds || []);
    return state.enemies.filter((enemy) => (
        enemy
        && enemy.health > 0
        && (
            enemy.encounterId === encounter.id
            || ids.has(enemy.id)
        )
    ));
}

export function getEncounterProtectedEntity(state, encounter) {
    if (!state || !encounter) {
        return null;
    }
    return (state.encounterEntities || []).find((entity) => entity.id === encounter.protectedEntityId) || null;
}

function setMissionMessage(state, message, kind = 'active') {
    if (!state || !state.encounterDirector || !message) {
        return;
    }
    state.encounterDirector.missionMessage = message;
    state.encounterDirector.missionMessageKind = kind;
    state.encounterDirector.missionMessageUntil = kind === 'active'
        ? Infinity
        : state.time + 6;
}

export function markEncounterActive(state, encounter) {
    if (!state || !encounter || encounter.status === 'active') {
        return;
    }
    encounter.status = 'active';
    encounter.startedAt = state.time;
    pushEvent(state, 'encounter-start', {
        encounterId: encounter.id,
        encounterType: encounter.type,
        anchorKind: encounter.anchorKind,
        anchorPlanetIndex: encounter.anchorPlanetIndex,
        anchorEntityId: encounter.anchorEntityId
    });
    if (encounter.type === 'planetInvasion') {
        pushEvent(state, 'planet-invasion-start', {
            encounterId: encounter.id,
            planetIndex: encounter.anchorPlanetIndex,
            mothershipSquadId: encounter.mothershipSquadId
        });
    }
    if (encounter.missionActiveText) {
        setMissionMessage(state, encounter.missionActiveText, 'active');
    }
}

function finishEncounter(state, encounter, status, eventType, messageKind, messageText) {
    if (!state || !encounter || encounter.status === status) {
        return;
    }
    encounter.status = status;
    encounter.endedAt = state.time;
    if (eventType === 'encounter-success') {
        encounter.successEventPushed = true;
    } else if (eventType === 'encounter-fail') {
        encounter.failEventPushed = true;
    }
    pushEvent(state, eventType, {
        encounterId: encounter.id,
        encounterType: encounter.type,
        totalReleased: encounter.totalReleased,
        totalDestroyed: encounter.totalDestroyed
    });
    pushEvent(state, 'encounter-end', {
        encounterId: encounter.id,
        encounterType: encounter.type,
        status: encounter.status,
        totalReleased: encounter.totalReleased,
        totalDestroyed: encounter.totalDestroyed
    });
    if (messageText) {
        setMissionMessage(state, messageText, messageKind);
    }
}

export function ensurePlanetInvasionEncounterForMothership(state, mothershipSquad, activate = false) {
    if (!state || !mothershipSquad) {
        return null;
    }
    if (!state.encounterDirector) {
        resetEncounterDirectorState(state);
    }
    let encounter = getEncounterById(state, mothershipSquad.encounterId);
    if (!encounter) {
        encounter = state.encounterDirector.encounters.find((candidate) => (
            candidate.type === 'planetInvasion'
            && candidate.mothershipSquadId === mothershipSquad.id
        )) || null;
    }
    if (!encounter) {
        const planet = state.planets[mothershipSquad.targetPlanetIndex] || null;
        encounter = createEncounterState(state, {
            type: 'planetInvasion',
            status: 'inactive',
            anchorKind: 'planet',
            anchorPlanetIndex: mothershipSquad.targetPlanetIndex,
            objectiveKind: 'clearEnemies',
            mothershipSquadId: mothershipSquad.id,
            missionActiveText: planet ? `Mission: Clear invasion at ${planet.name}` : 'Mission: Clear the invasion',
            missionSuccessText: planet ? `Mission Complete - ${planet.name} is safe` : 'Mission Complete - Planet is safe'
        });
    }
    mothershipSquad.encounterId = encounter.id;
    if (activate) {
        markEncounterActive(state, encounter);
    }
    return encounter;
}

export function registerEncounterEnemyReleased(state, encounter, enemy) {
    if (!state || !encounter || !enemy) {
        return;
    }
    enemy.encounterId = encounter.id;
    if (!encounter.spawnedEnemyIds.includes(enemy.id)) {
        encounter.spawnedEnemyIds.push(enemy.id);
        encounter.totalReleased += 1;
    }
    encounter.reserveEnemyIds = encounter.reserveEnemyIds || [];
    if (!encounter.reserveEnemyIds.includes(enemy.id)) {
        encounter.reserveEnemyIds.push(enemy.id);
    }
}

export function registerEncounterEnemyDestroyed(state, enemy) {
    if (!state || !enemy) {
        return;
    }
    const encounter = getEncounterById(state, enemy.encounterId);
    if (encounter && encounter.spawnedEnemyIds.includes(enemy.id)) {
        encounter.totalDestroyed += 1;
        encounter.activePresenterEnemyIds = encounter.activePresenterEnemyIds.filter((id) => id !== enemy.id);
        encounter.activeObjectiveAttackerEnemyIds = encounter.activeObjectiveAttackerEnemyIds.filter((id) => id !== enemy.id);
        encounter.reserveEnemyIds = encounter.reserveEnemyIds.filter((id) => id !== enemy.id);
    }
    if (state.encounterDirector) {
        state.encounterDirector.activePresenterEnemyIds = state.encounterDirector.activePresenterEnemyIds.filter((id) => id !== enemy.id);
        state.encounterDirector.activeObjectiveAttackerEnemyIds = state.encounterDirector.activeObjectiveAttackerEnemyIds.filter((id) => id !== enemy.id);
    }
}

export function updateEncounterEntities(state, dt) {
    if (!Array.isArray(state.encounterEntities)) {
        return;
    }
    for (const entity of state.encounterEntities) {
        if (!entity || entity.destroyed || entity.health <= 0) {
            continue;
        }
        entity.previousPosition.copy(entity.position);
        if (entity.routeDirection && entity.routeDirection.lengthSq() > 1e-8 && entity.routeRemaining > 0) {
            const stepDistance = Math.min(entity.speed * dt, entity.routeRemaining);
            entity.position.addScaledVector(entity.routeDirection, stepDistance);
            entity.routeRemaining -= stepDistance;
            entity.velocity.copy(entity.routeDirection).multiplyScalar(entity.speed);
            entity.forward.copy(entity.routeDirection).normalize();
        } else {
            entity.velocity.set(0, 0, 0);
        }
    }
}

export function isEncounterActive(encounter) {
    return Boolean(encounter && encounter.status === 'active');
}

function isEnemyEligibleForPresentationInEncounter(state, enemy, encounter, services) {
    if (!state || !enemy || !encounter || enemy.health <= 0 || enemy.kind === 'mothership') {
        return false;
    }
    if (enemy.encounterId !== encounter.id && !encounter.spawnedEnemyIds.includes(enemy.id)) {
        return false;
    }
    if (enemy.combatRole === 'presenter' || enemy.combatRole === 'objectiveAttacker') {
        return false;
    }
    const squad = state.enemySquads.find((candidate) => candidate.id === enemy.squadId);
    if (encounter.type === 'planetInvasion' && squad?.mode !== 'swarm') {
        return false;
    }
    const age = enemy.spawnTime == null ? Infinity : state.time - enemy.spawnTime;
    if (age < config.encounterCandidateMinAge) {
        return false;
    }
    if (Number.isFinite(enemy.lastPresentationTime) && state.time - enemy.lastPresentationTime < config.encounterPresenterCooldown) {
        return false;
    }
    if (enemy.presentation && enemy.presentation.phase === 'cooldown' && state.time - (enemy.presentation.phaseStartedAt || 0) < config.encounterPresenterCooldown) {
        return false;
    }
    const planet = services.getEnemyTargetPlanet(state, enemy);
    if (encounter.anchorKind === 'planet') {
        if (!planet || state.planets.indexOf(planet) !== encounter.anchorPlanetIndex) {
            return false;
        }
        const altitude = enemy.position.distanceTo(planet.position) - planet.radius;
        if (altitude < config.atmosphereTerrainCrashAltitude + 3 || altitude > Math.max(planet.atmosphereRadius - planet.radius, config.planetEscapeAltitude) * 1.4) {
            return false;
        }
        const metrics = services.measureEnemyInPlayerFrame(state, enemy);
        if (!metrics || metrics.distance > config.encounterShootableMaxDistance * 0.42 || metrics.angleDeg > config.encounterShootableAngleDeg * 4.6) {
            return false;
        }
    }
    return true;
}

function isEnemyEligibleForObjectiveAttackInEncounter(state, enemy, encounter, services) {
    if (!isEnemyEligibleForPresentationInEncounter(state, enemy, encounter, services)) {
        return false;
    }
    return encounter.type === 'transportDefense' || encounter.type === 'convoyEscort' || encounter.type === 'bossSupportWave';
}

function chooseActiveEncounterForPlayer(state) {
    const director = state.encounterDirector;
    if (!director || director.encounters.length === 0) {
        return null;
    }
    const activeEncounters = director.encounters.filter(isEncounterActive);
    if (activeEncounters.length === 0) {
        director.activeEncounterId = -1;
        return null;
    }
    const playerPlanetIndex = state.ship?.boundPlanet ? state.planets.indexOf(state.ship.boundPlanet) : -1;
    const samePlanetInvasion = activeEncounters.find((encounter) => (
        encounter.type === 'planetInvasion'
        && encounter.anchorPlanetIndex === playerPlanetIndex
        && getEncounterEnemies(state, encounter).length > 0
    ));
    if (samePlanetInvasion) {
        director.activeEncounterId = samePlanetInvasion.id;
        return samePlanetInvasion;
    }
    let bestEncounter = null;
    let bestDistance = Infinity;
    for (const encounter of activeEncounters) {
        const enemies = getEncounterEnemies(state, encounter);
        if (encounter.type === 'planetInvasion' && enemies.length === 0) {
            continue;
        }
        const anchor = getEncounterAnchorPosition(state, encounter);
        const distance = anchor && state.ship ? anchor.distanceTo(state.ship.position) : 0;
        if (distance < bestDistance) {
            bestDistance = distance;
            bestEncounter = encounter;
        }
    }
    director.activeEncounterId = bestEncounter ? bestEncounter.id : -1;
    return bestEncounter;
}

function refreshEncounterEnemyRoles(state, encounter) {
    const enemies = getEncounterEnemies(state, encounter);
    const activePresenterIds = new Set();
    const activeObjectiveIds = new Set();
    for (const enemy of enemies) {
        if (enemy.combatRole === 'presenter' && enemy.presentation && enemy.presentation.phase !== 'cooldown') {
            activePresenterIds.add(enemy.id);
            enemy.isPrimaryThreat = true;
            enemy.hudPriority = config.encounterPresenterHudPriority;
            continue;
        }
        if (enemy.combatRole === 'objectiveAttacker' && enemy.objectiveAttack && enemy.objectiveAttack.phase !== 'cooldown') {
            activeObjectiveIds.add(enemy.id);
            enemy.isPrimaryThreat = true;
            enemy.hudPriority = config.encounterObjectiveAttackerHudPriority;
            continue;
        }
        enemy.isPrimaryThreat = false;
        enemy.hudPriority = config.encounterReserveHudPriority;
        const coolingDown = Number.isFinite(enemy.lastPresentationTime)
            && state.time - enemy.lastPresentationTime < config.encounterPresenterCooldown;
        enemy.combatRole = coolingDown ? 'cooldown' : 'candidate';
    }
    encounter.activePresenterEnemyIds = encounter.activePresenterEnemyIds.filter((id) => activePresenterIds.has(id));
    encounter.activeObjectiveAttackerEnemyIds = encounter.activeObjectiveAttackerEnemyIds.filter((id) => activeObjectiveIds.has(id));
}

function pickPresentationKind(state, encounter, enemy, services) {
    const director = state.encounterDirector;
    const metrics = services.measureEnemyInPlayerFrame(state, enemy);
    const sideCrossLooksReadable = metrics
        && metrics.forward > 0
        && Math.abs(metrics.right) > config.encounterShootableMinDistance
        && metrics.angleDeg > config.encounterShootableAngleDeg
        && metrics.angleDeg < 115;
    if (encounter.type === 'planetInvasion' && !sideCrossLooksReadable) {
        return 'behindCatchup';
    }
    const kinds = encounter.type === 'freeSpaceAmbush'
        ? ['behindCatchup', 'sideCross', 'headOnBreakaway']
        : ['behindCatchup', 'sideCross'];
    const start = director.lastPresentationKindIndex || 0;
    for (let i = 0; i < kinds.length; i += 1) {
        const kind = kinds[(start + i) % kinds.length];
        if (enemy.presentationKindLastUsed !== kind || kinds.length === 1) {
            director.lastPresentationKindIndex = (start + i + 1) % kinds.length;
            return kind;
        }
    }
    director.lastPresentationKindIndex = (start + 1) % kinds.length;
    return kinds[start % kinds.length];
}

function assignPresentationSlots(state, encounter, services) {
    const activeCount = encounter.activePresenterEnemyIds.length;
    const availableSlots = Math.max(0, config.encounterMaxActivePresenters - activeCount);
    if (availableSlots <= 0) {
        return;
    }
    const candidates = getEncounterEnemies(state, encounter)
        .filter((enemy) => isEnemyEligibleForPresentationInEncounter(state, enemy, encounter, services))
        .sort((a, b) => {
            const aSquad = state.enemySquads.find((squad) => squad.id === a.squadId);
            const bSquad = state.enemySquads.find((squad) => squad.id === b.squadId);
            const aSwarm = aSquad?.mode === 'swarm' ? 0 : 1;
            const bSwarm = bSquad?.mode === 'swarm' ? 0 : 1;
            if (aSwarm !== bSwarm) {
                return aSwarm - bSwarm;
            }
            return (a.lastPresentationTime || -Infinity) - (b.lastPresentationTime || -Infinity);
        });
    for (let i = 0; i < Math.min(availableSlots, candidates.length); i += 1) {
        const enemy = candidates[i];
        const kind = pickPresentationKind(state, encounter, enemy, services);
        services.beginEnemyPresentation(state, enemy, encounter, kind);
    }
}

function beginEnemyObjectiveAttack(state, enemy, encounter) {
    if (!enemy || !encounter) {
        return false;
    }
    enemy.encounterId = encounter.id;
    enemy.combatRole = 'objectiveAttacker';
    enemy.isPrimaryThreat = true;
    enemy.hudPriority = config.encounterObjectiveAttackerHudPriority;
    enemy.objectiveAttack = {
        kind: encounter.type === 'bossSupportWave' ? 'interceptProtectedEntity' : 'transportAttackRun',
        phase: 'stage',
        startedAt: state.time,
        phaseStartedAt: state.time,
        targetEntityId: encounter.protectedEntityId,
        attackSlotSide: state.rng() < 0.5 ? -1 : 1,
        firedAtTarget: false,
        committed: false,
        reachedAttackSlot: false
    };
    encounter.activeObjectiveAttackerEnemyIds = encounter.activeObjectiveAttackerEnemyIds.filter((id) => id !== enemy.id);
    encounter.activeObjectiveAttackerEnemyIds.push(enemy.id);
    state.encounterDirector.activeObjectiveAttackerEnemyIds = state.encounterDirector.activeObjectiveAttackerEnemyIds.filter((id) => id !== enemy.id);
    state.encounterDirector.activeObjectiveAttackerEnemyIds.push(enemy.id);
    pushEvent(state, 'objective-attacker-selected', {
        enemyId: enemy.id,
        encounterId: encounter.id,
        encounterType: encounter.type,
        targetEntityId: encounter.protectedEntityId
    });
    return true;
}

function assignObjectiveAttackSlots(state, encounter, services) {
    if (!(encounter.type === 'transportDefense' || encounter.type === 'convoyEscort' || encounter.type === 'bossSupportWave')) {
        return;
    }
    const activeCount = encounter.activeObjectiveAttackerEnemyIds.length;
    const availableSlots = Math.max(0, config.encounterMaxActiveObjectiveAttackers - activeCount);
    if (availableSlots <= 0) {
        return;
    }
    const candidates = getEncounterEnemies(state, encounter)
        .filter((enemy) => isEnemyEligibleForObjectiveAttackInEncounter(state, enemy, encounter, services))
        .sort((a, b) => (a.lastPresentationTime || -Infinity) - (b.lastPresentationTime || -Infinity));
    for (let i = 0; i < Math.min(availableSlots, candidates.length); i += 1) {
        beginEnemyObjectiveAttack(state, candidates[i], encounter);
    }
}

function updateEncounterActivation(state, encounter) {
    if (!encounter || encounter.status !== 'inactive' || encounter.activatedByPlayer !== true) {
        return;
    }
    const anchor = getEncounterAnchorPosition(state, encounter);
    if (!anchor || !state.ship) {
        return;
    }
    if (state.ship.position.distanceTo(anchor) <= encounter.activationRadius) {
        markEncounterActive(state, encounter);
    }
}

function updatePlanetInvasionClearState(state, encounter) {
    if (!encounter || encounter.type !== 'planetInvasion' || encounter.status !== 'active') {
        return;
    }
    const mothershipSquad = state.mothershipSquads.find((squad) => squad.id === encounter.mothershipSquadId);
    const mothershipAlive = state.enemies.some((enemy) => enemy.squadId === encounter.mothershipSquadId && enemy.kind === 'mothership' && enemy.health > 0);
    const mothershipDone = !mothershipSquad
        || mothershipSquad.fightersReleased >= mothershipSquad.fightersTotal
        || !mothershipAlive;
    const livingEncounterEnemies = getEncounterEnemies(state, encounter).filter((enemy) => enemy.kind !== 'mothership');
    if (!mothershipDone || livingEncounterEnemies.length > 0 || encounter.totalReleased <= 0) {
        return;
    }
    encounter.clearEventPushed = true;
    pushEvent(state, 'planet-invasion-cleared', {
        encounterId: encounter.id,
        planetIndex: encounter.anchorPlanetIndex,
        mothershipSquadId: encounter.mothershipSquadId,
        totalReleased: encounter.totalReleased,
        totalDestroyed: encounter.totalDestroyed
    });
    finishEncounter(state, encounter, 'cleared', 'encounter-success', 'success', encounter.missionSuccessText || 'Mission Complete - Planet is safe');
}

function updateObjectiveEncounterOutcome(state, encounter) {
    if (!encounter || !isEncounterActive(encounter)) {
        return;
    }
    if (encounter.type === 'transportDefense' || encounter.type === 'convoyEscort') {
        const protectedEntity = getEncounterProtectedEntity(state, encounter);
        const anchor = getEncounterAnchorPosition(state, encounter);
        if (anchor && state.ship && state.ship.position.distanceTo(anchor) > encounter.abortDistance) {
            finishEncounter(state, encounter, 'failed', 'encounter-fail', 'fail', encounter.missionAbortText || 'Mission Aborted - Transport was left to its fate');
            return;
        }
        if (protectedEntity && (protectedEntity.destroyed || protectedEntity.health <= 0)) {
            finishEncounter(state, encounter, 'failed', 'encounter-fail', 'fail', encounter.missionFailureText || 'Mission Failed - Transport was destroyed');
            return;
        }
        if (encounter.duration > 0 && state.time - encounter.startedAt >= encounter.duration) {
            finishEncounter(state, encounter, 'succeeded', 'encounter-success', 'success', encounter.missionSuccessText || 'Mission Complete - Transport is safe');
        }
    } else if (encounter.type === 'freeSpaceAmbush' || encounter.type === 'bossSupportWave') {
        const livingEnemies = getEncounterEnemies(state, encounter);
        if (livingEnemies.length === 0 && encounter.totalReleased > 0) {
            finishEncounter(state, encounter, 'succeeded', 'encounter-success', 'success', encounter.missionSuccessText || 'Mission Complete');
        } else if (encounter.duration > 0 && state.time - encounter.startedAt >= encounter.duration) {
            finishEncounter(state, encounter, 'succeeded', 'encounter-success', 'success', encounter.missionSuccessText || 'Mission Complete');
        }
    }
}

export function updateEncounterDirector(state, dt, time, services) {
    if (!config.encounterDirectorEnabled) {
        return;
    }
    if (!state.encounterDirector) {
        resetEncounterDirectorState(state);
    }
    const director = state.encounterDirector;
    updateEncounterEntities(state, dt);

    for (const encounter of director.encounters) {
        updateEncounterActivation(state, encounter);
        if (!isEncounterActive(encounter)) {
            continue;
        }
        refreshEncounterEnemyRoles(state, encounter);
    }

    const activeEncounter = chooseActiveEncounterForPlayer(state);
    director.activePresenterEnemyIds = director.encounters.flatMap((encounter) => encounter.activePresenterEnemyIds);
    director.activeObjectiveAttackerEnemyIds = director.encounters.flatMap((encounter) => encounter.activeObjectiveAttackerEnemyIds);
    director.nextSelectionTimer = Math.max(0, director.nextSelectionTimer - dt);
    if (activeEncounter && director.nextSelectionTimer <= 0) {
        assignObjectiveAttackSlots(state, activeEncounter, services);
        assignPresentationSlots(state, activeEncounter, services);
        director.nextSelectionTimer = config.encounterSelectionInterval;
    }

    for (const encounter of director.encounters) {
        updatePlanetInvasionClearState(state, encounter);
        updateObjectiveEncounterOutcome(state, encounter);
    }

    if (Number.isFinite(director.missionMessageUntil) && time > director.missionMessageUntil) {
        director.missionMessage = '';
        director.missionMessageKind = '';
        director.missionMessageUntil = 0;
    }
}
