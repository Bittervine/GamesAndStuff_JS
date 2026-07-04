import { normalizeCaveDecoration, sampleClosedCaveSpline } from "./cave-window-data.js";
import { CAVE_FOREGROUND_LAYER_ID, DEFAULT_FOREGROUND_SCALE, normalizeLayerScale } from "./level-layer-data.js";

export const CAVE_FOREGROUND_LAYER = CAVE_FOREGROUND_LAYER_ID;
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
    const stalactite = tags.has("stalactite");
    const stalagmite = tags.has("stalagmite");
    if (category === "floor") return stalagmite ? 8 : 0;
    if (category === "ceiling") return stalactite ? 8 : 0;
    return stalactite || stalagmite ? 8 : 0;
}

export function buildCaveDecorationCatalog(entries) {
    const stableEntries = (Array.isArray(entries) ? entries : [])
        .filter((entry) => entry && entry.atlasId && entry.assetId && entry.frame && Number(entry.frame.w) > 0 && Number(entry.frame.h) > 0)
        .filter((entry) => {
            const tags = new Set(Array.isArray(entry.tags) ? entry.tags.map(String) : []);
            return tags.has("stalactite") || tags.has("stalagmite");
        })
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

function angularDistance(a, b) {
    return Math.abs(normalizedAngle(a - b));
}

/**
 * Points a formation's tip into the cave. Authored stalactites point down in
 * their source frame and authored stalagmites point up. The preliminary
 * perpendicular direction normally remains untouched; it snaps to the nearest
 * cardinal direction only when it lies within 20° of that direction.
 */
export function formationRotationForInward(entry, inward) {
    const tags = new Set(Array.isArray(entry?.tags) ? entry.tags.map(String) : []);
    const baseTipAngle = tags.has("stalactite") ? Math.PI * 0.5 : -Math.PI * 0.5;
    let desiredTipAngle = Math.atan2(finiteNumber(inward?.y, 0), finiteNumber(inward?.x, 1));
    const snapTolerance = Math.PI / 9;
    const cardinalAngles = [0, Math.PI * 0.5, Math.PI, -Math.PI * 0.5];
    let nearestCardinal = cardinalAngles[0];
    let nearestDistance = angularDistance(desiredTipAngle, nearestCardinal);
    for (const cardinalAngle of cardinalAngles.slice(1)) {
        const distance = angularDistance(desiredTipAngle, cardinalAngle);
        if (distance < nearestDistance) {
            nearestCardinal = cardinalAngle;
            nearestDistance = distance;
        }
    }
    if (nearestDistance <= snapTolerance) desiredTipAngle = nearestCardinal;
    return normalizedAngle(desiredTipAngle - baseTipAngle);
}


export function caveDecorationStep(category, tangentSpan) {
    const span = Math.max(1, finiteNumber(tangentSpan, 160));
    // Tangential density is derived entirely from the selected formation's
    // actual rendered span. The strong overlap is what guarantees continuous
    // cover through the full-black boundary, so a separate maximum-spacing
    // knob could only make the result denser and no longer described the rule.
    const stepFraction = category === "wall" ? 0.42 : 0.38;
    return Math.max(40, span * stepFraction);
}

function uniqueGeneratedId(index, prefix = "cave_fg_auto") {
    return `${String(prefix || "cave_fg_auto")}_${String(index + 1).padStart(3, "0")}`;
}

function normalizedProtectionRegion(region, index) {
    const x = finiteNumber(region?.x, NaN);
    const y = finiteNumber(region?.y, NaN);
    const w = finiteNumber(region?.w, NaN);
    const h = finiteNumber(region?.h, NaN);
    if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) return null;
    return {
        id: String(region?.id || `protected_${index + 1}`),
        x,
        y,
        w,
        h,
        strict: Boolean(region?.strict),
        allowAccent: region?.allowAccent !== false,
        normalOverlapRatio: clamp(finiteNumber(region?.normalOverlapRatio, 0.015), 0, 0.2),
        accentOverlapRatio: clamp(finiteNumber(region?.accentOverlapRatio, 0.16), 0, 0.45)
    };
}

function rotatedBounds(centerX, centerY, width, height, rotation) {
    const cosine = Math.abs(Math.cos(rotation));
    const sine = Math.abs(Math.sin(rotation));
    const extentX = cosine * width * 0.5 + sine * height * 0.5;
    const extentY = sine * width * 0.5 + cosine * height * 0.5;
    return {
        minX: centerX - extentX,
        minY: centerY - extentY,
        maxX: centerX + extentX,
        maxY: centerY + extentY
    };
}

function overlapRatio(bounds, region) {
    const overlapW = Math.max(0, Math.min(bounds.maxX, region.x + region.w) - Math.max(bounds.minX, region.x));
    const overlapH = Math.max(0, Math.min(bounds.maxY, region.y + region.h) - Math.max(bounds.minY, region.y));
    if (overlapW <= 0 || overlapH <= 0) return 0;
    return (overlapW * overlapH) / Math.max(1, region.w * region.h);
}

function placementRespectsProtection({ centerX, centerY, width, height, rotation, protectedRegions, accent }) {
    const bounds = rotatedBounds(centerX, centerY, width, height, rotation);
    for (const region of protectedRegions) {
        const permitted = region.strict
            ? 0
            : (accent && region.allowAccent ? region.accentOverlapRatio : region.normalOverlapRatio);
        if (overlapRatio(bounds, region) > permitted + 0.000001) return false;
    }
    return true;
}

function protectionShiftForPlacement({
    centerX,
    centerY,
    width,
    height,
    rotation,
    outward,
    normalDepth,
    protectedRegions,
    accent
}) {
    if (!protectedRegions.length) return 0;
    const maximumShift = Math.max(720, normalDepth * 4.2);
    const step = Math.max(10, Math.min(24, normalDepth * 0.06));
    for (let shift = 0; shift <= maximumShift + 0.001; shift += step) {
        if (placementRespectsProtection({
            centerX: centerX + outward.x * shift,
            centerY: centerY + outward.y * shift,
            width,
            height,
            rotation,
            protectedRegions,
            accent
        })) return shift;
    }
    return null;
}

export function generateCavePerimeterPlacements({
    caveWindow,
    catalog,
    decoration,
    firstOrder = 30000,
    protectedRegions = [],
    ownership = null,
    idPrefix = "cave_fg_auto",
    foregroundScale = DEFAULT_FOREGROUND_SCALE
}) {
    const points = Array.isArray(caveWindow?.points) ? caveWindow.points : [];
    if (points.length < 3) return [];
    const settings = normalizeCaveDecoration(decoration || caveWindow?.decoration);
    const layerScale = normalizeLayerScale(foregroundScale);
    const protection = (Array.isArray(protectedRegions) ? protectedRegions : [])
        .map(normalizedProtectionRegion)
        .filter(Boolean);
    const ownershipFields = ownership && typeof ownership === "object" ? { ...ownership } : {};
    const sampled = sampleClosedCaveSpline(points, 40);
    const arc = buildArcSegments(sampled);
    if (arc.totalLength < 1) return [];
    const clockwiseInScreenSpace = signedArea(sampled) >= 0;
    const featherDistance = Math.max(0, finiteNumber(caveWindow?.feather, 0));
    const records = [];
    let cursor = 0;
    let index = 0;
    let lastAccentIndex = -100;
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
            cursor += 80;
            index += 1;
            continue;
        }

        let scaleVariation = 0.86 + randomUnit(settings.seed, index, 2) * 0.28;
        let scale = layerScale * candidate.defaultScale * scaleVariation;
        let w = candidate.frame.w * scale;
        let h = candidate.frame.h * scale;
        let tangentSpan = probeCategory === "wall" ? h : w;
        let step = caveDecorationStep(probeCategory, tangentSpan);
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
            scale = layerScale * candidate.defaultScale * scaleVariation;
            w = candidate.frame.w * scale;
            h = candidate.frame.h * scale;
            tangentSpan = category === "wall" ? h : w;
            step = caveDecorationStep(category, tangentSpan);
        }

        const normalDepth = category === "wall" ? w : h;
        const outward = { x: -inward.x, y: -inward.y };
        // Most formations now keep only a modest readable bite inside the cave.
        // Rare accents may intrude farther, but protection regions push almost all
        // artwork away from doors, supports, rewards, and other authored anchors.
        const accent = (category === "floor" || category === "ceiling") &&
            index - lastAccentIndex >= 6 &&
            randomUnit(settings.seed, index, 9) < settings.occlusionAccentChance;
        if (accent) lastAccentIndex = index;
        const safeFraction = settings.inwardFractionMin +
            randomUnit(settings.seed, index, 3) * (settings.inwardFractionMax - settings.inwardFractionMin);
        const insideFraction = accent
            ? Math.max(safeFraction, 0.52 + randomUnit(settings.seed, index, 10) * 0.16)
            : safeFraction;
        const inwardShift = normalDepth * (insideFraction - 0.5);
        // Radial rows overlap by sixty percent. This is deliberately denser than
        // a simple half-depth tiling because curvature and sprite rotation can
        // otherwise expose narrow holes between the cave edge and full black.
        const radialStep = Math.max(18, normalDepth * 0.4);
        const primaryOutwardReach = normalDepth * 0.5 - inwardShift;
        const safetyReach = normalDepth * 0.18;
        const outwardLayerCount = Math.max(0, Math.ceil((featherDistance + safetyReach - primaryOutwardReach) / radialStep));

        const rotation = formationRotationForInward(candidate, inward);
        const primaryCenterX = sample.x + inward.x * inwardShift;
        const primaryCenterY = sample.y + inward.y * inwardShift;
        // Shift the complete radial stack as one object. Every row must respect the
        // gameplay protection mask, including the broad outer rows that hand over to
        // full black. If a stack cannot be moved clear, omit that decorative stack;
        // the cave mask still closes the perimeter without hiding an important room.
        let protectionShift = 0;
        let protectedStackValid = true;
        for (let layerIndex = 0; layerIndex <= outwardLayerCount; layerIndex += 1) {
            const radialOffset = layerIndex * radialStep;
            const requiredShift = protectionShiftForPlacement({
                centerX: primaryCenterX + outward.x * radialOffset,
                centerY: primaryCenterY + outward.y * radialOffset,
                width: w,
                height: h,
                rotation,
                outward,
                normalDepth,
                protectedRegions: protection,
                accent
            });
            if (requiredShift === null) {
                protectedStackValid = false;
                break;
            }
            protectionShift = Math.max(protectionShift, requiredShift);
        }
        if (protectedStackValid) {
            for (let layerIndex = 0; layerIndex <= outwardLayerCount; layerIndex += 1) {
                const radialOffset = layerIndex * radialStep;
                if (!placementRespectsProtection({
                    centerX: primaryCenterX + outward.x * (radialOffset + protectionShift),
                    centerY: primaryCenterY + outward.y * (radialOffset + protectionShift),
                    width: w,
                    height: h,
                    rotation,
                    protectedRegions: protection,
                    accent
                })) {
                    protectedStackValid = false;
                    break;
                }
            }
        }
        if (!protectedStackValid) {
            cursor += step;
            index += 1;
            continue;
        }
        for (let layerIndex = 0; layerIndex <= outwardLayerCount; layerIndex += 1) {
            const radialOffset = layerIndex * radialStep;
            const baseCenterX = primaryCenterX + outward.x * radialOffset;
            const baseCenterY = primaryCenterY + outward.y * radialOffset;
            const centerX = baseCenterX + outward.x * protectionShift;
            const centerY = baseCenterY + outward.y * protectionShift;
            const authoredW = w / layerScale;
            const authoredH = h / layerScale;
            records.push({
                arcIndex: index,
                layerIndex,
                placement: {
                    kind: "atlasAsset",
                    atlasId: candidate.atlasId,
                    assetId: candidate.assetId,
                    x: centerX - authoredW * 0.5,
                    y: centerY - authoredH * 0.5,
                    w: authoredW,
                    h: authoredH,
                    mirrorX: randomUnit(settings.seed, index, 4 + layerIndex) > 0.5,
                    mirrorY: false,
                    rotation,
                    layer: CAVE_FOREGROUND_LAYER,
                    collisionFromManifest: false,
                    foregroundSaturation: settings.saturation,
                    generatedBy: CAVE_PERIMETER_GENERATOR,
                    caveCategory: category,
                    caveArcIndex: index,
                    caveLayerIndex: layerIndex,
                    caveRadialOffset: radialOffset - inwardShift + protectionShift,
                    caveNormalDepth: normalDepth,
                    caveInsideFraction: insideFraction,
                    caveProtectionShift: protectionShift,
                    caveOcclusionAccent: accent,
                    decorationGenerator: CAVE_PERIMETER_GENERATOR,
                    ...ownershipFields,
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
        id: uniqueGeneratedId(placementIndex, idPrefix),
        order: firstOrder + placementIndex
    }));
}
