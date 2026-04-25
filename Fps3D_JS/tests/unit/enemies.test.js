import assert from 'node:assert/strict';
import { createSeededRng } from '../../core/random/seededRng.js';
import { parseLevelDefinition } from '../../core/world/level.js';
import { createEnemy, updateEnemy } from '../../core/combat/enemies.js';

function makeState(levelRows) {
  const level = parseLevelDefinition({ id: 'arena', rows: levelRows });
  return {
    level,
    rng: createSeededRng(1),
    replayPush() {},
    events: [],
    projectiles: [],
    pickups: [],
    player: {
      x: 1.5,
      z: 1.5,
      radius: 0.3,
      health: 100,
      armor: 0,
      invulnMs: 0,
      dead: false
    },
    damagePlayer(amount) {
      this.player.health -= amount;
      if (this.player.health <= 0) {
        this.player.dead = true;
      }
    }
  };
}

function runCase(name, fn) {
  try {
    fn();
    console.log('PASS', name);
  } catch (error) {
    console.error('FAIL', name);
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
  }
}

runCase('enemy advances toward the player when it can see them', () => {
  const state = makeState([
    '#####',
    '#P..#',
    '#...#',
    '#.d.#',
    '#####'
  ]);
  const enemy = createEnemy('demon', 2.5, 3.5, { id: 1 });
  const before = enemy.z;
  updateEnemy(state, enemy, 100);
  assert.ok(enemy.z < before);
});

runCase('melee enemy damages the player when in range', () => {
  const state = makeState([
    '#####',
    '#P..#',
    '#...#',
    '#.d.#',
    '#####'
  ]);
  const enemy = createEnemy('demon', 1.9, 1.5, { id: 1 });
  const hpBefore = state.player.health;
  updateEnemy(state, enemy, 100);
  assert.ok(state.player.health < hpBefore);
});
