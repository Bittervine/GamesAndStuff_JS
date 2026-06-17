import { createInputFrame } from "./IgnatiusRocketfrock_SIM.js";

const KEY_BINDINGS = {
    moveLeft: ["ArrowLeft", "KeyA"],
    moveRight: ["ArrowRight", "KeyD"],
    jump: ["ArrowUp", "KeyW", "KeyZ"],
    weapon: ["Space", "KeyX", "KeyK"]
};

const DEBUG_KEYS = new Set(["KeyP", "KeyO", "KeyR", "KeyH", "KeyV", "KeyC", "KeyE", "KeyL", "F1"]);

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
        this.eventLog = [];
        this.consoleLogging = false;

        target.addEventListener("keydown", (event) => this.onKeyDown(event), { passive: false });
        target.addEventListener("keyup", (event) => this.onKeyUp(event), { passive: false });
        target.addEventListener("blur", () => this.clear());
    }

    onKeyDown(event) {
        if (this.isGameplayKey(event.code) || DEBUG_KEYS.has(event.code)) {
            event.preventDefault();
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

    clear() {
        this.keys.clear();
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
        const current = createInputFrame({
            moveLeft: anyKey(this.keys, KEY_BINDINGS.moveLeft) || gamepad.moveLeft,
            moveRight: anyKey(this.keys, KEY_BINDINGS.moveRight) || gamepad.moveRight,
            jumpHeld: anyKey(this.keys, KEY_BINDINGS.jump) || gamepad.jumpHeld,
            weaponHeld: anyKey(this.keys, KEY_BINDINGS.weapon) || gamepad.weaponHeld,
            aimVector: gamepad.aimVector || { x: 1, y: 0 }
        });

        current.jumpPressed = current.jumpHeld && !this.previous.jumpHeld;
        current.jumpReleased = !current.jumpHeld && this.previous.jumpHeld;
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
        jumpHeld: false,
        weaponHeld: false,
        aimVector: null
    };

    if (!navigator.getGamepads) {
        return empty;
    }

    const pads = navigator.getGamepads();
    const pad = Array.from(pads).find(Boolean);
    if (!pad) {
        return empty;
    }

    const lx = pad.axes[0] || 0;
    const ly = pad.axes[1] || 0;
    return {
        moveLeft: lx < -0.35 || Boolean(pad.buttons[14]?.pressed),
        moveRight: lx > 0.35 || Boolean(pad.buttons[15]?.pressed),
        jumpHeld: Boolean(pad.buttons[0]?.pressed || pad.buttons[12]?.pressed || ly < -0.55),
        weaponHeld: Boolean(pad.buttons[1]?.pressed),
        aimVector: Math.hypot(lx, ly) > 0.25 ? normalize({ x: lx, y: ly }) : null
    };
}

function normalize(v) {
    const length = Math.hypot(v.x, v.y) || 1;
    return { x: v.x / length, y: v.y / length };
}
