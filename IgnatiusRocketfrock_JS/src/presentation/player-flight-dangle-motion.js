const DEFAULT_DT = 1 / 60;
const MIN_DT = 1 / 240;
const MAX_DT = 1 / 20;
const DEFAULT_MINIMUM_POSE_TIME = 0;
const DEFAULT_MAXIMUM_POSE_TIME = 0.36;
const DEFAULT_FORWARD_ACCELERATION = 950;
const DEFAULT_BRAKING_ACCELERATION = 780;
const DEFAULT_RESPONSE = 14;

function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
}

function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function positiveNumber(value, fallback) {
    const number = finiteNumber(value, fallback);
    return number > 0 ? number : fallback;
}

const FLIGHT_IDLE_FULL_SPEED = 2;
const FLIGHT_IDLE_ZERO_SPEED = 18;
const FLIGHT_IDLE_FULL_ACCELERATION = 8;
const FLIGHT_IDLE_ZERO_ACCELERATION = 120;

function smoothstep(edge0, edge1, value) {
    if (edge1 <= edge0) return value >= edge1 ? 1 : 0;
    const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}

export function playerFlightIdleRenderOffset(input = {}) {
    if (input.active !== true) {
        return { x: 0, y: 0, amount: 0 };
    }

    const vx = finiteNumber(input.vx, 0);
    const vy = finiteNumber(input.vy, 0);
    const ax = finiteNumber(input.ax, 0);
    const ay = finiteNumber(input.ay, 0);
    const speed = Math.hypot(vx, vy);
    const acceleration = Math.hypot(ax, ay);
    const speedAmount = 1 - smoothstep(FLIGHT_IDLE_FULL_SPEED, FLIGHT_IDLE_ZERO_SPEED, speed);
    const accelerationAmount = 1 - smoothstep(
        FLIGHT_IDLE_FULL_ACCELERATION,
        FLIGHT_IDLE_ZERO_ACCELERATION,
        acceleration
    );
    const amount = clamp(speedAmount * accelerationAmount, 0, 1);
    if (amount <= 0) {
        return { x: 0, y: 0, amount: 0 };
    }

    const time = finiteNumber(input.time, 0);
    // Two slow, incommensurate corrections keep the hover from reading as a
    // mechanical bob while keeping the idle correction bounded.
    return {
        x: amount * (2.40 * Math.sin(time * 2.22 + 0.35) + 0.70 * Math.sin(time * 3.46 + 2.10)),
        y: amount * (4.20 * Math.sin(time * 1.66 + 1.00) + 1.10 * Math.sin(time * 2.94 + 2.70)),
        amount
    };
}

function animationTrackTimeRange(clip) {
    let minimum = Number.POSITIVE_INFINITY;
    let maximum = Number.NEGATIVE_INFINITY;
    for (const partTracks of Object.values(clip?.tracks || {})) {
        for (const track of Object.values(partTracks || {})) {
            for (const key of Array.isArray(track) ? track : []) {
                const time = Number(key?.time);
                if (!Number.isFinite(time)) continue;
                minimum = Math.min(minimum, time);
                maximum = Math.max(maximum, time);
            }
        }
    }
    if (!Number.isFinite(minimum) || !Number.isFinite(maximum) || maximum <= minimum) {
        return {
            minimumPoseTime: DEFAULT_MINIMUM_POSE_TIME,
            maximumPoseTime: DEFAULT_MAXIMUM_POSE_TIME
        };
    }
    return { minimumPoseTime: minimum, maximumPoseTime: maximum };
}

export function createPlayerFlightDangleProfile(dangleClip = null) {
    const range = animationTrackTimeRange(dangleClip);
    return {
        minimumPoseTime: finiteNumber(range.minimumPoseTime, DEFAULT_MINIMUM_POSE_TIME),
        maximumPoseTime: positiveNumber(range.maximumPoseTime, DEFAULT_MAXIMUM_POSE_TIME),
        response: DEFAULT_RESPONSE
    };
}

export function createPlayerFlightDangleState(profile = null) {
    const normalized = normalizeProfile(profile);
    const neutralPoseTime = (normalized.minimumPoseTime + normalized.maximumPoseTime) * 0.5;
    return {
        active: false,
        normalizedAcceleration: 0,
        targetPoseTime: neutralPoseTime,
        poseTime: neutralPoseTime
    };
}

export function resetPlayerFlightDangle(state, profile = null) {
    const target = state || createPlayerFlightDangleState(profile);
    const normalized = normalizeProfile(profile);
    const neutralPoseTime = (normalized.minimumPoseTime + normalized.maximumPoseTime) * 0.5;
    target.active = false;
    target.normalizedAcceleration = 0;
    target.targetPoseTime = neutralPoseTime;
    target.poseTime = neutralPoseTime;
    return target;
}

function normalizeProfile(profile = {}) {
    const minimumPoseTime = Math.max(0, finiteNumber(profile.minimumPoseTime, DEFAULT_MINIMUM_POSE_TIME));
    const maximumPoseTime = Math.max(
        minimumPoseTime + 0.000001,
        finiteNumber(profile.maximumPoseTime, DEFAULT_MAXIMUM_POSE_TIME)
    );
    return {
        minimumPoseTime,
        maximumPoseTime,
        response: positiveNumber(profile.response, DEFAULT_RESPONSE)
    };
}

export function updatePlayerFlightDangle(state, input = {}) {
    const profile = normalizeProfile(input.profile);
    const target = state || createPlayerFlightDangleState(profile);
    const dt = clamp(finiteNumber(input.dt, DEFAULT_DT), MIN_DT, MAX_DT);
    const facing = finiteNumber(input.facing, 1) < 0 ? -1 : 1;
    const active = input.active === true;
    const localAcceleration = finiteNumber(input.ax, 0) * facing;
    const forwardAcceleration = positiveNumber(input.forwardAcceleration, DEFAULT_FORWARD_ACCELERATION);
    const brakingAcceleration = positiveNumber(input.brakingAcceleration, DEFAULT_BRAKING_ACCELERATION);
    const normalizedAcceleration = active
        ? clamp(
            localAcceleration >= 0
                ? localAcceleration / forwardAcceleration
                : localAcceleration / brakingAcceleration,
            -1,
            1
        )
        : 0;
    const poseAlpha = (normalizedAcceleration + 1) * 0.5;
    const targetPoseTime = profile.minimumPoseTime
        + (profile.maximumPoseTime - profile.minimumPoseTime) * poseAlpha;
    const responseAlpha = 1 - Math.exp(-profile.response * dt);

    target.active = active;
    target.normalizedAcceleration = normalizedAcceleration;
    target.targetPoseTime = targetPoseTime;
    target.poseTime += (targetPoseTime - target.poseTime) * responseAlpha;
    target.poseTime = clamp(target.poseTime, profile.minimumPoseTime, profile.maximumPoseTime);
    return target;
}
