import * as THREE from '../lib/three.module.js';
import { config } from '../orbitals_config.js';
import { WORLD_UP as worldUp } from './math.js';
import {
  clampShipSpeed,
  syncShipWorldState,
  updateFlightState
} from './physics.js';
import {
  getPlayerState,
  getProjectileItems,
  getWorldPlanets
} from './state.js';

const tempVecA = new THREE.Vector3();
const tempVecB = new THREE.Vector3();

export function respawnShip(state) {
  const player = getPlayerState(state);
  const planets = getWorldPlanets(state);
  const projectiles = getProjectileItems(state);
  const ship = player.ship;
  if (!ship || planets.length === 0) {
    return null;
  }
  player.crashed = false;
  player.fuel = player.maxFuel;
  projectiles.length = 0;
  const planet = planets[player.respawnPlanetIndex % planets.length];
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
  ship.boundPlanet = planet;
  ship.relativePosition.copy(spawnOffset);
  ship.relativeVelocity.copy(tangent).multiplyScalar(flightSpeed);
  syncShipWorldState(ship);
  ship.forward.copy(tangent).normalize();
  ship.up.copy(normal).normalize();
  ship.bank = 0;
  ship.boostTimer = 0;
  ship.fireCooldown = 0;
  ship.pitchIdleTime = 0;
  ship.recaptureLock = 0;
  ship.captureTimer = config.shipCaptureBlendTime;
  ship.flightMode = 'bound';
  ship.muzzleOffset = config.shipMuzzleOffset;
  ship.speed = flightSpeed;
  state.nearestPlanet = planet;
  state.nearestDistance = ship.position.distanceTo(planet.position);
  state.nearestAltitude = state.nearestDistance - planet.radius;
  player.speed = ship.relativeVelocity.length();
  return planet;
}

export function crashPlayerShip(state, planet, crashNormal, impactPosition = null, options = {}) {
  const player = getPlayerState(state);
  const ship = player.ship;
  if (!ship || player.crashed) {
    return;
  }

  const spawnEnemyExplosion = typeof options.spawnEnemyExplosion === 'function' ? options.spawnEnemyExplosion : () => {};
  const safeNormal = crashNormal && crashNormal.lengthSq && crashNormal.lengthSq() > 1e-8
    ? tempVecA.copy(crashNormal).normalize()
    : tempVecA.copy(ship.position).sub(planet.position).normalize();
  const crashAltitude = Math.max(0.25, config.atmosphereTerrainCrashAltitude);
  player.crashed = true;
  player.crashTimer = 0;
  player.crashRespawnReady = false;
  player.speed = 0;
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
  getProjectileItems(state).length = 0;
  spawnEnemyExplosion(state, impactPosition || ship.position, 'crash');
}

export function crashPlayerShipIntoSun(state, impactPosition = null, options = {}) {
  const player = getPlayerState(state);
  const ship = player.ship;
  if (!ship || player.crashed) {
    return;
  }
  const spawnEnemyExplosion = typeof options.spawnEnemyExplosion === 'function' ? options.spawnEnemyExplosion : () => {};
  player.crashed = true;
  player.crashTimer = 0;
  player.crashRespawnReady = false;
  player.speed = 0;
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
