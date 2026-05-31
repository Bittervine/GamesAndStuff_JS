import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createGameState, advanceGameState, playReplayCapture, restoreGameState, snapshotGameState } from '../../core/game/state.js';
import { updateEnemy } from '../../core/combat/enemies.js';
import { sampleGamepadInput } from '../../core/game/input.js';
import { computeTextureAtlasLayout } from '../../core/render/textures.js';
import { getWeaponDef } from '../../data/weapons.js';
import { CHARACTER_PRODUCTION_GUIDE, CHARACTER_STYLE_BIBLE, QUATERNIUS_CHARACTER_IMPORTS, QUATERNIUS_HUMANOID_RIG } from '../../data/characterAssets.js';
import { CHARACTER_ASSET_SPEC, resolveCharacterRigProfile, reviewCharacterAssetAgainstStyleBible, sampleCharacterRigPose, sampleFirstPersonWeaponPose, sampleSkinnedChainVertex, validateCharacterAsset } from '../../core/render/webglRenderer.js';

const PROJECT_ROOT = globalThis.__projectRoot || path.resolve('.');

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

const LOCKED_DOOR_LEVEL = {
  id: 'locked-door-test',
  name: 'Locked Door Test',
  spawn: { x: 1.5, z: 2, yaw: 0 },
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
      locked: true,
      requiredKey: 'yellow',
      edge: {
        sectorId: 'left',
        edgeIndex: 1
      }
    }
  ],
  pickups: [
    {
      kind: 'key',
      key: 'yellow',
      x: 1.6,
      z: 2
    }
  ]
};

const SNAPSHOT_LEVEL = {
  ...LOCKED_DOOR_LEVEL,
  id: 'snapshot-test',
  name: 'Snapshot Test',
  enemySpawns: [
    {
      kind: 'zombie',
      x: 6.4,
      z: 2
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

function listJsFiles(rootDir) {
  const files = [];
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listJsFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
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
  assert.equal(state.buildVersion, 'dev');
  assert.equal(state.replay.meta.buildVersion, 'dev');
  assert.equal(state.difficultyId, 'invulnerable');
  assert.equal(state.difficulty.label, 'Invulnerable');
});

runCase('createGameState resolves the procedural rogue01 factory by level id', () => {
  const state = createGameState({ seed: 'rogue-seed-01', levelId: 'rogue01' });
  assert.equal(state.level.id, 'rogue01');
  assert.equal(state.level.diagnostics.length, 0);
  assert.ok(state.level.sectors.length >= 24);
  assert.ok(state.level.doors.some((door) => door.locked && door.requiredKey === 'yellow'));
  assert.ok(state.level.pickups.some((pickup) => pickup.kind === 'key' && pickup.key === 'yellow'));
  assert.ok(state.enemies.length >= 6);
  assert.ok(state.level.exit);
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
  const state = createGameState({ seed: 123, levelDefinition: DOOR_LEVEL, difficulty: 'hard' });

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

runCase('locked doors require the matching key before opening', () => {
  const state = createGameState({ seed: 123, levelDefinition: LOCKED_DOOR_LEVEL });
  state.player.x = 3.4;
  state.player.z = 2;

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

  assert.equal(state.level.doors[0].open, false);
  assert.ok(state.events.some((event) => event.type === 'doorLocked'));

  state.player.x = 1.6;
  state.player.z = 2;
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
    prevWeapon: false
  }, 16);

  assert.equal(state.player.keys.yellow, true);

  state.player.x = 3.4;
  state.player.z = 2;
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
});

runCase('createGameState loads the training and combat arena levels', () => {
  const training = createGameState({ seed: 123, levelId: 'training01' });
  assert.equal(training.level.id, 'training01');
  assert.equal(training.level.sectors.length, 1);
  assert.ok(training.enemies.length >= 2);
  assert.ok(training.pickups.length >= 2);

  const combat = createGameState({ seed: 123, levelId: 'combat01' });
  assert.equal(combat.level.id, 'combat01');
  assert.equal(combat.level.sectors.length, 2);
  assert.ok(combat.enemies.length >= 8);
  assert.ok(combat.enemies.some((enemy) => enemy.kind === 'boss'));
  assert.ok(combat.pickups.length >= 5);
});

runCase('advanceGameState completes a level when the exit is reached', () => {
  const state = createGameState({ seed: 123, levelId: 'alpha01' });
  state.enemies.length = 0;
  state.player.x = state.level.exit.x;
  state.player.z = state.level.exit.z;

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
    prevWeapon: false
  }, 16);

  assert.equal(state.completed, true);
  assert.ok(state.events.some((event) => event.type === 'levelCompleted'));
});

runCase('playReplayCapture reproduces a locked-door run from recorded inputs', () => {
  const neutralInput = {
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

  const state = createGameState({ seed: 123, levelDefinition: LOCKED_DOOR_LEVEL });
  const walkForward = { ...neutralInput, moveForward: 1 };

  for (let index = 0; index < 31; index += 1) {
    advanceGameState(state, walkForward, 16);
  }
  advanceGameState(state, { ...neutralInput, use: true }, 16);

  const playback = playReplayCapture(state.replay, { levelDefinition: LOCKED_DOOR_LEVEL });

  assert.equal(playback.player.keys.yellow, true);
  assert.equal(playback.level.doors[0].open, true);
  assert.equal(playback.tick, state.tick);
  assert.equal(playback.timeMs, state.timeMs);
  assert.ok(Math.abs(playback.player.x - state.player.x) < 1e-9);
  assert.ok(Math.abs(playback.player.z - state.player.z) < 1e-9);
  assert.equal(playback.replay.events.filter((event) => event.type === 'input').length, state.replay.events.filter((event) => event.type === 'input').length);
});

runCase('playReplayCapture reproduces a combat encounter from recorded inputs', () => {
  const neutralInput = {
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

  const state = createGameState({ seed: 123, levelId: 'combat01' });
  const fireInput = { ...neutralInput, fire: true };

  for (let index = 0; index < 24; index += 1) {
    advanceGameState(state, fireInput, 16);
  }

  assert.ok(state.replay.events.some((event) => event.type === 'hitEnemy'));

  const playback = playReplayCapture(state.replay, { levelId: 'combat01' });

  assert.equal(playback.player.health, state.player.health);
  assert.equal(playback.player.armor, state.player.armor);
  assert.equal(playback.enemies.length, state.enemies.length);
  assert.equal(playback.enemies[0].hp, state.enemies[0].hp);
  assert.equal(playback.player.kills, state.player.kills);
  assert.equal(playback.tick, state.tick);
  assert.equal(playback.timeMs, state.timeMs);
});

runCase('snapshotGameState round-trips a running simulation exactly', () => {
  const neutralInput = {
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

  const state = createGameState({ seed: 123, levelDefinition: SNAPSHOT_LEVEL });

  state.player.x = 1.6;
  state.player.z = 2;
  advanceGameState(state, neutralInput, 16);

  state.player.x = 3.4;
  state.player.z = 2;
  advanceGameState(state, { ...neutralInput, use: true }, 16);

  advanceGameState(state, { ...neutralInput, moveForward: 1 }, 16);
  advanceGameState(state, { ...neutralInput, moveForward: 1, fire: true }, 16);

  const snapshot = snapshotGameState(state);
  const restored = restoreGameState(snapshot);

  assert.deepEqual(snapshotGameState(restored), snapshot);

  advanceGameState(state, { ...neutralInput, moveForward: 1, fire: true }, 16);
  advanceGameState(restored, { ...neutralInput, moveForward: 1, fire: true }, 16);

  assert.deepEqual(snapshotGameState(restored), snapshotGameState(state));
});

runCase('structured trace logs gameplay events and snapshot lifecycle', () => {
  const neutralInput = {
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

  const state = createGameState({ seed: 123, levelDefinition: SNAPSHOT_LEVEL });

  state.player.x = 1.6;
  state.player.z = 2;
  advanceGameState(state, neutralInput, 16);

  state.player.x = 3.4;
  state.player.z = 2;
  advanceGameState(state, { ...neutralInput, use: true }, 16);

  state.player.x = 5.2;
  state.player.z = 2;
  state.enemies[0].x = 5.7;
  state.enemies[0].z = 2;
  state.enemies[0].hp = 1;
  advanceGameState(state, { ...neutralInput, fire: true }, 16);

  const snapshot = snapshotGameState(state);
  const restored = restoreGameState(snapshot, { levelDefinition: SNAPSHOT_LEVEL });

  const traceTypes = state.trace.map((entry) => entry.type);
  assert.ok(traceTypes.includes('levelLoaded'));
  assert.ok(traceTypes.includes('enemySpawn'));
  assert.ok(traceTypes.includes('pickupCollected'));
  assert.ok(traceTypes.includes('doorOpened'));
  assert.ok(traceTypes.includes('fireWeapon'));
  assert.ok(traceTypes.includes('hitEnemy'));
  assert.ok(traceTypes.includes('enemyDied'));
  assert.ok(traceTypes.includes('stateSaved'));
  assert.ok(restored.trace.some((entry) => entry.type === 'stateLoaded'));
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
  assert.ok(hard.player.damageFlashMs > 0);
  assert.equal(hard.difficultyId, 'hard');
});

runCase('player respawns after death and returns to the spawn point', () => {
  const neutralInput = {
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

  const state = createGameState({ seed: 123, levelDefinition: DOOR_LEVEL, difficulty: 'hard' });
  state.player.x = 6.25;
  state.player.z = 3.25;
  state.player.armor = 0;
  state.player.invulnMs = 0;

  state.damagePlayer(999, 'unit-test');
  assert.equal(state.player.dead, true);
  assert.ok(state.player.respawnMs > 0);
  assert.ok(state.replay.events.some((event) => event.type === 'playerDied'));

  advanceGameState(state, neutralInput, 1000);
  assert.equal(state.player.dead, true);
  assert.ok(state.player.respawnMs > 0);

  advanceGameState(state, neutralInput, 600);
  assert.equal(state.player.dead, false);
  assert.equal(state.player.health, 100);
  assert.equal(state.player.armor, 25);
  assert.equal(state.player.weaponCooldownMs, 0);
  assert.ok(Math.abs(state.player.x - DOOR_LEVEL.spawn.x) < 1e-9);
  assert.ok(Math.abs(state.player.z - DOOR_LEVEL.spawn.z) < 1e-9);
  assert.equal(state.player.yaw, DOOR_LEVEL.spawn.yaw ?? 0);
  assert.ok(state.player.invulnMs > 0);
  assert.ok(state.events.some((event) => event.type === 'playerRespawned'));
  assert.ok(state.replay.events.some((event) => event.type === 'playerRespawned'));
});

runCase('core runtime avoids nondeterministic time and random sources', () => {
  const forbiddenPatterns = [
    { pattern: /\bMath\.random\s*\(/, label: 'Math.random()' },
    { pattern: /\bDate\.now\s*\(/, label: 'Date.now()' },
    { pattern: /\bnew\s+Date\s*\(/, label: 'new Date()' },
    { pattern: /\bperformance\.now\s*\(/, label: 'performance.now()' }
  ];

  const offenders = [];
  for (const filePath of listJsFiles(path.join(PROJECT_ROOT, 'core'))) {
    const source = fs.readFileSync(filePath, 'utf8');
    for (const { pattern, label } of forbiddenPatterns) {
      if (pattern.test(source)) {
        offenders.push(`${path.relative(PROJECT_ROOT, filePath)} contains ${label}`);
      }
    }
  }

  assert.equal(offenders.length, 0, offenders.join('\n'));
});

runCase('shared test helpers provide deterministic rng, fake clocks, and fixtures', () => {
  const helpers = globalThis.__testHelpers;
  assert.ok(helpers);

  const left = helpers.createDeterministicRng('helper-seed');
  const right = helpers.createDeterministicRng('helper-seed');
  assert.equal(left.nextUint32(), right.nextUint32());
  assert.equal(left.nextUint32(), right.nextUint32());

  const clock = helpers.createFakeClock(100);
  assert.equal(clock.now, 100);
  assert.equal(clock.advance(16), 116);
  assert.equal(clock.set(250), 250);
  assert.equal(clock.now, 250);

  const planText = helpers.loadFixtureText('IMPLEMENTATION_PLAN.md');
  assert.ok(planText.includes('Three.js-based 3D renderer'));

  const packageJson = helpers.loadFixtureJson('package.json');
  assert.equal(packageJson.type, 'module');
  assert.equal(packageJson.private, true);
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
  const aimTarget = { x: 1.4, y: 1.9, z: 2.4 };

  const idle = sampleCharacterRigPose(base, 0, 0.5, 1.5, 0.4, 120, null, { poseState: 'idle' });
  const walk = sampleCharacterRigPose(base, 0, 0.5, 1.5, 0.4, 120, aimTarget, { poseState: 'walk' });
  const attack = sampleCharacterRigPose({ ...base, attackWindupMs: 30, attackWindupTotalMs: 120 }, 0, 0.5, 1.5, 0.4, 120, aimTarget, { poseState: 'attack' });
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
  assert.ok(Number.isFinite(walk.ik.aimYaw));
  assert.ok(walk.ik.lookBlend > idle.ik.lookBlend);
  assert.ok(attack.ik.handReach > idle.ik.handReach);
  assert.ok(walk.ik.leftFootPlant !== walk.ik.rightFootPlant || walk.ik.leftFootLift !== walk.ik.rightFootLift);
});

runCase('validateCharacterAsset enforces the 8.5 humanoid acceptance spec', () => {
  const validAsset = {
    triangleCount: 6200,
    materialCount: 2,
    textures: [
      { width: 1024, height: 1024 }
    ],
    metrics: {
      heightMeters: 1.82,
      headsTall: 7.4,
      shoulderWidthToHeight: 0.28,
      hipWidthToHeight: 0.20,
      armSpanToHeight: 1.01,
      handLengthToHeight: 0.10,
      footLengthToHeight: 0.15,
      kneeHeightToHeight: 0.28,
      elbowHeightToHeight: 0.58
    },
    orthographicPreviews: CHARACTER_ASSET_SPEC.orthographicPreviews,
    animationClips: CHARACTER_ASSET_SPEC.animationClips,
    cleanTopologyZones: CHARACTER_ASSET_SPEC.topologyZones,
    skeleton: {
      name: CHARACTER_ASSET_SPEC.skeleton.name,
      bones: CHARACTER_ASSET_SPEC.skeleton.requiredBones
    },
    deformation: {
      maxFootSlideMeters: 0.025,
      maxFootFloatMeters: 0.01,
      maxStretchRatio: 1.05,
      maxJointCollapseRatio: 0.18
    }
  };
  const accepted = validateCharacterAsset(validAsset);

  assert.equal(accepted.ok, true);
  assert.equal(accepted.targetStyle, 'stylized-realistic');
  assert.equal(accepted.skeleton, 'QuaterniusHumanoidV1');

  const rejected = validateCharacterAsset({
    ...validAsset,
    triangleCount: 9000,
    metrics: {
      ...validAsset.metrics,
      headsTall: 5.8,
      footLengthToHeight: 0.24
    },
    orthographicPreviews: ['front'],
    animationClips: ['idle'],
    cleanTopologyZones: ['shoulders'],
    skeleton: {
      bones: [
        ...CHARACTER_ASSET_SPEC.skeleton.requiredBones.filter((bone) => bone !== 'Head'),
        'GeneratedTail'
      ]
    },
    deformation: {
      maxFootSlideMeters: 0.12,
      maxFootFloatMeters: 0.08,
      maxStretchRatio: 1.24,
      maxJointCollapseRatio: 0.42
    }
  });

  assert.equal(rejected.ok, false);
  assert.ok(rejected.errors.some((error) => error.includes('headsTall')));
  assert.ok(rejected.errors.some((error) => error.includes('missing side orthographic preview')));
  assert.ok(rejected.errors.some((error) => error.includes('missing run animation clip')));
  assert.ok(rejected.errors.some((error) => error.includes('missing skeleton bone Head')));
  assert.ok(rejected.errors.some((error) => error.includes('unexpected skeleton bone GeneratedTail')));
  assert.ok(rejected.errors.some((error) => error.includes('maxFootSlideMeters')));
});

runCase('character production guide defines the style-bible pipeline and approval stages', () => {
  assert.equal(CHARACTER_STYLE_BIBLE, CHARACTER_PRODUCTION_GUIDE.styleBible);
  assert.equal(CHARACTER_PRODUCTION_GUIDE.baseMeshPolicy.approvedBaseModelIds[0], 'quaternius-superhero-male');
  assert.ok(CHARACTER_PRODUCTION_GUIDE.baseMeshPolicy.notes.some((note) => note.includes('anatomical reference')));
  assert.ok(CHARACTER_PRODUCTION_GUIDE.approvalPolicy.requireStageApproval);
  assert.ok(CHARACTER_STYLE_BIBLE.acceptedExamples.length >= 1);
  assert.ok(CHARACTER_STYLE_BIBLE.rejectedExamples.length >= 1);
  assert.ok(CHARACTER_PRODUCTION_GUIDE.reviewStages.some((stage) => stage.id === 'rigging'));
  assert.ok(CHARACTER_PRODUCTION_GUIDE.reviewStages.some((stage) => stage.id === 'animation'));

  const acceptedAsset = {
    triangleCount: 6200,
    materialCount: 2,
    textures: [{ width: 1024, height: 1024 }],
    metrics: {
      heightMeters: 1.82,
      headsTall: 7.4,
      shoulderWidthToHeight: 0.28,
      hipWidthToHeight: 0.20,
      armSpanToHeight: 1.01,
      handLengthToHeight: 0.10,
      footLengthToHeight: 0.15,
      kneeHeightToHeight: 0.28,
      elbowHeightToHeight: 0.58
    },
    orthographicPreviews: CHARACTER_ASSET_SPEC.orthographicPreviews,
    animationClips: CHARACTER_ASSET_SPEC.animationClips,
    cleanTopologyZones: CHARACTER_ASSET_SPEC.topologyZones,
    skeleton: {
      name: CHARACTER_ASSET_SPEC.skeleton.name,
      bones: CHARACTER_ASSET_SPEC.skeleton.requiredBones
    },
    deformation: {
      maxFootSlideMeters: 0.025,
      maxFootFloatMeters: 0.01,
      maxStretchRatio: 1.05,
      maxJointCollapseRatio: 0.18
    }
  };
  const acceptedReview = reviewCharacterAssetAgainstStyleBible(acceptedAsset);
  assert.equal(acceptedReview.decision, 'accepted');
  assert.equal(acceptedReview.needsUserReview, false);
  assert.equal(acceptedReview.acceptedExampleId, 'quaternius-stylized-human-baseline');
  assert.ok(acceptedReview.acceptedExampleScore >= CHARACTER_STYLE_BIBLE.acceptedScoreThreshold);
  assert.equal(acceptedReview.reviewStages.length, CHARACTER_PRODUCTION_GUIDE.reviewStages.length);
  assert.equal(acceptedReview.approvalPolicy.requireStageApproval, true);
  assert.equal(acceptedReview.baseMeshPolicy.approvedBaseModelIds[0], 'quaternius-superhero-male');

  const rejectedReview = reviewCharacterAssetAgainstStyleBible({
    ...acceptedAsset,
    metrics: {
      heightMeters: 1.95,
      headsTall: 5.8,
      shoulderWidthToHeight: 0.19,
      hipWidthToHeight: 0.13,
      armSpanToHeight: 1.18,
      handLengthToHeight: 0.14,
      footLengthToHeight: 0.09,
      kneeHeightToHeight: 0.19,
      elbowHeightToHeight: 0.72
    }
  });
  assert.equal(rejectedReview.decision, 'rejected');
  assert.equal(rejectedReview.needsUserReview, true);
  assert.equal(rejectedReview.rejectedExampleId, 'silhouette-too-slender');
  assert.ok(rejectedReview.rejectedExampleScore >= 0);
  assert.ok(rejectedReview.errors.some((error) => error.includes('headsTall')));
});

runCase('Quaternius imports provide the approved CC0 humanoid foundation', () => {
  assert.equal(QUATERNIUS_CHARACTER_IMPORTS.license, 'CC0-1.0');
  assert.equal(QUATERNIUS_HUMANOID_RIG.name, CHARACTER_ASSET_SPEC.skeleton.name);
  assert.equal(QUATERNIUS_HUMANOID_RIG.bones.length, CHARACTER_ASSET_SPEC.skeleton.requiredBones.length);
  assert.ok(QUATERNIUS_HUMANOID_RIG.bones.includes('pelvis'));
  assert.ok(QUATERNIUS_HUMANOID_RIG.bones.includes('hand_l'));
  assert.ok(QUATERNIUS_HUMANOID_RIG.bones.includes('foot_r'));

  for (const asset of [
    ...QUATERNIUS_CHARACTER_IMPORTS.baseModels,
    ...QUATERNIUS_CHARACTER_IMPORTS.animationLibraries,
    { path: QUATERNIUS_CHARACTER_IMPORTS.licensePath }
  ]) {
    assert.ok(fs.existsSync(path.join(PROJECT_ROOT, asset.path)), `missing ${asset.path}`);
  }

  const base = QUATERNIUS_CHARACTER_IMPORTS.baseModels[0];
  assert.equal(base.status, 'source-reference');
  assert.ok(base.triangleCount > CHARACTER_ASSET_SPEC.performance.maxTriangles);
  assert.ok(base.runtimeNotes.some((note) => note.includes('decimation')));
  const gltf = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, base.path), 'utf8'));
  for (const image of gltf.images || []) {
    assert.ok(fs.existsSync(path.join(PROJECT_ROOT, path.dirname(base.path), image.uri)), `missing texture ${image.uri}`);
  }

  const clips = QUATERNIUS_CHARACTER_IMPORTS.animationLibraries
    .flatMap((library) => library.recommendedEnemyClips);
  assert.ok(clips.includes('Idle_Loop'));
  assert.ok(clips.includes('Death01'));
  assert.ok(clips.includes('Zombie_Walk_Fwd_Loop'));
  assert.ok(clips.includes('Zombie_Scratch'));
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
        proportions: {
          shoulderOffsetScale: 0.32,
          handScale: 0.10
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
  assert.equal(profile.proportions.shoulderOffsetScale, 0.32);
  assert.equal(profile.proportions.handScale, 0.10);
  assert.equal(profile.proportions.footPadDepthScale, 0.18);
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
