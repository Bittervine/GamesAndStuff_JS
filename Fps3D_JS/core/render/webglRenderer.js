import { buildBoxGeometry, buildLevelGeometry, buildSkyDomeGeometry, meshToBuffers } from './geometry.js';
import { createMat4, perspectiveMat4, lookAtMat4, fromTranslationRotationScale, identityMat4 } from '../math/mat4.js';
import { getThemeAt } from '../world/level.js';
import { WEAPON_ORDER, getWeaponDef } from '../../data/weapons.js';

const VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aUV;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
uniform vec4 uUvTransform;

varying vec3 vNormal;
varying vec2 vUV;

void main() {
  vec4 worldPosition = uModel * vec4(aPosition, 1.0);
  vNormal = mat3(uModel) * aNormal;
  vUV = aUV * uUvTransform.xy + uUvTransform.zw;
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
    support: Math.max(0, -swing),
    plant: Math.max(0, 1 - Math.abs(swing))
  };
}

function resolveCharacterPoseState(entity, options = {}) {
  if (typeof options.poseState === 'string' && options.poseState.length > 0) {
    return options.poseState;
  }

  if (entity?.dead) {
    return 'death';
  }

  if ((entity?.attackWindupTotalMs || 0) > 0) {
    return 'attack';
  }

  if ((entity?.hitFlashMs || 0) > 0) {
    return 'hurt';
  }

  return 'walk';
}

const AREA_THEMES = {
  tech: {
    clearColor: '#23415f',
    skyTint: '#8ec9ff',
    floorTint: '#d3e8fb',
    wallTint: '#b2d1ea',
    ceilingTint: '#c8dff2',
    floorAmbient: 0.88,
    wallAmbient: 0.76,
    ceilingAmbient: 0.58
  },
  industrial: {
    clearColor: '#5a5249',
    skyTint: '#c7b7a5',
    floorTint: '#e0d2c0',
    wallTint: '#c2b39e',
    ceilingTint: '#d8ccbd',
    floorAmbient: 0.84,
    wallAmbient: 0.72,
    ceilingAmbient: 0.54
  },
  hell: {
    clearColor: '#4a1719',
    skyTint: '#ff8e63',
    floorTint: '#ffd0b5',
    wallTint: '#ffae9c',
    ceilingTint: '#ffc3a5',
    floorAmbient: 0.82,
    wallAmbient: 0.70,
    ceilingAmbient: 0.50
  },
  default: {
    clearColor: '#4d6f96',
    skyTint: '#b2d7ff',
    floorTint: '#ffffff',
    wallTint: '#ffffff',
    ceilingTint: '#ffffff',
    floorAmbient: 0.86,
    wallAmbient: 0.74,
    ceilingAmbient: 0.52
  }
};

const WEAPON_VIEW_MODEL_PRESETS = {
  pistol: {
    kind: 'pistol',
    baseOffsetX: 0.28,
    baseOffsetY: -0.28,
    baseOffsetZ: -0.62,
    bobRate: 0.013,
    swayRate: 0.006,
    swayOffsetX: 0.03,
    swayOffsetY: 0.014,
    swayOffsetZ: 0.02,
    bobOffsetY: 0.045,
    recoilOffsetY: 0.08,
    recoilOffsetZ: 0.14,
    kickOffsetX: -0.03,
    kickOffsetY: 0.03,
    kickOffsetZ: 0.22,
    pitchBase: -0.12,
    bobPitch: 0.02,
    recoilPitch: 0.25,
    kickPitch: 0.04,
    rollBase: 0.02,
    swayRoll: 0.05,
    kickRoll: 0.03,
    yawBase: 0,
    swayYaw: 0.02,
    panelOffsetX: -0.82,
    panelOffsetY: -0.74,
    panelOffsetZ: -1.18,
    panelScaleX: 0.56,
    panelScaleY: 0.22,
    panelScaleZ: 0.06
  },
  shotgun: {
    kind: 'shotgun',
    baseOffsetX: 0.20,
    baseOffsetY: -0.32,
    baseOffsetZ: -0.70,
    bobRate: 0.011,
    swayRate: 0.005,
    swayOffsetX: 0.04,
    swayOffsetY: 0.016,
    swayOffsetZ: 0.025,
    bobOffsetY: 0.054,
    recoilOffsetY: 0.10,
    recoilOffsetZ: 0.18,
    kickOffsetX: -0.04,
    kickOffsetY: 0.04,
    kickOffsetZ: 0.28,
    pitchBase: -0.16,
    bobPitch: 0.018,
    recoilPitch: 0.30,
    kickPitch: 0.05,
    rollBase: -0.01,
    swayRoll: 0.04,
    kickRoll: 0.04,
    yawBase: -0.02,
    swayYaw: 0.018,
    panelOffsetX: -0.78,
    panelOffsetY: -0.76,
    panelOffsetZ: -1.22,
    panelScaleX: 0.58,
    panelScaleY: 0.24,
    panelScaleZ: 0.06
  },
  superShotgun: {
    kind: 'superShotgun',
    baseOffsetX: 0.18,
    baseOffsetY: -0.35,
    baseOffsetZ: -0.74,
    bobRate: 0.010,
    swayRate: 0.0045,
    swayOffsetX: 0.04,
    swayOffsetY: 0.018,
    swayOffsetZ: 0.03,
    bobOffsetY: 0.058,
    recoilOffsetY: 0.12,
    recoilOffsetZ: 0.20,
    kickOffsetX: -0.05,
    kickOffsetY: 0.05,
    kickOffsetZ: 0.32,
    pitchBase: -0.18,
    bobPitch: 0.016,
    recoilPitch: 0.34,
    kickPitch: 0.06,
    rollBase: -0.02,
    swayRoll: 0.04,
    kickRoll: 0.05,
    yawBase: -0.03,
    swayYaw: 0.016,
    panelOffsetX: -0.76,
    panelOffsetY: -0.78,
    panelOffsetZ: -1.24,
    panelScaleX: 0.62,
    panelScaleY: 0.25,
    panelScaleZ: 0.07
  },
  chaingun: {
    kind: 'chaingun',
    baseOffsetX: 0.24,
    baseOffsetY: -0.32,
    baseOffsetZ: -0.68,
    bobRate: 0.012,
    swayRate: 0.0055,
    swayOffsetX: 0.03,
    swayOffsetY: 0.014,
    swayOffsetZ: 0.02,
    bobOffsetY: 0.046,
    recoilOffsetY: 0.07,
    recoilOffsetZ: 0.16,
    kickOffsetX: -0.025,
    kickOffsetY: 0.03,
    kickOffsetZ: 0.24,
    pitchBase: -0.14,
    bobPitch: 0.02,
    recoilPitch: 0.24,
    kickPitch: 0.04,
    rollBase: 0.01,
    swayRoll: 0.05,
    kickRoll: 0.03,
    yawBase: 0.01,
    swayYaw: 0.022,
    panelOffsetX: -0.84,
    panelOffsetY: -0.74,
    panelOffsetZ: -1.19,
    panelScaleX: 0.56,
    panelScaleY: 0.22,
    panelScaleZ: 0.06
  },
  rocketLauncher: {
    kind: 'rocketLauncher',
    baseOffsetX: 0.18,
    baseOffsetY: -0.35,
    baseOffsetZ: -0.74,
    bobRate: 0.0095,
    swayRate: 0.0042,
    swayOffsetX: 0.035,
    swayOffsetY: 0.018,
    swayOffsetZ: 0.028,
    bobOffsetY: 0.052,
    recoilOffsetY: 0.12,
    recoilOffsetZ: 0.22,
    kickOffsetX: -0.05,
    kickOffsetY: 0.06,
    kickOffsetZ: 0.34,
    pitchBase: -0.22,
    bobPitch: 0.015,
    recoilPitch: 0.38,
    kickPitch: 0.06,
    rollBase: -0.03,
    swayRoll: 0.03,
    kickRoll: 0.05,
    yawBase: -0.02,
    swayYaw: 0.015,
    panelOffsetX: -0.76,
    panelOffsetY: -0.79,
    panelOffsetZ: -1.25,
    panelScaleX: 0.62,
    panelScaleY: 0.24,
    panelScaleZ: 0.07
  },
  plasmaRifle: {
    kind: 'plasmaRifle',
    baseOffsetX: 0.26,
    baseOffsetY: -0.30,
    baseOffsetZ: -0.64,
    bobRate: 0.0125,
    swayRate: 0.0062,
    swayOffsetX: 0.028,
    swayOffsetY: 0.013,
    swayOffsetZ: 0.018,
    bobOffsetY: 0.044,
    recoilOffsetY: 0.08,
    recoilOffsetZ: 0.16,
    kickOffsetX: -0.02,
    kickOffsetY: 0.03,
    kickOffsetZ: 0.22,
    pitchBase: -0.10,
    bobPitch: 0.018,
    recoilPitch: 0.22,
    kickPitch: 0.04,
    rollBase: 0.01,
    swayRoll: 0.05,
    kickRoll: 0.03,
    yawBase: 0,
    swayYaw: 0.02,
    panelOffsetX: -0.80,
    panelOffsetY: -0.74,
    panelOffsetZ: -1.18,
    panelScaleX: 0.56,
    panelScaleY: 0.22,
    panelScaleZ: 0.06
  },
  bfg9000: {
    kind: 'bfg9000',
    baseOffsetX: 0.14,
    baseOffsetY: -0.38,
    baseOffsetZ: -0.78,
    bobRate: 0.0085,
    swayRate: 0.004,
    swayOffsetX: 0.03,
    swayOffsetY: 0.02,
    swayOffsetZ: 0.028,
    bobOffsetY: 0.06,
    recoilOffsetY: 0.16,
    recoilOffsetZ: 0.28,
    kickOffsetX: -0.06,
    kickOffsetY: 0.08,
    kickOffsetZ: 0.38,
    pitchBase: -0.24,
    bobPitch: 0.014,
    recoilPitch: 0.40,
    kickPitch: 0.08,
    rollBase: -0.02,
    swayRoll: 0.03,
    kickRoll: 0.06,
    yawBase: -0.04,
    swayYaw: 0.014,
    panelOffsetX: -0.74,
    panelOffsetY: -0.80,
    panelOffsetZ: -1.27,
    panelScaleX: 0.66,
    panelScaleY: 0.26,
    panelScaleZ: 0.08
  }
};

function resolveAreaTheme(level, x, z) {
  const themeId = getThemeAt(level, x, z) || 'default';
  return AREA_THEMES[themeId] || AREA_THEMES.default;
}

function resolveWeaponViewModel(weapon) {
  const baseKind = typeof weapon?.viewModel?.kind === 'string' && weapon.viewModel.kind.length > 0
    ? weapon.viewModel.kind
    : typeof weapon?.id === 'string' && weapon.id.length > 0
      ? weapon.id
      : 'pistol';
  const preset = WEAPON_VIEW_MODEL_PRESETS[baseKind] || WEAPON_VIEW_MODEL_PRESETS.pistol;
  return {
    ...preset,
    ...(weapon?.viewModel || {}),
    kind: typeof weapon?.viewModel?.kind === 'string' && weapon.viewModel.kind.length > 0
      ? weapon.viewModel.kind
      : preset.kind
  };
}

function normalizeMaterialCategory(material) {
  const value = typeof material === 'string' ? material.trim().toLowerCase() : '';
  if (!value) {
    return 'metal';
  }
  if (value.includes('organic') || value.includes('flesh') || value.includes('meat') || value.includes('bone')) {
    return 'organic';
  }
  if (value.includes('liquid') || value.includes('slime') || value.includes('goo') || value.includes('water')) {
    return 'liquid';
  }
  if (value.includes('emissive') || value.includes('glow') || value.includes('light')) {
    return 'emissive';
  }
  if (value.includes('damage') || value.includes('rust') || value.includes('scorch') || value.includes('burn') || value.includes('blood')) {
    return 'damage';
  }
  if (value.includes('stone') || value.includes('rock') || value.includes('concrete') || value.includes('brick') || value.includes('dirt')) {
    return 'stone';
  }
  return 'metal';
}

function getSurfaceTexture(textures, material, surfaceType = 'wall') {
  const category = normalizeMaterialCategory(material);

  switch (category) {
    case 'stone':
      return textures.materialStone || (surfaceType === 'floor' ? textures.floor : surfaceType === 'ceiling' ? textures.ceiling : textures.wall);
    case 'organic':
      return textures.materialOrganic || textures.entity || textures.wall;
    case 'liquid':
      return textures.materialLiquid || textures.pickup || textures.floor;
    case 'emissive':
      return textures.materialEmissive || textures.pickup || textures.wall;
    case 'damage':
      return textures.materialDamage || textures.projectile || textures.wall;
    default:
      return textures.materialMetal || (surfaceType === 'floor' ? textures.floor : surfaceType === 'ceiling' ? textures.ceiling : textures.wall);
  }
}

function getDecalTexture(textures, decal) {
  const kind = typeof decal?.kind === 'string' ? decal.kind.toLowerCase() : '';
  if (kind === 'warning' || kind === 'glyph') {
    return getPackedTextureBinding(textures, 'materialEmissive', textures.materialEmissive || textures.pickup);
  }
  if (kind === 'scorch' || kind === 'corpsemark' || kind === 'blood' || kind === 'impact' || kind === 'splash') {
    return getPackedTextureBinding(textures, 'materialDamage', textures.materialDamage || textures.projectile);
  }
  return getPackedTextureBinding(textures, 'projectile', textures.projectile);
}

function normalizeTextureBinding(textureOrBinding) {
  if (!textureOrBinding) {
    return null;
  }

  if (typeof textureOrBinding === 'object' && textureOrBinding.texture) {
    return {
      texture: textureOrBinding.texture,
      uvTransform: textureOrBinding.uvTransform || [1, 1, 0, 0]
    };
  }

  return {
    texture: textureOrBinding,
    uvTransform: [1, 1, 0, 0]
  };
}

function getPackedTextureBinding(textures, key, fallbackTexture) {
  const atlasTexture = textures?.atlas || null;
  const region = textures?.atlasRegions?.[key] || null;
  if (atlasTexture && region) {
    return {
      texture: atlasTexture,
      uvTransform: [region.scaleX, region.scaleY, region.offsetX, region.offsetY]
    };
  }

  return normalizeTextureBinding(fallbackTexture);
}

export function sampleCharacterRigPose(entity, floorHeight, scaleX, scaleY, scaleZ, bobPhase, aimTarget = null, options = {}) {
  const poseState = resolveCharacterPoseState(entity, options);
  const motionBlendByState = {
    idle: 0.18,
    walk: 1,
    attack: 0.78,
    hurt: 0.62,
    death: 0.12
  };
  const motionBlend = clamp01(options.motionBlend ?? motionBlendByState[poseState] ?? 0.72);
  const deathBlend = entity?.dead ? easeInOut(1 - clamp01((entity?.dyingMs || 0) / (options.deathMs ?? 600))) : 0;
  const hurtBlend = clamp01((entity?.hitFlashMs || 0) / (options.hurtMs ?? 120));
  const attackBlend = (entity?.attackWindupTotalMs || 0) > 0
    ? easeInOut(poseProgress(entity.attackWindupMs, entity.attackWindupTotalMs))
    : 0;
  const bodyWidth = Math.max(options.minWidth ?? 0.2, scaleX * (options.widthScale ?? 1));
  const bodyDepth = Math.max(options.minDepth ?? 0.2, scaleZ * (options.depthScale ?? 1));
  const bodyHeight = Math.max(options.minHeight ?? 0.9, scaleY * (options.heightScale ?? 1)) * (1 - deathBlend * (options.deathHeightScale ?? 0.34));
  const cycleRate = lerpNumber(options.idleCycleRate ?? 0.0045, options.walkCycleRate ?? 0.012, motionBlend);
  const cycle = bobPhase * cycleRate;
  const leftGait = gaitSample(cycle - (options.leftPhaseOffset ?? Math.PI * 0.5));
  const rightGait = gaitSample(cycle + (options.rightPhaseOffset ?? Math.PI * 0.5));
  const stepPlant = (leftGait.plant + rightGait.plant) * 0.5;
  const hurtFlinch = hurtBlend * (1 - deathBlend * (options.deathFlinchScale ?? 0.35));
  const collapse = deathBlend * deathBlend;
  const bodyDrop = collapse * bodyHeight * (options.collapseDropScale ?? 0.18);
  const bodyBob = (
    Math.abs(Math.sin(cycle)) * bodyHeight * (options.walkBobScale ?? 0.03) * motionBlend +
    Math.sin(bobPhase * (options.idleBobRate ?? 0.004)) * bodyHeight * (options.idleBobScale ?? 0.012) * (1 - motionBlend) -
    stepPlant * bodyHeight * (options.stepPlantScale ?? 0.01)
  ) * (1 - deathBlend * 0.55) + hurtFlinch * bodyHeight * (options.hurtBobScale ?? 0.016) - collapse * bodyHeight * (options.collapseBobScale ?? 0.02);
  const bodyLean = Math.sin(cycle * 0.5) * bodyWidth * (options.walkLeanScale ?? 0.035) + hurtFlinch * bodyWidth * (options.hurtLeanScale ?? 0.10) - collapse * bodyWidth * (options.collapseLeanScale ?? 0.16);
  const bodyShift = (leftGait.support - rightGait.support) * bodyWidth * (options.supportShiftScale ?? 0.08) + hurtFlinch * bodyWidth * (options.hurtShiftScale ?? 0.03) - collapse * bodyWidth * (options.collapseShiftScale ?? 0.02);
  const pelvisHeight = bodyHeight * (options.pelvisScale ?? 0.12);
  const torsoHeight = bodyHeight * (options.torsoScale ?? 0.30);
  const neckHeight = bodyHeight * (options.neckScale ?? 0.06);
  const headHeight = bodyHeight * (options.headScale ?? 0.18);
  const stanceBase = bodyHeight * (options.stanceScale ?? 0.82);
  const pelvisY = stanceBase + pelvisHeight * 0.5 + bodyBob * 0.22 - bodyDrop * 0.12;
  const torsoY = stanceBase + pelvisHeight + torsoHeight * 0.5 + bodyBob * 0.92 - bodyDrop * 0.22;
  const neckY = stanceBase + pelvisHeight + torsoHeight + neckHeight * 0.5 + bodyBob * 1.0 - bodyDrop * 0.32;
  const headY = stanceBase + pelvisHeight + torsoHeight + neckHeight + headHeight * 0.5 + bodyBob * 1.02 - bodyDrop * 0.40;
  const aimDistance = aimTarget ? Math.hypot((aimTarget.x ?? 0) - (entity?.x ?? 0), (aimTarget.z ?? 0) - (entity?.z ?? 0)) : 0;
  const aimHeight = aimTarget && Number.isFinite(aimTarget.y) ? aimTarget.y - (floorHeight + torsoY) : 0;
  const aimPitch = aimDistance > 0.001 ? Math.atan2(aimHeight, aimDistance) : 0;
  const torsoTwist = (rightGait.swing - leftGait.swing) * bodyDepth * (options.swingTwistScale ?? 0.08)
    + (rightGait.support - leftGait.support) * bodyDepth * (options.supportTwistScale ?? 0.04)
    + attackBlend * bodyDepth * (options.attackTwistScale ?? 0.12)
    + Math.max(0, aimPitch) * bodyDepth * (options.aimTwistScale ?? 0.04)
    - collapse * bodyDepth * (options.collapseTwistScale ?? 0.10);
  const hurtRecoil = hurtFlinch;
  const deathCollapse = collapse;
  const spineSlack = deathCollapse * bodyHeight * (options.spineSlackScale ?? 0.10) + hurtRecoil * bodyHeight * (options.spineHurtScale ?? 0.03);
  const headHang = deathCollapse * bodyHeight * (options.headHangScale ?? 0.14) - hurtRecoil * bodyHeight * (options.headSnapScale ?? 0.03);
  const armDrop = deathCollapse * bodyHeight * (options.armDropScale ?? 0.14) - hurtRecoil * bodyHeight * (options.armRecoilScale ?? 0.02);
  const legBuckle = deathCollapse * bodyHeight * (options.legBuckleScale ?? 0.18) + hurtRecoil * bodyHeight * (options.legBraceScale ?? 0.04);
  const weaponKick = attackBlend * bodyHeight * (options.weaponKickScale ?? 0.07) + hurtRecoil * bodyHeight * (options.weaponRecoilScale ?? 0.05) + deathCollapse * bodyHeight * (options.weaponDropScale ?? 0.03);

  return {
    poseState,
    motionBlend,
    deathBlend,
    hurtBlend,
    attackBlend,
    hurtRecoil,
    deathCollapse,
    bodyWidth,
    bodyDepth,
    bodyHeight,
    cycle,
    leftGait,
    rightGait,
    stepPlant,
    hurtFlinch,
    collapse,
    bodyDrop,
    bodyBob,
    bodyLean,
    bodyShift,
    stanceBase,
    pelvisHeight,
    torsoHeight,
    neckHeight,
    headHeight,
    pelvisY,
    torsoY,
    neckY,
    headY,
    aimDistance,
    aimHeight,
    aimPitch,
    torsoTwist,
    spineSlack,
    headHang,
    armDrop,
    legBuckle,
    weaponKick
  };
}

export function sampleFirstPersonWeaponPose(state, weapon = null, options = {}) {
  const player = state?.player || {};
  const weaponDef = typeof weapon === 'string'
    ? getWeaponDef(weapon)
    : weapon || getWeaponDef(WEAPON_ORDER[player.weaponIndex] || WEAPON_ORDER[0]);
  const viewModel = resolveWeaponViewModel(weaponDef);
  const timeMs = Number(state?.timeMs ?? 0) || 0;
  const fireDelayMs = Math.max(1, Number(weaponDef.fireDelayMs) || 220);
  const recoilWindowMs = Math.max(1, Number(options.recoilMs ?? 90) || 90);
  const bob = Math.sin(timeMs * viewModel.bobRate + (player.x || 0) * 1.42 + (player.z || 0) * 1.11);
  const sway = Math.sin(timeMs * viewModel.swayRate + (player.yaw || 0) * 0.75);
  const recoil = clamp01((player.recoilMs || 0) / recoilWindowMs);
  const kick = clamp01(player.recoilKick || 0);
  const cooldown = clamp01((player.weaponCooldownMs || 0) / fireDelayMs);
  const ready = 1 - cooldown;
  const offsetX = viewModel.baseOffsetX
    + sway * viewModel.swayOffsetX
    + kick * viewModel.kickOffsetX;
  const offsetY = viewModel.baseOffsetY
    + bob * viewModel.bobOffsetY
    - recoil * viewModel.recoilOffsetY
    + kick * viewModel.kickOffsetY;
  const offsetZ = viewModel.baseOffsetZ
    - kick * viewModel.kickOffsetZ
    + recoil * viewModel.recoilOffsetZ;
  const pitch = viewModel.pitchBase
    + bob * viewModel.bobPitch
    - recoil * viewModel.recoilPitch
    + kick * viewModel.kickPitch;
  const roll = viewModel.rollBase
    + sway * viewModel.swayRoll
    + kick * viewModel.kickRoll;
  const yaw = viewModel.yawBase + sway * viewModel.swayYaw;

  return {
    weaponId: weaponDef.id,
    modelKind: viewModel.kind,
    offsetX,
    offsetY,
    offsetZ,
    pitch,
    roll,
    yaw,
    bob,
    sway,
    recoil,
    kick,
    ready,
    weaponTint: hexColorToRgba(weaponDef.color || '#d9e3f0', 1),
    panelTint: hexColorToRgba(viewModel.panelTint || '#9fe7ff', 0.9),
    panelOffsetX: viewModel.panelOffsetX,
    panelOffsetY: viewModel.panelOffsetY,
    panelOffsetZ: viewModel.panelOffsetZ,
    panelScaleX: viewModel.panelScaleX,
    panelScaleY: viewModel.panelScaleY,
    panelScaleZ: viewModel.panelScaleZ
  };
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cloneRigValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneRigValue(item));
  }

  if (isPlainObject(value)) {
    const clone = {};
    for (const [key, item] of Object.entries(value)) {
      clone[key] = cloneRigValue(item);
    }
    return clone;
  }

  return value;
}

function mergeRigValue(baseValue, overrideValue) {
  if (overrideValue === undefined) {
    return cloneRigValue(baseValue);
  }

  if (!isPlainObject(baseValue) || !isPlainObject(overrideValue)) {
    return cloneRigValue(overrideValue);
  }

  const merged = cloneRigValue(baseValue);
  for (const [key, value] of Object.entries(overrideValue)) {
    merged[key] = mergeRigValue(baseValue[key], value);
  }
  return merged;
}

const CHARACTER_RIG_PROFILES = {
  humanoid: {
    pose: {
      minWidth: 0.2,
      minDepth: 0.2,
      minHeight: 0.9,
      widthScale: 1,
      depthScale: 1,
      heightScale: 1,
      idleCycleRate: 0.0045,
      walkCycleRate: 0.012,
      walkBobScale: 0.03,
      idleBobScale: 0.012,
      walkLeanScale: 0.035,
      hurtLeanScale: 0.10,
      collapseLeanScale: 0.16,
      supportShiftScale: 0.08,
      hurtShiftScale: 0.03,
      collapseShiftScale: 0.02,
      pelvisScale: 0.12,
      torsoScale: 0.30,
      neckScale: 0.06,
      headScale: 0.18,
      stanceScale: 0.82,
      swingTwistScale: 0.08,
      supportTwistScale: 0.04,
      attackTwistScale: 0.12,
      aimTwistScale: 0.04,
      collapseTwistScale: 0.10
    },
    mesh: {
      torso: { sides: 10, subdivisions: 3, jointBulge: 0.10, skinSpread: 1.35, skinMix: 0.50 },
      head: { sides: 10, subdivisions: 2, jointBulge: 0.08, skinSpread: 1.20, skinMix: 0.42 },
      limb: { sides: 8, subdivisions: 2, jointBulge: 0.10, skinSpread: 1.22, skinMix: 0.58 },
      leg: { sides: 8, subdivisions: 2, jointBulge: 0.12, skinSpread: 1.26, skinMix: 0.62 },
      arm: { sides: 8, subdivisions: 2, jointBulge: 0.10, skinSpread: 1.18, skinMix: 0.58 },
      bridge: { sides: 10, subdivisions: 2, jointBulge: 0.06, skinSpread: 1.10, skinMix: 0.40 }
    },
    weapon: {
      attackReachScale: 0.34,
      attackKickScale: 0.02,
      armLiftScale: 0.10,
      hurtLiftScale: 0.03,
      weaponLiftScale: 0.04,
      pitchBase: -0.18,
      pitchAttackScale: 0.12,
      pitchAimScale: 0.82,
      pitchHurtScale: 0.28,
      pitchDeathScale: 0.22,
      pitchClampMin: -1.35,
      pitchClampMax: 0.65
    }
  },
  quadruped: {
    pose: {
      minWidth: 0.34,
      minDepth: 0.42,
      minHeight: 0.82,
      widthScale: 0.96,
      depthScale: 1.06,
      heightScale: 0.78,
      idleCycleRate: 0.005,
      walkCycleRate: 0.015,
      leftPhaseOffset: 0,
      rightPhaseOffset: Math.PI,
      walkBobScale: 0.04,
      idleBobScale: 0.014,
      walkLeanScale: 0.03,
      hurtLeanScale: 0.05,
      collapseLeanScale: 0.04,
      supportShiftScale: 0.05,
      hurtShiftScale: 0.02,
      collapseShiftScale: 0.01,
      pelvisScale: 0.12,
      torsoScale: 0.32,
      neckScale: 0.08,
      headScale: 0.14,
      stanceScale: 0.74,
      swingTwistScale: 0.06,
      supportTwistScale: 0.03,
      attackTwistScale: 0.08,
      aimTwistScale: 0,
      collapseTwistScale: 0.06
    },
    mesh: {
      torso: { sides: 10, subdivisions: 2, jointBulge: 0.10, skinSpread: 1.30, skinMix: 0.56 },
      head: { sides: 10, subdivisions: 2, jointBulge: 0.08, skinSpread: 1.16, skinMix: 0.44 },
      leg: { sides: 8, subdivisions: 2, jointBulge: 0.12, skinSpread: 1.18, skinMix: 0.60 },
      tail: { sides: 6, subdivisions: 2, jointBulge: 0.05, skinSpread: 1.12, skinMix: 0.40 }
    },
    weapon: {}
  },
  floating: {
    pose: {
      minWidth: 0.48,
      minDepth: 0.48,
      minHeight: 1.15,
      widthScale: 1,
      depthScale: 1,
      heightScale: 0.92,
      idleCycleRate: 0.0035,
      walkCycleRate: 0.008,
      walkBobScale: 0.018,
      idleBobScale: 0.02,
      walkLeanScale: 0.01,
      hurtLeanScale: 0.04,
      collapseLeanScale: 0.08,
      supportShiftScale: 0.02,
      hurtShiftScale: 0.02,
      collapseShiftScale: 0.01,
      pelvisScale: 0.18,
      torsoScale: 0.42,
      neckScale: 0.05,
      headScale: 0.16,
      stanceScale: 0.52,
      swingTwistScale: 0.04,
      supportTwistScale: 0.02,
      attackTwistScale: 0.06,
      aimTwistScale: 0.02,
      collapseTwistScale: 0.08
    },
    mesh: {
      body: { sides: 12, subdivisions: 3, jointBulge: 0.08, skinSpread: 1.25, skinMix: 0.54 },
      core: { sides: 12, subdivisions: 2, jointBulge: 0.06, skinSpread: 1.12, skinMix: 0.46 },
      tendril: { sides: 6, subdivisions: 2, jointBulge: 0.04, skinSpread: 1.08, skinMix: 0.36 }
    },
    weapon: {}
  }
};

export function resolveCharacterRigProfile(entity, fallbackVariant = 'humanoid') {
  const rigData = entity?.def?.rig || {};
  const variant = rigData.variant || entity?.def?.model || fallbackVariant || 'humanoid';
  const baseProfile = CHARACTER_RIG_PROFILES[variant] || CHARACTER_RIG_PROFILES.humanoid;
  return mergeRigValue(baseProfile, {
    variant,
    pose: rigData.pose,
    mesh: rigData.mesh,
    weapon: rigData.weapon
  });
}

const TAU = Math.PI * 2;

function makeMeshData() {
  return {
    positions: [],
    normals: [],
    uvs: [],
    indices: []
  };
}

function toVec3(value) {
  if (Array.isArray(value)) {
    return {
      x: Number(value[0]) || 0,
      y: Number(value[1]) || 0,
      z: Number(value[2]) || 0
    };
  }

  return {
    x: Number(value?.x ?? 0) || 0,
    y: Number(value?.y ?? 0) || 0,
    z: Number(value?.z ?? 0) || 0
  };
}

function addVec3(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z
  };
}

function subtractVec3(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z
  };
}

function scaleVec3(v, scale) {
  return {
    x: v.x * scale,
    y: v.y * scale,
    z: v.z * scale
  };
}

function lerpNumber(a, b, t) {
  return a + (b - a) * t;
}

function lerpVec3(a, b, t) {
  return {
    x: lerpNumber(a.x, b.x, t),
    y: lerpNumber(a.y, b.y, t),
    z: lerpNumber(a.z, b.z, t)
  };
}

function crossVec3(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

function lengthVec3(v) {
  return Math.hypot(v.x, v.y, v.z);
}

function normalizeVec3(v, fallback = { x: 0, y: 1, z: 0 }) {
  const length = lengthVec3(v);
  if (length <= 1e-6) {
    return { ...fallback };
  }

  return {
    x: v.x / length,
    y: v.y / length,
    z: v.z / length
  };
}

function pushMeshVertex(mesh, position, normal, uv) {
  mesh.positions.push(position.x, position.y, position.z);
  mesh.normals.push(normal.x, normal.y, normal.z);
  mesh.uvs.push(uv.u, uv.v);
  return mesh.positions.length / 3 - 1;
}

function buildJointFrame(tangent) {
  const reference = Math.abs(tangent.x) < 0.85
    ? { x: 1, y: 0, z: 0 }
    : { x: 0, y: 0, z: 1 };
  let right = crossVec3(reference, tangent);
  if (lengthVec3(right) <= 1e-6) {
    right = crossVec3({ x: 0, y: 1, z: 0 }, tangent);
  }
  right = normalizeVec3(right, { x: 1, y: 0, z: 0 });
  const up = normalizeVec3(crossVec3(tangent, right), { x: 0, y: 1, z: 0 });
  return { right, up };
}

function buildTubeChainMesh(points, radii, options = {}) {
  const mesh = makeMeshData();
  const joints = (Array.isArray(points) ? points : []).map(toVec3);
  if (joints.length < 2) {
    return mesh;
  }

  const sides = Math.max(3, options.sides ?? 8);
  const tangents = [];
  const jointFrames = [];
  const segmentLengths = [];
  let totalLength = 0;

  for (let index = 0; index < joints.length - 1; index += 1) {
    const delta = subtractVec3(joints[index + 1], joints[index]);
    const length = lengthVec3(delta);
    segmentLengths.push(length);
    totalLength += length;
  }

  for (let index = 0; index < joints.length; index += 1) {
    let tangent;
    if (index === 0) {
      tangent = normalizeVec3(subtractVec3(joints[1], joints[0]));
    } else if (index === joints.length - 1) {
      tangent = normalizeVec3(subtractVec3(joints[index], joints[index - 1]));
    } else {
      const prev = normalizeVec3(subtractVec3(joints[index], joints[index - 1]));
      const next = normalizeVec3(subtractVec3(joints[index + 1], joints[index]));
      tangent = normalizeVec3(addVec3(prev, next), next);
    }

    tangents.push(tangent);
    jointFrames.push(buildJointFrame(tangent));
  }

  const ringIndices = [];
  let travelled = 0;

  for (let jointIndex = 0; jointIndex < joints.length; jointIndex += 1) {
    const point = joints[jointIndex];
    const radius = Math.max(0.01, Number(radii?.[jointIndex] ?? radii?.[radii.length - 1] ?? options.radius ?? 0.18) || 0.18);
    const frame = jointFrames[jointIndex];
    const ring = [];
    const v = totalLength > 0 ? travelled / totalLength : jointIndex / (joints.length - 1);

    for (let side = 0; side < sides; side += 1) {
      const angle = (side / sides) * TAU;
      const radial = addVec3(
        scaleVec3(frame.right, Math.cos(angle) * radius),
        scaleVec3(frame.up, Math.sin(angle) * radius)
      );
      const normal = normalizeVec3(radial, frame.up);
      ring.push(pushMeshVertex(mesh, addVec3(point, radial), normal, {
        u: side / sides,
        v
      }));
    }

    ringIndices.push(ring);
    if (jointIndex < segmentLengths.length) {
      travelled += segmentLengths[jointIndex];
    }
  }

  for (let jointIndex = 0; jointIndex < ringIndices.length - 1; jointIndex += 1) {
    const ringA = ringIndices[jointIndex];
    const ringB = ringIndices[jointIndex + 1];
    for (let side = 0; side < sides; side += 1) {
      const nextSide = (side + 1) % sides;
      mesh.indices.push(
        ringA[side],
        ringA[nextSide],
        ringB[nextSide],
        ringA[side],
        ringB[nextSide],
        ringB[side]
      );
    }
  }

  return mesh;
}

export function sampleSkinnedChainVertex(joints, tangents, radii, chainPosition, options = {}) {
  const lastIndex = Math.max(0, joints.length - 1);
  const baseIndex = Math.max(0, Math.min(lastIndex - 1, Math.floor(chainPosition)));
  const localT = clamp01(chainPosition - baseIndex);
  const start = joints[baseIndex];
  const end = joints[baseIndex + 1] || joints[baseIndex];
  const startTangent = tangents[baseIndex] || { x: 0, y: 1, z: 0 };
  const endTangent = tangents[baseIndex + 1] || startTangent;
  const startRadius = Math.max(0.01, Number(radii?.[baseIndex] ?? radii?.[radii.length - 1] ?? options.radius ?? 0.18) || 0.18);
  const endRadius = Math.max(0.01, Number(radii?.[baseIndex + 1] ?? radii?.[radii.length - 1] ?? options.radius ?? 0.18) || 0.18);
  const basePoint = lerpVec3(start, end, localT);
  const baseTangent = normalizeVec3(lerpVec3(startTangent, endTangent, localT), startTangent);
  const baseRadius = lerpNumber(startRadius, endRadius, localT);
  const skinSpread = Math.max(0.5, options.skinSpread ?? 1.25);
  const skinMix = clamp01(options.skinMix ?? 0.55);
  const jointBulge = Math.max(0, options.jointBulge ?? 0.12);

  const weights = new Array(joints.length).fill(0);
  let totalWeight = 0;
  let weightedPoint = { x: 0, y: 0, z: 0 };
  let weightedTangent = { x: 0, y: 0, z: 0 };
  let weightedRadius = 0;

  const minJoint = Math.max(0, Math.floor(chainPosition - skinSpread - 1));
  const maxJoint = Math.min(lastIndex, Math.ceil(chainPosition + skinSpread + 1));

  for (let jointIndex = minJoint; jointIndex <= maxJoint; jointIndex += 1) {
    const distance = Math.abs(chainPosition - jointIndex);
    const falloff = clamp01(1 - distance / skinSpread);
    if (falloff <= 0) {
      continue;
    }

    const weight = falloff * falloff * (3 - 2 * falloff);
    if (weight <= 1e-6) {
      continue;
    }

    weights[jointIndex] = weight;
    totalWeight += weight;
    weightedPoint = addVec3(weightedPoint, scaleVec3(joints[jointIndex], weight));
    weightedTangent = addVec3(weightedTangent, scaleVec3(tangents[jointIndex] || baseTangent, weight));
    weightedRadius += (Number(radii?.[jointIndex] ?? radii?.[radii.length - 1] ?? baseRadius) || baseRadius) * weight;
  }

  const normalizedWeights = totalWeight > 0
    ? weights.map((weight) => weight / totalWeight)
    : weights;
  const smoothedPoint = totalWeight > 0
    ? scaleVec3(weightedPoint, 1 / totalWeight)
    : basePoint;
  const smoothedTangent = totalWeight > 0
    ? normalizeVec3(scaleVec3(weightedTangent, 1 / totalWeight), baseTangent)
    : baseTangent;
  const smoothedRadius = totalWeight > 0
    ? weightedRadius / totalWeight
    : baseRadius;
  const jointSwell = 1 + jointBulge * (1 - 4 * localT * (1 - localT));

  return {
    point: lerpVec3(basePoint, smoothedPoint, skinMix),
    tangent: normalizeVec3(lerpVec3(baseTangent, smoothedTangent, skinMix), baseTangent),
    radius: Math.max(0.01, lerpNumber(baseRadius, smoothedRadius, skinMix) * jointSwell),
    weights: normalizedWeights,
    basePoint,
    baseRadius
  };
}

export function buildSkinnedChainMesh(points, radii, options = {}) {
  const mesh = makeMeshData();
  const joints = (Array.isArray(points) ? points : []).map(toVec3);
  if (joints.length < 2) {
    return mesh;
  }

  const sides = Math.max(3, options.sides ?? 8);
  const subdivisions = Math.max(1, options.subdivisions ?? 2);
  const tangents = [];
  const segmentLengths = [];
  let totalLength = 0;

  for (let index = 0; index < joints.length - 1; index += 1) {
    const delta = subtractVec3(joints[index + 1], joints[index]);
    const length = lengthVec3(delta);
    segmentLengths.push(length);
    totalLength += length;
  }

  for (let index = 0; index < joints.length; index += 1) {
    let tangent;
    if (index === 0) {
      tangent = normalizeVec3(subtractVec3(joints[1], joints[0]));
    } else if (index === joints.length - 1) {
      tangent = normalizeVec3(subtractVec3(joints[index], joints[index - 1]));
    } else {
      const prev = normalizeVec3(subtractVec3(joints[index], joints[index - 1]));
      const next = normalizeVec3(subtractVec3(joints[index + 1], joints[index]));
      tangent = normalizeVec3(addVec3(prev, next), next);
    }

    tangents.push(tangent);
  }

  const ringIndices = [];
  let travelled = 0;

  for (let segmentIndex = 0; segmentIndex < joints.length - 1; segmentIndex += 1) {
    const segmentLength = segmentLengths[segmentIndex] || 0;

    for (let step = 0; step <= subdivisions; step += 1) {
      if (segmentIndex > 0 && step === 0) {
        continue;
      }

      const t = step / subdivisions;
      const sample = sampleSkinnedChainVertex(joints, tangents, radii, segmentIndex + t, options);
      const frame = buildJointFrame(sample.tangent);
      const point = sample.point;
      const radius = sample.radius;
      const ring = [];
      const v = totalLength > 0 ? (travelled + segmentLength * t) / totalLength : (segmentIndex + t) / (joints.length - 1);

      for (let side = 0; side < sides; side += 1) {
        const angle = (side / sides) * TAU;
        const radial = addVec3(
          scaleVec3(frame.right, Math.cos(angle) * radius),
          scaleVec3(frame.up, Math.sin(angle) * radius)
        );
        const normal = normalizeVec3(radial, frame.up);
        ring.push(pushMeshVertex(mesh, addVec3(point, radial), normal, {
          u: side / sides,
          v
        }));
      }

      ringIndices.push(ring);
    }

    travelled += segmentLength;
  }

  for (let ringIndex = 0; ringIndex < ringIndices.length - 1; ringIndex += 1) {
    const ringA = ringIndices[ringIndex];
    const ringB = ringIndices[ringIndex + 1];
    for (let side = 0; side < sides; side += 1) {
      const nextSide = (side + 1) % sides;
      mesh.indices.push(
        ringA[side],
        ringA[nextSide],
        ringB[nextSide],
        ringA[side],
        ringB[nextSide],
        ringB[side]
      );
    }
  }

  return mesh;
}

function buildWeightedChainMesh(points, radii, options = {}) {
  return buildSkinnedChainMesh(points, radii, options);
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
      uvTransform: gl.getUniformLocation(program, 'uUvTransform'),
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
  const skyMeshInfo = createMeshBufferInfo(gl, buildSkyDomeGeometry({ radius: options.skyRadius ?? 220 }));
  const dynamicMeshInfo = createMeshBufferInfo(gl, makeMeshData());
  const view = createMat4();
  const identityView = createMat4();
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
    const createGroupInfos = (groups) => {
      if (!Array.isArray(groups) || groups.length === 0) {
        return [];
      }

      return groups.map((group) => ({
        material: group.material,
        meshInfo: createMeshBufferInfo(gl, group.mesh)
      }));
    };
    const built = {
      wall: createMeshBufferInfo(gl, geometry.wall),
      floor: createMeshBufferInfo(gl, geometry.floor),
      ceiling: createMeshBufferInfo(gl, geometry.ceiling),
      wallGroups: createGroupInfos(geometry.wallGroups),
      floorGroups: createGroupInfos(geometry.floorGroups),
      ceilingGroups: createGroupInfos(geometry.ceilingGroups)
    };

    levelGeometryCache.set(geometryKey, built);
    currentGeometryKey = geometryKey;
    currentGeometry = built;
    return built;
  }

  function drawMesh(meshInfo, textureOrBinding, tint, ambient) {
    const binding = normalizeTextureBinding(textureOrBinding);
    if (!meshInfo || !binding?.texture || meshInfo.indexCount <= 0) {
      return;
    }

    bindMesh(gl, programInfo, meshInfo);
    gl.uniformMatrix4fv(programInfo.uniformLocations.model, false, model);
    gl.uniform4fv(programInfo.uniformLocations.uvTransform, new Float32Array(binding.uvTransform || [1, 1, 0, 0]));
    gl.uniform4fv(programInfo.uniformLocations.tint, new Float32Array(tint));
    gl.uniform1f(programInfo.uniformLocations.ambient, ambient);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, binding.texture);
    gl.drawElements(gl.TRIANGLES, meshInfo.indexCount, meshInfo.indexType, 0);
  }

  function drawSkyDome(eye, theme) {
    if (!textures.sky || !skyMeshInfo || skyMeshInfo.indexCount <= 0) {
      return;
    }

    gl.depthMask(false);
    gl.disable(gl.DEPTH_TEST);
    fromTranslationRotationScale(tempModel, eye[0], eye[1], eye[2], 0, 1, 1, 1);
    model.set(tempModel);
    drawMesh(skyMeshInfo, textures.sky, hexColorToRgba(theme.skyTint || '#b2d7ff', 1), 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
  }

  function getThemeSurfaceTint(theme, surfaceType) {
    const key = surfaceType === 'ceiling' ? 'ceilingTint' : surfaceType === 'wall' ? 'wallTint' : 'floorTint';
    return hexColorToRgba(theme[key] || '#ffffff', 1);
  }

  function drawSurfaceGroups(surfaceType, theme, groups, fallbackMesh, fallbackTexture, ambient) {
    const baseTint = getThemeSurfaceTint(theme, surfaceType);
    if (Array.isArray(groups) && groups.length > 0) {
      for (const group of groups) {
        const texture = getSurfaceTexture(textures, group.material, surfaceType);
        drawMesh(group.meshInfo, texture, baseTint, ambient);
      }
      return;
    }

    drawMesh(fallbackMesh, fallbackTexture, baseTint, ambient);
  }

  function drawDynamicMesh(meshData, texture, tint, ambient) {
    if (!meshData || !texture || !Array.isArray(meshData.positions) || meshData.positions.length === 0) {
      return;
    }

    const buffers = meshToBuffers(meshData);
    gl.bindBuffer(gl.ARRAY_BUFFER, dynamicMeshInfo.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, buffers.positions, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, dynamicMeshInfo.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, buffers.normals, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, dynamicMeshInfo.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, buffers.uvs, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dynamicMeshInfo.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffers.indices, gl.DYNAMIC_DRAW);

    dynamicMeshInfo.indexCount = buffers.indices.length;
    dynamicMeshInfo.indexType = buffers.indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
    drawMesh(dynamicMeshInfo, texture, tint, ambient);
  }

  function drawEntityBox(entity, texture, tint, floorHeight, scaleX, scaleY, scaleZ, rotationY, ambient = 0.34) {
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
    drawMesh(boxMeshInfo, texture, tint, ambient);
  }

  function drawViewModelPart(texture, tint, localX, localY, localZ, rotationY, rotationX, scaleX, scaleY, scaleZ, ambient = 0.42) {
    if (!texture) {
      return;
    }

    fromTranslationRotationYawPitchScale(
      tempModel,
      localX,
      localY,
      localZ,
      rotationY,
      rotationX,
      scaleX,
      scaleY,
      scaleZ
    );
    model.set(tempModel);
    drawMesh(boxMeshInfo, texture, tint, ambient);
  }

  function drawFirstPersonWeaponView(state, weaponDef) {
    if (!weaponDef || state?.player?.dead || state?.paused) {
      return;
    }

    const pose = sampleFirstPersonWeaponPose(state, weaponDef);
    const weaponTexture = getPackedTextureBinding(textures, 'weapon', textures.weapon || textures.materialMetal || textures.entity);
    const panelTexture = getPackedTextureBinding(textures, 'uiPanel', textures.uiPanel || textures.materialMetal || weaponTexture);
    const accentTexture = getPackedTextureBinding(textures, 'materialEmissive', textures.materialEmissive || textures.pickup || weaponTexture);
    const weaponTint = scaleTint(pose.weaponTint, 1.16, 1);
    const metalTint = scaleTint(weaponTint, 0.82, 1);
    const darkTint = scaleTint(weaponTint, 0.48, 1);
    const accentTint = scaleTint(weaponTint, 1.28, 1);
    const panelTint = pose.panelTint;
    const baseX = pose.offsetX;
    const baseY = pose.offsetY;
    const baseZ = pose.offsetZ;
    const pitch = pose.pitch;
    const roll = pose.roll;
    const yaw = pose.yaw;
    const bob = pose.bob;
    const sway = pose.sway;
    const kick = pose.kick;
    const ready = pose.ready;

    gl.depthMask(false);
    gl.disable(gl.DEPTH_TEST);
    gl.uniformMatrix4fv(programInfo.uniformLocations.view, false, identityView);

    drawViewModelPart(
      panelTexture,
      panelTint,
      pose.panelOffsetX,
      pose.panelOffsetY + bob * 0.02 - kick * 0.06,
      pose.panelOffsetZ - kick * 0.02,
      roll * 0.18,
      pitch * 0.12,
      pose.panelScaleX,
      pose.panelScaleY,
      pose.panelScaleZ,
      0.68
    );
    drawViewModelPart(
      accentTexture,
      scaleTint(panelTint, 1.08, 0.72),
      pose.panelOffsetX + pose.panelScaleX * 0.08,
      pose.panelOffsetY + pose.panelScaleY * 0.02,
      pose.panelOffsetZ + pose.panelScaleZ * 0.18,
      roll * 0.15,
      pitch * 0.1,
      pose.panelScaleX * 0.08,
      pose.panelScaleY * 0.34,
      pose.panelScaleZ * 0.78,
      0.94
    );

    const viewX = baseX + sway * 0.02 + yaw * 0.08;
    const viewY = baseY + bob * 0.03 - kick * 0.07 + (1 - ready) * 0.015;
    const viewZ = baseZ - kick * 0.22 + (1 - ready) * 0.03;
    const swingY = pitch - kick * 0.06;
    const swingX = roll + bob * 0.02 + yaw * 0.06;

    switch (pose.modelKind) {
      case 'shotgun':
        drawViewModelPart(weaponTexture, weaponTint, viewX - 0.08, viewY - 0.02, viewZ + 0.12, swingY * 0.3, swingX * 0.22, 0.16, 0.22, 0.44, 0.84);
        drawViewModelPart(weaponTexture, metalTint, viewX + 0.02, viewY + 0.02, viewZ + 0.18, swingY * 0.45, swingX * 0.18, 0.24, 0.12, 0.78, 0.88);
        drawViewModelPart(weaponTexture, darkTint, viewX + 0.10, viewY - 0.01, viewZ + 0.34, swingY * 0.55, swingX * 0.16, 0.18, 0.10, 0.46, 0.74);
        drawViewModelPart(weaponTexture, metalTint, viewX - 0.04, viewY - 0.15, viewZ, swingY * 0.18, swingX * 0.12, 0.10, 0.22, 0.16, 0.70);
        break;
      case 'superShotgun':
        drawViewModelPart(weaponTexture, metalTint, viewX - 0.10, viewY - 0.03, viewZ + 0.10, swingY * 0.24, swingX * 0.22, 0.14, 0.24, 0.46, 0.84);
        drawViewModelPart(weaponTexture, weaponTint, viewX + 0.03, viewY + 0.02, viewZ + 0.18, swingY * 0.38, swingX * 0.18, 0.26, 0.14, 0.80, 0.88);
        drawViewModelPart(weaponTexture, darkTint, viewX + 0.16, viewY - 0.01, viewZ + 0.32, swingY * 0.52, swingX * 0.16, 0.20, 0.10, 0.50, 0.74);
        drawViewModelPart(weaponTexture, metalTint, viewX - 0.05, viewY - 0.16, viewZ - 0.02, swingY * 0.18, swingX * 0.12, 0.12, 0.24, 0.16, 0.70);
        drawViewModelPart(weaponTexture, metalTint, viewX + 0.05, viewY - 0.16, viewZ - 0.02, swingY * 0.18, swingX * 0.12, 0.12, 0.24, 0.16, 0.70);
        break;
      case 'chaingun':
        drawViewModelPart(weaponTexture, metalTint, viewX - 0.02, viewY + 0.00, viewZ + 0.08, swingY * 0.24, swingX * 0.18, 0.22, 0.18, 0.34, 0.84);
        drawViewModelPart(weaponTexture, weaponTint, viewX + 0.10, viewY + 0.03, viewZ + 0.16, swingY * 0.34, swingX * 0.16, 0.32, 0.22, 0.40, 0.88);
        drawViewModelPart(weaponTexture, darkTint, viewX + 0.16, viewY + 0.02, viewZ + 0.30, swingY * 0.44, swingX * 0.14, 0.22, 0.16, 0.42, 0.74);
        drawViewModelPart(weaponTexture, metalTint, viewX - 0.06, viewY - 0.16, viewZ - 0.02, swingY * 0.16, swingX * 0.12, 0.12, 0.24, 0.14, 0.70);
        drawViewModelPart(weaponTexture, metalTint, viewX + 0.20, viewY + 0.00, viewZ + 0.18, swingY * 0.28, swingX * 0.14, 0.08, 0.10, 0.32, 0.82);
        break;
      case 'rocketLauncher':
        drawViewModelPart(weaponTexture, metalTint, viewX - 0.06, viewY + 0.02, viewZ + 0.10, swingY * 0.18, swingX * 0.14, 0.18, 0.18, 0.56, 0.84);
        drawViewModelPart(weaponTexture, weaponTint, viewX + 0.12, viewY + 0.02, viewZ + 0.22, swingY * 0.28, swingX * 0.12, 0.30, 0.20, 0.78, 0.88);
        drawViewModelPart(weaponTexture, darkTint, viewX + 0.20, viewY + 0.04, viewZ + 0.36, swingY * 0.34, swingX * 0.10, 0.12, 0.12, 0.34, 0.74);
        drawViewModelPart(weaponTexture, metalTint, viewX - 0.02, viewY - 0.18, viewZ - 0.02, swingY * 0.12, swingX * 0.10, 0.12, 0.22, 0.14, 0.70);
        break;
      case 'plasmaRifle':
        drawViewModelPart(weaponTexture, metalTint, viewX - 0.03, viewY + 0.00, viewZ + 0.10, swingY * 0.20, swingX * 0.16, 0.18, 0.18, 0.48, 0.84);
        drawViewModelPart(weaponTexture, weaponTint, viewX + 0.10, viewY + 0.03, viewZ + 0.20, swingY * 0.28, swingX * 0.14, 0.28, 0.20, 0.60, 0.88);
        drawViewModelPart(accentTexture, accentTint, viewX + 0.18, viewY + 0.02, viewZ + 0.30, swingY * 0.24, swingX * 0.12, 0.12, 0.12, 0.26, 0.94);
        drawViewModelPart(weaponTexture, darkTint, viewX - 0.06, viewY - 0.16, viewZ - 0.02, swingY * 0.14, swingX * 0.10, 0.12, 0.22, 0.16, 0.70);
        break;
      case 'bfg9000':
        drawViewModelPart(weaponTexture, metalTint, viewX - 0.12, viewY + 0.00, viewZ + 0.08, swingY * 0.16, swingX * 0.10, 0.18, 0.18, 0.60, 0.84);
        drawViewModelPart(accentTexture, accentTint, viewX + 0.02, viewY + 0.02, viewZ + 0.18, swingY * 0.12, swingX * 0.08, 0.34, 0.34, 0.38, 0.96);
        drawViewModelPart(weaponTexture, weaponTint, viewX + 0.18, viewY + 0.02, viewZ + 0.26, swingY * 0.22, swingX * 0.10, 0.22, 0.20, 0.72, 0.88);
        drawViewModelPart(weaponTexture, darkTint, viewX - 0.02, viewY - 0.18, viewZ - 0.04, swingY * 0.12, swingX * 0.08, 0.14, 0.24, 0.16, 0.70);
        break;
      default:
        drawViewModelPart(weaponTexture, metalTint, viewX - 0.05, viewY + 0.01, viewZ + 0.10, swingY * 0.22, swingX * 0.18, 0.16, 0.20, 0.42, 0.84);
        drawViewModelPart(weaponTexture, weaponTint, viewX + 0.08, viewY + 0.03, viewZ + 0.22, swingY * 0.34, swingX * 0.15, 0.24, 0.14, 0.60, 0.88);
        drawViewModelPart(weaponTexture, darkTint, viewX + 0.16, viewY + 0.01, viewZ + 0.34, swingY * 0.40, swingX * 0.12, 0.18, 0.10, 0.42, 0.74);
        drawViewModelPart(weaponTexture, metalTint, viewX - 0.03, viewY - 0.16, viewZ - 0.02, swingY * 0.14, swingX * 0.10, 0.10, 0.22, 0.14, 0.70);
        break;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.uniformMatrix4fv(programInfo.uniformLocations.view, false, view);
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

function fromTranslationRotationYawPitchScale(out, x, y, z, rotationY, rotationX, scaleX, scaleY, scaleZ) {
  const cy = Math.cos(rotationY);
  const sy = Math.sin(rotationY);
  const cx = Math.cos(rotationX);
  const sx = Math.sin(rotationX);

  out[0] = cy * scaleX;
  out[1] = 0;
  out[2] = -sy * scaleX;
  out[3] = 0;
  out[4] = -sy * sx * scaleY;
  out[5] = cx * scaleY;
  out[6] = -cy * sx * scaleY;
  out[7] = 0;
  out[8] = sy * cx * scaleZ;
  out[9] = sx * scaleZ;
  out[10] = cy * cx * scaleZ;
  out[11] = 0;
  out[12] = x;
  out[13] = y;
  out[14] = z;
  out[15] = 1;
  return out;
}

function scaleTint(tint, factor, alpha = tint[3]) {
  return [
    Math.max(0, Math.min(1, tint[0] * factor)),
    Math.max(0, Math.min(1, tint[1] * factor)),
    Math.max(0, Math.min(1, tint[2] * factor)),
    alpha
  ];
}

function drawOrientedPart(entity, texture, tint, floorHeight, rotationY, rotationX, localX, localY, localZ, scaleX, scaleY, scaleZ, ambient = 0.34) {
  const offset = rotateLocalOffset(rotationY, localX, localZ);
  fromTranslationRotationYawPitchScale(
    tempModel,
    entity.x + offset.x,
    floorHeight + localY,
    entity.z + offset.z,
    rotationY,
    rotationX,
    scaleX,
    scaleY,
    scaleZ
  );
  model.set(tempModel);
  drawMesh(boxMeshInfo, texture, tint, ambient);
}

function drawRigSegment(entity, texture, skinTint, boneTint, floorHeight, rotationY, jointX, jointY, jointZ, angleX, length, widthX, widthZ, ambient = 0.34, boneScale = 0.52) {
  const centerY = jointY - Math.cos(angleX) * length * 0.5;
  const centerZ = jointZ - Math.sin(angleX) * length * 0.5;
  drawOrientedPart(entity, texture, boneTint, floorHeight, rotationY, angleX, jointX, centerY, centerZ, widthX * boneScale, length * boneScale, widthZ * boneScale, ambient * 0.82);
  drawOrientedPart(entity, texture, skinTint, floorHeight, rotationY, angleX, jointX, centerY, centerZ, widthX, length, widthZ, ambient);
  return {
    y: jointY - Math.cos(angleX) * length,
    z: jointZ - Math.sin(angleX) * length
  };
}

function drawBipedLimb(entity, texture, skinTint, boneTint, floorHeight, rotationY, localX, jointY, jointZ, baseAngle, kneeBend, upperLength, lowerLength, footLength, width, ambient = 0.31) {
  const hipJoint = drawRigSegment(entity, texture, skinTint, boneTint, floorHeight, rotationY, localX, jointY, jointZ, baseAngle, upperLength, width * 0.25, width * 0.18, ambient, 0.42);
  const kneeAngle = baseAngle + kneeBend;
  const ankleJoint = drawRigSegment(entity, texture, skinTint, boneTint, floorHeight, rotationY, localX, hipJoint.y, hipJoint.z, kneeAngle, lowerLength, width * 0.22, width * 0.16, ambient, 0.40);
  return drawRigSegment(entity, texture, skinTint, boneTint, floorHeight, rotationY, localX, ankleJoint.y, ankleJoint.z, kneeAngle - kneeBend * 0.22, footLength, width * 0.30, width * 0.24, ambient, 0.32);
}

function drawArmLimb(entity, texture, skinTint, boneTint, floorHeight, rotationY, localX, jointY, jointZ, shoulderAngle, elbowBend, upperLength, lowerLength, handLength, width, ambient = 0.31) {
  const shoulderJoint = drawRigSegment(entity, texture, skinTint, boneTint, floorHeight, rotationY, localX, jointY, jointZ, shoulderAngle, upperLength, width * 0.22, width * 0.18, ambient, 0.40);
  const elbowAngle = shoulderAngle + elbowBend;
  const wristJoint = drawRigSegment(entity, texture, skinTint, boneTint, floorHeight, rotationY, localX, shoulderJoint.y, shoulderJoint.z, elbowAngle, lowerLength, width * 0.18, width * 0.15, ambient, 0.38);
  return drawRigSegment(entity, texture, skinTint, boneTint, floorHeight, rotationY, localX, wristJoint.y, wristJoint.z, elbowAngle - elbowBend * 0.18, handLength, width * 0.16, width * 0.14, ambient, 0.34);
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

function drawHeldWeapon(entity, texture, tint, floorHeight, rotationY, localX, localY, localZ, weaponModel, weaponPose, bodyWidth, bodyHeight, bodyDepth, weaponPitch = null) {
  if (!weaponModel) {
    return;
  }

  const ready = easeInOut(clamp01(weaponPose));
  const pitch = Number.isFinite(weaponPitch) ? weaponPitch : (-0.18 - ready * 0.42);
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
    drawOrientedPart(entity, texture, weaponTint, floorHeight, rotationY, pitch, localX, localY + lift * 0.05, localZ + forward * 0.06, bodyWidthScale * 0.8, gripHeight * 0.9, bodyDepthScale * 0.55, 0.24);
    drawOrientedPart(entity, texture, weaponTint, floorHeight, rotationY, pitch, localX, localY + lift * 0.12, bodyZ, bodyWidthScale * 1.15, bodyHeightScale * 1.05, bodyDepthScale * 1.15, 0.23);
    drawOrientedPart(entity, texture, weaponTint, floorHeight, rotationY, pitch, localX, localY + lift * 0.10, muzzleZ, bodyWidthScale * 0.70, bodyHeightScale * 0.80, bodyDepthScale * 1.35, 0.22);
    drawOrientedPart(entity, texture, weaponTint, floorHeight, rotationY, pitch, localX + bodyWidth * 0.03, localY - gripHeight * 0.25, bodyZ * 0.92, bodyWidthScale * 0.55, gripHeight * 0.75, bodyDepthScale * 0.72, 0.21);
    return;
  }

  if (weaponModel === 'caster' || weaponModel === 'orb') {
    const glowTint = [
      Math.min(1, weaponTint[0] * 1.08 + 0.08),
      Math.min(1, weaponTint[1] * 1.08 + 0.08),
      Math.min(1, weaponTint[2] * 1.08 + 0.08),
      weaponTint[3]
    ];
    drawOrientedPart(entity, texture, weaponTint, floorHeight, rotationY, pitch, localX, localY - gripHeight * 0.02, localZ + forward * 0.12, gripWidth * 0.9, gripHeight * 1.02, bodyDepthScale * 0.55, 0.24);
    drawOrientedPart(entity, texture, weaponTint, floorHeight, rotationY, pitch, localX, localY + lift * 0.10, bodyZ, bodyWidthScale * 0.85, bodyHeightScale * 0.96, bodyDepthScale * 0.92, 0.22);
    drawOrientedPart(entity, texture, glowTint, floorHeight, rotationY, pitch, localX, localY + bodyHeight * 0.02, muzzleZ + bodyDepth * 0.05, bodyWidthScale * 0.58, bodyHeightScale * 0.66, bodyDepthScale * 0.58, 0.24);
    return;
  }

  if (weaponModel === 'cannon' || weaponModel === 'bossCannon') {
    drawOrientedPart(entity, texture, weaponTint, floorHeight, rotationY, pitch, localX, localY + lift * 0.10, localZ + forward * 0.04, gripWidth * 0.95, gripHeight * 0.98, bodyDepthScale * 0.60, 0.25);
    drawOrientedPart(entity, texture, weaponTint, floorHeight, rotationY, pitch, localX, localY + lift * 0.15, bodyZ, bodyWidthScale * 1.35, bodyHeightScale * 1.10, bodyDepthScale * 1.35, 0.23);
    drawOrientedPart(entity, texture, weaponTint, floorHeight, rotationY, pitch, localX, localY + lift * 0.12, muzzleZ, bodyWidthScale * 1.00, bodyHeightScale * 0.92, bodyDepthScale * 1.55, 0.22);
    drawOrientedPart(entity, texture, weaponTint, floorHeight, rotationY, pitch, localX + bodyWidth * 0.05, localY - gripHeight * 0.24, bodyZ * 0.92, bodyWidthScale * 0.60, gripHeight * 0.72, bodyDepthScale * 0.82, 0.21);
    return;
  }

  drawOrientedPart(entity, texture, weaponTint, floorHeight, rotationY, pitch, localX, localY + lift * 0.04, localZ + forward * 0.08, gripWidth * 0.95, gripHeight * 0.95, bodyDepthScale * 0.56, 0.25);
  drawOrientedPart(entity, texture, weaponTint, floorHeight, rotationY, pitch, localX, localY + lift * 0.10, bodyZ, bodyWidthScale * 0.96, bodyHeightScale * 0.96, bodyDepthScale * 1.00, 0.24);
  drawOrientedPart(entity, texture, weaponTint, floorHeight, rotationY, pitch, localX, localY + lift * 0.10, muzzleZ, bodyWidthScale * 0.78, bodyHeightScale * 0.82, bodyDepthScale * 1.22, 0.22);
}

function drawHumanoidCharacter(entity, texture, tint, floorHeight, scaleX, scaleY, scaleZ, rotationY, bobPhase, aimTarget = null) {
  const profile = resolveCharacterRigProfile(entity, 'humanoid');
  const rig = sampleCharacterRigPose(entity, floorHeight, scaleX, scaleY, scaleZ, bobPhase, aimTarget, profile.pose);
  const meshProfile = profile.mesh || {};
  const weaponProfile = profile.weapon || {};
  const {
    deathBlend,
    hurtBlend,
    attackBlend,
    hurtRecoil,
    deathCollapse,
    spineSlack,
    headHang,
    armDrop,
    legBuckle,
    weaponKick,
    bodyWidth,
    bodyDepth,
    bodyHeight,
    cycle,
    leftGait,
    rightGait,
    stepPlant,
    hurtFlinch,
    collapse,
    bodyDrop,
    bodyBob,
    bodyLean,
    bodyShift,
    stanceBase,
    pelvisHeight,
    torsoHeight,
    neckHeight,
    headHeight,
    pelvisY,
    torsoY,
    neckY,
    headY,
    aimPitch,
    torsoTwist
  } = rig;
  const hipOffset = bodyWidth * 0.22;
  const shoulderOffset = bodyWidth * 0.30;
  const footHeight = bodyHeight * 0.08;
  const lowerLegHeight = bodyHeight * 0.22;
  const thighHeight = bodyHeight * 0.24;
  const upperArmHeight = bodyHeight * 0.20;
  const lowerArmHeight = bodyHeight * 0.18;
  const handHeight = bodyHeight * 0.11;
  const leftHipAngle = -leftGait.swing * 0.55 - leftGait.lift * 0.18 - deathCollapse * 0.48 + hurtRecoil * 0.20;
  const leftKneeBend = 0.58 + leftGait.lift * 0.95 + hurtRecoil * 0.18 + deathCollapse * 0.34;
  const leftKneeAngle = leftHipAngle + leftKneeBend;
  const leftFootAngle = leftKneeAngle - leftKneeBend * 0.22 + deathCollapse * 0.08;
  const rightHipAngle = -rightGait.swing * 0.55 - rightGait.lift * 0.18 - deathCollapse * 0.48 + hurtRecoil * 0.20;
  const rightKneeBend = 0.58 + rightGait.lift * 0.95 + hurtRecoil * 0.18 + deathCollapse * 0.34;
  const rightKneeAngle = rightHipAngle + rightKneeBend;
  const rightFootAngle = rightKneeAngle - rightKneeBend * 0.22 + deathCollapse * 0.08;
  const leftShoulderAngle = leftGait.swing * 0.10 - leftGait.support * 0.14 + hurtRecoil * 0.16 - deathCollapse * 0.22 + aimPitch * 0.08;
  const leftElbowBend = 0.35 + leftGait.lift * 0.35 + hurtRecoil * 0.12 + deathCollapse * 0.18;
  const leftElbowAngle = leftShoulderAngle + leftElbowBend;
  const leftWristAngle = leftElbowAngle - leftElbowBend * 0.18;
  const rightShoulderAngle = -0.34 - attackBlend * 0.62 + rightGait.swing * 0.08 + hurtRecoil * 0.16 - deathCollapse * 0.20 - aimPitch * 0.32;
  const rightElbowBend = 0.50 + attackBlend * 0.84 + hurtRecoil * 0.14 + deathCollapse * 0.18 + Math.max(0, aimPitch) * 0.10;
  const rightElbowAngle = rightShoulderAngle + rightElbowBend;
  const rightWristAngle = rightElbowAngle - rightElbowBend * 0.18;
  const weaponModel = entity.def?.weaponModel
    || weaponProfile.model
    || (entity.def?.behavior === 'hitscan' ? 'pistol' : entity.def?.behavior === 'projectile' ? 'caster' : entity.def?.behavior === 'boss' ? 'bossCannon' : null);
  const weaponPose = attackBlend;
  const attackReach = weaponPose * bodyDepth * (weaponProfile.attackReachScale ?? 0.34) + weaponKick * (weaponProfile.attackKickScale ?? 0.02);
  const armLift = weaponPose * bodyHeight * (weaponProfile.armLiftScale ?? 0.10) + hurtBlend * bodyHeight * (weaponProfile.hurtLiftScale ?? 0.03) + weaponKick * (weaponProfile.weaponLiftScale ?? 0.04);
  const weaponPitch = Math.max(
    weaponProfile.pitchClampMin ?? -1.35,
    Math.min(
      weaponProfile.pitchClampMax ?? 0.65,
      (weaponProfile.pitchBase ?? -0.18)
        - attackBlend * (weaponProfile.pitchAttackScale ?? 0.12)
        + aimPitch * (weaponProfile.pitchAimScale ?? 0.82)
        + hurtRecoil * (weaponProfile.pitchHurtScale ?? 0.28)
        - deathCollapse * (weaponProfile.pitchDeathScale ?? 0.22)
    )
  );

  function point(x, y, z) {
    return { x, y, z };
  }

  function extend(pointValue, angle, length) {
    return {
      x: pointValue.x,
      y: pointValue.y - Math.cos(angle) * length,
      z: pointValue.z - Math.sin(angle) * length
    };
  }

  const torsoPoints = [
    point(bodyShift * 0.10, pelvisY - pelvisHeight * 0.14 + hurtRecoil * 0.01 - deathCollapse * 0.03, bodyLean * 0.08 + torsoTwist * 0.16 + hurtRecoil * bodyDepth * 0.02 - deathCollapse * bodyDepth * 0.04),
    point(bodyShift * 0.12, pelvisY + pelvisHeight * 0.10 + hurtRecoil * 0.02 - deathCollapse * 0.04, bodyLean * 0.12 + torsoTwist * 0.24 + hurtRecoil * bodyDepth * 0.03 - deathCollapse * bodyDepth * 0.06),
    point(bodyShift * 0.15, pelvisY + pelvisHeight * 0.34 + hurtRecoil * 0.02 - deathCollapse * 0.05, bodyLean * 0.16 + torsoTwist * 0.36 + hurtRecoil * bodyDepth * 0.04 - deathCollapse * bodyDepth * 0.08),
    point(bodyShift * 0.18, torsoY - torsoHeight * 0.08 + hurtRecoil * 0.01 - deathCollapse * 0.05, bodyLean * 0.20 + torsoTwist * 0.48 + hurtRecoil * bodyDepth * 0.05 - deathCollapse * bodyDepth * 0.10),
    point(bodyShift * 0.14, torsoY + torsoHeight * 0.18 + hurtRecoil * 0.01 - deathCollapse * 0.06, bodyLean * 0.24 + torsoTwist * 0.60 + hurtRecoil * bodyDepth * 0.05 - deathCollapse * bodyDepth * 0.12),
    point(bodyShift * 0.10, neckY + hurtRecoil * 0.01 - headHang * 0.05, bodyLean * 0.28 + torsoTwist * 0.72 + hurtRecoil * bodyDepth * 0.06 - deathCollapse * bodyDepth * 0.14)
  ];
  const torsoRadii = [
    bodyWidth * 0.24,
    bodyWidth * 0.28,
    bodyWidth * 0.32,
    bodyWidth * 0.30,
    bodyWidth * 0.23,
    bodyWidth * 0.18
  ];

  const headPoints = [
    point(bodyShift * 0.08, neckY - headHeight * 0.08 + hurtRecoil * 0.01 - deathCollapse * 0.04, bodyLean * 0.22 + torsoTwist * 0.16 + hurtRecoil * bodyDepth * 0.04 - deathCollapse * bodyDepth * 0.08),
    point(bodyShift * 0.10, headY - headHeight * 0.04 + hurtRecoil * 0.02 - deathCollapse * 0.05, bodyLean * 0.26 + torsoTwist * 0.28 + hurtRecoil * bodyDepth * 0.05 - deathCollapse * bodyDepth * 0.10),
    point(bodyShift * 0.12, headY + headHeight * 0.12 + hurtRecoil * 0.02 - deathCollapse * 0.06, bodyLean * 0.30 + torsoTwist * 0.40 + hurtRecoil * bodyDepth * 0.05 - deathCollapse * bodyDepth * 0.12),
    point(bodyShift * 0.11, headY + headHeight * 0.28 + hurtRecoil * 0.01 - headHang * 0.05, bodyLean * 0.34 + torsoTwist * 0.52 + hurtRecoil * bodyDepth * 0.04 - deathCollapse * bodyDepth * 0.14),
    point(bodyShift * 0.09, headY + headHeight * 0.38 + hurtRecoil * 0.01 - headHang * 0.08, bodyLean * 0.38 + torsoTwist * 0.62 + hurtRecoil * bodyDepth * 0.03 - deathCollapse * bodyDepth * 0.16)
  ];
  const headRadii = [
    bodyWidth * 0.17,
    bodyWidth * 0.21,
    bodyWidth * 0.22,
    bodyWidth * 0.17,
    bodyWidth * 0.10
  ];

  const leftLegRoot = point(-hipOffset + bodyShift * 0.92, stanceBase, -bodyDepth * 0.04);
  const leftLegPoints = [
    leftLegRoot,
    extend(leftLegRoot, leftHipAngle, thighHeight),
    extend(extend(leftLegRoot, leftHipAngle, thighHeight), leftKneeAngle, lowerLegHeight),
    extend(extend(extend(leftLegRoot, leftHipAngle, thighHeight), leftKneeAngle, lowerLegHeight), leftFootAngle, footHeight)
  ];
  const leftKneeRadius = bodyWidth * (0.15 + leftGait.lift * 0.03 + hurtFlinch * 0.01 + collapse * 0.02);
  const leftAnkleRadius = bodyWidth * (0.11 + leftGait.plant * 0.01);
  const leftLegRadii = [
    bodyWidth * 0.17,
    bodyWidth * 0.15,
    leftKneeRadius,
    leftAnkleRadius
  ];

  const rightLegRoot = point(hipOffset + bodyShift * 0.82, stanceBase, bodyDepth * 0.04);
  const rightLegPoints = [
    rightLegRoot,
    extend(rightLegRoot, rightHipAngle, thighHeight),
    extend(extend(rightLegRoot, rightHipAngle, thighHeight), rightKneeAngle, lowerLegHeight),
    extend(extend(extend(rightLegRoot, rightHipAngle, thighHeight), rightKneeAngle, lowerLegHeight), rightFootAngle, footHeight)
  ];
  const rightKneeRadius = bodyWidth * (0.15 + rightGait.lift * 0.03 + hurtFlinch * 0.01 + collapse * 0.02);
  const rightAnkleRadius = bodyWidth * (0.11 + rightGait.plant * 0.01);
  const rightLegRadii = [
    bodyWidth * 0.17,
    bodyWidth * 0.15,
    rightKneeRadius,
    rightAnkleRadius
  ];

  const leftShoulderRoot = point(-shoulderOffset - bodyShift * 0.10, torsoY - torsoHeight * 0.16, -bodyDepth * 0.02);
  const leftArmPoints = [
    leftShoulderRoot,
    extend(leftShoulderRoot, leftShoulderAngle, upperArmHeight),
    extend(extend(leftShoulderRoot, leftShoulderAngle, upperArmHeight), leftElbowAngle, lowerArmHeight),
    extend(extend(extend(leftShoulderRoot, leftShoulderAngle, upperArmHeight), leftElbowAngle, lowerArmHeight), leftWristAngle, handHeight)
  ];
  const leftElbowRadius = bodyWidth * (0.11 + leftGait.lift * 0.02 + hurtFlinch * 0.01);
  const leftHandRadius = bodyWidth * 0.08;
  const leftArmRadii = [
    bodyWidth * 0.13,
    bodyWidth * 0.11,
    leftElbowRadius,
    leftHandRadius
  ];

  const rightShoulderRoot = point(shoulderOffset - bodyShift * 0.08, torsoY - torsoHeight * 0.14, bodyDepth * 0.02);
  const rightArmPoints = [
    rightShoulderRoot,
    extend(rightShoulderRoot, rightShoulderAngle, upperArmHeight),
    extend(extend(rightShoulderRoot, rightShoulderAngle, upperArmHeight), rightElbowAngle, lowerArmHeight),
    extend(extend(extend(rightShoulderRoot, rightShoulderAngle, upperArmHeight), rightElbowAngle, lowerArmHeight), rightWristAngle, handHeight)
  ];
  const rightElbowRadius = bodyWidth * (0.11 + rightGait.lift * 0.02 + hurtFlinch * 0.01);
  const rightHandRadius = bodyWidth * 0.08;
  const rightArmRadii = [
    bodyWidth * 0.13,
    bodyWidth * 0.11,
    rightElbowRadius,
    rightHandRadius
  ];

  const shoulderBridgePoints = [
    point(leftShoulderRoot.x, leftShoulderRoot.y + bodyHeight * 0.01 - armDrop * 0.06, leftShoulderRoot.z),
    point(bodyShift * 0.05, torsoY - torsoHeight * 0.14 + armDrop * 0.05, torsoTwist * 0.10 - spineSlack * 0.08),
    point(rightShoulderRoot.x, rightShoulderRoot.y + bodyHeight * 0.01 - armDrop * 0.06, rightShoulderRoot.z)
  ];
  const shoulderBridgeRadii = [
    bodyWidth * 0.12,
    bodyWidth * 0.20,
    bodyWidth * 0.12
  ];

  const hipBridgePoints = [
    point(leftLegRoot.x, pelvisY - pelvisHeight * 0.08 + legBuckle * 0.04, leftLegRoot.z),
    point(bodyShift * 0.03, pelvisY + pelvisHeight * 0.02 + legBuckle * 0.03, torsoTwist * -0.08 + spineSlack * 0.04),
    point(rightLegRoot.x, pelvisY - pelvisHeight * 0.08 + legBuckle * 0.04, rightLegRoot.z)
  ];
  const hipBridgeRadii = [
    bodyWidth * 0.13,
    bodyWidth * 0.21,
    bodyWidth * 0.13
  ];

  const torsoMesh = buildWeightedChainMesh(torsoPoints, torsoRadii, meshProfile.torso || {});
  const headMesh = buildWeightedChainMesh(headPoints, headRadii, meshProfile.head || {});
  const limbMeshProfile = meshProfile.limb || {};
  const leftLegMesh = buildWeightedChainMesh(leftLegPoints, leftLegRadii, meshProfile.leg || limbMeshProfile);
  const rightLegMesh = buildWeightedChainMesh(rightLegPoints, rightLegRadii, meshProfile.leg || limbMeshProfile);
  const leftArmMesh = buildWeightedChainMesh(leftArmPoints, leftArmRadii, meshProfile.arm || limbMeshProfile);
  const rightArmMesh = buildWeightedChainMesh(rightArmPoints, rightArmRadii, meshProfile.arm || limbMeshProfile);
  const shoulderBridgeMesh = buildWeightedChainMesh(shoulderBridgePoints, shoulderBridgeRadii, meshProfile.bridge || {});
  const hipBridgeMesh = buildWeightedChainMesh(hipBridgePoints, hipBridgeRadii, meshProfile.bridge || {});

  fromTranslationRotationScale(tempModel, entity.x, floorHeight, entity.z, rotationY, 1, 1, 1);
  model.set(tempModel);
  drawDynamicMesh(torsoMesh, texture, tint, 0.36);
  drawDynamicMesh(headMesh, texture, tint, 0.38);
  drawDynamicMesh(shoulderBridgeMesh, texture, tint, 0.35);
  drawDynamicMesh(hipBridgeMesh, texture, tint, 0.33);
  drawDynamicMesh(leftLegMesh, texture, tint, 0.31);
  drawDynamicMesh(rightLegMesh, texture, tint, 0.31);
  drawDynamicMesh(leftArmMesh, texture, tint, 0.31);
  drawDynamicMesh(rightArmMesh, texture, tint, 0.31);

  const rightHand = rightArmPoints[rightArmPoints.length - 1];
  drawHeldWeapon(entity, texture, tint, floorHeight, rotationY, rightHand.x, rightHand.y - bodyHeight * 0.03 + armLift * 0.4, rightHand.z + attackReach * 0.42, weaponModel, weaponPose, bodyWidth, bodyHeight, bodyDepth, weaponPitch);
}

function drawQuadrupedCharacter(entity, texture, tint, floorHeight, scaleX, scaleY, scaleZ, rotationY, bobPhase) {
  const profile = resolveCharacterRigProfile(entity, 'quadruped');
  const rig = sampleCharacterRigPose(entity, floorHeight, scaleX, scaleY, scaleZ, bobPhase, null, profile.pose);
  const meshProfile = profile.mesh || {};
  const {
    hurtBlend,
    hurtRecoil,
    deathCollapse,
    spineSlack,
    headHang,
    legBuckle,
    bodyWidth,
    bodyDepth,
    bodyHeight,
    cycle,
    leftGait: frontLeft,
    rightGait: frontRight,
    bodyBob,
    bodyLean
  } = rig;
  const rearLeft = frontRight;
  const rearRight = frontLeft;
  const lowerLegHeight = bodyHeight * 0.21;
  const upperLegHeight = bodyHeight * 0.24;
  const pawHeight = bodyHeight * 0.08;
  const bodyBaseY = pawHeight + lowerLegHeight + upperLegHeight - deathCollapse * bodyHeight * 0.04;
  const bodyY = bodyBaseY + bodyHeight * 0.22 + bodyBob * 0.58 + hurtRecoil * bodyHeight * 0.02 - deathCollapse * bodyHeight * 0.06;
  const shoulderY = bodyBaseY + bodyHeight * 0.30 + bodyBob * 0.78 + hurtRecoil * bodyHeight * 0.01 - deathCollapse * bodyHeight * 0.05;
  const neckY = bodyBaseY + bodyHeight * 0.42 + bodyBob * 0.86 + hurtRecoil * bodyHeight * 0.01 - headHang * 0.04;
  const headY = bodyBaseY + bodyHeight * 0.54 + bodyBob * 0.92 + hurtRecoil * bodyHeight * 0.01 - headHang * 0.08 - deathCollapse * bodyHeight * 0.02;
  const frontX = bodyWidth * 0.30;
  const rearX = bodyWidth * 0.24;
  const frontZ = -bodyDepth * 0.22;
  const rearZ = bodyDepth * 0.22;
  function point(x, y, z) {
    return { x, y, z };
  }
  const torsoPoints = [
    point(0, bodyBaseY + bodyHeight * 0.10 - deathCollapse * bodyHeight * 0.02, rearZ * 1.02 - deathCollapse * bodyDepth * 0.03),
    point(bodyLean * 0.04, bodyBaseY + bodyHeight * 0.18 + hurtRecoil * 0.01 - deathCollapse * 0.03, bodyDepth * 0.12 - spineSlack * 0.03),
    point(bodyLean * 0.08, bodyY, 0 + hurtRecoil * 0.01 - deathCollapse * 0.02),
    point(bodyLean * 0.10, shoulderY, -bodyDepth * 0.12 - spineSlack * 0.04),
    point(bodyLean * 0.12, neckY, -bodyDepth * 0.18 - spineSlack * 0.05)
  ];
  const torsoRadii = [
    bodyWidth * 0.28,
    bodyWidth * 0.34,
    bodyWidth * 0.36,
    bodyWidth * 0.30,
    bodyWidth * 0.18
  ];
  const headPoints = [
    point(bodyLean * 0.10, neckY - headHang * 0.04, -bodyDepth * 0.20 + headHang * 0.05),
    point(bodyLean * 0.12, headY - headHang * 0.06, -bodyDepth * 0.34 + headHang * 0.08),
    point(bodyLean * 0.16, headY + bodyHeight * 0.08 - headHang * 0.08, -bodyDepth * 0.50 + headHang * 0.10),
    point(bodyLean * 0.18, headY + bodyHeight * 0.10 - headHang * 0.12, -bodyDepth * 0.62 + headHang * 0.12)
  ];
  const headRadii = [
    bodyWidth * 0.18,
    bodyWidth * 0.22,
    bodyWidth * 0.18,
    bodyWidth * 0.10
  ];

  function extend(pointValue, angle, length, depthBias = 0) {
    return {
      x: pointValue.x,
      y: pointValue.y - Math.cos(angle) * length,
      z: pointValue.z - Math.sin(angle) * length + depthBias
    };
  }

  function buildLeg(root, baseAngle, kneeBend, ankleBend, upperLength, lowerLength, pawLength, width) {
    const knee = extend(root, baseAngle, upperLength);
    const ankle = extend(knee, baseAngle + kneeBend, lowerLength);
    const paw = extend(ankle, baseAngle + kneeBend + ankleBend, pawLength);
    return {
      points: [root, knee, ankle, paw],
      radii: [
        width * 0.26,
        width * 0.22,
        width * 0.18,
        width * 0.14
      ]
    };
  }

  const frontLeftLeg = buildLeg(
    point(-frontX + bodyLean * 0.08, bodyBaseY + bodyHeight * 0.05, frontZ),
    0.78 - frontLeft.swing * 0.42 - frontLeft.lift * 0.20 - hurtBlend * 0.04 + hurtRecoil * 0.12 - deathCollapse * 0.18,
    0.78 + frontLeft.lift * 0.72 + legBuckle * 0.01,
    -0.12 - frontLeft.lift * 0.14 + deathCollapse * 0.05,
    upperLegHeight * 0.98,
    lowerLegHeight * 0.95,
    pawHeight,
    bodyWidth * 0.20
  );
  const frontRightLeg = buildLeg(
    point(frontX + bodyLean * 0.06, bodyBaseY + bodyHeight * 0.05, frontZ),
    0.78 - frontRight.swing * 0.42 - frontRight.lift * 0.20 - hurtBlend * 0.04 + hurtRecoil * 0.12 - deathCollapse * 0.18,
    0.78 + frontRight.lift * 0.72 + legBuckle * 0.01,
    -0.12 - frontRight.lift * 0.14 + deathCollapse * 0.05,
    upperLegHeight * 0.98,
    lowerLegHeight * 0.95,
    pawHeight,
    bodyWidth * 0.20
  );
  const rearLeftLeg = buildLeg(
    point(-rearX + bodyLean * 0.05, bodyBaseY + bodyHeight * 0.02, rearZ),
    0.68 - rearLeft.swing * 0.48 - rearLeft.lift * 0.16 - hurtBlend * 0.03 + hurtRecoil * 0.10 - deathCollapse * 0.16,
    0.84 + rearLeft.lift * 0.74 + legBuckle * 0.01,
    -0.16 - rearLeft.lift * 0.14 + deathCollapse * 0.05,
    upperLegHeight * 1.02,
    lowerLegHeight * 0.96,
    pawHeight * 0.92,
    bodyWidth * 0.18
  );
  const rearRightLeg = buildLeg(
    point(rearX + bodyLean * 0.04, bodyBaseY + bodyHeight * 0.02, rearZ),
    0.68 - rearRight.swing * 0.48 - rearRight.lift * 0.16 - hurtBlend * 0.03 + hurtRecoil * 0.10 - deathCollapse * 0.16,
    0.84 + rearRight.lift * 0.74 + legBuckle * 0.01,
    -0.16 - rearRight.lift * 0.14 + deathCollapse * 0.05,
    upperLegHeight * 1.02,
    lowerLegHeight * 0.96,
    pawHeight * 0.92,
    bodyWidth * 0.18
  );

  const tailPoints = [
    point(bodyLean * 0.02, bodyBaseY + bodyHeight * 0.12 - deathCollapse * bodyHeight * 0.02, rearZ * 1.10 + deathCollapse * bodyDepth * 0.02),
    point(bodyLean * 0.00, bodyBaseY + bodyHeight * 0.08 - deathCollapse * bodyHeight * 0.03, rearZ * 1.28 + deathCollapse * bodyDepth * 0.03),
    point(bodyLean * 0.08, bodyBaseY + bodyHeight * 0.04 - deathCollapse * bodyHeight * 0.04, rearZ * 1.45 + deathCollapse * bodyDepth * 0.04)
  ];
  const tailRadii = [
    bodyWidth * 0.12,
    bodyWidth * 0.08,
    bodyWidth * 0.04
  ];

  fromTranslationRotationScale(tempModel, entity.x, floorHeight, entity.z, rotationY, 1, 1, 1);
  model.set(tempModel);
  drawDynamicMesh(buildWeightedChainMesh(torsoPoints, torsoRadii, meshProfile.torso || {}), texture, tint, 0.35);
  drawDynamicMesh(buildWeightedChainMesh(headPoints, headRadii, meshProfile.head || {}), texture, tint, 0.37);
  const limbMeshProfile = meshProfile.leg || meshProfile.limb || {};
  drawDynamicMesh(buildWeightedChainMesh(frontLeftLeg.points, frontLeftLeg.radii, limbMeshProfile), texture, tint, 0.31);
  drawDynamicMesh(buildWeightedChainMesh(frontRightLeg.points, frontRightLeg.radii, limbMeshProfile), texture, tint, 0.31);
  drawDynamicMesh(buildWeightedChainMesh(rearLeftLeg.points, rearLeftLeg.radii, limbMeshProfile), texture, tint, 0.31);
  drawDynamicMesh(buildWeightedChainMesh(rearRightLeg.points, rearRightLeg.radii, limbMeshProfile), texture, tint, 0.31);
  drawDynamicMesh(buildWeightedChainMesh(tailPoints, tailRadii, meshProfile.tail || {}), texture, tint, 0.29);
}

function drawFloatingCharacter(entity, texture, tint, floorHeight, scaleX, scaleY, scaleZ, rotationY, bobPhase) {
  const profile = resolveCharacterRigProfile(entity, 'floating');
  const rig = sampleCharacterRigPose(entity, floorHeight, scaleX, scaleY, scaleZ, bobPhase, null, profile.pose);
  const meshProfile = profile.mesh || {};
  const {
    deathBlend,
    hurtBlend,
    hurtRecoil,
    deathCollapse,
    spineSlack,
    headHang,
    bodyWidth,
    bodyDepth,
    bodyHeight,
    cycle,
    bodyBob,
    bodyLean,
    bodyShift,
    torsoY,
    headY
  } = rig;

  function point(x, y, z) {
    return { x, y, z };
  }

  function buildTendril(rootX, rootZ, sway, length, spread) {
    const baseY = torsoY - bodyHeight * 0.04 + bodyBob * 0.12 - deathCollapse * bodyHeight * 0.03;
    return [
      point(rootX, baseY, rootZ),
      point(rootX + sway * 0.15, baseY - length * 0.34, rootZ + spread * 0.10),
      point(rootX + sway * 0.22, baseY - length * 0.72, rootZ + spread * 0.18)
    ];
  }

  const pulse = Math.sin(cycle * 0.75) * bodyWidth * 0.03;
  const bodyCenterY = torsoY + bodyHeight * 0.08 + bodyBob * 0.28 + hurtRecoil * bodyHeight * 0.03 - deathCollapse * bodyHeight * 0.08;
  const bodyPoints = [
    point(bodyShift * 0.02 + bodyLean * 0.05, bodyCenterY - bodyHeight * 0.24 + hurtBlend * bodyHeight * 0.01, bodyDepth * 0.02),
    point(bodyShift * 0.04 + pulse + bodyLean * 0.06, bodyCenterY - bodyHeight * 0.08 + spineSlack * 0.03, bodyDepth * 0.08),
    point(bodyShift * 0.05 + pulse + bodyLean * 0.08, bodyCenterY + bodyHeight * 0.10 - headHang * 0.03, -bodyDepth * 0.02),
    point(bodyShift * 0.03 + bodyLean * 0.04, bodyCenterY + bodyHeight * 0.24 - headHang * 0.06 - deathCollapse * 0.04, -bodyDepth * 0.08)
  ];
  const bodyRadii = [
    bodyWidth * 0.28,
    bodyWidth * 0.36,
    bodyWidth * 0.34,
    bodyWidth * 0.24
  ];

  const corePoints = [
    point(bodyShift * 0.03 + bodyLean * 0.03, bodyCenterY - bodyHeight * 0.08, bodyDepth * 0.00),
    point(bodyShift * 0.04 + bodyLean * 0.04, bodyCenterY + bodyHeight * 0.02, bodyDepth * 0.02),
    point(bodyShift * 0.03 + bodyLean * 0.03, bodyCenterY + bodyHeight * 0.12, -bodyDepth * 0.01)
  ];
  const coreRadii = [
    bodyWidth * 0.18,
    bodyWidth * 0.20,
    bodyWidth * 0.16
  ];

  const eyePoints = [
    point(bodyShift * 0.01 + bodyLean * 0.04, bodyCenterY + bodyHeight * 0.18, -bodyDepth * 0.18),
    point(bodyShift * 0.02 + bodyLean * 0.05, headY + bodyHeight * 0.02, -bodyDepth * 0.25),
    point(bodyShift * 0.03 + bodyLean * 0.06, headY + bodyHeight * 0.10, -bodyDepth * 0.30)
  ];
  const eyeRadii = [
    bodyWidth * 0.08,
    bodyWidth * 0.10,
    bodyWidth * 0.06
  ];

  const tendrilFrontLeft = buildTendril(-bodyWidth * 0.16, -bodyDepth * 0.08, -bodyWidth * 0.14, bodyHeight * 0.26, -bodyDepth * 0.10);
  const tendrilFrontRight = buildTendril(bodyWidth * 0.16, -bodyDepth * 0.04, bodyWidth * 0.14, bodyHeight * 0.26, -bodyDepth * 0.06);
  const tendrilRearLeft = buildTendril(-bodyWidth * 0.14, bodyDepth * 0.10, -bodyWidth * 0.10, bodyHeight * 0.22, bodyDepth * 0.10);
  const tendrilRearRight = buildTendril(bodyWidth * 0.14, bodyDepth * 0.12, bodyWidth * 0.10, bodyHeight * 0.22, bodyDepth * 0.12);

  fromTranslationRotationScale(tempModel, entity.x, floorHeight, entity.z, rotationY, 1, 1, 1);
  model.set(tempModel);
  drawDynamicMesh(buildWeightedChainMesh(bodyPoints, bodyRadii, meshProfile.body || {}), texture, tint, 0.36);
  drawDynamicMesh(buildWeightedChainMesh(corePoints, coreRadii, meshProfile.core || {}), texture, tint, 0.38);
  drawDynamicMesh(buildWeightedChainMesh(eyePoints, eyeRadii, meshProfile.core || {}), texture, tint, 0.39);
  drawDynamicMesh(buildWeightedChainMesh(tendrilFrontLeft, [bodyWidth * 0.08, bodyWidth * 0.05, bodyWidth * 0.03], meshProfile.tendril || {}), texture, tint, 0.30);
  drawDynamicMesh(buildWeightedChainMesh(tendrilFrontRight, [bodyWidth * 0.08, bodyWidth * 0.05, bodyWidth * 0.03], meshProfile.tendril || {}), texture, tint, 0.30);
  drawDynamicMesh(buildWeightedChainMesh(tendrilRearLeft, [bodyWidth * 0.07, bodyWidth * 0.04, bodyWidth * 0.025], meshProfile.tendril || {}), texture, tint, 0.29);
  drawDynamicMesh(buildWeightedChainMesh(tendrilRearRight, [bodyWidth * 0.07, bodyWidth * 0.04, bodyWidth * 0.025], meshProfile.tendril || {}), texture, tint, 0.29);
}

  function render(state) {
    const level = state.level;
    const geometry = ensureLevelGeometry(level);

    resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);

    const areaTheme = resolveAreaTheme(level, state.player.x, state.player.z);
    const entityTexture = getPackedTextureBinding(textures, 'entity', textures.entity);
    const pickupTexture = getPackedTextureBinding(textures, 'pickup', textures.pickup);
    const projectileTexture = getPackedTextureBinding(textures, 'projectile', textures.projectile);
    const sky = parseSkyColor(areaTheme.clearColor || level.skyColor || '#4d6f96');
    gl.clearColor(sky[0], sky[1], sky[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(programInfo.program);

    const aspect = canvas.width / Math.max(1, canvas.height);
    perspectiveMat4(projection, Math.PI / 3.1, aspect, 0.05, 160);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projection, false, projection);

    const floorHeight = level.getFloorHeightAt ? level.getFloorHeightAt(state.player.x, state.player.z) : 0;
    const eyeHeight = state.player.eyeHeight || 1.58;
    const eye = [state.player.x, floorHeight + eyeHeight, state.player.z];
    const playerAimPoint = {
      x: state.player.x,
      y: eye[1],
      z: state.player.z
    };
    const forward = [
      Math.cos(state.player.yaw) * Math.cos(state.player.pitch),
      Math.sin(state.player.pitch),
      Math.sin(state.player.yaw) * Math.cos(state.player.pitch)
    ];
    const target = [eye[0] + forward[0], eye[1] + forward[1], eye[2] + forward[2]];
    lookAtMat4(view, eye, target, [0, 1, 0]);
    gl.uniformMatrix4fv(programInfo.uniformLocations.view, false, view);

    drawSkyDome(eye, areaTheme);

    if (geometry) {
      identityMat4(model);
      drawSurfaceGroups('floor', areaTheme, geometry.floorGroups, geometry.floor, textures.floor, areaTheme.floorAmbient ?? 0.86);
      drawSurfaceGroups('ceiling', areaTheme, geometry.ceilingGroups, geometry.ceiling, textures.ceiling, areaTheme.ceilingAmbient ?? 0.52);
      drawSurfaceGroups('wall', areaTheme, geometry.wallGroups, geometry.wall, textures.wall, areaTheme.wallAmbient ?? 0.74);
    }

    function drawDecoration(decoration, texture, tint, ambient = 0.34, overrideScale = null, yBias = 0) {
      if (!decoration) {
        return;
      }

      const floor = level.getFloorHeightAt ? level.getFloorHeightAt(decoration.x, decoration.z) : 0;
      const scaleX = Math.max(0.04, Number(overrideScale?.x ?? decoration.width ?? decoration.radius * 2 ?? 0.5) || 0.5);
      const scaleY = Math.max(0.02, Number(overrideScale?.y ?? decoration.height ?? 0.35) || 0.35);
      const scaleZ = Math.max(0.04, Number(overrideScale?.z ?? decoration.depth ?? decoration.radius * 2 ?? 0.5) || 0.5);
      const rotationY = Number(overrideScale?.rotationY ?? decoration.rotationY ?? decoration.rotation ?? 0) || 0;
      const tintCopy = Array.isArray(tint) ? [...tint] : [1, 1, 1, 1];

      drawEntityBox(
        decoration,
        texture,
        tintCopy,
        floor + (Number(decoration.y ?? 0) || 0) + yBias,
        scaleX,
        scaleY,
        scaleZ,
        rotationY,
        ambient
      );
    }

    for (const prop of level.props || []) {
      const tint = hexColorToRgba(prop.color || '#8b97a5', prop.alpha ?? 1);
      const ambient = prop.kind === 'console' ? 0.42 : prop.kind === 'column' ? 0.28 : 0.34;
      drawDecoration(prop, entityTexture, tint, ambient);
    }

    for (const light of level.lights || []) {
      const pulse = light.pulse ? 0.85 + Math.sin((state.timeMs + light.x * 17 + light.z * 13) * 0.005 + light.pulse) * 0.15 : 1;
      const baseTint = hexColorToRgba(light.color || '#fff0be', (light.alpha ?? 1) * pulse);
      const haloTint = [baseTint[0], baseTint[1], baseTint[2], baseTint[3] * 0.22];
      drawDecoration(light, pickupTexture, baseTint, 0.72, {
        x: (Number(light.width ?? light.radius ?? 0.18) || 0.18) * 0.8,
        y: Math.max(0.04, Number(light.height ?? 0.12) || 0.12),
        z: (Number(light.depth ?? light.radius ?? 0.18) || 0.18) * 0.8
      });
      drawDecoration(light, pickupTexture, haloTint, 0.18, {
        x: (Number(light.width ?? light.radius ?? 0.18) || 0.18) * 2.4,
        y: Math.max(0.02, Number(light.height ?? 0.08) || 0.08) * 0.35,
        z: (Number(light.depth ?? light.radius ?? 0.18) || 0.18) * 2.4
      });
    }

    for (const decal of state.decals || []) {
      const remaining = decal.static
        ? 1
        : Math.max(0, 1 - (Number(decal.ageMs) || 0) / Math.max(1, Number(decal.lifeMs) || 1));
      const tint = hexColorToRgba(decal.color || '#2c2f37', (decal.alpha ?? 0.85) * remaining);
      drawDecoration(decal, getDecalTexture(textures, decal), tint, 0.08, {
        x: decal.width || 0.5,
        y: decal.height || 0.03,
        z: decal.depth || 0.5,
        rotationY: decal.rotation || 0
      });
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
      const characterVariant = enemy.def?.rig?.variant || enemy.def?.model;
      switch (characterVariant) {
        case 'humanoid':
          drawHumanoidCharacter(enemy, entityTexture, tint, entityFloor, enemy.radius * 2.0, enemy.height, enemy.radius * 1.8, enemy.facing + Math.PI * 0.5, enemy.bobPhase || 0, playerAimPoint);
          break;
        case 'quadruped':
          drawQuadrupedCharacter(enemy, entityTexture, tint, entityFloor, enemy.radius * 2.2, enemy.height, enemy.radius * 2.1, enemy.facing + Math.PI * 0.5, enemy.bobPhase || 0);
          break;
        case 'floating':
          drawFloatingCharacter(enemy, entityTexture, tint, entityFloor, enemy.radius * 2.35, enemy.height * 0.92, enemy.radius * 2.35, enemy.facing + Math.PI * 0.5, enemy.bobPhase || 0);
          break;
        default:
          drawEntityBox(enemy, entityTexture, tint, entityFloor, enemy.radius * 2.1, enemy.height, enemy.radius * 2.1, enemy.facing + Math.PI * 0.5);
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
      drawEntityBox(pickup, pickupTexture, tint, pickupFloor + wobble, 0.34, 0.34, 0.34, state.timeMs * 0.0012);
    }

    for (const projectile of state.projectiles) {
      const tint = projectile.color ? hexColorToRgba(projectile.color, 1) : [1, 1, 1, 1];
      const projectileFloor = level.getFloorHeightAt ? level.getFloorHeightAt(projectile.x, projectile.z) : 0;
      drawEntityBox(projectile, projectileTexture, tint, projectileFloor + 0.15, projectile.radius * 2.2, projectile.radius * 2.2, projectile.radius * 2.2, state.timeMs * 0.004);
    }

    for (const effect of state.effects || []) {
      const remaining = Math.max(0, 1 - (Number(effect.ageMs) || 0) / Math.max(1, Number(effect.lifeMs) || 1));
      const tint = hexColorToRgba(effect.color || '#ffffff', (effect.alpha ?? 1) * remaining);
      const effectFloor = level.getFloorHeightAt ? level.getFloorHeightAt(effect.x, effect.z) : 0;
      drawEntityBox(
        effect,
        projectileTexture,
        tint,
        effectFloor + (Number(effect.y ?? 0) || 0),
        Math.max(0.04, (effect.radius || 0.06) * 1.4),
        Math.max(0.04, (effect.radius || 0.06) * 1.2),
        Math.max(0.04, (effect.radius || 0.06) * 1.4),
        state.timeMs * 0.005 + (effect.id || 0) * 0.1,
        0.62
      );
    }

    drawFirstPersonWeaponView(state, getWeaponDef(WEAPON_ORDER[state.player.weaponIndex] || WEAPON_ORDER[0]));
  }

  function dispose() {
    for (const cached of levelGeometryCache.values()) {
      disposeMeshInfo(gl, cached.wall);
      disposeMeshInfo(gl, cached.floor);
      disposeMeshInfo(gl, cached.ceiling);
      for (const group of cached.wallGroups || []) {
        disposeMeshInfo(gl, group.meshInfo);
      }
      for (const group of cached.floorGroups || []) {
        disposeMeshInfo(gl, group.meshInfo);
      }
      for (const group of cached.ceilingGroups || []) {
        disposeMeshInfo(gl, group.meshInfo);
      }
    }
    disposeMeshInfo(gl, boxMeshInfo);
    disposeMeshInfo(gl, skyMeshInfo);
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
