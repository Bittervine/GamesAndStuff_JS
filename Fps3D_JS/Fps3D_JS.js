import { createGameState, advanceGameState, applyDifficultyToState, DIFFICULTY_ORDER, getDifficultyConfig, normalizeDifficultyId, snapshotGameState } from './core/game/state.js';
import { createInputController } from './core/game/input.js';
import { createFixedStepAccumulator, normalizeElapsedMs } from './core/sim/fixedStep.js';
import { createGameTextures, disposeTextures } from './core/render/textures.js';
import { sampleCharacterRigPose, sampleFirstPersonWeaponPose } from './core/render/webglRenderer.js';
import { buildLevelGeometry } from './core/render/geometry.js';
import { getThemeAt } from './core/world/level.js';
import { drawHud } from './core/render/hud.js';
import { deriveSeed } from './core/random/seededRng.js';
import { QUATERNIUS_CHARACTER_IMPORTS } from './data/characterAssets.js';
import * as THREE from '../ThoriumGap_JS/lib/three.module.js';
import { GLTFLoader } from '../ThoriumGap_JS/lib/loaders/GLTFLoader.js';

const worldCanvas = document.getElementById('world');
const hudCanvas = document.getElementById('hud');
const appRoot = document.getElementById('app');
const characterPreviewCanvas = document.getElementById('character-preview-canvas');
const characterPreviewStatus = document.getElementById('character-preview-status');
const overlayState = document.getElementById('overlay-state');
const devOverlay = document.getElementById('dev-overlay');
const menuToggle = document.getElementById('menu-toggle');
const settingsBackdrop = document.getElementById('settings-backdrop');
const invertGamepadYInput = document.getElementById('invert-gamepad-y');
const difficultySelect = document.getElementById('difficulty-select');
const mouseSensitivityInput = document.getElementById('mouse-sensitivity');
const mouseSensitivityValue = document.getElementById('mouse-sensitivity-value');
const masterVolumeInput = document.getElementById('master-volume');
const masterVolumeValue = document.getElementById('master-volume-value');
const graphicsQualitySelect = document.getElementById('graphics-quality-select');
const fullscreenToggle = document.getElementById('fullscreen-toggle');
const restartButton = document.getElementById('restart-game');
const saveDemoButton = document.getElementById('save-demo');
const closeMenuButton = document.getElementById('close-menu');
const errorPanel = document.getElementById('error');
const CHARACTER_PREVIEW_MODEL_URL = `./${QUATERNIUS_CHARACTER_IMPORTS.baseModels[0].path}`;
const CHARACTER_PREVIEW_ANIMATION_URLS = QUATERNIUS_CHARACTER_IMPORTS.animationLibraries.map((library) => `./${library.path}`);
const QUATERNIUS_HUMANOID_ANIMATION_URL = CHARACTER_PREVIEW_ANIMATION_URLS[0] || './assets/models/characters/quaternius/animations/UAL1_Standard.glb';
const CHARACTER_PREVIEW_SEQUENCE_DEFS = [
  { key: 'idle', label: 'Idle', durationMs: 2200, loop: true, clipNames: ['Idle_Loop', 'Idle_Torch_Loop', 'Pistol_Idle_Loop', 'Zombie_Idle_Loop', 'A_TPose'] },
  { key: 'walk', label: 'Walk', durationMs: 2200, loop: true, clipNames: ['Walk_Loop', 'Walk_Formal_Loop', 'Zombie_Walk_Fwd_Loop', 'Jog_Fwd_Loop'] },
  { key: 'run', label: 'Run', durationMs: 2000, loop: true, clipNames: ['Jog_Fwd_Loop', 'Sprint_Loop', 'Run_Loop'] },
  { key: 'stop', label: 'Stop', durationMs: 1600, loop: false, clipNames: ['Stop', 'Stop_Loop', 'Walk_Stop', 'Idle_Loop'] },
  { key: 'turn', label: 'Turn', durationMs: 1600, loop: true, clipNames: ['Turn_Loop', 'Turn_Around', 'Run_Turn', 'Walk_Turn'] },
  { key: 'jump', label: 'Jump', durationMs: 1400, loop: false, clipNames: ['Jump', 'Jump_Start', 'Jump_Loop', 'Jump_End'] },
  { key: 'hitReaction', label: 'Hit Reaction', durationMs: 1200, loop: false, clipNames: ['Hit_Chest', 'Hit_Knockback', 'Hit_Head'] },
  { key: 'death', label: 'Death', durationMs: 2200, loop: false, clipNames: ['Death01', 'Death_01', 'Death'] },
  { key: 'interact', label: 'Interact', durationMs: 1600, loop: false, clipNames: ['Pistol_Aim_Neutral', 'Pistol_Shoot', 'Punch_Jab', 'Punch_Cross', 'Melee_Hook'] }
];

const SETTINGS_STORAGE_KEY = 'fps3d.settings.v1';
const BASE_MOUSE_SENSITIVITY = 0.0022;
const GRAPHICS_QUALITY_PRESETS = {
  low: { label: 'Low', pixelRatioCap: 1 },
  balanced: { label: 'Balanced', pixelRatioCap: 1.25 },
  high: { label: 'High', pixelRatioCap: 1.75 },
  ultra: { label: 'Ultra', pixelRatioCap: 2 }
};
const CAMPAIGN_LEVEL_ID = 'rogue01';
const CAMPAIGN_LEVEL_COUNT = 5;
const DEFAULT_SETTINGS = {
  invertGamepadY: false,
  difficultyId: 'invulnerable',
  mouseSensitivity: 1,
  masterVolume: 0.75,
  graphicsQuality: 'high'
};

let activeGraphicsPixelRatioCap = GRAPHICS_QUALITY_PRESETS[DEFAULT_SETTINGS.graphicsQuality].pixelRatioCap;

function clampNumber(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return min;
  }
  return Math.max(min, Math.min(max, numeric));
}

function clamp01(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, Math.min(1, numeric));
}

function normalizeGraphicsQualityId(value) {
  const candidate = typeof value === 'string' ? value : '';
  return Object.prototype.hasOwnProperty.call(GRAPHICS_QUALITY_PRESETS, candidate)
    ? candidate
    : DEFAULT_SETTINGS.graphicsQuality;
}

function getGraphicsPixelRatioCap(value) {
  return GRAPHICS_QUALITY_PRESETS[normalizeGraphicsQualityId(value)].pixelRatioCap;
}

function normalizeSettings(value) {
  return {
    invertGamepadY: !!value?.invertGamepadY,
    difficultyId: normalizeDifficultyId(value?.difficultyId),
    mouseSensitivity: clampNumber(value?.mouseSensitivity ?? DEFAULT_SETTINGS.mouseSensitivity, 0.5, 2),
    masterVolume: clamp01(value?.masterVolume ?? DEFAULT_SETTINGS.masterVolume),
    graphicsQuality: normalizeGraphicsQualityId(value?.graphicsQuality)
  };
}

function loadSettings() {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }

    return normalizeSettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage failures in privacy mode or unsupported browsers.
  }
}

function showError(error) {
  errorPanel.style.display = 'grid';
  errorPanel.textContent = error && error.stack ? error.stack : String(error);
}

function createAudioEngine(initialVolume = DEFAULT_SETTINGS.masterVolume) {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext || null;
  let context = null;
  let masterGain = null;
  let sfxGain = null;
  let musicGain = null;
  let musicStarted = false;
  let volume = clamp01(initialVolume);
  const musicSources = [];

  function ensureContext() {
    if (!AudioContextCtor) {
      return null;
    }

    if (!context) {
      context = new AudioContextCtor({ latencyHint: 'interactive' });
      masterGain = context.createGain();
      masterGain.gain.value = volume;
      sfxGain = context.createGain();
      sfxGain.gain.value = 1;
      musicGain = context.createGain();
      musicGain.gain.value = 0.16;
      sfxGain.connect(masterGain);
      musicGain.connect(masterGain);
      masterGain.connect(context.destination);
    }

    return context;
  }

  function setVolume(nextVolume) {
    volume = clamp01(nextVolume);
    if (masterGain) {
      masterGain.gain.value = volume;
    }
  }

  function stopMusic() {
    while (musicSources.length > 0) {
      const source = musicSources.pop();
      try {
        source.stop(0);
      } catch {
        // Ignore stop errors when the source has already ended.
      }
      try {
        source.disconnect();
      } catch {
        // Ignore disconnect errors on cleanup.
      }
    }
    musicStarted = false;
  }

  function createToneNode(startTime, options = {}) {
    const ctx = ensureContext();
    if (!ctx || volume <= 0) {
      return null;
    }

    const {
      type = 'sine',
      frequency = 440,
      targetFrequency = frequency,
      duration = 0.12,
      gain = 0.08,
      attack = 0.008,
      release = 0.08,
      detune = 0,
      startOffset = 0,
      filterType = null,
      filterFrequency = null,
      filterQ = 1
    } = options;

    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(0.001, frequency), startTime);
    if (Number.isFinite(detune) && detune !== 0) {
      osc.detune.setValueAtTime(detune, startTime);
    }
    if (Number.isFinite(targetFrequency) && targetFrequency !== frequency) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(0.001, targetFrequency), startTime + Math.max(0.02, duration * 0.92));
    }

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), startTime + Math.max(0.003, attack));
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.max(0.02, duration + release));

    let sourceNode = osc;
    if (filterType || filterFrequency) {
      const filter = ctx.createBiquadFilter();
      filter.type = filterType || 'lowpass';
      if (Number.isFinite(filterFrequency)) {
        filter.frequency.setValueAtTime(Math.max(10, filterFrequency), startTime);
      }
      if (Number.isFinite(filterQ)) {
        filter.Q.setValueAtTime(Math.max(0.0001, filterQ), startTime);
      }
      sourceNode.connect(filter);
      sourceNode = filter;
    }

    sourceNode.connect(gainNode);
    gainNode.connect(sfxGain || masterGain || ctx.destination);
    osc.start(startTime + startOffset);
    osc.stop(startTime + startOffset + duration + release + 0.05);
    return osc;
  }

  function playChord(frequencies, options = {}) {
    const ctx = ensureContext();
    if (!ctx || !Array.isArray(frequencies) || frequencies.length === 0) {
      return;
    }

    const startTime = ctx.currentTime + 0.02;
    for (const frequency of frequencies) {
      createToneNode(startTime, {
        ...options,
        frequency,
        targetFrequency: options.targetFrequency ?? frequency
      });
    }
  }

  function startMusic() {
    if (musicStarted) {
      return;
    }

    const ctx = ensureContext();
    if (!ctx || volume <= 0) {
      return;
    }

    const startTime = ctx.currentTime + 0.02;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(240, startTime);
    padFilter.Q.setValueAtTime(0.7, startTime);
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.07, startTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(18, startTime);
    lfo.connect(lfoGain);
    lfoGain.connect(padFilter.frequency);

    const droneA = ctx.createOscillator();
    droneA.type = 'sine';
    droneA.frequency.setValueAtTime(43, startTime);
    const droneB = ctx.createOscillator();
    droneB.type = 'triangle';
    droneB.frequency.setValueAtTime(86, startTime);
    const droneC = ctx.createOscillator();
    droneC.type = 'sine';
    droneC.frequency.setValueAtTime(129, startTime);
    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.14, startTime);

    droneA.connect(padFilter);
    droneB.connect(padFilter);
    droneC.connect(padFilter);
    padFilter.connect(padGain);
    padGain.connect(musicGain || masterGain || ctx.destination);

    droneA.start(startTime);
    droneB.start(startTime);
    droneC.start(startTime);
    lfo.start(startTime);

    musicSources.push(droneA, droneB, droneC, lfo);
    musicStarted = true;
  }

  async function unlock() {
    const ctx = ensureContext();
    if (!ctx) {
      return false;
    }

    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
    } catch {
      // Ignore resume failures in unsupported autoplay situations.
    }

    startMusic();
    return ctx.state !== 'closed';
  }

  function playWeaponSound(weaponId) {
    const ctx = ensureContext();
    if (!ctx || volume <= 0) {
      return;
    }

    const startTime = ctx.currentTime + 0.01;
    if (weaponId === 'shotgun') {
      createToneNode(startTime, { type: 'square', frequency: 160, targetFrequency: 96, duration: 0.11, gain: 0.12, attack: 0.004, release: 0.09, filterType: 'bandpass', filterFrequency: 820, filterQ: 1.5 });
      createToneNode(startTime + 0.03, { type: 'triangle', frequency: 98, targetFrequency: 58, duration: 0.14, gain: 0.14, attack: 0.004, release: 0.1, filterType: 'lowpass', filterFrequency: 1200, filterQ: 0.8 });
      return;
    }

    if (weaponId === 'superShotgun') {
      createToneNode(startTime, { type: 'square', frequency: 140, targetFrequency: 84, duration: 0.12, gain: 0.13, attack: 0.004, release: 0.09, filterType: 'bandpass', filterFrequency: 760, filterQ: 1.4 });
      createToneNode(startTime + 0.025, { type: 'square', frequency: 118, targetFrequency: 72, duration: 0.14, gain: 0.12, attack: 0.004, release: 0.11, filterType: 'bandpass', filterFrequency: 700, filterQ: 1.4 });
      return;
    }

    if (weaponId === 'chaingun') {
      createToneNode(startTime, { type: 'sawtooth', frequency: 280, targetFrequency: 200, duration: 0.05, gain: 0.07, attack: 0.002, release: 0.06, filterType: 'highpass', filterFrequency: 260, filterQ: 0.6 });
      return;
    }

    if (weaponId === 'rocketLauncher') {
      createToneNode(startTime, { type: 'triangle', frequency: 96, targetFrequency: 42, duration: 0.24, gain: 0.12, attack: 0.01, release: 0.14, filterType: 'lowpass', filterFrequency: 580, filterQ: 0.8 });
      createToneNode(startTime + 0.02, { type: 'sawtooth', frequency: 240, targetFrequency: 78, duration: 0.11, gain: 0.06, attack: 0.004, release: 0.09, filterType: 'bandpass', filterFrequency: 420, filterQ: 0.7 });
      return;
    }

    if (weaponId === 'plasmaRifle') {
      createToneNode(startTime, { type: 'sine', frequency: 520, targetFrequency: 260, duration: 0.10, gain: 0.08, attack: 0.003, release: 0.07, filterType: 'highpass', filterFrequency: 340, filterQ: 0.5 });
      createToneNode(startTime + 0.012, { type: 'triangle', frequency: 780, targetFrequency: 420, duration: 0.07, gain: 0.05, attack: 0.002, release: 0.05, filterType: 'bandpass', filterFrequency: 1900, filterQ: 1.2 });
      return;
    }

    if (weaponId === 'bfg9000') {
      playChord([92, 138, 184], { type: 'sine', duration: 0.34, gain: 0.08, attack: 0.01, release: 0.16, filterType: 'lowpass', filterFrequency: 420, filterQ: 0.8 });
      createToneNode(startTime + 0.05, { type: 'sawtooth', frequency: 162, targetFrequency: 54, duration: 0.24, gain: 0.05, attack: 0.01, release: 0.14, filterType: 'bandpass', filterFrequency: 520, filterQ: 0.9 });
      return;
    }

    createToneNode(startTime, { type: 'sine', frequency: 240, targetFrequency: 150, duration: 0.08, gain: 0.06, attack: 0.004, release: 0.06, filterType: 'lowpass', filterFrequency: 2200, filterQ: 0.6 });
  }

  function playPickupSound(kind) {
    const ctx = ensureContext();
    if (!ctx || volume <= 0) {
      return;
    }

    const startTime = ctx.currentTime + 0.01;
    if (kind === 'health') {
      createToneNode(startTime, { type: 'triangle', frequency: 620, targetFrequency: 960, duration: 0.10, gain: 0.06, attack: 0.006, release: 0.07, filterType: 'lowpass', filterFrequency: 2400, filterQ: 0.6 });
      createToneNode(startTime + 0.04, { type: 'sine', frequency: 960, targetFrequency: 1200, duration: 0.08, gain: 0.04, attack: 0.003, release: 0.05, filterType: 'highpass', filterFrequency: 500, filterQ: 0.4 });
      return;
    }

    if (kind === 'armor') {
      createToneNode(startTime, { type: 'triangle', frequency: 520, targetFrequency: 760, duration: 0.10, gain: 0.06, attack: 0.006, release: 0.07, filterType: 'bandpass', filterFrequency: 1500, filterQ: 1.0 });
      return;
    }

    createToneNode(startTime, { type: 'sine', frequency: 470, targetFrequency: 840, duration: 0.09, gain: 0.05, attack: 0.004, release: 0.06, filterType: 'lowpass', filterFrequency: 1800, filterQ: 0.7 });
  }

  function playEnemyHitSound(event) {
    const ctx = ensureContext();
    if (!ctx || volume <= 0) {
      return;
    }

    const damage = Math.max(1, Number(event?.damage) || 1);
    const pitch = clampNumber(320 - damage * 2.4, 120, 320);
    createToneNode(ctx.currentTime + 0.01, {
      type: 'sawtooth',
      frequency: pitch,
      targetFrequency: pitch * 0.68,
      duration: 0.08,
      gain: 0.08,
      attack: 0.004,
      release: 0.05,
      filterType: 'bandpass',
      filterFrequency: 1200,
      filterQ: 1.1
    });
  }

  function playEnemyDeathSound() {
    const ctx = ensureContext();
    if (!ctx || volume <= 0) {
      return;
    }

    const startTime = ctx.currentTime + 0.01;
    createToneNode(startTime, { type: 'triangle', frequency: 160, targetFrequency: 82, duration: 0.20, gain: 0.08, attack: 0.008, release: 0.12, filterType: 'lowpass', filterFrequency: 800, filterQ: 0.8 });
    createToneNode(startTime + 0.04, { type: 'sawtooth', frequency: 92, targetFrequency: 38, duration: 0.18, gain: 0.05, attack: 0.01, release: 0.1, filterType: 'bandpass', filterFrequency: 520, filterQ: 0.9 });
  }

  function playPlayerDamageSound() {
    const ctx = ensureContext();
    if (!ctx || volume <= 0) {
      return;
    }

    createToneNode(ctx.currentTime + 0.01, {
      type: 'square',
      frequency: 104,
      targetFrequency: 54,
      duration: 0.16,
      gain: 0.08,
      attack: 0.004,
      release: 0.1,
      filterType: 'lowpass',
      filterFrequency: 760,
      filterQ: 0.7
    });
  }

  function playDoorSound() {
    const ctx = ensureContext();
    if (!ctx || volume <= 0) {
      return;
    }

    createToneNode(ctx.currentTime + 0.01, {
      type: 'square',
      frequency: 220,
      targetFrequency: 160,
      duration: 0.06,
      gain: 0.04,
      attack: 0.002,
      release: 0.04,
      filterType: 'bandpass',
      filterFrequency: 1300,
      filterQ: 1
    });
  }

  function playDoorLockedSound() {
    const ctx = ensureContext();
    if (!ctx || volume <= 0) {
      return;
    }

    createToneNode(ctx.currentTime + 0.01, {
      type: 'square',
      frequency: 132,
      targetFrequency: 92,
      duration: 0.09,
      gain: 0.05,
      attack: 0.004,
      release: 0.05,
      filterType: 'bandpass',
      filterFrequency: 580,
      filterQ: 1.1
    });
  }

  function playLevelCompleteSound() {
    const ctx = ensureContext();
    if (!ctx || volume <= 0) {
      return;
    }

    playChord([392, 494, 587], {
      type: 'sine',
      duration: 0.38,
      gain: 0.07,
      attack: 0.01,
      release: 0.14,
      filterType: 'lowpass',
      filterFrequency: 1900,
      filterQ: 0.6
    });
  }

  function playHitImpactSound(impactKind) {
    const ctx = ensureContext();
    if (!ctx || volume <= 0) {
      return;
    }

    const startTime = ctx.currentTime + 0.01;
    if (impactKind === 'splash') {
      createToneNode(startTime, { type: 'sawtooth', frequency: 144, targetFrequency: 52, duration: 0.18, gain: 0.08, attack: 0.01, release: 0.12, filterType: 'lowpass', filterFrequency: 900, filterQ: 0.9 });
      createToneNode(startTime + 0.03, { type: 'triangle', frequency: 88, targetFrequency: 38, duration: 0.14, gain: 0.05, attack: 0.008, release: 0.1, filterType: 'bandpass', filterFrequency: 600, filterQ: 1 });
      return;
    }

    if (impactKind === 'wall') {
      createToneNode(startTime, { type: 'square', frequency: 340, targetFrequency: 260, duration: 0.05, gain: 0.04, attack: 0.002, release: 0.04, filterType: 'highpass', filterFrequency: 2200, filterQ: 0.5 });
      return;
    }

    createToneNode(startTime, { type: 'triangle', frequency: 280, targetFrequency: 150, duration: 0.06, gain: 0.045, attack: 0.003, release: 0.04, filterType: 'bandpass', filterFrequency: 1500, filterQ: 1 });
  }

  function playEvent(event) {
    if (!event || typeof event !== 'object') {
      return;
    }

    switch (event.type) {
      case 'fireWeapon':
        playWeaponSound(event.weaponId);
        break;
      case 'pickupCollected':
        playPickupSound(event.kind);
        break;
      case 'doorOpened':
        playDoorSound();
        break;
      case 'doorLocked':
        playDoorLockedSound();
        break;
      case 'playerDamaged':
        playPlayerDamageSound();
        break;
      case 'playerDied':
        playPlayerDamageSound();
        break;
      case 'hitEnemy':
        playEnemyHitSound(event);
        break;
      case 'enemyDied':
        playEnemyDeathSound();
        break;
      case 'hitscanImpact':
      case 'projectileImpact':
        playHitImpactSound(event.impactKind);
        break;
      case 'levelCompleted':
        playLevelCompleteSound();
        break;
      default:
        break;
    }
  }

  function dispose() {
    stopMusic();
    if (context && context.state !== 'closed') {
      try {
        context.close();
      } catch {
        // Ignore close failures on teardown.
      }
    }
    context = null;
    masterGain = null;
    sfxGain = null;
    musicGain = null;
  }

  return {
    unlock,
    setVolume,
    playEvent,
    dispose
  };
}

function disposeObject3D(object3D, options = {}) {
  if (!object3D) {
    return;
  }

  const disposeTextures = options.disposeTextures !== false;

  object3D.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    if (child.geometry) {
      child.geometry.dispose();
    }

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (!material) {
        continue;
      }

      for (const value of Object.values(material)) {
        if (disposeTextures && value && value.isTexture) {
          value.dispose();
        }
      }
      material.dispose?.();
    }
  });
}

function createCharacterPreview(canvas, statusElement) {
  if (!canvas || typeof canvas.getContext !== 'function') {
    return null;
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 1.5, 3.6);

  const root = new THREE.Group();
  root.position.y = 0.14;
  scene.add(root);

  const ambient = new THREE.HemisphereLight(0xdbe9ff, 0x10131c, 1.25);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(3.2, 5.4, 4.5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x89aaff, 0.9);
  fillLight.position.set(-4.2, 2.3, 2.8);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffc19c, 0.55);
  rimLight.position.set(-2.5, 2.0, -4.5);
  scene.add(rimLight);

  const stage = new THREE.Mesh(
    new THREE.CircleGeometry(1.38, 48),
    new THREE.MeshStandardMaterial({
      color: 0x151b27,
      roughness: 0.96,
      metalness: 0.04
    })
  );
  stage.rotation.x = -Math.PI / 2;
  stage.position.y = 0;
  scene.add(stage);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.56, 1.28, 48),
    new THREE.MeshBasicMaterial({
      color: 0x68b6ff,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.01;
  scene.add(ring);

  const loader = new GLTFLoader();
  const animationLoader = new GLTFLoader();
  const clipMap = new Map();
  let loadedModel = null;
  let previewMixer = null;
  let currentAction = null;
  let currentActionKey = '';
  let currentStage = null;
  let currentStageIndex = 0;
  let currentStageStartedAtMs = 0;
  let lastRenderNowMs = null;
  let pendingAnimationLoads = CHARACTER_PREVIEW_ANIMATION_URLS.length;
  let previewBoneMap = new Map();
  let modelLoaded = false;
  let animationsLoaded = false;
  let ready = false;
  let disposed = false;
  let currentStatus = 'Loading Quaternius CC0 model...';

  function setStatus(message) {
    currentStatus = message;
    if (statusElement) {
      statusElement.textContent = message;
    }
  }

  function resize() {
    const width = Math.max(1, Math.floor(canvas.clientWidth || 1));
    const height = Math.max(1, Math.floor(canvas.clientHeight || 1));
    const dpr = Math.min(window.devicePixelRatio || 1, activeGraphicsPixelRatioCap);
    const displayWidth = Math.max(1, Math.floor(width * dpr));
    const displayHeight = Math.max(1, Math.floor(height * dpr));

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      renderer.setSize(displayWidth, displayHeight, false);
      camera.aspect = displayWidth / displayHeight;
      camera.updateProjectionMatrix();
    }
  }

  function findPreviewClip(stage) {
    return findClipByNames(clipMap, stage.clipNames);
  }

  function activatePreviewStage(stageIndex, nowMs, fadeSeconds = 0.14) {
    if (!loadedModel || !previewMixer || clipMap.size === 0) {
      return null;
    }

    const stage = CHARACTER_PREVIEW_SEQUENCE_DEFS[stageIndex % CHARACTER_PREVIEW_SEQUENCE_DEFS.length];
    let clip = findPreviewClip(stage);
    let usedFallback = false;
    if (!clip && clipMap.size > 0) {
      clip = clipMap.values().next().value || null;
      usedFallback = !!clip;
    }
    if (!clip) {
      ready = false;
      setStatus('No preview clips were found in the animation libraries.');
      return null;
    }

    const nextActionKey = `${stage.key}:${clip.name}`;
    if (currentActionKey === nextActionKey && currentAction) {
      currentStage = stage;
      currentStageIndex = stageIndex;
      currentStageStartedAtMs = nowMs;
      ready = true;
      return currentAction;
    }

    if (currentAction) {
      currentAction.fadeOut(fadeSeconds);
    }

    const action = previewMixer.clipAction(clip);
    action.reset();
    action.enabled = true;
    action.clampWhenFinished = !stage.loop;
    action.setLoop(stage.loop ? THREE.LoopRepeat : THREE.LoopOnce, stage.loop ? Infinity : 1);
    action.fadeIn(fadeSeconds);
    action.play();
    action.timeScale = clip.duration > 0 ? clip.duration / Math.max(0.05, stage.durationMs / 1000) : 1;

    currentAction = action;
    currentActionKey = nextActionKey;
    currentStage = stage;
    currentStageIndex = stageIndex;
    currentStageStartedAtMs = nowMs;
    ready = true;
    setStatus(`Quaternius CC0 human preview | ${stage.label} | ${clip.name}${usedFallback ? ' (fallback)' : ''}`);
    return action;
  }

  function maybeActivatePreview(nowMs = performance.now()) {
    if (disposed || !modelLoaded || !animationsLoaded || !loadedModel) {
      return;
    }

    if (!previewMixer) {
      previewMixer = new THREE.AnimationMixer(loadedModel);
    }

    const activated = activatePreviewStage(currentStageIndex, nowMs, 0.14);
    if (!activated) {
      ready = false;
      return;
    }

    if (!currentStatus || currentStatus.includes('Loading')) {
      setStatus(`Quaternius CC0 human preview | ${currentStage.label} | ${currentActionKey.split(':').slice(1).join(':')}`);
    }
  }

  function buildPreviewPose(nowMs) {
    const stageKey = currentStage?.key || 'idle';
    const stageElapsedMs = Math.max(0, nowMs - currentStageStartedAtMs);
    const remainingMs = currentStage ? Math.max(0, currentStage.durationMs - stageElapsedMs) : 0;
    const poseState = stageKey === 'idle'
      ? 'idle'
      : stageKey === 'death'
        ? 'death'
        : stageKey === 'hitReaction'
          ? 'hurt'
          : stageKey === 'interact'
            ? 'attack'
            : 'walk';
    const motionBlend = stageKey === 'idle'
      ? 0.14
      : stageKey === 'run'
        ? 1
        : stageKey === 'walk'
          ? 0.84
          : stageKey === 'turn'
            ? 0.62
            : stageKey === 'jump'
              ? 0.72
              : stageKey === 'death'
                ? 0.05
                : stageKey === 'interact'
                  ? 0.78
                  : 0.58;
    const aimTarget = stageKey === 'turn'
      ? { x: Math.sin(nowMs * 0.0012) * 1.2, y: 1.58, z: 2.7 }
      : stageKey === 'jump'
        ? { x: 0.2, y: 2.0, z: 2.4 }
        : { x: 0.3, y: 1.58, z: 2.6 };
    return sampleCharacterRigPose(
      {
        x: 0,
        z: 0,
        facing: 0,
        dead: stageKey === 'death',
        dyingMs: stageKey === 'death' ? remainingMs : 0,
        hitFlashMs: stageKey === 'hitReaction' ? remainingMs : 0,
        attackWindupMs: stageKey === 'interact' ? remainingMs : 0,
        attackWindupTotalMs: stageKey === 'interact' ? currentStage?.durationMs || 1200 : 0
      },
      0,
      0.85,
      1.78,
      0.55,
      nowMs * 0.018,
      aimTarget,
      { poseState, motionBlend }
    );
  }

  function finishAnimationLoad() {
    pendingAnimationLoads = Math.max(0, pendingAnimationLoads - 1);
    if (pendingAnimationLoads > 0) {
      setStatus(`Loading Quaternius animation libraries... (${CHARACTER_PREVIEW_ANIMATION_URLS.length - pendingAnimationLoads}/${CHARACTER_PREVIEW_ANIMATION_URLS.length})`);
      return;
    }

    animationsLoaded = true;
    maybeActivatePreview();
    if (!ready && clipMap.size === 0) {
      setStatus('No animation clips were loaded for the preview scene.');
    }
  }

  setStatus('Loading Quaternius CC0 model...');
  loader.load(
    CHARACTER_PREVIEW_MODEL_URL,
    (gltf) => {
      if (disposed) {
        return;
      }

      const model = gltf.scene || gltf.scenes?.[0] || null;
      if (!model) {
        setStatus('Human model loaded, but no scene was returned.');
        return;
      }

      model.traverse((child) => {
        if (!child.isMesh) {
          return;
        }

        child.castShadow = false;
        child.receiveShadow = false;
        if (Array.isArray(child.material)) {
          for (const material of child.material) {
            if (material) {
              material.roughness = Math.min(1, Number.isFinite(material.roughness) ? material.roughness : 1);
              material.metalness = Math.min(0.18, Number.isFinite(material.metalness) ? material.metalness : 0.08);
            }
          }
        } else if (child.material) {
          child.material.roughness = Math.min(1, Number.isFinite(child.material.roughness) ? child.material.roughness : 1);
          child.material.metalness = Math.min(0.18, Number.isFinite(child.material.metalness) ? child.material.metalness : 0.08);
        }
      });

      model.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const scale = 2.45 / Math.max(0.001, size.x, size.y, size.z);

      model.position.set(-center.x, -bounds.min.y, -center.z);
      root.add(model);
      root.scale.setScalar(scale);
      loadedModel = model;
      previewBoneMap = buildBoneMap(model);
      modelLoaded = true;

      root.updateMatrixWorld(true);
      const modelBounds = new THREE.Box3().setFromObject(root);
      const modelSize = modelBounds.getSize(new THREE.Vector3());
      camera.position.set(0, Math.max(1.35, modelSize.y * 0.64), Math.max(2.8, modelSize.z * 2.1));
      camera.lookAt(0, Math.max(0.9, modelSize.y * 0.42), 0);
      setStatus('Quaternius base model loaded. Preparing animation test scene...');
      maybeActivatePreview();
    },
    undefined,
    (error) => {
      if (disposed) {
        return;
      }

      console.error(error);
      setStatus('Human model failed to load.');
    }
  );

  for (const animationUrl of CHARACTER_PREVIEW_ANIMATION_URLS) {
    animationLoader.load(
      animationUrl,
      (gltf) => {
        for (const clip of gltf.animations || []) {
          if (clip && typeof clip.name === 'string' && clip.name.length > 0) {
            clipMap.set(normalizeClipName(clip.name), clip);
          }
        }
        finishAnimationLoad();
      },
      undefined,
      (error) => {
        if (disposed) {
          return;
        }

        console.error(error);
        finishAnimationLoad();
      }
    );
  }

  function render(now) {
    if (disposed) {
      return;
    }

    resize();
    const nowMs = Number.isFinite(now) ? now : performance.now();
    const deltaMs = lastRenderNowMs === null ? 0 : Math.max(0, nowMs - lastRenderNowMs);
    lastRenderNowMs = nowMs;
    if (loadedModel) {
      const t = nowMs * 0.00035;
      root.rotation.y = 0.55 + t;
      root.position.y = 0.14 + Math.sin(t * 2.1) * 0.02;
    }
    if (ready && previewMixer) {
      previewMixer.update(deltaMs / 1000);
      if (previewBoneMap.size > 0) {
        const previewPose = buildPreviewPose(nowMs);
        applyHumanoidRigIK(previewBoneMap, previewPose, { strength: 1.06 });
      }
      if (currentStage && nowMs - currentStageStartedAtMs >= currentStage.durationMs) {
        const nextIndex = (currentStageIndex + 1) % CHARACTER_PREVIEW_SEQUENCE_DEFS.length;
        activatePreviewStage(nextIndex, nowMs, 0.14);
      }
    }
    renderer.render(scene, camera);
  }

  function dispose() {
    disposed = true;
    if (previewMixer) {
      previewMixer.stopAllAction();
      if (loadedModel) {
        previewMixer.uncacheRoot(loadedModel);
      }
    }
    disposeObject3D(root);
    previewBoneMap.clear();
    renderer.dispose();
  }

  return {
    render,
    dispose,
    isReady: () => ready,
    getStatus: () => currentStatus,
    getDebugState: () => ({
      ready,
      modelLoaded,
      animationsLoaded,
      stageIndex: currentStageIndex,
      stageKey: currentStage?.key || '',
      stageLabel: currentStage?.label || '',
      clipName: currentActionKey ? currentActionKey.split(':').slice(1).join(':') : '',
      clipCount: clipMap.size,
      boneCount: previewBoneMap.size,
      ikEnabled: previewBoneMap.size > 0,
      status: currentStatus
    })
  };
}

function normalizeClipName(name) {
  return typeof name === 'string' ? name.trim().toLowerCase() : '';
}

function findClipByNames(clipMap, names) {
  for (const name of names) {
    const clip = clipMap.get(normalizeClipName(name));
    if (clip) {
      return clip;
    }
  }
  return null;
}

function buildBoneMap(root) {
  const boneMap = new Map();
  if (!root) {
    return boneMap;
  }

  root.traverse((node) => {
    if (node.isBone && typeof node.name === 'string' && node.name.length > 0) {
      boneMap.set(node.name, node);
    }
  });
  return boneMap;
}

const HUMANOID_IK_AXIS_X = new THREE.Vector3(1, 0, 0);
const HUMANOID_IK_AXIS_Y = new THREE.Vector3(0, 1, 0);
const HUMANOID_IK_AXIS_Z = new THREE.Vector3(0, 0, 1);
const HUMANOID_IK_ROTATION = new THREE.Quaternion();

function getBoneFromMap(boneMap, ...names) {
  if (!boneMap) {
    return null;
  }

  for (const name of names) {
    if (boneMap.has(name)) {
      return boneMap.get(name);
    }
  }
  return null;
}

function applyBoneAxisRotation(bone, axis, angle) {
  if (!bone || !Number.isFinite(angle) || Math.abs(angle) < 1e-5) {
    return;
  }

  HUMANOID_IK_ROTATION.setFromAxisAngle(axis, angle);
  bone.quaternion.multiply(HUMANOID_IK_ROTATION);
}

function applyBoneRotation(bone, x = 0, y = 0, z = 0) {
  applyBoneAxisRotation(bone, HUMANOID_IK_AXIS_X, x);
  applyBoneAxisRotation(bone, HUMANOID_IK_AXIS_Y, y);
  applyBoneAxisRotation(bone, HUMANOID_IK_AXIS_Z, z);
}

function resolveHumanoidPoseState(enemy) {
  if (enemy?.dead) {
    return 'death';
  }

  if ((Number(enemy?.attackWindupTotalMs) || 0) > 0) {
    return 'attack';
  }

  if ((Number(enemy?.hitFlashMs) || 0) > 0) {
    return 'hurt';
  }

  return (Number(enemy?.def?.speed) || 0) > 0.05 ? 'walk' : 'idle';
}

function applyHumanoidRigIK(boneMap, pose, options = {}) {
  if (!boneMap || !pose) {
    return;
  }

  const ik = pose.ik || {};
  const strength = Math.max(0, Math.min(2, Number(options.strength ?? 1) || 0));
  if (strength <= 0) {
    return;
  }

  const motionBlend = Math.max(0, Math.min(1, Number(pose.motionBlend) || 0));
  const lookBlend = Math.max(0, Math.min(1, Number(ik.lookBlend) || 0));
  const aimBlend = Math.max(0, Math.min(1, Number(ik.aimBlend) || 0));
  const handReach = Math.max(0, Math.min(1, Number(ik.handReach) || 0));
  const leftFootPlant = Math.max(0, Math.min(1, Number(ik.leftFootPlant) || 0));
  const rightFootPlant = Math.max(0, Math.min(1, Number(ik.rightFootPlant) || 0));
  const leftFootLift = Math.max(0, Math.min(1, Number(ik.leftFootLift) || 0));
  const rightFootLift = Math.max(0, Math.min(1, Number(ik.rightFootLift) || 0));
  const footPlantBlend = Math.max(0, Math.min(1, Number(ik.footPlantBlend) || 0));
  const footSlip = Math.max(0, Math.min(1, Number(ik.footSlip) || 0));
  const aimYaw = Number(ik.aimYaw) || 0;
  const aimPitch = Number(ik.aimPitch) || 0;
  const bodyLean = Number(pose.bodyLean) || 0;
  const torsoTwist = Number(pose.torsoTwist) || 0;
  const bodyShift = Number(pose.bodyShift) || 0;
  const hurtRecoil = Number(pose.hurtRecoil) || 0;
  const deathCollapse = Number(pose.deathCollapse) || 0;
  const attackBlend = Number(pose.attackBlend) || 0;

  const spineLean = (bodyLean * 0.55 + hurtRecoil * 0.15 + deathCollapse * 0.28) * strength;
  const spineTwist = (torsoTwist * 0.35 + bodyShift * 0.16) * strength;
  const neckYaw = aimYaw * lookBlend * 0.42 * strength;
  const neckPitch = aimPitch * lookBlend * 0.58 * strength;
  const headYaw = aimYaw * lookBlend * 0.62 * strength;
  const headPitch = aimPitch * lookBlend * 0.82 * strength;
  const armAim = (handReach * 0.50 + aimBlend * 0.28 + attackBlend * 0.08) * strength;
  const armSwing = (motionBlend * 0.18 + attackBlend * 0.08 + hurtRecoil * 0.06) * strength;
  const legSwing = (motionBlend * 0.22 + deathCollapse * 0.08) * strength;
  const footLift = (leftFootLift + rightFootLift) * 0.5;

  applyBoneRotation(getBoneFromMap(boneMap, 'pelvis'), spineLean * 0.28, torsoTwist * 0.10 * strength, bodyShift * 0.08 * strength);
  applyBoneRotation(getBoneFromMap(boneMap, 'spine_01'), spineLean * 0.40, spineTwist * 0.42, 0);
  applyBoneRotation(getBoneFromMap(boneMap, 'spine_02'), spineLean * 0.30, spineTwist * 0.56, 0);
  applyBoneRotation(getBoneFromMap(boneMap, 'spine_03'), spineLean * 0.22, spineTwist * 0.72, 0);
  applyBoneRotation(getBoneFromMap(boneMap, 'neck_01'), neckPitch, neckYaw, 0);
  applyBoneRotation(getBoneFromMap(boneMap, 'Head'), headPitch, headYaw, -torsoTwist * 0.08 * strength);

  applyBoneRotation(getBoneFromMap(boneMap, 'clavicle_l'), -armAim * 0.18, aimYaw * 0.05 * strength, armSwing * 0.05);
  applyBoneRotation(getBoneFromMap(boneMap, 'upperarm_l'), -armAim * 0.48, aimYaw * 0.10 * strength, armSwing * 0.10);
  applyBoneRotation(getBoneFromMap(boneMap, 'lowerarm_l'), -armAim * 0.38, aimYaw * 0.05 * strength, armSwing * 0.05);
  applyBoneRotation(getBoneFromMap(boneMap, 'hand_l'), -armAim * 0.14, aimYaw * 0.02 * strength, armSwing * 0.02);

  applyBoneRotation(getBoneFromMap(boneMap, 'clavicle_r'), -armAim * 0.20, -aimYaw * 0.05 * strength, -armSwing * 0.05);
  applyBoneRotation(getBoneFromMap(boneMap, 'upperarm_r'), -armAim * 0.54, -aimYaw * 0.12 * strength, -armSwing * 0.10);
  applyBoneRotation(getBoneFromMap(boneMap, 'lowerarm_r'), -armAim * 0.42, -aimYaw * 0.06 * strength, -armSwing * 0.05);
  applyBoneRotation(getBoneFromMap(boneMap, 'hand_r'), -armAim * 0.15, -aimYaw * 0.02 * strength, -armSwing * 0.02);

  applyBoneRotation(getBoneFromMap(boneMap, 'thigh_l'), -legSwing * 0.56 - leftFootLift * 0.12 + deathCollapse * 0.12, 0, 0);
  applyBoneRotation(getBoneFromMap(boneMap, 'calf_l'), legSwing * 0.62 + leftFootLift * 0.24 + footPlantBlend * 0.05, 0, 0);
  applyBoneRotation(getBoneFromMap(boneMap, 'foot_l'), -leftFootLift * 0.18 + leftFootPlant * 0.05 - footSlip * 0.04, 0, 0);
  applyBoneRotation(getBoneFromMap(boneMap, 'ball_l'), leftFootLift * 0.10, 0, 0);

  applyBoneRotation(getBoneFromMap(boneMap, 'thigh_r'), legSwing * 0.56 - rightFootLift * 0.12 + deathCollapse * 0.12, 0, 0);
  applyBoneRotation(getBoneFromMap(boneMap, 'calf_r'), -legSwing * 0.62 + rightFootLift * 0.24 + footPlantBlend * 0.05, 0, 0);
  applyBoneRotation(getBoneFromMap(boneMap, 'foot_r'), -rightFootLift * 0.18 + rightFootPlant * 0.05 - footSlip * 0.04, 0, 0);
  applyBoneRotation(getBoneFromMap(boneMap, 'ball_r'), rightFootLift * 0.10, 0, 0);
}

function cloneSkinnedScene(sourceRoot) {
  if (!sourceRoot) {
    return null;
  }

  const cloneRoot = sourceRoot.clone(true);
  cloneRoot.updateMatrixWorld(true);
  const cloneBones = buildBoneMap(cloneRoot);
  const sourceMeshes = [];
  const cloneMeshes = [];

  sourceRoot.traverse((node) => {
    if (node.isSkinnedMesh) {
      sourceMeshes.push(node);
    }
  });

  cloneRoot.traverse((node) => {
    if (node.isSkinnedMesh) {
      cloneMeshes.push(node);
    }
  });

  for (let index = 0; index < Math.min(sourceMeshes.length, cloneMeshes.length); index += 1) {
    const sourceMesh = sourceMeshes[index];
    const cloneMesh = cloneMeshes[index];
    const sourceSkeleton = sourceMesh.skeleton;
    if (!sourceSkeleton || !Array.isArray(sourceSkeleton.bones)) {
      continue;
    }

    const cloneBonesForMesh = [];
    let missingBone = false;
    for (const bone of sourceSkeleton.bones) {
      const cloneBone = cloneBones.get(bone.name);
      if (!cloneBone) {
        missingBone = true;
        break;
      }
      cloneBonesForMesh.push(cloneBone);
    }

    if (missingBone || cloneBonesForMesh.length !== sourceSkeleton.bones.length) {
      continue;
    }

    const boneInverses = Array.isArray(sourceSkeleton.boneInverses)
      ? sourceSkeleton.boneInverses.map((inverse) => inverse.clone())
      : [];
    const cloneSkeleton = new THREE.Skeleton(cloneBonesForMesh, boneInverses);
    cloneMesh.bind(cloneSkeleton, sourceMesh.bindMatrix.clone());
    if (typeof cloneMesh.normalizeSkinWeights === 'function') {
      cloneMesh.normalizeSkinWeights();
    }
    cloneMesh.frustumCulled = false;
  }

  cloneRoot.traverse((node) => {
    if (node.isMesh) {
      node.frustumCulled = false;
    }
  });
  cloneRoot.updateMatrixWorld(true);
  return cloneRoot;
}

const THREE_WORLD_THEMES = {
  tech: {
    clearColor: '#23415f',
    skyTint: '#8ec9ff',
    floorTint: '#d3e8fb',
    wallTint: '#b2d1ea',
    ceilingTint: '#c8dff2',
    ambientIntensity: 1.14,
    keyColor: '#ffffff',
    keyIntensity: 1.65,
    fillColor: '#8ab8ff',
    fillIntensity: 0.68,
    rimColor: '#ffcfb0',
    rimIntensity: 0.30
  },
  industrial: {
    clearColor: '#5a5249',
    skyTint: '#c7b7a5',
    floorTint: '#e0d2c0',
    wallTint: '#c2b39e',
    ceilingTint: '#d8ccbd',
    ambientIntensity: 1.02,
    keyColor: '#fff0de',
    keyIntensity: 1.45,
    fillColor: '#b7a592',
    fillIntensity: 0.52,
    rimColor: '#ffcfa1',
    rimIntensity: 0.24
  },
  hell: {
    clearColor: '#4a1719',
    skyTint: '#ff8e63',
    floorTint: '#ffd0b5',
    wallTint: '#ffae9c',
    ceilingTint: '#ffc3a5',
    ambientIntensity: 1.05,
    keyColor: '#ffd8b6',
    keyIntensity: 1.50,
    fillColor: '#ff8e63',
    fillIntensity: 0.55,
    rimColor: '#ff9f85',
    rimIntensity: 0.32
  },
  default: {
    clearColor: '#4d6f96',
    skyTint: '#b2d7ff',
    floorTint: '#ffffff',
    wallTint: '#ffffff',
    ceilingTint: '#ffffff',
    ambientIntensity: 1.08,
    keyColor: '#ffffff',
    keyIntensity: 1.55,
    fillColor: '#8ab8ff',
    fillIntensity: 0.62,
    rimColor: '#ffcfb0',
    rimIntensity: 0.28
  }
};

function createThreeWorldRenderer({ canvas, textures, debugEnabled = false }) {
  if (!canvas) {
    return null;
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: false,
    antialias: true,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance'
  });
  renderer.autoClear = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  let lastRenderInfo = {
    calls: 0,
    triangles: 0,
    lines: 0,
    points: 0,
    geometries: 0,
    textures: 0
  };
  let lastCollisionInfo = {
    checks: 0,
    blockedChecks: 0,
    moves: 0,
    resolutionAttempts: 0
  };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58.06451612903226, 1, 0.05, 220);
  const worldRoot = new THREE.Group();
  const levelRoot = new THREE.Group();
  const staticRoot = new THREE.Group();
  const dynamicRoot = new THREE.Group();
  const skyRoot = new THREE.Group();
  const debugRoot = new THREE.Group();
  const weaponRig = new THREE.Group();
  const ambientLight = new THREE.HemisphereLight(0xeaf2ff, 0x14171f, 1.08);
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.55);
  const fillLight = new THREE.DirectionalLight(0x8ab8ff, 0.62);
  const rimLight = new THREE.DirectionalLight(0xffcfb0, 0.28);
  const threeTextureCache = new Map();
  const levelSurfaceMaterials = [];
  const propCache = new Map();
  const lightCache = new Map();
  const pickupCache = new Map();
  const projectileCache = new Map();
  const effectCache = new Map();
  const decalCache = new Map();
  const enemyCache = new Map();
  const humanoidCache = new Map();
  const humanoidPrototype = {
    root: null,
    baseHeight: 1,
    baseWidth: 1,
    baseDepth: 1
  };
  const humanoidClipMap = new Map();
  const humanoidLoader = new GLTFLoader();
  const weaponMaterials = {};
  const weaponMeshes = {};
  let skyMaterial = null;
  let skyMesh = null;
  let currentLevelKey = null;
  let currentThemeId = null;
  let humanoidBaseLoaded = false;
  let humanoidAnimLoaded = false;
  let humanoidReady = false;
  let lastHumanoidStateTimeMs = null;
  let humanoidDeltaSeconds = 0;
  let rendererWidth = 0;
  let rendererHeight = 0;

  worldRoot.add(levelRoot);
  worldRoot.add(staticRoot);
  worldRoot.add(dynamicRoot);
  camera.add(skyRoot);
  camera.add(weaponRig);
  scene.add(ambientLight);
  scene.add(keyLight);
  scene.add(fillLight);
  scene.add(rimLight);
  scene.add(worldRoot);
  scene.add(camera);
  scene.add(debugRoot);

  humanoidLoader.load(
    CHARACTER_PREVIEW_MODEL_URL,
    (gltf) => {
      const sourceRoot = gltf.scene || gltf.scenes?.[0] || null;
      if (!sourceRoot) {
        humanoidBaseLoaded = true;
        maybeMarkHumanoidReady();
        return;
      }

      sourceRoot.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(sourceRoot);
      const center = bounds.getCenter(new THREE.Vector3());
      sourceRoot.position.set(-center.x, -bounds.min.y, -center.z);
      sourceRoot.updateMatrixWorld(true);

      const normalizedBounds = new THREE.Box3().setFromObject(sourceRoot);
      const normalizedSize = normalizedBounds.getSize(new THREE.Vector3());
      humanoidPrototype.root = sourceRoot;
      humanoidPrototype.baseHeight = Math.max(0.001, normalizedSize.y || 1);
      humanoidPrototype.baseWidth = Math.max(0.001, Math.max(normalizedSize.x, normalizedSize.z) || 1);
      humanoidPrototype.baseDepth = humanoidPrototype.baseWidth;
      humanoidBaseLoaded = true;
      maybeMarkHumanoidReady();
    },
    undefined,
    (error) => {
      console.error(error);
      humanoidBaseLoaded = true;
      maybeMarkHumanoidReady();
    }
  );

  humanoidLoader.load(
    QUATERNIUS_HUMANOID_ANIMATION_URL,
    (gltf) => {
      for (const clip of gltf.animations || []) {
        humanoidClipMap.set(normalizeClipName(clip.name), clip);
      }
      humanoidAnimLoaded = true;
      maybeMarkHumanoidReady();
    },
    undefined,
    (error) => {
      console.error(error);
      humanoidAnimLoaded = true;
      maybeMarkHumanoidReady();
    }
  );

  function syncRendererSize() {
    const width = Math.max(1, Number(canvas.width) || 1);
    const height = Math.max(1, Number(canvas.height) || 1);
    if (rendererWidth !== width || rendererHeight !== height) {
      renderer.setSize(width, height, false);
      rendererWidth = width;
      rendererHeight = height;
    }
    renderer.setViewport(0, 0, width, height);
    renderer.setScissor(0, 0, width, height);
    renderer.setScissorTest(false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
  }

  function getSourceCanvas(key) {
    return textures?.sourceCanvases?.[key] || null;
  }

  function getTexture(key, wrapMode = THREE.RepeatWrapping) {
    const source = getSourceCanvas(key);
    if (!source) {
      return null;
    }

    let texture = threeTextureCache.get(key);
    if (!texture) {
      texture = new THREE.CanvasTexture(source);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = wrapMode;
      texture.wrapT = wrapMode;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;
      threeTextureCache.set(key, texture);
    }

    return texture;
  }

  function getTheme(themeId) {
    return THREE_WORLD_THEMES[themeId] || THREE_WORLD_THEMES.default;
  }

  function resolveSurfaceTextureKey(materialName, surfaceType) {
    const key = typeof materialName === 'string' ? materialName.toLowerCase() : '';
    if (key.includes('damage')) return 'materialDamage';
    if (key.includes('emissive') || key.includes('glow') || key.includes('light')) return 'materialEmissive';
    if (key.includes('liquid') || key.includes('water')) return 'materialLiquid';
    if (key.includes('organic') || key.includes('flesh') || key.includes('meat')) return 'materialOrganic';
    if (key.includes('metal') || key.includes('steel') || key.includes('tech') || key.includes('concrete')) return 'materialMetal';
    if (key.includes('stone') || key.includes('rock') || key.includes('brick')) return 'materialStone';
    return surfaceType === 'floor' ? 'floor' : surfaceType === 'ceiling' ? 'ceiling' : 'wall';
  }

  function meshDataToGeometry(meshData) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(meshData.positions || []), 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(meshData.normals || []), 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(meshData.uvs || []), 2));
    const indexArray = (meshData.indices || []).length > 65535
      ? new Uint32Array(meshData.indices)
      : new Uint16Array(meshData.indices);
    geometry.setIndex(new THREE.BufferAttribute(indexArray, 1));
    geometry.computeBoundingSphere();
    return geometry;
  }

  function buildSurfaceMaterial(surfaceType, materialName, theme) {
    const textureKey = resolveSurfaceTextureKey(materialName, surfaceType);
    const texture = getTexture(textureKey, THREE.RepeatWrapping);
    const colorKey = surfaceType === 'floor'
      ? 'floorTint'
      : surfaceType === 'ceiling'
        ? 'ceilingTint'
        : 'wallTint';
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      color: new THREE.Color(theme[colorKey] || '#ffffff'),
      roughness: textureKey === 'materialMetal' ? 0.45 : textureKey === 'materialLiquid' ? 0.10 : 0.92,
      metalness: textureKey === 'materialMetal' ? 0.55 : textureKey === 'materialLiquid' ? 0.0 : 0.05,
      transparent: textureKey === 'materialLiquid',
      opacity: textureKey === 'materialLiquid' ? 0.92 : 1,
      side: THREE.DoubleSide
    });
    material.userData.surfaceType = surfaceType;
    material.userData.textureKey = textureKey;
    return material;
  }

  function clearGroup(group) {
    for (const child of [...group.children]) {
      group.remove(child);
      disposeObject3D(child, { disposeTextures: false });
    }
  }

  function clearCaches() {
    propCache.clear();
    lightCache.clear();
    pickupCache.clear();
    projectileCache.clear();
    effectCache.clear();
    decalCache.clear();
    enemyCache.clear();
  }

  function clearHumanoidCache() {
    for (const [key, entry] of humanoidCache.entries()) {
      entry.mixer.stopAllAction();
      dynamicRoot.remove(entry.root);
      if (entry.debugHelper) {
        debugRoot.remove(entry.debugHelper);
        disposeObject3D(entry.debugHelper, { disposeTextures: false });
        entry.debugHelper = null;
      }
      disposeObject3D(entry.root, { disposeTextures: false });
      humanoidCache.delete(key);
    }
  }

  function applyTheme(theme) {
    scene.background = new THREE.Color(theme.clearColor || '#000000');
    scene.fog = new THREE.Fog(theme.clearColor || '#000000', 20, 170);
    ambientLight.intensity = theme.ambientIntensity ?? 1.0;
    keyLight.color.set(theme.keyColor || '#ffffff');
    keyLight.intensity = theme.keyIntensity ?? 1.55;
    fillLight.color.set(theme.fillColor || '#8ab8ff');
    fillLight.intensity = theme.fillIntensity ?? 0.62;
    rimLight.color.set(theme.rimColor || '#ffcfb0');
    rimLight.intensity = theme.rimIntensity ?? 0.28;
    if (skyMaterial) {
      skyMaterial.color.set(theme.skyTint || '#b2d7ff');
    }
    for (const entry of levelSurfaceMaterials) {
      const tintKey = entry.surfaceType === 'floor'
        ? 'floorTint'
        : entry.surfaceType === 'ceiling'
          ? 'ceilingTint'
          : 'wallTint';
      entry.material.color.set(theme[tintKey] || '#ffffff');
    }
  }

  function rebuildLevel(level, theme) {
    clearGroup(levelRoot);
    clearGroup(staticRoot);
    clearHumanoidCache();
    clearGroup(dynamicRoot);
    clearCaches();
    levelSurfaceMaterials.length = 0;

    const geometry = buildLevelGeometry(level, {});
    for (const surfaceType of ['floorGroups', 'ceilingGroups', 'wallGroups']) {
      const groupSurfaceType = surfaceType === 'floorGroups'
        ? 'floor'
        : surfaceType === 'ceilingGroups'
          ? 'ceiling'
          : 'wall';
      for (const group of geometry[surfaceType] || []) {
        const mesh = new THREE.Mesh(meshDataToGeometry(group.mesh), buildSurfaceMaterial(groupSurfaceType, group.material, theme));
        mesh.frustumCulled = false;
        levelRoot.add(mesh);
        levelSurfaceMaterials.push({
          material: mesh.material,
          surfaceType: groupSurfaceType
        });
      }
    }

    currentLevelKey = `${level.id}:${Number(level.geometryVersion) || 0}`;
  }

  function syncMap(cache, items, parent, createFn, updateFn, state) {
    const seen = new Set();
    const list = Array.isArray(items) ? items : [];

    for (let index = 0; index < list.length; index += 1) {
      const item = list[index];
      if (!item || item.collected) {
        continue;
      }

      const key = String(item.id ?? `${parent.uuid}:${index}`);
      seen.add(key);
      let entry = cache.get(key);
      if (!entry) {
        entry = createFn(item, index, state);
        if (!entry) {
          seen.delete(key);
          continue;
        }
        cache.set(key, entry);
        parent.add(entry.root);
      }
      updateFn(entry, item, index, state);
    }

    for (const [key, entry] of cache.entries()) {
      if (seen.has(key)) {
        continue;
      }
      parent.remove(entry.root);
      disposeObject3D(entry.root, { disposeTextures: false });
      cache.delete(key);
    }
  }

  function createPropEntry(prop) {
    const root = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      map: getTexture('entity', THREE.ClampToEdgeWrapping),
      color: new THREE.Color(prop.color || '#8b97a5'),
      roughness: 0.85,
      metalness: 0.08,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
    mesh.frustumCulled = false;
    root.add(mesh);
    return { root, mesh, material };
  }

  function updatePropEntry(entry, prop, index, state) {
    const level = state.level;
    const floor = level.getFloorHeightAt ? level.getFloorHeightAt(prop.x, prop.z) : 0;
    entry.root.position.set(prop.x, floor + (Number(prop.y ?? 0) || 0) + (Number(prop.height ?? 0.5) || 0) * 0.5, prop.z);
    entry.root.rotation.y = Number(prop.rotation ?? 0) || 0;
    entry.mesh.scale.set(
      Math.max(0.05, Number(prop.width ?? 0.5) || 0.5),
      Math.max(0.05, Number(prop.height ?? 0.5) || 0.5),
      Math.max(0.05, Number(prop.depth ?? 0.5) || 0.5)
    );
  }

  function createLightEntry(light) {
    const root = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({
      map: getTexture('pickup', THREE.ClampToEdgeWrapping),
      color: new THREE.Color(light.color || '#fff0be'),
      transparent: true,
      opacity: Math.max(0.1, Number(light.alpha ?? 1) || 1),
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), material);
    mesh.frustumCulled = false;
    const pointLight = new THREE.PointLight(new THREE.Color(light.color || '#fff0be'), Math.max(0.15, Number(light.intensity ?? 0.75) || 0.75), Math.max(6, (Number(light.radius ?? 0.2) || 0.2) * 24), 2);
    root.add(mesh);
    root.add(pointLight);
    return { root, mesh, material, pointLight };
  }

  function updateLightEntry(entry, light, index, state) {
    const level = state.level;
    const floor = level.getFloorHeightAt ? level.getFloorHeightAt(light.x, light.z) : 0;
    const pulse = light.pulse ? 0.85 + Math.sin((state.timeMs + light.x * 17 + light.z * 13) * 0.005 + light.pulse) * 0.15 : 1;
    entry.root.position.set(light.x, floor + (Number(light.y ?? 0) || 0) + (Number(light.height ?? 0.12) || 0) * 0.5, light.z);
    entry.mesh.scale.set(
      Math.max(0.04, (Number(light.width ?? light.radius ?? 0.18) || 0.18) * 0.8),
      Math.max(0.04, Number(light.height ?? 0.12) || 0.12),
      Math.max(0.04, (Number(light.depth ?? light.radius ?? 0.18) || 0.18) * 0.8)
    );
    entry.material.color.set(light.color || '#fff0be');
    entry.material.opacity = Math.max(0.1, (Number(light.alpha ?? 1) || 1) * pulse);
    entry.pointLight.color.set(light.color || '#fff0be');
    entry.pointLight.intensity = Math.max(0.1, (Number(light.intensity ?? 0.75) || 0.75) * pulse);
    entry.pointLight.distance = Math.max(6, (Number(light.radius ?? 0.18) || 0.18) * 24);
  }

  function createPickupEntry(pickup) {
    const root = new THREE.Group();
    const color = pickup.kind === 'health'
      ? '#8cff9a'
      : pickup.kind === 'armor'
        ? '#90b9ff'
        : pickup.kind === 'key'
          ? '#ffe07a'
        : '#ffd67a';
    const material = new THREE.MeshStandardMaterial({
      map: getTexture('pickup', THREE.ClampToEdgeWrapping),
      color: new THREE.Color(color),
      roughness: 0.58,
      metalness: 0.18,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
    mesh.frustumCulled = false;
    root.add(mesh);
    return { root, mesh, material };
  }

  function updatePickupEntry(entry, pickup, index, state) {
    const level = state.level;
    const floor = level.getFloorHeightAt ? level.getFloorHeightAt(pickup.x, pickup.z) : 0;
    const wobble = Math.sin((state.timeMs + pickup.x * 137 + pickup.z * 53) * 0.004) * 0.08;
    entry.root.position.set(pickup.x, floor + wobble + 0.18, pickup.z);
    entry.root.rotation.y = state.timeMs * 0.0012 + index * 0.17;
    entry.mesh.scale.set(0.34, 0.34, 0.34);
  }

  function createProjectileEntry(projectile) {
    const root = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(projectile.color || '#ffffff'),
      roughness: 0.36,
      metalness: 0.08,
      emissive: new THREE.Color(projectile.color || '#ffffff'),
      emissiveIntensity: 0.24,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), material);
    mesh.frustumCulled = false;
    root.add(mesh);
    return { root, mesh, material };
  }

  function updateProjectileEntry(entry, projectile, index, state) {
    const level = state.level;
    const floor = level.getFloorHeightAt ? level.getFloorHeightAt(projectile.x, projectile.z) : 0;
    entry.root.position.set(projectile.x, floor + 0.15, projectile.z);
    entry.root.rotation.y = state.timeMs * 0.004 + index * 0.13;
    const radius = Math.max(0.04, Number(projectile.radius ?? 0.12) || 0.12);
    entry.mesh.scale.set(radius * 2.2, radius * 2.2, radius * 2.2);
    if (projectile.color) {
      entry.material.color.set(projectile.color);
      entry.material.emissive.set(projectile.color);
    }
  }

  function createEffectEntry(effect) {
    const root = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(effect.color || '#ffffff'),
      transparent: true,
      opacity: Math.max(0.1, Number(effect.alpha ?? 1) || 1),
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
    mesh.frustumCulled = false;
    root.add(mesh);
    return { root, mesh, material };
  }

  function updateEffectEntry(entry, effect, index, state) {
    const level = state.level;
    const floor = level.getFloorHeightAt ? level.getFloorHeightAt(effect.x, effect.z) : 0;
    const remaining = Math.max(0, 1 - (Number(effect.ageMs) || 0) / Math.max(1, Number(effect.lifeMs) || 1));
    entry.root.position.set(effect.x, floor + (Number(effect.y ?? 0) || 0), effect.z);
    entry.root.rotation.y = state.timeMs * 0.005 + index * 0.19;
    const radius = Math.max(0.04, Number(effect.radius ?? 0.06) || 0.06);
    entry.mesh.scale.set(radius * 1.4, radius * 1.2, radius * 1.4);
    entry.material.color.set(effect.color || '#ffffff');
    entry.material.opacity = Math.max(0.04, (Number(effect.alpha ?? 1) || 1) * remaining);
  }

  function createDecalEntry(decal) {
    const root = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(decal.color || '#2c2f37'),
      transparent: true,
      opacity: Math.max(0.1, Number(decal.alpha ?? 0.85) || 0.85),
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
    mesh.frustumCulled = false;
    root.add(mesh);
    return { root, mesh, material };
  }

  function updateDecalEntry(entry, decal, index, state) {
    const level = state.level;
    const floor = level.getFloorHeightAt ? level.getFloorHeightAt(decal.x, decal.z) : 0;
    const remaining = decal.static
      ? 1
      : Math.max(0, 1 - (Number(decal.ageMs) || 0) / Math.max(1, Number(decal.lifeMs) || 1));
    entry.root.position.set(decal.x, floor + (Number(decal.y ?? 0) || 0), decal.z);
    entry.root.rotation.y = Number(decal.rotation ?? 0) || 0;
    entry.mesh.scale.set(
      Math.max(0.04, Number(decal.width ?? 0.5) || 0.5),
      Math.max(0.02, Number(decal.height ?? 0.03) || 0.03),
      Math.max(0.04, Number(decal.depth ?? 0.5) || 0.5)
    );
    entry.material.color.set(decal.color || '#2c2f37');
    entry.material.opacity = Math.max(0.04, (Number(decal.alpha ?? 0.85) || 0.85) * remaining);
  }

  function createEnemyProxyEntry(enemy) {
    const variant = enemy.def?.rig?.variant || enemy.def?.model || 'humanoid';
    if (variant === 'humanoid' && humanoidReady) {
      return null;
    }

    const root = new THREE.Group();
    const color = new THREE.Color(enemy.def?.color || '#ff6666');

    if (variant === 'floating') {
      const bodyMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.02, side: THREE.DoubleSide });
      const eyeMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, side: THREE.DoubleSide });
      const body = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), bodyMaterial);
      const core = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), bodyMaterial.clone());
      const eyeA = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), eyeMaterial);
      const eyeB = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), eyeMaterial.clone());
      const tendrilA = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), bodyMaterial.clone());
      const tendrilB = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), bodyMaterial.clone());
      const tendrilC = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), bodyMaterial.clone());
      const tendrilD = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), bodyMaterial.clone());
      root.add(body, core, eyeA, eyeB, tendrilA, tendrilB, tendrilC, tendrilD);
      return { root, variant, parts: { body, core, eyeA, eyeB, tendrilA, tendrilB, tendrilC, tendrilD }, materials: [bodyMaterial, bodyMaterial.clone(), eyeMaterial, eyeMaterial.clone(), bodyMaterial.clone(), bodyMaterial.clone(), bodyMaterial.clone(), bodyMaterial.clone()] };
    }

    const bodyMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.04, side: THREE.DoubleSide });
    const headMaterial = bodyMaterial.clone();
    const legMaterialA = bodyMaterial.clone();
    const legMaterialB = bodyMaterial.clone();
    const tailMaterial = bodyMaterial.clone();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), bodyMaterial);
    const head = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), headMaterial);
    const legFL = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), legMaterialA);
    const legFR = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), legMaterialA.clone());
    const legRL = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), legMaterialB);
    const legRR = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), legMaterialB.clone());
    const tail = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), tailMaterial);
    root.add(body, head, legFL, legFR, legRL, legRR, tail);
    return { root, variant, parts: { body, head, legFL, legFR, legRL, legRR, tail }, materials: [bodyMaterial, headMaterial, legMaterialA, legMaterialA.clone(), legMaterialB, legMaterialB.clone(), tailMaterial] };
  }

  function updateEnemyProxyEntry(entry, enemy, index, state) {
    const level = state.level;
    const floor = level.getFloorHeightAt ? level.getFloorHeightAt(enemy.x, enemy.z) : 0;
    const tint = new THREE.Color(enemy.def?.color || '#ff6666');
    if (enemy.dead) {
      tint.multiplyScalar(0.68);
    }

    if (entry.variant === 'floating') {
      const bob = Math.sin((enemy.bobPhase || 0) * 0.018) * 0.18;
      const sway = Math.sin((enemy.bobPhase || 0) * 0.011) * 0.04;
      entry.root.position.set(enemy.x, floor + enemy.height * 0.72 + bob, enemy.z);
      entry.root.rotation.y = enemy.facing + Math.PI * 0.5;
      entry.root.rotation.x = sway * 0.25;
      entry.root.rotation.z = sway * 0.9;
      entry.root.scale.set(Math.max(0.5, enemy.radius * 2.2), Math.max(0.5, enemy.height * 1.0), Math.max(0.5, enemy.radius * 2.2));
      const body = entry.parts.body;
      body.scale.set(0.55, 0.55, 0.55);
      body.position.set(0, 0, 0);
      body.rotation.y = sway * 0.8;
      entry.parts.core.scale.set(0.28, 0.28, 0.28);
      entry.parts.core.position.set(0, -0.02, 0.02);
      entry.parts.core.rotation.y = -sway * 1.6;
      entry.parts.eyeA.scale.set(0.06, 0.06, 0.06);
      entry.parts.eyeA.position.set(0.10, 0.08, -0.22);
      entry.parts.eyeA.rotation.z = sway * 1.4;
      entry.parts.eyeB.scale.set(0.06, 0.06, 0.06);
      entry.parts.eyeB.position.set(-0.10, 0.08, -0.22);
      entry.parts.eyeB.rotation.z = -sway * 1.4;
      entry.parts.tendrilA.scale.set(0.05, 0.24, 0.05);
      entry.parts.tendrilA.position.set(0.18, -0.36, -0.08);
      entry.parts.tendrilA.rotation.x = 0.18 + sway * 1.2;
      entry.parts.tendrilB.scale.set(0.05, 0.22, 0.05);
      entry.parts.tendrilB.position.set(-0.18, -0.34, -0.04);
      entry.parts.tendrilB.rotation.x = -0.16 - sway * 1.1;
      entry.parts.tendrilC.scale.set(0.05, 0.20, 0.05);
      entry.parts.tendrilC.position.set(0.08, -0.32, 0.10);
      entry.parts.tendrilC.rotation.x = 0.12 + sway * 0.9;
      entry.parts.tendrilD.scale.set(0.05, 0.20, 0.05);
      entry.parts.tendrilD.position.set(-0.06, -0.32, 0.12);
      entry.parts.tendrilD.rotation.x = -0.12 - sway * 0.9;
    } else {
      const bob = Math.sin((enemy.bobPhase || 0) * 0.024) * 0.08;
      const gait = Math.sin((enemy.bobPhase || 0) * 0.03);
      entry.root.position.set(enemy.x, floor + enemy.height * 0.5 + bob, enemy.z);
      entry.root.rotation.y = enemy.facing + Math.PI * 0.5;
      entry.root.rotation.x = Math.sin((enemy.bobPhase || 0) * 0.02) * 0.04;
      entry.root.scale.set(Math.max(0.5, enemy.radius * 2.0), Math.max(0.5, enemy.height * 0.92), Math.max(0.5, enemy.radius * 2.1));
      entry.parts.body.scale.set(0.72, 0.50, 0.92);
      entry.parts.body.position.set(0, 0.02, 0.02);
      entry.parts.body.rotation.z = gait * 0.03;
      entry.parts.head.scale.set(0.32, 0.32, 0.32);
      entry.parts.head.position.set(0.14, 0.38, -0.18);
      entry.parts.head.rotation.x = 0.08 + gait * 0.04;
      entry.parts.legFL.scale.set(0.10, 0.32, 0.10);
      entry.parts.legFL.position.set(0.18, -0.30 + gait * 0.02, 0.18);
      entry.parts.legFL.rotation.x = -0.55 * gait;
      entry.parts.legFR.scale.set(0.10, 0.32, 0.10);
      entry.parts.legFR.position.set(-0.18, -0.30 - gait * 0.02, 0.18);
      entry.parts.legFR.rotation.x = 0.55 * gait;
      entry.parts.legRL.scale.set(0.10, 0.32, 0.10);
      entry.parts.legRL.position.set(0.16, -0.30 - gait * 0.02, -0.12);
      entry.parts.legRL.rotation.x = 0.55 * gait;
      entry.parts.legRR.scale.set(0.10, 0.32, 0.10);
      entry.parts.legRR.position.set(-0.16, -0.30 + gait * 0.02, -0.12);
      entry.parts.legRR.rotation.x = -0.55 * gait;
      entry.parts.tail.scale.set(0.06, 0.20, 0.06);
      entry.parts.tail.position.set(0.0, -0.20, -0.36);
      entry.parts.tail.rotation.x = -0.18 + gait * 0.2;
    }

    for (const material of entry.materials || []) {
      material.color.copy(tint);
      if (enemy.hitFlashMs > 0) {
        material.color.lerp(new THREE.Color('#ffffff'), 0.16);
      }
      if (enemy.dead) {
        material.color.multiplyScalar(0.85);
      }
    }
    if (enemy.dead) {
      entry.root.rotation.z = 0.22;
      entry.root.position.y -= Math.min(0.22, (Number(enemy.dyingMs) || 0) * 0.0003);
    } else {
      entry.root.rotation.z = 0;
    }
  }

  function maybeMarkHumanoidReady() {
    humanoidReady = humanoidBaseLoaded && humanoidAnimLoaded && !!humanoidPrototype.root;
  }

  function createHumanoidEntry(enemy, key) {
    if (!humanoidPrototype.root) {
      return null;
    }

    const root = cloneSkinnedScene(humanoidPrototype.root);
    if (!root) {
      return null;
    }

    const mixer = new THREE.AnimationMixer(root);
    const entry = {
      root,
      mixer,
      currentAction: null,
      currentActionName: '',
      poseKey: '',
      seen: true,
      boneMap: buildBoneMap(root),
      debugHelper: null
    };

    if (debugEnabled) {
      const debugHelper = new THREE.BoxHelper(root, 0x7fd1ff);
      debugHelper.material.depthTest = false;
      debugHelper.material.transparent = true;
      debugHelper.material.opacity = 0.8;
      debugHelper.renderOrder = 9999;
      debugRoot.add(debugHelper);
      entry.debugHelper = debugHelper;
    }

    dynamicRoot.add(root);
    humanoidCache.set(key, entry);
    return entry;
  }

  function getHumanoidAction(instance, clipNames) {
    const clip = findClipByNames(humanoidClipMap, clipNames);
    if (!clip) {
      return null;
    }

    let action = instance.currentAction;
    if (instance.currentActionName !== clip.name) {
      action = instance.mixer.clipAction(clip);
      if (instance.currentAction && instance.currentAction !== action) {
        instance.currentAction.fadeOut(0.16);
      }
      action.reset();
      action.enabled = true;
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.clampWhenFinished = false;
      action.fadeIn(0.16);
      action.play();
      instance.currentAction = action;
      instance.currentActionName = clip.name;
      instance.poseKey = `${clip.name}:loop`;
    }

    return action;
  }

  function setHumanoidOneShotAction(instance, clipNames, keySuffix, loopDurationSeconds, fadeSeconds = 0.12) {
    const clip = findClipByNames(humanoidClipMap, clipNames);
    if (!clip) {
      return null;
    }

    const poseKey = `${clip.name}:${keySuffix}`;
    if (instance.poseKey !== poseKey) {
      const action = instance.mixer.clipAction(clip);
      if (instance.currentAction && instance.currentAction !== action) {
        instance.currentAction.fadeOut(fadeSeconds);
      }
      action.reset();
      action.enabled = true;
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.fadeIn(fadeSeconds);
      action.play();
      action.timeScale = clip.duration > 0 ? clip.duration / Math.max(0.05, loopDurationSeconds) : 1;
      instance.currentAction = action;
      instance.currentActionName = clip.name;
      instance.poseKey = poseKey;
      return action;
    }

    if (instance.currentAction && instance.currentActionName === clip.name) {
      instance.currentAction.timeScale = clip.duration > 0 ? clip.duration / Math.max(0.05, loopDurationSeconds) : 1;
      return instance.currentAction;
    }

    return null;
  }

  function updateHumanoidTransform(instance, enemy, floorHeight) {
    const baseHeight = Math.max(0.001, humanoidPrototype.baseHeight);
    const baseWidth = Math.max(0.001, humanoidPrototype.baseWidth);
    const heightScale = Math.max(0.18, Number(enemy.height || 1) / baseHeight);
    const widthScale = Math.max(0.18, (Number(enemy.radius || 0.4) * 2) / baseWidth);
    const scale = Math.max(heightScale, widthScale) * 0.98;
    instance.root.position.set(enemy.x, floorHeight, enemy.z);
    instance.root.rotation.y = enemy.facing + Math.PI * 0.5;
    instance.root.scale.setScalar(scale);
    instance.root.updateMatrixWorld(true);
  }

  function updateHumanoidPose(instance, enemy, state) {
    const def = enemy.def || {};
    const attackDurationSeconds = Math.max(0.14, Math.min(0.85, (Number(enemy.attackWindupTotalMs) || 220) / 1000));
    const deathDurationSeconds = Math.max(0.4, Math.min(1.0, (Number(enemy.dyingMs) || 600) / 1000));
    const hitDurationSeconds = 0.16;

    if (enemy.dead) {
      setHumanoidOneShotAction(instance, ['Death01', 'Death_01', 'Death'], 'death', deathDurationSeconds, 0.10);
      return;
    }

    if (enemy.attackWindupMs > 0) {
      if (def.behavior === 'melee') {
        setHumanoidOneShotAction(instance, ['Punch_Jab', 'Punch_Cross', 'Melee_Hook', 'Melee_Hook_Rec'], 'attack', attackDurationSeconds, 0.14);
      } else if (def.behavior === 'projectile' || def.behavior === 'boss') {
        setHumanoidOneShotAction(instance, ['OverhandThrow', 'Pistol_Shoot', 'Punch_Cross'], 'attack', attackDurationSeconds, 0.14);
      } else {
        setHumanoidOneShotAction(instance, ['Pistol_Shoot', 'Pistol_Aim_Neutral', 'Punch_Jab'], 'attack', attackDurationSeconds, 0.14);
      }
      return;
    }

    if (enemy.hitFlashMs > 0) {
      setHumanoidOneShotAction(instance, ['Hit_Chest', 'Hit_Knockback', 'Hit_Head'], 'hurt', hitDurationSeconds, 0.12);
      return;
    }

    const moveSpeed = Math.max(0, Number(def.speed) || 0);
    const walkAction = moveSpeed < 1.55 || def.behavior === 'boss'
      ? getHumanoidAction(instance, ['Walk_Formal_Loop', 'Walk_Loop', 'Idle_Torch_Loop'])
      : moveSpeed < 2.4
        ? getHumanoidAction(instance, ['Walk_Loop', 'Jog_Fwd_Loop', 'Walk_Formal_Loop'])
        : moveSpeed < 3.1
          ? getHumanoidAction(instance, ['Jog_Fwd_Loop', 'Sprint_Loop', 'Walk_Loop'])
          : getHumanoidAction(instance, ['Sprint_Loop', 'Jog_Fwd_Loop', 'Walk_Loop']);
    if (walkAction) {
      const walkSpeed = Math.max(0.72, Math.min(1.45, 0.78 + moveSpeed * 0.14));
      walkAction.timeScale = walkSpeed;
      return;
    }

    const idleAction = def.behavior === 'hitscan'
      ? getHumanoidAction(instance, ['Pistol_Idle_Loop', 'Idle_Loop', 'Idle_Torch_Loop'])
      : def.behavior === 'projectile' || def.behavior === 'boss'
        ? getHumanoidAction(instance, ['Idle_Torch_Loop', 'Idle_Loop', 'Pistol_Idle_Loop'])
        : getHumanoidAction(instance, ['Idle_Loop', 'A_TPose']);
    if (idleAction) {
      idleAction.timeScale = 1;
    }
  }

  function syncHumanoidEnemies(state) {
    if (!humanoidReady) {
      return;
    }

    const seen = new Set();
    for (const enemy of state.enemies || []) {
      if ((enemy.def?.rig?.variant || enemy.def?.model) !== 'humanoid') {
        continue;
      }

      const key = String(enemy.id ?? `${enemy.x}:${enemy.z}:${enemy.facing}`);
      seen.add(key);
      let entry = humanoidCache.get(key);
      if (!entry) {
        entry = createHumanoidEntry(enemy, key);
      }
      if (!entry) {
        continue;
      }

      entry.seen = true;
      const floorHeight = state.level.getFloorHeightAt ? state.level.getFloorHeightAt(enemy.x, enemy.z) : 0;
      updateHumanoidTransform(entry, enemy, floorHeight);
      updateHumanoidPose(entry, enemy, state);
      entry.mixer.update(humanoidDeltaSeconds);
      if (entry.boneMap && entry.boneMap.size > 0) {
        const scale = Math.max(0.001, Number(entry.root.scale.x) || 1);
        const poseState = resolveHumanoidPoseState(enemy);
        const motionBlend = poseState === 'idle'
          ? 0.14
          : poseState === 'walk'
            ? Math.max(0.22, Math.min(1, (Number(enemy.def?.speed) || 0) / 2.8))
            : poseState === 'attack'
              ? 0.76
              : poseState === 'hurt'
                ? 0.54
                : 0.06;
        const pose = sampleCharacterRigPose(
          enemy,
          floorHeight,
          scale,
          scale,
          scale,
          Number(enemy.bobPhase) || 0,
          {
            x: state.player?.x ?? enemy.x,
            y: floorHeight + (state.player?.eyeHeight || 1.58),
            z: state.player?.z ?? enemy.z
          },
          {
            poseState,
            motionBlend
          }
        );
        applyHumanoidRigIK(entry.boneMap, pose, { strength: poseState === 'death' ? 0.84 : 1 });
      }
      if (entry.debugHelper) {
        entry.debugHelper.update();
      }
    }

    for (const [key, entry] of humanoidCache.entries()) {
      if (seen.has(key)) {
        continue;
      }
      entry.mixer.stopAllAction();
      dynamicRoot.remove(entry.root);
      if (entry.debugHelper) {
        debugRoot.remove(entry.debugHelper);
        disposeObject3D(entry.debugHelper, { disposeTextures: false });
        entry.debugHelper = null;
      }
      humanoidCache.delete(key);
    }
  }

  function buildWeaponRig() {
    const weaponMap = getTexture('weapon', THREE.ClampToEdgeWrapping);
    const panelMap = getTexture('uiPanel', THREE.ClampToEdgeWrapping);
    const emissiveMap = getTexture('materialEmissive', THREE.ClampToEdgeWrapping);
    weaponMaterials.body = new THREE.MeshStandardMaterial({
      map: weaponMap,
      color: new THREE.Color('#d8e0ea'),
      roughness: 0.82,
      metalness: 0.16,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    weaponMaterials.metal = new THREE.MeshStandardMaterial({
      map: getTexture('materialMetal', THREE.RepeatWrapping),
      color: new THREE.Color('#d4d9e2'),
      roughness: 0.46,
      metalness: 0.68,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    weaponMaterials.dark = new THREE.MeshStandardMaterial({
      map: panelMap,
      color: new THREE.Color('#8d97a7'),
      roughness: 0.72,
      metalness: 0.12,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    weaponMaterials.accent = new THREE.MeshStandardMaterial({
      map: emissiveMap,
      color: new THREE.Color('#ffffff'),
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 0.18,
      roughness: 0.52,
      metalness: 0.02,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    weaponMaterials.flash = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#fff1b8'),
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), weaponMaterials.body);
    const barrel = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), weaponMaterials.metal);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), weaponMaterials.dark);
    const accent = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), weaponMaterials.accent);
    const flash = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), weaponMaterials.flash);
    body.frustumCulled = barrel.frustumCulled = grip.frustumCulled = accent.frustumCulled = flash.frustumCulled = false;
    body.renderOrder = barrel.renderOrder = grip.renderOrder = accent.renderOrder = flash.renderOrder = 1000;
    weaponRig.add(body);
    weaponRig.add(barrel);
    weaponRig.add(grip);
    weaponRig.add(accent);
    weaponRig.add(flash);
    weaponMeshes.body = body;
    weaponMeshes.barrel = barrel;
    weaponMeshes.grip = grip;
    weaponMeshes.accent = accent;
    weaponMeshes.flash = flash;
    weaponRig.visible = true;
  }

  function updateWeaponRig(state) {
    const pose = sampleFirstPersonWeaponPose(state);
    const weaponKind = pose.modelKind || 'default';
    const weaponTemplates = {
      pistol: {
        body: [0.28, 0.14, 0.42],
        barrel: [0.10, 0.08, 0.36],
        grip: [0.12, 0.22, 0.14],
        accent: [0.06, 0.05, 0.08],
        bodyPos: [0.08, 0.00, 0.10],
        barrelPos: [0.12, 0.02, 0.28],
        gripPos: [-0.04, -0.18, -0.02],
        accentPos: [0.06, 0.05, 0.16]
      },
      shotgun: {
        body: [0.42, 0.18, 0.72],
        barrel: [0.14, 0.10, 0.88],
        grip: [0.14, 0.24, 0.18],
        accent: [0.08, 0.06, 0.12],
        bodyPos: [0.06, 0.02, 0.08],
        barrelPos: [0.10, 0.03, 0.40],
        gripPos: [-0.04, -0.17, -0.04],
        accentPos: [0.10, 0.06, 0.28]
      },
      chaingun: {
        body: [0.52, 0.22, 0.62],
        barrel: [0.18, 0.14, 0.76],
        grip: [0.12, 0.22, 0.18],
        accent: [0.10, 0.08, 0.18],
        bodyPos: [0.08, 0.03, 0.08],
        barrelPos: [0.12, 0.04, 0.30],
        gripPos: [-0.04, -0.16, -0.02],
        accentPos: [0.18, 0.06, 0.18]
      },
      cannon: {
        body: [0.54, 0.24, 0.82],
        barrel: [0.16, 0.14, 0.96],
        grip: [0.14, 0.22, 0.20],
        accent: [0.12, 0.08, 0.22],
        bodyPos: [0.08, 0.02, 0.12],
        barrelPos: [0.10, 0.04, 0.42],
        gripPos: [-0.04, -0.16, -0.04],
        accentPos: [0.14, 0.08, 0.28]
      },
      bossCannon: {
        body: [0.70, 0.30, 1.02],
        barrel: [0.22, 0.18, 1.22],
        grip: [0.16, 0.24, 0.22],
        accent: [0.14, 0.10, 0.26],
        bodyPos: [0.10, 0.04, 0.16],
        barrelPos: [0.12, 0.06, 0.52],
        gripPos: [-0.04, -0.18, -0.04],
        accentPos: [0.18, 0.10, 0.36]
      },
      orb: {
        body: [0.38, 0.20, 0.48],
        barrel: [0.14, 0.14, 0.40],
        grip: [0.12, 0.18, 0.16],
        accent: [0.20, 0.20, 0.20],
        bodyPos: [0.06, 0.01, 0.08],
        barrelPos: [0.08, 0.03, 0.18],
        gripPos: [-0.02, -0.14, -0.02],
        accentPos: [0.22, 0.05, 0.24]
      },
      default: {
        body: [0.34, 0.16, 0.54],
        barrel: [0.10, 0.08, 0.42],
        grip: [0.12, 0.20, 0.16],
        accent: [0.08, 0.05, 0.10],
        bodyPos: [0.06, 0.01, 0.10],
        barrelPos: [0.10, 0.02, 0.30],
        gripPos: [-0.04, -0.16, -0.02],
        accentPos: [0.08, 0.04, 0.18]
      }
    };
    const template = weaponTemplates[weaponKind] || weaponTemplates.default;
    const weaponTint = new THREE.Color().setRGB(pose.weaponTint[0], pose.weaponTint[1], pose.weaponTint[2]);
    const panelTint = new THREE.Color().setRGB(pose.panelTint[0], pose.panelTint[1], pose.panelTint[2]);

    weaponRig.visible = !state.player?.dead && !state.paused;
    weaponRig.position.set(pose.offsetX, pose.offsetY, pose.offsetZ);
    weaponRig.rotation.order = 'YXZ';
    weaponRig.rotation.set(pose.pitch, pose.yaw, pose.roll);

    weaponMaterials.body.color.copy(weaponTint);
    weaponMaterials.metal.color.copy(weaponTint).multiplyScalar(0.92);
    weaponMaterials.dark.color.copy(panelTint).multiplyScalar(0.72);
    weaponMaterials.accent.color.copy(panelTint).lerp(new THREE.Color('#ffffff'), 0.18);
    weaponMaterials.accent.emissive.copy(panelTint).lerp(new THREE.Color('#ffffff'), 0.32);

    weaponMeshes.body.position.set(...template.bodyPos);
    weaponMeshes.body.scale.set(...template.body);
    weaponMeshes.barrel.position.set(...template.barrelPos);
    weaponMeshes.barrel.scale.set(...template.barrel);
    weaponMeshes.grip.position.set(...template.gripPos);
    weaponMeshes.grip.scale.set(...template.grip);
    weaponMeshes.accent.position.set(...template.accentPos);
    weaponMeshes.accent.scale.set(...template.accent);

    const flashMs = Math.max(0, Number(state.player?.muzzleFlashMs) || 0);
    const flashStrength = Math.max(0, Math.min(1, flashMs / 72));
    if (weaponMeshes.flash) {
      weaponMeshes.flash.visible = flashStrength > 0;
      weaponMeshes.flash.material.opacity = Math.max(0, flashStrength * 0.86);
      weaponMeshes.flash.material.color.set('#fff1b8');
      const flashScale = 0.10 + flashStrength * 0.24;
      weaponMeshes.flash.scale.set(
        Math.max(0.06, flashScale * (template.barrel[0] * 2.1)),
        Math.max(0.06, flashScale * (template.barrel[1] * 2.1)),
        Math.max(0.06, flashScale * (template.barrel[2] * 0.75))
      );
      weaponMeshes.flash.position.set(
        template.barrelPos[0],
        template.barrelPos[1],
        template.barrelPos[2] + template.barrel[2] * 0.56
      );
    }
  }

  function syncDynamicScene(state, level, theme) {
    syncMap(propCache, level.props || [], staticRoot, createPropEntry, updatePropEntry, state);
    syncMap(lightCache, level.lights || [], staticRoot, createLightEntry, updateLightEntry, state);
    syncMap(pickupCache, state.pickups || [], dynamicRoot, createPickupEntry, updatePickupEntry, state);
    syncMap(projectileCache, state.projectiles || [], dynamicRoot, createProjectileEntry, updateProjectileEntry, state);
    syncMap(effectCache, state.effects || [], dynamicRoot, createEffectEntry, updateEffectEntry, state);
    syncMap(decalCache, state.decals || [], dynamicRoot, createDecalEntry, updateDecalEntry, state);

    if (humanoidReady) {
      syncHumanoidEnemies(state);
    }

    const proxyEnemies = [];
    for (const enemy of state.enemies || []) {
      if ((enemy.def?.rig?.variant || enemy.def?.model) === 'humanoid') {
        if (!humanoidReady) {
          proxyEnemies.push(enemy);
        }
        continue;
      }
      proxyEnemies.push(enemy);
    }

    syncMap(enemyCache, proxyEnemies, dynamicRoot, createEnemyProxyEntry, updateEnemyProxyEntry, state);
    updateWeaponRig(state);
  }

  function render(state) {
    const level = state.level;
    if (!level) {
      return;
    }

    syncRendererSize();

    const stateTimeMs = Number(state?.timeMs ?? 0) || 0;
    humanoidDeltaSeconds = lastHumanoidStateTimeMs === null
      ? 0
      : Math.max(0, (stateTimeMs - lastHumanoidStateTimeMs) / 1000);
    lastHumanoidStateTimeMs = stateTimeMs;

    const themeId = getThemeAt(level, state.player?.x ?? 0, state.player?.z ?? 0) || level.theme || 'default';
    const theme = getTheme(themeId);
    const levelKey = `${level.id}:${Number(level.geometryVersion) || 0}`;
    if (currentLevelKey !== levelKey) {
      rebuildLevel(level, theme);
    }
    if (currentThemeId !== themeId) {
      currentThemeId = themeId;
      applyTheme(theme);
    }

    const floorHeight = level.getFloorHeightAt ? level.getFloorHeightAt(state.player.x, state.player.z) : 0;
    const eyeHeight = state.player.eyeHeight || 1.58;
    const eye = [state.player.x, floorHeight + eyeHeight, state.player.z];
    const forward = [
      Math.cos(state.player.yaw) * Math.cos(state.player.pitch),
      Math.sin(state.player.pitch),
      Math.sin(state.player.yaw) * Math.cos(state.player.pitch)
    ];
    const target = [eye[0] + forward[0], eye[1] + forward[1], eye[2] + forward[2]];
    camera.position.set(eye[0], eye[1], eye[2]);
    camera.lookAt(target[0], target[1], target[2]);
    skyRoot.position.set(0, 0, 0);

    syncDynamicScene(state, level, theme);
    renderer.render(scene, camera);
    lastRenderInfo = {
      calls: Number(renderer.info?.render?.calls ?? 0) || 0,
      triangles: Number(renderer.info?.render?.triangles ?? 0) || 0,
      lines: Number(renderer.info?.render?.lines ?? 0) || 0,
      points: Number(renderer.info?.render?.points ?? 0) || 0,
      geometries: Number(renderer.info?.memory?.geometries ?? 0) || 0,
      textures: Number(renderer.info?.memory?.textures ?? 0) || 0
    };
    lastCollisionInfo = {
      checks: Number(state?.metrics?.collision?.checks ?? 0) || 0,
      blockedChecks: Number(state?.metrics?.collision?.blockedChecks ?? 0) || 0,
      moves: Number(state?.metrics?.collision?.moves ?? 0) || 0,
      resolutionAttempts: Number(state?.metrics?.collision?.resolutionAttempts ?? 0) || 0
    };
  }

  function dispose() {
    clearGroup(levelRoot);
    clearGroup(staticRoot);
    clearHumanoidCache();
    clearGroup(dynamicRoot);
    clearGroup(weaponRig);
    if (humanoidPrototype.root) {
      disposeObject3D(humanoidPrototype.root, { disposeTextures: false });
      humanoidPrototype.root = null;
    }
    humanoidClipMap.clear();
    if (skyMesh) {
      skyRoot.remove(skyMesh);
      disposeObject3D(skyMesh, { disposeTextures: false });
      skyMesh = null;
    }
    clearCaches();
    for (const texture of threeTextureCache.values()) {
      texture.dispose();
    }
    threeTextureCache.clear();
    renderer.dispose();
  }

  buildWeaponRig();
  skyMaterial = new THREE.MeshBasicMaterial({
    map: getTexture('sky', THREE.RepeatWrapping),
    color: new THREE.Color(THREE_WORLD_THEMES.default.skyTint),
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false
  });
  skyMesh = new THREE.Mesh(new THREE.SphereGeometry(200, 32, 16), skyMaterial);
  skyMesh.frustumCulled = false;
  skyMesh.renderOrder = -1000;
  skyRoot.add(skyMesh);
  applyTheme(THREE_WORLD_THEMES.default);

  return {
    render,
    dispose,
    clearLevelCache() {
      currentLevelKey = null;
      clearGroup(levelRoot);
      clearGroup(staticRoot);
      clearHumanoidCache();
      clearGroup(dynamicRoot);
      clearCaches();
      levelSurfaceMaterials.length = 0;
    },
    isReady: () => true,
    getDebugState() {
      return {
        debugEnabled,
        humanoidReady,
        humanoidBaseLoaded,
        humanoidAnimLoaded,
        humanoidInstances: humanoidCache.size,
        humanoidPrototypeLoaded: !!humanoidPrototype.root,
        humanoidActions: Array.from(humanoidCache.values(), (entry) => entry.currentActionName || entry.poseKey || ''),
        humanoidBoneCount: Array.from(humanoidCache.values(), (entry) => entry.boneMap?.size || 0).reduce((max, count) => Math.max(max, count), 0),
        humanoidIkEnabled: humanoidReady && Array.from(humanoidCache.values(), (entry) => (entry.boneMap?.size || 0) > 0).some(Boolean),
        renderInfo: { ...lastRenderInfo },
        collisionInfo: { ...lastCollisionInfo }
      };
    }
  };
}

function parseSeedFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('seed') || 'fps3d-alpha01';
}

function parseLevelFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('level') || CAMPAIGN_LEVEL_ID;
}

function parseCharacterPreviewFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('preview') === '1';
}

function parseDebugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('debug') === '1';
}

function reportLevelDiagnostics(level) {
  const diagnostics = Array.isArray(level?.diagnostics) ? level.diagnostics : [];
  for (const issue of diagnostics) {
    console.warn(`[fps3d] ${issue.severity || 'warning'}: ${issue.message}`);
  }
}

function cloneFrameInput(input) {
  return {
    moveForward: input.moveForward,
    moveStrafe: input.moveStrafe,
    lookYaw: input.gamepadLookYaw ?? 0,
    lookPitch: input.gamepadLookPitch ?? 0,
    mouseLookYaw: 0,
    mouseLookPitch: 0,
    gamepadLookYaw: input.gamepadLookYaw ?? 0,
    gamepadLookPitch: input.gamepadLookPitch ?? 0,
    fire: input.fire,
    altFire: input.altFire,
    use: false,
    sprint: input.sprint,
    pause: false,
    weaponIndex: null,
    nextWeapon: false,
    prevWeapon: false,
    restart: false
  };
}

function resizeCanvasPair() {
  const dpr = Math.min(window.devicePixelRatio || 1, activeGraphicsPixelRatioCap);
  const width = Math.max(1, Math.floor(window.innerWidth * dpr));
  const height = Math.max(1, Math.floor(window.innerHeight * dpr));

  if (worldCanvas.width !== width || worldCanvas.height !== height) {
    worldCanvas.width = width;
    worldCanvas.height = height;
  }

  if (hudCanvas.width !== width || hudCanvas.height !== height) {
    hudCanvas.width = width;
    hudCanvas.height = height;
  }
}

function buildCampaignLevelSeed(baseSeed, runIndex, levelIndex) {
  return deriveSeed(baseSeed, `campaign:${runIndex}:${levelIndex}`);
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noreferrer';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function main() {
  const seed = parseSeedFromUrl();
  const levelId = parseLevelFromUrl();
  const showCharacterPreview = parseCharacterPreviewFromUrl();
  const showDevOverlay = parseDebugFromUrl();
  const isCampaignMode = levelId === CAMPAIGN_LEVEL_ID;
  let textures = createGameTextures(null, seed);
  let worldRenderer = createThreeWorldRenderer({ canvas: worldCanvas, textures, debugEnabled: showDevOverlay });
  let settings = loadSettings();
  activeGraphicsPixelRatioCap = getGraphicsPixelRatioCap(settings.graphicsQuality);
  const audio = createAudioEngine(settings.masterVolume);
  let campaignRunIndex = 0;
  let campaignLevelIndex = 0;
  let campaignFinished = false;
  let demoRecording = null;
  let state = null;
  const input = createInputController(worldCanvas, {
    getSettings: () => settings
  });
  const hudCtx = hudCanvas.getContext('2d', { alpha: true });
  const characterPreviewRoot = characterPreviewCanvas?.parentElement;
  if (characterPreviewRoot) {
    characterPreviewRoot.hidden = !showCharacterPreview;
  }
  if (devOverlay) {
    devOverlay.hidden = !showDevOverlay;
  }
  const characterPreview = showCharacterPreview
    ? createCharacterPreview(characterPreviewCanvas, characterPreviewStatus)
    : null;
  const accumulator = createFixedStepAccumulator(16);
  let lastTime = null;
  let menuOpen = false;
  let menuPauseBeforeOpen = false;
  let graphicsReady = true;

  function createDemoRecording(runIndex, recordedLevelCount = isCampaignMode ? CAMPAIGN_LEVEL_COUNT : 1) {
    return {
      version: 1,
      type: 'fps3d-campaign-demo',
      baseSeed: seed,
      levelId,
      difficultyId: settings.difficultyId,
      levelCount: recordedLevelCount,
      runIndex,
      levels: []
    };
  }

  function captureLevelRecord(currentState, status) {
    return {
      status,
      runIndex: campaignRunIndex,
      levelIndex: campaignLevelIndex,
      levelSeed: currentState.seed,
      levelId: currentState.level.id,
      levelName: currentState.level.name,
      timeMs: currentState.timeMs,
      tick: currentState.tick,
      replay: cloneJson(currentState.replay),
      snapshot: {
        version: 1,
        seed: currentState.seed,
        buildVersion: currentState.buildVersion,
        levelId: currentState.levelId,
        difficultyId: currentState.difficultyId,
        timeMs: currentState.timeMs,
        tick: currentState.tick,
        completed: !!currentState.completed,
        paused: !!currentState.paused,
        campaign: cloneJson(currentState.campaign || null),
        player: cloneJson(currentState.player || null),
        level: cloneJson(currentState.level || null),
        events: cloneJson(currentState.events || [])
      }
    };
  }

  function archiveCurrentLevel(status) {
    if (!demoRecording || !state) {
      return;
    }

    demoRecording.levels.push(captureLevelRecord(state, status));
  }

  function buildNextLevelState(runIndex, nextLevelIndex) {
    const nextSeed = isCampaignMode
      ? buildCampaignLevelSeed(seed, runIndex, nextLevelIndex)
      : seed;

    const nextState = createGameState({
      seed: nextSeed,
      levelId: isCampaignMode ? CAMPAIGN_LEVEL_ID : levelId,
      difficulty: settings.difficultyId,
      campaignSeed: seed,
      campaignRunIndex: runIndex,
      levelIndex: nextLevelIndex,
      campaignLevelCount: CAMPAIGN_LEVEL_COUNT
    });

    nextState.player.mouseSensitivity = BASE_MOUSE_SENSITIVITY * settings.mouseSensitivity;
    return nextState;
  }

  function applyActiveState(nextState) {
    state = nextState;
    reportLevelDiagnostics(state.level);
    applyRuntimeSettings();
    accumulator.reset();
    lastTime = null;
    updateOverlay();
    updateDevOverlay();
  }

  function startCampaignRun(nextRunIndex) {
    campaignRunIndex = nextRunIndex;
    campaignLevelIndex = 0;
    campaignFinished = false;
    demoRecording = createDemoRecording(campaignRunIndex, CAMPAIGN_LEVEL_COUNT);
    applyActiveState(buildNextLevelState(campaignRunIndex, campaignLevelIndex));
  }

  function advanceCampaignLevel() {
    if (!isCampaignMode || campaignFinished) {
      return false;
    }

    archiveCurrentLevel('completed');

    if (campaignLevelIndex + 1 >= CAMPAIGN_LEVEL_COUNT) {
      campaignFinished = true;
      return false;
    }

    campaignLevelIndex += 1;
    applyActiveState(buildNextLevelState(campaignRunIndex, campaignLevelIndex));
    return true;
  }

  function restartGame() {
    if (isCampaignMode) {
      startCampaignRun(campaignRunIndex + 1);
      return;
    }

    demoRecording = createDemoRecording(0, 1);
    applyActiveState(createGameState({ seed, levelId, difficulty: settings.difficultyId }));
  }

  function getDemoRecording(includeActiveLevel = true) {
    if (!demoRecording) {
      return null;
    }

    const recording = cloneJson(demoRecording);
    if (includeActiveLevel && state && !campaignFinished) {
      recording.activeLevel = captureLevelRecord(state, 'active');
    }
    return recording;
  }

  function downloadDemoRecording() {
    const recording = getDemoRecording(true);
    if (!recording) {
      return;
    }

    const filename = `fps3d-demo-${recording.baseSeed}-${recording.runIndex + 1}.json`;
    downloadJson(filename, recording);
  }

  if (isCampaignMode) {
    startCampaignRun(0);
  } else {
    demoRecording = createDemoRecording(0, 1);
    applyActiveState(createGameState({ seed, levelId, difficulty: settings.difficultyId }));
  }

  function applyRuntimeSettings() {
    state.player.mouseSensitivity = BASE_MOUSE_SENSITIVITY * settings.mouseSensitivity;
    activeGraphicsPixelRatioCap = getGraphicsPixelRatioCap(settings.graphicsQuality);
    audio.setVolume(settings.masterVolume);
    resizeCanvasPair();
  }

  function rebuildGraphics() {
    worldRenderer.dispose();
    textures = createGameTextures(null, seed);
    worldRenderer = createThreeWorldRenderer({ canvas: worldCanvas, textures, debugEnabled: showDevOverlay });
    graphicsReady = true;
    accumulator.reset();
    lastTime = null;
    updateOverlay();
  }

  function populateDifficultySelect() {
    const fragment = document.createDocumentFragment();

    for (const difficultyId of DIFFICULTY_ORDER) {
      const option = document.createElement('option');
      option.value = difficultyId;
      option.textContent = getDifficultyConfig(difficultyId).label;
      fragment.append(option);
    }

    difficultySelect.replaceChildren(fragment);
  }

  function syncSettingsUI() {
    invertGamepadYInput.checked = settings.invertGamepadY;
    difficultySelect.value = settings.difficultyId;
    if (mouseSensitivityInput) {
      mouseSensitivityInput.value = String(settings.mouseSensitivity);
    }
    if (mouseSensitivityValue) {
      mouseSensitivityValue.textContent = `${Number(settings.mouseSensitivity).toFixed(2)}x`;
    }
    if (masterVolumeInput) {
      masterVolumeInput.value = String(settings.masterVolume);
    }
    if (masterVolumeValue) {
      masterVolumeValue.textContent = `${Math.round(Number(settings.masterVolume) * 100)}%`;
    }
    if (graphicsQualitySelect) {
      graphicsQualitySelect.value = settings.graphicsQuality;
    }
    syncFullscreenButton();
  }

  function updateMenuVisibility() {
    settingsBackdrop.hidden = !menuOpen;
    menuToggle.textContent = menuOpen ? 'Close' : 'Menu';
    menuToggle.setAttribute('aria-expanded', String(menuOpen));
  }

  function syncFullscreenButton() {
    if (!fullscreenToggle) {
      return;
    }

    const fullscreenTarget = document.fullscreenElement;
    const fullscreenSupported = typeof document.fullscreenEnabled === 'boolean' ? document.fullscreenEnabled : !!(appRoot && typeof appRoot.requestFullscreen === 'function');
    fullscreenToggle.disabled = !fullscreenSupported;
    fullscreenToggle.textContent = fullscreenTarget === appRoot ? 'Exit fullscreen' : 'Enter fullscreen';
  }

  function updateOverlay() {
    const lockState = document.pointerLockElement === worldCanvas ? 'Pointer locked' : 'Click to lock the mouse';
    const gamepadStatus = input.getGamepadStatus();
    const gamepadLabel = gamepadStatus.connected ? ` | gamepad ${gamepadStatus.id || 'connected'}` : '';
    const difficultyLabel = getDifficultyConfig(state.difficultyId).label;
    const campaignLabel = isCampaignMode ? ` | campaign ${campaignLevelIndex + 1}/${CAMPAIGN_LEVEL_COUNT}${campaignFinished ? ' complete' : ''}` : '';
    const demoLabel = isCampaignMode ? ` | demo ${demoRecording?.levels.length || 0}` : '';
    const menuLabel = menuOpen ? ' | menu open' : '';
    const pausedLabel = state.paused && !menuOpen ? ' | paused' : '';
    const geometryLabel = Array.isArray(state.level?.diagnostics) && state.level.diagnostics.length > 0
      ? ` | geometry issues ${state.level.diagnostics.length}`
      : '';
    const graphicsLabel = graphicsReady ? '' : ' | graphics recovering';
    overlayState.textContent = `${lockState} | ${state.level.name} | ${difficultyLabel} | seed ${state.seed}${campaignLabel}${demoLabel}${pausedLabel}${menuLabel}${geometryLabel}${graphicsLabel}${gamepadLabel}`;
  }

  function updateDevOverlay() {
    if (!showDevOverlay || !devOverlay) {
      return;
    }

    const rendererDebug = worldRenderer?.getDebugState?.() || {};
    const humanoidActions = Array.isArray(rendererDebug.humanoidActions)
      ? rendererDebug.humanoidActions.filter(Boolean)
      : [];
    const renderInfo = rendererDebug.renderInfo || {};
    const collisionInfo = rendererDebug.collisionInfo || {};
    const player = state.player || {};
    const replayEvents = Array.isArray(state.replay?.events) ? state.replay.events : [];
    const lastReplayEvent = replayEvents.length > 0 ? replayEvents[replayEvents.length - 1].type : 'none';
    const lines = [
      `renderer: ${rendererDebug.humanoidReady ? 'humanoid ready' : 'loading'} | instances ${rendererDebug.humanoidInstances ?? 0}`,
      `assets: base ${rendererDebug.humanoidBaseLoaded ? 'yes' : 'no'} | anim ${rendererDebug.humanoidAnimLoaded ? 'yes' : 'no'} | proto ${rendererDebug.humanoidPrototypeLoaded ? 'yes' : 'no'}`,
      `actions: ${humanoidActions.length > 0 ? humanoidActions.join(', ') : 'none'}`,
      `perf: draw ${renderInfo.calls ?? 0} tris ${renderInfo.triangles ?? 0} tex ${renderInfo.textures ?? 0} | collision ${collisionInfo.checks ?? 0}/${collisionInfo.blockedChecks ?? 0}`,
      `player: x ${Number(player.x || 0).toFixed(2)} z ${Number(player.z || 0).toFixed(2)} yaw ${Number(player.yaw || 0).toFixed(2)} pitch ${Number(player.pitch || 0).toFixed(2)}`,
      `enemies: ${Array.isArray(state.enemies) ? state.enemies.length : 0} | projectiles ${Array.isArray(state.projectiles) ? state.projectiles.length : 0} | effects ${Array.isArray(state.effects) ? state.effects.length : 0}`,
      `replay: ${replayEvents.length} events | last ${lastReplayEvent}`,
      `demo: ${demoRecording?.levels.length || 0} archived level(s)${campaignFinished ? ' | complete' : ''}`
    ];
    devOverlay.textContent = lines.join('\n');
  }

  function setDifficulty(difficultyId) {
    const normalized = normalizeDifficultyId(difficultyId);
    if (settings.difficultyId === normalized) {
      return;
    }

    settings = {
      ...settings,
      difficultyId: normalized
    };
    saveSettings(settings);
    applyDifficultyToState(state, normalized);
    syncSettingsUI();
    updateOverlay();
  }

  function setInvertGamepadY(enabled) {
    const next = !!enabled;
    if (settings.invertGamepadY === next) {
      return;
    }

    settings = {
      ...settings,
      invertGamepadY: next
    };
    saveSettings(settings);
    syncSettingsUI();
    updateOverlay();
  }

  function setMouseSensitivity(value) {
    const next = clampNumber(value, 0.5, 2);
    if (Math.abs(settings.mouseSensitivity - next) < 0.001) {
      return;
    }

    settings = {
      ...settings,
      mouseSensitivity: next
    };
    saveSettings(settings);
    applyRuntimeSettings();
    syncSettingsUI();
    updateOverlay();
  }

  function setMasterVolume(value) {
    const next = clamp01(value);
    if (Math.abs(settings.masterVolume - next) < 0.001) {
      return;
    }

    settings = {
      ...settings,
      masterVolume: next
    };
    saveSettings(settings);
    applyRuntimeSettings();
    syncSettingsUI();
    updateOverlay();
  }

  function setGraphicsQuality(value) {
    const next = normalizeGraphicsQualityId(value);
    if (settings.graphicsQuality === next) {
      return;
    }

    settings = {
      ...settings,
      graphicsQuality: next
    };
    saveSettings(settings);
    applyRuntimeSettings();
    syncSettingsUI();
    updateOverlay();
  }

  function toggleFullscreen() {
    if (!appRoot) {
      return;
    }

    if (document.fullscreenElement === appRoot) {
      const exitPromise = document.exitFullscreen?.();
      if (exitPromise && typeof exitPromise.catch === 'function') {
        exitPromise.catch(() => {});
      }
      syncFullscreenButton();
      return;
    }

    const request = appRoot.requestFullscreen?.({ navigationUI: 'hide' });
    if (request && typeof request.catch === 'function') {
      request.catch(() => {});
    }
    syncFullscreenButton();
  }

  function openMenu() {
    if (menuOpen) {
      return;
    }

    menuPauseBeforeOpen = state.paused;
    menuOpen = true;
    state.paused = true;
    syncSettingsUI();
    updateMenuVisibility();
    updateOverlay();

    if (document.pointerLockElement === worldCanvas && typeof document.exitPointerLock === 'function') {
      document.exitPointerLock();
    }

    invertGamepadYInput.focus();
  }

  function closeMenu(restorePause = true) {
    if (!menuOpen) {
      return;
    }

    menuOpen = false;
    state.paused = restorePause ? menuPauseBeforeOpen : false;
    menuPauseBeforeOpen = false;
    updateMenuVisibility();
    updateOverlay();
  }

  function renderHud() {
    hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
    drawHud(hudCtx, state, hudCanvas.width, hudCanvas.height);
  }

  function playAudioForEvents(events) {
    if (!Array.isArray(events) || events.length === 0) {
      return;
    }

    for (const event of events) {
      audio.playEvent(event);
    }
  }

  worldCanvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    graphicsReady = false;
    updateOverlay();
  });

  worldCanvas.addEventListener('webglcontextrestored', () => {
    rebuildGraphics();
  });

  function frame(now) {
    const safeNow = Number.isFinite(now) ? now : performance.now();
    const deltaMs = lastTime === null ? 0 : normalizeElapsedMs(safeNow - lastTime, 100);
    lastTime = safeNow;
    resizeCanvasPair();

    const frameInput = input.sampleFrameInput();

    if (!menuOpen) {
      let steps = accumulator.add(deltaMs);
      let stepInput = frameInput;

      while (steps > 0) {
        advanceGameState(state, stepInput, accumulator.stepMs);
        playAudioForEvents(state.events);
        if (state.requestRestart) {
          restartGame();
          state.requestRestart = false;
          break;
        }
        if (state.completed && !campaignFinished) {
          if (advanceCampaignLevel()) {
            break;
          }
        }
        steps -= 1;
        stepInput = cloneFrameInput(stepInput);
      }
    } else {
      accumulator.reset();
    }

    if (graphicsReady) {
      worldRenderer.render(state);
    }
    renderHud();
    characterPreview?.render(safeNow);
    updateOverlay();
    updateDevOverlay();
    requestAnimationFrame(frame);
  }

  worldCanvas.addEventListener('click', () => {
    if (menuOpen) {
      return;
    }

    if (document.pointerLockElement !== worldCanvas) {
      worldCanvas.requestPointerLock();
    }
  });

  menuToggle.addEventListener('click', () => {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  closeMenuButton.addEventListener('click', () => {
    closeMenu();
  });

  restartButton.addEventListener('click', () => {
    restartGame();
    closeMenu(false);
  });

  saveDemoButton.addEventListener('click', () => {
    downloadDemoRecording();
  });

  invertGamepadYInput.addEventListener('change', () => {
    setInvertGamepadY(invertGamepadYInput.checked);
  });

  difficultySelect.addEventListener('change', () => {
    setDifficulty(difficultySelect.value);
  });

  mouseSensitivityInput?.addEventListener('input', () => {
    setMouseSensitivity(mouseSensitivityInput.value);
  });

  masterVolumeInput?.addEventListener('input', () => {
    setMasterVolume(masterVolumeInput.value);
  });

  graphicsQualitySelect?.addEventListener('change', () => {
    setGraphicsQuality(graphicsQualitySelect.value);
  });

  fullscreenToggle?.addEventListener('click', () => {
    toggleFullscreen();
  });

  settingsBackdrop.addEventListener('click', (event) => {
    if (event.target === settingsBackdrop) {
      closeMenu();
    }
  });

  document.addEventListener('fullscreenchange', syncFullscreenButton);
  document.addEventListener('pointerdown', () => {
    audio.unlock();
  }, { capture: true, once: true });
  window.addEventListener('keydown', () => {
    audio.unlock();
  }, { capture: true, once: true });

  document.addEventListener('pointerlockchange', updateOverlay);
  window.addEventListener('resize', resizeCanvasPair);
  window.addEventListener('beforeunload', () => {
    input.dispose();
    worldRenderer.dispose();
    characterPreview?.dispose();
    audio.dispose();
    disposeTextures(null, textures);
  });

  window.__fps3d = {
    getState: () => state,
    getStateSnapshot: () => snapshotGameState(state),
    getTraceLog: () => JSON.parse(JSON.stringify(state.trace || [])),
    getReplayCapture: () => JSON.parse(JSON.stringify(state.replay)),
    getDemoRecording,
    getSettings: () => ({ ...settings }),
    getRendererDebug: () => worldRenderer?.getDebugState?.() ?? null,
    getCharacterPreviewDebug: () => characterPreview?.getDebugState?.() ?? null,
    step: (stepMs = 16, frameInput = {}) => {
      advanceGameState(state, cloneFrameInput(frameInput), stepMs);
      return snapshotGameState(state);
    },
    restart: restartGame,
    downloadDemoRecording,
    openMenu,
    closeMenu
  };

  populateDifficultySelect();
  syncSettingsUI();
  applyRuntimeSettings();
  updateMenuVisibility();
  resizeCanvasPair();
  updateOverlay();
  requestAnimationFrame(frame);
}

main().catch(showError);
