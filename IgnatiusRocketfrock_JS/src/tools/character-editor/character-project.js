import { normalizeCharacterSounds } from "../../shared/character-sound-data.js";

const FILE_KIND = Object.freeze({
    CHARACTER: "character",
    RIG: "rig",
    ATLAS: "atlas",
    ANIMATION: "animation",
    UNKNOWN: "unknown"
});

export const CHARACTER_PROJECT_FILE_KIND = FILE_KIND;

export function assertNoRemovedCharacterPartColorExchange(rig, label = "Character rig") {
    if (!rig || typeof rig !== "object" || Array.isArray(rig)) {
        return;
    }
    for (const [partName, part] of Object.entries(rig.parts || {})) {
        if (part && typeof part === "object" && !Array.isArray(part)
            && Object.prototype.hasOwnProperty.call(part, "colorExchange")) {
            throw new Error(`${label} part "${partName}" uses removed character-part colorExchange. Bake variant pixels into the authored character atlas instead.`);
        }
    }
}

export function normalizeCharacterSlug(value) {
    const slug = String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_");
    return slug || "new_character";
}

export function normalizeAnimationSlot(value) {
    const slot = String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_");
    if (!slot) {
        throw new Error("Animation slot cannot be empty.");
    }
    return slot;
}

export function animationFilenameForCharacterSlot(character, requestedSlot) {
    const slot = normalizeAnimationSlot(requestedSlot);
    const characterId = String(character?.characterId || "ct_char_character").trim();
    const stem = characterId.replace(/^ct_char_/, "") || "character";
    return `ct_anim_${stem}_${slot}.json`;
}

export function classifyCharacterProjectJson(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return FILE_KIND.UNKNOWN;
    }
    if (typeof value.characterId === "string" && typeof value.rig === "string" && isObject(value.animationMap)) {
        return FILE_KIND.CHARACTER;
    }
    if (Array.isArray(value.drawOrder) && isObject(value.parts) && isObject(value.pivots)) {
        return FILE_KIND.RIG;
    }
    if (typeof value.atlasId === "string" && typeof value.image === "string" && isObject(value.frames)) {
        return FILE_KIND.ATLAS;
    }
    if (typeof value.animationId === "string" && Number.isFinite(Number(value.duration)) && isObject(value.tracks)) {
        return FILE_KIND.ANIMATION;
    }
    return FILE_KIND.UNKNOWN;
}

export function createBlankCharacterProject(displayName = "New Character") {
    const cleanDisplayName = String(displayName || "New Character").trim() || "New Character";
    const slug = normalizeCharacterSlug(cleanDisplayName);
    const filenames = {
        image: `ct_atlas_${slug}_1.png`,
        atlas: `ct_atlas_${slug}_1.json`,
        rig: `ct_rig_${slug}_1.json`,
        character: `ct_char_${slug}_1.json`,
        animation: `ct_anim_${slug}_idle_1.json`
    };
    const rootTransform = { x: 0, y: 0, rotation: 0, scale: 1, alpha: 1 };
    const singleKey = (value) => [{ time: 0, value, easing: "linear" }];

    const atlas = {
        meta: {
            version: 1,
            note: "Blank character atlas template. Replace the placeholder frame after selecting an atlas PNG."
        },
        atlasId: `ct_atlas_${slug}_1`,
        image: filenames.image,
        frames: {
            root: { x: 0, y: 0, w: 1, h: 1 }
        },
        objects: {
            root: {
                id: "root",
                frame: "root",
                type: "characterPart",
                layer: "character",
                mirrorable: true,
                tags: ["placeholder"]
            }
        }
    };

    const rig = {
        meta: {
            version: 1,
            note: "Blank character rig template. The root part keeps the project valid until real atlas frames and body parts are authored."
        },
        atlasManifest: filenames.atlas,
        drawOrder: ["root"],
        global: {
            scale: 1,
            lean: 0,
            rootX: 0,
            rootYOffsetFromGround: 0,
            groundOffset: 0,
            debugPivots: false
        },
        anchors: {},
        pivots: {
            root: { x: 0.5, y: 0.5 }
        },
        parts: {
            root: {
                frame: "root",
                role: "root",
                tags: ["root", "placeholder"],
                offset: { x: 0, y: 0 },
                scale: 1,
                targetHeight: 64
            }
        }
    };

    const animation = {
        meta: {
            version: 1,
            note: "Blank idle animation template."
        },
        animationId: `ct_anim_${slug}_idle_1`,
        duration: 1,
        loop: true,
        mirrorable: true,
        playback: {
            idleThreshold: 0.04,
            baseCyclesPerSecond: 1,
            speedCyclesPerSecond: 1,
            maxSpeedRatio: 1
        },
        rootMotion: {
            enabled: false,
            xTrack: null,
            yTrack: null
        },
        referencePose: {
            root: { ...rootTransform }
        },
        tracks: {
            root: {
                x: singleKey(0),
                y: singleKey(0),
                rotation: singleKey(0),
                scale: singleKey(1),
                alpha: singleKey(1)
            }
        }
    };

    const character = {
        meta: {
            version: 1,
            note: "Blank character definition template."
        },
        characterId: `ct_char_${slug}_1`,
        displayName: cleanDisplayName,
        rig: filenames.rig,
        defaultFacing: "right",
        mirrorable: true,
        animationMap: {
            idle: filenames.animation
        },
        sounds: normalizeCharacterSounds(null)
    };

    return {
        slug,
        displayName: cleanDisplayName,
        filenames,
        character,
        rig,
        atlas,
        animations: {
            idle: animation
        }
    };
}

export function resolveCharacterProjectReference(baseName, reference, availableNames) {
    const names = [...(availableNames || [])].map((name) => normalizePath(name));
    const normalizedReference = normalizePath(reference);
    if (!normalizedReference) {
        return null;
    }

    const baseDirectory = directoryName(normalizePath(baseName));
    const relativeCandidate = normalizePath(`${baseDirectory}${normalizedReference}`);
    const exact = names.find((name) => name === relativeCandidate || name === normalizedReference);
    if (exact) {
        return exact;
    }

    const targetBaseName = fileName(normalizedReference);
    const basenameMatches = names.filter((name) => fileName(name) === targetBaseName);
    return basenameMatches.length === 1 ? basenameMatches[0] : null;
}

export function inventoryCharacterProjectJson(records) {
    const inventory = {
        character: [],
        rig: [],
        atlas: [],
        animation: [],
        unknown: []
    };
    for (const record of records || []) {
        const kind = classifyCharacterProjectJson(record?.data);
        inventory[kind].push(record);
    }
    return inventory;
}

export function addAtlasFrameToRig(rig, frameId, frame, preferredPartName = null) {
    if (!rig || !Array.isArray(rig.drawOrder) || !isObject(rig.parts) || !isObject(rig.pivots)) {
        throw new Error("Rig must contain drawOrder, parts, and pivots before an atlas frame can be assigned.");
    }
    if (!frameId || !frame || !Number.isFinite(Number(frame.w)) || !Number.isFinite(Number(frame.h))) {
        throw new Error("A valid atlas frame is required before creating a rig part.");
    }

    const baseName = normalizeRigPartName(preferredPartName || frameId);
    let partName = baseName;
    let suffix = 2;
    while (rig.parts[partName]) {
        partName = `${baseName}_${suffix}`;
        suffix += 1;
    }

    const removedParts = removeSolePlaceholderPart(rig);
    rig.drawOrder.push(partName);
    rig.pivots[partName] = { x: 0.5, y: 0.5 };
    rig.parts[partName] = {
        frame: String(frameId),
        role: partName,
        tags: [],
        offset: { x: 0, y: 0 },
        scale: 1,
        targetHeight: Math.max(1, Math.round(Number(frame.h))),
        alpha: 1
    };

    return { partName, removedParts };
}

export function addRigPartToAnimation(animation, partName, removedParts = [], transform = null) {
    if (!animation || !isObject(animation.referencePose) || !isObject(animation.tracks)) {
        throw new Error("Animation must contain referencePose and tracks before a rig part can be added.");
    }
    const pose = {
        x: Number(transform?.x || 0),
        y: Number(transform?.y || 0),
        rotation: Number(transform?.rotation || 0),
        scale: Number(transform?.scale ?? 1),
        alpha: Number(transform?.alpha ?? 1)
    };
    for (const removed of removedParts || []) {
        delete animation.referencePose[removed];
        delete animation.tracks[removed];
    }
    animation.referencePose[partName] = { ...pose };
    animation.tracks[partName] = Object.fromEntries(
        Object.entries(pose).map(([property, value]) => [property, [{ time: 0, value, easing: "linear" }]])
    );
    return animation;
}

export function moveRigPartToBack(rig, partName) {
    return moveRigPartToDrawOrderEdge(rig, partName, 0);
}

export function moveRigPartToFront(rig, partName) {
    const lastIndex = Array.isArray(rig?.drawOrder) ? Math.max(0, rig.drawOrder.length - 1) : 0;
    return moveRigPartToDrawOrderEdge(rig, partName, lastIndex);
}

function moveRigPartToDrawOrderEdge(rig, partName, targetIndex) {
    if (!rig || !Array.isArray(rig.drawOrder)) {
        throw new Error("Rig must contain a drawOrder array before parts can be reordered.");
    }
    const index = rig.drawOrder.indexOf(partName);
    if (index < 0) {
        throw new Error(`Rig drawOrder does not contain part ${partName}.`);
    }
    const clampedTarget = Math.max(0, Math.min(rig.drawOrder.length - 1, targetIndex));
    if (index === clampedTarget) {
        return false;
    }
    rig.drawOrder.splice(index, 1);
    rig.drawOrder.splice(clampedTarget, 0, partName);
    return true;
}

function normalizePath(value) {
    const parts = String(value || "").replace(/\\/g, "/").split("/");
    const normalized = [];
    for (const part of parts) {
        if (!part || part === ".") {
            continue;
        }
        if (part === "..") {
            normalized.pop();
            continue;
        }
        normalized.push(part);
    }
    return normalized.join("/");
}

function normalizeRigPartName(value) {
    const name = String(value || "part")
        .trim()
        .replace(/[^A-Za-z0-9_]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_");
    return name || "part";
}

function removeSolePlaceholderPart(rig) {
    if (rig.drawOrder.length !== 1) {
        return [];
    }
    const name = rig.drawOrder[0];
    const part = rig.parts[name];
    if (!part || !Array.isArray(part.tags) || !part.tags.includes("placeholder")) {
        return [];
    }
    rig.drawOrder.length = 0;
    delete rig.parts[name];
    delete rig.pivots[name];
    return [name];
}

function directoryName(value) {
    const slash = value.lastIndexOf("/");
    return slash >= 0 ? value.slice(0, slash + 1) : "";
}

function fileName(value) {
    const slash = value.lastIndexOf("/");
    return slash >= 0 ? value.slice(slash + 1) : value;
}

function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
