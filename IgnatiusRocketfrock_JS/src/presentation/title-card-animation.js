const DEFAULT_CONFIG_URL = new URL("../../resources/ui/title_card_animation.json", import.meta.url);
const DEFAULT_ASSET_ROOT = new URL("../../resources/ui/", import.meta.url);

function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
}

function fract(value) {
    return value - Math.floor(value);
}

function hash01(index, salt = 0) {
    return fract(Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453123);
}

export function normalizeTitleCardConfig(raw = {}) {
    const source = raw && typeof raw === "object" ? raw : {};
    const globalSource = source.global && typeof source.global === "object" ? source.global : {};
    const particleSource = source.particles && typeof source.particles === "object" ? source.particles : {};
    const rawLayers = source.layers && typeof source.layers === "object" ? source.layers : {};
    const layers = {};
    for (const [id, layerValue] of Object.entries(rawLayers)) {
        const layer = layerValue && typeof layerValue === "object" ? layerValue : {};
        layers[id] = {
            id,
            file: String(layer.file || ""),
            visible: layer.visible !== false,
            x: finiteNumber(layer.x, 0),
            y: finiteNumber(layer.y, 0),
            scale: clamp(finiteNumber(layer.scale, 1), 0.01, 4),
            angleDeg: finiteNumber(layer.angleDeg, 0),
            parallaxX: finiteNumber(layer.parallaxX, 0),
            parallaxY: finiteNumber(layer.parallaxY, 0),
            motionSource: String(layer.motionSource || ""),
            zIndex: finiteNumber(layer.zIndex, 0)
        };
    }
    return {
        version: Math.max(1, Math.round(finiteNumber(source.version, 1))),
        designWidth: Math.max(1, Math.round(finiteNumber(source.designWidth, 1448))),
        designHeight: Math.max(1, Math.round(finiteNumber(source.designHeight, 1086))),
        fallbackImage: String(source.fallbackImage || "title_card.png"),
        global: {
            motionScale: clamp(finiteNumber(globalSource.motionScale, 0.107), 0, 5),
            motionSpeed: clamp(finiteNumber(globalSource.motionSpeed, 0.55), 0, 10),
            axisSpinSpeed: clamp(finiteNumber(globalSource.axisSpinSpeed, 0.074), -10, 10),
            parallaxPixelScale: clamp(finiteNumber(globalSource.parallaxPixelScale, 10), 0, 100)
        },
        particles: {
            enabled: particleSource.enabled !== false,
            intensity: clamp(finiteNumber(particleSource.intensity, 1.19), 0, 5),
            originX: finiteNumber(particleSource.originX, 330),
            originY: finiteNumber(particleSource.originY, 1030),
            offsetX: finiteNumber(particleSource.offsetX, -105),
            offsetY: finiteNumber(particleSource.offsetY, -8),
            angleDeg: finiteNumber(particleSource.angleDeg, -26.1),
            baseDirectionDeg: finiteNumber(particleSource.baseDirectionDeg, 155),
            speed: clamp(finiteNumber(particleSource.speed, 1), 0, 5),
            flameLifetime: clamp(finiteNumber(particleSource.flameLifetime, 3.88), 0.05, 30),
            smokeLifetime: clamp(finiteNumber(particleSource.smokeLifetime, 2.05), 0.05, 30),
            sparkLifetime: clamp(finiteNumber(particleSource.sparkLifetime, 3.89), 0.05, 30),
            zIndex: finiteNumber(particleSource.zIndex, 45)
        },
        layers
    };
}

function titleCardLayerDynamicMotion(layer, config, elapsedSeconds) {
    const global = config.global;
    const phase = finiteNumber(layer.zIndex, 0) * 0.071;
    const theta = elapsedSeconds * global.motionSpeed + phase;
    const axis = elapsedSeconds * global.axisSpinSpeed;
    const localX = Math.sin(theta);
    const localY = Math.cos(theta * 0.83 + phase * 0.37);
    const axisCos = Math.cos(axis);
    const axisSin = Math.sin(axis);
    const rotatedX = localX * axisCos - localY * axisSin;
    const rotatedY = localX * axisSin + localY * axisCos;
    const motionAmplitude = global.motionScale * global.parallaxPixelScale;
    return {
        dx: layer.parallaxX * motionAmplitude * rotatedX,
        dy: layer.parallaxY * motionAmplitude * rotatedY,
        angle: (Math.abs(layer.parallaxX) + Math.abs(layer.parallaxY))
            * 0.018 * motionAmplitude * Math.sin(theta * 0.47 + phase)
    };
}

export function titleCardLayerMotion(layer, config, elapsedSeconds) {
    const motionSourceId = String(layer.motionSource || "");
    const motionSource = motionSourceId && motionSourceId !== layer.id && config.layers[motionSourceId]
        ? config.layers[motionSourceId]
        : layer;
    const dynamicMotion = titleCardLayerDynamicMotion(motionSource, config, elapsedSeconds);
    return {
        dx: layer.x + dynamicMotion.dx,
        dy: layer.y + dynamicMotion.dy,
        angle: layer.angleDeg + dynamicMotion.angle
    };
}

export function titleCardLayerPoint(layer, config, elapsedSeconds, x, y) {
    const motion = titleCardLayerMotion(layer, config, elapsedSeconds);
    const centerX = config.designWidth * 0.5;
    const centerY = config.designHeight * 0.5;
    const radians = motion.angle * Math.PI / 180;
    const scaledX = (finiteNumber(x) - centerX) * layer.scale;
    const scaledY = (finiteNumber(y) - centerY) * layer.scale;
    return {
        x: centerX + motion.dx + scaledX * Math.cos(radians) - scaledY * Math.sin(radians),
        y: centerY + motion.dy + scaledX * Math.sin(radians) + scaledY * Math.cos(radians),
        angle: motion.angle
    };
}

function imagePromise(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Unable to load title-card image: ${url}`));
        image.src = String(url);
    });
}

function drawLayer(context, image, layer, config, elapsedSeconds) {
    if (!image || !layer.visible) return;
    const { dx, dy, angle } = titleCardLayerMotion(layer, config, elapsedSeconds);
    const width = config.designWidth * layer.scale;
    const height = config.designHeight * layer.scale;
    context.save();
    context.translate(config.designWidth * 0.5 + dx, config.designHeight * 0.5 + dy);
    context.rotate(angle * Math.PI / 180);
    context.drawImage(image, -width * 0.5, -height * 0.5, width, height);
    context.restore();
}

function drawSoftParticle(context, x, y, radiusX, radiusY, angleRadians, stops, composite = "source-over") {
    const rx = Math.max(0.1, radiusX);
    const ry = Math.max(0.1, radiusY);
    context.save();
    context.globalCompositeOperation = composite;
    context.translate(x, y);
    context.rotate(angleRadians);
    context.scale(rx, ry);
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, 1);
    for (const [offset, color] of stops) gradient.addColorStop(offset, color);
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(0, 0, 1, 0, Math.PI * 2);
    context.fill();
    context.restore();
}

function drawSpark(context, x, y, radius, alpha) {
    drawSoftParticle(context, x, y, radius * 3.8, radius * 3.8, 0, [
        [0, `rgba(255,255,220,${0.9 * alpha})`],
        [0.16, `rgba(255,224,92,${0.82 * alpha})`],
        [0.42, `rgba(255,145,28,${0.38 * alpha})`],
        [1, "rgba(255,100,0,0)"]
    ], "lighter");
    context.save();
    context.globalCompositeOperation = "lighter";
    context.fillStyle = `rgba(255,244,170,${alpha})`;
    context.beginPath();
    context.arc(x, y, Math.max(0.65, radius * 0.62), 0, Math.PI * 2);
    context.fill();
    context.restore();
}

function drawTitleParticles(context, config, elapsedSeconds) {
    const particles = config.particles;
    if (!particles.enabled || particles.intensity <= 0) return;

    const rocket = config.layers.rocket;
    const rocketPoint = rocket
        ? titleCardLayerPoint(rocket, config, elapsedSeconds, particles.originX + particles.offsetX, particles.originY + particles.offsetY)
        : { x: particles.originX + particles.offsetX, y: particles.originY + particles.offsetY, angle: 0 };
    const sourceX = rocketPoint.x;
    const sourceY = rocketPoint.y;
    const radians = (particles.baseDirectionDeg + particles.angleDeg + rocketPoint.angle) * Math.PI / 180;
    const directionX = Math.cos(radians);
    const directionY = Math.sin(radians);
    const perpendicularX = -directionY;
    const perpendicularY = directionX;
    const speed = particles.speed;

    // Soft smoke sits behind the luminous exhaust. The puffs are broad radial
    // gradients instead of solid geometry so the plume keeps the prototype's
    // cloudy edge while remaining cheap enough for the title screen.
    const smokeCount = Math.max(0, Math.round(20 * particles.intensity));
    for (let index = 0; index < smokeCount; index += 1) {
        const age = fract(elapsedSeconds / particles.smokeLifetime + hash01(index, 3));
        const distance = (42 + age * 280) * speed;
        const lateral = (hash01(index, 4) - 0.5) * (24 + age * 88)
            + Math.sin(elapsedSeconds * 1.7 + index * 2.41) * (3 + age * 8);
        const rise = age * (18 + 24 * hash01(index, 8));
        const x = sourceX + directionX * distance + perpendicularX * lateral;
        const y = sourceY + directionY * distance + perpendicularY * lateral - rise;
        const fade = Math.pow(1 - age, 1.15);
        const radius = 18 + age * 38 + hash01(index, 9) * 10;
        drawSoftParticle(context, x, y, radius * 1.25, radius, radians, [
            [0, `rgba(242,235,222,${0.34 * fade})`],
            [0.35, `rgba(202,192,184,${0.25 * fade})`],
            [0.72, `rgba(115,105,112,${0.13 * fade})`],
            [1, "rgba(78,69,81,0)"]
        ]);
    }

    // The prototype's flame reads as one incandescent exhaust mass. Build it
    // from overlapping additive glows: a broad orange halo, a yellow body and
    // a white-hot core. The overlaps intentionally bloom into one another.
    const nozzlePulse = 0.94 + 0.06 * Math.sin(elapsedSeconds * 12.7);
    const nozzleX = sourceX + directionX * 22 * speed;
    const nozzleY = sourceY + directionY * 22 * speed;
    drawSoftParticle(context, nozzleX, nozzleY, 72 * nozzlePulse, 46 * nozzlePulse, radians, [
        [0, "rgba(255,255,245,0.90)"], [0.18, "rgba(255,246,160,0.78)"],
        [0.48, "rgba(255,154,34,0.46)"], [1, "rgba(255,72,0,0)"]
    ], "lighter");
    drawSoftParticle(context, nozzleX, nozzleY, 42 * nozzlePulse, 27 * nozzlePulse, radians, [
        [0, "rgba(255,255,255,0.96)"], [0.38, "rgba(255,247,190,0.82)"], [1, "rgba(255,190,40,0)"]
    ], "lighter");

    const coreCount = Math.max(7, Math.round(12 * particles.intensity));
    for (let index = coreCount - 1; index >= 0; index -= 1) {
        const t = (index + 0.2) / coreCount;
        const flicker = 0.91 + 0.09 * Math.sin(elapsedSeconds * 10.5 + index * 1.83);
        const distance = (8 + t * 160) * speed * flicker;
        const lateral = (hash01(index, 14) - 0.5) * (8 + t * 20)
            + Math.sin(elapsedSeconds * 8.7 + index * 1.31) * (2 + t * 7);
        const x = sourceX + directionX * distance + perpendicularX * lateral;
        const y = sourceY + directionY * distance + perpendicularY * lateral;
        const width = (30 + t * 36) * (0.94 + 0.08 * Math.sin(elapsedSeconds * 12.1 + index));
        const length = width * (1.18 + 0.42 * (1 - t));
        const tailFade = Math.pow(1 - t * 0.72, 1.15);
        drawSoftParticle(context, x, y, length * 1.35, width * 1.28, radians, [
            [0, `rgba(255,255,242,${0.78 * tailFade})`],
            [0.18, `rgba(255,246,178,${0.72 * tailFade})`],
            [0.43, `rgba(255,181,55,${0.48 * tailFade})`],
            [0.72, `rgba(255,91,12,${0.23 * tailFade})`],
            [1, "rgba(255,65,0,0)"]
        ], "lighter");
    }

    const flameCount = Math.max(0, Math.round(46 * particles.intensity));
    for (let index = 0; index < flameCount; index += 1) {
        const age = fract(elapsedSeconds / particles.flameLifetime + hash01(index, 1));
        const fade = Math.pow(1 - age, 1.35);
        const distance = (12 + age * (215 + 100 * hash01(index, 10))) * speed;
        const lateral = (hash01(index, 2) - 0.5) * (12 + age * 55)
            + Math.sin(elapsedSeconds * 6.8 + index * 1.7) * 4;
        const x = sourceX + directionX * distance + perpendicularX * lateral;
        const y = sourceY + directionY * distance + perpendicularY * lateral;
        const radius = 5 + 20 * fade + 7 * hash01(index, 11);
        drawSoftParticle(context, x, y, radius * 1.5, radius, radians, [
            [0, `rgba(255,255,230,${0.82 * fade})`],
            [0.2, `rgba(255,226,96,${0.75 * fade})`],
            [0.52, `rgba(255,124,25,${0.45 * fade})`],
            [1, "rgba(255,68,0,0)"]
        ], "lighter");
    }

    const sparkCount = Math.max(0, Math.round(46 * particles.intensity));
    for (let index = 0; index < sparkCount; index += 1) {
        const age = fract(elapsedSeconds / particles.sparkLifetime + hash01(index, 5));
        const distance = (12 + age * (180 + 260 * hash01(index, 7))) * speed;
        const lateral = (hash01(index, 6) - 0.5) * (48 + age * 220);
        const gravity = age * age * (18 + 42 * hash01(index, 12));
        const x = sourceX + directionX * distance + perpendicularX * lateral;
        const y = sourceY + directionY * distance + perpendicularY * lateral + gravity;
        const fade = Math.pow(1 - age, 1.9);
        const radius = 1.3 + (2.0 + 3.0 * hash01(index, 13)) * fade;
        drawSpark(context, x, y, radius, 0.18 + 0.82 * fade);
    }
}

export async function createTitleCardAnimator(canvas, options = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new TypeError("createTitleCardAnimator requires a canvas element");
    }
    const configUrl = options.configUrl ? new URL(options.configUrl, document.baseURI) : DEFAULT_CONFIG_URL;
    const assetRoot = options.assetRoot ? new URL(options.assetRoot, document.baseURI) : DEFAULT_ASSET_ROOT;
    let configLoadFailed = false;
    let rawConfig = {};
    try {
        const response = await fetch(configUrl, { cache: "no-cache" });
        if (!response.ok) throw new Error(`Unable to load title-card config: ${response.status}`);
        rawConfig = await response.json();
    } catch (error) {
        configLoadFailed = true;
        console.warn("Animated title-card config unavailable; using the static fallback.", error);
    }
    let config = normalizeTitleCardConfig(rawConfig);
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("Unable to create title-card canvas context");
    const resizeBackingStore = () => {
        canvas.width = config.designWidth;
        canvas.height = config.designHeight;
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
    };
    resizeBackingStore();

    const fallbackImage = await imagePromise(new URL(config.fallbackImage, assetRoot)).catch(() => null);
    if (fallbackImage) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(fallbackImage, 0, 0, config.designWidth, config.designHeight);
    }
    const images = new Map();
    let layerLoadFailed = false;
    await Promise.all(Object.values(config.layers).map(async (layer) => {
        if (!layer.file) return;
        try {
            const image = await imagePromise(new URL(layer.file, assetRoot));
            images.set(layer.id, image);
        } catch (error) {
            layerLoadFailed = true;
            console.warn(`Animated title-card layer ${layer.id} unavailable; using the static fallback.`, error);
        }
    }));

    let disposed = false;
    let startTime = performance.now() * 0.001;
    let animationFrame = 0;
    let forceFallback = configLoadFailed || layerLoadFailed || images.size === 0;

    function draw(nowSeconds = performance.now() * 0.001) {
        const elapsedSeconds = Math.max(0, nowSeconds - startTime);
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        if (forceFallback || images.size === 0) {
            if (fallbackImage) context.drawImage(fallbackImage, 0, 0, config.designWidth, config.designHeight);
            return;
        }
        const entries = Object.values(config.layers)
            .map((layer) => ({ type: "layer", zIndex: layer.zIndex, layer }))
            .concat(config.particles.enabled ? [{ type: "particles", zIndex: config.particles.zIndex }] : [])
            .sort((a, b) => a.zIndex - b.zIndex);
        for (const entry of entries) {
            if (entry.type === "particles") {
                drawTitleParticles(context, config, elapsedSeconds);
            } else {
                drawLayer(context, images.get(entry.layer.id), entry.layer, config, elapsedSeconds);
            }
        }
    }

    function animate(nowMilliseconds) {
        if (disposed) return;
        if (!document.hidden && canvas.isConnected && canvas.getClientRects().length > 0) {
            draw(nowMilliseconds * 0.001);
        }
        animationFrame = requestAnimationFrame(animate);
    }

    draw(startTime);
    animationFrame = requestAnimationFrame(animate);

    return {
        get config() { return structuredClone(config); },
        setConfig(nextConfig) {
            config = normalizeTitleCardConfig(nextConfig);
            resizeBackingStore();
            draw();
        },
        resetClock() {
            startTime = performance.now() * 0.001;
            draw(startTime);
        },
        setFallback(enabled) {
            forceFallback = Boolean(enabled);
            draw();
        },
        draw,
        dispose() {
            disposed = true;
            if (animationFrame) cancelAnimationFrame(animationFrame);
        }
    };
}
