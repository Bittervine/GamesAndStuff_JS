import assert from 'node:assert/strict';
import * as THREE from './lib/three.module.js';
import { createOrbitalsSim } from './Orbitals_Sim.js';
import { config } from './orbitals_config.js';

const NEUTRAL_CONTROLS = {
  turnInput: 0,
  pitchInput: 0,
  boost: false,
  brake: false,
  respawn: false
};

function altitudeBetween(ship, planet) {
  return ship.position.distanceTo(planet.position) - planet.radius;
}

function stepSim(sim, steps, controls) {
  for (let i = 0; i < steps; i += 1) {
    sim.step(1 / 60, controls);
  }
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
    diveDot < -0.2,
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
    Math.abs(recoveredAltitude - baselineAltitude) <= Math.max(0.6, atmosphereThickness * 0.01),
    `neutral controls should return to cruise altitude: baseline=${baselineAltitude.toFixed(3)} recovered=${recoveredAltitude.toFixed(3)}`
  );

  console.log(
    `PASS pitch-response: baseline=${baselineSpeed.toFixed(3)} dive=${diveSpeed.toFixed(3)} climb=${climbSpeed.toFixed(3)} recoveredDot=${recoveredDot.toFixed(3)}`
  );
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
    boostedSpeed > baselineSpeed + 12,
    `boost should raise speed: baseline=${baselineSpeed.toFixed(3)} boosted=${boostedSpeed.toFixed(3)}`
  );
  assert.ok(
    boostedAltitude > baselineAltitude + 20,
    `boost should climb away from the cruise band: baseline=${baselineAltitude.toFixed(3)} boosted=${boostedAltitude.toFixed(3)}`
  );

  stepSim(sim, recoveryFrames, NEUTRAL_CONTROLS);
  const settledPlanet = state.ship.boundPlanet;
  const settledAltitude = altitudeBetween(state.ship, settledPlanet);
  const settledSpeed = state.speed;
  const settledThickness = settledPlanet.atmosphereRadius - settledPlanet.radius;
  const settledDot = state.ship.forward.clone().normalize().dot(state.ship.position.clone().sub(settledPlanet.position).normalize());
  const stillInAtmosphere = settledAltitude <= settledThickness;

  assert.ok(settledPlanet, 'expected the ship to remain bound to a planet after recovery');
  if (stillInAtmosphere) {
    assert.ok(
      Math.abs(settledDot) <= 0.18,
      `ship should re-level after boost: dot=${settledDot.toFixed(3)}`
    );
    assert.ok(
      Math.abs(settledAltitude - settledThickness * 0.5) <= Math.max(8, settledThickness * 0.12),
      `ship should return to mid-atmosphere cruise: altitude=${settledAltitude.toFixed(3)} target=${(settledThickness * 0.5).toFixed(3)}`
    );
  } else {
    assert.ok(
      state.ship.forward.clone().normalize().dot(boostedForward) > 0.95,
      `space flight should preserve attitude after leaving the atmosphere: dot=${state.ship.forward.clone().normalize().dot(boostedForward).toFixed(3)}`
    );
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
    boostTravel > baselineTravel + 8,
    `boost should push the ship forward along the nose: baselineTravel=${baselineTravel.toFixed(3)} boostTravel=${boostTravel.toFixed(3)}`
  );
  assert.ok(
    boostSpeed > baselineStartSpeed + 6,
    `boost should raise forward speed: baseline=${baselineStartSpeed.toFixed(3)} boost=${boostSpeed.toFixed(3)}`
  );

  console.log(
    `PASS boost-thrust: baselineTravel=${baselineTravel.toFixed(3)} boostTravel=${boostTravel.toFixed(3)} boostSpeed=${boostSpeed.toFixed(3)}`
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
    recoveredFuel > fuelAfterDecay + 1,
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
  const altitude = planet.atmosphereRadius - planet.radius + 5200;
  const worldPosition = planet.position.clone().addScaledVector(up, planet.radius + altitude);

  state.ship.boundPlanet = planet;
  state.ship.relativePosition.copy(worldPosition).sub(planet.position);
  state.ship.relativeVelocity.copy(tangent).multiplyScalar(24);
  state.ship.position.copy(worldPosition);
  state.ship.velocity.copy(tangent).multiplyScalar(24);
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
    finalForward.dot(initialForward) > 0.97,
    `space flight should keep the nose aligned: dot=${finalForward.dot(initialForward).toFixed(3)}`
  );
  assert.ok(
    travelVector.dot(initialForward.clone().negate()) > 0.95,
    `space flight should move along the current space heading: dot=${travelVector.dot(initialForward.clone().negate()).toFixed(3)}`
  );
  assert.ok(
    Math.abs(finalAltitude - initialAltitude) < 30,
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
  const altitude = planet.atmosphereRadius - planet.radius + 9000;
  const worldPosition = planet.position.clone().addScaledVector(up, planet.radius + altitude);

  state.ship.boundPlanet = planet;
  state.ship.relativePosition.copy(worldPosition).sub(planet.position);
  state.ship.relativeVelocity.copy(tangent).multiplyScalar(24);
  state.ship.position.copy(worldPosition);
  state.ship.velocity.copy(tangent).multiplyScalar(24);
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

function runSpaceRecoveryFlipTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const planet = state.ship.boundPlanet;
  assert.ok(planet, 'expected the ship to start bound to a planet');

  const up = state.ship.position.clone().sub(planet.position).normalize();
  const tangent = Math.abs(up.dot(new THREE.Vector3(0, 1, 0))) > 0.85
    ? new THREE.Vector3(1, 0, 0).cross(up).normalize()
    : new THREE.Vector3(0, 1, 0).cross(up).normalize();
  const altitude = 5000;
  const worldPosition = planet.position.clone().addScaledVector(up, planet.radius + altitude);

  state.ship.boundPlanet = planet;
  state.ship.relativePosition.copy(worldPosition).sub(planet.position);
  state.ship.relativeVelocity.copy(tangent).multiplyScalar(24);
  state.ship.position.copy(worldPosition);
  state.ship.velocity.copy(tangent).multiplyScalar(24);
  state.ship.forward.copy(tangent).normalize();
  state.ship.up.copy(up);
  state.ship.bank = 0;
  state.ship.speed = state.ship.relativeVelocity.length();
  state.nearestPlanet = planet;
  state.nearestDistance = worldPosition.distanceTo(planet.position);
  state.nearestAltitude = altitude;
  state.speed = state.ship.speed;

  stepSim(sim, 120, { ...NEUTRAL_CONTROLS, pitchInput: -1 });
  const invertedUp = state.ship.up.clone();
  stepSim(sim, 90, NEUTRAL_CONTROLS);
  const recoveredUp = state.ship.up.clone();
  const worldUp = new THREE.Vector3(0, 1, 0);

  assert.ok(
    invertedUp.dot(up) < 0.7,
    `continuous pitch should allow the ship to invert: dot=${invertedUp.dot(up).toFixed(3)}`
  );
  assert.ok(
    recoveredUp.dot(worldUp) > 0.5,
    `idle recovery should right the ship after about 1 second: dot=${recoveredUp.dot(worldUp).toFixed(3)}`
  );

  console.log(
    `PASS space-recovery-flip: inverted=${invertedUp.dot(up).toFixed(3)} recovered=${recoveredUp.dot(worldUp).toFixed(3)}`
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

  assert.ok(
    relativeVelocity.normalize().dot(fireDirection) > 0.98,
    `projectile should follow the reticle direction: dot=${relativeVelocity.normalize().dot(fireDirection).toFixed(3)}`
  );
  assert.ok(
    centerDistance <= 0.001,
    `projectile should spawn from the ship center: distance=${centerDistance.toFixed(3)}`
  );

  console.log(
    `PASS projectile-fire: dot=${relativeVelocity.normalize().dot(fireDirection).toFixed(3)} center=${centerDistance.toFixed(3)}`
  );
}

function runPlanetOrbitTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  assert.ok(state.planets.length >= 3, 'expected multiple planets in the cluster');
  const startPlanet = state.ship.boundPlanet;
  assert.ok(startPlanet, 'expected the ship to start on a planet');

  const initialPositions = state.planets.map((planet) => planet.position.clone());
  const initialCenter = initialPositions
    .reduce((sum, position) => sum.add(position), new THREE.Vector3())
    .multiplyScalar(1 / initialPositions.length);
  const initialRelative = initialPositions.map((position) => position.clone().sub(initialCenter));

  let minPairRatio = Infinity;
  let maxPairRatio = 0;
  const steps = 24000;

  for (let i = 0; i < steps; i += 1) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    for (let a = 0; a < state.planets.length; a += 1) {
      for (let b = a + 1; b < state.planets.length; b += 1) {
        const planetA = state.planets[a];
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

  console.log(
    `PASS planet-orbits: moved=${orbitingPlanets}/${state.planets.length} closestPairRatio=${minPairRatio.toFixed(3)} farthestPairRatio=${maxPairRatio.toFixed(3)}`
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

  const startNormal = state.ship.position.clone().sub(startPlanet.position).normalize();
  const startAltitude = altitudeBetween(state.ship, startPlanet);
  const maxSteps = 2400;
  let capturedPlanet = null;
  let closestPlanet = null;
  let closestAltitude = Infinity;
  let captureStep = -1;

  state.ship.forward.copy(targetPlanet.position.clone().sub(state.ship.position).normalize());
  state.ship.up.copy(startNormal);
  state.ship.bank = 0;
  state.ship.speed = state.speed;
  state.ship.relativeVelocity.copy(state.ship.forward).multiplyScalar(state.ship.speed);
  state.ship.velocity.copy(state.ship.relativeVelocity);
  state.nearestPlanet = startPlanet;
  state.nearestDistance = state.ship.position.distanceTo(startPlanet.position);
  state.nearestAltitude = startAltitude;

  for (let i = 0; i < maxSteps; i += 1) {
    const aimToTarget = targetPlanet.position.clone().sub(state.ship.position).normalize();
    state.ship.forward.copy(aimToTarget);
    state.ship.up.copy(state.ship.position.clone().sub(startPlanet.position).normalize());
    state.ship.relativeVelocity.copy(state.ship.forward).multiplyScalar(Math.max(state.ship.speed, config.shipMinMaxSpeed));
    state.ship.velocity.copy(state.ship.relativeVelocity);
    sim.step(1 / 60, {
      turnInput: 0,
      pitchInput: 0,
      boost: true,
      brake: false,
      respawn: false
    });
    const altitude = altitudeBetween(state.ship, targetPlanet);
    if (altitude < closestAltitude) {
      closestAltitude = altitude;
      closestPlanet = state.ship.boundPlanet ? state.ship.boundPlanet.name : null;
    }
    if (state.ship.boundPlanet === targetPlanet) {
      capturedPlanet = targetPlanet;
      captureStep = i;
      break;
    }
  }

  console.log(
    `DEBUG planet-capture-arrival: target=${targetPlanet.name} captured=${capturedPlanet ? 'yes' : 'no'} captureStep=${captureStep} closestAltitude=${closestAltitude.toFixed(3)} bound=${state.ship.boundPlanet ? state.ship.boundPlanet.name : 'none'}`
  );

  assert.ok(capturedPlanet, 'expected the ship to capture the target planet during arrival');
  assert.ok(
    altitudeBetween(state.ship, targetPlanet) <= config.planetCaptureAltitude,
    `expected capture within atmosphere: altitude=${altitudeBetween(state.ship, targetPlanet).toFixed(3)}`
  );

  console.log(
    `PASS planet-capture-arrival: target=${targetPlanet.name} altitude=${altitudeBetween(state.ship, targetPlanet).toFixed(3)}`
  );
}

runStableAltitudeTest();
runPitchResponseTest();
runBoostRecoveryTest();
runBoostThrustTest();
runBoostDirectionTest();
runFuelRechargeTest();
runSpaceNewtonianTest();
runSpaceLoopTest();
runSpaceRecoveryFlipTest();
runProjectileFireTest();
runPlanetOrbitTest();
runPlanetCaptureArrivalTest();
