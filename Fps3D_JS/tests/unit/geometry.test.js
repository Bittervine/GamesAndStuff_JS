import assert from 'node:assert/strict';
import { buildLevelGeometry } from '../../core/render/geometry.js';
import { parseLevelDefinition } from '../../core/world/level.js';
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

runCase('buildLevelGeometry creates floor, ceiling, and wall meshes for sector levels', () => {
  const level = parseLevelDefinition(LEVEL_ALPHA01);
  const geometry = buildLevelGeometry(level);

  assert.ok(geometry.floor.positions.length > 0);
  assert.ok(geometry.ceiling.positions.length > 0);
  assert.ok(geometry.wall.positions.length > 0);
  assert.ok(geometry.wall.indices.length > 0);
});

