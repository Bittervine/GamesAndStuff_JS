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
  getEnemyItems,
  getPlayerState,
  getWorldPlanets,
  getWorldState,
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
import { updatePickups } from './sim/pickups.js';
import {
  crashPlayerShip,
  crashPlayerShipIntoSun,
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
  const player = getPlayerState(state);
  const world = getWorldState(state);
  if (ship === player.ship) {
    const planet = world.nearestPlanet || world.planets[0] || null;
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
  const playerShip = getPlayerState(state).ship;
  const collisionDamage = Math.max(1, Math.round(Math.max(impactSpeed, 0.5) * config.shipCollisionDamage * 0.5));
  applyShipCollisionDamage(state, first, collisionDamage, 'collision', impactPosition);
  applyShipCollisionDamage(state, second, collisionDamage, 'collision', impactPosition);
  pushEvent(state, 'ship-collision', {
    shipAId: first === playerShip ? 'player' : first.id,
    shipBId: second === playerShip ? 'player' : second.id,
    shipAKind: first === playerShip ? 'player' : first.kind,
    shipBKind: second === playerShip ? 'player' : second.kind,
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

function handlePlayerProjectileHit(state, projectile, impactPosition) {
  const player = getPlayerState(state);
  const ship = player.ship;
  if (!ship || player.crashed) {
    return false;
  }

  if ((player.shields || 0) > 0) {
    player.shields = Math.max(0, (player.shields || 0) - 1);
    spawnEnemyExplosion(state, impactPosition || ship.position, 'shield');
    pushEvent(state, 'player-shield-hit', {
      projectileId: projectile.id,
      ownerEnemyId: projectile.ownerEnemyId ?? -1,
      shields: player.shields,
      position: impactPosition ? {
        x: impactPosition.x,
        y: impactPosition.y,
        z: impactPosition.z
      } : null
    });
    return true;
  }

  const world = getWorldState(state);
  const planet = world.nearestPlanet || world.planets[0] || null;
  pushEvent(state, 'player-hit', {
    projectileId: projectile.id,
    ownerEnemyId: projectile.ownerEnemyId ?? -1,
    position: impactPosition ? {
      x: impactPosition.x,
      y: impactPosition.y,
      z: impactPosition.z
    } : null
  });
  if (planet) {
    const crashNormal = ship.position.clone().sub(planet.position).normalize();
    crashPlayerShip(state, planet, crashNormal, impactPosition || ship.position, { spawnEnemyExplosion });
  } else {
    crashPlayerShipIntoSun(state, impactPosition || ship.position, { spawnEnemyExplosion });
  }
  return true;
}

export function createOrbitalsSim(seed) {
  const state = createGameState(seed);

  function bootstrapWorld() {
    resetGameState(state);

    const world = getWorldState(state);
    const planetCount = Math.floor(state.rng() * (config.planetCountMax - config.planetCountMin + 1)) + config.planetCountMin;
    const chosenFiles = shufflePlanetFiles(state.rng).slice(0, planetCount);
    chosenFiles.forEach((file, index) => {
      const planet = createPlanetConfig(state.rng, index, file);
      world.planets.push(planet);
    });

    for (const planet of world.planets) {
      for (let i = 0; i < config.fuelMoteCountPerPlanet; i += 1) {
        const mote = createFuelMote(state.rng, planet, i);
        planet.fuelMotes.push(mote);
        world.fuelMotes.push(mote);
      }
    }

    updatePlanets(state, 0, state.time);
    const spawnPlanet = respawnShip(state);
    if (config.startWithInitialInvasion) {
      const targetPlanetIndex = spawnPlanet ? getWorldPlanets(state).indexOf(spawnPlanet) : -1;
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
      updateProjectiles(currentState, deltaTime, { applyEnemyDamage, handlePlayerProjectileHit });
    },
    updatePickups: (currentState, deltaTime) => {
      updatePickups(currentState, deltaTime);
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
      const enemy = getEnemyItems(state).find((candidate) => candidate.id === enemyId);
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
      const enemy = getEnemyItems(state).find((candidate) => candidate.id === enemyId);
      return destroyEnemy(state, enemy, cause);
    },
    damageEncounterEntity: (entityId, damage) => damageEncounterEntity(state, entityId, damage)
  };
}
