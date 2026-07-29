import {
    applyColorExchangeToRgbaBytes,
    isEffectiveLevelColorExchange,
    normalizeLevelColorExchange
} from "../shared/color-exchange-data.js";
import {
    colorMapAppliesToAtlas,
    isEffectiveLevelColorMap,
    normalizeLevelColorMap,
    remapRgb
} from "../shared/level-color-map-data.js";

export function applyLevelColorMapToImageData(imageData, value) {
    if (!imageData?.data) {
        return imageData;
    }
    const map = normalizeLevelColorMap(value);
    if (!isEffectiveLevelColorMap(map)) {
        return imageData;
    }
    const data = imageData.data;
    for (let index = 0; index < data.length; index += 4) {
        if (data[index + 3] === 0) {
            continue;
        }
        const [r, g, b] = remapRgb(data[index], data[index + 1], data[index + 2], map);
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
    }
    return imageData;
}

export function applyLevelColorTreatmentToImageData(imageData, colorMapValue, colorExchangeValue) {
    if (!imageData?.data) {
        return imageData;
    }
    const exchange = normalizeLevelColorExchange(colorExchangeValue);
    if (isEffectiveLevelColorExchange(exchange)) {
        applyColorExchangeToRgbaBytes(imageData.data, exchange);
    }
    applyLevelColorMapToImageData(imageData, colorMapValue);
    return imageData;
}

export function createLevelColorTreatedCanvas(
    image,
    colorMapValue,
    colorExchangeValue,
    canvasFactory = defaultCanvasFactory,
    atlasId = ""
) {
    const map = normalizeLevelColorMap(colorMapValue);
    const exchange = normalizeLevelColorExchange(colorExchangeValue);
    const mapApplies = colorMapAppliesToAtlas(map, atlasId);
    const exchangeApplies = isEffectiveLevelColorExchange(exchange);
    if (!image || (!mapApplies && !exchangeApplies)) {
        return image || null;
    }
    const width = Math.max(1, Number(image.naturalWidth || image.videoWidth || image.width) || 1);
    const height = Math.max(1, Number(image.naturalHeight || image.videoHeight || image.height) || 1);
    const canvas = canvasFactory(width, height);
    if (!canvas) {
        return image;
    }
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext?.("2d", { willReadFrequently: true });
    if (!context) {
        return image;
    }
    try {
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        const imageData = context.getImageData(0, 0, width, height);
        applyLevelColorTreatmentToImageData(imageData, mapApplies ? map : null, exchangeApplies ? exchange : null);
        context.putImageData(imageData, 0, 0);
        return canvas;
    } catch (error) {
        console.warn("Could not build recolored atlas cache; using the original atlas.", error);
        return image;
    }
}

export function createColorMappedCanvas(image, value, canvasFactory = defaultCanvasFactory, atlasId = "") {
    return createLevelColorTreatedCanvas(image, value, null, canvasFactory, atlasId);
}

function defaultCanvasFactory(width, height) {
    if (typeof OffscreenCanvas !== "undefined") {
        return new OffscreenCanvas(width, height);
    }
    if (typeof document !== "undefined") {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
    return null;
}
