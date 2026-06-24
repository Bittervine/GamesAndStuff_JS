// Planned subsystem: broad-phase lookup helpers for dense enemy swarms.
// Rebuild/query helpers here should replace all-pairs dense-swarm scans over time.

function defaultGetPosition(item) {
  return item?.position || null;
}

function spatialCellIndex(value, cellSize) {
  return Math.floor(value / cellSize);
}

function spatialCellKey(ix, iy, iz) {
  return `${ix},${iy},${iz}`;
}

export function createSpatialHash(items, cellSize, getPosition = defaultGetPosition) {
  const safeCellSize = Math.max(Number.isFinite(cellSize) ? cellSize : 1, 0.0001);
  const cells = new Map();
  for (const item of items || []) {
    const position = getPosition(item);
    if (!position) {
      continue;
    }
    const ix = spatialCellIndex(position.x, safeCellSize);
    const iy = spatialCellIndex(position.y, safeCellSize);
    const iz = spatialCellIndex(position.z, safeCellSize);
    const key = spatialCellKey(ix, iy, iz);
    let bucket = cells.get(key);
    if (!bucket) {
      bucket = [];
      cells.set(key, bucket);
    }
    bucket.push(item);
  }
  return {
    cells,
    cellSize: safeCellSize,
    getPosition
  };
}

export function querySpatialHash(hash, position, radius, visit) {
  if (!hash || !position || typeof visit !== 'function') {
    return;
  }
  const safeRadius = Math.max(Number.isFinite(radius) ? radius : 0, 0);
  const cellRadius = Math.ceil(safeRadius / hash.cellSize);
  const cx = spatialCellIndex(position.x, hash.cellSize);
  const cy = spatialCellIndex(position.y, hash.cellSize);
  const cz = spatialCellIndex(position.z, hash.cellSize);
  for (let ix = cx - cellRadius; ix <= cx + cellRadius; ix += 1) {
    for (let iy = cy - cellRadius; iy <= cy + cellRadius; iy += 1) {
      for (let iz = cz - cellRadius; iz <= cz + cellRadius; iz += 1) {
        const bucket = hash.cells.get(spatialCellKey(ix, iy, iz));
        if (!bucket) {
          continue;
        }
        for (const item of bucket) {
          if (visit(item) === false) {
            return;
          }
        }
      }
    }
  }
}
