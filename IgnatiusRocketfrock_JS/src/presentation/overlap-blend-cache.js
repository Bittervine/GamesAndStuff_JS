import { normalizeRotationRadians, placementCenter } from "../shared/level-transform.js";
import { visualSortKey, visualWorldBounds } from "./world-visual-cache.js";

export const OVERLAP_BLEND_CENTRAL_START = 0.25;
export const OVERLAP_BLEND_CENTRAL_END = 0.75;
export const DEFAULT_OVERLAP_BLEND_SPATIAL_BIN_SIZE = 768;
export const DEFAULT_OVERLAP_BLEND_MINIMUM_AREA = 1;

function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

export function overlapBlendVisualCacheKey(visual) {
    const authoredId = String(visual?.id || "");
    if (authoredId) return `id:${authoredId}`;
    return JSON.stringify([
        "visual",
        String(visual?.kind || ""),
        String(visual?.atlasId || ""),
        String(visual?.frame || visual?.assetId || ""),
        String(visual?.layer || "terrain"),
        visual?.onTop === true,
        finiteNumber(visual?.x, 0),
        finiteNumber(visual?.y, 0),
        finiteNumber(visual?.w, 0),
        finiteNumber(visual?.h, 0),
        finiteNumber(visual?.rotation, 0),
        Boolean(visual?.mirrorX),
        Boolean(visual?.mirrorY),
        finiteNumber(visual?.order, 0)
    ]);
}

export function overlapIntersectionBounds(a, b) {
    const minX = Math.max(a?.minX ?? 0, b?.minX ?? 0);
    const minY = Math.max(a?.minY ?? 0, b?.minY ?? 0);
    const maxX = Math.min(a?.maxX ?? 0, b?.maxX ?? 0);
    const maxY = Math.min(a?.maxY ?? 0, b?.maxY ?? 0);
    if (maxX <= minX || maxY <= minY) return null;
    return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY
    };
}

export function overlapBlendVisualEligible(visual) {
    if (!visual || (visual.kind !== "atlasSprite" && visual.kind !== "atlasAsset")) return false;
    if (visual.dynamicPosition || visual.movingPlatformId || visual.movement || visual.entityId) return false;
    if (visual.blendMode === "brightenOnly") return false;
    if (visual.blendOverlaps === false) return false;
    if (!(finiteNumber(visual.w, 0) > 0) || !(finiteNumber(visual.h, 0) > 0)) return false;
    return true;
}

function visualCorners(visual) {
    const width = Math.max(0, finiteNumber(visual?.w, 0));
    const height = Math.max(0, finiteNumber(visual?.h, 0));
    const center = placementCenter(visual);
    const rotation = normalizeRotationRadians(visual?.rotation);
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);
    const corners = [
        { x: -width * 0.5, y: -height * 0.5 },
        { x: width * 0.5, y: -height * 0.5 },
        { x: width * 0.5, y: height * 0.5 },
        { x: -width * 0.5, y: height * 0.5 }
    ];
    return corners.map((corner) => ({
        x: center.x + corner.x * cosine - corner.y * sine,
        y: center.y + corner.x * sine + corner.y * cosine
    }));
}

function polygonSignedArea(polygon) {
    let sum = 0;
    for (let index = 0; index < polygon.length; index += 1) {
        const current = polygon[index];
        const next = polygon[(index + 1) % polygon.length];
        sum += current.x * next.y - next.x * current.y;
    }
    return sum * 0.5;
}

function polygonArea(polygon) {
    return Math.abs(polygonSignedArea(polygon));
}

function polygonBounds(polygon) {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    for (const point of polygon) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
    }
    return {
        minX,
        minY,
        maxX,
        maxY,
        width: Math.max(0, maxX - minX),
        height: Math.max(0, maxY - minY)
    };
}

function lineIntersection(a, b, edgeA, edgeB) {
    const abX = b.x - a.x;
    const abY = b.y - a.y;
    const edgeX = edgeB.x - edgeA.x;
    const edgeY = edgeB.y - edgeA.y;
    const denominator = abX * edgeY - abY * edgeX;
    if (Math.abs(denominator) < 1e-9) return { ...b };
    const edgeToAX = edgeA.x - a.x;
    const edgeToAY = edgeA.y - a.y;
    const t = (edgeToAX * edgeY - edgeToAY * edgeX) / denominator;
    return { x: a.x + abX * t, y: a.y + abY * t };
}

function clipPolygonAgainstEdge(subject, edgeA, edgeB, orientation) {
    if (!subject.length) return [];
    const inside = (point) => {
        const cross = (edgeB.x - edgeA.x) * (point.y - edgeA.y) - (edgeB.y - edgeA.y) * (point.x - edgeA.x);
        return orientation >= 0 ? cross >= -1e-7 : cross <= 1e-7;
    };
    const output = [];
    let previous = subject[subject.length - 1];
    let previousInside = inside(previous);
    for (const current of subject) {
        const currentInside = inside(current);
        if (currentInside !== previousInside) {
            output.push(lineIntersection(previous, current, edgeA, edgeB));
        }
        if (currentInside) output.push(current);
        previous = current;
        previousInside = currentInside;
    }
    return output;
}

export function overlapBlendIntersectionPolygon(lowerVisual, upperVisual) {
    const lower = visualCorners(lowerVisual);
    const upper = visualCorners(upperVisual);
    const orientation = polygonSignedArea(lower);
    let result = upper;
    for (let index = 0; index < lower.length && result.length; index += 1) {
        result = clipPolygonAgainstEdge(result, lower[index], lower[(index + 1) % lower.length], orientation);
    }
    return result.length >= 3 ? result : [];
}

function pointInConvexPolygon(point, polygon) {
    if (!polygon?.length) return false;
    let sign = 0;
    for (let index = 0; index < polygon.length; index += 1) {
        const a = polygon[index];
        const b = polygon[(index + 1) % polygon.length];
        const cross = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
        if (Math.abs(cross) <= 1e-7) continue;
        const nextSign = cross > 0 ? 1 : -1;
        if (sign && sign !== nextSign) return false;
        sign = nextSign;
    }
    return true;
}

function overlapDescriptor(lowerVisual, upperVisual, minimumArea) {
    const lowerBounds = visualWorldBounds(lowerVisual);
    const upperBounds = visualWorldBounds(upperVisual);
    if (!overlapIntersectionBounds(lowerBounds, upperBounds)) return null;
    const polygon = overlapBlendIntersectionPolygon(lowerVisual, upperVisual);
    if (polygon.length < 3 || polygonArea(polygon) < minimumArea) return null;
    const bounds = polygonBounds(polygon);
    if (!(bounds.width > 0) || !(bounds.height > 0)) return null;

    const lowerCenter = placementCenter(lowerVisual);
    const upperCenter = placementCenter(upperVisual);
    const horizontal = Math.abs(upperCenter.x - lowerCenter.x) >= Math.abs(upperCenter.y - lowerCenter.y);
    const forward = horizontal ? upperCenter.x >= lowerCenter.x : upperCenter.y >= lowerCenter.y;
    return {
        lowerVisual,
        polygon,
        bounds,
        horizontal,
        forward
    };
}

function blendPartitionKey(visual) {
    return `${visual?.layer || "terrain"}|${visual?.onTop === true ? "top" : "base"}`;
}

/**
 * Builds one mask definition per upper asset. Earlier assets remain independent;
 * only the upper asset receives a bounded, asset-local alpha mask. A spatial
 * bin keeps long chains from degenerating into an all-pairs level scan.
 */
export function buildOverlapBlendEntries(entries = [], options = {}) {
    const minimumArea = Math.max(0, finiteNumber(options.minimumArea, DEFAULT_OVERLAP_BLEND_MINIMUM_AREA));
    const binSize = Math.max(128, finiteNumber(options.binSize, DEFAULT_OVERLAP_BLEND_SPATIAL_BIN_SIZE));
    const binsByPartition = new Map();
    const definitions = [];
    const ordered = (Array.isArray(entries) ? entries : [])
        .map((entry, sourceIndex) => ({
            ...entry,
            sourceIndex,
            sortKey: Number.isFinite(Number(entry?.sortKey))
                ? Number(entry.sortKey)
                : visualSortKey(entry?.visual, Number.isFinite(Number(entry?.index)) ? Number(entry.index) : sourceIndex)
        }))
        .sort((a, b) => a.sortKey - b.sortKey || a.sourceIndex - b.sourceIndex);

    for (const entry of ordered) {
        const visual = entry?.visual;
        if (!overlapBlendVisualEligible(visual)) continue;
        const bounds = entry.bounds || visualWorldBounds(visual);
        const partitionKey = blendPartitionKey(visual);
        if (!binsByPartition.has(partitionKey)) binsByPartition.set(partitionKey, new Map());
        const bins = binsByPartition.get(partitionKey);
        const minBin = Math.floor(bounds.minX / binSize);
        const maxBin = Math.floor(bounds.maxX / binSize);
        const candidates = new Set();
        for (let bin = minBin; bin <= maxBin; bin += 1) {
            for (const candidate of bins.get(bin) || []) candidates.add(candidate);
        }

        const overlaps = [];
        for (const candidate of candidates) {
            if (!overlapIntersectionBounds(candidate.bounds, bounds)) continue;
            const descriptor = overlapDescriptor(candidate.visual, visual, minimumArea);
            if (descriptor) overlaps.push(descriptor);
        }
        if (overlaps.length) {
            definitions.push({ ...entry, bounds, overlaps });
        }

        const prior = { ...entry, bounds };
        for (let bin = minBin; bin <= maxBin; bin += 1) {
            if (!bins.has(bin)) bins.set(bin, []);
            bins.get(bin).push(prior);
        }
    }
    return definitions;
}

function blendRampAlpha(position) {
    if (position <= OVERLAP_BLEND_CENTRAL_START) return 0;
    if (position >= OVERLAP_BLEND_CENTRAL_END) return 1;
    return (position - OVERLAP_BLEND_CENTRAL_START) /
        (OVERLAP_BLEND_CENTRAL_END - OVERLAP_BLEND_CENTRAL_START);
}

export function overlapBlendAlphaForWorldPoint(point, overlaps = []) {
    let alpha = 1;
    for (const overlap of overlaps) {
        if (!pointInConvexPolygon(point, overlap.polygon)) continue;
        const coordinate = overlap.horizontal ? point.x : point.y;
        const minimum = overlap.horizontal ? overlap.bounds.minX : overlap.bounds.minY;
        const maximum = overlap.horizontal ? overlap.bounds.maxX : overlap.bounds.maxY;
        const extent = Math.max(1e-9, maximum - minimum);
        const position = overlap.forward
            ? (coordinate - minimum) / extent
            : (maximum - coordinate) / extent;
        alpha = Math.min(alpha, blendRampAlpha(position));
        if (alpha <= 0) return 0;
    }
    return alpha;
}

function createCanvasSurface(ownerDocument, width, height) {
    const safeWidth = Math.max(1, Math.ceil(width));
    const safeHeight = Math.max(1, Math.ceil(height));
    if (typeof OffscreenCanvas !== "undefined") {
        return new OffscreenCanvas(safeWidth, safeHeight);
    }
    const documentRef = ownerDocument || (typeof document !== "undefined" ? document : null);
    const surface = documentRef?.createElement?.("canvas");
    if (!surface) return null;
    surface.width = safeWidth;
    surface.height = safeHeight;
    return surface;
}

function sourcePixelWorldPoint(visual, pixelX, pixelY, sourceWidth, sourceHeight) {
    const width = Math.max(1e-9, finiteNumber(visual?.w, 1));
    const height = Math.max(1e-9, finiteNumber(visual?.h, 1));
    let localX = pixelX / Math.max(1, sourceWidth) * width;
    let localY = pixelY / Math.max(1, sourceHeight) * height;
    if (visual?.mirrorX) localX = width - localX;
    if (visual?.mirrorY) localY = height - localY;
    const center = placementCenter(visual);
    const rotation = normalizeRotationRadians(visual?.rotation);
    const dx = localX - width * 0.5;
    const dy = localY - height * 0.5;
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);
    return {
        x: center.x + dx * cosine - dy * sine,
        y: center.y + dx * sine + dy * cosine
    };
}

export function applyOverlapBlendAlphaMask({ pixels, width, height, visual, overlaps = [] }) {
    const sourceWidth = Math.max(1, Math.floor(finiteNumber(width, 1)));
    const sourceHeight = Math.max(1, Math.floor(finiteNumber(height, 1)));
    if (!pixels || pixels.length < sourceWidth * sourceHeight * 4 || !visual || !overlaps.length) {
        return pixels;
    }
    for (let y = 0; y < sourceHeight; y += 1) {
        for (let x = 0; x < sourceWidth; x += 1) {
            const pixelIndex = (y * sourceWidth + x) * 4;
            if (pixels[pixelIndex + 3] === 0) continue;
            const worldPoint = sourcePixelWorldPoint(visual, x + 0.5, y + 0.5, sourceWidth, sourceHeight);
            const maskAlpha = overlapBlendAlphaForWorldPoint(worldPoint, overlaps);
            if (maskAlpha >= 0.999999) continue;
            pixels[pixelIndex + 3] = Math.max(0, Math.min(255, Math.round(pixels[pixelIndex + 3] * maskAlpha)));
        }
    }
    return pixels;
}

/**
 * Copies only the upper asset frame and applies its overlap mask in source-pixel
 * space. The result remains one bounded texture per affected asset, regardless
 * of how far an overlap chain stretches across the level.
 */
export function createOverlapBlendSurface({ ownerDocument, definition, environmentAtlases, sourceForVisual }) {
    const visual = definition?.visual;
    if (!visual || !definition?.overlaps?.length) return null;
    const atlas = environmentAtlases?.get?.(visual.atlasId);
    const frameName = visual.frame || visual.assetId;
    const frame = (atlas?.frames || atlas?.manifest?.frames)?.[frameName];
    if (!atlas?.image || !frame) return null;

    const source = typeof sourceForVisual === "function"
        ? sourceForVisual(visual, atlas, frame)
        : null;
    const image = source?.image || atlas.renderImage || atlas.image;
    const sourceX = finiteNumber(source?.x, frame.x);
    const sourceY = finiteNumber(source?.y, frame.y);
    const sourceWidth = Math.max(1, Math.round(finiteNumber(source?.w, frame.w)));
    const sourceHeight = Math.max(1, Math.round(finiteNumber(source?.h, frame.h)));
    const surface = createCanvasSurface(ownerDocument, sourceWidth, sourceHeight);
    const context = surface?.getContext?.("2d", { willReadFrequently: true });
    if (!context || !image) return null;
    context.clearRect(0, 0, sourceWidth, sourceHeight);
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);

    let imageData;
    try {
        imageData = context.getImageData(0, 0, sourceWidth, sourceHeight);
    } catch {
        return null;
    }
    const pixels = imageData.data;
    applyOverlapBlendAlphaMask({
        pixels,
        width: sourceWidth,
        height: sourceHeight,
        visual,
        overlaps: definition.overlaps
    });
    context.putImageData(imageData, 0, 0);

    return {
        canvas: surface,
        visual,
        width: sourceWidth,
        height: sourceHeight,
        overlaps: definition.overlaps
    };
}
