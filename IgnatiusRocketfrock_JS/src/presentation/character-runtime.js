import {
    defaultAnimationTransform,
    normalizeAnimationClip,
    sampleAnimationClip
} from "../shared/animation-data.js";

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
            alpha: clamp(finiteOr(rawPart.alpha, 1), 0, 1)
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

export async function loadRuntimeCharacterProject(characterUrl, options = {}) {
    const loadJson = options.loadJson || defaultLoadJson;
    const loadImage = options.loadImage || defaultLoadImage;
    const createCanvas = options.createCanvas || defaultCreateCanvas;
    const character = await loadJson(characterUrl, "character definition");
    if (!character?.rig) {
        throw new Error(`Character definition ${characterUrl} does not specify a rig file.`);
    }
    const characterSourceUrl = String(characterUrl);
    const rigUrl = resolveRelativeUrl(characterSourceUrl, character.rig);
    const rawRig = await loadJson(rigUrl, "character rig");
    const rig = normalizeRuntimeCharacterRig({ ...rawRig, sourceUrl: rigUrl }, `character rig (${rigUrl})`);
    const atlasManifestUrl = resolveRelativeUrl(rigUrl, rig.atlasManifest || `${rig.atlasId || "character_atlas"}.json`);
    const atlas = await loadJson(atlasManifestUrl, "character atlas manifest");
    if (!atlas?.image || !atlas?.frames) {
        throw new Error(`Character atlas ${atlasManifestUrl} must specify image and frames.`);
    }
    const imageUrl = resolveRelativeUrl(atlasManifestUrl, atlas.image);
    const image = await loadImage(imageUrl);
    const assets = new Map();
    for (const partName of rig.drawOrder) {
        const part = rig.parts[partName];
        const frame = atlas.frames[part.frame];
        if (!frame) {
            throw new Error(`Character atlas ${atlasManifestUrl} is missing frame "${part.frame}" for rig part "${partName}".`);
        }
        assets.set(partName, makeRuntimeAtlasFrameAsset(image, frame, partName, part.frame, imageUrl, atlas.atlasId, createCanvas));
    }

    const animations = new Map();
    const animationSources = new Map();
    const animationMap = character.animationMap && typeof character.animationMap === "object" ? character.animationMap : {};
    for (const [slot, relativeUrl] of Object.entries(animationMap)) {
        if (!relativeUrl) {
            continue;
        }
        const animationUrl = resolveRelativeUrl(characterSourceUrl, relativeUrl);
        const rawClip = await loadJson(animationUrl, `character animation "${slot}"`);
        const clip = normalizeAnimationClip(rawClip, `character animation "${slot}" (${animationUrl})`);
        clip.sourceUrl = animationUrl;
        animations.set(slot, clip);
        animationSources.set(slot, animationUrl);
    }

    return {
        character: { ...character, sourceUrl: characterSourceUrl },
        characterId: String(character.characterId || characterUrl),
        displayName: String(character.displayName || character.characterId || "Character"),
        sourceUrl: characterSourceUrl,
        rig,
        rigUrl,
        atlas: { ...atlas, sourceUrl: atlasManifestUrl, imageUrl },
        image,
        assets,
        animations,
        animationSources
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

function makeRuntimeAtlasFrameAsset(image, frame, partName, frameId, imageUrl, atlasId, createCanvas) {
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
        width,
        height,
        naturalWidth: image.naturalWidth || image.width || width,
        naturalHeight: image.naturalHeight || image.height || height,
        bounds: { x, y, w: width, h: height },
        name: partName,
        frameId,
        atlasId,
        source: `${imageUrl}#${frameId}`,
        missing: false
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
        image.onload = () => resolve(image);
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
