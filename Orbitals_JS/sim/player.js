import * as THREE from '../lib/three.module.js';
import { config } from '../orbitals_config.js';
import { WORLD_UP as worldUp, clamp01, smoothstep, easeExp } from './math.js';
import {
  computeAtmosphereLiftState,
  computeFreeGravityPull,
  pickNearestPlanet
} from './world.js';
import { spawnProjectileBurst } from './projectiles.js';

const tempVecA = new THREE.Vector3();
const tempVecB = new THREE.Vector3();
const tempVecC = new THREE.Vector3();
const tempVecD = new THREE.Vector3();
const tempVecE = new THREE.Vector3();
const tempVecF = new THREE.Vector3();
const tempVecG = new THREE.Vector3();
const tempVecH = new THREE.Vector3();

export function clampShipSpeed(speed) {
  return THREE.MathUtils.clamp(speed, 0, config.shipMaxMaxSpeed);
}

export function syncShipWorldState(ship) {
  if (!ship || !ship.boundPlanet) {
    return;
  }
  ship.position.copy(ship.boundPlanet.position).add(ship.relativePosition);
  ship.velocity.copy(ship.boundPlanet.velocity).add(ship.relativeVelocity);
}

export function transferShipToPlanet(ship, nextPlanet) {
  if (!ship || !nextPlanet) {
    return;
  }
  syncShipWorldState(ship);
  ship.boundPlanet = nextPlanet;
  ship.flightMode = 'bound';
  ship.relativePosition.copy(ship.position).sub(nextPlanet.position);
  ship.relativeVelocity.copy(ship.velocity).sub(nextPlanet.velocity);
}

export function beginPlanetCapture(ship, capturePlanet) {
  if (!ship || !capturePlanet) {
    return;
  }
  transferShipToPlanet(ship, capturePlanet);
  ship.captureTimer = ship.kind === 'player'
    ? 0
    : config.shipCaptureBlendTime;
  ship.recaptureLock = 0;
}

export function vectorLikeTo(target, value, fallback) {
  if (value && typeof value.x === 'number' && typeof value.y === 'number' && typeof value.z === 'number') {
    return target.set(value.x, value.y, value.z);
  }
  return target.copy(fallback);
}

export function respawnShip(state) {
  if (!state.ship || state.planets.length === 0) {
    return null;
  }
  state.crashed = false;
  state.fuel = state.maxFuel;
  state.projectiles.length = 0;
  const planet = state.planets[state.respawnPlanetIndex % state.planets.length];
  const normal = planet.position.lengthSq() > 1e-6 ? planet.position.clone().normalize() : new THREE.Vector3(0, 1, 0);
  const tangent = Math.abs(normal.dot(worldUp)) > 0.85
    ? new THREE.Vector3(1, 0, 0).cross(normal).normalize()
    : worldUp.clone().cross(normal).normalize();
  const side = normal.clone().cross(tangent).normalize();
  const atmosphereThickness = Math.max(planet.atmosphereRadius - planet.radius, 0.0001);
  const spawnAltitude = atmosphereThickness * 0.5;
  const desiredRadius = planet.radius + spawnAltitude;
  const surfaceSpeed = Math.sqrt(Math.max(planet.gravityStrength / Math.max(desiredRadius, 1.0), 4.0));
  const cruiseSpeed = surfaceSpeed * 0.12;
  const flightSpeed = clampShipSpeed(cruiseSpeed * (0.92 + state.rng() * 0.08));
  const spawnOffset = normal.clone().multiplyScalar(desiredRadius)
    .addScaledVector(side, -1.0 + state.rng() * 2.0);
  state.ship.boundPlanet = planet;
  state.ship.relativePosition.copy(spawnOffset);
  state.ship.relativeVelocity.copy(tangent).multiplyScalar(flightSpeed);
  syncShipWorldState(state.ship);
  state.ship.forward.copy(tangent).normalize();
  state.ship.up.copy(normal).normalize();
  state.ship.bank = 0;
  state.ship.boostTimer = 0;
  state.ship.fireCooldown = 0;
  state.ship.pitchIdleTime = 0;
  state.ship.recaptureLock = 0;
  state.ship.captureTimer = config.shipCaptureBlendTime;
  state.ship.flightMode = 'bound';
  state.ship.muzzleOffset = config.shipMuzzleOffset;
  state.ship.speed = flightSpeed;
  state.nearestPlanet = planet;
  state.nearestDistance = state.ship.position.distanceTo(planet.position);
  state.nearestAltitude = state.nearestDistance - planet.radius;
  state.speed = state.ship.relativeVelocity.length();
  return planet;
}

export function crashPlayerShip(state, planet, crashNormal, impactPosition = null, options = {}) {
  const ship = state.ship;
  if (!ship || state.crashed) {
    return;
  }

  const spawnEnemyExplosion = typeof options.spawnEnemyExplosion === 'function' ? options.spawnEnemyExplosion : () => {};
  const safeNormal = crashNormal && crashNormal.lengthSq && crashNormal.lengthSq() > 1e-8
    ? tempVecA.copy(crashNormal).normalize()
    : tempVecA.copy(ship.position).sub(planet.position).normalize();
  const crashAltitude = Math.max(0.25, config.atmosphereTerrainCrashAltitude);
  state.crashed = true;
  state.crashTimer = 0;
  state.crashRespawnReady = false;
  state.speed = 0;
  ship.speed = 0;
  ship.boostTimer = 0;
  ship.fireCooldown = 0;
  ship.relativeVelocity.set(0, 0, 0);
  ship.velocity.copy(planet.velocity);
  ship.relativePosition.copy(safeNormal).multiplyScalar(planet.radius + crashAltitude);
  ship.position.copy(planet.position).add(ship.relativePosition);
  ship.up.copy(safeNormal);
  ship.forward.addScaledVector(safeNormal, -ship.forward.dot(safeNormal));
  if (ship.forward.lengthSq() < 1e-6) {
    ship.forward.copy(Math.abs(safeNormal.dot(worldUp)) > 0.92
      ? tempVecB.set(1, 0, 0).cross(safeNormal).normalize()
      : tempVecB.copy(worldUp).cross(safeNormal).normalize());
  }
  ship.forward.normalize();
  state.projectiles.length = 0;
  spawnEnemyExplosion(state, impactPosition || ship.position, 'crash');
}

export function crashPlayerShipIntoSun(state, impactPosition = null, options = {}) {
  const ship = state.ship;
  if (!ship || state.crashed) {
    return;
  }
  const spawnEnemyExplosion = typeof options.spawnEnemyExplosion === 'function' ? options.spawnEnemyExplosion : () => {};
  state.crashed = true;
  state.crashTimer = 0;
  state.crashRespawnReady = false;
  state.speed = 0;
  ship.speed = 0;
  ship.boostTimer = 0;
  ship.fireCooldown = 0;
  ship.relativeVelocity.set(0, 0, 0);
  ship.velocity.set(0, 0, 0);
  ship.position.copy(impactPosition || ship.position);
  ship.relativePosition.copy(ship.position);
  spawnEnemyExplosion(state, impactPosition || ship.position, 'crash');
}

export function updateShipState(state, dt, controls, options = {}) {
  const ship = state.ship;
  if (!ship) {
    return;
  }

  const isPlayerState = Array.isArray(state.enemies) && Array.isArray(state.enemySquads);
  if (isPlayerState && state.crashed) {
    state.crashTimer = (state.crashTimer || 0) + dt;
    const canRespawnAfterCrash = state.crashTimer >= config.crashRespawnDelay;
    if (controls.respawn && canRespawnAfterCrash) {
      if (!state.gamepadRespawnHeld) {
        state.gamepadRespawnHeld = true;
        respawnShip(state);
      }
    } else {
      state.gamepadRespawnHeld = Boolean(controls.respawn);
    }
    return;
  }

  syncShipWorldState(ship);
  let nearestInfo = pickNearestPlanet(state.planets, ship.position);
  state.nearestPlanet = nearestInfo.nearest;
  state.nearestDistance = nearestInfo.nearestDistance;
  state.nearestAltitude = nearestInfo.nearest ? Math.max(0, nearestInfo.nearestDistance - nearestInfo.nearest.radius) : 0;

  if (controls.respawn) {
    if (!state.gamepadRespawnHeld) {
      state.gamepadRespawnHeld = true;
      respawnShip(state);
    }
    return;
  }
  state.gamepadRespawnHeld = false;
  ship.recaptureLock = Math.max(0, ship.recaptureLock - dt);
  if (ship.recaptureLock < 1e-6) {
    ship.recaptureLock = 0;
  }
  if (ship.flightMode === 'bound' && ship.captureTimer < config.shipCaptureBlendTime) {
    ship.captureTimer = Math.min(config.shipCaptureBlendTime, ship.captureTimer + dt);
  }

  if (ship.flightMode === 'bound' && ship.boundPlanet && state.nearestAltitude > config.planetEscapeAltitude) {
    ship.boundPlanet = null;
    ship.flightMode = 'free';
    ship.recaptureLock = config.shipRecaptureDelay;
  }

  if (ship.flightMode === 'free' && ship.recaptureLock <= 1e-6 && nearestInfo.nearest && state.nearestAltitude < config.planetCaptureAltitude) {
    const capturePlanet = nearestInfo.nearest;
    beginPlanetCapture(ship, capturePlanet);
    nearestInfo = pickNearestPlanet(state.planets, ship.position);
    state.nearestPlanet = nearestInfo.nearest;
    state.nearestDistance = nearestInfo.nearestDistance;
    state.nearestAltitude = nearestInfo.nearest ? Math.max(0, nearestInfo.nearestDistance - nearestInfo.nearest.radius) : 0;
  }

  const planet = ship.flightMode === 'bound' ? ship.boundPlanet || state.nearestPlanet : ship.boundPlanet || state.nearestPlanet;
  if (!planet && ship.flightMode === 'bound') {
    return;
  }

  const relativePosition = ship.relativePosition;
  const relativeVelocity = ship.relativeVelocity;
  if (ship.flightMode === 'free' && planet) {
    relativePosition.copy(ship.position).sub(planet.position);
    relativeVelocity.copy(ship.velocity).sub(planet.velocity);
  }
  const relativeDistance = Math.max(0.0001, relativePosition.length());
  const outward = tempVecA.copy(relativePosition).divideScalar(relativeDistance);
  const localUp = outward.clone();
  const gravityDir = tempVecB.copy(outward).multiplyScalar(-1);
  const gravityDistSq = Math.max(relativeDistance * relativeDistance, config.gravitySoftening * config.gravitySoftening);
  const gravityStrength = planet.gravityStrength / gravityDistSq;
  const atmosphereThickness = Math.max(planet.atmosphereRadius - planet.radius, 0.0001);
  const altitude = relativeDistance - planet.radius;
  const atmosphereRatio = clamp01(altitude / atmosphereThickness);
  const atmosphereDensityCurve = Math.max(0.25, config.atmosphereDensityCurve);
  const atmosphereDensity = altitude <= atmosphereThickness
    ? Math.pow(1 - smoothstep(0, 1, atmosphereRatio), atmosphereDensityCurve)
    : 0;
  const atmosphereDepth = atmosphereDensity;
  const turnInput = THREE.MathUtils.clamp(controls.turnInput ?? 0, -1, 1);
  const pitchInput = THREE.MathUtils.clamp(controls.pitchInput ?? 0, -1, 1);
  const mouseIdle = Boolean(controls.mouseIdle);
  const boostActive = Boolean(controls.boost);
  const fireActive = Boolean(controls.fire);
  const brakeActive = Boolean(controls.brake);
  const currentSpeed = Math.max(ship.speed || relativeVelocity.length(), 0.0001);
  const surfaceSpeed = Math.sqrt(Math.max(planet.gravityStrength / Math.max(relativeDistance, 1.0), 1.0));
  const cruiseSpeed = surfaceSpeed * THREE.MathUtils.lerp(0.09, 0.14, atmosphereDepth);
  if (boostActive && state.fuel > 0) {
    ship.boostTimer = config.shipBoostDuration;
  } else {
    ship.boostTimer = Math.max(0, ship.boostTimer - dt);
  }
  const boostLevel = config.shipBoostDuration > 0
    ? clamp01(ship.boostTimer / config.shipBoostDuration) * (state.fuel > 0 ? 1 : 0)
    : 0;
  const atmosphericFlightActive = ship.flightMode === 'bound' && atmosphereDepth > 0 && (!isPlayerState || boostLevel <= 0);
  const captureBlend = ship.captureTimer >= config.shipCaptureBlendTime
    ? 1
    : smoothstep(0, Math.max(config.shipCaptureBlendTime, 0.0001), ship.captureTimer);
  const targetAltitudeFactor = ship.atmosphericCruiseAltitudeFactor ?? config.atmosphereCruiseAltitudeFactor;
  const targetAltitude = atmosphereThickness * targetAltitudeFactor;
  const altitudeError = THREE.MathUtils.clamp((targetAltitude - altitude) / (atmosphereThickness * 0.5), -1, 1);
  const approachResponse = THREE.MathUtils.lerp(1, config.atmosphereApproachResponse, atmosphereDepth);
  const gravityPull = atmosphericFlightActive
    ? tempVecG.copy(gravityDir).normalize().multiplyScalar(gravityStrength)
    : computeFreeGravityPull(state, ship);
  ship.gravity.copy(gravityPull);

  const liftState = computeAtmosphereLiftState(planet, altitude, currentSpeed, cruiseSpeed, boostLevel);
  const autopilotStrength = 1 - boostLevel * 0.75;
  const projectedDescentSpeed = Math.max(0, -ship.forward.dot(localUp) * currentSpeed);
  const descentRatio = projectedDescentSpeed / Math.max(currentSpeed, 0.0001);
  const terrainGuardStartAltitude = Math.max(
    atmosphereThickness * config.atmosphereTerrainGuardStartRatio,
    projectedDescentSpeed * config.atmosphereTerrainLookaheadTime,
    config.atmosphereTerrainGuardMinAltitude
  );
  const terrainGuardFullAltitude = Math.max(
    atmosphereThickness * config.atmosphereTerrainGuardFullRatio,
    config.atmosphereTerrainGuardMinAltitude
  );
  const terrainAltitudeGuardBlend = smoothstep(terrainGuardStartAltitude, terrainGuardFullAltitude, altitude);
  const timeToTerrain = projectedDescentSpeed > 0.001 ? altitude / projectedDescentSpeed : Infinity;
  const terrainTimeGuardBlend = smoothstep(
    config.atmosphereTerrainLookaheadTime,
    config.atmosphereTerrainLookaheadFullTime,
    timeToTerrain
  );
  const terrainDescentSignal = smoothstep(0.01, 0.08, descentRatio);
  const terrainAltitudePressure = terrainAltitudeGuardBlend * THREE.MathUtils.lerp(0.35, 1.0, terrainDescentSignal);
  const terrainEmergencyBlend = atmosphericFlightActive
    ? Math.max(terrainAltitudePressure, terrainTimeGuardBlend) * THREE.MathUtils.lerp(1.0, 0.45, boostLevel)
    : 0;
  ship.fireCooldown = Math.max(0, ship.fireCooldown - dt);
  const altitudeSpeedCap = atmosphericFlightActive
    ? Math.max(
      config.shipMinMaxSpeed,
      state.nearestAltitude * config.shipAltMaxSpeedFac
    )
    : Infinity;
  const shipSpeedCap = Math.min(altitudeSpeedCap, config.shipMaxMaxSpeed);
  const brakeHalfLife = Math.max(0.1, config.freeBrakeHalfLife);
  const brakeFactor = brakeActive ? Math.pow(0.5, dt / brakeHalfLife) : 1;

  const turnSpeedScale = Math.max(0.1, config.shipTurnSpeedScale);
  const targetBank = THREE.MathUtils.clamp(turnInput * 0.95, -0.95, 0.95);
  const bankReturnRate = atmosphericFlightActive
    ? THREE.MathUtils.lerp(config.atmosphereBankReturnRateMin, config.atmosphereBankReturnRateMax, atmosphereDepth) * THREE.MathUtils.lerp(config.atmosphereBankTurnScaleMin, config.atmosphereBankTurnScaleMax, autopilotStrength) * (Math.abs(turnInput) > 0.001 ? turnSpeedScale : 1)
    : 0.0;
  if (bankReturnRate > 0) {
    ship.bank = THREE.MathUtils.lerp(ship.bank, targetBank, easeExp(dt, bankReturnRate));
  }

  if (ship.forward.lengthSq() < 1e-6) {
    ship.forward.copy(Math.abs(localUp.dot(worldUp)) > 0.92
      ? tempVecB.set(1, 0, 0).cross(localUp).normalize()
      : tempVecB.copy(worldUp).cross(localUp).normalize());
  }
  ship.forward.normalize();
  if (ship.up.lengthSq() < 1e-6) {
    ship.up.copy(localUp);
  }
  ship.up.normalize();

  const yawRate = THREE.MathUtils.lerp(config.atmosphereYawRateMin, config.atmosphereYawRateMax, atmosphereDepth) * THREE.MathUtils.lerp(config.atmosphereYawSpeedFactorMin, config.atmosphereYawSpeedFactorMax, clamp01(currentSpeed / 6)) * turnSpeedScale;
  if (atmosphericFlightActive) {
    ship.forward.applyAxisAngle(localUp, -ship.bank * yawRate * dt);
  }

  const rightAxis = tempVecC.copy(ship.up).cross(ship.forward);
  if (rightAxis.lengthSq() < 1e-6) {
    rightAxis.copy(localUp).cross(ship.forward);
  }
  if (rightAxis.lengthSq() < 1e-6) {
    rightAxis.set(1, 0, 0).cross(ship.forward);
  }
  rightAxis.normalize();

  const pitchRate = atmosphericFlightActive
    ? THREE.MathUtils.lerp(config.atmospherePitchRateMin, config.atmospherePitchRateMax, atmosphereDepth)
    : THREE.MathUtils.lerp(config.freeSpacePitchRateMin, config.freeSpacePitchRateMax, clamp01(currentSpeed / 18));
  const stallPitchDown = atmosphericFlightActive ? THREE.MathUtils.lerp(
    config.atmosphereStallPitchDownMin,
    config.atmosphereStallPitchDownMax,
    liftState.stallBlend
  ) : 0;
  const hardDiveOverride = atmosphericFlightActive ? smoothstep(
    config.atmosphereHardDiveOverrideStart,
    config.atmosphereHardDiveOverrideFull,
    Math.max(0, pitchInput)
  ) : 0;
  const terrainOverrideScale = atmosphericFlightActive
    ? 1 - hardDiveOverride * config.atmosphereHardDiveOverrideAuthority
    : 1;
  const terrainPullUpInput = atmosphericFlightActive ? -terrainEmergencyBlend
    * config.atmosphereTerrainPullUpStrength
    * terrainOverrideScale
    * THREE.MathUtils.lerp(1.0, config.atmosphereTerrainPullUpBoostScale, boostLevel) : 0;
  const basePitchInput = THREE.MathUtils.clamp(
    pitchInput + stallPitchDown * liftState.stallBlend,
    -1,
    1
  );
  const controlPitchInput = THREE.MathUtils.clamp(
    pitchInput + stallPitchDown * liftState.stallBlend + terrainPullUpInput,
    -1,
    1
  );
  const pitchIdle = mouseIdle || Math.abs(pitchInput) <= 0.001;
  if (atmosphericFlightActive) {
    if (!pitchIdle) {
      ship.pitchIdleTime = 0;
      ship.forward.applyAxisAngle(rightAxis, basePitchInput * pitchRate * dt);
      ship.up.applyAxisAngle(rightAxis, basePitchInput * pitchRate * dt);
    } else {
      ship.pitchIdleTime = boostLevel <= 0 ? ship.pitchIdleTime + dt : 0;
    }
  } else {
    ship.pitchIdleTime = 0;
  }

  if (atmosphericFlightActive) {
    const horizonForward = tempVecD.copy(ship.forward).addScaledVector(localUp, -ship.forward.dot(localUp));
    if (horizonForward.lengthSq() > 1e-6 && boostLevel <= 0) {
      horizonForward.normalize();
      const levelAuthority = THREE.MathUtils.lerp(0.20, 1.0, liftState.liftAuthority);
      const levelBlend = easeExp(dt, THREE.MathUtils.lerp(config.atmosphereLevelResponseMin, config.atmosphereLevelResponse, atmosphereDepth) * autopilotStrength * captureBlend * approachResponse * levelAuthority);
      const controlFreedom = mouseIdle ? 1 : 1 - clamp01(Math.abs(pitchInput));
      ship.forward.lerp(horizonForward, levelBlend * controlFreedom * controlFreedom);
    }
    const allowCurvatureTrim = boostLevel <= 0;
    if (allowCurvatureTrim) {
      const trimAuthority = mouseIdle ? 1 : Math.max(0, 1 - Math.abs(pitchInput) * 1.4);
      const trimResponse = THREE.MathUtils.lerp(config.atmosphereTrimResponseMin, config.atmosphereTrimResponse, atmosphereDepth);
      const altitudeTrimScale = altitudeError > 0
        ? THREE.MathUtils.lerp(config.atmosphereTrimAltitudeScaleLiftMin, config.atmosphereTrimAltitudeScaleLiftMax, liftState.liftAuthority)
        : THREE.MathUtils.lerp(config.atmosphereTrimAltitudeScaleStallMin, config.atmosphereTrimAltitudeScaleStallMax, liftState.stallBlend);
      const trimPitch = trimAuthority > 0.001
        ? THREE.MathUtils.clamp(-altitudeError * trimResponse * altitudeTrimScale * trimAuthority * autopilotStrength * captureBlend * approachResponse, config.atmosphereTrimPitchClampMin, config.atmosphereTrimPitchClampMax)
        : 0;
      if (trimPitch !== 0) {
        ship.forward.applyAxisAngle(rightAxis, trimPitch * dt);
        ship.up.applyAxisAngle(rightAxis, trimPitch * dt);
      }
    }
    ship.bank = THREE.MathUtils.lerp(ship.bank, 0, easeExp(dt, THREE.MathUtils.lerp(config.atmosphereBankDecayResponseMin, config.atmosphereBankResponse, atmosphereDepth) * autopilotStrength * captureBlend));
  } else {
    const boostAcceleration = config.freeBoostAcceleration;
    if (boostLevel > 0) {
      const boostImpulse = boostAcceleration * boostLevel * dt;
      ship.speed += boostImpulse;
      state.fuel = Math.max(0, state.fuel - dt * (0.8 + boostLevel * 3.2));
    } else if (!boostActive && ship.boostTimer <= 0 && state.fuel < state.maxFuel) {
      state.fuel = Math.min(state.maxFuel, state.fuel + config.shipFuelRecharge * dt);
    }

    if (brakeFactor !== 1) {
      ship.speed *= brakeFactor;
    }
    const freeSpaceSpeedHalfLife = Math.max(0, config.freeSpaceSpeedHalfLife || 0);
    if (freeSpaceSpeedHalfLife > 0) {
      ship.speed *= Math.pow(0.5, dt / freeSpaceSpeedHalfLife);
    }
    ship.speed = clampShipSpeed(ship.speed);

    const freeCurrentSpeed = Math.max(ship.speed || 0, 0.0001);
    const gravitySpeedFactor = 1 / (1 + freeCurrentSpeed * Math.max(0.0001, config.freeGravitySpeedDamping));
    const gravityTurnRate = config.freeGravityTurnRate;
    const gravityMaxTurnRate = config.freeGravityMaxTurnRate;
    const gravityYawAngle = THREE.MathUtils.clamp(
      -gravityPull.dot(ship.up) * gravityTurnRate * gravitySpeedFactor,
      -gravityMaxTurnRate,
      gravityMaxTurnRate
    ) * dt;
    const gravityPitchAngle = THREE.MathUtils.clamp(
      -gravityPull.dot(rightAxis) * gravityTurnRate * gravitySpeedFactor,
      -gravityMaxTurnRate,
      gravityMaxTurnRate
    ) * dt;
    if (gravityYawAngle !== 0) {
      ship.forward.applyAxisAngle(ship.up, gravityYawAngle);
    }
    if (gravityPitchAngle !== 0) {
      ship.forward.applyAxisAngle(rightAxis, gravityPitchAngle);
      ship.up.applyAxisAngle(rightAxis, gravityPitchAngle);
    }

    const spaceYawRate = THREE.MathUtils.lerp(config.freeSpaceYawRateMin, config.freeSpaceYawRateMax, clamp01(freeCurrentSpeed / 18)) * turnSpeedScale;
    const spacePitchRate = THREE.MathUtils.lerp(config.freeSpacePitchRateMin, config.freeSpacePitchRateMax, clamp01(freeCurrentSpeed / 18)) * turnSpeedScale;
    const freeControlScale = config.freeSpaceControlScale;
    ship.forward.applyAxisAngle(ship.up, -turnInput * freeControlScale * spaceYawRate * dt);
    ship.forward.applyAxisAngle(rightAxis, pitchInput * freeControlScale * spacePitchRate * dt);
    ship.up.applyAxisAngle(rightAxis, pitchInput * freeControlScale * spacePitchRate * dt);
    ship.bank = THREE.MathUtils.lerp(ship.bank, 0, easeExp(dt, config.freeFlightBankDecayResponse));
  }

  if (atmosphericFlightActive && liftState.stallBlend > 0) {
    const climbDot = ship.forward.dot(localUp);
    const allowedClimbDot = THREE.MathUtils.lerp(0.14, -0.10, liftState.stallBlend);
    if (climbDot > allowedClimbDot) {
      const ceilingForward = tempVecD.copy(ship.forward).addScaledVector(localUp, allowedClimbDot - climbDot);
      if (ceilingForward.lengthSq() > 1e-6) {
        const stallNoseDownRate = THREE.MathUtils.lerp(0.75, 3.4, liftState.stallBlend);
        ship.forward.lerp(ceilingForward.normalize(), easeExp(dt, stallNoseDownRate)).normalize();
      }
    }
  }

  if (atmosphericFlightActive && ship.boundPlanet && boostLevel <= 0 && ship.pitchIdleTime > config.shipPitchReorientDelay) {
    const referenceUp = atmosphericFlightActive && state.nearestPlanet
      ? ship.position.clone().sub(state.nearestPlanet.position).normalize()
      : worldUp;
    const targetUp = referenceUp.clone().sub(tempVecD.copy(ship.forward).multiplyScalar(referenceUp.dot(ship.forward)));
    const currentUp = ship.up.clone().sub(tempVecE.copy(ship.forward).multiplyScalar(ship.up.dot(ship.forward)));
    if (targetUp.lengthSq() > 1e-6 && currentUp.lengthSq() > 1e-6) {
      targetUp.normalize();
      currentUp.normalize();
      const rightingStrength = THREE.MathUtils.lerp(
        0.15,
        0.7,
        clamp01((ship.pitchIdleTime - config.shipPitchReorientDelay) / 1.5)
      );
      ship.up.lerp(targetUp, rightingStrength * dt * 14.0).normalize();
    }
  }

  if (atmosphericFlightActive && terrainEmergencyBlend > 0 && boostLevel <= 0.995) {
    const desiredTerrainClimbDot = THREE.MathUtils.lerp(
      -0.12,
      config.atmosphereTerrainPullUpClimbDot,
      terrainEmergencyBlend
    );
    const terrainClimbDot = ship.forward.dot(localUp);
    if (terrainClimbDot < desiredTerrainClimbDot) {
      const terrainPitchInput = terrainPullUpInput * THREE.MathUtils.lerp(config.atmosphereTerrainPullUpBoostScale, 1.0, terrainEmergencyBlend);
      const terrainAngle = terrainPitchInput * pitchRate * dt;
      ship.forward.applyAxisAngle(rightAxis, terrainAngle);
      ship.up.applyAxisAngle(rightAxis, terrainAngle);
    }
  }

  ship.forward.normalize();
  ship.up.normalize();
  const projectedUp = ship.up.clone().sub(tempVecF.copy(ship.forward).multiplyScalar(ship.up.dot(ship.forward)));
  if (projectedUp.lengthSq() > 1e-6) {
    ship.up.copy(projectedUp.normalize());
  } else {
    const fallbackAxis = Math.abs(ship.forward.dot(worldUp)) > 0.92
      ? tempVecG.set(1, 0, 0)
      : worldUp;
    const fallbackUp = tempVecH.copy(fallbackAxis).sub(tempVecF.copy(ship.forward).multiplyScalar(fallbackAxis.dot(ship.forward)));
    if (fallbackUp.lengthSq() > 1e-6) {
      ship.up.copy(fallbackUp.normalize());
    }
  }

  if (atmosphericFlightActive) {
    const climbDot = THREE.MathUtils.clamp(ship.forward.dot(localUp), -1, 1);
    const diveEnergy = clamp01(-climbDot);
    const climbLoad = clamp01(climbDot);
    const pitchEnergyBias = controlPitchInput >= 0
      ? controlPitchInput * 0.12
      : controlPitchInput * 0.08;
    let targetSpeed = cruiseSpeed * THREE.MathUtils.clamp(
      1
        + diveEnergy * config.atmosphereDiveSpeedGain
        - climbLoad * config.atmosphereClimbSpeedPenalty
        + pitchEnergyBias,
      0.28,
      2.15
    );

    const speedResponse = targetSpeed > currentSpeed
      ? config.atmosphereDiveAccelResponse
      : (climbLoad > 0.05
        ? config.atmosphereClimbBleedResponse
        : config.atmosphereCruiseBleedResponse);
    const speedTransitionScale = ship.captureTimer >= config.shipCaptureBlendTime
      ? 1
      : THREE.MathUtils.lerp(config.atmosphereCaptureSpeedTransitionScale, 1, captureBlend);
    const speedBlend = easeExp(dt, speedResponse * THREE.MathUtils.lerp(config.atmosphereSpeedBlendDepthMin, config.atmosphereSpeedBlendDepthMax, atmosphereDepth) * THREE.MathUtils.lerp(config.atmosphereSpeedBlendBoostMin, config.atmosphereSpeedBlendBoostMax, 1 - boostLevel) * approachResponse * speedTransitionScale);
    ship.speed = THREE.MathUtils.lerp(currentSpeed, targetSpeed, speedBlend);
    if (brakeFactor !== 1) {
      ship.speed *= brakeFactor;
    }
    ship.speed = clampShipSpeed(ship.speed);

    relativeVelocity.copy(ship.forward).multiplyScalar(ship.speed);
    if (boostLevel > 0) {
      const boostImpulse = config.shipBoostThrust * boostLevel * dt;
      relativeVelocity.addScaledVector(ship.forward, boostImpulse);
      state.fuel = Math.max(0, state.fuel - dt * (0.8 + boostLevel * 3.2));
    } else if (!boostActive && ship.boostTimer <= 0 && state.fuel < state.maxFuel) {
      state.fuel = Math.min(state.maxFuel, state.fuel + config.shipFuelRecharge * dt);
    }
    if (liftState.stallBlend > 0) {
      const radialSpeed = relativeVelocity.dot(outward);
      const maxClimbSpeed = ship.speed * THREE.MathUtils.lerp(0.24, -0.05, liftState.stallBlend);
      if (radialSpeed > maxClimbSpeed) {
        relativeVelocity.addScaledVector(outward, -(radialSpeed - maxClimbSpeed) * THREE.MathUtils.lerp(0.18, 0.45, liftState.stallBlend));
      }
      const gentleSink = Math.min(ship.speed * 0.07, Math.max(0, altitude - targetAltitude) * 0.12) * liftState.stallBlend * liftState.stallBlend;
      if (gentleSink > 0) {
        relativeVelocity.addScaledVector(outward, -gentleSink);
      }
    }
    if (relativeVelocity.lengthSq() > shipSpeedCap * shipSpeedCap) {
      const softCap = THREE.MathUtils.lerp(ship.speed, shipSpeedCap, speedTransitionScale);
      relativeVelocity.setLength(softCap);
    }
    ship.speed = relativeVelocity.length();
    relativePosition.addScaledVector(relativeVelocity, dt);
    const crashAltitude = Math.max(0.25, config.atmosphereTerrainCrashAltitude);
    const crashDistance = planet.radius + crashAltitude;
    if (isPlayerState && relativePosition.lengthSq() <= crashDistance * crashDistance) {
      const crashNormal = relativePosition.lengthSq() > 1e-8
        ? tempVecA.copy(relativePosition).normalize()
        : tempVecA.copy(localUp);
      crashPlayerShip(
        state,
        planet,
        crashNormal,
        planet.position.clone().addScaledVector(crashNormal, crashDistance),
        options
      );
      return;
    }
    ship.relativeVelocity.copy(relativeVelocity);
    if (ship.flightMode === 'bound' && ship.boundPlanet) {
      syncShipWorldState(ship);
    } else {
      ship.position.copy(planet.position).add(relativePosition);
      ship.velocity.copy(planet.velocity).add(relativeVelocity);
    }
    state.speed = ship.speed;
  } else {
    relativeVelocity.copy(ship.forward).multiplyScalar(ship.speed);
    ship.position.addScaledVector(relativeVelocity, dt);
    ship.velocity.copy(relativeVelocity);
    if (planet) {
      relativePosition.copy(ship.position).sub(planet.position);
      relativeVelocity.copy(ship.velocity).sub(planet.velocity);
    } else {
      relativePosition.copy(ship.position);
      relativeVelocity.copy(ship.velocity);
    }
    ship.relativePosition.copy(relativePosition);
    ship.relativeVelocity.copy(relativeVelocity);
    state.speed = ship.speed;
  }

  const sunRadius = config.starScale * 0.5;
  if (ship.position.length() <= sunRadius) {
    if (isPlayerState) {
      crashPlayerShipIntoSun(state, ship.position.clone(), options);
    }
    return;
  }

  if (fireActive && ship.fireCooldown <= 0) {
    spawnProjectileBurst(state, ship, vectorLikeTo(tempVecE, controls.fireDirection, ship.forward).normalize().clone());
    ship.fireCooldown = config.shipFireCooldown;
  }

  const updatedNearest = pickNearestPlanet(state.planets, ship.position);
  state.nearestPlanet = updatedNearest.nearest;
  state.nearestDistance = updatedNearest.nearestDistance;
  state.nearestAltitude = updatedNearest.nearest ? Math.max(0, updatedNearest.nearestDistance - updatedNearest.nearest.radius) : 0;

  if (ship.flightMode === 'free' && ship.recaptureLock <= 1e-6 && updatedNearest.nearest && state.nearestAltitude < config.planetCaptureAltitude) {
    const capturePlanet = updatedNearest.nearest;
    beginPlanetCapture(ship, capturePlanet);
    state.nearestPlanet = capturePlanet;
    state.nearestDistance = ship.position.distanceTo(capturePlanet.position);
    state.nearestAltitude = Math.max(0, state.nearestDistance - capturePlanet.radius);
  }

  if (ship.flightMode === 'bound' && ship.boundPlanet && state.nearestAltitude > config.planetEscapeAltitude) {
    ship.flightMode = 'free';
    ship.boundPlanet = null;
    ship.recaptureLock = config.shipRecaptureDelay;
  }
}
