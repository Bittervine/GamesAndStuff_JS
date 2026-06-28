import * as THREE from '../lib/three.module.js';
import { config } from '../orbitals_config.js';
import { randomUnitVector } from './math.js';
import { pushEvent } from './events.js';
import {
  getPickupItems,
  getPickupState,
  getPlayerState,
  getWorldPlanets
} from './state.js';
import { pickNearestPlanet } from './world.js';

const tempVecA = new THREE.Vector3();
const tempVecB = new THREE.Vector3();
const tempVecC = new THREE.Vector3();

function getRng(state) {
  return typeof state?.rng === 'function' ? state.rng : Math.random;
}

function serializePosition(position) {
  return {
    x: position.x,
    y: position.y,
    z: position.z
  };
}

function choosePickupKind(state) {
  const rng = getRng(state);
  const fuelWeight = Math.max(0, config.pickupFuelWeight);
  const shieldWeight = Math.max(0, config.pickupShieldWeight);
  const rapidFireWeight = Math.max(0, config.pickupRapidFireWeight);
  const totalWeight = fuelWeight + shieldWeight + rapidFireWeight;
  if (totalWeight <= 0) {
    return 'fuel';
  }

  const roll = rng() * totalWeight;
  if (roll < fuelWeight) {
    return 'fuel';
  }
  if (roll < fuelWeight + shieldWeight) {
    return 'shield';
  }
  return 'rapidFire';
}

function clampPickupSpeed(pickup) {
  const maxSpeed = Math.max(0, config.pickupMaxSpeed);
  if (maxSpeed <= 0 || pickup.velocity.lengthSq() <= maxSpeed * maxSpeed) {
    return;
  }
  pickup.velocity.setLength(maxSpeed);
}

function keepPickupClearOfTerrain(state, pickup) {
  const planets = getWorldPlanets(state);
  if (!planets.length) {
    return;
  }

  const { nearest } = pickNearestPlanet(planets, pickup.position);
  if (!nearest) {
    return;
  }

  const clearanceRadius = nearest.radius + Math.max(0, config.pickupPlanetClearance);
  const fromPlanet = tempVecA.copy(pickup.position).sub(nearest.position);
  if (fromPlanet.lengthSq() <= 1e-8) {
    fromPlanet.copy(randomUnitVector(getRng(state)));
  }
  const distance = fromPlanet.length();
  if (distance >= clearanceRadius) {
    return;
  }

  const normal = fromPlanet.multiplyScalar(1 / Math.max(distance, 1e-8));
  pickup.position.copy(nearest.position).addScaledVector(normal, clearanceRadius);
  const inwardSpeed = pickup.velocity.dot(normal);
  if (inwardSpeed < 0) {
    pickup.velocity.addScaledVector(normal, -inwardSpeed);
  }
}

function applyPickupToPlayer(state, pickup) {
  const player = getPlayerState(state);
  if (!player.ship || player.crashed) {
    return false;
  }

  let overflowScore = 0;
  if (pickup.kind === 'shield') {
    const before = player.shields || 0;
    player.shields = Math.min(config.playerShieldMax, before + config.pickupShieldAmount);
    if (player.shields === before) {
      overflowScore = config.pickupOverflowScore;
    }
  } else if (pickup.kind === 'rapidFire') {
    player.rapidFireTimer = Math.max(player.rapidFireTimer || 0, config.pickupRapidFireDuration);
  } else {
    const before = player.fuel || 0;
    player.fuel = Math.min(player.maxFuel, before + config.pickupFuelAmount);
    if (player.fuel === before) {
      overflowScore = config.pickupOverflowScore;
    }
  }

  if (overflowScore > 0) {
    player.score = (player.score || 0) + overflowScore;
  }

  pushEvent(state, 'pickup-collect', {
    pickupId: pickup.id,
    kind: pickup.kind,
    position: serializePosition(pickup.position),
    fuel: player.fuel,
    shields: player.shields || 0,
    rapidFireTimer: player.rapidFireTimer || 0,
    overflowScore
  });
  return true;
}

export function createPickupState(state, options = {}) {
  const pickups = getPickupState(state);
  const pickup = {
    id: options.id ?? pickups.nextId,
    kind: options.kind || choosePickupKind(state),
    position: options.position ? options.position.clone() : new THREE.Vector3(),
    previousPosition: options.position ? options.position.clone() : new THREE.Vector3(),
    velocity: options.velocity ? options.velocity.clone() : new THREE.Vector3(),
    age: 0,
    lifetime: options.lifetime ?? config.pickupLifetime,
    radius: options.radius ?? config.pickupRadius,
    collectRadius: options.collectRadius ?? config.pickupCollectRadius,
    magnetRange: options.magnetRange ?? config.pickupMagnetRange,
    sourceEnemyId: options.sourceEnemyId ?? -1,
    spawnFrame: state.frameIndex,
    collected: false
  };
  return pickup;
}

export function spawnPickup(state, position, options = {}) {
  const pickups = getPickupState(state);
  const pickup = createPickupState(state, {
    ...options,
    position
  });
  keepPickupClearOfTerrain(state, pickup);
  pickups.items.push(pickup);
  pickups.nextId = Math.max(pickups.nextId, pickup.id + 1);
  pushEvent(state, 'pickup-spawn', {
    pickupId: pickup.id,
    kind: pickup.kind,
    sourceEnemyId: pickup.sourceEnemyId,
    position: serializePosition(pickup.position)
  });
  return pickup;
}

export function maybeDropPickupFromEnemy(state, enemy, cause = 'projectile', impactPosition = null) {
  if (!enemy || enemy.kind === 'mothership' || cause !== 'projectile') {
    return null;
  }

  const rng = getRng(state);
  if (rng() > config.enemyPickupDropChance) {
    return null;
  }

  const inheritedVelocity = enemy.velocity
    ? tempVecA.copy(enemy.velocity).multiplyScalar(config.pickupDropInheritVelocityScale)
    : tempVecA.set(0, 0, 0);
  const jitter = randomUnitVector(rng).multiplyScalar(config.pickupDropJitterSpeed);
  const velocity = tempVecB.copy(inheritedVelocity).add(jitter);
  const position = impactPosition ? tempVecC.copy(impactPosition) : tempVecC.copy(enemy.position);
  return spawnPickup(state, position, {
    kind: choosePickupKind(state),
    velocity,
    sourceEnemyId: enemy.id
  });
}

export function updatePickups(state, dt) {
  const player = getPlayerState(state);
  player.rapidFireTimer = Math.max(0, (player.rapidFireTimer || 0) - dt);

  const pickups = getPickupItems(state);
  for (let i = pickups.length - 1; i >= 0; i -= 1) {
    const pickup = pickups[i];
    pickup.age += dt;
    pickup.previousPosition.copy(pickup.position);

    if (pickup.age >= pickup.lifetime) {
      pushEvent(state, 'pickup-expire', {
        pickupId: pickup.id,
        kind: pickup.kind,
        position: serializePosition(pickup.position)
      });
      pickups.splice(i, 1);
      continue;
    }

    if (player.ship && !player.crashed) {
      const toShip = tempVecA.copy(player.ship.position).sub(pickup.position);
      const distance = toShip.length();
      if (distance <= pickup.collectRadius) {
        if (applyPickupToPlayer(state, pickup)) {
          pickups.splice(i, 1);
          continue;
        }
      } else if (distance <= pickup.magnetRange && distance > 1e-8) {
        const magnetT = 1 - distance / Math.max(pickup.magnetRange, 1e-8);
        pickup.velocity.addScaledVector(
          toShip.multiplyScalar(1 / distance),
          config.pickupMagnetAccel * magnetT * magnetT * dt
        );
      }
    }

    const damping = Math.pow(Math.max(0, config.pickupDriftDamping), dt);
    pickup.velocity.multiplyScalar(damping);
    clampPickupSpeed(pickup);
    pickup.position.addScaledVector(pickup.velocity, dt);
    keepPickupClearOfTerrain(state, pickup);
  }
}
