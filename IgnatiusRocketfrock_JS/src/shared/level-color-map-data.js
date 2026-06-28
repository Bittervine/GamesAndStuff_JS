export const DEFAULT_LEVEL_COLOR_MAP = Object.freeze({
    enabled: false,
    sourceHue: 200,
    range: 80,
    feather: 24,
    rotation: 0,
    atlasIds: Object.freeze([])
});

export function normalizeHueDegrees(value) {
    const numeric = Number(value) || 0;
    return ((numeric % 360) + 360) % 360;
}

export function normalizeLevelColorMap(value) {
    const source = value && typeof value === "object" ? value : {};
    return {
        enabled: Boolean(source.enabled),
        sourceHue: normalizeHueDegrees(source.sourceHue ?? source.hue ?? DEFAULT_LEVEL_COLOR_MAP.sourceHue),
        range: clamp(Number(source.range ?? source.width ?? DEFAULT_LEVEL_COLOR_MAP.range) || 0, 0, 360),
        feather: clamp(Number(source.feather ?? DEFAULT_LEVEL_COLOR_MAP.feather) || 0, 0, 180),
        rotation: clamp(Number(source.rotation ?? source.hueRotation ?? DEFAULT_LEVEL_COLOR_MAP.rotation) || 0, -360, 360),
        atlasIds: normalizeAtlasIds(source.atlasIds ?? source.atlasAllowlist ?? DEFAULT_LEVEL_COLOR_MAP.atlasIds)
    };
}

export function colorMapCacheKey(value) {
    const map = normalizeLevelColorMap(value);
    const base = [
        map.enabled ? 1 : 0,
        roundForKey(map.sourceHue),
        roundForKey(map.range),
        roundForKey(map.feather),
        roundForKey(map.rotation)
    ].join(":");
    return map.atlasIds.length ? `${base}:${map.atlasIds.join(",")}` : base;
}

export function isEffectiveLevelColorMap(value) {
    const map = normalizeLevelColorMap(value);
    return map.enabled && Math.abs(map.rotation) > 0.0001 && map.range + map.feather * 2 > 0;
}


export function colorMapAppliesToAtlas(value, atlasId) {
    const map = normalizeLevelColorMap(value);
    if (!isEffectiveLevelColorMap(map)) {
        return false;
    }
    if (!map.atlasIds.length) {
        return true;
    }
    return map.atlasIds.includes(String(atlasId || ""));
}

export function circularHueDistance(a, b) {
    const delta = Math.abs(normalizeHueDegrees(a) - normalizeHueDegrees(b));
    return Math.min(delta, 360 - delta);
}

export function selectiveHueWeight(hue, value) {
    return selectiveHueWeightWithMap(hue, normalizeLevelColorMap(value));
}

export function remapRgb(r, g, b, value) {
    const map = normalizeLevelColorMap(value);
    if (!isEffectiveLevelColorMap(map)) {
        return [clampByte(r), clampByte(g), clampByte(b)];
    }
    const hsl = rgbToHsl(r, g, b);
    if (hsl.s <= 0.001) {
        return [clampByte(r), clampByte(g), clampByte(b)];
    }
    const weight = selectiveHueWeightWithMap(hsl.h, map);
    if (weight <= 0) {
        return [clampByte(r), clampByte(g), clampByte(b)];
    }
    return hslToRgb(normalizeHueDegrees(hsl.h + map.rotation * weight), hsl.s, hsl.l);
}

export function rgbToHsl(r, g, b) {
    const red = clampByte(r) / 255;
    const green = clampByte(g) / 255;
    const blue = clampByte(b) / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const lightness = (max + min) * 0.5;
    if (max === min) {
        return { h: 0, s: 0, l: lightness };
    }
    const delta = max - min;
    const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    let hue;
    if (max === red) {
        hue = (green - blue) / delta + (green < blue ? 6 : 0);
    } else if (max === green) {
        hue = (blue - red) / delta + 2;
    } else {
        hue = (red - green) / delta + 4;
    }
    return { h: hue * 60, s: saturation, l: lightness };
}

export function hslToRgb(h, s, l) {
    const hue = normalizeHueDegrees(h) / 360;
    const saturation = clamp(Number(s) || 0, 0, 1);
    const lightness = clamp(Number(l) || 0, 0, 1);
    if (saturation === 0) {
        const gray = clampByte(Math.round(lightness * 255));
        return [gray, gray, gray];
    }
    const q = lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;
    return [
        clampByte(Math.round(hueToRgb(p, q, hue + 1 / 3) * 255)),
        clampByte(Math.round(hueToRgb(p, q, hue) * 255)),
        clampByte(Math.round(hueToRgb(p, q, hue - 1 / 3) * 255))
    ];
}

function selectiveHueWeightWithMap(hue, map) {
    if (!map.enabled || Math.abs(map.rotation) <= 0.0001) {
        return 0;
    }
    if (map.range >= 360) {
        return 1;
    }
    const distance = circularHueDistance(hue, map.sourceHue);
    const halfRange = map.range * 0.5;
    if (distance <= halfRange) {
        return 1;
    }
    if (map.feather <= 0 || distance >= halfRange + map.feather) {
        return 0;
    }
    const t = 1 - (distance - halfRange) / map.feather;
    return t * t * (3 - 2 * t);
}

function hueToRgb(p, q, t) {
    let value = t;
    if (value < 0) value += 1;
    if (value > 1) value -= 1;
    if (value < 1 / 6) return p + (q - p) * 6 * value;
    if (value < 1 / 2) return q;
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
    return p;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function clampByte(value) {
    return Math.max(0, Math.min(255, Math.round(Number(value) || 0)));
}

function roundForKey(value) {
    return Math.round((Number(value) || 0) * 1000) / 1000;
}

function normalizeAtlasIds(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return [...new Set(value.map((entry) => String(entry || "").trim()).filter(Boolean))].sort();
}
