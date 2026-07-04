function finite(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

export function referenceTimeAtPlayhead(playheadSeconds, offsetSeconds, sourceDurationSeconds, loop = true) {
    const duration = Math.max(0, finite(sourceDurationSeconds));
    const raw = finite(playheadSeconds) + finite(offsetSeconds);
    if (duration <= 0) {
        return Math.max(0, raw);
    }
    if (!loop) {
        return Math.max(0, Math.min(duration, raw));
    }
    return ((raw % duration) + duration) % duration;
}

export function fittedReferenceSize(sourceWidth, sourceHeight, targetHeight = 540) {
    const width = Math.max(1, finite(sourceWidth, 1));
    const height = Math.max(1, finite(sourceHeight, 1));
    const fittedHeight = Math.max(1, finite(targetHeight, 540));
    return {
        width: fittedHeight * width / height,
        height: fittedHeight
    };
}

export function normalizeReferencePlateDisplay(raw = {}) {
    return {
        x: finite(raw.x),
        y: finite(raw.y),
        width: Math.max(1, finite(raw.width, 320)),
        height: Math.max(1, finite(raw.height, 540)),
        opacity: Math.max(0, Math.min(1, finite(raw.opacity, 0.45)))
    };
}
