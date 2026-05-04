import { buildBoxGeometry, buildLevelGeometry, meshToBuffers } from './geometry.js';
import { createMat4, perspectiveMat4, lookAtMat4, fromTranslationRotationScale, identityMat4 } from '../math/mat4.js';

const VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aUV;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

varying vec3 vNormal;
varying vec2 vUV;

void main() {
  vec4 worldPosition = uModel * vec4(aPosition, 1.0);
  vNormal = mat3(uModel) * aNormal;
  vUV = aUV;
  gl_Position = uProjection * uView * worldPosition;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

varying vec3 vNormal;
varying vec2 vUV;

uniform sampler2D uTexture;
uniform vec4 uTint;
uniform vec3 uLightDir;
uniform float uAmbient;

void main() {
  vec3 baseColor = texture2D(uTexture, vUV).rgb * uTint.rgb;
  float diffuse = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
  float lighting = clamp(uAmbient + diffuse * 0.85, 0.15, 1.0);
  gl_FragColor = vec4(baseColor * lighting, uTint.a);
}
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) || 'unknown shader error';
    gl.deleteShader(shader);
    throw new Error(info);
  }
  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const program = gl.createProgram();
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) || 'unknown program link error';
    gl.deleteProgram(program);
    throw new Error(info);
  }
  return program;
}

function createMeshBufferInfo(gl, mesh) {
  const buffers = meshToBuffers(mesh);
  const vertexBuffer = gl.createBuffer();
  const normalBuffer = gl.createBuffer();
  const uvBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, buffers.positions, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, buffers.normals, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, buffers.uvs, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffers.indices, gl.STATIC_DRAW);

  const useUint32 = buffers.indices instanceof Uint32Array;
  if (useUint32 && !gl.getExtension('OES_element_index_uint') && buffers.positions.length / 3 > 65535) {
    throw new Error('WebGL index buffer requires OES_element_index_uint');
  }

  return {
    vertexBuffer,
    normalBuffer,
    uvBuffer,
    indexBuffer,
    indexCount: buffers.indices.length,
    indexType: useUint32 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT
  };
}

function bindMesh(gl, programInfo, meshInfo) {
  gl.bindBuffer(gl.ARRAY_BUFFER, meshInfo.vertexBuffer);
  gl.vertexAttribPointer(programInfo.attribLocations.position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(programInfo.attribLocations.position);

  gl.bindBuffer(gl.ARRAY_BUFFER, meshInfo.normalBuffer);
  gl.vertexAttribPointer(programInfo.attribLocations.normal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(programInfo.attribLocations.normal);

  gl.bindBuffer(gl.ARRAY_BUFFER, meshInfo.uvBuffer);
  gl.vertexAttribPointer(programInfo.attribLocations.uv, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(programInfo.attribLocations.uv);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshInfo.indexBuffer);
}

function hexColorToRgba(color, alpha = 1) {
  if (typeof color !== 'string' || !color.startsWith('#')) {
    return [1, 1, 1, alpha];
  }

  const hex = color.slice(1);
  const value = hex.length === 3
    ? hex.split('').map((part) => part + part).join('')
    : hex;
  const parsed = Number.parseInt(value, 16);
  if (!Number.isFinite(parsed)) {
    return [1, 1, 1, alpha];
  }

  return [
    ((parsed >> 16) & 255) / 255,
    ((parsed >> 8) & 255) / 255,
    (parsed & 255) / 255,
    alpha
  ];
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function easeInOut(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function poseProgress(ms, totalMs) {
  if (!Number.isFinite(ms) || !Number.isFinite(totalMs) || totalMs <= 0) {
    return 0;
  }

  return clamp01(1 - ms / totalMs);
}

function gaitSample(phase) {
  const swing = Math.sin(phase);
  return {
    swing,
    lift: Math.max(0, swing),
    support: Math.max(0, -swing)
  };
}

function resizeCanvasToDisplaySize(canvas, dpr = globalThis.devicePixelRatio || 1) {
  const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
  const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}

function createProgramInfo(gl) {
  const program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
  return {
    program,
    attribLocations: {
      position: gl.getAttribLocation(program, 'aPosition'),
      normal: gl.getAttribLocation(program, 'aNormal'),
      uv: gl.getAttribLocation(program, 'aUV')
    },
    uniformLocations: {
      model: gl.getUniformLocation(program, 'uModel'),
      view: gl.getUniformLocation(program, 'uView'),
      projection: gl.getUniformLocation(program, 'uProjection'),
      texture: gl.getUniformLocation(program, 'uTexture'),
      tint: gl.getUniformLocation(program, 'uTint'),
      lightDir: gl.getUniformLocation(program, 'uLightDir'),
      ambient: gl.getUniformLocation(program, 'uAmbient')
    }
  };
}

export function createWorldRenderer(canvas, textures, options = {}) {
  const gl = options.gl || canvas.getContext('webgl', {
    alpha: false,
    antialias: true,
    depth: true,
    stencil: false,
    preserveDrawingBuffer: false,
    premultipliedAlpha: false
  });

  if (!gl) {
    throw new Error('WebGL is not supported in this browser');
  }

  const programInfo = createProgramInfo(gl);
  const levelGeometryCache = new Map();
  const boxMeshInfo = createMeshBufferInfo(gl, buildBoxGeometry());
  const view = createMat4();
  const projection = createMat4();
  const model = createMat4();
  const tempModel = createMat4();
  const lightDir = options.lightDir || [0.35, 0.9, 0.25];
  let currentGeometryKey = null;
  let currentGeometry = null;

  gl.useProgram(programInfo.program);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.CULL_FACE);
  gl.clearColor(0.15, 0.18, 0.22, 1);
  gl.uniform3fv(programInfo.uniformLocations.lightDir, new Float32Array(lightDir));
  gl.uniform1i(programInfo.uniformLocations.texture, 0);

  function getGeometryKey(level) {
    if (!level) {
      return null;
    }

    return `${level.id}:${Number(level.geometryVersion) || 0}`;
  }

  function ensureLevelGeometry(level) {
    if (!level) {
      return null;
    }

    const geometryKey = getGeometryKey(level);
    if (currentGeometryKey === geometryKey && currentGeometry) {
      return currentGeometry;
    }

    const cached = levelGeometryCache.get(geometryKey);
    if (cached) {
      currentGeometryKey = geometryKey;
      currentGeometry = cached;
      return cached;
    }

    const geometry = buildLevelGeometry(level, options.geometry || {});
    const built = {
      wall: createMeshBufferInfo(gl, geometry.wall),
      floor: createMeshBufferInfo(gl, geometry.floor),
      ceiling: createMeshBufferInfo(gl, geometry.ceiling)
    };

    levelGeometryCache.set(geometryKey, built);
    currentGeometryKey = geometryKey;
    currentGeometry = built;
    return built;
  }

  function drawMesh(meshInfo, texture, tint, ambient) {
    if (!meshInfo || !texture || meshInfo.indexCount <= 0) {
      return;
    }

    bindMesh(gl, programInfo, meshInfo);
    gl.uniformMatrix4fv(programInfo.uniformLocations.model, false, model);
    gl.uniform4fv(programInfo.uniformLocations.tint, new Float32Array(tint));
    gl.uniform1f(programInfo.uniformLocations.ambient, ambient);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.drawElements(gl.TRIANGLES, meshInfo.indexCount, meshInfo.indexType, 0);
  }

  function drawEntityBox(entity, texture, tint, floorHeight, scaleX, scaleY, scaleZ, rotationY) {
    if (!entity) {
      return;
    }

    fromTranslationRotationScale(
      tempModel,
      entity.x,
      floorHeight + scaleY * 0.5,
      entity.z,
      rotationY,
      scaleX,
      scaleY,
      scaleZ
    );
    model.set(tempModel);
    drawMesh(boxMeshInfo, texture, tint, 0.34);
  }

  function rotateLocalOffset(rotationY, localX, localZ) {
    const cos = Math.cos(rotationY);
    const sin = Math.sin(rotationY);
    return {
      x: cos * localX - sin * localZ,
      z: sin * localX + cos * localZ
    };
  }

  function drawBoxPart(entity, texture, tint, floorHeight, rotationY, localX, localY, localZ, scaleX, scaleY, scaleZ, ambient = 0.34) {
    const offset = rotateLocalOffset(rotationY, localX, localZ);
    fromTranslationRotationScale(
      tempModel,
      entity.x + offset.x,
      floorHeight + localY,
      entity.z + offset.z,
      rotationY,
      scaleX,
      scaleY,
      scaleZ
    );
    model.set(tempModel);
    drawMesh(boxMeshInfo, texture, tint, ambient);
  }

function drawLegChain(entity, texture, tint, floorHeight, rotationY, localX, baseZ, stride, lift, limbWidth, footHeight, lowerLegHeight, thighHeight, ambient = 0.31) {
  const footY = footHeight * 0.5 + lift;
  const lowerLegY = footHeight + lowerLegHeight * 0.5 + lift * 0.5;
  const thighY = footHeight + lowerLegHeight + thighHeight * 0.5 + lift * 0.2;
  const footZ = baseZ + stride * 0.35;
  const lowerLegZ = baseZ + stride * 0.18;
  const thighZ = baseZ + stride;

  drawBoxPart(entity, texture, tint, floorHeight, rotationY, localX, footY, footZ, limbWidth * 0.18, footHeight, limbWidth * 0.26, ambient);
  drawBoxPart(entity, texture, tint, floorHeight, rotationY, localX, lowerLegY, lowerLegZ, limbWidth * 0.16, lowerLegHeight, limbWidth * 0.18, ambient);
  drawBoxPart(entity, texture, tint, floorHeight, rotationY, localX, thighY, thighZ, limbWidth * 0.19, thighHeight, limbWidth * 0.20, ambient);
}

function drawArmChain(entity, texture, tint, floorHeight, rotationY, localX, baseZ, reach, lift, limbWidth, handHeight, lowerArmHeight, upperArmHeight, ambient = 0.31) {
  const handY = handHeight * 0.5 + lift;
  const lowerArmY = handHeight + lowerArmHeight * 0.5 + lift * 0.45;
  const upperArmY = handHeight + lowerArmHeight + upperArmHeight * 0.5 + lift * 0.2;
  const handZ = baseZ + reach * 0.38;
  const lowerArmZ = baseZ + reach * 0.2;
  const upperArmZ = baseZ + reach;

  drawBoxPart(entity, texture, tint, floorHeight, rotationY, localX, handY, handZ, limbWidth * 0.14, handHeight, limbWidth * 0.14, ambient);
  drawBoxPart(entity, texture, tint, floorHeight, rotationY, localX, lowerArmY, lowerArmZ, limbWidth * 0.15, lowerArmHeight, limbWidth * 0.16, ambient);
  drawBoxPart(entity, texture, tint, floorHeight, rotationY, localX, upperArmY, upperArmZ, limbWidth * 0.16, upperArmHeight, limbWidth * 0.18, ambient);
}

function drawHeldWeapon(entity, texture, tint, floorHeight, rotationY, localX, localY, localZ, weaponModel, weaponPose, bodyWidth, bodyHeight, bodyDepth) {
  if (!weaponModel) {
    return;
  }

  const ready = easeInOut(clamp01(weaponPose));
  const weaponTint = [
    Math.min(1, tint[0] * 0.74 + 0.16),
    Math.min(1, tint[1] * 0.74 + 0.16),
    Math.min(1, tint[2] * 0.74 + 0.16),
    tint[3]
  ];
  const gripWidth = Math.max(0.05, bodyWidth * 0.09);
  const gripHeight = Math.max(0.08, bodyHeight * 0.18);
  const bodyWidthScale = Math.max(0.08, bodyWidth * 0.16);
  const bodyHeightScale = Math.max(0.10, bodyHeight * 0.12);
  const bodyDepthScale = Math.max(0.12, bodyDepth * 0.25);
  const forward = bodyDepth * (0.10 + ready * 0.28);
  const lift = bodyHeight * (0.03 + ready * 0.04);
  const muzzleZ = localZ + forward;
  const bodyZ = localZ + forward * 0.42;

  if (weaponModel === 'chaingun') {
    drawBoxPart(entity, texture, weaponTint, floorHeight, rotationY, localX, localY + lift * 0.05, localZ + forward * 0.06, bodyWidthScale * 0.8, gripHeight * 0.9, bodyDepthScale * 0.55, 0.24);
    drawBoxPart(entity, texture, weaponTint, floorHeight, rotationY, localX, localY + lift * 0.12, bodyZ, bodyWidthScale * 1.15, bodyHeightScale * 1.05, bodyDepthScale * 1.15, 0.23);
    drawBoxPart(entity, texture, weaponTint, floorHeight, rotationY, localX, localY + lift * 0.10, muzzleZ, bodyWidthScale * 0.70, bodyHeightScale * 0.80, bodyDepthScale * 1.35, 0.22);
    drawBoxPart(entity, texture, weaponTint, floorHeight, rotationY, localX + bodyWidth * 0.03, localY - gripHeight * 0.25, bodyZ * 0.92, bodyWidthScale * 0.55, gripHeight * 0.75, bodyDepthScale * 0.72, 0.21);
    return;
  }

  if (weaponModel === 'caster' || weaponModel === 'orb') {
    const glowTint = [
      Math.min(1, weaponTint[0] * 1.08 + 0.08),
      Math.min(1, weaponTint[1] * 1.08 + 0.08),
      Math.min(1, weaponTint[2] * 1.08 + 0.08),
      weaponTint[3]
    ];
    drawBoxPart(entity, texture, weaponTint, floorHeight, rotationY, localX, localY - gripHeight * 0.02, localZ + forward * 0.12, gripWidth * 0.9, gripHeight * 1.02, bodyDepthScale * 0.55, 0.24);
    drawBoxPart(entity, texture, weaponTint, floorHeight, rotationY, localX, localY + lift * 0.10, bodyZ, bodyWidthScale * 0.85, bodyHeightScale * 0.96, bodyDepthScale * 0.92, 0.22);
    drawBoxPart(entity, texture, glowTint, floorHeight, rotationY, localX, localY + bodyHeight * 0.02, muzzleZ + bodyDepth * 0.05, bodyWidthScale * 0.58, bodyHeightScale * 0.66, bodyDepthScale * 0.58, 0.24);
    return;
  }

  if (weaponModel === 'cannon' || weaponModel === 'bossCannon') {
    drawBoxPart(entity, texture, weaponTint, floorHeight, rotationY, localX, localY + lift * 0.10, localZ + forward * 0.04, gripWidth * 0.95, gripHeight * 0.98, bodyDepthScale * 0.60, 0.25);
    drawBoxPart(entity, texture, weaponTint, floorHeight, rotationY, localX, localY + lift * 0.15, bodyZ, bodyWidthScale * 1.35, bodyHeightScale * 1.10, bodyDepthScale * 1.35, 0.23);
    drawBoxPart(entity, texture, weaponTint, floorHeight, rotationY, localX, localY + lift * 0.12, muzzleZ, bodyWidthScale * 1.00, bodyHeightScale * 0.92, bodyDepthScale * 1.55, 0.22);
    drawBoxPart(entity, texture, weaponTint, floorHeight, rotationY, localX + bodyWidth * 0.05, localY - gripHeight * 0.24, bodyZ * 0.92, bodyWidthScale * 0.60, gripHeight * 0.72, bodyDepthScale * 0.82, 0.21);
    return;
  }

  drawBoxPart(entity, texture, weaponTint, floorHeight, rotationY, localX, localY + lift * 0.04, localZ + forward * 0.08, gripWidth * 0.95, gripHeight * 0.95, bodyDepthScale * 0.56, 0.25);
  drawBoxPart(entity, texture, weaponTint, floorHeight, rotationY, localX, localY + lift * 0.10, bodyZ, bodyWidthScale * 0.96, bodyHeightScale * 0.96, bodyDepthScale * 1.00, 0.24);
  drawBoxPart(entity, texture, weaponTint, floorHeight, rotationY, localX, localY + lift * 0.10, muzzleZ, bodyWidthScale * 0.78, bodyHeightScale * 0.82, bodyDepthScale * 1.22, 0.22);
}

function drawHumanoidCharacter(entity, texture, tint, floorHeight, scaleX, scaleY, scaleZ, rotationY, bobPhase) {
  const deathBlend = entity.dead ? easeInOut(1 - clamp01((entity.dyingMs || 0) / 600)) : 0;
  const attackBlend = entity.attackWindupTotalMs > 0 ? easeInOut(poseProgress(entity.attackWindupMs, entity.attackWindupTotalMs)) : 0;
  const bodyWidth = Math.max(0.2, scaleX);
  const bodyDepth = Math.max(0.2, scaleZ);
  const bodyHeight = Math.max(0.9, scaleY) * (1 - deathBlend * 0.34);
  const cycle = bobPhase * 0.012;
  const leftPhase = cycle - Math.PI * 0.5;
  const rightPhase = leftPhase + Math.PI;
  const leftGait = gaitSample(leftPhase);
  const rightGait = gaitSample(rightPhase);
  const stepLength = bodyDepth * (0.22 + Math.abs(Math.sin(cycle)) * 0.10);
  const stepLift = bodyHeight * (0.08 + attackBlend * 0.03);
  const hipOffset = bodyWidth * 0.22;
  const shoulderOffset = bodyWidth * 0.30;
  const footHeight = bodyHeight * 0.08;
  const lowerLegHeight = bodyHeight * 0.20;
  const thighHeight = bodyHeight * 0.22;
  const pelvisHeight = bodyHeight * 0.12;
  const torsoHeight = bodyHeight * 0.28;
  const neckHeight = bodyHeight * 0.05;
  const headHeight = bodyHeight * 0.16;
  const bodyBob = (Math.abs(Math.sin(cycle)) * bodyHeight * 0.03 + Math.sin(bobPhase * 0.004) * bodyHeight * 0.012) * (1 - deathBlend * 0.55);
  const bodyLean = Math.sin(cycle * 0.5) * bodyWidth * 0.035 + attackBlend * bodyWidth * 0.02 - deathBlend * bodyWidth * 0.05;
  const bodyShift = (leftGait.support - rightGait.support) * bodyWidth * 0.08;
  const stanceBase = footHeight + lowerLegHeight + thighHeight;
  const pelvisY = stanceBase + pelvisHeight * 0.5 + bodyBob * 0.22;
  const torsoY = stanceBase + pelvisHeight + torsoHeight * 0.5 + bodyBob * 0.92;
  const neckY = stanceBase + pelvisHeight + torsoHeight + neckHeight * 0.5 + bodyBob * 1.0;
  const headY = stanceBase + pelvisHeight + torsoHeight + neckHeight + headHeight * 0.5 + bodyBob * 1.02;
  const armLift = attackBlend * bodyHeight * 0.08;
  const armReach = attackBlend * bodyDepth * 0.26;
  const armSwing = Math.sin(cycle) * bodyWidth * 0.10;
  const armSupport = Math.sin(cycle + Math.PI) * bodyWidth * 0.08;
  const weaponModel = entity.def?.weaponModel || (entity.def?.behavior === 'hitscan' ? 'pistol' : entity.def?.behavior === 'projectile' ? 'caster' : entity.def?.behavior === 'boss' ? 'bossCannon' : null);
  const weaponPose = attackBlend;

  drawLegChain(entity, texture, tint, floorHeight, rotationY, -hipOffset + bodyShift, -bodyDepth * 0.03, leftGait.swing * stepLength, leftGait.lift * stepLift, bodyWidth * 0.20, footHeight, lowerLegHeight, thighHeight, 0.32);
  drawLegChain(entity, texture, tint, floorHeight, rotationY, hipOffset + bodyShift, bodyDepth * 0.03, rightGait.swing * stepLength, rightGait.lift * stepLift, bodyWidth * 0.20, footHeight, lowerLegHeight, thighHeight, 0.32);

  drawBoxPart(entity, texture, tint, floorHeight, rotationY, bodyShift * 0.35, pelvisY, bodyLean * 0.25, bodyWidth * 0.52, pelvisHeight, bodyDepth * 0.50, 0.36);
  drawBoxPart(entity, texture, tint, floorHeight, rotationY, bodyShift * 0.28, torsoY, bodyLean, bodyWidth * 0.58, torsoHeight, bodyDepth * 0.54, 0.36);
  drawBoxPart(entity, texture, tint, floorHeight, rotationY, bodyShift * 0.22, neckY, bodyLean * 0.55, bodyWidth * 0.22, neckHeight, bodyDepth * 0.18, 0.34);
  drawBoxPart(entity, texture, tint, floorHeight, rotationY, bodyShift * 0.18, headY, bodyLean * 0.30, bodyWidth * 0.40, headHeight, bodyDepth * 0.40, 0.40);

  drawArmChain(entity, texture, tint, floorHeight, rotationY, -shoulderOffset - bodyShift * 0.15, torsoY - torsoHeight * 0.18, armSupport * 0.85 - armReach * 0.35, armLift * 0.40, bodyWidth * 0.16, bodyHeight * 0.14, bodyHeight * 0.18, bodyHeight * 0.20, 0.31);
  drawArmChain(entity, texture, tint, floorHeight, rotationY, shoulderOffset - bodyShift * 0.10, torsoY - torsoHeight * 0.16, armSwing + armReach, armLift, bodyWidth * 0.16, bodyHeight * 0.14, bodyHeight * 0.18, bodyHeight * 0.20, 0.31);

  drawHeldWeapon(entity, texture, tint, floorHeight, rotationY, shoulderOffset - bodyShift * 0.06, torsoY - torsoHeight * 0.16 + armLift * 0.55, armSwing + armReach * 0.72, weaponModel, weaponPose, bodyWidth, bodyHeight, bodyDepth);
}

function drawQuadrupedCharacter(entity, texture, tint, floorHeight, scaleX, scaleY, scaleZ, rotationY, bobPhase) {
  const deathBlend = entity.dead ? easeInOut(1 - clamp01((entity.dyingMs || 0) / 600)) : 0;
  const bodyWidth = Math.max(0.32, scaleX * 0.92);
  const bodyDepth = Math.max(0.38, scaleZ * 1.08);
  const bodyHeight = Math.max(0.76, scaleY * 0.72) * (1 - deathBlend * 0.36);
  const cycle = bobPhase * 0.015;
  const frontLeft = gaitSample(cycle);
  const frontRight = gaitSample(cycle + Math.PI);
  const rearLeft = gaitSample(cycle + Math.PI);
  const rearRight = gaitSample(cycle);
  const stride = bodyDepth * 0.24;
  const lift = bodyHeight * 0.11;
  const lowerLegHeight = bodyHeight * 0.18;
  const thighHeight = bodyHeight * 0.22;
  const footHeight = bodyHeight * 0.08;
  const torsoHeight = bodyHeight * 0.26;
  const chestHeight = bodyHeight * 0.18;
  const bodyBob = (Math.abs(Math.sin(cycle)) * bodyHeight * 0.04 + Math.sin(bobPhase * 0.0035) * bodyHeight * 0.014) * (1 - deathBlend * 0.55);
  const bodyLean = Math.sin(cycle * 0.45) * bodyWidth * 0.04 + deathBlend * bodyWidth * 0.03;
  const bodyBaseY = footHeight + lowerLegHeight + thighHeight;
  const bodyY = bodyBaseY + torsoHeight * 0.5 + bodyBob * 0.9;
  const chestY = bodyBaseY + torsoHeight + chestHeight * 0.5 + bodyBob * 0.95;
  const neckY = bodyBaseY + torsoHeight + chestHeight + bodyHeight * 0.08;
  const headY = bodyBaseY + torsoHeight + chestHeight + bodyHeight * 0.20 + bodyBob * 0.75;
  const frontX = bodyWidth * 0.30;
  const rearX = bodyWidth * 0.24;
  const frontZ = -bodyDepth * 0.20;
  const rearZ = bodyDepth * 0.24;

  drawBoxPart(entity, texture, tint, floorHeight, rotationY, bodyLean * 0.20, bodyY, 0, bodyWidth * 0.86, torsoHeight, bodyDepth * 0.82, 0.34);
  drawBoxPart(entity, texture, tint, floorHeight, rotationY, bodyLean * 0.34, chestY, bodyDepth * 0.02, bodyWidth * 0.72, chestHeight, bodyDepth * 0.60, 0.33);
  drawBoxPart(entity, texture, tint, floorHeight, rotationY, bodyLean * 0.22, neckY, bodyDepth * 0.22, bodyWidth * 0.38, bodyHeight * 0.12, bodyDepth * 0.28, 0.32);
  drawBoxPart(entity, texture, tint, floorHeight, rotationY, bodyLean * 0.16, headY, bodyDepth * 0.36, bodyWidth * 0.40, bodyHeight * 0.22, bodyDepth * 0.34, 0.36);
  drawBoxPart(entity, texture, tint, floorHeight, rotationY, bodyLean * 0.12, headY + bodyHeight * 0.04, bodyDepth * 0.48, bodyWidth * 0.22, bodyHeight * 0.10, bodyDepth * 0.18, 0.38);

  drawLegChain(entity, texture, tint, floorHeight, rotationY, -frontX, frontZ, frontLeft.swing * stride, frontLeft.lift * lift, bodyWidth * 0.18, footHeight, lowerLegHeight, thighHeight, 0.30);
  drawLegChain(entity, texture, tint, floorHeight, rotationY, frontX, frontZ, frontRight.swing * stride, frontRight.lift * lift, bodyWidth * 0.18, footHeight, lowerLegHeight, thighHeight, 0.30);
  drawLegChain(entity, texture, tint, floorHeight, rotationY, -rearX, rearZ, rearLeft.swing * stride, rearLeft.lift * lift, bodyWidth * 0.17, footHeight, lowerLegHeight, thighHeight, 0.30);
  drawLegChain(entity, texture, tint, floorHeight, rotationY, rearX, rearZ, rearRight.swing * stride, rearRight.lift * lift, bodyWidth * 0.17, footHeight, lowerLegHeight, thighHeight, 0.30);
}

  function render(state) {
    const level = state.level;
    const geometry = ensureLevelGeometry(level);

    resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);

    const sky = parseSkyColor(level.skyColor || '#4d6f96');
    gl.clearColor(sky[0], sky[1], sky[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(programInfo.program);

    const aspect = canvas.width / Math.max(1, canvas.height);
    perspectiveMat4(projection, Math.PI / 3.1, aspect, 0.05, 160);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projection, false, projection);

    const floorHeight = level.getFloorHeightAt ? level.getFloorHeightAt(state.player.x, state.player.z) : 0;
    const eyeHeight = state.player.eyeHeight || 1.58;
    const eye = [state.player.x, floorHeight + eyeHeight, state.player.z];
    const forward = [
      Math.cos(state.player.yaw) * Math.cos(state.player.pitch),
      Math.sin(state.player.pitch),
      Math.sin(state.player.yaw) * Math.cos(state.player.pitch)
    ];
    const target = [eye[0] + forward[0], eye[1] + forward[1], eye[2] + forward[2]];
    lookAtMat4(view, eye, target, [0, 1, 0]);
    gl.uniformMatrix4fv(programInfo.uniformLocations.view, false, view);

    if (geometry) {
      identityMat4(model);
      drawMesh(geometry.floor, textures.floor, [1, 1, 1, 1], 0.86);
      drawMesh(geometry.ceiling, textures.ceiling, [1, 1, 1, 1], 0.52);
      drawMesh(geometry.wall, textures.wall, [1, 1, 1, 1], 0.74);
    }

    for (const enemy of state.enemies) {
      if (enemy.dead && enemy.dyingMs <= 0) {
        continue;
      }
      const tint = hexColorToRgba(enemy.def?.color || '#ff6666', enemy.hitFlashMs > 0 ? 1 : 0.98);
      if (enemy.dead) {
        tint[0] *= 0.68;
        tint[1] *= 0.68;
        tint[2] *= 0.68;
        tint[3] = 0.92;
      }
      const entityFloor = level.getFloorHeightAt ? level.getFloorHeightAt(enemy.x, enemy.z) : 0;
      switch (enemy.def?.model) {
        case 'humanoid':
          drawHumanoidCharacter(enemy, textures.entity, tint, entityFloor, enemy.radius * 2.0, enemy.height, enemy.radius * 1.8, enemy.facing + Math.PI * 0.5, enemy.bobPhase || 0);
          break;
        case 'quadruped':
          drawQuadrupedCharacter(enemy, textures.entity, tint, entityFloor, enemy.radius * 2.2, enemy.height, enemy.radius * 2.1, enemy.facing + Math.PI * 0.5, enemy.bobPhase || 0);
          break;
        case 'floating':
          drawEntityBox(
            enemy,
            textures.entity,
            tint,
            entityFloor + Math.sin((state.timeMs + enemy.id * 91) * 0.004) * 0.09,
            enemy.radius * 2.35,
            enemy.height * 0.92,
            enemy.radius * 2.35,
            enemy.facing + Math.PI * 0.5
          );
          break;
        default:
          drawEntityBox(enemy, textures.entity, tint, entityFloor, enemy.radius * 2.1, enemy.height, enemy.radius * 2.1, enemy.facing + Math.PI * 0.5);
          break;
      }
    }

    for (const pickup of state.pickups) {
      if (pickup.collected) {
        continue;
      }

      const tint = pickup.kind === 'health'
        ? [0.55, 1.0, 0.65, 1]
        : pickup.kind === 'armor'
          ? [0.52, 0.72, 1.0, 1]
          : [1.0, 0.88, 0.48, 1];
      const pickupFloor = level.getFloorHeightAt ? level.getFloorHeightAt(pickup.x, pickup.z) : 0;
      const wobble = Math.sin((state.timeMs + pickup.x * 137 + pickup.z * 53) * 0.004) * 0.08;
      drawEntityBox(pickup, textures.pickup, tint, pickupFloor + wobble, 0.34, 0.34, 0.34, state.timeMs * 0.0012);
    }

    for (const projectile of state.projectiles) {
      const tint = projectile.color ? hexColorToRgba(projectile.color, 1) : [1, 1, 1, 1];
      const projectileFloor = level.getFloorHeightAt ? level.getFloorHeightAt(projectile.x, projectile.z) : 0;
      drawEntityBox(projectile, textures.projectile, tint, projectileFloor + 0.15, projectile.radius * 2.2, projectile.radius * 2.2, projectile.radius * 2.2, state.timeMs * 0.004);
    }
  }

  function dispose() {
    for (const cached of levelGeometryCache.values()) {
      disposeMeshInfo(gl, cached.wall);
      disposeMeshInfo(gl, cached.floor);
      disposeMeshInfo(gl, cached.ceiling);
    }
    disposeMeshInfo(gl, boxMeshInfo);
    gl.deleteProgram(programInfo.program);
  }

  return {
    gl,
    render,
    dispose,
    clearLevelCache() {
      levelGeometryCache.clear();
      currentGeometryKey = null;
      currentGeometry = null;
    }
  };
}

function disposeMeshInfo(gl, meshInfo) {
  if (!meshInfo) {
    return;
  }

  if (meshInfo.vertexBuffer) gl.deleteBuffer(meshInfo.vertexBuffer);
  if (meshInfo.normalBuffer) gl.deleteBuffer(meshInfo.normalBuffer);
  if (meshInfo.uvBuffer) gl.deleteBuffer(meshInfo.uvBuffer);
  if (meshInfo.indexBuffer) gl.deleteBuffer(meshInfo.indexBuffer);
}

function parseSkyColor(color) {
  if (typeof color !== 'string' || !color.startsWith('#')) {
    return [0.18, 0.22, 0.28];
  }

  const hex = color.slice(1);
  const value = hex.length === 3
    ? hex.split('').map((part) => part + part).join('')
    : hex;
  const parsed = Number.parseInt(value, 16);
  if (!Number.isFinite(parsed)) {
    return [0.18, 0.22, 0.28];
  }

  return [
    ((parsed >> 16) & 255) / 255,
    ((parsed >> 8) & 255) / 255,
    (parsed & 255) / 255
  ];
}
