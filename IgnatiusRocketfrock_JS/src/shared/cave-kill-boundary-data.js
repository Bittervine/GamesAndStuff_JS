import {
    normalizeCaveWindow,
    sampleCaveWindowOutset
} from "./cave-window-data.js";

export const CAVE_FULL_BLACK_BOUNDARY_SOURCE = "caveFullBlackOutset";
export const CAVE_BOUNDARY_OVERSHOOT_RATIO = 0.2;
export const CAVE_KILL_INWARD_NORMAL_Y_MAX = -0.35;

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
    const nearest = closestPointOnSegment(point, a, b);
    const offsetX = point.x - nearest.x;
    const offsetY = point.y - nearest.y;
    return offsetX * offsetX + offsetY * offsetY;
}

function closestPointOnSegment(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared > 0
        ? Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared))
        : 0;
    return {
        x: a.x + dx * t,
        y: a.y + dy * t
    };
}

function polygonSignedArea(points) {
    let twiceArea = 0;
    for (let index = 0; index < points.length; index += 1) {
        const current = points[index];
        const next = points[(index + 1) % points.length];
        twiceArea += current.x * next.y - next.x * current.y;
    }
    return twiceArea * 0.5;
}

function normalizedVector(x, y) {
    const length = Math.hypot(x, y);
    if (length <= EPSILON) return { x: 0, y: 0 };
    return { x: x / length, y: y / length };
}

function buildBoundarySegments(points) {
    if (!Array.isArray(points) || points.length < 3) return [];
    const positiveArea = polygonSignedArea(points) >= 0;
    return points.map((rawA, index) => {
        const a = normalizedPoint(rawA);
        const b = normalizedPoint(points[(index + 1) % points.length]);
        const tangent = normalizedVector(b.x - a.x, b.y - a.y);
        const inwardNormal = positiveArea
            ? { x: -tangent.y, y: tangent.x }
            : { x: tangent.y, y: -tangent.x };
        return {
            a,
            b,
            inwardNormal,
            kind: inwardNormal.y < CAVE_KILL_INWARD_NORMAL_Y_MAX ? "killable" : "blockable"
        };
    });
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
    const interactionMargin = caveWindow.feather * CAVE_BOUNDARY_OVERSHOOT_RATIO;
    const fullBlackPoints = valid
        ? sampleCaveWindowOutset(caveWindow.points, caveWindow.feather, stepsPerSegment)
            .map(normalizedPoint)
        : [];
    const points = valid
        ? sampleCaveWindowOutset(caveWindow.points, caveWindow.feather + interactionMargin, stepsPerSegment)
            .map(normalizedPoint)
        : [];
    return {
        version: 2,
        enabled: valid && points.length >= 3,
        source: CAVE_FULL_BLACK_BOUNDARY_SOURCE,
        feather: caveWindow.feather,
        interactionMargin,
        stepsPerSegment: Math.max(1, Math.floor(finiteNumber(stepsPerSegment, 20))),
        fullBlackPoints,
        points,
        segments: buildBoundarySegments(points)
    };
}

export function rectFullyOutsideCaveKillBoundary(boundary, rect) {
    if (!boundary?.enabled || !Array.isArray(boundary.points) || boundary.points.length < 3) {
        return false;
    }
    return !closedPolygonIntersectsRect(boundary.points, rect);
}

export function evaluateCaveBoundaryRect(boundary, rect) {
    if (!rectFullyOutsideCaveKillBoundary(boundary, rect) || !Array.isArray(boundary?.segments) || boundary.segments.length === 0) {
        return {
            outside: false,
            segmentIndex: -1,
            kind: null,
            inwardNormal: { x: 0, y: 0 },
            correction: { x: 0, y: 0 }
        };
    }

    const box = normalizedRect(rect);
    const center = { x: box.x + box.w * 0.5, y: box.y + box.h * 0.5 };
    let segmentIndex = -1;
    let nearestPoint = null;
    let nearestDistanceSquared = Infinity;
    for (let index = 0; index < boundary.segments.length; index += 1) {
        const segment = boundary.segments[index];
        const candidate = closestPointOnSegment(center, segment.a, segment.b);
        const offsetX = center.x - candidate.x;
        const offsetY = center.y - candidate.y;
        const distanceSquared = offsetX * offsetX + offsetY * offsetY;
        if (distanceSquared >= nearestDistanceSquared) continue;
        segmentIndex = index;
        nearestPoint = candidate;
        nearestDistanceSquared = distanceSquared;
    }

    if (segmentIndex < 0 || !nearestPoint) {
        return {
            outside: false,
            segmentIndex: -1,
            kind: null,
            inwardNormal: { x: 0, y: 0 },
            correction: { x: 0, y: 0 }
        };
    }

    const segment = boundary.segments[segmentIndex];
    let correctionDirection = normalizedVector(nearestPoint.x - center.x, nearestPoint.y - center.y);
    if (Math.abs(correctionDirection.x) <= EPSILON && Math.abs(correctionDirection.y) <= EPSILON) {
        correctionDirection = segment.inwardNormal;
    }
    const centerDistance = Math.sqrt(Math.max(0, nearestDistanceSquared));
    const rectangleSupport = box.w * 0.5 * Math.abs(correctionDirection.x)
        + box.h * 0.5 * Math.abs(correctionDirection.y);
    const correctionDistance = Math.max(0.02, centerDistance - rectangleSupport + 0.02);
    return {
        outside: true,
        segmentIndex,
        kind: segment.kind,
        inwardNormal: { ...segment.inwardNormal },
        correction: {
            x: correctionDirection.x * correctionDistance,
            y: correctionDirection.y * correctionDistance
        }
    };
}
