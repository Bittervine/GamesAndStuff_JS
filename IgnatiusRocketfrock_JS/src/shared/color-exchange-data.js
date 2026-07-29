const COLOR_CHANNEL_MAX = 255;
const FLOAT_EPSILON = 1e-7;

export const DEFAULT_LEVEL_COLOR_EXCHANGE = Object.freeze({
    enabled: false,
    fromColor: Object.freeze([255, 255, 255]),
    toColor: Object.freeze([0, 0, 0]),
    redThreshold: 1,
    greenThreshold: 1,
    blueThreshold: 1
});

export function normalizeColorExchange(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw) || raw.enabled === false) {
        return null;
    }
    return {
        fromColor: normalizeRgbColor(raw.fromColor ?? raw.from ?? [255, 255, 255]),
        toColor: normalizeRgbColor(raw.toColor ?? raw.to ?? [0, 0, 0]),
        redThreshold: clampUnit(raw.redThreshold ?? raw.thresholds?.red ?? raw.threshold ?? 0),
        greenThreshold: clampUnit(raw.greenThreshold ?? raw.thresholds?.green ?? raw.threshold ?? 0),
        blueThreshold: clampUnit(raw.blueThreshold ?? raw.thresholds?.blue ?? raw.threshold ?? 0)
    };
}

export function normalizeLevelColorExchange(raw) {
    const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    const normalized = normalizeColorExchange({
        ...source,
        enabled: true,
        fromColor: source.fromColor ?? source.from ?? DEFAULT_LEVEL_COLOR_EXCHANGE.fromColor,
        toColor: source.toColor ?? source.to ?? DEFAULT_LEVEL_COLOR_EXCHANGE.toColor,
        redThreshold: source.redThreshold ?? source.thresholds?.red ?? source.threshold ?? DEFAULT_LEVEL_COLOR_EXCHANGE.redThreshold,
        greenThreshold: source.greenThreshold ?? source.thresholds?.green ?? source.threshold ?? DEFAULT_LEVEL_COLOR_EXCHANGE.greenThreshold,
        blueThreshold: source.blueThreshold ?? source.thresholds?.blue ?? source.threshold ?? DEFAULT_LEVEL_COLOR_EXCHANGE.blueThreshold
    });
    return {
        enabled: Boolean(source.enabled),
        fromColor: normalized?.fromColor || [...DEFAULT_LEVEL_COLOR_EXCHANGE.fromColor],
        toColor: normalized?.toColor || [...DEFAULT_LEVEL_COLOR_EXCHANGE.toColor],
        redThreshold: normalized?.redThreshold ?? DEFAULT_LEVEL_COLOR_EXCHANGE.redThreshold,
        greenThreshold: normalized?.greenThreshold ?? DEFAULT_LEVEL_COLOR_EXCHANGE.greenThreshold,
        blueThreshold: normalized?.blueThreshold ?? DEFAULT_LEVEL_COLOR_EXCHANGE.blueThreshold
    };
}

export function isEffectiveLevelColorExchange(raw) {
    return normalizeLevelColorExchange(raw).enabled;
}

export function levelColorExchangeCacheKey(raw) {
    const value = normalizeLevelColorExchange(raw);
    return value.enabled ? `1:${colorExchangeCacheKey(value)}` : "0";
}

export function normalizeRgbColor(raw, fallback = [0, 0, 0]) {
    if (typeof raw === "string") {
        const match = raw.trim().match(/^#?([0-9a-f]{6})$/i);
        if (match) {
            return [
                Number.parseInt(match[1].slice(0, 2), 16),
                Number.parseInt(match[1].slice(2, 4), 16),
                Number.parseInt(match[1].slice(4, 6), 16)
            ];
        }
    }
    if (Array.isArray(raw) && raw.length >= 3) {
        return raw.slice(0, 3).map((value, index) => clampByte(value, fallback[index] ?? 0));
    }
    if (raw && typeof raw === "object") {
        return [
            clampByte(raw.r ?? raw.red, fallback[0] ?? 0),
            clampByte(raw.g ?? raw.green, fallback[1] ?? 0),
            clampByte(raw.b ?? raw.blue, fallback[2] ?? 0)
        ];
    }
    return fallback.slice(0, 3).map((value) => clampByte(value, 0));
}

export function rgbColorToHex(raw) {
    const color = normalizeRgbColor(raw);
    return `#${color.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

export function colorExchangeCacheKey(raw) {
    const value = normalizeColorExchange(raw);
    if (!value) {
        return "none";
    }
    return [
        value.fromColor.join(","),
        value.toColor.join(","),
        stableThreshold(value.redThreshold),
        stableThreshold(value.greenThreshold),
        stableThreshold(value.blueThreshold)
    ].join("|");
}

export function applyColorExchangeToRgbaBytes(data, raw) {
    const value = normalizeColorExchange(raw);
    if (!value || !data || typeof data.length !== "number") {
        return 0;
    }
    const from = value.fromColor;
    const to = value.toColor;
    const thresholds = [
        value.redThreshold * COLOR_CHANNEL_MAX,
        value.greenThreshold * COLOR_CHANNEL_MAX,
        value.blueThreshold * COLOR_CHANNEL_MAX
    ];
    const minimum = from.map((channel, index) => Math.max(0, channel - thresholds[index]) - FLOAT_EPSILON);
    const maximum = from.map((channel, index) => Math.min(COLOR_CHANNEL_MAX, channel + thresholds[index]) + FLOAT_EPSILON);
    const difference = to.map((channel, index) => channel - from[index]);
    let changed = 0;

    for (let index = 0; index + 3 < data.length; index += 4) {
        if (
            data[index] > minimum[0] && data[index] < maximum[0]
            && data[index + 1] > minimum[1] && data[index + 1] < maximum[1]
            && data[index + 2] > minimum[2] && data[index + 2] < maximum[2]
        ) {
            data[index] = clampByte(data[index] + difference[0], data[index]);
            data[index + 1] = clampByte(data[index + 1] + difference[1], data[index + 1]);
            data[index + 2] = clampByte(data[index + 2] + difference[2], data[index + 2]);
            changed += 1;
        }
        // Alpha is deliberately preserved exactly, matching GEGL/GIMP Color Exchange.
    }
    return changed;
}

function stableThreshold(value) {
    return Number(value).toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
}

function clampByte(value, fallback = 0) {
    const number = Number(value);
    const finite = Number.isFinite(number) ? number : Number(fallback) || 0;
    return Math.max(0, Math.min(COLOR_CHANNEL_MAX, Math.round(finite)));
}

function clampUnit(value) {
    const number = Number(value);
    return Math.max(0, Math.min(1, Number.isFinite(number) ? number : 0));
}
