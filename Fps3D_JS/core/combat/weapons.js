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

function applyEnemyDamage(state, enemy, damage, reason) {
  if (!enemy || enemy.dead) {
    return false;
  }

  enemy.hp -= damage;
  enemy.hitFlashMs = 120;
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

  if (enemy.hp <= 0 && !enemy.dead) {
    enemy.dead = true;
    enemy.dyingMs = 600;
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
    applyEnemyDamage(state, enemy, Math.max(1, Math.round(damage * falloff)), owner);
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
    applyEnemyDamage(state, bestEnemy, damage, weapon.id);
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

function spendAmmo(player, weapon) {
  const ammoType = weapon.ammoType;
  if (!ammoType) {
    return true;
  }

  if ((player.ammo[ammoType] || 0) < weapon.ammoCost) {
    return false;
  }

  player.ammo[ammoType] -= weapon.ammoCost;
  return true;
}

export function canFireWeapon(player, weaponId) {
  const weapon = getWeaponDef(weaponId);
  return player.weaponCooldownMs <= 0 && (!weapon.ammoType || (player.ammo[weapon.ammoType] || 0) >= weapon.ammoCost);
}

export function fireWeapon(state, weaponId, rng = state.rng) {
  const player = state.player;
  const weapon = getWeaponDef(weaponId);

  if (!canFireWeapon(player, weaponId)) {
    return false;
  }

  if (!spendAmmo(player, weapon)) {
    return false;
  }

  player.weaponCooldownMs = weapon.fireDelayMs;
  player.recoilMs = Math.max(player.recoilMs, 90);
  player.recoilKick += weapon.recoil;
  state.events.push({
    type: 'fireWeapon',
    weaponId
  });
  state.replayPush({
    type: 'fireWeapon',
    data: { weaponId }
  });

  if (weapon.type === 'hitscan') {
    const pellets = weapon.pellets || 1;
    const pelletResults = [];
    for (let pellet = 0; pellet < pellets; pellet += 1) {
      pelletResults.push(tryHitscanShot(state, weapon, pellet, rng));
    }
    return pelletResults.some((result) => result.hit);
  }

  const dir = normalize2d(Math.cos(player.yaw), Math.sin(player.yaw));
  spawnProjectile(state, 'player', weaponId, player.x, player.z, dir.x, dir.z, {
    speed: weapon.speed,
    radius: weapon.projectileRadius,
    damage: weapon.damage,
    splashRadius: weapon.splashRadius,
    lifeMs: weapon.lifeMs,
    color: weapon.color
  });
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
      applyEnemyDamage(state, enemy, projectile.damage, projectile.kind);
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

export function damageEnemy(state, enemy, damage, reason) {
  return applyEnemyDamage(state, enemy, damage, reason);
}
