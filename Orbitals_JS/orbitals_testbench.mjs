import assert from 'node:assert/strict';
import * as THREE from './lib/three.module.js';
import { createOrbitalsSim, ENEMY_MODEL_FILES_BY_FAMILY } from './Orbitals_Sim.js';
import { config } from './orbitals_config.js';

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
  const altitude = Math.min(config.atmosphereControlAltitude * 0.6, planet.atmosphereRadius - planet.radius - 0.2);
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

function runFuelRechargeTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  stepSim(sim, 240, NEUTRAL_CONTROLS);
  stepSim(sim, 180, { ...NEUTRAL_CONTROLS, boost: true });
  const fuelAfterBoost = sim.state.fuel;

  stepSim(sim, 180, NEUTRAL_CONTROLS);
  const fuelAfterDecay = sim.state.fuel;

  stepSim(sim, 240, NEUTRAL_CONTROLS);
  const recoveredFuel = sim.state.fuel;

  assert.ok(
    recoveredFuel > fuelAfterDecay + 0.05,
    `fuel should recharge over time: afterDecay=${fuelAfterDecay.toFixed(3)} recovered=${recoveredFuel.toFixed(3)}`
  );
  assert.ok(
    recoveredFuel <= sim.state.maxFuel,
    `fuel recharge should not exceed max: recovered=${recoveredFuel.toFixed(3)} max=${sim.state.maxFuel.toFixed(3)}`
  );

  console.log(
    `PASS fuel-recharge: afterBoost=${fuelAfterBoost.toFixed(3)} afterDecay=${fuelAfterDecay.toFixed(3)} recovered=${recoveredFuel.toFixed(3)}`
  );
}

function runSpaceNewtonianTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const planet = state.ship.boundPlanet;
  assert.ok(planet, 'expected the ship to start bound to a planet');

  const up = state.ship.position.clone().sub(planet.position).normalize();
  const tangent = Math.abs(up.dot(new THREE.Vector3(0, 1, 0))) > 0.85
    ? new THREE.Vector3(1, 0, 0).cross(up).normalize()
    : new THREE.Vector3(0, 1, 0).cross(up).normalize();
  const altitude = planet.atmosphereRadius - planet.radius + 520;
  const worldPosition = planet.position.clone().addScaledVector(up, planet.radius + altitude);

  state.ship.boundPlanet = planet;
  state.ship.relativePosition.copy(worldPosition).sub(planet.position);
  state.ship.relativeVelocity.copy(tangent).multiplyScalar(2.4);
  state.ship.position.copy(worldPosition);
  state.ship.velocity.copy(tangent).multiplyScalar(2.4);
  state.ship.forward.copy(tangent).addScaledVector(up, 0.25).normalize();
  state.ship.bank = 0.25;
  state.ship.speed = state.ship.relativeVelocity.length();
  state.nearestPlanet = planet;
  state.nearestDistance = worldPosition.distanceTo(planet.position);
  state.nearestAltitude = altitude;
  state.speed = state.ship.speed;

  const initialForward = state.ship.forward.clone();
  const initialAltitude = altitudeBetween(state.ship, planet);
  const initialPosition = state.ship.position.clone();

  stepSim(sim, 120, NEUTRAL_CONTROLS);

  const finalAltitude = altitudeBetween(state.ship, planet);
  const finalForward = state.ship.forward.clone();
  const travelVector = state.ship.position.clone().sub(initialPosition).normalize();

  assert.ok(
    finalForward.dot(initialForward) > 0.93,
    `space flight should keep the nose aligned: dot=${finalForward.dot(initialForward).toFixed(3)}`
  );
  assert.ok(
    travelVector.dot(initialForward) > 0.9,
    `space flight should move along the current space heading: dot=${travelVector.dot(initialForward).toFixed(3)}`
  );
  assert.ok(
    Math.abs(finalAltitude - initialAltitude) < 10,
    `space flight should stay locally stable without inertia: initial=${initialAltitude.toFixed(3)} final=${finalAltitude.toFixed(3)}`
  );

  console.log(
    `PASS space-nose-flight: initial=${initialAltitude.toFixed(3)} final=${finalAltitude.toFixed(3)} dot=${finalForward.dot(initialForward).toFixed(3)}`
  );
}

function runSpaceLoopTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const planet = state.ship.boundPlanet;
  assert.ok(planet, 'expected the ship to start bound to a planet');

  const up = state.ship.position.clone().sub(planet.position).normalize();
  const tangent = Math.abs(up.dot(new THREE.Vector3(0, 1, 0))) > 0.85
    ? new THREE.Vector3(1, 0, 0).cross(up).normalize()
    : new THREE.Vector3(0, 1, 0).cross(up).normalize();
  const altitude = planet.atmosphereRadius - planet.radius + 900;
  const worldPosition = planet.position.clone().addScaledVector(up, planet.radius + altitude);

  state.ship.boundPlanet = planet;
  state.ship.relativePosition.copy(worldPosition).sub(planet.position);
  state.ship.relativeVelocity.copy(tangent).multiplyScalar(2.4);
  state.ship.position.copy(worldPosition);
  state.ship.velocity.copy(tangent).multiplyScalar(2.4);
  state.ship.forward.copy(tangent).normalize();
  state.ship.up.copy(up);
  state.ship.bank = 0;
  state.ship.speed = state.ship.relativeVelocity.length();
  state.nearestPlanet = planet;
  state.nearestDistance = worldPosition.distanceTo(planet.position);
  state.nearestAltitude = altitude;
  state.speed = state.ship.speed;

  const initialForward = state.ship.forward.clone();
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
  const planet = state.ship.boundPlanet;
  assert.ok(planet, 'expected the ship to start bound to a planet');

  const up = state.ship.position.clone().sub(planet.position).normalize();
  const tangent = Math.abs(up.dot(new THREE.Vector3(0, 1, 0))) > 0.85
    ? new THREE.Vector3(1, 0, 0).cross(up).normalize()
    : new THREE.Vector3(0, 1, 0).cross(up).normalize();
  const altitude = 50000;
  const worldPosition = planet.position.clone().addScaledVector(up, planet.radius + altitude);
  const initialForward = tangent.clone().addScaledVector(up, 0.25).normalize();
  const initialUp = initialForward.clone().cross(tangent).normalize();

  state.ship.boundPlanet = planet;
  state.ship.relativePosition.copy(worldPosition).sub(planet.position);
  state.ship.relativeVelocity.copy(tangent).multiplyScalar(2.4);
  state.ship.position.copy(worldPosition);
  state.ship.velocity.copy(tangent).multiplyScalar(2.4);
  state.ship.forward.copy(initialForward);
  state.ship.up.copy(initialUp);
  state.ship.bank = 0.45;
  state.ship.speed = state.ship.relativeVelocity.length();
  state.nearestPlanet = planet;
  state.nearestDistance = worldPosition.distanceTo(planet.position);
  state.nearestAltitude = altitude;
  state.speed = state.ship.speed;

  stepSim(sim, 180, NEUTRAL_CONTROLS);
  const finalForward = state.ship.forward.clone();
  const finalUp = state.ship.up.clone();

  assert.ok(
    finalForward.dot(initialForward) > 0.89,
    `free flight should not auto-reorient the nose: dot=${finalForward.dot(initialForward).toFixed(3)}`
  );
  assert.ok(
    finalUp.dot(initialUp) > 0.89,
    `free flight should not auto-reorient the ship up vector: dot=${finalUp.dot(initialUp).toFixed(3)}`
  );
  assert.ok(
    Math.abs(state.ship.bank) < 0.08,
    `free-flight bank should decay slowly toward level: bank=${state.ship.bank.toFixed(3)}`
  );

  console.log(
    `PASS space-free-no-auto-reorient: forward=${finalForward.dot(initialForward).toFixed(3)} up=${finalUp.dot(initialUp).toFixed(3)} bank=${state.ship.bank.toFixed(3)}`
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
  const launchAltitude = Math.min(config.atmosphereControlAltitude * 0.75, config.planetCaptureAltitude * 0.75);
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
runFuelRechargeTest();
runSpaceNewtonianTest();
runSpaceLoopTest();
runSpaceFreeNoAutoReorientTest();
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
