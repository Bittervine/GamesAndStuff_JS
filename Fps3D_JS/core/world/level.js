import { ENEMY_CHAR_MAP } from '../../data/enemies.js';
import {
  buildPolygonEdges,
  computeBoundsFromPoints,
  normalizeLoop,
  normalizeSurface,
  pointInConvexPolygon,
  polygonCentroid,
  polygonSignedArea,
  segmentKey,
  surfaceHeightAt,
  toPoint2
} from './spatial.js';

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
  const walls = [];
  const seenWalls = new Set();

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
    }
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
    grid,
    rows: grid.map((row) => row.join('')),
    spawn,
    enemySpawns,
    pickups,
    exit,
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
