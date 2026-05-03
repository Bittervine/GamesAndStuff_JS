import { normalizeSeed } from '../random/seededRng.js';

export const REPLAY_VERSION = 1;

function stableClone(value) {
  if (Array.isArray(value)) {
    return value.map((item) => stableClone(item));
  }

  if (value && typeof value === 'object') {
    const cloned = {};
    const keys = Object.keys(value).sort();

    for (const key of keys) {
      cloned[key] = stableClone(value[key]);
    }

    return cloned;
  }

  return value;
}

function normalizeTime(time) {
  if (!Number.isFinite(time) || time < 0) {
    throw new RangeError('event time must be a non-negative finite number');
  }

  return Number(time);
}

export function normalizeReplayEvent(event) {
  if (!event || typeof event !== 'object') {
    throw new TypeError('event must be an object');
  }

  if (typeof event.type !== 'string' || event.type.length === 0) {
    throw new TypeError('event.type must be a non-empty string');
  }

  const normalized = {
    t: normalizeTime(event.t ?? 0),
    type: event.type
  };

  if (Object.prototype.hasOwnProperty.call(event, 'data')) {
    normalized.data = stableClone(event.data);
  }

  return normalized;
}

export function normalizeReplayCapture(capture) {
  if (!capture || typeof capture !== 'object') {
    throw new TypeError('capture must be an object');
  }

  const version = Number(capture.version ?? REPLAY_VERSION);

  if (version !== REPLAY_VERSION) {
    throw new RangeError(`unsupported replay version: ${version}`);
  }

  const normalized = {
    version: REPLAY_VERSION,
    seed: normalizeSeed(capture.seed ?? 0),
    fixedStepMs: normalizeTime(capture.fixedStepMs ?? 16),
    meta: stableClone(capture.meta ?? {}),
    events: []
  };

  if (Array.isArray(capture.events)) {
    normalized.events = capture.events.map((event) => normalizeReplayEvent(event));
  }

  return normalized;
}

export function createReplayCapture(options = {}) {
  return normalizeReplayCapture({
    version: REPLAY_VERSION,
    seed: options.seed ?? 0,
    fixedStepMs: options.fixedStepMs ?? 16,
    meta: options.meta ?? {},
    events: []
  });
}

export function appendReplayEvent(capture, event) {
  if (!capture || typeof capture !== 'object') {
    throw new TypeError('capture must be an object');
  }

  if (!Array.isArray(capture.events)) {
    capture.events = [];
  }

  capture.events.push(normalizeReplayEvent(event));
  return capture;
}

export function serializeReplayCapture(capture) {
  return JSON.stringify(normalizeReplayCapture(capture), null, 2);
}

export function parseReplayCapture(text) {
  return normalizeReplayCapture(JSON.parse(text));
}
