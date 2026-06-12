import * as THREE from '../lib/three.module.js';
import { config } from '../orbitals_config.js';
import { ENEMY_HIT_RADIUS } from './state.js';

const tempVecA = new THREE.Vector3();
const tempVecB = new THREE.Vector3();
const tempVecC = new THREE.Vector3();

function isMothershipEnemy(enemy) {
  return Boolean(enemy && enemy.kind === 'mothership');
}

export function canShipsCollide(first, second) {
  if (!first || !second || first === second) {
    return false;
  }
  const firstIsMothership = isMothershipEnemy(first);
  const secondIsMothership = isMothershipEnemy(second);
  const firstIsRegularEnemy = Boolean(first.kind) && !firstIsMothership;
  const secondIsRegularEnemy = Boolean(second.kind) && !secondIsMothership;
  if (firstIsRegularEnemy && secondIsRegularEnemy && !config.enemyEnemyCollisionsDamage) {
    return false;
  }
  if ((firstIsRegularEnemy && secondIsMothership) || (firstIsMothership && secondIsRegularEnemy)) {
    return false;
  }
  return true;
}

export function getAllActiveShips(state) {
  const ships = [];
  if (state.ship && !state.crashed) {
    ships.push({ ship: state.ship, isPlayer: true });
  }
  for (const enemy of state.enemies) {
    if (enemy && enemy.health > 0) {
      ships.push({ ship: enemy, isPlayer: false });
    }
  }
  return ships;
}

export function updateShipShipCollisions(state, options = {}) {
  const handleShipCollision = options.handleShipCollision || (() => {});
  const ships = getAllActiveShips(state);
  const sunRadius = config.starScale * 0.5;
  for (let i = 0; i < ships.length; i += 1) {
    const a = ships[i].ship;
    if (!a || (!ships[i].isPlayer && a.health <= 0)) {
      continue;
    }
    for (let j = i + 1; j < ships.length; j += 1) {
      const b = ships[j].ship;
      if (!b || (!ships[j].isPlayer && b.health <= 0)) {
        continue;
      }
      if (!canShipsCollide(a, b)) {
        continue;
      }
      const radiusA = a === state.ship ? Math.max(1.5, sunRadius * 0.006) : Math.max(ENEMY_HIT_RADIUS, a.radius || ENEMY_HIT_RADIUS);
      const radiusB = b === state.ship ? Math.max(1.5, sunRadius * 0.006) : Math.max(ENEMY_HIT_RADIUS, b.radius || ENEMY_HIT_RADIUS);
      const delta = tempVecA.copy(b.position).sub(a.position);
      const distance = delta.length();
      const overlap = radiusA + radiusB;
      if (distance > overlap) {
        continue;
      }
      const relativeVelocity = tempVecB.copy(b.velocity || tempVecB.set(0, 0, 0)).sub(a.velocity || tempVecC.set(0, 0, 0));
      const impactSpeed = Math.max(relativeVelocity.length(), 0.5);
      const impactPoint = distance > 1e-6
        ? tempVecC.copy(a.position).addScaledVector(delta, 0.5)
        : tempVecC.copy(a.position);
      handleShipCollision(state, a, b, impactPoint.clone(), impactSpeed);
    }
  }
}
