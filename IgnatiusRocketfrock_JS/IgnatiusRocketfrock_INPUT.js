import { createInputFrame } from "./IgnatiusRocketfrock_SIM.js";

const KEY_BINDINGS = {
    moveLeft: ["ArrowLeft", "KeyA"],
    moveRight: ["ArrowRight", "KeyD"],
    jump: ["ArrowUp", "KeyW", "KeyZ"],
    weapon: ["Space", "KeyX", "KeyK"]
};

const DEBUG_KEYS = new Set(["KeyP", "KeyO", "KeyR", "KeyH", "KeyV", "KeyC", "KeyE", "KeyL", "F1"]);

const POINTER_CONTROL = Object.freeze({
    stickRadius: 96,
    moveDeadzone: 16,
    jumpThreshold: 36,
    doubleTapSeconds: 0.3,
    doubleTapMaxDistance: 56
});

const POINTER_IGNORED_SELECTOR = "a, button, input, textarea, select, label, [role='button'], [data-ignore-game-pointer]";

export class RocketfrockInput {
    constructor(target = window) {
        this.target = target;
        this.keys = new Set();
        this.previous = createInputFrame();
        this.debugPressed = {
            pause: false,
            step: false,
            reset: false,
            hitboxes: false,
            velocity: false,
            collision: false,
            exportState: false,
            inputConsoleLog: false,
            debugPanel: false
        };
        this.pointer = createPointerState();
        this.eventLog = [];
        this.consoleLogging = false;

        target.addEventListener("keydown", (event) => this.onKeyDown(event), { passive: false });
        target.addEventListener("keyup", (event) => this.onKeyUp(event), { passive: false });
        target.addEventListener("blur", () => this.clear());

        target.addEventListener("pointerdown", (event) => this.onPointerDown(event), { passive: false });
        target.addEventListener("pointermove", (event) => this.onPointerMove(event), { passive: false });
        target.addEventListener("pointerup", (event) => this.onPointerEnd(event), { passive: false });
        target.addEventListener("pointercancel", (event) => this.onPointerEnd(event), { passive: false });
    }

    onKeyDown(event) {
        if (this.isGameplayKey(event.code) || DEBUG_KEYS.has(event.code)) {
            event.preventDefault();
        }

        if (event.repeat) {
            this.recordKeyEvent("repeat", event);
            return;
        }

        if (!this.keys.has(event.code)) {
            if (event.code === "KeyP") this.debugPressed.pause = true;
            if (event.code === "KeyO") this.debugPressed.step = true;
            if (event.code === "KeyR") this.debugPressed.reset = true;
            if (event.code === "KeyH") this.debugPressed.hitboxes = true;
            if (event.code === "KeyV") this.debugPressed.velocity = true;
            if (event.code === "KeyC") this.debugPressed.collision = true;
            if (event.code === "KeyE") this.debugPressed.exportState = true;
            if (event.code === "KeyL") this.debugPressed.inputConsoleLog = true;
            if (event.code === "F1") this.debugPressed.debugPanel = true;
        }

        this.keys.add(event.code);
        this.recordKeyEvent("down", event);
    }

    onKeyUp(event) {
        if (this.isGameplayKey(event.code) || DEBUG_KEYS.has(event.code)) {
            event.preventDefault();
        }
        this.keys.delete(event.code);
        this.recordKeyEvent("up", event);
    }

    onPointerDown(event) {
        if (!this.shouldUsePointerEvent(event)) {
            return;
        }

        event.preventDefault();
        const now = performance.now() / 1000;
        const x = event.clientX;
        const y = event.clientY;
        const lastDistance = Math.hypot(x - this.pointer.lastTapX, y - this.pointer.lastTapY);
        if (now - this.pointer.lastTapTime <= POINTER_CONTROL.doubleTapSeconds && lastDistance <= POINTER_CONTROL.doubleTapMaxDistance) {
            this.pointer.weaponPulse = true;
            this.pointer.lastTapTime = -Infinity;
            this.recordPointerEvent("doubleTap", event);
        } else {
            this.pointer.lastTapTime = now;
            this.pointer.lastTapX = x;
            this.pointer.lastTapY = y;
        }

        this.pointer.active = true;
        this.pointer.pointerId = event.pointerId;
        this.pointer.startX = x;
        this.pointer.startY = y;
        this.pointer.currentX = x;
        this.pointer.currentY = y;
        this.updatePointerStick();
        this.capturePointer(event);
        this.recordPointerEvent("start", event);
    }

    onPointerMove(event) {
        if (!this.pointer.active || event.pointerId !== this.pointer.pointerId) {
            return;
        }

        event.preventDefault();
        this.pointer.currentX = event.clientX;
        this.pointer.currentY = event.clientY;
        this.updatePointerStick();
    }

    onPointerEnd(event) {
        if (!this.pointer.active || event.pointerId !== this.pointer.pointerId) {
            return;
        }

        event.preventDefault();
        this.pointer.active = false;
        this.pointer.pointerId = null;
        this.pointer.moveAxis = 0;
        this.pointer.jumpHeld = false;
        this.recordPointerEvent(event.type === "pointercancel" ? "cancel" : "end", event);
    }

    shouldUsePointerEvent(event) {
        if (event.button !== undefined && event.button !== 0) {
            return false;
        }
        if (event.target?.closest?.(POINTER_IGNORED_SELECTOR)) {
            return false;
        }
        return true;
    }

    capturePointer(event) {
        try {
            event.target?.setPointerCapture?.(event.pointerId);
        } catch (_error) {
            // Some targets, browsers, or synthetic events cannot capture. Window-level listeners still work.
        }
    }

    updatePointerStick() {
        const dx = this.pointer.currentX - this.pointer.startX;
        const dy = this.pointer.currentY - this.pointer.startY;
        const radius = POINTER_CONTROL.stickRadius;
        const moveMagnitude = Math.abs(dx);

        if (moveMagnitude <= POINTER_CONTROL.moveDeadzone) {
            this.pointer.moveAxis = 0;
        } else {
            const sign = Math.sign(dx);
            const scaled = (moveMagnitude - POINTER_CONTROL.moveDeadzone) / Math.max(1, radius - POINTER_CONTROL.moveDeadzone);
            this.pointer.moveAxis = sign * clamp(scaled, 0, 1);
        }

        this.pointer.jumpHeld = dy < -POINTER_CONTROL.jumpThreshold;
    }

    clear() {
        this.keys.clear();
        this.pointer.active = false;
        this.pointer.pointerId = null;
        this.pointer.moveAxis = 0;
        this.pointer.jumpHeld = false;
        this.previous = createInputFrame();
        this.recordKeyEvent("clear", { code: "WindowBlur", repeat: false });
    }

    recordKeyEvent(kind, event) {
        const entry = {
            time: Number((performance.now() / 1000).toFixed(3)),
            kind,
            code: event.code || "Unknown",
            repeat: Boolean(event.repeat),
            keys: Array.from(this.keys).sort()
        };
        this.recordEvent(entry);
    }

    recordPointerEvent(kind, event) {
        const entry = {
            time: Number((performance.now() / 1000).toFixed(3)),
            kind: `pointer:${kind}`,
            code: event.pointerType || "pointer",
            repeat: false,
            keys: Array.from(this.keys).sort()
        };
        this.recordEvent(entry);
    }

    recordEvent(entry) {
        this.eventLog.push(entry);
        while (this.eventLog.length > 80) {
            this.eventLog.shift();
        }
        if (this.consoleLogging) {
            console.log("Rocketfrock input", entry);
        }
    }

    getRecentEvents(limit = 8) {
        return this.eventLog.slice(-limit).map((entry) => ({ ...entry, keys: entry.keys.slice() }));
    }

    setConsoleLogging(enabled) {
        this.consoleLogging = Boolean(enabled);
    }

    isConsoleLoggingEnabled() {
        return this.consoleLogging;
    }

    isGameplayKey(code) {
        return Object.values(KEY_BINDINGS).some((bindings) => bindings.includes(code));
    }

    sample() {
        const gamepad = readGamepad();
        const keyboardMoveAxis = (anyKey(this.keys, KEY_BINDINGS.moveRight) ? 1 : 0) - (anyKey(this.keys, KEY_BINDINGS.moveLeft) ? 1 : 0);
        const moveAxis = clamp(keyboardMoveAxis + gamepad.moveAxis + this.pointer.moveAxis, -1, 1);
        const pointerWeaponPulse = this.pointer.weaponPulse;
        const current = createInputFrame({
            moveLeft: anyKey(this.keys, KEY_BINDINGS.moveLeft) || gamepad.moveLeft || moveAxis < -0.35,
            moveRight: anyKey(this.keys, KEY_BINDINGS.moveRight) || gamepad.moveRight || moveAxis > 0.35,
            moveAxis,
            jumpHeld: anyKey(this.keys, KEY_BINDINGS.jump) || gamepad.jumpHeld || this.pointer.jumpHeld,
            boostHeld: false,
            weaponHeld: anyKey(this.keys, KEY_BINDINGS.weapon) || gamepad.weaponHeld || pointerWeaponPulse,
            aimVector: gamepad.aimVector || pointerAimVector(this.pointer) || { x: 1, y: 0 }
        });

        this.pointer.weaponPulse = false;
        current.jumpPressed = current.jumpHeld && !this.previous.jumpHeld;
        current.jumpReleased = !current.jumpHeld && this.previous.jumpHeld;
        current.boostPressed = current.boostHeld && !this.previous.boostHeld;
        current.boostReleased = !current.boostHeld && this.previous.boostHeld;
        current.weaponPressed = current.weaponHeld && !this.previous.weaponHeld;
        current.weaponReleased = !current.weaponHeld && this.previous.weaponHeld;
        current.pausePressed = take(this.debugPressed, "pause");
        current.stepPressed = take(this.debugPressed, "step");
        current.resetPressed = take(this.debugPressed, "reset");
        current.toggleHitboxesPressed = take(this.debugPressed, "hitboxes");
        current.toggleVelocityPressed = take(this.debugPressed, "velocity");
        current.toggleCollisionPressed = take(this.debugPressed, "collision");
        current.exportStatePressed = take(this.debugPressed, "exportState");
        current.toggleInputConsoleLogPressed = take(this.debugPressed, "inputConsoleLog");
        current.toggleDebugPanelPressed = take(this.debugPressed, "debugPanel");

        this.previous = current;
        return current;
    }
}

function createPointerState() {
    return {
        active: false,
        pointerId: null,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        moveAxis: 0,
        jumpHeld: false,
        weaponPulse: false,
        lastTapTime: -Infinity,
        lastTapX: 0,
        lastTapY: 0
    };
}

function anyKey(keys, bindings) {
    return bindings.some((code) => keys.has(code));
}

function take(object, key) {
    const value = Boolean(object[key]);
    object[key] = false;
    return value;
}

function readGamepad() {
    const empty = {
        moveLeft: false,
        moveRight: false,
        moveAxis: 0,
        jumpHeld: false,
        weaponHeld: false,
        aimVector: null
    };

    if (typeof navigator === "undefined" || !navigator.getGamepads) {
        return empty;
    }

    const pads = navigator.getGamepads();
    const pad = Array.from(pads).find(Boolean);
    if (!pad) {
        return empty;
    }

    const lx = pad.axes[0] || 0;
    const ly = pad.axes[1] || 0;
    const moveAxis = Math.abs(lx) > 0.16 ? lx : 0;
    return {
        moveLeft: lx < -0.35 || Boolean(pad.buttons[14]?.pressed),
        moveRight: lx > 0.35 || Boolean(pad.buttons[15]?.pressed),
        moveAxis,
        jumpHeld: Boolean(pad.buttons[0]?.pressed || pad.buttons[12]?.pressed || ly < -0.55),
        weaponHeld: Boolean(pad.buttons[1]?.pressed),
        aimVector: Math.hypot(lx, ly) > 0.25 ? normalize({ x: lx, y: ly }) : null
    };
}

function pointerAimVector(pointer) {
    if (!pointer.active) {
        return null;
    }
    const dx = pointer.currentX - pointer.startX;
    const dy = pointer.currentY - pointer.startY;
    return Math.hypot(dx, dy) > POINTER_CONTROL.moveDeadzone ? normalize({ x: dx, y: dy }) : null;
}

function normalize(v) {
    const length = Math.hypot(v.x, v.y) || 1;
    return { x: v.x / length, y: v.y / length };
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
