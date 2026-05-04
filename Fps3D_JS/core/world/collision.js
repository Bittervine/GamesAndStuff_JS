import { closestPointOnSegment, distanceSqPointToSegment } from './spatial.js';
import { isInsideLevel, isWallBlocking } from './level.js';

function circleIntersectsCell(cx, cz, radius, cellX, cellZ) {
  const nearestX = Math.max(cellX, Math.min(cx, cellX + 1));
  const nearestZ = Math.max(cellZ, Math.min(cz, cellZ + 1));
  const dx = cx - nearestX;
  const dz = cz - nearestZ;
  return dx * dx + dz * dz < radius * radius;
}

export function isCircleBlocked(level, x, z, radius) {
  if (Array.isArray(level?.walls) && level.walls.length > 0) {
    if (!isInsideLevel(level, x, z)) {
      return true;
    }

    const radiusSq = radius * radius;
    for (const wall of level.walls) {
      if (!isWallBlocking(level, wall)) {
        continue;
      }

      if (distanceSqPointToSegment(x, z, wall.ax, wall.az, wall.bx, wall.bz) < radiusSq) {
        return true;
      }
    }

    return false;
  }

  const isSolidCell = level && typeof level.isSolidCell === 'function'
    ? level.isSolidCell.bind(level)
    : (gridLevel, cellX, cellZ) => {
        if (!gridLevel || !gridLevel.grid) return false;
        if (cellX < 0 || cellZ < 0 || cellZ >= gridLevel.height || cellX >= gridLevel.width) return true;
        return gridLevel.grid[cellZ][cellX] === '#';
      };

  const minX = Math.floor(x - radius);
  const maxX = Math.floor(x + radius);
  const minZ = Math.floor(z - radius);
  const maxZ = Math.floor(z + radius);

  for (let cellZ = minZ; cellZ <= maxZ; cellZ += 1) {
    for (let cellX = minX; cellX <= maxX; cellX += 1) {
      if (isSolidCell(level, cellX, cellZ) && circleIntersectsCell(x, z, radius, cellX, cellZ)) {
        return true;
      }
    }
  }

  return false;
}

export function moveCircle(level, x, z, radius, dx, dz) {
  if (Array.isArray(level?.walls) && level.walls.length > 0) {
    let nextX = x;
    let nextZ = z;

    if (!isCircleBlocked(level, x + dx, z + dz, radius)) {
      return { x: x + dx, z: z + dz };
    }

    if (!isCircleBlocked(level, x + dx, z, radius)) {
      nextX = x + dx;
    }

    if (!isCircleBlocked(level, nextX, z + dz, radius)) {
      nextZ = z + dz;
    }

    if (!isCircleBlocked(level, nextX, nextZ, radius)) {
      return { x: nextX, z: nextZ };
    }

    let candidateX = nextX;
    let candidateZ = nextZ;
    const radiusSq = radius * radius;

    for (let iteration = 0; iteration < 4; iteration += 1) {
      let moved = false;

      for (const wall of level.walls) {
        if (!isWallBlocking(level, wall)) {
          continue;
        }

        const nearest = closestPointOnSegment(candidateX, candidateZ, wall.ax, wall.az, wall.bx, wall.bz);
        if (nearest.distanceSq >= radiusSq) {
          continue;
        }

        let pushX = candidateX - nearest.x;
        let pushZ = candidateZ - nearest.z;
        let pushLength = Math.hypot(pushX, pushZ);

        if (pushLength <= 1e-6) {
          const fallbackNormal = wall.normal || { x: 1, z: 0 };
          pushX = fallbackNormal.x;
          pushZ = fallbackNormal.z;
          pushLength = Math.hypot(pushX, pushZ) || 1;
        }

        const penetration = radius - pushLength + 1e-4;
        candidateX += (pushX / pushLength) * penetration;
        candidateZ += (pushZ / pushLength) * penetration;
        moved = true;
      }

      if (!moved) {
        break;
      }
    }

    if (!isCircleBlocked(level, candidateX, candidateZ, radius)) {
      return { x: candidateX, z: candidateZ };
    }

    return { x, z };
  }

  let nextX = x;
  let nextZ = z;

  if (dx !== 0) {
    const candidateX = x + dx;
    if (!isCircleBlocked(level, candidateX, z, radius)) {
      nextX = candidateX;
    }
  }

  if (dz !== 0) {
    const candidateZ = z + dz;
    if (!isCircleBlocked(level, nextX, candidateZ, radius)) {
      nextZ = candidateZ;
    }
  }

  return { x: nextX, z: nextZ };
}

export function moveEntity(level, entity, dx, dz) {
  const moved = moveCircle(level, entity.x, entity.z, entity.radius, dx, dz);
  entity.x = moved.x;
  entity.z = moved.z;
  return entity;
}
