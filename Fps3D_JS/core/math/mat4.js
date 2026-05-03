import { crossVec3, dotVec3, normalizeVec3 } from './vec3.js';

export function createMat4() {
  const out = new Float32Array(16);
  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}

export function identityMat4(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

export function copyMat4(out, a) {
  out.set(a);
  return out;
}

export function mat4Multiply(out, a, b) {
  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a03 = a[3];
  const a10 = a[4];
  const a11 = a[5];
  const a12 = a[6];
  const a13 = a[7];
  const a20 = a[8];
  const a21 = a[9];
  const a22 = a[10];
  const a23 = a[11];
  const a30 = a[12];
  const a31 = a[13];
  const a32 = a[14];
  const a33 = a[15];

  const b00 = b[0];
  const b01 = b[1];
  const b02 = b[2];
  const b03 = b[3];
  const b10 = b[4];
  const b11 = b[5];
  const b12 = b[6];
  const b13 = b[7];
  const b20 = b[8];
  const b21 = b[9];
  const b22 = b[10];
  const b23 = b[11];
  const b30 = b[12];
  const b31 = b[13];
  const b32 = b[14];
  const b33 = b[15];

  out[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
  out[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
  out[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
  out[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;

  out[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
  out[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
  out[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
  out[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;

  out[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
  out[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
  out[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
  out[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;

  out[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
  out[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
  out[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
  out[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

  return out;
}

export function perspectiveMat4(out, fovyRadians, aspect, near, far) {
  const f = 1 / Math.tan(fovyRadians / 2);
  const nf = 1 / (near - far);

  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = 2 * far * near * nf;
  out[15] = 0;
  return out;
}

export function lookAtMat4(out, eye, target, up) {
  const z = [eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]];
  normalizeVec3(z, z);

  const x = [0, 0, 0];
  crossVec3(x, up, z);
  normalizeVec3(x, x);

  const y = [0, 0, 0];
  crossVec3(y, z, x);

  out[0] = x[0];
  out[1] = y[0];
  out[2] = z[0];
  out[3] = 0;
  out[4] = x[1];
  out[5] = y[1];
  out[6] = z[1];
  out[7] = 0;
  out[8] = x[2];
  out[9] = y[2];
  out[10] = z[2];
  out[11] = 0;
  out[12] = -dotVec3(x, eye);
  out[13] = -dotVec3(y, eye);
  out[14] = -dotVec3(z, eye);
  out[15] = 1;
  return out;
}

export function translationMat4(out, x, y, z) {
  identityMat4(out);
  out[12] = x;
  out[13] = y;
  out[14] = z;
  return out;
}

export function scaleMat4(out, x, y, z) {
  identityMat4(out);
  out[0] = x;
  out[5] = y;
  out[10] = z;
  return out;
}

export function rotationYMat4(out, radians) {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  identityMat4(out);
  out[0] = c;
  out[2] = -s;
  out[8] = s;
  out[10] = c;
  return out;
}

export function rotationXMat4(out, radians) {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  identityMat4(out);
  out[5] = c;
  out[6] = s;
  out[9] = -s;
  out[10] = c;
  return out;
}

export function fromTranslationRotationScale(out, x, y, z, rotationY, scaleX, scaleY, scaleZ) {
  const c = Math.cos(rotationY);
  const s = Math.sin(rotationY);

  out[0] = c * scaleX;
  out[1] = 0;
  out[2] = -s * scaleX;
  out[3] = 0;
  out[4] = 0;
  out[5] = scaleY;
  out[6] = 0;
  out[7] = 0;
  out[8] = s * scaleZ;
  out[9] = 0;
  out[10] = c * scaleZ;
  out[11] = 0;
  out[12] = x;
  out[13] = y;
  out[14] = z;
  out[15] = 1;
  return out;
}
