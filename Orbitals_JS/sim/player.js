import * as THREE from '../lib/three.module.js';
import { config } from '../orbitals_config.js';
import { WORLD_UP as worldUp } from './math.js';
import {
  clampShipSpeed,
  syncShipWorldState,
  updateFlightState
} from './physics.js';

const tempVecA = new THREE.Vector3();
const tempVecB = new THREE.Vector3();

export function respawnShip(state) {
  if (!state.ship || state.planets.length === 0) {
    return null;
  }
  state.crashed = false;
  state.fuel = state.maxFuel;
  state.projectiles.length = 0;
  const planet = state.planets[state.respawnPlanetIndex % state.planets.length];
  const normal = planet.position.lengthSq() > 1e-6 ? planet.position.clone().normalize() : new THREE.Vector3(0, 1, 0);
  const tangent = Math.abs(normal.dot(worldUp)) > 0.85
    ? new THREE.Vector3(1, 0, 0).cross(normal).normalize()
    : worldUp.clone().cross(normal).normalize();
  const side = normal.clone().cross(tangent).normalize();
  const atmosphereThickness = Math.max(planet.atmosphereRadius - planet.radius, 0.0001);
  const spawnAltitude = atmosphereThickness * 0.5;
  const desiredRadius = planet.radius + spawnAltitude;
  const surfaceSpeed = Math.sqrt(Math.max(planet.gravityStrength / Math.max(desiredRadius, 1.0), 4.0));
  const cruiseSpeed = surfaceSpeed * 0.12;
  const flightSpeed = clampShipSpeed(cruiseSpeed * (0.92 + state.rng() * 0.08));
  const spawnOffset = normal.clone().multiplyScalar(desiredRadius)
    .addScaledVector(side, -1.0 + state.rng() * 2.0);
  state.ship.boundPlanet = planet;
  state.ship.relativePosition.copy(spawnOffset);
  state.ship.relativeVelocity.copy(tangent).multiplyScalar(flightSpeed);
  syncShipWorldState(state.ship);
  state.ship.forward.copy(tangent).normalize();
  state.ship.up.copy(normal).normalize();
  state.ship.bank = 0;
  state.ship.boostTimer = 0;
  state.ship.fireCooldown = 0;
  state.ship.pitchIdleTime = 0;
  state.ship.recaptureLock = 0;
  state.ship.captureTimer = config.shipCaptureBlendTime;
  state.ship.flightMode = 'bound';
  state.ship.muzzleOffset = config.shipMuzzleOffset;
  state.ship.speed = flightSpeed;
  state.nearestPlanet = planet;
  state.nearestDistance = state.ship.position.distanceTo(planet.position);
  state.nearestAltitude = state.nearestDistance - planet.radius;
  state.speed = state.ship.relativeVelocity.length();
  return planet;
}

export function crashPlayerShip(state, planet, crashNormal, impactPosition = null, options = {}) {
  const ship = state.ship;
  if (!ship || state.crashed) {
    return;
  }

  const spawnEnemyExplosion = typeof options.spawnEnemyExplosion === 'function' ? options.spawnEnemyExplosion : () => {};
  const safeNormal = crashNormal && crashNormal.lengthSq && crashNormal.lengthSq() > 1e-8
    ? tempVecA.copy(crashNormal).normalize()
    : tempVecA.copy(ship.position).sub(planet.position).normalize();
  const crashAltitude = Math.max(0.25, config.atmosphereTerrainCrashAltitude);
  state.crashed = true;
  state.crashTimer = 0;
  state.crashRespawnReady = false;
  state.speed = 0;
  ship.speed = 0;
  ship.boostTimer = 0;
  ship.fireCooldown = 0;
  ship.relativeVelocity.set(0, 0, 0);
  ship.velocity.copy(planet.velocity);
  ship.relativePosition.copy(safeNormal).multiplyScalar(planet.radius + crashAltitude);
  ship.position.copy(planet.position).add(ship.relativePosition);
  ship.up.copy(safeNormal);
  ship.forward.addScaledVector(safeNormal, -ship.forward.dot(safeNormal));
  if (ship.forward.lengthSq() < 1e-6) {
    ship.forward.copy(Math.abs(safeNormal.dot(worldUp)) > 0.92
      ? tempVecB.set(1, 0, 0).cross(safeNormal).normalize()
      : tempVecB.copy(worldUp).cross(safeNormal).normalize());
  }
  ship.forward.normalize();
  state.projectiles.length = 0;
  spawnEnemyExplosion(state, impactPosition || ship.position, 'crash');
}

export function crashPlayerShipIntoSun(state, impactPosition = null, options = {}) {
  const ship = state.ship;
  if (!ship || state.crashed) {
    return;
  }
  const spawnEnemyExplosion = typeof options.spawnEnemyExplosion === 'function' ? options.spawnEnemyExplosion : () => {};
  state.crashed = true;
  state.crashTimer = 0;
  state.crashRespawnReady = false;
  state.speed = 0;
  ship.speed = 0;
  ship.boostTimer = 0;
  ship.fireCooldown = 0;
  ship.relativeVelocity.set(0, 0, 0);
  ship.velocity.set(0, 0, 0);
  ship.position.copy(impactPosition || ship.position);
  ship.relativePosition.copy(ship.position);
  spawnEnemyExplosion(state, impactPosition || ship.position, 'crash');
}


export function updateShipState(state, dt, controls, options = {}) {
  return updateFlightState(state, dt, controls, {
    ...options,
    respawnShip,
    crashPlayerShip,
    crashPlayerShipIntoSun
  });
}
