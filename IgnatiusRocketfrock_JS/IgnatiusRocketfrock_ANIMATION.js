const TAU = Math.PI * 2;
const TRANSFORM_PROPERTIES = Object.freeze(["x", "y", "rotation", "scale", "alpha"]);
const SUPPORTED_EASINGS = new Set(["step", "linear", "easeIn", "easeOut", "easeInOut"]);

export function normalizeAnimationClip(rawClip, label = "animation clip") {
    if (!rawClip || typeof rawClip !== "object") {
        throw new Error(`${label} must be a JSON object.`);
    }

    const duration = Number(rawClip.duration);
    if (!Number.isFinite(duration) || duration <= 0) {
        throw new Error(`${label} must have a positive duration.`);
    }

    const referencePose = normalizePose(rawClip.referencePose, `${label} referencePose`, true);
    const rawTracks = rawClip.tracks;
    if (!rawTracks || typeof rawTracks !== "object" || Array.isArray(rawTracks)) {
        throw new Error(`${label} must contain a tracks object.`);
    }

    const tracks = {};
    for (const [partName, rawPartTracks] of Object.entries(rawTracks)) {
        if (!rawPartTracks || typeof rawPartTracks !== "object" || Array.isArray(rawPartTracks)) {
            throw new Error(`${label} track group "${partName}" must be an object.`);
        }
        tracks[partName] = {};
        for (const [property, rawKeys] of Object.entries(rawPartTracks)) {
            if (!TRANSFORM_PROPERTIES.includes(property)) {
                throw new Error(`${label} track "${partName}.${property}" uses an unsupported property.`);
            }
            if (!Array.isArray(rawKeys) || rawKeys.length === 0) {
                throw new Error(`${label} track "${partName}.${property}" must contain at least one keyframe.`);
            }
            tracks[partName][property] = normalizeTrack(rawKeys, duration, `${label} track "${partName}.${property}"`);
        }
    }

    for (const partName of Object.keys(referencePose)) {
        if (!tracks[partName]) {
            tracks[partName] = {};
        }
    }

    return {
        ...rawClip,
        _normalizedAnimationClip: true,
        animationId: String(rawClip.animationId || "unnamed_animation"),
        duration,
        loop: rawClip.loop !== false,
        mirrorable: rawClip.mirrorable !== false,
        referencePose,
        tracks,
        playback: normalizePlayback(rawClip.playback),
        rootMotion: normalizeRootMotion(rawClip.rootMotion)
    };
}

export function sampleAnimationClip(clip, timeSeconds) {
    const normalizedClip = clip?._normalizedAnimationClip === true ? clip : normalizeAnimationClip(clip);
    const sampleTime = normalizeSampleTime(timeSeconds, normalizedClip.duration, normalizedClip.loop);
    const pose = cloneAnimationPose(normalizedClip.referencePose);

    for (const [partName, partTracks] of Object.entries(normalizedClip.tracks)) {
        const part = pose[partName] || defaultAnimationTransform();
        for (const [property, track] of Object.entries(partTracks)) {
            part[property] = sampleAnimationTrack(track, sampleTime, normalizedClip.duration, normalizedClip.loop, property === "rotation");
        }
        pose[partName] = part;
    }

    return pose;
}

// Editor playheads need to distinguish the authored terminal pose from the
// wrapped first pose of a looping clip. Runtime sampling should still wrap.
export function sampleAnimationClipAtPlayhead(clip, timeSeconds) {
    const normalizedClip = clip?._normalizedAnimationClip === true ? clip : normalizeAnimationClip(clip);
    const time = Number(timeSeconds);
    if (normalizedClip.loop && Number.isFinite(time) && Math.abs(time - normalizedClip.duration) <= 0.0000001) {
        return sampleAnimationClip({ ...normalizedClip, loop: false }, normalizedClip.duration);
    }
    return sampleAnimationClip(normalizedClip, time);
}

export function sampleAnimationTrack(track, timeSeconds, duration, loop = true, angular = false) {
    if (!Array.isArray(track) || track.length === 0) {
        throw new Error("Cannot sample an empty animation track.");
    }
    if (track.length === 1) {
        return track[0].value;
    }

    const time = normalizeSampleTime(timeSeconds, duration, loop);
    let left = track[0];
    let right = null;

    for (let index = 1; index < track.length; index += 1) {
        const candidate = track[index];
        if (time <= candidate.time) {
            right = candidate;
            break;
        }
        left = candidate;
    }

    if (!right) {
        if (!loop) {
            return track[track.length - 1].value;
        }
        right = { ...track[0], time: duration };
    }

    const span = Math.max(0.0000001, right.time - left.time);
    const rawT = clamp((time - left.time) / span, 0, 1);
    const t = applyEasing(rawT, left.easing);
    if (left.easing === "step") {
        return left.value;
    }
    return angular ? lerpAngle(left.value, right.value, t) : lerp(left.value, right.value, t);
}

export function animationTimeFromPhase(phase, duration) {
    const normalizedPhase = ((Number(phase) || 0) % TAU + TAU) % TAU;
    return normalizedPhase / TAU * duration;
}

export function blendAnimationPoses(fromPose, toPose, alpha) {
    const t = clamp(Number(alpha) || 0, 0, 1);
    const result = {};
    const partNames = new Set([...Object.keys(fromPose || {}), ...Object.keys(toPose || {})]);
    for (const partName of partNames) {
        const from = { ...defaultAnimationTransform(), ...(fromPose?.[partName] || {}) };
        const to = { ...from, ...(toPose?.[partName] || {}) };
        result[partName] = {
            x: lerp(from.x, to.x, t),
            y: lerp(from.y, to.y, t),
            rotation: lerpAngle(from.rotation, to.rotation, t),
            scale: lerp(from.scale, to.scale, t),
            alpha: lerp(from.alpha, to.alpha, t)
        };
    }
    return result;
}

export function cloneAnimationPose(pose) {
    return Object.fromEntries(
        Object.entries(pose || {}).map(([partName, transform]) => [partName, { ...defaultAnimationTransform(), ...transform }])
    );
}

export function defaultAnimationTransform() {
    return { x: 0, y: 0, rotation: 0, scale: 1, alpha: 1 };
}

function normalizePose(rawPose, label, requireParts = false) {
    if (!rawPose || typeof rawPose !== "object" || Array.isArray(rawPose)) {
        if (requireParts) {
            throw new Error(`${label} must be an object containing part transforms.`);
        }
        return {};
    }
    const pose = {};
    for (const [partName, rawTransform] of Object.entries(rawPose)) {
        if (!rawTransform || typeof rawTransform !== "object" || Array.isArray(rawTransform)) {
            throw new Error(`${label} part "${partName}" must be an object.`);
        }
        const transform = defaultAnimationTransform();
        for (const property of TRANSFORM_PROPERTIES) {
            if (rawTransform[property] === undefined) {
                continue;
            }
            const value = Number(rawTransform[property]);
            if (!Number.isFinite(value)) {
                throw new Error(`${label} part "${partName}.${property}" must be finite.`);
            }
            transform[property] = value;
        }
        pose[partName] = transform;
    }
    if (requireParts && Object.keys(pose).length === 0) {
        throw new Error(`${label} must contain at least one part.`);
    }
    return pose;
}

function normalizeTrack(rawKeys, duration, label) {
    const keys = rawKeys.map((rawKey, index) => {
        if (!rawKey || typeof rawKey !== "object" || Array.isArray(rawKey)) {
            throw new Error(`${label} key ${index} must be an object.`);
        }
        const time = Number(rawKey.time);
        const value = Number(rawKey.value);
        const easing = rawKey.easing || "linear";
        if (!Number.isFinite(time) || time < 0 || time > duration) {
            throw new Error(`${label} key ${index} has time outside 0..${duration}.`);
        }
        if (!Number.isFinite(value)) {
            throw new Error(`${label} key ${index} must have a finite value.`);
        }
        if (!SUPPORTED_EASINGS.has(easing)) {
            throw new Error(`${label} key ${index} uses unsupported easing "${easing}".`);
        }
        return { time, value, easing };
    }).sort((a, b) => a.time - b.time);

    for (let index = 1; index < keys.length; index += 1) {
        if (keys[index].time === keys[index - 1].time) {
            throw new Error(`${label} contains duplicate keyframe time ${keys[index].time}.`);
        }
    }
    return keys;
}

function normalizeRootMotion(rawRootMotion) {
    const source = rawRootMotion && typeof rawRootMotion === "object" ? rawRootMotion : {};
    return {
        enabled: source.enabled === true,
        xTrack: typeof source.xTrack === "string" ? source.xTrack : null,
        yTrack: typeof source.yTrack === "string" ? source.yTrack : null
    };
}

function normalizePlayback(rawPlayback) {
    const source = rawPlayback && typeof rawPlayback === "object" ? rawPlayback : {};
    return {
        idleThreshold: finiteOr(source.idleThreshold, 0.04),
        baseCyclesPerSecond: finiteOr(source.baseCyclesPerSecond, 0.55),
        speedCyclesPerSecond: finiteOr(source.speedCyclesPerSecond, 2.6),
        maxSpeedRatio: finiteOr(source.maxSpeedRatio, 1.4)
    };
}

function normalizeSampleTime(timeSeconds, duration, loop) {
    const safeDuration = Math.max(0.0000001, Number(duration) || 1);
    const time = Number(timeSeconds) || 0;
    if (!loop) {
        return clamp(time, 0, safeDuration);
    }
    return ((time % safeDuration) + safeDuration) % safeDuration;
}

function applyEasing(t, easing) {
    switch (easing) {
        case "step":
            return 0;
        case "easeIn":
            return t * t;
        case "easeOut":
            return 1 - (1 - t) * (1 - t);
        case "easeInOut":
            return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        case "linear":
        default:
            return t;
    }
}

function finiteOr(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function shortestAngleDelta(a, b) {
    let delta = (b - a + Math.PI) % TAU - Math.PI;
    if (delta < -Math.PI) {
        delta += TAU;
    }
    return delta;
}

function lerpAngle(a, b, t) {
    return a + shortestAngleDelta(a, b) * t;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
