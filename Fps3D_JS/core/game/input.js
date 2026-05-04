const KEY_WEAPON_MAP = {
  Digit1: 0,
  Digit2: 1,
  Digit3: 2,
  Digit4: 3,
  Digit5: 4,
  Digit6: 5,
  Digit7: 6
};

const GAMEPAD_DEADZONE = 0.18;
const GAMEPAD_LOOK_SPEED = 14;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isEditableTarget(target) {
  if (!target) {
    return false;
  }

  const tag = target.tagName ? target.tagName.toLowerCase() : '';
  return tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'button' || target.isContentEditable;
}

function isGamepadButtonPressed(button) {
  if (!button) {
    return false;
  }

  if (typeof button === 'boolean') {
    return button;
  }

  if (typeof button === 'number') {
    return button >= 0.5;
  }

  if (typeof button === 'object') {
    if (typeof button.pressed === 'boolean') {
      return button.pressed;
    }

    if (Number.isFinite(button.value)) {
      return button.value >= 0.5;
    }
  }

  return false;
}

function getNavigatorGamepads() {
  if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') {
    return [];
  }

  const gamepads = navigator.getGamepads();
  return Array.from(gamepads || []);
}

function getFirstConnectedGamepad() {
  for (const gamepad of getNavigatorGamepads()) {
    if (gamepad && gamepad.connected) {
      return gamepad;
    }
  }

  return null;
}

export function normalizeGamepadAxis(value, deadzone = GAMEPAD_DEADZONE) {
  const numeric = Number(value) || 0;
  const magnitude = Math.abs(numeric);

  if (magnitude <= deadzone) {
    return 0;
  }

  const scaled = (magnitude - deadzone) / (1 - deadzone);
  return clamp(Math.sign(numeric) * scaled, -1, 1);
}

export function sampleGamepadInput(gamepad, previousButtons = [], options = {}) {
  if (!gamepad || !gamepad.connected) {
    return {
      connected: false,
      index: null,
      id: null,
      moveForward: 0,
      moveStrafe: 0,
      lookYaw: 0,
      lookPitch: 0,
      fire: false,
      altFire: false,
      use: false,
      sprint: false,
      pause: false,
      nextWeapon: false,
      prevWeapon: false,
      restart: false,
      buttons: []
    };
  }

  const axes = Array.from(gamepad.axes || []);
  const buttons = Array.from(gamepad.buttons || [], (button) => isGamepadButtonPressed(button));
  const previous = Array.isArray(previousButtons) ? previousButtons : [];
  const invertGamepadY = !!options.invertGamepadY;
  const dpadForward = (buttons[12] ? 1 : 0) + (buttons[13] ? -1 : 0);
  const dpadStrafe = (buttons[15] ? 1 : 0) + (buttons[14] ? -1 : 0);
  const moveForward = clamp(-normalizeGamepadAxis(axes[1] ?? 0) + dpadForward, -1, 1);
  const moveStrafe = clamp(normalizeGamepadAxis(axes[0] ?? 0) + dpadStrafe, -1, 1);
  const lookYaw = normalizeGamepadAxis(axes[2] ?? 0) * GAMEPAD_LOOK_SPEED;
  const lookPitch = normalizeGamepadAxis(axes[3] ?? 0) * GAMEPAD_LOOK_SPEED * (invertGamepadY ? 1 : -1);

  function justPressed(index) {
    return !!buttons[index] && !previous[index];
  }

  return {
    connected: true,
    index: Number.isInteger(gamepad.index) ? gamepad.index : null,
    id: typeof gamepad.id === 'string' ? gamepad.id : null,
    moveForward,
    moveStrafe,
    lookYaw,
    lookPitch,
    fire: !!buttons[7],
    altFire: !!buttons[6],
    use: justPressed(0),
    sprint: !!buttons[10],
    pause: justPressed(9),
    nextWeapon: justPressed(5),
    prevWeapon: justPressed(4),
    restart: justPressed(8),
    buttons
  };
}

export function createInputController(targetElement = window, options = {}) {
  const keyState = new Set();
  const pointerState = {
    mouseDX: 0,
    mouseDY: 0,
    fire: false,
    altFire: false,
    use: false,
    sprint: false,
    pause: false,
    nextWeapon: false,
    prevWeapon: false,
    weaponIndex: null,
    restart: false
  };
  const gamepadState = {
    connected: false,
    id: null,
    index: null,
    buttons: []
  };
  const getSettings = typeof options.getSettings === 'function'
    ? options.getSettings
    : () => options.settings || {};

  function onKeyDown(event) {
    if (isEditableTarget(event.target)) {
      return;
    }

    if (event.repeat) {
      return;
    }

    keyState.add(event.code);

    if (event.code in KEY_WEAPON_MAP) {
      pointerState.weaponIndex = KEY_WEAPON_MAP[event.code];
    } else if (event.code === 'KeyE') {
      pointerState.use = true;
    } else if (event.code === 'KeyR') {
      pointerState.restart = true;
    } else if (event.code === 'Escape') {
      pointerState.pause = true;
    }
  }

  function onKeyUp(event) {
    keyState.delete(event.code);
  }

  function onMouseMove(event) {
    if (document.pointerLockElement !== targetElement && document.pointerLockElement !== document.body) {
      return;
    }
    pointerState.mouseDX += event.movementX || 0;
    pointerState.mouseDY += event.movementY || 0;
  }

  function onMouseDown(event) {
    if (event.button === 0) {
      pointerState.fire = true;
    } else if (event.button === 2) {
      pointerState.altFire = true;
    }
  }

  function onMouseUp(event) {
    if (event.button === 0) {
      pointerState.fire = false;
    } else if (event.button === 2) {
      pointerState.altFire = false;
    }
  }

  function onWheel(event) {
    if (event.deltaY > 0) {
      pointerState.nextWeapon = true;
    } else if (event.deltaY < 0) {
      pointerState.prevWeapon = true;
    }
  }

  function onContextMenu(event) {
    event.preventDefault();
  }

  function sampleActiveGamepad() {
    const gamepad = getFirstConnectedGamepad();
    if (!gamepad) {
      gamepadState.connected = false;
      gamepadState.id = null;
      gamepadState.index = null;
      gamepadState.buttons = [];
      return null;
    }

    if (gamepadState.index !== gamepad.index || gamepadState.id !== gamepad.id) {
      gamepadState.buttons = [];
    }

    const settings = getSettings() || {};
    const snapshot = sampleGamepadInput(gamepad, gamepadState.buttons, {
      invertGamepadY: !!settings.invertGamepadY
    });
    gamepadState.connected = snapshot.connected;
    gamepadState.id = snapshot.id;
    gamepadState.index = snapshot.index;
    gamepadState.buttons = snapshot.buttons;
    return snapshot;
  }

  function sampleFrameInput() {
    const gamepad = sampleActiveGamepad();
    const keyForward = (keyState.has('KeyW') || keyState.has('ArrowUp') ? 1 : 0) + (keyState.has('KeyS') || keyState.has('ArrowDown') ? -1 : 0);
    const keyStrafe = (keyState.has('KeyD') || keyState.has('ArrowRight') ? 1 : 0) + (keyState.has('KeyA') || keyState.has('ArrowLeft') ? -1 : 0);
    const keyboardSprint = keyState.has('ShiftLeft') || keyState.has('ShiftRight');
    const mouseLookYaw = pointerState.mouseDX;
    const mouseLookPitch = -pointerState.mouseDY;
    const gamepadLookYaw = gamepad ? gamepad.lookYaw : 0;
    const gamepadLookPitch = gamepad ? gamepad.lookPitch : 0;

    const input = {
      moveForward: clamp(keyForward + (gamepad ? gamepad.moveForward : 0), -1, 1),
      moveStrafe: clamp(keyStrafe + (gamepad ? gamepad.moveStrafe : 0), -1, 1),
      lookYaw: mouseLookYaw + gamepadLookYaw,
      lookPitch: mouseLookPitch + gamepadLookPitch,
      mouseLookYaw,
      mouseLookPitch,
      gamepadLookYaw,
      gamepadLookPitch,
      fire: pointerState.fire || !!(gamepad && gamepad.fire),
      altFire: pointerState.altFire || !!(gamepad && gamepad.altFire),
      use: pointerState.use || !!(gamepad && gamepad.use),
      sprint: keyboardSprint || !!(gamepad && gamepad.sprint),
      pause: pointerState.pause || !!(gamepad && gamepad.pause),
      weaponIndex: pointerState.weaponIndex,
      nextWeapon: pointerState.nextWeapon || !!(gamepad && gamepad.nextWeapon),
      prevWeapon: pointerState.prevWeapon || !!(gamepad && gamepad.prevWeapon),
      restart: pointerState.restart || !!(gamepad && gamepad.restart),
      gamepadConnected: !!(gamepad && gamepad.connected),
      gamepadName: gamepad && gamepad.id ? gamepad.id : null
    };

    pointerState.mouseDX = 0;
    pointerState.mouseDY = 0;
    pointerState.use = false;
    pointerState.pause = false;
    pointerState.nextWeapon = false;
    pointerState.prevWeapon = false;
    pointerState.weaponIndex = null;
    pointerState.restart = false;

    return input;
  }

  targetElement.addEventListener('mousemove', onMouseMove);
  targetElement.addEventListener('mousedown', onMouseDown);
  targetElement.addEventListener('mouseup', onMouseUp);
  targetElement.addEventListener('wheel', onWheel, { passive: true });
  targetElement.addEventListener('contextmenu', onContextMenu);
  window.addEventListener('keydown', onKeyDown, { passive: false });
  window.addEventListener('keyup', onKeyUp);

  function dispose() {
    targetElement.removeEventListener('mousemove', onMouseMove);
    targetElement.removeEventListener('mousedown', onMouseDown);
    targetElement.removeEventListener('mouseup', onMouseUp);
    targetElement.removeEventListener('wheel', onWheel);
    targetElement.removeEventListener('contextmenu', onContextMenu);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  }

  return {
    sampleFrameInput,
    dispose,
    get pauseRequested() {
      return pointerState.pause;
    },
    getGamepadStatus() {
      return {
        connected: gamepadState.connected,
        id: gamepadState.id,
        index: gamepadState.index
      };
    }
  };
}
