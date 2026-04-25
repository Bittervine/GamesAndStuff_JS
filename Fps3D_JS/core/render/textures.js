import { createSeededRng } from '../random/seededRng.js';

function makeCanvas(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function uploadTexture(gl, canvas, options = {}) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, options.minFilter || gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, options.magFilter || gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.wrapS || gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.wrapT || gl.REPEAT);
  if (options.mipmap !== false) {
    gl.generateMipmap(gl.TEXTURE_2D);
  }
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

function fillNoise(ctx, rng, samples, alpha, colorFn) {
  for (let i = 0; i < samples; i += 1) {
    const x = Math.floor(rng.nextFloat() * ctx.canvas.width);
    const y = Math.floor(rng.nextFloat() * ctx.canvas.height);
    const size = 1 + Math.floor(rng.nextFloat() * 4);
    const color = colorFn ? colorFn(rng) : `rgba(255,255,255,${alpha})`;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
  }
}

function drawWallTexture(ctx, rng) {
  const { width, height } = ctx.canvas;
  const base = ctx.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, '#4f463f');
  base.addColorStop(0.55, '#3a332d');
  base.addColorStop(1, '#2a2724');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255, 194, 128, 0.18)';
  ctx.lineWidth = 2;
  for (let y = 0; y <= height; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y + (y % 32 ? 2 : 0));
    ctx.lineTo(width, y + (y % 32 ? 2 : 0));
    ctx.stroke();
  }

  for (let x = 0; x <= width; x += 16) {
    ctx.strokeStyle = x % 32 === 0 ? 'rgba(255, 240, 220, 0.16)' : 'rgba(0, 0, 0, 0.24)';
    ctx.beginPath();
    ctx.moveTo(x + (x % 32 ? 1 : 0), 0);
    ctx.lineTo(x + (x % 32 ? 1 : 0), height);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  for (let i = 0; i < 9; i += 1) {
    const x = Math.floor(rng.nextFloat() * width);
    const y = Math.floor(rng.nextFloat() * height);
    const w = 8 + Math.floor(rng.nextFloat() * 16);
    const h = 4 + Math.floor(rng.nextFloat() * 12);
    ctx.fillRect(x, y, w, h);
  }

  fillNoise(ctx, rng, 300, 0.06, () => {
    const tone = 80 + Math.floor(rng.nextFloat() * 65);
    return `rgba(${tone}, ${tone - 8}, ${tone - 12}, 0.08)`;
  });
}

function drawFloorTexture(ctx, rng) {
  const { width, height } = ctx.canvas;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#202429');
  gradient.addColorStop(0.4, '#151a1d');
  gradient.addColorStop(1, '#0f1215');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(120, 190, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let y = 0; y <= height; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  for (let x = 0; x <= width; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  fillNoise(ctx, rng, 180, 0.05, () => {
    const tone = 30 + Math.floor(rng.nextFloat() * 40);
    return `rgba(${tone}, ${tone + 8}, ${tone + 12}, 0.08)`;
  });
}

function drawCeilingTexture(ctx, rng) {
  const { width, height } = ctx.canvas;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#2e4459');
  gradient.addColorStop(0.5, '#253445');
  gradient.addColorStop(1, '#1a2530');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  for (let y = 0; y <= height; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  for (let x = 0; x <= width; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  const lightCount = 4;
  for (let i = 0; i < lightCount; i += 1) {
    const x = 10 + Math.floor(rng.nextFloat() * (width - 20));
    const y = 10 + Math.floor(rng.nextFloat() * (height - 20));
    const radius = 3 + Math.floor(rng.nextFloat() * 4);
    const gradientLight = ctx.createRadialGradient(x, y, 1, x, y, radius * 4);
    gradientLight.addColorStop(0, 'rgba(255, 235, 180, 0.5)');
    gradientLight.addColorStop(1, 'rgba(255, 235, 180, 0)');
    ctx.fillStyle = gradientLight;
    ctx.beginPath();
    ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEntityTexture(ctx, rng) {
  const { width, height } = ctx.canvas;
  const gradient = ctx.createRadialGradient(width * 0.35, height * 0.3, 2, width * 0.5, height * 0.5, width * 0.52);
  gradient.addColorStop(0, '#7ff0ff');
  gradient.addColorStop(0.45, '#425c7d');
  gradient.addColorStop(1, '#161a21');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, width - 8, height - 8);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.26)';
  for (let i = 0; i < 6; i += 1) {
    const x = Math.floor(rng.nextFloat() * width * 0.7) + 6;
    const y = Math.floor(rng.nextFloat() * height * 0.7) + 6;
    const w = 6 + Math.floor(rng.nextFloat() * 10);
    const h = 3 + Math.floor(rng.nextFloat() * 8);
    ctx.fillRect(x, y, w, h);
  }

  fillNoise(ctx, rng, 240, 0.05, () => {
    const tone = 120 + Math.floor(rng.nextFloat() * 100);
    return `rgba(${tone}, ${tone}, ${tone}, 0.06)`;
  });
}

function drawPickupTexture(ctx, rng) {
  const { width, height } = ctx.canvas;
  const gradient = ctx.createRadialGradient(width / 2, height / 2, 3, width / 2, height / 2, width / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,0.96)');
  gradient.addColorStop(0.3, 'rgba(121,255,165,0.92)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = '#0b1a10';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, width * 0.46, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, width - 20, height - 20);
  fillNoise(ctx, rng, 100, 0.05);
}

function drawWeaponTexture(ctx, rng) {
  const { width, height } = ctx.canvas;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#595757');
  gradient.addColorStop(0.5, '#202124');
  gradient.addColorStop(1, '#08090c');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#1b232b';
  ctx.fillRect(8, height * 0.4, width * 0.58, height * 0.24);
  ctx.fillStyle = '#3d4d63';
  ctx.fillRect(width * 0.54, height * 0.28, width * 0.18, height * 0.48);
  ctx.fillStyle = '#ff8b5a';
  ctx.fillRect(width * 0.7, height * 0.47, width * 0.18, height * 0.08);
  fillNoise(ctx, rng, 140, 0.05, () => {
    const tone = 70 + Math.floor(rng.nextFloat() * 80);
    return `rgba(${tone}, ${tone}, ${tone}, 0.08)`;
  });
}

export function createGameTextures(gl, seed = 0) {
  const rng = createSeededRng(seed);
  const textures = {};

  const wallCanvas = makeCanvas(64);
  drawWallTexture(wallCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('wall'));
  textures.wall = uploadTexture(gl, wallCanvas, { wrapS: gl.REPEAT, wrapT: gl.REPEAT });

  const floorCanvas = makeCanvas(64);
  drawFloorTexture(floorCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('floor'));
  textures.floor = uploadTexture(gl, floorCanvas, { wrapS: gl.REPEAT, wrapT: gl.REPEAT });

  const ceilingCanvas = makeCanvas(64);
  drawCeilingTexture(ceilingCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('ceiling'));
  textures.ceiling = uploadTexture(gl, ceilingCanvas, { wrapS: gl.REPEAT, wrapT: gl.REPEAT });

  const entityCanvas = makeCanvas(64);
  drawEntityTexture(entityCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('entity'));
  textures.entity = uploadTexture(gl, entityCanvas, { wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });

  const pickupCanvas = makeCanvas(64);
  drawPickupTexture(pickupCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('pickup'));
  textures.pickup = uploadTexture(gl, pickupCanvas, { wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });

  const weaponCanvas = makeCanvas(64);
  drawWeaponTexture(weaponCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('weapon'));
  textures.weapon = uploadTexture(gl, weaponCanvas, { wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });

  const projectileCanvas = makeCanvas(64);
  drawPickupTexture(projectileCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('projectile'));
  textures.projectile = uploadTexture(gl, projectileCanvas, { wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });

  return textures;
}

export function disposeTextures(gl, textures) {
  for (const texture of Object.values(textures)) {
    if (texture) {
      gl.deleteTexture(texture);
    }
  }
}
