/*
 * Orbitals simulation compatibility facade.
 *
 * Gameplay state and deterministic behavior belong in this file and the
 * modules under ./sim/. Browser presentation belongs in Orbitals_JS.js.
 * Subsystems expose plain state plus explicit functions; avoid actor-class
 * hierarchies and keep the central update order visible in step().
 *
 * Intended ownership:
 *   state       game-state creation and reset
 *   world       planets, fuel motes, and world motion
 *   player      player flight, firing requests, crash, and respawn
 *   encounters  encounter direction, presenters, and objectives
 *   enemies     enemy state, squads, steering, and damage
 *   motherships mothership arrival, release, and exit
 *   collisions  gameplay collision resolution
 *   projectiles projectile movement, homing, and hits
 *   pickups     pickup lifecycle and collection
 *   effects     simulation-side effect records
 *
 * createOrbitalsSim() remains the stable public facade while implementation
 * is moved into those subsystems one piece at a time.
 */
import { config } from './orbitals_config.js';
import {
  applyEnemyDamage,
  beginEnemyPresentation,
  computeEnemyControlTargetSpeed,
  computeEnemyTravelDistance,
  destroyEnemy,
  getEnemyTargetPlanet,
  measureEnemyInPlayerFrame,
  removeEnemySilently,
  updateEnemySquads
} from './sim/enemies.js';
export {
  ENEMY_FAMILIES,
  ENEMY_MODEL_FILES_BY_FAMILY,
  getEnemyFamilyFiles
} from './sim/enemies.js';
import { pushEvent } from './sim/events.js';
export { formatCombatLog } from './sim/events.js';
import {
  createEncounter,
  createEncounterEntity,
  damageEncounterEntity,
  getEncounterAnchorPosition,
  getEncounterAnchorVelocity,
  getEncounterById,
  updateEncounterDirector
} from './sim/encounters.js';
export {
  getEncounterAnchorPosition,
  getEncounterAnchorVelocity
};
import {
  createFuelMote,
  createPlanetConfig,
  shufflePlanetFiles,
  updateFuelMotes,
  updatePlanets
} from './sim/world.js';
export { parseSeed } from './sim/math.js';
import {
  createGameState,
  resetGameState
} from './sim/state.js';
import {
  canShipsCollide,
  updateShipShipCollisions
} from './sim/collisions.js';
import {
  spawnEnemyExplosion,
  updateEnemyExplosions
} from './sim/effects.js';
import { updateProjectiles } from './sim/projectiles.js';
import {
  crashPlayerShip,
  respawnShip,
  updateShipState as updatePlayerShipState
} from './sim/player.js';
import { stepGame } from './sim/main.js';
import {
  spawnMothershipSquad,
  updateMothershipSquads
} from './sim/motherships.js';

function applyShipCollisionDamage(state, ship, damage, cause, impactPosition = null) {
  if (!ship || damage <= 0) {
    return false;
  }
  if (ship === state.ship) {
    const planet = state.nearestPlanet || state.planets[0] || null;
    if (!planet) {
      return false;
    }
      crashPlayerShip(
        state,
        planet,
        ship.position.clone().sub(impactPosition || ship.position).normalize(),
        impactPosition || ship.position,
        { spawnEnemyExplosion }
      );
    return true;
  }
  return applyEnemyDamage(state, ship, damage, cause, impactPosition);
}

function handleShipCollision(state, first, second, impactPosition, impactSpeed) {
  if (!canShipsCollide(first, second)) {
    return false;
  }
  const collisionDamage = Math.max(1, Math.round(Math.max(impactSpeed, 0.5) * config.shipCollisionDamage * 0.5));
  applyShipCollisionDamage(state, first, collisionDamage, 'collision', impactPosition);
  applyShipCollisionDamage(state, second, collisionDamage, 'collision', impactPosition);
  pushEvent(state, 'ship-collision', {
    shipAId: first === state.ship ? 'player' : first.id,
    shipBId: second === state.ship ? 'player' : second.id,
    shipAKind: first === state.ship ? 'player' : first.kind,
    shipBKind: second === state.ship ? 'player' : second.kind,
    damage: collisionDamage,
    impactSpeed,
    position: impactPosition ? {
      x: impactPosition.x,
      y: impactPosition.y,
      z: impactPosition.z
    } : null
  });
  return true;
}

export function createOrbitalsSim(seed) {
  const state = createGameState(seed);

  function bootstrapWorld() {
    resetGameState(state);

    const planetCount = Math.floor(state.rng() * (config.planetCountMax - config.planetCountMin + 1)) + config.planetCountMin;
    const chosenFiles = shufflePlanetFiles(state.rng).slice(0, planetCount);
    chosenFiles.forEach((file, index) => {
      const planet = createPlanetConfig(state.rng, index, file);
      state.planets.push(planet);
    });

    for (const planet of state.planets) {
      for (let i = 0; i < config.fuelMoteCountPerPlanet; i += 1) {
        const mote = createFuelMote(state.rng, planet, i);
        planet.fuelMotes.push(mote);
        state.fuelMotes.push(mote);
      }
    }

    updatePlanets(state, 0, state.time);
    const spawnPlanet = respawnShip(state);
    if (config.startWithInitialInvasion) {
      const targetPlanetIndex = spawnPlanet ? state.planets.indexOf(spawnPlanet) : -1;
      spawnMothershipSquad(state, targetPlanetIndex, mothershipServices, { spawnAtArrival: true });
    }
    state.loaded = true;
    return state;
  }

  const encounterServices = {
    getEnemyTargetPlanet,
    measureEnemyInPlayerFrame,
    beginEnemyPresentation
  };

  const mothershipServices = {
    getEnemyTargetPlanet,
    computeEnemyControlTargetSpeed,
    computeEnemyTravelDistance,
    destroyEnemy,
    removeEnemySilently
  };

  const stepSystems = {
    updateWorld: updatePlanets,
    updatePlayer: (currentState, deltaTime, controls) => {
      updatePlayerShipState(currentState, deltaTime, controls, { spawnEnemyExplosion });
    },
    updateEncounters: (currentState, deltaTime, time) => {
      updateEncounterDirector(currentState, deltaTime, time, encounterServices);
    },
    updateEnemies: updateEnemySquads,
    updateMotherships: (currentState, deltaTime, time) => {
      updateMothershipSquads(currentState, deltaTime, time, mothershipServices);
    },
    updateShipCollisions: (currentState) => {
      updateShipShipCollisions(currentState, { handleShipCollision });
    },
    updateProjectiles: (currentState, deltaTime) => {
      updateProjectiles(currentState, deltaTime, { applyEnemyDamage });
    },
    updateEffects: updateEnemyExplosions,
    updateFuelMotes
  };

  function step(dt, controls = {}) {
    return stepGame(state, dt, controls, stepSystems);
  }

  return {
    state,
    bootstrapWorld,
    step,
    respawnShip: () => respawnShip(state),
    createEncounter: (options = {}) => createEncounter(state, options),
    createEncounterEntity: (options = {}) => createEncounterEntity(state, options),
    forceEnemyPresentation: (enemyId, kind, options = {}) => {
      const enemy = state.enemies.find((candidate) => candidate.id === enemyId);
      if (!enemy) {
        return false;
      }
      let encounter = options.encounterId != null ? getEncounterById(state, options.encounterId) : getEncounterById(state, enemy.encounterId);
      if (!encounter) {
        const planetIndex = Math.max(0, enemy.targetPlanetIndex ?? 0);
        encounter = createEncounter(state, {
          type: options.encounterType || 'planetInvasion',
          status: 'active',
          anchorKind: options.anchorKind || 'planet',
          anchorPlanetIndex: planetIndex,
          objectiveKind: 'clearEnemies',
          spawnedEnemyIds: [enemy.id],
          totalReleased: 1
        });
        enemy.encounterId = encounter.id;
      }
      return beginEnemyPresentation(state, enemy, encounter, kind, { ...options, forced: true });
    },
    destroyEnemy: (enemyId, cause = 'projectile') => {
      const enemy = state.enemies.find((candidate) => candidate.id === enemyId);
      return destroyEnemy(state, enemy, cause);
    },
    damageEncounterEntity: (entityId, damage) => damageEncounterEntity(state, entityId, damage)
  };
}
