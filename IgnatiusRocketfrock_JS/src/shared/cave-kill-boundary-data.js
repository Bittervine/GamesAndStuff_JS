import {
    normalizeCaveWindow,
    sampleCaveWindowOutset
} from "./cave-window-data.js";

export const CAVE_FULL_BLACK_BOUNDARY_SOURCE = "caveFullBlackOutset";

const EPSILON = 0.000001;

function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function normalizedPoint(point) {
    return {
        x: finiteNumber(point?.x, 0),
        y: finiteNumber(point?.y, 0)
    };
}

function pointSegmentDistanceSquared(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared > 0
        ? Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared))
        : 0;
    const nearestX = a.x + dx * t;
    const nearestY = a.y + dy * t;
    const offsetX = point.x - nearestX;
    const offsetY = point.y - nearestY;
    return offsetX * offsetX + offsetY * offsetY;
}

export function pointInClosedPolygon(point, polygon) {
    const shape = Array.isArray(polygon) ? polygon : [];
    if (shape.length < 3) return false;
    const probe = normalizedPoint(point);
    let inside = false;
    for (let index = 0, previousIndex = shape.length - 1; index < shape.length; previousIndex = index, index += 1) {
        const a = normalizedPoint(shape[previousIndex]);
        const b = normalizedPoint(shape[index]);
        if (pointSegmentDistanceSquared(probe, a, b) <= EPSILON) return true;
        const crosses = (a.y > probe.y) !== (b.y > probe.y);
        if (!crosses) continue;
        const crossingX = a.x + ((probe.y - a.y) * (b.x - a.x)) / (b.y - a.y);
        if (probe.x < crossingX) inside = !inside;
    }
    return inside;
}

function orientation(a, b, c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function pointOnSegment(point, a, b) {
    return pointSegmentDistanceSquared(point, a, b) <= EPSILON;
}

function segmentsIntersect(a, b, c, d) {
    const abC = orientation(a, b, c);
    const abD = orientation(a, b, d);
    const cdA = orientation(c, d, a);
    const cdB = orientation(c, d, b);
    if (((abC > 0 && abD < 0) || (abC < 0 && abD > 0))
        && ((cdA > 0 && cdB < 0) || (cdA < 0 && cdB > 0))) {
        return true;
    }
    return (Math.abs(abC) <= EPSILON && pointOnSegment(c, a, b))
        || (Math.abs(abD) <= EPSILON && pointOnSegment(d, a, b))
        || (Math.abs(cdA) <= EPSILON && pointOnSegment(a, c, d))
        || (Math.abs(cdB) <= EPSILON && pointOnSegment(b, c, d));
}

function normalizedRect(rect) {
    const x = finiteNumber(rect?.x, 0);
    const y = finiteNumber(rect?.y, 0);
    const w = Math.max(0, finiteNumber(rect?.w, 0));
    const h = Math.max(0, finiteNumber(rect?.h, 0));
    return { x, y, w, h };
}

function rectCorners(rect) {
    const box = normalizedRect(rect);
    return [
        { x: box.x, y: box.y },
        { x: box.x + box.w, y: box.y },
        { x: box.x + box.w, y: box.y + box.h },
        { x: box.x, y: box.y + box.h }
    ];
}

function pointInRect(point, rect) {
    const box = normalizedRect(rect);
    return point.x >= box.x - EPSILON
        && point.x <= box.x + box.w + EPSILON
        && point.y >= box.y - EPSILON
        && point.y <= box.y + box.h + EPSILON;
}

export function closedPolygonIntersectsRect(polygon, rect) {
    const shape = Array.isArray(polygon)
        ? polygon
            .filter((point) => point && Number.isFinite(Number(point.x)) && Number.isFinite(Number(point.y)))
            .map(normalizedPoint)
        : [];
    if (shape.length < 3) return false;

    const corners = rectCorners(rect);
    if (corners.some((corner) => pointInClosedPolygon(corner, shape))) return true;
    if (shape.some((point) => pointInRect(point, rect))) return true;

    for (let shapeIndex = 0; shapeIndex < shape.length; shapeIndex += 1) {
        const a = shape[shapeIndex];
        const b = shape[(shapeIndex + 1) % shape.length];
        for (let rectIndex = 0; rectIndex < corners.length; rectIndex += 1) {
            const c = corners[rectIndex];
            const d = corners[(rectIndex + 1) % corners.length];
            if (segmentsIntersect(a, b, c, d)) return true;
        }
    }
    return false;
}

export function deriveCaveFullBlackKillBoundary(rawCaveWindow, { stepsPerSegment = 20 } = {}) {
    const caveWindow = normalizeCaveWindow(rawCaveWindow);
    const valid = caveWindow.enabled && caveWindow.points.length >= 3;
    const points = valid
        ? sampleCaveWindowOutset(caveWindow.points, caveWindow.feather, stepsPerSegment)
            .map(normalizedPoint)
        : [];
    return {
        version: 1,
        enabled: valid && points.length >= 3,
        source: CAVE_FULL_BLACK_BOUNDARY_SOURCE,
        feather: caveWindow.feather,
        stepsPerSegment: Math.max(1, Math.floor(finiteNumber(stepsPerSegment, 20))),
        points
    };
}

export function rectFullyOutsideCaveKillBoundary(boundary, rect) {
    if (!boundary?.enabled || !Array.isArray(boundary.points) || boundary.points.length < 3) {
        return false;
    }
    return !closedPolygonIntersectsRect(boundary.points, rect);
}
