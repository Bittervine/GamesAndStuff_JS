import { createSeededRng, deriveSeed, normalizeSeed } from '../random/seededRng.js';
import { createReplayCapture, appendReplayEvent } from '../replay/replayCodec.js';
import { findDoorNearPoint, openDoor, parseLevelDefinition } from '../world/level.js';
import { moveCircle } from '../world/collision.js';
import { distance2d, hasLineOfSight } from '../world/raycast.js';
import { WEAPON_ORDER, getWeaponDef } from '../../data/weapons.js';
import { LEVEL_ALPHA01 } from '../../data/levels/alpha01.js';
import { createEnemy, updateEnemy, cleanupDeadEnemies } from '../combat/enemies.js';
import { fireWeapon, applyProjectileImpact } from '../combat/weapons.js';

const LEVEL_DEFS = {
  alpha01: LEVEL_ALPHA01
};

export const DIFFICULTY_ORDER = ['invulnerable', 'easy', 'medium', 'hard'];

export const DIFFICULTY_PRESETS = {
  invulnerable: {
    id: 'invulnerable',
    label: 'Invulnerable',
    playerDamageMultiplier: 0,
    enemyDamageMultiplier: 1,
    enemySpeedMultiplier: 1,
    enemyCooldownMultiplier: 1
  },
  easy: {
    id: 'easy',
    label: 'Easy',
    playerDamageMultiplier: 0.6,
    enemyDamageMultiplier: 0.85,
    enemySpeedMultiplier: 0.92,
    enemyCooldownMultiplier: 1.08
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    playerDamageMultiplier: 1,
    enemyDamageMultiplier: 1,
    enemySpeedMultiplier: 1,
    enemyCooldownMultiplier: 1
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    playerDamageMultiplier: 1.25,
    enemyDamageMultiplier: 1.15,
    enemySpeedMultiplier: 1.08,
    enemyCooldownMultiplier: 0.9
  }
};

function scaleDamageAmount(amount, multiplier) {
  const numericAmount = Number(amount) || 0;
  const numericMultiplier = Number(multiplier) || 0;

  if (numericAmount <= 0 || numericMultiplier <= 0) {
    return 0;
  }

  return Math.max(1, Math.round(numericAmount * numericMultiplier));
}

export function normalizeDifficultyId(value) {
  if (typeof value === 'string' && Object.prototype.hasOwnProperty.call(DIFFICULTY_PRESETS, value)) {
    return value;
  }

  if (value && typeof value === 'object' && typeof value.id === 'string') {
    return normalizeDifficultyId(value.id);
  }

  return 'invulnerable';
}

export function getDifficultyConfig(value = 'invulnerable') {
  const difficultyId = normalizeDifficultyId(value);
  return {
    ...DIFFICULTY_PRESETS[difficultyId]
  };
}

export function applyDifficultyToState(state, difficulty = 'invulnerable') {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const config = getDifficultyConfig(difficulty);
  state.difficultyId = config.id;
  state.difficulty = config;
  return config;
}

function cloneInput(input) {
  return {
    moveForward: input?.moveForward ?? 0,
    moveStrafe: input?.moveStrafe ?? 0,
    lookYaw: input?.lookYaw ?? 0,
    lookPitch: input?.lookPitch ?? 0,
    fire: !!input?.fire,
    altFire: !!input?.altFire,
    use: !!input?.use,
    sprint: !!input?.sprint,
    pause: !!input?.pause,
    weaponIndex: Number.isInteger(input?.weaponIndex) ? input.weaponIndex : null,
    nextWeapon: !!input?.nextWeapon,
    prevWeapon: !!input?.prevWeapon,
    restart: !!input?.restart
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function wrapAngle(angle) {
  let out = angle;
  while (out > Math.PI) out -= Math.PI * 2;
  while (out < -Math.PI) out += Math.PI * 2;
  return out;
}

function createPlayer(spawn) {
  return {
    x: spawn.x,
    z: spawn.z,
    yaw: spawn.yaw ?? 0,
    pitch: 0,
    eyeHeight: 1.58,
    radius: 0.3,
    walkSpeed: 3.85,
    runSpeed: 5.25,
    mouseSensitivity: 0.0022,
    health: 100,
    armor: 25,
    ammo: {
      bullet: 80,
      shell: 16,
      rocket: 4,
      cell: 40
    },
    weaponIndex: 0,
    weaponCooldownMs: 0,
    recoilMs: 0,
    recoilKick: 0,
    invulnMs: 0,
    kills: 0,
    score: 0,
    dead: false
  };
}

function createPickupList(pickups) {
  return pickups.map((pickup, index) => ({
    id: index + 1,
    kind: pickup.kind,
    ammoType: pickup.ammoType || null,
    amount: pickup.amount || 0,
    key: pickup.key || null,
    x: pickup.x,
    z: pickup.z,
    radius: pickup.radius || 0.24,
    collected: false
  }));
}

function createDecalList(decals) {
  return decals.map((decal, index) => ({
    id: decal.id || index + 1,
    kind: decal.kind || 'decal',
    x: decal.x,
    z: decal.z,
    y: Number(decal.y ?? 0) || 0,
    width: Number(decal.width ?? decal.radius * 2 ?? 0.5) || 0.5,
    height: Number(decal.height ?? 0.03) || 0.03,
    depth: Number(decal.depth ?? decal.radius * 2 ?? 0.5) || 0.5,
    radius: Number(decal.radius ?? Math.max(decal.width ?? 0.25, decal.depth ?? 0.25) * 0.5 ?? 0.25) || 0.25,
    rotation: Number(decal.rotation ?? 0) || 0,
    color: decal.color || null,
    intensity: Number(decal.intensity ?? 0) || 0,
    pulse: Number(decal.pulse ?? 0) || 0,
    alpha: Number(decal.alpha ?? 1) || 1,
    lifeMs: Number.isFinite(decal.lifeMs) ? Math.max(1, decal.lifeMs) : Infinity,
    ageMs: Number(decal.ageMs ?? 0) || 0,
    static: !Number.isFinite(decal.lifeMs)
  }));
}

function createProjectiles() {
  return [];
}

function createVisualEffects() {
  return [];
}

function spawnDecal(state, decal) {
  state.decals.push({
    id: state.nextId += 1,
    kind: decal.kind || 'impact',
    x: decal.x,
    z: decal.z,
    y: Number(decal.y ?? 0) || 0,
    width: Number(decal.width ?? decal.radius * 2 ?? 0.5) || 0.5,
    height: Number(decal.height ?? 0.03) || 0.03,
    depth: Number(decal.depth ?? decal.radius * 2 ?? 0.5) || 0.5,
    radius: Number(decal.radius ?? 0.25) || 0.25,
    rotation: Number(decal.rotation ?? 0) || 0,
    color: decal.color || null,
    intensity: Number(decal.intensity ?? 0) || 0,
    pulse: Number(decal.pulse ?? 0) || 0,
    alpha: Number(decal.alpha ?? 1) || 1,
    lifeMs: Number.isFinite(decal.lifeMs) ? Math.max(1, decal.lifeMs) : Infinity,
    ageMs: 0,
    static: !Number.isFinite(decal.lifeMs)
  });
}

function spawnParticleBurst(state, burst) {
  const count = Math.max(1, burst.count || 4);
  const spread = Number(burst.spread ?? 0.35) || 0.35;
  const speed = Number(burst.speed ?? 0.9) || 0.9;
  const lifeMs = Math.max(80, Number(burst.lifeMs ?? 260) || 260);
  const baseRadius = Number(burst.radius ?? 0.06) || 0.06;
  const baseHeight = Number(burst.height ?? 0.06) || 0.06;
  const color = burst.color || null;
  const rng = state.rng.fork(`fx:${state.tick}:${state.nextId}:${burst.kind || 'spark'}`);

  for (let index = 0; index < count; index += 1) {
    const angle = rng.nextFloat() * Math.PI * 2;
    const distance = rng.nextFloat() * spread;
    state.effects.push({
      id: state.nextId += 1,
      kind: burst.kind || 'spark',
      x: burst.x + Math.cos(angle) * distance,
      z: burst.z + Math.sin(angle) * distance,
      y: Number(burst.y ?? 0) + rng.nextFloat() * baseHeight,
      vx: Math.cos(angle) * speed * (0.45 + rng.nextFloat() * 0.55),
      vy: (0.25 + rng.nextFloat() * 0.65) * (burst.upward ?? 1),
      vz: Math.sin(angle) * speed * (0.45 + rng.nextFloat() * 0.55),
      radius: baseRadius * (0.7 + rng.nextFloat() * 0.8),
      color,
      alpha: Number(burst.alpha ?? 1) || 1,
      lifeMs,
      ageMs: 0
    });
  }
}

function processVisualEvents(state) {
  for (const event of state.events) {
    if (event.type === 'projectileImpact' || event.type === 'hitscanImpact') {
      const radius = Math.max(0.12, Number(event.radius ?? 0.18) || 0.18);
      const color = event.color || (event.impactKind === 'splash' ? '#ffb35d' : '#fff0be');
      spawnDecal(state, {
        kind: event.impactKind === 'splash' ? 'splash' : 'impact',
        x: event.x,
        z: event.z,
        y: 0.01,
        width: radius * 2.2,
        height: 0.025,
        depth: radius * 1.8,
        radius,
        rotation: state.rng.fork(`decal:${state.tick}:${state.nextId}`).nextFloat() * Math.PI * 2,
        color,
        alpha: 0.72,
        lifeMs: event.impactKind === 'splash' ? 7000 : 4800
      });
      spawnParticleBurst(state, {
        kind: event.impactKind === 'splash' ? 'splashSpark' : 'impactSpark',
        x: event.x,
        z: event.z,
        y: 0.10,
        color,
        count: event.impactKind === 'splash' ? 7 : 4,
        spread: event.impactKind === 'splash' ? 0.55 : 0.28,
        speed: event.impactKind === 'splash' ? 1.1 : 0.7,
        lifeMs: event.impactKind === 'splash' ? 320 : 220,
        radius: event.impactKind === 'splash' ? 0.07 : 0.05,
        height: 0.10
      });
      continue;
    }

    if (event.type === 'hitEnemy') {
      const enemy = state.enemies.find((item) => item.id === event.enemyId);
      if (enemy) {
        spawnParticleBurst(state, {
          kind: 'bloodSpark',
          x: enemy.x,
          z: enemy.z,
          y: 0.1,
          color: enemy.def?.color || '#ff7a7a',
          count: 5,
          spread: 0.18,
          speed: 0.5,
          lifeMs: 260,
          radius: 0.05,
          height: 0.08
        });
      }
      continue;
    }

    if (event.type === 'playerDamaged') {
      spawnParticleBurst(state, {
        kind: 'painSpark',
        x: state.player.x,
        z: state.player.z,
        y: 0.28,
        color: '#ff6c6c',
        count: 4,
        spread: 0.22,
        speed: 0.5,
        lifeMs: 240,
        radius: 0.05,
        height: 0.07
      });
      continue;
    }

    if (event.type === 'enemyDied') {
      const enemy = state.enemies.find((item) => item.id === event.enemyId);
      if (enemy) {
        spawnDecal(state, {
          kind: 'corpseMark',
          x: enemy.x,
          z: enemy.z,
          y: 0.01,
          width: Math.max(0.28, enemy.radius * 1.6),
          height: 0.022,
          depth: Math.max(0.28, enemy.radius * 1.6),
          radius: Math.max(0.2, enemy.radius * 0.8),
          rotation: state.rng.fork(`corpse:${state.tick}:${state.nextId}`).nextFloat() * Math.PI * 2,
          color: enemy.def?.color || '#4b2c2c',
          alpha: 0.72,
          lifeMs: 14000
        });
        spawnParticleBurst(state, {
          kind: 'deathSpark',
          x: enemy.x,
          z: enemy.z,
          y: 0.12,
          color: enemy.def?.color || '#cc7a7a',
          count: 8,
          spread: 0.34,
          speed: 0.95,
          lifeMs: 360,
          radius: 0.06,
          height: 0.12
        });
      }
    }
  }
}

function updateVisualEffects(state, dtMs) {
  const dt = dtMs / 1000;

  const survivingEffects = [];
  for (const effect of state.effects) {
    effect.ageMs += dtMs;
    if (effect.ageMs >= effect.lifeMs) {
      continue;
    }

    effect.x += effect.vx * dt;
    effect.y += effect.vy * dt;
    effect.z += effect.vz * dt;
    effect.vx *= 0.94;
    effect.vy -= 0.45 * dt;
    effect.vz *= 0.94;
    survivingEffects.push(effect);
  }
  state.effects = survivingEffects;

  const survivingDecals = [];
  for (const decal of state.decals) {
    if (decal.static) {
      survivingDecals.push(decal);
      continue;
    }

    decal.ageMs += dtMs;
    if (decal.ageMs < decal.lifeMs) {
      survivingDecals.push(decal);
    }
  }
  state.decals = survivingDecals;
}

function createEnemies(state, level) {
  return level.enemySpawns.map((spawn, index) => {
    const enemy = createEnemy(spawn.kind, spawn.x, spawn.z, {
      id: index + 1
    });
    enemy.seedTag = `enemy:${spawn.kind}:${index}`;
    return enemy;
  });
}

function snapshotInput(input) {
  return {
    moveForward: input.moveForward,
    moveStrafe: input.moveStrafe,
    lookYaw: input.lookYaw,
    lookPitch: input.lookPitch,
    fire: input.fire,
    altFire: input.altFire,
    use: input.use,
    sprint: input.sprint,
    weaponIndex: input.weaponIndex,
    nextWeapon: input.nextWeapon,
    prevWeapon: input.prevWeapon,
    restart: input.restart
  };
}

function applyPlayerDamage(state, amount, source) {
  if (state.player.dead || amount <= 0) {
    return 0;
  }

  const player = state.player;
  const difficulty = state.difficulty || DIFFICULTY_PRESETS.invulnerable;
  const scaledAmount = scaleDamageAmount(amount, difficulty.playerDamageMultiplier);

  if (scaledAmount <= 0) {
    return 0;
  }

  if (player.invulnMs > 0) {
    return 0;
  }

  let remaining = scaledAmount;
  let armorBlocked = 0;

  if (player.armor > 0) {
    armorBlocked = Math.min(player.armor, Math.ceil(remaining * 0.6));
    player.armor -= armorBlocked;
    remaining -= armorBlocked;
  }

  player.health -= remaining;
  player.invulnMs = 120;
  state.events.push({
    type: 'playerDamaged',
    source,
    amount: scaledAmount,
    absorbed: armorBlocked,
    remaining
  });
  state.replayPush({
    type: 'playerDamaged',
    data: { source, amount: scaledAmount, absorbed: armorBlocked, remaining }
  });

  if (player.health <= 0) {
    player.health = 0;
    player.dead = true;
    state.events.push({ type: 'playerDied', source });
    state.replayPush({ type: 'playerDied', data: { source } });
  }

  return remaining;
}

function applyPickup(state, pickup) {
  const player = state.player;

  if (pickup.kind === 'health') {
    player.health = clamp(player.health + pickup.amount, 0, 200);
  } else if (pickup.kind === 'armor') {
    player.armor = clamp(player.armor + pickup.amount, 0, 200);
  } else if (pickup.kind === 'ammo') {
    player.ammo[pickup.ammoType] = (player.ammo[pickup.ammoType] || 0) + pickup.amount;
  }

  state.events.push({
    type: 'pickupCollected',
    kind: pickup.kind,
    amount: pickup.amount,
    ammoType: pickup.ammoType || null
  });
  state.replayPush({
    type: 'pickupCollected',
    data: { kind: pickup.kind, amount: pickup.amount, ammoType: pickup.ammoType || null }
  });
}

function collectPickups(state) {
  for (const pickup of state.pickups) {
    if (pickup.collected) {
      continue;
    }

    if (distance2d(state.player.x, state.player.z, pickup.x, pickup.z) <= state.player.radius + pickup.radius) {
      pickup.collected = true;
      applyPickup(state, pickup);
    }
  }
}

function updateProjectiles(state, dtMs) {
  const dt = dtMs / 1000;
  const survivors = [];

  for (const projectile of state.projectiles) {
    projectile.ageMs += dtMs;
    projectile.prevX = projectile.x;
    projectile.prevZ = projectile.z;
    projectile.x += projectile.vx * dt;
    projectile.z += projectile.vz * dt;

    if (projectile.ageMs >= projectile.lifeMs) {
      if (projectile.splashRadius > 0) {
        applyProjectileImpact(state, projectile);
      }
      continue;
    }

    const wallDistance = Math.hypot(projectile.x - projectile.prevX, projectile.z - projectile.prevZ);
    const rayBlocked = state.level ? !hasLineOfSight(state.level, projectile.prevX, projectile.prevZ, projectile.x, projectile.z, wallDistance + 0.01) : false;

    if (rayBlocked) {
      if (projectile.splashRadius > 0) {
        applyProjectileImpact(state, projectile);
      }
      continue;
    }

    let hitSomething = false;
    if (projectile.owner === 'player') {
      for (const enemy of state.enemies) {
        if (enemy.dead) {
          continue;
        }

        if (distance2d(projectile.x, projectile.z, enemy.x, enemy.z) <= projectile.radius + enemy.radius) {
          applyProjectileImpact(state, projectile);
          hitSomething = true;
          break;
        }
      }
    } else {
      if (distance2d(projectile.x, projectile.z, state.player.x, state.player.z) <= projectile.radius + state.player.radius) {
        state.damagePlayer(projectile.damage, projectile.kind);
        hitSomething = true;
      }
    }

    if (!hitSomething) {
      survivors.push(projectile);
    }
  }

  state.projectiles = survivors;
}

function updateEnemyList(state, dtMs) {
  const survivors = [];
  for (const enemy of state.enemies) {
    const keep = updateEnemy(state, enemy, dtMs);
    if (keep) {
      survivors.push(enemy);
    }
  }
  state.enemies = survivors;
  cleanupDeadEnemies(state);
}

function updatePlayerMovement(state, input, dtMs) {
  const dt = dtMs / 1000;
  const player = state.player;
  const turnScale = player.mouseSensitivity;
  player.yaw = wrapAngle(player.yaw + input.lookYaw * turnScale);
  player.pitch = clamp(player.pitch + input.lookPitch * turnScale, -1.15, 1.15);

  const speed = input.sprint ? player.runSpeed : player.walkSpeed;
  const forward = input.moveForward || 0;
  const strafe = input.moveStrafe || 0;
  const cos = Math.cos(player.yaw);
  const sin = Math.sin(player.yaw);
  const moveX = (cos * forward - sin * strafe) * speed * dt;
  const moveZ = (sin * forward + cos * strafe) * speed * dt;
  const moved = moveCircle(state.level, player.x, player.z, player.radius, moveX, moveZ);
  player.x = moved.x;
  player.z = moved.z;

  if (player.invulnMs > 0) {
    player.invulnMs = Math.max(0, player.invulnMs - dtMs);
  }
  if (player.weaponCooldownMs > 0) {
    player.weaponCooldownMs = Math.max(0, player.weaponCooldownMs - dtMs);
  }
  if (player.recoilMs > 0) {
    player.recoilMs = Math.max(0, player.recoilMs - dtMs);
    player.recoilKick *= 0.88;
  } else {
    player.recoilKick *= 0.75;
  }
}

function updateWeaponSelection(state, input) {
  const player = state.player;
  if (input.weaponIndex !== null && input.weaponIndex >= 0 && input.weaponIndex < WEAPON_ORDER.length) {
    player.weaponIndex = input.weaponIndex;
  } else if (input.nextWeapon) {
    player.weaponIndex = (player.weaponIndex + 1) % WEAPON_ORDER.length;
  } else if (input.prevWeapon) {
    player.weaponIndex = (player.weaponIndex + WEAPON_ORDER.length - 1) % WEAPON_ORDER.length;
  }
}

function currentWeaponId(player) {
  return WEAPON_ORDER[player.weaponIndex] || WEAPON_ORDER[0];
}

function updateWeapons(state, input) {
  updateWeaponSelection(state, input);
  const weaponId = currentWeaponId(state.player);

  if (input.fire) {
    fireWeapon(state, weaponId, state.rng);
  }
}

function handleUseInteraction(state, input) {
  if (!input.use) {
    return false;
  }

  const useRange = Math.max(0.9, state.player.radius + 0.55);
  const doorHit = findDoorNearPoint(state.level, state.player.x, state.player.z, useRange);
  if (!doorHit) {
    return false;
  }

  const openedDoor = openDoor(state.level, doorHit.door.id);
  if (!openedDoor) {
    return false;
  }

  state.events.push({
    type: 'doorOpened',
    doorId: openedDoor.id,
    sectorId: doorHit.edgeRef.sectorId,
    edgeIndex: doorHit.edgeRef.edgeIndex
  });
  state.replayPush({
    type: 'doorOpened',
    data: {
      doorId: openedDoor.id,
      sectorId: doorHit.edgeRef.sectorId,
      edgeIndex: doorHit.edgeRef.edgeIndex
    }
  });
  return true;
}

function checkExitCompletion(state) {
  if (state.completed || state.player.dead) {
    return;
  }

  if (state.enemies.length > 0) {
    return;
  }

  if (!state.level.exit) {
    state.completed = true;
    return;
  }

  const distance = distance2d(state.player.x, state.player.z, state.level.exit.x, state.level.exit.z);
  if (distance <= state.player.radius + 0.3) {
    state.completed = true;
    state.events.push({ type: 'levelCompleted', levelId: state.level.id });
    state.replayPush({
      type: 'levelCompleted',
      data: { levelId: state.level.id }
    });
  }
}

export function createGameState(options = {}) {
  const seed = normalizeSeed(options.seed ?? 0xC0FFEE01);
  const requestedLevelId = options.levelId || 'alpha01';
  const levelDef = options.levelDefinition || LEVEL_DEFS[requestedLevelId] || LEVEL_ALPHA01;
  const levelId = options.levelId || levelDef.id || 'level';
  const level = parseLevelDefinition(levelDef);
  const rng = createSeededRng(seed);
  const difficulty = getDifficultyConfig(options.difficulty ?? 'invulnerable');
  const replay = createReplayCapture({
    seed,
    fixedStepMs: options.fixedStepMs ?? 16,
    meta: {
      levelId,
      levelName: level.name,
      difficulty: difficulty.id
    }
  });

  const state = {
    seed,
    levelId,
    level,
    rng,
    replay,
    timeMs: 0,
    tick: 0,
    nextId: 0,
    completed: false,
    paused: false,
    events: [],
    decals: createDecalList(level.decals || []),
    effects: createVisualEffects(),
    projectiles: createProjectiles(),
    pickups: createPickupList(level.pickups),
    enemies: [],
    player: createPlayer(level.spawn),
    requestRestart: false,
    damagePlayer(amount, source) {
      return applyPlayerDamage(state, amount, source);
    },
    replayPush(event) {
      appendReplayEvent(replay, {
        t: state.timeMs,
        type: event.type,
        data: event.data
      });
    }
  };

  applyDifficultyToState(state, difficulty);
  state.enemies = createEnemies(state, level);
  state.events.push({
    type: 'levelLoaded',
    levelId,
    enemyCount: state.enemies.length,
    doorCount: Array.isArray(level.doors) ? level.doors.length : 0
  });
  state.replayPush({
    type: 'levelLoaded',
    data: {
      levelId,
      enemyCount: state.enemies.length,
      doorCount: Array.isArray(level.doors) ? level.doors.length : 0
    }
  });
  return state;
}

export function advanceGameState(state, input, dtMs) {
  const normalizedInput = cloneInput(input);
  state.timeMs += dtMs;
  state.tick += 1;
  state.events.length = 0;
  state.replayPush({
    type: 'input',
    data: snapshotInput(normalizedInput)
  });

  if (normalizedInput.restart) {
    state.requestRestart = true;
    state.events.push({ type: 'restartRequested' });
    state.replayPush({ type: 'restartRequested', data: {} });
    return state;
  }

  if (normalizedInput.pause) {
    state.paused = !state.paused;
    state.events.push({ type: state.paused ? 'gamePaused' : 'gameResumed' });
    state.replayPush({
      type: state.paused ? 'gamePaused' : 'gameResumed',
      data: { paused: state.paused }
    });
    return state;
  }

  if (state.player.dead || state.completed || state.paused) {
    return state;
  }

  handleUseInteraction(state, normalizedInput);
  updatePlayerMovement(state, normalizedInput, dtMs);
  updateWeapons(state, normalizedInput);
  updateProjectiles(state, dtMs);
  updateEnemyList(state, dtMs);
  collectPickups(state);
  checkExitCompletion(state);
  processVisualEvents(state);
  updateVisualEffects(state, dtMs);
  return state;
}

export function getCurrentWeapon(state) {
  return getWeaponDef(currentWeaponId(state.player));
}
