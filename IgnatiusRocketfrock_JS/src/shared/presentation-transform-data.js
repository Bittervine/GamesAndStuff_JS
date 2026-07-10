const DEFAULT_TRANSFORM = Object.freeze({
    x: 0,
    y: 0,
    angle: 0,
    scaleX: 1,
    scaleY: 1,
    alpha: 1
});

function finiteNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

export function createTransform(values = {}) {
    const uniformScale = Number.isFinite(Number(values.scale)) ? Number(values.scale) : null;
    return {
        x: finiteNumber(values.x, DEFAULT_TRANSFORM.x),
        y: finiteNumber(values.y, DEFAULT_TRANSFORM.y),
        angle: finiteNumber(values.angle ?? values.rotation, DEFAULT_TRANSFORM.angle),
        scaleX: finiteNumber(values.scaleX, uniformScale ?? DEFAULT_TRANSFORM.scaleX),
        scaleY: finiteNumber(values.scaleY, uniformScale ?? DEFAULT_TRANSFORM.scaleY),
        alpha: finiteNumber(values.alpha, DEFAULT_TRANSFORM.alpha)
    };
}

export function copyTransform(target, source) {
    target.x = finiteNumber(source?.x, DEFAULT_TRANSFORM.x);
    target.y = finiteNumber(source?.y, DEFAULT_TRANSFORM.y);
    target.angle = finiteNumber(source?.angle, DEFAULT_TRANSFORM.angle);
    target.scaleX = finiteNumber(source?.scaleX, DEFAULT_TRANSFORM.scaleX);
    target.scaleY = finiteNumber(source?.scaleY, DEFAULT_TRANSFORM.scaleY);
    target.alpha = finiteNumber(source?.alpha, DEFAULT_TRANSFORM.alpha);
    return target;
}

function clampUnit(value) {
    return Math.max(0, Math.min(1, finiteNumber(value, 1)));
}

function interpolateNumber(from, to, blend) {
    return from + (to - from) * blend;
}

function interpolateAngle(from, to, blend) {
    const fullTurn = Math.PI * 2;
    let delta = (to - from) % fullTurn;
    if (delta > Math.PI) delta -= fullTurn;
    if (delta < -Math.PI) delta += fullTurn;
    return from + delta * blend;
}

function interpolateScale(from, to, blend) {
    if (from === 0 || to === 0 || Math.sign(from) !== Math.sign(to)) {
        return to;
    }
    return interpolateNumber(from, to, blend);
}

export function interpolateTransform(target, previous, current, blend = 1) {
    const t = clampUnit(blend);
    const previousX = finiteNumber(previous?.x, finiteNumber(current?.x, DEFAULT_TRANSFORM.x));
    const previousY = finiteNumber(previous?.y, finiteNumber(current?.y, DEFAULT_TRANSFORM.y));
    const previousAngle = finiteNumber(previous?.angle, finiteNumber(current?.angle, DEFAULT_TRANSFORM.angle));
    const previousScaleX = finiteNumber(previous?.scaleX, finiteNumber(current?.scaleX, DEFAULT_TRANSFORM.scaleX));
    const previousScaleY = finiteNumber(previous?.scaleY, finiteNumber(current?.scaleY, DEFAULT_TRANSFORM.scaleY));
    const previousAlpha = finiteNumber(previous?.alpha, finiteNumber(current?.alpha, DEFAULT_TRANSFORM.alpha));
    const currentX = finiteNumber(current?.x, previousX);
    const currentY = finiteNumber(current?.y, previousY);
    const currentAngle = finiteNumber(current?.angle, previousAngle);
    const currentScaleX = finiteNumber(current?.scaleX, previousScaleX);
    const currentScaleY = finiteNumber(current?.scaleY, previousScaleY);
    const currentAlpha = finiteNumber(current?.alpha, previousAlpha);

    target.x = interpolateNumber(previousX, currentX, t);
    target.y = interpolateNumber(previousY, currentY, t);
    target.angle = interpolateAngle(previousAngle, currentAngle, t);
    target.scaleX = interpolateScale(previousScaleX, currentScaleX, t);
    target.scaleY = interpolateScale(previousScaleY, currentScaleY, t);
    target.alpha = interpolateNumber(previousAlpha, currentAlpha, t);
    return target;
}

export function createTransformTriplet(values = {}) {
    const currentTransform = createTransform(values);
    return {
        previousTransform: copyTransform(createTransform(), currentTransform),
        currentTransform,
        shownTransform: copyTransform(createTransform(), currentTransform)
    };
}

export function ensureTransformTriplet(subject, values = subject) {
    if (!subject || typeof subject !== "object") return subject;
    if (!subject.currentTransform || !subject.previousTransform || !subject.shownTransform) {
        const initial = {
            x: values?.x,
            y: values?.y,
            angle: values?.angle ?? values?.rotation ?? (
                Number.isFinite(Number(values?.vx)) || Number.isFinite(Number(values?.vy))
                    ? Math.atan2(Number(values?.vy) || 0, Number(values?.vx) || 0)
                    : 0
            ),
            scaleX: values?.scaleX ?? values?.renderScale ?? values?.visualScale ?? values?.scale,
            scaleY: values?.scaleY ?? values?.renderScale ?? values?.visualScale ?? values?.scale,
            alpha: values?.alpha ?? values?.renderOpacity
        };
        Object.assign(subject, createTransformTriplet(initial));
    }
    delete subject.x;
    delete subject.y;
    delete subject.angle;
    delete subject.rotation;
    delete subject.scale;
    delete subject.scaleX;
    delete subject.scaleY;
    delete subject.renderScale;
    delete subject.visualScale;
    delete subject.alpha;
    delete subject.renderOpacity;
    return subject;
}

export function snapshotTransform(subject) {
    if (!subject?.previousTransform || !subject?.currentTransform) return false;
    copyTransform(subject.previousTransform, subject.currentTransform);
    return true;
}

export function showCurrentTransform(subject) {
    if (!subject?.shownTransform || !subject?.currentTransform) return false;
    copyTransform(subject.shownTransform, subject.currentTransform);
    return true;
}

export function showInterpolatedTransform(subject, blend = 1) {
    if (!subject?.shownTransform || !subject?.currentTransform) return false;
    interpolateTransform(
        subject.shownTransform,
        subject.previousTransform || subject.currentTransform,
        subject.currentTransform,
        blend
    );
    return true;
}

export function snapTransformTriplet(subject) {
    if (!subject?.currentTransform) return false;
    if (subject.previousTransform) copyTransform(subject.previousTransform, subject.currentTransform);
    if (subject.shownTransform) copyTransform(subject.shownTransform, subject.currentTransform);
    return true;
}

export function currentTransformOf(subject) {
    return subject?.currentTransform || subject || DEFAULT_TRANSFORM;
}

export function shownTransformOf(subject) {
    return subject?.shownTransform || subject?.currentTransform || subject || DEFAULT_TRANSFORM;
}

export function createAnimationClock(value = 0) {
    const current = finiteNumber(value, 0);
    return { previous: current, current, shown: current };
}

export function ensureAnimationClock(subject, value = subject?.animationTime) {
    if (!subject || typeof subject !== "object") return null;
    if (!subject.animationClock || typeof subject.animationClock !== "object") {
        subject.animationClock = createAnimationClock(value);
    }
    delete subject.animationTime;
    return subject.animationClock;
}

export function snapshotAnimationClock(clock) {
    if (!clock || typeof clock !== "object") return false;
    clock.previous = finiteNumber(clock.current, 0);
    return true;
}

export function showCurrentAnimationClock(clock) {
    if (!clock || typeof clock !== "object") return false;
    clock.shown = finiteNumber(clock.current, 0);
    return true;
}

export function showInterpolatedAnimationClock(clock, blend = 1) {
    if (!clock || typeof clock !== "object") return false;
    const current = finiteNumber(clock.current, 0);
    const previous = finiteNumber(clock.previous, current);
    clock.shown = interpolateNumber(previous, current, clampUnit(blend));
    return true;
}

export function snapAnimationClock(clock) {
    if (!clock || typeof clock !== "object") return false;
    const current = finiteNumber(clock.current, 0);
    clock.previous = current;
    clock.shown = current;
    return true;
}
