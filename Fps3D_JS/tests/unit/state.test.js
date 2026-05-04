import assert from 'node:assert/strict';
import { createGameState, advanceGameState } from '../../core/game/state.js';
import { updateEnemy } from '../../core/combat/enemies.js';
import { sampleGamepadInput } from '../../core/game/input.js';

const DOOR_LEVEL = {
  id: 'door-test',
  name: 'Door Test',
  spawn: { x: 3.4, z: 2, yaw: 0 },
  exit: { x: 7.5, z: 2 },
  sectors: [
    {
      id: 'left',
      loop: [
        [0, 0],
        [4, 0],
        [4, 4],
        [0, 4]
      ],
      portals: [
        { edge: 1, to: 'right' }
      ]
    },
    {
      id: 'right',
      loop: [
        [4, 0],
        [8, 0],
        [8, 4],
        [4, 4]
      ],
      portals: [
        { edge: 3, to: 'left' }
      ]
    }
  ],
  doors: [
    {
      id: 'center-door',
      edge: {
        sectorId: 'left',
        edgeIndex: 1
      }
    }
  ]
};

const DIFFICULTY_LEVEL = {
  id: 'difficulty-test',
  name: 'Difficulty Test',
  rows: [
    'Pz'
  ]
};

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
  assert.equal(state.level.sectors.length, 13);
  assert.equal(state.level.diagnostics.length, 0);
  assert.ok(state.level.walls.length >= 30);
  assert.ok(state.level.width >= 90);
  assert.ok(state.enemies.length >= 8);
  assert.ok(state.pickups.length >= 8);
  assert.ok(state.replay.events.length >= 1);
  assert.equal(state.requestRestart, false);
  assert.ok(state.player.eyeHeight > 1);
  assert.equal(state.difficultyId, 'invulnerable');
  assert.equal(state.difficulty.label, 'Invulnerable');
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

runCase('advanceGameState opens nearby doors when using', () => {
  const state = createGameState({ seed: 123, levelDefinition: DOOR_LEVEL });

  assert.equal(state.level.doors[0].open, false);

  advanceGameState(state, {
    moveForward: 0,
    moveStrafe: 0,
    lookYaw: 0,
    lookPitch: 0,
    fire: false,
    altFire: false,
    use: true,
    sprint: false,
    weaponIndex: null,
    nextWeapon: false,
    prevWeapon: false
  }, 16);

  assert.equal(state.level.doors[0].open, true);
  assert.ok(state.events.some((event) => event.type === 'doorOpened'));
  assert.ok(state.replay.events.some((event) => event.type === 'doorOpened'));
});

runCase('advanceGameState requests a restart when restart is pressed', () => {
  const state = createGameState({ seed: 123, levelId: 'alpha01' });

  advanceGameState(state, {
    moveForward: 0,
    moveStrafe: 0,
    lookYaw: 0,
    lookPitch: 0,
    fire: false,
    altFire: false,
    use: false,
    sprint: false,
    weaponIndex: null,
    nextWeapon: false,
    prevWeapon: false,
    restart: true
  }, 16);

  assert.equal(state.requestRestart, true);
  assert.ok(state.events.some((event) => event.type === 'restartRequested'));
});

runCase('difficulty changes enemy damage and player invulnerability', () => {
  const idleInput = {
    moveForward: 0,
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
  };

  const invulnerable = createGameState({ seed: 123, levelDefinition: DIFFICULTY_LEVEL });
  invulnerable.player.armor = 0;
  advanceGameState(invulnerable, idleInput, 16);
  advanceGameState(invulnerable, idleInput, 240);

  const hard = createGameState({ seed: 123, levelDefinition: DIFFICULTY_LEVEL, difficulty: 'hard' });
  hard.player.armor = 0;
  advanceGameState(hard, idleInput, 16);
  advanceGameState(hard, idleInput, 240);

  assert.equal(invulnerable.player.health, 100);
  assert.ok(hard.player.health < 100);
  assert.equal(hard.difficultyId, 'hard');
});

runCase('enemy bob phase advances for articulated character animation', () => {
  const state = createGameState({ seed: 123, levelId: 'alpha01' });
  const enemy = state.enemies.find((item) => item.def?.model === 'humanoid') || state.enemies[0];
  const before = enemy.bobPhase;

  updateEnemy(state, enemy, 16);

  assert.ok(enemy.bobPhase > before);
});

runCase('sampleGamepadInput maps sticks, triggers, and one-shot buttons', () => {
  const gamepad = {
    connected: true,
    index: 0,
    id: 'Test Pad',
    axes: [0.42, -0.77, 0.31, -0.5],
    buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 }))
  };
  gamepad.buttons[0] = { pressed: true, value: 1 };
  gamepad.buttons[4] = { pressed: true, value: 1 };
  gamepad.buttons[5] = { pressed: true, value: 1 };
  gamepad.buttons[6] = { pressed: true, value: 1 };
  gamepad.buttons[7] = { pressed: true, value: 1 };
  gamepad.buttons[8] = { pressed: true, value: 1 };
  gamepad.buttons[9] = { pressed: true, value: 1 };
  gamepad.buttons[10] = { pressed: true, value: 1 };
  gamepad.buttons[12] = { pressed: true, value: 1 };

  const first = sampleGamepadInput(gamepad, []);
  assert.equal(first.connected, true);
  assert.ok(first.moveForward > 0.7);
  assert.ok(first.moveStrafe > 0.2);
  assert.ok(first.lookYaw > 2.0);
  assert.ok(first.lookPitch > 4.0);
  assert.equal(first.fire, true);
  assert.equal(first.altFire, true);
  assert.equal(first.use, true);
  assert.equal(first.pause, true);
  assert.equal(first.nextWeapon, true);
  assert.equal(first.prevWeapon, true);
  assert.equal(first.restart, true);
  assert.equal(first.sprint, true);

  const second = sampleGamepadInput(gamepad, first.buttons);
  assert.equal(second.use, false);
  assert.equal(second.pause, false);
  assert.equal(second.nextWeapon, false);
  assert.equal(second.prevWeapon, false);
  assert.equal(second.restart, false);
  assert.equal(second.fire, true);
});

runCase('sampleGamepadInput can invert the Y axis', () => {
  const gamepad = {
    connected: true,
    index: 0,
    id: 'Test Pad',
    axes: [0, 0, 0, -0.5],
    buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 }))
  };

  const normal = sampleGamepadInput(gamepad, []);
  const inverted = sampleGamepadInput(gamepad, [], { invertGamepadY: true });

  assert.ok(normal.lookPitch > 0);
  assert.ok(inverted.lookPitch < 0);
});
