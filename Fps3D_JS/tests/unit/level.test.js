import assert from 'node:assert/strict';
import { parseLevelDefinition, getCell, isSolidCell, findSectorAtPoint, getFloorHeightAt } from '../../core/world/level.js';
import { LEVEL_ALPHA01 } from '../../data/levels/alpha01.js';

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

runCase('parseLevelDefinition extracts spawn, pickups, enemies, and exit', () => {
  const level = parseLevelDefinition(LEVEL_ALPHA01);
  assert.equal(level.id, 'alpha01');
  assert.ok(level.width > 0);
  assert.ok(level.height > 0);
  assert.ok(level.spawn.x > 0);
  assert.ok(level.exit);
  assert.equal(level.sectors.length, 13);
  assert.equal(level.diagnostics.length, 0);
  assert.ok(level.walls.length >= 30);
  assert.ok(level.width >= 90);
  assert.ok(level.height >= 74);
  assert.ok(findSectorAtPoint(level, level.spawn.x, level.spawn.z));
  assert.ok(Math.abs(getFloorHeightAt(level, level.spawn.x, level.spawn.z)) < 0.001);
  assert.ok(level.enemySpawns.length >= 5);
  assert.ok(level.pickups.length >= 5);
  assert.ok(level.sectors.some((sector) => sector.loop.length === 5));
  assert.ok(level.sectors.some((sector) => sector.loop.length >= 7));
  assert.ok(level.sectors.some((sector) => sector.edges.some((edge) => edge.ax !== edge.bx && edge.az !== edge.bz)));
});

runCase('parseLevelDefinition reports self-intersecting brush loops', () => {
  const level = parseLevelDefinition({
    id: 'bad-geometry',
    sectors: [
      {
        id: 'bowtie',
        loop: [
          [0, 0],
          [4, 4],
          [0, 4],
          [4, 0]
        ]
      }
    ]
  });

  assert.ok(level.diagnostics.some((issue) => issue.type === 'selfIntersectingLoop' && issue.sectorId === 'bowtie'));
  assert.ok(level.diagnostics.some((issue) => issue.type === 'nonConvexLoop' && issue.sectorId === 'bowtie'));
});

runCase('parseLevelDefinition reports zero-length edges', () => {
  const level = parseLevelDefinition({
    id: 'flatline',
    sectors: [
      {
        id: 'needle',
        loop: [
          [0, 0],
          [4, 0],
          [4, 0],
          [0, 4]
        ]
      }
    ]
  });

  assert.ok(level.diagnostics.some((issue) => issue.type === 'zeroLengthEdge' && issue.sectorId === 'needle'));
});

runCase('parseLevelDefinition registers door edges on brush levels', () => {
  const level = parseLevelDefinition({
    id: 'door-test',
    name: 'Door Test',
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
  });

  assert.equal(level.doors.length, 1);
  assert.equal(level.doorById.get('center-door').open, false);
  assert.equal(level.doors[0].edges[0].sectorId, 'left');
  assert.equal(level.doors[0].edges[0].edgeIndex, 1);
  assert.ok(level.walls.some((wall) => wall.doorId === 'center-door'));
});

runCase('getCell returns walls outside the map and inside tiles', () => {
  const level = parseLevelDefinition({
    id: 'tiny',
    rows: [
      '###',
      '#P#',
      '###'
    ]
  });

  assert.equal(getCell(level, -1, -1), '#');
  assert.equal(getCell(level, 1, 1), '.');
  assert.equal(isSolidCell(level, 0, 0), true);
  assert.equal(isSolidCell(level, 1, 1), false);
});
