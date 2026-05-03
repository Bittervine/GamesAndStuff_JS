const KEY_WEAPON_MAP = {
  Digit1: 0,
  Digit2: 1,
  Digit3: 2,
  Digit4: 3,
  Digit5: 4,
  Digit6: 5,
  Digit7: 6
};

function isEditableTarget(target) {
  if (!target) {
    return false;
  }

  const tag = target.tagName ? target.tagName.toLowerCase() : '';
  return tag === 'input' || tag === 'textarea' || target.isContentEditable;
}

export function createInputController(targetElement = window) {
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

  function sampleFrameInput() {
    const input = {
      moveForward: (keyState.has('KeyW') || keyState.has('ArrowUp') ? 1 : 0) + (keyState.has('KeyS') || keyState.has('ArrowDown') ? -1 : 0),
      moveStrafe: (keyState.has('KeyD') || keyState.has('ArrowRight') ? 1 : 0) + (keyState.has('KeyA') || keyState.has('ArrowLeft') ? -1 : 0),
      lookYaw: pointerState.mouseDX,
      lookPitch: -pointerState.mouseDY,
      fire: pointerState.fire,
      altFire: pointerState.altFire,
      use: pointerState.use,
      sprint: keyState.has('ShiftLeft') || keyState.has('ShiftRight'),
      pause: pointerState.pause,
      weaponIndex: pointerState.weaponIndex,
      nextWeapon: pointerState.nextWeapon,
      prevWeapon: pointerState.prevWeapon,
      restart: pointerState.restart
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
    }
  };
}
