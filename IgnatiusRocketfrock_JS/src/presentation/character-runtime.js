import { createPixmapPyramid } from "./pixmap-pyramid.js";
import {
    defaultAnimationTransform,
    normalizeAnimationClip,
    sampleAnimationClip
} from "../shared/animation-data.js";
import { normalizeColorExchange, colorExchangeCacheKey } from "../shared/color-exchange-data.js";
import { createColorExchangedSpriteCanvas } from "./sprite-color-exchange.js";
import { shownTransformOf } from "../shared/presentation-transform-data.js";

export function characterArtworkOffset(renderOffsetX = 0, renderOffsetY = 0, scale = 1) {
    const safeScale = finitePositive(scale, 1);
    return {
        x: finiteOr(renderOffsetX, 0) * safeScale,
        y: finiteOr(renderOffsetY, 0) * safeScale
    };
}

export function characterArtworkOrigin(actor = {}) {
    const facing = Number(actor.facing) < 0 ? -1 : 1;
    const offset = characterArtworkOffset(actor.renderOffsetX, actor.renderOffsetY);
    const transform = shownTransformOf(actor);
    return {
        x: finiteOr(transform.x, 0) + facing * offset.x,
        y: finiteOr(transform.y, 0) + offset.y
    };
}

export const CHARACTER_PROJECTILE_LAUNCH_TYPES = Object.freeze([
    "ballistic",
    "straight",
    "homing_lo",
    "homing_hi",
    "pathing_lo",
    "pathing_hi"
]);

const CHARACTER_PROJECTILE_LAUNCH_TYPE_SET = new Set(CHARACTER_PROJECTILE_LAUNCH_TYPES);

export function normalizeRuntimeCharacterRig(rawRig, label = "character rig") {
    if (!rawRig || typeof rawRig !== "object" || Array.isArray(rawRig)) {
        throw new Error(`${label} must be a JSON object.`);
    }
    if (!rawRig.parts || typeof rawRig.parts !== "object" || Array.isArray(rawRig.parts)) {
        throw new Error(`${label} must contain a parts object.`);
    }

    const sourceParts = rawRig.parts;
    const partNames = Object.keys(sourceParts);
    if (!partNames.length) {
        throw new Error(`${label} must contain at least one rig part.`);
    }

    const requestedDrawOrder = Array.isArray(rawRig.drawOrder) ? rawRig.drawOrder.map(String) : [];
    const drawOrder = [];
    for (const partName of [...requestedDrawOrder, ...partNames]) {
        if (sourceParts[partName] && !drawOrder.includes(partName)) {
            drawOrder.push(partName);
        }
    }

    const pivots = {};
    const parts = {};
    for (const partName of drawOrder) {
        const rawPart = sourceParts[partName] || {};
        const rawPivot = rawRig.pivots?.[partName] || {};
        const rawOffset = rawPart.offset || {};
        const colorExchange = normalizeColorExchange(rawPart.colorExchange);
        parts[partName] = {
            ...rawPart,
            frame: String(rawPart.frame || partName),
            offset: {
                x: finiteOr(rawOffset.x, 0),
                y: finiteOr(rawOffset.y, 0)
            },
            rotation: rawPart.rotation && typeof rawPart.rotation === "object" ? { ...rawPart.rotation } : {},
            scale: finiteOr(rawPart.scale, 1),
            targetHeight: Math.max(0.0001, finiteOr(rawPart.targetHeight, 1)),
            alpha: clamp(finiteOr(rawPart.alpha, 1), 0, 1),
            ...(colorExchange ? { colorExchange } : {})
        };
        pivots[partName] = {
            x: finiteOr(rawPivot.x, 0.5),
            y: finiteOr(rawPivot.y, 0.5)
        };
    }

    return {
        ...rawRig,
        _normalizedRuntimeRig: true,
        rigId: String(rawRig.rigId || "unnamed_rig"),
        drawOrder,
        global: {
            ...(rawRig.global || {}),
            scale: Math.max(0.0001, finiteOr(rawRig.global?.scale, 1)),
            lean: finiteOr(rawRig.global?.lean, 0),
            rootX: finiteOr(rawRig.global?.rootX, 0),
            rootYOffsetFromGround: finiteOr(rawRig.global?.rootYOffsetFromGround, 0),
            groundOffset: finiteOr(rawRig.global?.groundOffset, 0),
            debugPivots: rawRig.global?.debugPivots === true
        },
        pivots,
        parts
    };
}

export function createRuntimeCharacterSetupPose(rig) {
    const normalizedRig = rig?._normalizedRuntimeRig === true ? rig : normalizeRuntimeCharacterRig(rig);
    const pose = {};
    for (const partName of normalizedRig.drawOrder) {
        const part = normalizedRig.parts[partName];
        pose[partName] = {
            ...defaultAnimationTransform(),
            x: part.offset.x,
            y: part.offset.y,
            rotation: finiteOr(part.rotation?.base, 0),
            scale: part.scale,
            alpha: part.alpha
        };
    }
    return pose;
}

export function resolveRuntimeAnimationSlot(project, requestedSlot = "idle") {
    const animations = project?.animations instanceof Map ? project.animations : new Map();
    const requested = String(requestedSlot || "idle");
    if (animations.has(requested)) {
        return requested;
    }
    for (const fallback of ["idle", "walk", "run"]) {
        if (animations.has(fallback)) {
            return fallback;
        }
    }
    return animations.keys().next().value || null;
}

export function sampleRuntimeCharacterPose(project, slot = "idle", timeSeconds = 0) {
    if (!project?.rig) {
        throw new Error("Runtime character project is missing its rig.");
    }
    const resolvedSlot = resolveRuntimeAnimationSlot(project, slot);
    if (!resolvedSlot) {
        return {
            slot: null,
            clip: null,
            pose: createRuntimeCharacterSetupPose(project.rig)
        };
    }
    const clip = project.animations.get(resolvedSlot);
    return {
        slot: resolvedSlot,
        clip,
        pose: sampleAnimationClip(clip, timeSeconds)
    };
}

export function animationPoseToRuntimeTransforms(animationPose, rig, zoom = 1, actorScale = 1) {
    const normalizedRig = rig?._normalizedRuntimeRig === true ? rig : normalizeRuntimeCharacterRig(rig);
    const globalScale = normalizedRig.global.scale * finitePositive(zoom, 1) * finitePositive(actorScale, 1);
    const transforms = {};
    for (const partName of normalizedRig.drawOrder) {
        const part = normalizedRig.parts[partName];
        const authored = animationPose?.[partName];
        const local = authored
            ? { ...defaultAnimationTransform(), ...authored }
            : {
                x: part.offset.x,
                y: part.offset.y,
                rotation: finiteOr(part.rotation?.base, 0),
                scale: part.scale,
                alpha: part.alpha
            };
        transforms[partName] = {
            x: finiteOr(local.x, part.offset.x) * globalScale,
            y: finiteOr(local.y, part.offset.y) * globalScale,
            angle: finiteOr(local.rotation, finiteOr(part.rotation?.base, 0)),
            targetHeight: part.targetHeight * globalScale * Math.max(0, finiteOr(local.scale, part.scale)),
            alpha: clamp(finiteOr(local.alpha, part.alpha), 0, 1)
        };
    }
    return transforms;
}

export function applyRuntimeProjectileHandoffVisibility(project, animationSlot, timeSeconds, renderedTransforms) {
    if (!(project?.projectiles instanceof Map) || !renderedTransforms) {
        return 0;
    }
    const slot = String(animationSlot || "");
    const time = Math.max(0, finiteOr(timeSeconds, 0));
    let hidden = 0;
    for (const projectile of project.projectiles.values()) {
        if (slot !== projectile.animationSlot || time < projectile.releaseTime) {
            continue;
        }
        const transform = renderedTransforms[projectile.partName];
        if (!transform) {
            continue;
        }
        transform.alpha = 0;
        hidden += 1;
    }
    return hidden;
}

export function buildRuntimeCharacterDrawCommands(project, renderedTransforms) {
    if (!project?.rig || !(project.assets instanceof Map)) {
        throw new Error("Runtime character project must contain a normalized rig and an assets map.");
    }
    const commands = [];
    for (const partName of project.rig.drawOrder) {
        const asset = project.assets.get(partName);
        const transform = renderedTransforms?.[partName];
        const pivot = project.rig.pivots[partName];
        if (!asset || !transform || !pivot) {
            continue;
        }
        const spriteScale = transform.targetHeight / Math.max(1, asset.height);
        commands.push({
            partName,
            frameId: asset.frameId,
            asset,
            pivot,
            transform,
            spriteScale,
            drawX: -pivot.x * asset.width,
            drawY: -pivot.y * asset.height
        });
    }
    return commands;
}

export function compileRuntimeCharacterProjectiles(rig, animations, label = "character project") {
    const normalizedRig = rig?._normalizedRuntimeRig === true ? rig : normalizeRuntimeCharacterRig(rig);
    const animationMap = animations instanceof Map ? animations : new Map(Object.entries(animations || {}));
    const projectiles = new Map();

    for (const partName of normalizedRig.drawOrder) {
        const part = normalizedRig.parts[partName];
        const raw = part?.projectile;
        if (!raw || typeof raw !== "object" || Array.isArray(raw) || raw.enabled === false) {
            continue;
        }
        const animationSlot = String(raw.animationSlot || "attack").trim() || "attack";
        const clip = animationMap.get(animationSlot);
        if (!clip) {
            throw new Error(`${label} projectile part "${partName}" references missing animation slot "${animationSlot}".`);
        }
        const launchType = String(raw.launchType || "straight").trim();
        if (!CHARACTER_PROJECTILE_LAUNCH_TYPE_SET.has(launchType)) {
            throw new Error(`${label} projectile part "${partName}" uses unsupported launch type "${launchType}".`);
        }
        const releaseTime = clamp(finiteOr(raw.releaseTime, 0), 0, clip.duration);
        const releasePose = sampleAnimationClip({ ...clip, loop: false }, releaseTime);
        const sampled = releasePose?.[partName] || {
            x: part.offset.x,
            y: part.offset.y,
            rotation: finiteOr(part.rotation?.base, 0),
            scale: part.scale,
            alpha: part.alpha
        };
        projectiles.set(partName, {
            partName,
            projectileId: String(raw.id || partName),
            frameId: String(part.frame || partName),
            animationSlot,
            launchType,
            releaseTime,
            localX: finiteOr(sampled.x, part.offset.x),
            localY: finiteOr(sampled.y, part.offset.y),
            localRotation: finiteOr(sampled.rotation, finiteOr(part.rotation?.base, 0)),
            localScale: Math.max(0, finiteOr(sampled.scale, part.scale)),
            rigScale: normalizedRig.global.scale,
            projectileKind: raw.projectileKind ? String(raw.projectileKind) : null
        });
    }

    return projectiles;
}

export async function loadRuntimeCharacterProject(characterUrl, options = {}) {
    const loadJson = options.loadJson || defaultLoadJson;
    const loadImage = options.loadImage || defaultLoadImage;
    const createCanvas = options.createCanvas || defaultCreateCanvas;
    const onProgress = typeof options.onProgress === "function" ? options.onProgress : () => {};
    const usePixmapPyramids = options.usePixmapPyramids !== false;
    const progressParts = {
        character: 0,
        rig: 0,
        atlas: 0,
        image: 0,
        animations: 0,
        finalize: 0
    };
    const progressWeights = {
        character: 0.1,
        rig: 0.15,
        atlas: 0.1,
        image: 0.35,
        animations: 0.25,
        finalize: 0.05
    };
    const reportProgress = (label) => {
        const progress = Object.keys(progressParts).reduce(
            (sum, key) => sum + progressParts[key] * progressWeights[key],
            0
        );
        onProgress({ progress: clamp(progress, 0, 1), label: String(label || "Loading character") });
    };

    reportProgress(`Loading ${characterUrl}`);
    const character = await loadJson(characterUrl, "character definition");
    progressParts.character = 1;
    reportProgress(`Loaded character definition ${characterUrl}`);
    if (!character?.rig) {
        throw new Error(`Character definition ${characterUrl} does not specify a rig file.`);
    }

    const characterSourceUrl = String(characterUrl);
    const animationMap = character.animationMap && typeof character.animationMap === "object" ? character.animationMap : {};
    const animationEntries = Object.entries(animationMap).filter(([, relativeUrl]) => Boolean(relativeUrl));
    let loadedAnimationCount = 0;
    if (!animationEntries.length) {
        progressParts.animations = 1;
    }
    const animationJobs = animationEntries.map(async ([slot, relativeUrl]) => {
        const animationUrl = resolveRelativeUrl(characterSourceUrl, relativeUrl);
        const rawClip = await loadJson(animationUrl, `character animation "${slot}"`);
        const clip = normalizeAnimationClip(rawClip, `character animation "${slot}" (${animationUrl})`);
        clip.sourceUrl = animationUrl;
        loadedAnimationCount += 1;
        progressParts.animations = loadedAnimationCount / animationEntries.length;
        reportProgress(`Loaded ${character.displayName || character.characterId || "character"} animation ${slot}`);
        return { slot, animationUrl, clip };
    });

    const rigUrl = resolveRelativeUrl(characterSourceUrl, character.rig);
    const rawRig = await loadJson(rigUrl, "character rig");
    progressParts.rig = 1;
    reportProgress(`Loaded character rig ${rigUrl}`);
    const rig = normalizeRuntimeCharacterRig({ ...rawRig, sourceUrl: rigUrl }, `character rig (${rigUrl})`);
    const atlasManifestUrl = resolveRelativeUrl(rigUrl, rig.atlasManifest || `${rig.atlasId || "character_atlas"}.json`);
    const atlas = await loadJson(atlasManifestUrl, "character atlas manifest");
    progressParts.atlas = 1;
    reportProgress(`Loaded character atlas manifest ${atlasManifestUrl}`);
    if (!atlas?.image || !atlas?.frames) {
        throw new Error(`Character atlas ${atlasManifestUrl} must specify image and frames.`);
    }

    const supplementalAtlasEntries = Array.isArray(character.supplementalAtlases)
        ? character.supplementalAtlases.filter(Boolean).map((relativeUrl) => String(relativeUrl))
        : [];
    const supplementalAtlases = [];
    for (const relativeUrl of supplementalAtlasEntries) {
        const supplementalManifestUrl = resolveRelativeUrl(characterSourceUrl, relativeUrl);
        const supplementalAtlas = await loadJson(supplementalManifestUrl, "supplemental character atlas manifest");
        if (!supplementalAtlas?.image || !supplementalAtlas?.frames) {
            throw new Error(`Supplemental character atlas ${supplementalManifestUrl} must specify image and frames.`);
        }
        supplementalAtlases.push({ ...supplementalAtlas, sourceUrl: supplementalManifestUrl });
        reportProgress(`Loaded supplemental character atlas manifest ${supplementalManifestUrl}`);
    }

    const imageUrl = resolveRelativeUrl(atlasManifestUrl, atlas.image);
    const primaryImageJob = loadImage(imageUrl);
    const supplementalImageJobs = supplementalAtlases.map((supplementalAtlas) =>
        loadImage(resolveRelativeUrl(supplementalAtlas.sourceUrl, supplementalAtlas.image))
    );
    const [image, loadedAnimations, ...supplementalImages] = await Promise.all([
        primaryImageJob,
        Promise.all(animationJobs),
        ...supplementalImageJobs
    ]);
    progressParts.image = 1;
    reportProgress(`Decoded character atlas set for ${character.displayName || character.characterId || "character"}`);

    const atlasAssets = new Map();
    const atlasSet = [
        { manifest: atlas, manifestUrl: atlasManifestUrl, imageUrl, image },
        ...supplementalAtlases.map((manifest, index) => ({
            manifest,
            manifestUrl: manifest.sourceUrl,
            imageUrl: resolveRelativeUrl(manifest.sourceUrl, manifest.image),
            image: supplementalImages[index]
        }))
    ];
    for (const atlasEntry of atlasSet) {
        for (const [frameId, frame] of Object.entries(atlasEntry.manifest.frames)) {
            const objectMeta = atlasEntry.manifest.objects?.[frameId] || null;
            atlasAssets.set(frameId, makeRuntimeAtlasFrameAsset(
                atlasEntry.image,
                frame,
                frameId,
                frameId,
                atlasEntry.imageUrl,
                atlasEntry.manifest.atlasId,
                createCanvas,
                objectMeta,
                usePixmapPyramids
            ));
        }
    }

    const assets = new Map();
    const colorExchangeCanvasCache = new Map();
    for (const partName of rig.drawOrder) {
        const part = rig.parts[partName];
        const atlasAsset = atlasAssets.get(part.frame);
        if (!atlasAsset) {
            throw new Error(`Character atlas ${atlasManifestUrl} is missing frame "${part.frame}" for rig part "${partName}".`);
        }
        if (!part.colorExchange) {
            assets.set(partName, { ...atlasAsset, name: partName });
            continue;
        }
        const exchangeKey = `${atlasAsset.source}|${colorExchangeCacheKey(part.colorExchange)}`;
        let exchanged = colorExchangeCanvasCache.get(exchangeKey);
        if (!exchanged) {
            exchanged = createColorExchangedSpriteCanvas(atlasAsset.canvas, part.colorExchange, {
                createCanvas,
                width: atlasAsset.width,
                height: atlasAsset.height
            });
            colorExchangeCanvasCache.set(exchangeKey, exchanged);
        }
        assets.set(partName, {
            ...atlasAsset,
            name: partName,
            image: null,
            canvas: exchanged.canvas,
            sourceX: 0,
            sourceY: 0,
            sourceWidth: atlasAsset.width,
            sourceHeight: atlasAsset.height,
            source: `${atlasAsset.source}|colorExchange=${exchanged.cacheKey}`,
            colorExchange: exchanged.modifier,
            colorExchangeChangedPixelCount: exchanged.changedPixelCount
        });
    }

    const animations = new Map();
    const animationSources = new Map();
    for (const { slot, animationUrl, clip } of loadedAnimations) {
        animations.set(slot, clip);
        animationSources.set(slot, animationUrl);
    }
    const compiledProjectiles = compileRuntimeCharacterProjectiles(rig, animations, `character project (${characterSourceUrl})`);
    const requestedProjectileParts = Array.isArray(character.projectileParts)
        ? character.projectileParts.map(String)
        : (character.projectilePart ? [String(character.projectilePart)] : []);
    const projectiles = requestedProjectileParts.length
        ? new Map(requestedProjectileParts.filter((partName) => compiledProjectiles.has(partName)).map((partName) => [partName, compiledProjectiles.get(partName)]))
        : compiledProjectiles;
    if (requestedProjectileParts.length && projectiles.size !== requestedProjectileParts.length) {
        const missing = requestedProjectileParts.filter((partName) => !compiledProjectiles.has(partName));
        throw new Error(`Character definition ${characterSourceUrl} references untagged projectile part(s): ${missing.join(", ")}.`);
    }

    progressParts.finalize = 1;
    reportProgress(`Prepared ${character.displayName || character.characterId || "character"}`);
    return {
        character: { ...character, sourceUrl: characterSourceUrl },
        characterId: String(character.characterId || characterUrl),
        displayName: String(character.displayName || character.characterId || "Character"),
        sourceUrl: characterSourceUrl,
        rig,
        rigUrl,
        atlas: { ...atlas, sourceUrl: atlasManifestUrl, imageUrl },
        supplementalAtlases: supplementalAtlases.map((manifest, index) => ({
            ...manifest,
            imageUrl: resolveRelativeUrl(manifest.sourceUrl, manifest.image),
            image: supplementalImages[index] || null
        })),
        image,
        assets,
        atlasAssets,
        animations,
        animationSources,
        projectiles
    };
}

export function resolveRelativeUrl(baseUrl, relativeUrl) {
    const relative = String(relativeUrl || "");
    if (/^(?:[a-z]+:)?\/\//i.test(relative) || relative.startsWith("data:") || relative.startsWith("blob:")) {
        return relative;
    }
    const base = String(baseUrl || "");
    const slash = base.lastIndexOf("/");
    return slash >= 0 ? `${base.slice(0, slash + 1)}${relative}` : relative;
}

function makeRuntimeAtlasFrameAsset(image, frame, partName, frameId, imageUrl, atlasId, createCanvas, objectMeta = null, usePixmapPyramids = true) {
    const x = finiteOr(frame.x, 0);
    const y = finiteOr(frame.y, 0);
    const width = Math.max(1, finiteOr(frame.w, 1));
    const height = Math.max(1, finiteOr(frame.h, 1));
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext?.("2d");
    if (!ctx || typeof ctx.drawImage !== "function") {
        throw new Error("Runtime character canvas factory must provide a 2D drawing context.");
    }
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    return {
        canvas,
        pixmapPyramid: usePixmapPyramids ? createPixmapPyramid(canvas, { createCanvas }) : null,
        image,
        sourceX: x,
        sourceY: y,
        sourceWidth: width,
        sourceHeight: height,
        width,
        height,
        naturalWidth: image.naturalWidth || image.width || width,
        naturalHeight: image.naturalHeight || image.height || height,
        bounds: { x, y, w: width, h: height },
        name: partName,
        frameId,
        atlasId,
        source: `${imageUrl}#${frameId}`,
        missing: false,
        kind: objectMeta?.type ? String(objectMeta.type) : null,
        effectId: objectMeta?.effectId ? String(objectMeta.effectId) : null,
        paddingX: finiteOr(objectMeta?.paddingX, 0),
        paddingY: finiteOr(objectMeta?.paddingY, 0),
        tags: Array.isArray(objectMeta?.tags) ? objectMeta.tags.map(String) : []
    };
}

async function defaultLoadJson(url, label = "JSON") {
    let response;
    try {
        response = await fetch(url, { cache: "no-store" });
    } catch (error) {
        throw new Error(`Could not load ${label} from ${url}. Use a local web server and make sure the file exists. ${error.message}`);
    }
    if (!response.ok) {
        throw new Error(`Could not load ${label} from ${url}: HTTP ${response.status}.`);
    }
    return response.json();
}

function defaultLoadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = async () => {
            try {
                if (typeof image.decode === "function") {
                    await image.decode();
                }
            } catch (error) {
                // onload already guarantees usable pixels; decode can reject on
                // browsers that consider the image decoded before this call.
            }
            resolve(image);
        };
        image.onerror = () => reject(new Error(`Could not load ${url}`));
        image.src = url;
    });
}

function defaultCreateCanvas(width, height) {
    if (typeof document === "undefined") {
        throw new Error("No canvas factory was supplied outside a browser environment.");
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

function finitePositive(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
}

function finiteOr(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
