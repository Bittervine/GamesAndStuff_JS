import assert from 'node:assert/strict';
import * as THREE from './lib/three.module.js';
import { createOrbitalsSim, ENEMY_MODEL_FILES_BY_FAMILY } from './Orbitals_Sim.js';
import { config } from './orbitals_config.js';

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const NEUTRAL_CONTROLS = {
  turnInput: 0,
  pitchInput: 0,
  boost: false,
  brake: false,
  respawn: false
};

const SHALLOW_DIVE_PITCH_INPUT = 0.5;

function altitudeBetween(ship, planet) {
  return ship.position.distanceTo(planet.position) - planet.radius;
}

function climbDotBetween(ship, planet) {
  return ship.forward.clone().normalize().dot(ship.position.clone().sub(planet.position).normalize());
}

function stepSim(sim, steps, controls) {
  for (let i = 0; i < steps; i += 1) {
    sim.step(1 / 60, controls);
  }
}

function averageEnemyDistanceToPlanet(state, squadId, planet) {
  const enemies = state.enemies.filter((enemy) => enemy.squadId === squadId);
  assert.ok(enemies.length > 0, `expected squad ${squadId} to have active enemies`);
  return enemies.reduce((sum, enemy) => sum + enemy.position.distanceTo(planet.position), 0) / enemies.length;
}

function averageEnemyAltitudeToPlanet(state, squadId, planet) {
  return averageEnemyDistanceToPlanet(state, squadId, planet) - planet.radius;
}

function orbitAngleAroundPlanet(planet, position) {
  const radial = planet.position.clone().normalize();
  const tangent = Math.abs(radial.dot(new THREE.Vector3(0, 1, 0))) > 0.85
    ? new THREE.Vector3(1, 0, 0).cross(radial).normalize()
    : new THREE.Vector3(0, 1, 0).cross(radial).normalize();
  const bitangent = radial.clone().cross(tangent).normalize();
  const relative = position.clone().sub(planet.position);
  return Math.atan2(relative.dot(bitangent), relative.dot(tangent));
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

function buildSurfaceBasis(planet, position) {
  const localUp = position.clone().sub(planet.position).normalize();
  const tangent = Math.abs(localUp.dot(WORLD_UP)) > 0.85
    ? new THREE.Vector3(1, 0, 0).cross(localUp).normalize()
    : WORLD_UP.clone().cross(localUp).normalize();
  const bitangent = localUp.clone().cross(tangent).normalize();
  return { localUp, tangent, bitangent };
}

function orbitAngleAroundBody(center, position, referenceDirection) {
  const relative = position.clone().sub(center);
  const basisDirection = referenceDirection && referenceDirection.lengthSq() > 1e-6
    ? referenceDirection.clone().normalize()
    : (relative.lengthSq() > 1e-6 ? relative.clone().normalize() : WORLD_UP.clone());
  const tangent = Math.abs(basisDirection.dot(WORLD_UP)) > 0.85
    ? new THREE.Vector3(1, 0, 0).cross(basisDirection).normalize()
    : WORLD_UP.clone().cross(basisDirection).normalize();
  const bitangent = basisDirection.clone().cross(tangent).normalize();
  return Math.atan2(relative.dot(bitangent), relative.dot(tangent));
}

function configureFreeFlightShip(state, planet, worldPosition, forward, up, speed, options = {}) {
  const ship = state.ship;
  const nextForward = forward.clone().normalize();
  const nextUp = up.clone().normalize();
  const worldVelocity = nextForward.clone().multiplyScalar(speed);

  ship.boundPlanet = null;
  ship.flightMode = 'free';
  ship.recaptureLock = options.recaptureLock ?? (config.shipRecaptureDelay + 5);
  ship.captureTimer = config.shipCaptureBlendTime;
  ship.position.copy(worldPosition);
  ship.velocity.copy(worldVelocity);
  ship.relativePosition.copy(worldPosition).sub(planet.position);
  ship.relativeVelocity.copy(worldVelocity).sub(planet.velocity);
  ship.forward.copy(nextForward);
  ship.up.copy(nextUp);
  ship.bank = options.bank ?? 0;
  ship.boostTimer = 0;
  ship.fireCooldown = 0;
  ship.pitchIdleTime = 0;
  ship.speed = speed;
  state.nearestPlanet = planet;
  state.nearestDistance = worldPosition.distanceTo(planet.position);
  state.nearestAltitude = state.nearestDistance - planet.radius;
  state.speed = speed;
}

function runStableAltitudeTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  assert.ok(state.ship, 'expected a ship to exist after bootstrap');
  assert.ok(state.ship.boundPlanet, 'expected the ship to start bound to a planet');

  const planet = state.ship.boundPlanet;
  const atmosphereThickness = planet.atmosphereRadius - planet.radius;
  const initialAltitude = altitudeBetween(state.ship, planet);

  assert.ok(initialAltitude > 0, 'ship should start above the surface');
  assert.ok(initialAltitude < atmosphereThickness, 'ship should start inside the atmosphere');

  const samples = [];
  const steps = 600;
  const dt = 1 / 60;

  for (let i = 0; i < steps; i += 1) {
    sim.step(dt, {
      turnInput: 0,
      pitchInput: 0,
      boost: false,
      brake: false,
      respawn: false
    });
    samples.push(altitudeBetween(state.ship, planet));
    assert.strictEqual(state.ship.boundPlanet, planet, 'ship should remain bound to the starting planet during the test');
  }

  const minAltitude = Math.min(...samples);
  const maxAltitude = Math.max(...samples);
  const finalAltitude = samples[samples.length - 1];
  const span = maxAltitude - minAltitude;
  const drift = Math.abs(finalAltitude - initialAltitude);
  const tolerance = Math.max(2, atmosphereThickness * 0.01);

  assert.ok(
    span <= tolerance,
    `altitude varied too much: span=${span.toFixed(3)} tolerance=${tolerance.toFixed(3)} initial=${initialAltitude.toFixed(3)}`
  );
  assert.ok(
    drift <= tolerance,
    `altitude drifted too much: drift=${drift.toFixed(3)} tolerance=${tolerance.toFixed(3)} initial=${initialAltitude.toFixed(3)} final=${finalAltitude.toFixed(3)}`
  );

  console.log(
    `PASS stable-altitude: initial=${initialAltitude.toFixed(3)} final=${finalAltitude.toFixed(3)} span=${span.toFixed(3)} tolerance=${tolerance.toFixed(3)}`
  );
}

function runPitchResponseTest() {
  const seed = 0xC0FFEE;
  const settleFrames = 240;
  const responseFrames = 60;

  const diveSim = createOrbitalsSim(seed);
  diveSim.bootstrapWorld();
  const divePlanet = diveSim.state.ship.boundPlanet;
  const atmosphereThickness = divePlanet.atmosphereRadius - divePlanet.radius;

  stepSim(diveSim, settleFrames, NEUTRAL_CONTROLS);
  const baselineSpeed = diveSim.state.speed;
  const baselineAltitude = altitudeBetween(diveSim.state.ship, divePlanet);

  stepSim(diveSim, responseFrames, { ...NEUTRAL_CONTROLS, pitchInput: 1 });
  const diveUp = diveSim.state.ship.position.clone().sub(divePlanet.position).normalize();
  const diveDot = diveSim.state.ship.forward.clone().normalize().dot(diveUp);
  const diveSpeed = diveSim.state.speed;

  stepSim(diveSim, 240, NEUTRAL_CONTROLS);
  const recoveredUp = diveSim.state.ship.position.clone().sub(divePlanet.position).normalize();
  const recoveredDot = diveSim.state.ship.forward.clone().normalize().dot(recoveredUp);
  const recoveredAltitude = altitudeBetween(diveSim.state.ship, divePlanet);

  const climbSim = createOrbitalsSim(seed);
  climbSim.bootstrapWorld();
  const climbPlanet = climbSim.state.ship.boundPlanet;
  stepSim(climbSim, settleFrames, NEUTRAL_CONTROLS);
  stepSim(climbSim, responseFrames, { ...NEUTRAL_CONTROLS, pitchInput: -1 });
  const climbUp = climbSim.state.ship.position.clone().sub(climbPlanet.position).normalize();
  const climbDot = climbSim.state.ship.forward.clone().normalize().dot(climbUp);
  const climbSpeed = climbSim.state.speed;

  assert.ok(
    diveSpeed > baselineSpeed + 0.2,
    `pitch down should increase speed: baseline=${baselineSpeed.toFixed(3)} dive=${diveSpeed.toFixed(3)}`
  );
  assert.ok(
    climbSpeed < baselineSpeed - 0.2,
    `pitch up should reduce speed: baseline=${baselineSpeed.toFixed(3)} climb=${climbSpeed.toFixed(3)}`
  );
  assert.ok(
    diveDot < -0.18,
    `pitch down should point the nose down: dot=${diveDot.toFixed(3)}`
  );
  assert.ok(
    climbDot > 0.2,
    `pitch up should point the nose up: dot=${climbDot.toFixed(3)}`
  );
  assert.ok(
    Math.abs(recoveredDot) <= 0.1,
    `neutral controls should re-level the nose: dot=${recoveredDot.toFixed(3)}`
  );
  assert.ok(
    Math.abs(recoveredAltitude - baselineAltitude) <= Math.max(2.5, atmosphereThickness * 0.05),
    `neutral controls should return to cruise altitude: baseline=${baselineAltitude.toFixed(3)} recovered=${recoveredAltitude.toFixed(3)}`
  );

  console.log(
    `PASS pitch-response: baseline=${baselineSpeed.toFixed(3)} dive=${diveSpeed.toFixed(3)} climb=${climbSpeed.toFixed(3)} recoveredDot=${recoveredDot.toFixed(3)}`
  );
}

function runAtmosphereTerrainRecoveryTest() {
  const seed = 0xC0FFEE;
  const settleFrames = 180;
  const recoveryFrames = 2400;

  const sim = createOrbitalsSim(seed);
  sim.bootstrapWorld();

  const { state } = sim;
  const planet = state.ship.boundPlanet;
  assert.ok(planet, 'expected the ship to start bound to a planet');

  const initialAltitude = altitudeBetween(state.ship, planet);
  const initialDot = climbDotBetween(state.ship, planet);

  stepSim(sim, settleFrames, { ...NEUTRAL_CONTROLS, pitchInput: SHALLOW_DIVE_PITCH_INPUT });
  const shallowDiveAltitude = altitudeBetween(state.ship, planet);
  const shallowDiveDot = climbDotBetween(state.ship, planet);

  assert.ok(
    shallowDiveAltitude < initialAltitude - 0.5,
    `expected the shallow dive to lose altitude: initial=${initialAltitude.toFixed(3)} shallow=${shallowDiveAltitude.toFixed(3)}`
  );
  assert.ok(
    shallowDiveDot < initialDot - 0.02,
    `expected the nose to pitch down before recovery: initialDot=${initialDot.toFixed(3)} shallowDot=${shallowDiveDot.toFixed(3)}`
  );

  let minAltitude = shallowDiveAltitude;
  let maxClimbDot = shallowDiveDot;
  for (let i = 0; i < recoveryFrames; i += 1) {
    sim.step(1 / 60, { ...NEUTRAL_CONTROLS, pitchInput: SHALLOW_DIVE_PITCH_INPUT });
    const altitude = altitudeBetween(state.ship, planet);
    const climbDot = climbDotBetween(state.ship, planet);
    minAltitude = Math.min(minAltitude, altitude);
    maxClimbDot = Math.max(maxClimbDot, climbDot);
    if (state.crashed) {
      break;
    }
  }

  const finalAltitude = altitudeBetween(state.ship, planet);
  const finalDot = climbDotBetween(state.ship, planet);
  const atmosphereThickness = planet.atmosphereRadius - planet.radius;

  assert.ok(!state.crashed, 'expected the shallow dive to recover before impact');
  assert.strictEqual(state.ship.boundPlanet, planet, 'expected the recovery to stay bound to the starting planet');
  assert.ok(
    minAltitude > config.atmosphereTerrainCrashAltitude + 0.5,
    `expected terrain protection to keep the ship above the crash altitude: min=${minAltitude.toFixed(3)} crash=${config.atmosphereTerrainCrashAltitude.toFixed(3)}`
  );
  assert.ok(
    maxClimbDot > shallowDiveDot + 0.08,
    `expected a visible nose-up correction: shallowDot=${shallowDiveDot.toFixed(3)} maxDot=${maxClimbDot.toFixed(3)}`
  );
  assert.ok(
    finalDot > -0.02,
    `expected the ship to stop diving: finalDot=${finalDot.toFixed(3)}`
  );
  assert.ok(
    finalAltitude < atmosphereThickness,
    `expected the recovery to stay in the atmosphere: finalAltitude=${finalAltitude.toFixed(3)} atmosphere=${atmosphereThickness.toFixed(3)}`
  );

  console.log(
    `PASS atmosphere-terrain-recovery: initial=${initialAltitude.toFixed(3)} shallow=${shallowDiveAltitude.toFixed(3)} min=${minAltitude.toFixed(3)} final=${finalAltitude.toFixed(3)} maxDot=${maxClimbDot.toFixed(3)}`
  );
}

function runAtmosphereTerrainCrashTest() {
  const seed = 0xC0FFEE;
  const diveFrames = 2400;

  const sim = createOrbitalsSim(seed);
  sim.bootstrapWorld();

  const { state } = sim;
  const planet = state.ship.boundPlanet;
  assert.ok(planet, 'expected the ship to start bound to a planet');

  let crashFrame = -1;
  for (let i = 0; i < diveFrames; i += 1) {
    sim.step(1 / 60, { ...NEUTRAL_CONTROLS, pitchInput: 1 });
    if (state.crashed) {
      crashFrame = i;
      break;
    }
  }

  assert.ok(state.crashed, 'expected a full hard dive to be able to defeat the terrain assist');
  assert.ok(
    crashFrame >= 0,
    'expected the hard dive crash to occur within the test window'
  );
  assert.ok(
    state.crashTimer <= 1 / 30,
    `expected the crash timer to start at zero after impact: crashTimer=${state.crashTimer.toFixed(3)}`
  );

  console.log(`PASS atmosphere-terrain-crash: frame=${crashFrame} crashTimer=${state.crashTimer.toFixed(3)}`);
}

function runBoostRecoveryTest() {
  const seed = 0xC0FFEE;
  const settleFrames = 240;
  const boostFrames = 180;
  const recoveryFrames = 600;

  const sim = createOrbitalsSim(seed);
  sim.bootstrapWorld();

  const { state } = sim;
  const startPlanet = state.ship.boundPlanet;
  assert.ok(startPlanet, 'expected the ship to start bound to a planet');

  stepSim(sim, settleFrames, NEUTRAL_CONTROLS);
  const baselineSpeed = state.speed;
  const baselineAltitude = altitudeBetween(state.ship, startPlanet);
  const atmosphereThickness = startPlanet.atmosphereRadius - startPlanet.radius;

  stepSim(sim, boostFrames, { ...NEUTRAL_CONTROLS, pitchInput: -0.35, boost: true });
  const boostedSpeed = state.speed;
  const boostedAltitude = altitudeBetween(state.ship, startPlanet);
  const boostedForward = state.ship.forward.clone().normalize();

  assert.ok(
    boostedSpeed > baselineSpeed + 0.12,
    `boost should raise speed: baseline=${baselineSpeed.toFixed(3)} boosted=${boostedSpeed.toFixed(3)}`
  );
  assert.ok(
    boostedAltitude > baselineAltitude + 0.2,
    `boost should climb away from the cruise band: baseline=${baselineAltitude.toFixed(3)} boosted=${boostedAltitude.toFixed(3)}`
  );

  stepSim(sim, recoveryFrames, NEUTRAL_CONTROLS);
  const settledPlanet = state.ship.boundPlanet || state.nearestPlanet || startPlanet;
  assert.ok(settledPlanet, 'expected the ship to remain near a planet after recovery');
  const settledAltitude = altitudeBetween(state.ship, settledPlanet);
  const settledSpeed = state.speed;
  const settledThickness = settledPlanet.atmosphereRadius - settledPlanet.radius;
  const settledDot = state.ship.forward.clone().normalize().dot(state.ship.position.clone().sub(settledPlanet.position).normalize());
  const stillInAtmosphere = settledAltitude <= settledThickness;
  if (stillInAtmosphere) {
    assert.ok(
      Math.abs(settledDot) <= 0.18,
      `ship should re-level after boost: dot=${settledDot.toFixed(3)}`
    );
    assert.ok(
      Math.abs(settledAltitude - settledThickness * 0.5) <= Math.max(0.08, settledThickness * 0.12),
      `ship should return to mid-atmosphere cruise: altitude=${settledAltitude.toFixed(3)} target=${(settledThickness * 0.5).toFixed(3)}`
    );
  } else {
    assert.strictEqual(state.ship.flightMode, 'free', 'expected the ship to stay in free space flight after leaving the atmosphere');
  }

  console.log(
    `PASS boost-recovery: baseline=${baselineSpeed.toFixed(3)} boosted=${boostedSpeed.toFixed(3)} settled=${settledSpeed.toFixed(3)} settledPlanet=${settledPlanet.name}`
  );
}

function runBoostThrustTest() {
  const seed = 0xC0FFEE;
  const settleFrames = 240;
  const travelFrames = 60;

  const baselineSim = createOrbitalsSim(seed);
  baselineSim.bootstrapWorld();
  stepSim(baselineSim, settleFrames, NEUTRAL_CONTROLS);
  const baselineStartPosition = baselineSim.state.ship.position.clone();
  const baselineForward = baselineSim.state.ship.forward.clone().normalize();
  const baselineStartSpeed = baselineSim.state.speed;
  stepSim(baselineSim, travelFrames, NEUTRAL_CONTROLS);
  const baselineTravel = baselineSim.state.ship.position.clone().sub(baselineStartPosition).dot(baselineForward);

  const boostSim = createOrbitalsSim(seed);
  boostSim.bootstrapWorld();
  stepSim(boostSim, settleFrames, NEUTRAL_CONTROLS);
  const boostStartPosition = boostSim.state.ship.position.clone();
  const boostForward = boostSim.state.ship.forward.clone().normalize();
  const boostStartSpeed = boostSim.state.speed;
  stepSim(boostSim, travelFrames, { ...NEUTRAL_CONTROLS, boost: true });
  const boostTravel = boostSim.state.ship.position.clone().sub(boostStartPosition).dot(boostForward);
  const boostSpeed = boostSim.state.speed;

  assert.ok(
    boostTravel > baselineTravel + 0.08,
    `boost should push the ship forward along the nose: baselineTravel=${baselineTravel.toFixed(3)} boostTravel=${boostTravel.toFixed(3)}`
  );
  assert.ok(
    boostSpeed > baselineStartSpeed + 0.06,
    `boost should raise forward speed: baseline=${baselineStartSpeed.toFixed(3)} boost=${boostSpeed.toFixed(3)}`
  );

  console.log(
    `PASS boost-thrust: baselineTravel=${baselineTravel.toFixed(3)} boostTravel=${boostTravel.toFixed(3)} boostSpeed=${boostSpeed.toFixed(3)}`
  );
}

function runAtmosphereBoostPitchLockTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const planet = state.ship.boundPlanet;
  assert.ok(planet, 'expected the ship to start bound to a planet');

  const up = state.ship.position.clone().sub(planet.position).normalize();
  const tangent = Math.abs(up.dot(new THREE.Vector3(0, 1, 0))) > 0.85
    ? new THREE.Vector3(1, 0, 0).cross(up).normalize()
    : new THREE.Vector3(0, 1, 0).cross(up).normalize();
  const altitude = Math.min(30, planet.atmosphereRadius - planet.radius - 0.2);
  const worldPosition = planet.position.clone().addScaledVector(up, planet.radius + altitude);
  const initialForward = tangent.clone().addScaledVector(up, 0.42).normalize();
  const initialUp = up.clone().sub(initialForward.clone().multiplyScalar(up.dot(initialForward))).normalize();

  state.ship.boundPlanet = planet;
  state.ship.flightMode = 'bound';
  state.ship.relativePosition.copy(worldPosition).sub(planet.position);
  state.ship.relativeVelocity.copy(initialForward).multiplyScalar(12);
  state.ship.position.copy(worldPosition);
  state.ship.velocity.copy(initialForward).multiplyScalar(12);
  state.ship.forward.copy(initialForward);
  state.ship.up.copy(initialUp);
  state.ship.bank = 0;
  state.ship.speed = 12;
  state.ship.pitchIdleTime = config.shipPitchReorientDelay + 2;
  state.ship.captureTimer = config.shipCaptureBlendTime;
  state.ship.recaptureLock = 0;
  state.nearestPlanet = planet;
  state.nearestDistance = worldPosition.distanceTo(planet.position);
  state.nearestAltitude = altitude;
  state.speed = state.ship.speed;

  stepSim(sim, 180, { ...NEUTRAL_CONTROLS, boost: true });

  const finalForward = state.ship.forward.clone();
  const finalUp = state.ship.up.clone();

  assert.ok(
    finalForward.dot(initialForward) > 0.82,
    `boost should not auto-pitch the nose: dot=${finalForward.dot(initialForward).toFixed(3)}`
  );
  assert.ok(
    finalUp.dot(initialUp) > 0.82,
    `boost should not auto-realign the ship up vector: dot=${finalUp.dot(initialUp).toFixed(3)}`
  );

  console.log(
    `PASS atmosphere-boost-pitch-lock: forward=${finalForward.dot(initialForward).toFixed(3)} up=${finalUp.dot(initialUp).toFixed(3)}`
  );
}

function runAtmosphereSoftStallTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const planet = state.ship.boundPlanet;
  assert.ok(planet, 'expected the ship to start bound to a planet');

  const boostFrames = 120;
  const coastFrames = 300;

  stepSim(sim, boostFrames, { ...NEUTRAL_CONTROLS, pitchInput: -0.35, boost: true });

  const releaseAltitude = altitudeBetween(state.ship, planet);
  const releaseForwardDot = state.ship.forward.clone().normalize().dot(state.ship.position.clone().sub(planet.position).normalize());
  let peakAltitude = releaseAltitude;
  let peakForwardDot = releaseForwardDot;
  let minForwardDotAfterPeak = Infinity;
  let startedDescending = false;

  for (let i = 0; i < coastFrames; i += 1) {
    sim.step(1 / 60, { ...NEUTRAL_CONTROLS, pitchInput: -1 });
    const currentAltitude = altitudeBetween(state.ship, planet);
    const currentUp = state.ship.position.clone().sub(planet.position).normalize();
    const currentForwardDot = state.ship.forward.clone().normalize().dot(currentUp);
    if (currentAltitude > peakAltitude) {
      peakAltitude = currentAltitude;
      peakForwardDot = currentForwardDot;
    }
    if (peakAltitude - currentAltitude > 0.5) {
      startedDescending = true;
    }
    if (startedDescending) {
      minForwardDotAfterPeak = Math.min(minForwardDotAfterPeak, currentForwardDot);
    }
  }

  const finalAltitude = altitudeBetween(state.ship, planet);

  assert.ok(
    releaseAltitude > 30,
    `expected the boosted climb to reach the upper atmosphere: release=${releaseAltitude.toFixed(3)}`
  );
  assert.ok(
    peakAltitude > releaseAltitude + 2,
    `expected the climb to keep rising after boost release: release=${releaseAltitude.toFixed(3)} peak=${peakAltitude.toFixed(3)}`
  );
  assert.ok(
    finalAltitude <= peakAltitude + 0.5,
    `expected the stall to stop the climb: peak=${peakAltitude.toFixed(3)} final=${finalAltitude.toFixed(3)}`
  );
  console.log(
    `PASS atmosphere-soft-stall: release=${releaseAltitude.toFixed(3)} peak=${peakAltitude.toFixed(3)} final=${finalAltitude.toFixed(3)}`
  );
}

function runBoostDirectionTest() {
  const seed = 0xC0FFEE;
  const settleFrames = 240;
  const travelFrames = 120;

  const baselineSim = createOrbitalsSim(seed);
  baselineSim.bootstrapWorld();
  stepSim(baselineSim, settleFrames, NEUTRAL_CONTROLS);

  const boostSim = createOrbitalsSim(seed);
  boostSim.bootstrapWorld();
  stepSim(boostSim, settleFrames, NEUTRAL_CONTROLS);

  const baselineShip = baselineSim.state.ship;
  const boostShip = boostSim.state.ship;
  const baselinePlanet = baselineShip.boundPlanet;
  const boostPlanet = boostShip.boundPlanet;
  assert.ok(baselinePlanet, 'expected the baseline ship to remain bound to a planet');
  assert.ok(boostPlanet, 'expected the boost ship to remain bound to a planet');

  const inward = baselineShip.position.clone().sub(baselinePlanet.position).multiplyScalar(-1).normalize();
  for (const ship of [baselineShip, boostShip]) {
    ship.forward.copy(inward);
    ship.bank = 0;
    ship.speed = baselineSim.state.speed;
    ship.relativeVelocity.copy(ship.forward).multiplyScalar(ship.speed);
  }

  const baselineAltitudeBefore = altitudeBetween(baselineShip, baselinePlanet);
  const boostAltitudeBefore = altitudeBetween(boostShip, boostPlanet);

  stepSim(baselineSim, travelFrames, NEUTRAL_CONTROLS);
  stepSim(boostSim, travelFrames, { ...NEUTRAL_CONTROLS, boost: true });

  const baselineAltitudeAfter = altitudeBetween(baselineShip, baselinePlanet);
  const boostAltitudeAfter = altitudeBetween(boostShip, boostPlanet);
  const baselineDelta = baselineAltitudeAfter - baselineAltitudeBefore;
  const boostDelta = boostAltitudeAfter - boostAltitudeBefore;
  const tolerance = 0.5;

  assert.ok(
    boostDelta < baselineDelta - tolerance,
    `boost should move along the nose when pointed inward: baselineDelta=${baselineDelta.toFixed(3)} boostDelta=${boostDelta.toFixed(3)}`
  );

  console.log(
    `PASS boost-direction: baselineDelta=${baselineDelta.toFixed(3)} boostDelta=${boostDelta.toFixed(3)}`
  );
}

function runFreeBrakeDecayTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const planet = state.planets[0];
  assert.ok(planet, 'expected at least one planet for the free brake test');

  const worldPosition = new THREE.Vector3(24000, -15000, 18500);
  const initialForward = new THREE.Vector3(0.34, 0.21, 0.92).normalize();
  const initialUp = WORLD_UP.clone().sub(initialForward.clone().multiplyScalar(WORLD_UP.dot(initialForward))).normalize();
  const initialSpeed = 18;

  configureFreeFlightShip(
    state,
    planet,
    worldPosition,
    initialForward,
    initialUp,
    initialSpeed,
    {
      bank: 0,
      recaptureLock: config.shipRecaptureDelay + 8
    }
  );

  stepSim(sim, 120, { ...NEUTRAL_CONTROLS, brake: true });

  const finalSpeed = state.speed;
  const expectedSpeed = initialSpeed * 0.5;

  assert.ok(
    Math.abs(finalSpeed - expectedSpeed) <= 1e-6,
    `free brake should remove half the speed every 2 seconds: initial=${initialSpeed.toFixed(3)} final=${finalSpeed.toFixed(3)} expected=${expectedSpeed.toFixed(3)}`
  );

  console.log(
    `PASS free-brake: initial=${initialSpeed.toFixed(3)} final=${finalSpeed.toFixed(3)} expected=${expectedSpeed.toFixed(3)}`
  );
}

function runFuelRechargeTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  sim.state.fuel = 0;
  sim.state.ship.boostTimer = 0;

  stepSim(sim, 120, NEUTRAL_CONTROLS);
  const fuelAfterTwoSeconds = sim.state.fuel;

  stepSim(sim, 240, NEUTRAL_CONTROLS);
  const recoveredFuel = sim.state.fuel;

  assert.ok(
    Math.abs(fuelAfterTwoSeconds - (sim.state.maxFuel * 0.5)) <= 1e-6,
    `fuel should refill halfway after 2 seconds: afterTwoSeconds=${fuelAfterTwoSeconds.toFixed(3)} expected=${(sim.state.maxFuel * 0.5).toFixed(3)}`
  );
  assert.ok(
    Math.abs(recoveredFuel - sim.state.maxFuel) <= 1e-6,
    `fuel should fully recharge after 4 seconds: recovered=${recoveredFuel.toFixed(3)} max=${sim.state.maxFuel.toFixed(3)}`
  );

  console.log(
    `PASS fuel-recharge: after2s=${fuelAfterTwoSeconds.toFixed(3)} recovered=${recoveredFuel.toFixed(3)}`
  );
}

function runSpaceNewtonianTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const planet = state.planets[0];
  assert.ok(planet, 'expected at least one planet for the deep-space setup');

  const worldPosition = new THREE.Vector3(24000, -15000, 18500);
  const initialForward = new THREE.Vector3(0.34, 0.21, 0.92).normalize();
  const initialUp = WORLD_UP.clone().sub(initialForward.clone().multiplyScalar(WORLD_UP.dot(initialForward))).normalize();
  const initialSpeed = 17.5;

  configureFreeFlightShip(
    state,
    planet,
    worldPosition,
    initialForward,
    initialUp,
    initialSpeed,
    {
      bank: 0.18,
      recaptureLock: config.shipRecaptureDelay + 8
    }
  );

  stepSim(sim, 600, NEUTRAL_CONTROLS);

  const finalSpeed = state.speed;
  const finalForward = state.ship.forward.clone().normalize();
  const travelVector = state.ship.position.clone().sub(worldPosition).normalize();

  assert.ok(
    Math.abs(finalSpeed - initialSpeed) <= 1e-6,
    `free flight should have no passive drag: initial=${initialSpeed.toFixed(3)} final=${finalSpeed.toFixed(3)}`
  );
  assert.ok(
    travelVector.dot(finalForward) > 0.99,
    `free flight travel should stay nose-coupled: dot=${travelVector.dot(finalForward).toFixed(3)}`
  );

  console.log(
    `PASS free-no-drag: initial=${initialSpeed.toFixed(3)} final=${finalSpeed.toFixed(3)} travelDot=${travelVector.dot(finalForward).toFixed(3)}`
  );
}

function runFreeFlightMovesAlongNoseTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const planet = state.planets[0];
  assert.ok(planet, 'expected at least one planet for the gravity test');

  const planetRadial = planet.position.lengthSq() > 1e-6
    ? planet.position.clone().normalize()
    : WORLD_UP.clone();
  const tangent = Math.abs(planetRadial.dot(WORLD_UP)) > 0.85
    ? new THREE.Vector3(1, 0, 0).cross(planetRadial).normalize()
    : WORLD_UP.clone().cross(planetRadial).normalize();
  const altitude = Math.max(
    planet.atmosphereRadius - planet.radius + 140,
    planet.gravityRadius * 0.28
  );
  const worldPosition = planet.position.clone().addScaledVector(planetRadial, planet.radius + altitude);
  const initialForward = tangent.clone().addScaledVector(planetRadial, 0.14).normalize();
  const initialUp = planetRadial.clone().sub(initialForward.clone().multiplyScalar(planetRadial.dot(initialForward))).normalize();

  configureFreeFlightShip(
    state,
    planet,
    worldPosition,
    initialForward,
    initialUp,
    12.0,
    {
      bank: 0,
      recaptureLock: config.shipRecaptureDelay + 8
    }
  );

  let minAltitude = Infinity;
  let minStepDot = Infinity;
  let maxSpeedDelta = 0;
  let accumulatedAngle = 0;

  for (let i = 0; i < 120; i += 1) {
    const startPosition = state.ship.position.clone();
    const startForward = state.ship.forward.clone().normalize();
    const startSpeed = state.speed;
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    const endForward = state.ship.forward.clone().normalize();
    const averageForward = startForward.clone().add(endForward);
    if (averageForward.lengthSq() <= 1e-8) {
      averageForward.copy(endForward);
    }
    averageForward.normalize();
    const stepVector = state.ship.position.clone().sub(startPosition).normalize();
    minStepDot = Math.min(minStepDot, stepVector.dot(averageForward));
    minAltitude = Math.min(minAltitude, altitudeBetween(state.ship, planet));
    maxSpeedDelta = Math.max(maxSpeedDelta, Math.abs(state.speed - startSpeed));
    accumulatedAngle += startForward.angleTo(endForward);
  }

  assert.strictEqual(state.ship.flightMode, 'free', 'expected the ship to stay in free flight');
  assert.strictEqual(state.ship.boundPlanet, null, 'expected the ship to remain unbound');
  assert.ok(
    minStepDot > 0.995,
    `free flight should move along the current nose: minStepDot=${minStepDot.toFixed(3)}`
  );
  assert.ok(
    maxSpeedDelta <= 1e-6,
    `free flight should not add inertial drift or drag: maxSpeedDelta=${maxSpeedDelta.toExponential(2)}`
  );
  assert.ok(
    minAltitude > planet.atmosphereRadius - planet.radius,
    `free flight should stay outside the atmosphere during the nose-coupling check: minAltitude=${minAltitude.toFixed(3)} atmosphere=${(planet.atmosphereRadius - planet.radius).toFixed(3)}`
  );
  assert.ok(
    accumulatedAngle > 0.02,
    `gravity steering should still be able to bend the nose a little: angle=${accumulatedAngle.toFixed(3)}`
  );

  console.log(
    `PASS free-moves-along-nose: minStepDot=${minStepDot.toFixed(3)} minAltitude=${minAltitude.toFixed(3)} angle=${accumulatedAngle.toFixed(3)}`
  );
}

function runSpaceLoopTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const planet = state.planets[0];
  assert.ok(planet, 'expected at least one planet for the loop test');

  const worldPosition = new THREE.Vector3(22000, 8000, -16000);
  const initialForward = new THREE.Vector3(0.15, 0.92, 0.35).normalize();
  const initialUp = WORLD_UP.clone().sub(initialForward.clone().multiplyScalar(WORLD_UP.dot(initialForward))).normalize();

  configureFreeFlightShip(
    state,
    planet,
    worldPosition,
    initialForward,
    initialUp,
    11.5,
    {
      bank: 0,
      recaptureLock: config.shipRecaptureDelay + 8
    }
  );

  let minDot = Infinity;
  let maxDot = -Infinity;

  for (let i = 0; i < 720; i += 1) {
    sim.step(1 / 60, { ...NEUTRAL_CONTROLS, pitchInput: -1 });
    const dot = state.ship.forward.clone().normalize().dot(initialForward);
    minDot = Math.min(minDot, dot);
    maxDot = Math.max(maxDot, dot);
  }

  assert.ok(
    minDot < -0.2,
    `space pitch should be able to pass through vertical and keep looping: minDot=${minDot.toFixed(3)}`
  );

  console.log(
    `PASS space-loop: minDot=${minDot.toFixed(3)} maxDot=${maxDot.toFixed(3)}`
  );
}

function runSpaceFreeNoAutoReorientTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const planet = state.planets[1] || state.planets[0];
  assert.ok(planet, 'expected at least one planet for the free-flight no-autopilot test');

  const planetRadial = planet.position.lengthSq() > 1e-6
    ? planet.position.clone().normalize()
    : WORLD_UP.clone();
  const tangent = Math.abs(planetRadial.dot(WORLD_UP)) > 0.85
    ? new THREE.Vector3(1, 0, 0).cross(planetRadial).normalize()
    : WORLD_UP.clone().cross(planetRadial).normalize();
  const altitude = Math.max(
    planet.atmosphereRadius - planet.radius + 220,
    planet.gravityRadius * 0.36
  );
  const worldPosition = planet.position.clone().addScaledVector(planetRadial, planet.radius + altitude);
  const initialForward = tangent.clone().addScaledVector(planetRadial, 0.24).normalize();
  const initialUp = planetRadial.clone().sub(initialForward.clone().multiplyScalar(planetRadial.dot(initialForward))).normalize();
  const initialSpeed = 10.5;

  configureFreeFlightShip(
    state,
    planet,
    worldPosition,
    initialForward,
    initialUp,
    initialSpeed,
    {
      bank: 0.35,
      recaptureLock: config.shipRecaptureDelay + 8
    }
  );

  stepSim(sim, 240, NEUTRAL_CONTROLS);

  assert.strictEqual(state.ship.flightMode, 'free', 'expected the ship to stay in free flight');
  assert.strictEqual(state.ship.boundPlanet, null, 'expected the ship to remain unbound');
  assert.ok(
    Math.abs(state.speed - initialSpeed) <= 1e-6,
    `free flight should not apply atmospheric speed trim: initial=${initialSpeed.toFixed(3)} final=${state.speed.toFixed(3)}`
  );
  assert.ok(
    Math.abs(state.ship.bank) <= 0.02,
    `free-flight bank should decay to zero: bank=${state.ship.bank.toFixed(3)}`
  );
  assert.strictEqual(
    state.ship.pitchIdleTime,
    0,
    'expected free flight to avoid atmosphere-style pitch idle accumulation'
  );
  assert.ok(
    altitudeBetween(state.ship, planet) > planet.atmosphereRadius - planet.radius,
    `expected the ship to stay outside the atmosphere: altitude=${altitudeBetween(state.ship, planet).toFixed(3)} atmosphere=${(planet.atmosphereRadius - planet.radius).toFixed(3)}`
  );

  console.log(
    `PASS free-no-autopilot: speed=${state.speed.toFixed(3)} bank=${state.ship.bank.toFixed(3)} pitchIdle=${state.ship.pitchIdleTime.toFixed(3)}`
  );
}

function runFreeApproachNearPlanetNoAtmosphereAutopilotTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const planet = state.planets[1] || state.planets[0];
  assert.ok(planet, 'expected a planet for the gravity bend test');

  const planetRadial = planet.position.lengthSq() > 1e-6
    ? planet.position.clone().normalize()
    : WORLD_UP.clone();
  const tangent = Math.abs(planetRadial.dot(WORLD_UP)) > 0.85
    ? new THREE.Vector3(1, 0, 0).cross(planetRadial).normalize()
    : WORLD_UP.clone().cross(planetRadial).normalize();
  const altitude = Math.max(
    planet.atmosphereRadius - planet.radius + 120,
    planet.gravityRadius * 0.3
  );
  const worldPosition = planet.position.clone().addScaledVector(planetRadial, planet.radius + altitude);
  const initialForward = tangent.clone().addScaledVector(planetRadial, 0.10).normalize();
  const initialUp = planetRadial.clone().sub(initialForward.clone().multiplyScalar(planetRadial.dot(initialForward))).normalize();
  const initialClimbDot = initialForward.dot(planetRadial);

  configureFreeFlightShip(
    state,
    planet,
    worldPosition,
    initialForward,
    initialUp,
    9.5,
    {
      bank: 0,
      recaptureLock: config.shipRecaptureDelay + 8
    }
  );

  let minAltitude = Infinity;
  for (let i = 0; i < 240; i += 1) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    minAltitude = Math.min(minAltitude, altitudeBetween(state.ship, planet));
  }

  const finalAltitude = altitudeBetween(state.ship, planet);
  const finalForward = state.ship.forward.clone().normalize();
  const finalClimbDot = finalForward.dot(planetRadial);
  const forwardAngle = initialForward.angleTo(finalForward);

  assert.strictEqual(state.ship.flightMode, 'free', 'expected the ship to stay free during the gravity bend test');
  assert.strictEqual(state.ship.boundPlanet, null, 'expected the ship to remain unbound');
  assert.ok(
    minAltitude > planet.atmosphereRadius - planet.radius,
    `expected the bend test to stay outside the atmosphere: min=${minAltitude.toFixed(3)} atmosphere=${(planet.atmosphereRadius - planet.radius).toFixed(3)}`
  );
  assert.ok(
    forwardAngle > 0.02,
    `expected gravity to bend the nose: angle=${forwardAngle.toFixed(3)}`
  );
  assert.ok(
    Math.abs(finalClimbDot - initialClimbDot) > 0.002,
    `expected gravity to change the climb angle a little: initial=${initialClimbDot.toFixed(3)} final=${finalClimbDot.toFixed(3)}`
  );
  assert.ok(
    finalClimbDot < 0.95,
    `expected gravity not to hard-lock the nose into the planet: dot=${finalClimbDot.toFixed(3)}`
  );

  console.log(
    `PASS free-gravity-bend: angle=${forwardAngle.toFixed(3)} climb=${initialClimbDot.toFixed(3)}->${finalClimbDot.toFixed(3)} altitude=${finalAltitude.toFixed(3)}`
  );
}

function runFreeGravityCounteractTest() {
  const buildScenario = (sim) => {
    const { state } = sim;
    const planet = state.planets[1] || state.planets[0];
    assert.ok(planet, 'expected a planet for the gravity counter test');

    const planetRadial = planet.position.lengthSq() > 1e-6
      ? planet.position.clone().normalize()
      : WORLD_UP.clone();
    const tangent = Math.abs(planetRadial.dot(WORLD_UP)) > 0.85
      ? new THREE.Vector3(1, 0, 0).cross(planetRadial).normalize()
      : WORLD_UP.clone().cross(planetRadial).normalize();
    const altitude = Math.max(
      planet.atmosphereRadius - planet.radius + 120,
      planet.gravityRadius * 0.3
    );
    const worldPosition = planet.position.clone().addScaledVector(planetRadial, planet.radius + altitude);
    const initialForward = tangent.clone().addScaledVector(planetRadial, 0.10).normalize();
    const initialUp = planetRadial.clone().sub(initialForward.clone().multiplyScalar(planetRadial.dot(initialForward))).normalize();

    configureFreeFlightShip(
      state,
      planet,
      worldPosition,
      initialForward,
      initialUp,
      9.5,
      {
        bank: 0,
        recaptureLock: config.shipRecaptureDelay + 8
      }
    );

    return {
      planet,
      planetRadial,
      initialForward,
      initialUp
    };
  };

  const neutralSim = createOrbitalsSim(0xC0FFEE);
  neutralSim.bootstrapWorld();
  const neutralScenario = buildScenario(neutralSim);
  stepSim(neutralSim, 240, NEUTRAL_CONTROLS);
  const neutralForward = neutralSim.state.ship.forward.clone().normalize();
  const neutralAngle = neutralScenario.initialForward.angleTo(neutralForward);
  const variants = [
    { label: 'pitch-', controls: { pitchInput: -0.25 } },
    { label: 'pitch+', controls: { pitchInput: 0.25 } },
    { label: 'turn-', controls: { turnInput: -0.25 } },
    { label: 'turn+', controls: { turnInput: 0.25 } }
  ];

  let bestAngle = Infinity;
  let bestLabel = '';
  for (const variant of variants) {
    const sim = createOrbitalsSim(0xC0FFEE);
    sim.bootstrapWorld();
    const scenario = buildScenario(sim);
    stepSim(sim, 240, { ...NEUTRAL_CONTROLS, ...variant.controls });
    const angle = scenario.initialForward.angleTo(sim.state.ship.forward.clone().normalize());
    if (angle < bestAngle) {
      bestAngle = angle;
      bestLabel = variant.label;
    }
  }

  assert.ok(
    bestAngle < neutralAngle - 0.05,
    `player input should reduce the gravity bend: neutralAngle=${neutralAngle.toFixed(3)} bestAngle=${bestAngle.toFixed(3)} best=${bestLabel}`
  );

  console.log(
    `PASS free-gravity-counteract: neutral=${neutralAngle.toFixed(3)} best=${bestAngle.toFixed(3)} input=${bestLabel}`
  );
}

function runFreeGravityHighSpeedTest() {
  const setupScenario = (sim, speed) => {
    const { state } = sim;
    const planet = state.planets[1] || state.planets[0];
    assert.ok(planet, 'expected a planet for the gravity speed test');

    const planetRadial = planet.position.lengthSq() > 1e-6
      ? planet.position.clone().normalize()
      : WORLD_UP.clone();
    const tangent = Math.abs(planetRadial.dot(WORLD_UP)) > 0.85
      ? new THREE.Vector3(1, 0, 0).cross(planetRadial).normalize()
      : WORLD_UP.clone().cross(planetRadial).normalize();
    const altitude = Math.max(
      planet.atmosphereRadius - planet.radius + 140,
      planet.gravityRadius * 0.32
    );
    const worldPosition = planet.position.clone().addScaledVector(planetRadial, planet.radius + altitude);
    const initialForward = tangent.clone().addScaledVector(planetRadial, 0.12).normalize();
    const initialUp = planetRadial.clone().sub(initialForward.clone().multiplyScalar(planetRadial.dot(initialForward))).normalize();

    configureFreeFlightShip(
      state,
      planet,
      worldPosition,
      initialForward,
      initialUp,
      speed,
      {
        bank: 0,
        recaptureLock: config.shipRecaptureDelay + 8
      }
    );

    return {
      planet,
      initialForward
    };
  };

  const lowSim = createOrbitalsSim(0xC0FFEE);
  lowSim.bootstrapWorld();
  const lowScenario = setupScenario(lowSim, 7.5);
  stepSim(lowSim, 240, NEUTRAL_CONTROLS);
  const lowAngle = lowScenario.initialForward.angleTo(lowSim.state.ship.forward.clone().normalize());

  const highSim = createOrbitalsSim(0xC0FFEE);
  highSim.bootstrapWorld();
  const highScenario = setupScenario(highSim, 24.0);
  stepSim(highSim, 240, NEUTRAL_CONTROLS);
  const highAngle = highScenario.initialForward.angleTo(highSim.state.ship.forward.clone().normalize());

  assert.ok(
    lowAngle > highAngle + 0.02,
    `low speed should bend more than high speed: low=${lowAngle.toFixed(3)} high=${highAngle.toFixed(3)}`
  );

  console.log(`PASS free-gravity-speed: low=${lowAngle.toFixed(3)} high=${highAngle.toFixed(3)}`);
}

function runArcadeOrbitViabilityTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const planet = state.planets[1] || state.planets[0];
  assert.ok(planet, 'expected a planet for the arcade orbit test');

  const planetRadial = planet.position.lengthSq() > 1e-6
    ? planet.position.clone().normalize()
    : WORLD_UP.clone();
  const tangent = Math.abs(planetRadial.dot(WORLD_UP)) > 0.85
    ? new THREE.Vector3(1, 0, 0).cross(planetRadial).normalize()
    : WORLD_UP.clone().cross(planetRadial).normalize();
  const altitude = Math.max(
    planet.atmosphereRadius - planet.radius + 160,
    planet.gravityRadius * 0.34
  );
  const worldPosition = planet.position.clone().addScaledVector(planetRadial, planet.radius + altitude);
  const initialForward = tangent.clone().addScaledVector(planetRadial, 0.08).normalize();
  const initialUp = planetRadial.clone().sub(initialForward.clone().multiplyScalar(planetRadial.dot(initialForward))).normalize();

  configureFreeFlightShip(
    state,
    planet,
    worldPosition,
    initialForward,
    initialUp,
    10.0,
    {
      bank: 0,
      recaptureLock: config.shipRecaptureDelay + 8
    }
  );

  const initialAngle = orbitAngleAroundBody(planet.position, state.ship.position, planetRadial);
  let previousAngle = initialAngle;
  let totalArc = 0;
  let minAltitude = Infinity;
  let maxAltitude = -Infinity;

  for (let i = 0; i < 720; i += 1) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    const currentAngle = orbitAngleAroundBody(planet.position, state.ship.position, planetRadial);
    totalArc += Math.abs(unwrapAngleDelta(previousAngle, currentAngle));
    previousAngle = currentAngle;
    const altitudeNow = altitudeBetween(state.ship, planet);
    minAltitude = Math.min(minAltitude, altitudeNow);
    maxAltitude = Math.max(maxAltitude, altitudeNow);
    if (state.ship.flightMode !== 'free') {
      break;
    }
  }

  const finalAltitude = altitudeBetween(state.ship, planet);
  const finalAngle = orbitAngleAroundBody(planet.position, state.ship.position, planetRadial);

  assert.strictEqual(state.ship.flightMode, 'free', 'expected the arcade orbit test to stay in free flight');
  assert.strictEqual(state.ship.boundPlanet, null, 'expected the orbit test ship to remain unbound');
  assert.ok(
    minAltitude > planet.atmosphereRadius - planet.radius,
    `expected the orbit test to stay outside the atmosphere: min=${minAltitude.toFixed(3)} atmosphere=${(planet.atmosphereRadius - planet.radius).toFixed(3)}`
  );
  assert.ok(
    totalArc > 0.5,
    `expected an orbit-like angular sweep: arc=${totalArc.toFixed(3)}`
  );
  assert.ok(
    maxAltitude < planet.gravityRadius * 1.15,
    `expected the path to remain in the planet's gravity envelope: max=${maxAltitude.toFixed(3)} limit=${(planet.gravityRadius * 1.15).toFixed(3)}`
  );
  assert.ok(
    Math.abs(unwrapAngleDelta(initialAngle, finalAngle)) > 0.12,
    `expected the path to meaningfully curve around the planet: initial=${initialAngle.toFixed(3)} final=${finalAngle.toFixed(3)}`
  );

  console.log(
    `PASS arcade-orbit: arc=${totalArc.toFixed(3)} minAlt=${minAltitude.toFixed(3)} maxAlt=${maxAltitude.toFixed(3)} finalAlt=${finalAltitude.toFixed(3)}`
  );
}

function runProjectileFireTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  stepSim(sim, 120, NEUTRAL_CONTROLS);
  const { state } = sim;
  const ship = state.ship;
  const planet = ship.boundPlanet;
  assert.ok(planet, 'expected the ship to remain bound to a planet');

  const localUp = ship.position.clone().sub(planet.position).normalize();
  const shipForward = ship.forward.clone().normalize();
  const shipRight = localUp.clone().cross(shipForward).normalize();
  const fireDirection = shipForward.clone()
    .addScaledVector(shipRight, 0.35)
    .addScaledVector(localUp, -0.18)
    .normalize();

  sim.step(0, { ...NEUTRAL_CONTROLS, fire: true, fireDirection });

  assert.strictEqual(state.projectiles.length, 1, 'expected a single-shot burst');

  const relativeVelocity = state.projectiles[0].velocity.clone().sub(ship.velocity);
  const centerDistance = state.projectiles[0].position.distanceTo(ship.position);
  const expectedProjectileSpeed = config.shipProjectileSpeed + ship.speed * 0.35;
  const projectileSpeed = relativeVelocity.length();
  const projectileDirection = relativeVelocity.clone().normalize();

  assert.ok(
    projectileDirection.dot(fireDirection) > 0.98,
    `projectile should follow the reticle direction: dot=${projectileDirection.dot(fireDirection).toFixed(3)}`
  );
  assert.ok(
    Math.abs(projectileSpeed - expectedProjectileSpeed) < 1e-6,
    `projectile speed should use config: got=${projectileSpeed.toFixed(3)} expected=${expectedProjectileSpeed.toFixed(3)}`
  );
  assert.ok(
    centerDistance <= 0.001,
    `projectile should spawn from the ship center: distance=${centerDistance.toFixed(3)}`
  );

  console.log(
    `PASS projectile-fire: dot=${projectileDirection.dot(fireDirection).toFixed(3)} speed=${projectileSpeed.toFixed(3)} center=${centerDistance.toFixed(3)}`
  );
}

function setupProjectileHomingScenario(sim, lateralOffset) {
  const { state } = sim;
  state.enemies.length = 0;
  state.enemySquads.length = 0;
  state.enemySquad = null;
  state.enemySpawnTimer = Infinity;

  stepSim(sim, 120, NEUTRAL_CONTROLS);

  const ship = state.ship;
  const planet = ship.boundPlanet;
  assert.ok(planet, 'expected the ship to remain bound to a planet');

  const localUp = ship.position.clone().sub(planet.position).normalize();
  const shipForward = ship.forward.clone().normalize();
  const shipRight = localUp.clone().cross(shipForward).normalize();

  const targetPosition = ship.position.clone()
    .addScaledVector(shipForward, 240)
    .addScaledVector(localUp, 36);
  const targetDirection = targetPosition.clone().sub(ship.position).normalize();
  const fireDirection = targetDirection.clone().addScaledVector(shipRight, lateralOffset).normalize();
  const initialAngle = THREE.MathUtils.radToDeg(fireDirection.angleTo(targetDirection));

  const enemy = {
    id: 991,
    squadId: -1,
    position: targetPosition,
    radius: 16,
    health: 1
  };
  state.enemies.push(enemy);

  return {
    state,
    ship,
    planet,
    enemy,
    fireDirection,
    targetDirection,
    initialAngle
  };
}

function runProjectileHomingTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state, enemy, fireDirection, initialAngle } = setupProjectileHomingScenario(sim, 0.08);
  assert.ok(
    initialAngle > 4 && initialAngle < 6,
    `expected a tight assist cone hit window: angle=${initialAngle.toFixed(2)}`
  );

  sim.step(0, { ...NEUTRAL_CONTROLS, fire: true, fireDirection });
  assert.strictEqual(state.projectiles.length, 1, 'expected a single projectile to fire');

  stepSim(sim, 12, NEUTRAL_CONTROLS);
  assert.strictEqual(state.projectiles.length, 1, 'expected the projectile to still be in flight');
  assert.strictEqual(state.projectiles[0].targetEnemyId, enemy.id, 'expected the projectile to lock onto the target');

  const projectile = state.projectiles[0];
  const currentDirection = projectile.velocity.clone().normalize();
  const currentTargetDirection = enemy.position.clone().sub(projectile.position).normalize();
  const currentAngle = THREE.MathUtils.radToDeg(currentDirection.angleTo(currentTargetDirection));

  assert.ok(
    currentAngle < initialAngle,
    `expected homing to reduce the aim error: start=${initialAngle.toFixed(2)} current=${currentAngle.toFixed(2)}`
  );

  let hit = false;
  for (let i = 0; i < 300; i += 1) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    if (state.enemies.length === 0) {
      hit = true;
      break;
    }
  }

  assert.ok(hit, 'expected the projectile to home in and hit the target');
  assert.strictEqual(state.projectiles.length, 0, 'expected the projectile to be consumed on impact');
  assert.strictEqual(state.enemyExplosions.length, 1, 'expected a spark burst when the enemy explodes');

  stepSim(sim, 60, NEUTRAL_CONTROLS);
  assert.strictEqual(state.enemyExplosions.length, 0, 'expected the spark burst to fade out');

  console.log(
    `PASS projectile-homing: angle=${initialAngle.toFixed(2)}->${currentAngle.toFixed(2)} lock=${state.projectiles.length === 0 ? 'hit' : 'miss'}`
  );
}

function setupEnemyCrashScenario(sim, collisionKind) {
  const { state } = sim;
  const squad = state.enemySquads[0];
  assert.ok(squad, 'expected an enemy squad to exist for the crash test');
  const enemy = state.enemies.find((candidate) => candidate.squadId === squad.id);
  assert.ok(enemy, 'expected the first squad to have an active enemy');

  state.enemies.length = 0;
  state.enemies.push(enemy);
  state.enemySquads.length = 0;
  state.enemySquads.push(squad);
  state.enemySquad = squad;
  state.enemySpawnTimer = Infinity;

  enemy.health = 1;
  enemy.targetPlanetIndex = squad.targetPlanetIndex;
  enemy.nextPlanetIndex = squad.nextPlanetIndex;
  enemy.velocity.set(0, 0, 0);
  enemy.previousPosition.copy(enemy.position);
  enemy.relativeVelocity.set(0, 0, 0);
  enemy.speed = 0;
  enemy.boundPlanet = null;
  enemy.flightMode = 'free';
  enemy.recaptureLock = 0;

  if (collisionKind === 'sun') {
    const starRadius = config.starScale * 0.5;
    enemy.position.set(starRadius + 0.5, 0, 0);
    enemy.previousPosition.copy(enemy.position);
    enemy.forward.set(-1, 0, 0);
    enemy.up.set(0, 1, 0);
    return { state, enemy, collisionKind };
  }

  const crashPlanet = state.planets[squad.targetPlanetIndex] || state.planets[0];
  assert.ok(crashPlanet, 'expected a planet for the crash test');
  const normal = crashPlanet.position.lengthSq() > 1e-6
    ? crashPlanet.position.clone().normalize()
    : new THREE.Vector3(0, 1, 0);
  enemy.position.copy(crashPlanet.position).addScaledVector(normal, crashPlanet.radius + 0.5);
  enemy.previousPosition.copy(enemy.position);
  enemy.forward.copy(normal).multiplyScalar(-1);
  enemy.up.copy(normal);
  return { state, enemy, collisionKind };
}

function runEnemyCrashExplosionTest(collisionKind) {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = setupEnemyCrashScenario(sim, collisionKind);
  sim.step(1 / 60, NEUTRAL_CONTROLS);

  assert.strictEqual(state.enemies.length, 0, `expected the enemy to be destroyed by the ${collisionKind} collision`);
  assert.strictEqual(state.enemyExplosions.length, 1, `expected a spark burst when the enemy crashes into the ${collisionKind}`);

  stepSim(sim, 60, NEUTRAL_CONTROLS);
  assert.strictEqual(state.enemyExplosions.length, 0, 'expected the crash burst to fade out');

  console.log(`PASS enemy-crash-explosion: kind=${collisionKind}`);
}

function runProjectileHomingLimitTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state, enemy, fireDirection, initialAngle } = setupProjectileHomingScenario(sim, 0.15);
  assert.ok(
    initialAngle > 7 && initialAngle < 10,
    `expected a miss outside the tight assist cone: angle=${initialAngle.toFixed(2)}`
  );

  sim.step(0, { ...NEUTRAL_CONTROLS, fire: true, fireDirection });
  assert.strictEqual(state.projectiles.length, 1, 'expected a single projectile to fire');

  let everLocked = false;
  for (let i = 0; i < 150; i += 1) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    if (state.projectiles.length === 0) {
      break;
    }
    everLocked ||= state.projectiles[0].targetEnemyId === enemy.id;
  }

  assert.strictEqual(state.enemies.length, 1, 'expected the target to survive outside the assist cone');
  assert.strictEqual(state.projectiles.length, 1, 'expected the projectile to stay in flight outside the assist cone');
  assert.strictEqual(everLocked, false, 'expected no lock outside the assist cone');

  console.log(
    `PASS projectile-homing-limit: angle=${initialAngle.toFixed(2)} locked=${everLocked}`
  );
}

function runPlanetOrbitTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  assert.ok(state.planets.length >= 3, 'expected multiple planets in the cluster');
  const startPlanet = state.ship.boundPlanet;
  assert.ok(startPlanet, 'expected the ship to start on a planet');
  const starRadius = config.starScale * 0.5;

  const initialPositions = state.planets.map((planet) => planet.position.clone());
  const initialCenter = initialPositions
    .reduce((sum, position) => sum.add(position), new THREE.Vector3())
    .multiplyScalar(1 / initialPositions.length);
  const initialRelative = initialPositions.map((position) => position.clone().sub(initialCenter));

  let minPairRatio = Infinity;
  let maxPairRatio = 0;
  let minStarClearance = Infinity;
  const steps = 24000;

  for (let i = 0; i < steps; i += 1) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    for (let a = 0; a < state.planets.length; a += 1) {
      const planetA = state.planets[a];
      minStarClearance = Math.min(
        minStarClearance,
        planetA.position.length() - (planetA.radius + starRadius)
      );
      for (let b = a + 1; b < state.planets.length; b += 1) {
        const planetB = state.planets[b];
        const referenceRadius = Math.max(planetA.radius, planetB.radius);
        const ratio = planetA.position.distanceTo(planetB.position) / referenceRadius;
        minPairRatio = Math.min(minPairRatio, ratio);
        maxPairRatio = Math.max(maxPairRatio, ratio);
      }
    }
  }

  const finalCenter = state.planets
    .reduce((sum, planet) => sum.add(planet.position), new THREE.Vector3())
    .multiplyScalar(1 / state.planets.length);
  const orbitAngles = state.planets.map((planet, index) => {
    const finalRelative = planet.position.clone().sub(finalCenter);
    return initialRelative[index].angleTo(finalRelative);
  });
  const orbitingPlanets = orbitAngles.filter((angle) => angle > 0.02).length;

  assert.ok(
    orbitingPlanets >= Math.ceil(state.planets.length / 2),
    `expected orbit-like motion from most planets: moved=${orbitingPlanets}/${state.planets.length} angles=${orbitAngles.map((angle) => angle.toFixed(3)).join(',')}`
  );
  assert.ok(
    minPairRatio >= 2.0,
    `planets got too close: closestPairRatio=${minPairRatio.toFixed(3)}`
  );
  assert.ok(
    maxPairRatio <= 50.0,
    `planets drifted too far apart: farthestPairRatio=${maxPairRatio.toFixed(3)}`
  );
  assert.ok(
    minStarClearance >= -1e-6,
    `planets got too close to the star: starClearance=${minStarClearance.toFixed(3)}`
  );

  console.log(
    `PASS planet-orbits: moved=${orbitingPlanets}/${state.planets.length} closestPairRatio=${minPairRatio.toFixed(3)} farthestPairRatio=${maxPairRatio.toFixed(3)} starClearance=${minStarClearance.toFixed(3)}`
  );
}

function runPlanetCaptureArrivalTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const startPlanet = state.ship.boundPlanet;
  assert.ok(startPlanet, 'expected the ship to start bound to a planet');

  const targetPlanet = state.planets.find((planet) => planet !== startPlanet);
  assert.ok(targetPlanet, 'expected a second planet to exist');

  const launchNormal = targetPlanet.position.clone().sub(startPlanet.position).normalize();
  const surfaceNormal = targetPlanet.position.lengthSq() > 1e-6
    ? targetPlanet.position.clone().normalize()
    : new THREE.Vector3(0, 1, 0);
  const launchAltitude = config.planetCaptureAltitude * 0.8;
  const worldPosition = targetPlanet.position.clone().addScaledVector(surfaceNormal.clone().negate(), targetPlanet.radius + launchAltitude);
  const launchVelocity = launchNormal.clone().multiplyScalar(config.shipMinMaxSpeed);

  state.ship.boundPlanet = null;
  state.ship.flightMode = 'free';
  state.ship.recaptureLock = 0;
  state.ship.forward.copy(launchNormal);
  state.ship.up.copy(surfaceNormal);
  state.ship.bank = 0;
  state.ship.speed = config.shipMinMaxSpeed;
  state.ship.position.copy(worldPosition);
  state.ship.velocity.copy(launchVelocity);
  state.ship.relativePosition.copy(worldPosition).sub(targetPlanet.position);
  state.ship.relativeVelocity.copy(launchVelocity).sub(targetPlanet.velocity);
  state.nearestPlanet = startPlanet;
  state.nearestDistance = worldPosition.distanceTo(startPlanet.position);
  state.nearestAltitude = launchAltitude;
  state.speed = state.ship.speed;

  let capturedPlanet = null;
  let closestAltitude = Infinity;
  let captureStep = -1;
  for (let i = 0; i < 3000; i += 1) {
    const aimToTarget = targetPlanet.position.clone().sub(state.ship.position).normalize();
    state.ship.forward.copy(aimToTarget);
    state.ship.up.copy(state.ship.position.clone().sub(startPlanet.position).normalize());
    state.ship.speed = Math.max(state.ship.speed, config.shipMinMaxSpeed);
    state.ship.velocity.copy(state.ship.forward).multiplyScalar(state.ship.speed);
    sim.step(1 / 60, {
      turnInput: 0,
      pitchInput: 0,
      boost: true,
      brake: false,
      respawn: false
    });
    const altitude = altitudeBetween(state.ship, targetPlanet);
    if (i % 200 === 0) {
      console.log(
        `DEBUG approach step=${i} targetAlt=${altitude.toFixed(1)} startAlt=${altitudeBetween(state.ship, startPlanet).toFixed(1)} targetDist=${state.ship.position.distanceTo(targetPlanet.position).toFixed(1)} mode=${state.ship.flightMode} bound=${state.ship.boundPlanet ? state.ship.boundPlanet.name : 'none'} nearest=${state.nearestPlanet ? state.nearestPlanet.name : 'none'} nearestAlt=${state.nearestAltitude.toFixed(1)}`
      );
    }
    if (altitude < closestAltitude) {
      closestAltitude = altitude;
    }
    if (state.ship.boundPlanet === targetPlanet) {
      capturedPlanet = targetPlanet;
      captureStep = i;
      break;
    }
  }

  assert.ok(
    closestAltitude <= config.planetCaptureAltitude * 4,
    `expected the approach to reach the target atmosphere band: closestAltitude=${closestAltitude.toFixed(3)} capture=${config.planetCaptureAltitude.toFixed(3)}`
  );
  assert.ok(
    closestAltitude >= -1,
    `expected the approach to stay above the surface: closestAltitude=${closestAltitude.toFixed(3)}`
  );
  assert.ok(
    altitudeBetween(state.ship, targetPlanet) <= config.planetCaptureAltitude * 4,
    `expected the ship to remain in the near-atmosphere band: altitude=${altitudeBetween(state.ship, targetPlanet).toFixed(3)}`
  );

  console.log(
    `PASS planet-capture-arrival: target=${targetPlanet.name} altitude=${altitudeBetween(state.ship, targetPlanet).toFixed(3)}`
  );
}

function runPlanetCaptureBlendTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const targetPlanet = state.planets[1] || state.planets[0];
  assert.ok(targetPlanet, 'expected at least one planet');

  const surfaceNormal = targetPlanet.position.lengthSq() > 1e-6
    ? targetPlanet.position.clone().normalize()
    : new THREE.Vector3(0, 1, 0);
  const launchAltitude = Math.min(37.5, config.planetCaptureAltitude * 0.75);
  const worldPosition = targetPlanet.position.clone().addScaledVector(surfaceNormal, targetPlanet.radius + launchAltitude);
  const initialForward = surfaceNormal.clone().negate();

  state.ship.position.copy(worldPosition);
  state.ship.velocity.set(0, 0, 0);
  state.ship.forward.copy(initialForward);
  state.ship.up.copy(surfaceNormal);
  state.ship.bank = 0;
  state.ship.speed = 0;
  state.ship.boundPlanet = null;
  state.ship.flightMode = 'free';
  state.ship.recaptureLock = 0;
  state.ship.captureTimer = config.shipCaptureBlendTime;
  state.nearestPlanet = targetPlanet;
  state.nearestDistance = worldPosition.distanceTo(targetPlanet.position);
  state.nearestAltitude = launchAltitude;

  sim.step(1 / 60, NEUTRAL_CONTROLS);
  assert.strictEqual(state.ship.boundPlanet, targetPlanet, 'expected the ship to capture the target planet immediately');

  const forwardAfterCapture = state.ship.forward.clone();
  assert.ok(
    forwardAfterCapture.dot(initialForward) > 0.85,
    `capture should not snap the nose straight to the horizon on the first frame: dot=${forwardAfterCapture.dot(initialForward).toFixed(3)}`
  );

  stepSim(sim, 90, NEUTRAL_CONTROLS);
  const laterForward = state.ship.forward.clone();
  assert.ok(
    laterForward.dot(initialForward) < 0.98,
    `capture should keep blending after the first frame: dot=${laterForward.dot(initialForward).toFixed(3)}`
  );

  console.log(
    `PASS planet-capture-blend: firstDot=${forwardAfterCapture.dot(initialForward).toFixed(3)} laterDot=${laterForward.dot(initialForward).toFixed(3)}`
  );
}

function runEnemySquadMovementTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  assert.ok(state.planets.length > 0, 'expected at least one planet');
  assert.ok(state.enemies.length > 0, 'expected enemy ships to exist after bootstrap');

  const planet = state.ship.boundPlanet || state.planets[0];
  assert.ok(planet, 'expected a planet for the enemy ceiling test');
  const planetIndex = state.planets.indexOf(planet);
  assert.ok(planetIndex >= 0, 'expected the test planet to be part of the world');

  const atmosphereThickness = planet.atmosphereRadius - planet.radius;
  const radial = planet.position.lengthSq() > 1e-6
    ? planet.position.clone().normalize()
    : new THREE.Vector3(0, 1, 0);
  const tangent = Math.abs(radial.dot(new THREE.Vector3(0, 1, 0))) > 0.85
    ? new THREE.Vector3(1, 0, 0).cross(radial).normalize()
    : new THREE.Vector3(0, 1, 0).cross(radial).normalize();
  const altitude = atmosphereThickness * 0.78;
  const worldPosition = planet.position.clone().addScaledVector(radial, planet.radius + altitude);
  const initialForward = tangent.clone().addScaledVector(radial, 0.32).normalize();
  const initialUp = radial.clone().sub(initialForward.clone().multiplyScalar(radial.dot(initialForward))).normalize();

  const enemy = state.enemies[0];
  const squad = {
    id: 9999,
    mode: 'swarm',
    modeTimer: 999,
    orbitPhase: 0,
    orbitDirection: 1,
    orbitProgress: 0,
    orbitLastAngle: NaN,
    swarmDuration: 999,
    departDuration: 999,
    departPlanetIndex: -1,
    departVector: new THREE.Vector3(1, 0, 0),
    family: enemy.family || 'Standard',
    familyFiles: [],
    phase: enemy.phase || 0,
    targetPlanetIndex: planetIndex,
    nextPlanetIndex: (planetIndex + 1) % state.planets.length
  };

  state.enemies.length = 0;
  state.enemies.push(enemy);
  state.enemySquads.length = 0;
  state.enemySquads.push(squad);
  state.enemySquad = squad;
  state.enemySpawnTimer = Infinity;

  enemy.squadId = squad.id;
  enemy.targetPlanetIndex = squad.targetPlanetIndex;
  enemy.nextPlanetIndex = squad.nextPlanetIndex;
  enemy.boundPlanet = planet;
  enemy.flightMode = 'bound';
  enemy.captureTimer = config.shipCaptureBlendTime;
  enemy.recaptureLock = 0;
  enemy.pitchIdleTime = 0;
  enemy.boostTimer = 0;
  enemy.bank = 0;
  enemy.forward.copy(initialForward);
  enemy.up.copy(initialUp);
  enemy.position.copy(worldPosition);
  enemy.velocity.copy(initialForward).multiplyScalar(18);
  enemy.relativePosition.copy(worldPosition).sub(planet.position);
  enemy.relativeVelocity.copy(initialForward).multiplyScalar(18);
  enemy.speed = 18;
  state.nearestPlanet = planet;
  state.nearestDistance = worldPosition.distanceTo(planet.position);
  state.nearestAltitude = altitude;
  state.speed = enemy.speed;

  let peakAltitude = altitude;
  let peakForwardDot = initialForward.dot(radial);
  let startedDescending = false;
  let minForwardDotAfterPeak = Infinity;

  for (let i = 0; i < 360; i += 1) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    const currentAltitude = altitudeBetween(enemy, planet);
    const currentUp = enemy.position.clone().sub(planet.position).normalize();
    const currentForwardDot = enemy.forward.clone().normalize().dot(currentUp);
    if (currentAltitude > peakAltitude) {
      peakAltitude = currentAltitude;
      peakForwardDot = currentForwardDot;
    }
    if (currentAltitude <= peakAltitude - 1.5) {
      startedDescending = true;
    }
    if (startedDescending) {
      minForwardDotAfterPeak = Math.min(minForwardDotAfterPeak, currentForwardDot);
    }
  }

  const finalAltitude = altitudeBetween(enemy, planet);

  assert.ok(
    peakAltitude <= atmosphereThickness * 1.1,
    `enemy should stay in the upper-atmosphere band: peak=${peakAltitude.toFixed(3)} ceiling=${(atmosphereThickness * 1.1).toFixed(3)}`
  );
  assert.ok(
    startedDescending,
    `expected the enemy to start descending from the upper atmosphere: peak=${peakAltitude.toFixed(3)} final=${finalAltitude.toFixed(3)}`
  );
  assert.ok(
    finalAltitude < peakAltitude - 2,
    `expected the enemy altitude to bleed off after the peak: peak=${peakAltitude.toFixed(3)} final=${finalAltitude.toFixed(3)}`
  );
  assert.ok(
    minForwardDotAfterPeak < peakForwardDot - 0.05,
    `expected the enemy nose to pitch down during the stall: peakDot=${peakForwardDot.toFixed(3)} minAfter=${minForwardDotAfterPeak.toFixed(3)}`
  );

  console.log(
    `PASS enemy-squad-movement: peak=${peakAltitude.toFixed(3)} final=${finalAltitude.toFixed(3)}`
  );
}

function runEnemyFamilyIndexTest() {
  const familyEntries = Object.entries(ENEMY_MODEL_FILES_BY_FAMILY);
  assert.ok(familyEntries.length > 0, 'expected enemy family assets to be indexed');

  let totalFiles = 0;
  for (const [family, files] of familyEntries) {
    assert.ok(Array.isArray(files) && files.length > 0, `expected family ${family} to have asset files`);
    for (const file of files) {
      assert.ok(
        /^(?:Ship_[A-Za-z]+_\d+\.glb|ship_nemesis2\.glb)$/.test(file),
        `unexpected enemy asset file name: ${file}`
      );
    }
    totalFiles += files.length;
  }

  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();
  const squad = sim.state.enemySquads[0];
  assert.ok(squad, 'expected an enemy squad to spawn during bootstrap');
  assert.ok(Array.isArray(squad.familyFiles) && squad.familyFiles.length > 0, 'expected a squad family asset list');

  const familyFiles = new Set(squad.familyFiles);
  const enemies = sim.state.enemies.filter((enemy) => enemy.squadId === squad.id);
  assert.ok(enemies.length > 0, 'expected at least one enemy in the first squad');
  for (const enemy of enemies) {
    assert.strictEqual(enemy.family, squad.family, 'expected a squad to stay within one family');
    assert.ok(
      familyFiles.has(enemy.assetFile),
      `expected enemy asset ${enemy.assetFile} to come from family ${squad.family}`
    );
  }

  console.log(`PASS enemy-family-index: families=${familyEntries.length} files=${totalFiles} squadFamily=${squad.family}`);
}

runStableAltitudeTest();
runPitchResponseTest();
runAtmosphereTerrainRecoveryTest();
runAtmosphereTerrainCrashTest();
runBoostRecoveryTest();
runBoostThrustTest();
runAtmosphereBoostPitchLockTest();
runAtmosphereSoftStallTest();
runBoostDirectionTest();
runFreeBrakeDecayTest();
runFuelRechargeTest();
runSpaceNewtonianTest();
runFreeFlightMovesAlongNoseTest();
runSpaceLoopTest();
runSpaceFreeNoAutoReorientTest();
runFreeApproachNearPlanetNoAtmosphereAutopilotTest();
runFreeGravityCounteractTest();
runFreeGravityHighSpeedTest();
runArcadeOrbitViabilityTest();
runProjectileFireTest();
runProjectileHomingTest();
runProjectileHomingLimitTest();
runEnemyCrashExplosionTest('planet');
runEnemyCrashExplosionTest('sun');
runPlanetOrbitTest();
runPlanetCaptureArrivalTest();
runPlanetCaptureBlendTest();
runEnemyFamilyIndexTest();
runEnemySquadMovementTest();
