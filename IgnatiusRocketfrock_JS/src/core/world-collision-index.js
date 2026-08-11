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

function visualBounds(visual) {
    const transform = visual?.currentTransform && typeof visual.currentTransform === "object"
        ? visual.currentTransform
        : visual;
    const x = finite(transform?.x, finite(visual?.x));
    const y = finite(transform?.y, finite(visual?.y));
    const w = Math.max(0, finite(visual?.w));
    const h = Math.max(0, finite(visual?.h));
    const angle = finite(transform?.angle, finite(visual?.rotation));
    if (Math.abs(angle) <= 0.0000001) {
        return normalizedBounds({ x, y, w, h });
    }
    const halfW = w * 0.5;
    const halfH = h * 0.5;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const extentX = Math.abs(cosine) * halfW + Math.abs(sine) * halfH;
    const extentY = Math.abs(sine) * halfW + Math.abs(cosine) * halfH;
    const centerX = x + halfW;
    const centerY = y + halfH;
    return {
        minX: centerX - extentX,
        minY: centerY - extentY,
        maxX: centerX + extentX,
        maxY: centerY + extentY
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
        record?.runtimeDynamic ||
        record?.movement ||
        record?.currentTransform
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
    const segments = buildPartition(world?.segments, segmentBounds, safeBinSize);
    const visuals = buildPartition(world?.visuals, visualBounds, safeBinSize);
    const segmentsByVisualId = new Map();
    for (const segment of Array.isArray(world?.segments) ? world.segments : []) {
        const visualId = String(segment?.visualId || "");
        if (!visualId) continue;
        if (!segmentsByVisualId.has(visualId)) segmentsByVisualId.set(visualId, []);
        segmentsByVisualId.get(visualId).push(segment);
    }
    return {
        world,
        binSize: safeBinSize,
        solids: buildPartition(world?.solids, solidBounds, safeBinSize),
        segments,
        polygons: buildPartition(world?.collisionPolygons, polygonBounds, safeBinSize),
        visuals,
        segmentsByVisualId
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
        partitionStale(index.polygons, world.collisionPolygons) ||
        partitionStale(index.visuals, world.visuals)) {
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

export function queryWorldCollisionAssets(world, bounds) {
    return queryPartition(getIndex(world).visuals, bounds)
        .filter((visual) => visual?.kind === "atlasSprite" && visual?.collisionFromManifest !== false && visual?.id);
}

export function queryWorldSegmentsFromCollisionAssets(world, bounds) {
    const index = getIndex(world);
    const direct = queryPartition(index.segments, bounds);
    const included = new Set(direct);
    const visualIds = new Set(queryWorldCollisionAssets(world, bounds).map((visual) => String(visual.id)));
    for (const visualId of visualIds) {
        for (const segment of index.segmentsByVisualId.get(visualId) || []) included.add(segment);
    }
    // Preserve world-authored order so coincident-contact tie breaking remains deterministic.
    return (Array.isArray(world?.segments) ? world.segments : []).filter((segment) => included.has(segment));
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
