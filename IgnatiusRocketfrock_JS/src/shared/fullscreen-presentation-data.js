export const FULLSCREEN_REFERENCE_WIDTH = 1920;
export const FULLSCREEN_REFERENCE_HEIGHT = 1080;

function positiveDimension(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : 1;
}

export function computeFullscreenPresentationMetrics(targetWidth, targetHeight, fullscreen = true) {
    const width = positiveDimension(targetWidth);
    const height = positiveDimension(targetHeight);
    if (!fullscreen) {
        return {
            targetWidth: width,
            targetHeight: height,
            viewportWidth: width,
            viewportHeight: height,
            scale: 1,
            referenceActive: false
        };
    }

    const scale = Math.max(
        width / FULLSCREEN_REFERENCE_WIDTH,
        height / FULLSCREEN_REFERENCE_HEIGHT
    );
    return {
        targetWidth: width,
        targetHeight: height,
        viewportWidth: width / scale,
        viewportHeight: height / scale,
        scale,
        referenceActive: true
    };
}
