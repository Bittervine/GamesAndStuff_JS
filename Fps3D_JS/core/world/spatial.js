const DEFAULT_EPSILON = 1e-6;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function toPoint2(value) {
  if (Array.isArray(value)) {
    return {
      x: Number(value[0]) || 0,
      z: Number(value[1]) || 0
    };
  }

  if (value && typeof value === 'object') {
    return {
      x: Number(value.x ?? value[0] ?? 0) || 0,
      z: Number(value.z ?? value[1] ?? 0) || 0
    };
  }

  throw new TypeError('point must be an array or object');
}

export function normalizeLoop(loop) {
  if (!Array.isArray(loop) || loop.length < 3) {
    throw new TypeError('sector loop must contain at least 3 points');
  }

  return loop.map((point) => toPoint2(point));
}

export function polygonSignedArea(loop) {
  let area = 0;

  for (let index = 0; index < loop.length; index += 1) {
    const current = loop[index];
    const next = loop[(index + 1) % loop.length];
    area += current.x * next.z - next.x * current.z;
  }

  return area * 0.5;
}

export function polygonCentroid(loop) {
  let areaFactor = 0;
  let centroidX = 0;
  let centroidZ = 0;

  for (let index = 0; index < loop.length; index += 1) {
    const current = loop[index];
    const next = loop[(index + 1) % loop.length];
    const cross = current.x * next.z - next.x * current.z;
    areaFactor += cross;
    centroidX += (current.x + next.x) * cross;
    centroidZ += (current.z + next.z) * cross;
  }

  if (Math.abs(areaFactor) <= DEFAULT_EPSILON) {
    return { x: loop[0].x, z: loop[0].z };
  }

  const factor = 1 / (3 * areaFactor);
  return {
    x: centroidX * factor,
    z: centroidZ * factor
  };
}

export function computeBoundsFromPoints(points) {
  const bounds = {
    minX: Infinity,
    minZ: Infinity,
    maxX: -Infinity,
    maxZ: -Infinity
  };

  for (const point of points) {
    const { x, z } = toPoint2(point);
    if (x < bounds.minX) bounds.minX = x;
    if (z < bounds.minZ) bounds.minZ = z;
    if (x > bounds.maxX) bounds.maxX = x;
    if (z > bounds.maxZ) bounds.maxZ = z;
  }

  if (!Number.isFinite(bounds.minX)) {
    bounds.minX = 0;
    bounds.minZ = 0;
    bounds.maxX = 0;
    bounds.maxZ = 0;
  }

  bounds.width = bounds.maxX - bounds.minX;
  bounds.height = bounds.maxZ - bounds.minZ;
  return bounds;
}

export function pointInConvexPolygon(x, z, loop, epsilon = DEFAULT_EPSILON) {
  let winding = 0;

  for (let index = 0; index < loop.length; index += 1) {
    const current = loop[index];
    const next = loop[(index + 1) % loop.length];
    const cross = (next.x - current.x) * (z - current.z) - (next.z - current.z) * (x - current.x);

    if (Math.abs(cross) <= epsilon) {
      continue;
    }

    const sign = cross > 0 ? 1 : -1;
    if (winding === 0) {
      winding = sign;
    } else if (sign !== winding) {
      return false;
    }
  }

  return true;
}

export function pointInPolygon(x, z, loop, epsilon = DEFAULT_EPSILON) {
  if (!Array.isArray(loop) || loop.length < 3) {
    return false;
  }

  let inside = false;

  for (let index = 0; index < loop.length; index += 1) {
    const current = loop[index];
    const next = loop[(index + 1) % loop.length];
    const currentX = Number(current?.x ?? current?.[0] ?? 0) || 0;
    const currentZ = Number(current?.z ?? current?.[1] ?? 0) || 0;
    const nextX = Number(next?.x ?? next?.[0] ?? 0) || 0;
    const nextZ = Number(next?.z ?? next?.[1] ?? 0) || 0;

    const minX = Math.min(currentX, nextX) - epsilon;
    const maxX = Math.max(currentX, nextX) + epsilon;
    const minZ = Math.min(currentZ, nextZ) - epsilon;
    const maxZ = Math.max(currentZ, nextZ) + epsilon;
    if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
      const cross = ((nextX - currentX) * (z - currentZ)) - ((nextZ - currentZ) * (x - currentX));
      if (Math.abs(cross) <= epsilon) {
        return true;
      }
    }

    const intersects = ((currentZ > z) !== (nextZ > z))
      && (x < (((nextX - currentX) * (z - currentZ)) / ((nextZ - currentZ) || epsilon)) + currentX);
    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function polygonOrientation(loop) {
  return polygonSignedArea(loop) >= 0 ? 1 : -1;
}

function triangleArea(ax, az, bx, bz, cx, cz) {
  return ((bx - ax) * (cz - az)) - ((bz - az) * (cx - ax));
}

function pointInTriangle(px, pz, ax, az, bx, bz, cx, cz, orientation, epsilon = DEFAULT_EPSILON) {
  const ab = triangleArea(ax, az, bx, bz, px, pz);
  const bc = triangleArea(bx, bz, cx, cz, px, pz);
  const ca = triangleArea(cx, cz, ax, az, px, pz);

  if (orientation > 0) {
    return ab >= -epsilon && bc >= -epsilon && ca >= -epsilon;
  }

  return ab <= epsilon && bc <= epsilon && ca <= epsilon;
}

function cleanPolygonLoop(loop, epsilon = DEFAULT_EPSILON) {
  const cleaned = [];
  for (const point of loop) {
    const current = toPoint2(point);
    const previous = cleaned[cleaned.length - 1];
    if (previous && Math.abs(previous.x - current.x) <= epsilon && Math.abs(previous.z - current.z) <= epsilon) {
      continue;
    }
    cleaned.push(current);
  }

  if (cleaned.length >= 2) {
    const first = cleaned[0];
    const last = cleaned[cleaned.length - 1];
    if (Math.abs(first.x - last.x) <= epsilon && Math.abs(first.z - last.z) <= epsilon) {
      cleaned.pop();
    }
  }

  return cleaned;
}

export function triangulatePolygon(loop) {
  const points = cleanPolygonLoop(normalizeLoop(loop));
  if (points.length < 3) {
    return [];
  }

  const epsilon = DEFAULT_EPSILON;
  const orientation = polygonOrientation(points);
  const vertices = points.map((point, index) => ({
    index,
    point
  }));
  const triangles = [];
  let guard = 0;
  const maxIterations = points.length * points.length * 2;

  while (vertices.length > 3 && guard < maxIterations) {
    let earFound = false;

    for (let vertexIndex = 0; vertexIndex < vertices.length; vertexIndex += 1) {
      const prev = vertices[(vertexIndex + vertices.length - 1) % vertices.length];
      const current = vertices[vertexIndex];
      const next = vertices[(vertexIndex + 1) % vertices.length];
      const area = triangleArea(prev.point.x, prev.point.z, current.point.x, current.point.z, next.point.x, next.point.z);
      if (orientation > 0 ? area <= epsilon : area >= -epsilon) {
        continue;
      }

      let containsPoint = false;
      for (let testIndex = 0; testIndex < vertices.length; testIndex += 1) {
        if (testIndex === vertexIndex || testIndex === (vertexIndex + 1) % vertices.length || testIndex === (vertexIndex + vertices.length - 1) % vertices.length) {
          continue;
        }

        const testPoint = vertices[testIndex].point;
        if (pointInTriangle(
          testPoint.x,
          testPoint.z,
          prev.point.x,
          prev.point.z,
          current.point.x,
          current.point.z,
          next.point.x,
          next.point.z,
          orientation
        )) {
          containsPoint = true;
          break;
        }
      }

      if (containsPoint) {
        continue;
      }

      triangles.push([prev.point, current.point, next.point]);
      vertices.splice(vertexIndex, 1);
      earFound = true;
      break;
    }

    if (!earFound) {
      break;
    }

    guard += 1;
  }

  if (vertices.length === 3) {
    triangles.push([vertices[0].point, vertices[1].point, vertices[2].point]);
    return triangles;
  }

  if (triangles.length === 0 && points.length >= 3) {
    for (let index = 1; index < points.length - 1; index += 1) {
      triangles.push([points[0], points[index], points[index + 1]]);
    }
    return triangles;
  }

  if (vertices.length > 3) {
    for (let index = 1; index < vertices.length - 1; index += 1) {
      triangles.push([vertices[0].point, vertices[index].point, vertices[index + 1].point]);
    }
  }

  return triangles;
}

export function closestPointOnSegment(px, pz, ax, az, bx, bz) {
  const abx = bx - ax;
  const abz = bz - az;
  const apx = px - ax;
  const apz = pz - az;
  const lengthSq = abx * abx + abz * abz;
  const t = lengthSq <= DEFAULT_EPSILON ? 0 : clamp((apx * abx + apz * abz) / lengthSq, 0, 1);
  const x = ax + abx * t;
  const z = az + abz * t;
  const dx = px - x;
  const dz = pz - z;
  return {
    x,
    z,
    t,
    distanceSq: dx * dx + dz * dz
  };
}

export function distanceSqPointToSegment(px, pz, ax, az, bx, bz) {
  return closestPointOnSegment(px, pz, ax, az, bx, bz).distanceSq;
}

export function raySegmentIntersection(ox, oz, dx, dz, ax, az, bx, bz, maxDistance = Infinity) {
  const sx = bx - ax;
  const sz = bz - az;
  const denominator = dx * sz - dz * sx;

  if (Math.abs(denominator) <= DEFAULT_EPSILON) {
    return null;
  }

  const qpx = ax - ox;
  const qpz = az - oz;
  const t = (qpx * sz - qpz * sx) / denominator;
  const u = (qpx * dz - qpz * dx) / denominator;

  if (t < 0 || t > maxDistance || u < 0 || u > 1) {
    return null;
  }

  return {
    distance: t,
    pointX: ox + dx * t,
    pointZ: oz + dz * t,
    edgeT: u,
    edgeX: ax + sx * u,
    edgeZ: az + sz * u
  };
}

export function segmentKey(ax, az, bx, bz) {
  const axInt = Math.round(ax * 1000);
  const azInt = Math.round(az * 1000);
  const bxInt = Math.round(bx * 1000);
  const bzInt = Math.round(bz * 1000);
  if (axInt < bxInt || (axInt === bxInt && azInt <= bzInt)) {
    return `${axInt},${azInt}|${bxInt},${bzInt}`;
  }
  return `${bxInt},${bzInt}|${axInt},${azInt}`;
}

export function normalizeSurface(value, fallbackHeight = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return {
      base: value,
      slopeX: 0,
      slopeZ: 0,
      originX: 0,
      originZ: 0
    };
  }

  if (!value || typeof value !== 'object') {
    return {
      base: fallbackHeight,
      slopeX: 0,
      slopeZ: 0,
      originX: 0,
      originZ: 0
    };
  }

  return {
    base: Number(value.base ?? value.height ?? fallbackHeight) || 0,
    slopeX: Number(value.slopeX ?? 0) || 0,
    slopeZ: Number(value.slopeZ ?? 0) || 0,
    originX: Number(value.originX ?? value.centerX ?? 0) || 0,
    originZ: Number(value.originZ ?? value.centerZ ?? 0) || 0
  };
}

export function surfaceHeightAt(surface, x, z) {
  if (!surface) {
    return 0;
  }

  const originX = Number(surface.originX ?? 0) || 0;
  const originZ = Number(surface.originZ ?? 0) || 0;
  return surface.base + surface.slopeX * (x - originX) + surface.slopeZ * (z - originZ);
}

export function buildPolygonEdges(loop) {
  const edges = [];

  for (let index = 0; index < loop.length; index += 1) {
    const current = loop[index];
    const next = loop[(index + 1) % loop.length];
    edges.push({
      index,
      ax: current.x,
      az: current.z,
      bx: next.x,
      bz: next.z,
      length: Math.hypot(next.x - current.x, next.z - current.z)
    });
  }

  return edges;
}
