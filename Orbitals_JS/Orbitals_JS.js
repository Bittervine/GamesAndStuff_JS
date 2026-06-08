import * as THREE from './lib/three.module.js';
import { GLTFLoader } from './lib/loaders/GLTFLoader.js';
import { createOrbitalsSim, ENEMY_MODEL_FILES_BY_FAMILY, formatCombatLog } from './Orbitals_Sim.js';
import { PLANET_FILES, config } from './orbitals_config.js';

const ASSET_ROOT = './assets/';
const PLAYER_FILE = `${ASSET_ROOT}player_spaceship.glb`;
const STAR_FILE = `${ASSET_ROOT}star_,map_1.glb`;
const ENEMY_FAMILY_KEYS = Object.keys(ENEMY_MODEL_FILES_BY_FAMILY);
const ENEMY_MODEL_FILES = Array.from(new Set(ENEMY_FAMILY_KEYS.flatMap((familyKey) => ENEMY_MODEL_FILES_BY_FAMILY[familyKey] || [])));

const app = document.getElementById('app');
const loadingWrap = document.getElementById('loadingWrap');
const loadingText = document.getElementById('loadingText');
const loadingBarInner = document.getElementById('loadingBarInner');
const titleOverlayEl = document.getElementById('titleOverlay');
const statusLine = document.getElementById('status');
const statsLine = document.getElementById('stats');
const mouseDebugLine = document.getElementById('mouseDebug');
const mouseLockButton = document.getElementById('mouseLockButton');
const reticleEl = document.getElementById('reticle');
const enemyMarkersEl = document.getElementById('enemyMarkers');
const gameOverOverlayEl = document.getElementById('gameOverOverlay');
const gameOverTimerEl = document.getElementById('gameOverTimer');

const params = new URLSearchParams(window.location.search);
const seed = params.has('seed')
  ? parseSeed(params.get('seed'))
  : (config.debug ? config.debugSeed : parseSeed(''));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050811);
// The planet cluster is much larger now, so keep the far planets in view.
scene.fog = new THREE.FogExp2(0x050811, 0.0000005);

const camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 1500000);
camera.position.set(0, 6, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.setClearColor(0x050811, 1);
app.appendChild(renderer.domElement);

const loader = new GLTFLoader();
const clock = new THREE.Clock();

const world = new THREE.Group();
scene.add(world);

const sun = new THREE.PointLight(0xffe3b4, 250, 0, 2);
sun.position.set(0, 0, 0);
scene.add(sun);

const ambient = new THREE.AmbientLight(0xa9bbff, 0.8);
scene.add(ambient);

const fill = new THREE.DirectionalLight(0x7da8ff, 1.7);
fill.position.set(-1.5, 2.5, 2.2);
scene.add(fill);

const rim = new THREE.DirectionalLight(0x7ff0d8, 1.1);
rim.position.set(2.5, 1.2, -2.8);
scene.add(rim);

const sim = createOrbitalsSim(seed);
const state = sim.state;
const uiState = {
  aimX: 0,
  aimY: 0,
  pointerLocked: false,
  gamepadConnected: false,
  mouseFireHeld: false,
  mouseBoostHeld: false,
  mouseCenteredHoldTime: 0,
  mouseShipCentered: false,
  keyboardIdle: true,
  gamepadIdle: true,
  touchPointerId: null,
  loaded: false,
  gameStarted: false
};
const projectileVisuals = new Map();
const enemyVisuals = new Map();
const enemyExplosionVisuals = new Map();
const enemyFamilyTemplates = new Map();
const enemyHudMarkers = [];
const orbitalsAudio = {
  ctx: null,
  master: null,
  sfx: null,
  noise: null,
  boostNoiseSource: null,
  boostNoiseFilter: null,
  boostNoiseGain: null,
  enabled: false,
  soundNotInit: true,
  soundInitFailed: false,
  resumePromise: null
};
let lastProjectileIdForSfx = 0;
let lastEnemyExplosionIdForSfx = 0;
const spaceDebrisCount = 880;
const spaceDebrisPositions = new Float32Array(spaceDebrisCount * 3);
const spaceDebrisSeeds = new Float32Array(spaceDebrisCount);
const spaceDebrisOffsets = new Float32Array(spaceDebrisCount * 3);
const spaceDebrisDistances = new Float32Array(spaceDebrisCount);
const spaceDebrisGeometry = new THREE.BufferGeometry();
spaceDebrisGeometry.setAttribute('position', new THREE.BufferAttribute(spaceDebrisPositions, 3));
const spaceDebrisMaterial = new THREE.PointsMaterial({
  color: 0xeaf6ff,
  size: 6.0,
  sizeAttenuation: true,
  transparent: true,
  opacity: 1.0,
  depthWrite: false,
  depthTest: true
});
const spaceDebrisPoints = new THREE.Points(spaceDebrisGeometry, spaceDebrisMaterial);
spaceDebrisPoints.frustumCulled = false;
spaceDebrisPoints.renderOrder = 999;
spaceDebrisPoints.visible = false;
scene.add(spaceDebrisPoints);
const spaceDebrisAnchor = new THREE.Vector3();
const spaceDebrisMinDistance = 4000;
const spaceDebrisMaxDistance = 14000;
const starRoot = new THREE.Group();
scene.add(starRoot);
const starCoronaGroup = new THREE.Group();
starCoronaGroup.renderOrder = -30;
starRoot.add(starCoronaGroup);
const starCoronaLayers = [];

const starLight = new THREE.PointLight(0xfff2c6, 12000, 0, 2);
starLight.position.set(0, 0, 0);
scene.add(starLight);

window.__orbitals = config.debug ? {
  state,
  getCombatEvents() {
    return state.eventLog.map((event) => ({ ...event }));
  },
  getCombatLog() {
    return state.eventLog.map((event) => ({ ...event }));
  },
  dumpCombatLog() {
    return formatCombatLog(state);
  },
  snapshot() {
    const ship = state.ship;
    const cameraOffset = ship ? camera.position.clone().sub(ship.position) : null;
    const localUp = ship && state.nearestPlanet
      ? ship.position.clone().sub(state.nearestPlanet.position).normalize()
      : null;
    return {
      seed: state.seed,
      fuel: state.fuel,
      speed: state.speed,
      crashed: state.crashed,
      nearestPlanet: state.nearestPlanet ? state.nearestPlanet.name : null,
      altitude: state.nearestAltitude,
      cameraPosition: {
        x: Number(camera.position.x.toFixed(3)),
        y: Number(camera.position.y.toFixed(3)),
        z: Number(camera.position.z.toFixed(3))
      },
      shipPosition: ship ? {
        x: Number(ship.position.x.toFixed(3)),
        y: Number(ship.position.y.toFixed(3)),
        z: Number(ship.position.z.toFixed(3))
      } : null,
      shipForward: ship ? {
        x: Number(ship.forward.x.toFixed(3)),
        y: Number(ship.forward.y.toFixed(3)),
        z: Number(ship.forward.z.toFixed(3))
      } : null,
      cameraShipDistance: ship ? Number(camera.position.distanceTo(ship.position).toFixed(3)) : null,
      cameraBehindDistance: ship ? Number((-cameraOffset.dot(ship.forward)).toFixed(3)) : null,
      cameraAboveDistance: ship && localUp ? Number(cameraOffset.dot(localUp).toFixed(3)) : null,
      planetCount: state.planets.length,
      planetSummary: state.planets.map((planet) => ({
        name: planet.name,
        file: planet.file,
        radius: Number(planet.radius.toFixed(3)),
        orbitRadius: Number(planet.orbitRadius.toFixed(3)),
        orbitRadiusB: Number(planet.orbitRadiusB.toFixed(3)),
        orbitSpeed: Number(planet.orbitSpeed.toFixed(5)),
        orbitPhase: Number(planet.orbitPhase.toFixed(5))
      }))
    };
  }
} : {
  state,
  snapshot() {
    const ship = state.ship;
    const cameraOffset = ship ? camera.position.clone().sub(ship.position) : null;
    const localUp = ship && state.nearestPlanet
      ? ship.position.clone().sub(state.nearestPlanet.position).normalize()
      : null;
    return {
      seed: state.seed,
      fuel: state.fuel,
      speed: state.speed,
      crashed: state.crashed,
      nearestPlanet: state.nearestPlanet ? state.nearestPlanet.name : null,
      altitude: state.nearestAltitude,
      cameraPosition: {
        x: Number(camera.position.x.toFixed(3)),
        y: Number(camera.position.y.toFixed(3)),
        z: Number(camera.position.z.toFixed(3))
      },
      cameraOffset: cameraOffset ? {
        x: Number(cameraOffset.x.toFixed(3)),
        y: Number(cameraOffset.y.toFixed(3)),
        z: Number(cameraOffset.z.toFixed(3))
      } : null,
      shipPosition: ship ? {
        x: Number(ship.position.x.toFixed(3)),
        y: Number(ship.position.y.toFixed(3)),
        z: Number(ship.position.z.toFixed(3))
      } : null,
      shipForward: ship ? {
        x: Number(ship.forward.x.toFixed(3)),
        y: Number(ship.forward.y.toFixed(3)),
        z: Number(ship.forward.z.toFixed(3))
      } : null,
      shipUp: ship ? {
        x: Number(ship.up.x.toFixed(3)),
        y: Number(ship.up.y.toFixed(3)),
        z: Number(ship.up.z.toFixed(3))
      } : null,
      localUp: localUp ? {
        x: Number(localUp.x.toFixed(3)),
        y: Number(localUp.y.toFixed(3)),
        z: Number(localUp.z.toFixed(3))
      } : null,
      pointerLocked: uiState.pointerLocked,
      gamepadConnected: uiState.gamepadConnected,
      mouseFireHeld: uiState.mouseFireHeld,
      mouseBoostHeld: uiState.mouseBoostHeld,
      mouseCenteredHoldTime: uiState.mouseCenteredHoldTime,
      loaded: uiState.loaded
    };
  }
};

const keys = new Set();
const tempVecA = new THREE.Vector3();
const tempVecB = new THREE.Vector3();
const tempVecC = new THREE.Vector3();
const tempVecD = new THREE.Vector3();
const tempVecE = new THREE.Vector3();
const tempVecF = new THREE.Vector3();
const tempQuat = new THREE.Quaternion();
const tempMat = new THREE.Matrix4();
const tempColorA = new THREE.Color();
const tempColorB = new THREE.Color();
const worldUp = new THREE.Vector3(0, 1, 0);
const RETICLE_OFFSET_PX = 170;
const MOUSE_AIM_SENSITIVITY = 0.0019;
const MOUSE_RETICLE_IDLE_CENTER_DEG = 5;
const MOUSE_SHIP_TURN_MAX = 1.0;
const MOUSE_SHIP_RESPONSE_MULTIPLIER = 10;
const ENEMY_HUD_MARKER_COUNT = 20;

function parseSeed(rawValue) {
  if (rawValue == null || rawValue === '') {
    return Math.floor(Date.now()) >>> 0;
  }
  if (/^\d+$/.test(rawValue)) {
    return Number(rawValue) >>> 0;
  }
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < rawValue.length; i += 1) {
    hash ^= rawValue.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(a) {
  return function rng() {
    let t = a += 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rand() {
  return state.rng();
}

function randRange(min, max) {
  return min + (max - min) * rand();
}

function randInt(min, max) {
  return Math.floor(randRange(min, max + 1));
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function easeExp(value, rate) {
  return 1 - Math.exp(-Math.max(0.0001, rate) * value);
}

function ensureOrbitalsAudio() {
  if (orbitalsAudio.ctx) {
    orbitalsAudio.soundNotInit = false;
    orbitalsAudio.soundInitFailed = false;
    return orbitalsAudio.ctx;
  }
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) {
    orbitalsAudio.soundNotInit = true;
    orbitalsAudio.soundInitFailed = true;
    return null;
  }

  try {
    orbitalsAudio.ctx = new Ctx();
  } catch (error) {
    orbitalsAudio.soundNotInit = true;
    orbitalsAudio.soundInitFailed = true;
    return null;
  }
  orbitalsAudio.master = orbitalsAudio.ctx.createGain();
  orbitalsAudio.master.gain.value = 0.7;
  orbitalsAudio.master.connect(orbitalsAudio.ctx.destination);
  orbitalsAudio.sfx = orbitalsAudio.ctx.createGain();
  orbitalsAudio.sfx.gain.value = 0.8;
  orbitalsAudio.sfx.connect(orbitalsAudio.master);

  const len = Math.max(1, Math.floor(orbitalsAudio.ctx.sampleRate * 2.0));
  const buf = orbitalsAudio.ctx.createBuffer(1, len, orbitalsAudio.ctx.sampleRate);
  const data = buf.getChannelData(0);
  let lastOut = 0;
  let maxAbs = 0.0001;
  for (let i = 0; i < len; i += 1) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + white * 0.02) / 1.02;
    data[i] = lastOut;
    maxAbs = Math.max(maxAbs, Math.abs(data[i]));
  }
  const normalize = 0.92 / maxAbs;
  for (let i = 0; i < len; i += 1) {
    data[i] *= normalize;
  }
  orbitalsAudio.noise = buf;
  orbitalsAudio.soundNotInit = false;
  orbitalsAudio.soundInitFailed = false;
  return orbitalsAudio.ctx;
}

function playOrbitalsStartChime() {
  const ctx = orbitalsAudio.ctx;
  if (!ctx || ctx.state !== 'running') {
    return;
  }
  playOrbitalsTone({ freq: 196, endFreq: 294, dur: 0.14, gain: 0.08, type: 'triangle', pan: -0.15 });
  playOrbitalsTone({ freq: 294, endFreq: 392, dur: 0.12, gain: 0.06, type: 'sine', pan: 0.1, delay: 0.05 });
  playOrbitalsTone({ freq: 392, endFreq: 523, dur: 0.18, gain: 0.05, type: 'triangle', pan: 0.2, delay: 0.1 });
}

function ensureBoostNoiseNode() {
  const ctx = ensureOrbitalsAudio();
  if (!ctx || orbitalsAudio.boostNoiseSource) {
    return;
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  const bus = orbitalsAudio.sfx || orbitalsAudio.master;
  source.buffer = orbitalsAudio.noise;
  source.loop = true;
  filter.type = 'lowpass';
  filter.frequency.value = 180;
  filter.Q.value = 0.7;
  gain.gain.value = 0.0001;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(bus);
  source.start();

  orbitalsAudio.boostNoiseSource = source;
  orbitalsAudio.boostNoiseFilter = filter;
  orbitalsAudio.boostNoiseGain = gain;
}

function updateBoostNoise(boostLevel, pulse) {
  const ctx = orbitalsAudio.ctx;
  if (!ctx || ctx.state !== 'running') {
    return;
  }

  ensureBoostNoiseNode();
  if (!orbitalsAudio.boostNoiseGain || !orbitalsAudio.boostNoiseFilter) {
    return;
  }

  const now = ctx.currentTime;
  const active = clamp01(boostLevel * pulse);
  const gainTarget = Math.max(0.0001, Math.pow(active, 0.8) * 0.42);
  const cutoffTarget = 70 + active * 260;
  orbitalsAudio.boostNoiseGain.gain.setTargetAtTime(gainTarget, now, 0.025);
  orbitalsAudio.boostNoiseFilter.frequency.setTargetAtTime(cutoffTarget, now, 0.04);
}

function resumeOrbitalsAudio() {
  const ctx = ensureOrbitalsAudio();
  if (!ctx) {
    return Promise.resolve(null);
  }
  if (ctx.state === 'running') {
    orbitalsAudio.enabled = true;
    return Promise.resolve(ctx);
  }
  if (orbitalsAudio.resumePromise) {
    return orbitalsAudio.resumePromise;
  }
  orbitalsAudio.resumePromise = ctx.resume()
    .then(() => {
      orbitalsAudio.enabled = ctx.state === 'running';
      orbitalsAudio.soundNotInit = ctx.state !== 'running';
      orbitalsAudio.soundInitFailed = ctx.state !== 'running';
    })
    .catch(() => {
      orbitalsAudio.enabled = false;
      orbitalsAudio.soundNotInit = true;
      orbitalsAudio.soundInitFailed = true;
      return null;
    })
    .finally(() => {
      orbitalsAudio.resumePromise = null;
    });
  return orbitalsAudio.resumePromise;
}

function playOrbitalsTone(opts = {}) {
  const ctx = orbitalsAudio.ctx;
  if (!ctx || ctx.state !== 'running') {
    return;
  }
  const now = ctx.currentTime + (opts.delay || 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  const bus = orbitalsAudio.sfx || orbitalsAudio.master;
  osc.type = opts.type || 'sine';
  osc.frequency.setValueAtTime(opts.freq || 440, now);
  if (opts.endFreq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.endFreq), now + (opts.dur || 0.2));
  }
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, opts.gain || 0.1), now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (opts.dur || 0.2));
  osc.connect(gain);
  if (pan) {
    pan.pan.value = THREE.MathUtils.clamp(opts.pan || 0, -1, 1);
    gain.connect(pan);
    pan.connect(bus);
  } else {
    gain.connect(bus);
  }
  osc.start(now);
  osc.stop(now + (opts.dur || 0.2) + 0.02);
}

function playOrbitalsNoise(opts = {}) {
  const ctx = orbitalsAudio.ctx;
  if (!ctx || ctx.state !== 'running' || !orbitalsAudio.noise) {
    return;
  }
  const now = ctx.currentTime;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  const bus = orbitalsAudio.sfx || orbitalsAudio.master;
  source.buffer = orbitalsAudio.noise;
  source.loop = true;
  filter.type = opts.filterType || 'bandpass';
  filter.frequency.value = opts.cutoff || 900;
  filter.Q.value = opts.q || 0.8;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, opts.gain || 0.15), now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (opts.dur || 0.2));
  source.connect(filter);
  filter.connect(gain);
  if (pan) {
    pan.pan.value = THREE.MathUtils.clamp(opts.pan || 0, -1, 1);
    gain.connect(pan);
    pan.connect(bus);
  } else {
    gain.connect(bus);
  }
  source.start(now);
  source.stop(now + (opts.dur || 0.2) + 0.02);
}

function playOrbitalsSfx(name, opts = {}) {
  if (name === 'shoot') {
    playOrbitalsTone({ freq: 420, endFreq: 520, dur: 0.05, gain: 0.045, type: 'triangle' });
  } else if (name === 'start') {
    playOrbitalsStartChime();
  } else if (name === 'boom') {
    const gainScale = Math.max(0, opts.gainScale ?? 1);
    const pan = THREE.MathUtils.clamp(opts.pan || 0, -1, 1);
    playOrbitalsNoise({ dur: 0.8, gain: 0.25 * gainScale, cutoff: 20, q: 0.18, pan });
    playOrbitalsTone({ freq: 170, endFreq: 54, dur: 0.22, gain: 0.11 * gainScale, type: 'sawtooth', pan });
    playOrbitalsNoise({ dur: 0.03, gain: 0.018 * gainScale, cutoff: 1800, q: 0.45, pan });
  }
}

function withDotSlash(file) {
  return file.startsWith('./') ? file : `./${file}`;
}

function getClampedAim() {
  const aimX = uiState.aimX;
  const aimY = uiState.aimY;
  return { x: aimX, y: aimY };
}

function applyMouseAimDelta(deltaX, deltaY) {
  uiState.aimX += deltaX;
  uiState.aimY += deltaY;
}

function getMouseShipControlInputs() {
  const viewport = renderer.domElement.getBoundingClientRect();
  const halfWidth = Math.max(1, viewport.width * 0.5);
  const halfHeight = Math.max(1, viewport.height * 0.5);
  const focalX = halfWidth / Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
  const focalY = halfHeight / Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
  const dxPx = uiState.aimX * RETICLE_OFFSET_PX;
  const dyPx = uiState.aimY * RETICLE_OFFSET_PX;
  const angleX = Math.atan(Math.abs(dxPx) / focalX);
  const angleY = Math.atan(Math.abs(dyPx) / focalY);
  const maxAngle = Math.PI * 0.5;
  const turnInput = Math.sign(dxPx) * THREE.MathUtils.clamp(angleX / maxAngle, 0, 1) * MOUSE_SHIP_RESPONSE_MULTIPLIER;
  const pitchInput = Math.sign(dyPx) * THREE.MathUtils.clamp(angleY / maxAngle, 0, 1) * MOUSE_SHIP_RESPONSE_MULTIPLIER;
  const centerAngle = Math.max(angleX, angleY);
  const shipIsCentered = centerAngle <= THREE.MathUtils.degToRad(MOUSE_RETICLE_IDLE_CENTER_DEG);
  return {
    turnInput,
    pitchInput,
    shipIsCentered
  };
}

function applyDeadzone(value, deadzone = 0.16) {
  const magnitude = Math.abs(value);
  if (magnitude <= deadzone) {
    return 0;
  }
  const normalized = (magnitude - deadzone) / (1 - deadzone);
  return Math.sign(value) * normalized;
}

function readPrimaryGamepad() {
  if (!navigator.getGamepads) {
    return null;
  }
  const gamepads = navigator.getGamepads();
  for (const pad of gamepads) {
    if (pad && pad.connected) {
      return pad;
    }
  }
  return null;
}

function readGamepadInput() {
  const pad = readPrimaryGamepad();
  if (!pad) {
    return {
      connected: false,
      aimX: 0,
      aimY: 0,
      turnX: 0,
      pitchY: 0,
      fire: false,
      boost: false,
      brake: false,
      respawn: false
    };
  }

  const axes = pad.axes || [];
  const buttons = pad.buttons || [];
  const aimX = applyDeadzone(axes[2] ?? 0, 0.18);
  const aimY = applyDeadzone(axes[3] ?? 0, 0.18);
  const turnX = applyDeadzone(axes[0] ?? 0, 0.18);
  const pitchY = applyDeadzone(-(axes[1] ?? 0), 0.18);
  const fire = Boolean(buttons[7] && buttons[7].pressed);
  const boost = Boolean((buttons[0] && buttons[0].pressed) || (buttons[5] && buttons[5].pressed));
  const brake = Boolean((buttons[1] && buttons[1].pressed) || (buttons[6] && buttons[6].pressed) || (buttons[4] && buttons[4].pressed));
  const respawn = Boolean(buttons[9] && buttons[9].pressed);

  return {
    connected: true,
    aimX,
    aimY,
    turnX,
    pitchY,
    fire,
    boost,
    brake,
    respawn
  };
}

function randomUnitVector() {
  const z = randRange(-1, 1);
  const a = randRange(0, Math.PI * 2);
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  return new THREE.Vector3(Math.cos(a) * r, z, Math.sin(a) * r);
}

function buildBasisFromNormal(normal) {
  const up = normal.clone().normalize();
  const tangent = Math.abs(up.dot(worldUp)) > 0.92
    ? new THREE.Vector3(1, 0, 0).cross(up).normalize()
    : worldUp.clone().cross(up).normalize();
  const bitangent = up.clone().cross(tangent).normalize();
  return { tangent, bitangent, normal: up };
}

function quatFromForwardUp(forward, upHint) {
  const forwardDir = forward.clone().normalize();
  let right = upHint.clone().cross(forwardDir);
  if (right.lengthSq() < 1e-6) {
    right = Math.abs(forwardDir.y) > 0.92
      ? new THREE.Vector3(1, 0, 0).cross(forwardDir)
      : new THREE.Vector3(0, 1, 0).cross(forwardDir);
  }
  right.normalize();
  const up = forwardDir.clone().cross(right).normalize();
  tempMat.makeBasis(right, up, forwardDir);
  return tempQuat.setFromRotationMatrix(tempMat);
}

function createAtmosphereGlowTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size * 0.5;
  const cy = size * 0.5;
  const gradient = ctx.createRadialGradient(cx, cy, size * 0.10, cx, cy, size * 0.5);
  gradient.addColorStop(0.00, 'rgba(255,255,255,0.00)');
  gradient.addColorStop(0.42, 'rgba(255,255,255,0.04)');
  gradient.addColorStop(0.58, 'rgba(255,255,255,0.18)');
  gradient.addColorStop(0.70, 'rgba(255,255,255,0.10)');
  gradient.addColorStop(1.00, 'rgba(255,255,255,0.00)');
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

const atmosphereGlowTexture = createAtmosphereGlowTexture();
function createEngineFlameTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size * 0.5;
  const cy = size * 0.5;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = 'screen';

  const outer = ctx.createRadialGradient(0, size * 0.08, size * 0.02, 0, size * 0.03, size * 0.5);
  outer.addColorStop(0.00, 'rgba(255,255,255,0.95)');
  outer.addColorStop(0.18, 'rgba(255,250,225,0.90)');
  outer.addColorStop(0.34, 'rgba(255,198,104,0.82)');
  outer.addColorStop(0.60, 'rgba(255,120,24,0.42)');
  outer.addColorStop(1.00, 'rgba(255,120,24,0.00)');
  ctx.fillStyle = outer;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.46);
  ctx.bezierCurveTo(size * 0.18, -size * 0.28, size * 0.22, size * 0.05, 0, size * 0.40);
  ctx.bezierCurveTo(-size * 0.22, size * 0.05, -size * 0.18, -size * 0.28, 0, -size * 0.46);
  ctx.closePath();
  ctx.fill();

  const core = ctx.createRadialGradient(0, size * 0.02, size * 0.01, 0, size * 0.04, size * 0.25);
  core.addColorStop(0.00, 'rgba(255,255,255,1.00)');
  core.addColorStop(0.32, 'rgba(255,255,245,0.98)');
  core.addColorStop(0.68, 'rgba(255,255,245,0.44)');
  core.addColorStop(1.00, 'rgba(255,255,245,0.00)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.02, size * 0.12, size * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function createEngineSparkTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size * 0.5;
  const cy = size * 0.5;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = 'screen';

  const glow = ctx.createRadialGradient(0, 0, size * 0.02, 0, 0, size * 0.5);
  glow.addColorStop(0.00, 'rgba(255,255,255,1.00)');
  glow.addColorStop(0.16, 'rgba(255,245,200,0.95)');
  glow.addColorStop(0.44, 'rgba(255,180,64,0.55)');
  glow.addColorStop(1.00, 'rgba(255,180,64,0.00)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 248, 224, 0.72)';
  ctx.shadowColor = 'rgba(255, 222, 160, 0.55)';
  ctx.shadowBlur = size * 0.05;
  ctx.lineCap = 'round';
  const rays = 4;
  for (let i = 0; i < rays; i += 1) {
    const angle = (i / rays) * Math.PI * 0.5;
    const inner = size * 0.04;
    const outer = size * 0.30;
    ctx.lineWidth = 1.1 - i * 0.15;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    ctx.stroke();
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

const engineFlameTexture = createEngineFlameTexture();
const engineSparkTexture = createEngineSparkTexture();
const projectileGeometry = new THREE.SphereGeometry(1, 10, 8);
const projectileMaterial = new THREE.MeshBasicMaterial({
  color: 0x57a8ff,
  transparent: true,
  opacity: 0.95,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  toneMapped: false
});

function normalizeLoadedModel(root, targetSize) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 1e-4);
  const scale = targetSize / maxDim;
  root.position.sub(center).multiplyScalar(scale);
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);
  return root;
}

function loadGltf(url) {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => resolve(gltf.scene || gltf.scenes?.[0] || new THREE.Group()),
      undefined,
      reject
    );
  });
}

function createShipDisplay(root) {
  const shipRoot = new THREE.Group();
  const visual = new THREE.Group();
  const modelPivot = new THREE.Group();
  modelPivot.rotation.y = Math.PI;
  modelPivot.add(root);
  visual.add(modelPivot);
  shipRoot.add(visual);
  return {
    root: shipRoot,
    visual,
    modelPivot,
    model: root
  };
}

function createFallbackShip() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.ConeGeometry(0.6, 2.2, 6),
    new THREE.MeshStandardMaterial({ color: 0xaec9ff, metalness: 0.3, roughness: 0.45 })
  );
  body.rotation.x = Math.PI / 2;
  const fin = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.9, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x4966aa, metalness: 0.2, roughness: 0.6 })
  );
  fin.position.set(0, 0, -0.2);
  group.add(body, fin);
  return group;
}

function createFallbackPlanet(color) {
  const group = new THREE.Group();
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 48),
    new THREE.MeshStandardMaterial({
      color,
      metalness: 0.05,
      roughness: 0.9
    })
  );
  group.add(sphere);
  return group;
}

function createFallbackStar() {
  const group = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 48),
    new THREE.MeshBasicMaterial({
      color: 0xfff3c4,
      transparent: true,
      opacity: 1,
      toneMapped: false
    })
  );
  group.add(core);
  return group;
}

function updateShipDisplayTransform(display, position, forward, up, bank) {
  if (!display || !display.root || !display.visual) {
    return;
  }
  const bankedUp = tempVecA.copy(up);
  if (Math.abs(bank) > 1e-4) {
    bankedUp.applyAxisAngle(forward, bank).normalize();
  }
  display.root.quaternion.copy(quatFromForwardUp(forward, bankedUp));
  display.root.position.copy(position);
  display.visual.rotation.z = 0;
}

function createShipEngineEffects(root) {
  const heatMaterials = [];
  const emitterEffects = [];
  const seenMaterials = new Set();

  function addHeatMaterial(material) {
    if (!material || seenMaterials.has(material)) {
      return;
    }
    seenMaterials.add(material);
    heatMaterials.push({
      material,
      baseColor: material.color ? material.color.clone() : null,
      baseEmissive: material.emissive ? material.emissive.clone() : null,
      baseEmissiveIntensity: typeof material.emissiveIntensity === 'number' ? material.emissiveIntensity : 0,
      baseRoughness: typeof material.roughness === 'number' ? material.roughness : null
    });
  }

  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material || !obj.name || !/^Engine/.test(obj.name)) {
      return;
    }

    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const material of materials) {
      addHeatMaterial(material);
    }

    if (!/^EngineBell_/.test(obj.name) || !obj.geometry) {
      return;
    }

    obj.geometry.computeBoundingBox();
    const bounds = obj.geometry.boundingBox || new THREE.Box3().setFromObject(obj);
    const size = bounds.getSize(tempVecA);
    const center = bounds.getCenter(tempVecB);
    const flameAnchor = new THREE.Group();
    flameAnchor.position.copy(center);
    flameAnchor.position.z += Math.max(0.05, size.z * 0.5 + 0.05);
    flameAnchor.renderOrder = 31;
    obj.add(flameAnchor);

    const outerMaterial = new THREE.SpriteMaterial({
      map: engineFlameTexture,
      color: 0xffb15e,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      toneMapped: false
    });
    const outer = new THREE.Sprite(outerMaterial);
    outer.position.set(0, 0, 0.05);
    outer.scale.set(Math.max(0.45, size.x * 1.15), Math.max(0.95, size.x * 2.2), 1);
    outer.renderOrder = 32;
    flameAnchor.add(outer);

    const innerMaterial = new THREE.SpriteMaterial({
      map: engineFlameTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      toneMapped: false
    });
    const inner = new THREE.Sprite(innerMaterial);
    inner.position.set(0, 0, 0.11);
    inner.scale.set(Math.max(0.25, size.x * 0.72), Math.max(0.6, size.x * 1.35), 1);
    inner.renderOrder = 33;
    flameAnchor.add(inner);

    const light = new THREE.PointLight(0xfff1d2, 0, 20, 2);
    light.position.set(0, 0, 0.08);
    flameAnchor.add(light);

    const sparkCount = 14;
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkGeometry = new THREE.BufferGeometry();
    sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const sparkMaterial = new THREE.PointsMaterial({
      map: engineSparkTexture,
      color: 0xfff3c8,
      size: Math.max(0.05, size.x * 0.08),
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      toneMapped: false
    });
    const sparks = new THREE.Points(sparkGeometry, sparkMaterial);
    sparks.frustumCulled = false;
    sparks.renderOrder = 34;
    flameAnchor.add(sparks);

    const sparkSeeds = new Float32Array(sparkCount);
    const sparkRates = new Float32Array(sparkCount);
    const sparkSpreads = new Float32Array(sparkCount);
    for (let i = 0; i < sparkCount; i += 1) {
      sparkSeeds[i] = randRange(0, Math.PI * 2);
      sparkRates[i] = randRange(1.0, 4.0);
      sparkSpreads[i] = randRange(0.015, 0.09);
    }

    emitterEffects.push({
      mesh: obj,
      name: obj.name,
      outer,
      inner,
      light,
      sparks,
      sparkGeometry,
      sparkMaterial,
      sparkPositions,
      sparkSeeds,
      sparkRates,
      sparkSpreads,
      outerBaseColor: outerMaterial.color.clone(),
      innerBaseColor: innerMaterial.color.clone(),
      outerBaseScaleX: outer.scale.x,
      outerBaseScaleY: outer.scale.y,
      innerBaseScaleX: inner.scale.x,
      innerBaseScaleY: inner.scale.y,
      sparkBaseSize: sparkMaterial.size,
      sparkBaseZ: 0.03,
      phase: randRange(0, Math.PI * 2)
    });
  });

  return {
    heatMaterials,
    emitterEffects
  };
}

function updateShipEngineEffects(time) {
  const ship = state.ship;
  if (!ship || !ship.engineEffects) {
    return;
  }

  const boostDuration = Math.max(config.shipBoostDuration || 0, 0.0001);
  const boostLevel = state.fuel > 0 ? clamp01((ship.boostTimer || 0) / boostDuration) : 0;
  const pulse = 0.88 + Math.sin(time * 38.0) * 0.06 + Math.sin(time * 21.0 + 1.4) * 0.04;
  const heatMix = boostLevel * pulse;
  updateBoostNoise(boostLevel, pulse);

  for (const entry of ship.engineEffects.heatMaterials) {
    const material = entry.material;
    if (entry.baseColor && material.color) {
      tempColorA.copy(entry.baseColor).lerp(tempColorB.set(0xffffff), heatMix * 0.9);
      material.color.copy(tempColorA);
    }
    if (entry.baseEmissive && material.emissive) {
      tempColorA.copy(entry.baseEmissive).lerp(tempColorB.set(0xfff6dd), boostLevel * 0.6 + heatMix * 0.35);
      material.emissive.copy(tempColorA);
    }
    if (typeof entry.baseEmissiveIntensity === 'number' && typeof material.emissiveIntensity === 'number') {
      material.emissiveIntensity = entry.baseEmissiveIntensity + heatMix * 8.5;
    }
    if (typeof entry.baseRoughness === 'number' && typeof material.roughness === 'number') {
      material.roughness = THREE.MathUtils.lerp(entry.baseRoughness, Math.max(0.05, entry.baseRoughness * 0.35), boostLevel * 0.55);
    }
  }

  for (const emitter of ship.engineEffects.emitterEffects) {
    const boost = boostLevel;
    const flicker = 0.84 + Math.sin(time * 31 + emitter.phase) * 0.09 + Math.sin(time * 53 + emitter.phase * 1.7) * 0.05;
    const outerPulse = 0.92 + Math.sin(time * 38 + emitter.phase) * 0.04 + boost * 0.25;
    const innerPulse = 0.95 + Math.sin(time * 45 + emitter.phase * 1.4) * 0.03 + boost * 0.18;
    const active = boost > 0.01;

    emitter.outer.visible = active;
    emitter.inner.visible = active;
    emitter.light.visible = active;
    emitter.sparks.visible = active;

    if (active) {
      tempColorA.copy(emitter.outerBaseColor).lerp(tempColorB.set(0xffffff), boost * 0.9);
      emitter.outer.material.color.copy(tempColorA);
      emitter.outer.material.opacity = boost * 0.78 * flicker;
      emitter.outer.material.rotation = Math.sin(time * 20 + emitter.phase) * 0.12;
      emitter.outer.scale.set(
        emitter.outerBaseScaleX * outerPulse * (0.9 + boost * 0.55),
        emitter.outerBaseScaleY * outerPulse * (0.9 + boost * 0.45),
        1
      );

      tempColorA.copy(emitter.innerBaseColor).lerp(tempColorB.set(0xffffff), Math.min(1, boost * 0.95 + 0.15));
      emitter.inner.material.color.copy(tempColorA);
      emitter.inner.material.opacity = boost * 0.96 * (0.9 + Math.sin(time * 23 + emitter.phase * 1.3) * 0.08);
      emitter.inner.material.rotation = -Math.sin(time * 19 + emitter.phase * 0.7) * 0.08;
      emitter.inner.scale.set(
        emitter.innerBaseScaleX * innerPulse * (0.95 + boost * 0.35),
        emitter.innerBaseScaleY * innerPulse * (0.95 + boost * 0.25),
        1
      );

      emitter.light.intensity = 0.5 + boost * 12 * flicker;

      emitter.sparkMaterial.opacity = boost * 0.88 * flicker;
      emitter.sparkMaterial.size = emitter.sparkBaseSize * (0.85 + boost * 0.75);
      for (let i = 0; i < emitter.sparkSeeds.length; i += 1) {
        const base = i * 3;
        const phase = time * (3.0 + emitter.sparkRates[i] * 1.5) + emitter.sparkSeeds[i];
        const spread = boost * (0.03 + emitter.sparkSpreads[i] * 0.95);
        const push = emitter.sparkBaseZ + boost * (0.08 + i * 0.01);
        emitter.sparkPositions[base + 0] = Math.sin(phase) * spread;
        emitter.sparkPositions[base + 1] = Math.cos(phase * 1.37 + emitter.sparkSeeds[i]) * spread * 0.72;
        emitter.sparkPositions[base + 2] = push + Math.max(0, Math.sin(phase * 0.63) * 0.01);
      }
      emitter.sparkGeometry.attributes.position.needsUpdate = true;
    } else {
      emitter.outer.material.opacity = 0;
      emitter.inner.material.opacity = 0;
      emitter.light.intensity = 0;
      emitter.sparkMaterial.opacity = 0;
    }
  }
}

function createSunCoronaTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size * 0.5;
  const cy = size * 0.5;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = 'screen';

  const glow = ctx.createRadialGradient(0, 0, size * 0.02, 0, 0, size * 0.5);
  glow.addColorStop(0.00, 'rgba(255,255,255,0.95)');
  glow.addColorStop(0.14, 'rgba(255,249,220,0.92)');
  glow.addColorStop(0.34, 'rgba(255,214,120,0.50)');
  glow.addColorStop(0.60, 'rgba(255,170,62,0.18)');
  glow.addColorStop(1.00, 'rgba(255,170,62,0.00)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.44, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 226, 150, 0.30)';
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(255, 210, 120, 0.65)';
  ctx.shadowBlur = size * 0.03;
  for (let i = 0; i < 16; i += 1) {
    const angle = (i / 16) * Math.PI * 2;
    const inner = size * 0.08;
    const outer = size * (0.30 + (i % 3) * 0.04);
    ctx.lineWidth = 2.5 - (i % 4) * 0.25;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    ctx.stroke();
  }

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

const sunCoronaTexture = createSunCoronaTexture();
function addStarCoronaLayer(baseScale, opacity, color, stretchX = 1, stretchY = 1, pulse = 0.04, phase = 0) {
  const material = new THREE.SpriteMaterial({
    map: sunCoronaTexture,
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
    toneMapped: false
  });
  const sprite = new THREE.Sprite(material);
  sprite.frustumCulled = false;
  sprite.renderOrder = -25;
  sprite.scale.set(baseScale * stretchX, baseScale * stretchY, 1);
  starCoronaGroup.add(sprite);
  starCoronaLayers.push({
    sprite,
    baseScale,
    baseOpacity: opacity,
    stretchX,
    stretchY,
    pulse,
    phase
  });
}

function rebuildStarCorona() {
  while (starCoronaGroup.children.length > 0) {
    starCoronaGroup.remove(starCoronaGroup.children[0]);
  }
  starCoronaLayers.length = 0;
  addStarCoronaLayer(config.starScale * 2.8, 0.42, 0xfff9e4, 1.00, 1.00, 0.03, 0.0);
  addStarCoronaLayer(config.starScale * 4.2, 0.19, 0xffefb8, 1.06, 1.00, 0.05, 1.3);
  addStarCoronaLayer(config.starScale * 6.1, 0.10, 0xffc66a, 1.15, 1.04, 0.07, 2.2);
  addStarCoronaLayer(config.starScale * 8.8, 0.04, 0xff9f3e, 1.24, 1.10, 0.09, 2.9);
}

function makeStarfield() {
  const count = 2200;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const r = randRange(config.starfieldRadiusMin, config.starfieldRadiusMax);
    const dir = randomUnitVector();
    positions[i * 3 + 0] = dir.x * r;
    positions[i * 3 + 1] = dir.y * r;
    positions[i * 3 + 2] = dir.z * r;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xe6f0ff,
    size: 1.1,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
}

async function loadStarVisual() {
  let root;
  try {
    root = await loadGltf(withDotSlash(STAR_FILE));
  } catch (error) {
    console.warn('Star asset failed, using fallback.', error);
    root = createFallbackStar();
  }
  normalizeLoadedModel(root, config.starScale);
  root.traverse((obj) => {
    if (obj.isMesh && obj.material) {
      obj.castShadow = false;
      obj.receiveShadow = false;
      if (Array.isArray(obj.material)) {
        obj.material.forEach((mat) => {
          if (!mat) {
            return;
          }
          if (mat.color) {
            mat.color.set(0xfff3c4);
          }
          if ('emissive' in mat) {
            mat.emissive = new THREE.Color(0xffe2a0);
            mat.emissiveIntensity = 18;
          }
          mat.toneMapped = false;
        });
      } else {
        if (obj.material.color) {
          obj.material.color.set(0xfff3c4);
        }
        if ('emissive' in obj.material) {
          obj.material.emissive = new THREE.Color(0xffe2a0);
          obj.material.emissiveIntensity = 18;
        }
        obj.material.toneMapped = false;
      }
    }
  });
  starRoot.add(root);
  starRoot.position.set(0, 0, 0);
  rebuildStarCorona();
  starLight.intensity = 24000;
}

function initSpaceDebris() {
  for (let i = 0; i < spaceDebrisCount; i += 1) {
    const base = i * 3;
    const dir = randomUnitVector();
    const radius = randRange(spaceDebrisMinDistance, spaceDebrisMaxDistance);
    spaceDebrisOffsets[base + 0] = dir.x;
    spaceDebrisOffsets[base + 1] = dir.y;
    spaceDebrisOffsets[base + 2] = dir.z;
    spaceDebrisDistances[i] = radius;
    spaceDebrisPositions[base + 0] = dir.x * radius;
    spaceDebrisPositions[base + 1] = dir.y * radius;
    spaceDebrisPositions[base + 2] = dir.z * radius;
    spaceDebrisSeeds[i] = randRange(0, Math.PI * 2);
  }
  spaceDebrisGeometry.attributes.position.needsUpdate = true;
}

function updateSpaceDebris(dt) {
  const ship = state.ship;
  const showDebris = Boolean(ship && state.nearestPlanet && state.nearestAltitude > state.nearestPlanet.atmosphereRadius - state.nearestPlanet.radius);
  spaceDebrisPoints.visible = showDebris;
  if (!showDebris) {
    return;
  }
  spaceDebrisAnchor.copy(ship.position);
  for (let i = 0; i < spaceDebrisCount; i += 1) {
    const base = i * 3;
    const drift = 18 + (i % 7) * 4;
    spaceDebrisDistances[i] += dt * drift;
    if (spaceDebrisDistances[i] > spaceDebrisMaxDistance) {
      const dir = randomUnitVector();
      spaceDebrisOffsets[base + 0] = dir.x;
      spaceDebrisOffsets[base + 1] = dir.y;
      spaceDebrisOffsets[base + 2] = dir.z;
      spaceDebrisDistances[i] = randRange(spaceDebrisMinDistance, spaceDebrisMinDistance * 2.6);
    }
    const wobble = Math.sin(state.time * 0.8 + spaceDebrisSeeds[i]) * 90;
    const radius = spaceDebrisDistances[i] + wobble;
    spaceDebrisPositions[base + 0] = ship.position.x + spaceDebrisOffsets[base + 0] * radius;
    spaceDebrisPositions[base + 1] = ship.position.y + spaceDebrisOffsets[base + 1] * radius;
    spaceDebrisPositions[base + 2] = ship.position.z + spaceDebrisOffsets[base + 2] * radius;
  }
  spaceDebrisGeometry.attributes.position.needsUpdate = true;
}

function updateStarCorona(time) {
  const pulse = 1 + Math.sin(time * 1.25) * 0.03 + Math.sin(time * 2.1 + 0.7) * 0.015;
  for (const layer of starCoronaLayers) {
    const layerPulse = pulse + Math.sin(time * (1.1 + layer.pulse) + layer.phase) * layer.pulse;
    layer.sprite.scale.set(
      layer.baseScale * layer.stretchX * layerPulse,
      layer.baseScale * layer.stretchY * layerPulse,
      1
    );
    layer.sprite.material.opacity = layer.baseOpacity * (0.9 + Math.sin(time * (1.7 + layer.pulse) + layer.phase) * 0.1);
  }
  starLight.intensity = 24000 + Math.sin(time * 1.4) * 1500 + Math.sin(time * 2.7 + 0.6) * 900;
}

function createPlanetConfig(index, file) {
  const scale = config.planetScale;
  const orbitScale = config.orbitScale;
  const radius = (randRange(3.4, 6.8) + (index % 3) * 0.5) * scale;
  const atmosphereRadius = radius * randRange(config.atmosphereRatioMin, config.atmosphereRatioMax);
  const gravityRadius = radius * randRange(6.8, 10.5);
  const orbitRadius = (config.clusterRadius + index * randRange(1.05, 1.25) + randRange(-0.06, 0.06)) * orbitScale;
  const orbitRadiusB = orbitRadius * randRange(0.96, 1.04);
  const orbitSpeed = randRange(0.0075, 0.0225) * (index % 2 === 0 ? 1 : -1);
  const orbitPhase = randRange(0, Math.PI * 2);
  const orbitPrecession = randRange(-0.0022, 0.0022);
  const orbitTilt = randomUnitVector();
  const orbitPlane = buildBasisFromNormal(orbitTilt);
  const wobbleAxis = randomUnitVector();
  const surfaceOrbitPeriod = randRange(config.surfaceOrbitPeriodMin, config.surfaceOrbitPeriodMax);
  const gravityStrength = (4 * Math.PI * Math.PI * Math.pow(radius, 3)) / (surfaceOrbitPeriod * surfaceOrbitPeriod);
  const hueShift = randRange(-0.08, 0.1);
  return {
    name: `Planet ${index + 1}`,
    file,
    radius,
    atmosphereRadius,
    gravityRadius,
    gravityStrength,
    surfaceOrbitPeriod,
    orbitRadius,
    orbitRadiusB,
    orbitSpeed,
    orbitPhase,
    orbitPrecession,
    orbitPlane,
    wobbleAxis,
    wobblePhase: randRange(0, Math.PI * 2),
    wobbleSpeed: randRange(0.18, 0.55),
    wobbleStrength: randRange(0.4, 1.7),
    spinSpeed: randRange(-0.5, 0.8),
    hueShift,
    position: new THREE.Vector3(),
    previousPosition: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    root: new THREE.Group(),
    visual: new THREE.Group(),
    glow: null,
    fuelMotes: []
  };
}

function createFuelMoteVisual(mote, moteIndex) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(mote.size ?? randRange(0.06, 0.11), 10, 8),
    new THREE.MeshBasicMaterial({
      color: mote.color ?? (moteIndex % 2 === 0 ? 0x8ff2d1 : 0x88b5ff),
      transparent: true,
      opacity: 0.95
    })
  );
  return mesh;
}

function updateFuelMote(mote, dt, time) {
  if (!mote.visual) {
    return;
  }
  mote.visual.position.copy(mote.position);
  mote.visual.scale.setScalar(mote.scale);
}

function createProjectileVisual(projectile) {
  const material = projectileMaterial.clone();
  material.opacity = 0;
  const mesh = new THREE.Mesh(projectileGeometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 40;
  mesh.scale.setScalar(0);
  mesh.material.userData.fadeInDuration = 0.05;
  return mesh;
}

function createEnemyExplosionVisual(effect) {
  const particleCount = effect.particleCount || 14;
  const explosionScale = 5.0;
  const positions = new Float32Array(particleCount * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    map: engineSparkTexture,
    color: effect.cause === 'crash' ? 0xfff0c8 : 0xfff8da,
    size: effect.cause === 'crash' ? 0.55 : 0.45,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
    toneMapped: false
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 41;

  const rng = mulberry32((effect.id ^ 0x9e3779b9) >>> 0);
  const directions = new Float32Array(particleCount * 3);
  const speeds = new Float32Array(particleCount);
  const phases = new Float32Array(particleCount);
  const wobbleAxes = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i += 1) {
    const angle = rng() * Math.PI * 2;
    const z = rng() * 2 - 1;
    const radial = Math.sqrt(Math.max(0, 1 - z * z));
    const base = i * 3;
    directions[base + 0] = Math.cos(angle) * radial;
    directions[base + 1] = z;
    directions[base + 2] = Math.sin(angle) * radial;
    speeds[i] = ((effect.cause === 'crash' ? 2.0 : 1.6) + rng() * (effect.cause === 'crash' ? 3.6 : 2.8)) * explosionScale;
    phases[i] = rng() * Math.PI * 2;
    wobbleAxes[base + 0] = Math.cos(angle + Math.PI * 0.5) * radial;
    wobbleAxes[base + 1] = Math.sin(z * Math.PI) * 0.5;
    wobbleAxes[base + 2] = Math.sin(angle + Math.PI * 0.5) * radial;
  }

  points.userData = {
    positions,
    directions,
    speeds,
    phases,
    wobbleAxes,
    particleCount,
    baseSize: material.size,
    explosionScale
  };

  return points;
}

function updatePlanetVisual(planet, dt, time) {
  if (planet.root) {
    planet.root.position.copy(planet.position);
  }
  if (planet.glow) {
    const toCamera = planet.position.clone().sub(camera.position);
    if (toCamera.lengthSq() > 1e-8) {
      toCamera.normalize().multiplyScalar(planet.radius * 0.02);
      planet.glow.position.copy(toCamera);
    } else {
      planet.glow.position.set(0, 0, planet.radius * 0.02);
    }
  }
}

function updateProjectileVisuals() {
  const seen = new Set();
  for (const projectile of state.projectiles) {
    let visual = projectileVisuals.get(projectile.id);
    if (!visual) {
      visual = createProjectileVisual(projectile);
      projectileVisuals.set(projectile.id, visual);
      world.add(visual);
    }
    visual.position.copy(projectile.position);
    if (projectile.velocity.lengthSq() > 1e-6) {
      visual.lookAt(tempVecA.copy(projectile.position).add(projectile.velocity));
    }
    const lifeT = clamp01(1 - projectile.age / projectile.lifetime);
    const sizeT = clamp01(projectile.age / 0.2);
    const diameter = projectile.radius * 2;
    visual.scale.setScalar(THREE.MathUtils.lerp(0.0, diameter, sizeT) * THREE.MathUtils.lerp(0.65, 1.15, lifeT));
    const fadeInDuration = visual.material?.userData?.fadeInDuration ?? 0.3;
    const fadeInT = clamp01(projectile.age / fadeInDuration);
    visual.material.opacity = fadeInT * 0.95 * lifeT;
    seen.add(projectile.id);
  }

  for (const [id, visual] of projectileVisuals.entries()) {
    if (seen.has(id)) {
      continue;
    }
    if (visual.material) {
      visual.material.dispose();
    }
    world.remove(visual);
    projectileVisuals.delete(id);
  }
}

function updateEnemyExplosionVisuals() {
  const seen = new Set();
  for (const effect of state.enemyExplosions) {
    let visual = enemyExplosionVisuals.get(effect.id);
    if (!visual) {
      visual = createEnemyExplosionVisual(effect);
      enemyExplosionVisuals.set(effect.id, visual);
      world.add(visual);
    }

    const { positions, directions, speeds, phases, wobbleAxes, particleCount, baseSize, explosionScale } = visual.userData;
    const lifeT = clamp01(effect.age / effect.lifetime);
    const fadeT = 1 - lifeT;
    const age = effect.age;
    const burstScale = effect.cause === 'crash' ? 0.33 : 1.0;
    visual.position.copy(effect.position);
    visual.material.opacity = Math.pow(fadeT, 1.05) * 1.0;
    visual.material.size = baseSize * (1.0 + fadeT * 0.9);
    visual.scale.setScalar(explosionScale * (1 + age * 0.12));

    for (let i = 0; i < particleCount; i += 1) {
      const base = i * 3;
      const drift = speeds[i] * age * burstScale;
      const wobble = Math.sin(age * 14 + phases[i]) * (0.18 + fadeT * 0.18);
      positions[base + 0] = directions[base + 0] * drift + wobbleAxes[base + 0] * wobble;
      positions[base + 1] = directions[base + 1] * drift + wobbleAxes[base + 1] * wobble;
      positions[base + 2] = directions[base + 2] * drift + wobbleAxes[base + 2] * wobble;
    }

    visual.geometry.attributes.position.needsUpdate = true;
    seen.add(effect.id);
  }

  for (const [id, visual] of enemyExplosionVisuals.entries()) {
    if (seen.has(id)) {
      continue;
    }
    world.remove(visual);
    visual.geometry.dispose();
    visual.material.dispose();
    enemyExplosionVisuals.delete(id);
  }
}

function computeFireDirectionFromReticle() {
  const viewport = renderer.domElement.getBoundingClientRect();
  const halfWidth = Math.max(1, viewport.width * 0.5);
  const halfHeight = Math.max(1, viewport.height * 0.5);
  const ndcX = (uiState.aimX * RETICLE_OFFSET_PX) / halfWidth;
  const ndcY = -(uiState.aimY * RETICLE_OFFSET_PX) / halfHeight;
  const near = tempVecA.set(ndcX, ndcY, -1).unproject(camera);
  const far = tempVecB.set(ndcX, ndcY, 1).unproject(camera);
  return tempVecD.copy(far).sub(near).normalize();
}

function setAimFromScreenPoint(clientX, clientY) {
  const viewport = renderer.domElement.getBoundingClientRect();
  const centerX = viewport.left + viewport.width * 0.5;
  const centerY = viewport.top + viewport.height * 0.5;
  const halfWidth = Math.max(1, viewport.width * 0.5);
  const halfHeight = Math.max(1, viewport.height * 0.5);
  uiState.aimX = THREE.MathUtils.clamp((clientX - centerX) / halfWidth, -1, 1);
  uiState.aimY = THREE.MathUtils.clamp((clientY - centerY) / halfHeight, -1, 1);
}

function handleCanvasPointerDown(event) {
  const isStartButton = event.pointerType !== 'touch' && (event.button === 0 || event.button === 2);
  if (!uiState.gameStarted && uiState.loaded && isStartButton) {
    startGame();
    if (!uiState.pointerLocked) {
      renderer.domElement.requestPointerLock?.();
    }
    event.preventDefault();
    return;
  }
  resumeOrbitalsAudio();
  if (event.pointerType === 'touch') {
    uiState.touchPointerId = event.pointerId;
    uiState.mouseFireHeld = true;
    setAimFromScreenPoint(event.clientX, event.clientY);
    event.preventDefault();
    return;
  }
  if (!uiState.pointerLocked) {
    renderer.domElement.requestPointerLock?.();
  }
  if (event.button === 0) {
    uiState.mouseFireHeld = true;
  } else if (event.button === 2) {
    uiState.mouseBoostHeld = true;
  }
  if (renderer.domElement.hasPointerCapture?.(event.pointerId) !== true) {
    try {
      renderer.domElement.setPointerCapture?.(event.pointerId);
    } catch (error) {
      // Some browsers/platforms reject capture on synthetic or already-handled pointers.
    }
  }
  event.preventDefault();
}

function handleCanvasPointerUp(event) {
  if (event.pointerType === 'touch') {
    if (uiState.touchPointerId === event.pointerId) {
      uiState.touchPointerId = null;
    }
    uiState.mouseFireHeld = false;
    event.preventDefault();
    return;
  }
  if (event.button === 0) {
    uiState.mouseFireHeld = false;
  } else if (event.button === 2) {
    uiState.mouseBoostHeld = false;
  }
  renderer.domElement.releasePointerCapture?.(event.pointerId);
}

function handleCanvasPointerCancel(event) {
  if (event.pointerType === 'touch' && uiState.touchPointerId === event.pointerId) {
    uiState.touchPointerId = null;
  }
  uiState.mouseFireHeld = false;
  uiState.mouseBoostHeld = false;
  renderer.domElement.releasePointerCapture?.(event.pointerId);
}

function handleWindowBlur() {
  uiState.mouseFireHeld = false;
  uiState.mouseBoostHeld = false;
  uiState.touchPointerId = null;
}

function handleGlobalPointerDown(event) {
  if (uiState.gameStarted || !uiState.loaded) {
    return;
  }
  if (event.pointerType === 'touch') {
    return;
  }
  if (event.button !== 0 && event.button !== 2) {
    return;
  }
  event.preventDefault();
  startGame();
  if (event.button === 0) {
    renderer.domElement.requestPointerLock?.();
  }
}

function updateTitleOverlay() {
  if (!titleOverlayEl) {
    return;
  }
  const hidden = uiState.loaded && uiState.gameStarted;
  titleOverlayEl.classList.toggle('is-hidden', hidden);
  titleOverlayEl.setAttribute('aria-hidden', hidden ? 'true' : 'false');
}

function startGame() {
  if (!uiState.loaded || uiState.gameStarted) {
    return false;
  }
  uiState.gameStarted = true;
  updateTitleOverlay();
  statusLine.textContent = 'Starting Orbital Core...';
  resumeOrbitalsAudio().then((ctx) => {
    if (ctx && ctx.state === 'running') {
      playOrbitalsSfx('start');
    }
  });
  return true;
}

function maybeStartFromGamepad() {
  if (!uiState.loaded || uiState.gameStarted) {
    return;
  }
  const gamepad = readGamepadInput();
  if (gamepad.fire || gamepad.boost) {
    startGame();
  }
}

function relaxPlanetSeparation(planets) {
  const minGapFactor = 1.28;
  for (let iteration = 0; iteration < 3; iteration += 1) {
    for (let i = 0; i < planets.length; i += 1) {
      for (let j = i + 1; j < planets.length; j += 1) {
        const a = planets[i];
        const b = planets[j];
        const minDistance = (a.radius + b.radius) * minGapFactor;
        const delta = tempVecA.copy(b.position).sub(a.position);
        const distance = delta.length();
        if (distance < 0.0001 || distance >= minDistance) {
          continue;
        }
        const push = (minDistance - distance) * 0.5;
        delta.normalize().multiplyScalar(push);
        a.position.addScaledVector(delta, -1);
        b.position.add(delta);
      }
    }
  }
}

function pickNearestPlanet(position) {
  let nearest = null;
  let nearestDistance = Infinity;
  for (const planet of state.planets) {
    const distance = position.distanceTo(planet.position);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = planet;
    }
  }
  return { nearest, nearestDistance };
}

function syncShipWorldState() {
  const ship = state.ship;
  if (!ship || !ship.boundPlanet) {
    return;
  }
  ship.position.copy(ship.boundPlanet.position).add(ship.relativePosition);
  ship.velocity.copy(ship.boundPlanet.velocity).add(ship.relativeVelocity);
}

function transferShipToPlanet(nextPlanet) {
  const ship = state.ship;
  if (!ship || !nextPlanet) {
    return;
  }
  syncShipWorldState();
  ship.boundPlanet = nextPlanet;
  ship.relativePosition.copy(ship.position).sub(nextPlanet.position);
  ship.relativeVelocity.copy(ship.velocity).sub(nextPlanet.velocity);
}

function updateShipOrientation(dt, localUp) {
  const ship = state.ship;
  if (!ship || !ship.root || !ship.visual) {
    return;
  }
  updateShipDisplayTransform(ship, ship.position, ship.forward, ship.up, ship.bank);
}

function updateShipControls(dt) {
  const gamepad = readGamepadInput();
  uiState.gamepadConnected = gamepad.connected && !uiState.pointerLocked;
  const gamepadActive = gamepad.connected && (
    gamepad.turnX !== 0
    || gamepad.pitchY !== 0
    || gamepad.fire
    || gamepad.boost
    || gamepad.brake
    || gamepad.respawn
    || gamepad.aimX !== 0
    || gamepad.aimY !== 0
  );
  if (gamepadActive) {
    resumeOrbitalsAudio();
  }
  const touchActive = uiState.touchPointerId != null;
  if (!uiState.pointerLocked && !touchActive) {
    uiState.aimX = THREE.MathUtils.lerp(uiState.aimX, 0, easeExp(dt, 2.2));
    uiState.aimY = THREE.MathUtils.lerp(uiState.aimY, 0, easeExp(dt, 2.2));
    if (gamepad.aimX !== 0 || gamepad.aimY !== 0) {
      uiState.aimX = gamepad.aimX;
      uiState.aimY = gamepad.aimY;
    }
  }

  const keyboardTurn = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0)
    + (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0);
  const keyboardPitch = (keys.has('ArrowUp') ? 1 : 0) - (keys.has('ArrowDown') ? 1 : 0)
    + (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0);
  const fire = uiState.mouseFireHeld || keys.has('ControlLeft') || keys.has('ControlRight') || (!uiState.pointerLocked && gamepad.fire);
  const boost = uiState.mouseBoostHeld || keys.has('Space') || (!uiState.pointerLocked && gamepad.boost);
  const mouseShipActive = uiState.pointerLocked || touchActive;
  const mouseShipInput = mouseShipActive ? getMouseShipControlInputs() : { turnInput: 0, pitchInput: 0 };
  const fireDirection = fire ? computeFireDirectionFromReticle() : null;
  const projectileIdBefore = lastProjectileIdForSfx;
  const explosionIdBefore = lastEnemyExplosionIdForSfx;
  const mouseTurn = mouseShipActive ? mouseShipInput.turnInput : 0;
  const mousePitch = mouseShipActive ? mouseShipInput.pitchInput : 0;
  uiState.mouseShipCentered = Boolean(mouseShipActive && mouseShipInput.shipIsCentered);
  const mouseIdle = Boolean(mouseShipActive && uiState.mouseShipCentered && uiState.mouseCenteredHoldTime >= 0.5);
  uiState.keyboardIdle = !(
    keyboardTurn !== 0
    || keyboardPitch !== 0
    || keys.has('Space')
    || keys.has('ControlLeft')
    || keys.has('ControlRight')
    || keys.has('ShiftLeft')
    || keys.has('ShiftRight')
  );
  uiState.gamepadIdle = !(
    (uiState.pointerLocked ? false : gamepad.connected)
    && gamepadActive
  );

  sim.step(dt, {
    turnInput: THREE.MathUtils.clamp(keyboardTurn + mouseTurn + (uiState.pointerLocked ? 0 : gamepad.turnX), -1, 1),
    pitchInput: THREE.MathUtils.clamp(keyboardPitch + mousePitch + (uiState.pointerLocked ? 0 : gamepad.pitchY), -1, 1),
    mouseIdle,
    boost,
    brake: keys.has('ShiftLeft') || keys.has('ShiftRight') || (!uiState.pointerLocked && gamepad.brake),
    respawn: uiState.pointerLocked ? false : gamepad.respawn,
    fire,
    fireDirection,
  });

  if (uiState.pointerLocked) {
    if (mouseShipInput.shipIsCentered) {
      uiState.mouseCenteredHoldTime = (uiState.mouseCenteredHoldTime || 0) + dt;
    } else {
      uiState.mouseCenteredHoldTime = 0;
    }
  } else {
    uiState.mouseCenteredHoldTime = 0;
  }

  if (fire && state.nextProjectileId > projectileIdBefore) {
    playOrbitalsSfx('shoot');
  }
  const newEnemyExplosions = state.enemyExplosions.filter((effect) => effect.id >= explosionIdBefore);
  for (const effect of newEnemyExplosions) {
    const distance = camera.position.distanceTo(effect.position);
    const boomFalloffDistance = Math.max(1600, state.nearestPlanet ? state.nearestPlanet.radius * 1.6 : 2000);
    const gainScale = 1 / (1 + Math.pow(distance / boomFalloffDistance, 1.7));
    const relative = tempVecA.copy(effect.position).sub(camera.position);
    const pan = THREE.MathUtils.clamp(relative.x / Math.max(distance, 1), -1, 1);
    playOrbitalsSfx('boom', { gainScale, pan });
  }
  lastProjectileIdForSfx = state.nextProjectileId || projectileIdBefore;
  lastEnemyExplosionIdForSfx = state.nextEnemyExplosionId || explosionIdBefore;
}

function updateCamera(dt) {
  const ship = state.ship;
  if (!ship || !state.nearestPlanet) {
    return;
  }
  const localUp = tempVecA.copy(ship.position).sub(state.nearestPlanet.position).normalize();
  const altitude = state.nearestAltitude;
  const depth = state.nearestPlanet.atmosphereRadius > state.nearestPlanet.radius
    ? clamp01((state.nearestPlanet.atmosphereRadius - altitude) / (state.nearestPlanet.atmosphereRadius - state.nearestPlanet.radius))
    : 0;
  const camDistance = THREE.MathUtils.lerp(config.shipCamDistance * 1.06, config.shipCamDistance * 0.96, depth);
  const camHeight = THREE.MathUtils.lerp(config.shipCamHeight * 1.08, config.shipCamHeight * 0.92, depth);
  const behind = tempVecB.copy(ship.forward).multiplyScalar(-camDistance);
  const above = tempVecC.copy(ship.up).multiplyScalar(camHeight);
  const desiredCameraPos = tempVecD.copy(ship.position).add(behind).add(above);
  camera.position.copy(desiredCameraPos);
  const cameraRollResponse = ship.flightMode === 'free'
    ? config.freeCameraRollResponse
    : Math.max(config.shipCamLag * 0.35, 8.0);
  camera.up.lerp(ship.up, easeExp(dt, cameraRollResponse));
  if (camera.up.lengthSq() < 1e-8) {
    camera.up.copy(ship.up);
  }
  camera.up.normalize();
  const lookTarget = ship.position.clone()
    .addScaledVector(ship.forward, 10);
  camera.lookAt(lookTarget);
}

function updateHud() {
  const nearest = state.nearestPlanet;
  const alt = state.nearestAltitude;
  const score = state.score || 0;
  const fuel = state.fuel || 0;
  const speed = state.speed || 0;
  const planetIndex = nearest ? (state.planets.indexOf(nearest) + 1) : 0;
  const shipMode = state.ship ? (state.ship.flightMode || (state.ship.boundPlanet ? 'bound' : 'free')) : 'none';
  const lock = state.ship ? (state.ship.recaptureLock || 0) : 0;
  const mouseCenteredHoldTime = uiState.mouseCenteredHoldTime || 0;
  const mode = state.crashed
    ? 'CRASHED'
    : (uiState.pointerLocked ? 'Mouse captured' : (uiState.gamepadConnected ? 'Gamepad ready' : 'Keyboard ready'));
  statusLine.textContent = nearest
    ? `Score: ${score} | Fuel: ${fuel.toFixed(1)} | Speed: ${speed.toFixed(1)} | Planet: ${planetIndex} | Altitude: ${alt.toFixed(1)} | State: ${state.crashed ? 'CRASHED' : shipMode}`
    : `Score: ${score} | Fuel: ${fuel.toFixed(1)} | Speed: ${speed.toFixed(1)} | Planet: 0 | Altitude: ${alt.toFixed(1)} | State: ${state.crashed ? 'CRASHED' : shipMode}`;
  statsLine.textContent = state.crashed
    ? (() => {
        const remaining = Math.max(0, config.crashRespawnDelay - (state.crashTimer || 0));
        return remaining > 0
          ? `Ship destroyed. Restart available in ${remaining.toFixed(1)}s.`
          : 'Ship destroyed. Press R or Start to restart.';
      })()
    : 'Use Gamepad or W/A/S/D/Space/Ctrl and/or Mouse';
  if (mouseDebugLine) {
    if (!uiState.pointerLocked) {
      mouseDebugLine.textContent = `Mouse: (not captured) | Keyboard: ${uiState.keyboardIdle ? 'Idle' : 'Active'} | Gamepad: ${uiState.gamepadIdle ? 'Idle' : 'Active'}`;
    } else {
      const mx = Math.round(uiState.aimX * RETICLE_OFFSET_PX);
      const my = Math.round(uiState.aimY * RETICLE_OFFSET_PX);
      const centered = uiState.mouseShipCentered ? ` centered (${mouseCenteredHoldTime.toFixed(1)}s)` : '';
      mouseDebugLine.textContent = `Mouse: X${mx >= 0 ? '+' : ''}${mx} Y${my >= 0 ? '+' : ''}${my}${centered} | Keyboard: ${uiState.keyboardIdle ? 'Idle' : 'Active'} | Gamepad: ${uiState.gamepadIdle ? 'Idle' : 'Active'}`;
    }
  }
  const aim = getClampedAim();
  reticleEl.style.transform = `translate(calc(-50% + ${aim.x * RETICLE_OFFSET_PX}px), calc(-50% + ${aim.y * RETICLE_OFFSET_PX}px))`;
  updateEnemyHudMarkers();
}

function ensureEnemyHudMarkers() {
  if (!enemyMarkersEl || enemyHudMarkers.length > 0) {
    return;
  }
  for (let i = 0; i < ENEMY_HUD_MARKER_COUNT; i += 1) {
    const marker = document.createElement('div');
    marker.className = 'enemyMarker';
    enemyMarkersEl.appendChild(marker);
    enemyHudMarkers.push(marker);
  }
}

function updateEnemyHudMarkers() {
  ensureEnemyHudMarkers();
  if (!enemyMarkersEl) {
    return;
  }

  if (!uiState.loaded || !state.ship || state.enemies.length === 0) {
    for (const marker of enemyHudMarkers) {
      marker.style.opacity = '0';
      marker.style.transform = 'translate(-9999px, -9999px)';
    }
    return;
  }

  const shipPos = state.ship.position;
  const candidates = state.enemies
    .map((enemy) => ({
      enemy,
      distance: enemy.position.distanceTo(shipPos)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, ENEMY_HUD_MARKER_COUNT);

  const width = window.innerWidth;
  const height = window.innerHeight;
  const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
  const markerClamp = 0.92;

  for (let i = 0; i < enemyHudMarkers.length; i += 1) {
    const marker = enemyHudMarkers[i];
    const candidate = candidates[i];
    if (!candidate) {
      marker.style.opacity = '0';
      marker.style.transform = 'translate(-9999px, -9999px)';
      continue;
    }

    const enemy = candidate.enemy;
    const toEnemy = tempVecA.copy(enemy.position).sub(camera.position);
    const camForward = tempVecB.set(0, 0, -1).applyQuaternion(camera.quaternion);
    const camRight = tempVecC.set(1, 0, 0).applyQuaternion(camera.quaternion);
    const camUp = tempVecD.set(0, 1, 0).applyQuaternion(camera.quaternion);

    let depth = toEnemy.dot(camForward);
    let side = toEnemy.dot(camRight);
    let vertical = toEnemy.dot(camUp);
    if (depth <= 0) {
      side = -side;
      vertical = -vertical;
      depth = Math.abs(depth);
    }

    const ndcX = (side / Math.max(depth, 1e-3)) / (tanHalfFov * camera.aspect);
    const ndcY = (vertical / Math.max(depth, 1e-3)) / tanHalfFov;
    const clampedX = THREE.MathUtils.clamp(ndcX, -markerClamp, markerClamp);
    const clampedY = THREE.MathUtils.clamp(ndcY, -markerClamp, markerClamp);
    const screenX = (clampedX * 0.5 + 0.5) * width;
    const screenY = (-clampedY * 0.5 + 0.5) * height;
    const visible = Math.abs(ndcX) <= markerClamp && Math.abs(ndcY) <= markerClamp && candidate.distance > 0;

    marker.style.opacity = visible ? '0.95' : '0.85';
    marker.style.transform = `translate(${screenX.toFixed(2)}px, ${screenY.toFixed(2)}px)`;
  }
}

function updateMouseLockButton() {
  if (!mouseLockButton) {
    return;
  }
  mouseLockButton.textContent = uiState.pointerLocked ? 'Unlock mouse' : 'Lock mouse';
}

function canRespawnAfterCrash() {
  if (!state.crashed) {
    return true;
  }
  return (state.crashTimer || 0) >= config.crashRespawnDelay;
}

function respawnShip() {
  if (!canRespawnAfterCrash()) {
    return;
  }
  const planet = sim.respawnShip();
  if (planet) {
    statusLine.textContent = `Flying near ${planet.name}`;
  }
}

function updateGameOverOverlay() {
  if (!gameOverOverlayEl || !gameOverTimerEl) {
    return;
  }

  const crashed = Boolean(state.crashed);
  gameOverOverlayEl.classList.toggle('is-visible', crashed);
  gameOverOverlayEl.setAttribute('aria-hidden', crashed ? 'false' : 'true');
  if (!crashed) {
    return;
  }

  const remaining = Math.max(0, config.crashRespawnDelay - (state.crashTimer || 0));
  gameOverTimerEl.textContent = remaining > 0
    ? `Restart available in ${remaining.toFixed(1)}s`
    : 'Press R or Start to restart';
}

function updateFuelMotes(dt, time) {
  for (const mote of state.fuelMotes) {
    updateFuelMote(mote, dt, time);
  }
}

async function loadPlanetVisual(planet, index) {
  let root;
  try {
    root = await loadGltf(withDotSlash(`${ASSET_ROOT}${planet.file}`));
  } catch (error) {
    console.warn(`Planet asset failed for ${planet.file}, using fallback.`, error);
    root = createFallbackPlanet(0x6277aa);
  }
  normalizeLoadedModel(root, planet.radius * 2);
  root.traverse((obj) => {
    if (obj.isMesh && obj.material) {
      obj.castShadow = false;
      obj.receiveShadow = false;
      if (Array.isArray(obj.material)) {
        obj.material.forEach((mat, matIndex) => {
          if (mat && mat.color) {
            mat.color.offsetHSL(planet.hueShift, 0, 0);
            mat.metalness = Math.min(1, (mat.metalness ?? 0.05) + index * 0.01);
            mat.roughness = Math.max(0.12, (mat.roughness ?? 0.8) - 0.05);
            mat.transparent = false;
            mat.opacity = 1;
            mat.alphaTest = 0;
            mat.depthWrite = true;
            mat.depthTest = true;
            mat.blending = THREE.NormalBlending;
          }
        });
      } else if (obj.material.color) {
        obj.material.color.offsetHSL(planet.hueShift, 0, 0);
        obj.material.transparent = false;
        obj.material.opacity = 1;
        obj.material.alphaTest = 0;
        obj.material.depthWrite = true;
        obj.material.depthTest = true;
        obj.material.blending = THREE.NormalBlending;
      }
    }
  });

  planet.root = new THREE.Group();
  planet.visual = new THREE.Group();
  planet.visual.add(root);
  planet.root.add(planet.visual);
  const glowMaterial = new THREE.SpriteMaterial({
    map: atmosphereGlowTexture,
    color: 0xffffff,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
    toneMapped: false
  });
  glowMaterial.color.offsetHSL(planet.hueShift * 0.2, 0, 0);
  planet.glow = new THREE.Sprite(glowMaterial);
  planet.glow.frustumCulled = false;
  planet.glow.renderOrder = -10;
  const glowDiameter = planet.radius * 2.9;
  planet.glow.scale.set(glowDiameter, glowDiameter, 1);
  planet.root.add(planet.glow);
  world.add(planet.root);

  for (let i = 0; i < planet.fuelMotes.length; i += 1) {
    const mote = planet.fuelMotes[i];
    mote.visual = createFuelMoteVisual(mote, i);
    planet.root.add(mote.visual);
  }

  planet.root.position.copy(planet.position);
  updatePlanetVisual(planet, 0, 0);
}

async function loadShipVisual() {
  let root;
  try {
    root = await loadGltf(PLAYER_FILE);
  } catch (error) {
    console.warn('Player ship asset failed, using fallback.', error);
    root = createFallbackShip();
  }
  normalizeLoadedModel(root, 3.0);
  const ship = state.ship;
  const display = createShipDisplay(root);
  world.add(display.root);
  ship.root = display.root;
  ship.visual = display.visual;
  ship.modelPivot = display.modelPivot;
  ship.model = display.model;
  ship.engineEffects = createShipEngineEffects(root);
  ship.root.position.copy(ship.position);
  ship.muzzleOffset = config.shipMuzzleOffset;
  const localUp = ship.boundPlanet
    ? ship.position.clone().sub(ship.boundPlanet.position).normalize()
    : new THREE.Vector3(0, 1, 0);
  ship.root.quaternion.copy(quatFromForwardUp(ship.forward, localUp));
  ship.visual.rotation.z = 0;
}

async function loadEnemyFamilyVisual(familyKey) {
  const familyFiles = ENEMY_MODEL_FILES_BY_FAMILY[familyKey] || ENEMY_MODEL_FILES_BY_FAMILY[ENEMY_FAMILY_KEYS[0]] || [];
  const familyTemplates = new Map();
  for (const assetFile of familyFiles) {
    let root;
    try {
      root = await loadGltf(withDotSlash(`${ASSET_ROOT}${assetFile}`));
    } catch (error) {
      console.warn(`Enemy ship asset failed for ${familyKey}/${assetFile}, using fallback.`, error);
      root = createFallbackShip();
    }
    normalizeLoadedModel(root, 3.0);
    familyTemplates.set(assetFile, root);
  }
  enemyFamilyTemplates.set(familyKey, familyTemplates);
}

function getEnemyFallbackAssetFile(familyKey) {
  const familyFiles = ENEMY_MODEL_FILES_BY_FAMILY[familyKey] || ENEMY_MODEL_FILES_BY_FAMILY[ENEMY_FAMILY_KEYS[0]] || [];
  return familyFiles[0] || ENEMY_MODEL_FILES[0] || '';
}

function ensureEnemyVisual(enemy) {
  let display = enemyVisuals.get(enemy.id);
  if (display) {
    return display;
  }

  const familyTemplates = enemyFamilyTemplates.get(enemy.family) || enemyFamilyTemplates.get(ENEMY_FAMILY_KEYS[0]);
  const assetFile = enemy.assetFile || getEnemyFallbackAssetFile(enemy.family);
  const template = familyTemplates
    ? familyTemplates.get(assetFile)
      || familyTemplates.get(getEnemyFallbackAssetFile(enemy.family))
      || familyTemplates.values().next().value
    : null;
  const model = template ? template.clone(true) : createFallbackShip();
  display = createShipDisplay(model);
  display.root.renderOrder = 20;
  display.root.frustumCulled = false;
  display.visual.frustumCulled = false;
  world.add(display.root);
  enemyVisuals.set(enemy.id, display);
  enemy.root = display.root;
  enemy.visual = display.visual;
  enemy.modelPivot = display.modelPivot;
  enemy.model = display.model;
  return display;
}

function getEnemyVisualScale(enemy) {
  return Math.max(0.01, enemy?.visualScale || 1);
}

function updateEnemyVisuals() {
  const seen = new Set();
  for (const enemy of state.enemies) {
    const display = ensureEnemyVisual(enemy);
    display.root.scale.setScalar(getEnemyVisualScale(enemy));
    updateShipDisplayTransform(display, enemy.position, enemy.forward, enemy.up, enemy.bank);
    seen.add(enemy.id);
  }

  for (const [id, display] of enemyVisuals.entries()) {
    if (seen.has(id)) {
      continue;
    }
    world.remove(display.root);
    enemyVisuals.delete(id);
  }
}

async function bootstrap() {
  loadingText.textContent = 'Choosing planets...';
  sim.bootstrapWorld();
  uiState.loaded = false;
  makeStarfield();

  const planetConfigs = state.planets;

  const totalLoads = 2 + ENEMY_MODEL_FILES.length + planetConfigs.length;
  let completedLoads = 0;
  const reportProgress = (label, increment = 1) => {
    completedLoads += increment;
    const pct = Math.round((completedLoads / totalLoads) * 100);
    loadingBarInner.style.width = `${pct}%`;
    loadingText.textContent = label;
  };

  loadingText.textContent = 'Loading star...';
  await loadStarVisual();
  reportProgress('Star loaded');

  loadingText.textContent = 'Loading ship...';
  await loadShipVisual();
  reportProgress('Ship loaded');

  for (const familyKey of ENEMY_FAMILY_KEYS) {
    const familyFiles = ENEMY_MODEL_FILES_BY_FAMILY[familyKey] || [];
    loadingText.textContent = `Loading ${familyKey} enemies...`;
    await loadEnemyFamilyVisual(familyKey);
    reportProgress(`Loaded ${familyKey} enemies`, familyFiles.length || 1);
  }

  await Promise.all(planetConfigs.map(async (planet, i) => {
    loadingText.textContent = `Loading ${planet.name}...`;
    await loadPlanetVisual(planet, i);
    reportProgress(`Loaded ${planet.name}`);
  }));

  for (const planet of state.planets) {
    planet.visual.rotation.set(0, 0, 0);
  }

  respawnShip();
  spaceDebrisAnchor.copy(state.ship.position);
  initSpaceDebris();

  loadingText.textContent = 'Ready';
  loadingWrap.style.display = 'none';
  lastProjectileIdForSfx = state.nextProjectileId || 0;
  lastEnemyExplosionIdForSfx = state.nextEnemyExplosionId || 0;
  uiState.loaded = true;
  updateTitleOverlay();
  statusLine.textContent = 'Press Fire or Boost to start.';
  updateMouseLockButton();
}

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function handlePointerMove(event) {
  if (event.pointerType === 'touch') {
    if (uiState.touchPointerId === event.pointerId) {
      setAimFromScreenPoint(event.clientX, event.clientY);
    }
    return;
  }
  if (!uiState.pointerLocked) {
    return;
  }
  applyMouseAimDelta(event.movementX * MOUSE_AIM_SENSITIVITY, event.movementY * MOUSE_AIM_SENSITIVITY);
}

function handlePointerLockChange() {
  uiState.pointerLocked = document.pointerLockElement === renderer.domElement;
  updateMouseLockButton();
  if (!uiState.pointerLocked) {
    uiState.mouseFireHeld = false;
    uiState.mouseBoostHeld = false;
    statusLine.textContent = state.crashed
      ? 'Crashed. Press R or Start to restart.'
      : 'Keyboard/gamepad ready. Click the canvas to capture the mouse.';
  }
}

function handleCanvasContextMenu(event) {
  event.preventDefault();
}

function handleKeyDown(event) {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyR', 'KeyL', 'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight'].includes(event.code)) {
    event.preventDefault();
  }
  if (!uiState.gameStarted && uiState.loaded && (event.code === 'Space' || event.code === 'ControlLeft' || event.code === 'ControlRight')) {
    startGame();
    return;
  }
  resumeOrbitalsAudio();
  keys.add(event.code);
  if (event.code === 'KeyR') {
    respawnShip();
  }
  if (event.code === 'KeyL') {
    toggleMouseLock();
  }
}

function handleKeyUp(event) {
  keys.delete(event.code);
}

function toggleMouseLock() {
  resumeOrbitalsAudio();
  if (document.pointerLockElement === renderer.domElement) {
    document.exitPointerLock?.();
    return;
  }
  renderer.domElement.requestPointerLock?.();
}

if (mouseLockButton) {
  mouseLockButton.addEventListener('click', () => {
    resumeOrbitalsAudio();
    toggleMouseLock();
  });
}

renderer.domElement.addEventListener('pointerdown', handleCanvasPointerDown);
renderer.domElement.addEventListener('pointerup', handleCanvasPointerUp);
renderer.domElement.addEventListener('pointercancel', handleCanvasPointerCancel);
renderer.domElement.addEventListener('contextmenu', handleCanvasContextMenu);
document.addEventListener('pointermove', handlePointerMove);
document.addEventListener('pointerlockchange', handlePointerLockChange);
window.addEventListener('blur', handleWindowBlur);
window.addEventListener('resize', handleResize);
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
window.addEventListener('pointerdown', handleGlobalPointerDown, { capture: true });
window.addEventListener('mousedown', resumeOrbitalsAudio, { capture: true });
window.addEventListener('touchstart', resumeOrbitalsAudio, { capture: true, passive: true });
window.addEventListener('click', resumeOrbitalsAudio, { capture: true });

function updatePlanets(dt, time) {
  for (const planet of state.planets) {
    updatePlanetVisual(planet, dt, time);
  }
}

function render() {
  const dt = Math.min(clock.getDelta(), 0.05);

  if (uiState.loaded && state.ship) {
    if (!uiState.gameStarted) {
      maybeStartFromGamepad();
      updatePlanets(dt, clock.elapsedTime);
      updateStarCorona(clock.elapsedTime);
    } else {
      updateShipControls(dt);
      updatePlanets(dt, clock.elapsedTime);
      updateFuelMotes(dt, clock.elapsedTime);
      updateProjectileVisuals();
      updateEnemyVisuals();
      updateEnemyExplosionVisuals();
      updateSpaceDebris(dt);
      updateStarCorona(clock.elapsedTime);
      const localUp = state.nearestPlanet && state.ship
        ? state.ship.position.clone().sub(state.nearestPlanet.position).normalize()
        : null;
      if (localUp) {
        updateShipOrientation(dt, localUp);
      }
      if (state.ship && state.ship.root) {
        state.ship.root.visible = !state.crashed;
      }
      updateShipEngineEffects(clock.elapsedTime);
      updateCamera(dt);
      updateHud();
      updateGameOverOverlay();
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

bootstrap().catch((error) => {
  console.error(error);
  loadingText.textContent = 'Failed to load Orbital Core.';
  statusLine.textContent = 'Load error. Check console.';
});

render();
