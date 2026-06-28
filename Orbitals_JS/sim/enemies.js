import { updateFlightState } from './physics.js';
import {
  crashPlayerShip,
  crashPlayerShipIntoSun,
  respawnShip
} from './player.js';
import * as THREE from '../lib/three.module.js';
import { config } from '../orbitals_config.js';
import { pushEvent } from './events.js';
import { spawnEnemyExplosion } from './effects.js';
import { maybeDropPickupFromEnemy } from './pickups.js';
import {
  segmentIntersectsSphere,
  spawnEnemyProjectile
} from './projectiles.js';
import {
  getEncounterAnchorPosition,
  getEncounterById,
  getEncounterProtectedEntity,
  registerEncounterEnemyDestroyed
} from './encounters.js';
import {
  pickRandomPlanetIndex
} from './world.js';
import {
  buildBasisFromNormal,
  easeExp,
  smoothstep
} from './math.js';
import {
  beginPlanetCapture,
  computeAtmosphereLiftState
} from './physics.js';
import {
  createSpatialHash,
  querySpatialHash
} from './spatial_hash.js';

export const ENEMY_MODEL_FILES_BY_FAMILY = {
  Standard: [
    'Ship_Standard_1.glb',
    'Ship_Standard_10.glb',
    'Ship_Standard_11.glb',
    'Ship_Standard_12.glb',
    'Ship_Standard_13.glb',
    'Ship_Standard_14.glb',
    'Ship_Standard_17.glb',
    'Ship_Standard_2.glb',
    'Ship_Standard_20.glb',
    'Ship_Standard_3.glb',
    'Ship_Standard_5.glb',
    'Ship_Standard_6.glb',
    'Ship_Standard_7.glb',
    'Ship_Standard_8.glb',
    'Ship_Standard_9.glb'
  ],
  Crosspanel: [
    'Ship_Crosspanel_1.glb',
    'Ship_Crosspanel_10.glb',
    'Ship_Crosspanel_11.glb',
    'Ship_Crosspanel_16.glb',
    'Ship_Crosspanel_18.glb',
    'Ship_Crosspanel_2.glb',
    'Ship_Crosspanel_3.glb',
    'Ship_Crosspanel_4.glb',
    'Ship_Crosspanel_5.glb',
    'Ship_Crosspanel_6.glb',
    'Ship_Crosspanel_7.glb'
  ],
  FlyingSaucer: [
    'Ship_FlyingSaucer_298877.glb',
    'Ship_FlyingSaucer_301176.glb',
    'Ship_FlyingSaucer_336064.glb',
    'Ship_FlyingSaucer_528770.glb',
    'Ship_FlyingSaucer_654444.glb',
    'Ship_FlyingSaucer_750147.glb',
    'Ship_FlyingSaucer_752605.glb',
    'Ship_FlyingSaucer_772429.glb'
  ],
  DeltaWing: [
    'Ship_DeltaWing_108179.glb',
    'Ship_DeltaWing_368386.glb',
    'Ship_DeltaWing_394511.glb',
    'Ship_DeltaWing_535536.glb',
    'Ship_DeltaWing_691262.glb',
    'Ship_DeltaWing_853002.glb',
    'Ship_DeltaWing_894551.glb'
  ],
  Pirate: [
    'Ship_Pirate_1.glb',
    'Ship_Pirate_2.glb',
    'Ship_Pirate_3.glb',
    'Ship_Pirate_4.glb',
    'Ship_Pirate_5.glb',
    'Ship_Pirate_6.glb',
    'Ship_Pirate_7.glb'
  ],
  Orca: [
    'Ship_Orca_135963.glb',
    'Ship_Orca_29300.glb',
    'Ship_Orca_486148.glb',
    'Ship_Orca_492814.glb',
    'Ship_Orca_583214.glb',
    'Ship_Orca_652174.glb',
    'Ship_Orca_687341.glb'
  ],
  Longwing: [
    'Ship_Longwing_1.glb',
    'Ship_Longwing_2.glb',
    'Ship_Longwing_3.glb',
    'Ship_Longwing_4.glb',
    'Ship_Longwing_5.glb',
    'Ship_Longwing_6.glb',
    'Ship_Longwing_7.glb',
    'Ship_Longwing_8.glb'
  ],
  TwoHoop: [
    'Ship_TwoHoop_11695.glb',
    'Ship_TwoHoop_217137.glb',
    'Ship_TwoHoop_274249.glb',
    'Ship_TwoHoop_274461.glb',
    'Ship_TwoHoop_338598.glb',
    'Ship_TwoHoop_428113.glb',
    'Ship_TwoHoop_536191.glb'
  ],
  TigerWing: [
    'Ship_TigerWing_1.glb',
    'Ship_TigerWing_2.glb',
    'Ship_TigerWing_3.glb',
    'Ship_TigerWing_4.glb',
    'Ship_TigerWing_5.glb',
    'Ship_TigerWing_6.glb',
    'Ship_TigerWing_7.glb'
  ],
  LunarCourier: [
    'Ship_LunarCourier_153144.glb',
    'Ship_LunarCourier_322196.glb',
    'Ship_LunarCourier_5002.glb',
    'Ship_LunarCourier_7.glb',
    'Ship_LunarCourier_826239.glb',
    'Ship_LunarCourier_899475.glb',
    'Ship_LunarCourier_95901.glb',
    'Ship_LunarCourier_994899.glb'
  ],
  Hooper: [
    'Ship_Hooper_219385.glb',
    'Ship_Hooper_302864.glb',
    'Ship_Hooper_378031.glb',
    'Ship_Hooper_443110.glb',
    'Ship_Hooper_508807.glb',
    'Ship_Hooper_517819.glb',
    'Ship_Hooper_740839.glb',
    'Ship_Hooper_760830.glb'
  ],
  ManraRay: [
    'Ship_ManraRay_130405.glb',
    'Ship_ManraRay_16943.glb',
    'Ship_ManraRay_190663.glb',
    'Ship_ManraRay_459947.glb',
    'Ship_ManraRay_46262.glb',
    'Ship_ManraRay_766613.glb',
    'Ship_ManraRay_792763.glb',
    'Ship_ManraRay_858242.glb'
  ],
  PyramidLifter: [
    'Ship_PyramidLifter_290115.glb',
    'Ship_PyramidLifter_327178.glb',
    'Ship_PyramidLifter_390936.glb',
    'Ship_PyramidLifter_426685.glb',
    'Ship_PyramidLifter_478836.glb',
    'Ship_PyramidLifter_741828.glb',
    'Ship_PyramidLifter_97249.glb',
    'Ship_PyramidLifter_990348.glb'
  ],
  Nemesis: [
    'ship_nemesis2.glb'
  ]
};

export const ENEMY_FAMILIES = Object.keys(ENEMY_MODEL_FILES_BY_FAMILY);

export function getEnemyFamilyFiles(family) {
  return ENEMY_MODEL_FILES_BY_FAMILY[family] || ENEMY_MODEL_FILES_BY_FAMILY[ENEMY_FAMILIES[0]] || [];
}


const worldUp = new THREE.Vector3(0, 1, 0);
const tempVecA = new THREE.Vector3();
const tempVecB = new THREE.Vector3();
const tempVecC = new THREE.Vector3();
const tempVecD = new THREE.Vector3();
const tempVecE = new THREE.Vector3();
const tempVecF = new THREE.Vector3();
const tempVecG = new THREE.Vector3();

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

export function destroyEnemy(state, enemy, cause = 'projectile', impactPosition = null) {
  if (!enemy || enemy.destroyed) {
    return false;
  }

  registerEncounterEnemyDestroyed(state, enemy);

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
    maybeDropPickupFromEnemy(state, enemy, cause, impactPosition || enemy.position);
  }
  return true;
}

export function applyEnemyDamage(state, enemy, damage, cause = 'projectile', impactPosition = null) {
  if (!enemy || enemy.health <= 0) {
    return false;
  }
  enemy.health = Math.max(0, enemy.health - damage);
  if (enemy.health > 0) {
    return false;
  }
  return destroyEnemy(state, enemy, cause, impactPosition);
}

export function removeEnemySilently(state, enemy) {
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

export function getEnemyTargetPlanet(state, enemy) {
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

export function measureEnemyInPlayerFrame(state, enemy) {
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

function forEachNearbyEnemy(state, neighborHash, enemy, radius, visit) {
  if (neighborHash) {
    querySpatialHash(neighborHash, enemy.position, radius, (other) => {
      if (!other || other === enemy) {
        return true;
      }
      return visit(other);
    });
    return;
  }
  for (const other of state.enemies) {
    if (!other || other === enemy) {
      continue;
    }
    if (visit(other) === false) {
      return;
    }
  }
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

export function beginEnemyPresentation(state, enemy, encounter, kind, options = {}) {
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

function computeEnemyTargetPoint(state, enemy, squad, planet, time, neighborHash = null) {
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
  const fighterSeparationOffset = tempVecG.set(0, 0, 0);
  if (fighterPatrolMode) {
    const pushRadius = atmosphereThickness * 0.22;
    forEachNearbyEnemy(state, neighborHash, enemy, pushRadius, (other) => {
      if (other.health <= 0 || other.kind !== 'fighter' || other.parentMothershipId !== squad.parentMothershipId) {
        return true;
      }
      const delta = tempVecF.copy(enemy.position).sub(other.position);
      const distance = delta.length();
      if (distance < 1e-6 || distance >= pushRadius) {
        return true;
      }
      const push = (pushRadius - distance) / pushRadius;
      fighterSeparationOffset.add(delta.normalize().multiplyScalar(push * push * atmosphereThickness * 0.16));
      return true;
    });
  }

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

function enemyHasFireLineOfSight(state, enemy, target) {
  const margin = Math.max(0, config.enemyFireLineOfSightPlanetMargin);
  for (const planet of state.planets) {
    if (segmentIntersectsSphere(enemy.position, target.position, planet.position, planet.radius + margin)) {
      return false;
    }
  }
  return true;
}

function updateEnemyFire(state, enemy, dt) {
  enemy.fireCooldown = Math.max(0, (enemy.fireCooldown || 0) - dt);
  if (!config.enemyFireEnabled || enemy.kind === 'mothership' || enemy.fireCooldown > 0 || !state.ship || state.crashed) {
    return;
  }

  const toPlayer = tempVecA.copy(state.ship.position).sub(enemy.position);
  const distance = toPlayer.length();
  if (distance < config.enemyFireMinDistance || distance > config.enemyFireRange) {
    return;
  }

  const playerMetrics = measureEnemyInPlayerFrame(state, enemy);
  if (!playerMetrics
    || playerMetrics.forward < config.enemyFirePlayerForwardMin
    || playerMetrics.angleDeg > config.enemyFirePlayerViewAngleDeg) {
    return;
  }

  const direction = toPlayer.multiplyScalar(1 / Math.max(distance, 1e-8));
  const forward = enemy.forward && enemy.forward.lengthSq() > 1e-8
    ? tempVecB.copy(enemy.forward).normalize()
    : tempVecB.copy(direction);
  if (THREE.MathUtils.radToDeg(forward.angleTo(direction)) > config.enemyFireAngleDeg) {
    return;
  }
  if (!enemyHasFireLineOfSight(state, enemy, state.ship)) {
    return;
  }

  const projectile = spawnEnemyProjectile(state, enemy, state.ship);
  if (!projectile) {
    return;
  }

  const cooldownMin = Math.max(0, config.enemyFireCooldownMin);
  const cooldownMax = Math.max(cooldownMin, config.enemyFireCooldownMax);
  enemy.fireCooldown = cooldownMin + state.rng() * (cooldownMax - cooldownMin);
  pushEvent(state, 'enemy-fire', {
    enemyId: enemy.id,
    squadId: enemy.squadId,
    projectileId: projectile.id,
    distanceToPlayer: distance
  });
}

export function computeEnemyTravelDistance(state, targetPlanet, enemy, squad) {
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

export function computeEnemyControlTargetSpeed(state, targetPlanet, enemy, squad) {
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


function computeEnemyControlInputs(state, enemy, squad, targetPlanet, time, dt, neighborHash = null) {
  const rawTargetPoint = computeEnemyTargetPoint(state, enemy, squad, targetPlanet, time, neighborHash);
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
    forEachNearbyEnemy(state, neighborHash, enemy, avoidRadius, (other) => {
      if (other.health <= 0 || other.kind !== 'fighter' || other.parentMothershipId !== squad.parentMothershipId) {
        return true;
      }
      const offset = tempVecG.copy(enemy.position).sub(other.position);
      const distance = offset.length();
      if (distance < 1e-6 || distance >= avoidRadius) {
        return true;
      }
      const away = offset.multiplyScalar(1 / distance);
      const closeness = 1 - distance / avoidRadius;
      avoidanceTurn += away.dot(rightAxis) * closeness * 0.95;
      avoidancePitch += away.dot(radialUp) * closeness * 0.65;
      return true;
    });
    rawTurnInput += THREE.MathUtils.clamp(avoidanceTurn, -0.85, 0.85);
    rawPitchInput += THREE.MathUtils.clamp(avoidancePitch, -0.6, 0.6);
    if (currentAltitude < patrolAltitudeMin || currentAltitude > patrolAltitudeMax) {
      rawPitchInput = THREE.MathUtils.clamp(
        rawPitchInput + THREE.MathUtils.clamp((desiredSwarmAltitude - currentAltitude) / Math.max(atmosphereThickness * 0.22, 1), -1, 1) * 0.55,
        -0.9,
        0.9
      );
    }
    forEachNearbyEnemy(state, neighborHash, enemy, hardSeparationRadius, (other) => {
      if (other.health <= 0 || other.kind !== 'fighter' || other.parentMothershipId !== squad.parentMothershipId) {
        return true;
      }
      const delta = tempVecD.copy(enemy.position).sub(other.position);
      const distance = delta.length();
      if (distance < 1e-6 || distance >= hardSeparationRadius) {
        return true;
      }
      const push = (hardSeparationRadius - distance) / hardSeparationRadius;
      const away = delta.multiplyScalar(1 / distance);
      rawTurnInput += THREE.MathUtils.clamp(away.dot(rightAxis) * push * 1.2, -0.9, 0.9);
      rawPitchInput += THREE.MathUtils.clamp(away.dot(radialUp) * push * 0.9, -0.7, 0.7);
      return true;
    });
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
    const collisionCourseRadius = atmosphereThickness * 0.85;
    forEachNearbyEnemy(state, neighborHash, enemy, collisionCourseRadius, (other) => {
      if (other.health <= 0) {
        return true;
      }
      const offset = tempVecG.copy(other.position).sub(enemy.position);
      const distance = offset.length();
      if (distance < 1e-6 || distance > collisionCourseRadius) {
        return true;
      }
      const forwardDot = offset.dot(desiredForward);
      if (forwardDot <= 0) {
        return true;
      }
      const coneAngle = Math.atan2(Math.sqrt(Math.max(0, distance * distance - forwardDot * forwardDot)), forwardDot);
      if (coneAngle > 0.9) {
        return true;
      }
      const side = offset.dot(rightAxis);
      if (side >= 0) {
        return true;
      }
      const closeness = 1 - distance / collisionCourseRadius;
      collisionCourseTurn += closeness * (1.4 + Math.abs(side) / Math.max(distance, 1)) * 2.0;
      return true;
    });
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

function updateEnemyShip(state, enemy, squad, dt, time, neighborHash = null) {
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

  const controls = computeEnemyControlInputs(state, enemy, squad, targetPlanet, time, dt, neighborHash);

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

  updateEnemyFire(state, enemy, dt);

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

export function updateEnemySquads(state, dt, time) {
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

    const targetAtmosphereThickness = Math.max(targetPlanet.atmosphereRadius - targetPlanet.radius, 1.0);
    const isMothershipFighterSquad = squad.parentMothershipId >= 0 && squad.kind === 'fighter';
    const neighborHash = isMothershipFighterSquad && squad.mode === 'swarm'
      ? createSpatialHash(
        state.enemies.filter((enemy) => enemy && enemy.health > 0),
        targetAtmosphereThickness * Math.max(0.85, config.fighterPatrolHardSeparationFactor || 0.42)
      )
      : null;

    let sumAltitude = 0;
    for (const enemy of squadEnemies) {
      sumAltitude += enemy.position.distanceTo(targetPlanet.position) - targetPlanet.radius;
    }
    const avgAltitude = sumAltitude / squadEnemies.length;

    if (isMothershipFighterSquad && squad.mode === 'approach') {
      const atmosphereThickness = targetAtmosphereThickness;
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
      updateEnemyShip(state, enemy, squad, dt, time, neighborHash);
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


export function updateEnemyShipState(state, dt, controls) {
  return updateFlightState(state, dt, controls, {
    respawnShip,
    crashPlayerShip,
    crashPlayerShipIntoSun,
    spawnEnemyExplosion
  });
}
