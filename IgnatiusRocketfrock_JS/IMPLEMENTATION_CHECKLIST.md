# Ignatius Rocketfrock Implementation Checklist

This document augments `PLAN.md`.

`PLAN.md` describes the game design. This document describes the implementation order and provides checkable development tasks.

The old Phase 1 physics arena is now considered complete enough to stop treating it as the current milestone. The current development target is **Phase 2: Character Atlas, Rigging, and Animation Tooling**.

## Always Remember: Responsive Viewport Scaling

The browser game uses a shared virtual viewport. On screens narrower than the mobile minimum width, the whole canvas render is scaled down, while gameplay continues in virtual game coordinates.

* [ ] When adding new drawing code, confirm it uses the shared render transform / virtual viewport system rather than its own mobile scale.
* [ ] When adding new input code, confirm screen coordinates are converted into virtual canvas/game coordinates before gameplay or virtual joystick code uses them.
* [ ] Do not add separate per-sprite mobile scaling unless there is a deliberate special-case reason documented next to the code.
* [ ] Keep physics, collisions, particles, camera math, and level geometry in virtual game coordinates.

## Current Status

The project now has a working browser game loop, deterministic simulation layer, asset-atlas based level construction, atlas and level editor tools, atlas-derived collision lines and filled collision loops, detached rocket terrain impacts, health/fuel HUD, and headless tests.

The main cleanup direction is to reduce ad-hoc character rendering and move Ignatius, monsters, and future mobs into a shared data-driven character rig and animation pipeline.

## Phase 1: Completed Physics, Level, and Atlas Foundation

Goal: establish a playable and testable foundation for movement, rocket behavior, level loading, and atlas-based environment construction.

### Completed Foundation

* [x] Create `game.html` and main browser entry points.
* [x] Create `IgnatiusRocketfrock_SIM.js` for deterministic simulation.
* [x] Create `IgnatiusRocketfrock_INPUT.js` for keyboard/gamepad input mapping.
* [x] Create `IgnatiusRocketfrock_RENDER.js` for state-driven rendering.
* [x] Create `IgnatiusRocketfrock_GAME.js` for orchestration and fixed timestep loop.
* [x] Create `testbench.mjs` for headless and integration tests.
* [x] Keep simulation code independent from DOM, canvas, WebGL, and browser events.
* [x] Keep rendering code thin and state-driven.
* [x] Keep input mapping separate from simulation rules.
* [x] Store gameplay state inside a serializable `gameState`.
* [x] Support running, jumping, airborne boost, fuel, health, and detached rocket launch.
* [x] Support level loading from `assets/level_001.json`.
* [x] Support asset manifests from `assets/at_atlas_001.json`, `assets/at_atlas_002.json`, and so on.
* [x] Support level placements that reference `atlasId` plus `assetId`.
* [x] Support atlas collision lines: `walkable`, `blockable`, `damaging`, and `killable`.
* [x] Support filled closed collision loops when collision lines form areas.
* [x] Support rocket impacts against blockable terrain lines and filled areas.
* [x] Support asset guide overlays for atlas collision lines and filled collision areas.
* [x] Create a level editor for placing atlas assets and entities.
* [x] Create an asset tool for defining frames, nodes, and collision lines.
* [x] Make the hardcoded simulation arena explicitly a headless test fixture.
* [x] Remove large hardcoded level and atlas fallbacks from the runtime path.

### Phase 1 Rule Going Forward

The browser game should load real level and atlas files from `assets/`. It is acceptable for the game to fail loudly if `assets/level_001.json` or referenced atlas files are missing or invalid.

Hardcoded test data may remain only when it is explicitly used as a test fixture or blank editor starting state.

## Phase 2: Character Atlas, Rigging, and Animation Tooling

Goal: replace custom wizard body-part loading and hardcoded character posing with a data-driven character pipeline. This phase starts with Ignatius and must preserve the current wizard run animation as the visual ground truth.

### Phase 2 Design Rules

* [ ] Load Ignatius from `ct_atlas_wizard_1.png` rather than individual body-part PNG files.
* [ ] Use a separate asset manifest for character part frames.
* [ ] Use a separate rig JSON to define how frames become a character body.
* [ ] Use separate animation JSON files for reusable or character-specific motion.
* [ ] Use a character definition JSON to assign a rig and animation set to a character.
* [ ] Keep rendering resources outside `gameState`.
* [ ] Keep animation state in or derivable from `gameState` when it affects gameplay, replay, debugging, or deterministic state transitions.
* [ ] Keep character rendering data compatible with a later WebGL2 renderer.
* [ ] Treat reusable animations as templates that can be duplicated and tweaked per character.
* [ ] Do not force every character to use every animation.

### File Format Targets

* [ ] Create `ct_atlas_wizard_1.json` for frames inside `ct_atlas_wizard_1.png`.
* [ ] Create `ct_rig_wizard_1.json` converted from the current wizard rig settings.
* [ ] Create `ct_anim_wizard_run_1.json` that reproduces the current hardcoded run.
* [ ] Create `ct_char_wizard_1.json` that maps gameplay animation states to the wizard rig and animation files.
* [ ] Define a character asset manifest format that can later be shared with monsters.
* [ ] Define a rig format with part IDs, frame IDs, parent anchors, pivots, offsets, scale, rotation, draw order, roles, and tags.
* [ ] Define an animation format with duration, looping, tracks, keyframes, interpolation, and optional root motion flags.
* [ ] Define a character format that maps animation states such as `idle`, `run`, `jump`, `fall`, `hover`, `launch`, `hurt`, and `attack`.

### Rig Roles and Retargeting Preparation

* [ ] Add optional rig roles such as `root`, `torso`, `head`, `leftArm`, `rightArm`, `leftLeg`, `rightLeg`, `leftWing`, `rightWing`, `hat`, and `weaponMount`.
* [ ] Allow non-humanoid rigs to map parts to broad roles where useful.
* [ ] Allow bats to classify wings as arm-like controls without pretending every bat animation is a humanoid run.
* [ ] Let each animation declare required and optional roles.
* [ ] Let each character explicitly choose which animations it uses for each gameplay state.
* [ ] Support duplicated/forked animations so shared templates can become character-specific animations.

### Animation Data

* [ ] Prefer keyframes over JavaScript expressions for the first animation system.
* [ ] Support interpolation modes: `step`, `linear`, `easeIn`, `easeOut`, and `easeInOut`.
* [ ] Support tracks for position, rotation, scale, alpha, and optional visibility.
* [ ] Support looped animations.
* [ ] Support one-shot animations.
* [ ] Support per-animation playback speed.
* [ ] Support mirrored playback when the character faces left.
* [ ] Support paired limb helpers such as left/right copy, mirror, and phase offset.
* [ ] Defer procedural modifiers until keyframed animation is stable.
* [ ] Later support procedural modifiers for beard, hair strands, robe edges, wings, dangling parts, and rocket bob.

### Generic Character Renderer

* [ ] Create a generic character renderer that draws parts from atlas frames.
* [ ] Remove direct dependency on individual wizard body-part image files.
* [ ] Keep the existing canvas renderer working first.
* [ ] Return a simple draw-command list that can later be used by WebGL2.
* [ ] Draw character parts by atlas frame, transform, pivot, alpha, and draw order.
* [ ] Support mirroring without duplicating art.
* [ ] Support frame-local pivots.
* [ ] Support optional trim metadata if atlas-frame padding causes alignment drift.
* [ ] Keep the mounted rocket or weapon as a rig part or equipment mount, not as a special renderer island.

### Wizard Migration

* [ ] Create frame definitions in `ct_atlas_wizard_1.json` matching current wizard parts.
* [ ] Convert current `wizard_rig_config.json` values into `ct_rig_wizard_1.json`.
* [ ] Render the wizard from `ct_atlas_wizard_1.png` with no visible pose regression.
* [ ] Keep a temporary comparison path against the old individual-PNG renderer until parity is confirmed.
* [ ] Verify draw order matches the old wizard renderer.
* [ ] Verify pivots and offsets match the old wizard renderer.
* [ ] Verify left/right mirroring matches the old wizard renderer.
* [ ] Remove individual body-part loading only after the atlas version is visually equivalent.

### Wizard Run Ground Truth

* [ ] Treat the current wizard run animation as ground truth.
* [ ] Recreate the current hardcoded run as `ct_anim_wizard_run_1.json`.
* [ ] Add a comparison mode that can overlay or toggle between legacy run pose and new keyframed run pose.
* [ ] Sample the run cycle at 16 or 24 points and compare part transforms.
* [ ] Tune keyframes until the new run is near pixel-perfect.
* [ ] Preserve the current run timing and stride unless deliberately retuned.
* [ ] Add a headless or browser-assisted regression test for sampled run-pose parity.

### Other Wizard Animation States

* [ ] Add `idle` animation.
* [ ] Add `jumpStart` animation.
* [ ] Add `airborneRise` animation.
* [ ] Add `airborneFall` animation.
* [ ] Add `rocketHover` animation.
* [ ] Add `rocketLaunch` animation.
* [ ] Add `land` animation.
* [ ] Add `hurt` animation.
* [ ] Move current hardcoded jump and hover poses out of the game renderer and into animation data.
* [ ] Add simple animation blending between major states.

### Character Tool

Goal: create a tool where rigs and animations can be created, duplicated, edited, previewed, and exported.

* [ ] Create `character_tool.html`.
* [ ] Load a character atlas image.
* [ ] Load a character atlas JSON.
* [ ] Load a rig JSON.
* [ ] Load an animation JSON.
* [ ] Load a character definition JSON.
* [ ] Provide tabs or modes for atlas parts, rig, animation, preview, and export.
* [ ] Show a rig preview canvas.
* [ ] Allow click-and-drag editing of pivots, offsets, anchors, and part transforms.
* [ ] Provide exact numeric fields for all important rig values.
* [ ] Provide draw-order controls.
* [ ] Provide part role/tag editing.
* [ ] Provide animation playback controls: play, pause, loop, frame step, speed, and scrubber.
* [ ] Provide a timeline with keyframes.
* [ ] Allow adding, moving, deleting, copying, and pasting keyframes.
* [ ] Allow duplicating an animation.
* [ ] Allow copying a pose and pasting it mirrored.
* [ ] Allow paired-limb phase offset helpers.
* [ ] Show ghost previous/next poses while animating.
* [ ] Provide a legacy comparison mode for the wizard run migration.
* [ ] Export atlas, rig, animation, and character JSON.
* [ ] Keep the tool pleasant enough for long manual tuning sessions.

### Phase 2 Completion

* [ ] The wizard renders from `ct_atlas_wizard_1.png` and no longer needs individual body-part PNG files.
* [ ] The wizard run animation is reproduced by data-driven animation with near pixel-perfect parity.
* [ ] Jump, fall, hover, launch, idle, and landing poses are animation data rather than renderer-specific hardcoding.
* [ ] The character tool can edit and export wizard rig and animation data.
* [ ] The generic character renderer is ready to support monsters and other mobs.
* [ ] Headless and/or browser tests cover key migration risks.

## Phase 3: Monster and Mob Character Pipeline

Goal: use the Phase 2 character pipeline for enemies and non-wizard creatures.

### Monster Rig Support

* [ ] Create a simple humanoid enemy rig.
* [ ] Create a simple bat rig.
* [ ] Support rigs with fewer or different parts than Ignatius.
* [ ] Support mirrored monster rendering.
* [ ] Support non-humanoid role mappings.
* [ ] Support per-character animation state assignment.
* [ ] Allow characters to reuse, duplicate, or override animation templates.

### First Monster Animations

* [ ] Create a humanoid idle animation template.
* [ ] Create a humanoid walk/run animation template.
* [ ] Create a melee attack animation template.
* [ ] Create a hurt/recoil animation template.
* [ ] Create a bat flap animation.
* [ ] Create a bat dive/attack animation.
* [ ] Let `char_bat_1` map `fly` to a bat flap animation and `attack` to a bat attack animation.
* [ ] Let a humanoid enemy map `run` and `attack` to humanoid-style animations.

### Phase 3 Completion

* [ ] At least one non-wizard character uses the generic rig renderer.
* [ ] At least one monster has assigned animations for idle/move/attack/hurt.
* [ ] Monster visuals remain renderer-owned while monster gameplay state remains simulation-owned.

## Phase 4: Combat, Destructibles, and Reactive Objects

Goal: make rockets and future weapons interact with enemies and world objects.

### Combat

* [ ] Add monster health and hurt/death state to `gameState`.
* [ ] Add projectile collision with monsters.
* [ ] Add projectile collision with terrain and destructible objects.
* [ ] Add player damage from hazards and enemies.
* [ ] Add health regeneration delay and feedback.
* [ ] Add hit flash and impact feedback.

### Destructible and Reactive Objects

* [ ] Define reactive world object data format.
* [ ] Add reactive objects to `gameState`.
* [ ] Add object health or trigger state.
* [ ] Add object state transitions: `intact`, `damaged`, `breaking`, `falling`, `fallen`, `destroyed`, `inactive`.
* [ ] Allow reactive objects to change collision geometry when their state changes.
* [ ] Add destructible barrier.
* [ ] Add breakable crate or obstacle.
* [ ] Add falling tree prototype that can become a bridge.
* [ ] Add projectile and explosion interaction with reactive objects.
* [ ] Add smoke-heavy destruction effects.
* [ ] Add tests for object state, collision updates, and serialization.

### Phase 4 Completion

* [ ] Ignatius can damage enemies.
* [ ] Ignatius can damage or alter reactive world objects.
* [ ] Destructible and reactive changes are serialized in `gameState`.
* [ ] Rocket impacts no longer pass through gameplay-relevant objects.

## Phase 5: Weapon Framework

Goal: turn the current rocket behavior into a flexible weapon system.

* [ ] Define weapon data format.
* [ ] Define launch mode data format.
* [ ] Define projectile data format.
* [ ] Add quick launch mode.
* [ ] Add held aimed launch mode.
* [ ] Add homing launch mode.
* [ ] Add ballistic launch mode if still desired.
* [ ] Add weapon cooldowns and fuel costs.
* [ ] Add deterministic fallback behavior when no target is found.
* [ ] Add tests for launch modes and projectile outcomes.

## Phase 6: Camera, HUD, and Game Feel

Goal: make the prototype readable and pleasant during fast movement.

* [ ] Add smooth camera follow.
* [ ] Add horizontal look-ahead.
* [ ] Add vertical anticipation.
* [ ] Add camera bounds.
* [ ] Add camera debug mode.
* [ ] Polish fuel and health HUD.
* [ ] Add weapon indicator.
* [ ] Add aiming reticle.
* [ ] Add landing, boost, launch, damage, and impact feedback.
* [ ] Add sound hooks when useful.

## Phase 7: Handmade Level and Story Wrapper

Goal: build one complete data-driven level with story wrapper elements.

* [ ] Build one complete handmade level using atlas assets.
* [ ] Add start area, movement section, boost section, combat section, pickups, and exit.
* [ ] Add mailbox entity.
* [ ] Add editor letter scroll.
* [ ] Add thought bubbles.
* [ ] Add level title display.
* [ ] Add title revision gag.
* [ ] Add restart/reset behavior.

## Phase 8: Procedural Generation Foundation

Goal: generate simple playable levels from reusable pieces.

* [ ] Create seeded level generator.
* [ ] Generate floor paths, platforms, vertical spaces, obstacles, start, exit, pickups, monsters, and decorations.
* [ ] Define generator parameters for size, difficulty, theme, and required mechanics.
* [ ] Add structural validation.
* [ ] Add headless winnability testing.
* [ ] Store failed seeds and failure reasons.
* [ ] Account for reactive-object solutions such as falling bridges.

## Phase 9: Themed Procedural Levels

Goal: generate distinct validated levels for different themes.

* [ ] Define theme data format.
* [ ] Add theme-specific atlases, decorations, hazards, monsters, pickup rules, and generation rules.
* [ ] Add multiple themes.
* [ ] Add difficulty scaling between themes.
* [ ] Add fallback if generation repeatedly fails.

## Phase 10: Progression, Enemy Variety, Bosses, and Release Preparation

Goal: grow the game beyond isolated prototype levels.

* [ ] Add save data.
* [ ] Add upgrades and unlocks.
* [ ] Add varied enemies.
* [ ] Add boss arena format.
* [ ] Add boss prototype.
* [ ] Add accessibility options.
* [ ] Add performance pass.
* [ ] Add WebGL2 renderer if needed.
* [ ] Add audio and polish.
* [ ] Package a playable release build.
