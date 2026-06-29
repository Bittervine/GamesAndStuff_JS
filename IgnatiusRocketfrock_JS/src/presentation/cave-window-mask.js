import {
    normalizeCaveWindow,
    sampleCaveWindowOutset,
    sampleCaveWindowPerturbedOutset
} from "../shared/cave-window-data.js";

const OPAQUE_BLACK = "rgb(0, 0, 0)";
export const CAVE_GRADIENT_BAND_COUNT = 24;
const ORGANIC_GRADIENT_PROGRESS = Object.freeze(
    Array.from({ length: CAVE_GRADIENT_BAND_COUNT - 1 }, (_, index) => (index + 1) / CAVE_GRADIENT_BAND_COUNT)
);
const ORGANIC_GRADIENT_GEOMETRY_CACHE = new Map();
const ORGANIC_GRADIENT_GEOMETRY_CACHE_LIMIT = 24;
export const DEFAULT_CAVE_MASK_RENDER_SCALE = 0.35;

function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function normalizedWorldBounds(worldBounds) {
    const x = finiteNumber(worldBounds?.x, 0);
    const y = finiteNumber(worldBounds?.y, 0);
    const w = Math.max(1, finiteNumber(worldBounds?.w, 1));
    const h = Math.max(1, finiteNumber(worldBounds?.h, 1));
    return { x, y, w, h };
}

export function computeCaveWindowParallaxOffset(view, worldBounds, parallax = 1) {
    const zoom = Math.max(0.0001, finiteNumber(view?.zoom, 1));
    const virtualWidth = Math.max(1, finiteNumber(view?.virtualW, finiteNumber(view?.w, 1) / zoom));
    const virtualHeight = Math.max(1, finiteNumber(view?.virtualH, finiteNumber(view?.h, 1) / zoom));
    const cameraX = finiteNumber(view?.x, 0) + virtualWidth * 0.5;
    const cameraY = finiteNumber(view?.y, 0) + virtualHeight * 0.56;
    const bounds = normalizedWorldBounds(worldBounds);
    const anchorX = bounds.x + bounds.w * 0.5;
    const anchorY = bounds.y + bounds.h * 0.5;
    const factor = Math.max(1, Math.min(1.25, finiteNumber(parallax, 1)));
    const extraScroll = factor - 1;
    return {
        x: (cameraX - anchorX) * extraScroll,
        y: (cameraY - anchorY) * extraScroll
    };
}

function screenPoint(view, parallaxOffset, point) {
    const zoom = Math.max(0.0001, finiteNumber(view?.zoom, 1));
    return {
        x: (finiteNumber(point?.x, 0) - finiteNumber(view?.x, 0) - parallaxOffset.x) * zoom,
        y: (finiteNumber(point?.y, 0) - finiteNumber(view?.y, 0) - parallaxOffset.y) * zoom
    };
}

function traceSampledClosedPath(context, sampled, view, parallaxOffset) {
    if (!Array.isArray(sampled) || sampled.length < 3) return false;
    const first = screenPoint(view, parallaxOffset, sampled[0]);
    context.moveTo(first.x, first.y);
    for (let index = 1; index < sampled.length; index += 1) {
        const point = screenPoint(view, parallaxOffset, sampled[index]);
        context.lineTo(point.x, point.y);
    }
    context.closePath();
    return true;
}

export function caveGradientOpacityAtProgress(progress) {
    const t = Math.max(0, Math.min(1, finiteNumber(progress, 0)));
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function incrementalAlpha(previousOpacity, targetOpacity) {
    if (targetOpacity <= previousOpacity) return 0;
    return Math.max(0, Math.min(1, (targetOpacity - previousOpacity) / Math.max(0.000001, 1 - previousOpacity)));
}

function approximateControlPerimeter(points) {
    if (!Array.isArray(points) || points.length < 2) return 0;
    let total = 0;
    for (let index = 0; index < points.length; index += 1) {
        const a = points[index];
        const b = points[(index + 1) % points.length];
        total += Math.hypot(finiteNumber(b?.x, 0) - finiteNumber(a?.x, 0), finiteNumber(b?.y, 0) - finiteNumber(a?.y, 0));
    }
    return total;
}

function gradientStepsPerSegment(cave) {
    const pointCount = Math.max(1, cave.points.length);
    const averageSegmentLength = approximateControlPerimeter(cave.points) / pointCount;
    const targetSpacing = Math.max(3, Math.min(14, cave.gradientNoise.period * 0.22));
    return Math.max(8, Math.min(64, Math.ceil(averageSegmentLength / targetSpacing)));
}

function caveGradientGeometryKey(cave) {
    const points = cave.points
        .map((point) => `${point.id || ""}:${finiteNumber(point.x, 0).toFixed(2)},${finiteNumber(point.y, 0).toFixed(2)},${point.mode || "smooth"}`)
        .join(";");
    return [
        finiteNumber(cave.feather, 0).toFixed(2),
        cave.gradientNoise.seed,
        finiteNumber(cave.gradientNoise.amplitude, 0).toFixed(2),
        finiteNumber(cave.gradientNoise.period, 0).toFixed(2),
        points
    ].join("|");
}

function caveGradientGeometry(cave) {
    const key = caveGradientGeometryKey(cave);
    const cached = ORGANIC_GRADIENT_GEOMETRY_CACHE.get(key);
    if (cached) return cached;
    const stepsPerSegment = gradientStepsPerSegment(cave);
    let previousOpacity = 0;
    const bands = cave.feather > 0
        ? ORGANIC_GRADIENT_PROGRESS.map((progress) => {
            const targetOpacity = caveGradientOpacityAtProgress(progress);
            const alpha = incrementalAlpha(previousOpacity, targetOpacity);
            previousOpacity = targetOpacity;
            return {
                progress,
                alpha,
                points: sampleCaveWindowPerturbedOutset(
                    cave.points,
                    cave.feather,
                    cave.gradientNoise,
                    progress,
                    stepsPerSegment
                )
            };
        })
        : [];
    const geometry = {
        outset: sampleCaveWindowOutset(cave.points, cave.feather, stepsPerSegment),
        bands
    };
    ORGANIC_GRADIENT_GEOMETRY_CACHE.set(key, geometry);
    while (ORGANIC_GRADIENT_GEOMETRY_CACHE.size > ORGANIC_GRADIENT_GEOMETRY_CACHE_LIMIT) {
        const oldestKey = ORGANIC_GRADIENT_GEOMETRY_CACHE.keys().next().value;
        ORGANIC_GRADIENT_GEOMETRY_CACHE.delete(oldestKey);
    }
    return geometry;
}

function drawOrganicGradientBands(context, geometry, view, parallaxOffset, width, height) {
    if (!geometry.bands.length) return;
    context.save();
    context.globalCompositeOperation = "source-over";
    context.fillStyle = OPAQUE_BLACK;
    for (const band of geometry.bands) {
        if (band.alpha <= 0.000001) continue;
        context.beginPath();
        context.rect(0, 0, width, height);
        traceSampledClosedPath(context, band.points, view, parallaxOffset);
        context.globalAlpha = band.alpha;
        context.fill("evenodd");
    }
    context.restore();
}

function createMaskCanvas(targetCanvas) {
    const ownerDocument = targetCanvas?.ownerDocument || (typeof document !== "undefined" ? document : null);
    if (!ownerDocument?.createElement) {
        throw new Error("Cave-window masking requires a browser Canvas document.");
    }
    return ownerDocument.createElement("canvas");
}

function prepareMaskCanvas(maskCanvas, targetCanvas, width, height) {
    const surface = maskCanvas || createMaskCanvas(targetCanvas);
    if (surface.width !== width || surface.height !== height) {
        surface.width = width;
        surface.height = height;
    }
    return surface;
}

function rounded(value, digits = 3) {
    return finiteNumber(value, 0).toFixed(digits);
}

export function caveWindowMaskRenderKey(caveWindow, view, worldBounds, renderScale = DEFAULT_CAVE_MASK_RENDER_SCALE) {
    const cave = normalizeCaveWindow(caveWindow);
    const bounds = normalizedWorldBounds(worldBounds);
    const points = cave.points
        .map((point) => `${point.id || ""}:${rounded(point.x, 2)},${rounded(point.y, 2)},${point.mode || "smooth"}`)
        .join(";");
    return [
        cave.enabled ? 1 : 0,
        rounded(cave.feather, 2),
        rounded(cave.parallax, 4),
        cave.gradientNoise.seed,
        rounded(cave.gradientNoise.amplitude, 2),
        rounded(cave.gradientNoise.period, 2),
        points,
        Math.max(1, Math.round(finiteNumber(view?.w, 1))),
        Math.max(1, Math.round(finiteNumber(view?.h, 1))),
        rounded(view?.x, 3),
        rounded(view?.y, 3),
        rounded(view?.zoom, 5),
        rounded(bounds.x, 2),
        rounded(bounds.y, 2),
        rounded(bounds.w, 2),
        rounded(bounds.h, 2),
        rounded(renderScale, 3)
    ].join("|");
}

export function drawCaveWindowMask({
    targetContext,
    maskCanvas = null,
    previousRenderKey = "",
    caveWindow,
    view,
    worldBounds,
    renderScale = DEFAULT_CAVE_MASK_RENDER_SCALE
}) {
    const cave = normalizeCaveWindow(caveWindow);
    if (!cave.enabled || cave.points.length < 3) {
        return {
            drawn: false,
            reused: false,
            renderKey: "",
            maskCanvas,
            caveWindow: cave,
            parallaxOffset: { x: 0, y: 0 }
        };
    }

    const targetWidth = Math.max(1, Math.round(finiteNumber(view?.w, targetContext?.canvas?.width || 1)));
    const targetHeight = Math.max(1, Math.round(finiteNumber(view?.h, targetContext?.canvas?.height || 1)));
    const scale = Math.max(0.2, Math.min(1, finiteNumber(renderScale, DEFAULT_CAVE_MASK_RENDER_SCALE)));
    const width = Math.max(1, Math.ceil(targetWidth * scale));
    const height = Math.max(1, Math.ceil(targetHeight * scale));
    const surface = prepareMaskCanvas(maskCanvas, targetContext?.canvas, width, height);
    const renderKey = caveWindowMaskRenderKey(cave, view, worldBounds, scale);
    const reused = renderKey === previousRenderKey && surface.width === width && surface.height === height;
    const parallaxOffset = computeCaveWindowParallaxOffset(view, worldBounds, cave.parallax);
    const gradientGeometry = caveGradientGeometry(cave);

    if (!reused) {
        const maskContext = surface.getContext("2d");
        if (!maskContext) {
            throw new Error("Could not create the cave-window mask context.");
        }
        const maskView = {
            ...view,
            w: width,
            h: height,
            zoom: Math.max(0.0001, finiteNumber(view?.zoom, 1)) * scale
        };
        maskContext.save();
        maskContext.setTransform(1, 0, 0, 1, 0, 0);
        maskContext.globalCompositeOperation = "source-over";
        maskContext.globalAlpha = 1;
        maskContext.clearRect(0, 0, width, height);

        // Build the complete feather from nested perturbed opacity contours.
        // Unlike the former shadow blur, this is exactly transparent at the
        // authored opening, uses the full configured distance, and lets the
        // wavy iso-opacity lines remain visible instead of being buried beneath
        // a smooth, already-dark edge.
        drawOrganicGradientBands(maskContext, gradientGeometry, maskView, parallaxOffset, width, height);

        // Clamp the layered handover to the authored full-black distance. This
        // makes the Level Editor's outer guide an exact promise: every pixel
        // beyond that sampled outset is opaque black, regardless of browser
        // shadow-kernel differences.
        maskContext.globalCompositeOperation = "source-over";
        maskContext.fillStyle = OPAQUE_BLACK;
        maskContext.beginPath();
        maskContext.rect(0, 0, width, height);
        traceSampledClosedPath(maskContext, gradientGeometry.outset, maskView, parallaxOffset);
        maskContext.fill("evenodd");
        maskContext.restore();
    }

    targetContext.save();
    targetContext.globalCompositeOperation = "source-over";
    targetContext.globalAlpha = 1;
    targetContext.imageSmoothingEnabled = true;
    targetContext.drawImage(surface, 0, 0, width, height, 0, 0, targetWidth, targetHeight);
    targetContext.restore();

    return {
        drawn: true,
        reused,
        renderKey,
        maskCanvas: surface,
        caveWindow: cave,
        parallaxOffset
    };
}
