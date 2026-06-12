import * as THREE from '../lib/three.module.js';
import { mulberry32 } from './math.js';

const ENEMY_EXPLOSION_PARTICLE_COUNT = 70;
const ENEMY_EXPLOSION_LIFETIME_MIN = 0.34;
const ENEMY_EXPLOSION_LIFETIME_MAX = 0.58;

export function createEnemyExplosionState(state, position, cause = 'projectile') {
  const explosionSeed = ((state.seed >>> 0) ^ Math.imul(state.nextEnemyExplosionId + 1, 0x9e3779b9)) >>> 0;
  const rng = mulberry32(explosionSeed);
  return {
    id: state.nextEnemyExplosionId,
    position: position.clone(),
    age: 0,
    lifetime: cause === 'crash'
      ? ENEMY_EXPLOSION_LIFETIME_MIN + rng() * (ENEMY_EXPLOSION_LIFETIME_MAX - ENEMY_EXPLOSION_LIFETIME_MIN)
      : (ENEMY_EXPLOSION_LIFETIME_MIN * 0.85) + rng() * ((ENEMY_EXPLOSION_LIFETIME_MAX * 0.9) - (ENEMY_EXPLOSION_LIFETIME_MIN * 0.85)),
    particleCount: ENEMY_EXPLOSION_PARTICLE_COUNT,
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
