import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
let THREE;
try {
  THREE = await import('./lib/three.module.js');
} catch (error) {
  throw new Error('Orbitals testbench could not load ./lib/three.module.js from the provided bundle.', { cause: error });
}
import { config } from './orbitals_config.js';
const {
  createOrbitalsSim,
  ENEMY_MODEL_FILES_BY_FAMILY,
  getEncounterAnchorPosition,
  parseSeed
} = await import('./Orbitals_Sim.js');
const {
  createSpatialHash,
  querySpatialHash
} = await import('./sim/spatial_hash.js');
const {
  computeShipFireDirection,
  findProjectileHomingTarget,
  spawnProjectileBurst,
  steerProjectileTowardsTarget,
  updateProjectiles
} = await import('./sim/projectiles.js');
const { createEnemyState } = await import('./sim/state.js');

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const NEUTRAL_CONTROLS = {
  turnInput: 0,
  pitchInput: 0,
  boost: false,
  brake: false,
  respawn: false
};

const SHALLOW_DIVE_PITCH_INPUT = 0.5;

config.startWithInitialInvasion = false;


const LEGACY_SIM_NUMERIC_CONSTANTS = new Set();

const RENDERER_OWNED_STATE_KEYS = new Set([
  'root',
  'visual',
  'modelPivot',
  'model',
  'modelRoot',
  'engineEffects',
  'glow',
  'halo'
]);

function readSimulationSourceFiles() {
  const files = [
    ['Orbitals_Sim.js', new URL('./Orbitals_Sim.js', import.meta.url)]
  ];
  const simDirectory = new URL('./sim/', import.meta.url);
  const moduleNames = readdirSync(simDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    .map((entry) => entry.name)
    .sort();
  for (const moduleName of moduleNames) {
    files.push([`sim/${moduleName}`, new URL(`./sim/${moduleName}`, import.meta.url)]);
  }
  return files.map(([name, url]) => ({
    name,
    source: readFileSync(url, 'utf8')
  }));
}

function runSimulationArchitectureGuardTest() {
  const sources = readSimulationSourceFiles();
  const numericConstantPattern = /^(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?\s*;/;
  const visualFieldPattern = /^\s*(root|visual|modelPivot|model|modelRoot|engineEffects|glow|halo)\s*:/;
  const visualConstructorPattern = /\bnew\s+THREE\.(?:Object3D|Group|Scene|Mesh|Sprite|Points|Line|LineSegments|WebGLRenderer|PerspectiveCamera|OrthographicCamera|Audio|PositionalAudio|AudioListener|\w*Material|\w*Geometry|Texture|CanvasTexture)\b/;
  const newNumericConstants = [];
  const unexpectedVisualFields = [];
  const visualConstructors = [];

  for (const { name, source } of sources) {
    let functionContext = '<module>';
    const lines = source.split(/\r?\n/);
    lines.forEach((line, index) => {
      const functionMatch = line.match(/^(?:export\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/);
      if (functionMatch) {
        functionContext = functionMatch[1];
      }

      const numericMatch = line.match(numericConstantPattern);
      if (numericMatch) {
        const key = `${name}:${numericMatch[1]}`;
        if (!LEGACY_SIM_NUMERIC_CONSTANTS.has(key)) {
          newNumericConstants.push(`${key} at line ${index + 1}`);
        }
      }

      const visualFieldMatch = line.match(visualFieldPattern);
      if (visualFieldMatch) {
        const key = `${name}:${functionContext}:${visualFieldMatch[1]}`;
        unexpectedVisualFields.push(`${key} at line ${index + 1}`);
      }

      if (visualConstructorPattern.test(line)) {
        visualConstructors.push(`${name}:${index + 1}: ${line.trim()}`);
      }
    });
  }

  assert.deepEqual(
    newNumericConstants,
    [],
    `new module-level numeric gameplay constants must be moved to orbitals_config.js:\n${newNumericConstants.join('\n')}`
  );
  assert.deepEqual(
    unexpectedVisualFields,
    [],
    `new renderer-owned fields must not be added to simulation state:\n${unexpectedVisualFields.join('\n')}`
  );
  assert.deepEqual(
    visualConstructors,
    [],
    `simulation modules must not construct Three.js presentation objects:\n${visualConstructors.join('\n')}`
  );

  console.log(
    `PASS architecture-guards: files=${sources.length} legacyConstants=${LEGACY_SIM_NUMERIC_CONSTANTS.size} rendererFields=0`
  );
}

async function runLowRiskSimulationModuleSmokeTest() {
  const expectedExports = new Map([
    ['./sim/math.js', ['parseSeed', 'mulberry32', 'clamp01', 'smoothstep', 'easeExp', 'buildBasisFromNormal']],
    ['./sim/events.js', ['pushEvent', 'formatCombatLog']],
    ['./sim/world.js', ['createPlanetConfig', 'createFuelMote', 'pickRandomPlanetIndex', 'updateFuelMotes', 'updatePlanets']],
    ['./sim/projectiles.js', ['segmentIntersectsSphere', 'findProjectileHomingTarget', 'steerProjectileTowardsTarget', 'spawnProjectileBurst', 'computeShipFireDirection', 'updateProjectiles']],
    ['./sim/effects.js', ['createEnemyExplosionState', 'spawnEnemyExplosion', 'updateEnemyExplosions']],
    ['./sim/spatial_hash.js', ['createSpatialHash', 'querySpatialHash']]
  ]);

  for (const [specifier, names] of expectedExports) {
    const module = await import(specifier);
    for (const name of names) {
      assert.equal(typeof module[name], 'function', `${specifier} must explicitly export ${name}()`);
    }
  }

  console.log(`PASS low-risk-module-imports: modules=${expectedExports.size}`);
}

function runSpatialHashNeighborTest() {
  const items = [
    { id: 'near', position: new THREE.Vector3(2, 0, 0) },
    { id: 'adjacent', position: new THREE.Vector3(11, 0, 0) },
    { id: 'far', position: new THREE.Vector3(80, 0, 0) }
  ];
  const hash = createSpatialHash(items, 10);
  const candidates = [];
  querySpatialHash(hash, new THREE.Vector3(0, 0, 0), 12, (item) => {
    candidates.push(item.id);
    return true;
  });
  candidates.sort();

  assert.deepEqual(candidates, ['adjacent', 'near']);
  console.log(`PASS spatial-hash-neighbor-query: candidates=${candidates.join(',')}`);
}

async function runPhaseDModuleSmokeTest() {
  const expectedExports = new Map([
    ['./sim/physics.js', [
      'computeAtmosphereLiftState',
      'computeFreeGravityPull',
      'clampShipSpeed',
      'syncShipWorldState',
      'transferShipToPlanet',
      'beginPlanetCapture',
      'vectorLikeTo',
      'updateFlightState'
    ]],
    ['./sim/player.js', [
      'respawnShip',
      'crashPlayerShip',
      'crashPlayerShipIntoSun',
      'updateShipState'
    ]],
    ['./sim/enemies.js', [
      'getEnemyFamilyFiles',
      'updateEnemyShipState'
    ]],
    ['./sim/encounters.js', [
      'createEncounter',
      'createEncounterEntity',
      'damageEncounterEntity',
      'getEncounterById',
      'getEncounterAnchorPosition',
      'getEncounterAnchorVelocity',
      'getEncounterEnemies',
      'getEncounterProtectedEntity',
      'markEncounterActive',
      'ensurePlanetInvasionEncounterForMothership',
      'registerEncounterEnemyReleased',
      'registerEncounterEnemyDestroyed',
      'updateEncounterEntities',
      'isEncounterActive',
      'updateEncounterDirector'
    ]],
    ['./sim/motherships.js', [
      'spawnMothershipSquad',
      'spawnFighterSquadFromMothership',
      'updateMothershipEnemy',
      'updateMothershipSquads'
    ]],
    ['./sim/main.js', ['stepGame']]
  ]);

  for (const [specifier, names] of expectedExports) {
    const module = await import(specifier);
    for (const name of names) {
      assert.equal(typeof module[name], 'function', `${specifier} must explicitly export ${name}()`);
    }
  }

  console.log(`PASS phase-d-module-imports: modules=${expectedExports.size}`);
}

function resolveGamepadStartRestartAction({ loaded, gameStarted, crashed, crashTimer = 0, firePressed, crashRespawnDelay, fireLatch = false }) {
  if (!loaded || !firePressed) {
    return { action: null, fireLatch: false };
  }
  if (!gameStarted) {
    return { action: 'start', fireLatch: true };
  }
  if (crashed && crashTimer >= crashRespawnDelay) {
    return { action: 'restart', fireLatch: true };
  }
  return { action: null, fireLatch };
}

function resolveBenchSeed() {
  const rawSeed = process.env.ORBITALS_SEED ?? process.argv[2] ?? '';
  if (rawSeed === '') {
    return config.debug ? config.debugSeed : parseSeed('');
  }
  return parseSeed(rawSeed);
}

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

function buildPlanetFireCamera(ship, state) {
  const planet = ship.boundPlanet || state.nearestPlanet;
  assert.ok(planet, 'expected a planet to build the fire camera');

  const camera = new THREE.PerspectiveCamera(54, 16 / 9, 0.1, 1500000);
  const depth = planet.atmosphereRadius > planet.radius
    ? THREE.MathUtils.clamp(
      (planet.atmosphereRadius - state.nearestAltitude) / (planet.atmosphereRadius - planet.radius),
      0,
      1
    )
    : 0;
  const camDistance = THREE.MathUtils.lerp(config.shipCamDistance * 1.06, config.shipCamDistance * 0.96, depth);
  const camHeight = THREE.MathUtils.lerp(config.shipCamHeight * 1.08, config.shipCamHeight * 0.92, depth);
  camera.position.copy(ship.position)
    .addScaledVector(ship.forward, -camDistance)
    .addScaledVector(ship.up, camHeight);
  camera.up.copy(ship.up);
  camera.lookAt(ship.position.clone().addScaledVector(ship.forward, 10));
  return camera;
}

function computeRawFireDirection(camera, aimX, aimY, viewportWidth, viewportHeight) {
  const halfWidth = Math.max(1, viewportWidth * 0.5);
  const halfHeight = Math.max(1, viewportHeight * 0.5);
  const ndcX = (aimX * config.reticleOffsetPx) / halfWidth;
  const ndcY = -(aimY * config.reticleOffsetPx) / halfHeight;
  camera.updateMatrixWorld(true);
  const near = new THREE.Vector3(ndcX, ndcY, -1).unproject(camera);
  const far = new THREE.Vector3(ndcX, ndcY, 1).unproject(camera);
  return far.sub(near).normalize();
}

function configureBoundFireState(state, planetVelocity, relativeVelocity = new THREE.Vector3()) {
  const ship = state.ship;
  const planet = ship.boundPlanet;
  assert.ok(ship && planet, 'expected a bound ship for the projectile regression setup');

  const previousOffset = new THREE.Vector3().copy(planetVelocity).multiplyScalar(1 / 60);
  planet.velocity.copy(planetVelocity);
  planet.previousPosition.copy(planet.position).sub(previousOffset);

  ship.relativePosition.copy(ship.position).sub(planet.position);
  ship.relativeVelocity.copy(relativeVelocity);
  ship.position.copy(planet.position).add(ship.relativePosition);
  ship.velocity.copy(planet.velocity).add(ship.relativeVelocity);
  ship.speed = ship.relativeVelocity.length();
  ship.flightMode = 'bound';
  ship.recaptureLock = Math.max(ship.recaptureLock || 0, config.shipRecaptureDelay + 1);
  ship.fireCooldown = 0;

  state.nearestPlanet = planet;
  state.nearestDistance = ship.position.distanceTo(planet.position);
  state.nearestAltitude = Math.max(0, state.nearestDistance - planet.radius);
}

function assertExactKeys(actual, expected, label) {
  const sortedActual = [...actual].sort();
  const sortedExpected = [...expected].sort();
  assert.deepEqual(sortedActual, sortedExpected, `${label} keys changed unexpectedly`);
}

function averageEnemyDistanceToPlanet(state, squadId, planet) {
  const enemies = state.enemies.filter((enemy) => enemy.squadId === squadId);
  assert.ok(enemies.length > 0, `expected squad ${squadId} to have active enemies`);
  return enemies.reduce((sum, enemy) => sum + enemy.position.distanceTo(planet.position), 0) / enemies.length;
}

function averageEnemyAltitudeToPlanet(state, squadId, planet) {
  return averageEnemyDistanceToPlanet(state, squadId, planet) - planet.radius;
}

function nearestBodyDistance(position, planets) {
  let nearest = position.length();
  for (const planet of planets) {
    nearest = Math.min(nearest, position.distanceTo(planet.position));
  }
  return nearest;
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

function buildPlayerFrame(ship) {
  const forward = ship.forward.clone().normalize();
  const up = ship.up.clone().normalize().sub(forward.clone().multiplyScalar(ship.up.clone().normalize().dot(forward)));
  if (up.lengthSq() < 1e-8) {
    up.copy(Math.abs(forward.dot(WORLD_UP)) > 0.85
      ? new THREE.Vector3(1, 0, 0).cross(forward)
      : WORLD_UP.clone().sub(forward.clone().multiplyScalar(WORLD_UP.dot(forward))));
  }
  up.normalize();
  const right = forward.clone().cross(up).normalize();
  return { forward, up, right };
}

function measureEnemyInPlayerFrame(player, enemy) {
  const frame = buildPlayerFrame(player);
  const offset = enemy.position.clone().sub(player.position);
  const distance = offset.length();
  const direction = distance > 1e-8 ? offset.clone().multiplyScalar(1 / distance) : frame.forward.clone();
  const forwardDot = THREE.MathUtils.clamp(direction.dot(frame.forward), -1, 1);
  const angleDeg = THREE.MathUtils.radToDeg(Math.acos(forwardDot));
  return {
    distance,
    forward: offset.dot(frame.forward),
    right: offset.dot(frame.right),
    up: offset.dot(frame.up),
    angleDeg
  };
}

function isEnemyShootableFromPlayer(player, enemy, cfg = config) {
  const metrics = measureEnemyInPlayerFrame(player, enemy);
  return metrics.angleDeg <= cfg.encounterShootableAngleDeg
    && metrics.distance >= cfg.encounterShootableMinDistance
    && metrics.distance <= cfg.encounterShootableMaxDistance;
}

function projectPresentationSlotToPlanet(state, planet, slot, altitudeFactor = config.fighterPatrolAltitudeFactor) {
  const direction = slot.clone().sub(planet.position);
  if (direction.lengthSq() < 1e-8) {
    direction.copy(state.ship.position).sub(planet.position);
  }
  if (direction.lengthSq() < 1e-8) {
    direction.copy(WORLD_UP);
  }
  direction.normalize();
  const atmosphereThickness = Math.max(planet.atmosphereRadius - planet.radius, 1);
  return planet.position.clone().addScaledVector(direction, planet.radius + atmosphereThickness * altitudeFactor);
}

function placeEnemyRelativeToPlayerOnPlanet(state, planet, enemy, options = {}) {
  const frame = buildPlayerFrame(state.ship);
  const rawSlot = state.ship.position.clone()
    .addScaledVector(frame.forward, options.forwardDistance ?? 0)
    .addScaledVector(frame.right, options.rightDistance ?? 0)
    .addScaledVector(frame.up, options.upDistance ?? 0);
  const slot = projectPresentationSlotToPlanet(state, planet, rawSlot, options.altitudeFactor ?? config.fighterPatrolAltitudeFactor);
  enemy.position.copy(slot);
  enemy.previousPosition.copy(slot);
  enemy.up.copy(slot.clone().sub(planet.position).normalize());
  enemy.forward.copy(options.forward ? options.forward.clone().normalize() : state.ship.forward.clone().normalize());
  enemy.velocity.copy(enemy.forward).multiplyScalar(enemy.speed || 14);
  enemy.relativePosition.copy(enemy.position).sub(planet.position);
  enemy.relativeVelocity.copy(enemy.velocity).sub(planet.velocity);
  enemy.boundPlanet = planet;
  enemy.flightMode = 'bound';
  enemy.captureTimer = config.shipCaptureBlendTime;
  enemy.recaptureLock = 0;
  return slot;
}

function createTestFighter(state, squad, encounter, planet, options = {}) {
  const planetIndex = state.planets.indexOf(planet);
  const enemy = {
    id: state.nextEnemyId,
    squadId: squad.id,
    kind: 'fighter',
    family: 'Standard',
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
    speed: options.speed ?? 14,
    radius: 2.6,
    health: config.enemyHitPoints,
    speedScale: options.speedScale ?? 1,
    turnScale: options.turnScale ?? 2.2,
    upScale: options.upScale ?? 1.8,
    visualScale: 1,
    destroyed: false,
    boundPlanet: planet,
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
    atmosphericCruiseAltitudeFactor: config.fighterPatrolAltitudeFactor,
    hasSmoothedTargetPoint: false,
    smoothedTargetPoint: new THREE.Vector3(),
    formationAngle: 0,
    formationRadius: 20,
    phase: 0,
    mode: 'swarm',
    targetPlanetIndex: planetIndex,
    nextPlanetIndex: planetIndex,
    modeTimer: 0,
    combatRole: 'reserve',
    presentation: null,
    objectiveAttack: null,
    encounterId: encounter.id,
    lastPresentationTime: -Infinity,
    presentationShootableFrames: 0,
    presentationKindLastUsed: '',
    isPrimaryThreat: false,
    hudPriority: config.encounterReserveHudPriority,
    spawnFrame: state.frameIndex - Math.ceil(config.encounterCandidateMinAge * 60) - 1,
    spawnTime: state.time - config.encounterCandidateMinAge - 1,
    parentMothershipId: squad.parentMothershipId
  };
  state.nextEnemyId += 1;
  state.enemies.push(enemy);
  encounter.spawnedEnemyIds.push(enemy.id);
  encounter.totalReleased += 1;
  return enemy;
}

function createSingleFighterPresentationScenario(kind, options = {}) {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();
  const { state } = sim;
  state.mothershipSpawnTimer = Infinity;
  stepSim(sim, 120, NEUTRAL_CONTROLS);
  const planet = state.ship.boundPlanet;
  const planetIndex = state.planets.indexOf(planet);
  const encounter = sim.createEncounter({
    type: options.encounterType || 'planetInvasion',
    status: 'active',
    anchorKind: 'planet',
    anchorPlanetIndex: planetIndex,
    objectiveKind: 'clearEnemies',
    spawnedEnemyIds: [],
    totalReleased: 0
  });
  const squad = {
    id: state.nextEnemySquadId,
    kind: 'fighter',
    family: 'Standard',
    familyFiles: [],
    targetPlanetIndex: planetIndex,
    nextPlanetIndex: planetIndex,
    departPlanetIndex: -1,
    departVector: new THREE.Vector3(1, 0, 0),
    mode: 'swarm',
    modeTimer: 999,
    orbitPhase: 0,
    orbitDirection: 1,
    orbitProgress: 0,
    orbitLastAngle: 0,
    swarmDuration: 999,
    departDuration: 999,
    parentMothershipId: 9001,
    fighterSettleTimer: 999,
    fighterPatrolAltitudeFactor: config.fighterPatrolAltitudeFactor,
    encounterId: encounter.id
  };
  state.nextEnemySquadId += 1;
  state.enemySquads.push(squad);
  state.enemySquad = squad;
  const enemy = createTestFighter(state, squad, encounter, planet, options);
  const side = options.side ?? 1;
  if (kind === 'sideCross') {
    placeEnemyRelativeToPlayerOnPlanet(state, planet, enemy, {
      forwardDistance: options.forwardDistance ?? 260,
      rightDistance: options.rightDistance ?? side * 160,
      upDistance: options.upDistance ?? 35
    });
  } else if (kind === 'headOnBreakaway') {
    placeEnemyRelativeToPlayerOnPlanet(state, planet, enemy, {
      forwardDistance: options.forwardDistance ?? 300,
      rightDistance: options.rightDistance ?? side * 30,
      upDistance: options.upDistance ?? 45,
      forward: state.ship.forward.clone().multiplyScalar(-1)
    });
  } else {
    placeEnemyRelativeToPlayerOnPlanet(state, planet, enemy, {
      forwardDistance: options.forwardDistance ?? -60,
      rightDistance: options.rightDistance ?? side * 25,
      upDistance: options.upDistance ?? 35
    });
    const catchupAim = state.ship.position.clone().addScaledVector(state.ship.forward, 140).sub(enemy.position);
    if (catchupAim.lengthSq() > 1e-8) {
      enemy.forward.copy(catchupAim.normalize());
      enemy.velocity.copy(enemy.forward).multiplyScalar(enemy.speed);
      enemy.relativeVelocity.copy(enemy.velocity).sub(planet.velocity);
    }
  }
  const forced = sim.forceEnemyPresentation(enemy.id, kind, {
    encounterId: encounter.id,
    side,
    maxDuration: options.maxDuration
  });
  assert.ok(forced, `expected to force ${kind} presentation`);
  return { sim, state, planet, encounter, squad, enemy, side };
}

function countShootableFramesDuring(sim, enemyId, steps, controls = NEUTRAL_CONTROLS) {
  let shootableFrames = 0;
  for (let i = 0; i < steps; i += 1) {
    sim.step(1 / 60, controls);
    const enemy = sim.state.enemies.find((candidate) => candidate.id === enemyId);
    if (!enemy) {
      break;
    }
    if (isEnemyShootableFromPlayer(sim.state.ship, enemy)) {
      shootableFrames += 1;
    }
  }
  return shootableFrames;
}

function assertEnemyDidNotCrashOrDisappearUnexpectedly(state, enemyId) {
  const death = state.eventLog.find((event) => event.type === 'enemy-death' && event.enemyId === enemyId);
  assert.ok(!death, `expected enemy ${enemyId} to survive the scenario, died cause=${death?.cause}`);
  assert.ok(state.enemies.some((enemy) => enemy.id === enemyId && enemy.health > 0), `expected enemy ${enemyId} to remain alive`);
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

function assertNoRendererOwnedFields(object, label) {
  assert.ok(object && typeof object === 'object', `${label} must be an object`);
  for (const key of RENDERER_OWNED_STATE_KEYS) {
    assert.ok(!Object.hasOwn(object, key), `${label} must not contain renderer-owned field ${key}`);
  }
}

function runPublicSimApiSmokeTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  assert.ok(sim.state && typeof sim.state === 'object', 'expected state to be exposed');
  assert.equal(typeof sim.bootstrapWorld, 'function', 'expected bootstrapWorld to be exposed');
  assert.equal(typeof sim.step, 'function', 'expected step to be exposed');
  assert.equal(typeof sim.respawnShip, 'function', 'expected respawnShip to be exposed');
  assert.equal(typeof sim.createEncounter, 'function', 'expected createEncounter to be exposed');
  assert.equal(typeof sim.createEncounterEntity, 'function', 'expected createEncounterEntity to be exposed');
  assert.equal(typeof sim.forceEnemyPresentation, 'function', 'expected forceEnemyPresentation to be exposed');
  assert.equal(typeof sim.destroyEnemy, 'function', 'expected destroyEnemy to be exposed');
  assert.equal(typeof sim.damageEncounterEntity, 'function', 'expected damageEncounterEntity to be exposed');

  sim.bootstrapWorld();
  assert.ok(sim.state.loaded, 'expected bootstrapWorld to mark the sim as loaded');
  assert.ok(sim.state.ship, 'expected bootstrapWorld to create a ship');
  assertExactKeys(
    Object.keys(sim.state.ship),
    [
      'bank',
      'boostTimer',
      'boundPlanet',
      'captureTimer',
      'fireCooldown',
      'flightMode',
      'forward',
      'gravity',
      'muzzleOffset',
      'pitchIdleTime',
      'position',
      'recaptureLock',
      'relativePosition',
      'relativeVelocity',
      'speed',
      'up',
      'velocity',
    ],
    'ship'
  );

  assertNoRendererOwnedFields(sim.state.ship, 'ship');
  sim.state.planets.forEach((planet, index) => {
    assertNoRendererOwnedFields(planet, `planet[${index}]`);
  });
  sim.state.fuelMotes.forEach((mote, index) => {
    assertNoRendererOwnedFields(mote, `fuelMote[${index}]`);
  });
  sim.state.enemies.forEach((enemy, index) => {
    assertNoRendererOwnedFields(enemy, `enemy[${index}]`);
  });
  assertNoRendererOwnedFields(createEnemyState(), 'enemyFactoryState');

  const entity = sim.createEncounterEntity({
    position: sim.state.ship.position,
    forward: sim.state.ship.forward,
    up: sim.state.ship.up
  });
  assertNoRendererOwnedFields(entity, 'encounterEntity');

  sim.step(0, {
    ...NEUTRAL_CONTROLS,
    fire: true,
    fireDirection: sim.state.ship.forward.clone()
  });
  assert.equal(sim.state.projectiles.length, 1, 'expected smoke test to create one projectile');
  assertNoRendererOwnedFields(sim.state.projectiles[0], 'projectile');
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
      settledAltitude >= settledThickness * 0.2 && settledAltitude <= settledThickness * 0.85,
      `ship should settle somewhere in the atmosphere: altitude=${settledAltitude.toFixed(3)} band=${(settledThickness * 0.2).toFixed(3)}..${(settledThickness * 0.85).toFixed(3)}`
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

function runShipMaxMaxSpeedTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  state.ship.boundPlanet = null;
  state.ship.flightMode = 'free';
  state.ship.recaptureLock = 0;
  state.ship.position.set(20000, 20000, 20000);
  state.ship.relativePosition.copy(state.ship.position);
  state.ship.forward.set(1, 0, 0);
  state.ship.up.set(0, 1, 0);
  state.ship.speed = config.shipMaxMaxSpeed + 250;
  state.ship.velocity.copy(state.ship.forward).multiplyScalar(state.ship.speed);
  state.ship.relativeVelocity.copy(state.ship.velocity);
  state.speed = state.ship.speed;

  sim.step(1 / 60, NEUTRAL_CONTROLS);

  assert.ok(
    state.ship.speed <= config.shipMaxMaxSpeed + 1e-6,
    `expected ship speed to stay capped: speed=${state.ship.speed.toFixed(3)} cap=${config.shipMaxMaxSpeed.toFixed(3)}`
  );
  assert.ok(
    state.speed <= config.shipMaxMaxSpeed + 1e-6,
    `expected reported speed to stay capped: speed=${state.speed.toFixed(3)} cap=${config.shipMaxMaxSpeed.toFixed(3)}`
  );

  console.log(`PASS ship-max-max-speed: speed=${state.ship.speed.toFixed(3)} cap=${config.shipMaxMaxSpeed.toFixed(3)}`);
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

function runAtmosphereCenteredMouseReorientTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const planet = state.ship.boundPlanet;
  assert.ok(planet, 'expected the ship to start bound to a planet');

  const localUp = state.ship.position.clone().sub(planet.position).normalize();
  const tiltAxis = state.ship.up.clone().cross(state.ship.forward).normalize();
  assert.ok(tiltAxis.lengthSq() > 1e-8, 'expected a valid tilt axis for the reorient test');

  const initialForward = state.ship.forward.clone().applyAxisAngle(tiltAxis, 0.35).normalize();
  const initialUp = state.ship.up.clone().applyAxisAngle(tiltAxis, 0.35).normalize();
  state.ship.forward.copy(initialForward);
  state.ship.up.copy(initialUp);
  state.ship.bank = 0;
  state.ship.pitchIdleTime = 0;
  state.ship.captureTimer = config.shipCaptureBlendTime;
  state.ship.flightMode = 'bound';

  const initialUpDot = state.ship.up.clone().normalize().dot(localUp);
  const initialForwardDot = state.ship.forward.clone().normalize().dot(localUp);

  stepSim(sim, 90, { ...NEUTRAL_CONTROLS, pitchInput: 0.05, mouseIdle: true });

  const finalUpDot = state.ship.up.clone().normalize().dot(localUp);
  const finalForwardDot = state.ship.forward.clone().normalize().dot(localUp);

  assert.ok(
    state.ship.pitchIdleTime > config.shipPitchReorientDelay,
    `expected centered mouse input to advance pitchIdleTime past ${config.shipPitchReorientDelay.toFixed(3)}s, got ${state.ship.pitchIdleTime.toFixed(3)}s`
  );
  assert.ok(
    finalUpDot > initialUpDot + 0.01,
    `expected the ship up vector to move back toward the horizon: initial=${initialUpDot.toFixed(3)} final=${finalUpDot.toFixed(3)}`
  );
  assert.ok(
    Math.abs(finalForwardDot) < Math.abs(initialForwardDot) + 0.02,
    `expected the ship forward vector to stay under active control while centered: initial=${initialForwardDot.toFixed(3)} final=${finalForwardDot.toFixed(3)}`
  );

  console.log(
    `PASS atmosphere-centered-mouse-reorient: idle=${state.ship.pitchIdleTime.toFixed(3)} up=${initialUpDot.toFixed(3)}->${finalUpDot.toFixed(3)}`
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
  if (config.freeGravityTurnRate <= 0 && config.freeGravityMaxTurnRate <= 0) {
    console.log('SKIP free-moves-along-nose: temporarily disabled while free-space gravity is being reworked');
    return;
  }
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
  if (config.freeGravityTurnRate <= 0 && config.freeGravityMaxTurnRate <= 0) {
    console.log('SKIP free-approach-near-planet: temporarily disabled while free-space gravity is being reworked');
    return;
  }
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
  if (config.freeGravityTurnRate <= 0 && config.freeGravityMaxTurnRate <= 0) {
    console.log('SKIP free-gravity-counteract: temporarily disabled while free-space gravity is being reworked');
    return;
  }
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

function runFreeGravityLowSpeedBendTest() {
  if (config.freeGravityTurnRate <= 0 && config.freeGravityMaxTurnRate <= 0) {
    console.log('SKIP free-gravity-low-speed: temporarily disabled while free-space gravity is being reworked');
    return;
  }
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const planet = state.planets[1] || state.planets[0];
  assert.ok(planet, 'expected a planet for the low-speed gravity test');

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
  const initialForward = tangent.clone().addScaledVector(planetRadial, 0.04).normalize();
  const initialUp = planetRadial.clone().sub(initialForward.clone().multiplyScalar(planetRadial.dot(initialForward))).normalize();
  const initialAngle = initialForward.angleTo(planetRadial);

  configureFreeFlightShip(
    state,
    planet,
    worldPosition,
    initialForward,
    initialUp,
    1.5,
    {
      bank: 0,
      recaptureLock: config.shipRecaptureDelay + 8
    }
  );

  stepSim(sim, 240, NEUTRAL_CONTROLS);

  const finalForward = state.ship.forward.clone().normalize();
  const finalAngle = finalForward.angleTo(initialForward);
  const finalClimbDot = finalForward.dot(planetRadial);

  assert.strictEqual(state.ship.flightMode, 'free', 'expected the ship to stay in free flight');
  assert.ok(
    finalAngle > 0.02,
    `expected gravity to still bend the nose at low speed: angle=${finalAngle.toFixed(3)}`
  );
  assert.ok(
    Math.abs(state.ship.bank) <= 0.05,
    `expected low-speed gravity not to induce roll: bank=${state.ship.bank.toFixed(3)}`
  );
  assert.ok(
    finalClimbDot < 0.9,
    `expected gravity to remain a gentle nudge at low speed, not a hard lock: climb=${finalClimbDot.toFixed(3)}`
  );

  console.log(
    `PASS free-gravity-low-speed: initial=${initialAngle.toFixed(3)} final=${finalAngle.toFixed(3)} climb=${finalClimbDot.toFixed(3)} bank=${state.ship.bank.toFixed(3)}`
  );
}

function runFreeGravityHighSpeedTest() {
  if (config.freeGravityTurnRate <= 0 && config.freeGravityMaxTurnRate <= 0) {
    console.log('SKIP free-gravity-speed: temporarily disabled while free-space gravity is being reworked');
    return;
  }
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
    `low speed should bend more than high speed while remaining roll-free: low=${lowAngle.toFixed(3)} high=${highAngle.toFixed(3)}`
  );

  console.log(`PASS free-gravity-speed: low=${lowAngle.toFixed(3)} high=${highAngle.toFixed(3)}`);
}

function runArcadeOrbitViabilityTest() {
  if (config.freeGravityTurnRate <= 0 && config.freeGravityMaxTurnRate <= 0) {
    console.log('SKIP arcade-orbit: temporarily disabled while free-space gravity is being reworked');
    return;
  }
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

  const carrierVelocity = ship.velocity.clone();
  const relativeVelocity = state.projectiles[0].velocity.clone().sub(carrierVelocity);
  const spawnDistance = state.projectiles[0].position.distanceTo(ship.position);
  const expectedProjectileSpeed = config.shipProjectileSpeed + ship.speed * 0.35;
  const expectedSpawnDistance = 0;
  const projectileSpeed = relativeVelocity.length();
  const projectileDirection = relativeVelocity.clone().normalize();

  assert.ok(
    projectileDirection.dot(fireDirection) > 0.98,
    `projectile should follow the reticle direction: dot=${projectileDirection.dot(fireDirection).toFixed(3)}`
  );
  assert.ok(
    Math.abs(projectileSpeed - expectedProjectileSpeed) < 1e-3,
    `projectile speed should use config: got=${projectileSpeed.toFixed(3)} expected=${expectedProjectileSpeed.toFixed(3)}`
  );
  assert.ok(
    spawnDistance <= 0.001,
    `projectile should spawn from the muzzle: distance=${spawnDistance.toFixed(3)} expected=${expectedSpawnDistance.toFixed(3)}`
  );

  console.log(
    `PASS projectile-fire: dot=${projectileDirection.dot(fireDirection).toFixed(3)} speed=${projectileSpeed.toFixed(3)} spawn=${spawnDistance.toFixed(3)}`
  );
}

function runProjectileNormalScenarioSmokeTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  stepSim(sim, 120, NEUTRAL_CONTROLS);
  const { state } = sim;
  const ship = state.ship;
  const planet = ship.boundPlanet;
  assert.ok(ship, 'expected a ship for the normal scenario smoke test');
  assert.ok(planet, 'expected the ship to remain bound to a planet');

  const fireDirection = ship.forward.clone().normalize();
  sim.step(0, { ...NEUTRAL_CONTROLS, fire: true, fireDirection });

  assert.strictEqual(state.projectiles.length, 1, 'expected a single projectile in the normal smoke test');
  stepSim(sim, 6, NEUTRAL_CONTROLS);
  assert.ok(state.projectiles.length >= 1, 'expected the shot to remain active after a few frames');

  console.log(
    `PASS projectile-normal-scenario-smoke: count=${state.projectiles.length} altitude=${state.nearestAltitude.toFixed(3)}`
  );
}

function runProjectileBoundFlightInheritedVelocityTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  stepSim(sim, 120, NEUTRAL_CONTROLS);
  const { state } = sim;
  const ship = state.ship;
  assert.ok(ship && ship.boundPlanet, 'expected a bound ship for the inherited velocity test');

  const planetVelocity = new THREE.Vector3(800, 0, 0);
  configureBoundFireState(state, planetVelocity, new THREE.Vector3(0, 0, 0));

  const camera = buildPlanetFireCamera(ship, state);
  const fireDirection = computeRawFireDirection(camera, 0.55, -0.35, 1280, 720);
  const expectedProjectileSpeed = config.shipProjectileSpeed;

  sim.step(0, { ...NEUTRAL_CONTROLS, fire: true, fireDirection });
  assert.strictEqual(state.projectiles.length, 1, 'expected a projectile to spawn in bound flight');

  const projectile = state.projectiles[0];
  const carrierVelocity = ship.velocity.clone();
  const worldRelativeVelocity = projectile.velocity.clone().sub(carrierVelocity);

  assert.ok(
    Math.abs(projectile.inheritedVelocity.distanceTo(carrierVelocity)) < 1e-3,
    `expected bound-flight projectiles to inherit the carrier velocity: projectile=${projectile.inheritedVelocity.length().toFixed(3)} carrier=${carrierVelocity.length().toFixed(3)}`
  );
  assert.ok(
    Math.abs(worldRelativeVelocity.length() - expectedProjectileSpeed) < 1e-3,
    `expected bound-flight projectiles to keep the configured shot speed: got=${worldRelativeVelocity.length().toFixed(3)} expected=${expectedProjectileSpeed.toFixed(3)}`
  );
  assert.ok(
    worldRelativeVelocity.clone().normalize().dot(fireDirection) > 0.9999,
    `expected the bound-flight shot to stay aligned with the reticle: dot=${worldRelativeVelocity.clone().normalize().dot(fireDirection).toFixed(6)}`
  );

  stepSim(sim, 3, NEUTRAL_CONTROLS);
  assert.ok(state.projectiles.length >= 1, 'expected the bound-flight projectile to remain alive for a few frames');

  console.log(
    `PASS projectile-bound-flight-world-velocity: rel=${worldRelativeVelocity.length().toFixed(3)} ship=${ship.velocity.length().toFixed(3)}`
  );
}

function runProjectileFireWhileMovingTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  stepSim(sim, 120, NEUTRAL_CONTROLS);
  const { state } = sim;
  const ship = state.ship;
  assert.ok(ship, 'expected a ship to exist for the moving-shot test');

  const shipSpeed = 220;
  const fireDirection = ship.forward.clone().normalize();
  const expectedProjectileSpeed = config.shipProjectileSpeed + shipSpeed * config.shipProjectileShipVelocityScale;

  ship.boundPlanet = null;
  ship.flightMode = 'free';
  ship.recaptureLock = config.shipRecaptureDelay + 5;
  ship.position.set(0, 0, 10000);
  ship.forward.copy(fireDirection);
  ship.up.set(0, 1, 0);
  ship.speed = shipSpeed;
  ship.velocity.copy(fireDirection).multiplyScalar(shipSpeed);
  ship.relativePosition.copy(ship.position);
  ship.relativeVelocity.copy(ship.velocity);
  ship.bank = 0;
  ship.boostTimer = 0;
  ship.fireCooldown = 0;
  ship.pitchIdleTime = 0;
  state.nearestPlanet = null;
  state.nearestDistance = Infinity;
  state.nearestAltitude = Infinity;

  sim.step(0, { ...NEUTRAL_CONTROLS, fire: true, fireDirection });
  assert.strictEqual(state.projectiles.length, 1, 'expected a projectile to fire while the ship is moving');

  stepSim(sim, 1, NEUTRAL_CONTROLS);
  assert.strictEqual(state.projectiles.length, 1, 'expected the projectile to remain in flight after one frame');

  const projectile = state.projectiles[0];
  const relativeVelocity = projectile.velocity.clone().sub(ship.velocity);
  const relativeSpeed = relativeVelocity.length();
  const projectileSpeed = projectile.velocity.length();
  const relativeDirection = relativeVelocity.clone().normalize();

  assert.ok(
    projectileSpeed > ship.velocity.length(),
    `expected the projectile to stay faster than the ship: projectile=${projectileSpeed.toFixed(3)} ship=${ship.velocity.length().toFixed(3)}`
  );
  assert.ok(
    Math.abs(relativeSpeed - expectedProjectileSpeed) < 1e-3,
    `expected inherited ship speed to remain part of the shot: got=${relativeSpeed.toFixed(3)} expected=${expectedProjectileSpeed.toFixed(3)}`
  );
  assert.ok(
    relativeDirection.dot(fireDirection) > 0.999,
    `expected the moving shot to stay aligned with the reticle: dot=${relativeDirection.dot(fireDirection).toFixed(3)}`
  );

  console.log(
    `PASS projectile-fire-moving: projectile=${projectileSpeed.toFixed(3)} ship=${ship.velocity.length().toFixed(3)} rel=${relativeSpeed.toFixed(3)}`
  );
}

function runProjectileNearPlanetSurvivalTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  stepSim(sim, 120, NEUTRAL_CONTROLS);
  const { state } = sim;
  const ship = state.ship;
  assert.ok(ship, 'expected a ship to exist for the near-planet projectile test');

  const fireDirection = ship.forward.clone().normalize();
  sim.step(0, { ...NEUTRAL_CONTROLS, fire: true, fireDirection });

  assert.strictEqual(state.projectiles.length, 1, 'expected a projectile to spawn near the planet');
  stepSim(sim, 15, NEUTRAL_CONTROLS);

  assert.ok(
    state.projectiles.length >= 1,
    'expected the projectile to survive the first few frames near the planet'
  );

  console.log(
    `PASS projectile-near-planet-survival: count=${state.projectiles.length} age=${state.projectiles[0].age.toFixed(3)}`
  );
}

function runProjectilePlanetAimRegressionTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  stepSim(sim, 120, NEUTRAL_CONTROLS);
  const { state } = sim;
  const ship = state.ship;
  const planet = ship.boundPlanet;
  assert.ok(ship, 'expected a ship to exist for the planet-aim regression test');
  assert.ok(planet, 'expected the ship to remain bound to a planet');

  const localUp = ship.position.clone().sub(planet.position).normalize();
  const camera = buildPlanetFireCamera(ship, state);
  const rawFireDirection = computeRawFireDirection(camera, 0, 0, 1280, 720);
  const safeFireDirection = computeShipFireDirection(ship, camera, 0, 0, 1280, 720);

  assert.ok(
    safeFireDirection.dot(rawFireDirection) > 0.9999,
    `expected the refactored shot to match the raw camera ray: dot=${safeFireDirection.dot(rawFireDirection).toFixed(6)}`
  );
  assert.ok(
    safeFireDirection.dot(localUp) > -0.2,
    `expected the center-reticle shot to stay broadly in front of the ship: upDot=${safeFireDirection.dot(localUp).toFixed(3)}`
  );
  assert.ok(
    safeFireDirection.dot(ship.forward.clone().normalize()) > 0.15,
    `expected the corrected center-reticle shot to stay in the ship-forward hemisphere: forwardDot=${safeFireDirection.dot(ship.forward.clone().normalize()).toFixed(3)}`
  );

  console.log(
    `PASS projectile-planet-aim-regression: upDot=${safeFireDirection.dot(localUp).toFixed(3)}`
  );
}

function runProjectileMovingPlanetHeadingDriftTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  stepSim(sim, 120, NEUTRAL_CONTROLS);
  const { state } = sim;
  const ship = state.ship;
  const planet = ship.boundPlanet;
  assert.ok(ship && planet, 'expected a bound ship for the moving-planet drift test');

  const localUp = ship.position.clone().sub(planet.position).normalize();
  const tangentVelocity = new THREE.Vector3(1, 0, 0).cross(localUp);
  if (tangentVelocity.lengthSq() < 1e-6) {
    tangentVelocity.copy(new THREE.Vector3(0, 0, 1)).cross(localUp);
  }
  tangentVelocity.normalize();

  const planetVelocity = tangentVelocity.clone().multiplyScalar(6200);
  const cruiseSpeed = Math.max(ship.speed || 0, 160);
  const baseForward = ship.forward.clone().sub(localUp.clone().multiplyScalar(ship.forward.dot(localUp)));
  if (baseForward.lengthSq() < 1e-6) {
    baseForward.copy(tangentVelocity.clone().cross(localUp));
  }
  baseForward.normalize();

  configureBoundFireState(state, planetVelocity, baseForward.clone().multiplyScalar(cruiseSpeed));
  state.enemies.length = 0;
  state.enemySquads.length = 0;
  state.enemySpawnTimer = 9999;
  state.mothershipSpawnTimer = 9999;
  state.eventLog.length = 0;

  const startPlanetPosition = planet.position.clone();
  const startPlanetPreviousPosition = planet.previousPosition.clone();
  const startRelativePosition = ship.relativePosition.clone();
  const headingOffsets = Array.from({ length: 24 }, (_, index) => index * (Math.PI * 2 / 24));
  const aimX = 0.55;
  const aimY = 0;
  const measurements = [];

  for (const headingOffset of headingOffsets) {
    planet.position.copy(startPlanetPosition);
    planet.previousPosition.copy(startPlanetPreviousPosition);
    planet.velocity.copy(planetVelocity);

    ship.boundPlanet = planet;
    ship.flightMode = 'bound';
    ship.captureTimer = config.shipCaptureBlendTime;
    ship.recaptureLock = config.shipRecaptureDelay + 1;
    ship.relativePosition.copy(startRelativePosition);
    ship.position.copy(startPlanetPosition).add(startRelativePosition);
    ship.forward.copy(baseForward).applyAxisAngle(localUp, headingOffset).normalize();
    ship.up.copy(localUp);
    ship.bank = 0;
    ship.relativeVelocity.copy(ship.forward).multiplyScalar(cruiseSpeed);
    ship.velocity.copy(planet.velocity).add(ship.relativeVelocity);
    ship.speed = cruiseSpeed;
    state.speed = cruiseSpeed;
    ship.fireCooldown = 0;
    state.projectiles.length = 0;
    state.nearestPlanet = planet;
    state.nearestDistance = ship.position.distanceTo(planet.position);
    state.nearestAltitude = Math.max(0, state.nearestDistance - planet.radius);

    const camera = buildPlanetFireCamera(ship, state);
    const fireDirection = computeRawFireDirection(camera, aimX, aimY, 1280, 720);
    sim.step(0, { ...NEUTRAL_CONTROLS, fire: true, fireDirection });
    assert.strictEqual(state.projectiles.length, 1, 'expected a projectile to spawn in the moving-planet drift test');

    const projectile = state.projectiles[0];
    const carrierVelocity = ship.velocity.clone();
    const relativeVelocity = projectile.velocity.clone().sub(carrierVelocity);
    const relativeSpeed = relativeVelocity.length();
    const expectedProjectileSpeed = config.shipProjectileSpeed + ship.speed * config.shipProjectileShipVelocityScale;
    const alignment = relativeSpeed > 1e-6 ? relativeVelocity.clone().normalize().dot(fireDirection) : 0;

    measurements.push({
      headingOffset,
      relativeSpeed,
      alignment
    });

    assert.ok(
      Math.abs(relativeSpeed - expectedProjectileSpeed) < 1e-3,
      `expected the moving-planet shots to keep the configured speed: speed=${relativeSpeed.toFixed(6)} expected=${expectedProjectileSpeed.toFixed(6)} heading=${headingOffset.toFixed(3)}`
    );
    assert.ok(
      alignment > 0.9999,
      `expected the moving-planet shots to stay on the reticle ray: alignment=${alignment.toFixed(6)} heading=${headingOffset.toFixed(3)}`
    );
  }

  console.log(`PASS projectile-moving-planet-heading-drift: ${JSON.stringify(measurements)}`);
}

function runProjectilePlanetFlightVelocityCapTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  stepSim(sim, 120, NEUTRAL_CONTROLS);
  const { state } = sim;
  const ship = state.ship;
  assert.ok(ship && ship.boundPlanet, 'expected a bound ship for the planetary-flight velocity cap test');

  const planetVelocity = new THREE.Vector3(5400, -2600, 1700);
  configureBoundFireState(state, planetVelocity, new THREE.Vector3(0, 0, 0));

  const camera = buildPlanetFireCamera(ship, state);
  const fireDirection = computeRawFireDirection(camera, 0, 0, 1280, 720);

  sim.step(0, { ...NEUTRAL_CONTROLS, fire: true, fireDirection });
  assert.strictEqual(state.projectiles.length, 1, 'expected a single projectile to spawn in planetary flight');

  const projectile = state.projectiles[0];
  const coords = projectile.velocity.clone().sub(ship.velocity);
  const limit = 1500;

  assert.ok(
    Math.abs(coords.x) < limit && Math.abs(coords.y) < limit && Math.abs(coords.z) < limit,
    `expected planetary-flight projectile ship-relative velocity to stay below ${limit} on every axis: velocity=${JSON.stringify({
      x: coords.x,
      y: coords.y,
      z: coords.z
    })}`
  );

  console.log(
    `PASS projectile-planet-flight-velocity-cap: relativeVelocity=(${coords.x.toFixed(3)}, ${coords.y.toFixed(3)}, ${coords.z.toFixed(3)})`
  );
}

function runProjectilePlanetMotionSpeedDiagnosticTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  stepSim(sim, 120, NEUTRAL_CONTROLS);
  const { state } = sim;
  const ship = state.ship;
  const planet = ship.boundPlanet;
  assert.ok(ship && planet, 'expected a bound ship for the planetary motion diagnostic test');

  const planetSpeed = planet.velocity.length();
  const shipSpeed = ship.velocity.length();

  const camera = buildPlanetFireCamera(ship, state);
  const fireDirection = computeRawFireDirection(camera, 0.15, -0.1, 1280, 720);
  sim.step(0, { ...NEUTRAL_CONTROLS, fire: true, fireDirection });
  assert.strictEqual(state.projectiles.length, 1, 'expected a single projectile to spawn for the planetary motion diagnostic test');

  const projectile = state.projectiles[0];
  const projectileWorldSpeed = projectile.velocity.length();
  const projectileRelativeSpeed = projectile.velocity.clone().sub(ship.velocity).length();

  console.log(
    `PASS projectile-planet-motion-speed-diagnostic: planetSpeed=${planetSpeed.toFixed(3)} shipSpeed=${shipSpeed.toFixed(3)} projectileWorldSpeed=${projectileWorldSpeed.toFixed(3)} projectileRelativeSpeed=${projectileRelativeSpeed.toFixed(3)}`
  );
}

function runGamepadStartRestartSmokeTest() {
  const titleFaceButton = resolveGamepadStartRestartAction({
    loaded: true,
    gameStarted: false,
    crashed: false,
    crashTimer: 0,
    firePressed: true,
    crashRespawnDelay: config.crashRespawnDelay,
    fireLatch: false
  });
  assert.deepEqual(titleFaceButton, { action: 'start', fireLatch: true }, 'expected a face-button start to work on title');

  const titleStart = resolveGamepadStartRestartAction({
    loaded: true,
    gameStarted: false,
    crashed: false,
    crashTimer: 0,
    firePressed: true,
    crashRespawnDelay: config.crashRespawnDelay,
    fireLatch: false
  });
  assert.deepEqual(titleStart, { action: 'start', fireLatch: true }, 'expected fire to start from title');

  const earlyCrashHold = resolveGamepadStartRestartAction({
    loaded: true,
    gameStarted: true,
    crashed: true,
    crashTimer: config.crashRespawnDelay - 0.01,
    firePressed: true,
    crashRespawnDelay: config.crashRespawnDelay,
    fireLatch: false
  });
  assert.deepEqual(earlyCrashHold, { action: null, fireLatch: false }, 'expected fire to wait until the delay elapses');

  const gameOverRestart = resolveGamepadStartRestartAction({
    loaded: true,
    gameStarted: true,
    crashed: true,
    crashTimer: config.crashRespawnDelay + 0.01,
    firePressed: true,
    crashRespawnDelay: config.crashRespawnDelay,
    fireLatch: false
  });
  assert.deepEqual(gameOverRestart, { action: 'restart', fireLatch: true }, 'expected fire to restart after the delay');

  console.log('PASS gamepad-start-restart-smoke');
}

function runProjectileModuleFacadeComparisonTest() {
  const seed = 0xC0FFEE;
  const facadeSim = createOrbitalsSim(seed);
  const moduleSim = createOrbitalsSim(seed);
  facadeSim.bootstrapWorld();
  moduleSim.bootstrapWorld();

  stepSim(facadeSim, 120, NEUTRAL_CONTROLS);
  stepSim(moduleSim, 120, NEUTRAL_CONTROLS);

  const facadeShip = facadeSim.state.ship;
  const moduleShip = moduleSim.state.ship;
  assert.ok(facadeShip && moduleShip, 'expected ships in both simulations');
  assert.ok(facadeShip.boundPlanet && moduleShip.boundPlanet, 'expected both ships to remain bound');

  const planetVelocities = [
    new THREE.Vector3(5400, -2600, 1700),
    new THREE.Vector3(-3200, 4100, -900),
    new THREE.Vector3(0, -5000, 3000)
  ];
  const aimX = 0.55;
  const aimY = 0.35;
  const expectedProjectileSpeed = config.shipProjectileSpeed;
  const comparisons = [];

  for (const planetVelocity of planetVelocities) {
    configureBoundFireState(facadeSim.state, planetVelocity, new THREE.Vector3(0, 0, 0));
    configureBoundFireState(moduleSim.state, planetVelocity, new THREE.Vector3(0, 0, 0));

    const facadeCamera = buildPlanetFireCamera(facadeShip, facadeSim.state);
    const moduleCamera = buildPlanetFireCamera(moduleShip, moduleSim.state);
    const expectedFireDirection = computeRawFireDirection(facadeCamera, aimX, aimY, 1280, 720);
    const moduleFireDirection = computeShipFireDirection(moduleShip, moduleCamera, aimX, aimY, 1280, 720);

    assert.ok(
      expectedFireDirection.dot(moduleFireDirection) > 0.9999,
      `expected the projectile module aim ray to match the independent ray: dot=${expectedFireDirection.dot(moduleFireDirection).toFixed(6)}`
    );

    facadeSim.step(0, { ...NEUTRAL_CONTROLS, fire: true, fireDirection: moduleFireDirection });
    spawnProjectileBurst(moduleSim.state, moduleShip, moduleFireDirection);

    assert.strictEqual(facadeSim.state.projectiles.length, 1, 'expected facade projectile');
    assert.strictEqual(moduleSim.state.projectiles.length, 1, 'expected direct module projectile');

    const facadeProjectile = facadeSim.state.projectiles[0];
    const moduleProjectile = moduleSim.state.projectiles[0];
    const facadeRelative = facadeProjectile.velocity.clone().sub(facadeShip.velocity);
    const moduleRelative = moduleProjectile.velocity.clone().sub(moduleShip.velocity);
    const facadeOffset = facadeProjectile.position.clone().sub(facadeShip.position);
    const moduleOffset = moduleProjectile.position.clone().sub(moduleShip.position);

    assert.ok(
      Math.abs(facadeRelative.length() - expectedProjectileSpeed) < 1e-3,
      `expected facade projectile speed to stay constant: got=${facadeRelative.length().toFixed(3)} expected=${expectedProjectileSpeed.toFixed(3)}`
    );
    assert.ok(
      Math.abs(moduleRelative.length() - expectedProjectileSpeed) < 1e-3,
      `expected direct module projectile speed to stay constant: got=${moduleRelative.length().toFixed(3)} expected=${expectedProjectileSpeed.toFixed(3)}`
    );
    assert.ok(
      facadeRelative.clone().normalize().dot(moduleFireDirection) > 0.9999,
      `expected facade projectile to stay on the module aim ray: dot=${facadeRelative.clone().normalize().dot(moduleFireDirection).toFixed(6)}`
    );
    assert.ok(
      moduleRelative.clone().normalize().dot(moduleFireDirection) > 0.9999,
      `expected direct module projectile to stay on the module aim ray: dot=${moduleRelative.clone().normalize().dot(moduleFireDirection).toFixed(6)}`
    );
    comparisons.push({
      planetVelocity: planetVelocity.toArray(),
      facade: {
        relativeSpeed: facadeRelative.length(),
        spawnOffset: facadeOffset.length()
      },
      module: {
        relativeSpeed: moduleRelative.length(),
        spawnOffset: moduleOffset.length()
      }
    });

    facadeSim.state.projectiles.length = 0;
    moduleSim.state.projectiles.length = 0;
  }

  console.log(`PASS projectile-module-facade-compare: ${JSON.stringify(comparisons)}`);
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
  assert.strictEqual(
    state.projectiles[0].targetEnemyId,
    enemy.id,
    'expected homing target selection to happen once at launch'
  );

  stepSim(sim, 30, NEUTRAL_CONTROLS);
  assert.strictEqual(state.projectiles.length, 1, 'expected the projectile to still be in flight');
  assert.strictEqual(state.projectiles[0].targetEnemyId, enemy.id, 'expected the projectile to lock onto the target');

  const projectile = state.projectiles[0];
  const currentDirection = projectile.velocity.clone().sub(projectile.inheritedVelocity).normalize();
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


function runProjectileHomingReferenceFrameTest() {
  const carrierVelocity = new THREE.Vector3(820, -360, 240);
  const launchDirection = new THREE.Vector3(1, 0, 0);
  const projectileSpeed = config.shipProjectileSpeed;
  const projectile = {
    position: new THREE.Vector3(0, 0, 0),
    velocity: carrierVelocity.clone().addScaledVector(launchDirection, projectileSpeed),
    inheritedVelocity: carrierVelocity.clone(),
    launchDirection: launchDirection.clone(),
    guidanceDirection: launchDirection.clone(),
    speed: projectileSpeed,
    age: config.projectileHomingDelay + config.projectileHomingRampDuration
  };
  const target = {
    id: 7001,
    health: 1,
    position: new THREE.Vector3(260, 22, 0),
    velocity: carrierVelocity.clone()
  };

  const beforeVelocity = projectile.velocity.clone();
  steerProjectileTowardsTarget(projectile, target, 1 / 60);

  const relativeVelocity = projectile.velocity.clone().sub(carrierVelocity);
  const velocityChange = projectile.velocity.distanceTo(beforeVelocity);
  const maximumExpectedChange = projectileSpeed
    * THREE.MathUtils.degToRad(config.projectileHomingTurnRateDeg)
    * (1 / 60)
    * 1.05;

  assert.ok(
    projectile.inheritedVelocity.distanceTo(carrierVelocity) < 1e-9,
    'expected homing to preserve the launch-frame inherited velocity'
  );
  assert.ok(
    Math.abs(relativeVelocity.length() - projectileSpeed) < 1e-6,
    `expected homing to preserve projectile speed in the launch frame: got=${relativeVelocity.length().toFixed(6)}`
  );
  assert.ok(
    velocityChange <= maximumExpectedChange,
    `expected the first guided correction to be continuous: change=${velocityChange.toFixed(6)} max=${maximumExpectedChange.toFixed(6)}`
  );

  const delayedProjectile = {
    ...projectile,
    velocity: beforeVelocity.clone(),
    inheritedVelocity: carrierVelocity.clone(),
    launchDirection: launchDirection.clone(),
    guidanceDirection: launchDirection.clone(),
    age: config.projectileHomingDelay * 0.5
  };
  steerProjectileTowardsTarget(delayedProjectile, target, 1 / 60);
  assert.ok(
    delayedProjectile.velocity.distanceTo(beforeVelocity) < 1e-9,
    'expected the launch delay to leave the initial firing direction untouched'
  );

  console.log(
    `PASS projectile-homing-reference-frame: carrier=${carrierVelocity.length().toFixed(3)} correction=${velocityChange.toFixed(6)}`
  );
}

function runProjectileHomingCorrectionCorridorTest() {
  const launchDirection = new THREE.Vector3(1, 0, 0);
  const projectile = {
    position: new THREE.Vector3(0, 0, 0),
    velocity: launchDirection.clone().multiplyScalar(config.shipProjectileSpeed),
    inheritedVelocity: new THREE.Vector3(),
    launchDirection: launchDirection.clone(),
    guidanceDirection: launchDirection.clone(),
    speed: config.shipProjectileSpeed,
    age: config.projectileHomingDelay + config.projectileHomingRampDuration
  };
  const target = {
    id: 7002,
    health: 1,
    position: new THREE.Vector3(300, 28, 0),
    velocity: new THREE.Vector3(0, 150, 0)
  };

  const dt = 1 / 60;
  const maxCorrection = config.projectileHomingMaxCorrectionDeg;
  const maxTurnPerFrame = config.projectileHomingTurnRateDeg * dt;
  let largestCorrection = 0;
  let largestFrameTurn = 0;

  for (let i = 0; i < 180; i += 1) {
    const beforeDirection = projectile.guidanceDirection.clone();
    projectile.age += dt;
    steerProjectileTowardsTarget(projectile, target, dt);
    const correction = THREE.MathUtils.radToDeg(
      launchDirection.angleTo(projectile.guidanceDirection)
    );
    const frameTurn = THREE.MathUtils.radToDeg(
      beforeDirection.angleTo(projectile.guidanceDirection)
    );
    largestCorrection = Math.max(largestCorrection, correction);
    largestFrameTurn = Math.max(largestFrameTurn, frameTurn);
    projectile.position.addScaledVector(projectile.velocity, dt);
    target.position.addScaledVector(target.velocity, dt);
  }

  assert.ok(
    largestCorrection <= maxCorrection + 1e-6,
    `expected guidance to stay inside the launch corridor: correction=${largestCorrection.toFixed(6)} max=${maxCorrection.toFixed(6)}`
  );
  assert.ok(
    largestFrameTurn <= maxTurnPerFrame + 1e-6,
    `expected guidance to make only a small per-frame correction: turn=${largestFrameTurn.toFixed(6)} max=${maxTurnPerFrame.toFixed(6)}`
  );
  assert.ok(
    largestCorrection > 0.5,
    `expected the guidance to make a measurable correction: correction=${largestCorrection.toFixed(6)}`
  );

  console.log(
    `PASS projectile-homing-corridor: correction=${largestCorrection.toFixed(3)} frameTurn=${largestFrameTurn.toFixed(3)}`
  );
}

function runProjectileHomingNoRetargetTest() {
  const launchDirection = new THREE.Vector3(1, 0, 0);
  const projectile = {
    id: 7003,
    position: new THREE.Vector3(0, 0, 0),
    previousPosition: new THREE.Vector3(0, 0, 0),
    velocity: launchDirection.clone().multiplyScalar(config.shipProjectileSpeed),
    inheritedVelocity: new THREE.Vector3(),
    launchDirection: launchDirection.clone(),
    guidanceDirection: launchDirection.clone(),
    speed: config.shipProjectileSpeed,
    age: 0.5,
    lifetime: config.shipProjectileLifetime,
    planetCollisionGrace: 0,
    radius: config.shipProjectileSize,
    spawnFrame: 0,
    targetEnemyId: 7100,
    homingAcquisitionComplete: true,
    homingDisabled: false
  };
  const replacementTarget = {
    id: 7101,
    health: 1,
    radius: 2,
    position: new THREE.Vector3(500, 0, 0),
    velocity: new THREE.Vector3()
  };
  const state = {
    frameIndex: 1,
    projectiles: [projectile],
    planets: [],
    enemies: [replacementTarget]
  };

  assert.strictEqual(
    findProjectileHomingTarget(state, projectile),
    null,
    'expected a projectile with a completed launch lock to refuse a replacement target'
  );

  updateProjectiles(state, 1 / 60);
  assert.strictEqual(projectile.targetEnemyId, null, 'expected a lost launch target to be cleared');
  assert.strictEqual(projectile.homingDisabled, true, 'expected guidance to remain disabled after losing its launch target');

  updateProjectiles(state, 1 / 60);
  assert.strictEqual(projectile.targetEnemyId, null, 'expected the projectile not to retarget on a later frame');

  console.log('PASS projectile-homing-no-retarget');
}

function setupEnemyCrashScenario(sim, collisionKind) {
  const { state } = sim;
  state.enemies.length = 0;
  state.enemySquads.length = 0;
  state.enemySquad = null;
  state.mothershipSquads.length = 0;
  state.mothershipSquad = null;
  state.mothershipSpawnTimer = Infinity;
  state.eventLog.length = 0;

  const crashPlanet = state.planets[0];
  assert.ok(crashPlanet, 'expected a planet for the crash test');
  const squad = {
    id: state.nextEnemySquadId,
    kind: 'fighter',
    targetPlanetIndex: 0,
    nextPlanetIndex: state.planets.length > 1 ? 1 : 0,
    mode: 'approach',
    modeTimer: 0,
    orbitPhase: 0,
    orbitDirection: 1,
    orbitProgress: 0,
    orbitLastAngle: NaN,
    swarmDuration: 999,
    departDuration: 999,
    departPlanetIndex: -1,
    departVector: new THREE.Vector3(),
    family: 'CrashTest',
    familyFiles: [],
    parentMothershipId: -1
  };
  state.nextEnemySquadId += 1;
  state.enemySquads.push(squad);
  state.enemySquad = squad;

  const normal = crashPlanet.position.lengthSq() > 1e-6
    ? crashPlanet.position.clone().normalize()
    : new THREE.Vector3(0, 1, 0);
  const enemy = {
    id: state.nextEnemyId,
    squadId: squad.id,
    kind: 'fighter',
    family: 'CrashTest',
    assetFile: '',
    position: new THREE.Vector3(),
    previousPosition: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    relativePosition: new THREE.Vector3(),
    relativeVelocity: new THREE.Vector3(),
    forward: new THREE.Vector3(),
    up: new THREE.Vector3(0, 1, 0),
    gravity: new THREE.Vector3(),
    bank: 0,
    speed: 0,
    radius: 1,
    health: 1,
    speedScale: 1,
    turnScale: 1,
    upScale: 1,
    visualScale: 1,
    destroyed: false,
    boundPlanet: null,
    flightMode: 'free',
    captureTimer: 0,
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
    atmosphericCruiseAltitudeFactor: 0.5,
    hasSmoothedTargetPoint: false,
    smoothedTargetPoint: new THREE.Vector3(),
    formationAngle: 0,
    formationRadius: 0,
    phase: 0,
    mode: 'approach',
    targetPlanetIndex: 0,
    nextPlanetIndex: squad.nextPlanetIndex,
    modeTimer: 0,
    spawnFrame: state.frameIndex,
    spawnTime: state.time,
    parentMothershipId: null
  };
  state.nextEnemyId += 1;

  if (collisionKind === 'sun') {
    const starRadius = config.starScale * 0.5;
    enemy.position.set(starRadius + 0.5, 0, 0);
    enemy.previousPosition.copy(enemy.position);
    enemy.forward.set(-1, 0, 0);
    enemy.up.set(0, 1, 0);
    state.enemies.push(enemy);
    return { state, enemy, collisionKind };
  }

  enemy.position.copy(crashPlanet.position).addScaledVector(normal, crashPlanet.radius + 0.5);
  enemy.previousPosition.copy(enemy.position);
  enemy.forward.copy(normal).multiplyScalar(-1);
  enemy.up.copy(normal);
  state.enemies.push(enemy);
  return { state, enemy, collisionKind };
}

function runEnemyCrashExplosionTest(collisionKind) {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state, enemy } = setupEnemyCrashScenario(sim, collisionKind);
  sim.step(1 / 60, NEUTRAL_CONTROLS);

  assert.strictEqual(
    state.enemies.some((candidate) => candidate.id === enemy.id),
    false,
    `expected the enemy to be destroyed by the ${collisionKind} collision`
  );
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

function spawnMothershipFighterScenario(sim) {
  const { state } = sim;
  state.enemies.length = 0;
  state.enemySquads.length = 0;
  state.enemySquad = null;
  state.mothershipSquads.length = 0;
  state.mothershipSquad = null;
  state.mothershipSpawnTimer = 0;
  state.eventLog.length = 0;

  let mothershipSquad = null;
  let mothership = null;
  let fighterSquad = null;
  let fighter = null;

  for (let i = 0; i < 250000; i += 1) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    mothershipSquad = state.mothershipSquads[0] || mothershipSquad;
    mothership = mothership || state.enemies.find((candidate) => candidate.kind === 'mothership' && candidate.health > 0);
    fighterSquad = state.enemySquads.find((squad) => squad.kind === 'fighter' && squad.parentMothershipId === mothershipSquad?.id) || fighterSquad;
    fighter = fighterSquad ? state.enemies.find((candidate) => candidate.squadId === fighterSquad.id && candidate.health > 0) || fighter : fighter;
    if (fighter) {
      break;
    }
  }

  assert.ok(mothershipSquad, 'expected a mothership squad to spawn');
  assert.ok(mothership, 'expected a mothership enemy to spawn');
  assert.ok(fighterSquad, 'expected the mothership to release a fighter squad');
  assert.ok(fighter, 'expected the fighter squad to have an active enemy');

  return { state, mothershipSquad, mothership, fighterSquad, fighter };
}

function getPresentationEndEvent(state, enemyId) {
  return state.eventLog.find((event) => event.type === 'presentation-end' && event.enemyId === enemyId);
}

function runPresentationMetricHelperTest() {
  const player = {
    position: new THREE.Vector3(0, 0, 0),
    forward: new THREE.Vector3(1, 0, 0),
    up: new THREE.Vector3(0, 1, 0)
  };
  const enemy = { position: new THREE.Vector3(config.encounterShootableMinDistance + 20, 0, 0) };
  assert.ok(isEnemyShootableFromPlayer(player, enemy), 'enemy directly ahead should be shootable');
  enemy.position.set(-100, 0, 0);
  assert.ok(!isEnemyShootableFromPlayer(player, enemy), 'enemy behind should not be shootable');
  enemy.position.set(config.encounterShootableMaxDistance + 100, 0, 0);
  assert.ok(!isEnemyShootableFromPlayer(player, enemy), 'enemy beyond max range should not be shootable');
  console.log('PASS presentation-metric-helper');
}

function runPresentationProjectionHelperTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();
  const { state } = sim;
  const planet = state.ship.boundPlanet;
  const atmosphereThickness = planet.atmosphereRadius - planet.radius;
  const slot = state.ship.position.clone().addScaledVector(state.ship.forward, 300);
  const projected = projectPresentationSlotToPlanet(state, planet, slot, config.fighterPatrolAltitudeFactor);
  const altitude = projected.distanceTo(planet.position) - planet.radius;
  const expected = atmosphereThickness * config.fighterPatrolAltitudeFactor;
  assert.ok(Math.abs(altitude - expected) <= 1e-6, `projected altitude=${altitude} expected=${expected}`);
  console.log(`PASS presentation-projection-helper: altitude=${altitude.toFixed(3)}`);
}

function runBehindCatchupPresentationTest() {
  const setup = createSingleFighterPresentationScenario('behindCatchup');
  const shootableFrames = countShootableFramesDuring(setup.sim, setup.enemy.id, 2200);
  const endEvent = getPresentationEndEvent(setup.state, setup.enemy.id);
  assert.ok(endEvent, 'expected behind-catchup presentation to end');
  assert.strictEqual(endEvent.result, 'success', `expected behind-catchup success: ${JSON.stringify(endEvent)}`);
  assert.ok(
    Math.max(shootableFrames, endEvent.shootableFrames) >= config.encounterShootableRequiredFrames,
    `expected behind-catchup shootable frames: external=${shootableFrames} event=${endEvent.shootableFrames}`
  );
  assertEnemyDidNotCrashOrDisappearUnexpectedly(setup.state, setup.enemy.id);
  console.log(`PASS behind-catchup-presentation: shootable=${Math.max(shootableFrames, endEvent.shootableFrames)}`);
}

function runBehindCatchupPresentationWithGentleTurnTest() {
  const setup = createSingleFighterPresentationScenario('behindCatchup');
  const controls = { ...NEUTRAL_CONTROLS, turnInput: 0.16 };
  const shootableFrames = countShootableFramesDuring(setup.sim, setup.enemy.id, 2400, controls);
  const endEvent = getPresentationEndEvent(setup.state, setup.enemy.id);
  assert.ok(endEvent, 'expected behind-catchup gentle-turn presentation to end');
  assert.ok(
    Math.max(shootableFrames, endEvent.shootableFrames) >= Math.floor(config.encounterShootableRequiredFrames * 0.5),
    `expected gentle-turn shootable frames: external=${shootableFrames} event=${endEvent.shootableFrames}`
  );
  assertEnemyDidNotCrashOrDisappearUnexpectedly(setup.state, setup.enemy.id);
  console.log(`PASS behind-catchup-gentle-turn: shootable=${Math.max(shootableFrames, endEvent.shootableFrames)}`);
}

function runSideCrossPresentationTest() {
  const setup = createSingleFighterPresentationScenario('sideCross');
  const shootableFrames = countShootableFramesDuring(setup.sim, setup.enemy.id, 2600);
  const endEvent = getPresentationEndEvent(setup.state, setup.enemy.id);
  assert.ok(endEvent, 'expected side-cross presentation to end');
  assert.strictEqual(endEvent.result, 'success', `expected side-cross success: ${JSON.stringify(endEvent)}`);
  assert.ok(endEvent.shootableFrames >= config.encounterSideCrossRequiredFrames || shootableFrames >= config.encounterSideCrossRequiredFrames, `expected useful side-cross shootable frames: external=${shootableFrames} event=${endEvent.shootableFrames}`);
  assertEnemyDidNotCrashOrDisappearUnexpectedly(setup.state, setup.enemy.id);
  console.log(`PASS side-cross-presentation: shootable=${Math.max(shootableFrames, endEvent.shootableFrames)}`);
}

function runSideCrossPresentationWithGentleTurnTest() {
  const setup = createSingleFighterPresentationScenario('sideCross');
  const controls = { ...NEUTRAL_CONTROLS, turnInput: -0.12 };
  const shootableFrames = countShootableFramesDuring(setup.sim, setup.enemy.id, 2800, controls);
  const endEvent = getPresentationEndEvent(setup.state, setup.enemy.id);
  assert.ok(endEvent, 'expected side-cross gentle-turn presentation to end');
  assert.ok(Math.max(shootableFrames, endEvent.shootableFrames) >= Math.floor(config.encounterSideCrossRequiredFrames * 0.5), `expected gentle side-cross shootable frames: external=${shootableFrames} event=${endEvent.shootableFrames}`);
  assertEnemyDidNotCrashOrDisappearUnexpectedly(setup.state, setup.enemy.id);
  console.log(`PASS side-cross-gentle-turn: shootable=${Math.max(shootableFrames, endEvent.shootableFrames)}`);
}

function runHeadOnBreakawayPresentationTest() {
  const setup = createSingleFighterPresentationScenario('headOnBreakaway');
  const shootableFrames = countShootableFramesDuring(setup.sim, setup.enemy.id, 1800);
  const endEvent = getPresentationEndEvent(setup.state, setup.enemy.id);
  assert.ok(endEvent, 'expected head-on presentation to end');
  assert.strictEqual(endEvent.result, 'success', `expected head-on breakaway success: ${JSON.stringify(endEvent)}`);
  assert.ok(Math.max(shootableFrames, endEvent.shootableFrames) >= config.encounterHeadOnRequiredFrames, `expected head-on shootable frames: external=${shootableFrames} event=${endEvent.shootableFrames}`);
  assertEnemyDidNotCrashOrDisappearUnexpectedly(setup.state, setup.enemy.id);
  console.log(`PASS head-on-breakaway-presentation: shootable=${Math.max(shootableFrames, endEvent.shootableFrames)}`);
}

function runHeadOnBreakawayAvoidsCollisionTest() {
  const setup = createSingleFighterPresentationScenario('headOnBreakaway');
  countShootableFramesDuring(setup.sim, setup.enemy.id, 1800);
  const collisionEvent = setup.state.eventLog.find((event) => event.type === 'ship-collision' && (event.shipAId === setup.enemy.id || event.shipBId === setup.enemy.id));
  assert.ok(!collisionEvent, 'expected head-on breakaway to avoid ship collision');
  assertEnemyDidNotCrashOrDisappearUnexpectedly(setup.state, setup.enemy.id);
  console.log('PASS head-on-breakaway-avoids-collision');
}

function createDirectorManyFighterScenario(count = 6) {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();
  const { state } = sim;
  state.mothershipSpawnTimer = Infinity;
  stepSim(sim, 120, NEUTRAL_CONTROLS);
  const planet = state.ship.boundPlanet;
  const planetIndex = state.planets.indexOf(planet);
  const encounter = sim.createEncounter({
    type: 'planetInvasion',
    status: 'active',
    anchorKind: 'planet',
    anchorPlanetIndex: planetIndex,
    objectiveKind: 'clearEnemies',
    spawnedEnemyIds: [],
    totalReleased: 0
  });
  const squad = {
    id: state.nextEnemySquadId,
    kind: 'fighter',
    family: 'Standard',
    familyFiles: [],
    targetPlanetIndex: planetIndex,
    nextPlanetIndex: planetIndex,
    departPlanetIndex: -1,
    departVector: new THREE.Vector3(1, 0, 0),
    mode: 'swarm',
    modeTimer: 999,
    orbitPhase: 0,
    orbitDirection: 1,
    orbitProgress: 0,
    orbitLastAngle: 0,
    swarmDuration: 999,
    departDuration: 999,
    parentMothershipId: 9002,
    fighterSettleTimer: 999,
    fighterPatrolAltitudeFactor: config.fighterPatrolAltitudeFactor,
    encounterId: encounter.id
  };
  state.nextEnemySquadId += 1;
  state.enemySquads.push(squad);
  for (let i = 0; i < count; i += 1) {
    const enemy = createTestFighter(state, squad, encounter, planet, {});
    const side = i % 2 === 0 ? 1 : -1;
    placeEnemyRelativeToPlayerOnPlanet(state, planet, enemy, {
      forwardDistance: 55 + i * 8,
      rightDistance: side * (18 + i * 4),
      upDistance: 35
    });
  }
  return { sim, state, planet, encounter, squad };
}

function runEncounterDirectorBudgetTest() {
  const setup = createDirectorManyFighterScenario(8);
  stepSim(setup.sim, 180, NEUTRAL_CONTROLS);
  const presenters = setup.state.enemies.filter((enemy) => enemy.combatRole === 'presenter');
  assert.ok(presenters.length <= config.encounterMaxActivePresenters, `too many presenters: ${presenters.length}`);
  assert.ok(presenters.length > 0, 'expected the director to select at least one presenter');
  console.log(`PASS encounter-director-budget: presenters=${presenters.length}`);
}

function runEncounterDirectorRotatesPresentersTest() {
  const setup = createDirectorManyFighterScenario(8);
  stepSim(setup.sim, 4200, NEUTRAL_CONTROLS);
  const starts = setup.state.eventLog.filter((event) => event.type === 'presentation-start');
  const ended = setup.state.eventLog.filter((event) => event.type === 'presentation-end');
  const distinctEnemies = new Set(starts.map((event) => event.enemyId));
  assert.ok(ended.length > 0, 'expected at least one presentation to end');
  assert.ok(distinctEnemies.size >= 2, `expected presenter rotation across enemies, got ${distinctEnemies.size}`);
  const activePresenters = setup.state.enemies.filter((enemy) => enemy.combatRole === 'presenter').length;
  assert.ok(activePresenters <= config.encounterMaxActivePresenters, `too many active presenters after rotation: ${activePresenters}`);
  console.log(`PASS encounter-director-rotates: starts=${starts.length} ended=${ended.length} distinct=${distinctEnemies.size}`);
}

function runManyEnemiesFewPresentersTest() {
  const setup = createDirectorManyFighterScenario(12);
  stepSim(setup.sim, 240, NEUTRAL_CONTROLS);
  const primaryThreats = setup.state.enemies.filter((enemy) => enemy.isPrimaryThreat);
  const presenters = setup.state.enemies.filter((enemy) => enemy.combatRole === 'presenter');
  assert.ok(primaryThreats.length <= config.encounterMaxActiveThreatsNearPlayer, `too many primary threats: ${primaryThreats.length}`);
  assert.ok(presenters.length <= config.encounterMaxActivePresenters, `too many presenters: ${presenters.length}`);
  console.log(`PASS many-enemies-few-presenters: enemies=${setup.state.enemies.length} primary=${primaryThreats.length} presenters=${presenters.length}`);
}

function runPlanetInvasionClearTest() {
  const setup = createDirectorManyFighterScenario(3);
  for (const enemy of setup.state.enemies.slice()) {
    setup.sim.destroyEnemy(enemy.id, 'projectile');
  }
  stepSim(setup.sim, 2, NEUTRAL_CONTROLS);
  const clearEvent = setup.state.eventLog.find((event) => event.type === 'planet-invasion-cleared' && event.encounterId === setup.encounter.id);
  assert.ok(clearEvent, 'expected planet invasion to clear after all encounter fighters are destroyed');
  assert.strictEqual(setup.encounter.status, 'cleared', 'expected encounter status to become cleared');
  console.log('PASS planet-invasion-clear');
}

function runPlanetEncounterDoesNotClearWhileFightersRemainTest() {
  const setup = createDirectorManyFighterScenario(3);
  setup.sim.destroyEnemy(setup.state.enemies[0].id, 'projectile');
  stepSim(setup.sim, 2, NEUTRAL_CONTROLS);
  const clearEvent = setup.state.eventLog.find((event) => event.type === 'planet-invasion-cleared' && event.encounterId === setup.encounter.id);
  assert.ok(!clearEvent, 'expected planet invasion not to clear while fighters remain');
  assert.strictEqual(setup.encounter.status, 'active', 'expected encounter to remain active');
  console.log('PASS planet-invasion-not-clear-while-fighters-remain');
}

function runGenericEncounterHelperSmokeTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();
  const point = sim.state.ship.position.clone().add(new THREE.Vector3(10, 20, 30));
  const encounter = sim.createEncounter({
    type: 'freeSpaceAmbush',
    status: 'inactive',
    anchorKind: 'point',
    anchorPoint: point,
    activatedByPlayer: true,
    activationRadius: 100,
    missionActiveText: 'Mission: Survive the ambush',
    missionSuccessText: 'Mission Complete'
  });
  const anchor = getEncounterAnchorPosition(sim.state, encounter);
  assert.ok(anchor && anchor.distanceTo(point) <= 1e-6, 'expected point anchor helper to return the anchor');
  stepSim(sim, 1, NEUTRAL_CONTROLS);
  assert.strictEqual(encounter.status, 'active', 'expected player-proximity activation for generic encounter');
  assert.strictEqual(sim.state.encounterDirector.missionMessage, 'Mission: Survive the ambush');
  console.log('PASS generic-encounter-helper-smoke');
}

function runFreeSpaceAmbushPresenterTest() {
  const setup = createDirectorManyFighterScenario(4);
  setup.encounter.type = 'freeSpaceAmbush';
  setup.encounter.anchorKind = 'point';
  setup.encounter.anchorPoint = setup.state.ship.position.clone();
  setup.encounter.objectiveKind = 'clearEnemies';
  stepSim(setup.sim, 300, NEUTRAL_CONTROLS);
  const presenterStart = setup.state.eventLog.find((event) => event.type === 'presentation-start' && event.encounterId === setup.encounter.id);
  assert.ok(presenterStart, 'expected free-space ambush to assign a player presenter');
  assert.ok(setup.encounter.anchorKind !== 'planet', 'expected non-planet anchor to remain supported');
  console.log('PASS free-space-ambush-presenter');
}

function createTransportDefenseScenario(enemyCount = 5, options = {}) {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();
  const { state } = sim;
  state.mothershipSpawnTimer = Infinity;
  stepSim(sim, 120, NEUTRAL_CONTROLS);
  const planet = state.ship.boundPlanet;
  const frame = buildPlayerFrame(state.ship);
  const transport = sim.createEncounterEntity({
    kind: 'transport',
    position: state.ship.position.clone().addScaledVector(frame.forward, 300).addScaledVector(frame.up, 80),
    forward: frame.forward,
    up: frame.up,
    routeDirection: frame.forward,
    routeRemaining: options.routeRemaining ?? Infinity,
    speed: options.speed ?? 0
  });
  const encounter = sim.createEncounter({
    type: options.type || 'transportDefense',
    status: 'active',
    anchorKind: 'entity',
    anchorEntityId: transport.id,
    objectiveKind: 'defendEntity',
    protectedEntityId: transport.id,
    spawnedEnemyIds: [],
    totalReleased: 0,
    duration: options.duration ?? config.transportDefenseSurviveSeconds,
    abortDistance: options.abortDistance ?? config.encounterMissionAbortDistance,
    missionActiveText: options.missionActiveText || 'Mission: Defend the transport',
    missionSuccessText: options.missionSuccessText || 'Mission Complete - Transport is safe',
    missionFailureText: options.missionFailureText || 'Mission Failed - Transport was destroyed',
    missionAbortText: options.missionAbortText || 'Mission Aborted - Transport was left to its fate'
  });
  const planetIndex = state.planets.indexOf(planet);
  const squad = {
    id: state.nextEnemySquadId,
    kind: 'fighter',
    family: 'Standard',
    familyFiles: [],
    targetPlanetIndex: planetIndex,
    nextPlanetIndex: planetIndex,
    departPlanetIndex: -1,
    departVector: new THREE.Vector3(1, 0, 0),
    mode: 'swarm',
    modeTimer: 999,
    orbitPhase: 0,
    orbitDirection: 1,
    orbitProgress: 0,
    orbitLastAngle: 0,
    swarmDuration: 999,
    departDuration: 999,
    parentMothershipId: -1,
    fighterSettleTimer: 999,
    fighterPatrolAltitudeFactor: config.fighterPatrolAltitudeFactor,
    encounterId: encounter.id
  };
  state.nextEnemySquadId += 1;
  state.enemySquads.push(squad);
  for (let i = 0; i < enemyCount; i += 1) {
    const enemy = createTestFighter(state, squad, encounter, planet, {});
    enemy.encounterId = encounter.id;
    placeEnemyRelativeToPlayerOnPlanet(state, planet, enemy, {
      forwardDistance: 120 + i * 18,
      rightDistance: (i % 2 === 0 ? 1 : -1) * (80 + i * 10),
      upDistance: 45
    });
  }
  return { sim, state, planet, transport, encounter, squad };
}

function runTransportDefenseBudgetTest() {
  const setup = createTransportDefenseScenario(7);
  stepSim(setup.sim, 180, NEUTRAL_CONTROLS);
  const attackers = setup.state.enemies.filter((enemy) => enemy.combatRole === 'objectiveAttacker');
  assert.ok(attackers.length <= config.encounterMaxActiveObjectiveAttackers, `too many objective attackers: ${attackers.length}`);
  assert.ok(attackers.length > 0, 'expected objective attackers to be selected');
  console.log(`PASS transport-defense-budget: attackers=${attackers.length}`);
}

function runTransportDefenseAttackRunTest() {
  const setup = createTransportDefenseScenario(5);
  stepSim(setup.sim, 1200, NEUTRAL_CONTROLS);
  const attackEvent = setup.state.eventLog.find((event) => event.type === 'objective-attack-success' && event.encounterId === setup.encounter.id);
  assert.ok(attackEvent, 'expected at least one transport attack run to reach or complete an attack phase');
  console.log('PASS transport-defense-attack-run');
}

function runTransportDefensePlayerPresenterTest() {
  const setup = createTransportDefenseScenario(7);
  stepSim(setup.sim, 600, NEUTRAL_CONTROLS);
  const presenterStart = setup.state.eventLog.find((event) => event.type === 'presentation-start' && event.encounterId === setup.encounter.id);
  const attackerSelected = setup.state.eventLog.find((event) => event.type === 'objective-attacker-selected' && event.encounterId === setup.encounter.id);
  assert.ok(presenterStart, 'expected transport defense to still assign a player presenter');
  assert.ok(attackerSelected, 'expected transport defense to assign objective attackers');
  console.log('PASS transport-defense-player-presenter');
}

function runTransportDefenseFailureTest() {
  const setup = createTransportDefenseScenario(3);
  setup.sim.damageEncounterEntity(setup.transport.id, config.transportDefenseEntityHealth);
  stepSim(setup.sim, 2, NEUTRAL_CONTROLS);
  assert.strictEqual(setup.encounter.status, 'failed', 'expected transport defense to fail when transport is destroyed');
  const failEvent = setup.state.eventLog.find((event) => event.type === 'encounter-fail' && event.encounterId === setup.encounter.id);
  assert.ok(failEvent, 'expected encounter-fail event');
  console.log('PASS transport-defense-failure');
}

function runTransportDefenseSuccessTest() {
  const setup = createTransportDefenseScenario(3, { duration: 1.0 });
  stepSim(setup.sim, 90, NEUTRAL_CONTROLS);
  assert.strictEqual(setup.encounter.status, 'succeeded', 'expected transport defense to succeed after survival duration');
  const successEvent = setup.state.eventLog.find((event) => event.type === 'encounter-success' && event.encounterId === setup.encounter.id);
  assert.ok(successEvent, 'expected encounter-success event');
  console.log('PASS transport-defense-success');
}

function runTransportDefenseAbortTest() {
  const setup = createTransportDefenseScenario(3, { abortDistance: 120 });
  const away = setup.transport.position.clone().sub(setup.state.ship.position);
  if (away.lengthSq() < 1e-8) {
    away.set(1, 0, 0);
  }
  away.normalize();
  setup.state.ship.position.copy(setup.transport.position).addScaledVector(away, 300);
  setup.state.ship.relativePosition.copy(setup.state.ship.position).sub(setup.planet.position);
  stepSim(setup.sim, 2, NEUTRAL_CONTROLS);
  assert.strictEqual(setup.encounter.status, 'failed', 'expected transport defense to abort when the player leaves the objective');
  assert.strictEqual(setup.state.encounterDirector.missionMessage, 'Mission Aborted - Transport was left to its fate');
  console.log('PASS transport-defense-abort');
}

function runConvoyEscortSuccessTest() {
  const setup = createTransportDefenseScenario(4, {
    type: 'convoyEscort',
    duration: 1.0,
    missionActiveText: 'Mission: Defend the convoy',
    missionSuccessText: 'Mission Complete - Convoy is safe',
    missionFailureText: 'Mission Failed - Convoy was destroyed'
  });
  stepSim(setup.sim, 90, NEUTRAL_CONTROLS);
  assert.strictEqual(setup.encounter.status, 'succeeded', 'expected convoy escort to succeed after survival duration');
  console.log('PASS convoy-escort-success');
}

function runBossSupportWaveSuccessTest() {
  const setup = createTransportDefenseScenario(4, {
    type: 'bossSupportWave',
    duration: 1.0,
    missionActiveText: 'Mission: Break the support wave',
    missionSuccessText: 'Mission Complete - Support wave broken'
  });
  stepSim(setup.sim, 90, NEUTRAL_CONTROLS);
  assert.strictEqual(setup.encounter.status, 'succeeded', 'expected boss support wave to succeed after duration');
  console.log('PASS boss-support-wave-success');
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

  const { state, fighter, fighterSquad } = spawnMothershipFighterScenario(sim);
  assert.ok(state.planets.length > 0, 'expected at least one planet');

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

  const squad = {
    id: fighterSquad.id,
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
    family: fighter.family || 'Standard',
    familyFiles: fighterSquad.familyFiles || [],
    phase: fighter.phase || 0,
    targetPlanetIndex: planetIndex,
    nextPlanetIndex: (planetIndex + 1) % state.planets.length
  };

  state.enemies.length = 0;
  state.enemies.push(fighter);
  state.enemySquads.length = 0;
  state.enemySquads.push(squad);
  state.enemySquad = squad;

  fighter.squadId = squad.id;
  fighter.targetPlanetIndex = squad.targetPlanetIndex;
  fighter.nextPlanetIndex = squad.nextPlanetIndex;
  fighter.boundPlanet = planet;
  fighter.flightMode = 'bound';
  fighter.captureTimer = config.shipCaptureBlendTime;
  fighter.recaptureLock = 0;
  fighter.pitchIdleTime = 0;
  fighter.boostTimer = 0;
  fighter.bank = 0;
  fighter.forward.copy(initialForward);
  fighter.up.copy(initialUp);
  fighter.position.copy(worldPosition);
  fighter.velocity.copy(initialForward).multiplyScalar(18);
  fighter.relativePosition.copy(worldPosition).sub(planet.position);
  fighter.relativeVelocity.copy(initialForward).multiplyScalar(18);
  fighter.speed = 18;
  state.nearestPlanet = planet;
  state.nearestDistance = worldPosition.distanceTo(planet.position);
  state.nearestAltitude = altitude;
  state.speed = fighter.speed;

  let peakAltitude = altitude;
  let peakForwardDot = initialForward.dot(radial);
  let startedDescending = false;
  let minForwardDotAfterPeak = Infinity;

  for (let i = 0; i < 360; i += 1) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    const currentAltitude = altitudeBetween(fighter, planet);
    const currentUp = fighter.position.clone().sub(planet.position).normalize();
    const currentForwardDot = fighter.forward.clone().normalize().dot(currentUp);
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

  const finalAltitude = altitudeBetween(fighter, planet);

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

function runStartupInvasionArrivalTest() {
  const previousStartSetting = config.startWithInitialInvasion;
  config.startWithInitialInvasion = true;
  try {
    const sim = createOrbitalsSim(0xC0FFEE);
    sim.bootstrapWorld();

    const { state } = sim;
    const mothershipSquad = state.mothershipSquads[0];
    assert.ok(mothershipSquad, 'expected bootstrap to create the initial mothership squad');
    const mothership = state.enemies.find((enemy) => enemy.squadId === mothershipSquad.id && enemy.kind === 'mothership');
    assert.ok(mothership, 'expected bootstrap to create the initial mothership enemy');

    const targetPlanet = state.planets[mothershipSquad.targetPlanetIndex];
    assert.strictEqual(targetPlanet, state.ship.boundPlanet, 'expected the initial invasion to target the player start planet');
    const expectedAltitude = targetPlanet.radius * (config.mothershipHoldRadiusFactor - 1);
    const startupAltitude = mothership.position.distanceTo(targetPlanet.position) - targetPlanet.radius;
    assert.ok(
      Math.abs(startupAltitude - expectedAltitude) <= 1e-6,
      `expected the initial mothership at arrival altitude: altitude=${startupAltitude.toFixed(6)} expected=${expectedAltitude.toFixed(6)}`
    );

    sim.step(1 / 60, NEUTRAL_CONTROLS);

    const arrivalEvent = state.eventLog.find((event) => event.type === 'mothership-arrived' && event.mothershipId === mothership.id);
    const encounter = state.encounterDirector.encounters.find((candidate) => candidate.mothershipSquadId === mothershipSquad.id);
    assert.ok(arrivalEvent, 'expected the initial mothership to record arrival immediately');
    assert.ok(arrivalEvent.frame <= 1, `expected immediate arrival: frame=${arrivalEvent.frame}`);
    assert.ok(encounter, 'expected the initial mothership to create an invasion encounter');
    assert.strictEqual(encounter.status, 'active', 'expected the initial invasion mission to activate immediately');
    assert.strictEqual(mothershipSquad.mode, 'hold', 'expected the initial mothership to enter hold after arrival');

    console.log(`PASS startup-invasion-arrival: arrivalFrame=${arrivalEvent.frame} planet=${targetPlanet.name}`);
  } finally {
    config.startWithInitialInvasion = previousStartSetting;
  }
}

function runMothershipArrivalTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  state.mothershipSpawnTimer = 0;
  stepSim(sim, 1, NEUTRAL_CONTROLS);
  const mothershipSquad = state.mothershipSquads[0];
  assert.ok(mothershipSquad, 'expected a mothership squad to spawn when the timer expires');
  assert.strictEqual(mothershipSquad.family, 'FlyingSaucer', 'expected motherships to use FlyingSaucer assets');

  const planet = state.planets[mothershipSquad.targetPlanetIndex];
  assert.ok(planet, 'expected a target planet for the mothership test');

  stepSim(sim, 250000, NEUTRAL_CONTROLS);

  const arrivalEvent = state.eventLog.find((event) => event.type === 'mothership-arrived' && event.mothershipId === mothershipSquad.id);
  const reorientedEvent = state.eventLog.find((event) => event.type === 'mothership-reoriented' && event.mothershipId === mothershipSquad.id);
  const crashEvent = state.eventLog.find((event) => (
    event.type === 'enemy-death'
    && event.kind === 'mothership'
    && event.cause === 'crash'
    && event.squadId === mothershipSquad.id
  ));
  assert.ok(arrivalEvent, 'expected the mothership to record an arrival event');
  assert.ok(reorientedEvent, 'expected the mothership to record a reorientation event');
  assert.ok(!crashEvent, `expected the mothership to never crash into a planet, but it died at frame ${crashEvent?.diedAtFrame}`);
  const reorientSeconds = reorientedEvent.time - arrivalEvent.time;
  assert.ok(
    reorientSeconds >= 4.0 && reorientSeconds <= 5.5,
    `expected mothership reorientation to take about 4-5 seconds: seconds=${reorientSeconds.toFixed(3)}`
  );

  const mothership = state.enemies.find((enemy) => enemy.squadId === mothershipSquad.id && enemy.health > 0);
  const referencePosition = mothership
    ? mothership.position
    : new THREE.Vector3(reorientedEvent.position.x, reorientedEvent.position.y, reorientedEvent.position.z);
  const altitude = referencePosition.distanceTo(planet.position) - planet.radius;
  assert.ok(
    mothershipSquad.fightersTotal >= config.mothershipFighterCountMin && mothershipSquad.fightersTotal <= config.mothershipFighterCountMax,
    `expected mothership fighter count to be configured range: total=${mothershipSquad.fightersTotal}`
  );
  const fighterSpawns = state.eventLog.filter(
    (event) => event.type === 'enemy-spawn' && event.spawnedByMothershipId === mothershipSquad.id
  );
  assert.ok(fighterSpawns.length > 0, 'expected the mothership to release at least one fighter');
  assert.ok(
    fighterSpawns.every((event) => event.family === mothershipSquad.fighterFamily),
    'expected mothership fighters to share one family'
  );
  console.log(
    `PASS mothership-arrival: altitude=${altitude.toFixed(3)} arrivalFrame=${arrivalEvent.frame} reorientSeconds=${reorientSeconds.toFixed(3)} fighters=${fighterSpawns.length}`
  );
}

function runMothershipHoldReorientSmoothnessTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  state.mothershipSpawnTimer = 0;
  stepSim(sim, 1, NEUTRAL_CONTROLS);

  const mothershipSquad = state.mothershipSquads[0];
  assert.ok(mothershipSquad, 'expected a mothership squad to spawn for the reorient test');
  const planet = state.planets[mothershipSquad.targetPlanetIndex];
  assert.ok(planet, 'expected a target planet for the reorient test');

  while (mothershipSquad.mode !== 'hold' && state.frameIndex < 50000) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
  }
  assert.strictEqual(mothershipSquad.mode, 'hold', 'expected the mothership to reach hold before testing reorientation');

  const radial = mothershipSquad.holdRadial.clone().normalize();
  const initialUp = state.enemies.find((enemy) => enemy.squadId === mothershipSquad.id && enemy.kind === 'mothership').up.clone().normalize();
  const initialDot = initialUp.dot(radial);

  const dots = [initialDot];
  for (let i = 0; i < 12; i += 1) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    const mothership = state.enemies.find((enemy) => enemy.squadId === mothershipSquad.id && enemy.kind === 'mothership');
    assert.ok(mothership, 'expected the mothership to remain alive during reorientation');
    dots.push(mothership.up.clone().normalize().dot(radial));
  }

  assert.ok(
    dots[1] <= dots[0] + 0.02,
    `expected no first-frame snap during reorientation: first=${dots[0].toFixed(3)} second=${dots[1].toFixed(3)}`
  );
  assert.ok(
    dots[2] <= dots[1] + 0.08,
    `expected the reorientation to ramp smoothly after the first frame: second=${dots[1].toFixed(3)} third=${dots[2].toFixed(3)}`
  );
  assert.ok(
    dots[dots.length - 1] > dots[0] - 0.05,
    `expected the mothership to begin the belly-down turn smoothly: first=${dots[0].toFixed(3)} later=${dots[dots.length - 1].toFixed(3)}`
  );

  console.log(
    `PASS mothership-hold-reorient-smoothness: first=${dots[0].toFixed(3)} second=${dots[1].toFixed(3)} third=${dots[2].toFixed(3)}`
  );
}

function runDeepSpaceEnemyDistanceTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  state.mothershipSpawnTimer = 0;
  stepSim(sim, 1, NEUTRAL_CONTROLS);

  const failures = [];
  const suspiciousDistance = config.deepSpaceSuspiciousDistance;
  const suspiciousEvents = state.eventLog.filter((event) => (
    event.type === 'enemy-spawn'
    && event.position
  ));

  for (const event of suspiciousEvents) {
    const position = new THREE.Vector3(event.position.x, event.position.y, event.position.z);
    const nearestDistance = nearestBodyDistance(position, state.planets);
    if (nearestDistance > suspiciousDistance) {
      failures.push(
        `spawned too far from all bodies: kind=${event.kind} id=${event.enemyId} nearest=${nearestDistance.toFixed(3)} limit=${suspiciousDistance.toFixed(3)}`
      );
      break;
    }
  }

  const seenEnemies = new Set();
  for (let i = 0; i < 9000; i += 1) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    for (const enemy of state.enemies) {
      if (seenEnemies.has(enemy.id)) {
        continue;
      }
      const nearestDistance = nearestBodyDistance(enemy.position, state.planets);
      if (nearestDistance > suspiciousDistance) {
        seenEnemies.add(enemy.id);
        failures.push(
          `enemy drifted too far from all bodies: kind=${enemy.kind} id=${enemy.id} squad=${enemy.squadId} nearest=${nearestDistance.toFixed(3)} limit=${suspiciousDistance.toFixed(3)}`
        );
      }
    }
    if (failures.length > 0) {
      break;
    }
  }

  if (failures.length > 0) {
    throw new Error([
      'Deep-space distance guard failed:',
      `- ${failures[0]}`,
      ...failures.slice(1).map((failure) => `- ${failure}`)
    ].join('\n'));
  }

  console.log(`PASS deep-space-distance: limit=${suspiciousDistance.toFixed(3)}`);
}

function runRegularScenarioDeepSpaceRunawayTest() {
  const seed = resolveBenchSeed();
  const sim = createOrbitalsSim(seed);
  sim.bootstrapWorld();

  const { state } = sim;
  const failures = [];
  const suspiciousDistance = config.deepSpaceSuspiciousDistance;
  const maxFrames = 18_000;
  let offendingEvent = null;
  let offendingDistance = 0;

  for (let i = 0; i < maxFrames; i += 1) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);

    for (const enemy of state.enemies) {
      const nearestDistance = nearestBodyDistance(enemy.position, state.planets);
      if (nearestDistance > suspiciousDistance) {
        offendingEvent = {
          frame: state.frameIndex,
          id: enemy.id,
          kind: enemy.kind,
          squadId: enemy.squadId,
          nearestDistance
        };
        offendingDistance = nearestDistance;
        break;
      }
    }

    if (offendingEvent) {
      break;
    }
  }

  if (offendingEvent) {
    failures.push(
      `enemy drifted too far from all bodies in the regular scenario: kind=${offendingEvent.kind} id=${offendingEvent.id} squad=${offendingEvent.squadId} frame=${offendingEvent.frame} nearest=${offendingDistance.toFixed(3)} limit=${suspiciousDistance.toFixed(3)} seed=${seed}`
    );
  }

  if (failures.length > 0) {
    throw new Error([
      'Regular-scenario deep-space guard failed:',
      `- ${failures[0]}`,
      ...failures.slice(1).map((failure) => `- ${failure}`)
    ].join('\n'));
  }

  console.log(`PASS regular-scenario-deep-space: seed=${seed} limit=${suspiciousDistance.toFixed(3)} frames=${state.frameIndex}`);
}

function runMothershipPlanetCrashTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const targetPlanetIndex = 0;
  const targetPlanet = state.planets[targetPlanetIndex];
  assert.ok(targetPlanet, 'expected a target planet for the mothership crash test');
  state.mothershipSpawnTimer = 0;
  stepSim(sim, 1, NEUTRAL_CONTROLS);

  const mothershipSquad = state.mothershipSquads[0];
  assert.ok(mothershipSquad, 'expected a mothership squad to spawn for the crash test');

  const mothership = state.enemies.find((enemy) => enemy.squadId === mothershipSquad.id && enemy.kind === 'mothership');
  assert.ok(mothership, 'expected the mothership enemy to exist for the crash test');

  const inward = targetPlanet.position.clone().sub(mothership.position).normalize();
  const crashAltitude = Math.max(0.25, config.atmosphereTerrainCrashAltitude);
  const crashDistance = targetPlanet.radius + crashAltitude * 0.5;
  mothership.position.copy(targetPlanet.position).addScaledVector(inward, crashDistance);
  mothership.previousPosition.copy(mothership.position).addScaledVector(inward, 2);
  mothership.velocity.copy(inward).multiplyScalar(-1.5);
  mothership.forward.copy(inward);
  mothership.up.copy(targetPlanet.position.clone().sub(mothership.position).normalize());
  mothership.speed = mothership.velocity.length();
  mothership.relativePosition.copy(mothership.position).sub(targetPlanet.position);
  mothership.relativeVelocity.copy(mothership.velocity).sub(targetPlanet.velocity);
  mothership.boundPlanet = null;
  mothership.flightMode = 'free';
  mothership.squadMode = 'exit';
  mothershipSquad.mode = 'exit';
  mothershipSquad.mothershipExitDirection.copy(targetPlanet.position).sub(mothership.position).normalize();
  if (mothershipSquad.mothershipExitDirection.lengthSq() < 1e-6) {
    mothershipSquad.mothershipExitDirection.copy(inward);
  }

  let crossEvent = null;
  let crashEvent = null;
  for (let i = 0; i < 120; i += 1) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    crossEvent = state.eventLog.find((event) => (
      event.type === 'mothership-planet-cross'
      && event.mothershipId === mothership.id
      && event.planetIndex === targetPlanetIndex
    ));
    crashEvent = state.eventLog.find((event) => (
      event.type === 'enemy-death'
      && event.enemyId === mothership.id
      && event.kind === 'mothership'
      && event.cause === 'crash'
    ));
    if (crossEvent || crashEvent) {
      break;
    }
  }

  assert.ok(crossEvent, `expected the mothership to cross into planet ${targetPlanetIndex}`);
  assert.ok(crashEvent, `expected the mothership to die from the crash into planet ${targetPlanetIndex}`);
  assert.ok(
    crashEvent.diedAtFrame >= crossEvent.frame,
    `expected the crash death to happen on or after the crossing frame: cross=${crossEvent.frame} death=${crashEvent.diedAtFrame}`
  );

  console.log(`PASS mothership-planet-crash: planet=${targetPlanetIndex} frame=${crossEvent.frame}`);
}

function runMothershipFighterLaunchTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  state.enemies.length = 0;
  state.enemySquads.length = 0;
  state.enemySquad = null;
  state.mothershipSquads.length = 0;
  state.mothershipSquad = null;
  state.enemySpawnTimer = 9999;
  state.mothershipSpawnTimer = 0;

  stepSim(sim, 1, NEUTRAL_CONTROLS);
  const mothershipSquad = state.mothershipSquads[0];
  assert.ok(mothershipSquad, 'expected a mothership squad to spawn for the fighter launch test');
  const mothership = state.enemies.find((enemy) => enemy.squadId === mothershipSquad.id && enemy.kind === 'mothership');
  assert.ok(mothership, 'expected a mothership enemy to exist for the fighter launch test');

  const planet = state.planets[mothershipSquad.targetPlanetIndex];
  assert.ok(planet, 'expected the mothership to have a target planet');

  let settleFrames = 0;
  while (mothershipSquad.mode !== 'hold' && settleFrames < 50000) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    settleFrames += 1;
  }
  assert.strictEqual(mothershipSquad.mode, 'hold', 'expected the mothership to reach the hold position first');

  state.enemies = state.enemies.filter((enemy) => enemy.squadId === mothershipSquad.id && enemy.kind === 'mothership');
  state.enemySquads = [mothershipSquad];
  state.enemySquad = mothershipSquad;
  state.mothershipSquads = [mothershipSquad];
  state.mothershipSquad = mothershipSquad;
  mothershipSquad.mode = 'hold';
  mothershipSquad.fightersTotal = 1;
  mothershipSquad.fightersReleased = 0;
  mothershipSquad.fightersAlive = 0;
  mothershipSquad.fighterReleaseCooldown = 0;

  sim.step(1 / 60, NEUTRAL_CONTROLS);

  const currentMothership = state.enemies.find((enemy) => enemy.squadId === mothershipSquad.id && enemy.kind === 'mothership' && enemy.health > 0);
  assert.ok(currentMothership, 'expected the mothership to remain active while launching fighters');

  const fighterSquad = state.enemySquads.find((squad) => squad.parentMothershipId === mothershipSquad.id);
  assert.ok(fighterSquad, 'expected a fighter squad to be launched from the mothership');

  const fighter = state.enemies.find((enemy) => enemy.squadId === fighterSquad.id && enemy.health > 0);
  assert.ok(fighter, 'expected a fighter enemy to exist after launch');
  const mothershipPosition = currentMothership.position.clone();
  const mothershipDistanceToPlanet = mothershipPosition.distanceTo(planet.position);
  const mothershipRadial = mothershipPosition.clone().sub(planet.position).normalize();
  const fighterDistanceToMothership = fighter.position.distanceTo(mothershipPosition);
  const fighterDistanceToPlanet = fighter.position.distanceTo(planet.position);
  const fighterRadial = fighter.position.clone().sub(planet.position).normalize();
  const fighterForward = fighter.forward.clone().normalize();
  const startAltitude = fighterDistanceToPlanet - planet.radius;
  const atmosphereThickness = planet.atmosphereRadius - planet.radius;

  let minAltitude = startAltitude;
  let maxAltitude = startAltitude;
  for (let i = 0; i < 600; i += 1) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    const altitudeNow = fighter.position.distanceTo(planet.position) - planet.radius;
    minAltitude = Math.min(minAltitude, altitudeNow);
    maxAltitude = Math.max(maxAltitude, altitudeNow);
  }

  assert.ok(
    fighterDistanceToMothership <= 1e-6,
    `expected the fighter to spawn at the mothership center: distance=${fighterDistanceToMothership.toFixed(6)}`
  );
  assert.ok(
    Math.abs(fighterDistanceToPlanet - mothershipDistanceToPlanet) <= 1e-6,
    `expected the fighter to spawn at the mothership radial distance: fighter=${fighterDistanceToPlanet.toFixed(6)} mothership=${mothershipDistanceToPlanet.toFixed(6)}`
  );
  assert.ok(
    fighterRadial.dot(mothershipRadial) > 0.6,
    `expected the fighter to spawn in the same hemisphere as the mothership: dot=${fighterRadial.dot(mothershipRadial).toFixed(3)}`
  );
  assert.ok(
    fighterForward.dot(fighterRadial) > -0.2,
    `expected the fighter to launch away from a straight planet dive: dot=${fighterForward.dot(fighterRadial).toFixed(3)}`
  );
  assert.ok(
    minAltitude < startAltitude - 0.25,
    `expected the fighter to make progress toward the atmosphere: start=${startAltitude.toFixed(3)} min=${minAltitude.toFixed(3)}`
  );
  assert.ok(
    minAltitude > config.atmosphereTerrainCrashAltitude + 0.5,
    `expected the fighter to stay above the crash altitude during the launch: min=${minAltitude.toFixed(3)} crash=${config.atmosphereTerrainCrashAltitude.toFixed(3)}`
  );
  assert.ok(
    maxAltitude <= startAltitude + atmosphereThickness * 0.15,
    `expected the fighter not to boost away into space after launch: start=${startAltitude.toFixed(3)} peak=${maxAltitude.toFixed(3)} ceiling=${(startAltitude + atmosphereThickness * 0.15).toFixed(3)}`
  );

  console.log(
    `PASS mothership-fighter-launch: near=${fighterDistanceToMothership.toFixed(3)} planetDot=${fighterRadial.dot(mothershipRadial).toFixed(3)} minAlt=${minAltitude.toFixed(3)} maxAlt=${maxAltitude.toFixed(3)}`
  );
}

function runMothershipFighterPatrolTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const planet = state.planets[0];
  assert.ok(planet, 'expected a planet for the patrol test');

  const setup = spawnMothershipFighterScenario(sim);
  const fighterId = setup.fighter.id;
  const targetPlanet = state.planets[setup.fighterSquad.targetPlanetIndex] || planet;
  assert.strictEqual(setup.fighterSquad.mode, 'approach', 'expected mothership fighters to start in approach mode');
  assert.strictEqual(
    setup.fighterSquad.parentMothershipId >= 0 && setup.fighterSquad.mode === 'swarm',
    false,
    'expected fighterPatrolMode to be false before settling'
  );
  assert.strictEqual(setup.fighterSquad.fighterSettleTimer, 0, 'expected the fighter settle timer to start at zero');

  state.mothershipSpawnTimer = Infinity;

  let settleStartFrame = -1;
  let swarmEntryFrame = -1;
  let swarmEntryTime = -1;
  const maxEntryFrames = 12000;
  for (let i = 0; i < maxEntryFrames; i += 1) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    const liveFighter = state.enemies.find((enemy) => enemy.id === fighterId);
    assert.ok(liveFighter, 'expected the fighter to remain alive while entering the atmosphere');
    assert.strictEqual(liveFighter.squadId, setup.fighterSquad.id, 'expected the fighter to stay in its mothership squad');
    if (setup.fighterSquad.fighterSettleTimer > 0 && settleStartFrame < 0) {
      settleStartFrame = state.frameIndex;
    }
    if (setup.fighterSquad.mode === 'swarm') {
      swarmEntryFrame = state.frameIndex;
      swarmEntryTime = state.time;
      break;
    }
  }

  assert.ok(swarmEntryFrame >= 0, 'expected the fighter to enter patrol after settling');
  assert.ok(settleStartFrame >= 0, 'expected the fighter to begin settling before patrol');
  assert.ok(
    setup.fighterSquad.fighterSettleTimer >= config.fighterSettleTime,
    `expected the fighter settle timer to reach the configured threshold: timer=${setup.fighterSquad.fighterSettleTimer.toFixed(3)} threshold=${config.fighterSettleTime.toFixed(3)}`
  );

  const entryEvent = state.eventLog.find(
    (event) => event.type === 'enemy-spawn' && event.enemyId === fighterId
  );
  assert.ok(entryEvent, 'expected a spawn event for the fighter');
  assert.strictEqual(entryEvent.spawnedByMothershipId, setup.mothershipSquad.id, 'expected the fighter to be spawned by the mothership');
  const settleEvent = state.eventLog.find((event) => event.type === 'fighter-settle-start' && event.squadId === setup.fighterSquad.id);
  const patrolEvent = state.eventLog.find((event) => event.type === 'fighter-patrol-start' && event.squadId === setup.fighterSquad.id);
  assert.ok(settleEvent, 'expected a fighter-settle-start debug event');
  assert.ok(patrolEvent, 'expected a fighter-patrol-start debug event');
  assert.ok(patrolEvent.frame >= settleEvent.frame, 'expected patrol to start after settle detection');

  const noCrashWindowFrames = 1800;
  let crashEvent = null;
  let collisionEvent = null;
  for (let i = 0; i < noCrashWindowFrames; i += 1) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    const deathEvent = state.eventLog.find((event) => (
      event.type === 'enemy-death'
      && event.enemyId === fighterId
      && event.diedAtFrame >= entryFrame
    ));
    if (deathEvent) {
      if (deathEvent.cause === 'collision') {
        collisionEvent = deathEvent;
      } else {
        crashEvent = deathEvent;
      }
      break;
    }
    const liveFighter = state.enemies.find((enemy) => enemy.id === fighterId);
    assert.ok(liveFighter, 'expected the fighter to stay alive during the patrol window');
    assert.strictEqual(liveFighter.boundPlanet, targetPlanet, 'expected the fighter to stay bound to the planet during patrol');
  }

  assert.strictEqual(crashEvent, null, `expected the fighter not to crash into a planet or the sun during the 30s patrol window after entry, but it died at frame ${crashEvent?.diedAtFrame}`);
  if (collisionEvent) {
    console.log(`INFO mothership-fighter-patrol: collision accepted at frame=${collisionEvent.diedAtFrame} cause=${collisionEvent.cause}`);
  }

  console.log(
    `PASS mothership-fighter-patrol: enteredFrame=${swarmEntryFrame} enteredTime=${swarmEntryTime.toFixed(3)} planet=${targetPlanet.name}`
  );

  const regularSquad = {
    id: 900001,
    kind: 'regular',
    family: setup.fighterSquad.family,
    familyFiles: setup.fighterSquad.familyFiles || [],
    targetPlanetIndex: setup.fighterSquad.targetPlanetIndex,
    nextPlanetIndex: setup.fighterSquad.nextPlanetIndex,
    departPlanetIndex: -1,
    departVector: new THREE.Vector3(1, 0, 0),
    mode: 'approach',
    modeTimer: 0,
    orbitPhase: 0,
    orbitDirection: 1,
    orbitProgress: 0,
    orbitLastAngle: NaN,
    swarmDuration: 30,
    departDuration: 30,
    parentMothershipId: -1,
    fighterSettleTimer: 0
  };
  const regularEnemy = setup.fighter;
  regularEnemy.squadId = regularSquad.id;
  regularEnemy.kind = 'regular';
  regularEnemy.parentMothershipId = -1;
  regularEnemy.encounterId = -1;
  regularEnemy.combatRole = 'reserve';
  regularEnemy.presentation = null;
  regularEnemy.objectiveAttack = null;
  regularEnemy.isPrimaryThreat = false;
  regularEnemy.hudPriority = config.encounterReserveHudPriority;
  regularEnemy.boundPlanet = targetPlanet;
  regularEnemy.flightMode = 'bound';
  regularEnemy.captureTimer = config.shipCaptureBlendTime;
  regularEnemy.position.copy(targetPlanet.position).addScaledVector(
    targetPlanet.position.clone().normalize(),
    targetPlanet.radius + config.planetCaptureAltitude * 0.8
  );
  regularEnemy.previousPosition.copy(regularEnemy.position);
  regularEnemy.forward.copy(regularEnemy.position.clone().sub(targetPlanet.position).normalize());
  regularEnemy.up.copy(regularEnemy.position.clone().sub(targetPlanet.position).normalize());
  regularEnemy.speed = 10;
  regularEnemy.velocity.copy(regularEnemy.forward).multiplyScalar(regularEnemy.speed);
  regularEnemy.relativePosition.copy(regularEnemy.position).sub(targetPlanet.position);
  regularEnemy.relativeVelocity.copy(regularEnemy.velocity).sub(targetPlanet.velocity);

  state.enemies.length = 0;
  state.enemies.push(regularEnemy);
  state.enemySquads = [regularSquad];
  state.enemySquad = regularSquad;
  state.encounterDirector.encounters.length = 0;
  state.encounterDirector.activeEncounterId = -1;
  state.encounterDirector.activePresenterEnemyIds.length = 0;
  state.encounterDirector.activeObjectiveAttackerEnemyIds.length = 0;
  state.eventLog.length = 0;

  let regularSwarmFrame = -1;
  for (let i = 0; i < 240; i += 1) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    if (regularSquad.mode === 'swarm') {
      regularSwarmFrame = state.frameIndex;
      break;
    }
  }
  assert.ok(regularSwarmFrame >= 0, 'expected a regular squad to still use the capture-based swarm transition');
  assert.ok(
    altitudeBetween(regularEnemy, targetPlanet) <= config.planetCaptureAltitude + 1e-6,
    `expected the regular squad to transition at the old capture altitude rule: altitude=${altitudeBetween(regularEnemy, targetPlanet).toFixed(3)} capture=${config.planetCaptureAltitude.toFixed(3)}`
  );
}

function runMothershipSpawnRegressionTest() {
  const sim = createOrbitalsSim(0xC0FFEE);
  sim.bootstrapWorld();

  const { state } = sim;
  const failures = [];
  const recordFailure = (message) => failures.push(message);
  const vecToText = (point) => {
    if (!point) {
      return '(missing)';
    }
    return `(${point.x.toFixed(3)}, ${point.y.toFixed(3)}, ${point.z.toFixed(3)})`;
  };
  const planet = state.planets[0];
  assert.ok(planet, 'expected at least one planet for the mothership regression test');
  state.planets.splice(1);
  state.respawnPlanetIndex = 0;
  state.nearestPlanet = planet;
  state.nearestDistance = planet.radius * 20;
  state.nearestAltitude = state.nearestDistance - planet.radius;
  state.enemies.length = 0;
  state.enemySquads.length = 0;
  state.enemySquad = null;
  state.mothershipSquads.length = 0;
  state.mothershipSquad = null;
  state.enemySpawnTimer = 9999;
  state.mothershipSpawnTimer = 0;
  state.eventLog.length = 0;

  stepSim(sim, 1, NEUTRAL_CONTROLS);
  const mothershipSquad = state.mothershipSquads[0];
  if (!mothershipSquad) {
    throw new Error('expected a mothership squad to spawn');
  }

  const mothership = state.enemies.find((enemy) => enemy.squadId === mothershipSquad.id && enemy.kind === 'mothership');
  if (!mothership) {
    throw new Error('expected the mothership enemy to exist');
  }

  let holdFrames = 0;
  while (mothershipSquad.mode !== 'hold' && holdFrames < 50000) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    holdFrames += 1;
  }
  if (mothershipSquad.mode !== 'hold') {
    recordFailure(`mothership never reached hold within the setup window: mode=${mothershipSquad.mode}`);
  }

  const arrivedEvent = state.eventLog.find((event) => event.type === 'mothership-arrived');
  if (!arrivedEvent) {
    recordFailure('mothership arrival event was not recorded');
  }

  let reorientFrames = 0;
  while (!mothershipSquad.holdReoriented && reorientFrames < 9000) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    reorientFrames += 1;
  }
  if (!mothershipSquad.holdReoriented) {
    recordFailure('mothership did not finish reorienting before fighter release');
  } else {
    const radial = mothership.position.clone().sub(planet.position).normalize();
    const upDot = mothership.up.clone().normalize().dot(radial);
    if (upDot <= 0.9) {
      recordFailure(`expected the mothership to be oriented belly-down after reorienting: dot=${upDot.toFixed(3)}`);
    }
  }

  let releaseFrames = 0;
  while (mothershipSquad.fightersReleased < 10 && releaseFrames < 12000) {
    sim.step(1 / 60, NEUTRAL_CONTROLS);
    releaseFrames += 1;
  }
  if (mothershipSquad.fightersReleased < 10) {
    recordFailure(`expected at least 10 fighters to have spawned: released=${mothershipSquad.fightersReleased}`);
  }

  stepSim(sim, 9000, NEUTRAL_CONTROLS);

  const fighterSquads = state.enemySquads.filter((squad) => squad.parentMothershipId === mothershipSquad.id);
  const activeFighters = state.enemies.filter((enemy) => (
    enemy.health > 0
    && fighterSquads.some((squad) => squad.id === enemy.squadId)
  ));
  const expectedFighterMinimum = 9;
  if (fighterSquads.length < expectedFighterMinimum) {
    recordFailure(`expected at least ${expectedFighterMinimum} fighter squads: squads=${fighterSquads.length}`);
  }

  const spawnEvents = state.eventLog.filter((event) => event.type === 'enemy-spawn' && event.spawnedByMothershipId === mothershipSquad.id);
  const crashEvents = state.eventLog.filter((event) => event.type === 'enemy-death' && event.cause === 'crash');
  const firstSpawnEvent = spawnEvents[0];
  if (!firstSpawnEvent) {
    recordFailure('no fighter spawn events were recorded');
  } else {
    if (!arrivedEvent) {
      recordFailure('cannot verify spawn timing because the arrival event is missing');
    } else if (firstSpawnEvent.frame < arrivedEvent.frame) {
      recordFailure(`fighters started spawning too early: firstSpawnFrame=${firstSpawnEvent.frame} arrivalFrame=${arrivedEvent.frame}`);
    }

    const spawnPosition = firstSpawnEvent.position;
    const mothershipPosition = firstSpawnEvent.mothershipPosition;
    if (!spawnPosition || !mothershipPosition) {
      recordFailure('first fighter spawn event is missing position data');
    } else {
      const dx = Math.abs(spawnPosition.x - mothershipPosition.x);
      const dy = Math.abs(spawnPosition.y - mothershipPosition.y);
      const dz = Math.abs(spawnPosition.z - mothershipPosition.z);
      if (dx > 1e-6 || dy > 1e-6 || dz > 1e-6) {
        recordFailure(`fighter did not spawn from the mothership center: fighter=${vecToText(spawnPosition)} mothership=${vecToText(mothershipPosition)}`);
      }
    }
  }

  if (crashEvents.length > 0) {
    const crashList = crashEvents
      .filter((event) => event.kind === 'fighter' || event.family === mothershipSquad.fighterFamily)
      .map((event) => `#${event.enemyId}@f${event.frame}`)
      .join(', ');
    recordFailure(`fighter crash events were recorded: ${crashList || crashEvents.length}`);
  }

  if (activeFighters.length < expectedFighterMinimum) {
    recordFailure(`expected at least ${expectedFighterMinimum} fighters to still be alive: active=${activeFighters.length}`);
  }
  if (activeFighters.length !== fighterSquads.length) {
    recordFailure(`expected all spawned fighters to remain alive: active=${activeFighters.length} total=${fighterSquads.length}`);
  }

  if (failures.length > 0) {
    const message = [
      'Mothership spawn regression failed:',
      `- ${failures[0]}`,
      ...failures.slice(1).map((failure) => `- ${failure}`)
    ].join('\n');
    throw new Error(message);
  }

  console.log(
    `PASS mothership-spawn-regression: holdFrames=${holdFrames} releaseFrames=${releaseFrames} fighters=${fighterSquads.length}`
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

  console.log(`PASS enemy-family-index: families=${familyEntries.length} files=${totalFiles}`);
}

runSimulationArchitectureGuardTest();
await runLowRiskSimulationModuleSmokeTest();
await runPhaseDModuleSmokeTest();
runSpatialHashNeighborTest();
runStableAltitudeTest();
runPublicSimApiSmokeTest();
runPitchResponseTest();
runAtmosphereTerrainRecoveryTest();
runAtmosphereTerrainCrashTest();
runBoostRecoveryTest();
runBoostThrustTest();
runShipMaxMaxSpeedTest();
runAtmosphereBoostPitchLockTest();
runAtmosphereCenteredMouseReorientTest();
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
runFreeGravityLowSpeedBendTest();
runFreeGravityHighSpeedTest();
// Temporarily parked while free-space gravity nose-pull is reworked.
runArcadeOrbitViabilityTest();
runProjectileFireTest();
runProjectileModuleFacadeComparisonTest();
runProjectileNormalScenarioSmokeTest();
runProjectileBoundFlightInheritedVelocityTest();
runProjectileFireWhileMovingTest();
runProjectileNearPlanetSurvivalTest();
runProjectilePlanetAimRegressionTest();
runProjectileMovingPlanetHeadingDriftTest();
runProjectilePlanetFlightVelocityCapTest();
runProjectilePlanetMotionSpeedDiagnosticTest();
runProjectileHomingTest();
runProjectileHomingLimitTest();
runProjectileHomingReferenceFrameTest();
runProjectileHomingCorrectionCorridorTest();
runProjectileHomingNoRetargetTest();
runEnemyCrashExplosionTest('planet');
runEnemyCrashExplosionTest('sun');
runPlanetOrbitTest();
runPlanetCaptureArrivalTest();
runPlanetCaptureBlendTest();
runPresentationMetricHelperTest();
runPresentationProjectionHelperTest();
runBehindCatchupPresentationTest();
runBehindCatchupPresentationWithGentleTurnTest();
runSideCrossPresentationTest();
runSideCrossPresentationWithGentleTurnTest();
runHeadOnBreakawayPresentationTest();
runHeadOnBreakawayAvoidsCollisionTest();
runEncounterDirectorBudgetTest();
runEncounterDirectorRotatesPresentersTest();
runManyEnemiesFewPresentersTest();
runPlanetInvasionClearTest();
runPlanetEncounterDoesNotClearWhileFightersRemainTest();
runGenericEncounterHelperSmokeTest();
runFreeSpaceAmbushPresenterTest();
runTransportDefenseBudgetTest();
runTransportDefenseAttackRunTest();
runTransportDefensePlayerPresenterTest();
runTransportDefenseFailureTest();
runTransportDefenseSuccessTest();
runTransportDefenseAbortTest();
runConvoyEscortSuccessTest();
runBossSupportWaveSuccessTest();
runStartupInvasionArrivalTest();
runMothershipArrivalTest();
runMothershipHoldReorientSmoothnessTest();
runDeepSpaceEnemyDistanceTest();
runRegularScenarioDeepSpaceRunawayTest();
runMothershipPlanetCrashTest();
runMothershipFighterLaunchTest();
runMothershipFighterPatrolTest();
runMothershipSpawnRegressionTest();
runEnemyFamilyIndexTest();
runEnemySquadMovementTest();
