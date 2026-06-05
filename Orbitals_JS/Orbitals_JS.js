import * as THREE from './lib/three.module.js';
import { GLTFLoader } from './lib/loaders/GLTFLoader.js';
import { createOrbitalsSim } from './Orbitals_Sim.js';
import { PLANET_FILES, config } from './orbitals_config.js';

const ASSET_ROOT = './assets/';
const PLAYER_FILE = `${ASSET_ROOT}player_spaceship.glb`;
const STAR_FILE = `${ASSET_ROOT}star_map_1.glb`;

const app = document.getElementById('app');
const loadingWrap = document.getElementById('loadingWrap');
const loadingText = document.getElementById('loadingText');
const loadingBarInner = document.getElementById('loadingBarInner');
const seedLine = document.getElementById('seedLine');
const statusLine = document.getElementById('status');
const statsLine = document.getElementById('stats');
const mouseLockButton = document.getElementById('mouseLockButton');
const reticleEl = document.getElementById('reticle');

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
  depthTest: false
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
const worldUp = new THREE.Vector3(0, 1, 0);
const RETICLE_OFFSET_PX = 170;

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
            mat.emissiveIntensity = 8;
          }
          mat.toneMapped = false;
        });
      } else {
        if (obj.material.color) {
          obj.material.color.set(0xfff3c4);
        }
        if ('emissive' in obj.material) {
          obj.material.emissive = new THREE.Color(0xffe2a0);
          obj.material.emissiveIntensity = 8;
        }
        obj.material.toneMapped = false;
      }
    }
  });
  starRoot.add(root);
  starRoot.position.set(0, 0, 0);
  starLight.intensity = 18000;
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
  mesh.material.userData.fadeInDuration = 0.2;
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
  const bankedUp = tempVecA.copy(ship.up);
  if (Math.abs(ship.bank) > 1e-4) {
    bankedUp.applyAxisAngle(ship.forward, ship.bank).normalize();
  }
  const targetQuat = quatFromForwardUp(ship.forward, bankedUp);
  ship.root.quaternion.copy(targetQuat);
  ship.root.position.copy(ship.position);
  ship.visual.rotation.z = 0;
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
  const mode = state.crashed
    ? 'CRASHED'
    : (state.pointerLocked ? 'Mouse locked' : (state.gamepadConnected ? 'Gamepad ready' : 'Keyboard ready'));
  statusLine.textContent = nearest
    ? `${mode} | ${nearest.name}`
    : `${mode} | No planet in range`;
  statsLine.textContent = `Fuel: ${fuel.toFixed(1)} | Speed: ${speed.toFixed(1)} | Altitude: ${alt.toFixed(1)}`;
  const aim = getClampedAim();
  reticleEl.style.transform = `translate(calc(-50% + ${aim.x * RETICLE_OFFSET_PX}px), calc(-50% + ${aim.y * RETICLE_OFFSET_PX}px))`;
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
          }
        });
      } else if (obj.material.color) {
        obj.material.color.offsetHSL(planet.hueShift, 0, 0);
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
  const shipRoot = new THREE.Group();
  const visual = new THREE.Group();
  const modelPivot = new THREE.Group();
  modelPivot.rotation.y = Math.PI;
  modelPivot.add(root);
  visual.add(modelPivot);
  shipRoot.add(visual);
  world.add(shipRoot);
  ship.root = shipRoot;
  ship.visual = visual;
  ship.modelPivot = modelPivot;
  ship.model = root;
  ship.root.position.copy(ship.position);
  ship.muzzleOffset = config.shipMuzzleOffset;
  const localUp = ship.boundPlanet
    ? ship.position.clone().sub(ship.boundPlanet.position).normalize()
    : new THREE.Vector3(0, 1, 0);
  ship.root.quaternion.copy(quatFromForwardUp(ship.forward, localUp));
  ship.visual.rotation.z = 0;
}

async function bootstrap() {
  loadingText.textContent = 'Choosing planets...';
  sim.bootstrapWorld();
  state.loaded = false;
  makeStarfield();

  const planetConfigs = state.planets;

  const totalLoads = 2 + planetConfigs.length;
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
    updateSpaceDebris(dt);
    const localUp = state.nearestPlanet && state.ship
      ? state.ship.position.clone().sub(state.nearestPlanet.position).normalize()
      : null;
    if (localUp) {
      updateShipOrientation(dt, localUp);
    }
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
