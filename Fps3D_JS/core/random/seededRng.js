const DEFAULT_SEED = 0x6d2b79f5;

export function normalizeSeed(seedInput) {
  if (seedInput && typeof seedInput === 'object') {
    if (Object.prototype.hasOwnProperty.call(seedInput, 'state')) {
      return normalizeSeed(seedInput.state);
    }
    if (Object.prototype.hasOwnProperty.call(seedInput, 'seed')) {
      return normalizeSeed(seedInput.seed);
    }
  }

  if (typeof seedInput === 'number' && Number.isFinite(seedInput)) {
    return Math.trunc(seedInput) >>> 0;
  }

  if (typeof seedInput === 'bigint') {
    return Number(seedInput & 0xffffffffn) >>> 0;
  }

  if (typeof seedInput === 'string') {
    return hashStringToUint32(seedInput);
  }

  if (typeof seedInput === 'undefined' || seedInput === null) {
    return DEFAULT_SEED;
  }

  return hashStringToUint32(String(seedInput));
}

export function hashStringToUint32(text) {
  const str = String(text);
  let hash = 0x811c9dc5;

  for (let index = 0; index < str.length; index += 1) {
    hash ^= str.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

export function mixUint32(seedA, seedB) {
  let value = (normalizeSeed(seedA) ^ normalizeSeed(seedB)) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b);
  value ^= value >>> 16;
  return value >>> 0;
}

export function deriveSeed(seedInput, label) {
  return mixUint32(normalizeSeed(seedInput), hashStringToUint32(label));
}

export function createSeededRng(seedInput = DEFAULT_SEED) {
  const rootSeed = normalizeSeed(seedInput) || DEFAULT_SEED;
  let state = rootSeed;

  function nextUint32() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return (value ^ (value >>> 14)) >>> 0;
  }

  function nextFloat() {
    return nextUint32() / 0x100000000;
  }

  function nextInt(maxExclusive) {
    if (!Number.isFinite(maxExclusive) || maxExclusive <= 0) {
      throw new RangeError('maxExclusive must be a positive finite number');
    }

    return Math.floor(nextFloat() * Math.floor(maxExclusive));
  }

  function nextRange(minInclusive, maxExclusive) {
    if (!Number.isFinite(minInclusive) || !Number.isFinite(maxExclusive)) {
      throw new RangeError('range bounds must be finite numbers');
    }

    const start = Math.floor(minInclusive);
    const end = Math.floor(maxExclusive);

    if (end <= start) {
      throw new RangeError('maxExclusive must be greater than minInclusive');
    }

    return start + nextInt(end - start);
  }

  function pick(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return undefined;
    }

    return items[nextInt(items.length)];
  }

  function shuffle(items) {
    if (!Array.isArray(items)) {
      throw new TypeError('shuffle expects an array');
    }

    const copy = items.slice();

    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = nextInt(index + 1);
      const temp = copy[index];
      copy[index] = copy[swapIndex];
      copy[swapIndex] = temp;
    }

    return copy;
  }

  function snapshot() {
    return { seed: rootSeed, state: state >>> 0 };
  }

  function restore(nextSnapshot) {
    if (!nextSnapshot || typeof nextSnapshot !== 'object') {
      throw new TypeError('snapshot object is required');
    }

    if (normalizeSeed(nextSnapshot.seed) !== rootSeed) {
      throw new RangeError('snapshot seed does not match this RNG');
    }

    state = normalizeSeed(nextSnapshot.state);
  }

  function fork(label) {
    return createSeededRng(deriveSeed(rootSeed, label));
  }

  function clone() {
    return createSeededRng(snapshot());
  }

  return Object.freeze({
    seed: rootSeed,
    get state() {
      return state >>> 0;
    },
    nextUint32,
    nextFloat,
    nextInt,
    nextRange,
    pick,
    shuffle,
    fork,
    snapshot,
    restore,
    clone
  });
}
