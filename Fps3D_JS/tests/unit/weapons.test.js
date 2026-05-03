import assert from 'node:assert/strict';
import { createSeededRng } from '../../core/random/seededRng.js';
import { parseLevelDefinition } from '../../core/world/level.js';
import { createEnemy } from '../../core/combat/enemies.js';
import { fireWeapon } from '../../core/combat/weapons.js';

function makeState(levelRows) {
  const level = parseLevelDefinition({ id: 'arena', rows: levelRows });
  const state = {
    level,
    rng: createSeededRng(1),
    replayPush() {},
    events: [],
    enemies: [],
    projectiles: [],
    player: {
      x: 1.5,
      z: 1.5,
      yaw: 0,
      pitch: 0,
      radius: 0.3,
      weaponCooldownMs: 0,
      recoilMs: 0,
      recoilKick: 0,
      ammo: { bullet: 100, shell: 10, rocket: 4, cell: 40 },
      kills: 0,
      dead: false
    },
    damagePlayer() {}
  };
  return state;
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

runCase('pistol hits a nearby enemy and spends ammo', () => {
  const state = makeState([
    '#####',
    '#Pz.#',
    '#...#',
    '#####'
  ]);
  const enemy = createEnemy('zombie', 2.5, 1.5, { id: 1 });
  state.enemies.push(enemy);
  const fired = fireWeapon(state, 'pistol', state.rng);
  assert.equal(fired, true);
  assert.equal(state.player.ammo.bullet, 99);
  assert.ok(enemy.hp < enemy.def.hp);
});

runCase('shotgun can kill a weak enemy in one blast at close range', () => {
  const state = makeState([
    '#####',
    '#Pz.#',
    '#...#',
    '#####'
  ]);
  const enemy = createEnemy('zombie', 2.4, 1.5, { id: 1 });
  state.enemies.push(enemy);
  const fired = fireWeapon(state, 'shotgun', state.rng);
  assert.equal(fired, true);
  assert.equal(state.player.ammo.shell, 9);
  assert.equal(enemy.dead, true);
  assert.ok(state.player.kills >= 1);
});

runCase('rocket launcher spawns a projectile instead of hitscan damage', () => {
  const state = makeState([
    '#####',
    '#P..#',
    '#...#',
    '#####'
  ]);
  const fired = fireWeapon(state, 'rocketLauncher', state.rng);
  assert.equal(fired, true);
  assert.equal(state.projectiles.length, 1);
  assert.equal(state.player.ammo.rocket, 3);
});
