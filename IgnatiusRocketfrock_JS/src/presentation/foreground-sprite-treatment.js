function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function normalizeForegroundTreatment(visual) {
    return {
        brightness: clamp(finiteNumber(visual?.foregroundBrightness, 1), 0.05, 2),
        saturation: clamp(finiteNumber(visual?.foregroundSaturation, 0.62), 0, 1.5)
    };
}

export function foregroundTreatmentCacheKey({
    atlasId,
    frameName,
    colorMapKey = "",
    visual
}) {
    const treatment = normalizeForegroundTreatment(visual);
    return [
        atlasId || visual?.atlasId || "atlas",
        frameName || visual?.assetId || visual?.frame || "frame",
        treatment.brightness.toFixed(3),
        treatment.saturation.toFixed(3),
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

export function createForegroundSpriteCanvas({
    ownerDocument = null,
    sourceImage,
    frame,
    visual
}) {
    const width = Math.max(1, Math.round(finiteNumber(frame?.w, 1)));
    const height = Math.max(1, Math.round(finiteNumber(frame?.h, 1)));
    const surface = createCanvasSurface(ownerDocument, width, height);
    const context = surface.getContext("2d");
    if (!context) {
        throw new Error("Foreground sprite treatment could not create a 2D context.");
    }
    const treatment = normalizeForegroundTreatment(visual);
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
    return surface;
}
