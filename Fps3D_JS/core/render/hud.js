import { WEAPON_ORDER, getWeaponDef } from '../../data/weapons.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function drawBar(ctx, x, y, width, height, ratio, fillColor, label, valueText) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.44)';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = fillColor;
  ctx.fillRect(x + 2, y + 2, Math.max(0, (width - 4) * clamp(ratio, 0, 1)), height - 4);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.86)';
  ctx.fillText(`${label}: ${valueText}`, x + 10, y + height - 8);
}

function drawGridMiniMap(ctx, state, x, y, scale) {
  const level = state.level;
  const width = level.width * scale;
  const height = level.height * scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(5, 7, 10, 0.68)';
  ctx.fillRect(-8, -8, width + 16, height + 16);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.strokeRect(-8.5, -8.5, width + 17, height + 17);

  for (let row = 0; row < level.height; row += 1) {
    for (let col = 0; col < level.width; col += 1) {
      if (level.grid[row][col] === '#') {
        ctx.fillStyle = '#232830';
        ctx.fillRect(col * scale, row * scale, scale, scale);
      }
    }
  }

  for (const pickup of state.pickups) {
    if (pickup.collected) {
      continue;
    }
    ctx.fillStyle = pickup.kind === 'health' ? '#7dff96' : pickup.kind === 'armor' ? '#7fb9ff' : '#ffd56b';
    ctx.fillRect((pickup.x - 0.15) * scale, (pickup.z - 0.15) * scale, scale * 0.3, scale * 0.3);
  }

  for (const enemy of state.enemies) {
    if (enemy.dead) {
      continue;
    }
    ctx.fillStyle = '#ff675f';
    ctx.fillRect((enemy.x - 0.18) * scale, (enemy.z - 0.18) * scale, scale * 0.36, scale * 0.36);
  }

  if (level.exit) {
    ctx.fillStyle = '#f8d46c';
    ctx.fillRect((level.exit.x - 0.2) * scale, (level.exit.z - 0.2) * scale, scale * 0.4, scale * 0.4);
  }

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(state.player.x * scale, state.player.z * scale, Math.max(2, scale * 0.32), 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  const px = state.player.x * scale;
  const pz = state.player.z * scale;
  const facingX = Math.cos(state.player.yaw) * scale * 0.7;
  const facingZ = Math.sin(state.player.yaw) * scale * 0.7;
  ctx.moveTo(px, pz);
  ctx.lineTo(px + facingX, pz + facingZ);
  ctx.stroke();
  ctx.restore();
}

function worldToMini(bounds, x, z, scale, offsetX, offsetZ) {
  return {
    x: offsetX + (x - bounds.minX) * scale,
    z: offsetZ + (z - bounds.minZ) * scale
  };
}

function drawBrushMiniMap(ctx, state, x, y, width, height) {
  const level = state.level;
  const bounds = level.bounds || {
    minX: 0,
    minZ: 0,
    width: Math.max(1, level.width || 1),
    height: Math.max(1, level.height || 1)
  };
  const scaleX = (width - 16) / Math.max(1, bounds.width);
  const scaleY = (height - 16) / Math.max(1, bounds.height);
  const scale = Math.max(2, Math.min(scaleX, scaleY));
  const mapWidth = Math.max(1, bounds.width * scale);
  const mapHeight = Math.max(1, bounds.height * scale);
  const offsetX = x + 8;
  const offsetZ = y + 8;

  ctx.save();
  ctx.fillStyle = 'rgba(5, 7, 10, 0.68)';
  ctx.fillRect(x - 8, y - 8, mapWidth + 16, mapHeight + 16);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.strokeRect(x - 8.5, y - 8.5, mapWidth + 17, mapHeight + 17);

  for (const sector of level.sectors || []) {
    if (!Array.isArray(sector.loop) || sector.loop.length < 3) {
      continue;
    }

    ctx.beginPath();
    const first = worldToMini(bounds, sector.loop[0].x, sector.loop[0].z, scale, offsetX, offsetZ);
    ctx.moveTo(first.x, first.z);
    for (let index = 1; index < sector.loop.length; index += 1) {
      const point = worldToMini(bounds, sector.loop[index].x, sector.loop[index].z, scale, offsetX, offsetZ);
      ctx.lineTo(point.x, point.z);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(64, 84, 110, 0.34)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(210, 225, 248, 0.12)';
    ctx.stroke();
  }

  for (const wall of level.walls || []) {
    const start = worldToMini(bounds, wall.ax, wall.az, scale, offsetX, offsetZ);
    const end = worldToMini(bounds, wall.bx, wall.bz, scale, offsetX, offsetZ);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.beginPath();
    ctx.moveTo(start.x, start.z);
    ctx.lineTo(end.x, end.z);
    ctx.stroke();
  }

  for (const pickup of state.pickups) {
    if (pickup.collected) {
      continue;
    }
    const point = worldToMini(bounds, pickup.x, pickup.z, scale, offsetX, offsetZ);
    ctx.fillStyle = pickup.kind === 'health' ? '#7dff96' : pickup.kind === 'armor' ? '#7fb9ff' : '#ffd56b';
    ctx.fillRect(point.x - 2, point.z - 2, 4, 4);
  }

  for (const enemy of state.enemies) {
    if (enemy.dead) {
      continue;
    }
    const point = worldToMini(bounds, enemy.x, enemy.z, scale, offsetX, offsetZ);
    ctx.fillStyle = '#ff675f';
    ctx.fillRect(point.x - 2, point.z - 2, 4, 4);
  }

  if (level.exit) {
    const point = worldToMini(bounds, level.exit.x, level.exit.z, scale, offsetX, offsetZ);
    ctx.fillStyle = '#f8d46c';
    ctx.fillRect(point.x - 3, point.z - 3, 6, 6);
  }

  const playerPoint = worldToMini(bounds, state.player.x, state.player.z, scale, offsetX, offsetZ);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(playerPoint.x, playerPoint.z, Math.max(2, scale * 0.26), 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  const facingX = Math.cos(state.player.yaw) * scale * 0.7;
  const facingZ = Math.sin(state.player.yaw) * scale * 0.7;
  ctx.moveTo(playerPoint.x, playerPoint.z);
  ctx.lineTo(playerPoint.x + facingX, playerPoint.z + facingZ);
  ctx.stroke();

  ctx.restore();
}

function drawMiniMap(ctx, state, x, y, width, height) {
  if (Array.isArray(state.level?.sectors) && state.level.sectors.length > 0) {
    drawBrushMiniMap(ctx, state, x, y, width, height);
    return;
  }

  const scale = Math.max(4, Math.min(6, Math.floor(180 / Math.max(state.level.width, state.level.height))));
  drawGridMiniMap(ctx, state, x, y, scale);
}

export function drawHud(ctx, state, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';

  const weapon = getWeaponDef(WEAPON_ORDER[state.player.weaponIndex] || WEAPON_ORDER[0]);
  const healthRatio = state.player.health / 100;
  const armorRatio = state.player.armor / 100;

  drawBar(ctx, 18, height - 78, 220, 24, healthRatio, '#d84f4f', 'Health', String(state.player.health));
  drawBar(ctx, 18, height - 46, 220, 20, armorRatio, '#4f8fd8', 'Armor', String(state.player.armor));

  ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
  ctx.fillRect(width - 258, height - 92, 240, 58);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.strokeRect(width - 258.5, height - 92.5, 240, 58);
  ctx.fillStyle = '#f8f5ef';
  ctx.fillText(`Weapon: ${weapon.name}`, width - 242, height - 66);
  ctx.fillText(`Ammo: ${state.player.ammo[weapon.ammoType] ?? 'inf'}`, width - 242, height - 42);

  const statusText = state.player.dead ? 'YOU DIED' : state.completed ? 'LEVEL CLEARED' : state.paused ? 'PAUSED' : `Kills: ${state.player.kills}`;
  ctx.fillStyle = state.player.dead ? '#ff7575' : state.completed ? '#fff19c' : '#eef4ff';
  ctx.font = '700 22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(statusText, width * 0.5, 34);

  ctx.font = '600 12px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(232, 240, 255, 0.84)';
  ctx.fillText(`${state.level.name}  |  Seed ${state.seed}`, 18, 18);

  drawMiniMap(
    ctx,
    state,
    width - Math.min(210, state.level.bounds ? state.level.bounds.width * 5 : state.level.width * 5) - 20,
    20,
    Math.min(210, state.level.bounds ? state.level.bounds.width * 5 : state.level.width * 5),
    Math.min(210, state.level.bounds ? state.level.bounds.height * 5 : state.level.height * 5)
  );

  ctx.strokeStyle = 'rgba(255,255,255,0.88)';
  ctx.lineWidth = 2;
  const cx = width * 0.5;
  const cy = height * 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy);
  ctx.lineTo(cx - 3, cy);
  ctx.moveTo(cx + 3, cy);
  ctx.lineTo(cx + 10, cy);
  ctx.moveTo(cx, cy - 10);
  ctx.lineTo(cx, cy - 3);
  ctx.moveTo(cx, cy + 3);
  ctx.lineTo(cx, cy + 10);
  ctx.stroke();

  if (state.events.length > 0) {
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.76)';
    const recent = state.events.slice(-5);
    let lineY = height - 112;
    for (const event of recent) {
      ctx.fillText(event.type, 18, lineY);
      lineY -= 16;
    }
  }

  ctx.restore();
}
