import { sampleAnimationClip } from "../shared/animation-data.js";

const DEFAULT_DT = 1 / 60;
const MIN_DT = 1 / 240;
const MAX_DT = 1 / 20;
const HORIZONTAL_SPEED_SCALE = 520;
const DEFAULT_WALK_DURATION = 0.72;
const WALK_FORWARD_POSE_FRACTION = 0.25;
const WALK_BACKWARD_POSE_FRACTION = 0.75;
const PASSIVE_FLIGHT_CYCLE_MULTIPLIER = 3;
const ARM_MINIMUM_ANGLE = -0.12;
const ARM_MAXIMUM_ANGLE = 0.12;

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

function createSpring() {
    return { value: 0, velocity: 0 };
}

function stepSpring(spring, target, stiffness, damping, dt, maximumVelocity, minimumValue, maximumValue) {
    const acceleration = (target - spring.value) * stiffness - spring.velocity * damping;
    spring.velocity = clamp(spring.velocity + acceleration * dt, -maximumVelocity, maximumVelocity);
    spring.value = clamp(spring.value + spring.velocity * dt, minimumValue, maximumValue);
}

function createPartMotion() {
    return { x: 0, y: 0, angle: 0 };
}

function rotationRangeFromWalkPoses(walkClip, firstPose, secondPose, partName, fallbackMinimum, fallbackMaximum) {
    const referenceRotation = finiteNumber(walkClip?.referencePose?.[partName]?.rotation, 0);
    const firstRotation = finiteNumber(firstPose?.[partName]?.rotation, referenceRotation) - referenceRotation;
    const secondRotation = finiteNumber(secondPose?.[partName]?.rotation, referenceRotation) - referenceRotation;
    const minimum = Math.min(firstRotation, secondRotation);
    const maximum = Math.max(firstRotation, secondRotation);
    if (!(minimum < -0.001 && maximum > 0.001)) {
        return { minimum: fallbackMinimum, maximum: fallbackMaximum };
    }
    return { minimum, maximum };
}

function normalizeProfile(profile = {}) {
    const leftMinimum = finiteNumber(profile.leftFootMinimumAngle, -0.15);
    const leftMaximum = finiteNumber(profile.leftFootMaximumAngle, 0.15);
    const rightMinimum = finiteNumber(profile.rightFootMinimumAngle, -0.15);
    const rightMaximum = finiteNumber(profile.rightFootMaximumAngle, 0.15);
    const leftPassiveMaximum = Math.max(0, Math.min(
        finiteNumber(profile.leftFootPassiveAmplitude, 0.075),
        Math.min(Math.abs(leftMinimum), Math.abs(leftMaximum)) * 0.5
    ));
    const rightPassiveMaximum = Math.max(0, Math.min(
        finiteNumber(profile.rightFootPassiveAmplitude, 0.075),
        Math.min(Math.abs(rightMinimum), Math.abs(rightMaximum)) * 0.5
    ));
    return {
        leftFootMinimumAngle: Math.min(leftMinimum, -0.001),
        leftFootMaximumAngle: Math.max(leftMaximum, 0.001),
        rightFootMinimumAngle: Math.min(rightMinimum, -0.001),
        rightFootMaximumAngle: Math.max(rightMaximum, 0.001),
        leftFootPassiveAmplitude: leftPassiveMaximum,
        rightFootPassiveAmplitude: rightPassiveMaximum,
        passiveAngularSpeed: positiveNumber(profile.passiveAngularSpeed, (Math.PI * 2) / (DEFAULT_WALK_DURATION * PASSIVE_FLIGHT_CYCLE_MULTIPLIER))
    };
}

export function createPlayerFlightLimbMotionProfile(walkClip = null) {
    const duration = positiveNumber(walkClip?.duration, DEFAULT_WALK_DURATION);
    let firstPose = null;
    let secondPose = null;
    if (walkClip) {
        try {
            // The wizard walk reaches its opposing foot extremes at one-quarter and
            // three-quarters of the clip: 0.180 s and 0.540 s for the 0.720 s walk.
            firstPose = sampleAnimationClip(walkClip, duration * WALK_FORWARD_POSE_FRACTION);
            secondPose = sampleAnimationClip(walkClip, duration * WALK_BACKWARD_POSE_FRACTION);
        } catch (_error) {
            firstPose = null;
            secondPose = null;
        }
    }
    const leftRange = rotationRangeFromWalkPoses(walkClip, firstPose, secondPose, "leftFoot", -0.15, 0.15);
    const rightRange = rotationRangeFromWalkPoses(walkClip, firstPose, secondPose, "rightFoot", -0.15, 0.15);
    return normalizeProfile({
        leftFootMinimumAngle: leftRange.minimum,
        leftFootMaximumAngle: leftRange.maximum,
        rightFootMinimumAngle: rightRange.minimum,
        rightFootMaximumAngle: rightRange.maximum,
        leftFootPassiveAmplitude: Math.min(Math.abs(leftRange.minimum), Math.abs(leftRange.maximum)) * 0.5,
        rightFootPassiveAmplitude: Math.min(Math.abs(rightRange.minimum), Math.abs(rightRange.maximum)) * 0.5,
        passiveAngularSpeed: (Math.PI * 2) / (duration * PASSIVE_FLIGHT_CYCLE_MULTIPLIER)
    });
}

export function createPlayerFlightLimbMotionState() {
    return {
        initialized: false,
        airborne: false,
        previousVx: 0,
        previousVy: 0,
        forwardImpulse: 0,
        leftFootSpring: createSpring(),
        rightFootSpring: createSpring(),
        leftArmSpring: createSpring(),
        rightArmSpring: createSpring(),
        leftFoot: createPartMotion(),
        rightFoot: createPartMotion(),
        leftArm: createPartMotion(),
        rightArm: createPartMotion()
    };
}

export function resetPlayerFlightLimbMotion(state, player = null) {
    const target = state || createPlayerFlightLimbMotionState();
    target.initialized = Boolean(player);
    target.airborne = false;
    target.previousVx = finiteNumber(player?.vx, 0);
    target.previousVy = finiteNumber(player?.vy, 0);
    target.forwardImpulse = 0;
    for (const spring of [target.leftFootSpring, target.rightFootSpring, target.leftArmSpring, target.rightArmSpring]) {
        spring.value = 0;
        spring.velocity = 0;
    }
    for (const part of [target.leftFoot, target.rightFoot, target.leftArm, target.rightArm]) {
        part.x = 0;
        part.y = 0;
        part.angle = 0;
    }
    return target;
}

function scaledAngle(normalized, minimum, maximum) {
    return normalized >= 0 ? normalized * maximum : normalized * Math.abs(minimum);
}

export function updatePlayerFlightLimbMotion(state, input = {}) {
    const target = state || createPlayerFlightLimbMotionState();
    const profile = normalizeProfile(input.profile);
    const dt = clamp(finiteNumber(input.dt, DEFAULT_DT), MIN_DT, MAX_DT);
    const vx = finiteNumber(input.vx, 0);
    const vy = finiteNumber(input.vy, 0);
    const facing = finiteNumber(input.facing, 1) < 0 ? -1 : 1;
    const airborne = input.airborne === true;
    const hovering = input.hovering === true;
    const time = finiteNumber(input.time, 0);

    if (!target.initialized) {
        target.initialized = true;
        target.previousVx = vx;
        target.previousVy = vy;
    }

    let forwardVelocityDelta = 0;
    if (airborne && target.airborne) {
        forwardVelocityDelta = (vx - target.previousVx) * facing;
    }
    target.previousVx = vx;
    target.previousVy = vy;
    target.airborne = airborne;

    const impulseDecay = Math.exp(-dt * (airborne ? 5.2 : 10));
    const velocityKick = airborne ? clamp(forwardVelocityDelta / 240, -1, 1) * 0.85 : 0;
    target.forwardImpulse = clamp(target.forwardImpulse * impulseDecay + velocityKick, -1, 1);
    if (velocityKick !== 0) {
        target.leftFootSpring.velocity = clamp(target.leftFootSpring.velocity + velocityKick * 2.4, -1.9, 1.9);
        target.rightFootSpring.velocity = clamp(target.rightFootSpring.velocity + velocityKick * 2.2, -1.9, 1.9);
        target.leftArmSpring.velocity = clamp(target.leftArmSpring.velocity + velocityKick * 0.72, -1.25, 1.25);
        target.rightArmSpring.velocity = clamp(target.rightArmSpring.velocity + velocityKick * 0.66, -1.25, 1.25);
    }

    const forwardSpeed = airborne ? clamp((vx * facing) / HORIZONTAL_SPEED_SCALE, -1, 1) : 0;
    const normalizedLegTarget = airborne
        ? clamp(target.forwardImpulse * 1.08 + forwardSpeed * 0.18, -1, 1)
        : 0;
    const normalizedArmTarget = clamp(normalizedLegTarget * 0.58, -1, 1);
    const leftFootTarget = scaledAngle(normalizedLegTarget, profile.leftFootMinimumAngle, profile.leftFootMaximumAngle);
    const rightFootTarget = scaledAngle(normalizedLegTarget, profile.rightFootMinimumAngle, profile.rightFootMaximumAngle);
    const leftArmTarget = scaledAngle(normalizedArmTarget, ARM_MINIMUM_ANGLE, ARM_MAXIMUM_ANGLE);
    const rightArmTarget = scaledAngle(normalizedArmTarget, ARM_MINIMUM_ANGLE, ARM_MAXIMUM_ANGLE);

    stepSpring(target.leftFootSpring, leftFootTarget, 48, 8.8, dt, 1.9, profile.leftFootMinimumAngle, profile.leftFootMaximumAngle);
    stepSpring(target.rightFootSpring, rightFootTarget, 45, 8.4, dt, 1.9, profile.rightFootMinimumAngle, profile.rightFootMaximumAngle);
    stepSpring(target.leftArmSpring, leftArmTarget, 38, 8.0, dt, 1.25, ARM_MINIMUM_ANGLE, ARM_MAXIMUM_ANGLE);
    stepSpring(target.rightArmSpring, rightArmTarget, 35, 7.7, dt, 1.25, ARM_MINIMUM_ANGLE, ARM_MAXIMUM_ANGLE);

    const inertiaStrength = airborne
        ? clamp(Math.abs(target.forwardImpulse) * 1.2 + Math.abs(forwardSpeed) * 0.25, 0, 1)
        : 1;
    const passiveScale = airborne ? (hovering ? 1 : 0.55) * (1 - inertiaStrength * 0.88) : 0;
    const passiveTime = time * profile.passiveAngularSpeed;
    const leftLegDrift = Math.sin(passiveTime + 0.30) * profile.leftFootPassiveAmplitude * passiveScale;
    const rightLegDrift = Math.sin(passiveTime + 0.58) * profile.rightFootPassiveAmplitude * passiveScale;
    const leftArmDrift = Math.sin(passiveTime * 0.82 + 1.05) * 0.035 * passiveScale;
    const rightArmDrift = Math.sin(passiveTime * 0.86 + 1.42) * 0.032 * passiveScale;

    target.leftFoot.angle = clamp(target.leftFootSpring.value + leftLegDrift, profile.leftFootMinimumAngle, profile.leftFootMaximumAngle);
    target.rightFoot.angle = clamp(target.rightFootSpring.value + rightLegDrift, profile.rightFootMinimumAngle, profile.rightFootMaximumAngle);
    target.leftArm.angle = clamp(target.leftArmSpring.value + leftArmDrift, ARM_MINIMUM_ANGLE, ARM_MAXIMUM_ANGLE);
    target.rightArm.angle = clamp(target.rightArmSpring.value + rightArmDrift, ARM_MINIMUM_ANGLE, ARM_MAXIMUM_ANGLE);

    // Flight inertia is angular. Translating the complete limb tears the sprite away
    // from its attachment point, so all four parts keep their authored anchors.
    for (const part of [target.leftFoot, target.rightFoot, target.leftArm, target.rightArm]) {
        part.x = 0;
        part.y = 0;
    }
    return target;
}
