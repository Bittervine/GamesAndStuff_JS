import * as THREE from '../lib/three.module.js';
import { config } from '../orbitals_config.js';
import { mulberry32 } from './math.js';

export const ENEMY_HIT_RADIUS = config.enemyHitRadius;

export function createShipState() {
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
    speed: 0
  };
}

export function createEnemyState() {
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
    hudPriority: config.encounterReserveHudPriority
  };
}

export function createEncounterDirectorState() {
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

export function resetEncounterDirectorState(state) {
  state.encounterDirector = createEncounterDirectorState();
  state.encounterEntities = [];
}

export function createEncounterState(state, options = {}) {
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

export function createEncounterEntityState(state, options = {}) {
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
    visualScale: options.visualScale ?? 2.4
  };
  if (!Array.isArray(state.encounterEntities)) {
    state.encounterEntities = [];
  }
  state.encounterEntities.push(entity);
  return entity;
}

function aliasStateProperty(target, key, source, sourceKey) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get() {
      return source[sourceKey];
    },
    set(value) {
      source[sourceKey] = value;
    }
  });
}

export function attachNestedStateAliases(state) {
  const game = {};
  const world = {};
  const player = {};
  const enemies = {};
  const motherships = {};
  const encounters = {};
  const projectiles = {};
  const pickups = {};
  const spatial = {};
  const events = {};

  for (const key of ['seed', 'rng', 'time', 'frameIndex', 'loaded']) {
    aliasStateProperty(game, key, state, key);
  }

  aliasStateProperty(world, 'planets', state, 'planets');
  aliasStateProperty(world, 'fuelMotes', state, 'fuelMotes');
  aliasStateProperty(world, 'nearestPlanet', state, 'nearestPlanet');
  aliasStateProperty(world, 'nearestAltitude', state, 'nearestAltitude');
  aliasStateProperty(world, 'nearestDistance', state, 'nearestDistance');

  aliasStateProperty(player, 'ship', state, 'ship');
  aliasStateProperty(player, 'fuel', state, 'fuel');
  aliasStateProperty(player, 'maxFuel', state, 'maxFuel');
  aliasStateProperty(player, 'score', state, 'score');
  aliasStateProperty(player, 'speed', state, 'speed');
  aliasStateProperty(player, 'crashed', state, 'crashed');
  aliasStateProperty(player, 'crashTimer', state, 'crashTimer');
  aliasStateProperty(player, 'crashRespawnReady', state, 'crashRespawnReady');
  aliasStateProperty(player, 'respawnPlanetIndex', state, 'respawnPlanetIndex');
  aliasStateProperty(player, 'gamepadRespawnHeld', state, 'gamepadRespawnHeld');

  aliasStateProperty(enemies, 'nextId', state, 'nextEnemyId');
  aliasStateProperty(enemies, 'nextSquadId', state, 'nextEnemySquadId');
  aliasStateProperty(enemies, 'items', state, 'enemies');
  aliasStateProperty(enemies, 'squads', state, 'enemySquads');
  aliasStateProperty(enemies, 'activeSquad', state, 'enemySquad');
  aliasStateProperty(enemies, 'explosions', state, 'enemyExplosions');
  aliasStateProperty(enemies, 'nextExplosionId', state, 'nextEnemyExplosionId');

  aliasStateProperty(motherships, 'squads', state, 'mothershipSquads');
  aliasStateProperty(motherships, 'activeSquad', state, 'mothershipSquad');
  aliasStateProperty(motherships, 'spawnTimer', state, 'mothershipSpawnTimer');
  aliasStateProperty(motherships, 'rng', state, 'mothershipRng');

  aliasStateProperty(encounters, 'director', state, 'encounterDirector');
  aliasStateProperty(encounters, 'entities', state, 'encounterEntities');

  aliasStateProperty(projectiles, 'nextId', state, 'nextProjectileId');
  aliasStateProperty(projectiles, 'items', state, 'projectiles');

  aliasStateProperty(pickups, 'nextId', state, 'nextPickupId');
  aliasStateProperty(pickups, 'items', state, 'pickups');

  spatial.enemyHash = null;
  aliasStateProperty(events, 'log', state, 'eventLog');

  game.world = world;
  game.player = player;
  game.enemies = enemies;
  game.motherships = motherships;
  game.encounters = encounters;
  game.projectiles = projectiles;
  game.pickups = pickups;
  game.spatial = spatial;
  game.events = events;
  state.game = game;
  return state;
}

export function getEnemyState(state) {
  const nested = state?.game?.enemies || (state?.enemies && !Array.isArray(state.enemies) ? state.enemies : null);
  if (nested) {
    return nested;
  }

  const fallbackState = state || {};
  return {
    get nextId() {
      return fallbackState.nextEnemyId ?? 1;
    },
    set nextId(value) {
      fallbackState.nextEnemyId = value;
    },
    get nextSquadId() {
      return fallbackState.nextEnemySquadId ?? 1;
    },
    set nextSquadId(value) {
      fallbackState.nextEnemySquadId = value;
    },
    get items() {
      return fallbackState.enemies || [];
    },
    set items(value) {
      fallbackState.enemies = value;
    },
    get squads() {
      return fallbackState.enemySquads || [];
    },
    set squads(value) {
      fallbackState.enemySquads = value;
    },
    get activeSquad() {
      return fallbackState.enemySquad || null;
    },
    set activeSquad(value) {
      fallbackState.enemySquad = value;
    },
    get explosions() {
      return fallbackState.enemyExplosions || [];
    },
    set explosions(value) {
      fallbackState.enemyExplosions = value;
    },
    get nextExplosionId() {
      return fallbackState.nextEnemyExplosionId ?? 1;
    },
    set nextExplosionId(value) {
      fallbackState.nextEnemyExplosionId = value;
    }
  };
}

export function getEnemyItems(state) {
  return getEnemyState(state).items || [];
}

export function getProjectileState(state) {
  const nested = state?.game?.projectiles || (state?.projectiles && !Array.isArray(state.projectiles) ? state.projectiles : null);
  if (nested) {
    return nested;
  }

  const fallbackState = state || {};
  return {
    get nextId() {
      return fallbackState.nextProjectileId ?? 1;
    },
    set nextId(value) {
      fallbackState.nextProjectileId = value;
    },
    get items() {
      return fallbackState.projectiles || [];
    },
    set items(value) {
      fallbackState.projectiles = value;
    }
  };
}

export function getProjectileItems(state) {
  return getProjectileState(state).items || [];
}

export function getWorldState(state) {
  const nested = state?.game?.world || state?.world;
  if (nested) {
    return nested;
  }

  const fallbackState = state || {};
  return {
    get planets() {
      return fallbackState.planets || [];
    },
    set planets(value) {
      fallbackState.planets = value;
    },
    get fuelMotes() {
      return fallbackState.fuelMotes || [];
    },
    set fuelMotes(value) {
      fallbackState.fuelMotes = value;
    },
    get nearestPlanet() {
      return fallbackState.nearestPlanet || null;
    },
    set nearestPlanet(value) {
      fallbackState.nearestPlanet = value;
    },
    get nearestAltitude() {
      return fallbackState.nearestAltitude ?? 0;
    },
    set nearestAltitude(value) {
      fallbackState.nearestAltitude = value;
    },
    get nearestDistance() {
      return fallbackState.nearestDistance ?? 0;
    },
    set nearestDistance(value) {
      fallbackState.nearestDistance = value;
    }
  };
}

export function getWorldPlanets(state) {
  return getWorldState(state).planets || [];
}

export function getPlayerState(state) {
  return state?.game?.player || state?.player || state || {};
}

export function getEventsState(state) {
  const nested = state?.game?.events || state?.events;
  if (nested) {
    return nested;
  }

  const fallbackState = state || {};
  return {
    get log() {
      return fallbackState.eventLog || [];
    },
    set log(value) {
      fallbackState.eventLog = value;
    }
  };
}

export function getEventLog(state) {
  return getEventsState(state).log || [];
}

export function createGameState(seed) {
  const state = {
    seed,
    rng: mulberry32(seed >>> 0),
    planets: [],
    fuelMotes: [],
    enemies: [],
    encounterEntities: [],
    projectiles: [],
    enemyExplosions: [],
    pickups: [],
    nextProjectileId: 1,
    nextEnemyExplosionId: 1,
    nextEnemyId: 1,
    nextEnemySquadId: 1,
    nextPickupId: 1,
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
  return attachNestedStateAliases(state);
}

export function resetGameState(state) {
  state.planets.length = 0;
  state.fuelMotes.length = 0;
  state.enemies.length = 0;
  state.encounterEntities.length = 0;
  state.projectiles.length = 0;
  state.enemyExplosions.length = 0;
  if (!Array.isArray(state.pickups)) {
    state.pickups = [];
  } else {
    state.pickups.length = 0;
  }
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
  state.nextPickupId = 1;
  state.mothershipRng = mulberry32(((state.seed >>> 0) ^ 0x9e3779b9) >>> 0);
  state.mothershipSpawnTimer = config.mothershipSpawnDelayMin + state.mothershipRng() * (config.mothershipSpawnDelayMax - config.mothershipSpawnDelayMin);
  resetEncounterDirectorState(state);
  attachNestedStateAliases(state);
  return state;
}
