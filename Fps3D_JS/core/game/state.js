import { createSeededRng, deriveSeed, normalizeSeed } from '../random/seededRng.js';
import { createReplayCapture, appendReplayEvent } from '../replay/replayCodec.js';
import { parseLevelDefinition } from '../world/level.js';
import { moveCircle } from '../world/collision.js';
import { distance2d, hasLineOfSight } from '../world/raycast.js';
import { WEAPON_ORDER, getWeaponDef } from '../../data/weapons.js';
import { LEVEL_ALPHA01 } from '../../data/levels/alpha01.js';
import { createEnemy, updateEnemy, cleanupDeadEnemies } from '../combat/enemies.js';
import { fireWeapon, applyProjectileImpact } from '../combat/weapons.js';

const LEVEL_DEFS = {
  alpha01: LEVEL_ALPHA01
};

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
    prevWeapon: !!input?.prevWeapon
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

function createProjectiles() {
  return [];
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
    prevWeapon: input.prevWeapon
  };
}

function applyPlayerDamage(state, amount, source) {
  if (state.player.dead || amount <= 0) {
    return 0;
  }

  const player = state.player;
  if (player.invulnMs > 0) {
    return 0;
  }

  let remaining = amount;
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
    amount,
    absorbed: armorBlocked,
    remaining
  });
  state.replayPush({
    type: 'playerDamaged',
    data: { source, amount, absorbed: armorBlocked, remaining }
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
  const levelId = options.levelId || 'alpha01';
  const levelDef = LEVEL_DEFS[levelId] || LEVEL_ALPHA01;
  const level = parseLevelDefinition(levelDef);
  const rng = createSeededRng(seed);
  const replay = createReplayCapture({
    seed,
    fixedStepMs: options.fixedStepMs ?? 16,
    meta: {
      levelId,
      levelName: level.name,
      difficulty: options.difficulty || 'normal'
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

  state.enemies = createEnemies(state, level);
  state.events.push({
    type: 'levelLoaded',
    levelId,
    enemyCount: state.enemies.length
  });
  state.replayPush({
    type: 'levelLoaded',
    data: { levelId, enemyCount: state.enemies.length }
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

  updatePlayerMovement(state, normalizedInput, dtMs);
  updateWeapons(state, normalizedInput);
  updateProjectiles(state, dtMs);
  updateEnemyList(state, dtMs);
  collectPickups(state);
  checkExitCompletion(state);
  return state;
}

export function getCurrentWeapon(state) {
  return getWeaponDef(currentWeaponId(state.player));
}
