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
  let currentLevelId = null;
  let currentGeometry = null;

  gl.useProgram(programInfo.program);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.CULL_FACE);
  gl.clearColor(0.15, 0.18, 0.22, 1);
  gl.uniform3fv(programInfo.uniformLocations.lightDir, new Float32Array(lightDir));
  gl.uniform1i(programInfo.uniformLocations.texture, 0);

  function ensureLevelGeometry(level) {
    if (!level) {
      return null;
    }

    if (currentLevelId === level.id && currentGeometry) {
      return currentGeometry;
    }

    const cached = levelGeometryCache.get(level.id);
    if (cached) {
      currentLevelId = level.id;
      currentGeometry = cached;
      return cached;
    }

    const geometry = buildLevelGeometry(level, options.geometry || {});
    const built = {
      wall: createMeshBufferInfo(gl, geometry.wall),
      floor: createMeshBufferInfo(gl, geometry.floor),
      ceiling: createMeshBufferInfo(gl, geometry.ceiling)
    };

    levelGeometryCache.set(level.id, built);
    currentLevelId = level.id;
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
      if (enemy.dead) {
        continue;
      }
      const tint = hexColorToRgba(enemy.def?.color || '#ff6666', enemy.hitFlashMs > 0 ? 1 : 0.98);
      const entityFloor = level.getFloorHeightAt ? level.getFloorHeightAt(enemy.x, enemy.z) : 0;
      drawEntityBox(enemy, textures.entity, tint, entityFloor, enemy.radius * 2.1, enemy.height, enemy.radius * 2.1, enemy.facing + Math.PI * 0.5);
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
      currentLevelId = null;
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
