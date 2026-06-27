export const GAMEPAD_HAPTIC_PATTERNS = Object.freeze({
    hurt: Object.freeze({
        duration: 220,
        strongMagnitude: 0.82,
        weakMagnitude: 0.58,
        priority: 4
    }),
    doubleJump: Object.freeze({
        duration: 95,
        strongMagnitude: 0.18,
        weakMagnitude: 0.36,
        priority: 3
    }),
    rocketFire: Object.freeze({
        duration: 52,
        strongMagnitude: 0.05,
        weakMagnitude: 0.20,
        priority: 2
    }),
    hover: Object.freeze({
        duration: 105,
        strongMagnitude: 0.025,
        weakMagnitude: 0.11,
        priority: 1
    })
});

const HOVER_PULSE_INTERVAL_MS = 145;
const MAX_PROCESSED_EVENT_KEYS = 96;

function defaultNowMs() {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
        return performance.now();
    }
    return Date.now();
}

function eventKey(event) {
    if (!event || typeof event !== "object") return "";
    return [
        Number(event.tick) || 0,
        Number(event.time) || 0,
        String(event.type || ""),
        String(event.id || event.sourceId || event.volleyId || ""),
        String(event.reason || "")
    ].join("|");
}

function eventPattern(event) {
    if (event?.type === "PLAYER_DAMAGED") return GAMEPAD_HAPTIC_PATTERNS.hurt;
    if (event?.type === "PLAYER_BOOST_STARTED") return GAMEPAD_HAPTIC_PATTERNS.doubleJump;
    if (event?.type === "ROCKET_LAUNCHED") return GAMEPAD_HAPTIC_PATTERNS.rocketFire;
    return null;
}

function vibrationActuator(gamepad) {
    return gamepad?.vibrationActuator || gamepad?.hapticActuators?.[0] || null;
}

function safelyIgnorePromise(value) {
    if (value && typeof value.catch === "function") {
        value.catch(() => {});
    }
}

export class GamepadHaptics {
    constructor(options = {}) {
        this.navigatorRef = options.navigatorRef || (typeof navigator !== "undefined" ? navigator : null);
        this.now = typeof options.now === "function" ? options.now : defaultNowMs;
        this.processedEventKeys = new Set();
        this.processedEventOrder = [];
        this.nextHoverPulseAt = 0;
    }

    prime(events = []) {
        for (const event of events || []) {
            this.rememberEvent(event);
        }
    }

    reset(events = []) {
        this.processedEventKeys.clear();
        this.processedEventOrder.length = 0;
        this.nextHoverPulseAt = 0;
        this.prime(events);
    }

    activeGamepad(inputFrame) {
        if (!inputFrame?.gamepadActive) return null;
        const getGamepads = this.navigatorRef?.getGamepads;
        if (typeof getGamepads !== "function") return null;
        const requestedIndex = Number(inputFrame.gamepadIndex);
        const pads = Array.from(getGamepads.call(this.navigatorRef) || []);
        if (Number.isInteger(requestedIndex) && requestedIndex >= 0) {
            return pads.find((pad, index) => pad && (pad.index === requestedIndex || index === requestedIndex)) || null;
        }
        return pads.find(Boolean) || null;
    }

    rememberEvent(event) {
        const key = eventKey(event);
        if (!key || this.processedEventKeys.has(key)) return false;
        this.processedEventKeys.add(key);
        this.processedEventOrder.push(key);
        while (this.processedEventOrder.length > MAX_PROCESSED_EVENT_KEYS) {
            const expired = this.processedEventOrder.shift();
            this.processedEventKeys.delete(expired);
        }
        return true;
    }

    update(state, inputFrame) {
        const gamepad = this.activeGamepad(inputFrame);
        let strongestPattern = null;
        for (const event of state?.debug?.lastEvents || []) {
            if (!this.rememberEvent(event)) continue;
            const pattern = eventPattern(event);
            if (pattern && (!strongestPattern || pattern.priority > strongestPattern.priority)) {
                strongestPattern = pattern;
            }
        }

        if (!gamepad) {
            this.nextHoverPulseAt = 0;
            return false;
        }

        if (strongestPattern) {
            this.play(gamepad, strongestPattern);
            this.nextHoverPulseAt = Math.max(
                this.nextHoverPulseAt,
                this.now() + Math.max(80, strongestPattern.duration)
            );
            return true;
        }

        const hovering = Boolean(state?.equipment?.rocket?.attachedBoosting);
        const now = this.now();
        if (hovering && now >= this.nextHoverPulseAt) {
            this.play(gamepad, GAMEPAD_HAPTIC_PATTERNS.hover);
            this.nextHoverPulseAt = now + HOVER_PULSE_INTERVAL_MS;
            return true;
        }
        if (!hovering) {
            this.nextHoverPulseAt = 0;
        }
        return false;
    }

    play(gamepad, pattern) {
        const actuator = vibrationActuator(gamepad);
        if (!actuator || !pattern) return false;
        try {
            if (typeof actuator.playEffect === "function") {
                safelyIgnorePromise(actuator.playEffect("dual-rumble", {
                    startDelay: 0,
                    duration: pattern.duration,
                    strongMagnitude: pattern.strongMagnitude,
                    weakMagnitude: pattern.weakMagnitude
                }));
                return true;
            }
            if (typeof actuator.pulse === "function") {
                safelyIgnorePromise(actuator.pulse(
                    Math.max(pattern.strongMagnitude, pattern.weakMagnitude),
                    pattern.duration
                ));
                return true;
            }
        } catch (_error) {
            // Unsupported haptics must never interrupt gameplay.
        }
        return false;
    }
}
