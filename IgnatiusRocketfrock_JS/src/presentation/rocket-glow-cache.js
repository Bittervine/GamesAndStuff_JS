function clampByte(value) {
    return Math.max(0, Math.min(255, Math.round(Number(value) || 0)));
}

function normalizeRadius(value) {
    return Math.max(0, Math.floor(Number(value) || 0));
}

function maxFilterLine(source, target, length, radius, readIndex, writeIndex) {
    if (radius <= 0) {
        for (let position = 0; position < length; position += 1) {
            target[writeIndex(position)] = source[readIndex(position)];
        }
        return;
    }

    const deque = new Int32Array(length);
    let head = 0;
    let tail = 0;
    let next = 0;
    for (let position = 0; position < length; position += 1) {
        const windowRight = Math.min(length - 1, position + radius);
        while (next <= windowRight) {
            const value = source[readIndex(next)];
            while (tail > head && source[readIndex(deque[tail - 1])] <= value) {
                tail -= 1;
            }
            deque[tail] = next;
            tail += 1;
            next += 1;
        }

        const windowLeft = position - radius;
        while (tail > head && deque[head] < windowLeft) {
            head += 1;
        }
        target[writeIndex(position)] = source[readIndex(deque[head])];
    }
}

export function dilateAlphaSeparable(alpha, width, height, radius = 1) {
    const w = Math.max(1, Math.floor(Number(width) || 1));
    const h = Math.max(1, Math.floor(Number(height) || 1));
    const source = alpha instanceof Uint8ClampedArray
        ? alpha
        : Uint8ClampedArray.from(alpha || []);
    if (source.length !== w * h) {
        throw new Error(`Alpha buffer length ${source.length} does not match ${w}x${h}.`);
    }

    const r = normalizeRadius(radius);
    if (r <= 0) return new Uint8ClampedArray(source);

    const horizontal = new Uint8ClampedArray(source.length);
    const output = new Uint8ClampedArray(source.length);
    for (let y = 0; y < h; y += 1) {
        const rowOffset = y * w;
        maxFilterLine(
            source,
            horizontal,
            w,
            r,
            (x) => rowOffset + x,
            (x) => rowOffset + x
        );
    }
    for (let x = 0; x < w; x += 1) {
        maxFilterLine(
            horizontal,
            output,
            h,
            r,
            (y) => y * w + x,
            (y) => y * w + x
        );
    }
    return output;
}

export function gaussianKernel(radius = 4, sigma = 0) {
    const r = normalizeRadius(radius);
    if (r <= 0) return new Float32Array([1]);
    const safeSigma = Math.max(0.1, Number(sigma) || r * 0.52);
    const kernel = new Float32Array(r * 2 + 1);
    let sum = 0;
    for (let offset = -r; offset <= r; offset += 1) {
        const value = Math.exp(-(offset * offset) / (2 * safeSigma * safeSigma));
        kernel[offset + r] = value;
        sum += value;
    }
    for (let index = 0; index < kernel.length; index += 1) {
        kernel[index] /= sum;
    }
    return kernel;
}

function convolveAlphaLine(source, target, length, kernel, readIndex, writeIndex) {
    const radius = Math.floor(kernel.length / 2);
    for (let position = 0; position < length; position += 1) {
        let sum = 0;
        for (let kernelIndex = 0; kernelIndex < kernel.length; kernelIndex += 1) {
            const samplePosition = position + kernelIndex - radius;
            if (samplePosition < 0 || samplePosition >= length) continue;
            sum += source[readIndex(samplePosition)] * kernel[kernelIndex];
        }
        target[writeIndex(position)] = sum;
    }
}

export function gaussianBlurAlphaSeparable(alpha, width, height, radius = 4, sigma = 0) {
    const w = Math.max(1, Math.floor(Number(width) || 1));
    const h = Math.max(1, Math.floor(Number(height) || 1));
    const source = alpha instanceof Uint8ClampedArray
        ? alpha
        : Uint8ClampedArray.from(alpha || []);
    if (source.length !== w * h) {
        throw new Error(`Alpha buffer length ${source.length} does not match ${w}x${h}.`);
    }

    const kernel = gaussianKernel(radius, sigma);
    if (kernel.length === 1) return new Uint8ClampedArray(source);

    const horizontal = new Float32Array(source.length);
    const vertical = new Float32Array(source.length);
    for (let y = 0; y < h; y += 1) {
        const rowOffset = y * w;
        convolveAlphaLine(
            source,
            horizontal,
            w,
            kernel,
            (x) => rowOffset + x,
            (x) => rowOffset + x
        );
    }
    for (let x = 0; x < w; x += 1) {
        convolveAlphaLine(
            horizontal,
            vertical,
            h,
            kernel,
            (y) => y * w + x,
            (y) => y * w + x
        );
    }
    return Uint8ClampedArray.from(vertical, clampByte);
}

function parseHexColor(value) {
    const text = String(value || "#ffffff").trim();
    const compact = /^#([0-9a-f]{3})$/i.exec(text);
    if (compact) {
        return {
            r: parseInt(compact[1][0] + compact[1][0], 16),
            g: parseInt(compact[1][1] + compact[1][1], 16),
            b: parseInt(compact[1][2] + compact[1][2], 16)
        };
    }
    const full = /^#([0-9a-f]{6})$/i.exec(text);
    if (full) {
        return {
            r: parseInt(full[1].slice(0, 2), 16),
            g: parseInt(full[1].slice(2, 4), 16),
            b: parseInt(full[1].slice(4, 6), 16)
        };
    }
    return { r: 255, g: 255, b: 255 };
}

function defaultCanvasFactory(width, height, sourceCanvas = null) {
    const ownerDocument = sourceCanvas?.ownerDocument || (typeof document !== "undefined" ? document : null);
    if (ownerDocument?.createElement) {
        const canvas = ownerDocument.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
    if (typeof OffscreenCanvas === "function") {
        return new OffscreenCanvas(width, height);
    }
    return null;
}

const DEFAULT_GLOW_SIZE_MULTIPLIER = 3;
const DEFAULT_GLOW_BLUR_OUTSET_FRACTION = 0.25;
const DEFAULT_GLOW_BLUR_SIGMA_FACTOR = 0.82;

export function createRocketGlowSurface(sourceCanvas, tint, options = {}) {
    const sourceWidth = Math.max(1, Math.floor(Number(sourceCanvas?.width) || 1));
    const sourceHeight = Math.max(1, Math.floor(Number(sourceCanvas?.height) || 1));
    if (!sourceCanvas || !sourceWidth || !sourceHeight) return null;

    const shortestSide = Math.max(1, Math.min(sourceWidth, sourceHeight));
    const glowSizeMultiplier = Math.max(1, Number(options.glowSizeMultiplier) || DEFAULT_GLOW_SIZE_MULTIPLIER);
    const expansionRadius = Math.max(1, normalizeRadius((options.expansionRadius ?? shortestSide * 0.035) * glowSizeMultiplier));
    const minimumBlurOutset = Math.max(2, normalizeRadius(sourceWidth * (Number(options.blurOutsetFraction) || DEFAULT_GLOW_BLUR_OUTSET_FRACTION)));
    const blurRadius = Math.max(
        2,
        minimumBlurOutset,
        normalizeRadius((options.blurRadius ?? shortestSide * 0.06) * glowSizeMultiplier)
    );
    const blurSigma = Math.max(0.1, Number(options.blurSigma) || blurRadius * DEFAULT_GLOW_BLUR_SIGMA_FACTOR);
    const padding = Math.max(2, expansionRadius + blurRadius * 2 + 2);
    const width = sourceWidth + padding * 2;
    const height = sourceHeight + padding * 2;
    const canvasFactory = typeof options.canvasFactory === "function" ? options.canvasFactory : defaultCanvasFactory;
    const surface = canvasFactory(width, height, sourceCanvas);
    if (!surface) return null;
    surface.width = width;
    surface.height = height;
    const context = surface.getContext?.("2d", { willReadFrequently: true });
    if (!context) return null;

    context.clearRect(0, 0, width, height);
    context.drawImage(sourceCanvas, padding, padding);
    const pixels = context.getImageData(0, 0, width, height);
    const sourceAlpha = new Uint8ClampedArray(width * height);
    for (let pixelIndex = 0; pixelIndex < sourceAlpha.length; pixelIndex += 1) {
        sourceAlpha[pixelIndex] = pixels.data[pixelIndex * 4 + 3];
    }

    const expandedAlpha = dilateAlphaSeparable(sourceAlpha, width, height, expansionRadius);
    const blurredAlpha = gaussianBlurAlphaSeparable(
        expandedAlpha,
        width,
        height,
        blurRadius,
        blurSigma
    );
    const color = parseHexColor(tint);
    const opacity = Math.max(0, Math.min(1, Number(options.opacity) || 0.92));
    const edgeWeight = Math.max(0, Math.min(1, Number(options.edgeWeight) || 0.32));
    const output = context.createImageData(width, height);
    for (let pixelIndex = 0; pixelIndex < sourceAlpha.length; pixelIndex += 1) {
        const blurred = blurredAlpha[pixelIndex] / 255;
        const expanded = expandedAlpha[pixelIndex] / 255;
        const combined = Math.max(blurred, expanded * edgeWeight);
        const alphaValue = clampByte(Math.pow(combined, 0.82) * 255 * opacity);
        const dataIndex = pixelIndex * 4;
        output.data[dataIndex] = color.r;
        output.data[dataIndex + 1] = color.g;
        output.data[dataIndex + 2] = color.b;
        output.data[dataIndex + 3] = alphaValue;
    }
    context.clearRect(0, 0, width, height);
    context.putImageData(output, 0, 0);
    return {
        canvas: surface,
        paddingX: padding,
        paddingY: padding,
        sourceWidth,
        sourceHeight,
        tint: String(tint || "#ffffff")
    };
}

export class RocketGlowCache {
    constructor(options = {}) {
        this.options = { ...options };
        this.bySource = new WeakMap();
    }

    clear() {
        this.bySource = new WeakMap();
    }

    get(sourceCanvas, tint, options = {}) {
        if (!sourceCanvas || (typeof sourceCanvas !== "object" && typeof sourceCanvas !== "function")) return null;
        const color = String(tint || "").trim();
        if (!color) return null;
        let entries = this.bySource.get(sourceCanvas);
        if (!entries) {
            entries = new Map();
            this.bySource.set(sourceCanvas, entries);
        }
        const merged = { ...this.options, ...options };
        const key = [
            color.toLowerCase(),
            Number(merged.glowSizeMultiplier) || DEFAULT_GLOW_SIZE_MULTIPLIER,
            Number(merged.blurOutsetFraction) || DEFAULT_GLOW_BLUR_OUTSET_FRACTION,
            normalizeRadius(merged.expansionRadius ?? -1),
            normalizeRadius(merged.blurRadius ?? -1),
            Number(merged.blurSigma) || 0,
            Number(merged.opacity) || 0,
            Number(merged.edgeWeight) || 0
        ].join("|");
        if (!entries.has(key)) {
            entries.set(key, createRocketGlowSurface(sourceCanvas, color, merged));
        }
        return entries.get(key) || null;
    }
}
