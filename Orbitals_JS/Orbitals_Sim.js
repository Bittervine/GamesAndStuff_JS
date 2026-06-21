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
import * as THREE from './lib/three.module.js';
import { config } from './orbitals_config.js';
import {
  ENEMY_FAMILIES,
  ENEMY_MODEL_FILES_BY_FAMILY,
  getEnemyFamilyFiles,
  updateEnemyShipState
} from './sim/enemies.js';
export {
  ENEMY_FAMILIES,
  ENEMY_MODEL_FILES_BY_FAMILY,
  getEnemyFamilyFiles
} from './sim/enemies.js';
import { pushEvent } from './sim/events.js';
export { formatCombatLog } from './sim/events.js';
import {
  createFuelMote,
  createPlanetConfig,
  pickNearestPlanet,
  shufflePlanetFiles,
  updateFuelMotes,
  updatePlanets
} from './sim/world.js';
import {
  buildBasisFromNormal,
  easeExp,
  mulberry32,
  smoothstep
} from './sim/math.js';
export { parseSeed } from './sim/math.js';
import {
  createEncounterEntityState,
  createEncounterState,
  createGameState,
  createEnemyState,
  ENEMY_HIT_RADIUS,
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
import {
  segmentIntersectsSphere,
  updateProjectiles
} from './sim/projectiles.js';
import {
  crashPlayerShip,
  respawnShip,
  updateShipState as updatePlayerShipState
} from './sim/player.js';
import {
  beginPlanetCapture,
  computeAtmosphereLiftState
} from './sim/physics.js';
import { stepGame } from './sim/main.js';

const worldUp = new THREE.Vector3(0, 1, 0);
const tempVecA = new THREE.Vector3();
const tempVecB = new THREE.Vector3();
const tempVecC = new THREE.Vector3();
const tempVecD = new THREE.Vector3();
const tempVecE = new THREE.Vector3();
const tempVecF = new THREE.Vector3();
const tempVecG = new THREE.Vector3();
const tempVecH = new THREE.Vector3();
const tempVecI = new THREE.Vector3();
const tempVecJ = new THREE.Vector3();
const tempVecK = new THREE.Vector3();
const tempVecL = new THREE.Vector3();
const tempVecM = new THREE.Vector3();
const tempVecN = new THREE.Vector3();

function getMothershipRng(state) {
  if (!state.mothershipRng) {
    state.mothershipRng = mulberry32(((state.seed >>> 0) ^ 0x9e3779b9) >>> 0);
  }
  return state.mothershipRng;
}

function getEncounterById(state, encounterId) {
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

function getEncounterProtectedEntity(state, encounter) {
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

function markEncounterActive(state, encounter) {
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

function ensurePlanetInvasionEncounterForMothership(state, mothershipSquad, activate = false) {
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

function registerEncounterEnemyReleased(state, encounter, enemy) {
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

function pickRandomPlanetIndex(state, excludeIndex = -1, rng = state.rng) {
  if (state.planets.length === 0) {
    return -1;
  }
  if (state.planets.length === 1) {
    return 0;
  }
  let index = Math.floor(rng() * state.planets.length);
  if (index === excludeIndex) {
    index = (index + 1 + Math.floor(rng() * (state.planets.length - 1))) % state.planets.length;
  }
  return index;
}

function pickEnemyFamily(state, excludedFamilies = [], rng = state.rng) {
  const allowedFamilies = ENEMY_FAMILIES.filter((family) => !excludedFamilies.includes(family));
  const pool = allowedFamilies.length > 0 ? allowedFamilies : ENEMY_FAMILIES;
  return pool[Math.floor(rng() * pool.length)];
}

function unwrapAngleDelta(previousAngle, nextAngle) {
  let delta = nextAngle - previousAngle;
  if (delta > Math.PI) {
    delta -= Math.PI * 2;
  } else if (delta < -Math.PI) {
    delta += Math.PI * 2;
  }
  return delta;
}

function getEnemyOrbitAngle(planet, position) {
  const radial = planet.position.lengthSq() > 1e-6
    ? planet.position.clone().normalize()
    : worldUp.clone();
  const basis = buildBasisFromNormal(radial);
  const relative = position.clone().sub(planet.position);
  return Math.atan2(relative.dot(basis.bitangent), relative.dot(basis.tangent));
}

function pickEnemySpawnPlanetIndex(state) {
  if (state.nearestPlanet) {
    const nearestIndex = state.planets.indexOf(state.nearestPlanet);
    if (nearestIndex >= 0) {
      return nearestIndex;
    }
  }
  if (state.ship?.boundPlanet) {
    const boundIndex = state.planets.indexOf(state.ship.boundPlanet);
    if (boundIndex >= 0) {
      return boundIndex;
    }
  }
  return Math.max(0, state.respawnPlanetIndex % Math.max(1, state.planets.length));
}

function createEnemySquadState(state, targetPlanetIndex = -1, kind = 'regular', rng = state.rng) {
  const targetIndex = targetPlanetIndex >= 0 ? targetPlanetIndex : pickRandomPlanetIndex(state, -1, rng);
  const nextPlanetIndex = pickRandomPlanetIndex(state, targetIndex, rng);
  const family = kind === 'mothership'
    ? 'FlyingSaucer'
    : pickEnemyFamily(state, ['FlyingSaucer'], rng);
  return {
    id: state.nextEnemySquadId,
    kind,
    family,
    assetFile: '',
    familyFiles: getEnemyFamilyFiles(family).slice(),
    targetPlanetIndex: targetIndex,
    nextPlanetIndex,
    departPlanetIndex: -1,
    orbitPhase: rng() * Math.PI * 2,
    orbitProgress: 0,
    orbitLastAngle: 0,
    departVector: new THREE.Vector3(),
    mode: 'approach',
    modeTimer: 0,
    spawnTimer: 0,
    orbitDirection: rng() < 0.5 ? -1 : 1,
    swarmDuration: config.enemySwarmDurationMin + rng() * (config.enemySwarmDurationMax - config.enemySwarmDurationMin),
    departDuration: config.enemyDepartDurationMin + rng() * (config.enemyDepartDurationMax - config.enemyDepartDurationMin),
    parentMothershipId: -1,
    fighterReleaseCooldown: 0,
    fightersTotal: 0,
    fightersReleased: 0,
    fightersAlive: 0,
    encounterId: -1,
    holdRadiusFactor: config.mothershipHoldRadiusFactor,
    holdAngularSpeed: 0,
    holdBetaSpeed: 0,
    holdAngle: 0,
    holdBeta: 0,
    holdAxis: new THREE.Vector3(),
    holdRadial: new THREE.Vector3(),
    holdTangent: new THREE.Vector3(),
    holdEntryUp: new THREE.Vector3(),
    holdReorientTimer: 0,
    holdReorientDuration: config.mothershipHoldReorientDuration,
    holdArrivalDistance: 0,
    holdExitDistance: 0,
    approachStartDistance: 0,
    holdReoriented: false,
    approachExponent: config.mothershipApproachExponent,
    approachSpeedFactor: config.mothershipApproachSpeedFactor,
    approachSpeedMinFactor: config.mothershipApproachSpeedMinFactor,
    approachSnapFactor: config.mothershipApproachSnapFactor,
    exitSpeedFactor: config.mothershipExitSpeedFactor,
    releaseOrbitDirection: rng() < 0.5 ? -1 : 1,
    leaveAfterFightersDead: true,
    fighterDiveAltitudeFactor: config.fighterDiveAltitudeFactor
  };
}

function buildSafeMothershipOrientation(preferredUp, preferredForward, fallbackForward, fallbackUp) {
  const up = tempVecH.copy(preferredUp);
  if (up.lengthSq() < 1e-6) {
    up.copy(fallbackUp);
  }
  if (up.lengthSq() < 1e-6) {
    up.copy(worldUp);
  }
  up.normalize();

  let forward = tempVecI.copy(preferredForward);
  if (forward.lengthSq() < 1e-6) {
    forward.copy(fallbackForward);
  }
  if (forward.lengthSq() < 1e-6) {
    forward.copy(tempVecJ.set(1, 0, 0));
  }

  forward.sub(tempVecK.copy(up).multiplyScalar(forward.dot(up)));
  if (forward.lengthSq() < 1e-6) {
    forward.copy(tempVecL.copy(fallbackForward));
    if (forward.lengthSq() < 1e-6) {
      forward.copy(tempVecM.copy(fallbackUp).cross(up));
    } else {
      forward.sub(tempVecK.copy(up).multiplyScalar(forward.dot(up)));
    }
  }
  if (forward.lengthSq() < 1e-6) {
    forward.copy(tempVecM.copy(up).cross(Math.abs(up.dot(worldUp)) > 0.92 ? tempVecJ.set(1, 0, 0) : worldUp));
  }
  if (forward.lengthSq() < 1e-6) {
    forward.copy(tempVecJ.set(1, 0, 0));
  }
  forward.normalize();

  const orthoUp = tempVecN.copy(up).sub(tempVecK.copy(forward).multiplyScalar(up.dot(forward)));
  if (orthoUp.lengthSq() < 1e-6) {
    orthoUp.copy(tempVecM.copy(forward).cross(Math.abs(forward.dot(worldUp)) > 0.92 ? tempVecJ.set(1, 0, 0) : worldUp));
  }
  if (orthoUp.lengthSq() < 1e-6) {
    orthoUp.copy(worldUp);
  }
  orthoUp.normalize();

  return { forward, up: orthoUp };
}

function createEnemyWave(state, squad, options = {}) {
  const rng = options.rng || state.rng;
  const planet = state.planets[squad.targetPlanetIndex];
  if (!planet) {
    return;
  }
  const enemyCount = options.enemyCount ?? (Math.floor(rng() * (config.enemySquadSizeMax - config.enemySquadSizeMin + 1)) + config.enemySquadSizeMin);
  const radial = options.radial
    ? tempVecA.copy(options.radial).normalize()
    : state.ship && state.ship.boundPlanet === planet
      ? state.ship.position.clone().sub(planet.position).normalize()
      : planet.position.lengthSq() > 1e-6
        ? planet.position.clone().normalize()
        : new THREE.Vector3(0, 1, 0);
  const basis = options.basis || buildBasisFromNormal(radial);
  const spawnDistance = options.spawnDistance ?? (planet.atmosphereRadius + 80 + rng() * 140);
  const spawnCenter = options.spawnCenter
    ? tempVecA.copy(options.spawnCenter)
    : tempVecA.copy(planet.position).addScaledVector(radial, spawnDistance);
  const familyFiles = options.familyFiles && options.familyFiles.length > 0
    ? options.familyFiles
    : squad.familyFiles && squad.familyFiles.length > 0
      ? squad.familyFiles
      : getEnemyFamilyFiles(squad.family);
  const enemyKind = options.enemyKind || 'regular';
  const enemyVisualScale = options.visualScale ?? 1;
  const enemyRadius = options.radius ?? ENEMY_HIT_RADIUS;

  for (let i = 0; i < enemyCount; i += 1) {
    const enemy = createEnemyState();
    const ringAngle = (i / Math.max(1, enemyCount)) * Math.PI * 2 + rng() * 0.35;
    const ringRadius = enemyCount === 1 ? 0 : 12 + rng() * 26;
    const ringOffset = tempVecB.copy(basis.tangent).multiplyScalar(Math.cos(ringAngle) * ringRadius)
      .addScaledVector(basis.bitangent, Math.sin(ringAngle) * ringRadius * 0.82);
    enemy.id = state.nextEnemyId;
    enemy.squadId = squad.id;
    enemy.kind = enemyKind;
    enemy.family = squad.family;
    enemy.assetFile = familyFiles.length > 0
      ? familyFiles[Math.floor(rng() * familyFiles.length)]
      : '';
    enemy.position.copy(spawnCenter).add(ringOffset);
    enemy.previousPosition.copy(enemy.position);
    enemy.forward.copy(tempVecC.copy(planet.position).sub(enemy.position).normalize());
    enemy.up.copy(radial);
    enemy.bank = 0;
    enemy.speed = 0;
    enemy.radius = enemyRadius;
    enemy.visualScale = enemyVisualScale;
    enemy.health = enemyKind === 'mothership' ? config.mothershipHitPoints : config.enemyHitPoints;
    enemy.boundPlanet = planet;
    enemy.flightMode = 'bound';
    enemy.captureTimer = config.shipCaptureBlendTime;
    enemy.recaptureLock = 0;
    enemy.relativePosition.copy(enemy.position).sub(planet.position);
    enemy.relativeVelocity.copy(enemy.velocity).sub(planet.velocity);
    enemy.speedScale = config.enemySpeedScaleMin + rng() * (config.enemySpeedScaleMax - config.enemySpeedScaleMin);
    enemy.turnScale = config.enemyTurnScaleMin + rng() * (config.enemyTurnScaleMax - config.enemyTurnScaleMin);
    enemy.upScale = config.enemyUpScaleMin + rng() * (config.enemyUpScaleMax - config.enemyUpScaleMin);
    enemy.formationAngle = ringAngle;
    enemy.formationRadius = 14 + rng() * 32;
    enemy.phase = rng() * Math.PI * 2;
    enemy.mode = 'approach';
    enemy.targetPlanetIndex = squad.targetPlanetIndex;
    enemy.nextPlanetIndex = squad.nextPlanetIndex;
    enemy.parentMothershipId = squad.parentMothershipId;
    enemy.encounterId = options.encounterId ?? squad.encounterId ?? -1;
    enemy.combatRole = enemy.kind === 'mothership' ? 'reserve' : 'reserve';
    enemy.hudPriority = config.encounterReserveHudPriority;
    enemy.spawnFrame = state.frameIndex;
    enemy.spawnTime = state.time;
    state.enemies.push(enemy);
    state.nextEnemyId += 1;
    const spawnPlanet = getEnemyTargetPlanet(state, enemy);
    const sourceMothership = squad.parentMothershipId >= 0
      ? state.enemies.find((candidate) => candidate.id === squad.parentMothershipId && candidate.health > 0)
      : null;
    pushEvent(state, 'enemy-spawn', {
      enemyId: enemy.id,
      squadId: enemy.squadId,
      kind: enemy.kind,
      family: enemy.family,
      targetPlanetIndex: enemy.targetPlanetIndex,
      targetPlanetName: spawnPlanet ? spawnPlanet.name : null,
      spawnedByMothershipId: squad.parentMothershipId >= 0 ? squad.parentMothershipId : null,
      spawnReason: enemyKind,
      spawnFrame: enemy.spawnFrame,
      spawnTime: enemy.spawnTime,
      position: {
        x: enemy.position.x,
        y: enemy.position.y,
        z: enemy.position.z
      },
      mothershipPosition: sourceMothership ? {
        x: sourceMothership.position.x,
        y: sourceMothership.position.y,
        z: sourceMothership.position.z
      } : null,
      altitude: spawnPlanet ? enemy.position.distanceTo(spawnPlanet.position) - spawnPlanet.radius : null,
      speed: enemy.speed
    });
  }
}

function spawnFighterSquadFromMothership(state, mothershipSquad, mothershipEnemy) {
  if (!mothershipSquad || !mothershipEnemy || mothershipEnemy.health <= 0) {
    return null;
  }

  const rng = getMothershipRng(state);
  const planet = state.planets[mothershipSquad.targetPlanetIndex];
  if (!planet) {
    return null;
  }

  const launchDirection = tempVecA.copy(planet.position).sub(mothershipEnemy.position);
  if (launchDirection.lengthSq() < 1e-6) {
    launchDirection.copy(planet.position);
  }
  if (launchDirection.lengthSq() < 1e-6) {
    launchDirection.copy(worldUp);
  }
  launchDirection.normalize();

  const basis = buildBasisFromNormal(launchDirection);
  const spawnCenter = tempVecB.copy(mothershipEnemy.position);
  const fighterSpawnPoint = spawnCenter.clone();
  const family = mothershipSquad.fighterFamily || pickEnemyFamily(state, ['FlyingSaucer'], rng);
  mothershipSquad.fighterFamily = family;
  const encounter = ensurePlanetInvasionEncounterForMothership(state, mothershipSquad, true);
  const squad = createEnemySquadState(state, mothershipSquad.targetPlanetIndex, 'fighter', rng);
  squad.family = family;
  squad.familyFiles = getEnemyFamilyFiles(family).slice();
  squad.parentMothershipId = mothershipSquad.id;
  squad.encounterId = encounter ? encounter.id : -1;
  squad.targetPlanetIndex = mothershipSquad.targetPlanetIndex;
  squad.nextPlanetIndex = pickRandomPlanetIndex(state, squad.targetPlanetIndex, rng);
  squad.mode = 'approach';
  squad.modeTimer = 0;
  squad.orbitPhase = 0;
  squad.orbitProgress = 0;
  squad.fighterDiveAltitudeFactor = config.fighterDiveAltitudeFactor;
  squad.fighterPatrolAltitudeFactor = config.fighterPatrolAltitudeFactor;
  squad.fighterSettleTimer = 0;
  squad.fightersTotal = 1;
  squad.fightersReleased = 1;
  squad.fightersAlive = 1;
  squad.fighterReleaseCooldown = 0;
  squad.fighterSurfaceHeading = rng() * Math.PI * 2;
  squad.fighterSurfaceHeadingUpdateTime = 0;

  state.nextEnemySquadId += 1;
  createEnemyWave(state, squad, {
    enemyCount: 1,
    spawnCenter: fighterSpawnPoint,
    radial: launchDirection,
    basis,
    familyFiles: squad.familyFiles,
    enemyKind: 'fighter',
    visualScale: 1,
    rng
  });
  const fighter = state.enemies[state.enemies.length - 1];
  if (fighter) {
    if (encounter) {
      registerEncounterEnemyReleased(state, encounter, fighter);
    }
    const launchRadial = tempVecD.copy(mothershipEnemy.position).sub(planet.position);
    if (launchRadial.lengthSq() < 1e-6) {
      launchRadial.copy(planet.position);
    }
    if (launchRadial.lengthSq() < 1e-6) {
      launchRadial.copy(worldUp);
    }
    launchRadial.normalize();

    const launchTangent = tempVecE.copy(squad.holdTangent);
    if (launchTangent.lengthSq() < 1e-6) {
      launchTangent.copy(basis.tangent);
    }
    launchTangent.normalize();

    const launchDirection = tempVecA.copy(launchTangent).addScaledVector(launchRadial, 0.22).addScaledVector(basis.bitangent, (rng() * 2 - 1) * 0.12).normalize();
    const launchSpeed = computeEnemyControlTargetSpeed(state, planet, fighter, squad) * 1.1;

    fighter.position.copy(fighterSpawnPoint);
    fighter.previousPosition.copy(fighterSpawnPoint);
    fighter.speed = launchSpeed;
    fighter.velocity.copy(launchDirection).multiplyScalar(launchSpeed).add(planet.velocity);
    fighter.relativeVelocity.copy(fighter.velocity).sub(planet.velocity);
    fighter.forward.copy(launchDirection);
    fighter.up.copy(launchRadial);
    fighter.boundPlanet = null;
    fighter.flightMode = 'free';
    fighter.recaptureLock = 0;
    fighter.atmosphericCruiseAltitudeFactor = config.fighterPatrolAltitudeFactor;
    fighter.surfaceHeading = rng() * Math.PI * 2;
    fighter.surfaceHeadingUpdateTime = 0;
  }
  state.enemySquads.push(squad);
  return squad;
}

function spawnMothershipSquad(state, targetPlanetIndex = -1) {
  if (!state.planets.length) {
    return null;
  }

  const rng = getMothershipRng(state);
  const squad = createEnemySquadState(state, targetPlanetIndex, 'mothership', rng);
  const planet = state.planets[squad.targetPlanetIndex];
  if (!planet) {
    return null;
  }

  const radial = planet.position.lengthSq() > 1e-6
    ? planet.position.clone().normalize()
    : worldUp.clone();
  const basis = buildBasisFromNormal(radial);
  const holdRadius = planet.radius * config.mothershipHoldRadiusFactor;
  const holdPoint = planet.position.clone().addScaledVector(radial, holdRadius);
  const spawnDistance = THREE.MathUtils.lerp(
    config.mothershipSpawnDistanceMin,
    config.mothershipSpawnDistanceMax,
    rng()
  );
  const outwardSpawn = tempVecF.copy(planet.position).addScaledVector(radial, spawnDistance);
  const spawnCenter = outwardSpawn;
  const spawnSide = 1;
  const travelDirection = tempVecC.copy(holdPoint).sub(spawnCenter).normalize();
  const edgeUp = tempVecD.copy(basis.bitangent);
  if (Math.abs(edgeUp.dot(travelDirection)) > 0.85) {
    edgeUp.copy(basis.tangent);
  }
  edgeUp.sub(tempVecE.copy(travelDirection).multiplyScalar(edgeUp.dot(travelDirection))).normalize();

  squad.familyFiles = getEnemyFamilyFiles('FlyingSaucer').slice();
  squad.holdRadiusFactor = config.mothershipHoldRadiusFactor;
  squad.holdAngularSpeed = THREE.MathUtils.lerp(
    config.mothershipHoldAngularSpeedMin,
    config.mothershipHoldAngularSpeedMax,
    rng()
  ) * (rng() < 0.5 ? -1 : 1);
  squad.holdBetaSpeed = THREE.MathUtils.lerp(
    config.mothershipHoldBetaSpeedMin,
    config.mothershipHoldBetaSpeedMax,
    rng()
  ) * (rng() < 0.5 ? -1 : 1);
  squad.holdAngle = rng() * Math.PI * 2;
  squad.holdBeta = 0;
  squad.holdAxis.copy(basis.bitangent);
  if (squad.holdAxis.lengthSq() < 1e-6) {
    squad.holdAxis.copy(basis.tangent);
  }
  squad.holdAxis.normalize();
  squad.holdRadial.copy(radial);
  squad.holdTangent.copy(basis.tangent);
  const nextPlanet = state.planets[Math.max(0, Math.min(state.planets.length - 1, squad.nextPlanetIndex))] || planet;
  const exitDirection = tempVecG.copy(nextPlanet.position).sub(planet.position);
  if (exitDirection.lengthSq() < 1e-6) {
    exitDirection.copy(radial);
  }
  squad.mothershipExitDirection = exitDirection.normalize().clone();
  squad.holdArrivalDistance = holdPoint.distanceTo(spawnCenter);
  squad.holdExitDistance = planet.radius * 16;
  squad.approachStartDistance = Math.max(squad.holdArrivalDistance, 1);
  squad.fightersTotal = Math.floor(rng() * (config.mothershipFighterCountMax - config.mothershipFighterCountMin + 1)) + config.mothershipFighterCountMin;
  squad.fightersReleased = 0;
  squad.fightersAlive = 0;
  squad.fighterReleaseCooldown = 0.5 + rng() * 1.6;
  squad.leaveAfterFightersDead = true;
  squad.fighterFamily = pickEnemyFamily(state, ['FlyingSaucer'], rng);
  const encounter = ensurePlanetInvasionEncounterForMothership(state, squad, false);
  squad.encounterId = encounter ? encounter.id : -1;

  state.nextEnemySquadId += 1;
  createEnemyWave(state, squad, {
    enemyCount: 1,
    spawnCenter,
    radial: travelDirection,
    basis,
    familyFiles: squad.familyFiles,
    enemyKind: 'mothership',
    visualScale: (planet.radius * config.mothershipScaleFactor) / 3,
    rng
  });

  const mothership = state.enemies[state.enemies.length - 1];
  if (mothership) {
    mothership.kind = 'mothership';
    mothership.radius = Math.max(ENEMY_HIT_RADIUS * 9, planet.radius * 0.135);
    mothership.visualScale = (planet.radius * config.mothershipScaleFactor) / 3;
    mothership.position.copy(spawnCenter);
    mothership.previousPosition.copy(spawnCenter);
    mothership.forward.copy(travelDirection);
    mothership.up.copy(edgeUp);
    mothership.speed = 0;
    mothership.velocity.set(0, 0, 0);
    mothership.relativePosition.copy(mothership.position).sub(planet.position);
    mothership.relativeVelocity.copy(mothership.velocity).sub(planet.velocity);
    mothership.boundPlanet = null;
    mothership.flightMode = 'free';
    mothership.recaptureLock = 9999;
    mothership.captureTimer = config.shipCaptureBlendTime;
    mothership.targetPlanetIndex = squad.targetPlanetIndex;
    mothership.nextPlanetIndex = squad.nextPlanetIndex;
    mothership.encounterId = squad.encounterId;
    mothership.mode = 'approach';
    mothership.mothershipStage = 'approach';
    mothership.mothershipHoldRadius = holdRadius;
    mothership.mothershipArrivalPoint = holdPoint.clone();
    mothership.mothershipSpawnPoint = spawnCenter.clone();
    mothership.mothershipTravelDirection = travelDirection.clone();
    mothership.mothershipEdgeUp = edgeUp.clone();
    mothership.mothershipExitDirection = squad.mothershipExitDirection.clone();
    mothership.mothershipHoldAxis = squad.holdAxis.clone();
    mothership.mothershipHoldAngle = squad.holdAngle;
    mothership.mothershipHoldBeta = squad.holdBeta;
    mothership.mothershipApproachExponent = config.mothershipApproachExponent;
    mothership.mothershipApproachSpeedFactor = config.mothershipApproachSpeedFactor;
    mothership.mothershipApproachSpeedMinFactor = config.mothershipApproachSpeedMinFactor;
    mothership.mothershipApproachSnapFactor = config.mothershipApproachSnapFactor;
    mothership.mothershipExitSpeedFactor = config.mothershipExitSpeedFactor;
    mothership.mothershipHoldAngularSpeed = squad.holdAngularSpeed;
    mothership.mothershipHoldBetaSpeed = squad.holdBetaSpeed;
    mothership.mothershipReleaseOffset = planet.radius * 0.018;
    mothership.spawnFrame = state.frameIndex;
    mothership.spawnTime = state.time;
    pushEvent(state, 'mothership-spawn', {
      mothershipSquadId: squad.id,
      mothershipId: mothership.id,
      targetPlanetIndex: squad.targetPlanetIndex,
      targetPlanetName: planet.name,
      spawnFrame: mothership.spawnFrame,
      spawnTime: mothership.spawnTime,
      spawnDistance,
      spawnSide,
      position: {
        x: mothership.position.x,
        y: mothership.position.y,
        z: mothership.position.z
      }
    });
  }

  state.mothershipSquads.push(squad);
  state.mothershipSquad = squad;
  state.mothershipSpawnTimer = config.mothershipSpawnDelayMin + rng() * (config.mothershipSpawnDelayMax - config.mothershipSpawnDelayMin);
  return squad;
}

function destroyEnemy(state, enemy, cause = 'projectile', impactPosition = null) {
  if (!enemy || enemy.destroyed) {
    return false;
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

  enemy.destroyed = true;
  enemy.health = 0;
  enemy.boundPlanet = null;
  enemy.flightMode = 'free';
  enemy.recaptureLock = 0;
  const targetPlanet = getEnemyTargetPlanet(state, enemy);
  const position = impactPosition || enemy.position;
  const altitude = targetPlanet ? position.distanceTo(targetPlanet.position) - targetPlanet.radius : null;
  pushEvent(state, 'enemy-death', {
    enemyId: enemy.id,
    squadId: enemy.squadId,
    kind: enemy.kind,
    family: enemy.family,
    cause,
    spawnedAtFrame: enemy.spawnFrame ?? null,
    spawnedAtTime: enemy.spawnTime ?? null,
    diedAtFrame: state.frameIndex,
    diedAtTime: state.time,
    ageSeconds: enemy.spawnTime != null ? Math.max(0, state.time - enemy.spawnTime) : null,
    targetPlanetIndex: enemy.targetPlanetIndex ?? -1,
    targetPlanetName: targetPlanet ? targetPlanet.name : null,
    altitude,
    speed: Number.isFinite(enemy.speed) ? enemy.speed : null,
    position: {
      x: position.x,
      y: position.y,
      z: position.z
    },
    parentMothershipId: enemy.parentMothershipId ?? null
  });
  if (cause === 'crash') {
    pushEvent(state, 'enemy-crash', {
      enemyId: enemy.id,
      squadId: enemy.squadId,
      kind: enemy.kind,
      family: enemy.family
    });
  }

  const index = state.enemies.indexOf(enemy);
  if (index >= 0) {
    state.enemies.splice(index, 1);
  }

  spawnEnemyExplosion(state, impactPosition || enemy.position, cause);
  if (cause === 'projectile') {
    state.score = (state.score || 0) + 100;
  }
  return true;
}

function applyEnemyDamage(state, enemy, damage, cause = 'projectile', impactPosition = null) {
  if (!enemy || enemy.health <= 0) {
    return false;
  }
  enemy.health = Math.max(0, enemy.health - damage);
  if (enemy.health > 0) {
    return false;
  }
  return destroyEnemy(state, enemy, cause, impactPosition);
}

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

function removeEnemySilently(state, enemy) {
  if (!enemy || enemy.destroyed) {
    return false;
  }

  enemy.destroyed = true;
  enemy.health = 0;
  enemy.boundPlanet = null;
  enemy.flightMode = 'free';
  enemy.recaptureLock = 0;

  const index = state.enemies.indexOf(enemy);
  if (index >= 0) {
    state.enemies.splice(index, 1);
  }

  return true;
}

function detectEnemyCrash(state, enemy) {
  for (const planet of state.planets) {
    if (enemy.position.distanceTo(planet.position) <= planet.radius + config.enemyCrashMargin) {
      return {
        type: 'planet',
        planet
      };
    }
  }

  const starRadius = config.starScale * 0.5;
  if (enemy.position.length() <= starRadius + config.enemyCrashMargin) {
    return {
      type: 'sun',
      planet: null
    };
  }

  return null;
}

function getNearestPlanetInfo(state, position) {
  let nearestIndex = -1;
  let nearestDistance = Infinity;
  for (let i = 0; i < state.planets.length; i += 1) {
    const planet = state.planets[i];
    const distance = position.distanceTo(planet.position);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = i;
    }
  }
  return {
    index: nearestIndex,
    planet: nearestIndex >= 0 ? state.planets[nearestIndex] : null,
    distance: nearestDistance
  };
}

function getEnemyTargetPlanet(state, enemy) {
  if (!state.planets.length) {
    return null;
  }
  const index = Math.max(0, Math.min(state.planets.length - 1, enemy.targetPlanetIndex));
  return state.planets[index] || null;
}

function getEnemyNextPlanet(state, enemy) {
  if (!state.planets.length) {
    return null;
  }
  const index = Math.max(0, Math.min(state.planets.length - 1, enemy.nextPlanetIndex));
  return state.planets[index] || null;
}

function buildShipFrame(ship) {
  const forward = ship?.forward && ship.forward.lengthSq() > 1e-8
    ? ship.forward.clone().normalize()
    : new THREE.Vector3(0, 0, 1);
  const upSeed = ship?.up && ship.up.lengthSq() > 1e-8
    ? ship.up.clone().normalize()
    : worldUp.clone();
  const up = upSeed.sub(forward.clone().multiplyScalar(upSeed.dot(forward)));
  if (up.lengthSq() < 1e-8) {
    up.copy(Math.abs(forward.dot(worldUp)) > 0.92
      ? new THREE.Vector3(1, 0, 0).cross(forward)
      : worldUp.clone().sub(forward.clone().multiplyScalar(worldUp.dot(forward))));
  }
  up.normalize();
  const right = forward.clone().cross(up);
  if (right.lengthSq() < 1e-8) {
    right.copy(new THREE.Vector3(1, 0, 0));
  }
  right.normalize();
  return { forward, up, right };
}

function measureEnemyInPlayerFrame(state, enemy) {
  if (!state?.ship || !enemy) {
    return null;
  }
  const frame = buildShipFrame(state.ship);
  const offset = enemy.position.clone().sub(state.ship.position);
  const distance = offset.length();
  const direction = distance > 1e-8 ? offset.clone().multiplyScalar(1 / distance) : frame.forward.clone();
  const forwardDot = THREE.MathUtils.clamp(direction.dot(frame.forward), -1, 1);
  const angleDeg = THREE.MathUtils.radToDeg(Math.acos(forwardDot));
  return {
    distance,
    forward: offset.dot(frame.forward),
    right: offset.dot(frame.right),
    up: offset.dot(frame.up),
    angleDeg,
    shootable: angleDeg <= config.encounterShootableAngleDeg
      && distance >= config.encounterShootableMinDistance
      && distance <= config.encounterShootableMaxDistance
  };
}

function projectSlotToPlanetShell(planet, slot, altitudeFactor = config.fighterPatrolAltitudeFactor) {
  if (!planet || !slot) {
    return slot ? slot.clone() : new THREE.Vector3();
  }
  const atmosphereThickness = Math.max(planet.atmosphereRadius - planet.radius, 1.0);
  const direction = slot.clone().sub(planet.position);
  if (direction.lengthSq() < 1e-8) {
    direction.copy(worldUp);
  }
  direction.normalize();
  const desiredAltitude = atmosphereThickness * altitudeFactor;
  return planet.position.clone().addScaledVector(direction, planet.radius + desiredAltitude);
}

function computePlayerRelativeSlot(state, planet, forwardDistance, rightDistance, upDistance, altitudeFactor = config.fighterPatrolAltitudeFactor) {
  const ship = state.ship;
  if (!ship) {
    return planet ? planet.position.clone() : new THREE.Vector3();
  }
  const frame = buildShipFrame(ship);
  const rawSlot = ship.position.clone()
    .addScaledVector(frame.forward, forwardDistance)
    .addScaledVector(frame.right, rightDistance)
    .addScaledVector(frame.up, upDistance);
  return planet ? projectSlotToPlanetShell(planet, rawSlot, altitudeFactor) : rawSlot;
}

function liftTargetAboveEnemyHorizon(enemy, planet, target) {
  if (!enemy || !planet || !target) {
    return target;
  }
  const radialUp = enemy.position.clone().sub(planet.position);
  if (radialUp.lengthSq() < 1e-8) {
    radialUp.copy(worldUp);
  }
  radialUp.normalize();
  const toTarget = target.clone().sub(enemy.position);
  const distance = toTarget.length();
  if (distance <= 1e-8) {
    return target;
  }
  const climbDot = toTarget.multiplyScalar(1 / distance).dot(radialUp);
  const minClimbDot = config.encounterPresentationMinTargetClimbDot;
  if (climbDot < minClimbDot) {
    target.addScaledVector(
      radialUp,
      (minClimbDot - climbDot) * distance + config.encounterPresentationTerrainLiftOffset
    );
  }
  const altitude = enemy.position.distanceTo(planet.position) - planet.radius;
  const safeAltitude = config.atmosphereTerrainCrashAltitude + config.encounterPresentationTerrainLiftOffset;
  if (altitude < safeAltitude) {
    target.addScaledVector(radialUp, safeAltitude - altitude);
  }
  return target;
}

function computeEntityRelativeSlot(entity, forwardDistance, rightDistance, upDistance) {
  const frame = buildShipFrame(entity);
  return entity.position.clone()
    .addScaledVector(frame.forward, forwardDistance)
    .addScaledVector(frame.right, rightDistance)
    .addScaledVector(frame.up, upDistance);
}

function presentationRequiredFrames(kind) {
  if (kind === 'sideCross') {
    return config.encounterSideCrossRequiredFrames;
  }
  if (kind === 'headOnBreakaway') {
    return config.encounterHeadOnRequiredFrames;
  }
  return config.encounterShootableRequiredFrames;
}

function pushPresentationEvent(state, type, enemy, presentation, extra = {}) {
  pushEvent(state, type, {
    enemyId: enemy.id,
    encounterId: enemy.encounterId,
    encounterType: getEncounterById(state, enemy.encounterId)?.type || '',
    kind: presentation?.kind || '',
    phase: presentation?.phase || '',
    startTime: presentation?.startedAt ?? null,
    phaseStartedAt: presentation?.phaseStartedAt ?? null,
    shootableFrames: presentation?.shootableFrames ?? 0,
    minAngleToPlayer: presentation?.minAngleToPlayer ?? null,
    minDistanceToPlayer: presentation?.minDistanceToPlayer ?? null,
    maxDistanceToPlayer: presentation?.maxDistanceToPlayer ?? null,
    ...extra
  });
}

function setPresentationPhase(state, enemy, phase) {
  const presentation = enemy.presentation;
  if (!presentation || presentation.phase === phase) {
    return;
  }
  presentation.phase = phase;
  presentation.phaseStartedAt = state.time;
  pushPresentationEvent(state, 'presentation-phase', enemy, presentation);
}

function updatePresentationMetrics(state, enemy) {
  const presentation = enemy.presentation;
  if (!presentation) {
    return null;
  }
  const metrics = measureEnemyInPlayerFrame(state, enemy);
  if (!metrics) {
    return null;
  }
  if (metrics.shootable) {
    presentation.shootableFrames += 1;
    enemy.presentationShootableFrames = presentation.shootableFrames;
  }
  if (presentation.minAngleToPlayer == null || metrics.angleDeg < presentation.minAngleToPlayer) {
    presentation.minAngleToPlayer = metrics.angleDeg;
  }
  if (presentation.minDistanceToPlayer == null || metrics.distance < presentation.minDistanceToPlayer) {
    presentation.minDistanceToPlayer = metrics.distance;
  }
  if (presentation.maxDistanceToPlayer == null || metrics.distance > presentation.maxDistanceToPlayer) {
    presentation.maxDistanceToPlayer = metrics.distance;
  }
  return metrics;
}

function endEnemyPresentation(state, enemy, succeeded, reason = '') {
  const presentation = enemy.presentation;
  if (!presentation) {
    return;
  }
  const encounter = getEncounterById(state, enemy.encounterId);
  pushPresentationEvent(state, succeeded ? 'presentation-success' : 'presentation-fail', enemy, presentation, {
    endTime: state.time,
    failureReason: succeeded ? '' : reason
  });
  pushPresentationEvent(state, 'presentation-end', enemy, presentation, {
    endTime: state.time,
    result: succeeded ? 'success' : 'fail',
    failureReason: succeeded ? '' : reason
  });
  enemy.combatRole = 'cooldown';
  enemy.isPrimaryThreat = false;
  enemy.hudPriority = config.encounterReserveHudPriority;
  enemy.lastPresentationTime = state.time;
  enemy.presentation = {
    ...presentation,
    phase: 'cooldown',
    phaseStartedAt: state.time,
    endedAt: state.time,
    succeeded,
    failureReason: reason
  };
  if (encounter) {
    encounter.activePresenterEnemyIds = encounter.activePresenterEnemyIds.filter((id) => id !== enemy.id);
    if (!encounter.reserveEnemyIds.includes(enemy.id)) {
      encounter.reserveEnemyIds.push(enemy.id);
    }
  }
  if (state.encounterDirector) {
    state.encounterDirector.activePresenterEnemyIds = state.encounterDirector.activePresenterEnemyIds.filter((id) => id !== enemy.id);
  }
}

function beginEnemyPresentation(state, enemy, encounter, kind, options = {}) {
  if (!enemy || !encounter) {
    return false;
  }
  const side = options.side || (state.rng() < 0.5 ? -1 : 1);
  enemy.encounterId = encounter.id;
  enemy.combatRole = 'presenter';
  enemy.isPrimaryThreat = true;
  enemy.hudPriority = config.encounterPresenterHudPriority;
  enemy.presentationShootableFrames = 0;
  enemy.presentationKindLastUsed = kind;
  enemy.presentation = {
    kind,
    phase: kind === 'headOnBreakaway' ? 'stageFront' : 'stage',
    side,
    startedAt: state.time,
    phaseStartedAt: state.time,
    maxDuration: options.maxDuration ?? config.encounterPresentationMaxDuration,
    shootableFrames: 0,
    crossedCenter: false,
    committed: false,
    initialSideSign: 0,
    lockedBreakawayPoint: null,
    minAngleToPlayer: null,
    minDistanceToPlayer: null,
    maxDistanceToPlayer: null,
    forced: Boolean(options.forced)
  };
  encounter.activePresenterEnemyIds = encounter.activePresenterEnemyIds.filter((id) => id !== enemy.id);
  encounter.activePresenterEnemyIds.push(enemy.id);
  encounter.reserveEnemyIds = encounter.reserveEnemyIds.filter((id) => id !== enemy.id);
  state.encounterDirector.activePresenterEnemyIds = state.encounterDirector.activePresenterEnemyIds.filter((id) => id !== enemy.id);
  state.encounterDirector.activePresenterEnemyIds.push(enemy.id);
  pushPresentationEvent(state, 'presentation-start', enemy, enemy.presentation);
  return true;
}

function computeBehindCatchupTarget(state, enemy, planet) {
  const presentation = enemy.presentation;
  const phaseAge = state.time - presentation.phaseStartedAt;
  const age = state.time - presentation.startedAt;
  const metrics = updatePresentationMetrics(state, enemy);
  const requiredFrames = presentationRequiredFrames(presentation.kind);

  if (presentation.phase === 'stage') {
    const stageSlot = computePlayerRelativeSlot(
      state,
      planet,
      config.encounterBehindStageDistance,
      presentation.side * config.encounterBehindStageSideOffset,
      config.encounterBehindStageUpOffset
    );
    const alreadyStagedBehind = metrics
      && metrics.forward < -config.encounterShootableMinDistance
      && metrics.distance <= Math.abs(config.encounterBehindStageDistance) + config.encounterPresentationSlotTolerance;
    if (alreadyStagedBehind || phaseAge >= config.encounterPresentationStageDuration || enemy.position.distanceTo(stageSlot) <= config.encounterPresentationSlotTolerance) {
      setPresentationPhase(state, enemy, 'present');
    } else {
      return stageSlot;
    }
  }

  if (presentation.phase === 'present') {
    if (presentation.shootableFrames >= requiredFrames) {
      presentation.success = true;
      setPresentationPhase(state, enemy, 'escape');
    } else if (age >= presentation.maxDuration - config.encounterPresentationEscapeDuration) {
      presentation.success = false;
      setPresentationPhase(state, enemy, 'escape');
    } else {
      return computePlayerRelativeSlot(
        state,
        planet,
        config.encounterBehindPresentDistance,
        presentation.side * config.encounterBehindPresentSideOffset,
        config.encounterBehindPresentUpOffset
      );
    }
  }

  if (presentation.phase === 'escape') {
    if (phaseAge >= config.encounterPresentationEscapeDuration) {
      endEnemyPresentation(state, enemy, Boolean(presentation.success), presentation.success ? '' : 'insufficient-shootable-frames');
      return null;
    }
    return computePlayerRelativeSlot(
      state,
      planet,
      config.encounterBehindEscapeDistance,
      presentation.side * config.encounterBehindEscapeSideOffset,
      config.encounterBehindEscapeUpOffset
    );
  }

  if (metrics && metrics.distance < config.encounterReserveMinPlayerDistance) {
    return computePlayerRelativeSlot(state, planet, config.encounterBehindEscapeDistance, presentation.side * config.encounterBehindEscapeSideOffset, config.encounterBehindEscapeUpOffset);
  }
  return null;
}

function computeSideCrossTarget(state, enemy, planet) {
  const presentation = enemy.presentation;
  const phaseAge = state.time - presentation.phaseStartedAt;
  const age = state.time - presentation.startedAt;
  const metrics = updatePresentationMetrics(state, enemy);
  const requiredFrames = presentationRequiredFrames(presentation.kind);
  if (metrics) {
    const sideSign = Math.sign(metrics.right || presentation.side);
    if (!presentation.initialSideSign) {
      presentation.initialSideSign = sideSign || presentation.side;
    } else if (sideSign && sideSign !== presentation.initialSideSign) {
      presentation.crossedCenter = true;
    }
    if (metrics.forward > 0 && metrics.angleDeg <= config.encounterShootableAngleDeg * 1.15) {
      presentation.crossedCenter = true;
    }
  }

  if (presentation.phase === 'stage') {
    const stageSlot = computePlayerRelativeSlot(
      state,
      planet,
      config.encounterSideStageForwardDistance,
      presentation.side * config.encounterSideStageSideDistance,
      config.encounterSideStageUpOffset
    );
    if (phaseAge >= config.encounterPresentationStageDuration || enemy.position.distanceTo(stageSlot) <= config.encounterPresentationSlotTolerance) {
      setPresentationPhase(state, enemy, 'cross');
    } else {
      return stageSlot;
    }
  }

  if (presentation.phase === 'cross') {
    if (presentation.crossedCenter && presentation.shootableFrames >= requiredFrames) {
      presentation.success = true;
      setPresentationPhase(state, enemy, 'escape');
    } else if (phaseAge >= config.encounterPresentationCrossDuration || age >= presentation.maxDuration - config.encounterPresentationEscapeDuration) {
      presentation.success = presentation.crossedCenter && presentation.shootableFrames > 0;
      setPresentationPhase(state, enemy, 'escape');
    } else {
      return computePlayerRelativeSlot(
        state,
        planet,
        config.encounterSideCrossForwardDistance,
        -presentation.side * config.encounterSideCrossSideDistance,
        config.encounterSideCrossUpOffset
      );
    }
  }

  if (presentation.phase === 'escape') {
    if (phaseAge >= config.encounterPresentationEscapeDuration) {
      const reason = presentation.crossedCenter ? 'insufficient-shootable-frames' : 'did-not-cross-center';
      endEnemyPresentation(state, enemy, Boolean(presentation.success), presentation.success ? '' : reason);
      return null;
    }
    return computePlayerRelativeSlot(
      state,
      planet,
      config.encounterSideEscapeForwardDistance,
      -presentation.side * config.encounterSideEscapeSideDistance,
      config.encounterSideEscapeUpOffset
    );
  }

  return null;
}

function computeHeadOnBreakawayTarget(state, enemy, planet) {
  const presentation = enemy.presentation;
  const phaseAge = state.time - presentation.phaseStartedAt;
  const age = state.time - presentation.startedAt;
  const metrics = updatePresentationMetrics(state, enemy);
  const requiredFrames = presentationRequiredFrames(presentation.kind);

  if (presentation.phase === 'stageFront') {
    const stageSlot = computePlayerRelativeSlot(
      state,
      planet,
      config.encounterHeadOnStageDistance,
      presentation.side * config.encounterHeadOnStageSideOffset,
      config.encounterHeadOnStageUpOffset
    );
    if (phaseAge >= config.encounterPresentationStageDuration || (metrics && metrics.forward > 0 && metrics.distance <= config.encounterHeadOnCommitDistance)) {
      presentation.committed = true;
      presentation.lockedBreakawayPoint = computePlayerRelativeSlot(
        state,
        planet,
        config.encounterHeadOnBreakawayDistance,
        -presentation.side * config.encounterHeadOnBreakawaySideOffset,
        config.encounterHeadOnBreakawayUpOffset
      );
      setPresentationPhase(state, enemy, 'commit');
    } else {
      return stageSlot;
    }
  }

  if (presentation.phase === 'commit') {
    if (presentation.shootableFrames >= requiredFrames || phaseAge >= config.encounterHeadOnCommitDuration) {
      presentation.success = presentation.shootableFrames > 0;
      setPresentationPhase(state, enemy, 'breakAway');
    } else {
      return computePlayerRelativeSlot(
        state,
        planet,
        config.encounterHeadOnStageDistance * 0.55,
        presentation.side * config.encounterHeadOnStageSideOffset,
        config.encounterHeadOnStageUpOffset
      );
    }
  }

  if (presentation.phase === 'breakAway') {
    if (phaseAge >= config.encounterPresentationEscapeDuration || age >= presentation.maxDuration) {
      endEnemyPresentation(state, enemy, Boolean(presentation.success), presentation.success ? '' : 'head-on-breakaway-window-missed');
      return null;
    }
    return presentation.lockedBreakawayPoint
      ? presentation.lockedBreakawayPoint.clone()
      : computePlayerRelativeSlot(
        state,
        planet,
        config.encounterHeadOnBreakawayDistance,
        -presentation.side * config.encounterHeadOnBreakawaySideOffset,
        config.encounterHeadOnBreakawayUpOffset
      );
  }

  return null;
}

function computeEnemyPresentationTargetPoint(state, enemy, squad, planet, time) {
  if (!enemy || enemy.combatRole !== 'presenter' || !enemy.presentation || enemy.presentation.phase === 'cooldown') {
    return null;
  }
  const presentation = enemy.presentation;
  if (time - presentation.startedAt > presentation.maxDuration + config.encounterPresentationEscapeDuration + 1) {
    endEnemyPresentation(state, enemy, false, 'timeout');
    return null;
  }
  if (presentation.kind === 'behindCatchup') {
    return computeBehindCatchupTarget(state, enemy, planet);
  }
  if (presentation.kind === 'sideCross') {
    return computeSideCrossTarget(state, enemy, planet);
  }
  if (presentation.kind === 'headOnBreakaway') {
    return computeHeadOnBreakawayTarget(state, enemy, planet);
  }
  return null;
}

function computeEnemyReserveTargetPoint(state, enemy, squad, planet) {
  if (!enemy || !planet || enemy.kind === 'mothership' || enemy.combatRole === 'presenter' || enemy.combatRole === 'objectiveAttacker') {
    return null;
  }
  const encounter = getEncounterById(state, enemy.encounterId);
  if (!encounter || encounter.status !== 'active' || encounter.anchorKind !== 'planet') {
    return null;
  }
  const metrics = measureEnemyInPlayerFrame(state, enemy);
  if (!metrics) {
    return null;
  }
  const crowding = metrics.distance < config.encounterReserveMinPlayerDistance
    || (metrics.forward > 0 && metrics.angleDeg < config.encounterShootableAngleDeg * 1.6 && metrics.distance < config.encounterShootableMaxDistance * 0.9);
  if (!crowding) {
    return null;
  }
  const side = Math.sign(metrics.right) || (enemy.id % 2 === 0 ? 1 : -1);
  return computePlayerRelativeSlot(
    state,
    planet,
    -config.encounterReserveLoiterDistance * 0.35,
    side * config.encounterReserveLoiterDistance,
    config.encounterSideEscapeUpOffset
  );
}

function computeEnemyObjectiveAttackTargetPoint(state, enemy, squad, planet, time) {
  if (!enemy || enemy.combatRole !== 'objectiveAttacker' || !enemy.objectiveAttack || enemy.objectiveAttack.phase === 'cooldown') {
    return null;
  }
  const encounter = getEncounterById(state, enemy.encounterId);
  const target = getEncounterProtectedEntity(state, encounter) || getEncounterAnchorPosition(state, encounter);
  if (!target) {
    return null;
  }
  const attack = enemy.objectiveAttack;
  const targetEntity = target.position ? target : null;
  const entityFrameSource = targetEntity || { position: target, forward: enemy.forward, up: enemy.up };
  const phaseAge = time - attack.phaseStartedAt;
  const targetPoint = targetEntity ? targetEntity.position : target;
  const distanceToTarget = enemy.position.distanceTo(targetPoint);

  if (attack.phase === 'stage') {
    const stageSlot = computeEntityRelativeSlot(
      entityFrameSource,
      -config.transportDefenseAttackSlotDistance,
      attack.attackSlotSide * config.transportDefenseAttackSlotSideOffset,
      config.transportDefenseAttackSlotUpOffset
    );
    if (phaseAge >= config.encounterPresentationStageDuration || enemy.position.distanceTo(stageSlot) <= config.encounterPresentationSlotTolerance) {
      attack.phase = 'attack';
      attack.phaseStartedAt = time;
      pushEvent(state, 'objective-attack-start', {
        enemyId: enemy.id,
        encounterId: encounter?.id ?? -1,
        encounterType: encounter?.type || '',
        targetEntityId: attack.targetEntityId
      });
    } else {
      return stageSlot;
    }
  }

  if (attack.phase === 'attack') {
    if (distanceToTarget <= config.transportDefenseAttackSlotDistance) {
      attack.reachedAttackSlot = true;
    }
    if (phaseAge >= config.transportDefenseAttackRunDuration || attack.reachedAttackSlot) {
      attack.phase = 'escape';
      attack.phaseStartedAt = time;
      pushEvent(state, 'objective-attack-success', {
        enemyId: enemy.id,
        encounterId: encounter?.id ?? -1,
        reachedAttackSlot: Boolean(attack.reachedAttackSlot)
      });
    } else {
      return computeEntityRelativeSlot(
        entityFrameSource,
        config.transportDefenseAttackSlotDistance * 0.15,
        -attack.attackSlotSide * config.transportDefenseAttackSlotSideOffset * 0.35,
        config.transportDefenseAttackSlotUpOffset * 0.35
      );
    }
  }

  if (attack.phase === 'escape') {
    if (phaseAge >= config.transportDefenseAttackerCooldown) {
      enemy.combatRole = 'cooldown';
      enemy.objectiveAttack = {
        ...attack,
        phase: 'cooldown',
        phaseStartedAt: time
      };
      enemy.isPrimaryThreat = false;
      enemy.hudPriority = config.encounterReserveHudPriority;
      if (encounter) {
        encounter.activeObjectiveAttackerEnemyIds = encounter.activeObjectiveAttackerEnemyIds.filter((id) => id !== enemy.id);
      }
      if (state.encounterDirector) {
        state.encounterDirector.activeObjectiveAttackerEnemyIds = state.encounterDirector.activeObjectiveAttackerEnemyIds.filter((id) => id !== enemy.id);
      }
      pushEvent(state, 'objective-attack-end', {
        enemyId: enemy.id,
        encounterId: encounter?.id ?? -1
      });
      return null;
    }
    return computeEntityRelativeSlot(
      entityFrameSource,
      config.transportDefenseAttackSlotDistance,
      attack.attackSlotSide * config.transportDefenseAttackSlotSideOffset * 2,
      config.transportDefenseAttackSlotUpOffset * 2
    );
  }

  return null;
}

function computeEnemyTargetPoint(state, enemy, squad, planet, time) {
  const objectiveAttackTarget = computeEnemyObjectiveAttackTargetPoint(state, enemy, squad, planet, time);
  if (objectiveAttackTarget) {
    return objectiveAttackTarget;
  }
  const presentationTarget = computeEnemyPresentationTargetPoint(state, enemy, squad, planet, time);
  if (presentationTarget) {
    return liftTargetAboveEnemyHorizon(enemy, planet, presentationTarget);
  }
  const reserveTarget = computeEnemyReserveTargetPoint(state, enemy, squad, planet);
  if (reserveTarget) {
    return liftTargetAboveEnemyHorizon(enemy, planet, reserveTarget);
  }

  const radial = planet.position.lengthSq() > 1e-6
    ? tempVecA.copy(planet.position).normalize()
    : tempVecA.copy(worldUp);
  const basis = buildBasisFromNormal(radial);
  const atmosphereThickness = Math.max(planet.atmosphereRadius - planet.radius, 1.0);
  const fighterApproachAltitudeFactor = squad.parentMothershipId >= 0 && squad.fighterDiveAltitudeFactor > 0
    ? (squad.mode === 'approach' && enemy.boundPlanet === planet
      ? config.fighterSettleAltitudeFactor
      : squad.fighterDiveAltitudeFactor)
    : null;
  const fighterPatrolAltitudeFactor = squad.parentMothershipId >= 0 && squad.mode === 'swarm' && squad.fighterPatrolAltitudeFactor > 0
    ? squad.fighterPatrolAltitudeFactor
    : fighterApproachAltitudeFactor;
  const approachAltitude = planet.radius + atmosphereThickness * (fighterApproachAltitudeFactor ?? config.enemyApproachAltitudeFactor);
  const swarmAltitude = planet.radius + atmosphereThickness * (fighterPatrolAltitudeFactor ?? config.enemySwarmAltitudeFactor);
  const orbitLead = squad.mode === 'swarm'
    ? THREE.MathUtils.lerp(0.55, 0.9, enemy.speedScale)
    : squad.mode === 'depart'
      ? THREE.MathUtils.lerp(0.25, 0.45, enemy.speedScale)
      : THREE.MathUtils.lerp(0.35, 0.6, enemy.speedScale);
  const orbitRadius = atmosphereThickness * (
    squad.mode === 'swarm'
      ? THREE.MathUtils.lerp(0.35, 0.55, enemy.speedScale)
      : squad.mode === 'depart'
        ? THREE.MathUtils.lerp(0.12, 0.25, enemy.speedScale)
        : THREE.MathUtils.lerp(0.18, 0.32, enemy.speedScale)
  );
  const orbitAngle = squad.orbitPhase + squad.orbitDirection * orbitLead + enemy.phase * 0.2;
  const fighterPatrolMode = squad.parentMothershipId >= 0 && squad.mode === 'swarm';
  const formationSpread = fighterPatrolMode
    ? atmosphereThickness * THREE.MathUtils.lerp(0.22, 0.48, enemy.speedScale)
    : 0;
  const formationAngle = enemy.formationAngle || 0;
  const formationOffset = fighterPatrolMode && formationSpread > 0
    ? tempVecE.copy(basis.tangent).multiplyScalar(Math.cos(formationAngle + time * 0.03) * formationSpread)
      .addScaledVector(basis.bitangent, Math.sin(formationAngle + time * 0.027) * formationSpread * 0.88)
    : tempVecE.set(0, 0, 0);
  const altitudeOffset = fighterPatrolMode
    ? Math.sin(formationAngle * 1.7 + time * 0.05 + enemy.phase) * atmosphereThickness * 0.09
    : 0;
  const fighterSeparationOffset = fighterPatrolMode
    ? state.enemies.reduce((accumulator, other) => {
      if (!other || other === enemy || other.health <= 0 || other.kind !== 'fighter' || other.parentMothershipId !== squad.parentMothershipId) {
        return accumulator;
      }
      const delta = tempVecF.copy(enemy.position).sub(other.position);
      const distance = delta.length();
      const pushRadius = atmosphereThickness * 0.22;
      if (distance < 1e-6 || distance >= pushRadius) {
        return accumulator;
      }
      const push = (pushRadius - distance) / pushRadius;
      return accumulator.add(delta.normalize().multiplyScalar(push * push * atmosphereThickness * 0.16));
    }, tempVecG.set(0, 0, 0))
    : tempVecG.set(0, 0, 0);

  if (squad.mode === 'depart') {
    const departPlanet = state.planets[Math.max(0, Math.min(state.planets.length - 1, squad.departPlanetIndex))] || planet;
    const departVector = squad.departVector.lengthSq() > 1e-6
      ? tempVecB.copy(squad.departVector).normalize()
      : tempVecB.copy(planet.position).sub(departPlanet.position).normalize();
    const exitDistance = departPlanet.radius + Math.max(atmosphereThickness * 0.58, config.planetCaptureAltitude * 1.2);
    const transferPoint = tempVecC.copy(departPlanet.position).addScaledVector(departVector, exitDistance);
    const travelPoint = tempVecD.copy(planet.position).addScaledVector(
      departVector,
      planet.radius + Math.max(config.planetCaptureAltitude * 0.8, atmosphereThickness * 0.62)
    );
    const altitudeFromDepart = enemy.position.distanceTo(departPlanet.position) - departPlanet.radius;
    return altitudeFromDepart <= Math.max(config.planetCaptureAltitude * 1.2, atmosphereThickness * 0.58)
      ? transferPoint
      : travelPoint;
  }

  const altitude = squad.mode === 'swarm' ? swarmAltitude : approachAltitude;
  const ringOffset = tempVecB.copy(basis.tangent).multiplyScalar(Math.cos(orbitAngle) * orbitRadius)
    .addScaledVector(basis.bitangent, Math.sin(orbitAngle) * orbitRadius * 0.82);
  const wobbleScale = squad.mode === 'swarm' ? 0.35 : 0.55;
  const wobble = tempVecC.copy(basis.tangent).multiplyScalar(Math.sin(time * 0.18 + enemy.phase) * enemy.formationRadius * 0.010 * wobbleScale)
    .addScaledVector(basis.bitangent, Math.cos(time * 0.16 + enemy.phase * 1.7) * enemy.formationRadius * 0.008 * wobbleScale);
  return tempVecD.copy(planet.position).addScaledVector(radial, altitude + altitudeOffset).add(ringOffset).add(formationOffset).add(fighterSeparationOffset).add(wobble);
}

function beginEnemySwarm(squad, targetPlanet, enemy) {
  squad.mode = 'swarm';
  squad.modeTimer = squad.swarmDuration;
  squad.orbitPhase = 0;
  squad.orbitProgress = 0;
  squad.orbitLastAngle = getEnemyOrbitAngle(targetPlanet, enemy.position);
}

function beginEnemyDepart(state, squad, targetPlanet) {
  const departPlanetIndex = squad.targetPlanetIndex;
  const nextPlanetIndex = squad.nextPlanetIndex;
  const departPlanet = state.planets[Math.max(0, Math.min(state.planets.length - 1, departPlanetIndex))] || targetPlanet;
  const nextPlanet = state.planets[Math.max(0, Math.min(state.planets.length - 1, nextPlanetIndex))] || targetPlanet;

  squad.mode = 'depart';
  squad.modeTimer = squad.departDuration;
  squad.departPlanetIndex = departPlanetIndex;
  squad.departVector.copy(nextPlanet.position).sub(departPlanet.position);
  if (squad.departVector.lengthSq() < 1e-6) {
    squad.departVector.copy(departPlanet.position).normalize();
  }
  if (squad.departVector.lengthSq() < 1e-6) {
    squad.departVector.copy(worldUp);
  }
  squad.departVector.normalize();
  squad.targetPlanetIndex = nextPlanetIndex;
  squad.nextPlanetIndex = pickRandomPlanetIndex(state, squad.targetPlanetIndex);
}

function shouldEnemyStayBound(state, enemy, squad, targetPlanet, targetAltitude) {
  const directedEncounterMode = (
    (enemy.combatRole === 'presenter' && enemy.presentation && enemy.presentation.phase !== 'cooldown')
    || (enemy.combatRole === 'objectiveAttacker' && enemy.objectiveAttack && enemy.objectiveAttack.phase !== 'cooldown')
  );
  if (directedEncounterMode && enemy.encounterId >= 0) {
    const encounter = getEncounterById(state, enemy.encounterId);
    if (encounter && encounter.anchorKind !== 'planet') {
      return false;
    }
  }
  if (squad.mode === 'swarm') {
    return true;
  }
  if (squad.mode === 'approach') {
    return targetAltitude <= config.planetCaptureAltitude;
  }
  if (squad.mode === 'depart') {
    return targetAltitude <= config.planetEscapeAltitude;
  }
  return enemy.boundPlanet === targetPlanet;
}

function accumulateEnemyOrbitProgress(squad, targetPlanet, enemy) {
  const currentAngle = getEnemyOrbitAngle(targetPlanet, enemy.position);
  if (Number.isFinite(squad.orbitLastAngle)) {
    squad.orbitProgress += Math.abs(unwrapAngleDelta(squad.orbitLastAngle, currentAngle));
  }
  squad.orbitLastAngle = currentAngle;
}

function computeEnemyTravelDistance(state, targetPlanet, enemy, squad) {
  let travelDistance = enemy.position.distanceTo(targetPlanet.position);
  if (squad.mode === 'depart' || enemy.kind === 'mothership') {
    const departPlanetIndex = squad.departPlanetIndex >= 0
      ? squad.departPlanetIndex
      : squad.targetPlanetIndex;
    const departPlanet = state.planets[Math.max(0, Math.min(state.planets.length - 1, departPlanetIndex))];
    if (departPlanet) {
      travelDistance = Math.min(travelDistance, enemy.position.distanceTo(departPlanet.position));
    }
  }
  return Math.max(travelDistance, 1.0);
}

function computeEnemyControlTargetSpeed(state, targetPlanet, enemy, squad) {
  const atmosphereThickness = Math.max(targetPlanet.atmosphereRadius - targetPlanet.radius, 1.0);
  const fighterApproachAltitudeFactor = squad.parentMothershipId >= 0 && squad.fighterDiveAltitudeFactor > 0
    ? (squad.mode === 'approach' && enemy.boundPlanet === targetPlanet
      ? config.fighterSettleAltitudeFactor
      : squad.fighterDiveAltitudeFactor)
    : null;
  const fighterPatrolAltitudeFactor = squad.parentMothershipId >= 0 && squad.mode === 'swarm' && squad.fighterPatrolAltitudeFactor > 0
    ? squad.fighterPatrolAltitudeFactor
    : fighterApproachAltitudeFactor;
  const desiredRadius = targetPlanet.radius + atmosphereThickness * (
    squad.mode === 'swarm' && fighterPatrolAltitudeFactor != null
      ? fighterPatrolAltitudeFactor
      : fighterApproachAltitudeFactor != null
        ? fighterApproachAltitudeFactor
      : squad.mode === 'swarm'
        ? config.enemySwarmAltitudeFactor
      : squad.mode === 'depart'
        ? config.enemyDepartAltitudeFactor
        : config.enemyApproachAltitudeFactor
  );
  const surfaceSpeed = Math.sqrt(Math.max(targetPlanet.gravityStrength / Math.max(desiredRadius, 1.0), 1.0));
  let presentationSpeedMultiplier = enemy.combatRole === 'presenter' && enemy.presentation && enemy.presentation.phase !== 'cooldown'
    ? config.enemyPresentationSpeedMultiplier
    : 1;
  if (presentationSpeedMultiplier > 1) {
    const currentAltitude = enemy.position.distanceTo(targetPlanet.position) - targetPlanet.radius;
    const safeAltitude = config.atmosphereTerrainCrashAltitude + config.encounterPresentationTerrainLiftOffset * 0.35;
    const altitudeBlend = smoothstep(safeAltitude * 0.65, safeAltitude * 1.8, currentAltitude);
    presentationSpeedMultiplier = THREE.MathUtils.lerp(1.05, presentationSpeedMultiplier, altitudeBlend);
  }
  return surfaceSpeed * THREE.MathUtils.lerp(0.12, 0.18, enemy.speedScale) * presentationSpeedMultiplier;
}


function computeEnemyControlInputs(state, enemy, squad, targetPlanet, time, dt) {
  const rawTargetPoint = computeEnemyTargetPoint(state, enemy, squad, targetPlanet, time);
  const presentationMode = enemy.combatRole === 'presenter' && enemy.presentation && enemy.presentation.phase !== 'cooldown';
  const objectiveAttackMode = enemy.combatRole === 'objectiveAttacker' && enemy.objectiveAttack && enemy.objectiveAttack.phase !== 'cooldown';
  const directedEncounterMode = presentationMode || objectiveAttackMode;
  const travelMode = squad.mode !== 'swarm' || directedEncounterMode;
  const presentationSignature = presentationMode
    ? `${enemy.presentation.kind}:${enemy.presentation.phase}:${enemy.presentation.startedAt}`
    : objectiveAttackMode
      ? `objective:${enemy.objectiveAttack.kind}:${enemy.objectiveAttack.phase}:${enemy.objectiveAttack.startedAt}`
      : '';
  const targetSignatureChanged = enemy.aiMode !== squad.mode
    || enemy.aiTargetPlanetIndex !== squad.targetPlanetIndex
    || enemy.aiDepartPlanetIndex !== squad.departPlanetIndex
    || enemy.aiPresentationSignature !== presentationSignature;

  if (!enemy.hasSmoothedTargetPoint || targetSignatureChanged) {
    enemy.smoothedTargetPoint.copy(rawTargetPoint);
    enemy.hasSmoothedTargetPoint = true;
    enemy.aiMode = squad.mode;
    enemy.aiTargetPlanetIndex = squad.targetPlanetIndex;
    enemy.aiDepartPlanetIndex = squad.departPlanetIndex;
    enemy.aiPresentationSignature = presentationSignature;
  } else {
    const targetSmoothRate = travelMode ? config.enemyTargetSmoothRateTravel : config.enemyTargetSmoothRateSwarm;
    enemy.smoothedTargetPoint.lerp(rawTargetPoint, easeExp(dt, targetSmoothRate));

    const maxLag = Math.max(18, targetPlanet.atmosphereRadius * (travelMode ? 0.18 : 0.055));
    const lag = enemy.smoothedTargetPoint.distanceTo(rawTargetPoint);
    if (lag > maxLag) {
      enemy.smoothedTargetPoint.lerp(rawTargetPoint, 1 - maxLag / Math.max(lag, 0.0001));
    }
  }

  const toTarget = tempVecD.copy(enemy.smoothedTargetPoint).sub(enemy.position);
  const distance = Math.max(0.0001, toTarget.length());
  const desiredForward = tempVecE.copy(toTarget).divideScalar(distance);
  const radialUp = targetPlanet.position.lengthSq() > 1e-6
    ? tempVecF.copy(enemy.position).sub(targetPlanet.position).normalize()
    : worldUp;
  const currentAltitude = enemy.position.distanceTo(targetPlanet.position) - targetPlanet.radius;
  const rightAxis = tempVecA.copy(enemy.up).cross(enemy.forward);
  if (rightAxis.lengthSq() < 1e-6) {
    rightAxis.copy(radialUp).cross(enemy.forward);
  }
  if (rightAxis.lengthSq() < 1e-6) {
    rightAxis.set(1, 0, 0).cross(enemy.forward);
  }
  rightAxis.normalize();

  const currentSurfaceSpeed = computeEnemyControlTargetSpeed(state, targetPlanet, enemy, squad);
  const liftState = computeAtmosphereLiftState(
    targetPlanet,
    currentAltitude,
    Math.max(enemy.speed || 0, 0.0001),
    currentSurfaceSpeed
  );

  const yawError = Math.atan2(desiredForward.dot(rightAxis), desiredForward.dot(enemy.forward));
  const wanderTurn = travelMode
    ? Math.sin(time * 0.11 + enemy.phase) * config.enemyTravelWanderTurn
    : Math.sin(time * 0.22 + enemy.phase) * config.enemySwarmWanderTurn;
  const wanderPitch = travelMode
    ? Math.cos(time * 0.09 + enemy.phase * 1.7) * config.enemyTravelWanderPitch * 0.45
    : Math.cos(time * 0.19 + enemy.phase * 1.7) * config.enemySwarmWanderPitch * 0.55;
  const presentationTurnMultiplier = presentationMode ? config.enemyPresentationTurnMultiplier : 1;
  const presentationPitchMultiplier = presentationMode ? config.enemyPresentationPitchMultiplier : 1;
  const turnGain = (travelMode ? 3.2 : 1.55) * enemy.turnScale * presentationTurnMultiplier;
  const pitchGain = (travelMode ? 1.45 : 0.95) * enemy.upScale * THREE.MathUtils.lerp(1, 0.82, liftState.thinAir) * presentationPitchMultiplier;
  let rawTurnInput = THREE.MathUtils.clamp(-yawError * turnGain + wanderTurn, -0.9, 0.9);

  const atmosphereThickness = liftState.atmosphereThickness;
  const fighterApproachAltitudeFactor = squad.parentMothershipId >= 0 && squad.fighterDiveAltitudeFactor > 0
    ? (squad.mode === 'approach' && enemy.boundPlanet === targetPlanet
      ? config.fighterSettleAltitudeFactor
      : squad.fighterDiveAltitudeFactor)
    : null;
  const fighterPatrolAltitudeFactor = squad.parentMothershipId >= 0 && squad.mode === 'swarm' && squad.fighterPatrolAltitudeFactor > 0
    ? squad.fighterPatrolAltitudeFactor
    : fighterApproachAltitudeFactor;
  const desiredApproachAltitude = atmosphereThickness * (fighterApproachAltitudeFactor ?? config.enemyApproachAltitudeFactor);
  const desiredSwarmAltitudeFactor = fighterPatrolAltitudeFactor ?? config.enemySwarmAltitudeFactor;
  const patrolAltitudeMinFactor = squad.parentMothershipId >= 0 && config.fighterPatrolAltitudeMinFactor > 0
    ? config.fighterPatrolAltitudeMinFactor
    : desiredSwarmAltitudeFactor;
  const patrolAltitudeMaxFactor = squad.parentMothershipId >= 0 && config.fighterPatrolAltitudeMaxFactor > 0
    ? config.fighterPatrolAltitudeMaxFactor
    : desiredSwarmAltitudeFactor;
  const desiredSwarmAltitude = atmosphereThickness * desiredSwarmAltitudeFactor;
  const patrolAltitudeMin = atmosphereThickness * patrolAltitudeMinFactor;
  const patrolAltitudeMax = atmosphereThickness * patrolAltitudeMaxFactor;
  const altitudeRange = Math.max(patrolAltitudeMax - patrolAltitudeMin, atmosphereThickness * 0.1, 1);
  const altitudeBias = THREE.MathUtils.clamp((currentAltitude - desiredSwarmAltitude) / altitudeRange, -1, 1);
  const pitchError = Math.atan2(-desiredForward.dot(enemy.up), desiredForward.dot(enemy.forward));
  let rawPitchInput = THREE.MathUtils.clamp(
    pitchError * pitchGain + (travelMode ? 0 : altitudeBias * 0.65) + wanderPitch,
    -0.85,
    0.85
  );

  const fighterPatrolMode = !directedEncounterMode && squad.parentMothershipId >= 0 && squad.mode === 'swarm';
  if (fighterPatrolMode) {
    if (!enemy.patrolState) {
      enemy.patrolState = 'straight';
      enemy.patrolStateUntil = 0;
      enemy.patrolAxis = '';
      enemy.patrolBankDirection = 0;
      enemy.patrolBankTarget = 0;
    }
    const avoidRadius = atmosphereThickness * 0.42;
    const hardSeparationRadius = atmosphereThickness * Math.max(0.1, config.fighterPatrolHardSeparationFactor || 0.42);
    let avoidanceTurn = 0;
    let avoidancePitch = 0;
    for (const other of state.enemies) {
      if (!other || other === enemy || other.health <= 0 || other.kind !== 'fighter' || other.parentMothershipId !== squad.parentMothershipId) {
        continue;
      }
      const offset = tempVecG.copy(enemy.position).sub(other.position);
      const distance = offset.length();
      if (distance < 1e-6 || distance >= avoidRadius) {
        continue;
      }
      const away = offset.multiplyScalar(1 / distance);
      const closeness = 1 - distance / avoidRadius;
      avoidanceTurn += away.dot(rightAxis) * closeness * 0.95;
      avoidancePitch += away.dot(radialUp) * closeness * 0.65;
    }
    rawTurnInput += THREE.MathUtils.clamp(avoidanceTurn, -0.85, 0.85);
    rawPitchInput += THREE.MathUtils.clamp(avoidancePitch, -0.6, 0.6);
    if (currentAltitude < patrolAltitudeMin || currentAltitude > patrolAltitudeMax) {
      rawPitchInput = THREE.MathUtils.clamp(
        rawPitchInput + THREE.MathUtils.clamp((desiredSwarmAltitude - currentAltitude) / Math.max(atmosphereThickness * 0.22, 1), -1, 1) * 0.55,
        -0.9,
        0.9
      );
    }
    for (const other of state.enemies) {
      if (!other || other === enemy || other.health <= 0 || other.kind !== 'fighter' || other.parentMothershipId !== squad.parentMothershipId) {
        continue;
      }
      const delta = tempVecD.copy(enemy.position).sub(other.position);
      const distance = delta.length();
      if (distance < 1e-6 || distance >= hardSeparationRadius) {
        continue;
      }
      const push = (hardSeparationRadius - distance) / hardSeparationRadius;
      const away = delta.multiplyScalar(1 / distance);
      rawTurnInput += THREE.MathUtils.clamp(away.dot(rightAxis) * push * 1.2, -0.9, 0.9);
      rawPitchInput += THREE.MathUtils.clamp(away.dot(radialUp) * push * 0.9, -0.7, 0.7);
    }
  }

  if (fighterPatrolMode && currentAltitude >= patrolAltitudeMin && currentAltitude <= patrolAltitudeMax) {
    if (!Number.isFinite(enemy.patrolStateUntil) || time >= (enemy.patrolStateUntil || 0)) {
      if (enemy.patrolState === 'bank') {
        enemy.patrolState = 'straight';
        enemy.patrolStateUntil = time + state.rng() * 5.0;
        enemy.patrolBankDirection = 0;
        enemy.patrolBankTarget = 0;
      } else {
        enemy.patrolState = 'bank';
        enemy.patrolStateUntil = time + state.rng() * 3.0;
        const axisChoice = state.rng() < 0.5 ? 'leftRight' : 'upDown';
        enemy.patrolAxis = axisChoice;
        if (axisChoice === 'leftRight') {
          enemy.patrolBankDirection = state.rng() < 0.5 ? -1 : 1;
          enemy.patrolBankTarget = THREE.MathUtils.degToRad(45) * enemy.patrolBankDirection * state.rng();
          rawTurnInput = THREE.MathUtils.clamp(enemy.patrolBankDirection * (0.3 + state.rng() * 0.5), -1, 1);
          rawPitchInput = 0;
        } else {
          enemy.patrolBankDirection = state.rng() < 0.5 ? -1 : 1;
          enemy.patrolBankTarget = THREE.MathUtils.degToRad(45) * enemy.patrolBankDirection * state.rng();
          rawTurnInput = 0;
          rawPitchInput = THREE.MathUtils.clamp(enemy.patrolBankDirection * (0.3 + state.rng() * 0.5), -1, 1);
        }
      }
    }
    if (enemy.patrolState === 'bank') {
      if (enemy.patrolAxis === 'leftRight') {
        rawTurnInput = THREE.MathUtils.clamp(enemy.patrolBankTarget || rawTurnInput, -1, 1);
        rawPitchInput = 0;
      } else {
        rawTurnInput = 0;
        rawPitchInput = THREE.MathUtils.clamp(enemy.patrolBankTarget || rawPitchInput, -1, 1);
      }
    } else {
      rawTurnInput = 0;
      rawPitchInput = 0;
    }
  }

  if (liftState.stallBlend > 0) {
    const desiredClimb = THREE.MathUtils.clamp(desiredForward.dot(radialUp), 0, 1);
    const stallPitchFloor = THREE.MathUtils.lerp(-0.06, 0.32, liftState.stallBlend);
    rawPitchInput = Math.max(rawPitchInput, stallPitchFloor + desiredClimb * liftState.stallBlend * 0.22);
  }

  const upperAtmosphereGuard = smoothstep(
    atmosphereThickness * 0.5,
    atmosphereThickness * 0.82,
    currentAltitude
  );
  if (upperAtmosphereGuard > 0 && !fighterPatrolMode) {
    const desiredClimb = THREE.MathUtils.clamp(desiredForward.dot(radialUp), 0, 1);
    const ceilingPitchFloor = THREE.MathUtils.lerp(-0.14, 0.72, upperAtmosphereGuard);
    rawPitchInput = Math.max(rawPitchInput, ceilingPitchFloor + desiredClimb * upperAtmosphereGuard * 0.22);
  }

  if (squad.mode === 'swarm' && !fighterPatrolMode) {
    const swarmAltitudeGuard = smoothstep(
      atmosphereThickness * 0.46,
      atmosphereThickness * 0.82,
      currentAltitude
    );
    if (swarmAltitudeGuard > 0) {
      const desiredClimb = THREE.MathUtils.clamp(desiredForward.dot(radialUp), 0, 1);
      const minPitchInput = THREE.MathUtils.lerp(-0.08, 0.68, swarmAltitudeGuard);
      rawPitchInput = Math.max(rawPitchInput, minPitchInput + desiredClimb * swarmAltitudeGuard * 0.26);
    }
  }

  if (fighterPatrolMode) {
    const patrolAltitudeError = THREE.MathUtils.clamp(
      (desiredSwarmAltitude - currentAltitude) / Math.max(atmosphereThickness * config.fighterPatrolAltitudeErrorScale, 1),
      -1,
      1
    );
    const patrolPitchFloor = THREE.MathUtils.lerp(
      config.fighterPatrolPitchFloorMax,
      config.fighterPatrolPitchFloorMin,
      patrolAltitudeError
    );
    rawPitchInput = Math.min(rawPitchInput, patrolPitchFloor);
  }

  if (enemy.kind !== 'mothership') {
    const pitchClamp = travelMode ? 0.45 : 0.55;
    const pitchBias = squad.mode === 'swarm' ? 0.9 : 0.96;
    rawPitchInput = THREE.MathUtils.clamp(rawPitchInput * pitchBias, -pitchClamp, pitchClamp);
  }

  if (fighterPatrolMode) {
    let collisionCourseTurn = 0;
    for (const other of state.enemies) {
      if (!other || other === enemy || other.health <= 0) {
        continue;
      }
      const offset = tempVecG.copy(other.position).sub(enemy.position);
      const distance = offset.length();
      if (distance < 1e-6 || distance > atmosphereThickness * 0.85) {
        continue;
      }
      const forwardDot = offset.dot(desiredForward);
      if (forwardDot <= 0) {
        continue;
      }
      const coneAngle = Math.atan2(Math.sqrt(Math.max(0, distance * distance - forwardDot * forwardDot)), forwardDot);
      if (coneAngle > 0.9) {
        continue;
      }
      const side = offset.dot(rightAxis);
      if (side >= 0) {
        continue;
      }
      const closeness = 1 - distance / (atmosphereThickness * 0.85);
      collisionCourseTurn += closeness * (1.4 + Math.abs(side) / Math.max(distance, 1)) * 2.0;
    }
    if (collisionCourseTurn > 0) {
      rawTurnInput = Math.max(rawTurnInput, 0.75);
      rawTurnInput += THREE.MathUtils.clamp(collisionCourseTurn * 1.4, 0, 2.0);
      rawTurnInput = THREE.MathUtils.clamp(rawTurnInput, -1, 1);
    }
  }

  const inputSmoothRate = travelMode ? config.enemyInputSmoothRateTravel : config.enemyInputSmoothRateSwarm;
  enemy.aiTurnInput = THREE.MathUtils.lerp(enemy.aiTurnInput || 0, rawTurnInput, easeExp(dt, inputSmoothRate));
  enemy.aiPitchInput = THREE.MathUtils.lerp(enemy.aiPitchInput || 0, rawPitchInput, easeExp(dt, inputSmoothRate));

  const presentationSafeAltitude = config.atmosphereTerrainCrashAltitude + config.encounterPresentationTerrainLiftOffset * 0.35;
  const rawBoost = presentationMode
    ? currentAltitude > presentationSafeAltitude
      && (state.rng() < config.enemyPresentationBoostBias || enemy.presentation.phase === 'stage' || enemy.presentation.phase === 'stageFront')
    : fighterPatrolMode
      ? false
      : (
      squad.mode === 'depart'
      || (squad.mode === 'swarm' && currentAltitude <= desiredSwarmAltitude + atmosphereThickness * 0.08)
      || (squad.mode === 'approach' && currentAltitude > Math.max(config.planetCaptureAltitude * 1.25, desiredApproachAltitude))
    ) && (
        desiredForward.dot(radialUp) < 0.14
        || currentAltitude <= Math.max(desiredSwarmAltitude, config.planetCaptureAltitude)
      );
  const rawBrake = fighterPatrolMode
    ? false
    : squad.mode === 'swarm'
    && liftState.stallBlend < 0.35
    && currentAltitude <= desiredSwarmAltitude + atmosphereThickness * 0.10
    && enemy.speed > currentSurfaceSpeed * THREE.MathUtils.lerp(1.18, 1.34, enemy.speedScale);

  enemy.aiBoostHold = rawBoost ? Math.max(enemy.aiBoostHold || 0, travelMode ? 0.26 : 0.16) : Math.max(0, (enemy.aiBoostHold || 0) - dt);
  enemy.aiBrakeHold = rawBrake ? Math.max(enemy.aiBrakeHold || 0, 0.18) : Math.max(0, (enemy.aiBrakeHold || 0) - dt);

  return {
    turnInput: THREE.MathUtils.clamp(enemy.aiTurnInput || 0, -1, 1),
    pitchInput: THREE.MathUtils.clamp(enemy.aiPitchInput || 0, -1, 1),
    boost: enemy.aiBoostHold > 0,
    brake: enemy.aiBrakeHold > 0,
    desiredForward
  };
}

function updateEnemyShip(state, enemy, squad, dt, time) {
  if (!enemy || enemy.health <= 0) {
    return;
  }

  if (enemy.flightMode === 'free') {
    const preCrash = detectEnemyCrash(state, enemy);
    if (preCrash) {
      destroyEnemy(state, enemy, 'crash');
      return;
    }
  }

  let targetPlanet = getEnemyTargetPlanet(state, enemy);
  if (!targetPlanet) {
    return;
  }

  const nearestPlanetInfo = getNearestPlanetInfo(state, enemy.position);
  if (nearestPlanetInfo.planet && nearestPlanetInfo.distance > config.deepSpaceSuspiciousDistance) {
    if (enemy.kind === 'mothership') {
      if (squad.mode !== 'exit') {
        squad.mode = 'exit';
        squad.modeTimer = Math.max(squad.modeTimer, squad.departDuration);
        squad.departPlanetIndex = squad.targetPlanetIndex;
      }
      squad.mothershipExitDirection = nearestPlanetInfo.planet.position.clone().sub(enemy.position).normalize();
      if (squad.mothershipExitDirection.lengthSq() < 1e-6) {
        squad.mothershipExitDirection.copy(enemy.forward).normalize();
      }
    } else {
      squad.targetPlanetIndex = nearestPlanetInfo.index;
      squad.departPlanetIndex = -1;
      if (squad.mode === 'depart' || squad.mode === 'exit') {
        squad.mode = 'approach';
        squad.modeTimer = 0;
      }
    }
    targetPlanet = nearestPlanetInfo.planet;
  }

  const controls = computeEnemyControlInputs(state, enemy, squad, targetPlanet, time, dt);

  // Enemies use the shared ship physics, but they should stay planet-aware while transiting.
  enemy.recaptureLock = enemy.kind === 'mothership'
    ? Math.max(enemy.recaptureLock || 0, 9999)
    : 0;

  const enemyWorld = {
    planets: state.planets,
    ship: enemy,
    fuel: 9999,
    maxFuel: 9999,
    speed: enemy.speed,
    gamepadRespawnHeld: false,
    nearestPlanet: targetPlanet,
    nearestAltitude: Math.max(0, enemy.position.distanceTo(targetPlanet.position) - targetPlanet.radius),
    nearestDistance: enemy.position.distanceTo(targetPlanet.position),
    crashed: false,
    respawnPlanetIndex: state.respawnPlanetIndex,
    projectiles: state.projectiles
  };

  updateEnemyShipState(enemyWorld, dt, {
    turnInput: controls.turnInput,
    pitchInput: controls.pitchInput,
    boost: controls.boost,
    brake: controls.brake,
    respawn: false,
    fire: false,
    fireDirection: controls.desiredForward
  });

  if (enemy.health <= 0) {
    return;
  }

  const postCrash = detectEnemyCrash(state, enemy);
  if (postCrash) {
    destroyEnemy(state, enemy, 'crash');
    return;
  }

  const targetAltitude = enemy.position.distanceTo(targetPlanet.position) - targetPlanet.radius;
  if (shouldEnemyStayBound(state, enemy, squad, targetPlanet, targetAltitude)) {
    if (enemy.boundPlanet !== targetPlanet || enemy.flightMode !== 'bound') {
      beginPlanetCapture(enemy, targetPlanet);
    }
  } else {
    enemy.boundPlanet = targetPlanet;
    enemy.flightMode = 'free';
  }
}

function updateEncounterEntities(state, dt) {
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

function isEncounterActive(encounter) {
  return Boolean(encounter && encounter.status === 'active');
}

function isEnemyEligibleForPresentationInEncounter(state, enemy, encounter) {
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
  const planet = getEnemyTargetPlanet(state, enemy);
  if (encounter.anchorKind === 'planet') {
    if (!planet || state.planets.indexOf(planet) !== encounter.anchorPlanetIndex) {
      return false;
    }
    const altitude = enemy.position.distanceTo(planet.position) - planet.radius;
    if (altitude < config.atmosphereTerrainCrashAltitude + 3 || altitude > Math.max(planet.atmosphereRadius - planet.radius, config.planetEscapeAltitude) * 1.4) {
      return false;
    }
    const metrics = measureEnemyInPlayerFrame(state, enemy);
    if (!metrics || metrics.distance > config.encounterShootableMaxDistance * 0.42 || metrics.angleDeg > config.encounterShootableAngleDeg * 4.6) {
      return false;
    }
  }
  return true;
}

function isEnemyEligibleForObjectiveAttackInEncounter(state, enemy, encounter) {
  if (!isEnemyEligibleForPresentationInEncounter(state, enemy, encounter)) {
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

function pickPresentationKind(state, encounter, enemy) {
  const director = state.encounterDirector;
  const metrics = measureEnemyInPlayerFrame(state, enemy);
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

function assignPresentationSlots(state, encounter) {
  const activeCount = encounter.activePresenterEnemyIds.length;
  const availableSlots = Math.max(0, config.encounterMaxActivePresenters - activeCount);
  if (availableSlots <= 0) {
    return;
  }
  const candidates = getEncounterEnemies(state, encounter)
    .filter((enemy) => isEnemyEligibleForPresentationInEncounter(state, enemy, encounter))
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
    const kind = pickPresentationKind(state, encounter, enemy);
    beginEnemyPresentation(state, enemy, encounter, kind);
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

function assignObjectiveAttackSlots(state, encounter) {
  if (!(encounter.type === 'transportDefense' || encounter.type === 'convoyEscort' || encounter.type === 'bossSupportWave')) {
    return;
  }
  const activeCount = encounter.activeObjectiveAttackerEnemyIds.length;
  const availableSlots = Math.max(0, config.encounterMaxActiveObjectiveAttackers - activeCount);
  if (availableSlots <= 0) {
    return;
  }
  const candidates = getEncounterEnemies(state, encounter)
    .filter((enemy) => isEnemyEligibleForObjectiveAttackInEncounter(state, enemy, encounter))
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

function updateEncounterDirector(state, dt, time) {
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
    assignObjectiveAttackSlots(state, activeEncounter);
    assignPresentationSlots(state, activeEncounter);
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

function updateEnemySquads(state, dt, time) {
  const aliveSquads = [];
  for (const squad of state.enemySquads) {
    const squadEnemies = state.enemies.filter((enemy) => enemy.squadId === squad.id);
    if (squadEnemies.length === 0) {
      continue;
    }

    const targetPlanet = getEnemyTargetPlanet(state, { targetPlanetIndex: squad.targetPlanetIndex });
    if (!targetPlanet) {
      aliveSquads.push(squad);
      continue;
    }

    let sumAltitude = 0;
    for (const enemy of squadEnemies) {
      sumAltitude += enemy.position.distanceTo(targetPlanet.position) - targetPlanet.radius;
    }
    const avgAltitude = sumAltitude / squadEnemies.length;

    const isMothershipFighterSquad = squad.parentMothershipId >= 0 && squad.kind === 'fighter';
    if (isMothershipFighterSquad && squad.mode === 'approach') {
      const atmosphereThickness = Math.max(targetPlanet.atmosphereRadius - targetPlanet.radius, 1.0);
      const desiredSettleAltitude = atmosphereThickness * config.fighterSettleAltitudeFactor;
      const tolerance = atmosphereThickness * config.fighterSettleAltitudeToleranceFactor;
      const safeAltitude = config.atmosphereTerrainCrashAltitude + 5;
      const boundCount = squadEnemies.filter((enemy) => enemy && enemy.health > 0 && (enemy.boundPlanet === targetPlanet || enemy.flightMode === 'bound')).length;
      const inSettleBand = avgAltitude >= Math.max(desiredSettleAltitude - tolerance, 0) && avgAltitude <= desiredSettleAltitude + tolerance;
      const inAtmosphereBand = avgAltitude <= atmosphereThickness * 0.95;
      const settled =
        boundCount >= Math.max(1, Math.ceil(squadEnemies.length * 0.5))
        && (inSettleBand || inAtmosphereBand)
        && avgAltitude >= safeAltitude;

      if (settled) {
        if (squad.fighterSettleTimer <= 0) {
          pushEvent(state, 'fighter-settle-start', {
            squadId: squad.id,
            parentMothershipId: squad.parentMothershipId,
            planetIndex: state.planets.indexOf(targetPlanet),
            planetName: targetPlanet.name,
            avgAltitude,
            atmosphereThickness,
            time
          });
        }
        squad.fighterSettleTimer += dt;
        if (squad.fighterSettleTimer >= config.fighterSettleTime) {
          const firstFighter = squadEnemies.find((enemy) => enemy && enemy.health > 0) || null;
          if (firstFighter) {
            beginEnemySwarm(squad, targetPlanet, firstFighter);
            for (const enemy of squadEnemies) {
              if (!enemy || enemy.health <= 0) {
                continue;
              }
              enemy.patrolState = 'straight';
              enemy.patrolStateUntil = 0;
              enemy.patrolAxis = '';
              enemy.patrolBankDirection = 0;
              enemy.patrolBankTarget = 0;
            }
            pushEvent(state, 'fighter-patrol-start', {
              squadId: squad.id,
              parentMothershipId: squad.parentMothershipId,
              planetIndex: state.planets.indexOf(targetPlanet),
              planetName: targetPlanet.name,
              avgAltitude,
              atmosphereThickness,
              time
            });
          }
        }
      } else {
        squad.fighterSettleTimer = Math.max(0, squad.fighterSettleTimer - dt);
      }
    } else if (squad.mode === 'approach' && avgAltitude <= config.planetCaptureAltitude) {
      beginEnemySwarm(squad, targetPlanet, squadEnemies[0]);
    } else if (squad.mode === 'depart' && avgAltitude <= config.planetCaptureAltitude) {
      beginEnemySwarm(squad, targetPlanet, squadEnemies[0]);
    } else if (squad.mode === 'swarm') {
      squad.modeTimer = Math.max(0, squad.modeTimer - dt);
      squad.orbitPhase += dt * squad.orbitDirection * THREE.MathUtils.lerp(0.08, 0.13, squadEnemies[0].speedScale);
    } else if (squad.mode === 'depart') {
      squad.modeTimer -= dt;
      if (squad.modeTimer <= 0) {
        squad.mode = 'approach';
      }
    }

    for (const enemy of squadEnemies) {
      if (!enemy || enemy.health <= 0) {
        continue;
      }
      enemy.targetPlanetIndex = squad.targetPlanetIndex;
      enemy.nextPlanetIndex = squad.nextPlanetIndex;
      updateEnemyShip(state, enemy, squad, dt, time);
    }

    const livingSquadEnemies = squadEnemies.filter((enemy) => enemy && enemy.health > 0);
    if (livingSquadEnemies.length === 0) {
      continue;
    }

    if (squad.mode === 'swarm') {
      accumulateEnemyOrbitProgress(squad, targetPlanet, livingSquadEnemies[0]);
      if (squad.modeTimer <= 0 && squad.orbitProgress >= Math.PI * 2) {
        beginEnemyDepart(state, squad, targetPlanet);
      }
    }

    aliveSquads.push(squad);
  }

  state.enemySquads = aliveSquads;
  state.enemySquad = state.enemySquads[state.enemySquads.length - 1] || null;
}

function updateMothershipEnemy(state, enemy, squad, planet, dt) {
  const radial = planet.position.lengthSq() > 1e-6
    ? tempVecA.copy(planet.position).normalize()
    : tempVecA.copy(worldUp);
  const holdRadius = planet.radius * config.mothershipHoldRadiusFactor;
  const arrivalPoint = tempVecB.copy(planet.position).addScaledVector(radial, holdRadius);
  const previousPosition = enemy.previousPosition.copy(enemy.position);

  if (squad.mode === 'approach') {
    const toArrival = tempVecC.copy(arrivalPoint).sub(enemy.position);
    const gap = toArrival.length();
    if (gap <= Math.max(planet.radius * squad.approachSnapFactor, 24)) {
      squad.mode = 'hold';
      squad.holdAngle = getMothershipRng(state)() * Math.PI * 2;
      squad.holdReorientTimer = 0;
      squad.holdReorientDuration = config.mothershipHoldReorientDuration;
      squad.holdEntryUp.copy(enemy.up).normalize();
      squad.holdReoriented = false;
      enemy.position.copy(arrivalPoint);
      enemy.velocity.set(0, 0, 0);
      enemy.speed = 0;
      enemy.boundPlanet = planet;
      enemy.flightMode = 'bound';
      const arrivalForwardSeed = tempVecD.copy(squad.holdAxis).cross(squad.holdEntryUp);
      if (arrivalForwardSeed.lengthSq() < 1e-6) {
        arrivalForwardSeed.copy(enemy.forward);
      }
      if (arrivalForwardSeed.lengthSq() < 1e-6) {
        arrivalForwardSeed.copy(squad.mothershipTravelDirection || planet.position.clone().sub(enemy.position));
      }
      if (arrivalForwardSeed.lengthSq() < 1e-6) {
        arrivalForwardSeed.copy(squad.holdTangent);
      }
      const arrivalOrientation = buildSafeMothershipOrientation(
        squad.holdEntryUp,
        arrivalForwardSeed,
        squad.holdTangent,
        squad.holdRadial
      );
      enemy.forward.copy(arrivalOrientation.forward);
      enemy.up.copy(arrivalOrientation.up);
      enemy.relativePosition.copy(enemy.position).sub(planet.position);
      enemy.relativeVelocity.set(0, 0, 0);
      pushEvent(state, 'mothership-arrived', {
        mothershipSquadId: squad.id,
        mothershipId: enemy.id,
        planetIndex: squad.targetPlanetIndex,
        position: {
          x: enemy.position.x,
          y: enemy.position.y,
          z: enemy.position.z
        }
      });
      const encounter = ensurePlanetInvasionEncounterForMothership(state, squad, true);
      if (encounter) {
        enemy.encounterId = encounter.id;
      }
      return;
    }

    const moveDir = toArrival.divideScalar(gap);
    const radialDistance = Math.max(enemy.position.distanceTo(planet.position), 1);
    const approachSpeed = Math.max(
      0,
      squad.approachSpeedFactor * Math.pow(radialDistance, squad.approachExponent)
    );
    const previous = enemy.position.clone();
    enemy.position.addScaledVector(moveDir, Math.min(gap, approachSpeed * dt));
    enemy.velocity.copy(enemy.position).sub(previous).divideScalar(Math.max(dt, 1e-6));
    enemy.speed = enemy.velocity.length();
    enemy.boundPlanet = null;
    enemy.flightMode = 'free';

    const edgeUp = tempVecD.copy(squad.holdTangent);
    if (Math.abs(edgeUp.dot(moveDir)) > 0.85) {
      edgeUp.copy(squad.holdAxis);
    }
    edgeUp.sub(tempVecE.copy(moveDir).multiplyScalar(edgeUp.dot(moveDir))).normalize();
    enemy.up.copy(edgeUp);
    enemy.forward.copy(moveDir);
    enemy.relativePosition.copy(enemy.position).sub(planet.position);
    enemy.relativeVelocity.copy(enemy.velocity).sub(planet.velocity);
    for (const candidatePlanet of state.planets) {
      if (segmentIntersectsSphere(previous, enemy.position, candidatePlanet.position, candidatePlanet.radius)) {
        pushEvent(state, 'mothership-planet-cross', {
          mothershipSquadId: squad.id,
          mothershipId: enemy.id,
          planetIndex: state.planets.indexOf(candidatePlanet),
          planetName: candidatePlanet.name,
          previousPosition: {
            x: previous.x,
            y: previous.y,
            z: previous.z
          },
          currentPosition: {
            x: enemy.position.x,
            y: enemy.position.y,
            z: enemy.position.z
          },
          planetCenter: {
            x: candidatePlanet.position.x,
            y: candidatePlanet.position.y,
            z: candidatePlanet.position.z
          },
          planetRadius: candidatePlanet.radius
        });
        destroyEnemy(state, enemy, 'crash', enemy.position.clone());
        return;
      }
    }
    return;
  }

  if (squad.mode === 'hold') {
    const alpha = squad.holdAngle;
    const beta = THREE.MathUtils.clamp(squad.holdBeta, -Math.PI * 0.42, Math.PI * 0.42);
    if (beta !== squad.holdBeta) {
      squad.holdBeta = beta;
      squad.holdBetaSpeed *= -1;
    }
    const sinBeta = Math.sin(beta);
    const rotatedRadial = tempVecC.copy(squad.holdRadial).multiplyScalar(Math.cos(beta))
      .addScaledVector(squad.holdTangent, Math.cos(alpha) * sinBeta)
      .addScaledVector(squad.holdAxis, Math.sin(alpha) * sinBeta)
      .normalize();
    const reorientT = Math.min(
      0.999,
      smoothstep(0, Math.max(0.0001, squad.holdReorientDuration), squad.holdReorientTimer)
    );
    const currentUp = tempVecD.copy(squad.holdEntryUp).lerp(rotatedRadial, reorientT).normalize();
    const currentForward = tempVecE.copy(squad.holdAxis).cross(currentUp);
    if (currentForward.lengthSq() < 1e-6) {
      currentForward.copy(squad.holdTangent);
    }
    currentForward.normalize();
    const previous = enemy.position.clone();
    enemy.position.copy(planet.position).addScaledVector(rotatedRadial, holdRadius);
    enemy.velocity.copy(enemy.position).sub(previous).divideScalar(Math.max(dt, 1e-6));
    enemy.speed = enemy.velocity.length();
    enemy.boundPlanet = planet;
    enemy.flightMode = 'bound';
    enemy.up.copy(currentUp);
    enemy.forward.copy(currentForward);
    enemy.relativePosition.copy(enemy.position).sub(planet.position);
    enemy.relativeVelocity.copy(enemy.velocity).sub(planet.velocity);
    for (const candidatePlanet of state.planets) {
      if (segmentIntersectsSphere(previousPosition, enemy.position, candidatePlanet.position, candidatePlanet.radius)) {
        pushEvent(state, 'mothership-planet-cross', {
          mothershipSquadId: squad.id,
          mothershipId: enemy.id,
          planetIndex: state.planets.indexOf(candidatePlanet),
          planetName: candidatePlanet.name,
          previousPosition: {
            x: previousPosition.x,
            y: previousPosition.y,
            z: previousPosition.z
          },
          currentPosition: {
            x: enemy.position.x,
            y: enemy.position.y,
            z: enemy.position.z
          },
          planetCenter: {
            x: candidatePlanet.position.x,
            y: candidatePlanet.position.y,
            z: candidatePlanet.position.z
          },
          planetRadius: candidatePlanet.radius
        });
        destroyEnemy(state, enemy, 'crash', enemy.position.clone());
        return;
      }
    }
    if (!squad.holdReoriented && squad.holdReorientTimer >= squad.holdReorientDuration - 1e-6) {
      squad.holdReoriented = true;
      squad.holdEntryUp.copy(rotatedRadial);
      pushEvent(state, 'mothership-reoriented', {
        mothershipSquadId: squad.id,
        mothershipId: enemy.id,
        planetIndex: squad.targetPlanetIndex,
        position: {
          x: enemy.position.x,
          y: enemy.position.y,
          z: enemy.position.z
        }
      });
    }
    squad.holdAngle += dt * squad.holdAngularSpeed;
    squad.holdBeta += dt * squad.holdBetaSpeed;
    squad.holdReorientTimer = Math.min(
      squad.holdReorientDuration,
      squad.holdReorientTimer + dt
    );
    return;
  }

  if (squad.mode === 'exit') {
    const exitDirection = tempVecC.copy(squad.mothershipExitDirection || squad.holdRadial || radial);
    if (exitDirection.lengthSq() < 1e-6) {
      exitDirection.copy(enemy.position).sub(planet.position);
    }
    exitDirection.normalize();
    const previous = enemy.position.clone();
    const radialDistance = Math.max(enemy.position.distanceTo(planet.position), 1);
    const travelDistance = computeEnemyTravelDistance(state, planet, enemy, squad);
    const exitSpeed = Math.max(
      squad.exitSpeedFactor * Math.pow(travelDistance, squad.approachExponent)
    );
    enemy.position.addScaledVector(exitDirection, exitSpeed * dt);
    enemy.velocity.copy(enemy.position).sub(previous).divideScalar(Math.max(dt, 1e-6));
    enemy.speed = enemy.velocity.length();
    enemy.boundPlanet = null;
    enemy.flightMode = 'free';
    enemy.up.copy(exitDirection);
    enemy.forward.copy(exitDirection);
    enemy.relativePosition.copy(enemy.position).sub(planet.position);
    enemy.relativeVelocity.copy(enemy.velocity).sub(planet.velocity);
    for (const candidatePlanet of state.planets) {
      if (segmentIntersectsSphere(previousPosition, enemy.position, candidatePlanet.position, candidatePlanet.radius)) {
        pushEvent(state, 'mothership-planet-cross', {
          mothershipSquadId: squad.id,
          mothershipId: enemy.id,
          planetIndex: state.planets.indexOf(candidatePlanet),
          planetName: candidatePlanet.name,
          previousPosition: {
            x: previousPosition.x,
            y: previousPosition.y,
            z: previousPosition.z
          },
          currentPosition: {
            x: enemy.position.x,
            y: enemy.position.y,
            z: enemy.position.z
          },
          planetCenter: {
            x: candidatePlanet.position.x,
            y: candidatePlanet.position.y,
            z: candidatePlanet.position.z
          },
          planetRadius: candidatePlanet.radius
        });
        destroyEnemy(state, enemy, 'crash', enemy.position.clone());
        return;
      }
    }
  }
}

function updateMothershipSquads(state, dt, time) {
  state.mothershipSpawnTimer = Math.max(0, state.mothershipSpawnTimer - dt);
  while (
    state.mothershipSpawnTimer <= 0
    && state.planets.length > 0
    && state.mothershipSquads.length < config.mothershipMaxCount
  ) {
    spawnMothershipSquad(state, pickEnemySpawnPlanetIndex(state));
  }
  if (state.mothershipSpawnTimer <= 0) {
    const rng = getMothershipRng(state);
    state.mothershipSpawnTimer = config.mothershipSpawnDelayMin + rng() * (config.mothershipSpawnDelayMax - config.mothershipSpawnDelayMin);
  }

  const aliveMotherships = [];
  for (const squad of state.mothershipSquads) {
    const mothership = state.enemies.find((enemy) => enemy.squadId === squad.id && enemy.health > 0 && enemy.kind === 'mothership');
    if (!mothership) {
      continue;
    }

    const planet = getEnemyTargetPlanet(state, { targetPlanetIndex: squad.targetPlanetIndex });
    if (!planet) {
      aliveMotherships.push(squad);
      continue;
    }

    updateMothershipEnemy(state, mothership, squad, planet, dt);

    const activeFighterSquads = state.enemySquads.filter((enemySquad) => (
      enemySquad.parentMothershipId === squad.id
      && state.enemies.some((enemy) => enemy.squadId === enemySquad.id && enemy.health > 0)
    ));
    squad.fightersAlive = activeFighterSquads.length;

    if (squad.mode === 'hold') {
      squad.fighterReleaseCooldown = Math.max(0, squad.fighterReleaseCooldown - dt);
      if (squad.fightersReleased < squad.fightersTotal && squad.fighterReleaseCooldown <= 0) {
        const fighterSquad = spawnFighterSquadFromMothership(state, squad, mothership);
        if (fighterSquad) {
          squad.fightersReleased += 1;
          squad.fighterReleaseCooldown = config.mothershipFighterReleaseInterval;
        }
      }

      if (squad.fightersReleased >= squad.fightersTotal && activeFighterSquads.length === 0) {
        squad.mode = 'exit';
      }
    }

    if (squad.mode === 'exit') {
      const exitDistance = mothership.position.distanceTo(planet.position) - planet.radius;
      if (exitDistance > squad.holdExitDistance) {
        removeEnemySilently(state, mothership);
        continue;
      }
    }

    aliveMotherships.push(squad);
  }

  state.mothershipSquads = aliveMotherships;
  state.mothershipSquad = state.mothershipSquads[state.mothershipSquads.length - 1] || null;
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
    respawnShip(state);
    state.loaded = true;
    return state;
  }

  const stepSystems = {
    updateWorld: updatePlanets,
    updatePlayer: (currentState, deltaTime, controls) => {
      updatePlayerShipState(currentState, deltaTime, controls, { spawnEnemyExplosion });
    },
    updateEncounters: updateEncounterDirector,
    updateEnemies: updateEnemySquads,
    updateMotherships: updateMothershipSquads,
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
    createEncounter: (options = {}) => createEncounterState(state, options),
    createEncounterEntity: (options = {}) => createEncounterEntityState(state, options),
    forceEnemyPresentation: (enemyId, kind, options = {}) => {
      const enemy = state.enemies.find((candidate) => candidate.id === enemyId);
      if (!enemy) {
        return false;
      }
      let encounter = options.encounterId != null ? getEncounterById(state, options.encounterId) : getEncounterById(state, enemy.encounterId);
      if (!encounter) {
        const planetIndex = Math.max(0, enemy.targetPlanetIndex ?? 0);
        encounter = createEncounterState(state, {
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
    damageEncounterEntity: (entityId, damage) => {
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
  };
}
