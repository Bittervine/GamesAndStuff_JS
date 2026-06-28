/*
 * Mothership lifecycle subsystem.
 *
 * Owns deterministic mothership spawning, approach, hold reorientation,
 * fighter release, exit, and mothership-specific squad construction. Generic
 * enemy damage and flight helpers are supplied through the small services
 * object passed by the compatibility facade.
 */
import * as THREE from '../lib/three.module.js';
import { config } from '../orbitals_config.js';
import {
  ENEMY_FAMILIES,
  getEnemyFamilyFiles
} from './enemies.js';
import { pushEvent } from './events.js';
import {
  ensurePlanetInvasionEncounterForMothership,
  registerEncounterEnemyReleased
} from './encounters.js';
import {
  WORLD_UP as worldUp,
  buildBasisFromNormal,
  mulberry32,
  smoothstep
} from './math.js';
import {
  createEnemyState,
  ENEMY_HIT_RADIUS
} from './state.js';
import { segmentIntersectsSphere } from './projectiles.js';
import { pickRandomPlanetIndex } from './world.js';

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


function pickEnemyFamily(state, excludedFamilies = [], rng = state.rng) {
  const allowedFamilies = ENEMY_FAMILIES.filter((family) => !excludedFamilies.includes(family));
  const pool = allowedFamilies.length > 0 ? allowedFamilies : ENEMY_FAMILIES;
  return pool[Math.floor(rng() * pool.length)];
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

function createEnemyWave(state, squad, options = {}, services = {}) {
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
  const enemyVisualScale = options.visualScale ?? config.enemyVisualScale;
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
    enemy.fireCooldown = config.enemyFireInitialCooldownMin + rng() * (config.enemyFireInitialCooldownMax - config.enemyFireInitialCooldownMin);
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
    const spawnPlanet = services.getEnemyTargetPlanet(state, enemy);
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

export function spawnFighterSquadFromMothership(state, mothershipSquad, mothershipEnemy, services = {}) {
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
    visualScale: config.enemyVisualScale,
    rng
  }, services);
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
    const launchSpeed = services.computeEnemyControlTargetSpeed(state, planet, fighter, squad) * 1.1;

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

export function spawnMothershipSquad(state, targetPlanetIndex = -1, services = {}, options = {}) {
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
  const spawnCenter = options.spawnAtArrival ? holdPoint.clone() : outwardSpawn;
  const spawnSide = 1;
  const travelDirection = tempVecC.copy(holdPoint).sub(outwardSpawn).normalize();
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
  }, services);

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
      spawnDistance: mothership.position.distanceTo(planet.position),
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

export function updateMothershipEnemy(state, enemy, squad, planet, dt, services = {}) {
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
        services.destroyEnemy(state, enemy, 'crash', enemy.position.clone());
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
        services.destroyEnemy(state, enemy, 'crash', enemy.position.clone());
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
    const travelDistance = services.computeEnemyTravelDistance(state, planet, enemy, squad);
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
        services.destroyEnemy(state, enemy, 'crash', enemy.position.clone());
        return;
      }
    }
  }
}

export function updateMothershipSquads(state, dt, time, services = {}) {
  state.mothershipSpawnTimer = Math.max(0, state.mothershipSpawnTimer - dt);
  while (
    state.mothershipSpawnTimer <= 0
    && state.planets.length > 0
    && state.mothershipSquads.length < config.mothershipMaxCount
  ) {
    spawnMothershipSquad(state, pickEnemySpawnPlanetIndex(state), services);
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

    const planet = services.getEnemyTargetPlanet(state, { targetPlanetIndex: squad.targetPlanetIndex });
    if (!planet) {
      aliveMotherships.push(squad);
      continue;
    }

    updateMothershipEnemy(state, mothership, squad, planet, dt, services);

    const activeFighterSquads = state.enemySquads.filter((enemySquad) => (
      enemySquad.parentMothershipId === squad.id
      && state.enemies.some((enemy) => enemy.squadId === enemySquad.id && enemy.health > 0)
    ));
    squad.fightersAlive = activeFighterSquads.length;

    if (squad.mode === 'hold') {
      squad.fighterReleaseCooldown = Math.max(0, squad.fighterReleaseCooldown - dt);
      if (squad.fightersReleased < squad.fightersTotal && squad.fighterReleaseCooldown <= 0) {
        const fighterSquad = spawnFighterSquadFromMothership(state, squad, mothership, services);
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
        services.removeEnemySilently(state, mothership);
        continue;
      }
    }

    aliveMotherships.push(squad);
  }

  state.mothershipSquads = aliveMotherships;
  state.mothershipSquad = state.mothershipSquads[state.mothershipSquads.length - 1] || null;
}
