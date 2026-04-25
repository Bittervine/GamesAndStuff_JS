import assert from 'node:assert/strict';
import { castGridRay, castWorldRay, intersectRayCircle, hasLineOfSight } from '../../core/world/raycast.js';
import { parseLevelDefinition } from '../../core/world/level.js';

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

runCase('castGridRay hits the closest wall', () => {
  const level = parseLevelDefinition({
    id: 'tiny',
    rows: [
      '#####',
      '#...#',
      '#...#',
      '#####'
    ]
  });

  const ray = castGridRay(level, 1.5, 1.5, 1, 0, 16);
  assert.equal(ray.hit, true);
  assert.ok(ray.distance > 1.0);
  assert.equal(ray.cellX, 4);
});

runCase('intersectRayCircle finds a forward hit and ignores a miss', () => {
  const hit = intersectRayCircle(0, 0, 1, 0, 3, 0, 0.5, 10);
  const miss = intersectRayCircle(0, 0, 1, 0, 0, 3, 0.5, 10);
  assert.ok(hit !== null);
  assert.equal(miss, null);
});

runCase('hasLineOfSight respects walls', () => {
  const level = parseLevelDefinition({
    id: 'tiny',
    rows: [
      '#####',
      '#...#',
      '#.#.#',
      '#...#',
      '#####'
    ]
  });

  assert.equal(hasLineOfSight(level, 1.5, 1.5, 3.5, 1.5, 16), true);
  assert.equal(hasLineOfSight(level, 1.5, 1.5, 3.5, 2.5, 16), false);
});

runCase('castWorldRay hits angled sector walls', () => {
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

  const ray = castWorldRay(level, 1.5, 1, 1, 1, 10);
  assert.equal(ray.hit, true);
  assert.ok(Math.abs(ray.pointX - 3.25) < 0.25);
  assert.ok(Math.abs(ray.pointZ - 2.75) < 0.25);
  assert.equal(hasLineOfSight(level, 1.5, 1, 4, 4, 10), false);
});
