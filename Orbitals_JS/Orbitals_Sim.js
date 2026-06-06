import * as THREE from './lib/three.module.js';
import { PLANET_FILES, config } from './orbitals_config.js';

const worldUp = new THREE.Vector3(0, 1, 0);
const tempVecA = new THREE.Vector3();
const tempVecB = new THREE.Vector3();
const tempVecC = new THREE.Vector3();
const tempVecD = new THREE.Vector3();
const tempVecE = new THREE.Vector3();
const tempVecF = new THREE.Vector3();

const ENEMY_FAMILIES = [
  'Standard',
  'Crosspanel',
  'FlyingSaucer',
  'DeltaWing',
  'Pirate',
  'Orca',
  'Longwing',
  'TwoHoop',
  'TigerWing',
  'LunarCourier',
  'Hooper',
  'ManraRay',
  'PyramidLifter',
  'Nemesis'
];

const ENEMY_SPAWN_DELAY_MIN = 0.8;
const ENEMY_SPAWN_DELAY_MAX = 2.0;
const ENEMY_MAX_SQUADS = 8;
const ENEMY_SQUAD_SIZE_MIN = 12;
const ENEMY_SQUAD_SIZE_MAX = 22;
const ENEMY_APPROACH_ALTITUDE = 0.92;
const ENEMY_SWARM_ALTITUDE = 0.54;
const ENEMY_DEPART_ALTITUDE = 1.05;
const ENEMY_HIT_RADIUS = 2.6;
const ENEMY_SPEED_SCALE_MIN = 0.34;
const ENEMY_SPEED_SCALE_MAX = 0.58;
const ENEMY_TURN_RATE_MIN = 1.5;
const ENEMY_TURN_RATE_MAX = 2.6;
const ENEMY_UP_RATE_MIN = 1.0;
const ENEMY_UP_RATE_MAX = 1.9;
const ENEMY_SWARM_DURATION_MIN = 60.0;
const ENEMY_SWARM_DURATION_MAX = 120.0;
const ENEMY_DEPART_DURATION_MIN = 8.0;
const ENEMY_DEPART_DURATION_MAX = 16.0;

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

function relaxStarSeparation(planets) {
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
    up: new THREE.Vector3(0, 1, 0),
    gravity: new THREE.Vector3(),
    relativePosition: new THREE.Vector3(),
    relativeVelocity: new THREE.Vector3(),
    boundPlanet: null,
    flightMode: 'bound',
    captureTimer: config.shipCaptureBlendTime,
    bank: 0,
    boostTimer: 0,
    fireCooldown: 0,
    pitchIdleTime: 0,
    recaptureLock: 0,
    muzzleOffset: config.shipMuzzleOffset,
    speed: 0,
    root: null,
    visual: null,
    modelPivot: null,
    model: null,
    engineEffects: null
  };
}

function createEnemyState() {
  return {
    id: 0,
    squadId: 0,
    family: '',
    assetFile: '',
    position: new THREE.Vector3(),
    previousPosition: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    forward: new THREE.Vector3(0, 0, 1),
    up: new THREE.Vector3(0, 1, 0),
    bank: 0,
    speed: 0,
    radius: ENEMY_HIT_RADIUS,
    health: 1,
    speedScale: 1,
    turnScale: 1,
    upScale: 1,
    formationAngle: 0,
    formationRadius: 0,
    phase: 0,
    mode: 'approach',
    targetPlanetIndex: 0,
    nextPlanetIndex: 0,
    modeTimer: 0,
    root: null,
    visual: null,
    modelPivot: null,
    model: null
  };
}

function pickRandomPlanetIndex(state, excludeIndex = -1) {
  if (state.planets.length === 0) {
    return -1;
  }
  if (state.planets.length === 1) {
    return 0;
  }
  let index = Math.floor(state.rng() * state.planets.length);
  if (index === excludeIndex) {
    index = (index + 1 + Math.floor(state.rng() * (state.planets.length - 1))) % state.planets.length;
  }
  return index;
}

function pickEnemyFamily(state) {
  return ENEMY_FAMILIES[Math.floor(state.rng() * ENEMY_FAMILIES.length)];
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

function createEnemySquadState(state, targetPlanetIndex = -1) {
  const targetIndex = targetPlanetIndex >= 0 ? targetPlanetIndex : pickRandomPlanetIndex(state);
  const nextPlanetIndex = pickRandomPlanetIndex(state, targetIndex);
  const family = pickEnemyFamily(state);
  return {
    id: state.nextEnemySquadId,
    family,
    assetFile: '',
    targetPlanetIndex: targetIndex,
    nextPlanetIndex,
    mode: 'approach',
    modeTimer: 0,
    spawnTimer: 0,
    orbitDirection: state.rng() < 0.5 ? -1 : 1,
    swarmDuration: ENEMY_SWARM_DURATION_MIN + state.rng() * (ENEMY_SWARM_DURATION_MAX - ENEMY_SWARM_DURATION_MIN),
    departDuration: ENEMY_DEPART_DURATION_MIN + state.rng() * (ENEMY_DEPART_DURATION_MAX - ENEMY_DEPART_DURATION_MIN)
  };
}

function createEnemyWave(state, squad) {
  const planet = state.planets[squad.targetPlanetIndex];
  if (!planet) {
    return;
  }
  const enemyCount = Math.floor(state.rng() * (ENEMY_SQUAD_SIZE_MAX - ENEMY_SQUAD_SIZE_MIN + 1)) + ENEMY_SQUAD_SIZE_MIN;
  const radial = state.ship && state.ship.boundPlanet === planet
    ? state.ship.position.clone().sub(planet.position).normalize()
    : planet.position.lengthSq() > 1e-6
      ? planet.position.clone().normalize()
      : new THREE.Vector3(0, 1, 0);
  const basis = buildBasisFromNormal(radial);
  const spawnDistance = planet.atmosphereRadius + 800 + state.rng() * 1400;
  const spawnCenter = tempVecA.copy(planet.position).addScaledVector(radial, spawnDistance);
  const file = squad.assetFile || '';

  for (let i = 0; i < enemyCount; i += 1) {
    const enemy = createEnemyState();
    const ringAngle = (i / Math.max(1, enemyCount)) * Math.PI * 2 + state.rng() * 0.35;
    const ringRadius = 120 + state.rng() * 260;
    const ringOffset = tempVecB.copy(basis.tangent).multiplyScalar(Math.cos(ringAngle) * ringRadius)
      .addScaledVector(basis.bitangent, Math.sin(ringAngle) * ringRadius * 0.82);
    enemy.id = state.nextEnemyId;
    enemy.squadId = squad.id;
    enemy.family = squad.family;
    enemy.assetFile = file;
    enemy.position.copy(spawnCenter).add(ringOffset);
    enemy.previousPosition.copy(enemy.position);
    enemy.forward.copy(tempVecC.copy(planet.position).sub(enemy.position).normalize());
    enemy.up.copy(radial);
    enemy.bank = 0;
    enemy.speed = 0;
    enemy.speedScale = ENEMY_SPEED_SCALE_MIN + state.rng() * (ENEMY_SPEED_SCALE_MAX - ENEMY_SPEED_SCALE_MIN);
    enemy.turnScale = ENEMY_TURN_RATE_MIN + state.rng() * (ENEMY_TURN_RATE_MAX - ENEMY_TURN_RATE_MIN);
    enemy.upScale = ENEMY_UP_RATE_MIN + state.rng() * (ENEMY_UP_RATE_MAX - ENEMY_UP_RATE_MIN);
    enemy.formationAngle = ringAngle;
    enemy.formationRadius = 140 + state.rng() * 320;
    enemy.phase = state.rng() * Math.PI * 2;
    enemy.mode = 'approach';
    enemy.targetPlanetIndex = squad.targetPlanetIndex;
    enemy.nextPlanetIndex = squad.nextPlanetIndex;
    state.enemies.push(enemy);
    state.nextEnemyId += 1;
  }
}

function spawnEnemySquad(state, targetPlanetIndex = -1) {
  if (!state.planets.length) {
    return null;
  }
  const squad = createEnemySquadState(state, targetPlanetIndex);
  state.nextEnemySquadId += 1;
  createEnemyWave(state, squad);
  state.enemySquads.push(squad);
  state.enemySquad = squad;
  state.enemySpawnTimer = ENEMY_SPAWN_DELAY_MIN + state.rng() * (ENEMY_SPAWN_DELAY_MAX - ENEMY_SPAWN_DELAY_MIN);
  return squad;
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
  ship.flightMode = 'bound';
  ship.relativePosition.copy(ship.position).sub(nextPlanet.position);
  ship.relativeVelocity.copy(ship.velocity).sub(nextPlanet.velocity);
}

function beginPlanetCapture(ship, capturePlanet) {
  if (!ship || !capturePlanet) {
    return;
  }
  transferShipToPlanet(ship, capturePlanet);
  ship.captureTimer = 0;
  ship.recaptureLock = 0;
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

    if (!dead && state.enemies.length > 0) {
      for (let j = state.enemies.length - 1; j >= 0; j -= 1) {
        const enemy = state.enemies[j];
        const hitRadius = enemy.radius + projectile.radius;
        if (projectile.position.distanceTo(enemy.position) <= hitRadius) {
          enemy.health -= 1;
          state.enemies.splice(j, 1);
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

function computeEnemyTargetPoint(state, enemy, squad, planet, time) {
  const radial = planet.position.lengthSq() > 1e-6
    ? tempVecA.copy(planet.position).normalize()
    : tempVecA.copy(worldUp);
  const basis = buildBasisFromNormal(radial);
  const straightWindow = squad.mode === 'swarm' && Math.sin(time * 0.045 + enemy.phase) > -0.15;
  const orbitScale = squad.mode === 'swarm'
    ? (straightWindow ? 0.0 : 0.12)
    : squad.mode === 'depart'
      ? 0.0
      : 0.04;
  const orbitSpeed = squad.mode === 'swarm'
    ? (straightWindow ? 0.0 : 0.035)
    : squad.mode === 'depart'
      ? 0.0
      : 0.01;
  const atmosphereThickness = Math.max(planet.atmosphereRadius - planet.radius, 1.0);
  const captureAltitude = config.planetCaptureAltitude;
  const swarmAltitude = Math.min(captureAltitude, atmosphereThickness * 0.98);
  const approachAltitude = Math.min(captureAltitude * 0.9, atmosphereThickness * 0.95);
  const departAltitude = Math.max(captureAltitude * 1.35, atmosphereThickness * 1.05);
  if (squad.mode === 'depart') {
    return tempVecC.copy(planet.position).addScaledVector(radial, captureAltitude);
  }
  const altitude = planet.radius + atmosphereThickness * (
    squad.mode === 'swarm'
      ? swarmAltitude / atmosphereThickness
      : squad.mode === 'depart'
        ? departAltitude / atmosphereThickness
        : approachAltitude / atmosphereThickness
  );
  const orbitAngle = enemy.formationAngle + time * squad.orbitDirection * orbitSpeed;
  const ringOffset = tempVecB.copy(basis.tangent).multiplyScalar(Math.cos(orbitAngle) * enemy.formationRadius * orbitScale)
    .addScaledVector(basis.bitangent, Math.sin(orbitAngle) * enemy.formationRadius * 0.82 * orbitScale);
  return tempVecC.copy(planet.position).addScaledVector(radial, altitude).add(ringOffset);
}

function updateEnemyShip(state, enemy, squad, dt, time) {
  const targetPlanet = getEnemyTargetPlanet(state, enemy);
  if (!targetPlanet) {
    return;
  }

  const activePlanet = targetPlanet;
  const targetPoint = computeEnemyTargetPoint(state, enemy, squad, activePlanet, time);
  const toTarget = tempVecD.copy(targetPoint).sub(enemy.position);
  const distance = Math.max(0.0001, toTarget.length());
  const desiredForward = tempVecE.copy(toTarget).divideScalar(distance);

  if (enemy.forward.lengthSq() < 1e-6) {
    enemy.forward.copy(desiredForward);
  }
  const turnRate = squad.mode === 'swarm' ? enemy.turnScale : enemy.turnScale * 2.5;
  const upRate = squad.mode === 'swarm' ? enemy.upScale : enemy.upScale * 2.0;
  enemy.forward.lerp(desiredForward, easeExp(dt, turnRate)).normalize();

  const desiredUp = activePlanet.position.lengthSq() > 1e-6
    ? activePlanet.position.clone().normalize()
    : worldUp;
  const projectedUp = desiredUp.clone().sub(tempVecF.copy(enemy.forward).multiplyScalar(desiredUp.dot(enemy.forward)));
  if (projectedUp.lengthSq() > 1e-6) {
    enemy.up.lerp(projectedUp.normalize(), easeExp(dt, upRate)).normalize();
  }

  const currentSpeed = Math.max(enemy.speed || enemy.velocity.length(), 0.0001);
  const surfaceSpeed = Math.sqrt(Math.max(activePlanet.gravityStrength / Math.max(activePlanet.radius + 1.0, 1.0), 1.0));
  const speedFactor = squad.mode === 'swarm'
    ? 0.11
    : squad.mode === 'depart'
      ? 8.0
      : 0.22;
  const targetSpeed = surfaceSpeed * speedFactor * enemy.speedScale;
  enemy.speed = THREE.MathUtils.lerp(currentSpeed, targetSpeed, easeExp(dt, 2.5));

  const planetFollow = squad.mode === 'swarm'
    ? 1.0
    : squad.mode === 'depart'
      ? 0.92
      : 0.6;
  enemy.velocity.copy(activePlanet.velocity).multiplyScalar(planetFollow)
    .addScaledVector(enemy.forward, enemy.speed);
  enemy.position.addScaledVector(enemy.velocity, dt);

  const centerOffset = tempVecB.copy(enemy.position).sub(activePlanet.position);
  const centerDistance = centerOffset.length();
  const minimumAltitude = squad.mode === 'swarm' ? config.planetCaptureAltitude : 1.0;
  const minimumDistance = activePlanet.radius + minimumAltitude;
  if (centerDistance < minimumDistance) {
    const snapNormal = centerDistance > 1e-6
      ? centerOffset.divideScalar(centerDistance)
      : tempVecC.copy(enemy.forward).normalize();
    enemy.position.copy(activePlanet.position).addScaledVector(snapNormal, minimumDistance);
    const radialVelocity = snapNormal.clone().multiplyScalar(enemy.velocity.dot(snapNormal));
    enemy.velocity.sub(radialVelocity);
    enemy.speed = enemy.velocity.length();
  }

  const turnSide = tempVecA.copy(enemy.forward).cross(desiredForward).dot(enemy.up);
  enemy.bank = THREE.MathUtils.lerp(enemy.bank, THREE.MathUtils.clamp(turnSide * 2.4, -0.75, 0.75), easeExp(dt, 2.4));
}

function updateEnemySquads(state, dt, time) {
  state.enemySpawnTimer = Math.max(0, state.enemySpawnTimer - dt);
  while (state.enemySpawnTimer <= 0 && state.planets.length > 0 && state.enemySquads.length < ENEMY_MAX_SQUADS) {
    spawnEnemySquad(state, pickEnemySpawnPlanetIndex(state));
  }
  if (state.enemySpawnTimer <= 0) {
    state.enemySpawnTimer = ENEMY_SPAWN_DELAY_MIN + state.rng() * (ENEMY_SPAWN_DELAY_MAX - ENEMY_SPAWN_DELAY_MIN);
  }

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

    if (squad.mode === 'approach' && avgAltitude <= config.planetCaptureAltitude) {
      squad.mode = 'swarm';
      squad.modeTimer = squad.swarmDuration;
    } else if (squad.mode === 'swarm') {
      squad.modeTimer -= dt;
      if (squad.modeTimer <= 0) {
        squad.mode = 'depart';
        squad.modeTimer = squad.departDuration;
        squad.targetPlanetIndex = squad.nextPlanetIndex;
        squad.nextPlanetIndex = pickRandomPlanetIndex(state, squad.targetPlanetIndex);
      }
    } else if (squad.mode === 'depart') {
      squad.modeTimer -= dt;
      if (squad.modeTimer <= 0) {
        squad.mode = 'approach';
      }
    }

    for (const enemy of squadEnemies) {
      enemy.targetPlanetIndex = squad.targetPlanetIndex;
      enemy.nextPlanetIndex = squad.nextPlanetIndex;
      updateEnemyShip(state, enemy, squad, dt, time);
    }

    aliveSquads.push(squad);
  }

  state.enemySquads = aliveSquads;
  state.enemySquad = state.enemySquads[state.enemySquads.length - 1] || null;
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
  const atmosphereControlAltitude = config.atmosphereControlAltitude;
  const atmosphereDepth = altitude <= atmosphereControlAltitude
    ? clamp01((atmosphereControlAltitude - altitude) / atmosphereControlAltitude)
    : 0;
  const captureBlend = ship.captureTimer >= config.shipCaptureBlendTime
    ? 1
    : smoothstep(0, Math.max(config.shipCaptureBlendTime, 0.0001), ship.captureTimer);
  const targetAltitude = atmosphereThickness * 0.5;
  const altitudeError = THREE.MathUtils.clamp((targetAltitude - altitude) / (atmosphereThickness * 0.5), -1, 1);
  const approachResponse = THREE.MathUtils.lerp(1, config.atmosphereApproachResponse, atmosphereDepth);

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
  const altitudeSpeedCap = Math.max(
    config.shipMinMaxSpeed,
    state.nearestAltitude * config.shipAltMaxSpeedFac
  );

  const turnSpeedScale = Math.max(0.1, config.shipTurnSpeedScale ?? 1);
  const targetBank = THREE.MathUtils.clamp(turnInput * 0.95, -0.95, 0.95);
  const bankReturnRate = atmosphereDepth > 0
    ? THREE.MathUtils.lerp(1.4, 3.3, atmosphereDepth) * THREE.MathUtils.lerp(0.7, 1.0, autopilotStrength) * (Math.abs(turnInput) > 0.001 ? turnSpeedScale : 1)
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

  const yawRate = THREE.MathUtils.lerp(0.38, 0.98, atmosphereDepth) * THREE.MathUtils.lerp(0.55, 1.0, clamp01(currentSpeed / 6)) * turnSpeedScale;
  if (atmosphereDepth > 0) {
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

  const pitchRate = atmosphereDepth > 0
    ? THREE.MathUtils.lerp(0.28, 0.52, atmosphereDepth)
    : THREE.MathUtils.lerp(1.2, 1.9, clamp01(currentSpeed / 18));
  if (Math.abs(pitchInput) > 0.001) {
    ship.pitchIdleTime = 0;
    ship.forward.applyAxisAngle(rightAxis, pitchInput * pitchRate * dt);
    ship.up.applyAxisAngle(rightAxis, pitchInput * pitchRate * dt);
  } else {
    ship.pitchIdleTime += boostLevel > 0 ? 0 : dt;
  }

  if (atmosphereDepth > 0) {
    const horizonForward = tempVecD.copy(ship.forward).addScaledVector(localUp, -ship.forward.dot(localUp));
    if (horizonForward.lengthSq() > 1e-6 && boostLevel <= 0) {
      horizonForward.normalize();
      const levelBlend = easeExp(dt, THREE.MathUtils.lerp(0.22, config.atmosphereLevelResponse, atmosphereDepth) * autopilotStrength * captureBlend * approachResponse);
      const controlFreedom = 1 - clamp01(Math.max(Math.abs(turnInput), Math.abs(pitchInput)));
      ship.forward.lerp(horizonForward, levelBlend * controlFreedom * controlFreedom);
    }
    const allowCurvatureTrim = boostLevel <= 0;
    if (allowCurvatureTrim) {
      const trimAuthority = Math.max(0, 1 - Math.abs(pitchInput) * 1.4);
      const trimPitch = trimAuthority > 0.001
        ? THREE.MathUtils.clamp(-altitudeError * THREE.MathUtils.lerp(0.015, config.atmosphereTrimResponse, atmosphereDepth) * trimAuthority * autopilotStrength * captureBlend * approachResponse, -0.14, 0.14)
        : 0;
      if (trimPitch !== 0) {
        ship.forward.applyAxisAngle(rightAxis, trimPitch * dt);
        ship.up.applyAxisAngle(rightAxis, trimPitch * dt);
      }
    }
    ship.bank = THREE.MathUtils.lerp(ship.bank, 0, easeExp(dt, THREE.MathUtils.lerp(0.6, config.atmosphereBankResponse, atmosphereDepth) * autopilotStrength * captureBlend));
  } else {
    const spaceTransitionDistance = config.atmosphereSpaceTurnTransition;
    const extraAltitude = Math.max(0, altitude - atmosphereThickness);
    const bankBlend = 1 - clamp01(extraAltitude / spaceTransitionDistance);
    const spaceYawRate = THREE.MathUtils.lerp(0.26, 0.72, clamp01(currentSpeed / 18)) * turnSpeedScale;
    ship.forward.applyAxisAngle(ship.up, -turnInput * spaceYawRate * dt);
    ship.bank = THREE.MathUtils.lerp(ship.bank, 0, easeExp(dt, THREE.MathUtils.lerp(0.12, 1.8, 1 - bankBlend)));
  }

  if (atmosphereDepth > 0 && ship.flightMode === 'bound' && boostLevel <= 0 && ship.pitchIdleTime > config.shipPitchReorientDelay) {
    const referenceUp = atmosphereDepth > 0 && state.nearestPlanet
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
  ship.forward.normalize();
  ship.up.normalize();
  const projectedUp = ship.up.clone().sub(tempVecF.copy(ship.forward).multiplyScalar(ship.up.dot(ship.forward)));
  if (projectedUp.lengthSq() > 1e-6) {
    ship.up.copy(projectedUp.normalize());
  }

  if (atmosphereDepth > 0) {
    const desiredRadius = Math.max(relativeDistance, planet.radius + 1.0);
    const surfaceSpeed = Math.sqrt(Math.max(planet.gravityStrength / Math.max(desiredRadius, 1.0), 1.0));
    const cruiseSpeed = surfaceSpeed * THREE.MathUtils.lerp(0.09, 0.14, atmosphereDepth);
    const pitchSpeedBias = THREE.MathUtils.lerp(0.55, 0.8, atmosphereDepth);
    let targetSpeed = cruiseSpeed * THREE.MathUtils.clamp(1 + pitchInput * pitchSpeedBias, 0.25, 1.9);
    if (brakeActive) {
      targetSpeed *= 0.55;
    }

    const speedBlend = easeExp(dt, THREE.MathUtils.lerp(1.15, 3.4, atmosphereDepth) * THREE.MathUtils.lerp(0.85, 1.1, 1 - boostLevel) * approachResponse);
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
    if (relativeVelocity.lengthSq() > altitudeSpeedCap * altitudeSpeedCap) {
      relativeVelocity.setLength(altitudeSpeedCap);
    }
    ship.speed = relativeVelocity.length();
    relativePosition.addScaledVector(relativeVelocity, dt);
    const correctedDistance = Math.max(0.0001, relativePosition.length());
    const correctedOutward = tempVecA.copy(relativePosition).divideScalar(correctedDistance);
    const targetRadius = planet.radius + targetAltitude;
    const radiusError = targetRadius - correctedDistance;
    const positionCorrection = radiusError * THREE.MathUtils.lerp(0.04, 0.11, atmosphereDepth) * autopilotStrength * boostHoldFactor * approachResponse;
    relativePosition.addScaledVector(correctedOutward, positionCorrection);
    ship.relativeVelocity.copy(relativeVelocity);
    if (ship.flightMode === 'bound' && ship.boundPlanet) {
      syncShipWorldState(ship);
    } else {
      ship.position.copy(planet.position).add(relativePosition);
      ship.velocity.copy(planet.velocity).add(relativeVelocity);
    }
    state.speed = ship.speed;
  } else {
    const spaceForward = tempVecB.copy(ship.forward);
    const spaceDrag = config.shipDragSpace * 0.25;
    ship.speed = Math.max(0, ship.speed - ship.speed * spaceDrag * dt);
    if (boostLevel > 0) {
      const boostImpulse = config.shipBoostThrust * boostLevel * dt;
      ship.speed += boostImpulse;
      state.fuel = Math.max(0, state.fuel - dt * (0.8 + boostLevel * 3.2));
    } else if (!boostActive && ship.boostTimer <= 0 && state.fuel < state.maxFuel) {
      state.fuel = Math.min(state.maxFuel, state.fuel + config.shipFuelRecharge * dt);
    }
    if (brakeActive) {
      ship.speed = Math.max(0, ship.speed - config.shipBrake * 0.02 * dt);
    }
    ship.speed = Math.min(altitudeSpeedCap, ship.speed);
    relativeVelocity.copy(spaceForward).multiplyScalar(ship.speed);
    relativePosition.addScaledVector(relativeVelocity, dt);
    const surfaceSnapDistance = planet.radius + config.planetSurfaceSnapAltitude;
    if (relativePosition.lengthSq() <= surfaceSnapDistance * surfaceSnapDistance) {
      const snapNormal = tempVecD.copy(relativePosition).normalize();
      const snapAltitude = Math.max(config.planetSurfaceSnapAltitude, 1.0);
      relativePosition.copy(snapNormal).multiplyScalar(planet.radius + snapAltitude);
      const radialVelocity = snapNormal.clone().multiplyScalar(relativeVelocity.dot(snapNormal));
      relativeVelocity.sub(radialVelocity);
      ship.forward.copy(relativeVelocity.lengthSq() > 1e-6 ? relativeVelocity.clone().normalize() : ship.forward);
      ship.up.copy(snapNormal);
      ship.boundPlanet = planet;
      ship.flightMode = 'bound';
      ship.recaptureLock = 0;
    }
    ship.relativeVelocity.copy(relativeVelocity);
    if (ship.flightMode === 'bound' && ship.boundPlanet) {
      syncShipWorldState(ship);
    } else {
      ship.position.addScaledVector(relativeVelocity, dt);
      ship.velocity.copy(relativeVelocity);
    }
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

function updatePlanets(state, dt, time) {
  for (const planet of state.planets) {
    updatePlanetState(planet, dt, time);
  }
  relaxPlanetSeparation(state.planets);
  relaxStarSeparation(state.planets);
  for (const planet of state.planets) {
    planet.velocity.copy(planet.position).sub(planet.previousPosition).divideScalar(Math.max(dt, 1 / 240));
  }
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
    enemies: [],
    projectiles: [],
    nextProjectileId: 1,
    nextEnemyId: 1,
    nextEnemySquadId: 1,
    frameIndex: 0,
    ship: null,
    enemySquad: null,
    enemySquads: [],
    enemySpawnTimer: ENEMY_SPAWN_DELAY_MIN,
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
    state.enemies.length = 0;
    state.projectiles.length = 0;
    state.frameIndex = 0;
    state.ship = createShipState();
    state.enemySquad = null;
    state.enemySquads.length = 0;
    state.crashed = false;
    state.fuel = state.maxFuel;
    state.speed = 0;
    state.time = 0;
    state.gamepadRespawnHeld = false;
    state.nextEnemyId = 1;
    state.nextEnemySquadId = 1;
    state.enemySpawnTimer = 0.1 + state.rng() * 0.6;

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
    const spawnTargetIndex = pickEnemySpawnPlanetIndex(state);
    const initialTarget = spawnTargetIndex >= 0 ? spawnTargetIndex : 0;
    spawnEnemySquad(state, initialTarget);
    spawnEnemySquad(state, initialTarget);
    state.loaded = true;
    return state;
  }

  function step(dt, controls = {}) {
    state.time += dt;
    state.frameIndex += 1;
    updatePlanets(state, dt, state.time);
    updateShipState(state, dt, controls);
    updateEnemySquads(state, dt, state.time);
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
