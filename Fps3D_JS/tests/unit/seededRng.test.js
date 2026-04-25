import assert from 'node:assert/strict';
import { createSeededRng, deriveSeed, normalizeSeed } from '../../core/random/seededRng.js';

function sampleSequence(rng) {
  return [rng.nextUint32(), rng.nextFloat(), rng.nextRange(10, 20), rng.pick(['a', 'b', 'c'])];
}

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

runCase('same seed reproduces the same random sequence', () => {
  const left = createSeededRng(123456);
  const right = createSeededRng(123456);

  assert.deepEqual(sampleSequence(left), sampleSequence(right));
});

runCase('forked streams are stable and isolated', () => {
  const root = createSeededRng('level-01');
  const alphaA = root.fork('enemy-alpha');
  const alphaB = root.fork('enemy-alpha');
  const beta = root.fork('enemy-beta');

  assert.deepEqual(sampleSequence(alphaA), sampleSequence(alphaB));
  assert.notDeepEqual(sampleSequence(alphaA), sampleSequence(beta));
});

runCase('snapshot and restore resume from the same point', () => {
  const rng = createSeededRng(99);

  const first = rng.nextUint32();
  const snapshot = rng.snapshot();
  const second = rng.nextUint32();

  rng.restore(snapshot);

  assert.equal(first, sampleSequence(createSeededRng(99))[0]);
  assert.equal(rng.nextUint32(), second);
});

runCase('seed normalization is deterministic for text input', () => {
  assert.equal(normalizeSeed('alpha'), normalizeSeed('alpha'));
  assert.notEqual(normalizeSeed('alpha'), normalizeSeed('beta'));
  assert.equal(deriveSeed('root', 'child'), deriveSeed('root', 'child'));
});
