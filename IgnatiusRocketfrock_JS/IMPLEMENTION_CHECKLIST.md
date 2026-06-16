# Ignatius Rocketfrock Implementation Plan

This document augments `PLAN.md`.

`PLAN.md` describes the game design.
This document describes the implementation order and provides checkable development tasks.

The current development target is **Phase 1 only**. After Phase 1, development should pause so the physics can be tested, tuned, and played with before content is added.

## Phase 1: Physics Test Arena

Goal: create a minimal playable arena for testing Ignatius movement, physics, fuel, and attached boost behavior.

This phase intentionally uses simple placeholder geometry and minimal presentation.

### Project Structure

* [ ] Create or clean up the main project file structure.
* [ ] Create `game.html`.
* [ ] Create `IgnatiusRocketfrock_SIM.js`.
* [ ] Create `IgnatiusRocketfrock_INPUT.js`.
* [ ] Create `IgnatiusRocketfrock_RENDER.js`.
* [ ] Create `IgnatiusRocketfrock_GAME.js`.
* [ ] Create or update `testbench.mjs`.
* [ ] Keep simulation code independent from DOM, canvas, WebGL, and browser events.
* [ ] Keep rendering code thin and state-driven.
* [ ] Keep input mapping separate from simulation rules.

### Single Game State

* [ ] Define the initial top-level `gameState` structure.
* [ ] Store all gameplay state inside `gameState`.
* [ ] Keep loaded images, canvas contexts, DOM nodes, and renderer caches outside `gameState`.
* [ ] Add a simple `gameState.meta.schemaVersion`.
* [ ] Add `gameState.clock`.
* [ ] Add `gameState.player`.
* [ ] Add `gameState.fuel`.
* [ ] Add `gameState.world`.
* [ ] Add `gameState.collisions`.
* [ ] Add `gameState.debug`.
* [ ] Add `gameState.debug.lastEvents`.
* [ ] Make `gameState` serializable to JSON.
* [ ] Make `gameState` cloneable for debugging/tests.

### Fixed Timestep Simulation

* [ ] Implement a fixed timestep update loop.
* [ ] Make the simulation step accept `gameState` and `inputFrame`.
* [ ] Make the simulation step return or mutate `gameState` consistently.
* [ ] Prevent simulation behavior from depending directly on browser frame rate.
* [ ] Add pause.
* [ ] Add single-frame stepping.
* [ ] Add reset to initial arena state.

### Input

* [ ] Read keyboard input.
* [ ] Convert keyboard state into an `inputFrame`.
* [ ] Support left movement.
* [ ] Support right movement.
* [ ] Support jump press, hold, and release.
* [ ] Support weapon/rocket button press, hold, and release, even if detached weapons are not fully implemented yet.
* [ ] Add basic gamepad input only if it does not distract from physics work.
* [ ] Make input state visible in the debug overlay.

### Arena Geometry

* [ ] Create a simple test arena.
* [ ] Add a floor.
* [ ] Add left and right boundary walls.
* [ ] Add a few rectangular test platforms.
* [ ] Add a vertical test shaft.
* [ ] Add a wide horizontal test gap.
* [ ] Add a safe reset area or reset shortcut.
* [ ] Store arena collision geometry in `gameState`.
* [ ] Render collision geometry with placeholders.
* [ ] Add optional debug drawing for collision bounds.

### Player Movement

* [ ] Add player position.
* [ ] Add player velocity.
* [ ] Add player acceleration or accumulated forces.
* [ ] Add gravity.
* [ ] Add horizontal acceleration.
* [ ] Add horizontal friction.
* [ ] Add ground detection.
* [ ] Add wall collision.
* [ ] Add platform collision.
* [ ] Add jump behavior.
* [ ] Add airborne state.
* [ ] Add facing direction.
* [ ] Add basic landing behavior.
* [ ] Add debug display for movement values.

### Attached Rocket Boost

* [ ] Add attached boost state.
* [ ] Trigger attached boost from the jump input while airborne.
* [ ] Stop attached boost when jump is released.
* [ ] Stop attached boost when fuel runs out.
* [ ] Stop attached boost when Ignatius lands.
* [ ] Apply boost force through the simulation.
* [ ] Drain fuel while boosting.
* [ ] Emit debug events for boost start and boost end.
* [ ] Render a simple placeholder rocket or use the existing rocket sprite if convenient.

### Fuel

* [ ] Add fuel amount.
* [ ] Add maximum fuel.
* [ ] Add recharge cap.
* [ ] Add recharge delay after use.
* [ ] Add recharge over time.
* [ ] Prevent fuel from going below minimum.
* [ ] Prevent fuel from going above maximum.
* [ ] Prevent recharge above the current recharge cap.
* [ ] Show fuel in debug overlay.
* [ ] Add a temporary simple fuel gauge.

### Debug Tools

* [ ] Add on-screen debug overlay.
* [ ] Show current simulation tick.
* [ ] Show player position.
* [ ] Show player velocity.
* [ ] Show player grounded/airborne state.
* [ ] Show facing direction.
* [ ] Show fuel amount.
* [ ] Show boost state.
* [ ] Show input state.
* [ ] Show recent debug events.
* [ ] Add toggle for hitboxes.
* [ ] Add toggle for velocity vector.
* [ ] Add toggle for collision geometry.
* [ ] Add state export to console or clipboard.
* [ ] Add simple way to inspect `gameState` from browser devtools.
* [ ] Add simple live tuning of important physics constants if practical.

### Headless Tests

* [ ] Make the sim importable from `testbench.mjs`.
* [ ] Create an initial test arena state without browser rendering.
* [ ] Test that the simulation can step headlessly.
* [ ] Test that `gameState` can be serialized.
* [ ] Test that `gameState` can be cloned.
* [ ] Test basic left/right movement symmetry.
* [ ] Test jump state transitions.
* [ ] Test boost state transitions.
* [ ] Test fuel drain.
* [ ] Test fuel recharge delay.
* [ ] Test collision stability with floor.
* [ ] Test collision stability with wall.
* [ ] Add a simple pass/fail console report.

### Phase 1 Stop Point

* [ ] Confirm the arena runs in the browser.
* [ ] Confirm the headless tests run.
* [ ] Confirm debug tools are enough to tune physics.
* [ ] Confirm movement constants can be adjusted without hunting through code.
* [ ] Stop adding new gameplay features.
* [ ] Spend time playing with physics.
* [ ] Tune movement, jump, boost, friction, and fuel behavior.
* [ ] Update `PLAN.md` if the physics experiments change the intended design.

## Phase 2: User Asset Intake and Asset Pipeline

Goal: integrate the next batch of user-provided assets without changing core simulation logic.

This phase starts after the physics arena feels good.

The user is expected to add assets such as monsters, monster parts, floor pieces, pillars, platforms, obstacles, pickups, and decorations.

### Asset Loading

* [ ] Create an asset manifest format.
* [ ] Add image loading.
* [ ] Add missing-asset placeholders.
* [ ] Add asset load status reporting.
* [ ] Add support for local development paths.
* [ ] Add support for grouped assets by category.
* [ ] Keep asset objects outside `gameState`.

### Player Asset Integration

* [ ] Hook existing Ignatius rig assets into the new renderer.
* [ ] Render the current wizard rig from simulation state.
* [ ] Preserve support for mirroring.
* [ ] Keep rig configuration data separate from gameplay state.
* [ ] Add basic animation state driven by `gameState.player`.

### Monster Asset Support

* [ ] Define a simple monster rig format.
* [ ] Support monsters with fewer parts than Ignatius.
* [ ] Support static placeholder monsters.
* [ ] Support rigged monster rendering.
* [ ] Support mirrored monster rendering.
* [ ] Add monster asset previews or debug placement view.

### Environment Pieces

* [ ] Define floor section asset type.
* [ ] Define pillar asset type.
* [ ] Define platform asset type.
* [ ] Define obstacle asset type.
* [ ] Define decorative asset type.
* [ ] Connect visual pieces to collision definitions.
* [ ] Allow placeholder collision-only pieces during development.

### Phase 2 Completion

* [ ] User-provided assets can be loaded.
* [ ] New monster visuals can be displayed.
* [ ] Modular floor and platform pieces can be displayed.
* [ ] Collision remains simulation-owned.
* [ ] Rendering still reads from `gameState`.

## Phase 3: Handmade Arena With Assets

Goal: replace the plain physics arena with a visually assembled arena using modular pieces and early monsters.

### Arena Construction

* [ ] Build an arena from modular floor pieces.
* [ ] Add pillars.
* [ ] Add platforms.
* [ ] Add simple obstacles.
* [ ] Add placeholder or first-pass decorations.
* [ ] Place stationary monsters.
* [ ] Place fuel pickups.
* [ ] Add a simple start point.
* [ ] Add a simple exit or end marker.

### Entity Placement

* [ ] Add entity placement data to level definitions.
* [ ] Spawn player from level data.
* [ ] Spawn monsters from level data.
* [ ] Spawn pickups from level data.
* [ ] Spawn obstacles from level data.
* [ ] Add debug labels for entity IDs.

### Phase 3 Completion

* [ ] The arena is built from reusable pieces.
* [ ] The arena still works with headless tests.
* [ ] Assets improve readability without changing the physics model.

## Phase 4: Basic Combat Prototype

Goal: make Ignatius interact with monsters and hazards.

### Monsters

* [ ] Add monster state to `gameState`.
* [ ] Add monster health.
* [ ] Add monster hitboxes.
* [ ] Add monster hurt/death state.
* [ ] Add stationary monster behavior.
* [ ] Add simple monster animation hooks.
* [ ] Add monster debug display.

### Player Health

* [ ] Add player health state.
* [ ] Add player damage.
* [ ] Add invulnerability window after damage if needed.
* [ ] Add health regeneration delay.
* [ ] Add health regeneration.
* [ ] Add low-health visual state.
* [ ] Add health debug events.

### First Projectile

* [ ] Add projectile list to `gameState`.
* [ ] Add basic projectile spawn.
* [ ] Add projectile movement.
* [ ] Add projectile collision with monsters.
* [ ] Add projectile collision with terrain.
* [ ] Add projectile lifetime.
* [ ] Add projectile impact event.
* [ ] Add placeholder explosion effect.

### Phase 4 Completion

* [ ] Ignatius can damage a monster.
* [ ] Ignatius can take damage.
* [ ] Health can regenerate.
* [ ] Projectiles are tracked in `gameState`.
* [ ] Combat can be tested headlessly.

## Phase 5: Generic Weapon Framework

Goal: turn the first projectile into a flexible weapon system.

### Weapon Definitions

* [ ] Define weapon data format.
* [ ] Define weapon mode data format.
* [ ] Define projectile data format.
* [ ] Add weapon cooldown.
* [ ] Add weapon fuel cost.
* [ ] Add weapon availability checks.
* [ ] Add mounted equipment state.
* [ ] Add weapon debug display.

### Launch Modes

* [ ] Implement quick launch mode.
* [ ] Implement held aimed launch mode.
* [ ] Implement homing launch mode.
* [ ] Implement ballistic launch mode if still desired.
* [ ] Add launch clearance behavior where relevant.
* [ ] Add deterministic fallback behavior when no target is found.
* [ ] Add tests for each implemented launch mode.

### Phase 5 Completion

* [ ] New weapon modes can be added as data plus behavior functions.
* [ ] Player movement code does not need to know weapon internals.
* [ ] Existing rocket behavior is expressed through the weapon framework.

## Phase 6: Hat and Secondary Character States

Goal: support the hat as an independent stateful object and prepare for more character reactions.

### Hat

* [ ] Add hat state to `gameState`.
* [ ] Support worn hat state.
* [ ] Support detached hat state.
* [ ] Support flying hat physics.
* [ ] Support landed hat state.
* [ ] Support hat return or reattach.
* [ ] Add temporary trigger for hat loss.
* [ ] Add debug events for hat loss and return.
* [ ] Ensure gameplay does not break when the hat is not worn.

### Secondary Animation Hooks

* [ ] Add hooks for beard motion.
* [ ] Add hooks for hair strands.
* [ ] Add hooks for robe secondary motion.
* [ ] Keep these visual systems from owning gameplay state.

### Phase 6 Completion

* [ ] Hat can leave and return.
* [ ] Hat behavior is visible in `gameState`.
* [ ] Secondary animation hooks are ready for polish.

## Phase 7: Camera, HUD, and Game Feel

Goal: make the prototype readable and pleasant during fast movement.

### Camera

* [ ] Add camera state.
* [ ] Add smooth follow.
* [ ] Add horizontal look-ahead.
* [ ] Add vertical anticipation.
* [ ] Add camera bounds.
* [ ] Add debug camera mode.
* [ ] Decide which camera values belong in `gameState`.

### HUD

* [ ] Replace temporary fuel gauge with proper HUD fuel gauge.
* [ ] Add health display.
* [ ] Add weapon indicator.
* [ ] Add aiming reticle.
* [ ] Add optional debug HUD panel.
* [ ] Add low-health visual treatment.

### Game Feel

* [ ] Add hit flash.
* [ ] Add landing feedback.
* [ ] Add boost feedback.
* [ ] Add projectile launch feedback.
* [ ] Add explosion feedback.
* [ ] Add temporary sound hooks.
* [ ] Add screen shake only where useful.

### Phase 7 Completion

* [ ] Fast movement remains readable.
* [ ] Fuel, health, and weapon state are understandable without debug overlay.
* [ ] Camera supports the current arena size.

## Phase 8: Level Format and Handmade Level

Goal: define the level data format and build one small handmade level.

### Level Format

* [ ] Define level metadata.
* [ ] Define static geometry list.
* [ ] Define collision list.
* [ ] Define entity spawn list.
* [ ] Define pickup spawn list.
* [ ] Define decoration list.
* [ ] Define start and exit.
* [ ] Define theme ID.
* [ ] Define story/mailbox fields.
* [ ] Add level loading.
* [ ] Add level reset.

### Handmade Level

* [ ] Build one complete handmade test level.
* [ ] Add start area.
* [ ] Add mailbox placeholder.
* [ ] Add movement section.
* [ ] Add boost section.
* [ ] Add combat section.
* [ ] Add pickups.
* [ ] Add exit.
* [ ] Add restart on failure or manual reset.

## Phase 7.5: Destructible and Reactive World Objects

Goal: support gameplay objects that can change the traversable level state.

### Object Framework

- [ ] Define reactive world object data format.
- [ ] Add reactive objects to `gameState`.
- [ ] Add object health or trigger state.
- [ ] Add object state transitions.
- [ ] Add object collision updates.
- [ ] Add object rendering state.
- [ ] Add debug events for object state changes.
- [ ] Add save/load support for changed object state.

### First Reactive Objects

- [ ] Add destructible barrier.
- [ ] Add breakable crate or obstacle.
- [ ] Add falling tree prototype.
- [ ] Make fallen tree create a walkable bridge.
- [ ] Add projectile interaction with reactive objects.
- [ ] Add explosion interaction with reactive objects.
- [ ] Add debug visualization for before/after collision shapes.

### Tests

- [ ] Test that a projectile can damage a reactive object.
- [ ] Test that object state changes are stored in `gameState`.
- [ ] Test that collision changes after destruction or falling.
- [ ] Test that a fallen bridge can be crossed.
- [ ] Test serialization after object state changes.
- [ ] Test replay determinism for object interactions.

### Generator Support

- [ ] Mark reactive objects as optional, required, or decorative.
- [ ] Allow generated levels to include required reactive-object solutions.
- [ ] Teach structural validation about state-changing paths.
- [ ] Teach headless winnability testing to use required object interactions.
- [ ] Store failure reasons when a reactive-object puzzle cannot be solved.

### Phase 8 Completion

* [ ] A small handmade level can be played from start to finish.
* [ ] The level is data-driven.
* [ ] The same level can be loaded in browser and headless testbench.

## Phase 9: Story Wrapper Prototype

Goal: add the level intro structure without building the whole narrative system at once.

### Mailbox and Letters

* [ ] Add mailbox entity.
* [ ] Add mailbox interaction.
* [ ] Add editor letter data.
* [ ] Add scroll display.
* [ ] Add thought bubble display.
* [ ] Add level title display.
* [ ] Add simple continue/close input.
* [ ] Store story progress in `gameState`.

### Phase 9 Completion

* [ ] A level can start with a mailbox letter.
* [ ] The letter can introduce the level.
* [ ] The title gag can be displayed.
* [ ] Gameplay can resume after the letter.

## Phase 10: Procedural Generation Foundation

Goal: generate simple levels from reusable pieces.

### Generator Structure

* [ ] Create seeded level generator.
* [ ] Add generator input parameters.
* [ ] Add generator output format compatible with the level loader.
* [ ] Add theme field.
* [ ] Add size parameters.
* [ ] Add difficulty parameter.
* [ ] Add required mechanics parameter.
* [ ] Add debug output for generated levels.

### Geometry Generation

* [ ] Generate floor path.
* [ ] Generate platforms.
* [ ] Generate vertical spaces.
* [ ] Generate obstacles.
* [ ] Generate start location.
* [ ] Generate exit location.
* [ ] Generate pickup locations.
* [ ] Generate monster locations.
* [ ] Generate decoration placements.

### Phase 10 Completion

* [ ] A generated level can be loaded and played.
* [ ] A generated level can be reproduced from its seed.
* [ ] A generated level can be inspected in debug mode.

## Phase 11: Structural Validation for Generated Levels

Goal: reject obviously broken generated levels before running expensive play tests.

### Validation

* [ ] Confirm start exists.
* [ ] Confirm exit exists.
* [ ] Confirm player spawn is not blocked.
* [ ] Confirm exit is not blocked.
* [ ] Confirm required pickups are reachable according to coarse graph checks.
* [ ] Confirm major regions are connected.
* [ ] Confirm no required path is sealed.
* [ ] Confirm generated collision geometry is valid.
* [ ] Report validation failure reason.
* [ ] Store failed seed for debugging.

### Phase 11 Completion

* [ ] Structurally invalid generated levels are rejected automatically.
* [ ] Failure reasons are clear enough to debug generator rules.

## Phase 12: Headless Winnability Testing

Goal: generated levels must be playable by the simulation before the user is asked to play them.

### Headless Runner

* [ ] Add headless level loading.
* [ ] Add headless simulation runner.
* [ ] Add replay trace format.
* [ ] Add timeout handling.
* [ ] Add success condition detection.
* [ ] Add failure reason reporting.
* [ ] Add seed rejection/regeneration loop.

### Bot Controller

* [ ] Implement simple navigation bot.
* [ ] Add path-following behavior.
* [ ] Add jump decision behavior.
* [ ] Add boost decision behavior.
* [ ] Add pickup-seeking behavior when required.
* [ ] Add basic hazard avoidance.
* [ ] Add basic enemy avoidance or combat behavior if required.
* [ ] Save replay trace when bot succeeds.
* [ ] Save failure trace when bot fails.

### Robustness Pass

* [ ] Test at least one successful route.
* [ ] Test with imperfect timing where practical.
* [ ] Test with some optional pickups ignored.
* [ ] Test with minor damage allowed.
* [ ] Reject levels that require perfect play unless explicitly intended.

### Phase 12 Completion

* [ ] Generated levels are not shown to the player until they pass validation.
* [ ] A passing generated level has a replayable headless success trace.
* [ ] Failed generated levels can be reproduced from seed and failure report.

## Phase 13: Themed Procedural Levels

Goal: generate distinct validated levels for different themes.

### Theme System

* [ ] Define theme data format.
* [ ] Add theme-specific tiles/pieces.
* [ ] Add theme-specific decorations.
* [ ] Add theme-specific hazards.
* [ ] Add theme-specific monster sets.
* [ ] Add theme-specific pickup rules.
* [ ] Add theme-specific generation rules.
* [ ] Add theme-specific editor title data.

### Theme Progression

* [ ] Add first theme.
* [ ] Add second theme.
* [ ] Add third theme.
* [ ] Add difficulty scaling between themes.
* [ ] Add generated level selection flow.
* [ ] Add fallback if generation repeatedly fails.

### Phase 13 Completion

* [ ] Multiple themes can generate distinct playable levels.
* [ ] Generated levels pass structural validation and headless winnability tests.
* [ ] Theme identity is visible in layout, art, hazards, and story wrapper.

## Phase 14: Progression and Upgrades

Goal: add longer-term structure beyond isolated levels.

### Player Progression

* [ ] Add save data.
* [ ] Add unlocked upgrades.
* [ ] Add fuel upgrades.
* [ ] Add health upgrades if desired.
* [ ] Add weapon unlocks.
* [ ] Add weapon mode unlocks.
* [ ] Add level/theme progression.
* [ ] Add upgrade collection or reward flow.

### Phase 14 Completion

* [ ] Player progress persists.
* [ ] Upgrades affect future runs or levels.
* [ ] Progression does not break headless validation assumptions.

## Phase 15: Enemy Variety and Bosses

Goal: expand encounters after the core game loop works.

### Enemy Expansion

* [ ] Add moving enemy.
* [ ] Add flying enemy.
* [ ] Add shielded enemy.
* [ ] Add enemy with weak point.
* [ ] Add enemy that encourages a specific weapon mode.
* [ ] Add enemy that interacts with hat behavior if useful.
* [ ] Add enemy behavior tests.

### Bosses

* [ ] Add boss arena format.
* [ ] Add first boss prototype.
* [ ] Add boss health/state machine.
* [ ] Add boss attacks.
* [ ] Add boss-specific camera behavior.
* [ ] Add boss-specific editor letter.
* [ ] Add boss headless validation or scripted test coverage.

### Phase 15 Completion

* [ ] Enemies create varied play situations.
* [ ] At least one boss encounter is playable.
* [ ] New enemy behavior remains testable.

## Phase 16: Polish, Accessibility, and Release Preparation

Goal: turn the game from working prototype into finished playable game.

### Polish

* [ ] Replace placeholder visuals.
* [ ] Add final animations.
* [ ] Add final effects.
* [ ] Add sound effects.
* [ ] Add music.
* [ ] Add menu.
* [ ] Add pause screen.
* [ ] Add settings screen.
* [ ] Add credits.
* [ ] Add title screen.
* [ ] Add loading flow.

### Accessibility and Usability

* [ ] Add remappable controls.
* [ ] Add keyboard-only support.
* [ ] Add gamepad support.
* [ ] Add volume controls.
* [ ] Add screen shake intensity setting.
* [ ] Add readable font sizing.
* [ ] Add colorblind-safe HUD review.
* [ ] Add reduced flashing option if needed.
* [ ] Add difficulty options if needed.

### QA

* [ ] Add smoke test suite.
* [ ] Add generated-level regression seeds.
* [ ] Add replay-based bug reproduction.
* [ ] Add performance profiling.
* [ ] Add memory usage checks.
* [ ] Add browser compatibility checks.
* [ ] Add save compatibility checks.
* [ ] Add release build process.

### Phase 16 Completion

* [ ] The game is content-complete.
* [ ] The game can be played through.
* [ ] Generated levels are validated before play.
* [ ] Major systems are covered by tests.
* [ ] Known issues are tracked.
* [ ] Release build is ready.
