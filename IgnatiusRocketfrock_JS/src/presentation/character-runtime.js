import {
    defaultAnimationTransform,
    normalizeAnimationClip,
    sampleAnimationClip
} from "../shared/animation-data.js";

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

export function applyRuntimeCharacterRigOverrides(rig, rigPartOverrides = {}, rigPivotOverrides = {}) {
    const normalizedRig = rig?._normalizedRuntimeRig === true ? rig : normalizeRuntimeCharacterRig(rig);
    const nextParts = {};
    const nextPivots = {};

    for (const partName of normalizedRig.drawOrder) {
        const basePart = normalizedRig.parts[partName] || {};
        const rawOverride = rigPartOverrides && typeof rigPartOverrides === "object" ? rigPartOverrides[partName] : null;
        const partOverride = rawOverride && typeof rawOverride === "object" && !Array.isArray(rawOverride) ? rawOverride : null;
        nextParts[partName] = {
            ...basePart,
            ...(partOverride || {}),
            frame: String((partOverride && partOverride.frame) || basePart.frame || partName),
            offset: {
                x: finiteOr(partOverride?.offset?.x, basePart.offset?.x ?? 0),
                y: finiteOr(partOverride?.offset?.y, basePart.offset?.y ?? 0)
            },
            rotation: partOverride?.rotation && typeof partOverride.rotation === "object"
                ? { ...(basePart.rotation || {}), ...partOverride.rotation }
                : { ...(basePart.rotation || {}) },
            scale: finiteOr(partOverride?.scale, basePart.scale ?? 1),
            targetHeight: Math.max(0.0001, finiteOr(partOverride?.targetHeight, basePart.targetHeight ?? 1)),
            alpha: clamp(finiteOr(partOverride?.alpha, basePart.alpha ?? 1), 0, 1)
        };

        const basePivot = normalizedRig.pivots[partName] || { x: 0.5, y: 0.5 };
        const rawPivotOverride = rigPivotOverrides && typeof rigPivotOverrides === "object" ? rigPivotOverrides[partName] : null;
        const pivotOverride = rawPivotOverride && typeof rawPivotOverride === "object" && !Array.isArray(rawPivotOverride) ? rawPivotOverride : null;
        nextPivots[partName] = {
            x: finiteOr(pivotOverride?.x, basePivot.x),
            y: finiteOr(pivotOverride?.y, basePivot.y)
        };
    }

    return {
        ...normalizedRig,
        parts: nextParts,
        pivots: nextPivots
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
    const character = await loadJson(characterUrl, "character definition");
    if (!character?.rig) {
        throw new Error(`Character definition ${characterUrl} does not specify a rig file.`);
    }
    const characterSourceUrl = String(characterUrl);
    const rigUrl = resolveRelativeUrl(characterSourceUrl, character.rig);
    const rawRig = await loadJson(rigUrl, "character rig");
    const baseRig = normalizeRuntimeCharacterRig({ ...rawRig, sourceUrl: rigUrl }, `character rig (${rigUrl})`);
    const rig = applyRuntimeCharacterRigOverrides(
        baseRig,
        character.rigPartOverrides && typeof character.rigPartOverrides === "object" ? character.rigPartOverrides : {},
        character.rigPivotOverrides && typeof character.rigPivotOverrides === "object" ? character.rigPivotOverrides : {}
    );
    const atlasManifestUrl = resolveRelativeUrl(rigUrl, rig.atlasManifest || `${rig.atlasId || "character_atlas"}.json`);
    const atlas = await loadJson(atlasManifestUrl, "character atlas manifest");
    if (!atlas?.image || !atlas?.frames) {
        throw new Error(`Character atlas ${atlasManifestUrl} must specify image and frames.`);
    }
    const imageUrl = resolveRelativeUrl(atlasManifestUrl, atlas.image);
    const image = await loadImage(imageUrl);
    const atlasAssets = new Map();
    for (const [frameId, frame] of Object.entries(atlas.frames)) {
        atlasAssets.set(frameId, makeRuntimeAtlasFrameAsset(image, frame, frameId, frameId, imageUrl, atlas.atlasId, createCanvas));
    }

    const assets = new Map();
    for (const partName of rig.drawOrder) {
        const part = rig.parts[partName];
        const atlasAsset = atlasAssets.get(part.frame);
        if (!atlasAsset) {
            throw new Error(`Character atlas ${atlasManifestUrl} is missing frame "${part.frame}" for rig part "${partName}".`);
        }
        assets.set(partName, { ...atlasAsset, name: partName });
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
