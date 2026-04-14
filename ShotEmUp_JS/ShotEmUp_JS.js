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

  const view = { w: 0, h: 0, dpr: 1, controlsH: 118 };
  let currentDt = 0;
  const urlParams = new URLSearchParams(window.location.search || '');
  const DEBUG_MODE = urlParams.get('debug') === '1';
  const render = {
    ready: false,
    queue: [],
    normal: [],
    additive: [],
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

  function makeCanvas(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
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
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.35, 'rgba(255,255,255,0.96)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
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

  function pushSprite(texture, x, y, w, h, rot, color, alpha, layer, additive) {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h)) return;
    const item = {
      texture: texture,
      x: (x + render.offsetX) * view.dpr,
      y: (y + render.offsetY) * view.dpr,
      w: w * view.dpr,
      h: h * view.dpr,
      rot: rot || 0,
      color: colorArray(color, alpha),
      layer: layer || 0
    };
    (additive ? render.additive : render.normal).push(item);
  }

  function drawSpriteRect(x, y, w, h, color, alpha, layer, additive, rot) {
    pushSprite(render.white, x, y, w, h, rot || 0, color, alpha, layer, additive);
  }

  function drawSpriteCircle(x, y, r, color, alpha, layer, additive) {
    pushSprite(render.circle, x, y, r * 2, r * 2, 0, color, alpha, layer, additive);
  }

  function drawSpriteEmoji(text, x, y, size, opts) {
    const o = opts || {};
    const tex = getEmojiTexture(text, size);
    pushSprite(tex, x, y, size * 2.1, size * 2.1, o.rot || 0, o.fill || '#ffffff', o.alpha == null ? 1 : o.alpha, o.layer || 0, !!o.lighter);
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
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    render.normal.sort(function (a, b) { return a.layer - b.layer; });
    render.additive.sort(function (a, b) { return a.layer - b.layer; });
    function drawList(list, additive) {
      if (!list.length) return;
      gl.blendFunc(additive ? gl.ONE : gl.SRC_ALPHA, additive ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
      for (let i = 0; i < list.length; i++) {
        const s = list[i];
        const hw = s.w * 0.5;
        const hh = s.h * 0.5;
        const c = Math.cos(s.rot);
        const si = Math.sin(s.rot);
        const corners = [
          -hw, -hh, 0, 0,
          hw, -hh, 1, 0,
          hw, hh, 1, 1,
          -hw, -hh, 0, 0,
          hw, hh, 1, 1,
          -hw, hh, 0, 1
        ];
        const data = new Float32Array(6 * 8);
        for (let v = 0; v < 6; v++) {
          const ix = corners[v * 4];
          const iy = corners[v * 4 + 1];
          const u = corners[v * 4 + 2];
          const vv = corners[v * 4 + 3];
          const rx = s.x + ix * c - iy * si;
          const ry = s.y + ix * si + iy * c;
          data[v * 8] = rx;
          data[v * 8 + 1] = ry;
          data[v * 8 + 2] = u;
          data[v * 8 + 3] = vv;
          data[v * 8 + 4] = s.color[0];
          data[v * 8 + 5] = s.color[1];
          data[v * 8 + 6] = s.color[2];
          data[v * 8 + 7] = s.color[3];
        }
        gl.bindTexture(gl.TEXTURE_2D, s.texture || render.white);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
    }
    drawList(render.normal, false);
    drawList(render.additive, true);
    render.normal.length = 0;
    render.additive.length = 0;
  }

  function phase(dur, motion, attack) { return { dur: dur, motion: motion, attack: attack }; }
  function theme(cfg) { return cfg; }

  const THEMES = [
    theme({ name: 'Orchard Dawn', subtitle: 'Ripe Rampage', skyTop: '#142d47', skyBottom: '#ef9b59', glow: '#ffcf72', accent: '#ff8d42', accent2: '#ffd56a', icons: [E.apple, E.pear, E.cherry, E.leaf], forms: ['line', 'fan', 'rain'], enemyKinds: ['drifter', 'splitter', 'bomber'], atmosphere: 'leaves', music: { bpm: 112, root: 220, pattern: [0, 3, 5, 7, 10, 7, 5, 3] }, boss: { name: 'Lord Applecore', emoji: E.apple, hp: 160, color: '#ffb14a', phases: [phase(7, 'hover', 'aimed'), phase(7, 'sweep', 'rain'), phase(8, 'low', 'ring')] } }),
    theme({ name: 'Meadow Swarm', subtitle: 'Pollen Panic', skyTop: '#103a35', skyBottom: '#8fe470', glow: '#c8ff79', accent: '#54f08b', accent2: '#ffe88b', icons: [E.bee, E.ladybug, E.butterfly, E.seed], forms: ['swarm', 'pair', 'arc'], enemyKinds: ['zigzag', 'swarm', 'sniper'], atmosphere: 'pollen', music: { bpm: 126, root: 246, pattern: [0, 2, 4, 7, 9, 7, 4, 2] }, boss: { name: 'Queen Bumbleheart', emoji: E.bee, hp: 176, color: '#ffd85b', phases: [phase(7, 'hover', 'fan'), phase(7.5, 'sweep', 'summon'), phase(8, 'low', 'ring')] } }),
    theme({ name: 'Candy Cloudburst', subtitle: 'Sugar Rush', skyTop: '#4a2c6d', skyBottom: '#ff89d7', glow: '#ff76be', accent: '#ff76be', accent2: '#ffd96a', icons: [E.lollipop, E.donut, E.cookie, E.chocolate], forms: ['fan', 'rain', 'cross'], enemyKinds: ['drifter', 'zigzag', 'bomber'], atmosphere: 'sprinkles', music: { bpm: 136, root: 262, pattern: [0, 4, 7, 12, 7, 4, 5, 9] }, boss: { name: 'Baron Sugarpill', emoji: E.donut, hp: 188, color: '#ff97e0', phases: [phase(7, 'hover', 'fan'), phase(7, 'sweep', 'ring'), phase(8, 'low', 'rain')] } }),
    theme({ name: 'Clockwork Junkyard', subtitle: 'Scrap Storm', skyTop: '#19212d', skyBottom: '#8b6a4f', glow: '#92d0ff', accent: '#c7d5e8', accent2: '#d7a15e', icons: [E.gear, E.battery, E.wrench, E.rocket], forms: ['line', 'pair', 'cross'], enemyKinds: ['zigzag', 'sniper', 'bomber'], atmosphere: 'sparks', music: { bpm: 118, root: 196, pattern: [0, 0, 7, 5, 4, 5, 7, 10] }, boss: { name: 'Scrap Titan', emoji: E.gear, hp: 200, color: '#d7c3a6', phases: [phase(7, 'sweep', 'ring'), phase(7.5, 'hover', 'summon'), phase(8, 'dash', 'fan')] } }),
    theme({ name: 'Lantern Marsh', subtitle: 'Glow Tide', skyTop: '#081722', skyBottom: '#8a4658', glow: '#ffcc7b', accent: '#ffd27d', accent2: '#ff8d6b', icons: [E.lantern, E.ghost, E.sparkles, E.star], forms: ['rain', 'arc', 'swarm'], enemyKinds: ['drifter', 'sniper', 'spinner'], atmosphere: 'motes', music: { bpm: 108, root: 196, pattern: [0, 5, 7, 10, 7, 5, 3, 5] }, boss: { name: 'Wisp Captain', emoji: E.lantern, hp: 204, color: '#ffcb82', phases: [phase(7, 'hover', 'aimed'), phase(7.5, 'sweep', 'beam'), phase(8, 'low', 'ring')] } }),
    theme({ name: 'Hive Furnace', subtitle: 'Sting Chorus', skyTop: '#2b1010', skyBottom: '#ffad41', glow: '#ffdf6c', accent: '#ff9d1f', accent2: '#ffd05c', icons: [E.bee, E.honey, E.fire, E.bolt], forms: ['swarm', 'fan', 'pair'], enemyKinds: ['diver', 'swarm', 'sniper'], atmosphere: 'embers', music: { bpm: 132, root: 246, pattern: [0, 2, 3, 7, 10, 7, 3, 2] }, boss: { name: 'Matriarch Stinger', emoji: E.bee, hp: 216, color: '#ffd959', phases: [phase(7, 'hover', 'fan'), phase(7.5, 'sweep', 'summon'), phase(8, 'dash', 'rain')] } }),
    theme({ name: 'Crystal Gorge', subtitle: 'Shard Waltz', skyTop: '#09152f', skyBottom: '#35c8ff', glow: '#a0f7ff', accent: '#a0f7ff', accent2: '#c4b1ff', icons: [E.crystal, E.gem, E.star, E.moon], forms: ['ring', 'line', 'arc'], enemyKinds: ['spinner', 'sniper', 'drifter'], atmosphere: 'shards', music: { bpm: 120, root: 233, pattern: [0, 4, 7, 11, 7, 4, 9, 7] }, boss: { name: 'Shard Seraph', emoji: E.gem, hp: 228, color: '#d7f8ff', phases: [phase(7, 'hover', 'fan'), phase(7.5, 'sweep', 'ring'), phase(8, 'low', 'beam')] } }),
    theme({ name: 'Volcano Kitchen', subtitle: 'Lava Ladle', skyTop: '#210909', skyBottom: '#ff5a2c', glow: '#ff9b2f', accent: '#ff9b2f', accent2: '#ffd06b', icons: [E.fire, E.pepper, E.honey, E.sparkles], forms: ['rain', 'line', 'swarm'], enemyKinds: ['bomber', 'diver', 'splitter'], atmosphere: 'embers', music: { bpm: 140, root: 220, pattern: [0, 3, 7, 10, 7, 3, 5, 10] }, boss: { name: 'Chef Magma', emoji: E.fire, hp: 240, color: '#ffb04f', phases: [phase(7, 'hover', 'rain'), phase(7.5, 'sweep', 'beam'), phase(8, 'low', 'wall')] } }),
    theme({ name: 'Moon Arcade', subtitle: 'Low Gravity Glitch', skyTop: '#08101f', skyBottom: '#34466d', glow: '#7cf7ff', accent: '#cfd8ff', accent2: '#7cf7ff', icons: [E.moon, E.star, E.rocket, E.comet], forms: ['line', 'wave', 'pair'], enemyKinds: ['drifter', 'zigzag', 'mine'], atmosphere: 'stardust', music: { bpm: 106, root: 185, pattern: [0, 7, 12, 7, 10, 7, 5, 3] }, boss: { name: 'Lunar Jack', emoji: E.moon, hp: 252, color: '#d8e0ff', phases: [phase(7, 'hover', 'summon'), phase(7.5, 'sweep', 'beam'), phase(8, 'dash', 'ring')] } }),
    theme({ name: 'Neon Boulevard', subtitle: 'Laser Parade', skyTop: '#081120', skyBottom: '#311d78', glow: '#7cf7ff', accent: '#63f3ff', accent2: '#ff7bee', icons: [E.bolt, E.sparkles, E.disc, E.target], forms: ['wave', 'cross', 'pair'], enemyKinds: ['zigzag', 'sniper', 'bomber'], atmosphere: 'neon', music: { bpm: 144, root: 220, pattern: [0, 7, 12, 10, 7, 4, 9, 12] }, boss: { name: 'Neon Warden', emoji: E.bolt, hp: 264, color: '#7cf7ff', phases: [phase(7, 'sweep', 'wall'), phase(7.5, 'hover', 'aimed'), phase(8, 'dash', 'ring')] } }),
    theme({ name: 'Chessboard Citadel', subtitle: 'Knight Raid', skyTop: '#0b0d16', skyBottom: '#5e5a73', glow: '#eef0ff', accent: '#d8d8e8', accent2: '#bca46b', icons: [E.knight, E.rook, E.bishop, E.queen], forms: ['line', 'cross', 'wave'], enemyKinds: ['zigzag', 'sniper', 'elite'], atmosphere: 'chess', music: { bpm: 122, root: 196, pattern: [0, 3, 7, 10, 7, 3, 5, 7] }, boss: { name: 'Grandmaster Queen', emoji: E.queen, hp: 288, color: '#f0f0ff', phases: [phase(7, 'hover', 'aimed'), phase(7.5, 'sweep', 'summon'), phase(8, 'dash', 'ring')] } }),
    theme({ name: 'Storm Citadel', subtitle: 'Thunder March', skyTop: '#0d1a26', skyBottom: '#4d6eff', glow: '#d0f3ff', accent: '#8ecbff', accent2: '#d0f3ff', icons: [E.cloud, E.rain, E.bolt, E.star], forms: ['rain', 'line', 'swarm'], enemyKinds: ['diver', 'sniper', 'spinner'], atmosphere: 'rain', music: { bpm: 128, root: 196, pattern: [0, 4, 7, 10, 7, 4, 2, 5] }, boss: { name: 'Thunder Duke', emoji: E.cloud, hp: 276, color: '#c7efff', phases: [phase(7, 'hover', 'fan'), phase(7.5, 'sweep', 'rain'), phase(8, 'low', 'ring')] } }),
    theme({ name: 'Star Crown', subtitle: 'Final Ascension', skyTop: '#10081f', skyBottom: '#ffbf4d', glow: '#ffe78a', accent: '#ffe78a', accent2: '#ffffff', icons: [E.sun, E.crown, E.star, E.comet], forms: ['ring', 'fan', 'wave'], enemyKinds: ['elite', 'sniper', 'spinner'], atmosphere: 'nova', music: { bpm: 152, root: 262, pattern: [0, 4, 7, 12, 15, 12, 7, 4] }, boss: { name: 'Sun King', emoji: E.sun, hp: 320, color: '#fff2b0', phases: [phase(6.5, 'hover', 'aimed'), phase(6.5, 'sweep', 'ring'), phase(6.5, 'dash', 'beam'), phase(7.5, 'low', 'wall')] } })
  ];

  const WEAPONS = [
    { name: 'DART', color: '#bffaff' },
    { name: 'TWIN', color: '#9df0ff' },
    { name: 'FAN', color: '#ffe48f' },
    { name: 'ROCKET', color: '#ffa66f' },
    { name: 'BEAM', color: '#f7ffff' }
  ];

  const PICKUPS = {
    weapon: { emoji: E.wrench, color: '#bffaff' },
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
    { label: 'Easy', lives: 5, enemyHp: 0.82, enemySpeed: 0.88, spawnRate: 0.82, spawnCount: 0.5, bulletSpeed: 0.88, bossHp: 0.84, contact: 0.9 },
    { label: 'Normal', lives: 3, enemyHp: 1, enemySpeed: 1, spawnRate: 1, spawnCount: 0.75, bulletSpeed: 1, bossHp: 1, contact: 1 },
    { label: 'Hard', lives: 2, enemyHp: 1.18, enemySpeed: 1.12, spawnRate: 1.16, spawnCount: 1.18, bulletSpeed: 1.14, bossHp: 1.2, contact: 1.12 }
  ];

  const SHOT_PACE = 1.25;

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
      sfxVolume: clamp(loadNum('ShotEmUp_JS_sfxVolume', 0.84), 0, 1),
      musicVolume: clamp(loadNum('ShotEmUp_JS_musicVolume', 0.4), 0, 1),
      difficulty: clamp(Math.round(loadNum('ShotEmUp_JS_difficulty', 1)), 0, 2)
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
    levelClock: 0,
    background: [],
    enemies: [],
    bullets: [],
    enemyBullets: [],
    pickups: [],
    particles: [],
    boss: null,
    currentTheme: THEMES[0],
    transition: null,
    player: {
      x: 0, y: 0, r: 16,
      health: 6, maxHealth: 6,
      shield: 0, bombs: 2,
      weaponMode: 0, weaponTier: 1,
      fireCooldown: 0, rapidTimer: 0, magnetTimer: 0,
      invuln: 0, fireHeld: false, pointerMode: false
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

  const audio = {
    ctx: null,
    master: null,
    sfx: null,
    music: null,
    noise: null,
    enabled: false
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
    if (ctxAudio.state === 'suspended') ctxAudio.resume().catch(function () {});
    audio.enabled = true;
    applyMute();
  }

  function applyMute() {
    if (!audio.master) return;
    audio.master.gain.value = 0.92;
    audio.sfx.gain.value = state.muted ? 0 : state.settings.sfxVolume;
    audio.music.gain.value = state.muted ? 0 : state.settings.musicVolume;
  }

  function tone(opts) {
    const ctxAudio = ensureAudio();
    if (!ctxAudio || state.muted) return;
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
    const ctxAudio = ensureAudio();
    if (!ctxAudio || state.muted) return;
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
    else if (name === 'hit') tone({ freq: 210, endFreq: 135, dur: 0.08, gain: 0.08, type: 'square' });
    else if (name === 'boom') { noise({ dur: 0.22, gain: 0.14, cutoff: 780, q: 0.7 }); tone({ freq: 160, endFreq: 58, dur: 0.24, gain: 0.14, type: 'sawtooth' }); }
    else if (name === 'power') { tone({ freq: 440, endFreq: 660, dur: 0.08, gain: 0.06, type: 'triangle', pan: -0.12 }); tone({ freq: 660, endFreq: 990, dur: 0.08, gain: 0.05, type: 'triangle', pan: 0.12 }); tone({ freq: 880, endFreq: 1320, dur: 0.1, gain: 0.04, type: 'sine' }); }
    else if (name === 'bomb') { noise({ dur: 0.32, gain: 0.16, cutoff: 420, q: 0.8 }); tone({ freq: 88, endFreq: 38, dur: 0.32, gain: 0.18, type: 'sawtooth' }); }
    else if (name === 'boss') { tone({ freq: 130, endFreq: 72, dur: 0.5, gain: 0.16, type: 'sawtooth' }); noise({ dur: 0.34, gain: 0.11, cutoff: 520, q: 0.8 }); }
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
  }

  function syncSettingsUi() {
    if (sfxVolumeInput) sfxVolumeInput.value = String(state.settings.sfxVolume);
    if (musicVolumeInput) musicVolumeInput.value = String(state.settings.musicVolume);
    if (sfxVolumeValue) sfxVolumeValue.textContent = Math.round(state.settings.sfxVolume * 100) + '%';
    if (musicVolumeValue) musicVolumeValue.textContent = Math.round(state.settings.musicVolume * 100) + '%';
    if (difficultyValue) difficultyValue.textContent = currentDifficulty().label;
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

  function openSettings() {
    if (state.settingsOpen) return;
    resumeAudio();
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
      state.player.x = clamp(state.player.x || w * 0.5, a.left, a.right);
      state.player.y = clamp(state.player.y || a.bottom - 92, a.top, a.bottom);
    }
  }

  function clearArray(a) { a.length = 0; }
  function mainTheme() { return state.currentTheme || THEMES[0]; }

  function regenBackground(theme) {
    const items = [];
    const count = Math.max(26, Math.floor((view.w * view.h) / 22000));
    for (let i = 0; i < count; i++) {
      const isEmoji = chance(0.6);
      items.push({
        kind: isEmoji ? 'emoji' : 'dot',
        emoji: isEmoji ? pick(theme.icons) : E.sparkles,
        x: rand(0, view.w),
        y: rand(0, view.h),
        vx: rand(-4, 4),
        vy: rand(8, 24),
        size: rand(10, 28),
        alpha: rand(0.08, 0.34),
        wobble: rand(0, TAU),
        spin: rand(0, TAU),
        r: rand(1.2, 4.2),
        color: theme.accent
      });
    }
    state.background = items;
  }

  function setupDebugScene() {
    const theme = THEMES[1] || THEMES[0];
    state.currentTheme = theme;
    state.levelIndex = 1;
    state.mode = 'debug';
    state.paused = false;
    state.banner = 'DEBUG SCENE';
    state.bannerSub = 'Fixed enemies for render comparison.';
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
    state.background = [];
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
        emoji: pick(theme.icons),
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
  }

  function resetPlayer() {
    const a = playArea();
    const p = state.player;
    p.x = view.w * 0.5;
    p.y = a.bottom - 92;
    p.health = p.maxHealth;
    p.shield = 1;
    p.bombs = 2;
    p.weaponMode = 0;
    p.weaponTier = 1;
    p.fireCooldown = 0;
    p.rapidTimer = 0;
    p.magnetTimer = 0;
    p.invuln = 0;
    p.fireHeld = false;
    p.pointerMode = false;
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
      setBanner('SHOT EM UP', 'Tap or press Space to start.', 3.5);
      hint('Drag to fly. Hold to fire. Tap SETTINGS for sound, music, and difficulty.', 5);
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
    resumeAudio();
  }

  function beginLevel(index) {
    state.levelIndex = index;
    state.currentTheme = THEMES[index];
    clearArray(state.enemies);
    clearArray(state.bullets);
    clearArray(state.enemyBullets);
    clearArray(state.pickups);
    state.boss = null;
    state.waveClock = 0;
    state.levelClock = 0;
    state.transition = null;
    regenBackground(state.currentTheme);
    if (index === 0) {
      state.player.x = view.w * 0.5;
      state.player.y = playArea().bottom - 92;
    } else {
      state.player.health = Math.min(state.player.maxHealth, state.player.health + 1);
      state.player.bombs = Math.min(4, state.player.bombs + 1);
    }
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
    hint('Victory! Tap or press R to fly again.', 6);
    saveBest();
  }

  function gameOver() {
    state.mode = 'gameover';
    state.banner = 'GAME OVER';
    state.bannerSub = 'The paper plane needs a rematch.';
    state.bannerTimer = 999;
    state.flash = 0.25;
    state.shake = 18;
    hint('Game over. Tap or press R to restart.', 6);
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
    state.pickups.push({
      type: type, x: x, y: y, vx: opts && opts.vx != null ? opts.vx : rand(-12, 12), vy: opts && opts.vy != null ? opts.vy : rand(36, 58),
      r: 18, life: 12, color: info.color, emoji: info.emoji, bob: rand(0, TAU), spin: rand(0, TAU)
    });
  }

  function choosePickup() {
    const list = [
      { type: 'weapon', w: 3 },
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

  function maybeDropPickup(x, y, elite, forceType) {
    const p = elite ? 0.72 : 0.16 + state.levelIndex * 0.01;
    if (forceType || Math.random() < p) spawnPickup(forceType || choosePickup(), x, y);
  }

  function spawnEnemy(kind, x, y, opts) {
    const t = state.currentTheme;
    const d = ENEMIES[kind] || ENEMIES.drifter;
    const scale = 1 + state.levelIndex * 0.08;
    const diff = currentDifficulty();
    const speedScale = diff.enemySpeed;
    const fireScale = SHOT_PACE / diff.spawnRate;
    const e = {
      kind: kind, theme: t, x: x, y: y,
      vx: (opts && opts.vx != null ? opts.vx : rand(-18, 18)) * speedScale,
      vy: (opts && opts.vy != null ? opts.vy : d.speed * scale) * speedScale,
      hp: Math.max(1, Math.round((opts && opts.hp != null ? opts.hp : d.hp) * scale * diff.enemyHp)),
      maxHp: Math.max(1, Math.round((opts && opts.hp != null ? opts.hp : d.hp) * scale * diff.enemyHp)),
      r: d.r, score: Math.round((opts && opts.score != null ? opts.score : d.score) * scale),
      emoji: pick(t.icons), fireCooldown: rand(0.8, 1.8) * fireScale, age: 0, wobble: rand(0, TAU), dir: chance(0.5) ? 1 : -1,
      shotSeed: rand(0, TAU), elite: !!(opts && opts.elite), dead: false, hitFlash: 0
    };
    if (kind === 'elite') { e.hp = Math.round(9 * scale * diff.enemyHp); e.maxHp = e.hp; e.score = Math.round(340 * scale); e.r = 24; }
    state.enemies.push(e);
    sfx('hit');
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
      fireClock: 0, motionClock: 0, state: {}, hitFlash: 0, dead: false
    };
    state.banner = 'BOSS: ' + b.name;
    state.bannerSub = theme.subtitle;
    state.bannerTimer = 3.2;
    sfx('boss');
    flashBurst(state.boss.x, state.boss.y, state.boss.color);
    hint('Boss fight! Stay low, weave, and burn it down.', 3.6);
  }

  function spawnWave(theme) {
    const form = theme.forms[(state.levelIndex + ((state.levelClock / 4) | 0) + ((state.waveClock * 2) | 0)) % theme.forms.length];
    const diff = currentDifficulty();
    const count = clamp(Math.round((2 + Math.floor(state.levelIndex / 2) + randi(0, 2)) * diff.spawnCount), 2, 9);
    const margin = 42, top = -34, mid = (count - 1) * 0.5;
    let i;
    if (form === 'line') {
      for (i = 0; i < count; i++) spawnEnemy(pick(theme.enemyKinds), lerp(margin, view.w - margin, count === 1 ? 0.5 : i / (count - 1)), top - i * 8, { vy: rand(80, 110) });
    } else if (form === 'fan') {
      for (i = 0; i < count; i++) spawnEnemy(pick(theme.enemyKinds), view.w * 0.5 + (i - mid) * 82, top - i * 10, { vx: (i - mid) * 20, vy: rand(92, 126) });
    } else if (form === 'rain') {
      for (i = 0; i < count; i++) spawnEnemy(pick(theme.enemyKinds), rand(margin, view.w - margin), top - i * 14, { vx: rand(-26, 26), vy: rand(94, 132) });
    } else if (form === 'pair') {
      for (i = 0; i < count; i++) { const y = top - i * 12; spawnEnemy(pick(theme.enemyKinds), margin + i * 24, y, { vx: rand(22, 52), vy: rand(92, 118) }); spawnEnemy(pick(theme.enemyKinds), view.w - margin - i * 24, y, { vx: -rand(22, 52), vy: rand(92, 118) }); }
    } else if (form === 'arc') {
      for (i = 0; i < count; i++) { const t = count === 1 ? 0.5 : i / (count - 1), a = lerp(Math.PI * 0.2, Math.PI * 0.8, t); spawnEnemy(pick(theme.enemyKinds), view.w * 0.5 + Math.cos(a) * 160, top + Math.sin(a) * 60, { vx: Math.cos(a) * 20, vy: rand(92, 118) }); }
    } else if (form === 'swarm') {
      for (i = 0; i < count + 1; i++) spawnEnemy(pick(theme.enemyKinds), rand(margin, view.w - margin), top - i * 8, { vx: rand(-56, 56), vy: rand(112, 148) });
    } else if (form === 'cross') {
      for (i = 0; i < count; i++) { const y = top - i * 10; spawnEnemy(pick(theme.enemyKinds), margin + i * 40, y, { vx: rand(25, 48), vy: rand(86, 118) }); spawnEnemy(pick(theme.enemyKinds), view.w * 0.5, y - 20, { vx: rand(-22, 22), vy: rand(78, 108) }); }
    } else if (form === 'ring') {
      const cx = view.w * 0.5, cy = 16;
      for (i = 0; i < count; i++) { const a = TAU * i / count - Math.PI * 0.5; spawnEnemy(pick(theme.enemyKinds), cx + Math.cos(a) * 150, cy + Math.sin(a) * 26, { vx: Math.cos(a) * 22, vy: rand(88, 118) }); }
    } else if (form === 'wave') {
      for (i = 0; i < count; i++) { const t = count === 1 ? 0.5 : i / (count - 1), x = lerp(margin, view.w - margin, t), y = top + Math.sin((state.levelClock * 1.4) + i) * 28; spawnEnemy(pick(theme.enemyKinds), x, y, { vx: Math.sin(i) * 26, vy: rand(90, 124) }); }
    } else {
      for (i = 0; i < count; i++) spawnEnemy(pick(theme.enemyKinds), rand(margin, view.w - margin), rand(-80, -20), { vx: rand(-48, 48), vy: rand(84, 128) });
    }
    if (state.levelIndex >= 4 && chance(0.18 * diff.spawnCount)) spawnEnemy('elite', rand(margin, view.w - margin), top - 40, { vx: rand(-22, 22), vy: rand(82, 102), elite: true });
  }

  function weaponDelay() {
    const p = state.player;
    const base = [0.14, 0.15, 0.18, 0.24, 0.3][p.weaponMode] || 0.18;
    let d = base - (p.weaponTier - 1) * 0.015;
    if (p.rapidTimer > 0) d *= 0.54;
    if (state.overdrive > 0) d *= 0.76;
    return clamp(d * SHOT_PACE, 0.05, 0.42);
  }

  function fireWeapon() {
    const p = state.player;
    const mode = p.weaponMode;
    const tier = p.weaponTier + (state.overdrive > 0 ? 1 : 0);
    const x = p.x, y = p.y - 18;
    const color = state.overdrive > 0 ? '#ffe38c' : WEAPONS[mode].color;
    const dmg = 1 + tier;
    if (mode === 0) {
      spawnBullet('player', x, y, 0, -820, { r: 6, color: color, damage: dmg, kind: 'dart', life: 3.8 });
      if (tier >= 2) { spawnBullet('player', x - 10, y + 4, -52, -792, { r: 5, color: color, damage: dmg, kind: 'dart', life: 3.8 }); spawnBullet('player', x + 10, y + 4, 52, -792, { r: 5, color: color, damage: dmg, kind: 'dart', life: 3.8 }); }
      if (tier >= 3) spawnBullet('player', x, y - 10, 0, -900, { r: 7, color: '#efffff', damage: dmg + 1, kind: 'dart', pierce: 1, life: 3.4 });
      sfx('shoot');
    } else if (mode === 1) {
      spawnBullet('player', x - 11, y, -40, -820, { r: 6, color: color, damage: dmg, kind: 'dart', life: 3.8 });
      spawnBullet('player', x + 11, y, 40, -820, { r: 6, color: color, damage: dmg, kind: 'dart', life: 3.8 });
      if (tier >= 2) spawnBullet('player', x, y - 6, 0, -880, { r: 5, color: '#fff', damage: dmg, kind: 'dart', pierce: 1, life: 3.6 });
      if (tier >= 3) { spawnBullet('player', x - 20, y + 2, -62, -802, { r: 5, color: color, damage: dmg, kind: 'dart', life: 3.6 }); spawnBullet('player', x + 20, y + 2, 62, -802, { r: 5, color: color, damage: dmg, kind: 'dart', life: 3.6 }); }
      sfx('fan');
    } else if (mode === 2) {
      const spread = tier >= 3 ? 0.42 : tier >= 2 ? 0.30 : 0.20;
      const shots = tier >= 3 ? 5 : 3;
      for (let i = 0; i < shots; i++) { const t = shots === 1 ? 0.5 : i / (shots - 1), a = lerp(-spread, spread, t) - Math.PI * 0.5; spawnBullet('player', x + Math.cos(a) * 2, y + Math.sin(a) * 2, Math.cos(a) * 804, Math.sin(a) * 804, { r: 6, color: color, damage: dmg, kind: 'dart', life: 3.5 }); }
      if (tier >= 2) spawnBullet('player', x, y - 8, 0, -940, { r: 5, color: '#fff', damage: dmg, kind: 'dart', pierce: 1, life: 3.1 });
      sfx('fan');
    } else if (mode === 3) {
      spawnBullet('player', x, y - 16, rand(-36, 36), -700, { r: 8, color: color, damage: dmg + 1, kind: 'rocket', pierce: 1, life: 4.6, homing: tier >= 2 ? 0.85 : 0.4, turn: 4.5 });
      if (tier >= 2) {
        spawnBullet('player', x - 12, y - 12, -48, -685, { r: 7, color: '#ffcf87', damage: dmg, kind: 'rocket', pierce: 1, life: 4.6, homing: 0.35, turn: 4.2 });
        spawnBullet('player', x + 12, y - 12, 48, -685, { r: 7, color: '#ffcf87', damage: dmg, kind: 'rocket', pierce: 1, life: 4.6, homing: 0.35, turn: 4.2 });
      }
      sfx('rocket');
    } else {
      spawnBullet('player', x, y - 18, 0, -1180, { r: 10, color: color, damage: dmg + 1, kind: 'beam', pierce: 4 + tier, life: 2.2 });
      if (tier >= 2) {
        spawnBullet('player', x - 16, y - 14, -12, -1080, { r: 8, color: '#f8ffff', damage: dmg, kind: 'beam', pierce: 3 + tier, life: 2.0 });
        spawnBullet('player', x + 16, y - 14, 12, -1080, { r: 8, color: '#f8ffff', damage: dmg, kind: 'beam', pierce: 3 + tier, life: 2.0 });
      }
      sfx('beam');
    }
    p.fireCooldown = weaponDelay();
  }

  function activateOverdrive() {
    if (state.overdrive > 0) return;
    state.overdrive = 7;
    state.banner = 'OVERDRIVE';
    state.bannerSub = 'Epic mode engaged.';
    state.bannerTimer = 1.7;
    state.flash = Math.max(state.flash, 0.25);
    sfx('overdrive');
    hint('OVERDRIVE! The plane is blazing.', 2.4);
  }

  function collectPickup(type) {
    const p = state.player;
    if (type === 'weapon') {
      p.weaponTier++;
      if (p.weaponTier > 3) { p.weaponTier = 1; p.weaponMode = (p.weaponMode + 1) % WEAPONS.length; }
      state.banner = WEAPONS[p.weaponMode].name + ' ' + ['I', 'II', 'III'][p.weaponTier - 1];
      state.bannerSub = 'Weapon upgraded.';
    } else if (type === 'rapid') {
      p.rapidTimer = Math.max(p.rapidTimer, 8);
      state.banner = 'RAPID FIRE';
      state.bannerSub = 'The jet rattles harder.';
    } else if (type === 'shield') {
      p.shield = Math.min(3, p.shield + 1);
      state.banner = 'SHIELD UP';
      state.bannerSub = 'A bright hull wraps around the plane.';
      sfx('power');
    } else if (type === 'bomb') {
      p.bombs = Math.min(4, p.bombs + 1);
      state.banner = 'BOMB +1';
      state.bannerSub = 'Emergency button restocked.';
      sfx('power');
    } else if (type === 'magnet') {
      p.magnetTimer = Math.max(p.magnetTimer, 12);
      state.banner = 'MAGNET FIELD';
      state.bannerSub = 'Pickups drift to the plane.';
      sfx('power');
    } else {
      addScore(500);
      state.banner = 'GEM SCORE';
      state.bannerSub = 'Pure bonus juice.';
      sfx('power');
    }
    state.bannerTimer = 1.15;
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
      state.combo++;
      state.comboTimer = 2.4;
      if (state.combo % 5 === 0) sfx('combo');
      if (state.combo >= 18) { state.combo = 0; activateOverdrive(); }
      if (e.kind === 'splitter') { spawnEnemy('drifter', e.x - 18, e.y, { vx: rand(-26, 26), vy: rand(104, 138) }); spawnEnemy('drifter', e.x + 18, e.y, { vx: rand(-26, 26), vy: rand(104, 138) }); }
      if (e.kind === 'spinner') ringBullets(e.x, e.y, 10, 180, 1, e.theme.accent2, 'enemy');
      if (e.kind === 'elite' || e.score > 200) maybeDropPickup(e.x, e.y, true, chance(0.35) ? 'shield' : null);
      else if (!fromBomb) maybeDropPickup(e.x, e.y, false);
    } else {
      sfx('hit');
    }
  }

  function damageBoss(b, damage, fromBomb) {
    if (!b || b.dead) return;
    b.hp -= damage;
    b.hitFlash = 0.12;
    burst(b.x, b.y, b.color, 8 + Math.min(14, damage), 190 + damage * 15, 7, 'spark');
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
    if (p.shield > 0) {
      p.shield--;
      p.invuln = 0.6;
      state.flash = Math.max(state.flash, 0.1);
      burst(p.x, p.y, '#8fd8ff', 16, 220, 5, 'spark');
      sfx('power');
      return;
    }
    p.health -= damage;
    p.invuln = 1.6;
    state.shake = Math.max(state.shake, 10);
    state.flash = Math.max(state.flash, 0.12);
    sfx('damage');
    burst(p.x, p.y, '#ffd96a', 16, 200, 5, 'spark');
    if (p.health <= 0) {
      state.lives--;
      if (state.lives <= 0) return gameOver();
      p.health = p.maxHealth;
      p.shield = Math.max(0, p.shield - 1);
      p.bombs = Math.max(0, p.bombs - 1);
      p.weaponTier = Math.max(1, p.weaponTier - 1);
      p.rapidTimer = 0;
      state.combo = 0;
      state.comboTimer = 0;
      state.overdrive = 0;
      state.banner = 'SHIP LOST';
      state.bannerSub = 'Rescue plane incoming.';
      state.bannerTimer = 1.5;
      p.x = view.w * 0.5;
      p.y = playArea().bottom - 92;
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
    b.x = smooth(b.x, clamp(tx, 88, view.w - 88), 2.8, dt);
    b.y = smooth(b.y, clamp(ty, 88, a.bottom - 260), 2.1, dt);
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
    p.invuln = Math.max(0, p.invuln - dt);
    p.rapidTimer = Math.max(0, p.rapidTimer - dt);
    p.magnetTimer = Math.max(0, p.magnetTimer - dt);
    if (state.comboTimer > 0) {
      state.comboTimer -= dt;
      if (state.comboTimer <= 0) state.combo = 0;
    }
    if (state.overdrive > 0) state.overdrive = Math.max(0, state.overdrive - dt);
    if (state.bannerTimer > 0) state.bannerTimer = Math.max(0, state.bannerTimer - dt);

    const a = playArea();
    if (state.pointerActive) {
      p.pointerMode = true;
      p.fireHeld = true;
      p.x = smooth(p.x, clamp(state.pointerX, a.left, a.right), 7.5, dt);
      p.y = smooth(p.y, clamp(state.pointerY, a.top + 10, a.bottom - 10), 7.5, dt);
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
    if (state.mode === 'playing' && p.fireHeld && p.fireCooldown <= 0) fireWeapon();
  }

  function updateBullets(dt) {
    const p = state.player;
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const b = state.bullets[i];
      b.age += dt;
      if (b.homing > 0 && state.boss) {
        const ta = ang(b.x, b.y, state.boss.x, state.boss.y);
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
      if (b.life <= 0 || b.x < -60 || b.x > view.w + 60 || b.y < -80 || b.y > view.h + 80) { state.bullets.splice(i, 1); continue; }
      if (state.boss && d2(b.x, b.y, state.boss.x, state.boss.y) < (b.r + state.boss.r) * (b.r + state.boss.r)) {
        damageBoss(state.boss, b.damage, false);
        if (b.pierce > 0) { b.pierce--; b.life -= 0.3; } else { state.bullets.splice(i, 1); continue; }
      }
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const e = state.enemies[j];
        if (d2(b.x, b.y, e.x, e.y) < (b.r + e.r) * (b.r + e.r)) {
          damageEnemy(e, b.damage, false);
          if (b.pierce > 0) { b.pierce--; b.life -= 0.18; } else { state.bullets.splice(i, 1); break; }
        }
      }
    }
    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
      const b = state.enemyBullets[i];
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
      e.age += dt;
      e.fireCooldown -= dt;
      if (e.hitFlash > 0) e.hitFlash -= dt;
      if (e.kind === 'drifter') {
        e.y += e.vy * dt;
        e.x += Math.sin(e.age * 3 + e.wobble) * 18 * dt;
      } else if (e.kind === 'zigzag') {
        e.y += e.vy * dt;
        e.x += e.dir * (e.vx || 60) * dt;
        if (e.x < a.left || e.x > a.right) { e.dir *= -1; e.x = clamp(e.x, a.left, a.right); }
      } else if (e.kind === 'swarm') {
        e.y += e.vy * dt;
        e.x += Math.sin(e.age * 6 + e.wobble) * 46 * dt;
      } else if (e.kind === 'bomber') {
        e.y += e.vy * dt;
        e.x += Math.sin(e.age * 1.5 + e.wobble) * 24 * dt;
        if (e.fireCooldown <= 0) { e.fireCooldown = shotDelay(1.05 - state.levelIndex * 0.03); spawnBullet('enemy', e.x, e.y + 14, rand(-34, 34), rand(180, 240), { r: 7, color: e.theme.accent2, damage: 1, kind: 'drop', ay: 58, life: 4.8 }); }
      } else if (e.kind === 'sniper') {
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
      } else if (e.kind === 'spinner') {
        e.y += e.vy * dt * 0.7;
        e.x += Math.cos(e.age * 1.1 + e.wobble) * 24 * dt;
        if (e.fireCooldown <= 0 && e.y > 80) { e.fireCooldown = shotDelay(1.65 - Math.min(0.6, state.levelIndex * 0.04)); ringBullets(e.x, e.y, 8 + Math.floor(state.levelIndex / 2), 150 + state.levelIndex * 8, 1, e.theme.accent2, 'enemy'); }
      } else if (e.kind === 'splitter') {
        e.y += e.vy * dt;
        e.x += Math.sin(e.age * 2.2 + e.wobble) * 18 * dt;
      } else if (e.kind === 'diver') {
        const base = ang(e.x, e.y, p.x, p.y);
        e.vx = lerp(e.vx, Math.cos(base) * 80, 0.018);
        e.vy = lerp(e.vy, 120 + Math.sin(e.age * 2 + e.wobble) * 22, 0.02);
        e.x += e.vx * dt;
        e.y += e.vy * dt;
      } else if (e.kind === 'mine') {
        e.y += e.vy * dt;
        e.x += Math.sin(e.age * 1.4 + e.wobble) * 12 * dt;
      } else if (e.kind === 'elite') {
        e.y += e.vy * dt * 0.85;
        e.x += Math.sin(e.age * 1.8 + e.wobble) * 20 * dt;
        if (e.fireCooldown <= 0) { e.fireCooldown = shotDelay(0.8); const base = ang(e.x, e.y, p.x, p.y); ringBullets(e.x, e.y, 8, 160, 1, e.theme.accent2, 'enemy'); spawnBullet('enemy', e.x, e.y, Math.cos(base) * 220, Math.sin(base) * 220, { r: 7, color: e.theme.accent, damage: 1, kind: 'elite', life: 4.8 }); }
      }
      if (e.y > view.h + 72 || e.x < -90 || e.x > view.w + 90) { state.enemies.splice(i, 1); continue; }
      if (d2(e.x, e.y, p.x, p.y) < (e.r + p.r) * (e.r + p.r)) {
        damageEnemy(e, 999, false);
        hurtPlayer(currentDifficulty().contact);
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
        collectPickup(it.type);
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

  function updateBackground(dt) {
    const theme = mainTheme();
    for (let i = 0; i < state.background.length; i++) {
      const b = state.background[i];
      b.y += (b.vy + (state.mode === 'title' ? 12 : 0)) * dt;
      b.x += Math.sin((b.wobble += dt * 0.8) + i) * 6 * dt + b.vx * dt;
      if (b.y > view.h + 40) { b.y = -40; b.x = rand(0, view.w); }
      if (b.x < -40) b.x = view.w + 40;
      if (b.x > view.w + 40) b.x = -40;
    }
    if (state.mode === 'title' && chance(0.004)) burst(rand(0, view.w), rand(0, view.h * 0.7), theme.accent2, 3, 80, 3, 'spark');
  }

  function updateMusic(dt) {
    if (!audio.enabled || !audio.ctx || state.muted) return;
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
      const theme = state.currentTheme;
      const spawnInterval = clamp(1.18 - state.levelIndex * 0.045, 0.56, 1.18);
      while (state.waveClock >= spawnInterval) { state.waveClock -= spawnInterval; spawnWave(theme); }
      if (state.levelClock >= 28 + state.levelIndex * 2.8 && !state.transition) spawnBoss(theme);
    }
    updateBullets(dt);
    updateEnemies(dt);
    updatePickups(dt);
    updateParticles(dt);
    updateTransition(dt);
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
    drawSpriteCircle(x, y, r + b * 0.45, color, (alpha == null ? 1 : alpha) * 0.12, 0, true);
    drawSpriteCircle(x, y, r, color, alpha == null ? 1 : alpha, 0, true);
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

  function drawBackground() {
    const theme = mainTheme();
    const mood = theme.atmosphere || 'default';
    const pulse = 0.5 + Math.sin(state.musicStep * 0.5 + state.levelClock * 0.8) * 0.5;
    drawSpriteRect(view.w * 0.5, view.h * 0.5, view.w, view.h, theme.skyBottom, 0.03, -10, true);
    drawSpriteCircle(view.w * 0.2, view.h * 0.18, Math.max(view.w, view.h) * 0.22, theme.glow, 0.06 + pulse * 0.03, -8, true);
    drawSpriteCircle(view.w * 0.8, view.h * 0.14, Math.max(view.w, view.h) * 0.18, theme.accent2, 0.05 + pulse * 0.02, -8, true);
    drawSpriteCircle(view.w * 0.5, view.h * 0.92, Math.max(view.w, view.h) * 0.16, theme.accent, 0.04, -8, true);

    if (mood === 'chess') {
      const gridY = view.h * 0.78;
      const tile = 56;
      const cols = Math.ceil(view.w / tile) + 4;
      const rows = 8;
      const drift = (state.levelClock * 34 + state.musicStep * 3) % (tile * 2);
      for (let y = -2; y < rows; y++) {
        for (let x = -2; x < cols; x++) {
          const odd = ((x + y + (state.levelIndex & 1)) & 1) === 1;
          drawSpriteRect(
            x * tile - drift * 0.12,
            gridY + y * tile * 0.62 - drift * 0.18,
            tile + 1,
            tile * 0.62 + 1,
            odd ? '#f3f4fb' : '#121521',
            odd ? 0.09 : 0.38,
            -5,
            false
          );
        }
      }
      drawSpriteRect(view.w * 0.5, view.h * 0.88, view.w, view.h * 0.24, '#ffffff', 0.045, -6, false);
    }

    for (let i = 0; i < state.background.length; i++) {
      const b = state.background[i];
      if (b.kind === 'emoji') {
        drawEmojiGlyph(b.emoji, b.x, b.y, b.size, { alpha: b.alpha, glow: theme.glow, blur: b.size * 0.45, rot: b.spin + Math.sin(b.wobble * 0.6) * 0.18, shadow: true });
      } else {
        drawGlowCircle(b.x, b.y, b.r, theme.accent2, b.alpha, 14);
      }
    }

    if (mood === 'rain') {
      const offset = (state.levelClock * 220) % 20;
      for (let x = -40; x < view.w + 60; x += 18) {
        drawSpriteRect(x, -20 + offset, 16, 2, theme.accent2, 0.18, -6, true, -0.7);
      }
    } else if (mood === 'neon') {
      const step = 46;
      const shift = (state.levelClock * 80) % step;
      for (let y = -step; y < view.h + step; y += step) {
        drawSpriteRect(view.w * 0.5, y + shift, view.w, 1, theme.accent2, 0.08, -6, true);
      }
      for (let x = -step; x < view.w + step; x += step) {
        drawSpriteRect(x + shift, view.h * 0.5, 1, view.h, theme.accent2, 0.06, -6, true, -0.08);
      }
    } else if (mood === 'embers') {
      for (let i = 0; i < 18; i++) {
        const x = (i * 79 + state.levelClock * 36) % (view.w + 80) - 40;
        const y = view.h - ((i * 33 + state.levelClock * 120) % (view.h * 0.8));
        drawSpriteCircle(x, y, 2 + (i % 3), theme.accent2, 0.45, -6, true);
      }
    } else if (mood === 'shards') {
      for (let i = 0; i < 12; i++) {
        const x = (i * 91 + state.levelClock * 22) % (view.w + 120) - 60;
        const y = (i * 53 + state.levelClock * 38) % (view.h + 120) - 60;
        drawSpriteRect(x, y, 10, 28, theme.accent2, 0.12, -6, true, 0.4);
      }
    } else if (mood === 'nova') {
      const cx = view.w * 0.5, cy = view.h * 0.26;
      for (let i = 0; i < 10; i++) {
        const a = (TAU / 10) * i + state.levelClock * 0.12;
        drawSpriteRect(cx + Math.cos(a) * 110, cy + Math.sin(a) * 70, 220, 2, theme.accent2, 0.12, -6, true, a);
      }
    }
  }

  function drawBullets() {
    function drawShot(b) {
      const speed = Math.max(1, Math.hypot(b.vx, b.vy));
      const trail = clamp(speed * 0.02, 10, 26);
      const ang = Math.atan2(b.vy, b.vx);
      drawSpriteRect(b.x - Math.cos(ang) * trail * 0.5, b.y - Math.sin(ang) * trail * 0.5, trail, b.kind === 'beam' ? 6 : b.team === 'player' ? 4 : 5, b.color, b.team === 'player' ? 0.72 : 0.65, 2, true, ang);
      drawGlowCircle(b.x, b.y, b.r, b.color, b.team === 'player' ? 0.82 : 0.74, 14);
      if (b.kind === 'rocket') drawSpriteEmoji(E.rocket, b.x, b.y, 14, { rot: ang, alpha: 0.95, layer: 3, lighter: true });
    }
    for (let i = 0; i < state.bullets.length; i++) drawShot(state.bullets[i]);
    for (let i = 0; i < state.enemyBullets.length; i++) drawShot(state.enemyBullets[i]);
  }

  function drawPickups() {
    for (let i = 0; i < state.pickups.length; i++) {
      const p = state.pickups[i];
      const bob = Math.sin(p.bob) * 4;
      drawGlowCircle(p.x, p.y + bob, 14, p.color, 0.35, 18);
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
    g.addColorStop(0, 'rgba(8,12,24,0.76)');
    g.addColorStop(1, 'rgba(8,12,24,0.48)');
    hudCtx.save();
    hudCtx.fillStyle = g;
    hudCtx.strokeStyle = accent || 'rgba(255,255,255,0.18)';
    hudCtx.lineWidth = 2;
    hudCtx.shadowColor = accent || 'rgba(255,255,255,0.2)';
    hudCtx.shadowBlur = 18;
    roundRect(x, y, w, h, 18);
    hudCtx.fill();
    hudCtx.shadowBlur = 0;
    hudCtx.stroke();
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

  function drawEnemyBody(e, rot) {
    const p = enemyPalette(e);
    const r = e.r;
    const alpha = e.hitFlash > 0 ? 1 : 0.96;
    const layer = 2;
    if (e.kind === 'drifter') {
      drawSpriteCircle(e.x, e.y, r * 1.08, p.base, alpha, layer, false);
      drawSpriteCircle(e.x - r * 0.3, e.y - r * 0.2, r * 0.54, p.glow, 0.28, layer + 1, false);
      drawSpriteRect(e.x + r * 0.18, e.y + r * 0.15, r * 1.25, r * 0.16, p.alt, 0.36, layer + 1, false, rot);
      drawSpriteCircle(e.x + r * 0.2, e.y + r * 0.18, r * 0.14, p.alt, 0.88, layer + 2, false);
    } else if (e.kind === 'zigzag') {
      drawSpriteRect(e.x, e.y, r * 1.75, r * 1.75, p.base, alpha, layer, false, Math.PI * 0.25 + rot);
      drawSpriteRect(e.x, e.y - r * 0.1, r * 0.55, r * 1.15, p.alt, 0.34, layer + 1, false, Math.PI * 0.25 + rot * 0.5);
      drawSpriteCircle(e.x + r * 0.14, e.y - r * 0.08, r * 0.14, p.alt, 0.9, layer + 2, false);
    } else if (e.kind === 'swarm') {
      drawSpriteCircle(e.x, e.y, r * 1.05, p.base, alpha, layer, false);
      drawSpriteCircle(e.x - r * 0.88, e.y - r * 0.7, r * 0.52, p.glow, 0.28, layer - 1, false);
      drawSpriteCircle(e.x + r * 0.88, e.y - r * 0.7, r * 0.52, p.glow, 0.28, layer - 1, false);
      drawSpriteRect(e.x, e.y - r * 0.2, r * 1.1, r * 0.14, p.alt, 0.52, layer + 1, false);
      drawSpriteRect(e.x, e.y + r * 0.15, r * 1.1, r * 0.14, p.alt, 0.35, layer + 1, false);
      drawSpriteCircle(e.x, e.y, r * 0.12, p.alt, 0.9, layer + 2, false);
    } else if (e.kind === 'bomber') {
      drawSpriteCircle(e.x, e.y, r * 1.08, p.base, alpha, layer, false);
      drawSpriteRect(e.x, e.y - r * 0.12, r * 1.45, r * 0.18, p.alt, 0.44, layer + 1, false);
      drawSpriteRect(e.x, e.y + r * 0.42, r * 1.1, r * 0.12, p.glow, 0.26, layer + 1, false);
      drawSpriteCircle(e.x, e.y - r * 0.18, r * 0.16, p.alt, 0.9, layer + 2, false);
    } else if (e.kind === 'sniper') {
      drawSpriteRect(e.x, e.y, r * 1.85, r * 1.15, p.base, alpha, layer, false, Math.PI * 0.25 + rot);
      drawSpriteRect(e.x, e.y, r * 0.68, r * 0.26, p.alt, 0.46, layer + 1, false, Math.PI * 0.25 + rot);
      drawSpriteCircle(e.x, e.y, r * 0.14, p.alt, 0.9, layer + 2, false);
    } else if (e.kind === 'spinner') {
      drawSpriteCircle(e.x, e.y, r * 0.92, p.base, alpha, layer, false);
      for (let i = 0; i < 6; i++) {
        const a = rot + i * (TAU / 6);
        drawSpriteRect(e.x + Math.cos(a) * r * 0.68, e.y + Math.sin(a) * r * 0.68, r * 0.92, r * 0.12, p.alt, 0.42, layer + 1, false, a);
      }
      drawSpriteCircle(e.x, e.y, r * 0.12, p.alt, 0.9, layer + 2, false);
    } else if (e.kind === 'splitter') {
      drawSpriteCircle(e.x, e.y, r * 1.0, p.base, alpha, layer, false);
      drawSpriteRect(e.x, e.y, r * 1.45, r * 0.15, p.alt, 0.48, layer + 1, false, rot);
      drawSpriteRect(e.x, e.y, r * 0.15, r * 1.45, p.glow, 0.24, layer + 1, false, rot);
      drawSpriteCircle(e.x - r * 0.26, e.y - r * 0.08, r * 0.08, p.alt, 0.9, layer + 2, false);
      drawSpriteCircle(e.x + r * 0.26, e.y - r * 0.08, r * 0.08, p.alt, 0.9, layer + 2, false);
    } else if (e.kind === 'diver') {
      drawSpriteCircle(e.x, e.y - r * 0.12, r * 0.92, p.base, alpha, layer, false);
      drawSpriteRect(e.x, e.y + r * 0.46, r * 0.95, r * 0.15, p.alt, 0.36, layer + 1, false, rot);
      drawSpriteRect(e.x, e.y + r * 0.7, r * 0.4, r * 0.28, p.glow, 0.24, layer + 1, false, rot);
      drawSpriteCircle(e.x, e.y - r * 0.1, r * 0.12, p.alt, 0.9, layer + 2, false);
    } else if (e.kind === 'mine') {
      drawSpriteCircle(e.x, e.y, r * 0.86, p.base, alpha, layer, false);
      for (let i = 0; i < 8; i++) {
        const a = i * (TAU / 8);
        drawSpriteRect(e.x + Math.cos(a) * r * 0.72, e.y + Math.sin(a) * r * 0.72, r * 0.4, r * 0.12, p.alt, 0.38, layer + 1, false, a);
      }
      drawSpriteCircle(e.x, e.y, r * 0.12, p.alt, 0.9, layer + 2, false);
    } else if (e.kind === 'elite') {
      drawSpriteRect(e.x, e.y, r * 2.0, r * 1.36, p.base, alpha, layer, false, Math.PI * 0.25 + rot);
      drawSpriteRect(e.x, e.y - r * 0.48, r * 1.1, r * 0.16, p.alt, 0.54, layer + 1, false, Math.PI * 0.25 + rot);
      drawSpriteRect(e.x, e.y - r * 1.0, r * 0.8, r * 0.14, p.glow, 0.7, layer + 2, false);
      drawSpriteCircle(e.x, e.y, r * 0.16, p.alt, 0.9, layer + 2, false);
    } else {
      drawSpriteCircle(e.x, e.y, r * 0.95, p.base, alpha, layer, false);
      drawSpriteCircle(e.x, e.y, r * 0.16, p.alt, 0.9, layer + 1, false);
    }
  }

  function drawBossBody(b) {
    const p = bossPalette(b);
    const r = b.r;
    const rot = Math.sin(b.age * 0.8) * 0.08;
    drawSpriteRect(b.x, b.y, r * 2.4, r * 1.7, p.base, 0.98, 3, false, rot + Math.PI * 0.25);
    drawSpriteCircle(b.x, b.y, r * 0.92, p.alt, 0.5, 4, false);
    drawSpriteRect(b.x, b.y - r * 0.78, r * 1.28, r * 0.16, p.glow, 0.5, 5, false);
    drawSpriteRect(b.x, b.y + r * 0.52, r * 1.05, r * 0.14, p.alt, 0.22, 5, false);
    drawSpriteCircle(b.x, b.y, r * 0.16, p.alt, 0.9, 6, false);
  }

  function drawEnemyOverlay(e, rot) {
    const p = enemyPalette(e);
    const r = e.r;
    const a = e.hitFlash > 0 ? 1 : 0.96;
    hudCtx.save();
    hudCtx.translate(e.x, e.y);
    hudCtx.rotate(rot || 0);
    hudCtx.globalAlpha = a;
    hudCtx.shadowColor = p.glow;
    hudCtx.shadowBlur = 10;
    hudCtx.fillStyle = p.base;
    hudCtx.strokeStyle = p.alt;
    hudCtx.lineWidth = 2;

    if (e.kind === 'drifter') {
      hudCtx.beginPath();
      hudCtx.ellipse(0, 0, r * 1.0, r * 0.8, 0, 0, TAU);
      hudCtx.fill();
      hudCtx.shadowBlur = 0;
      hudCtx.fillStyle = p.alt;
      hudCtx.beginPath();
      hudCtx.ellipse(-r * 0.25, -r * 0.18, r * 0.42, r * 0.3, 0, 0, TAU);
      hudCtx.fill();
      hudCtx.fillStyle = p.glow;
      hudCtx.globalAlpha = 0.3;
      hudCtx.fillRect(-r * 0.8, r * 0.06, r * 1.5, r * 0.15);
    } else if (e.kind === 'zigzag') {
      hudCtx.beginPath();
      hudCtx.moveTo(0, -r * 1.0);
      hudCtx.lineTo(r * 0.9, 0);
      hudCtx.lineTo(0, r * 1.0);
      hudCtx.lineTo(-r * 0.9, 0);
      hudCtx.closePath();
      hudCtx.fill();
      hudCtx.shadowBlur = 0;
      hudCtx.fillStyle = p.alt;
      hudCtx.fillRect(-r * 0.12, -r * 0.9, r * 0.24, r * 1.8);
    } else if (e.kind === 'swarm') {
      hudCtx.beginPath();
      hudCtx.ellipse(0, 0, r * 1.0, r * 0.78, 0, 0, TAU);
      hudCtx.fill();
      hudCtx.globalAlpha = 0.25;
      hudCtx.fillStyle = p.glow;
      hudCtx.beginPath();
      hudCtx.ellipse(-r * 0.9, -r * 0.65, r * 0.5, r * 0.32, -0.4, 0, TAU);
      hudCtx.ellipse(r * 0.9, -r * 0.65, r * 0.5, r * 0.32, 0.4, 0, TAU);
      hudCtx.fill();
      hudCtx.globalAlpha = 0.95;
      hudCtx.fillStyle = p.alt;
      hudCtx.fillRect(-r * 0.8, -r * 0.18, r * 1.6, r * 0.14);
      hudCtx.fillRect(-r * 0.8, r * 0.14, r * 1.6, r * 0.12);
    } else if (e.kind === 'bomber') {
      hudCtx.beginPath();
      hudCtx.arc(0, 0, r * 1.02, 0, TAU);
      hudCtx.fill();
      hudCtx.globalAlpha = 0.92;
      hudCtx.fillStyle = p.alt;
      hudCtx.fillRect(-r * 0.72, -r * 0.12, r * 1.44, r * 0.18);
      hudCtx.fillStyle = p.glow;
      hudCtx.globalAlpha = 0.22;
      hudCtx.fillRect(-r * 0.6, r * 0.36, r * 1.2, r * 0.12);
    } else if (e.kind === 'sniper') {
      hudCtx.beginPath();
      hudCtx.moveTo(0, -r * 1.08);
      hudCtx.lineTo(r * 0.9, 0);
      hudCtx.lineTo(0, r * 1.08);
      hudCtx.lineTo(-r * 0.9, 0);
      hudCtx.closePath();
      hudCtx.fill();
      hudCtx.globalAlpha = 0.92;
      hudCtx.fillStyle = p.alt;
      hudCtx.fillRect(-r * 0.12, -r * 0.95, r * 0.24, r * 1.9);
    } else if (e.kind === 'spinner') {
      hudCtx.beginPath();
      hudCtx.arc(0, 0, r * 0.9, 0, TAU);
      hudCtx.fill();
      hudCtx.globalAlpha = 0.9;
      hudCtx.fillStyle = p.alt;
      for (let i = 0; i < 6; i++) {
        const a2 = (rot || 0) + i * (TAU / 6);
        hudCtx.save();
        hudCtx.rotate(a2);
        hudCtx.fillRect(r * 0.5, -r * 0.08, r * 0.6, r * 0.16);
        hudCtx.restore();
      }
    } else if (e.kind === 'splitter') {
      hudCtx.beginPath();
      hudCtx.arc(0, 0, r * 0.98, 0, TAU);
      hudCtx.fill();
      hudCtx.globalAlpha = 0.92;
      hudCtx.fillStyle = p.alt;
      hudCtx.fillRect(-r * 0.78, -r * 0.08, r * 1.56, r * 0.12);
      hudCtx.fillRect(-r * 0.08, -r * 0.78, r * 0.12, r * 1.56);
    } else if (e.kind === 'diver') {
      hudCtx.beginPath();
      hudCtx.moveTo(0, -r * 1.06);
      hudCtx.quadraticCurveTo(r * 0.92, -r * 0.2, r * 0.46, r * 0.98);
      hudCtx.quadraticCurveTo(0, r * 0.72, -r * 0.46, r * 0.98);
      hudCtx.quadraticCurveTo(-r * 0.92, -r * 0.2, 0, -r * 1.06);
      hudCtx.closePath();
      hudCtx.fill();
      hudCtx.globalAlpha = 0.9;
      hudCtx.fillStyle = p.alt;
      hudCtx.fillRect(-r * 0.1, r * 0.48, r * 0.2, r * 0.5);
    } else if (e.kind === 'mine') {
      hudCtx.beginPath();
      hudCtx.arc(0, 0, r * 0.84, 0, TAU);
      hudCtx.fill();
      hudCtx.globalAlpha = 0.92;
      hudCtx.fillStyle = p.alt;
      for (let i = 0; i < 8; i++) {
        const a2 = i * (TAU / 8);
        hudCtx.save();
        hudCtx.rotate(a2);
        hudCtx.fillRect(r * 0.62, -r * 0.06, r * 0.42, r * 0.12);
        hudCtx.restore();
      }
    } else if (e.kind === 'elite') {
      hudCtx.beginPath();
      hudCtx.moveTo(0, -r * 1.12);
      hudCtx.lineTo(r * 0.82, -r * 0.34);
      hudCtx.lineTo(r * 0.62, r * 0.92);
      hudCtx.lineTo(0, r * 1.14);
      hudCtx.lineTo(-r * 0.62, r * 0.92);
      hudCtx.lineTo(-r * 0.82, -r * 0.34);
      hudCtx.closePath();
      hudCtx.fill();
      hudCtx.globalAlpha = 0.9;
      hudCtx.fillStyle = p.alt;
      hudCtx.fillRect(-r * 0.14, -r * 0.95, r * 0.28, r * 1.9);
      hudCtx.fillStyle = p.glow;
      hudCtx.globalAlpha = 0.4;
      hudCtx.fillRect(-r * 0.45, -r * 1.05, r * 0.9, r * 0.12);
    } else {
      hudCtx.beginPath();
      hudCtx.arc(0, 0, r * 0.95, 0, TAU);
      hudCtx.fill();
    }

    hudCtx.restore();
  }

  function drawBossOverlay(b) {
    const p = bossPalette(b);
    const r = b.r;
    hudCtx.save();
    hudCtx.translate(b.x, b.y);
    hudCtx.rotate(Math.sin(b.age * 0.8) * 0.08);
    hudCtx.globalAlpha = 0.98;
    hudCtx.shadowColor = p.glow;
    hudCtx.shadowBlur = 12;
    hudCtx.fillStyle = p.base;
    hudCtx.beginPath();
    hudCtx.moveTo(0, -r * 1.12);
    hudCtx.lineTo(r * 0.85, -r * 0.34);
    hudCtx.lineTo(r * 1.0, 0);
    hudCtx.lineTo(r * 0.8, r * 0.95);
    hudCtx.lineTo(0, r * 1.18);
    hudCtx.lineTo(-r * 0.8, r * 0.95);
    hudCtx.lineTo(-r * 1.0, 0);
    hudCtx.lineTo(-r * 0.85, -r * 0.34);
    hudCtx.closePath();
    hudCtx.fill();
    hudCtx.shadowBlur = 0;
    hudCtx.globalAlpha = 0.9;
    hudCtx.fillStyle = p.alt;
    hudCtx.fillRect(-r * 0.16, -r * 0.94, r * 0.32, r * 1.8);
    hudCtx.fillStyle = p.glow;
    hudCtx.globalAlpha = 0.42;
    hudCtx.fillRect(-r * 0.55, -r * 1.04, r * 1.1, r * 0.14);
    hudCtx.restore();
  }

  function drawEnemy(e) {
    if (!e || e.dead) return;
    const glow = e.theme.glow || e.theme.accent2 || e.theme.accent || '#fff';
    const size = e.kind === 'elite' ? e.r * 2.15 : e.r * 1.85;
    const rot = Math.sin(e.age * 1.8 + e.wobble) * 0.18 + (e.kind === 'zigzag' ? e.dir * 0.08 : 0);
    drawGlowCircle(e.x, e.y, e.r * (e.kind === 'elite' ? 1.95 : 1.55), glow, 0.22 + (e.kind === 'elite' ? 0.08 : 0), 16);
    if (e.kind === 'spinner') {
      for (let i = 0; i < 5; i++) {
        const a = e.age * 2.2 + i * (TAU / 5);
        drawGlowCircle(e.x + Math.cos(a) * (e.r + 6), e.y + Math.sin(a) * (e.r + 6), 2.2, e.theme.accent2, 0.55, 8);
      }
    }
    drawEnemyBody(e, rot);
    drawEnemyOverlay(e, rot);
    if (e.maxHp > 1 && e.hp > 0) drawBar(e.x - e.r * 0.9, e.y - e.r - 14, e.r * 1.8, 7, e.hp / e.maxHp, e.theme.accent2, 'rgba(0,0,0,0.35)');
    if (e.hitFlash > 0) drawGlowCircle(e.x, e.y, e.r * 1.35, '#ffffff', 0.22, 18);
  }

  function drawBoss(b) {
    if (!b) return;
    const glow = b.color || '#fff';
    drawGlowCircle(b.x, b.y, b.r * 2.4, glow, 0.24, 28);
    drawGlowCircle(b.x, b.y, b.r * 1.2, '#fff', 0.08, 20);
    drawBossBody(b);
    drawBossOverlay(b);
    if (b.hitFlash > 0) drawGlowCircle(b.x, b.y, b.r * 1.45, '#ffffff', 0.18, 24);
  }

  function drawPlayer() {
    const p = state.player;
    const bob = Math.sin((state.musicStep * 0.45) + p.x * 0.01) * 2;
    const tilt = clamp(((state.input.right ? 1 : 0) - (state.input.left ? 1 : 0)) * 0.24 + (state.pointerActive ? (state.pointerX - p.x) / 280 : 0), -0.45, 0.45);
    const rot = -Math.PI * 0.25 + tilt;
    const glow = state.overdrive > 0 ? '#ffe38c' : '#8fd8ff';
    if (state.overdrive > 0) {
      drawGlowCircle(p.x, p.y + 4, 42, '#ffd45e', 0.17, 36);
      drawGlowCircle(p.x, p.y + 4, 24, '#fff3b0', 0.22, 20);
    }
    if (p.shield > 0) {
      drawGlowCircle(p.x, p.y, p.r + 16 + Math.sin(state.musicStep * 0.6) * 1.5, p.shield > 1 ? '#a8ecff' : '#e5fbff', 0.22, 18);
      if (p.shield > 1) drawGlowCircle(p.x, p.y, p.r + 24 + Math.sin(state.musicStep * 0.4) * 1.2, '#ffffff', 0.12, 16);
    }
    drawEmojiGlyph(E.plane, p.x, p.y + bob, 36 + (state.overdrive > 0 ? 4 : 0), { rot: rot, alpha: p.invuln > 0 ? 0.78 : 1, layer: 4, fill: glow, lighter: false });
    drawEmojiGlyph(E.plane, p.x - 1, p.y + bob - 1, 32 + (state.overdrive > 0 ? 3 : 0), { rot: rot * 0.96, alpha: 0.18, layer: 5, fill: '#ffffff', lighter: true });
    drawGlowCircle(p.x, p.y + 18 + bob, 5 + p.weaponTier, '#ffd06b', 0.7, 12);
  }

  function drawHud() {
    const theme = mainTheme();
    const p = state.player;
    if (state.mode === 'title') return;

    hudCtx.save();
    const compact = view.w < 640;
    const panelY = 12;
    if (compact) {
      const fullW = view.w - 24;
      drawPanel(12, panelY, fullW, 78, theme.accent2);
      hudCtx.fillStyle = '#fff';
      hudCtx.textBaseline = 'middle';
      hudCtx.textAlign = 'left';
      hudCtx.font = '900 16px "Trebuchet MS", "Segoe UI", sans-serif';
      hudCtx.fillText('SCORE ' + format(state.score), 28, 34);
      hudCtx.font = '700 11px "Trebuchet MS", "Segoe UI", sans-serif';
      hudCtx.fillText('STAGE ' + (state.levelIndex + 1) + '/' + THEMES.length + '  ' + theme.name, 28, 58);
      hudCtx.textAlign = 'right';
      hudCtx.font = '900 16px "Trebuchet MS", "Segoe UI", sans-serif';
      hudCtx.fillText('LIVES ' + state.lives + '   BOMB ' + p.bombs, view.w - 28, 34);
      hudCtx.font = '700 11px "Trebuchet MS", "Segoe UI", sans-serif';
      hudCtx.fillText('WEAPON ' + WEAPONS[p.weaponMode].name + ' ' + ['I', 'II', 'III'][p.weaponTier - 1] + '   HIGH ' + format(state.highScore), view.w - 28, 58);
    } else {
      const leftW = clamp(view.w * 0.46, 260, 410);
      const rightW = clamp(view.w * 0.32, 240, 320);
      drawPanel(12, panelY, leftW, 80, theme.accent2);
      drawPanel(view.w - rightW - 12, panelY, rightW, 80, theme.accent);

      hudCtx.fillStyle = '#fff';
      hudCtx.textBaseline = 'middle';
      hudCtx.textAlign = 'left';
      hudCtx.font = '900 18px "Trebuchet MS", "Segoe UI", sans-serif';
      hudCtx.fillText('SCORE ' + format(state.score), 28, 36);
      hudCtx.font = '700 12px "Trebuchet MS", "Segoe UI", sans-serif';
      hudCtx.fillText('STAGE ' + (state.levelIndex + 1) + '/' + THEMES.length + '  ' + theme.name, 28, 60);

      hudCtx.textAlign = 'right';
      hudCtx.font = '900 18px "Trebuchet MS", "Segoe UI", sans-serif';
      hudCtx.fillText('LIVES ' + state.lives + '   BOMB ' + p.bombs, view.w - 28, 36);
      hudCtx.font = '700 12px "Trebuchet MS", "Segoe UI", sans-serif';
      hudCtx.fillText('WEAPON ' + WEAPONS[p.weaponMode].name + ' ' + ['I', 'II', 'III'][p.weaponTier - 1] + '   HIGH ' + format(state.highScore), view.w - 28, 60);
    }

    if (state.bannerTimer > 0 && state.mode === 'playing') {
      const bw = clamp(view.w * 0.5, 280, 520);
      const bx = (view.w - bw) * 0.5;
      const by = state.boss ? 126 : 100;
      drawPanel(bx, by, bw, 60, theme.accent2);
      hudCtx.textAlign = 'center';
      hudCtx.fillStyle = '#fff';
      hudCtx.font = '900 20px "Trebuchet MS", "Segoe UI", sans-serif';
      hudCtx.fillText(state.banner || '', view.w * 0.5, by + 23);
      hudCtx.font = '700 12px "Trebuchet MS", "Segoe UI", sans-serif';
      hudCtx.fillText(state.bannerSub || '', view.w * 0.5, by + 45);
    }

    if (state.boss) {
      drawBar(12, 100, view.w - 24, 16, state.boss.hp / state.boss.maxHp, theme.accent2, 'rgba(0,0,0,0.42)', 'BOSS ' + state.boss.name);
    }

    const powerRatio = state.overdrive > 0 ? state.overdrive / 7 : p.rapidTimer > 0 ? p.rapidTimer / 8 : p.magnetTimer > 0 ? p.magnetTimer / 12 : 0;
    if (powerRatio > 0) {
      const label = state.overdrive > 0 ? 'OVERDRIVE' : p.rapidTimer > 0 ? 'RAPID' : 'MAGNET';
      drawBar(view.w * 0.18, view.h - view.controlsH - 30, view.w * 0.64, 12, powerRatio, theme.accent2, 'rgba(0,0,0,0.35)', label);
    }

    if (state.paused) {
      hudCtx.fillStyle = 'rgba(0,0,0,0.28)';
      hudCtx.fillRect(0, 0, view.w, view.h);
      drawCenterCard('PAUSED', 'Press P or tap PAUSE to resume.', ['The battle is frozen in place.'], theme.accent2, 'Hold FIRE when you are ready.');
    } else if (state.mode === 'gameover') {
      drawCenterCard('GAME OVER', state.bannerSub, ['Score: ' + format(state.score), 'Best: ' + format(state.highScore)], '#ff8b79', 'Tap or press R to retry.');
    } else if (state.mode === 'victory') {
      drawCenterCard('VICTORY', state.bannerSub, ['Score: ' + format(state.score), 'Best: ' + format(state.highScore)], '#ffe78a', 'Tap or press R to fly again.');
    }
    hudCtx.restore();
  }

  function drawTitle() {
    const theme = mainTheme();
    const pulse = 0.5 + Math.sin(state.musicStep * 0.4) * 0.5;
    drawGlowCircle(view.w * 0.5, view.h * 0.23, 90 + pulse * 18, theme.glow, 0.18, 44);
    drawEmojiGlyph(E.plane, view.w * 0.5, view.h * 0.22, 76, { alpha: 0.18, rot: -Math.PI * 0.25, layer: 4, fill: theme.glow || '#ffffff', lighter: false });
    drawEmojiGlyph(E.plane, view.w * 0.5 - 1, view.h * 0.22 - 1, 72, { alpha: 0.1, rot: -Math.PI * 0.25, layer: 5, fill: '#ffffff', lighter: true });
    drawCenterCard('SHOT EM UP', 'Whimsical vertical shooter', [
      'Drag or use the buttons to fly.',
      'Hold FIRE to stream shots.',
      'BOMB clears the screen.',
      'Tap SETTINGS for sound, music, and difficulty.',
      'Fruit, bugs, gears, chess pieces, storms, and more.'
    ], theme.accent2, 'Tap or press Space to begin.');

    hudCtx.save();
    hudCtx.textAlign = 'center';
    hudCtx.textBaseline = 'middle';
    hudCtx.fillStyle = '#fff';
    hudCtx.font = '800 15px "Trebuchet MS", "Segoe UI", sans-serif';
    hudCtx.shadowColor = theme.accent2;
    hudCtx.shadowBlur = 10;
    hudCtx.fillText('BEST ' + format(state.highScore) + '  |  ' + THEMES.length + ' STAGES  |  EPIC SHOT EM UP CHAOS', view.w * 0.5, view.h - view.controlsH - 18);
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
    if (!state.paused) resumeAudio();
    setBanner(state.paused ? 'PAUSED' : 'RESUMED', state.paused ? 'Press P or tap PAUSE.' : 'Back in the fight.', 1.0);
    hint(state.paused ? 'Paused.' : 'Back in action.', 1.3);
  }

  function toggleMute(force) {
    state.muted = force == null ? !state.muted : !!force;
    if (!state.muted) resumeAudio();
    syncSettingsUi();
    hint(state.muted ? 'Sound off.' : 'Sound on.', 1.1);
  }

  function pressAction(act, down) {
    resumeAudio();
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
    resumeAudio();
    if (state.mode === 'title' || state.mode === 'gameover' || state.mode === 'victory') startGame();
    if (state.paused) togglePause(false);
    const pt = canvasPoint(ev);
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

  function onKeyDown(ev) {
    const code = ev.code;
    if (state.settingsOpen || settingsDialog.open) {
      if (code === 'Escape' || code === 'KeyO') {
        ev.preventDefault();
        closeSettings();
      }
      return;
    }
    if (code === 'ArrowLeft' || code === 'ArrowRight' || code === 'ArrowUp' || code === 'ArrowDown' || code === 'KeyA' || code === 'KeyD' || code === 'KeyW' || code === 'KeyS' || code === 'Space' || code === 'KeyZ' || code === 'KeyX' || code === 'KeyB' || code === 'KeyP' || code === 'KeyM' || code === 'KeyR' || code === 'Escape' || code === 'KeyO') {
      ev.preventDefault();
      resumeAudio();
    }
    if (code === 'ArrowLeft' || code === 'KeyA') state.input.left = true;
    else if (code === 'ArrowRight' || code === 'KeyD') state.input.right = true;
    else if (code === 'ArrowUp' || code === 'KeyW') state.input.up = true;
    else if (code === 'ArrowDown' || code === 'KeyS') state.input.down = true;
    else if (code === 'Space' || code === 'KeyZ') {
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
    else if (code === 'Space' || code === 'KeyZ') state.input.fire = false;
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
  for (let i = 0; i < difficultyButtons.length; i++) {
    difficultyButtons[i].addEventListener('click', function () {
      setDifficulty(Number(this.getAttribute('data-difficulty')));
    });
  }
  canvas.addEventListener('pointerdown', handleCanvasDown);
  canvas.addEventListener('pointermove', handleCanvasMove);
  canvas.addEventListener('pointerup', handleCanvasUp);
  canvas.addEventListener('pointercancel', handleCanvasUp);
  canvas.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && state.mode === 'playing' && !state.paused) togglePause(true);
  });
  requestAnimationFrame(loop);
}());
