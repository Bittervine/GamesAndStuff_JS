import * as THREE from '../lib/three.module.js';
import { config } from '../orbitals_config.js';
import { WORLD_UP as worldUp } from './math.js';

const tempVecA = new THREE.Vector3();
const tempVecB = new THREE.Vector3();
const tempVecC = new THREE.Vector3();
const tempVecD = new THREE.Vector3();
const tempVecE = new THREE.Vector3();
const tempVecF = new THREE.Vector3();

const PROJECTILE_HOMING_LOCK_ANGLE = THREE.MathUtils.degToRad(5);
const PROJECTILE_HOMING_ACQUIRE_ANGLE = THREE.MathUtils.degToRad(7.5);
const PROJECTILE_HOMING_RETAIN_ANGLE = THREE.MathUtils.degToRad(18);
const PROJECTILE_HOMING_RANGE = 900;
const PROJECTILE_HOMING_MIN_TURN = THREE.MathUtils.degToRad(10);
const PROJECTILE_HOMING_MAX_TURN = THREE.MathUtils.degToRad(45);
const RETICLE_OFFSET_PX = 170;

function applyProjectileGuidanceVelocity(projectile, includeInheritedVelocity = true) {
  if (!projectile.guidanceDirection) {
    return;
  }

  const speed = projectile.speed ?? projectile.velocity.length();
  const inheritedVelocity = includeInheritedVelocity
    ? (projectile.inheritedVelocity || tempVecE.set(0, 0, 0))
    : tempVecE.set(0, 0, 0);
  projectile.velocity.copy(inheritedVelocity).addScaledVector(projectile.guidanceDirection, speed);
}

export function segmentIntersectsSphere(start, end, center, radius) {
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

export function findProjectileHomingTarget(state, projectile) {
  const headingSource = projectile.guidanceDirection || projectile.velocity;
  if (!state.enemies.length || headingSource.lengthSq() < 1e-6) {
    return null;
  }

  const currentHeading = tempVecA.copy(headingSource).normalize();
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

export function steerProjectileTowardsTarget(projectile, target, dt) {
  const headingSource = projectile.guidanceDirection || projectile.velocity;
  if (!target || headingSource.lengthSq() < 1e-6) {
    return;
  }

  const speed = projectile.speed ?? projectile.velocity.length();
  if (speed <= 1e-6) {
    return;
  }

  const currentDirection = tempVecA.copy(headingSource).normalize();
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

  projectile.guidanceDirection = projectile.guidanceDirection || new THREE.Vector3();
  projectile.guidanceDirection.copy(currentDirection);
  applyProjectileGuidanceVelocity(projectile, false);
}

export function spawnProjectileBurst(state, ship, fireDirection) {
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
  const inheritedVelocity = ship.boundPlanet
    ? ship.relativeVelocity.clone()
    : ship.velocity.clone();
  state.projectiles.push({
    id: state.nextProjectileId,
    position: origin.clone(),
    previousPosition: origin.clone(),
    velocity: inheritedVelocity.clone().addScaledVector(direction, baseSpeed),
    inheritedVelocity,
    guidanceDirection: direction.clone(),
    speed: baseSpeed,
    age: 0,
    lifetime: config.shipProjectileLifetime,
    planetCollisionGrace: 0.14,
    radius: config.shipProjectileSize,
    side: 0,
    spawnFrame: state.frameIndex,
    targetEnemyId: null,
    visual: null
  });
  state.nextProjectileId += 1;
}

export function computeShipFireDirection(ship, camera, aimX, aimY, viewportWidth, viewportHeight) {
  if (!ship) {
    return tempVecD.set(0, 0, 1);
  }

  const halfWidth = Math.max(1, viewportWidth * 0.5);
  const halfHeight = Math.max(1, viewportHeight * 0.5);
  const ndcX = THREE.MathUtils.clamp((aimX * RETICLE_OFFSET_PX) / halfWidth, -1.5, 1.5);
  const ndcY = THREE.MathUtils.clamp(-(aimY * RETICLE_OFFSET_PX) / halfHeight, -1.5, 1.5);
  camera.updateMatrixWorld(true);
  const near = tempVecA.set(ndcX, ndcY, -1).unproject(camera);
  const far = tempVecB.set(ndcX, ndcY, 1).unproject(camera);
  return tempVecD.copy(far).sub(near).normalize();
}

export function updateProjectiles(state, dt, options = {}) {
  const applyEnemyDamage = options.applyEnemyDamage || (() => {});
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
    } else if (projectile.guidanceDirection) {
      applyProjectileGuidanceVelocity(projectile, projectile.targetEnemyId == null);
    }
    projectile.position.addScaledVector(projectile.velocity, dt);

    let dead = projectile.age >= projectile.lifetime;
    if (!dead && projectile.age >= (projectile.planetCollisionGrace ?? 0)) {
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
