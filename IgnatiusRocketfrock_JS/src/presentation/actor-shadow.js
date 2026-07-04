export const ACTOR_SHADOW_FADE_SECONDS = 0.2;

function finiteOr(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function actorGroundPoint(actor = {}) {
    return {
        x: finiteOr(actor.x, 0),
        y: finiteOr(actor.y, 0)
    };
}

export function actorHasGroundContact(actor = {}) {
    if (String(actor.locomotion || "").trim().toLowerCase() === "flying") {
        return false;
    }
    if (typeof actor.onGround === "boolean") {
        return actor.onGround;
    }
    if (typeof actor.airborne === "boolean") {
        return !actor.airborne;
    }
    return false;
}

export function advanceActorShadowOpacity(
    currentOpacity,
    targetVisible,
    elapsedSeconds,
    fadeSeconds = ACTOR_SHADOW_FADE_SECONDS
) {
    const target = targetVisible ? 1 : 0;
    if (!Number.isFinite(Number(currentOpacity))) {
        return target;
    }
    const current = clamp(Number(currentOpacity), 0, 1);
    const duration = Math.max(0, finiteOr(fadeSeconds, ACTOR_SHADOW_FADE_SECONDS));
    if (duration <= 0) {
        return target;
    }
    const step = Math.max(0, finiteOr(elapsedSeconds, 0)) / duration;
    if (target > current) {
        return Math.min(target, current + step);
    }
    return Math.max(target, current - step);
}
