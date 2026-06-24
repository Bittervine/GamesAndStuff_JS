const DEFAULT_FEATHER = 180;
const DEFAULT_PARALLAX = 1.035;
const DEFAULT_POINT_MODE = "smooth";
const DEFAULT_DECORATION = Object.freeze({
    seed: 138,
    spacing: 250,
    scale: 2,
    brightness: 0.36,
    saturation: 0.62
});

export const DEFAULT_CAVE_WINDOW = Object.freeze({
    version: 1,
    enabled: false,
    feather: DEFAULT_FEATHER,
    parallax: DEFAULT_PARALLAX,
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

export function normalizeCaveDecoration(rawDecoration) {
    const source = rawDecoration && typeof rawDecoration === "object" ? rawDecoration : {};
    return {
        seed: Math.trunc(finiteNumber(source.seed, DEFAULT_DECORATION.seed)),
        spacing: Math.max(80, Math.min(1200, finiteNumber(source.spacing, DEFAULT_DECORATION.spacing))),
        scale: Math.max(0.5, Math.min(5, finiteNumber(source.scale, DEFAULT_DECORATION.scale))),
        brightness: Math.max(0.08, Math.min(1, finiteNumber(source.brightness, DEFAULT_DECORATION.brightness))),
        saturation: Math.max(0, Math.min(1.5, finiteNumber(source.saturation, DEFAULT_DECORATION.saturation)))
    };
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
        decoration: normalizeCaveDecoration(source.decoration),
        points
    };
}

export function createCaveWindowPointsFromBounds(bounds, { inset = 96 } = {}) {
    const x = finiteNumber(bounds?.x, 0);
    const y = finiteNumber(bounds?.y, 0);
    const w = Math.max(1, finiteNumber(bounds?.w, 1));
    const h = Math.max(1, finiteNumber(bounds?.h, 1));
    const safeInset = Math.max(0, Math.min(finiteNumber(inset, 96), w * 0.24, h * 0.24));
    const left = x + safeInset;
    const top = y + safeInset;
    const right = x + w - safeInset;
    const bottom = y + h - safeInset;
    const cornerX = Math.min(Math.max(48, safeInset * 0.55), Math.max(0, (right - left) * 0.25));
    const cornerY = Math.min(Math.max(48, safeInset * 0.55), Math.max(0, (bottom - top) * 0.25));

    return [
        { id: "cave_point_001", x: left + cornerX, y: top, mode: "smooth" },
        { id: "cave_point_002", x: right - cornerX, y: top, mode: "smooth" },
        { id: "cave_point_003", x: right, y: top + cornerY, mode: "smooth" },
        { id: "cave_point_004", x: right, y: bottom - cornerY, mode: "smooth" },
        { id: "cave_point_005", x: right - cornerX, y: bottom, mode: "smooth" },
        { id: "cave_point_006", x: left + cornerX, y: bottom, mode: "smooth" },
        { id: "cave_point_007", x: left, y: bottom - cornerY, mode: "smooth" },
        { id: "cave_point_008", x: left, y: top + cornerY, mode: "smooth" }
    ];
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
        : { x: start.x + (end.x - previous.x) / 6, y: start.y + (end.y - previous.y) / 6 };
    const controlB = end.mode === "corner"
        ? { x: end.x, y: end.y }
        : { x: end.x - (next.x - start.x) / 6, y: end.y - (next.y - start.y) / 6 };
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

export function nearestCaveSplineSegment(points, point, stepsPerSegment = 20) {
    const sampled = sampleClosedCaveSpline(points, stepsPerSegment);
    if (sampled.length < 2) return null;
    let best = null;
    for (let index = 0; index < sampled.length - 1; index += 1) {
        const a = sampled[index];
        const b = sampled[index + 1];
        const candidate = pointSegmentDistanceSquared(point, a, b);
        if (!best || candidate.distanceSquared < best.distanceSquared) {
            best = {
                segmentIndex: a.segmentIndex,
                x: candidate.x,
                y: candidate.y,
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
