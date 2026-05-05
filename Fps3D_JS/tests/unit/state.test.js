import assert from 'node:assert/strict';
import { createGameState, advanceGameState } from '../../core/game/state.js';
import { updateEnemy } from '../../core/combat/enemies.js';
import { sampleGamepadInput } from '../../core/game/input.js';
import { computeTextureAtlasLayout } from '../../core/render/textures.js';
import { getWeaponDef } from '../../data/weapons.js';
import { resolveCharacterRigProfile, sampleCharacterRigPose, sampleFirstPersonWeaponPose, sampleSkinnedChainVertex } from '../../core/render/webglRenderer.js';

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
  assert.equal(state.level.sectors.length, 22);
  assert.equal(state.level.diagnostics.length, 0);
  assert.ok(state.level.walls.length >= 30);
  assert.ok(state.level.width >= 120);
  assert.ok(state.level.height >= 160);
  assert.ok(state.level.sectors.some((sector) => sector.id === 'maze-core'));
  assert.ok(state.level.sectors.some((sector) => sector.id === 'maze-stair-3'));
  assert.ok(state.enemies.length >= 11);
  assert.ok(state.pickups.length >= 11);
  assert.ok(state.decals.length >= 8);
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

runCase('sampleCharacterRigPose shares walk, idle, attack, hurt, and death states', () => {
  const base = {
    x: 0,
    z: 0,
    dead: false,
    dyingMs: 0,
    hitFlashMs: 0,
    attackWindupMs: 0,
    attackWindupTotalMs: 0
  };

  const idle = sampleCharacterRigPose(base, 0, 0.5, 1.5, 0.4, 120, null, { poseState: 'idle' });
  const walk = sampleCharacterRigPose(base, 0, 0.5, 1.5, 0.4, 120, null, { poseState: 'walk' });
  const attack = sampleCharacterRigPose({ ...base, attackWindupMs: 30, attackWindupTotalMs: 120 }, 0, 0.5, 1.5, 0.4, 120, null, { poseState: 'attack' });
  const hurt = sampleCharacterRigPose({ ...base, hitFlashMs: 60 }, 0, 0.5, 1.5, 0.4, 120, null, { poseState: 'hurt' });
  const death = sampleCharacterRigPose({ ...base, dead: true, dyingMs: 120 }, 0, 0.5, 1.5, 0.4, 120, null, { poseState: 'death' });

  assert.equal(idle.poseState, 'idle');
  assert.equal(walk.poseState, 'walk');
  assert.equal(attack.poseState, 'attack');
  assert.equal(hurt.poseState, 'hurt');
  assert.equal(death.poseState, 'death');
  assert.ok(attack.attackBlend > 0);
  assert.ok(hurt.hurtBlend > 0);
  assert.ok(death.deathBlend > 0);
  assert.ok(hurt.hurtRecoil > 0);
  assert.ok(death.deathCollapse > hurt.deathCollapse);
  assert.ok(death.spineSlack > hurt.spineSlack);
  assert.ok(death.headHang > hurt.headHang);
  assert.ok(death.bodyHeight < walk.bodyHeight);
  assert.ok(walk.bodyBob !== idle.bodyBob || walk.bodyLean !== idle.bodyLean);
});

runCase('resolveCharacterRigProfile merges data-driven pose, mesh, and weapon overrides', () => {
  const profile = resolveCharacterRigProfile({
    def: {
      model: 'humanoid',
      rig: {
        pose: {
          widthScale: 1.2,
          swingTwistScale: 0.11
        },
        mesh: {
          torso: {
            sides: 12
          },
          arm: {
            jointBulge: 0.14
          }
        },
        weapon: {
          attackReachScale: 0.41,
          model: 'customRifle'
        }
      }
    }
  });

  assert.equal(profile.variant, 'humanoid');
  assert.equal(profile.pose.widthScale, 1.2);
  assert.equal(profile.pose.swingTwistScale, 0.11);
  assert.equal(profile.mesh.torso.sides, 12);
  assert.equal(profile.mesh.arm.jointBulge, 0.14);
  assert.equal(profile.weapon.attackReachScale, 0.41);
  assert.equal(profile.weapon.model, 'customRifle');

  const quadrupedProfile = resolveCharacterRigProfile({
    def: {
      model: 'quadruped'
    }
  });

  assert.equal(quadrupedProfile.variant, 'quadruped');
  assert.equal(quadrupedProfile.pose.leftPhaseOffset, 0);
  assert.ok(quadrupedProfile.pose.rightPhaseOffset > quadrupedProfile.pose.leftPhaseOffset);
});

runCase('sampleSkinnedChainVertex blends joint influences across a shared ring', () => {
  const joints = [
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 2, y: 1, z: 0 }
  ];
  const tangents = [
    { x: 1, y: 0, z: 0 },
    { x: 0.7, y: 0.7, z: 0 },
    { x: 0.3, y: 0.95, z: 0 }
  ];
  const radii = [0.3, 0.42, 0.25];
  const sample = sampleSkinnedChainVertex(joints, tangents, radii, 1.0, {
    skinSpread: 1.3,
    skinMix: 0.65,
    jointBulge: 0.14
  });
  const weightTotal = sample.weights.reduce((sum, weight) => sum + weight, 0);

  assert.ok(sample.weights[0] > 0);
  assert.ok(sample.weights[1] > sample.weights[0]);
  assert.ok(sample.weights[2] > 0);
  assert.ok(sample.point.y > 0);
  assert.ok(sample.radius > radii[1] * 0.95);
  assert.ok(sample.radius < radii[1] * 1.2);
  assert.ok(Math.abs(weightTotal - 1) < 1e-6);
});

runCase('computeTextureAtlasLayout packs packed textures into stable cells', () => {
  const layout = computeTextureAtlasLayout([
    { key: 'entity' },
    { key: 'pickup' },
    { key: 'weapon' },
    { key: 'projectile' },
    { key: 'uiPanel' },
    { key: 'materialEmissive' },
    { key: 'materialDamage' }
  ], {
    cellSize: 256,
    columns: 4,
    padding: 4
  });

  assert.equal(layout.width, 1024);
  assert.equal(layout.height, 512);
  assert.equal(layout.entries.length, 7);
  assert.equal(layout.entries[0].key, 'entity');
  assert.equal(layout.entries[4].key, 'uiPanel');
  assert.ok(Math.abs(layout.entries[0].region.offsetX - (4 / 1024)) < 1e-6);
  assert.ok(Math.abs(layout.entries[0].region.scaleX - (248 / 1024)) < 1e-6);
  assert.ok(Math.abs(layout.entries[4].region.offsetY - ((256 + 4) / 512)) < 1e-6);
});

runCase('sampleFirstPersonWeaponPose uses recoil and weapon type to shape the view model', () => {
  const calmState = {
    timeMs: 1200,
    player: {
      x: 2,
      z: 3,
      yaw: 0.2,
      weaponCooldownMs: 0,
      recoilMs: 0,
      recoilKick: 0
    }
  };
  const kickingState = {
    timeMs: 1200,
    player: {
      x: 2,
      z: 3,
      yaw: 0.2,
      weaponCooldownMs: 120,
      recoilMs: 90,
      recoilKick: 0.4
    }
  };

  const pistol = sampleFirstPersonWeaponPose(calmState, getWeaponDef('pistol'));
  const shotgun = sampleFirstPersonWeaponPose(kickingState, getWeaponDef('shotgun'));

  assert.equal(pistol.modelKind, 'pistol');
  assert.equal(shotgun.modelKind, 'shotgun');
  assert.ok(shotgun.offsetZ < pistol.offsetZ);
  assert.ok(shotgun.offsetY < pistol.offsetY);
  assert.ok(shotgun.recoil > pistol.recoil);
  assert.ok(shotgun.ready < pistol.ready);
  assert.ok(shotgun.panelScaleX >= pistol.panelScaleX);
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
