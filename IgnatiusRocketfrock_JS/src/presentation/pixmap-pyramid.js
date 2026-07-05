const DEFAULT_OVERSAMPLE = 2;
const DEFAULT_MIN_DIMENSION = 2;

function finiteDimension(value, fallback = 1) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
}

function sourceDimensions(source) {
    return {
        width: Math.max(1, Math.round(finiteDimension(source?.width ?? source?.naturalWidth, 1))),
        height: Math.max(1, Math.round(finiteDimension(source?.height ?? source?.naturalHeight, 1)))
    };
}

function defaultCreateCanvas(width, height) {
    if (typeof OffscreenCanvas === "function") {
        return new OffscreenCanvas(width, height);
    }
    if (typeof document !== "undefined" && typeof document.createElement === "function") {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
    throw new Error("A canvas factory is required to build a pixmap pyramid outside a browser.");
}

/**
 * Builds immutable half-resolution copies for one isolated pixmap. The total
 * pixel area approaches 4/3 of the original, comfortably below the promised
 * 2x memory ceiling. Packed atlases are deliberately excluded because their
 * neighbours need padding before safe downsampling.
 */
export function createPixmapPyramid(source, options = {}) {
    if (!source) return null;
    const createCanvas = options.createCanvas || defaultCreateCanvas;
    const minDimension = Math.max(1, Math.round(finiteDimension(options.minDimension, DEFAULT_MIN_DIMENSION)));
    const original = sourceDimensions(source);
    const levels = [{ source, width: original.width, height: original.height, scaleX: 1, scaleY: 1 }];
    let previous = levels[0];

    while (previous.width > minDimension || previous.height > minDimension) {
        const width = Math.max(1, Math.round(previous.width * 0.5));
        const height = Math.max(1, Math.round(previous.height * 0.5));
        if (width === previous.width && height === previous.height) break;
        const canvas = createCanvas(width, height);
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext?.("2d");
        if (!context || typeof context.drawImage !== "function") {
            throw new Error("Pixmap pyramid canvas factory must provide a 2D drawing context.");
        }
        context.imageSmoothingEnabled = true;
        if ("imageSmoothingQuality" in context) context.imageSmoothingQuality = "high";
        context.clearRect?.(0, 0, width, height);
        context.drawImage(previous.source, 0, 0, previous.width, previous.height, 0, 0, width, height);
        previous = {
            source: canvas,
            width,
            height,
            scaleX: width / original.width,
            scaleY: height / original.height
        };
        levels.push(previous);
        if (width <= minDimension && height <= minDimension) break;
    }

    return Object.freeze({
        source,
        width: original.width,
        height: original.height,
        levels: Object.freeze(levels)
    });
}

export function choosePixmapLevel(pyramid, targetWidth, targetHeight, oversample = DEFAULT_OVERSAMPLE) {
    if (!pyramid?.levels?.length) return null;
    const requiredWidth = Math.max(1, finiteDimension(targetWidth, pyramid.width) * Math.max(1, finiteDimension(oversample, DEFAULT_OVERSAMPLE)));
    const requiredHeight = Math.max(1, finiteDimension(targetHeight, pyramid.height) * Math.max(1, finiteDimension(oversample, DEFAULT_OVERSAMPLE)));

    // Each level is approximately half-sized in both axes. Estimate the index
    // directly from the limiting dimension, then correct by at most a couple of
    // slots for odd-size rounding. This avoids walking the pyramid per draw.
    const widthRatio = pyramid.width / requiredWidth;
    const heightRatio = pyramid.height / requiredHeight;
    const limitingRatio = Math.max(1, Math.min(widthRatio, heightRatio));
    let index = Math.min(
        pyramid.levels.length - 1,
        Math.max(0, Math.floor(Math.log2(limitingRatio)))
    );
    while (index > 0) {
        const level = pyramid.levels[index];
        if (level.width + 0.001 >= requiredWidth && level.height + 0.001 >= requiredHeight) break;
        index -= 1;
    }
    while (index + 1 < pyramid.levels.length) {
        const next = pyramid.levels[index + 1];
        if (next.width + 0.001 < requiredWidth || next.height + 0.001 < requiredHeight) break;
        index += 1;
    }
    return pyramid.levels[index];
}

function transformedDestinationSize(context, width, height) {
    const transform = typeof context?.getTransform === "function" ? context.getTransform() : null;
    if (!transform) return { width: Math.abs(width), height: Math.abs(height) };
    const scaleX = Math.hypot(Number(transform.a) || 0, Number(transform.b) || 0) || 1;
    const scaleY = Math.hypot(Number(transform.c) || 0, Number(transform.d) || 0) || 1;
    return { width: Math.abs(width) * scaleX, height: Math.abs(height) * scaleY };
}

/** Draws a complete isolated pixmap while choosing a source level from the current transform. */
export function drawPixmap(context, pyramid, dx, dy, dw = pyramid?.width, dh = pyramid?.height, options = {}) {
    if (!context || !pyramid) return null;
    const destination = transformedDestinationSize(context, finiteDimension(dw, pyramid.width), finiteDimension(dh, pyramid.height));
    const level = choosePixmapLevel(pyramid, destination.width, destination.height, options.oversample ?? DEFAULT_OVERSAMPLE) || pyramid.levels[0];
    context.drawImage(level.source, 0, 0, level.width, level.height, dx, dy, dw, dh);
    return level;
}
