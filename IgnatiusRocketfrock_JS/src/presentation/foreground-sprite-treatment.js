import { normalizeRotationRadians, placementCenter } from "../shared/level-transform.js";

function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function normalizedVector(x, y) {
    const length = Math.hypot(x, y);
    if (length <= 0.000001) return null;
    return { x: x / length, y: y / length };
}

export function caveWindowCenter(caveWindow) {
    const points = Array.isArray(caveWindow?.points) ? caveWindow.points : [];
    if (!points.length) return null;
    let x = 0;
    let y = 0;
    for (const point of points) {
        x += finiteNumber(point?.x, 0);
        y += finiteNumber(point?.y, 0);
    }
    return { x: x / points.length, y: y / points.length };
}

export function foregroundWorldOutwardVector(visual, fallbackCenter = null) {
    const authored = normalizedVector(
        finiteNumber(visual?.foregroundOutwardX, 0),
        finiteNumber(visual?.foregroundOutwardY, 0)
    );
    if (authored) return authored;
    if (!fallbackCenter) return null;
    const center = placementCenter(visual);
    return normalizedVector(center.x - fallbackCenter.x, center.y - fallbackCenter.y);
}

export function foregroundLocalOutwardVector(visual, fallbackCenter = null) {
    const world = foregroundWorldOutwardVector(visual, fallbackCenter);
    if (!world) return null;
    const rotation = normalizeRotationRadians(visual?.rotation, visual?.angle);
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);
    let x = world.x * cosine + world.y * sine;
    let y = -world.x * sine + world.y * cosine;
    if (visual?.mirrorX) x *= -1;
    if (visual?.mirrorY) y *= -1;
    return normalizedVector(x, y);
}

export function normalizeForegroundTreatment(visual, fallbackCenter = null) {
    const localOutward = foregroundLocalOutwardVector(visual, fallbackCenter);
    let fadeStart = clamp(finiteNumber(visual?.foregroundFadeStart, 0.05), 0, 0.95);
    let fadeEnd = clamp(finiteNumber(visual?.foregroundFadeEnd, 0.92), fadeStart + 0.01, 1);
    if (!localOutward) {
        fadeStart = 1;
        fadeEnd = 1;
    }
    return {
        brightness: clamp(finiteNumber(visual?.foregroundBrightness, 0.36), 0.08, 1),
        saturation: clamp(finiteNumber(visual?.foregroundSaturation, 0.62), 0, 1.5),
        localOutward,
        fadeStart,
        fadeEnd
    };
}

export function foregroundTreatmentCacheKey({
    atlasId,
    frameName,
    colorMapKey = "",
    visual,
    fallbackCenter = null
}) {
    const treatment = normalizeForegroundTreatment(visual, fallbackCenter);
    return [
        atlasId || visual?.atlasId || "atlas",
        frameName || visual?.assetId || visual?.frame || "frame",
        treatment.brightness.toFixed(3),
        treatment.saturation.toFixed(3),
        treatment.localOutward ? treatment.localOutward.x.toFixed(3) : "none",
        treatment.localOutward ? treatment.localOutward.y.toFixed(3) : "none",
        treatment.fadeStart.toFixed(3),
        treatment.fadeEnd.toFixed(3),
        colorMapKey || ""
    ].join("|");
}

function createCanvasSurface(ownerDocument, width, height) {
    const surface = ownerDocument?.createElement
        ? ownerDocument.createElement("canvas")
        : (typeof OffscreenCanvas === "function" ? new OffscreenCanvas(width, height) : null);
    if (!surface) {
        throw new Error("Foreground sprite treatment requires a canvas surface.");
    }
    surface.width = width;
    surface.height = height;
    return surface;
}

function applyOutwardBlackFade(context, width, height, treatment) {
    const outward = treatment.localOutward;
    if (!outward || treatment.fadeStart >= 1 || treatment.fadeEnd >= 1.000001) return;
    const radius = Math.max(1, Math.abs(outward.x) * width * 0.5 + Math.abs(outward.y) * height * 0.5);
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const gradient = context.createLinearGradient(
        centerX - outward.x * radius,
        centerY - outward.y * radius,
        centerX + outward.x * radius,
        centerY + outward.y * radius
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(treatment.fadeStart, "rgba(0, 0, 0, 0)");
    const span = treatment.fadeEnd - treatment.fadeStart;
    const smootherStep = (value) => {
        const t = clamp(value, 0, 1);
        return t * t * t * (t * (t * 6 - 15) + 10);
    };
    for (const fraction of [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875]) {
        const position = treatment.fadeStart + span * fraction;
        gradient.addColorStop(position, `rgba(0, 0, 0, ${smootherStep(fraction).toFixed(4)})`);
    }
    gradient.addColorStop(treatment.fadeEnd, "rgba(0, 0, 0, 1)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
    context.save();
    context.globalCompositeOperation = "source-atop";
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    context.restore();
}

export function createForegroundSpriteCanvas({
    ownerDocument = null,
    sourceImage,
    frame,
    visual,
    fallbackCenter = null
}) {
    const width = Math.max(1, Math.round(finiteNumber(frame?.w, 1)));
    const height = Math.max(1, Math.round(finiteNumber(frame?.h, 1)));
    const surface = createCanvasSurface(ownerDocument, width, height);
    const context = surface.getContext("2d");
    if (!context) {
        throw new Error("Foreground sprite treatment could not create a 2D context.");
    }
    const treatment = normalizeForegroundTreatment(visual, fallbackCenter);
    context.filter = `brightness(${treatment.brightness}) saturate(${treatment.saturation})`;
    context.drawImage(
        sourceImage,
        finiteNumber(frame?.x, 0),
        finiteNumber(frame?.y, 0),
        width,
        height,
        0,
        0,
        width,
        height
    );
    context.filter = "none";
    applyOutwardBlackFade(context, width, height, treatment);
    return surface;
}
