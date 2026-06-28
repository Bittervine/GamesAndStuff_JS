import { normalizeRotationRadians, placementCenter } from "../shared/level-transform.js";

const DEFAULT_CULL_MARGIN_PX = 96;
const DEFAULT_SPATIAL_BIN_SIZE = 768;

function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

export function visualSortKey(visual, index = 0) {
    if (Number.isFinite(Number(visual?.order))) {
        return Number(visual.order);
    }
    const layer = visual?.layer || "terrain";
    const layerOrder = layer === "decorBack"
        ? 0
        : layer === "terrain"
            ? 10000
            : layer === "mask"
                ? 20000
                : 30000;
    return layerOrder + index;
}

export function visualWorldBounds(visual) {
    const width = Math.max(0, finiteNumber(visual?.w, 0));
    const height = Math.max(0, finiteNumber(visual?.h, 0));
    if (visual?.kind === "cutoutMask") {
        return {
            minX: finiteNumber(visual.x, 0),
            minY: finiteNumber(visual.y, 0),
            maxX: finiteNumber(visual.x, 0) + width,
            maxY: finiteNumber(visual.y, 0) + height
        };
    }

    const center = placementCenter(visual || {});
    const rotation = normalizeRotationRadians(visual?.rotation, visual?.angle);
    const cosine = Math.abs(Math.cos(rotation));
    const sine = Math.abs(Math.sin(rotation));
    const extentX = cosine * width * 0.5 + sine * height * 0.5;
    const extentY = sine * width * 0.5 + cosine * height * 0.5;
    return {
        minX: center.x - extentX,
        minY: center.y - extentY,
        maxX: center.x + extentX,
        maxY: center.y + extentY
    };
}

export function expandedViewportWorldBounds(view, parallaxOffset = null, marginPixels = DEFAULT_CULL_MARGIN_PX) {
    const zoom = Math.max(0.0001, finiteNumber(view?.zoom, 1));
    const width = Math.max(1, finiteNumber(view?.virtualW, finiteNumber(view?.w, 1) / zoom));
    const height = Math.max(1, finiteNumber(view?.virtualH, finiteNumber(view?.h, 1) / zoom));
    const offsetX = finiteNumber(parallaxOffset?.x, 0);
    const offsetY = finiteNumber(parallaxOffset?.y, 0);
    const margin = Math.max(0, finiteNumber(marginPixels, DEFAULT_CULL_MARGIN_PX)) / zoom;
    return {
        minX: finiteNumber(view?.x, 0) + offsetX - margin,
        minY: finiteNumber(view?.y, 0) + offsetY - margin,
        maxX: finiteNumber(view?.x, 0) + offsetX + width + margin,
        maxY: finiteNumber(view?.y, 0) + offsetY + height + margin
    };
}

export function boundsIntersect(a, b) {
    return Boolean(a && b) &&
        a.maxX >= b.minX &&
        a.minX <= b.maxX &&
        a.maxY >= b.minY &&
        a.minY <= b.maxY;
}

export function visualIntersectsViewport(visualOrBounds, view, parallaxOffset = null, marginPixels = DEFAULT_CULL_MARGIN_PX) {
    const bounds = visualOrBounds && Number.isFinite(Number(visualOrBounds.minX))
        ? visualOrBounds
        : visualWorldBounds(visualOrBounds);
    return boundsIntersect(bounds, expandedViewportWorldBounds(view, parallaxOffset, marginPixels));
}

function buildSpatialPartition(entries, binSize = DEFAULT_SPATIAL_BIN_SIZE) {
    const safeBinSize = Math.max(128, finiteNumber(binSize, DEFAULT_SPATIAL_BIN_SIZE));
    const bins = new Map();
    const dynamicEntries = [];
    const atlasIds = new Set();
    let hasCutout = false;

    for (let sortedIndex = 0; sortedIndex < entries.length; sortedIndex += 1) {
        const entry = entries[sortedIndex];
        entry.sortedIndex = sortedIndex;
        if (entry.visual?.kind === "cutoutMask") hasCutout = true;
        if (entry.visual?.kind === "atlasSprite" && entry.visual?.atlasId) atlasIds.add(entry.visual.atlasId);
        if (entry.visual?.dynamicPosition) {
            dynamicEntries.push(entry);
            continue;
        }
        const minBin = Math.floor(entry.bounds.minX / safeBinSize);
        const maxBin = Math.floor(entry.bounds.maxX / safeBinSize);
        for (let bin = minBin; bin <= maxBin; bin += 1) {
            if (!bins.has(bin)) bins.set(bin, []);
            bins.get(bin).push(entry);
        }
    }

    return {
        entries,
        bins,
        dynamicEntries,
        binSize: safeBinSize,
        hasCutout,
        atlasIds
    };
}

export function buildWorldVisualCache(visuals = [], options = {}) {
    const source = Array.isArray(visuals) ? visuals : [];
    const entries = source.map((visual, index) => ({
        visual,
        index,
        bounds: visualWorldBounds(visual),
        sortKey: visualSortKey(visual, index)
    }));
    entries.sort((a, b) => a.sortKey - b.sortKey || a.index - b.index);

    const main = entries.filter(({ visual }) => visual?.layer !== "actorFront" && visual?.layer !== "caveForeground");
    const actorFront = entries.filter(({ visual }) => visual?.layer === "actorFront");
    const caveForeground = entries.filter(({ visual }) => visual?.layer === "caveForeground");
    const binSize = options.binSize || DEFAULT_SPATIAL_BIN_SIZE;

    return {
        source,
        sourceLength: source.length,
        main,
        actorFront,
        caveForeground,
        spatial: {
            main: buildSpatialPartition(main, binSize),
            actorFront: buildSpatialPartition(actorFront, binSize),
            caveForeground: buildSpatialPartition(caveForeground, binSize)
        }
    };
}

export function queryWorldVisualEntries(
    cache,
    partitionName,
    view,
    parallaxOffset = null,
    marginPixels = DEFAULT_CULL_MARGIN_PX
) {
    const partition = cache?.spatial?.[partitionName];
    const fallbackEntries = Array.isArray(cache?.[partitionName]) ? cache[partitionName] : [];
    if (!partition) {
        return {
            entries: fallbackEntries,
            total: fallbackEntries.length,
            spatialCulled: 0,
            partition: null
        };
    }

    const viewportBounds = expandedViewportWorldBounds(view, parallaxOffset, marginPixels);
    const minBin = Math.floor(viewportBounds.minX / partition.binSize);
    const maxBin = Math.floor(viewportBounds.maxX / partition.binSize);
    const seen = new Set();
    const candidates = [];
    for (let bin = minBin; bin <= maxBin; bin += 1) {
        for (const entry of partition.bins.get(bin) || []) {
            if (seen.has(entry)) continue;
            seen.add(entry);
            if (boundsIntersect(entry.bounds, viewportBounds)) candidates.push(entry);
        }
    }
    for (const entry of partition.dynamicEntries) {
        if (seen.has(entry)) continue;
        seen.add(entry);
        const currentBounds = visualWorldBounds(entry.visual);
        if (boundsIntersect(currentBounds, viewportBounds)) {
            candidates.push({ ...entry, bounds: currentBounds });
        }
    }
    candidates.sort((a, b) => a.sortedIndex - b.sortedIndex);
    return {
        entries: candidates,
        total: partition.entries.length,
        spatialCulled: Math.max(0, partition.entries.length - candidates.length),
        partition
    };
}
