function positiveNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
}

function nonNegativeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : fallback;
}

export function calculateHudPanelScale({
    viewportWidth,
    viewportHeight,
    panelWidth,
    panelHeight,
    leftInset = 0,
    rightInset = leftInset,
    topInset = 0,
    bottomInset = topInset,
    panelGap = 0,
    minimapVisible = true,
    maximumScale = 1
} = {}) {
    const width = positiveNumber(viewportWidth, 1);
    const height = positiveNumber(viewportHeight, 1);
    const naturalWidth = positiveNumber(panelWidth, 1);
    const naturalHeight = positiveNumber(panelHeight, 1);
    const left = nonNegativeNumber(leftInset);
    const right = nonNegativeNumber(rightInset, left);
    const top = nonNegativeNumber(topInset);
    const bottom = nonNegativeNumber(bottomInset, top);
    const gap = minimapVisible ? nonNegativeNumber(panelGap) : 0;
    const panelCount = minimapVisible ? 2 : 1;
    const horizontalSpace = Math.max(1, width - left - right - gap);
    const verticalSpace = Math.max(1, height - top - bottom);
    const widthScale = horizontalSpace / (naturalWidth * panelCount);
    const heightScale = verticalSpace / naturalHeight;
    const cap = positiveNumber(maximumScale, 1);
    return Math.max(Number.EPSILON, Math.min(cap, widthScale, heightScale));
}
