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
  assert.equal(level.sectors.length, 1);
  assert.ok(level.walls.length >= 8);
  assert.ok(findSectorAtPoint(level, level.spawn.x, level.spawn.z));
  assert.ok(Math.abs(getFloorHeightAt(level, level.spawn.x, level.spawn.z) - (0.02 * level.spawn.x - 0.01 * level.spawn.z)) < 0.2);
  assert.ok(level.enemySpawns.length >= 5);
  assert.ok(level.pickups.length >= 4);
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
