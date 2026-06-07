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

const PROJECTILE_HOMING_LOCK_ANGLE = THREE.MathUtils.degToRad(5);
const PROJECTILE_HOMING_ACQUIRE_ANGLE = THREE.MathUtils.degToRad(7.5);
const PROJECTILE_HOMING_RETAIN_ANGLE = THREE.MathUtils.degToRad(18);
const PROJECTILE_HOMING_RANGE = 900;
const PROJECTILE_HOMING_MIN_TURN = THREE.MathUtils.degToRad(10);
const PROJECTILE_HOMING_MAX_TURN = THREE.MathUtils.degToRad(45);

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
    root: null,
    visual: null,
    modelPivot: null,
    model: null
  };
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
  const squad = createEnemySquadState(state, mothershipSquad.targetPlanetIndex, 'fighter', rng);
  squad.family = family;
  squad.familyFiles = getEnemyFamilyFiles(family).slice();
  squad.parentMothershipId = mothershipSquad.id;
  squad.targetPlanetIndex = mothershipSquad.targetPlanetIndex;
  squad.nextPlanetIndex = pickRandomPlanetIndex(state, squad.targetPlanetIndex, rng);
  squad.mode = 'approach';
  squad.modeTimer = 0;
  squad.orbitPhase = 0;
  squad.orbitProgress = 0;
  squad.fighterDiveAltitudeFactor = config.fighterDiveAltitudeFactor;
  squad.fighterPatrolAltitudeFactor = config.fighterPatrolAltitudeFactor;
  squad.fightersTotal = 1;
  squad.fightersReleased = 1;
  squad.fightersAlive = 1;
  squad.fighterReleaseCooldown = 0;

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

    const launchDirection = tempVecA.copy(launchTangent).addScaledVector(launchRadial, 0.14).normalize();
    const launchSpeed = computeEnemyControlTargetSpeed(planet, fighter, squad) * 1.1;

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
  const inwardSpawn = tempVecG.copy(planet.position).addScaledVector(radial, -spawnDistance);
  const outwardNearest = Math.min(
    outwardSpawn.length(),
    ...state.planets.map((otherPlanet) => outwardSpawn.distanceTo(otherPlanet.position))
  );
  const inwardNearest = Math.min(
    inwardSpawn.length(),
    ...state.planets.map((otherPlanet) => inwardSpawn.distanceTo(otherPlanet.position))
  );
  const spawnCenter = inwardNearest <= outwardNearest ? inwardSpawn : outwardSpawn;
  const spawnSide = inwardNearest <= outwardNearest ? -1 : 1;
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
  squad.mothershipExitDirection = radial.clone();
  squad.holdArrivalDistance = holdPoint.distanceTo(spawnCenter);
  squad.holdExitDistance = planet.radius * 16;
  squad.approachStartDistance = Math.max(squad.holdArrivalDistance, 1);
  squad.fightersTotal = Math.floor(rng() * (config.mothershipFighterCountMax - config.mothershipFighterCountMin + 1)) + config.mothershipFighterCountMin;
  squad.fightersReleased = 0;
  squad.fightersAlive = 0;
  squad.fighterReleaseCooldown = 0.5 + rng() * 1.6;
  squad.leaveAfterFightersDead = true;
  squad.fighterFamily = pickEnemyFamily(state, ['FlyingSaucer'], rng);

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
    mothership.mode = 'approach';
    mothership.mothershipStage = 'approach';
    mothership.mothershipHoldRadius = holdRadius;
    mothership.mothershipArrivalPoint = holdPoint.clone();
    mothership.mothershipSpawnPoint = spawnCenter.clone();
    mothership.mothershipTravelDirection = travelDirection.clone();
    mothership.mothershipEdgeUp = edgeUp.clone();
    mothership.mothershipExitDirection = radial.clone();
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
    }
  }
  return lines.join('\n');
}

function computeEnemyTargetPoint(state, enemy, squad, planet, time) {
  const radial = planet.position.lengthSq() > 1e-6
    ? tempVecA.copy(planet.position).normalize()
    : tempVecA.copy(worldUp);
  const basis = buildBasisFromNormal(radial);
  const atmosphereThickness = Math.max(planet.atmosphereRadius - planet.radius, 1.0);
  const fighterApproachAltitudeFactor = squad.parentMothershipId >= 0 && squad.fighterDiveAltitudeFactor > 0
    ? squad.fighterDiveAltitudeFactor
    : null;
  const fighterPatrolAltitudeFactor = squad.parentMothershipId >= 0 && squad.fighterPatrolAltitudeFactor > 0
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
  return tempVecD.copy(planet.position).addScaledVector(radial, altitude).add(ringOffset).add(wobble);
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

function shouldEnemyStayBound(enemy, squad, targetPlanet, targetAltitude) {
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

function computeEnemyControlTargetSpeed(targetPlanet, enemy, squad) {
  const atmosphereThickness = Math.max(targetPlanet.atmosphereRadius - targetPlanet.radius, 1.0);
  const fighterApproachAltitudeFactor = squad.parentMothershipId >= 0 && squad.fighterDiveAltitudeFactor > 0
    ? squad.fighterDiveAltitudeFactor
    : null;
  const fighterPatrolAltitudeFactor = squad.parentMothershipId >= 0 && squad.fighterPatrolAltitudeFactor > 0
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
  return surfaceSpeed * THREE.MathUtils.lerp(0.12, 0.18, enemy.speedScale);
}


function computeEnemyControlInputs(state, enemy, squad, targetPlanet, time, dt) {
  const rawTargetPoint = computeEnemyTargetPoint(state, enemy, squad, targetPlanet, time);
  const travelMode = squad.mode !== 'swarm';
  const targetSignatureChanged = enemy.aiMode !== squad.mode
    || enemy.aiTargetPlanetIndex !== squad.targetPlanetIndex
    || enemy.aiDepartPlanetIndex !== squad.departPlanetIndex;

  if (!enemy.hasSmoothedTargetPoint || targetSignatureChanged) {
    enemy.smoothedTargetPoint.copy(rawTargetPoint);
    enemy.hasSmoothedTargetPoint = true;
    enemy.aiMode = squad.mode;
    enemy.aiTargetPlanetIndex = squad.targetPlanetIndex;
    enemy.aiDepartPlanetIndex = squad.departPlanetIndex;
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

  const currentSurfaceSpeed = computeEnemyControlTargetSpeed(targetPlanet, enemy, squad);
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
  const turnGain = (travelMode ? 3.2 : 1.55) * enemy.turnScale;
  const pitchGain = (travelMode ? 1.45 : 0.95) * enemy.upScale * THREE.MathUtils.lerp(1, 0.82, liftState.thinAir);
  const rawTurnInput = THREE.MathUtils.clamp(-yawError * turnGain + wanderTurn, -0.9, 0.9);

  const atmosphereThickness = liftState.atmosphereThickness;
  const fighterApproachAltitudeFactor = squad.parentMothershipId >= 0 && squad.fighterDiveAltitudeFactor > 0
    ? squad.fighterDiveAltitudeFactor
    : null;
  const fighterPatrolAltitudeFactor = squad.parentMothershipId >= 0 && squad.fighterPatrolAltitudeFactor > 0
    ? squad.fighterPatrolAltitudeFactor
    : fighterApproachAltitudeFactor;
  const desiredApproachAltitude = atmosphereThickness * (fighterApproachAltitudeFactor ?? ENEMY_APPROACH_ALTITUDE);
  const desiredSwarmAltitude = atmosphereThickness * (fighterPatrolAltitudeFactor ?? ENEMY_SWARM_ALTITUDE);
  const altitudeBias = THREE.MathUtils.clamp(
    (currentAltitude - desiredSwarmAltitude) / Math.max(atmosphereThickness * 0.35, 1),
    -1,
    1
  );
  const pitchError = Math.atan2(-desiredForward.dot(enemy.up), desiredForward.dot(enemy.forward));
  let rawPitchInput = THREE.MathUtils.clamp(
    pitchError * pitchGain + (travelMode ? 0 : altitudeBias * 0.65) + wanderPitch,
    -0.85,
    0.85
  );

  if (liftState.stallBlend > 0) {
    const desiredClimb = THREE.MathUtils.clamp(desiredForward.dot(radialUp), 0, 1);
    const stallPitchFloor = THREE.MathUtils.lerp(-0.06, 0.32, liftState.stallBlend);
    rawPitchInput = Math.max(rawPitchInput, stallPitchFloor + desiredClimb * liftState.stallBlend * 0.22);
  }

  const fighterPatrolMode = squad.parentMothershipId >= 0 && squad.mode === 'swarm';
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

  const inputSmoothRate = travelMode ? ENEMY_INPUT_SMOOTH_RATE_TRAVEL : ENEMY_INPUT_SMOOTH_RATE_SWARM;
  enemy.aiTurnInput = THREE.MathUtils.lerp(enemy.aiTurnInput || 0, rawTurnInput, easeExp(dt, inputSmoothRate));
  enemy.aiPitchInput = THREE.MathUtils.lerp(enemy.aiPitchInput || 0, rawPitchInput, easeExp(dt, inputSmoothRate));

  const rawBoost = fighterPatrolMode
    ? false
    : squad.mode === 'depart'
      || (squad.mode === 'swarm' && currentAltitude <= desiredSwarmAltitude + atmosphereThickness * 0.08)
      || (squad.mode === 'approach' && currentAltitude > Math.max(config.planetCaptureAltitude * 1.25, desiredApproachAltitude));
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

  const targetPlanet = getEnemyTargetPlanet(state, enemy);
  if (!targetPlanet) {
    return;
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
  if (shouldEnemyStayBound(enemy, squad, targetPlanet, targetAltitude)) {
    if (enemy.boundPlanet !== targetPlanet || enemy.flightMode !== 'bound') {
      beginPlanetCapture(enemy, targetPlanet);
    }
  } else {
    enemy.boundPlanet = targetPlanet;
    enemy.flightMode = 'free';
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

    if (squad.mode === 'approach' && avgAltitude <= config.planetCaptureAltitude) {
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
      enemy.up.copy(squad.holdEntryUp);
      enemy.forward.copy(squad.holdTangent).normalize();
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
    return;
  }

  if (squad.mode === 'hold') {
    squad.holdAngle += dt * squad.holdAngularSpeed;
    squad.holdBeta += dt * squad.holdBetaSpeed;
    squad.holdReorientTimer = Math.min(
      squad.holdReorientDuration,
      squad.holdReorientTimer + dt
    );
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
    const reorientT = smoothstep(0, Math.max(0.0001, squad.holdReorientDuration), squad.holdReorientTimer);
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
    if (!squad.holdReoriented && squad.holdReorientTimer >= squad.holdReorientDuration - 1e-6) {
      squad.holdReoriented = true;
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
    return;
  }

  if (squad.mode === 'exit') {
    const exitDirection = tempVecC.copy(enemy.position).sub(planet.position);
    if (exitDirection.lengthSq() < 1e-6) {
      exitDirection.copy(squad.mothershipExitDirection || squad.holdRadial || radial);
    }
    exitDirection.normalize();
    const previous = enemy.position.clone();
    const radialDistance = Math.max(enemy.position.distanceTo(planet.position), 1);
    const exitSpeed = Math.max(
      squad.exitSpeedFactor * Math.pow(radialDistance, squad.approachExponent)
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
  const atmosphericFlightActive = ship.flightMode === 'bound' && atmosphereDepth > 0;
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
    if (relativeVelocity.lengthSq() > altitudeSpeedCap * altitudeSpeedCap) {
      const softCap = THREE.MathUtils.lerp(ship.speed, altitudeSpeedCap, speedTransitionScale);
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
    updateEnemySquads(state, dt, state.time);
    updateMothershipSquads(state, dt, state.time);
    updateProjectiles(state, dt);
    updateEnemyExplosions(state, dt);
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
