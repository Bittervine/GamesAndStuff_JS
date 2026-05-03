(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const PLANET_LAYER_FACTOR = 4;
  const CLOUD_LAYER_FACTOR = 16;
  const canvas = document.getElementById('game');
  const hudCanvas = document.getElementById('hud');
  const hudCtx = hudCanvas.getContext('2d');
  function getWebGLContext(targetCanvas) {
    if (!targetCanvas || !targetCanvas.getContext) return null;
    const attempts = [
      { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: 'high-performance' },
      { alpha: true, antialias: false, premultipliedAlpha: false },
      { alpha: true, antialias: true, premultipliedAlpha: false },
      { alpha: true, premultipliedAlpha: false },
      undefined
    ];
    for (let i = 0; i < attempts.length; i++) {
      const opts = attempts[i];
      try {
        const ctx = opts ? targetCanvas.getContext('webgl', opts) : targetCanvas.getContext('webgl');
        if (ctx) return ctx;
      } catch (err) {}
    }
    try {
      return targetCanvas.getContext('experimental-webgl', { alpha: true, antialias: false, premultipliedAlpha: false }) ||
        targetCanvas.getContext('experimental-webgl');
    } catch (err) {
      return null;
    }
  }
  const gl = getWebGLContext(canvas);
  const controlsEl = document.getElementById('controls');
  const titleManualButton = document.getElementById('titleManual');
  const hudHint = document.getElementById('hudHint');
  const settingsDialog = document.getElementById('settingsDialog');
  const settingsClose = document.getElementById('settingsClose');
  const sfxVolumeInput = document.getElementById('sfxVolume');
  const musicVolumeInput = document.getElementById('musicVolume');
  const sfxVolumeValue = document.getElementById('sfxVolumeValue');
  const musicVolumeValue = document.getElementById('musicVolumeValue');
  const difficultyValue = document.getElementById('difficultyValue');
  const difficultyButtons = Array.from(document.querySelectorAll('[data-difficulty]'));
  const lowEndModeInput = document.getElementById('lowEndMode');
  const alwaysFollowMouseInput = document.getElementById('alwaysFollowMouse');

  const view = { w: 0, h: 0, dpr: 1, controlsH: 118 };
  let currentDt = 0;
  const MAX_NORMAL_DPR = 1.5;
  const URL_PARAMS = new URLSearchParams(window.location.search || '');
  const DEBUG_MODE = URL_PARAMS.get('debug') === '1';
  const DEBUG_END_BOSS = URL_PARAMS.get('debug_endboss') === '1';
  const render = {
    ready: false,
    queue: [],
    spritePool: [],
    seq: 0,
    queueNeedsSort: false,
    lastQueuedLayer: 0,
    normal: [],
    additive: [],
    erase: [],
    batchData: null,
    hudSprites: new Map(),
    colorCache: new Map(),
    offsetX: 0,
    offsetY: 0,
    lastQueueLength: 0,
    lastBatchCount: 0,
    textures: new Map(),
    white: null,
    circle: null,
    program: null,
    buffer: null,
    aPos: null,
    aUv: null,
    aColor: null,
    uTex: null,
    uViewport: null,
    starProgram: null,
    starBuffer: null,
    starBufferCount: 0,
    starBufferData: null,
    starDirty: true,
    aStar0: null,
    aStar1: null,
    uStarViewport: null,
    uStarTime: null,
    uStarScroll: null,
    uStarDpr: null,
    starDisabled: false,
    planetLayer: { canvas: null, ctx: null, texture: null, dirty: true, width: 0, height: 0, scale: 1 },
    cloudLayer: { canvas: null, ctx: null, texture: null, dirty: true, width: 0, height: 0, scale: 1 }
  };
  const STARFIELD_TARGET_FPS = 50;
  const STARFIELD_RAISE_LIMIT = 1.5;
  const STARFIELD_FALL_LIMIT = 0.75;
  const STARFIELD_NORMAL_CAP = 700;
  const STARFIELD_LOW_END_CAP = 100;
  const STARFIELD_DEFAULT_CAP = 600;
  const DPS_FILTER_LAMBDA = 0.95;
  const PLAYER_SHIP_TEXTURE_KEY = 'player-ship';
  const PLAYER_AURA_TEXTURE_KEY = 'player-aura';
  const PLAYER_ENGINE_TEXTURE_PREFIX = 'player-engine-flame|';
  const PLAYER_DAMAGE_TEXTURE_PREFIX = 'player-damage|';
  let playerShipTextureLoading = false;
  let playerAuraTextureLoading = false;
  let playerShipSourceImage = null;
  function cp(code) {
    if (code <= 0xFFFF) return String.fromCharCode(code);
    code -= 0x10000;
    return String.fromCharCode(0xD800 + (code >> 10), 0xDC00 + (code & 0x3FF));
  }
  function vs(code) { return cp(code) + cp(0xFE0F); }
  const E = {
    plane: vs(0x2708),
    apple: cp(0x1F34E),
    pear: cp(0x1F350),
    cherry: cp(0x1F352),
    leaf: cp(0x1F342),
    bee: cp(0x1F41D),
    butterfly: cp(0x1F98B),
    ladybug: cp(0x1F41E),
    lollipop: cp(0x1F36D),
    donut: cp(0x1F369),
    cookie: cp(0x1F36A),
    chocolate: cp(0x1F36B),
    gear: vs(0x2699),
    battery: cp(0x1F50B),
    lantern: cp(0x1F3EE),
    ghost: cp(0x1F47B),
    crystal: cp(0x1F48E),
    fire: cp(0x1F525),
    moon: cp(0x1F319),
    star: cp(0x2B50),
    sun: vs(0x2600),
    crown: cp(0x1F451),
    cloud: vs(0x2601),
    rain: cp(0x1F4A7),
    bolt: cp(0x26A1),
    rocket: cp(0x1F680),
    bomb: cp(0x1F4A3),
    shield: vs(0x1F6E1),
    magnet: cp(0x1F9F2),
    wrench: cp(0x1F527),
    sparkles: cp(0x2728),
    gem: cp(0x1FA99),
    seed: cp(0x1F33F),
    honey: cp(0x1F36F),
    pepper: cp(0x1F336),
    disc: cp(0x1F7E1),
    target: cp(0x1F3AF),
    comet: cp(0x2604),
    pawn: cp(0x265F),
    knight: cp(0x265E),
    bishop: cp(0x265D),
    rook: cp(0x265C),
    queen: cp(0x265B),
    king: cp(0x265A)
  };

  const EMOJI_FONT = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  const titleArt = new Image();
  let titleArtReady = false;
  titleArt.decoding = 'async';
  titleArt.onload = function () { titleArtReady = true; };
  titleArt.onerror = function () { titleArtReady = false; };
  titleArt.src = 'assets/Thorium_Gap_title.png';
  const glowImages = new Map();
  const glowImageLoads = new Set();
  const ENEMY_SHIP_COLUMNS = 7;
  const ENEMY_SHIP_FALLBACK_BATCHES = 10;
  const ENEMY_SHIP_VARIANT = 'a';
  const ENEMY_SHIP_MIN_SIZE = 64;
  const ENEMY_SHIP_MAX_SIZE = 108;
  const ENEMY_ELITE_SIZE = 128;
  const ENEMY_SHIP_TEXTURE_SIZE = 256;
  const ENEMY_SHIP_GLOW_SCALE = 1.01;
  const ENEMY_SHIP_GLOW_INTENSITY = 0.3;
  const ENEMY_SHIP_GLOW_BLUR = 20;
  const enemyShipLoadKeys = new Set();
  const enemyShipGlowLoadKeys = new Set();
  const enemyShipGlowTextures = new Map();
  const ENEMY_SHIP_GLOW_FALLBACKS = ['#8fd8ff', '#ff8fd3', '#d8ff8f', '#ffbf8f', '#9a8fff', '#8fffe1', '#ffe38f', '#9fc8ff'];
  // Enemy glow colors are cached here after load; debug mode may sample textures once, production uses a fallback palette.
  const enemyShipGlowColors = new Map();
  const bossArtLoadKeys = new Set();
  const bossGlowLoadKeys = new Set();
  const bossGlowTextures = new Map();
  const bossAlphaMasks = new Map();
  const bossPartLoadKeys = new Set();
  const bossPartTextures = new Map();
  const bossHitBoxes = new Map();
  const debugLabelTextures = new Map();

  function enemyShipKey(levelNumber, shipIndex) {
    return 'enemyship|' + levelNumber + '|' + shipIndex;
  }

  function enemyShipSource(levelNumber, shipIndex) {
    return 'assets/Enemy_' + String(levelNumber).padStart(3, '0') + String(shipIndex).padStart(2, '0') + ENEMY_SHIP_VARIANT + '.png';
  }

  function fallbackEnemyShipGlowColor(levelNumber, shipIndex) {
    const seed = hashString('enemyglow|' + levelNumber + '|' + shipIndex);
    return ENEMY_SHIP_GLOW_FALLBACKS[Math.abs(seed) % ENEMY_SHIP_GLOW_FALLBACKS.length];
  }

  function averageImageColor(img) {
    const canvas = document.createElement('canvas');
    const w = Math.max(1, img.naturalWidth || img.width || 1);
    const h = Math.max(1, img.naturalHeight || img.height || 1);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return '#8fd8ff';
    ctx.drawImage(img, 0, 0);
    const sampleStep = 4;
    const data = ctx.getImageData(0, 0, w, h).data;
    let vividRs = 0, vividGs = 0, vividBs = 0, vividTotalWeight = 0;
    let fallbackRs = 0, fallbackGs = 0, fallbackBs = 0, fallbackWeight = 0;
    for (let y = 0; y < h; y += sampleStep) {
      for (let x = 0; x < w; x += sampleStep) {
        const idx = (y * w + x) * 4;
        const a = data[idx + 3];
        if (a < 24) continue;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const nr = r / 255;
        const ng = g / 255;
        const nb = b / 255;
        const max = Math.max(nr, ng, nb);
        const min = Math.min(nr, ng, nb);
        const d = max - min;
        const sat = max <= 0 ? 0 : d / Math.max(0.0001, max);
        const value = max;
        const baseWeight = (0.2 + value * 0.8) * (0.12 + sat * 0.88) * (a / 255);
        fallbackRs += r * baseWeight;
        fallbackGs += g * baseWeight;
        fallbackBs += b * baseWeight;
        fallbackWeight += baseWeight;
        if (sat < 0.22 || value < 0.2) continue;
        const pixelWeight = baseWeight * (0.65 + sat * 0.9) * (0.5 + value * 0.5);
        vividRs += r * pixelWeight;
        vividGs += g * pixelWeight;
        vividBs += b * pixelWeight;
        vividTotalWeight += pixelWeight;
      }
    }
    if (vividTotalWeight > 0.0001) {
      const vivid = projectToRgbRim([
        Math.round(vividRs / vividTotalWeight),
        Math.round(vividGs / vividTotalWeight),
        Math.round(vividBs / vividTotalWeight)
      ]);
      return '#' + vivid.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
    }
    if (!fallbackWeight) return '#8fd8ff';
    const rim = projectToRgbRim([
      Math.round(fallbackRs / fallbackWeight),
      Math.round(fallbackGs / fallbackWeight),
      Math.round(fallbackBs / fallbackWeight)
    ]);
    return '#' + rim.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  }

  function projectToRgbRim(rgb) {
    const r = Array.isArray(rgb) ? (rgb[0] || 0) : 0;
    const g = Array.isArray(rgb) ? (rgb[1] || 0) : 0;
    const b = Array.isArray(rgb) ? (rgb[2] || 0) : 0;
    const m = Math.min(r, g, b);
    const rr = r - m;
    const gg = g - m;
    const bb = b - m;
    const max = Math.max(rr, gg, bb);
    if (max <= 0) return [255, 0, 0];
    const k = 255 / max;
    return [Math.round(rr * k), Math.round(gg * k), Math.round(bb * k)];
  }

  function hslToHex(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hp = ((h % 360) + 360) % 360 / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let r = 0, g = 0, b = 0;
    if (hp < 1) { r = c; g = x; }
    else if (hp < 2) { r = x; g = c; }
    else if (hp < 3) { g = c; b = x; }
    else if (hp < 4) { g = x; b = c; }
    else if (hp < 5) { r = x; b = c; }
    else { r = c; b = x; }
    const m = l - c / 2;
    return '#' + [r + m, g + m, b + m].map(v => Math.round(clamp(v * 255, 0, 255)).toString(16).padStart(2, '0')).join('');
  }

  function hsvToHex(h, s, v) {
    const hp = ((h % 360) + 360) % 360 / 60;
    const c = v * s;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let r = 0, g = 0, b = 0;
    if (hp < 1) { r = c; g = x; }
    else if (hp < 2) { r = x; g = c; }
    else if (hp < 3) { g = c; b = x; }
    else if (hp < 4) { g = x; b = c; }
    else if (hp < 5) { r = x; b = c; }
    else { r = c; b = x; }
    const m = v - c;
    return '#' + [r + m, g + m, b + m].map(vv => Math.round(clamp(vv * 255, 0, 255)).toString(16).padStart(2, '0')).join('');
  }

  function makeNormalizedEnemyCanvas(img, size) {
    size = Math.max(1, size || ENEMY_SHIP_TEXTURE_SIZE);
    const c = makeCanvas(size, size);
    const g = c.getContext('2d');
    if (!g) return null;
    g.clearRect(0, 0, size, size);
    const srcW = Math.max(1, img.naturalWidth || img.width || size);
    const srcH = Math.max(1, img.naturalHeight || img.height || size);
    const scale = Math.min(size / srcW, size / srcH);
    const drawW = srcW * scale;
    const drawH = srcH * scale;
    const dx = (size - drawW) * 0.5;
    const dy = (size - drawH) * 0.5;
    g.drawImage(img, dx, dy, drawW, drawH);
    return c;
  }

  function makeEnemyGlowCanvas(normalized, glowColor, size, keepFullBounds) {
    size = Math.max(1, size || ENEMY_SHIP_TEXTURE_SIZE);
    const total = size;
    const c = makeCanvas(total, total);
    const g = c.getContext('2d', { willReadFrequently: true }) || c.getContext('2d');
    if (!g) return null;
    const src = makeCanvas(total, total);
    const sg = src.getContext('2d');
    if (!sg) return null;
    sg.clearRect(0, 0, total, total);
    const glowW = size * ENEMY_SHIP_GLOW_SCALE;
    const glowH = size * ENEMY_SHIP_GLOW_SCALE;
    const glowDX = (total - glowW) * 0.5;
    const glowDY = (total - glowH) * 0.5;
    sg.drawImage(normalized, glowDX, glowDY, glowW, glowH);
    g.clearRect(0, 0, total, total);
    if (g.filter !== undefined) g.filter = 'blur(' + ENEMY_SHIP_GLOW_BLUR + 'px)';
    g.drawImage(src, 0, 0);
    if (g.filter !== undefined) g.filter = 'none';
    const imgData = g.getImageData(0, 0, total, total);
    const data = imgData.data;
    const rgb = hexToRgb(glowColor || '#ffffff');
    for (let y = 0; y < total; y++) {
      for (let x = 0; x < total; x++) {
        const idx = (y * total + x) * 4;
        const a = data[idx + 3];
        if (a <= 0) continue;
        data[idx] = rgb[0];
        data[idx + 1] = rgb[1];
        data[idx + 2] = rgb[2];
        data[idx + 3] = Math.round(Math.min(255, a * ENEMY_SHIP_GLOW_INTENSITY));
      }
    }
    g.putImageData(imgData, 0, 0);
    if (keepFullBounds) return c;
    const bounds = getCanvasAlphaBounds(c);
    if (bounds.w <= 0 || bounds.h <= 0) return c;
    if (bounds.x === 0 && bounds.y === 0 && bounds.w === total && bounds.h === total) return c;
    const cropped = makeCanvas(bounds.w, bounds.h);
    const cg = cropped.getContext('2d');
    if (!cg) return c;
    cg.drawImage(c, bounds.x, bounds.y, bounds.w, bounds.h, 0, 0, bounds.w, bounds.h);
    return cropped;
  }

  function ensureEnemyShipTexture(levelNumber, shipIndex) {
    const key = enemyShipKey(levelNumber, shipIndex);
    if (render.textures.has(key) || enemyShipLoadKeys.has(key)) return;
    enemyShipLoadKeys.add(key);
    const img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      try {
        const normalized = makeNormalizedEnemyCanvas(img, ENEMY_SHIP_TEXTURE_SIZE) || img;
        const glowColor = averageImageColor(img);
        enemyShipGlowColors.set(key, glowColor);
        const glowCanvas = makeEnemyGlowCanvas(normalized, glowColor, ENEMY_SHIP_TEXTURE_SIZE, true);
        if (glowCanvas) {
          const g = glowCanvas.getContext('2d');
          if (g) g.drawImage(normalized, 0, 0, ENEMY_SHIP_TEXTURE_SIZE, ENEMY_SHIP_TEXTURE_SIZE);
        }
        const tex = createTextureFromCanvas(glowCanvas || normalized);
        if (tex) render.textures.set(key, tex);
      } finally {
        enemyShipLoadKeys.delete(key);
      }
    };
    img.onerror = function () {
      enemyShipLoadKeys.delete(key);
    };
    img.src = enemyShipSource(levelNumber, shipIndex);
  }

  function ensureEnemyShipGlowTexture(levelNumber, shipIndex) {
    const key = enemyShipKey(levelNumber, shipIndex) + '|glow';
    if (render.textures.has(key) || enemyShipGlowLoadKeys.has(key)) return;
    enemyShipGlowLoadKeys.add(key);
    const img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      try {
        const normalized = makeNormalizedEnemyCanvas(img, ENEMY_SHIP_TEXTURE_SIZE) || img;
        const glowColor = averageImageColor(img);
        enemyShipGlowColors.set(key, glowColor);
        const glowCanvas = makeEnemyGlowCanvas(normalized, glowColor, ENEMY_SHIP_TEXTURE_SIZE) || normalized;
        const tex = createTextureFromCanvas(glowCanvas);
        if (tex) {
          render.textures.set(key, tex);
          enemyShipGlowTextures.set(key, {
            texture: tex,
            w: glowCanvas.width || ENEMY_SHIP_TEXTURE_SIZE,
            h: glowCanvas.height || ENEMY_SHIP_TEXTURE_SIZE
          });
        }
      } finally {
        enemyShipGlowLoadKeys.delete(key);
      }
    };
    img.onerror = function () {
      enemyShipGlowLoadKeys.delete(key);
    };
    img.src = enemyShipSource(levelNumber, shipIndex);
  }

  function ensureGlowImage(src) {
    if (!src) return null;
    if (glowImages.has(src) || glowImageLoads.has(src)) return glowImages.get(src) || null;
    glowImageLoads.add(src);
    const img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      glowImages.set(src, img);
      glowImageLoads.delete(src);
    };
    img.onerror = function () {
      glowImageLoads.delete(src);
    };
    img.src = src;
    return null;
  }

  const planetDecorImages = new Map();
  const planetDecorTextures = new Map();
  const planetDecorLoadKeys = new Set();
  const planetDecorTextureLoadKeys = new Set();
  const PLANET_DECOR_MIN = 1;
  const PLANET_DECOR_MAX = 30;

  function planetDecorKey(index) {
    return 'planet-decor|' + String(index).padStart(2, '0');
  }

  function planetDecorSource(index) {
    return 'assets/planet_image_' + String(index).padStart(2, '0') + '.png';
  }

  function ensurePlanetDecorImage(index) {
    const key = planetDecorKey(index);
    if (planetDecorImages.has(key) || planetDecorLoadKeys.has(key)) return planetDecorImages.get(key) || null;
    planetDecorLoadKeys.add(key);
    const img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      planetDecorImages.set(key, img);
      planetDecorLoadKeys.delete(key);
    };
    img.onerror = function () {
      planetDecorLoadKeys.delete(key);
    };
    img.src = planetDecorSource(index);
    return null;
  }

  function randomPlanetDecorIndex() {
    return PLANET_DECOR_MIN + ((Math.random() * (PLANET_DECOR_MAX - PLANET_DECOR_MIN + 1)) | 0);
  }

  function getPlanetDecorImage(index) {
    const key = planetDecorKey(index);
    const img = planetDecorImages.get(key);
    if (img) return img;
    ensurePlanetDecorImage(index);
    return null;
  }

  function ensurePlanetDecorTexture(index) {
    const key = planetDecorKey(index) + '|native';
    if (planetDecorTextures.has(key) || planetDecorTextureLoadKeys.has(key)) return planetDecorTextures.get(key) || null;
    const img = getPlanetDecorImage(index);
    if (!img || !img.naturalWidth || !img.naturalHeight) return null;
    planetDecorTextureLoadKeys.add(key);
    try {
      const texW = Math.max(1, img.naturalWidth);
      const texH = Math.max(1, img.naturalHeight);
      const c = makeCanvas(texW, texH);
      const g = c.getContext('2d');
      if (!g) return null;
      g.imageSmoothingEnabled = true;
      g.clearRect(0, 0, texW, texH);
      g.drawImage(img, 0, 0, texW, texH);
      const tex = createTextureFromCanvas(c);
      if (tex) planetDecorTextures.set(key, tex);
      return tex;
    } finally {
      planetDecorTextureLoadKeys.delete(key);
    }
  }

  function warmEnemyShipBatch(levelNumber) {
    for (let i = 0; i < ENEMY_SHIP_COLUMNS; i++) {
      ensureEnemyShipTexture(levelNumber, i);
    }
  }

  function getEnemyShipTexture(levelNumber, shipIndex) {
    const exactKey = enemyShipKey(levelNumber, shipIndex);
    const exact = render.textures.get(exactKey);
    if (exact) return exact;
    ensureEnemyShipTexture(levelNumber, shipIndex);
    if (levelNumber > ENEMY_SHIP_FALLBACK_BATCHES) {
      const fallbackLevel = ((levelNumber - 1) % ENEMY_SHIP_FALLBACK_BATCHES) + 1;
      const fallbackKey = enemyShipKey(fallbackLevel, shipIndex);
      const fallback = render.textures.get(fallbackKey);
      if (fallback) return fallback;
      ensureEnemyShipTexture(fallbackLevel, shipIndex);
    }
    return null;
  }

  function getEnemyShipGlowColor(levelNumber, shipIndex, fallbackTheme) {
    const key = enemyShipKey(levelNumber, shipIndex);
    const glow = enemyShipGlowColors.get(key);
    if (glow) return glow;
    return fallbackEnemyShipGlowColor(levelNumber, shipIndex) || (fallbackTheme && (fallbackTheme.glow || fallbackTheme.accent2 || fallbackTheme.accent)) || '#8fd8ff';
  }

  function getEnemyShipRenderSize(levelNumber, shipIndex) {
    const key = 'shipsize|' + levelNumber + '|' + shipIndex;
    return ENEMY_SHIP_MIN_SIZE + (hashString(key) % (ENEMY_SHIP_MAX_SIZE - ENEMY_SHIP_MIN_SIZE + 1));
  }

  function scoreEnemyKindColor(kind, rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) * 0.5;
    const sat = max <= 0 ? 0 : (max - min) / Math.max(0.0001, max);
    const redness = Math.max(0, r - (g + b) * 0.5);
    const greenness = Math.max(0, g - (r + b) * 0.5);
    const blueness = Math.max(0, b - (r + g) * 0.5);
    const yellowness = Math.max(0, Math.min(r, g) - b);
    const cyanness = Math.max(0, Math.min(g, b) - r);
    const magentaness = Math.max(0, Math.min(r, b) - g);
    const whiteness = (1 - sat) * l;
    const bright = max;
    switch (kind) {
      case 'splitter': return yellowness * 3.0 + bright * 0.35;
      case 'drifter': return whiteness * 2.6 + cyanness * 0.45;
      case 'sniper': return redness * 2.8 + sat * 0.25;
      case 'bomber': return (redness * 1.4 + yellowness * 1.4) - blueness * 0.4;
      case 'swarm': return greenness * 2.5 + yellowness * 0.25;
      case 'looper': return magentaness * 2.8 + redness * 0.35;
      case 'spinner': return cyanness * 2.7 + blueness * 0.3;
      case 'diver': return redness * 1.8 + yellowness * 0.8;
      case 'mine': return greenness * 2.1 + cyanness * 0.35;
      case 'elite': return yellowness * 1.8 + whiteness * 1.2 + bright * 0.7;
      default: return sat * 0.6 + bright * 0.4;
    }
  }

  function buildEnemyKindShipAssignments(levelNumber, theme) {
    const enemyKinds = waveEnemyKinds(theme);
    const orderedKinds = [];
    const seen = Object.create(null);
    for (let i = 0; i < enemyKinds.length; i++) {
      const kind = enemyKinds[i];
      if (seen[kind]) continue;
      seen[kind] = true;
      orderedKinds.push(kind);
    }
    const shipIndices = [];
    for (let i = 0; i < ENEMY_SHIP_COLUMNS; i++) {
      ensureEnemyShipTexture(levelNumber, i);
      shipIndices.push(i);
    }
    const descriptors = shipIndices.map(function (idx) {
      const hex = getEnemyShipGlowColor(levelNumber, idx, theme);
      return { index: idx, rgb: hexToRgb(hex || '#ffffff') };
    });
    const assignments = Object.create(null);
    const cursors = Object.create(null);
    for (let i = 0; i < orderedKinds.length; i++) {
      assignments[orderedKinds[i]] = [];
      cursors[orderedKinds[i]] = 0;
    }
    const kindCount = orderedKinds.length;
    const shipCount = descriptors.length;
    if (!kindCount || !shipCount) {
      return {
        levelNumber: levelNumber,
        assignments: assignments,
        cursors: cursors
      };
    }

    const rawScores = [];
    const normScores = [];
    const rankedShipsByKind = [];
    for (let k = 0; k < kindCount; k++) {
      const row = [];
      for (let s = 0; s < shipCount; s++) row.push(scoreEnemyKindColor(orderedKinds[k], descriptors[s].rgb));
      rawScores.push(row);
      let minScore = row[0];
      let maxScore = row[0];
      for (let s = 1; s < shipCount; s++) {
        if (row[s] < minScore) minScore = row[s];
        if (row[s] > maxScore) maxScore = row[s];
      }
      const span = Math.max(1e-6, maxScore - minScore);
      const normRow = row.map(function (v) { return (v - minScore) / span; });
      normScores.push(normRow);
      const ranked = [];
      for (let s = 0; s < shipCount; s++) ranked.push(s);
      ranked.sort(function (a, b) { return normRow[b] - normRow[a]; });
      rankedShipsByKind.push(ranked);
    }

    const usedShips = new Array(shipCount).fill(false);
    const unresolvedKinds = [];
    for (let k = 0; k < kindCount; k++) unresolvedKinds.push(k);

    while (unresolvedKinds.length) {
      let bestPick = null;
      for (let i = 0; i < unresolvedKinds.length; i++) {
        const k = unresolvedKinds[i];
        const ranked = rankedShipsByKind[k];
        let bestShip = -1;
        let bestScore = -1e18;
        let secondScore = -1e18;
        for (let r = 0; r < ranked.length; r++) {
          const s = ranked[r];
          if (usedShips[s]) continue;
          const score = normScores[k][s];
          if (bestShip < 0) {
            bestShip = s;
            bestScore = score;
          } else {
            secondScore = score;
            break;
          }
        }
        if (bestShip < 0) continue;
        const margin = secondScore > -1e17 ? (bestScore - secondScore) : (bestScore + 1);
        if (!bestPick || margin > bestPick.margin || (margin === bestPick.margin && bestScore > bestPick.bestScore)) {
          bestPick = { kindIndex: k, shipSlot: bestShip, margin: margin, bestScore: bestScore };
        }
      }
      if (!bestPick) break;
      usedShips[bestPick.shipSlot] = true;
      assignments[orderedKinds[bestPick.kindIndex]].push(descriptors[bestPick.shipSlot].index);
      const nextUnresolved = [];
      for (let i = 0; i < unresolvedKinds.length; i++) {
        if (unresolvedKinds[i] !== bestPick.kindIndex) nextUnresolved.push(unresolvedKinds[i]);
      }
      unresolvedKinds.length = 0;
      for (let i = 0; i < nextUnresolved.length; i++) unresolvedKinds.push(nextUnresolved[i]);
    }

    for (let s = 0; s < shipCount; s++) {
      if (usedShips[s]) continue;
      let bestKindIndex = 0;
      let bestScore = -1e18;
      for (let k = 0; k < kindCount; k++) {
        const score = normScores[k][s];
        if (score > bestScore) {
          bestScore = score;
          bestKindIndex = k;
        }
      }
      assignments[orderedKinds[bestKindIndex]].push(descriptors[s].index);
      usedShips[s] = true;
    }

    for (let k = 0; k < kindCount; k++) {
      const kind = orderedKinds[k];
      if (assignments[kind] && assignments[kind].length) continue;
      let bestShip = 0;
      let bestScore = -1e18;
      for (let s = 0; s < shipCount; s++) {
        const score = normScores[k][s];
        if (score > bestScore) {
          bestScore = score;
          bestShip = s;
        }
      }
      assignments[kind] = [descriptors[bestShip].index];
    }

    return {
      levelNumber: levelNumber,
      assignments: assignments,
      cursors: cursors
    };
  }

  function chooseEnemyShipIndexForKind(kind, levelNumber) {
    const map = state.enemyShipKindMap;
    if (!map || map.levelNumber !== levelNumber) return randi(0, ENEMY_SHIP_COLUMNS - 1);
    const list = map.assignments && map.assignments[kind];
    if (!list || !list.length) return randi(0, ENEMY_SHIP_COLUMNS - 1);
    const key = kind || 'drifter';
    const cursor = map.cursors[key] || 0;
    const pick = list[cursor % list.length];
    map.cursors[key] = (cursor + 1) % list.length;
    return pick;
  }

  function bossArtKey(levelNumber) {
    return 'bossart|' + levelNumber;
  }

  function bossArtSource(levelNumber) {
    if (levelNumber === 13) return 'assets/Boss_13_Body.png';
    return 'assets/Boss_' + String(levelNumber).padStart(2, '0') + '.png';
  }

  function bossPartKey(levelNumber, partName) {
    return 'bosspart|' + levelNumber + '|' + partName;
  }

  function bossPartSource(levelNumber, partName) {
    if (levelNumber === 13 && (partName === 'leftClaw' || partName === 'rightClaw')) return 'assets/Boss_13_LeftClaw.png';
    return '';
  }

  function makeNormalizedBossCanvas(img, size) {
    size = size || 512;
    const c = makeCanvas(size, size);
    const g = c.getContext('2d');
    if (!g) return null;
    g.clearRect(0, 0, size, size);
    const srcW = Math.max(1, img.naturalWidth || img.width || size);
    const srcH = Math.max(1, img.naturalHeight || img.height || size);
    const scale = Math.min(size / srcW, size / srcH);
    const drawW = srcW * scale;
    const drawH = srcH * scale;
    const dx = (size - drawW) * 0.5;
    const dy = (size - drawH) * 0.5;
    g.drawImage(img, dx, dy, drawW, drawH);
    return c;
  }

  function bossGlowPad(size) {
    size = Math.max(1, size || 512);
    return Math.max(16, Math.round(size * 0.125));
  }

  function bossGlowCanvasSize(size) {
    size = Math.max(1, size || 512);
    const pad = bossGlowPad(size);
    return size + pad * 2;
  }

  function makeBossGlowCanvas(img, glowColor, size) {
    size = Math.max(1, size || 512);
    const pad = bossGlowPad(size);
    const total = size + pad * 2;
    const c = makeCanvas(total, total);
    const g = c.getContext('2d');
    if (!g) return null;
    const srcW = Math.max(1, img.naturalWidth || img.width || size);
    const srcH = Math.max(1, img.naturalHeight || img.height || size);
    const scale = Math.min(size / srcW, size / srcH);
    const drawW = srcW * scale;
    const drawH = srcH * scale;
    const dx = (size - drawW) * 0.5 + pad;
    const dy = (size - drawH) * 0.5 + pad;
    const src = makeCanvas(total, total);
    const sg = src.getContext('2d');
    if (!sg) return null;
    sg.clearRect(0, 0, total, total);
    sg.drawImage(img, dx, dy, drawW, drawH);
    g.clearRect(0, 0, total, total);
    if (g.filter !== undefined) g.filter = 'blur(8px)';
    g.drawImage(src, 0, 0);
    if (g.filter !== undefined) g.filter = 'none';
    const imgData = g.getImageData(0, 0, total, total);
    const data = imgData.data;
    const rgb = hexToRgb(glowColor || '#ffffff');
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a <= 0) continue;
      data[i] = rgb[0];
      data[i + 1] = rgb[1];
      data[i + 2] = rgb[2];
      data[i + 3] = Math.max(0, Math.min(255, Math.round(255 * Math.pow(a / 255, 0.5))));
    }
    g.putImageData(imgData, 0, 0);
    return c;
  }

  function getCanvasAlphaBounds(source) {
    const w = Math.max(1, source && (source.naturalWidth || source.width) || 1);
    const h = Math.max(1, source && (source.naturalHeight || source.height) || 1);
    const c = makeCanvas(w, h);
    const g = c.getContext('2d', { willReadFrequently: true }) || c.getContext('2d');
    if (!g) return { x: 0, y: 0, w: w, h: h };
    g.clearRect(0, 0, w, h);
    g.drawImage(source, 0, 0, w, h);
    const data = g.getImageData(0, 0, w, h).data;
    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] <= 0) continue;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
    if (maxX < minX || maxY < minY) return { x: 0, y: 0, w: w, h: h };
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  }

  function getEnemyShipGlowTexture(levelNumber, shipIndex) {
    const key = enemyShipKey(levelNumber, shipIndex) + '|glow';
    const entry = enemyShipGlowTextures.get(key);
    if (entry) return entry;
    ensureEnemyShipGlowTexture(levelNumber, shipIndex);
    return enemyShipGlowTextures.get(key) || null;
  }

  function makeCanvasAlphaMask(source, alphaThreshold) {
    const w = Math.max(1, source && (source.naturalWidth || source.width) || 1);
    const h = Math.max(1, source && (source.naturalHeight || source.height) || 1);
    const c = makeCanvas(w, h);
    const g = c.getContext('2d', { willReadFrequently: true }) || c.getContext('2d');
    if (!g) return { w: w, h: h, data: null, bounds: { x: 0, y: 0, w: w, h: h } };
    g.clearRect(0, 0, w, h);
    g.drawImage(source, 0, 0, w, h);
    const imgData = g.getImageData(0, 0, w, h);
    const src = imgData.data;
    const mask = new Uint8Array(w * h);
    const threshold = alphaThreshold == null ? 8 : alphaThreshold;
    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let i = 0, p = 0; i < src.length; i += 4, p++) {
      if (src[i + 3] <= threshold) continue;
      mask[p] = 1;
      const x = p % w;
      const y = (p / w) | 0;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    const bounds = maxX < minX || maxY < minY ? { x: 0, y: 0, w: w, h: h } : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
    return { w: w, h: h, data: mask, bounds: bounds };
  }

  function pointHitsAlphaMask(mask, spriteX, spriteY, spriteW, spriteH, rot, worldX, worldY) {
    if (!mask || !mask.data) return false;
    const c = Math.cos(-(rot || 0));
    const s = Math.sin(-(rot || 0));
    const dx = worldX - spriteX;
    const dy = worldY - spriteY;
    const localX = dx * c - dy * s;
    const localY = dx * s + dy * c;
    const texX = Math.floor((localX / spriteW + 0.5) * mask.w);
    const texY = Math.floor((localY / spriteH + 0.5) * mask.h);
    if (texX < 0 || texY < 0 || texX >= mask.w || texY >= mask.h) return false;
    return mask.data[texY * mask.w + texX] !== 0;
  }

  function circleHitsAlphaMask(mask, spriteX, spriteY, spriteW, spriteH, rot, worldX, worldY, radius) {
    const r = Math.max(1, radius || 1);
    const samples = [
      [0, 0],
      [r * 0.7, 0],
      [-r * 0.7, 0],
      [0, r * 0.7],
      [0, -r * 0.7]
    ];
    for (let i = 0; i < samples.length; i++) {
      const sx = worldX + samples[i][0];
      const sy = worldY + samples[i][1];
      if (pointHitsAlphaMask(mask, spriteX, spriteY, spriteW, spriteH, rot, sx, sy)) return true;
    }
    return false;
  }

  function circleHitsRotatedRect(rect, x, y, radius) {
    if (!rect) return false;
    const r = Math.max(1, radius || 1);
    const c = Math.cos(-(rect.rot || 0));
    const s = Math.sin(-(rect.rot || 0));
    const dx = x - rect.x;
    const dy = y - rect.y;
    const localX = dx * c - dy * s;
    const localY = dx * s + dy * c;
    const hw = Math.max(1, (rect.w || 0) * 0.5) + r;
    const hh = Math.max(1, (rect.h || 0) * 0.5) + r;
    return Math.abs(localX) <= hw && Math.abs(localY) <= hh;
  }

  function ensureBossTexture(levelNumber) {
    const key = bossArtKey(levelNumber);
    if (render.textures.has(key) || bossArtLoadKeys.has(key)) return;
    bossArtLoadKeys.add(key);
    const img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      try {
        const theme = THEMES[Math.max(0, Math.min(THEMES.length - 1, levelNumber - 1))] || mainTheme();
        const bossSize = Math.max(1, (theme.boss && theme.boss.size) || 512);
        const normalized = makeNormalizedBossCanvas(img, bossSize) || img;
        const bossTex = createTextureFromCanvas(normalized);
        if (bossTex) render.textures.set(key, bossTex);
        const alphaMask = makeCanvasAlphaMask(normalized, 8);
        if (alphaMask) bossAlphaMasks.set(key, alphaMask);
        const bounds = getCanvasAlphaBounds(normalized);
        bossHitBoxes.set(key, {
          x: bounds.x - bossSize * 0.5,
          y: bounds.y - bossSize * 0.5,
          w: bounds.w,
          h: bounds.h
        });
        const glowKey = key + '|glow';
        const glowCanvas = makeBossGlowCanvas(normalized, '#ffffff', bossSize) || normalized;
        const glowTex = createTextureFromCanvas(glowCanvas);
        if (glowTex) bossGlowTextures.set(glowKey, glowTex);
      } finally {
        bossArtLoadKeys.delete(key);
      }
    };
    img.onerror = function () {
      bossArtLoadKeys.delete(key);
    };
    img.src = bossArtSource(levelNumber);
  }

  function ensureBossPartTexture(levelNumber, partName) {
    const key = bossPartKey(levelNumber, partName);
    if (bossPartTextures.has(key) || bossPartLoadKeys.has(key)) return;
    const src = bossPartSource(levelNumber, partName);
    if (!src) return;
    bossPartLoadKeys.add(key);
    const img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      try {
        let source = img;
        if (levelNumber === 13 && partName === 'rightClaw') {
          const w = Math.max(1, img.naturalWidth || img.width || 1);
          const h = Math.max(1, img.naturalHeight || img.height || 1);
          const c = makeCanvas(w, h);
          const g = c.getContext('2d');
          if (g) {
            g.translate(w, 0);
            g.scale(-1, 1);
            g.drawImage(img, 0, 0, w, h);
            source = c;
          }
        }
        const tex = createTextureFromCanvas(source);
        const glowCanvas = makeBossGlowCanvas(source, '#ffffff', Math.max(1, img.naturalWidth || img.width || 1)) || source;
        const glowTex = createTextureFromCanvas(glowCanvas);
        if (tex) {
          const rawW = Math.max(1, img.naturalWidth || img.width || 1);
          const rawH = Math.max(1, img.naturalHeight || img.height || 1);
          const glowPad = bossGlowPad(rawW);
          const bounds = getCanvasAlphaBounds(source);
          const mask = makeCanvasAlphaMask(source, 8);
          bossPartTextures.set(key, {
            texture: tex,
            glowTexture: glowTex,
            glowPad: glowPad,
            glowW: rawW + glowPad * 2,
            glowH: rawH + glowPad * 2,
            bounds: bounds,
            mask: mask,
            w: rawW,
            h: rawH
          });
        }
      } finally {
        bossPartLoadKeys.delete(key);
      }
    };
    img.onerror = function () {
      bossPartLoadKeys.delete(key);
    };
    img.src = src;
  }

  function warmBossArt(levelNumber) {
    ensureBossTexture(levelNumber);
    if (levelNumber === 13) {
      ensureBossPartTexture(levelNumber, 'leftClaw');
      ensureBossPartTexture(levelNumber, 'rightClaw');
    }
  }

  function getBossTexture(levelNumber) {
    const key = bossArtKey(levelNumber);
    const tex = render.textures.get(key);
    if (tex) return tex;
    ensureBossTexture(levelNumber);
    return null;
  }

  function getBossAlphaMask(levelNumber) {
    const key = bossArtKey(levelNumber);
    const mask = bossAlphaMasks.get(key);
    if (mask) return mask;
    ensureBossTexture(levelNumber);
    return bossAlphaMasks.get(key) || null;
  }

  function getBossGlowTexture(levelNumber) {
    const key = bossArtKey(levelNumber) + '|glow';
    const tex = bossGlowTextures.get(key);
    if (tex) return tex;
    ensureBossTexture(levelNumber);
    return null;
  }

  function getBossHitBox(levelNumber) {
    const key = bossArtKey(levelNumber);
    return bossHitBoxes.get(key) || { x: -256, y: -256, w: 512, h: 512 };
  }

  function getBossPartTexture(levelNumber, partName) {
    const key = bossPartKey(levelNumber, partName);
    const entry = bossPartTextures.get(key);
    if (entry) return entry;
    ensureBossPartTexture(levelNumber, partName);
    return null;
  }

  function circleIntersectsRect(cx, cy, cr, rect) {
    const rx = rect.x;
    const ry = rect.y;
    const rw = rect.w;
    const rh = rect.h;
    const nx = clamp(cx, rx, rx + rw);
    const ny = clamp(cy, ry, ry + rh);
    return d2(cx, cy, nx, ny) <= cr * cr;
  }

  function circleIntersectsRotatedRect(cx, cy, cr, rect) {
    if (!rect) return false;
    const c = Math.cos(-(rect.rot || 0));
    const s = Math.sin(-(rect.rot || 0));
    const dx = cx - rect.x;
    const dy = cy - rect.y;
    const lx = dx * c - dy * s;
    const ly = dx * s + dy * c;
    const hw = Math.max(1, rect.w || 1) * 0.5;
    const hh = Math.max(1, rect.h || 1) * 0.5;
    const nx = clamp(lx, -hw, hw);
    const ny = clamp(ly, -hh, hh);
    return d2(lx, ly, nx, ny) <= cr * cr;
  }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(v, t, r, dt) { return v + (t - v) * (1 - Math.exp(-r * dt)); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function randi(a, b) { return Math.floor(rand(a, b + 1)); }
  function pick(list) { return list[(Math.random() * list.length) | 0]; }
  function chance(p) { return Math.random() < p; }
  function d2(ax, ay, bx, by) { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; }
  function ang(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }
  function format(n) { return String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function loadNum(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const v = Number(raw);
      return Number.isFinite(v) ? v : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function saveNum(key, v) { try { localStorage.setItem(key, String(v)); } catch (e) {} }
  function loadBool(key, fallback) { try { const v = localStorage.getItem(key); return v === null ? fallback : v === '1' || v === 'true'; } catch (e) { return fallback; } }
  function saveBool(key, v) { try { localStorage.setItem(key, v ? '1' : '0'); } catch (e) {} }
  const DEBUG_LOG_KEY = 'ThroriumGap_debugLog';
  const DEBUG_LOG_LIMIT = 64;

  function loadDebugLog() {
    try {
      const raw = localStorage.getItem(DEBUG_LOG_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(-DEBUG_LOG_LIMIT) : [];
    } catch (e) {
      return [];
    }
  }

  function saveDebugLog() {
    if (!state || !state.debugMode) return;
    try {
      localStorage.setItem(DEBUG_LOG_KEY, JSON.stringify((state.debugLog || []).slice(-DEBUG_LOG_LIMIT)));
    } catch (e) {}
  }

  function pushDebugEvent(type, data) {
    if (!state || !state.debugMode) return null;
    const entry = Object.assign({
      type: type,
      at: Math.round(state.animClock * 1000) / 1000,
      frame: state.renderFrameIndex || 0
    }, data || {});
    state.debugLog.push(entry);
    if (state.debugLog.length > DEBUG_LOG_LIMIT) {
      state.debugLog.splice(0, state.debugLog.length - DEBUG_LOG_LIMIT);
    }
    saveDebugLog();
    return entry;
  }

  function compactSourceInfo(source) {
    if (!source) return null;
    return {
      kind: source.kind || '',
      sourceKind: source.sourceKind || '',
      sourceName: source.sourceName || '',
      team: source.team || ''
    };
  }

  function hasDebugExceptionInLog() {
    if (!state || !Array.isArray(state.debugLog)) return false;
    for (let i = 0; i < state.debugLog.length; i++) {
      const entry = state.debugLog[i];
      if (!entry || !entry.type) continue;
      if (entry.type === 'exceptionSelfHitGuard') return true;
    }
    return false;
  }

  function hashString(str) {
    let h = 2166136261 >>> 0;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function makeCanvas(w, h) {
    //if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  function makeDomCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  function clamp255(v) { return clamp(Math.round(v), 0, 255); }

  function hexToRgb(hex) {
    if (typeof hex !== 'string') return [255, 255, 255];
    let s = hex.trim();
    if (s[0] === '#') s = s.slice(1);
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    if (!/^[0-9a-fA-F]{6}$/.test(s)) return [255, 255, 255];
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  }

  function mixHex(a, b, t) {
    const ar = hexToRgb(a || '#ffffff');
    const br = hexToRgb(b || '#ffffff');
    const k = clamp(t == null ? 0 : t, 0, 1);
    return '#' + [0, 1, 2].map(function (i) { return clamp255(lerp(ar[i], br[i], k)).toString(16).padStart(2, '0'); }).join('');
  }

  function colorUnit(color) {
    if (Array.isArray(color)) return color;
    const key = typeof color === 'string' && color ? color : '#ffffff';
    let cached = render.colorCache.get(key);
    if (cached) return cached;
    const rgb = hexToRgb(key);
    cached = [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
    render.colorCache.set(key, cached);
    return cached;
  }

  function initRenderer() {
    if (!gl || render.ready) return false;
    try {
    const vs = [
      'attribute vec2 a_pos;',
      'attribute vec2 a_uv;',
      'attribute vec4 a_color;',
      'uniform vec2 u_viewport;',
      'varying vec2 v_uv;',
      'varying vec4 v_color;',
      'void main() {',
      '  vec2 zeroToOne = a_pos / u_viewport;',
      '  vec2 clip = zeroToOne * 2.0 - 1.0;',
      '  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);',
      '  v_uv = a_uv;',
      '  v_color = a_color;',
      '}'
    ].join('\n');
    const fs = [
      'precision mediump float;',
      'uniform sampler2D u_tex;',
      'varying vec2 v_uv;',
      'varying vec4 v_color;',
      'void main() {',
      '  vec4 tex = texture2D(u_tex, v_uv);',
      '  gl_FragColor = tex * v_color;',
      '}'
    ].join('\n');
    const starVs = [
      'attribute vec4 a_star0;',
      'attribute vec4 a_star1;',
      'uniform vec2 u_viewport;',
      'uniform float u_time;',
      'uniform float u_scroll;',
      'uniform float u_dpr;',
      'varying vec4 v_star0;',
      'varying vec4 v_star1;',
      'void main() {',
      '  float y = fract(a_star0.y + u_scroll * a_star0.w);',
      '  vec2 pos = vec2(a_star0.x * u_viewport.x, y * u_viewport.y);',
      '  vec2 zeroToOne = pos / u_viewport;',
      '  vec2 clip = zeroToOne * 2.0 - 1.0;',
      '  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);',
      '  float boost = mix(1.0, 1.10, step(1.25, a_star0.z));',
      '  gl_PointSize = max(1.0, a_star0.z * boost * u_dpr * 1.35);',
      '  v_star0 = a_star0;',
      '  v_star1 = a_star1;',
      '}'
    ].join('\n');
    const starFs = [
      'precision mediump float;',
      'uniform float u_time;',
      'varying vec4 v_star0;',
      'varying vec4 v_star1;',
      'void main() {',
      '  vec2 p = gl_PointCoord - vec2(0.5);',
      '  float d = length(p) * 2.0;',
      '  float core = smoothstep(0.95, 0.70, d);',
      '  float spark = smoothstep(0.20, 0.0, abs(p.x)) * smoothstep(0.20, 0.0, abs(p.y));',
      '  float tw = 0.7 + sin(u_time * 2.1 + v_star1.y * 6.2831853) * 0.3;',
      '  float a = clamp(v_star1.x * tw * 1.45, 0.26, 1.0);',
      '  float alpha = clamp((core * 1.80 + spark * 0.28) * a, 0.0, 1.0);',
      '  vec3 color = vec3(1.0);',
      '  if (v_star1.z >= 0.84) color = vec3(0.949, 0.890, 0.659);',
      '  else if (v_star1.z >= 0.64) color = vec3(0.875, 0.937, 1.0);',
      '  gl_FragColor = vec4(color * alpha, alpha);',
      '}'
    ].join('\n');
    function compile(type, source) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, source);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader compile failed');
      return sh;
    }
    const program = gl.createProgram();
    gl.bindAttribLocation(program, 0, 'a_pos');
    gl.bindAttribLocation(program, 1, 'a_uv');
    gl.bindAttribLocation(program, 2, 'a_color');
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'program link failed');
    render.program = program;
    render.aPos = gl.getAttribLocation(program, 'a_pos');
    render.aUv = gl.getAttribLocation(program, 'a_uv');
    render.aColor = gl.getAttribLocation(program, 'a_color');
    render.uTex = gl.getUniformLocation(program, 'u_tex');
    render.uViewport = gl.getUniformLocation(program, 'u_viewport');
    render.buffer = gl.createBuffer();
    render.white = createTextureFromCanvas(makeSolidTexture());
    render.circle = createTextureFromCanvas(makeCircleTexture());
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, render.buffer);
    gl.enableVertexAttribArray(render.aPos);
    gl.enableVertexAttribArray(render.aUv);
    gl.enableVertexAttribArray(render.aColor);
    gl.vertexAttribPointer(render.aPos, 2, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(render.aUv, 2, gl.FLOAT, false, 32, 8);
    gl.vertexAttribPointer(render.aColor, 4, gl.FLOAT, false, 32, 16);
    gl.uniform1i(render.uTex, 0);
    try {
      const starProgram = gl.createProgram();
      gl.bindAttribLocation(starProgram, 4, 'a_star0');
      gl.bindAttribLocation(starProgram, 5, 'a_star1');
      gl.attachShader(starProgram, compile(gl.VERTEX_SHADER, starVs));
      gl.attachShader(starProgram, compile(gl.FRAGMENT_SHADER, starFs));
      gl.linkProgram(starProgram);
      if (!gl.getProgramParameter(starProgram, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(starProgram) || 'star program link failed');
      render.starProgram = starProgram;
      render.aStar0 = gl.getAttribLocation(starProgram, 'a_star0');
      render.aStar1 = gl.getAttribLocation(starProgram, 'a_star1');
      render.uStarViewport = gl.getUniformLocation(starProgram, 'u_viewport');
      render.uStarTime = gl.getUniformLocation(starProgram, 'u_time');
      render.uStarScroll = gl.getUniformLocation(starProgram, 'u_scroll');
      render.uStarDpr = gl.getUniformLocation(starProgram, 'u_dpr');
      render.starBuffer = gl.createBuffer();
      gl.useProgram(starProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, render.starBuffer);
      gl.enableVertexAttribArray(render.aStar0);
      gl.enableVertexAttribArray(render.aStar1);
      gl.vertexAttribPointer(render.aStar0, 4, gl.FLOAT, false, 32, 0);
      gl.vertexAttribPointer(render.aStar1, 4, gl.FLOAT, false, 32, 16);
      gl.uniform1f(render.uStarDpr, view.dpr);
      render.starDisabled = false;
    } catch (starErr) {
      console.warn('GPU starfield disabled; continuing with sprite renderer.', starErr);
      render.starProgram = null;
      render.starBuffer = null;
      render.aStar0 = null;
      render.aStar1 = null;
      render.uStarViewport = null;
      render.uStarTime = null;
      render.uStarScroll = null;
      render.uStarDpr = null;
      render.starDisabled = true;
    }
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    render.ready = true;
    return true;
    } catch (err) {
      console.error('WebGL renderer init failed', err);
      render.ready = false;
      render.program = null;
      render.buffer = null;
      render.white = null;
      render.circle = null;
      render.starProgram = null;
      render.starBuffer = null;
      render.aPos = null;
      render.aUv = null;
      render.aColor = null;
      render.uTex = null;
      render.uViewport = null;
      render.aStar0 = null;
      render.aStar1 = null;
      render.uStarViewport = null;
      render.uStarTime = null;
      render.uStarScroll = null;
      render.uStarDpr = null;
      if (!state.settings.lowEndMode) state.settings.lowEndMode = true;
      return false;
    }
  }

  function makeSolidTexture() {
    const c = makeCanvas(2, 2);
    const g = c.getContext('2d');
    g.fillStyle = '#fff';
    g.fillRect(0, 0, 2, 2);
    return c;
  }

  function makeCircleTexture() {
    const c = makeCanvas(128, 128);
    const g = c.getContext('2d');
    const img = g.createImageData(128, 128);
    const data = img.data;
    const cx = 63.5;
    const cy = 63.5;
    const radius = 63.5;
    for (let y = 0; y < 128; y++) {
      for (let x = 0; x < 128; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const d = Math.sqrt(dx * dx + dy * dy) / radius;
        const outer = Math.max(0, 1 - d);
        const core = Math.pow(outer, 2.25);
        const halo = Math.pow(Math.max(0, 1 - d * 1.45), 4.2);
        const v = clamp255((Math.min(1, core * 0.72 + halo * 0.42)) * 255);
        const i = (y * 128 + x) * 4;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = v;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  function createTextureFromCanvas(source) {
    if (!gl || !source) return null;
    try {
      const tex = gl.createTexture();
      if (!tex) return null;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      return tex;
    } catch (err) {
      console.warn('Texture upload failed', err, source && source.constructor ? source.constructor.name : typeof source);
      return null;
    }
  }

  function getEmojiTexture(text, size) {
    const s = Math.max(8, Math.round(size));
    const key = text + '|' + s;
    let tex = render.textures.get(key);
    if (tex) return tex;
    const pad = Math.max(4, Math.round(s * 0.2));
    const c = makeCanvas(Math.max(16, Math.ceil(s * 2 + pad * 2)), Math.max(16, Math.ceil(s * 2 + pad * 2)));
    const g = c.getContext('2d');
    g.clearRect(0, 0, c.width, c.height);
    g.font = '700 ' + Math.round(s * 2) + 'px ' + EMOJI_FONT;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#fff';
    g.fillText(text, c.width * 0.5, c.height * 0.5 + Math.round(s * 0.03));
    tex = createTextureFromCanvas(c);
    if (tex) render.textures.set(key, tex);
    return tex;
  }

  function getDebugLabelTexture(text, size) {
    const s = Math.max(8, Math.round(size));
    const key = 'debuglabel|' + s + '|' + text;
    let entry = debugLabelTextures.get(key);
    if (entry) return entry;
    const padX = Math.max(4, Math.round(s * 0.45));
    const padY = Math.max(3, Math.round(s * 0.30));
    const tempCanvas = makeCanvas(8, 8);
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return null;
    tempCtx.font = '800 ' + s + 'px "Trebuchet MS", "Segoe UI", sans-serif';
    const measured = Math.max(1, Math.ceil(tempCtx.measureText(text).width));
    const w = measured + padX * 2;
    const h = Math.ceil(s * 1.15) + padY * 2;
    const c = makeCanvas(w, h);
    const g = c.getContext('2d');
    if (!g) return null;
    g.clearRect(0, 0, w, h);
    g.font = '800 ' + s + 'px "Trebuchet MS", "Segoe UI", sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineJoin = 'round';
    g.lineWidth = Math.max(2, Math.round(s * 0.26));
    g.strokeStyle = 'rgba(0,0,0,0.9)';
    g.fillStyle = '#ffffff';
    const textY = Math.round(h * 0.53);
    g.strokeText(text, Math.round(w * 0.5), textY);
    g.fillText(text, Math.round(w * 0.5), textY);
    const tex = createTextureFromCanvas(c);
    if (!tex) return null;
    entry = { texture: tex, w: w, h: h };
    debugLabelTextures.set(key, entry);
    return entry;
  }

  function pushSprite(texture, x, y, w, h, rot, color, alpha, layer, additive, erase) {
    let uv = null;
    if (arguments.length > 11 && arguments[11]) {
      uv = arguments[11];
    }
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h)) return;
    const queueIndex = render.queue.length;
    let item = render.spritePool[queueIndex];
    if (!item) {
      item = { uv: null };
      render.spritePool[queueIndex] = item;
    }
    const colorRgb = colorUnit(color);
    const itemLayer = layer || 0;
    item.texture = texture;
    item.x = (x + render.offsetX) * view.dpr;
    item.y = (y + render.offsetY) * view.dpr;
    item.w = w * view.dpr;
    item.h = h * view.dpr;
    item.rot = rot || 0;
    item.cr = colorRgb[0];
    item.cg = colorRgb[1];
    item.cb = colorRgb[2];
    item.ca = alpha == null ? 1 : alpha;
    item.layer = itemLayer;
    item.order = render.seq++;
    item.blend = erase ? 'erase' : (additive ? 'additive' : 'normal');
    if (uv) {
      const itemUv = item.uv || {};
      itemUv.u0 = Number.isFinite(uv.u0) ? uv.u0 : 0;
      itemUv.v0 = Number.isFinite(uv.v0) ? uv.v0 : 0;
      itemUv.u1 = Number.isFinite(uv.u1) ? uv.u1 : 1;
      itemUv.v1 = Number.isFinite(uv.v1) ? uv.v1 : 1;
      item.uv = itemUv;
    } else {
      item.uv = null;
    }
    if (queueIndex > 0 && itemLayer < render.lastQueuedLayer) render.queueNeedsSort = true;
    render.lastQueuedLayer = itemLayer;
    render.queue.push(item);
  }

  function drawSpriteRect(x, y, w, h, color, alpha, layer, additive, rot) {
    pushSprite(render.white, x, y, w, h, rot || 0, color, alpha, layer, additive);
  }

  function drawSpriteCircle(x, y, r, color, alpha, layer, additive) {
    pushSprite(render.circle, x, y, r * 2, r * 2, 0, color, alpha, layer, additive);
  }

  function drawTextureRect(texture, x, y, w, h, opts) {
    const o = opts || {};
    pushSprite(texture, x, y, w, h, o.rot || 0, o.fill || '#ffffff', o.alpha == null ? 1 : o.alpha, o.layer || 0, !!o.lighter, !!o.erase, {
      u0: o.u0 == null ? 0 : o.u0,
      v0: o.v0 == null ? 0 : o.v0,
      u1: o.u1 == null ? 1 : o.u1,
      v1: o.v1 == null ? 1 : o.v1
    });
  }

  function drawTextureSlice(texture, x, y, w, h, srcY, srcH, texH, opts) {
    const totalH = Math.max(1, texH || h || 1);
    const top = clamp(srcY / totalH, 0, 1);
    const bottom = clamp((srcY + srcH) / totalH, 0, 1);
    const o = opts || {};
    drawTextureRect(texture, x, y, w, h, {
      rot: o.rot || 0,
      fill: o.fill || '#ffffff',
      alpha: o.alpha == null ? 1 : o.alpha,
      layer: o.layer || 0,
      lighter: o.lighter,
      erase: o.erase,
      u0: 0,
      v0: top,
      u1: 1,
      v1: bottom
    });
  }

  function drawSpriteEmoji(text, x, y, size, opts) {
    const o = opts || {};
    const tex = getEmojiTexture(text, size);
    pushSprite(tex, x, y, size * 2.1, size * 2.1, o.rot || 0, o.fill || '#ffffff', o.alpha == null ? 1 : o.alpha, o.layer || 0, !!o.lighter);
  }


  function ensureBatchData(spriteCount) {
    const need = Math.max(1, spriteCount) * 48;
    if (render.batchData && render.batchData.length >= need) return render.batchData;
    let size = render.batchData ? render.batchData.length : 48 * 256;
    while (size < need) size *= 2;
    render.batchData = new Float32Array(size);
    return render.batchData;
  }

  function appendSpriteQuad(data, offset, s) {
    const hw = s.w * 0.5;
    const hh = s.h * 0.5;
    const c = Math.cos(s.rot);
    const si = Math.sin(s.rot);
    const uv = s.uv || null;
    const u0 = uv ? uv.u0 : 0;
    const v0 = uv ? uv.v0 : 0;
    const u1 = uv ? uv.u1 : 1;
    const v1 = uv ? uv.v1 : 1;
    const x0 = s.x - hw * c + hh * si;
    const y0 = s.y - hw * si - hh * c;
    const x1 = s.x + hw * c + hh * si;
    const y1 = s.y + hw * si - hh * c;
    const x2 = s.x + hw * c - hh * si;
    const y2 = s.y + hw * si + hh * c;
    const x3 = s.x - hw * c - hh * si;
    const y3 = s.y - hw * si + hh * c;
    const r = s.cr;
    const g = s.cg;
    const b = s.cb;
    const a = s.ca;

    data[offset++] = x0; data[offset++] = y0; data[offset++] = u0; data[offset++] = v0; data[offset++] = r; data[offset++] = g; data[offset++] = b; data[offset++] = a;
    data[offset++] = x1; data[offset++] = y1; data[offset++] = u1; data[offset++] = v0; data[offset++] = r; data[offset++] = g; data[offset++] = b; data[offset++] = a;
    data[offset++] = x2; data[offset++] = y2; data[offset++] = u1; data[offset++] = v1; data[offset++] = r; data[offset++] = g; data[offset++] = b; data[offset++] = a;
    data[offset++] = x0; data[offset++] = y0; data[offset++] = u0; data[offset++] = v0; data[offset++] = r; data[offset++] = g; data[offset++] = b; data[offset++] = a;
    data[offset++] = x2; data[offset++] = y2; data[offset++] = u1; data[offset++] = v1; data[offset++] = r; data[offset++] = g; data[offset++] = b; data[offset++] = a;
    data[offset++] = x3; data[offset++] = y3; data[offset++] = u0; data[offset++] = v1; data[offset++] = r; data[offset++] = g; data[offset++] = b; data[offset++] = a;
    return offset;
  }

  function flushRender() {
    if (!render.ready) {
      if (gl) initRenderer();
      if (!render.ready) {
        render.lastQueueLength = render.queue.length;
        render.lastBatchCount = 0;
        return;
      }
    }
    const w = canvas.width;
    const h = canvas.height;
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.0078431373, 0.0156862745, 0.0392156863, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawStarfieldGPU();
    gl.useProgram(render.program);
    gl.uniform2f(render.uViewport, w, h);
    gl.bindBuffer(gl.ARRAY_BUFFER, render.buffer);
    if (render.queueNeedsSort) render.queue.sort(function (a, b) { return a.layer === b.layer ? a.order - b.order : a.layer - b.layer; });
    render.lastQueueLength = render.queue.length;
    const data = ensureBatchData(render.queue.length);
    let batchTex = null;
    let batchSprites = 0;
    let batchOffset = 0;
    let batchBlend = 'normal';
    let batchCount = 0;
    function applyBlend(mode) {
      if (mode === 'additive') gl.blendFunc(gl.ONE, gl.ONE);
      else if (mode === 'erase') gl.blendFuncSeparate(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);
      else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
    function flushBatch() {
      if (!batchSprites) return;
      applyBlend(batchBlend);
      gl.bindTexture(gl.TEXTURE_2D, batchTex || render.white);
      gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, batchOffset), gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, batchSprites * 6);
      batchCount++;
      batchSprites = 0;
      batchOffset = 0;
    }
    for (let i = 0; i < render.queue.length; i++) {
      const s = render.queue[i];
      const tex = s.texture || render.white;
      const blend = s.blend || 'normal';
      if (batchSprites && (tex !== batchTex || blend !== batchBlend)) flushBatch();
      batchTex = tex;
      batchBlend = blend;
      batchOffset = appendSpriteQuad(data, batchOffset, s);
      batchSprites++;
    }
    flushBatch();
    render.queue.length = 0;
    render.seq = 0;
    render.queueNeedsSort = false;
    render.lastQueuedLayer = 0;
    render.lastBatchCount = batchCount;
    render.normal.length = 0;
    render.additive.length = 0;
    render.erase.length = 0;
  }

  function phase(dur, motion, attack) { return { dur: dur, motion: motion, attack: attack }; }
  function theme(cfg) {
    if (cfg && cfg.boss && cfg.boss.size == null) cfg.boss.size = 512;
    return cfg;
  }

  const THEMES = [
    theme({ name: 'Thorium Rift', subtitle: 'None shall pass', skyTop: '#07111f', skyBottom: '#274062', glow: '#9bc5ff', accent: '#6d9cff', accent2: '#d5e4ff', forms: ['line', 'fan', 'rain'], enemyKinds: ['drifter', 'swarm', 'looper'], atmosphere: 'leaves', music: { bpm: 112, root: 220, pattern: [0, 3, 5, 7, 10, 7, 5, 3] }, boss: { name: 'Red Guardian', emoji: E.apple, hp: 400, size: 320, color: '#9ec2ff', flipWhenMovingRight: false, phases: [phase(7, 'hover', 'aimed'), phase(7, 'sweep', 'rain'), phase(8, 'low', 'ring')] } }),
    theme({ name: 'Broken Shore', subtitle: 'First of his name', skyTop: '#061b1b', skyBottom: '#1f4d49', glow: '#8ff7ff', accent: '#58d7c6', accent2: '#c8fff2', forms: ['swarm', 'pair', 'arc'], enemyKinds: ['looper', 'bomber', 'sniper'], atmosphere: 'pollen', music: { bpm: 126, root: 246, pattern: [0, 2, 4, 7, 9, 7, 4, 2] }, boss: { name: 'Rocket Baron', emoji: E.bee, hp: 500, size: 320, color: '#93f0e8', flipWhenMovingRight: true, phases: [phase(7, 'hover', 'fan'), phase(7.5, 'sweep', 'summon'), phase(8, 'low', 'ring')] } }),
    theme({ name: 'Ultraviolet Prison', subtitle: 'Isolation and servitude', skyTop: '#1b1730', skyBottom: '#53265f', glow: '#d19cff', accent: '#9a7cff', accent2: '#f0d0ff', forms: ['fan', 'rain', 'cross'], enemyKinds: ['drifter', 'looper', 'bomber'], atmosphere: 'sprinkles', music: { bpm: 136, root: 262, pattern: [0, 4, 7, 12, 7, 4, 5, 9] }, boss: { name: 'Warden Thorn', emoji: E.donut, hp: 600, size:320 , color: '#c29bff', flipWhenMovingRight: false, phases: [phase(7, 'hover', 'fan'), phase(7, 'sweep', 'ring'), phase(8, 'low', 'rain')] } }),
    theme({ name: 'Sinners Den', subtitle: 'Hunger without limit', skyTop: '#0f1620', skyBottom: '#4d5867', glow: '#96c9ff', accent: '#9fb2c6', accent2: '#d0e0ef', forms: ['line', 'pair', 'cross'], enemyKinds: ['looper', 'sniper', 'bomber'], atmosphere: 'sparks', music: { bpm: 118, root: 196, pattern: [0, 0, 7, 5, 4, 5, 7, 10] }, boss: { name: 'Hope Devourer', emoji: E.gear, hp: 700, size: 400, color: '#d0d9e1', flipWhenMovingRight: false, phases: [phase(7, 'sweep', 'ring'), phase(7.5, 'dash', 'summon'), phase(8, 'hover', 'fan')] } }),
    theme({ name: 'Deadlight Harbor', subtitle: 'Master of the soulless crew', skyTop: '#06111d', skyBottom: '#532a40', glow: '#ffbf8a', accent: '#e0a06c', accent2: '#ffc8a1', forms: ['rain', 'arc', 'swarm'], enemyKinds: ['swarm', 'sniper', 'drifter'], atmosphere: 'motes', music: { bpm: 108, root: 196, pattern: [0, 5, 7, 10, 7, 5, 3, 5] }, boss: { name: 'Captain Thaddeus', emoji: E.lantern, hp: 900, size: 400, color: '#f6b46d', flipWhenMovingRight: true, phases: [phase(7, 'hover', 'aimed'), phase(7.5, 'sweep', 'beam'), phase(8, 'low', 'ring')] } }),
    theme({ name: 'Elysium Sea', subtitle: 'The steed of Neptune', skyTop: '#220c0c', skyBottom: '#6d3a13', glow: '#ffd77a', accent: '#c47a19', accent2: '#ffd59f', forms: ['swarm', 'fan', 'pair'], enemyKinds: ['diver', 'swarm', 'sniper'], atmosphere: 'embers', music: { bpm: 132, root: 246, pattern: [0, 2, 3, 7, 10, 7, 3, 2] }, boss: { name: 'Lunar Horse', emoji: E.bee, hp: 1100, size: 400, color: '#e4ba6a', flipWhenMovingRight: true, phases: [phase(7, 'hover', 'fan'), phase(8, 'dash', 'rain'), phase(7.5, 'sweep', 'summon')] } }),
    theme({ name: 'Shard Expanse', subtitle: 'The base of lost hope', skyTop: '#07142f', skyBottom: '#264e88', glow: '#b0fbff', accent: '#95d5ff', accent2: '#d6c4ff', forms: ['ring', 'line', 'arc'], enemyKinds: ['swarm', 'bomber', 'elite', 'looper'], atmosphere: 'shards', music: { bpm: 120, root: 233, pattern: [0, 4, 7, 11, 7, 4, 9, 7] }, boss: { name: 'Shard Base One', emoji: E.gem, hp: 1400, size: 400, color: '#c9f6ff', flipWhenMovingRight: false, phases: [phase(7, 'hover', 'fan'), phase(7.5, 'sweep', 'ring'), phase(8, 'low', 'beam')] } }),
    theme({ name: 'Dark Waters', subtitle: 'Prey on the weak', skyTop: '#180709', skyBottom: '#6c2919', glow: '#ffab5b', accent: '#de6f2b', accent2: '#ffd08a', forms: ['rain', 'line', 'swarm'], enemyKinds: ['spinner', 'drifter', 'diver', 'splitter'], atmosphere: 'embers', music: { bpm: 140, root: 220, pattern: [0, 3, 7, 10, 7, 3, 5, 10] }, boss: { name: 'Cephid Hunter', emoji: E.fire, hp: 1800, size: 400, color: '#ff9e53', flipWhenMovingRight: true, phases: [phase(7, 'hover', 'rain'), phase(7.5, 'sweep', 'beam'), phase(8, 'low', 'wall')] } }),
    theme({ name: 'Domain of Klaatu', subtitle: 'The earth stands still', skyTop: '#07111d', skyBottom: '#2d3d61', glow: '#95d7ff', accent: '#aebfe0', accent2: '#95d7ff', forms: ['line', 'wave', 'pair'], enemyKinds: ['elite', 'diver', 'splitter' ], atmosphere: 'stardust', music: { bpm: 106, root: 185, pattern: [0, 7, 12, 7, 10, 7, 5, 3] }, boss: { name: 'Klaatu', emoji: E.moon, hp: 2300, size: 400, color: '#c3d6ff', flipWhenMovingRight: false, phases: [phase(7, 'hover', 'summon'), phase(7.5, 'dash', 'beam'), phase(8, 'sweep', 'ring')] } }),
    theme({ name: 'Sunken Bastion', subtitle: 'Here drowned men weep', skyTop: '#07101c', skyBottom: '#2d1a5a', glow: '#82f6ff', accent: '#6eeaff', accent2: '#c8fff2', forms: ['wave', 'cross', 'pair'], enemyKinds: ['looper', 'spinner', 'swarm', 'bomber'], atmosphere: 'neon', music: { bpm: 144, root: 220, pattern: [0, 7, 12, 10, 7, 4, 9, 12] }, boss: { name: 'Cyberphish', emoji: E.bolt, hp: 3000, size: 400, color: '#8fefff', flipWhenMovingRight: true, phases: [phase(7, 'sweep', 'wall'), phase(7.5, 'dash', 'aimed'), phase(8, 'hover', 'ring')] } }),
    theme({ name: 'Black Citadel', subtitle: 'When the hearts break', skyTop: '#0a0c14', skyBottom: '#403f55', glow: '#f0f3ff', accent: '#b6bfd6', accent2: '#9e8e5e', forms: ['line', 'cross', 'wave'], enemyKinds: ['looper', 'sniper', 'elite'], atmosphere: 'chess', music: { bpm: 122, root: 196, pattern: [0, 3, 7, 10, 7, 3, 5, 7] }, boss: { name: 'Purple Matron', emoji: E.queen, hp: 3900, size: 400, color: '#e7ecff', flipWhenMovingRight: false, phases: [phase(7, 'hover', 'aimed'), phase(7.5, 'dash', 'summon'), phase(8, 'sweep', 'ring')] } }),
    theme({ name: 'Crushing Depths', subtitle: 'Hunger for sunlight', skyTop: '#0c1821', skyBottom: '#344c84', glow: '#d7f4ff', accent: '#9cc7ff', accent2: '#d7f4ff', forms: ['rain', 'line', 'swarm'], enemyKinds:  ['spinner', 'diver', 'swarm', 'looper'], atmosphere: 'rain', music: { bpm: 128, root: 196, pattern: [0, 4, 7, 10, 7, 4, 2, 5] }, boss: { name: 'Deep Gulper', emoji: E.cloud, hp: 5100, size: 400, color: '#d3edff', flipWhenMovingRight: true, phases: [phase(7, 'hover', 'fan'), phase(7.5, 'sweep', 'rain'), phase(8, 'low', 'ring')] } }),
    theme({ name: 'Thorium Gap', subtitle: 'Final Descent', skyTop: '#0f081b', skyBottom: '#5b3d18', glow: '#ffe78a', accent: '#ffd77a', accent2: '#ffffff', forms: ['ring', 'fan', 'wave'], enemyKinds: ['elite', 'sniper', 'spinner', 'looper'], atmosphere: 'nova', music: { bpm: 152, root: 262, pattern: [0, 4, 7, 12, 15, 12, 7, 4] }, boss: { name: 'Unnamed Horror', emoji: E.sun, hp: 10000, size: 512, color: '#fff0bd', flipWhenMovingRight: false, phases: [phase(6.5, 'hover', 'aimed'), phase(6.5, 'sweep', 'ring'), phase(6.5, 'low', 'summon'), phase(6.5, 'dash', 'beam'), phase(7.5, 'low', 'wall')] } })
  ];

  const FINAL_LEVEL_ENEMY_KINDS = (function () {
    const kinds = [];
    const seen = Object.create(null);
    for (let i = 0; i < THEMES.length - 1; i++) {
      const list = THEMES[i] && Array.isArray(THEMES[i].enemyKinds) ? THEMES[i].enemyKinds : [];
      for (let j = 0; j < list.length; j++) {
        const kind = list[j];
        if (seen[kind]) continue;
        seen[kind] = true;
        kinds.push(kind);
      }
    }
    return kinds.length ? kinds : ['drifter'];
  }());

  function waveEnemyKinds(theme) {
    if (state.levelIndex >= THEMES.length - 1) return FINAL_LEVEL_ENEMY_KINDS;
    return theme && Array.isArray(theme.enemyKinds) && theme.enemyKinds.length ? theme.enemyKinds : ['drifter'];
  }

  const WEAPONS = [
    { name: 'DART', color: '#00ffff' },
    { name: 'TWIN', color: '#00ff00' },
    { name: 'FAN', color: '#ffFF00' },
    { name: 'ROCKET', color: '#0000ff' },
    { name: 'BEAM', color: '#ff2e2e' }
  ];
  const WEAPON_PICKUP_WEIGHTS = [
    5,
    5,
    2.5,
    5,
    5
  ];
  const WEAPON_TIER_LABELS = ['I', 'II', 'III', 'IIII', 'V'];

  const PICKUPS = {
    weapon: { emoji: E.wrench, color: '#00ffff', lighter: true, glowDiameter: 32 },
    rapid: { emoji: E.bolt, color: '#ff7000', lighter: true, glowDiameter: 32 },
    shield: { emoji: E.shield, color: '#4040ff', lighter: false, glowDiameter: 64 },
    bomb: { emoji: E.bomb, color: '#ff2020', lighter: true, glowDiameter: 50 },
    magnet: { emoji: E.magnet, color: '#777777', lighter: true, glowDiameter: 32 },
    invuln: { emoji: E.star, color: '#ffff00', lighter: true, glowDiameter: 32 },
    score: { emoji: E.gem, color: '#f00000', lighter: false, glowDiameter: 50 }
  };

  const ENEMIES = {
    drifter: { hp: 4, r: 18, score: 90, speed: 96 },
    looper: { hp: 5, r: 18, score: 110, speed: 112 },
    swarm: { hp: 2, r: 14, score: 75, speed: 140 },
    bomber: { hp: 7, r: 20, score: 140, speed: 86 },
    sniper: { hp: 6, r: 18, score: 130, speed: 74 },
    spinner: { hp: 7, r: 22, score: 180, speed: 70 },
    splitter: { hp: 7, r: 20, score: 150, speed: 92 },
    diver: { hp: 6, r: 18, score: 130, speed: 120 },
    mine: { hp: 8, r: 19, score: 120, speed: 60 },
    elite: { hp: 15, r: 24, score: 280, speed: 80 }
  };

  const DIFFICULTIES = [                                                                      // Hint: bulletSpeed = enemyShotPace maintains gap-dynamics of shots (just faster)
    { label: 'Easy', lives: 5, enemyHp: 1.0, enemySpeed: 0.9, spawnRate: 0.9, spawnCount: 0.8, bulletSpeed: 1.0, bossHp: 0.5, contact: 0.9, playerDamage: 1, enemyShotPace: 1.0 },
    { label: 'Normal', lives: 3, enemyHp: 1.2, enemySpeed: 1, spawnRate: 1, spawnCount: 0.9, bulletSpeed: 1.5, bossHp: 1, contact: 1, playerDamage: 0.5, enemyShotPace: 1.5 },
    { label: 'Hard', lives: 2, enemyHp: 1.4, enemySpeed: 1.2, spawnRate: 1.1, spawnCount: 1.1, bulletSpeed: 2.0, bossHp: 1.3, contact: 1.12, playerDamage: 0.25, enemyShotPace: 2.0 }
  ];

  const PLAYER_SHOT_PACE = 1.0;
  const PLAYER_FIRE_RATE_BOOST = 1.0;
  const PLAYER_RADIUS = 46;
  const HEAT_MAX_SECONDS = 5;
  const HEAT_MAX_PENALTY = 0.5;
  const HEAT_COOLDOWN_FACTOR = 5;

  function enemyShotPace() {
    const diff = currentDifficulty();
    return (diff && typeof diff.enemyShotPace === 'number') ? diff.enemyShotPace : 1.0;
  }

  function shotDelay(v) {
    return v * enemyShotPace() * (1.0 + state.levelIndex * 0.2);
  }

  const state = {
    mode: 'title',
    paused: false,
    muted: false,
    settingsOpen: false,
    settingsPausedByDialog: false,
    levelIndex: 0,
    score: 0,
    highScore: loadNum('ThroriumGap_highScore', 0),
    settings: {
      sfxVolume: clamp(loadNum('ThroriumGap_sfxVolume', 0.8), 0, 1),
      musicVolume: clamp(loadNum('ThroriumGap_musicVolume', 0), 0, 1),
      difficulty: clamp(Math.round(loadNum('ThroriumGap_difficulty', 0)), 0, 2),
      lowEndMode: loadBool('ThroriumGap_lowEndMode', false),
      alwaysFollowMouse: loadBool('ThroriumGap_alwaysFollowMouse', false),
      starfieldCap: clamp(Math.round(loadNum('ThroriumGap_starfieldCap', STARFIELD_DEFAULT_CAP)), STARFIELD_LOW_END_CAP, STARFIELD_DEFAULT_CAP)
    },
    lives: 3,
    combo: 0,
    comboTimer: 0,
    overdrive: 0,
    banner: '',
    bannerSub: '',
    bannerTimer: 0,
    flash: 0,
    shake: 0,
    endScreenReadyAt: 0,
    lastDeathReason: '',
    lastHitInfo: null,
    debugLog: loadDebugLog(),
    debugDamageBreakpoints: false,
    assetsReady: false,
    assetsLoading: false,
    assetsWarmupPromise: null,
    nextLevelTimer: 0,
    waveClock: 0,
    waveIndex: 0,
    levelClock: 0,
    background: [],
    foreground: [],
    backgroundBitmap: null,
    foregroundBitmap: null,
    backgroundSeed: 0,
    foregroundSeed: 0,
    decorBackgrounds: null,
    decorBackgroundTick: 0,
    starfield: [],
    starfieldScroll: 0,
    scrollingClouds: null,
    fps: 0,
    fpsAvg: 60,
    starfieldCapSum: 0,
    starfieldCapSamples: 0,
    starfieldCapPending: null,
    projectileClearVersion: 0,
    collisionQueryId: 0,
    enemies: [],
    bullets: [],
    enemyBullets: [],
    projectilePool: [],
    pickups: [],
    particles: [],
    particlePool: [],
    enemyShipKindMap: null,
    boss: null,
    currentTheme: THEMES[0],
    transition: null,
    player: {
      x: 0, y: 0, vx: 0, vy: 0, r: PLAYER_RADIUS,
      health: 6, maxHealth: 6,
      shield: 0, bombs: 2,
      weaponMode: 0, weaponTier: 1,
      weaponTiers: Array(WEAPONS.length).fill(1),
      fireCooldown: 0, rapidTimer: 0, magnetTimer: 0,
      heat: 0,
      invuln: 0, repairDelay: 0, fireHeld: false, pointerMode: false,
      respawnTimer: 0, respawnDuration: 0,
      respawnStartX: 0, respawnStartY: 0,
      respawnTargetX: 0, respawnTargetY: 0
    },
    input: { left: false, right: false, up: false, down: false, fire: false, moveX: 0, moveY: 0 },
    gamepad: { index: -1, prevFire: false, prevBomb: false, prevMenu: false, fireHeld: false, bombHeld: false, joyX: 0, joyY: 0 },
    pointerActive: false,
    pointerId: null,
    pointerX: 0,
    pointerY: 0,
    mouseButtons: 0,
    musicClock: 0,
    musicStep: 0,
    animClock: 0,
    renderFrameIndex: 0,
    hudDirty: true,
    hudLastDraw: 0,
    debugMode: DEBUG_MODE
  };

  if (!gl) state.settings.lowEndMode = true;

  function markHudDirty() {
    state.hudDirty = true;
  }

  function getFxQuality() {
    return state.settings.lowEndMode ? 0.45 : 1.0;
  }

  function getGlowRadiusScale() {
    return state.settings.lowEndMode ? 0.55 : 1.0;
  }

  function getParticleBudgetScale() {
    return state.settings.lowEndMode ? 0.35 : 1.0;
  }

  const audio = {
    ctx: null,
    master: null,
    sfx: null,
    music: null,
    noise: null,
    enabled: false,
    resumePromise: null
  };

  function ensureAudio() {
    if (audio.ctx) return audio.ctx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audio.ctx = new Ctx();
    audio.master = audio.ctx.createGain();
    audio.master.gain.value = 0.92;
    audio.master.connect(audio.ctx.destination);
    audio.sfx = audio.ctx.createGain();
    audio.sfx.connect(audio.master);
    audio.music = audio.ctx.createGain();
    audio.music.connect(audio.master);
    const len = Math.max(1, Math.floor(audio.ctx.sampleRate * 0.35));
    const buf = audio.ctx.createBuffer(1, len, audio.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    audio.noise = buf;
    return audio.ctx;
  }

  function resumeAudio() {
    const ctxAudio = ensureAudio();
    if (!ctxAudio) return;
    if (ctxAudio.state === 'running') {
      audio.enabled = true;
      applyMute();
      return;
    }
    if (audio.resumePromise) return;
    audio.resumePromise = ctxAudio.resume().then(function () {
      audio.enabled = ctxAudio.state === 'running';
      applyMute();
    }).catch(function () {
      audio.enabled = false;
    }).finally(function () {
      audio.resumePromise = null;
    });
  }

  function applyMute() {
    if (!audio.master) return;
    audio.master.gain.value = 0.92;
    audio.sfx.gain.value = state.muted ? 0 : state.settings.sfxVolume;
    audio.music.gain.value = state.muted ? 0 : state.settings.musicVolume;
  }

  function triggerRumble(strength, duration) {
    if (state.settings && state.settings.alwaysFollowMouse) return;
    const pads = navigator.getGamepads ? navigator.getGamepads() : null;
    const pad = pads && state.gamepad.index >= 0 ? pads[state.gamepad.index] : null;
    const dur = Math.max(20, duration || 120);
    const mag = clamp(strength || 0.5, 0, 1);
    if (pad && pad.vibrationActuator && pad.vibrationActuator.playEffect) {
      pad.vibrationActuator.playEffect('dual-rumble', {
        duration: dur,
        strongMagnitude: mag,
        weakMagnitude: mag
      }).catch(function () {});
      return;
    }
    if (navigator.vibrate) navigator.vibrate(dur);
  }

  function tone(opts) {
    const ctxAudio = audio.ctx;
    if (!ctxAudio || ctxAudio.state !== 'running' || state.muted) return;
    const bus = opts && opts.bus === 'music' ? audio.music : audio.sfx;
    const now = ctxAudio.currentTime;
    const osc = ctxAudio.createOscillator();
    const gain = ctxAudio.createGain();
    const pan = ctxAudio.createStereoPanner ? ctxAudio.createStereoPanner() : null;
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(opts.freq || 440, now);
    if (opts.endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.endFreq), now + (opts.dur || 0.2));
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, opts.gain || 0.1), now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (opts.dur || 0.2));
    osc.connect(gain);
    if (pan) { pan.pan.value = clamp(opts.pan || 0, -1, 1); gain.connect(pan); pan.connect(bus || audio.master); }
    else gain.connect(bus || audio.master);
    osc.start(now);
    osc.stop(now + (opts.dur || 0.2) + 0.02);
  }

  function noise(opts) {
    const ctxAudio = audio.ctx;
    if (!ctxAudio || ctxAudio.state !== 'running' || state.muted) return;
    const bus = opts && opts.bus === 'music' ? audio.music : audio.sfx;
    const now = ctxAudio.currentTime;
    const source = ctxAudio.createBufferSource();
    const filter = ctxAudio.createBiquadFilter();
    const gain = ctxAudio.createGain();
    const pan = ctxAudio.createStereoPanner ? ctxAudio.createStereoPanner() : null;
    source.buffer = audio.noise;
    source.loop = true;
    filter.type = opts.filterType || 'bandpass';
    filter.frequency.value = opts.cutoff || 900;
    filter.Q.value = opts.q || 0.8;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, opts.gain || 0.15), now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (opts.dur || 0.2));
    source.connect(filter);
    filter.connect(gain);
    if (pan) { pan.pan.value = clamp(opts.pan || 0, -1, 1); gain.connect(pan); pan.connect(bus || audio.master); }
    else gain.connect(bus || audio.master);
    source.start(now);
    source.stop(now + (opts.dur || 0.2) + 0.02);
  }

  function sfx(name) {
    if (name === 'shoot') tone({ freq: 420, endFreq: 520, dur: 0.05, gain: 0.045, type: 'triangle' });
    else if (name === 'fan') { tone({ freq: 520, endFreq: 420, dur: 0.06, gain: 0.05, type: 'triangle', pan: -0.12 }); tone({ freq: 760, endFreq: 620, dur: 0.05, gain: 0.045, type: 'triangle', pan: 0.12 }); }
    else if (name === 'rocket') { tone({ freq: 180, endFreq: 98, dur: 0.16, gain: 0.08, type: 'sawtooth' }); noise({ dur: 0.12, gain: 0.04, cutoff: 600, q: 0.7 }); }
    else if (name === 'beam') { tone({ freq: 720, endFreq: 560, dur: 0.08, gain: 0.08, type: 'square' }); tone({ freq: 960, endFreq: 720, dur: 0.06, gain: 0.035, type: 'triangle' }); }
    else if (name === 'hit') { noise({ dur: 0.055, gain: 0.032, cutoff: 3600, q: 0.2 }); tone({ freq: 250, endFreq: 92, dur: 0.075, gain: 0.05, type: 'square' }); noise({ dur: 0.018, gain: 0.012, cutoff: 1800, q: 0.45 }); }
    else if (name === 'boom') { noise({ dur: 0.8, gain: 0.7, cutoff: 20, q: 0.18 }); tone({ freq: 170, endFreq: 54, dur: 0.22, gain: 0.11, type: 'sawtooth' }); noise({ dur: 0.03, gain: 0.018, cutoff: 1800, q: 0.45 }); }
    else if (name === 'power') { tone({ freq: 440, endFreq: 660, dur: 0.08, gain: 0.06, type: 'triangle', pan: -0.12 }); tone({ freq: 660, endFreq: 990, dur: 0.08, gain: 0.05, type: 'triangle', pan: 0.12 }); tone({ freq: 880, endFreq: 1320, dur: 0.1, gain: 0.04, type: 'sine' }); }
    else if (name === 'bomb') { noise({ dur: 0.32, gain: 0.16, cutoff: 420, q: 0.8 }); tone({ freq: 88, endFreq: 38, dur: 0.32, gain: 0.18, type: 'sawtooth' }); }
    else if (name === 'boss') { tone({ freq: 130, endFreq: 72, dur: 0.5, gain: 0.16, type: 'sawtooth' }); noise({ dur: 0.34, gain: 0.11, cutoff: 520, q: 0.8 }); }
    else if (name === 'spawn') { noise({ dur: 0.03, gain: 0.02, cutoff: 2600, q: 0.25 }); tone({ freq: 340, endFreq: 460, dur: 0.03, gain: 0.022, type: 'triangle' }); }
    else if (name === 'clear') { tone({ freq: 392, endFreq: 523, dur: 0.13, gain: 0.06, type: 'triangle' }); tone({ freq: 523, endFreq: 784, dur: 0.13, gain: 0.06, type: 'triangle' }); tone({ freq: 659, endFreq: 988, dur: 0.15, gain: 0.05, type: 'triangle' }); }
    else if (name === 'damage') tone({ freq: 98, endFreq: 62, dur: 0.12, gain: 0.09, type: 'square' });
    else if (name === 'combo') tone({ freq: 560, endFreq: 880, dur: 0.08, gain: 0.06, type: 'triangle' });
    else if (name === 'overdrive') { tone({ freq: 660, endFreq: 1320, dur: 0.18, gain: 0.1, type: 'triangle' }); tone({ freq: 990, endFreq: 1760, dur: 0.12, gain: 0.07, type: 'square' }); }
  }

  const game = {
    ...state,
    // populated in later chunks
  };

  function setBanner(title, sub, time) {
    state.banner = title || '';
    state.bannerSub = sub || '';
    state.bannerTimer = time == null ? 2.5 : time;
    markHudDirty();
  }

  function hint(text, seconds) {
    hudHint.textContent = text;
    hudHint.classList.add('show');
    clearTimeout(hint._timer);
    hint._timer = setTimeout(function () { hudHint.classList.remove('show'); }, Math.max(300, (seconds || 2.4) * 1000));
  }

  function currentDifficulty() {
    return DIFFICULTIES[clamp(state.settings.difficulty, 0, DIFFICULTIES.length - 1)] || DIFFICULTIES[0];
  }

  function saveSettings() {
    saveNum('ThroriumGap_sfxVolume', state.settings.sfxVolume);
    saveNum('ThroriumGap_musicVolume', state.settings.musicVolume);
    saveNum('ThroriumGap_difficulty', state.settings.difficulty);
    saveBool('ThroriumGap_lowEndMode', state.settings.lowEndMode);
    saveBool('ThroriumGap_alwaysFollowMouse', state.settings.alwaysFollowMouse);
    saveNum('ThroriumGap_starfieldCap', state.settings.starfieldCap);
    saveNum('ThroriumGap_highScore', state.highScore);
  }

  function syncSettingsUi() {
    if (sfxVolumeInput) sfxVolumeInput.value = String(state.settings.sfxVolume);
    if (musicVolumeInput) musicVolumeInput.value = String(state.settings.musicVolume);
    if (sfxVolumeValue) sfxVolumeValue.textContent = Math.round(state.settings.sfxVolume * 100) + '%';
    if (musicVolumeValue) musicVolumeValue.textContent = Math.round(state.settings.musicVolume * 100) + '%';
    if (difficultyValue) difficultyValue.textContent = currentDifficulty().label;
    const difficultyLocked = state.mode === 'playing';
    if (lowEndModeInput) {
      lowEndModeInput.checked = !!state.settings.lowEndMode;
      lowEndModeInput.disabled = !gl;
    }
    if (alwaysFollowMouseInput) alwaysFollowMouseInput.checked = !!state.settings.alwaysFollowMouse;
    for (let i = 0; i < difficultyButtons.length; i++) {
      const btn = difficultyButtons[i];
      const idx = Number(btn.getAttribute('data-difficulty'));
      btn.setAttribute('aria-pressed', String(idx === state.settings.difficulty));
      btn.disabled = difficultyLocked;
    }
    const soundBtn = controlsEl.querySelector('[data-act="sound"]');
    if (soundBtn) soundBtn.textContent = state.muted ? 'MUTED' : 'SOUND';
    applyMute();
  }

  function setVolume(kind, value) {
    const key = kind === 'music' ? 'musicVolume' : 'sfxVolume';
    state.settings[key] = clamp(Number(value), 0, 1);
    saveSettings();
    syncSettingsUi();
  }

  function setDifficulty(index) {
    state.settings.difficulty = clamp(index | 0, 0, DIFFICULTIES.length - 1);
    saveSettings();
    syncSettingsUi();
    const diff = currentDifficulty();
    if (state.mode === 'title') {
      setBanner('DIFFICULTY', diff.label, 1.2);
      hint('Difficulty set to ' + diff.label + '.', 1.4);
    } else {
      hint('Difficulty set to ' + diff.label + '. It affects new waves immediately.', 2.2);
    }
  }

  function setLowEndMode(enabled) {
    state.settings.lowEndMode = !!enabled;
    if (state.settings.lowEndMode) clearScrollingClouds();
    saveSettings();
    syncSettingsUi();
    window.dispatchEvent(new Event('resize'));
    hint(enabled ? 'Low end mode enabled.' : 'Low end mode disabled.', 1.6);
  }

  function setAlwaysFollowMouse(enabled) {
    state.settings.alwaysFollowMouse = !!enabled;
    if (state.settings.alwaysFollowMouse) {
      state.gamepad.prevFire = false;
      state.gamepad.prevBomb = false;
      state.gamepad.prevMenu = false;
      state.gamepad.fireHeld = false;
      state.gamepad.bombHeld = false;
      state.gamepad.joyX = 0;
      state.gamepad.joyY = 0;
      state.input.moveX = 0;
      state.input.moveY = 0;
    }
    saveSettings();
    syncSettingsUi();
    hint(enabled ? 'Ship will follow mouse without right hold.' : 'Ship follow mouse now requires right hold.', 1.8);
  }

  function debugGiveWeapon(name, tier) {
    const idx = WEAPONS.findIndex(function (w) { return w.name === String(name).toUpperCase(); });
    if (idx < 0) return false;
    const p = state.player;
    if (!Array.isArray(p.weaponTiers) || p.weaponTiers.length !== WEAPONS.length) p.weaponTiers = Array(WEAPONS.length).fill(1);
    p.weaponMode = idx;
    p.weaponTiers[idx] = clamp(Number.isFinite(tier) ? tier : 5, 1, 5);
    p.weaponTier = p.weaponTiers[idx];
    state.banner = WEAPONS[idx].name + ' ' + WEAPON_TIER_LABELS[p.weaponTier - 1];
    state.bannerSub = 'Debug weapon grant.';
    state.bannerTimer = 1.2;
    return true;
  }

  function openSettings() {
    if (state.settingsOpen) return;
    state.settingsOpen = true;
    state.settingsPausedByDialog = state.mode === 'playing' && !state.paused;
    if (state.settingsPausedByDialog) togglePause(true);
    syncSettingsUi();
    if (settingsDialog.showModal && !settingsDialog.open) settingsDialog.showModal();
    else settingsDialog.setAttribute('open', '');
  }

  function closeSettings() {
    if (!state.settingsOpen && !settingsDialog.open) return;
    state.settingsOpen = false;
    if (settingsDialog.open) settingsDialog.close();
    else settingsDialog.removeAttribute('open');
    if (state.settingsPausedByDialog) {
      state.settingsPausedByDialog = false;
      togglePause(false);
    }
    syncSettingsUi();
  }

  function toggleSettings() {
    if (!settingsDialog.open) openSettings();
  }

  function syncTitleManualButton() {
    if (!titleManualButton) return;
    const loading = !state.assetsReady || state.assetsLoading || assetWarmupBusy();
    titleManualButton.classList.toggle('show', state.mode === 'title' && !loading);
  }

  function syncBodyModeClass() {
    document.body.classList.toggle('playing', state.mode === 'playing' && !state.settingsOpen && !settingsDialog.open);
  }

  function updateGamepadInput() {
    if (state.settings.alwaysFollowMouse) {
      state.gamepad.prevFire = false;
      state.gamepad.prevBomb = false;
      state.gamepad.prevMenu = false;
      state.gamepad.fireHeld = false;
      state.gamepad.bombHeld = false;
      state.gamepad.joyX = 0;
      state.gamepad.joyY = 0;
      state.input.moveX = 0;
      state.input.moveY = 0;
      return;
    }
    const pads = navigator.getGamepads ? navigator.getGamepads() : null;
    const p = state.player;
    let pad = null;
    if (pads) {
      if (state.gamepad.index >= 0 && pads[state.gamepad.index] && pads[state.gamepad.index].connected) pad = pads[state.gamepad.index];
      else {
        for (let i = 0; i < pads.length; i++) {
          if (pads[i] && pads[i].connected) {
            state.gamepad.index = i;
            pad = pads[i];
            break;
          }
        }
      }
    }
    if (!pad) {
      state.gamepad.index = -1;
      state.gamepad.prevFire = false;
      state.gamepad.prevBomb = false;
      state.gamepad.prevMenu = false;
      state.gamepad.fireHeld = false;
      state.gamepad.bombHeld = false;
      state.gamepad.joyX = 0;
      state.gamepad.joyY = 0;
      state.input.moveX = 0;
      state.input.moveY = 0;
      return;
    }
    const deadzone = 0.125;
    const fullTilt = 0.75;
    const straightCleanup = 0.06;
    const lx = pad.axes && pad.axes.length > 0 ? pad.axes[0] : 0;
    const ly = pad.axes && pad.axes.length > 1 ? pad.axes[1] : 0;
    const rx = pad.axes && pad.axes.length > 2 ? pad.axes[2] : 0;
    const ry = pad.axes && pad.axes.length > 3 ? pad.axes[3] : 0;
    const useRightStick = (rx * rx + ry * ry) > (lx * lx + ly * ly);
    const rawX = useRightStick ? rx : lx;
    const rawY = useRightStick ? ry : ly;

    function scaleStickAxis(value) {
      const sign = value < 0 ? -1 : 1;
      const amount = Math.abs(value);
      if (amount <= deadzone) return 0;
      return sign * Math.max(0, (amount - deadzone) / (fullTilt - deadzone));
    }

    let moveX = scaleStickAxis(rawX);
    let moveY = scaleStickAxis(rawY);
    const absRawX = Math.abs(rawX);
    const absRawY = Math.abs(rawY);
    if (moveX && moveY) {
      if (absRawX > absRawY * 2.2 && Math.abs(moveY) < straightCleanup) moveY = 0;
      else if (absRawY > absRawX * 2.2 && Math.abs(moveX) < straightCleanup) moveX = 0;
    }

    state.gamepad.joyX = Math.abs(rawX) < 0.005 ? 0 : rawX;
    state.gamepad.joyY = Math.abs(rawY) < 0.005 ? 0 : rawY;
    state.input.moveX = moveX;
    state.input.moveY = moveY;

    if (p.pointerMode || state.pointerActive) {
      state.input.moveX = 0;
      state.input.moveY = 0;
    }
    const buttons = pad.buttons || [];
    const aDown = !!(buttons[0] && buttons[0].pressed);
    const bDown = !!(buttons[1] && buttons[1].pressed);
    const selectDown = !!(buttons[8] && buttons[8].pressed);
    const startDown = !!(buttons[9] && buttons[9].pressed);
    const ltDown = !!(buttons[6] && buttons[6].value > 0.45);
    const rtDown = !!(buttons[7] && buttons[7].value > 0.45);
    const fireDown = aDown || rtDown;
    const bombDown = bDown || ltDown;
    const menuDown = selectDown || startDown;
    state.gamepad.fireHeld = fireDown;
    state.gamepad.bombHeld = bombDown;
    if (menuDown && !state.gamepad.prevMenu) toggleSettings();
    if (fireDown && !state.gamepad.prevFire) {
      if (state.mode === 'title') startGame();
      else if (state.mode === 'gameover' || state.mode === 'victory') endScreenContinue();
    }
    if (bombDown && !state.gamepad.prevBomb) {
      if (state.mode === 'title') startGame();
      else if (state.mode === 'gameover' || state.mode === 'victory') endScreenContinue();
      else if (state.mode === 'playing') useBomb();
    }
    state.gamepad.prevFire = fireDown;
    state.gamepad.prevBomb = bombDown;
    state.gamepad.prevMenu = menuDown;
  }

  function playArea() {
    return { left: 18, right: view.w - 18, top: 68, bottom: view.h - view.controlsH - 18 };
  }

  function resize() {
    const w = Math.max(320, window.innerWidth);
    const h = Math.max(360, window.innerHeight);
    const nativeDpr = Math.max(1, window.devicePixelRatio || 1);
    const cappedDpr = Math.min(MAX_NORMAL_DPR, nativeDpr);
    const dpr = state.settings.lowEndMode ? 1 : cappedDpr;
    view.w = w;
    view.h = h;
    view.dpr = dpr;
    view.controlsH = controlsEl.getBoundingClientRect().height;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    hudCanvas.width = Math.floor(w * dpr);
    hudCanvas.height = Math.floor(h * dpr);
    hudCanvas.style.width = w + 'px';
    hudCanvas.style.height = h + 'px';
    hudCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (state.player) {
      const a = playArea();
      if (state.mode === 'title') {
        state.player.x = w * 0.5;
        state.player.y = a.bottom - 92;
      } else {
        state.player.x = clamp(state.player.x || w * 0.5, a.left, a.right);
        state.player.y = clamp(state.player.y || a.bottom - 92, a.top, a.bottom);
      }
    }
    if (state.backgroundBitmap || state.foregroundBitmap) regenBackground(mainTheme(), { preserveScroll: true });
    markHudDirty();
  }

  function clearArray(a) { a.length = 0; }
  function mainTheme() { return state.currentTheme || THEMES[0]; }
  function filterDps(avgDps, rawDps) { return DPS_FILTER_LAMBDA * avgDps + (1 - DPS_FILTER_LAMBDA) * rawDps; }

  function clearPooledArray(list, pool) {
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (!item) continue;
      if (item._inPool) continue;
      item._inPool = true;
      pool.push(item);
    }
    list.length = 0;
  }

  function clearProjectileLists() {
    state.projectileClearVersion++;
    clearPooledArray(state.bullets, state.projectilePool);
    clearPooledArray(state.enemyBullets, state.projectilePool);
  }

  function clearParticleList() {
    clearPooledArray(state.particles, state.particlePool);
  }

  function acquireProjectile() {
    const bullet = state.projectilePool.pop() || {};
    bullet._inPool = false;
    bullet.lastEnemyHit = null;
    return bullet;
  }

  function releaseProjectile(bullet) {
    if (!bullet || bullet._inPool) return;
    bullet._inPool = true;
    state.projectilePool.push(bullet);
  }

  function acquireParticle() {
    const particle = state.particlePool.pop() || {};
    particle._inPool = false;
    return particle;
  }

  function releaseParticle(particle) {
    if (!particle || particle._inPool) return;
    particle._inPool = true;
    state.particlePool.push(particle);
  }

  function regenBackground(theme, opts) {
    const o = opts || {};
    state.backgroundBitmap = null;
    state.foregroundBitmap = null;
    clearArray(state.background);
    clearArray(state.foreground);
    if (!o.preserveDecor) clearDecorBackgrounds();
    if (!o.preserveClouds) clearScrollingClouds();
    state.backgroundSeed = 0;
    state.foregroundSeed = 0;
    if (!o.preserveStars) {
      state.starfield = [];
      state.starfieldScroll = 0;
    }
  }

  function ensureStarfield() {
    const desired = state.settings.lowEndMode ? STARFIELD_LOW_END_CAP : STARFIELD_DEFAULT_CAP;
    if (state.starfield.length === desired) return;
    const stars = [];
    for (let i = 0; i < desired; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: 0.42 + Math.random() * 2.2,
        a: 0.22 + Math.random() * 0.78,
        speed: 0.18 + Math.random() * 0.82,
        tw: Math.random() * TAU,
        tint: Math.random()
      });
    }
    state.starfield = stars;
    render.starDirty = true;
  }

  function updateStarfieldCap(dt) {
  }

  function finalizeStarfieldCap() {
  }

  function loseAllWeaponTiers(p) {
    if (!p) return;
    if (Array.isArray(p.weaponTiers) && p.weaponTiers.length === WEAPONS.length) {
      for (let i = 0; i < p.weaponTiers.length; i++) {
        p.weaponTiers[i] = Math.max(1, (p.weaponTiers[i] || 1) - 1);
      }
      p.weaponTier = clamp(p.weaponTiers[p.weaponMode] || 1, 1, 5);
    } else {
      p.weaponTier = Math.max(1, p.weaponTier - 1);
    }
  }

  function drawStarfield() {
    ensureStarfield();
    state.starfieldScroll += 0.012;

    if (gl && render.starProgram && render.starBuffer && !render.starDisabled) return;

    const time = state.animClock || state.levelClock || 0;
    const lowEnd = !!state.settings.lowEndMode;
    const sizeScale = lowEnd ? 0.92 : 1.0;
    const additiveAlpha = lowEnd ? 0.72 : 0.82;

    for (let i = 0; i < state.starfield.length; i++) {
      const star = state.starfield[i];
      const x = star.x * view.w;
      const y = ((star.y + state.starfieldScroll * star.speed) % 1) * view.h;
      const twinkle = 0.72 + Math.sin(time * 2.1 + star.tw * 6.2831853) * 0.28;
      const alpha = clamp(star.a * twinkle * 1.05, 0.16, 1.0);
      const tint = star.tint;
      const color = tint >= 0.84 ? '#f2e3a8' : tint >= 0.64 ? '#dff0ff' : '#ffffff';
      const size = clamp(star.r * sizeScale, 1.0, lowEnd ? 2.6 : 3.2);

      drawSpriteRect(x, y, size, size, color, alpha * additiveAlpha, 0, true, 0);
      if (!lowEnd && size > 1.2) {
        drawSpriteRect(x, y, size * 0.55, size * 0.55, '#ffffff', clamp(alpha * 0.95, 0.12, 1.0), 0, false, 0);
      }
    }
  }

  function drawStarfieldGPU() {
    if (!gl || !render.starProgram || !render.starBuffer || render.starDisabled) return;
    ensureStarfield();
    if (render.starDirty || render.starBufferCount !== state.starfield.length) {
      const data = new Float32Array(Math.max(1, state.starfield.length) * 8);
      for (let i = 0; i < state.starfield.length; i++) {
        const star = state.starfield[i];
        const o = i * 8;
        data[o + 0] = star.x;
        data[o + 1] = star.y;
        data[o + 2] = star.r;
        data[o + 3] = star.speed;
        data[o + 4] = star.a;
        data[o + 5] = star.tw;
        data[o + 6] = star.tint;
        data[o + 7] = star.tint > 0.86 ? 1.35 : 1.0;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, render.starBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      render.starBufferData = data;
      render.starBufferCount = state.starfield.length;
      render.starDirty = false;
    }
    try {
      gl.useProgram(render.starProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, render.starBuffer);
      gl.uniform2f(render.uStarViewport, canvas.width, canvas.height);
      gl.uniform1f(render.uStarTime, state.animClock || state.levelClock || 0);
      gl.uniform1f(render.uStarScroll, state.starfieldScroll || 0);
      gl.uniform1f(render.uStarDpr, view.dpr || 1);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.drawArrays(gl.POINTS, 0, render.starBufferCount);
    } catch (err) {
      console.warn('GPU starfield draw failed; disabling starfield.', err);
      render.starDisabled = true;
      render.starProgram = null;
      render.starBuffer = null;
      render.aStar0 = null;
      render.aStar1 = null;
      render.uStarViewport = null;
      render.uStarTime = null;
      render.uStarScroll = null;
      render.uStarDpr = null;
    }
  }

  function resetPlayer() {
    const a = playArea();
    const p = state.player;
    p.x = view.w * 0.5;
    p.y = a.bottom - 92;
    p.health = p.maxHealth;
    p.shield = 1;
    p.bombs = 2;
    p.weaponTiers = Array(WEAPONS.length).fill(1);
    p.weaponMode = 0;
    p.weaponTier = p.weaponTiers[0];
    p.fireCooldown = 0;
    p.rapidTimer = 0;
    p.magnetTimer = 0;
    p.heat = 0;
    p.invuln = 0;
    p.fireHeld = false;
    p.pointerMode = false;
    p.respawnTimer = 0;
    p.respawnDuration = 0;
    p.respawnStartX = p.x;
    p.respawnStartY = p.y;
    p.respawnTargetX = p.x;
    p.respawnTargetY = p.y;
    p.repairDelay = 0;
  }

  function resetRun() {
    state.score = 0;
    state.lives = currentDifficulty().lives;
    state.combo = 0;
    state.comboTimer = 0;
    state.overdrive = 0;
    state.banner = '';
    state.bannerSub = '';
    state.bannerTimer = 0;
    state.flash = 0;
    state.shake = 0;
    state.endScreenReadyAt = 0;
    state.lastDeathReason = '';
    state.lastHitInfo = null;
    state.nextLevelTimer = 0;
    state.waveClock = 0;
    state.waveIndex = 0;
    state.levelClock = 0;
    state.transition = null;
    clearDecorBackgrounds();
    clearArray(state.enemies);
    clearProjectileLists();
    clearArray(state.pickups);
    clearParticleList();
    state.boss = null;
    state.levelIndex = 0;
    state.currentTheme = THEMES[0];
    resetPlayer();
    regenBackground(state.currentTheme);
    state.fpsAvg = 60;
    state.starfieldCapSum = 0;
    state.starfieldCapSamples = 0;
    state.starfieldCapPending = null;
    state.mode = 'title';
    state.paused = false;
    state.musicClock = 0;
    state.musicStep = 0;
    state.pointerActive = false;
    state.pointerId = null;
    state.pointerX = 0;
    state.pointerY = 0;
    state.mouseButtons = 0;
    state.renderFrameIndex = 0;
    state.input.left = false;
    state.input.right = false;
    state.input.up = false;
    state.input.down = false;
    state.input.fire = false;
    state.input.moveX = 0;
    state.input.moveY = 0;
    state.gamepad.joyX = 0;
    state.gamepad.joyY = 0;
    state.mode = 'title';
    titleScreenText();
    syncSettingsUi();
    markHudDirty();
  }

  function saveBest() {
    if (state.score > state.highScore) {
      state.highScore = state.score;
      saveNum('ThroriumGap_highScore', state.highScore);
    }
  }

  function startGame() {
    if (!state.assetsReady) {
      titleScreenText();
      markHudDirty();
      return;
    }
    closeSettings();
    resetRun();
    state.mode = 'playing';
    if (DEBUG_END_BOSS) debugJumpToFinalBoss(true);
    else beginLevel(0);
    markHudDirty();
  }

  function titleScreenText() {
    if (state.assetsReady) {
      setBanner('THORIUM GAP', 'Click or press Space to launch.', 3.5);
      hint('Drag to fly. Hold to fire. Open SETTINGS for audio and combat settings.', 5);
    } else {
      setBanner('THORIUM GAP', 'Preloading textures...', 3.5);
      hint('Please wait while the game warms its textures.', 5);
    }
  }

  function assetWarmupBusy() {
    return !!(playerShipTextureLoading || playerAuraTextureLoading || bossArtLoadKeys.size || bossPartLoadKeys.size || enemyShipLoadKeys.size || glowImageLoads.size || planetDecorLoadKeys.size || planetDecorTextureLoadKeys.size);
  }

  function warmAllTextures() {
    ensurePlayerShipTexture();
    ensurePlayerAuraTexture();
    getPlayerEngineFlameTexture(0);
    getPlayerEngineFlameTexture(1);
    getPlayerEngineFlameTexture(2);
    getPlayerEngineFlameTexture(3);
    ensureGlowImage('assets/glow_e_white.png');
    ensureGlowImage('assets/glow_e_blue.png');
    ensureGlowImage('assets/glow_e_green.png');
    ensureGlowImage('assets/glow_e_red.png');
    for (let i = 1; i <= PLANET_DECOR_MAX; i++) ensurePlanetDecorImage(i);
    for (let i = 1; i <= THEMES.length; i++) {
      warmBossArt(i);
      warmEnemyShipBatch(i);
    }
    if (titleArt && !titleArt.complete) {
      titleArt.decoding = 'async';
    }
  }

  function beginTexturePreload() {
    if (state.assetsLoading || state.assetsReady) return state.assetsWarmupPromise || Promise.resolve();
    state.assetsLoading = true;
    titleScreenText();
    markHudDirty();
    warmAllTextures();
    state.assetsWarmupPromise = (async function () {
      const started = Date.now();
      while (assetWarmupBusy()) {
        if (Date.now() - started > 30000) break;
        await new Promise(function (resolve) { setTimeout(resolve, 50); });
      }
      state.assetsLoading = false;
      state.assetsReady = true;
      state.assetsWarmupPromise = null;
      titleScreenText();
      markHudDirty();
    }());
    return state.assetsWarmupPromise;
  }

  function endScreenCanContinue() {
    return state.animClock >= (state.endScreenReadyAt || 0);
  }

  function endScreenContinue() {
    if (!endScreenCanContinue()) return;
    window.location.reload();
  }

  function describeDeathReason(info) {
    if (!info) return 'The void has taken the ship.';
    if (info.kind === 'boss-contact') return 'You got killed by colliding with a boss.';
    if (info.kind === 'boss-shot' || info.sourceKind === 'boss') return 'You got killed by a shot from the boss.';
    const isShot = info.kind === 'enemy-shot' || info.kind === 'shot';
    const label = info.sourceName || info.sourceKind || 'enemy';
    if (isShot) return 'You got killed by a shot from a ' + label + '.';
    return 'You got killed by colliding with a ' + label + '.';
  }

  function spawnCheatDrop(code) {
    if (!state.debugMode) return;
    const x = view.w * 0.5;
    const y = view.h * 0.5;
    if (code === 'Digit1') spawnPickup('weapon', x, y, { weaponMode: 0 });
    else if (code === 'Digit2') spawnPickup('weapon', x, y, { weaponMode: 1 });
    else if (code === 'Digit3') spawnPickup('weapon', x, y, { weaponMode: 2 });
    else if (code === 'Digit4') spawnPickup('weapon', x, y, { weaponMode: 3 });
    else if (code === 'Digit5') spawnPickup('weapon', x, y, { weaponMode: 4 });
    else if (code === 'Digit6') spawnPickup('shield', x, y);
    else if (code === 'Digit7') spawnPickup('rapid', x, y);
    else if (code === 'Digit8') spawnPickup('bomb', x, y);
    else if (code === 'Digit9') spawnPickup('magnet', x, y);
    else if (code === 'Backquote' || code === 'IntlBackslash' || code === 'Backslash') spawnPickup('invuln', x, y);
  }

  function debugJumpToBoss() {
    if (!state.debugMode || state.mode !== 'playing' || state.transition) return;
    if (state.boss) {
      damageBoss(state.boss, 999999, false);
      return;
    }
    const theme = mainTheme();
    state.waveClock = 0;
    state.levelClock = 40 + state.levelIndex * 2;
    state.banner = 'BOSS!';
    state.bannerSub = theme.subtitle;
    state.bannerTimer = 1.2;
    clearProjectileLists();
    clearParticleList();
    clearEnemyBulletsWithBudget(9999);
    spawnBoss(theme);
  }

  function debugJumpToFinalBoss(force) {
    if ((!force && !state.debugMode) || !state.assetsReady || state.transition) return;
    if (state.mode !== 'playing') {
      closeSettings();
      resetRun();
      state.mode = 'playing';
    }
    const finalIndex = THEMES.length - 1;
    beginLevel(finalIndex);
    state.levelClock = 40 + finalIndex * 2;
    state.waveClock = 0;
    state.banner = 'BOSS!';
    state.bannerSub = mainTheme().subtitle;
    state.bannerTimer = 1.2;
    clearProjectileLists();
    clearParticleList();
    clearEnemyBulletsWithBudget(9999);
    spawnBoss(mainTheme());
  }

  function beginLevel(index) {
    state.levelIndex = index;
    state.currentTheme = THEMES[index];
    state.enemyShipKindMap = buildEnemyKindShipAssignments(index + 1, state.currentTheme);
    warmEnemyShipBatch(index + 1);
    if (index + 1 > ENEMY_SHIP_FALLBACK_BATCHES) warmEnemyShipBatch(((index + 1 - 1) % ENEMY_SHIP_FALLBACK_BATCHES) + 1);
    warmBossArt(index + 1);
    clearArray(state.enemies);
    clearProjectileLists();
    clearArray(state.pickups);
    state.boss = null;
    state.waveClock = 0;
    state.waveIndex = 0;
    state.levelClock = 0;
    state.transition = null;
    regenBackground(state.currentTheme, { preserveDecor: true, preserveClouds: true, preserveStars: true });
    state.starfieldCapSum = 0;
    state.starfieldCapSamples = 0;
    state.starfieldCapPending = null;
    state.fpsAvg = 60;
    if (index === 0) {
      state.decorBackgrounds = [createDecorBackground(0)];
      state.decorBackgrounds[0].x = view.w * 0.72;
      state.decorBackgrounds[0].y = view.h * 0.22;
      state.decorBackgrounds[0].scale = 2;
      state.decorBackgrounds[0].delay = 0;
      state.player.x = view.w * 0.5;
      state.player.y = playArea().bottom - 92;
      {
        const a = playArea();
        const y = a.top + 96;
        const xs = [view.w * 0.5 - 280, view.w * 0.5 - 140, view.w * 0.5, view.w * 0.5 + 140, view.w * 0.5 + 280];
        const modes = [1, 2, 0, 3, 4];
        for (let i = 0; i < modes.length; i++) spawnPickup('weapon', xs[i], y, { weaponMode: modes[i] });
      }
    } else {
      state.player.health = Math.min(state.player.maxHealth, state.player.health + 1);
      state.player.bombs = Math.min(4, state.player.bombs + 1);
    }
    state.player.respawnTimer = 0;
    state.player.respawnDuration = 0;
    state.player.respawnStartX = state.player.x;
    state.player.respawnStartY = state.player.y;
    state.player.respawnTargetX = state.player.x;
    state.player.respawnTargetY = state.player.y;
    setBanner('STAGE ' + (index + 1), state.currentTheme.name, 2.8);
    markHudDirty();
  }

  function victory() {
    state.mode = 'victory';
    state.banner = 'VICTORY';
    state.bannerSub = 'The sky is yours.';
    state.bannerTimer = 999;
    state.endScreenReadyAt = state.animClock + 4;
    state.flash = 0.6;
    state.shake = 18;
    sfx('clear');
    hint('Press fire to continue.', 6);
    saveBest();
    markHudDirty();
  }

  function gameOver(reason) {
    pushDebugEvent('gameOver', {
      reason: reason || '',
      lastDeathReason: state.lastDeathReason || '',
      lastHitInfo: state.lastHitInfo || null,
      lives: state.lives,
      score: state.score,
      levelIndex: state.levelIndex
    });
    state.mode = 'gameover';
    state.banner = 'GAME OVER';
    state.bannerSub = reason || 'The void has taken the ship.';
    state.bannerTimer = 999;
    state.endScreenReadyAt = state.animClock + 4;
    state.flash = 0.25;
    state.shake = 18;
    hint('Press fire to continue.', 6);
    saveBest();
    markHudDirty();
  }

  function addScore(points) {
    const comboBonus = 1 + Math.floor(state.combo / 5);
    const od = state.overdrive > 0 ? 2 : 1;
    state.score += Math.round(points * comboBonus * od);
    if (state.score > state.highScore) {
      state.highScore = state.score;
      saveNum('ThroriumGap_highScore', state.highScore);
    }
  }

  function spawnParticle(x, y, vx, vy, life, size, color, kind) {
    const particle = acquireParticle();
    particle.x = x;
    particle.y = y;
    particle.vx = vx;
    particle.vy = vy;
    particle.life = life;
    particle.maxLife = life;
    particle.size = size;
    particle.color = color;
    particle.kind = kind || 'spark';
    particle.rot = rand(0, TAU);
    state.particles.push(particle);
  }

  function burst(x, y, color, count, speed, size, kind) {
    const total = state.settings.lowEndMode ? Math.max(1, Math.round(count * getParticleBudgetScale())) : count;
    for (let i = 0; i < total; i++) {
      const a = rand(0, TAU);
      const s = rand(speed * 0.4, speed);
      spawnParticle(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.24, 0.72), rand(size * 0.5, size), color, kind);
    }
  }

  function flashBurst(x, y, color) {
    burst(x, y, color, 9, 180, 6, 'spark');
    spawnParticle(x, y, 0, 0, 0.24, 14, color, 'ring');
  }

  function clearEnemyBulletsWithBudget(budget, particleColor) {
    let burstCount = 0;
    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
      const b = state.enemyBullets[i];
      if (!b) continue;
      if (burstCount < budget) {
        burst(b.x, b.y, particleColor || '#ffe39a', 4, 120, 4, 'spark');
        burstCount++;
      }
      releaseProjectile(b);
    }
    state.enemyBullets.length = 0;
  }

  function shipDeathBurst(x, y) {
    state.flash = Math.max(state.flash, 0.48);
    state.shake = Math.max(state.shake, 18);
    sfx('bomb');
    burst(x, y, '#fff0b5', 42, 280, 8, 'spark');
    burst(x, y, '#ffd96a', 18, 240, 6, 'spark');
    flashBurst(x, y, '#fff9d9');
    clearEnemyBulletsWithBudget(state.settings.lowEndMode ? 8 : 24, '#ffe39a');
  }

  function beginPlayerRespawn() {
    const p = state.player;
    const a = playArea();
    p.respawnTimer = 4.0;
    p.respawnDuration = 4.0;
    p.respawnStartX = view.w * 0.5;
    p.respawnStartY = view.h + 70;
    p.respawnTargetX = view.w * 0.5;
    p.respawnTargetY = a.bottom - 92;
    p.x = p.respawnStartX;
    p.y = p.respawnStartY;
    p.invuln = 8;
    p.repairDelay = 0;
    p.fireCooldown = 0.35;
    p.heat = 0;
    p.fireHeld = false;
    p.pointerMode = false;
  }

  function spawnBullet(team, x, y, vx, vy, opts) {
    const diff = currentDifficulty();
    const isEnemy = team !== 'player';
    const speedScale = isEnemy ? diff.bulletSpeed : 1;
    const damageScale = isEnemy ? diff.contact : 1;
    const bullet = acquireProjectile();
    bullet.team = team;
    bullet.x = x;
    bullet.y = y;
    bullet.vx = vx * speedScale;
    bullet.vy = vy * speedScale;
    bullet.ax = opts && opts.ax ? opts.ax * speedScale : 0;
    bullet.ay = opts && opts.ay ? opts.ay * speedScale : 0;
    bullet.r = opts && opts.r ? opts.r : (team === 'player' ? 6 : 7);
    bullet.color = opts && opts.color ? opts.color : (team === 'player' ? '#d9fcff' : '#ff765d');
    bullet.life = opts && opts.life ? opts.life : 5.5;
    bullet.damage = (opts && opts.damage ? opts.damage : 1) * damageScale;
    bullet.kind = opts && opts.kind ? opts.kind : 'orb';
    bullet.pierce = opts && opts.pierce != null ? opts.pierce : 0;
    bullet.homing = opts && opts.homing ? opts.homing : 0;
    bullet.turn = opts && opts.turn ? opts.turn : 0;
    bullet.target = opts && opts.target ? opts.target : null;
    bullet.sourceKind = opts && opts.sourceKind ? opts.sourceKind : (isEnemy ? 'enemy' : 'player');
    bullet.sourceName = opts && opts.sourceName ? opts.sourceName : '';
    bullet.targetRefresh = 0;
    bullet.age = 0;
    bullet.wobble = opts && opts.wobble ? opts.wobble : 0;
    bullet.lastEnemyHit = null;
    bullet.alive = true;
    state[team === 'player' ? 'bullets' : 'enemyBullets'].push(bullet);
  }

  function spawnPickup(type, x, y, opts) {
    const info = PICKUPS[type];
    if (!info) return;
    const weaponMode = opts && opts.weaponMode != null ? opts.weaponMode : 0;
    const color = type === 'weapon' ? WEAPONS[weaponMode].color : info.color;
    state.pickups.push({
      type: type, x: x, y: y, vx: opts && opts.vx != null ? opts.vx : rand(-12, 12), vy: opts && opts.vy != null ? opts.vy : rand(36, 58),
      r: 18, life: 12, color: color, emoji: info.emoji, bob: rand(0, TAU), spin: rand(0, TAU),
      glowDiameter: Number.isFinite(info.glowDiameter) ? info.glowDiameter : 32,
      lighter: info.lighter !== false,
      weaponMode: weaponMode,
      weaponTier: 1
    });
  }

  function choosePickup() {
    const weaponWeight = weaponPickupWeight(state.player.weaponTier);
    const list = [
      { type: 'weapon', w: weaponWeight },
      { type: 'rapid', w: state.player.rapidTimer > 4 ? 1 : 4 },
      { type: 'shield', w: state.player.shield < 2 ? 3 : 1 },
      { type: 'bomb', w: state.player.bombs < 2 ? 2 : 1 },
      { type: 'magnet', w: state.player.magnetTimer < 4 ? 3 : 1 },
      { type: 'invuln', w: 0.5 },
      { type: 'score', w: 7 }
    ];
    const total = list.reduce(function (sum, item) { return sum + item.w; }, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < list.length; i++) { roll -= list[i].w; if (roll <= 0) return list[i].type; }
    return 'score';
  }

  function weaponPickupWeight(tierLevel) {
    const tier = clamp(tierLevel | 0, 1, 5);
    const weightsByTier = {
      1: 8,
      2: 5,
      3: 2,
      4: 1,
      5: 1
    };
    return weightsByTier[tier] || 1;
  }

  function chooseWeaponMode(currentMode) {
    if (Number.isFinite(currentMode) && Math.random() < 0.34) return clamp(currentMode | 0, 0, WEAPONS.length - 1);
    const pool = [];
    for (let i = 0; i < WEAPON_PICKUP_WEIGHTS.length; i++) {
      if (i !== currentMode) pool.push({ mode: i, w: WEAPON_PICKUP_WEIGHTS[i] });
    }
    const total = pool.reduce(function (sum, item) { return sum + item.w; }, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
      roll -= pool[i].w;
      if (roll <= 0) return pool[i].mode;
    }
    return 0;
  }

  function applyWeaponOverflowUpgrade(p) {
    const mode = randi(0, WEAPONS.length - 1);
    const tier = (p.weaponTiers && p.weaponTiers[mode]) || 1;
    if (tier <= 2) {
      p.weaponTiers[mode] = Math.min(5, tier + 1);
      if (mode === p.weaponMode) p.weaponTier = p.weaponTiers[mode];
      state.banner = WEAPONS[mode].name + ' ' + WEAPON_TIER_LABELS[p.weaponTiers[mode] - 1];
      state.bannerSub = 'Overflow upgrade.';
    } else {
      addScore(250);
      state.banner = 'EXTRA POWER';
      state.bannerSub = 'Overflow converted to score.';
    }
    state.bannerTimer = 1.15;
  }

  function maybeDropPickup(x, y, elite, forceType) {
    const p = 0.6 * (0.95 ** (state.levelIndex-1))
    if (forceType || Math.random() < p) {
      const type = forceType || choosePickup();
      if (type === 'weapon') spawnPickup('weapon', x, y, { weaponMode: chooseWeaponMode(state.player.weaponMode) });
      else spawnPickup(type, x, y);
    }
  }

  function spawnEnemy(kind, x, y, opts) {
    const t = state.currentTheme;
    const d = ENEMIES[kind] || ENEMIES.drifter;
    const scale = 1 + state.levelIndex * 0.05;
    const diff = currentDifficulty();
    const speedScale = diff.enemySpeed;
    const fireScale = enemyShotPace() / diff.spawnRate;
    const levelNumber = state.levelIndex + 1;
    const shipIndex = opts && opts.shipIndex != null ? opts.shipIndex : chooseEnemyShipIndexForKind(kind, levelNumber);
    const shipSize = kind === 'elite' ? ENEMY_ELITE_SIZE : getEnemyShipRenderSize(levelNumber, shipIndex);
    const sizeScale = shipSize / 64;
    const firstLevelHpScale = state.levelIndex === 0 ? 0.5 : 1;
    const hpScale = firstLevelHpScale * scale * diff.enemyHp * sizeScale;
    const baseHp = opts && opts.hp != null ? opts.hp : d.hp;
    const e = {
      kind: kind, theme: t, x: x, y: y,
      vx: (opts && opts.vx != null ? opts.vx : rand(-18, 18)) * speedScale,
      vy: (opts && opts.vy != null ? opts.vy : d.speed * scale) * speedScale,
      hp: Math.max(1, Math.round(baseHp * hpScale)),
      maxHp: Math.max(1, Math.round(baseHp * hpScale)),
      r: Math.max(12, Math.round(shipSize * 0.42)), score: Math.round((opts && opts.score != null ? opts.score : d.score) * scale), fireCooldown: rand(0.8, 1.8) * fireScale, age: 0, wobble: rand(0, TAU), dir: chance(0.5) ? 1 : -1,
      shipLevel: levelNumber, shipIndex: shipIndex, shipSize: shipSize,
      shotSeed: rand(0, TAU), elite: !!(opts && opts.elite), dead: false, hitFlash: 0,
      entry: opts && opts.entry ? opts.entry : null
    };
    e.flightAngle = Math.atan2(e.vy || 0, e.vx || 1);
    if (e.entry) {
      e.x = e.entry.startX;
      e.y = e.entry.startY;
      e.wobble = e.entry.phase;
      e.flightAngle = Math.atan2(e.entry.targetY - e.entry.startY, e.entry.targetX - e.entry.startX);
    }
    if (kind === 'elite') { e.hp = Math.round(9 * hpScale); e.maxHp = e.hp; e.score = Math.round(340 * scale); e.r = Math.max(e.r, Math.round(shipSize * 0.42)); }
    state.enemies.push(e);
    return e;
  }

  function spawnBoss(theme) {
    const b = theme.boss;
    const diff = currentDifficulty();
    const levelNumber = state.levelIndex + 1;
    const hitBox = getBossHitBox(levelNumber);
    const bossYOffset = levelNumber >= THEMES.length ? -Math.max(0, (b.size || 512) * 0.20) : Math.max(0, (b.size || 512) * 0.25);
    const bossHp = Math.round(b.hp * diff.bossHp);
    const clawHp = Math.max(1, Math.round(bossHp * 0.95));
    state.boss = {
      theme: theme, name: b.name, emoji: b.emoji, color: b.color,
      x: view.w * 0.5, y: 128 + bossYOffset, vx: 0, vy: 0, r: 64,
      hp: bossHp,
      maxHp: bossHp,
      phases: b.phases, phaseIndex: 0, phaseClock: 0, age: 0,
      fireClock: 0, motionClock: 0, state: {}, hitFlash: 0, glowBoost: 0, dead: false,
      clawGuard: 0, clawGuardDelay: 0,
      size: Math.max(1, b.size || 512),
      flipWhenMovingRight: b.flipWhenMovingRight !== false,
      shipLevel: levelNumber, shipIndex: 0, facingRight: false,
      hitBox: hitBox,
      claws: levelNumber === 13 ? {
        left: { hp: clawHp, maxHp: clawHp, dead: false, hitFlash: 0, glowBoost: 0, deathFlash: 0 },
        right: { hp: clawHp, maxHp: clawHp, dead: false, hitFlash: 0, glowBoost: 0, deathFlash: 0 }
      } : null,
      yOffset: bossYOffset
    };
    state.banner = 'BOSS: ' + b.name;
    state.bannerSub = theme.subtitle;
    state.bannerTimer = 3.2;
    sfx('boss');
    flashBurst(state.boss.x, state.boss.y, state.boss.color);
    hint('Boss fight! Stay low, weave, and burn it down.', 3.6);
  }

  function flightProfileForKind(kind) {
    switch (kind) {
      case 'drifter': return { routeShift: 4, swirl: 0.95, bend: 1.0, turns: 0.25, duration: 4.8, settleY: 1.0 };
      case 'looper': return { routeShift: 2, swirl: 0.75, bend: 0.9, turns: 0.15, duration: 4.2, settleY: 0.98 };
      case 'swarm': return { routeShift: 1, swirl: 1.25, bend: 1.0, turns: 0.55, duration: 4.0, settleY: 1.0 };
      case 'bomber': return { routeShift: 0, swirl: 0.7, bend: 0.82, turns: -0.05, duration: 5.0, settleY: 0.92 };
      case 'sniper': return { routeShift: 3, swirl: 0.6, bend: 0.82, turns: 0.05, duration: 5.1, settleY: 1.05 };
      case 'spinner': return { routeShift: 4, swirl: 1.45, bend: 1.08, turns: 0.95, duration: 5.4, settleY: 0.95 };
      case 'splitter': return { routeShift: 1, swirl: 1.0, bend: 0.95, turns: 0.2, duration: 4.5, settleY: 1.0 };
      case 'diver': return { routeShift: 0, swirl: 0.9, bend: 0.92, turns: 0.3, duration: 4.3, settleY: 1.08 };
      case 'mine': return { routeShift: 4, swirl: 0.55, bend: 0.7, turns: 0.0, duration: 4.6, settleY: 1.08 };
      case 'elite': return { routeShift: 0, swirl: 1.35, bend: 1.1, turns: 0.55, duration: 5.6, settleY: 0.92 };
      default: return { routeShift: 2, swirl: 1.0, bend: 1.0, turns: 0.35, duration: 4.5, settleY: 1.0 };
    }
  }

  function spawnWave(theme) {
    const enemyKinds = waveEnemyKinds(theme);
    const form = theme.forms[(state.levelIndex + ((state.levelClock / 4) | 0) + ((state.waveClock * 2) | 0)) % theme.forms.length];
    const diff = currentDifficulty();
    const count = clamp(Math.round((4 + Math.floor(state.levelIndex / 5) + rand(0, 2)) * diff.spawnCount), 2, 9);
    const margin = 42, top = -34, mid = (count - 1) * 0.5;
    const waveId = state.waveIndex++;
    const entryRoutes = [
      { name: 'rightToLeft', startX: view.w + 96, startY: -84, targetMinX: 0.12, targetMaxX: 0.34, targetY: 34, controlX: 0.72, controlY: 0.12, bend: 0.26, swirl: 22, turns: 1.35, duration: 1.22 },
      { name: 'rightToLeftWide', startX: view.w + 112, startY: -96, targetMinX: 0.16, targetMaxX: 0.42, targetY: 44, controlX: 0.82, controlY: 0.20, bend: 0.32, swirl: 28, turns: 1.6, duration: 1.4 },
      { name: 'leftToRight', startX: -96, startY: -84, targetMinX: 0.66, targetMaxX: 0.88, targetY: 34, controlX: 0.28, controlY: 0.12, bend: 0.26, swirl: 22, turns: 1.35, duration: 1.22 },
      { name: 'leftToRightWide', startX: -112, startY: -96, targetMinX: 0.58, targetMaxX: 0.84, targetY: 44, controlX: 0.18, controlY: 0.20, bend: 0.32, swirl: 28, turns: 1.6, duration: 1.4 },
      { name: 'centerCorkscrew', startX: view.w * 0.5, startY: -112, targetMinX: 0.34, targetMaxX: 0.66, targetY: 40, controlX: 0.5, controlY: 0.08, bend: 0.18, swirl: 34, turns: 2.1, duration: 1.55 }
    ];
    const routePhase = Math.floor((state.levelClock + waveId * 0.85) / rand(2, 5)) % 2;
    function buildEntry(index, kind) {
      const profile = flightProfileForKind(kind);
      const entryRoute = entryRoutes[(index + profile.routeShift) % entryRoutes.length];
      const t = count === 1 ? 0.5 : index / (count - 1);
      const lane = clamp(t + Math.sin((waveId + index) * 0.45) * 0.045, 0, 1);
      const mirror = routePhase === 1 ? -1 : 1;
      const startX = mirror < 0 ? view.w - entryRoute.startX : entryRoute.startX;
      const startY = entryRoute.startY - index * 10;
      const targetMinX = mirror < 0 ? 1 - entryRoute.targetMaxX : entryRoute.targetMinX;
      const targetMaxX = mirror < 0 ? 1 - entryRoute.targetMinX : entryRoute.targetMaxX;
      const controlX = mirror < 0 ? 1 - entryRoute.controlX : entryRoute.controlX;
      const targetX = lerp(view.w * targetMinX, view.w * targetMaxX, lane);
      const targetY = entryRoute.targetY * profile.settleY + ((index % 3) - 1) * 5;
      const dx = targetX - startX;
      const dy = targetY - startY;
      const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const nx = -dy / len;
      const ny = dx / len;
      return {
        startX: startX,
        startY: startY,
        targetX: targetX,
        targetY: targetY,
        controlX: view.w * controlX,
        controlY: view.h * entryRoute.controlY,
        normalX: nx,
        normalY: ny,
        bend: entryRoute.bend * view.w * profile.bend,
        swirl: entryRoute.swirl * profile.swirl,
        turns: entryRoute.turns + profile.turns + lane * 0.35,
        duration: (entryRoute.duration + lane * 0.12 + index * 0.01) * profile.duration,
        phase: rand(0, TAU),
        settle: 0.86 + (index % 2) * 0.08,
        kind: kind,
        mirror: mirror
      };
    }
    let i;
    if (form === 'line') {
      for (i = 0; i < count; i++) { const kind = pick(enemyKinds); spawnEnemy(kind, lerp(margin, view.w - margin, count === 1 ? 0.5 : i / (count - 1)), top - i * 8, { vy: rand(80, 110), entry: buildEntry(i, kind) }); }
    } else if (form === 'fan') {
      for (i = 0; i < count; i++) { const kind = pick(enemyKinds); spawnEnemy(kind, view.w * 0.5 + (i - mid) * 82, top - i * 10, { vx: (i - mid) * 20, vy: rand(92, 126), entry: buildEntry(i, kind) }); }
    } else if (form === 'rain') {
      for (i = 0; i < count; i++) { const kind = pick(enemyKinds); spawnEnemy(kind, rand(margin, view.w - margin), top - i * 14, { vx: rand(-26, 26), vy: rand(94, 132), entry: buildEntry(i, kind) }); }
    } else if (form === 'pair') {
      for (i = 0; i < count; i++) { const y = top - i * 12; const leftKind = pick(enemyKinds); const rightKind = pick(enemyKinds); spawnEnemy(leftKind, margin + i * 24, y, { vx: rand(22, 52), vy: rand(92, 118), entry: buildEntry(i, leftKind) }); spawnEnemy(rightKind, view.w - margin - i * 24, y, { vx: -rand(22, 52), vy: rand(92, 118), entry: buildEntry(i + count, rightKind) }); }
    } else if (form === 'arc') {
      for (i = 0; i < count; i++) { const t = count === 1 ? 0.5 : i / (count - 1), a = lerp(Math.PI * 0.2, Math.PI * 0.8, t); const kind = pick(enemyKinds); spawnEnemy(kind, view.w * 0.5 + Math.cos(a) * 160, top + Math.sin(a) * 60, { vx: Math.cos(a) * 20, vy: rand(92, 118), entry: buildEntry(i, kind) }); }
    } else if (form === 'swarm') {
      for (i = 0; i < count + 1; i++) { const kind = pick(enemyKinds); spawnEnemy(kind, rand(margin, view.w - margin), top - i * 8, { vx: rand(-56, 56), vy: rand(112, 148), entry: buildEntry(i, kind) }); }
    } else if (form === 'cross') {
      for (i = 0; i < count; i++) { const y = top - i * 10; const leftKind = pick(enemyKinds); const centerKind = pick(enemyKinds); spawnEnemy(leftKind, margin + i * 40, y, { vx: rand(25, 48), vy: rand(86, 118), entry: buildEntry(i, leftKind) }); spawnEnemy(centerKind, view.w * 0.5, y - 20, { vx: rand(-22, 22), vy: rand(78, 108), entry: buildEntry(i + count, centerKind) }); }
    } else if (form === 'ring') {
      const cx = view.w * 0.5, cy = 16;
      for (i = 0; i < count; i++) { const a = TAU * i / count - Math.PI * 0.5; const kind = pick(enemyKinds); spawnEnemy(kind, cx + Math.cos(a) * 150, cy + Math.sin(a) * 26, { vx: Math.cos(a) * 22, vy: rand(88, 118), entry: buildEntry(i, kind) }); }
    } else if (form === 'wave') {
      for (i = 0; i < count; i++) { const t = count === 1 ? 0.5 : i / (count - 1), x = lerp(margin, view.w - margin, t), y = top + Math.sin((state.levelClock * 1.4) + i) * 28; const kind = pick(enemyKinds); spawnEnemy(kind, x, y, { vx: Math.sin(i) * 26, vy: rand(90, 124), entry: buildEntry(i, kind) }); }
    } else {
      for (i = 0; i < count; i++) { const kind = pick(enemyKinds); spawnEnemy(kind, rand(margin, view.w - margin), rand(-80, -20), { vx: rand(-48, 48), vy: rand(84, 128), entry: buildEntry(i, kind) }); }
    }
    if (state.levelIndex >= 4 && chance(0.18 * diff.spawnCount)) spawnEnemy('elite', rand(margin, view.w - margin), top - 40, { vx: rand(-22, 22), vy: rand(82, 102), elite: true, entry: buildEntry(count + 1, 'elite') });
  }

  function weaponDelay() {
    const p = state.player;
    const base = [0.16, 0.17, 0.17, 0.25, 0.25][p.weaponMode] || 0.2;
    let d = base - (p.weaponTier - 1) * 0.012;
    if (p.rapidTimer > 0) d *= 0.54;
    if (state.overdrive > 0) d *= 0.76;
    if ((p.heat || 0) > 0.999) d *= (1 + HEAT_MAX_PENALTY);
    return clamp(d * PLAYER_SHOT_PACE / PLAYER_FIRE_RATE_BOOST, 0.05, 0.42);
  }

  function fireWeapon() {
    const p = state.player;
    const diff = currentDifficulty();
    const mode = p.weaponMode;
    const tier = p.weaponTier + (state.overdrive > 0 ? 1 : 0);
    const x = p.x, y = p.y - 18;
    const color = WEAPONS[mode].color;
    const dmg = (1+tier)*(diff.playerDamage || 1);
    if (mode === 0) { // DART
      spawnBullet('player', x, y, 0, -820, { r: 6, color: color, damage: dmg, kind: 'dart', life: 3.8 });
      if (tier >= 2) spawnBullet('player', x, y - 6, 0, -860, { r: 6, color: color, damage: dmg, kind: 'dart', life: 3.7 });
      if (tier >= 3) { spawnBullet('player', x - 10, y + 4, -52, -792, { r: 5, color: color, damage: dmg, kind: 'dart', life: 3.8 }); spawnBullet('player', x + 10, y + 4, 52, -792, { r: 5, color: color, damage: dmg, kind: 'dart', life: 3.8 }); }
      if (tier >= 4) { spawnBullet('player', x - 16, y + 2, -74, -812, { r: 5, color: color, damage: dmg, kind: 'dart', life: 3.6 }); spawnBullet('player', x + 16, y + 2, 74, -812, { r: 5, color: color, damage: dmg, kind: 'dart', life: 3.6 }); }
      if (tier >= 5) spawnBullet('player', x, y - 10, 0, -920, { r: 7, color: color, damage: dmg, kind: 'dart', pierce: 1, life: 3.4 });
      sfx('shoot');
    } else if (mode === 1) { // TWIN
      spawnBullet('player', x - 11, y, -40, -820, { r: 6, color: color, damage: dmg, kind: 'dart', life: 3.8 });
      spawnBullet('player', x + 11, y, 40, -820, { r: 6, color: color, damage: dmg, kind: 'dart', life: 3.8 });
      if (tier >= 2) spawnBullet('player', x, y - 6, 0, -880, { r: 5, color: color, damage: dmg, kind: 'dart', pierce: 1, life: 3.6 });
      if (tier >= 3) { spawnBullet('player', x - 20, y + 2, -62, -802, { r: 5, color: color, damage: dmg, kind: 'dart', life: 3.6 }); spawnBullet('player', x + 20, y + 2, 62, -802, { r: 5, color: color, damage: dmg, kind: 'dart', life: 3.6 }); }
      if (tier >= 4) { spawnBullet('player', x - 30, y + 2, -88, -790, { r: 5, color: color, damage: dmg, kind: 'dart', life: 3.4 }); spawnBullet('player', x + 30, y + 2, 88, -790, { r: 5, color: color, damage: dmg, kind: 'dart', life: 3.4 }); }
      if (tier >= 5) spawnBullet('player', x, y - 10, 0, -950, { r: 6, color: color, damage: dmg, kind: 'dart', pierce: 1, life: 3.2 });
      sfx('fan');
    } else if (mode === 2) { // FAN
      const spread = tier >= 5 ? 0.52 : tier >= 4 ? 0.44 : tier >= 3 ? 0.38 : tier >= 2 ? 0.28 : 0.20;
      const shots = tier >= 5 ? 8 : tier >= 4 ? 7 : tier >= 3 ? 5 : tier >= 2 ? 4 : 3;
      for (let i = 0; i < shots; i++) { const t = shots === 1 ? 0.5 : i / (shots - 1), a = lerp(-spread, spread, t) - Math.PI * 0.5; spawnBullet('player', x + Math.cos(a) * 2, y + Math.sin(a) * 2, Math.cos(a) * 804, Math.sin(a) * 804, { r: 6, color: color, damage: dmg, kind: 'fan', life: 3.5 }); }
      sfx('fan');
    } else if (mode === 3) { // ROCKET
      if (tier <= 1) {
        spawnBullet('player', x - 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.6, homing: 0.5, turn: 4.5 });
        spawnBullet('player', x + 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.6, homing: 0.5, turn: 4.5 });
      } else if (tier === 2) {
        spawnBullet('player', x - 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.6, homing: 0.5, turn: 4.5 });
        spawnBullet('player', x,      y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.6, homing: 0.4, turn: 4.4 });
        spawnBullet('player', x + 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.6, homing: 0.5, turn: 4.5 });
      } else if (tier === 3) {
        spawnBullet('player', x - 20, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.6, homing: 0.5, turn: 4.5 });
        spawnBullet('player', x - 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.5, homing: 0.4, turn: 4.4 });
        spawnBullet('player', x + 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.5, homing: 0.4, turn: 4.4 });
        spawnBullet('player', x + 20, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.6, homing: 0.5, turn: 4.5 });
      } else if (tier === 4) {
        spawnBullet('player', x - 20, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.4, homing: 0.5, turn: 4.6 });
        spawnBullet('player', x - 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.5, homing: 0.5, turn: 4.5 });
        spawnBullet('player', x ,     y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.5, homing: 0.4, turn: 4.4 });
        spawnBullet('player', x + 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.4, homing: 0.5, turn: 4.5 });
        spawnBullet('player', x + 20, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.5, homing: 0.5, turn: 4.6 });
      } else {
        spawnBullet('player', x - 20, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.4, homing: 0.5, turn: 4.6 });
        spawnBullet('player', x - 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.5, homing: 0.5, turn: 4.5 });
        spawnBullet('player', x - 5,  y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.5, homing: 0.4, turn: 4.4 });
        spawnBullet('player', x + 5,  y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.5, homing: 0.4, turn: 4.4 });
        spawnBullet('player', x + 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.4, homing: 0.5, turn: 4.5 });
        spawnBullet('player', x + 20, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg/2, kind: 'rocket', pierce: 1, life: 4.3, homing: 0.5, turn: 4.6 });
      }
      sfx('rocket');
    } else { // BEAM
      const beamY = y + 10;
      const beamSpacing = 5;
      const beamVY = () => -rand(980, 1220);
      const beamXJitter = () => rand(-2.5, 2.5);
      const beamYJitter = () => rand(-6, 6);
      const pierce = 2 + Math.floor(tier/2);
      if (tier === 1) {
        spawnBullet('player', x - beamSpacing*1/2 + beamXJitter(), beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
        spawnBullet('player', x + beamSpacing*1/2 + beamXJitter(), beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
      }
      if (tier === 2) {
        spawnBullet('player', x - beamSpacing + beamXJitter(),   beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
        spawnBullet('player', x + beamXJitter(),                 beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
        spawnBullet('player', x + beamSpacing + beamXJitter(),   beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
      }
      if (tier === 3) {
        spawnBullet('player', x - beamSpacing*3/2 + beamXJitter(), beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
        spawnBullet('player', x - beamSpacing*1/2 + beamXJitter(), beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
        spawnBullet('player', x + beamSpacing*1/2 + beamXJitter(), beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
        spawnBullet('player', x + beamSpacing*3/2 + beamXJitter(), beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
      }
      if (tier === 4) {
        spawnBullet('player', x - beamSpacing*2 + beamXJitter(),   beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
        spawnBullet('player', x - beamSpacing + beamXJitter(),   beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
        spawnBullet('player', x + beamXJitter(),                 beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
        spawnBullet('player', x + beamSpacing + beamXJitter(),   beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
        spawnBullet('player', x + beamSpacing*2 + beamXJitter(),   beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
      }
      if (tier >= 5) {
        spawnBullet('player', x - beamSpacing*4/2 + beamXJitter(), beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
        spawnBullet('player', x - beamSpacing*3/2 + beamXJitter(), beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
        spawnBullet('player', x - beamSpacing*1/2 + beamXJitter(), beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
        spawnBullet('player', x + beamSpacing*1/2 + beamXJitter(), beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
        spawnBullet('player', x + beamSpacing*3/2 + beamXJitter(), beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
        spawnBullet('player', x + beamSpacing*4/2 + beamXJitter(), beamY-30 + beamYJitter(), 0, beamVY(), { r: 6, color: color, damage: dmg, kind: 'beam', pierce: pierce, life: 5.0 });
      }
      sfx('beam');
    }
    p.fireCooldown = weaponDelay();
  }

  function activateOverdrive() {
    if (state.overdrive > 0) return;
    state.overdrive = 7;
    state.banner = '';
    state.bannerSub = '';
    state.bannerTimer = 0;
    state.flash = Math.max(state.flash, 0.25);
    sfx('overdrive');
    hint('Combo 10: OVERDRIVE ACTIVE!', 1.4);
    markHudDirty();
  }

  function findRocketTarget(b) {
    const p = state.player;
    const originX = p.x;
    const originY = p.y - 18;
    const maxAngle = lerp(0.26, 0.78, clamp(b.homing || 0, 0, 1));
    let best = null;
    let bestScore = Infinity;
    const enemyList = arguments.length > 1 && Array.isArray(arguments[1]) ? arguments[1] : state.enemies;

    function consider(target) {
      if (!target) return;
      const dx = target.x - originX;
      const dy = originY - target.y;
      if (dy <= 10) return;
      const angle = Math.atan2(Math.abs(dx), dy);
      if (angle > maxAngle) return;
      const score = dy + Math.abs(dx) * 0.65;
      if (score < bestScore) {
        bestScore = score;
        best = target;
      }
    }

    for (let i = 0; i < enemyList.length; i++) {
      const e = enemyList[i];
      if (!e || e.dead) continue;
      consider(e);
    }
    if (state.boss) consider(state.boss);
    return best;
  }

  function collectPickup(item) {
    const type = typeof item === 'string' ? item : item && item.type;
    const p = state.player;
    if (type === 'weapon') {
      const nextMode = item && item.weaponMode != null ? item.weaponMode : p.weaponMode;
      const sameFamily = Number.isFinite(nextMode) && (nextMode | 0) === p.weaponMode;
      if (Number.isFinite(nextMode)) {
        p.weaponMode = clamp(nextMode | 0, 0, WEAPONS.length - 1);
        if (!Array.isArray(p.weaponTiers) || p.weaponTiers.length !== WEAPONS.length) p.weaponTiers = Array(WEAPONS.length).fill(1);
        if (sameFamily) {
          if ((p.weaponTiers[p.weaponMode] || 1) >= 5) applyWeaponOverflowUpgrade(p);
          else p.weaponTiers[p.weaponMode] = Math.min(5, (p.weaponTiers[p.weaponMode] || 1) + 1);
        }
        p.weaponTier = clamp(p.weaponTiers[p.weaponMode] || 1, 1, 5);
      } else {
        p.weaponTier = 1;
      }
      state.banner = WEAPONS[p.weaponMode].name + ' ' + WEAPON_TIER_LABELS[p.weaponTier - 1];
      state.bannerSub = sameFamily ? 'Weapon family advanced.' : 'Weapon family switched.';
      //p.heat = 0;
    } else if (type === 'rapid') {
      p.rapidTimer = Math.max(p.rapidTimer, 8);
      state.banner = 'RAPID FIRE';
      state.bannerSub = 'The weapons rattles harder.';
      p.heat = 0;
    } else if (type === 'shield') {
      if (p.shield >= 3) {
        addScore(250);
        state.banner = 'EXTRA SHIELD';
        state.bannerSub = 'Overflow converted to score.';
      } else {
        p.shield = Math.min(3, p.shield + 1);
        state.banner = 'SHIELD UP';
        state.bannerSub = 'A bright hull wraps around the ship.';
      }
    } else if (type === 'bomb') {
      if (p.bombs >= 4) {
        addScore(250);
        state.banner = 'EXTRA BOMB';
        state.bannerSub = 'Overflow converted to score.';
      } else {
        p.bombs = Math.min(4, p.bombs + 1);
        state.banner = 'BOMB +1';
        state.bannerSub = 'Emergency button restocked.';
      }
    } else if (type === 'magnet') {
      p.magnetTimer = Math.max(p.magnetTimer, 12);
      state.banner = 'MAGNET FIELD';
      state.bannerSub = 'Pickups drift to the ship.';
    } else if (type === 'invuln') {
      p.invuln = Math.max(p.invuln, 4);
      p.shield = 3;
      p.health = p.maxHealth;
      p.repairDelay = 0;
      p.heat = 0;
      state.banner = 'STAR';
      state.bannerSub = 'Invuln, full shields, full repair, cool weapon.';
    } else {
      addScore(500);
      state.banner = 'GEM SCORE';
      state.bannerSub = 'Pure bonus juice.';
    }
    sfx('power');
    state.bannerTimer = 1.15;
    markHudDirty();
  }

  function useBomb() {
    const p = state.player;
    if (state.mode !== 'playing' || p.bombs <= 0) return;
    p.bombs--;
    p.invuln = 1.0;
    state.flash = Math.max(state.flash, 0.5);
    state.shake = Math.max(state.shake, 15);
    sfx('bomb');
    burst(p.x, p.y, '#fff0b5', 36, 260, 8, 'spark');
    clearEnemyBulletsWithBudget(state.settings.lowEndMode ? 8 : 24, '#ffe39a');
    for (let i = state.enemies.length - 1; i >= 0; i--) damageEnemy(state.enemies[i], 999, true);
    if (state.boss) {
      damageFinalBossClaw(state.boss, 'left', 18);
      damageFinalBossClaw(state.boss, 'right', 18);
      damageBoss(state.boss, 18, true);
    }
    markHudDirty();
  }

  function damageEnemy(e, damage, fromBomb) {
    if (!e || e.dead) return;
    e.hp -= damage;
    e.hitFlash = 0.08;
    e.hitSparkDamage = Math.max(1, damage | 0);
    if (e.hp <= 0) {
      e.dead = true;
      state.shake = Math.max(state.shake, 5);
      flashBurst(e.x, e.y, e.color);
      sfx('boom');
      addScore(e.score);
      if (state.overdrive <= 0) {
        state.combo++;
        state.comboTimer = 1.2;
        if (state.combo >= 3) {
          hint('Combo +' + state.combo, 0.5);
        }
        if (state.combo % 5 === 0) sfx('combo');
        if (state.combo >= 10) { state.combo = 0; activateOverdrive(); }
      }
      if (e.kind === 'spinner') ringBullets(e.x, e.y, 9, 180, 1, e.theme.accent2, 'enemy', 'spinner', e.name || 'spinner');
      if (e.kind === 'splitter') {
        const base = typeof e.flightAngle === 'number' ? e.flightAngle : Math.atan2(e.vy || 0, e.vx || 1);
        const spread = Math.PI / 6;
        const speed = 240;
        const a1 = base - spread;
        const a2 = base + spread;
        spawnBullet('enemy', e.x, e.y, Math.cos(a1) * speed, Math.sin(a1) * speed, { r: 7, color: e.theme.accent2, damage: 1, kind: 'splitter', life: 4.8, sourceKind: 'splitter', sourceName: e.name || 'splitter' });
        spawnBullet('enemy', e.x, e.y, Math.cos(a2) * speed, Math.sin(a2) * speed, { r: 7, color: e.theme.accent2, damage: 1, kind: 'splitter', life: 4.8, sourceKind: 'splitter', sourceName: e.name || 'splitter' });
      }
      //if (e.kind === 'elite' || e.score > 200) maybeDropPickup(e.x, e.y, true, chance(0.35) ? 'shield' : null);
      //else if (!fromBomb) maybeDropPickup(e.x, e.y, false);
      else maybeDropPickup(e.x, e.y, false);
    } else {
      sfx('hit');
    }
  }

  function damageBoss(b, damage, fromBomb) {
    if (!b || b.dead) return;
    const spawnShield = clamp((b.age || 0) / 10, 0, 1);
    const actualDamage = damage * spawnShield;
    if (actualDamage <= 0) return;
    b.hp -= actualDamage;
    b.hitFlash = 0.12;
    b.glowBoost = Math.min(1.0, (b.glowBoost || 0) + 0.25);
    if (b.claws) {
      b.clawGuard = Math.min(1, (b.clawGuard || 0) + 0.07);
      b.clawGuardDelay = 0.5;
    }
    //burst(b.x, b.y, b.color, 4 + Math.min(4, actualDamage), 190 + actualDamage * 15, 7, 'spark');
    if (b.hp <= 0) {
      b.dead = true;
      state.boss = null;
      clearArray(state.enemies);
      clearProjectileLists();
      burst(b.x, b.y, b.color, 60, 360, 9, 'spark');
      flashBurst(b.x, b.y, b.color);
      const p = state.player;
      if (Array.isArray(p.weaponTiers) && p.weaponTiers.length === WEAPONS.length) {
        const currentTier = p.weaponTiers[p.weaponMode] || 1;
        if (currentTier >= 4) p.weaponTiers[p.weaponMode] = Math.max(1, currentTier - 1);
        p.weaponTier = clamp(p.weaponTiers[p.weaponMode] || 1, 1, 5);
      } else {
        if (p.weaponTier >= 4) p.weaponTier = Math.max(1, p.weaponTier - 1);
      }
      sfx('boom');
      state.shake = Math.max(state.shake, 18);
      state.flash = Math.max(state.flash, 0.42);
      addScore(2500 + state.levelIndex * 300);
      state.banner = 'BOSS DOWN';
      state.bannerSub = b.name + ' has fallen.';
      state.bannerTimer = 2.2;
      state.nextLevelTimer = 2.4;
      state.transition = { type: 'clear', timer: 0 };
      finalizeStarfieldCap();
      state.player.health = Math.min(state.player.maxHealth, state.player.health + 1);
      state.player.bombs = Math.min(4, state.player.bombs + 1);
      state.player.shield = Math.min(3, state.player.shield + 1);
      sfx('clear');
      state.flash = Math.max(state.flash, 0.68);
      hint('Boss defeated! Next stage loading...', 2.6);
      markHudDirty();
    } else if (!fromBomb) {
      sfx('hit');
    }
  }

  function hurtPlayer(damage, source) {
    const p = state.player;
    if (p.invuln > 0 || state.mode !== 'playing') return;
    const actualDamage = Math.max(1, Math.round(damage * 3));
    state.lastHitInfo = {
      at: state.animClock,
      damage: damage,
      sourceKind: source && source.sourceKind ? source.sourceKind : '',
      sourceName: source && source.sourceName ? source.sourceName : '',
      kind: source && source.kind ? source.kind : '',
      team: source && source.team ? source.team : '',
      playerX: p.x,
      playerY: p.y,
      bullets: state.enemyBullets.length,
      enemies: state.enemies.length,
      boss: state.boss ? state.boss.name : ''
    };
    pushDebugEvent('hurtPlayer', {
      damage: damage,
      actualDamage: actualDamage,
      source: compactSourceInfo(source),
      player: {
        x: p.x,
        y: p.y,
        health: p.health,
        shield: p.shield,
        invuln: p.invuln,
        repairDelay: p.repairDelay
      },
      world: {
        bullets: state.enemyBullets.length,
        enemies: state.enemies.length,
        boss: state.boss ? state.boss.name : ''
      }
    });
    if (state.debugMode && state.debugDamageBreakpoints) debugger;
    if (p.shield > 0) {
      p.shield--;
      p.invuln = 1.0;
      state.flash = Math.max(state.flash, 0.1);
      burst(p.x, p.y, '#8fd8ff', 16, 220, 5, 'spark');
      sfx('power');
      triggerRumble(0.35, 80);
      markHudDirty();
      return;
    }
    p.health -= actualDamage;
    p.invuln = 1.0;
    p.repairDelay = 1.8;
    state.shake = Math.max(state.shake, 10);
    state.flash = Math.max(state.flash, 0.12);
    sfx('damage');
    burst(p.x, p.y, '#ffd96a', 16, 200, 5, 'spark');
    triggerRumble(0.8, 160);
    if (p.health <= 0) {
      state.lastDeathReason = describeDeathReason(source);
      pushDebugEvent('playerDeath', {
        reason: state.lastDeathReason,
        source: compactSourceInfo(source),
        player: {
          x: p.x,
          y: p.y,
          health: p.health,
          shield: p.shield,
          bombs: p.bombs,
          weaponMode: p.weaponMode,
          weaponTier: p.weaponTier
        },
        world: {
          bullets: state.enemyBullets.length,
          enemies: state.enemies.length,
          boss: state.boss ? state.boss.name : ''
        }
      });
      state.lives--;
      if (state.lives <= 0) return gameOver(state.lastDeathReason);
      shipDeathBurst(p.x, p.y);
      p.health = p.maxHealth;
      p.shield = Math.max(0, p.shield - 1);
      p.bombs = Math.max(0, p.bombs - 1);
      if (Array.isArray(p.weaponTiers) && p.weaponTiers.length === WEAPONS.length) {
        p.weaponTiers[p.weaponMode] = Math.max(1, (p.weaponTiers[p.weaponMode] || 1) - 1);
        let bestMode = 0;
        let bestTier = p.weaponTiers[0] || 1;
        for (let i = 1; i < p.weaponTiers.length; i++) {
          const tier = p.weaponTiers[i] || 1;
          if (tier > bestTier) {
            bestTier = tier;
            bestMode = i;
          }
        }
        p.weaponMode = bestMode;
        p.weaponTier = bestTier;
      } else {
        p.weaponTier = Math.max(1, p.weaponTier - 1);
      }
      if (state.banner === 'SHIP LOST') {
        // No extra weapon-grace trigger on death; the tier loss above is the only penalty.
      }
      p.rapidTimer = 0;
      state.combo = 0;
      state.comboTimer = 0;
      state.overdrive = 0;
      state.banner = 'SHIP LOST';
      state.bannerSub = 'Rescue plane incoming.';
      state.bannerTimer = 1.5;
      beginPlayerRespawn();
      hint('A life lost. Stay sharp.', 2.5);
    }
    markHudDirty();
  }

  function ringBullets(x, y, count, speed, damage, color, team, sourceKind, sourceName) {
    const resolvedKind = sourceKind || (team === 'enemy' ? 'enemy' : 'player');
    const resolvedName = sourceName || resolvedKind || (team === 'enemy' ? 'enemy' : 'player');
    for (let i = 0; i < count; i++) {
      const a = TAU * i / count;
      spawnBullet(team === 'enemy' ? 'enemy' : 'player', x, y, Math.cos(a) * speed, Math.sin(a) * speed, {
        r: team === 'enemy' ? 7 : 5, color: color, damage: damage, kind: team === 'enemy' ? 'orb' : 'spark', life: 4.5,
        sourceKind: resolvedKind,
        sourceName: resolvedName
      });
    }
  }

  const BOSS_ATTACKS = {
    aimed: function (b) {
      b.fireClock -= currentDt;
      if (b.fireClock > 0) return;
      b.fireClock = shotDelay(b.hp < b.maxHp * 0.5 ? 0.8 : 1.0);
      const pl = state.player;
      const base = ang(b.x, b.y, pl.x, pl.y);
      const n = b.hp < b.maxHp * 0.5 ? 5 : 3;
      for (let i = 0; i < n; i++) {
        const a = base + (i - (n - 1) * 0.5) * 0.15;
        spawnBullet('enemy', b.x, b.y + 12, Math.cos(a) * 260, Math.sin(a) * 260, { r: 8, color: b.color, damage: 1, kind: 'orb', life: 20, sourceKind: 'boss', sourceName: b.name });
      }
    },
    ring: function (b) {
      b.fireClock -= currentDt;
      if (b.fireClock > 0) return;
      b.fireClock = shotDelay(b.hp < b.maxHp * 0.5 ? 0.9 : 1.2);
      ringBullets(b.x, b.y, b.hp < b.maxHp * 0.5 ? 20 : 14, b.hp < b.maxHp * 0.5 ? 210 : 180, 1, b.color, 'enemy', 'boss', b.name);
    },
    fan: function (b) {
      b.fireClock -= currentDt;
      if (b.fireClock > 0) return;
      b.fireClock = shotDelay(b.hp < b.maxHp * 0.5 ?  0.8 : 1.0);
      const pl = state.player;
      const base = ang(b.x, b.y, pl.x, pl.y);
      const n = b.hp < b.maxHp * 0.5 ? 7 : 5;
      for (let i = 0; i < n; i++) {
        const a = base + lerp(-0.38, 0.38, n === 1 ? 0.5 : i / (n - 1));
        spawnBullet('enemy', b.x, b.y + 6, Math.cos(a) * 300, Math.sin(a) * 300, { r: 6, color: b.color, damage: 1, kind: 'sting', life: 20, sourceKind: 'boss', sourceName: b.name });
      }
    },
    rain: function (b) {
      b.fireClock -= currentDt;
      if (b.fireClock > 0) return;
      b.fireClock = shotDelay(b.hp < b.maxHp * 0.5 ? 0.3 : 0.5);
      for (let i = 0; i < (b.hp < b.maxHp * 0.5 ? 3 : 2); i++) {
        spawnBullet('enemy', clamp(b.x + rand(-160, 160), 24, view.w - 24), -20, rand(-22, 22), rand(220, 280), { r: 6, color: b.color, damage: 1, kind: 'rain', ay: 18, life: 10, sourceKind: 'boss', sourceName: b.name });
      }
    },
    summon: function (b) {
      b.fireClock -= currentDt;
      if (b.fireClock > 0) return;
      b.fireClock = shotDelay(b.hp < b.maxHp * 0.5 ? 0.5 : 1.0);
      spawnEnemy(pick(b.theme.enemyKinds), clamp(b.x + rand(-120, 120), 36, view.w - 36), b.y + rand(-10, 18), { vx: rand(-80, 80), vy: rand(120, 152) });
      if (chance(0.4)) spawnEnemy('swarm', clamp(b.x + rand(-120, 120), 36, view.w - 36), b.y + rand(-10, 18), { vx: rand(-80, 80), vy: rand(128, 160) });
    },
    beam: function (b) {
      b.fireClock -= currentDt;
      if (b.fireClock > 0) return;
      b.fireClock = shotDelay(b.hp < b.maxHp * 0.5 ? 1.2 : 1.8);
      for (let i = -4; i <= 4; i++) {
        spawnBullet('enemy', b.x + i * 18, b.y + 18, rand(-18, 18), 240 + i * 8, { r: 8, color: b.color, damage: 1, kind: 'beam', life: 20, sourceKind: 'boss', sourceName: b.name });
      }
    },
    wall: function (b) {
      b.fireClock -= currentDt;
      if (b.fireClock > 0) return;
      b.fireClock = shotDelay(b.hp < b.maxHp * 0.5 ? 1.35 : 1.95);
      const normalGap = PLAYER_RADIUS * 2.4;
      const wideGap = 256;
      const bulletCount = Math.max(2, Math.ceil(view.w / normalGap) + 3);
      const gapCenterMin = view.w * 0.25;
      const gapCenterMax = view.w * 0.75;
      const gapIndexMin = Math.max(0, Math.ceil((gapCenterMin - wideGap * 0.5 + normalGap) / normalGap));
      const gapIndexMax = Math.min(bulletCount - 2, Math.floor((gapCenterMax - wideGap * 0.5 + normalGap) / normalGap));
      const gapAfter = gapIndexMin <= gapIndexMax ? randi(gapIndexMin, gapIndexMax) : randi(0, bulletCount - 2);
      let x = -normalGap;
      for (let i = 0; i < bulletCount; i++) {
        spawnBullet('enemy', x, -18, 0, 220 + (b.hp < b.maxHp * 0.5 ? 20 : 0), { r: 6, color: b.color, damage: 1, kind: 'wall', life: 20, sourceKind: 'boss', sourceName: b.name });
        if (i < bulletCount - 1) x += (i === gapAfter ? wideGap : normalGap);
      }
    },
    spiral: function (b) {
      b.fireClock -= currentDt;
      if (b.fireClock > 0) return;
      b.fireClock = shotDelay(b.hp < b.maxHp * 0.5 ? 0.18 : 0.28);
      const n = 3;
      const spin = b.age * 1.8;
      for (let i = 0; i < n; i++) {
        const a = spin + i * (TAU / n);
        spawnBullet('enemy', b.x, b.y, Math.cos(a) * 220, Math.sin(a) * 220, { r: 6, color: b.color, damage: 1, kind: 'spiral', life: 20, sourceKind: 'boss', sourceName: b.name });
      }
    }
  };

  function updateBossMotion(b, phaseDef, dt) {
    b.motionClock += dt;
    const a = playArea();
    const cx = view.w * 0.5;
    let tx = cx, ty = 128;
    if (phaseDef.motion === 'hover') {
      tx = cx + Math.sin(b.age * 0.8) * 160;
      ty = 126 + Math.sin(b.age * 1.1) * 18;
    } else if (phaseDef.motion === 'sweep') {
      tx = cx + Math.sin(b.age * 0.48 + b.phaseIndex) * 240;
      ty = 132 + Math.sin(b.age * 1.3) * 20;
    } else if (phaseDef.motion === 'low') {
      tx = cx + Math.sin(b.age * 0.9) * 180;
      ty = 170 + Math.sin(b.age * 1.0) * 16;
    } else if (phaseDef.motion === 'dash') {
      if (!b.state.dashTarget || Math.abs(b.x - b.state.dashTarget) < 20) b.state.dashTarget = b.x < view.w * 0.5 ? view.w - 96 : 96;
      tx = b.state.dashTarget;
      ty = 148 + Math.sin(b.age * 2.1) * 14;
    }
    ty += Number.isFinite(b.yOffset) ? b.yOffset : 0;
    const prevX = b.x;
    const prevY = b.y;
    b.x = smooth(b.x, clamp(tx, 88, view.w - 88), 2.8, dt);
    b.y = smooth(b.y, clamp(ty, 88, a.bottom - 260), 2.1, dt);
    b.vx = dt > 0 ? (b.x - prevX) / dt : 0;
    b.vy = dt > 0 ? (b.y - prevY) / dt : 0;
    if (Math.abs(b.vx) > 0.5) b.facingRight = b.vx > 0;
  }

  function updateBoss(dt) {
    const b = state.boss;
    if (!b) return;
    const p = state.player;
    b.age += dt;
    b.hitBox = getBossHitBox(b.shipLevel || (state.levelIndex + 1));
    b.glowBoost = Math.max(0, (b.glowBoost || 0) - dt * 4.0);
    if (b.claws) {
      b.clawGuardDelay = Math.max(0, (b.clawGuardDelay || 0) - dt);
      if (b.clawGuardDelay <= 0) b.clawGuard = Math.max(0, (b.clawGuard || 0) - dt * 1.8);
    }
    b.phaseClock += dt;
    const phaseDef = b.phases[b.phaseIndex] || b.phases[b.phases.length - 1];
    if (b.phaseClock >= phaseDef.dur) {
      b.phaseClock = 0;
      b.phaseIndex = (b.phaseIndex + 1) % Math.max(1, b.phases.length);
      setBanner('PHASE SHIFT', b.name + ' is changing tactics.', 1.0);
      sfx('boss');
    }
    updateBossMotion(b, phaseDef, dt);
    if (p.invuln <= 0 && bossBodyAlphaHit(b, p.x, p.y, p.r)) {
      pushDebugEvent('bossContactHit', {
        boss: {
          name: b.name || '',
          x: b.x,
          y: b.y,
          hp: b.hp
        },
        player: {
          x: p.x,
          y: p.y,
          invuln: p.invuln
        },
        damage: currentDifficulty().contact
      });
      hurtPlayer(currentDifficulty().contact, { kind: 'boss-contact', sourceKind: 'boss-contact', sourceName: b.name });
    }
    const atk = BOSS_ATTACKS[phaseDef.attack];
    if (atk) atk(b, phaseDef);
    if (b.hitFlash > 0) b.hitFlash -= dt;
    if (b.claws) {
      if (b.claws.left) {
        b.claws.left.hitFlash = Math.max(0, b.claws.left.hitFlash - dt);
        b.claws.left.glowBoost = Math.max(0, (b.claws.left.glowBoost || 0) - dt * 4.0);
        b.claws.left.deathFlash = Math.max(0, b.claws.left.deathFlash - dt);
      }
      if (b.claws.right) {
        b.claws.right.hitFlash = Math.max(0, b.claws.right.hitFlash - dt);
        b.claws.right.glowBoost = Math.max(0, (b.claws.right.glowBoost || 0) - dt * 4.0);
        b.claws.right.deathFlash = Math.max(0, b.claws.right.deathFlash - dt);
      }
    }
  }

  function updatePlayer(dt) {
    const p = state.player;
    const prevX = p.x;
    const prevY = p.y;
    p.fireCooldown = Math.max(0, p.fireCooldown - dt);
    p.rapidTimer = Math.max(0, p.rapidTimer - dt);
    p.magnetTimer = Math.max(0, p.magnetTimer - dt);
    if (state.comboTimer > 0) {
      state.comboTimer -= dt;
      if (state.comboTimer <= 0) {
        if (state.combo >= 3) hint('Combo lost', 1.4);
        state.combo = 0;
      }
    }
    if (state.overdrive > 0) state.overdrive = Math.max(0, state.overdrive - dt);
    if (state.bannerTimer > 0) state.bannerTimer = Math.max(0, state.bannerTimer - dt);

    if (p.respawnTimer > 0) {
      p.respawnTimer = Math.max(0, p.respawnTimer - dt);
      const duration = Math.max(0.001, p.respawnDuration || 1);
      const t = clamp(1 - p.respawnTimer / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      p.x = smooth(p.x, p.respawnTargetX || (view.w * 0.5), 8.5, dt);
      p.y = lerp(p.respawnStartY || (view.h + 70), p.respawnTargetY || (playArea().bottom - 92), eased);
      p.fireHeld = false;
      p.pointerMode = false;
      if (p.respawnTimer > 0) return;
      p.x = p.respawnTargetX || (view.w * 0.5);
      p.y = p.respawnTargetY || (playArea().bottom - 92);
    }

    const a = playArea();
    if (state.pointerActive) {
      p.pointerMode = true;
      p.fireHeld = !!state.input.fire;
      const pointerLead = (36 + (state.overdrive > 0 ? 4 : 0)) * 1.5;
      p.x = smooth(p.x, clamp(state.pointerX, a.left, a.right), 7.5, dt);
      p.y = smooth(p.y, clamp(state.pointerY - pointerLead, a.top + 10, a.bottom - 10), 7.5, dt);
    } else {
      p.pointerMode = false;
      const digitalX = (state.input.right ? 1 : 0) - (state.input.left ? 1 : 0);
      const digitalY = (state.input.down ? 1 : 0) - (state.input.up ? 1 : 0);
      const usingDigitalMove = !!(digitalX || digitalY);
      const ax = usingDigitalMove ? digitalX : (state.input.moveX || 0);
      const ay = usingDigitalMove ? digitalY : (state.input.moveY || 0);
      const sp = 460 + (state.overdrive > 0 ? 80 : 0);
      if (ax || ay) {
        const len = Math.hypot(ax, ay) || 1;
        const scale = usingDigitalMove ? 1 / len : 1;
        p.x += ax * scale * sp * dt;
        p.y += ay * scale * sp * dt;
      }
      p.x = clamp(p.x, a.left, a.right);
      p.y = clamp(p.y, a.top + 10, a.bottom - 10);
      p.fireHeld = !!state.input.fire || !!state.gamepad.fireHeld;
    }
    if (p.health < p.maxHealth) {
      p.repairDelay = Math.max(0, p.repairDelay - dt);
      if (p.repairDelay <= 0 && p.invuln <= 0) {
        p.health = Math.min(p.maxHealth, p.health + dt * 0.22);
      }
    } else {
      p.repairDelay = 0;
    }
    if (state.mode === 'playing' && p.respawnTimer <= 0) {
      const prevHeat = p.heat || 0;
      if (p.fireHeld) p.heat = clamp(prevHeat + dt / HEAT_MAX_SECONDS, 0, 1);
      else p.heat = clamp(prevHeat - HEAT_COOLDOWN_FACTOR*dt / HEAT_MAX_SECONDS, 0, 1);
      if (Math.abs(p.heat - prevHeat) > 0.0005) markHudDirty();
    } else if (p.heat > 0) {
      p.heat = clamp((p.heat || 0) - HEAT_COOLDOWN_FACTOR*dt / HEAT_MAX_SECONDS, 0, 1);
      markHudDirty();
    }
    if (state.mode === 'playing' && p.fireHeld && p.fireCooldown <= 0) fireWeapon();
    p.vx = dt > 0 ? (p.x - prevX) / dt : 0;
    p.vy = dt > 0 ? (p.y - prevY) / dt : 0;
  }

  function updateBullets(dt) {
    const p = state.player;
    const enemyCollision = buildEnemyCollisionGrid();
    const enemyCandidates = [];
    const clearVersion = state.projectileClearVersion;
    let writeIndex = 0;
    for (let i = 0; i < state.bullets.length; i++) {
      const b = state.bullets[i];
      if (!b) continue;
      let remove = false;
      b.age += dt;
      if (b.kind === 'rocket' && b.homing > 0) {
        if (b.target && b.target.dead) {
          b.target = null;
          b.targetRefresh = 0;
        }
        b.targetRefresh = Math.max(0, (b.targetRefresh || 0) - dt);
        if (b.targetRefresh <= 0) {
          b.target = findRocketTarget(b, enemyCollision.activeEnemies);
          b.targetRefresh = rand(0.12, 0.20);
        }
        const target = b.target;
        if (target) {
          const ta = ang(b.x, b.y, target.x, target.y);
          const sp = Math.hypot(b.vx, b.vy);
          const cur = Math.atan2(b.vy, b.vx);
          const next = cur + clamp(ta - cur, -b.turn * dt, b.turn * dt) * b.homing;
          b.vx = Math.cos(next) * sp;
          b.vy = Math.sin(next) * sp;
        }
      }
      b.vx += b.ax * dt;
      b.vy += b.ay * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0 || b.x < -60 || b.x > view.w + 60 || b.y < -80 || b.y > view.h + 80) remove = true;
      if (state.boss && damageFinalBossClawAtPoint(state.boss, b.x, b.y, b.r, b.damage)) {
        if (b.kind === 'beam') {
          b.pierce = Math.max(0, (b.pierce || 0) - 1);
          if (b.pierce <= 0) remove = true;
        } else {
          remove = true;
        }
      }
      if (!remove && state.boss && bossBodyAlphaHit(state.boss, b.x, b.y, b.r)) {
        damageBoss(state.boss, b.damage, false);
        if (clearVersion !== state.projectileClearVersion) return;
        if (b.kind === 'beam') {
          b.pierce = Math.max(0, (b.pierce || 0) - 1);
          if (b.pierce <= 0) remove = true;
        } else if (b.pierce > 0) { b.pierce--; b.life -= 0.3; }
        else remove = true;
      }
      if (!remove) {
        collectEnemyCollisionCandidates(enemyCollision, b.x, b.y, b.r, enemyCandidates);
        for (let j = enemyCandidates.length - 1; j >= 0; j--) {
          const e = enemyCandidates[j];
          if (e.dead) continue;
          if (b.kind === 'beam' && b.lastEnemyHit === e) continue;
          if (d2(b.x, b.y, e.x, e.y) < (b.r + e.r) * (b.r + e.r)) {
            damageEnemy(e, b.damage, false);
            b.lastEnemyHit = e;
            if (b.kind === 'beam') {
              b.pierce = Math.max(0, (b.pierce || 0) - 1);
              if (b.pierce <= 0) { remove = true; break; }
            }
            else if (b.pierce > 0) { b.pierce--; b.life -= 0.18; }
            else { remove = true; break; }
          }
        }
      }
      if (remove || b.life <= 0) releaseProjectile(b);
      else state.bullets[writeIndex++] = b;
    }
    state.bullets.length = writeIndex;
    writeIndex = 0;
    for (let i = 0; i < state.enemyBullets.length; i++) {
      const b = state.enemyBullets[i];
      if (!b) continue;
      let remove = false;
      if (b.team === 'player' || b.sourceKind === 'player') {
        remove = true;
        if (state.debugMode) {
          pushDebugEvent('exceptionSelfHitGuard', {
            reason: 'Player-owned projectile reached enemy bullet collision path.',
            bullet: {
              team: b.team || '',
              kind: b.kind || '',
              sourceKind: b.sourceKind || '',
              sourceName: b.sourceName || '',
              x: b.x,
              y: b.y,
              life: b.life,
              age: b.age,
              r: b.r,
              damage: b.damage,
              inPool: !!b._inPool
            },
            player: {
              x: p.x,
              y: p.y,
              invuln: p.invuln
            },
            world: {
              bullets: state.bullets.length,
              enemyBullets: state.enemyBullets.length,
              enemies: state.enemies.length,
              boss: state.boss ? state.boss.name : ''
            }
          });
          debugger;
        }
      }
      if (remove) {
        releaseProjectile(b);
        continue;
      }
      b.age += dt;
      if (b.homing > 0) {
        const ta = ang(b.x, b.y, p.x, p.y);
        const sp = Math.hypot(b.vx, b.vy);
        const cur = Math.atan2(b.vy, b.vx);
        const next = cur + clamp(ta - cur, -b.turn * dt, b.turn * dt) * b.homing;
        b.vx = Math.cos(next) * sp;
        b.vy = Math.sin(next) * sp;
      }
      b.vx += b.ax * dt;
      b.vy += b.ay * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0 || b.x < -80 || b.x > view.w + 80 || b.y < -100 || b.y > view.h + 100) remove = true;
      if (p.invuln <= 0 && d2(b.x, b.y, p.x, p.y) < (b.r + p.r) * (b.r + p.r)) {
        remove = true;
        pushDebugEvent('enemyBulletHit', {
          bullet: {
            kind: b.kind || '',
            sourceKind: b.sourceKind || '',
            sourceName: b.sourceName || '',
            x: b.x,
            y: b.y,
            life: b.life,
            age: b.age,
            r: b.r,
            damage: b.damage
          },
          player: {
            x: p.x,
            y: p.y,
            invuln: p.invuln
          },
          expired: b.life <= 0
        });
        hurtPlayer(b.damage, { kind: 'enemy-shot', sourceKind: b.sourceKind || 'enemy', sourceName: b.sourceName || b.sourceKind || 'enemy' });
      }
      if (remove) releaseProjectile(b);
      else state.enemyBullets[writeIndex++] = b;
    }
    state.enemyBullets.length = writeIndex;
  }

  function buildEnemyCollisionGrid() {
    const cellSize = state.settings.lowEndMode ? 144 : 112;
    const buckets = new Map();
    const activeEnemies = [];
    let maxRadius = 0;
    for (let i = 0; i < state.enemies.length; i++) {
      const e = state.enemies[i];
      if (!e || e.dead) continue;
      activeEnemies.push(e);
      maxRadius = Math.max(maxRadius, e.r || 0);
      const radius = Math.max(1, e.r || 18);
      const minCellX = Math.floor((e.x - radius) / cellSize);
      const maxCellX = Math.floor((e.x + radius) / cellSize);
      const minCellY = Math.floor((e.y - radius) / cellSize);
      const maxCellY = Math.floor((e.y + radius) / cellSize);
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        for (let cx = minCellX; cx <= maxCellX; cx++) {
          const key = cx + '|' + cy;
          let bucket = buckets.get(key);
          if (!bucket) {
            bucket = [];
            buckets.set(key, bucket);
          }
          bucket.push(e);
        }
      }
    }
    return {
      cellSize: cellSize,
      maxRadius: maxRadius,
      buckets: buckets,
      activeEnemies: activeEnemies
    };
  }

  function collectEnemyCollisionCandidates(collision, x, y, radius, out) {
    out.length = 0;
    if (!collision || !collision.activeEnemies.length) return out;
    const searchRadius = Math.max(1, radius + collision.maxRadius);
    const minCellX = Math.floor((x - searchRadius) / collision.cellSize);
    const maxCellX = Math.floor((x + searchRadius) / collision.cellSize);
    const minCellY = Math.floor((y - searchRadius) / collision.cellSize);
    const maxCellY = Math.floor((y + searchRadius) / collision.cellSize);
    state.collisionQueryId += 1;
    const mark = state.collisionQueryId;
    for (let cy = minCellY; cy <= maxCellY; cy++) {
      for (let cx = minCellX; cx <= maxCellX; cx++) {
        const bucket = collision.buckets.get(cx + '|' + cy);
        if (!bucket) continue;
        for (let i = 0; i < bucket.length; i++) {
          const e = bucket[i];
          if (!e || e.dead || e._collisionMark === mark) continue;
          e._collisionMark = mark;
          out.push(e);
        }
      }
    }
    return out;
  }

  function tryEnemyFire(e, p, entering) {
    if (!e || e.fireCooldown > 0) return;
    const postEntrySlowdown = entering ? 1 : 2;
    if (e.kind === 'drifter') {
      if (e.y <= 70) return;
      e.fireCooldown = shotDelay(1.0 * postEntrySlowdown);
      const a = rand(0, TAU);
      const speed = 220;
      spawnBullet('enemy', e.x, e.y + 8, Math.cos(a) * speed, Math.sin(a) * speed, { r: 7, color: e.theme.accent2, damage: 1, kind: 'drifter', life: 4.8, sourceKind: e.kind, sourceName: e.name || e.kind });
      return;
    }
    if (e.kind === 'looper') {
      if (e.y <= 70) return;
      e.fireCooldown = shotDelay(1.0 * postEntrySlowdown);
      const moveX = e.loopDirX || Math.cos(e.loopHeading || (Math.PI * 0.5));
      const moveY = e.loopDirY || Math.sin(e.loopHeading || (Math.PI * 0.5));
      const moveLen = Math.max(0.001, Math.sqrt(moveX * moveX + moveY * moveY));
      const shotSpeed = 238;
      spawnBullet('enemy', e.x + moveX * 8, e.y + moveY * 8, (moveX / moveLen) * shotSpeed, (moveY / moveLen) * shotSpeed, { r: 7, color: e.theme.accent2, damage: 1, kind: 'looper', life: 4.8, sourceKind: e.kind, sourceName: e.name || e.kind });
      return;
    }
    if (e.kind === 'bomber') {
      e.fireCooldown = shotDelay(1.0 * postEntrySlowdown);
      spawnBullet('enemy', e.x, e.y + 14, rand(-34, 34), rand(180, 240), { r: 7, color: e.theme.accent2, damage: 1, kind: 'drop', ay: 58, life: 4.8, sourceKind: e.kind, sourceName: e.name || e.kind });
      return;
    }
    if (e.kind === 'sniper') {
      if (e.y <= 100) return;
      e.fireCooldown = shotDelay(1.5 * postEntrySlowdown);
      const base = ang(e.x, e.y, p.x, p.y);
      for (let k = -1; k <= 1; k++) {
        const aa = base + k * 0.1;
        spawnBullet('enemy', e.x, e.y, Math.cos(aa) * 240, Math.sin(aa) * 240, { r: 7, color: e.theme.accent, damage: 1, kind: 'shot', life: 4.6, sourceKind: e.kind, sourceName: e.name || e.kind });
      }
      return;
    }
    if (e.kind === 'spinner') {
      if (e.y <= 80) return;
      e.fireCooldown = shotDelay(3.0 * postEntrySlowdown);
      ringBullets(e.x, e.y, 6 + Math.floor(state.levelIndex / 3), 150 + state.levelIndex * 8, 1, e.theme.accent2, 'enemy', 'spinner', e.name || 'spinner');
      return;
    }
    if (e.kind === 'diver') {
      if (e.y <= 70) return;
      e.fireCooldown = shotDelay(1.0 * postEntrySlowdown);
      const base = ang(e.x, e.y, p.x, p.y);
      const moveX = e.vx || Math.cos(base);
      const moveY = e.vy || Math.sin(base);
      const moveLen = Math.max(1, Math.sqrt(moveX * moveX + moveY * moveY));
      const speed = 240;
      spawnBullet('enemy', e.x, e.y + 8, (moveX / moveLen) * speed, (moveY / moveLen) * speed, { r: 7, color: e.theme.accent2, damage: 1, kind: 'diver', life: 4.8, sourceKind: e.kind, sourceName: e.name || e.kind });
      return;
    }
    if (e.kind === 'elite') {
      e.fireCooldown = shotDelay(1.0 * postEntrySlowdown);
      const base = ang(e.x, e.y, p.x, p.y);
      ringBullets(e.x, e.y, 8, 160, 1, e.theme.accent2, 'enemy', e.kind, e.name || e.kind);
      spawnBullet('enemy', e.x, e.y, Math.cos(base) * 220, Math.sin(base) * 220, { r: 7, color: e.theme.accent, damage: 1, kind: 'elite', life: 4.8, sourceKind: e.kind, sourceName: e.name || e.kind });
    }
  }

  function updateEnemyMovement(e, dt, a, p, entering) {
    if (entering) return false;
    if (e.kind === 'drifter') {
      e.y += e.vy * dt;
      e.x += Math.sin(e.age * 3 + e.wobble) * 18 * dt;
      return false;
    }
    if (e.kind === 'looper') {
      const looperSpeed = Math.max(70, Math.sqrt((e.vx || 0) * (e.vx || 0) + (e.vy || 0) * (e.vy || 0)));
      if (e.loopDirX == null || e.loopDirY == null) {
        const heading = (Math.PI * 0.5) + rand(-Math.PI * 0.25, Math.PI * 0.25);
        e.loopDirX = Math.cos(heading);
        e.loopDirY = Math.sin(heading);
        if (e.loopDirY < 0.22) e.loopDirY = 0.22;
        const norm = Math.max(0.0001, Math.sqrt(e.loopDirX * e.loopDirX + e.loopDirY * e.loopDirY));
        e.loopDirX /= norm;
        e.loopDirY /= norm;
        e.loopHeading = Math.atan2(e.loopDirY, e.loopDirX);
        e.loopActive = false;
        e.loopAccum = 0;
        e.loopTurnDir = 0;
      }
      if (e.loopActive) {
        const loopRadius = e.loopRadius || 52;
        const omega = looperSpeed / Math.max(24, loopRadius);
        const turnDir = e.loopTurnDir || 1;
        e.loopHeading += turnDir * omega * dt;
        e.loopAccum += omega * dt;
        e.loopDirX = Math.cos(e.loopHeading);
        e.loopDirY = Math.sin(e.loopHeading);
        e.x += e.loopDirX * looperSpeed * dt;
        e.y += e.loopDirY * looperSpeed * dt;
        if (e.loopAccum >= (e.loopTurnGoal || TAU)) {
          e.loopActive = false;
          e.loopAccum = 0;
          e.loopHeading = e.loopEndHeading != null ? e.loopEndHeading : e.loopHeading;
          e.loopDirX = Math.cos(e.loopHeading);
          e.loopDirY = Math.sin(e.loopHeading);
          const norm = Math.max(0.0001, Math.sqrt(e.loopDirX * e.loopDirX + e.loopDirY * e.loopDirY));
          e.loopDirX /= norm;
          e.loopDirY /= norm;
          e.loopHeading = Math.atan2(e.loopDirY, e.loopDirX);
        }
      } else {
        const loopStartBottom = view.h * 0.75;
        if (Math.random() < dt * (1 / 3) && e.y > 46 && e.y < loopStartBottom) {
          e.loopTurnDir = Math.random() < 0.5 ? -1 : 1;
          e.loopRadius = rand(50, 250);
          e.loopActive = true;
          e.loopAccum = 0;
          const startHeading = e.loopHeading || Math.atan2(e.loopDirY || 1, e.loopDirX || 0);
          const endHeading = (Math.PI * 0.5) + rand(-Math.PI * 0.25, Math.PI * 0.25);
          // Finish near downward direction after about one full loop.
          const delta = Math.atan2(Math.sin(endHeading - startHeading), Math.cos(endHeading - startHeading));
          e.loopTurnGoal = Math.max(Math.PI * 1.5, Math.min(Math.PI * 2.5, TAU + (e.loopTurnDir * delta)));
          e.loopEndHeading = endHeading;
        }
        e.x += e.loopDirX * looperSpeed * dt;
        e.y += e.loopDirY * looperSpeed * dt;
      }
      if (e.x < a.left || e.x > a.right) {
        e.loopDirX *= -1;
        e.loopHeading = Math.atan2(e.loopDirY, e.loopDirX);
        if (e.loopActive) e.loopTurnDir *= -1;
        e.x = clamp(e.x, a.left, a.right);
      }
      return (e.x < -e.r || e.x > view.w + e.r || e.y < -e.r || e.y > view.h + e.r);
    }
    if (e.kind === 'swarm') {
      e.y += e.vy * dt;
      e.x += Math.sin(e.age * 6 + e.wobble) * 46 * dt;
      return false;
    }
    if (e.kind === 'bomber') {
      e.y += e.vy * dt;
      e.x += Math.sin(e.age * 1.5 + e.wobble) * 24 * dt;
      return false;
    }
    if (e.kind === 'sniper') {
      e.y += e.vy * dt * 0.5;
      e.x += Math.sin(e.age * 1.2 + e.wobble) * 14 * dt;
      return false;
    }
    if (e.kind === 'spinner') {
      e.y += e.vy * dt * 0.7;
      e.x += Math.cos(e.age * 1.1 + e.wobble) * 24 * dt;
      return false;
    }
    if (e.kind === 'splitter') {
      e.y += e.vy * dt;
      e.x += Math.sin(e.age * 2.2 + e.wobble) * 18 * dt;
      return false;
    }
    if (e.kind === 'diver') {
      const base = ang(e.x, e.y, p.x, p.y);
      e.vx = lerp(e.vx, Math.cos(base) * 80, 0.018);
      e.vy = lerp(e.vy, 120 + Math.sin(e.age * 2 + e.wobble) * 22, 0.02);
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      return false;
    }
    if (e.kind === 'mine') {
      e.y += e.vy * dt;
      e.x += Math.sin(e.age * 1.4 + e.wobble) * 12 * dt;
      return false;
    }
    if (e.kind === 'elite') {
      e.y += e.vy * dt * 0.85;
      e.x += Math.sin(e.age * 1.8 + e.wobble) * 20 * dt;
    }
    return false;
  }

  function updateEnemies(dt) {
    const p = state.player;
    const a = playArea();
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      if (e.dead) { state.enemies.splice(i, 1); continue; }
      e.age += dt;
      e.fireCooldown -= dt;
      if (e.hitFlash > 0) e.hitFlash -= dt;
      const prevX = e.x;
      const prevY = e.y;
      let entering = false;
      if (e.entry) {
        entering = true;
        const en = e.entry;
        en.age = (en.age || 0) + dt;
        const mirror = en.mirror || 1;
        const sx = mirror < 0 ? view.w - en.startX : en.startX;
        const tx = mirror < 0 ? view.w - en.targetX : en.targetX;
        const cx = mirror < 0 ? view.w - en.controlX : en.controlX;
        const t = clamp(en.age / en.duration, 0, 1);
        const ease = t * t * (3 - 2 * t);
        const spin = ease * TAU * en.turns * 0.01;
        const sway = Math.sin(spin + en.phase);
        const swirl = Math.cos(spin + en.phase * 1.35);
        const bend = Math.sin(ease * Math.PI) * en.bend;
        const pull = ease * ease;
        const curveX = lerp(lerp(sx, cx, ease), lerp(cx, tx, ease), ease);
        const curveY = lerp(lerp(en.startY, en.controlY, ease), lerp(en.controlY, en.targetY, ease), ease);
        e.x = curveX + en.normalX * bend + sway * en.swirl;
        e.y = curveY + en.normalY * bend + swirl * (en.swirl * 0.62) + pull * -18;
        e.wobble += dt * 0.03;
        if (t >= 1) {
          e.entry = null;
          e.x = tx;
          e.y = en.targetY;
          e.wobble += en.phase;
          entering = false;
        }
      }
      if (updateEnemyMovement(e, dt, a, p, entering)) { state.enemies.splice(i, 1); continue; }
      tryEnemyFire(e, p, entering);
      e.flightAngle = Math.atan2(e.y - prevY, e.x - prevX);
      if (e.y > view.h + 72 || e.x < -90 || e.x > view.w + 90) { state.enemies.splice(i, 1); continue; }
      if (d2(e.x, e.y, p.x, p.y) < (e.r + p.r) * (e.r + p.r)) {
        if (p.invuln > 0) continue;
        const contactDamage = currentDifficulty().contact;
        pushDebugEvent('enemyContactHit', {
          enemy: {
            kind: e.kind || '',
            name: e.name || e.kind || '',
            x: e.x,
            y: e.y,
            hp: e.hp,
            r: e.r
          },
          player: {
            x: p.x,
            y: p.y,
            invuln: p.invuln
          },
          damage: contactDamage
        });
        damageEnemy(e, contactDamage, false);
        hurtPlayer(contactDamage, { kind: 'enemy-contact', sourceKind: e.kind, sourceName: e.name || e.kind });
        if (e.kind !== 'mine' || e.hp <= 0) { state.enemies.splice(i, 1); continue; }
      }
    }
  }

  function updatePickups(dt) {
    const p = state.player;
    const magnet = p.magnetTimer > 0 ? 600 : 0;
    for (let i = state.pickups.length - 1; i >= 0; i--) {
      const it = state.pickups[i];
      it.life -= dt;
      it.bob += dt * 5;
      if (magnet > 0) {
        const d = Math.sqrt(d2(it.x, it.y, p.x, p.y));
        if (d < magnet) {
          const canPullWeapon = it.type !== 'weapon' || it.weaponMode == null || it.weaponMode === p.weaponMode;
          if (canPullWeapon) {
            const a = ang(it.x, it.y, p.x, p.y);
            const pull = it.type === 'weapon' ? 60 : 120;
            it.vx += Math.cos(a) * pull * dt;
            it.vy += Math.sin(a) * pull * dt;
          }
        }
      }
      it.x += it.vx * dt;
      it.y += it.vy * dt;
      it.vx *= 0.996;
      it.vy *= 0.995;
      if (it.y > view.h + 50 || it.life <= 0) { state.pickups.splice(i, 1); continue; }
      if (d2(it.x, it.y, p.x, p.y) < (it.r + p.r) * (it.r + p.r)) {
        state.pickups.splice(i, 1);
        collectPickup(it);
      }
    }
  }

  function updateParticles(dt) {
    let writeIndex = 0;
    for (let i = 0; i < state.particles.length; i++) {
      const p = state.particles[i];
      p.life -= dt;
      if (p.kind === 'ring') p.size += dt * 180;
      else { p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt; }
      if (p.life <= 0) releaseParticle(p);
      else state.particles[writeIndex++] = p;
    }
    state.particles.length = writeIndex;
  }

  function updateSceneLayer(items, dt, titleBoost) {
    const boost = state.mode === 'title' ? titleBoost : 0;
    const time = state.levelClock + state.musicStep * 0.05;
    for (let i = 0; i < items.length; i++) {
      const b = items[i];
      const sway = b.sway ? Math.sin((time * b.swayRate) + b.phase + i * 0.11) * b.sway : 0;
      b.x = b.baseX + sway;
      b.y += (b.speed + boost) * dt;
      if (b.y > b.wrapBottom) {
        b.y = b.wrapTop - rand(0, 120);
        if (chance(0.45)) b.baseX = clamp(b.baseX + rand(-64, 64), -120, view.w + 120);
      }
    }
  }

  function updateBackground(dt) {
    state.decorBackgroundTick ^= 1;
    if ((state.decorBackgroundTick & 1) === 0) updateDecorBackgrounds(dt);
    if (state.backgroundBitmap) {
      const bg = state.backgroundBitmap;
      bg.scroll = clamp(bg.scroll - bg.speed * dt, 0, bg.maxScroll);
    } else {
      updateSceneLayer(state.background, dt, 4);
    }
    if (state.foregroundBitmap) {
      const fg = state.foregroundBitmap;
      fg.scroll = clamp(fg.scroll - fg.speed * dt, 0, fg.maxScroll);
    }
  }

  function updateMusic(dt) {
    if (!audio.ctx || audio.ctx.state !== 'running' || state.muted) return;
    if (state.mode !== 'playing' && state.mode !== 'title') return;
    const theme = mainTheme();
    const beat = 60 / theme.music.bpm / 2;
    state.musicClock += dt;
    while (state.musicClock >= beat) {
      state.musicClock -= beat;
      const step = state.musicStep++;
      const n = theme.music.pattern[step % theme.music.pattern.length];
      const f = theme.music.root * Math.pow(2, n / 12);
      tone({ freq: f, endFreq: f * 1.03, dur: beat * 0.7, gain: state.mode === 'title' ? 0.03 : 0.04, type: 'triangle', pan: (step % 4 - 1.5) * 0.12, bus: 'music' });
      if (step % 4 === 0) tone({ freq: f * 0.5, endFreq: f * 0.52, dur: beat * 1.3, gain: state.mode === 'title' ? 0.04 : 0.05, type: 'sine', bus: 'music' });
      if (step % 2 === 0) tone({ freq: f * 2, endFreq: f * 2.03, dur: beat * 0.3, gain: 0.016, type: 'square', bus: 'music' });
    }
  }

  function updateTransition(dt) {
    if (!state.transition) return;
    state.transition.timer += dt;
    if (state.transition.type === 'clear' && state.transition.timer >= state.nextLevelTimer) {
      state.transition = null;
      if (state.levelIndex >= THEMES.length - 1) victory();
      else beginLevel(state.levelIndex + 1);
    }
  }

  function update(dt) {
    currentDt = dt;
    updateBackground(dt);
    updateScrollingClouds(dt);
    state.animClock += dt;
    updateGamepadInput();
    if (state.mode === 'debug') return;
    if (state.mode === 'title') { updateMusic(dt); updateParticles(dt); return; }
    if (state.mode === 'gameover' || state.mode === 'victory') { updateMusic(dt * 0.35); updateParticles(dt); if (state.player.invuln > 0) state.player.invuln = Math.max(0, state.player.invuln - dt); return; }
    if (state.paused) return;
    updatePlayer(dt);
    if (state.boss) updateBoss(dt);
    if (!state.boss) {
      state.levelClock += dt;
    }
    // During boss fight, enemy waves spawn at 50% rate
    state.waveClock += state.boss ? dt * 0.50 : dt;
    updateBullets(dt);
    updateEnemies(dt);
    updatePickups(dt);
    updateParticles(dt);
    updateTransition(dt);
    if (!state.transition) {
      const theme = state.currentTheme;
      const spawnInterval = clamp(1.3 - state.levelIndex * 0.01, 0.5, 2.0);
      while (state.waveClock >= spawnInterval) { state.waveClock -= spawnInterval; spawnWave(theme); }
      if (!state.boss && state.levelClock >= 40 + state.levelIndex * 2) spawnBoss(theme);
    }
    updateMusic(dt);
    if (state.flash > 0) state.flash = Math.max(0, state.flash - dt * 0.85);
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 12);
    if (state.player.invuln > 0) state.player.invuln = Math.max(0, state.player.invuln - dt);
  }

  function roundRect(x, y, w, h, r) {
    const rr = Math.max(0, Math.min(r, Math.abs(w) * 0.5, Math.abs(h) * 0.5));
    hudCtx.beginPath();
    if (hudCtx.roundRect) {
      hudCtx.roundRect(x, y, w, h, rr);
      return;
    }
    hudCtx.moveTo(x + rr, y);
    hudCtx.lineTo(x + w - rr, y);
    hudCtx.quadraticCurveTo(x + w, y, x + w, y + rr);
    hudCtx.lineTo(x + w, y + h - rr);
    hudCtx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    hudCtx.lineTo(x + rr, y + h);
    hudCtx.quadraticCurveTo(x, y + h, x, y + h - rr);
    hudCtx.lineTo(x, y + rr);
    hudCtx.quadraticCurveTo(x, y, x + rr, y);
  }

  function drawGlowCircle(x, y, r, color, alpha, blur) {
    const b = blur == null ? Math.max(10, r * 0.8) : blur;
    const a = alpha == null ? 1 : alpha;
    if (a <= 0 || r <= 0) return;
    if (state.settings.lowEndMode) {
      const rr = Math.max(1, r * getGlowRadiusScale());
      drawSpriteCircle(x, y, Math.max(1, rr + Math.max(1, b * 0.28 * getGlowRadiusScale())), color, a * 0.72 * getFxQuality(), 0, true);
      return;
    }
    drawSpriteCircle(x, y, r + b * 0.82, color, a * 0.32, 0, true);
    drawSpriteCircle(x, y, r + b * 0.45, color, a * 0.58, 0, true);
    drawSpriteCircle(x, y, Math.max(1, r * 0.72), color, a, 0, true);
  }

  function drawGlowCircleNormal(x, y, r, color, alpha, blur) {
    const b = blur == null ? Math.max(10, r * 0.8) : blur;
    const a = alpha == null ? 1 : alpha;
    if (a <= 0 || r <= 0) return;
    drawSpriteCircle(x, y, r + b * 0.82, color, a * 0.32, 0, true);
    drawSpriteCircle(x, y, r + b * 0.45, color, a * 0.58, 0, true);
    drawSpriteCircle(x, y, Math.max(1, r * 0.72), color, a, 0, true);
  }

  function drawSoftEdgeGlow(x, y, maxR, color, alpha) {
    const a = alpha == null ? 1 : alpha;
    const r = Math.max(1, maxR || 40);
    if (state.settings.lowEndMode) {
      drawSpriteCircle(x, y, r * 0.38, color, a * 0.72, 0, true);
      drawSpriteCircle(x, y, r * 0.78, color, a * 0.22, 0, true);
      return;
    }
    drawSpriteCircle(x, y, r * 0.22, color, a * 0.9, 0, true);
    drawSpriteCircle(x, y, r * 0.42, color, a * 0.58, 0, true);
    drawSpriteCircle(x, y, r * 0.66, color, a * 0.22, 0, true);
    drawSpriteCircle(x, y, r * 0.86, color, a * 0.08, 0, true);
  }

  const SHIELD_RING_TEXTURE_CACHE = new Map();

  function getShieldRingTexture(thickness) {
    const t = clamp(Math.round(thickness || 2), 1, 6);
    let tex = SHIELD_RING_TEXTURE_CACHE.get(t);
    if (tex) return tex;
    const dim = 128;
    const c = makeDomCanvas(dim, dim);
    const g = c.getContext('2d');
    const cx = dim * 0.5;
    const cy = dim * 0.5;
    g.clearRect(0, 0, dim, dim);
    g.strokeStyle = '#ffffff';
    g.lineWidth = t;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath();
    g.arc(cx, cy, dim * 0.38, 0, TAU);
    g.stroke();
    tex = createTextureFromCanvas(c);
    SHIELD_RING_TEXTURE_CACHE.set(t, tex);
    return tex;
  }

  function drawRingGlow(x, y, outerR, innerR, color, alpha, blur) {
    const outer = Math.max(1, outerR);
    const ring = getShieldRingTexture(2);
    drawTextureRect(ring, x, y, outer * 2, outer * 2, { fill: color || '#ffffff', alpha: alpha == null ? 1 : alpha, layer: 0, lighter: false });
  }

  function buildCloudClusterPoints(cx, cy, r, count, seed) {
    const pts = [{ x: cx, y: cy }];
    const rngSeed = (seed | 0) || 1;
    let s = rngSeed;
    function rand01() {
      s = (s * 1664525 + 1013904223) | 0;
      return ((s >>> 0) / 4294967295);
    }
    let guard = 0;
    while (pts.length < count && guard++ < count * 24) {
      const base = pts[(rand01() * pts.length) | 0];
      const ang = rand01() * TAU;
      const dist = r * lerp(0.3, 0.7, rand01());
      const x = base.x + Math.cos(ang) * dist;
      const y = base.y + Math.sin(ang) * dist;
      let near = 0;
      let tooClose = false;
      for (let i = 0; i < pts.length; i++) {
        const dx = x - pts[i].x;
        const dy = y - pts[i].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d <= r) near++;
        if (d <= r * 0.6) tooClose = true;
      }
      if (!tooClose && near >= 1 && near <= 12) {
        pts.push({ x: x, y: y });
      }
    }
    return pts;
  }

  function createScrollingCloud(index) {
    const w = Math.max(1, view.w);
    const h = Math.max(1, view.h);
    return {
      x: w * (0.12 + index * 0.22),
      y: -h * (0.18 + index * 0.08),
      delay: lerp(0, 2, Math.random()),
      speed: (18 + index * 3) * 10,
      vx: (Math.random() - 0.5) * 10,
      seed: 37 + index * 19,
      points: null,
      texture: null,
      texW: 0,
      texH: 0,
      bounds: null,
      r: 96 + index * 10,
      cluster: 9 + index,
      a: 0.20 + index * 0.02,
      cloudType: 1 // Blue
    };
  }

  function ensureScrollingCloudPoints(cloud) {
    if (cloud.points) return cloud.points;
    cloud.points = buildCloudClusterPoints(0, 0, cloud.r, cloud.cluster, cloud.seed);
    return cloud.points;
  }

  function ensureScrollingCloudTexture(cloud) {
    if (cloud.texture) return cloud.texture;
    const pts = ensureScrollingCloudPoints(cloud);
    const blueCloud = cloud.cloudType === 1;
    const renderScale = 1 / CLOUD_LAYER_FACTOR;
    const blobW = blueCloud ? 500 : 300;
    const blobH = blueCloud ? 500 : 300;
    const blobX = blueCloud ? -250 : -150;
    const blobY = blueCloud ? -550 : -150;
    const blobPadX = Math.max(48, Math.ceil(blobW * 0.5));
    const blobPadY = Math.max(48, Math.ceil(Math.abs(blobY) + blobH * 0.5));
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      minX = Math.min(minX, p.x - cloud.r * 2.2 - blobPadX);
      minY = Math.min(minY, p.y - cloud.r * 2.2 - blobPadY);
      maxX = Math.max(maxX, p.x + cloud.r * 2.2 + blobPadX);
      maxY = Math.max(maxY, p.y + cloud.r * 2.2 + blobPadY);
    }
    const pad = blueCloud ? Math.max(64, Math.round(cloud.r * 0.8)) : Math.max(48, Math.round(cloud.r * 0.6));
    minX -= pad; minY -= pad; maxX += pad; maxY += pad;
    const texW = Math.max(32, Math.ceil((maxX - minX) * renderScale));
    const texH = Math.max(32, Math.ceil((maxY - minY) * renderScale));
    const c = makeCanvas(texW, texH);
    const g = c.getContext('2d');
    if (!g) return null;
    g.clearRect(0, 0, texW, texH);
    const whiteImg = ensureGlowImage('assets/glow_e_white.png');
    const blueImg = ensureGlowImage('assets/glow_e_blue.png');
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const px = (p.x - minX) * renderScale;
      const py = (p.y - minY) * renderScale;

      // Normal cloud
      if (!blueCloud) {
        if (whiteImg) {
          g.globalAlpha = cloud.a * 0.28;
          g.drawImage(whiteImg, px - 150 * renderScale, py - 150 * renderScale, 300 * renderScale, 300 * renderScale);
        }
        if (blueImg) {
          g.globalAlpha = cloud.a * 0.22;
          g.drawImage(blueImg, px - 150 * renderScale, py - 150 * renderScale, 300 * renderScale, 300 * renderScale);
        }
      }

      // Deep blue cloud
      if (blueCloud) {
        if (blueImg) {
          g.globalAlpha = cloud.a * 0.22;
          g.drawImage(blueImg, px + blobX * renderScale, py + blobY * renderScale, blobW * renderScale, blobH * renderScale);
        }
      }
      

    }
    g.globalAlpha = 1;
    cloud.texture = createTextureFromCanvas(c);
    cloud.texW = texW;
    cloud.texH = texH;
    cloud.drawW = maxX - minX;
    cloud.drawH = maxY - minY;
    cloud.bounds = { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
    return cloud.texture;
  }

  function releaseScrollingCloudTexture(cloud) {
    if (!cloud || !cloud.texture || !gl || !gl.deleteTexture) return;
    try {
      gl.deleteTexture(cloud.texture);
    } catch (e) {}
    cloud.texture = null;
  }

  function clearScrollingClouds() {
    if (!state.scrollingClouds) return;
    for (let i = 0; i < state.scrollingClouds.length; i++) {
      const cloud = state.scrollingClouds[i];
      releaseScrollingCloudTexture(cloud);
      cloud.points = null;
      cloud.sourceCanvas = null;
      cloud.texW = 0;
      cloud.texH = 0;
      cloud.bounds = null;
    }
    state.scrollingClouds = null;
  }

  function clearDecorBackgrounds() {
    state.decorBackgrounds = null;
  }

  function createDecorBackground(index) {
    const w = Math.max(1, view.w);
    const h = Math.max(1, view.h);
    return {
      index: index,
      imageIndex: randomPlanetDecorIndex(),
      x: w * (0.10 + Math.random() * 0.78),
      y: -Math.max(180, h * (0.10 + Math.random() * 0.18)),
      speed: (14 + Math.random() * 16) * 5 * 0.125,
      vx: (Math.random() - 0.5) * 12,
      scale: 1 + Math.random(),
      alpha: 0.42 + Math.random() * 0.18,
      rot: (Math.random() - 0.5) * 0.24,
      spin: (Math.random() - 0.5) * 0.0025,
      drift: Math.random() * TAU,
      delay: 0
    };
  }

  function resetDecorBackground(dec) {
    const w = Math.max(1, view.w);
    const h = Math.max(1, view.h);
    dec.imageIndex = randomPlanetDecorIndex();
    dec.x = w * (0.10 + Math.random() * 0.78);
    dec.y = -Math.max(180, h * (0.10 + Math.random() * 0.18));
    dec.speed = (14 + Math.random() * 16) * 5 * 0.125;
    dec.vx = (Math.random() - 0.5) * 12;
    dec.scale = 1 + Math.random();
    dec.alpha = 0.42 + Math.random() * 0.18;
    dec.rot = (Math.random() - 0.5) * 0.24;
    dec.spin = (Math.random() - 0.5) * 0.0025;
    dec.drift = Math.random() * TAU;
    dec.delay = 0;
  }

  function updateDecorBackgrounds(dt) {
    if (state.settings.lowEndMode) {
      clearDecorBackgrounds();
      return;
    }
    if (!state.decorBackgrounds) {
      state.decorBackgrounds = [];
      const count = 1;
      for (let i = 0; i < count; i++) state.decorBackgrounds.push(createDecorBackground(i));
    }
    const h = Math.max(1, view.h);
    for (let i = 0; i < state.decorBackgrounds.length; i++) {
      const d = state.decorBackgrounds[i];
      if (d.delay > 0) {
        d.delay = Math.max(0, d.delay - dt);
        if (d.delay > 0) continue;
        resetDecorBackground(d);
      }
      d.x += d.vx * dt;
      d.y += d.speed * dt;
      d.rot += d.spin * dt;
      d.vx += Math.sin((state.animClock + i) * 0.27 + d.drift) * dt * 0.35;
      const img = getPlanetDecorImage(d.imageIndex);
      if (img && d.y - img.naturalHeight * d.scale > h + 120) {
        d.delay = lerp(4, 8, Math.random());
        d.imageIndex = randomPlanetDecorIndex();
        d.y = -Math.max(180, h * (0.10 + Math.random() * 0.18));
      }
    }
  }

  function drawDecorBackgrounds() {
    if (state.settings.lowEndMode || !state.decorBackgrounds || !state.decorBackgrounds.length) return;
    for (let i = 0; i < state.decorBackgrounds.length; i++) {
      const d = state.decorBackgrounds[i];
      if (d.delay > 0) continue;
      const img = getPlanetDecorImage(d.imageIndex);
      if (!img || !img.naturalWidth || !img.naturalHeight) continue;
      const tex = ensurePlanetDecorTexture(d.imageIndex);
      if (!tex) continue;
      const w = img.naturalWidth * 2;
      const h = img.naturalHeight * 2;
      const sway = Math.sin(state.animClock * 0.18 + d.drift) * 10;
      drawTextureRect(tex, d.x + sway, d.y, w, h, {
        rot: d.rot,
        alpha: d.alpha * 0.5,
        layer: 0,
        lighter: false
      });
    }
  }

  function resetScrollingCloud(cloud) {
    const w = Math.max(1, view.w);
    cloud.x = w * (0.10 + Math.random() * 0.78);
    cloud.y = -Math.max(180, view.h * (0.10 + Math.random() * 0.18));
    cloud.delay = 0;
    cloud.speed = (14 + Math.random() * 16) * 10;
    cloud.vx = (Math.random() - 0.5) * 12;
    cloud.seed = (Math.random() * 0x7fffffff) | 0;
    cloud.r = 90 + Math.random() * 36;
    cloud.cluster = 8 + ((Math.random() * 5) | 0);
    cloud.a = 0.16 + Math.random() * 0.08;
    cloud.cloudType = 1; // Blue
    cloud.points = null;
    cloud.sourceCanvas = null;
    releaseScrollingCloudTexture(cloud);
    cloud.texW = 0;
    cloud.texH = 0;
    cloud.bounds = null;
  }

  function updateScrollingClouds(dt) {
    if (state.settings.lowEndMode) {
      clearScrollingClouds();
      return;
    }
    if (!state.scrollingClouds) {
      state.scrollingClouds = [createScrollingCloud(0), createScrollingCloud(1), createScrollingCloud(2), createScrollingCloud(3), createScrollingCloud(4), createScrollingCloud(5), createScrollingCloud(6)];
    }
    const h = Math.max(1, view.h);
    for (let i = 0; i < state.scrollingClouds.length; i++) {
      const c = state.scrollingClouds[i];
      if (c.delay > 0) {
        c.delay = Math.max(0, c.delay - dt);
        if (c.delay > 0) continue;
        resetScrollingCloud(c);
      }
      c.y += c.speed * dt;
      c.x += c.vx * dt;
      c.vx += Math.sin((state.animClock + i) * 0.7) * dt * 2.2;
      ensureScrollingCloudTexture(c);
      if (c.bounds && c.y + c.bounds.minY > h + c.r * 1.2) {
        c.delay = lerp(0, 2, Math.random());
        c.points = null;
        releaseScrollingCloudTexture(c);
        c.texW = 0;
        c.texH = 0;
        c.bounds = null;
        c.y = h + c.r * 2;
      }
    }
  }

  function drawScrollingClouds() {
    if (state.settings.lowEndMode || !state.scrollingClouds || !state.scrollingClouds.length) return;
    for (let i = 0; i < state.scrollingClouds.length; i++) {
      const c = state.scrollingClouds[i];
      if (c.delay > 0) continue;
      const tex = ensureScrollingCloudTexture(c);
      if (!tex || !c.bounds) continue;
      const cx = c.x + (c.bounds.minX + c.bounds.maxX) * 0.5;
      const cy = c.y + (c.bounds.minY + c.bounds.maxY) * 0.5;
      drawTextureRect(tex, cx, cy, c.drawW || c.texW, c.drawH || c.texH, {
        alpha: 1,
        layer: 1,
        lighter: false
      });
    }
  }

  function drawEmojiGlyph(text, x, y, size, opts) {
    if (!text) return;
    const o = opts || {};
    drawSpriteEmoji(text, x, y, Number.isFinite(size) ? size : 16, {
      rot: o.rot || 0,
      alpha: o.alpha == null ? 1 : o.alpha,
      layer: o.layer || 0,
      lighter: o.lighter,
      fill: o.fill || '#ffffff'
    });
  }

  function drawBar(x, y, w, h, ratio, fill, back, label, flat) {
    x = Number.isFinite(x) ? x : 0;
    y = Number.isFinite(y) ? y : 0;
    w = Number.isFinite(w) ? w : 0;
    h = Number.isFinite(h) ? h : 0;
  const p = clamp(ratio, 0, 1);
  hudCtx.save();
  hudCtx.fillStyle = back || 'rgba(255,255,255,0.12)';
  hudCtx.strokeStyle = 'rgba(255,255,255,0.18)';
  hudCtx.lineWidth = 1;
  roundRect(x, y, w, h, h * 0.5);
  hudCtx.fill();
  hudCtx.stroke();
  if (p > 0) {
    hudCtx.fillStyle = flat ? (fill || '#ffffff') : (function () {
      const g = hudCtx.createLinearGradient(x, y, x + w, y);
      g.addColorStop(0, fill || '#ffffff');
      g.addColorStop(1, 'rgba(255,255,255,0.95)');
      return g;
    })();
    roundRect(x + 1, y + 1, Math.max(0, (w - 2) * p), h - 2, h * 0.45);
    hudCtx.fill();
    }
    if (label) {
      const prev = hudCtx.globalCompositeOperation;
      hudCtx.globalCompositeOperation = 'xor';
      hudCtx.fillStyle = '#fff';
      hudCtx.font = '700 9px "Segoe UI", sans-serif';
      hudCtx.textAlign = 'center';
      hudCtx.textBaseline = 'middle';
      hudCtx.fillText(label, x + w * 0.5, y + h * 0.52);
      hudCtx.globalCompositeOperation = prev;
    }
    hudCtx.restore();
  }

  function measureHudTextWidth(text, font) {
    hudCtx.save();
    hudCtx.font = font;
    const width = hudCtx.measureText(text).width;
    hudCtx.restore();
    return width;
  }

  function drawWorldBar(x, y, w, h, ratio, fill, back, layer) {
      x = Number.isFinite(x) ? x : 0;
      y = Number.isFinite(y) ? y : 0;
      w = Number.isFinite(w) ? w : 0;
      h = Number.isFinite(h) ? h : 0;
      const p = clamp(ratio, 0, 1);
      const l = Number.isFinite(layer) ? layer : 0;
      const cy = y + h * 0.5;
      const color = fill || '#ffffff';
      const border = 1 / Math.max(1, view.dpr);

      drawSpriteRect(x + w * 0.5, cy, w, h, color, 1.0, l, false);

      const innerX = x + border;
      const innerY = y + border;
      const innerW = Math.max(0, w - border * 2);
      const innerH = Math.max(0, h - border * 2);
      const missingW = innerW * (1 - p);

      if (missingW > 0 && innerH > 0) {
          drawSpriteRect(
              innerX + innerW * p + missingW * 0.5,
              innerY + innerH * 0.5,
              missingW,
              innerH,
              '#000000',
              1.00,
              l + 0.01,
              false
          );
      }
  }

  function drawSceneHill(o, theme) {
    const x = o.x;
    const y = o.y;
    const w = Math.max(40, o.w || view.w * 1.2);
    const h = Math.max(18, o.h || view.h * 0.18);
    const base = o.color || theme.accent || '#4c8a36';
    const top = o.color2 || theme.accent2 || '#7fd66d';
    const style = o.style || 'hill';
    let fill = base;
    let glow = top;
    if (style === 'water') { fill = o.color || '#244f59'; glow = o.color2 || '#5dd1c7'; }
    else if (style === 'lava') { fill = o.color || '#5d2118'; glow = o.color2 || theme.glow || '#ff9b2f'; }
    else if (style === 'scrap') { fill = o.color || '#3a434d'; glow = o.color2 || '#8f9aa5'; }
    else if (style === 'rock' || style === 'stone') { fill = o.color || '#2d3851'; glow = o.color2 || '#6f7ba0'; }
    else if (style === 'candy') { fill = o.color || '#8b4ca6'; glow = o.color2 || '#ff9ed6'; }
    else if (style === 'honey') { fill = o.color || '#69401a'; glow = o.color2 || '#ffd36a'; }
    else if (style === 'city' || style === 'street' || style === 'sky') { fill = o.color || '#17243f'; glow = o.color2 || '#6c4da8'; }
    drawSpriteRect(x, y + h * 0.42, w, h * 0.96, fill, 0.94, o.layer, false);
    drawGlowCircle(x - w * 0.26, y + h * 0.06, h * 0.72, glow, 0.26, h * 0.48);
    drawGlowCircle(x, y - h * 0.04, h * 0.82, glow, 0.24, h * 0.5);
    drawGlowCircle(x + w * 0.26, y + h * 0.06, h * 0.72, glow, 0.26, h * 0.48);
  }

  function drawSceneTree(o, theme) {
    const layer = o.layer || 0;
    const s = Math.max(0.5, o.scale || 1);
    const x = o.x;
    const y = o.y;
    const trunk = o.color || '#6b482d';
    const leaf = o.color2 || theme.accent || '#5fbf55';
    const accent = o.accent || theme.accent2 || '#ffd96a';
    const style = o.style || 'orchard';
    const trunkW = 8 * s;
    const trunkH = 20 * s;
    drawSpriteRect(x, y + trunkH * 0.18, trunkW, trunkH, trunk, 0.95, layer + 0, false);
    if (style === 'marsh') {
      drawSpriteRect(x - trunkW * 0.15, y - 6 * s, trunkW * 1.3, 12 * s, leaf, 0.6, layer + 1, false, -0.1);
      drawGlowCircle(x, y - 18 * s, 14 * s, leaf, 0.26, 10);
      drawGlowCircle(x - 10 * s, y - 6 * s, 10 * s, leaf, 0.22, 8);
      drawGlowCircle(x + 9 * s, y - 2 * s, 11 * s, leaf, 0.24, 8);
    } else {
      const top = y - 16 * s;
      drawGlowCircle(x - 10 * s, top + 5 * s, 12 * s, leaf, 0.28, 12);
      drawGlowCircle(x + 10 * s, top + 5 * s, 12 * s, leaf, 0.28, 12);
      drawGlowCircle(x, top - 5 * s, 15 * s, leaf, 0.34, 14);
      drawGlowCircle(x - 2 * s, top + 12 * s, 13 * s, leaf, 0.3, 12);
      if (style === 'orchard' || style === 'hive') {
        const fruits = o.fruit.length ? o.fruit : [accent, '#ff7e67', '#ffb75f'];
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * TAU + (o.phase || 0);
          const fx = x + Math.cos(a) * 10 * s;
          const fy = top + Math.sin(a * 1.2) * 8 * s;
          drawGlowCircle(fx, fy, 2.2 * s, fruits[i % fruits.length], 0.95, 4);
        }
      }
    }
  }

  function drawSceneBranch(o, theme) {
    const layer = o.layer || 0;
    const s = Math.max(0.55, o.scale || 1);
    const x = o.x;
    const y = o.y;
    const side = o.side < 0 ? -1 : 1;
    const style = o.style || 'orchard';
    const color = o.color || '#6a4a2f';
    const color2 = o.color2 || theme.accent2 || '#ffffff';
    const mainLen = 54 * s;
    const tipLen = 30 * s;
    const rot = side < 0 ? 0.52 : -0.52;
    const stemW = 8 * s;
    if (style === 'grass') {
      for (let i = 0; i < 4; i++) {
        const off = (i - 1.5) * 7 * s;
        const a = (side < 0 ? -0.12 : 0.12) + (i - 1.5) * 0.06;
        drawSpriteRect(x + off, y - 10 * s, 4 * s, 40 * s, color, 0.72, layer + i, false, a);
        drawGlowCircle(x + off, y - 18 * s, 3 * s, color2, 0.5, 4);
      }
      return;
    }
    if (style === 'cable') {
      drawSpriteRect(x, y, mainLen * 1.05, stemW, '#1b2333', 0.9, layer + 0, false, rot);
      drawSpriteRect(x + side * 18 * s, y + 6 * s, mainLen * 0.6, stemW * 0.85, '#12161f', 0.88, layer + 1, false, rot * 0.82);
      drawGlowCircle(x + side * 18 * s, y + 6 * s, 2.4 * s, color2, 0.48, 4);
      return;
    }
    if (style === 'drip') {
      for (let i = 0; i < 3; i++) {
        const dx = side * (18 + i * 12) * s;
        drawSpriteRect(x + dx, y + i * 4 * s, 5 * s, 34 * s + i * 8 * s, color, 0.72, layer + i, false, 0);
        drawGlowCircle(x + dx, y + 22 * s + i * 5 * s, 5.5 * s, color2, 0.82, 6);
      }
      return;
    }
    if (style === 'steam' || style === 'rain') {
      for (let i = 0; i < 4; i++) {
        const off = side * (10 + i * 7) * s;
        drawSpriteRect(x + off, y + i * 3 * s, 3 * s, 28 * s + i * 6 * s, color2, 0.7, layer + i, false, side < 0 ? 0.2 : -0.2);
      }
      return;
    }
    if (style === 'shard') {
      drawSpriteRect(x, y, 10 * s, 34 * s, color2, 0.84, layer + 0, false, side < 0 ? 0.32 : -0.32);
      drawSpriteRect(x + side * 10 * s, y + 5 * s, 8 * s, 24 * s, color, 0.74, layer + 1, false, side < 0 ? -0.18 : 0.18);
      return;
    }
    if (style === 'battlement') {
      for (let i = 0; i < 3; i++) {
        drawSpriteRect(x + side * (8 + i * 10) * s, y + i * 2 * s, 8 * s, 28 * s, color, 0.9, layer + i, false, side < 0 ? 0.1 : -0.1);
      }
      return;
    }
    if (style === 'filigree') {
      drawSpriteRect(x, y, mainLen, stemW * 0.8, color2, 0.64, layer + 0, false, rot);
      drawSpriteRect(x + side * 14 * s, y - 10 * s, tipLen, stemW * 0.72, color, 0.54, layer + 1, false, rot * 0.8);
      drawGlowCircle(x + side * 14 * s, y - 10 * s, 3 * s, color2, 0.8, 4);
      return;
    }
    drawSpriteRect(x, y, mainLen, stemW, color, 0.9, layer + 0, false, rot);
    drawSpriteRect(x + side * 16 * s, y - 2 * s, tipLen, stemW * 0.9, color, 0.85, layer + 1, false, rot * 0.82);
    drawSpriteRect(x + side * 30 * s, y - 10 * s, 18 * s, stemW * 0.75, color, 0.8, layer + 2, false, rot * 0.72);
    if (style === 'orchard' || style === 'vine' || style === 'hedge' || style === 'wax') {
      drawGlowCircle(x + side * 20 * s, y - 4 * s, 6 * s, color2, 0.6, 6);
      drawGlowCircle(x + side * 32 * s, y - 12 * s, 5 * s, color2, 0.55, 5);
    }
  }

  function drawSceneFlower(o, theme) {
    const layer = o.layer || 0;
    const s = Math.max(0.4, o.scale || 1);
    const x = o.x;
    const y = o.y;
    const stem = o.color || theme.accent || '#69c26a';
    const petal = o.color2 || theme.accent2 || '#ffe88b';
    drawSpriteRect(x, y + 8 * s, 2 * s, 16 * s, stem, 0.8, layer, false);
    for (let i = 0; i < 5; i++) {
      const a = TAU * i / 5;
      drawGlowCircle(x + Math.cos(a) * 4 * s, y + Math.sin(a) * 4 * s, 1.8 * s, petal, 0.9, 3);
    }
    drawGlowCircle(x, y, 1.2 * s, '#ffffff', 0.85, 2);
  }

  function drawSceneBuilding(o, theme) {
    const layer = o.layer || 0;
    const s = Math.max(0.5, o.scale || 1);
    const x = o.x;
    const y = o.y;
    const style = o.style || 'city';
    const base = o.color || '#4f5b67';
    const glow = o.color2 || theme.accent2 || '#ffffff';
    const w = Math.max(16, (o.w || 70) * s);
    const h = Math.max(18, (o.h || 90) * s);
    drawSpriteRect(x, y + h * 0.2, w, h, base, 0.94, layer, false);
    if (style === 'barn') {
      drawSpriteRect(x, y - 10 * s, w * 0.96, 12 * s, glow, 0.6, layer + 1, false, -0.1);
      drawSpriteRect(x, y + h * 0.42, w * 0.24, h * 0.34, '#5b371f', 0.95, layer + 2, false);
      drawGlowCircle(x - w * 0.18, y + h * 0.05, 8 * s, glow, 0.6, 4);
    } else if (style === 'factory') {
      drawSpriteRect(x - w * 0.1, y - h * 0.18, w * 0.3, h * 0.22, '#666f7a', 0.96, layer + 1, false);
      drawSpriteRect(x + w * 0.12, y - h * 0.26, w * 0.16, h * 0.3, '#55606a', 0.96, layer + 1, false);
      drawGlowCircle(x + w * 0.2, y - h * 0.42, 10 * s, glow, 0.6, 6);
    } else if (style === 'hive') {
      drawGlowCircle(x, y - h * 0.08, w * 0.42, glow, 0.34, h * 0.18);
      drawGlowCircle(x - w * 0.15, y + h * 0.02, w * 0.34, glow, 0.3, h * 0.16);
      drawGlowCircle(x + w * 0.18, y + h * 0.02, w * 0.34, glow, 0.3, h * 0.16);
      drawSpriteRect(x - w * 0.15, y + h * 0.14, w * 0.3, h * 0.18, '#5c330b', 0.72, layer + 1, false);
    } else if (style === 'kitchen') {
      drawSpriteRect(x - w * 0.14, y - h * 0.2, w * 0.18, h * 0.26, '#7d5d49', 0.9, layer + 1, false);
      drawSpriteRect(x + w * 0.14, y - h * 0.12, w * 0.14, h * 0.18, '#aa7852', 0.9, layer + 1, false);
      drawGlowCircle(x, y - h * 0.38, 10 * s, glow, 0.56, 6);
    } else if (style === 'arcade' || style === 'city') {
      const win = Math.max(3, o.windows || 4);
      for (let i = 0; i < win; i++) {
        const wx = x - w * 0.32 + (i + 0.5) * (w * 0.64 / win);
        drawSpriteRect(wx, y + h * (0.06 + (i % 2) * 0.12), 4 * s, 10 * s, glow, 0.72, layer + 1, false);
      }
      drawSpriteRect(x, y - h * 0.18, w * 0.9, 6 * s, glow, 0.8, layer + 1, false);
    } else if (style === 'citadel' || style === 'storm') {
      drawSpriteRect(x - w * 0.22, y - h * 0.15, w * 0.12, h * 0.24, glow, 0.8, layer + 1, false);
      drawSpriteRect(x + w * 0.18, y - h * 0.12, w * 0.12, h * 0.2, glow, 0.8, layer + 1, false);
      drawSpriteRect(x, y - h * 0.32, w * 0.2, h * 0.14, glow, 0.74, layer + 1, false);
      drawSpriteRect(x, y + h * 0.28, w * 0.28, h * 0.18, glow, 0.72, layer + 1, false);
    } else if (style === 'palace') {
      drawGlowCircle(x, y - h * 0.3, 10 * s, glow, 0.82, 8);
      drawSpriteRect(x - w * 0.08, y - h * 0.06, w * 0.18, h * 0.36, glow, 0.72, layer + 1, false);
    }
  }

  function drawSceneCloud(o, theme) {
    const layer = o.layer || 0;
    const s = Math.max(0.5, o.scale || 1);
    const x = o.x;
    const y = o.y;
    const style = o.style || 'fluff';
    const base = o.color || theme.accent2 || '#ffffff';
    const glow = o.color2 || theme.glow || base;
    const alpha = style === 'storm' ? 0.38 : style === 'mist' ? 0.18 : 0.28;
    const size = 16 * s;
    drawGlowCircle(x - 12 * s, y + 2 * s, size * 0.9, base, alpha, 14);
    drawGlowCircle(x, y - 6 * s, size * 1.1, base, alpha + 0.05, 16);
    drawGlowCircle(x + 14 * s, y + 2 * s, size * 0.92, base, alpha, 14);
    if (style === 'storm' || style === 'smoke' || style === 'steam') {
      drawGlowCircle(x + 3 * s, y - 10 * s, size * 0.8, glow, 0.2, 8);
    }
  }

  function drawSceneGear(o, theme) {
    const layer = o.layer || 0;
    const s = Math.max(0.45, o.scale || 1);
    const x = o.x;
    const y = o.y;
    const base = o.color || '#8f9aa5';
    const glow = o.color2 || theme.accent2 || '#d2d8df';
    drawGlowCircle(x, y, 10 * s, base, 0.7, 8);
    drawGlowCircle(x, y, 4 * s, glow, 0.9, 3);
    for (let i = 0; i < 6; i++) {
      const a = TAU * i / 6;
      drawSpriteRect(x + Math.cos(a) * 9 * s, y + Math.sin(a) * 9 * s, 3 * s, 8 * s, glow, 0.55, layer + i, false, a);
    }
  }

  function drawSceneReed(o, theme) {
    const layer = o.layer || 0;
    const s = Math.max(0.45, o.scale || 1);
    const x = o.x;
    const y = o.y;
    const stem = o.color || '#6e9462';
    const tip = o.color2 || theme.accent2 || '#ffd7a5';
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 4 * s;
      drawSpriteRect(x + dx, y + i * 3 * s, 2 * s, 28 * s + i * 4 * s, stem, 0.84, layer + i, false, (i - 1) * 0.06);
      drawGlowCircle(x + dx, y - 16 * s + i * 3 * s, 2.2 * s, tip, 0.8, 4);
    }
  }

  function drawSceneCrystal(o, theme) {
    const layer = o.layer || 0;
    const s = Math.max(0.5, o.scale || 1);
    const x = o.x;
    const y = o.y;
    const base = o.color || '#79f6ff';
    const glow = o.color2 || theme.accent2 || '#f1e7ff';
    drawGlowCircle(x, y, 12 * s, base, 0.34, 12);
    drawSpriteRect(x - 8 * s, y + 4 * s, 8 * s, 34 * s, base, 0.78, layer + 0, false, -0.32);
    drawSpriteRect(x + 4 * s, y + 6 * s, 8 * s, 28 * s, glow, 0.84, layer + 1, false, 0.2);
    drawSpriteRect(x + 10 * s, y + 10 * s, 5 * s, 22 * s, base, 0.72, layer + 2, false, -0.08);
  }

  function drawSceneCandy(o, theme) {
    const layer = o.layer || 0;
    const s = Math.max(0.5, o.scale || 1);
    const x = o.x;
    const y = o.y;
    const style = o.style || 'lollipop';
    const base = o.color || '#ff79b6';
    const glow = o.color2 || theme.accent2 || '#ffffff';
    if (style === 'cane') {
      drawSpriteRect(x, y + 6 * s, 5 * s, 30 * s, glow, 0.82, layer + 0, false, -0.12);
      drawSpriteRect(x + 4 * s, y - 8 * s, 16 * s, 5 * s, base, 0.82, layer + 1, false, 0.56);
      drawGlowCircle(x + 10 * s, y - 11 * s, 8 * s, glow, 0.74, 7);
    } else {
      drawSpriteRect(x, y + 8 * s, 5 * s, 32 * s, glow, 0.82, layer + 0, false, 0);
      drawGlowCircle(x, y - 8 * s, 12 * s, base, 0.88, 10);
      drawGlowCircle(x - 4 * s, y - 10 * s, 8 * s, glow, 0.5, 5);
      drawGlowCircle(x + 5 * s, y - 4 * s, 6 * s, '#ffffff', 0.55, 4);
    }
  }

  function drawSceneWall(o, theme) {
    const layer = o.layer || 0;
    const s = Math.max(0.6, o.scale || 1);
    const x = o.x;
    const y = o.y;
    const base = o.color || '#4f4f63';
    const glow = o.color2 || theme.accent2 || '#d8d8e8';
    const w = Math.max(30, (o.w || 90) * s);
    const h = Math.max(24, (o.h || 80) * s);
    drawSpriteRect(x, y + h * 0.18, w, h * 0.9, base, 0.95, layer + 0, false);
    for (let i = -2; i <= 2; i++) {
      drawSpriteRect(x + i * 10 * s, y - h * 0.28, 8 * s, 14 * s, glow, 0.78, layer + 1, false);
    }
    drawSpriteRect(x - w * 0.2, y - h * 0.06, w * 0.18, h * 0.18, glow, 0.72, layer + 2, false);
    drawSpriteRect(x + w * 0.08, y - h * 0.06, w * 0.18, h * 0.18, glow, 0.72, layer + 2, false);
  }

  function drawScenePillar(o, theme) {
    const layer = o.layer || 0;
    const s = Math.max(0.6, o.scale || 1);
    const x = o.x;
    const y = o.y;
    const base = o.color || '#7d6aa8';
    const glow = o.color2 || theme.accent2 || '#ffe78a';
    const w = Math.max(16, (o.w || 48) * s);
    const h = Math.max(24, (o.h || 100) * s);
    drawSpriteRect(x, y + h * 0.15, w, h, base, 0.94, layer + 0, false);
    drawSpriteRect(x, y - h * 0.16, w * 1.08, 10 * s, glow, 0.84, layer + 1, false);
    drawGlowCircle(x, y - h * 0.34, 7 * s, glow, 0.82, 8);
  }

  function drawSceneArch(o, theme) {
    const layer = o.layer || 0;
    const s = Math.max(0.6, o.scale || 1);
    const x = o.x;
    const y = o.y;
    const base = o.color || '#677291';
    const glow = o.color2 || theme.accent2 || '#c6d2ff';
    const w = Math.max(32, (o.w || 110) * s);
    const h = Math.max(20, (o.h || 60) * s);
    drawSpriteRect(x - w * 0.32, y + h * 0.08, 10 * s, h * 0.9, base, 0.9, layer + 0, false);
    drawSpriteRect(x + w * 0.32, y + h * 0.08, 10 * s, h * 0.9, base, 0.9, layer + 0, false);
    drawSpriteRect(x, y - h * 0.15, w * 0.72, 10 * s, glow, 0.72, layer + 1, false);
    drawGlowCircle(x, y - h * 0.25, 8 * s, glow, 0.8, 8);
  }

  function drawSceneObject(o, theme) {
    if (!o) return;
    switch (o.kind) {
      case 'hill': drawSceneHill(o, theme); break;
      case 'tree': drawSceneTree(o, theme); break;
      case 'branch': drawSceneBranch(o, theme); break;
      case 'flower': drawSceneFlower(o, theme); break;
      case 'building': drawSceneBuilding(o, theme); break;
      case 'cloud': drawSceneCloud(o, theme); break;
      case 'gear': drawSceneGear(o, theme); break;
      case 'reed': drawSceneReed(o, theme); break;
      case 'crystal': drawSceneCrystal(o, theme); break;
      case 'candy': drawSceneCandy(o, theme); break;
      case 'wall': drawSceneWall(o, theme); break;
      case 'pillar': drawScenePillar(o, theme); break;
      case 'arch': drawSceneArch(o, theme); break;
      default: break;
    }
  }

  function drawSceneLayer(items, theme) {
    for (let i = 0; i < items.length; i++) drawSceneObject(items[i], theme);
  }

  function drawBackground() {
    drawStarfield();
    drawDecorBackgrounds();
    drawScrollingClouds();
  }

  function drawForeground() {
    if (state.foregroundBitmap) {
      const fgScale = state.foregroundBitmap.contentScale || 1;
      drawTextureSlice(state.foregroundBitmap.texture, view.w * 0.5, view.h * 0.5, view.w, view.h, state.foregroundBitmap.scroll * fgScale, view.h * fgScale, state.foregroundBitmap.textureHeight || state.foregroundBitmap.height, {
        layer: 90,
        alpha: 1
      });
      return;
    }
    drawSceneLayer(state.foreground, mainTheme());
  }

  function drawBullets() {
    function drawShot(b) {
      const speed = Math.max(1, Math.hypot(b.vx, b.vy));
      const trail = clamp(speed * 0.02, 10, 26);
      const ang = Math.atan2(b.vy, b.vx);
      const beamBody = b.kind === 'beam';
      const fanBody = b.kind === 'fan';
      const rocketBody = b.kind === 'rocket';
      const bodyW = beamBody ? trail * 1.6 : trail;
      const bodyH = beamBody ? (b.team === 'player' ? 4.5 : 5.2) : (b.team === 'player' ? 4 : 5);
      const glow1 = beamBody ? 0 : rocketBody ? b.r * 1.85 : b.r * 2.2;
      const glow2 = beamBody ? 0 : rocketBody ? b.r * 0.92 : b.r * 1.15;
      const glow3 = beamBody ? 0 : rocketBody ? b.r * 0.52 : b.r;
      const lowFx = state.settings.lowEndMode;
      if (beamBody) {
        drawSpriteRect(b.x - Math.cos(ang) * bodyW * 0.5, b.y - Math.sin(ang) * bodyW * 0.5, bodyW, bodyH, b.color, b.team === 'player' ? 0.72 : 0.65, 2, true, ang);
      } else if (fanBody) {
        drawSpriteCircle(b.x, b.y, b.r * 0.62, b.color, b.team === 'player' ? 0.90 : 0.80, 2, true);
        if (lowFx && b.team !== 'player') {
          drawGlowCircleNormal(b.x, b.y, b.r * 2.2, b.color, 0.18, 18);
          drawGlowCircleNormal(b.x, b.y, b.r * 1.15, b.color, 0.38, 10);
          drawGlowCircleNormal(b.x, b.y, b.r, b.color, 0.85, 6);
        } else {
          drawGlowCircleNormal(b.x, b.y, b.r * 2.2, b.color, b.team === 'player' ? 0.20 : 0.18, 18);
          drawGlowCircleNormal(b.x, b.y, b.r * 1.15, b.color, b.team === 'player' ? 0.45 : 0.38, 10);
          drawGlowCircleNormal(b.x, b.y, b.r, b.color, b.team === 'player' ? 0.95 : 0.85, 6);
        }
      } else if (rocketBody) {
        drawSpriteRect(b.x - Math.cos(ang) * bodyW * 0.5, b.y - Math.sin(ang) * bodyW * 0.5, bodyW, bodyH, b.color, b.team === 'player' ? 0.72 : 0.65, 2, true, ang);
        if (lowFx && b.team !== 'player') {
          drawGlowCircleNormal(b.x, b.y, glow1, '#0038ff', 0.10, 12);
          drawGlowCircleNormal(b.x, b.y, glow2, '#004cff', 0.14, 8);
          drawGlowCircleNormal(b.x, b.y, glow3, '#005fff', 0.18, 5);
        } else {
          drawGlowCircleNormal(b.x, b.y, glow1, '#0038ff', b.team === 'player' ? 0.12 : 0.10, 12);
          drawGlowCircleNormal(b.x, b.y, glow2, '#004cff', b.team === 'player' ? 0.18 : 0.14, 8);
          drawGlowCircleNormal(b.x, b.y, glow3, '#005fff', b.team === 'player' ? 0.24 : 0.18, 5);
        }
      } else {
        drawSpriteRect(b.x - Math.cos(ang) * bodyW * 0.5, b.y - Math.sin(ang) * bodyW * 0.5, bodyW, bodyH, b.color, b.team === 'player' ? 0.72 : 0.65, 2, true, ang);
        if (lowFx && b.team !== 'player') {
          drawGlowCircleNormal(b.x, b.y, glow1, b.color, 0.18, 18);
          drawGlowCircleNormal(b.x, b.y, glow2, b.color, 0.38, 10);
          drawGlowCircleNormal(b.x, b.y, glow3, b.color, 0.85, 6);
        } else {
          drawGlowCircleNormal(b.x, b.y, glow1, b.color, b.team === 'player' ? 0.20 : 0.18, 18);
          drawGlowCircleNormal(b.x, b.y, glow2, b.color, b.team === 'player' ? 0.45 : 0.38, 10);
          drawGlowCircleNormal(b.x, b.y, glow3, b.color, b.team === 'player' ? 0.95 : 0.85, 6);
        }
      }
      if (rocketBody) drawSpriteEmoji(E.rocket, b.x, b.y, 14, { rot: ang + Math.PI * 0.25, alpha: 0.95, layer: 3, lighter: true, fill: '#006dff' });
    }
    for (let i = 0; i < state.bullets.length; i++) {
      const b = state.bullets[i];
      if (b) drawShot(b);
    }
    for (let i = 0; i < state.enemyBullets.length; i++) {
      const b = state.enemyBullets[i];
      if (b) drawShot(b);
    }
  }

  function drawPickups() {
    for (let i = 0; i < state.pickups.length; i++) {
      const p = state.pickups[i];
      const bob = Math.sin(p.bob) * 4;
      const glowDiameter = Number.isFinite(p.glowDiameter) ? p.glowDiameter : 32;
      const glowRadiusOuter = glowDiameter * 0.5;
      const glowRadiusInner = glowDiameter * 0.25;
      if (state.settings.lowEndMode) {
        drawGlowCircleNormal(p.x, p.y + bob, glowRadiusOuter, p.color, 0.48, 22);
        drawGlowCircleNormal(p.x, p.y + bob, glowRadiusInner, p.color, 0.85, 10);
      } else {
        drawGlowCircle(p.x, p.y + bob, glowRadiusOuter, p.color, 0.48, 22);
        drawGlowCircle(p.x, p.y + bob, glowRadiusInner, p.color, 0.85, 10);
      }
      drawEmojiGlyph(p.emoji, p.x, p.y + bob, 20, { alpha: 1, rot: Math.sin(p.spin + p.bob * 0.7) * 0.16, layer: 2, lighter: p.lighter !== false });
    }
  }

  function drawParticles() {
    for (let i = 0; i < state.particles.length; i++) {
      const p = state.particles[i];
      const t = clamp(p.life / p.maxLife, 0, 1);
      if (p.kind === 'ring') {
        drawGlowCircle(p.x, p.y, p.size, p.color, t * 0.4, 12);
      } else {
        const len = Math.max(2, p.size * 0.45);
        const ang = Math.atan2(p.vy, p.vx);
        drawSpriteRect(p.x - Math.cos(ang) * len * 0.5, p.y - Math.sin(ang) * len * 0.5, len, 2, p.color, t * 0.45, -2, true, ang);
        drawSpriteCircle(p.x, p.y, Math.max(1.2, p.size * 0.35), p.color, t * 0.5, -2, true);
      }
    }
  }

  function drawPanel(x, y, w, h, accent) {
    x = Number.isFinite(x) ? x : 0;
    y = Number.isFinite(y) ? y : 0;
    w = Number.isFinite(w) ? w : 0;
    h = Number.isFinite(h) ? h : 0;
    const g = hudCtx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, 'rgba(3, 14, 44, 0.98)');
    g.addColorStop(1, 'rgba(2, 8, 24, 0.78)');
    hudCtx.save();
    hudCtx.fillStyle = g;
    hudCtx.shadowColor = 'rgba(40, 128, 255, 1)';
    hudCtx.shadowBlur = 38;
    roundRect(x, y, w, h, 18);
    hudCtx.fill();
    hudCtx.shadowBlur = 0;
    hudCtx.strokeStyle = 'rgba(64, 128, 255, 0.98)';
    hudCtx.lineWidth = 2;
    hudCtx.stroke();
    hudCtx.save();
    hudCtx.strokeStyle = 'rgba(64, 128, 255, 0.98)';
    hudCtx.lineWidth = 2;
    hudCtx.shadowColor = 'rgba(64, 128, 255, 0.98)';
    hudCtx.shadowBlur = 14;
    roundRect(x, y, w, h, 18);
    hudCtx.stroke();
    hudCtx.restore();
    hudCtx.restore();
  }

  function drawCenterCard(title, sub, lines, accent, footer) {
    const extra = lines || [];
    const w = clamp(Number.isFinite(view.w) ? view.w * 0.76 : 480, 320, 720);
    const usableH = Math.max(182, view.h - view.controlsH - 24);
    const desiredH = 202 + extra.length * 16 + (footer ? 16 : 0);
    const h = Math.min(desiredH, usableH);
    const x = (view.w - w) * 0.5;
    const y = Math.max(16, (view.h - view.controlsH - h) * 0.42);
    drawPanel(x, y, w, h, accent);
    hudCtx.save();
    hudCtx.textAlign = 'center';
    hudCtx.textBaseline = 'middle';
    hudCtx.fillStyle = '#fff';
    hudCtx.shadowColor = accent || '#fff';
    hudCtx.shadowBlur = 18;
    hudCtx.font = '900 ' + Math.round(clamp(w * 0.11, 32, 56)) + 'px "Trebuchet MS", "Segoe UI", sans-serif';
    hudCtx.fillText(title, view.w * 0.5, y + 46);
    hudCtx.shadowBlur = 0;
    if (sub) {
      hudCtx.globalAlpha = 0.95;
      hudCtx.font = '800 18px "Trebuchet MS", "Segoe UI", sans-serif';
      hudCtx.fillText(sub, view.w * 0.5, y + 76);
    }
    hudCtx.font = '700 14px "Trebuchet MS", "Segoe UI", sans-serif';
    for (let i = 0; i < extra.length; i++) hudCtx.fillText(extra[i], view.w * 0.5, y + 108 + i * 18);
    if (footer) {
      hudCtx.fillStyle = accent || '#fff';
      hudCtx.font = '900 13px "Trebuchet MS", "Segoe UI", sans-serif';
      hudCtx.fillText(footer, view.w * 0.5, y + h - 18);
    }
    hudCtx.restore();
  }

  function enemyPalette(e) {
    const t = (e && e.theme) || mainTheme();
    const fixed = {
      drifter: '#4fe8ff',
      looper: '#ff6ed1',
      swarm: '#d7ff5a',
      bomber: '#ff9a4d',
      sniper: '#8d7bff',
      spinner: '#5effd8',
      splitter: '#ffd15c',
      diver: '#ff7070',
      mine: '#9cff6e',
      elite: '#ffcf6b'
    };
    return {
      base: fixed[e && e.kind] || t.accent2 || t.accent || '#ffffff',
      alt: '#15151b',
      glow: t.glow || t.accent2 || '#ffffff'
    };
  }

  function bossPalette(b) {
    const t = (b && b.theme) || mainTheme();
    return {
      base: (b && b.color) || '#ffcf6b',
      alt: t.accent || '#3c315f',
      glow: t.glow || t.accent2 || '#ffffff'
    };
  }

  function drawEnemyBody(e, rot, shipSize) {
    const p = enemyPalette(e);
    const alpha = e.hitFlash > 0 ? 1 : 0.96;
    const levelNumber = e.shipLevel || (state.levelIndex + 1);
    const shipIndex = e.shipIndex || 0;
    const texture = getEnemyShipTexture(levelNumber, shipIndex);
    if (texture) {
      drawTextureRect(texture, e.x, e.y, shipSize, shipSize, { rot: rot, alpha: alpha, layer: 18 });
    } else {
      const shipGlow = getEnemyShipGlowColor(levelNumber, shipIndex, e.theme);
      const glowRadius = Math.max(14, shipSize * 0.42 * 0.675 * (state.settings.lowEndMode ? 1 : 0.9));
      drawGlowCircle(e.x, e.y, glowRadius * 0.9312, shipGlow, 0.8, 22);
      drawGlowCircle(e.x, e.y, glowRadius * 0.5033, shipGlow, 0.7, 12);
      drawGlowCircle(e.x, e.y, shipSize * 0.23, p.base, 0.125, 10);
      drawGlowCircle(e.x, e.y, shipSize * 0.11, p.base, alpha * 0.10, 8);
    }
    if (e.hitFlash > 0) {
      const flash = clamp(e.hitFlash * 16.0, 0, 1);
      drawGlowCircle(e.x, e.y, shipSize * 0.34, '#ffffff', flash * 0.95, 18);
      if (e.hitSparkDamage) {
        burst(e.x, e.y, e.color, 4 + Math.min(8, e.hitSparkDamage), 110 + e.hitSparkDamage * 22, 5, 'spark');
        e.hitSparkDamage = 0;
      }
    }
  }

  function drawTextureRectAroundLocalPoint(texture, socketX, socketY, w, h, localX, localY, rot, opts) {
    const c = Math.cos(rot);
    const s = Math.sin(rot);
    const ox = localX - w * 0.5;
    const oy = localY - h * 0.5;
    const cx = socketX - (ox * c - oy * s);
    const cy = socketY - (ox * s + oy * c);
    const o = opts || {};
    drawTextureRect(texture, cx, cy, w, h, {
      rot: rot,
      alpha: o.alpha == null ? 1 : o.alpha,
      layer: o.layer || 0,
      lighter: o.lighter,
      fill: o.fill || '#ffffff'
    });
  }

  function finalBossBodyRot(b) {
    return Math.sin(b.age * 0.8) * 0.04 + clamp((b.vx || 0) / 900, -0.02, 0.02);
  }

  function getFinalBossClawParts(b, bodyRot) {
    if (!b || (b.shipLevel || (state.levelIndex + 1)) !== 13) return null;
    const left = getBossPartTexture(13, 'leftClaw');
    const right = getBossPartTexture(13, 'rightClaw');
    if (!left && !right) return null;
    const size = Math.max(1, b.size || 512);
    const bodyRawW = 1141;
    const bodyRawH = 1042;
    const scale = Math.min(size / bodyRawW, size / bodyRawH);
    const bodyDrawW = bodyRawW * scale;
    const bodyDrawH = bodyRawH * scale;
    const bodyDx = (size - bodyDrawW) * 0.5;
    const bodyDy = (size - bodyDrawH) * 0.5;
    const clawScale = scale * 0.75;
    const clawGuard = clamp(b.clawGuard || 0, 0, 1);
    const clawMinRot = -21 * Math.PI / 180;
    const openMaxRot = 45 * Math.PI / 180;
    const slowFlexL = 0.5 + 0.5 * Math.sin(b.age * 1.35);
    const slowFlexR = 0.5 + 0.5 * Math.sin(b.age * 1.35 + 0.8);
    const twitchL = Math.pow(Math.max(0, Math.sin(b.age * 8.7 + Math.sin(b.age * 2.1) * 1.8)), 7);
    const twitchR = Math.pow(Math.max(0, Math.sin(b.age * 8.7 + 0.8 + Math.sin(b.age * 2.1 + 0.7) * 1.8)), 7);
    const jitterL = Math.sin(b.age * 18.3) * 0.035 + Math.sin(b.age * 31.7) * 0.018;
    const jitterR = Math.sin(b.age * 18.3 + 1.1) * 0.035 + Math.sin(b.age * 31.7 + 0.9) * 0.018;
    const clawSwingL = clamp(slowFlexL * 0.62 + twitchL * 0.38 + jitterL, 0, 1);
    const clawSwingR = clamp(slowFlexR * 0.62 + twitchR * 0.38 + jitterR, 0, 1);
    const openRotL = lerp(clawMinRot, openMaxRot, clawSwingL);
    const openRotR = lerp(clawMinRot, openMaxRot, clawSwingR);
    const clawOpen = 1 - clawGuard;
    const guardRot = clawMinRot;
    const reachJerk = Math.pow(Math.max(0, Math.sin(b.age * 13.9 + Math.sin(b.age * 4.4) * 2.2)), 10);
    const reachPulseL = clamp((slowFlexL - 0.5) * 0.35 + twitchL * 0.18 + reachJerk * 0.225 + jitterL * 0.32, 0, 1);
    const reachPulseR = clamp((slowFlexR - 0.5) * 0.35 + twitchR * 0.18 + reachJerk * 0.225 + jitterR * 0.32, 0, 1);
    const clawReachL = clawOpen * reachPulseL * 150;
    const clawReachR = clawOpen * reachPulseR * 150;
    const guardJerk = 2 * Math.PI / 180;
    const leftClawRot = lerp(openRotL, guardRot - guardJerk * clamp(twitchL * 1.2 + reachJerk * 0.5, 0, 1), clawGuard);
    const rightClawRot = lerp(openRotR, guardRot + guardJerk * clamp(twitchR * 1.2 + reachJerk * 0.5, 0, 1), clawGuard);
    const bc = Math.cos(bodyRot);
    const bs = Math.sin(bodyRot);
    const leftBodyX = bodyDx + (325 - 40) * scale - size * 0.5;
    const rightBodyX = bodyDx + (909 - 40) * scale - size * 0.5;
    const bodySocketY = bodyDy + 543 * scale - size * 0.5;
    const leftSocketX = b.x + leftBodyX * bc - bodySocketY * bs;
    const leftSocketY = b.y + leftBodyX * bs + bodySocketY * bc;
    const rightSocketX = b.x + rightBodyX * bc - bodySocketY * bs;
    const rightSocketY = b.y + rightBodyX * bs + bodySocketY * bc;
    const out = {};
    if (left) {
      const w = left.w * clawScale;
      const h = left.h * clawScale;
      const extendDx = 440 - 800;
      const extendDy = 940 - 80;
      const extendLen = Math.max(1, Math.hypot(extendDx, extendDy));
      const localX = (800 + extendDx / extendLen * clawReachL) * clawScale;
      const localY = (80 + extendDy / extendLen * clawReachL) * clawScale;
      out.left = { entry: left, socketX: leftSocketX, socketY: leftSocketY, w: w, h: h, scale: clawScale, localX: localX, localY: localY, rot: bodyRot + leftClawRot };
    }
    if (right) {
      const w = right.w * clawScale;
      const h = right.h * clawScale;
      const closedX = right.w - 800;
      const targetX = right.w - 440;
      const extendDx = targetX - closedX;
      const extendDy = 940 - 80;
      const extendLen = Math.max(1, Math.hypot(extendDx, extendDy));
      const localX = (closedX + extendDx / extendLen * clawReachR) * clawScale;
      const localY = (80 + extendDy / extendLen * clawReachR) * clawScale;
      out.right = { entry: right, socketX: rightSocketX, socketY: rightSocketY, w: w, h: h, scale: clawScale, localX: localX, localY: localY, rot: bodyRot - rightClawRot };
    }
    return out;
  }

  function getTextureRectCenterForLocalPoint(part) {
    const c = Math.cos(part.rot || 0);
    const s = Math.sin(part.rot || 0);
    const ox = part.localX - part.w * 0.5;
    const oy = part.localY - part.h * 0.5;
    return {
      x: part.socketX - (ox * c - oy * s),
      y: part.socketY - (ox * s + oy * c)
    };
  }

  function getFinalBossClawHitBox(b, side) {
    const parts = getFinalBossClawParts(b, finalBossBodyRot(b));
    const part = parts && parts[side];
    if (!part) return null;
    const bounds = part.entry.bounds || { x: 0, y: 0, w: part.entry.w, h: part.entry.h };
    const localX = (bounds.x + bounds.w * 0.5) * part.scale;
    const localY = (bounds.y + bounds.h * 0.5) * part.scale;
    const c = Math.cos(part.rot || 0);
    const s = Math.sin(part.rot || 0);
    const dx = localX - part.localX;
    const dy = localY - part.localY;
    return {
      x: part.socketX + dx * c - dy * s,
      y: part.socketY + dx * s + dy * c,
      w: bounds.w * part.scale * 0.74,
      h: bounds.h * part.scale * 0.88,
      rot: part.rot
    };
  }

  function bossBodyCollisionSpec(b) {
    if (!b) return null;
    const levelNumber = b.shipLevel || (state.levelIndex + 1);
    const size = Math.max(1, b.size || 512);
    const flipWhenMovingRight = b.flipWhenMovingRight !== false;
    const facingRight = flipWhenMovingRight ? !!b.facingRight : false;
    return {
      mask: getBossAlphaMask(levelNumber),
      x: b.x,
      y: b.y,
      w: facingRight ? -size : size,
      h: size,
      rot: finalBossBodyRot(b)
    };
  }

  function bossBodyAlphaHit(b, x, y, radius) {
    const spec = bossBodyCollisionSpec(b);
    if (!spec || !spec.mask) return false;
    return circleHitsAlphaMask(spec.mask, spec.x, spec.y, spec.w, spec.h, spec.rot, x, y, radius);
  }

  function damageFinalBossClawAtPoint(b, x, y, radius, damage) {
    if (!b || !b.claws) return false;
    const sides = ['left', 'right'];
    for (let i = 0; i < sides.length; i++) {
      const side = sides[i];
      const claw = b.claws[side];
      if (!claw || claw.dead) continue;
      const parts = getFinalBossClawParts(b, finalBossBodyRot(b));
      const part = parts && parts[side];
      if (!part || !part.entry || !part.entry.mask) continue;
      const hitBox = getFinalBossClawHitBox(b, side);
      if (hitBox && circleHitsRotatedRect(hitBox, x, y, radius)) {
        return damageFinalBossClaw(b, side, damage);
      }
    }
    return false;
  }

  function drawFinalBossClaws(b, bodyRot) {
    const parts = getFinalBossClawParts(b, bodyRot);
    if (!parts) return;
    ['left', 'right'].forEach(function (side) {
      const part = parts[side];
      const claw = b.claws && b.claws[side];
      if (!part || !claw) return;
      if (claw.dead) return;
      if (part.entry.glowTexture) {
        const glowScale = part.w / Math.max(1, part.entry.w);
        const pulse = 0.45 + 0.30 * Math.sin(Math.PI * b.age);
        const boost = clamp(claw.glowBoost || 0, 0, 1);
        const tint = mixHex('#0038ff', '#ffffff', boost);
        const glowAlpha = clamp(pulse + boost * 0.75, 0.15, 1);
        drawTextureRectAroundLocalPoint(part.entry.glowTexture, part.socketX, part.socketY, part.entry.glowW * glowScale, part.entry.glowH * glowScale, part.localX + part.entry.glowPad * glowScale, part.localY + part.entry.glowPad * glowScale, part.rot, { alpha: glowAlpha, layer: 25, fill: tint });
      }
      drawTextureRectAroundLocalPoint(part.entry.texture, part.socketX, part.socketY, part.w, part.h, part.localX, part.localY, part.rot, { alpha: 0.98, layer: 26 });
    });
  }

  function damageFinalBossClaw(b, side, damage) {
    if (!b || !b.claws || !b.claws[side]) return false;
    const claw = b.claws[side];
    if (claw.dead) return false;
    claw.hp -= damage;
    damageBoss(b, damage * 0.3, false);
    claw.hitFlash = 0.12;
    claw.glowBoost = Math.min(1.0, (claw.glowBoost || 0) + 0.25);
    const target = getFinalBossClawHitBox(b, side);
    const fx = target ? target.x : b.x;
    const fy = target ? target.y : b.y;
    burst(fx, fy, b.color, 2, 200 + damage * 12, 7, 'spark');
    if (claw.hp <= 0) {
      claw.dead = true;
      claw.deathFlash = 0.45;
      state.shake = Math.max(state.shake, 8);
      flashBurst(fx, fy, b.color);
      burst(fx, fy, b.color, 34, 280, 8, 'spark');
      sfx('boom');
    } else {
      sfx('hit');
    }
    return true;
  }

  function drawBossBody(b) {
    const p = bossPalette(b);
    const r = b.r;
    const rot = finalBossBodyRot(b);
    const levelNumber = b.shipLevel || (state.levelIndex + 1);
    const size = Math.max(1, b.size || 512);
    const glowSize = bossGlowCanvasSize(size);
    const flipWhenMovingRight = b.flipWhenMovingRight !== false;
    const facingRight = flipWhenMovingRight ? !!b.facingRight : false;
    const texture = getBossTexture(levelNumber);
    const glowTexture = getBossGlowTexture(levelNumber);
    if (levelNumber === 13) drawFinalBossClaws(b, rot);
    if (glowTexture) {
      const pulse = 0.45 + 0.30 * Math.sin(Math.PI * b.age);
      const boost = clamp(b.glowBoost || 0, 0, 1);
      const tint = mixHex('#0038ff', '#ffffff', boost);
      const glowAlpha = clamp(pulse + boost * 0.75, 0.15, 1);
      const glowW = facingRight ? -glowSize : glowSize;
      drawTextureRect(glowTexture, b.x, b.y, glowW, glowSize, { rot: rot, alpha: glowAlpha, layer: 27, lighter: false, fill: tint });
    }
    if (texture) {
      const w = facingRight ? -size : size;
      drawTextureRect(texture, b.x, b.y, w, size, { rot: rot, alpha: 0.98, layer: 28 });
    }
  }

  function drawEnemyOverlay(e, rot) {
  }

  function drawBossOverlay(b) {
  }

  function drawEnemy(e) {
    if (!e || e.dead) return;
    const glow = e.theme.glow || e.theme.accent2 || e.theme.accent || '#fff';
    const flight = typeof e.flightAngle === 'number' ? e.flightAngle : Math.atan2(e.vy || 0, e.vx || 1);
    const rot = flight + Math.PI * 0.5;
    const levelNumber = e.shipLevel || (state.levelIndex + 1);
    const shipIndex = e.shipIndex || 0;
    const shipSize = e.shipSize || getEnemyShipRenderSize(levelNumber, shipIndex);
    if (e.kind === 'spinner') {
      for (let i = 0; i < 5; i++) {
        const a = e.age * 2.2 + i * (TAU / 5);
        drawGlowCircle(e.x + Math.cos(a) * (e.r + 6), e.y + Math.sin(a) * (e.r + 6), 2.2, e.theme.accent2, 0.55, 8);
      }
    }
    drawEnemyBody(e, rot, shipSize);
    drawEnemyOverlay(e, rot);
    if (e.maxHp > 1 && e.hp > 0) {
      const barW = shipSize * 0.50;
      const barH = Math.max(4, Math.round(shipSize * 0.02));
      drawWorldBar(e.x - barW * 0.5, e.y - shipSize * 0.62, barW, barH, e.hp / e.maxHp, '#503010', 'rgba(0,0,0,1.0)', 17);
    }
    if (state.debugMode) {
      const label = (e.name || e.kind || '').toUpperCase();
      if (label) {
        const labelSprite = getDebugLabelTexture(label, 14);
        if (labelSprite) {
          const labelY = e.y + shipSize * 0.62;
          drawSpriteRect(e.x, labelY, labelSprite.w + 8, labelSprite.h - 1, '#000000', 0.58, 118, false);
          drawTextureRect(labelSprite.texture, e.x, labelY, labelSprite.w, labelSprite.h, { alpha: 1.0, layer: 119, lighter: false });
        }
      }
    }
  }

  function drawBoss(b) {
    if (!b) return;
    drawBossBody(b);
    drawBossOverlay(b);
  }

  function drawPlayer() {
    const p = state.player;
    const respawning = p.respawnTimer > 0;
    const bob = respawning ? Math.sin(state.musicStep * 0.45) * 0.8 : Math.sin((state.musicStep * 0.45) + p.x * 0.01) * 2;
    const allowControlTilt = state.mode === 'playing';
    const tilt = respawning ? 0 : clamp((allowControlTilt ? (((state.input.right ? 1 : 0) - (state.input.left ? 1 : 0)) * 0.24 + (state.pointerActive ? (state.pointerX - p.x) / 280 : 0)) : 0), -0.45, 0.45);
    const rot = tilt * 0.92;
    const glow = state.overdrive > 0 ? '#ffe38c' : '#8fd8ff';
    const invulnActive = p.invuln > 0;
    const auraColor = invulnActive ? '#bfe4ff' : glow;
    const flashAlpha = p.invuln > 0 ? 0.52 + 0.42 * (0.5 + 0.5 * Math.sin((3 - p.invuln) * 16 + state.musicStep * 0.9)) : 1;
    const shipSize = 74 + (state.overdrive > 0 ? 4 : 0);
    const shipY = p.y + bob;
    const shipVisualY = shipY - 6;
    const planeSize = 36 + (state.overdrive > 0 ? 4 : 0);
    const shieldRing = p.r;
    const shipTexture = getPlayerShipTexture();
    const auraTexture = getPlayerAuraTexture();
    const flameTexture = getPlayerEngineFlameTexture((Math.floor(state.musicStep * 6 + p.x * 0.02) & 3));
    if (auraTexture) {
      drawTextureRect(auraTexture, p.x, shipY, 196, 196, {
        alpha: 0.27,
        layer: 3,
        lighter: false
      });
    }
    const playerGlow = state.overdrive > 0 ? '#ffe59a' : '#92dcff';
    drawSoftEdgeGlow(p.x, shipY, 50, playerGlow, 0.22);
    if (invulnActive) {
      const invulnRings = [
        { r: shieldRing + 14, color: '#ff0000' },
        { r: shieldRing + 19, color: '#ff0000' },
        { r: shieldRing + 24, color: '#ff0000' }
      ];
      const ringAlphas = [
        clamp(p.invuln, 0, 1) * 1.0,
        clamp(p.invuln - 1, 0, 1) * 1.0,
        clamp(p.invuln - 2, 0, 1) * 1.0
      ];
      for (let i = 0; i < invulnRings.length; i++) {
        const ring = invulnRings[i];
        const alpha = ringAlphas[i];
        if (alpha > 0) drawRingGlow(p.x, shipY, ring.r, ring.r - 2, ring.color, alpha, 0);
      }
    }
    if (p.shield > 0) {
      const shieldColor = p.shield > 1 ? '#7fc8ff' : '#61a9ff';
      for (let i = 0; i < p.shield; i++) {
        const ringR = shieldRing + i * 5;
        drawRingGlow(p.x, shipY, ringR + 14, ringR + 12, shieldColor, 0.15, 0);
      }
    }
    if (!respawning || p.respawnTimer < 0.98) {
      if (flameTexture) {
        const flameAlpha = 0.82 * flashAlpha;
        const flameLenPulse = 1 + Math.sin(state.animClock * TAU * 10) * 0.1;
        const flameWPulse = 1 + Math.sin(state.animClock * TAU * 6) * 0.1;
        const verticalStretch = clamp(p.vy / 460, -1, 1) * 0.2;
        const flameLen = shipSize * 0.2885625 * flameLenPulse * (1 - verticalStretch);
        const flameW = shipSize * 0.285 * flameWPulse;
        const flameOffsets = [
          { x: -shipSize * 0.1435, y: shipSize * 0.39, s: 1.38 },
          { x: 0, y: shipSize * 0.45, s: 1.59 },
          { x: shipSize * 0.1435, y: shipSize * 0.39, s: 1.38 }
        ];
        for (let i = 0; i < flameOffsets.length; i++) {
          const o = flameOffsets[i];
          const flameLenRoll = 0.7 + (Math.random() * 0.6);
          const flameH = flameLen * flameLenRoll * o.s;
          const anchorAdjust = flameH * 0.4;
          const pos = localToWorld(p.x, shipVisualY, rot, o.x, o.y + anchorAdjust);
          drawTextureRect(flameTexture, pos.x, pos.y, flameW * o.s, flameH, {
            rot: rot,
            alpha: flameAlpha * (i === 1 ? 1 : 0.78),
            layer: 5,
            lighter: true
          });
        }
      }
    }
    if (shipTexture) {
      drawTextureRect(shipTexture, p.x, shipVisualY, shipSize, shipSize, { rot: rot, alpha: flashAlpha, layer: 4, lighter: false });
    } else {
      ensurePlayerShipTexture();
    }
    const damage = clamp(1 - (p.health / Math.max(1, p.maxHealth)), 0, 1);
    if (damage > 0.01) {
      const tex = getPlayerDamageTexture(planeSize, damage);
      drawTextureRect(tex, p.x, shipY, shipSize, shipSize, { rot: rot, alpha: Math.min(1, 0.38 + damage * 0.62), layer: 4, lighter: false });
      const sparkCount = clamp(Math.round(2 + damage * 10), 2, 10);
      const sparkColors = ['#ff5a3d', '#ff8a2d', '#ffd35a', '#ffb347'];
      const sparkSeed = hashString('player-damage|' + Math.round(state.animClock * 12) + '|' + Math.round(p.x) + '|' + Math.round(shipY) + '|' + Math.round(damage * 100));
      for (let i = 0; i < sparkCount; i++) {
        const t = (i + 1) / (sparkCount + 1);
        const a = sparkSeed ^ (i * 2654435761);
        const rx = (((a >>> 0) % 1000) / 1000 - 0.5) * shipSize * 0.54;
        const ry = ((((a >>> 10) >>> 0) % 1000) / 1000 - 0.5) * shipSize * 0.54;
        const r = 3 + ((((a >>> 20) >>> 0) % 1000) / 1000) * 7;
        const color = sparkColors[(a >>> 28) % sparkColors.length];
        const pos = localToWorld(p.x, shipY, rot, rx, ry);
        drawSpriteCircle(pos.x, pos.y, r, color, 0.24 + damage * 0.42, 4, true);
      }
    }
  }

  function localToWorld(px, py, rot, x, y) {
    const c = Math.cos(rot);
    const s = Math.sin(rot);
    return {
      x: px + x * c - y * s,
      y: py + x * s + y * c
    };
  }

  function ensurePlayerShipTexture() {
    if (render.textures.has(PLAYER_SHIP_TEXTURE_KEY) || playerShipTextureLoading) return;
    playerShipTextureLoading = true;
    const img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      try {
        playerShipSourceImage = img;
        const tex = createTextureFromCanvas(img);
        if (tex) render.textures.set(PLAYER_SHIP_TEXTURE_KEY, tex);
      } finally {
        playerShipTextureLoading = false;
      }
    };
    img.onerror = function () {
      playerShipTextureLoading = false;
    };
    img.src = 'assets/players_spaceship.png';
  }

  function ensurePlayerAuraTexture() {
    if (render.textures.has(PLAYER_AURA_TEXTURE_KEY) || playerAuraTextureLoading) return;
    playerAuraTextureLoading = true;
    const img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      try {
        const tex = createTextureFromCanvas(img);
        if (tex) render.textures.set(PLAYER_AURA_TEXTURE_KEY, tex);
      } finally {
        playerAuraTextureLoading = false;
      }
    };
    img.onerror = function () {
      playerAuraTextureLoading = false;
    };
    img.src = 'assets/players_aura.png';
  }

  function getPlayerShipTexture() {
    const tex = render.textures.get(PLAYER_SHIP_TEXTURE_KEY);
    if (tex) return tex;
    ensurePlayerShipTexture();
    return null;
  }

  function getPlayerAuraTexture() {
    const tex = render.textures.get(PLAYER_AURA_TEXTURE_KEY);
    if (tex) return tex;
    ensurePlayerAuraTexture();
    return null;
  }

  function getPlayerEngineFlameTexture(stage) {
    const frame = clamp(stage | 0, 0, 3);
    const key = PLAYER_ENGINE_TEXTURE_PREFIX + frame;
    let tex = render.textures.get(key);
    if (tex) return tex;
    const c = makeDomCanvas(160, 280);
    const g = c.getContext('2d');
    const w = c.width;
    const h = c.height;
    const flare = [0.9, 1, 1.1, 0.98][frame];
    const side = [0.48, 0.52, 0.54, 0.5][frame];
    g.clearRect(0, 0, w, h);
    g.save();
    g.globalCompositeOperation = 'lighter';

    let grad = g.createLinearGradient(0, h * 0.05, 0, h * 0.98);
    grad.addColorStop(0, 'rgba(255,255,255,0.98)');
    grad.addColorStop(0.18, 'rgba(200,248,255,0.92)');
    grad.addColorStop(0.42, 'rgba(84,208,255,0.84)');
    grad.addColorStop(0.72, 'rgba(30,118,255,0.48)');
    grad.addColorStop(1, 'rgba(10,42,120,0)');
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(w * 0.5, h * 0.96);
    g.bezierCurveTo(w * (0.5 + side * 0.36), h * 0.76, w * (0.66 + frame * 0.01), h * 0.44, w * 0.57, h * 0.12);
    g.bezierCurveTo(w * 0.54, h * 0.28, w * 0.52, h * 0.56, w * 0.5, h * 0.96);
    g.bezierCurveTo(w * 0.48, h * 0.56, w * 0.46, h * 0.28, w * 0.43, h * 0.12);
    g.bezierCurveTo(w * (0.34 - frame * 0.01), h * 0.44, w * (0.5 - side * 0.36), h * 0.76, w * 0.5, h * 0.96);
    g.closePath();
    g.fill();

    grad = g.createLinearGradient(0, h * 0.08, 0, h * 0.96);
    grad.addColorStop(0, 'rgba(255,255,255,0.98)');
    grad.addColorStop(0.24, 'rgba(242,253,255,0.95)');
    grad.addColorStop(0.52, 'rgba(132,236,255,0.72)');
    grad.addColorStop(0.78, 'rgba(52,144,255,0.32)');
    grad.addColorStop(1, 'rgba(12,40,116,0)');
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(w * 0.5, h * 0.9);
    g.bezierCurveTo(w * (0.58 + side * 0.12), h * 0.66, w * 0.64, h * 0.42, w * 0.54, h * 0.16);
    g.bezierCurveTo(w * 0.52, h * 0.34, w * 0.51, h * 0.58, w * 0.5, h * 0.9);
    g.bezierCurveTo(w * 0.49, h * 0.58, w * 0.48, h * 0.34, w * 0.46, h * 0.16);
    g.bezierCurveTo(w * 0.36, h * 0.42, w * (0.42 - side * 0.12), h * 0.66, w * 0.5, h * 0.9);
    g.closePath();
    g.fill();

    g.strokeStyle = 'rgba(152, 238, 255, 0.72)';
    g.lineWidth = 2.4;
    g.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const a = -0.18 + i * 0.18 + frame * 0.02;
      const x0 = w * 0.5 + Math.sin(a * 2.1) * 7 * flare;
      const y0 = h * (0.22 + i * 0.06);
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(w * 0.5 + Math.sin(a * 2.6 + 0.5) * 11 * flare, h * (0.54 + i * 0.08));
      g.lineTo(w * 0.5 + Math.sin(a * 2.9 + 1.2) * 5 * flare, h * (0.86 + i * 0.03));
      g.stroke();
    }

    g.fillStyle = 'rgba(255,255,255,0.9)';
    g.beginPath();
    g.arc(w * 0.5, h * 0.14, 8 * flare, 0, TAU);
    g.fill();
    g.restore();

    tex = createTextureFromCanvas(c);
    if (tex) render.textures.set(key, tex);
    return tex;
  }

  function getPlayerDamageTexture(size, damage) {
    const planeSize = Math.max(16, Math.round(size));
    const stage = Math.max(1, Math.min(8, Math.ceil(damage * 8)));
    const key = PLAYER_DAMAGE_TEXTURE_PREFIX + planeSize + '|' + stage;
    let tex = render.textures.get(key);
    if (tex) return tex;
    const dim = Math.max(64, Math.ceil(planeSize * 2.2));
    const c = makeDomCanvas(dim, dim);
    const g = c.getContext('2d');
    g.clearRect(0, 0, dim, dim);
    const img = playerShipSourceImage;
    const shipScale = img ? Math.min((dim * 0.78) / img.width, (dim * 0.78) / img.height) : 1;
    const shipW = img ? img.width * shipScale : dim * 0.72;
    const shipH = img ? img.height * shipScale : dim * 0.72;
    const cx = dim * 0.5;
    const cy = dim * 0.5;

    if (img) {
      g.save();
      g.drawImage(img, Math.round(cx - shipW * 0.5), Math.round(cy - shipH * 0.5), Math.round(shipW), Math.round(shipH));
      g.restore();
    } else {
      g.save();
      g.fillStyle = 'rgba(160,220,255,0.24)';
      g.beginPath();
      g.moveTo(cx, cy - shipH * 0.42);
      g.lineTo(cx + shipW * 0.34, cy + shipH * 0.18);
      g.lineTo(cx, cy + shipH * 0.42);
      g.lineTo(cx - shipW * 0.34, cy + shipH * 0.18);
      g.closePath();
      g.fill();
      g.restore();
    }

    g.save();
    g.globalCompositeOperation = 'source-atop';
    const crackColor = ['rgba(255, 255, 255, 0.35)', 'rgba(120, 224, 255, 0.38)', 'rgba(255, 176, 76, 0.46)', 'rgba(255, 84, 52, 0.54)'];
    const sparkColor = ['rgba(255,255,255,0.75)', 'rgba(153, 232, 255, 0.72)', 'rgba(255, 190, 102, 0.84)', 'rgba(255, 104, 84, 0.92)'];
    const crackCount = 4 + stage * 2;
    for (let i = 0; i < crackCount; i++) {
      const t = i / Math.max(1, crackCount - 1);
      const rx = (Math.sin(stage * 2.7 + i * 1.12) * 0.34 + (t - 0.5) * 0.52) * shipW;
      const ry = (-0.24 + t * 0.74) * shipH;
      const len = shipH * (0.16 + t * 0.18 + stage * 0.008);
      g.strokeStyle = crackColor[(stage + i) % crackColor.length];
      g.lineWidth = 1.1 + (i % 3) * 0.45 + stage * 0.05;
      g.beginPath();
      g.moveTo(cx + rx, cy + ry);
      g.lineTo(cx + rx + Math.sin(i * 2.3 + stage) * len * 0.22, cy + ry + len * 0.4);
      g.lineTo(cx + rx + Math.cos(i * 1.7 + stage * 0.7) * len * 0.12, cy + ry + len * 0.88);
      g.stroke();
    }
    g.fillStyle = sparkColor[stage % sparkColor.length];
    for (let i = 0; i < stage + 2; i++) {
      const sx = cx + (Math.sin(stage * 1.9 + i * 2.1) * 0.26) * shipW;
      const sy = cy + (-0.28 + i * 0.11) * shipH;
      g.beginPath();
      g.arc(sx, sy, 1.2 + stage * 0.18 + (i % 2) * 0.5, 0, TAU);
      g.fill();
    }
    g.restore();

    tex = createTextureFromCanvas(c);
    if (tex) render.textures.set(key, tex);
    return tex;
  }

  function shouldRedrawHud(ts) {
    if (state.debugMode) return true;
    if (state.mode !== 'playing') return true;
    if (state.hudDirty) return true;
    if (!state.hudLastDraw) return true;
    return (ts - state.hudLastDraw) >= 50;
  }

  function drawHud() {
    const theme = mainTheme();
    const p = state.player;
    if (state.mode === 'title') return;

    hudCtx.save();
    const compact = view.w < 640;
    const scoreLine = 'SCORE ' + format(state.score) + '   LIVES ' + state.lives + '   BOMB ' + p.bombs + '   SHIELD ' + p.shield;
    const detailLine = 'STAGE ' + (state.levelIndex + 1) + '/' + THEMES.length + '  ' + theme.name + '   WEAPON ' + WEAPONS[p.weaponMode].name + ' ' + WEAPON_TIER_LABELS[p.weaponTier - 1] + '   HIGH ' + format(state.highScore);
    const scoreFont = compact ? '900 11px "Trebuchet MS", "Segoe UI", sans-serif' : '900 13px "Trebuchet MS", "Segoe UI", sans-serif';
    const detailFont = compact ? '700 8px "Trebuchet MS", "Segoe UI", sans-serif' : '700 9px "Trebuchet MS", "Segoe UI", sans-serif';
    const scoreW = measureHudTextWidth(scoreLine, scoreFont);
    const detailW = measureHudTextWidth(detailLine, detailFont);
    const maxScoreDigits = format(999999999).length;
    const maxHighDigits = format(Math.max(state.highScore || 0, 999999999)).length;
    const worstScoreLine = 'SCORE ' + Array(maxScoreDigits + 1).join('8') + '   LIVES ' + 9 + '   BOMB ' + 9 + '   SHIELD ' + 9;
    const longestThemeName = THEMES.reduce(function (best, t) { return (t && t.name && t.name.length > best.length) ? t.name : best; }, '');
    const longestWeaponName = WEAPONS.reduce(function (best, w) { return (w && w.name && w.name.length > best.length) ? w.name : best; }, '');
    const longestDetailLine = 'STAGE ' + THEMES.length + '/' + THEMES.length + '  ' + longestThemeName + '   WEAPON ' + longestWeaponName + ' ' + WEAPON_TIER_LABELS[WEAPON_TIER_LABELS.length - 1] + '   HIGH ' + Array(maxHighDigits + 1).join('8');
    const worstScoreW = measureHudTextWidth(worstScoreLine, scoreFont);
    const worstDetailW = measureHudTextWidth(longestDetailLine, detailFont);
    const heatPanelW = compact ? 20 : 22;
    const heatPanelGap = compact ? 5 : 6;
    const scorePanelMinW = compact ? 240 : 290;
    const scorePanelMaxW = Math.max(scorePanelMinW, Math.min(view.w - 24 - heatPanelGap - heatPanelW, compact ? 460 : 600));
    const contentW = Math.max(scoreW, detailW, worstScoreW, worstDetailW);
    const panelW = clamp(Math.round(contentW + (compact ? 34 : 40)), scorePanelMinW, scorePanelMaxW);
    const panelH = compact ? 44 : 48;
    const panelX = 8;
    const panelY = 8;
    const bossBarY = panelY + panelH + 6;
    drawPanel(panelX, panelY, panelW, panelH, theme.accent2);

    hudCtx.fillStyle = '#fff';
    hudCtx.textBaseline = 'middle';
    hudCtx.textAlign = 'left';
    hudCtx.font = scoreFont;
    hudCtx.fillText(scoreLine, panelX + 14, panelY + 15);
    hudCtx.font = detailFont;
    hudCtx.fillText(detailLine, panelX + 14, panelY + panelH - 13);

    if (state.mode === 'playing') {
      const heatRatio = clamp(p.heat || 0, 0, 1);
      const heatPanelX = panelX + panelW + heatPanelGap;
      const heatPanelY = panelY;
      const heatPanelH = panelH;
      const barW = compact ? 7 : 8;
      const barH = heatPanelH - (compact ? 14 : 16);
      const barX = heatPanelX + (heatPanelW - barW) * 0.5;
      const barY = heatPanelY + (heatPanelH - barH) * 0.5;
      let rr = 255;
      let gg = 255;
      if (heatRatio <= 0.5) {
        rr = Math.round(255 * (heatRatio / 0.5));
        gg = 255;
      } else {
        rr = 255;
        gg = Math.round(255 * (1 - ((heatRatio - 0.5) / 0.5)));
      }
      const heatColor = 'rgb(' + rr + ',' + gg + ',0)';

      drawPanel(heatPanelX, heatPanelY, heatPanelW, heatPanelH, theme.accent2);
      hudCtx.fillStyle = 'rgba(0,0,0,0.38)';
      hudCtx.strokeStyle = 'rgba(255,255,255,0.24)';
      hudCtx.lineWidth = 1;
      roundRect(barX, barY, barW, barH, barW * 0.45);
      hudCtx.fill();
      hudCtx.stroke();

      if (heatRatio > 0) {
        const innerH = Math.max(0, barH - 2);
        const fillH = innerH * heatRatio;
        const fy = barY + 1 + (innerH - fillH);
        hudCtx.fillStyle = heatColor;
        roundRect(barX + 1, fy, Math.max(1, barW - 2), fillH, Math.max(1, (barW - 2) * 0.45));
        hudCtx.fill();
      }
    }

    if (state.bannerTimer > 0 && state.mode === 'playing') {
      const compactBanner = state.banner === 'OVERDRIVE';
      const bw = compactBanner ? 152 : clamp(view.w * 0.42, 220, 420);
      const bh = compactBanner ? 28 : 44;
      const bx = compactBanner ? (view.w - bw - 14) : (view.w - bw) * 0.5;
      const by = state.boss ? bossBarY + 18 : bossBarY + 8;
      drawPanel(bx, by, bw, bh, theme.accent2);
      hudCtx.textAlign = 'center';
      hudCtx.fillStyle = '#fff';
      hudCtx.font = compactBanner ? '900 11px "Trebuchet MS", "Segoe UI", sans-serif' : '900 16px "Trebuchet MS", "Segoe UI", sans-serif';
      hudCtx.fillText(state.banner || '', compactBanner ? bx + bw * 0.5 : view.w * 0.5, by + (compactBanner ? 14 : 17));
      if (!compactBanner) {
        hudCtx.font = '700 10px "Trebuchet MS", "Segoe UI", sans-serif';
        hudCtx.fillText(state.bannerSub || '', view.w * 0.5, by + 32);
      }
    }

    if (state.boss) {
      drawBar(12, bossBarY, view.w - 24, compact ? 13 : 15, state.boss.hp / state.boss.maxHp, theme.accent2, 'rgba(0,0,0,0.42)', 'BOSS ' + state.boss.name);
      if (state.boss.claws) {
        const clawBarY = bossBarY + (compact ? 16 : 18);
        const clawBarH = compact ? 4 : 5;
        const leftClaw = state.boss.claws.left;
        const rightClaw = state.boss.claws.right;
        const clawW = Math.floor((view.w - 28) * 0.5);
        if (leftClaw) {
          drawBar(12, clawBarY, clawW - 3, clawBarH, leftClaw.hp / Math.max(1, leftClaw.maxHp), '#9edcff', 'rgba(0,0,0,0.36)', '', true);
        }
        if (rightClaw) {
          drawBar(16 + clawW, clawBarY, clawW - 3, clawBarH, rightClaw.hp / Math.max(1, rightClaw.maxHp), '#9edcff', 'rgba(0,0,0,0.36)', '', true);
        }
      }
    }

    const invulnPickupActive = p.invuln > 0.5;
    let powerLabel = '';
    let powerRatio = 0;
    let powerColor = '';
    let powerBackColor = 'rgba(0,0,0,0.35)';
    let powerFlat = false;
    if (invulnPickupActive) {
      powerLabel = 'INVULN';
      powerRatio = p.invuln / 4;
      powerColor = '#ff0000';        
    } else if (state.overdrive > 0) {
      powerLabel = 'OVERDRIVE';
      powerRatio = state.overdrive / 7;
      powerColor = '#0000ff';      
    } else if (p.rapidTimer > 0) {
      powerLabel = 'RAPID';
      powerRatio = p.rapidTimer / 8;
      powerColor = '#ffd000';
    } else if (p.magnetTimer > 0) {
      powerLabel = 'MAGNET';
      powerRatio = p.magnetTimer / 12;
      powerColor = '#c0c0c0';
    }
    if (powerRatio > 0) {
      drawBar(view.w * 0.18, view.h - view.controlsH - 30, view.w * 0.64, 10, powerRatio, powerColor, powerBackColor, powerLabel, powerFlat);
    }


    if (state.paused) {
      hudCtx.fillStyle = 'rgba(0,0,0,0.28)';
      hudCtx.fillRect(0, 0, view.w, view.h);
      drawCenterCard('PAUSED', 'Press P or click PAUSE to resume.', ['The battle is frozen in place.'], theme.accent2, 'Hold FIRE when you are ready.');
    } else if (state.mode === 'gameover') {
      drawCenterCard('GAME OVER', state.bannerSub, ['Score: ' + format(state.score), 'Best: ' + format(state.highScore)], '#ff8b79', 'Press fire to continue.');
    } else if (state.mode === 'victory') {
      drawCenterCard('VICTORY', state.bannerSub, ['Score: ' + format(state.score), 'Best: ' + format(state.highScore)], '#ffe78a', 'Press fire to continue.');
    }
    hudCtx.restore();
  }

  function drawDebugFps() {
    if (!state.debugMode) return;
    hudCtx.save();
    hudCtx.fillStyle = '#fff';
    hudCtx.font = '700 11px "Trebuchet MS", "Segoe UI", sans-serif';
    hudCtx.textAlign = 'left';
    hudCtx.textBaseline = 'bottom';
    function joyLabel(value) {
      const n = Math.round(clamp(value || 0, -1, 1) * 100);
      const sign = n < 0 ? '-' : '+';
      return sign + String(Math.abs(n)).padStart(2, '0');
    }
    hudCtx.fillText(
      'FPS ' + Math.round(state.fpsAvg || state.fps || 0) +
      '  S ' + state.starfield.length +
      '  Q ' + (render.lastQueueLength || 0) +
      '  P ' + state.particles.length +
      '  B ' + state.bullets.length +
      '  EB ' + state.enemyBullets.length +
      '  BX ' + (render.lastBatchCount || 0) +
      '  JX' + joyLabel(state.gamepad.joyX) +
      '  JY' + joyLabel(state.gamepad.joyY) +
      (hasDebugExceptionInLog() ? '  EXCEPTION!' : ''),
      10,
      view.h - 10
    );
    hudCtx.restore();
  }

  function drawTitle() {
    const theme = mainTheme();
    const pulse = 0.5 + Math.sin(state.musicStep * 0.4) * 0.5;
    const loading = !state.assetsReady || state.assetsLoading || assetWarmupBusy();
    const cardW = clamp(view.w * 0.86, 320, 1040);
    const cardH = clamp(view.h * 0.62, 300, 700);
    const x = (view.w - cardW) * 0.5;
    const y = Math.max(10, (view.h - view.controlsH - cardH) * 0.22);
    hudCtx.save();
    hudCtx.textAlign = 'center';
    hudCtx.textBaseline = 'middle';
    if (titleArtReady && titleArt.naturalWidth > 0 && titleArt.naturalHeight > 0) {
      const pad = Math.min(cardW, cardH) * 0.08;
      const maxW = cardW - pad * 2;
      const maxH = cardH - pad * 2 - 38;
      const baseScale = Math.min(maxW / titleArt.naturalWidth, maxH / titleArt.naturalHeight);
      const scale = baseScale * 1.25;
      const dw = titleArt.naturalWidth * scale;
      const dh = titleArt.naturalHeight * scale;
      const baseDh = titleArt.naturalHeight * baseScale;
      const ix = x + (cardW - dw) * 0.5;
      const iy = y + 16 + Math.max(0, (maxH - baseDh) * 0.5) + baseDh - dh;
      hudCtx.shadowColor = theme.accent2;
      hudCtx.shadowBlur = 18;
      hudCtx.drawImage(titleArt, ix, iy, dw, dh);
      hudCtx.shadowBlur = 0;
    }
    hudCtx.fillStyle = '#fff';
    hudCtx.globalAlpha = 0.96;
    if (loading) {
      hudCtx.save();
      hudCtx.globalAlpha = 0.8;
      hudCtx.fillStyle = '#000';
      hudCtx.fillRect(0, 0, view.w, view.h);
      hudCtx.restore();
      hudCtx.globalAlpha = 0.98;
      hudCtx.font = '900 ' + clamp(Math.round(view.w * 0.038), 22, 42) + 'px "Trebuchet MS", "Segoe UI", sans-serif';
      hudCtx.fillText('LOADING TEXTURES', view.w * 0.5, view.h * 0.54);
    } else {
      hudCtx.font = '800 15px "Trebuchet MS", "Segoe UI", sans-serif';
      hudCtx.fillText('Click or press Space to begin.', view.w * 0.5, y + cardH - 28);
      hudCtx.globalAlpha = 0.82;
      hudCtx.font = '700 12px "Trebuchet MS", "Segoe UI", sans-serif';
      hudCtx.fillText('Open SETTINGS for sound, music, and combat tuning.', view.w * 0.5, y + cardH - 48);
    }
    hudCtx.restore();

    hudCtx.save();
    hudCtx.textAlign = 'center';
    hudCtx.textBaseline = 'middle';
    hudCtx.fillStyle = '#fff';
    hudCtx.font = '800 15px "Trebuchet MS", "Segoe UI", sans-serif';
    hudCtx.shadowColor = theme.accent2;
    hudCtx.shadowBlur = 10;
    hudCtx.fillText('BEST ' + format(state.highScore) + '  |  ' + THEMES.length + ' SECTORS  |  THORIUM GAP', view.w * 0.5, view.h - view.controlsH - 18);
    hudCtx.restore();
  }

  function draw(ts) {
    syncBodyModeClass();
    state.renderFrameIndex++;
    render.offsetX = state.shake > 0 ? rand(-state.shake, state.shake) : 0;
    render.offsetY = state.shake > 0 ? rand(-state.shake, state.shake) : 0;
    drawBackground();
    drawParticles();
    drawPickups();
    drawBullets();
    for (let i = 0; i < state.enemies.length; i++) drawEnemy(state.enemies[i]);
    if (state.boss) drawBoss(state.boss);
    if (state.mode !== 'debug') drawPlayer();
    drawForeground();
    if (state.flash > 0) {
      drawSpriteRect(view.w * 0.5, view.h * 0.5, view.w, view.h, '#ffffff', state.flash * 0.3, 999, true);
    }
    flushRender();
    if (shouldRedrawHud(ts)) {
      hudCtx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
      hudCtx.clearRect(0, 0, view.w, view.h);
      if (state.mode === 'title') drawTitle();
      else if (state.mode !== 'debug') drawHud();
      state.hudLastDraw = ts || 0;
      state.hudDirty = false;
    }
    drawDebugFps();
  }

  function togglePause(force) {
    if (state.mode !== 'playing') return;
    const next = force == null ? !state.paused : !!force;
    if (next === state.paused) return;
    state.paused = next;
    setBanner(state.paused ? 'PAUSED' : 'RESUMED', state.paused ? 'Press P or click PAUSE.' : 'Back in the fight.', 1.0);
    hint(state.paused ? 'Paused.' : 'Back in action.', 1.3);
  }

  function toggleMute(force) {
    state.muted = force == null ? !state.muted : !!force;
    syncSettingsUi();
    hint(state.muted ? 'Sound off.' : 'Sound on.', 1.1);
  }

  function pressAction(act, down) {
    if (act === 'left' || act === 'right' || act === 'up' || act === 'down') {
      state.input[act] = down;
      return;
    }
    if (act === 'settings' && down) {
      toggleSettings();
      return;
    }
    if (act === 'fire') {
      if (down) {
        if (state.mode === 'title') startGame();
        else if (state.mode === 'gameover' || state.mode === 'victory') endScreenContinue();
        else state.input.fire = true;
      }
      state.input.fire = down;
      return;
    }
    if (act === 'bomb' && down) {
      if (state.mode === 'gameover' || state.mode === 'victory') endScreenContinue();
      else useBomb();
    }
    if (act === 'pause' && down) togglePause();
    if (act === 'sound' && down) toggleMute();
  }

  function bindButton(button, act) {
    const release = function (ev) {
      if (ev) ev.preventDefault();
      button.classList.remove('active');
      pressAction(act, false);
      try { if (button.hasPointerCapture && ev && ev.pointerId != null) button.releasePointerCapture(ev.pointerId); } catch (e) {}
    };
    button.addEventListener('pointerdown', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      button.classList.add('active');
      pressAction(act, true);
      try { if (button.setPointerCapture) button.setPointerCapture(ev.pointerId); } catch (e) {}
    });
    button.addEventListener('click', function () {
      resumeAudio();
    });
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
  }

  function canvasPoint(ev) {
    const rect = canvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (view.w / rect.width);
    const y = (ev.clientY - rect.top) * (view.h / rect.height);
    return { x: x, y: y };
  }

  function handleCanvasDown(ev) {
    const isMouse = ev.pointerType === 'mouse';
    if (isMouse && ev.button != null && ev.button !== 0 && ev.button !== 2) return;
    ev.preventDefault();
    const pt = canvasPoint(ev);
    if (state.paused) togglePause(false);
    state.pointerActive = true;
    state.pointerId = ev.pointerId;
    state.pointerX = pt.x;
    state.pointerY = pt.y;
    if (isMouse) {
      if (state.settings.alwaysFollowMouse && ev.button === 2 && state.mode === 'playing' && !state.paused) useBomb();
      state.mouseButtons = (typeof ev.buttons === 'number') ? ev.buttons : (1 << (ev.button || 0));
      state.input.fire = !!(state.mouseButtons & 1);
    } else {
      state.input.fire = true;
    }
    try { if (canvas.setPointerCapture) canvas.setPointerCapture(ev.pointerId); } catch (e) {}
  }

  function handleCanvasMove(ev) {
    const isMouse = ev.pointerType === 'mouse';
    if (isMouse) {
      if (!state.settings.alwaysFollowMouse && !state.pointerActive && !(ev.buttons > 0)) return;
    } else {
      if (!state.pointerActive || ev.pointerId !== state.pointerId) return;
    }
    ev.preventDefault();
    const pt = canvasPoint(ev);
    state.pointerX = pt.x;
    state.pointerY = pt.y;
    if (isMouse) {
      const prevButtons = state.mouseButtons | 0;
      state.mouseButtons = (typeof ev.buttons === 'number') ? ev.buttons : state.mouseButtons;
      if (state.settings.alwaysFollowMouse && (state.mouseButtons & 2) && !(prevButtons & 2) && state.mode === 'playing' && !state.paused) useBomb();
      state.pointerActive = state.settings.alwaysFollowMouse ? true : (state.mouseButtons > 0);
      state.input.fire = !!(state.mouseButtons & 1);
    }
  }

  function handleCanvasUp(ev) {
    const isMouse = ev.pointerType === 'mouse';
    if (!isMouse && (!state.pointerActive || ev.pointerId !== state.pointerId)) return;
    ev.preventDefault();
    if (isMouse) {
      state.mouseButtons = (typeof ev.buttons === 'number') ? ev.buttons : 0;
      state.pointerActive = state.settings.alwaysFollowMouse ? true : (state.mouseButtons > 0);
      state.input.fire = !!(state.mouseButtons & 1);
      if (!state.pointerActive) {
        state.pointerId = null;
        try { if (canvas.hasPointerCapture && ev.pointerId != null) canvas.releasePointerCapture(ev.pointerId); } catch (e) {}
      }
    } else {
      state.pointerActive = false;
      state.pointerId = null;
      state.input.fire = false;
      try { if (canvas.hasPointerCapture && ev.pointerId != null) canvas.releasePointerCapture(ev.pointerId); } catch (e) {}
    }
  }

  function handleCanvasClick(ev) {
    if (ev.button != null && ev.button !== 0) return;
    ev.preventDefault();
    resumeAudio();
    if (ev.detail === 2) {
      if (state.mode === 'playing' && !state.paused) useBomb();
      return;
    }
    if (state.mode === 'title') startGame();
    else if (state.mode === 'gameover' || state.mode === 'victory') endScreenContinue();
  }

  function onKeyDown(ev) {
    const code = ev.code;
    if (state.settingsOpen || settingsDialog.open) {
      if (code === 'Escape' || code === 'KeyO') {
        ev.preventDefault();
        closeSettings();
      }
      return;
    }
    if (code === 'ArrowLeft' || code === 'ArrowRight' || code === 'ArrowUp' || code === 'ArrowDown' || code === 'KeyA' || code === 'KeyD' || code === 'KeyW' || code === 'KeyS' || code === 'Space' || code === 'KeyZ' || code === 'ControlLeft' || code === 'ControlRight' || code === 'Enter' || code === 'KeyX' || code === 'KeyB' || code === 'KeyP' || code === 'KeyM' || code === 'KeyR' || code === 'KeyL' || code === 'Escape' || code === 'KeyO') {
        ev.preventDefault();
        resumeAudio();
      }
    if (state.debugMode && code === 'KeyL') {
      ev.preventDefault();
      if (!ev.repeat) debugJumpToFinalBoss();
    }
    if (state.debugMode && code === 'Digit0') {
      ev.preventDefault();
      if (!ev.repeat) debugJumpToBoss();
    }
    if (state.debugMode && (code === 'Digit1' || code === 'Digit2' || code === 'Digit3' || code === 'Digit4' || code === 'Digit5' || code === 'Digit6' || code === 'Digit7' || code === 'Digit8' || code === 'Digit9' || code === 'Backquote' || code === 'IntlBackslash' || code === 'Backslash')) {
      ev.preventDefault();
      if (!ev.repeat) spawnCheatDrop(code);
    }
    if (code === 'ArrowLeft' || code === 'KeyA') state.input.left = true;
    else if (code === 'ArrowRight' || code === 'KeyD') state.input.right = true;
    else if (code === 'ArrowUp' || code === 'KeyW') state.input.up = true;
    else if (code === 'ArrowDown' || code === 'KeyS') state.input.down = true;
      else if (code === 'ControlLeft' || code === 'ControlRight' || code === 'Enter') {
        if (state.mode === 'title') startGame();
        else if (state.mode === 'gameover' || state.mode === 'victory') endScreenContinue();
        else state.input.fire = true;
      } else if (code === 'Space') {
        if (state.mode === 'title') startGame();
        else if (state.mode === 'gameover' || state.mode === 'victory') endScreenContinue();
        else if (state.mode === 'playing' && !ev.repeat) useBomb();
      } else if (code === 'KeyZ') {
        if (state.mode === 'title') startGame();
        else if (state.mode === 'gameover' || state.mode === 'victory') endScreenContinue();
        else state.input.fire = true;
      } else if (code === 'KeyX' || code === 'KeyB') {
        if (!ev.repeat) {
          if (state.mode === 'gameover' || state.mode === 'victory') endScreenContinue();
          else useBomb();
        }
      } else if (code === 'KeyP' || code === 'Escape') {
      if (!ev.repeat) togglePause();
    } else if (code === 'KeyM') {
      if (!ev.repeat) toggleMute();
    } else if (code === 'KeyR') {
      if (!ev.repeat) {
        if (state.mode === 'title') startGame();
        else if (state.mode === 'gameover' || state.mode === 'victory') endScreenContinue();
      }
    } else if (code === 'KeyO') {
      if (!ev.repeat) toggleSettings();
    }
  }

  function onKeyUp(ev) {
    const code = ev.code;
    if (code === 'ArrowLeft' || code === 'KeyA') state.input.left = false;
    else if (code === 'ArrowRight' || code === 'KeyD') state.input.right = false;
    else if (code === 'ArrowUp' || code === 'KeyW') state.input.up = false;
    else if (code === 'ArrowDown' || code === 'KeyS') state.input.down = false;
      else if (code === 'ControlLeft' || code === 'ControlRight' || code === 'Enter' || code === 'KeyZ') state.input.fire = false;
  }

  function loop(ts) {
    if (!loop.last) loop.last = ts;
    const dt = clamp((ts - loop.last) / 1000, 0, 0.05);
    loop.last = ts;
    state.fps = dt > 0 ? 1 / dt : state.fps;
    state.fpsAvg = filterDps(state.fpsAvg || state.fps, state.fps);
    updateStarfieldCap(dt);
    update(dt);
    draw(ts);
    requestAnimationFrame(loop);
  }

  window.__shotemup = {
    state: state,
    resumeAudio: resumeAudio,
    setBanner: setBanner,
    hint: hint,
    startGame: startGame,
    togglePause: togglePause,
    toggleMute: toggleMute,
    debugGiveWeapon: debugGiveWeapon,
    getDebugLog: function () { return state.debugLog.slice(); },
    clearDebugLog: function () { state.debugLog.length = 0; saveDebugLog(); },
    setDamageBreakpoints: function (on) { state.debugDamageBreakpoints = !!on; },
    isAssetsReady: function () { return !!state.assetsReady; }
  };

  if (titleManualButton) {
    titleManualButton.addEventListener('click', function () {
      window.open('./GameManual.html', '_blank', 'noopener');
    });
    syncTitleManualButton();
    setInterval(syncTitleManualButton, 120);
  }

  resize();
  resetRun();
  beginTexturePreload();
  controlsEl.querySelectorAll('button[data-act]').forEach(function (button) {
    bindButton(button, button.getAttribute('data-act'));
  });
  settingsClose.addEventListener('click', function () {
    closeSettings();
  });
  settingsDialog.addEventListener('cancel', function (ev) {
    ev.preventDefault();
    return false;
  });
  settingsDialog.addEventListener('click', function (ev) {
    if (ev.target === settingsDialog) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  });
  sfxVolumeInput.addEventListener('input', function (ev) {
    setVolume('sfx', ev.target.value);
  });
  musicVolumeInput.addEventListener('input', function (ev) {
    setVolume('music', ev.target.value);
  });
  if (lowEndModeInput) {
    lowEndModeInput.addEventListener('change', function (ev) {
      setLowEndMode(ev.target.checked);
    });
  }
  if (alwaysFollowMouseInput) {
    alwaysFollowMouseInput.addEventListener('change', function (ev) {
      setAlwaysFollowMouse(ev.target.checked);
    });
  }
  for (let i = 0; i < difficultyButtons.length; i++) {
    difficultyButtons[i].addEventListener('click', function () {
      setDifficulty(Number(this.getAttribute('data-difficulty')));
    });
  }
  canvas.addEventListener('pointerdown', handleCanvasDown);
  canvas.addEventListener('pointermove', handleCanvasMove);
  canvas.addEventListener('pointerup', handleCanvasUp);
  canvas.addEventListener('pointercancel', handleCanvasUp);
  window.addEventListener('gamepadconnected', function () { updateGamepadInput(); });
  window.addEventListener('gamepaddisconnected', function () {
    state.gamepad.index = -1;
    state.gamepad.prevFire = false;
    state.gamepad.prevBomb = false;
    state.gamepad.prevMenu = false;
  });
  canvas.addEventListener('click', handleCanvasClick);
  canvas.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && state.mode === 'playing' && !state.paused) togglePause(true);
  });
  requestAnimationFrame(loop);
}());


