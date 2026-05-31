import { getWeaponDef } from '../../data/weapons.js';
import { castGridRay, intersectRayCircle, normalize2d } from '../world/raycast.js';

function toRadiansFromYaw(yaw, offset) {
  return yaw + offset;
}

function weaponOrigin(player) {
  return {
    x: player.x,
    z: player.z
  };
}

function applyEnemyDamage(state, enemy, damage, reason, impulse = null) {
  if (!enemy || enemy.dead) {
    return false;
  }

  enemy.hp -= damage;
  enemy.hitFlashMs = Math.max(Number(enemy.hitFlashMs) || 0, Math.min(180, 90 + damage * 3));
  enemy.stunMs = Math.max(Number(enemy.stunMs) || 0, Math.min(260, 60 + damage * 3));
  enemy.attackWindupMs = 0;
  enemy.behaviorState = 'stunned';

  const impulseX = Number.isFinite(impulse?.x) ? impulse.x : enemy.x - state.player.x;
  const impulseZ = Number.isFinite(impulse?.z) ? impulse.z : enemy.z - state.player.z;
  const impulseLength = Math.hypot(impulseX, impulseZ) || 1;
  const knockback = Math.max(0.08, Math.min(0.62, 0.05 + damage * 0.012));
  enemy.knockbackX = (Number(enemy.knockbackX) || 0) + (impulseX / impulseLength) * knockback;
  enemy.knockbackZ = (Number(enemy.knockbackZ) || 0) + (impulseZ / impulseLength) * knockback;
  state.events.push({
    type: 'hitEnemy',
    enemyId: enemy.id,
    kind: enemy.kind,
    damage,
    reason
  });
  state.replayPush({
    type: 'hitEnemy',
    data: { enemyId: enemy.id, kind: enemy.kind, damage, reason }
  });
  state.tracePush?.({
    type: 'hitEnemy',
    data: { enemyId: enemy.id, kind: enemy.kind, damage, reason }
  });
  state.player.hitConfirmMs = Math.max(Number(state.player.hitConfirmMs) || 0, enemy.hp <= 0 ? 180 : 120);

  if (enemy.hp <= 0 && !enemy.dead) {
    enemy.dead = true;
    enemy.dyingMs = 600;
    enemy.stunMs = 0;
    enemy.knockbackX = 0;
    enemy.knockbackZ = 0;
    enemy.behaviorState = 'dead';
    state.player.kills += 1;
    state.events.push({
      type: 'enemyDied',
      enemyId: enemy.id,
      kind: enemy.kind
    });
    state.replayPush({
      type: 'enemyDied',
      data: { enemyId: enemy.id, kind: enemy.kind }
    });
    state.tracePush?.({
      type: 'enemyDied',
      data: { enemyId: enemy.id, kind: enemy.kind }
    });
    state.player.hitConfirmMs = Math.max(Number(state.player.hitConfirmMs) || 0, 180);
  }

  return true;
}

function pushImpactEvent(state, impact) {
  state.events.push({
    type: 'projectileImpact',
    ...impact
  });
  state.replayPush({
    type: 'projectileImpact',
    data: impact
  });
  state.tracePush?.({
    type: 'projectileImpact',
    data: impact
  });
}

function spawnProjectile(state, owner, kind, originX, originZ, dirX, dirZ, options) {
  const projectile = {
    id: state.nextId += 1,
    owner,
    kind,
    x: originX,
    z: originZ,
    prevX: originX,
    prevZ: originZ,
    vx: dirX * options.speed,
    vz: dirZ * options.speed,
    radius: options.radius,
    damage: options.damage,
    splashRadius: options.splashRadius,
    lifeMs: options.lifeMs,
    ageMs: 0,
    color: options.color
  };
  state.projectiles.push(projectile);
  state.events.push({
    type: 'projectileSpawn',
    owner,
    kind,
    x: originX,
    z: originZ
  });
  state.replayPush({
    type: 'projectileSpawn',
    data: { owner, kind, x: originX, z: originZ }
  });
  state.tracePush?.({
    type: 'projectileSpawn',
    data: { owner, kind, x: originX, z: originZ }
  });
  return projectile;
}

function applySplashDamage(state, centerX, centerZ, splashRadius, damage, owner) {
  for (const enemy of state.enemies) {
    if (enemy.dead) {
      continue;
    }

    const distance = Math.hypot(enemy.x - centerX, enemy.z - centerZ);
    if (distance > splashRadius + enemy.radius) {
      continue;
    }

    const falloff = 1 - Math.min(1, distance / Math.max(0.001, splashRadius));
    applyEnemyDamage(
      state,
      enemy,
      Math.max(1, Math.round(damage * falloff)),
      owner,
      { x: enemy.x - centerX, z: enemy.z - centerZ }
    );
  }

  const playerDistance = Math.hypot(state.player.x - centerX, state.player.z - centerZ);
  if (playerDistance <= splashRadius + state.player.radius) {
    const falloff = 1 - Math.min(1, playerDistance / Math.max(0.001, splashRadius));
    state.damagePlayer(Math.max(1, Math.round(damage * falloff)), owner);
  }
}

function tryHitscanShot(state, weapon, pelletIndex, rng) {
  const player = state.player;
  const level = state.level;
  const origin = weaponOrigin(player);
  const spread = (rng.nextFloat() * 2 - 1) * weapon.spread;
  const angle = toRadiansFromYaw(player.yaw, spread);
  const dir = normalize2d(Math.cos(angle), Math.sin(angle));
  const wallRay = castGridRay(level, origin.x, origin.z, dir.x, dir.z, weapon.range);
  let bestDistance = wallRay.hit ? wallRay.distance : weapon.range;
  let bestEnemy = null;

  for (const enemy of state.enemies) {
    if (enemy.dead) {
      continue;
    }

    const hitDistance = intersectRayCircle(origin.x, origin.z, dir.x, dir.z, enemy.x, enemy.z, enemy.radius, bestDistance);
    if (hitDistance !== null && hitDistance < bestDistance) {
      bestDistance = hitDistance;
      bestEnemy = enemy;
    }
  }

  if (bestEnemy) {
    const damage = weapon.damage;
    applyEnemyDamage(state, bestEnemy, damage, weapon.id, dir);
    state.events.push({
      type: 'hitscanImpact',
      x: origin.x + dir.x * bestDistance,
      z: origin.z + dir.z * bestDistance,
      radius: weapon.projectileRadius || 0.08,
      color: weapon.color || null,
      impactKind: 'direct'
    });
    state.replayPush({
      type: 'hitscanImpact',
      data: {
        x: origin.x + dir.x * bestDistance,
        z: origin.z + dir.z * bestDistance,
        radius: weapon.projectileRadius || 0.08,
        color: weapon.color || null,
        impactKind: 'direct'
      }
    });
    return {
      hit: true,
      kind: bestEnemy.kind,
      distance: bestDistance,
      pelletIndex
    };
  }

  if (wallRay.hit) {
    state.events.push({
      type: 'hitscanImpact',
      x: wallRay.pointX,
      z: wallRay.pointZ,
      radius: weapon.projectileRadius || 0.08,
      color: weapon.color || null,
      impactKind: 'wall'
    });
    state.replayPush({
      type: 'hitscanImpact',
      data: {
        x: wallRay.pointX,
        z: wallRay.pointZ,
        radius: weapon.projectileRadius || 0.08,
        color: weapon.color || null,
        impactKind: 'wall'
      }
    });
  }

  return {
    hit: false,
    distance: bestDistance,
    pelletIndex
  };
}

function spendAmmo(player, weapon, ammoCost = weapon.ammoCost) {
  const ammoType = weapon.ammoType;
  if (!ammoType) {
    return true;
  }

  if ((player.ammo[ammoType] || 0) < ammoCost) {
    return false;
  }

  player.ammo[ammoType] -= ammoCost;
  return true;
}

export function canFireWeapon(player, weaponId, options = {}) {
  const weapon = getWeaponDef(weaponId);
  const altFire = !!options.altFire && !!weapon.altFire;
  const ammoCost = Number((altFire ? weapon.altFire?.ammoCost : weapon.ammoCost) ?? weapon.ammoCost) || weapon.ammoCost;
  return player.weaponCooldownMs <= 0 && (!weapon.ammoType || (player.ammo[weapon.ammoType] || 0) >= ammoCost);
}

export function fireWeapon(state, weaponId, rng = state.rng, options = {}) {
  const player = state.player;
  const weapon = getWeaponDef(weaponId);
  const altFire = !!options.altFire && !!weapon.altFire;
  const mode = altFire ? weapon.altFire : null;
  const ammoCost = Number(mode?.ammoCost ?? weapon.ammoCost) || weapon.ammoCost;
  const fireDelayMs = Number(mode?.fireDelayMs ?? weapon.fireDelayMs) || weapon.fireDelayMs;
  const recoil = Number(mode?.recoil ?? weapon.recoil) || weapon.recoil;
  const muzzleFlashMs = altFire ? 84 : 72;

  if (!canFireWeapon(player, weaponId, { altFire })) {
    return false;
  }

  if (!spendAmmo(player, weapon, ammoCost)) {
    return false;
  }

  player.weaponCooldownMs = fireDelayMs;
  player.recoilMs = Math.max(player.recoilMs, altFire ? 110 : 90);
  player.recoilKick += recoil;
  player.muzzleFlashMs = Math.max(Number(player.muzzleFlashMs) || 0, muzzleFlashMs);
  state.events.push({
    type: 'fireWeapon',
    weaponId,
    altFire
  });
  state.replayPush({
    type: 'fireWeapon',
    data: { weaponId, altFire }
  });
  state.tracePush?.({
    type: 'fireWeapon',
    data: { weaponId, altFire }
  });

  if (weapon.type === 'hitscan') {
    const pellets = weapon.pellets || 1;
    const pelletResults = [];
    for (let pellet = 0; pellet < pellets; pellet += 1) {
      pelletResults.push(tryHitscanShot(state, weapon, pellet, rng));
    }
    return pelletResults.some((result) => result.hit);
  }

  const projectileCount = Math.max(1, Number(mode?.projectileCount ?? 1) || 1);
  const spreadOffsets = Array.isArray(mode?.spreadOffsets) && mode.spreadOffsets.length > 0
    ? mode.spreadOffsets
    : [0];
  const projectileSpeed = Number(mode?.speed ?? weapon.speed) || weapon.speed;
  const projectileRadius = Number(mode?.projectileRadius ?? weapon.projectileRadius) || weapon.projectileRadius;
  const projectileDamage = Number(mode?.damage ?? weapon.damage) || weapon.damage;
  const projectileSplashRadius = Number(mode?.splashRadius ?? weapon.splashRadius) || weapon.splashRadius;
  const projectileLifeMs = Number(mode?.lifeMs ?? weapon.lifeMs) || weapon.lifeMs;
  const projectileColor = mode?.color ?? weapon.color;
  const offsetList = projectileCount > 1
    ? spreadOffsets.slice(0, projectileCount)
    : [0];
  while (offsetList.length < projectileCount) {
    const step = 0.03;
    const centerIndex = (projectileCount - 1) / 2;
    offsetList.push((offsetList.length - centerIndex) * step);
  }

  for (const offset of offsetList) {
    const dir = normalize2d(Math.cos(player.yaw + offset), Math.sin(player.yaw + offset));
    spawnProjectile(state, 'player', weaponId, player.x, player.z, dir.x, dir.z, {
      speed: projectileSpeed,
      radius: projectileRadius,
      damage: projectileDamage,
      splashRadius: projectileSplashRadius,
      lifeMs: projectileLifeMs,
      color: projectileColor
    });
  }
  return true;
}

export function applyProjectileImpact(state, projectile) {
  if (projectile.splashRadius > 0) {
    applySplashDamage(state, projectile.x, projectile.z, projectile.splashRadius, projectile.damage, projectile.kind);
    pushImpactEvent(state, {
      owner: projectile.owner,
      kind: projectile.kind,
      x: projectile.x,
      z: projectile.z,
      radius: projectile.splashRadius,
      color: projectile.color || null,
      impactKind: 'splash'
    });
    return;
  }

  for (const enemy of state.enemies) {
    if (enemy.dead) {
      continue;
    }
    const distance = Math.hypot(enemy.x - projectile.x, enemy.z - projectile.z);
    if (distance <= enemy.radius + projectile.radius) {
      applyEnemyDamage(state, enemy, projectile.damage, projectile.kind, { x: projectile.vx, z: projectile.vz });
      pushImpactEvent(state, {
        owner: projectile.owner,
        kind: projectile.kind,
        x: projectile.x,
        z: projectile.z,
        radius: projectile.radius,
        color: projectile.color || null,
        impactKind: 'direct'
      });
      return;
    }
  }

  pushImpactEvent(state, {
    owner: projectile.owner,
    kind: projectile.kind,
    x: projectile.x,
    z: projectile.z,
    radius: projectile.radius,
    color: projectile.color || null,
    impactKind: 'wall'
  });
}

export function createProjectile(state, owner, kind, originX, originZ, dirX, dirZ, options) {
  return spawnProjectile(state, owner, kind, originX, originZ, dirX, dirZ, options);
}

export function damageEnemy(state, enemy, damage, reason, impulse = null) {
  return applyEnemyDamage(state, enemy, damage, reason, impulse);
}
