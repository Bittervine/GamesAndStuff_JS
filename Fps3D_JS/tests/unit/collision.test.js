import assert from 'node:assert/strict';
import { moveCircle, isCircleBlocked } from '../../core/world/collision.js';
import { openDoor, parseLevelDefinition } from '../../core/world/level.js';

const DOOR_LEVEL = {
  id: 'door-test',
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
      edge: {
        sectorId: 'left',
        edgeIndex: 1
      }
    }
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

runCase('isCircleBlocked detects wall contact', () => {
  const level = parseLevelDefinition({
    id: 'tiny',
    rows: [
      '#####',
      '#...#',
      '#...#',
      '#####'
    ]
  });

  assert.equal(isCircleBlocked(level, 1.5, 1.5, 0.2), false);
  assert.equal(isCircleBlocked(level, 0.2, 0.2, 0.2), true);
});

runCase('moveCircle slides along the open axis and stops at walls', () => {
  const level = parseLevelDefinition({
    id: 'tiny',
    rows: [
      '#####',
      '#...#',
      '#...#',
      '#####'
    ]
  });

  const moved = moveCircle(level, 1.5, 1.5, 0.2, -1.0, 0.0);
  assert.ok(moved.x >= 1.2);
  assert.equal(moved.z, 1.5);
});

runCase('brush geometry blocks movement against angled walls', () => {
  const level = parseLevelDefinition({
    id: 'angled',
    sectors: [
      {
        id: 'diamond',
        loop: [
          [2, 0],
          [4, 2],
          [2, 4],
          [0, 2]
        ],
        floor: 0,
        ceiling: 3
      }
    ],
    spawn: { x: 2, z: 2, yaw: 0 }
  });

  assert.equal(isCircleBlocked(level, 2, 2, 0.2), false);
  assert.equal(isCircleBlocked(level, 0.15, 2, 0.2), true);

  const moved = moveCircle(level, 1, 2, 0.2, -1, 0);
  assert.equal(isCircleBlocked(level, moved.x, moved.z, 0.2), false);
  assert.ok(moved.x > 0.2);
  assert.equal(moved.z, 2);
});

runCase('closed doors block movement until opened', () => {
  const level = parseLevelDefinition(DOOR_LEVEL);

  assert.equal(isCircleBlocked(level, 4, 2, 0.2), true);

  const blockedMove = moveCircle(level, 3.4, 2, 0.2, 0.5, 0);
  assert.ok(blockedMove.x < 3.9);

  openDoor(level, 'center-door');

  assert.equal(isCircleBlocked(level, 4, 2, 0.2), false);

  const openMove = moveCircle(level, 3.4, 2, 0.2, 0.5, 0);
  assert.ok(openMove.x > 3.85);
});
