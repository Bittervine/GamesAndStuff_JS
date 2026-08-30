import { createInputFrame } from "../core/simulation.js";
import { DEFAULT_INPUT_BINDINGS, normalizeInputBindings } from "../shared/game-settings-data.js";

const GAMEPAD_BUTTON_NAMES = Object.freeze([
    "south", "east", "west", "north", "leftShoulder", "rightShoulder", "leftTrigger", "rightTrigger",
    "back", "start", "leftStick", "rightStick", "dpadUp", "dpadDown", "dpadLeft", "dpadRight", "home"
]);

const DEBUG_KEYS = new Set(["KeyP", "KeyO", "KeyR", "KeyH", "KeyV", "KeyC", "KeyE", "KeyL", "F1"]);

const GAMEPLAY_DIGITAL_ACTIONS = Object.freeze([
    Object.freeze({ held: "jumpHeld", pressed: "jumpPressed", released: "jumpReleased" }),
    Object.freeze({ held: "boostHeld", pressed: "boostPressed", released: "boostReleased" }),
    Object.freeze({ held: "lungeHeld", pressed: "lungePressed", released: "lungeReleased" }),
    Object.freeze({ held: "weaponHeld", pressed: "weaponPressed", released: "weaponReleased" }),
    Object.freeze({ held: "interactHeld", pressed: "interactPressed", released: "interactReleased" }),
    Object.freeze({ held: "dropHeld", pressed: "dropPressed", released: "dropReleased" })
]);

const POINTER_CONTROL = Object.freeze({
    stickRadius: 96,
    moveDeadzone: 16,
    jumpThreshold: 36,
    dropThreshold: 36,
    doubleTapSeconds: 0.3,
    doubleTapMaxDistance: 56
});

const POINTER_IGNORED_SELECTOR = "a, button, input, textarea, select, label, [role='button'], [data-ignore-game-pointer]";

export const GAMEPAD_ACTIVITY_TIMEOUT_SECONDS = 3;

export class RocketfrockInput {
    constructor(target = window, inputBindings = DEFAULT_INPUT_BINDINGS) {
        this.target = target;
        this.inputBindings = normalizeInputBindings(inputBindings);
        this.pendingBindingPresses = [];
        this.pendingPausePressed = false;
        this.keys = new Set();
        this.gamepad = createEmptyGamepadState();
        this.pendingGameplayEdges = createPendingGameplayEdges();
        this.debugPressed = createDebugPressed();
        this.pointer = createPointerState();
        this.rightMouseButtonDown = false;
        this.eventLog = [];
        this.consoleLogging = false;
        this.jumpSuppressedUntilRelease = false;
        this.lastInputDevice = "none";
        this.activeGamepadIndex = null;
        this.lastGamepadActivityAt = Number.NEGATIVE_INFINITY;

        target.addEventListener("keydown", (event) => this.onKeyDown(event), { passive: false });
        target.addEventListener("keyup", (event) => this.onKeyUp(event), { passive: false });
        target.addEventListener("blur", () => this.clear());
        target.addEventListener("contextmenu", (event) => {
            if (!event.target?.closest?.(POINTER_IGNORED_SELECTOR)) event.preventDefault();
        }, { passive: false });

        this.preferNativeTouchEvents = supportsTouchEvents();

        if (supportsPointerEvents()) {
            target.addEventListener("pointerdown", (event) => this.onPointerDown(event), { passive: false });
            target.addEventListener("pointermove", (event) => this.onPointerMove(event), { passive: false });
            target.addEventListener("pointerup", (event) => this.onPointerEnd(event), { passive: false });
            target.addEventListener("pointercancel", (event) => this.onPointerEnd(event), { passive: false });
            // Pointer Events only dispatch pointerdown for the first pressed mouse
            // button. Additional-button transitions may arrive as pointermove and
            // browser-specific mousedown events, so observe both independently of
            // the active movement pointer.
            target.addEventListener("mousedown", (event) => this.syncRightMouseWeaponButton(event), { passive: false });
        } else {
            target.addEventListener("mousedown", (event) => this.onMouseDown(event), { passive: false });
            target.addEventListener("mousemove", (event) => this.onMouseMove(event), { passive: false });
            target.addEventListener("mouseup", (event) => this.onMouseEnd(event), { passive: false });
        }

        if (this.preferNativeTouchEvents) {
            target.addEventListener("touchstart", (event) => this.onTouchStart(event), { passive: false });
            target.addEventListener("touchmove", (event) => this.onTouchMove(event), { passive: false });
            target.addEventListener("touchend", (event) => this.onTouchEnd(event), { passive: false });
            target.addEventListener("touchcancel", (event) => this.onTouchEnd(event), { passive: false });
        }
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
            this.queueBindingPress(`keyboard:${event.code}`);
            if (!this.isGameplayKey(event.code)) {
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
        }

        const before = this.digitalHeldState();
        this.keys.add(event.code);
        this.latchDigitalTransitions(before, this.digitalHeldState());
        this.recordKeyEvent("down", event);
    }

    onKeyUp(event) {
        if (this.isGameplayKey(event.code) || DEBUG_KEYS.has(event.code)) {
            event.preventDefault();
        }
        const before = this.digitalHeldState();
        this.keys.delete(event.code);
        this.latchDigitalTransitions(before, this.digitalHeldState());
        this.recordKeyEvent("up", event);
    }

    onPointerDown(event) {
        if (event.pointerType === "touch" && this.preferNativeTouchEvents) {
            return;
        }
        if (this.syncRightMouseWeaponButton(event)) {
            return;
        }
        if (!this.shouldUsePointerEvent(event)) {
            return;
        }
        if (this.pointer.active) {
            if (pointerTypeFromEvent(event) === "touch") event.preventDefault();
            return;
        }

        this.beginPointerContact(event, event.pointerId, event.clientX, event.clientY, event.pointerType || "pointer", "pointer");
        this.capturePointer(event);
    }

    onPointerMove(event) {
        this.syncRightMouseWeaponButton(event);
        if (!this.pointer.active || event.pointerId !== this.pointer.pointerId) {
            return;
        }

        this.movePointerContact(event, event.clientX, event.clientY);
    }

    onPointerEnd(event) {
        this.syncRightMouseWeaponButton(event);
        if (!this.pointer.active || event.pointerId !== this.pointer.pointerId) {
            return;
        }

        if (event.type === "pointercancel" && pointerTypeFromEvent(event) === "touch") {
            this.deferTouchPointerCancel(event);
            return;
        }

        this.endPointerContact(event, event.type === "pointercancel" ? "cancel" : "end");
    }

    onMouseDown(event) {
        if (this.syncRightMouseWeaponButton(event)) {
            return;
        }
        if (!this.shouldUsePointerEvent(event)) {
            return;
        }
        this.beginPointerContact(event, "mouse", event.clientX, event.clientY, "mouse");
    }

    onMouseMove(event) {
        this.syncRightMouseWeaponButton(event);
        if (!this.pointer.active || this.pointer.pointerId !== "mouse") {
            return;
        }
        this.movePointerContact(event, event.clientX, event.clientY);
    }

    onMouseEnd(event) {
        this.syncRightMouseWeaponButton(event);
        if (!this.pointer.active || this.pointer.pointerId !== "mouse") {
            return;
        }
        this.endPointerContact(event, "end");
    }

    onTouchStart(event) {
        if (event.changedTouches.length <= 0 || !this.shouldUsePointerEvent(event)) {
            return;
        }

        const touch = event.changedTouches[0];
        if (this.pointer.active) {
            if (this.pointer.pointerType === "touch") event.preventDefault();
            return;
        }

        this.beginPointerContact(event, touchId(touch), touch.clientX, touch.clientY, "touch", "touch");
    }

    onTouchMove(event) {
        if (!this.pointer.active || this.pointer.pointerType !== "touch") {
            return;
        }

        const touch = this.findRelevantTouch(event.changedTouches);
        if (!touch) {
            return;
        }

        this.pointer.pointerCancelGraceUntil = 0;
        this.movePointerContact(event, touch.clientX, touch.clientY);
    }

    onTouchEnd(event) {
        if (!this.pointer.active || this.pointer.pointerType !== "touch") {
            return;
        }

        const touch = this.findRelevantTouch(event.changedTouches);
        if (!touch) {
            return;
        }

        this.endPointerContact(event, event.type === "touchcancel" ? "cancel" : "end");
    }

    beginPointerContact(event, pointerId, x, y, pointerType, source = "pointer") {
        event.preventDefault();
        const before = this.digitalHeldState();
        const now = performance.now() / 1000;
        const lastDistance = Math.hypot(x - this.pointer.lastTapX, y - this.pointer.lastTapY);
        if (now - this.pointer.lastTapTime <= POINTER_CONTROL.doubleTapSeconds && lastDistance <= POINTER_CONTROL.doubleTapMaxDistance) {
            this.pointer.weaponPulse = true;
            this.pointer.lastTapTime = -Infinity;
            this.recordPointerEvent("doubleTap", event, pointerType);
        } else {
            this.pointer.lastTapTime = now;
            this.pointer.lastTapX = x;
            this.pointer.lastTapY = y;
        }

        this.pointer.active = true;
        this.pointer.pointerId = pointerId;
        this.pointer.pointerType = pointerType;
        this.pointer.source = source;
        this.pointer.activeTouchId = pointerType === "touch" && source === "touch" ? pointerId : null;
        this.pointer.pointerCancelGraceUntil = 0;
        this.pointer.startX = x;
        this.pointer.startY = y;
        this.pointer.currentX = x;
        this.pointer.currentY = y;
        this.updatePointerStick();
        this.latchDigitalTransitions(before, this.digitalHeldState());
        this.recordPointerEvent("start", event, pointerType);
    }

    movePointerContact(event, x, y) {
        event.preventDefault();
        const before = this.digitalHeldState();
        this.pointer.pointerCancelGraceUntil = 0;
        this.pointer.currentX = x;
        this.pointer.currentY = y;
        this.updatePointerStick();
        this.latchDigitalTransitions(before, this.digitalHeldState());
    }

    endPointerContact(event, kind) {
        event.preventDefault();
        const before = this.digitalHeldState();
        const pointerType = pointerTypeFromEvent(event);
        this.pointer.active = false;
        this.pointer.pointerId = null;
        this.pointer.pointerType = "pointer";
        this.pointer.source = null;
        this.pointer.activeTouchId = null;
        this.pointer.pointerCancelGraceUntil = 0;
        this.pointer.moveAxis = 0;
        this.pointer.jumpHeld = false;
        this.pointer.dropHeld = false;
        this.latchDigitalTransitions(before, this.digitalHeldState());
        this.recordPointerEvent(kind, event, pointerType);
    }

    deferTouchPointerCancel(event) {
        event.preventDefault();
        if (!this.preferNativeTouchEvents) {
            this.endPointerContact(event, "cancel");
            return;
        }
        this.pointer.pointerCancelGraceUntil = performance.now() / 1000 + 0.35;
        this.recordPointerEvent("cancelWait", event, "touch");
    }

    expireDeferredPointerCancel() {
        if (!this.pointer.active || this.pointer.pointerCancelGraceUntil <= 0) {
            return;
        }
        if (performance.now() / 1000 <= this.pointer.pointerCancelGraceUntil) {
            return;
        }
        const before = this.digitalHeldState();
        const pointerType = this.pointer.pointerType;
        this.pointer.active = false;
        this.pointer.pointerId = null;
        this.pointer.pointerType = "pointer";
        this.pointer.source = null;
        this.pointer.activeTouchId = null;
        this.pointer.pointerCancelGraceUntil = 0;
        this.pointer.moveAxis = 0;
        this.pointer.jumpHeld = false;
        this.pointer.dropHeld = false;
        this.latchDigitalTransitions(before, this.digitalHeldState());
        this.recordPointerEvent("cancelTimeout", { type: "pointercancel" }, pointerType);
    }

    findRelevantTouch(touchList) {
        const preferredId = this.pointer.activeTouchId || (String(this.pointer.pointerId).startsWith("touch:") ? this.pointer.pointerId : null);
        if (preferredId) {
            return findChangedTouch(touchList, preferredId);
        }
        return touchList.length === 1 ? touchList[0] : null;
    }

    syncRightMouseWeaponButton(event) {
        if (pointerTypeFromEvent(event) !== "mouse") {
            return false;
        }

        const rightPressedNow = event.button === 2 || ((Number(event.buttons) || 0) & 2) !== 0;
        const rightReleasedNow = event.button === 2 && event.type?.endsWith?.("up");
        if (rightReleasedNow || (!rightPressedNow && event.buttons !== undefined)) {
            this.rightMouseButtonDown = false;
            return false;
        }
        if (!rightPressedNow) {
            return false;
        }
        if (event.target?.closest?.(POINTER_IGNORED_SELECTOR)) {
            return false;
        }

        event.preventDefault();
        if (!this.rightMouseButtonDown) {
            this.pendingGameplayEdges.weaponPressed = true;
            this.recordPointerEvent("rightClickWeapon", event, "mouse");
        }
        this.rightMouseButtonDown = true;
        return event.button === 2;
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
        const dropHeld = dy > POINTER_CONTROL.dropThreshold;
        if (dropHeld && !this.pointer.dropHeld) {
            this.pointer.dropPulse = true;
        }
        this.pointer.dropHeld = dropHeld;
    }

    suppressJumpUntilRelease() {
        this.jumpSuppressedUntilRelease = true;
        this.pendingGameplayEdges.jumpPressed = false;
        this.pendingGameplayEdges.jumpReleased = false;
    }

    clear() {
        this.keys.clear();
        this.pointer.active = false;
        this.pointer.pointerId = null;
        this.pointer.pointerType = "pointer";
        this.pointer.source = null;
        this.pointer.activeTouchId = null;
        this.pointer.pointerCancelGraceUntil = 0;
        this.pointer.moveAxis = 0;
        this.pointer.jumpHeld = false;
        this.pointer.dropHeld = false;
        this.pointer.dropPulse = false;
        this.pointer.weaponPulse = false;
        this.rightMouseButtonDown = false;
        this.gamepad = createEmptyGamepadState();
        this.pendingGameplayEdges = createPendingGameplayEdges();
        this.pendingBindingPresses = [];
        this.pendingPausePressed = false;
        this.debugPressed = createDebugPressed();
        this.lastInputDevice = "none";
        this.activeGamepadIndex = null;
        this.lastGamepadActivityAt = Number.NEGATIVE_INFINITY;
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

    recordPointerEvent(kind, event, pointerType = pointerTypeFromEvent(event)) {
        const entry = {
            time: Number((performance.now() / 1000).toFixed(3)),
            kind: `pointer:${kind}`,
            code: pointerType,
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

    setInputBindings(inputBindings) {
        const before = this.digitalHeldState();
        this.inputBindings = normalizeInputBindings(inputBindings);
        this.latchDigitalTransitions(before, this.digitalHeldState());
    }

    getInputBindings() {
        return normalizeInputBindings(this.inputBindings);
    }

    clearPendingBindingPresses() {
        this.pendingBindingPresses = [];
    }

    takeBindingPress() {
        return this.pendingBindingPresses.shift() || "";
    }

    queueBindingPress(binding) {
        if (!binding || this.pendingBindingPresses.includes(binding)) return;
        this.pendingBindingPresses.push(binding);
        while (this.pendingBindingPresses.length > 24) this.pendingBindingPresses.shift();
    }

    isGameplayKey(code) {
        const token = `keyboard:${code}`;
        return Object.values(this.inputBindings).some((bindings) => bindings.includes(token));
    }

    actionHeld(actionId, gamepad = this.gamepad) {
        const bindings = this.inputBindings?.[actionId] || [];
        return bindings.some((binding) => {
            if (binding.startsWith("keyboard:")) return this.keys.has(binding.slice("keyboard:".length));
            if (binding.startsWith("gamepad:")) return Boolean(gamepad?.heldBindings?.has?.(binding));
            return false;
        });
    }

    directionalHeld(gamepad = this.gamepad) {
        const upLeft = this.actionHeld("upLeft", gamepad);
        const upRight = this.actionHeld("upRight", gamepad);
        const downLeft = this.actionHeld("downLeft", gamepad);
        const downRight = this.actionHeld("downRight", gamepad);
        return {
            up: this.actionHeld("up", gamepad) || upLeft || upRight,
            down: this.actionHeld("down", gamepad) || downLeft || downRight,
            left: this.actionHeld("left", gamepad) || upLeft || downLeft,
            right: this.actionHeld("right", gamepad) || upRight || downRight
        };
    }

    digitalHeldState(gamepad = this.gamepad) {
        const directions = this.directionalHeld(gamepad);
        const dropHeld = directions.down || Boolean(gamepad?.analogDown) || this.pointer.dropHeld || this.pointer.dropPulse;
        return {
            jumpHeld: directions.up || Boolean(gamepad?.analogUp) || this.pointer.jumpHeld,
            boostHeld: false,
            lungeHeld: this.actionHeld("lunge", gamepad),
            weaponHeld: this.actionHeld("fire", gamepad) || this.pointer.weaponPulse,
            interactHeld: dropHeld,
            dropHeld,
            pauseHeld: this.actionHeld("pause", gamepad)
        };
    }

    latchDigitalTransitions(before, after) {
        for (const action of GAMEPLAY_DIGITAL_ACTIONS) {
            const wasHeld = Boolean(before?.[action.held]);
            const isHeld = Boolean(after?.[action.held]);
            if (!wasHeld && isHeld) {
                this.pendingGameplayEdges[action.pressed] = true;
            }
            if (wasHeld && !isHeld) {
                this.pendingGameplayEdges[action.released] = true;
            }
        }
        if (!before?.pauseHeld && after?.pauseHeld) this.pendingPausePressed = true;
    }

    consumeGameplayEdges(inputFrame = null) {
        for (const action of GAMEPLAY_DIGITAL_ACTIONS) {
            for (const field of [action.pressed, action.released]) {
                if (!inputFrame || inputFrame[field]) {
                    this.pendingGameplayEdges[field] = false;
                }
            }
        }
    }

    sample({ consumeGameplayEdges = true } = {}) {
        this.expireDeferredPointerCancel();
        const sampleTime = inputNowSeconds();
        const beforeGamepad = this.digitalHeldState();
        const gamepad = readGamepad(this.activeGamepadIndex, this.gamepad);
        this.gamepad = gamepad;
        const heldState = this.digitalHeldState();
        this.latchDigitalTransitions(beforeGamepad, heldState);
        for (const binding of gamepad.freshBindings || []) this.queueBindingPress(binding);
        const directions = this.directionalHeld(gamepad);
        const keyboardMoveAxis = (directions.right ? 1 : 0) - (directions.left ? 1 : 0);
        const moveAxis = clamp(keyboardMoveAxis + gamepad.moveAxis + this.pointer.moveAxis, -1, 1);
        const pointerWeaponPulse = this.pointer.weaponPulse;
        const keyboardActive = [...this.keys].some((code) => this.isGameplayKey(code));
        const pointerActive = Boolean(
            pointerWeaponPulse ||
            (this.pointer.active && (
                Math.abs(this.pointer.moveAxis) > 0.001 ||
                this.pointer.jumpHeld ||
                this.pointer.dropHeld
            ))
        );

        if (gamepad.active) {
            this.lastInputDevice = "gamepad";
            this.activeGamepadIndex = gamepad.index;
            this.lastGamepadActivityAt = sampleTime;
        } else if (keyboardActive) {
            this.lastInputDevice = "keyboard";
        } else if (pointerActive) {
            this.lastInputDevice = "pointer";
        }

        const gamepadActive = Boolean(
            this.lastInputDevice === "gamepad" &&
            gamepad.connected &&
            gamepad.index === this.activeGamepadIndex &&
            sampleTime - this.lastGamepadActivityAt <= GAMEPAD_ACTIVITY_TIMEOUT_SECONDS
        );
        const current = createInputFrame({
            moveLeft: directions.left || gamepad.moveAxis < -0.35 || moveAxis < -0.35,
            moveRight: directions.right || gamepad.moveAxis > 0.35 || moveAxis > 0.35,
            moveAxis,
            ...heldState,
            aimVector: gamepad.aimVector || pointerAimVector(this.pointer) || { x: 1, y: 0 },
            inputDevice: this.lastInputDevice,
            gamepadActive,
            gamepadIndex: gamepadActive ? gamepad.index : null
        });

        for (const action of GAMEPLAY_DIGITAL_ACTIONS) {
            current[action.pressed] = Boolean(this.pendingGameplayEdges[action.pressed]);
            current[action.released] = Boolean(this.pendingGameplayEdges[action.released]);
        }

        const beforePulseClear = this.digitalHeldState();
        this.pointer.weaponPulse = false;
        this.pointer.dropPulse = false;
        this.latchDigitalTransitions(beforePulseClear, this.digitalHeldState());
        current.pausePressed = this.pendingPausePressed;
        this.pendingPausePressed = false;
        current.debugPausePressed = take(this.debugPressed, "pause");
        current.stepPressed = take(this.debugPressed, "step");
        current.resetPressed = take(this.debugPressed, "reset");
        current.toggleHitboxesPressed = take(this.debugPressed, "hitboxes");
        current.toggleVelocityPressed = take(this.debugPressed, "velocity");
        current.toggleCollisionPressed = take(this.debugPressed, "collision");
        current.exportStatePressed = take(this.debugPressed, "exportState");
        current.toggleInputConsoleLogPressed = take(this.debugPressed, "inputConsoleLog");
        current.toggleDebugPanelPressed = take(this.debugPressed, "debugPanel");

        if (this.jumpSuppressedUntilRelease) {
            const stillHeld = current.jumpHeld;
            current.jumpHeld = false;
            current.jumpPressed = false;
            current.jumpReleased = false;
            this.pendingGameplayEdges.jumpPressed = false;
            this.pendingGameplayEdges.jumpReleased = false;
            if (!stillHeld) {
                this.jumpSuppressedUntilRelease = false;
            }
        }

        if (consumeGameplayEdges) {
            this.consumeGameplayEdges(current);
        }
        return current;
    }
}

function supportsPointerEvents() {
    return typeof window !== "undefined" && "PointerEvent" in window;
}

function supportsTouchEvents() {
    if (typeof window === "undefined") {
        return false;
    }
    const maxTouchPoints = typeof navigator !== "undefined" ? navigator.maxTouchPoints || 0 : 0;
    return "TouchEvent" in window || "ontouchstart" in window || maxTouchPoints > 0;
}

function touchId(touch) {
    return `touch:${touch.identifier}`;
}

function findChangedTouch(touchList, pointerId) {
    for (const touch of touchList) {
        if (touchId(touch) === pointerId) {
            return touch;
        }
    }
    return null;
}

function pointerTypeFromEvent(event) {
    if (event.pointerType) {
        return event.pointerType;
    }
    if (event.type?.startsWith?.("touch")) {
        return "touch";
    }
    if (event.type?.startsWith?.("mouse")) {
        return "mouse";
    }
    return "pointer";
}

function createDebugPressed() {
    return {
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
}

function createPendingGameplayEdges() {
    const edges = {};
    for (const action of GAMEPLAY_DIGITAL_ACTIONS) {
        edges[action.pressed] = false;
        edges[action.released] = false;
    }
    return edges;
}

function createPointerState() {
    return {
        active: false,
        pointerId: null,
        pointerType: "pointer",
        source: null,
        activeTouchId: null,
        pointerCancelGraceUntil: 0,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        moveAxis: 0,
        jumpHeld: false,
        dropHeld: false,
        dropPulse: false,
        weaponPulse: false,
        lastTapTime: -Infinity,
        lastTapX: 0,
        lastTapY: 0
    };
}

function take(object, key) {
    const value = Boolean(object[key]);
    object[key] = false;
    return value;
}

function gamepadButtonHeld(button) {
    return Boolean(button?.pressed || Number(button?.value) > 0.25);
}

function gamepadBindingToken(index) {
    const name = GAMEPAD_BUTTON_NAMES[index];
    return `gamepad:${name || `button${index}`}`;
}

function createEmptyGamepadState() {
    return {
        connected: false,
        index: null,
        active: false,
        moveAxis: 0,
        analogUp: false,
        analogDown: false,
        heldBindings: new Set(),
        freshBindings: [],
        aimVector: null
    };
}

function readGamepad(preferredIndex = null, previousGamepad = null) {
    const empty = createEmptyGamepadState();

    if (typeof navigator === "undefined" || !navigator.getGamepads) {
        return empty;
    }

    const pads = Array.from(navigator.getGamepads() || []);
    const candidates = pads
        .map((pad, index) => ({ pad, index }))
        .filter((entry) => Boolean(entry.pad));
    if (!candidates.length) {
        return empty;
    }

    const inspected = candidates.map(({ pad, index }) => {
        const lx = Number(pad.axes?.[0]) || 0;
        const ly = Number(pad.axes?.[1]) || 0;
        const moveAxis = Math.abs(lx) > 0.16 ? lx : 0;
        const heldBindings = new Set();
        for (let buttonIndex = 0; buttonIndex < (pad.buttons?.length || 0); buttonIndex += 1) {
            if (gamepadButtonHeld(pad.buttons[buttonIndex])) heldBindings.add(gamepadBindingToken(buttonIndex));
        }
        const resolvedIndex = Number.isInteger(pad.index) ? pad.index : index;
        const previousHeld = previousGamepad?.index === resolvedIndex ? previousGamepad.heldBindings : new Set();
        const freshBindings = [...heldBindings].filter((binding) => !previousHeld.has(binding));
        const analogUp = ly < -0.55;
        const analogDown = ly > 0.55;
        const aimVector = Math.hypot(lx, ly) > 0.25 ? normalize({ x: lx, y: ly }) : null;
        const active = Boolean(
            Math.abs(moveAxis) > 0 || analogUp || analogDown || heldBindings.size > 0 || Math.hypot(lx, ly) > 0.25
        );
        return {
            connected: true,
            index: resolvedIndex,
            active,
            moveAxis,
            analogUp,
            analogDown,
            heldBindings,
            freshBindings,
            aimVector
        };
    });

    return inspected.find((entry) => entry.active) ||
        inspected.find((entry) => entry.index === preferredIndex) ||
        inspected[0];
}

function inputNowSeconds() {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
        return performance.now() / 1000;
    }
    return Date.now() / 1000;
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
