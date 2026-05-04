import { createGameState, advanceGameState, applyDifficultyToState, DIFFICULTY_ORDER, getDifficultyConfig, normalizeDifficultyId } from './core/game/state.js';
import { createInputController } from './core/game/input.js';
import { createFixedStepAccumulator, normalizeElapsedMs } from './core/sim/fixedStep.js';
import { createGameTextures, disposeTextures } from './core/render/textures.js';
import { createWorldRenderer } from './core/render/webglRenderer.js';
import { drawHud } from './core/render/hud.js';

const worldCanvas = document.getElementById('world');
const hudCanvas = document.getElementById('hud');
const overlayState = document.getElementById('overlay-state');
const menuToggle = document.getElementById('menu-toggle');
const settingsBackdrop = document.getElementById('settings-backdrop');
const invertGamepadYInput = document.getElementById('invert-gamepad-y');
const difficultySelect = document.getElementById('difficulty-select');
const restartButton = document.getElementById('restart-game');
const closeMenuButton = document.getElementById('close-menu');
const errorPanel = document.getElementById('error');

const SETTINGS_STORAGE_KEY = 'fps3d.settings.v1';
const DEFAULT_SETTINGS = {
  invertGamepadY: false,
  difficultyId: 'invulnerable'
};

function normalizeSettings(value) {
  return {
    invertGamepadY: !!value?.invertGamepadY,
    difficultyId: normalizeDifficultyId(value?.difficultyId)
  };
}

function loadSettings() {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }

    return normalizeSettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage failures in privacy mode or unsupported browsers.
  }
}

function showError(error) {
  errorPanel.style.display = 'grid';
  errorPanel.textContent = error && error.stack ? error.stack : String(error);
}

function parseSeedFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('seed') || 'fps3d-alpha01';
}

function parseLevelFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('level') || 'alpha01';
}

function cloneFrameInput(input) {
  return {
    moveForward: input.moveForward,
    moveStrafe: input.moveStrafe,
    lookYaw: input.gamepadLookYaw ?? 0,
    lookPitch: input.gamepadLookPitch ?? 0,
    mouseLookYaw: 0,
    mouseLookPitch: 0,
    gamepadLookYaw: input.gamepadLookYaw ?? 0,
    gamepadLookPitch: input.gamepadLookPitch ?? 0,
    fire: input.fire,
    altFire: input.altFire,
    use: false,
    sprint: input.sprint,
    pause: false,
    weaponIndex: null,
    nextWeapon: false,
    prevWeapon: false,
    restart: false
  };
}

function resizeCanvasPair() {
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.floor(window.innerWidth * dpr));
  const height = Math.max(1, Math.floor(window.innerHeight * dpr));

  if (worldCanvas.width !== width || worldCanvas.height !== height) {
    worldCanvas.width = width;
    worldCanvas.height = height;
  }

  if (hudCanvas.width !== width || hudCanvas.height !== height) {
    hudCanvas.width = width;
    hudCanvas.height = height;
  }
}

async function main() {
  const seed = parseSeedFromUrl();
  const levelId = parseLevelFromUrl();
  let gl = worldCanvas.getContext('webgl', {
    alpha: false,
    antialias: true,
    depth: true,
    stencil: false,
    preserveDrawingBuffer: false,
    premultipliedAlpha: false
  });

  if (!gl) {
    throw new Error('WebGL is not supported');
  }

  let textures = createGameTextures(gl, seed);
  let worldRenderer = createWorldRenderer(worldCanvas, textures, { gl });
  let settings = loadSettings();
  let state = createGameState({ seed, levelId, difficulty: settings.difficultyId });
  const input = createInputController(worldCanvas, {
    getSettings: () => settings
  });
  const hudCtx = hudCanvas.getContext('2d', { alpha: true });
  const accumulator = createFixedStepAccumulator(16);
  let lastTime = null;
  let menuOpen = false;
  let menuPauseBeforeOpen = false;
  let graphicsReady = true;

  function rebuildGraphics() {
    textures = createGameTextures(gl, seed);
    worldRenderer = createWorldRenderer(worldCanvas, textures, { gl });
    graphicsReady = true;
    accumulator.reset();
    lastTime = null;
    updateOverlay();
  }

  function populateDifficultySelect() {
    const fragment = document.createDocumentFragment();

    for (const difficultyId of DIFFICULTY_ORDER) {
      const option = document.createElement('option');
      option.value = difficultyId;
      option.textContent = getDifficultyConfig(difficultyId).label;
      fragment.append(option);
    }

    difficultySelect.replaceChildren(fragment);
  }

  function syncSettingsUI() {
    invertGamepadYInput.checked = settings.invertGamepadY;
    difficultySelect.value = settings.difficultyId;
  }

  function updateMenuVisibility() {
    settingsBackdrop.hidden = !menuOpen;
    menuToggle.textContent = menuOpen ? 'Close' : 'Menu';
    menuToggle.setAttribute('aria-expanded', String(menuOpen));
  }

  function updateOverlay() {
    const lockState = document.pointerLockElement === worldCanvas ? 'Pointer locked' : 'Click to lock the mouse';
    const gamepadStatus = input.getGamepadStatus();
    const gamepadLabel = gamepadStatus.connected ? ` | gamepad ${gamepadStatus.id || 'connected'}` : '';
    const difficultyLabel = getDifficultyConfig(state.difficultyId).label;
    const menuLabel = menuOpen ? ' | menu open' : '';
    const pausedLabel = state.paused && !menuOpen ? ' | paused' : '';
    const graphicsLabel = graphicsReady ? '' : ' | graphics recovering';
    overlayState.textContent = `${lockState} | ${state.level.name} | ${difficultyLabel} | seed ${state.seed}${pausedLabel}${menuLabel}${graphicsLabel}${gamepadLabel}`;
  }

  function restartGame() {
    state = createGameState({ seed, levelId, difficulty: settings.difficultyId });
    accumulator.reset();
    lastTime = null;
    updateOverlay();
  }

  function setDifficulty(difficultyId) {
    const normalized = normalizeDifficultyId(difficultyId);
    if (settings.difficultyId === normalized) {
      return;
    }

    settings = {
      ...settings,
      difficultyId: normalized
    };
    saveSettings(settings);
    applyDifficultyToState(state, normalized);
    syncSettingsUI();
    updateOverlay();
  }

  function setInvertGamepadY(enabled) {
    const next = !!enabled;
    if (settings.invertGamepadY === next) {
      return;
    }

    settings = {
      ...settings,
      invertGamepadY: next
    };
    saveSettings(settings);
    syncSettingsUI();
    updateOverlay();
  }

  function openMenu() {
    if (menuOpen) {
      return;
    }

    menuPauseBeforeOpen = state.paused;
    menuOpen = true;
    state.paused = true;
    syncSettingsUI();
    updateMenuVisibility();
    updateOverlay();

    if (document.pointerLockElement === worldCanvas && typeof document.exitPointerLock === 'function') {
      document.exitPointerLock();
    }

    invertGamepadYInput.focus();
  }

  function closeMenu(restorePause = true) {
    if (!menuOpen) {
      return;
    }

    menuOpen = false;
    state.paused = restorePause ? menuPauseBeforeOpen : false;
    menuPauseBeforeOpen = false;
    updateMenuVisibility();
    updateOverlay();
  }

  function renderHud() {
    hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
    drawHud(hudCtx, state, hudCanvas.width, hudCanvas.height);
  }

  worldCanvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    graphicsReady = false;
    updateOverlay();
  });

  worldCanvas.addEventListener('webglcontextrestored', () => {
    rebuildGraphics();
  });

  function frame(now) {
    const safeNow = Number.isFinite(now) ? now : performance.now();
    const deltaMs = lastTime === null ? 0 : normalizeElapsedMs(safeNow - lastTime, 100);
    lastTime = safeNow;
    resizeCanvasPair();

    const frameInput = input.sampleFrameInput();

    if (!menuOpen) {
      let steps = accumulator.add(deltaMs);
      let stepInput = frameInput;

      while (steps > 0) {
        advanceGameState(state, stepInput, accumulator.stepMs);
        if (state.requestRestart) {
          restartGame();
          state.requestRestart = false;
          break;
        }
        steps -= 1;
        stepInput = cloneFrameInput(stepInput);
      }
    } else {
      accumulator.reset();
    }

    if (graphicsReady) {
      worldRenderer.render(state);
    }
    renderHud();
    updateOverlay();
    requestAnimationFrame(frame);
  }

  worldCanvas.addEventListener('click', () => {
    if (menuOpen) {
      return;
    }

    if (document.pointerLockElement !== worldCanvas) {
      worldCanvas.requestPointerLock();
    }
  });

  menuToggle.addEventListener('click', () => {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  closeMenuButton.addEventListener('click', () => {
    closeMenu();
  });

  restartButton.addEventListener('click', () => {
    restartGame();
    closeMenu(false);
  });

  invertGamepadYInput.addEventListener('change', () => {
    setInvertGamepadY(invertGamepadYInput.checked);
  });

  difficultySelect.addEventListener('change', () => {
    setDifficulty(difficultySelect.value);
  });

  settingsBackdrop.addEventListener('click', (event) => {
    if (event.target === settingsBackdrop) {
      closeMenu();
    }
  });

  document.addEventListener('pointerlockchange', updateOverlay);
  window.addEventListener('resize', resizeCanvasPair);
  window.addEventListener('beforeunload', () => {
    input.dispose();
    worldRenderer.dispose();
    disposeTextures(gl, textures);
  });

  window.__fps3d = {
    getState: () => state,
    getSettings: () => ({ ...settings }),
    restart: restartGame,
    openMenu,
    closeMenu
  };

  populateDifficultySelect();
  syncSettingsUI();
  updateMenuVisibility();
  resizeCanvasPair();
  updateOverlay();
  requestAnimationFrame(frame);
}

main().catch(showError);
