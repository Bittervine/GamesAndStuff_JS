import { normalizeCaveDecoration, sampleClosedCaveSpline } from "./cave-window-data.js";

export const CAVE_FOREGROUND_LAYER = "caveForeground";
export const CAVE_PERIMETER_GENERATOR = "cavePerimeter";

function finiteNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function hashInteger(value) {
    let x = value | 0;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d);
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b);
    x ^= x >>> 16;
    return x >>> 0;
}

function randomUnit(seed, index, salt = 0) {
    return hashInteger((seed | 0) ^ Math.imul(index + 1, 0x9e3779b1) ^ Math.imul(salt + 11, 0x85ebca6b)) / 0x100000000;
}

function signedArea(points) {
    let total = 0;
    for (let index = 0; index < points.length - 1; index += 1) {
        const a = points[index];
        const b = points[index + 1];
        total += a.x * b.y - b.x * a.y;
    }
    return total * 0.5;
}

function normalizedVector(x, y, fallback = { x: 1, y: 0 }) {
    const length = Math.hypot(x, y);
    if (length <= 0.000001) return { ...fallback };
    return { x: x / length, y: y / length };
}

function buildArcSegments(sampled) {
    const segments = [];
    let totalLength = 0;
    for (let index = 0; index < sampled.length - 1; index += 1) {
        const a = sampled[index];
        const b = sampled[index + 1];
        const length = Math.hypot(b.x - a.x, b.y - a.y);
        if (length <= 0.0001) continue;
        segments.push({ a, b, start: totalLength, end: totalLength + length, length });
        totalLength += length;
    }
    return { segments, totalLength };
}

function sampleArc(arc, distance) {
    if (!arc.segments.length) return null;
    const wrapped = ((distance % arc.totalLength) + arc.totalLength) % arc.totalLength;
    let segment = arc.segments[arc.segments.length - 1];
    for (const candidate of arc.segments) {
        if (wrapped <= candidate.end) {
            segment = candidate;
            break;
        }
    }
    const t = clamp((wrapped - segment.start) / segment.length, 0, 1);
    const tangent = normalizedVector(segment.b.x - segment.a.x, segment.b.y - segment.a.y);
    return {
        x: segment.a.x + (segment.b.x - segment.a.x) * t,
        y: segment.a.y + (segment.b.y - segment.a.y) * t,
        tangent
    };
}

function categoryForNormal(inward) {
    if (inward.y <= -0.52) return "floor";
    if (inward.y >= 0.52) return "ceiling";
    return "wall";
}

function scoreCandidate(entry, category) {
    const tags = new Set(Array.isArray(entry.tags) ? entry.tags : []);
    if (category === "floor") {
        if (tags.has("stalagmite")) return 8;
        if (tags.has("rock") || tags.has("rubble")) return 4;
        if (tags.has("floor") && entry.frame.w <= 420) return 2;
        return 0;
    }
    if (category === "ceiling") {
        if (tags.has("stalactite")) return 8;
        if (tags.has("ceiling") && entry.frame.w <= 460) return 2;
        return 0;
    }
    if (tags.has("wall")) return 8;
    if (tags.has("pillar") || tags.has("alcove")) return 3;
    return 0;
}

export function buildCaveDecorationCatalog(entries) {
    const stableEntries = (Array.isArray(entries) ? entries : [])
        .filter((entry) => entry && entry.atlasId && entry.assetId && entry.frame && Number(entry.frame.w) > 0 && Number(entry.frame.h) > 0)
        .map((entry) => ({
            atlasId: String(entry.atlasId),
            assetId: String(entry.assetId),
            frame: {
                w: Math.max(1, finiteNumber(entry.frame.w, 1)),
                h: Math.max(1, finiteNumber(entry.frame.h, 1))
            },
            tags: Array.isArray(entry.tags) ? entry.tags.map(String) : [],
            defaultScale: Math.max(0.05, finiteNumber(entry.defaultScale, 1))
        }))
        .sort((a, b) => `${a.atlasId}:${a.assetId}`.localeCompare(`${b.atlasId}:${b.assetId}`));

    const catalog = { floor: [], ceiling: [], wall: [] };
    for (const category of Object.keys(catalog)) {
        for (const entry of stableEntries) {
            const weight = scoreCandidate(entry, category);
            for (let copy = 0; copy < weight; copy += 1) catalog[category].push(entry);
        }
    }
    return catalog;
}

function chooseCandidate(catalog, category, seed, index) {
    const pool = catalog?.[category] || [];
    if (!pool.length) return null;
    return pool[Math.floor(randomUnit(seed, index, 5) * pool.length) % pool.length];
}

function normalizedAngle(angle) {
    let result = angle;
    while (result > Math.PI) result -= Math.PI * 2;
    while (result < -Math.PI) result += Math.PI * 2;
    return result;
}

function rotationForCategory(category, tangent) {
    if (category === "wall") {
        const downTangent = tangent.y < 0 ? { x: -tangent.x, y: -tangent.y } : tangent;
        return normalizedAngle(Math.atan2(-downTangent.x, downTangent.y));
    }
    const rightTangent = tangent.x < 0 ? { x: -tangent.x, y: -tangent.y } : tangent;
    return normalizedAngle(Math.atan2(rightTangent.y, rightTangent.x));
}

function uniqueGeneratedId(index) {
    return `cave_fg_auto_${String(index + 1).padStart(3, "0")}`;
}

export function generateCavePerimeterPlacements({
    caveWindow,
    catalog,
    decoration,
    firstOrder = 30000
}) {
    const points = Array.isArray(caveWindow?.points) ? caveWindow.points : [];
    if (points.length < 3) return [];
    const settings = normalizeCaveDecoration(decoration || caveWindow?.decoration);
    const sampled = sampleClosedCaveSpline(points, 28);
    const arc = buildArcSegments(sampled);
    if (arc.totalLength < 1) return [];
    const clockwiseInScreenSpace = signedArea(sampled) >= 0;
    const count = Math.max(3, Math.round(arc.totalLength / settings.spacing));
    const actualSpacing = arc.totalLength / count;
    const placements = [];

    for (let index = 0; index < count; index += 1) {
        const jitter = (randomUnit(settings.seed, index, 1) - 0.5) * actualSpacing * 0.34;
        const sample = sampleArc(arc, (index + 0.5) * actualSpacing + jitter);
        if (!sample) continue;
        const inward = clockwiseInScreenSpace
            ? { x: -sample.tangent.y, y: sample.tangent.x }
            : { x: sample.tangent.y, y: -sample.tangent.x };
        const category = categoryForNormal(inward);
        const candidate = chooseCandidate(catalog, category, settings.seed, index);
        if (!candidate) continue;

        const scaleVariation = 0.86 + randomUnit(settings.seed, index, 2) * 0.28;
        const scale = settings.scale * candidate.defaultScale * scaleVariation;
        const w = candidate.frame.w * scale;
        const h = candidate.frame.h * scale;
        const normalDepth = category === "wall" ? w : h;
        const outward = { x: -inward.x, y: -inward.y };
        const outwardShift = normalDepth * (0.10 + randomUnit(settings.seed, index, 3) * 0.08);
        const centerX = sample.x + outward.x * outwardShift;
        const centerY = sample.y + outward.y * outwardShift;

        placements.push({
            id: uniqueGeneratedId(index),
            kind: "atlasAsset",
            atlasId: candidate.atlasId,
            assetId: candidate.assetId,
            x: centerX - w * 0.5,
            y: centerY - h * 0.5,
            w,
            h,
            mirrorX: randomUnit(settings.seed, index, 4) > 0.5,
            mirrorY: false,
            rotation: rotationForCategory(category, sample.tangent),
            layer: CAVE_FOREGROUND_LAYER,
            collisionFromManifest: false,
            foregroundBrightness: settings.brightness,
            foregroundSaturation: settings.saturation,
            generatedBy: CAVE_PERIMETER_GENERATOR,
            caveCategory: category,
            order: firstOrder + index,
            notes: `Automatically generated inert cave-${category} foreground decoration.`
        });
    }
    return placements;
}
