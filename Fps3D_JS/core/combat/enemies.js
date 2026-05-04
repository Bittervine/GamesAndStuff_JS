import { getEnemyDef } from '../../data/enemies.js';
import { createProjectile, damageEnemy } from './weapons.js';
import { hasLineOfSight, normalize2d } from '../world/raycast.js';
import { moveEntity } from '../world/collision.js';

function scaleDamageAmount(amount, multiplier) {
  const numericAmount = Number(amount) || 0;
  const numericMultiplier = Number(multiplier) || 0;

  if (numericAmount <= 0 || numericMultiplier <= 0) {
    return 0;
  }

  return Math.max(1, Math.round(numericAmount * numericMultiplier));
}

function spawnDrop(state, enemy) {
  const rng = state.rng.fork(`drop:${enemy.kind}:${enemy.id}`);
  if (rng.nextFloat() > (enemy.def.dropChance ?? 0)) {
    return;
  }

  const pickupKind = rng.pick(['health', 'armor', 'ammo']);
  let pickup = null;

  if (pickupKind === 'health') {
    pickup = { kind: 'health', amount: 25, x: enemy.x, z: enemy.z, radius: 0.28 };
  } else if (pickupKind === 'armor') {
    pickup = { kind: 'armor', amount: 25, x: enemy.x, z: enemy.z, radius: 0.28 };
  } else {
    const ammoType = rng.pick(['bullet', 'shell', 'rocket', 'cell']);
    const amount = ammoType === 'bullet' ? 20 : ammoType === 'shell' ? 4 : ammoType === 'rocket' ? 2 : 12;
    pickup = { kind: 'ammo', ammoType, amount, x: enemy.x, z: enemy.z, radius: 0.24 };
  }

  state.pickups.push(pickup);
  state.events.push({
    type: 'pickupSpawn',
    kind: pickup.kind,
    x: pickup.x,
    z: pickup.z
  });
  state.replayPush({
    type: 'pickupSpawn',
    data: { kind: pickup.kind, x: pickup.x, z: pickup.z }
  });
}

export function createEnemy(kind, x, z, options = {}) {
  const def = getEnemyDef(kind);
  return {
    id: options.id ?? 0,
    kind,
    def,
    x,
    z,
    vx: 0,
    vz: 0,
    radius: def.radius,
    height: def.height,
    hp: options.hp ?? def.hp,
    dead: false,
    dyingMs: 0,
    hitFlashMs: 0,
    facing: options.facing ?? 0,
    cooldownMs: options.cooldownMs ?? 0,
    aggroMs: 0,
    bobPhase: 0,
    attackWindupMs: 0,
    attackWindupTotalMs: 0
  };
}

export function damageEnemyDirect(state, enemy, amount, reason = 'direct') {
  return damageEnemy(state, enemy, amount, reason);
}

function attackPlayer(state, enemy, damage, reason) {
  const difficulty = state.difficulty || {};
  const scaledDamage = scaleDamageAmount(damage, difficulty.enemyDamageMultiplier ?? 1);
  state.damagePlayer(scaledDamage, reason);
  state.events.push({
    type: 'playerHit',
    source: enemy.kind,
    damage: scaledDamage
  });
  state.replayPush({
    type: 'playerHit',
    data: { source: enemy.kind, damage: scaledDamage }
  });
}

function getAttackWindupMs(def) {
  if (!def || typeof def !== 'object') {
    return 0;
  }

  if (Number.isFinite(def.attackWindupMs)) {
    return Math.max(0, def.attackWindupMs);
  }

  if (def.behavior === 'hitscan') {
    return 120;
  }
  if (def.behavior === 'projectile') {
    return 200;
  }
  if (def.behavior === 'boss') {
    return 240;
  }
  return 0;
}

function performEnemyAttack(state, enemy, damageMultiplier) {
  const def = enemy.def;
  const player = state.player;
  const dx = player.x - enemy.x;
  const dz = player.z - enemy.z;
  const dist = Math.hypot(dx, dz);

  if (def.behavior === 'melee') {
    if (dist <= def.attackRange) {
      attackPlayer(state, enemy, def.damage, def.id);
      return true;
    }
    return false;
  }

  if (def.behavior === 'hitscan') {
    if (dist <= def.attackRange) {
      attackPlayer(state, enemy, def.damage, def.id);
      return true;
    }
    return false;
  }

  if (def.behavior === 'projectile' || def.behavior === 'boss') {
    if (dist <= def.attackRange) {
      const direction = normalize2d(dx, dz);
      createProjectile(state, enemy.kind, `${enemy.kind}-shot`, enemy.x, enemy.z, direction.x, direction.z, {
        speed: def.projectileSpeed,
        radius: def.projectileRadius ?? 0.1,
        damage: scaleDamageAmount(def.damage, damageMultiplier),
        splashRadius: def.behavior === 'boss' ? 2.2 : 0.3,
        lifeMs: def.behavior === 'boss' ? 4200 : 3400,
        color: def.color
      });
      return true;
    }
    return false;
  }

  return false;
}

function beginEnemyAttack(enemy, def) {
  const windupMs = getAttackWindupMs(def);
  enemy.attackWindupMs = windupMs;
  enemy.attackWindupTotalMs = windupMs;
}

export function updateEnemy(state, enemy, dtMs) {
  const dt = dtMs / 1000;
  const def = enemy.def;
  const difficulty = state.difficulty || {};
  const speedMultiplier = difficulty.enemySpeedMultiplier ?? 1;
  const cooldownMultiplier = difficulty.enemyCooldownMultiplier ?? 1;
  const damageMultiplier = difficulty.enemyDamageMultiplier ?? 1;
  enemy.hitFlashMs = Math.max(0, enemy.hitFlashMs - dtMs);

  if (enemy.dead) {
    enemy.dyingMs -= dtMs;
    return true;
  }

  if (enemy.cooldownMs > 0) {
    enemy.cooldownMs = Math.max(0, enemy.cooldownMs - dtMs);
  }

  const player = state.player;
  const dx = player.x - enemy.x;
  const dz = player.z - enemy.z;
  const dist = Math.hypot(dx, dz);
  const seesPlayer = dist <= def.visionRange && hasLineOfSight(state.level, enemy.x, enemy.z, player.x, player.z, def.visionRange);
  enemy.facing = Math.atan2(dz, dx);
  enemy.aggroMs = seesPlayer ? 1200 : Math.max(0, enemy.aggroMs - dtMs);

  const shouldChase = seesPlayer || enemy.aggroMs > 0 || dist < def.attackRange * 1.5;
  const bobRate = shouldChase ? 0.012 : 0.0065;
  enemy.bobPhase = (enemy.bobPhase + dtMs * bobRate) % 100000;

  if (enemy.attackWindupMs > 0) {
    enemy.attackWindupMs = Math.max(0, enemy.attackWindupMs - dtMs);
    if (enemy.attackWindupMs === 0) {
      const attacked = performEnemyAttack(state, enemy, damageMultiplier);
      enemy.attackWindupTotalMs = 0;
      if (attacked) {
        enemy.cooldownMs = def.attackCooldownMs * cooldownMultiplier;
      }
    }
    return true;
  }

  const canWindupAttack = (def.behavior === 'hitscan' || def.behavior === 'projectile' || def.behavior === 'boss')
    && dist <= def.attackRange
    && seesPlayer
    && enemy.cooldownMs <= 0;

  if (canWindupAttack) {
    beginEnemyAttack(enemy, def);
    if (enemy.attackWindupMs <= 0) {
      const attacked = performEnemyAttack(state, enemy, damageMultiplier);
      enemy.attackWindupTotalMs = 0;
      if (attacked) {
        enemy.cooldownMs = def.attackCooldownMs * cooldownMultiplier;
      }
    }
    return true;
  }

  if (shouldChase && dist > def.attackRange * 0.72) {
    const dir = normalize2d(dx, dz);
    moveEntity(
      state.level,
      enemy,
      dir.x * def.speed * speedMultiplier * dt,
      dir.z * def.speed * speedMultiplier * dt
    );
  }

  if (!seesPlayer && dist > def.attackRange * 2.25) {
    return true;
  }

  if (def.behavior === 'melee') {
    if (dist <= def.attackRange && enemy.cooldownMs <= 0) {
      attackPlayer(state, enemy, def.damage, def.id);
      enemy.cooldownMs = def.attackCooldownMs * cooldownMultiplier;
    }
    return true;
  }

  return true;
}

export function cleanupDeadEnemies(state) {
  const survivors = [];
  for (const enemy of state.enemies) {
    if (enemy.dead && enemy.dyingMs <= 0) {
      spawnDrop(state, enemy);
      continue;
    }
    survivors.push(enemy);
  }
  state.enemies = survivors;
}
