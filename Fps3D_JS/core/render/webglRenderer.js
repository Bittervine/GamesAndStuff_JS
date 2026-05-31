import { createMat4, perspectiveMat4, lookAtMat4, fromTranslationRotationScale, identityMat4 } from '../math/mat4.js';
import { getThemeAt } from '../world/level.js';
import { WEAPON_ORDER, getWeaponDef } from '../../data/weapons.js';
import { CHARACTER_PRODUCTION_GUIDE, QUATERNIUS_HUMANOID_RIG } from '../../data/characterAssets.js';

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

function wrapAngle(angle) {
  let out = angle;
  while (out > Math.PI) out -= Math.PI * 2;
  while (out < -Math.PI) out += Math.PI * 2;
  return out;
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

export const CHARACTER_ASSET_SPEC = {
  version: 1,
  targetStyle: 'stylized-realistic',
  gameplayUse: 'mid-range enemy readability from 3 to 28 meters, with close inspection only in debug preview scenes',
  cameraDistanceMeters: {
    close: 3,
    typical: 10,
    far: 28
  },
  performance: {
    maxTriangles: 7000,
    maxTextureSize: 1024,
    maxTextureSets: 1,
    maxMaterials: 2,
    targetVisibleCharacters: 24,
    targetFrameMs: 16.7
  },
  skeleton: {
    name: QUATERNIUS_HUMANOID_RIG.name,
    requiredBones: QUATERNIUS_HUMANOID_RIG.bones,
    optionalBones: [],
    allowExtraBones: false
  },
  proportions: {
    heightMeters: [1.45, 2.35],
    headsTall: [6.4, 8.2],
    shoulderWidthToHeight: [0.22, 0.34],
    hipWidthToHeight: [0.15, 0.27],
    armSpanToHeight: [0.9, 1.1],
    handLengthToHeight: [0.075, 0.125],
    footLengthToHeight: [0.12, 0.19],
    kneeHeightToHeight: [0.23, 0.34],
    elbowHeightToHeight: [0.48, 0.68]
  },
  orthographicPreviews: ['front', 'side', 'back'],
  animationClips: ['idle', 'walk', 'run', 'stop', 'turn', 'jump', 'hitReaction', 'death', 'interact'],
  topologyZones: ['shoulders', 'elbows', 'wrists', 'hips', 'knees', 'ankles', 'neck', 'jaw'],
  deformation: {
    maxFootSlideMeters: 0.05,
    maxFootFloatMeters: 0.035,
    maxStretchRatio: 1.12,
    maxJointCollapseRatio: 0.35
  }
};

function normalizeNamedList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      }
      if (item && typeof item === 'object') {
        return item.id || item.name || item.key || '';
      }
      return '';
    })
    .filter((item) => typeof item === 'string' && item.length > 0);
}

function pushRangeValidation(errors, label, value, range) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    errors.push(`${label} is missing`);
    return;
  }

  const min = Number(range?.[0]);
  const max = Number(range?.[1]);
  if (numericValue < min || numericValue > max) {
    errors.push(`${label} ${numericValue} is outside ${min}-${max}`);
  }
}

function pushMaxValidation(errors, label, value, max, suffix = '') {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    errors.push(`${label} is missing`);
    return;
  }

  if (numericValue > max) {
    errors.push(`${label} ${numericValue}${suffix} exceeds ${max}${suffix}`);
  }
}

function scoreCharacterExample(asset, example, spec = CHARACTER_ASSET_SPEC, guide = CHARACTER_PRODUCTION_GUIDE.styleBible) {
  const assetMetrics = asset?.metrics || {};
  const assetDeformation = asset?.deformation || {};
  const comparisonMetrics = Array.isArray(guide?.comparisonMetrics) && guide.comparisonMetrics.length > 0
    ? guide.comparisonMetrics
    : Object.keys(spec.proportions || {});
  const metricDeltas = {};
  const deformationDeltas = {};
  let totalDelta = 0;
  let totalCount = 0;

  for (const key of comparisonMetrics) {
    const assetValue = Number(assetMetrics[key]);
    const referenceValue = Number(example?.metrics?.[key]);
    if (!Number.isFinite(assetValue) || !Number.isFinite(referenceValue)) {
      continue;
    }

    const range = spec.proportions?.[key];
    const span = Number.isFinite(range?.[0]) && Number.isFinite(range?.[1]) && range[1] > range[0]
      ? Math.max(1e-6, range[1] - range[0])
      : Math.max(1e-6, Math.abs(referenceValue) || 1);
    const delta = Math.abs(assetValue - referenceValue) / span;
    metricDeltas[key] = delta;
    totalDelta += delta;
    totalCount += 1;
  }

  for (const key of Object.keys(example?.deformation || {})) {
    const assetValue = Number(assetDeformation[key]);
    const referenceValue = Number(example?.deformation?.[key]);
    if (!Number.isFinite(assetValue) || !Number.isFinite(referenceValue)) {
      continue;
    }

    const span = Number(spec.deformation?.[key]) || Math.max(0.01, Math.abs(referenceValue) || 0.01);
    const delta = Math.abs(assetValue - referenceValue) / span;
    deformationDeltas[key] = delta;
    totalDelta += delta;
    totalCount += 1;
  }

  return {
    score: totalCount > 0 ? clamp01(1 - totalDelta / totalCount) : 0,
    metricDeltas,
    deformationDeltas,
    totalCount
  };
}

export function validateCharacterAsset(asset, spec = CHARACTER_ASSET_SPEC) {
  const errors = [];
  const warnings = [];
  const metrics = asset?.metrics || {};

  for (const [metricName, range] of Object.entries(spec.proportions || {})) {
    pushRangeValidation(errors, metricName, metrics[metricName], range);
  }

  const triangleCount = Number(asset?.triangleCount ?? asset?.triangles);
  if (!Number.isFinite(triangleCount)) {
    errors.push('triangleCount is missing');
  } else if (triangleCount > spec.performance.maxTriangles) {
    errors.push(`triangleCount ${triangleCount} exceeds ${spec.performance.maxTriangles}`);
  }

  const materialCount = Number(asset?.materialCount ?? asset?.materials?.length);
  if (!Number.isFinite(materialCount)) {
    errors.push('materialCount is missing');
  } else if (materialCount > spec.performance.maxMaterials) {
    errors.push(`materialCount ${materialCount} exceeds ${spec.performance.maxMaterials}`);
  }

  const textures = Array.isArray(asset?.textures) ? asset.textures : [];
  if (textures.length === 0) {
    errors.push('textures are missing');
  }
  if (textures.length > spec.performance.maxTextureSets) {
    errors.push(`texture set count ${textures.length} exceeds ${spec.performance.maxTextureSets}`);
  }
  for (const texture of textures) {
    const width = Number(texture?.width);
    const height = Number(texture?.height);
    if (Number.isFinite(width) && width > spec.performance.maxTextureSize) {
      errors.push(`texture width ${width} exceeds ${spec.performance.maxTextureSize}`);
    }
    if (Number.isFinite(height) && height > spec.performance.maxTextureSize) {
      errors.push(`texture height ${height} exceeds ${spec.performance.maxTextureSize}`);
    }
  }

  const previews = new Set(normalizeNamedList(asset?.orthographicPreviews || asset?.previews));
  for (const preview of spec.orthographicPreviews || []) {
    if (!previews.has(preview)) {
      errors.push(`missing ${preview} orthographic preview`);
    }
  }

  const clips = new Set(normalizeNamedList(asset?.animationClips || asset?.animations));
  for (const clip of spec.animationClips || []) {
    if (!clips.has(clip)) {
      errors.push(`missing ${clip} animation clip`);
    }
  }

  const bones = normalizeNamedList(asset?.skeleton?.bones || asset?.bones);
  const boneSet = new Set(bones);
  const requiredBones = spec.skeleton?.requiredBones || [];
  const optionalBones = new Set(spec.skeleton?.optionalBones || []);
  if (asset?.skeleton?.name !== spec.skeleton?.name) {
    errors.push(`skeleton name must be ${spec.skeleton.name}`);
  }
  for (const bone of requiredBones) {
    if (!boneSet.has(bone)) {
      errors.push(`missing skeleton bone ${bone}`);
    }
  }
  if (spec.skeleton?.allowExtraBones === false) {
    for (const bone of bones) {
      if (!requiredBones.includes(bone) && !optionalBones.has(bone)) {
        errors.push(`unexpected skeleton bone ${bone}`);
      }
    }
  }

  const topologyZones = new Set(normalizeNamedList(asset?.cleanTopologyZones || asset?.topologyZones));
  for (const zone of spec.topologyZones || []) {
    if (!topologyZones.has(zone)) {
      errors.push(`missing clean topology zone ${zone}`);
    }
  }

  const deformation = asset?.deformation || {};
  pushMaxValidation(errors, 'maxFootSlideMeters', deformation.maxFootSlideMeters, spec.deformation.maxFootSlideMeters, 'm');
  pushMaxValidation(errors, 'maxFootFloatMeters', deformation.maxFootFloatMeters, spec.deformation.maxFootFloatMeters, 'm');
  pushMaxValidation(errors, 'maxStretchRatio', deformation.maxStretchRatio, spec.deformation.maxStretchRatio);
  pushMaxValidation(errors, 'maxJointCollapseRatio', deformation.maxJointCollapseRatio, spec.deformation.maxJointCollapseRatio);
  if (!asset?.orthographicPreviews && !asset?.previews) {
    warnings.push('orthographic previews should be reviewed by the user before acceptance');
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    specVersion: spec.version,
    targetStyle: spec.targetStyle,
    skeleton: spec.skeleton.name
  };
}

export function reviewCharacterAssetAgainstStyleBible(asset, guide = CHARACTER_PRODUCTION_GUIDE, spec = CHARACTER_ASSET_SPEC) {
  const guideData = guide || CHARACTER_PRODUCTION_GUIDE;
  const styleBible = guideData.styleBible || guideData;
  const validation = validateCharacterAsset(asset, spec);
  const acceptedComparisons = Array.isArray(styleBible?.acceptedExamples)
    ? styleBible.acceptedExamples.map((example) => ({
        id: example.id,
        label: example.label || example.id,
        ...scoreCharacterExample(asset, example, spec, styleBible)
      }))
    : [];
  const rejectedComparisons = Array.isArray(styleBible?.rejectedExamples)
    ? styleBible.rejectedExamples.map((example) => ({
        id: example.id,
        label: example.label || example.id,
        ...scoreCharacterExample(asset, example, spec, styleBible)
      }))
    : [];

  const acceptedMatch = acceptedComparisons.reduce((best, comparison) => {
    if (!best || comparison.score > best.score) {
      return comparison;
    }
    return best;
  }, null);
  const rejectedMatch = rejectedComparisons.reduce((best, comparison) => {
    if (!best || comparison.score > best.score) {
      return comparison;
    }
    return best;
  }, null);

  const acceptedThreshold = Number(styleBible?.acceptedScoreThreshold ?? 0.82) || 0.82;
  const rejectedThreshold = Number(styleBible?.rejectedSimilarityThreshold ?? 0.7) || 0.7;
  const acceptedEnough = !!acceptedMatch && acceptedMatch.score >= acceptedThreshold;
  const rejectedTooSimilar = !!rejectedMatch && rejectedMatch.score >= rejectedThreshold;

  let decision = 'review';
  if (!validation.ok) {
    decision = 'rejected';
  } else if (rejectedTooSimilar) {
    decision = 'rejected';
  } else if (acceptedEnough) {
    decision = 'accepted';
  }

  return {
    ...validation,
    decision,
    needsUserReview: decision !== 'accepted',
    acceptedExampleId: acceptedMatch?.id || null,
    acceptedExampleScore: acceptedMatch?.score || 0,
    rejectedExampleId: rejectedMatch?.id || null,
    rejectedExampleScore: rejectedMatch?.score || 0,
    acceptedComparisons,
    rejectedComparisons,
    reviewStages: Array.isArray(guideData.reviewStages) ? guideData.reviewStages.map((stage) => ({ ...stage })) : [],
    approvalPolicy: guideData?.approvalPolicy ? { ...guideData.approvalPolicy } : {},
    baseMeshPolicy: guideData?.baseMeshPolicy ? { ...guideData.baseMeshPolicy } : {},
    styleBibleVersion: Number(guideData?.version ?? styleBible?.version ?? 0) || 0
  };
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
  const aimYawRaw = aimTarget
    ? Math.atan2((aimTarget.x ?? 0) - (entity?.x ?? 0), (aimTarget.z ?? 0) - (entity?.z ?? 0)) - (entity?.facing ?? 0)
    : 0;
  const aimYaw = wrapAngle(aimYawRaw);
  const lookBlend = clamp01((Math.abs(aimYaw) / (Math.PI * 0.75)) * 0.72 + attackBlend * 0.34 + hurtBlend * 0.22 + deathBlend * 0.48);
  const handReach = clamp01(attackBlend * 0.84 + hurtBlend * 0.22 + deathBlend * 0.08);
  const leftFootPlant = clamp01(leftGait.plant * motionBlend + (1 - motionBlend) * 0.35);
  const rightFootPlant = clamp01(rightGait.plant * motionBlend + (1 - motionBlend) * 0.35);
  const leftFootLift = clamp01(leftGait.lift * motionBlend + hurtBlend * 0.08);
  const rightFootLift = clamp01(rightGait.lift * motionBlend + hurtBlend * 0.08);
  const footSlip = clamp01((1 - stepPlant) * 0.12 + hurtBlend * 0.04 + deathBlend * 0.03);

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
    weaponKick,
    ik: {
      aimYaw,
      aimPitch,
      lookBlend,
      handReach,
      leftFootPlant,
      rightFootPlant,
      leftFootLift,
      rightFootLift,
      footSlip,
      leftHandReach: handReach,
      rightHandReach: handReach,
      lookTargetBlend: lookBlend,
      aimBlend: clamp01(attackBlend + hurtBlend * 0.2),
      footPlantBlend: stepPlant
    }
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
    proportions: {
      hipOffsetScale: 0.19,
      shoulderOffsetScale: 0.29,
      footHeightScale: 0.07,
      lowerLegScale: 0.245,
      thighScale: 0.255,
      upperArmScale: 0.19,
      lowerArmScale: 0.18,
      handScale: 0.095,
      footPadWidthScale: 0.18,
      footPadHeightScale: 0.045,
      footPadDepthScale: 0.18,
      handPadWidthScale: 0.07,
      handPadHeightScale: 0.08,
      handPadDepthScale: 0.075
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
    proportions: rigData.proportions,
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
