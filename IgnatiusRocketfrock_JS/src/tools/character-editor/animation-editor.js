import { normalizeAnimationClip } from "../../shared/animation-data.js";

export const ANIMATION_TRANSFORM_PROPERTIES = Object.freeze(["x", "y", "rotation", "scale", "alpha"]);
export const ANIMATION_EASINGS = Object.freeze(["step", "linear", "easeIn", "easeOut", "easeInOut"]);

export function createEditableAnimationClip(rawClip, label = "animation clip") {
    const editable = deepClone(rawClip);
    stripEditorMetadata(editable);
    normalizeAnimationClip(editable, label);
    return editable;
}

export function serializeEditableAnimationClip(rawClip, label = "animation clip") {
    const serializable = deepClone(rawClip);
    stripEditorMetadata(serializable);
    normalizeAnimationClip(serializable, label);
    return serializable;
}


export function animationMaxKeyTime(rawClip) {
    let maxTime = 0;
    for (const partTracks of Object.values(rawClip?.tracks || {})) {
        if (!partTracks || typeof partTracks !== "object") {
            continue;
        }
        for (const track of Object.values(partTracks)) {
            if (!Array.isArray(track)) {
                continue;
            }
            for (const key of track) {
                const time = Number(key?.time);
                if (Number.isFinite(time)) {
                    maxTime = Math.max(maxTime, time);
                }
            }
        }
    }
    return maxTime;
}

export function updateAnimationClipMetadata(rawClip, updates = {}) {
    if (!rawClip || typeof rawClip !== "object" || Array.isArray(rawClip)) {
        throw new Error("Animation metadata can only be edited on an animation object.");
    }

    if (updates.animationId !== undefined) {
        const animationId = String(updates.animationId || "").trim();
        if (!animationId) {
            throw new Error("Animation ID cannot be empty.");
        }
        rawClip.animationId = animationId;
    }

    if (updates.duration !== undefined) {
        const duration = Number(updates.duration);
        if (!Number.isFinite(duration) || duration <= 0) {
            throw new Error("Animation duration must be a positive number.");
        }
        const lastKeyTime = animationMaxKeyTime(rawClip);
        if (duration + 0.0000001 < lastKeyTime) {
            throw new Error(`Duration cannot be shorter than the final key at ${lastKeyTime.toFixed(3)} seconds.`);
        }
        rawClip.duration = duration;
    }

    if (updates.loop !== undefined) {
        rawClip.loop = updates.loop === true;
    }
    if (updates.mirrorable !== undefined) {
        rawClip.mirrorable = updates.mirrorable === true;
    }

    if (updates.playback && typeof updates.playback === "object") {
        const current = rawClip.playback && typeof rawClip.playback === "object" ? rawClip.playback : {};
        const playback = { ...current };
        const constraints = {
            idleThreshold: { min: 0, inclusive: true },
            baseCyclesPerSecond: { min: 0, inclusive: false },
            speedCyclesPerSecond: { min: 0, inclusive: false },
            maxSpeedRatio: { min: 0, inclusive: false }
        };
        for (const [field, rule] of Object.entries(constraints)) {
            if (updates.playback[field] === undefined) {
                continue;
            }
            const value = Number(updates.playback[field]);
            const invalid = !Number.isFinite(value) || (rule.inclusive ? value < rule.min : value <= rule.min);
            if (invalid) {
                const wording = rule.inclusive ? "zero or greater" : "greater than zero";
                throw new Error(`${field} must be ${wording}.`);
            }
            playback[field] = value;
        }
        rawClip.playback = playback;
    }

    normalizeAnimationClip(rawClip, `animation ${rawClip.animationId || "metadata"}`);
    return rawClip;
}

export function duplicateEditableAnimationClip(rawClip, newAnimationId) {
    const animationId = String(newAnimationId || "").trim();
    if (!animationId) {
        throw new Error("The duplicated animation needs a non-empty animation ID.");
    }
    const duplicate = serializeEditableAnimationClip(rawClip, "animation duplicate source");
    const sourceId = String(duplicate.animationId || "animation");
    duplicate.animationId = animationId;
    const sourceNote = String(duplicate.meta?.note || "").trim();
    duplicate.meta = {
        ...(duplicate.meta || {}),
        note: [sourceNote, `Duplicated from ${sourceId} in Puppet Forge.`].filter(Boolean).join("\n")
    };
    return createEditableAnimationClip(duplicate, `animation duplicate ${animationId}`);
}


export function exclusiveFrameParts(rawClip) {
    return rawClip?.presentation?.mode === "exclusive_frame_parts"
        && Array.isArray(rawClip.presentation.parts)
        ? [...rawClip.presentation.parts]
        : [];
}

export function enableExclusiveFramePresentation(rawClip, partNames) {
    const duration = positiveDuration(rawClip);
    const parts = [...new Set((partNames || []).map(String).filter(Boolean))];
    if (parts.length < 2) {
        throw new Error("Frame-based animation needs at least two rig parts.");
    }
    for (const partName of parts) {
        if (!rawClip.referencePose?.[partName]) {
            throw new Error(`Frame part "${partName}" is missing from the animation pose.`);
        }
    }

    const times = new Set([0]);
    for (const partName of parts) {
        for (const key of getAnimationTrack(rawClip, partName, "alpha", false) || []) {
            times.add(Number(key.time));
        }
    }
    const orderedTimes = [...times].filter(Number.isFinite).sort((a, b) => a - b);
    let previousFrame = parts[0];
    let repairedMoments = 0;
    const chosenFrames = orderedTimes.map((time) => {
        let bestPart = previousFrame;
        let bestAlpha = -Infinity;
        let visibleCount = 0;
        for (const partName of parts) {
            const track = getAnimationTrack(rawClip, partName, "alpha", false);
            const alpha = track?.length
                ? sampleStepTrack(track, time)
                : Number(rawClip.referencePose?.[partName]?.alpha ?? 1);
            if (alpha > 0.5) {
                visibleCount += 1;
            }
            if (alpha > bestAlpha) {
                bestAlpha = alpha;
                bestPart = partName;
            }
        }
        if (visibleCount !== 1) {
            repairedMoments += 1;
            if (bestAlpha <= 0.5) {
                bestPart = previousFrame;
            }
        }
        previousFrame = bestPart;
        return bestPart;
    });

    for (const partName of parts) {
        rawClip.tracks = rawClip.tracks || {};
        rawClip.tracks[partName] = rawClip.tracks[partName] || {};
        rawClip.tracks[partName].alpha = orderedTimes.map((time, index) => ({
            time,
            value: chosenFrames[index] === partName ? 1 : 0,
            easing: "step"
        }));
    }
    rawClip.presentation = { mode: "exclusive_frame_parts", parts };
    return { repairedMoments, frameCount: parts.length };
}

export function disableExclusiveFramePresentation(rawClip) {
    rawClip.presentation = { mode: "rig", parts: [] };
}

export function setExclusiveFrameAtTime(rawClip, partName, timeSeconds) {
    const parts = exclusiveFrameParts(rawClip);
    if (!parts.includes(partName)) {
        throw new Error(`"${partName}" is not part of this frame-based animation.`);
    }
    const time = clamp(Number(timeSeconds), 0, positiveDuration(rawClip));
    for (const framePart of parts) {
        upsertAnimationKeyframe(rawClip, framePart, "alpha", {
            time,
            value: framePart === partName ? 1 : 0,
            easing: "step"
        });
    }
}

function sampleStepTrack(track, time) {
    let value = Number(track[0]?.value ?? 0);
    for (const key of track) {
        if (Number(key.time) > time + 0.0000001) {
            break;
        }
        value = Number(key.value);
    }
    return value;
}

export function getAnimationTrack(rawClip, partName, property, create = false) {
    assertProperty(property);
    if (!rawClip.tracks || typeof rawClip.tracks !== "object" || Array.isArray(rawClip.tracks)) {
        if (!create) {
            return null;
        }
        rawClip.tracks = {};
    }
    if (!rawClip.tracks[partName]) {
        if (!create) {
            return null;
        }
        rawClip.tracks[partName] = {};
    }
    if (!rawClip.tracks[partName][property]) {
        if (!create) {
            return null;
        }
        rawClip.tracks[partName][property] = [];
    }
    return rawClip.tracks[partName][property];
}

export function findKeyframeIndex(rawClip, partName, property, timeSeconds, tolerance = 0.0005) {
    const track = getAnimationTrack(rawClip, partName, property, false) || [];
    const time = Number(timeSeconds);
    let bestIndex = -1;
    let bestDistance = Infinity;
    for (let index = 0; index < track.length; index += 1) {
        const distance = Math.abs(Number(track[index].time) - time);
        if (distance <= tolerance && distance < bestDistance) {
            bestIndex = index;
            bestDistance = distance;
        }
    }
    return bestIndex;
}

export function upsertAnimationKeyframe(rawClip, partName, property, keyframe, tolerance = 0.0005) {
    const duration = positiveDuration(rawClip);
    const normalizedKey = normalizeEditableKeyframe(keyframe, duration);
    const track = getAnimationTrack(rawClip, partName, property, true);
    const existingIndex = findKeyframeIndex(rawClip, partName, property, normalizedKey.time, tolerance);
    if (existingIndex >= 0) {
        track[existingIndex] = normalizedKey;
        sortTrack(track);
        return track.findIndex((item) => item === normalizedKey || sameKeyframe(item, normalizedKey));
    }
    track.push(normalizedKey);
    sortTrack(track);
    return track.findIndex((item) => item === normalizedKey);
}

export function updateAnimationKeyframe(rawClip, partName, property, index, updates) {
    const duration = positiveDuration(rawClip);
    const track = getAnimationTrack(rawClip, partName, property, false);
    if (!track || !Number.isInteger(index) || index < 0 || index >= track.length) {
        throw new Error("The selected keyframe no longer exists.");
    }
    const updated = normalizeEditableKeyframe({ ...track[index], ...updates }, duration);
    for (let otherIndex = 0; otherIndex < track.length; otherIndex += 1) {
        if (otherIndex !== index && Math.abs(Number(track[otherIndex].time) - updated.time) < 0.0000001) {
            throw new Error(`A keyframe already exists at ${updated.time.toFixed(3)} seconds.`);
        }
    }
    track[index] = updated;
    sortTrack(track);
    return track.findIndex((item) => item === updated);
}

export function updateAnimationKeyframeEasingAtTime(rawClip, partName, properties, timeSeconds, easing, tolerance = 0.0005) {
    const normalizedEasing = String(easing || "linear");
    if (!ANIMATION_EASINGS.includes(normalizedEasing)) {
        throw new Error(`Unsupported easing "${normalizedEasing}".`);
    }
    const propertyNames = [...new Set((properties || []).map(String))];
    let updatedCount = 0;
    for (const property of propertyNames) {
        assertProperty(property);
        const index = findKeyframeIndex(rawClip, partName, property, timeSeconds, tolerance);
        if (index < 0) {
            continue;
        }
        updateAnimationKeyframe(rawClip, partName, property, index, { easing: normalizedEasing });
        updatedCount += 1;
    }
    return updatedCount;
}

export function deleteAnimationKeyframe(rawClip, partName, property, index) {
    const track = getAnimationTrack(rawClip, partName, property, false);
    if (!track || !Number.isInteger(index) || index < 0 || index >= track.length) {
        return false;
    }
    if (track.length <= 1) {
        throw new Error("A track must keep at least one keyframe.");
    }
    track.splice(index, 1);
    return true;
}

export function animationTrackSummary(rawClip, partName, property) {
    const track = getAnimationTrack(rawClip, partName, property, false) || [];
    return {
        partName,
        property,
        keyCount: track.length,
        firstTime: track.length ? Number(track[0].time) : null,
        lastTime: track.length ? Number(track[track.length - 1].time) : null
    };
}

function normalizeEditableKeyframe(rawKey, duration) {
    const time = clamp(Number(rawKey?.time), 0, duration);
    const value = Number(rawKey?.value);
    const easing = String(rawKey?.easing || "linear");
    if (!Number.isFinite(time)) {
        throw new Error("Keyframe time must be finite.");
    }
    if (!Number.isFinite(value)) {
        throw new Error("Keyframe value must be finite.");
    }
    if (!ANIMATION_EASINGS.includes(easing)) {
        throw new Error(`Unsupported easing "${easing}".`);
    }
    return { time, value, easing };
}

function positiveDuration(rawClip) {
    const duration = Number(rawClip?.duration);
    if (!Number.isFinite(duration) || duration <= 0) {
        throw new Error("Animation duration must be positive before editing keyframes.");
    }
    return duration;
}

function assertProperty(property) {
    if (!ANIMATION_TRANSFORM_PROPERTIES.includes(property)) {
        throw new Error(`Unsupported animation property "${property}".`);
    }
}

function sortTrack(track) {
    track.sort((a, b) => Number(a.time) - Number(b.time));
}

function sameKeyframe(a, b) {
    return Number(a.time) === Number(b.time)
        && Number(a.value) === Number(b.value)
        && String(a.easing) === String(b.easing);
}

function stripEditorMetadata(value) {
    if (!value || typeof value !== "object") {
        return;
    }
    delete value._normalizedAnimationClip;
    delete value.sourceUrl;
}

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
