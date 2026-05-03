import { createGameState, advanceGameState } from './core/game/state.js';
import { createInputController } from './core/game/input.js';
import { createFixedStepAccumulator } from './core/sim/fixedStep.js';
import { createGameTextures, disposeTextures } from './core/render/textures.js';
import { createWorldRenderer } from './core/render/webglRenderer.js';
import { drawHud } from './core/render/hud.js';

const worldCanvas = document.getElementById('world');
const hudCanvas = document.getElementById('hud');
const overlayState = document.getElementById('overlay-state');
const errorPanel = document.getElementById('error');

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
    lookYaw: 0,
    lookPitch: 0,
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
  const gl = worldCanvas.getContext('webgl', {
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

  const textures = createGameTextures(gl, seed);
  const worldRenderer = createWorldRenderer(worldCanvas, textures, { gl });
  let state = createGameState({ seed, levelId });
  const input = createInputController(worldCanvas);
  const hudCtx = hudCanvas.getContext('2d', { alpha: true });
  const accumulator = createFixedStepAccumulator(16);
  let lastTime = performance.now();

  function updateOverlay() {
    const lockState = document.pointerLockElement === worldCanvas ? 'Pointer locked' : 'Click to lock the mouse';
    overlayState.textContent = `${lockState} | ${state.level.name} | seed ${state.seed}`;
  }

  function restartGame() {
    state = createGameState({ seed, levelId });
    accumulator.reset();
    lastTime = performance.now();
    overlayState.textContent = `${state.level.name} restarted`;
  }

  function renderHud() {
    hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
    drawHud(hudCtx, state, hudCanvas.width, hudCanvas.height);
  }

  function frame(now) {
    const deltaMs = Math.min(100, now - lastTime);
    lastTime = now;
    resizeCanvasPair();

    const frameInput = input.sampleFrameInput();
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

    worldRenderer.render(state);
    renderHud();
    updateOverlay();
    requestAnimationFrame(frame);
  }

  worldCanvas.addEventListener('click', () => {
    if (document.pointerLockElement !== worldCanvas) {
      worldCanvas.requestPointerLock();
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
    restart: restartGame
  };

  resizeCanvasPair();
  updateOverlay();
  requestAnimationFrame(frame);
}

main().catch(showError);
