const DEFAULT_COLLISION_BIN_SIZE = 640;
const WORLD_COLLISION_INDEX = new WeakMap();

function finite(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function normalizedBounds(bounds) {
    if (!bounds || typeof bounds !== "object") {
        return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }
    if (Number.isFinite(Number(bounds.minX))) {
        const minX = finite(bounds.minX);
        const minY = finite(bounds.minY);
        const maxX = finite(bounds.maxX, minX);
        const maxY = finite(bounds.maxY, minY);
        return {
            minX: Math.min(minX, maxX),
            minY: Math.min(minY, maxY),
            maxX: Math.max(minX, maxX),
            maxY: Math.max(minY, maxY)
        };
    }
    const x = finite(bounds.x);
    const y = finite(bounds.y);
    const w = finite(bounds.w);
    const h = finite(bounds.h);
    return {
        minX: Math.min(x, x + w),
        minY: Math.min(y, y + h),
        maxX: Math.max(x, x + w),
        maxY: Math.max(y, y + h)
    };
}

function intersects(a, b) {
    return a.maxX >= b.minX && a.minX <= b.maxX && a.maxY >= b.minY && a.minY <= b.maxY;
}

function solidBounds(solid) {
    return normalizedBounds(solid);
}

function segmentBounds(segment) {
    return {
        minX: Math.min(finite(segment?.x1), finite(segment?.x2)),
        minY: Math.min(finite(segment?.y1), finite(segment?.y2)),
        maxX: Math.max(finite(segment?.x1), finite(segment?.x2)),
        maxY: Math.max(finite(segment?.y1), finite(segment?.y2))
    };
}

function polygonBounds(polygon) {
    const points = Array.isArray(polygon?.points) ? polygon.points : [];
    if (!points.length) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const point of points) {
        const x = finite(point?.x);
        const y = finite(point?.y);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    }
    return { minX, minY, maxX, maxY };
}

function collisionRecordIsDynamic(record) {
    return Boolean(
        record?.movingPlatformId ||
        record?.reactiveObjectId ||
        record?.dynamicPosition ||
        record?.runtimeDynamic
    );
}

function buildPartition(records, boundsFor, binSize) {
    const bins = new Map();
    const dynamic = [];
    const source = Array.isArray(records) ? records : [];
    for (let index = 0; index < source.length; index += 1) {
        const record = source[index];
        const entry = { record, index, bounds: boundsFor(record) };
        if (collisionRecordIsDynamic(record)) {
            dynamic.push(entry);
            continue;
        }
        const minBin = Math.floor(entry.bounds.minX / binSize);
        const maxBin = Math.floor(entry.bounds.maxX / binSize);
        for (let bin = minBin; bin <= maxBin; bin += 1) {
            if (!bins.has(bin)) bins.set(bin, []);
            bins.get(bin).push(entry);
        }
    }
    return { source, sourceLength: source.length, bins, dynamic, boundsFor, binSize };
}

function buildIndex(world, binSize = DEFAULT_COLLISION_BIN_SIZE) {
    const safeBinSize = Math.max(128, finite(binSize, DEFAULT_COLLISION_BIN_SIZE));
    return {
        world,
        binSize: safeBinSize,
        solids: buildPartition(world?.solids, solidBounds, safeBinSize),
        segments: buildPartition(world?.segments, segmentBounds, safeBinSize),
        polygons: buildPartition(world?.collisionPolygons, polygonBounds, safeBinSize)
    };
}

function partitionStale(partition, source) {
    const safeSource = Array.isArray(source) ? source : [];
    return partition.source !== safeSource || partition.sourceLength !== safeSource.length;
}

function getIndex(world) {
    if (!world || typeof world !== "object") return buildIndex({});
    let index = WORLD_COLLISION_INDEX.get(world);
    if (!index ||
        partitionStale(index.solids, world.solids) ||
        partitionStale(index.segments, world.segments) ||
        partitionStale(index.polygons, world.collisionPolygons)) {
        index = buildIndex(world);
        WORLD_COLLISION_INDEX.set(world, index);
    }
    return index;
}

function queryPartition(partition, queryBounds) {
    const bounds = normalizedBounds(queryBounds);
    const minBin = Math.floor(bounds.minX / partition.binSize);
    const maxBin = Math.floor(bounds.maxX / partition.binSize);
    const seen = new Set();
    const entries = [];
    for (let bin = minBin; bin <= maxBin; bin += 1) {
        for (const entry of partition.bins.get(bin) || []) {
            if (seen.has(entry.record)) continue;
            seen.add(entry.record);
            if (intersects(entry.bounds, bounds)) entries.push(entry);
        }
    }
    for (const entry of partition.dynamic) {
        if (seen.has(entry.record)) continue;
        seen.add(entry.record);
        const currentBounds = partition.boundsFor(entry.record);
        if (intersects(currentBounds, bounds)) entries.push({ ...entry, bounds: currentBounds });
    }
    entries.sort((a, b) => a.index - b.index);
    return entries.map((entry) => entry.record);
}

export function queryWorldSolids(world, bounds) {
    return queryPartition(getIndex(world).solids, bounds);
}

export function queryWorldSegments(world, bounds) {
    return queryPartition(getIndex(world).segments, bounds);
}

export function queryWorldCollisionPolygons(world, bounds) {
    return queryPartition(getIndex(world).polygons, bounds);
}

export function worldCollisionIndexDiagnostics(world, bounds) {
    const index = getIndex(world);
    const query = normalizedBounds(bounds);
    const solids = queryPartition(index.solids, query);
    const segments = queryPartition(index.segments, query);
    const polygons = queryPartition(index.polygons, query);
    return {
        binSize: index.binSize,
        totals: {
            solids: index.solids.sourceLength,
            segments: index.segments.sourceLength,
            polygons: index.polygons.sourceLength
        },
        candidates: {
            solids: solids.length,
            segments: segments.length,
            polygons: polygons.length
        }
    };
}
