import * as THREE from '../lib/three.module.js';
import { config } from '../orbitals_config.js';
import { mulberry32 } from './math.js';


export function createEnemyExplosionState(state, position, cause = 'projectile') {
  const explosionSeed = ((state.seed >>> 0) ^ Math.imul(state.nextEnemyExplosionId + 1, 0x9e3779b9)) >>> 0;
  const rng = mulberry32(explosionSeed);
  return {
    id: state.nextEnemyExplosionId,
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
  state.enemyExplosions.push(createEnemyExplosionState(state, position, cause));
  state.nextEnemyExplosionId += 1;
}

export function updateEnemyExplosions(state, dt) {
  for (let i = state.enemyExplosions.length - 1; i >= 0; i -= 1) {
    const explosion = state.enemyExplosions[i];
    explosion.age += dt;
    if (explosion.age >= explosion.lifetime) {
      state.enemyExplosions.splice(i, 1);
    }
  }
}
