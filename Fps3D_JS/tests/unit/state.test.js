import assert from 'node:assert/strict';
import { createGameState, advanceGameState } from '../../core/game/state.js';

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

runCase('createGameState initializes level, enemies, pickups, and replay capture', () => {
  const state = createGameState({ seed: 123, levelId: 'alpha01' });
  assert.equal(state.level.id, 'alpha01');
  assert.equal(state.level.sectors.length, 1);
  assert.ok(state.level.walls.length >= 8);
  assert.ok(state.enemies.length >= 5);
  assert.ok(state.pickups.length >= 4);
  assert.ok(state.replay.events.length >= 1);
  assert.equal(state.requestRestart, false);
  assert.ok(state.player.eyeHeight > 1);
});

runCase('advanceGameState moves the player and records input deterministically', () => {
  const state = createGameState({ seed: 123, levelId: 'alpha01' });
  const startX = state.player.x;
  const startZ = state.player.z;
  advanceGameState(state, {
    moveForward: 1,
    moveStrafe: 0,
    lookYaw: 0,
    lookPitch: 0,
    fire: false,
    altFire: false,
    use: false,
    sprint: false,
    weaponIndex: null,
    nextWeapon: false,
    prevWeapon: false
  }, 16);
  assert.ok(state.player.x !== startX || state.player.z !== startZ);
  assert.ok(state.replay.events.some((event) => event.type === 'input'));
});
