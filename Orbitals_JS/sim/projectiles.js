import * as THREE from '../lib/three.module.js';
import { config } from '../orbitals_config.js';
import { WORLD_UP as worldUp } from './math.js';
import {
  getEnemyItems,
  getProjectileItems,
  getWorldPlanets
} from './state.js';

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

function getProjectileLaunchDirection(projectile, out) {
  if (projectile.launchDirection?.lengthSq() > 1e-10) {
    return out.copy(projectile.launchDirection).normalize();
  }
  if (projectile.guidanceDirection?.lengthSq() > 1e-10) {
    return out.copy(projectile.guidanceDirection).normalize();
  }

  out.copy(projectile.velocity);
  if (projectile.inheritedVelocity) {
    out.sub(projectile.inheritedVelocity);
  }
  if (out.lengthSq() <= 1e-10) {
    out.copy(projectile.velocity);
  }
  return out.normalize();
}

function applyProjectileGuidanceVelocity(projectile) {
  if (!projectile.guidanceDirection) {
    return;
  }

  const speed = projectile.speed ?? projectile.velocity.length();
  const inheritedVelocity = projectile.inheritedVelocity || tempVecK.set(0, 0, 0);
  projectile.velocity.copy(inheritedVelocity).addScaledVector(projectile.guidanceDirection, speed);
}

function rotateDirectionTowards(out, fromDirection, toDirection, maxTurn, axisScratch) {
  out.copy(fromDirection).normalize();
  const targetDirection = tempVecK.copy(toDirection).normalize();
  const angle = out.angleTo(targetDirection);
  if (angle <= 1e-8 || maxTurn <= 0) {
    return out;
  }
  if (angle <= maxTurn) {
    return out.copy(targetDirection);
  }

  axisScratch.copy(out).cross(targetDirection);
  if (axisScratch.lengthSq() <= 1e-12) {
    return out;
  }
  return out.applyAxisAngle(axisScratch.normalize(), maxTurn).normalize();
}

function computeInterceptTime(offset, relativeTargetVelocity, projectileSpeed) {
  if (projectileSpeed <= 1e-8) {
    return 0;
  }

  const distance = offset.length();
  let interceptTime = distance / projectileSpeed;
  const a = relativeTargetVelocity.lengthSq() - projectileSpeed * projectileSpeed;
  const b = 2 * offset.dot(relativeTargetVelocity);
  const c = offset.lengthSq();

  if (Math.abs(a) <= 1e-8) {
    if (Math.abs(b) > 1e-8) {
      const linearTime = -c / b;
      if (linearTime > 0) {
        interceptTime = linearTime;
      }
    }
  } else {
    const discriminant = b * b - 4 * a * c;
    if (discriminant >= 0) {
      const root = Math.sqrt(discriminant);
      const first = (-b - root) / (2 * a);
      const second = (-b + root) / (2 * a);
      const candidates = [first, second].filter((value) => value > 0);
      if (candidates.length > 0) {
        interceptTime = Math.min(...candidates);
      }
    }
  }

  return THREE.MathUtils.clamp(interceptTime, 0, config.projectileHomingMaxLeadTime);
}

function canRetainProjectileTarget(projectile, target) {
  if (!target || target.health <= 0) {
    return false;
  }

  const offset = tempVecA.copy(target.position).sub(projectile.position);
  const distance = offset.length();
  if (distance <= 1e-8 || distance > config.projectileHomingRange) {
    return false;
  }

  const targetDirection = offset.multiplyScalar(1 / distance);
  const currentDirection = tempVecB.copy(projectile.guidanceDirection || projectile.velocity).normalize();
  if (currentDirection.dot(targetDirection) <= 0) {
    return false;
  }

  const launchDirection = getProjectileLaunchDirection(projectile, tempVecC);
  const retainAngle = THREE.MathUtils.degToRad(config.projectileHomingRetainAngleDeg);
  return launchDirection.angleTo(targetDirection) <= retainAngle;
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
  const enemies = getEnemyItems(state);
  if (projectile.homingDisabled) {
    return null;
  }

  const currentTarget = projectile.targetEnemyId != null
    ? enemies.find((enemy) => enemy.id === projectile.targetEnemyId)
    : null;
  if (currentTarget) {
    return canRetainProjectileTarget(projectile, currentTarget) ? currentTarget : null;
  }

  if (projectile.homingAcquisitionComplete) {
    return null;
  }

  const acquireAngle = THREE.MathUtils.degToRad(config.projectileHomingAcquireAngleDeg);
  const launchDirection = getProjectileLaunchDirection(projectile, tempVecA);
  if (!enemies.length || launchDirection.lengthSq() < 1e-10) {
    return null;
  }

  let bestTarget = null;
  let bestAngle = Infinity;
  let bestDistance = Infinity;

  for (const enemy of enemies) {
    if (!enemy || enemy.health <= 0) {
      continue;
    }

    const offset = tempVecB.copy(enemy.position).sub(projectile.position);
    const distance = offset.length();
    if (distance <= 1e-8 || distance > config.projectileHomingRange) {
      continue;
    }

    const direction = offset.multiplyScalar(1 / distance);
    const angle = launchDirection.angleTo(direction);
    if (angle > acquireAngle) {
      continue;
    }

    if (angle < bestAngle - 1e-8 || (Math.abs(angle - bestAngle) <= 1e-8 && distance < bestDistance)) {
      bestAngle = angle;
      bestDistance = distance;
      bestTarget = enemy;
    }
  }

  return bestTarget;
}

export function steerProjectileTowardsTarget(projectile, target, dt) {
  if (!target || !projectile.guidanceDirection || projectile.guidanceDirection.lengthSq() < 1e-10) {
    return;
  }

  const speed = projectile.speed ?? projectile.velocity.length();
  if (speed <= 1e-8) {
    return;
  }

  if (projectile.age < config.projectileHomingDelay) {
    applyProjectileGuidanceVelocity(projectile);
    return;
  }

  const targetOffset = tempVecD.copy(target.position).sub(projectile.position);
  if (targetOffset.lengthSq() <= 1e-10) {
    return;
  }

  const inheritedVelocity = projectile.inheritedVelocity || tempVecE.set(0, 0, 0);
  const targetVelocity = target.velocity || tempVecF.set(0, 0, 0);
  const relativeTargetVelocity = tempVecG.copy(targetVelocity).sub(inheritedVelocity);
  const interceptTime = computeInterceptTime(targetOffset, relativeTargetVelocity, speed);
  const interceptDirection = tempVecH.copy(targetOffset)
    .addScaledVector(relativeTargetVelocity, interceptTime)
    .normalize();

  const launchDirection = getProjectileLaunchDirection(projectile, tempVecC);
  const maxCorrection = THREE.MathUtils.degToRad(config.projectileHomingMaxCorrectionDeg);
  const desiredAngleFromLaunch = launchDirection.angleTo(interceptDirection);
  const constrainedDirection = desiredAngleFromLaunch > maxCorrection
    ? rotateDirectionTowards(tempVecI, launchDirection, interceptDirection, maxCorrection, tempVecJ)
    : tempVecI.copy(interceptDirection);

  const rampDuration = Math.max(1e-8, config.projectileHomingRampDuration);
  const ramp = THREE.MathUtils.clamp(
    (projectile.age - config.projectileHomingDelay) / rampDuration,
    0,
    1
  );
  const maxTurn = THREE.MathUtils.degToRad(config.projectileHomingTurnRateDeg) * ramp * dt;
  const currentDirection = tempVecA.copy(projectile.guidanceDirection).normalize();
  rotateDirectionTowards(tempVecB, currentDirection, constrainedDirection, maxTurn, tempVecJ);

  const correctedAngleFromLaunch = launchDirection.angleTo(tempVecB);
  if (correctedAngleFromLaunch > maxCorrection) {
    tempVecI.copy(tempVecB);
    rotateDirectionTowards(tempVecB, launchDirection, tempVecI, maxCorrection, tempVecJ);
  }

  projectile.guidanceDirection.copy(tempVecB);
  applyProjectileGuidanceVelocity(projectile);
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
  const inheritedVelocity = ship.velocity.clone();
  const projectile = {
    id: state.nextProjectileId,
    position: origin.clone(),
    previousPosition: origin.clone(),
    velocity: inheritedVelocity.clone().addScaledVector(direction, baseSpeed),
    inheritedVelocity,
    launchDirection: direction.clone(),
    guidanceDirection: direction.clone(),
    speed: baseSpeed,
    age: 0,
    lifetime: config.shipProjectileLifetime,
    planetCollisionGrace: 0.14,
    radius: config.shipProjectileSize,
    side: 0,
    spawnFrame: state.frameIndex,
    targetEnemyId: null,
    homingAcquisitionComplete: false,
    homingDisabled: false
  };

  const homingTarget = findProjectileHomingTarget(state, projectile);
  projectile.targetEnemyId = homingTarget ? homingTarget.id : null;
  projectile.homingAcquisitionComplete = true;
  getProjectileItems(state).push(projectile);
  state.nextProjectileId += 1;
}

export function computeShipFireDirection(ship, camera, aimX, aimY, viewportWidth, viewportHeight) {
  if (!ship) {
    return tempVecD.set(0, 0, 1);
  }

  const halfWidth = Math.max(1, viewportWidth * 0.5);
  const halfHeight = Math.max(1, viewportHeight * 0.5);
  const ndcX = THREE.MathUtils.clamp((aimX * config.reticleOffsetPx) / halfWidth, -1.5, 1.5);
  const ndcY = THREE.MathUtils.clamp(-(aimY * config.reticleOffsetPx) / halfHeight, -1.5, 1.5);
  camera.updateMatrixWorld(true);
  const near = tempVecA.set(ndcX, ndcY, -1).unproject(camera);
  const far = tempVecB.set(ndcX, ndcY, 1).unproject(camera);
  return tempVecD.copy(far).sub(near).normalize();
}

export function updateProjectiles(state, dt, options = {}) {
  const applyEnemyDamage = options.applyEnemyDamage || (() => {});
  const enemies = getEnemyItems(state);
  const projectiles = getProjectileItems(state);
  const planets = getWorldPlanets(state);
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = projectiles[i];
    if (projectile.spawnFrame === state.frameIndex) {
      continue;
    }
    projectile.age += dt;
    projectile.previousPosition.copy(projectile.position);

    const previousTargetId = projectile.targetEnemyId;
    const homingTarget = findProjectileHomingTarget(state, projectile);
    if (homingTarget) {
      steerProjectileTowardsTarget(projectile, homingTarget, dt);
    } else {
      if (previousTargetId != null) {
        projectile.targetEnemyId = null;
        projectile.homingDisabled = true;
      }
      applyProjectileGuidanceVelocity(projectile);
    }
    projectile.position.addScaledVector(projectile.velocity, dt);

    let dead = projectile.age >= projectile.lifetime;
    if (!dead && projectile.age >= (projectile.planetCollisionGrace ?? 0)) {
      for (const planet of planets) {
        if (projectile.position.distanceTo(planet.position) <= planet.radius) {
          dead = true;
          break;
        }
      }
    }

    if (!dead && enemies.length > 0) {
      for (let j = enemies.length - 1; j >= 0; j -= 1) {
        const enemy = enemies[j];
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
      projectiles.splice(i, 1);
    }
  }
}
