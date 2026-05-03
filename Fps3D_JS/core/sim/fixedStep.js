export function normalizeStepMs(stepMs) {
  if (!Number.isFinite(stepMs) || stepMs <= 0) {
    throw new RangeError('stepMs must be a positive finite number');
  }

  return Number(stepMs);
}

export function runFixedStep(state, steps, stepMs, update) {
  if (!Number.isInteger(steps) || steps < 0) {
    throw new RangeError('steps must be a non-negative integer');
  }

  if (typeof update !== 'function') {
    throw new TypeError('update must be a function');
  }

  const normalizedStepMs = normalizeStepMs(stepMs);
  let currentState = state;

  for (let stepIndex = 0; stepIndex < steps; stepIndex += 1) {
    currentState = update(currentState, normalizedStepMs, stepIndex);
  }

  return currentState;
}

export function createFixedStepAccumulator(stepMs) {
  const normalizedStepMs = normalizeStepMs(stepMs);
  let remainderMs = 0;

  return {
    stepMs: normalizedStepMs,
    add(deltaMs) {
      if (!Number.isFinite(deltaMs) || deltaMs < 0) {
        throw new RangeError('deltaMs must be a non-negative finite number');
      }

      remainderMs += deltaMs;
      const steps = Math.floor(remainderMs / normalizedStepMs);
      remainderMs -= steps * normalizedStepMs;
      return steps;
    },
    reset() {
      remainderMs = 0;
    },
    get remainderMs() {
      return remainderMs;
    }
  };
}
