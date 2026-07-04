export const BACKGROUND_LAYER = "decorBack";
export const TERRAIN_LAYER = "terrain";
export const DECORATION_LAYER = "decorFront";
export const ACTOR_FOREGROUND_LAYER = "actorFront";
export const CAVE_FOREGROUND_LAYER_ID = "caveForeground";

export const DEFAULT_FOREGROUND_PARALLAX = 1.08;
export const DEFAULT_BACKGROUND_PARALLAX = 1 / DEFAULT_FOREGROUND_PARALLAX;
export const DEFAULT_LAYER_BRIGHTNESS = 1;
export const DEFAULT_LAYER_SCALE = 1;
export const DEFAULT_FOREGROUND_BRIGHTNESS = 0.36;
export const DEFAULT_FOREGROUND_SCALE = 2;

function finiteNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

export function normalizeBackgroundParallax(value) {
    return Math.max(0.25, Math.min(1, finiteNumber(value, DEFAULT_BACKGROUND_PARALLAX)));
}

export function normalizeForegroundParallax(value) {
    return Math.max(1, Math.min(1.25, finiteNumber(value, DEFAULT_FOREGROUND_PARALLAX)));
}

export function normalizeLayerBrightness(value) {
    return Math.max(0.05, Math.min(2, finiteNumber(value, DEFAULT_LAYER_BRIGHTNESS)));
}

export function normalizeLayerScale(value) {
    return Math.max(0.1, Math.min(5, finiteNumber(value, DEFAULT_LAYER_SCALE)));
}

export function normalizeLevelLayerVisuals(rawVisuals) {
    const source = rawVisuals && typeof rawVisuals === "object" ? rawVisuals : {};
    const background = source.background && typeof source.background === "object" ? source.background : {};
    const foreground = source.foreground && typeof source.foreground === "object" ? source.foreground : {};
    return {
        version: 2,
        background: {
            parallax: normalizeBackgroundParallax(background.parallax),
            brightness: normalizeLayerBrightness(background.brightness),
            scale: normalizeLayerScale(background.scale)
        },
        foreground: {
            parallax: normalizeForegroundParallax(foreground.parallax),
            brightness: normalizeLayerBrightness(foreground.brightness ?? DEFAULT_FOREGROUND_BRIGHTNESS),
            scale: normalizeLayerScale(foreground.scale ?? DEFAULT_FOREGROUND_SCALE)
        }
    };
}

export function layerIsBackground(layer) {
    return String(layer || TERRAIN_LAYER) === BACKGROUND_LAYER;
}

export function layerIsForeground(layer) {
    return String(layer || TERRAIN_LAYER) === CAVE_FOREGROUND_LAYER_ID;
}

export function layerIsInertCosmetic(layer) {
    return layerIsBackground(layer) || layerIsForeground(layer);
}
