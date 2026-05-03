export function createVec3(x = 0, y = 0, z = 0) {
  return [x, y, z];
}

export function setVec3(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}

export function copyVec3(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}

export function addVec3(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}

export function subtractVec3(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}

export function scaleVec3(out, a, scalar) {
  out[0] = a[0] * scalar;
  out[1] = a[1] * scalar;
  out[2] = a[2] * scalar;
  return out;
}

export function lengthSqVec3(a) {
  return a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
}

export function lengthVec3(a) {
  return Math.hypot(a[0], a[1], a[2]);
}

export function normalizeVec3(out, a) {
  const len = lengthVec3(a);
  if (!len) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
  }

  const inv = 1 / len;
  out[0] = a[0] * inv;
  out[1] = a[1] * inv;
  out[2] = a[2] * inv;
  return out;
}

export function dotVec3(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function crossVec3(out, a, b) {
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const bx = b[0];
  const by = b[1];
  const bz = b[2];

  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}

export function lerpVec3(out, a, b, t) {
  out[0] = a[0] + (b[0] - a[0]) * t;
  out[1] = a[1] + (b[1] - a[1]) * t;
  out[2] = a[2] + (b[2] - a[2]) * t;
  return out;
}
