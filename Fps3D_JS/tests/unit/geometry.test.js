import assert from 'node:assert/strict';
import { buildLevelGeometry } from '../../core/render/geometry.js';
import { openDoor, parseLevelDefinition } from '../../core/world/level.js';
import { LEVEL_ALPHA01 } from '../../data/levels/alpha01.js';

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

runCase('buildLevelGeometry creates floor, ceiling, and wall meshes for sector levels', () => {
  const level = parseLevelDefinition(LEVEL_ALPHA01);
  const geometry = buildLevelGeometry(level);

  assert.ok(geometry.floor.positions.length > 0);
  assert.ok(geometry.ceiling.positions.length > 0);
  assert.ok(geometry.wall.positions.length > 0);
  assert.ok(geometry.wall.indices.length > 0);
});

runCase('open doors are removed from brush wall geometry', () => {
  const level = parseLevelDefinition(DOOR_LEVEL);
  const closedGeometry = buildLevelGeometry(level);
  const closedWallIndices = closedGeometry.wall.indices.length;

  openDoor(level, 'center-door');

  const openGeometry = buildLevelGeometry(level);
  assert.ok(openGeometry.wall.indices.length < closedWallIndices);
});
