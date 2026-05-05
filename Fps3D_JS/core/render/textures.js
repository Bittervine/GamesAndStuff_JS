import { createSeededRng } from '../random/seededRng.js';

function makeCanvas(size) {
  const canvas = document.createElement('canvas');
  if (typeof size === 'number') {
    canvas.width = size;
    canvas.height = size;
    return canvas;
  }

  canvas.width = Math.max(1, Number(size?.width) || 1);
  canvas.height = Math.max(1, Number(size?.height) || canvas.width);
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

export function computeTextureAtlasLayout(entries, options = {}) {
  const cellSize = Math.max(64, Number(options.cellSize ?? 256) || 256);
  const columns = Math.max(1, Number(options.columns ?? 4) || 4);
  const padding = Math.max(0, Math.min(Math.floor(cellSize / 4), Number(options.padding ?? 4) || 4));
  const rows = Math.max(1, Math.ceil((Array.isArray(entries) ? entries.length : 0) / columns));
  const width = columns * cellSize;
  const height = rows * cellSize;
  const layoutEntries = (Array.isArray(entries) ? entries : []).map((entry, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = column * cellSize;
    const y = row * cellSize;
    const innerWidth = Math.max(1, cellSize - padding * 2);
    const innerHeight = Math.max(1, cellSize - padding * 2);
    return {
      key: entry.key,
      canvas: entry.canvas,
      x,
      y,
      width: cellSize,
      height: cellSize,
      region: {
        offsetX: (x + padding) / width,
        offsetY: (y + padding) / height,
        scaleX: innerWidth / width,
        scaleY: innerHeight / height
      }
    };
  });

  return {
    width,
    height,
    cellSize,
    columns,
    rows,
    padding,
    entries: layoutEntries
  };
}

function paintAtlasTile(ctx, sourceCanvas, x, y, cellSize, padding) {
  if (!sourceCanvas) {
    return;
  }

  const innerX = x + padding;
  const innerY = y + padding;
  const innerWidth = Math.max(1, cellSize - padding * 2);
  const innerHeight = Math.max(1, cellSize - padding * 2);

  ctx.drawImage(sourceCanvas, innerX, innerY, innerWidth, innerHeight);

  if (padding <= 0) {
    return;
  }

  const sourceWidth = Math.max(1, sourceCanvas.width || innerWidth);
  const sourceHeight = Math.max(1, sourceCanvas.height || innerHeight);

  ctx.drawImage(sourceCanvas, 0, 0, sourceWidth, 1, innerX, y, innerWidth, padding);
  ctx.drawImage(sourceCanvas, 0, sourceHeight - 1, sourceWidth, 1, innerX, innerY + innerHeight, innerWidth, padding);
  ctx.drawImage(sourceCanvas, 0, 0, 1, sourceHeight, x, innerY, padding, innerHeight);
  ctx.drawImage(sourceCanvas, sourceWidth - 1, 0, 1, sourceHeight, innerX + innerWidth, innerY, padding, innerHeight);

  ctx.drawImage(sourceCanvas, 0, 0, 1, 1, x, y, padding, padding);
  ctx.drawImage(sourceCanvas, sourceWidth - 1, 0, 1, 1, innerX + innerWidth, y, padding, padding);
  ctx.drawImage(sourceCanvas, 0, sourceHeight - 1, 1, 1, x, innerY + innerHeight, padding, padding);
  ctx.drawImage(sourceCanvas, sourceWidth - 1, sourceHeight - 1, 1, 1, innerX + innerWidth, innerY + innerHeight, padding, padding);
}

export function buildTextureAtlas(entries, options = {}) {
  const layout = computeTextureAtlasLayout(entries, options);
  const canvas = makeCanvas({ width: layout.width, height: layout.height });
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;

  for (const entry of layout.entries) {
    paintAtlasTile(ctx, entry.canvas, entry.x, entry.y, layout.cellSize, layout.padding);
  }

  const regions = {};
  for (const entry of layout.entries) {
    regions[entry.key] = entry.region;
  }

  return {
    canvas,
    regions,
    layout
  };
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

function drawSkyTexture(ctx, rng) {
  const { width, height } = ctx.canvas;
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#101724');
  gradient.addColorStop(0.28, '#243c5a');
  gradient.addColorStop(0.62, '#4b6f92');
  gradient.addColorStop(1, '#8db4d0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(width * 0.72, height * 0.22, 8, width * 0.72, height * 0.22, width * 0.44);
  glow.addColorStop(0, 'rgba(255, 244, 210, 0.34)');
  glow.addColorStop(0.45, 'rgba(255, 244, 210, 0.10)');
  glow.addColorStop(1, 'rgba(255, 244, 210, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const cloudCount = 7;
  for (let i = 0; i < cloudCount; i += 1) {
    const baseX = (0.08 + rng.nextFloat() * 0.82) * width;
    const baseY = (0.12 + rng.nextFloat() * 0.54) * height;
    const spanX = 0.14 + rng.nextFloat() * 0.24;
    const spanY = 0.03 + rng.nextFloat() * 0.05;
    const alpha = 0.05 + rng.nextFloat() * 0.06;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    for (let puff = 0; puff < 5; puff += 1) {
      const puffX = baseX + (rng.nextFloat() - 0.5) * width * spanX;
      const puffY = baseY + (rng.nextFloat() - 0.5) * height * spanY;
      const puffRadius = (0.03 + rng.nextFloat() * 0.05) * width;
      ctx.beginPath();
      ctx.arc(puffX, puffY, puffRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  fillNoise(ctx, rng, 110, 0.04, () => {
    const tone = 200 + Math.floor(rng.nextFloat() * 40);
    return `rgba(${tone}, ${tone}, ${tone}, 0.05)`;
  });

  for (let i = 0; i < 18; i += 1) {
    const x = Math.floor(rng.nextFloat() * width);
    const y = Math.floor(rng.nextFloat() * height * 0.45);
    const radius = 0.5 + rng.nextFloat() * 1.4;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.06 + rng.nextFloat() * 0.10})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMetalTexture(ctx, rng) {
  const { width, height } = ctx.canvas;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#77808b');
  gradient.addColorStop(0.45, '#515962');
  gradient.addColorStop(1, '#2f353c');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  for (let y = 0; y <= height; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y + (y % 32 ? 1 : 0));
    ctx.lineTo(width, y + (y % 32 ? 1 : 0));
    ctx.stroke();
  }
  for (let x = 0; x <= width; x += 16) {
    ctx.strokeStyle = x % 32 === 0 ? 'rgba(230, 240, 255, 0.17)' : 'rgba(20, 24, 30, 0.25)';
    ctx.beginPath();
    ctx.moveTo(x + (x % 32 ? 1 : 0), 0);
    ctx.lineTo(x + (x % 32 ? 1 : 0), height);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(12, 14, 18, 0.15)';
  for (let i = 0; i < 8; i += 1) {
    const x = Math.floor(rng.nextFloat() * width);
    const y = Math.floor(rng.nextFloat() * height);
    const w = 6 + Math.floor(rng.nextFloat() * 14);
    const h = 3 + Math.floor(rng.nextFloat() * 10);
    ctx.fillRect(x, y, w, h);
  }

  fillNoise(ctx, rng, 260, 0.05, () => {
    const tone = 120 + Math.floor(rng.nextFloat() * 70);
    return `rgba(${tone}, ${tone + 3}, ${tone + 8}, 0.06)`;
  });
}

function drawStoneTexture(ctx, rng) {
  const { width, height } = ctx.canvas;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#8c8378');
  gradient.addColorStop(0.48, '#665f57');
  gradient.addColorStop(1, '#3d3732');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
  ctx.lineWidth = 1.5;
  for (let y = 0; y <= height; y += 12) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + (rng.nextFloat() - 0.5) * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(35, 28, 24, 0.38)';
  for (let x = 0; x < width; x += 10) {
    ctx.beginPath();
    const y0 = rng.nextFloat() * height;
    const y1 = Math.min(height, y0 + 14 + rng.nextFloat() * 10);
    ctx.moveTo(x, y0);
    ctx.lineTo(x + 6 + rng.nextFloat() * 6, y1);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(15, 12, 10, 0.16)';
  for (let i = 0; i < 24; i += 1) {
    const x = rng.nextFloat() * width;
    const y = rng.nextFloat() * height;
    const r = 2 + rng.nextFloat() * 4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  fillNoise(ctx, rng, 220, 0.06, () => {
    const tone = 90 + Math.floor(rng.nextFloat() * 55);
    return `rgba(${tone}, ${tone - 4}, ${tone - 10}, 0.08)`;
  });
}

function drawOrganicTexture(ctx, rng) {
  const { width, height } = ctx.canvas;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#8d3b49');
  gradient.addColorStop(0.52, '#5b2431');
  gradient.addColorStop(1, '#31131a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255, 160, 180, 0.14)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 10; i += 1) {
    const y = (i / 10) * height + rng.nextFloat() * 8;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(width * 0.25, y - 8, width * 0.75, y + 8, width, y + (rng.nextFloat() - 0.5) * 6);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(100, 25, 35, 0.48)';
  for (let i = 0; i < 14; i += 1) {
    const x = rng.nextFloat() * width;
    const y = rng.nextFloat() * height;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
      x + (rng.nextFloat() - 0.5) * 20,
      y + (rng.nextFloat() - 0.5) * 20,
      x + (rng.nextFloat() - 0.5) * 24,
      y + (rng.nextFloat() - 0.5) * 24,
      x + (rng.nextFloat() - 0.5) * 16,
      y + (rng.nextFloat() - 0.5) * 16
    );
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255, 215, 225, 0.10)';
  for (let i = 0; i < 20; i += 1) {
    const x = rng.nextFloat() * width;
    const y = rng.nextFloat() * height;
    const r = 1.5 + rng.nextFloat() * 3.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  fillNoise(ctx, rng, 200, 0.06, () => {
    const tone = 120 + Math.floor(rng.nextFloat() * 65);
    return `rgba(${tone}, ${tone - 35}, ${tone - 20}, 0.08)`;
  });
}

function drawLiquidTexture(ctx, rng) {
  const { width, height } = ctx.canvas;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#15324a');
  gradient.addColorStop(0.48, '#12465a');
  gradient.addColorStop(1, '#0a1e2a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(115, 241, 255, 0.22)';
  ctx.lineWidth = 1.5;
  for (let y = 0; y <= height; y += 10) {
    ctx.beginPath();
    const sway = Math.sin(y * 0.25) * 2;
    ctx.moveTo(0, y + sway);
    ctx.quadraticCurveTo(width * 0.33, y - 3 + sway, width * 0.66, y + 2 - sway);
    ctx.quadraticCurveTo(width * 0.84, y + 4 + sway, width, y - sway);
    ctx.stroke();
  }

  for (let i = 0; i < 18; i += 1) {
    const x = rng.nextFloat() * width;
    const y = rng.nextFloat() * height;
    const r = 1.5 + rng.nextFloat() * 5;
    const glow = ctx.createRadialGradient(x, y, 1, x, y, r * 2.5);
    glow.addColorStop(0, 'rgba(165, 255, 255, 0.35)');
    glow.addColorStop(1, 'rgba(165, 255, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  fillNoise(ctx, rng, 120, 0.05, () => {
    const tone = 50 + Math.floor(rng.nextFloat() * 35);
    return `rgba(${tone}, ${tone + 50}, ${tone + 70}, 0.08)`;
  });
}

function drawEmissiveTexture(ctx, rng) {
  const { width, height } = ctx.canvas;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1a151d');
  gradient.addColorStop(0.5, '#332235');
  gradient.addColorStop(1, '#5a313f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255, 181, 110, 0.5)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    const x = (i + 0.5) * width / 5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255, 120, 90, 0.3)';
  for (let y = 0; y <= height; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  for (let i = 0; i < 10; i += 1) {
    const x = rng.nextFloat() * width;
    const y = rng.nextFloat() * height;
    const r = 2 + rng.nextFloat() * 8;
    const glow = ctx.createRadialGradient(x, y, 1, x, y, r * 4);
    glow.addColorStop(0, 'rgba(255, 208, 145, 0.65)');
    glow.addColorStop(0.5, 'rgba(255, 126, 91, 0.25)');
    glow.addColorStop(1, 'rgba(255, 126, 91, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDamageTexture(ctx, rng) {
  const { width, height } = ctx.canvas;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#3a2a25');
  gradient.addColorStop(0.45, '#231916');
  gradient.addColorStop(1, '#080707');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255, 176, 107, 0.16)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 18; i += 1) {
    const startX = rng.nextFloat() * width;
    const startY = rng.nextFloat() * height;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + (rng.nextFloat() - 0.5) * 30, startY + (rng.nextFloat() - 0.5) * 30);
    ctx.lineTo(startX + (rng.nextFloat() - 0.5) * 36, startY + (rng.nextFloat() - 0.5) * 36);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255, 90, 60, 0.08)';
  for (let i = 0; i < 16; i += 1) {
    const x = rng.nextFloat() * width;
    const y = rng.nextFloat() * height;
    const w = 6 + rng.nextFloat() * 16;
    const h = 3 + rng.nextFloat() * 8;
    ctx.fillRect(x, y, w, h);
  }

  fillNoise(ctx, rng, 180, 0.06, () => {
    const tone = 30 + Math.floor(rng.nextFloat() * 45);
    return `rgba(${tone}, ${tone - 4}, ${tone - 4}, 0.08)`;
  });
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

function drawUiPanelTexture(ctx, rng) {
  const { width, height } = ctx.canvas;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1b2535');
  gradient.addColorStop(0.45, '#101723');
  gradient.addColorStop(1, '#070a10');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(4, 4, width - 8, height - 8);
  ctx.strokeStyle = 'rgba(122, 231, 255, 0.54)';
  ctx.lineWidth = 2;
  ctx.strokeRect(3, 3, width - 6, height - 6);

  ctx.strokeStyle = 'rgba(255, 205, 96, 0.42)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(8, height * 0.26);
  ctx.lineTo(width * 0.72, height * 0.26);
  ctx.moveTo(8, height * 0.62);
  ctx.lineTo(width * 0.86, height * 0.62);
  ctx.stroke();

  ctx.fillStyle = 'rgba(104, 214, 255, 0.18)';
  ctx.fillRect(width * 0.12, height * 0.18, width * 0.66, height * 0.10);
  ctx.fillStyle = 'rgba(255, 136, 90, 0.16)';
  ctx.fillRect(width * 0.18, height * 0.52, width * 0.56, height * 0.14);
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(width * 0.12, height * 0.74, width * 0.48, height * 0.08);

  fillNoise(ctx, rng, 90, 0.035, () => {
    const tone = 55 + Math.floor(rng.nextFloat() * 85);
    return `rgba(${tone}, ${tone + 12}, ${tone + 28}, 0.08)`;
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

  const skyCanvas = makeCanvas(256);
  drawSkyTexture(skyCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('sky'));
  textures.sky = uploadTexture(gl, skyCanvas, { wrapS: gl.REPEAT, wrapT: gl.CLAMP_TO_EDGE });

  const metalCanvas = makeCanvas(64);
  drawMetalTexture(metalCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('material-metal'));
  textures.materialMetal = uploadTexture(gl, metalCanvas, { wrapS: gl.REPEAT, wrapT: gl.REPEAT });

  const stoneCanvas = makeCanvas(64);
  drawStoneTexture(stoneCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('material-stone'));
  textures.materialStone = uploadTexture(gl, stoneCanvas, { wrapS: gl.REPEAT, wrapT: gl.REPEAT });

  const organicCanvas = makeCanvas(64);
  drawOrganicTexture(organicCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('material-organic'));
  textures.materialOrganic = uploadTexture(gl, organicCanvas, { wrapS: gl.REPEAT, wrapT: gl.REPEAT });

  const liquidCanvas = makeCanvas(64);
  drawLiquidTexture(liquidCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('material-liquid'));
  textures.materialLiquid = uploadTexture(gl, liquidCanvas, { wrapS: gl.REPEAT, wrapT: gl.REPEAT });

  const emissiveCanvas = makeCanvas(64);
  drawEmissiveTexture(emissiveCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('material-emissive'));
  textures.materialEmissive = uploadTexture(gl, emissiveCanvas, { wrapS: gl.REPEAT, wrapT: gl.REPEAT });

  const damageCanvas = makeCanvas(64);
  drawDamageTexture(damageCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('material-damage'));
  textures.materialDamage = uploadTexture(gl, damageCanvas, { wrapS: gl.REPEAT, wrapT: gl.REPEAT });

  const entityCanvas = makeCanvas(64);
  drawEntityTexture(entityCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('entity'));
  textures.entity = uploadTexture(gl, entityCanvas, { wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });

  const pickupCanvas = makeCanvas(64);
  drawPickupTexture(pickupCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('pickup'));
  textures.pickup = uploadTexture(gl, pickupCanvas, { wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });

  const weaponCanvas = makeCanvas(64);
  drawWeaponTexture(weaponCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('weapon'));
  textures.weapon = uploadTexture(gl, weaponCanvas, { wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });

  const uiPanelCanvas = makeCanvas(64);
  drawUiPanelTexture(uiPanelCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('ui-panel'));
  textures.uiPanel = uploadTexture(gl, uiPanelCanvas, { wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });

  const projectileCanvas = makeCanvas(64);
  drawPickupTexture(projectileCanvas.getContext('2d', { willReadFrequently: true }), rng.fork('projectile'));
  textures.projectile = uploadTexture(gl, projectileCanvas, { wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });

  const atlas = buildTextureAtlas([
    { key: 'entity', canvas: entityCanvas },
    { key: 'pickup', canvas: pickupCanvas },
    { key: 'weapon', canvas: weaponCanvas },
    { key: 'projectile', canvas: projectileCanvas },
    { key: 'uiPanel', canvas: uiPanelCanvas },
    { key: 'materialEmissive', canvas: emissiveCanvas },
    { key: 'materialDamage', canvas: damageCanvas }
  ], {
    cellSize: 256,
    columns: 4,
    padding: 4
  });
  textures.atlas = uploadTexture(gl, atlas.canvas, { wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });
  textures.atlasRegions = atlas.regions;

  return textures;
}

export function disposeTextures(gl, textures) {
  for (const texture of Object.values(textures)) {
    if (texture) {
      gl.deleteTexture(texture);
    }
  }
}
