import {
    normalizeAnimationClip,
    sampleAnimationClipAtPlayhead
} from "../../shared/animation-data.js";

const DEFAULT_PARENT_POINT = Object.freeze({ x: 0.5, y: 0.5 });
const DEFAULT_BAKE_TOLERANCE = 0.25;
const DEFAULT_MAX_BAKE_DEPTH = 10;
const MIN_SPRITE_SCALE = 0.000001;

export function parentConstraintForPart(rig, partName) {
    const raw = rig?.parts?.[partName]?.parentConstraint;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return null;
    }
    const parentPart = String(raw.parentPart || "").trim();
    if (!parentPart) {
        return null;
    }
    return {
        parentPart,
        parentPoint: {
            x: finiteOr(raw.parentPoint?.x, DEFAULT_PARENT_POINT.x),
            y: finiteOr(raw.parentPoint?.y, DEFAULT_PARENT_POINT.y)
        }
    };
}

export function constrainedRigPartNames(rig) {
    return Object.keys(rig?.parts || {}).filter((partName) => parentConstraintForPart(rig, partName));
}

export function wouldCreateParentConstraintCycle(rig, childPart, parentPart) {
    const child = String(childPart || "");
    let current = String(parentPart || "");
    const visited = new Set();
    while (current) {
        if (current === child) {
            return true;
        }
        if (visited.has(current)) {
            return true;
        }
        visited.add(current);
        current = parentConstraintForPart(rig, current)?.parentPart || "";
    }
    return false;
}

export function availableParentConstraintParts(rig, childPart) {
    const child = String(childPart || "");
    return Object.keys(rig?.parts || {}).filter((candidate) => (
        candidate !== child
        && !wouldCreateParentConstraintCycle(rig, child, candidate)
    ));
}

export function validateParentConstraints(rig) {
    const errors = [];
    const parts = rig?.parts || {};
    for (const childPart of Object.keys(parts)) {
        const constraint = parentConstraintForPart(rig, childPart);
        if (!constraint) {
            continue;
        }
        if (!parts[constraint.parentPart]) {
            errors.push(`${childPart} references missing parent part "${constraint.parentPart}".`);
            continue;
        }
        if (wouldCreateParentConstraintCycle(rig, childPart, constraint.parentPart)) {
            errors.push(`${childPart} → ${constraint.parentPart} creates a circular parent constraint.`);
        }
    }
    return errors;
}

export function resolveParentConstrainedPose(rig, pose, assets) {
    const result = clonePose(pose);
    const resolving = new Set();
    const resolved = new Set();

    function resolve(partName) {
        if (resolved.has(partName)) {
            return result[partName];
        }
        if (resolving.has(partName)) {
            throw new Error(`Circular parent constraint encountered at ${partName}.`);
        }
        const transform = result[partName];
        if (!transform) {
            resolved.add(partName);
            return null;
        }
        const constraint = parentConstraintForPart(rig, partName);
        if (!constraint) {
            resolved.add(partName);
            return transform;
        }
        const parentPart = constraint.parentPart;
        if (!rig?.parts?.[parentPart] || !result[parentPart]) {
            resolved.add(partName);
            return transform;
        }
        resolving.add(partName);
        const parentTransform = resolve(parentPart);
        const point = parentConstraintRigPoint(
            rig,
            parentPart,
            constraint.parentPoint,
            parentTransform,
            assets
        );
        if (point) {
            transform.x = point.x;
            transform.y = point.y;
        }
        resolving.delete(partName);
        resolved.add(partName);
        return transform;
    }

    for (const partName of Object.keys(result)) {
        resolve(partName);
    }
    return result;
}

export function parentConstraintRigPoint(rig, parentPart, parentPoint, parentTransform, assets) {
    const asset = assetForPart(assets, parentPart);
    const pivot = rig?.pivots?.[parentPart];
    const part = rig?.parts?.[parentPart];
    if (!asset || !pivot || !part || !parentTransform) {
        return null;
    }
    const width = Math.max(1, finiteOr(asset.width, 1));
    const height = Math.max(1, finiteOr(asset.height, 1));
    const targetHeight = Math.max(MIN_SPRITE_SCALE, finiteOr(part.targetHeight, height));
    const poseScale = Math.max(0, finiteOr(parentTransform.scale, finiteOr(part.scale, 1)));
    const spriteScale = targetHeight * poseScale / height;
    const localX = (finiteOr(parentPoint?.x, 0.5) - finiteOr(pivot.x, 0.5)) * width * spriteScale;
    const localY = (finiteOr(parentPoint?.y, 0.5) - finiteOr(pivot.y, 0.5)) * height * spriteScale;
    const angle = finiteOr(parentTransform.rotation, finiteOr(part.rotation?.base, 0));
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: finiteOr(parentTransform.x, 0) + localX * cos - localY * sin,
        y: finiteOr(parentTransform.y, 0) + localX * sin + localY * cos
    };
}

export function parentPointForRigPosition(rig, parentPart, rigPoint, parentTransform, assets) {
    const asset = assetForPart(assets, parentPart);
    const pivot = rig?.pivots?.[parentPart];
    const part = rig?.parts?.[parentPart];
    if (!asset || !pivot || !part || !parentTransform) {
        return { ...DEFAULT_PARENT_POINT };
    }
    const width = Math.max(1, finiteOr(asset.width, 1));
    const height = Math.max(1, finiteOr(asset.height, 1));
    const targetHeight = Math.max(MIN_SPRITE_SCALE, finiteOr(part.targetHeight, height));
    const poseScale = Math.max(MIN_SPRITE_SCALE, finiteOr(parentTransform.scale, finiteOr(part.scale, 1)));
    const spriteScale = Math.max(MIN_SPRITE_SCALE, targetHeight * poseScale / height);
    const dx = finiteOr(rigPoint?.x, 0) - finiteOr(parentTransform.x, 0);
    const dy = finiteOr(rigPoint?.y, 0) - finiteOr(parentTransform.y, 0);
    const angle = -finiteOr(parentTransform.rotation, finiteOr(part.rotation?.base, 0));
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;
    return {
        x: finiteOr(pivot.x, 0.5) + localX / (width * spriteScale),
        y: finiteOr(pivot.y, 0.5) + localY / (height * spriteScale)
    };
}

export function bakeParentConstraintTracks(rawClip, rig, assets, options = {}) {
    const constrainedParts = constrainedRigPartNames(rig);
    if (!rawClip || !constrainedParts.length) {
        return { changed: false, parts: [], keyCount: 0 };
    }
    const errors = validateParentConstraints(rig);
    if (errors.length) {
        throw new Error(errors[0]);
    }
    const normalized = normalizeAnimationClip(rawClip, options.label || "parent-constrained animation");
    const tolerance = Math.max(0.001, finiteOr(options.tolerance, DEFAULT_BAKE_TOLERANCE));
    const maxDepth = Math.max(1, Math.round(finiteOr(options.maxDepth, DEFAULT_MAX_BAKE_DEPTH)));
    const seedTimes = collectAnimationKeyTimes(normalized, new Set(constrainedParts));
    const sampleCache = new Map();

    function sample(time) {
        const normalizedTime = clamp(time, 0, normalized.duration);
        const cacheKey = normalizedTime.toFixed(9);
        if (!sampleCache.has(cacheKey)) {
            const authored = sampleAnimationClipAtPlayhead(normalized, normalizedTime);
            sampleCache.set(cacheKey, resolveParentConstrainedPose(rig, authored, assets));
        }
        return sampleCache.get(cacheKey);
    }

    const requiredTimes = new Set(seedTimes);
    for (let index = 1; index < seedTimes.length; index += 1) {
        refineConstraintInterval(
            seedTimes[index - 1],
            seedTimes[index],
            constrainedParts,
            sample,
            requiredTimes,
            tolerance,
            maxDepth,
            0
        );
    }
    const times = [...requiredTimes].sort((a, b) => a - b);
    rawClip.tracks = rawClip.tracks || {};
    rawClip.referencePose = rawClip.referencePose || {};
    const startPose = sample(0);
    for (const partName of constrainedParts) {
        rawClip.tracks[partName] = rawClip.tracks[partName] || {};
        rawClip.tracks[partName].x = times.map((time) => ({
            time,
            value: finiteOr(sample(time)?.[partName]?.x, 0),
            easing: "linear"
        }));
        rawClip.tracks[partName].y = times.map((time) => ({
            time,
            value: finiteOr(sample(time)?.[partName]?.y, 0),
            easing: "linear"
        }));
        if (rawClip.referencePose[partName] && startPose?.[partName]) {
            rawClip.referencePose[partName].x = startPose[partName].x;
            rawClip.referencePose[partName].y = startPose[partName].y;
        }
    }
    return {
        changed: true,
        parts: constrainedParts,
        keyCount: times.length * constrainedParts.length * 2
    };
}

function refineConstraintInterval(start, end, parts, sample, times, tolerance, maxDepth, depth) {
    if (!(end > start) || depth >= maxDepth) {
        return;
    }
    const midpoint = (start + end) * 0.5;
    const startPose = sample(start);
    const endPose = sample(end);
    const middlePose = sample(midpoint);
    let error = 0;
    for (const partName of parts) {
        const left = startPose?.[partName];
        const right = endPose?.[partName];
        const middle = middlePose?.[partName];
        if (!left || !right || !middle) {
            continue;
        }
        const predictedX = (left.x + right.x) * 0.5;
        const predictedY = (left.y + right.y) * 0.5;
        error = Math.max(error, Math.hypot(middle.x - predictedX, middle.y - predictedY));
    }
    if (error <= tolerance) {
        return;
    }
    times.add(midpoint);
    refineConstraintInterval(start, midpoint, parts, sample, times, tolerance, maxDepth, depth + 1);
    refineConstraintInterval(midpoint, end, parts, sample, times, tolerance, maxDepth, depth + 1);
}

function collectAnimationKeyTimes(clip, constrainedParts = new Set()) {
    const times = new Set([0, clip.duration]);
    for (const [partName, tracks] of Object.entries(clip.tracks || {})) {
        for (const [property, keys] of Object.entries(tracks || {})) {
            if (constrainedParts.has(partName) && (property === "x" || property === "y")) {
                continue;
            }
            for (const key of keys || []) {
                times.add(clamp(finiteOr(key.time, 0), 0, clip.duration));
            }
        }
    }
    return [...times].sort((a, b) => a - b);
}

function assetForPart(assets, partName) {
    if (assets instanceof Map) {
        return assets.get(partName) || null;
    }
    return assets?.[partName] || null;
}

function clonePose(pose) {
    return Object.fromEntries(Object.entries(pose || {}).map(([partName, transform]) => [
        partName,
        { ...(transform || {}) }
    ]));
}

function finiteOr(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
