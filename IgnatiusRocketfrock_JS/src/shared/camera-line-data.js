export const DEFAULT_CAMERA_LINE = Object.freeze({
    version: 1,
    enabled: true,
    influenceDistance: 2000,
    lookAheadDistance: 1200,
    points: Object.freeze([])
});

function finiteNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function catmullRomCoordinate(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * (
        2 * p1 +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
}

export function normalizeCameraLine(value = null) {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const points = Array.isArray(source.points)
        ? source.points.map((point, index) => ({
            id: String(point?.id || `camera_line_point_${String(index + 1).padStart(3, "0")}`),
            x: finiteNumber(point?.x, 0),
            y: finiteNumber(point?.y, 0)
        }))
        : [];
    const normalized = {
        version: DEFAULT_CAMERA_LINE.version,
        enabled: typeof source.enabled === "boolean" ? source.enabled : DEFAULT_CAMERA_LINE.enabled,
        influenceDistance: Math.max(1, finiteNumber(source.influenceDistance, DEFAULT_CAMERA_LINE.influenceDistance)),
        lookAheadDistance: Math.max(1, finiteNumber(source.lookAheadDistance, DEFAULT_CAMERA_LINE.lookAheadDistance)),
        points
    };
    normalized.samples = sampleCameraLine(points);
    return normalized;
}

export function sampleCameraLine(points, samplesPerSegment = 20) {
    const source = Array.isArray(points) ? points : [];
    if (!source.length) return [];
    if (source.length === 1) return [{ x: source[0].x, y: source[0].y, distance: 0 }];
    const subdivisions = Math.max(4, Math.floor(Number(samplesPerSegment) || 20));
    const samples = [];
    let cumulativeDistance = 0;
    const append = (x, y) => {
        const previous = samples.at(-1);
        if (previous) cumulativeDistance += Math.hypot(x - previous.x, y - previous.y);
        samples.push({ x, y, distance: cumulativeDistance });
    };
    for (let segment = 0; segment < source.length - 1; segment += 1) {
        const p0 = source[Math.max(0, segment - 1)];
        const p1 = source[segment];
        const p2 = source[segment + 1];
        const p3 = source[Math.min(source.length - 1, segment + 2)];
        const firstStep = segment === 0 ? 0 : 1;
        for (let step = firstStep; step <= subdivisions; step += 1) {
            const t = step / subdivisions;
            append(
                catmullRomCoordinate(p0.x, p1.x, p2.x, p3.x, t),
                catmullRomCoordinate(p0.y, p1.y, p2.y, p3.y, t)
            );
        }
    }
    return samples;
}

export function nearestCameraLinePoint(cameraLine, point) {
    const samples = cameraLine?.samples || sampleCameraLine(cameraLine?.points || []);
    if (samples.length < 2) return null;
    const px = finiteNumber(point?.x, 0);
    const py = finiteNumber(point?.y, 0);
    let best = null;
    for (let index = 0; index < samples.length - 1; index += 1) {
        const a = samples[index];
        const b = samples[index + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const lengthSquared = dx * dx + dy * dy;
        const t = lengthSquared > 0
            ? Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / lengthSquared))
            : 0;
        const x = a.x + dx * t;
        const y = a.y + dy * t;
        const distance = Math.hypot(px - x, py - y);
        if (!best || distance < best.distance) {
            const segmentLength = Math.sqrt(lengthSquared);
            best = {
                x,
                y,
                distance,
                along: a.distance + segmentLength * t,
                tangentX: segmentLength > 0 ? dx / segmentLength : 1,
                tangentY: segmentLength > 0 ? dy / segmentLength : 0
            };
        }
    }
    return best;
}

export function cameraLineInsertionIndex(points, point, endpointTolerance = 0, samplesPerSegment = 20) {
    const source = Array.isArray(points) ? points : [];
    if (!source.length) return 0;
    if (source.length === 1) return 1;

    const subdivisions = Math.max(4, Math.floor(Number(samplesPerSegment) || 20));
    const samples = sampleCameraLine(source, subdivisions);
    const nearest = nearestCameraLinePoint({ samples }, point);
    if (!nearest) return source.length;

    const px = finiteNumber(point?.x, 0);
    const py = finiteNumber(point?.y, 0);
    const tolerance = Math.max(0, finiteNumber(endpointTolerance, 0));
    const first = source[0];
    const last = source.at(-1);
    const totalDistance = samples.at(-1)?.distance || 0;
    const endpointEpsilon = 0.000001;

    if (Math.hypot(px - first.x, py - first.y) <= tolerance || nearest.along <= endpointEpsilon) {
        return 0;
    }
    if (Math.hypot(px - last.x, py - last.y) <= tolerance || totalDistance - nearest.along <= endpointEpsilon) {
        return source.length;
    }

    for (let pointIndex = 1; pointIndex < source.length; pointIndex += 1) {
        const controlSample = samples[Math.min(samples.length - 1, pointIndex * subdivisions)];
        if (nearest.along <= controlSample.distance) return pointIndex;
    }
    return source.length;
}

export function cameraLinePointAtDistance(cameraLine, distance) {
    const samples = cameraLine?.samples || sampleCameraLine(cameraLine?.points || []);
    if (!samples.length) return null;
    const total = samples.at(-1).distance;
    const target = Math.max(0, Math.min(total, finiteNumber(distance, 0)));
    for (let index = 0; index < samples.length - 1; index += 1) {
        const a = samples[index];
        const b = samples[index + 1];
        if (target > b.distance) continue;
        const span = Math.max(0.000001, b.distance - a.distance);
        const t = (target - a.distance) / span;
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, distance: target };
    }
    const last = samples.at(-1);
    return { x: last.x, y: last.y, distance: last.distance };
}

export function cameraLineCompletelyInsideRect(cameraLine, rect) {
    const samples = cameraLine?.samples || sampleCameraLine(cameraLine?.points || []);
    if (samples.length < 2 || !rect) return false;
    const minX = Math.min(rect.x, rect.x + rect.w);
    const maxX = Math.max(rect.x, rect.x + rect.w);
    const minY = Math.min(rect.y, rect.y + rect.h);
    const maxY = Math.max(rect.y, rect.y + rect.h);
    return samples.every((point) => point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY);
}
