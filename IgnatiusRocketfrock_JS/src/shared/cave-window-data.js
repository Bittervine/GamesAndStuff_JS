const DEFAULT_FEATHER = 200;
const DEFAULT_PARALLAX = 1.1;
const DEFAULT_POINT_MODE = "smooth";
const DEFAULT_GRADIENT_NOISE = Object.freeze({
    seed: 278,
    amplitude: 50,
    period: 50
});
const DEFAULT_DECORATION = Object.freeze({
    seed: 138,
    scale: 2,
    brightness: 0.36,
    saturation: 0.62,
    inwardFractionMin: 0.3,
    inwardFractionMax: 0.5,
    occlusionAccentChance: 0.02
});

export const DEFAULT_CAVE_WINDOW = Object.freeze({
    version: 1,
    enabled: false,
    feather: DEFAULT_FEATHER,
    parallax: DEFAULT_PARALLAX,
    gradientNoise: Object.freeze(normalizeCaveGradientNoise(null)),
    decoration: Object.freeze(normalizeCaveDecoration(null)),
    points: Object.freeze([])
});

function finiteNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function normalizePointMode(value) {
    return value === "corner" ? "corner" : DEFAULT_POINT_MODE;
}

function uniquePointId(requested, index, usedIds) {
    const base = String(requested || `cave_point_${String(index + 1).padStart(3, "0")}`);
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) {
        id = `${base}_${suffix}`;
        suffix += 1;
    }
    usedIds.add(id);
    return id;
}

export function normalizeCaveGradientNoise(rawNoise) {
    const source = rawNoise && typeof rawNoise === "object" ? rawNoise : {};
    return {
        seed: Math.trunc(finiteNumber(source.seed, DEFAULT_GRADIENT_NOISE.seed)),
        amplitude: Math.max(0, Math.min(320, finiteNumber(source.amplitude, DEFAULT_GRADIENT_NOISE.amplitude))),
        period: Math.max(10, Math.min(500, finiteNumber(source.period, DEFAULT_GRADIENT_NOISE.period)))
    };
}

export function normalizeCaveDecoration(rawDecoration) {
    const source = rawDecoration && typeof rawDecoration === "object" ? rawDecoration : {};
    const result = {
        seed: Math.trunc(finiteNumber(source.seed, DEFAULT_DECORATION.seed)),
        scale: Math.max(0.5, Math.min(5, finiteNumber(source.scale, DEFAULT_DECORATION.scale))),
        brightness: Math.max(0.08, Math.min(1, finiteNumber(source.brightness, DEFAULT_DECORATION.brightness))),
        saturation: Math.max(0, Math.min(1.5, finiteNumber(source.saturation, DEFAULT_DECORATION.saturation))),
        inwardFractionMin: Math.max(0.05, Math.min(0.7, finiteNumber(source.inwardFractionMin, DEFAULT_DECORATION.inwardFractionMin))),
        inwardFractionMax: Math.max(0.05, Math.min(0.8, finiteNumber(source.inwardFractionMax, DEFAULT_DECORATION.inwardFractionMax))),
        occlusionAccentChance: Math.max(0, Math.min(0.2, finiteNumber(source.occlusionAccentChance, DEFAULT_DECORATION.occlusionAccentChance)))
    };
    if (result.inwardFractionMax < result.inwardFractionMin) {
        result.inwardFractionMax = result.inwardFractionMin;
    }
    return result;
}

export function normalizeCaveWindow(rawWindow) {
    const source = rawWindow && typeof rawWindow === "object" ? rawWindow : {};
    const usedIds = new Set();
    const points = Array.isArray(source.points)
        ? source.points
            .filter((point) => point && typeof point === "object")
            .map((point, index) => ({
                id: uniquePointId(point.id, index, usedIds),
                x: finiteNumber(point.x, 0),
                y: finiteNumber(point.y, 0),
                mode: normalizePointMode(point.mode)
            }))
        : [];

    return {
        version: 1,
        enabled: Boolean(source.enabled),
        feather: Math.max(0, finiteNumber(source.feather, DEFAULT_FEATHER)),
        parallax: Math.max(1, Math.min(1.25, finiteNumber(source.parallax, DEFAULT_PARALLAX))),
        gradientNoise: normalizeCaveGradientNoise(source.gradientNoise),
        decoration: normalizeCaveDecoration(source.decoration),
        points
    };
}

export function createCaveWindowPointsFromBounds(bounds, { margin = 96 } = {}) {
    const x = finiteNumber(bounds?.x, 0);
    const y = finiteNumber(bounds?.y, 0);
    const w = Math.max(1, finiteNumber(bounds?.w, 1));
    const h = Math.max(1, finiteNumber(bounds?.h, 1));
    const safeMargin = Math.max(0, finiteNumber(margin, 96));
    const left = x;
    const top = y;
    const right = x + w;
    const bottom = y + h;
    const points = [];

    const addPoint = (pointX, pointY) => {
        points.push({
            id: `cave_point_${String(points.length + 1).padStart(3, "0")}`,
            x: pointX,
            y: pointY,
            mode: "smooth"
        });
    };
    const wave = (index, count, phase = 0) => {
        const t = count <= 1 ? 0 : index / (count - 1);
        return 1 + Math.sin(t * Math.PI * 3 + phase) * 0.22 + Math.sin(t * Math.PI * 7 + phase * 0.7) * 0.08;
    };

    // Create a denser, gently irregular loop. Every control point remains on
    // or outside the technical bounds, while the changing outset keeps the
    // generated opening from looking like a rounded rectangle.
    const topCount = 7;
    for (let index = 0; index < topCount; index += 1) {
        const t = index / (topCount - 1);
        addPoint(left + w * t, top - safeMargin * wave(index, topCount, 0.35));
    }
    const rightCount = 4;
    for (let index = 1; index < rightCount; index += 1) {
        const t = index / rightCount;
        addPoint(right + safeMargin * wave(index, rightCount + 1, 1.2), top + h * t);
    }
    addPoint(right + safeMargin * wave(rightCount, rightCount + 1, 1.2), bottom);
    const bottomCount = 7;
    for (let index = 1; index < bottomCount; index += 1) {
        const t = index / (bottomCount - 1);
        addPoint(right - w * t, bottom + safeMargin * wave(index, bottomCount, 2.1));
    }
    const leftCount = 4;
    for (let index = 1; index < leftCount; index += 1) {
        const t = index / leftCount;
        addPoint(left - safeMargin * wave(index, leftCount + 1, 2.8), bottom - h * t);
    }
    addPoint(left - safeMargin * wave(leftCount, leftCount + 1, 2.8), top);
    return points;
}

function cubicPoint(a, b, c, d, t) {
    const inverse = 1 - t;
    const inverse2 = inverse * inverse;
    const t2 = t * t;
    return {
        x: inverse2 * inverse * a.x + 3 * inverse2 * t * b.x + 3 * inverse * t2 * c.x + t2 * t * d.x,
        y: inverse2 * inverse * a.y + 3 * inverse2 * t * b.y + 3 * inverse * t2 * c.y + t2 * t * d.y
    };
}

function pointDistance(a, b) {
    return Math.hypot(finiteNumber(b?.x, 0) - finiteNumber(a?.x, 0), finiteNumber(b?.y, 0) - finiteNumber(a?.y, 0));
}

function smoothSplineControl(point, previous, next, directionSign) {
    const chordX = finiteNumber(next?.x, 0) - finiteNumber(previous?.x, 0);
    const chordY = finiteNumber(next?.y, 0) - finiteNumber(previous?.y, 0);
    const chordLength = Math.hypot(chordX, chordY);
    if (chordLength <= 0.000001) return { x: point.x, y: point.y };

    const incoming = normalizedVector(finiteNumber(point?.x, 0) - finiteNumber(previous?.x, 0), finiteNumber(point?.y, 0) - finiteNumber(previous?.y, 0));
    const outgoing = normalizedVector(finiteNumber(next?.x, 0) - finiteNumber(point?.x, 0), finiteNumber(next?.y, 0) - finiteNumber(point?.y, 0));
    const turnAlignment = Math.max(0, Math.min(1, (incoming.x * outgoing.x + incoming.y * outgoing.y + 1) * 0.5));
    const curvatureFactor = 0.2 + turnAlignment * 0.8;
    const localLimit = Math.min(pointDistance(previous, point), pointDistance(point, next)) * 0.45 * curvatureFactor;
    const handleLength = Math.min(chordLength / 6, localLimit);
    return {
        x: point.x + (chordX / chordLength) * handleLength * directionSign,
        y: point.y + (chordY / chordLength) * handleLength * directionSign
    };
}

export function caveSplineSegmentControls(points, segmentIndex) {
    const count = Array.isArray(points) ? points.length : 0;
    if (count < 2) return null;
    const index = ((segmentIndex % count) + count) % count;
    const previous = points[(index - 1 + count) % count];
    const start = points[index];
    const end = points[(index + 1) % count];
    const next = points[(index + 2) % count];
    const controlA = start.mode === "corner"
        ? { x: start.x, y: start.y }
        : smoothSplineControl(start, previous, end, 1);
    const controlB = end.mode === "corner"
        ? { x: end.x, y: end.y }
        : smoothSplineControl(end, start, next, -1);
    return {
        start: { x: start.x, y: start.y },
        controlA,
        controlB,
        end: { x: end.x, y: end.y }
    };
}

export function sampleClosedCaveSpline(points, stepsPerSegment = 16) {
    if (!Array.isArray(points) || points.length === 0) return [];
    if (points.length === 1) return [{ x: points[0].x, y: points[0].y, segmentIndex: 0, t: 0 }];
    const steps = Math.max(1, Math.floor(finiteNumber(stepsPerSegment, 16)));
    const sampled = [];
    for (let segmentIndex = 0; segmentIndex < points.length; segmentIndex += 1) {
        const controls = caveSplineSegmentControls(points, segmentIndex);
        for (let step = 0; step < steps; step += 1) {
            const t = step / steps;
            sampled.push({ ...cubicPoint(controls.start, controls.controlA, controls.controlB, controls.end, t), segmentIndex, t });
        }
    }
    const first = sampled[0];
    sampled.push({ x: first.x, y: first.y, segmentIndex: points.length - 1, t: 1 });
    return sampled;
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
    if (length <= 0.000001) return { x: 0, y: 0 };
    return { x: x / length, y: y / length };
}

function outwardNormal(tangent, orientationSign) {
    return orientationSign >= 0
        ? { x: tangent.y, y: -tangent.x }
        : { x: -tangent.y, y: tangent.x };
}

function sampleOutsetWithDistances(sampled, distances) {
    if (sampled.length < 3) {
        return sampled.map((point) => ({ x: point.x, y: point.y }));
    }
    const orientationSign = polygonSignedArea(sampled) >= 0 ? 1 : -1;
    const outset = [];
    for (let index = 0; index < sampled.length; index += 1) {
        const previous = sampled[(index - 1 + sampled.length) % sampled.length];
        const current = sampled[index];
        const next = sampled[(index + 1) % sampled.length];
        const safeDistance = Math.max(0, finiteNumber(distances[index], 0));
        if (safeDistance <= 0) {
            outset.push({ x: current.x, y: current.y });
            continue;
        }
        const incoming = normalizedVector(current.x - previous.x, current.y - previous.y);
        const outgoing = normalizedVector(next.x - current.x, next.y - current.y);
        const incomingNormal = outwardNormal(incoming, orientationSign);
        const outgoingNormal = outwardNormal(outgoing, orientationSign);
        const miter = normalizedVector(
            incomingNormal.x + outgoingNormal.x,
            incomingNormal.y + outgoingNormal.y
        );
        const referenceNormal = Math.hypot(miter.x, miter.y) > 0.000001 ? miter : outgoingNormal;
        const projection = Math.abs(referenceNormal.x * outgoingNormal.x + referenceNormal.y * outgoingNormal.y);
        const miterLength = Math.min(safeDistance * 4, safeDistance / Math.max(0.25, projection));
        outset.push({
            x: current.x + referenceNormal.x * miterLength,
            y: current.y + referenceNormal.y * miterLength
        });
    }
    return outset;
}

function integerHash01(seed, index) {
    let value = (Math.trunc(seed) + Math.imul(Math.trunc(index), 0x9e3779b1)) | 0;
    value ^= value >>> 16;
    value = Math.imul(value, 0x7feb352d);
    value ^= value >>> 15;
    value = Math.imul(value, 0x846ca68b);
    value ^= value >>> 16;
    return (value >>> 0) / 4294967295;
}

function smootherStep(value) {
    const t = Math.max(0, Math.min(1, value));
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function cyclicValueNoise(distance, perimeterLength, scale, seed) {
    if (perimeterLength <= 0.000001) return 0;
    const latticeCount = Math.max(3, Math.round(perimeterLength / Math.max(1, scale)));
    const cellLength = perimeterLength / latticeCount;
    const cell = Math.floor(distance / cellLength);
    const local = smootherStep((distance - cell * cellLength) / cellLength);
    const indexA = ((cell % latticeCount) + latticeCount) % latticeCount;
    const indexB = (indexA + 1) % latticeCount;
    const a = integerHash01(seed, indexA) * 2 - 1;
    const b = integerHash01(seed, indexB) * 2 - 1;
    return a + (b - a) * local;
}

function sampledArcLengths(sampled) {
    const arcLengths = new Array(sampled.length).fill(0);
    let total = 0;
    for (let index = 1; index < sampled.length; index += 1) {
        total += pointDistance(sampled[index - 1], sampled[index]);
        arcLengths[index] = total;
    }
    if (sampled.length > 1) total += pointDistance(sampled[sampled.length - 1], sampled[0]);
    return { arcLengths, total };
}

export function sampleCaveWindowOutset(points, distance, stepsPerSegment = 16) {
    const sampled = sampleClosedCaveSpline(points, stepsPerSegment).slice(0, -1);
    const safeDistance = Math.max(0, finiteNumber(distance, 0));
    if (sampled.length < 3 || safeDistance <= 0) {
        return sampled.map((point) => ({ x: point.x, y: point.y }));
    }
    return sampleOutsetWithDistances(sampled, sampled.map(() => safeDistance));
}

export function sampleCaveWindowPerturbedOutset(
    points,
    distance,
    rawNoise,
    progress = 0.5,
    stepsPerSegment = 16
) {
    const sampled = sampleClosedCaveSpline(points, stepsPerSegment).slice(0, -1);
    const safeDistance = Math.max(0, finiteNumber(distance, 0));
    const safeProgress = Math.max(0, Math.min(1, finiteNumber(progress, 0.5)));
    if (sampled.length < 3 || safeDistance <= 0 || safeProgress <= 0) {
        return sampled.map((point) => ({ x: point.x, y: point.y }));
    }
    if (safeProgress >= 1) {
        return sampleOutsetWithDistances(sampled, sampled.map(() => safeDistance));
    }

    const noise = normalizeCaveGradientNoise(rawNoise);
    // All opacity contours use the same cyclic noise profile and a sinusoidal
    // envelope. Keeping the peak below distance / pi guarantees that adjacent
    // contours remain ordered instead of folding across each other.
    const effectiveAmplitude = Math.min(noise.amplitude, safeDistance * 0.29);
    if (effectiveAmplitude <= 0.000001) {
        const uniformDistance = safeDistance * safeProgress;
        return sampleOutsetWithDistances(sampled, sampled.map(() => uniformDistance));
    }

    const { arcLengths, total } = sampledArcLengths(sampled);
    const envelope = Math.sin(Math.PI * safeProgress);
    const distances = arcLengths.map((arcLength) => {
        const broad = cyclicValueNoise(arcLength, total, noise.period, noise.seed);
        const detail = cyclicValueNoise(arcLength, total, noise.period * 0.47, noise.seed + 0x51f15e);
        const perturbation = (broad * 0.72 + detail * 0.28) * effectiveAmplitude * envelope;
        return Math.max(0, Math.min(safeDistance, safeDistance * safeProgress + perturbation));
    });
    return sampleOutsetWithDistances(sampled, distances);
}

function pointSegmentDistanceSquared(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared > 0
        ? Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared))
        : 0;
    const x = a.x + dx * t;
    const y = a.y + dy * t;
    const offsetX = point.x - x;
    const offsetY = point.y - y;
    return { distanceSquared: offsetX * offsetX + offsetY * offsetY, x, y, t };
}

function pointInPolygon(point, polygon) {
    if (!Array.isArray(polygon) || polygon.length < 3) return false;
    let inside = false;
    for (let index = 0, previousIndex = polygon.length - 1; index < polygon.length; previousIndex = index, index += 1) {
        const a = polygon[previousIndex];
        const b = polygon[index];
        if (pointSegmentDistanceSquared(point, a, b).distanceSquared <= 0.000001) return true;
        const crosses = (a.y > point.y) !== (b.y > point.y);
        if (!crosses) continue;
        const crossingX = a.x + ((point.y - a.y) * (b.x - a.x)) / (b.y - a.y);
        if (point.x < crossingX) inside = !inside;
    }
    return inside;
}

function orientation(a, b, c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function pointOnSegment(point, a, b) {
    return pointSegmentDistanceSquared(point, a, b).distanceSquared <= 0.000001;
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
    return (Math.abs(abC) <= 0.000001 && pointOnSegment(c, a, b))
        || (Math.abs(abD) <= 0.000001 && pointOnSegment(d, a, b))
        || (Math.abs(cdA) <= 0.000001 && pointOnSegment(a, c, d))
        || (Math.abs(cdB) <= 0.000001 && pointOnSegment(b, c, d));
}

function segmentSegmentDistanceSquared(a, b, c, d) {
    if (segmentsIntersect(a, b, c, d)) return 0;
    return Math.min(
        pointSegmentDistanceSquared(a, c, d).distanceSquared,
        pointSegmentDistanceSquared(b, c, d).distanceSquared,
        pointSegmentDistanceSquared(c, a, b).distanceSquared,
        pointSegmentDistanceSquared(d, a, b).distanceSquared
    );
}

export function caveWindowPolygonSeparation(points, polygon, stepsPerSegment = 20) {
    const cavePolygon = sampleClosedCaveSpline(points, stepsPerSegment).slice(0, -1);
    const shape = Array.isArray(polygon)
        ? polygon
            .filter((point) => point && Number.isFinite(Number(point.x)) && Number.isFinite(Number(point.y)))
            .map((point) => ({ x: Number(point.x), y: Number(point.y) }))
        : [];
    if (cavePolygon.length < 3 || shape.length < 3) {
        return { outside: false, distance: 0 };
    }
    if (shape.some((point) => pointInPolygon(point, cavePolygon))
        || cavePolygon.some((point) => pointInPolygon(point, shape))) {
        return { outside: false, distance: 0 };
    }

    let minimumDistanceSquared = Infinity;
    for (let shapeIndex = 0; shapeIndex < shape.length; shapeIndex += 1) {
        const shapeA = shape[shapeIndex];
        const shapeB = shape[(shapeIndex + 1) % shape.length];
        for (let caveIndex = 0; caveIndex < cavePolygon.length; caveIndex += 1) {
            const caveA = cavePolygon[caveIndex];
            const caveB = cavePolygon[(caveIndex + 1) % cavePolygon.length];
            minimumDistanceSquared = Math.min(
                minimumDistanceSquared,
                segmentSegmentDistanceSquared(shapeA, shapeB, caveA, caveB)
            );
            if (minimumDistanceSquared <= 0.000001) {
                return { outside: false, distance: 0 };
            }
        }
    }
    return {
        outside: true,
        distance: Math.sqrt(minimumDistanceSquared)
    };
}

export function nearestCaveSplineSegment(points, point) {
    const controls = Array.isArray(points) ? points : [];
    if (controls.length < 2) return null;
    let best = null;
    for (let index = 0; index < controls.length; index += 1) {
        const a = controls[index];
        const b = controls[(index + 1) % controls.length];
        const candidate = pointSegmentDistanceSquared(point, a, b);
        if (!best || candidate.distanceSquared < best.distanceSquared) {
            best = {
                segmentIndex: index,
                x: candidate.x,
                y: candidate.y,
                distanceSquared: candidate.distanceSquared,
                distance: Math.sqrt(candidate.distanceSquared)
            };
        }
    }
    return best;
}

export function caveWindowBounds(points, padding = 0) {
    if (!Array.isArray(points) || points.length === 0) return null;
    const sampled = points.length >= 3 ? sampleClosedCaveSpline(points, 12) : points;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const point of sampled) {
        minX = Math.min(minX, finiteNumber(point.x, 0));
        minY = Math.min(minY, finiteNumber(point.y, 0));
        maxX = Math.max(maxX, finiteNumber(point.x, 0));
        maxY = Math.max(maxY, finiteNumber(point.y, 0));
    }
    const safePadding = Math.max(0, finiteNumber(padding, 0));
    return {
        x: minX - safePadding,
        y: minY - safePadding,
        w: Math.max(1, maxX - minX + safePadding * 2),
        h: Math.max(1, maxY - minY + safePadding * 2)
    };
}
