import {
    caveSplineSegmentControls,
    normalizeCaveWindow
} from "../shared/cave-window-data.js";

const OPAQUE_BLACK = "rgb(0, 0, 0)";
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

function traceCaveWindowPath(context, points, view, parallaxOffset) {
    if (!Array.isArray(points) || points.length < 3) {
        return false;
    }
    const first = screenPoint(view, parallaxOffset, points[0]);
    context.beginPath();
    context.moveTo(first.x, first.y);
    for (let index = 0; index < points.length; index += 1) {
        const controls = caveSplineSegmentControls(points, index);
        const controlA = screenPoint(view, parallaxOffset, controls.controlA);
        const controlB = screenPoint(view, parallaxOffset, controls.controlB);
        const end = screenPoint(view, parallaxOffset, controls.end);
        context.bezierCurveTo(controlA.x, controlA.y, controlB.x, controlB.y, end.x, end.y);
    }
    context.closePath();
    return true;
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
        const featherPixels = Math.max(
            0,
            Math.min(Math.max(width, height), cave.feather * maskView.zoom)
        );

        maskContext.save();
        maskContext.setTransform(1, 0, 0, 1, 0, 0);
        maskContext.globalCompositeOperation = "source-over";
        maskContext.globalAlpha = 1;
        maskContext.shadowBlur = 0;
        maskContext.clearRect(0, 0, width, height);
        maskContext.fillStyle = OPAQUE_BLACK;
        maskContext.fillRect(0, 0, width, height);

        maskContext.globalCompositeOperation = "destination-out";
        maskContext.fillStyle = OPAQUE_BLACK;
        if (featherPixels > 0.5) {
            maskContext.shadowColor = "rgba(0, 0, 0, 1)";
            maskContext.shadowBlur = featherPixels;
            maskContext.shadowOffsetX = 0;
            maskContext.shadowOffsetY = 0;
            traceCaveWindowPath(maskContext, cave.points, maskView, parallaxOffset);
            maskContext.fill();
        }

        maskContext.shadowBlur = 0;
        maskContext.shadowColor = "rgba(0, 0, 0, 0)";
        traceCaveWindowPath(maskContext, cave.points, maskView, parallaxOffset);
        maskContext.fill();
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
