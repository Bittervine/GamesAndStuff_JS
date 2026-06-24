import * as THREE from '../lib/three.module.js';
import { config } from '../orbitals_config.js';
import { mulberry32 } from './math.js';
import { getEnemyState } from './state.js';


export function createEnemyExplosionState(state, position, cause = 'projectile') {
  const enemies = getEnemyState(state);
  const explosionId = enemies.nextExplosionId;
  const explosionSeed = ((state.seed >>> 0) ^ Math.imul(explosionId + 1, 0x9e3779b9)) >>> 0;
  const rng = mulberry32(explosionSeed);
  return {
    id: explosionId,
    position: position.clone(),
    age: 0,
    lifetime: cause === 'crash'
      ? config.enemyExplosionLifetimeMin + rng() * (config.enemyExplosionLifetimeMax - config.enemyExplosionLifetimeMin)
      : (config.enemyExplosionLifetimeMin * 0.85) + rng() * ((config.enemyExplosionLifetimeMax * 0.9) - (config.enemyExplosionLifetimeMin * 0.85)),
    particleCount: config.enemyExplosionParticleCount,
    cause
  };
}

export function spawnEnemyExplosion(state, position, cause = 'projectile') {
  const enemies = getEnemyState(state);
  enemies.explosions.push(createEnemyExplosionState(state, position, cause));
  enemies.nextExplosionId += 1;
}

export function updateEnemyExplosions(state, dt) {
  const explosions = getEnemyState(state).explosions;
  for (let i = explosions.length - 1; i >= 0; i -= 1) {
    const explosion = explosions[i];
    explosion.age += dt;
    if (explosion.age >= explosion.lifetime) {
      explosions.splice(i, 1);
    }
  }
}
