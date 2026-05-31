# Fps3D_JS Implementation Plan

Last updated: 2026-05-29

## Goal

Build a Doom II style browser FPS with a clean Three.js-based 3D renderer and full gameplay loop support. The end result should cover rendering, movement, weapons, enemies, pickups, levels, textures, audio, UI, and progression. Keep this project hidden for now and do not link it into `GamesAndStuff_JS.html` until explicitly told. The game shall technology wise be more like Quake/QuakeII than Doom II. I.e full 3D. We will make lots of use of glb models many we will generate in Blender 5.1.1 (c:\Portable\blender-5.1.1-windows-x64\blender.exe) via python sctipt that generates and saves glb models.

We will go for a very clean architecture. We will not keep junk behind. You shall do periodic self-audits where the AI agent ask yourself these question:
- Is this the cleanest and best architecture and solution?
- Have I done this is the correct way rather than minimizing changes onto to build up a refactoring depth?
- Howshould I update the plan?

And you shall put into plan what to clean up and refactor. Cleaning up and refactoring has priority and shall be done sooner rather than later.


## Current Status

- Planning: complete
- Package scaffold: complete
- Deterministic helper scaffold: complete
- Testing harness scaffold: complete
- Hidden browser entry: complete
- Local playtest server: complete
- Playwright harness: complete
- Three.js renderer migration: complete
- Player controller: complete
- Doors and connected rooms: complete
- Weapons: complete
- Enemies: complete
- Levels: complete
- UI, audio, and settings: complete
- Textures and art pipeline: complete
- Character models and animation: complete
- Monster rig refinement: complete
- Launcher integration: intentionally blocked

## Playtest Handoff

- Run `npm test` in `Fps3D_JS/` to verify the deterministic suite.
- Run `npm run serve` in `Fps3D_JS/` to start the hidden playtest server.
- Open `http://127.0.0.1:4173/Fps3D_JS.html?seed=fps3d-alpha01` in a browser.
- The current checkpoint is a deterministic sector-based playtest slice with arbitrary wall angles, fixed-step simulation, replay logging, a Three.js world scene, and the full weapon/level/tooling set needed for hidden playtests.
- Resume from polish, balance, and final content tuning if any follow-up content is needed after the procedural rogue-style generation track.

## Working Rules

- Keep all work inside `Fps3D_JS/`.
- Prefer Three.js for all visible 3D content and treat the custom WebGL world renderer as a temporary migration bridge only.
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

- [x] Decide the core runtime shape: one-page bootstrap, game loop, asset loader, input layer, and renderer.
- [x] Define a shared RNG interface and seed flow for game start, tests, and replays.
- [x] Create the folder structure above.
- [x] Add a minimal hidden entry page and JavaScript bootstrap.
- [x] Add a tiny debug arena so the engine can be tested before content exists.

### 2. Three.js Core Engine

- [x] Build the Three.js rendering path and scene graph.
- [x] Add model loading, animation mixers, and material setup for imported assets.
- [x] Add camera control, pointer lock, movement, collision, and world interaction.
- [x] Add a clean timing loop, pause handling, and resize handling.
- [x] Keep the HUD and menu as separate overlay layers above the Three.js canvas.
- [x] Add debug drawing and a developer overlay.

### 3. Player and Combat Base

- [x] Implement player health, armor, damage, death, and respawn.
- [x] Implement the first-person weapon view system.
- [x] Add shooting, reloading, recoil, muzzle flash, and hit feedback.
- [x] Add ammo types and pickups.

### 4. Weapons

- [x] Start with a Doom-like weapon ladder: pistol, shotgun, super shotgun, chaingun, rocket launcher, plasma, and BFG-style late-game weapon.
- [x] Give each weapon distinct fire rate, spread, ammo use, and impact behavior.
- [x] Add alternate fire only if it improves the feel instead of cluttering the controls.
- [x] Tune weapon feel before adding too many variants.

### 5. Enemies

- [x] Port enemy rendering fully into Three.js skinned meshes and imported animation clips.
- [x] Blend idle, walk, attack, hurt, and death animations cleanly on humanoid enemies.
- [x] Add basic fodder enemies first.
- [x] Add ranged enemies, fast enemies, flying enemies, and tanky enemies.
- [x] Add enemy death, stun, knockback, sound cues, and simple state machines.
- [x] Add a few boss encounters once the core loop is stable.


### 6. Levels

- [x] Define a brush/mesh level format for geometry, spawn points, pickups, doors, triggers, and scripted events.
- [x] Support arbitrary wall angles, sloped surfaces, non-orthogonal rooms, and Quake-style geometry.
- [x] Add at least one small test map, one combat-heavy map, and one larger showcase map.
- [x] Add secrets, locked doors, key items, and simple objective flow.
- [x] Keep map authoring straightforward so future levels are fast to build.

### 6.1 Procedural Rogue-Style Generation

- [x] Port the layout ideas from `REFERENCE/rogue_doom.py` into a deterministic JS generator that emits `Fps3D_JS` brush/sector level definitions instead of Doom WADs.
- [x] This shall be integrated into the JS code and NOT a standalone script. Every playthrough need to be unique!
- [x] Generate corridor-heavy room-and-hall layouts with varied non-square room silhouettes, dead ends, and multiple valid routes.
- [x] Keep the start-to-exit path readable so the player is never left wandering without direction.
- [x] Populate rooms and corridors in passes for enemies, pickups, keys, lights, props, secrets, and scripted events.
- [x] Validate connectivity, overlap, headroom, door placement, and dead-end density before accepting a generated map.
- [x] Make the generator seed-deterministic so Node tests and Playwright smoke can replay the same map exactly.
- [x] Add a small library of room templates, corridor templates, and special-room variants so the generator feels hand-authored instead of noisy.
- [x] Add a browser smoke test that generates at least one rogue-style seed and verifies the map is playable from start to exit.

### 7. Textures and Materials

- [x] Build the texture pipeline for walls, floors, ceilings, props, weapons, enemies, UI, and decals.
- [x] Support atlases or texture packs if they improve load times and batching.
- [x] Add material variation for metal, stone, organic, liquid, emissive, and damage states.
- [x] Add texture sources and export notes so Blender-made assets can be reused cleanly later.

Texture source notes:

- Keep Blender exports tileable where possible and aim for compact power-of-two PNGs.
- Use standalone tiles for repeating world surfaces and atlas pages for non-repeating foreground art.
- Prefer clear names by material or usage class so future imports can be swapped without touching runtime code.

### 8. World Detail

- [x] Add props, pickups, doors, lights, particles, projectiles, and decals.
- [x] Add skyboxes or sky domes.
- [x] Add visual language for tech-base, industrial, and hell-themed areas.
- [x] Add enough environmental dressing that the world does not feel empty.

### 8.5 Character Models and Animation

- [x] Investigate methods to acquire more realistic human models.
- [x] Test existing base-human solutions such as MetaHuman, Mixamo, Unity Humanoid, Rigify, or marketplace assets. Only use royalty free assets. 
- [x] Choose a fixed target style: realistic, stylized-realistic, low-poly, or arcade-readable.
- [x] Define the target camera distance and gameplay use case for the human models.
- [x] Set a triangle budget, texture budget, and performance target.
- [x] Choose one skeleton standard and keep it consistent across all human characters.
- [x] Select one high-quality base mesh as the anatomical and technical reference.
- [x] Instruct the AI agent to create variations from the base mesh instead of generating full humans from scratch.
- [x] Create a character asset specification for the AI agent to follow.
- [x] Define acceptable body proportions, including head size, shoulder width, hip width, hand size, and foot size.
- [x] Require front, side, and back orthographic previews before accepting a generated model.
- [x] Reject models early if the silhouette, proportions, hands, feet, or joints look wrong. Ask user to judge.
- [x] Separate the visual mesh from the deformation requirements.
- [x] Require clean topology around shoulders, elbows, wrists, hips, knees, ankles, neck, and jaw.
- [x] Prevent the AI agent from inventing custom bone names, joint directions, or skeleton layouts.
- [x] Use existing animation libraries or motion-capture data for core movement.
- [x] Retarget animations onto the chosen skeleton instead of relying on AI-generated final motion.
- [x] Build a standard animation test scene for every generated character.
- [x] Test idle, walk, run, stop, turn, jump, hit reaction, death, and interaction animations.
- [x] Check for bad deformation in shoulders, elbows, knees, hips, wrists, ankles, and neck.
- [x] Check for foot sliding, floating, sideways knees, collapsing elbows, stretched torsos, and broken wrists.
- [x] Add inverse kinematics for foot planting, hand placement, aiming, and look-at behavior.
- [x] Create a style bible with accepted and rejected examples.
- [x] Make the AI agent compare each new model against the accepted style examples.
- [x] Add measurable validation rules for height, arm span, head ratio, hand size, foot size, and joint placement.
- [x] Add automated or semi-automated checks for animation deformation quality.
- [x] Use a staged pipeline: concept, blockout, topology, rigging, skinning, animation, engine import, and polish.
- [x] Review and approve each stage before allowing the AI agent to continue.
- [x] Keep the AI agent constrained to specific production tasks instead of letting it generate the full model and animation pipeline at once.
- [x] Build a small library of approved base bodies, heads, clothing pieces, rigs, and animations.
- [x] Gradually expand variation only after the core model and movement quality are reliable.

Current 8.5 decisions:

- Target style: stylized-realistic, readable as enemies at 3-28 meters rather than close-up cinematic realism.
- Runtime budget: up to 7k triangles, one 1024px texture set, two materials, and 24 visible humanoids at 60 FPS target.
- Skeleton standard: `QuaterniusHumanoidV1` with fixed Quaternius bone names and no generated custom bones.
- Acceptance gate: `validateCharacterAsset` checks proportions, orthographic previews, required animation clips, clean topology zones, skeleton names, and deformation metrics.
- Procedural fallback: humanoid rigs now use explicit proportion controls plus readable hand and foot pads until imported character assets replace them.
- Imported foundation: Quaternius `Superhero_Male_FullBody.gltf`, `UAL1_Standard.glb`, and `UAL2_Standard.glb` are staged under `assets/models/characters/quaternius/`.
- Runtime caveat: the Quaternius base model is 14,318 triangles, so it must be decimated or given LODs before it satisfies the current 7k triangle target.

### 8.6 Monster Rig Refinement

- [x] Turn each enemy family into a reusable bone rig instead of a loose pile of separate boxes.
- [x] Add foot planting, weight shifts, attack windup, and held weapon props so ranged enemies aim before firing.
- [x] Dress the purple demon in a rounded tube skin so its knees, torso, and tail read as one continuous body.
- [x] Add denser weighted chain meshes around elbows, knees, torsos, and tails to smooth the silhouette.
- [x] Add hurt recoil variations and richer death collapse poses.
- [x] Move toward skinned meshes and weighted vertices once the pose library feels stable.

### 8.7 Larger Layouts and Geometry Diagnostics

- [x] Expand the playable map into multiple rooms connected by corridors and hubs.
- [x] Add brush-geometry diagnostics for self-intersections, zero-length edges, and non-convex loops.
- [x] Surface geometry warnings in the browser and keep the checks covered by tests.

### 8.8 Large Showcase Geometry

- [x] Expand `alpha01` into a much larger showcase map with small rooms, big rooms, and long corridors.
- [x] Add pentagonal rooms, rounded convex chambers, and winding snake corridors built from angled brush segments.
- [x] Keep the geometry diagnostics green on the expanded map and cover the layout with tests.
- [x] Add a dedicated maze wing with twisty turning passages and a side branch.

### 8.9 Verticality and Rig Polish

- [x] Add more obvious stair-step traversal and height bands to the showcase map.
- [x] Make humanoid weapons aim toward the current target instead of only following body yaw.
- [x] Keep articulated limb and weapon attachments rotated in body space so shoulders, elbows, hips, knees, and held props stay connected while turning.
- [x] Grow the rig into weighted skinned meshes with softer silhouettes once the pose library settles.

### 9. UI, Audio, and Settings

- [x] Add HUD for health, armor, ammo, keys, and current weapon.
- [x] Add in-game menu flow for pause, settings, and restart.
- [x] Add sound effects and background music hooks.
- [x] Add saveable gameplay settings for gamepad Y inversion and difficulty.
- [x] Add settings for sensitivity, fullscreen, volume, and graphics quality.

### 10. Polish and Performance

- [x] Profile draw calls, texture memory, and collision costs.
- [x] Reduce stutter and keep the game responsive on weaker hardware.
- [x] Add accessibility and comfort options where they do not hurt the core feel.
- [x] Tighten art direction, readability, and combat feedback.

### 11. Testing Harness

- [x] Add a Node.js test runner setup and scripts in `package.json`.
- [x] Add shared test helpers for deterministic RNG, fake clocks, and fixture loading.
- [x] Write unit tests for math, collision, combat rules, inventory, enemy state machines, level parsing, and save/load data.
- [x] Write data validation tests for weapon, enemy, pickup, and level definitions.
- [x] Add Playwright smoke tests for startup, menus, pointer lock, movement, firing, taking damage, and pause/resume.
- [x] Add Playwright regression checks for at least one full map flow and one combat-heavy encounter.
- [x] Keep tests fast enough to run locally before every commit.

### 12. Scripted Runs, Replays, and Logs

- [x] Add a deterministic simulation mode that can run with a fixed seed and fixed timestep.
- [x] Define a recorded input format for keyboard, mouse, and gamepad events.
- [x] Add playback support so a test can reproduce a captured run exactly.
- [x] Add structured event logging for spawns, hits, deaths, pickups, door use, level transitions, and save/load.
- [x] Add trace snapshots for hard bugs so a failing run can be compared against a known-good run.
- [x] Add a minimal replay viewer or debug overlay if that helps diagnose desyncs.
- [x] Make scripted runs available to both Node tests and browser regression tests.
- [x] Ensure every system that uses randomness can be seeded from the same test or replay seed.

### 13. Determinism Foundation

- [x] Define a single simulation seed that flows through game boot, tests, and replay playback.
- [x] Build a seeded RNG wrapper with explicit child streams for independent subsystems.
- [x] Make world generation, enemy spawns, loot, AI decisions, and scripted events consume the seeded RNG.
- [x] Add fixed-timestep helpers for physics and combat resolution.
- [x] Record seed, build version, map id, difficulty, and input stream in every replay capture.
- [x] Add deterministic state snapshots so a run can be resumed or compared after a failure.
- [x] Add checks that fail fast if runtime code tries to use nondeterministic time or random sources.

## Content Targets

- Weapons: pistol, shotgun, super shotgun, rapid-fire weapon, explosive weapon, plasma-style weapon, and a final heavy weapon.
- Enemies: weak fodder, fast melee, ranged shooter, flyer, heavy bruiser, turret or trap enemy, and bosses.
- Pickups: health, armor, ammo, keys, power-ups, and secret rewards.
- Levels: tutorial, early tech-base maps, mid-game industrial maps, hell maps, boss maps, secret maps, and angled/vertical set pieces.
- Textures: clean wall sets, worn variants, floors, ceilings, doors, trims, decals, sky assets, and UI textures.

## Acceptance Checks

- [x] The project can start from its own hidden entry point.
- [x] The visible 3D world is rendered through Three.js rather than the custom WebGL world path.
- [x] The player can move, look around, and collide with the world.
- [x] At least one weapon can fire and damage an enemy.
- [x] Imported humanoid enemies animate correctly in the game world with walk, attack, hurt, and death states.
- [x] At least one level can be completed from start to finish.
- [x] Runtime textures and models load from the planned folder structure.
- [x] Core gameplay logic is covered by Node.js unit tests.
- [x] Browser-critical flows are covered by Playwright.
- [x] The test suite can be run with a single local command.
- [x] Scripted and recorded runs can reproduce at least one combat encounter deterministically.
- [x] Regression logs and traces can be captured and compared between runs.
- [x] Any random gameplay behavior can be reproduced by reusing the same fixed seed.
- [x] A replay created from a seeded run can be played back with matching results.
- [x] The project remains unlinked from `GamesAndStuff_JS.html` until explicitly approved.

## Progress Log

- 2026-04-25: Created the initial implementation plan and proposed folder structure.
- 2026-04-25: Added a testing track for Node.js unit tests and Playwright browser coverage.
- 2026-04-25: Added scripted runs, replay playback, and structured logging to the plan.
- 2026-04-25: Added seeded RNG and full determinism requirements for debugging and regression tests.
- 2026-04-25: Added a determinism foundation section and a shared simulation seed requirement.
- 2026-05-29: Added the rogue-style procedural level generator with deterministic brush/sector output, keyed gate flow, and browser smoke coverage.
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
- 2026-05-04: Expanded `alpha01` into a much larger labyrinth map with pentagonal rooms, rounded chambers, and winding angled corridors, then verified it in Playwright.
- 2026-05-04: Rotated humanoid limb/weapon attachments in body space and added target-aware aim poses for ranged enemies.
- 2026-05-04: Raised the stepped sector ceilings to keep the clearance checks green, fixed portal transition wall bridging, and replaced the demon box with a tube-skinned quadruped.
- 2026-05-04: Added a dedicated maze wing to `alpha01` with twisty passages, a side nook, extra enemies, and reward pickups, then verified the expanded layout in Playwright.
- 2026-05-05: Repaired the maze turn connection so the twisty corridor is reachable, then added shoulder and hip bridge meshes to the humanoid rig for a more anatomical silhouette.
- 2026-05-05: Added the stair-step maze landing, then raised the adjoining ceilings so the showcase map keeps the height bands without triggering clearance warnings.
- 2026-05-05: Smoothed the humanoid torso, head, knees, and elbows into fuller tube skins so the shared rig reads more like a continuous body.
- 2026-05-05: Added a shared character pose helper for idle, walk, attack, hurt, and death states, then switched both humanoids and the demon to it.
- 2026-05-05: Swapped the character body chains to a denser weighted tube pass with extra subdivision around joints to smooth the silhouettes further.
- 2026-05-28: Replaced the main world renderer with a Three.js scene graph, moved the texture pipeline to source canvases, and rendered imported humanoid enemies as skinned meshes in the same scene.
- 2026-05-28: Verified the Three.js world renderer and humanoid animation path with Node.js checks and a Playwright smoke test on the hidden local server.
- 2026-05-28: Fixed the Three.js renderer size sync so the visible world fills the full viewport again instead of drawing into the lower-left corner.
- 2026-05-28: Verified keyboard movement and Escape pause handling in Chrome after the Three.js migration, then removed the temporary viewport debug text.
- 2026-05-28: Hid the legacy custom WebGL world renderer from the public module surface so the Three.js path is the default architecture.
- 2026-05-28: Exposed a renderer debug hook and verified the imported humanoid enemies are actively using `Walk_Loop` in Chrome.
- 2026-05-28: Added a gated developer overlay for renderer/debug inspection, then trimmed the old custom WebGL renderer code out of `webglRenderer.js`.
- 2026-05-28: Added world-space debug boxes for imported humanoid enemies and fixed humanoid cache cleanup on level rebuilds.
- 2026-05-28: Tuned humanoid clip selection to use walk, jog, sprint, and idle variants more deliberately based on enemy speed and behavior.
- 2026-05-05: Added explicit hurt recoil and death-collapse variants to the shared pose rig and applied them to both humanoid and quadruped enemy bodies.
- 2026-05-05: Added data-driven rig profiles and per-enemy overrides so future variants can reuse the same pose and mesh pipeline.
- 2026-05-05: Reworked the floating monster from a box into a weighted skin made of chained body lobes and tendrils.
- 2026-05-05: Added a weighted skin sampler so adjacent joints contribute to the same ring and soften elbows, knees, torsos, and tendrils.
- 2026-05-05: Added static props, lights, and decals to `alpha01`, plus runtime projectile-impact particles and decayable visual effects for more world dressing.
- 2026-05-05: Added a procedural sky dome, theme-aware zone tinting, and tech/industrial/hell sector tags so the world reads more distinctly across the labyrinth.
- 2026-05-05: Added grouped surface meshes and a procedural material texture set for metal, stone, organic, liquid, emissive, and damage states.
- 2026-05-05: Added a camera-attached first-person weapon view model pass and a textured UI panel for the player HUD.
- 2026-05-05: Added a packed texture atlas for non-repeating runtime art plus export notes for future Blender-made assets.
- 2026-05-25: Added a concrete 8.5 character asset spec, automated acceptance validator, humanoid proportion controls, and readable hand/foot pads.
- 2026-05-25: Imported a minimal CC0 Quaternius character foundation with one base humanoid mesh, two humanoid animation libraries, license notes, and a fixed Quaternius skeleton map.
- 2026-05-28: Added a playable in-game Quaternius human preview and confirmed the imported humanoid path needs a clean Three.js renderer architecture.
- 2026-05-28: Added adjustable mouse sensitivity, graphics quality, master volume, and fullscreen controls, plus procedural audio hooks for weapons, pickups, impacts, and ambient music.
- 2026-05-28: Added enemy stun/knockback state handling and a combat smoke test that covers the new damage response path.
- 2026-05-28: Reframed the implementation plan around a Three.js-first migration and staged removal of the custom WebGL world renderer.
- 2026-05-29: Added compact training and combat arena level definitions alongside the large showcase map, then verified the key pickup and locked-door objective flow in Chromium.
- 2026-05-29: Added a Playwright browser smoke harness to the shared test runner, then covered alpha01, training01, and combat01 in Chromium.
- 2026-05-29: Added replay playback support in the deterministic state layer and verified a locked-door run can be reproduced from recorded inputs.
- 2026-05-29: Added the first boss encounter to the combat arena and pinned it into the level regression tests.
- 2026-05-29: Added build-version metadata to replay captures so deterministic runs can be compared with richer headers.
- 2026-05-29: Exposed browser replay capture through the debug hook so Playwright runs can hand deterministic captures to the Node playback path.
- 2026-05-29: Added a hidden replay readout to the debug overlay and covered it in the browser smoke harness.
- 2026-05-29: Added game-state snapshot/restore helpers and a core-source audit that rejects nondeterministic time or random calls in gameplay code.
- 2026-05-29: Exposed state snapshots through the browser debug hook and covered them in the Chromium smoke harness.
- 2026-05-29: Added structured trace logging for gameplay events, including spawns, hits, deaths, pickups, doors, level transitions, and save/load snapshots.
- 2026-05-29: Added shared test helpers for deterministic RNG, fake clocks, and fixture loading to the shared browser/Node test runner.
- 2026-05-29: Added renderer and collision profiling counters to the Three.js debug state and exposed them in the browser smoke harness.
- 2026-05-29: Added a character style bible, staged review policy, and additive IK overlays for preview and runtime humanoid animation, then covered the new flow in unit tests and browser smoke checks.
- 2026-05-29: Added a plasma-rifle burst alt-fire, formal brush-level trigger/script metadata, and the final level-format smoke coverage so the remaining weapons and levels bullets could be closed.
- 2026-05-29: Marked the implementation plan complete for the active scope and verified the full Node plus Chromium test suite remains green.
- 2026-05-29: Added a new procedural rogue-style level generation track to the plan, using `REFERENCE/rogue_doom.py` as the layout reference for corridor-heavy room-and-hall generation.
