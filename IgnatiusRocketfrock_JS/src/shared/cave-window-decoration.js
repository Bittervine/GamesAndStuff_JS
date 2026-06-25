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
        if (tags.has("floor")) return entry.frame.w >= 420 ? 2 : 3;
        if (tags.has("rock") || tags.has("rubble")) return 4;
        return 0;
    }
    if (category === "ceiling") {
        if (tags.has("stalactite")) return 8;
        if (tags.has("ceiling")) return entry.frame.w >= 460 ? 2 : 3;
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


export function caveDecorationStep(category, tangentSpan, requestedSpacing) {
    const spacing = Math.max(80, finiteNumber(requestedSpacing, 250));
    const categoryFactor = category === "wall" ? 0.72 : 0.58;
    // Use generous tangential overlap. Rotated rectangular sprites otherwise leave
    // tiny wedges exposed on curved sections even when their raw bounds touch.
    const coverage = Math.max(40, finiteNumber(tangentSpan, spacing) * 0.58);
    return clamp(Math.min(spacing * categoryFactor, coverage), 40, spacing);
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
    const sampled = sampleClosedCaveSpline(points, 40);
    const arc = buildArcSegments(sampled);
    if (arc.totalLength < 1) return [];
    const clockwiseInScreenSpace = signedArea(sampled) >= 0;
    const featherDistance = Math.max(0, finiteNumber(caveWindow?.feather, 0));
    const records = [];
    let cursor = 0;
    let index = 0;
    const maximumPlacements = Math.max(32, Math.ceil(arc.totalLength / 36));

    while (cursor < arc.totalLength && index < maximumPlacements) {
        const probe = sampleArc(arc, cursor);
        if (!probe) break;
        const probeInward = clockwiseInScreenSpace
            ? { x: -probe.tangent.y, y: probe.tangent.x }
            : { x: probe.tangent.y, y: -probe.tangent.x };
        const probeCategory = categoryForNormal(probeInward);
        let candidate = chooseCandidate(catalog, probeCategory, settings.seed, index);
        if (!candidate) {
            cursor += Math.max(48, settings.spacing * 0.5);
            index += 1;
            continue;
        }

        let scaleVariation = 0.86 + randomUnit(settings.seed, index, 2) * 0.28;
        let scale = settings.scale * candidate.defaultScale * scaleVariation;
        let w = candidate.frame.w * scale;
        let h = candidate.frame.h * scale;
        let tangentSpan = probeCategory === "wall" ? h : w;
        let step = caveDecorationStep(probeCategory, tangentSpan, settings.spacing);
        const jitter = (randomUnit(settings.seed, index, 1) - 0.5) * step * 0.16;
        const sample = sampleArc(arc, cursor + step * 0.5 + jitter) || probe;
        const inward = clockwiseInScreenSpace
            ? { x: -sample.tangent.y, y: sample.tangent.x }
            : { x: sample.tangent.y, y: -sample.tangent.x };
        const category = categoryForNormal(inward);

        if (category !== probeCategory) {
            candidate = chooseCandidate(catalog, category, settings.seed, index);
            if (!candidate) {
                cursor += step;
                index += 1;
                continue;
            }
            scaleVariation = 0.86 + randomUnit(settings.seed, index, 2) * 0.28;
            scale = settings.scale * candidate.defaultScale * scaleVariation;
            w = candidate.frame.w * scale;
            h = candidate.frame.h * scale;
            tangentSpan = category === "wall" ? h : w;
            step = caveDecorationStep(category, tangentSpan, settings.spacing);
        }

        const normalDepth = category === "wall" ? w : h;
        const outward = { x: -inward.x, y: -inward.y };
        // Vary the readable bite into the cave from one formation to the next.
        // A centred sprite has 50% of its normal depth inside the perimeter;
        // shifting its centre inward by up to 25% produces a deterministic
        // 50-75% inside range without changing the authored seed contract.
        const insideFraction = 0.5 + randomUnit(settings.seed, index, 3) * 0.25;
        const inwardShift = normalDepth * (insideFraction - 0.5);
        // Radial rows overlap by sixty percent. This is deliberately denser than
        // a simple half-depth tiling because curvature and sprite rotation can
        // otherwise expose narrow holes between the cave edge and full black.
        const radialStep = Math.max(18, normalDepth * 0.4);
        const primaryOutwardReach = normalDepth * 0.5 - inwardShift;
        const safetyReach = normalDepth * 0.18;
        const outwardLayerCount = Math.max(0, Math.ceil((featherDistance + safetyReach - primaryOutwardReach) / radialStep));

        for (let layerIndex = 0; layerIndex <= outwardLayerCount; layerIndex += 1) {
            const radialOffset = layerIndex * radialStep;
            const centerX = sample.x + inward.x * inwardShift + outward.x * radialOffset;
            const centerY = sample.y + inward.y * inwardShift + outward.y * radialOffset;
            records.push({
                arcIndex: index,
                layerIndex,
                placement: {
                    kind: "atlasAsset",
                    atlasId: candidate.atlasId,
                    assetId: candidate.assetId,
                    x: centerX - w * 0.5,
                    y: centerY - h * 0.5,
                    w,
                    h,
                    mirrorX: randomUnit(settings.seed, index, 4 + layerIndex) > 0.5,
                    mirrorY: false,
                    rotation: rotationForCategory(category, sample.tangent),
                    layer: CAVE_FOREGROUND_LAYER,
                    collisionFromManifest: false,
                    foregroundBrightness: settings.brightness,
                    foregroundSaturation: settings.saturation,
                    foregroundOutwardX: outward.x,
                    foregroundOutwardY: outward.y,
                    foregroundFadeStart: 0.05,
                    foregroundFadeEnd: 0.92,
                    generatedBy: CAVE_PERIMETER_GENERATOR,
                    caveCategory: category,
                    caveArcIndex: index,
                    caveLayerIndex: layerIndex,
                    caveRadialOffset: radialOffset,
                    caveNormalDepth: normalDepth,
                    caveInsideFraction: insideFraction,
                    notes: layerIndex === 0
                        ? `Automatically generated inert cave-${category} foreground decoration.`
                        : `Automatically generated inert cave-${category} outer coverage layer ${layerIndex}.`
                }
            });
        }
        cursor += step;
        index += 1;
    }

    // Paint the inward row first. Farther-out rows then cover the broad bases of
    // inward stalactites/stalagmites instead of letting those bases cover tips.
    records.sort((a, b) => a.layerIndex - b.layerIndex || a.arcIndex - b.arcIndex);
    return records.map((record, placementIndex) => ({
        ...record.placement,
        id: uniqueGeneratedId(placementIndex),
        order: firstOrder + placementIndex
    }));
}
