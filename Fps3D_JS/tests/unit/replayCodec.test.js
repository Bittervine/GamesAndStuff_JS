import assert from 'node:assert/strict';
import {
  appendReplayEvent,
  createReplayCapture,
  normalizeReplayCapture,
  parseReplayCapture,
  serializeReplayCapture
} from '../../core/replay/replayCodec.js';

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

runCase('replay capture serializes and parses deterministically', () => {
  const capture = createReplayCapture({
    seed: 'debug-seed',
    fixedStepMs: 16,
    meta: {
      difficulty: 'normal',
      mapId: 'E1M1',
      buildVersion: 'dev'
    }
  });

  appendReplayEvent(capture, {
    t: 0,
    type: 'input',
    data: {
      key: 'W',
      pressed: true
    }
  });

  appendReplayEvent(capture, {
    t: 16,
    type: 'trace',
    data: {
      event: 'spawn',
      entityId: 7
    }
  });

  const normalized = normalizeReplayCapture(capture);
  const text = serializeReplayCapture(capture);
  const parsed = parseReplayCapture(text);

  assert.deepEqual(parsed, normalized);
});

runCase('replay metadata is normalized to stable key order', () => {
  const left = serializeReplayCapture({
    version: 1,
    seed: 1,
    fixedStepMs: 16,
    meta: { z: 3, a: 1, m: 2 },
    events: []
  });

  const right = serializeReplayCapture({
    version: 1,
    seed: 1,
    fixedStepMs: 16,
    meta: { a: 1, m: 2, z: 3 },
    events: []
  });

  assert.equal(left, right);
});
