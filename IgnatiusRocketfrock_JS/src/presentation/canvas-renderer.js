import {
    STORY_READING_CHARACTERS_PER_SECOND,
    STORY_READING_START_DELAY_SECONDS,
    storyCharacterCount
} from "../shared/story-reading.js";
import {
    animationTimeFromPhase,
    blendAnimationPoses,
    sampleAnimationClip
} from "../shared/animation-data.js";
import {
    atlasNodeToPlacementWorld,
    LEVEL_BACKGROUND_COLOR,
    normalizeRotationRadians,
    placementCenter
} from "../shared/level-transform.js";
import {
    actorBodyRect,
    characterEnemyMeleeAttackRect,
    enemyProjectileHitbox
} from "../shared/actor-geometry.js";
import {
    colorMapCacheKey,
    normalizeLevelColorMap
} from "../shared/level-color-map-data.js";
import {
    normalizeBackgroundParallax,
    normalizeForegroundParallax,
    normalizeLayerBrightness
} from "../shared/level-layer-data.js";
import { caveWindowBounds } from "../shared/cave-window-data.js";
import {
    POWER_UP_EFFECT_IDS,
    WRENCH_POWER_UP_EFFECT_IDS,
    activePowerUpEffect,
    powerUpEffectDefinition,
    wrenchRocketGlowAtlasFrameId
} from "../shared/power-up-data.js";
import { createColorMappedCanvas } from "./level-color-map-cache.js";
import {
    buildCaveWindowGpuMaskGeometry,
    computeCaveWindowParallaxOffset,
    computeCaveWindowParallaxOffsetInto,
    drawCaveWindowMask
} from "./cave-window-mask.js";
import {
    createForegroundSpriteCanvas,
    foregroundTreatmentCacheKey
} from "./foreground-sprite-treatment.js";
import {
    buildWorldVisualCache,
    createWorldVisualQueryScratch,
    isWorldBackgroundVisual,
    queryWorldVisualEntries,
    visualIntersectsViewport,
    visualWorldBounds
} from "./world-visual-cache.js";
import { computeWorldParallaxOffsetInto } from "./world-parallax.js";
import {
    buildOverlapBlendGroups,
    createOverlapBlendSurface
} from "./overlap-blend-cache.js";
import {
    animationPoseToRuntimeTransforms,
    applyRuntimeProjectileHandoffVisibility,
    buildRuntimeCharacterDrawCommands,
    characterArtworkOrigin,
    loadRuntimeCharacterProject,
    sampleRuntimeCharacterPose
} from "./character-runtime.js";
import {
    actorGroundPoint,
    actorHasGroundContact,
    advanceActorShadowOpacity
} from "./actor-shadow.js";
import { createWebGL2RendererBackend } from "./webgl2-renderer.js";
import { createPixmapPyramid, drawPixmap } from "./pixmap-pyramid.js";
import { ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER } from "../shared/experimental-renderer-flags.js";
import {
    STATIC_TILE_GUTTER,
    STATIC_TILE_SIZE,
    STATIC_TILE_SLOT_SIZE,
    normalizeStaticTileBakeMode,
    staticTileCacheRegions,
    staticTilePriority,
    staticTileRangeForRect,
    staticTileRecordKey,
    staticTileRect,
    staticTileRectIntersects,
    staticTileRectIntersectsAny,
    staticTileViewRect
} from "../shared/static-tile-cache-data.js";

const transientPixmapPyramids = new WeakMap();
let pixmapPyramidsEnabled = true;

function pixmapPyramidFor(source) {
    if (!source) return null;
    let pyramid = transientPixmapPyramids.get(source);
    if (!pyramid) {
        pyramid = createPixmapPyramid(source);
        transientPixmapPyramids.set(source, pyramid);
    }
    return pyramid;
}

function drawRuntimePixmap(context, assetOrSource, dx, dy, dw, dh) {
    const source = assetOrSource?.canvas || assetOrSource;
    if (!source) return null;
    const sourceWidth = assetOrSource?.width || source.width || source.naturalWidth || 1;
    const sourceHeight = assetOrSource?.height || source.height || source.naturalHeight || 1;
    if (!pixmapPyramidsEnabled) {
        context.drawImage(source, 0, 0, sourceWidth, sourceHeight, dx, dy, dw ?? sourceWidth, dh ?? sourceHeight);
        return null;
    }
    const pyramid = assetOrSource?.pixmapPyramid || pixmapPyramidFor(source);
    return drawPixmap(context, pyramid, dx, dy, dw ?? pyramid.width, dh ?? pyramid.height);
}

const FIXED_DRAW_ORDER = [
    "leftArm",
    "leftFoot",
    "rocket",
    "rightFoot",
    "robe",
    "head",
    "hat",
    "rightArm"
];

const DEFAULT_CHARACTER_URL = "assets/ct_char_wizard_1.json";
const KNOWN_ENEMY_CHARACTER_URLS = [
    "assets/ct_char_enemy_001.json",
    "assets/ct_char_enemy_002.json",
    "assets/ct_char_enemy_010.json",
    "assets/ct_char_enemy_011.json",
    "assets/ct_char_enemy_012.json",
    "assets/ct_char_enemy_020.json",
    "assets/ct_char_enemy_030.json",
    "assets/ct_char_enemy_031.json",
    "assets/ct_char_enemy_032.json",
    "assets/ct_char_enemy_033.json"
];

const ENVIRONMENT_ATLAS_MANIFEST_CANDIDATES = [
    ...Array.from({ length: 20 }, (_, index) => {
        const atlasId = `at_atlas_${String(index + 1).padStart(3, "0")}`;
        return {
            url: `assets/${atlasId}.json`,
            forceAtlasId: atlasId,
            forceImage: `${atlasId}.png`
        };
    }),
    {
        url: "assets/it_atlas_001.json",
        forceAtlasId: "it_atlas_001",
        forceImage: "it_atlas_001.png"
    }
];

const REQUIRED_RIG_SECTIONS = ["global", "animation", "anchors", "legMotion", "pivots", "parts"];

// IMPORTANT VIEWPORT RULE:
// The game uses virtual viewport coordinates. On narrow mobile screens the
// whole canvas render is scaled down so gameplay behaves as if the screen were
// at least MIN_TOUCH_VIEWPORT_WIDTH wide. Keep sprites, physics, collisions,
// particles, camera, and controls in virtual/game coordinates. Do not add
// separate per-sprite mobile scaling. Pointer/touch/mouse coordinates must be
// converted through this same viewport transform before gameplay sees them.
const MIN_TOUCH_VIEWPORT_WIDTH = 600;
const VISUAL_CULL_MARGIN_PX = 128;
const WEBGL_DIRECT_WORLD_EFFECT_KINDS = new Set([
    "rocketSmokePuff",
    "attachedRocketSmokePuff",
    "rocketImpactSmokePuff",
    "reactiveObjectDestructionSmokePuff",
    "wizardDeathBurstParticle",
    "wizardCrushParticle",
    "enemyProjectileImpactPuff",
    "enemyTeleportFlash",
    "enemyTeleportSpark"
]);
const WEBGL_DIRECT_ENEMY_PROJECTILE_KINDS = new Set(["enemyFireball", "enemyMusketBall", "enemyRock", "enemyKnife"]);

const STATIC_LAYER_BAKE_CANVAS2D_MEMORY_BUDGET_BYTES = 1536 * 1024 * 1024;
// Full baking is deliberately capped at 1.5 GiB of estimated RGBA texture
// storage. WebGL cannot report a trustworthy VRAM total, so the experiment must
// leave a broad reserve for atlases, framebuffers, compositor surfaces, and
// upload staging rather than probing the driver's failure cliff.
const STATIC_LAYER_BAKE_WEBGL_MEMORY_BUDGET_BYTES = 1536 * 1024 * 1024;
const STATIC_LAYER_BAKE_BYTES_PER_PIXEL = 4;
const STATIC_LAYER_BAKE_CANVAS_COUNT = 3;
const STATIC_LAYER_BAKE_MAX_DIMENSION = 32767;
const STATIC_LAYER_BAKE_WEBGL_CHUNK_SIZE = 4096;
const STATIC_TILE_BAKE_WEBGL_MEMORY_BUDGET_BYTES = 1536 * 1024 * 1024;
const STATIC_TILE_BAKE_CANVAS_MEMORY_BUDGET_BYTES = 512 * 1024 * 1024;
const STATIC_TILE_BAKE_ATLAS_TARGET_SLOTS = 8;
const STATIC_TILE_BAKE_MAX_EMPTY_SCAN_PER_FRAME = 12;
const STATIC_TILE_BAKE_LAYER_ORDER = Object.freeze(["background", "terrain", "foreground"]);
const STATIC_TILE_BAKE_LAYER_BIAS = Object.freeze({ background: 0, terrain: 0.1, foreground: 0.2 });

function bakedLayerByteEstimate(width, height) {
    return Math.max(0, Math.ceil(width) * Math.ceil(height) * STATIC_LAYER_BAKE_BYTES_PER_PIXEL * STATIC_LAYER_BAKE_CANVAS_COUNT);
}

function staticLayerBakeBudgetForBackend(backend) {
    return backend?.available
        ? STATIC_LAYER_BAKE_WEBGL_MEMORY_BUDGET_BYTES
        : STATIC_LAYER_BAKE_CANVAS2D_MEMORY_BUDGET_BYTES;
}

function staticLayerBakeBudgetLabelForBackend(backend) {
    return backend?.available ? "WebGL/VRAM" : "Canvas2D/RAM";
}

function staticLayerBakeWorldBounds(worldBounds) {
    const x = Number(worldBounds?.x);
    const y = Number(worldBounds?.y);
    const w = Number(worldBounds?.w);
    const h = Number(worldBounds?.h);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
        return null;
    }
    return {
        x,
        y,
        w: Math.max(1, Math.ceil(w)),
        h: Math.max(1, Math.ceil(h))
    };
}

function staticLayerBakeIncludeRect(bounds, rect) {
    if (!bounds || !rect) return bounds;
    const rx = Number(rect.x);
    const ry = Number(rect.y);
    const rw = Number(rect.w);
    const rh = Number(rect.h);
    if (![rx, ry, rw, rh].every(Number.isFinite) || rw <= 0 || rh <= 0) return bounds;
    const minX = Math.min(bounds.x, rx);
    const minY = Math.min(bounds.y, ry);
    const maxX = Math.max(bounds.x + bounds.w, rx + rw);
    const maxY = Math.max(bounds.y + bounds.h, ry + rh);
    return {
        x: minX,
        y: minY,
        w: Math.max(1, maxX - minX),
        h: Math.max(1, maxY - minY)
    };
}

function staticLayerBakeBoundsIncludeVisuals(bounds, visuals = []) {
    if (!bounds) return null;
    let result = { ...bounds };
    for (const visual of Array.isArray(visuals) ? visuals : []) {
        if (!visualCanBeBakedStatic(visual)) continue;
        const visualBounds = visualWorldBounds(visual);
        const vx0 = Number(visualBounds?.minX);
        const vy0 = Number(visualBounds?.minY);
        const vx1 = Number(visualBounds?.maxX);
        const vy1 = Number(visualBounds?.maxY);
        if (![vx0, vy0, vx1, vy1].every(Number.isFinite) || vx1 <= vx0 || vy1 <= vy0) continue;
        result = staticLayerBakeIncludeRect(result, {
            x: vx0,
            y: vy0,
            w: vx1 - vx0,
            h: vy1 - vy0
        });
    }
    return result;
}

function staticLayerBakeBoundsIncludeCaveFullBlack(bounds, caveWindow) {
    if (!bounds || !caveWindow?.enabled || !Array.isArray(caveWindow.points) || caveWindow.points.length < 3) {
        return bounds;
    }
    const feather = Math.max(0, Number(caveWindow.feather) || 0);
    const fullBlackBounds = caveWindowBounds(caveWindow.points, feather);
    return staticLayerBakeIncludeRect(bounds, fullBlackBounds);
}

function staticLayerBakeExpandedForViewportParallax(bounds, state, view) {
    if (!bounds) return null;
    const zoom = Math.max(0.0001, Number(view?.zoom) || 1);
    const viewportW = Math.max(1, Number(view?.virtualW) || ((Number(view?.w) || 1) / zoom));
    const viewportH = Math.max(1, Number(view?.virtualH) || ((Number(view?.h) || 1) / zoom));
    const world = staticLayerBakeWorldBounds(state?.world?.bounds) || bounds;
    const foregroundParallax = normalizeForegroundParallax(state?.world?.layerVisuals?.foreground?.parallax);
    const backgroundParallax = normalizeBackgroundParallax(state?.world?.layerVisuals?.background?.parallax);
    const foregroundSlackX = Math.max(0, foregroundParallax - 1) * (world.w * 0.5 + viewportW * 0.5);
    const foregroundSlackY = Math.max(0, foregroundParallax - 1) * (world.h * 0.5 + viewportH * 0.5);
    const backgroundSlackX = Math.max(0, 1 - backgroundParallax) * (world.w * 0.5 + viewportW * 0.5);
    const backgroundSlackY = Math.max(0, 1 - backgroundParallax) * (world.h * 0.5 + viewportH * 0.5);

    // The live cave mask is a viewport overlay and therefore continues beyond
    // the authored level rectangle when the camera sees outside the playable
    // area. A finite baked foreground texture must include that safety skirt;
    // otherwise the absent texture edge shows as a hard rectangle in a slightly
    // different background color. Keep this in the experimental bake box rather
    // than making normal render features serve the chunked path.
    const paddingX = Math.ceil(viewportW + Math.max(foregroundSlackX, backgroundSlackX) + 8);
    const paddingY = Math.ceil(viewportH + Math.max(foregroundSlackY, backgroundSlackY) + 8);
    return {
        x: Math.floor(bounds.x - paddingX),
        y: Math.floor(bounds.y - paddingY),
        w: Math.max(1, Math.ceil(bounds.w + paddingX * 2)),
        h: Math.max(1, Math.ceil(bounds.h + paddingY * 2))
    };
}

function staticLayerBakeFinalizeBounds(bounds) {
    if (!bounds) return null;
    const margin = 4;
    const x = Math.floor(bounds.x - margin);
    const y = Math.floor(bounds.y - margin);
    const maxX = Math.ceil(bounds.x + bounds.w + margin);
    const maxY = Math.ceil(bounds.y + bounds.h + margin);
    return {
        x,
        y,
        w: Math.max(1, maxX - x),
        h: Math.max(1, maxY - y)
    };
}

function staticLayerBakeStateBounds(state, view = null) {
    const worldBounds = staticLayerBakeWorldBounds(state?.world?.bounds);
    const visuals = Array.isArray(state?.world?.visuals) ? state.world.visuals : [];
    const withVisuals = staticLayerBakeBoundsIncludeVisuals(worldBounds, visuals);
    const withCave = staticLayerBakeBoundsIncludeCaveFullBlack(withVisuals, state?.world?.caveWindow);
    const withParallaxSkirt = staticLayerBakeExpandedForViewportParallax(withCave, state, view);
    return staticLayerBakeFinalizeBounds(withParallaxSkirt);
}

function staticLayerBakeBoundsKey(bounds) {
    if (!bounds) return "";
    return `${bounds.x.toFixed(3)},${bounds.y.toFixed(3)},${bounds.w},${bounds.h}`;
}

function staticLayerBakeLayerSurfaces(layer) {
    if (!layer) return [];
    if (Array.isArray(layer.chunks)) return layer.chunks;
    return layer.canvas ? [layer] : [];
}

function staticLayerBakeSurfaceWidth(surface) {
    return Math.max(1, Number(surface?.width) || Number(surface?.canvas?.width) || 1);
}

function staticLayerBakeSurfaceHeight(surface) {
    return Math.max(1, Number(surface?.height) || Number(surface?.canvas?.height) || 1);
}

function staticLayerBakeSurfaceCount(layers) {
    if (!layers) return 0;
    let count = 0;
    for (const layer of Object.values(layers)) {
        count += staticLayerBakeLayerSurfaces(layer).length;
    }
    return count;
}

function staticLayerBakeChunkSize(webglTextureLimit = 0) {
    const textureLimit = Math.max(1, Math.floor(Number(webglTextureLimit) || STATIC_LAYER_BAKE_WEBGL_CHUNK_SIZE));
    return Math.max(256, Math.min(STATIC_LAYER_BAKE_WEBGL_CHUNK_SIZE, STATIC_LAYER_BAKE_MAX_DIMENSION, textureLimit));
}

const STATIC_LAYER_BAKE_DISABLED_STATUS = "disabled by ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER";
const STATIC_LAYER_BAKE_VISUAL_CLASSIFICATION = Object.freeze({
    STATIC: "static",
    DYNAMIC: "dynamic"
});

function classifyStaticLayerBakeVisual(visual) {
    // Conservative attic-gnome rule: this experimental mode may only bake visuals
    // that are plainly static. Do not reshape the normal renderer or authored
    // visual schema for this path without asking the project owner first.
    if (!visual || visual.entityId || visual.dynamicPosition || visual.movement) {
        return STATIC_LAYER_BAKE_VISUAL_CLASSIFICATION.DYNAMIC;
    }
    return STATIC_LAYER_BAKE_VISUAL_CLASSIFICATION.STATIC;
}

function visualCanBeBakedStatic(visual) {
    return classifyStaticLayerBakeVisual(visual) === STATIC_LAYER_BAKE_VISUAL_CLASSIFICATION.STATIC;
}

function visualIsBakedDynamic(visual) {
    return classifyStaticLayerBakeVisual(visual) === STATIC_LAYER_BAKE_VISUAL_CLASSIFICATION.DYNAMIC;
}

function rendererNowMs() {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
        return performance.now();
    }
    return Date.now();
}

function yieldRendererPreparationFrame() {
    return new Promise((resolve) => {
        let settled = false;
        const finish = () => {
            if (settled) return;
            settled = true;
            resolve();
        };
        setTimeout(finish, 16);
        if (typeof requestAnimationFrame === "function") {
            requestAnimationFrame(finish);
        }
    });
}

function hexColorRgb(value) {
    const match = /^#([0-9a-f]{6})$/i.exec(String(value || "").trim());
    if (!match) return null;
    return {
        r: parseInt(match[1].slice(0, 2), 16),
        g: parseInt(match[1].slice(2, 4), 16),
        b: parseInt(match[1].slice(4, 6), 16)
    };
}

export function computeTimedTextViewportLayout(
    contentHeight,
    viewportHeight,
    phaseTime = 0,
    duration = 1,
    characterCount = 0,
    charactersPerSecond = STORY_READING_CHARACTERS_PER_SECOND
) {
    const safeContentHeight = Math.max(0, Number(contentHeight) || 0);
    const safeViewportHeight = Math.max(1, Number(viewportHeight) || 1);
    const maxScroll = Math.max(0, safeContentHeight - safeViewportHeight);
    if (maxScroll <= 0.5) {
        return {
            centered: true,
            contentOffset: Math.max(0, (safeViewportHeight - safeContentHeight) * 0.5),
            maxScroll: 0,
            progress: 0,
            scrollOffset: 0,
            scrollStartTime: 0,
            scrollEndTime: 0
        };
    }

    const safeDuration = Math.max(0.25, Number(duration) || 1);
    const safeCharacterCount = Math.max(1, Number(characterCount) || 1);
    const safeRate = Math.max(0.1, Number(charactersPerSecond) || STORY_READING_CHARACTERS_PER_SECOND);
    const readingSeconds = safeCharacterCount / safeRate;
    const initialMidpointFraction = clamp((safeViewportHeight * 0.5) / safeContentHeight, 0, 1);
    const finalMidpointFraction = clamp((maxScroll + safeViewportHeight * 0.5) / safeContentHeight, 0, 1);
    const scrollStartTime = STORY_READING_START_DELAY_SECONDS + readingSeconds * initialMidpointFraction;
    const scrollEndTime = Math.min(
        safeDuration,
        STORY_READING_START_DELAY_SECONDS + readingSeconds * finalMidpointFraction
    );
    const progress = clamp(
        ((Number(phaseTime) || 0) - scrollStartTime) / Math.max(0.001, scrollEndTime - scrollStartTime),
        0,
        1
    );
    const scrollOffset = maxScroll * progress;
    return {
        centered: false,
        contentOffset: -scrollOffset,
        maxScroll,
        progress,
        scrollOffset,
        scrollStartTime,
        scrollEndTime
    };
}

export function computeResponsiveViewportMetrics(clientWidth, clientHeight, dpr = 1, minVirtualWidth = MIN_TOUCH_VIEWPORT_WIDTH) {
    const safeClientWidth = Math.max(1, Number(clientWidth) || 1);
    const safeClientHeight = Math.max(1, Number(clientHeight) || 1);
    const safeDpr = Math.max(1, Math.min(2.5, Number(dpr) || 1));
    const safeMinVirtualWidth = Math.max(1, Number(minVirtualWidth) || 1);
    const cssScale = safeClientWidth < safeMinVirtualWidth ? safeClientWidth / safeMinVirtualWidth : 1;
    const virtualWidth = safeClientWidth / cssScale;
    const virtualHeight = safeClientHeight / cssScale;
    const backingWidth = Math.max(1, Math.floor(safeClientWidth * safeDpr));
    const backingHeight = Math.max(1, Math.floor(safeClientHeight * safeDpr));

    return {
        backingWidth,
        backingHeight,
        clientWidth: safeClientWidth,
        clientHeight: safeClientHeight,
        virtualWidth,
        virtualHeight,
        dpr: safeDpr,
        cssScale,
        zoom: safeDpr * cssScale,
        minVirtualWidth: safeMinVirtualWidth
    };
}

export function computeThoughtBubblePlacement({
    speakerX,
    speakerY,
    bubbleWidth,
    bubbleHeight,
    viewportWidth,
    viewportHeight,
    zoom = 1,
    dpr = 1
}) {
    const safeZoom = Math.max(0.01, Number(zoom) || 1);
    const safeDpr = Math.max(1, Number(dpr) || 1);
    const w = Math.max(1, Number(bubbleWidth) || 1);
    const h = Math.max(1, Number(bubbleHeight) || 1);
    // The painted circles trail diagonally down-left. The speaker belongs at the
    // extrapolated end of that trail, not on top of the lowest painted puff.
    // Using the puff itself as the anchor made the trail visually point past
    // Ignatius toward the lower-left corner.
    const tailLocalX = w * -0.035;
    const tailLocalY = h * 1.020;
    const marginX = 14 * safeDpr;
    const marginTop = 12 * safeDpr;
    const marginBottom = 42 * safeDpr;
    const maxX = Math.max(marginX, (Number(viewportWidth) || w) - w - marginX);
    const maxY = Math.max(marginTop, (Number(viewportHeight) || h) - h - marginBottom);
    const x = clamp((Number(speakerX) || 0) - tailLocalX, marginX, maxX);
    const y = clamp((Number(speakerY) || 0) - tailLocalY - 5 * safeZoom, marginTop, maxY);
    return {
        x,
        y,
        tailX: x + tailLocalX,
        tailY: y + tailLocalY
    };
}

export function probeWebGL2RendererSupport(ownerDocument) {
    if (!ownerDocument?.createElement) return false;
    const probeCanvas = ownerDocument.createElement("canvas");
    if (!probeCanvas?.getContext) return false;
    probeCanvas.width = 2;
    probeCanvas.height = 2;
    const backend = createWebGL2RendererBackend(probeCanvas);
    if (!backend) return false;
    backend.dispose();
    return true;
}

export async function createRenderer(canvas, options = {}) {
    const preferWebGL2 = options.preferWebGL2 === true;
    pixmapPyramidsEnabled = options.usePixmapPyramids !== false;
    const ownerDocument = canvas?.ownerDocument || (typeof document !== "undefined" ? document : null);
    const webglProbePassed = preferWebGL2 && probeWebGL2RendererSupport(ownerDocument);
    const webglBackend = webglProbePassed ? createWebGL2RendererBackend(canvas) : null;
    let renderCanvas = canvas;
    if (webglBackend) {
        renderCanvas = ownerDocument.createElement("canvas");
    }
    // Keep production presentation synchronized with the browser compositor.
    // Chromium on Android may expose partially reset or still-rasterizing canvas
    // buffers when the low-latency desynchronized hint is enabled, producing
    // white Canvas2D flashes or black WebGL presentation frames.
    const ctx = renderCanvas.getContext("2d", {
        alpha: Boolean(webglBackend),
        desynchronized: false
    });
    if (!ctx) {
        throw new Error("Could not create the renderer's Canvas 2D drawing context.");
    }
    const onProgress = typeof options.onProgress === "function" ? options.onProgress : () => {};
    const hasExplicitEnvironmentManifestUrls = Array.isArray(options.environmentAtlasManifestUrls);
    const environmentManifestUrls = hasExplicitEnvironmentManifestUrls
        ? options.environmentAtlasManifestUrls.map(String).filter(Boolean)
        : [];
    const environmentCandidates = hasExplicitEnvironmentManifestUrls
        ? environmentManifestUrls.map((url) => ({ url }))
        : ENVIRONMENT_ATLAS_MANIFEST_CANDIDATES;
    const configuredEnemyCharacterUrls = Array.isArray(options.enemyCharacterUrls)
        ? [...new Set(options.enemyCharacterUrls.map(String).filter(Boolean))]
        : [];
    const enemyCharacterUrls = configuredEnemyCharacterUrls.length
        ? configuredEnemyCharacterUrls
        : KNOWN_ENEMY_CHARACTER_URLS;
    const projectSpecs = [
        { key: "player", url: DEFAULT_CHARACTER_URL, required: true, weight: 2 },
        ...enemyCharacterUrls.map((url, index) => ({
            key: `enemy_${index + 1}`,
            url,
            required: false,
            weight: 2
        }))
    ];
    const taskWeights = new Map();
    for (const spec of projectSpecs) {
        taskWeights.set(spec.key, spec.weight);
    }
    for (const candidate of environmentCandidates) {
        taskWeights.set(`atlas:${candidate.url}`, 1);
    }
    const taskProgress = new Map([...taskWeights.keys()].map((key) => [key, 0]));
    const totalWeight = [...taskWeights.values()].reduce((sum, weight) => sum + weight, 0) || 1;
    const reportTaskProgress = (key, progress, label) => {
        taskProgress.set(key, clamp(Number(progress) || 0, 0, 1));
        const weightedProgress = [...taskWeights.entries()].reduce(
            (sum, [taskKey, weight]) => sum + weight * (taskProgress.get(taskKey) || 0),
            0
        );
        onProgress({
            progress: clamp((weightedProgress / totalWeight) * 0.92, 0, 0.92),
            label: String(label || "Loading game assets")
        });
    };

    const projectJobs = projectSpecs.map(async (spec) => {
        try {
            const project = await loadRuntimeCharacterProject(spec.url, {
                usePixmapPyramids: pixmapPyramidsEnabled,
                onProgress: ({ progress, label }) => reportTaskProgress(spec.key, progress, label)
            });
            reportTaskProgress(spec.key, 1, `Prepared ${project.displayName}`);
            return { spec, project };
        } catch (error) {
            reportTaskProgress(spec.key, 1, `Skipped unavailable character ${spec.url}`);
            if (spec.required) {
                throw error;
            }
            console.warn(`Optional runtime character could not be loaded: ${spec.url}`, error);
            return { spec, project: null };
        }
    });
    const environmentJob = loadEnvironmentAtlases({
        candidates: environmentCandidates,
        onProgress: ({ url, progress, label }) => reportTaskProgress(`atlas:${url}`, progress, label)
    });
    const [projectResults, environmentAtlases] = await Promise.all([
        Promise.all(projectJobs),
        environmentJob
    ]);

    const playerProject = projectResults.find((result) => result.spec.key === "player")?.project;
    if (!playerProject) {
        throw new Error(`Required runtime character could not be loaded: ${DEFAULT_CHARACTER_URL}`);
    }
    playerProject.rig = normalizeRigConfig(playerProject.rig);
    const characterProjects = new Map();
    for (const result of projectResults) {
        if (!result.project) continue;
        for (const asset of result.project.assets.values()) {
            asset.hitFlashCanvas = makeTintedSpriteCanvas(asset.canvas, "#ffffff");
            pixmapPyramidFor(asset.hitFlashCanvas);
            if (result.project === playerProject) {
                asset.lowHealthCanvas = makeTintedSpriteCanvas(asset.canvas, "#f04b45");
                asset.shieldCanvas = makeTintedSpriteCanvas(asset.canvas, "#008cff");
                pixmapPyramidFor(asset.lowHealthCanvas);
                pixmapPyramidFor(asset.shieldCanvas);
            }
        }
        characterProjects.set(result.project.characterId, result.project);
    }
    const renderer = new RocketfrockRenderer(
        renderCanvas,
        ctx,
        playerProject,
        environmentAtlases,
        characterProjects,
        [...environmentAtlases.values()].map((atlas) => atlas.manifestUrl).filter(Boolean),
        {
            displayCanvas: canvas,
            webglBackend,
            onStaticBakeFailure: options.onStaticBakeFailure
        }
    );
    onProgress({ progress: 0.93, label: "Loading wizard powered-rocket atlas" });
    await renderer.prewarmWrenchRocketGlows(({ completed, total, label }) => {
        const fraction = total > 0 ? completed / total : 1;
        onProgress({
            progress: 0.93 + fraction * 0.06,
            label
        });
    });
    onProgress({ progress: 1, label: "Game assets ready" });
    return renderer;
}

class RocketfrockRenderer {
    constructor(
        canvas,
        ctx,
        playerProject,
        environmentAtlases = new Map(),
        characterProjects = new Map(),
        environmentManifestUrls = [],
        options = {}
    ) {
        this.canvas = canvas;
        this.displayCanvas = options.displayCanvas || canvas;
        this.ctx = ctx;
        this.webglBackend = options.webglBackend || null;
        this.renderBackend = this.webglBackend ? "webgl2-resident" : "canvas2d";
        this.onStaticBakeFailure = typeof options.onStaticBakeFailure === "function" ? options.onStaticBakeFailure : null;
        this.playerProject = playerProject;
        this.assets = playerProject.assets;
        this.rigConfig = playerProject.rig;
        this.character = playerProject.character;
        this.animations = playerProject.animations;
        this.characterProjects = characterProjects;
        this.environmentAtlases = environmentAtlases;
        this.environmentManifestUrls = new Set((environmentManifestUrls || []).map(String));
        this.environmentColorMap = normalizeLevelColorMap(null);
        this.environmentColorMapKey = "";
        this.caveWindow = null;
        this.caveWindowMaskCanvas = null;
        this.caveWindowMaskKey = "";
        this.caveWindowGpuMaskGeometry = null;
        this.worldVisualCache = buildWorldVisualCache([]);
        this.overlapBlendCache = {
            source: null,
            sourceLength: 0,
            colorMapKey: "",
            groups: [],
            memberToGroup: new Map()
        };
        this.foregroundSpriteCache = new Map();
        this.layerBrightnessCache = new Map();
        this.powerUpTintCache = new Map();
        this.smokeStampCache = new Map();
        this.webglParticleSpriteCache = new Map();
        this.webglTextSpriteCache = new Map();
        this.frameBackgroundOffset = { x: 0, y: 0 };
        this.frameForegroundParallax = normalizeForegroundParallax(undefined);
        this.frameForegroundOffset = { x: 0, y: 0 };
        this.frameEntityVisibility = { collectedPickups: new Set(), defeatedEnemies: new Set() };
        this.framePlayerRocketTransform = null;
        this.frameVisualCounters = this.createVisualCounters();
        this.frameRenderBreakdown = this.createRenderBreakdown();
        this.frameDrawnBlendGroups = new Set();
        this.frameHandledProjectileIds = new Set();
        this.worldVisualQueryScratch = {
            background: createWorldVisualQueryScratch(),
            main: createWorldVisualQueryScratch(),
            actorFront: createWorldVisualQueryScratch(),
            caveForeground: createWorldVisualQueryScratch()
        };
        this.staticTileQueryScratch = {
            background: createWorldVisualQueryScratch(),
            main: createWorldVisualQueryScratch(),
            actorFront: createWorldVisualQueryScratch(),
            caveForeground: createWorldVisualQueryScratch()
        };
        this.performanceDiagnostics = {
            backend: this.renderBackend,
            gpuDrawCalls: 0,
            gpuQuads: 0,
            gpuTextureUploads: 0,
            gpuTextureUpdates: 0,
            gpuCanvasLayerUploads: 0,
            gpuTextureCount: 0,
            gpuResidentTextureBytes: 0,
            gpuContextLost: false,
            frameMs: 0,
            averageFrameMs: 0,
            worldMs: 0,
            actorsMs: 0,
            foregroundMs: 0,
            maskMs: 0,
            overlayMs: 0,
            clearBackdropMs: 0,
            backgroundMs: 0,
            worldVisualsMs: 0,
            worldGeometryMs: 0,
            portalMs: 0,
            observedFps: 0,
            visualsConsidered: 0,
            visualsDrawn: 0,
            visualsCulled: 0,
            visualsSpatialCulled: 0,
            foregroundCacheHits: 0,
            foregroundCacheMisses: 0,
            dynamicConsidered: 0,
            dynamicDrawn: 0,
            dynamicCulled: 0,
            maskReused: false,
            staticBakeAvailable: ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER,
            staticBakeEnabled: false,
            staticBakeReady: false,
            staticBakeUsed: false,
            staticBakeBytes: 0,
            staticBakeBuildMs: 0,
            staticBakeDrawMs: 0,
            staticBakeChunks: 0,
            staticBakeMode: "off",
            staticBakeLastInvalidationReason: "",
            staticBakeStatus: ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER ? "off" : STATIC_LAYER_BAKE_DISABLED_STATUS
        };
        this.phase = 0;
        this.forcePhase = null;
        this.visualPose = null;
        this.lastAnimationDiagnostics = null;
        this.lastVisualPoseMode = null;
        this.lastRenderDt = 1 / 60;
        this.lastObservedFrameDt = 1 / 60;
        this.lastRenderStartedAtMs = 0;
        this.viewport = { w: canvas.width, h: canvas.height, dpr: 1 };
        this.viewOverride = null;
        this.lastBounds = null;
        this.lastCharacterDraws = [];
        this.scorePopupState = null;
        this.scorePopups = [];
        this.processedScoreEventKeys = new Set();
        this.processedScoreEventOrder = [];
        this.actorShadowOpacity = new WeakMap();
        this.staticLayerBake = {
            enabled: false,
            selectedMode: "off",
            cache: null,
            tileCache: null,
            key: "",
            lastError: "",
            status: ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER ? "off" : STATIC_LAYER_BAKE_DISABLED_STATUS,
            lastInvalidationReason: "",
            lastBuildMs: 0,
            lastDrawMs: 0,
            lastUsed: false,
            bytes: 0,
            chunkCount: 0,
            mode: "off",
            fullLayout: "",
            failureCount: 0
        };
        this.staticTileWorker = null;
        this.staticTileWorkerGeneration = 1;
        this.staticTileWorkerBusyTaskId = 0;
        this.staticTileTaskCounter = 0;
        this.staticTileSourceCounter = 0;
        this.staticTileSourceObjectIds = new WeakMap();
        this.staticTileSourceDescriptors = new Map();
        this.staticTileRegisteredSources = new Set();
        this.staticTilePreparationToken = 0;
    }

    getEnvironmentManifests() {
        return this.environmentAtlases;
    }

    async prewarmWrenchRocketGlows(onProgress = () => {}) {
        const frameIds = WRENCH_POWER_UP_EFFECT_IDS
            .map((effectId) => wrenchRocketGlowAtlasFrameId(effectId))
            .filter(Boolean);
        if (!frameIds.length) {
            onProgress({ completed: 0, total: 0, label: "No wrench rocket glows required" });
            return 0;
        }
        for (let index = 0; index < frameIds.length; index += 1) {
            await yieldRendererPreparationFrame();
            const frameId = frameIds[index];
            const asset = this.getCharacterAtlasFrame("ct_char_wizard_1", frameId);
            if (!asset?.canvas) {
                throw new Error(`Required wizard projectile glow frame is missing: ${frameId}.`);
            }
            onProgress({
                completed: index + 1,
                total: frameIds.length,
                label: `Checking wrench powered-rocket atlas ${index + 1} / ${frameIds.length}`
            });
        }
        return frameIds.length;
    }

    prewarmWebGLTextures() {
        const backend = this.webglBackend;
        if (!backend?.available) return 0;
        const sources = new Set();
        const add = (source) => {
            if (source) sources.add(source);
        };
        for (const atlas of this.environmentAtlases.values()) {
            add(atlas?.renderImage || atlas?.image);
        }
        for (const project of this.characterProjects.values()) {
            add(project?.image);
            for (const atlas of project?.supplementalAtlases?.values?.() || []) {
                add(atlas?.image);
            }
            for (const asset of project?.assets?.values?.() || []) {
                add(asset?.image || asset?.canvas);
                add(asset?.hitFlashCanvas);
                add(asset?.lowHealthCanvas);
                add(asset?.shieldCanvas);
            }
        }
        for (const kind of [
            "softGlow",
            "ring",
            "musketBall",
            "rock",
            "shadow",
            "targetDisc",
            "pickupDisc",
            "rocketFlame",
            "diamond",
            "crossSpark",
            "solidDisc"
        ]) {
            add(this.getWebGLParticleSpriteCanvas(kind));
        }
        add(this.getSmokeStampCanvas());
        return backend.replacePinnedTextures([...sources]);
    }

    createVisualCounters() {
        return {
            considered: 0,
            drawn: 0,
            culled: 0,
            spatialCulled: 0,
            foregroundCacheHits: 0,
            foregroundCacheMisses: 0,
            dynamicConsidered: 0,
            dynamicDrawn: 0,
            dynamicCulled: 0,
            maskReused: false
        };
    }

    createRenderBreakdown() {
        return {
            clearBackdropMs: 0,
            backgroundMs: 0,
            worldVisualsMs: 0,
            worldGeometryMs: 0,
            portalMs: 0
        };
    }

    resetRenderBreakdown(breakdown = this.createRenderBreakdown()) {
        breakdown.clearBackdropMs = 0;
        breakdown.backgroundMs = 0;
        breakdown.worldVisualsMs = 0;
        breakdown.worldGeometryMs = 0;
        breakdown.portalMs = 0;
        return breakdown;
    }

    resetVisualCounters(counters = this.createVisualCounters()) {
        counters.considered = 0;
        counters.drawn = 0;
        counters.culled = 0;
        counters.spatialCulled = 0;
        counters.foregroundCacheHits = 0;
        counters.foregroundCacheMisses = 0;
        counters.dynamicConsidered = 0;
        counters.dynamicDrawn = 0;
        counters.dynamicCulled = 0;
        counters.maskReused = false;
        return counters;
    }

    updateFrameEntityVisibility(state) {
        const collectedPickups = this.frameEntityVisibility.collectedPickups;
        const defeatedEnemies = this.frameEntityVisibility.defeatedEnemies;
        collectedPickups.clear();
        defeatedEnemies.clear();
        for (const item of state.pickups || []) {
            if (item?.collected) collectedPickups.add(item.id);
        }
        for (const item of state.enemies || []) {
            if (Number(item?.health) <= 0) defeatedEnemies.add(item.id);
        }
    }

    copyLastComputedView(view) {
        if (!this.lastComputedView) {
            this.lastComputedView = { w: 0, h: 0, dpr: 1, zoom: 1, virtualW: 0, virtualH: 0, minVirtualW: 0, x: 0, y: 0 };
        }
        this.lastComputedView.w = view.w;
        this.lastComputedView.h = view.h;
        this.lastComputedView.dpr = view.dpr;
        this.lastComputedView.zoom = view.zoom;
        this.lastComputedView.virtualW = view.virtualW;
        this.lastComputedView.virtualH = view.virtualH;
        this.lastComputedView.minVirtualW = view.minVirtualW;
        this.lastComputedView.x = view.x;
        this.lastComputedView.y = view.y;
    }

    worldVisualQueryScratchFor(partitionName) {
        return this.worldVisualQueryScratch[partitionName] || null;
    }

    partitionHasRenderableVisuals(partition) {
        if (!partition) return false;
        if (partition.hasCutout) return true;
        for (const atlasId of partition.atlasIds || []) {
            const atlas = this.environmentAtlases.get(atlasId);
            if (atlas && !atlas.missing && atlas.image) return true;
        }
        return false;
    }

    getPerformanceDiagnostics() {
        return { ...this.performanceDiagnostics };
    }

    getWorldVisualCache(state) {
        const visuals = Array.isArray(state?.world?.visuals) ? state.world.visuals : [];
        if (this.worldVisualCache.source !== visuals || this.worldVisualCache.sourceLength !== visuals.length) {
            this.worldVisualCache = buildWorldVisualCache(visuals);
            this.overlapBlendCache.source = null;
        }
        return this.worldVisualCache;
    }

    ensureOverlapBlendCache(state) {
        const worldCache = this.getWorldVisualCache(state);
        if (
            this.overlapBlendCache.source === worldCache.source &&
            this.overlapBlendCache.sourceLength === worldCache.sourceLength &&
            this.overlapBlendCache.colorMapKey === this.environmentColorMapKey
        ) {
            return this.overlapBlendCache;
        }

        const ownerDocument = this.canvas?.ownerDocument || (typeof document !== "undefined" ? document : null);
        const groups = [];
        const memberToGroup = new Map();
        for (const definition of buildOverlapBlendGroups(worldCache.main)) {
            const baked = createOverlapBlendSurface({
                ownerDocument,
                group: definition,
                environmentAtlases: this.environmentAtlases
            });
            if (!baked) continue;
            const group = {
                id: definition.id,
                layer: definition.layer,
                bounds: baked.bounds,
                canvas: baked.canvas,
                members: baked.members
            };
            groups.push(group);
            for (const visual of group.members) memberToGroup.set(visual, group);
        }

        this.overlapBlendCache = {
            source: worldCache.source,
            sourceLength: worldCache.sourceLength,
            colorMapKey: this.environmentColorMapKey,
            groups,
            memberToGroup
        };
        return this.overlapBlendCache;
    }

    syncCaveWindow(caveWindow) {
        this.caveWindow = caveWindow && typeof caveWindow === "object" ? caveWindow : null;
        this.caveWindowMaskKey = "";
        this.caveWindowGpuMaskGeometry = buildCaveWindowGpuMaskGeometry(this.caveWindow);
        for (const surface of this.foregroundSpriteCache.values()) {
            this.webglBackend?.invalidateTexture(surface);
        }
        this.foregroundSpriteCache.clear();
        this.invalidateStaticLayerBake("cave window changed");
        return this.caveWindow;
    }

    async ensureEnvironmentAtlases(manifestUrls = [], options = {}) {
        const requestedUrls = [...new Set((manifestUrls || []).map(String).filter(Boolean))];
        const missingUrls = requestedUrls.filter((url) => !this.environmentManifestUrls.has(url));
        if (!missingUrls.length) {
            options.onProgress?.({ progress: 1, label: "Level atlases already loaded" });
            return false;
        }
        const loaded = await loadEnvironmentAtlases({
            candidates: missingUrls.map((url) => ({ url })),
            onProgress: ({ progress, label }) => options.onProgress?.({ progress, label })
        });
        for (const [atlasId, atlas] of loaded) {
            this.environmentAtlases.set(atlasId, atlas);
        }
        for (const atlas of loaded.values()) {
            if (atlas.manifestUrl) {
                this.environmentManifestUrls.add(atlas.manifestUrl);
            }
        }
        this.environmentColorMapKey = "";
        this.foregroundSpriteCache.clear();
        for (const surface of this.layerBrightnessCache.values()) this.webglBackend?.invalidateTexture(surface);
        this.layerBrightnessCache.clear();
        this.overlapBlendCache.source = null;
        this.syncEnvironmentColorMap(this.environmentColorMap);
        this.invalidateStaticLayerBake("level atlases changed");
        return loaded.size > 0;
    }

    prewarmLevelPresentationCaches(world) {
        const visuals = Array.isArray(world?.visuals) ? world.visuals : [];
        const warmedBackgroundAtlases = new Set();
        let backgroundAtlases = 0;
        for (const visual of visuals) {
            if (!isWorldBackgroundVisual(visual)) continue;
            const brightness = normalizeLayerBrightness(visual.backgroundBrightness);
            if (Math.abs(brightness - 1) < 0.000001) continue;
            const atlas = this.environmentAtlases.get(visual.atlasId);
            if (!atlas || atlas.missing || !atlas.image) continue;
            const key = `${atlas.atlasId || atlas.id || visual.atlasId}|${brightness.toFixed(4)}`;
            if (warmedBackgroundAtlases.has(key)) continue;
            warmedBackgroundAtlases.add(key);
            this.getLayerBrightnessAtlas(atlas, brightness, "background");
            backgroundAtlases += 1;
        }
        return { backgroundAtlases };
    }

    supportsExperimentalStaticLayerBakeRenderer() {
        return ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER === true;
    }

    resetStaticLayerBakeBookkeeping(status = "off") {
        this.staticLayerBake.cache = null;
        this.staticLayerBake.tileCache = null;
        this.staticLayerBake.key = "";
        this.staticLayerBake.bytes = 0;
        this.staticLayerBake.lastBuildMs = 0;
        this.staticLayerBake.lastDrawMs = 0;
        this.staticLayerBake.chunkCount = 0;
        this.staticLayerBake.mode = this.staticLayerBake.selectedMode || "off";
        this.staticLayerBake.fullLayout = "";
        this.staticLayerBake.lastUsed = false;
        this.staticLayerBake.status = status;
    }

    setStaticLayerBakeMode(mode) {
        const nextMode = ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER
            ? normalizeStaticTileBakeMode(mode, "off")
            : "off";
        if (this.staticLayerBake.selectedMode === nextMode) {
            return this.getStaticLayerBakeStatus();
        }
        this.releaseStaticLayerBakeCache();
        this.releaseStaticTileBakeCache();
        this.staticLayerBake.selectedMode = nextMode;
        this.staticLayerBake.enabled = nextMode !== "off";
        this.staticLayerBake.lastError = "";
        this.staticLayerBake.lastInvalidationReason = nextMode === "off" ? "disabled" : "";
        this.resetStaticLayerBakeBookkeeping(
            !ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER
                ? STATIC_LAYER_BAKE_DISABLED_STATUS
                : (nextMode === "off" ? "off" : `${nextMode}; awaiting bake`)
        );
        return this.getStaticLayerBakeStatus();
    }

    setStaticLayerBakeEnabled(enabled) {
        return this.setStaticLayerBakeMode(enabled === true ? "full" : "off");
    }

    isStaticLayerBakeEnabled() {
        return ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER && this.staticLayerBake.selectedMode !== "off";
    }

    isFullStaticLayerBakeEnabled() {
        return ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER && this.staticLayerBake.selectedMode === "full";
    }

    isStaticTileBakeEnabled() {
        return ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER && this.staticLayerBake.selectedMode === "tiles";
    }

    releaseStaticLayerBakeCache(cache = this.staticLayerBake.cache) {
        const layers = cache?.layers || null;
        if (!layers) return;
        for (const layer of Object.values(layers)) {
            for (const surface of staticLayerBakeLayerSurfaces(layer)) {
                if (!surface?.canvas) continue;
                this.webglBackend?.invalidateTexture(surface.canvas);
                // A 1x1 shrink is the strongest practical browser hint that a
                // discarded full-level or chunk canvas may release its backing store.
                surface.canvas.width = 1;
                surface.canvas.height = 1;
                surface.context = null;
            }
        }
    }

    closeStaticTileBitmap(bitmap) {
        try {
            bitmap?.close?.();
        } catch {
            // Best-effort release for transferred ImageBitmaps.
        }
    }

    resetStaticTileWorkerSources() {
        this.staticTileWorkerGeneration += 1;
        this.staticTilePreparationToken += 1;
        this.staticTileWorkerBusyTaskId = 0;
        this.staticTileSourceCounter = 0;
        this.staticTileSourceObjectIds = new WeakMap();
        this.staticTileSourceDescriptors.clear();
        this.staticTileRegisteredSources.clear();
        try {
            this.staticTileWorker?.postMessage?.({ type: "reset", generation: this.staticTileWorkerGeneration });
        } catch {
            // The worker may already have been torn down after an error.
        }
    }

    releaseStaticTileBakeCache(cache = this.staticLayerBake.tileCache) {
        if (!cache) {
            this.resetStaticTileWorkerSources();
            return;
        }
        for (const record of cache.records?.values?.() || []) {
            this.closeStaticTileBitmap(record.bitmap);
            record.bitmap = null;
        }
        for (const completed of cache.completed || []) {
            this.closeStaticTileBitmap(completed?.bitmap);
        }
        for (const page of cache.pages || []) {
            if (page?.source) this.webglBackend?.invalidateTexture(page.source);
        }
        cache.records?.clear?.();
        cache.completed = [];
        cache.pages = [];
        this.resetStaticTileWorkerSources();
    }

    invalidateStaticLayerBake(reason = "invalidated") {
        this.releaseStaticLayerBakeCache();
        this.releaseStaticTileBakeCache();
        const normalizedReason = String(reason || "invalidated");
        this.staticLayerBake.lastInvalidationReason = normalizedReason;
        this.resetStaticLayerBakeBookkeeping(this.isStaticLayerBakeEnabled() ? normalizedReason : "off");
    }

    disableStaticLayerBakeAfterFailure(detail = "bake allocation failed", error = null) {
        const detailText = String(detail || error?.message || error || "bake allocation failed");
        const failedMode = this.staticLayerBake.selectedMode || "off";
        const userMessage = failedMode === "tiles"
            ? "Tile baking could not continue. Falling back to normal rendering."
            : "Could not allocate memory for full baked layers. Falling back to normal rendering.";
        this.releaseStaticLayerBakeCache(this.staticLayerBake.cache);
        this.releaseStaticTileBakeCache(this.staticLayerBake.tileCache);
        this.staticLayerBake.enabled = false;
        this.staticLayerBake.selectedMode = "off";
        this.staticLayerBake.cache = null;
        this.staticLayerBake.tileCache = null;
        this.staticLayerBake.key = "";
        this.staticLayerBake.bytes = 0;
        this.staticLayerBake.chunkCount = 0;
        this.staticLayerBake.mode = "off";
        this.staticLayerBake.fullLayout = "";
        this.staticLayerBake.lastBuildMs = 0;
        this.staticLayerBake.lastDrawMs = 0;
        this.staticLayerBake.lastUsed = false;
        this.staticLayerBake.failureCount = (Number(this.staticLayerBake.failureCount) || 0) + 1;
        this.staticLayerBake.lastInvalidationReason = `disabled after ${failedMode} bake failure`;
        this.staticLayerBake.lastError = `${userMessage} ${detailText}`;
        this.staticLayerBake.status = this.staticLayerBake.lastError;
        if (this.onStaticBakeFailure) {
            try {
                this.onStaticBakeFailure({
                    message: userMessage,
                    detail: detailText,
                    error,
                    failedMode,
                    status: this.getStaticLayerBakeStatus()
                });
            } catch (callbackError) {
                console.warn("Static layer bake failure callback failed.", callbackError);
            }
        }
        return null;
    }

    getStaticLayerBakeStatus() {
        const cache = this.staticLayerBake.cache;
        const tileCache = this.staticLayerBake.tileCache;
        const readyTileCount = tileCache
            ? [...tileCache.records.values()].filter((record) => record.state === "ready" || record.state === "empty").length
            : 0;
        const residentTileCount = tileCache
            ? [...tileCache.records.values()].filter((record) => record.state === "ready" && !record.empty).length
            : 0;
        return {
            available: ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER === true,
            enabled: this.isStaticLayerBakeEnabled(),
            ready: this.staticLayerBake.selectedMode === "tiles" ? readyTileCount > 0 : Boolean(cache),
            used: this.staticLayerBake.lastUsed === true,
            bytes: Math.max(0, Number(this.staticLayerBake.bytes) || 0),
            width: Math.max(0, Number(cache?.width) || 0),
            height: Math.max(0, Number(cache?.height) || 0),
            buildMs: Math.max(0, Number(this.staticLayerBake.lastBuildMs) || 0),
            drawMs: Math.max(0, Number(this.staticLayerBake.lastDrawMs) || 0),
            chunks: Math.max(0, Number(this.staticLayerBake.chunkCount) || 0),
            mode: this.staticLayerBake.selectedMode || "off",
            fullLayout: this.staticLayerBake.fullLayout || "",
            tilesReady: readyTileCount,
            tilesResident: residentTileCount,
            tilePages: tileCache?.pages?.length || 0,
            failures: Math.max(0, Number(this.staticLayerBake.failureCount) || 0),
            lastInvalidationReason: this.staticLayerBake.lastInvalidationReason || "",
            status: ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER
                ? (this.staticLayerBake.lastError || this.staticLayerBake.status || "off")
                : STATIC_LAYER_BAKE_DISABLED_STATUS
        };
    }

    getRuntimeCharacterProjects() {
        return new Map(this.characterProjects);
    }

    syncEnvironmentColorMap(value) {
        const colorMap = normalizeLevelColorMap(value);
        const cacheKey = colorMapCacheKey(colorMap);
        if (cacheKey === this.environmentColorMapKey) {
            return false;
        }
        this.environmentColorMap = colorMap;
        this.environmentColorMapKey = cacheKey;
        this.foregroundSpriteCache.clear();
        for (const surface of this.layerBrightnessCache.values()) this.webglBackend?.invalidateTexture(surface);
        this.layerBrightnessCache.clear();
        this.overlapBlendCache.source = null;
        for (const atlas of this.environmentAtlases.values()) {
            if (!atlas?.image) {
                continue;
            }
            atlas.renderImage = createColorMappedCanvas(atlas.image, colorMap, undefined, atlas.id);
            atlas.colorMapCacheKey = cacheKey;
        }
        this.prewarmWebGLTextures();
        this.invalidateStaticLayerBake("environment colour map changed");
        return true;
    }

    resize() {
        // Mobile browser chrome and fullscreen transitions can briefly report a
        // zero-sized client box. Resizing a visible canvas to 1x1 clears its
        // backing store immediately, so retain the last valid CSS dimensions
        // until the layout reports a usable size again.
        const measuredClientWidth = Number(this.displayCanvas.clientWidth) || 0;
        const measuredClientHeight = Number(this.displayCanvas.clientHeight) || 0;
        const clientWidth = measuredClientWidth >= 2
            ? measuredClientWidth
            : Math.max(1, Number(this.viewport.clientW) || Number(this.displayCanvas.width) || 1);
        const clientHeight = measuredClientHeight >= 2
            ? measuredClientHeight
            : Math.max(1, Number(this.viewport.clientH) || Number(this.displayCanvas.height) || 1);
        const metrics = computeResponsiveViewportMetrics(
            clientWidth,
            clientHeight,
            typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
        );
        if (this.displayCanvas.width !== metrics.backingWidth || this.displayCanvas.height !== metrics.backingHeight) {
            this.displayCanvas.width = metrics.backingWidth;
            this.displayCanvas.height = metrics.backingHeight;
        }
        if (this.canvas.width !== metrics.backingWidth || this.canvas.height !== metrics.backingHeight) {
            this.canvas.width = metrics.backingWidth;
            this.canvas.height = metrics.backingHeight;
        }
        this.viewport = {
            w: metrics.backingWidth,
            h: metrics.backingHeight,
            dpr: metrics.dpr,
            zoom: metrics.zoom,
            cssScale: metrics.cssScale,
            clientW: metrics.clientWidth,
            clientH: metrics.clientHeight,
            virtualW: metrics.virtualWidth,
            virtualH: metrics.virtualHeight,
            minVirtualW: metrics.minVirtualWidth
        };
    }

    updatePhase(state, dt) {
        if (this.forcePhase !== null) {
            this.phase = this.forcePhase;
            return;
        }
        const runClip = this.animations.get("run");
        const playback = runClip?.playback || {
            idleThreshold: 0.04,
            baseCyclesPerSecond: 0.55,
            speedCyclesPerSecond: 2.6,
            maxSpeedRatio: 1.4
        };
        const speedRatio = Math.min(
            playback.maxSpeedRatio,
            Math.abs(state.player.vx) / Math.max(1, state.tuning.maxRunSpeed)
        );
        if (!state.player.onGround) {
            // Airborne poses are state poses, not a slow copy of the run cycle.
            this.phase = 0;
            return;
        }
        if (speedRatio < playback.idleThreshold) {
            this.phase = 0;
            return;
        }
        const cyclesPerSecond = playback.baseCyclesPerSecond + speedRatio * playback.speedCyclesPerSecond;
        this.phase = (this.phase + dt * cyclesPerSecond * Math.PI * 2) % (Math.PI * 2);
    }

    syncScorePopups(state) {
        if (this.scorePopupState !== state) {
            this.scorePopupState = state;
            this.scorePopups.length = 0;
            this.processedScoreEventKeys.clear();
            this.processedScoreEventOrder.length = 0;
        }
        for (const event of state?.debug?.lastEvents || []) {
            if (event?.type !== "SCORE_CHANGED" || !(Number(event.amount) > 0)) continue;
            if (!Number.isFinite(Number(event.x)) || !Number.isFinite(Number(event.y))) continue;
            const key = `${event.tick}:${event.sourceId || "score"}:${event.score}`;
            if (this.processedScoreEventKeys.has(key)) continue;
            this.processedScoreEventKeys.add(key);
            this.processedScoreEventOrder.push(key);
            this.scorePopups.push({
                x: Number(event.x),
                y: Number(event.y),
                text: `+${Math.floor(Number(event.amount) || 0)}`,
                age: 0,
                duration: 1.35
            });
        }
        while (this.processedScoreEventOrder.length > 96) {
            this.processedScoreEventKeys.delete(this.processedScoreEventOrder.shift());
        }
        const elapsed = Math.max(0, this.lastRenderDt);
        for (const popup of this.scorePopups) popup.age += elapsed;
        this.scorePopups = this.scorePopups.filter((popup) => popup.age < popup.duration);
    }

    drawScorePopups(state, view) {
        this.syncScorePopups(state);
        if (!this.scorePopups.length) return;
        const ctx = this.ctx;
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${Math.max(16, 22 * view.zoom)}px ui-sans-serif, system-ui, sans-serif`;
        ctx.lineJoin = "round";
        for (const popup of this.scorePopups) {
            const ratio = clamp(popup.age / Math.max(0.001, popup.duration), 0, 1);
            const worldY = popup.y - 46 * ratio;
            if (!this.dynamicBoundsVisible({
                minX: popup.x - 60,
                minY: worldY - 24,
                maxX: popup.x + 60,
                maxY: worldY + 24
            }, view, 48)) continue;
            const point = this.worldToScreen(view, popup.x, worldY);
            const fade = ratio < 0.68 ? 1 : 1 - (ratio - 0.68) / 0.32;
            ctx.globalAlpha = clamp(fade, 0, 1);
            ctx.lineWidth = Math.max(2, 4 * view.zoom);
            ctx.strokeStyle = "rgba(24, 12, 34, 0.92)";
            ctx.fillStyle = "rgba(255, 220, 92, 0.98)";
            ctx.strokeText(popup.text, point.x, point.y);
            ctx.fillText(popup.text, point.x, point.y);
            this.markDynamicDrawn();
        }
        ctx.restore();
    }

    getWebGLTextSpriteCanvas(text, fontPx = 22) {
        const key = `${String(text)}|${Math.max(8, Math.round(fontPx))}`;
        const cached = this.webglTextSpriteCache.get(key);
        if (cached) return cached;
        const ownerDocument = this.canvas?.ownerDocument || (typeof document !== "undefined" ? document : null);
        if (!ownerDocument?.createElement) return null;
        const surface = ownerDocument.createElement("canvas");
        const measure = ownerDocument.createElement("canvas").getContext("2d");
        if (!measure) return null;
        measure.font = `bold ${Math.max(8, Math.round(fontPx))}px ui-sans-serif, system-ui, sans-serif`;
        const metrics = measure.measureText(String(text));
        const width = Math.max(8, Math.ceil(metrics.width + fontPx * 0.55));
        const height = Math.max(8, Math.ceil(fontPx * 1.55));
        surface.width = width;
        surface.height = height;
        const context = surface.getContext("2d");
        if (!context) return null;
        context.font = `bold ${Math.max(8, Math.round(fontPx))}px ui-sans-serif, system-ui, sans-serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.lineJoin = "round";
        context.lineWidth = Math.max(2, fontPx * 0.18);
        context.strokeStyle = "rgba(24, 12, 34, 0.92)";
        context.fillStyle = "rgba(255, 220, 92, 0.98)";
        context.strokeText(String(text), width * 0.5, height * 0.52);
        context.fillText(String(text), width * 0.5, height * 0.52);
        this.webglTextSpriteCache.set(key, surface);
        return surface;
    }

    drawScorePopupsWebGL(state, view) {
        const backend = this.webglBackend;
        if (!backend?.available) return;
        this.syncScorePopups(state);
        if (!this.scorePopups.length) return;
        for (const popup of this.scorePopups) {
            const ratio = clamp(popup.age / Math.max(0.001, popup.duration), 0, 1);
            const worldY = popup.y - 46 * ratio;
            if (!this.dynamicBoundsVisible({
                minX: popup.x - 60,
                minY: worldY - 24,
                maxX: popup.x + 60,
                maxY: worldY + 24
            }, view, 48)) continue;
            const point = this.worldToScreen(view, popup.x, worldY);
            const fade = ratio < 0.68 ? 1 : 1 - (ratio - 0.68) / 0.32;
            const sprite = this.getWebGLTextSpriteCanvas(popup.text, 22 * view.zoom);
            if (!sprite) continue;
            backend.queueSprite({
                source: sprite,
                centerX: point.x,
                centerY: point.y,
                width: sprite.width,
                height: sprite.height,
                alpha: clamp(fade, 0, 1)
            });
            this.markDynamicDrawn();
        }
    }

    drawPortalIntroGlowWebGL(state, view) {
        const backend = this.webglBackend;
        const intro = state.story?.portalIntro;
        if (!backend?.available || !intro?.active || intro.phase === "closed") return false;
        const portal = (state.world?.entities || []).find((entity) => entity.id === intro.portalId);
        if (!portal) return false;
        const center = this.worldToScreen(view, Number(portal.x) || 0, (Number(portal.y) || 0) - (Number(portal.h) || 197) * 0.48);
        const radius = Math.max(Number(portal.w) || 150, Number(portal.h) || 197) * 0.55 * view.zoom;
        const pulse = 0.78 + Math.sin(state.clock.time * 8) * 0.12;
        const glow = this.getWebGLParticleSpriteCanvas("softGlow");
        if (!glow) return false;
        return backend.queueSprite({
            source: glow,
            centerX: center.x,
            centerY: center.y,
            width: radius * 2,
            height: radius * 2,
            tint: [154 / 255, 82 / 255, 1, 1],
            alpha: 0.18 * pulse,
            blendMode: "additive"
        });
    }

    render(state, inputFrame, dt) {
        if (this.webglBackend) {
            if (this.webglBackend.available) {
                return this.renderWebGL2(state, inputFrame, dt);
            }
            // A visible canvas that has acquired a WebGL context cannot become
            // a Canvas 2D target. During a transient context loss, keep the
            // hidden staging surface idle and wait for webglcontextrestored.
            // Startup fallback is selected before the visible canvas acquires
            // WebGL, so browsers without WebGL2 still use renderCanvas2D.
            return undefined;
        }
        return this.renderCanvas2D(state, inputFrame, dt);
    }

    prepareFrame(state, dt, frameStart) {
        if (this.lastRenderStartedAtMs > 0) {
            this.lastObservedFrameDt = Math.max(0.0001, Math.min(5, (frameStart - this.lastRenderStartedAtMs) / 1000));
        }
        this.lastRenderStartedAtMs = frameStart;
        this.lastRenderDt = Math.max(0, Math.min(0.08, Number(dt) || 1 / 60));
        this.resize();
        this.updatePhase(state, dt);
        const view = this.computeView(state);
        this.copyLastComputedView(view);
        this.lastCharacterDraws = [];
        this.resetVisualCounters(this.frameVisualCounters);
        this.resetRenderBreakdown(this.frameRenderBreakdown);
        this.framePlayerRocketTransform = null;
        this.updateFrameEntityVisibility(state);
        this.updateActorShadowOpacity(state, this.lastRenderDt);
        computeWorldParallaxOffsetInto(
            this.frameBackgroundOffset,
            view,
            state.world?.bounds,
            normalizeBackgroundParallax(state.world?.layerVisuals?.background?.parallax),
            { min: 0.25, max: 1 }
        );
        this.frameForegroundParallax = normalizeForegroundParallax(
            state.world?.layerVisuals?.foreground?.parallax
        );
        computeCaveWindowParallaxOffsetInto(
            this.frameForegroundOffset,
            view,
            state.world?.bounds,
            this.frameForegroundParallax
        );
        this.getWorldVisualCache(state);
        return view;
    }

    resetCanvasContext() {
        // The renderer works entirely in backing-pixel coordinates. Consumers
        // may have acquired the visible 2D context first, so never inherit a CSS/DPR transform.
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.filter = "none";
    }

    renderCanvas2D(state, inputFrame, dt) {
        const frameStart = rendererNowMs();
        const view = this.prepareFrame(state, dt, frameStart);
        if (!state.debug.showCollision && !state.debug.showAssetGuides) {
            if (this.isStaticTileBakeEnabled()) {
                const rendered = this.renderCanvas2DStaticTiles(state, inputFrame, view, frameStart);
                if (rendered) return;
            } else if (this.isFullStaticLayerBakeEnabled()) {
                const rendered = this.renderCanvas2DStaticBake(state, inputFrame, view, frameStart);
                if (rendered) return;
            }
        }
        this.renderCanvas2DLivePrepared(state, inputFrame, view, frameStart);
    }

    renderCanvas2DLivePrepared(state, inputFrame, view, frameStart) {
        this.staticLayerBake.lastUsed = false;
        this.resetCanvasContext();

        this.clear(view);
        this.drawBackdrop(view);
        const backgroundStart = rendererNowMs();
        this.drawBackgroundVisuals(state, view);
        const backgroundEnd = rendererNowMs();
        this.drawWorld(state, view);
        const worldMainEnd = rendererNowMs();
        this.drawPortalIntroGlow(state, view);
        const worldEnd = rendererNowMs();
        this.frameRenderBreakdown.clearBackdropMs = backgroundStart - frameStart;
        this.frameRenderBreakdown.backgroundMs = backgroundEnd - backgroundStart;
        this.frameRenderBreakdown.portalMs = worldEnd - worldMainEnd;

        this.drawTargets(state, view);
        this.drawPickups(state, view);
        this.drawEnemies(state, view);
        this.drawWorldEffects(state, view);
        this.drawProjectiles(state, view);
        this.drawPlayer(state, view);
        this.drawPlayerDeathCover(state, view);
        this.drawScorePopups(state, view);
        const actorsEnd = rendererNowMs();

        this.drawOrderedWorldVisuals(state, view, true);
        this.drawCaveForegroundVisuals(state, view);
        const foregroundEnd = rendererNowMs();

        this.drawCaveWindow(state, view);
        const maskEnd = rendererNowMs();

        this.drawMailboxStoryOverlay(state, view);
        this.drawDebug(state, view, inputFrame);
        const frameEnd = rendererNowMs();
        this.updatePerformanceDiagnostics({
            frameMs: frameEnd - frameStart,
            worldMs: worldEnd - frameStart,
            actorsMs: actorsEnd - worldEnd,
            foregroundMs: foregroundEnd - actorsEnd,
            maskMs: maskEnd - foregroundEnd,
            overlayMs: frameEnd - maskEnd
        });
    }

    ensureStaticTileBakeWorker() {
        if (this.staticTileWorker) return this.staticTileWorker;
        if (typeof Worker !== "function" || typeof createImageBitmap !== "function") {
            return this.disableStaticLayerBakeAfterFailure(
                "Tile baking requires Worker, OffscreenCanvas, and createImageBitmap support."
            );
        }
        try {
            const worker = new Worker(new URL("./static-tile-bake-worker.js", import.meta.url), { type: "module" });
            worker.addEventListener("message", (event) => this.handleStaticTileWorkerMessage(event.data || {}));
            worker.addEventListener("error", (event) => {
                this.staticTileWorkerBusyTaskId = 0;
                try {
                    worker.terminate();
                } catch {
                    // The worker may already have stopped after its fatal error.
                }
                if (this.staticTileWorker === worker) this.staticTileWorker = null;
                this.disableStaticLayerBakeAfterFailure(
                    event?.message || "Unknown tile-bake worker failure."
                );
            });
            this.staticTileWorker = worker;
            return worker;
        } catch (error) {
            return this.disableStaticLayerBakeAfterFailure(
                error?.message || "Could not start the tile-bake worker.",
                error
            );
        }
    }

    handleStaticTileWorkerMessage(message) {
        const bitmap = message?.bitmap || null;
        const cache = this.staticLayerBake.tileCache;
        if (
            !cache ||
            Number(message.generation) !== Number(cache.generation) ||
            Number(message.generation) !== Number(this.staticTileWorkerGeneration)
        ) {
            this.closeStaticTileBitmap(bitmap);
            return;
        }
        const taskId = Number(message.taskId) || 0;
        if (taskId === this.staticTileWorkerBusyTaskId) this.staticTileWorkerBusyTaskId = 0;
        const record = cache.records.get(String(message.key || ""));
        if (!record || record.taskId !== taskId) {
            this.closeStaticTileBitmap(bitmap);
            return;
        }
        if (message.type === "error") {
            record.state = "queued";
            record.taskId = 0;
            this.disableStaticLayerBakeAfterFailure(message.detail || "tile-bake worker failed");
            return;
        }
        if (message.type !== "baked" || !bitmap) return;
        record.state = "completed";
        cache.completed.push({
            key: record.key,
            taskId,
            bitmap,
            buildMs: Math.max(0, Number(message.buildMs) || 0)
        });
    }

    staticTileBakeCacheKey(state) {
        return [
            state.world?.levelId || "",
            this.environmentColorMapKey || "",
            Array.isArray(state.world?.visuals) ? state.world.visuals.length : 0,
            Array.isArray(state.world?.solids) ? state.world.solids.length : 0,
            JSON.stringify(state.world?.layerVisuals || null)
        ].join("|");
    }

    createStaticTileBakeCache(state, view) {
        const cache = {
            key: this.staticTileBakeCacheKey(state),
            visualSource: state.world?.visuals,
            solidSource: state.world?.solids,
            generation: this.staticTileWorkerGeneration,
            backendGeneration: this.webglBackend?.getResourceGeneration?.() || 0,
            records: new Map(),
            pages: [],
            completed: [],
            regions: {},
            frame: 0,
            nextPageId: 1,
            velocityX: 0,
            velocityY: 0,
            lastViewX: Number(view?.x) || 0,
            lastViewY: Number(view?.y) || 0,
            readyVisibleLayers: 0,
            uploadedTiles: 0,
            emptyTiles: 0,
            buildMs: 0,
            drawMs: 0
        };
        this.staticLayerBake.tileCache = cache;
        this.staticLayerBake.cache = null;
        this.staticLayerBake.key = cache.key;
        this.staticLayerBake.mode = "tiles";
        this.staticLayerBake.fullLayout = "";
        this.staticLayerBake.bytes = 0;
        this.staticLayerBake.chunkCount = 0;
        this.staticLayerBake.lastBuildMs = 0;
        this.staticLayerBake.lastDrawMs = 0;
        return cache;
    }

    staticTileLayerParallaxOffset(layerName) {
        if (layerName === "background") return this.frameBackgroundOffset;
        if (layerName === "foreground") return this.frameForegroundOffset;
        return null;
    }

    updateStaticTileCameraVelocity(cache, view) {
        const dt = Math.max(1 / 240, Math.min(0.25, Number(this.lastObservedFrameDt) || Number(this.lastRenderDt) || 1 / 60));
        const rawX = ((Number(view?.x) || 0) - cache.lastViewX) / dt;
        const rawY = ((Number(view?.y) || 0) - cache.lastViewY) / dt;
        const clampVelocity = (value) => Math.max(-10000, Math.min(10000, value));
        cache.velocityX = cache.velocityX * 0.6 + clampVelocity(rawX) * 0.4;
        cache.velocityY = cache.velocityY * 0.6 + clampVelocity(rawY) * 0.4;
        cache.lastViewX = Number(view?.x) || 0;
        cache.lastViewY = Number(view?.y) || 0;
    }

    ensureStaticTileBakeCache(state, view) {
        if (!this.isStaticTileBakeEnabled()) return null;
        if (!this.ensureStaticTileBakeWorker()) return null;
        const expectedKey = this.staticTileBakeCacheKey(state);
        const backendGeneration = this.webglBackend?.getResourceGeneration?.() || 0;
        let cache = this.staticLayerBake.tileCache;
        if (
            !cache ||
            cache.key !== expectedKey ||
            cache.visualSource !== state.world?.visuals ||
            cache.solidSource !== state.world?.solids ||
            cache.backendGeneration !== backendGeneration
        ) {
            this.releaseStaticTileBakeCache(cache);
            cache = this.createStaticTileBakeCache(state, view);
        }
        cache.frame += 1;
        this.updateStaticTileCameraVelocity(cache, view);
        this.processOneCompletedStaticTile(cache);
        this.planStaticTileBakeRecords(cache, state, view);
        this.evictDistantStaticTiles(cache);
        this.dispatchNextStaticTileBake(cache, state);
        this.updateStaticTileBakeDiagnostics(cache);
        return cache;
    }

    planStaticTileBakeRecords(cache, state, view) {
        for (const layerName of STATIC_TILE_BAKE_LAYER_ORDER) {
            const regions = staticTileCacheRegions(view, {
                parallaxOffset: this.staticTileLayerParallaxOffset(layerName),
                velocityX: cache.velocityX,
                velocityY: cache.velocityY
            });
            cache.regions[layerName] = regions;
            const wantedKeys = new Set();
            for (const rect of regions.bakeRects) {
                const range = staticTileRangeForRect(rect, STATIC_TILE_SIZE);
                for (let tileY = range.minTileY; tileY <= range.maxTileY; tileY += 1) {
                    for (let tileX = range.minTileX; tileX <= range.maxTileX; tileX += 1) {
                        const key = staticTileRecordKey(layerName, tileX, tileY);
                        if (wantedKeys.has(key)) continue;
                        wantedKeys.add(key);
                        let record = cache.records.get(key);
                        if (!record) {
                            record = {
                                key,
                                layerName,
                                tileX,
                                tileY,
                                rect: staticTileRect(tileX, tileY, STATIC_TILE_SIZE),
                                state: "queued",
                                empty: false,
                                bitmap: null,
                                page: null,
                                slotIndex: -1,
                                slotX: 0,
                                slotY: 0,
                                taskId: 0,
                                priority: 0,
                                wantedFrame: 0,
                                lastDrawFrame: 0
                            };
                            cache.records.set(key, record);
                        }
                        record.wantedFrame = cache.frame;
                        record.priority = staticTilePriority(
                            record.rect,
                            regions,
                            cache.velocityX,
                            cache.velocityY,
                            STATIC_TILE_BAKE_LAYER_BIAS[layerName] || 0
                        );
                    }
                }
            }
        }
    }

    evictDistantStaticTiles(cache) {
        for (const record of [...cache.records.values()]) {
            const retentionRects = cache.regions[record.layerName]?.retentionRects || [];
            if (staticTileRectIntersectsAny(record.rect, retentionRects)) continue;
            if (record.state === "preparing" || record.state === "baking" || record.state === "completed") continue;
            this.evictStaticTileRecord(cache, record);
        }
        this.releaseUnusedStaticTileAtlasPages(cache);
    }

    evictStaticTileRecord(cache, record) {
        if (!record) return false;
        this.closeStaticTileBitmap(record.bitmap);
        record.bitmap = null;
        if (record.page && record.slotIndex >= 0) {
            record.page.usedSlots.delete(record.slotIndex);
            record.page.freeSlots.push(record.slotIndex);
        }
        cache.records.delete(record.key);
        return true;
    }

    releaseUnusedStaticTileAtlasPages(cache, keepEmptyPages = 1) {
        if (!this.webglBackend?.available || !Array.isArray(cache.pages)) return;
        let emptyKept = 0;
        const retained = [];
        for (const page of cache.pages) {
            if (page.usedSlots.size > 0 || emptyKept < keepEmptyPages) {
                retained.push(page);
                if (page.usedSlots.size === 0) emptyKept += 1;
            } else {
                this.webglBackend.invalidateTexture(page.source);
            }
        }
        cache.pages = retained;
    }

    staticTilePartitionHasStaticVisuals(cache, partitionName) {
        for (const entry of cache?.[partitionName] || []) {
            const visual = entry.visual;
            if (!visualCanBeBakedStatic(visual)) continue;
            if (visual.kind === "cutoutMask") return true;
            if (visual.kind === "atlasSprite" && this.atlasVisualAvailable(visual)) return true;
        }
        return false;
    }

    staticTileSourceDescriptor(source, sourceX, sourceY, sourceWidth, sourceHeight) {
        if (!source) return null;
        let objectId = this.staticTileSourceObjectIds.get(source);
        if (!objectId) {
            objectId = `source_${++this.staticTileSourceCounter}`;
            this.staticTileSourceObjectIds.set(source, objectId);
        }
        const x = Math.max(0, Math.floor(Number(sourceX) || 0));
        const y = Math.max(0, Math.floor(Number(sourceY) || 0));
        const width = Math.max(1, Math.floor(Number(sourceWidth) || Number(source.width) || Number(source.naturalWidth) || 1));
        const height = Math.max(1, Math.floor(Number(sourceHeight) || Number(source.height) || Number(source.naturalHeight) || 1));
        const id = `${objectId}:${x}:${y}:${width}:${height}`;
        if (!this.staticTileSourceDescriptors.has(id)) {
            this.staticTileSourceDescriptors.set(id, { id, source, x, y, width, height });
        }
        return this.staticTileSourceDescriptors.get(id);
    }

    staticTileImageCommandForVisual(visual) {
        const atlas = this.environmentAtlases.get(visual?.atlasId);
        if (!atlas || atlas.missing || !atlas.image) return null;
        const frameName = visual.frame || visual.assetId;
        const frame = atlas.frames?.[frameName];
        if (!frame) return null;
        const caveForeground = visual.layer === "caveForeground";
        const worldBackground = isWorldBackgroundVisual(visual);
        let source = atlas.renderImage || atlas.image;
        let sourceX = frame.x;
        let sourceY = frame.y;
        let sourceWidth = frame.w;
        let sourceHeight = frame.h;
        if (worldBackground) {
            source = this.getLayerBrightnessAtlas(atlas, visual.backgroundBrightness, "background");
        }
        if (caveForeground) {
            source = this.getForegroundSpriteCanvas(atlas, frameName, frame, visual);
            sourceX = 0;
            sourceY = 0;
            sourceWidth = source.width;
            sourceHeight = source.height;
        }
        const descriptor = this.staticTileSourceDescriptor(source, sourceX, sourceY, sourceWidth, sourceHeight);
        if (!descriptor) return null;
        const center = placementCenter(visual);
        return {
            kind: "image",
            sourceId: descriptor.id,
            centerX: center.x,
            centerY: center.y,
            width: Number(visual.w) || 0,
            height: Number(visual.h) || 0,
            rotation: normalizeRotationRadians(visual.rotation),
            mirrorX: Boolean(visual.mirrorX),
            mirrorY: Boolean(visual.mirrorY),
            alpha: visual.alpha ?? 1
        };
    }

    appendStaticTilePartitionCommands(commands, state, partitionName, tileView, drawnGroups) {
        const visualCache = this.getWorldVisualCache(state);
        const query = queryWorldVisualEntries(
            visualCache,
            partitionName,
            tileView,
            null,
            0,
            this.staticTileQueryScratch[partitionName]
        );
        const overlapCache = partitionName === "main" ? this.ensureOverlapBlendCache(state) : null;
        for (const { visual } of query.entries) {
            if (!visualCanBeBakedStatic(visual)) continue;
            const blendGroup = overlapCache?.memberToGroup?.get(visual);
            if (blendGroup) {
                if (drawnGroups.has(blendGroup)) continue;
                drawnGroups.add(blendGroup);
                if (!visualIntersectsViewport(blendGroup.bounds, tileView, null, 0)) continue;
                const descriptor = this.staticTileSourceDescriptor(
                    blendGroup.canvas,
                    0,
                    0,
                    blendGroup.canvas?.width,
                    blendGroup.canvas?.height
                );
                if (!descriptor) continue;
                commands.push({
                    kind: "image",
                    sourceId: descriptor.id,
                    centerX: (blendGroup.bounds.minX + blendGroup.bounds.maxX) * 0.5,
                    centerY: (blendGroup.bounds.minY + blendGroup.bounds.maxY) * 0.5,
                    width: blendGroup.bounds.maxX - blendGroup.bounds.minX,
                    height: blendGroup.bounds.maxY - blendGroup.bounds.minY,
                    rotation: 0,
                    mirrorX: false,
                    mirrorY: false,
                    alpha: 1
                });
                continue;
            }
            if (visual.kind === "atlasSprite") {
                const command = this.staticTileImageCommandForVisual(visual);
                if (command) commands.push(command);
            } else if (visual.kind === "cutoutMask") {
                commands.push({
                    kind: "fill",
                    color: LEVEL_BACKGROUND_COLOR,
                    alpha: 1,
                    x: Number(visual.x) || 0,
                    y: Number(visual.y) || 0,
                    width: Number(visual.w) || 0,
                    height: Number(visual.h) || 0
                });
            }
        }
    }

    buildStaticTileBakeTask(state, record) {
        const originX = record.rect.x - STATIC_TILE_GUTTER;
        const originY = record.rect.y - STATIC_TILE_GUTTER;
        const tileView = {
            w: STATIC_TILE_SLOT_SIZE,
            h: STATIC_TILE_SLOT_SIZE,
            dpr: 1,
            zoom: 1,
            cssScale: 1,
            clientW: STATIC_TILE_SLOT_SIZE,
            clientH: STATIC_TILE_SLOT_SIZE,
            virtualW: STATIC_TILE_SLOT_SIZE,
            virtualH: STATIC_TILE_SLOT_SIZE,
            minVirtualW: STATIC_TILE_SLOT_SIZE,
            x: originX,
            y: originY
        };
        const commands = [];
        const drawnGroups = new Set();
        if (record.layerName === "background") {
            this.appendStaticTilePartitionCommands(commands, state, "background", tileView, drawnGroups);
        } else if (record.layerName === "terrain") {
            this.appendStaticTilePartitionCommands(commands, state, "main", tileView, drawnGroups);
            const visualCache = this.getWorldVisualCache(state);
            if (!this.staticTilePartitionHasStaticVisuals(visualCache, "main")) {
                for (const solid of state.world?.solids || []) {
                    const solidRect = {
                        x: Number(solid.x) || 0,
                        y: Number(solid.y) || 0,
                        w: Math.max(0, Number(solid.w) || 0),
                        h: Math.max(0, Number(solid.h) || 0)
                    };
                    if (!staticTileRectIntersects(solidRect, { x: originX, y: originY, w: STATIC_TILE_SLOT_SIZE, h: STATIC_TILE_SLOT_SIZE })) continue;
                    commands.push({
                        kind: "fill",
                        color: solid.kind === "floor" ? "rgba(122, 104, 149, 0.45)" : "rgba(92, 81, 124, 0.52)",
                        alpha: 1,
                        x: solidRect.x,
                        y: solidRect.y,
                        width: solidRect.w,
                        height: solidRect.h
                    });
                }
            }
        } else {
            this.appendStaticTilePartitionCommands(commands, state, "actorFront", tileView, drawnGroups);
            this.appendStaticTilePartitionCommands(commands, state, "caveForeground", tileView, drawnGroups);
        }
        return {
            key: record.key,
            originX,
            originY,
            width: STATIC_TILE_SLOT_SIZE,
            height: STATIC_TILE_SLOT_SIZE,
            commands
        };
    }

    dispatchNextStaticTileBake(cache, state) {
        if (this.staticTileWorkerBusyTaskId || cache.completed.length > 0) return;
        const worker = this.ensureStaticTileBakeWorker();
        if (!worker) return;
        let emptyScans = 0;
        while (emptyScans < STATIC_TILE_BAKE_MAX_EMPTY_SCAN_PER_FRAME) {
            const record = [...cache.records.values()]
                .filter((candidate) => candidate.state === "queued" && candidate.wantedFrame === cache.frame)
                .sort((a, b) => a.priority - b.priority)[0];
            if (!record) return;
            const task = this.buildStaticTileBakeTask(state, record);
            if (!task.commands.length) {
                record.state = "empty";
                record.empty = true;
                record.taskId = 0;
                cache.emptyTiles += 1;
                emptyScans += 1;
                continue;
            }
            const taskId = ++this.staticTileTaskCounter;
            record.state = "preparing";
            record.taskId = taskId;
            this.staticTileWorkerBusyTaskId = taskId;
            const preparationToken = ++this.staticTilePreparationToken;
            void this.prepareAndPostStaticTileTask(cache, record, task, taskId, preparationToken);
            return;
        }
    }

    async prepareAndPostStaticTileTask(cache, record, task, taskId, preparationToken) {
        const sourceIds = [...new Set(task.commands.filter((command) => command.kind === "image").map((command) => command.sourceId))];
        const newSources = [];
        const transfers = [];
        try {
            for (const sourceId of sourceIds) {
                if (this.staticTileRegisteredSources.has(sourceId)) continue;
                const descriptor = this.staticTileSourceDescriptors.get(sourceId);
                if (!descriptor) throw new Error(`Missing source descriptor ${sourceId}.`);
                const bitmap = await createImageBitmap(
                    descriptor.source,
                    descriptor.x,
                    descriptor.y,
                    descriptor.width,
                    descriptor.height
                );
                newSources.push({ id: sourceId, bitmap });
                transfers.push(bitmap);
            }
            if (
                preparationToken !== this.staticTilePreparationToken ||
                cache !== this.staticLayerBake.tileCache ||
                cache.generation !== this.staticTileWorkerGeneration ||
                record.taskId !== taskId
            ) {
                for (const entry of newSources) this.closeStaticTileBitmap(entry.bitmap);
                return;
            }
            this.staticTileWorkerBusyTaskId = taskId;
            record.state = "baking";
            this.staticTileWorker.postMessage({
                type: "bake",
                generation: cache.generation,
                taskId,
                key: record.key,
                originX: task.originX,
                originY: task.originY,
                width: task.width,
                height: task.height,
                commands: task.commands,
                sources: newSources,
                preflipForWebGL: Boolean(this.webglBackend?.available)
            }, transfers);
            for (const entry of newSources) this.staticTileRegisteredSources.add(entry.id);
        } catch (error) {
            for (const entry of newSources) this.closeStaticTileBitmap(entry.bitmap);
            if (record.taskId === taskId) {
                record.state = "queued";
                record.taskId = 0;
            }
            this.staticTileWorkerBusyTaskId = 0;
            this.disableStaticLayerBakeAfterFailure(error?.message || error, error);
        }
    }

    processOneCompletedStaticTile(cache) {
        const completed = cache.completed.shift();
        if (!completed) return false;
        const record = cache.records.get(completed.key);
        if (!record || record.taskId !== completed.taskId || record.state !== "completed") {
            this.closeStaticTileBitmap(completed.bitmap);
            return false;
        }
        if (this.webglBackend?.available) {
            const slot = this.allocateStaticTileAtlasSlot(cache, record);
            if (!slot) {
                this.closeStaticTileBitmap(completed.bitmap);
                record.state = "queued";
                record.taskId = 0;
                this.staticLayerBake.status = "tile texture budget reached; distant tiles will be recycled";
                return false;
            }
            const uploaded = this.webglBackend.updateTextureRegion(
                slot.page.source,
                completed.bitmap,
                slot.x,
                slot.y,
                { unpackFlipY: false }
            );
            this.closeStaticTileBitmap(completed.bitmap);
            if (!uploaded) {
                return Boolean(this.disableStaticLayerBakeAfterFailure(
                    this.webglBackend.lastTextureError || "could not upload a baked tile"
                ));
            }
            record.page = slot.page;
            record.slotIndex = slot.slotIndex;
            record.slotX = slot.x;
            record.slotY = slot.y;
        } else {
            const tileBytes = STATIC_TILE_SLOT_SIZE * STATIC_TILE_SLOT_SIZE * STATIC_LAYER_BAKE_BYTES_PER_PIXEL;
            let residentBytes = [...cache.records.values()].reduce((sum, candidate) => (
                sum + (candidate.state === "ready" && candidate.bitmap ? tileBytes : 0)
            ), 0);
            while (residentBytes + tileBytes > STATIC_TILE_BAKE_CANVAS_MEMORY_BUDGET_BYTES) {
                const victim = [...cache.records.values()]
                    .filter((candidate) => candidate !== record && candidate.state === "ready" && candidate.bitmap)
                    .sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
                if (!victim) {
                    this.closeStaticTileBitmap(completed.bitmap);
                    record.state = "queued";
                    record.taskId = 0;
                    this.staticLayerBake.status = "Canvas tile memory budget reached; waiting for distant tiles to be recycled";
                    return false;
                }
                this.evictStaticTileRecord(cache, victim);
                residentBytes = Math.max(0, residentBytes - tileBytes);
            }
            record.bitmap = completed.bitmap;
        }
        record.state = "ready";
        record.empty = false;
        record.taskId = 0;
        cache.uploadedTiles += 1;
        cache.buildMs = cache.buildMs * 0.9 + completed.buildMs * 0.1;
        return true;
    }

    allocateStaticTileAtlasSlot(cache, record) {
        for (const page of cache.pages) {
            if (!page.freeSlots.length) continue;
            const slotIndex = page.freeSlots.pop();
            page.usedSlots.set(slotIndex, record.key);
            return {
                page,
                slotIndex,
                x: (slotIndex % page.slotsPerAxis) * STATIC_TILE_SLOT_SIZE,
                y: Math.floor(slotIndex / page.slotsPerAxis) * STATIC_TILE_SLOT_SIZE
            };
        }
        const maxTextureSize = Math.max(STATIC_TILE_SLOT_SIZE, Number(this.webglBackend?.getMaxTextureSize?.()) || STATIC_TILE_SLOT_SIZE);
        const slotsPerAxis = Math.max(1, Math.min(STATIC_TILE_BAKE_ATLAS_TARGET_SLOTS, Math.floor(maxTextureSize / STATIC_TILE_SLOT_SIZE)));
        const dimension = slotsPerAxis * STATIC_TILE_SLOT_SIZE;
        const pageBytes = dimension * dimension * STATIC_LAYER_BAKE_BYTES_PER_PIXEL;
        while (this.staticLayerBake.bytes + pageBytes > STATIC_TILE_BAKE_WEBGL_MEMORY_BUDGET_BYTES) {
            const victim = [...cache.records.values()]
                .filter((candidate) => candidate !== record && candidate.state === "ready" && candidate.page)
                .sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
            if (!victim) return null;
            this.evictStaticTileRecord(cache, victim);
            for (const page of cache.pages) {
                if (!page.freeSlots.length) continue;
                const slotIndex = page.freeSlots.pop();
                page.usedSlots.set(slotIndex, record.key);
                return {
                    page,
                    slotIndex,
                    x: (slotIndex % page.slotsPerAxis) * STATIC_TILE_SLOT_SIZE,
                    y: Math.floor(slotIndex / page.slotsPerAxis) * STATIC_TILE_SLOT_SIZE
                };
            }
        }
        const source = this.webglBackend.createTextureStorage(dimension, dimension);
        if (!source) return null;
        const capacity = slotsPerAxis * slotsPerAxis;
        const page = {
            id: cache.nextPageId++,
            source,
            dimension,
            slotsPerAxis,
            bytes: pageBytes,
            freeSlots: Array.from({ length: capacity }, (_, index) => capacity - 1 - index),
            usedSlots: new Map()
        };
        cache.pages.push(page);
        const slotIndex = page.freeSlots.pop();
        page.usedSlots.set(slotIndex, record.key);
        return { page, slotIndex, x: 0, y: 0 };
    }

    staticTileVisibleRecords(cache, layerName, view, parallaxOffset = null) {
        const visible = staticTileViewRect(view, parallaxOffset);
        const range = staticTileRangeForRect(visible, STATIC_TILE_SIZE);
        const records = [];
        let complete = true;
        for (let tileY = range.minTileY; tileY <= range.maxTileY; tileY += 1) {
            for (let tileX = range.minTileX; tileX <= range.maxTileX; tileX += 1) {
                const record = cache.records.get(staticTileRecordKey(layerName, tileX, tileY));
                if (!record || (record.state !== "ready" && record.state !== "empty")) {
                    complete = false;
                    continue;
                }
                records.push(record);
            }
        }
        return { complete, visible, records };
    }

    drawStaticTileLayerCanvas(cache, layerName, view, parallaxOffset = null) {
        const drawStart = rendererNowMs();
        const visibleResult = this.staticTileVisibleRecords(cache, layerName, view, parallaxOffset);
        if (!visibleResult.complete) return { complete: false, ms: rendererNowMs() - drawStart, tiles: 0 };
        const zoom = Math.max(0.0001, Number(view?.zoom) || 1);
        let tiles = 0;
        for (const record of visibleResult.records) {
            record.lastDrawFrame = cache.frame;
            if (record.empty || !record.bitmap) continue;
            const left = Math.max(visibleResult.visible.x, record.rect.x);
            const top = Math.max(visibleResult.visible.y, record.rect.y);
            const right = Math.min(visibleResult.visible.x + visibleResult.visible.w, record.rect.x + record.rect.w);
            const bottom = Math.min(visibleResult.visible.y + visibleResult.visible.h, record.rect.y + record.rect.h);
            const width = right - left;
            const height = bottom - top;
            if (width <= 0 || height <= 0) continue;
            this.ctx.drawImage(
                record.bitmap,
                STATIC_TILE_GUTTER + left - record.rect.x,
                STATIC_TILE_GUTTER + top - record.rect.y,
                width,
                height,
                (left - visibleResult.visible.x) * zoom,
                (top - visibleResult.visible.y) * zoom,
                width * zoom,
                height * zoom
            );
            tiles += 1;
        }
        return { complete: true, ms: rendererNowMs() - drawStart, tiles };
    }

    queueStaticTileLayerWebGL(cache, layerName, view, parallaxOffset = null) {
        const drawStart = rendererNowMs();
        const visibleResult = this.staticTileVisibleRecords(cache, layerName, view, parallaxOffset);
        if (!visibleResult.complete) return { complete: false, ms: rendererNowMs() - drawStart, tiles: 0, failed: 0 };
        const zoom = Math.max(0.0001, Number(view?.zoom) || 1);
        const records = visibleResult.records
            .filter((record) => !record.empty && record.page)
            .sort((a, b) => a.page.id - b.page.id || a.tileY - b.tileY || a.tileX - b.tileX);
        let tiles = 0;
        let failed = 0;
        for (const record of records) {
            record.lastDrawFrame = cache.frame;
            const left = Math.max(visibleResult.visible.x, record.rect.x);
            const top = Math.max(visibleResult.visible.y, record.rect.y);
            const right = Math.min(visibleResult.visible.x + visibleResult.visible.w, record.rect.x + record.rect.w);
            const bottom = Math.min(visibleResult.visible.y + visibleResult.visible.h, record.rect.y + record.rect.h);
            const width = right - left;
            const height = bottom - top;
            if (width <= 0 || height <= 0) continue;
            const queued = this.webglBackend.queueSprite({
                source: record.page.source,
                sourceX: record.slotX + STATIC_TILE_GUTTER + left - record.rect.x,
                sourceY: record.slotY + STATIC_TILE_GUTTER + top - record.rect.y,
                sourceWidth: width,
                sourceHeight: height,
                centerX: (left - visibleResult.visible.x) * zoom + width * zoom * 0.5,
                centerY: (top - visibleResult.visible.y) * zoom + height * zoom * 0.5,
                width: width * zoom,
                height: height * zoom,
                dynamic: false
            });
            if (queued) tiles += 1;
            else failed += 1;
        }
        return { complete: failed === 0, ms: rendererNowMs() - drawStart, tiles, failed };
    }

    updateStaticTileBakeDiagnostics(cache) {
        const ready = [...cache.records.values()].filter((record) => record.state === "ready" || record.state === "empty").length;
        const resident = [...cache.records.values()].filter((record) => record.state === "ready" && !record.empty).length;
        const canvasBytes = this.webglBackend?.available ? 0 : resident * STATIC_TILE_SLOT_SIZE * STATIC_TILE_SLOT_SIZE * STATIC_LAYER_BAKE_BYTES_PER_PIXEL;
        const pageBytes = cache.pages.reduce((sum, page) => sum + (Number(page.bytes) || 0), 0);
        this.staticLayerBake.bytes = pageBytes + canvasBytes;
        this.staticLayerBake.chunkCount = resident;
        this.staticLayerBake.lastBuildMs = cache.buildMs;
        this.staticLayerBake.mode = "tiles";
        this.staticLayerBake.fullLayout = "";
        this.staticLayerBake.status = `tiles: ${ready} ready (${resident} textured), ${cache.pages.length} atlas pages, ${Math.round(this.staticLayerBake.bytes / 1048576)} MiB`;
    }

    renderCanvas2DStaticTiles(state, inputFrame, view, frameStart) {
        const cache = this.ensureStaticTileBakeCache(state, view);
        if (!cache) return false;
        this.resetCanvasContext();
        this.clear(view);
        this.drawBackdrop(view);

        const backgroundStart = rendererNowMs();
        const backgroundTiles = this.drawStaticTileLayerCanvas(cache, "background", view, this.frameBackgroundOffset);
        if (backgroundTiles.complete) this.drawBakedDynamicWorldVisuals(state, view, "background");
        else this.drawBackgroundVisuals(state, view);
        const backgroundEnd = rendererNowMs();

        const terrainStart = rendererNowMs();
        const terrainTiles = this.drawStaticTileLayerCanvas(cache, "terrain", view, null);
        if (terrainTiles.complete) {
            this.drawBakedDynamicWorldVisuals(state, view, "main");
        } else {
            this.drawWorld(state, view);
        }
        const worldMainEnd = rendererNowMs();
        this.drawPortalIntroGlow(state, view);
        const worldEnd = rendererNowMs();
        this.frameRenderBreakdown.clearBackdropMs = backgroundStart - frameStart;
        this.frameRenderBreakdown.backgroundMs = backgroundEnd - backgroundStart;
        this.frameRenderBreakdown.worldVisualsMs += backgroundTiles.ms + terrainTiles.ms;
        this.frameRenderBreakdown.worldGeometryMs += Math.max(0, worldMainEnd - terrainStart - terrainTiles.ms);
        this.frameRenderBreakdown.portalMs = worldEnd - worldMainEnd;

        this.drawTargets(state, view);
        this.drawPickups(state, view);
        this.drawEnemies(state, view);
        this.drawWorldEffects(state, view);
        this.drawProjectiles(state, view);
        this.drawPlayer(state, view);
        this.drawPlayerDeathCover(state, view);
        this.drawScorePopups(state, view);
        const actorsEnd = rendererNowMs();

        const foregroundStart = rendererNowMs();
        const foregroundReady = this.staticTileVisibleRecords(cache, "foreground", view, this.frameForegroundOffset).complete;
        let foregroundTiles = { complete: false, ms: 0, tiles: 0 };
        if (foregroundReady) {
            this.drawBakedDynamicWorldVisuals(state, view, "actorFront");
            this.drawBakedDynamicWorldVisuals(state, view, "caveForeground");
            foregroundTiles = this.drawStaticTileLayerCanvas(cache, "foreground", view, this.frameForegroundOffset);
        } else {
            this.drawOrderedWorldVisuals(state, view, true);
            this.drawCaveForegroundVisuals(state, view);
        }
        const foregroundEnd = rendererNowMs();
        this.drawCaveWindow(state, view);
        const maskEnd = rendererNowMs();
        this.drawMailboxStoryOverlay(state, view);
        this.drawDebug(state, view, inputFrame);
        const frameEnd = rendererNowMs();

        cache.drawMs = backgroundTiles.ms + terrainTiles.ms + foregroundTiles.ms;
        this.staticLayerBake.lastDrawMs = cache.drawMs;
        this.staticLayerBake.lastUsed = backgroundTiles.complete || terrainTiles.complete || foregroundTiles.complete;
        cache.readyVisibleLayers = Number(backgroundTiles.complete) + Number(terrainTiles.complete) + Number(foregroundTiles.complete);
        this.updatePerformanceDiagnostics({
            frameMs: frameEnd - frameStart,
            worldMs: worldEnd - frameStart,
            actorsMs: actorsEnd - worldEnd,
            foregroundMs: foregroundEnd - actorsEnd,
            maskMs: maskEnd - foregroundEnd,
            overlayMs: frameEnd - maskEnd
        });
        return true;
    }

    renderCanvas2DStaticBake(state, inputFrame, view, frameStart) {
        const bake = this.ensureStaticLayerBake(state, view);
        if (!bake) return false;
        this.staticLayerBake.lastUsed = true;
        this.resetCanvasContext();

        this.clear(view);
        this.drawBackdrop(view);
        const backgroundStart = rendererNowMs();
        const backgroundDrawMs = this.drawStaticLayerBakeCanvas(bake.layers.background, view, this.frameBackgroundOffset);
        this.drawBakedDynamicWorldVisuals(state, view, "background");
        const backgroundEnd = rendererNowMs();

        const terrainDrawStart = rendererNowMs();
        const terrainDrawMs = this.drawStaticLayerBakeCanvas(bake.layers.terrain, view, null);
        this.drawBakedDynamicWorldVisuals(state, view, "main");
        const worldMainEnd = rendererNowMs();
        this.drawPortalIntroGlow(state, view);
        const worldEnd = rendererNowMs();
        this.frameRenderBreakdown.clearBackdropMs = backgroundStart - frameStart;
        this.frameRenderBreakdown.backgroundMs = backgroundEnd - backgroundStart;
        this.frameRenderBreakdown.worldVisualsMs += backgroundDrawMs + terrainDrawMs;
        this.frameRenderBreakdown.worldGeometryMs += Math.max(0, worldMainEnd - terrainDrawStart - terrainDrawMs);
        this.frameRenderBreakdown.portalMs = worldEnd - worldMainEnd;

        this.drawTargets(state, view);
        this.drawPickups(state, view);
        this.drawEnemies(state, view);
        this.drawWorldEffects(state, view);
        this.drawProjectiles(state, view);
        this.drawPlayer(state, view);
        this.drawPlayerDeathCover(state, view);
        this.drawScorePopups(state, view);
        const actorsEnd = rendererNowMs();

        this.drawBakedDynamicWorldVisuals(state, view, "actorFront");
        this.drawBakedDynamicWorldVisuals(state, view, "caveForeground");
        const foregroundBakeStart = rendererNowMs();
        const foregroundDrawMs = this.drawStaticLayerBakeCanvas(bake.layers.foreground, view, this.frameForegroundOffset);
        const foregroundEnd = rendererNowMs();
        this.staticLayerBake.lastDrawMs = backgroundDrawMs + terrainDrawMs + foregroundDrawMs;

        const maskEnd = foregroundEnd;
        this.frameRenderBreakdown.worldVisualsMs += Math.max(0, foregroundEnd - foregroundBakeStart);
        this.drawMailboxStoryOverlay(state, view);
        this.drawDebug(state, view, inputFrame);
        const frameEnd = rendererNowMs();
        this.updatePerformanceDiagnostics({
            frameMs: frameEnd - frameStart,
            worldMs: worldEnd - frameStart,
            actorsMs: actorsEnd - worldEnd,
            foregroundMs: foregroundEnd - actorsEnd,
            maskMs: maskEnd - foregroundEnd,
            overlayMs: frameEnd - maskEnd
        });
        return true;
    }

    staticLayerBakeKey(state, view = null) {
        const bounds = staticLayerBakeStateBounds(state, view);
        const cave = state.world?.caveWindow || null;
        return [
            state.world?.levelId || "",
            staticLayerBakeBoundsKey(bounds),
            this.environmentColorMapKey || "",
            Array.isArray(state.world?.visuals) ? state.world.visuals.length : 0,
            JSON.stringify(state.world?.layerVisuals || null),
            JSON.stringify(cave)
        ].join("|");
    }

    ensureStaticLayerBake(state, view = null) {
        if (!this.isFullStaticLayerBakeEnabled()) return null;
        const bounds = staticLayerBakeStateBounds(state, view);
        if (!bounds) {
            this.staticLayerBake.status = "no finite world bounds";
            return null;
        }
        const webglTextureLimit = this.webglBackend?.available
            ? Math.max(1, Number(this.webglBackend.getMaxTextureSize?.()) || 1)
            : 0;
        const chunkSize = staticLayerBakeChunkSize(webglTextureLimit || STATIC_LAYER_BAKE_MAX_DIMENSION);
        const needsChunking = bounds.w > STATIC_LAYER_BAKE_MAX_DIMENSION ||
            bounds.h > STATIC_LAYER_BAKE_MAX_DIMENSION ||
            (webglTextureLimit > 0 && (bounds.w > webglTextureLimit || bounds.h > webglTextureLimit));
        if (!needsChunking && (bounds.w > STATIC_LAYER_BAKE_MAX_DIMENSION || bounds.h > STATIC_LAYER_BAKE_MAX_DIMENSION)) {
            this.staticLayerBake.status = `world ${bounds.w}x${bounds.h} exceeds single-canvas POC limit ${STATIC_LAYER_BAKE_MAX_DIMENSION}`;
            return null;
        }
        const bytes = bakedLayerByteEstimate(bounds.w, bounds.h);
        const memoryBudget = staticLayerBakeBudgetForBackend(this.webglBackend);
        if (bytes > memoryBudget) {
            const detail = `estimated ${Math.round(bytes / 1048576)} MiB exceeds ${staticLayerBakeBudgetLabelForBackend(this.webglBackend)} baked-layer safety budget ${Math.round(memoryBudget / 1048576)} MiB`;
            this.staticLayerBake.status = detail;
            return this.disableStaticLayerBakeAfterFailure(detail);
        }
        const mode = needsChunking ? `chunked-${chunkSize}` : "single";
        const key = `${this.staticLayerBakeKey(state, view)}|mode:${mode}`;
        const visuals = Array.isArray(state.world?.visuals) ? state.world.visuals : [];
        const cache = this.staticLayerBake.cache;
        if (cache && this.staticLayerBake.key === key && cache.visualSource === visuals) {
            this.staticLayerBake.status = cache.chunked
                ? `ready chunked ${bounds.w}x${bounds.h}, ${Math.round(bytes / 1048576)} MiB, ${cache.chunkCount} chunks`
                : `ready ${bounds.w}x${bounds.h}, ${Math.round(bytes / 1048576)} MiB`;
            this.staticLayerBake.chunkCount = cache.chunkCount || 0;
            this.staticLayerBake.mode = "full";
            this.staticLayerBake.fullLayout = cache.chunked ? "chunked" : "single";
            return cache;
        }
        const buildStart = rendererNowMs();
        let nextCache = null;
        try {
            // Free the old full-level/chunk surfaces before building replacements.
            // Keeping old and new bakes alive at once can double the peak memory
            // pressure and is exactly the sort of attic-gnome footgun this
            // experimental path must avoid.
            if (this.staticLayerBake.cache) {
                this.releaseStaticLayerBakeCache(this.staticLayerBake.cache);
                this.staticLayerBake.cache = null;
                this.staticLayerBake.key = "";
            }
            nextCache = this.buildStaticLayerBake(state, bounds, visuals, {
                chunked: needsChunking,
                chunkSize,
                releaseSurfacesAfterUpload: Boolean(this.webglBackend?.available)
            });
            if (this.webglBackend?.available) {
                this.preloadStaticLayerBakeTextures(nextCache, { releaseSurfacesAfterUpload: true });
            }
            const buildEnd = rendererNowMs();
            this.staticLayerBake.cache = nextCache;
            this.staticLayerBake.key = key;
            this.staticLayerBake.bytes = bytes;
            this.staticLayerBake.lastBuildMs = buildEnd - buildStart;
            this.staticLayerBake.chunkCount = nextCache.chunkCount || 0;
            this.staticLayerBake.mode = "full";
            this.staticLayerBake.fullLayout = nextCache.chunked ? "chunked" : "single";
            this.staticLayerBake.lastError = "";
            this.staticLayerBake.status = nextCache.chunked
                ? `ready chunked ${bounds.w}x${bounds.h}, ${Math.round(bytes / 1048576)} MiB, ${nextCache.chunkCount} chunks, built in ${this.staticLayerBake.lastBuildMs.toFixed(1)} ms`
                : `ready ${bounds.w}x${bounds.h}, ${Math.round(bytes / 1048576)} MiB, built in ${this.staticLayerBake.lastBuildMs.toFixed(1)} ms`;
            return nextCache;
        } catch (error) {
            this.releaseStaticLayerBakeCache(nextCache);
            console.warn("Static layer bake failed; falling back to live renderer.", error);
            return this.disableStaticLayerBakeAfterFailure(error?.message || error, error);
        }
    }

    createStaticLayerBakeSurface(width, height, originX = 0, originY = 0) {
        const ownerDocument = this.canvas?.ownerDocument || (typeof document !== "undefined" ? document : null);
        if (!ownerDocument?.createElement) {
            throw new Error("static layer bake requires a browser Canvas document");
        }
        const canvas = ownerDocument.createElement("canvas");
        canvas.width = Math.max(1, Math.ceil(width));
        canvas.height = Math.max(1, Math.ceil(height));
        const context = canvas.getContext("2d", { alpha: true, desynchronized: false });
        if (!context) {
            throw new Error("could not create a static layer bake canvas context");
        }
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        return { canvas, context, originX, originY, width: canvas.width, height: canvas.height, releasedCanvasBacking: false };
    }

    createStaticLayerBakeLayer(bounds, options = {}) {
        if (!options.chunked) {
            return this.createStaticLayerBakeSurface(bounds.w, bounds.h, bounds.x, bounds.y);
        }
        const chunkSize = Math.max(256, Math.floor(Number(options.chunkSize) || STATIC_LAYER_BAKE_WEBGL_CHUNK_SIZE));
        const chunks = [];
        const maxX = bounds.x + bounds.w;
        const maxY = bounds.y + bounds.h;
        for (let y = bounds.y; y < maxY; y += chunkSize) {
            const h = Math.max(1, Math.min(chunkSize, Math.ceil(maxY - y)));
            for (let x = bounds.x; x < maxX; x += chunkSize) {
                const w = Math.max(1, Math.min(chunkSize, Math.ceil(maxX - x)));
                chunks.push(this.createStaticLayerBakeSurface(w, h, x, y));
            }
        }
        return {
            chunks,
            originX: bounds.x,
            originY: bounds.y,
            chunkSize
        };
    }

    staticLayerBakeSurfaceView(surface) {
        const width = staticLayerBakeSurfaceWidth(surface);
        const height = staticLayerBakeSurfaceHeight(surface);
        return {
            w: width,
            h: height,
            dpr: 1,
            zoom: 1,
            cssScale: 1,
            clientW: width,
            clientH: height,
            virtualW: width,
            virtualH: height,
            minVirtualW: width,
            x: Number(surface?.originX) || 0,
            y: Number(surface?.originY) || 0
        };
    }

    drawIntoStaticLayerBakeSurfaces(layer, drawSurface, options = {}) {
        let uploaded = 0;
        for (const surface of staticLayerBakeLayerSurfaces(layer)) {
            this.ctx = surface.context;
            drawSurface(this.staticLayerBakeSurfaceView(surface));
            if (options.releaseSurfacesAfterUpload) {
                this.uploadAndReleaseStaticLayerBakeSurface(surface);
                uploaded += 1;
            }
        }
        return uploaded;
    }

    uploadAndReleaseStaticLayerBakeSurface(surface) {
        if (!surface?.canvas || surface.releasedCanvasBacking) return false;
        const backend = this.webglBackend;
        if (!backend?.available) return false;
        const width = staticLayerBakeSurfaceWidth(surface);
        const height = staticLayerBakeSurfaceHeight(surface);
        if (!backend.cacheTexture?.(surface.canvas)) {
            throw new Error(backend.lastTextureError || `could not upload baked layer texture ${width}x${height}`);
        }
        // The WebGL texture is resident now, and the texture cache still uses the
        // canvas object as its key. Shrinking the canvas after upload keeps that
        // key alive while letting the browser release the large CPU-side backing
        // store. Drawing uses the stored surface width/height, not canvas.width.
        surface.canvas.width = 1;
        surface.canvas.height = 1;
        surface.context = null;
        surface.releasedCanvasBacking = true;
        return true;
    }

    preloadStaticLayerBakeTextures(cache, options = {}) {
        const backend = this.webglBackend;
        if (!backend?.available) return 0;
        let uploaded = 0;
        const layers = cache?.layers || null;
        if (!layers) return 0;
        for (const layer of Object.values(layers)) {
            for (const surface of staticLayerBakeLayerSurfaces(layer)) {
                if (!surface?.canvas || surface.releasedCanvasBacking) continue;
                if (!backend.cacheTexture?.(surface.canvas)) {
                    const width = staticLayerBakeSurfaceWidth(surface);
                    const height = staticLayerBakeSurfaceHeight(surface);
                    throw new Error(backend.lastTextureError || `could not upload baked layer texture ${width}x${height}`);
                }
                uploaded += 1;
                if (options.releaseSurfacesAfterUpload) {
                    surface.canvas.width = 1;
                    surface.canvas.height = 1;
                    surface.context = null;
                    surface.releasedCanvasBacking = true;
                }
            }
        }
        return uploaded;
    }

    buildStaticLayerBake(state, bounds, visuals, options = {}) {
        const layers = {
            background: this.createStaticLayerBakeLayer(bounds, options),
            terrain: this.createStaticLayerBakeLayer(bounds, options),
            foreground: this.createStaticLayerBakeLayer(bounds, options)
        };

        const previousContext = this.ctx;
        const previousBackgroundOffset = { ...this.frameBackgroundOffset };
        const previousForegroundOffset = { ...this.frameForegroundOffset };
        const previousMaskCanvas = this.caveWindowMaskCanvas;
        const previousMaskKey = this.caveWindowMaskKey;
        this.frameBackgroundOffset.x = 0;
        this.frameBackgroundOffset.y = 0;
        this.frameForegroundOffset.x = 0;
        this.frameForegroundOffset.y = 0;
        try {
            const uploadOptions = { releaseSurfacesAfterUpload: Boolean(options.releaseSurfacesAfterUpload) };
            this.drawIntoStaticLayerBakeSurfaces(layers.background, (bakeView) => {
                this.drawStaticWorldVisualPartition(state, bakeView, "background");
            }, uploadOptions);

            this.drawIntoStaticLayerBakeSurfaces(layers.terrain, (bakeView) => {
                const mainResult = this.drawStaticWorldVisualPartition(state, bakeView, "main");
                this.drawStaticWorldGeometryForBake(state, bakeView, mainResult);
            }, uploadOptions);

            this.drawIntoStaticLayerBakeSurfaces(layers.foreground, (bakeView) => {
                this.drawStaticWorldVisualPartition(state, bakeView, "actorFront");
                this.drawStaticWorldVisualPartition(state, bakeView, "caveForeground");
                drawCaveWindowMask({
                    targetContext: this.ctx,
                    maskCanvas: null,
                    previousRenderKey: "",
                    caveWindow: this.caveWindow,
                    view: bakeView,
                    worldBounds: state.world?.bounds,
                    parallax: 1,
                    drawToTarget: true,
                    scrollPaddingPixels: 0
                });
            }, uploadOptions);
        } finally {
            this.ctx = previousContext;
            this.frameBackgroundOffset.x = previousBackgroundOffset.x;
            this.frameBackgroundOffset.y = previousBackgroundOffset.y;
            this.frameForegroundOffset.x = previousForegroundOffset.x;
            this.frameForegroundOffset.y = previousForegroundOffset.y;
            this.caveWindowMaskCanvas = previousMaskCanvas;
            this.caveWindowMaskKey = previousMaskKey;
        }

        const chunkCount = staticLayerBakeSurfaceCount(layers);
        return {
            width: bounds.w,
            height: bounds.h,
            originX: bounds.x,
            originY: bounds.y,
            visualSource: visuals,
            chunked: Boolean(options.chunked),
            chunkSize: options.chunked ? Math.max(256, Math.floor(Number(options.chunkSize) || STATIC_LAYER_BAKE_WEBGL_CHUNK_SIZE)) : 0,
            chunkCount,
            layers
        };
    }

    drawStaticWorldVisualPartition(state, view, partitionName) {
        const cache = this.getWorldVisualCache(state);
        const entries = Array.isArray(cache?.[partitionName]) ? cache[partitionName] : [];
        const overlapCache = partitionName === "main" ? this.ensureOverlapBlendCache(state) : null;
        const drawnBlendGroups = this.frameDrawnBlendGroups;
        if (overlapCache) drawnBlendGroups.clear();
        let drewAny = false;
        let hasRenderableVisuals = false;
        for (const { visual, bounds } of entries) {
            if (!visualCanBeBakedStatic(visual)) continue;
            const blendGroup = overlapCache?.memberToGroup?.get(visual);
            if (blendGroup) {
                hasRenderableVisuals = true;
                if (!drawnBlendGroups.has(blendGroup)) {
                    drawnBlendGroups.add(blendGroup);
                    if (this.drawOverlapBlendGroup(blendGroup, view)) drewAny = true;
                }
                continue;
            }
            if (visual.kind === "atlasSprite") {
                hasRenderableVisuals = true;
                if (this.drawAtlasSpriteVisual(visual, view, null, bounds)) drewAny = true;
            } else if (visual.kind === "cutoutMask") {
                if (this.drawCutoutMaskVisual(visual, view, bounds)) drewAny = true;
            }
        }
        return { drewAny, hasRenderableVisuals };
    }

    drawStaticWorldGeometryForBake(state, view, visualResult) {
        this.drawWorldCanvasGeometry(state, view, {
            hasRenderableVisuals: Boolean(visualResult?.hasRenderableVisuals)
        });
    }

    drawBakedDynamicWorldVisuals(state, view, partitionName) {
        const cache = this.getWorldVisualCache(state);
        const parallaxOffset = partitionName === "background"
            ? this.frameBackgroundOffset
            : (partitionName === "caveForeground" ? this.frameForegroundOffset : null);
        const query = queryWorldVisualEntries(
            cache,
            partitionName,
            view,
            parallaxOffset,
            VISUAL_CULL_MARGIN_PX,
            this.worldVisualQueryScratchFor(partitionName)
        );
        this.frameVisualCounters.spatialCulled += query.spatialCulled;
        let drewAny = false;
        for (const { visual, bounds } of query.entries) {
            if (!visualIsBakedDynamic(visual)) continue;
            if (visual.kind === "atlasSprite") {
                if (this.drawAtlasSpriteVisual(visual, view, state, bounds)) drewAny = true;
            } else if (visual.kind === "cutoutMask") {
                if (this.drawCutoutMaskVisual(visual, view, bounds)) drewAny = true;
            }
        }
        return drewAny;
    }

    drawStaticLayerBakeCanvas(layer, view, parallaxOffset = null) {
        if (!layer) return 0;
        const drawStart = rendererNowMs();
        const zoom = Math.max(0.0001, Number(view?.zoom) || 1);
        const viewLeft = (Number(view?.x) || 0) + (Number(parallaxOffset?.x) || 0);
        const viewTop = (Number(view?.y) || 0) + (Number(parallaxOffset?.y) || 0);
        const sourceWidth = Math.max(1, (Number(view?.w) || 1) / zoom);
        const sourceHeight = Math.max(1, (Number(view?.h) || 1) / zoom);
        const viewRight = viewLeft + sourceWidth;
        const viewBottom = viewTop + sourceHeight;
        for (const surface of staticLayerBakeLayerSurfaces(layer)) {
            if (!surface?.canvas) continue;
            const originX = Number(surface.originX) || 0;
            const originY = Number(surface.originY) || 0;
            const surfaceRight = originX + staticLayerBakeSurfaceWidth(surface);
            const surfaceBottom = originY + staticLayerBakeSurfaceHeight(surface);
            const worldLeft = Math.max(viewLeft, originX);
            const worldTop = Math.max(viewTop, originY);
            const worldRight = Math.min(viewRight, surfaceRight);
            const worldBottom = Math.min(viewBottom, surfaceBottom);
            const sw = worldRight - worldLeft;
            const sh = worldBottom - worldTop;
            if (sw <= 0 || sh <= 0) continue;
            const sx = worldLeft - originX;
            const sy = worldTop - originY;
            this.ctx.drawImage(
                surface.canvas,
                sx,
                sy,
                sw,
                sh,
                (worldLeft - viewLeft) * zoom,
                (worldTop - viewTop) * zoom,
                sw * zoom,
                sh * zoom
            );
        }
        return rendererNowMs() - drawStart;
    }

    queueStaticLayerBakeCanvasWebGL(layer, view, parallaxOffset = null) {
        const result = { ms: 0, attempted: 0, queued: 0, failed: 0, error: "" };
        if (!layer || !this.webglBackend?.available) return result;
        const drawStart = rendererNowMs();
        const zoom = Math.max(0.0001, Number(view?.zoom) || 1);
        const viewLeft = (Number(view?.x) || 0) + (Number(parallaxOffset?.x) || 0);
        const viewTop = (Number(view?.y) || 0) + (Number(parallaxOffset?.y) || 0);
        const sourceWidth = Math.max(1, (Number(view?.w) || 1) / zoom);
        const sourceHeight = Math.max(1, (Number(view?.h) || 1) / zoom);
        const viewRight = viewLeft + sourceWidth;
        const viewBottom = viewTop + sourceHeight;
        for (const surface of staticLayerBakeLayerSurfaces(layer)) {
            if (!surface?.canvas) continue;
            const originX = Number(surface.originX) || 0;
            const originY = Number(surface.originY) || 0;
            const surfaceRight = originX + staticLayerBakeSurfaceWidth(surface);
            const surfaceBottom = originY + staticLayerBakeSurfaceHeight(surface);
            const worldLeft = Math.max(viewLeft, originX);
            const worldTop = Math.max(viewTop, originY);
            const worldRight = Math.min(viewRight, surfaceRight);
            const worldBottom = Math.min(viewBottom, surfaceBottom);
            const sw = worldRight - worldLeft;
            const sh = worldBottom - worldTop;
            if (sw <= 0 || sh <= 0) continue;
            const sx = worldLeft - originX;
            const sy = worldTop - originY;
            result.attempted += 1;
            const queued = this.webglBackend.queueSprite({
                source: surface.canvas,
                sourceX: sx,
                sourceY: sy,
                sourceWidth: sw,
                sourceHeight: sh,
                centerX: (worldLeft - viewLeft) * zoom + sw * zoom * 0.5,
                centerY: (worldTop - viewTop) * zoom + sh * zoom * 0.5,
                width: sw * zoom,
                height: sh * zoom,
                dynamic: false
            });
            if (queued) {
                result.queued += 1;
            } else {
                result.failed += 1;
                result.error ||= this.webglBackend.lastTextureError || `could not queue baked layer texture ${staticLayerBakeSurfaceWidth(surface)}x${staticLayerBakeSurfaceHeight(surface)}`;
            }
        }
        result.ms = rendererNowMs() - drawStart;
        return result;
    }

    staticLayerBakeWebGLDrawSucceeded(result, label = "layer") {
        if (!result || result.failed <= 0) return true;
        const detail = `${label} baked layer texture draw failed (${result.queued}/${result.attempted} chunks queued): ${result.error || "unknown WebGL texture failure"}`;
        this.disableStaticLayerBakeAfterFailure(detail);
        return false;
    }

    drawBakedDynamicWorldVisualsWebGL(state, view, partitionName) {
        const cache = this.getWorldVisualCache(state);
        const parallaxOffset = partitionName === "background"
            ? this.frameBackgroundOffset
            : (partitionName === "caveForeground" ? this.frameForegroundOffset : null);
        const query = queryWorldVisualEntries(
            cache,
            partitionName,
            view,
            parallaxOffset,
            VISUAL_CULL_MARGIN_PX,
            this.worldVisualQueryScratchFor(partitionName)
        );
        this.frameVisualCounters.spatialCulled += query.spatialCulled;
        let drewAny = false;
        for (const { visual, bounds } of query.entries) {
            if (!visualIsBakedDynamic(visual)) continue;
            if (visual.kind === "atlasSprite") {
                if (this.queueAtlasSpriteVisualWebGL(visual, view, state, bounds)) drewAny = true;
            } else if (visual.kind === "cutoutMask") {
                if (this.queueCutoutMaskVisualWebGL(visual, view, bounds)) drewAny = true;
            }
        }
        return drewAny;
    }

    clearStagingLayer() {
        const ctx = this.ctx;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.filter = "none";
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.restore();
    }

    uploadStagingLayer(view) {
        const backend = this.webglBackend;
        if (!backend?.available) return false;
        backend.flush();
        return backend.queueSurface(this.canvas, 0, 0, view.w, view.h, 1, true);
    }

    renderWebGL2StaticTiles(state, inputFrame, view, frameStart) {
        if (state.debug?.showCollision || state.debug?.showAssetGuides) {
            this.staticLayerBake.status = "tile baking is bypassed while collision/asset-guide overlays are visible";
            return false;
        }
        const cache = this.ensureStaticTileBakeCache(state, view);
        const backend = this.webglBackend;
        if (!cache || !backend?.available) return false;

        const backgroundStart = rendererNowMs();
        const backgroundTiles = this.queueStaticTileLayerWebGL(cache, "background", view, this.frameBackgroundOffset);
        if (backgroundTiles.complete) {
            this.drawBakedDynamicWorldVisualsWebGL(state, view, "background");
        } else {
            this.drawBackgroundVisualsWebGL(state, view);
        }
        backend.flush();
        const backgroundEnd = rendererNowMs();

        const terrainStart = rendererNowMs();
        const terrainTiles = this.queueStaticTileLayerWebGL(cache, "terrain", view, null);
        if (terrainTiles.complete) {
            this.drawBakedDynamicWorldVisualsWebGL(state, view, "main");
        } else {
            const visualResult = this.drawOrderedWorldVisualsWebGL(state, view, false);
            const needsWorldCanvasLayer = Boolean(!visualResult.hasRenderableVisuals);
            if (needsWorldCanvasLayer) {
                this.clearStagingLayer();
                this.drawBackdrop(view);
                this.drawWorldCanvasGeometry(state, view, visualResult);
                this.uploadStagingLayer(view);
            }
        }
        backend.flush();
        const worldMainEnd = rendererNowMs();
        this.drawPortalIntroGlowWebGL(state, view);
        backend.flush();
        const worldEnd = rendererNowMs();
        this.frameRenderBreakdown.clearBackdropMs = backgroundStart - frameStart;
        this.frameRenderBreakdown.backgroundMs = backgroundEnd - backgroundStart;
        this.frameRenderBreakdown.worldVisualsMs += backgroundTiles.ms + terrainTiles.ms;
        this.frameRenderBreakdown.worldGeometryMs += Math.max(0, worldMainEnd - terrainStart - terrainTiles.ms);
        this.frameRenderBreakdown.portalMs = worldEnd - worldMainEnd;

        this.drawTargetsWebGL(state, view);
        this.drawPickupsWebGL(state, view);
        this.drawEnemiesWebGL(state, view);
        this.drawWorldEffectsWebGL(state, view);

        const hasResidualWorldEffects = (state.effects?.smokePuffs || []).some((puff) => (
            puff.kind !== "wizardDeathCoverSpark" &&
            !WEBGL_DIRECT_WORLD_EFFECT_KINDS.has(puff.kind)
        ));
        if (hasResidualWorldEffects) {
            this.clearStagingLayer();
            this.drawWorldEffects(state, view, { skipKinds: WEBGL_DIRECT_WORLD_EFFECT_KINDS });
            this.uploadStagingLayer(view);
        }

        this.drawProjectileExplosionEffectsWebGL(state, view);
        const handledProjectileIds = this.frameHandledProjectileIds;
        handledProjectileIds.clear();
        this.drawEnemyProjectilesWebGL(state, view, handledProjectileIds);
        this.drawPlayerRocketsWebGL(state, view, handledProjectileIds);
        const hasResidualProjectiles = (state.projectiles || []).some((projectile) => (
            projectile.state === "launched" &&
            !handledProjectileIds.has(projectile.id) &&
            visualIntersectsViewport(this.projectileRenderBounds(projectile), view, null, 96)
        ));
        if (hasResidualProjectiles) {
            this.clearStagingLayer();
            this.drawProjectiles(state, view, {
                skipExploding: true,
                skipProjectileIds: handledProjectileIds
            });
            this.uploadStagingLayer(view);
        }

        this.drawPlayerWebGL(state, view);
        this.drawPlayerFuelBulbWebGL(state, view);
        this.drawPlayerDeathCoverWebGL(state, view);
        this.drawScorePopupsWebGL(state, view);
        if (state.debug?.showPuppetGuide) {
            this.clearStagingLayer();
            this.drawEnemyGuides(state, view);
            this.uploadStagingLayer(view);
        }
        backend.flush();
        const actorsEnd = rendererNowMs();

        const foregroundReady = this.staticTileVisibleRecords(cache, "foreground", view, this.frameForegroundOffset).complete;
        let foregroundTiles = { complete: false, ms: 0, tiles: 0, failed: 0 };
        if (foregroundReady) {
            this.drawBakedDynamicWorldVisualsWebGL(state, view, "actorFront");
            this.drawBakedDynamicWorldVisualsWebGL(state, view, "caveForeground");
            foregroundTiles = this.queueStaticTileLayerWebGL(cache, "foreground", view, this.frameForegroundOffset);
        } else {
            this.drawOrderedWorldVisualsWebGL(state, view, true);
            this.drawCaveForegroundVisualsWebGL(state, view);
        }
        backend.flush();
        const foregroundEnd = rendererNowMs();

        this.drawCaveWindowWebGL(state, view);
        backend.flush();
        const maskEnd = rendererNowMs();

        const story = state.story?.mailboxEvent;
        const hasStoryOverlay = Boolean(story?.active && (story.phase === "letter" || story.phase === "thought"));
        const hasDebugOverlay = Boolean(state.debug?.showHitboxes || state.debug?.showVelocity);
        if (hasStoryOverlay || hasDebugOverlay) {
            this.clearStagingLayer();
            if (hasStoryOverlay) this.drawMailboxStoryOverlay(state, view);
            if (hasDebugOverlay) this.drawDebug(state, view, inputFrame);
            this.uploadStagingLayer(view);
        }
        const gpuStats = backend.endFrame();
        const frameEnd = rendererNowMs();
        cache.drawMs = backgroundTiles.ms + terrainTiles.ms + foregroundTiles.ms;
        this.staticLayerBake.lastDrawMs = cache.drawMs;
        this.staticLayerBake.lastUsed = backgroundTiles.complete || terrainTiles.complete || foregroundTiles.complete;
        cache.readyVisibleLayers = Number(backgroundTiles.complete) + Number(terrainTiles.complete) + Number(foregroundTiles.complete);
        this.updatePerformanceDiagnostics({
            frameMs: frameEnd - frameStart,
            worldMs: worldEnd - frameStart,
            actorsMs: actorsEnd - worldEnd,
            foregroundMs: foregroundEnd - actorsEnd,
            maskMs: maskEnd - foregroundEnd,
            overlayMs: frameEnd - maskEnd,
            gpuStats
        });
        return true;
    }

    renderWebGL2StaticBake(state, inputFrame, view, frameStart) {
        if (state.debug?.showCollision || state.debug?.showAssetGuides) {
            this.staticLayerBake.status = "disabled while collision/asset-guide debug overlays are visible";
            return false;
        }
        const bake = this.ensureStaticLayerBake(state, view);
        if (!bake) return false;
        const backend = this.webglBackend;
        if (!backend?.available) return false;
        this.staticLayerBake.lastUsed = true;

        const backgroundStart = rendererNowMs();
        const backgroundDraw = this.queueStaticLayerBakeCanvasWebGL(bake.layers.background, view, this.frameBackgroundOffset);
        if (!this.staticLayerBakeWebGLDrawSucceeded(backgroundDraw, "background")) return false;
        const backgroundDrawMs = backgroundDraw.ms;
        this.drawBakedDynamicWorldVisualsWebGL(state, view, "background");
        backend.flush();
        const backgroundEnd = rendererNowMs();

        const terrainDrawStart = rendererNowMs();
        const terrainDraw = this.queueStaticLayerBakeCanvasWebGL(bake.layers.terrain, view, null);
        if (!this.staticLayerBakeWebGLDrawSucceeded(terrainDraw, "terrain")) return false;
        const terrainDrawMs = terrainDraw.ms;
        this.drawBakedDynamicWorldVisualsWebGL(state, view, "main");
        backend.flush();
        const worldMainEnd = rendererNowMs();
        this.drawPortalIntroGlowWebGL(state, view);
        backend.flush();
        const worldEnd = rendererNowMs();
        this.frameRenderBreakdown.clearBackdropMs = backgroundStart - frameStart;
        this.frameRenderBreakdown.backgroundMs = backgroundEnd - backgroundStart;
        this.frameRenderBreakdown.worldVisualsMs += backgroundDrawMs + terrainDrawMs;
        this.frameRenderBreakdown.worldGeometryMs += Math.max(0, worldMainEnd - terrainDrawStart - terrainDrawMs);
        this.frameRenderBreakdown.portalMs = worldEnd - worldMainEnd;

        this.drawTargetsWebGL(state, view);
        this.drawPickupsWebGL(state, view);
        this.drawEnemiesWebGL(state, view);
        this.drawWorldEffectsWebGL(state, view);

        const hasResidualWorldEffects = (state.effects?.smokePuffs || []).some((puff) => (
            puff.kind !== "wizardDeathCoverSpark" &&
            !WEBGL_DIRECT_WORLD_EFFECT_KINDS.has(puff.kind)
        ));
        if (hasResidualWorldEffects) {
            this.clearStagingLayer();
            this.drawWorldEffects(state, view, { skipKinds: WEBGL_DIRECT_WORLD_EFFECT_KINDS });
            this.uploadStagingLayer(view);
        }

        this.drawProjectileExplosionEffectsWebGL(state, view);
        const handledProjectileIds = this.frameHandledProjectileIds;
        handledProjectileIds.clear();
        this.drawEnemyProjectilesWebGL(state, view, handledProjectileIds);
        this.drawPlayerRocketsWebGL(state, view, handledProjectileIds);
        const hasResidualProjectiles = (state.projectiles || []).some((projectile) => (
            projectile.state === "launched" &&
            !handledProjectileIds.has(projectile.id) &&
            visualIntersectsViewport(this.projectileRenderBounds(projectile), view, null, 96)
        ));
        if (hasResidualProjectiles) {
            this.clearStagingLayer();
            this.drawProjectiles(state, view, {
                skipExploding: true,
                skipProjectileIds: handledProjectileIds
            });
            this.uploadStagingLayer(view);
        }

        this.drawPlayerWebGL(state, view);
        this.drawPlayerFuelBulbWebGL(state, view);
        this.drawPlayerDeathCoverWebGL(state, view);
        this.drawScorePopupsWebGL(state, view);
        if (state.debug?.showPuppetGuide) {
            this.clearStagingLayer();
            this.drawEnemyGuides(state, view);
            this.uploadStagingLayer(view);
        }
        backend.flush();
        const actorsEnd = rendererNowMs();

        this.drawBakedDynamicWorldVisualsWebGL(state, view, "actorFront");
        this.drawBakedDynamicWorldVisualsWebGL(state, view, "caveForeground");
        const foregroundBakeStart = rendererNowMs();
        const foregroundDraw = this.queueStaticLayerBakeCanvasWebGL(bake.layers.foreground, view, this.frameForegroundOffset);
        if (!this.staticLayerBakeWebGLDrawSucceeded(foregroundDraw, "foreground")) return false;
        const foregroundDrawMs = foregroundDraw.ms;
        backend.flush();
        const foregroundEnd = rendererNowMs();
        this.staticLayerBake.lastDrawMs = backgroundDrawMs + terrainDrawMs + foregroundDrawMs;

        const maskEnd = foregroundEnd;
        this.frameRenderBreakdown.worldVisualsMs += Math.max(0, foregroundEnd - foregroundBakeStart);
        const story = state.story?.mailboxEvent;
        const hasStoryOverlay = Boolean(story?.active && (story.phase === "letter" || story.phase === "thought"));
        const hasDebugOverlay = Boolean(
            state.debug?.showHitboxes ||
            state.debug?.showVelocity
        );
        if (hasStoryOverlay || hasDebugOverlay) {
            this.clearStagingLayer();
            if (hasStoryOverlay) this.drawMailboxStoryOverlay(state, view);
            if (hasDebugOverlay) this.drawDebug(state, view, inputFrame);
            this.uploadStagingLayer(view);
        }
        const gpuStats = backend.endFrame();
        const frameEnd = rendererNowMs();
        this.updatePerformanceDiagnostics({
            frameMs: frameEnd - frameStart,
            worldMs: worldEnd - frameStart,
            actorsMs: actorsEnd - worldEnd,
            foregroundMs: foregroundEnd - actorsEnd,
            maskMs: maskEnd - foregroundEnd,
            overlayMs: frameEnd - maskEnd,
            gpuStats
        });
        return true;
    }

    renderWebGL2(state, inputFrame, dt) {
        const frameStart = rendererNowMs();
        const view = this.prepareFrame(state, dt, frameStart);
        const backend = this.webglBackend;
        if (!backend.beginFrame(view.w, view.h, LEVEL_BACKGROUND_COLOR)) {
            return;
        }
        if (this.isStaticTileBakeEnabled() && this.renderWebGL2StaticTiles(state, inputFrame, view, frameStart)) {
            return;
        }
        if (this.isFullStaticLayerBakeEnabled() && this.renderWebGL2StaticBake(state, inputFrame, view, frameStart)) {
            return;
        }

        this.drawBackgroundVisualsWebGL(state, view);
        const visualResult = this.drawOrderedWorldVisualsWebGL(state, view, false);
        const needsWorldCanvasLayer = Boolean(
            state.debug.showCollision ||
            state.debug.showAssetGuides ||
            !visualResult.hasRenderableVisuals
        );
        if (needsWorldCanvasLayer) {
            this.clearStagingLayer();
            this.drawBackdrop(view);
            this.drawWorldCanvasGeometry(state, view, visualResult);
            this.uploadStagingLayer(view);
        }
        backend.flush();
        const worldEnd = rendererNowMs();

        this.drawPortalIntroGlowWebGL(state, view);
        this.drawTargetsWebGL(state, view);
        this.drawPickupsWebGL(state, view);
        this.drawEnemiesWebGL(state, view);
        this.drawWorldEffectsWebGL(state, view);

        const hasResidualWorldEffects = (state.effects?.smokePuffs || []).some((puff) => (
            puff.kind !== "wizardDeathCoverSpark" &&
            !WEBGL_DIRECT_WORLD_EFFECT_KINDS.has(puff.kind)
        ));
        if (hasResidualWorldEffects) {
            this.clearStagingLayer();
            this.drawWorldEffects(state, view, { skipKinds: WEBGL_DIRECT_WORLD_EFFECT_KINDS });
            this.uploadStagingLayer(view);
        }

        this.drawProjectileExplosionEffectsWebGL(state, view);
        const handledProjectileIds = this.frameHandledProjectileIds;
        handledProjectileIds.clear();
        this.drawEnemyProjectilesWebGL(state, view, handledProjectileIds);
        this.drawPlayerRocketsWebGL(state, view, handledProjectileIds);
        const hasResidualProjectiles = (state.projectiles || []).some((projectile) => (
            projectile.state === "launched" &&
            !handledProjectileIds.has(projectile.id) &&
            visualIntersectsViewport(this.projectileRenderBounds(projectile), view, null, 96)
        ));
        if (hasResidualProjectiles) {
            this.clearStagingLayer();
            this.drawProjectiles(state, view, {
                skipExploding: true,
                skipProjectileIds: handledProjectileIds
            });
            this.uploadStagingLayer(view);
        }

        this.drawPlayerWebGL(state, view);
        this.drawPlayerFuelBulbWebGL(state, view);
        this.drawPlayerDeathCoverWebGL(state, view);
        this.drawScorePopupsWebGL(state, view);
        if (state.debug.showPuppetGuide) {
            this.clearStagingLayer();
            this.drawEnemyGuides(state, view);
            this.uploadStagingLayer(view);
        }
        backend.flush();
        const actorsEnd = rendererNowMs();

        this.drawOrderedWorldVisualsWebGL(state, view, true);
        this.drawCaveForegroundVisualsWebGL(state, view);
        backend.flush();
        const foregroundEnd = rendererNowMs();

        this.drawCaveWindowWebGL(state, view);
        backend.flush();
        const maskEnd = rendererNowMs();

        const story = state.story?.mailboxEvent;
        const hasStoryOverlay = Boolean(story?.active && (story.phase === "letter" || story.phase === "thought"));
        const hasDebugOverlay = Boolean(
            state.debug.showCollision ||
            state.debug.showHitboxes ||
            state.debug.showVelocity
        );
        if (hasStoryOverlay || hasDebugOverlay) {
            this.clearStagingLayer();
            if (hasStoryOverlay) this.drawMailboxStoryOverlay(state, view);
            if (hasDebugOverlay) this.drawDebug(state, view, inputFrame);
            this.uploadStagingLayer(view);
        }
        const gpuStats = backend.endFrame();
        const frameEnd = rendererNowMs();
        this.updatePerformanceDiagnostics({
            frameMs: frameEnd - frameStart,
            worldMs: worldEnd - frameStart,
            actorsMs: actorsEnd - worldEnd,
            foregroundMs: foregroundEnd - actorsEnd,
            maskMs: maskEnd - foregroundEnd,
            overlayMs: frameEnd - maskEnd,
            gpuStats
        });
    }

    updatePerformanceDiagnostics(timings) {
        const previousAverage = Number(this.performanceDiagnostics.averageFrameMs) || 0;
        const frameMs = Math.max(0, Number(timings.frameMs) || 0);
        const averageFrameMs = previousAverage > 0
            ? previousAverage * 0.9 + frameMs * 0.1
            : frameMs;
        const gpuStats = timings.gpuStats || this.webglBackend?.getDiagnostics?.() || {};
        this.performanceDiagnostics = {
            backend: String(gpuStats.backend || this.renderBackend),
            gpuDrawCalls: Math.max(0, Number(gpuStats.drawCalls) || 0),
            gpuQuads: Math.max(0, Number(gpuStats.quads) || 0),
            gpuTextureUploads: Math.max(0, Number(gpuStats.textureUploads) || 0),
            gpuTextureUpdates: Math.max(0, Number(gpuStats.textureUpdates) || 0),
            gpuCanvasLayerUploads: Math.max(0, Number(gpuStats.canvasLayerUploads) || 0),
            gpuTextureCount: Math.max(0, Number(gpuStats.staticTextureCount) || 0),
            gpuResidentTextureBytes: Math.max(0, Number(gpuStats.residentTextureBytes) || 0),
            gpuContextLost: Boolean(gpuStats.contextLost),
            frameMs,
            averageFrameMs,
            worldMs: Math.max(0, Number(timings.worldMs) || 0),
            actorsMs: Math.max(0, Number(timings.actorsMs) || 0),
            foregroundMs: Math.max(0, Number(timings.foregroundMs) || 0),
            maskMs: Math.max(0, Number(timings.maskMs) || 0),
            overlayMs: Math.max(0, Number(timings.overlayMs) || 0),
            clearBackdropMs: Math.max(0, Number(this.frameRenderBreakdown.clearBackdropMs) || 0),
            backgroundMs: Math.max(0, Number(this.frameRenderBreakdown.backgroundMs) || 0),
            worldVisualsMs: Math.max(0, Number(this.frameRenderBreakdown.worldVisualsMs) || 0),
            worldGeometryMs: Math.max(0, Number(this.frameRenderBreakdown.worldGeometryMs) || 0),
            portalMs: Math.max(0, Number(this.frameRenderBreakdown.portalMs) || 0),
            observedFps: this.lastObservedFrameDt > 0 ? 1 / this.lastObservedFrameDt : 0,
            visualsConsidered: this.frameVisualCounters.considered,
            visualsDrawn: this.frameVisualCounters.drawn,
            visualsCulled: this.frameVisualCounters.culled + this.frameVisualCounters.spatialCulled,
            visualsSpatialCulled: this.frameVisualCounters.spatialCulled,
            foregroundCacheHits: this.frameVisualCounters.foregroundCacheHits,
            foregroundCacheMisses: this.frameVisualCounters.foregroundCacheMisses,
            dynamicConsidered: this.frameVisualCounters.dynamicConsidered,
            dynamicDrawn: this.frameVisualCounters.dynamicDrawn,
            dynamicCulled: this.frameVisualCounters.dynamicCulled,
            maskReused: this.frameVisualCounters.maskReused,
            staticBakeAvailable: ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER === true,
            staticBakeEnabled: this.isStaticLayerBakeEnabled(),
            staticBakeReady: Boolean(this.staticLayerBake.cache || this.staticLayerBake.tileCache),
            staticBakeUsed: this.staticLayerBake.lastUsed === true,
            staticBakeBytes: Math.max(0, Number(this.staticLayerBake.bytes) || 0),
            staticBakeBuildMs: Math.max(0, Number(this.staticLayerBake.lastBuildMs) || 0),
            staticBakeDrawMs: Math.max(0, Number(this.staticLayerBake.lastDrawMs) || 0),
            staticBakeChunks: Math.max(0, Number(this.staticLayerBake.chunkCount) || 0),
            staticBakeFailures: Math.max(0, Number(this.staticLayerBake.failureCount) || 0),
            staticBakeMode: this.staticLayerBake.mode || "off",
            staticBakeLastInvalidationReason: this.staticLayerBake.lastInvalidationReason || "",
            staticBakeStatus: ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER
                ? (this.staticLayerBake.lastError || this.staticLayerBake.status || "off")
                : STATIC_LAYER_BAKE_DISABLED_STATUS
        };
    }

    computeView(state) {
        const w = this.viewport.w;
        const h = this.viewport.h;
        const dpr = this.viewport.dpr;
        const override = this.viewOverride;
        const clientW = this.viewport.clientW || w / dpr;
        const backingPixelsPerCssPixel = w / Math.max(1, clientW);
        const zoom = override?.cssZoom
            ? override.cssZoom * backingPixelsPerCssPixel
            : (override?.zoom || this.viewport.zoom || dpr);
        return {
            w,
            h,
            dpr,
            zoom,
            cssScale: this.viewport.cssScale || 1,
            clientW,
            clientH: this.viewport.clientH || h / dpr,
            virtualW: w / zoom,
            virtualH: h / zoom,
            minVirtualW: this.viewport.minVirtualW || MIN_TOUCH_VIEWPORT_WIDTH,
            x: override ? override.x : state.camera.x - w / zoom * 0.5,
            y: override ? override.y : state.camera.y - h / zoom * 0.56
        };
    }

    getViewportMetrics() {
        return { ...this.viewport };
    }

    getLastComputedView() {
        return this.lastComputedView ? { ...this.lastComputedView } : null;
    }

    setViewOverride(view = null) {
        if (!view) {
            this.viewOverride = null;
            return;
        }
        const cssZoom = Number(view.cssZoom);
        const zoom = Number(view.zoom);
        this.viewOverride = {
            x: Number(view.x) || 0,
            y: Number(view.y) || 0,
            cssZoom: Number.isFinite(cssZoom) && cssZoom > 0 ? Math.max(0.01, cssZoom) : null,
            zoom: Number.isFinite(zoom) && zoom > 0 ? Math.max(0.01, zoom) : 1
        };
    }

    worldToScreen(view, x, y) {
        return {
            x: (x - view.x) * view.zoom,
            y: (y - view.y) * view.zoom
        };
    }

    dynamicBoundsVisible(bounds, view, marginPixels = 96) {
        this.frameVisualCounters.dynamicConsidered += 1;
        const visible = visualIntersectsViewport(bounds, view, null, marginPixels);
        if (!visible) {
            this.frameVisualCounters.dynamicCulled += 1;
        }
        return visible;
    }

    markDynamicDrawn() {
        this.frameVisualCounters.dynamicDrawn += 1;
    }

    projectileRenderBounds(projectile) {
        const extent = Math.max(36, Number(projectile?.radius) || 0, Number(projectile?.areaDamageRadius) || 0);
        let minX = (Number(projectile?.x) || 0) - extent;
        let minY = (Number(projectile?.y) || 0) - extent;
        let maxX = (Number(projectile?.x) || 0) + extent;
        let maxY = (Number(projectile?.y) || 0) + extent;
        for (const point of projectile?.trail || []) {
            const x = Number(point?.x);
            const y = Number(point?.y);
            if (!Number.isFinite(x) || !Number.isFinite(y)) {
                continue;
            }
            minX = Math.min(minX, x - extent);
            minY = Math.min(minY, y - extent);
            maxX = Math.max(maxX, x + extent);
            maxY = Math.max(maxY, y + extent);
        }
        return { minX, minY, maxX, maxY };
    }

    clear(view) {
        const ctx = this.ctx;
        // Flat cave backing. Theme art should define the scene, and ultra-faint
        // gradients can band on some displays.
        ctx.fillStyle = LEVEL_BACKGROUND_COLOR;
        ctx.fillRect(0, 0, view.w, view.h);
    }

    drawBackdrop(view) {
        // Intentionally empty for the cave theme. Outdoor themes can replace this
        // later with a theme-specific sky renderer.
    }

    drawCaveWindow(state, view) {
        const result = drawCaveWindowMask({
            targetContext: this.ctx,
            maskCanvas: this.caveWindowMaskCanvas,
            previousRenderKey: this.caveWindowMaskKey,
            caveWindow: this.caveWindow,
            view,
            worldBounds: state.world?.bounds,
            parallax: this.frameForegroundParallax
        });
        this.caveWindowMaskCanvas = result.maskCanvas;
        this.caveWindowMaskKey = result.renderKey || "";
        this.frameVisualCounters.maskReused = Boolean(result.reused);
        return result.drawn;
    }

    drawCaveWindowWebGL(state, view) {
        const backend = this.webglBackend;
        if (!backend?.available) return false;
        const geometry = this.caveWindowGpuMaskGeometry || buildCaveWindowGpuMaskGeometry(this.caveWindow);
        if (geometry) {
            this.caveWindowGpuMaskGeometry = geometry;
            const parallaxOffset = computeCaveWindowParallaxOffset(
                view,
                state.world?.bounds,
                this.frameForegroundParallax
            );
            const drawn = backend.drawCaveMaskGeometry({
                geometry,
                width: view.w,
                height: view.h,
                viewX: view.x,
                viewY: view.y,
                zoom: view.zoom,
                parallaxX: parallaxOffset.x,
                parallaxY: parallaxOffset.y
            });
            if (drawn) {
                this.frameVisualCounters.maskReused = true;
                return true;
            }
        }

        // Compatibility escape hatch for unusual WebGL2 implementations that
        // refuse a stencil attachment even when one was requested.
        const result = drawCaveWindowMask({
            targetContext: this.ctx,
            maskCanvas: this.caveWindowMaskCanvas,
            previousRenderKey: this.caveWindowMaskKey,
            caveWindow: this.caveWindow,
            view,
            worldBounds: state.world?.bounds,
            parallax: this.frameForegroundParallax,
            drawToTarget: false
        });
        this.caveWindowMaskCanvas = result.maskCanvas;
        this.caveWindowMaskKey = result.renderKey || "";
        this.frameVisualCounters.maskReused = Boolean(result.reused);
        if (!result.drawn || !result.maskCanvas) return false;
        if (!result.reused) {
            backend.refreshTexture(result.maskCanvas);
        }
        return backend.queueSurface(result.maskCanvas, 0, 0, view.w, view.h, 1, false);
    }

    drawWorld(state, view) {
        const visualStart = rendererNowMs();
        const visualResult = this.drawOrderedWorldVisuals(state, view, false);
        const geometryStart = rendererNowMs();
        const result = this.drawWorldCanvasGeometry(state, view, visualResult);
        const geometryEnd = rendererNowMs();
        this.frameRenderBreakdown.worldVisualsMs += geometryStart - visualStart;
        this.frameRenderBreakdown.worldGeometryMs += geometryEnd - geometryStart;
        return result;
    }

    drawWorldCanvasGeometry(state, view, visualResult = { hasRenderableVisuals: false }) {
        const ctx = this.ctx;
        const shouldDrawCollision = Boolean(state.debug.showCollision) || !visualResult.hasRenderableVisuals;
        if (shouldDrawCollision) {
            for (const solid of state.world.solids) {
                const solidBounds = {
                    minX: Number(solid.x) || 0,
                    minY: Number(solid.y) || 0,
                    maxX: (Number(solid.x) || 0) + Math.max(0, Number(solid.w) || 0),
                    maxY: (Number(solid.y) || 0) + Math.max(0, Number(solid.h) || 0)
                };
                if (!visualIntersectsViewport(solidBounds, view, null, VISUAL_CULL_MARGIN_PX)) {
                    continue;
                }
                const p = this.worldToScreen(view, solid.x, solid.y);
                const w = solid.w * view.zoom;
                const h = solid.h * view.zoom;
                ctx.save();
                if (state.debug.showCollision) {
                    ctx.fillStyle = solid.kind === "floor" ? "rgba(122, 104, 149, 0.18)" : "rgba(92, 81, 124, 0.20)";
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
                } else {
                    ctx.fillStyle = solid.kind === "floor" ? "rgba(122, 104, 149, 0.45)" : "rgba(92, 81, 124, 0.52)";
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
                }
                ctx.lineWidth = 1.5 * view.zoom;
                ctx.beginPath();
                roundedRect(ctx, p.x, p.y, w, h, 8 * view.zoom);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
        }

        if (state.debug.showCollision) {
            this.drawCollisionSegments(state, view);
        }

        if (state.debug.showAssetGuides) {
            this.drawAssetGuides(state, view);
        }

        if (state.debug.showCollision) {
            ctx.save();
            ctx.font = `${12 * view.zoom}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
            ctx.fillStyle = "rgba(255, 255, 255, 0.64)";
            for (const label of state.world.labels) {
                const labelBounds = {
                    minX: Number(label.x) || 0,
                    minY: (Number(label.y) || 0) - 24,
                    maxX: (Number(label.x) || 0) + 360,
                    maxY: (Number(label.y) || 0) + 12
                };
                if (!visualIntersectsViewport(labelBounds, view, null, VISUAL_CULL_MARGIN_PX)) {
                    continue;
                }
                const p = this.worldToScreen(view, label.x, label.y);
                ctx.fillText(label.text, p.x, p.y);
            }
            ctx.restore();
        }
    }

    drawCollisionSegments(state, view) {
        const ctx = this.ctx;
        const segments = state.world.segments || [];
        const polygons = state.world.collisionPolygons || [];
        if (!segments.length && !polygons.length) {
            return;
        }
        ctx.save();
        for (const polygon of polygons) {
            if (!Array.isArray(polygon.points) || polygon.points.length < 3) {
                continue;
            }
            ctx.fillStyle = assetAreaColor(polygon.kind);
            ctx.beginPath();
            for (let i = 0; i < polygon.points.length; i += 1) {
                const p = this.worldToScreen(view, polygon.points[i].x, polygon.points[i].y);
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            ctx.fill();
        }
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 3 * view.zoom;
        for (const segment of segments) {
            const a = this.worldToScreen(view, segment.x1, segment.y1);
            const b = this.worldToScreen(view, segment.x2, segment.y2);
            ctx.strokeStyle = assetLineColor(segment.kind);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawOrderedWorldVisualsWebGL(state, view, actorFrontOnly = false) {
        const backend = this.webglBackend;
        if (!backend?.available) {
            return { drewAny: false, hasRenderableVisuals: false };
        }
        const cache = this.getWorldVisualCache(state);
        const partitionName = actorFrontOnly ? "actorFront" : "main";
        const query = queryWorldVisualEntries(cache, partitionName, view, null, VISUAL_CULL_MARGIN_PX, this.worldVisualQueryScratchFor(partitionName));
        this.frameVisualCounters.spatialCulled += query.spatialCulled;
        const partition = query.partition;
        const hasRenderableVisuals = this.partitionHasRenderableVisuals(partition);
        const overlapCache = actorFrontOnly ? null : this.ensureOverlapBlendCache(state);
        const drawnBlendGroups = this.frameDrawnBlendGroups;
        drawnBlendGroups.clear();
        let drewAny = false;
        for (const { visual, bounds } of query.entries) {
            const blendGroup = overlapCache?.memberToGroup?.get(visual);
            if (blendGroup) {
                if (!drawnBlendGroups.has(blendGroup)) {
                    drawnBlendGroups.add(blendGroup);
                    if (this.drawOverlapBlendGroupWebGL(blendGroup, view)) drewAny = true;
                }
                continue;
            }
            if (visual.kind === "atlasSprite") {
                if (this.queueAtlasSpriteVisualWebGL(visual, view, state, bounds)) drewAny = true;
            } else if (visual.kind === "cutoutMask") {
                if (this.queueCutoutMaskVisualWebGL(visual, view, bounds)) drewAny = true;
            }
        }
        return { drewAny, hasRenderableVisuals };
    }

    drawOverlapBlendGroupWebGL(group, view) {
        this.frameVisualCounters.considered += group?.members?.length || 1;
        if (!group?.canvas || !visualIntersectsViewport(group.bounds, view, null, VISUAL_CULL_MARGIN_PX)) {
            this.frameVisualCounters.culled += group?.members?.length || 1;
            return false;
        }
        const topLeft = this.worldToScreen(view, group.bounds.minX, group.bounds.minY);
        const width = (group.bounds.maxX - group.bounds.minX) * view.zoom;
        const height = (group.bounds.maxY - group.bounds.minY) * view.zoom;
        const queued = this.webglBackend.queueSurface(group.canvas, topLeft.x, topLeft.y, width, height, 1, false);
        if (queued) this.frameVisualCounters.drawn += 1;
        return queued;
    }

    drawBackgroundVisualsWebGL(state, view) {
        const cache = this.getWorldVisualCache(state);
        const query = queryWorldVisualEntries(
            cache,
            "background",
            view,
            this.frameBackgroundOffset,
            VISUAL_CULL_MARGIN_PX,
            this.worldVisualQueryScratchFor("background")
        );
        this.frameVisualCounters.spatialCulled += query.spatialCulled;
        let drewAny = false;
        for (const { visual, bounds } of query.entries) {
            if (visual.kind === "atlasSprite" && this.queueAtlasSpriteVisualWebGL(visual, view, state, bounds)) {
                drewAny = true;
            }
        }
        return drewAny;
    }

    drawCaveForegroundVisualsWebGL(state, view) {
        const cache = this.getWorldVisualCache(state);
        const query = queryWorldVisualEntries(
            cache,
            "caveForeground",
            view,
            this.frameForegroundOffset,
            VISUAL_CULL_MARGIN_PX,
            this.worldVisualQueryScratchFor("caveForeground")
        );
        this.frameVisualCounters.spatialCulled += query.spatialCulled;
        let drewAny = false;
        for (const { visual, bounds } of query.entries) {
            if (visual.kind === "atlasSprite" && this.queueAtlasSpriteVisualWebGL(visual, view, state, bounds)) {
                drewAny = true;
            }
        }
        return drewAny;
    }

    queueCutoutMaskVisualWebGL(mask, view, cachedBounds = null) {
        this.frameVisualCounters.considered += 1;
        const bounds = cachedBounds || visualWorldBounds(mask);
        if (!visualIntersectsViewport(bounds, view, null, VISUAL_CULL_MARGIN_PX)) {
            this.frameVisualCounters.culled += 1;
            return false;
        }
        const point = this.worldToScreen(view, mask.x, mask.y);
        const queued = this.webglBackend.queueSolidRect(
            point.x,
            point.y,
            mask.w * view.zoom,
            mask.h * view.zoom,
            LEVEL_BACKGROUND_COLOR
        );
        if (queued) this.frameVisualCounters.drawn += 1;
        return queued;
    }

    queueAtlasSpriteVisualWebGL(visual, view, state = null, cachedBounds = null) {
        if (visual.entityId && state) {
            if (this.frameEntityVisibility.collectedPickups.has(visual.entityId)) return false;
            if (visual.entityType === "targetDummy" && this.frameEntityVisibility.defeatedEnemies.has(visual.entityId)) return false;
        }
        this.frameVisualCounters.considered += 1;
        const caveForeground = visual.layer === "caveForeground";
        const worldBackground = isWorldBackgroundVisual(visual);
        const parallaxOffset = caveForeground
            ? this.frameForegroundOffset
            : (worldBackground ? this.frameBackgroundOffset : null);
        const bounds = cachedBounds || visualWorldBounds(visual);
        if (!visualIntersectsViewport(bounds, view, parallaxOffset, VISUAL_CULL_MARGIN_PX)) {
            this.frameVisualCounters.culled += 1;
            return false;
        }
        const atlas = this.environmentAtlases.get(visual.atlasId);
        if (!atlas || atlas.missing || !atlas.image) return false;
        const frameName = visual.frame || visual.assetId;
        const frame = atlas.frames?.[frameName];
        if (!frame) return false;
        const centerWorld = placementCenter(visual);
        const center = this.worldToScreen(
            view,
            centerWorld.x - (parallaxOffset?.x || 0),
            centerWorld.y - (parallaxOffset?.y || 0)
        );
        let source = atlas.renderImage || atlas.image;
        let sourceX = frame.x;
        let sourceY = frame.y;
        let sourceWidth = frame.w;
        let sourceHeight = frame.h;
        if (worldBackground) {
            source = this.getLayerBrightnessAtlas(atlas, visual.backgroundBrightness, "background");
        }
        if (caveForeground) {
            source = this.getForegroundSpriteCanvas(atlas, frameName, frame, visual);
            sourceX = 0;
            sourceY = 0;
            sourceWidth = source.width;
            sourceHeight = source.height;
        }
        const queued = this.webglBackend.queueSprite({
            source,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            centerX: center.x,
            centerY: center.y,
            width: visual.w * view.zoom,
            height: visual.h * view.zoom,
            rotation: normalizeRotationRadians(visual.rotation),
            mirrorX: Boolean(visual.mirrorX),
            mirrorY: Boolean(visual.mirrorY),
            alpha: visual.alpha ?? 1
        });
        if (queued) this.frameVisualCounters.drawn += 1;
        return queued;
    }

    drawOrderedWorldVisuals(state, view, actorFrontOnly = false) {
        const cache = this.getWorldVisualCache(state);
        const partitionName = actorFrontOnly ? "actorFront" : "main";
        const query = queryWorldVisualEntries(cache, partitionName, view, null, VISUAL_CULL_MARGIN_PX, this.worldVisualQueryScratchFor(partitionName));
        const entries = query.entries;
        this.frameVisualCounters.spatialCulled += query.spatialCulled;
        let drewAny = false;
        const partition = query.partition;
        const hasRenderableVisuals = this.partitionHasRenderableVisuals(partition);
        const overlapCache = actorFrontOnly ? null : this.ensureOverlapBlendCache(state);
        const drawnBlendGroups = this.frameDrawnBlendGroups;
        drawnBlendGroups.clear();
        for (const { visual, bounds } of entries) {
            const blendGroup = overlapCache?.memberToGroup?.get(visual);
            if (blendGroup) {
                if (!drawnBlendGroups.has(blendGroup)) {
                    drawnBlendGroups.add(blendGroup);
                    if (this.drawOverlapBlendGroup(blendGroup, view)) drewAny = true;
                }
                continue;
            }
            if (visual.kind === "atlasSprite") {
                if (this.drawAtlasSpriteVisual(visual, view, state, bounds)) {
                    drewAny = true;
                }
            } else if (visual.kind === "cutoutMask") {
                if (this.drawCutoutMaskVisual(visual, view, bounds)) {
                    drewAny = true;
                }
            }
        }
        return { drewAny, hasRenderableVisuals };
    }

    drawOverlapBlendGroup(group, view) {
        this.frameVisualCounters.considered += group?.members?.length || 1;
        if (!group?.canvas || !visualIntersectsViewport(group.bounds, view, null, VISUAL_CULL_MARGIN_PX)) {
            this.frameVisualCounters.culled += group?.members?.length || 1;
            return false;
        }
        const topLeft = this.worldToScreen(view, group.bounds.minX, group.bounds.minY);
        const width = (group.bounds.maxX - group.bounds.minX) * view.zoom;
        const height = (group.bounds.maxY - group.bounds.minY) * view.zoom;
        this.ctx.drawImage(group.canvas, topLeft.x, topLeft.y, width, height);
        this.frameVisualCounters.drawn += 1;
        return true;
    }

    drawBackgroundVisuals(state, view) {
        const cache = this.getWorldVisualCache(state);
        const query = queryWorldVisualEntries(
            cache,
            "background",
            view,
            this.frameBackgroundOffset,
            VISUAL_CULL_MARGIN_PX,
            this.worldVisualQueryScratchFor("background")
        );
        this.frameVisualCounters.spatialCulled += query.spatialCulled;
        let drewAny = false;
        for (const { visual, bounds } of query.entries) {
            if (visual.kind === "atlasSprite" && this.drawAtlasSpriteVisual(visual, view, state, bounds)) {
                drewAny = true;
            }
        }
        return drewAny;
    }

    drawCaveForegroundVisuals(state, view) {
        const cache = this.getWorldVisualCache(state);
        const query = queryWorldVisualEntries(
            cache,
            "caveForeground",
            view,
            this.frameForegroundOffset,
            VISUAL_CULL_MARGIN_PX,
            this.worldVisualQueryScratchFor("caveForeground")
        );
        this.frameVisualCounters.spatialCulled += query.spatialCulled;
        let drewAny = false;
        for (const { visual, bounds } of query.entries) {
            if (visual.kind === "atlasSprite" && this.drawAtlasSpriteVisual(visual, view, state, bounds)) {
                drewAny = true;
            }
        }
        return drewAny;
    }

    atlasVisualAvailable(visual) {
        const atlas = this.environmentAtlases.get(visual?.atlasId);
        if (!atlas || atlas.missing || !atlas.image) {
            return false;
        }
        const frameName = visual.frame || visual.assetId;
        return Boolean(atlas.frames?.[frameName]);
    }

    drawCutoutMaskVisual(mask, view, cachedBounds = null) {
        this.frameVisualCounters.considered += 1;
        const bounds = cachedBounds || visualWorldBounds(mask);
        if (!visualIntersectsViewport(bounds, view, null, VISUAL_CULL_MARGIN_PX)) {
            this.frameVisualCounters.culled += 1;
            return false;
        }
        const ctx = this.ctx;
        const p = this.worldToScreen(view, mask.x, mask.y);
        const w = mask.w * view.zoom;
        const h = mask.h * view.zoom;
        ctx.save();
        // Paint the same opaque cave backing over earlier visuals. Erasing alpha
        // would expose the browser/canvas backing as black instead of revealing
        // the intended deep blue background.
        ctx.fillStyle = LEVEL_BACKGROUND_COLOR;
        ctx.fillRect(p.x, p.y, w, h);
        ctx.restore();
        this.frameVisualCounters.drawn += 1;
        return true;
    }

    drawAtlasSpriteVisual(visual, view, state = null, cachedBounds = null) {
        if (visual.entityId && state) {
            if (this.frameEntityVisibility.collectedPickups.has(visual.entityId)) {
                return false;
            }
            if (visual.entityType === "targetDummy" && this.frameEntityVisibility.defeatedEnemies.has(visual.entityId)) {
                return false;
            }
        }

        this.frameVisualCounters.considered += 1;
        const caveForeground = visual.layer === "caveForeground";
        const worldBackground = isWorldBackgroundVisual(visual);
        const parallaxOffset = caveForeground
            ? this.frameForegroundOffset
            : (worldBackground ? this.frameBackgroundOffset : null);
        const bounds = cachedBounds || visualWorldBounds(visual);
        if (!visualIntersectsViewport(bounds, view, parallaxOffset, VISUAL_CULL_MARGIN_PX)) {
            this.frameVisualCounters.culled += 1;
            return false;
        }

        const atlas = this.environmentAtlases.get(visual.atlasId);
        if (!atlas || atlas.missing || !atlas.image) {
            return false;
        }
        const frameName = visual.frame || visual.assetId;
        const frame = atlas.frames?.[frameName];
        if (!frame) {
            return false;
        }
        const ctx = this.ctx;
        const centerWorld = placementCenter(visual);
        const center = this.worldToScreen(
            view,
            centerWorld.x - (parallaxOffset?.x || 0),
            centerWorld.y - (parallaxOffset?.y || 0)
        );
        const w = visual.w * view.zoom;
        const h = visual.h * view.zoom;
        ctx.save();
        ctx.globalAlpha *= visual.alpha ?? 1;
        ctx.translate(center.x, center.y);
        ctx.rotate(normalizeRotationRadians(visual.rotation));
        ctx.scale(visual.mirrorX ? -1 : 1, visual.mirrorY ? -1 : 1);
        if (caveForeground) {
            const cachedSprite = this.getForegroundSpriteCanvas(atlas, frameName, frame, visual);
            ctx.drawImage(cachedSprite, -w * 0.5, -h * 0.5, w, h);
        } else {
            const renderImage = worldBackground
                ? this.getLayerBrightnessAtlas(atlas, visual.backgroundBrightness, "background")
                : (atlas.renderImage || atlas.image);
            ctx.drawImage(renderImage, frame.x, frame.y, frame.w, frame.h, -w * 0.5, -h * 0.5, w, h);
        }
        ctx.restore();
        this.frameVisualCounters.drawn += 1;
        return true;
    }

    getLayerBrightnessAtlas(atlas, brightnessValue, layerName = "layer") {
        const source = atlas?.renderImage || atlas?.image;
        if (!source) return source;
        const brightness = normalizeLayerBrightness(brightnessValue);
        if (Math.abs(brightness - 1) < 0.000001) return source;
        const cacheKey = `${layerName}|${atlas.atlasId || atlas.id || "atlas"}|${this.environmentColorMapKey}|${brightness.toFixed(4)}`;
        const cached = this.layerBrightnessCache.get(cacheKey);
        if (cached) return cached;
        const cachePrefix = `${layerName}|${atlas.atlasId || atlas.id || "atlas"}|${this.environmentColorMapKey}|`;
        for (const [existingKey, existingSurface] of this.layerBrightnessCache) {
            if (existingKey === cacheKey || !existingKey.startsWith(cachePrefix)) continue;
            this.webglBackend?.invalidateTexture(existingSurface);
            this.layerBrightnessCache.delete(existingKey);
        }
        const ownerDocument = this.canvas?.ownerDocument || (typeof document !== "undefined" ? document : null);
        if (!ownerDocument?.createElement) return source;
        const width = Math.max(1, Number(source.naturalWidth || source.videoWidth || source.width) || 1);
        const height = Math.max(1, Number(source.naturalHeight || source.videoHeight || source.height) || 1);
        const surface = ownerDocument.createElement("canvas");
        surface.width = width;
        surface.height = height;
        const context = surface.getContext("2d");
        if (!context) return source;
        context.filter = `brightness(${brightness})`;
        context.drawImage(source, 0, 0, width, height);
        context.filter = "none";
        this.layerBrightnessCache.set(cacheKey, surface);
        return surface;
    }

    getForegroundSpriteCanvas(atlas, frameName, frame, visual) {
        const cacheKey = foregroundTreatmentCacheKey({
            atlasId: atlas.atlasId || visual.atlasId || "atlas",
            frameName,
            colorMapKey: this.environmentColorMapKey,
            visual
        });
        const cached = this.foregroundSpriteCache.get(cacheKey);
        if (cached) {
            this.frameVisualCounters.foregroundCacheHits += 1;
            return cached;
        }

        const ownerDocument = this.canvas?.ownerDocument || (typeof document !== "undefined" ? document : null);
        const surface = createForegroundSpriteCanvas({
            ownerDocument,
            sourceImage: atlas.renderImage || atlas.image,
            frame,
            visual
        });
        this.foregroundSpriteCache.set(cacheKey, surface);
        this.frameVisualCounters.foregroundCacheMisses += 1;
        return surface;
    }


    getTintedAtlasFrameCanvas(atlas, frameName, frame, tint) {
        const cacheKey = `${atlas.atlasId || "atlas"}|${frameName}|${this.environmentColorMapKey}|${tint}`;
        const cached = this.powerUpTintCache.get(cacheKey);
        if (cached) return cached;
        const ownerDocument = this.canvas?.ownerDocument || (typeof document !== "undefined" ? document : null);
        if (!ownerDocument?.createElement) return null;
        const surface = ownerDocument.createElement("canvas");
        surface.width = Math.max(1, Math.round(frame.w));
        surface.height = Math.max(1, Math.round(frame.h));
        const context = surface.getContext("2d");
        if (!context) return null;
        context.drawImage(
            atlas.renderImage || atlas.image,
            frame.x,
            frame.y,
            frame.w,
            frame.h,
            0,
            0,
            surface.width,
            surface.height
        );
        context.globalCompositeOperation = "source-in";
        context.fillStyle = tint;
        context.fillRect(0, 0, surface.width, surface.height);
        context.globalCompositeOperation = "source-over";
        this.powerUpTintCache.set(cacheKey, surface);
        return surface;
    }

    getSmokeStampCanvas(tint = null) {
        const key = String(tint || "neutral").toLowerCase();
        const cached = this.smokeStampCache.get(key);
        if (cached) return cached;
        const ownerDocument = this.canvas?.ownerDocument || (typeof document !== "undefined" ? document : null);
        if (!ownerDocument?.createElement) return null;
        const surface = ownerDocument.createElement("canvas");
        surface.width = 64;
        surface.height = 64;
        const context = surface.getContext("2d");
        if (!context) return null;
        const rgb = hexColorRgb(tint);
        const gradient = context.createRadialGradient(32, 32, 1, 32, 32, 31);
        if (rgb) {
            gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.34)`);
            gradient.addColorStop(0.34, "rgba(207, 198, 218, 0.88)");
        } else {
            gradient.addColorStop(0, "rgba(207, 198, 218, 1)");
        }
        gradient.addColorStop(0.56, "rgba(155, 145, 170, 0.48)");
        gradient.addColorStop(1, "rgba(92, 84, 112, 0)");
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);
        this.smokeStampCache.set(key, surface);
        return surface;
    }

    getWebGLParticleSpriteCanvas(kind = "softGlow") {
        const key = String(kind || "softGlow");
        const cached = this.webglParticleSpriteCache.get(key);
        if (cached) return cached;
        const ownerDocument = this.canvas?.ownerDocument || (typeof document !== "undefined" ? document : null);
        if (!ownerDocument?.createElement) return null;
        const surface = ownerDocument.createElement("canvas");
        const size = key === "ring" ? 96 : 64;
        surface.width = size;
        surface.height = size;
        const context = surface.getContext("2d");
        if (!context) return null;
        const cx = size * 0.5;
        const cy = size * 0.5;
        if (key === "solidDisc") {
            context.fillStyle = "rgba(255, 255, 255, 1)";
            context.beginPath();
            context.arc(cx, cy, size * 0.46, 0, Math.PI * 2);
            context.fill();
        } else if (key === "ring") {
            context.strokeStyle = "rgba(255, 255, 255, 0.95)";
            context.lineWidth = size * 0.10;
            context.beginPath();
            context.arc(cx, cy, size * 0.34, 0, Math.PI * 2);
            context.stroke();
            context.strokeStyle = "rgba(255, 255, 255, 0.34)";
            context.lineWidth = size * 0.20;
            context.beginPath();
            context.arc(cx, cy, size * 0.34, 0, Math.PI * 2);
            context.stroke();
        } else if (key === "undeathBubble") {
            const gradient = context.createRadialGradient(cx - size * 0.08, cy - size * 0.10, size * 0.03, cx, cy, size * 0.48);
            gradient.addColorStop(0, "rgba(6, 18, 0, 0.98)");
            gradient.addColorStop(0.34, "rgba(2, 8, 0, 0.98)");
            gradient.addColorStop(0.56, "rgba(43, 126, 4, 0.96)");
            gradient.addColorStop(0.72, "rgba(104, 224, 8, 0.82)");
            gradient.addColorStop(0.86, "rgba(18, 70, 0, 0.68)");
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            context.fillStyle = gradient;
            context.fillRect(0, 0, size, size);
            context.strokeStyle = "rgba(74, 184, 4, 0.54)";
            context.lineWidth = size * 0.035;
            context.beginPath();
            context.arc(cx, cy, size * 0.34, 0, Math.PI * 2);
            context.stroke();
            context.fillStyle = "rgba(154, 255, 28, 0.48)";
            context.beginPath();
            context.arc(cx - size * 0.13, cy - size * 0.14, size * 0.055, 0, Math.PI * 2);
            context.fill();
        } else if (key === "musketBall") {
            context.fillStyle = "rgba(42, 44, 49, 0.98)";
            context.beginPath();
            context.arc(cx, cy, size * 0.28, 0, Math.PI * 2);
            context.fill();
            context.fillStyle = "rgba(255, 255, 255, 0.25)";
            context.beginPath();
            context.arc(cx - size * 0.08, cy - size * 0.09, size * 0.08, 0, Math.PI * 2);
            context.fill();
        } else if (key === "rock") {
            context.fillStyle = "rgba(91, 83, 96, 0.98)";
            context.strokeStyle = "rgba(36, 31, 39, 0.98)";
            context.lineWidth = size * 0.045;
            context.beginPath();
            for (let i = 0; i < 8; i += 1) {
                const angle = i / 8 * Math.PI * 2;
                const wobble = i % 2 === 0 ? 0.32 : 0.25;
                const x = cx + Math.cos(angle) * size * wobble;
                const y = cy + Math.sin(angle) * size * wobble;
                if (i === 0) context.moveTo(x, y); else context.lineTo(x, y);
            }
            context.closePath();
            context.fill();
            context.stroke();
        } else if (key === "shadow") {
            const gradient = context.createRadialGradient(cx, cy, size * 0.05, cx, cy, size * 0.48);
            gradient.addColorStop(0, "rgba(0, 0, 0, 0.58)");
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            context.save();
            context.translate(cx, cy);
            context.scale(1, 0.25);
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(0, 0, size * 0.48, 0, Math.PI * 2);
            context.fill();
            context.restore();
        } else if (key === "targetDisc") {
            context.fillStyle = "rgba(255, 126, 98, 0.82)";
            context.strokeStyle = "rgba(255, 234, 124, 0.86)";
            context.lineWidth = size * 0.06;
            context.beginPath();
            context.arc(cx, cy, size * 0.31, 0, Math.PI * 2);
            context.fill();
            context.stroke();
        } else if (key === "pickupDisc") {
            context.fillStyle = "rgba(113, 224, 126, 0.82)";
            context.strokeStyle = "rgba(255, 255, 255, 0.65)";
            context.lineWidth = size * 0.06;
            context.beginPath();
            context.arc(cx, cy, size * 0.31, 0, Math.PI * 2);
            context.fill();
            context.stroke();
        } else if (key === "rocketFlame") {
            const gradient = context.createLinearGradient(cx, size * 0.84, cx, size * 0.14);
            gradient.addColorStop(0, "rgba(255, 115, 30, 0)");
            gradient.addColorStop(0.25, "rgba(255, 150, 40, 0.78)");
            gradient.addColorStop(0.58, "rgba(255, 238, 145, 0.94)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            context.fillStyle = gradient;
            context.beginPath();
            context.moveTo(cx, size * 0.86);
            context.quadraticCurveTo(size * 0.72, size * 0.64, cx, size * 0.14);
            context.quadraticCurveTo(size * 0.28, size * 0.64, cx, size * 0.86);
            context.closePath();
            context.fill();
        } else if (key === "diamond") {
            context.fillStyle = "rgba(255, 255, 255, 1)";
            context.beginPath();
            context.moveTo(cx, cy - size * 0.32);
            context.lineTo(cx + size * 0.16, cy);
            context.lineTo(cx, cy + size * 0.32);
            context.lineTo(cx - size * 0.16, cy);
            context.closePath();
            context.fill();
        } else if (key === "crossSpark") {
            context.strokeStyle = "rgba(255, 255, 255, 0.96)";
            context.lineWidth = size * 0.09;
            context.lineCap = "round";
            context.beginPath();
            context.moveTo(size * 0.18, cy);
            context.lineTo(size * 0.82, cy);
            context.moveTo(cx, size * 0.18);
            context.lineTo(cx, size * 0.82);
            context.stroke();
            context.fillStyle = "rgba(255, 255, 255, 1)";
            context.beginPath();
            context.arc(cx, cy, size * 0.11, 0, Math.PI * 2);
            context.fill();
        } else {
            const gradient = context.createRadialGradient(cx, cy, size * 0.05, cx, cy, size * 0.5);
            gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
            gradient.addColorStop(0.42, "rgba(255, 255, 255, 0.74)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            context.fillStyle = gradient;
            context.fillRect(0, 0, size, size);
        }
        this.webglParticleSpriteCache.set(key, surface);
        return surface;
    }

    drawPowerUpComposite(powerUp, centerX, centerY, size, time, alpha = 1) {
        const atlas = this.environmentAtlases.get(powerUp?.atlasId || "it_atlas_001");
        const glowFrameName = powerUp?.glowFrame || "powerup_glow_white";
        const iconFrameName = powerUp?.iconFrame || "powerup_icon_lightning";
        const glowFrame = atlas?.frames?.[glowFrameName];
        const iconFrame = atlas?.frames?.[iconFrameName];
        const ctx = this.ctx;
        const pulse = 0.92 + Math.sin(time * 5.4) * 0.08;
        ctx.save();
        ctx.globalAlpha *= alpha;
        ctx.translate(centerX, centerY);
        ctx.scale(pulse, pulse);
        if (atlas?.image && glowFrame && iconFrame) {
            const glow = this.getTintedAtlasFrameCanvas(atlas, glowFrameName, glowFrame, powerUp?.glowTint || "#ffb52f");
            if (glow) {
                ctx.save();
                ctx.globalCompositeOperation = "source-over";
                ctx.globalAlpha *= 0.92;
                ctx.drawImage(glow, -size * 0.58, -size * 0.58, size * 1.16, size * 1.16);
                ctx.restore();
            }
            const iconSize = size * 0.47;
            const iconAspect = iconFrame.w / Math.max(1, iconFrame.h);
            const iconW = iconAspect >= 1 ? iconSize : iconSize * iconAspect;
            const iconH = iconAspect >= 1 ? iconSize / iconAspect : iconSize;
            ctx.drawImage(
                atlas.renderImage || atlas.image,
                iconFrame.x,
                iconFrame.y,
                iconFrame.w,
                iconFrame.h,
                -iconW * 0.5,
                -iconH * 0.5,
                iconW,
                iconH
            );
        } else {
            const fallbackTint = powerUp?.glowTint || "#ffb52f";
            const gradient = ctx.createRadialGradient(0, 0, size * 0.08, 0, 0, size * 0.56);
            gradient.addColorStop(0, fallbackTint);
            gradient.addColorStop(0.5, fallbackTint);
            gradient.addColorStop(1, `${fallbackTint}00`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.56, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,0.96)";
            ctx.font = `bold ${Math.max(12, size * 0.48)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("⚡", 0, 1);
        }
        ctx.restore();
    }

    drawAssetGuides(state, view) {
        const visuals = state.world.visuals || [];
        const ctx = this.ctx;
        ctx.save();
        ctx.font = `${11 * view.zoom}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (const visual of visuals) {
            if (visual.kind === "cutoutMask") {
                const p = this.worldToScreen(view, visual.x, visual.y);
                ctx.save();
                ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
                ctx.lineWidth = 1.5 * view.zoom;
                ctx.setLineDash([8 * view.zoom, 5 * view.zoom]);
                ctx.strokeRect(p.x, p.y, visual.w * view.zoom, visual.h * view.zoom);
                ctx.setLineDash([]);
                ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
                ctx.fillText(visual.id || "cutoutMask", p.x + 4 * view.zoom, p.y - 5 * view.zoom);
                ctx.restore();
                continue;
            }
            if (visual.kind !== "atlasSprite") {
                continue;
            }
            const atlas = this.environmentAtlases.get(visual.atlasId);
            if (!atlas || !atlas.manifest) {
                continue;
            }
            const frameName = visual.frame || visual.assetId;
            const frame = atlas.frames?.[frameName];
            const object = atlas.manifest.objects?.[visual.assetId || frameName];
            if (!frame) {
                continue;
            }

            const centerWorld = placementCenter(visual);
            const center = this.worldToScreen(view, centerWorld.x, centerWorld.y);
            const visualW = visual.w * view.zoom;
            const visualH = visual.h * view.zoom;
            ctx.save();
            ctx.translate(center.x, center.y);
            ctx.rotate(normalizeRotationRadians(visual.rotation));
            ctx.strokeStyle = "rgba(86, 230, 255, 0.72)";
            ctx.lineWidth = 1.5 * view.zoom;
            ctx.setLineDash([5 * view.zoom, 4 * view.zoom]);
            ctx.strokeRect(-visualW * 0.5, -visualH * 0.5, visualW, visualH);
            ctx.setLineDash([]);
            ctx.restore();
            ctx.save();
            ctx.fillStyle = "rgba(86, 230, 255, 0.78)";
            ctx.fillText(visual.assetId || frameName, center.x - visualW * 0.5 + 4 * view.zoom, center.y - visualH * 0.5 - 5 * view.zoom);
            ctx.restore();

            if (visual.collisionFromManifest === false) {
                continue;
            }
            if (!object || !Array.isArray(object.nodes) || !Array.isArray(object.lines)) {
                continue;
            }

            for (const loop of findClosedCollisionLoops(object)) {
                const points = loop.points.map((point) => this.assetLocalToScreen(visual, frame, point, view));
                if (points.length < 3) {
                    continue;
                }
                ctx.save();
                ctx.fillStyle = assetAreaColor(loop.kind);
                ctx.beginPath();
                for (let i = 0; i < points.length; i += 1) {
                    const p = points[i];
                    if (i === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            for (const line of object.lines) {
                const a = object.nodes.find((node) => node.id === line.from);
                const b = object.nodes.find((node) => node.id === line.to);
                if (!a || !b) {
                    continue;
                }
                const ap = this.assetLocalToScreen(visual, frame, a, view);
                const bp = this.assetLocalToScreen(visual, frame, b, view);
                const color = assetLineColor(line.kind);
                ctx.save();
                ctx.strokeStyle = color;
                ctx.lineWidth = 2.5 * view.zoom;
                ctx.beginPath();
                ctx.moveTo(ap.x, ap.y);
                ctx.lineTo(bp.x, bp.y);
                ctx.stroke();
                ctx.restore();
            }

            for (const node of object.nodes) {
                const np = this.assetLocalToScreen(visual, frame, node, view);
                ctx.save();
                ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
                ctx.strokeStyle = "rgba(0, 0, 0, 0.65)";
                ctx.lineWidth = 1 * view.zoom;
                ctx.beginPath();
                ctx.arc(np.x, np.y, 3.4 * view.zoom, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
        }

        ctx.restore();
    }

    assetLocalToScreen(visual, frame, node, view) {
        const world = atlasNodeToPlacementWorld(visual, frame, node);
        return this.worldToScreen(view, world.x, world.y);
    }

    updateActorShadowOpacity(state, elapsedSeconds) {
        const update = (actor) => {
            if (!actor || typeof actor !== "object") return;
            const opacity = advanceActorShadowOpacity(
                this.actorShadowOpacity.get(actor),
                actorHasGroundContact(actor),
                elapsedSeconds
            );
            this.actorShadowOpacity.set(actor, opacity);
        };
        update(state?.player);
        for (const enemy of state?.enemies || []) {
            if (enemy?.kind === "characterEnemy") update(enemy);
        }
    }

    groundShadowOpacity(actor) {
        const opacity = this.actorShadowOpacity.get(actor);
        return Number.isFinite(Number(opacity))
            ? clamp(Number(opacity), 0, 1)
            : (actorHasGroundContact(actor) ? 1 : 0);
    }

    queueShadowWebGL(x, groundY, zoom, actorScale = 1, opacity = 1) {
        const shadowAlpha = clamp(Number(opacity) || 0, 0, 1);
        const shadow = this.getWebGLParticleSpriteCanvas("shadow");
        if (shadowAlpha <= 0 || !shadow || !this.webglBackend?.available) return false;
        return this.webglBackend.queueSprite({
            source: shadow,
            centerX: x,
            centerY: groundY + 4 * zoom * actorScale,
            width: 92 * zoom * actorScale,
            height: 24 * zoom * actorScale,
            alpha: 0.46 * shadowAlpha,
            blendMode: "alpha"
        });
    }

    drawTargetsWebGL(state, view) {
        const backend = this.webglBackend;
        if (!backend?.available) return;
        const disc = this.getWebGLParticleSpriteCanvas("targetDisc");
        const ring = this.getWebGLParticleSpriteCanvas("ring");
        for (const target of state.targets || []) {
            if (target.state !== "active" || target.showMarker === false) continue;
            const targetExtent = Math.max(1, Number(target.radius) || 1) + 16;
            if (!this.dynamicBoundsVisible({
                minX: target.x - targetExtent,
                minY: target.y - targetExtent,
                maxX: target.x + targetExtent,
                maxY: target.y + targetExtent
            }, view, 48)) continue;
            const point = this.worldToScreen(view, target.x, target.y);
            const pulse = 0.5 + 0.5 * Math.sin(state.clock.time * 5.5);
            const radius = Math.max(1, Number(target.radius) || 1) * view.zoom;
            if (disc) {
                backend.queueSprite({
                    source: disc,
                    centerX: point.x,
                    centerY: point.y,
                    width: radius * 3.25,
                    height: radius * 3.25,
                    alpha: 0.9
                });
            }
            if (ring) {
                const ringRadius = (Math.max(1, Number(target.radius) || 1) + 9 + pulse * 4) * view.zoom;
                backend.queueSprite({
                    source: ring,
                    centerX: point.x,
                    centerY: point.y,
                    width: ringRadius * 2,
                    height: ringRadius * 2,
                    tint: [1, 1, 1, 1],
                    alpha: 0.28 + pulse * 0.08,
                    blendMode: "additive"
                });
            }
            this.markDynamicDrawn();
        }
    }

    drawPowerUpCompositeWebGL(powerUp, centerX, centerY, size, time, alpha = 1) {
        const backend = this.webglBackend;
        if (!backend?.available) return false;
        const atlas = this.environmentAtlases.get(powerUp?.atlasId || "it_atlas_001");
        const glowFrameName = powerUp?.glowFrame || "powerup_glow_white";
        const iconFrameName = powerUp?.iconFrame || "powerup_icon_lightning";
        const glowFrame = atlas?.frames?.[glowFrameName];
        const iconFrame = atlas?.frames?.[iconFrameName];
        const pulse = 0.92 + Math.sin(time * 5.4) * 0.08;
        let drew = false;
        if (atlas?.image && glowFrame && iconFrame) {
            drew = backend.queueSprite({
                source: atlas.renderImage || atlas.image,
                sourceX: glowFrame.x,
                sourceY: glowFrame.y,
                sourceWidth: glowFrame.w,
                sourceHeight: glowFrame.h,
                centerX,
                centerY,
                width: size * 1.16 * pulse,
                height: size * 1.16 * pulse,
                tint: powerUp?.glowTint || "#ffb52f",
                alpha: alpha * 0.92,
                blendMode: "additive"
            }) || drew;
            const iconSize = size * 0.47 * pulse;
            const iconAspect = iconFrame.w / Math.max(1, iconFrame.h);
            const iconW = iconAspect >= 1 ? iconSize : iconSize * iconAspect;
            const iconH = iconAspect >= 1 ? iconSize / iconAspect : iconSize;
            drew = backend.queueSprite({
                source: atlas.renderImage || atlas.image,
                sourceX: iconFrame.x,
                sourceY: iconFrame.y,
                sourceWidth: iconFrame.w,
                sourceHeight: iconFrame.h,
                centerX,
                centerY,
                width: iconW,
                height: iconH,
                alpha
            }) || drew;
        } else {
            const glow = this.getWebGLParticleSpriteCanvas("softGlow");
            if (glow) {
                drew = backend.queueSprite({
                    source: glow,
                    centerX,
                    centerY,
                    width: size * 1.12,
                    height: size * 1.12,
                    tint: powerUp?.glowTint || "#ffb52f",
                    alpha: alpha * 0.86,
                    blendMode: "additive"
                }) || drew;
            }
        }
        return drew;
    }

    drawPickupsWebGL(state, view) {
        const backend = this.webglBackend;
        if (!backend?.available) return;
        const pickupDisc = this.getWebGLParticleSpriteCanvas("pickupDisc");
        for (const pickup of state.pickups || []) {
            if (pickup.collected || pickup.visualized) continue;
            const pickupExtent = Math.max(1, Number(pickup.radius) || 1);
            const centerY = Number.isFinite(Number(pickup.centerY)) ? Number(pickup.centerY) : Number(pickup.y) || 0;
            if (!this.dynamicBoundsVisible({
                minX: pickup.x - pickupExtent,
                minY: centerY - pickupExtent,
                maxX: pickup.x + pickupExtent,
                maxY: centerY + pickupExtent
            }, view, 48)) continue;
            const bob = pickup.kind === "powerUp" ? Math.sin(state.clock.time * 2.8 + pickup.x * 0.01) * 7 : 0;
            const point = this.worldToScreen(view, pickup.x, centerY + bob);
            const radius = Math.max(1, Number(pickup.radius) || 1) * view.zoom;
            let drew = false;
            if (pickup.kind === "powerUp" && pickup.powerUp) {
                drew = this.drawPowerUpCompositeWebGL(pickup.powerUp, point.x, point.y, Math.max(44 * view.zoom, radius * 2.25), state.clock.time);
            } else if (pickupDisc) {
                drew = backend.queueSprite({
                    source: pickupDisc,
                    centerX: point.x,
                    centerY: point.y,
                    width: radius * 3.25,
                    height: radius * 3.25,
                    alpha: 0.82 + 0.18 * Math.sin(state.clock.time * 5 + pickup.x)
                });
            }
            if (drew) this.markDynamicDrawn();
        }
    }

    queueCharacterProjectPoseWebGL(project, screenX, screenGroundY, facing, renderedTransforms, bounds, options = {}) {
        const backend = this.webglBackend;
        if (!backend?.available) return [];
        const alpha = Number.isFinite(Number(options.alpha)) ? Number(options.alpha) : 1;
        const tintAlpha = clamp(Number(options.tintAlpha) || 0, 0, 1);
        const overlayTintAlpha = clamp(Number(options.overlayTintAlpha) || 0, 0, 1);
        const commands = buildRuntimeCharacterDrawCommands(project, renderedTransforms);
        for (const command of commands) {
            const { asset, transform, pivot, spriteScale, drawX, drawY, partName } = command;
            if (!asset || asset.missing || !transform) continue;
            const localCenterX = transform.x + Math.cos(transform.angle) * (drawX + asset.width * 0.5) * spriteScale - Math.sin(transform.angle) * (drawY + asset.height * 0.5) * spriteScale;
            const localCenterY = transform.y + Math.sin(transform.angle) * (drawX + asset.width * 0.5) * spriteScale + Math.cos(transform.angle) * (drawY + asset.height * 0.5) * spriteScale;
            const rotation = facing < 0 ? -transform.angle : transform.angle;
            const source = asset.image || asset.canvas;
            const atlasBacked = Boolean(asset.image);
            backend.queueSprite({
                source,
                sourceX: atlasBacked ? asset.sourceX : 0,
                sourceY: atlasBacked ? asset.sourceY : 0,
                sourceWidth: atlasBacked ? asset.sourceWidth : asset.width,
                sourceHeight: atlasBacked ? asset.sourceHeight : asset.height,
                centerX: screenX + facing * localCenterX,
                centerY: screenGroundY + localCenterY,
                width: asset.width * spriteScale,
                height: asset.height * spriteScale,
                rotation,
                mirrorX: facing < 0,
                alpha: alpha * transform.alpha
            });
            const partTint = partName === "rocket" && options.tintCanvasKey !== "shieldCanvas" ? 0 : tintAlpha;
            const tintCanvas = asset[options.tintCanvasKey] || asset.lowHealthCanvas;
            if (partTint > 0 && tintCanvas) {
                backend.queueSprite({
                    source: tintCanvas,
                    centerX: screenX + facing * localCenterX,
                    centerY: screenGroundY + localCenterY,
                    width: asset.width * spriteScale,
                    height: asset.height * spriteScale,
                    rotation,
                    mirrorX: facing < 0,
                    alpha: alpha * transform.alpha * partTint,
                    blendMode: "additive"
                });
            }
            const overlayTintCanvas = asset[options.overlayTintCanvasKey];
            if (overlayTintAlpha > 0 && overlayTintCanvas) {
                backend.queueSprite({
                    source: overlayTintCanvas,
                    centerX: screenX + facing * localCenterX,
                    centerY: screenGroundY + localCenterY,
                    width: asset.width * spriteScale,
                    height: asset.height * spriteScale,
                    rotation,
                    mirrorX: facing < 0,
                    alpha: alpha * transform.alpha * overlayTintAlpha,
                    blendMode: "additive"
                });
            }
            const spriteBounds = transformedSpriteBounds(asset, pivot, transform, spriteScale);
            mergeBounds(bounds, spriteBounds, screenX, screenGroundY, facing);
            options.afterPart?.(partName, command);
        }
        return commands;
    }

    drawEnemyHealthBarWebGL(enemy, view, actorScale = 1) {
        const maxHealth = Math.max(0, Number(enemy.maxHealth) || 0);
        const health = clamp(Number(enemy.health) || 0, 0, maxHealth || 1);
        if (health <= 0 || maxHealth <= 0 || health >= maxHealth || (Number(enemy.healthBarTimer) || 0) <= 0) return;
        const backend = this.webglBackend;
        const center = this.worldToScreen(view, enemy.x, enemy.y - enemy.height - 10 / Math.max(0.05, actorScale));
        const width = Math.max(34, Math.min(74, enemy.width * Math.max(0.75, actorScale))) * view.zoom;
        const height = 6 * view.zoom;
        const ratio = health / maxHealth;
        backend.queueSolidRect(center.x - width * 0.5 - view.zoom, center.y - view.zoom, width + view.zoom * 2, height + view.zoom * 2, "rgba(14, 10, 22, 0.78)");
        backend.queueSolidRect(center.x - width * 0.5, center.y, width, height, "rgba(92, 36, 52, 0.92)");
        backend.queueSolidRect(center.x - width * 0.5, center.y, width * ratio, height, "rgba(245, 202, 86, 0.96)");
    }

    drawRuntimeCharacterEnemyWebGL(project, enemy, state, view) {
        const renderOpacity = enemy.health <= 0 ? clamp(Number(enemy.renderOpacity ?? 1), 0, 1) : 1;
        if (renderOpacity <= 0) return false;
        const actorScale = Math.max(0.05, Number(enemy.renderScale) || 1);
        const facing = Number(enemy.facing) < 0 ? -1 : 1;
        const artworkOrigin = characterArtworkOrigin(enemy);
        const screen = this.worldToScreen(view, artworkOrigin.x, artworkOrigin.y);
        const groundPoint = actorGroundPoint(enemy);
        const groundScreen = this.worldToScreen(view, groundPoint.x, groundPoint.y);
        const requestedSlot = enemy.animationSlot || enemy.state || "idle";
        const time = Number.isFinite(Number(enemy.animationTime)) ? Number(enemy.animationTime) : state.clock.time + (Number(enemy.animationTimeOffset) || 0);
        const sampled = sampleRuntimeCharacterPose(project, requestedSlot, time);
        const transforms = animationPoseToRuntimeTransforms(sampled.pose, project.rig, view.zoom, actorScale);
        applyRuntimeProjectileHandoffVisibility(project, sampled.slot, time, transforms);
        const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
        this.queueShadowWebGL(
            groundScreen.x,
            groundScreen.y,
            view.zoom,
            actorScale * 0.72,
            this.groundShadowOpacity(enemy) * renderOpacity
        );
        const flashDuration = Math.max(0.001, Number(enemy.hitFlashDuration) || state.tuning.enemyHitFlashSeconds || 0.16);
        const flash = clamp((Number(enemy.hitFlashTimer) || 0) / flashDuration, 0, 1);
        this.queueCharacterProjectPoseWebGL(project, screen.x, screen.y, facing, transforms, bounds, {
            alpha: renderOpacity,
            overlayTintAlpha: flash * 0.72,
            overlayTintCanvasKey: "hitFlashCanvas"
        });
        this.drawEnemyHealthBarWebGL(enemy, view, actorScale);
        this.lastCharacterDraws.push({ actorId: enemy.id, characterId: project.characterId, animationSlot: sampled.slot, bounds: Number.isFinite(bounds.minX) ? { ...bounds } : null });
        return true;
    }

    drawEnemiesWebGL(state, view) {
        const backend = this.webglBackend;
        if (!backend?.available) return;
        const fallback = this.getWebGLParticleSpriteCanvas("softGlow");
        for (const enemy of state.enemies || []) {
            if (enemy.visualized) continue;
            const enemyWidth = Math.max(1, Number(enemy.width) || 1);
            const enemyHeight = Math.max(1, Number(enemy.height) || 1);
            const enemyBounds = { minX: enemy.x - enemyWidth * 0.5, minY: enemy.y - enemyHeight - 36, maxX: enemy.x + enemyWidth * 0.5, maxY: enemy.y + 12 };
            if (!this.dynamicBoundsVisible(enemyBounds, view, 96)) continue;
            const project = this.getCharacterProject(enemy.characterId || enemy.characterProject);
            if (project) {
                if (this.drawRuntimeCharacterEnemyWebGL(project, enemy, state, view)) this.markDynamicDrawn();
                continue;
            }
            if (enemy.health <= 0 || !fallback) continue;
            const center = this.worldToScreen(view, enemy.x, enemy.y - enemyHeight * 0.5);
            backend.queueSprite({
                source: fallback,
                centerX: center.x,
                centerY: center.y,
                width: enemyWidth * view.zoom,
                height: enemyHeight * view.zoom,
                tint: enemy.hitFlashTimer > 0 ? [1, 246 / 255, 214 / 255, 1] : [202 / 255, 135 / 255, 1, 1],
                alpha: 0.74
            });
            this.drawEnemyHealthBarWebGL(enemy, view, 1);
            this.markDynamicDrawn();
        }
    }

    drawEnemyGuides(state, view) {
        if (!state.debug.showPuppetGuide) return;
        for (const enemy of state.enemies || []) {
            if (enemy.visualized) continue;
            const width = Math.max(1, Number(enemy.width) || 1);
            const height = Math.max(1, Number(enemy.height) || 1);
            const guideBounds = {
                minX: enemy.x - Math.max(width, Number(enemy.awarenessRange) || 0),
                minY: enemy.y - Math.max(height, Number(enemy.awarenessRange) || 0),
                maxX: enemy.x + Math.max(width, Number(enemy.awarenessRange) || 0),
                maxY: enemy.y + Math.max(height, Number(enemy.awarenessRange) || 0)
            };
            if (visualIntersectsViewport(guideBounds, view, null, 48)) this.drawEnemyPuppetGuide(enemy, state, view);
        }
    }

    drawTargets(state, view) {
        const ctx = this.ctx;
        for (const target of state.targets || []) {
            if (target.state !== "active" || target.showMarker === false) continue;
            const targetExtent = Math.max(1, Number(target.radius) || 1) + 16;
            if (!this.dynamicBoundsVisible({
                minX: target.x - targetExtent,
                minY: target.y - targetExtent,
                maxX: target.x + targetExtent,
                maxY: target.y + targetExtent
            }, view, 48)) {
                continue;
            }
            const p = this.worldToScreen(view, target.x, target.y);
            const pulse = 0.5 + 0.5 * Math.sin(state.clock.time * 5.5);
            ctx.save();
            ctx.lineWidth = 2 * view.zoom;
            ctx.strokeStyle = `rgba(255, 234, 124, ${0.55 + pulse * 0.25})`;
            ctx.fillStyle = "rgba(255, 126, 98, 0.82)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, target.radius * view.zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, (target.radius + 9 + pulse * 4) * view.zoom, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
            this.markDynamicDrawn();
        }
    }

    drawPickups(state, view) {
        const ctx = this.ctx;
        for (const pickup of state.pickups) {
            if (pickup.collected || pickup.visualized) continue;
            const pickupExtent = Math.max(1, Number(pickup.radius) || 1);
            const centerY = Number.isFinite(Number(pickup.centerY)) ? Number(pickup.centerY) : Number(pickup.y) || 0;
            if (!this.dynamicBoundsVisible({
                minX: pickup.x - pickupExtent,
                minY: centerY - pickupExtent,
                maxX: pickup.x + pickupExtent,
                maxY: centerY + pickupExtent
            }, view, 48)) {
                continue;
            }
            const bob = pickup.kind === "powerUp" ? Math.sin(state.clock.time * 2.8 + pickup.x * 0.01) * 7 : 0;
            const p = this.worldToScreen(view, pickup.x, centerY + bob);
            const r = pickup.radius * view.zoom;
            if (pickup.kind === "powerUp" && pickup.powerUp) {
                this.drawPowerUpComposite(pickup.powerUp, p.x, p.y, Math.max(44 * view.zoom, r * 2.25), state.clock.time);
            } else {
                ctx.save();
                ctx.globalAlpha = 0.82 + 0.18 * Math.sin(state.clock.time * 5 + pickup.x);
                ctx.fillStyle = "rgba(113, 224, 126, 0.82)";
                ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
                ctx.lineWidth = 2 * view.zoom;
                ctx.beginPath();
                ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
            this.markDynamicDrawn();
        }
    }

    drawEnemies(state, view) {
        const ctx = this.ctx;
        for (const enemy of state.enemies) {
            if (enemy.visualized) continue;
            const enemyWidth = Math.max(1, Number(enemy.width) || 1);
            const enemyHeight = Math.max(1, Number(enemy.height) || 1);
            const enemyBounds = {
                minX: (Number(enemy.x) || 0) - enemyWidth * 0.5,
                minY: (Number(enemy.y) || 0) - enemyHeight - 36,
                maxX: (Number(enemy.x) || 0) + enemyWidth * 0.5,
                maxY: (Number(enemy.y) || 0) + 12
            };
            if (!this.dynamicBoundsVisible(enemyBounds, view, 96)) {
                continue;
            }
            const characterProject = this.getCharacterProject(enemy.characterId || enemy.characterProject);
            if (characterProject) {
                this.drawRuntimeCharacterEnemy(characterProject, enemy, state, view);
                this.markDynamicDrawn();
                continue;
            }
            if (enemy.health <= 0) {
                continue;
            }

            const p = this.worldToScreen(view, enemy.x - enemy.width / 2, enemy.y - enemy.height);
            ctx.save();
            ctx.fillStyle = enemy.hitFlashTimer > 0 ? "rgba(255, 246, 214, 0.92)" : "rgba(202, 135, 255, 0.62)";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
            ctx.lineWidth = 2 * view.zoom;
            ctx.beginPath();
            roundedRect(ctx, p.x, p.y, enemy.width * view.zoom, enemy.height * view.zoom, 14 * view.zoom);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "rgba(255, 255, 255, 0.84)";
            ctx.beginPath();
            ctx.arc(p.x + enemy.width * view.zoom * 0.38, p.y + enemy.height * view.zoom * 0.35, 3 * view.zoom, 0, Math.PI * 2);
            ctx.arc(p.x + enemy.width * view.zoom * 0.62, p.y + enemy.height * view.zoom * 0.35, 3 * view.zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            this.drawEnemyHealthBar(enemy, view, 1);
            this.markDynamicDrawn();
        }

        if (state.debug.showPuppetGuide) {
            for (const enemy of state.enemies) {
                if (enemy.visualized) {
                    continue;
                }
                const width = Math.max(1, Number(enemy.width) || 1);
                const height = Math.max(1, Number(enemy.height) || 1);
                const guideBounds = {
                    minX: (Number(enemy.x) || 0) - Math.max(width, Number(enemy.awarenessRange) || 0),
                    minY: (Number(enemy.y) || 0) - Math.max(height, Number(enemy.awarenessRange) || 0),
                    maxX: (Number(enemy.x) || 0) + Math.max(width, Number(enemy.awarenessRange) || 0),
                    maxY: (Number(enemy.y) || 0) + Math.max(height, Number(enemy.awarenessRange) || 0)
                };
                if (visualIntersectsViewport(guideBounds, view, null, 48)) {
                    this.drawEnemyPuppetGuide(enemy, state, view);
                }
            }
        }
    }

    getCharacterProject(characterId) {
        if (!characterId) {
            return null;
        }
        const key = String(characterId);
        if (this.characterProjects.has(key)) {
            return this.characterProjects.get(key);
        }
        for (const project of this.characterProjects.values()) {
            const shortId = String(project.characterId || "").replace(/^ct_char_/, "");
            if (
                project.characterId === key ||
                shortId === key ||
                project.sourceUrl === key ||
                project.sourceUrl?.endsWith(`/${key}.json`)
            ) {
                return project;
            }
        }
        return null;
    }

    getCharacterAtlasFrame(characterId, frameId) {
        const project = this.getCharacterProject(characterId);
        return project?.atlasAssets instanceof Map ? project.atlasAssets.get(frameId) || null : null;
    }

    drawRuntimeCharacterEnemy(project, enemy, state, view) {
        const renderOpacity = enemy.health <= 0
            ? clamp(Number(enemy.renderOpacity ?? 1), 0, 1)
            : 1;
        if (renderOpacity <= 0) {
            return;
        }
        const actorScale = Math.max(0.05, Number(enemy.renderScale) || 1);
        const facing = Number(enemy.facing) < 0 ? -1 : 1;
        const artworkOrigin = characterArtworkOrigin(enemy);
        const screen = this.worldToScreen(view, artworkOrigin.x, artworkOrigin.y);
        const groundPoint = actorGroundPoint(enemy);
        const groundScreen = this.worldToScreen(view, groundPoint.x, groundPoint.y);
        const requestedSlot = enemy.animationSlot || enemy.state || "idle";
        const time = Number.isFinite(Number(enemy.animationTime))
            ? Number(enemy.animationTime)
            : state.clock.time + (Number(enemy.animationTimeOffset) || 0);
        const sampled = sampleRuntimeCharacterPose(project, requestedSlot, time);
        const transforms = animationPoseToRuntimeTransforms(sampled.pose, project.rig, view.zoom, actorScale);
        applyRuntimeProjectileHandoffVisibility(project, sampled.slot, time, transforms);

        const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
        const flashDuration = Math.max(0.001, Number(enemy.hitFlashDuration) || state.tuning.enemyHitFlashSeconds || 0.16);
        const flash = clamp((Number(enemy.hitFlashTimer) || 0) / flashDuration, 0, 1);
        this.ctx.save();
        this.ctx.globalAlpha *= renderOpacity;
        this.drawShadow(
            groundScreen.x,
            groundScreen.y,
            view.zoom * actorScale * 0.72,
            this.groundShadowOpacity(enemy)
        );
        // Chrome may defer Canvas filter work until compositing, making the cost show
        // up as a later requestAnimationFrame hitch rather than inside this draw call.
        // Reuse the already prepared white sprite surfaces, matching the WebGL path,
        // so enemy hits do not change the Canvas filter pipeline mid-frame.
        this.drawCharacterProjectPose(project, screen.x, screen.y, facing, transforms, bounds, {
            alpha: 1,
            overlayTintAlpha: flash * 0.72,
            overlayTintCanvasKey: "hitFlashCanvas"
        });
        this.ctx.restore();
        this.drawEnemyHealthBar(enemy, view, actorScale);
        this.lastCharacterDraws.push({
            actorId: enemy.id,
            characterId: project.characterId,
            animationSlot: sampled.slot,
            bounds: Number.isFinite(bounds.minX) ? { ...bounds } : null
        });
    }

    drawEnemyPuppetGuide(enemy, state, view) {
        const ctx = this.ctx;
        const body = actorBodyRect(enemy);
        const projectileHitbox = enemyProjectileHitbox(enemy);
        const bodyScreen = this.worldToScreen(view, body.x, body.y);
        const hitboxScreen = this.worldToScreen(view, projectileHitbox.x, projectileHitbox.y);
        const enemyCenter = {
            x: Number(enemy.x) || 0,
            y: (Number(enemy.y) || 0) - Math.max(1, Number(enemy.height) || 1) * 0.5
        };
        const centerScreen = this.worldToScreen(view, enemyCenter.x, enemyCenter.y);
        const facing = Number(enemy.facing) < 0 ? -1 : 1;
        const awarenessRange = Math.max(0, Number(enemy.awarenessRange) || 0);
        const awarenessHalfAngle = clamp(Number(enemy.awarenessViewHalfAngle) || 0, 0, 180) * Math.PI / 180;
        const facingAngle = facing < 0 ? Math.PI : 0;

        ctx.save();

        if (awarenessRange > 0 && awarenessHalfAngle > 0) {
            ctx.fillStyle = enemy.alerted
                ? "rgba(255, 118, 84, 0.10)"
                : "rgba(98, 224, 174, 0.075)";
            ctx.strokeStyle = enemy.alerted
                ? "rgba(255, 132, 94, 0.70)"
                : "rgba(103, 234, 187, 0.56)";
            ctx.lineWidth = Math.max(1, 1.25 * view.zoom);
            ctx.beginPath();
            ctx.moveTo(centerScreen.x, centerScreen.y);
            ctx.arc(
                centerScreen.x,
                centerScreen.y,
                awarenessRange * view.zoom,
                facingAngle - awarenessHalfAngle,
                facingAngle + awarenessHalfAngle
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        ctx.strokeStyle = "rgba(87, 225, 255, 0.92)";
        ctx.lineWidth = Math.max(1, 1.75 * view.zoom);
        ctx.setLineDash([]);
        ctx.strokeRect(bodyScreen.x, bodyScreen.y, body.w * view.zoom, body.h * view.zoom);

        ctx.strokeStyle = "rgba(255, 219, 99, 0.92)";
        ctx.lineWidth = Math.max(1, 1.4 * view.zoom);
        ctx.setLineDash([5 * view.zoom, 3 * view.zoom]);
        ctx.strokeRect(
            hitboxScreen.x,
            hitboxScreen.y,
            projectileHitbox.w * view.zoom,
            projectileHitbox.h * view.zoom
        );
        ctx.setLineDash([]);

        if (enemy.attackMode === "projectile") {
            const attackRange = Math.max(1, Number(enemy.attackRange) || 1);
            const verticalRange = Math.max(1, Number(enemy.attackVerticalRange) || 1);
            const attackWindow = {
                x: enemyCenter.x - attackRange,
                y: enemyCenter.y - verticalRange,
                w: attackRange * 2,
                h: verticalRange * 2
            };
            const attackScreen = this.worldToScreen(view, attackWindow.x, attackWindow.y);
            ctx.strokeStyle = "rgba(255, 151, 210, 0.55)";
            ctx.lineWidth = Math.max(1, view.zoom);
            ctx.setLineDash([9 * view.zoom, 5 * view.zoom]);
            ctx.strokeRect(attackScreen.x, attackScreen.y, attackWindow.w * view.zoom, attackWindow.h * view.zoom);
            const minimumRange = Math.max(0, Number(enemy.preferredAttackMinRange) || 0);
            if (minimumRange > 0) {
                const left = this.worldToScreen(view, enemyCenter.x - minimumRange, enemyCenter.y);
                const right = this.worldToScreen(view, enemyCenter.x + minimumRange, enemyCenter.y);
                ctx.beginPath();
                ctx.moveTo(left.x, attackScreen.y);
                ctx.lineTo(left.x, attackScreen.y + attackWindow.h * view.zoom);
                ctx.moveTo(right.x, attackScreen.y);
                ctx.lineTo(right.x, attackScreen.y + attackWindow.h * view.zoom);
                ctx.stroke();
            }
            ctx.setLineDash([]);
        } else {
            const melee = characterEnemyMeleeAttackRect(enemy);
            const meleeScreen = this.worldToScreen(view, melee.x, melee.y);
            ctx.strokeStyle = "rgba(255, 151, 210, 0.72)";
            ctx.lineWidth = Math.max(1, 1.2 * view.zoom);
            ctx.setLineDash([7 * view.zoom, 4 * view.zoom]);
            ctx.strokeRect(meleeScreen.x, meleeScreen.y, melee.w * view.zoom, melee.h * view.zoom);
            ctx.setLineDash([]);
        }

        if (Number.isFinite(Number(enemy.patrolMinX)) && Number.isFinite(Number(enemy.patrolMaxX))) {
            const patrolY = (Number(enemy.y) || 0) + 5;
            const patrolStart = this.worldToScreen(view, Number(enemy.patrolMinX), patrolY);
            const patrolEnd = this.worldToScreen(view, Number(enemy.patrolMaxX), patrolY);
            ctx.strokeStyle = "rgba(194, 154, 255, 0.72)";
            ctx.lineWidth = Math.max(1, 1.2 * view.zoom);
            ctx.beginPath();
            ctx.moveTo(patrolStart.x, patrolStart.y);
            ctx.lineTo(patrolEnd.x, patrolEnd.y);
            ctx.stroke();
        }

        const targetX = Number(enemy.targetX);
        const targetY = Number(enemy.targetY);
        if (Number.isFinite(targetX) && Number.isFinite(targetY)) {
            const target = this.worldToScreen(view, targetX, targetY);
            const radius = Math.max(4, Number(enemy.targetRadius) || 4) * view.zoom;
            ctx.strokeStyle = "rgba(255, 246, 174, 0.92)";
            ctx.lineWidth = Math.max(1, 1.2 * view.zoom);
            ctx.beginPath();
            ctx.arc(target.x, target.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(target.x - 5 * view.zoom, target.y);
            ctx.lineTo(target.x + 5 * view.zoom, target.y);
            ctx.moveTo(target.x, target.y - 5 * view.zoom);
            ctx.lineTo(target.x, target.y + 5 * view.zoom);
            ctx.stroke();
        }

        const hasLastSeenPosition = enemy.lastSeenPlayerX !== null && enemy.lastSeenPlayerX !== undefined &&
            enemy.lastSeenPlayerY !== null && enemy.lastSeenPlayerY !== undefined;
        const lastSeenX = Number(enemy.lastSeenPlayerX);
        const lastSeenY = Number(enemy.lastSeenPlayerY);
        if (hasLastSeenPosition && Number.isFinite(lastSeenX) && Number.isFinite(lastSeenY)) {
            const lastSeen = this.worldToScreen(view, lastSeenX, lastSeenY);
            const marker = 7 * view.zoom;
            ctx.strokeStyle = "rgba(255, 128, 102, 0.90)";
            ctx.lineWidth = Math.max(1, 1.5 * view.zoom);
            ctx.beginPath();
            ctx.moveTo(lastSeen.x - marker, lastSeen.y - marker);
            ctx.lineTo(lastSeen.x + marker, lastSeen.y + marker);
            ctx.moveTo(lastSeen.x + marker, lastSeen.y - marker);
            ctx.lineTo(lastSeen.x - marker, lastSeen.y + marker);
            ctx.stroke();
        }

        if (state.player?.visible !== false) {
            const playerCenter = this.worldToScreen(
                view,
                Number(state.player.x) || 0,
                (Number(state.player.y) || 0) - (Number(state.player.height) || 0) * 0.5
            );
            ctx.strokeStyle = enemy.alerted
                ? "rgba(255, 137, 101, 0.58)"
                : "rgba(114, 235, 192, 0.34)";
            ctx.lineWidth = Math.max(1, view.zoom);
            ctx.setLineDash([3 * view.zoom, 5 * view.zoom]);
            ctx.beginPath();
            ctx.moveTo(centerScreen.x, centerScreen.y);
            ctx.lineTo(playerCenter.x, playerCenter.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();
        this.drawEnemyNavigationDebug(enemy, view);
    }

    drawEnemyNavigationDebug(enemy, view) {
        const ctx = this.ctx;
        const route = Array.isArray(enemy.route) ? enemy.route.slice(Math.max(0, Number(enemy.routeIndex) || 0)) : [];
        const origin = this.worldToScreen(view, enemy.x, enemy.y - 6);
        ctx.save();
        ctx.font = `${Math.max(10, 11 * view.zoom)}px ui-monospace, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "rgba(144, 239, 255, 0.96)";
        ctx.fillText(`${enemy.strategy || "unknown"}:${enemy.aiState || enemy.movementPhase || "idle"}`, origin.x, origin.y - enemy.height * view.zoom - 8 * view.zoom);
        if (route.length || Number.isFinite(Number(enemy.routeTargetX))) {
            ctx.strokeStyle = "rgba(89, 225, 255, 0.82)";
            ctx.lineWidth = Math.max(1, 1.5 * view.zoom);
            ctx.setLineDash([6 * view.zoom, 4 * view.zoom]);
            ctx.beginPath();
            ctx.moveTo(origin.x, origin.y);
            for (const edge of route) {
                const launch = this.worldToScreen(view, edge.launchX, edge.launchY);
                const landing = this.worldToScreen(view, edge.landingX, edge.landingY);
                ctx.lineTo(launch.x, launch.y);
                ctx.lineTo(landing.x, landing.y);
            }
            if (Number.isFinite(Number(enemy.routeTargetX)) && Number.isFinite(Number(enemy.routeTargetY))) {
                const target = this.worldToScreen(view, Number(enemy.routeTargetX), Number(enemy.routeTargetY));
                ctx.lineTo(target.x, target.y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.restore();
    }

    drawEnemyHealthBar(enemy, view, actorScale = 1) {
        const maxHealth = Math.max(0, Number(enemy.maxHealth) || 0);
        const health = clamp(Number(enemy.health) || 0, 0, maxHealth || 1);
        if (health <= 0 || maxHealth <= 0 || health >= maxHealth || (Number(enemy.healthBarTimer) || 0) <= 0) {
            return;
        }

        const ctx = this.ctx;
        const center = this.worldToScreen(view, enemy.x, enemy.y - enemy.height - 10 / Math.max(0.05, actorScale));
        const width = Math.max(34, Math.min(74, enemy.width * Math.max(0.75, actorScale))) * view.zoom;
        const height = 6 * view.zoom;
        const ratio = health / maxHealth;
        ctx.save();
        ctx.fillStyle = "rgba(14, 10, 22, 0.78)";
        ctx.fillRect(center.x - width * 0.5 - view.zoom, center.y - view.zoom, width + view.zoom * 2, height + view.zoom * 2);
        ctx.fillStyle = "rgba(92, 36, 52, 0.92)";
        ctx.fillRect(center.x - width * 0.5, center.y, width, height);
        ctx.fillStyle = "rgba(245, 202, 86, 0.96)";
        ctx.fillRect(center.x - width * 0.5, center.y, width * ratio, height);
        ctx.restore();
    }

    drawWorldEffects(state, view, options = {}) {
        const ctx = this.ctx;
        const puffs = state.effects?.smokePuffs || [];
        if (!puffs.length) {
            return;
        }

        const onlyKinds = options.onlyKinds instanceof Set ? options.onlyKinds : null;
        const skipKinds = options.skipKinds instanceof Set ? options.skipKinds : null;
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        for (const puff of puffs) {
            if (puff.kind === "wizardDeathCoverSpark") {
                continue;
            }
            if (skipKinds?.has(puff.kind)) {
                continue;
            }
            if (onlyKinds && !onlyKinds.has(puff.kind)) {
                continue;
            }
            const ageRatio = clamp(puff.age / Math.max(0.001, puff.lifetime), 0, 1);
            const radiusWorld = Math.max(1, Number(puff.radius) || 1) * (0.75 + ageRatio * 1.65);
            if (!this.dynamicBoundsVisible({
                minX: puff.x - radiusWorld,
                minY: puff.y - radiusWorld,
                maxX: puff.x + radiusWorld,
                maxY: puff.y + radiusWorld
            }, view, 64)) {
                continue;
            }
            const p = this.worldToScreen(view, puff.x, puff.y);
            const radius = radiusWorld * view.zoom;

            if (puff.kind === "wizardDeathBurstParticle" || puff.kind === "wizardCrushParticle") {
                const fade = Math.pow(1 - ageRatio, 1.35);
                const shardRadius = Math.max(1, Number(puff.radius) || 1) * view.zoom * (0.9 + (1 - ageRatio) * 0.1);
                const paletteIndex = (Number(puff.colorIndex) || 0) % 3;
                const color = paletteIndex === 0
                    ? `rgba(161, 72, 255, ${0.94 * fade})`
                    : paletteIndex === 1
                        ? `rgba(255, 220, 65, ${0.97 * fade})`
                        : `rgba(255, 255, 246, ${0.98 * fade})`;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(Number(puff.rotation) || 0);
                ctx.globalCompositeOperation = "lighter";
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(0, -shardRadius * 1.45);
                ctx.lineTo(shardRadius * 0.76, 0);
                ctx.lineTo(0, shardRadius * 1.45);
                ctx.lineTo(-shardRadius * 0.76, 0);
                ctx.closePath();
                ctx.fill();
                ctx.globalAlpha = 0.58 * fade;
                ctx.beginPath();
                ctx.arc(0, 0, shardRadius * 1.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                this.markDynamicDrawn();
                continue;
            }

            if (puff.kind === "enemyTeleportFlash") {
                const fade = Math.pow(1 - ageRatio, 1.45);
                const expansion = 0.34 + ageRatio * 0.92;
                const flashRadius = Math.max(2, Number(puff.radius) || 24) * view.zoom * expansion;
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                const glow = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, flashRadius);
                glow.addColorStop(0, `rgba(255, 255, 255, ${0.92 * fade})`);
                glow.addColorStop(0.24, `rgba(124, 236, 255, ${0.74 * fade})`);
                glow.addColorStop(0.58, `rgba(163, 88, 255, ${0.52 * fade})`);
                glow.addColorStop(1, "rgba(90, 34, 180, 0)");
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(p.x, p.y, flashRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 0.9 * fade;
                ctx.strokeStyle = "rgba(202, 142, 255, 0.96)";
                ctx.lineWidth = Math.max(1, 2.4 * view.zoom * (1 - ageRatio * 0.45));
                ctx.beginPath();
                ctx.arc(p.x, p.y, flashRadius * 0.78, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
                this.markDynamicDrawn();
                continue;
            }

            if (puff.kind === "enemyTeleportSpark") {
                const fade = Math.pow(1 - ageRatio, 1.2);
                const shardRadius = Math.max(1, Number(puff.radius) || 2) * view.zoom;
                const paletteIndex = (Number(puff.colorIndex) || 0) % 3;
                const color = paletteIndex === 0
                    ? `rgba(255, 255, 255, ${0.98 * fade})`
                    : paletteIndex === 1
                        ? `rgba(116, 235, 255, ${0.94 * fade})`
                        : `rgba(190, 104, 255, ${0.94 * fade})`;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(Number(puff.rotation) || 0);
                ctx.globalCompositeOperation = "lighter";
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(0, -shardRadius * 1.7);
                ctx.lineTo(shardRadius * 0.72, 0);
                ctx.lineTo(0, shardRadius * 1.7);
                ctx.lineTo(-shardRadius * 0.72, 0);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                this.markDynamicDrawn();
                continue;
            }

            if (puff.kind === "enemyProjectileImpactPuff") {
                const fade = Math.pow(1 - ageRatio, 1.35);
                const darkRadius = radius * (0.82 + ageRatio * 0.28);
                const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, Math.max(1, darkRadius));
                g.addColorStop(0, `rgba(82, 51, 58, ${0.50 * fade})`);
                g.addColorStop(0.48, `rgba(48, 37, 45, ${0.42 * fade})`);
                g.addColorStop(1, "rgba(20, 17, 24, 0)");
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(p.x, p.y, darkRadius, 0, Math.PI * 2);
                ctx.fill();
                this.markDynamicDrawn();
                continue;
            }

            const smokeAlpha = 0.30 * Math.pow(1 - ageRatio, 1.25);
            const trailTint = puff.kind === "rocketSmokePuff" ? hexColorRgb(puff.trailTint) : null;
            const smokeStamp = this.getSmokeStampCanvas(trailTint ? puff.trailTint : null);
            ctx.save();
            ctx.globalAlpha = smokeAlpha;
            if (smokeStamp) {
                ctx.drawImage(smokeStamp, p.x - radius, p.y - radius, radius * 2, radius * 2);
            } else {
                ctx.fillStyle = "rgba(180, 170, 194, 0.72)";
                ctx.beginPath();
                ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            const sparkFade = Math.pow(1 - ageRatio, 1.9);
            const sparkMax = puff.kind === "rocketSmokePuff"
                ? 3
                : (puff.kind === "attachedRocketSmokePuff" ? 2 : 0);
            if (sparkMax > 0 && sparkFade > 0.025) {
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                const sparkCount = 1 + Math.floor(sparkMax * (1 - ageRatio));
                for (let i = 0; i < sparkCount; i += 1) {
                    const seed = (puff.sparkleSeed || 0) + i * 17;
                    const angle = hashNoise(seed, i) * Math.PI * 2;
                    const r = radius * (0.12 + hashNoise(seed + 31, i) * 0.64);
                    const twinkle = 0.72 + 0.28 * Math.sin((state.clock.time + puff.age) * 18 + i * 1.4);
                    const size = (0.9 + hashNoise(seed + 79, i) * 2.2) * view.zoom;
                    ctx.globalAlpha = clamp(0.10 + sparkFade * twinkle * 0.62, 0, 0.74);
                    ctx.fillStyle = trailTint && i % 3 === 0
                        ? `rgba(${trailTint.r}, ${trailTint.g}, ${trailTint.b}, 0.92)`
                        : (i % 3 === 0 ? "rgba(204, 157, 255, 0.92)" : "rgba(255, 238, 129, 0.94)");
                    ctx.beginPath();
                    ctx.arc(p.x + Math.cos(angle) * r, p.y + Math.sin(angle) * r, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
            this.markDynamicDrawn();
        }
        ctx.restore();
    }

    drawWorldEffectsWebGL(state, view) {
        const backend = this.webglBackend;
        if (!backend?.available) {
            return;
        }
        const puffs = state.effects?.smokePuffs || [];
        if (!puffs.length) {
            return;
        }
        const glowSprite = this.getWebGLParticleSpriteCanvas("softGlow");
        const diamondSprite = this.getWebGLParticleSpriteCanvas("diamond");
        for (const puff of puffs) {
            if (!WEBGL_DIRECT_WORLD_EFFECT_KINDS.has(puff.kind)) {
                continue;
            }
            const ageRatio = clamp(puff.age / Math.max(0.001, puff.lifetime), 0, 1);
            const radiusWorld = Math.max(1, Number(puff.radius) || 1) * (0.75 + ageRatio * 1.65);
            if (!this.dynamicBoundsVisible({
                minX: puff.x - radiusWorld,
                minY: puff.y - radiusWorld,
                maxX: puff.x + radiusWorld,
                maxY: puff.y + radiusWorld
            }, view, 64)) {
                continue;
            }
            const point = this.worldToScreen(view, puff.x, puff.y);
            const radius = radiusWorld * view.zoom;

            if (puff.kind === "wizardDeathBurstParticle" || puff.kind === "wizardCrushParticle") {
                const fade = Math.pow(1 - ageRatio, 1.35);
                const shardRadius = Math.max(1, Number(puff.radius) || 1) * view.zoom * (0.9 + (1 - ageRatio) * 0.1);
                const paletteIndex = (Number(puff.colorIndex) || 0) % 3;
                const tint = paletteIndex === 0
                    ? [161 / 255, 72 / 255, 1, 1]
                    : paletteIndex === 1
                        ? [1, 220 / 255, 65 / 255, 1]
                        : [1, 1, 246 / 255, 1];
                if (glowSprite) {
                    backend.queueSprite({
                        source: glowSprite,
                        centerX: point.x,
                        centerY: point.y,
                        width: shardRadius * 3.6,
                        height: shardRadius * 3.6,
                        tint,
                        alpha: 0.38 * fade,
                        blendMode: "additive"
                    });
                }
                if (diamondSprite) {
                    backend.queueSprite({
                        source: diamondSprite,
                        centerX: point.x,
                        centerY: point.y,
                        width: shardRadius * 1.55,
                        height: shardRadius * 2.95,
                        rotation: Number(puff.rotation) || 0,
                        tint,
                        alpha: 0.96 * fade,
                        blendMode: "additive"
                    });
                }
                this.markDynamicDrawn();
                continue;
            }

            if (puff.kind === "enemyTeleportFlash") {
                const fade = Math.pow(1 - ageRatio, 1.45);
                const expansion = 0.34 + ageRatio * 0.92;
                const flashRadius = Math.max(2, Number(puff.radius) || 24) * view.zoom * expansion;
                if (glowSprite) {
                    backend.queueSprite({
                        source: glowSprite,
                        centerX: point.x,
                        centerY: point.y,
                        width: flashRadius * 2,
                        height: flashRadius * 2,
                        tint: [124 / 255, 236 / 255, 1, 1],
                        alpha: 0.84 * fade,
                        blendMode: "additive"
                    });
                }
                const ringSprite = this.getWebGLParticleSpriteCanvas("ring");
                if (ringSprite) {
                    backend.queueSprite({
                        source: ringSprite,
                        centerX: point.x,
                        centerY: point.y,
                        width: flashRadius * 1.56,
                        height: flashRadius * 1.56,
                        tint: [202 / 255, 142 / 255, 1, 1],
                        alpha: 0.9 * fade,
                        blendMode: "additive"
                    });
                }
                this.markDynamicDrawn();
                continue;
            }

            if (puff.kind === "enemyTeleportSpark") {
                const fade = Math.pow(1 - ageRatio, 1.2);
                const shardRadius = Math.max(1, Number(puff.radius) || 2) * view.zoom;
                const paletteIndex = (Number(puff.colorIndex) || 0) % 3;
                const tint = paletteIndex === 0
                    ? [1, 1, 1, 1]
                    : paletteIndex === 1
                        ? [116 / 255, 235 / 255, 1, 1]
                        : [190 / 255, 104 / 255, 1, 1];
                if (diamondSprite) {
                    backend.queueSprite({
                        source: diamondSprite,
                        centerX: point.x,
                        centerY: point.y,
                        width: shardRadius * 1.44,
                        height: shardRadius * 3.4,
                        rotation: Number(puff.rotation) || 0,
                        tint,
                        alpha: 0.96 * fade,
                        blendMode: "additive"
                    });
                }
                this.markDynamicDrawn();
                continue;
            }

            if (puff.kind === "enemyProjectileImpactPuff") {
                if (glowSprite) {
                    const fade = Math.pow(1 - ageRatio, 1.35);
                    const darkRadius = radius * (0.82 + ageRatio * 0.28);
                    backend.queueSprite({
                        source: glowSprite,
                        centerX: point.x,
                        centerY: point.y,
                        width: darkRadius * 2,
                        height: darkRadius * 2,
                        tint: [82 / 255, 51 / 255, 58 / 255, 1],
                        alpha: 0.5 * fade,
                        blendMode: "alpha"
                    });
                    if (puff.impactWizardAccent) {
                        backend.queueSprite({
                            source: glowSprite,
                            centerX: point.x,
                            centerY: point.y,
                            width: Math.max(2, darkRadius * 0.34),
                            height: Math.max(2, darkRadius * 0.34),
                            tint: [1, 228 / 255, 112 / 255, 1],
                            alpha: 0.52 * fade,
                            blendMode: "additive"
                        });
                    }
                }
                this.markDynamicDrawn();
                continue;
            }

            const trailTint = puff.kind === "rocketSmokePuff" ? hexColorRgb(puff.trailTint) : null;
            const smokeStamp = this.getSmokeStampCanvas(trailTint ? puff.trailTint : null);
            const smokeAlpha = 0.30 * Math.pow(1 - ageRatio, 1.25);
            if (smokeStamp) {
                backend.queueSprite({
                    source: smokeStamp,
                    centerX: point.x,
                    centerY: point.y,
                    width: radius * 2,
                    height: radius * 2,
                    alpha: smokeAlpha,
                    blendMode: "alpha"
                });
            }

            const sparkFade = Math.pow(1 - ageRatio, 1.9);
            const sparkMax = puff.kind === "rocketSmokePuff"
                ? 3
                : (puff.kind === "attachedRocketSmokePuff" ? 2 : 0);
            if (glowSprite && sparkMax > 0 && sparkFade > 0.025) {
                const sparkCount = 1 + Math.floor(sparkMax * (1 - ageRatio));
                for (let i = 0; i < sparkCount; i += 1) {
                    const seed = (puff.sparkleSeed || 0) + i * 17;
                    const angle = hashNoise(seed, i) * Math.PI * 2;
                    const r = radius * (0.12 + hashNoise(seed + 31, i) * 0.64);
                    const twinkle = 0.72 + 0.28 * Math.sin((state.clock.time + puff.age) * 18 + i * 1.4);
                    const size = (0.9 + hashNoise(seed + 79, i) * 2.2) * view.zoom;
                    const alpha = clamp(0.10 + sparkFade * twinkle * 0.62, 0, 0.74);
                    const tint = trailTint && i % 3 === 0
                        ? [trailTint.r / 255, trailTint.g / 255, trailTint.b / 255, 1]
                        : (i % 3 === 0 ? [204 / 255, 157 / 255, 1, 1] : [1, 238 / 255, 129 / 255, 1]);
                    backend.queueSprite({
                        source: glowSprite,
                        centerX: point.x + Math.cos(angle) * r,
                        centerY: point.y + Math.sin(angle) * r,
                        width: size * 2,
                        height: size * 2,
                        tint,
                        alpha,
                        blendMode: "additive"
                    });
                }
            }
            this.markDynamicDrawn();
        }
    }

    drawSparkBurstWebGL(x, y, view, seed, count, radius, palette = "rocket") {
        const backend = this.webglBackend;
        const glowSprite = this.getWebGLParticleSpriteCanvas("softGlow");
        if (!backend?.available || !glowSprite) {
            return;
        }
        for (let i = 0; i < count; i += 1) {
            const a = hashNoise(seed, i) * Math.PI * 2;
            const r = (0.25 + hashNoise(seed + 31, i) * 0.75) * radius;
            const px = x + Math.cos(a) * r;
            const py = y + Math.sin(a) * r;
            const size = (palette === "enemy" ? 0.9 : 1.1) * (1 + hashNoise(seed + 71, i) * (palette === "enemy" ? 1.7 : 2.3)) * view.zoom;
            const alpha = (palette === "enemy" ? 0.22 : 0.28) + hashNoise(seed + 109, i) * (palette === "enemy" ? 0.28 : 0.38);
            const tint = palette === "enemy"
                ? (i % 2 === 0 ? [1, 92 / 255, 68 / 255, 1] : [1, 155 / 255, 84 / 255, 1])
                : palette === "wizardAccent"
                    ? (i % 2 === 0 ? [1, 238 / 255, 114 / 255, 1] : [184 / 255, 112 / 255, 1, 1])
                    : (i % 3 === 0 ? [1, 246 / 255, 166 / 255, 1] : [1, 137 / 255, 82 / 255, 1]);
            backend.queueSprite({
                source: glowSprite,
                centerX: px,
                centerY: py,
                width: size * 2,
                height: size * 2,
                tint,
                alpha,
                blendMode: "additive"
            });
        }
    }

    drawProjectileExplosionEffectsWebGL(state, view) {
        const backend = this.webglBackend;
        if (!backend?.available) {
            return;
        }
        const ringSprite = this.getWebGLParticleSpriteCanvas("ring");
        const glowSprite = this.getWebGLParticleSpriteCanvas("softGlow");
        const discSprite = this.getWebGLParticleSpriteCanvas("solidDisc");
        for (const projectile of state.projectiles || []) {
            if (projectile.state !== "exploding") {
                continue;
            }
            if (!this.dynamicBoundsVisible(this.projectileRenderBounds(projectile), view, 96)) {
                continue;
            }
            const point = this.worldToScreen(view, projectile.x, projectile.y);
            const total = Math.max(0.001, Number(state.tuning?.rocketProjectileExplosionSeconds) || 0.42);
            const remaining = Math.max(0, Number(projectile.explosionTimer) || 0);
            const progress = Math.max(0, Math.min(1, 1 - remaining / total));
            const flashFade = Math.pow(1 - progress, 1.45);
            if (projectile.owner !== "enemy") {
                const explosionScale = Math.max(1, Number(projectile.explosionVisualScale) || 1);
                const coreRadius = (12 + 16 * progress) * explosionScale * view.zoom;
                if (glowSprite) {
                    backend.queueSprite({
                        source: glowSprite,
                        centerX: point.x,
                        centerY: point.y,
                        width: coreRadius * 3.1,
                        height: coreRadius * 3.1,
                        tint: [1, 134 / 255, 54 / 255, 1],
                        alpha: 0.76 * flashFade,
                        blendMode: "additive"
                    });
                }
                if (discSprite) {
                    backend.queueSprite({
                        source: discSprite,
                        centerX: point.x,
                        centerY: point.y,
                        width: coreRadius * 0.82,
                        height: coreRadius * 0.82,
                        tint: [1, 246 / 255, 174 / 255, 1],
                        alpha: 0.74 * flashFade,
                        blendMode: "additive"
                    });
                }
                this.drawSparkBurstWebGL(
                    point.x,
                    point.y,
                    view,
                    projectile.age + projectile.x,
                    Math.max(9, Math.round(9 * explosionScale)),
                    22 * explosionScale * view.zoom,
                    "rocket"
                );
                const areaRadius = Math.max(0, Number(projectile.areaDamageRadius) || 0);
                if (areaRadius > 0 && ringSprite) {
                    backend.queueSprite({
                        source: ringSprite,
                        centerX: point.x,
                        centerY: point.y,
                        width: areaRadius * view.zoom * 2 * (0.18 + progress * 0.82),
                        height: areaRadius * view.zoom * 2 * (0.18 + progress * 0.82),
                        tint: [1, 208 / 255, 89 / 255, 1],
                        alpha: (1 - progress) * 0.58,
                        blendMode: "additive"
                    });
                }
            } else {
                const enemyRadius = (7 + progress * 7) * view.zoom;
                if (glowSprite) {
                    backend.queueSprite({
                        source: glowSprite,
                        centerX: point.x,
                        centerY: point.y,
                        width: enemyRadius * 3,
                        height: enemyRadius * 3,
                        tint: [1, 78 / 255, 38 / 255, 1],
                        alpha: 0.42 * flashFade,
                        blendMode: "additive"
                    });
                }
                this.drawSparkBurstWebGL(
                    point.x,
                    point.y,
                    view,
                    projectile.age + projectile.x,
                    projectile.impactKind === "player" ? 4 : 3,
                    (projectile.impactKind === "player" ? 10 : 8) * view.zoom,
                    projectile.impactKind === "player" ? "wizardAccent" : "enemy"
                );
            }
            this.markDynamicDrawn();
        }
    }

    drawPlayerDeathCoverWebGL(state, view) {
        const backend = this.webglBackend;
        if (!backend?.available || state.player?.deathPhase !== "cover") {
            return;
        }
        const sparks = (state.effects?.smokePuffs || []).filter((puff) => puff.kind === "wizardDeathCoverSpark");
        if (!sparks.length) {
            return;
        }
        const crossSprite = this.getWebGLParticleSpriteCanvas("crossSpark");
        const glowSprite = this.getWebGLParticleSpriteCanvas("softGlow");
        for (const spark of sparks) {
            const delay = Math.max(0, Number(spark.delay) || 0);
            if ((Number(spark.age) || 0) < delay) {
                continue;
            }
            const localAge = Math.max(0, (Number(spark.age) || 0) - delay);
            const ramp = clamp(localAge / 0.075, 0, 1);
            const twinkle = 0.7 + 0.3 * Math.sin(localAge * 36 + (Number(spark.sparkleSeed) || 0) * 0.17);
            const alpha = ramp * twinkle;
            const radiusWorld = Math.max(1, Number(spark.radius) || 1) * 2.1;
            if (!this.dynamicBoundsVisible({
                minX: spark.x - radiusWorld,
                minY: spark.y - radiusWorld,
                maxX: spark.x + radiusWorld,
                maxY: spark.y + radiusWorld
            }, view, 48)) {
                continue;
            }
            const point = this.worldToScreen(view, spark.x, spark.y);
            const radius = Math.max(1, Number(spark.radius) || 1) * view.zoom;
            const paletteIndex = (Number(spark.colorIndex) || 0) % 3;
            const tint = paletteIndex === 0
                ? [168 / 255, 78 / 255, 1, 1]
                : paletteIndex === 1
                    ? [1, 222 / 255, 70 / 255, 1]
                    : [1, 1, 250 / 255, 1];
            if (glowSprite) {
                backend.queueSprite({
                    source: glowSprite,
                    centerX: point.x,
                    centerY: point.y,
                    width: radius * 4.3,
                    height: radius * 4.3,
                    tint,
                    alpha: 0.22 * alpha,
                    blendMode: "additive"
                });
            }
            if (crossSprite) {
                backend.queueSprite({
                    source: crossSprite,
                    centerX: point.x,
                    centerY: point.y,
                    width: radius * 3.2,
                    height: radius * 3.2,
                    rotation: Number(spark.rotation) || 0,
                    tint,
                    alpha: 0.98 * alpha,
                    blendMode: "additive"
                });
            }
            this.markDynamicDrawn();
        }
    }

    isUndeathProjectile(projectile) {
        return projectile?.visualStyle === "undeath" || projectile?.projectileKind === "undeathOrb" || projectile?.frameId === "undeathOrb";
    }

    undeathTint(strength = 0.6) {
        const glow = clamp(Number(strength) || 0.6, 0, 1);
        return [
            (34 + glow * 52) / 255,
            (112 + glow * 105) / 255,
            (4 + glow * 22) / 255,
            1
        ];
    }

    undeathPalette(strength = 0.6) {
        const glow = clamp(Number(strength) || 0.6, 0, 1);
        return [
            `rgba(${Math.round(18 + glow * 24)}, ${Math.round(42 + glow * 38)}, 3, 1)`,
            `rgba(${Math.round(38 + glow * 42)}, ${Math.round(116 + glow * 92)}, ${Math.round(4 + glow * 18)}, 0.98)`,
            `rgba(${Math.round(14 + glow * 18)}, ${Math.round(64 + glow * 62)}, 2, 0.82)`,
            "rgba(0, 0, 0, 0)"
        ];
    }

    fireballHeatTint(heat) {
        if (heat > 0.78) {
            return [1, 240 / 255, 165 / 255, 1];
        }
        if (heat > 0.50) {
            return [1, 188 / 255, 55 / 255, 1];
        }
        if (heat > 0.25) {
            return [1, 110 / 255, 24 / 255, 1];
        }
        return [220 / 255, 44 / 255, 18 / 255, 1];
    }

    queueWebGLAssetSprite(asset, centerX, centerY, targetHeight, rotation = 0, options = {}) {
        const backend = this.webglBackend;
        if (!backend?.available || !(asset?.image || asset?.canvas) || asset.missing) {
            return false;
        }
        const spriteScale = Math.max(0.0001, Number(targetHeight) || 0) / Math.max(1, asset.height);
        const localOffsetX = Number(options.localOffsetX) || 0;
        const localOffsetY = Number(options.localOffsetY) || 0;
        const offsetX = localOffsetX * spriteScale;
        const offsetY = localOffsetY * spriteScale;
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const rotatedOffsetX = offsetX * cos - offsetY * sin;
        const rotatedOffsetY = offsetX * sin + offsetY * cos;
        const source = asset.image || asset.canvas;
        const atlasBacked = Boolean(asset.image);
        return backend.queueSprite({
            source,
            sourceX: atlasBacked ? asset.sourceX : 0,
            sourceY: atlasBacked ? asset.sourceY : 0,
            sourceWidth: atlasBacked ? asset.sourceWidth : asset.width,
            sourceHeight: atlasBacked ? asset.sourceHeight : asset.height,
            centerX: centerX + rotatedOffsetX,
            centerY: centerY + rotatedOffsetY,
            width: asset.width * spriteScale,
            height: asset.height * spriteScale,
            rotation,
            alpha: options.alpha ?? 1,
            blendMode: options.blendMode || "alpha",
            tint: options.tint || [1, 1, 1, 1]
        });
    }

    drawEnemyFireballParticlesWebGL(projectile, state, view) {
        const backend = this.webglBackend;
        const undeath = this.isUndeathProjectile(projectile);
        const particleSprite = this.getWebGLParticleSpriteCanvas(undeath ? "undeathBubble" : "softGlow");
        if (!backend?.available || !particleSprite) {
            return false;
        }
        let drew = false;
        const particles = Array.isArray(projectile.trail) ? projectile.trail : [];
        for (const particle of particles) {
            const age = state.clock.time - Number(particle.birth || 0);
            const lifetime = Math.max(0.0001, Number(particle.lifetime) || 0.2);
            if (age < 0 || age > lifetime) {
                continue;
            }
            const fade = 1 - age / lifetime;
            const worldX = Number(particle.x || 0) + Number(particle.vx || 0) * age;
            const worldY = Number(particle.y || 0) + Number(particle.vy || 0) * age;
            const screen = this.worldToScreen(view, worldX, worldY);
            const radius = Math.max(0.15 * view.zoom, Number(particle.radius || 2) * fade * view.zoom);
            const tint = undeath
                ? [1, 1, 1, 1]
                : this.fireballHeatTint(clamp((Number(particle.heat ?? 0.5)) * (0.45 + fade * 0.55), 0, 1));
            const queued = backend.queueSprite({
                source: particleSprite,
                centerX: screen.x,
                centerY: screen.y,
                width: radius * (undeath ? 2.45 : 2.8),
                height: radius * (undeath ? 2.45 : 2.8),
                tint,
                alpha: Math.min(1, undeath ? fade * 0.92 : fade * 1.08),
                blendMode: undeath ? "alpha" : "additive"
            });
            drew = queued || drew;
        }
        return drew;
    }

    drawProjectileFireballWebGL(projectile, state, view) {
        const backend = this.webglBackend;
        if (!backend?.available) {
            return false;
        }
        const p = this.worldToScreen(view, projectile.x, projectile.y);
        const speed = Math.hypot(projectile.vx, projectile.vy) || 1;
        const angle = Math.atan2(projectile.vy / speed, projectile.vx / speed);
        const undeath = this.isUndeathProjectile(projectile);
        const trailEnabled = undeath || state.settings?.renderingQuality !== "low";
        let drew = false;
        if (trailEnabled && !undeath) {
            drew = this.drawEnemyFireballParticlesWebGL(projectile, state, view) || drew;
        }
        if (!undeath) {
            const asset = this.getCharacterAtlasFrame(projectile.characterId || "ct_char_enemy_010", projectile.frameId || "fireball") ||
                this.getCharacterAtlasFrame("ct_char_enemy_010", "fireball");
            if (asset && !asset.missing) {
                const targetHeight = Math.max(8, Number(projectile.radius) || 10) * 2 * view.zoom;
                drew = this.queueWebGLAssetSprite(asset, p.x, p.y, targetHeight, angle) || drew;
            } else {
                // the circular glow is only a missing-art fallback for ordinary fireballs.
                const glowSprite = this.getWebGLParticleSpriteCanvas("softGlow");
                const fallbackRadius = Math.max(2, Number(projectile.radius) || 10) * view.zoom;
                if (glowSprite) {
                    drew = backend.queueSprite({
                        source: glowSprite,
                        centerX: p.x,
                        centerY: p.y,
                        width: fallbackRadius * 2,
                        height: fallbackRadius * 2,
                        tint: this.fireballHeatTint(0.72),
                        alpha: 0.78,
                        blendMode: "additive"
                    }) || drew;
                }
            }
        }
        if (trailEnabled && undeath) {
            drew = this.drawEnemyFireballParticlesWebGL(projectile, state, view) || drew;
        }
        return drew;
    }

    drawProjectileMusketBallWebGL(projectile, state, view) {
        const backend = this.webglBackend;
        if (!backend?.available) {
            return false;
        }
        const p = this.worldToScreen(view, projectile.x, projectile.y);
        const targetHeight = Math.max(2, Number(projectile.radius) || 1) * 2.45 * view.zoom;
        const rotation = projectile.age * 8;
        const asset = this.getCharacterAtlasFrame(projectile.characterId || "ct_char_enemy_011", projectile.frameId || "cannonball") ||
            this.getCharacterAtlasFrame("ct_char_enemy_011", "cannonball") ||
            this.getCharacterAtlasFrame("ct_char_enemy_010", "cannonball");
        if (asset && !asset.missing) {
            return this.queueWebGLAssetSprite(asset, p.x, p.y, targetHeight, rotation);
        }
        const fallback = this.getWebGLParticleSpriteCanvas("musketBall");
        return Boolean(fallback && backend.queueSprite({
            source: fallback,
            centerX: p.x,
            centerY: p.y,
            width: targetHeight,
            height: targetHeight,
            rotation
        }));
    }

    drawProjectileRockWebGL(projectile, state, view) {
        const backend = this.webglBackend;
        if (!backend?.available) {
            return false;
        }
        const p = this.worldToScreen(view, projectile.x, projectile.y);
        const targetHeight = Math.max(8, Number(projectile.radius) || 10) * 2.35 * view.zoom;
        const rotation = (Number(projectile.age) || 0) * 5 + projectile.x * 0.01;
        const asset = this.getCharacterAtlasFrame(projectile.characterId || "ct_char_enemy_020", projectile.frameId || "rock") ||
            this.getCharacterAtlasFrame("ct_char_enemy_020", "rock");
        if (asset && !asset.missing) {
            return this.queueWebGLAssetSprite(asset, p.x, p.y, targetHeight, rotation);
        }
        const fallback = this.getWebGLParticleSpriteCanvas("rock");
        return Boolean(fallback && backend.queueSprite({
            source: fallback,
            centerX: p.x,
            centerY: p.y,
            width: targetHeight,
            height: targetHeight,
            rotation
        }));
    }

    drawProjectileKnifeWebGL(projectile, state, view) {
        const backend = this.webglBackend;
        if (!backend?.available) {
            return false;
        }
        const p = this.worldToScreen(view, projectile.x, projectile.y);
        const travelAngle = Math.atan2(Number(projectile.vy) || 0, Number(projectile.vx) || 1);
        const rotation = travelAngle;
        const targetHeight = Math.max(5, Number(projectile.radius) || 5) * 1.45 * view.zoom;
        const asset = this.getCharacterAtlasFrame(projectile.characterId || "ct_char_enemy_032", projectile.frameId || "dagger") ||
            this.getCharacterAtlasFrame("ct_char_enemy_032", "dagger");
        if (asset && !asset.missing) {
            return this.queueWebGLAssetSprite(asset, p.x, p.y, targetHeight, rotation);
        }
        return false;
    }

    drawRocketPathTrailWebGL(projectile, state, view) {
        const backend = this.webglBackend;
        if (!backend?.available) return false;
        const rawTrail = Array.isArray(projectile.trail) ? projectile.trail : [];
        const trail = rawTrail.concat([{ x: projectile.x, y: projectile.y, time: state.clock.time }]);
        if (trail.length < 2) return false;

        const screenTrail = trail.map((point) => ({
            ...this.worldToScreen(view, point.x, point.y),
            time: point.time ?? state.clock.time
        }));
        const maxScreenLength = view.w * 0.075;
        const visible = [screenTrail[screenTrail.length - 1]];
        let distanceSoFar = 0;
        for (let index = screenTrail.length - 2; index >= 0; index -= 1) {
            const newer = screenTrail[index + 1];
            const older = screenTrail[index];
            const segment = Math.hypot(newer.x - older.x, newer.y - older.y);
            if (distanceSoFar + segment > maxScreenLength) {
                const remaining = Math.max(0, maxScreenLength - distanceSoFar);
                const ratio = segment <= 0 ? 0 : remaining / segment;
                visible.push({
                    x: newer.x + (older.x - newer.x) * ratio,
                    y: newer.y + (older.y - newer.y) * ratio,
                    time: older.time
                });
                break;
            }
            visible.push(older);
            distanceSoFar += segment;
        }
        visible.reverse();
        if (visible.length < 2) return false;

        const smokeStamp = this.getSmokeStampCanvas(projectile.wrenchGlowTint || null);
        const glowSprite = this.getWebGLParticleSpriteCanvas("softGlow");
        let drew = false;
        if (smokeStamp) {
            for (let index = 0; index < visible.length - 1; index += 1) {
                const a = visible[index];
                const b = visible[index + 1];
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const segmentLength = Math.hypot(dx, dy);
                if (segmentLength <= 0.001) continue;
                const u = index / Math.max(1, visible.length - 2);
                const age = clamp((state.clock.time - (a.time ?? state.clock.time)) / 1.25, 0, 1);
                const smokeAlpha = (0.055 + 0.17 * u) * (1 - age * 0.55);
                const smokeWidth = Math.max(2, (18 - u * 9) * view.zoom);
                drew = backend.queueSprite({
                    source: smokeStamp,
                    centerX: (a.x + b.x) * 0.5,
                    centerY: (a.y + b.y) * 0.5,
                    width: segmentLength + smokeWidth,
                    height: smokeWidth,
                    rotation: Math.atan2(dy, dx),
                    alpha: smokeAlpha,
                    blendMode: "alpha"
                }) || drew;
            }
        }

        if (glowSprite) {
            const sparkCount = Math.min(42, Math.max(8, visible.length * 2));
            const seed = projectile.id.length * 97 + Math.floor(projectile.x * 0.11) + Math.floor(projectile.y * 0.07);
            const poweredTint = hexColorRgb(projectile.wrenchGlowTint);
            for (let index = 0; index < sparkCount; index += 1) {
                const segmentIndex = Math.min(visible.length - 2, Math.floor(hashNoise(seed + 13, index) * (visible.length - 1)));
                const a = visible[segmentIndex];
                const b = visible[segmentIndex + 1];
                const t = hashNoise(seed + 31, index);
                const x = a.x + (b.x - a.x) * t;
                const y = a.y + (b.y - a.y) * t;
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const length = Math.hypot(dx, dy) || 1;
                const nx = -dy / length;
                const ny = dx / length;
                const u = (segmentIndex + t) / Math.max(1, visible.length - 1);
                const spread = (5 + (1 - u) * 11) * view.zoom;
                const jitter = (hashNoise(seed + 71, index) - 0.5) * spread;
                const age = clamp((state.clock.time - (a.time ?? state.clock.time)) / 1.25, 0, 1);
                const twinkle = 0.72 + 0.28 * Math.sin(state.clock.time * 19 + index * 1.7);
                const fade = Math.pow(u, 0.38) * (1 - age * 0.55) * twinkle;
                const size = (0.8 + hashNoise(seed + 101, index) * 2.1) * view.zoom * (0.45 + fade);
                const tint = poweredTint && index % 3 === 0
                    ? [poweredTint.r / 255, poweredTint.g / 255, poweredTint.b / 255, 1]
                    : (index % 7 === 0
                        ? [197 / 255, 151 / 255, 1, 1]
                        : (index % 2 === 0 ? [1, 239 / 255, 126 / 255, 1] : [1, 133 / 255, 82 / 255, 1]));
                drew = backend.queueSprite({
                    source: glowSprite,
                    centerX: x + nx * jitter,
                    centerY: y + ny * jitter,
                    width: size * 2.4,
                    height: size * 2.4,
                    tint,
                    alpha: clamp(0.06 + fade * 0.58, 0, 0.72),
                    blendMode: "additive"
                }) || drew;
            }

            // Do not add a separate large soft-glow core at the newest trail sample.
            // Its position jumps whenever the simulation records a new path sample, which
            // reads as an orange warning beacon beside the rocket. The dedicated nozzle
            // flame owns the short hot exhaust immediately behind the projectile.
        }
        return drew;
    }

    drawProjectileRocketFlameWebGL(projectile, state, centerX, centerY, angle, baseAsset, pivot, targetHeight, visualScale = 1) {
        const backend = this.webglBackend;
        if (!backend?.available) {
            return false;
        }
        const flameSprite = this.getWebGLParticleSpriteCanvas("rocketFlame") || this.getWebGLParticleSpriteCanvas("softGlow");
        if (!flameSprite) {
            return false;
        }
        const safeScale = Math.max(0.1, Number(visualScale) || 1);
        const stableSeed = String(projectile?.id || "rocket")
            .split("")
            .reduce((sum, ch, index) => sum + ch.charCodeAt(0) * (index + 1), 0);
        const flutter = 0.96 + 0.04 * Math.sin((state.clock.time || 0) * 33 + stableSeed * 0.17);
        const flameLength = targetHeight * (0.52 + 0.08 * safeScale) * flutter;
        const flameWidth = targetHeight * (0.20 + 0.03 * safeScale);
        const nozzleLocalY = (0.965 - pivot.y) * baseAsset.height;
        const nozzleOffset = nozzleLocalY * (targetHeight / Math.max(1, baseAsset.height));
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const flameCenterX = centerX - nozzleOffset * sin;
        const flameCenterY = centerY + nozzleOffset * cos;

        let drew = backend.queueSprite({
            source: flameSprite,
            centerX: flameCenterX,
            centerY: flameCenterY,
            width: flameWidth,
            height: flameLength,
            rotation: angle + Math.PI,
            tint: [1, 168 / 255, 78 / 255, 1],
            alpha: 0.40,
            blendMode: "additive"
        });
        drew = backend.queueSprite({
            source: flameSprite,
            centerX: flameCenterX,
            centerY: flameCenterY,
            width: flameWidth * 0.50,
            height: flameLength * 0.58,
            rotation: angle + Math.PI,
            tint: [1, 244 / 255, 196 / 255, 1],
            alpha: 0.54,
            blendMode: "additive"
        }) || drew;
        return drew;
    }

    drawProjectileRocketWebGL(projectile, state, view) {
        const backend = this.webglBackend;
        if (!backend?.available) {
            return false;
        }
        const baseAsset = this.getCharacterAtlasFrame(projectile.characterId || "ct_char_wizard_1", projectile.frameId || "rocket_projectile") ||
            this.assets.get(projectile.frameId || "rocket_projectile") ||
            this.assets.get("rocket");
        if (!baseAsset || baseAsset.missing) {
            return false;
        }
        const p = this.worldToScreen(view, projectile.x, projectile.y);
        const speed = Math.hypot(projectile.vx, projectile.vy) || 1;
        const dir = { x: projectile.vx / speed, y: projectile.vy / speed };
        const angle = Math.atan2(dir.x, -dir.y);
        const pivot = projectile.frameId === "rocket_projectile"
            ? { x: 0.5, y: 0.78 }
            : this.rigConfig.pivots.rocket;
        const visualScale = Math.max(0.1, Number(projectile.visualScale) || 1);
        const targetHeight = (projectile.frameId === "rocket_projectile" ? 58 : 72) * visualScale * view.zoom;

        const glowFrameId = projectile.wrenchGlowFrameId || wrenchRocketGlowAtlasFrameId(projectile.wrenchEffectId);
        const poweredAsset = glowFrameId
            ? this.getCharacterAtlasFrame(projectile.characterId || "ct_char_wizard_1", glowFrameId) ||
                this.getCharacterAtlasFrame("ct_char_wizard_1", glowFrameId)
            : null;
        const drawAsset = poweredAsset?.canvas ? poweredAsset : baseAsset;
        const drawOffsetX = -pivot.x * baseAsset.width - (drawAsset === poweredAsset ? (Number(drawAsset.paddingX) || 0) : 0);
        const drawOffsetY = -pivot.y * baseAsset.height - (drawAsset === poweredAsset ? (Number(drawAsset.paddingY) || 0) : 0);
        const localCenterX = drawOffsetX + drawAsset.width * 0.5;
        const localCenterY = drawOffsetY + drawAsset.height * 0.5;

        let drew = this.drawRocketPathTrailWebGL(projectile, state, view);
        drew = this.drawProjectileRocketFlameWebGL(projectile, state, p.x, p.y, angle, baseAsset, pivot, targetHeight, visualScale) || drew;
        drew = this.queueWebGLAssetSprite(drawAsset, p.x, p.y, targetHeight, angle, {
            localOffsetX: localCenterX,
            localOffsetY: localCenterY
        }) || drew;
        return drew;
    }

    drawPlayerRocketsWebGL(state, view, handled = this.frameHandledProjectileIds) {
        const backend = this.webglBackend;
        if (!backend?.available) {
            return handled;
        }
        for (const projectile of state.projectiles || []) {
            if (projectile.state !== "launched" || projectile.owner === "enemy") {
                continue;
            }
            if (projectile.kind === "enemyFireball" || projectile.kind === "enemyMusketBall" || projectile.kind === "enemyRock") {
                continue;
            }
            if (!this.dynamicBoundsVisible(this.projectileRenderBounds(projectile), view, 96)) {
                continue;
            }
            if (this.drawProjectileRocketWebGL(projectile, state, view)) {
                handled.add(projectile.id);
                this.markDynamicDrawn();
            }
        }
        return handled;
    }

    drawEnemyProjectilesWebGL(state, view, handled = this.frameHandledProjectileIds) {
        const backend = this.webglBackend;
        if (!backend?.available) {
            return handled;
        }
        for (const projectile of state.projectiles || []) {
            const lingeringUndeath = this.isUndeathProjectile(projectile) &&
                (projectile.state === "exploding" || projectile.state === "trailFading");
            if ((projectile.state !== "launched" && !lingeringUndeath) || projectile.owner !== "enemy") {
                continue;
            }
            if (!WEBGL_DIRECT_ENEMY_PROJECTILE_KINDS.has(projectile.kind)) {
                continue;
            }
            if (!this.dynamicBoundsVisible(this.projectileRenderBounds(projectile), view, 96)) {
                continue;
            }
            let drew = false;
            if (projectile.kind === "enemyFireball") {
                drew = this.drawProjectileFireballWebGL(projectile, state, view);
            } else if (projectile.kind === "enemyMusketBall") {
                drew = this.drawProjectileMusketBallWebGL(projectile, state, view);
            } else if (projectile.kind === "enemyRock") {
                drew = this.drawProjectileRockWebGL(projectile, state, view);
            } else if (projectile.kind === "enemyKnife") {
                drew = this.drawProjectileKnifeWebGL(projectile, state, view);
            }
            if (drew) {
                handled.add(projectile.id);
                this.markDynamicDrawn();
            }
        }
        return handled;
    }

    drawProjectiles(state, view, options = {}) {
        const ctx = this.ctx;
        const skipExploding = options.skipExploding === true;
        const skipProjectileIds = options.skipProjectileIds instanceof Set ? options.skipProjectileIds : null;
        for (const projectile of state.projectiles || []) {
            if (projectile.state !== "exploding" && projectile.state !== "launched" && projectile.state !== "trailFading") {
                continue;
            }
            if (skipExploding && (projectile.state === "exploding" || projectile.state === "trailFading")) {
                continue;
            }
            if (skipProjectileIds?.has(projectile.id)) {
                continue;
            }
            if (!this.dynamicBoundsVisible(this.projectileRenderBounds(projectile), view, 96)) {
                continue;
            }
            if (projectile.state === "trailFading") {
                if (this.isUndeathProjectile(projectile)) {
                    this.drawEnemyFireballParticles(projectile, state, view);
                    this.markDynamicDrawn();
                }
                continue;
            }
            if (projectile.state === "exploding") {
                if (this.isUndeathProjectile(projectile)) {
                    this.drawEnemyFireballParticles(projectile, state, view);
                }
                const p = this.worldToScreen(view, projectile.x, projectile.y);
                ctx.save();
                if (projectile.owner !== "enemy") {
                    const explosionScale = Math.max(1, Number(projectile.explosionVisualScale) || 1);
                    this.drawSparkBurst(
                        p.x,
                        p.y,
                        view,
                        projectile.age + projectile.x,
                        Math.max(9, Math.round(9 * explosionScale)),
                        22 * explosionScale * view.zoom,
                        "rocket"
                    );
                    const areaRadius = Math.max(0, Number(projectile.areaDamageRadius) || 0);
                    if (areaRadius > 0) {
                        const total = Math.max(0.001, Number(state.tuning?.rocketProjectileExplosionSeconds) || 0.42);
                        const remaining = Math.max(0, Number(projectile.explosionTimer) || 0);
                        const progress = Math.max(0, Math.min(1, 1 - remaining / total));
                        ctx.globalAlpha = (1 - progress) * 0.58;
                        ctx.strokeStyle = "rgba(255, 208, 89, 0.92)";
                        ctx.lineWidth = Math.max(2, 7 * (1 - progress * 0.65) * view.zoom);
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, areaRadius * view.zoom * (0.18 + progress * 0.82), 0, Math.PI * 2);
                        ctx.stroke();
                    }
                } else if (projectile.impactKind === "player") {
                    // Contact with Ignatius may shake loose a small trace of his own
                    // yellow-purple rocket magic, but ordinary mob impacts stay dark.
                    this.drawSparkBurst(p.x, p.y, view, projectile.age + projectile.x, 3, 9 * view.zoom, "wizardAccent");
                }
                ctx.restore();
                this.markDynamicDrawn();
                continue;
            }

            if (projectile.kind === "enemyFireball") {
                this.drawProjectileFireball(projectile, state, view);
            } else if (projectile.kind === "enemyMusketBall") {
                this.drawProjectileMusketBall(projectile, state, view);
            } else if (projectile.kind === "enemyRock") {
                this.drawProjectileRock(projectile, state, view);
            } else if (projectile.kind === "enemyKnife") {
                this.drawProjectileKnife(projectile, state, view);
            } else {
                this.drawProjectileRocket(projectile, state, view);
            }
            this.markDynamicDrawn();
        }
    }


    drawProjectileRocket(projectile, state, view) {
        const baseAsset = this.getCharacterAtlasFrame(projectile.characterId || "ct_char_wizard_1", projectile.frameId || "rocket_projectile") ||
            this.assets.get(projectile.frameId || "rocket_projectile") ||
            this.assets.get("rocket");
        if (!baseAsset || baseAsset.missing) {
            return;
        }
        const ctx = this.ctx;
        const p = this.worldToScreen(view, projectile.x, projectile.y);
        const speed = Math.hypot(projectile.vx, projectile.vy) || 1;
        const dir = { x: projectile.vx / speed, y: projectile.vy / speed };
        const angle = Math.atan2(dir.x, -dir.y);
        const pivot = projectile.frameId === "rocket_projectile"
            ? { x: 0.5, y: 0.78 }
            : this.rigConfig.pivots.rocket;
        const visualScale = Math.max(0.1, Number(projectile.visualScale) || 1);
        const targetHeight = (projectile.frameId === "rocket_projectile" ? 58 : 72) * visualScale * view.zoom;

        const glowFrameId = projectile.wrenchGlowFrameId || wrenchRocketGlowAtlasFrameId(projectile.wrenchEffectId);
        const poweredAsset = glowFrameId
            ? this.getCharacterAtlasFrame(projectile.characterId || "ct_char_wizard_1", glowFrameId) ||
                this.getCharacterAtlasFrame("ct_char_wizard_1", glowFrameId)
            : null;
        const drawAsset = poweredAsset?.canvas ? poweredAsset : baseAsset;
        const spriteScale = targetHeight / Math.max(1, baseAsset.height);
        const drawOffsetX = -pivot.x * baseAsset.width - (drawAsset === poweredAsset ? (Number(drawAsset.paddingX) || 0) : 0);
        const drawOffsetY = -pivot.y * baseAsset.height - (drawAsset === poweredAsset ? (Number(drawAsset.paddingY) || 0) : 0);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.scale(spriteScale, spriteScale);
        drawRuntimePixmap(ctx, drawAsset, drawOffsetX, drawOffsetY);
        drawRocketFlameLocal(ctx, baseAsset, pivot, state.clock.time + projectile.age * 11, 0.55, projectile.id.length * 13);
        ctx.restore();
    }


    drawProjectileKnife(projectile, state, view) {
        const ctx = this.ctx;
        const p = this.worldToScreen(view, projectile.x, projectile.y);
        const asset = this.getCharacterAtlasFrame(projectile.characterId || "ct_char_enemy_032", projectile.frameId || "dagger") ||
            this.getCharacterAtlasFrame("ct_char_enemy_032", "dagger");
        if (!asset || asset.missing) {
            return;
        }
        const travelAngle = Math.atan2(Number(projectile.vy) || 0, Number(projectile.vx) || 1);
        const rotation = travelAngle;
        const targetHeight = Math.max(5, Number(projectile.radius) || 5) * 1.45 * view.zoom;
        const spriteScale = targetHeight / Math.max(1, asset.height);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(rotation);
        ctx.scale(spriteScale, spriteScale);
        drawRuntimePixmap(ctx, asset, -asset.width * 0.5, -asset.height * 0.5);
        ctx.restore();
    }

    drawProjectileRock(projectile, state, view) {
        const ctx = this.ctx;
        const p = this.worldToScreen(view, projectile.x, projectile.y);
        const asset = this.getCharacterAtlasFrame(projectile.characterId || "ct_char_enemy_020", projectile.frameId || "rock") ||
            this.getCharacterAtlasFrame("ct_char_enemy_020", "rock");
        if (asset && !asset.missing) {
            const targetHeight = Math.max(8, Number(projectile.radius) || 10) * 2.35 * view.zoom;
            const spriteScale = targetHeight / Math.max(1, asset.height);
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((Number(projectile.age) || 0) * 5 + projectile.x * 0.01);
            ctx.scale(spriteScale, spriteScale);
            drawRuntimePixmap(ctx, asset, -asset.width * 0.5, -asset.height * 0.5);
            ctx.restore();
            return;
        }

        const radius = Math.max(4, Number(projectile.radius) || 10) * view.zoom;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((Number(projectile.age) || 0) * 5 + projectile.x * 0.01);
        ctx.beginPath();
        for (let i = 0; i < 8; i += 1) {
            const angle = i / 8 * Math.PI * 2;
            const wobble = i % 2 === 0 ? 1 : 0.78;
            const x = Math.cos(angle) * radius * wobble;
            const y = Math.sin(angle) * radius * wobble;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = "#5b5360";
        ctx.strokeStyle = "#241f27";
        ctx.lineWidth = Math.max(1, 2 * view.zoom);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    fireballStableSeed(projectile) {
        const id = String(projectile?.id || projectile?.enemyId || "enemy_fireball");
        let seed = 0;
        for (let i = 0; i < id.length; i += 1) {
            seed = (seed * 131 + id.charCodeAt(i)) % 1000003;
        }
        seed += Math.round((Number(projectile?.radius) || 0) * 97);
        return seed;
    }

    fireballHeatPalette(heat) {
        if (heat > 0.78) {
            return [
                "rgba(255, 255, 245, 1)",
                "rgba(255, 240, 165, 0.98)",
                "rgba(255, 180, 45, 0.65)",
                "rgba(255, 90, 12, 0)"
            ];
        }
        if (heat > 0.50) {
            return [
                "rgba(255, 240, 130, 0.98)",
                "rgba(255, 188, 55, 0.95)",
                "rgba(255, 96, 18, 0.7)",
                "rgba(160, 20, 12, 0)"
            ];
        }
        if (heat > 0.25) {
            return [
                "rgba(255, 176, 58, 0.96)",
                "rgba(255, 110, 24, 0.86)",
                "rgba(210, 40, 14, 0.6)",
                "rgba(120, 10, 8, 0)"
            ];
        }
        return [
            "rgba(255, 100, 28, 0.9)",
            "rgba(220, 44, 18, 0.8)",
            "rgba(150, 16, 12, 0.55)",
            "rgba(100, 0, 0, 0)"
        ];
    }

    drawFireballGlowCircle(ctx, x, y, radius, palette, alpha = 1) {
        const r = Math.max(0.1, radius);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, palette[0]);
        gradient.addColorStop(0.38, palette[1]);
        gradient.addColorStop(0.75, palette[2]);
        gradient.addColorStop(1, palette[3]);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawEnemyFireballParticles(projectile, state, view) {
        const ctx = this.ctx;
        const particles = Array.isArray(projectile.trail) ? projectile.trail : [];
        if (!particles.length) {
            return;
        }
        const undeath = this.isUndeathProjectile(projectile);
        const undeathBubble = undeath ? this.getWebGLParticleSpriteCanvas("undeathBubble") : null;
        ctx.save();
        ctx.globalCompositeOperation = undeath ? "source-over" : "lighter";
        for (const particle of particles) {
            const age = state.clock.time - Number(particle.birth || 0);
            const lifetime = Math.max(0.0001, Number(particle.lifetime) || 0.2);
            if (age < 0 || age > lifetime) {
                continue;
            }
            const fade = 1 - age / lifetime;
            const worldX = Number(particle.x || 0) + Number(particle.vx || 0) * age;
            const worldY = Number(particle.y || 0) + Number(particle.vy || 0) * age;
            const screen = this.worldToScreen(view, worldX, worldY);
            const radius = Math.max(0.15 * view.zoom, Number(particle.radius || 2) * fade * view.zoom);
            if (undeath && undeathBubble) {
                const diameter = radius * 2.45;
                ctx.save();
                ctx.globalAlpha = fade * 0.92;
                ctx.drawImage(undeathBubble, screen.x - diameter * 0.5, screen.y - diameter * 0.5, diameter, diameter);
                ctx.restore();
                continue;
            }
            const cooledHeat = clamp((Number(particle.heat ?? 0.5)) * (0.45 + fade * 0.55), 0, 1);
            this.drawFireballGlowCircle(ctx, screen.x, screen.y, radius, this.fireballHeatPalette(cooledHeat), fade * 0.92);
        }
        ctx.restore();
    }

    drawProjectileFireball(projectile, state, view) {
        const ctx = this.ctx;
        const p = this.worldToScreen(view, projectile.x, projectile.y);
        const speed = Math.hypot(projectile.vx, projectile.vy) || 1;
        const angle = Math.atan2(projectile.vy / speed, projectile.vx / speed);
        const undeath = this.isUndeathProjectile(projectile);
        const trailEnabled = undeath || state.settings?.renderingQuality !== "low";

        if (trailEnabled && !undeath) {
            this.drawEnemyFireballParticles(projectile, state, view);
        }

        if (!undeath) {
            const asset = this.getCharacterAtlasFrame(projectile.characterId || "ct_char_enemy_010", projectile.frameId || "fireball") ||
                this.getCharacterAtlasFrame("ct_char_enemy_010", "fireball");
            if (asset && !asset.missing) {
                const targetHeight = Math.max(8, Number(projectile.radius) || 10) * 2 * view.zoom;
                const spriteScale = targetHeight / Math.max(1, asset.height);
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(angle);
                ctx.scale(spriteScale, spriteScale);
                drawRuntimePixmap(ctx, asset, -asset.width * 0.5, -asset.height * 0.5);
                ctx.restore();
            } else {
                const fallbackRadius = Math.max(2, Number(projectile.radius) || 10) * view.zoom;
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                this.drawFireballGlowCircle(ctx, p.x, p.y, fallbackRadius, this.fireballHeatPalette(0.72), 0.96);
                ctx.restore();
            }
        }

        if (trailEnabled && undeath) {
            this.drawEnemyFireballParticles(projectile, state, view);
        }
    }

    drawFireballTrailOverlay(projectile, state, view, fireballCoreRadius = 0) {
        // Enemy fireballs now animate as live emitted particles rather than a pre-shaped trail overlay.
        void projectile;
        void state;
        void view;
        void fireballCoreRadius;
    }

    drawProjectileMusketBall(projectile, state, view) {
        const ctx = this.ctx;
        const p = this.worldToScreen(view, projectile.x, projectile.y);
        const asset = this.getCharacterAtlasFrame(projectile.characterId || "ct_char_enemy_011", projectile.frameId || "cannonball") ||
            this.getCharacterAtlasFrame("ct_char_enemy_011", "cannonball") ||
            this.getCharacterAtlasFrame("ct_char_enemy_010", "cannonball");
        if (asset && !asset.missing) {
            const targetHeight = projectile.radius * 2.45 * view.zoom;
            const spriteScale = targetHeight / Math.max(1, asset.height);
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(projectile.age * 8);
            ctx.scale(spriteScale, spriteScale);
            drawRuntimePixmap(ctx, asset, -asset.width * 0.5, -asset.height * 0.5);
            ctx.restore();
            return;
        }

        const r = projectile.radius * view.zoom;
        ctx.save();
        ctx.fillStyle = "rgba(42, 44, 49, 0.98)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.beginPath();
        ctx.arc(p.x - r * 0.28, p.y - r * 0.3, Math.max(1.3, r * 0.28), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawRocketPathTrail(projectile, state, view) {
        const ctx = this.ctx;
        const rawTrail = Array.isArray(projectile.trail) ? projectile.trail : [];
        const trail = rawTrail.concat([{ x: projectile.x, y: projectile.y, time: state.clock.time }]);
        if (trail.length < 2) {
            return;
        }

        const screenTrail = trail.map((point) => ({
            ...this.worldToScreen(view, point.x, point.y),
            worldX: point.x,
            worldY: point.y,
            time: point.time ?? state.clock.time
        }));

        const maxScreenLength = this.canvas.width * 0.075;
        const visible = [screenTrail[screenTrail.length - 1]];
        let distanceSoFar = 0;
        for (let i = screenTrail.length - 2; i >= 0; i -= 1) {
            const newer = screenTrail[i + 1];
            const older = screenTrail[i];
            const segment = Math.hypot(newer.x - older.x, newer.y - older.y);
            if (distanceSoFar + segment > maxScreenLength) {
                const remaining = Math.max(0, maxScreenLength - distanceSoFar);
                const ratio = segment <= 0 ? 0 : remaining / segment;
                visible.push({
                    x: newer.x + (older.x - newer.x) * ratio,
                    y: newer.y + (older.y - newer.y) * ratio,
                    time: older.time
                });
                break;
            }
            visible.push(older);
            distanceSoFar += segment;
        }
        visible.reverse();

        if (visible.length < 2) {
            return;
        }

        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // First pass: smoke that stays on the travelled path.
        for (let i = 0; i < visible.length - 1; i += 1) {
            const a = visible[i];
            const b = visible[i + 1];
            const u = i / Math.max(1, visible.length - 2);
            const age = clamp((state.clock.time - (a.time ?? state.clock.time)) / 1.25, 0, 1);
            const smokeAlpha = (0.05 + 0.16 * u) * (1 - age * 0.55);
            const smokeWidth = (18 - u * 9) * view.zoom;
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = smokeAlpha;
            ctx.strokeStyle = "rgba(184, 172, 198, 1)";
            ctx.lineWidth = Math.max(2, smokeWidth);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }

        // Second pass: hot magical sparkle crumbs pinned to the same bent path.
        ctx.globalCompositeOperation = "lighter";
        const sparkCount = Math.min(42, Math.max(8, visible.length * 2));
        const seed = projectile.id.length * 97 + Math.floor(projectile.x * 0.11) + Math.floor(projectile.y * 0.07);
        for (let i = 0; i < sparkCount; i += 1) {
            const segmentIndex = Math.min(visible.length - 2, Math.floor(hashNoise(seed + 13, i) * (visible.length - 1)));
            const a = visible[segmentIndex];
            const b = visible[segmentIndex + 1];
            const t = hashNoise(seed + 31, i);
            const x = a.x + (b.x - a.x) * t;
            const y = a.y + (b.y - a.y) * t;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const length = Math.hypot(dx, dy) || 1;
            const nx = -dy / length;
            const ny = dx / length;
            const u = (segmentIndex + t) / Math.max(1, visible.length - 1);
            const spread = (5 + (1 - u) * 11) * view.zoom;
            const jitter = (hashNoise(seed + 71, i) - 0.5) * spread;
            const age = clamp((state.clock.time - (a.time ?? state.clock.time)) / 1.25, 0, 1);
            const twinkle = 0.72 + 0.28 * Math.sin(state.clock.time * 19 + i * 1.7);
            const fade = Math.pow(u, 0.38) * (1 - age * 0.55) * twinkle;
            const size = (0.8 + hashNoise(seed + 101, i) * 2.1) * view.zoom * (0.45 + fade);
            ctx.globalAlpha = clamp(0.04 + fade * 0.52, 0, 0.68);
            ctx.fillStyle = i % 7 === 0 ? "rgba(197, 151, 255, 0.95)" : (i % 2 === 0 ? "rgba(255, 239, 126, 0.94)" : "rgba(255, 133, 82, 0.9)");
            ctx.beginPath();
            ctx.arc(x + nx * jitter, y + ny * jitter, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Small hot core near the nozzle, still short and local to the current rocket.
        const newest = visible[visible.length - 1];
        const previous = visible[Math.max(0, visible.length - 2)];
        const vx = newest.x - previous.x;
        const vy = newest.y - previous.y;
        const length = Math.hypot(vx, vy) || 1;
        const tailX = -vx / length;
        const tailY = -vy / length;
        const core = ctx.createRadialGradient(newest.x + tailX * 12 * view.zoom, newest.y + tailY * 12 * view.zoom, 1, newest.x + tailX * 18 * view.zoom, newest.y + tailY * 18 * view.zoom, 20 * view.zoom);
        core.addColorStop(0, "rgba(255, 235, 126, 0.34)");
        core.addColorStop(1, "rgba(255, 116, 70, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(newest.x + tailX * 16 * view.zoom, newest.y + tailY * 16 * view.zoom, 20 * view.zoom, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawSparkBurst(x, y, view, seed, count, radius, palette = "rocket") {
        const ctx = this.ctx;
        ctx.save();
        for (let i = 0; i < count; i += 1) {
            const a = hashNoise(seed, i) * Math.PI * 2;
            const r = (0.25 + hashNoise(seed + 31, i) * 0.75) * radius;
            const px = x + Math.cos(a) * r;
            const py = y + Math.sin(a) * r;
            const size = (palette === "enemy" ? 0.9 : 1.1) * (1 + hashNoise(seed + 71, i) * (palette === "enemy" ? 1.7 : 2.3)) * view.zoom;
            ctx.globalAlpha = (palette === "enemy" ? 0.22 : 0.28) + hashNoise(seed + 109, i) * (palette === "enemy" ? 0.28 : 0.38);
            ctx.fillStyle = palette === "enemy"
                ? (i % 2 === 0 ? "rgba(255, 92, 68, 0.78)" : "rgba(255, 155, 84, 0.64)")
                : palette === "wizardAccent"
                    ? (i % 2 === 0 ? "rgba(255, 238, 114, 0.82)" : "rgba(184, 112, 255, 0.78)")
                    : (i % 3 === 0 ? "rgba(255, 246, 166, 0.9)" : "rgba(255, 137, 82, 0.86)");
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }


    drawPortalIntroGlow(state, view) {
        const intro = state.story?.portalIntro;
        if (!intro?.active || intro.phase === "closed") return;
        const portal = (state.world?.entities || []).find((entity) => entity.id === intro.portalId);
        if (!portal) return;
        const center = this.worldToScreen(view, Number(portal.x) || 0, (Number(portal.y) || 0) - (Number(portal.h) || 197) * 0.48);
        const radius = Math.max(Number(portal.w) || 150, Number(portal.h) || 197) * 0.55 * view.zoom;
        const pulse = 0.78 + Math.sin(state.clock.time * 8) * 0.12;
        const ctx = this.ctx;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, Math.max(1, radius));
        gradient.addColorStop(0, `rgba(154, 82, 255, ${0.18 * pulse})`);
        gradient.addColorStop(0.52, `rgba(92, 52, 220, ${0.09 * pulse})`);
        gradient.addColorStop(1, "rgba(42, 20, 110, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawMailboxStoryOverlay(state, view) {
        const story = state.story?.mailboxEvent;
        if (!story?.active || (story.phase !== "letter" && story.phase !== "thought")) return;

        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = story.phase === "letter" ? "rgba(5, 7, 18, 0.52)" : "rgba(5, 7, 18, 0.30)";
        ctx.fillRect(0, 0, view.w, view.h);
        ctx.restore();

        if (story.phase === "letter") {
            this.drawLetterOverlay(story, view);
        } else {
            this.drawThoughtOverlay(state, story, view);
        }
    }

    drawLetterOverlay(story, view) {
        const atlas = this.environmentAtlases.get(story.letterAtlasId || "it_atlas_001");
        const frame = atlas?.frames?.[story.letterAssetId || "letter_scroll"];
        if (!atlas?.image || !frame) return;

        const virtualW = Math.min(520, view.virtualW * 0.84);
        const virtualH = virtualW * frame.h / Math.max(1, frame.w);
        const w = virtualW * view.zoom;
        const h = virtualH * view.zoom;
        const x = (view.w - w) * 0.5;
        const y = (view.h - h) * 0.48;
        const ctx = this.ctx;
        ctx.save();
        ctx.drawImage(atlas.renderImage || atlas.image, frame.x, frame.y, frame.w, frame.h, x, y, w, h);

        const textX = x + w * 0.17;
        const textW = w * 0.66;
        const titleY = y + h * 0.18;
        const bodyTop = y + h * 0.285;
        const bodyBottom = y + h * 0.735;
        const bodyHeight = Math.max(1, bodyBottom - bodyTop);
        const fontScale = view.dpr || 1;
        ctx.fillStyle = "rgba(58, 33, 27, 0.96)";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.font = `700 ${20 * fontScale}px Georgia, 'Times New Roman', serif`;
        // Keep the title band deliberately blank. Its reserved vertical space remains,
        // so the letter body retains exactly the same placement as before.
        void titleY;

        // Use the same heavier, rounded story type as Ignatius's thought bubble.
        ctx.textAlign = "left";
        ctx.font = `600 ${17 * fontScale}px Georgia, 'Times New Roman', serif`;
        const lineHeight = 23 * fontScale;
        const lines = this.wrapTextLines(story.letterText || "", textW);
        const contentHeight = this.wrappedLinesHeight(lines, lineHeight);
        const layout = computeTimedTextViewportLayout(
            contentHeight,
            bodyHeight,
            story.phaseTime,
            story.letterDuration,
            story.letterCharacterCount || storyCharacterCount(story.letterText),
            story.readingCharactersPerSecond
        );

        ctx.save();
        ctx.beginPath();
        ctx.rect(textX, bodyTop, textW, bodyHeight);
        ctx.clip();
        this.drawWrappedLines(lines, textX, bodyTop + layout.contentOffset, textW, lineHeight);
        ctx.restore();

        if (layout.maxScroll > 0) {
            this.drawStoryScrollbar(textX + textW + 6 * fontScale, bodyTop, bodyHeight, contentHeight, layout.scrollOffset, fontScale,
                "rgba(91, 54, 37, 0.18)", "rgba(91, 54, 37, 0.52)");
        }
        ctx.restore();
    }

    drawThoughtOverlay(state, story, view) {
        const atlas = this.environmentAtlases.get(story.thoughtAtlasId || "it_atlas_001");
        const frame = atlas?.frames?.[story.thoughtAssetId || "thought_bubble_large"];
        if (!atlas?.image || !frame) return;

        const virtualW = Math.min(440, view.virtualW * 0.74);
        const virtualH = virtualW * frame.h / Math.max(1, frame.w);
        const w = virtualW * view.zoom;
        const h = virtualH * view.zoom;
        const speaker = this.worldToScreen(view, state.player.x, state.player.y - state.player.height * 0.88);
        const placement = computeThoughtBubblePlacement({
            speakerX: speaker.x,
            speakerY: speaker.y,
            bubbleWidth: w,
            bubbleHeight: h,
            viewportWidth: view.w,
            viewportHeight: view.h,
            zoom: view.zoom,
            dpr: view.dpr
        });
        const { x, y } = placement;
        const ctx = this.ctx;
        ctx.save();
        ctx.drawImage(atlas.renderImage || atlas.image, frame.x, frame.y, frame.w, frame.h, x, y, w, h);

        const fontScale = view.zoom || 1;
        const textX = x + w * 0.15;
        const textW = w * 0.70;
        const bodyTop = y + h * 0.19;
        const bodyBottom = y + h * 0.675;
        const bodyHeight = Math.max(1, bodyBottom - bodyTop);
        ctx.fillStyle = "rgba(53, 35, 67, 0.96)";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        const thoughtText = story.thoughtText || "";
        const fitted = this.fitWrappedText(thoughtText, textW, bodyHeight, {
            maxFontSize: 15.8 * fontScale,
            minFontSize: 9 * fontScale,
            lineHeightRatio: 1.31,
            font: "Georgia, 'Times New Roman', serif",
            weight: 600
        });
        const layout = computeTimedTextViewportLayout(
            fitted.contentHeight,
            bodyHeight,
            story.phaseTime,
            story.thoughtDuration,
            story.thoughtCharacterCount || storyCharacterCount(thoughtText),
            story.readingCharactersPerSecond
        );

        ctx.save();
        ctx.beginPath();
        ctx.rect(textX, bodyTop, textW, bodyHeight);
        ctx.clip();
        this.drawWrappedLines(fitted.lines, textX, bodyTop + layout.contentOffset, textW, fitted.lineHeight, true);
        ctx.restore();

        if (layout.maxScroll > 0) {
            this.drawStoryScrollbar(textX + textW + 4 * fontScale, bodyTop, bodyHeight, fitted.contentHeight, layout.scrollOffset, fontScale,
                "rgba(76, 48, 90, 0.16)", "rgba(76, 48, 90, 0.48)");
        }
        ctx.restore();
    }

    drawStoryScrollbar(trackX, trackY, trackHeight, contentHeight, scrollOffset, fontScale, trackColor, thumbColor) {
        const ctx = this.ctx;
        const thumbHeight = Math.max(18 * fontScale, trackHeight * Math.min(1, trackHeight / Math.max(1, contentHeight)));
        const maxScroll = Math.max(0, contentHeight - trackHeight);
        const thumbY = trackY + (trackHeight - thumbHeight) * (maxScroll > 0 ? scrollOffset / maxScroll : 0);
        ctx.fillStyle = trackColor;
        ctx.fillRect(trackX, trackY, 3 * fontScale, trackHeight);
        ctx.fillStyle = thumbColor;
        ctx.fillRect(trackX, thumbY, 3 * fontScale, thumbHeight);
    }

    wrapTextLines(text, maxWidth) {
        const ctx = this.ctx;
        const lines = [];
        const paragraphs = String(text || "").split(/\n/);
        for (const rawParagraph of paragraphs) {
            const paragraph = rawParagraph.trim();
            if (!paragraph) {
                lines.push({ text: "", spacing: 0.7 });
                continue;
            }
            const words = paragraph.split(/\s+/);
            let line = "";
            for (const word of words) {
                const candidate = line ? `${line} ${word}` : word;
                if (line && ctx.measureText(candidate).width > maxWidth) {
                    lines.push({ text: line, spacing: 1 });
                    line = word;
                } else {
                    line = candidate;
                }
            }
            if (line) lines.push({ text: line, spacing: 1 });
        }
        return lines;
    }

    fitWrappedText(text, maxWidth, maxHeight, options = {}) {
        const maxFontSize = Math.max(1, Number(options.maxFontSize) || 16);
        const minFontSize = Math.min(maxFontSize, Math.max(1, Number(options.minFontSize) || 9));
        const lineHeightRatio = Math.max(1, Number(options.lineHeightRatio) || 1.3);
        const font = String(options.font || "Georgia, 'Times New Roman', serif");
        const weight = Number(options.weight) || 600;
        let fontSize = maxFontSize;
        let lines = [];
        let lineHeight = fontSize * lineHeightRatio;
        let contentHeight = 0;
        while (true) {
            this.ctx.font = `${weight} ${fontSize}px ${font}`;
            lines = this.wrapTextLines(text, maxWidth);
            lineHeight = fontSize * lineHeightRatio;
            contentHeight = this.wrappedLinesHeight(lines, lineHeight);
            if (contentHeight <= maxHeight + 0.5 || fontSize <= minFontSize + 0.01) {
                break;
            }
            fontSize = Math.max(minFontSize, fontSize - Math.max(0.35, maxFontSize * 0.035));
        }
        return { lines, lineHeight, contentHeight, fontSize };
    }

    wrappedLinesHeight(lines, lineHeight) {
        return lines.reduce((height, line) => height + lineHeight * (Number(line.spacing) || 1), 0);
    }

    drawWrappedLines(lines, x, y, maxWidth, lineHeight, centered = false) {
        const ctx = this.ctx;
        let cursorY = y;
        for (const line of lines) {
            if (line.text) {
                ctx.fillText(line.text, centered ? x + maxWidth * 0.5 : x, cursorY, maxWidth);
            }
            cursorY += lineHeight * (Number(line.spacing) || 1);
        }
        return cursorY;
    }

    drawWrappedText(text, x, y, maxWidth, lineHeight, maxLines = Infinity, centered = false) {
        const ctx = this.ctx;
        const paragraphs = String(text || "").split(/\n/);
        let lineCount = 0;
        let cursorY = y;
        for (let paragraphIndex = 0; paragraphIndex < paragraphs.length && lineCount < maxLines; paragraphIndex += 1) {
            const paragraph = paragraphs[paragraphIndex].trim();
            if (!paragraph) {
                cursorY += lineHeight * 0.7;
                lineCount += 1;
                continue;
            }
            const words = paragraph.split(/\s+/);
            let line = "";
            for (const word of words) {
                const candidate = line ? `${line} ${word}` : word;
                if (line && ctx.measureText(candidate).width > maxWidth) {
                    ctx.fillText(line, centered ? x + maxWidth * 0.5 : x, cursorY, maxWidth);
                    cursorY += lineHeight;
                    lineCount += 1;
                    if (lineCount >= maxLines) return cursorY;
                    line = word;
                } else {
                    line = candidate;
                }
            }
            if (line && lineCount < maxLines) {
                ctx.fillText(line, centered ? x + maxWidth * 0.5 : x, cursorY, maxWidth);
                cursorY += lineHeight;
                lineCount += 1;
            }
        }
        return cursorY;
    }

    drawPlayerDeathCover(state, view) {
        if (state.player?.deathPhase !== "cover") {
            return;
        }
        const sparks = (state.effects?.smokePuffs || []).filter((puff) => puff.kind === "wizardDeathCoverSpark");
        if (!sparks.length) {
            return;
        }

        const ctx = this.ctx;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        for (const spark of sparks) {
            const delay = Math.max(0, Number(spark.delay) || 0);
            if ((Number(spark.age) || 0) < delay) {
                continue;
            }
            const localAge = Math.max(0, (Number(spark.age) || 0) - delay);
            const ramp = clamp(localAge / 0.075, 0, 1);
            const twinkle = 0.7 + 0.3 * Math.sin(localAge * 36 + (Number(spark.sparkleSeed) || 0) * 0.17);
            const alpha = ramp * twinkle;
            const radiusWorld = Math.max(1, Number(spark.radius) || 1) * 2.1;
            if (!this.dynamicBoundsVisible({
                minX: spark.x - radiusWorld,
                minY: spark.y - radiusWorld,
                maxX: spark.x + radiusWorld,
                maxY: spark.y + radiusWorld
            }, view, 48)) {
                continue;
            }

            const point = this.worldToScreen(view, spark.x, spark.y);
            const radius = Math.max(1, Number(spark.radius) || 1) * view.zoom;
            const paletteIndex = (Number(spark.colorIndex) || 0) % 3;
            const color = paletteIndex === 0
                ? `rgba(168, 78, 255, ${0.96 * alpha})`
                : paletteIndex === 1
                    ? `rgba(255, 222, 70, ${0.98 * alpha})`
                    : `rgba(255, 255, 250, ${alpha})`;

            ctx.save();
            ctx.translate(point.x, point.y);
            ctx.rotate(Number(spark.rotation) || 0);
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = Math.max(1, radius * 0.42);
            ctx.beginPath();
            ctx.moveTo(-radius * 1.55, 0);
            ctx.lineTo(radius * 1.55, 0);
            ctx.moveTo(0, -radius * 1.55);
            ctx.lineTo(0, radius * 1.55);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.68, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 0.34 * alpha;
            ctx.beginPath();
            ctx.arc(0, 0, radius * 2.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            this.markDynamicDrawn();
        }
        ctx.restore();
    }

    drawPlayerWebGL(state, view) {
        if (state.player.visible === false || !this.webglBackend?.available) {
            this.lastBounds = null;
            this.framePlayerRocketTransform = null;
            return false;
        }
        const groundPoint = actorGroundPoint(state.player);
        const point = this.worldToScreen(view, groundPoint.x, groundPoint.y);
        const renderScale = Math.max(0.05, Number(state.player.renderScale) || 1);
        this.queueShadowWebGL(
            point.x,
            point.y,
            view.zoom,
            renderScale,
            this.groundShadowOpacity(state.player)
        );
        const targetPose = this.computeRigPose(state, view.zoom);
        const pose = this.blendRigPose(targetPose, state, view.zoom);
        const renderedTransforms = scalePoseTransforms(pose.transforms, renderScale);
        const shieldTint = getPlayerShieldTintAlpha(state);
        const lowHealthTint = shieldTint > 0 ? 0 : getLowHealthTintAlpha(state);
        const hitFlash = getPlayerHitFlash(state);
        const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
        this.queueCharacterProjectPoseWebGL(
            this.playerProject,
            point.x,
            point.y,
            state.player.facing,
            renderedTransforms,
            bounds,
            {
                alpha: 1,
                tintAlpha: shieldTint > 0 ? shieldTint : lowHealthTint,
                tintCanvasKey: shieldTint > 0 ? "shieldCanvas" : "lowHealthCanvas",
                overlayTintAlpha: hitFlash * 0.72,
                overlayTintCanvasKey: "hitFlashCanvas",
                afterPart: (partName, command) => {
                    if (partName === "rocket") {
                        this.framePlayerRocketTransform = {
                            transform: command?.transform ? { ...command.transform } : null,
                            screenX: point.x,
                            screenY: point.y,
                            facing: state.player.facing
                        };
                    }
                }
            }
        );
        this.lastBounds = Number.isFinite(bounds.minX) ? bounds : null;
        return true;
    }

    drawPlayerFuelBulbWebGL(state, view) {
        if (state.tuning.rocketFuelBulbEnabled === false || state.player.visible === false) return false;
        const mounted = this.framePlayerRocketTransform;
        const transform = mounted?.transform;
        const backend = this.webglBackend;
        const asset = this.assets.get("rocket");
        if (!backend?.available || !transform || !asset || asset.missing) return false;

        const pivot = this.rigConfig.pivots.rocket;
        const spriteScale = transform.targetHeight / Math.max(1, asset.height);
        const bulbX = (0.46 - pivot.x) * asset.width * spriteScale;
        const bulbY = (0.47 - pivot.y) * asset.height * spriteScale;
        const rotated = rotatePoint(bulbX, bulbY, transform.angle);
        const facing = Number(mounted.facing) < 0 ? -1 : 1;
        const centerX = mounted.screenX + facing * (transform.x + rotated.x);
        const centerY = mounted.screenY + transform.y + rotated.y;

        const fuel = state.fuel || { amount: 0, max: 100, rechargeDelayTimer: 0, rechargeCap: 100 };
        const tuning = state.tuning || {};
        const rocket = state.equipment?.rocket || {};
        const ratio = clamp(fuel.amount / Math.max(1, fuel.max || 100), 0, 1);
        const percent = ratio * 100;
        const low = tuning.rocketFuelBulbLowThreshold ?? 25;
        const mid = tuning.rocketFuelBulbMediumThreshold ?? 60;
        const scale = tuning.rocketFuelBulbScale ?? 1;
        const radius = Math.max(5, Math.min(asset.width, asset.height) * 0.055 * scale) * spriteScale;
        const overdriveRecovering = Boolean(
            activePowerUpEffect(state, POWER_UP_EFFECT_IDS.OVERDRIVE) && fuel.amount < fuel.max
        );
        const canRechargeNow = tuning.fuelRechargeRequiresGround === false || state.player.onGround || fuel.rechargeLatched === true;
        const recharging = Boolean(
            tuning.rocketFuelBulbPulseWhenRecharging !== false &&
            (overdriveRecovering || (
                !rocket.attachedBoosting &&
                canRechargeNow &&
                (fuel.rechargeDelayTimer ?? 0) <= 0 &&
                fuel.amount < Math.min(fuel.rechargeCap ?? fuel.max, fuel.max)
            ))
        );
        const unavailable = !overdriveRecovering && (
            (tuning.fuelRechargeRequiresGround !== false && !state.player.onGround && fuel.rechargeLatched !== true) ||
            (fuel.rechargeDelayTimer ?? 0) > 0
        );
        const flash = clamp((rocket.fuelBulbFlashTimer ?? 0) / 0.45, 0, 1);
        const pulse = recharging ? 0.5 + 0.5 * Math.sin(state.clock.time * 13.5) : 0;
        const dim = unavailable && !recharging ? 0.62 : 1;

        let fill = [18 / 255, 16 / 255, 20 / 255, 0.88];
        let glow = [0, 0, 0, 0];
        if (percent > 0.5 && percent < low) {
            fill = [220 / 255, 59 / 255, 58 / 255, 0.95];
            glow = [1, 67 / 255, 53 / 255, 0.45];
        } else if (percent >= low && percent < mid) {
            fill = [239 / 255, 198 / 255, 71 / 255, 0.96];
            glow = [1, 217 / 255, 75 / 255, 0.42];
        } else if (percent >= mid) {
            fill = [103 / 255, 218 / 255, 117 / 255, 0.96];
            glow = [100 / 255, 244 / 255, 126 / 255, 0.42];
        }

        const disc = this.getWebGLParticleSpriteCanvas("solidDisc");
        const softGlow = this.getWebGLParticleSpriteCanvas("softGlow");
        const ring = this.getWebGLParticleSpriteCanvas("ring");
        if (!disc) return false;
        if (percent > 0.5 && softGlow) {
            const glowRadius = radius * (2.2 + pulse * 0.75 + flash * 1.8);
            backend.queueSprite({
                source: softGlow,
                centerX,
                centerY,
                width: glowRadius * 2,
                height: glowRadius * 2,
                tint: glow,
                alpha: dim * (0.55 + pulse * 0.35 + flash * 0.42),
                blendMode: "additive"
            });
        }
        backend.queueSprite({
            source: disc,
            centerX,
            centerY,
            width: radius * 2.56,
            height: radius * 2.56,
            tint: [5 / 255, 4 / 255, 7 / 255, 0.92],
            alpha: 0.82
        });
        backend.queueSprite({
            source: disc,
            centerX,
            centerY,
            width: radius * 2,
            height: radius * 2,
            tint: fill,
            alpha: dim
        });
        if (fuel.amount > 0 && fuel.amount < fuel.max) {
            const emptyRatio = 1 - ratio;
            backend.queueSprite({
                source: disc,
                sourceX: 0,
                sourceY: 0,
                sourceWidth: disc.width,
                sourceHeight: Math.max(1, disc.height * emptyRatio),
                centerX,
                centerY: centerY - radius + radius * emptyRatio,
                width: radius * 2,
                height: radius * 2 * emptyRatio,
                tint: [0, 0, 0, 0.92],
                alpha: 0.28
            });
        }
        if (ring) {
            backend.queueSprite({
                source: ring,
                centerX,
                centerY,
                width: radius * 3.12 * (1 + flash * 0.22),
                height: radius * 3.12 * (1 + flash * 0.22),
                tint: flash > 0.01
                    ? [1, 1, 210 / 255, 0.98]
                    : unavailable
                        ? [1, 1, 1, 0.32]
                        : [1, 1, 1, 0.66],
                alpha: 0.88
            });
        }
        backend.queueSprite({
            source: disc,
            centerX: centerX - radius * 0.28,
            centerY: centerY - radius * 0.32,
            width: radius * 0.46,
            height: radius * 0.46,
            tint: [1, 1, 1, 0.82],
            alpha: 0.70
        });
        return true;
    }

    drawPlayerCanvasOverlays(state, view) {
        const mounted = this.framePlayerRocketTransform;
        if (!mounted?.transform || state.player.visible === false) return;
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(mounted.screenX, mounted.screenY);
        ctx.scale(Number(mounted.facing) < 0 ? -1 : 1, 1);
        this.drawMountedRocketFuelBulb(mounted.transform, state, view.zoom);
        ctx.restore();
    }

    drawPlayer(state, view) {
        if (state.player.visible === false) {
            this.lastBounds = null;
            return;
        }
        const groundPoint = actorGroundPoint(state.player);
        const p = this.worldToScreen(view, groundPoint.x, groundPoint.y);
        const renderScale = Math.max(0.05, Number(state.player.renderScale) || 1);
        this.drawShadow(
            p.x,
            p.y,
            view.zoom * renderScale,
            this.groundShadowOpacity(state.player)
        );
        const hitFlash = getPlayerHitFlash(state);
        const bounds = this.drawWizardRig(p.x, p.y, state.player.facing, state, view.zoom, renderScale, {
            overlayTintAlpha: hitFlash * 0.72,
            overlayTintCanvasKey: "hitFlashCanvas"
        });
        this.lastBounds = bounds;
    }

    drawShadow(x, groundY, zoom, opacity = 1) {
        const shadowAlpha = clamp(Number(opacity) || 0, 0, 1);
        if (shadowAlpha <= 0) return;
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, groundY + 4 * zoom);
        ctx.globalAlpha *= 0.26 * shadowAlpha;
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.ellipse(0, 0, 46 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawWizardRig(screenX, screenGroundY, facing, state, zoom, renderScale = 1, options = {}) {
        const targetPose = this.computeRigPose(state, zoom);
        const pose = this.blendRigPose(targetPose, state, zoom);
        const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

        this.drawRigPose(screenX, screenGroundY, facing, pose, state, zoom, bounds, {
            alpha: 1,
            drawFuelBulb: true,
            renderScale,
            ...options
        });

        return bounds;
    }

    drawRigPose(screenX, screenGroundY, facing, pose, state, zoom, bounds, options = {}) {
        const shieldTint = Number(options.alpha ?? 1) >= 0.99 ? getPlayerShieldTintAlpha(state) : 0;
        const lowHealthTint = shieldTint > 0 || Number(options.alpha ?? 1) < 0.99 ? 0 : getLowHealthTintAlpha(state);
        const renderedTransforms = scalePoseTransforms(pose.transforms, options.renderScale);
        this.drawCharacterProjectPose(this.playerProject, screenX, screenGroundY, facing, renderedTransforms, bounds, {
            ...options,
            tintAlpha: shieldTint > 0 ? shieldTint : lowHealthTint,
            tintCanvasKey: shieldTint > 0 ? "shieldCanvas" : "lowHealthCanvas",
            afterPart: (partName, command) => {
                if (partName === "rocket" && options.drawFuelBulb !== false) {
                    // Phase 1.011: attached boost exhaust is represented by world-managed smoke/spark puffs,
                    // not by a local flame sprite. The flying projectile still keeps its short nozzle flame.
                    // Use the exact transformed rocket command so the local bulb inherits doorway scale,
                    // position, rotation, and facing together with the sprite it is mounted on.
                    this.drawMountedRocketFuelBulb(command?.transform ?? renderedTransforms[partName], state, zoom);
                }
            }
        });
    }

    drawCharacterProjectPose(project, screenX, screenGroundY, facing, renderedTransforms, bounds, options = {}) {
        const ctx = this.ctx;
        const alpha = Number.isFinite(Number(options.alpha)) ? Number(options.alpha) : 1;
        const tintAlpha = clamp(Number(options.tintAlpha) || 0, 0, 1);
        const overlayTintAlpha = clamp(Number(options.overlayTintAlpha) || 0, 0, 1);
        const commands = buildRuntimeCharacterDrawCommands(project, renderedTransforms);
        ctx.save();
        ctx.globalAlpha *= alpha;
        ctx.translate(screenX, screenGroundY);
        ctx.scale(facing, 1);
        for (const command of commands) {
            const partTint = command.partName === "rocket" && options.tintCanvasKey !== "shieldCanvas" ? 0 : tintAlpha;
            const spriteBounds = this.drawCharacterCommand(project, command, partTint, options.tintCanvasKey, {
                overlayTintAlpha,
                overlayTintCanvasKey: options.overlayTintCanvasKey
            });
            mergeBounds(bounds, spriteBounds, screenX, screenGroundY, facing);
            options.afterPart?.(command.partName, command);
        }
        ctx.restore();
        return commands;
    }

    drawCharacterCommand(project, command, tintAlpha = 0, tintCanvasKey = "lowHealthCanvas", options = {}) {
        const { asset, transform, pivot, spriteScale, drawX, drawY, partName } = command;
        if (!asset || asset.missing || !transform) {
            return null;
        }
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha *= transform.alpha;
        ctx.translate(transform.x, transform.y);
        ctx.rotate(transform.angle);
        ctx.scale(spriteScale, spriteScale);
        drawRuntimePixmap(ctx, asset, drawX, drawY);
        const tintCanvas = asset[tintCanvasKey] || asset.lowHealthCanvas;
        if (tintAlpha > 0 && tintCanvas) {
            const baseAlpha = ctx.globalAlpha;
            ctx.globalAlpha = baseAlpha * tintAlpha;
            drawRuntimePixmap(ctx, tintCanvas, drawX, drawY);
            ctx.globalAlpha = baseAlpha;
        }
        const overlayTintAlpha = clamp(Number(options.overlayTintAlpha) || 0, 0, 1);
        const overlayTintCanvas = asset[options.overlayTintCanvasKey];
        if (overlayTintAlpha > 0 && overlayTintCanvas) {
            const baseAlpha = ctx.globalAlpha;
            const baseComposite = ctx.globalCompositeOperation;
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = baseAlpha * overlayTintAlpha;
            drawRuntimePixmap(ctx, overlayTintCanvas, drawX, drawY);
            ctx.globalAlpha = baseAlpha;
            ctx.globalCompositeOperation = baseComposite;
        }
        if (project.rig.global.debugPivots) {
            ctx.globalAlpha = 1;
            ctx.strokeStyle = "rgba(255, 237, 120, 0.72)";
            ctx.lineWidth = 1 / Math.max(0.001, Math.abs(spriteScale));
            ctx.strokeRect(drawX, drawY, asset.width, asset.height);
        }
        ctx.restore();
        return transformedSpriteBounds(asset, pivot, transform, spriteScale);
    }

    computeRigPose(state, zoom = 1) {
        const runClip = this.animations.get("run");
        if (state.player.onGround) {
            if (!runClip) {
                throw new Error("Character is missing its required run animation clip.");
            }
            const dataResult = this.computeDataDrivenGroundPose(state, zoom, runClip);
            this.lastAnimationDiagnostics = {
                mode: "data",
                clipId: runClip.animationId,
                available: true
            };
            return dataResult.pose;
        }

        const airbornePose = this.computeAirborneRigPose(state, zoom);
        this.lastAnimationDiagnostics = {
            mode: airbornePose.poseMode,
            clipId: null,
            available: true
        };
        return airbornePose;
    }

    computeDataDrivenGroundPose(state, zoom, clip) {
        const speedRatio = Math.min(1.25, Math.abs(state.player.vx) / Math.max(1, state.tuning.maxRunSpeed));
        const motionAmount = smoothstep(0.05, 0.24, speedRatio);
        const time = animationTimeFromPhase(this.phase, clip.duration);
        const sampledPose = sampleAnimationClip(clip, time);
        const localPose = blendAnimationPoses(clip.referencePose, sampledPose, motionAmount);
        return {
            localPose,
            pose: {
                poseMode: "ground",
                transforms: animationPoseToRuntimeTransforms(localPose, this.rigConfig, zoom)
            }
        };
    }

    computeAirborneRigPose(state, zoom = 1) {
        const cfg = this.rigConfig;
        const scale = cfg.global.scale * zoom;
        const anchors = cfg.anchors;
        const rocket = state.equipment.rocket;
        const kickWindow = Math.max(0.16, Math.min(0.34, (state.tuning.attachedBoostBurstDuration ?? 0.5) * 0.55));
        const boostKickPose = rocket.attachedBoosting && rocket.attachedBoostTime <= kickWindow;
        const poseMode = rocket.attachedBoosting && !boostKickPose ? "hover" : "jump";
        let torsoAngle;
        if (poseMode === "hover") {
            torsoAngle = 0.015 + Math.sin(state.clock.time * 5.5) * 0.012;
        } else {
            const riseLean = state.player.vy < 0 ? 0.08 : 0.045;
            torsoAngle = boostKickPose ? 0.12 : riseLean;
        }
        const headAngle = torsoAngle * cfg.animation.headLeanMultiplier;
        const root = {
            x: 0,
            y: cfg.global.rootYOffsetFromGround * scale
        };
        const shoulderCenter = add(root, scaledRotatedAnchor(anchors.shoulderCenter, scale, torsoAngle));
        const leftShoulder = add(shoulderCenter, scaledRotatedAnchor(anchors.leftShoulder, scale, torsoAngle));
        const rightShoulder = add(shoulderCenter, scaledRotatedAnchor(anchors.rightShoulder, scale, torsoAngle));
        const neck = add(root, scaledRotatedAnchor(anchors.neck, scale, torsoAngle));
        const rocketMount = add(root, scaledRotatedAnchor(anchors.rocketMount, scale, torsoAngle));
        const hatBase = add(neck, scaledRotatedAnchor(anchors.hatFromHead, scale, headAngle));
        const rocketBob = rocket.attachedBoosting ? Math.sin(state.clock.time * 38) * 2.8 * scale : 0;
        const rocketBobPoint = { x: rocketMount.x, y: rocketMount.y + rocketBob };

        return {
            poseMode,
            transforms: {
                leftArm: this.makeAirborneArmTransform("left", leftShoulder, scale, torsoAngle, poseMode),
                leftFoot: this.makeAirborneLegTransform("left", root, scale, poseMode, state),
                rocket: this.makeRigidTransform("rocket", rocketBobPoint, torsoAngle, scale),
                rightFoot: this.makeAirborneLegTransform("right", root, scale, poseMode, state),
                robe: this.makeRigidTransform("robe", root, torsoAngle, scale),
                head: this.makeRigidTransform("head", neck, headAngle, scale),
                hat: this.makeRigidTransform("hat", hatBase, headAngle, scale),
                rightArm: this.makeAirborneArmTransform("right", rightShoulder, scale, torsoAngle, poseMode)
            }
        };
    }

    blendRigPose(targetPose, state, zoom) {
        const speed = Number(state.tuning.poseBlendSpeed ?? 14);
        if (!Number.isFinite(speed) || speed <= 0 || !this.visualPose) {
            this.visualPose = clonePose(targetPose);
            this.lastVisualPoseMode = targetPose.poseMode;
            return targetPose;
        }

        const alpha = 1 - Math.exp(-speed * this.lastRenderDt);
        const blended = {
            poseMode: targetPose.poseMode,
            transforms: {}
        };

        for (const name of FIXED_DRAW_ORDER) {
            const from = this.visualPose.transforms[name];
            const to = targetPose.transforms[name];
            blended.transforms[name] = from ? lerpTransform(from, to, alpha) : { ...to };
        }

        this.visualPose = clonePose(blended);
        this.lastVisualPoseMode = targetPose.poseMode;
        return blended;
    }

    getAnimationDiagnostics() {
        return this.lastAnimationDiagnostics ? { ...this.lastAnimationDiagnostics } : null;
    }

    makeAirborneLegTransform(side, root, scale, poseMode, state) {
        const name = side === "left" ? "leftFoot" : "rightFoot";
        const part = this.rigConfig.parts[name];
        const motion = this.rigConfig.legMotion;
        const baseX = side === "left" ? motion.leftBaseX : motion.rightBaseX;
        const falling = state.player.vy > 120;
        const kick = state.equipment.rocket.attachedBoosting && state.equipment.rocket.attachedBoostTime < 0.24;
        let poseX = baseX;
        let poseY = motion.groundRise;
        let angle = part.rotation.base;

        if (poseMode === "hover") {
            poseX += side === "left" ? -4 : 4;
            poseY += 2;
            angle += side === "left" ? -0.025 : 0.025;
        } else {
            const apart = kick ? 1.18 : 1.0;
            if (side === "left") {
                poseX -= 24 * apart;
                poseY += falling ? -14 : -2;
                angle -= 0.18;
            } else {
                poseX += 32 * apart;
                poseY += falling ? -4 : -22;
                angle += 0.21;
            }
        }

        const point = applyPartOffset({
            x: root.x + poseX * scale,
            y: poseY * scale
        }, part, scale);
        return {
            x: point.x,
            y: point.y,
            angle,
            targetHeight: part.targetHeight * scale * part.scale,
            alpha: part.alpha
        };
    }

    makeAirborneArmTransform(side, shoulder, scale, torsoAngle, poseMode) {
        const name = side === "left" ? "leftArm" : "rightArm";
        const part = this.rigConfig.parts[name];
        const point = applyPartOffset(shoulder, part, scale);
        const passive = poseMode === "hover";
        const spread = passive ? 0 : (side === "left" ? -0.08 : 0.08);
        return {
            x: point.x,
            y: point.y,
            angle: torsoAngle * (part.rotation.torso ?? 1) + part.rotation.base + spread,
            targetHeight: part.targetHeight * scale * part.scale,
            alpha: part.alpha
        };
    }

    drawMountedRocketFlame(transform, state, zoom) {
        const asset = this.assets.get("rocket");
        if (!asset || asset.missing || !transform) {
            return;
        }
        const ctx = this.ctx;
        const pivot = this.rigConfig.pivots.rocket;
        const spriteScale = transform.targetHeight / Math.max(1, asset.height);
        const power = clamp(state.equipment.rocket.boostVisualPowerNow ?? 0.45, 0.2, 1.2);
        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.rotate(transform.angle);
        ctx.scale(spriteScale, spriteScale);
        drawRocketFlameLocal(ctx, asset, pivot, state.clock.time * 1.7, power, 41);
        ctx.restore();
    }

    drawMountedRocketFuelBulb(transform, state, zoom) {
        if (state.tuning.rocketFuelBulbEnabled === false) {
            return;
        }
        const asset = this.assets.get("rocket");
        if (!asset || asset.missing || !transform) {
            return;
        }
        const ctx = this.ctx;
        const pivot = this.rigConfig.pivots.rocket;
        const spriteScale = transform.targetHeight / Math.max(1, asset.height);
        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.rotate(transform.angle);
        ctx.scale(spriteScale, spriteScale);
        drawRocketFuelBulbLocal(ctx, asset, pivot, state, state.clock.time);
        ctx.restore();
    }

    makeRigidTransform(name, point, baseAngle, scale) {
        const part = this.rigConfig.parts[name];
        const rotation = part.rotation || {};
        const p = applyPartOffset(point, part, scale);
        return {
            x: p.x,
            y: p.y,
            angle: baseAngle * (rotation.torso ?? 1) + (rotation.base ?? 0),
            targetHeight: part.targetHeight * scale * part.scale,
            alpha: part.alpha
        };
    }


    drawDebug(state, view, inputFrame) {
        const ctx = this.ctx;
        if (state.debug.showCollision) {
            ctx.save();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.lineWidth = 1 * view.zoom;
            for (const solid of state.world.solids || []) {
                const p = this.worldToScreen(view, solid.x, solid.y);
                ctx.strokeRect(p.x, p.y, solid.w * view.zoom, solid.h * view.zoom);
            }
            for (const segment of state.world.segments || []) {
                const a = this.worldToScreen(view, segment.x1, segment.y1);
                const b = this.worldToScreen(view, segment.x2, segment.y2);
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
            ctx.restore();
        }

        if (state.debug.showHitboxes) {
            const rect = {
                x: state.player.x - state.player.width / 2,
                y: state.player.y - state.player.height,
                w: state.player.width,
                h: state.player.height
            };
            const p = this.worldToScreen(view, rect.x, rect.y);
            ctx.save();
            ctx.strokeStyle = "rgba(127, 232, 255, 0.82)";
            ctx.lineWidth = 2 * view.zoom;
            ctx.strokeRect(p.x, p.y, rect.w * view.zoom, rect.h * view.zoom);
            ctx.restore();
        }

        if (state.debug.showHitboxes) {
            ctx.save();
            ctx.strokeStyle = "rgba(255, 220, 110, 0.68)";
            ctx.lineWidth = 1.5 * view.zoom;
            for (const projectile of state.projectiles || []) {
                if (projectile.state !== "launched") continue;
                const p = this.worldToScreen(view, projectile.x, projectile.y);
                ctx.beginPath();
                ctx.arc(p.x, p.y, projectile.radius * view.zoom, 0, Math.PI * 2);
                ctx.stroke();
            }
            for (const target of state.targets || []) {
                const p = this.worldToScreen(view, target.x, target.y);
                ctx.beginPath();
                ctx.arc(p.x, p.y, target.radius * view.zoom, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }

        if (state.debug.showVelocity) {
            const start = this.worldToScreen(view, state.player.x, state.player.y - state.player.height * 0.5);
            ctx.save();
            ctx.strokeStyle = "rgba(255, 223, 116, 0.92)";
            ctx.lineWidth = 2 * view.zoom;
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(start.x + state.player.vx * 0.16 * view.zoom, start.y + state.player.vy * 0.16 * view.zoom);
            ctx.stroke();
            ctx.restore();
        }
    }

    drawVignette() {
        // Disabled for the cave theme. A flat deep blue-black background avoids
        // radial-gradient banding and leaves room for future explicit cave silhouettes.
    }

    getRigMetrics(state) {
        const partMetrics = {};
        const scale = this.rigConfig.global.scale;
        for (const name of FIXED_DRAW_ORDER) {
            const part = this.rigConfig.parts[name];
            partMetrics[name] = {
                targetHeight: part.targetHeight,
                partScale: part.scale,
                renderedHeightAtCanvasScale1: part.targetHeight * scale * part.scale,
                pivot: this.rigConfig.pivots[name]
            };
        }
        return {
            globalScale: scale,
            drawOrder: FIXED_DRAW_ORDER.slice(),
            parts: partMetrics,
            lastBounds: this.lastBounds,
            renderer: "Generic atlas-rig draw-command renderer; Ignatius retains temporary wizard-specific airborne pose selection."
        };
    }
}

function normalizeRigConfig(rawConfig) {
    const config = rawConfig || {};
    for (const section of REQUIRED_RIG_SECTIONS) {
        if (!config[section]) {
            throw new Error(`Character rig is missing required section "${section}".`);
        }
    }
    config.drawOrder = FIXED_DRAW_ORDER.slice();
    for (const name of FIXED_DRAW_ORDER) {
        if (!config.parts[name]) {
            throw new Error(`Character rig is missing required part "${name}".`);
        }
        if (!config.pivots[name]) {
            throw new Error(`Character rig is missing required pivot "${name}".`);
        }
        config.parts[name].frame = config.parts[name].frame || name;
        config.parts[name].offset = config.parts[name].offset || { x: 0, y: 0 };
        config.parts[name].rotation = config.parts[name].rotation || {};
        config.parts[name].scale = Number.isFinite(Number(config.parts[name].scale)) ? Number(config.parts[name].scale) : 1;
        config.parts[name].alpha = Number.isFinite(Number(config.parts[name].alpha)) ? Number(config.parts[name].alpha) : 1;
    }
    return config;
}

function makeTintedSpriteCanvas(sourceCanvas, color) {
    const canvas = document.createElement("canvas");
    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(sourceCanvas, 0, 0);
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
}

function getPlayerHitFlash(state) {
    const rawLastDamagedAt = state?.health?.lastDamagedAt;
    const lastDamagedAt = Number(rawLastDamagedAt);
    const duration = Math.max(0.001, Number(state?.tuning?.playerHitFlashSeconds) || 0.24);
    if (rawLastDamagedAt === null || rawLastDamagedAt === undefined || !Number.isFinite(lastDamagedAt)) {
        return 0;
    }
    const age = Math.max(0, Number(state?.clock?.time) - lastDamagedAt);
    if (age >= duration) {
        return 0;
    }
    const envelope = 1 - age / duration;
    const flicker = Math.sin(age * 92) > -0.15 ? 1 : 0.28;
    return clamp(envelope * flicker, 0, 1);
}

function getPlayerShieldTintAlpha(state) {
    if (!activePowerUpEffect(state, POWER_UP_EFFECT_IDS.SHIELD)) {
        return 0;
    }
    const pulse = 0.5 + 0.5 * Math.sin((Number(state?.clock?.time) || 0) * 22);
    return 0.22 + pulse * 0.58;
}

function getLowHealthTintAlpha(state) {
    if (!state || !state.health || !state.health.low) {
        return 0;
    }
    const pulse = clamp(Number(state.player?.lowHealthPulse) || 0, 0, 1);
    return 0.18 + pulse * 0.34;
}

async function loadEnvironmentAtlases(options = {}) {
    const candidates = Array.isArray(options.candidates)
        ? options.candidates
        : ENVIRONMENT_ATLAS_MANIFEST_CANDIDATES;
    const onProgress = typeof options.onProgress === "function" ? options.onProgress : () => {};
    const records = await Promise.all(candidates.map(async (candidate) => {
        const url = String(candidate.url || "");
        onProgress({ url, progress: 0.02, label: `Loading atlas manifest ${url}` });
        let manifest = null;
        try {
            const response = await fetch(url, { cache: "no-store" });
            if (!response.ok) {
                onProgress({ url, progress: 1, label: `Skipped unavailable atlas ${url}` });
                return null;
            }
            manifest = await response.json();
        } catch (error) {
            onProgress({ url, progress: 1, label: `Skipped unavailable atlas ${url}` });
            return null;
        }

        manifest = normalizeEnvironmentManifest(manifest, candidate.forceAtlasId, candidate.forceImage);
        if (!manifest || !manifest.atlasId || !manifest.image) {
            onProgress({ url, progress: 1, label: `Skipped invalid atlas ${url}` });
            return null;
        }
        onProgress({ url, progress: 0.35, label: `Loaded atlas manifest ${manifest.atlasId}` });

        const imageUrl = resolveRelativeUrl(url, manifest.image);
        let image = null;
        try {
            image = await loadImage(imageUrl);
        } catch (error) {
            onProgress({ url, progress: 1, label: `Skipped missing atlas image ${manifest.image}` });
            return null;
        }
        onProgress({ url, progress: 1, label: `Decoded atlas ${manifest.atlasId}` });
        return {
            id: manifest.atlasId,
            image,
            renderImage: image,
            colorMapCacheKey: "",
            frames: manifest.frames || {},
            source: imageUrl,
            manifestUrl: url,
            manifest,
            missing: false
        };
    }));

    const atlases = new Map();
    for (const atlas of records) {
        if (atlas && !atlases.has(atlas.id)) {
            atlases.set(atlas.id, atlas);
        }
    }
    return atlases;
}

function normalizeEnvironmentManifest(manifest, forcedAtlasId, forcedImage) {
    const normalized = JSON.parse(JSON.stringify(manifest || {}));
    if (forcedAtlasId) {
        normalized.atlasId = forcedAtlasId;
    }
    if (forcedImage) {
        normalized.image = forcedImage;
    }
    return normalized;
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = async () => {
            try {
                if (typeof img.decode === "function") {
                    await img.decode();
                }
            } catch (error) {
                // The onload event already guarantees a drawable image.
            }
            resolve(img);
        };
        img.onerror = () => reject(new Error(`Could not load ${url}`));
        img.src = url;
    });
}

async function loadJsonStrict(url, label) {
    let response;
    try {
        response = await fetch(url, { cache: "no-store" });
    } catch (error) {
        throw new Error(`Could not load ${label} from ${url}. Use a local web server and make sure the file exists. ${error.message}`);
    }
    if (!response.ok) {
        throw new Error(`Could not load ${label} from ${url}: HTTP ${response.status}.`);
    }
    return await response.json();
}

function pathDirectory(url) {
    const text = String(url || "");
    const slash = text.lastIndexOf("/");
    return slash >= 0 ? text.slice(0, slash + 1) : "";
}

function resolveRelativeUrl(baseUrl, relativeUrl) {
    const text = String(relativeUrl || "");
    if (/^(?:[a-z]+:)?\/\//i.test(text) || text.startsWith("/")) {
        return text;
    }
    return pathDirectory(baseUrl) + text;
}

function applyPartOffset(point, part, scale) {
    return {
        x: point.x + (part.offset?.x ?? 0) * scale,
        y: point.y + (part.offset?.y ?? 0) * scale
    };
}

function add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
}

function scaledRotatedAnchor(anchor, scale, angle) {
    return rotatePoint(anchor.x * scale, anchor.y * scale, angle);
}

function rotatePoint(localX, localY, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return {
        x: localX * c - localY * s,
        y: localX * s + localY * c
    };
}



function drawRocketFuelBulbLocal(ctx, asset, pivot, state, time) {
    const fuel = state.fuel || { amount: 0, max: 100, rechargeDelayTimer: 0, rechargeCap: 100 };
    const tuning = state.tuning || {};
    const rocket = state.equipment?.rocket || {};
    const ratio = clamp(fuel.amount / Math.max(1, fuel.max || 100), 0, 1);
    const percent = ratio * 100;
    const low = tuning.rocketFuelBulbLowThreshold ?? 25;
    const mid = tuning.rocketFuelBulbMediumThreshold ?? 60;
    const scale = tuning.rocketFuelBulbScale ?? 1;
    const bulbX = (0.46 - pivot.x) * asset.width;
    const bulbY = (0.47 - pivot.y) * asset.height;
    const radius = Math.max(5, Math.min(asset.width, asset.height) * 0.055 * scale);
    const overdriveRecovering = Boolean(
        activePowerUpEffect(state, POWER_UP_EFFECT_IDS.OVERDRIVE) &&
        fuel.amount < fuel.max
    );
    const canRechargeNow = tuning.fuelRechargeRequiresGround === false || state.player.onGround || fuel.rechargeLatched === true;
    const recharging = Boolean(
        tuning.rocketFuelBulbPulseWhenRecharging !== false &&
        (
            overdriveRecovering ||
            (
                !rocket.attachedBoosting &&
                canRechargeNow &&
                (fuel.rechargeDelayTimer ?? 0) <= 0 &&
                fuel.amount < Math.min(fuel.rechargeCap ?? fuel.max, fuel.max)
            )
        )
    );
    const unavailable = !overdriveRecovering && (
        (tuning.fuelRechargeRequiresGround !== false && !state.player.onGround && fuel.rechargeLatched !== true) ||
        (fuel.rechargeDelayTimer ?? 0) > 0
    );
    const flash = clamp((rocket.fuelBulbFlashTimer ?? 0) / 0.45, 0, 1);
    const pulse = recharging ? 0.5 + 0.5 * Math.sin(time * 13.5) : 0;

    let fill = "rgba(18, 16, 20, 0.88)";
    let glow = "rgba(0, 0, 0, 0)";
    if (percent > 0.5 && percent < low) {
        fill = "rgba(220, 59, 58, 0.95)";
        glow = "rgba(255, 67, 53, 0.45)";
    } else if (percent >= low && percent < mid) {
        fill = "rgba(239, 198, 71, 0.96)";
        glow = "rgba(255, 217, 75, 0.42)";
    } else if (percent >= mid) {
        fill = "rgba(103, 218, 117, 0.96)";
        glow = "rgba(100, 244, 126, 0.42)";
    }

    const dim = unavailable && !recharging ? 0.62 : 1;
    const glowRadius = radius * (2.2 + pulse * 0.75 + flash * 1.8);

    ctx.save();
    ctx.translate(bulbX, bulbY);
    ctx.globalCompositeOperation = "source-over";

    if (percent > 0.5) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const g = ctx.createRadialGradient(0, 0, radius * 0.3, 0, 0, glowRadius);
        g.addColorStop(0, glow);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = dim * (0.55 + pulse * 0.35 + flash * 0.42);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    ctx.globalAlpha = 0.82;
    ctx.fillStyle = "rgba(5, 4, 7, 0.92)";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.28, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = dim;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    if (fuel.amount > 0 && fuel.amount < fuel.max) {
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = "rgba(0, 0, 0, 0.92)";
        ctx.beginPath();
        ctx.rect(-radius, -radius, radius * 2, radius * 2 * (1 - ratio));
        ctx.clip();
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    ctx.globalAlpha = 0.88;
    ctx.strokeStyle = flash > 0.01 ? "rgba(255, 255, 210, 0.98)" : (unavailable ? "rgba(255, 255, 255, 0.32)" : "rgba(255, 255, 255, 0.66)");
    ctx.lineWidth = Math.max(1.25, radius * 0.18);
    ctx.beginPath();
    ctx.arc(0, 0, radius * (1.06 + flash * 0.35), 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.70;
    ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
    ctx.beginPath();
    ctx.arc(-radius * 0.28, -radius * 0.32, radius * 0.23, 0, Math.PI * 2);
    ctx.fill();

    if (percent <= 0.5) {
        ctx.globalAlpha = 0.42 + 0.22 * Math.sin(time * 10);
        ctx.strokeStyle = "rgba(255, 80, 62, 0.76)";
        ctx.lineWidth = Math.max(1, radius * 0.12);
        ctx.beginPath();
        ctx.moveTo(-radius * 0.55, radius * 0.52);
        ctx.lineTo(radius * 0.55, -radius * 0.52);
        ctx.stroke();
    }

    ctx.restore();
}

function drawRocketFlameLocal(ctx, asset, pivot, time, power = 1, seed = 0) {
    const nozzleX = (0.5 - pivot.x) * asset.width;
    const nozzleY = (0.965 - pivot.y) * asset.height;
    const stablePower = clamp(power, 0.15, 1.2);
    const flutter = 0.96 + 0.04 * Math.sin(time * 33 + seed);
    const length = asset.height * 0.75 * stablePower * flutter;
    const width = asset.width * (0.16 + 0.08 * stablePower);

    ctx.save();
    ctx.translate(nozzleX, nozzleY);
    ctx.globalCompositeOperation = "lighter";

    // The rocket artwork points upward in local space, so the nozzle flame is a straight +Y plume.
    // No orbiting particles here: the long path trail is a separate world effect.
    const outer = ctx.createLinearGradient(0, 0, 0, length);
    outer.addColorStop(0, "rgba(255, 244, 149, 0.94)");
    outer.addColorStop(0.24, "rgba(255, 129, 62, 0.78)");
    outer.addColorStop(0.72, "rgba(189, 111, 255, 0.32)");
    outer.addColorStop(1, "rgba(255, 100, 45, 0)");
    ctx.fillStyle = outer;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(-width * 0.52, 0);
    ctx.lineTo(width * 0.52, 0);
    ctx.quadraticCurveTo(width * 0.12, length * 0.42, 0, length);
    ctx.quadraticCurveTo(-width * 0.16, length * 0.42, -width * 0.52, 0);
    ctx.closePath();
    ctx.fill();

    const inner = ctx.createLinearGradient(0, 0, 0, length * 0.64);
    inner.addColorStop(0, "rgba(255, 255, 214, 0.96)");
    inner.addColorStop(0.5, "rgba(255, 227, 91, 0.78)");
    inner.addColorStop(1, "rgba(255, 137, 54, 0)");
    ctx.fillStyle = inner;
    ctx.globalAlpha = 0.82;
    ctx.beginPath();
    ctx.moveTo(-width * 0.22, 0);
    ctx.lineTo(width * 0.22, 0);
    ctx.quadraticCurveTo(width * 0.06, length * 0.28, 0, length * 0.64);
    ctx.quadraticCurveTo(-width * 0.07, length * 0.28, -width * 0.22, 0);
    ctx.closePath();
    ctx.fill();

    const emberCount = Math.floor(4 + stablePower * 7);
    for (let i = 0; i < emberCount; i += 1) {
        const tick = Math.floor(time * 18);
        const down = (0.18 + hashNoise(seed + tick + 17, i) * 0.74) * length;
        const maxLateral = width * 0.18 * (1 - down / Math.max(1, length));
        const lateral = (hashNoise(seed + tick, i) - 0.5) * maxLateral;
        const size = 0.9 + hashNoise(seed + tick + 53, i) * 1.9;
        ctx.globalAlpha = 0.22 + hashNoise(seed + tick + 91, i) * 0.38;
        ctx.fillStyle = i % 3 === 0 ? "rgba(200, 151, 255, 0.82)" : "rgba(255, 240, 132, 0.86)";
        ctx.beginPath();
        ctx.arc(lateral, down, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}


function clonePose(pose) {
    return {
        poseMode: pose.poseMode,
        transforms: Object.fromEntries(
            Object.entries(pose.transforms).map(([name, transform]) => [name, { ...transform }])
        )
    };
}

function scalePoseTransforms(transforms, scale = 1) {
    const safeScale = Math.max(0.05, Number(scale) || 1);
    if (Math.abs(safeScale - 1) < 0.000001) return transforms;
    return Object.fromEntries(Object.entries(transforms).map(([name, transform]) => [name, {
        ...transform,
        x: transform.x * safeScale,
        y: transform.y * safeScale,
        targetHeight: transform.targetHeight * safeScale
    }]));
}

function lerpTransform(from, to, alpha) {
    return {
        x: lerp(from.x, to.x, alpha),
        y: lerp(from.y, to.y, alpha),
        angle: lerpAngle(from.angle, to.angle, alpha),
        targetHeight: lerp(from.targetHeight, to.targetHeight, alpha),
        alpha: lerp(from.alpha, to.alpha, alpha)
    };
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpAngle(a, b, t) {
    let delta = (b - a + Math.PI) % (Math.PI * 2) - Math.PI;
    if (delta < -Math.PI) {
        delta += Math.PI * 2;
    }
    return a + delta * t;
}

function hashNoise(seed, i) {
    const x = Math.sin((seed + 1) * 127.1 + (i + 3) * 311.7) * 43758.5453123;
    return x - Math.floor(x);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0, edge1, value) {
    const t = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}

function transformedSpriteBounds(asset, pivot, transform, spriteScale) {
    const corners = [
        { x: -pivot.x * asset.width, y: -pivot.y * asset.height },
        { x: (1 - pivot.x) * asset.width, y: -pivot.y * asset.height },
        { x: (1 - pivot.x) * asset.width, y: (1 - pivot.y) * asset.height },
        { x: -pivot.x * asset.width, y: (1 - pivot.y) * asset.height }
    ].map((corner) => {
        const scaled = { x: corner.x * spriteScale, y: corner.y * spriteScale };
        const rotated = rotatePoint(scaled.x, scaled.y, transform.angle);
        return { x: rotated.x + transform.x, y: rotated.y + transform.y };
    });

    return {
        minX: Math.min(...corners.map((p) => p.x)),
        minY: Math.min(...corners.map((p) => p.y)),
        maxX: Math.max(...corners.map((p) => p.x)),
        maxY: Math.max(...corners.map((p) => p.y))
    };
}

function mergeBounds(out, local, screenX, screenY, facing) {
    if (!local) {
        return;
    }
    const x1 = screenX + local.minX * facing;
    const x2 = screenX + local.maxX * facing;
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    out.minX = Math.min(out.minX, minX);
    out.minY = Math.min(out.minY, screenY + local.minY);
    out.maxX = Math.max(out.maxX, maxX);
    out.maxY = Math.max(out.maxY, screenY + local.maxY);
}

function roundedRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, Math.abs(w) * 0.5, Math.abs(h) * 0.5);
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
}

function findClosedCollisionLoops(object) {
    if (!object || !Array.isArray(object.nodes) || !Array.isArray(object.lines)) {
        return [];
    }

    const nodeById = new Map(object.nodes.map((node) => [node.id, node]));
    const blockerLines = object.lines.filter((line) => isAreaBlockingLineKind(line.kind) && nodeById.has(line.from) && nodeById.has(line.to));
    const blockerLoops = findClosedLoopsFromLines(blockerLines, nodeById);
    if (blockerLoops.length) {
        return blockerLoops;
    }

    const solidLines = object.lines.filter((line) => isSolidGuideLineKind(line.kind) && nodeById.has(line.from) && nodeById.has(line.to));
    return findClosedLoopsFromLines(solidLines, nodeById).filter((loop) => loop.lines.some((line) => isAreaBlockingLineKind(line.kind)));
}

function isSolidGuideLineKind(kind) {
    return kind === "walkable" || kind === "blockable" || kind === "damaging" || kind === "killable";
}

function isAreaBlockingLineKind(kind) {
    return kind === "blockable" || kind === "damaging" || kind === "killable";
}

function findClosedLoopsFromLines(lines, nodeById) {
    const components = collectLineComponents(lines);
    const loops = [];

    for (const component of components) {
        if (component.length < 3) {
            continue;
        }

        const degree = new Map();
        for (const line of component) {
            degree.set(line.from, (degree.get(line.from) || 0) + 1);
            degree.set(line.to, (degree.get(line.to) || 0) + 1);
        }
        if ([...degree.values()].some((count) => count !== 2)) {
            continue;
        }

        const ordered = orderClosedLineLoop(component, nodeById);
        if (!ordered || ordered.points.length < 3) {
            continue;
        }

        const area = polygonArea(ordered.points);
        if (Math.abs(area) < 4) {
            continue;
        }

        loops.push({
            kind: collisionLoopKind(component),
            points: area < 0 ? ordered.points.slice().reverse() : ordered.points,
            lineIds: component.map((line) => line.id || ""),
            lines: component
        });
    }

    return loops;
}

function collectLineComponents(lines) {
    const byNode = new Map();
    for (const line of lines) {
        if (!byNode.has(line.from)) byNode.set(line.from, []);
        if (!byNode.has(line.to)) byNode.set(line.to, []);
        byNode.get(line.from).push(line);
        byNode.get(line.to).push(line);
    }

    const components = [];
    const seen = new Set();
    for (const line of lines) {
        const lineKey = line.id || `${line.from}->${line.to}`;
        if (seen.has(lineKey)) {
            continue;
        }
        const stack = [line];
        const component = [];
        while (stack.length) {
            const current = stack.pop();
            const key = current.id || `${current.from}->${current.to}`;
            if (seen.has(key)) {
                continue;
            }
            seen.add(key);
            component.push(current);
            for (const nodeId of [current.from, current.to]) {
                for (const next of byNode.get(nodeId) || []) {
                    const nextKey = next.id || `${next.from}->${next.to}`;
                    if (!seen.has(nextKey)) {
                        stack.push(next);
                    }
                }
            }
        }
        components.push(component);
    }
    return components;
}

function orderClosedLineLoop(lines, nodeById) {
    const adjacency = new Map();
    for (const line of lines) {
        if (!adjacency.has(line.from)) adjacency.set(line.from, []);
        if (!adjacency.has(line.to)) adjacency.set(line.to, []);
        adjacency.get(line.from).push({ to: line.to, line });
        adjacency.get(line.to).push({ to: line.from, line });
    }

    const start = lines[0].from;
    let current = start;
    let previous = null;
    const used = new Set();
    const points = [];

    for (let guard = 0; guard < lines.length + 2; guard += 1) {
        const node = nodeById.get(current);
        if (!node) {
            return null;
        }
        points.push({ x: node.x, y: node.y });
        const candidates = adjacency.get(current) || [];
        const nextEdge = candidates.find((candidate) => {
            const key = candidate.line.id || `${candidate.line.from}->${candidate.line.to}`;
            return candidate.to !== previous && !used.has(key);
        }) || candidates.find((candidate) => {
            const key = candidate.line.id || `${candidate.line.from}->${candidate.line.to}`;
            return !used.has(key);
        });
        if (!nextEdge) {
            return null;
        }
        const key = nextEdge.line.id || `${nextEdge.line.from}->${nextEdge.line.to}`;
        used.add(key);
        previous = current;
        current = nextEdge.to;
        if (current === start) {
            return used.size === lines.length ? { points } : null;
        }
    }

    return null;
}

function collisionLoopKind(lines) {
    if (lines.some((line) => line.kind === "killable")) return "killable";
    if (lines.some((line) => line.kind === "damaging")) return "damaging";
    return "blockable";
}

function polygonArea(points) {
    let area = 0;
    for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        area += a.x * b.y - b.x * a.y;
    }
    return area * 0.5;
}

function assetLineColor(kind) {
    if (kind === "walkable") return "rgba(88, 255, 158, 0.92)";
    if (kind === "blockable") return "rgba(255, 225, 94, 0.92)";
    if (kind === "damaging") return "rgba(255, 159, 67, 0.95)";
    if (kind === "killable") return "rgba(255, 79, 97, 0.95)";
    return "rgba(255, 255, 255, 0.85)";
}

function assetAreaColor(kind) {
    if (kind === "damaging") return "rgba(255, 159, 67, 0.20)";
    if (kind === "killable") return "rgba(255, 79, 97, 0.22)";
    return "rgba(255, 225, 94, 0.18)";
}
