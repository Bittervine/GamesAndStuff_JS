import {
    applyColorExchangeToRgbaBytes,
    colorExchangeCacheKey,
    normalizeColorExchange
} from "../shared/color-exchange-data.js";

export function createColorExchangedSpriteCanvas(source, rawModifier, options = {}) {
    const modifier = normalizeColorExchange(rawModifier);
    if (!modifier) {
        return null;
    }
    const width = Math.max(1, Math.round(Number(options.width ?? source?.width ?? source?.naturalWidth) || 1));
    const height = Math.max(1, Math.round(Number(options.height ?? source?.height ?? source?.naturalHeight) || 1));
    const createCanvas = options.createCanvas || defaultCreateCanvas;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext?.("2d", { willReadFrequently: true }) || canvas.getContext?.("2d");
    if (!context || typeof context.drawImage !== "function" || typeof context.getImageData !== "function") {
        throw new Error("Color Exchange requires a readable 2D canvas context.");
    }
    context.clearRect?.(0, 0, width, height);
    context.drawImage(source, 0, 0, width, height);
    const imageData = context.getImageData(0, 0, width, height);
    const changedPixelCount = applyColorExchangeToRgbaBytes(imageData.data, modifier);
    context.putImageData(imageData, 0, 0);
    return {
        canvas,
        modifier,
        cacheKey: colorExchangeCacheKey(modifier),
        changedPixelCount
    };
}

function defaultCreateCanvas(width, height) {
    if (typeof document === "undefined") {
        throw new Error("No canvas factory was supplied outside a browser environment.");
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
}
