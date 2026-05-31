import assert from 'node:assert/strict';
import { createSeededRng } from '../../core/random/seededRng.js';
import { parseLevelDefinition } from '../../core/world/level.js';
import { createEnemy, damageEnemyDirect, updateEnemy } from '../../core/combat/enemies.js';

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

runCase('ranged enemy winds up before firing', () => {
  const state = makeState([
    '#####',
    '#P..#',
    '#...#',
    '#.z.#',
    '#####'
  ]);
  const enemy = createEnemy('zombie', 1.9, 3.5, { id: 1 });
  const hpBefore = state.player.health;

  updateEnemy(state, enemy, 16);
  assert.ok(enemy.attackWindupMs > 0);
  assert.equal(state.player.health, hpBefore);

  updateEnemy(state, enemy, 240);
  assert.ok(state.player.health < hpBefore);
});

runCase('enemy damage applies stun and knockback', () => {
  const state = makeState([
    '#####',
    '#P..#',
    '#...#',
    '#.d.#',
    '#####'
  ]);
  const enemy = createEnemy('demon', 2.5, 3.5, { id: 1 });
  const hpBefore = enemy.hp;

  damageEnemyDirect(state, enemy, 12, 'test', { x: 1, z: 0 });
  assert.ok(enemy.hp < hpBefore);
  assert.ok(enemy.stunMs > 0);
  assert.ok(enemy.knockbackX > 0);

  updateEnemy(state, enemy, 16);
  assert.ok(enemy.stunMs < 96);
  assert.ok(enemy.knockbackX < 0.194);
  assert.equal(enemy.behaviorState, 'stunned');
});
