import { ENEMY_CHAR_MAP } from '../../data/enemies.js';
import {
  buildPolygonEdges,
  computeBoundsFromPoints,
  distanceSqPointToSegment,
  normalizeLoop,
  normalizeSurface,
  pointInConvexPolygon,
  polygonCentroid,
  polygonSignedArea,
  segmentKey,
  surfaceHeightAt,
  toPoint2
} from './spatial.js';

const GEOMETRY_EPSILON = 1e-6;

const PICKUP_CHAR_MAP = {
  h: { kind: 'health', amount: 25 },
  a: { kind: 'armor', amount: 25 },
  u: { kind: 'ammo', ammoType: 'bullet', amount: 40 },
  s: { kind: 'ammo', ammoType: 'shell', amount: 8 },
  r: { kind: 'ammo', ammoType: 'rocket', amount: 4 },
  c: { kind: 'ammo', ammoType: 'cell', amount: 40 },
  k: { kind: 'key', key: 'yellow' }
};

function normalizeSpawnPoint(spawn, fallbackYaw = 0) {
  if (!spawn) {
    return null;
  }

  const point = toPoint2(spawn);
  return {
    x: point.x,
    z: point.z,
    y: Number(spawn.y ?? spawn.height ?? 0) || 0,
    yaw: Number(spawn.yaw ?? fallbackYaw) || 0,
    sector: typeof spawn.sector === 'string' ? spawn.sector : typeof spawn.sectorId === 'string' ? spawn.sectorId : null
  };
}

function normalizeEntityList(entries, kind) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries.map((entry) => {
    const point = toPoint2(entry);
    return {
      ...entry,
      kind: entry.kind || kind,
      x: point.x,
      z: point.z
    };
  });
}

function normalizeDoorEdgeReference(ref, fallbackSectorId = null) {
  if (typeof ref === 'number' || typeof ref === 'string') {
    const sectorId = fallbackSectorId;
    const edgeIndex = Number(ref);
    if (typeof sectorId === 'string' && sectorId.length > 0 && Number.isInteger(edgeIndex) && edgeIndex >= 0) {
      return {
        sectorId,
        edgeIndex
      };
    }
    return null;
  }

  if (!ref || typeof ref !== 'object') {
    return null;
  }

  const sectorId = typeof ref.sectorId === 'string'
    ? ref.sectorId
    : typeof ref.sector === 'string'
      ? ref.sector
      : fallbackSectorId;
  const edgeIndex = Number(ref.edgeIndex ?? ref.edge ?? ref.index);

  if (typeof sectorId !== 'string' || sectorId.length === 0 || !Number.isInteger(edgeIndex) || edgeIndex < 0) {
    return null;
  }

  return {
    sectorId,
    edgeIndex
  };
}

function normalizeDoorDefinition(door, index, fallbackSectorId = null) {
  if (!door || typeof door !== 'object') {
    throw new TypeError('door definition must be an object');
  }

  const id = door.id || `door-${index + 1}`;
  const name = door.name || door.label || id;
  const open = !!(door.open ?? door.isOpen ?? false);
  const locked = !!door.locked;
  const doorSectorId = typeof door.sectorId === 'string'
    ? door.sectorId
    : typeof door.sector === 'string'
      ? door.sector
      : fallbackSectorId;
  const requiredKey = typeof door.requiredKey === 'string'
    ? door.requiredKey
    : typeof door.key === 'string'
      ? door.key
      : null;
  const rawEdges = Array.isArray(door.edges) && door.edges.length > 0
    ? door.edges
    : door.edge && typeof door.edge === 'object'
      ? [door.edge]
      : [door];
  const edges = [];

  for (const rawEdge of rawEdges) {
    const edgeRef = normalizeDoorEdgeReference(rawEdge, doorSectorId);
    if (!edgeRef) {
      continue;
    }
    edges.push(edgeRef);
  }

  if (edges.length === 0) {
    throw new TypeError(`door ${id} must reference at least one sector edge`);
  }

  return {
    type: 'door',
    id,
    name,
    open,
    locked,
    requiredKey,
    edges
  };
}

function normalizePortalMap(sector) {
  const openEdges = new Map();

  function markOpen(edgeIndex, portalTo = null) {
    if (!Number.isInteger(edgeIndex) || edgeIndex < 0) {
      return;
    }

    openEdges.set(edgeIndex, portalTo);
  }

  if (Array.isArray(sector.portalEdges)) {
    for (const edgeIndex of sector.portalEdges) {
      markOpen(Number(edgeIndex), null);
    }
  }

  if (Array.isArray(sector.openEdges)) {
    for (const edgeIndex of sector.openEdges) {
      markOpen(Number(edgeIndex), null);
    }
  }

  if (Array.isArray(sector.portals)) {
    for (const portal of sector.portals) {
      if (!portal || typeof portal !== 'object') {
        continue;
      }
      const edgeIndex = Number(portal.edge ?? portal.index ?? portal.edgeIndex);
      const portalTo = typeof portal.to === 'string' ? portal.to : typeof portal.neighbor === 'string' ? portal.neighbor : null;
      markOpen(edgeIndex, portalTo);
    }
  } else if (sector.portals && typeof sector.portals === 'object') {
    for (const [edgeIndexText, portalValue] of Object.entries(sector.portals)) {
      const edgeIndex = Number(edgeIndexText);
      const portalTo = typeof portalValue === 'string' ? portalValue : portalValue && typeof portalValue === 'object'
        ? (typeof portalValue.to === 'string' ? portalValue.to : typeof portalValue.neighbor === 'string' ? portalValue.neighbor : null)
        : null;
      markOpen(edgeIndex, portalTo);
    }
  }

  return openEdges;
}

function orientation(ax, az, bx, bz, cx, cz) {
  return (bx - ax) * (cz - az) - (bz - az) * (cx - ax);
}

function onSegment(ax, az, bx, bz, px, pz) {
  return px >= Math.min(ax, bx) - GEOMETRY_EPSILON
    && px <= Math.max(ax, bx) + GEOMETRY_EPSILON
    && pz >= Math.min(az, bz) - GEOMETRY_EPSILON
    && pz <= Math.max(az, bz) + GEOMETRY_EPSILON;
}

function segmentsIntersect(ax, az, bx, bz, cx, cz, dx, dz) {
  const o1 = orientation(ax, az, bx, bz, cx, cz);
  const o2 = orientation(ax, az, bx, bz, dx, dz);
  const o3 = orientation(cx, cz, dx, dz, ax, az);
  const o4 = orientation(cx, cz, dx, dz, bx, bz);

  if ((o1 > GEOMETRY_EPSILON && o2 < -GEOMETRY_EPSILON) || (o1 < -GEOMETRY_EPSILON && o2 > GEOMETRY_EPSILON)) {
    if ((o3 > GEOMETRY_EPSILON && o4 < -GEOMETRY_EPSILON) || (o3 < -GEOMETRY_EPSILON && o4 > GEOMETRY_EPSILON)) {
      return true;
    }
  }

  if (Math.abs(o1) <= GEOMETRY_EPSILON && onSegment(ax, az, bx, bz, cx, cz)) return true;
  if (Math.abs(o2) <= GEOMETRY_EPSILON && onSegment(ax, az, bx, bz, dx, dz)) return true;
  if (Math.abs(o3) <= GEOMETRY_EPSILON && onSegment(cx, cz, dx, dz, ax, az)) return true;
  if (Math.abs(o4) <= GEOMETRY_EPSILON && onSegment(cx, cz, dx, dz, bx, bz)) return true;
  return false;
}

function isConvexLoop(loop) {
  let turn = 0;
  for (let index = 0; index < loop.length; index += 1) {
    const a = loop[index];
    const b = loop[(index + 1) % loop.length];
    const c = loop[(index + 2) % loop.length];
    const cross = orientation(a.x, a.z, b.x, b.z, c.x, c.z);
    if (Math.abs(cross) <= GEOMETRY_EPSILON) {
      continue;
    }

    const sign = Math.sign(cross);
    if (turn === 0) {
      turn = sign;
    } else if (sign !== turn) {
      return false;
    }
  }

  return true;
}

function collectSectorGeometryDiagnostics(sector) {
  const issues = [];

  if (!sector || !Array.isArray(sector.loop) || sector.loop.length < 3) {
    return issues;
  }

  const area = polygonSignedArea(sector.loop);
  if (Math.abs(area) <= GEOMETRY_EPSILON) {
    issues.push({
      type: 'degenerateLoop',
      severity: 'warning',
      sectorId: sector.id,
      message: `Sector "${sector.id}" has near-zero area.`
    });
  }

  if (!isConvexLoop(sector.loop)) {
    issues.push({
      type: 'nonConvexLoop',
      severity: 'warning',
      sectorId: sector.id,
      message: `Sector "${sector.id}" is not convex.`
    });
  }

  if (Array.isArray(sector.edges)) {
    for (const edge of sector.edges) {
      if (edge.length > GEOMETRY_EPSILON) {
        continue;
      }

      issues.push({
        type: 'zeroLengthEdge',
        severity: 'warning',
        sectorId: sector.id,
        edgeIndex: edge.index,
        message: `Sector "${sector.id}" edge ${edge.index} has zero length.`
      });
    }
  }

  const edges = buildPolygonEdges(sector.loop);
  for (let i = 0; i < edges.length; i += 1) {
    const first = edges[i];
    for (let j = i + 1; j < edges.length; j += 1) {
      if (j === i + 1 || (i === 0 && j === edges.length - 1)) {
        continue;
      }

      const second = edges[j];
      if (!segmentsIntersect(first.ax, first.az, first.bx, first.bz, second.ax, second.az, second.bx, second.bz)) {
        continue;
      }

      issues.push({
        type: 'selfIntersectingLoop',
        severity: 'error',
        sectorId: sector.id,
        edgeA: first.index,
        edgeB: second.index,
        message: `Sector "${sector.id}" has self-intersecting edges ${first.index} and ${second.index}.`
      });
    }
  }

  return issues;
}

function collectBrushLevelDiagnostics(level) {
  const issues = [];
  for (const sector of level.sectors || []) {
    issues.push(...collectSectorGeometryDiagnostics(sector));
  }
  return issues;
}

function collectRawDoorDefinitions(definition) {
  const rawDoors = [];

  if (Array.isArray(definition.doors)) {
    for (const door of definition.doors) {
      rawDoors.push({
        door,
        fallbackSectorId: null
      });
    }
  }

  if (Array.isArray(definition.sectors)) {
    for (const sector of definition.sectors) {
      if (!sector || typeof sector !== 'object' || !Array.isArray(sector.doors)) {
        continue;
      }

      for (const door of sector.doors) {
        rawDoors.push({
          door,
          fallbackSectorId: typeof sector.id === 'string' ? sector.id : null
        });
      }
    }
  }

  return rawDoors;
}

function normalizeSectorDefinition(sector, index) {
  if (!sector || typeof sector !== 'object') {
    throw new TypeError('sector definition must be an object');
  }

  const loop = normalizeLoop(sector.loop);
  const portalEdges = normalizePortalMap(sector);
  const floorSurface = normalizeSurface(sector.floor ?? sector.floorHeight ?? 0, 0);
  const ceilingSurface = normalizeSurface(sector.ceiling ?? sector.ceilingHeight ?? 2.8, 2.8);
  const winding = Math.sign(polygonSignedArea(loop)) || 1;
  const edges = buildPolygonEdges(loop).map((edge) => {
    const portalTo = portalEdges.get(edge.index) ?? null;
    const solid = !portalEdges.has(edge.index);
    const edgeDx = edge.bx - edge.ax;
    const edgeDz = edge.bz - edge.az;
    const normal = winding > 0
      ? { x: edgeDz, z: -edgeDx }
      : { x: -edgeDz, z: edgeDx };
    const normalLength = Math.hypot(normal.x, normal.z) || 1;

    return {
      ...edge,
      solid,
      portalTo,
      normal: {
        x: normal.x / normalLength,
        z: normal.z / normalLength
      }
    };
  });

  return {
    type: 'sector',
    id: sector.id || `sector-${index + 1}`,
    name: sector.name || sector.id || `Sector ${index + 1}`,
    loop,
    edges,
    floorSurface,
    ceilingSurface,
    floorMaterial: sector.floorMaterial || 'floor',
    ceilingMaterial: sector.ceilingMaterial || 'ceiling',
    wallMaterial: sector.wallMaterial || 'wall',
    ambientLight: sector.ambientLight ?? null,
    light: Number(sector.light ?? sector.ambientLight ?? 0) || 0,
    centroid: polygonCentroid(loop),
    area: polygonSignedArea(loop)
  };
}

function buildBrushLevel(definition) {
  const sectors = definition.sectors.map((sector, index) => normalizeSectorDefinition(sector, index));
  const sectorById = new Map(sectors.map((sector) => [sector.id, sector]));
  const rawDoors = collectRawDoorDefinitions(definition);
  const doors = rawDoors.map(({ door, fallbackSectorId }, index) => normalizeDoorDefinition(door, index, fallbackSectorId));
  const doorById = new Map();
  const doorByEdgeKey = new Map();
  const walls = [];
  const seenWalls = new Set();

  for (const door of doors) {
    if (doorById.has(door.id)) {
      throw new RangeError(`duplicate door id "${door.id}"`);
    }
    doorById.set(door.id, door);

    for (const edgeRef of door.edges) {
      const sector = sectorById.get(edgeRef.sectorId);
      const edge = sector?.edges?.[edgeRef.edgeIndex];
      if (!edge) {
        throw new RangeError(`door ${door.id} references missing edge "${edgeRef.sectorId}:${edgeRef.edgeIndex}"`);
      }

      const edgeKey = `${edgeRef.sectorId}:${edgeRef.edgeIndex}`;
      if (doorByEdgeKey.has(edgeKey)) {
        throw new RangeError(`duplicate door edge reference "${edgeKey}"`);
      }
      doorByEdgeKey.set(edgeKey, door.id);
    }
  }

  for (const sector of sectors) {
    for (const edge of sector.edges) {
      const doorId = doorByEdgeKey.get(`${sector.id}:${edge.index}`) ?? null;
      if (!doorId) {
        continue;
      }

      edge.doorId = doorId;
      edge.solid = true;
    }
  }

  const allPoints = [];
  for (const sector of sectors) {
    allPoints.push(...sector.loop);
    for (const edge of sector.edges) {
      if (!edge.solid) {
        continue;
      }

      const key = segmentKey(edge.ax, edge.az, edge.bx, edge.bz);
      if (seenWalls.has(key)) {
        continue;
      }
      seenWalls.add(key);

      walls.push({
        id: `${sector.id}:${edge.index}`,
        sectorId: sector.id,
        ...edge,
        material: sector.wallMaterial,
        floorSurface: sector.floorSurface,
        ceilingSurface: sector.ceilingSurface
      });
    }
  }

  const spawn = normalizeSpawnPoint(definition.spawn, definition.spawnYaw ?? 0) || {
    x: sectors[0] ? sectors[0].centroid.x : 1.5,
    z: sectors[0] ? sectors[0].centroid.z : 1.5,
    y: 0,
    yaw: definition.spawnYaw ?? 0,
    sector: sectors[0] ? sectors[0].id : null
  };

  if (!spawn.sector && sectors[0]) {
    spawn.sector = sectors[0].id;
  }

  const enemySpawns = normalizeEntityList(
    definition.enemySpawns || definition.enemies || definition.entities?.enemies,
    'enemy'
  ).map((enemy) => ({
    ...enemy,
    kind: enemy.kind || enemy.enemyKind || enemy.type || 'zombieman'
  }));

  const pickups = normalizeEntityList(
    definition.pickups || definition.entities?.pickups,
    'pickup'
  ).map((pickup) => ({
    ...pickup,
    kind: pickup.kind || 'health'
  }));

  const exit = definition.exit ? {
    ...definition.exit,
    ...toPoint2(definition.exit)
  } : null;

  const bounds = computeBoundsFromPoints([
    ...allPoints,
    spawn,
    ...enemySpawns,
    ...pickups,
    exit || spawn
  ]);

  const level = {
    id: definition.id || 'level',
    name: definition.name || 'Unnamed',
    ambientLight: definition.ambientLight ?? 0.2,
    skyColor: definition.skyColor || '#5d7496',
    width: Math.max(1, bounds.width),
    height: Math.max(1, bounds.height),
    bounds,
    sectors,
    sectorById,
    walls,
    doors,
    doorById,
    doorByEdgeKey,
    geometryVersion: 0,
    spawn,
    enemySpawns,
    pickups,
    exit,
    grid: null,
    rows: null,
    findSectorAtPoint(x, z) {
      return findSectorAtPoint(level, x, z);
    },
    getFloorHeightAt(x, z) {
      return getFloorHeightAt(level, x, z);
    },
    getCeilingHeightAt(x, z) {
      return getCeilingHeightAt(level, x, z);
    },
    isInside(x, z) {
      return isInsideLevel(level, x, z);
    },
    diagnostics: collectBrushLevelDiagnostics({
      sectors,
      walls,
      doors
    })
  };

  return level;
}

function buildGridLevel(definition) {
  const rows = normalizeLevelRows(definition.rows || []);
  const width = rows[0] ? rows[0].length : 0;
  const height = rows.length;
  const grid = rows.map((row) => row.split(''));
  const enemySpawns = [];
  const pickups = [];
  let spawn = null;
  let exit = null;

  for (let z = 0; z < height; z += 1) {
    for (let x = 0; x < width; x += 1) {
      const rawChar = grid[z][x] || '#';
      const char = rawChar === ' ' ? '.' : rawChar;
      const lower = char.toLowerCase();

      if (char === 'P') {
        spawn = {
          x: x + 0.5,
          z: z + 0.5,
          yaw: definition.spawnYaw ?? 0
        };
        grid[z][x] = '.';
        continue;
      }

      if (char === 'X') {
        exit = { x: x + 0.5, z: z + 0.5 };
        grid[z][x] = '.';
        continue;
      }

      if (Object.prototype.hasOwnProperty.call(ENEMY_CHAR_MAP, lower)) {
        enemySpawns.push({
          kind: ENEMY_CHAR_MAP[lower],
          x: x + 0.5,
          z: z + 0.5
        });
        grid[z][x] = '.';
        continue;
      }

      if (Object.prototype.hasOwnProperty.call(PICKUP_CHAR_MAP, lower)) {
        pickups.push({
          ...PICKUP_CHAR_MAP[lower],
          x: x + 0.5,
          z: z + 0.5
        });
        grid[z][x] = '.';
        continue;
      }

      grid[z][x] = char;
    }
  }

  if (!spawn) {
    spawn = { x: 1.5, z: 1.5, yaw: definition.spawnYaw ?? 0 };
  }

  const bounds = {
    minX: 0,
    minZ: 0,
    maxX: width,
    maxZ: height,
    width,
    height
  };

  return {
    id: definition.id || 'level',
    name: definition.name || 'Unnamed',
    ambientLight: definition.ambientLight ?? 0.2,
    skyColor: definition.skyColor || '#5d7496',
    width,
    height,
    bounds,
    sectors: [],
    sectorById: new Map(),
    walls: [],
    doors: [],
    doorById: new Map(),
    doorByEdgeKey: new Map(),
    geometryVersion: 0,
    grid,
    rows: grid.map((row) => row.join('')),
    spawn,
    enemySpawns,
    pickups,
    exit,
    diagnostics: [],
    findSectorAtPoint() {
      return null;
    },
    getFloorHeightAt() {
      return 0;
    },
    getCeilingHeightAt() {
      return 2.8;
    },
    isInside(x, z) {
      return x >= 0 && z >= 0 && x < width && z < height;
    }
  };
}

export function normalizeLevelRows(rows) {
  const normalizedRows = rows.map((row) => String(row));
  const width = normalizedRows.reduce((max, row) => Math.max(max, row.length), 0);

  return normalizedRows.map((row) => row.padEnd(width, '#'));
}

export function parseLevelDefinition(definition) {
  if (!definition || typeof definition !== 'object') {
    throw new TypeError('level definition must be an object');
  }

  if (Array.isArray(definition.sectors) && definition.sectors.length > 0) {
    return buildBrushLevel(definition);
  }

  return buildGridLevel(definition);
}

export function findSectorAtPoint(level, x, z) {
  if (!level || !Array.isArray(level.sectors)) {
    return null;
  }

  for (const sector of level.sectors) {
    if (pointInConvexPolygon(x, z, sector.loop)) {
      return sector;
    }
  }

  return null;
}

export function isInsideLevel(level, x, z) {
  return !!findSectorAtPoint(level, x, z);
}

export function getFloorHeightAt(level, x, z) {
  const sector = findSectorAtPoint(level, x, z);
  if (!sector) {
    return 0;
  }

  return surfaceHeightAt(sector.floorSurface, x, z);
}

export function getCeilingHeightAt(level, x, z) {
  const sector = findSectorAtPoint(level, x, z);
  if (!sector) {
    return 2.8;
  }

  return surfaceHeightAt(sector.ceilingSurface, x, z);
}

function getDoorEdge(level, edgeRef) {
  if (!level?.sectorById || !edgeRef) {
    return null;
  }

  const sector = level.sectorById.get(edgeRef.sectorId);
  if (!sector || !Array.isArray(sector.edges)) {
    return null;
  }

  return sector.edges[edgeRef.edgeIndex] || null;
}

export function isWallBlocking(level, wall) {
  if (!wall) {
    return false;
  }

  if (!wall.doorId) {
    return true;
  }

  const door = level?.doorById?.get(wall.doorId);
  return !door || !door.open;
}

export function findDoorNearPoint(level, x, z, maxDistance = 0.85) {
  if (!level?.doors || !Array.isArray(level.doors) || level.doors.length === 0) {
    return null;
  }

  const maxDistanceSq = maxDistance * maxDistance;
  let best = null;

  for (const door of level.doors) {
    if (!door || door.open || door.locked) {
      continue;
    }

    for (const edgeRef of door.edges) {
      const edge = getDoorEdge(level, edgeRef);
      if (!edge) {
        continue;
      }

      const distanceSq = distanceSqPointToSegment(x, z, edge.ax, edge.az, edge.bx, edge.bz);
      if (distanceSq > maxDistanceSq) {
        continue;
      }

      if (!best || distanceSq < best.distanceSq) {
        best = {
          door,
          edgeRef,
          edge,
          distanceSq
        };
      }
    }
  }

  return best;
}

export function setDoorOpen(level, doorId, open = true) {
  if (!level?.doorById) {
    return null;
  }

  const door = level.doorById.get(doorId);
  if (!door) {
    return null;
  }

  const nextOpen = !!open;
  if (door.open === nextOpen) {
    return door;
  }

  door.open = nextOpen;
  level.geometryVersion = (Number(level.geometryVersion) || 0) + 1;
  return door;
}

export function openDoor(level, doorId) {
  return setDoorOpen(level, doorId, true);
}

export function closeDoor(level, doorId) {
  return setDoorOpen(level, doorId, false);
}

export function getCell(level, x, z) {
  if (!level || !level.grid) return '#';
  if (x < 0 || z < 0 || z >= level.height || x >= level.width) return '#';
  return level.grid[z][x] || '#';
}

export function isSolidCell(level, x, z) {
  const cell = getCell(level, x, z);
  return cell === '#';
}

export function worldToCell(value) {
  return Math.floor(value);
}

export function cellToWorld(index) {
  return index + 0.5;
}
