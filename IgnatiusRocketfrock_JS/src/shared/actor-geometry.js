import { currentTransformOf } from "./presentation-transform-data.js";

function finite(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function actorBodyRect(actor) {
    const width = Math.max(1, finite(actor?.width, 1));
    const height = Math.max(1, finite(actor?.height, 1));
    const transform = currentTransformOf(actor);
    const x = finite(transform?.x, 0);
    const y = finite(transform?.y, 0);
    return {
        x: x - width * 0.5,
        y: y - height,
        w: width,
        h: height
    };
}

export function enemyProjectileHitbox(enemy) {
    const body = actorBodyRect(enemy);
    const defaultInsetXFactor = enemy?.kind === "characterEnemy" ? 0.08 : 0;
    const defaultInsetTopFactor = enemy?.kind === "characterEnemy" ? 0.04 : 0;
    const insetXFactor = clamp(finite(enemy?.projectileHitboxInsetXFactor, defaultInsetXFactor), 0, 0.49);
    const insetTopFactor = clamp(finite(enemy?.projectileHitboxInsetTopFactor, defaultInsetTopFactor), 0, 0.95);
    const insetX = body.w * insetXFactor;
    const insetTop = body.h * insetTopFactor;
    return {
        x: body.x + insetX,
        y: body.y + insetTop,
        w: Math.max(1, body.w - insetX * 2),
        h: Math.max(1, body.h - insetTop)
    };
}

export function characterEnemyMeleeAttackRect(enemy) {
    const facing = finite(enemy?.facing, 1) < 0 ? -1 : 1;
    const width = Math.max(1, finite(enemy?.width, 1));
    const height = Math.max(1, finite(enemy?.height, 1));
    const reach = Math.max(1, finite(enemy?.attackRange, 1));
    const verticalRange = Math.max(1, finite(enemy?.attackVerticalRange, height));
    const bodyInset = Math.max(4, width * 0.12);
    const transform = currentTransformOf(enemy);
    const front = finite(transform?.x, 0) + facing * bodyInset;
    return {
        x: facing > 0 ? front : front - reach,
        y: finite(transform?.y, 0) - verticalRange,
        w: reach,
        h: verticalRange
    };
}
