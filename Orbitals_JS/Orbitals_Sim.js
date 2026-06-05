import * as THREE from './lib/three.module.js';

export const PLANET_FILES = [
  'planet_map_01.glb',
  'planet_map_02.glb',
  'planet_map_03.glb',
  'planet_map_04.glb',
  'planet_map_05.glb',
  'planet_map_06.glb',
  'planet_map_07.glb',
  'planet_map_08.glb',
  'planet_map_09.glb',
  'planet_map_10.glb',
  'planet_map_11.glb',
  'planet_map_12.glb',
  'planet_map_13.glb',
  'planet_map_14.glb',
  'planet_map_15.glb',
  'planet_map_16.glb',
  'planet_map_17.glb',
  'planet_map_18.glb',
  'planet_map_19.glb',
  'planet_map_20.glb',
  'planet_map_21.glb'
];

export const config = {
  planetCountMin: 6,
  planetCountMax: 9,
  planetScale: 10000,
  orbitScale: 8000,
  clusterRadius: 1.0,
  clusterWobble: 0.08,
  starfieldRadiusMin: 130000,
  starfieldRadiusMax: 340000,
  atmosphereRatioMin: 1.135,
  atmosphereRatioMax: 1.27,
  surfaceOrbitPeriodMin: 38,
  surfaceOrbitPeriodMax: 42,
  atmosphereLiftFactor: 2.45,
  fighterTurnRate: 24.0,
  fighterVelocityAlign: 8.0,
  shipCamDistance: 6.8,
  shipCamHeight: 3.0,
  shipCamLag: 20.0,
  shipIdleThrust: 4.2,
  shipMaxThrust: 26,
  shipBoostThrust: 200,
  shipBoostDuration: 4.0,
  shipFuelRecharge: 10.0,
  shipFireCooldown: 0.22,
  shipProjectileSpeed: 140,
  shipProjectileLifetime: 8.0,
  shipProjectileSpread: 0.04,
  shipProjectileSize: 0.2,
  shipMuzzleOffset: 0,
  shipBrake: 14,
  shipDragSpace: 0.2,
  shipDragAtmosphere: 20.0,
  gravitySoftening: 2.2,
  fuelMoteCountPerPlanet: 10
};

const worldUp = new THREE.Vector3(0, 1, 0);
const tempVecA = new THREE.Vector3();
const tempVecB = new THREE.Vector3();
const tempVecC = new THREE.Vector3();
const tempVecD = new THREE.Vector3();
const tempVecE = new THREE.Vector3();
const tempVecF = new THREE.Vector3();

export function parseSeed(rawValue) {
  if (rawValue == null || rawValue === '') {
    return Math.floor(Date.now()) >>> 0;
  }
  if (/^\d+$/.test(rawValue)) {
    return Number(rawValue) >>> 0;
  }
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < rawValue.length; i += 1) {
    hash ^= rawValue.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(a) {
  return function rng() {
    let t = a += 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function easeExp(value, rate) {
  return 1 - Math.exp(-Math.max(0.0001, rate) * value);
}

function randomUnitVector(rng) {
  const z = rng() * 2 - 1;
  const a = rng() * Math.PI * 2;
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  return new THREE.Vector3(Math.cos(a) * r, z, Math.sin(a) * r);
}

function buildBasisFromNormal(normal) {
  const up = normal.clone().normalize();
  const tangent = Math.abs(up.dot(worldUp)) > 0.92
    ? new THREE.Vector3(1, 0, 0).cross(up).normalize()
    : worldUp.clone().cross(up).normalize();
  const bitangent = up.clone().cross(tangent).normalize();
  return { tangent, bitangent, normal: up };
}

function shuffleFiles(files, rng) {
  const result = files.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createPlanetConfig(rng, index, file) {
  const scale = config.planetScale;
  const orbitScale = config.orbitScale;
  const radius = (0.16 + rng() * 0.18 + (index % 3) * 0.025) * scale;
  const atmosphereRadius = radius * (index % 2 === 0
    ? config.atmosphereRatioMin + rng() * (config.atmosphereRatioMax - config.atmosphereRatioMin)
    : config.atmosphereRatioMin + rng() * (config.atmosphereRatioMax - config.atmosphereRatioMin));
  const gravityRadius = radius * (6.8 + rng() * 3.7);
  const orbitRadius = (config.clusterRadius + index * (1.05 + rng() * 0.2) + (-0.06 + rng() * 0.12)) * orbitScale;
  const orbitRadiusB = orbitRadius * (0.96 + rng() * 0.08);
  const orbitSpeed = (0.015 + rng() * 0.03) * (index % 2 === 0 ? 1 : -1);
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
    fuelMotes: [],
    root: null,
    visual: null,
    halo: null
  };
}

function createFuelMote(rng, planet, moteIndex) {
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
    scale: 1,
    visual: null
  };
}

function updateFuelMoteState(mote, dt, time, state) {
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

function updatePlanetState(planet, dt, time) {
  const angle = planet.orbitPhase + time * planet.orbitSpeed;
  const precession = time * planet.orbitPrecession;
  const plane = planet.orbitPlane;
  const cosA = Math.cos(angle + precession);
  const sinA = Math.sin(angle * 1.03 - precession * 1.7);
  const wobble = Math.sin(time * planet.wobbleSpeed + planet.wobblePhase);
  const wobble2 = Math.cos(time * planet.wobbleSpeed * 0.73 + planet.wobblePhase * 1.9);

  tempVecA.copy(plane.tangent).multiplyScalar(cosA * planet.orbitRadius);
  tempVecB.copy(plane.bitangent).multiplyScalar(sinA * planet.orbitRadiusB);
  tempVecC.copy(plane.normal).multiplyScalar(wobble * planet.wobbleStrength * 2.1);
  tempVecD.copy(planet.wobbleAxis).multiplyScalar(wobble2 * planet.wobbleStrength * 1.1);

  planet.previousPosition.copy(planet.position);
  planet.position.copy(tempVecA).add(tempVecB).add(tempVecC).add(tempVecD);
  const clusterWobble = config.clusterWobble * config.orbitScale;
  planet.position.x += Math.sin(time * 0.09 + planet.orbitPhase) * clusterWobble * 0.18;
  planet.position.y += Math.cos(time * 0.07 + planet.orbitPhase * 0.7) * clusterWobble * 0.11;
  planet.position.z += Math.sin(time * 0.05 + planet.orbitPhase * 1.3) * clusterWobble * 0.14;

  planet.velocity.copy(planet.position).sub(planet.previousPosition).divideScalar(Math.max(dt, 1 / 240));
}

function relaxPlanetSeparation(planets) {
  const minGapFactor = 1.28;
  for (let iteration = 0; iteration < 3; iteration += 1) {
    for (let i = 0; i < planets.length; i += 1) {
      for (let j = i + 1; j < planets.length; j += 1) {
        const a = planets[i];
        const b = planets[j];
        const minDistance = (a.radius + b.radius) * minGapFactor;
        const delta = tempVecA.copy(b.position).sub(a.position);
        const distance = delta.length();
        if (distance < 0.0001 || distance >= minDistance) {
          continue;
        }
        const push = (minDistance - distance) * 0.5;
        delta.normalize().multiplyScalar(push);
        a.position.addScaledVector(delta, -1);
        b.position.add(delta);
      }
    }
  }
}

function pickNearestPlanet(planets, position) {
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

function createShipState() {
  return {
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    forward: new THREE.Vector3(0, 0, 1),
    gravity: new THREE.Vector3(),
    relativePosition: new THREE.Vector3(),
    relativeVelocity: new THREE.Vector3(),
    boundPlanet: null,
    bank: 0,
    boostTimer: 0,
    fireCooldown: 0,
    muzzleOffset: config.shipMuzzleOffset,
    speed: 0,
    root: null,
    visual: null,
    modelPivot: null,
    model: null
  };
}

function syncShipWorldState(ship) {
  if (!ship || !ship.boundPlanet) {
    return;
  }
  ship.position.copy(ship.boundPlanet.position).add(ship.relativePosition);
  ship.velocity.copy(ship.boundPlanet.velocity).add(ship.relativeVelocity);
}

function transferShipToPlanet(ship, nextPlanet) {
  if (!ship || !nextPlanet) {
    return;
  }
  syncShipWorldState(ship);
  ship.boundPlanet = nextPlanet;
  ship.relativePosition.copy(ship.position).sub(nextPlanet.position);
  ship.relativeVelocity.copy(ship.velocity).sub(nextPlanet.velocity);
}

function vectorLikeTo(target, value, fallback) {
  if (value && typeof value.x === 'number' && typeof value.y === 'number' && typeof value.z === 'number') {
    return target.set(value.x, value.y, value.z);
  }
  return target.copy(fallback);
}

function spawnProjectileBurst(state, ship, fireDirection) {
  if (!ship || !fireDirection) {
    return;
  }

  const localUp = ship.boundPlanet
    ? tempVecF.copy(ship.position).sub(ship.boundPlanet.position).normalize()
    : worldUp;
  const lateral = tempVecA.copy(fireDirection).cross(localUp);
  if (lateral.lengthSq() < 1e-6) {
    lateral.copy(Math.abs(fireDirection.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : worldUp).cross(fireDirection);
  }
  lateral.normalize();

  const forward = tempVecB.copy(fireDirection).normalize();
  const origin = tempVecC.copy(ship.position);
  const baseSpeed = config.shipProjectileSpeed + ship.speed * 0.35;
  const direction = tempVecD.copy(forward).normalize();
  state.projectiles.push({
    id: state.nextProjectileId,
    position: origin.clone(),
    previousPosition: origin.clone(),
    velocity: ship.velocity.clone().addScaledVector(direction, baseSpeed),
    age: 0,
    lifetime: config.shipProjectileLifetime,
    radius: config.shipProjectileSize,
    side: 0,
    spawnFrame: state.frameIndex,
    visual: null
  });
  state.nextProjectileId += 1;
}

function updateProjectiles(state, dt) {
  for (let i = state.projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = state.projectiles[i];
    if (projectile.spawnFrame === state.frameIndex) {
      continue;
    }
    projectile.age += dt;
    projectile.previousPosition.copy(projectile.position);
    projectile.position.addScaledVector(projectile.velocity, dt);

    let dead = projectile.age >= projectile.lifetime;
    if (!dead) {
      for (const planet of state.planets) {
        if (projectile.position.distanceTo(planet.position) <= planet.radius) {
          dead = true;
          break;
        }
      }
    }

    if (dead) {
      state.projectiles.splice(i, 1);
    }
  }
}

function respawnShip(state) {
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
  const flightSpeed = cruiseSpeed * (0.92 + state.rng() * 0.08);
  const spawnOffset = normal.clone().multiplyScalar(desiredRadius)
    .addScaledVector(side, -1.0 + state.rng() * 2.0);
  state.ship.boundPlanet = planet;
  state.ship.relativePosition.copy(spawnOffset);
  state.ship.relativeVelocity.copy(tangent).multiplyScalar(flightSpeed);
  syncShipWorldState(state.ship);
  state.ship.forward.copy(tangent).normalize();
  state.ship.bank = 0;
  state.ship.boostTimer = 0;
  state.ship.fireCooldown = 0;
  state.ship.muzzleOffset = config.shipMuzzleOffset;
  state.ship.speed = flightSpeed;
  state.nearestPlanet = planet;
  state.nearestDistance = state.ship.position.distanceTo(planet.position);
  state.nearestAltitude = state.nearestDistance - planet.radius;
  state.speed = state.ship.relativeVelocity.length();
  return planet;
}

function updateShipState(state, dt, controls) {
  const ship = state.ship;
  if (!ship) {
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

  if (nearestInfo.nearest && nearestInfo.nearest !== ship.boundPlanet && nearestInfo.nearestDistance < nearestInfo.nearest.atmosphereRadius * 0.95) {
    transferShipToPlanet(ship, nearestInfo.nearest);
    syncShipWorldState(ship);
    nearestInfo = pickNearestPlanet(state.planets, ship.position);
    state.nearestPlanet = nearestInfo.nearest;
    state.nearestDistance = nearestInfo.nearestDistance;
    state.nearestAltitude = nearestInfo.nearest ? Math.max(0, nearestInfo.nearestDistance - nearestInfo.nearest.radius) : 0;
  }

  const planet = ship.boundPlanet || state.nearestPlanet;
  if (!planet) {
    return;
  }

  const relativePosition = ship.relativePosition;
  const relativeVelocity = ship.relativeVelocity;
  const relativeDistance = Math.max(0.0001, relativePosition.length());
  const outward = tempVecA.copy(relativePosition).divideScalar(relativeDistance);
  const localUp = outward.clone();
  const gravityDir = tempVecB.copy(outward).multiplyScalar(-1);
  const gravityDistSq = Math.max(relativeDistance * relativeDistance, config.gravitySoftening * config.gravitySoftening);
  const gravityStrength = planet.gravityStrength / gravityDistSq;
  const atmosphereThickness = Math.max(planet.atmosphereRadius - planet.radius, 0.0001);
  const altitude = relativeDistance - planet.radius;
  const atmosphereDepth = altitude <= atmosphereThickness
    ? clamp01((planet.atmosphereRadius - relativeDistance) / atmosphereThickness)
    : 0;
  const targetAltitude = atmosphereThickness * 0.5;
  const altitudeError = THREE.MathUtils.clamp((targetAltitude - altitude) / (atmosphereThickness * 0.5), -1, 1);

  ship.gravity.copy(gravityDir.normalize().multiplyScalar(gravityStrength));

  const turnInput = THREE.MathUtils.clamp(controls.turnInput ?? 0, -1, 1);
  const pitchInput = THREE.MathUtils.clamp(controls.pitchInput ?? 0, -1, 1);
  const boostActive = Boolean(controls.boost);
  const fireActive = Boolean(controls.fire);
  const brakeActive = Boolean(controls.brake);
  const currentSpeed = Math.max(ship.speed || relativeVelocity.length(), 0.0001);
  if (boostActive && state.fuel > 0) {
    ship.boostTimer = config.shipBoostDuration;
  } else {
    ship.boostTimer = Math.max(0, ship.boostTimer - dt);
  }
  const boostLevel = config.shipBoostDuration > 0
    ? clamp01(ship.boostTimer / config.shipBoostDuration) * (state.fuel > 0 ? 1 : 0)
    : 0;
  const autopilotStrength = 1 - boostLevel * 0.75;
  const boostHoldFactor = THREE.MathUtils.lerp(1, 0.18, boostLevel);
  ship.fireCooldown = Math.max(0, ship.fireCooldown - dt);

  const targetBank = THREE.MathUtils.clamp(turnInput * 0.95, -0.95, 0.95);
  const bankReturnRate = atmosphereDepth > 0
    ? THREE.MathUtils.lerp(1.4, 3.3, atmosphereDepth) * THREE.MathUtils.lerp(0.7, 1.0, autopilotStrength)
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

  const yawRate = THREE.MathUtils.lerp(0.38, 0.98, atmosphereDepth) * THREE.MathUtils.lerp(0.55, 1.0, clamp01(currentSpeed / 6));
  if (atmosphereDepth > 0) {
    ship.forward.applyAxisAngle(localUp, -ship.bank * yawRate * dt);
  }

  const rightAxis = tempVecC.copy(localUp).cross(ship.forward);
  if (rightAxis.lengthSq() < 1e-6) {
    rightAxis.set(1, 0, 0).cross(ship.forward);
  }
  rightAxis.normalize();

  const pitchRate = THREE.MathUtils.lerp(0.28, 0.52, atmosphereDepth);
  if (Math.abs(pitchInput) > 0.001) {
    ship.forward.applyAxisAngle(rightAxis, pitchInput * pitchRate * dt);
  }

  if (atmosphereDepth > 0) {
    const horizonForward = tempVecD.copy(ship.forward).addScaledVector(localUp, -ship.forward.dot(localUp));
    if (horizonForward.lengthSq() > 1e-6) {
      horizonForward.normalize();
      const levelBlend = easeExp(dt, THREE.MathUtils.lerp(0.22, 0.75, atmosphereDepth) * autopilotStrength);
      const controlFreedom = 1 - clamp01(Math.max(Math.abs(turnInput), Math.abs(pitchInput)));
      ship.forward.lerp(horizonForward, levelBlend * controlFreedom * controlFreedom);
    }
    const trimAuthority = Math.max(0, 1 - Math.abs(pitchInput) * 1.4);
    const trimPitch = trimAuthority > 0.001
      ? THREE.MathUtils.clamp(-altitudeError * THREE.MathUtils.lerp(0.015, 0.05, atmosphereDepth) * trimAuthority * autopilotStrength, -0.14, 0.14)
      : 0;
    if (trimPitch !== 0) {
      ship.forward.applyAxisAngle(rightAxis, trimPitch * dt);
    }
    ship.bank = THREE.MathUtils.lerp(ship.bank, 0, easeExp(dt, THREE.MathUtils.lerp(0.6, 1.7, atmosphereDepth) * autopilotStrength));
  } else {
    const spaceTransitionDistance = 5000;
    const extraAltitude = Math.max(0, altitude - atmosphereThickness);
    const bankBlend = 1 - clamp01(extraAltitude / spaceTransitionDistance);
    const spaceYawRate = THREE.MathUtils.lerp(0.26, 0.72, clamp01(currentSpeed / 18));
    ship.forward.applyAxisAngle(localUp, -turnInput * spaceYawRate * dt);
    ship.bank = THREE.MathUtils.lerp(ship.bank, 0, easeExp(dt, THREE.MathUtils.lerp(0.12, 1.8, 1 - bankBlend)));
  }
  ship.forward.normalize();

  if (atmosphereDepth > 0) {
    const desiredRadius = Math.max(relativeDistance, planet.radius + 1.0);
    const surfaceSpeed = Math.sqrt(Math.max(planet.gravityStrength / Math.max(desiredRadius, 1.0), 1.0));
    const cruiseSpeed = surfaceSpeed * THREE.MathUtils.lerp(0.09, 0.14, atmosphereDepth);
    const pitchSpeedBias = THREE.MathUtils.lerp(0.55, 0.8, atmosphereDepth);
    let targetSpeed = cruiseSpeed * THREE.MathUtils.clamp(1 + pitchInput * pitchSpeedBias, 0.25, 1.9);
    if (brakeActive) {
      targetSpeed *= 0.55;
    }

    const speedBlend = easeExp(dt, THREE.MathUtils.lerp(1.15, 3.4, atmosphereDepth) * THREE.MathUtils.lerp(0.85, 1.1, 1 - boostLevel));
    ship.speed = THREE.MathUtils.lerp(currentSpeed, targetSpeed, speedBlend);
    if (brakeActive) {
      ship.speed = Math.max(0, ship.speed - config.shipBrake * 0.02 * dt);
    }

    relativeVelocity.copy(ship.forward).multiplyScalar(ship.speed);
    if (boostLevel > 0) {
      const boostImpulse = config.shipBoostThrust * boostLevel * dt;
      relativeVelocity.addScaledVector(ship.forward, boostImpulse);
      state.fuel = Math.max(0, state.fuel - dt * (0.8 + boostLevel * 3.2));
    } else if (!boostActive && ship.boostTimer <= 0 && state.fuel < state.maxFuel) {
      state.fuel = Math.min(state.maxFuel, state.fuel + config.shipFuelRecharge * dt);
    }
    ship.speed = relativeVelocity.length();
    relativePosition.addScaledVector(relativeVelocity, dt);
    const correctedDistance = Math.max(0.0001, relativePosition.length());
    const correctedOutward = tempVecA.copy(relativePosition).divideScalar(correctedDistance);
    const targetRadius = planet.radius + targetAltitude;
    const radiusError = targetRadius - correctedDistance;
    const positionCorrection = radiusError * THREE.MathUtils.lerp(0.04, 0.11, atmosphereDepth) * autopilotStrength * boostHoldFactor;
    relativePosition.addScaledVector(correctedOutward, positionCorrection);
    ship.relativeVelocity.copy(relativeVelocity);
    syncShipWorldState(ship);
    state.speed = ship.speed;
  } else {
    relativeVelocity.addScaledVector(ship.gravity, dt);
    if (boostLevel > 0) {
      const boostImpulse = config.shipBoostThrust * boostLevel * dt;
      relativeVelocity.addScaledVector(ship.forward, boostImpulse);
      state.fuel = Math.max(0, state.fuel - dt * (0.8 + boostLevel * 3.2));
    } else if (!boostActive && ship.boostTimer <= 0 && state.fuel < state.maxFuel) {
      state.fuel = Math.min(state.maxFuel, state.fuel + config.shipFuelRecharge * dt);
    }
    ship.speed = relativeVelocity.length();
    relativePosition.addScaledVector(relativeVelocity, dt);
    ship.relativeVelocity.copy(relativeVelocity);
    syncShipWorldState(ship);
    state.speed = ship.speed;
  }

  if (fireActive && ship.fireCooldown <= 0) {
    spawnProjectileBurst(state, ship, vectorLikeTo(tempVecE, controls.fireDirection, ship.forward).normalize().clone());
    ship.fireCooldown = config.shipFireCooldown;
  }

  const updatedNearest = pickNearestPlanet(state.planets, ship.position);
  state.nearestPlanet = updatedNearest.nearest;
  state.nearestDistance = updatedNearest.nearestDistance;
  state.nearestAltitude = updatedNearest.nearest ? Math.max(0, updatedNearest.nearestDistance - updatedNearest.nearest.radius) : 0;
}

function updatePlanets(state, dt, time) {
  for (const planet of state.planets) {
    updatePlanetState(planet, dt, time);
  }
  relaxPlanetSeparation(state.planets);
}

function updateFuelMotes(state, dt, time) {
  for (const mote of state.fuelMotes) {
    updateFuelMoteState(mote, dt, time, state);
  }
}

function shufflePlanetFiles(rng) {
  return shuffleFiles(PLANET_FILES, rng);
}

export function createOrbitalsSim(seed) {
  const state = {
    seed,
    rng: mulberry32(seed >>> 0),
    planets: [],
    fuelMotes: [],
    projectiles: [],
    nextProjectileId: 1,
    frameIndex: 0,
    ship: null,
    loaded: false,
    crashed: false,
    nearestPlanet: null,
    nearestAltitude: 0,
    nearestDistance: 0,
    time: 0,
    fuel: 100,
    maxFuel: 100,
    speed: 0,
    gamepadRespawnHeld: false,
    respawnPlanetIndex: 0
  };

  function bootstrapWorld() {
    state.planets.length = 0;
    state.fuelMotes.length = 0;
    state.projectiles.length = 0;
    state.frameIndex = 0;
    state.ship = createShipState();
    state.crashed = false;
    state.fuel = state.maxFuel;
    state.speed = 0;
    state.time = 0;
    state.gamepadRespawnHeld = false;

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

  function step(dt, controls = {}) {
    state.time += dt;
    state.frameIndex += 1;
    updatePlanets(state, dt, state.time);
    updateShipState(state, dt, controls);
    updateProjectiles(state, dt);
    updateFuelMotes(state, dt, state.time);
    return state;
  }

  return {
    state,
    bootstrapWorld,
    step,
    respawnShip: () => respawnShip(state)
  };
}
