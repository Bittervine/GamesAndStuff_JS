(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const canvas = document.getElementById('game');
  const hudCanvas = document.getElementById('hud');
  const hudCtx = hudCanvas.getContext('2d');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
  const controlsEl = document.getElementById('controls');
  const hudHint = document.getElementById('hudHint');
  const settingsDialog = document.getElementById('settingsDialog');
  const settingsClose = document.getElementById('settingsClose');
  const sfxVolumeInput = document.getElementById('sfxVolume');
  const musicVolumeInput = document.getElementById('musicVolume');
  const sfxVolumeValue = document.getElementById('sfxVolumeValue');
  const musicVolumeValue = document.getElementById('musicVolumeValue');
  const difficultyValue = document.getElementById('difficultyValue');
  const difficultyButtons = Array.from(document.querySelectorAll('[data-difficulty]'));
  const loadAdvancedShipInput = document.getElementById('loadAdvancedShip');
  const lowEndModeInput = document.getElementById('lowEndMode');

  const view = { w: 0, h: 0, dpr: 1, controlsH: 118 };
  let currentDt = 0;
  const urlParams = new URLSearchParams(window.location.search || '');
  const DEBUG_MODE = urlParams.get('debug') === '1';
  const render = {
    ready: false,
    queue: [],
    seq: 0,
    normal: [],
    additive: [],
    erase: [],
    batchData: null,
    hudSprites: new Map(),
    offsetX: 0,
    offsetY: 0,
    textures: new Map(),
    white: null,
    circle: null,
    program: null,
    buffer: null,
    aPos: null,
    aUv: null,
    aColor: null,
    uTex: null,
    uViewport: null
  };

  function cp(code) {
    if (code <= 0xFFFF) return String.fromCharCode(code);
    code -= 0x10000;
    return String.fromCharCode(0xD800 + (code >> 10), 0xDC00 + (code & 0x3FF));
  }
  function vs(code) { return cp(code) + cp(0xFE0F); }
  function em() { let s = ''; for (let i = 0; i < arguments.length; i++) s += cp(arguments[i]); return s; }

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
  const ENEMY_SHIP_COLUMNS = 7;
  const ENEMY_SHIP_FALLBACK_BATCHES = 10;
  const ENEMY_SHIP_VARIANT = 'a';
  const ENEMY_SHIP_MIN_SIZE = 64;
  const ENEMY_SHIP_MAX_SIZE = 128;
  const enemyShipLoadKeys = new Set();
  // Enemy glow colors are cached here after a one-time average-color pass on each loaded ship texture.
  const enemyShipGlowColors = new Map();
  const bossArtLoadKeys = new Set();

  function enemyShipKey(levelNumber, shipIndex) {
    return 'enemyship|' + levelNumber + '|' + shipIndex;
  }

  function enemyShipSource(levelNumber, shipIndex) {
    return 'assets/Enemy_' + String(levelNumber).padStart(3, '0') + String(shipIndex).padStart(2, '0') + ENEMY_SHIP_VARIANT + '.png';
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
    let rs = 0, gs = 0, bs = 0, count = 0;
    for (let y = 0; y < h; y += sampleStep) {
      for (let x = 0; x < w; x += sampleStep) {
        const idx = (y * w + x) * 4;
        const a = data[idx + 3];
        if (a < 24) continue;
        rs += data[idx];
        gs += data[idx + 1];
        bs += data[idx + 2];
        count++;
      }
    }
    if (!count) return '#8fd8ff';
    const r = Math.round(rs / count);
    const g = Math.round(gs / count);
    const b = Math.round(bs / count);
    return brightHueFromRgb(r, g, b);
  }

  function brightHueFromRgb(r, g, b) {
    const nr = r / 255;
    const ng = g / 255;
    const nb = b / 255;
    const max = Math.max(nr, ng, nb);
    const min = Math.min(nr, ng, nb);
    const d = max - min;
    let h = 0;
    if (d > 0) {
      if (max === nr) h = ((ng - nb) / d) % 6;
      else if (max === ng) h = (nb - nr) / d + 2;
      else h = (nr - ng) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * 0.5 - 1));
    const finalS = clamp(0.78 + s * 0.18, 0.78, 0.98);
    const finalL = 0.66;
    return hslToHex(h, finalS, finalL);
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

  function ensureEnemyShipTexture(levelNumber, shipIndex) {
    const key = enemyShipKey(levelNumber, shipIndex);
    if (render.textures.has(key) || enemyShipLoadKeys.has(key)) return;
    enemyShipLoadKeys.add(key);
    const img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      try {
        render.textures.set(key, createTextureFromCanvas(img));
        enemyShipGlowColors.set(key, averageImageColor(img));
      } finally {
        enemyShipLoadKeys.delete(key);
      }
    };
    img.onerror = function () {
      enemyShipLoadKeys.delete(key);
    };
    img.src = enemyShipSource(levelNumber, shipIndex);
  }

  function warmEnemyShipBatch(levelNumber) {
    for (let i = 0; i < ENEMY_SHIP_COLUMNS; i++) ensureEnemyShipTexture(levelNumber, i);
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
    ensureEnemyShipTexture(levelNumber, shipIndex);
    const fallback = (fallbackTheme && (fallbackTheme.glow || fallbackTheme.accent2 || fallbackTheme.accent)) || '#8fd8ff';
    return fallback;
  }

  function getEnemyShipRenderSize(levelNumber, shipIndex) {
    const key = 'shipsize|' + levelNumber + '|' + shipIndex;
    return ENEMY_SHIP_MIN_SIZE + (hashString(key) % (ENEMY_SHIP_MAX_SIZE - ENEMY_SHIP_MIN_SIZE + 1));
  }

  function bossArtKey(levelNumber) {
    return 'bossart|' + levelNumber;
  }

  function bossArtSource(levelNumber) {
    return 'assets/Boss_' + String(levelNumber).padStart(2, '0') + '.png';
  }

  function ensureBossTexture(levelNumber) {
    const key = bossArtKey(levelNumber);
    if (render.textures.has(key) || bossArtLoadKeys.has(key)) return;
    bossArtLoadKeys.add(key);
    const img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      try {
        render.textures.set(key, createTextureFromCanvas(img));
      } finally {
        bossArtLoadKeys.delete(key);
      }
    };
    img.onerror = function () {
      bossArtLoadKeys.delete(key);
    };
    img.src = bossArtSource(levelNumber);
  }

  function warmBossArt(levelNumber) {
    ensureBossTexture(levelNumber);
  }

  function getBossTexture(levelNumber) {
    const key = bossArtKey(levelNumber);
    const tex = render.textures.get(key);
    if (tex) return tex;
    ensureBossTexture(levelNumber);
    return null;
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
  function loadNum(key, fallback) { try { const v = Number(localStorage.getItem(key)); return Number.isFinite(v) ? v : fallback; } catch (e) { return fallback; } }
  function saveNum(key, v) { try { localStorage.setItem(key, String(v)); } catch (e) {} }
  function loadBool(key, fallback) { try { const v = localStorage.getItem(key); return v === null ? fallback : v === '1' || v === 'true'; } catch (e) { return fallback; } }
  function saveBool(key, v) { try { localStorage.setItem(key, v ? '1' : '0'); } catch (e) {} }

  function hashString(str) {
    let h = 2166136261 >>> 0;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function makeRng(seed) {
    let s = seed >>> 0;
    if (!s) s = 0x6D2B79F5;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeCanvas(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
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

  function colorArray(color, alpha) {
    const c = Array.isArray(color) ? color : hexToRgb(color || '#ffffff');
    return [c[0] / 255, c[1] / 255, c[2] / 255, alpha == null ? 1 : alpha];
  }

  function rgbaString(color, alpha) {
    const c = Array.isArray(color) ? color : hexToRgb(color || '#ffffff');
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (alpha == null ? 1 : alpha) + ')';
  }

  function initRenderer() {
    if (!gl || render.ready) return;
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
    function compile(type, source) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, source);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader compile failed');
      return sh;
    }
    const program = gl.createProgram();
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
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    render.ready = true;
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
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    return tex;
  }

  function getTextureFromCanvas(canvasLike, key) {
    let tex = render.textures.get(key);
    if (tex) return tex;
    tex = createTextureFromCanvas(canvasLike);
    render.textures.set(key, tex);
    return tex;
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
    render.textures.set(key, tex);
    return tex;
  }

  function pushSprite(texture, x, y, w, h, rot, color, alpha, layer, additive, erase) {
    let uv = null;
    if (arguments.length > 11 && arguments[11]) {
      uv = arguments[11];
    }
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h)) return;
    const item = {
      texture: texture,
      x: (x + render.offsetX) * view.dpr,
      y: (y + render.offsetY) * view.dpr,
      w: w * view.dpr,
      h: h * view.dpr,
      rot: rot || 0,
      color: colorArray(color, alpha),
      layer: layer || 0,
      order: render.seq++,
      blend: erase ? 'erase' : (additive ? 'additive' : 'normal'),
      uv: uv ? {
        u0: Number.isFinite(uv.u0) ? uv.u0 : 0,
        v0: Number.isFinite(uv.v0) ? uv.v0 : 0,
        u1: Number.isFinite(uv.u1) ? uv.u1 : 1,
        v1: Number.isFinite(uv.v1) ? uv.v1 : 1
      } : null
    };
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

  function getHudEmojiSprite(text, size, glow, blur) {
    const s = Math.max(8, Math.round(size));
    const b = Math.max(0, Math.round(blur || 0));
    const key = [text, s, glow || '', b].join('|');
    let sprite = render.hudSprites.get(key);
    if (sprite) return sprite;
    const pad = Math.max(8, Math.round(s * 0.6 + b));
    const dim = Math.max(32, Math.ceil(s * 2.8 + pad * 2));
    const c = makeDomCanvas(dim, dim);
    const g = c.getContext('2d');
    g.clearRect(0, 0, dim, dim);
    g.font = '900 ' + s + 'px ' + EMOJI_FONT;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#fff';
    if (glow) {
      g.shadowColor = glow;
      g.shadowBlur = b;
    }
    g.fillText(text, dim * 0.5, dim * 0.5 + Math.round(s * 0.03));
    sprite = c;
    render.hudSprites.set(key, sprite);
    return sprite;
  }

  function getHudCrackSprite(size, variant) {
    const s = Math.max(10, Math.round(size));
    const v = (variant || 0) % 4;
    const key = ['crack', s, v].join('|');
    let sprite = render.hudSprites.get(key);
    if (sprite) return sprite;
    const pad = Math.max(8, Math.round(s * 0.55));
    const dim = Math.max(28, Math.ceil(s * 2 + pad * 2));
    const c = makeDomCanvas(dim, dim);
    const g = c.getContext('2d');
    const cx = dim * 0.5;
    const cy = dim * 0.5;
    const base = s * 0.42;
    const lineW = Math.max(0.9, s * 0.08);
    const stroke = function (pts, width, alpha) {
      g.save();
      g.globalAlpha = alpha;
      g.strokeStyle = '#000000';
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.lineWidth = width;
      g.beginPath();
      g.moveTo(cx + pts[0][0], cy + pts[0][1]);
      for (let i = 1; i < pts.length; i++) g.lineTo(cx + pts[i][0], cy + pts[i][1]);
      g.stroke();
      g.restore();
    };
    g.clearRect(0, 0, dim, dim);
    if (v === 0) {
      stroke([[-base * 0.15, -base * 1.1], [base * 0.08, -base * 0.52], [-base * 0.08, -base * 0.05], [base * 0.12, base * 0.6]], lineW * 0.8, 1);
      stroke([[base * 0.02, -base * 0.22], [base * 0.52, -base * 0.65], [base * 0.2, base * 0.02], [base * 0.6, base * 0.5]], lineW * 0.55, 0.86);
      stroke([[-base * 0.06, base * 0.02], [-base * 0.42, base * 0.28], [-base * 0.2, base * 0.7]], lineW * 0.42, 0.75);
    } else if (v === 1) {
      stroke([[-base * 0.5, -base * 0.7], [-base * 0.12, -base * 0.15], [-base * 0.26, base * 0.3], [base * 0.18, base * 0.84]], lineW * 0.78, 1);
      stroke([[base * 0.08, -base * 0.05], [base * 0.42, -base * 0.42], [base * 0.12, base * 0.18], [base * 0.42, base * 0.64]], lineW * 0.52, 0.84);
      stroke([[-base * 0.02, base * 0.22], [-base * 0.42, base * 0.12], [-base * 0.34, base * 0.56]], lineW * 0.42, 0.72);
    } else if (v === 2) {
      stroke([[-base * 0.08, -base * 0.95], [base * 0.1, -base * 0.3], [-base * 0.18, base * 0.02], [base * 0.1, base * 0.78]], lineW * 0.8, 1);
      stroke([[-base * 0.22, -base * 0.1], [-base * 0.7, base * 0.18], [-base * 0.34, base * 0.4]], lineW * 0.5, 0.82);
      stroke([[base * 0.14, base * 0.1], [base * 0.56, base * 0.34], [base * 0.32, base * 0.68]], lineW * 0.44, 0.74);
    } else {
      stroke([[-base * 0.2, -base * 1.0], [-base * 0.02, -base * 0.38], [base * 0.26, base * 0.02], [base * 0.02, base * 0.72]], lineW * 0.82, 1);
      stroke([[base * 0.06, -base * 0.1], [base * 0.52, -base * 0.05], [base * 0.18, base * 0.32], [base * 0.46, base * 0.78]], lineW * 0.48, 0.82);
      stroke([[-base * 0.12, base * 0.18], [-base * 0.52, base * 0.56], [-base * 0.16, base * 0.82]], lineW * 0.42, 0.7);
    }
    sprite = c;
    render.hudSprites.set(key, sprite);
    return sprite;
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
    const r = s.color[0];
    const g = s.color[1];
    const b = s.color[2];
    const a = s.color[3];

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
      if (!render.ready) return;
    }
    const w = canvas.width;
    const h = canvas.height;
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(render.program);
    gl.uniform2f(render.uViewport, w, h);
    gl.bindBuffer(gl.ARRAY_BUFFER, render.buffer);
    render.queue.sort(function (a, b) { return a.layer === b.layer ? a.order - b.order : a.layer - b.layer; });
    const data = ensureBatchData(render.queue.length);
    let batchTex = null;
    let batchSprites = 0;
    let batchOffset = 0;
    let batchBlend = 'normal';
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
    render.normal.length = 0;
    render.additive.length = 0;
    render.erase.length = 0;
  }

  function phase(dur, motion, attack) { return { dur: dur, motion: motion, attack: attack }; }
  function theme(cfg) { return cfg; }

  const THEMES = [
    theme({ name: 'Thorium Rift', subtitle: 'Black Drift', skyTop: '#07111f', skyBottom: '#274062', glow: '#9bc5ff', accent: '#6d9cff', accent2: '#d5e4ff', icons: [E.apple, E.pear, E.cherry, E.leaf], forms: ['line', 'fan', 'rain'], enemyKinds: ['drifter', 'splitter', 'bomber'], atmosphere: 'leaves', music: { bpm: 112, root: 220, pattern: [0, 3, 5, 7, 10, 7, 5, 3] }, boss: { name: 'Warden Thorne', emoji: E.apple, hp: 160, color: '#9ec2ff', phases: [phase(7, 'hover', 'aimed'), phase(7, 'sweep', 'rain'), phase(8, 'low', 'ring')] } }),
    theme({ name: 'Null Swarm', subtitle: 'Silent Hive', skyTop: '#061b1b', skyBottom: '#1f4d49', glow: '#8ff7ff', accent: '#58d7c6', accent2: '#c8fff2', icons: [E.bee, E.ladybug, E.butterfly, E.seed], forms: ['swarm', 'pair', 'arc'], enemyKinds: ['zigzag', 'swarm', 'sniper'], atmosphere: 'pollen', music: { bpm: 126, root: 246, pattern: [0, 2, 4, 7, 9, 7, 4, 2] }, boss: { name: 'Swarm Matron', emoji: E.bee, hp: 176, color: '#93f0e8', phases: [phase(7, 'hover', 'fan'), phase(7.5, 'sweep', 'summon'), phase(8, 'low', 'ring')] } }),
    theme({ name: 'Ion Collapse', subtitle: 'Ash Sector', skyTop: '#1b1730', skyBottom: '#53265f', glow: '#d19cff', accent: '#9a7cff', accent2: '#f0d0ff', icons: [E.lollipop, E.donut, E.cookie, E.chocolate], forms: ['fan', 'rain', 'cross'], enemyKinds: ['drifter', 'zigzag', 'bomber'], atmosphere: 'sprinkles', music: { bpm: 136, root: 262, pattern: [0, 4, 7, 12, 7, 4, 5, 9] }, boss: { name: 'Baron Null', emoji: E.donut, hp: 188, color: '#c29bff', phases: [phase(7, 'hover', 'fan'), phase(7, 'sweep', 'ring'), phase(8, 'low', 'rain')] } }),
    theme({ name: 'Cold Forge', subtitle: 'Scrap Horizon', skyTop: '#0f1620', skyBottom: '#4d5867', glow: '#96c9ff', accent: '#9fb2c6', accent2: '#d0e0ef', icons: [E.gear, E.battery, E.wrench, E.rocket], forms: ['line', 'pair', 'cross'], enemyKinds: ['zigzag', 'sniper', 'bomber'], atmosphere: 'sparks', music: { bpm: 118, root: 196, pattern: [0, 0, 7, 5, 4, 5, 7, 10] }, boss: { name: 'Scrap Sovereign', emoji: E.gear, hp: 200, color: '#d0d9e1', phases: [phase(7, 'sweep', 'ring'), phase(7.5, 'hover', 'summon'), phase(8, 'dash', 'fan')] } }),
    theme({ name: 'Deadlight Fen', subtitle: 'Echo Tide', skyTop: '#06111d', skyBottom: '#532a40', glow: '#ffbf8a', accent: '#e0a06c', accent2: '#ffc8a1', icons: [E.lantern, E.ghost, E.sparkles, E.star], forms: ['rain', 'arc', 'swarm'], enemyKinds: ['drifter', 'sniper', 'spinner'], atmosphere: 'motes', music: { bpm: 108, root: 196, pattern: [0, 5, 7, 10, 7, 5, 3, 5] }, boss: { name: 'Specter Captain', emoji: E.lantern, hp: 204, color: '#f6b46d', phases: [phase(7, 'hover', 'aimed'), phase(7.5, 'sweep', 'beam'), phase(8, 'low', 'ring')] } }),
    theme({ name: 'Domain of Klaato', subtitle: 'Sting Vector', skyTop: '#220c0c', skyBottom: '#6d3a13', glow: '#ffd77a', accent: '#c47a19', accent2: '#ffd59f', icons: [E.bee, E.honey, E.fire, E.bolt], forms: ['swarm', 'fan', 'pair'], enemyKinds: ['diver', 'swarm', 'sniper'], atmosphere: 'embers', music: { bpm: 132, root: 246, pattern: [0, 2, 3, 7, 10, 7, 3, 2] }, boss: { name: 'Hive Regent', emoji: E.bee, hp: 216, color: '#e4ba6a', phases: [phase(7, 'hover', 'fan'), phase(7.5, 'sweep', 'summon'), phase(8, 'dash', 'rain')] } }),
    theme({ name: 'Shard Expanse', subtitle: 'Prism Break', skyTop: '#07142f', skyBottom: '#264e88', glow: '#b0fbff', accent: '#95d5ff', accent2: '#d6c4ff', icons: [E.crystal, E.gem, E.star, E.moon], forms: ['ring', 'line', 'arc'], enemyKinds: ['spinner', 'sniper', 'drifter'], atmosphere: 'shards', music: { bpm: 120, root: 233, pattern: [0, 4, 7, 11, 7, 4, 9, 7] }, boss: { name: 'Shard Devourer', emoji: E.gem, hp: 228, color: '#c9f6ff', phases: [phase(7, 'hover', 'fan'), phase(7.5, 'sweep', 'ring'), phase(8, 'low', 'beam')] } }),
    theme({ name: 'Mythic Descent', subtitle: 'Magma Line', skyTop: '#180709', skyBottom: '#6c2919', glow: '#ffab5b', accent: '#de6f2b', accent2: '#ffd08a', icons: [E.fire, E.pepper, E.honey, E.sparkles], forms: ['rain', 'line', 'swarm'], enemyKinds: ['bomber', 'diver', 'splitter'], atmosphere: 'embers', music: { bpm: 140, root: 220, pattern: [0, 3, 7, 10, 7, 3, 5, 10] }, boss: { name: 'Purple Reaper', emoji: E.fire, hp: 240, color: '#ff9e53', phases: [phase(7, 'hover', 'rain'), phase(7.5, 'sweep', 'beam'), phase(8, 'low', 'wall')] } }),
    theme({ name: 'Lunar Grave', subtitle: 'Low Orbit Ruin', skyTop: '#07111d', skyBottom: '#2d3d61', glow: '#95d7ff', accent: '#aebfe0', accent2: '#95d7ff', icons: [E.moon, E.star, E.rocket, E.comet], forms: ['line', 'wave', 'pair'], enemyKinds: ['drifter', 'zigzag', 'mine'], atmosphere: 'stardust', music: { bpm: 106, root: 185, pattern: [0, 7, 12, 7, 10, 7, 5, 3] }, boss: { name: 'Lunar Horse', emoji: E.moon, hp: 252, color: '#c3d6ff', phases: [phase(7, 'hover', 'summon'), phase(7.5, 'sweep', 'beam'), phase(8, 'dash', 'ring')] } }),
    theme({ name: 'Dark Waters', subtitle: 'Laser Grid', skyTop: '#07101c', skyBottom: '#2d1a5a', glow: '#82f6ff', accent: '#6eeaff', accent2: '#d18cff', icons: [E.bolt, E.sparkles, E.disc, E.target], forms: ['wave', 'cross', 'pair'], enemyKinds: ['zigzag', 'sniper', 'bomber'], atmosphere: 'neon', music: { bpm: 144, root: 220, pattern: [0, 7, 12, 10, 7, 4, 9, 12] }, boss: { name: 'Whaling Wraith', emoji: E.bolt, hp: 264, color: '#8fefff', phases: [phase(7, 'sweep', 'wall'), phase(7.5, 'hover', 'aimed'), phase(8, 'dash', 'ring')] } }),
    theme({ name: 'Black Citadel', subtitle: 'Knightfall', skyTop: '#0a0c14', skyBottom: '#403f55', glow: '#f0f3ff', accent: '#b6bfd6', accent2: '#9e8e5e', icons: [E.knight, E.rook, E.bishop, E.queen], forms: ['line', 'cross', 'wave'], enemyKinds: ['zigzag', 'sniper', 'elite'], atmosphere: 'chess', music: { bpm: 122, root: 196, pattern: [0, 3, 7, 10, 7, 3, 5, 7] }, boss: { name: 'Cyberphisher', emoji: E.queen, hp: 288, color: '#e7ecff', phases: [phase(7, 'hover', 'aimed'), phase(7.5, 'sweep', 'summon'), phase(8, 'dash', 'ring')] } }),
    theme({ name: 'Submerged Bastion', subtitle: 'Thunder Line', skyTop: '#0c1821', skyBottom: '#344c84', glow: '#d7f4ff', accent: '#9cc7ff', accent2: '#d7f4ff', icons: [E.cloud, E.rain, E.bolt, E.star], forms: ['rain', 'line', 'swarm'], enemyKinds: ['diver', 'sniper', 'spinner'], atmosphere: 'rain', music: { bpm: 128, root: 196, pattern: [0, 4, 7, 10, 7, 4, 2, 5] }, boss: { name: 'Rocket Rager', emoji: E.cloud, hp: 276, color: '#d3edff', phases: [phase(7, 'hover', 'fan'), phase(7.5, 'sweep', 'rain'), phase(8, 'low', 'ring')] } }),
    theme({ name: 'Throium Gap', subtitle: 'Final Descent', skyTop: '#0f081b', skyBottom: '#5b3d18', glow: '#ffe78a', accent: '#ffd77a', accent2: '#ffffff', icons: [E.sun, E.crown, E.star, E.comet], forms: ['ring', 'fan', 'wave'], enemyKinds: ['elite', 'sniper', 'spinner'], atmosphere: 'nova', music: { bpm: 152, root: 262, pattern: [0, 4, 7, 12, 15, 12, 7, 4] }, boss: { name: 'Sun Eater', emoji: E.sun, hp: 320, color: '#fff0bd', phases: [phase(6.5, 'hover', 'aimed'), phase(6.5, 'sweep', 'ring'), phase(6.5, 'dash', 'beam'), phase(7.5, 'low', 'wall')] } })
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
    weapon: { emoji: E.wrench, color: '#00ffff' },
    rapid: { emoji: E.bolt, color: '#ffe97e' },
    shield: { emoji: E.shield, color: '#8fd8ff' },
    bomb: { emoji: E.bomb, color: '#ffd96a' },
    magnet: { emoji: E.magnet, color: '#77f7c4' },
    score: { emoji: E.gem, color: '#ff86e0' }
  };

  const ENEMIES = {
    drifter: { hp: 2, r: 18, score: 90, speed: 96 },
    zigzag: { hp: 3, r: 18, score: 110, speed: 112 },
    swarm: { hp: 1, r: 14, score: 75, speed: 140 },
    bomber: { hp: 4, r: 20, score: 140, speed: 86 },
    sniper: { hp: 3, r: 18, score: 130, speed: 74 },
    spinner: { hp: 5, r: 22, score: 180, speed: 70 },
    splitter: { hp: 4, r: 20, score: 150, speed: 92 },
    diver: { hp: 3, r: 18, score: 130, speed: 120 },
    mine: { hp: 4, r: 19, score: 120, speed: 60 },
    elite: { hp: 7, r: 24, score: 280, speed: 80 }
  };

  const DIFFICULTIES = [
    { label: 'Easy', lives: 5, enemyHp: 0.82, enemySpeed: 0.88, spawnRate: 0.82, spawnCount: 0.5, bulletSpeed: 0.88, bossHp: 0.84, contact: 0.9, playerDamage: 1 },
    { label: 'Normal', lives: 3, enemyHp: 1, enemySpeed: 1, spawnRate: 1, spawnCount: 0.75, bulletSpeed: 1, bossHp: 1, contact: 1, playerDamage: 0.5 },
    { label: 'Hard', lives: 2, enemyHp: 1.18, enemySpeed: 1.12, spawnRate: 1.16, spawnCount: 1.18, bulletSpeed: 1.14, bossHp: 1.2, contact: 1.12, playerDamage: 0.25 }
  ];

  const SHOT_PACE = 1.25;
  const PLAYER_RADIUS = 50;

  function shotDelay(v) {
    return v * SHOT_PACE;
  }

  const state = {
    mode: 'title',
    paused: false,
    muted: false,
    settingsOpen: false,
    settingsPausedByDialog: false,
    levelIndex: 0,
    score: 0,
    highScore: loadNum('ShotEmUp_JS_highScore', 0),
    settings: {
      sfxVolume: clamp(loadNum('ShotEmUp_JS_sfxVolume', 0.8), 0, 1),
      musicVolume: clamp(loadNum('ShotEmUp_JS_musicVolume', 0), 0, 1),
      difficulty: clamp(Math.round(loadNum('ShotEmUp_JS_difficulty', 1)), 0, 2),
      loadAdvanced3DShipModel: loadBool('ShotEmUp_JS_loadAdvanced3DShipModel', false),
      lowEndMode: loadBool('ShotEmUp_JS_lowEndMode', false)
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
    starfield: [],
    starfieldScroll: 0,
    enemies: [],
    bullets: [],
    enemyBullets: [],
    pickups: [],
    particles: [],
    boss: null,
    currentTheme: THEMES[0],
    transition: null,
    player: {
      x: 0, y: 0, r: PLAYER_RADIUS,
      health: 6, maxHealth: 6,
      shield: 0, bombs: 2,
      weaponMode: 0, weaponTier: 1,
      weaponTiers: Array(WEAPONS.length).fill(1),
      fireCooldown: 0, rapidTimer: 0, magnetTimer: 0,
      invuln: 0, repairDelay: 0, fireHeld: false, pointerMode: false,
      respawnTimer: 0, respawnDuration: 0,
      respawnStartX: 0, respawnStartY: 0,
      respawnTargetX: 0, respawnTargetY: 0
    },
    input: { left: false, right: false, up: false, down: false, fire: false },
    pointerActive: false,
    pointerId: null,
    pointerX: 0,
    pointerY: 0,
    musicClock: 0,
    musicStep: 0,
    debugMode: DEBUG_MODE
  };
  const shipBridge = window.__ShotEmUp3D;
  if (shipBridge) {
    shipBridge.enabled = true;
    shipBridge.advancedModelEnabled = !!state.settings.loadAdvanced3DShipModel;
    shipBridge.lowEndMode = !!state.settings.lowEndMode;
    shipBridge.debugGiveWeapon = function (name, tier) {
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
    };
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
  }

  function hint(text, seconds) {
    hudHint.textContent = text;
    hudHint.classList.add('show');
    clearTimeout(hint._timer);
    hint._timer = setTimeout(function () { hudHint.classList.remove('show'); }, Math.max(300, (seconds || 2.4) * 1000));
  }

  function currentDifficulty() {
    return DIFFICULTIES[clamp(state.settings.difficulty, 0, DIFFICULTIES.length - 1)] || DIFFICULTIES[1];
  }

  function saveSettings() {
    saveNum('ShotEmUp_JS_sfxVolume', state.settings.sfxVolume);
    saveNum('ShotEmUp_JS_musicVolume', state.settings.musicVolume);
    saveNum('ShotEmUp_JS_difficulty', state.settings.difficulty);
    saveBool('ShotEmUp_JS_loadAdvanced3DShipModel', state.settings.loadAdvanced3DShipModel);
    saveBool('ShotEmUp_JS_lowEndMode', state.settings.lowEndMode);
    saveNum('ShotEmUp_JS_highScore', state.highScore);
  }

  function syncSettingsUi() {
    if (sfxVolumeInput) sfxVolumeInput.value = String(state.settings.sfxVolume);
    if (musicVolumeInput) musicVolumeInput.value = String(state.settings.musicVolume);
    if (sfxVolumeValue) sfxVolumeValue.textContent = Math.round(state.settings.sfxVolume * 100) + '%';
    if (musicVolumeValue) musicVolumeValue.textContent = Math.round(state.settings.musicVolume * 100) + '%';
    if (difficultyValue) difficultyValue.textContent = currentDifficulty().label;
    if (loadAdvancedShipInput) loadAdvancedShipInput.checked = !!state.settings.loadAdvanced3DShipModel;
    if (lowEndModeInput) lowEndModeInput.checked = !!state.settings.lowEndMode;
    if (loadAdvancedShipInput) loadAdvancedShipInput.disabled = !!state.settings.lowEndMode;
    for (let i = 0; i < difficultyButtons.length; i++) {
      const btn = difficultyButtons[i];
      const idx = Number(btn.getAttribute('data-difficulty'));
      btn.setAttribute('aria-pressed', String(idx === state.settings.difficulty));
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

  function setAdvancedShipLoading(enabled) {
    if (state.settings.lowEndMode && enabled) return;
    state.settings.loadAdvanced3DShipModel = !!enabled;
    saveSettings();
    syncSettingsUi();
    const bridge = window.__ShotEmUp3D;
    if (bridge) {
      bridge.enabled = true;
      bridge.advancedModelEnabled = !!enabled;
      if (typeof bridge.reinitializeShip === 'function') bridge.reinitializeShip(!!enabled);
      else if (enabled && typeof bridge.loadAdvancedShipModel === 'function') bridge.loadAdvancedShipModel();
    }
    hint(enabled ? 'Advanced 3D ship model enabled.' : 'Advanced 3D ship model disabled.', 1.6);
  }

  function setLowEndMode(enabled) {
    state.settings.lowEndMode = !!enabled;
    if (state.settings.lowEndMode && state.settings.loadAdvanced3DShipModel) {
      state.settings.loadAdvanced3DShipModel = false;
      const bridge = window.__ShotEmUp3D;
      if (bridge) {
        bridge.enabled = true;
        bridge.advancedModelEnabled = false;
        if (typeof bridge.reinitializeShip === 'function') bridge.reinitializeShip(false);
      }
    }
    saveSettings();
    syncSettingsUi();
    const bridge = window.__ShotEmUp3D;
    if (bridge) bridge.lowEndMode = !!enabled;
    window.dispatchEvent(new Event('resize'));
    hint(enabled ? 'Low end mode enabled.' : 'Low end mode disabled.', 1.6);
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
    if (settingsDialog.open) closeSettings();
    else openSettings();
  }

  function playArea() {
    return { left: 18, right: view.w - 18, top: 68, bottom: view.h - view.controlsH - 18 };
  }

  function resize() {
    const w = Math.max(320, window.innerWidth);
    const h = Math.max(360, window.innerHeight);
    const dpr = Math.max(1, window.devicePixelRatio || 1);
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
  }

  function clearArray(a) { a.length = 0; }
  function mainTheme() { return state.currentTheme || THEMES[0]; }

  function resetSceneLayers() {
    clearArray(state.background);
    clearArray(state.foreground);
    destroyBitmapLayer(state.backgroundBitmap);
    destroyBitmapLayer(state.foregroundBitmap);
    state.backgroundBitmap = null;
    state.foregroundBitmap = null;
  }

  function themeScene(theme) {
    const t = theme || mainTheme();
    const name = (t.name || '').toLowerCase();
    const mood = (t.atmosphere || '').toLowerCase();
    if (t.scene) return t.scene;
    if (name.indexOf('thorium') >= 0 || mood === 'leaves') return 'orchard';
    if (name.indexOf('null swarm') >= 0 || mood === 'pollen') return 'meadow';
    if (name.indexOf('ion collapse') >= 0 || mood === 'sprinkles') return 'candy';
    if (name.indexOf('cold forge') >= 0 || name.indexOf('junkyard') >= 0 || mood === 'sparks') return 'junkyard';
    if (name.indexOf('deadlight fen') >= 0 || name.indexOf('fen') >= 0 || mood === 'motes') return 'marsh';
    if (name.indexOf('iron nest') >= 0) return 'hive';
    if (name.indexOf('shard expanse') >= 0 || mood === 'shards') return 'gorge';
    if (name.indexOf('cinder belt') >= 0) return 'volcano';
    if (name.indexOf('lunar grave') >= 0 || mood === 'stardust') return 'moonArcade';
    if (name.indexOf('neon fault') >= 0 || mood === 'neon') return 'boulevard';
    if (name.indexOf('black citadel') >= 0 || mood === 'chess') return 'citadel';
    if (name.indexOf('tempest bastion') >= 0 || mood === 'rain') return 'storm';
    if (name.indexOf('eclipse crown') >= 0 || mood === 'nova') return 'starcrown';
    return 'orchard';
  }

  function makeSceneItem(kind, opts) {
    const o = opts || {};
    return {
      kind: kind,
      style: o.style || '',
      x: Number.isFinite(o.x) ? o.x : 0,
      y: Number.isFinite(o.y) ? o.y : 0,
      baseX: Number.isFinite(o.baseX) ? o.baseX : (Number.isFinite(o.x) ? o.x : 0),
      baseY: Number.isFinite(o.baseY) ? o.baseY : (Number.isFinite(o.y) ? o.y : 0),
      w: Number.isFinite(o.w) ? o.w : 0,
      h: Number.isFinite(o.h) ? o.h : 0,
      scale: o.scale == null ? 1 : o.scale,
      layer: o.layer == null ? 0 : o.layer,
      speed: o.speed == null ? 0 : o.speed,
      sway: o.sway == null ? 0 : o.sway,
      swayRate: o.swayRate == null ? 0.45 : o.swayRate,
      phase: o.phase == null ? rand(0, TAU) : o.phase,
      rot: o.rot || 0,
      side: o.side == null ? 0 : o.side,
      color: o.color || '',
      color2: o.color2 || '',
      accent: o.accent || '',
      colors: Array.isArray(o.colors) ? o.colors.slice(0, 4) : [],
      fruit: Array.isArray(o.fruit) ? o.fruit.slice(0, 4) : [],
      windows: o.windows == null ? 0 : o.windows,
      wrapTop: Number.isFinite(o.wrapTop) ? o.wrapTop : -160,
      wrapBottom: Number.isFinite(o.wrapBottom) ? o.wrapBottom : view.h + 160
    };
  }

  function pushSceneItem(list, kind, opts) {
    const item = makeSceneItem(kind, opts);
    list.push(item);
    return item;
  }

  function buildScene(theme) {
    const t = theme || mainTheme();
    const scene = themeScene(t);
    const background = [];
    const foreground = [];
    const w = view.w;
    const h = view.h;
    const sky = t.skyBottom || '#0c1120';
    const glow = t.glow || t.accent2 || '#ffffff';
    const accent = t.accent || glow;
    const accent2 = t.accent2 || glow;
    const dim = Math.max(w, h);

    function addRow(kind, count, y, startX, endX, layer, speed, optsFn) {
      for (let i = 0; i < count; i++) {
        const t01 = count === 1 ? 0.5 : i / (count - 1);
        const o = optsFn ? optsFn(i, t01) : {};
        o.x = o.x == null ? lerp(startX, endX, t01) : o.x;
        o.y = o.y == null ? y : o.y;
        o.layer = o.layer == null ? layer + i : o.layer;
        o.speed = o.speed == null ? speed : o.speed;
        o.wrapTop = o.wrapTop == null ? -180 : o.wrapTop;
        o.wrapBottom = o.wrapBottom == null ? h + 180 : o.wrapBottom;
        pushSceneItem(background, kind, o);
      }
    }

    function addForegroundRow(kind, count, y, startX, endX, layer, speed, optsFn) {
      for (let i = 0; i < count; i++) {
        const t01 = count === 1 ? 0.5 : i / (count - 1);
        const o = optsFn ? optsFn(i, t01) : {};
        o.x = o.x == null ? lerp(startX, endX, t01) : o.x;
        o.y = o.y == null ? y : o.y;
        o.layer = o.layer == null ? layer + i : o.layer;
        o.speed = o.speed == null ? speed : o.speed;
        o.wrapTop = o.wrapTop == null ? -220 : o.wrapTop;
        o.wrapBottom = o.wrapBottom == null ? h + 220 : o.wrapBottom;
        pushSceneItem(foreground, kind, o);
      }
    }

    function addOrchardTrees(y0, y1, cols, rows, baseLayer) {
      for (let row = 0; row < rows; row++) {
        const y = lerp(y0, y1, rows === 1 ? 0.5 : row / (rows - 1));
        for (let col = 0; col < cols; col++) {
          const x = w * 0.09 + col * (w * 0.82 / Math.max(1, cols - 1)) + ((row & 1) ? w * 0.03 : 0);
          pushSceneItem(background, 'tree', {
            x: x,
            y: y + row * 8,
            scale: 0.72 + row * 0.08 + (col % 3) * 0.02,
            style: 'orchard',
            layer: baseLayer + row * 6 + col,
            speed: 7 + row * 2,
            sway: 4 + row,
            phase: (row * 0.7 + col * 0.33) % TAU,
            color: '#2f7a3d',
            color2: '#225f2f',
            accent: accent2,
            fruit: [accent2, '#ff7e67', '#ffb75f']
          });
        }
      }
    }

    function addSideBranches(count, layer, speed, style, color, color2) {
      for (let i = 0; i < count; i++) {
        const left = (i & 1) === 0;
        const y = h * (0.12 + i * 0.17);
        pushSceneItem(foreground, 'branch', {
          x: left ? -24 : w + 24,
          y: y,
          scale: 0.9 + i * 0.08,
          style: style,
          side: left ? -1 : 1,
          layer: layer + i * 2,
          speed: speed + i * 2,
          sway: 12 + i * 2,
          phase: i * 0.67,
          color: color,
          color2: color2,
          wrapTop: -220,
          wrapBottom: h + 220
        });
      }
    }

    function addTallGrass(count, layer, speed, color, color2) {
      const tint2 = color2 || color;
      for (let i = 0; i < count; i++) {
        pushSceneItem(foreground, 'branch', {
          x: lerp(w * 0.08, w * 0.92, count === 1 ? 0.5 : i / (count - 1)),
          y: h * 0.88 + (i % 2) * 10,
          scale: 0.8 + (i % 3) * 0.12,
          style: 'grass',
          side: (i & 1) ? 1 : -1,
          layer: layer + i,
          speed: speed + (i % 2) * 2,
          sway: 6 + (i % 3) * 1.5,
          phase: i * 0.9,
          color: color,
          color2: tint2,
          wrapTop: -120,
          wrapBottom: h + 180
        });
      }
    }

    switch (scene) {
      case 'meadow':
        pushSceneItem(background, 'hill', { x: w * 0.5, y: h * 0.66, w: dim * 1.2, h: h * 0.2, style: 'meadow', layer: -34, speed: 5, sway: 8, color: '#2f6f35', color2: '#4fa846' });
        pushSceneItem(background, 'hill', { x: w * 0.52, y: h * 0.80, w: dim * 1.35, h: h * 0.17, style: 'meadow', layer: -30, speed: 8, sway: 10, color: '#4f9d40', color2: '#82d95f' });
        addRow('tree', 5, h * 0.50, w * 0.12, w * 0.88, -24, 8, function (i) {
          return { scale: 0.62 + (i % 3) * 0.08, style: 'meadow', color: '#2f6e33', color2: '#5ebc59', accent: accent2, fruit: [accent2, '#fff5a8'] };
        });
        addRow('flower', 10, h * 0.74, w * 0.08, w * 0.92, -12, 10, function (i) {
          return { scale: 0.55 + (i % 3) * 0.1, style: 'field', color: accent2, color2: accent, accent: '#ffffff' };
        });
        addForegroundRow('branch', 5, h * 0.15, -30, w + 30, 42, 16, function (i, t01) {
          return { scale: 0.88 + (i % 2) * 0.08, style: 'grass', side: t01 < 0.5 ? -1 : 1, color: '#4d8c47', color2: '#7fd66d' };
        });
        break;
      case 'candy':
        pushSceneItem(background, 'hill', { x: w * 0.5, y: h * 0.66, w: dim * 1.22, h: h * 0.2, style: 'candy', layer: -34, speed: 4, sway: 6, color: '#8b4ca6', color2: '#ff9ed6' });
        pushSceneItem(background, 'cloud', { x: w * 0.22, y: h * 0.18, w: dim * 0.3, h: h * 0.16, style: 'fluff', layer: -28, speed: 3, sway: 6, color: '#fff0ff', color2: '#ffd5f0' });
        pushSceneItem(background, 'cloud', { x: w * 0.78, y: h * 0.2, w: dim * 0.28, h: h * 0.14, style: 'fluff', layer: -27, speed: 4, sway: 8, color: '#fff7fd', color2: '#ffcfef' });
        addRow('candy', 5, h * 0.55, w * 0.12, w * 0.88, -23, 8, function (i) {
          return { scale: 0.78 + (i % 2) * 0.12, style: i % 2 ? 'lollipop' : 'cane', color: ['#ff79b6', '#7cf7ff', '#ffd96a'][i % 3], color2: '#ffffff', accent: '#ffefb8' };
        });
        addForegroundRow('branch', 4, h * 0.12, -20, w + 20, 44, 18, function (i, t01) {
          return { scale: 0.95 + (i % 2) * 0.1, style: 'drip', side: t01 < 0.5 ? -1 : 1, color: '#ffbdde', color2: '#ffe5f3' };
        });
        break;
      case 'junkyard':
        pushSceneItem(background, 'hill', { x: w * 0.5, y: h * 0.70, w: dim * 1.25, h: h * 0.22, style: 'scrap', layer: -34, speed: 5, sway: 6, color: '#3a434d', color2: '#64707d' });
        pushSceneItem(background, 'building', { x: w * 0.16, y: h * 0.52, w: w * 0.16, h: h * 0.18, scale: 0.95, style: 'factory', layer: -24, speed: 7, sway: 5, color: '#6b5a4a', color2: '#a69b8f', windows: 4 });
        pushSceneItem(background, 'building', { x: w * 0.52, y: h * 0.47, w: w * 0.12, h: h * 0.24, scale: 1.0, style: 'factory', layer: -22, speed: 8, sway: 4, color: '#4f5b67', color2: '#9fb1c0', windows: 5 });
        pushSceneItem(background, 'building', { x: w * 0.82, y: h * 0.55, w: w * 0.15, h: h * 0.17, scale: 0.9, style: 'factory', layer: -20, speed: 9, sway: 5, color: '#75695c', color2: '#b7a78f', windows: 3 });
        addRow('gear', 4, h * 0.72, w * 0.12, w * 0.88, -18, 10, function (i) {
          return { scale: 0.72 + (i % 2) * 0.12, style: 'scrap', color: '#8f9aa5', color2: '#d2d8df', accent: '#6a7684' };
        });
        addForegroundRow('branch', 4, h * 0.16, -24, w + 24, 46, 18, function (i, t01) {
          return { scale: 0.9 + (i % 2) * 0.1, style: 'cable', side: t01 < 0.5 ? -1 : 1, color: '#61707d', color2: '#b7c3cd' };
        });
        break;
      case 'marsh':
        pushSceneItem(background, 'hill', { x: w * 0.5, y: h * 0.68, w: dim * 1.2, h: h * 0.18, style: 'water', layer: -34, speed: 4, sway: 5, color: '#1c4854', color2: '#2f7e73' });
        pushSceneItem(background, 'hill', { x: w * 0.52, y: h * 0.83, w: dim * 1.34, h: h * 0.16, style: 'water', layer: -30, speed: 7, sway: 6, color: '#3e6870', color2: '#5b8f84' });
        addRow('tree', 4, h * 0.50, w * 0.12, w * 0.88, -24, 7, function (i) {
          return { scale: 0.76 + (i % 2) * 0.1, style: 'marsh', color: '#274e37', color2: '#5b8758', accent: '#d7d2a2', fruit: ['#d7d2a2', '#7fe08c'] };
        });
        addRow('reed', 7, h * 0.72, w * 0.06, w * 0.94, -14, 12, function (i) {
          return { scale: 0.6 + (i % 3) * 0.1, style: 'marsh', color: '#6e9462', color2: '#99c08d', accent: '#ffd7a5' };
        });
        addForegroundRow('branch', 4, h * 0.1, -18, w + 18, 42, 18, function (i, t01) {
          return { scale: 0.92 + (i % 2) * 0.1, style: 'vine', side: t01 < 0.5 ? -1 : 1, color: '#4e7c58', color2: '#95b77d' };
        });
        break;
      case 'hive':
        pushSceneItem(background, 'hill', { x: w * 0.5, y: h * 0.67, w: dim * 1.18, h: h * 0.19, style: 'honey', layer: -34, speed: 4, sway: 5, color: '#69401a', color2: '#d88c22' });
        pushSceneItem(background, 'building', { x: w * 0.18, y: h * 0.50, w: w * 0.16, h: h * 0.2, scale: 0.95, style: 'hive', layer: -24, speed: 7, sway: 4, color: '#7a4b10', color2: '#ffcf59', windows: 3 });
        pushSceneItem(background, 'building', { x: w * 0.5, y: h * 0.46, w: w * 0.14, h: h * 0.24, scale: 1.0, style: 'hive', layer: -22, speed: 8, sway: 4, color: '#8c5614', color2: '#ffd66f', windows: 4 });
        pushSceneItem(background, 'building', { x: w * 0.82, y: h * 0.53, w: w * 0.14, h: h * 0.18, scale: 0.92, style: 'hive', layer: -20, speed: 8, sway: 4, color: '#6f4310', color2: '#ffc84c', windows: 3 });
        addRow('cloud', 3, h * 0.16, w * 0.12, w * 0.88, -28, 4, function (i) {
          return { scale: 0.7 + (i % 2) * 0.08, style: 'smoke', color: '#ffe6a5', color2: '#ffca5b' };
        });
        addForegroundRow('branch', 4, h * 0.14, -20, w + 20, 44, 20, function (i, t01) {
          return { scale: 0.9 + (i % 2) * 0.08, style: 'wax', side: t01 < 0.5 ? -1 : 1, color: '#ffd36a', color2: '#fff0bf' };
        });
        break;
      case 'gorge':
        pushSceneItem(background, 'hill', { x: w * 0.5, y: h * 0.66, w: dim * 1.2, h: h * 0.2, style: 'rock', layer: -34, speed: 4, sway: 4, color: '#1d2440', color2: '#4d5b83' });
        pushSceneItem(background, 'hill', { x: w * 0.52, y: h * 0.82, w: dim * 1.35, h: h * 0.16, style: 'rock', layer: -30, speed: 6, sway: 5, color: '#3c4a67', color2: '#6f7ba0' });
        addRow('crystal', 4, h * 0.52, w * 0.12, w * 0.88, -24, 7, function (i) {
          return { scale: 0.82 + (i % 2) * 0.12, style: 'gorge', color: ['#79f6ff', '#a4b7ff', '#d9f1ff', '#7ee3ff'][i % 4], color2: accent2, accent: glow };
        });
        pushSceneItem(background, 'arch', { x: w * 0.5, y: h * 0.58, w: w * 0.38, h: h * 0.14, scale: 1, style: 'bridge', layer: -18, speed: 8, sway: 4, color: '#677291', color2: '#c6d2ff' });
        addForegroundRow('branch', 3, h * 0.1, -18, w + 18, 42, 16, function (i, t01) {
          return { scale: 0.92 + (i % 2) * 0.08, style: 'shard', side: t01 < 0.5 ? -1 : 1, color: '#9ef8ff', color2: '#f1e7ff' };
        });
        break;
      case 'volcano':
        pushSceneItem(background, 'hill', { x: w * 0.5, y: h * 0.66, w: dim * 1.22, h: h * 0.2, style: 'lava', layer: -34, speed: 4, sway: 5, color: '#5d2118', color2: '#ff5a2c' });
        pushSceneItem(background, 'building', { x: w * 0.22, y: h * 0.52, w: w * 0.14, h: h * 0.2, scale: 0.95, style: 'kitchen', layer: -24, speed: 7, sway: 3, color: '#5b4a43', color2: '#ffc05f', windows: 3 });
        pushSceneItem(background, 'building', { x: w * 0.52, y: h * 0.47, w: w * 0.15, h: h * 0.24, scale: 1.0, style: 'kitchen', layer: -22, speed: 8, sway: 3, color: '#6e4d41', color2: '#ffd06b', windows: 4 });
        pushSceneItem(background, 'building', { x: w * 0.82, y: h * 0.56, w: w * 0.15, h: h * 0.17, scale: 0.92, style: 'kitchen', layer: -20, speed: 9, sway: 3, color: '#754835', color2: '#ffd88a', windows: 3 });
        addRow('cloud', 4, h * 0.16, w * 0.12, w * 0.88, -28, 4, function (i) {
          return { scale: 0.72 + (i % 2) * 0.08, style: 'steam', color: '#fff1d0', color2: '#ffb04f' };
        });
        addForegroundRow('branch', 4, h * 0.1, -20, w + 20, 44, 20, function (i, t01) {
          return { scale: 0.92 + (i % 2) * 0.08, style: 'steam', side: t01 < 0.5 ? -1 : 1, color: '#ffd1a5', color2: '#fff1d6' };
        });
        break;
      case 'moonArcade':
        pushSceneItem(background, 'hill', { x: w * 0.5, y: h * 0.68, w: dim * 1.18, h: h * 0.2, style: 'city', layer: -34, speed: 4, sway: 4, color: '#17243f', color2: '#314c78' });
        pushSceneItem(background, 'building', { x: w * 0.15, y: h * 0.50, w: w * 0.16, h: h * 0.22, scale: 0.95, style: 'arcade', layer: -24, speed: 7, sway: 4, color: '#24345c', color2: '#7cf7ff', windows: 5 });
        pushSceneItem(background, 'building', { x: w * 0.46, y: h * 0.45, w: w * 0.16, h: h * 0.26, scale: 1.0, style: 'arcade', layer: -22, speed: 8, sway: 4, color: '#1d2b50', color2: '#ff7bee', windows: 6 });
        pushSceneItem(background, 'building', { x: w * 0.79, y: h * 0.54, w: w * 0.15, h: h * 0.18, scale: 0.92, style: 'arcade', layer: -20, speed: 9, sway: 4, color: '#24325b', color2: '#cfd8ff', windows: 4 });
        addRow('cloud', 3, h * 0.16, w * 0.16, w * 0.84, -28, 3, function (i) {
          return { scale: 0.68 + (i % 2) * 0.06, style: 'night', color: '#d9e4ff', color2: '#7cf7ff' };
        });
        addForegroundRow('branch', 4, h * 0.12, -18, w + 18, 44, 18, function (i, t01) {
          return { scale: 0.9 + (i % 2) * 0.08, style: 'cable', side: t01 < 0.5 ? -1 : 1, color: '#7cf7ff', color2: '#ff7bee' };
        });
        break;
      case 'boulevard':
        pushSceneItem(background, 'hill', { x: w * 0.5, y: h * 0.70, w: dim * 1.18, h: h * 0.18, style: 'street', layer: -34, speed: 4, sway: 4, color: '#171c38', color2: '#3d2a76' });
        pushSceneItem(background, 'building', { x: w * 0.15, y: h * 0.48, w: w * 0.17, h: h * 0.24, scale: 0.95, style: 'city', layer: -24, speed: 7, sway: 4, color: '#201f43', color2: '#63f3ff', windows: 5 });
        pushSceneItem(background, 'building', { x: w * 0.5, y: h * 0.44, w: w * 0.18, h: h * 0.28, scale: 1.0, style: 'city', layer: -22, speed: 8, sway: 4, color: '#271e57', color2: '#ff7bee', windows: 6 });
        pushSceneItem(background, 'building', { x: w * 0.82, y: h * 0.53, w: w * 0.16, h: h * 0.2, scale: 0.92, style: 'city', layer: -20, speed: 9, sway: 4, color: '#1b234f', color2: '#ffd56a', windows: 4 });
        addRow('cloud', 2, h * 0.14, w * 0.18, w * 0.82, -28, 3, function (i) {
          return { scale: 0.64 + (i % 2) * 0.08, style: 'night', color: '#dbe9ff', color2: '#ff7bee' };
        });
        addForegroundRow('branch', 4, h * 0.12, -18, w + 18, 44, 20, function (i, t01) {
          return { scale: 0.88 + (i % 2) * 0.08, style: 'cable', side: t01 < 0.5 ? -1 : 1, color: '#63f3ff', color2: '#ff7bee' };
        });
        break;
      case 'citadel':
        pushSceneItem(background, 'hill', { x: w * 0.5, y: h * 0.67, w: dim * 1.2, h: h * 0.19, style: 'stone', layer: -34, speed: 4, sway: 4, color: '#323241', color2: '#5e5a73' });
        pushSceneItem(background, 'wall', { x: w * 0.17, y: h * 0.52, w: w * 0.22, h: h * 0.2, scale: 0.95, style: 'citadel', layer: -24, speed: 7, sway: 3, color: '#4f4f63', color2: '#d8d8e8' });
        pushSceneItem(background, 'wall', { x: w * 0.5, y: h * 0.48, w: w * 0.26, h: h * 0.24, scale: 1.0, style: 'citadel', layer: -22, speed: 8, sway: 3, color: '#56546e', color2: '#f0f0ff' });
        pushSceneItem(background, 'wall', { x: w * 0.82, y: h * 0.56, w: w * 0.2, h: h * 0.18, scale: 0.92, style: 'citadel', layer: -20, speed: 9, sway: 3, color: '#4b4a60', color2: '#d8d8e8' });
        addRow('cloud', 3, h * 0.14, w * 0.15, w * 0.85, -28, 3, function (i) {
          return { scale: 0.68 + (i % 2) * 0.06, style: 'mist', color: '#eef0ff', color2: '#bca46b' };
        });
        addForegroundRow('branch', 4, h * 0.1, -18, w + 18, 44, 18, function (i, t01) {
          return { scale: 0.88 + (i % 2) * 0.08, style: 'battlement', side: t01 < 0.5 ? -1 : 1, color: '#d8d8e8', color2: '#bca46b' };
        });
        break;
      case 'storm':
        pushSceneItem(background, 'hill', { x: w * 0.5, y: h * 0.66, w: dim * 1.2, h: h * 0.18, style: 'stone', layer: -34, speed: 4, sway: 4, color: '#203243', color2: '#4d6eff' });
        pushSceneItem(background, 'wall', { x: w * 0.18, y: h * 0.53, w: w * 0.2, h: h * 0.2, scale: 0.95, style: 'storm', layer: -24, speed: 7, sway: 3, color: '#32495d', color2: '#8ecbff' });
        pushSceneItem(background, 'wall', { x: w * 0.52, y: h * 0.49, w: w * 0.24, h: h * 0.24, scale: 1.0, style: 'storm', layer: -22, speed: 8, sway: 3, color: '#39556d', color2: '#d0f3ff' });
        pushSceneItem(background, 'wall', { x: w * 0.82, y: h * 0.56, w: w * 0.18, h: h * 0.18, scale: 0.92, style: 'storm', layer: -20, speed: 9, sway: 3, color: '#2c4254', color2: '#8ecbff' });
        addRow('cloud', 4, h * 0.14, w * 0.1, w * 0.9, -28, 3, function (i) {
          return { scale: 0.72 + (i % 2) * 0.08, style: 'storm', color: '#d9f3ff', color2: '#8ecbff' };
        });
        addForegroundRow('branch', 4, h * 0.1, -18, w + 18, 44, 22, function (i, t01) {
          return { scale: 0.9 + (i % 2) * 0.08, style: 'rain', side: t01 < 0.5 ? -1 : 1, color: '#9fd1ff', color2: '#d0f3ff' };
        });
        break;
      case 'starcrown':
        pushSceneItem(background, 'hill', { x: w * 0.5, y: h * 0.66, w: dim * 1.18, h: h * 0.18, style: 'sky', layer: -34, speed: 4, sway: 4, color: '#201133', color2: '#6c4da8' });
        pushSceneItem(background, 'pillar', { x: w * 0.2, y: h * 0.5, w: w * 0.14, h: h * 0.24, scale: 0.95, style: 'crown', layer: -24, speed: 7, sway: 3, color: '#7d6aa8', color2: '#ffe78a' });
        pushSceneItem(background, 'pillar', { x: w * 0.5, y: h * 0.46, w: w * 0.18, h: h * 0.28, scale: 1.0, style: 'crown', layer: -22, speed: 8, sway: 3, color: '#8d79ba', color2: '#ffffff' });
        pushSceneItem(background, 'pillar', { x: w * 0.8, y: h * 0.53, w: w * 0.14, h: h * 0.2, scale: 0.92, style: 'crown', layer: -20, speed: 9, sway: 3, color: '#7d6aa8', color2: '#ffe78a' });
        addRow('cloud', 3, h * 0.14, w * 0.16, w * 0.84, -28, 3, function (i) {
          return { scale: 0.66 + (i % 2) * 0.08, style: 'halo', color: '#ffe78a', color2: '#ffffff' };
        });
        addForegroundRow('branch', 4, h * 0.1, -18, w + 18, 44, 18, function (i, t01) {
          return { scale: 0.88 + (i % 2) * 0.08, style: 'filigree', side: t01 < 0.5 ? -1 : 1, color: '#ffe78a', color2: '#ffffff' };
        });
        break;
      case 'orchard':
      default:
        pushSceneItem(background, 'hill', { x: w * 0.5, y: h * 0.66, w: dim * 1.22, h: h * 0.2, style: 'orchard', layer: -34, speed: 5, sway: 6, color: '#2c5f2f', color2: '#4c8a36' });
        pushSceneItem(background, 'hill', { x: w * 0.52, y: h * 0.82, w: dim * 1.35, h: h * 0.16, style: 'orchard', layer: -30, speed: 8, sway: 8, color: '#4d8231', color2: '#79b54a' });
        addOrchardTrees(h * 0.48, h * 0.64, 4, 3, -24);
        pushSceneItem(background, 'building', { x: w * 0.18, y: h * 0.55, w: w * 0.16, h: h * 0.16, scale: 0.9, style: 'barn', layer: -18, speed: 8, sway: 3, color: '#7f5032', color2: '#ffd06b', windows: 2 });
        addSideBranches(4, 42, 18, 'orchard', '#6a4a2f', '#9bcf5b');
        addTallGrass(6, 46, 20, '#5e9e43');
        break;
    }

    return { background: background, foreground: foreground, sky: sky };
  }

  function regenBackground(theme, opts) {
    state.backgroundBitmap = null;
    state.foregroundBitmap = null;
    clearArray(state.background);
    clearArray(state.foreground);
    state.backgroundSeed = 0;
    state.foregroundSeed = 0;
    state.starfield = [];
    state.starfieldScroll = 0;
  }

  function ensureStarfield() {
    const lowEnd = !!state.settings.lowEndMode;
    if (lowEnd) {
      state.starfield = [];
      return;
    }
    const desired = lowEnd
      ? Math.max(240, Math.min(520, Math.round((view.w * view.h) / 5200)))
      : Math.max(480, Math.min(880, Math.round((view.w * view.h) / 3000)));
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
  }

  function drawStarfield() {
    drawSpriteRect(view.w * 0.5, view.h * 0.5, view.w, view.h, '#02040a', 1, -120, false);
    if (state.settings.lowEndMode) return;
    ensureStarfield();
    state.starfieldScroll += 0.012;
    const lowEnd = !!state.settings.lowEndMode;
    for (const star of state.starfield) {
      const y = (star.y + state.starfieldScroll * star.speed) % 1.08;
      const px = star.x * view.w;
      const py = y * view.h;
      const tw = 0.7 + Math.sin(state.levelClock * 2.1 + star.tw) * 0.3;
      const alpha = clamp(star.a * tw * (lowEnd ? 0.58 : 0.75), 0.06, 1);
      const size = star.r * (star.tint > 0.86 ? 1.35 : 1) * (lowEnd ? 0.88 : 1);
      const color = star.tint < 0.64 ? '#ffffff' : (star.tint < 0.84 ? '#dfefff' : '#f2e3a8');
      drawGlowCircle(px, py, size, color, alpha, size * (lowEnd ? 1.05 : 1.4));
      if (!lowEnd && size > 1.25) drawSpriteRect(px, py, size * 0.6, size * 2.1, color, alpha * 0.35, -119, true);
    }
  }

  function setupDebugScene() {
    const theme = THEMES[0] || THEMES[1];
    state.currentTheme = theme;
    state.levelIndex = 0;
    state.mode = 'debug';
    state.paused = false;
    state.banner = 'DEBUG SCENE';
    state.bannerSub = 'Patched sector enemies and boss for command verification.';
    state.bannerTimer = 0;
    state.shake = 0;
    state.flash = 0;
    state.transition = null;
    clearArray(state.enemies);
    clearArray(state.bullets);
    clearArray(state.enemyBullets);
    clearArray(state.pickups);
    clearArray(state.particles);
    state.boss = null;
    regenBackground(theme);
    const spec = [
      ['drifter', view.w * 0.18, view.h * 0.28],
      ['zigzag', view.w * 0.36, view.h * 0.22],
      ['swarm', view.w * 0.56, view.h * 0.30],
      ['bomber', view.w * 0.76, view.h * 0.24],
      ['sniper', view.w * 0.24, view.h * 0.50],
      ['spinner', view.w * 0.48, view.h * 0.50],
      ['splitter', view.w * 0.70, view.h * 0.52],
      ['diver', view.w * 0.86, view.h * 0.50],
      ['mine', view.w * 0.58, view.h * 0.72],
      ['elite', view.w * 0.82, view.h * 0.72]
    ];
    for (let i = 0; i < spec.length; i++) {
      const item = spec[i];
      state.enemies.push({
        kind: item[0],
        theme: theme,
        x: item[1],
        y: item[2],
        vx: 0,
        vy: 0,
        hp: 6,
        maxHp: 6,
        r: ENEMIES[item[0]] ? ENEMIES[item[0]].r : 18,
        score: 0,
        emoji: theme.icons[i % theme.icons.length] || pick(theme.icons),
        fireCooldown: 999,
        age: 0,
        wobble: i * 0.73,
        dir: 1,
        shotSeed: i * 0.51,
        elite: item[0] === 'elite',
        dead: false,
        hitFlash: 0
      });
    }
    state.boss = {
      theme: theme,
      name: theme.boss.name,
      emoji: theme.boss.emoji,
      color: theme.boss.color,
      x: view.w * 0.5,
      y: 132,
      vx: 0,
      vy: 0,
      r: 64,
      hp: theme.boss.hp,
      maxHp: theme.boss.hp,
      phases: theme.boss.phases,
      phaseIndex: 0,
      phaseClock: 0,
      age: 0,
      fireClock: 999,
      motionClock: 0,
      state: {},
      hitFlash: 0,
      dead: false
    };
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
    state.nextLevelTimer = 0;
    state.waveClock = 0;
    state.waveIndex = 0;
    state.levelClock = 0;
    state.transition = null;
    clearArray(state.enemies);
    clearArray(state.bullets);
    clearArray(state.enemyBullets);
    clearArray(state.pickups);
    clearArray(state.particles);
    state.boss = null;
    state.levelIndex = 0;
    state.currentTheme = THEMES[0];
    resetPlayer();
    regenBackground(state.currentTheme);
    state.mode = 'title';
    state.paused = false;
    state.musicClock = 0;
    state.musicStep = 0;
    state.pointerActive = false;
    state.pointerId = null;
    state.pointerX = 0;
    state.pointerY = 0;
    state.input.left = false;
    state.input.right = false;
    state.input.up = false;
    state.input.down = false;
    state.input.fire = false;
    if (state.debugMode) {
      setupDebugScene();
    } else {
      state.mode = 'title';
      setBanner('THORIUM GAP', 'Click or press Space to launch.', 3.5);
      hint('Drag to fly. Hold to fire. Open SETTINGS for audio and combat settings.', 5);
    }
    syncSettingsUi();
  }

  function saveBest() {
    if (state.score > state.highScore) {
      state.highScore = state.score;
      saveNum('ShotEmUp_JS_highScore', state.highScore);
    }
  }

  function startGame() {
    closeSettings();
    resetRun();
    if (state.debugMode) return;
    state.mode = 'playing';
    beginLevel(0);
  }

  function beginLevel(index) {
    state.levelIndex = index;
    state.currentTheme = THEMES[index];
    warmEnemyShipBatch(index + 1);
    if (index + 1 > ENEMY_SHIP_FALLBACK_BATCHES) warmEnemyShipBatch(((index + 1 - 1) % ENEMY_SHIP_FALLBACK_BATCHES) + 1);
    warmBossArt(index + 1);
    clearArray(state.enemies);
    clearArray(state.bullets);
    clearArray(state.enemyBullets);
    clearArray(state.pickups);
    state.boss = null;
    state.waveClock = 0;
    state.waveIndex = 0;
    state.levelClock = 0;
    state.transition = null;
    regenBackground(state.currentTheme);
    if (index === 0) {
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
  }

  function victory() {
    state.mode = 'victory';
    state.banner = 'VICTORY';
    state.bannerSub = 'The sky is yours.';
    state.bannerTimer = 999;
    state.flash = 0.6;
    state.shake = 18;
    sfx('clear');
    hint('Signal clear. Click or press R to launch again.', 6);
    saveBest();
  }

  function gameOver() {
    state.mode = 'gameover';
    state.banner = 'GAME OVER';
    state.bannerSub = 'The void has taken the ship.';
    state.bannerTimer = 999;
    state.flash = 0.25;
    state.shake = 18;
    hint('Run failed. Click or press R to relaunch.', 6);
    saveBest();
  }

  function addScore(points) {
    const comboBonus = 1 + Math.floor(state.combo / 5);
    const od = state.overdrive > 0 ? 2 : 1;
    state.score += Math.round(points * comboBonus * od);
    if (state.score > state.highScore) {
      state.highScore = state.score;
      saveNum('ShotEmUp_JS_highScore', state.highScore);
    }
  }

  function spawnParticle(x, y, vx, vy, life, size, color, kind) {
    state.particles.push({ x: x, y: y, vx: vx, vy: vy, life: life, maxLife: life, size: size, color: color, kind: kind || 'spark', rot: rand(0, TAU) });
  }

  function burst(x, y, color, count, speed, size, kind) {
    for (let i = 0; i < count; i++) {
      const a = rand(0, TAU);
      const s = rand(speed * 0.4, speed);
      spawnParticle(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.24, 0.72), rand(size * 0.5, size), color, kind);
    }
  }

  function flashBurst(x, y, color) {
    burst(x, y, color, 18, 180, 6, 'spark');
    spawnParticle(x, y, 0, 0, 0.24, 14, color, 'ring');
  }

  function shipDeathBurst(x, y) {
    state.flash = Math.max(state.flash, 0.48);
    state.shake = Math.max(state.shake, 18);
    sfx('bomb');
    burst(x, y, '#fff0b5', 42, 280, 8, 'spark');
    burst(x, y, '#ffd96a', 18, 240, 6, 'spark');
    flashBurst(x, y, '#fff9d9');
    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
      const b = state.enemyBullets[i];
      burst(b.x, b.y, '#ffe39a', 4, 120, 4, 'spark');
      state.enemyBullets.splice(i, 1);
    }
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
    p.fireHeld = false;
    p.pointerMode = false;
  }

  function spawnBullet(team, x, y, vx, vy, opts) {
    const diff = currentDifficulty();
    const isEnemy = team !== 'player';
    const speedScale = isEnemy ? diff.bulletSpeed : 1;
    const damageScale = isEnemy ? diff.contact : 1;
    state[team === 'player' ? 'bullets' : 'enemyBullets'].push({
      team: team, x: x, y: y, vx: vx * speedScale, vy: vy * speedScale, ax: opts && opts.ax ? opts.ax * speedScale : 0, ay: opts && opts.ay ? opts.ay * speedScale : 0,
      r: opts && opts.r ? opts.r : (team === 'player' ? 6 : 7), color: opts && opts.color ? opts.color : (team === 'player' ? '#d9fcff' : '#ff765d'),
      life: opts && opts.life ? opts.life : 5.5, damage: (opts && opts.damage ? opts.damage : 1) * damageScale, kind: opts && opts.kind ? opts.kind : 'orb',
      pierce: opts && opts.pierce != null ? opts.pierce : 0, homing: opts && opts.homing ? opts.homing : 0, turn: opts && opts.turn ? opts.turn : 0,
      age: 0, wobble: opts && opts.wobble ? opts.wobble : 0, alive: true
    });
  }

  function spawnPickup(type, x, y, opts) {
    const info = PICKUPS[type];
    if (!info) return;
    const weaponMode = opts && opts.weaponMode != null ? opts.weaponMode : 0;
    const color = type === 'weapon' ? WEAPONS[weaponMode].color : info.color;
    state.pickups.push({
      type: type, x: x, y: y, vx: opts && opts.vx != null ? opts.vx : rand(-12, 12), vy: opts && opts.vy != null ? opts.vy : rand(36, 58),
      r: 18, life: 12, color: color, emoji: info.emoji, bob: rand(0, TAU), spin: rand(0, TAU),
      weaponMode: weaponMode,
      weaponTier: 1
    });
  }

  function choosePickup() {
    const levelNumber = state.levelIndex + 1;
    const weaponWeight = weaponPickupWeight(levelNumber);
    const list = [
      { type: 'weapon', w: weaponWeight },
      { type: 'rapid', w: state.player.rapidTimer > 4 ? 1 : 4 },
      { type: 'shield', w: state.player.shield < 2 ? 5 : 2 },
      { type: 'bomb', w: state.player.bombs < 2 ? 5 : 2 },
      { type: 'magnet', w: state.player.magnetTimer < 4 ? 4 : 1 },
      { type: 'score', w: 3 }
    ];
    const total = list.reduce(function (sum, item) { return sum + item.w; }, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < list.length; i++) { roll -= list[i].w; if (roll <= 0) return list[i].type; }
    return 'score';
  }

  function weaponPickupWeight(levelNumber) {
    const base = 8;
    const n = clamp(levelNumber | 0, 1, THEMES.length);
    const factors = {
      1: 5.0,
      2: 4.0,
      3: 3.0,
      4: 2.0,
      5: 1.0,
      6: 0.9,
      7: 0.8,
      8: 0.7,
      9: 0.6,
      10: 0.4,
      11: 0.3,
      12: 0.2,
      13: 0.1
    };
    const factor = factors[n] != null ? factors[n] : 0.1;
    return base * factor;
  }

  function chooseWeaponMode(currentMode) {
    if (Number.isFinite(currentMode) && Math.random() < 0.5) return clamp(currentMode | 0, 0, WEAPONS.length - 1);
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
    const p = elite ? 0.72 : 0.16 + state.levelIndex * 0.01;
    if (forceType || Math.random() < p) {
      const type = forceType || choosePickup();
      if (type === 'weapon') spawnPickup('weapon', x, y, { weaponMode: chooseWeaponMode(state.player.weaponMode) });
      else spawnPickup(type, x, y);
    }
  }

  function spawnEnemy(kind, x, y, opts) {
    const t = state.currentTheme;
    const d = ENEMIES[kind] || ENEMIES.drifter;
    const scale = 1 + state.levelIndex * 0.08;
    const diff = currentDifficulty();
    const speedScale = diff.enemySpeed;
    const fireScale = SHOT_PACE / diff.spawnRate;
    const levelNumber = state.levelIndex + 1;
    const shipIndex = opts && opts.shipIndex != null ? opts.shipIndex : randi(0, ENEMY_SHIP_COLUMNS - 1);
    const shipSize = getEnemyShipRenderSize(levelNumber, shipIndex);
    const sizeScale = shipSize / 64;
    const hpScale = scale * diff.enemyHp * sizeScale;
    const baseHp = opts && opts.hp != null ? opts.hp : d.hp;
    const e = {
      kind: kind, theme: t, x: x, y: y,
      vx: (opts && opts.vx != null ? opts.vx : rand(-18, 18)) * speedScale,
      vy: (opts && opts.vy != null ? opts.vy : d.speed * scale) * speedScale,
      hp: Math.max(1, Math.round(baseHp * hpScale)),
      maxHp: Math.max(1, Math.round(baseHp * hpScale)),
      r: Math.max(12, Math.round(shipSize * 0.35)), score: Math.round((opts && opts.score != null ? opts.score : d.score) * scale),
      emoji: pick(t.icons), fireCooldown: rand(0.8, 1.8) * fireScale, age: 0, wobble: rand(0, TAU), dir: chance(0.5) ? 1 : -1,
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
    sfx('spawn');
    return e;
  }

  function spawnBoss(theme) {
    const b = theme.boss;
    const diff = currentDifficulty();
    state.boss = {
      theme: theme, name: b.name, emoji: b.emoji, color: b.color,
      x: view.w * 0.5, y: 128, vx: 0, vy: 0, r: 64,
      hp: Math.round(b.hp * (1 + state.levelIndex * 0.04) * diff.bossHp),
      maxHp: Math.round(b.hp * (1 + state.levelIndex * 0.04) * diff.bossHp),
      phases: b.phases, phaseIndex: 0, phaseClock: 0, age: 0,
      fireClock: 0, motionClock: 0, state: {}, hitFlash: 0, dead: false,
      shipLevel: state.levelIndex + 1, shipIndex: 0, facingRight: false
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
      case 'zigzag': return { routeShift: 2, swirl: 0.75, bend: 0.9, turns: 0.15, duration: 4.2, settleY: 0.98 };
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
    const count = clamp(Math.round((2 + Math.floor(state.levelIndex / 2) + randi(0, 2)) * diff.spawnCount), 2, 9);
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
    const base = [0.16, 0.17, 0.2, 0.26, 0.2][p.weaponMode] || 0.2;
    let d = base - (p.weaponTier - 1) * 0.012;
    if (p.rapidTimer > 0) d *= 0.54;
    if (state.overdrive > 0) d *= 0.76;
    return clamp(d * SHOT_PACE, 0.05, 0.42);
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
      const shots = tier >= 5 ? 7 : tier >= 4 ? 6 : tier >= 3 ? 5 : tier >= 2 ? 4 : 3;
      for (let i = 0; i < shots; i++) { const t = shots === 1 ? 0.5 : i / (shots - 1), a = lerp(-spread, spread, t) - Math.PI * 0.5; spawnBullet('player', x + Math.cos(a) * 2, y + Math.sin(a) * 2, Math.cos(a) * 804, Math.sin(a) * 804, { r: 6, color: color, damage: dmg, kind: 'fan', life: 3.5 }); }
      sfx('fan');
    } else if (mode === 3) { // ROCKET
      if (tier <= 1) {
        spawnBullet('player', x - 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/2, kind: 'rocket', pierce: 1, life: 4.6, homing: 0.4, turn: 4.5 });
        spawnBullet('player', x + 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/2, kind: 'rocket', pierce: 1, life: 4.6, homing: 0.48, turn: 4.3 });
      } else if (tier === 2) {
        spawnBullet('player', x - 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/3, kind: 'rocket', pierce: 1, life: 4.6, homing: 0.35, turn: 4.2 });
        spawnBullet('player', x,      y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/3, kind: 'rocket', pierce: 1, life: 4.6, homing: 0.35, turn: 4.2 });
        spawnBullet('player', x + 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/3, kind: 'rocket', pierce: 1, life: 4.6, homing: 0.48, turn: 4.3 });
      } else if (tier === 3) {
        spawnBullet('player', x - 20, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/4, kind: 'rocket', pierce: 1, life: 4.6, homing: 0.48, turn: 4.3 });
        spawnBullet('player', x - 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/4, kind: 'rocket', pierce: 1, life: 4.5, homing: 0.42, turn: 4.3 });
        spawnBullet('player', x + 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/4, kind: 'rocket', pierce: 1, life: 4.5, homing: 0.42, turn: 4.3 });
        spawnBullet('player', x + 20, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/4, kind: 'rocket', pierce: 1, life: 4.6, homing: 0.50, turn: 4.4 });
      } else if (tier === 4) {
        spawnBullet('player', x - 20, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/5, kind: 'rocket', pierce: 1, life: 4.4, homing: 0.22, turn: 4.0 });
        spawnBullet('player', x - 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/5, kind: 'rocket', pierce: 1, life: 4.5, homing: 0.50, turn: 4.3 });
        spawnBullet('player', x ,     y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/5, kind: 'rocket', pierce: 1, life: 4.5, homing: 0.50, turn: 4.3 });
        spawnBullet('player', x + 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/5, kind: 'rocket', pierce: 1, life: 4.4, homing: 0.22, turn: 4.0 });
        spawnBullet('player', x + 20, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/5, kind: 'rocket', pierce: 1, life: 4.5, homing: 0.52, turn: 4.4 });
      } else {
        spawnBullet('player', x - 20, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/6, kind: 'rocket', pierce: 1, life: 4.4, homing: 0.22, turn: 4.0 });
        spawnBullet('player', x - 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/6, kind: 'rocket', pierce: 1, life: 4.5, homing: 0.50, turn: 4.3 });
        spawnBullet('player', x - 5,  y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/6, kind: 'rocket', pierce: 1, life: 4.5, homing: 0.52, turn: 4.4 });
        spawnBullet('player', x + 5,  y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/6, kind: 'rocket', pierce: 1, life: 4.5, homing: 0.50, turn: 4.3 });
        spawnBullet('player', x + 10, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/6, kind: 'rocket', pierce: 1, life: 4.4, homing: 0.22, turn: 4.0 });
        spawnBullet('player', x + 20, y - 10, rand(-60,60), rand(-600,-700), { r: 8, color: color, damage: dmg*2/6, kind: 'rocket', pierce: 1, life: 4.3, homing: 0.18, turn: 4.0 });
      }
      sfx('rocket');
    } else { // BEAM
      const beamY = y+10;
      const beamSpacing = 5;
      if (tier === 1) {
        spawnBullet('player', x - beamSpacing,     beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x,                   beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x + beamSpacing,     beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
      }
      if (tier === 2) {
        spawnBullet('player', x - beamSpacing*3/2, beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x - beamSpacing*1/2,  beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x + beamSpacing*1/2, beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x + beamSpacing*3/2, beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });

      }
      if (tier === 3) {
        spawnBullet('player', x - beamSpacing*2, beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x - beamSpacing,   beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x,                 beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x + beamSpacing,   beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x + beamSpacing*2, beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
      }
      if (tier === 4) {
        spawnBullet('player', x - beamSpacing*5/2, beamY-25, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x - beamSpacing*3/2, beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x - beamSpacing*1/2, beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x + beamSpacing*1/2, beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x + beamSpacing*3/2, beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x + beamSpacing*5*2, beamY-25, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
      }
      if (tier >= 5) {
        spawnBullet('player', x - beamSpacing*7/2, beamY-20, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x - beamSpacing*5/2, beamY-25, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x - beamSpacing*3/2, beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x - beamSpacing*1/2, beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x + beamSpacing*1/2, beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x + beamSpacing*3/2, beamY-30, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x + beamSpacing*5/2, beamY-25, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
        spawnBullet('player', x + beamSpacing*7/2, beamY-20, 0, -1120, { r: 6, color: color, damage: dmg, kind: 'beam', pierce: 3 + tier, life: 5.0 });
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
  }

  function findRocketTarget(b) {
    const p = state.player;
    const originX = p.x;
    const originY = p.y - 18;
    const maxAngle = lerp(0.26, 0.78, clamp(b.homing || 0, 0, 1));
    let best = null;
    let bestScore = Infinity;

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

    for (let i = 0; i < state.enemies.length; i++) {
      const e = state.enemies[i];
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
    } else if (type === 'rapid') {
      p.rapidTimer = Math.max(p.rapidTimer, 8);
      state.banner = 'RAPID FIRE';
      state.bannerSub = 'The weapons rattles harder.';
    } else if (type === 'shield') {
      if (p.shield >= 3) {
        addScore(250);
        state.banner = 'EXTRA SHIELD';
        state.bannerSub = 'Overflow converted to score.';
      } else {
        p.shield = Math.min(3, p.shield + 1);
        state.banner = 'SHIELD UP';
        state.bannerSub = 'A bright hull wraps around the ship.';
        sfx('power');
      }
    } else if (type === 'bomb') {
      if (p.bombs >= 4) {
        addScore(250);
        state.banner = 'EXTRA BOMB';
        state.bannerSub = 'Overflow converted to score.';
        sfx('power');
      } else {
        p.bombs = Math.min(4, p.bombs + 1);
        state.banner = 'BOMB +1';
        state.bannerSub = 'Emergency button restocked.';
        sfx('power');
      }
    } else if (type === 'magnet') {
      p.magnetTimer = Math.max(p.magnetTimer, 12);
      state.banner = 'MAGNET FIELD';
      state.bannerSub = 'Pickups drift to the ship.';
      sfx('power');
    } else {
      addScore(500);
      state.banner = 'GEM SCORE';
      state.bannerSub = 'Pure bonus juice.';
      sfx('power');
    }
    state.bannerTimer = 1.15;
  }

  function pickWeaponDropKind() {
    const total = WEAPON_PICKUP_WEIGHTS.reduce(function (sum, weight) { return sum + weight; }, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < WEAPON_PICKUP_WEIGHTS.length; i++) {
      roll -= WEAPON_PICKUP_WEIGHTS[i];
      if (roll <= 0) return i;
    }
    return 0;
  }

  function useBomb() {
    const p = state.player;
    if (state.mode !== 'playing' || p.bombs <= 0) return;
    p.bombs--;
    state.flash = Math.max(state.flash, 0.5);
    state.shake = Math.max(state.shake, 15);
    sfx('bomb');
    burst(p.x, p.y, '#fff0b5', 36, 260, 8, 'spark');
    for (let i = state.enemyBullets.length - 1; i >= 0; i--) { const b = state.enemyBullets[i]; burst(b.x, b.y, '#ffe39a', 4, 120, 4, 'spark'); state.enemyBullets.splice(i, 1); }
    for (let i = state.enemies.length - 1; i >= 0; i--) damageEnemy(state.enemies[i], 999, true);
    if (state.boss) damageBoss(state.boss, 18, true);
  }

  function damageEnemy(e, damage, fromBomb) {
    if (!e || e.dead) return;
    e.hp -= damage;
    e.hitFlash = 0.08;
    burst(e.x, e.y, e.color, 4 + Math.min(8, damage), 110 + damage * 22, 5, 'spark');
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
      if (e.kind === 'spinner') ringBullets(e.x, e.y, 10, 180, 1, e.theme.accent2, 'enemy');
      if (e.kind === 'elite' || e.score > 200) maybeDropPickup(e.x, e.y, true, chance(0.35) ? 'shield' : null);
      else if (!fromBomb) maybeDropPickup(e.x, e.y, false);
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
    burst(b.x, b.y, b.color, 8 + Math.min(14, actualDamage), 190 + actualDamage * 15, 7, 'spark');
    if (b.hp <= 0) {
      b.dead = true;
      state.boss = null;
      clearArray(state.enemies);
      clearArray(state.enemyBullets);
      clearArray(state.bullets);
      burst(b.x, b.y, b.color, 60, 360, 9, 'spark');
      flashBurst(b.x, b.y, b.color);
      sfx('boom');
      state.shake = Math.max(state.shake, 18);
      state.flash = Math.max(state.flash, 0.42);
      addScore(2500 + state.levelIndex * 300);
      state.banner = 'BOSS DOWN';
      state.bannerSub = b.name + ' has fallen.';
      state.bannerTimer = 2.2;
      state.nextLevelTimer = 2.4;
      state.transition = { type: 'clear', timer: 0 };
      state.player.health = Math.min(state.player.maxHealth, state.player.health + 1);
      state.player.bombs = Math.min(4, state.player.bombs + 1);
      state.player.shield = Math.min(3, state.player.shield + 1);
      sfx('clear');
      hint('Boss defeated! Next stage loading...', 2.6);
    } else if (!fromBomb) {
      sfx('hit');
    }
  }

  function hurtPlayer(damage) {
    const p = state.player;
    if (p.invuln > 0 || state.mode !== 'playing') return;
    const actualDamage = Math.max(1, Math.round(damage * 3));
    if (p.shield > 0) {
      p.shield--;
      p.invuln = 0.6;
      state.flash = Math.max(state.flash, 0.1);
      burst(p.x, p.y, '#8fd8ff', 16, 220, 5, 'spark');
      sfx('power');
      return;
    }
    p.health -= actualDamage;
    p.invuln = 1.6;
    p.repairDelay = 1.8;
    state.shake = Math.max(state.shake, 10);
    state.flash = Math.max(state.flash, 0.12);
    sfx('damage');
    burst(p.x, p.y, '#ffd96a', 16, 200, 5, 'spark');
    if (p.health <= 0) {
      state.lives--;
      if (state.lives <= 0) return gameOver();
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
  }

  function ringBullets(x, y, count, speed, damage, color, team) {
    for (let i = 0; i < count; i++) {
      const a = TAU * i / count;
      spawnBullet(team === 'enemy' ? 'enemy' : 'player', x, y, Math.cos(a) * speed, Math.sin(a) * speed, {
        r: team === 'enemy' ? 7 : 5, color: color, damage: damage, kind: team === 'enemy' ? 'orb' : 'spark', life: 4.5
      });
    }
  }

  const BOSS_ATTACKS = {
    aimed: function (b) {
      b.fireClock -= currentDt;
      if (b.fireClock > 0) return;
      b.fireClock = shotDelay(b.hp < b.maxHp * 0.5 ? 0.34 : 0.52);
      const pl = state.player;
      const base = ang(b.x, b.y, pl.x, pl.y);
      const n = b.hp < b.maxHp * 0.5 ? 5 : 3;
      for (let i = 0; i < n; i++) {
        const a = base + (i - (n - 1) * 0.5) * 0.15;
        spawnBullet('enemy', b.x, b.y + 12, Math.cos(a) * 260, Math.sin(a) * 260, { r: 8, color: b.color, damage: 1, kind: 'orb', life: 5.5 });
      }
    },
    ring: function (b) {
      b.fireClock -= currentDt;
      if (b.fireClock > 0) return;
      b.fireClock = shotDelay(b.hp < b.maxHp * 0.5 ? 0.88 : 1.2);
      ringBullets(b.x, b.y, b.hp < b.maxHp * 0.5 ? 20 : 14, b.hp < b.maxHp * 0.5 ? 210 : 180, 1, b.color, 'enemy');
    },
    fan: function (b) {
      b.fireClock -= currentDt;
      if (b.fireClock > 0) return;
      b.fireClock = shotDelay(b.hp < b.maxHp * 0.5 ? 0.28 : 0.4);
      const pl = state.player;
      const base = ang(b.x, b.y, pl.x, pl.y);
      const n = b.hp < b.maxHp * 0.5 ? 7 : 5;
      for (let i = 0; i < n; i++) {
        const a = base + lerp(-0.38, 0.38, n === 1 ? 0.5 : i / (n - 1));
        spawnBullet('enemy', b.x, b.y + 6, Math.cos(a) * 300, Math.sin(a) * 300, { r: 6, color: b.color, damage: 1, kind: 'sting', life: 4.5 });
      }
    },
    rain: function (b) {
      b.fireClock -= currentDt;
      if (b.fireClock > 0) return;
      b.fireClock = shotDelay(b.hp < b.maxHp * 0.5 ? 0.24 : 0.4);
      for (let i = 0; i < (b.hp < b.maxHp * 0.5 ? 3 : 2); i++) {
        spawnBullet('enemy', clamp(b.x + rand(-160, 160), 24, view.w - 24), -20, rand(-22, 22), rand(220, 280), { r: 6, color: b.color, damage: 1, kind: 'rain', ay: 18, life: 5 });
      }
    },
    summon: function (b) {
      b.fireClock -= currentDt;
      if (b.fireClock > 0) return;
      b.fireClock = shotDelay(b.hp < b.maxHp * 0.5 ? 1.0 : 1.5);
      spawnEnemy(pick(b.theme.enemyKinds), clamp(b.x + rand(-120, 120), 36, view.w - 36), b.y + rand(-10, 18), { vx: rand(-80, 80), vy: rand(120, 152) });
      if (chance(0.4)) spawnEnemy('swarm', clamp(b.x + rand(-120, 120), 36, view.w - 36), b.y + rand(-10, 18), { vx: rand(-80, 80), vy: rand(128, 160) });
    },
    beam: function (b) {
      b.fireClock -= currentDt;
      if (b.fireClock > 0) return;
      b.fireClock = shotDelay(b.hp < b.maxHp * 0.5 ? 1.2 : 1.8);
      for (let i = -4; i <= 4; i++) {
        spawnBullet('enemy', b.x + i * 18, b.y + 18, rand(-18, 18), 240 + i * 8, { r: 8, color: b.color, damage: 1, kind: 'beam', life: 4.4 });
      }
    },
    wall: function (b) {
      b.fireClock -= currentDt;
      if (b.fireClock > 0) return;
      b.fireClock = shotDelay(b.hp < b.maxHp * 0.5 ? 0.9 : 1.3);
      const gap = randi(1, 5);
      const cols = 7;
      for (let i = 0; i < cols; i++) {
        if (i === gap) continue;
        spawnBullet('enemy', lerp(56, view.w - 56, i / (cols - 1)), -18, 0, 220 + (b.hp < b.maxHp * 0.5 ? 20 : 0), { r: 6, color: b.color, damage: 1, kind: 'wall', life: 5 });
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
        spawnBullet('enemy', b.x, b.y, Math.cos(a) * 220, Math.sin(a) * 220, { r: 6, color: b.color, damage: 1, kind: 'spiral', life: 4.5 });
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
    b.age += dt;
    b.phaseClock += dt;
    const phaseDef = b.phases[b.phaseIndex] || b.phases[b.phases.length - 1];
    if (b.phaseClock >= phaseDef.dur) {
      b.phaseClock = 0;
      b.phaseIndex = Math.min(b.phaseIndex + 1, b.phases.length - 1);
      setBanner('PHASE SHIFT', b.name + ' is changing tactics.', 1.0);
      sfx('boss');
    }
    updateBossMotion(b, phaseDef, dt);
    const atk = BOSS_ATTACKS[phaseDef.attack];
    if (atk) atk(b, phaseDef);
    if (b.hitFlash > 0) b.hitFlash -= dt;
  }

  function updatePlayer(dt) {
    const p = state.player;
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
      p.fireHeld = true;
      const pointerLead = (36 + (state.overdrive > 0 ? 4 : 0)) * 1.5;
      p.x = smooth(p.x, clamp(state.pointerX, a.left, a.right), 7.5, dt);
      p.y = smooth(p.y, clamp(state.pointerY - pointerLead, a.top + 10, a.bottom - 10), 7.5, dt);
    } else {
      p.pointerMode = false;
      const ax = (state.input.right ? 1 : 0) - (state.input.left ? 1 : 0);
      const ay = (state.input.down ? 1 : 0) - (state.input.up ? 1 : 0);
      const sp = 460 + (state.overdrive > 0 ? 80 : 0);
      if (ax || ay) {
        const len = Math.hypot(ax, ay) || 1;
        p.x += (ax / len) * sp * dt;
        p.y += (ay / len) * sp * dt;
      }
      p.x = clamp(p.x, a.left, a.right);
      p.y = clamp(p.y, a.top + 10, a.bottom - 10);
      p.fireHeld = !!state.input.fire;
    }
    if (p.health < p.maxHealth) {
      p.repairDelay = Math.max(0, p.repairDelay - dt);
      if (p.repairDelay <= 0 && p.invuln <= 0) {
        p.health = Math.min(p.maxHealth, p.health + dt * 0.22);
      }
    } else {
      p.repairDelay = 0;
    }
    if (state.mode === 'playing' && p.fireHeld && p.fireCooldown <= 0) fireWeapon();
  }

  function updateBullets(dt) {
    const p = state.player;
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const b = state.bullets[i];
      if (!b) continue;
      b.age += dt;
      if (b.homing > 0) {
        const target = b.kind === 'rocket' ? findRocketTarget(b) : null;
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
      if (b.life <= 0 || b.x < -60 || b.x > view.w + 60 || b.y < -80 || b.y > view.h + 80) { state.bullets.splice(i, 1); continue; }
      if (state.boss && d2(b.x, b.y, state.boss.x, state.boss.y) < (b.r + state.boss.r) * (b.r + state.boss.r)) {
        damageBoss(state.boss, b.damage, false);
        if (b.pierce > 0) { b.pierce--; b.life -= 0.3; } else { state.bullets.splice(i, 1); continue; }
      }
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const e = state.enemies[j];
        if (e.dead) continue;
        if (d2(b.x, b.y, e.x, e.y) < (b.r + e.r) * (b.r + e.r)) {
          damageEnemy(e, b.damage, false);
          if (b.pierce > 0) { b.pierce--; b.life -= 0.18; } else { state.bullets.splice(i, 1); break; }
        }
      }
    }
    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
      const b = state.enemyBullets[i];
      if (!b) continue;
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
      if (b.life <= 0 || b.x < -80 || b.x > view.w + 80 || b.y < -100 || b.y > view.h + 100) { state.enemyBullets.splice(i, 1); continue; }
      if (p.invuln <= 0 && d2(b.x, b.y, p.x, p.y) < (b.r + p.r) * (b.r + p.r)) {
        state.enemyBullets.splice(i, 1);
        hurtPlayer(b.damage);
      }
    }
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
      const beforeX = e.x;
      const beforeY = e.y;
      if (!entering && e.kind === 'drifter') {
        e.y += e.vy * dt;
        e.x += Math.sin(e.age * 3 + e.wobble) * 18 * dt;
      } else if (!entering && e.kind === 'zigzag') {
        e.y += e.vy * dt;
        e.x += e.dir * (e.vx || 60) * dt;
        if (e.x < a.left || e.x > a.right) { e.dir *= -1; e.x = clamp(e.x, a.left, a.right); }
      } else if (!entering && e.kind === 'swarm') {
        e.y += e.vy * dt;
        e.x += Math.sin(e.age * 6 + e.wobble) * 46 * dt;
      } else if (!entering && e.kind === 'bomber') {
        e.y += e.vy * dt;
        e.x += Math.sin(e.age * 1.5 + e.wobble) * 24 * dt;
        if (e.fireCooldown <= 0) { e.fireCooldown = shotDelay(1.05 - state.levelIndex * 0.03); spawnBullet('enemy', e.x, e.y + 14, rand(-34, 34), rand(180, 240), { r: 7, color: e.theme.accent2, damage: 1, kind: 'drop', ay: 58, life: 4.8 }); }
      } else if (!entering && e.kind === 'sniper') {
        e.y += e.vy * dt * 0.5;
        e.x += Math.sin(e.age * 1.2 + e.wobble) * 14 * dt;
        if (e.fireCooldown <= 0 && e.y > 100) {
          e.fireCooldown = shotDelay(1.4 - Math.min(0.5, state.levelIndex * 0.03));
          const base = ang(e.x, e.y, p.x, p.y);
          for (let k = -1; k <= 1; k++) {
            const aa = base + k * 0.1;
            spawnBullet('enemy', e.x, e.y, Math.cos(aa) * 240, Math.sin(aa) * 240, { r: 7, color: e.theme.accent, damage: 1, kind: 'shot', life: 4.6 });
          }
        }
      } else if (!entering && e.kind === 'spinner') {
        e.y += e.vy * dt * 0.7;
        e.x += Math.cos(e.age * 1.1 + e.wobble) * 24 * dt;
        if (e.fireCooldown <= 0 && e.y > 80) { e.fireCooldown = shotDelay(1.65 - Math.min(0.6, state.levelIndex * 0.04)); ringBullets(e.x, e.y, 8 + Math.floor(state.levelIndex / 2), 150 + state.levelIndex * 8, 1, e.theme.accent2, 'enemy'); }
      } else if (!entering && e.kind === 'splitter') {
        e.y += e.vy * dt;
        e.x += Math.sin(e.age * 2.2 + e.wobble) * 18 * dt;
      } else if (!entering && e.kind === 'diver') {
        const base = ang(e.x, e.y, p.x, p.y);
        e.vx = lerp(e.vx, Math.cos(base) * 80, 0.018);
        e.vy = lerp(e.vy, 120 + Math.sin(e.age * 2 + e.wobble) * 22, 0.02);
        e.x += e.vx * dt;
        e.y += e.vy * dt;
      } else if (!entering && e.kind === 'mine') {
        e.y += e.vy * dt;
        e.x += Math.sin(e.age * 1.4 + e.wobble) * 12 * dt;
      } else if (!entering && e.kind === 'elite') {
        e.y += e.vy * dt * 0.85;
        e.x += Math.sin(e.age * 1.8 + e.wobble) * 20 * dt;
        if (e.fireCooldown <= 0) { e.fireCooldown = shotDelay(0.8); const base = ang(e.x, e.y, p.x, p.y); ringBullets(e.x, e.y, 8, 160, 1, e.theme.accent2, 'enemy'); spawnBullet('enemy', e.x, e.y, Math.cos(base) * 220, Math.sin(base) * 220, { r: 7, color: e.theme.accent, damage: 1, kind: 'elite', life: 4.8 }); }
      }
      e.flightAngle = Math.atan2(e.y - prevY, e.x - prevX);
      if (e.y > view.h + 72 || e.x < -90 || e.x > view.w + 90) { state.enemies.splice(i, 1); continue; }
      if (d2(e.x, e.y, p.x, p.y) < (e.r + p.r) * (e.r + p.r)) {
        const contactDamage = currentDifficulty().contact;
        damageEnemy(e, contactDamage, false);
        hurtPlayer(contactDamage);
        if (e.kind !== 'mine' || e.hp <= 0) { state.enemies.splice(i, 1); continue; }
      }
    }
  }

  function updatePickups(dt) {
    const p = state.player;
    const magnet = p.magnetTimer > 0 ? 220 : 0;
    for (let i = state.pickups.length - 1; i >= 0; i--) {
      const it = state.pickups[i];
      it.life -= dt;
      it.bob += dt * 5;
      if (magnet > 0) {
        const d = Math.sqrt(d2(it.x, it.y, p.x, p.y));
        if (d < magnet) {
          const a = ang(it.x, it.y, p.x, p.y);
          it.vx += Math.cos(a) * 180 * dt;
          it.vy += Math.sin(a) * 180 * dt;
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
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.life -= dt;
      if (p.kind === 'ring') p.size += dt * 180;
      else { p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt; }
      if (p.life <= 0) state.particles.splice(i, 1);
    }
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
    if (state.mode === 'debug') return;
    if (state.mode === 'title') { updateMusic(dt); updateParticles(dt); return; }
    if (state.mode === 'gameover' || state.mode === 'victory') { updateMusic(dt * 0.35); updateParticles(dt); if (state.player.invuln > 0) state.player.invuln = Math.max(0, state.player.invuln - dt); return; }
    if (state.paused) return;
    updatePlayer(dt);
    if (state.boss) updateBoss(dt);
    if (!state.boss) {
      state.levelClock += dt;
      state.waveClock += dt;
    }
    updateBullets(dt);
    updateEnemies(dt);
    updatePickups(dt);
    updateParticles(dt);
    updateTransition(dt);
    if (!state.boss && !state.transition) {
      const theme = state.currentTheme;
      const spawnInterval = clamp(1.18 - state.levelIndex * 0.045, 0.56, 1.18);
      while (state.waveClock >= spawnInterval) { state.waveClock -= spawnInterval; spawnWave(theme); }
      if (state.levelClock >= 28 + state.levelIndex * 2.8) spawnBoss(theme);
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
    drawSpriteCircle(x, y, r + b * 0.6, color, a, 0, true);
    drawSpriteCircle(x, y, Math.max(1, r * 0.72), color, a, 0, true);
  }

  function drawDiffuseGlowCircle(x, y, r, color, alpha, blur) {
    const b = blur == null ? Math.max(10, r * 0.8) : blur;
    const a = alpha == null ? 1 : alpha;
    drawSpriteCircle(x, y, r + b * 0.95, color, a * 0.00625, 0, true);
    drawSpriteCircle(x, y, r + b * 0.62, color, a * 0.01, 0, true);
    drawSpriteCircle(x, y, r + b * 0.28, color, a * 0.01625, 0, true);
    drawSpriteCircle(x, y, Math.max(1, r * 0.76), color, a * 0.01875, 0, true);
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

  function drawBar(x, y, w, h, ratio, fill, back, label) {
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
      const g = hudCtx.createLinearGradient(x, y, x + w, y);
      g.addColorStop(0, fill || '#ffffff');
      g.addColorStop(1, 'rgba(255,255,255,0.95)');
      hudCtx.fillStyle = g;
      roundRect(x + 1, y + 1, Math.max(0, (w - 2) * p), h - 2, h * 0.45);
      hudCtx.fill();
    }
    if (label) {
      hudCtx.fillStyle = '#fff';
      hudCtx.font = '700 11px "Segoe UI", sans-serif';
      hudCtx.textAlign = 'center';
      hudCtx.textBaseline = 'middle';
      hudCtx.fillText(label, x + w * 0.5, y + h * 0.52);
    }
    hudCtx.restore();
  }

  function drawWorldBar(x, y, w, h, ratio, fill, back, layer) {
    x = Number.isFinite(x) ? x : 0;
    y = Number.isFinite(y) ? y : 0;
    w = Number.isFinite(w) ? w : 0;
    h = Number.isFinite(h) ? h : 0;
    const p = clamp(ratio, 0, 1);
    const l = Number.isFinite(layer) ? layer : 0;
    const bg = Array.isArray(back) ? back : hexToRgb('#000000');
    drawSpriteRect(x + w * 0.5, y + h * 0.2112, w, h, bg, 0.900, l, false);
    if (p > 0) {
      const fillW = Math.max(1, w * p);
      drawSpriteRect(x + fillW * 0.5, y + h * 0.5, fillW, Math.max(1, h - 2), fill || '#ffffff', 0.4, l + 0.01, false);
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

  function destroyBitmapLayer(layer) {
    if (!layer || !layer.texture || !gl || !gl.deleteTexture) return;
    try {
      gl.deleteTexture(layer.texture);
    } catch (e) {}
    layer.texture = null;
  }

  function bitmapFillRect(g, x, y, w, h, color, alpha) {
    g.fillStyle = rgbaString(color, alpha);
    g.fillRect(x, y, w, h);
  }

  function bitmapFillCircle(g, x, y, r, color, alpha) {
    g.fillStyle = rgbaString(color, alpha);
    g.beginPath();
    g.arc(x, y, r, 0, TAU);
    g.fill();
  }

  function bitmapStrokeLine(g, x1, y1, x2, y2, width, color, alpha) {
    g.strokeStyle = rgbaString(color, alpha);
    g.lineWidth = width;
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.stroke();
  }

  function makeTwistedPath(x0, y0, x1, y1, sway, curl, rng, segments, phase, pinch) {
    const pts = [];
    const segs = Math.max(3, segments || 6);
    const ph = phase || 0;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const eased = t * t * (3 - 2 * t);
      const px = lerp(x0, x1, eased);
      const py = lerp(y0, y1, eased);
      const wave = Math.sin(t * TAU * 0.95 + ph) * sway + Math.sin(t * TAU * 2.1 + ph * 0.37) * sway * 0.42;
      const twist = Math.cos(t * TAU * 0.8 + ph * 1.7) * curl + Math.sin(t * TAU * 3.2 + ph * 0.11) * curl * 0.18;
      const squeeze = pinch ? Math.sin(t * Math.PI) * pinch : 0;
      pts.push([
        px + wave + twist * 0.12 + (rng() - 0.5) * sway * 0.16,
        py + squeeze + (rng() - 0.5) * sway * 0.08
      ]);
    }
    return pts;
  }

  function bitmapBrushPath(g, points, width, color, alpha, rng, passes, jitter) {
    if (!points || points.length < 2) return;
    const passCount = Math.max(1, passes || 3);
    const wobble = Math.max(0.15, jitter == null ? width * 0.45 : jitter);
    for (let pass = 0; pass < passCount; pass++) {
      g.save();
      g.strokeStyle = rgbaString(color, alpha * (0.56 + pass * 0.1));
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.lineWidth = Math.max(0.45, width * (0.72 + rng() * 0.25));
      g.beginPath();
      const start = points[0];
      g.moveTo(
        start[0] + (rng() - 0.5) * wobble * 0.3,
        start[1] + (rng() - 0.5) * wobble * 0.3
      );
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const cur = points[i];
        const dx = cur[0] - prev[0];
        const dy = cur[1] - prev[1];
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const phase = i * 1.31 + pass * 0.87 + rng() * 0.25;
        const off = Math.sin(phase) * wobble * 0.28 + Math.cos(phase * 1.7) * wobble * 0.12 + (rng() - 0.5) * wobble * 0.22;
        g.lineTo(cur[0] + nx * off, cur[1] + ny * off);
      }
      g.stroke();
      g.restore();
    }
  }

  function bitmapFillRadialGlow(g, x, y, innerR, outerR, color, alpha, blendMode) {
    const prev = g.globalCompositeOperation;
    if (blendMode) g.globalCompositeOperation = blendMode;
    const r0 = Math.max(1, innerR);
    const r1 = Math.max(r0 + 1, outerR);
    const grd = g.createRadialGradient(x, y, Math.max(1, r0 * 0.08), x, y, r1);
    grd.addColorStop(0, rgbaString(color, alpha * 0.95));
    grd.addColorStop(0.25, rgbaString(color, alpha * 0.55));
    grd.addColorStop(0.58, rgbaString(color, alpha * 0.2));
    grd.addColorStop(1, rgbaString(color, 0));
    g.fillStyle = grd;
    g.beginPath();
    g.arc(x, y, r1, 0, TAU);
    g.fill();
    g.globalCompositeOperation = prev;
  }

  function bitmapFillLightBeam(g, x, topY, bottomY, spread, color, alpha, sway, blendMode) {
    const prev = g.globalCompositeOperation;
    if (blendMode) g.globalCompositeOperation = blendMode;
    const s = Math.max(1, spread);
    const drift = sway || 0;
    const grd = g.createLinearGradient(x - s, topY, x + s, bottomY);
    grd.addColorStop(0, rgbaString(color, 0));
    grd.addColorStop(0.18, rgbaString(color, alpha * 0.24));
    grd.addColorStop(0.5, rgbaString(color, alpha * 0.7));
    grd.addColorStop(0.82, rgbaString(color, alpha * 0.24));
    grd.addColorStop(1, rgbaString(color, 0));
    g.fillStyle = grd;
    g.beginPath();
    g.moveTo(x - s * 0.95, topY);
    g.lineTo(x + s * 0.95, topY);
    g.lineTo(x + s * 1.18 + drift, bottomY);
    g.lineTo(x - s * 1.18 + drift, bottomY);
    g.closePath();
    g.fill();
    g.globalCompositeOperation = prev;
  }

  function makeBitmapLayer(width, height, seed, speed, kind, paint) {
    const maxTex = gl && gl.getParameter ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 4096;
    const safeMax = Number.isFinite(maxTex) && maxTex > 0 ? maxTex : 4096;
    const scale = Math.min(1, safeMax / Math.max(1, width), safeMax / Math.max(1, height));
    const texW = Math.max(1, Math.round(width * scale));
    const texH = Math.max(1, Math.round(height * scale));
    const canvas = makeCanvas(texW, texH);
    const g = canvas.getContext('2d');
    g.imageSmoothingEnabled = true;
    g.clearRect(0, 0, width, height);
    if (scale < 1) g.scale(scale, scale);
    paint(g, width, height, makeRng(seed || 1));
    return {
      texture: createTextureFromCanvas(canvas),
      width: width,
      height: height,
      textureWidth: texW,
      textureHeight: texH,
      contentScale: scale,
      viewportH: view.h,
      scroll: Math.max(0, height - view.h),
      maxScroll: Math.max(0, height - view.h),
      speed: speed,
      seed: seed || 1,
      kind: kind || ''
    };
  }

  function paintOrchardTree(g, x, groundY, scale, variant, rng, palette, alpha) {
    const trunkColors = palette.trunk;
    const leafColors = palette.leaf;
    const shadowColors = palette.shadow;
    const trunkAlpha = alpha == null ? 1 : alpha;
    const trunkH = scale * (60 + rng() * 40 + (variant % 3) * 10);
    const trunkW = scale * (4.4 + rng() * 2.8 + (variant % 2) * 0.6);
    const trunkTop = groundY - trunkH;
    const phase = variant * 0.71 + rng() * 0.5;
    const trunkStartX = x + (rng() - 0.5) * scale * 5;
    const trunkLean = (rng() - 0.5) * scale * 22;
    const trunkCurl = scale * (10 + rng() * 18);
    const trunkSway = scale * (7 + rng() * 9);
    const trunkPath = makeTwistedPath(trunkStartX, groundY + scale * 1.4, trunkStartX + trunkLean, trunkTop + scale * (6 + rng() * 6), trunkSway, trunkCurl, rng, 8, phase, scale * 3.4);
    const baseShadowR = trunkW * (2.2 + rng() * 0.4);
    bitmapFillCircle(g, trunkStartX, groundY + scale * 0.3, baseShadowR, shadowColors[0], trunkAlpha * 0.15);
    bitmapFillCircle(g, trunkStartX + (rng() - 0.5) * trunkW, groundY + scale * 0.2, baseShadowR * 0.72, shadowColors[1], trunkAlpha * 0.1);
    bitmapBrushPath(g, trunkPath, trunkW * 2.84, trunkColors[2], trunkAlpha * 0.56, rng, 4, trunkW * 0.85);
    bitmapBrushPath(g, trunkPath, trunkW * 2.0, trunkColors[1], trunkAlpha * 0.84, rng, 3, trunkW * 0.58);
    bitmapBrushPath(g, trunkPath, trunkW * 1.16, trunkColors[0], trunkAlpha * 0.76, rng, 2, trunkW * 0.34);
    bitmapBrushPath(g, trunkPath, trunkW * 0.56, shadowColors[1], trunkAlpha * 0.36, rng, 2, trunkW * 0.18);

    const barkCount = 7 + (variant % 4);
    for (let i = 0; i < barkCount; i++) {
      const idx = 1 + Math.min(trunkPath.length - 3, Math.floor((i + 0.5) / barkCount * (trunkPath.length - 2)));
      const prev = trunkPath[idx - 1];
      const cur = trunkPath[idx];
      const next = trunkPath[idx + 1];
      const dx = next[0] - prev[0];
      const dy = next[1] - prev[1];
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const side = i % 2 === 0 ? -1 : 1;
      const sx = cur[0] + nx * side * trunkW * (0.24 + rng() * 0.24);
      const sy = cur[1] + ny * side * trunkW * (0.24 + rng() * 0.24);
      const ex = sx + dx / len * scale * (2 + rng() * 4) + nx * side * trunkW * (0.08 + rng() * 0.12);
      const ey = sy + dy / len * scale * (2 + rng() * 4) + ny * side * trunkW * (0.08 + rng() * 0.12);
      bitmapBrushPath(g, [[sx, sy], [ex, ey]], trunkW * 0.24, trunkColors[i % trunkColors.length], trunkAlpha * 0.5, rng, 2, trunkW * 0.08);
    }

    const rootCount = 4 + (variant % 3);
    for (let i = 0; i < rootCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const rootLen = scale * (12 + rng() * 16 + i * 1.5);
      const rootRise = scale * (4 + rng() * 6 + i * 0.8);
      const rootPath = makeTwistedPath(
        trunkStartX + side * trunkW * 0.12,
        groundY - 1 + i * 0.25,
        trunkStartX + side * (rootLen + trunkW * 0.8),
        groundY + rootRise,
        side * scale * (2 + rng() * 4),
        side * scale * (5 + rng() * 6),
        rng,
        4,
        phase + i * 0.37,
        0
      );
      bitmapBrushPath(g, rootPath, trunkW * 0.9, trunkColors[(i + 1) % trunkColors.length], trunkAlpha * 0.72, rng, 3, trunkW * 0.32);
    }

    function drawLeafCluster(cx, cy, spread, rot, power) {
      const puffCount = 4 + (variant % 3) + (rng() * 3 | 0);
      const softR = spread * (0.28 + rng() * 0.15);
      bitmapFillCircle(g, cx, cy + spread * 0.12, softR * 0.92, shadowColors[0], trunkAlpha * power * 0.12);
      for (let i = 0; i < puffCount; i++) {
        const a = rot + (TAU / puffCount) * i + (rng() - 0.5) * 0.55;
        const px = cx + Math.cos(a) * spread * (0.32 + rng() * 0.5) + (rng() - 0.5) * spread * 0.22;
        const py = cy + Math.sin(a * 1.07) * spread * 0.24 + (rng() - 0.5) * spread * 0.2;
        const r = Math.max(2, spread * (0.16 + rng() * 0.24));
        const leaf = leafColors[(i + variant) % leafColors.length];
        bitmapFillCircle(g, px, py, r, leaf, trunkAlpha * power * (0.76 + rng() * 0.2));
        bitmapFillCircle(g, px - r * 0.18, py - r * 0.16, r * 0.46, leafColors[(i + 1) % leafColors.length], trunkAlpha * power * 0.18);
      }
    }

    const branchCount = 5 + (variant % 4) + (rng() * 2 | 0);
    const tips = [];
    for (let i = 0; i < branchCount; i++) {
      const anchorIndex = 1 + Math.min(trunkPath.length - 3, Math.floor((i + 1) / (branchCount + 1) * (trunkPath.length - 3)));
      const anchor = trunkPath[anchorIndex];
      const side = (i % 2 === 0 ? -1 : 1) * (0.78 + rng() * 0.62);
      const branchLen = scale * (14 + rng() * 24);
      const branchRise = scale * (12 + rng() * 22);
      const branchCurl = scale * (6 + rng() * 10);
      const branchPath = makeTwistedPath(anchor[0], anchor[1], anchor[0] + side * branchLen, anchor[1] - branchRise, side * branchCurl, side * branchCurl * 0.85, rng, 5, phase + i * 0.73, scale * 1.1);
      bitmapBrushPath(g, branchPath, trunkW * 1.23, trunkColors[(i + 1) % trunkColors.length], trunkAlpha * 0.72, rng, 3, trunkW * 0.44);
      bitmapBrushPath(g, branchPath, trunkW * 0.69, shadowColors[(i + 2) % shadowColors.length], trunkAlpha * 0.42, rng, 2, trunkW * 0.24);

      const mid = branchPath[2];
      if (mid) {
        const side2 = -side * (0.5 + rng() * 0.4);
        const subLen = branchLen * (0.42 + rng() * 0.18);
        const subRise = branchRise * (0.42 + rng() * 0.2);
        const subPath = makeTwistedPath(mid[0], mid[1], mid[0] + side2 * subLen, mid[1] - subRise, side2 * scale * (2 + rng() * 3), side2 * scale * (4 + rng() * 5), rng, 4, phase + i * 0.29, scale * 0.68);
        bitmapBrushPath(g, subPath, trunkW * 0.66, trunkColors[(i + 2) % trunkColors.length], trunkAlpha * 0.56, rng, 2, trunkW * 0.2);
        tips.push({ x: subPath[subPath.length - 1][0], y: subPath[subPath.length - 1][1], spread: scale * (10 + rng() * 10), rot: phase + i * 0.5, power: 0.74 });
      }

      const tip = branchPath[branchPath.length - 1];
      tips.push({ x: tip[0], y: tip[1], spread: scale * (12 + rng() * 12), rot: phase + i * 0.5, power: 0.86 });

      const twigPath = makeTwistedPath(tip[0], tip[1], tip[0] + side * scale * (4 + rng() * 8), tip[1] - scale * (6 + rng() * 10), side * scale * (1 + rng() * 2), side * scale * (2 + rng() * 3), rng, 3, phase + i * 0.19, 0);
      bitmapBrushPath(g, twigPath, trunkW * 0.39, trunkColors[(i + 1) % trunkColors.length], trunkAlpha * 0.46, rng, 2, trunkW * 0.1);

      if (rng() < 0.6) {
        const vinePath = makeTwistedPath(tip[0], tip[1], tip[0] + side * scale * (2 + rng() * 6), tip[1] + scale * (6 + rng() * 12), side * scale * 1.8, side * scale * 2.4, rng, 3, phase + i * 0.13, 0);
        bitmapBrushPath(g, vinePath, trunkW * 0.27, leafColors[(i + variant) % leafColors.length], trunkAlpha * 0.3, rng, 2, trunkW * 0.08);
      }
    }

    const crownTop = trunkPath[Math.max(1, trunkPath.length - 2)];
    drawLeafCluster(crownTop[0], crownTop[1] - scale * (4 + rng() * 8), scale * (18 + rng() * 14 + (variant % 3) * 4), phase, 0.9);
    drawLeafCluster(x + (rng() - 0.5) * scale * 5, trunkTop + scale * (8 + rng() * 8), scale * (12 + rng() * 8), phase + 0.8, 0.58);
    for (let i = 0; i < tips.length; i++) {
      const tip = tips[i];
      drawLeafCluster(tip.x, tip.y, tip.spread, tip.rot, tip.power);
    }
  }

  function paintOrchardBush(g, x, y, scale, rng, palette, alpha) {
    const colors = palette.leaf;
    const shadow = palette.shadow;
    const count = 5 + (rng() * 4 | 0);
    const base = scale * (16 + rng() * 12);
    bitmapFillCircle(g, x, y + scale * 2, base * 1.08, shadow[0], alpha * 0.12);
    for (let i = 0; i < count; i++) {
      const a = (TAU / count) * i + rng() * 0.4;
      const px = x + Math.cos(a) * base * 0.28 + (rng() - 0.5) * scale * 6;
      const py = y + Math.sin(a) * base * 0.16 + (rng() - 0.5) * scale * 4;
      const r = base * (0.55 + rng() * 0.5);
      bitmapFillCircle(g, px, py, r, colors[i % colors.length], alpha * (0.72 + rng() * 0.18));
      bitmapFillCircle(g, px - r * 0.18, py - r * 0.15, r * 0.42, colors[(i + 1) % colors.length], alpha * 0.16);
    }
  }

  function buildOrchardBackgroundBitmap(theme, seed) {
    const w = Math.max(1, Math.round(view.w));
    const h = Math.max(1, Math.round(view.h * 5));
    const palette = {
      base: ['#8ed255', '#6fbe43', '#4f982f'],
      grass: ['#9ce35a', '#7ac346', '#5aa038', '#417d29'],
      leaf: ['#2f6f2c', '#3f8d31', '#59a83c', '#7bc54e'],
      trunk: ['#5d3720', '#7a4b2b', '#9a6a3f'],
      shadow: ['#23461d', '#315d25', '#3d722d']
    };
    const speed = Math.max(18, view.h * 0.035);
    return makeBitmapLayer(w, h, seed, speed, 'orchard', function (g, width, height, rng) {
      const sky = g.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, '#8bd34c');
      sky.addColorStop(0.25, '#7fc645');
      sky.addColorStop(0.62, '#5fa336');
      sky.addColorStop(1, '#447a28');
      g.fillStyle = sky;
      g.fillRect(0, 0, width, height);

      bitmapFillRadialGlow(g, width * 0.16, height * 0.1, height * 0.08, height * 0.42, '#e7ffb6', 0.14, 'screen');
      bitmapFillRadialGlow(g, width * 0.5, height * 0.18, height * 0.09, height * 0.5, '#b8ff83', 0.1, 'screen');
      bitmapFillRadialGlow(g, width * 0.84, height * 0.26, height * 0.07, height * 0.36, '#86ff73', 0.07, 'screen');
      bitmapFillLightBeam(g, width * 0.21, 0, height * 0.96, width * 0.045, '#cdff97', 0.07, width * 0.012, 'screen');
      bitmapFillLightBeam(g, width * 0.64, 0, height * 0.96, width * 0.055, '#9dff78', 0.05, -width * 0.02, 'screen');

      for (let i = 0; i < 12; i++) {
        const y = height * (0.03 + i * 0.078) + (rng() - 0.5) * height * 0.008;
        const bandH = height * (0.014 + rng() * 0.01);
        bitmapFillRect(g, 0, y, width, bandH, palette.base[i % palette.base.length], 0.07 + rng() * 0.05);
      }

      const grassTop = height * 0.25;
      const grassCount = Math.max(2200, Math.round(width * height * 0.00075));
      g.lineCap = 'round';
      for (let i = 0; i < grassCount; i++) {
        const x = rng() * width;
        const y = grassTop + rng() * (height - grassTop);
        const t = (y - grassTop) / Math.max(1, height - grassTop);
        const len = 8 + rng() * (18 + t * 32);
        const lean = (rng() - 0.5) * (10 + t * 20);
        const lineW = 0.7 + rng() * 1.7;
        const c = palette.grass[(i + (t * 3 | 0)) % palette.grass.length];
        bitmapStrokeLine(g, x, y, x + lean, y - len, lineW, c, 0.11 + t * 0.2 + rng() * 0.06);
      }

      const bushRows = 6;
      for (let row = 0; row < bushRows; row++) {
        const y = lerp(height * 0.28, height * 0.9, row / Math.max(1, bushRows - 1));
        const count = 3 + (row % 3);
        for (let i = 0; i < count; i++) {
          const x = lerp(width * 0.08, width * 0.92, (i + 0.5) / count) + (row & 1 ? width * 0.045 : -width * 0.018);
          paintOrchardBush(g, x + (rng() - 0.5) * width * 0.03, y + (rng() - 0.5) * height * 0.02, 0.7 + row * 0.14 + rng() * 0.24, rng, palette, 0.88);
        }
      }

      bitmapFillRadialGlow(g, width * 0.28, height * 0.64, height * 0.06, height * 0.28, '#8dff71', 0.07, 'screen');
      bitmapFillRadialGlow(g, width * 0.73, height * 0.72, height * 0.07, height * 0.3, '#76ff67', 0.055, 'screen');

      const placedTrees = [];
      function canPlaceOrchardTree(cx, cy, scale) {
        const footprintW = scale * 96;
        const footprintH = scale * 138;
        for (let i = 0; i < placedTrees.length; i++) {
          const p = placedTrees[i];
          if (Math.abs(cx - p.x) < (footprintW + p.w) * 0.46 && Math.abs(cy - p.y) < (footprintH + p.h) * 0.46) {
            return false;
          }
        }
        placedTrees.push({ x: cx, y: cy, w: footprintW, h: footprintH });
        return true;
      }

      const treeRows = 24;
      for (let row = 0; row < treeRows; row++) {
        const rowT = row / Math.max(1, treeRows - 1);
        const baseY = lerp(height * 0.08, height * 0.98, rowT);
        const cols = row & 1 ? 2 : 3;
        const left = row & 1 ? width * 0.22 : width * 0.08;
        const right = row & 1 ? width * 0.78 : width * 0.92;
        for (let col = 0; col < cols; col++) {
          const colT = cols === 1 ? 0.5 : col / (cols - 1);
          const x = lerp(left, right, colT) + (rng() - 0.5) * width * 0.01;
          const scale = 0.22 + rowT * 0.68 + rng() * 0.05;
          const rowLift = ((row & 1) - 0.5) * height * 0.018 + ((row % 3) - 1) * height * 0.005;
          const y = baseY + rowLift + (rng() - 0.5) * height * 0.008;
          if (canPlaceOrchardTree(x, y, scale)) {
            paintOrchardTree(g, x, y, scale, row * 5 + col, rng, palette, 0.98);
          }
        }
      }

      for (let i = 0; i < 10; i++) {
        const x = lerp(width * 0.04, width * 0.96, rng());
        const y = lerp(height * 0.06, height * 0.2, rng()) + Math.sin(rng() * TAU) * height * 0.008;
        const scale = 0.16 + rng() * 0.08;
        if (canPlaceOrchardTree(x, y, scale)) {
          paintOrchardTree(g, x, y, scale, i + 90, rng, palette, 0.58);
        }
      }

      for (let i = 0; i < 7; i++) {
        const x = lerp(width * 0.06, width * 0.94, rng());
        const y = lerp(height * 0.1, height * 0.88, rng());
        const innerR = height * (0.018 + rng() * 0.022);
        const outerR = innerR * (3.6 + rng() * 1.4);
        bitmapFillRadialGlow(g, x, y, innerR, outerR, i % 2 === 0 ? '#beff88' : '#73ff68', 0.045 + rng() * 0.03, 'screen');
      }

      for (let i = 0; i < 18; i++) {
        const y = height * (0.46 + i * 0.025) + (rng() - 0.5) * height * 0.008;
        bitmapFillRect(g, 0, y, width, height * 0.0045, palette.shadow[i % palette.shadow.length], 0.045);
      }
    });
  }

  function buildCloudForegroundBitmap(seed) {
    const w = Math.max(1, Math.round(view.w));
    const h = Math.max(1, Math.round(view.h * 5));
    const speed = Math.max(24, view.h * 0.065);
    return makeBitmapLayer(w, h, seed, speed, 'clouds', function (g, width, height, rng) {
      g.lineCap = 'round';
      g.lineJoin = 'round';
      const cloudBase = Math.max(39, Math.round((Math.max(52, Math.round(width / 28) + 16)) * 0.75));
      const cloudCount = Math.max(14, Math.round(cloudBase * 0.36));
      for (let i = 0; i < cloudCount; i++) {
        const x = lerp(-width * 0.08, width * 1.08, rng());
        const y = lerp(height * 0.04, height * 0.96, rng());
        const scale = (0.9 + rng() * 1.8) * 0.48;
        const puffs = 5 + (rng() * 3 | 0);
        const span = scale * (56 + rng() * 56);
        const heightSpan = scale * (14 + rng() * 12);
        bitmapFillCircle(g, x, y + heightSpan * 0.2, span * 0.48, '#ffffff', 1);
        for (let p = 0; p < puffs; p++) {
          const t = puffs === 1 ? 0.5 : p / (puffs - 1);
          const px = x + lerp(-span * 0.5, span * 0.5, t) + (rng() - 0.5) * scale * 12;
          const py = y + Math.sin(t * Math.PI) * heightSpan * 0.3 + (rng() - 0.5) * scale * 7;
          const r = scale * (18 + rng() * 16);
          bitmapFillCircle(g, px, py, r, '#ffffff', 1);
          bitmapFillCircle(g, px - r * 0.12, py - r * 0.1, r * 0.54, '#ffffff', 1);
        }
        if (rng() < 0.5) {
          bitmapFillCircle(g, x + span * 0.2, y - heightSpan * 0.2, scale * (12 + rng() * 10), '#ffffff', 1);
        }
        if (rng() < 0.28) {
          bitmapFillCircle(g, x - span * 0.22, y + heightSpan * 0.08, scale * (10 + rng() * 8), '#ffffff', 1);
        }
      }
    });
  }

  function drawBackground() {
    drawStarfield();
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
      if (beamBody) {
        drawSpriteRect(b.x - Math.cos(ang) * bodyW * 0.5, b.y - Math.sin(ang) * bodyW * 0.5, bodyW, bodyH, b.color, b.team === 'player' ? 0.72 : 0.65, 2, true, ang);
      } else if (fanBody) {
        drawSpriteCircle(b.x, b.y, b.r * 0.62, b.color, b.team === 'player' ? 0.90 : 0.80, 2, true);
        drawGlowCircle(b.x, b.y, b.r * 2.2, b.color, b.team === 'player' ? 0.20 : 0.18, 18);
        drawGlowCircle(b.x, b.y, b.r * 1.15, b.color, b.team === 'player' ? 0.45 : 0.38, 10);
        drawGlowCircle(b.x, b.y, b.r, b.color, b.team === 'player' ? 0.95 : 0.85, 6);
      } else if (rocketBody) {
        drawSpriteRect(b.x - Math.cos(ang) * bodyW * 0.5, b.y - Math.sin(ang) * bodyW * 0.5, bodyW, bodyH, b.color, b.team === 'player' ? 0.72 : 0.65, 2, true, ang);
        drawGlowCircle(b.x, b.y, glow1, '#0038ff', b.team === 'player' ? 0.12 : 0.10, 12);
        drawGlowCircle(b.x, b.y, glow2, '#004cff', b.team === 'player' ? 0.18 : 0.14, 8);
        drawGlowCircle(b.x, b.y, glow3, '#005fff', b.team === 'player' ? 0.24 : 0.18, 5);
      } else {
        drawSpriteRect(b.x - Math.cos(ang) * bodyW * 0.5, b.y - Math.sin(ang) * bodyW * 0.5, bodyW, bodyH, b.color, b.team === 'player' ? 0.72 : 0.65, 2, true, ang);
        drawGlowCircle(b.x, b.y, glow1, b.color, b.team === 'player' ? 0.20 : 0.18, 18);
        drawGlowCircle(b.x, b.y, glow2, b.color, b.team === 'player' ? 0.45 : 0.38, 10);
        drawGlowCircle(b.x, b.y, glow3, b.color, b.team === 'player' ? 0.95 : 0.85, 6);
      }
      if (rocketBody) drawSpriteEmoji(E.rocket, b.x, b.y, 14, { rot: ang + Math.PI * 0.25, alpha: 0.95, layer: 3, lighter: true, fill: '#006dff' });
    }
    for (let i = 0; i < state.bullets.length; i++) drawShot(state.bullets[i]);
    for (let i = 0; i < state.enemyBullets.length; i++) drawShot(state.enemyBullets[i]);
  }

  function drawPickups() {
    for (let i = 0; i < state.pickups.length; i++) {
      const p = state.pickups[i];
      const bob = Math.sin(p.bob) * 4;
      drawGlowCircle(p.x, p.y + bob, 16, p.color, 0.48, 22);
      drawGlowCircle(p.x, p.y + bob, 8, p.color, 0.85, 10);
      drawEmojiGlyph(p.emoji, p.x, p.y + bob, 20, { alpha: 1, rot: Math.sin(p.spin + p.bob * 0.7) * 0.16, layer: 2, lighter: true });
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
      zigzag: '#ff6ed1',
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
    const shipGlow = getEnemyShipGlowColor(levelNumber, shipIndex, e.theme);
    const glowRadius = Math.max(14, shipSize * 0.42 * 0.75);
    if (!state.settings.lowEndMode) {
      drawGlowCircle(e.x, e.y, glowRadius * 1.25, shipGlow, 0.92, 22);
      drawGlowCircle(e.x, e.y, glowRadius * 0.68, shipGlow, 0.78, 12);
    }
    if (texture) {
      drawTextureRect(texture, e.x, e.y, shipSize, shipSize, { rot: rot, alpha: alpha, layer: 18 });
    } else {
      if (!state.settings.lowEndMode) {
        drawGlowCircle(e.x, e.y, shipSize * 0.26, p.base, 0.18, 10);
        drawGlowCircle(e.x, e.y, shipSize * 0.12, p.base, alpha * 0.14, 8);
      }
    }
  }

  function drawBossBody(b) {
    const p = bossPalette(b);
    const r = b.r;
    const rot = Math.sin(b.age * 0.8) * 0.04;
    const levelNumber = b.shipLevel || (state.levelIndex + 1);
    const texture = getBossTexture(levelNumber);
    const size = Math.max(208, getEnemyShipRenderSize(levelNumber, b.shipIndex || 0) * 2.75);
    if (!state.settings.lowEndMode) {
      drawGlowCircle(b.x, b.y, r * 2.1, p.glow, 0.18, 24);
      drawGlowCircle(b.x, b.y, r * 1.1, p.base, 0.18, 12);
      drawGlowCircle(b.x, b.y, r * 0.4, p.base, 0.24, 8);
    }
    if (texture) {
      const w = levelNumber <= 6 ? size : (b.facingRight ? -size : size);
      drawTextureRect(texture, b.x, b.y, w, size, { rot: rot, alpha: 0.98, layer: 28 });
    }
  }

  function drawEnemyOverlay(e, rot) {
    if (!state.settings.lowEndMode && e.hitFlash > 0) drawGlowCircle(e.x, e.y, e.r * 1.2, '#ffffff', 0.16, 19);
  }

  function drawBossOverlay(b) {
    if (!state.settings.lowEndMode && b.hitFlash > 0) drawGlowCircle(b.x, b.y, b.r * 1.35, '#ffffff', 0.16, 29);
  }

  function drawEnemy(e) {
    if (!e || e.dead) return;
    const glow = e.theme.glow || e.theme.accent2 || e.theme.accent || '#fff';
    const flight = typeof e.flightAngle === 'number' ? e.flightAngle : Math.atan2(e.vy || 0, e.vx || 1);
    const rot = flight + Math.PI * 0.5;
    const levelNumber = e.shipLevel || (state.levelIndex + 1);
    const shipIndex = e.shipIndex || 0;
    const shipSize = e.shipSize || getEnemyShipRenderSize(levelNumber, shipIndex);
    if (!state.settings.lowEndMode && e.kind === 'spinner') {
      for (let i = 0; i < 5; i++) {
        const a = e.age * 2.2 + i * (TAU / 5);
        drawGlowCircle(e.x + Math.cos(a) * (e.r + 6), e.y + Math.sin(a) * (e.r + 6), 2.2, e.theme.accent2, 0.55, 8);
      }
    }
    drawEnemyBody(e, rot, shipSize);
    drawEnemyOverlay(e, rot);
    if (e.maxHp > 1 && e.hp > 0) {
      const barW = shipSize * 0.86;
      const barH = Math.max(6, Math.round(shipSize * 0.03));
      drawWorldBar(e.x - barW * 0.5, e.y - shipSize * 0.62, barW, barH, e.hp / e.maxHp, '#ff9a4d', 'rgba(0,0,0,0.35)', 17);
    }
    if (e.hitFlash > 0) drawGlowCircle(e.x, e.y, e.r * 1.35, '#ffffff', 0.22, 18);
  }

  function drawBoss(b) {
    if (!b) return;
    const glow = b.color || '#fff';
    if (!state.settings.lowEndMode) {
      drawGlowCircle(b.x, b.y, b.r * 2.4, glow, 0.24, 28);
      drawGlowCircle(b.x, b.y, b.r * 1.2, '#fff', 0.08, 20);
    }
    drawBossBody(b);
    drawBossOverlay(b);
    if (!state.settings.lowEndMode && b.hitFlash > 0) drawGlowCircle(b.x, b.y, b.r * 1.45, '#ffffff', 0.18, 24);
  }

  function drawPlayer() {
    const p = state.player;
    const respawning = p.respawnTimer > 0;
    const bob = respawning ? Math.sin(state.musicStep * 0.45) * 0.8 : Math.sin((state.musicStep * 0.45) + p.x * 0.01) * 2;
    const tilt = respawning ? 0 : clamp(((state.input.right ? 1 : 0) - (state.input.left ? 1 : 0)) * 0.24 + (state.pointerActive ? (state.pointerX - p.x) / 280 : 0), -0.45, 0.45);
    const rot = -Math.PI * 0.25 + tilt;
    const glow = state.overdrive > 0 ? '#ffe38c' : '#8fd8ff';
    const invulnActive = p.invuln > 0 && !respawning;
    const auraColor = invulnActive ? '#bfe4ff' : glow;
    const flashAlpha = p.invuln > 0 ? 0.52 + 0.42 * (0.5 + 0.5 * Math.sin((3 - p.invuln) * 16 + state.musicStep * 0.9)) : 1;
    const bank = clamp(-tilt * 3.1, -1.57, 1.57);
    const bridge = window.__ShotEmUp3D;
    const planeSize = 36 + (state.overdrive > 0 ? 4 : 0);
    const shieldRing = p.r;
    if (invulnActive && !state.settings.lowEndMode) {
      drawGlowCircle(p.x, p.y + bob, planeSize * 1.5, auraColor, 0.22, 22);
      drawGlowCircle(p.x, p.y + bob, planeSize * 0.95, '#e9f8ff', 0.12, 10);
    }
    if (p.shield > 0 && !state.settings.lowEndMode) {
      hudCtx.save();
      hudCtx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < p.shield; i++) {
        const ringR = shieldRing + i * 5;
        const a = (i === 0 ? 0.10 : 0.0625) * 1.25 * 1.25 * 1.25;
        const w = i === 0 ? 2.2 : 1.6;
        const blur = i === 0 ? 14 : 10;
        hudCtx.strokeStyle = 'rgba(48, 112, 255, ' + a + ')';
        hudCtx.lineWidth = w;
        hudCtx.shadowColor = 'rgba(48, 112, 255, ' + (a * 2.1) + ')';
        hudCtx.shadowBlur = blur;
        hudCtx.beginPath();
        hudCtx.arc(p.x, p.y + bob, ringR, 0, TAU);
        hudCtx.stroke();
      }
      hudCtx.restore();
    }
    if (bridge && bridge.enabled) {
      bridge.player = {
        x: p.x,
        y: p.y,
        bob: bob,
        rot: rot,
        tilt: tilt,
        bank: bank,
        alpha: flashAlpha,
        invuln: p.invuln,
        damage: clamp(1 - (p.health / Math.max(1, p.maxHealth)), 0, 1),
        visible: !respawning || p.respawnTimer < 0.98
      };
      return;
    }
    const damage = clamp(1 - (p.health / Math.max(1, p.maxHealth)), 0, 1);
    if (damage > 0.01) {
      const tex = getPlayerDamageTexture(planeSize, damage);
      pushSprite(tex, p.x, p.y + bob, planeSize * 2.1, planeSize * 2.1, rot, glow, flashAlpha, 4, false);
    } else {
      drawEmojiGlyph(E.plane, p.x, p.y + bob, planeSize, { rot: rot, alpha: flashAlpha, layer: 4, fill: glow, lighter: false });
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

  function getPlayerCrackTexture(size, variant) {
    const s = Math.max(12, Math.round(size));
    const planeSize = 36 + (state.overdrive > 0 ? 4 : 0);
    const key = 'playercrack|' + planeSize + '|' + s + '|' + (variant || 0);
    let tex = render.hudSprites.get(key);
    if (tex) return tex;
    const pad = Math.max(10, Math.round(s * 0.6));
    const dim = Math.max(32, Math.ceil(s * 2 + pad * 2));
    const c = makeDomCanvas(dim, dim);
    const g = c.getContext('2d');
    g.clearRect(0, 0, dim, dim);
    const crack = getHudCrackSprite(s, variant);
    g.drawImage(crack, (dim - crack.width) * 0.5, (dim - crack.height) * 0.5);
    g.globalCompositeOperation = 'destination-in';
    g.font = '900 ' + Math.round(planeSize * 2.05) + 'px ' + EMOJI_FONT;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#fff';
    g.fillText(E.plane, dim * 0.5, dim * 0.5 + Math.round(s * 0.03));
    tex = createTextureFromCanvas(c);
    render.hudSprites.set(key, tex);
    return tex;
  }

  function getPlayerDamageTexture(size, damage) {
    const planeSize = Math.max(16, Math.round(size));
    const stage = Math.max(1, Math.min(8, Math.ceil(damage * 8)));
    const key = 'playerdamage|' + planeSize + '|' + stage;
    let tex = render.hudSprites.get(key);
    if (tex) return tex;
    const pad = Math.max(10, Math.round(planeSize * 0.6));
    const dim = Math.max(32, Math.ceil(planeSize * 2 + pad * 2));
    const c = makeDomCanvas(dim, dim);
    const g = c.getContext('2d');
    g.clearRect(0, 0, dim, dim);
    g.font = '900 ' + Math.round(planeSize * 2.05) + 'px ' + EMOJI_FONT;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#fff';
    const centerY = dim * 0.5 + Math.round(planeSize * 0.03);
    g.fillText(E.plane, dim * 0.5, centerY);
    const anchors = [
      [-22, -12, 0],
      [-12, -14, 1],
      [-2, -15, 2],
      [10, -13, 3],
      [22, -10, 0],
      [-24, -3, 1],
      [-12, -3, 2],
      [0, -2, 3],
      [12, -3, 0],
      [24, -1, 1],
      [-20, 8, 2],
      [-8, 9, 3],
      [4, 8, 0],
      [16, 7, 1],
      [0, 12, 2],
      [18, 12, 3]
    ];
    const count = Math.min(anchors.length, 6 + stage * 2);
    const crackBase = 12 + stage * 2.1 + damage * 20;
    g.save();
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < count; i++) {
      const cr = anchors[i];
      const crackSize = crackBase + i * (1.2 + damage * 1.5);
      const crack = getHudCrackSprite(crackSize, cr[2]);
      g.drawImage(crack, Math.round(dim * 0.5 + cr[0] - crack.width * 0.5), Math.round(centerY + cr[1] - crack.height * 0.5));
    }
    g.restore();
    tex = createTextureFromCanvas(c);
    render.hudSprites.set(key, tex);
    return tex;
  }

  function pushEraseSprite(texture, x, y, size, rot, alpha, layer) {
    pushSprite(texture, x, y, size, size, rot || 0, '#ffffff', alpha == null ? 1 : alpha, layer || 0, false, true);
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
    hudCtx.font = scoreFont;
    const scoreW = hudCtx.measureText(scoreLine).width;
    hudCtx.font = detailFont;
    const detailW = hudCtx.measureText(detailLine).width;
    const contentW = Math.max(scoreW, detailW);
    const panelW = clamp(contentW + (compact ? 42 : 46), compact ? 240 : 290, Math.min(view.w - 24, compact ? 460 : 600));
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
      drawBar(12, bossBarY, view.w - 24, compact ? 12 : 14, state.boss.hp / state.boss.maxHp, theme.accent2, 'rgba(0,0,0,0.42)', 'BOSS ' + state.boss.name);
    }

    const powerRatio = state.overdrive > 0 ? state.overdrive / 7 : p.rapidTimer > 0 ? p.rapidTimer / 8 : p.magnetTimer > 0 ? p.magnetTimer / 12 : 0;
    if (powerRatio > 0) {
      const label = state.overdrive > 0 ? 'OVERDRIVE' : p.rapidTimer > 0 ? 'RAPID' : 'MAGNET';
      drawBar(view.w * 0.18, view.h - view.controlsH - 24, view.w * 0.64, 10, powerRatio, theme.accent2, 'rgba(0,0,0,0.35)', label);
    }

    if (state.paused) {
      hudCtx.fillStyle = 'rgba(0,0,0,0.28)';
      hudCtx.fillRect(0, 0, view.w, view.h);
      drawCenterCard('PAUSED', 'Press P or click PAUSE to resume.', ['The battle is frozen in place.'], theme.accent2, 'Hold FIRE when you are ready.');
    } else if (state.mode === 'gameover') {
      drawCenterCard('GAME OVER', state.bannerSub, ['Score: ' + format(state.score), 'Best: ' + format(state.highScore)], '#ff8b79', 'Click or press R to retry.');
    } else if (state.mode === 'victory') {
      drawCenterCard('VICTORY', state.bannerSub, ['Score: ' + format(state.score), 'Best: ' + format(state.highScore)], '#ffe78a', 'Click or press R to fly again.');
    }
    hudCtx.restore();
  }

  function drawTitle() {
    const theme = mainTheme();
    const pulse = 0.5 + Math.sin(state.musicStep * 0.4) * 0.5;
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
      const scale = Math.min(maxW / titleArt.naturalWidth, maxH / titleArt.naturalHeight);
      const dw = titleArt.naturalWidth * scale;
      const dh = titleArt.naturalHeight * scale;
      const ix = x + (cardW - dw) * 0.5;
      const iy = y + 16 + Math.max(0, (maxH - dh) * 0.5);
      hudCtx.shadowColor = theme.accent2;
      hudCtx.shadowBlur = 18;
      hudCtx.drawImage(titleArt, ix, iy, dw, dh);
      hudCtx.shadowBlur = 0;
    }
    hudCtx.fillStyle = '#fff';
    hudCtx.globalAlpha = 0.96;
    hudCtx.font = '800 15px "Trebuchet MS", "Segoe UI", sans-serif';
    hudCtx.fillText('Click or press Space to begin.', view.w * 0.5, y + cardH - 28);
    hudCtx.globalAlpha = 0.82;
    hudCtx.font = '700 12px "Trebuchet MS", "Segoe UI", sans-serif';
    hudCtx.fillText('Open SETTINGS for sound, music, and combat tuning.', view.w * 0.5, y + cardH - 48);
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

  function draw() {
    hudCtx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    hudCtx.clearRect(0, 0, view.w, view.h);
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
    if (state.mode === 'title') drawTitle();
    if (state.flash > 0) {
      drawSpriteRect(view.w * 0.5, view.h * 0.5, view.w, view.h, '#ffffff', state.flash * 0.3, 999, true);
    }
    flushRender();
    if (state.mode !== 'title' && state.mode !== 'debug') drawHud();
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
      if (down && (state.mode === 'title' || state.mode === 'gameover' || state.mode === 'victory')) startGame();
      state.input.fire = down;
      return;
    }
    if (act === 'bomb' && down) useBomb();
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
    if (ev.button != null && ev.button !== 0) return;
    ev.preventDefault();
    const pt = canvasPoint(ev);
    if (state.paused) togglePause(false);
    state.pointerActive = true;
    state.pointerId = ev.pointerId;
    state.pointerX = pt.x;
    state.pointerY = pt.y;
    state.input.fire = true;
    try { if (canvas.setPointerCapture) canvas.setPointerCapture(ev.pointerId); } catch (e) {}
  }

  function handleCanvasMove(ev) {
    if (!state.pointerActive || ev.pointerId !== state.pointerId) return;
    ev.preventDefault();
    const pt = canvasPoint(ev);
    state.pointerX = pt.x;
    state.pointerY = pt.y;
  }

  function handleCanvasUp(ev) {
    if (!state.pointerActive || ev.pointerId !== state.pointerId) return;
    ev.preventDefault();
    state.pointerActive = false;
    state.pointerId = null;
    state.input.fire = false;
    try { if (canvas.hasPointerCapture && ev.pointerId != null) canvas.releasePointerCapture(ev.pointerId); } catch (e) {}
  }

  function handleCanvasClick(ev) {
    if (ev.button != null && ev.button !== 0) return;
    ev.preventDefault();
    resumeAudio();
    if (ev.detail === 2) {
      if (state.mode === 'playing' && !state.paused) useBomb();
      return;
    }
    if (state.mode === 'title' || state.mode === 'gameover' || state.mode === 'victory') startGame();
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
    if (code === 'ArrowLeft' || code === 'ArrowRight' || code === 'ArrowUp' || code === 'ArrowDown' || code === 'KeyA' || code === 'KeyD' || code === 'KeyW' || code === 'KeyS' || code === 'Space' || code === 'KeyZ' || code === 'ControlLeft' || code === 'ControlRight' || code === 'Enter' || code === 'KeyX' || code === 'KeyB' || code === 'KeyP' || code === 'KeyM' || code === 'KeyR' || code === 'Escape' || code === 'KeyO') {
        ev.preventDefault();
        resumeAudio();
      }
    if (code === 'ArrowLeft' || code === 'KeyA') state.input.left = true;
    else if (code === 'ArrowRight' || code === 'KeyD') state.input.right = true;
    else if (code === 'ArrowUp' || code === 'KeyW') state.input.up = true;
    else if (code === 'ArrowDown' || code === 'KeyS') state.input.down = true;
      else if (code === 'ControlLeft' || code === 'ControlRight' || code === 'Enter') {
        if (state.mode === 'title' || state.mode === 'gameover' || state.mode === 'victory') startGame();
        else state.input.fire = true;
      } else if (code === 'Space') {
        if (state.mode === 'title' || state.mode === 'gameover' || state.mode === 'victory') startGame();
        else if (state.mode === 'playing' && !ev.repeat) useBomb();
      } else if (code === 'KeyZ') {
        if (state.mode === 'title' || state.mode === 'gameover' || state.mode === 'victory') startGame();
        else state.input.fire = true;
      } else if (code === 'KeyX' || code === 'KeyB') {
        if (!ev.repeat) useBomb();
      } else if (code === 'KeyP' || code === 'Escape') {
      if (!ev.repeat) togglePause();
    } else if (code === 'KeyM') {
      if (!ev.repeat) toggleMute();
    } else if (code === 'KeyR') {
      if (!ev.repeat) startGame();
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
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  window.__shotemup = {
    state: state,
    resumeAudio: resumeAudio,
    setBanner: setBanner,
    hint: hint,
    startGame: startGame,
    togglePause: togglePause,
    toggleMute: toggleMute
  };

  resize();
  resetRun();
  controlsEl.querySelectorAll('button[data-act]').forEach(function (button) {
    bindButton(button, button.getAttribute('data-act'));
  });
  settingsClose.addEventListener('click', function () {
    closeSettings();
  });
  settingsDialog.addEventListener('cancel', function (ev) {
    ev.preventDefault();
    closeSettings();
  });
  settingsDialog.addEventListener('click', function (ev) {
    if (ev.target === settingsDialog) closeSettings();
  });
  sfxVolumeInput.addEventListener('input', function (ev) {
    setVolume('sfx', ev.target.value);
  });
  musicVolumeInput.addEventListener('input', function (ev) {
    setVolume('music', ev.target.value);
  });
  if (loadAdvancedShipInput) {
    loadAdvancedShipInput.addEventListener('change', function (ev) {
      setAdvancedShipLoading(ev.target.checked);
    });
  }
  if (lowEndModeInput) {
    lowEndModeInput.addEventListener('change', function (ev) {
      setLowEndMode(ev.target.checked);
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
