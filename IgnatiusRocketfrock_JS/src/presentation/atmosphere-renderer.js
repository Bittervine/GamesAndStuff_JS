import {
    ATMOSPHERE_EFFECT_IDS,
    atmosphereEffectsActive,
    normalizeAtmosphereEffects
} from "../shared/level-layer-data.js";
import { resourceUrl } from "../shared/resource-paths.js";

export const AtmosphereTuning = Object.freeze({
    AURORA_SPEED: 0.42,
    AURORA_DANCE: 1.15,
    UPPER_CLOUD_SPEED: 0.28,
    LIGHTNING_SPLIT_CHANCE: 0.58,
    WEATHER_TURBULENCE: 0.90,
    SHARED_WIND: 0.25
});

const EVENT_SPECS = Object.freeze({
    aurora: Object.freeze({ base: 30 }),
    meteor: Object.freeze({ base: 7.5 }),
    lightning: Object.freeze({ base: 2.8 }),
    bats: Object.freeze({ base: 14 }),
    eyes: Object.freeze({ base: 4.8 })
});

const TAU = Math.PI * 2;
const STAR_MIN_RASTER_SIZE = 2.0;
const STAR_MIN_SOURCE_SIZE = 0.5;
const ATMOSPHERE_GROUND_Y = 0.57;
const SOFT_FIELD_BLOB_SCALE = 2.6;
const SOFT_FIELD_DENSITY_SCALE = 2.0;
const EYES_SIZE_SCALE = 0.5;

function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, finiteNumber(value, min)));
}

function clamp01(value) {
    return clamp(value, 0, 1);
}

function smoothstep(edge0, edge1, value) {
    if (Math.abs(edge1 - edge0) < 1e-9) return value >= edge1 ? 1 : 0;
    const t = clamp01((value - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
}

function fract(value) {
    return value - Math.floor(value);
}

function wrap01(value) {
    return fract(fract(value) + 1);
}

function wrapPixel(value, span) {
    const size = Math.max(1, finiteNumber(span, 1));
    return ((finiteNumber(value, 0) % size) + size) % size;
}

function wrapAtmospherePixel(value, span, margin = 0) {
    const safeSpan = Math.max(1, finiteNumber(span, 1));
    const safeMargin = Math.max(0, finiteNumber(margin, 0));
    return wrapPixel(finiteNumber(value, 0) + safeMargin, safeSpan + safeMargin * 2) - safeMargin;
}

function wrapHalf(value) {
    return fract(value + 0.5) - 0.5;
}

function auroraHash(value) {
    return fract(Math.sin(value) * 43758.5453);
}

function auroraNoise1(value) {
    const base = Math.floor(value);
    const fraction = fract(value);
    const smooth = fraction * fraction * (3 - 2 * fraction);
    return auroraHash(base) + (auroraHash(base + 1) - auroraHash(base)) * smooth;
}

function auroraF1(value) {
    return 0.57 * auroraNoise1(value)
        + 0.28 * auroraNoise1(value * 2.03 + 17)
        + 0.15 * auroraNoise1(value * 4.11 + 41);
}

function auroraDitherNoise(x, y) {
    return fract(52.9829189 * fract(x * 0.06711056 + y * 0.00583715));
}

function butterflyHash(value) {
    return fract(Math.sin(value * 91.345 + 17.13) * 47453.5453);
}

function pointScale1080(height) {
    return Math.min(2, Math.max(0.01, finiteNumber(height, 1080) / 1080));
}

function hashString(text) {
    let hash = 2166136261 >>> 0;
    for (const character of String(text || "")) {
        hash ^= character.charCodeAt(0);
        hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash >>> 0;
}

function mulberry32(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6D2B79F5) >>> 0;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
}

function makeSeeds(count, seed) {
    const random = mulberry32(seed);
    return Array.from({ length: count }, () => ({
        a: random(),
        b: random(),
        c: random(),
        d: random(),
        e: random(),
        f: random()
    }));
}

function createCanvas(width, height) {
    const ownerDocument = typeof document !== "undefined" ? document : null;
    if (!ownerDocument) return null;
    const canvas = ownerDocument.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

function createWhiteTextureCanvas() {
    const canvas = createCanvas(2, 2);
    const context = canvas?.getContext("2d");
    if (!context) return null;
    context.fillStyle = "#fff";
    context.fillRect(0, 0, 2, 2);
    return canvas;
}

function createGlowTextureCanvas() {
    const size = 64;
    const canvas = createCanvas(size, size);
    const context = canvas?.getContext("2d");
    if (!context) return null;
    const image = context.createImageData(size, size);
    const center = (size - 1) * 0.5;
    for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
            const dx = (x - center) / center;
            const dy = (y - center) / center;
            const radius = Math.hypot(dx, dy);
            const alpha = radius >= 1 ? 0 : Math.exp(-radius * radius * 3.35) * smoothstep(1, 0.72, radius);
            const offset = (y * size + x) * 4;
            image.data[offset] = 255;
            image.data[offset + 1] = 255;
            image.data[offset + 2] = 255;
            image.data[offset + 3] = Math.round(clamp01(alpha) * 255);
        }
    }
    context.putImageData(image, 0, 0);
    return canvas;
}

function createAuroraTextureCanvas() {
    const width = 256;
    const height = 256;
    const canvas = createCanvas(width, height);
    const context = canvas?.getContext("2d");
    if (!context) return null;
    const image = context.createImageData(width, height);
    const rowNoise = new Float64Array(width);
    for (let y = 0; y < height; y += 1) {
        const v = (y + 0.5) / height;
        const d = v - 0.12;
        const hanging = smoothstep(-0.014, 0.020, d) * Math.exp(-Math.max(d, 0) / 0.19);
        const topRibbon = Math.exp(-Math.abs(d) * 24);
        const bottomFade = 1 - smoothstep(0.82, 1.0, v);
        const baseAlpha = clamp01((hanging + 0.52 * topRibbon) * bottomFade);
        let rowMean = 0;
        for (let x = 0; x < width; x += 1) {
            rowNoise[x] = auroraDitherNoise(x, y);
            rowMean += rowNoise[x];
        }
        rowMean /= width;
        const ditherMask = smoothstep(0.012, 0.075, baseAlpha) * (1 - smoothstep(0.94, 1.0, baseAlpha));
        for (let x = 0; x < width; x += 1) {
            // Static zero-mean high-frequency dither breaks dark 8-bit contour bands
            // without changing the average aurora brightness or crawling over time.
            const dither = (rowNoise[x] - rowMean) * 0.055 * ditherMask;
            const alpha = clamp01(baseAlpha + dither);
            const offset = (y * width + x) * 4;
            image.data[offset] = 255;
            image.data[offset + 1] = 255;
            image.data[offset + 2] = 255;
            image.data[offset + 3] = Math.round(alpha * 255);
        }
    }
    context.putImageData(image, 0, 0);
    return canvas;
}

function createLeafTextureCanvas(petal = false) {
    const size = 32;
    const canvas = createCanvas(size, size);
    const context = canvas?.getContext("2d");
    if (!context) return null;
    context.translate(size * 0.5, size * 0.5);
    context.fillStyle = "#fff";
    context.beginPath();
    if (petal) {
        context.moveTo(0, -12);
        context.bezierCurveTo(10, -7, 9, 7, 0, 12);
        context.bezierCurveTo(-9, 7, -10, -7, 0, -12);
    } else {
        context.moveTo(0, -13);
        context.bezierCurveTo(11, -7, 9, 8, 0, 12);
        context.bezierCurveTo(-9, 8, -11, -7, 0, -13);
    }
    context.fill();
    if (!petal) {
        context.fillRect(-1, 8, 2, 7);
    }
    return canvas;
}

function createEyesTextureCanvas() {
    const width = 128;
    const height = 64;
    const canvas = createCanvas(width, height);
    const context = canvas?.getContext("2d");
    if (!context) return null;
    const image = context.createImageData(width, height);
    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const px = (x + 0.5) / width;
            const py = (y + 0.5) / height;
            let bestAlpha = 0;
            let bestHot = 0;
            for (const side of [-1, 1]) {
                const centerX = 0.5 + side * 0.151;
                const centerY = 0.5;
                const qx = (px - centerX) / 0.193;
                const qy = (py - centerY) / 0.386;
                const radius = Math.hypot(qx, qy);
                const disc = 1 - smoothstep(0.64, 1, radius);
                const mirroredX = qx * side;
                const lidY = -0.10 + 0.58 * mirroredX;
                const lidMask = 1 - smoothstep(lidY - 0.04, lidY + 0.04, qy);
                const pupil = 1 - smoothstep(0.37125, 0.482625, Math.hypot(qx, qy + 0.18));
                const alpha = disc * lidMask * (1 - pupil);
                if (alpha > bestAlpha) {
                    bestAlpha = alpha;
                    bestHot = 1 - smoothstep(0, 0.48, radius);
                }
            }
            const offset = (y * width + x) * 4;
            image.data[offset] = Math.round((0.78 + 0.22 * bestHot) * 255);
            image.data[offset + 1] = Math.round((0.10 * bestHot) * 255);
            image.data[offset + 2] = Math.round((0.02 * bestHot) * 255);
            image.data[offset + 3] = Math.round(clamp01(bestAlpha) * 255);
        }
    }
    context.putImageData(image, 0, 0);
    return canvas;
}

function color(r, g, b, a = 1) {
    return [clamp01(r), clamp01(g), clamp01(b), clamp01(a)];
}

function mixColor(a, b, t) {
    const amount = clamp01(t);
    return color(
        a[0] + (b[0] - a[0]) * amount,
        a[1] + (b[1] - a[1]) * amount,
        a[2] + (b[2] - a[2]) * amount,
        a[3] + (b[3] - a[3]) * amount
    );
}

export class AtmosphereState {
    constructor() {
        this.levelId = "";
        this.random = mulberry32(1);
        this.next = Object.fromEntries(Object.keys(EVENT_SPECS).map((id) => [id, Infinity]));
        this.auroraEvent = null;
        this.lightningEvent = null;
        this.sheetEvent = null;
        this.meteors = [];
        this.batEvents = [];
        this.eyesEvent = null;
        this.lastTime = 0;
        this.enabledLastFrame = false;
        this.parallaxOriginX = 0;
        this.parallaxOriginY = 0;
        this.groundWorldY = null;
    }

    clearEvents() {
        for (const id of Object.keys(this.next)) this.next[id] = Infinity;
        this.auroraEvent = null;
        this.lightningEvent = null;
        this.sheetEvent = null;
        this.meteors = [];
        this.batEvents = [];
        this.eyesEvent = null;
    }

    reset(levelId, time = 0, groundWorldY = null) {
        this.levelId = String(levelId || "");
        this.random = mulberry32((hashString(this.levelId) ^ 0xA7F05EED) >>> 0);
        this.clearEvents();
        this.lastTime = finiteNumber(time, 0);
        this.parallaxOriginX = 0;
        this.parallaxOriginY = 0;
        this.groundWorldY = groundWorldY != null && Number.isFinite(Number(groundWorldY)) ? Number(groundWorldY) : null;
    }
}

export class AtmosphereGpuRenderer {
    constructor() {
        this.state = new AtmosphereState();
        this.frameActive = false;
        this.effects = normalizeAtmosphereEffects(null);
        this.time = 0;
        this.view = { w: 1, h: 1, zoom: 1 };
        this.parallax = { x: 0, y: 0 };
        this.groundScreenY = null;
        this.whiteTexture = createWhiteTextureCanvas();
        this.glowTexture = createGlowTextureCanvas();
        this.auroraTexture = createAuroraTextureCanvas();
        this.leafTexture = createLeafTextureCanvas(false);
        this.petalTexture = createLeafTextureCanvas(true);
        this.eyesTexture = createEyesTextureCanvas();
        this.batImage = null;
        this.batReady = false;
        this.seeds = {
            stars: makeSeeds(1560, 0x51A20001),
            cloudShadow: makeSeeds(36, 0x51A20003),
            upperClouds: makeSeeds(384, 0x51A20004),
            lowerClouds: makeSeeds(448, 0x51A20005),
            groundFog: makeSeeds(448, 0x51A2000F),
            fireflies: makeSeeds(192, 0x51A20006),
            wisps: makeSeeds(48, 0x51A20007),
            spores: makeSeeds(180, 0x51A20008),
            rain: makeSeeds(900, 0x51A20009),
            snow: makeSeeds(430, 0x51A2000A),
            leaves: makeSeeds(140, 0x51A2000B),
            petals: makeSeeds(180, 0x51A2000C),
            butterflies: makeSeeds(96, 0x51A2000D),
            embers: makeSeeds(192, 0x51A2000E)
        };
    }

    beginFrame(gameState, view, backgroundOffset) {
        const effects = normalizeAtmosphereEffects(gameState?.world?.layerVisuals?.background?.effects);
        const enabled = gameState?.settings?.renderingQuality === "high" && atmosphereEffectsActive(effects);
        this.frameActive = enabled;
        if (!enabled) {
            if (this.state.enabledLastFrame) this.state.clearEvents();
            this.state.enabledLastFrame = false;
            return false;
        }
        if (effects.bats > 0) this.ensureBatImage();

        const time = Math.max(0, finiteNumber(gameState?.clock?.time, 0));
        const levelId = String(gameState?.world?.levelId || "");
        const zoom = Math.max(0.0001, finiteNumber(view?.zoom, 1));
        // Background parallax offsets are absolute world-anchor corrections.
        // Atmosphere has no authored world anchor, so using that absolute offset
        // directly can translate procedural effects thousands of pixels off-screen.
        // Track the transformed background-space origin instead, then subtract the
        // origin captured when this level/effect session begins.  The remaining
        // delta has the same movement rate as the authored background parallax.
        const backgroundOrigin = {
            x: -(finiteNumber(view?.x, 0) + finiteNumber(backgroundOffset?.x, 0)) * zoom,
            y: -(finiteNumber(view?.y, 0) + finiteNumber(backgroundOffset?.y, 0)) * zoom
        };
        const resetLevel = this.state.levelId !== levelId || time + 0.001 < this.state.lastTime;
        if (resetLevel) {
            const initialFeetY = Number.isFinite(Number(gameState?.player?.spawnY))
                ? Number(gameState.player.spawnY)
                : finiteNumber(gameState?.player?.currentTransform?.y, NaN);
            this.state.reset(levelId, time, initialFeetY);
        }
        if (resetLevel || !this.state.enabledLastFrame) {
            for (const id of Object.keys(this.state.next)) this.state.next[id] = Infinity;
            this.state.parallaxOriginX = backgroundOrigin.x;
            this.state.parallaxOriginY = backgroundOrigin.y;
        }
        this.state.enabledLastFrame = true;
        this.state.lastTime = time;
        this.effects = effects;
        this.time = time;
        this.view = view || { w: 1, h: 1, zoom: 1 };
        this.parallax = {
            x: backgroundOrigin.x - finiteNumber(this.state.parallaxOriginX, backgroundOrigin.x),
            y: backgroundOrigin.y - finiteNumber(this.state.parallaxOriginY, backgroundOrigin.y)
        };
        // Ground-referenced fields live in a stable world band anchored to the
        // wizard's initial feet position. Camera Y changes only pan that existing
        // band; the wizard's current Y and Background parallax never reseed it.
        this.groundScreenY = this.state.groundWorldY != null && Number.isFinite(Number(this.state.groundWorldY))
            ? (Number(this.state.groundWorldY) - finiteNumber(view?.y, 0)) * zoom
            : ATMOSPHERE_GROUND_Y * Math.max(1, finiteNumber(view?.h, 1));
        this.updateAtmosphereState();
        return true;
    }

    ensureBatImage() {
        if (this.batImage || typeof Image === "undefined") return;
        this.batImage = new Image();
        this.batImage.onload = () => { this.batReady = true; };
        this.batImage.onerror = () => { this.batReady = false; };
        this.batImage.src = resourceUrl("ui/atmosphere_bat_silhouette.png");
    }

    randomRange(min, max) {
        return min + (max - min) * this.state.random();
    }

    scheduleEventTimes() {
        for (const [id, spec] of Object.entries(EVENT_SPECS)) {
            const intensity = this.effects[id] || 0;
            if (intensity <= 0) {
                this.state.next[id] = Infinity;
                continue;
            }
            if (Number.isFinite(this.state.next[id])) continue;
            if (id === "aurora") {
                this.state.next[id] = this.time + this.randomRange(24, 42) / Math.max(0.05, intensity);
            } else if (id === "meteor") {
                this.state.next[id] = this.time + this.randomRange(2.8, 5.2) / Math.max(0.05, intensity);
            } else {
                const mean = spec.base / Math.max(0.05, intensity);
                this.state.next[id] = this.time + mean * this.randomRange(0.58, 1.42);
            }
        }
    }

    updateAtmosphereState() {
        this.pruneEvents();
        this.scheduleEventTimes();
        for (const id of Object.keys(EVENT_SPECS)) {
            if ((this.effects[id] || 0) <= 0 || this.time < this.state.next[id]) continue;
            if (id === "aurora") this.spawnAurora();
            else if (id === "meteor") this.spawnMeteor(this.state.random() < 0.45);
            else if (id === "lightning") this.spawnLightning();
            else if (id === "bats") this.spawnBatFlock();
            else if (id === "eyes") this.spawnEyes();
            this.state.next[id] = Infinity;
        }
        this.scheduleEventTimes();
    }

    pruneEvents() {
        if ((this.effects.aurora || 0) <= 0) this.state.auroraEvent = null;
        if ((this.effects.lightning || 0) <= 0) {
            this.state.lightningEvent = null;
            this.state.sheetEvent = null;
        }
        if ((this.effects.meteor || 0) <= 0) this.state.meteors = [];
        if ((this.effects.bats || 0) <= 0) this.state.batEvents = [];
        if ((this.effects.eyes || 0) <= 0) this.state.eyesEvent = null;
        if (this.state.auroraEvent && this.time >= this.state.auroraEvent.start + this.state.auroraEvent.life) this.state.auroraEvent = null;
        if (this.state.lightningEvent && this.time >= this.state.lightningEvent.start + this.state.lightningEvent.life) this.state.lightningEvent = null;
        if (this.state.sheetEvent && this.time >= this.state.sheetEvent.start + this.state.sheetEvent.life) this.state.sheetEvent = null;
        for (let index = this.state.meteors.length - 1; index >= 0; index -= 1) {
            const event = this.state.meteors[index];
            if (this.time >= event.start + event.life) this.state.meteors.splice(index, 1);
        }
        for (let index = this.state.batEvents.length - 1; index >= 0; index -= 1) {
            const event = this.state.batEvents[index];
            if (this.time >= event.start + event.life) this.state.batEvents.splice(index, 1);
        }
        if (this.state.eyesEvent && this.time >= this.state.eyesEvent.start + this.state.eyesEvent.life) this.state.eyesEvent = null;
    }

    spawnAurora() {
        const intensity = Math.max(0.01, this.effects.aurora || 0);
        const width = Math.min(0.76, 0.30 + 0.17 * Math.min(2, intensity) + this.state.random() * 0.08);
        const margin = width * 0.48;
        this.state.auroraEvent = {
            start: this.time,
            life: this.randomRange(18, 24),
            center: margin + this.state.random() * Math.max(0.02, 1 - margin * 2),
            width
        };
    }

    spawnMeteor(shower = false) {
        const width = Math.max(1, this.view.w);
        const height = Math.max(1, this.view.h);
        const radiantX = width * this.randomRange(0.35, 0.65);
        const radiantY = -height * this.randomRange(0.15, 0.37);
        const count = shower ? 2 + Math.floor(this.state.random() * 4) : 1;
        for (let index = 0; index < count; index += 1) {
            const sx = width * this.randomRange(0.05, 0.95);
            const sy = height * this.randomRange(0.05, 0.35);
            let dx = sx - radiantX;
            let dy = sy - radiantY;
            const length = Math.hypot(dx, dy) || 1;
            dx /= length;
            dy /= length;
            const travel = width * this.randomRange(0.10, 0.30);
            this.state.meteors.push({
                start: this.time + index * this.randomRange(0.12, 0.46),
                life: this.randomRange(0.65, 1.03),
                x0: sx / width,
                y0: sy / height,
                x1: (sx + dx * travel) / width,
                y1: (sy + dy * travel) / height,
                trail: this.randomRange(0.28, 0.46),
                parallaxX: this.parallax.x,
                parallaxY: this.parallax.y
            });
        }
    }

    spawnLightning() {
        const width = Math.max(1, this.view.w);
        const height = Math.max(1, this.view.h);
        const rx = width * this.randomRange(0.26, 0.41);
        const ry = Math.min(height * 0.22, height * this.randomRange(0.15, 0.26));
        const cx = clamp(width * this.randomRange(0.19, 0.81), rx, width - rx);
        const cy = clamp(height * this.randomRange(0.13, 0.31), height * 0.025 + ry, height * 0.50 - ry);
        const inside = (x, y) => (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2) <= 1;
        const scale = clamp(height / 720, 0.78, 1.65);
        const seedLength = this.randomRange(22, 42) * scale * this.randomRange(0.72, 0.90);
        const sx = cx + this.randomRange(-0.5, 0.5) * rx * 0.18;
        const sy = cy + this.randomRange(-0.5, 0.5) * ry * 0.18;
        const seedAngle = this.state.random() < 0.5 ? 0 : Math.PI;
        const left = { x: sx - Math.cos(seedAngle) * seedLength * 0.5, y: sy - Math.sin(seedAngle) * seedLength * 0.5 };
        const right = { x: sx + Math.cos(seedAngle) * seedLength * 0.5, y: sy + Math.sin(seedAngle) * seedLength * 0.5 };
        const toNormalized = (point) => ({ x: point.x / width, y: point.y / height });
        const segments = [{ a: toNormalized(left), b: toNormalized(right), energy: 1, generation: 0 }];
        let tips = [
            { ...left, angle: seedAngle + Math.PI, energy: 1 },
            { ...right, angle: seedAngle, energy: 1 }
        ];
        for (let generation = 1; generation <= 5 && tips.length && segments.length < 72; generation += 1) {
            const next = [];
            for (const tip of tips) {
                const childCount = this.state.random() < AtmosphereTuning.LIGHTNING_SPLIT_CHANCE ? 2 : 1;
                const forkSide = this.state.random() < 0.5 ? -1 : 1;
                for (let child = 0; child < childCount && segments.length < 72; child += 1) {
                    const side = childCount === 2 ? (child === 0 ? forkSide : -forkSide) : 0;
                    const allowUpward = this.state.random() < 0.18;
                    let angle = NaN;
                    for (let retry = 0; retry < 8; retry += 1) {
                        const turnDeg = childCount === 2
                            ? side * this.randomRange(18, 70)
                            : this.randomRange(-70, 70);
                        const candidate = tip.angle + turnDeg * Math.PI / 180;
                        if (allowUpward || Math.sin(candidate) >= 0) {
                            angle = candidate;
                            break;
                        }
                    }
                    if (!Number.isFinite(angle)) {
                        const shallow = this.randomRange(8, 38) * Math.PI / 180;
                        angle = Math.cos(tip.angle) < 0 ? Math.PI - shallow : shallow;
                    }
                    const length = this.randomRange(22, 42) * scale * Math.pow(0.90, generation);
                    const endpoint = { x: tip.x + Math.cos(angle) * length, y: tip.y + Math.sin(angle) * length };
                    if (!inside(endpoint.x, endpoint.y)) continue;
                    const energy = Math.max(0.22, tip.energy * this.randomRange(0.86, 0.895));
                    segments.push({ a: toNormalized(tip), b: toNormalized(endpoint), energy, generation });
                    next.push({ ...endpoint, angle, energy });
                }
            }
            tips = next;
        }
        this.state.lightningEvent = {
            start: this.time,
            life: 0.850,
            segments,
            parallaxX: this.parallax.x,
            parallaxY: this.parallax.y
        };
        this.state.sheetEvent = { start: this.time, life: 0.850 };
    }

    spawnBatFlock() {
        this.state.batEvents.push({
            start: this.time,
            life: this.randomRange(6.5, 9.1),
            seed: this.randomRange(0, 100),
            count: 5 + Math.floor(this.state.random() * 8),
            direction: this.state.random() < 0.5 ? -1 : 1,
            parallaxX: this.parallax.x,
            parallaxY: this.parallax.y
        });
    }

    spawnEyes() {
        this.state.eyesEvent = {
            start: this.time,
            life: 4.2,
            x: this.randomRange(0.18, 0.82),
            y: this.randomRange(0.55, 0.85),
            parallaxX: this.parallax.x,
            parallaxY: this.parallax.y
        };
    }

    queueSprite(backend, source, x, y, width, height, tint = color(1, 1, 1), alpha = 1, rotation = 0, blendMode = "alpha", sourceRect = null) {
        if (!source || alpha <= 0 || width <= 0 || height <= 0) return false;
        return backend.queueSprite({
            source,
            sourceX: sourceRect?.x || 0,
            sourceY: sourceRect?.y || 0,
            sourceWidth: sourceRect?.w ?? source.width,
            sourceHeight: sourceRect?.h ?? source.height,
            centerX: x,
            centerY: y,
            width,
            height,
            rotation,
            alpha: clamp01(alpha),
            tint,
            blendMode
        });
    }

    drawLine(backend, x0, y0, x1, y1, width, tint, alpha = 1, blendMode = "alpha") {
        const dx = x1 - x0;
        const dy = y1 - y0;
        const length = Math.hypot(dx, dy);
        if (length < 0.001) return false;
        return this.queueSprite(
            backend,
            this.whiteTexture,
            (x0 + x1) * 0.5,
            (y0 + y1) * 0.5,
            length,
            Math.max(0.5, width),
            tint,
            alpha,
            Math.atan2(dy, dx),
            blendMode
        );
    }

    queueWrappedHorizontalSprite(backend, source, x, y, width, height, tint = color(1, 1, 1), alpha = 1, rotation = 0, blendMode = "alpha", sourceRect = null, edgeMargin = 0) {
        const span = Math.max(1, this.view.w);
        const wrappedX = wrapPixel(x, span);
        const halfWidth = Math.max(0, width) * 0.5;
        const halfHeight = Math.max(0, height) * 0.5;
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const horizontalReach = Math.abs(cos) * halfWidth + Math.abs(sin) * halfHeight + Math.max(0, edgeMargin);
        let drew = this.queueSprite(backend, source, wrappedX, y, width, height, tint, alpha, rotation, blendMode, sourceRect);
        if (wrappedX - horizontalReach < 0) {
            drew = this.queueSprite(backend, source, wrappedX + span, y, width, height, tint, alpha, rotation, blendMode, sourceRect) || drew;
        }
        if (wrappedX + horizontalReach > span) {
            drew = this.queueSprite(backend, source, wrappedX - span, y, width, height, tint, alpha, rotation, blendMode, sourceRect) || drew;
        }
        return drew;
    }


    queueGradientQuad(backend, source, topLeft, topRight, bottomRight, bottomLeft, topLeftColor, topRightColor, bottomRightColor, bottomLeftColor, blendMode = "alpha", u0 = 0, u1 = 1, wrapMode = "clamp") {
        if (!backend?.queueGradientQuad || !source) return false;
        return backend.queueGradientQuad({
            source,
            topLeft,
            topRight,
            bottomRight,
            bottomLeft,
            topLeftColor,
            topRightColor,
            bottomRightColor,
            bottomLeftColor,
            blendMode,
            u0,
            u1,
            wrapMode
        });
    }

    screenPoint(x, y) {
        return {
            x: x * this.view.w + this.parallax.x,
            y: y * this.view.h + this.parallax.y
        };
    }

    periodicScreenPoint(x, y, marginX = 0, marginY = 0) {
        return {
            x: wrapAtmospherePixel(x * this.view.w + this.parallax.x, this.view.w, marginX),
            y: wrapAtmospherePixel(y * this.view.h + this.parallax.y, this.view.h, marginY)
        };
    }

    eventScreenPoint(event, x, y) {
        return {
            x: x * this.view.w + this.parallax.x - finiteNumber(event?.parallaxX, this.parallax.x),
            y: y * this.view.h + this.parallax.y - finiteNumber(event?.parallaxY, this.parallax.y)
        };
    }

    renderBehindBackground(backend) {
        if (!this.frameActive) return false;
        let drew = false;
        if (this.effects.stars > 0) drew = this.drawStars(backend) || drew;
        if (this.effects.aurora > 0) drew = this.drawAurora(backend) || drew;
        if (this.effects.meteor > 0) drew = this.drawMeteors(backend) || drew;
        if (this.effects.lightning > 0) drew = this.drawLightning(backend) || drew;
        return drew;
    }

    renderFrontOfBackground(backend) {
        if (!this.frameActive) return false;
        let drew = false;
        if (this.effects.cloudShadow > 0 || this.effects.upperClouds > 0 || this.effects.lowerClouds > 0) drew = this.drawSoftFields(backend, false) || drew;
        // Bat silhouettes deliberately sit in front of the authored background.
        if (this.effects.bats > 0) drew = this.drawBats(backend) || drew;
        if (this.effects.fireflies > 0) drew = this.drawFireflies(backend) || drew;
        if (this.effects.wisps > 0) drew = this.drawWisps(backend) || drew;
        if (this.effects.spores > 0) drew = this.drawSpores(backend) || drew;
        if (this.effects.rain > 0) drew = this.drawRain(backend) || drew;
        if (this.effects.snow > 0) drew = this.drawSnow(backend) || drew;
        if (this.effects.leaves > 0) drew = this.drawLeaves(backend, false) || drew;
        if (this.effects.petals > 0) drew = this.drawLeaves(backend, true) || drew;
        if (this.effects.butterflies > 0) drew = this.drawButterflies(backend) || drew;
        if (this.effects.embers > 0) drew = this.drawEmbers(backend) || drew;
        if (this.effects.eyes > 0) drew = this.drawEyes(backend) || drew;
        return drew;
    }

    renderFrontOfTerrain(backend) {
        if (!this.frameActive || this.effects.groundFog <= 0) return false;
        return this.drawSoftFields(backend, true);
    }

    applyHeatShimmerIfNeeded(backend) {
        const intensity = this.frameActive ? this.effects.heat || 0 : 0;
        if (intensity <= 0 || typeof backend.captureFramebufferTexture !== "function") return false;
        const source = backend.captureFramebufferTexture("atmosphere-heat", this.view.w, this.view.h);
        if (!source) return false;
        const stripHeight = Math.max(10, Math.round(this.view.h / 54));
        for (let top = 0; top < this.view.h; top += stripHeight) {
            const height = Math.min(stripHeight + 1, this.view.h - top);
            const yNorm = (top + height * 0.5) / this.view.h;
            const offset = AtmosphereGpuRenderer.heatOffsetPx(yNorm, this.time, intensity, this.view.w);
            backend.queueSprite({
                source,
                sourceX: offset,
                sourceY: top,
                sourceWidth: this.view.w,
                sourceHeight: height,
                centerX: this.view.w * 0.5,
                centerY: top + height * 0.5,
                width: this.view.w,
                height,
                alpha: 1,
                dynamic: false,
                blendMode: "alpha"
            });
        }
        return true;
    }

    static heatOffsetPx(yNorm, timeSeconds, intensity, widthPx) {
        const bottomY = 1 - clamp(yNorm, 0, 1);
        const mask = 1 - smoothstep(0.38, 0.82, bottomY);
        const wave = Math.sin(bottomY * 82 - timeSeconds * 4.7)
            + 0.62 * Math.sin(bottomY * 137 + timeSeconds * 3.3 + 4.75);
        return wave * 0.0072 * Math.max(1, widthPx) * clamp(intensity, 0, 2) * mask;
    }

    drawStars(backend) {
        const intensity = this.effects.stars || 0;
        if (intensity <= 0) return false;
        const count = Math.min(this.seeds.stars.length, Math.round(780 * intensity));
        const scale = pointScale1080(this.view.h);
        for (let index = 0; index < count; index += 1) {
            const seed = this.seeds.stars[index];
            const point = this.periodicScreenPoint(seed.a, seed.b);
            const sourceSize = (1.15 + 5.4 * Math.pow(seed.c, 5)) * scale;
            if (sourceSize < STAR_MIN_SOURCE_SIZE) continue;
            const rasterSize = Math.max(STAR_MIN_RASTER_SIZE, sourceSize);
            const coverage = Math.min(1, (sourceSize * sourceSize) / (rasterSize * rasterSize));
            const twinkle = (0.5 + 0.5 * Math.sin(this.time * (0.45 + 2.4 * seed.d) + seed.a * 31)) * 0.72
                + 0.28 * Math.sin(this.time * (0.81 + 1.7 * seed.c) + seed.b * 47);
            const alpha = clamp01(1.35 * (0.35 + 0.65 * twinkle)) * coverage;
            const tint = mixColor(color(0.68, 0.78, 1), color(1, 1, 1), seed.d);
            this.queueSprite(backend, this.glowTexture, point.x, point.y, rasterSize, rasterSize, tint, alpha, 0, "additive");
            if (seed.a > 0.86 && this.whiteTexture) {
                this.drawLine(backend, point.x, point.y - rasterSize * 0.40, point.x, point.y + rasterSize * 0.40,
                    Math.max(0.35, rasterSize * 0.075), tint, alpha * 0.55, "additive");
            }
        }
        return count > 0;
    }

    drawAurora(backend) {
        const intensity = this.effects.aurora || 0;
        if (intensity <= 0 || !this.auroraTexture || !backend?.queueGradientQuad) return false;
        let eventAlpha = 0;
        let eventCenter = 0.5;
        let eventWidth = 0.5;
        const event = this.state.auroraEvent;
        if (event) {
            const age = this.time - event.start;
            const fadeIn = Math.min(1, age / 8);
            const fadeOut = Math.min(1, (event.life - age) / 8);
            eventAlpha = clamp01(Math.min(fadeIn, fadeOut));
            eventCenter = event.center;
            eventWidth = event.width;
        }
        const colors = [color(0.10, 1.00, 0.50), color(0.06, 0.88, 0.72), color(0.08, 0.66, 1.00), color(0.52, 0.20, 0.88)];
        const baseStrength = 0.09 * intensity;
        const t = this.time * AtmosphereTuning.AURORA_SPEED;
        const parallaxNorm = this.parallax.x / Math.max(1, this.view.w);
        const wrappedParallaxY = wrapPixel(this.parallax.y, Math.max(1, this.view.h));
        const segmentWidth = Math.max(4, Math.round(this.view.w / 240));
        const edgeMargin = Math.max(64, Math.round(segmentWidth * 10));
        const columns = Math.ceil((this.view.w + edgeMargin * 2) / segmentWidth) + 1;
        const sampleAuroraColumn = (sampleXNorm, layer) => {
            const x = sampleXNorm + parallaxNorm;
            const head = wrap01(0.08 + t * (0.022 + 0.003 * layer) + layer * 0.19);
            const dx = wrapHalf(x - head);
            const envelope = Math.exp(-(dx * dx) / (0.0085 + layer * 0.0014));
            const curlPhase = dx * (15 + layer * 1.2) + Math.sin(t * 0.17 + layer * 1.3) * 1.15;
            const sideways = envelope * (0.052 * Math.cos(curlPhase) + 0.018 * Math.cos(curlPhase * 2.1 + 1.4));
            const lift = envelope * (0.070 * Math.sin(curlPhase) + 0.022 * Math.sin(curlPhase * 2.0 - 0.8));
            const head2 = wrap01(0.69 - t * (0.010 + 0.0015 * layer) + layer * 0.11);
            const dx2 = wrapHalf(x - head2);
            const envelope2 = Math.exp(-(dx2 * dx2) / 0.020);
            const xw = x + sideways + envelope2 * 0.018 * Math.sin(dx2 * 11 + t * 0.15 + layer);
            const swayA = Math.sin(xw * (4 + layer * 0.42) + Math.sin(t * 0.23 + layer) * 1.25) * (0.034 + layer * 0.004);
            const swayB = Math.sin(xw * (9 + layer * 0.76) - Math.sin(t * 0.17 + layer * 1.7) * 1.05) * 0.014;
            const slowNoise = (auroraF1(xw * 3.1 + Math.sin(t * 0.11 + layer) * 0.55 + layer * 8) - 0.5) * 0.045 * AtmosphereTuning.AURORA_DANCE;
            const curve = 0.095 + layer * 0.050 + swayA + swayB + slowNoise + lift + envelope2 * 0.020 * Math.sin(dx2 * 12 - t * 0.21 + layer);
            let warpedX = xw + 0.026 * Math.sin(xw * 6.2 + Math.sin(t * 0.31 + layer) * 1.1) + 0.012 * Math.sin(xw * 13.7 + Math.sin(t * 0.19 + layer * 2.1));
            warpedX += (auroraF1(xw * 7.5 + Math.sin(t * 0.13) * 0.8 + layer * 12) - 0.5) * 0.050;
            const rayPhase = warpedX * (205 + layer * 27) + 1.8 * Math.sin(t * 0.72 + xw * (6 + layer * 0.5) + layer) + 1.15 * Math.sin(t * 0.41 - xw * 10.5 + layer * 2);
            const fine = 0.5 + 0.5 * Math.sin(rayPhase);
            const rays = 0.76 + 0.24 * Math.pow(fine, 1.55);
            const lengthNoise = 0.5 + 0.5 * Math.sin(warpedX * (15 + layer * 1.4) + Math.sin(t * 0.25 + xw * 4.0) * 1.8 + layer * 1.3);
            const depth = 0.080 + 0.145 * lengthNoise;
            const broadFold = 0.75 + 0.25 * (0.5 + 0.5 * Math.sin(xw * (11.0 + layer * 1.5) + Math.sin(t * 0.28 + xw * 3.4) * 2.1 + layer * 1.4));
            const pulse = 0.88 + 0.12 * Math.sin(t * 0.47 + xw * 5.0 + layer * 1.8);
            const verticalFade = 1 - smoothstep(0.54, 0.92, curve + depth * 0.5);
            const localDistance = Math.abs(x - eventCenter);
            const localMask0 = 1 - smoothstep(eventWidth * 0.18, eventWidth * 1.32, localDistance);
            const localMask = localMask0 * localMask0 * (3 - 2 * localMask0);
            const strength = baseStrength * (1 + 1.5 * eventAlpha * localMask);
            const alpha = clamp01(strength * (0.56 + 0.44 * rays) * broadFold * pulse * verticalFade * 0.86);
            const topPad = 0.026 + 0.010 * (0.5 + 0.5 * rays);
            const tailLength = 0.030 + depth * 2.55;
            return {
                x: sampleXNorm * this.view.w,
                topY: (curve - topPad) * this.view.h + wrappedParallaxY,
                bottomY: (curve + tailLength) * this.view.h + wrappedParallaxY,
                alpha
            };
        };

        let drew = false;
        for (let layer = 0; layer < 4; layer += 1) {
            const tint = colors[layer];
            let previous = sampleAuroraColumn((-edgeMargin) / this.view.w, layer);
            for (let index = 1; index < columns; index += 1) {
                const screenX = -edgeMargin + index * segmentWidth;
                const current = sampleAuroraColumn(screenX / this.view.w, layer);
                const leftColor = [tint[0], tint[1], tint[2], previous.alpha];
                const rightColor = [tint[0], tint[1], tint[2], current.alpha];
                for (const verticalOffset of [-this.view.h, 0, this.view.h]) {
                    const top = Math.min(previous.topY, current.topY) + verticalOffset;
                    const bottom = Math.max(previous.bottomY, current.bottomY) + verticalOffset;
                    if (bottom < 0 || top > this.view.h) continue;
                    drew = this.queueGradientQuad(
                        backend,
                        this.auroraTexture,
                        { x: previous.x, y: previous.topY + verticalOffset },
                        { x: current.x, y: current.topY + verticalOffset },
                        { x: current.x, y: current.bottomY + verticalOffset },
                        { x: previous.x, y: previous.bottomY + verticalOffset },
                        leftColor,
                        rightColor,
                        rightColor,
                        leftColor,
                        "additive",
                        previous.x / 256 + layer * 0.173,
                        current.x / 256 + layer * 0.173,
                        "repeat"
                    ) || drew;
                }
                previous = current;
            }
        }
        return drew;
    }

    drawMeteors(backend) {
        if ((this.effects.meteor || 0) <= 0 || this.state.meteors.length === 0) return false;
        const scale = pointScale1080(this.view.h);
        const passes = [[9, color(0.08, 0.24, 1), 0.09], [4.2, color(0.34, 0.67, 1), 0.28], [1.5, color(0.96, 0.98, 1), 0.88]];
        for (const meteor of this.state.meteors) {
            const age = this.time - meteor.start;
            if (age < 0 || age >= meteor.life) continue;
            const progress = age / meteor.life;
            const lifeFade = 1 - Math.max(0, progress - 0.84) / 0.16;
            const tailLength = meteor.trail * 0.5;
            const tailProgress = Math.max(0, progress - tailLength);
            const segments = 12;
            let previousProgress = tailProgress;
            for (let segment = 1; segment <= segments; segment += 1) {
                const u = segment / segments;
                const nextProgress = tailProgress + (progress - tailProgress) * u;
                const previous = this.eventScreenPoint(meteor, meteor.x0 + (meteor.x1 - meteor.x0) * previousProgress, meteor.y0 + (meteor.y1 - meteor.y0) * previousProgress);
                const next = this.eventScreenPoint(meteor, meteor.x0 + (meteor.x1 - meteor.x0) * nextProgress, meteor.y0 + (meteor.y1 - meteor.y0) * nextProgress);
                const e0 = lifeFade * (0.08 + 0.82 * Math.pow((segment - 1) / segments, 1.65));
                const e1 = lifeFade * (0.08 + 0.92 * Math.pow(u, 1.65));
                const energy = Math.max(0.001, (e0 + e1) * 0.5);
                for (const [width, tint, alpha] of passes) {
                    this.drawLine(backend, previous.x, previous.y, next.x, next.y, width * scale * energy, tint, alpha * (0.35 + 0.65 * energy), "additive");
                }
                previousProgress = nextProgress;
            }
            const head = this.eventScreenPoint(meteor, meteor.x0 + (meteor.x1 - meteor.x0) * progress, meteor.y0 + (meteor.y1 - meteor.y0) * progress);
            this.queueSprite(backend, this.glowTexture, head.x, head.y, 5 * scale, 5 * scale, color(0.94, 0.97, 1), lifeFade, 0, "additive");
        }
        return true;
    }

    drawLightning(backend) {
        const intensity = this.effects.lightning || 0;
        if (intensity <= 0) return false;
        let drew = false;
        const event = this.state.lightningEvent;
        if (event) {
            const age = this.time - event.start;
            if (age >= 0 && age < event.life) {
                const revealGeneration = Math.min(5, Math.floor(age / 0.018));
                const pulse = age < 0.135 ? 1 : Math.max(0, 1 - (age - 0.135) / 0.105);
                const amount = Math.max(0.35, intensity) * pulse;
                const scale = Math.max(0.7, this.view.h / 1080);
                for (const segment of event.segments) {
                    if (segment.generation > revealGeneration) continue;
                    const a = this.eventScreenPoint(event, segment.a.x, segment.a.y);
                    const b = this.eventScreenPoint(event, segment.b.x, segment.b.y);
                    const energy = segment.energy;
                    const energyAlpha = 0.35 + 0.65 * energy;
                    this.drawLine(backend, a.x, a.y, b.x, b.y, 9 * scale * energy, color(0.05, 0.20, 1), 0.10 * amount * energyAlpha, "additive");
                    this.drawLine(backend, a.x, a.y, b.x, b.y, 3.8 * scale * energy, color(0.20, 0.64, 1), 0.34 * amount * energyAlpha, "additive");
                    this.drawLine(backend, a.x, a.y, b.x, b.y, 1.1 * scale * energy, color(0.95, 0.98, 1), 0.96 * amount * energyAlpha, "additive");
                }
                drew = true;
            }
        }
        const sheet = this.state.sheetEvent;
        if (sheet) {
            const age = this.time - sheet.start;
            if (age >= 0 && age < sheet.life) {
                const pulse = age < 0.09 ? 1 : age < 0.15 ? 0.10 : age < 0.26 ? 0.72 : Math.max(0, 1 - (age - 0.26) / 0.59);
                backend.queueSprite({
                    source: this.whiteTexture,
                    centerX: this.view.w * 0.5,
                    centerY: this.view.h * 0.5,
                    width: this.view.w,
                    height: this.view.h,
                    tint: color(0.58, 0.74, 1),
                    alpha: clamp01(pulse * Math.max(0.5, intensity) * 0.24),
                    blendMode: "additive"
                });
                drew = true;
            }
        }
        return drew;
    }

    drawBats(backend) {
        if ((this.effects.bats || 0) <= 0 || !this.batReady || !this.batImage || this.state.batEvents.length === 0) return false;
        const scale = Math.max(0.01, this.view.h / 1080);
        for (const event of this.state.batEvents) {
            const progress = (this.time - event.start) / event.life;
            if (progress < 0 || progress > 1) continue;
            for (let index = 0; index < event.count; index += 1) {
                const seed = fract(Math.sin((index + 1) * 91.345 + event.seed * 17) * 47453.5453);
                const seed2 = fract(Math.sin((index + 2) * 91.345 + event.seed * 17) * 47453.5453);
                const direction = event.direction;
                const cx = direction > 0 ? (-0.08 + progress * 1.16) : (1.08 - progress * 1.16);
                const cy = 0.13 + 0.32 * fract(event.seed * 0.37) + Math.sin(progress * Math.PI) * 0.035;
                const x = (cx + (seed - 0.5) * 0.18 + Math.sin(this.time * 0.55 + index) * 0.010) * this.view.w
                    + this.parallax.x - finiteNumber(event.parallaxX, this.parallax.x);
                const y = (cy + (seed2 - 0.5) * 0.11 + Math.sin(this.time * 1.15 + index * 2) * 0.015) * this.view.h
                    + this.parallax.y - finiteNumber(event.parallaxY, this.parallax.y);
                const frame = Math.floor(this.time * 20 + index * 2.7) % 22;
                const sourceRect = { x: (frame % 11) * 38, y: Math.floor(frame / 11) * 30, w: 38, h: 30 };
                this.queueSprite(backend, this.batImage, x, y, 37.5 * scale, 30 * scale, color(0, 0, 0), 1, 0, "alpha", sourceRect);
            }
        }
        return true;
    }

    drawSoftFields(backend, terrainFront = false) {
        if (!this.glowTexture) return false;
        let drew = false;
        const drawField = (id, seeds) => {
            const cloudShadow = id === "cloudShadow";
            const upper = id === "upperClouds";
            const authoredCount = cloudShadow ? 18 : (upper ? 96 : 112);
            const densityScale = cloudShadow ? 1 : SOFT_FIELD_DENSITY_SCALE;
            const intensity = this.effects[id] || 0;
            const count = Math.min(seeds.length, Math.round(authoredCount * densityScale * intensity));
            const speed = upper ? AtmosphereTuning.UPPER_CLOUD_SPEED : 0.42;
            for (let index = 0; index < count; index += 1) {
                const seed = seeds[index];
                if (cloudShadow) {
                    const travel = 78 + 55 * seed.a;
                    const life = travel + 24;
                    const seconds = (this.time + seed.b * life * 4) % life;
                    const direction = seed.c < 0.5 ? -1 : 1;
                    const rx = (0.095 + seed.c * 0.125) * this.view.w;
                    const ry = (0.045 + seed.d * 0.080) * this.view.h;
                    const q = clamp01((seconds - 12) / travel);
                    const startX = direction > 0 ? -rx * 1.35 : this.view.w + rx * 1.35;
                    const endX = direction > 0 ? this.view.w + rx * 1.35 : -rx * 1.35;
                    const fade = seconds < 12
                        ? smoothstep(0, 12, seconds)
                        : seconds > 12 + travel
                            ? 1 - smoothstep(12 + travel, life, seconds)
                            : 1;
                    const groundY = this.groundScreenY != null && Number.isFinite(Number(this.groundScreenY))
                        ? Number(this.groundScreenY)
                        : ATMOSPHERE_GROUND_Y * this.view.h;
                    const verticalSpan = Math.max(1, 0.43 * this.view.h - ry * 2);
                    const localY = Math.max(0, Math.min(verticalSpan,
                        seed.b * verticalSpan + 0.020 * this.view.h * Math.sin(this.time * 0.035 + index * 1.31)));
                    const fieldX = wrapAtmospherePixel(startX + (endX - startX) * q + this.parallax.x, this.view.w, rx * 1.35);
                    const fieldY = groundY + ry + localY;
                    this.queueSprite(backend, this.glowTexture,
                        fieldX,
                        fieldY,
                        rx * 2, ry * 2, color(0.01, 0.015, 0.025),
                        (0.045 + 0.055 * seed.a) * fade);
                    continue;
                }

                const travel = (upper ? 48 : 54) + (upper ? 34 : 38) * seed.a;
                const life = travel + 40;
                const seconds = (this.time + seed.b * life * 4) % life;
                const direction = seed.c < 0.5 ? -1 : 1;
                const rx = SOFT_FIELD_BLOB_SCALE * (upper ? (0.045 + seed.c * 0.065) * 0.65 : (0.050 + seed.c * 0.075) * 0.5) * this.view.w;
                const ry = SOFT_FIELD_BLOB_SCALE * (upper ? (0.025 + seed.d * 0.048) * 0.65 : (0.030 + seed.d * 0.050) * 0.5) * this.view.h;
                const q = clamp01((seconds - 20) / travel);
                const startX = direction > 0 ? -rx * 1.3 : this.view.w + rx * 1.3;
                const endX = direction > 0 ? this.view.w + rx * 1.3 : -rx * 1.3;
                const fade = seconds < 20
                    ? smoothstep(0, 20, seconds)
                    : seconds > 20 + travel
                        ? 1 - smoothstep(20 + travel, life, seconds)
                        : 1;
                const groundY = this.groundScreenY != null && Number.isFinite(Number(this.groundScreenY))
                    ? Number(this.groundScreenY)
                    : ATMOSPHERE_GROUND_Y * this.view.h;
                const upperTop = groundY - 1.07 * this.view.h;
                const baseY = upper
                    ? upperTop + seed.b * (groundY - upperTop)
                    : groundY + seed.b * 0.39 * this.view.h;
                const fieldY = baseY + (upper ? 0.018 : 0.010) * this.view.h
                    * Math.sin(this.time * speed * (upper ? 0.35 : 0.26) + index * (upper ? 1.7 : 1.3));
                let alpha = (upper ? (0.055 + 0.125 * seed.a) : (0.050 + 0.130 * seed.a)) * fade;
                if (upper) alpha *= 1 - smoothstep(-0.10 * this.view.h, 0.06 * this.view.h, fieldY - groundY);
                const fieldX = wrapAtmospherePixel(startX + (endX - startX) * q + this.parallax.x, this.view.w, rx * 1.3);
                this.queueSprite(backend, this.glowTexture,
                    fieldX,
                    fieldY,
                    rx * 2, ry * 2,
                    upper ? color(0.72, 0.79, 0.87) : color(0.70, 0.77, 0.84),
                    alpha);
            }
            return count > 0;
        };
        if (terrainFront) {
            if (this.effects.groundFog > 0) drew = drawField("groundFog", this.seeds.groundFog) || drew;
            return drew;
        }
        if (this.effects.cloudShadow > 0) drew = drawField("cloudShadow", this.seeds.cloudShadow) || drew;
        if (this.effects.upperClouds > 0) drew = drawField("upperClouds", this.seeds.upperClouds) || drew;
        if (this.effects.lowerClouds > 0) drew = drawField("lowerClouds", this.seeds.lowerClouds) || drew;
        return drew;
    }

    distributedLowerY(seed) {
        if (seed < 2 / 3) return 2 / 3 + 0.5 * seed;
        const v = (seed - 2 / 3) / (1 / 3);
        return (1 + Math.sqrt(Math.max(0, v))) / 3;
    }

    drawFireflies(backend) {
        const intensity = this.effects.fireflies || 0;
        if (intensity <= 0) return false;
        const count = Math.min(this.seeds.fireflies.length, Math.round(96 * intensity));
        const scale = pointScale1080(this.view.h);
        for (let index = 0; index < count; index += 1) {
            const seed = this.seeds.fireflies[index];
            const x = wrap01(seed.a + 0.020 * Math.sin(this.time * 0.19 + seed.c * TAU) + 0.012 * Math.sin(this.time * 0.37 + seed.d * 8));
            const y = this.distributedLowerY(seed.b) + 0.028 * Math.sin(this.time * 0.15 + seed.d * TAU) + 0.010 * Math.sin(this.time * 0.43 + seed.a * 9);
            const point = this.periodicScreenPoint(x, y);
            const pulse = Math.pow(Math.max(0, 0.5 + 0.5 * Math.sin(this.time * (0.65 + seed.c * 0.7) + seed.a * 21)), 5);
            const size = (5.5 + 8 * seed.d) * scale;
            this.queueSprite(backend, this.glowTexture, point.x, point.y, size, size, color(0.78, 1, 0.32), clamp01(0.28 + 1.15 * pulse), 0, "additive");
        }
        return count > 0;
    }

    drawWisps(backend) {
        const intensity = this.effects.wisps || 0;
        if (intensity <= 0) return false;
        const count = Math.min(this.seeds.wisps.length, Math.round(24 * intensity));
        const scale = pointScale1080(this.view.h);
        for (let index = 0; index < count; index += 1) {
            const seed = this.seeds.wisps[index];
            const direction = seed.c < 0.5 ? -1 : 1;
            const startX = seed.a * 1.24 - 0.12;
            const x = wrapPixel(startX + direction * (0.006 + 0.010 * seed.d) * this.time + 0.12, 1.24) - 0.12;
            let y = 0.16 + 0.60 * seed.b + (seed.e - 0.5) * 0.0012 * this.time
                + 0.025 * Math.sin(this.time * 0.21 + seed.f * TAU)
                + 0.012 * Math.sin(this.time * 0.63 + seed.d * TAU);
            y = 0.08 + wrapPixel(y - 0.08, 0.84);
            const point = this.periodicScreenPoint(x, y);
            const size = (26 + 28 * seed.f) * scale;
            const tint = mixColor(color(0.28, 0.84, 1), color(0.48, 1, 0.72), seed.c);
            const pulse = 0.78 + 0.22 * (0.5 + 0.5 * Math.sin(this.time * (0.55 + 0.35 * seed.c) + seed.d * TAU));
            this.queueSprite(backend, this.glowTexture, point.x, point.y, size, size, tint, (0.65 + 0.30 * seed.e) * pulse, 0, "additive");
        }
        return count > 0;
    }

    drawSpores(backend) {
        const intensity = this.effects.spores || 0;
        if (intensity <= 0) return false;
        const count = Math.min(this.seeds.spores.length, Math.round(90 * intensity));
        const scale = pointScale1080(this.view.h);
        for (let index = 0; index < count; index += 1) {
            const seed = this.seeds.spores[index];
            const point = this.periodicScreenPoint(
                wrap01(seed.a + AtmosphereTuning.SHARED_WIND * 0.002 * this.time + 0.018 * Math.sin(this.time * 0.22 + seed.c * 9)),
                wrap01(seed.b - 0.004 * this.time + 0.018 * Math.sin(this.time * 0.17 + seed.d * 8))
            );
            const size = (2 + 5 * seed.d) * scale;
            const tint = mixColor(color(0.45, 0.85, 0.72), color(0.66, 0.52, 1), seed.c);
            this.queueSprite(backend, this.glowTexture, point.x, point.y, size, size, tint, 0.18 + 0.32 * seed.d, 0, "additive");
        }
        return count > 0;
    }

    weatherGust() {
        return 1 + 0.45 * Math.max(0, Math.sin(this.time * 0.31 + Math.sin(this.time * 0.071) * 2.3)) * AtmosphereTuning.WEATHER_TURBULENCE;
    }

    drawRain(backend) {
        const intensity = this.effects.rain || 0;
        if (intensity <= 0) return false;
        const gust = this.weatherGust();
        const count = Math.min(this.seeds.rain.length, Math.round((300 + 100 * Math.max(0, gust - 1)) * intensity));
        const scale = Math.max(0.01, this.view.h / 1080);
        const margin = 90;
        const spanX = this.view.w + margin * 2;
        const spanY = this.view.h + margin * 2;
        const segments = 6;
        for (let index = 0; index < count; index += 1) {
            const seed = this.seeds.rain[index];
            const vy = (650 + 650 * seed.c) * scale;
            const vx = (AtmosphereTuning.SHARED_WIND * 125 + (seed.d * 2 - 1) * 34 * AtmosphereTuning.WEATHER_TURBULENCE) * scale;
            const x = wrapAtmospherePixel(seed.a * spanX - margin + vx * this.time + this.parallax.x, this.view.w, margin);
            const y = wrapAtmospherePixel(seed.b * spanY - margin + vy * this.time + this.parallax.y, this.view.h, margin);
            const length = (25 + 48 * seed.e) * scale;
            const velocityLength = Math.hypot(vx, vy) || 1;
            const tx = vx / velocityLength;
            const ty = vy / velocityLength;
            for (let segment = 0; segment < segments; segment += 1) {
                const front0 = segment / segments;
                const front1 = (segment + 1) / segments;
                const mid = (front0 + front1) * 0.5;
                const along0 = -length * (1 - front0);
                const along1 = -length * (1 - front1);
                const taper = 0.18 + 0.82 * Math.pow(mid, 0.82);
                const trail = 0.055 + 0.945 * Math.pow(mid, 1.45);
                const alpha = (0.58 + 0.34 * seed.e) * trail * 0.72;
                this.drawLine(backend,
                    x + tx * along0, y + ty * along0,
                    x + tx * along1, y + ty * along1,
                    1.05 * scale * taper,
                    color(0.54, 0.56, 0.60), alpha, "alpha");
            }
        }
        return count > 0;
    }

    drawSnow(backend) {
        const intensity = this.effects.snow || 0;
        if (intensity <= 0) return false;
        const gust = this.weatherGust();
        const count = Math.min(this.seeds.snow.length, Math.round((130 + 85 * gust) * intensity));
        const scale = pointScale1080(this.view.h);
        for (let index = 0; index < count; index += 1) {
            const seed = this.seeds.snow[index];
            const travel = this.time * (0.025 + 0.036 * seed.c) * (0.65 + seed.d * 0.75);
            const x = wrap01(seed.a + AtmosphereTuning.SHARED_WIND * 0.022 * travel
                + Math.sin(this.time * 0.37 + seed.a * TAU) * 0.015 * AtmosphereTuning.WEATHER_TURBULENCE
                + Math.sin(this.time * (0.55 + seed.d * 0.9) + seed.c * TAU) * 0.022 * AtmosphereTuning.WEATHER_TURBULENCE);
            const y = wrap01(seed.b + travel) * 1.16 - 0.08;
            const point = this.periodicScreenPoint(x, y);
            const size = (1.2 + 3.6 * seed.d) * scale;
            this.queueSprite(backend, this.glowTexture, point.x, point.y, size, size, color(0.93, 0.97, 1), 0.30 + 0.58 * seed.d);
        }
        return count > 0;
    }

    drawLeaves(backend, petal) {
        const id = petal ? "petals" : "leaves";
        const intensity = this.effects[id] || 0;
        if (intensity <= 0) return false;
        const gust = this.weatherGust();
        const base = petal ? 45 : 35;
        const count = Math.min(this.seeds[id].length, Math.round((base + base * gust) * intensity));
        const scale = Math.max(0.01, this.view.h / 1080);
        const source = petal ? this.petalTexture : this.leafTexture;
        for (let index = 0; index < count; index += 1) {
            const seed = this.seeds[id][index];
            const speed = (petal ? 0.026 : 0.038) + seed.b * (petal ? 0.030 : 0.044);
            const travel = this.time * speed;
            const phase = this.time * (seed.c > 0.62 ? 1.45 : 0.72) + seed.a * TAU;
            const sway = Math.sin(phase) * (petal ? 0.070 : 0.050) * (0.55 + seed.d * 0.65) * AtmosphereTuning.WEATHER_TURBULENCE;
            const x = wrap01(seed.a + AtmosphereTuning.SHARED_WIND * 0.020 * travel + sway + Math.sin(this.time * 0.34 + seed.b * 8) * 0.028 * AtmosphereTuning.WEATHER_TURBULENCE);
            const y = wrap01(seed.b + travel) * 1.20 - 0.10;
            const point = this.periodicScreenPoint(x, y);
            const size = ((petal ? 3.3 : 4.8) + (petal ? 3.6 : 5.4) * seed.d) * scale * 2.0;
            const tint = petal
                ? mixColor(color(0.95, 0.56, 0.70), color(0.95, 0.84, 0.72), seed.c)
                : seed.c < 0.33 ? color(0.78, 0.46, 0.08) : seed.c < 0.66 ? color(0.62, 0.22, 0.06) : color(0.72, 0.65, 0.12);
            const squash = 0.40 + 0.60 * Math.abs(Math.cos(phase));
            this.queueSprite(backend, source, point.x, point.y, size * squash, size, tint, 0.82, phase * 0.35);
        }
        return count > 0;
    }

    drawButterflies(backend) {
        const intensity = this.effects.butterflies || 0;
        if (intensity <= 0) return false;
        const count = Math.min(this.seeds.butterflies.length, Math.round(48 * intensity));
        const scale = pointScale1080(this.view.h);
        for (let index = 0; index < count; index += 1) {
            const seed = this.seeds.butterflies[index];
            const direction = seed.c < 0.5 ? -1 : 1;
            const speed = direction * (0.008 + 0.010 * seed.d);
            const frequency = (5.4 + 2 * seed.e) * 3;
            const phase = this.time * frequency + seed.f * TAU;
            const beatPos = phase / TAU;
            const beat = Math.floor(beatPos);
            const fraction = fract(beatPos);
            const smoothBeat = fraction ** 3 * (fraction * (fraction * 6 - 15) + 10);
            const steerSeed = seed.f * 37 + seed.e * 11 + seed.d * 19;
            const j0x = butterflyHash(steerSeed + beat * 2.17) * 2 - 1;
            const j0y = butterflyHash(steerSeed + beat * 3.71 + 8) * 2 - 1;
            const j1x = butterflyHash(steerSeed + (beat + 1) * 2.17) * 2 - 1;
            const j1y = butterflyHash(steerSeed + (beat + 1) * 3.71 + 8) * 2 - 1;
            const steerX = j0x + (j1x - j0x) * smoothBeat;
            const steerY = j0y + (j1y - j0y) * smoothBeat;
            const beatAdvance = direction * 0.00115 * (beat + smoothBeat);
            const startX = seed.a * 1.20 - 0.10;
            const x = wrapPixel(startX + (speed + AtmosphereTuning.SHARED_WIND * 0.0025) * this.time + beatAdvance + steerX * 0.0014 + 0.10, 1.20) - 0.10;
            const y = this.distributedLowerY(seed.b) + steerY * 0.0020;
            const point = this.periodicScreenPoint(x, y);
            const flap = 0.5 + 0.5 * Math.sin(phase);
            const pointSize = (5.0 + 2.5 * seed.d) * scale;
            const spread = (0.06 + 0.22 * flap) * pointSize * 0.5;
            const lift = (flap - 0.5) * 0.06 * pointSize * 0.5;
            const wingSize = pointSize * 0.60;
            const tint = mixColor(color(0.92, 0.68, 0.25), color(0.62, 0.76, 1), seed.e);
            const alpha = 0.68 + 0.24 * seed.c;
            this.queueSprite(backend, this.glowTexture, point.x - spread, point.y + lift, wingSize, wingSize, tint, alpha);
            this.queueSprite(backend, this.glowTexture, point.x + spread, point.y - lift, wingSize, wingSize, tint, alpha);
        }
        return count > 0;
    }

    drawEmbers(backend) {
        const intensity = this.effects.embers || 0;
        if (intensity <= 0) return false;
        const count = Math.min(this.seeds.embers.length, Math.round(96 * intensity));
        const scale = pointScale1080(this.view.h);
        for (let index = 0; index < count; index += 1) {
            const seed = this.seeds.embers[index];
            const speed = 0.055 + 0.075 * seed.c;
            const life = wrap01(seed.b + this.time * speed);
            const y = 1.08 - life * 0.68;
            const heatWander = (0.010 + 0.020 * seed.e) * AtmosphereTuning.WEATHER_TURBULENCE;
            const x = wrap01(seed.a + AtmosphereTuning.SHARED_WIND * 0.006 * this.time + heatWander * Math.sin(this.time * (1.15 + 1.8 * seed.e) + seed.d * 9) + 0.008 * Math.sin(this.time * (3 + 2 * seed.d) + seed.f * 13));
            const point = this.periodicScreenPoint(x, y);
            const fadeIn = smoothstep(0, 0.10, life);
            const fadeOut = 1 - smoothstep(0.70, 1, life);
            const flicker = (0.58 + 0.42 * (0.5 + 0.5 * Math.sin(this.time * (5 + 7 * seed.e) + seed.f * TAU)))
                * (0.82 + 0.32 * Math.pow(0.5 + 0.5 * Math.sin(this.time * (1.7 + 2.1 * seed.d) + seed.d * 27), 6));
            const baseSize = 2.4 + 4.6 * seed.c;
            const size = baseSize * (1 + seed.f) * scale;
            const stretch = 0.75 + 0.25 * life * life;
            const tint = mixColor(color(1, 0.28, 0.035), color(1, 0.84, 0.20), 0.35 + 0.65 * seed.e);
            this.queueSprite(backend, this.glowTexture, point.x, point.y, size / 1.45, size * stretch, tint,
                clamp01((0.45 + 0.50 * seed.d) * fadeIn * fadeOut * flicker), 0, "additive");
        }
        return count > 0;
    }

    drawEyes(backend) {
        const intensity = this.effects.eyes || 0;
        const event = this.state.eyesEvent;
        if (intensity <= 0 || !event || !this.eyesTexture) return false;
        const age = this.time - event.start;
        if (age < 0 || age >= event.life) return false;
        const fade = Math.min(1, age / 0.7, (event.life - age) / 0.7);
        const blink = age > 2.1 && age < 2.22 ? 0.04 : 1;
        const point = this.eventScreenPoint(event, event.x, event.y);
        const width = this.view.w * 0.03195 * EYES_SIZE_SCALE;
        const height = this.view.h * 0.01598 * EYES_SIZE_SCALE;
        this.queueSprite(backend, this.eyesTexture, point.x, point.y, width, height, color(1, 1, 1), fade * blink * Math.min(1, intensity));
        return true;
    }
}

export function atmosphereEffectCount(effects) {
    const normalized = normalizeAtmosphereEffects(effects);
    return ATMOSPHERE_EFFECT_IDS.reduce((count, id) => count + (normalized[id] > 0 ? 1 : 0), 0);
}
