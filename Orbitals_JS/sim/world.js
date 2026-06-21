import * as THREE from '../lib/three.module.js';
import { PLANET_FILES, config } from '../orbitals_config.js';
import { buildBasisFromNormal, randomUnitVector, shuffleFiles } from './math.js';

const tempVecA = new THREE.Vector3();
const tempVecB = new THREE.Vector3();
const tempVecC = new THREE.Vector3();
const tempVecD = new THREE.Vector3();

export function createPlanetConfig(rng, index, file) {
  const scale = config.planetScale;
  const orbitScale = config.orbitScale;
  const radius = (0.16 + rng() * 0.18 + (index % 3) * 0.025) * scale;
  const atmosphereRadius = radius * (index % 2 === 0
    ? config.atmosphereRatioMin + rng() * (config.atmosphereRatioMax - config.atmosphereRatioMin)
    : config.atmosphereRatioMin + rng() * (config.atmosphereRatioMax - config.atmosphereRatioMin));
  const gravityRadius = radius * (6.8 + rng() * 3.7);
  const orbitRadius = (config.clusterRadius + index * (1.05 + rng() * 0.2) + (-0.06 + rng() * 0.12)) * orbitScale;
  const orbitRadiusB = orbitRadius * (0.96 + rng() * 0.08);
  const orbitSpeed = (0.0075 + rng() * 0.015) * (index % 2 === 0 ? 1 : -1);
  const orbitPhase = rng() * Math.PI * 2;
  const orbitPrecession = -0.0022 + rng() * 0.0044;
  const orbitTilt = randomUnitVector(rng);
  const orbitPlane = buildBasisFromNormal(orbitTilt);
  const wobbleAxis = randomUnitVector(rng);
  const surfaceOrbitPeriod = config.surfaceOrbitPeriodMin + rng() * (config.surfaceOrbitPeriodMax - config.surfaceOrbitPeriodMin);
  const gravityStrength = (4 * Math.PI * Math.PI * Math.pow(radius, 3)) / (surfaceOrbitPeriod * surfaceOrbitPeriod);
  const hueShift = -0.08 + rng() * 0.18;
  return {
    name: `Planet ${index + 1}`,
    file,
    radius,
    atmosphereRadius,
    gravityRadius,
    gravityStrength,
    surfaceOrbitPeriod,
    orbitRadius,
    orbitRadiusB,
    orbitSpeed,
    orbitPhase,
    orbitPrecession,
    orbitPlane,
    wobbleAxis,
    wobblePhase: rng() * Math.PI * 2,
    wobbleSpeed: 0.18 + rng() * 0.37,
    wobbleStrength: 0.4 + rng() * 1.3,
    spinSpeed: -0.5 + rng() * 1.3,
    hueShift,
    position: new THREE.Vector3(),
    previousPosition: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    fuelMotes: []
  };
}

export function createFuelMote(rng, planet, moteIndex) {
  const angle = rng() * Math.PI * 2;
  const bandRadius = planet.atmosphereRadius * (1.005 + rng() * 0.015);
  const bandRadiusB = bandRadius * (0.88 + rng() * 0.28);
  const orbitSpeed = (-0.7 + rng() * 1.6) * 0.22;
  return {
    planet,
    index: moteIndex,
    size: 0.06 + rng() * 0.05,
    color: moteIndex % 2 === 0 ? 0x8ff2d1 : 0x88b5ff,
    angle,
    bandRadius,
    bandRadiusB,
    orbitSpeed,
    phase: rng() * Math.PI * 2,
    pulse: rng() * Math.PI * 2,
    position: new THREE.Vector3(),
    scale: 1
  };
}

export function updateFuelMoteState(mote, dt, time, state) {
  const { planet } = mote;
  mote.angle += mote.orbitSpeed * dt;
  mote.pulse += dt * 3.2;
  const basis = planet.orbitPlane;
  const cosA = Math.cos(mote.angle);
  const sinA = Math.sin(mote.angle);
  const offset = tempVecA
    .copy(basis.tangent).multiplyScalar(cosA * mote.bandRadius)
    .addScaledVector(basis.bitangent, sinA * mote.bandRadiusB)
    .addScaledVector(basis.normal, Math.sin(time * 1.4 + mote.phase) * planet.radius * 0.08);
  mote.position.copy(offset);
  mote.scale = 0.65 + 0.25 * Math.sin(mote.pulse);

  if (state.ship && !state.crashed) {
    const moteWorldPos = tempVecB.copy(planet.position).add(mote.position);
    if (moteWorldPos.distanceTo(state.ship.position) < 0.9) {
      state.fuel = Math.min(state.maxFuel, state.fuel + 4);
      mote.angle += Math.PI * 0.6;
      mote.pulse += Math.PI * 0.8;
    }
  }
}

export function updatePlanetState(planet, dt, time) {
  const motionScale = config.planetMotionSpeedScale;
  const angle = planet.orbitPhase + time * planet.orbitSpeed * motionScale;
  const precession = time * planet.orbitPrecession * motionScale;
  const plane = planet.orbitPlane;
  const cosA = Math.cos(angle + precession);
  const sinA = Math.sin(angle * 1.03 - precession * 1.7);
  const wobble = Math.sin(time * planet.wobbleSpeed * motionScale + planet.wobblePhase);
  const wobble2 = Math.cos(time * planet.wobbleSpeed * 0.73 * motionScale + planet.wobblePhase * 1.9);

  tempVecA.copy(plane.tangent).multiplyScalar(cosA * planet.orbitRadius);
  tempVecB.copy(plane.bitangent).multiplyScalar(sinA * planet.orbitRadiusB);
  tempVecC.copy(plane.normal).multiplyScalar(wobble * planet.wobbleStrength * 2.1);
  tempVecD.copy(planet.wobbleAxis).multiplyScalar(wobble2 * planet.wobbleStrength * 1.1);

  planet.previousPosition.copy(planet.position);
  planet.position.copy(tempVecA).add(tempVecB).add(tempVecC).add(tempVecD);
  const clusterWobble = config.clusterWobble * config.orbitScale;
  planet.position.x += Math.sin(time * 0.09 * motionScale + planet.orbitPhase) * clusterWobble * 0.18;
  planet.position.y += Math.cos(time * 0.07 * motionScale + planet.orbitPhase * 0.7) * clusterWobble * 0.11;
  planet.position.z += Math.sin(time * 0.05 * motionScale + planet.orbitPhase * 1.3) * clusterWobble * 0.14;

  planet.velocity.copy(planet.position).sub(planet.previousPosition).divideScalar(Math.max(dt, 1 / 240));
}

export function relaxPlanetSeparation(planets) {
  const startFactor = Math.max(1.0, config.planetSeparationStartFactor || 5.0);
  const hardFactor = Math.max(1.0, config.planetSeparationHardFactor || 1.28);
  const strength = THREE.MathUtils.clamp(config.planetSeparationStrength ?? 0.16, 0, 1);
  for (let iteration = 0; iteration < 2; iteration += 1) {
    for (let i = 0; i < planets.length; i += 1) {
      for (let j = i + 1; j < planets.length; j += 1) {
        const a = planets[i];
        const b = planets[j];
        const pairRadius = a.radius + b.radius;
        const softDistance = pairRadius * startFactor;
        const hardDistance = pairRadius * hardFactor;
        const delta = tempVecA.copy(b.position).sub(a.position);
        const distance = delta.length();
        if (distance < 0.0001 || distance >= softDistance) {
          continue;
        }
        const softT = THREE.MathUtils.clamp((softDistance - distance) / Math.max(softDistance - hardDistance, 0.0001), 0, 1);
        const eased = softT * softT * (3 - 2 * softT);
        const push = (softDistance - distance) * 0.5 * strength * eased;
        delta.normalize().multiplyScalar(push);
        a.position.addScaledVector(delta, -1);
        b.position.add(delta);
      }
    }
  }
}

export function relaxStarSeparation(planets) {
  const starRadius = config.starScale * 0.5;
  for (let iteration = 0; iteration < 3; iteration += 1) {
    for (const planet of planets) {
      const minDistance = starRadius + planet.radius;
      const distance = planet.position.length();
      if (distance >= minDistance) {
        continue;
      }
      const direction = distance > 1e-6
        ? tempVecA.copy(planet.position).divideScalar(distance)
        : (planet.previousPosition.lengthSq() > 1e-6
          ? tempVecA.copy(planet.previousPosition).normalize()
          : tempVecA.copy(planet.orbitPlane.tangent).normalize());
      planet.position.copy(direction.multiplyScalar(minDistance));
    }
  }
}

export function pickNearestPlanet(planets, position) {
  let nearest = null;
  let nearestDistance = Infinity;
  for (const planet of planets) {
    const distance = position.distanceTo(planet.position);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = planet;
    }
  }
  return { nearest, nearestDistance };
}

export function updateFuelMotes(state, dt, time) {
  for (const mote of state.fuelMotes) {
    updateFuelMoteState(mote, dt, time, state);
  }
}

export function shufflePlanetFiles(rng) {
  return shuffleFiles(PLANET_FILES, rng);
}

export function updatePlanets(state, dt, time) {
  for (const planet of state.planets) {
    updatePlanetState(planet, dt, time);
  }
  relaxPlanetSeparation(state.planets);
  relaxStarSeparation(state.planets);
  const velocityDt = Math.max(dt, 1 / 240);
  for (const planet of state.planets) {
    planet.velocity.copy(planet.position).sub(planet.previousPosition).divideScalar(velocityDt);
  }
}
