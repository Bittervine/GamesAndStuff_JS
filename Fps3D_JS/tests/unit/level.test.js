import assert from 'node:assert/strict';
import { parseLevelDefinition, getCell, isSolidCell, findSectorAtPoint, getFloorHeightAt, getThemeAt } from '../../core/world/level.js';
import { LEVEL_ALPHA01 } from '../../data/levels/alpha01.js';

const LOW_CLEARANCE_LEVEL = {
  id: 'low-clearance',
  sectors: [
    {
      id: 'tight-room',
      loop: [
        [0, 0],
        [4, 0],
        [4, 4],
        [0, 4]
      ],
      floor: 0,
      ceiling: 1.4
    }
  ]
};

const TIGHT_PORTAL_LEVEL = {
  id: 'tight-portal',
  sectors: [
    {
      id: 'left',
      loop: [
        [0, 0],
        [4, 0],
        [4, 4],
        [0, 4]
      ],
      floor: 0,
      ceiling: 3.0,
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
      floor: 1.6,
      ceiling: 3.7,
      portals: [
        { edge: 3, to: 'left' }
      ]
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

runCase('parseLevelDefinition extracts spawn, pickups, enemies, and exit', () => {
  const level = parseLevelDefinition(LEVEL_ALPHA01);
  assert.equal(level.id, 'alpha01');
  assert.ok(level.width > 0);
  assert.ok(level.height > 0);
  assert.ok(level.spawn.x > 0);
  assert.ok(level.exit);
  assert.equal(level.sectors.length, 22);
  assert.equal(level.diagnostics.length, 0);
  assert.equal(level.theme, 'tech');
  assert.ok(level.walls.length >= 30);
  assert.ok(level.width >= 120);
  assert.ok(level.height >= 160);
  assert.ok(findSectorAtPoint(level, level.spawn.x, level.spawn.z));
  assert.ok(Math.abs(getFloorHeightAt(level, level.spawn.x, level.spawn.z)) < 0.001);
  assert.equal(getThemeAt(level, level.spawn.x, level.spawn.z), 'tech');
  assert.ok(level.sectors.some((sector) => sector.floorSurface.base > 1));
  assert.ok(level.sectors.some((sector) => Math.abs(sector.floorSurface.slopeX) > 0 || Math.abs(sector.floorSurface.slopeZ) > 0));
  assert.ok(getFloorHeightAt(level, 40, 6) > getFloorHeightAt(level, level.spawn.x, level.spawn.z));
  assert.ok(getFloorHeightAt(level, 80, 36) > getFloorHeightAt(level, level.spawn.x, level.spawn.z));
  assert.ok(level.sectors.some((sector) => sector.theme === 'tech'));
  assert.ok(level.sectors.some((sector) => sector.theme === 'industrial'));
  assert.ok(level.sectors.some((sector) => sector.theme === 'hell'));
  assert.ok(level.sectors.some((sector) => /stone/i.test(sector.floorMaterial)));
  assert.ok(level.sectors.some((sector) => /organic/i.test(sector.wallMaterial)));
  assert.ok(level.sectors.some((sector) => /emissive/i.test(sector.ceilingMaterial)));
  assert.ok(level.sectors.some((sector) => /liquid/i.test(sector.floorMaterial)));
  assert.equal(level.sectors.filter((sector) => sector.id.startsWith('maze-')).length, 9);
  assert.ok(level.sectors.some((sector) => sector.id === 'maze-core'));
  assert.ok(level.sectors.some((sector) => sector.id === 'maze-stair-3'));
  assert.ok(level.enemySpawns.length >= 5);
  assert.ok(level.pickups.length >= 5);
  assert.ok(level.props.length >= 10);
  assert.ok(level.lights.length >= 8);
  assert.ok(level.decals.length >= 8);
  assert.ok(level.props.some((prop) => prop.kind === 'console'));
  assert.ok(level.props.some((prop) => prop.kind === 'column'));
  assert.ok(level.lights.some((light) => light.pulse > 0));
  assert.ok(level.decals.some((decal) => decal.kind === 'warning'));
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

runCase('parseLevelDefinition reports insufficient sector clearance', () => {
  const level = parseLevelDefinition(LOW_CLEARANCE_LEVEL);
  assert.ok(level.diagnostics.some((issue) => issue.type === 'insufficientClearance' && issue.sectorId === 'tight-room'));
});

runCase('parseLevelDefinition reports insufficient portal clearance', () => {
  const level = parseLevelDefinition(TIGHT_PORTAL_LEVEL);
  assert.ok(level.diagnostics.some((issue) => issue.type === 'insufficientPortalClearance' && issue.sectorId === 'left' && issue.neighborSectorId === 'right'));
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
