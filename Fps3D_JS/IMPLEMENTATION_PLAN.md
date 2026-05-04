# Fps3D_JS Implementation Plan

Last updated: 2026-05-04

## Goal

Build a Doom II style browser FPS with WebGL and full 3D acceleration. The end result should cover the whole game loop: rendering, movement, weapons, enemies, pickups, levels, textures, audio, UI, and progression. Keep this project hidden for now and do not link it into `GamesAndStuff_JS.html` until explicitly told.

## Current Status

- Planning: in progress
- Package scaffold: complete
- Deterministic helper scaffold: complete
- Testing harness scaffold: complete
- Hidden browser entry: complete
- Local playtest server: complete
- Playwright harness: not started
- Engine scaffold: in progress
- Player controller: in progress
- Doors and connected rooms: in progress
- Weapons: in progress
- Enemies: in progress
- Levels: in progress
- UI, audio, and settings: in progress
- Textures and art pipeline: not started
- Character models and animation: in progress
- Monster rig refinement: in progress
- Launcher integration: intentionally blocked

## Playtest Handoff

- Run `npm test` in `Fps3D_JS/` to verify the deterministic suite.
- Run `npm run serve` in `Fps3D_JS/` to start the hidden playtest server.
- Open `http://127.0.0.1:4173/Fps3D_JS.html?seed=fps3d-alpha01` in a browser.
- The current checkpoint is a deterministic sector-based playtest slice with arbitrary wall angles, fixed-step simulation, replay logging, and a local WebGL renderer.
- Resume from the brush/sector pipeline, connected rooms, doors, and content expansion.

## Working Rules

- Keep all work inside `Fps3D_JS/`.
- Do not add launcher wiring yet.
- Prefer data-driven content so weapons, enemies, items, and levels can grow without rewiring the engine.
- Separate runtime assets from source art and generation scripts.
- Keep the game playable at every milestone, even when content is still sparse.
- Every gameplay system should stay unit-testable.
- Never call `Math.random()` directly in gameplay/runtime code.
- Route all randomness through a seeded RNG owned by the simulation state.
- Keep timing-sensitive gameplay on a fixed timestep when debugging or replaying.
- Do not constrain level geometry to 90-degree tiles; support arbitrary wall angles, slopes, and non-orthogonal spaces.
- Treat tile-grid maps only as temporary test fixtures, not the final level format.
- Use Node.js for deterministic unit and integration tests.
- Use Playwright for browser smoke tests, input flow, and end-to-end level checks.
- Design core systems so scripted runs and recorded replays are possible.
- Keep simulation deterministic under a fixed seed and fixed timestep when tests need it.
- Avoid hidden sources of nondeterminism in gameplay logic, AI, spawning, loot, and level scripting.
- Add structured logging and trace output for regression debugging.
- No feature is complete unless its tests land with it.

## Proposed Folder Structure

```text
Fps3D_JS/
- IMPLEMENTATION_PLAN.md
- README.md
- package.json
- package-lock.json
- Fps3D_JS.html
- Fps3D_JS.js
- manifest.webmanifest
- sw.js
- core/
  - random/
  - sim/
  - input/
  - replay/
  - logging/
- assets/
  - textures/
  - models/
  - audio/
  - ui/
  - skyboxes/
  - fonts/
- data/
  - weapons/
  - enemies/
  - items/
  - levels/
  - balance/
  - settings/
- levels/
  - campaign/
  - test/
- geometry/
  - brushes/
  - meshes/
  - sectors/
- shaders/
- devel/
  - art_sources/
  - generators/
  - import_notes/
  - prototypes/
- tools/
- docs/
- OLD/
- tests/
  - unit/
  - integration/
  - e2e/
  - fixtures/
  - helpers/
  - recordings/
  - traces/
```

## Milestones

### 1. Project Scaffold

- [ ] Decide the core runtime shape: one-page bootstrap, game loop, asset loader, input layer, and renderer.
- [ ] Define a shared RNG interface and seed flow for game start, tests, and replays.
- [ ] Create the folder structure above.
- [ ] Add a minimal hidden entry page and JavaScript bootstrap.
- [ ] Add a tiny debug arena so the engine can be tested before content exists.

### 2. Core Engine

- [ ] Build the WebGL rendering path.
- [ ] Add camera control, pointer lock, movement, collision, and world interaction.
- [ ] Add a clean timing loop, pause handling, and resize handling.
- [ ] Add debug drawing and a developer overlay.

### 3. Player and Combat Base

- [ ] Implement player health, armor, damage, death, and respawn.
- [ ] Implement the first-person weapon view system.
- [ ] Add shooting, reloading, recoil, muzzle flash, and hit feedback.
- [ ] Add ammo types and pickups.

### 4. Weapons

- [ ] Start with a Doom-like weapon ladder: pistol, shotgun, super shotgun, chaingun, rocket launcher, plasma, and BFG-style late-game weapon.
- [ ] Give each weapon distinct fire rate, spread, ammo use, and impact behavior.
- [ ] Add alternate fire only if it improves the feel instead of cluttering the controls.
- [ ] Tune weapon feel before adding too many variants.

### 5. Enemies

- [ ] Add basic fodder enemies first.
- [ ] Add ranged enemies, fast enemies, flying enemies, and tanky enemies.
- [ ] Add enemy death, stun, knockback, sound cues, and simple state machines.
- [ ] Add a few boss encounters once the core loop is stable.


### 6. Levels

- [ ] Define a brush/mesh level format for geometry, spawn points, pickups, doors, triggers, and scripted events.
- [ ] Support arbitrary wall angles, sloped surfaces, non-orthogonal rooms, and Quake-style geometry.
- [ ] Add at least one small test map, one combat-heavy map, and one larger showcase map.
- [ ] Add secrets, locked doors, key items, and simple objective flow.
- [ ] Keep map authoring straightforward so future levels are fast to build.

### 7. Textures and Materials

- [ ] Build the texture pipeline for walls, floors, ceilings, props, weapons, enemies, UI, and decals.
- [ ] Support atlases or texture packs if they improve load times and batching.
- [ ] Add material variation for metal, stone, organic, liquid, emissive, and damage states.
- [ ] Add texture sources and export notes so Blender-made assets can be reused cleanly later.

### 8. World Detail

- [ ] Add props, pickups, doors, lights, particles, projectiles, and decals.
- [ ] Add skyboxes or sky domes.
- [ ] Add visual language for tech-base, industrial, and hell-themed areas.
- [ ] Add enough environmental dressing that the world does not feel empty.

### 8.5 Character Models and Animation

- [x] Build proper 3D character models with articulated feet, lower legs, thighs, torso, upper arms, lower arms, hands, and heads.
- [ ] Add a reusable animation rig so player and enemy bodies can share walk, idle, attack, hurt, and death poses.
- [ ] Keep the model pipeline data-driven so future enemy variants can reuse the same limb structure.

### 8.6 Monster Rig Refinement

- [x] Turn each enemy family into a reusable bone rig instead of a loose pile of separate boxes.
- [x] Add foot planting, weight shifts, attack windup, and held weapon props so ranged enemies aim before firing.
- [ ] Add hurt recoil variations and richer death collapse poses.
- [ ] Move toward skinned meshes and weighted vertices once the pose library feels stable.

### 8.7 Larger Layouts and Geometry Diagnostics

- [x] Expand the playable map into multiple rooms connected by corridors and hubs.
- [x] Add brush-geometry diagnostics for self-intersections, zero-length edges, and non-convex loops.
- [x] Surface geometry warnings in the browser and keep the checks covered by tests.

### 9. UI, Audio, and Settings

- [x] Add HUD for health, armor, ammo, keys, and current weapon.
- [x] Add in-game menu flow for pause, settings, and restart.
- [ ] Add sound effects and background music hooks.
- [x] Add saveable gameplay settings for gamepad Y inversion and difficulty.
- [ ] Add settings for sensitivity, fullscreen, volume, and graphics quality.

### 10. Polish and Performance

- [ ] Profile draw calls, texture memory, and collision costs.
- [ ] Reduce stutter and keep the game responsive on weaker hardware.
- [ ] Add accessibility and comfort options where they do not hurt the core feel.
- [ ] Tighten art direction, readability, and combat feedback.

### 11. Testing Harness

- [ ] Add a Node.js test runner setup and scripts in `package.json`.
- [ ] Add shared test helpers for deterministic RNG, fake clocks, and fixture loading.
- [ ] Write unit tests for math, collision, combat rules, inventory, enemy state machines, level parsing, and save/load data.
- [ ] Write data validation tests for weapon, enemy, pickup, and level definitions.
- [ ] Add Playwright smoke tests for startup, menus, pointer lock, movement, firing, taking damage, and pause/resume.
- [ ] Add Playwright regression checks for at least one full map flow and one combat-heavy encounter.
- [ ] Keep tests fast enough to run locally before every commit.

### 12. Scripted Runs, Replays, and Logs

- [ ] Add a deterministic simulation mode that can run with a fixed seed and fixed timestep.
- [ ] Define a recorded input format for keyboard, mouse, and gamepad events.
- [ ] Add playback support so a test can reproduce a captured run exactly.
- [ ] Add structured event logging for spawns, hits, deaths, pickups, door use, level transitions, and save/load.
- [ ] Add trace snapshots for hard bugs so a failing run can be compared against a known-good run.
- [ ] Add a minimal replay viewer or debug overlay if that helps diagnose desyncs.
- [ ] Make scripted runs available to both Node tests and browser regression tests.
- [ ] Ensure every system that uses randomness can be seeded from the same test or replay seed.

### 13. Determinism Foundation

- [ ] Define a single simulation seed that flows through game boot, tests, and replay playback.
- [ ] Build a seeded RNG wrapper with explicit child streams for independent subsystems.
- [ ] Make world generation, enemy spawns, loot, AI decisions, and scripted events consume the seeded RNG.
- [ ] Add fixed-timestep helpers for physics and combat resolution.
- [ ] Record seed, build version, map id, difficulty, and input stream in every replay capture.
- [ ] Add deterministic state snapshots so a run can be resumed or compared after a failure.
- [ ] Add checks that fail fast if runtime code tries to use nondeterministic time or random sources.

## Content Targets

- Weapons: pistol, shotgun, super shotgun, rapid-fire weapon, explosive weapon, plasma-style weapon, and a final heavy weapon.
- Enemies: weak fodder, fast melee, ranged shooter, flyer, heavy bruiser, turret or trap enemy, and bosses.
- Pickups: health, armor, ammo, keys, power-ups, and secret rewards.
- Levels: tutorial, early tech-base maps, mid-game industrial maps, hell maps, boss maps, secret maps, and angled/vertical set pieces.
- Textures: clean wall sets, worn variants, floors, ceilings, doors, trims, decals, sky assets, and UI textures.

## Acceptance Checks

- [ ] The project can start from its own hidden entry point.
- [ ] The player can move, look around, and collide with the world.
- [ ] At least one weapon can fire and damage an enemy.
- [ ] At least one level can be completed from start to finish.
- [ ] Runtime textures and models load from the planned folder structure.
- [ ] Core gameplay logic is covered by Node.js unit tests.
- [ ] Browser-critical flows are covered by Playwright.
- [ ] The test suite can be run with a single local command.
- [ ] Scripted and recorded runs can reproduce at least one combat encounter deterministically.
- [ ] Regression logs and traces can be captured and compared between runs.
- [ ] Any random gameplay behavior can be reproduced by reusing the same fixed seed.
- [ ] A replay created from a seeded run can be played back with matching results.
- [ ] The project remains unlinked from `GamesAndStuff_JS.html` until explicitly approved.

## Progress Log

- 2026-04-25: Created the initial implementation plan and proposed folder structure.
- 2026-04-25: Added a testing track for Node.js unit tests and Playwright browser coverage.
- 2026-04-25: Added scripted runs, replay playback, and structured logging to the plan.
- 2026-04-25: Added seeded RNG and full determinism requirements for debugging and regression tests.
- 2026-04-25: Added a determinism foundation section and a shared simulation seed requirement.
- 2026-04-25: Added a portable Node test harness, deterministic RNG, replay codec, and fixed-step helpers.
- 2026-04-25: Clarified that final levels must use arbitrary-angle brush/mesh geometry, not tile-only walls.
- 2026-04-25: Added a hidden browser entry page, a local static server, and a browser playtest bootstrap.
- 2026-04-25: Added a sector-based alpha level, WebGL world mesh generation, and angled-wall regression tests.
- 2026-04-25: Verified the hidden playtest server serves `Fps3D_JS.html` at the root path.
- 2026-05-04: Added openable brush-level doors, use-key interaction, door-aware collision/raycast/rendering, and regression tests for opening passages.
- 2026-05-04: Added browser gamepad polling, analog stick movement/look, trigger firing, and controller button mappings.
- 2026-05-04: Added a saveable in-game settings menu for gamepad Y inversion, difficulty selection, and restart, and verified it in Playwright.
- 2026-05-04: Added a character-model and animation milestone for articulated humanoid bodies.
- 2026-05-04: Added segmented articulated humanoid enemy bodies and animation-phase updates for the first character-model pass.
- 2026-05-04: Added reusable humanoid and quadruped bone-rig helpers with foot planting, weapon props, and attack windups.
- 2026-05-04: Added WebGL context-loss recovery so the renderer reinitializes textures and buffers after a browser reset.
- 2026-05-04: Added a larger multi-room alpha layout with corridor sectors plus brush-geometry diagnostics for self-intersections and zero-length edges.
