import assert from 'node:assert/strict';
import { createFixedStepAccumulator, normalizeElapsedMs, runFixedStep } from '../../core/sim/fixedStep.js';

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

runCase('runFixedStep applies the update the requested number of times', () => {
  const result = runFixedStep(
    { hp: 10 },
    3,
    16,
    (state, stepMs, stepIndex) => ({
      hp: state.hp - 1,
      lastStepMs: stepMs,
      lastStepIndex: stepIndex
    })
  );

  assert.deepEqual(result, { hp: 7, lastStepMs: 16, lastStepIndex: 2 });
});

runCase('fixed step accumulator converts elapsed time into deterministic steps', () => {
  const accumulator = createFixedStepAccumulator(16);

  assert.equal(accumulator.add(10), 0);
  assert.equal(accumulator.remainderMs, 10);
  assert.equal(accumulator.add(10), 1);
  assert.equal(accumulator.remainderMs, 4);
  assert.equal(accumulator.add(28), 2);
  assert.equal(accumulator.remainderMs, 0);
});

runCase('normalizeElapsedMs clamps invalid and oversized frame deltas', () => {
  assert.equal(normalizeElapsedMs(-1), 0);
  assert.equal(normalizeElapsedMs(Number.NaN), 0);
  assert.equal(normalizeElapsedMs(12), 12);
  assert.equal(normalizeElapsedMs(250), 100);
  assert.equal(normalizeElapsedMs(250, 33), 33);
});
