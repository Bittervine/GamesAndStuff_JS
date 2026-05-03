import { getCell, isSolidCell } from './level.js';
import { raySegmentIntersection } from './spatial.js';

export function normalize2d(x, z) {
  const len = Math.hypot(x, z);
  if (!len) {
    return { x: 1, z: 0, length: 0 };
  }

  return { x: x / len, z: z / len, length: len };
}

export function distance2d(ax, az, bx, bz) {
  const dx = ax - bx;
  const dz = az - bz;
  return Math.hypot(dx, dz);
}

export function intersectRayCircle(originX, originZ, dirX, dirZ, circleX, circleZ, radius, maxDistance = Infinity) {
  const fx = originX - circleX;
  const fz = originZ - circleZ;
  const a = dirX * dirX + dirZ * dirZ;
  const b = 2 * (fx * dirX + fz * dirZ);
  const c = fx * fx + fz * fz - radius * radius;
  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0 || a === 0) {
    return null;
  }

  const sqrtDiscriminant = Math.sqrt(discriminant);
  const inv = 1 / (2 * a);
  const t0 = (-b - sqrtDiscriminant) * inv;
  const t1 = (-b + sqrtDiscriminant) * inv;

  if (t0 >= 0 && t0 <= maxDistance) return t0;
  if (t1 >= 0 && t1 <= maxDistance) return t1;
  return null;
}

function castGridRayFallback(level, originX, originZ, dirX, dirZ, maxDistance = 64) {
  const normalized = normalize2d(dirX, dirZ);
  const rayDirX = normalized.x;
  const rayDirZ = normalized.z;
  let mapX = Math.floor(originX);
  let mapZ = Math.floor(originZ);

  const deltaDistX = rayDirX === 0 ? Infinity : Math.abs(1 / rayDirX);
  const deltaDistZ = rayDirZ === 0 ? Infinity : Math.abs(1 / rayDirZ);
  let stepX;
  let stepZ;
  let sideDistX;
  let sideDistZ;

  if (rayDirX < 0) {
    stepX = -1;
    sideDistX = (originX - mapX) * deltaDistX;
  } else {
    stepX = 1;
    sideDistX = (mapX + 1 - originX) * deltaDistX;
  }

  if (rayDirZ < 0) {
    stepZ = -1;
    sideDistZ = (originZ - mapZ) * deltaDistZ;
  } else {
    stepZ = 1;
    sideDistZ = (mapZ + 1 - originZ) * deltaDistZ;
  }

  let side = 0;
  let distance = 0;

  while (distance <= maxDistance) {
    if (sideDistX < sideDistZ) {
      mapX += stepX;
      distance = sideDistX;
      sideDistX += deltaDistX;
      side = 0;
    } else {
      mapZ += stepZ;
      distance = sideDistZ;
      sideDistZ += deltaDistZ;
      side = 1;
    }

    if (distance > maxDistance) {
      break;
    }

    if (isSolidCell(level, mapX, mapZ)) {
      return {
        hit: true,
        distance,
        cellX: mapX,
        cellZ: mapZ,
        side,
        tile: getCell(level, mapX, mapZ),
        pointX: originX + rayDirX * distance,
        pointZ: originZ + rayDirZ * distance,
        normal: side === 0 ? { x: -stepX, z: 0 } : { x: 0, z: -stepZ }
      };
    }
  }

  return {
    hit: false,
    distance: maxDistance,
    pointX: originX + rayDirX * maxDistance,
    pointZ: originZ + rayDirZ * maxDistance
  };
}

export function castWorldRay(level, originX, originZ, dirX, dirZ, maxDistance = 64) {
  const normalized = normalize2d(dirX, dirZ);
  const rayDirX = normalized.x;
  const rayDirZ = normalized.z;

  if (Array.isArray(level?.walls) && level.walls.length > 0) {
    let bestHit = null;

    for (const wall of level.walls) {
      const hit = raySegmentIntersection(originX, originZ, rayDirX, rayDirZ, wall.ax, wall.az, wall.bx, wall.bz, maxDistance);
      if (!hit) {
        continue;
      }

      if (!bestHit || hit.distance < bestHit.distance) {
        let normal = wall.normal ? { x: wall.normal.x, z: wall.normal.z } : {
          x: wall.bz - wall.az,
          z: -(wall.bx - wall.ax)
        };
        const normalLength = Math.hypot(normal.x, normal.z) || 1;
        normal = {
          x: normal.x / normalLength,
          z: normal.z / normalLength
        };

        if (normal.x * rayDirX + normal.z * rayDirZ > 0) {
          normal.x = -normal.x;
          normal.z = -normal.z;
        }

        bestHit = {
          hit: true,
          distance: hit.distance,
          pointX: hit.pointX,
          pointZ: hit.pointZ,
          wallId: wall.id || null,
          sectorId: wall.sectorId || null,
          material: wall.material || null,
          normal
        };
      }
    }

    if (bestHit) {
      return bestHit;
    }

    return {
      hit: false,
      distance: maxDistance,
      pointX: originX + rayDirX * maxDistance,
      pointZ: originZ + rayDirZ * maxDistance
    };
  }

  return castGridRayFallback(level, originX, originZ, rayDirX, rayDirZ, maxDistance);
}

export function castGridRay(level, originX, originZ, dirX, dirZ, maxDistance = 64) {
  return castWorldRay(level, originX, originZ, dirX, dirZ, maxDistance);
}

export function hasLineOfSight(level, originX, originZ, targetX, targetZ, maxDistance = 64) {
  const dx = targetX - originX;
  const dz = targetZ - originZ;
  const ray = castWorldRay(level, originX, originZ, dx, dz, maxDistance);
  const targetDistance = Math.hypot(dx, dz);
  return !ray.hit || ray.distance >= targetDistance - 0.05;
}
