import * as THREE from './lib/three.module.js';
import { PLANET_FILES, config } from './orbitals_config.js';

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

const PROJECTILE_HOMING_LOCK_ANGLE = THREE.MathUtils.degToRad(5);
const PROJECTILE_HOMING_ACQUIRE_ANGLE = THREE.MathUtils.degToRad(7.5);
const PROJECTILE_HOMING_RETAIN_ANGLE = THREE.MathUtils.degToRad(18);
const PROJECTILE_HOMING_RANGE = 900;
const PROJECTILE_HOMING_MIN_TURN = THREE.MathUtils.degToRad(10);
const PROJECTILE_HOMING_MAX_TURN = THREE.MathUtils.degToRad(45);

function clampShipSpeed(speed) {
  return THREE.MathUtils.clamp(speed, 0, config.shipMaxMaxSpeed);
}

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
const ENEMY_FAMILIES = Object.keys(ENEMY_MODEL_FILES_BY_FAMILY);

function getEnemyFamilyFiles(family) {
  return ENEMY_MODEL_FILES_BY_FAMILY[family] || ENEMY_MODEL_FILES_BY_FAMILY[ENEMY_FAMILIES[0]] || [];
}

const ENEMY_SPAWN_DELAY_MIN = 0.8;
const ENEMY_SPAWN_DELAY_MAX = 2.0;
const ENEMY_MAX_SQUADS = 4;
const ENEMY_SQUAD_SIZE_MIN = 1;
const ENEMY_SQUAD_SIZE_MAX = 1;
const ENEMY_APPROACH_ALTITUDE = 0.92;
const ENEMY_SWARM_ALTITUDE = 0.54;
const ENEMY_DEPART_ALTITUDE = 1.05;
const ENEMY_HIT_RADIUS = 2.6;
const ENEMY_SPEED_SCALE_MIN = 0.34;
const ENEMY_SPEED_SCALE_MAX = 0.58;
const ENEMY_TURN_RATE_MIN = 1.05;
const ENEMY_TURN_RATE_MAX = 1.8;
const ENEMY_UP_RATE_MIN = 0.85;
const ENEMY_UP_RATE_MAX = 1.45;
const ENEMY_TARGET_SMOOTH_RATE_SWARM = 2.4;
const ENEMY_TARGET_SMOOTH_RATE_TRAVEL = 5.5;
const ENEMY_INPUT_SMOOTH_RATE_SWARM = 3.2;
const ENEMY_INPUT_SMOOTH_RATE_TRAVEL = 5.4;
const ENEMY_SWARM_WANDER_TURN = 0.11;
const ENEMY_SWARM_WANDER_PITCH = 0.07;
const ENEMY_TRAVEL_WANDER_TURN = 0.028;
const ENEMY_TRAVEL_WANDER_PITCH = 0.018;
const ATMOSPHERE_SOFT_STALL_START = 0.62;
const ATMOSPHERE_SOFT_STALL_FULL = 0.94;
const ENEMY_SWARM_DURATION_MIN = 60.0;
const ENEMY_SWARM_DURATION_MAX = 120.0;
const ENEMY_DEPART_DURATION_MIN = 8.0;
const ENEMY_DEPART_DURATION_MAX = 16.0;
const ENEMY_CRASH_MARGIN = 4.0;
const ENEMY_EXPLOSION_PARTICLE_COUNT = 70;
const ENEMY_EXPLOSION_LIFETIME_MIN = 0.34;
const ENEMY_EXPLOSION_LIFETIME_MAX = 0.58;

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

function getMothershipRng(state) {
  if (!state.mothershipRng) {
    state.mothershipRng = mulberry32(((state.seed >>> 0) ^ 0x9e3779b9) >>> 0);
  }
  return state.mothershipRng;
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

function computeAtmosphereLiftState(planet, altitude, currentSpeed, cruiseSpeed, boostLevel = 0) {
  const atmosphereThickness = Math.max(planet.atmosphereRadius - planet.radius, 0.0001);
  const targetAltitude = atmosphereThickness * config.atmosphereCruiseAltitudeFactor;
  const altitudeRatio = clamp01(altitude / atmosphereThickness);
  const densityCurve = Math.max(0.25, config.atmosphereDensityCurve);
  const density = Math.pow(1 - smoothstep(0, 1, altitudeRatio), densityCurve);
  const edgeFade = 1 - smoothstep(0.82, 1.0, altitudeRatio);
  const surfaceSpeed = Math.sqrt(Math.max(planet.gravityStrength / Math.max(planet.radius + targetAltitude, 1.0), 1.0));
  const minLiftSpeed = Math.max(0.0001, cruiseSpeed * config.atmosphereLiftMinSpeedFactor);
  const goodLiftSpeed = Math.max(minLiftSpeed + 0.0001, cruiseSpeed * config.atmosphereLiftGoodSpeedFactor);
  const speedLift = smoothstep(minLiftSpeed, goodLiftSpeed, currentSpeed);
  const liftAuthority = clamp01(density * speedLift);
  const thinAir = smoothstep(0.55, 0.98, altitudeRatio);
  const thinAirBlend = smoothstep(0.08, 0.85, thinAir);
  const atmosphereBlend = clamp01((atmosphereThickness * 1.35 - altitude) / Math.max(atmosphereThickness * 0.35, 1));
  const requiredLiftSpeed = THREE.MathUtils.lerp(minLiftSpeed, goodLiftSpeed, 0.72);
  const liftSupport = liftAuthority / Math.max(config.atmosphereLiftCruiseAuthority, 0.0001);
  const liftDeficit = 1 - liftAuthority;
  const stallStart = config.atmosphereLiftStallStart;
  const stallFull = config.atmosphereLiftStallFull;
  const stallBlend = boostLevel > 0
    ? 0
    : smoothstep(stallStart, stallFull, liftAuthority) * smoothstep(0.30, 0.98, altitudeRatio) * (1 - boostLevel * 0.85);

  return {
    atmosphereThickness,
    targetAltitude,
    altitudeRatio,
    softStallStartAltitude: atmosphereThickness * ATMOSPHERE_SOFT_STALL_START,
    softStallFullAltitude: atmosphereThickness * ATMOSPHERE_SOFT_STALL_FULL,
    density,
    edgeFade,
    speedLift,
    liftAuthority,
    liftDeficit,
    thinAir,
    thinAirBlend,
    atmosphereBlend,
    requiredLiftSpeed,
    liftSupport,
    stallBlend
  };
}

function computeFreeGravityPull(state, ship) {
  const gravityPull = tempVecG.set(0, 0, 0);
  const speedDamping = 1 / (1 + Math.max(0, ship.speed || 0) * Math.max(0.0001, config.freeGravitySpeedDamping));
  const planetScale = config.freeGravityPlanetInfluenceScale;
  const sunScale = config.freeGravitySunInfluenceScale;
  const planetNearRangeScale = config.freeGravityPlanetNearRangeScale;
  const planetAtmosphereBufferScale = config.freeGravityPlanetAtmosphereBufferScale;
  const planetFarRangePadding = config.freeGravityPlanetFarRangePadding;
  const sunNearRangeScale = config.freeGravitySunNearRangeScale;
  const sunFarRangeScale = config.freeGravitySunFarRangeScale;

  for (const planet of state.planets) {
    const toPlanet = tempVecH.copy(planet.position).sub(ship.position);
    const distance = toPlanet.length();
    if (distance <= 1e-6) {
      continue;
    }

    const nearRange = Math.max(
      planet.atmosphereRadius + planet.radius * planetAtmosphereBufferScale,
      planet.radius * planetNearRangeScale
    );
    const farRange = Math.max(planet.gravityRadius, nearRange + planetFarRangePadding);
    const influence = 1 - smoothstep(nearRange, farRange, distance);
    if (influence <= 0) {
      continue;
    }

    const planetBase = (planet.gravityStrength / Math.max(planet.gravityRadius * planet.gravityRadius, 1)) * planetScale;
    gravityPull.addScaledVector(
      toPlanet.multiplyScalar(1 / distance),
      planetBase * influence * speedDamping
    );
  }

  const sunDistance = ship.position.length();
  if (sunDistance > 1e-6) {
    const sunNearRange = config.starScale * sunNearRangeScale;
    const sunFarRange = Math.max(config.orbitScale * sunFarRangeScale, sunNearRange + 1);
    const sunInfluence = 1 - smoothstep(sunNearRange, sunFarRange, sunDistance);
    if (sunInfluence > 0) {
      const sunDirection = tempVecH.copy(ship.position).multiplyScalar(-1 / sunDistance);
      gravityPull.addScaledVector(sunDirection, sunScale * sunInfluence * speedDamping);
    }
  }

  return gravityPull;
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
    kind: 'regular',
    family: '',
    assetFile: '',
    position: new THREE.Vector3(),
    previousPosition: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    relativePosition: new THREE.Vector3(),
    relativeVelocity: new THREE.Vector3(),
    forward: new THREE.Vector3(0, 0, 1),
    up: new THREE.Vector3(0, 1, 0),
    gravity: new THREE.Vector3(),
    bank: 0,
    speed: 0,
    radius: ENEMY_HIT_RADIUS,
    health: config.enemyHitPoints,
    speedScale: 1,
    turnScale: 1,
    upScale: 1,
    visualScale: 1,
    destroyed: false,
    boundPlanet: null,
    flightMode: 'bound',
    captureTimer: config.shipCaptureBlendTime,
    recaptureLock: 0,
    pitchIdleTime: 0,
    boostTimer: 0,
    fireCooldown: 0,
    aiTurnInput: 0,
    aiPitchInput: 0,
    aiBoostHold: 0,
    aiBrakeHold: 0,
    aiMode: '',
    aiTargetPlanetIndex: -1,
    aiDepartPlanetIndex: -1,
    aiPresentationSignature: '',
    fighterSettleTimer: 0,
    atmosphericCruiseAltitudeFactor: config.atmosphereCruiseAltitudeFactor,
    hasSmoothedTargetPoint: false,
    smoothedTargetPoint: new THREE.Vector3(),
    formationAngle: 0,
    formationRadius: 0,
    phase: 0,
    mode: 'approach',
    targetPlanetIndex: 0,
    nextPlanetIndex: 0,
    modeTimer: 0,
    combatRole: 'reserve',
    presentation: null,
    objectiveAttack: null,
    encounterId: -1,
    lastPresentationTime: -Infinity,
    presentationShootableFrames: 0,
    presentationKindLastUsed: '',
    isPrimaryThreat: false,
    hudPriority: config.encounterReserveHudPriority,
    root: null,
    visual: null,
    modelPivot: null,
    model: null
  };
}

function createEncounterDirectorState() {
  return {
    activeEncounterId: -1,
    nextEncounterId: 1,
    nextEncounterEntityId: 1,
    nextSelectionTimer: 0,
    encounters: [],
    activePresenterEnemyIds: [],
    activeObjectiveAttackerEnemyIds: [],
    lastPresentationKindIndex: 0,
    missionMessage: '',
    missionMessageKind: '',
    missionMessageUntil: 0
  };
}

function resetEncounterDirectorState(state) {
  state.encounterDirector = createEncounterDirectorState();
  state.encounterEntities = [];
}

function createEncounterState(state, options = {}) {
  const director = state.encounterDirector || createEncounterDirectorState();
  state.encounterDirector = director;
  const id = options.id ?? director.nextEncounterId++;
  const encounter = {
    id,
    type: options.type || 'planetInvasion',
    status: options.status || 'inactive',
    anchorKind: options.anchorKind || 'planet',
    anchorPlanetIndex: options.anchorPlanetIndex ?? -1,
    anchorEntityId: options.anchorEntityId ?? -1,
    anchorPoint: options.anchorPoint ? options.anchorPoint.clone() : null,
    objectiveKind: options.objectiveKind || 'clearEnemies',
    protectedEntityId: options.protectedEntityId ?? -1,
    targetEntityId: options.targetEntityId ?? -1,
    spawnedEnemyIds: Array.isArray(options.spawnedEnemyIds) ? options.spawnedEnemyIds.slice() : [],
    activePresenterEnemyIds: [],
    activeObjectiveAttackerEnemyIds: [],
    reserveEnemyIds: [],
    mothershipSquadId: options.mothershipSquadId ?? -1,
    totalReleased: options.totalReleased ?? 0,
    totalDestroyed: options.totalDestroyed ?? 0,
    startedAt: options.startedAt ?? 0,
    endedAt: 0,
    clearEventPushed: false,
    successEventPushed: false,
    failEventPushed: false,
    activationRadius: options.activationRadius ?? config.encounterMissionActivationDistance,
    abortDistance: options.abortDistance ?? config.encounterMissionAbortDistance,
    missionActiveText: options.missionActiveText || '',
    missionSuccessText: options.missionSuccessText || '',
    missionFailureText: options.missionFailureText || '',
    missionAbortText: options.missionAbortText || '',
    duration: options.duration ?? 0,
    activatedByPlayer: Boolean(options.activatedByPlayer)
  };
  director.encounters.push(encounter);
  return encounter;
}

function createEncounterEntityState(state, options = {}) {
  const director = state.encounterDirector || createEncounterDirectorState();
  state.encounterDirector = director;
  const entity = {
    id: options.id ?? director.nextEncounterEntityId++,
    kind: options.kind || 'transport',
    family: options.family || 'Nemesis',
    assetFile: options.assetFile || 'ship_nemesis2.glb',
    position: options.position ? options.position.clone() : new THREE.Vector3(),
    previousPosition: options.position ? options.position.clone() : new THREE.Vector3(),
    velocity: options.velocity ? options.velocity.clone() : new THREE.Vector3(),
    forward: options.forward ? options.forward.clone().normalize() : new THREE.Vector3(0, 0, 1),
    up: options.up ? options.up.clone().normalize() : new THREE.Vector3(0, 1, 0),
    radius: options.radius ?? ENEMY_HIT_RADIUS * 3,
    health: options.health ?? config.transportDefenseEntityHealth,
    maxHealth: options.maxHealth ?? options.health ?? config.transportDefenseEntityHealth,
    speed: options.speed ?? config.transportDefenseEntitySpeed,
    routeDirection: options.routeDirection ? options.routeDirection.clone().normalize() : null,
    routeRemaining: options.routeRemaining ?? Infinity,
    destroyed: false,
    visualScale: options.visualScale ?? 2.4,
    root: null,
    visual: null,
    modelPivot: null,
    model: null
  };
  if (!Array.isArray(state.encounterEntities)) {
    state.encounterEntities = [];
  }
  state.encounterEntities.push(entity);
  return entity;
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
    swarmDuration: ENEMY_SWARM_DURATION_MIN + rng() * (ENEMY_SWARM_DURATION_MAX - ENEMY_SWARM_DURATION_MIN),
    departDuration: ENEMY_DEPART_DURATION_MIN + rng() * (ENEMY_DEPART_DURATION_MAX - ENEMY_DEPART_DURATION_MIN),
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
  const enemyCount = options.enemyCount ?? (Math.floor(rng() * (ENEMY_SQUAD_SIZE_MAX - ENEMY_SQUAD_SIZE_MIN + 1)) + ENEMY_SQUAD_SIZE_MIN);
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
    enemy.speedScale = ENEMY_SPEED_SCALE_MIN + rng() * (ENEMY_SPEED_SCALE_MAX - ENEMY_SPEED_SCALE_MIN);
    enemy.turnScale = ENEMY_TURN_RATE_MIN + rng() * (ENEMY_TURN_RATE_MAX - ENEMY_TURN_RATE_MIN);
    enemy.upScale = ENEMY_UP_RATE_MIN + rng() * (ENEMY_UP_RATE_MAX - ENEMY_UP_RATE_MIN);
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
  ship.captureTimer = ship.kind === 'player'
    ? 0
    : config.shipCaptureBlendTime;
  ship.recaptureLock = 0;
}

function vectorLikeTo(target, value, fallback) {
  if (value && typeof value.x === 'number' && typeof value.y === 'number' && typeof value.z === 'number') {
    return target.set(value.x, value.y, value.z);
  }
  return target.copy(fallback);
}

function createEnemyExplosionState(state, position, cause = 'projectile') {
  const explosionSeed = ((state.seed >>> 0) ^ Math.imul(state.nextEnemyExplosionId + 1, 0x9e3779b9)) >>> 0;
  const rng = mulberry32(explosionSeed);
  return {
    id: state.nextEnemyExplosionId,
    position: position.clone(),
    age: 0,
    lifetime: cause === 'crash'
      ? ENEMY_EXPLOSION_LIFETIME_MIN + rng() * (ENEMY_EXPLOSION_LIFETIME_MAX - ENEMY_EXPLOSION_LIFETIME_MIN)
      : (ENEMY_EXPLOSION_LIFETIME_MIN * 0.85) + rng() * ((ENEMY_EXPLOSION_LIFETIME_MAX * 0.9) - (ENEMY_EXPLOSION_LIFETIME_MIN * 0.85)),
    particleCount: ENEMY_EXPLOSION_PARTICLE_COUNT,
    cause
  };
}

function spawnEnemyExplosion(state, position, cause = 'projectile') {
  state.enemyExplosions.push(createEnemyExplosionState(state, position, cause));
  state.nextEnemyExplosionId += 1;
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

function isMothershipEnemy(enemy) {
  return Boolean(enemy && enemy.kind === 'mothership');
}

function canShipsCollide(first, second) {
  if (!first || !second || first === second) {
    return false;
  }
  const firstIsMothership = isMothershipEnemy(first);
  const secondIsMothership = isMothershipEnemy(second);
  const firstIsRegularEnemy = Boolean(first.kind) && !firstIsMothership;
  const secondIsRegularEnemy = Boolean(second.kind) && !secondIsMothership;
  if (firstIsRegularEnemy && secondIsRegularEnemy && !config.enemyEnemyCollisionsDamage) {
    return false;
  }
  if ((firstIsRegularEnemy && secondIsMothership) || (firstIsMothership && secondIsRegularEnemy)) {
    return false;
  }
  return true;
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
    crashPlayerShip(state, planet, ship.position.clone().sub(impactPosition || ship.position).normalize(), impactPosition || ship.position);
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
    if (enemy.position.distanceTo(planet.position) <= planet.radius + ENEMY_CRASH_MARGIN) {
      return {
        type: 'planet',
        planet
      };
    }
  }

  const starRadius = config.starScale * 0.5;
  if (enemy.position.length() <= starRadius + ENEMY_CRASH_MARGIN) {
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

function segmentIntersectsSphere(start, end, center, radius) {
  const segment = tempVecA.copy(end).sub(start);
  const lengthSq = segment.lengthSq();
  if (lengthSq < 1e-12) {
    return start.distanceTo(center) <= radius;
  }

  const toCenter = tempVecB.copy(center).sub(start);
  const t = THREE.MathUtils.clamp(toCenter.dot(segment) / lengthSq, 0, 1);
  const closest = tempVecC.copy(start).addScaledVector(segment, t);
  return closest.distanceTo(center) <= radius;
}

function findProjectileHomingTarget(state, projectile) {
  if (!state.enemies.length || projectile.velocity.lengthSq() < 1e-6) {
    return null;
  }

  const currentHeading = tempVecA.copy(projectile.velocity).normalize();
  const currentTarget = projectile.targetEnemyId != null
    ? state.enemies.find((enemy) => enemy.id === projectile.targetEnemyId)
    : null;

  if (currentTarget) {
    const currentTargetOffset = tempVecB.copy(currentTarget.position).sub(projectile.position);
    const currentTargetDistance = currentTargetOffset.length();
    if (currentTargetDistance > 1e-6 && currentTargetDistance <= PROJECTILE_HOMING_RANGE) {
      const currentTargetAngle = currentHeading.angleTo(currentTargetOffset.divideScalar(currentTargetDistance));
      if (currentTargetAngle <= PROJECTILE_HOMING_RETAIN_ANGLE) {
        return currentTarget;
      }
    }
  }

  let bestTarget = null;
  let bestScore = Infinity;

  for (const enemy of state.enemies) {
    if (!enemy || enemy.health <= 0) {
      continue;
    }

    const offset = tempVecB.copy(enemy.position).sub(projectile.position);
    const distance = offset.length();
    if (distance <= 1e-6 || distance > PROJECTILE_HOMING_RANGE) {
      continue;
    }

    const direction = offset.multiplyScalar(1 / distance);
    const angle = currentHeading.angleTo(direction);
    if (angle > PROJECTILE_HOMING_ACQUIRE_ANGLE) {
      continue;
    }

    const score = (angle / PROJECTILE_HOMING_ACQUIRE_ANGLE) * 0.7 + (distance / PROJECTILE_HOMING_RANGE) * 0.3;
    if (score < bestScore) {
      bestScore = score;
      bestTarget = enemy;
    }
  }

  return bestTarget;
}

function steerProjectileTowardsTarget(projectile, target, dt) {
  if (!target || projectile.velocity.lengthSq() < 1e-6) {
    return;
  }

  const speed = projectile.velocity.length();
  if (speed <= 1e-6) {
    return;
  }

  const currentDirection = tempVecA.copy(projectile.velocity).multiplyScalar(1 / speed);
  const desiredOffset = tempVecB.copy(target.position).sub(projectile.position);
  const distance = desiredOffset.length();
  if (distance <= 1e-6) {
    return;
  }

  const desiredDirection = desiredOffset.multiplyScalar(1 / distance);
  const angle = currentDirection.angleTo(desiredDirection);
  if (angle <= 1e-4) {
    return;
  }

  const angleAssist = THREE.MathUtils.clamp(
    (PROJECTILE_HOMING_ACQUIRE_ANGLE - angle) / (PROJECTILE_HOMING_ACQUIRE_ANGLE - PROJECTILE_HOMING_LOCK_ANGLE),
    0,
    1
  );
  const distanceAssist = THREE.MathUtils.clamp(1 - (distance / PROJECTILE_HOMING_RANGE), 0, 1);
  const assist = angleAssist * (0.5 + distanceAssist * 0.5);
  if (assist <= 0) {
    return;
  }

  const turnRate = THREE.MathUtils.lerp(PROJECTILE_HOMING_MIN_TURN, PROJECTILE_HOMING_MAX_TURN, assist);
  const maxTurn = turnRate * dt;
  const turn = Math.min(angle, maxTurn);
  if (turn <= 0) {
    return;
  }

  const rotationAxis = tempVecC.copy(currentDirection).cross(desiredDirection);
  if (rotationAxis.lengthSq() > 1e-10) {
    currentDirection.applyAxisAngle(rotationAxis.normalize(), turn);
  } else {
    currentDirection.copy(desiredDirection);
  }

  projectile.velocity.copy(currentDirection).multiplyScalar(speed);
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
  const baseSpeed = config.shipProjectileSpeed + ship.speed * config.shipProjectileShipVelocityScale;
  const direction = tempVecD.copy(forward).normalize();
  state.projectiles.push({
    id: state.nextProjectileId,
    position: origin.clone(),
    previousPosition: origin.clone(),
    velocity: ship.velocity.clone().addScaledVector(direction, baseSpeed),
    inheritedVelocity: ship.velocity.clone(),
    age: 0,
    lifetime: config.shipProjectileLifetime,
    radius: config.shipProjectileSize,
    side: 0,
    spawnFrame: state.frameIndex,
    targetEnemyId: null,
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
    const homingTarget = findProjectileHomingTarget(state, projectile);
    projectile.targetEnemyId = homingTarget ? homingTarget.id : null;
    if (homingTarget) {
      steerProjectileTowardsTarget(projectile, homingTarget, dt);
    }
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
        if (!enemy || enemy.health <= 0) {
          continue;
        }
        const hitRadius = enemy.radius + projectile.radius;
        if (projectile.position.distanceTo(enemy.position) <= hitRadius) {
          applyEnemyDamage(state, enemy, config.shipProjectileDamage, 'projectile');
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

function updateEnemyExplosions(state, dt) {
  for (let i = state.enemyExplosions.length - 1; i >= 0; i -= 1) {
    const explosion = state.enemyExplosions[i];
    explosion.age += dt;
    if (explosion.age >= explosion.lifetime) {
      state.enemyExplosions.splice(i, 1);
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

function pushEvent(state, type, payload = {}) {
  if (!config.debug || !state || !Array.isArray(state.eventLog)) {
    return;
  }
  state.eventLog.push({
    frame: state.frameIndex,
    time: state.time,
    type,
    ...payload
  });
}

function formatEventPoint(point) {
  if (!point) {
    return '(n/a)';
  }
  return `(${Number(point.x).toFixed(2)}, ${Number(point.y).toFixed(2)}, ${Number(point.z).toFixed(2)})`;
}

export function formatCombatLog(state) {
  if (!config.debug) {
    return '';
  }
  const lines = [];
  const events = Array.isArray(state?.eventLog) ? state.eventLog : [];
  for (const event of events) {
    const stamp = `f${event.frame} t=${Number(event.time).toFixed(2)}`;
    if (event.type === 'mothership-spawn') {
      lines.push(
        `[${stamp}] M#${event.mothershipId} spawn planet=${event.targetPlanetIndex}(${event.targetPlanetName || 'n/a'}) pos=${formatEventPoint(event.position)}`
      );
      continue;
    }
    if (event.type === 'mothership-arrived') {
      lines.push(
        `[${stamp}] M#${event.mothershipId} arrived planet=${event.planetIndex} pos=${formatEventPoint(event.position)}`
      );
      continue;
    }
    if (event.type === 'mothership-reoriented') {
      lines.push(
        `[${stamp}] M#${event.mothershipId} reoriented planet=${event.planetIndex} pos=${formatEventPoint(event.position)}`
      );
      continue;
    }
    if (event.type === 'mothership-planet-cross') {
      lines.push(
        `[${stamp}] M#${event.mothershipId} crossed planet=${event.planetIndex}(${event.planetName || 'n/a'}) prev=${formatEventPoint(event.previousPosition)} now=${formatEventPoint(event.currentPosition)}`
      );
      continue;
    }
    if (event.type === 'enemy-spawn') {
      lines.push(
        `[${stamp}] E#${event.enemyId} spawn kind=${event.kind} family=${event.family} fromM=${event.spawnedByMothershipId ?? '-'} planet=${event.targetPlanetIndex}(${event.targetPlanetName || 'n/a'}) pos=${formatEventPoint(event.position)} alt=${event.altitude == null ? 'n/a' : Number(event.altitude).toFixed(2)}`
      );
      continue;
    }
    if (event.type === 'enemy-death') {
      lines.push(
        `[${stamp}] E#${event.enemyId} death cause=${event.cause} age=${event.ageSeconds == null ? 'n/a' : Number(event.ageSeconds).toFixed(2)} family=${event.family} fromM=${event.parentMothershipId ?? '-'} planet=${event.targetPlanetIndex}(${event.targetPlanetName || 'n/a'}) alt=${event.altitude == null ? 'n/a' : Number(event.altitude).toFixed(2)} pos=${formatEventPoint(event.position)}`
      );
      continue;
    }
    if (event.type === 'enemy-crash') {
      lines.push(`[${stamp}] E#${event.enemyId} crash kind=${event.kind} family=${event.family}`);
      continue;
    }
    if (event.type === 'encounter-start') {
      lines.push(`[${stamp}] encounter#${event.encounterId} start type=${event.encounterType} anchor=${event.anchorKind}`);
      continue;
    }
    if (event.type === 'encounter-success' || event.type === 'encounter-fail' || event.type === 'encounter-end') {
      lines.push(`[${stamp}] encounter#${event.encounterId} ${event.type.replace('encounter-', '')} type=${event.encounterType} status=${event.status || ''} released=${event.totalReleased ?? '-'} destroyed=${event.totalDestroyed ?? '-'}`);
      continue;
    }
    if (event.type === 'planet-invasion-start' || event.type === 'planet-invasion-cleared') {
      lines.push(`[${stamp}] planet-invasion#${event.encounterId} ${event.type.replace('planet-invasion-', '')} planet=${event.planetIndex} released=${event.totalReleased ?? '-'} destroyed=${event.totalDestroyed ?? '-'}`);
      continue;
    }
    if (event.type.startsWith('presentation-')) {
      lines.push(`[${stamp}] presentation E#${event.enemyId} ${event.type.replace('presentation-', '')} kind=${event.kind} phase=${event.phase} shootable=${event.shootableFrames ?? 0} minAngle=${event.minAngleToPlayer == null ? '-' : Number(event.minAngleToPlayer).toFixed(1)} minDist=${event.minDistanceToPlayer == null ? '-' : Number(event.minDistanceToPlayer).toFixed(1)} reason=${event.failureReason || ''}`);
      continue;
    }
    if (event.type.startsWith('objective-')) {
      lines.push(`[${stamp}] objective E#${event.enemyId} ${event.type.replace('objective-', '')} encounter=${event.encounterId} target=${event.targetEntityId ?? '-'}`);
    }
  }
  return lines.join('\n');
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
  const approachAltitude = planet.radius + atmosphereThickness * (fighterApproachAltitudeFactor ?? ENEMY_APPROACH_ALTITUDE);
  const swarmAltitude = planet.radius + atmosphereThickness * (fighterPatrolAltitudeFactor ?? ENEMY_SWARM_ALTITUDE);
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
        ? ENEMY_SWARM_ALTITUDE
      : squad.mode === 'depart'
        ? ENEMY_DEPART_ALTITUDE
        : ENEMY_APPROACH_ALTITUDE
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
    const targetSmoothRate = travelMode ? ENEMY_TARGET_SMOOTH_RATE_TRAVEL : ENEMY_TARGET_SMOOTH_RATE_SWARM;
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
    ? Math.sin(time * 0.11 + enemy.phase) * ENEMY_TRAVEL_WANDER_TURN
    : Math.sin(time * 0.22 + enemy.phase) * ENEMY_SWARM_WANDER_TURN;
  const wanderPitch = travelMode
    ? Math.cos(time * 0.09 + enemy.phase * 1.7) * ENEMY_TRAVEL_WANDER_PITCH * 0.45
    : Math.cos(time * 0.19 + enemy.phase * 1.7) * ENEMY_SWARM_WANDER_PITCH * 0.55;
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
  const desiredApproachAltitude = atmosphereThickness * (fighterApproachAltitudeFactor ?? ENEMY_APPROACH_ALTITUDE);
  const desiredSwarmAltitudeFactor = fighterPatrolAltitudeFactor ?? ENEMY_SWARM_ALTITUDE;
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

  const inputSmoothRate = travelMode ? ENEMY_INPUT_SMOOTH_RATE_TRAVEL : ENEMY_INPUT_SMOOTH_RATE_SWARM;
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

  updateShipState(enemyWorld, dt, {
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

function getAllActiveShips(state) {
  const ships = [];
  if (state.ship && !state.crashed) {
    ships.push({ ship: state.ship, isPlayer: true });
  }
  for (const enemy of state.enemies) {
    if (enemy && enemy.health > 0) {
      ships.push({ ship: enemy, isPlayer: false });
    }
  }
  return ships;
}

function updateShipShipCollisions(state) {
  const ships = getAllActiveShips(state);
  const sunRadius = config.starScale * 0.5;
  for (let i = 0; i < ships.length; i += 1) {
    const a = ships[i].ship;
    if (!a || (!ships[i].isPlayer && a.health <= 0)) {
      continue;
    }
    for (let j = i + 1; j < ships.length; j += 1) {
      const b = ships[j].ship;
      if (!b || (!ships[j].isPlayer && b.health <= 0)) {
        continue;
      }
      if (!canShipsCollide(a, b)) {
        continue;
      }
      const radiusA = a === state.ship ? Math.max(1.5, sunRadius * 0.006) : Math.max(ENEMY_HIT_RADIUS, a.radius || ENEMY_HIT_RADIUS);
      const radiusB = b === state.ship ? Math.max(1.5, sunRadius * 0.006) : Math.max(ENEMY_HIT_RADIUS, b.radius || ENEMY_HIT_RADIUS);
      const delta = tempVecA.copy(b.position).sub(a.position);
      const distance = delta.length();
      const overlap = radiusA + radiusB;
      if (distance > overlap) {
        continue;
      }
      const relativeVelocity = tempVecB.copy(b.velocity || tempVecB.set(0, 0, 0)).sub(a.velocity || tempVecC.set(0, 0, 0));
      const impactSpeed = Math.max(relativeVelocity.length(), 0.5);
      const impactPoint = distance > 1e-6
        ? tempVecC.copy(a.position).addScaledVector(delta, 0.5)
        : tempVecC.copy(a.position);
      handleShipCollision(state, a, b, impactPoint.clone(), impactSpeed);
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

function crashPlayerShip(state, planet, crashNormal, impactPosition = null) {
  const ship = state.ship;
  if (!ship || state.crashed) {
    return;
  }

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

function crashPlayerShipIntoSun(state, impactPosition = null) {
  const ship = state.ship;
  if (!ship || state.crashed) {
    return;
  }
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

function updateShipState(state, dt, controls) {
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
  if (atmosphericFlightActive) {
    if (Math.abs(pitchInput) > 0.001) {
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
      crashPlayerShip(state, planet, crashNormal, planet.position.clone().addScaledVector(crashNormal, crashDistance));
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
      crashPlayerShipIntoSun(state, ship.position.clone());
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
    encounterEntities: [],
    projectiles: [],
    enemyExplosions: [],
    nextProjectileId: 1,
    nextEnemyExplosionId: 1,
    nextEnemyId: 1,
    nextEnemySquadId: 1,
    frameIndex: 0,
    eventLog: [],
    ship: null,
    enemySquad: null,
    enemySquads: [],
    mothershipSquad: null,
    mothershipSquads: [],
    mothershipSpawnTimer: config.mothershipSpawnDelayMin,
    mothershipRng: mulberry32(((seed >>> 0) ^ 0x9e3779b9) >>> 0),
    encounterDirector: createEncounterDirectorState(),
    loaded: false,
    crashed: false,
    nearestPlanet: null,
    nearestAltitude: 0,
    nearestDistance: 0,
    time: 0,
    fuel: 100,
    maxFuel: 100,
    speed: 0,
    score: 0,
    gamepadRespawnHeld: false,
    crashTimer: 0,
    crashRespawnReady: false,
    respawnPlanetIndex: 0
  };

  function bootstrapWorld() {
    state.planets.length = 0;
    state.fuelMotes.length = 0;
    state.enemies.length = 0;
    state.encounterEntities.length = 0;
    state.projectiles.length = 0;
    state.enemyExplosions.length = 0;
    state.frameIndex = 0;
    state.eventLog.length = 0;
    state.ship = createShipState();
    state.enemySquad = null;
    state.enemySquads.length = 0;
    state.mothershipSquad = null;
    state.mothershipSquads.length = 0;
    state.crashed = false;
    state.fuel = state.maxFuel;
    state.speed = 0;
    state.time = 0;
    state.gamepadRespawnHeld = false;
    state.crashTimer = 0;
    state.crashRespawnReady = false;
    state.nextEnemyExplosionId = 1;
    state.nextEnemyId = 1;
    state.nextEnemySquadId = 1;
    state.mothershipRng = mulberry32(((state.seed >>> 0) ^ 0x9e3779b9) >>> 0);
    state.mothershipSpawnTimer = config.mothershipSpawnDelayMin + state.mothershipRng() * (config.mothershipSpawnDelayMax - config.mothershipSpawnDelayMin);
    resetEncounterDirectorState(state);

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
    updateEncounterDirector(state, dt, state.time);
    updateEnemySquads(state, dt, state.time);
    updateMothershipSquads(state, dt, state.time);
    updateShipShipCollisions(state);
    updateProjectiles(state, dt);
    updateEnemyExplosions(state, dt);
    updateFuelMotes(state, dt, state.time);
    return state;
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
