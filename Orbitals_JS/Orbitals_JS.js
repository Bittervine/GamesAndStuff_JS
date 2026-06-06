import * as THREE from './lib/three.module.js';
import { GLTFLoader } from './lib/loaders/GLTFLoader.js';
import { createOrbitalsSim } from './Orbitals_Sim.js';
import { PLANET_FILES, config } from './orbitals_config.js';

const ASSET_ROOT = './assets/';
const PLAYER_FILE = `${ASSET_ROOT}player_spaceship.glb`;
const STAR_FILE = `${ASSET_ROOT}star_,map_1.glb`;
const ENEMY_FAMILY_FILES = {
  Standard: 'Ship_Standard_1.glb',
  Crosspanel: 'Ship_Crosspanel_1.glb',
  FlyingSaucer: 'Ship_FlyingSaucer_298877.glb',
  DeltaWing: 'Ship_DeltaWing_108179.glb',
  Pirate: 'Ship_Pirate_1.glb',
  Orca: 'Ship_Orca_135963.glb',
  Longwing: 'Ship_Longwing_1.glb',
  TwoHoop: 'Ship_TwoHoop_11695.glb',
  TigerWing: 'Ship_TigerWing_1.glb',
  LunarCourier: 'Ship_LunarCourier_153144.glb',
  Hooper: 'Ship_Hooper_219385.glb',
  ManraRay: 'Ship_ManraRay_130405.glb',
  PyramidLifter: 'Ship_PyramidLifter_290115.glb',
  Nemesis: 'ship_nemesis2.glb'
};
const ENEMY_FAMILY_KEYS = Object.keys(ENEMY_FAMILY_FILES);

const app = document.getElementById('app');
const loadingWrap = document.getElementById('loadingWrap');
const loadingText = document.getElementById('loadingText');
const loadingBarInner = document.getElementById('loadingBarInner');
const seedLine = document.getElementById('seedLine');
const statusLine = document.getElementById('status');
const statsLine = document.getElementById('stats');
const mouseLockButton = document.getElementById('mouseLockButton');
const reticleEl = document.getElementById('reticle');
const enemyMarkersEl = document.getElementById('enemyMarkers');

const params = new URLSearchParams(window.location.search);
const seed = parseSeed(params.get('seed'));
seedLine.textContent = `Seed: ${seed}`;

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
state.aimX = 0;
state.aimY = 0;
state.pointerLocked = false;
state.gamepadConnected = false;
state.mouseFireHeld = false;
const projectileVisuals = new Map();
const enemyVisuals = new Map();
const enemyFamilyTemplates = new Map();
const enemyHudMarkers = [];
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
const stateLabelCanvas = document.createElement('canvas');
stateLabelCanvas.width = 512;
stateLabelCanvas.height = 128;
const stateLabelCtx = stateLabelCanvas.getContext('2d');
const stateLabelTexture = new THREE.CanvasTexture(stateLabelCanvas);
stateLabelTexture.colorSpace = THREE.SRGBColorSpace;
stateLabelTexture.needsUpdate = true;
const stateLabelMaterial = new THREE.SpriteMaterial({
  map: stateLabelTexture,
  transparent: true,
  depthWrite: false,
  depthTest: false
});
const stateLabelSprite = new THREE.Sprite(stateLabelMaterial);
stateLabelSprite.visible = false;
stateLabelSprite.renderOrder = 1000;
stateLabelSprite.scale.set(1200, 300, 1);
scene.add(stateLabelSprite);
let stateLabelText = '';
const starRoot = new THREE.Group();
scene.add(starRoot);
const starCoronaGroup = new THREE.Group();
starCoronaGroup.renderOrder = -30;
starRoot.add(starCoronaGroup);
const starCoronaLayers = [];
const starInnerLightGroup = new THREE.Group();
starInnerLightGroup.renderOrder = -20;
starRoot.add(starInnerLightGroup);
const starInnerLights = [];

const starLight = new THREE.PointLight(0xfff2c6, 12000, 0, 2);
starLight.position.set(0, 0, 0);
scene.add(starLight);

window.__orbitals = {
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
const ENEMY_HUD_MARKER_COUNT = 5;

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

function withDotSlash(file) {
  return file.startsWith('./') ? file : `./${file}`;
}

function getClampedAim() {
  const aimX = state.aimX;
  const aimY = state.aimY;
  const magnitude = Math.hypot(aimX, aimY);
  if (magnitude > 1) {
    return { x: aimX / magnitude, y: aimY / magnitude };
  }
  return { x: aimX, y: aimY };
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
  const brake = Boolean((buttons[6] && buttons[6].pressed) || (buttons[4] && buttons[4].pressed));
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
function createSunCoronaTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size * 0.5;
  const cy = size * 0.5;
  ctx.clearRect(0, 0, size, size);

  const gradient = ctx.createRadialGradient(cx, cy, size * 0.01, cx, cy, size * 0.5);
  gradient.addColorStop(0.00, 'rgba(255,255,255,1.00)');
  gradient.addColorStop(0.08, 'rgba(255,255,245,0.96)');
  gradient.addColorStop(0.18, 'rgba(255,240,180,0.82)');
  gradient.addColorStop(0.34, 'rgba(255,200,110,0.42)');
  gradient.addColorStop(0.58, 'rgba(255,158,64,0.16)');
  gradient.addColorStop(0.84, 'rgba(255,130,40,0.05)');
  gradient.addColorStop(1.00, 'rgba(255,130,40,0.00)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(255, 210, 120, 0.20)';
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(255, 190, 90, 0.45)';
  ctx.shadowBlur = size * 0.03;
  const rays = 20;
  for (let i = 0; i < rays; i += 1) {
    const angle = (i / rays) * Math.PI * 2;
    const inner = size * (0.12 + (i % 3) * 0.01);
    const outer = size * (0.34 + (i % 4) * 0.05);
    const x0 = cx + Math.cos(angle) * inner;
    const y0 = cy + Math.sin(angle) * inner;
    const x1 = cx + Math.cos(angle) * outer;
    const y1 = cy + Math.sin(angle) * outer;
    ctx.lineWidth = 1 + (i % 5) * 0.55;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255, 185, 90, 0.13)';
  ctx.shadowColor = 'rgba(255, 160, 70, 0.28)';
  ctx.shadowBlur = size * 0.02;
  const shortRays = 28;
  for (let i = 0; i < shortRays; i += 1) {
    const angle = (i / shortRays) * Math.PI * 2 + (Math.PI / shortRays) * 0.5;
    const inner = size * (0.09 + (i % 2) * 0.007);
    const outer = size * (0.23 + (i % 4) * 0.028);
    const x0 = cx + Math.cos(angle) * inner;
    const y0 = cy + Math.sin(angle) * inner;
    const x1 = cx + Math.cos(angle) * outer;
    const y1 = cy + Math.sin(angle) * outer;
    ctx.lineWidth = 0.8 + (i % 4) * 0.35;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
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

const sunCoronaTexture = createSunCoronaTexture();
const engineFlameTexture = createEngineFlameTexture();
const engineSparkTexture = createEngineSparkTexture();
const projectileGeometry = new THREE.SphereGeometry(1, 10, 8);
const projectileMaterial = new THREE.MeshBasicMaterial({
  color: 0x62ff6f,
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

function addStarInnerLight(baseScale, opacity, color, radius, speed, phase, stretchY = 1) {
  const material = new THREE.SpriteMaterial({
    map: atmosphereGlowTexture,
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    toneMapped: false
  });
  const sprite = new THREE.Sprite(material);
  sprite.frustumCulled = false;
  sprite.renderOrder = -18;
  sprite.scale.set(baseScale, baseScale * stretchY, 1);
  starInnerLightGroup.add(sprite);
  starInnerLights.push({
    sprite,
    baseScale,
    baseOpacity: opacity,
    color,
    radius,
    speed,
    phase,
    stretchY
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

  while (starInnerLightGroup.children.length > 0) {
    starInnerLightGroup.remove(starInnerLightGroup.children[0]);
  }
  starInnerLights.length = 0;
  addStarInnerLight(config.starScale * 0.22, 0.42, 0xfffded, config.starScale * 0.16, 0.95, 0.0, 1.0);
  addStarInnerLight(config.starScale * 0.19, 0.30, 0xfff0bc, config.starScale * 0.17, 1.25, 1.1, 0.9);
  addStarInnerLight(config.starScale * 0.16, 0.20, 0xffd48b, config.starScale * 0.18, 1.55, 2.2, 1.1);
  addStarInnerLight(config.starScale * 0.14, 0.14, 0xffb963, config.starScale * 0.19, 1.92, 3.4, 0.85);
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
  if (starInnerLights.length > 0) {
    const toCamera = tempVecA.copy(camera.position);
    if (toCamera.lengthSq() < 1e-6) {
      toCamera.set(0, 0, 1);
    } else {
      toCamera.normalize();
    }
    const right = Math.abs(toCamera.dot(worldUp)) > 0.92
      ? tempVecB.set(1, 0, 0).cross(toCamera).normalize()
      : tempVecB.copy(worldUp).cross(toCamera).normalize();
    const up = tempVecC.copy(toCamera).cross(right).normalize();
    const discDepth = config.starScale * 0.5 * 0.985;
    const rimRadius = config.starScale * 0.18;
    for (const light of starInnerLights) {
      const angle = time * light.speed + light.phase;
      const ringX = Math.cos(angle) * light.radius;
      const ringY = Math.sin(angle) * light.radius * 0.82;
      light.sprite.position
        .copy(toCamera).multiplyScalar(discDepth)
        .addScaledVector(right, ringX)
        .addScaledVector(up, ringY);
      const travel = 0.7 + 0.3 * Math.sin(time * (1.4 + light.speed) + light.phase * 1.7);
      light.sprite.scale.set(
        light.baseScale * travel,
        light.baseScale * light.stretchY * (0.85 + 0.15 * travel),
        1
      );
      light.sprite.material.opacity = light.baseOpacity * (0.55 + 0.45 * travel);
      light.sprite.material.color.offsetHSL(0.0, 0.0, Math.sin(time * 0.8 + light.phase) * 0.02);
    }
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

function computeFireDirectionFromReticle() {
  const viewport = renderer.domElement.getBoundingClientRect();
  const halfWidth = Math.max(1, viewport.width * 0.5);
  const halfHeight = Math.max(1, viewport.height * 0.5);
  const ndcX = (state.aimX * RETICLE_OFFSET_PX) / halfWidth;
  const ndcY = -(state.aimY * RETICLE_OFFSET_PX) / halfHeight;
  const near = tempVecA.set(ndcX, ndcY, -1).unproject(camera);
  const far = tempVecB.set(ndcX, ndcY, 1).unproject(camera);
  return tempVecD.copy(far).sub(near).normalize();
}

function handleCanvasPointerDown(event) {
  if (event.button !== 0) {
    return;
  }
  state.mouseFireHeld = true;
  renderer.domElement.setPointerCapture?.(event.pointerId);
  event.preventDefault();
}

function handleCanvasPointerUp(event) {
  if (event.button !== 0) {
    return;
  }
  state.mouseFireHeld = false;
  renderer.domElement.releasePointerCapture?.(event.pointerId);
}

function handleCanvasPointerCancel(event) {
  state.mouseFireHeld = false;
  renderer.domElement.releasePointerCapture?.(event.pointerId);
}

function handleWindowBlur() {
  state.mouseFireHeld = false;
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
  state.gamepadConnected = gamepad.connected;
  state.aimX = THREE.MathUtils.lerp(state.aimX, 0, easeExp(dt, 2.2));
  state.aimY = THREE.MathUtils.lerp(state.aimY, 0, easeExp(dt, 2.2));
  if (gamepad.aimX !== 0 || gamepad.aimY !== 0) {
    state.aimX = gamepad.aimX;
    state.aimY = gamepad.aimY;
  }

  const keyboardTurn = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0)
    + (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0);
  const keyboardPitch = (keys.has('ArrowUp') ? 1 : 0) - (keys.has('ArrowDown') ? 1 : 0)
    + (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0);
  const fire = state.mouseFireHeld || gamepad.fire;
  const fireDirection = fire ? computeFireDirectionFromReticle() : null;

  sim.step(dt, {
    turnInput: THREE.MathUtils.clamp(keyboardTurn + gamepad.turnX, -1, 1),
    pitchInput: THREE.MathUtils.clamp(keyboardPitch + gamepad.pitchY, -1, 1),
    boost: keys.has('Space') || gamepad.boost,
    brake: keys.has('ShiftLeft') || keys.has('ShiftRight') || gamepad.brake,
    respawn: gamepad.respawn,
    fire,
    fireDirection
  });
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
  camera.up.copy(ship.up);
  const lookTarget = ship.position.clone()
    .addScaledVector(ship.forward, 10);
  camera.lookAt(lookTarget);
}

function updateHud() {
  const nearest = state.nearestPlanet;
  const alt = state.nearestAltitude;
  const speed = state.speed;
  const fuel = state.fuel;
  const shipMode = state.ship ? (state.ship.flightMode || (state.ship.boundPlanet ? 'bound' : 'free')) : 'none';
  const lock = state.ship ? (state.ship.recaptureLock || 0) : 0;
  const mode = state.crashed
    ? 'CRASHED'
    : (state.pointerLocked ? 'Mouse locked' : (state.gamepadConnected ? 'Gamepad ready' : 'Keyboard ready'));
  statusLine.textContent = nearest
    ? `${mode} | ${nearest.name} | ship:${shipMode} | lock:${lock.toFixed(1)}`
    : `${mode} | No planet in range | ship:${shipMode} | lock:${lock.toFixed(1)}`;
  statsLine.textContent = `Fuel: ${fuel.toFixed(1)} | Speed: ${speed.toFixed(1)} | Altitude: ${alt.toFixed(1)} | State: ${shipMode}`;
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

  if (!state.loaded || !state.ship || state.enemies.length === 0) {
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
  mouseLockButton.textContent = state.pointerLocked ? 'Unlock mouse' : 'Lock mouse';
}

function respawnShip() {
  const planet = sim.respawnShip();
  if (planet) {
    statusLine.textContent = `Flying near ${planet.name}`;
  }
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
  const assetFile = ENEMY_FAMILY_FILES[familyKey];
  let root;
  try {
    root = await loadGltf(assetFile);
  } catch (error) {
    console.warn(`Enemy ship asset failed for ${familyKey}, using fallback.`, error);
    root = createFallbackShip();
  }
  normalizeLoadedModel(root, 3.0);
  enemyFamilyTemplates.set(familyKey, root);
}

function ensureEnemyVisual(enemy) {
  let display = enemyVisuals.get(enemy.id);
  if (display) {
    return display;
  }

  const template = enemyFamilyTemplates.get(enemy.family) || enemyFamilyTemplates.get(ENEMY_FAMILY_KEYS[0]);
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

function updateEnemyVisuals() {
  const seen = new Set();
  for (const enemy of state.enemies) {
    const display = ensureEnemyVisual(enemy);
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
  state.loaded = false;
  makeStarfield();

  const planetConfigs = state.planets;

  const totalLoads = 2 + ENEMY_FAMILY_KEYS.length + planetConfigs.length;
  let completedLoads = 0;
  const reportProgress = (label) => {
    completedLoads += 1;
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
    loadingText.textContent = `Loading ${familyKey} enemies...`;
    await loadEnemyFamilyVisual(familyKey);
    reportProgress(`Loaded ${familyKey} enemies`);
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
  state.loaded = true;
  statusLine.textContent = 'Keyboard/gamepad ready. Lock mouse only if you want reticle control.';
  updateMouseLockButton();
}

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function handlePointerMove(event) {
  if (!state.pointerLocked) {
    return;
  }
  state.aimX = THREE.MathUtils.clamp(state.aimX + event.movementX * 0.0019, -1, 1);
  state.aimY = THREE.MathUtils.clamp(state.aimY + event.movementY * 0.0019, -1, 1);
  const magnitude = Math.hypot(state.aimX, state.aimY);
  if (magnitude > 1) {
    state.aimX /= magnitude;
    state.aimY /= magnitude;
  }
}

function handlePointerLockChange() {
  state.pointerLocked = document.pointerLockElement === renderer.domElement;
  updateMouseLockButton();
  if (!state.pointerLocked) {
    statusLine.textContent = state.crashed
      ? 'Crashed. Press R to respawn.'
      : 'Keyboard/gamepad ready. Lock mouse only if you want reticle control.';
  }
}

function handleKeyDown(event) {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyR', 'KeyL', 'ShiftLeft', 'ShiftRight'].includes(event.code)) {
    event.preventDefault();
  }
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
  if (document.pointerLockElement === renderer.domElement) {
    document.exitPointerLock?.();
    return;
  }
  renderer.domElement.requestPointerLock?.();
}

if (mouseLockButton) {
  mouseLockButton.addEventListener('click', () => {
    toggleMouseLock();
  });
}

renderer.domElement.addEventListener('pointerdown', handleCanvasPointerDown);
renderer.domElement.addEventListener('pointerup', handleCanvasPointerUp);
renderer.domElement.addEventListener('pointercancel', handleCanvasPointerCancel);
document.addEventListener('pointermove', handlePointerMove);
document.addEventListener('pointerlockchange', handlePointerLockChange);
window.addEventListener('blur', handleWindowBlur);
window.addEventListener('resize', handleResize);
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

function updatePlanets(dt, time) {
  for (const planet of state.planets) {
    updatePlanetVisual(planet, dt, time);
  }
}

function render() {
  const dt = Math.min(clock.getDelta(), 0.05);

  if (state.loaded && state.ship) {
    updateShipControls(dt);
    updatePlanets(dt, clock.elapsedTime);
    updateFuelMotes(dt, clock.elapsedTime);
    updateProjectileVisuals();
    updateEnemyVisuals();
    updateSpaceDebris(dt);
    updateStarCorona(clock.elapsedTime);
    const localUp = state.nearestPlanet && state.ship
      ? state.ship.position.clone().sub(state.nearestPlanet.position).normalize()
      : null;
    if (localUp) {
      updateShipOrientation(dt, localUp);
    }
    updateShipEngineEffects(clock.elapsedTime);
    updateCamera(dt);
    updateHud();
  }

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

bootstrap().catch((error) => {
  console.error(error);
  loadingText.textContent = 'Failed to load Orbitals.';
  statusLine.textContent = 'Load error. Check console.';
});

render();
