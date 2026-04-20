# ShotEmUp3D_JS Implementation Plan

Last updated: 2026-04-20

## Goal

Convert the game to a pure 2D default path first, polish the 2D ship effects, then reintroduce Three.js ship rendering as an optional on-demand feature that never loads at startup.

## Current Status

- Phase 1 planning: complete
- Phase 2 implementation: pending
- Phase 3 implementation: pending

## How To Keep This Updated

- Mark each checklist item as completed when the code lands.
- Add short notes under `Progress Log` when a milestone changes behavior.
- Keep the `Current Status` section accurate so another agent can resume quickly.

## Phase 1: Make The Game Pure 2D By Default

### HTML cleanup

- [ ] Remove the Three.js import map if 3D is fully dropped from the default page.
- [ ] Remove extra canvases: `player3d`, `enginefx`, `cloud3d`, `damagefx`.
- [ ] Remove CSS rules for those canvases.
- [ ] Remove the `Load advanced 3D ship model` setting from the UI.
- [ ] Remove the `window.__ShotEmUp3D` bootstrap.
- [ ] Remove the module script that imports Three.js, creates the 3D renderer, draws overlays, and runs its own animation loop.
- [ ] Keep only the main game canvas, HUD canvas, controls, settings dialog, manual button, and `ShotEmUp_JS.js` loader.

### Main renderer cleanup

- [ ] Remove `loadAdvanced3DShipModel` settings, UI sync, saving, event listeners, and `setAdvancedShipLoading()`.
- [ ] Remove all `window.__ShotEmUp3D` bridge logic.
- [ ] Update `setLowEndMode()` so it no longer touches any 3D bridge.
- [ ] Change `drawPlayer()` so the player ship is drawn by the main renderer from `assets/players_spaceship.png`.
- [ ] Add a small player texture loader using `render.textures` and `createTextureFromCanvas()`.
- [ ] Recreate engine flames, shield glow, and damage sparks as cheap main-renderer sprites and glows.
- [ ] Keep starfield, PNG enemies, PNG bosses, weapons, pickups, HUD, settings, and gameplay behavior intact.

### Visual polish

- [ ] Make the 2D engine flames look intentional and good.
- [ ] Try layered strokes, feathered blue triangles, or a frame-based PNG asset if that gives better animation.
- [ ] Ensure the new 2D effects still read clearly at mobile sizes and during combat chaos.

## Phase 2: Reintroduce Optional 3D Ship Rendering

### HTML stays 2D first

- [ ] Keep `ShotEmUp3D_JS.html` static DOM pure 2D by default.
- [ ] Keep only `canvas#game` and `canvas#hud` statically present.
- [ ] Do not statically include `player3d`, `enginefx`, `cloud3d`, or `damagefx`.
- [ ] Do not include any module script that imports Three.js at page load.
- [ ] Add back a settings checkbox for `Advanced 3D ship model`, default unchecked.

### On-demand 3D module

- [ ] Add `useAdvanced3DShipModel`, default `false`.
- [ ] Add UI sync, save, and load for the checkbox.
- [ ] Add `advancedShipController` and `advancedShipLoadPromise`.
- [ ] Add `enableAdvanced3DShip()` with dynamic import of `./advancedShip3D.js`.
- [ ] Call `createAdvancedShip3D({ assetsBase: 'assets/' })` from the on-demand module.
- [ ] Revert to 2D if enabling fails.
- [ ] Add `disableAdvanced3DShip()` that destroys the controller and restores 2D rendering.
- [ ] Make low-end mode force 3D off and disable the 3D checkbox.
- [ ] Update `drawPlayer()` so active 3D takes over, otherwise the PNG sprite is drawn in 2D.
- [ ] Do not create `window.__ShotEmUp3D` at startup.

### New 3D module

- [ ] Create `advancedShip3D.js`.
- [ ] Export `createAdvancedShip3D(options)`.
- [ ] Dynamically import Three.js and `GLTFLoader` inside that function only.
- [ ] Create required canvases dynamically, at minimum `canvas#player3d`.
- [ ] Optionally create `enginefx` and `damagefx` only while 3D is active.
- [ ] Add CSS styles dynamically for fixed full-screen overlays.
- [ ] Build the Three.js renderer, scene, camera, lights, and GLB loader.
- [ ] Load `assets/player_spaceship.glb`.
- [ ] Run a private `requestAnimationFrame` loop.
- [ ] Return `updatePlayer(playerState)`, `resize()`, and `destroy()`.
- [ ] Ensure `destroy()` cancels RAF, removes listeners, disposes resources, removes canvases, and clears references.

## Acceptance Checks

- [ ] With 3D disabled, the network should not load `three.module.js`, `GLTFLoader.js`, or `player_spaceship.glb`.
- [ ] With 3D disabled, the DOM should contain only `canvas#game` and `canvas#hud`.
- [ ] With 3D disabled, the player should render as PNG through the main renderer.
- [ ] With 3D enabled, Three.js and the GLB should load only after enabling the setting.
- [ ] With 3D enabled, extra canvases should appear only after enabling.
- [ ] With 3D enabled, the 2D player sprite should not be drawn underneath the 3D model.
- [ ] After disabling 3D, extra canvases should be removed, RAF should stop, and resources should be disposed.
- [ ] Low-end mode should disable 3D and prevent re-enabling it.
- [ ] Gameplay behavior, weapons, enemies, bosses, HUD, pickups, settings, pause, respawn, and mobile controls should still work.

## Progress Log

- 2026-04-20: Added the implementation plan and progress tracker.
