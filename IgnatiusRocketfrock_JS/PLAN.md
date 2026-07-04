# Ignatius Rocketfrock Plan

## Project Layout

The project uses directory context instead of repeating `IgnatiusRocketfrock_` in every filename.

```text
IgnatiusRocketfrock_JS/
├── index.html, game.html, renderer-smoke.html
├── asset-editor.html, level-editor.html, character-editor.html
├── src/
│   ├── core/
│   │   ├── simulation.js
│   │   ├── enemy-navigation.js
│   │   └── world-collision-index.js
│   ├── browser/
│   │   ├── browser-input.js
│   │   ├── electron-window-bridge.js
│   │   ├── game-bootstrap.js
│   │   ├── game-settings-store.js
│   │   ├── gamepad-haptics.js
│   │   ├── hud-panel-layout.js
│   │   ├── music-director.js
│   │   ├── music-engine-host.js
│   │   └── music-engine-sources.js
│   ├── presentation/
│   │   ├── canvas-renderer.js
│   │   ├── webgl2-renderer.js
│   │   ├── cave-window-mask.js
│   │   ├── character-runtime.js
│   │   ├── foreground-sprite-treatment.js
│   │   ├── level-color-map-cache.js
│   │   ├── overlap-blend-cache.js
│   │   ├── rocket-glow-baking.js
│   │   └── world-visual-cache.js
│   ├── shared/
│   │   ├── actor-geometry.js, animation-data.js
│   │   ├── auto-spawn-enemy-data.js, enemy-pool-data.js
│   │   ├── cave-kill-boundary-data.js, cave-window-data.js
│   │   ├── cave-window-decoration.js, level-color-map-data.js
│   │   ├── level-generator-data.js, level-transform.js
│   │   ├── moving-platform-data.js, signal-channel-data.js
│   │   ├── game-settings-data.js, music-data.js
│   │   ├── power-up-data.js, story-reading.js
│   │   └── other engine-neutral data helpers
│   └── tools/character-editor/
│       ├── animation-editor.js, atlas-editor.js
│       ├── character-dirty-state.js, character-editor-view.js
│       ├── character-project.js
│       └── dopesheet-data.js
├── tests/testbench.mjs
├── assets/
│   └── music/ignatius_music_selections.json
├── devel/package_update.py
├── electron/
├── package.json
├── AGENTS.md, ARCHITECTURE.md
├── IMPLEMENTATION_CHECKLIST.md
└── PLAN.md
```

`package.json` declares the browser-style ES-module format and provides the dependency-free `npm test` command. `ARCHITECTURE.md` is the authoritative directory, dependency, classification, and JavaScript-to-C++ parity map. The root HTML pages remain stable browser entry points. Their large inline editor applications should be extracted one editor at a time into uniquely named modules such as `level-editor-app.js`; do not use several ambiguous files all named `app.js`.


## Near-Term Cave-Window Authoring Track

The immediate development track is a cave-perimeter and foreground presentation system that can be built from existing atlas art before any new falling-tree asset is required. The visual premise is a window cut through a much larger black rock mass. A closed spline describes the opening, perimeter decorations feather outward into black, and selected stalagmites or other formations may be drawn in front of Ignatius to create depth.

The perimeter is completely inert. It is not a collision boundary, not a platform generator, not a navigation surface, and not a substitute for the playing-area layer. Floors, walls, ceilings, hazards, and platforms remain explicitly authored gameplay geometry. A platform can sit just behind the lower perimeter so Ignatius is partly occluded by foreground stalagmites, but gameplay geometry placed far outside the visible opening should be flagged as confusing authoring.

The foreground perimeter and its decorations should scroll with a subtle, configurable parallax offset relative to the playing area. Foreground placements are automatically non-colliding regardless of their atlas manifest. They are rendered darker and may be slightly desaturated. The world-space cave-window mask owns the transparent-to-black perimeter fade; no Foreground or Background asset may carry a sprite-local gradient when moved elsewhere.

Implementation order:

1. **Complete in revision 135:** cleanup-only audit, obsolete aliases, and source-boundary debt.
2. **Complete in revision 136:** whole-level zoom/fit controls and closed spline editing in the Level Editor.
3. **Complete in revision 136:** normalized visual perimeter data with no derived gameplay collision.
4. Render the black exterior, feathered cave opening, and subtle foreground parallax. Completed in revision 137.
5. **Complete in revision 138:** deterministic floor/wall/ceiling decoration placement from tagged atlas assets.
6. **Complete in revision 138:** manually and automatically placed dark foreground formations with collision forcibly disabled.
7. **Complete in revision 139:** Canvas 2D performance pass for dense cave decoration: cached layer partitioning, conservative viewport culling, cached foreground treatment, reduced-resolution mask rendering, and renderer diagnostics.
8. **Complete in revision 140:** Level Editor performance parity, optional generated-art visibility, adaptive overlap for top/bottom perimeter coverage, and cached outward-to-black sprite fades shared with runtime.
9. **Complete in revision 141:** tune the default foreground scale/parallax, broaden and ease the black handover, overlap generated art farther into the opening, and prevent starter-spline corner loops.
10. **Complete in revision 145:** warn when collision-bearing gameplay placements are completely hidden far outside the authored cave opening.
11. Validate representative decorated caves on target browsers before deciding whether WebGL2 is necessary. If it is, reuse the same cached visual records, bounds, and draw-order partitions as the backend input model.

## Intro

This is a 2D platformer starring Ignatius Rocketfrock, a cartoony wizard who can conjure a rocket onto his back.

Ignatius usually runs from left to right, but all gameplay and assets should support mirroring so he can face and move left just as naturally.

The game is written in HTML and JavaScript.

The core game fantasy is not only jumping, but converting movement into chaotic magical propulsion. Ignatius should feel like a wizard-scholar who has discovered Newtonian physics and immediately made it everyone else's problem.

## Core Design Goals

* The play area should use the full screen.
* The core movement should be expressive, physics-driven, and testable.
* The player should be able to run, jump, boost vertically with the attached rocket, and launch detachable weapons.
* The first playable version should prioritize feel over content.
* There should be few or no precision jumping puzzles at first.
* Early levels should behave more like movement arenas and target-practice spaces.
* The design must support future weapon modes, alternate rockets, magical projectiles, upgrades, and unusual launch behaviors.
* The presentation should be charming and cartoony, but the simulation underneath should be deterministic and reliable.

## Architecture

Separate the game into clean layers. The current source directories encode those boundaries:

* `src/core/` is the future portable gameplay core and should have close C++ parity.
* `src/shared/` contains engine-neutral data and mathematics used by multiple layers, including `enemy-scale-data.js` as the single authority for uniform character-enemy placement scaling.
* `src/browser/` owns browser startup, timing, and device adaptation.
* `src/presentation/` owns Canvas rendering and visual-only runtime work.
* `src/tools/` owns editor-only helpers and future editor entry modules.
* `tests/` owns headless, integration, and future cross-language parity fixtures.

New source files should use lowercase kebab-case and unique descriptive filenames. Browser, presentation, and editor modules do not require file-for-file C++ equivalents. The parity commitment applies to the portable core interface and shared data contracts.

### `src/core/simulation.js`

Pure deterministic simulation.

This file should contain:

* The single hierarchical game state structure.
* Player physics.
* Rocket and weapon state machines.
* Fuel system.
* Health system.
* Hat state.
* Enemy state.
* Pickup state.
* Collision detection.
* Level geometry.
* Camera-relevant world state, but not camera rendering.
* Deterministic random state.
* Debug events and debug flags.

This file should not contain:

* DOM code.
* Canvas code.
* WebGL code.
* Direct keyboard handling.
* Direct gamepad handling.
* Image objects.
* Audio objects.
* Browser event objects.
* Real-time clock dependencies.

The sim should accept fixed time steps and input snapshots, then update and return the game state.

### `src/browser/browser-input.js`

Converts messy input devices into clean game commands.

Input sources:

* Keyboard.
* Gamepad.
* Later possibly mouse, touch, or remappable controls.

The input layer should produce input-frame objects with commands such as:

* `moveLeft`
* `moveRight`
* `jumpPressed`
* `jumpHeld`
* `jumpReleased`
* `weaponPressed`
* `weaponHeld`
* `weaponReleased`
* `aimVector`
* `aimTarget`

The simulation should only receive these clean input frames. It should not care where they came from.

### `src/presentation/canvas-renderer.js`

Thin presentation layer.

This file should draw the state produced by the sim.

It may use WebGL for performance, but the sim must not depend on WebGL.

Rendering includes:

* World.
* Ignatius rig.
* Hat.
* Rocket or mounted weapon visuals.
* Projectiles.
* Particles.
* Enemies.
* Pickups.
* HUD.
* Debug overlays.

The renderer should read from `gameState`, but should not own gameplay state.

Revision 126 adds a dedicated Puppet Guide toggle for enemy diagnostics. It is disabled by default and draws enemy body/hurtbox geometry, awareness, attack windows, target anchors, patrol/route information, and last-seen markers without changing gameplay. Exact projectile and melee rectangles come from `src/shared/actor-geometry.js`, which is also used by the simulation.

### `src/browser/game-bootstrap.js`

Main browser orchestration.

Responsibilities:

* Load assets and authoring documents.
* Normalize authored level data and collision manifests before applying them to the simulation.
* Pass gameplay level definitions to the simulation and visual resources to the renderer independently.
* Start the game loop.
* Connect input, sim, and renderer.
* Manage fixed timestep simulation.
* Handle pause, restart, debug flags, and dev tools.

### `tests/testbench.mjs`

Headless and integration tests.

The testbench should be able to run the simulation without rendering.

Some integration tests may still use Playwright to verify browser behavior, but most mechanical tests should target the simulation directly.

## Future C++ and Unreal Engine Portability

The HTML and JavaScript version remains the reference implementation while the game is developed. A later Unreal Engine port should translate the gameplay model rather than redesign it around Unreal-specific gameplay physics.

The eventual port should have two layers:

* `RocketfrockCore`: ordinary engine-neutral C++ containing gameplay state, fixed-step simulation, collision, weapons, enemies, reactive objects, story state, serialization, and tests.
* `RocketfrockUnreal`: a thin Unreal adapter that loads assets, converts device input into an input frame, advances the portable core, and presents state through Actors, components, sprites, audio, particles, UI, and camera systems.

The portable core must not depend on Actors, UObjects, rendering APIs, audio APIs, browser objects, Chaos physics, or Unreal Character Movement. Those systems may be used for presentation and non-authoritative debris, but the custom Rocketfrock simulation remains authoritative for gameplay motion and collision.

### Portable Simulation Contract

The JavaScript and C++ cores should preserve close structural and behavioral parity. Important functions should retain equivalent names, responsibilities, data fields, and update order where practical.

The core interface should remain conceptually equivalent to:

```text
createInitialGameState(configuration) -> GameState
normalizeLevelDefinition(authoringData, manifests) -> LevelDefinition
applyLevelDefinition(gameState, levelDefinition)
stepSimulation(gameState, inputFrame, fixedDt) -> SimulationEvent[]
serializeGameState(gameState)
restoreGameState(serializedState)
```

Parity means identical state-machine choices, events, collision outcomes, IDs, integer values, and update ordering, with floating-point values compared using documented tolerances. It does not require byte-identical floating-point results on every platform.

### Coordinate and Numeric Contract

The engine-neutral gameplay convention is:

* Positive X points right.
* Positive Y points down.
* Character Y positions normally identify the foot or ground baseline unless a field explicitly documents another anchor.
* Distances use virtual game units.
* Rotations use radians.
* Positive rotation is clockwise in the Y-down gameplay coordinate system.
* Gameplay calculations use finite double-precision-compatible numbers.
* Collision comparisons use named tolerances and documented tie-breaking rules.

The Unreal adapter is responsible for converting this convention into Unreal axes and units. Unreal coordinate conventions must not leak back into the portable core or shared gameplay JSON.

### Runtime Level Boundary

Authoring data and runtime gameplay data must be separated before procedural generation and reactive-world systems expand the level format.

Level loading should have two stages:

1. Import and normalize editor JSON, atlas collision manifests, and defaults into a versioned `LevelDefinition`.
2. Apply the normalized `LevelDefinition` to `GameState`, while passing visual placements and asset references separately to the presentation layer.

A runtime `LevelDefinition` may contain world bounds, doorway and player anchors, normalized collision geometry, stable entity IDs, enemies, pickups, hazards, reactive objects, and story definitions. PNG paths, atlas rectangles, colour-map settings, render layers, editor notes, and visual placements are presentation or authoring data.

The simulation must never obtain gameplay collision by querying the renderer. Asset loading or a dedicated level compiler should provide normalized collision to the simulation independently of visual resources.

### Authoritative State and Presentation State

`GameState` contains authoritative gameplay, story, save, replay, and deterministic state. Presentation-only data should be derived from authoritative state, maintained outside it, or produced in response to serializable `SimulationEvent` records.

Presentation-only examples include decorative smoke, camera interpolation, render interpolation, low-health colour pulse, hit flashes, temporary health-bar display timers, environment colour mapping, and doorway-only visual scaling. Gameplay animation intent may remain authoritative, but sprite or rig playback clocks should not silently control gameplay timing unless the same timing is represented explicitly in gameplay data.

Important one-tick transitions should be emitted as events such as `PLAYER_JUMPED`, `PLAYER_LANDED`, `BOOST_STARTED`, `WEAPON_LAUNCHED`, `PROJECTILE_IMPACTED`, `ENEMY_DAMAGED`, `ENEMY_DEFEATED`, and `LEVEL_TRANSITION_REQUESTED`. Presentation systems consume these events for effects without becoming gameplay authorities.

### Shared Schemas and Module Boundaries

Every cross-language runtime document should have a schema name and version. Required fields, optional fields, exact defaults, units, ranges, canonical string values, unknown-field behavior, and migrations must be documented.

As the simulation grows, split it into engine-neutral modules with future C++ equivalents:

* Core types, math, constants, tolerances, and deterministic random generation.
* State creation, validation, serialization, and migration.
* Runtime level definitions and entity spawning.
* Collision geometry and movement resolution.
* Player movement, health, fuel, hat, and equipment.
* Weapons and projectiles.
* Enemies and AI.
* Destructible and reactive objects.
* Story and level transitions.
* Simulation events.
* A small `simulation.js` facade that owns and documents fixed update order.

Module extraction must preserve behavior. `stepSimulation(...)` remains the authoritative orchestration boundary.

### Cross-Implementation Parity Tests

Before the full Unreal port begins, create language-neutral JSON fixtures containing an initial state or level, tuning overrides, tick-numbered input frames, expected events, selected expected state values, and numeric tolerances.

The JavaScript testbench and future C++ test runner should consume the same fixtures. They should cover movement, slopes, penetration recovery, doors, fuel, health, homing, projectile sweeps, enemies, reactive objects, procedural generation, and save/restore.

Maintain a canonical authoritative-state summary or hash. Exclude presentation state, renderer caches, debug prose, and unordered implementation details.

A small standalone C++ portability spike should be completed before procedural generation greatly expands the code and data surface. It only needs to port the core numeric types, input frame, a minimal game state, and representative movement/collision fixtures. The purpose is to expose schema, coordinate, update-order, and floating-point problems while they are still inexpensive to correct.

## Game State Structure

For debugging, testing, saving, replaying, and development tools, the entire simulation state should be kept in one hierarchical `gameState` object.

This object is the single source of truth for gameplay.

The simulation should update this structure directly or return a new updated copy.

The renderer should only read from this structure.

Input should be converted into a clean `inputFrame` object before being passed into the simulation.

### What belongs in `gameState`

`gameState` should include:

* Clock and fixed timestep counters.
* Current level ID.
* World bounds.
* Player state.
* Movement state.
* Health state.
* Fuel state.
* Hat state.
* Mounted equipment state.
* Active weapon state.
* Active projectiles.
* Enemies.
* Pickups.
* Level collision state.
* Story flags.
* Authoritative camera targets or bounds, but not presentation smoothing.
* Deterministic random seed and random generator state.
* Serializable debug flags that affect simulation inspection.
* Current-tick simulation events or a capped serializable copy of recent gameplay events.

### What does not belong in `gameState`

Do not store browser or rendering resources in `gameState`.

Keep these outside the simulation state:

* DOM nodes.
* Canvas contexts.
* WebGL handles.
* Textures.
* Image objects.
* Audio buffers.
* Raw keyboard events.
* Raw gamepad objects.
* Renderer caches.
* Loaded asset blobs.
* Environment visual placements and colour-map processing.
* Decorative particles and non-gameplay debris.
* Camera smoothing and render interpolation.
* Hit flashes, temporary health-bar timers, low-health colour pulse, and other transient UI effects.
* Doorway-only visual scale or other presentation transforms that do not alter collision.

### State ownership rule

If it affects authoritative gameplay, save/load, replay, deterministic tests, or a gameplay state transition, it belongs in `gameState`.

Serializable debug history may keep a capped copy of authoritative events, but debug prose, renderer caches, and presentation-only timing are excluded from save, replay, and parity hashes.

If it only displays, loads, interpolates, or plays the state, it belongs outside `gameState`.

### Suggested top-level state shape

```js
const gameState = {
    meta: {},
    clock: {},
    world: {},
    camera: {},
    player: {},
    fuel: {},
    equipment: {},
    weapons: {},
    projectiles: [],
    enemies: [],
    pickups: [],
    collisions: {},
    story: {},
    debug: {}
};
```

Avoid making the hierarchy unnecessarily deep. The state should be organized enough to inspect easily, but not so nested that every gameplay rule becomes a spelunking expedition.

### Debug event log

`stepSimulation(...)` should expose the authoritative events generated by the current tick. `gameState.debug.lastEvents` may store a capped serializable copy for inspection.

Example event types:

* `PLAYER_JUMPED`
* `PLAYER_BOOST_STARTED`
* `PLAYER_BOOST_ENDED`
* `FUEL_CHANGED`
* `WEAPON_LAUNCHED`
* `PROJECTILE_IMPACTED`
* `PLAYER_DAMAGED`
* `PLAYER_HEALED`
* `HAT_LOST`
* `HAT_RETURNED`
* `ENEMY_HIT`
* `PICKUP_COLLECTED`

These events should be small and serializable.

Example:

```js
gameState.debug.lastEvents.push({
    tick: gameState.clock.tick,
    type: "PLAYER_DAMAGED",
    amount: 34,
    sourceId: "slime_003"
});
```

This makes it easier to debug not only what the state is, but how it recently got there.

## Rendering

### Responsive Canvas Scaling Rule

The game uses a virtual viewport for small screens. Gameplay coordinates, physics, sprite placement, collisions, camera logic, particles, and input state should remain in virtual game coordinates. The renderer scales the whole canvas down when the visible CSS width is below the mobile minimum width.

Do not solve mobile sizing by individually scaling sprites, hitboxes, physics values, particles, camera values, or level geometry. That risks inconsistent scale bugs. Instead, keep game systems in virtual coordinates and adjust only the shared viewport/canvas transform layer.

Input coordinates from mouse, touch, and pointer events must be converted through the same viewport transform before being used by gameplay or virtual joystick logic.

* Use WebGL for performance when practical, but keep the renderer data-driven so the canvas renderer and later WebGL2 renderer can share the same character draw data.
* The renderer should remain a thin presentation layer.
* The renderer should support sprite-based rigging for Ignatius, monsters, and other animated characters.
* Character art should be loaded from atlas images rather than many individual body-part image files.
* Ignatius should move from individual body-part PNG files to `ct_atlas_wizard_1.png` plus atlas, rig, animation, and character JSON files.
* Character rendering should be generic: draw atlas frames with pivots, transforms, alpha, mirroring, and draw order.
* Assets should be mirrorable.
* Beard, hair, robe details, wings, dangling pieces, and similar secondary details may later use simple procedural modifiers layered on top of keyframed animation.
* The body should use relatively short hair and a short full beard in-game, with longer simulated strands added as separate animated details.

## Character Rigging and Animation

The game should use a reusable character pipeline instead of one custom renderer per character.

A character is assembled from these data layers:

* A character atlas image, such as `ct_atlas_wizard_1.png`.
* A character asset manifest, such as `ct_atlas_wizard_1.json`, containing named frame rectangles.
* A rig definition, such as `ct_rig_wizard_1.json`, describing parts, pivots, parent anchors, offsets, scale, roles, tags, and draw order.
* Animation definitions, such as `ct_anim_wizard_run_1.json`, describing keyframed motion over time.
* A character definition, such as `ct_char_wizard_1.json`, assigning a rig and animation set to a gameplay character.

Rigs should use part IDs and optional broad roles such as `root`, `torso`, `head`, `leftArm`, `rightArm`, `leftLeg`, `rightLeg`, `leftWing`, `rightWing`, `hat`, and `weaponMount`.

Animations should be mostly keyframed at first. They should support interpolation modes such as `step`, `linear`, `easeIn`, `easeOut`, and `easeInOut`. JavaScript expression based animation should not be the first solution because it is harder to edit visually, harder to validate, and less friendly to future tools.

Animations should be reusable as templates, but each character must explicitly choose which animation sequence it uses for each gameplay state. Not every animation must make sense for every rig. A bat may classify wings as arm-like controls, but it should still use a bat flap animation rather than automatically inheriting a humanoid run.

Animation data should support duplication and editing. A shared starting animation such as a humanoid run can be duplicated and tweaked into a wizard run, goblin run, skeleton shuffle, or other character-specific motion.

Ignatius is the calibration character for this system. The first goal was to reproduce the original hardcoded wizard run as closely as possible using atlas frames, rig data, and keyframed animation. That migration reached parity in revision 055; revision 056 removed the procedural run and its temporary comparison controls so the JSON clip is now the single source of truth.

The current hardcoded jump, hover, launch, and airborne poses should eventually move into animation data. The simulation should describe gameplay state and relevant parameters; the animation system should choose, play, and blend poses for display.

### Current Animation Implementation Baseline

As of revision 056, the ground run is exclusively data-driven. `ct_char_wizard_1.json` maps the `run` slot to `ct_anim_wizard_run_1.json`, and `src/shared/animation-data.js` validates and samples the clip. Animation transforms use unscaled rig-space pixels for `x` and `y`, radians for `rotation`, a target-height multiplier for `scale`, and a scalar for `alpha`. Clips declare duration, looping, playback cadence, interpolation per keyframe, and optional root-motion metadata.

The obsolete procedural run and `data` / `legacy` / `compare` controls have been removed. The headless testbench now validates clip structure, loop closure, finite sampled poses, editor mutations, and the absence of the retired migration path.

`character-editor.html` loads the mapped animation file and previews it through the same evaluator used by the game. It supports playback, pause, scrubbing, stepping between authored key times, loop and speed controls, per-part/per-property timelines, draggable key markers, exact time/value/easing edits, add/delete/copy/paste operations, and animation JSON export. Shared editing operations live in `src/tools/character-editor/animation-editor.js`.

Revision 058 removed the tool's hardwired wizard-project assumption. Puppet Forge can now load a known character, an arbitrary character-definition URL, selected local files, or a selected project directory. It can also create a consistently named blank character project containing mutually referenced atlas, rig, character-definition, and idle-animation templates. The local workflow keeps browser-selected files in memory and resolves relative references without pretending the browser can silently access arbitrary folders.

Revision 059 added direct animation-pose manipulation. In the combined `X, Y and Angle` property mode, dragging inside the selected part rectangle authors position keys at the current playhead and dragging a corner handle authors rotation. Missing transform keys are created automatically from the sampled pose so edits cannot disappear between existing keys. Numeric key values now preview immediately and create a key at an unkeyed playhead. The preview supports pointer-anchored mouse-wheel zoom without changing animation or rig coordinates.

Revision 060 made preview zoom use the mouse wheel directly, without requiring Ctrl. Puppet Forge now labels the rig panel as base/setup data and explains the current split: pivot and target height remain shared sprite geometry, while setup offsets and base scale are transitional rig defaults that data-driven clips override with their authored absolute X, Y, and scale values during playback.

Revision 061 added an Atlas Parts workspace. It draws the configured atlas PNG in image-pixel coordinates and supports drawing, selecting, moving, resizing, renaming, duplicating, deleting, and validating frame rectangles. Renaming a frame updates atlas-object and rig-part references. The tool also tracks unsaved character, atlas, rig, and per-animation documents independently, preserves edited clips while switching animation slots, and warns before a project reload discards work.

Revision 063 added the first enemy, now named `enemy_001` and displayed as Skeleton Guard, as a directly selectable known project and connected its atlas, rig, character definition, and idle animation. Atlas Parts mode can now create a rig part from the selected frame or create parts for every unassigned frame; matching animation transforms are added to loaded clips so the parts appear immediately in the rig preview. Atlas 002 and Atlas 003 were segmented into reusable frame rectangles and given closed blockable silhouette traces.

Revision 064 established the Skeleton Guard's equipped rig and editable two-step walk/march clip. Revision 077 later superseded the exact draw order and animation values with the user's revised `enemy_001` files.

Revision 065 added selected-part draw-order authoring directly to Puppet Forge. The Base rig / setup values panel now exposes **To Back** and **To Front**, operating on the rig's shared back-to-front `drawOrder` without changing animation transforms or atlas data.

Revision 084 added direct animation-metadata authoring and clip duplication. Puppet Forge can now edit the animation ID, duration, loop flag, mirrorability, idle threshold, playback cadence, and maximum speed ratio without hand-editing JSON. Shortening a clip below its final authored key is rejected rather than silently deleting or merging keys. **Duplicate current** creates a deep-copied animation under a new character slot, assigns a stable `ct_anim_<character>_<slot>.json` filename, updates the character definition in memory, and tracks the new character and animation documents independently for export.

Revision 085 introduced `src/presentation/character-runtime.js` as the shared browser runtime loader for character definitions, rigs, atlases, atlas PNGs, and mapped animation clips. Runtime rigs no longer assume wizard or humanoid part names. The module normalizes arbitrary draw orders and pivots, samples named animation slots, converts rig-space poses into rendered transforms, and produces a simple ordered draw-command list suitable for the current Canvas 2D renderer and a later WebGL renderer. Revision 128 makes each referenced rig authoritative and removes character-level part/pivot patching; variants with different geometry use separate numbered rig files while still sharing atlases where useful. Revision 103 also exposes unattached atlas frames through `atlasAssets`, allowing projectile sprites to remain in a character atlas without becoming rig parts. Revision 105 adopts the user-corrected compact goblin rig and idle pose as the canonical foundation for both ranged goblins, including the additional independently animated `leftArmClosed` replacement part. The game now preloads Ignatius plus the numbered enemy projects and level data can author `characterEnemy` instances with a `characterId`, animation slot, facing, and render scale.

Revision 066 extended level placements with a shared transform pipeline. Atlas assets can be mirrored independently on X and Y and rotated around their center. The level editor preview, selection hit testing, runtime rendering, atlas guide overlays, and atlas-derived collision geometry must all use `src/shared/level-transform.js` so visual art and gameplay collision cannot drift apart. Placement `rotation` is stored in radians, while the editor exposes degrees. Right-mouse dragging pans the level view regardless of the selected tool.

Revision 067 streamlined the normal placement workflow: choosing an asset enters Place Asset mode, and a successful placement immediately selects the new object and returns the editor to Select mode for fine positioning. Failed placements must leave the current tool unchanged.

Revision 068 made cutout masks reveal the renderer's opaque deep-blue cave backing instead of erasing canvas alpha, which could appear as pure black. The level editor now also exposes **Copy asset** beside **Place asset**. Copying duplicates every placement property, assigns a fresh ID, offsets the copy slightly up and right, selects it, and returns to Select mode.

Revision 069 added a non-destructive level-wide selective hue rotation for environment atlas artwork. Levels store `colorMap` settings for enablement, source-hue centre, selected hue width, feather, and rotation. The original PNGs are never modified. The editor and runtime build recoloured offscreen atlas copies only when the settings change, then use ordinary cached `drawImage` calls during rendering. The deep-blue background, characters, transparency, and collision geometry remain unaffected. Atlas-backed entity artwork participates in the same cached colour mapping as other level assets.

Revision 070 introduced the interactive/story-item atlas `it_atlas_001`. Its companion catalog `it_entities_001.json` maps stateful level entities to atlas visuals without baking behaviour into the PNG rectangles. The Level Editor can place atlas-backed target dummies, mailboxes, chests, portals, switches, gates, fuel, herbs, keys, checkpoints, and hazards. Entity state definitions are copied into level JSON so levels remain self-contained. The open portal uses a normal world layer plus an `actorFront` visual layer, allowing Ignatius to pass behind the duplicated foreground door edge.

Revision 071 implemented the first scripted story-item behaviour: a portal marked with `portalRole: "entrance"` can own the level-start sequence. The runtime begins with the portal closed and Ignatius hidden, switches the entity to its open visual state, walks Ignatius from inside the doorway to the authored `playerStart` while normal input is locked, draws the portal's `actorFront` half-door after the player, then closes the portal and releases control. Portal timing and walk speed live on the entity, and runtime visual-state changes go through the shared entity-state helper rather than hardcoded renderer sprite swaps. The same portal/state foundation should later support mirrored exits.

The generic runtime character loader and Canvas 2D draw-command renderer arrived in revision 085. Revision 093 completed the first real enemy integration: `enemy_001` is catalogued and placeable in the Level Editor, previews through the generic rig renderer, snaps to authored ground, and uses simulation-owned idle/patrol behaviour. Revision 094 made placed enemies combat-active: rockets use swept body collision, terrain can intercept the shot first, health drives hurt/death states, defeated enemies stop moving and leave the homing pool, and short hit/health feedback is renderer-presented from simulation timers. Revision 096 added terrain-shielded melee attacks, player damage, knockback, invulnerability, and damaging/killable collision. Revision 097 makes the Skeleton Guard react as an aggressive close-range enemy: entering its patrol span alerts it, pursuit uses a separate faster run speed, the attack wind-up lunges to visible sword-contact distance, and the shortened animation/cooldown produces repeated chops. Revision 100 establishes the first reactive-world slice with an editor-placeable breakable crate. The crate owns serializable health and intact/damaged/destroyed state, contributes dynamic blocking collision while active, intercepts swept rockets before terrain behind it, refreshes its state-authored visual, removes collision and artwork when destroyed, and emits destruction smoke plus authoritative events. Revision 126 generalizes the same foundation into a tall destructible iron barrier. The falling-tree bridge remains a planned Phase 4 milestone, but it is deliberately postponed until suitable authored tree artwork is ready. The immediate implementation track is cave-window authoring and foreground presentation, which can use existing atlas material. Revision 106 improves Puppet Forge's daily editing ergonomics with canvas toolbars, a bottom timeline dock, right-drag panning, bounded ghost opacity, grouped transform-key dragging, and persistent collapsible inspector panels. Revision 146 makes the playback control explicitly toggle between PLAY and PAUSE, moves the clip loop control beneath the timeline as **Cykle animation**, and adds an optional full dopesheet panel to the left. The full dopesheet shows one timeline per rig-part property with at least two authored keys and lets the editor select tracks, keys, or scrub time directly. Remaining rig polish includes part deletion, frame reassignment, role/tag authoring, and direct pivot editing; those improvements should continue without delaying gameplay integration.

## Character Tool

A dedicated `character-editor.html` should be added for rigging and animation work. It should be separate from the asset tool and level editor.

The asset tool is for world and character atlas frames, nodes, and collision data.

The level editor is for placing world assets and entities.

The character tool is for assembling character rigs and editing animation sequences.

The character tool should support:

* Selecting an existing character project rather than being hardwired to Ignatius.
* Creating a new character project with blank atlas, rig, character-definition, and animation templates.
* Choosing the atlas PNG and each related JSON file through browser file pickers, while retaining URL-based loading for files served from the project.
* Loading atlas images and atlas JSON.
* Drawing, selecting, moving, resizing, naming, and deleting frame rectangles directly over the atlas image.
* Creating rig parts and assigning each rig part to a named atlas frame.
* Loading and saving rig JSON.
* Loading, duplicating, editing, and saving animation JSON.
* Loading and saving character definition JSON.
* Drag editing of pivots, offsets, anchors, and part transforms.
* Exact numeric entry for pivots, offsets, scale, rotation, draw order, roles, and tags.
* Timeline editing with keyframes.
* Playback, pause, scrubbing, frame stepping, loop control, and speed control.
* Interpolation selection per keyframe or track segment.
* Ghost previous/next pose display.
* Copy pose, paste pose, paste mirrored pose, and paired-limb helpers.

Atlas rectangles and rig semantics must remain separate. The atlas manifest answers “which pixels form this reusable frame?” The rig answers “what body part uses that frame, where is its pivot, and is it a left leg, hat, wing, weapon mount, or some other role?” A frame may be reused by several rig parts, so semantic roles and gameplay tags belong primarily on rig parts rather than being baked into the image rectangle. Optional descriptive frame tags may still be useful for search and organization.

Browser security does not allow the tool to silently browse arbitrary local folders. Local workflows should therefore use explicit file or directory selection, keep selected files in an in-memory project workspace, preserve relative references where possible, and export changed files individually or as a downloadable project bundle. URL-based loading should remain available when the tool is served beside the game assets.

This tool is expected to be used heavily, so it should favor a comfortable editing workflow rather than a minimal debug UI. Frequently used selection, transform, visibility, draw-order, playback, and key-timing operations should remain reachable without repeatedly scrolling through the inspector. Right-button dragging should pan both character and atlas workspaces consistently, and inspector-panel layout preferences should persist locally without entering project JSON.

## Scale and Physics

Use wizard height as the basic length scale.

Let:

* `WH = wizard height`

Baseline targets:

* Ignatius can jump vertically about `2WH` on his own.
* Ignatius can run fast enough that a running jump crosses about `4WH`.
* Attached rocket boost with 50% fuel should be able to raise Ignatius from stationary to roughly half a screen height.

Physics should be Newtonian where possible.

Derive baseline values from design targets:

* Gravity.
* Jump velocity.
* Maximum run speed.
* Ground acceleration.
* Ground friction.
* Air drag.
* Landing friction.
* Boost acceleration.

Avoid hand-tuning unrelated magic numbers unless they are deliberately part of game feel.

The sim should use a fixed timestep.

## Player Movement

Ignatius can:

* Run left.
* Run right.
* Jump.
* Use attached vertical rocket boost while airborne.
* Launch detachable weapons.
* Take damage.
* Recover health slowly.
* Lose his hat under certain future conditions.

Movement principles:

* Running should feel fast and slightly reckless.
* Horizontal momentum should matter.
* Jumping should produce a clear standard parabola.
* Attached boosting should affect vertical movement only.
* Attached boosting should not directly change horizontal velocity.
* The rocket should let the player reshape the jump arc without turning the game into free flight.

## Controls

Default controls:

* `LeftArrow`, `GamepadLeftDPad`, `GamepadLeftStickLeft`: run left.
* `RightArrow`, `GamepadRightDPad`, `GamepadLeftStickRight`: run right.
* `UpArrow`, `GamepadDPadUp`, `GamepadLeftStickUp`, `GamepadA`: jump / attached boost.
* `Space`, `X`, `K`, either `Ctrl`, or `GamepadB`: weapon / rocket launch.

### Jump Button

The jump button controls Ignatius's body movement.

* Press on ground: normal jump.
* Press again while airborne: start attached rocket boost if fuel is available.
* Hold while airborne after boost starts: continue attached rocket boost.
* Release while boosting: stop attached rocket boost.

### Weapon Button

The weapon button controls detachable rocket or weapon launch behavior.

* Tap: launch current weapon in default quick mode.
* Hold: enter aim mode, slow time, and show target reticle.
* Release after hold: launch current weapon toward aimed direction or target.
* Double-tap: optional alternate quick launch mode.

Avoid making basic launch feel delayed. If tap, double-tap, and hold distinction is needed, prefer interpreting release timing rather than adding a universal delay before every shot.

## Fuel System

Ignatius has a rocket fuel gauge.

### HUD

* Fuel gauge appears near the left side of the screen.
* Placement should avoid blocking Ignatius at level start.
* The gauge should communicate recharge caps clearly.

### Fuel levels

* Green level: self-recharges up to 25%.
* Yellow level: unlocked by boosters/upgrades, self-recharges up to 50%.
* Red level: fuel above recharge cap, filled by pickups, up to 100%.

### Rules

* Fuel recharges slowly when the rocket or fuel-based weapon is not being used.
* Recharge is delayed for 2 seconds after fuel use.
* Pickups add 10% fuel, up to 100%.
* Some upgrades permanently increase the self-recharge cap.
* Attached boost consumes fuel continuously.
* Detached weapon launches consume fuel immediately.
* Default detached launch cost: 10% fuel.

### Suggested tunable values

* `fuelMax = 100`
* `baseRechargeCap = 25`
* `upgradedRechargeCap = 50`
* `fuelPickupAmount = 10`
* `rechargeDelayAfterUse = 2.0`
* `rechargeRate = 12.5 per second`
* `attachedBoostDrainRate = 20 per second`
* `defaultLaunchCost = 10`

These numbers are starting points and should be tested in the movement arena.

## Health System

Ignatius has health.

Damage should usually injure him rather than instantly kill him.

### Baseline rules

* Maximum health is 100%.
* A typical injury removes about 1/3 of total health.
* Suggested standard damage amount: 34%.
* At 1/3 health or less, Ignatius should pulse with a reddish hue.
* Health regenerates slowly if Ignatius has not been injured for a while.
* Regeneration should stop or delay whenever he takes damage again.

### Suggested tunable values

* `maxHealth = 100`
* `standardDamage = 34`
* `lowHealthThreshold = 34`
* `healthRegenDelay = 5.0`
* `healthRegenRate = 4 per second`

### Visual feedback

* On hit: brief flash, knockback, sound effect, and possibly a few hat-threatening sparkles.
* Low health: reddish pulse.
* Regenerating: subtle recovery shimmer or small magical particles.
* Full recovery: small visual cue, not too noisy.

Death rules can be decided later.

Possible options:

* Knockout and restart from checkpoint.
* Lose a life.
* Drop fuel and respawn.
* Editorial complaint letter.

## Hat System

Ignatius's hat is its own gameplay-adjacent object.

The hat may fly off from time to time.

The exact triggers are undecided, but possible causes include:

* Taking damage.
* Heavy landing.
* Explosion nearby.
* Rocket misfire.
* High-speed collision.
* Boss attack.
* Scripted comedy moment.

The hat should support multiple states:

* `worn`
* `loose`
* `flying`
* `landed`
* `returning`
* `reappearing`

The hat system should not be deeply entangled with player movement.

Future return methods could include:

* It magically pops back after a short delay.
* Ignatius runs over it to pick it up.
* It boomerangs back.
* The editor mails it back with a stern note.
* A level-specific creature steals it.

For now, the plan only requires that the architecture does not assume the hat is permanently attached to the head.

## Attached Rocket Boosting

Attached boosting is a movement tool, not a weapon.

### Rules

* Triggered by pressing jump again while airborne.
* Rocket remains attached to Ignatius.
* Boost continues while jump is held and fuel remains.
* Boost applies vertical force only.
* Boost does not directly affect horizontal speed.
* Boost should feel powerful but not equivalent to full flight.
* With 50% fuel available, boost should raise Ignatius from stationary to about half a screen height.

### Simulation behavior

Apply upward acceleration while boosting.

Drain fuel continuously.

Stop boosting when:

* Jump is released.
* Fuel reaches zero.
* Ignatius lands.
* Another state forcibly interruptss it.

The boost should preserve the current horizontal arc, creating the feeling of a parabolic jump being inflated upward by a dangerous magical appliance.

## Weapons and Detached Launching

The rocket is the first weapon, not the only weapon.

The design must support alternative weapons and many future weapon modes.

Current planned weapon modes include:

* Aimed launch.
* Homing launch.
* Ballistic launch.

But these are only examples.

Future weapons may include:

* Splitting rockets.
* Multiple small independent rockets.
* Fireballs.
* Arcing bombs.
* Ricocheting spells.
* Drilling projectiles.
* Defensive burst.
* Shockwave launch.
* Summoned creatures.
* Level-specific magical tools.

Avoid hardcoding the detached rocket as the only possible launched object.

Use a generic weapon framework.

### Mounted Equipment

Ignatius may have a currently mounted item.

Initial mounted item:

* `rocket`

Future mounted items may behave differently.

### Weapon Definition

Each weapon should define:

* Fuel cost.
* Cooldown.
* Launch modes.
* Projectile type.
* Targeting behavior.
* Steering behavior.
* Explosion or impact behavior.
* Visual effect.
* Sound effect.
* Whether it requires fuel.
* Whether it can be used while airborne.
* Whether it detaches from Ignatius.
* Whether it returns or reforms.

### Launch Modes

Launch modes are selected by input interpretation.

Possible modes:

* `quick`
* `aimed`
* `homing`
* `ballistic`
* `charged`
* `spread`
* `special`

The current rocket can implement:

* `quickHoming`
* `heldAimed`
* `doubleTapBallistic`

But the code should not assume those are the only possible modes.

## Rocket / Weapon State Machine

The rocket should be designed as a state machine.

Initial suggested states:

### `mountedReady`

The rocket is visible on Ignatius's back and ready to use.

### `attachedBoosting`

The rocket remains attached and applies upward force.

### `detachClearance`

The rocket or weapon detaches and first moves upward to clear Ignatius's head and hat.

This prevents immediate collision with the wizard and creates a readable launch moment.

### `launched`

Generic launched state.

The launched object then delegates behavior to its weapon mode.

Examples:

* Aimed.
* Homing.
* Ballistic.
* Split.
* Cluster.
* Drilling.
* Returning.

### `exploding`

The projectile has hit something and is producing damage/effects.

### `spent`

The projectile is done and can be removed.

### `reforming`

The magical rocket reforms on Ignatius's back.

Optional. May be purely visual.

## Current Rocket Launch Behaviors

### Aimed Launch

* Press and hold weapon button.
* Time slows down.
* Player moves an aiming reticle.
* Release weapon button to launch.
* The projectile follows the selected direction or target.

### Homing Launch

* Tap weapon button.
* Rocket selects a valid target, such as nearest enemy in range.
* Rocket launches and attempts to steer toward it.
* If no target exists, fallback behavior should be defined.

Possible fallback:

* Fire forward.
* Fire upward then forward.
* Do nothing and refund fuel.
* Enter aimed mode briefly.

### Ballistic Launch

* Double-tap weapon button.
* Rocket launches in the direction Ignatius is facing.
* It travels in a ballistic parabola.
* It should hit ground level roughly 1/3 of a screen away, before tuning.

### Launch Clearance

All detached rocket-like weapons should initially clear Ignatius's head before fully entering their launch behavior.

This may not apply to every future weapon, but it should be supported.

## Enemies and Targets

Early enemies should be simple target dummies.

First version:

* Stationary monsters.
* No attacks.
* Can be hit by rockets/weapons.
* Explode, vanish, or show damage.
* Used for target practice.

Later:

* Walking enemies.
* Flying enemies.
* Shielded enemies.
* Bosses.
* Enemies that interact with the hat.
* Enemies that require specific weapon modes.

Targeting rules should be deterministic and testable.

For homing weapons, define:

* Max target range.
* Target priority.
* Line-of-sight requirement, if any.
* What happens if the target dies before impact.
* What happens if no target is available.

## Levels

Levels will be both horizontally and vertically scrolling.

Typical size target:

* 20 screens wide.
* 10 screens high.

### Early development level

Create a movement and weapon arena.

Include:

* Flat ground.
* Platforms at known heights:

  * `1WH`
  * `2WH`
  * `3WH`
  * half-screen height
* A vertical shaft for boost testing.
* A wide gap for running jump testing.
* Stationary monsters for target practice.
* Fuel pickups.
* Safe walls for collision testing.
* Debug labels or markers.

### Design principles

* Few or no precision jumping puzzles at first.
* Movement should be fun even on flat ground.
* Combat targets should encourage creative rocket use.
* Levels should start with Ignatius entering from the left-hand side.
* Later levels may be procedurally generated from a seed that is fixed during development (so we can replay/debug)
* Each level should have a distinct theme.

## Camera

The camera should support both horizontal and vertical scrolling.

Requirements:

* Follow Ignatius smoothly.
* Keep enough space ahead of Ignatius in his facing/running direction.
* Allow vertical anticipation when he is moving upward quickly.
* Avoid making rocket boost feel cramped.
* Support arenas larger than the screen.
* Support debug camera modes.

Possible camera modes:

* Normal follow.
* Zoomed-out debug.
* Fixed arena.
* Boss arena.
* Letter/cutscene framing.

## HUD

HUD elements:

* Rocket fuel gauge.
* Health indicator.
* Low health pulse feedback.
* Current weapon/mode indicator, later.
* Optional aiming reticle.
* Optional debug readouts.

### Fuel gauge

* Should show green/yellow/red fuel regions.
* Should make recharge cap obvious.
* Should show current fuel amount.
* Should show recharge delay subtly.

### Health

* Should show current health clearly.
* At 1/3 health or less, Ignatius himself should pulse reddish.
* HUD may also pulse or shake slightly at low health, but should not become annoying.

## Story

Ignatius Rocketfrock is out researching his travelbook.

Every level starts with a mailbox where he picks up a letter from his editor.

Ignatius's thoughts appear as thought bubbles above him.

The editor's letter appears as a scroll above or near Ignatius.

The editor constantly suggests new names for the travelbook matching the current level.

### Example titles

* Ignatius Rocketfrock and the Introductory Pit of Mild Regret
* Ignatius Rocketfrock and the Caverns of Questionable Safety
* Ignatius Rocketfrock and the Bridge That Was Probably Inspected
* Ignatius Rocketfrock and the Mushroom Grotto of Suspicious Bounce
* Ignatius Rocketfrock and the Library of Poorly Shelved Spells
* Ignatius Rocketfrock and the Windmill of Vertical Opinions
* Ignatius Rocketfrock and the Mines of Acceptable Liability
* Ignatius Rocketfrock and the Clocktower of Unhelpful Timing
* Ignatius Rocketfrock and the Sewer of Necessary Plot Development
* Ignatius Rocketfrock and the Volcano of Editorial Concern
* Ignatius Rocketfrock and the Labyrinth of the Ancient McGuffin, Formerly the Caverns of Questionable Safety, Briefly the Tunnel of Reasonable Doom, Revised Edition

### Example editor notes

"P.S. After further reflection, I have decided to retitle your account: Ignatius Rocketfrock and the Caverns of Questionable Safety. I trust this better reflects the dignity of your current predicament."

"P.P.S. I have also adjusted the subtitle again. Marketing insists that 'deathtrap' tests poorly with families."

"P.S. I am now calling this chapter Ignatius Rocketfrock and the Ravine of Perfectly Avoidable Consequences. Please try to make the title inaccurate."

### Letter design rule

Each letter should ideally contain:

* One level introduction.
* One mechanical hint.
* One title revision.
* One small escalation in the editor's personality.

The editor can gradually become more unhinged, invested, worried, defensive, or proud.

## Testing

The simulation should be tested headlessly where possible.

Tests should be able to inspect, clone, serialize, and compare the full `gameState`.

Important state transitions should add small debug events to `gameState.debug.lastEvents`.

### Movement

* Standing jump reaches about `2WH`.
* Running jump crosses about `4WH`.
* Left and right movement are mirrored correctly.
* Horizontal speed settles after landing.
* Gravity and jump arcs are deterministic.
* Collision with ground and walls is stable.

### Attached Boost

* Attached boost only affects vertical acceleration.
* Attached boost does not directly alter horizontal velocity.
* Boost drains fuel continuously.
* Boost stops when fuel is empty.
* Boost stops when jump is released.
* With 50% fuel, stationary boost reaches about half a screen height.
* Recharge delay starts after boost use.

### Fuel

* Fuel recharges to 25% by default.
* Upgrade allows recharge to 50%.
* Pickups add 10% up to 100%.
* Fuel does not recharge during the 2-second delay.
* Launching consumes the correct fuel cost.
* Fuel cannot go below 0 or above 100.

### Health

* Standard damage removes about 1/3 health.
* Low health state starts at 1/3 health or less.
* Reddish pulse appears during low health.
* Health regeneration starts only after the injury delay.
* Taking damage resets the regeneration delay.
* Health does not exceed maximum.

### Hat

* Hat can exist as a separate state from Ignatius.
* Hat can transition from worn to flying.
* Hat can return or reattach.
* Player simulation does not break if the hat is not currently worn.

### Weapons

* Weapon launch consumes correct fuel.
* Aimed launch follows aim direction.
* Homing launch selects expected target.
* Homing launch has deterministic fallback if no target exists.
* Ballistic launch travels expected distance.
* Projectile collisions trigger explosion or impact state.
* Left/right launch behavior mirrors correctly.
* Launch clearance avoids colliding with Ignatius's head or hat.
* Future weapon modes can be added without rewriting the player movement system.

## Destructible and Reactive World Objects

Some barriers, props, and environmental objects can be damaged, destroyed, moved, toppled, or transformed by weapons, explosions, collisions, or scripted events.

These objects are part of gameplay, not just visual effects.

Examples:

- A tree can be shot so it falls across a chasm and becomes a bridge.
- A cracked wall can be destroyed to open a passage.
- A pillar can collapse and change the platform layout.
- A hanging object can be knocked loose.
- A barricade can block enemies or be cleared by a weapon.
- A fuel container can explode and trigger nearby objects.

Destructible and reactive objects must live in `gameState`.

Their state should be serializable, testable, and visible to the headless simulation.

Possible object states:

- `intact`
- `damaged`
- `breaking`
- `falling`
- `fallen`
- `destroyed`
- `inactive`

Reactive objects may change collision geometry when their state changes.

Revision 100 uses the following first-pass authoring/runtime contract:

* A level entity identifies a destructible object with `reactiveKind: "destructible"`.
* `health`, `maxHealth`, and `damagedHealthThreshold` drive the first `intact` → `damaged` → `destroyed` transition.
* `projectileDamageMultiplier` scales projectile damage without changing projectile data.
* `blocksPlayer`, `blocksProjectiles`, `collisionStates`, and `projectileCollisionStates` declare which states participate in collision.
* `collisionInsetX`, `collisionInsetTop`, and `collisionInsetBottom` describe the current rectangular gameplay body independently of atlas padding.
* `visualStates` remain authoring/presentation data, while the normalized object record and its state live in `gameState.reactiveObjects`.
* State changes refresh the entity visual and rebuild only the object's dynamic solid.

The breakable crate and revision-126 destructible iron barrier both use the three-state health model. The barrier proves the schema works for tall passage-blocking geometry as well as compact props: it remains solid while intact or damaged, intercepts rockets, swaps to a bent visual below its threshold, and removes both visual and collision when destroyed. Trees, pillars, and hanging objects may later add `breaking`, `falling`, `fallen`, and `inactive` transitions without replacing the base schema.

The level generator and headless validator must understand when a level requires a world-state change, such as knocking down a tree to create a bridge.


### Game State

* Full `gameState` can be serialized.
* Full `gameState` can be cloned.
* Full `gameState` can be restored for replay/debugging.
* Rendering resources are not stored in `gameState`.
* Simulation can run without renderer, DOM, or browser input events.
* Important transitions produce debug events.
* Deterministic seed produces repeatable results.

### Integration

* Browser input maps correctly to sim input.
* Gamepad input maps correctly to sim input.
* Rendering reflects simulation state.
* Debug state can be inspected during Playwright tests.

## Milestone 1: Completed Physics and Atlas-Level Foundation

The first milestone is now considered complete enough to stop treating it as the current development target.

It established:

* Fullscreen play area.
* Single hierarchical `gameState`.
* Fixed timestep simulation.
* Ignatius movement, running, jumping, and attached vertical rocket boost.
* Fuel and health HUD.
* Detached rocket launch and terrain impact.
* Atlas-based level loading from `assets/level_001.json`.
* Multi-atlas level references.
* Atlas collision lines and closed collision areas.
* Level editor and asset tool.
* Debug overlays and asset guides.
* Headless movement, fuel, collision, and game-state tests.

Going forward, the browser game should load real level and atlas files from `assets/`. It may fail loudly when required files are missing. Hardcoded geometry should be limited to explicit test fixtures and blank editor documents.

## Milestone 2: Character Atlas, Rigging, and Animation Pipeline

The next milestone is to move Ignatius and future monsters onto a generic character rig and animation system.

Include:

* Convert Ignatius from individual body-part PNG files to `ct_atlas_wizard_1.png`.
* Add `ct_atlas_wizard_1.json`, `ct_rig_wizard_1.json`, `ct_anim_wizard_run_1.json`, and `ct_char_wizard_1.json`.
* Build a generic character renderer that draws atlas frames by rig and pose data.
* Preserve the current wizard appearance and draw order during migration.
* Recreate the current hardcoded wizard run as data-driven keyframes.
* Add comparison tooling so the new run can be checked against the old run.
* Add `character-editor.html` for rigging and animation editing.
* Add character-project selection and creation so the tool is not hardwired to the wizard.
* Add explicit PNG/JSON file selection and an atlas-frame editor for marking reusable image rectangles.
* Let rig parts map those frames to semantic roles and tags such as legs, arms, wings, hats, and equipment mounts.
* Support duplicate/edit workflows for animation sequences.
* Move jump, fall, hover, launch, idle, and landing poses into animation data after the character-project and atlas-authoring workflow is stable.
* Prepare the renderer data model for later WebGL2 batching.

This milestone is successful when the wizard renders from `ct_atlas_wizard_1.png`, the run animation is data-driven, the character tool can open or create more than one character project, atlas regions and rig semantics can be authored without hand-editing JSON, and the wizard rig and animations can be edited and exported.

## Milestone 3: Monster Character Pipeline

Add the first non-wizard characters using the same rig and animation system.

Include:

* Simple humanoid enemy rig.
* Simple bat rig.
* Character definitions that assign rigs and animation sets.
* Idle, move, attack, and hurt animations.
* Animation template duplication and character-specific tweaking.
* Renderer support for monsters without custom per-species code.

## Milestone 4: Combat, Destructibles, and Weapon Framework

Expand rocket and weapon interactions after the character pipeline is stable.

Include:

* Generic weapon framework.
* Quick, aimed, homing, and possibly ballistic launch modes.
* Enemy hit detection.
* Player damage.
* Destructible barriers and reactive objects.
* Falling tree or bridge prototype.
* Smoke-heavy destruction effects.
* Tests for projectile, monster, and reactive-object state transitions.

## Milestone 5: Handmade Level and Story Wrapper

Add level structure and story wrapper.

Include:

* Mailbox.
* Editor letter scroll.
* Thought bubbles.
* First complete themed level.
* Title revision gag.
* Pickups.
* Enemy placement.
* Camera tuning.

## Design Warning List

Things to avoid:

* Do not let rendering logic leak into simulation.
* Do not hardcode the rocket as the only weapon.
* Do not make basic weapon launch feel delayed.
* Do not let attached boost become full free-flight.
* Do not make early levels depend on precision jumping.
* Do not make health regeneration so fast that damage becomes irrelevant.
* Do not make low-health pulsing so strong that it becomes irritating.
* Do not assume the hat is always attached to the head.
* Do not scatter gameplay state across renderer, input, and simulation.
* Do not store browser/rendering resources in `gameState`.
* Do not build procedural levels before the movement arena feels good.
* Do not add many weapons before the weapon framework is clean.
* Do not build one-off custom renderers for every character unless a creature truly needs special treatment.
* Do not assume one animation will work for every rig. Treat shared animations as templates that can be duplicated and adjusted.
* Do not switch to WebGL2 before the character data model is stable enough to render correctly in canvas.

## Current Open Questions

* How exactly does the hat fly off?
* How does the hat return?
* Does losing the hat have gameplay effects or is it visual/comedic?
* What happens at zero health?
* Should jump height vary depending on button hold duration?
* Should attached boost require the rocket to be visually mounted?
* Can Ignatius use detached weapons while boosting?
* How much trim metadata does `ct_atlas_wizard_1.json` need to reproduce individual-PNG pivots exactly?
* Should animation blending live entirely in the renderer, or should gameplay-relevant animation state also be recorded in `gameState`?
* Which procedural secondary-animation modifiers should be added first after keyframes are stable?
* Can the rocket be unavailable while reforming?
* Should weapon mode be selected by input gesture, equipped mode, pickups, or upgrades?
* Should fuel and health pickups be separate?
* Should explosions knock Ignatius back?
* How much slow-motion is used during aimed launch?
* Should the editor comment on repeated deaths, hat loss, or weapon misuse?
* How much of the camera state belongs in `gameState` versus renderer-only presentation?
* Should debug event history be capped by event count, time, or both?

Revision 072 realigned the three portal visuals after the source atlas was revised. The closed portal remains the reference rectangle. The wider open portal and the narrower actor-front duplicate now preserve the same source-pixel scale and use explicit horizontal offsets, so shared stonework and the duplicated foreground pixels land at the same rendered coordinates instead of being independently stretched into the entity box.


Revision 073 makes authored player starts tolerant of small vertical placement errors. Once atlas collision is available, a start point within half an Ignatius height above a `walkable` or `blockable` line is snapped to the highest support under his feet. The same rule is used by the Level Editor after loading, placing, dragging, or numerically editing `wizardStart`, so the portal introduction and normal control handoff share one grounded Y coordinate. Atlas-backed target dummies now provide their homing point through a normalized `targetAnchor`; the straw dummy uses the painted belly bullseye and suppresses the old debug dot/pulse during normal rendering.


### Revision 074 mailbox story sequence

The editor mailbox can now run a data-driven start-of-level story sequence after the portal introduction. When Ignatius comes within the mailbox entity's `triggerDistance`, the mailbox changes from `letterAvailable` to `empty`, movement and combat input are locked, the atlas-backed letter scroll displays editable editor text, and an atlas-backed thought bubble then displays Ignatius's editable response. Each stage advances either on its configured timeout or on a fresh Jump press. The event completes once per level load and returns control without reusing the advance press as a gameplay jump. Mailbox story text, timings, and trigger distance live on the level entity and are editable in the Level Editor inspector.

### Revision 075 editable mailbox script and multi-thought sequence (superseded)

Revision 075 introduced editable ordered thought bubbles separated by `---`. Revision 076 superseded that temporary format with one scrollable thought while retaining import compatibility for older `thoughts` arrays. Revision 086 removes the old one-mailbox restriction: each mailbox owns its own letter, thought, trigger distance, and timings, allowing several tutorial letters in one level.

### Revision 076 unified scrollable story text

The mailbox story now uses one scrollable Ignatius thought instead of a sequence of separate bubbles. The Level Editor exposes a single thought-text field and still imports older revision-075 `thoughts` arrays by joining their text. Both the parchment letter and thought bubble use the same heavier Georgia story type. Text that fits is vertically centered in its readable region; overflowing text is clipped, automatically scrolled over the configured stage duration, and accompanied by a small scrollbar. Jump advances from letter to thought and then closes the thought.

### Revision 077 numbered enemy project convention

The first non-player character project is now canonically named `enemy_001` instead of `skeleton_1`. Existing workspaces must also rename `ct_atlas_skeleton_1.png` to `ct_atlas_enemy_001.png`; the PNG is not included in compact revision archives. Its character, rig, atlas manifest, atlas PNG, idle clip, and walk clip use the shared `ct_*_enemy_001` stem, while the human-readable identity remains `Skeleton Guard` in the character definition. Puppet Forge's known-project selector points to `ct_char_enemy_001.json`; the older `ct_*_skeleton_1` names are retired.

All future enemy projects should use zero-padded numbered stems (`enemy_002`, `enemy_003`, and so on). This keeps file discovery independent from creature names and allows display names to change without breaking references. A later editor phase should generate or load an enemy index and populate enemy palettes/project selectors from `ct_char_enemy_0XX.json` entries. Since a static browser page cannot reliably enumerate a server directory, discovery must use an explicit index/manifest or controlled numbered probing rather than hidden filesystem assumptions.



### Revision 086 doorway-owned level starts and transitions

Levels now use dedicated `wizard_entry_door` and `wizard_exit_door` entities instead of separate `wizardStart` and `exit` markers. The entry door is the effective spawn definition: it snaps to nearby `walkable`/`blockable` collision, opens, walks Ignatius outward by its authored emergence distance, closes, and then releases control. The exit door is mirrored by default, snaps to ground, opens on proximity, walks Ignatius behind its foreground layer, closes, and requests its destination level. An empty destination means the next numbered level; if the requested JSON cannot be loaded, runtime falls back to the current level. Legacy `magicPortal`, `wizardStart`, and `exit` records remain import-compatible in the Level Editor.

Mailbox story data remains on each mailbox entity. Multiple mailboxes are allowed and are armed independently, so tutorials can be distributed through a level without adding global level-script fields.

### Revision 088 compact threshold-aligned doorways

Wizard entry and exit doorways now render at half their revision-087 width and height. Their authored `y` coordinate remains the walkable support line, but the sprite is positioned using `floorAnchorYFactor` so the support passes through the exact point where the central seam between the two meeting wooden door leaves reaches the threshold, rather than through either the upper door panel or the lowest stone pixels. The Level Editor uses the same anchor for drawing, selection, hit testing, and support snapping.

Ignatius uses a doorway-only presentation scale while crossing the portal. He begins the entry sequence slightly reduced and grows smoothly to full size as he walks out. The exit performs the inverse, shrinking him as he walks behind the foreground door leaf. Physics dimensions and normal gameplay scale remain unchanged.

### Revision 091 solid-area collision recovery

Closed blockable atlas loops now behave as fully solid regions even when an ordinary side or floor sweep misses a very shallow corner impact. After the normal horizontal and vertical collision passes, the simulation checks Ignatius's collision rectangle against solid rectangles and closed collision polygons. Any overlap is resolved along the shortest axis-aligned route out of the obstacle, with velocity into the contacted surface cancelled. This also repairs invalid states where Ignatius is already embedded in terrain; for example, a wizard whose body is nearer the underside than the top is expelled downward rather than remaining trapped inside the rock.


### Revision 092 Ctrl weapon binding

Both physical Control keys now act as alternate weapon-launch buttons. The input layer uses `KeyboardEvent.code`, so `ControlLeft` and `ControlRight` behave identically to Space, X, and K while remaining independent of keyboard layout.

### Revision 093 first placed character enemy

An explicit `assets/ct_enemies_001.json` catalog now registers enemy projects for browser tools that cannot enumerate the assets directory. The Level Editor exposes the Skeleton Guard (`enemy_001`) as a placeable entity, previews it through the shared runtime character loader and draw-command pipeline, snaps its foot position to nearby authored support lines, and provides guard/patrol controls for facing, patrol span, speed, pauses, and visual scale.

Placed character enemies now own simulation state for guard and patrol behaviour. Patrols alternate between idle and walk animation slots, follow nearby walkable or blockable support, reverse at their authored limits, ledges, or blocking geometry, and keep their homing target anchor synchronized while moving. `level_001` includes the first Skeleton Guard patrol on the right gallery. Rendering remains presentation-only; enemy movement and animation-state selection live in `src/core/simulation.js`.



### Revision 094 enemy rocket combat

Placed enemies now own serializable maximum/current health and combat state. Rockets carry authored damage, sweep their circular body against enemy rectangles and terrain each fixed step, and resolve whichever impact occurs first so enemies cannot be hit through a nearer wall. Surviving Skeleton Guards pause in their authored hurt clip before resuming guard or patrol behaviour; lethal hits select the non-looping death clip, stop movement, and deactivate the associated homing target while leaving the corpse visible. The renderer reads simulation-owned flash and health-bar timers for immediate feedback without owning combat decisions.

### Revision 095 future C++ and Unreal portability roadmap

The plan now treats the browser game as the reference implementation for a later engine-neutral C++ gameplay core and Unreal presentation adapter. It defines the fixed simulation interface, coordinate and numeric conventions, normalized runtime level boundary, authoritative-versus-presentation state split, simulation-event interface, versioned schema rules, future module boundaries, shared parity fixtures, and an early standalone C++ spike. These are architectural guardrails and scheduled preparation work; revision 095 does not yet move gameplay code or change runtime behavior.

### Revision 096 enemy melee attacks and player damage

Skeleton Guards now use their authored non-looping attack animation as a simulation-owned melee state. A nearby living player causes the guard to face inward, stop guarding or patrolling, play the attack clip, and perform one range check at the authored strike time. The strike cannot pass through blocking terrain. Enemy definitions carry damage, reach, vertical reach, clip duration, strike time, cooldown, and knockback values, while the Level Editor exposes the most frequently tuned values.

Player damage now has a short gameplay invulnerability window and optional knockback. This prevents enemy swings and damaging surfaces from removing health every fixed tick. Atlas collision marked `damaging` applies ordinary contact damage, while `killable` collision bypasses the ordinary invulnerability window and reduces health to zero. Health regeneration announces its start, interruption, and completion through simulation events; the browser presentation derives a brief player hit flash and HUD regeneration feedback from the gameplay state.

### Revision 097 aggressive Skeleton Guard pursuit and rapid sword combo

Skeleton Guards now distinguish calm patrol speed from alerted chase speed. A patroller becomes aware when Ignatius enters the authored patrol span and remains alert briefly after losing direct sight; a stationary guard uses an authored awareness radius. Alert enemies face Ignatius immediately, abandon patrol pauses, pursue along the same support and obstacle rules at the faster chase speed, and retain terrain line-of-sight shielding.

The sword attack is now a compact 0.44-second overhead chop with the visible downstroke aligned to the gameplay strike. The blade and body follow-through extend farther forward, while the simulation applies a bounded pre-strike lunge so the sword reaches Ignatius instead of damaging him from empty air. A short recovery permits rapid chained attacks. Chase speed, stationary-guard awareness range, attack reach, damage, and cooldown remain authorable in the Level Editor; additional timing and lunge values remain serializable enemy data.

### Revision 099 source organization and parity map

The loose project-root JavaScript files now live under `src/core`, `src/browser`, `src/presentation`, `src/shared`, and `src/tools/character-editor`, with concise lowercase kebab-case names. Browser entry pages now use stable descriptive names such as `index.html`, `asset-editor.html`, `level-editor.html`, and `character-editor.html`; the aggregate test entry point is `tests/testbench.mjs`, exposed through `npm test`. All imports, links, tests, source-inspection checks, manifest notes, and revision labels were updated without changing gameplay behavior.

`ARCHITECTURE.md` now classifies each module as portable core, shared data/math, browser adapter, presentation-only, editor-only, or test-only. It records dependency direction, the known temporary simulation-to-colour-map boundary violation, unique filename rules, the planned JavaScript/C++ module correspondence, and the stable `InputFrame + fixed dt -> stepSimulation -> GameState + SimulationEvent[]` parity boundary.


### Revision 100 first reactive object and breakable crate

The interactive-item catalog now includes an editor-placeable `breakableCrate` using the existing crate atlas frame. Its authored defaults define health, a damaged threshold, projectile damage scaling, player/projectile blocking, collision-state lists, collision insets, and intact/damaged/destroyed visual states. The Level Editor exposes the principal health, threshold, multiplier, and blocking settings without introducing renderer-owned gameplay fields.

Applying a level normalizes destructible entities into serializable `gameState.reactiveObjects`. Active crates contribute dynamic rectangle solids. Rocket sweeps now compare enemy, reactive-object, and terrain contacts and resolve the earliest hit, so a crate shields whatever is behind it. Damage selects damaged or destroyed state, refreshes state-authored visuals, removes collision when destroyed, emits authoritative state/damage/destruction events, and adds a smoke-heavy destruction burst. Headless tests cover catalog/editor integration, projectile ordering, health transitions, visual refresh, collision removal, events, smoke, and save/restore.

### Revision 101 first ranged goblin variants

The supplied goblin artwork is represented by the shared `ct_atlas_enemy_002` atlas and two dedicated rigs: `ct_rig_enemy_002` for the Fireball Goblin and `ct_rig_enemy_003` for the Musket Goblin. Each rig owns its pivots and setup data directly, while both variants reuse the same atlas. The projectile images remain ordinary atlas resources and animation-preview parts before simulation handoff.

Enemy AI now supports a simulation-owned projectile attack mode. Fireballs travel directly toward Ignatius with deliberately weak homing, while musket cannonballs use gravity and a solved ballistic launch. Both use swept collision against Ignatius, terrain, and reactive objects, then emit authoritative firing and impact events. The renderer presents the two projectile types without owning their gameplay decisions.

### Revision 102 Puppet Forge goblin project loading fix

The goblin entries were visible in Puppet Forge's project selector but were missing from its internal known-project URL table, so selecting either entry passed an empty URL to the loader. Revision 102 connects `enemy_002` and `enemy_003` to their character-definition JSON files and adds an explicit unknown-entry guard. Revision 128 simplifies loading further: Puppet Forge reads the rig referenced by the character definition directly, and regression checks reject any character-level rig patch path.

### Revision 103 corrected goblin rig, animations, and projectile atlas use

The goblin atlas originally mislabeled the two closed arms and the two legs. Revision 103 swaps those semantic frame identities while retaining the already-correct open left casting arm. The shared rig now treats anatomical right limbs as the rear profile layer and anatomical left limbs as the visible front layer. Its back-to-front draw order is `rightLeg`, `rightArm`, `torso`, `head`, `leftLeg`, `weapon`, `leftArm`, with revised shoulder/hip pivots and smaller arm proportions so the sprites meet cleanly at their joints.

The goblins no longer borrow the Skeleton Guard's clips. Fireball Goblin receives dedicated idle, walk, cast, hurt, and death clips. Musket Goblin receives its own weapon-aware variants so both hands and the musket share torso bob, recoil, hurt motion, and collapse instead of the weapon floating or the arms separating. The fireball is explicitly hidden from the Fireball Goblin rig and launched only by simulation.

Keeping the fireball and cannonball in `ct_atlas_enemy_002.png` is supported. They are tagged as `projectileSprite` atlas objects, exposed through the runtime project's `atlasAssets` map, and used by the Canvas renderer for the actual enemy projectiles. They therefore remain reusable visual resources without entering character animation keyframes.

### Revision 104 Puppet Forge alpha preview and hidden-part editing

Puppet Forge now separates edit visibility from final opacity. The Animation preview panel has an `Apply alpha values in preview` checkbox. It is off by default so parts with effective alpha zero remain visible and selectable while being positioned. Enabling it applies the same effective rig/animation alpha used by runtime presentation, making it possible to inspect the final composite without losing access to hidden setup parts during ordinary editing.

Animation sampling in the editor now fills any rig part omitted by a clip from that part's setup transform. This matters for optional equipment slots such as the Fireball Goblin's hidden shared weapon: the part retains its rig offset, rotation, scale, and alpha even though the goblin's animation clips intentionally contain no weapon tracks. Selecting or dragging the part can create X, Y, and rotation keys at the current playhead instead of failing with no sampled transform. `ct_char_enemy_002.json` also records the hidden weapon slot's offset explicitly.

### Revision 105 user-corrected compact goblin animation foundation

The user-authored `ct_rig_enemy_002.json`, `ct_atlas_enemy_002.json`, `ct_char_enemy_002.json`, and `ct_anim_enemy_002_idle.json` are now the canonical goblin foundation. Their corrected pivots, depth order, alternate closed-left-arm part, and pulled-in leg placement are preserved rather than being normalized back toward the earlier tall humanoid stance. The resulting silhouette is deliberately short-legged and dwarfish.

The Musket Goblin idle is rebuilt directly from the corrected Enemy 002 body and leg placement. It uses the dedicated `leftArmClosed` rig part together with the closed right arm, while the open casting arm remains hidden and available as a genuine swap part. The musket and both hands share coordinated tracks so they stay seated together through breathing motion.

Both goblins now have revised walk, attack, hurt, and death clips based on that compact pose. Walk cycles keep the short legs tucked beneath the torso; Fireball Goblin casting swaps between the closed and open left-arm sprites with alpha tracks while the fireball remains a separate projectile; Musket Goblin firing raises, recoils, and settles the weapon as one hand-supported assembly. Hurt and death clips move connected body groups together instead of allowing arms, weapon, or head to float away. Regression coverage verifies the user-corrected draw order, compact leg placement, alternate-arm visibility, complete rig-part reference poses, and inheritance of the corrected idle stance by Enemy 003.

### Revision 106 Puppet Forge editing ergonomics

Puppet Forge now distinguishes final alpha preview from edit-mode ghosting more deliberately. With `Apply alpha values in preview` enabled, every part uses its effective in-game alpha. With it disabled, the selected part is forced fully opaque while every unselected part is clamped to 5–25% opacity. This keeps hidden parts faintly discoverable, prevents fully visible foreground pieces from obscuring rear-part placement, and leaves the active part unambiguous.

Rig and animation mode now has a compact toolbar above the canvas for Select, Adjust, visibility toggling, and draw-order extremes. Select mode chooses the frontmost rig rectangle under the pointer and immediately returns to Adjust mode. The visibility shortcut authors a step alpha key at the current playhead. Right-button dragging pans either the rig preview or atlas workspace without invoking the browser context menu.

Playback and key timing now live in a full-width dock below the canvas. The wider playhead slider, previous/play-next controls, and timeline remain visible while the right inspector scrolls. Existing scalar key markers remain draggable, and grouped X/Y/rotation markers can now be dragged together without breaking their shared time. Right-side panels have independent collapse buttons, with collapsed state stored only in browser `localStorage` so editor preferences never contaminate character data.

### Revision 146 Puppet Forge full dopesheet

The bottom animation dock now uses a stateful PLAY/PAUSE label and no longer repeats the word “Playhead” beside the time slider. The existing clip loop flag has moved into the dock as **Cykle animation**, preserving both preview and exported animation semantics. **Show full dopesheet** opens an editor-only panel to the left of the preview. It lists every supported rig-part property that has at least two keyframes, draws all of its keys on a shared-duration timeline, tracks the global playhead, and supports track selection, key selection, and direct time scrubbing. Row extraction lives in `src/tools/character-editor/dopesheet-data.js` so filtering and ordering remain independently testable.

### Animation-authored projectile handoff

Revision 112 implements the first animation-to-simulation projectile handoff. Rig parts may carry an explicit `projectile` descriptor containing a stable projectile ID, launch type (`ballistic`, `straight`, `homing_lo`, `homing_hi`, `pathing_lo`, or `pathing_hi`), animation slot, optional projectile-kind override, and an authored `releaseTime` in seconds. Character definitions using a shared rig select their active tagged part with `projectilePart`. Release time is deliberately explicit rather than inferred from the last key. Puppet Forge shows the selected part's final keyed time as a reference, but the entered release time remains authoritative so the artist can place handoff precisely while recoil and recovery continue.

The browser character runtime validates tagged parts and samples their rig-space position at release. The browser adapter hydrates that plain data into simulation enemies. At release, the core launches from the sampled world position, hides the rig-controlled copy through presentation state, and owns movement, collision, damage, and events thereafter. Revision 112 wires the Fireball Goblin to `homing_lo` and the Musket Goblin to `ballistic`. Straight and high-homing descriptors are normalized by the same path; true obstacle-planning behaviour for `pathing_lo` and `pathing_hi`, plus character-level projectile/melee/contact damage metadata, remain later extensions.

### Revision 108 user-refined goblin joints and animation rebuild

The user's latest `ct_rig_enemy_002.json`, `ct_atlas_enemy_002.json`, `ct_char_enemy_002.json`, and `ct_anim_enemy_002_idle.json` replace the prior project copies and are now the authoritative goblin foundation. The revised head crop, compact leg placement, depth order, arm pivots, and idle pose are preserved exactly.

Enemy 002 walk, attack, hurt, and death clips and every Enemy 003 clip have been rebuilt from that pose. Torso movement now drives the neck, both shoulders, and both hips through the same rigid transform, so arm pivots remain attached to the same points on the clothing instead of drifting when the torso leans, recoils, bobs, or falls. Fireball casting still swaps closed and open left-arm sprites, while the musket variant keeps its gun and hand assembly coordinated through idle, walking, firing recoil, injury, and death. Regression tests verify the shoulder attachment math at every authored torso key time.

### Revision 110 accepted Enemy 002 and Enemy 003 animation set

Revision 110 adopts the user's supplied Enemy 002 and Enemy 003 atlas, shared rig, character definitions, and complete animation sets without altering their authored JSON. The uploaded Enemy 001 hurt and death clips are also included unchanged.

The goblin regression checks now validate the accepted authored structure rather than rewriting or constraining it to the earlier generated shoulder-lock model. Body-part reference poses, projectile cues, runtime loading, and finite animation sampling remain covered while optional projectile-preview parts may be omitted from non-attack reference poses.
### Revision 111 finalized goblin animation bundle restored verbatim

Revision 111 replaces the Enemy 002/003 goblin rig, atlas manifest, character definitions, and all ten goblin animation clips directly from the user-supplied `ct.zip`. These files are treated as finalized authored assets and are copied without normalization or rewriting. Both dedicated goblin rigs include `fireball` and `cannonball` as previewable animated parts, while the attack clips retain their authored projectile visibility/spawn tracks.
### Revision 112 explicit projectile handoff and level placement

Puppet Forge now exposes projectile metadata for the selected rig part: enable/disable, stable projectile ID, launch type, animation slot, explicit release time, and whether that part is the active projectile for the current character variant. It also reports the final keyed time for that part in the configured clip as a comparison aid. The dedicated goblin rigs tag `fireball` as `homing_lo` at 0.372 seconds and `cannonball` as `ballistic` at 0.495318 seconds.

Character loading compiles each release pose, the browser hydrates plain combat profiles into authoritative enemy state, and simulation launches from the sampled animated world position at the exact release time. The renderer removes the rig-controlled projectile copy at handoff, preventing the old fireball or cannonball from remaining attached at the end of the attack. `level_001` now includes one Fireball Goblin and one Musket Goblin on the lower route.

### Revision 113 visible character ground and baked goblin normalization

Puppet Forge now draws a persistent cyan `GROUND · y = 0` line in Rig and animation mode. The guide follows zoom and panning, and its label can be dragged vertically to reposition the editor view. This drag is deliberately presentation-only: it changes `viewPanY`, not rig coordinates, animation keys, or runtime data.

The goblin projects are normalized once in authored rig space rather than carrying a permanent runtime correction. A uniform `+52` Y translation is baked into both goblin rigs' anchors and setup offsets and every reference-pose and Y-track value in all Enemy 002 and Enemy 003 clips. Fireball and cannonball release times remain unchanged, while their sampled release positions move with their owners. `groundOffset` and `rootYOffsetFromGround` remain zero, so enemy world Y continues to mean the actual terrain contact line.


### Revision 114 defeated-monster linger and fade

Defeated character enemies now remain fully visible for two seconds from the lethal hit, then fade linearly to zero opacity over the following three seconds. The death animation continues to sample normally during this presentation window, enemy movement and targeting remain disabled, and the character shadow fades with the corpse. Once the five-second presentation window has elapsed, the enemy remains inert in simulation state but is no longer rendered.

The timing is represented by the portable simulation fields `deathElapsed` and `renderOpacity`, with defaults controlled by `enemyCorpseHoldSeconds` and `enemyCorpseFadeSeconds`. This keeps the renderer passive and makes the fade deterministic in headless tests.

### Revision 115 strategy-driven hunter AI and platform routing

Revision 115 separates enemy behaviour flavour from the older patrol/guard switch. `simple_patrol` preserves the established local patrol that only engages inside its own area, `sentry` remains stationary, and `hunter` patrols locally until it notices Ignatius and then leaves its home region to pursue him.

The first portable platform-navigation layer extracts support intervals from walkable/blockable collision segments and solid tops. Directed graph edges represent small steps, feasible single jumps, and controlled drops. Jump feasibility is calculated from each enemy's authored run speed, jump height, gravity, and maximum fall distance. Hunters choose reachable firing or melee positions by considering route cost, preferred attack distance, vertical compatibility, and line of sight rather than always selecting the geometrically nearest point to Ignatius.

Hunter pursuit uses explicit states for pursuit, attack positioning, jumping, dropping, unreachable glare, returning home, and stranded patrol. An unreachable hunter faces Ignatius for an authored five-second glare before returning. If it cannot jump back to its original support, it adopts its current platform as a temporary patrol region, continues reacting to reachable threats, and periodically retries the home route. Immediate despawning is deliberately excluded.

The Level Editor now exposes AI strategy, run speed, jump height, awareness range, and glare duration. The Skeleton Guard retains `simple_patrol`; both goblins use `hunter` in the catalog and in `level_001`. Debug hitbox mode displays each enemy's strategy/state and planned route to make playtesting and future tuning practical.
### Revision 116 hunter route geometry and firing fallback corrections

Revision 116 corrects two failures exposed by playtesting the goblins beneath the `level_001` stone arch. Closed collision polygons are no longer treated as though every horizontal edge were a standable platform. Navigation now identifies only upward-facing polygon edges, retains the complete obstacle footprint behind each top surface, and splits broad floor supports around blocking geometry according to the moving enemy's body size. Jumps onto vertically overlapping structures use side-entry launch points outside the wall footprint, and route cost includes the walk from the hunter's current X position to each launch point. This prevents a nominally valid high jump from directing the goblin into the underside or interior of an arch.

Hunter planning now treats pursuit and ranged fallback as ordered alternatives. If the wizard's connected support region is reachable, the hunter commits to that route and does not interrupt a valid jump with an opportunistic lower-floor shot. If the support region is unreachable, the planner searches every reachable support for a position from which the actual projectile path is clear. Fireballs test their authored launch point against the direct path, while musket balls test the solved ballistic arc. Candidate positions sample the usable attack-range window rather than only four preferred points. The five-second glare state is entered only after both route pursuit and reachable firing-position search fail. Regression coverage exercises the real `level_001` arch with a 555-pixel jump and an elevated-target case where a hunter must move around blocking geometry before firing.


### Revision 117 baked directed navigation graphs

Enemy navigation now has an editor-authored baking path as well as the runtime fallback. The Level Editor derives one mobility profile for each distinct placed hunter body size, running speed, jump height, gravity, fall limit, and step capability. Its graph builder uses the same portable `enemy-navigation.js` implementation as gameplay, then stores directed supports and transitions in `level.navigationGraphs`.

The baked graph explicitly distinguishes jumping left, jumping right, falling left, falling right, and same-height chasm crossings. Downward destinations now receive genuine zero-upward-impulse `drop` edges rather than being treated as jumps merely because a monster has a large maximum jump height. Each graph carries a support signature. Runtime performs the inexpensive support extraction and consumes baked edges only when the current level geometry and monster mobility exactly match; changed geometry or mobility falls back safely to live construction instead of using stale routes.

The Level Editor can preview a selected graph over the level. Cyan lines show walkable supports, purple arcs show jumps, orange arrows show drops, and green arrows show step connections. `level_001` includes baked profiles for both hunter goblins.

Dynamic world changes are represented without rebuilding the search algorithm. Edges may carry blocker IDs, and baked graphs may carry dynamic cost rules that disable an edge or add a penalty according to an entity state. This is the extension point for doors, destructible passages, lifts, and other conditional routes. The first revision establishes the data and runtime evaluation boundary; authoring richer blocker rules remains part of the door/destruction work.

A dedicated navigation-maze fixture verifies that the route search can initially move away from Ignatius, climb twice to the right, fall to the right, reverse beneath an impassable wall, cross a gap to the left, climb leftward steps, and finally cross back to the right. Separate graph-baker tests require all six directional transition families: jump left/right, drop left/right, and chasm jump left/right.

The runtime departure step also distinguishes leaving a support from landing on it. A controlled drop temporarily ignores the source support for body blocking and landing checks while the enemy clears its edge, then restores ordinary collision validation. This fixes the repeated launch-and-immediate-reland loop that previously made hunters appear unwilling to fall, especially when a very large jump-height value caused downward routes to be represented poorly.

### Revision 118 shared actor collision and obstacle-clear hunter traversal

Hunter jump baking now generates physics-guided takeoff candidates rather than favoring the point nearest a raised wall. Candidate arcs are trial-run at the simulation's fixed 60 Hz split-axis cadence with the actor's full collision width, so a route is rejected when the body would hit a pillar before the feet clear its lip. Route cost still includes the approach from the monster's current position, allowing a nearby but unsafe takeoff to lose against a slightly longer, reliable run-up.

Airborne hunter traversal now uses shared actor sweep queries for solids, collision segments, and collision polygons. Those same queries drive Ignatius's ordinary X/Y collision wrappers, keeping feet, walls, ceilings, and landing behavior under one geometry rule set. A controlled drop ignores only its source landing surface during the brief ledge-departure window; it never disables the ground below or the source obstacle's side wall.

Hunter awareness is now consistent across occluding scenery: the configured awareness range forms the default aggro radius for the `hunter` strategy, after which graph navigation and attack-position checks deal with obstacles. Revision 120 supersedes the earlier optional line-of-sight flag with distance-and-facing perception for every strategy. Both goblins now default to a run speed of 200 px/s and jump height of 200 px, and `level_001` carries one freshly baked graph for their shared 70×105 mobility profile.

### Revision 119 walk-off drops and automatic playtest baking

The graph baker now distinguishes a physically executable walk-off drop from a merely mathematical fall between two support points. For a lower support beyond the side of a solid platform, it places the launch point at the source edge and chooses enough horizontal velocity to clear the source obstacle with the monster's complete body width before the body descends alongside the wall. Candidate trajectories continue to be validated with the same fixed-step split-axis cadence used by runtime.

The Level Editor's Play command now rebuilds all placed hunter mobility graphs immediately before serializing the browser playtest copy. The explicit Build button remains useful for graph preview and inspection, but stale or absent baked data can no longer result from forgetting that step during ordinary playtesting. The baker remains fast because support extraction and candidate generation are analytical and only promising transitions receive fixed-step trajectory trials; it does not brute-force every possible position and velocity.


### Revision 120 distance-and-facing monster awareness

Monster awareness no longer performs a terrain line-of-sight query. Walkable lines, blockable areas, pillars, doors, and other collision geometry may still prevent movement and block a real melee or projectile attack, but they do not make Ignatius invisible. Initial notice requires the player to be inside the authored radial awareness range and inside a configurable facing cone. Legacy vertical-awareness input is ignored and discarded; it is not retained in current catalog, level, editor, or runtime data. The default half-angle is 60 degrees, producing a 120-degree total cone.

The Level Editor exposes the view half-angle beside the other enemy AI fields. Existing `awarenessRequiresLineOfSight` data is no longer consulted by simulation, avoiding strategy-specific perception rules.

### Revision 121 forward-half-plane awareness and committed jump run-ups

Monster first-notice awareness uses an authored facing cone. Revision 121 established the full ±90-degree half-plane behaviour and its boundary handling, after which the enemy catalog was tuned to ±45 degrees. Revision 132 widens the current authored default to ±60 degrees. Targets outside the authored cone remain unnoticed even when they are within radial range. Collision geometry still does not occlude awareness, and attack trajectory checks remain separate.

Jump navigation now models the ground approach as part of each baked edge. Every non-vertical jump may carry a `runUpX`, `runUpY`, required launch speed, acceleration, and run-up distance. The graph baker rejects a jump when the source support lacks enough clear corridor to accelerate into takeoff. Runtime first moves to the run-up point, commits to the edge, accelerates through the takeoff point, and only then transfers to airborne traversal. Repathing does not interrupt this committed approach. This fixes the common failure where a hunter reached the obstacle wall, stopped, and repeatedly attempted the jump from rest.

The Level Editor graph preview draws the run-up as a dashed segment leading into the purple jump arc. `level_001` baked profiles were rebuilt with the shared 950 px/s² ground acceleration and graph format version 2.

### Revision 122 doorway-scaled rocket fuel indicator

The mounted rocket fuel indicator now receives the exact rendered rocket-part transform rather than the unscaled source pose. During entry and exit doorway sequences, its local position, radius, rotation, and facing therefore inherit the same `player.renderScale` transform as the rocket and the rest of Ignatius. Normal full-scale rendering is unchanged.

### Revision 123 last-seen pursuit and facing-priority rocket targeting

Hunters now persist the wizard's last genuinely observed foot position. A short authored awareness hold prevents deliberate tactical backpedalling from instantly erasing contact, but once that hold expires the hunter stops planning against the hidden current player. It enters `investigate_last_seen`, evaluates every support reachable through its current mobility graph, and chooses the point with the smallest remaining world-space distance to the remembered position. Route cost breaks ties between equally close points. The hunter traverses to that point before entering the five-second glare/give-up sequence, and the glare remains aimed at the remembered position rather than tracking Ignatius through concealment or distance.

Ignatius's homing rocket now selects targets by facing priority. Active targets in the forward half-plane are considered first and the closest of those is selected from the rocket launch point. Targets behind Ignatius are considered only when no forward target exists. Existing in-flight rockets retain valid targets, while replacement targeting uses the same rule after a target is defeated.

### Revision 124 visible-player targeting after health reaches zero

Player health reaching zero is not yet a complete death lifecycle. Until a dedicated defeated state explicitly marks Ignatius as dead, hidden, or untargetable, the visible player remains a valid awareness, melee, projectile, and collision target. Enemy combat logic therefore no longer uses the raw health amount as a proxy for player existence.

This prevents ranged hunters from slipping into last-seen investigation or unreachable glare after repeated attacks merely because the health display has reached zero. Projectiles continue to collide and produce impact presentation, while `damagePlayer` correctly applies no further health reduction. A later player-death implementation should disable targeting through an explicit player lifecycle state rather than by reintroducing scattered health checks.
### Revision 126 Puppet Guide and destructible barrier

The game view now has a separate `Puppet guide` button, disabled by default. When enabled, every non-visualized enemy receives diagnostic overlays for its baseline-anchored movement body, exact projectile hurtbox, awareness cone, attack reach/window, target anchor, patrol span, route, AI state, and last genuinely seen player position. Shared actor geometry moved into `src/shared/actor-geometry.js` so the renderer and portable simulation use the same projectile-hit and melee-reach rectangles.

The next Phase 4 reactive-object step is also complete: the interactive catalog includes a placeable destructible iron barrier using existing atlas art. It has authoritative health, intact/bent/destroyed visuals, dynamic player/projectile collision, rocket interception, smoke feedback, and destruction cleanup through the generic reactive-object pipeline. The falling-tree bridge remains the next reactive-world target, but it is postponed until its graphical asset can be authored and reviewed. The current near-term target is cave-window authoring and a dark parallax foreground layer.
### Revision 128 authoritative rig files and legacy-link compatibility

Character definitions no longer have a path for replacing rig parts or pivots. The browser runtime and Puppet Forge load the referenced rig as the sole geometry source, and Enemy 002/003 keep their differing right-arm pivots in `ct_rig_enemy_002.json` and `ct_rig_enemy_003.json`. Regression coverage rejects the removed patch fields and verifies both dedicated pivots. The legacy `IgnatiusRocketfrock_JS.html` entry remains as a compatibility redirect to `index.html`, preserving query strings and fragments for old links.

### Revision 129 downward traversal and early takeoff recovery

The rebuilt 70×105, 200 px/s hunter graph exposed two gaps that older oversized mobility profiles had masked. Lower separated supports could lose every usable downward transition because a slow jump arc clipped the source wall on descent, and several equally feasible ascent candidates were costed in a way that favoured the shortest, wall-side launch. The graph builder now generates deliberate downward jumps whose horizontal speed clears the complete body beyond the source obstacle before descending below its top. Ascending routes carry a `takeoffClearance` preference so an earlier body-clear launch wins over a nose-to-wall alternative.

Runtime support recovery now samples nearly the full body width after landing. When shared collision safely catches a hunter on a neighbouring valid support before the nominal graph endpoint, that landing is accepted, snapped into the support's usable interval, and replanned without increasing the failure counter. `level_001` has been rebaked for the current shared goblin profile, and regressions require an early central-pillar takeoff, a safe pillar-top recovery, and a completed downward jump to the lower floor.

### Revision 130 edge-overlap ascent and visible controlled loading

The `level_001` pillar regression came from two coupled assumptions in the graph baker. A tiny lower ledge and the upper top belong to the same closed collision polygon, so the offline trajectory validator was allowing a jump to touch the polygon's left wall merely because the nominal destination support was elsewhere on that polygon. At the same time, upward candidates required the actor's entire body to fit on the destination at first contact. For the 70-pixel-wide, 200 px/s goblin this pushed the desired landing too far inward, making the only generated arc launch late and clip the wall. Destination collision exemptions now apply only while the actor centre is horizontally over the actual destination support. Upward landings use a stable majority overlap rather than full-body fit, allowing an earlier direct jump to the pillar top while full-body fixed-step trajectory validation still rejects wall contact. `level_001` is rebaked with direct, early jumps from both sides, and the left-side climb is covered by a full-simulation first-attempt regression.

Browser startup now owns an explicit loading lifecycle. `game.html` paints a loading card, percentage, and progress bar before JavaScript starts. The bootstrap loads the active level first and gives its referenced atlas manifests to the renderer, eliminating the old sequential probe through twenty possible environment atlases. Wizard, enemy, animation, and atlas work is progress-reported and independent projects load concurrently; image completion waits for decoded pixels. The overlay remains until collision manifests, the level colour map, UI setup, and a first paint are ready. Level transitions reuse the same surface and call `ensureEnvironmentAtlases` before applying collision when a future level introduces a new atlas.


### Revision 131 immediate last-seen pursuit and compact downward run-ups

The apparent ledge stall was a timing interaction rather than a missing graph edge. With Ignatius below and slightly ahead, the centre-to-centre bearing can sit just outside the goblin's authored ±45-degree facing cone. Revision 130 kept the engagement alive for the authored awareness-hold duration, but while that timer ran it neither continued toward the remembered support nor selected a replacement route. Once the hold expired, the downward edge then requested a nearly full-width run-up across the narrow pillar top. The combined pause, backtrack, acceleration, and long ballistic arc looked like a hunter that had decided to live on the ledge permanently.

An engaged hunter now continues a route selected while the target was visible, which preserves intentional ranged backpedalling when turning briefly puts the target behind the facing cone. When no route is active, the hunter begins last-seen routing immediately. The hold timer still prevents instant disengagement and delays the glare/give-up sequence, but no longer freezes locomotion.

Downward jumps now choose a preferred run-up from the speed actually required, the authored ground acceleration, and a modest stability margin. This keeps the physically necessary run-up while avoiding a full traverse of a small platform for a low-speed exit. Upward wall-clearing jumps retain the longer run-up needed for reliable obstacle clearance. `level_001` has been rebaked and the central-pillar screenshot arrangement is covered by a deterministic simulation regression.

### Revision 132 wider authored awareness cone

The default monster facing cone is widened from ±45 degrees to ±60 degrees, producing a 120-degree total field of awareness. This keeps a substantial rear blind zone while making targets noticeably below or above a ledge less likely to fall just outside perception. The enemy catalog, current `level_001` placements, simulation fallback, Level Editor fallback, documentation, and regression expectations now agree on the same value. Navigation graphs are unchanged because perception angle is behavioural data rather than a mobility-profile input.

### Revision 133 controlled ledge walk-offs

The `hunter:unreachable_glare` state on the left stone ledge was a graph-topology failure rather than another perception problem. The lower floor extends beneath and beyond the ledge, but the drop generator only considered a destination when its whole support interval sat to the left or right of the source. Because the floor overlapped the source horizontally, neither side was tested. The remaining routes required a much longer jump chain and exceeded the goblin's authored 280-pixel fall limit, so the planner honestly reported no route even though a person would simply walk off the right edge.

Controlled drop generation now evaluates both physical edges of the source obstacle for every sufficiently lower support. It keeps only sides where the destination contains a stable full-body landing interval beyond the source wall, computes the horizontal speed needed to swing the collision body clear during the first part of the fall, and emits a `walkOff` drop with zero initial vertical speed. Runtime grants a short source-only collision exemption while that body clears the ledge. Matching line segments belonging to the same closed polygon are included in the exemption, but unrelated terrain remains solid and ordinary swept collision performs the landing. Straight gravity drops through one-way walkable supports retain their own source-only departure handling.

The shared goblin `maxFallDistance` is raised to 600 pixels in the enemy catalog and current level placements, allowing the authored left-step-to-floor descent without changing jump height or run speed. `level_001` is rebaked for the new mobility profile. Regressions reproduce the screenshot geometry, require the first route edge to be a rightward gravity-driven walk-off, simulate the complete landing on the lower floor without a navigation failure, and retain coverage for ordinary vertical drops and offset pillar-wall clearance.

### Revision 134 slope-aware grounded traversal

The latest arch screenshot exposed a runtime traversal mismatch rather than a missing graph edge. The baked graph already connected the successive top segments of `arch_ruin_001` and ended in a gravity-only walk-off to the broad floor. The hunter followed the first downhill segment, but the generic grounded body-clearance rectangle remained level while the feet followed the slope. Near the steeper final segment, the uphill half of the same support entered that rectangle by a few pixels. Runtime interpreted its own floor polygon as a wall, failed the route twice, and entered `unreachable_glare`.

Ground support queries now retain the selected segment slope. Body-occupancy checks use that slope only to lift the bottom of their clearance probe by the terrain rise across half the probe width. This does not move or shrink the actor, alter the navigation graph, ignore a complete polygon, or weaken airborne swept collision. It simply prevents the support immediately beneath an upright actor from masquerading as an obstacle when the support is sloped. Pursuit, patrol, attack-position validation, remembered-position validation, and step landings all use the same rule.

A deterministic regression places the musket goblin on the actual downhill section of the `level_001` arch with Ignatius on the floor to the right. It requires the route to cross the connected slope segment, preserve the preferred walk-off drop, land on the right-hand floor, accumulate no navigation failures, and never enter glare. The baked graph is unchanged because the defect was entirely in grounded runtime occupancy validation.

### Revision 135 cleanup audit and cave-window boundary

Revision 135 removes three obsolete enemy-data paths from current authored and runtime data. `strategy` is now the sole current behaviour field, `runSpeed` is the sole current pursuit-speed field, and the unused `awarenessVerticalRange` field is discarded. Older levels may still provide `behavior` and `chaseSpeed`; import normalization converts them once and runtime state retains only the canonical fields. The enemy catalog, `level_001`, Level Editor inspector, tests, and documentation now emit only canonical data.

The former core-to-presentation colour-map dependency is also removed. Engine-neutral colour-map normalization, cache keys, and colour mathematics now live in `src/shared/level-color-map-data.js`. Offscreen Canvas generation remains in `src/presentation/level-color-map-cache.js`. Source-boundary regression coverage now rejects future core imports from browser, presentation, or editor code. Two unused public helpers were removed after repository-wide reference checks.

This revision also records the cave-window architecture before implementation: the perimeter is an inert, parallaxed foreground mask and decoration layer, never gameplay collision. Authoritative platforms remain in the playing-area layer, foreground placements force collision off, and perimeter artwork fades outward into black. The next revision begins whole-level zoom/fit and closed spline authoring.

### Revision 136 closed cave-window spline authoring

The Level Editor now zooms out to 0.02× and provides separate **Fit world**, **Fit content**, and **Fit cave** controls. The cyan technical world envelope remains distinct from authored content and from the visual cave opening.

A new `caveWindow` level record stores `enabled`, future feather width, subtle foreground parallax, and an ordered closed loop of control points. Each point has a stable ID, world-space position, and either `smooth` or `corner` mode. The editor can initialize an eight-point rounded loop from the world bounds, insert a point on the nearest spline segment, drag points with normal snapping, change point mode, delete points, and preview the exterior as a flat dark editor shade. Curve normalization and sampling live in `src/shared/cave-window-data.js` so later runtime masking and deterministic decoration can use exactly the same spline mathematics.

This is authoring and presentation data only. Revision 136 does not add cave collision, navigation, hazards, projectile blocking, runtime masking, or automatic rock placement. `level_001` adopts the disabled schema with no invented perimeter points. Revision 137 completes the runtime black exterior, feathered opening, and subtle foreground parallax. The next cave-window step is deterministic presentation-only perimeter decoration from tagged atlas assets.


### Revision 137 runtime cave-window masking and parallax

The browser adapter now normalizes `level.caveWindow` separately from portable gameplay and synchronizes it directly into presentation during initial loading, browser-copy playtesting, and level transitions. `src/core/simulation.js` remains unaware of the cave mask and derives no collision, navigation, hazards, or projectile behavior from it.

`src/presentation/cave-window-mask.js` renders the opening through a reusable offscreen canvas. The surface begins as opaque black, the closed authored spline is removed with `destination-out`, and a blurred removal around the outside of the curve creates the configurable feather into unseen rock. The result is composited after actors and actor-front scenery, so the cave edge can occlude them, but before story overlays and debug text.

The authored parallax factor is applied as a small extra camera-relative offset around the technical world centre. A factor of `1` keeps the mask locked to the playing layer; values above `1` make it move slightly faster as foreground scenery without allowing the absolute world coordinate origin to create an arbitrary large displacement. Revision 137 does not place rock sprites or foreground formations. Revision 138 completes that slice with explicit deterministic perimeter decoration and manual foreground placement.

### Revision 138 deterministic cave decoration and foreground placement

Cave editing controls now live in the Level Editor's right-side **Cave window and foreground** panel instead of occupying the global toolbar. The same panel provides a dedicated **Place selected asset in foreground** tool. Manual foreground placements use the selected atlas frame at the authored cave scale, render after actors, inherit the cave parallax, and have manifest collision forcibly disabled. Moving an existing asset into `caveForeground` through the inspector applies the same safety rule.

`src/shared/cave-window-decoration.js` adds deterministic arc-length placement around the closed spline. The generator classifies each sample from the cave's inward normal, choosing tagged stalagmites/rocks/floor pieces for lower edges, stalactites/ceiling pieces for upper edges, and wall/pillar pieces for sides. Seed, scale, and brightness are stored under `caveWindow.decoration`; revision 279 removes the former spacing field. Generated objects are explicit level placements marked `generatedBy: "cavePerimeter"`, so **Populate perimeter** safely replaces only prior generated art while **Clear generated** leaves manual foreground work intact.

The runtime draws `caveForeground` after actors and actor-front entity pieces but before the feathered black mask. It applies the same camera-relative parallax as the mask and a dark, slightly desaturated Canvas filter. Both runtime level conversion and atlas-collision hydration reject collision from this layer even if imported data incorrectly enables it. No cave perimeter or foreground placement creates solids, supports, hazards, navigation, or projectile blocking.

### Revision 139 Canvas 2D cave-scene performance pass

Dense perimeter population exposed several avoidable costs in the Canvas renderer. Revision 138 rebuilt three filtered/sorted visual arrays every frame, submitted every environment placement even when it was far outside the viewport, applied a CSS-style Canvas filter separately for every visible foreground object, and rebuilt a full-resolution blurred cave mask every frame. A populated cave therefore magnified presentation overhead without increasing simulation work.

`src/presentation/world-visual-cache.js` now owns presentation-only static visual organization. It partitions and sorts ordinary, actor-front, and cave-foreground records only when the `world.visuals` array identity changes, and precomputes conservative axis-aligned bounds from each placement's rotated rectangle. Terrain, cutout masks, actor-front pieces, and cave-foreground sprites are rejected against an expanded world-space viewport before any Canvas save/translate/rotate/filter/draw work. Foreground culling uses the same parallax offset as drawing, so objects do not pop at the edge when the cave frame moves faster than the playing layer. Targets, pickups, enemies, smoke puffs, and projectiles are also rejected conservatively when outside the expanded viewport; projectile bounds include their visible trails. Fallback collision rectangles and debug labels receive simple viewport rejection as well.

Foreground brightness and saturation are now baked once per atlas frame/treatment/colour-map combination into a small cached canvas. Normal frames draw that cached image without changing the main context's filter state. The cache is invalidated when new atlases arrive or the level colour map changes.

The feathered cave mask now renders at 35% linear resolution, approximately one eighth of the former pixel area, and is upscaled during composition. A stable render key reuses the existing mask while viewport, camera, perimeter, world bounds, feather, parallax, and resolution inputs remain unchanged. Camera movement still invalidates it, preserving correct parallax.

The game debug panel now reports rolling render time, stage timings, real render-to-render frame rate, static and dynamic visuals considered/drawn/culled, foreground-cache hits/misses, and whether the cave mask was reused. This makes the next optimization decision measurable. WebGL2 remains available if representative decorated caves still miss the target after this pass, but it is no longer the first response to work that Canvas should never have been asked to do.


### Revision 140 editor performance, adaptive coverage, and black handover

The Level Editor now treats dense generated cave art as a static visual set rather than rebuilding every expensive operation during interaction. It caches the sorted layer split, retains transformed placement bounds, rejects off-screen placements before Canvas work, caches treated foreground frame canvases, suppresses generated-object collision guides and labels unless selected, and defers full pretty-printed JSON serialization until the user pauses. A UI-only **Show generated perimeter assets in editor** checkbox can remove the whole generated frame from the editor canvas without deleting any placement or affecting playtest/export data.

Perimeter spacing is now a maximum instead of an unconditional centre-to-centre distance. Each chosen asset contributes its projected tangent coverage; smaller stalagmites and stalactites therefore receive closer, overlapping placement, while larger floor and ceiling panels remain eligible. Horizontal runs use a denser factor than side walls. Generated records also carry an outward unit vector and fade interval. `src/presentation/foreground-sprite-treatment.js` converts that world vector into local sprite space after rotation/mirroring, darkens/desaturates the atlas frame once, and overlays a linear transparent-to-opaque-black gradient. Both game and editor reuse those cached canvases, while older/manual foreground records fall back to a vector from the cave centre.


### Revision 141 cave-window tuning and loop-free starter perimeter

New cave-window records now default to 1.1 foreground parallax and 4× automatic perimeter asset scale. Generated floor, ceiling, and wall decorations are moved slightly inward across the authored spline rather than being centred outside it, giving their readable side more overlap with the cave opening. Their local black handover now spans almost the full sprite depth with a smootherstep-style multi-stop gradient, reaches opaque black at 92%, and leaves a fully black outer cap for a seamless transition into the exterior mask. Re-populating an existing perimeter replaces only generated records and applies the new placement and fade profile.

The world-bounds starter perimeter retains eight editable smooth points, but its rounded-corner radius is larger and its Bezier handles are locally clamped. A very long horizontal or vertical run can no longer pull the neighbouring short corner segment past itself, so the generated spline remains smooth and non-self-intersecting on the wide, shallow bounds used by `level_001`.


### Revision 142 practical scale and outside-bounds starter perimeter

The automatic cave-perimeter asset-scale default returns to 2× after playtesting showed that 4× was too large as a general starting value. The 1.1 foreground parallax, inward overlap, broad eased black fade, and fully black outer cap remain unchanged. Existing explicitly authored scale values are preserved; new cave-window records and the disabled `level_001` starter schema use 2×.

**Create from world bounds** now constructs its rounded eight-point spline around the technical bounds instead of inset within them. Its top, right, bottom, and left runs sit 96 world pixels outside the corresponding boundary. Corner segments join tangent points around the original corners, and regression sampling verifies that the closed curve neither enters the declared world area nor intersects itself.


### Revision 143 collapsible Level Editor and Asset Tool inspectors

The Level Editor and Asset Tool now match Puppet Forge's right-side inspector ergonomics. Every inspector box has a compact plus/minus control in its primary heading, collapses without changing authored data, and remembers its state independently in local storage. The implementation keeps secondary headings inside a collapsed box hidden, leaving only the primary heading and its accessible expand control visible.


### Revision 145 hidden gameplay-geometry warnings

The Level Editor now identifies collision-bearing atlas placements that are completely outside an enabled cave opening and separated from its sampled spline by more than a conservative margin. Those placements receive an orange dashed outline above the exterior preview shade, and the cave panel lists the affected IDs. Geometry that remains inside, overlaps the opening, or deliberately sits close behind the perimeter is not warned, preserving the intended foreground-occlusion workflow. The classification math lives in `src/shared/cave-window-data.js` as engine-neutral polygon-versus-spline separation logic. Revision 145 also removes an accidentally repackaged retired colour-map module that the architecture regression correctly rejected.

### Revision 147 visible full-black cave boundary

The cave-opening spline now has a derived, non-editable outset used as an authoring guide. The existing serialized `caveWindow.feather` value remains backward compatible, but the Level Editor presents it more concretely as **Full black distance px**. `src/shared/cave-window-data.js` samples the smooth opening and offsets that sampled loop outward by the requested world-space distance, handling either spline winding and mitering corners with a bounded spike length.

The Level Editor draws this boundary as a dashed magenta loop, optionally labelled **FULL BLACK**, so foreground rocks can be positioned with the final occlusion boundary visible. Runtime uses the same sampled outset after building the soft mask and explicitly fills everything beyond it with opaque black. The visual transition can therefore never leak past the editor guide because of browser-specific Canvas shadow kernels.

### Revision 148 safe moving-platform foundation

Moving platforms are introduced as an optional component on ordinary atlas placements rather than as a growing list of unrelated entity types. The compact authoring model separates movement pattern from activation. This first slice supports `shuttle`, `loopRespawn`, and `vanishRespawn`, with either automatic or wizard-rider activation. The common case is the default: an automatic shuttle travelling at 120 pixels per second and pausing for 0.75 seconds at both endpoints before reversing.

The placement itself is the start position and the destination is stored as a relative offset. The Level Editor presents a conditional inspector, a START/END route, endpoint ghost, draggable endpoint handle, start/end swap, and timing fields only when relevant. A platform moved in the level carries its route with it.

Simulation updates platforms kinematically before actors. Their atlas-derived collision geometry follows the visual exactly, and a standing wizard is carried by the same frame delta through his authoritative support ID. Fading immediately removes collision; fade-in restores collision only once the platform is fully present. `loopRespawn` travels to the endpoint before disappearing and returning to start, while `vanishRespawn` disappears in place as a trap. Both always restore after a positive timed hidden interval. A moving-platform configuration must never make death or manual level reset the only way to recover required traversal.

Dynamic platforms are currently excluded from baked enemy navigation, so enemies do not deliberately plan routes across them. Revision 156 adds named signal activation, reusable levers and keyholes, and collectible keys. Enemy carrying, crushing rules, and a lethal gameplay boundary derived from the cave's full-black guide remain the next staged additions.


### Revision 149 earthy game menu, persistent settings, and Electron preparation

- Add a compact top-right MENU and FULLSCREEN control inspired by Thoriumgap's clear two-level navigation, but restyle it in darker earth, soot, brass, timber, and moss tones suitable for Ignatius.
- Pause fixed-step simulation whenever the game menu is open and restore the prior debug-pause state when it closes.
- Add Menu and Settings views with Resume, Restart level, Exit to main menu, and Electron-only Exit to desktop.
- Persist effects volume, music volume, difficulty, and rendering quality through a versioned browser settings schema. Default effects volume to 80% and music volume to 10%.
- Keep the initial difficulty implementation deliberately narrow: Easy/Normal/Hard scale only incoming player damage to 75%/100%/150% through `damagePlayer`.
- Keep the initial rendering-quality implementation deliberately narrow: Low/Medium/High scale homing-rocket trail and impact smoke-particle density to 50%/100%/150%.
- Add a browser/Electron fullscreen toggle that updates its label between FULLSCREEN and WINDOWED.
- Add a secure optional Electron main/preload shell with context isolation, sandboxing, no Node integration, desktop quit, and fullscreen IPC.
- Do not bundle music yet. The first planned piece is a newly synthesized arrangement of *In the Hall of the Mountain King*, avoiding dependence on a potentially copyrighted recording.
- Increase the default homing strength of Ignatius's fired rocket from 3.2 to 4.8, making its turn response 50% sharper.
- Add regression coverage for settings normalization/persistence, menu and Electron source integration, fullscreen bridge routing, damage scaling, particle scaling, and the rocket homing default.

### Revision 150 automatic fullscreen policy, keyboard menu navigation, and purple presentation

- Replace the Settings dialog's immediate fullscreen action with a persisted **Automatically switch to fullscreen** checkbox.
- In ordinary browsers, enter fullscreen while gameplay is active and return to windowed mode whenever the pause menu or debug pause is active. Because browsers require a user gesture, the initial transition may occur on the player's first gameplay input.
- Keep the direct top-level FULLSCREEN/WINDOWED control for manual browser override. In Electron, hide the automatic policy and use the same compact control as EXIT because the packaged host is fullscreen-only.
- Add complete keyboard traversal for the menu and settings: Up/Down and Tab move through visible controls, Left/Right adjust sliders and option groups, Enter/Space activate, Home/End jump to boundaries, and Escape moves back or resumes.
- Retheme the menu and settings from the experimental earthy palette to the main index's deep-purple, lavender, and charcoal palette while retaining strong focus indication.
- Keep fullscreen transitions in the browser adapter. Portable simulation sees only the existing pause flag and normalized serializable settings.

### Revision 151 compact menu and synthesized level music

The pause menu now has one top-level return control: the persistent header **BACK** button. The duplicate Resume item is removed. Settings use a compact two-column layout on wider screens, collapsing to one column on narrow screens, and retain only the controls and their current values.

Music is now a browser-owned presentation service. `src/shared/music-data.js` contains a stable tune catalog, level-music normalization, pitch helpers, tempo mapping, and original compact note-event arrangements of public-domain compositions. `src/browser/music-director.js` turns those events into looping Web Audio oscillator voices after the first valid player gesture, applies the persisted music volume through one master gain, and switches tracks when a level is loaded. No recording, sampled audio, or MIDI file is packaged.

A level stores its choice as `music: { version: 1, tuneId }`. The Level Editor exposes the catalog in **Level music**, including silence, Grieg's *In the Hall of the Mountain King*, *March of the Dwarfs*, and *Anitra's Dance*, plus Mussorgsky's *Night on Bald Mountain*. `level_001` selects Mountain King. Future work may deepen the arrangements, add combat/scene layers, and introduce crossfades, but must preserve deterministic simulation and keep AudioContext ownership outside `src/core/`.


### Revision 152 score-verified Mountain King theme and low orchestration

The compact *In the Hall of the Mountain King* loop now uses a score-verified four-measure opening phrase rather than an equal-duration approximation. Its chromatic E-sharp turn, quarter-note holds, half-note cadence, and perfect-fifth restatement are represented explicitly in authored note events. The lead has moved down to a dedicated double-bass oscillator profile with a low tuba pulse underneath. `MUSIC_SOURCES.md` records both the Mutopia engraving and an independent Edition Peters scan from IMSLP used for verification. No notation source, MIDI, sample, or recording is shipped.

### Revision 154 unified dark-purple game UI surfaces

The temporary brown overlay palette is removed from `game.html`. Loading progress, HUD meters, help/debug panels, the tuning pane, menu controls, pause menu, and Settings now use one near-black purple family with lavender text and borders. The pause-menu card no longer layers radial glows and a repeating near-vertical stripe texture; it uses a solid dark-purple background, with Settings groups using a solid raised shade from the same palette. Preserve these shared variables so later HUD polish cannot quietly fork the menu and developer panels into unrelated colour schemes again.



### Revision 155 focus-loss pause, transient audio mute, and deeper Mountain King lead

- Default effects volume remains 80%; default music volume changes to 10%. Version-2 settings still carrying the former exact 60% default migrate to 10%; any other authored music volume is preserved.
- Treat browser-window blur and a hidden document as pause requests. Open the existing pause menu where possible, clear held input, and never auto-resume when focus returns.
- Derive audio silence from the pause/focus state. Music scheduling and gain are muted transiently, while the effective sound-effects volume becomes zero without modifying persisted sliders.
- Keep the verified Mountain King rhythm and intervals, but voice both statements one octave lower. Darken the double-bass synthesis with a lower filter cutoff and subharmonic reinforcement while retaining the tuba foundation.
- Add regression coverage for defaults, focus-loss wiring, pause muting, volume restoration, and the lowered melody register.


### Revision 156 named signals, switches, keyholes, and updated first level

Moving-platform activation now supports a third mode, `signal`, with a normalized named channel. Portable simulation owns channel revisions and emitter interaction so a platform reacts to a discrete operation rather than polling browser UI or hardwiring itself to a particular prop. A lever toggles its visible state and emits on its channel; a keyhole requires an authored inventory key, may consume it, remains unlocked, and can be configured as a one-shot emitter. The same channel contract is reusable by later doors, traps, scripted sequences, and other listeners.

The interaction action is mapped to Down, S, Enter, a gamepad face button, D-pad down, or downward stick input. Collectible key entities feed a small serializable inventory map, and collected item visuals disappear through the same presentation path as fuel pickups. `src/shared/signal-channel-data.js` owns channel and emitter normalization, while `src/core/simulation.js` remains authoritative for proximity, inventory consumption, state changes, channel emission, and moving-platform triggering.

The Level Editor exposes signal activation only when relevant, adds channel and keyhole fields to reusable emitter entities, and draws links from a selected signal platform to matching emitters. It warns visually when no emitter exists on the selected channel. Navigation baking now tags moving-platform geometry in the editor exactly as runtime does, ensuring dynamic supports remain excluded without changing later collision-polygon IDs. The user's revised `level_001.json` is retained and its hunter graph is rebaked against the updated static geometry contract.

### Revision 158 thought-bubble anchoring, visible-level music start, and enemy platform routes

Ignatius's thought overlay is now positioned from the painted bubble tail rather than from a facing-dependent cloud offset. During the thought phase the camera eases Ignatius toward the left side of the view, giving the lower-left tail room to remain attached to his head instead of visually implicating the mailbox. The bubble is slightly smaller, and its informational text uses the same responsive viewport zoom as the artwork. The renderer searches down from a modestly smaller default font until the wrapped message fits the bubble's usable interior, retaining timed scrolling only as a final fallback for unusually long authored copy.

Browser bootstrap now attempts to unlock and start the selected level tune immediately after the first drawable level frame and after each transition's first frame. The pointer/keyboard unlock listeners remain mandatory fallback paths because ordinary browsers may reject any sound before a qualifying user gesture. Portable simulation still stores only the tune ID and remains independent of Web Audio.

The next moving-platform slice gives character enemies authoritative physical support identity. Living grounded enemies are carried by the exact platform delta and can trigger rider-activated platforms. Hunter navigation augments the static baked graph at runtime with endpoint supports for collision-bearing `shuttle` platforms whose activation is `automatic` or `rider`. Boarding and disembarking are step-only transfers; the trip between matching endpoints is an explicit `ride` edge. While travelling, the hunter remains attached and walks along the platform toward the planned exit so short endpoint pauses do not force repeated loops. Signal-only and vanishing platforms remain excluded from autonomous route planning because their availability is not under the hunter's control. Static graph signatures and editor baking remain unchanged.

Crushing/depenetration and the cave full-black kill boundary remain the next unchecked moving-world safety items.

### Revision 159 thought-tail direction correction

The thought bubble now anchors Ignatius at the extrapolated end of the painted puff trail rather than at the centre of the lowest puff. This follows the artwork's actual down-left direction, so the trail points back toward Ignatius's head instead of visually continuing toward the lower-left corner beside him.

### Revision 161 enemy corpse gravity and moving support

Character enemies no longer remain suspended when defeated during a jump or drop. The authored non-looping death animation first completes without AI movement; afterward the corpse resumes portable collision physics under gravity, preserves only its existing ballistic momentum, lands on ordinary walkable/blockable geometry, and retains physical support identity. Grounded corpses are carried by moving platforms when their support moves, but dead enemies never trigger rider-activated platforms and never resume navigation, patrol, attacks, or voluntary movement. Corpse hold/fade timing remains unchanged.


## Revision 162 cave perimeter coverage and entry routing

Revision 162 makes both root entry pages redirect directly to `game.html`. Cave-window creation from world bounds now produces a denser, gently irregular outside loop rather than a flat rounded rectangle. New cave points are inserted on the nearest edge between authored control points, including the closing last-to-first edge. Automatic perimeter decoration places roughly two thirds of the primary rock row inside the cave opening, then emits half-overlapped radial rows outward until artwork reaches beyond the derived full-black boundary. All generated rows remain presentation-only, collisionless, deterministic, and replaceable through the existing `generatedBy: "cavePerimeter"` contract.

## Revision 163 gapless radial perimeter stacking

Revision 163 tightens automatic cave-perimeter coverage in both directions. Tangential spacing now uses a larger overlap reserve so curved and rotated sprite bounds do not expose narrow wedges. Radial rows overlap by roughly sixty percent and continue beyond the derived Full black line with an additional safety reach, ensuring the complete band from the authored opening to opaque black is covered. Generated draw order now runs from the inward row outward, so farther-out stalactite, stalagmite, wall, and rock bases are painted over inward rows rather than obscuring their tips.

### Revision 164: Varied primary perimeter depth

Automatic cave-perimeter population now varies the innermost row's penetration into the cave opening deterministically per arc placement. Each primary formation places between 50% and 75% of its normal depth inside the authored perimeter, replacing the previous narrow near-two-thirds band while preserving repeatable output for the same seed. Every outward coverage row in a radial stack inherits its primary formation's offset, so continuous coverage to the Full black line and outward-over-inward painter ordering remain unchanged.

## Revision 166 damage-triggered awareness

Player damage now acts as an unconditional enemy awareness trigger and refreshes pursuit memory.

## Revision 167 experimental frame-swapped flying bats

Four supplied candidate atlases are now available as numbered character projects `enemy_004` through `enemy_007`. The experiment deliberately stays inside the existing Puppet Forge/runtime contract: each isolated atlas frame is represented by a stacked rig part, every frame is registered on the visible eye, and one looping `fly` clip uses step-keyed alpha tracks to display exactly one frame at a time. Candidates 004-006 use their cleaned visual row order; candidate 007 omits the duplicated second high-wing mini-sequence while keeping its coherent downstroke and recovery frames. No still-frame-specific renderer or editor mode has been added.

The enemy catalog exposes all four candidates for side-by-side placement. Their shared portable locomotion mode flies a horizontal patrol with authored vertical bobbing, bypasses ground snapping and support navigation, and keeps flapping when defeated. A defeated bat accelerates away from Ignatius and disappears after an authored fly-off distance instead of entering the grounded corpse-gravity lifecycle. Puppet Forge exposes all four numbered projects, while the Level Editor preserves flying locomotion and does not snap these enemies to floors.

The next decision is visual rather than architectural: place the four candidates together, compare registration stability, silhouette continuity, apparent scale, and wing-cycle rhythm, then keep one or discard the entire experiment. Only after a candidate survives that playtest should the project consider a dedicated still-frame animation mode, atlas-order tooling, or a more elaborate flying combat behaviour. The existing cave-performance validation and moving-platform crushing tasks remain the next unrelated plan items.

## Revision 168 four-part rigged bat puppet

A fifth bat trial, `enemy_008`, now uses the ordinary articulated character pipeline rather than atlas-frame substitution. `ct_atlas_enemy_008` exposes four transparent parts: head, body, left wing, and right wing. `ct_rig_enemy_008` layers the rear wing behind the body, the front wing above it, and the head last. Each wing pivots at the shoulder claw and is classified as an arm-like control without pretending the character is humanoid.

The initial `fly` clip rotates the two wing sprites in opposite directions through a high pose, power stroke, and recovery. The body and head add a small recoil bob so the silhouette does not feel mechanically pinned. The project is registered in Puppet Forge, the renderer's known character set, and the enemy catalog. It reuses the portable flying patrol and death fly-off behaviour introduced in revision 167, so this revision changes presentation data rather than adding another locomotion path.

The next decision remains a visual playtest. Compare the rigged puppet against the frame-swapped candidates for silhouette, joint credibility, flap rhythm, and readability at gameplay scale. If the four-part puppet survives, refine its pivots and fly clip in Puppet Forge before adding attack behaviour. If the wing rotation remains too cardboard-like, discard or replace the artwork rather than building more animation infrastructure around an unsuitable source atlas.

## Revision 169 retained frame-swapped bats

The bat experiment is narrowed to two data-only frame-swapped projects. The previous `enemy_005` candidate is replaced by the newly supplied `ct_atlas_enemy_005.png`; all 22 source frames are extracted directly, retained in left-to-right and top-to-bottom order, registered on the orange eye, and played at 20 frames per second through ordinary step-keyed alpha tracks.

Discarded candidates `enemy_006`, `enemy_007`, and the articulated `enemy_008` puppet are removed from the enemy catalog, renderer preload list, Puppet Forge selector, project assets, and regression suite. The portable flying patrol and death fly-off remain shared simulation behaviour. The next bat step is visual playtesting of Atlas 004 against the replacement Atlas 005, followed only by timing or registration refinement of the chosen result.

### Revision 170: Enemy type authoring and bomber flight
Puppet Forge now owns a type-default editing surface for the matching entry in `ct_enemies_001.json`, including a full JSON escape hatch so newly introduced tuning values do not require a bespoke control before they can be authored. The first new airborne combat strategy is `bomber`: a flying enemy tracks Ignatius horizontally, holds an authored height above him, and releases gravity-driven projectiles when aligned.

### Revision 171: Perched bomber attack
The bomber strategy now begins at an authored perch rather than patrolling continuously. Once Ignatius enters the enemy's normal awareness range and facing cone, the bomber launches, moves toward a point above him, and drops a rock when aligned. If Ignatius escapes long enough for awareness to expire, the bomber returns to its original placed position and waits for another opportunity.


### Revision 172: retained bombing bat

`enemy_005` is now the sole retained bat rather than a candidate. Its 22 authored frames remain in order, the new rock image in `ct_atlas_enemy_005.png` is exposed as the `rock` projectile asset, and `enemy_004` has been removed. The bomber idly patrols a small area around its authored perch, uses the same 800-unit awareness range and 60-degree half-angle as the grounded enemies, and only begins its bombing run after Ignatius enters view.


### Puppet Forge hitbox preview

Enemy projects now show their type-wide gameplay hitbox in the animation workspace. Default dimensions, render scale, and artwork offsets can be tuned visually before downloading the updated enemy catalog.

### Revision 174: unified enemy catalog JSON workflow

Puppet Forge now presents the complete `ct_enemies_001.json` document directly above Character JSON, using the same inspect, apply, reset, and download pattern as the other project JSON documents. The higher-level Enemy type defaults controls remain the convenient visual editor for the selected enemy entry, while the full catalog panel is the authoritative save surface and advanced-editing escape hatch.

### Revision 181: sustained organic bomber pursuit

The retained bombing bat now releases rocks from beneath its body, climbs toward a high but still visible attack altitude, and remains engaged for repeated bombing passes while awareness is active. Flight pursuit uses velocity steering and a restrained curved offset instead of direct point-to-point translation. Forward clearance probes divert the bat around nearby terrain with a configurable safety margin. The supplied enemy catalog and level are included; the level's baked hunter navigation graph was regenerated after the level edit so it remains valid.

### Revision 184 explicit still-frame character animation contract

The retained bat does not require a separate sprite-animation renderer. Its atlas frames remain ordinary rig parts, and the existing transform/draw-command pipeline remains authoritative. To make this deliberate rather than accidental, still-frame clips may declare `presentation.mode: "exclusive_frame_parts"` with an ordered part list. Shared animation normalization verifies step-keyed alpha and exactly-one-visible-frame behavior across the whole clip. This gives future frame-sequence characters a documented, validated path without coupling presentation data to flight AI or introducing another animation runtime. Revision 185 completes the authoring side with a visible frame-based-animation checkbox, ordered frame controls, conversion repair confirmation, and exclusive frame selection at the playhead. The metadata now drives editor behavior rather than serving as an invisible annotation.

Revision 190 removes the last duplicated character-placement interpretation. Horizontal artwork offsets are character-local and mirror with facing, vertical offsets are downward-positive, and the gameplay hitbox remains anchored at the entity position. Puppet Forge, Level Editor, and runtime now share the runtime transform and artwork-origin helpers, so zoom changes scale the artwork, offset, and hitbox together without changing their relationship.

## Revision 193 prepared composite power-up artwork

The revised `it_atlas_001.png` now has manifest rectangles for eight small icon sprites plus the complete soft-alpha extent of a white glow sprite. The registered icons are coin, star, bomb, magnet, lightning, spark, wrench, and shield. These are presentation components only: they are not yet entity-catalog entries and do not introduce collection, duration, stacking, save-state, or tuning semantics.

The intended composite convention is to tint `powerup_glow_white` at render time and draw an icon centred above it. The wrench is reserved as the generic rocket-upgrade emblem, with blue, green, yellow, red, or cyan glow colours distinguishing later upgrade types. The lightning emblem is reserved for a yellow-orange rocket-overdrive pickup that will later double the allowed rocket firing cadence while halving fuel cost. Before runtime implementation, portable core data must define effect identity, duration or permanence, stacking/refresh rules, serialization, HUD exposure, and exact interaction with existing rocket cooldown and fuel accounting.

The next gameplay-safety work remains crushing/depenetration for actors trapped by kinematic platforms, followed by deriving Ignatius's lethal out-of-bounds rule from the cave full-black guide. After those safety items, the prepared power-up visuals can move into a dedicated pickup/effect schema and renderer composition pass. Flying/bomber code should stay in the portable core for now; extract a dedicated enemy-flight module only when another aerial archetype proves the interface reusable.

## Revision 194 higher, more organic bomber runs

The retained Bombing Bat now climbs to the intended high attack station before releasing a rock. The placed bat in `level_001.json` no longer carries the stale 190-unit hover override; it now uses the catalog's 280-unit station, which is roughly two painted wizard heights in the current presentation. A new vertical release tolerance prevents the bat from dropping as soon as it merely crosses Ignatius horizontally while still close above him.

The approach is less ruler-straight. Deterministic arc lift bends the first part of the route upward, restrained lateral wander remains present even near the bombing station, and arrival-speed easing lets the bat settle rather than snap into place. Existing compact obstacle probes and clearance steering remain authoritative. The rare green-cone non-alert case was not reproducible in this revision, so no speculative awareness rewrite was introduced; retain it as a watch item if a repeatable state appears.

The next planned gameplay-safety work is the cave full-black lethal boundary. The portable power-up/effect schema remains after that safety task.


## Revision 195 conservative moving-platform crushing

Ignatius is now crushed only by a genuinely closing kinematic sandwich. Ordinary collision recovery still chooses the globally nearest cardinal depenetration distance. Before applying it, the core checks whether that exact correction would enter a distinct blocking body and whether at least one involved moving platform is closing the gap along the correction axis. A farther horizontal escape is not substituted for a nearer blocked vertical exit, preventing the wizard from being fired sideways out of a crusher.

The condition must persist for three consecutive fixed steps. The second step emits an explicit warning event, and a two-step candidate that returns to zero emits `PLAYER_CRUSH_NEAR_MISS`. Normal moving-platform regression cases assert that neither diagnostic occurs, so the grace period cannot quietly conceal an almost-broken collision path.

A confirmed crush enters the common player-death lifecycle. Revision 196 supersedes the original immediate-hide presentation with a visible body-cover phase followed by the particle-only burst, while preserving the same conservative three-tick crush decision. Revision 197 extends that shared death presentation with denser cover sparks and a three-second post-burst hold before respawn. It also separates the projectile rocket from the worn backpack rocket in the wizard atlas and makes everyday rocket/enemy projectile trails and explosions more CPU-economical. The next gameplay-safety task is deriving the lethal player boundary from the cave window's Full black outset. After that, the prepared power-up artwork can enter the portable effect-schema and pickup-composition pass.


## Revision 196 unified Ignatius death sparks

Ignatius now has a complete defeated-state lifecycle. Any damage that reduces HP to zero, including enemy attacks, projectiles, damaging falls, and killable surfaces, starts a short cover phase in which the frozen rig remains visible while progressively delayed purple, yellow, and white sparks accumulate over his body. The cover then detonates into an outward spark burst, the rig disappears, and the ordinary reset path restores health and the authored spawn after the burst interval. Confirmed crushing uses exactly the same presentation rather than maintaining a separate death effect.

The lifecycle is explicit rather than inferred repeatedly from health. `player.combatState = "dead"` and `player.targetable = false` prevent enemies and projectiles from treating the death presentation as a live target. A fixed-step HP-zero guard also catches loaded or externally assigned states that did not pass through `damagePlayer`. Regression coverage checks the cover-to-burst transition, all three colours, outward velocity, non-targetability, crush integration, renderer draw order, and clean respawn.

The next planned revision remains the cave Full black lethal boundary. It should call this same lifecycle rather than inventing another death path.


## Revision 197 separated the fired rocket and lightened projectile effects

Ignatius now keeps wearing the backpack rocket while firing a dedicated projectile rocket frame from the lower-right of the updated wizard atlas. The shared death lifecycle also gained a denser cover phase and a three-second camera hold before respawn. Rocket trails and impact bursts were simplified, while enemy projectile trails and explosions were reduced much more aggressively for performance.


## Revision 198 enemy projectile visual language

Goblin fireballs now render a short procedural red tail over the rear of the authored bitmap. The tail is broad at the fireball and narrows behind it, with a maximum rendered length of roughly two to three projectile sprites. Enemy projectiles now use dark, economical impact puffs for terrain, lifetime, and object impacts. Only impacts on Ignatius receive a tiny yellow-purple accent, clearly separating ordinary mob weapon effects from Ignatius's rocket technology.


## Revision 199 circular fireball tail and gamepad title start

The goblin fireball tail is now a short chain of overlapping circles rather than stroked bars. Circles that still overlap the authored fireball bitmap remain opaque and approximately core-sized so they mask the static rear flame; after leaving the sprite footprint, they progressively shrink and fade. The title screen also samples the ordinary gamepad jump edge, allowing the same A-button/D-pad-up jump action used in play to start the game without a keyboard. The starting edge is consumed so Ignatius does not immediately jump on the first gameplay step.


## Revision 200 procedural goblin fireball

The goblin fireball no longer relies on its static atlas sprite during gameplay rendering. Instead it is reconstructed procedurally from layered glows and flame circles, with a matching short tapering circle-trail. Revision 199's title-screen gamepad start remains in place.


## Revision 201 implemented the selected E1-style goblin fireball

The goblin fireball now uses the E1 direction from the procedural preview set: a compact fiery head with a deterministic random mix of small yellow, orange, and red circles inside a narrowing tail envelope. The effect remains fully procedural and avoids the earlier solid-bar mismatch.


## Revision 202 animated enemy fireball emitter

The goblin fireball now behaves as a live emitter rather than a precomposed procedural stamp. Small red, orange, and yellow circles are spawned at the moving core, then drift, shrink, and fade over time while the compact head remains readable. This better matches the intended sense of living fire.


## Revision 203 tightened animated fireball particles

The live goblin-fireball emitter now starts with smaller circles capped well below the original sprite-scale fireball body, and every emitted circle shrinks linearly to zero over its lifetime. Trail length and emission timing remain unchanged.


## Revision 204 final fireball fallback strategy

The goblin fireball now always uses its authored sprite as the projectile body. The animated circle emitter is restricted to High graphics quality, where it appears only as a small supplementary trail. Low and Medium quality show only the sprite. Emitted circles are capped smaller and continue to shrink linearly over their lifetime.


## Revision 205 polished fireball, story pacing, and death burst

The animated fireball trail now appears on Medium and High graphics quality while Low remains sprite-only. Mailbox letters and thought bubbles now scroll at half their previous speed, no longer display skip instructions, and accept either jump or fire to advance. Ignatius's death burst launches particles 25% slower while those particles fade in half the prior lifetime.


## Revision 206 story text pacing adjustment

Mailbox letters and thought bubbles now scroll 25% faster than revision 205, settling between the original speed and the slower revision 205 pacing.


## Revision 207 character-paced story reading

Letter and thought-bubble timing now derives from a shared reading speed of 482 characters over 36.9 seconds. Each overlay waits 0.5 seconds before the assumed reading begins, scrolls linearly only while the reader is estimated to move between the middle of the first and final visible text windows, and holds the final view until the final character is expected to have been read.


## Revision 208 reading speed calibration

The shared letter and thought-bubble reading model now assumes 16 characters per second while preserving the existing 0.5-second reading-start delay, midpoint-based scrolling window, and final hold.


## Revision 209 reading speed and blank letter heading

Story overlays now use an assumed reading speed of 18 characters per second. The former visible letter heading is no longer drawn, while its reserved title band remains untouched so the body text keeps the same vertical spacing.


## Revision 210 archive handoff checkpoint

The supplied revision-210 archive contained a complete, readable project, but its embedded build labels and planning history still ended at revision 209. No separate revision-210 behavior could be identified reliably from the archive itself, so revision 211 records that handoff explicitly rather than inventing a code change that cannot be verified.


## Revision 211 full-black death boundary and Rocket Overdrive

The cave mask's Full black guide now has a matching portable lethal threshold. Editor-level conversion normalizes the authored cave window and derives `world.caveKillBoundary` from the exact same sampled outset used by the Level Editor and runtime mask. The fixed-step simulation checks Ignatius's complete body rectangle against that loop before story processing and after movement. Merely touching or crossing the line with part of the body remains safe; once the entire body is outside, the core emits `PLAYER_CAVE_BLACK_BOUNDARY_CROSSED` and enters the existing cover, burst, afterglow, and ordinary respawn lifecycle. Camera position, zoom, Canvas pixels, and foreground parallax do not participate in the decision.

This revision also completes the first portable power-up slice. `src/shared/power-up-data.js` defines normalized effect identity, bounded duration or permanence, refresh/extend/ignore stacking, death-reset policy, serialization fields, HUD composition metadata, and rocket multipliers. The first catalog entity is Rocket Overdrive: a 12-second refreshable lightning pickup that halves projectile-rocket fuel cost and launch cooldown without changing backpack-boost drain. Runtime composites the reserved lightning icon over a yellow-orange tint of the white glow, bobs the pickup in the world, and shows a timed HUD badge. The Level Editor previews the composite, and level 1 contains one early pickup at x=800 for immediate playtesting.

The next planned power-up work is to add additional effect definitions only when their exact gameplay meanings are chosen, rather than assigning speculative behavior to the remaining prepared icons. Other open gameplay work should now be selected from the older deferred items rather than the completed cave-boundary prerequisite.

## Revision 212 eight-second Overdrive and three-bar HUD

Rocket Overdrive now lasts 8 seconds. The shared effect schema also owns a numeric HUD priority, and `prioritizedActivePowerUpEffect` deterministically selects the one active effect shown when several eventually coexist. Higher priority wins, then the most recently activated effect, then stable effect-ID order. Gameplay stacking and multipliers remain unchanged.

The old Canvas-drawn top-right effect badge is removed. The permanent top-left HUD now contains three bars in this order: Health, Rocket fuel, and Power. Health and fuel labels use rounded whole values (`100 / 100 HP` and `100 / 100 %`) without regeneration, cap, or grounded-recharge annotations. The Power bar is empty and reads `Powerup: None` when inactive; while an effect is active, it displays the selected effect name, remaining/total seconds, and a proportional duration fill.

## Revision 213 Overdrive and randomized wrench arsenal

The first lightning effect is renamed Overdrive and retains its eight-second half-cost, double-cadence behavior. Its HUD priority remains above the wrench family, and the inactive Power label now reads only `Powerup:`.

The first complete wrench milestone adds Triple, Dart, Twin, Bigbomb, and Boomerang as fifteen-second mutually exclusive rocket modes. Triple and Twin produce distinct multi-projectile fans with best-effort separate targeting. Dart is a forward non-homing double-damage shot at two-thirds fuel cost. Bigbomb is a large slow-turning, half-speed, triple-cost and triple-damage projectile with an AoE diameter of roughly three wizard heights. Boomerang returns after a miss or destroyed target and refunds half its launch fuel when caught. Overdrive can coexist with any wrench and remains the effect shown in the HUD while active.

All power-up pickups now respawn after sixty seconds. Random-wrench placements select one wrench type from a portable deterministic pool at level start, disappear on collection, and reroll when they respawn. Browser starts and menu restarts supply a fresh random seed, while saved simulation state preserves the selected type, respawn timer, and roll count. Level 1 adds a random wrench at x=1400 while retaining Overdrive at x=800. The game manual documents the two-slot stacking rule, pickup respawns, random rerolls, HUD priority, and all five wrench behaviors.

The next milestone should begin with hands-on balance and visual playtesting of the five rocket modes. In particular, verify Triple/Twin target distribution in crowded combat, Dart aiming feel, Bigbomb AoE readability and cost, Boomerang catch reliability, and whether the sixty-second tactical return window suits level pacing before adding another power-up family.



## Revision 214 cached coloured wrench-rocket outlines

Every rocket launched under a wrench effect now preserves that wrench's ID and colour in the projectile record. This is launch-time identity, not a live lookup of Ignatius's current wrench, so replacing a wrench cannot recolour a projectile already in flight. Triple is yellow, Dart cyan, Twin green, Bigbomb red, and Boomerang purple. Standard rockets and rockets modified only by Overdrive remain visually unchanged.

The new presentation-only `src/presentation/rocket-glow-cache.js` builds one padded offscreen sprite for each source-rocket/tint pair. It extracts the authored rocket alpha, expands the silhouette with separable horizontal and vertical sliding-window maximum filters, applies a separable Gaussian blur, writes the tinted alpha surface, and retains it in a source-keyed cache. Runtime drawing then performs only an additive cached `drawImage` behind the ordinary rocket sprite before drawing the rocket and nozzle flame. The expensive image processing is therefore paid only on first use of a wrench colour, never once per rocket per frame.


## Revision 215 larger cached wrench-rocket outlines

The cached coloured outline around every wrench-modified rocket is now three times larger than in revision 214. The same cached separable-dilation and separable-Gaussian pipeline is still used, but the default expansion and blur radii are multiplied by three before the offscreen glow sprite is generated. Runtime draw cost is unchanged because the larger glow remains precomposited and reused.


## Revision 216 softer wider cached wrench-rocket glow blur

The cached coloured wrench-rocket halo now uses a larger blur kernel, with the soft blur extending roughly 20% of the source rocket width beyond the rocket silhouette. Revision 215 already enlarged the overall glow; revision 216 specifically makes the outer edge softer and broader by enforcing a minimum blur radius derived from rocket width and by using a correspondingly wider Gaussian sigma. The glow remains fully precomposited and cached, so runtime draw cost remains unchanged.


## Revision 217 pure wrench colours, softer halo, and non-piercing Dart

The cached wrench-rocket halo now uses a blur radius of roughly 25% of the source rocket width and a broader Gaussian sigma, producing a softer outer falloff than revision 216. All wrench glows now use exact pure RGB colours: Triple yellow `#ffff00`, Dart cyan `#00ffff`, Twin green `#00ff00`, Bigbomb red `#ff0000`, and Boomerang magenta `#ff00ff`. Runtime pickup and projectile glows no longer use additive blending, and the Level Editor no longer overlays an untinted white glow, avoiding pastel or white-shifted highlights. Dart remains double damage and two-thirds fuel cost but explicitly stops and explodes on the first enemy it hits.


## Revision 218 physical Boomerang return path

Boomerang rockets no longer become collision-free while returning to Ignatius. When no valid target remains, or after destroying a target, the projectile homes toward the wizard using its existing return steering. The return flight now performs the same swept collision checks as an ordinary player rocket. Reaching Ignatius completes the catch and refunds half the launch fuel; striking an enemy, reactive blocker, solid, platform, or cave collision first makes the rocket explode without a refund. An outbound Boomerang that directly strikes terrain also explodes immediately rather than using the terrain hit as a trigger to phase back through the level.


## Revision 219 thirty-damage standard rocket balance

Ignatius's standard projectile rocket now deals 30 damage instead of 55. Enemy defeat already uses a `health <= 0` threshold, so the 80-HP Fireball Goblin survives at 50 HP and 20 HP before dying on the third hit, while the 90-HP Musket Goblin reaches exactly 0 HP on the third hit and dies immediately. Wrench damage remains multiplier-based and therefore scales automatically: Triple deals 10 per rocket, Twin 15 per rocket, Dart 60, Bigbomb 90, and Boomerang 30. Overdrive changes cadence and fuel cost only, so it continues to use the active rocket mode's damage unchanged.


## Revision 220 enemy-health baseline and existing-enemy rebalance

New monsters now default to 60 HP whenever their catalog or level placement does not explicitly author health. The Level Editor seeds new catalog-enemy placements with 60 HP and uses 60 as the health inspector fallback. Puppet Forge also presents and saves 60 HP when a catalog entry has no explicit health, while the portable simulation uses the same fallback when loading external or older level data. Explicit enemy-specific durability remains authoritative.

The active catalog and every matching placement in `level_001.json` are rebalanced to Skeleton Guard 90 HP, Fireball Goblin 60 HP, Musket Goblin 60 HP, and Bombing Bat 1 HP. With the 30-damage standard rocket, those correspond to three, two, two, and one successful hits respectively. Enemy defeat continues to occur at `health <= 0`.


## Revision 221 wrench volley damage rebalance

Wrench damage remains derived from the shared 30-damage standard rocket. Triple now uses a one-half multiplier per projectile, producing three 15-damage rockets and 45 total volley damage when all three connect. Twin now uses a two-thirds multiplier per projectile, producing two 20-damage rockets and 40 total volley damage. Dart now deals standard 30-damage rocket damage while retaining its straight, faster, non-homing flight, first-impact explosion, and two-thirds fuel cost. Bigbomb remains at triple damage, 90, and Boomerang remains at 30.


## Revision 222 archive repack

Revision 222 is an unchanged repack of revision 221. It introduces no gameplay, data, presentation, or tool behavior and exists only as the supplied handoff archive.


## Revision 223 Shield power-up and completion of the current power-up set

The reserved shield emblem now defines a standalone five-second `shield` effect in `src/shared/power-up-data.js`. Shield refreshes rather than stacks, clears on death, coexists with Overdrive and the current wrench, and has the highest Power HUD priority while active. Its pickup uses `powerup_icon_shield` over the shared white glow tinted blue (`#008cff`) and respawns after sixty seconds. Level 1 places the first Shield at x=1900 on the early main floor.

Portable incoming-damage handling checks the active Shield before applying ordinary damage. Shielded hits leave health and damage-recovery state unchanged. Existing calls that explicitly set `bypassInvulnerability` remain authoritative for rules intended to be lethal regardless of temporary protection. Presentation precomputes a blue-tinted copy of each wizard part and pulses that overlay while Shield is active. The Shield overlay includes the backpack rocket and suppresses the ordinary red critical-health tint, so blue always wins when both conditions apply.

The current power-up set is now complete: Shield, Overdrive, and the five-mode wrench family. The bomb, magnet, and spark emblems remain intentionally unused until a later design decision explicitly reopens power-up work. The next milestone should be selected from the remaining non-power-up gameplay or content work after a focused Shield playtest confirms pickup placement, five-second readability, damage blocking, and blue-flash visibility.


## Revision 224 grounded mobs finish airborne movement before dying

Lethal damage no longer starts a ground mob's death animation while the mob is jumping or dropping. The hit still records zero health immediately and removes the mob from projectile targeting, but portable simulation enters a landing-pending state and continues the already committed airborne trajectory through the normal enemy collision path. No new route or attack is selected during this interval.

When the feet reach valid collision geometry, the pending state converts to the ordinary grounded death state and the authored death clip begins from time zero. Residual jump velocity is cleared and the landed support remains attached, eliminating the former death-pose freeze followed by a visible corpse jerk and fall. Grounded hits still start death immediately, while true flying enemies retain their separate fly-off behavior.

The next step is a focused in-browser playtest against hunter enemies killed during upward, apex, and downward portions of jumps, including landings on flat floors, neighbouring ledges, and moving platforms.


# Upcoming Milestone Roadmap: Score, Treasure, World Systems, and Automatic Level Drafting

Revision 225 turns the next development direction into an explicit ordered roadmap. Revision 224's airborne-death change still needs its focused browser playtest, but it no longer leaves the project without a defined next feature sequence.

The immediate implementation work should begin with small gameplay systems that the later generator can consume. Automatic generation should not invent substitute behavior for treasure, scoring, thoughts, bosses, or water; those systems should exist as ordinary authored level features first.

## Milestone A: Score and treasure chests

The first new gameplay milestone is a portable Score system plus functional treasure chests.

Score and any future Gold currency must remain separate concepts. Revision A introduces Score only. It must not silently become spendable currency, and no `gold` field or upgrade economy should be added until that design is explicitly chosen.

Planned Score contract:

* Add an authoritative non-negative integer score to portable game state.
* Preserve Score through ordinary death/respawn, level transitions, and save/restore.
* Reset Score only when beginning a genuinely new game or otherwise performing the existing full-session reset.
* Display Score in the HUD without making the renderer or DOM authoritative.
* Emit deterministic score-change events so presentation can show temporary `+N` feedback without owning the value.
* Initially award Score from treasure chests only. Enemy-kill scoring, time bonuses, and level-completion bonuses remain separate future decisions.

Planned treasure-chest contract:

* Use the pixel-aligned `chest_open_loot` and `chest_open_empty` states from `it_atlas_001`; retain `chest_closed` only as a separate unused artwork option because its perspective does not match the open pair.
* Give each placed chest an editable positive `scoreValue`.
* Open and collect automatically when Ignatius moves within a small authored or normalized proximity range; no new interaction button is required.
* Begin visibly open with loot, award on proximity, then leave the open-empty artwork behind permanently for that game state.
* Award the chest's Score exactly once.
* Serialize collected/open state so save/restore and ordinary death/respawn cannot duplicate the reward.
* Add Level Editor inspector fields for Score value and collection distance, using safe defaults.
* Provide restrained collection feedback such as a brief `+100` presentation and a small sparkle or coin-like burst without introducing a separate Gold counter.

The later reward populator may place treasure chests only after this milestone is complete.

## Milestone B: Weak standard-rocket splash

The ordinary rocket needs a tiny crowd-control edge before generator-created groups of 1-HP bats become common.

Planned first-pass behavior:

* The directly struck enemy keeps the normal standard-rocket damage, currently 30, and does not receive an additional splash point.
* Other enemies inside the weak splash receive exactly 1 damage.
* The effect belongs to the standard projectile mode. Overdrive and Shield do not replace that projectile mode, so they retain the weak splash; an active wrench replaces the projectile mode and therefore uses only its own authored behavior.
* Trigger the weak splash when the standard rocket explodes against an enemy, blocking reactive object, or terrain, allowing a near miss against a clustered bat group to be useful.
* Affect enemies only. Do not damage treasure chests, doors, switches, other reactive scenery, or Ignatius.
* Begin with a splash **diameter** of approximately two wizard heights, equivalent to a radius of one wizard height. Treat this as a playtest value rather than an immutable rule.
* Use a small restrained impact pulse clearly weaker than Bigbomb.
* Add deterministic tests for direct-hit exclusion, secondary 1-damage hits, range limits, standard/Overdrive behavior, and wrench exclusion.

If terrain shielding proves visually necessary during playtesting, add a shared line-of-effect rule rather than special-casing bats.

## Milestone C: Location-triggered thought bubbles

Add an editor-placeable rectangular trigger whose authored text is shown through the existing thought-bubble reader when Ignatius enters it.

The trigger should:

* Fire on entry rather than on every overlapping frame.
* Default to one-shot behavior for the current level state.
* Store text, bounds, one-shot policy, and optional identifier in level data.
* Reuse the existing 18-characters-per-second reading model, scrolling, final hold, Jump/Fire advance behavior, and movement/combat lock.
* Serialize consumed state.
* Render its bounds and label in the Level Editor but remain invisible in gameplay.
* Use a generic thought-sequence entry point so mailboxes and location triggers share presentation machinery without pretending every thought came from a letter.

## Milestone D: Basic boss encounters

Bosses initially remain ordinary character enemies with per-placement scale, health, and tuning overrides. Add only the missing boss identity and presentation contract:

* A Level Editor **Boss** checkbox and editable boss name.
* Portable `isBoss` and `bossName` placement/state fields.
* One prominent current/max-health bar for the actively engaged boss.
* Show the bar when the boss becomes aware of Ignatius, is damaged, or is otherwise explicitly activated; hide it after defeat or encounter reset.
* Emit a deterministic boss-defeated event for future gates, music, rewards, and story logic.
* Support one displayed boss bar initially. Multi-boss aggregation and formal boss-arena controllers are later features.

## Milestone E: Water volumes

Implement rectangular authored water volumes before asking the generator to create water basins.

The first portable water contract should:

* Let Ignatius pass through the surface and continue using ordinary terrain collision beneath it.
* Reduce movement while any relevant body portion is in water.
* Apply deterministic health loss only while an authored breathing point near Ignatius's nose is below the surface.
* Let Ignatius walk on submerged floors rather than adding a swimming state.
* Define deliberately reduced jump and backpack-rocket effectiveness, with exact values selected by playtest.
* Treat Shield as blocking ordinary drowning/water damage unless a later design explicitly classifies it as unavoidable.
* Provide entry/exit ripple or splash presentation without making those particles authoritative.
* Expose movement multiplier and damage-per-second values in the Level Editor.
* Serialize any timing accumulator required for deterministic continuous damage.

Version one should use rectangles. Polygonal water, currents, buoyancy, and swimming remain out of scope.

# Automatic Level Generator

The Automatic Level Generator is an editor-side first-draft system. It generates normal explicit level JSON that can be edited, saved, tested, and later loaded by any runtime. The game runtime must never need to know whether a level began as generated content.

Its target is a useful, traversable base containing the majority of routine geometry and population, not a finished replacement for human level design. Hand-authored story staging, bespoke puzzles, memorable boss arenas, and final composition remain manual work.

## Theme presets with panel overrides

Themes remain data-driven JSON presets, even though a full Theme Editor is out of scope. The Level Editor's dedicated **Automatic Level Generator** panel loads a selected theme into visible controls and permits one-off overrides.

Initial themes:

* **Earth Cavern:** existing environment assets and ordinary colour treatment.
* **Ice Cavern:** the same initial generator implementations and asset families, with environment-atlas colour-map rotation producing a blue/icy treatment.

Both initial themes use the same ThePath74 protected orthogonal route planner, spaced-platform traversal builder, grounded endpoint placer, ellipse-room occupancy-contour cavern builder, encounter populator, reward populator, and protected perimeter decorator. Creating both immediately verifies that themes are genuine data rather than a hardcoded Earth mode.

The Ice theme should colour-map only whitelisted environment atlases. Interactive/story artwork such as doors, mailboxes, chests, and power-up icons must not be recoloured merely because it shares a level.

Selecting a theme populates the panel's controls. Editing a control produces a custom generation based on that theme; revision one does not save those overrides as a new theme.

## Generator pipeline and vocabulary

Use registered implementation IDs so each step can later gain alternatives without changing the theme schema. The build order must match the actual dependency graph rather than the old presentation-only list:

1. **Route Planner**: generates ThePath74 on an unbounded integer cell grid. It begins at the origin facing right, requests horizontal legs of 1–7 cells and vertical legs of 1–4 cells, turns left or right without reversing, checks both the next cell and a one-cell look-ahead, preserves an eight-neighbour margin from older non-local route cells, and forces a final rightward approach.
2. **Room Planner**: numbers the protected route cells, labels its immediate boundary by nearest route index, selects two to four well-separated anchors on the path or labelled boundary, and reserves ellipse rooms with horizontal and vertical semi-axes of 2–4 cells.
3. **Traversal Builder**: realizes horizontal route legs as separated jump platforms that may rise and fall around the abstract line, and realizes every mandatory vertical route leg with one automatic vertical shuttle platform. Static staircases and shaft zigzags are not used on the current mandatory route.
4. **Endpoint Placer**: places grounded entrance and exit chambers and their doors on validated supports.
5. **Cavern Envelope Builder**: combines traversal-clearance stamps with the selected ellipse-room stamps, rasterizes them into an occupancy mask, traces the connected outer contour, simplifies it, and emits ordinary cave-window points.
6. **Encounter Populator**: places monsters in locomotion-appropriate encounter regions.
7. **Reward and Prop Populator**: places chests, power-ups, and later other non-hostile entities.
8. **Cave Decorator**: applies deterministic perimeter and environmental decoration.
9. **Level Validator**: checks protected cardinal path geometry, leg-length contracts, room ranges, local traversal, population, endpoint safety, contour geometry, and presentation readability.

Current registered IDs are `the-path74-route-v4`, `spaced-platform-traversal-v2`, `grounded-chamber-endpoints-v2`, `the-path74-contour-cavern-v4`, `difficulty-budgeted-encounters-v1`, `basic-rewards-v1`, `perimeter-decoration-v1`, and `the-path74-cavern-validation-v4`. The revision-242 spatial-lane and contour IDs remain readable as legacy alternatives.

## Route Planner

The current route algorithm is **ThePath74**. It deliberately avoids a bounded maze and instead grows a protected orthogonal polyline on an unbounded cell grid.

ThePath74 contract:

* Start at grid cell `(0, 0)` with initial direction Right.
* For each horizontal leg, request a random length from 1 through 7 cells.
* For each vertical leg, request a random length from 1 through 4 cells.
* Move only Right, Left, Up, or Down. Never create a diagonal route edge.
* Before every step, require both the next cell and the one-cell look-ahead to be empty.
* Also require those cells to remain outside the eight-neighbour margin of every non-local older route cell. The current and immediately previous cells are exempt so ordinary corners remain possible.
* After a successful leg, turn left or right relative to the current heading; do not reverse directly.
* Finish with a forced-right leg of 1–7 cells and accept only candidates whose exit is the rightmost route point.
* Retain the complete numbered cell path and leg list in generation provenance. Abstract route nodes are placed at turns, endpoints, and selected room anchors, while the Traversal Builder may insert as many local supports as required.

Candidate ranking still measures backtracking, horizontal and vertical direction changes, occupied vertical span, edge crossings, travel expansion, longest eastward run, and overall aspect ratio. ThePath74 is allowed more horizontal breathing room than the revision-242 folded templates, but extreme shallow ribbons remain rejectable.

After the path is accepted, number its cells from `1..N`. Label each immediate boundary cell by the nearest numbered route cell. Select two to four well-separated route labels, then place each room centre either on that route cell or on a boundary cell carrying the same label. Each room is an ellipse with independently random horizontal and vertical semi-axes of 2–4 cells. These reservations are geometry metadata, not runtime objects.

## Cavern Envelope Builder

The current cavern builder is contour-based:

* ThePath74's two to four selected ellipse rooms are converted from 2–4-cell semi-axes into theme-scaled world-space stamps.
* Tunnel, chamber, endpoint, platform-clearance, and selected room stamps are combined around the completed traversal.
* Those stamps are rasterized into a low-resolution occupancy mask.
* Disconnected raster noise is discarded and the primary connected component is retained.
* The component boundary is traced, simplified without introducing self-intersections, and converted into ordinary editable cave-window corner points.
* One connected opening with no internal holes remains the current contract.
* A vertical world line may intersect the opening in several separate ranges, preserving solid rock between nearby folded passages.
* World bounds and the lower reset boundary are derived from the resulting contour and traversable content.

The old top-profile plus bottom-profile union was X-monotone and could represent only one uninterrupted vertical opening at each X coordinate. It is retained only as legacy metadata and fallback support. It must not be used to flatten a folded route into one giant chamber.

The cave perimeter remains visual only. The Traversal Builder owns all gameplay collision.

## Traversal Builder

The current traversal implementation must prioritize readability, movement variety, and reliability:

* Construct route connections from conservative tested movement envelopes for Ignatius's actual body, acceleration, ordinary jump, double jump, hover, and rocket boost.
* Horizontal legs must be a sequence of distinct platforms with visible air gaps. Platforms may sit above or below the abstract route line so movement feels like jumping through a cavern rather than walking along a drawn polyline.
* Use substantially less than theoretical maximum range for mandatory jumps and preserve broad landings at encounter-capable chamber nodes.
* Every mandatory climb or drop must use exactly one automatic vertically shuttling platform spanning the route-node height difference. Do not insert static stair steps or alternating shaft ledges for those edges.
* Reserve the moving platform's complete travel shaft in the cavern envelope and validate boarding at both endpoints.
* Recovery platforms remain exceptional safety aids rather than a second continuous floor beneath the route.
* Keep optional branches free to be slightly more demanding than the main route.
* Validate every mandatory transition independently after construction, including minimum visible horizontal gap, route-height deviation, moving-shaft count, and the absence of static vertical intermediates.

### Generation asset metadata

Automatic construction must not guess platform function only from filenames or image dimensions. Add a separate data-driven generation catalog, or equivalent normalized metadata, that assigns assets roles such as:

```text
routeFloor
landingPlatform
recoveryPlatform
bridge
wall
ceiling
doorSupport
decorationOnly
```

Metadata may also define weight, scale range, mirroring, rotation policy, collision expectations, and theme membership.

### Door-support constraint

Only a small subset of current platforms has enough visible Y-size for a door to look convincingly supported. The Endpoint Placer must therefore use a whitelist or `doorSupport` role rather than selecting an arbitrary platform.

Entrance and exit validation must confirm:

* The door stands on a collision-bearing support whose authored generation metadata permits doors.
* The support is visually thick/tall enough beneath the door.
* The chamber has sufficient horizontal floor, headroom, and camera space.
* Door animation and Ignatius spawn/exit positions do not intersect cave decoration or other entities.

If no valid door-support asset is available for a generated endpoint, generation must fail with a clear report or construct a known valid support assembly. It must not balance a large door on a wafer-thin ledge.

## Encounter Populator

Populate encounter regions using difficulty budgets and locomotion-aware rules rather than uniform random scattering.

The first implementation should:

* Give the entrance and exit short calm zones.
* Place ground enemies only on valid floors with clearance and useful patrol room.
* Build or refresh navigation data required by hunter enemies.
* Place ranged enemies where firing lanes are meaningful but not immediate spawn traps.
* Place flying enemies only where adequate airspace exists.
* Place Bombing Bats in authored groups of two or three.
* Read group range, placement class, difficulty cost, clearance, and other generation hints from enemy-generation metadata rather than hardcoding every enemy ID into the populator.
* Use a theme-configured enemy selection expression.

The enemy-selection field should support inclusive ranges and exclusions, for example:

```text
1-999
1,3,5-999
1-999,!2,!4
```

Only catalog enemies that actually exist are resolved. The panel should show the resolved enemy names and report invalid syntax visibly.

## Reward and Prop Populator

This stage becomes active only after Score and treasure chests exist.

It should:

* Prefer treasure chests on optional branches and at the ends of worthwhile detours.
* Place power-ups with context, such as before a larger encounter or demanding movement section.
* Avoid excessive pickup density and preserve readable spacing.
* Reserve endpoint areas from random rewards unless the theme requests them.
* Place beginning and end doors through the dedicated Endpoint Placer rather than as generic props.

Future Gold currency, shops, paid upgrades, and economy balancing are not implied by chest placement.

## Determinism and provenance

A user-visible seed must reproduce the same draft under the same generator version and settings. Split that seed into named deterministic streams so changing one population category does not redesign unrelated stages:

```text
route
cavern
traversal
endpoints
encounters
rewards
decoration
```

Store generator version, selected theme, seed, implementation IDs, effective settings, and attempt number in level metadata.

Every generated placement/entity should carry provenance such as generation run ID, stage, route node, and generator ID. The generated result itself remains fully baked into ordinary level records.

## Automatic Level Generator panel

Create a dedicated panel with a prominent **Generate Level** button.

Basic controls should include:

* Theme.
* Seed and randomize-seed action.
* Approximate level length.
* Verticality.
* Winding/backtracking.
* Branching.
* Difficulty.
* Safety/recovery generosity.
* Enemy density.
* Reward density.
* Allowed-enemy expression.

An expandable advanced area should expose the implementation dropdown for each generator stage and selected lower-level tuning values.

Essential editor safeguards:

* Generate the full draft as one undoable operation.
* Warn before replacing existing generated content.
* Preserve manually authored content unless the user explicitly requests a clean level.
* Mark generated content visibly and provide a route-overlay toggle.
* Clear generated content without deleting manual content.
* Later support stage-specific regeneration, locking generated objects, and converting generated objects to manual ownership.

## Validation

A generated level is successful only if validation passes. The initial report should check at least:

* Exactly one usable entrance and exit.
* Correct left-entry/right-exit orientation and safe calm zones.
* Valid visually substantial door supports.
* A traversable mandatory route independent of optional branches.
* Adequate landing width and headroom for every required transition.
* No required spawn or landing inside collision.
* Recovery platforms do not block the intended route.
* Enemies are not embedded in terrain and have locomotion-appropriate space.
* Ignatius does not begin under immediate unavoidable attack.
* Flying groups have sufficient airspace.
* Generated content and cave envelope remain within sensible world bounds.
* Later, water routes have valid entry and exit geometry and required boost sections have adequate fuel access.

Generation may retry using deterministic attempt-specific sub-seeds. The panel must report how many attempts were made and why failed attempts were rejected rather than silently changing the user's base seed.

## Automatic-generation implementation slices

### Generator 0: infrastructure and route preview

* Add theme JSON, generator registries, deterministic named random streams, and generation metadata.
* Add the dedicated panel, theme selector, seed controls, enemy-expression parser, and advanced generator dropdowns.
* Load Earth and Ice presets and verify atlas-whitelisted Ice colour mapping.
* Generate and display only the abstract route graph and route-direction overlay.
* Support one-operation undo and clear-generated behavior.

### Generator 1: playable empty cavern

* Build the overlapping-ellipse envelope.
* Build forgiving collision-bearing traversal geometry from the route graph.
* Add generation-role metadata for platform assets, especially `doorSupport`.
* Place safe entrance/exit chambers and doors on valid substantial supports.
* Derive bounds and cave-window data.
* Validate the mandatory route without enemies or rewards.

### Generator 2: encounters

* Add basic encounter budgeting and locomotion-aware placement.
* Add enemy generation metadata and bat groups of two or three.
* Generate or refresh required navigation information.
* Depend on the completed weak standard-rocket splash for clustered 1-HP bats.

### Generator 3: rewards and props

* Depend on the completed Score/treasure milestone.
* Place treasure on branches, contextual power-ups, and restrained props.
* Add location-triggered thoughts where explicitly enabled by settings or theme rules.

### Generator 4: richer world features and editing refinement

* Add optional water basins after water volumes are stable.
* Add boss-arena landmarks after boss support is stable.
* Add stage-specific regeneration, object locking/manualization, improved route diagnostics, and further theme tuning.
* Later consider moving platforms, signal mechanisms, required rocket puzzles, and reactive-world solutions.

## Content and platform sequence after generation

After the generator produces useful editable drafts, begin real level production and new enemy integration. Profile those representative dense levels in target browsers and Electron before committing to WebGL2. Add WebGL2 only if measurements identify Canvas presentation as the material bottleneck.

Keep the portable state, level schema, generation metadata, and deterministic validation engine-neutral so an eventual Unreal Engine 5 port remains possible. Electron remains a valid shipping route unless product requirements or measured platform needs justify the rewrite.


## Revision 225 roadmap definition

Revision 225 is a planning and build-label update only. It adds no gameplay or editor behavior. It records the ordered pre-generator milestones, separates Score from any future Gold economy, defines treasure-chest behavior, specifies the weak standard-rocket splash, and establishes the staged Automatic Level Generator architecture including theme presets, route/cavern/traversal/population stages, deterministic seed streams, validation, editor safeguards, and the explicit requirement that generated doors use visually substantial `doorSupport` platforms.


## Revision 226 Score and treasure implementation

Revision 226 completes Milestone A. Portable game state now owns a non-negative integer Score, ordinary death/respawn and level transitions preserve it, and snapshot serialization restores it. Browser presentation projects the current level number/title and Score on a line above the Health bar and consumes deterministic score events for a brief `+N` popup without feeding presentation state back into simulation.

Treasure chests are ordinary editor entities with authored `scoreValue`, `collectionDistance`, and loot-display duration. A chest begins visibly open with loot, proximity awards Score once, and the open-empty visual remains permanently. Chest collision is explicitly disabled. Level 1 is titled **The Introductory Cave of Training** and includes a 100-point test chest.

Milestone A is complete. The next planned implementation milestone is Milestone B: the weak one-damage secondary-enemy splash for standard rockets.


## Revision 227 treasure-chest presentation refinement

Revision 227 scales treasure chests to a compact 72 by 84 world-unit default intended to fit most plausible ledges. Revision 287 trims that further to 68 by 80 and lowers the visual by 4 pixels so all visible base corners sit on the brighter top surface of narrow ledges more convincingly. The open-with-loot and open-empty atlas frames use matched 193 by 239 cutouts so the state change does not jump. Uncollected chests begin in `openLoot`; collection changes them to `openEmpty`. The mismatched closed artwork is not part of the normal chest flow.


## Revision 228 editor snap and chest placement

Revision 228 changes the Level Editor's default Snap grid from 32 to 16 world units, including its fallback grid spacing. The level-1 demonstration chest moves to `(4768, 512)` on the same thick `exit_ground` platform as the exit door. Its compact footprint is fully supported by the visibly walkable top surface rather than balancing on the thinner lower ledge.


## Revision 229 prewarmed wrench effects and active-gamepad haptics

Revision 229 removes the first-shot wrench stutter by generating all five coloured projectile-glow surfaces during renderer startup, after the projectile texture is available but before the level begins. Loading progress explicitly reports each prepared wrench glow. The ordinary draw path still performs only cached `drawImage` composition.

Browser input now records which device most recently supplied meaningful gameplay input. A gamepad becomes active only after a mapped button or movement beyond its deadzone, remains eligible for a short three-second idle grace period, and loses ownership immediately when keyboard or pointer gameplay input takes over. Optional haptics are therefore presentation/browser-adapter feedback rather than portable simulation state. Player damage uses the strongest pulse; successful rocket launch, double-jump boost start, and sustained hover use progressively gentler pulses. Unsupported controllers or browsers remain silent without affecting gameplay.


## Revision 230 authored powered-rocket atlas loading

Revision 230 replaces startup-time wrench-glow baking with a supplemental wizard atlas declared by `ct_char_wizard_1.json`. Runtime character loading now accepts supplemental atlas manifests and merges their frames into the character project's atlas-frame map. The initial revision of `ct_atlas_wizard_2` stored the five coloured halos separately from the base projectile.

## Revision 231 precomposited powered rockets

Revision 231 rebakes `ct_atlas_wizard_2` so each wrench frame contains the projectile and coloured halo already composited. Powered rockets therefore use one sprite draw per projectile, followed only by the existing procedural flame and world-managed trail effects. The ordinary rocket continues to use `ct_atlas_wizard_1`.

## Revision 232 powered trail accents and generator readiness

Revision 232 carries each powered projectile's launch-time wrench colour into its persistent smoke-puff records. Presentation uses that colour only as a restrained inner smoke tint and on a minority of sparkle crumbs; ordinary rocket trails remain unchanged.

No additional standalone engine refactor is required before Automatic Level Generator 0. The generator foundation itself should introduce deterministic named random streams, theme presets, implementation registries, generation provenance, undo grouping, and route-preview validation. The one remaining small gameplay prerequisite from the pre-generator roadmap is the standard rocket's weak one-damage secondary-enemy splash. It may be completed immediately before Generator 0 or deferred until just before Generator 2, which is the first slice that depends on clustered bat encounters.

## Revision 233 standard-rocket secondary splash

Revision 233 completes the last small pre-generator gameplay prerequisite. Standard rockets now carry a one-damage enemy-only secondary splash with a radius of one wizard height, giving a diameter of roughly two wizard heights. The directly struck enemy is explicitly excluded from the splash and therefore still receives exactly the normal 30 direct damage rather than 31. The splash also occurs when a standard rocket impacts terrain or a reactive object, but it never damages reactive scenery itself.

Overdrive retains the standard splash because it modifies cadence and fuel cost without replacing the projectile profile. All wrench modes carry zero standard-splash damage and continue to use only their individually authored mechanics, including Bigbomb's separate full-damage area explosion. Generator 0 may now begin with no remaining pre-generator gameplay dependency.

## Revision 234 Automatic Level Generator 0 route foundation

Revision 234 completes the infrastructure-and-route-preview slice without pretending that an abstract graph is already a playable cavern. The Level Editor now has a dedicated Automatic Level Generator panel with theme, seed, length, shape, difficulty, safety, density, enemy-filter, and advanced implementation controls. Earth Cavern and Ice Cavern are versioned data presets. Ice colour treatment is allowlisted to environment atlases so doors, chests, mailboxes, and power-up artwork keep their authored colours.

`src/shared/level-generator-data.js` owns portable normalization, named deterministic random streams, implementation registries, enemy range/exclusion parsing, candidate construction, route validation, quality scoring, provenance, and generated-state normalization. A seed produces several deterministic candidates; invalid candidates are rejected and the strongest remaining route is selected. Every accepted graph has one identifiable mandatory route from a left-side start to a rightmost exit. Optional branches must merge back, route edges must not cross, node spacing is bounded, and diagnostics record the selected attempt and quality.

Generation is editor-safe. The generated graph and its provenance live under `level.generation`; generated records carry run ownership; one generation run is captured as one guarded undo/redo operation; and Clear generated removes only records owned by the active generation run. Manually authored placements, entities, collision, cave data, and other level content are preserved. The route overlay distinguishes mandatory and optional edges, shows direction, labels nodes, and can fit the camera to the graph.

The full regression suite passes. A stress matrix exercised 12,000 combinations across both themes, all four length presets, extreme verticality/winding/branching values, and many seeds with no validation failures. Representative route plots were also inspected visually for coherent progression, legible branches, merges, and bounded backtracking. This milestone is intentionally not called playable: it creates no cave envelope, collision, traversal platforms, doors, enemies, or rewards.

Revision 234 established the deterministic route foundation. Revisions 235 through 237 progressively materialize traversal, encounters, and purposeful rewarded detours without changing the route graph into a second runtime physics format.

## Revision 235 Automatic Level Generator 1 playable empty cavern

Revision 235 turns the selected route into an editable, collision-bearing empty cavern without introducing a second runtime geometry system. The shared generator builds a connected overlapping chamber/corridor envelope and converts it into ordinary cave-window data. It places ordinary atlas assets for the mandatory traversal, derives world bounds and reset height, and places entrance and exit doors on wide validated supports inside calm endpoint chambers.

Traversal planning now uses a versioned platform-generation catalog. The catalog declares generation roles, scale limits, door suitability, surface offsets, mirroring, and authored walkable-edge insets. Required jump distances are measured from those real collision-bearing edges rather than image-frame rectangles. Mandatory supports must expose generous landing width. Gaps, rises, and drops stay inside conservative limits, and recovery ledges are allowed only when they do not block the intended route.

Generator 1 deliberately materializes only the guaranteed mandatory spine. Optional graph branches remain visible deterministic reservations in provenance and the editor overlay. Later reward and encounter stages can turn selected reservations into purposeful detours. This avoids filling an empty cavern with parallel solid platforms that behave as accidental ceilings or interfere with the main route before branches have gameplay value.

The complete route and geometry are candidate-selected together. For one seed, the generator evaluates several deterministic alternatives, rejects candidates with invalid transitions, buried landings, unsupported endpoints, cave escapes, or ownership conflicts, and retains the strongest valid cavern. Regeneration remains one guarded reversible editor operation and replaces only generator-owned placements, entities, cave data, world data, and theme treatment.

Quality verification covered more than schema validation. An 800-case matrix spanned both themes, all four lengths, extreme shape settings, and multiple seeds without a failed accepted cavern. A headless pilot using the real atlas collision completed 867 mandatory transitions across 24 representative levels; 190 transitions used Ignatius's second-jump rocket kick. Representative Earth and Ice drafts were rendered with their actual platform sprites and inspected for cave containment, endpoint support, readable progression, and branch-reservation separation. A separate persistent-state pilot then traversed all eight rendered levels from entrance to exit without resetting between jumps, covering both themes and all four length presets.

Revision 235 intentionally left optional route reservations unmaterialized so a later stage could pair physical branch geometry with a meaningful destination rather than producing purposeless collision shelves.

## Revision 236 Automatic Level Generator 2 encounters

Revision 236 populates generated caverns with deterministic, difficulty-budgeted encounters while preserving the accepted route and geometry streams. A versioned enemy-generation catalog records placement class, group size, cost, weight, progression range, walkable-width requirement, edge clearance, protected landing approach, headroom, patrol room, group spacing, flying height, and navigation needs for each currently supported enemy.

Entrance and exit calm zones are derived from both theme tuning and the largest selected enemy awareness radius plus a safety buffer. Ground enemies are accepted only on substantial mandatory supports with real authored walkable collision room, protected incoming landing space, suitable headroom, and room for their behavior. Fireball and Musket Goblin hunters remain ordinary runtime entities; applying a generated population refreshes the existing baked hunter navigation graphs rather than creating generator-specific navigation.

Bombing Bats are generated only in groups of two or three. Their horizontal spacing keeps hitboxes separate while leaving the standard rocket's weak secondary splash useful against clustered one-hit-point companions. Density, difficulty, safety, route length, allowed-enemy filtering, and per-enemy costs shape the encounter budget. A zero-density setting remains truly empty.

Encounter records carry generator ownership and stage provenance. Generation undo, redo, clear, and replacement also restore any navigation graphs replaced by the population stage. Diagnostics report budget, spend, encounters, enemies, bat groups, hunters, calm distance, and non-fatal placement warnings.

Quality verification included an 800-case matrix across both themes, extreme settings, all length families, and multiple seeds, with no accepted-draft validation failure. A real-atlas runtime hydration check confirmed generated collision, baked navigation support for all tested hunters, and safe endpoint behavior. In four representative populated caverns, Ignatius remained stationary at the entrance for 360 fixed simulation steps without an enemy alert or player damage. Eight rendered Earth and Ice drafts across Compact through Grand were visually inspected for calm-zone separation, pacing, support use, bat grouping, and endpoint safety.

Revision 236 deliberately leaves optional reservations untouched. Revision 237 completes their reward-purpose coupling without changing encounter placement or endpoint ownership.

## Revision 237 Automatic Level Generator 3 rewards and props

Revision 237 materializes only optional branches selected by the independent rewards random stream. Traversal remains responsible for geometry, so changing chest values or pickup weights cannot perturb route, cavern, or encounter random streams. High reward-density candidates prefer drafts that realize eligible detours instead of choosing a marginally prettier branchless cavern.

A selected branch becomes a lower returnable detour. The main route reserves a collision-open shaft through a catalogued `shaftBridge` assembly, two alternating narrow footholds descend through the opening, and broad lower supports form a reward alcove. The branch's abstract merge edge remains preview-only because a solid upper merge platform would behave as a low ceiling. Every materialized detour has bidirectional transition records, an explicit shaft record, and exactly one positive-Score treasure chest at the authored optional-reward destination.

`assets/level-generator-rewards.json` records stable generation metadata for treasure, contextual power-ups, utility pickups, and optional narrative triggers. Contextual rewards are restrained, progression-aware, kept away from endpoint calm zones, and checked against generated enemies. Power-up types avoid repeats until the available pool has been used, after which longer routes may repeat types to meet their route-scaled density target. Entrance and exit doors remain Endpoint Placer-owned. Location thoughts are disabled by default and require explicit theme or Level Editor opt-in; when enabled, at most one invisible one-shot trigger may be placed on a quiet suitable support.

Validation now covers the complete route, cavern, traversal, endpoints, encounters, and rewards. It rejects missing or narrow branch shafts, footholds without standing and turning room, undersized lower landings, invalid return transitions, inaccessible rewards, missing branch treasure, endpoint crowding, reward-enemy overlap, and narrative additions that were not requested. The editor overlay draws actual materialized detours separately from unmaterialized reservations and preview-only merge hints.

Quality verification included an 800-case matrix across both themes, all four lengths, extreme branching and reward densities, and multiple seeds. It produced 963 materialized detours with zero accepted-draft validation failures; every reward-rich cavern with an eligible reservation produced at least one real detour, and the lowest accepted quality score was 93.5. Eight representative Earth and Ice drafts were rendered and visually inspected. Real-atlas collision testing covered 11 materialized detours: all 11 entry drops reached a valid foothold, and a 110-direction transition sweep always landed on usable geometry, including intentional safe step-skips and main-spine returns.

The next milestone is **Automatic Level Generator 4: richer world features and editing refinement**. It should add only features whose underlying runtime contracts are already stable, beginning with stage-specific regeneration, generated-object locking or manualization, stronger validation visualization, and theme tuning before optional water or boss landmarks.



## Revision 238 Automatic Level Generator 4 editor refinement

Revision 238 completes the editor-refinement portion of Generator 4 without prematurely generating water or boss content. Generation metadata now carries normalized revision counters for every named stage. A stage reroll derives a new deterministic stream name from the unchanged base seed and only the selected stage revision. The accepted route attempt is pinned, so rerolling population or rewards cannot quietly select a different cave. Identical deterministic candidates are skipped; success means the selected stage actually changed, while a fully constrained stage reports that no alternative exists.

Encounter regeneration replaces only encounter records. It proves that placements, cave envelope, world bounds, endpoints, rewards, and all non-encounter entities still match the deterministic source before applying a changed population. Reward regeneration may rebuild only its dependent traversal detours and reward records. Existing encounters are translated from each old support to the same support ID in the new traversal, then the complete route, cavern, endpoints, encounters, and rewards are validated together before acceptance. Generated hunters continue to use the ordinary navigation-graph rebuild.

Generated objects now have an editor safety catch. Locking a generated record prevents direct drag, delete, copy, and inspector mutation without changing runtime data. Converting a record to manual ownership removes active generator ownership but retains a compact provenance receipt. Validation can therefore distinguish an intentional manual replacement from missing generated content. Stage regeneration refuses to overwrite manualized records on which that stage depends; full generation still preserves them as ordinary manual content.

The validation-only stage reconstructs a complete draft from the level's current placements and entities rather than trusting stale generation metadata. It detects support position, size, asset, or atlas drift and reports an explicit mismatch count. The Level Editor can project authoritative walkable spans, transitions, branch shafts, endpoint calm zones, encounter anchors, reward anchors, and invalid geometry directly over the edited level.

Quality verification used 200 complete Earth and Ice caverns spanning Compact through Grand and varied shape, density, difficulty, and safety settings. All unrelated stage fingerprints remained stable. The sweep found 199 changed encounter alternatives with one genuinely constrained population, 110 changed reward alternatives, completed 310 combined snapshot validations and 40 deliberate support-drift detections, and produced zero failures. Paired before/after rerolls and clean/invalid overlays were rendered and visually inspected.

Optional water basins and boss-arena landmarks remain deferred because their runtime and validation contracts are not yet stable enough for procedural ownership. The next practical milestone is to use generated drafts for real level production and manual refinement, gathering theme and pacing feedback before adding richer world features.

## Revision 239 automatic perimeter readability and large-level performance

Revision 239 connects the Automatic Level Generator to the existing Populate perimeter system. Earth Cavern and Ice Cavern generate deterministic foreground decoration by default, while the theme contract can explicitly suppress the stage. The result remains ordinary non-colliding cave-foreground placements with full generator ownership, so regeneration, clear, undo, redo, locking, and manualization continue to operate through existing records rather than a runtime-only decoration layer.

Generated foreground now protects gameplay rather than treating every perimeter slot equally. The complete radial stack must avoid padded entrance, exit, and reward regions. Ordinary stacks also avoid padded traversal supports completely. Rare accent stacks may intrude slightly, capped at eight percent of the protected support area, to preserve the occasional stalactite or stalagmite that briefly crowds Ignatius without turning the cavern into visual camouflage. A stack that cannot be shifted outward safely is omitted.

The large-level slowdown was traced primarily to global scans, not to an unusually large number of objects simultaneously visible. Static world visuals are now sorted and bucketed once, then queried locally by camera X range before the existing exact viewport test and draw work. Cave-foreground queries include parallax. The simulation uses a parallel local broadphase for static solids, collision segments, and polygons, while all moving or reactive records remain live. The debug panel reports spatial visual rejection separately.

A 160-cavern stress matrix across both themes and all four lengths completed with no generation or validation failure, no doorway overlap, and no support above ten-percent foreground coverage. Only 74 of 7,393 supports were touched at all. A generated Grand sample contained 581 visuals, including 502 foreground placements; local camera queries rejected an average 93.7 percent of foreground and 92.1 percent of other static visuals before exact culling. Its 851 collision segments and 72 polygons were reduced to camera-local averages of 71.1 segments and 6.7 polygons. These measurements support retaining Canvas 2D for now. WebGL2 remains a later option if measured local drawing or composition, rather than global scanning, becomes the bottleneck.

## Revision 240 macro room-and-tunnel cavern correction

Revision 240 replaces the shallow small-random-walk route contract with deterministic macro planning. Current Earth and Ice themes choose among descending or ascending Z plans, descending or ascending L plans, valleys, stepped terraces, and rolling routes. The chosen pattern is recorded in provenance. Vertical span now scales with requested verticality and level length, while the traversal stage still expands the plan into conservative collision-aware jumps. Compact through Grand caverns reserve one through four macro rooms. Ordinary rooms are commonly larger than one screen; Grand generation may reserve a rare room up to, but never beyond, four screens wide by three screens high.

The cavern envelope is now derived from room, tunnel, and endpoint-chamber stamps around validated traversal supports. Platform wall, ceiling, and floor clearance are first-class theme values and are measured across the authored walkable support rather than only at its centre. Entrance and exit doors use inward-facing positions on wide door supports, exact authored floor anchoring, and large side clearance from the dark cave boundary. The result is a grounded doorway inside a lit chamber rather than a portal balanced at the edge of the mask.

Final Level Editor generation explicitly requires the perimeter-decoration catalog whenever the theme requests populated walls. It may no longer report a successful current-theme cavern with an empty foreground perimeter. Presentation validation measures decoration count, strict endpoint/reward overlap, support coverage, platform-to-wall clearances, door floor error, endpoint boundary clearance, room count, and largest room dimensions. Snapshot validation also rechecks those rules after editing. Manual Populate perimeter uses the same stronger endpoint, reward, and platform protection padding.

A 320-cavern stress matrix covered both themes, every length, extreme route and population settings, and all seven macro patterns without a failed accepted draft. Every cavern generated 181 to 512 foreground wall pieces. Door floor error stayed below 0.001 world unit; minimum endpoint-to-dark-boundary clearance was 952.595 units; maximum platform foreground coverage was 5.02 percent; and minimum wall, ceiling, and floor clearances remained above their configured acceptance floors. The sweep created 800 macro rooms, including 31 near-large-room cases and exact upper bounds of four by three screens. High-verticality Grand routes averaged 1,863 world units of vertical span and reached 2,489. Authentic atlas overviews and endpoint camera crops were inspected for Z, L, valley, and terrace examples.

Revision 239's static visual and collision broadphases remain the performance foundation. Revision 240 also reduces cave-profile sampling from a dense per-stamp triplet to support centres, room/endpoint shoulders, and a bounded global grid, keeping the richer envelopes near a 215-point average and 302-point maximum in the stress sweep rather than allowing room generation to restore a global geometry cost.


## Revision 241 correction: grounded portals and stronger traversal rhythm

- Treat generated portal coordinates as floor anchors and align them to the actual authored walkable support surface.
- Replace shallow macro modulation with deliberate climbs, descents, terraces, valleys, and strong Z/L vertical phases.
- Generate a small deterministic moving-platform rhythm in Standard and larger levels without making the initial mandatory route unavailable.
- Keep true multi-lane mandatory backtracking conservative until the collision planner has a dedicated lane-separation contract; optional detours still provide local reverse travel.

## Revision 242 folded spatial layout and arbitrary cavern contours

Revision 242 corrects the generator at the two stages that caused ribbon-shaped levels.

The Route stage now performs a genuine two-dimensional spatial-layout pass. Z, L, valley, terrace, and rolling families contain mandatory leftward phases, horizontal reversals, separated vertical lanes, and both climbing and descending phases where appropriate. Compact levels with deliberately minimal winding may use a monotonic arc, but Standard through Grand folded candidates are rejected when they contain no backtracking, occupy too few lanes, or exceed the configured wide-and-shallow aspect-ratio ceiling. Macro plans are generated independently for each deterministic candidate attempt, allowing ranking to compare different route families rather than forty jittered copies of one plan. Route quality now measures horizontal and vertical direction changes, backtrack count, longest eastward run, route aspect ratio, lane count, and travel expansion without saturating every candidate at 100.

Macro room-to-room movement is no longer clamped to one platform rise or drop. `forgiving-traversal-v1` realizes steep edges as conservative staircases or shaft zigzags, uses shallower landing assets around major vertical connections, keeps a calm horizontal exit approach, and validates local transitions independently. Encounter placement now accepts safe mandatory node landings as well as broad route-floor supports so spatially vertical levels do not accidentally erase encounter capacity.

`contour-cavern-v3` replaces the X-monotone top/bottom cave profile as the authoritative envelope. It rasterizes expanded room and corridor stamps, traces the connected occupancy boundary, simplifies it, and emits editable corner points. Vertical cave queries now return the interval containing the relevant support or entity, so stacked passages at the same X retain solid rock between them. Presentation and traversal validation use the arbitrary polygon rather than assuming one opening per X.

The generator's documented dependency order is now Route topology and spatial layout, Traversal, Endpoints, Cavern contour, Encounters, Rewards, Decoration, and Validation. The Route implementation keeps topology and spatial embedding as internal subpasses for now, avoiding a registry split with no independent reroll use case.

## Revision 243 ThePath74 cavern-shape integration

Revision 243 replaces the revision-242 route families as the default generator path with the experimentally selected ThePath74 contract. The route now grows on an unbounded integer grid from a right-facing start, uses horizontal legs of 1–7 cells and vertical legs of 1–4 cells, checks both the candidate and one-cell look-ahead, and preserves an eight-neighbour one-cell margin from older non-local route sections. It stores the complete numbered cell path and leg provenance, creates world-space route nodes only at turns, endpoints, and room anchors, and leaves local platform count to `spaced-platform-traversal-v2`.

After route acceptance, the generator selects two to four well-separated numbered positions. Each room centre is placed either on the selected path cell or on a nearest-labelled boundary cell. Horizontal and vertical room semi-axes are independently sampled from 2–4 cells. These room stamps are merged with traversal, support-clearance, and endpoint stamps before `the-path74-contour-cavern-v4` traces the ordinary editable cave window.

The current Earth and Ice themes use `the-path74-route-v4`, `the-path74-contour-cavern-v4`, and `the-path74-cavern-validation-v4`. The revision-242 spatial-lane route and contour implementations remain registered for old generation records and future comparison. Vertical shaft realization uses a wider alternating landing offset so pure vertical ThePath74 legs retain enough exposed landing width for conservative validation.

## Revision 244 spaced platforms and moving vertical shafts

Revision 244 replaces `forgiving-traversal-v1` as the default traversal implementation with `spaced-platform-traversal-v2`. ThePath74 remains the macroscopic guide, not a floor trace. Horizontal route edges are divided into separated authored platforms with explicit jump gaps. Intermediate platforms receive bounded vertical offsets around the abstract route line, so the player is expected to jump both up and down while generally following the planned direction. Endpoint and chamber landings remain broad enough for doors, recovery, and encounter placement, but ordinary route supports no longer form an almost continuous walkway.

Every mandatory route edge classified as a climb or descent is realized by exactly one automatic shuttle platform moving only on the vertical axis. The platform spans the full difference between the two route-node support surfaces, exposes a safe boarding transition at each endpoint, and owns a reserved shaft stamp in the cavern contour. The current implementation does not create static staircase, ladder, or zigzag intermediate supports on mandatory vertical edges. `forgiving-traversal-v1` remains registered only as a legacy implementation for old records and comparison.

Validation records the number of mandatory vertical moving platforms, any forbidden static vertical intermediates, horizontal jump-gap count and minimum gap, and maximum vertical deviation from the abstract horizontal route. A current draft is invalid when a mandatory vertical edge lacks its single shuttle, gains static intermediate supports, cannot be boarded at both ends, or when an ordinary horizontal edge collapses into a continuous floor.


## Revision 245 layered upper traversal, staggered recovery floors, and formation-only perimeter

Revision 245 uses the manually authored `assets/level_001.json` as the traversal-shape reference without replacing its authored placements. The important lesson is that the main route is a sequence of distinct jump targets, not a collision line drawn over the macro route. Horizontal traversal therefore permits substantially larger deterministic vertical departures from ThePath74 while preserving conservative local rise, drop, and collision-edge gap limits.

The new default Traversal implementation is `layered-recovery-traversal-v3`. Its upper route uses separated static landing assets with deliberately varied elevations. Beneath suitable horizontal sequences it builds a broad, level recovery lane from multiple recovery supports. Each upper jump gap has solid recovery geometry below it, while the recovery lane's own gaps are placed between those landing zones so upper and lower gaps never overlap. The lower path is therefore forgiving without becoming an effortless uninterrupted floor.

Mandatory vertical climbs and drops still use exactly one automatic vertical shuttle and no static staircase. The thin `rubble_long` family is now reserved exclusively for generated moving platforms through the `movingPlatform` catalog role. Static route, recovery, branch, and shaft-bridge roles use other authored platform families.

Cave foreground population is also narrowed. Automatic perimeter catalogs now admit only assets tagged `stalactite` or `stalagmite`. Ceiling directions use stalactites, floor directions use stalagmites, and vertical wall directions rotate either formation family. Generic wall, ceiling, floor, pillar, alcove, rock, and rubble assets are excluded from perimeter population. The authored perimeter in `level_001` is regenerated under the same rule.

Validation records recovery-lane count, lower-lane gap count, upper-gap coverage, upper/lower gap overlap violations, and moving-platform style violations in addition to the revision-244 metrics. Current themes are invalid when a recovery gap lies under an upper gap, an upper jump gap lacks a landing below it, or a mandatory lift uses an ordinary static-platform visual family.

## Revision 246 Atlas 004 long-platform integration

Revision 246 adds `at_atlas_004` as the dedicated long earth-platform atlas. Its sixteen visual islands are individually framed and carry closed blockable collision polygons. The upper blockable segment is deliberately placed through the middle of the rendered walkway, following the collision convention of `at_atlas_001` rather than tracing loose alpha pixels along the top fringe.

All sixteen platforms are registered in `assets/level-generator-platforms.json`. Their authored widths range from compact long ledges to very broad recovery-floor spans. Layered horizontal traversal may request a longer landing asset on sufficiently broad route edges while preserving the existing collision-edge jump-gap, vertical-variation, recovery-lane, and thin-moving-platform contracts. The selection remains conservative so large art does not collapse a jump sequence into touching platforms.

Earth and Ice colour-map atlas allowlists include `at_atlas_004`. Generated levels add the atlas reference through their ordinary placement-derived atlas list; manually authored levels remain unchanged until one of the new assets is placed.

The PNG remains a separately supplied project asset so revision ZIP downloads can continue excluding PNG files.


## Revision 247 organic upper-route platform realization

Revision 247 replaces the current default Traversal implementation with `organic-layered-traversal-v4`. ThePath74 remains a loose macroscopic guide, not a platform centreline. Horizontal legs are now realized as irregular authored landing sequences whose heights deliberately wander above and below the guide while every local gap, rise, drop, and exposed landing remains inside the conservative movement envelope.

A horizontal sequence containing three or more supports may not place any consecutive pair at effectively the same surface height. The generator searches for a profile with a visible height change between every neighbouring landing and rejects profiles that do not create a useful total vertical range. Non-endpoint route anchors receive only small height offsets, while intermediate landings may depart substantially farther from the guide. This prevents long red-line rows without turning the route into an unreadable sawtooth.

Atlas 004 is used more aggressively when a broad authored landing is preferable to several short adjacent platforms. Long static platforms remain ordinary jump targets and recovery-floor pieces; the thin `rubble_long` family remains exclusive to vertical lifts. Recovery lanes retain their staggered-gap contract, and every mandatory climb or descent still uses one automatic vertical shuttle with no static staircase.

Validation now records the minimum adjacent organic height change, same-height adjacency violations, vertical direction changes, long static Atlas 004 usage, and maximum departure from the abstract route. A current-theme draft is invalid when a multi-platform horizontal chain forms a level row or lacks meaningful vertical variation.

## Revision 248 aggregate test-runner investigation

Revision 248 investigates the previously reported aggregate headless-test "stall". The Node process was not deadlocked and did not retain a timer, worker, or other event-loop handle. A detached run of the unchanged revision-247 suite completed normally with exit code 0 in 75.96 seconds. Profiling showed that six generator-heavy regressions consumed almost the entire runtime: route foundation, playable empty cavern, encounters, rewards, macro-room/perimeter validation, and perimeter spatial culling. The remaining non-generator tests completed in under two seconds. The apparent stall was the foreground command runner reaching its own wait limit while the CPU-bound generator tests continued normally in the child process.

The aggregate runner now prints `RUN` before starting each test and reports total test count and elapsed suite time at completion, so a long generator case no longer looks silent. `npm run test:profile` adds per-test elapsed time, resident-memory readings, a configurable slow-test summary, and peak RSS. `npm run test:generator` and `npm run test:fast` run the heavy generator group and the remaining tests in separate fresh Node processes when a shorter diagnostic cycle is useful. `npm test` remains the authoritative aggregate run.

The revised aggregate suite completed 141 tests in 76.33 seconds with exit code 0. The isolated generator group completed eight tests in 74.44 seconds with a 282.3 MiB peak RSS, while the 133-test fast group completed in 1.94 seconds. No gameplay or generator behavior changed in this revision.

## Revision 249 longform platforms, secondary perches, and guaranteed gap recovery

Revision 249 replaces the default upper-route realization with `longform-organic-traversal-v5`. ThePath74 remains the cavern's macroscopic guide, but it no longer dictates a dense chain of short collision surfaces. Horizontal spans are packed from the lowest practical platform count upward, using the Atlas 004 long-platform family whenever the available distance can support one broad authored landing. Short turn anchors and endpoint supports remain valid where the route geometry genuinely cannot fit a long platform.

Every neighbouring upper landing must change height by a clearly visible amount. The traversal search rejects same-level pairs, near-level pairs, gaps wider than the conservative movement envelope, and profiles that cling too closely to the abstract route. The resulting main route is a loose sequence of long, irregular ledges rather than a yellow line translated directly into collision.

Every horizontal jump gap now owns recovery geometry below it. The recovery platform covers the fall line, overlaps the lower adjacent main platform enough to permit deliberate backtracking, and carries an explicit validated return transition. Reward-branch entry footholds may fulfil this recovery role when they occupy the reserved shaft under the gap. Lower recovery geometry may still contain gaps, but those gaps must not overlap the upper fall lines.

Long main platforms may reserve smaller secondary platforms above them. These optional perches are marked as reward-capable supports and enter the normal contextual reward candidate pool, making them suitable for treasure, pickups, or later encounter landmarks without placing them on the mandatory route. Mandatory climbs and drops continue to use one thin `rubble_long` automatic lift and no static staircase.

Generator provenance advances to Automatic Level Generator 9. Validation records average main-platform width, the share of long route-span platforms, secondary reward-perch count, required recovery-gap count, recovery coverage, backtracking reachability, and any unprotected gap or same-height violation.

## Revision 250 layered safety-network traversal

Revision 250 replaces the default `longform-organic-traversal-v5` realization with `layered-safety-network-traversal-v6`. ThePath74 remains only the macroscopic guide. The visible traversal is now planned as a hierarchy of playable routes that uses the full cavern volume rather than a single chain suspended through empty space.

The upper route remains the preferred progression route. It uses long Atlas 004 platforms wherever the cavern permits, changes height at every ordinary jump gap, and retains the organic vertical displacement introduced in revisions 247–249. Static overlapping platforms must leave at least 112 world units of clear body space so Ignatius cannot be trapped in a visually plausible but physically unusable sandwich.

Every horizontal upper-route gap now belongs to a broader lower recovery route. The lower route slopes through the cavern in progression order, catches failed jumps, and connects its local supports with ordinary traversable gaps rather than isolated catch platforms. Each lower route owns a thin automatic return lift that lets the player backtrack to the upper route. Lower-route gaps are staggered away from upper-route gaps. Every lower-route gap has a wider tertiary recovery platform below it plus a thin return lift, so one failed jump never sends Ignatius directly into the lethal black boundary.

Broad upper-route platforms may receive detached secondary reward perches. Current v6 treasure placement prefers those perches instead of materializing the older collision-heavy optional branch shafts. The branch system remains available to the legacy v5 implementation. The entry door is placed at the far-left usable edge of the starting platform, matching the authored composition of `level_001`.

Validation now counts complete layered lanes, lower-route supports, return lifts, protected lower gaps, tertiary recovery platforms, and minimum static headroom. A v6 cavern is invalid when an upper gap lacks lower coverage, a lower gap lacks tertiary coverage, a lower route has no return lift, or overlapping static platforms leave insufficient room for Ignatius.


## Revision 251 equal-sized minimap, perimeter tip orientation, and seamless overlap composites

Revision 251 completes three presentation and editor refinements:

1. Replace the upper-right FULLSCREEN and MENU controls with a clickable level minimap. Keep it exactly the same rendered width and height as the top-left meter panel, draw the cave, supports, camera, player, and exit, and open the existing pause menu when clicked. Preserve automatic fullscreen and Escape-menu behavior without a permanent fullscreen HUD button.
2. Correct automatic perimeter population so every stalactite or stalagmite points its tip inward. Start from the inward perpendicular to the sampled perimeter. Snap to straight down when that angle lies within 45 degrees of down, snap to straight up when it lies within 45 degrees of up, and otherwise keep the perpendicular angle. Account for the authored base direction of stalactite versus stalagmite source frames.
3. Add cached overlap blending for static atlas visuals. Detect consecutive same-layer overlap groups, bake them into off-screen bitmaps, and crossfade each incoming member over the central 50 percent of the overlap around its midpoint. Runtime and Level Editor reuse the cached composite while preserving the original placement, collision, ordering, and editing records. Exclude moving, entity-bound, actor-front, and cave-foreground visuals.

The next platform-generation pass may deliberately overlap compatible platform assets to author widths between the available Atlas 004 frames, relying on the cached composite for the visible seam while collision remains ordinary authored blockable geometry.

## Revision 252 narrow cardinal snapping, fitted minimap, mirrored exit platform, and one-way thin platforms

Revision 252 refines the perimeter orientation rule introduced in revision 251. A stalactite or stalagmite first points inward perpendicular to the sampled cave perimeter. It snaps only when that preliminary tip angle is within 20 degrees of the nearest cardinal direction, including left and right as well as up and down. Angles outside those narrow cones remain perpendicular to the actual curve.

The minimap now shares only the top-left meter panel's height. Its width is calculated from the padded level bounds so the full level fits without surplus horizontal panel space. The size is recomputed when the meter panel changes and when a newly loaded level changes the minimap aspect ratio.

Automatic endpoint generation now treats the two large mossy door platforms as a mirrored composition. The exit support reuses the entrance support asset and scale, mirrors it horizontally, and places the exit door at the corresponding far-right usable location. The entrance remains at the far-left usable location.

`assets/at_atlas_004.json` advances to manifest version 5. The thick top-row platform retains its closed yellow blockable silhouette. Every thinner platform now has only one green walkable line across its inset standing surface, allowing Ignatius to jump upward through it from below.

## Revision 253 smoothed contour perimeter and denser cave-wall coverage

Revision 253 addresses the remaining automatic cave-wall presentation problems visible after revision 252. The traced occupancy contour is still the authoritative shape source for ThePath74 caverns, but the exposed `level.caveWindow.points` are no longer the raw orthogonal cell loop. The contour is simplified more aggressively and then emitted as smooth points so the perimeter itself stays curved instead of reading as a staircase of 90-degree turns. This keeps the arbitrary folded upper/lower tunnel silhouette while making automatic perimeter decoration sample a genuinely smooth inward normal.

Perimeter population also becomes denser along the tangent direction. Automatic stalactite and stalagmite stacks now overlap more generously so the full-black guide is covered even across broad curved ceiling arcs where tapered formations previously left narrow visible slivers between neighbours. Protection around doors, rewards, and traversal platforms remains unchanged.

## Revision 254 much smoother contour perimeters and cleaner minimap

Revision 254 pushes the automatic contour perimeter farther away from the traced occupancy grid. The raw traced cell loop remains the generator's diagnostic source, but the exposed `caveWindow.points` are now simplified much more aggressively before being emitted as smooth spline controls. In addition, the spline-handle calculation now tightens itself automatically around sharp turns so the visible perimeter and derived full-black outset are less likely to curl back on themselves in narrow folded areas.

The minimap is also simplified visually. It still keeps the same aspect-fitted panel sizing and remains clickable for the menu, but it no longer renders the "Click for menu" caption and no longer draws the internal yellow world-geometry guides. The minimap now focuses on the cave silhouette, camera, player, and exit marker only.

## Revision 255 compatible generator variants and run-and-gun traversal

Revision 255 removes the experimental compatibility maze from the Level Editor. The public implementation registry now contains two route choices and two cavern choices. Route is either **Standard** (`the-path74-route-v4`) or **Mostly horizontal** (`mostly-horizontal-route-v1`). Cavern is either **Standard** (`the-path74-contour-cavern-v4`) or **Wide, upward-expanding** (`wide-upper-contour-cavern-v1`). Traversal, endpoints, encounters, rewards, decoration, and validation each expose one **Standard** implementation. Older IDs remain only as normalization aliases so existing generated-level metadata can load into a current compatible pipeline; they are no longer selectable or dispatched as independent algorithms.

The Mostly-horizontal planner is a new planner rather than the retired progression implementation. It advances monotonically to the right through long three-to-seven-cell runs, inserts only a small number of vertical interruptions, and limits those interruptions to one or two cells. Traversal realizes every horizontal leg as a continuous run-and-gun floor made from the thick blockable Atlas 004 platform. Neighbouring solid pieces may overlap safely, so the main route has no ordinary horizontal jump gaps. The fifteen thin green one-way platforms remain available for raised combat and reward positions but are forbidden from overlapping other generated platform bodies. Occasional vertical changes continue to use the validated thin moving-platform mechanism. Detached upper perches remain optional spaces for enemies, fighting, and treasure rather than a mandatory second route.

The Standard folded route keeps its upper traversal, but its lowest recovery path is now treated as the dependable ground route. Wide gaps between lower recovery supports are filled with overlapping bridge platforms, producing few or no lower-route gaps and preventing the recovery system itself from becoming another jumping puzzle.

The Wide, upward-expanding cavern reuses the current occupancy-contour architecture with different geometry parameters. Its ellipse stamps are wider and shallower, their lower extent stays close to the traversal floor, and most additional room volume is placed above the route. This produces broad combat halls without dragging the cavern floor far below the playable ground. Both route variants combine with both cavern variants and the same Standard downstream stages. A deterministic 96-draft matrix covers Earth and Ice themes, all four length presets, all four route/cavern pairings, and three seeds per pairing.

## Revision 256 collision-aware platform composition and larger upward rooms

Revision 256 makes platform overlap depend on collision semantics. `assets/level-generator-platforms.json` now marks generated platform families as `blockable` or `oneWay`. The mostly-horizontal ground role belongs only to the thick Atlas 004 platform with its closed yellow blockable area, so overlapping pieces form a genuinely continuous floor. The fifteen thin green-line Atlas 004 platforms remain one-way assets and are excluded from the overlapping ground family. Traversal validation rejects any generated pair where a one-way platform visually overlaps another platform in both axes. The same rule protects Standard lower recovery paths: their intentionally overlapping bridge pieces are selected from blockable assets only.

The Wide, upward-expanding cavern now adds two to four auxiliary room ellipses distributed along the main ground route. These rooms are substantially wider while remaining shallow, keep their bottom close to the floor, and place most of their volume above the route. This produces more reliable space for existing raised combat and reward perches without turning the lower route into a deep pit.

## Revision 257 automatic-generator housekeeping

Revision 257 turns the revision-255 registry cleanup into a source cleanup. `src/shared/level-generator-data.js` no longer contains the retired progression, macro-room, spatial-lane, ellipse-cavern, optional-branch, or legacy traversal implementations behind unreachable conditions. The surviving traversal implementation is now named `buildStandardTraversal`, and its route-specific behavior is limited to the supported Standard and Mostly-horizontal planners. Old implementation IDs remain only in a compact load-time alias table so existing saved generation metadata can normalize safely.

The former optional-branch subsystem is removed end to end. Generator settings no longer contain branching, themes no longer author it, platform and reward catalogs no longer carry branch-only roles or contexts, and the editor no longer shows branch legends or diagnostics. Treasure uses detached upper reward perches. The old `branchChestScore` input is accepted only as a normalization alias for the current `treasureChestScore` field.

Reward-stage regeneration is now genuinely stage-local. It replaces only generated reward entities and reward metadata, while route, traversal placements, cavern, endpoints, and encounter records remain unchanged. Because traversal no longer changes during a reward reroll, the encounter re-anchoring helper and its dedicated tests are deleted. Generator tests retain one explicit old-ID migration fixture, but repeated stress cases now invoke only current validators and branch-era assertions have been removed.

## Revision 258 remove automatic-generator compatibility aliases

Revision 258 makes the automatic generator current-schema-only. Retired implementation IDs are no longer translated to Standard or Mostly-horizontal choices. Explicit unknown IDs now fail with a clear stage-specific error, while omitted stages still receive current defaults. The remaining compatibility-only generated-record fields and editor import aliases are removed, including old branch ownership, old reward-score naming, nested run provenance, and the former `automaticGeneration` metadata key.

This deliberately does not remove unrelated compatibility handling for hand-authored level entities, character data, settings, or other systems. The cleanup is scoped to automatic-level-generator records and implementation choices.

## Revision 259 minimap control, populated upper halls, safe platform seams, and small-step walking

Revision 259 restores horizontal platform surfaces to the minimap while keeping the panel compact. Its height still follows the top-left meter panel, but its width is capped at that panel's width even for extremely wide levels. The textual click hint remains absent. A persisted **Show minimap** checkbox in Settings can hide the panel without changing Escape-menu behavior.

Generated platform compositions now validate their visual seams against collision semantics. One-way green-line platforms never overlap another platform body. Solid blockable panels may overlap only when their walkable surfaces are level; a raised or lowered solid panel must be horizontally separated so the step reads honestly. The Mostly-horizontal ground and Standard lower route therefore remain dependable running surfaces rather than disguised fall-through gaps or blended height changes.

The Wide, upward-expanding cavern uses more broad shallow room stamps and may build a second reachable tier inward from a first detached perch. This makes continuous ground halls capable of carrying several upper combat and reward positions instead of leaving the entire ceiling volume empty. Encounter placement recognizes combat perches, treasure placement recognizes reward perches, and nontrivial reward density guarantees genuine power-up pickups.

Grounded movement gains a conservative automatic step-up. Ignatius and grounded walking enemies may climb a rise up to one fifth of their own collision height without entering a jump state. Taller ledges still block ordinary walking and continue to require jump or navigation behavior.

## Revision 260 minimap blend fix and denser mostly-horizontal upper combat lane

Revision 260 removes the visible dark rectangle behind the minimap. The minimap remains clickable and bordered, but both the panel shell and the canvas drawing are now transparent outside the cave silhouette itself, so the overlay no longer stamps a mismatched background region over the game view.

The Mostly horizontal generator also gets a denser upper lane. Instead of only a few detached perches, it now keeps adding raised platforms until their combined walkable span covers roughly a quarter of the route width, with a combat-biased perch mix so the upper lane more often carries monsters.

## Revision 261 mostly-horizontal visual audit and playability contracts

Revision 261 follows a twelve-draft visual audit of Mostly-horizontal Earth caverns across Standard and Grand lengths and both cavern shapes. The audit found that revision 260 could technically create upper perches while still clustering them into one central patch, leaving long empty stretches. It also placed non-jumping Skeleton Guards on some raised platforms and allowed later geometry to encroach on vertical shuttle lanes.

Mostly-horizontal traversal now builds a deliberately distributed one-way upper lane and rejects candidates until its combined walkable span reaches roughly one quarter of the route. Most of that lane is classified for combat, with a smaller reward share. Every raised platform has validated travel to and from its ground parent. Ground enemies on those platforms must use jumping hunter navigation; Skeleton Guards now meet that contract.

Vertical shuttles in Mostly-horizontal drafts reserve their complete travel shaft, including lateral body clearance. Later platforms and generated enemies may not occupy that envelope. The camera also looks substantially farther downward as Ignatius accelerates into a fall, reducing blind drops while keeping the lead bounded.

## Revision 262 local hunter recovery and higher upper combat lanes

Revision 262 fixes the exact failure exposed by the `hunter:stranded_patrol` screenshot. The continuous Mostly-horizontal ground is assembled from overlapping blockable platform polygons. Navigation previously let each neighbouring polygon cut the other polygon's top support into fragments, so a hunter could believe it was stranded even while standing beside Ignatius on what visibly reads as one floor. Same-height overlapping solid tops now remain connected navigation supports. Hunter AI also has a local same-floor melee fallback: when Ignatius is visibly on the same physical ground, the enemy chases or attacks directly instead of waiting in stranded patrol for a graph route that is unnecessary.

The Mostly-horizontal upper lane is raised substantially. Each combat or reward perch now sits on a second tier reached through an offset one-way access step. The access step keeps the perch reachable, while the final perch is high enough to preserve at least 170 world units between the ground surface and the rendered underside. That open volume gives homing rockets time to curve toward enemies instead of striking the platform before steering. The access ledge is shifted toward an edge so it does not refill the central firing lane beneath the enemy platform.

## Revision 263 tighter launch-only rocket steering

Revision 263 separates the rocket's launch turn from its normal flight steering. The first 0.32 seconds now use a 6.95 homing strength while the established 4.8 value remains authoritative after the launch window. The rocket starts curving immediately but retains a strongly upward initial velocity, rather than travelling straight upward until the timer expires.

The value is fixed by gameplay geometry rather than visual preference. A headless test measures Ignatius's actual one-jump apex under fixed-step physics, places a walkable platform at exactly that height, and aims the rocket toward an effectively horizontal same-level target. At 6.95 the 15-unit rocket radius clears the platform by roughly two tenths of a world unit; at 6.9 it still clips the platform. This keeps the initial bend as tight as required without making all later homing more aggressive.

## Revision 264 enemy spawn clearance from platform artwork

Generated ground encounters now treat the enemy body as occupied space during placement. The encounter populator searches multiple deterministic positions across the assigned walkable support and accepts a group only when every member clears all unrelated platform rectangles, including a small visual breathing margin. Overlapping blockable pieces at the same floor height remain one legal continuous floor, but overhead platforms, raised ledges, access steps, and moving-platform shafts can no longer pass through an enemy body.

Encounter validation repeats the same test independently and reports a dedicated platform-enemy intrusion metric, so later generator changes cannot quietly reintroduce enemies glued into scenery.

## Revision 265 flying spawn clearance and readable run-and-gun seams

Revision 265 closes the separate flying-enemy placement loophole. Bombing Bat groups now search several complete-group positions in both X and altitude, and every bat body must remain clear of all generated platforms and reserved moving-platform shafts while fitting inside the cavern opening. Encounter validation applies the same rule independently, so a bat can no longer begin in a platform and remain pinned in its perched state.

Ground continuity is also made less ambiguous. Ignatius and grounded monsters may automatically traverse steps up to one fifth of their body height. For the Mostly horizontal floor, same-height blockable assets overlap much more deeply, with at least 72 world units of shared walkable span, so the seam reads and behaves as a continuous surface. Taller height changes remain explicit jumps or vertical-route changes.

## Revision 266 thin-platform collision audit

Revision 266 audits every environment atlas manifest against the established Atlas 004 collision rule. Thin floating platforms now expose only one green `walkable` standing line so Ignatius can jump upward through them, while substantial rock bodies, walls, ceilings, pillars, formations, barriers, and deep floor pieces retain yellow `blockable` collision.

Atlas 001 converts `ledge_small_round`, `ledge_small_flat`, `rubble_skull`, `rubble_long`, and `object_034` to walkable-only lines. Atlas 002 converts the four shallow horizontal strips `floor_long_upper`, `floor_mid_left`, `floor_mid_right`, and `floor_lower_long`. Atlas 003 contains no thin horizontal platforms and remains fully blockable. Atlas 004 already follows the intended split: only its uppermost deep platform is blockable and the remaining fifteen are one-way.

A headless manifest policy test checks all four atlases and rejects either extra blocking geometry on thin platforms or missing blockable collision on substantial assets. Because `level_001` places `rubble_skull`, its baked hunter navigation graph is regenerated against the revised one-way geometry.


## Revision 267 responsive HUD corner panels

The score-and-bars panel now keeps a 430-pixel natural layout and is uniformly scaled by the browser adapter whenever the viewport cannot contain it. While the minimap is visible, the fit calculation reserves both upper corners and a small gap; when the minimap is hidden, the left panel is allowed to expand back toward full size instead of remaining permanently constrained to half the screen. The same calculation protects against unusually short viewports, and the minimap continues to derive its final height and maximum width from the rendered meter panel.

Clicking or tapping either upper panel now opens the pause menu. The score panel also supports Enter, Numpad Enter, and Space, advertises the dialog relationship through ARIA, and is ignored by gameplay pointer controls.


## Revision 268 automatic enemy reinforcements

- [x] Add Level Editor controls for enabling automatic enemy spawning, setting a 0-100 percent one-second chance, and authoring the same range/exclusion enemy pool used by the level generator.
- [x] Persist normalized defaults in level JSON: disabled, 0 percent, pool `1-999`.
- [x] Load the existing enemy-definition catalog for runtime spawning rather than duplicating enemy statistics.
- [x] Roll deterministically once per second and spawn successful reinforcements 10-100 percent of a viewport width beyond the forward screen edge.
- [x] Estimate forward direction from the player to the exit door, with a rightward fallback.
- [x] Place ground enemies only on safe navigation supports and flying enemies in valid forward airspace.
- [x] Start reinforcements alerted and engaged, with the player's current position recorded as last seen. Ground types use hunter pursuit; flying types keep their required flying attack strategy.
- [x] Add headless coverage for defaults, shared pool grammar, editor integration, one-second cadence, rightward and leftward route direction, off-screen distance, pool selection, awareness, and zero-percent dormancy.

## Revision 269 route-scaled power-ups and one-way enemy clearance

Generated reward population now derives a power-up target from the cumulative pixel distance of the mandatory route. At the default reward density, the target is approximately one genuine power-up per 5,000 route pixels. The existing Reward density control still scales that target, zero density still produces no rewards, and the independent reward validator rejects a generated draft that does not meet its recorded target. Treasure chests and optional thoughts remain separate from this count.

Grounded monster occupancy no longer treats green `walkable` lines as torso-height walls. One-way lines continue to support feet from above and remain valid navigation surfaces, but a monster walking beneath one may pass through it horizontally. Yellow `blockable`, damaging, and killable geometry still obstruct the complete enemy body.

## Revision 270 exact jump geometry, denser power-ups, and platform spacing

Ignatius’s ordinary jump is now authored as an exact 200-world-pixel height. `src/core/simulation.js` derives launch velocity from gravity with `v = -sqrt(2gh)`, uses constant-acceleration displacement during the ordinary jump, and splits any fixed step that crosses the apex so collision sweeps reach the exact apex before descending. Gravity remains 1,490 world units per second squared, preserving the existing weight and timing while making the designed height independent of the simulation step. The browser tuning panel exposes jump height rather than raw launch velocity. Launch-only rocket homing is recalibrated from 6.95 to 6.7 so the standard rocket still only just clears a platform placed at the now-exact jump apex.

Generated reward population now targets approximately one genuine power-up for every 2,000 pixels of mandatory-route travel at the default Reward density. Long eligible supports may carry multiple pickups when ordinary reward spacing, encounter exclusion, endpoint clearance, and support-safety rules all remain satisfied, allowing long routes to meet the denser target without inventing unsafe platforms.

Automatic generator version 27 enforces at least 180 pixels of surface-to-surface vertical separation between horizontally overlapping static platforms. Mostly-horizontal lane changes and upper access tiers use the same design contract, while moving platforms remain governed by their travel-shaft checks. The 180-pixel routine rise remains 20 pixels below Ignatius’s exact physical apex, preserving a practical timing margin for mandatory traversal.
## Revision 271 safe lift junctions and no generated deathtraps

The generator must never intentionally produce a lethal trap. The reported Mostly horizontal plus Wide, upward-expanding case exposed a specific violation: a thin vertical shuttle could run directly beneath a thick yellow platform and carry enemies or Ignatius into its underside.

Automatic generator version 28 opens a dedicated docking slot at Mostly-horizontal vertical junctions before the continuous ground chains are materialized. It then reserves the lift's complete route plus 180 pixels of rider clearance above the highest stop. Candidate positions are accepted only when both endpoints are boardable, the rider corridor does not intersect any yellow blockable support body, the moving artwork does not sweep through a green one-way platform, and the corridor does not overlap another reserved lift route. Later raised platforms consult the same reservation.

Independent validation recomputes the corridor from the authored movement record rather than trusting placement metadata. Any crush hazard, green-platform sweep overlap, or shaft intrusion invalidates the draft and causes another deterministic geometry candidate to be tried. The default `rocketfrock` seed for Mostly horizontal plus Wide, upward-expanding is a permanent regression case.


## Revision 272 grounded generated power-ups and one-way monster support integrity

Automatic generator version 29 seats every generated `powerUp` entity directly on its selected support surface. The reward catalog still controls support width, edge clearance, progression, and contextual weighting, but power-up vertical offsets normalize to zero so the entity's bottom-center anchor rests on the floor and ordinary walking collects it naturally. Independent reward validation rejects any generated power-up that is not ground-seated. Invisible narrative thought triggers remain exempt from visual pickup-spacing calculations while retaining their separate-support, endpoint, and cave-clearance rules.

Green `walkable` lines remain one-way floors for monsters as well as Ignatius. Enemy navigation may descend from one only by walking off an authored left or right end with real horizontal velocity; it may never encode a straight or diagonal fall through the middle of the support. One-way supports without polygon bodies now use their own line endpoints as ledge edges for valid walk-off routes. Runtime collision also refuses to ignore the source line for a zero-horizontal drop, providing a fail-safe for stale or malformed baked graph data. `level_001`'s hunter graph is rebuilt against this contract.

## Revision 273 player drop-through and Horizontal/Domed generator defaults

Ignatius may now deliberately descend through green one-way platforms. Down/S, gamepad down, or a downward pointer/touch swipe activates a short player-only pass-through window. The action works from a supported stance and while already falling. Yellow blockable lines and areas remain solid under every input state. Pointer handling retains a one-sample pulse when a swipe is completed between simulation frames, preventing quick touch gestures from disappearing. Enemy collision and navigation remain unchanged: monsters cannot intentionally drop through green lines and may descend only from a real platform edge.

The Level Generator now presents **Horizontal** in place of “Mostly horizontal” and **Domed** in place of “Wide, upward-expanding.” Horizontal and Domed are the default Route and Cavern choices for Earth and Ice themes. Internal implementation IDs remain stable. Domed adds 50 percent more vertical radius above each eligible room while pinning the original lower edge, creating a taller ceiling without pulling the lower perimeter away from the ground route.

## Revision 274 one-way hunter jump-loop correction

The screenshot exposed a planner loophole rather than a loss of one-way collision. Revision 272 had forbidden direct `drop` edges through green lines, but the ballistic graph could still describe a lower target as a full upward `jump`. A hunter directly above its last-seen target preferred that short vertical arc, rose, fell onto the same green support, and immediately selected it again.

All lower destinations from a green support now use authored endpoint walk-offs. Downward jumps and overlapping downward steps are absent from newly baked graphs, while small drops remain routable through the same edge-walk mechanic. Runtime also sanitizes matching old baked graphs before planning and checks the selected edge again before launch. Hunters therefore walk to a platform end and descend once, or remain and pursue locally when Ignatius is beside them; they never bounce in place while trying to reach a target below.

## Revision 275 trigger fire, obstacle-phasing Twin, and perimeter controls

New editor levels leave automatic reinforcements switched off but begin with a 10 percent per-second value, making the feature useful immediately when enabled. Standard gamepad left and right triggers now fire the weapon, including controllers that report analog trigger values without setting the digital pressed bit.

The green Twin wrench trades damage for reliability. Its two homing rockets now deal 10 damage each and retain a launch-time obstacle-phasing flag. They ignore all ordinary level and reactive-obstacle collision while searching for enemies, but enemy hit detection remains authoritative.

New cave windows place the full-black boundary 200 pixels beyond the authored opening. Automatic stalactite/stalagmite population now defaults to a stronger 30-50 percent inward overlap. The Level Editor presents the midpoint as an **Inward coverage %** field so authors can make the foreground bite shallower or deeper before regenerating it.



## Revision 276 denser generated power-up distribution

Generated levels now target approximately one genuine power-up per 1,000 pixels of mandatory-route travel at the default Reward density. The existing density control still scales the result, but its upper multiplier is capped at 1.5 to keep high-density Grand drafts physically placeable. Dense placement searches safe floor slots from platform edges inward, retains the authored reward-spacing and endpoint rules.

The generated power-up mix is now balanced per draft rather than left to loose random chance. Random Wrench has a two-part share while Shield and Overdrive each have one part. A deterministic running-deficit selector keeps the realized mix near 50 percent wrench, 25 percent Shield, and 25 percent Overdrive, including contextual pickups already placed earlier in the reward pass. Power-up slots use common support, edge, and progression constraints so a reward-only reroll can change the pickup types without moving the pickup positions. Rewards are resolved before encounters, and their fixed non-narrative clearance envelopes are supplied to the encounter populator; monsters therefore route around pickups without letting either stage consume the other stage's random stream.


## Revision 277 organic cave fade and economical rocket impacts

The cave-window feather now supports deterministic visual perturbation through `caveWindow.gradientNoise`. Authors can configure the waviness amplitude in world pixels, the average wave scale, and a seed. The renderer combines broad and fine cyclic noise along the closed spline and overlays several low-opacity wavy bands inside the existing feather. Both endpoints of the transition remain fixed: the cyan opening is unchanged, and the exact authored full-black outset remains authoritative for masking and the lethal boundary. Generated caverns receive seed-derived defaults so repeated generator seeds remain reproducible.

Ignatius rocket impacts now use a smaller, shorter smoke burst. The renderer creates neutral and wrench-tinted radial smoke stamps once and reuses them through scaled `drawImage` calls instead of creating a Canvas gradient for every puff on every frame. Impact puffs no longer run their own sparkle loops; one short central spark burst retains the hit punctuation. The authored medium-quality impact count falls from 24 to 12 and its typical lifetime falls below one second, substantially reducing the frame spike without changing damage, collision, splash, or homing behavior.

## Revision 278 full-width organic cave feather

Revision 278 keeps the authored cave perimeter smooth and moves all irregularity into the visual opacity contours. The first revision 277 implementation combined a smooth Canvas shadow blur with faint displaced bands; the smooth blur became dark immediately outside the opening and visually swallowed most of the waviness. The runtime mask now starts from a transparent surface and accumulates twenty-four deterministic perturbed contours along a smoother-step opacity curve. The opening remains exactly transparent, the transition consumes the complete authored feather width, and the existing exact outset still clamps everything beyond it to opaque black.

Gradient noise now uses an explicit 10-500 pixel period instead of the former broad scale, with 50-pixel period and 50-pixel amplitude defaults. Adaptive contour sampling preserves short-period variation without changing the underlying cave spline. The Level Editor labels `caveWindow.feather` as **Feather to full black**, previews several opacity contours, and keeps the smooth perimeter separate from the wavy visual guides. Generated caves now use the same 200-pixel feather default as newly authored cave windows instead of the former hard-coded 118 pixels.


## Revision 279 perimeter decoration simplification

The **Max spacing px** setting is removed. Once automatic decoration was required to cover continuously from the smooth cave opening through the full-black boundary, the parameter ceased to behave as a useful general spacing control: high values were capped by sprite coverage, while low values only forced extra overlap. Automatic tangential placement now derives its step solely from the selected formation's rendered tangent span, using strong deterministic overlap and retaining the existing denser floor/ceiling treatment.

`caveWindow.decoration.spacing` is no longer normalized or serialized. Older records that contain it load safely and discard it. The Level Editor no longer exposes or listens to the obsolete field. Generated cavern records now use the same 2.0 perimeter-asset scale as new manual cave windows, replacing the generator-only 2.15 value.


## Revision 280 longer power-up durations

Revision 280 set Overdrive and the then-five wrench modes to 30 seconds and Shield to 10 seconds. Revision 288 later supersedes the Overdrive and wrench duration with 20 seconds while leaving Shield at 10 seconds. The change is applied consistently to shared effect definitions, entity-catalog defaults, the level-1 examples, tests, and player documentation. Existing refresh, exclusivity, clear-on-death, HUD-priority, and sixty-second pickup-respawn behavior is unchanged.

Housekeeping bugs found during this revision: the Level Editor heading still displayed revision 268, and the current architecture summary still described the old 8/15/5-second power-up timings plus the pre-rebalance Green Twin damage. The editor label is corrected to revision 280 and the architecture summary now matches the authoritative shared data. Going forward, every discovered bug, stale behavior, or deprecated path must be noted in this plan, and manual-covered behavior must be updated in `GameManual.html` in the same revision.


## Revision 281 current-schema-only saved-level cleanup

The compatibility debt recorded across earlier revisions is removed instead of being carried forward indefinitely. Runtime and the Level Editor no longer migrate root-level `playerStart`, `wizardStart`, or `start` records, `magicPortal`/plain `exit` entities, revision-075 `thoughts` arrays, enemy `behavior`/`chaseSpeed`/`awarenessVerticalRange` fields, or the retired Rocket Overdrive pickup/effect identity. Current records must use doorway-owned starts, `thoughtText`, `strategy`, `runSpeed`, and `overdrive`.

The automatic cavern generator no longer computes or serializes the old top/bottom `profile`, and cavern containment no longer has a profile fallback. The arbitrary closed polygon is now the sole cavern geometry representation. State initialization also drops the old raw `jumpVelocity` tuning migration and derives that internal value only from `ordinaryJumpHeight` and gravity.

A stale-data bug was found during the audit: `assets/level_001.json` still contained `caveWindow.decoration.spacing` even though revision 279 removed the field from normalization and editor authoring. The property is now deleted from the active level. Regression coverage verifies that production runtime and power-up code contain no retired migration aliases, the editor strips unsupported retired records and fields instead of preserving them, generated caverns contain no profile record, the obsolete spacing control remains absent, and revision labels are synchronized at 281. The fast suite passes 148 tests, the isolated generator suite passes all 9 tests, and the complete headless suite passes all 157 tests. No Game Manual change is required because current gameplay, controls, durations, damage, and editor controls are unchanged; only unsupported historical data formats were removed.


## Revision 282 shorter post-death camera hold

The camera now remains on Ignatius's death site for two seconds after the spark burst instead of three seconds. Cover and burst animation durations are unchanged, and every lethal route continues through the same portable death lifecycle and ordinary respawn path. The Game Manual now states the two-second hold explicitly. The complete 157-test headless suite passes. No deprecated feature or unrelated gameplay behavior was encountered during this change.

## Revision 283 dead-code and release-packaging housekeeping

A project-wide caller audit found several exported APIs that were no longer used by runtime, editors, tests, or development tools. Revision 283 removes `invalidateWorldCollisionIndex`, `DEFAULT_CAVE_WINDOW`, `DEFAULT_GENERATOR_STAGE_REVISIONS`, `STAGE_SPECIFIC_REGENERATION_OPTIONS`, `generatorRegistryEntry`, `isWrenchPowerUpEffectId`, and the historical story-reading baseline constants. Their removal does not change active normalization, simulation, rendering, generation, or authoring behavior.

The audit also found stale architecture instructions describing the pre-revision-230 runtime wrench-glow cache as current. Powered wrench rockets have actually used authored combined frames from `ct_atlas_wizard_2` since revision 230. The unused `RocketGlowCache` class is removed, the retained image-processing helpers are renamed from `rocket-glow-cache.js` to `rocket-glow-baking.js`, and current architecture and agent guidance now describe the authored one-draw atlas path correctly. Historical revision notes remain historical. The discarded Enemy 004 candidate records under `devel/old` are deleted because Enemy 004 was removed from the project in revision 172.

A new `devel/package_update.py` release helper verifies required files and synchronized revision labels, excludes PNG and XCF files and generated build directories, writes the compact update archive, and tests both zip integrity and forbidden-extension absence. No Game Manual update is required because there is no player-facing or editor-facing change.



## Revision 285 Burst spacing tweak

The green Burst wrench keeps its three small 15-damage unguided rockets and one standard fuel payment, but the sequence interval doubles from 0.09 seconds to 0.18 seconds so the rockets travel with a more clearly separated gap. No other wrench behavior changes.

## Revision 284 editor Fit simplification and six-wrench rebalance

The Level Editor now has one camera-framing button named **Fit**. It keeps the former authored-content behavior, while **Fit World** and **Fit Cave** and their unused handlers are removed. If no authored placements or entities exist, Fit still falls back to the world bounds.

The wrench family now has six mutually exclusive twenty-second modes. Green Twin is replaced by Green Burst, which launches three small unguided rockets forward at 0.18-second intervals. Each rocket deals 15 damage, matching one yellow Triple rocket, for 45 total damage if all connect; the complete sequence consumes one standard launch fuel payment. The old green obstacle-phasing behavior moves to a new Blue Phase wrench: one standard-cost, standard-damage homing rocket that ignores platforms, solids, blocking polygons, cave collision, and reactive obstacles while retaining enemy collision. The retired `wrenchTwin` identity is unsupported in saved levels rather than migrated. A cleanup audit found that an embedded custom effect definition could otherwise revive an unknown retired ID through the generic normalizer; revision 284 now rejects `wrenchTwin` consistently in effect definitions, pickup records, and active-effect snapshots.

Red Bigbomb and magenta Boomerang now leave the launcher horizontally in Ignatius's facing direction before homing, reducing immediate ceiling impacts. Bigbomb AoE damage rises from three times to four times the standard rocket damage, currently 120, while its triple fuel cost, half speed, half homing response, 1.7 scale, and existing AoE radius remain unchanged. Boomerang damage, cost, return, collision, and half-fuel catch refund remain unchanged. A brief outbound grace period prevents a targetless forward-launched Boomerang from reversing into Ignatius on its launch frame.

`ct_atlas_wizard_2` gains a sixth precomposited powered-rocket frame with a pure-blue Phase glow. The manifest preserves the five existing frame coordinates and appends the new row. The compact revision archive continues to exclude PNG and XCF files, so the revised PNG is distributed separately. The Game Manual, architecture rules, entity catalog, level-1 examples, and regression suite are synchronized with the new behavior. All 157 headless tests pass.

## Revision 287 treasure-chest seating refinement

Treasure chests are now a touch smaller and visually lower: the default footprint becomes 68×80 instead of 72×84, and the chest sprite is drawn 4 pixels lower than the support point. This keeps generated chests from looking like their front corners float above narrow ledges while leaving collection logic and reward pacing unchanged. Because the chest is slightly smaller, the generator also relaxes its treasure metadata a bit, using a 180-pixel minimum support width and 40-pixel edge clearance.

## Revision 286 denser generated treasure

Automatically generated levels now target roughly one treasure chest per 500 pixels of mandatory-route travel. The old length-preset cap of one to four chests is removed. Default and high Reward density retain the 500-pixel average, low nonzero density scales the target down, and zero density still produces no rewards. Chests may occupy safe main-route floors, lower recovery routes, upper-access steps, detached reward perches, and other reachable static upper perches. The target is validated, while endpoint exclusions, cave containment, support edge clearance, reward spacing, and enemy reservations remain mandatory.

Power-ups are unchanged and still target approximately one per 1,000 route pixels at default Reward density, with the existing upper multiplier capped at 1.5. Reward schema version 4 and diagnostics now expose both target counts. The Game Manual is updated to describe both frequencies.



## Revision 288 shorter Overdrive and wrench durations

Overdrive and every current wrench upgrade now last 20 seconds instead of 30. Shield remains at 10 seconds. The change is synchronized across shared effect definitions, entity-catalog defaults, level-1 examples, tests, architecture guidance, and the Game Manual. Collection still refreshes the active window rather than accumulating duration; wrench exclusivity, Overdrive coexistence, clear-on-death behavior, HUD priority, and sixty-second pickup respawns are unchanged.


## Revision 289 placeable on-screen enemy spawners

Add an invisible `enemySpawner` entity for boss arenas and other authored reinforcement encounters. Each placed spawner exposes the same 0–100 percent once-per-second chance and the same numbered range / `!` exclusion enemy pool as Automatic enemy spawning. Unlike level-wide automatic spawning, a placed spawner only advances its timer and rolls while its 64×64 authoring region is inside the current camera view; off-screen time is discarded rather than banked.

On a successful roll, the selected catalog enemy appears at the spawner point, already aware of Ignatius and ready to fight. Ground enemies snap to a safe nearby support; flying enemies use the point directly. Occupied, blocked, or unsupported attempts are skipped. A small procedural purple-blue teleport flash and a brief actor brightness flash sell the conjuration without adding an image asset. The Level Editor keeps a visible crosshair-ring marker and resolved-pool preview, while the entity remains invisible in gameplay.


## Revision 290 code audit and release housekeeping

A full static and automated review found one confirmed release defect: the retired `src/presentation/rocket-glow-cache.js` had reappeared beside `rocket-glow-baking.js`. The duplicate contained the obsolete runtime `RocketGlowCache` class, violated the revision-283 retirement contract, and made the source-organization test fail immediately. Revision 290 removes the stray file again.

The audit also found a release-pipeline gap. `devel/package_update.py` verified required files, synchronized revision labels, archive integrity, and PNG/XCF exclusion, but it did not reject known retired paths. The helper now maintains an explicit retired-file denylist and aborts packaging if any of those files reappear. Regression coverage checks that this guard includes the retired rocket-glow cache.

Documentation housekeeping updates the stale project-layout diagram to reflect the current core, browser, presentation, shared, and tool modules. No player-facing, editor-facing, control, balance, level-data, or save-schema behavior changed, so the Game Manual does not require an update.

## Revision 291 level_002 and first boss encounter

`assets/level_002.json` is now a complete generated-and-refined Earth cavern titled **The Incandescent Goblin Gallery**. Its reproducible generator foundation uses seed `cinder-vault-291-8f6c2b`, default-scale route settings, and Fireball Goblins exclusively. Six ordinary Fireball Goblins populate the journey before a manually enlarged final cavern.

The final arena has four vertically staggered long platforms on each side, with the opposing columns offset so enemies and Ignatius can move between firing heights rather than occupying flat mirrored rows. Six invisible on-screen enemy spawners sit on the lower three platforms of each column and resolve only `enemy_002`. Four random-wrench pickups are distributed across the platform columns. The central boss, **Gorblax the Incandescent**, is an ordinary Fireball Goblin placement enlarged to 1.95 render scale and 900 HP with stronger fireballs and wider awareness.

The basic boss milestone is now substantially implemented. Character-enemy placements support `isBoss`, `bossName`, and `bossDefeatSignalChannel`; the Level Editor exposes those fields; the browser HUD shows one current/max-health bar after awareness or damage; and lethal damage emits `BOSS_DEFEATED` exactly once. Boss identity and signal data remain ordinary serializable state. A future explicit encounter-activation/reset controller is still deferred because this first arena activates naturally through enemy awareness.

Named signal receivers now make hanging and spiked gates reusable blockers. A closed receiver contributes a portable solid rectangle and switches to its open visual state while removing collision when its channel activates. Optional collision dimensions may exceed the decorative sprite dimensions, allowing a gate to block an entire passage without stretching its artwork. Enemy spawners also accept an optional `disableSignalChannel`, exposed in the Level Editor, so reinforcements can stop at encounter completion.

In level 2, defeating Gorblax activates `BOSS_002_DEFEATED`. That signal raises the iron gate before the exit door and disables all six reinforcement spawners. The exit then leads to `level_003`; until that level exists, the existing missing-destination fallback applies. The generated route and arena contract have deterministic headless coverage, but the full level still requires browser playtesting for boss health, reinforcement pacing, platform traversal, camera composition, and the visual fit of the raised gate.

Housekeeping found during the revision: the monolithic generator command could become pathological when the large macro-contract ran after the other decorated-draft tests. `npm run test:generator` now uses `devel/run_generator_tests.mjs` to launch each geometry-heavy contract in an isolated sequential Node process with `--expose-gc`. This preserves all nine generator regressions without retaining one suite's temporary geometry in the next process or creating concurrent memory contention.

## Revision 292 level_002 performance repair and compact boss encounter

The first browser playtest of `level_002` exposed a severe simulation regression. The level contained hunter enemies but its `navigationGraphs.profiles` array was empty, so every ground goblin rebuilt the complete ballistic route-edge graph every simulation tick. The renderer itself remained inexpensive, which is why the debug panel showed only a small drawing cost while observed frame rate fell to roughly 4 to 5 FPS. Revision 292 bakes both required hunter profiles into the level: one for ordinary Fireball and Musket Goblins and one for the differently sized boss.

The runtime fallback is now safe as well. Static hunter supports and directed edges are cached once per world topology and mobility profile. Replacing or resizing the world's solid, segment, or collision-polygon arrays invalidates that cache, while moving-platform supports continue through their existing dynamic bundle. A release check now rejects any `level_*.json` that contains hunter enemies but no baked navigation profiles. The temporary one-off level-generation script is removed and denied by packaging so it cannot drift into later releases.

Exit locking is simpler and universal. Every `wizard_exit_door` refuses to start its proximity-opening sequence while any living boss remains in the current level. Defeating the final boss restores the ordinary door sequence automatically. Named boss-defeat signals remain useful for reinforcement shutdown, music, rewards, and optional signal-controlled barriers, but an iron gate is no longer required merely to lock an exit.

The final chamber in `level_002` is rebuilt as a compact wide-screen arena. It keeps four staggered platforms on each side, six on-screen-only reinforcement spawners, and four wrench pickups, but the columns, floor, cavern outline, boss, and exit now fit within a standard wide viewport. Gorblax is reduced from 1.95 scale and 900 HP to 1.55 scale and 750 HP so he remains clearly oversized without swallowing the arena. The decorative iron gate is removed. The six spawners can conjure either regular Fireball or Musket Goblins and still stop on `BOSS_002_DEFEATED`.

The ordinary route is no longer deserted. It now contains five non-boss Fireball Goblins, four Musket Goblins, and three compact groups of two Bombing Bats. No Skeleton Guards are present. Placeable spawners remain strictly camera-bound: even during an active boss fight, an off-screen spawner performs no roll and accumulates no elapsed time. The compact arena ensures all six intended reinforcement points are normally visible together.

The monolithic `npm test` process still reproduced the previously diagnosed geometry-retention slowdown when it reached the generator cases after the fast suite. The release command now runs the complete fast group and isolated generator runner sequentially as separate processes, preserving all assertions without retaining the fast-suite heap.

The next task is a fresh hands-on playtest of revision 292 to tune boss health, platform spacing, spawner probability, enemy density, and exact camera framing. The boss foundation itself is now complete enough for authored level work; water volumes remain the next major planned world system.

## Revision 293 Level Editor selection, unified enemy scale, and foreground freedom

Character-enemy placement now has one authored `scale` multiplier. `src/shared/enemy-scale-data.js` owns normalization and the derived hitbox, artwork scale, and projectile-radius calculations. The Character Editor enemy catalog remains the source of the base hitbox (`w`/`h`) and base artwork/projectile values. At runtime, the Level Editor, hit testing, ground snapping, and hunter mobility profiles all consume the same scaled dimensions. Artwork offsets scale with the actor as well, so an enlarged enemy remains registered to the same local foot and equipment positions. Old entities with no `scale` remain exactly 1×. Gorblax in `level_002` is migrated from separate enlarged width, height, render scale, and projectile radius values to the Fireball Goblin base values plus one 2.8 multiplier.

The Level Editor's **Enemy scale** value applies on every `input` event. The selected enemy preview, effective W/H display, hit-test rectangle, and serialized JSON change without pressing **Apply**. Character-enemy W/H inputs are read-only effective dimensions; base hitbox edits belong in Puppet Forge's enemy defaults. Because scaling a hunter changes its mobility profile, release packaging now requires an exact baked navigation profile for every authored hunter rather than merely checking that some graph exists.

Object selection now distinguishes one primary object from a multi-selection set. Shift-drag creates a world-space selection rectangle. Ctrl-click toggles one entity or placement, while Ctrl+Shift-drag toggles all fully enclosed records. The most recently added or clicked object is the primary white-dashed selection and remains editable through **Selected object**; secondary members use gray dashed outlines and participate only in group movement and deletion. Group movement snaps from the primary object and applies one shared delta, preserving relative spacing. The toolbar **Delete** control is an immediate action and never replaces the current tool.

The Asset palette now aggregates every frame from every loaded atlas in one searchable list. Each row identifies its atlas, and choosing a row activates the correct atlas automatically. The separate atlas dropdown is removed.

Manual **Populate perimeter** no longer passes endpoint, pickup, enemy, or platform protection regions to the foreground decorator. Inward coverage is therefore literal: stalactites and stalagmites may intentionally overlap the visible playing area so Ignatius, enemies, doors, and platforms can pass behind foreground rock. Automatic level generation retains its own stricter safety and validation rules; this change applies to the explicit manual authoring command only.

The next task remains a hands-on `level_002` playtest in revision 293, now including the unified boss/fireball scale, compact arena framing, encounter density, spawner cadence, and the repaired navigation performance. After that tuning pass, rectangular water volumes remain the next major planned world system.


## Revision 294 standard Level Editor clipboard actions

Replace the atlas-asset-only Copy action with standard Cut, Copy, Paste, and Delete actions that operate on either the primary object or the complete multi-selection. The clipboard stores full placement/entity records without serializing selection state into level JSON. Copying preserves relative spacing and creates fresh IDs on paste; generated copies become manual records so generator ownership cannot be duplicated accidentally. Cutting rejects locked generated records, removes the originals immediately, and restores the first paste at the original coordinates with the original IDs when those IDs remain available. Later pastes use fresh IDs and a snapped cascading offset.

Toolbar buttons and Ctrl/Cmd+X, Ctrl/Cmd+C, Ctrl/Cmd+V, Delete, and Backspace share the same commands. Keyboard handling deliberately yields to inputs, textareas, selects, and content-editable controls so ordinary text editing remains native. Clipboard commands never become persistent tools and Paste returns the editor to Select mode with the pasted group selected. The generator release runner also restores the intended two-process split: the eight core generator contracts run together in one clean Node process while the memory-heaviest macro contract runs concurrently in a second clean process. This avoids the environment-dependent stall seen in the accidental nine-process sequential runner while preserving heap isolation for the macro suite.

The next gameplay task remains the hands-on revision-294 `level_002` playtest and encounter tuning. Rectangular water volumes remain the next major planned world system after the current boss-level pass.

## Revision 295 Level Editor box-selection bounds fix

Browser playtesting revision 294 exposed a confirmed Level Editor bug rather than a usage mistake. `level-editor.html` contained two function declarations named `placementWorldBounds`. The earlier selection helper expected `{ x, y, w, h }`, but JavaScript hoisted the later cached culling helper, which returned `{ minX, minY, maxX, maxY }`. Asset-selection containment therefore compared undefined fields and could never add atlas placements to a Shift-drag selection.

Revision 295 removes the duplicate helper and makes both assets and entities use one canonical min/max bounds representation during box selection. Shift-drag continues to replace the selection with fully enclosed records, and Ctrl+Shift-drag continues to toggle those records. A regression check now requires exactly one `placementWorldBounds` declaration and verifies compatible bounds conversion for both placements and entities. The next gameplay task remains hands-on `level_002` encounter tuning; rectangular water volumes remain the next major planned world system afterward.

## Revision 296 Entity palette owns placement choice

Revision 296 removes the stale entity-type dropdown from the Level Editor toolbar. The right-side Entity palette is now the single source of truth for the active entity placement type; clicking a palette button selects that type and enters Place Entity mode, while the toolbar button simply reuses the current palette choice. This recovers toolbar space and removes duplicate UI state. Regression checks forbid the retired `quick-entity` element and its JavaScript wiring.

## Revision 297 full-height thumbnail palettes

Revision 297 replaces the Level Editor's text-heavy asset list and one-at-a-time preview with a full-height, internally scrolling two-column thumbnail grid. Every loaded atlas frame is visible directly in the Asset palette, with its frame name, atlas, object type, and dimensions attached to the card. A compact filter remains fixed above the scroll area, beside the atlas reload action.

The Entity palette now uses the same card grid, viewport-height panel, internal scrollbar, and filter field. Catalog entities draw their authored default visual, character enemies draw their idle rig pose, and invisible/editor-only entities fall back to a large identifying icon. Palette selection still owns the active Place Asset or Place Entity choice; the redesign changes authoring presentation only and does not alter level JSON or runtime behavior.

## Revision 298 palette thumbnail readability repair

The first hands-on pass of revision 297 exposed a real CSS-grid failure: when many cards were present, implicit `auto` rows compressed to fit the available palette height, reducing canvases to narrow slits. Revision 298 gives the grid max-content rows and every card a non-shrinking preview area, so overflow is handled only by the intended scrollbar.

Asset, catalog-entity, and character previews now compute cached visible-alpha bounds. The thumbnail fitter crops transparent frame margins, preserves composed visual alignment, and centers the actually visible artwork rather than the nominal source rectangle. This fixes apparently missing asset thumbnails and off-centre enemies while retaining the two-column design.

## Revision 299 Level Editor live inspector and compact panels

Hands-on testing found that composed enemy thumbnails could still be undersized or off-center because fitting used calculated rig-command bounds before the complete character had been rasterized. Revision 299 renders each composed character preview to a temporary surface, crops the final combined alpha, and fits that crop into the card. This was fixed immediately.

The Selected object panel now applies position, size, angle, and Notes while typing; other fields commit on their ordinary change event, and the obsolete Apply button is removed. Notes is a single-line field. Static explanatory essays were removed from compact right-hand panels and moved to `DEVELOPER_MANUAL.md`. The Entity and Asset palette panel geometry and margins remain unchanged.

Revision 299 also corrects a second palette distortion found during the repair: the fixed 320×240 backing bitmap did not always match the CSS card aspect ratio. Palette canvases now size their backing store from their displayed width and height before fitting artwork, preventing browser stretching.

## Revision 300 cursor-following placement previews

Palette-driven placement now shows the actual chosen asset or entity under the pointer before committing it. The ghost uses snapping, authored dimensions, atlas/entity visuals, and nearby-ground snapping for doors and grounded enemies, so the click result matches the preview. Preview records use a reserved transient ID and never enter the level document. Assets and entities now share the same one-shot workflow: choose a palette card, move the preview into position, click once, then continue in Select mode.


## Revision 301 Level Editor Canvas performance bridge

Hands-on use of densely decorated levels exposed a confirmed editor hot path: cursor-following placement previews called the complete synchronous Canvas render for every pointer event. With roughly a thousand visible placements this also rescanned cave geometry warnings, checked overlap state across the main placement list, drew every entity without viewport rejection, and scheduled pretty-printed serialization of the full level document. WebGL2 would not remove those CPU-side costs, so the repair is implemented immediately rather than deferred.

Revision 301 changes `draw()` into a requestAnimationFrame-coalesced scheduler. The editor renders a cached static viewport scene and then draws transient placement previews, selection outlines, and selection marquees separately. Preview pointer movement and marquee movement reuse the static scene. A second transparent viewport cache holds dense cave-foreground artwork, allowing ordinary terrain/entity edits to rebuild the scene without redrawing hundreds of unchanged perimeter formations. Foreground edits and atlas, colour-map, or structural changes explicitly invalidate that layer.

Entities now use conservative cached world bounds for viewport culling. Overlap composites use stable placement-array identity plus explicit invalidation instead of rebuilding a full placement signature on each scene render. JSON serialization is removed from the render loop and is scheduled only by actual level mutations or metadata commits. The implementation deliberately preserves the canonical placement groups, bounds, and ordinary draw paths so upcoming WebGL2 work can replace presentation without inheriting a competing scene model.

The release audit also found two denylisted files still present: `generate_level002_temp.mjs` and the obsolete `src/presentation/rocket-glow-cache.js` duplicate beside `rocket-glow-baking.js`. Both had already been classified as retired, but had reappeared in the revision-300 full archive. Revision 301 removes both stale files immediately. No Game Manual update is required because gameplay, controls, level schema, and visible editor workflow are unchanged.


## Revision 302 compact action spacing and completed generator test audit

A Level Editor screenshot exposed several button groups whose rows touched vertically despite the existing horizontal column gap. Revision 302 wraps the generator ownership actions, generator fit/clear/undo/redo actions, and cave-perimeter actions in a shared compact button stack. The stack adds five pixels between adjacent controls and uses 14-pixel button text so the recovered breathing room does not make the panels taller or force avoidable wrapping.

The promised test review found a real release-harness problem rather than a product-code failure. The previous two-process generator runner still accumulated enough temporary geometry inside its core process to stall when it reached encounter tests, while the macro contract mixed decorated drafts with a 48-route seed sweep in one heap. Concurrent child processes also competed for memory. The fix preserves every assertion but divides the generator gate into four sequential fresh processes: foundations, decorated macro drafts, encounter/reward/refinement/perimeter contracts, and the route-only macro seed sweep. The macro test was split at its natural process boundary, not reduced: all eight decorated theme/length drafts and all 48 route seeds still run. The complete `npm test` release gate now finishes successfully with 154 fast tests plus 10 generator tests.

No Game Manual change is required because gameplay, controls, level data, and editor command behavior are unchanged. The next gameplay task remains the hands-on `level_002` encounter-tuning pass, followed by rectangular water volumes.

## Revision 303 test-gate and WebGL2 runway housekeeping

Revision 303 turns the growing testbench into named development gates without reducing assertions. Every test has explicit primary ownership in a stable manifest. The `shared`, `editor`, `game`, and `generator` gates run in two, two, four, and four fresh sequential Node processes respectively; `smoke` is a small overlapping cross-system selection. The release runner records per-shard pass, fail, timeout, or skip status and stores fingerprinted progress under excluded `.build/` so an interrupted identical release run can resume without rerunning completed shards. A normal `npm test` remains a fresh complete release gate.

A frozen dense Level Editor fixture now provides a fixed comparison workload of 1,039 placements and 68 entities, with 986 cave-foreground records. Its hash, composition, and hands-on browser profiling procedure are recorded in `EDITOR_STRESS_BASELINE.md`. Actual browser frame measurements remain pending because this virtual environment cannot provide a trustworthy loaded-page timing run; the comparison target itself is no longer moving.

The direct Canvas ownership audit is recorded in `RENDERER_BOUNDARY_AUDIT.md` and enforced by `npm run audit:renderer`. Game-world drawing remains under `src/presentation/`, with only the compact HUD minimap allowed in browser bootstrap. Level, character, and asset editors remain independent Canvas tools during the first game WebGL2 slice. Core and shared code remain free of direct rendering ownership.

Packaging now rejects stale revision documentation, incorrect project/archive names, missing gate infrastructure, retired files, transient test or coverage output, backup/log/temp files, nested ZIPs, unsafe or duplicate members, and compact archives containing PNG or XCF artwork. This is a housekeeping-only revision. The next feature work may begin the staged WebGL2 backend or return to the pending hands-on `level_002` encounter-tuning pass; neither is mixed into revision 303.

The completed revision-303 release gate passed all 165 unique primary tests across twelve shards. The outer command wrapper ended during the first macro invocation, and the fingerprinted resume path then skipped the nine already-passed shards and completed the remaining three successfully. This validates both the project and the new interruption-recovery mechanism.

## Revision 304 fixed-step input edge buffering

Revision 304 fixes a confirmed browser-input bug that could discard a short jump press, a complete tap, or the release-and-repress gesture used for the air boost. The browser already delivered keyboard events individually, but `src/browser/browser-input.js` previously reduced them immediately to held-state differences on each animation frame. Because `src/browser/game-bootstrap.js` samples before knowing whether a 60 Hz fixed simulation step will run, a press observed on a render-only frame could be marked as old and disappear before simulation consumed it. A release and repress between samples could likewise collapse into one continuously held state.

Digital gameplay transitions are now latched independently from held state. Keyboard and pointer event changes enter a pending press/release buffer immediately; sampled gamepad state changes enter the same buffer when observed. `input.sample({ consumeGameplayEdges: false })` may be called on any number of render frames without clearing those transitions. The browser loop clears only the edge fields delivered to the first fixed step, while `createSubstepInputFrame` continues to remove them from later catch-up steps. Press and release may both be present in one fixed-step frame, preserving their useful order in the existing jump logic so an airborne release can arm the boost before the accompanying repress starts it.

The default `sample()` call still consumes returned edges for isolated tools and tests that do not own a fixed-step loop. Title-screen suppression, pointer drop pulses, gamepad ownership, and held-state behavior remain intact. Regression coverage now proves a press survives render-only frames, a complete keyboard tap survives entirely between samples, a release plus repress starts exactly one air boost, and held input does not retrigger after consumption. This input fix is independent of Canvas or WebGL2 rendering and should remain the browser-loop contract for future render backends.

## Revision 305 projectile geometry and wrench arsenal rebalance

Revision 305 makes one-way platform geometry transparent to every projectile. Player rockets and enemy shots ignore green `walkable` collision segments, while ordinary solids, yellow `blockable` lines, and blocking polygon areas remain authoritative projectile obstacles. Actor collision is unchanged: the green lines remain one-way supports for characters.

The five non-red wrench modes now share a simple economy target. Yellow Triple, cyan Dart, green Target, blue Homing Triple, and magenta Boomerang each cost half a standard rocket launch and deliver one standard rocket of nominal total damage. Magenta retains its catch refund, which returns half of its already reduced launch cost. Red Bigbomb is unchanged.

Yellow Triple now launches three straight non-homing rockets at -15, 0, and +15 degrees around a launch-time line to the nearest active enemy in the direction Ignatius faces. Each deals one third standard damage. Green Target launches one straight standard-damage rocket on the same nearest-forward launch-time aim, falling back to straight ahead when no enemy is in front. Cyan Dart continues straight along facing. All three non-homing wrench modes use the exported `NON_HOMING_ROCKET_SPEED_FACTOR`, currently 2. Blue Homing Triple inherits the former yellow homing volley: three one-third-damage homing rockets in the established -12, 0, and +12 degree fan, with separate target assignment when possible, at standard speed. Magenta keeps standard speed, homing, return, and catch behavior.

The stable serialized effect IDs remain `wrenchBurst` and `wrenchPhase` for compatibility, while their visible labels become Target and Homing Triple so the HUD and manual no longer promise retired burst or phasing behavior. Regression coverage checks player and enemy projectile passage through walkable lines, blocking-line and blocking-area impacts, launch-time forward target selection, spread angles, homing state, speed, fuel cost, damage totals, and Boomerang refund arithmetic.

## Revision 306 wrench-first Power HUD priority

Revision 306 changes only which simultaneous timed effect is shown in the top-left Power bar. Any active wrench upgrade now has HUD priority 200 and is displayed ahead of Shield at 150 and Overdrive at 100. Shield and Overdrive remain active underneath the displayed wrench, keep their own timers and gameplay effects, and reappear in priority order when the wrench expires.

The priority selector also compares normalized saved metadata with the current built-in priority for the same canonical effect ID. This prevents an older serialized wrench definition that still contains priority 50 from hiding behind Shield or Overdrive after loading. No pickup duration, effect stacking, wrench exclusivity, fuel cost, damage, projectile behavior, or respawn timing changes in this revision.


## Revision 307 yellow Fivefold volley

Revision 307 expands the yellow wrench from three rockets to five while preserving the existing +/-15-degree outer cone. The fan is evenly spaced at -15, -7.5, 0, +7.5, and +15 degrees around the nearest-forward launch-time target line. Each projectile deals one fifth of standard rocket damage, keeping the volley at one standard rocket of nominal total damage for half standard fuel. The visible label changes from Triple to Fivefold, while the internal `wrenchTriple` ID remains stable for saved data.

## Revision 308 remove player rocket firing cooldown

Revision 308 removes the confirmed 0.35-second player rocket launch cooldown. Every distinct weapon-press edge now launches immediately whenever the current fuel amount covers the launch cost. The fixed-step input buffer continues to preserve presses until simulation consumes them, while held input remains edge-triggered rather than becoming automatic fire. Fuel cost, recharge delay, projectile behavior, wrench profiles, and enemy attack cooldowns are unchanged.

The obsolete cooldown contract is removed from portable tuning, weapon state, normalized power-up rocket profiles, Overdrive metadata, launch events, and runtime decrement logic. The already-unused `weapons.launchedThisPhase` field and unused launch-function input parameter are removed at the same boundary cleanup. Older serialized states that still contain `weapons.launchCooldownTimer` or embedded `launchCooldownMultiplier` fields remain loadable because those surplus fields are ignored. Overdrive therefore retains its twenty-second half-fuel benefit but no longer claims a cadence multiplier in data or player guidance. Regression coverage proves consecutive fixed-step presses both launch, even when a legacy cooldown timer is present. The stale rapid-fire atlas tag, entity-catalog description, level-1 note, and current project instructions are corrected in the same revision.


## Revision 309 wrench volley path tuning

Revision 309 narrows yellow Fivefold's complete fan by half, from +/-15 degrees to +/-7.5 degrees, using five evenly spaced offsets at -7.5, -3.75, 0, +3.75, and +7.5 degrees. Blue Homing Triple retains its -12, 0, and +12 degree authored fan but adds an independent deterministic launch-angle jitter of at most 2 degrees to each rocket. The variation changes between rapidly fired volleys while remaining reproducible for the same simulation seed and state. No fuel, damage, speed, homing-strength, target-selection, or collision values change for either wrench.

## Revision 310 shared wedge-direction jitter for yellow and blue volleys

Revision 310 changes the blue and yellow multi-rocket wrench modes so repeated volleys no longer reuse one rigid fan direction. Yellow Fivefold and blue Homing Triple still keep their existing authored internal offsets, but the whole wedge now receives one small deterministic shared angular offset per volley. That means the rockets inside a volley preserve the same spacing relative to each other as before, while rapidly repeated volleys take slightly different overall paths.

The portable `initialAngleJitterDegrees` field is still the knob that enables this behavior, but `src/core/simulation.js` now samples it once per volley instead of once per projectile. The applied offset is stored back onto each spawned projectile as `launchAngleJitterDegrees` for diagnostics and replay tests. The same 2-degree bound is now enabled for yellow Fivefold as well as blue Homing Triple. Fuel cost, homing, target selection, speed, damage, and collision behavior remain unchanged.

The same revision renamed the visible lightning power-up to Overdrive. Revision 319 later made `overdrive` and `overdrivePickup` its canonical internal identities. Overdrive still lasts twenty seconds and halves projectile launch cost. It now also supplies continuous passive fuel recovery at 90 percent of the current attached-hover drain rate, including while airborne, during the ordinary recharge delay, and while hover fuel is actively being consumed. Ordinary grounded recovery may exceed this floor but is not added to it. With current tuning, hover drain is 40 fuel/second and the Overdrive floor is 36 fuel/second, leaving a deliberate net hover cost of 4 fuel/second. The former retired `rocketOverdrive` ID remains unsupported and is not revived by the display-name change.


## Revision 311 WebGL2 hybrid renderer

Revision 311 moves the game presentation onto a WebGL2-first hybrid backend. The visible game canvas now requests a high-performance WebGL2 context. Static world atlas sprites, cached overlap composites, actor-front scenery, cave foreground sprites, cutout masks, and final layer composition are sent through a batched textured-quad renderer. Adjacent quads sharing a texture are submitted through one dynamic vertex buffer, while textures are cached and reused across frames.

Complex procedural drawing that still benefits from the mature Canvas 2D implementation, including character rig effects, particles, text, debug overlays, and the organic cave mask, is rendered into transparent staging layers. Those layers are uploaded into reusable WebGL textures with `texSubImage2D` and composited by the GPU in the correct scene order. This avoids rewriting fragile presentation logic in one step while shifting the heaviest repeated scenery and final compositing work to WebGL2.

`createRenderer` retains a direct Canvas 2D fallback when WebGL2 is unavailable. The WebGL backend handles context loss/restoration, rebuilds shader and buffer resources, and exposes draw-call, quad, texture-upload, texture-update, layer-upload, and texture-count diagnostics in the existing debug panel. WebGPU is intentionally not used: WebGL2 has broader browser and embedded-runtime coverage, simpler fallback behavior, and is sufficient for the current 2D sprite workload. Future migration work may move character parts and selected particle families into the same sprite batch after visual parity is established.

## Revision 312 direct WebGL2 particles for trails and deaths

Revision 312 takes the next renderer-migration step after the hybrid WebGL2 conversion. Rocket smoke trails, projectile explosion bursts/rings, and Ignatius death particles now bypass the Canvas staging pass when WebGL2 is available. They are emitted as direct textured quads in ordered GPU passes, using cached particle sprites and additive blending where appropriate.

The main goal is to remove one of the most particle-heavy categories from repeated Canvas rasterization without rewriting every dynamic actor draw path at once. Unsupported procedural effects still remain on the staging canvas, and the pure Canvas fallback path is unchanged. This preserves risk control while pushing another measurable slice of frame work onto the GPU.

## Revision 313 direct WebGL2 enemy projectiles

Revision 313 continues the renderer migration by moving live enemy projectiles out of the Canvas staging layer when WebGL2 is available. Enemy fireballs, musket balls, and rocks now draw directly as GPU sprite batches, and enemy fireball trail particles join that same pass. This keeps their ordering correct relative to enemies behind them and Ignatius in front of them while reducing another chunk of repeated Canvas work.

Player rockets, player-specific rig effects, text, and the remaining miscellaneous procedural overlays still stay on Canvas for now. That keeps the migration incremental and lowers risk while broadening the set of high-frequency moving visuals handled by the GPU batcher.

## Revision 314 direct WebGL2 player rockets

Revision 314 continues the renderer migration by moving the launched player rocket visuals themselves out of the Canvas staging layer when WebGL2 is available. The direct GPU pass now draws the rocket body sprites and a lightweight flame treatment for all active player rockets, while the already-migrated rocket trails and explosion effects remain in their own WebGL passes.

The migration keeps scene order stable by drawing player rockets in the same middle GPU section that already handles direct particle effects and enemy projectiles, before the upper staged pass that still contains Ignatius, score popups, and other Canvas-driven overlays. The Canvas fallback remains unchanged.

## Revision 315 direct WebGL2 actors, pickups, and targets

Revision 315 moves the remaining high-frequency world actors that can be represented as sprites into direct WebGL2 passes. Target markers, ordinary and power-up pickups, runtime character enemies, simple enemy fallbacks, enemy health bars, and the Ignatius character rig now bypass the full-screen Canvas staging layer when WebGL2 is active.

Character rigs remain driven by the same animation sampling and pose data. The renderer converts each runtime draw command into pivot-aware GPU quads, including facing reflection, per-part rotation, alpha, shield/low-health tint overlays, and character shadows. The mounted rocket fuel bulb and debug/story-heavy overlays remain on the upper Canvas staging pass because they still rely on procedural drawing. Score popups now use cached text sprites in a direct WebGL pass, and the portal-intro glow is also emitted directly as an additive GPU sprite.

## Revision 316 WebGL parity review fixes

Revision 316 audits the WebGL2 path against the pre-WebGL Canvas renderer and corrects two visible parity regressions found during that comparison. Ignatius death-cover sparks now render after the player rig, matching the original Canvas order so the sparks obscure the body instead of appearing behind it. Player and enemy hit flashes now use cached white silhouette overlays in the GPU character pass, while player shield and low-health overlays remain active independently.

The complete release gate remains the regression baseline, but these fixes also add source-contract checks for death-cover ordering and WebGL hit-flash support. Packaging now uses the project packaging script so transient `.build` test reports remain outside the distributed update archive.

## Revision 317 WebGL2 fallback hardening review

Revision 317 performs a second parity review against the pre-WebGL2 revision 310 and hardens the renderer selection boundary. WebGL2 is now fully probed on a disposable scratch canvas before the visible game canvas is committed to the WebGL context family. Browsers with no WebGL2 support, or with a context that exists but cannot compile/link the renderer resources, therefore leave the visible canvas untouched and continue through the original Canvas 2D renderer.

The runtime render switch also no longer attempts to draw the Canvas fallback into the hidden staging canvas during a transient WebGL context loss. The renderer now waits for `webglcontextrestored`, avoiding invisible wasted frames and keeping startup fallback distinct from runtime context recovery. The Canvas 2D draw order and gameplay contracts remain unchanged.

## Revision 318 WebGL2 Level Editor compositor

Revision 318 brings the Level Editor onto a WebGL2-first presentation path without replacing its mature Canvas authoring routines. The editor still renders the expensive static viewport scene into its existing cached Canvas surface, but WebGL2 now keeps that scene as a reusable GPU texture. Pointer-following placement previews, selection outlines, and selection marquees are drawn into a separate transparent transient surface and composited over the static texture each animation frame. This avoids copying and repainting the full dense static scene during ordinary cursor movement.

The editor probes WebGL2 on a disposable canvas before committing the visible stage to a GPU context. Browsers without WebGL2, or browsers where shader/resource initialization fails, retain the original visible Canvas 2D renderer. Context loss pauses visible submission until restoration, then invalidates the scene caches and rebuilds normally. Level data, placement drawing, hit testing, collision previews, serialization, and editor tools are unchanged.

## Revision 319 canonical Overdrive identity

Revision 319 removes the last internal Speed Shot naming. The effect ID is now `overdrive`, the placeable pickup type is `overdrivePickup`, and `POWER_UP_EFFECT_IDS.OVERDRIVE` is the only built-in constant for the lightning power-up. Every bundled authored level, generated-level metadata record, reward catalog, entity catalog entry, stress fixture, test, and manual reference has been updated to use the canonical names.

No compatibility alias for `speedShot` or `speedShotPickup` remains. This is deliberate because all currently supported levels ship inside the project archive and have been migrated together. The older, separate `rocketOverdrive` identity remains retired and unsupported. Gameplay behavior is unchanged: Overdrive lasts twenty seconds, halves player rocket fuel cost, and supplies passive fuel recovery equal to ninety percent of hover drain.

## Revision 320 dynamic-sprite correctness fallback

Revision 320 responds to the first live playtest of the broad WebGL2 migration. On the tested browser, static scenery, perimeter decoration, HUD, minimap, and the small mounted fuel indicator remained visible, but Ignatius, monsters, and projectiles were invisible. Automated source and simulation tests had not exercised real browser texture presentation closely enough to expose that failure.

The WebGL2 renderer now keeps static scenery, foreground composition, and final layer compositing on the GPU, while the complete dynamic actor stack is rendered through the proven Canvas path into one transparent staging layer. This restores the exact pre-WebGL2 ordering for portal glow, targets, pickups, enemies, effects, projectiles, Ignatius, death-cover sparks, and score popups. Direct GPU helper methods remain in the codebase for controlled reintroduction only after browser-level visual validation.

Benchmarking now has an explicit browser switch: the default URL uses the original Canvas 2D renderer, while `game.html?webgl=1` opts into the WebGL2 hybrid path when probing succeeds. The opt-in switch also accepts `webgl=true`, `webgl=on`, `webgl=webgl`, `webgl=webgl2`, and `webgl=gpu` for manual comparison runs.

On July 1, 2026, headless Chromium measurement at 1280x720 DPR 1 used `level_002` through `playtest_browser_copy=1`. The dense entrance viewport held 60 fps in both modes, with WebGL2 hybrid at 0.70 ms median render time versus forced Canvas at 0.55 ms. A paused boss-arena viewport with an active seeded rocket explosion also held 60 fps, with WebGL2 hybrid at 0.90 ms median versus forced Canvas at 0.80 ms. The current revision 320 hybrid path is therefore correctness-safe but not yet faster in these tested slices, because dynamic actors and effects still render through Canvas staging and upload three GPU layers per frame.

## Revision 323 opt-in resident-texture WebGL2 pass

Revision 322 is the user-decreed baseline for this work even though its visible game/editor labels and the tail of the project notes still said revision 320. The missing 321/322 historical notes are not reconstructed after the fact. Revision 323 synchronizes the live labels again and records the actual changes made from the supplied 322 archive.

The WebGL2 experiment was still paying for three full-screen Canvas uploads in ordinary gameplay: world geometry, the complete actor/projectile stack, and the cave/story/debug composition. That fallback corrected revision 320's invisible actors, but it erased the expected GPU performance advantage. The direct dynamic helpers also sampled one cropped Canvas texture per character part, leaving both correctness and texture-switching behavior dependent on many small CPU surfaces.

Revision 323 fixes that immediate bottleneck only when the game is explicitly opened with `?webgl=1` (or the existing equivalent opt-in value). Runtime character-frame records retain their original atlas image and source rectangle. The WebGL renderer preloads and pins the static environment, character, tint, smoke, and particle textures, then draws Ignatius, enemies, pickups, targets, rockets, enemy projectiles, score popups, and supported effects directly from resident GPU textures. Power-up glows now tint the existing item atlas in the shader path instead of creating a separate tinted Canvas texture. The mounted fuel bulb also has a direct GPU sprite composition.

The cave mask now owns a reduced-resolution GPU texture. Its CPU Canvas is regenerated and `texSubImage2D`-updated only when the mask render key changes, rather than being folded into a full-screen staging layer every frame. Normal gameplay therefore reports zero Canvas-layer uploads once the frame is warm. Canvas staging remains deliberately available for story letters/thoughts, debug and puppet guides, collision/asset-authoring guides, unsupported residual effect/projectile kinds, and levels that have no drawable atlas scenery. The ordinary Canvas 2D renderer is unchanged and remains the default when no WebGL URL parameter is present or WebGL2 probing fails.

Real Chromium validation was repeated in a headed browser under a virtual display because this environment disables WebGL in headless Chromium. The opt-in renderer displayed the wizard correctly from the original atlas, reported `webgl2-resident`, retained more than 100 textures in the validation scene, and produced a warm paused frame with zero texture uploads, zero texture updates, and zero full-screen Canvas-layer uploads. The earlier invisible-wizard failure did not recur.

Remaining GPU migration work is explicit rather than hidden: the cave-mask pixels, level colour-map canvases, overlap composites, foreground treatments, hit-flash/tint surfaces, and generated text/particle stamps are still prepared on the CPU before becoming resident textures. Moving those preparations into shaders or GPU render targets is a later optimization. Rare unsupported visuals continue to use the conditional staging escape hatch until each has browser-validated direct parity.

## Revision 324 GPU effects and cave-mask geometry

Revision 324 fixes the missing opt-in WebGL effects reported after revision 323. The underlying defect was in the generic sprite batch rather than in every individual effect: when `sourceWidth` and `sourceHeight` were omitted, JavaScript converted their `null` defaults to zero. The generated UV rectangle therefore collapsed onto the source texture's upper-left texel. Atlas sprites generally supplied explicit source rectangles and remained visible, while full-texture procedural sprites such as glows, smoke stamps, rings, rocket flames, and spark kernels usually sampled a transparent corner and disappeared. The batcher now treats an omitted source rectangle as the complete resident texture, and a regression test inspects the generated UV span directly.

The opt-in `?webgl=1` actor pass now explicitly draws the curved player-rocket path trail, the goblin-fireball particle trail, player-rocket and enemy-projectile explosion cores and sparks, rocket impact smoke, enemy impact puffs, and reactive-object destruction smoke through resident GPU sprites. Teleport flashes and sparks are also included in the direct effect set. These additions do not change simulation records, damage, lifetime, or the normal Canvas renderer.

The cave-window mask no longer needs a camera-sized Canvas texture in the WebGL path. Its opening, feather contours, and fully black outset are compiled once per authored cave definition into world-space triangle buffers. The feather is alpha-blended directly, while the exterior uses an odd-even stencil pass followed by an opaque black fullscreen pass. Camera position, zoom, and parallax are uniforms, so camera motion does not repaint a Canvas or update a texture. The old reduced-resolution Canvas mask remains only as a compatibility fallback if a WebGL2 context cannot provide the required stencil operations.

A headed Chromium run with an actual WebGL2 context confirmed visible rocket trails, rocket explosions, enemy-projectile impact effects, goblin-fireball trails, and destroyed-object smoke. After startup, the test frame reported `uploads:0`, `updates:0`, and `layers:0`; moving the camera retained those values while the cave mask remained visually correct. Canvas 2D remains the default unless the URL explicitly opts into WebGL.

The next GPU-residency work, if continued, is the exceptional presentation layer: mailbox/story text, debug and puppet guides, geometry fallback levels, and presentation caches that are still baked once on a CPU Canvas before becoming resident textures. Those are not ordinary frame-by-frame uploads.

Release-gate infrastructure note: the current `generator-foundation` and `generator-content` shards can stall when several expensive generator tests run sequentially in one Node process, even though the same tests complete normally in fresh isolated processes. Revision 324 browser and renderer tests are unaffected. The release runner should later split those generator cases into smaller fresh-process shards, or the generator's process-global caches should be audited for cross-test accumulation. Until that harness issue is resolved, isolated generator test results are the reliable diagnostic for these cases.


## Revision 325 WebGL rocket-nozzle flame cleanup

A small but ugly regression remained in the opt-in `?webgl=1` renderer after revision 324: the projectile rocket's local nozzle flame shimmered far more aggressively than the Canvas 2D version and its bright inner core was offset in screen Y rather than along the rocket's rotated local axis. The resulting additive overlap produced a distracting flashing blob at the back of the flying rocket even though the ordinary `?webgl=0` path still looked correct.

Revision 325 keeps the direct resident-texture rocket flame in WebGL, but reworks its placement and modulation so it behaves like the existing Canvas flame. The WebGL helper now anchors the flame at the same authored nozzle location used by `drawRocketFlameLocal`, derives a stable per-projectile flutter seed from the projectile id, reduces the length variation to the same restrained 4% flutter used by the Canvas path, and keeps both flame quads centred on the nozzle instead of offsetting the bright core in screen space. This removes the unpleasant flashing artifact without changing rocket gameplay, trail effects, or the default Canvas renderer.


## Revision 326 remove the WebGL rocket-trail beacon

The revision 325 flame cleanup did not address the artifact shown in the follow-up screenshot because the fuzzy orange circle was not part of the nozzle flame. It was a separate 40-pixel additive `softGlow` sprite attached to the newest sampled point of the curved rocket trail. Since trail samples advance in discrete simulation steps, that glow jumped between nearby positions and appeared only on some rendered frames, producing the conspicuous rotating-warning-light effect beside the projectile.

Revision 326 removes that WebGL-only hot-core sprite completely. The dedicated nozzle flame remains attached to the authored rocket nozzle, while the curved trail retains its smoke and small sparkle crumbs. The normal Canvas renderer remains unchanged. A renderer regression assertion now prevents the large sample-snapped orange glow from being reintroduced into the direct GPU trail path.


## Revision 327 temporary whole-bestiary tuning controls

Revision 327 begins the gameplay and difficulty tuning phase with a temporary global multiplier layer rather than requiring one build per monster-value edit. The Game tuning panel now separates melee and ranged enemies and exposes HP, run speed, and attack rate for both groups, plus projectile speed for ranged enemies. All sliders default to `1×` and are included in the editable/copyable tuning JSON.

Runtime classification follows `attackMode`: projectile attackers, including bombing bats, are ranged; other character enemies are melee. HP multipliers apply to current and future enemies. Existing living enemies preserve their health percentage when HP scales change, avoiding accidental healing or damage while experimenting. Run speed is multiplied at movement and navigation use sites. Ranged projectile speed affects straight/homing launches, ballistic solutions, and dropped bombs. Attack-rate multipliers accelerate the full attack timeline and cooldown clocks, so ranged monsters can genuinely fire several times more often rather than remaining capped by their wind-up animation.

The authored values in enemy catalogs and levels are intentionally unchanged. After playtesting settles on final factors, the planned cleanup is to multiply the corresponding per-monster HP, run speed, attack timing/cooldown, and projectile-speed values in the authoritative data, verify all bundled levels and generator catalogs, then reset these global modifiers to `1×` or remove the temporary layer.


## Revision 328 shared Rocketfrock favicon and enemy-ID namespace assessment

Revision 328 adds a shared `favicon.ico` derived from the authored projectile-rocket artwork. The game entry pages, Game Manual, Level Editor, Asset Tool, and Puppet Forge all reference the same compact multi-resolution icon. The update archive still excludes standalone PNG and XCF source-art files. Packaging and source-organization tests now require the favicon so later revisions do not silently lose it.

The proposed enemy-number families were also audited without changing identifiers yet. Gaps in the catalog are technically safe because runtime selection enumerates actual catalog keys rather than iterating every number. The existing gap at `enemy_004` already demonstrates this. Renumbering is nevertheless a coordinated migration because the renderer preloads character projects explicitly, Puppet Forge lists known projects explicitly, the generator has bat-specific checks hardcoded to `enemy_005`, both bundled levels carry catalog and character IDs, and the test suite names the current IDs extensively. A clean one-revision migration is practical once the final map is confirmed, most naturally keeping Skeleton Guard as `enemy_001`, moving the two goblins to `enemy_010` and `enemy_011`, and moving Bombing Bat to `enemy_020`. The matching `ct_char`, `ct_rig`, `ct_anim`, and atlas identifiers should be renamed in the same pass so the namespace remains understandable rather than leaving catalog IDs and artwork IDs out of step.


## Revision 329 enemy family renumbering

Revision 329 performs the coordinated enemy identifier migration agreed after the family-range audit. Skeleton Guard remains `enemy_001`. Fireball Goblin moves to `enemy_010`, Musket Goblin moves to `enemy_011`, and Bombing Bat moves to `enemy_020`. Their character, rig, animation, atlas manifest, and atlas PNG filenames and internal IDs move with them. No compatibility aliases are retained because every supported level is bundled and migrated in the same revision.

The enemy definition catalog, generator encounter catalog, renderer preload list, Puppet Forge known-project selector, Level Editor data, both campaign levels, automatic-spawn pools, boss-arena spawner pools, generated-level provenance, stress fixture, source helpers, and regression tests now use the new identifiers. Numeric pool expressions were migrated as data rather than treated as display text: the goblin-only pool is now `10`, the two ordinary goblins use `10,11`, and the bat-only pool uses `20`. Sparse catalog ranges remain supported by enumeration of actual keys.

The shared goblin artwork is now `ct_atlas_enemy_010`, used by `ct_rig_enemy_010` and `ct_rig_enemy_011`. The bat project is consistently numbered `020`. The previous live resource files are removed rather than duplicated. Historical planning notes retain their original identifiers where they describe earlier revisions.

This revision is packaged as a full archive by explicit request, including PNG, ICO, XCF, and the other binary assets normally omitted from compact revision downloads.


## Revision 330 opportunistic ranged attacks and shot validation

Ranged enemies no longer treat `attackRange` as a hard permission boundary. It remains a preferred tactical distance for navigation and spacing, while a projectile attacker may begin its wind-up from any distance at which Ignatius is freshly inside the enemy's authored awareness range and facing cone. Hunters may interrupt an approach route to shoot, then resume pursuing their preferred position after the attack cycle.

Every projectile attack now validates a plausible shot before wind-up and again at the authored release frame. Straight and homing shots require enough speed and lifetime to reach Ignatius and a clear swept lane through blocking solids, blockable segments, blocking polygons, and reactive obstacles. Ballistic shots solve and sample the actual arc. If Ignatius moves out of the awareness cone, behind cover, or beyond projectile reach during the wind-up, the enemy completes the animation without releasing a projectile.

Bombing bats use a dedicated falling-rock prediction. The simulation solves the time to Ignatius's vertical centre, projects the rock's small inherited horizontal velocity, requires the projected landing lane to overlap Ignatius, checks projectile lifetime, and samples the downward trajectory for obstructions. Bats therefore keep approaching their bombing station but do not drop rocks while horizontally unable to hit or while a platform or other obstacle blocks the fall.


## Revision 331 WebGL fireball silhouette parity

Revision 331 removes the fuzzy orange circular bulb that the opt-in `?webgl=1` renderer drew underneath every authored goblin fireball. The Canvas renderer already used its radial fireball glow only when atlas artwork was missing, but the WebGL path always submitted both the circular soft-glow quad and the authored teardrop sprite. That extra additive circle rounded off the narrow rear of the projectile and visibly broke its silhouette.

The direct WebGL fireball path now returns immediately after drawing the resident authored atlas sprite. Its circular soft glow remains available only as the same missing-art fallback used by Canvas. Live emitted trail particles remain unchanged. A renderer regression check verifies that the authored sprite is resolved before the fallback glow and that the fallback is not composited beneath normal fireballs.


## Revision 332 Tri-fireball Goblin and generic straight volleys

Revision 332 adds `enemy_012`, the Tri-fireball Goblin. It shares `ct_atlas_enemy_010` with the other goblins, owns a copied `ct_rig_enemy_012` project, and uses copied Fireball Goblin idle, walk, attack, hurt, and death clips so later visual tuning can remain isolated. The new catalog entry keeps the ordinary Fireball Goblin damage per projectile, uses slightly smaller radius-12 fireballs, disables homing, and launches three shots at -15, 0, and +15 degrees around the launch-time line to Ignatius.

Portable enemy projectile state now supports `projectileVolleyCount` and `projectileVolleyHalfAngle`. The release path creates one ordinary projectile record per angle and tags each with stable volley metadata, leaving projectile kind, frame, straight travel, homing, collision, damage, and future presentation choices independent. This is the reusable seam for later single, triple, and quintuple straight arrows, spinning axes, and other authored projectile families without adding enemy-specific launch branches.

Shot validation evaluates the actual trajectory of every straight volley member against Ignatius's body, projectile lifetime, radius, blocking solids, blockable lines and polygons, and reactive obstacles. A volley may begin and release when any one member has a plausible unobstructed hit; it is not incorrectly rejected merely because another member will strike scenery. The same any-member rule is rechecked at the authored release frame.


## Revision 333 camera-relative cave preview

Revision 333 fixes a Level Editor/runtime mismatch in cave-window authoring. Runtime shifts the cave opening and `caveForeground` artwork around the technical world-bounds centre when the Foreground parallax factor is greater than 1, but the editor previously displayed those records at unshifted world coordinates. In long levels this could make a door appear safely inside the cave in the editor while the play camera shifted the black mask hundreds of world units over it.

The editor now reuses `computeCaveWindowParallaxOffset` with its own current viewport and camera. Panning and zooming therefore move the cave spline, gradient contours, full-black boundary, point handles, and foreground artwork exactly as gameplay would from the corresponding camera region. Cave-point insertion, foreground placement, hit testing, dragging, guides, labels, selection outlines, and box selection convert correctly between displayed and authored coordinates, leaving level JSON camera-independent.

## Revision 334 enemy-hit effect stutter laboratory

Revision 334 adds `devel/enemy-hit-effect-lab.html` and its module `devel/enemy-hit-effect-lab.js` so Chrome-specific hit stutters can be decomposed without repeatedly entering combat. The page continuously scrolls a timing ruler and animates the actual `enemy_010` Fireball Goblin project while exposing separate triggers for the hurt animation, runtime hit flash, Canvas filter flash, pre-tinted overlay flash, health bar, explosion core, explosion ring, impact sparks, impact smoke, and the complete enemy-hit presentation.

Each trigger opens an isolated measurement window and records the worst requestAnimationFrame interval, worst JavaScript draw duration, frames above 25 ms, and WebGL texture uploads. The WebGL mode uses the production resident-sprite backend. Dedicated controls clear its texture cache or prewarm the character and effect textures, making a first-use upload spike distinguishable from a persistent draw cost. The copy multiplier can amplify a subtle offender after the ordinary one-copy test. This is a development-only visual probe; it does not change simulation, projectile damage, authored effects, or the production renderer.

The player-provided `level_002.json` was adopted as the current Level 2 source. It expands the authored level from 1,039 to 1,237 placements and from 68 to 82 entities while preserving its existing level identity and metadata.

## Revision 335 Chrome enemy-hit stutter diagnosis and first mitigations

The revision 334 laboratory results were not yet trustworthy enough to identify a culprit. Several Canvas rows reported an exact 1000 ms maximum even though synchronous draw work remained below 7 ms, while most other rows shared a 50-67 ms frame cadence regardless of the selected component. The old probe measured the requestAnimationFrame interval that led into a button click and counted every frame above 25 ms, so tab suspension, focus changes, a slow baseline display cadence, or browser scheduling could be blamed on the next effect. WebGL texture uploads were zero throughout, which rules out the original first-use upload hypothesis for that run but does not distinguish JavaScript, GPU/compositor, and baseline scheduling cost.

Revision 335 hardens the laboratory. Every trigger waits for a stable recent baseline, starts on a requestAnimationFrame boundary, reports peak delay above the baseline median, records synchronous trigger action time separately from renderer draw time, observes browser long tasks when supported, and marks any focus loss, hidden-tab interval, or frame gap of at least 250 ms invalid. A no-effect control is included. The page also loads the real `level_002` data and adds production fixed-step probes for a no-hit hunter step, rocket expiry, sentry damage, first hunter damage, and damage to an already-alerted hunter. These probes make simulation/navigation work visible without conflating it with the local visual reconstruction.

Two safe production mitigations are applied immediately. Canvas character-enemy flashes no longer change `ctx.filter` on the live game context; they draw the already prepared white hit-flash sprite surfaces additively, matching the WebGL presentation seam and avoiding deferred Chrome filter/compositor work. Portable player-damage awareness no longer constructs a second complete hunter navigation context after the enemy AI has already updated earlier in the same fixed step. It records Ignatius's coordinates immediately and lets the ordinary next hunter update resolve supports and routes. Existing awareness, facing, hurt, health-bar, target, and route-repath behavior remains intact.

The remaining Chrome-specific cause is deliberately not declared solved until the revised lab is run locally. The next decision should be based on baseline-normalized rows: a large Canvas-filter-only excess implicates the old filter path; a large production hunter delta over the no-hit/sentry controls implicates AI/navigation; a visual excess with low JavaScript draw and no long task points to GPU/compositor work; and similar excess in the no-effect control indicates a browser/display cadence problem rather than an enemy-hit component.

## Revision 336 deferred Canvas/compositor isolation

The one-, five-, and ten-copy Chrome runs make the broad attribution clearer. Production fixed-step actions remain below roughly 2 ms and do not scale with the visual copy multiplier, while the Canvas complete-hit row develops a large requestAnimationFrame gap that grows from a missed-frame cluster at one copy to pauses near or above one second at five and ten copies. JavaScript draw time and Long Task reporting stay small. That pattern is consistent with work being deferred beyond the synchronous Canvas calls, such as raster/compositor backlog, rather than a simulation or hunter-navigation stall. WebGL accumulates ordinary missed frames and rising draw cost but does not reproduce the same runaway Canvas pause in the laboratory.

Revision 336 corrects two diagnostic contaminants before changing more production artwork. The laboratory panel itself no longer uses `backdrop-filter`; its permanent blur could force Chrome to composite the animated canvas through a large translucent layer and explains why the supposedly idle page settled near 33 ms even when synchronous drawing was below 1 ms. A dedicated `Game HUD backdrop blur` trigger now measures that CSS feature explicitly instead. Combined effects also keep each component's real lifetime: the 160 ms flash, 420 ms explosion elements, 820 ms smoke, 480 ms hurt pose, and 1.4 s health bar no longer all remain active for the whole health-bar interval.

Additional combination probes distinguish particles without flash, complete hit without flash, complete hit without smoke, a production-like visual hit without the Canvas-only synthetic core, and a complete hit rendered without additive blending. The table reports maximum frame time outside synchronous drawing, and results can be copied as tab-separated text so no rows are lost to cropped screenshots. The live game accepts `?hudblur=0` (or `?backdrop=0`) as a developer comparison that disables DOM HUD/menu backdrop blur without changing the canvas renderer. No further production effect is removed in this revision; the next visual change should be chosen from the corrected combination and live-game blur comparisons.

## Revision 337 damage-effect audition page

Revision 337 adds `devel/damage-effect-showcase.html` and its module. The page loads the actual Ignatius and Fireball Goblin rigs and presents complete rocket-impact, wizard-injury, and monster-injury alternatives rather than isolated primitives. Every candidate explicitly avoids live `CanvasRenderingContext2D.filter` use. Repeat count and inter-play delay controls support visual comparison over many activations, while each sequence records trigger cost, maximum synchronous draw cost, maximum frame delay remaining after draw time is removed, and late-frame count. This diagnostic is development-only and does not alter current production effects.


## Revision 342 completed: adjustable ordinary-jump apex

Ignatius can now trim an ordinary jump by holding Down during ascent. The full jump remains 200 world pixels; an immediate held brake reaches 100 pixels, and later engagement selects an intermediate height. The force is restricted to negative vertical velocity, so descent gravity and green-platform drop-through behavior are unchanged.

## Revision 352 cached cave-geometry warnings

Level 002 profiling showed that the resident world tiles were already inexpensive: both Canvas 2D and WebGL2 spent about 0.5-0.6 ms drawing the world, while the direct Canvas overlay consumed roughly 7.5-10.4 ms. Disabling the grid and manifest guides did not reduce that cost. The dominant hidden expense was `gameplayGeometryCaveWarnings()`, which rebuilt the same approximately 860-point sampled cave polygon separately for every collision-bearing terrain placement on every pan frame. A standalone level-002 benchmark reproduced roughly 4.6-7.5 ms of warmed-up work while finding no warnings.

The editor now samples the cave spline once per cave-shape signature and keeps per-placement separation results in a `WeakMap`, keyed by the placement transform. Panning and zooming therefore reuse the existing warning results. Moving or resizing one terrain placement recalculates only that placement, while changing a cave point, point mode, enabled state, or feather distance resets the sampled cave and placement cache. A new shared `cavePolygonSeparation()` helper accepts an already sampled polygon, while the original `caveWindowPolygonSeparation()` API remains compatible.

This revision deliberately keeps the resident tile renderer, WebGL2 option, parallax preview, zoom, and direct overlay architecture. The measured bottleneck was invariant validation work inside the overlay, not world artwork composition.

## Revision 353 compositor-only guide panning and truthful cadence profiling

The revision 352 retest exposed a decisive mismatch between synchronous timings and visible motion: level 002 reported roughly 11 ms of submitted JavaScript/Canvas work while right-drag panning visibly advanced at only two or three frames per second. The old editor readout labelled submission time as a complete frame, even though Chrome can defer Canvas rasterization, texture transfer, and composition until after the drawing calls return. This is the same diagnostic trap previously isolated by the enemy-hit laboratory.

During active panning, the editor now leaves the transparent guide canvas untouched and translates its already-rendered bitmap with a compositor transform. Resident world tiles continue to redraw at the current camera, so newly exposed scenery remains correct, while the grid, asset guides, labels, cave guides, and warnings move as one temporary snapshot. The exact overlay is rebuilt once when the drag ends. Missing guide strips at newly exposed viewport edges and the small temporary cave-parallax approximation are confined to the drag itself; authored data and the settled preview remain exact.

The profiling readout now distinguishes rolling requestAnimationFrame cadence from synchronous submission cost. It reports average FPS/interval, the worst recent interval, request-to-callback delay, world submission time, and whether the overlay is frozen. A low submission figure can therefore no longer masquerade as smooth presentation.

## Revision 354 corrected whole-scene compositor panning

The first revision 353 pan preview moved only the transparent guide canvas while the WebGL world still waited for requestAnimationFrame redraws. On the reported Chrome machine those callbacks arrived at roughly 1.8 fps with approximately 450 ms of queue delay. Pointer events nevertheless updated the CSS transform immediately, so guides raced ahead of stale artwork, and the independently promoted overlay could temporarily paint beyond the work area. The result was severe guide/art misalignment and apparent sidebar overdraw.

Revision 354 replaces that unsafe split. The world canvas and guide canvas now live inside one paint-contained `stage-pan-layer`. Starting a pan cancels any pending editor draw; pointer movement updates the camera and translates that complete rendered scene as one compositor snapshot; and the regular draw scheduler refuses all world and overlay redraw requests until the drag ends. On release, one exact frame is drawn for the final camera and the temporary transform is removed in the same render callback. Both canvases therefore remain pixel-aligned throughout the drag, and the transformed scene is clipped to the editor viewport. Newly exposed edge strips may show the editor background until release, and cave parallax is intentionally frozen during the gesture, but the settled view remains exact.

The renderer readout now states `pan preview: compositor only` during an active pan instead of presenting stale submission timings as though they described the gesture. The next performance check should focus on whether this single-layer transform tracks the pointer smoothly on level 002; no tile, WebGL, parallax, or overlay redraw work is expected while the button is held.

## Revision 355 direct Canvas game-renderer baseline

The Level Editor profiler proved that a short JavaScript submission time can coexist with very poor visible cadence, and the compositor-only pan preview did not improve that cadence on level 002. That preview remains an optional production experiment, but it is no longer treated as evidence that the underlying renderer is fast. The unresolved editor hitch is recorded for comparison rather than hidden behind another cache layer.

Revision 355 adds `level-renderer-baseline.html`, an isolated diagnostic that converts an authored level through `applyEditorLevelToWorld` and renders it continuously with the ordinary production Canvas2D game renderer. It uses no Level Editor tile caches, no WebGL backend, no frozen overlay, no CSS pan transform, and no duplicate asset drawing implementation. Dragging and wheel zoom only change a presentation view override; the runtime world, authored level data, and gameplay camera remain untouched. The page reports actual requestAnimationFrame cadence beside the production renderer's own world, actor, foreground, mask, culling, and submission timings.

The Level Editor now has a **Canvas baseline** button that stores the current browser copy and opens the diagnostic at the same top-left camera position and CSS zoom. This is a sanity-check surface, not a replacement editor and not an authoritative level serializer. Its result will decide whether the next editor optimization should target browser presentation cadence or the editor's own overlay and interaction pipeline.


## Revision 356 production Canvas renderer becomes the Level Editor base

Status: implemented and awaiting live performance confirmation.

The revision 355 sanity check was decisive: level 002 panned and zoomed quickly when rendered through the ordinary production Canvas2D game renderer. The slow path was therefore the Level Editor's separate tile/WebGL/compositor architecture, not the level size, parallax, browser Canvas implementation, or production renderer.

Revision 356 replaces the normal editor's base-scene path with that proven renderer. It removes the active editor WebGL backend, world-space tile caches, low-zoom tile tiers, and CSS pan-preview layer. The editor converts authored data through `applyEditorLevelToWorld`, keeps a stable runtime snapshot across camera-only pan/zoom frames, and marks that snapshot dirty only for authored mutations. Moving records are omitted from the base once and rendered transiently on the overlay until commit. The existing editor guide overlay remains separate and exact.

Next validation: pan and wheel-zoom level 002 with grid, manifest lines, and labels enabled. Capture the revision 356 profile readout. If cadence is still unexpectedly low, isolate the transparent guide overlay by temporarily disabling it; do not reintroduce tiles, WebGL, or transformed snapshots before that measurement.


## Revision 357 Level Editor viewport feedback and active-frame cadence

Status: implemented and measured with Playwright.

The revision 356 production renderer was not the remaining failure. Automated Chromium comparison reproduced the user's split: the standalone baseline sustained roughly 58-59 FPS, while the editor could report 1-2 FPS even though synchronous scene and guide submission remained small. The first incremental boundary check found the editor canvas at roughly 1,990-2,106 CSS pixels inside a 1,319-pixel workbench. The long profiling string gave the HUD a large intrinsic width; the workbench grid track expanded under the sidebar, `resizeCanvas()` copied that width back to the canvases as inline CSS, and changing diagnostics repeatedly resized and cleared both surfaces. This explains the wobble, transient misregistration, sidebar intrusion, and the contradiction between low visible cadence and modest draw timings.

Revision 357 constrains the workbench, canvas row, and HUD tracks, ellipsizes diagnostics without changing layout, and leaves visible canvas sizing entirely to CSS. Both backing stores now remain equal to the stable viewport. It also replaces pointer-event-paced rendering during direct manipulation with a temporary continuous requestAnimationFrame chain, matching the proven baseline scheduler while returning to event-driven rendering when idle. Wheel input uses the cached canvas rectangle and briefly keeps the same chain alive. The stale `fitView()` startup call is corrected to `fitContentView()`.

A headless Chromium run at 1749×926, DPR 1, level 002, zoom 0.365 measured the production baseline at 58.1 FPS and the full editor with grid, manifest lines, labels, cave guides, and side panels at 51.9 FPS, an editor/baseline ratio of 0.89. The editor body and stage no longer overflow horizontally, and stage/overlay CSS and backing dimensions remain identical. This is now the automated pre-playtest sanity check; manual testing is reserved for visual feel and browser-specific confirmation rather than first-line diagnosis.


## Revision 358 Editor 2 structural bisection scaffold

The revision 357 automated result did not match either Chrome or Opera on the target machine. The full Level Editor still presented at roughly 1.3 FPS with requestAnimationFrame queue delays above one second, while the production Canvas baseline remained around 40 FPS. Synchronous editor submission stayed below 10 ms, and disabling grid and manifest guides did not repair cadence. This invalidates the earlier claim that the loaded Playwright run represented user-visible performance. The likely remaining class is browser/hardware-specific layout, paint, raster, or composition work that the headless/virtual compositor does not reproduce.

Revision 358 begins a clean migration instead of applying another broad optimization to the monolithic editor. `level-editor-2.html` starts from the proven baseline and exposes seven ordered structural stages: baseline; static full sidebar; static editor toolbar and chrome; untouched transparent overlay; per-frame transparent clear; grid on that overlay; and the same grid on the single production canvas. One **Run stage sweep** action moves the camera through every stage and produces a copyable browser/GPU report. This reduces the next user check to one controlled experiment and identifies the first failing boundary before any authoring behavior is ported.

The existing Level Editor remains the functional reference. The next implementation step depends on the sweep: if static DOM/chrome is the first collapse, simplify and virtualize the side panel before porting functionality; if adding or clearing the second canvas collapses cadence, keep Editor 2 single-canvas; if all structural stages remain fast, begin porting grid and selection behavior in small independently benchmarked increments. Playwright remains useful for correctness, dimensions, and regression automation, but physical-browser cadence is authoritative for this compositor fault.

## Revision 359 lazy palette surfaces and physical-compositor hypothesis

The revision 358 physical-browser sweep ruled out the static sidebar, toolbar chrome, the mere presence of a transparent overlay, and overlay clearing as the source of the approximately 1.3 FPS editor collapse. The sidebar reduced the scene canvas area and improved cadence from 25.5 to 29.8 FPS. Drawing the grid cost roughly four FPS on either canvas, but did not approach the production editor failure.

Source inspection found a materially different boundary that the inert scaffold did not reproduce: the functional editor creates one independent thumbnail canvas for every entity and asset palette card. Level 002 loads 166 atlas frames and 31 entity/enemy choices, so the sidebar retained about 197 Canvas elements even when the palette panels were far outside the visible sidebar region. At the old nominal 320×240 backing size this represents more than fifteen million thumbnail pixels, about 60 MB of raw RGBA backing storage before browser/GPU bookkeeping. This matches the physical-browser-only symptom: synchronous scene submission remains near 10 ms while requestAnimationFrame callbacks are delayed hundreds of milliseconds, yet headless Chromium remains healthy.

Revision 359 changes both palettes to lazy backing stores. Every off-screen card keeps only a 1×1 Canvas; an IntersectionObserver allocates and draws a full-resolution preview only when the card approaches the actual browser viewport, then releases it again after it leaves. The card DOM, search, selection, labels, and click behavior remain unchanged. The profiler now reports active/total palette canvases and their aggregate backing megapixels. `resizeCanvas()` also avoids resetting identical scene and overlay backing dimensions when a ResizeObserver callback reports no real size change.

The next physical-browser check should use the normal editor, not another broad scaffold stage. A large cadence recovery with a small active palette count confirms retained thumbnail surfaces as the compositor bottleneck. If cadence remains poor, the new palette metric removes that branch and the next migration step will isolate functional sidebar synchronization and input scheduling.

## Revision 360 on-demand export JSON surface

The physical-browser test isolated the first decisive DOM boundary. With every right-hand panel collapsed, level 002 panned near 40-45 FPS. Expanding only **Export** reduced cadence to roughly 1.4 FPS, even though renderer submission remained below 5 ms. The panel retained the entire pretty-printed level in a live textarea: level 002 is approximately 2.5 MB and 60,000 lines. Chrome and Opera therefore spent hundreds of milliseconds outside the measured JavaScript draw calls maintaining and compositing a huge editable text surface beside the canvas.

Revision 360 removes the persistent JSON textarea. The editor keeps only a short placement/entity/atlas summary in the Export panel and serializes the current level only when Copy JSON, Download JSON, Save browser copy, playtest, the Canvas baseline, or the explicit **Open JSON in new tab** action needs it. The separate tab contains the full text without burdening the editor's canvas page. Scheduled editor updates now refresh metadata and the summary without repeatedly pretty-printing the whole level.

The Playwright comparison explicitly expands the Export panel and records its retained textarea count and character count. Any future live serialized textarea in that panel fails the diagnostic boundary even if headless cadence remains deceptively healthy.

## Revision 361 compact Level actions and CSS-pixel camera alignment

Status: implemented.

The dedicated Export panel is removed. The Level panel now owns exactly three on-demand actions: **Save Level (json)**, **Save in Browser**, and **Load in Browser**. Copy JSON and Open JSON in new tab are retired. Serialization remains demand-driven and no full-level text is retained in the editor DOM.

The editor/artwork alignment bug is fixed at the renderer boundary. Static editor cameras now pass a CSS-space zoom to the production renderer. The renderer converts that zoom using the canvas's exact backing-pixel-to-CSS-pixel ratio after resize, rather than assuming `devicePixelRatio` is the visible scale. The overlay likewise derives its transform from its actual backing dimensions. Playing-area guides therefore stay on the ordinary camera, while only cave-window and `caveForeground` guides receive the cave parallax offset.

## Revision 362 grouped Level data controls and renderer cleanup confirmation

Status: implemented.

The Level panel now separates campaign loading from level-file/browser actions. **Existing Level:** contains the shipped-level dropdown and one **Load** button. **Level data:** contains **New level**, **Import level**, and **Export level** on the first row, followed by **Load from Browser** and **Save in Browser** on the second row. The JSON file input remains hidden and is opened by the explicit Import button.

The active Level Editor renderer remains the revision 356 production Canvas2D path. It has no world-tile cache, zoom-tier tile atlas, WebGL editor backend, frozen pan snapshot, or compositor-translated scene. Camera movement redraws the current viewport through the game renderer with spatial culling. Normal reusable atlas images, colour-map surfaces, cave-mask data, and treated foreground sprite caches remain because they cache source artwork or derived effects rather than screen-space level tiles.

## Revision 363 fractional-DPR editor alignment

Status: implemented and reproduced at DPR 1.1.

The remaining guide drift was not cave parallax. `resizeCanvas()` pre-scaled both editor contexts by `devicePixelRatio`, but the production game renderer already converts its static-view zoom into backing-pixel coordinates. Because the scene canvas had already acquired its 2D context and its backing size did not change again, the renderer inherited that DPR transform and scaled ordinary artwork a second time. The transparent authoring overlay was scaled once. At DPR 1 the error disappeared, which is why the first automated comparison missed it; at DPR 1.1 the mismatch increased with distance from the canvas origin.

Revision 363 leaves the production scene context at the identity transform and lets only the editor overlay map CSS coordinates into its backing store. `canvas-renderer.js` also resets its 2D context to identity at the start of every Canvas frame so any future embedding surface cannot leak a CSS/DPR transform into backing-pixel drawing. The Playwright diagnostic now defaults to a fractional 1.1 device scale and records the stage context matrix; a non-identity production transform is a failure.


## Revision 364 Android presentation-buffer stability

Android Chrome and Opera were reported to show intermittent white garbage in the Canvas2D renderer and black flashes in the WebGL2 renderer even though the same build remained stable on desktop. The two production paths shared the low-latency `desynchronized: true` context hint. That hint permits the browser to decouple canvas presentation from ordinary DOM compositing and can expose a partially reset, still-rasterizing, or discarded buffer on affected mobile compositor/driver combinations.

Revision 364 removes desynchronized presentation from both production Canvas2D and WebGL2 contexts. Rendering remains driven by `requestAnimationFrame`, but completed frames are handed back through the normal browser compositor boundary. The fixed game shell now owns the CSS size and the stage fills it with `width: 100%; height: 100%` rather than independently resolving `100vw` and `100vh`. The renderer also retains its last valid CSS dimensions when a mobile fullscreen or browser-chrome transition briefly reports a zero-sized canvas, avoiding a destructive 1×1 backing-store reset.

This is a targeted fix based on the shared Android failure boundary. Desktop automated tests can verify context options, sizing ownership, and transient-zero protection, but final confirmation of the driver-specific flashes still requires a physical Android retest in both Canvas2D and WebGL2 modes.


## Revision 365 modular human enemy atlas assembly

Status: implemented as a first-pass content assembly.

The new `ct_atlas_enemy_030.png` sheet now has a matching `ct_atlas_enemy_030.json` atlas manifest and a `ct_human_parts_030.json` modular-parts manifest. Bodies are exported as one shared 555×1155 extraction cell and the retained heads are exported as one shared 468×397 extraction cell so future body/head swapping can reuse consistent pivot-relative geometry. The problematic original top-right head was intentionally dropped from the shared variant list, leaving 17 clean head variants.

Revision 365 also assembles the first human enemy using the top-left body and top-left head, plus the shared limbs and sword. `ct_rig_enemy_030.json`, `ct_char_enemy_030.json`, and cloned baseline melee animations now define a first-pass `enemy_030` / **Human Raider** entry in `ct_enemies_001.json`. The new `devel/build_enemy_030_assets.py` script regenerates the atlas/parts/rig/character/animation JSON from the single atlas sheet.

This is intentionally a content-foundation revision rather than a final gameplay balance pass. `enemy_030` is available in the enemy catalog, but it is not yet added to `level-generator-enemies.json`; automatic spawn weighting and any rig fine-tuning can happen once more human variants are assembled from the same atlas.


## Revision 366 Human Raider project discovery fix

Status: implemented.

The first Human Raider content existed in revision 365, but Puppet Forge's manually maintained known-project list still ended at enemy 020. As a result, `enemy_030` did not appear in the Character Editor dropdown. The URL field also accepted only a character-definition JSON, so entering the otherwise valid `assets/ct_atlas_enemy_030.json` atlas manifest failed before it could reach the matching character project.

Revision 366 adds **Enemy 030: Human Raider** to the Puppet Forge dropdown and known-project map. The URL loader is now a project-JSON loader: it accepts a character definition directly, or infers the matching `ct_char_*` definition from a `ct_rig_*` or `ct_atlas_*` manifest in the same directory. The Canvas renderer's fallback preload list also includes `ct_char_enemy_030.json`, while normal game/editor startup continues to prefer catalog-derived character URLs.


## Revision 367 Human Raider animation retargeting

Status: implemented.

The user-authored `ct_rig_enemy_030.json`, corrected `ct_anim_enemy_030_idle.json`, and Human Raider catalog settings are now authoritative. In particular, the revised rig supplies the corrected arm/head pivots and draw order, while the idle clip supplies the canonical per-part placement, rotation, and scale baseline. The catalog retains the tuned `renderOffsetY: 34` needed to place the assembled human correctly in gameplay.

The walk, attack, hurt, and death clips have been retargeted onto that idle baseline rather than retaining the original Skeleton Guard setup dimensions. For each part, positional and rotational motion remains the same delta curve as before, while scale changes are preserved proportionally around the corrected idle scale. Every non-idle clip now begins with the same transform and scale as the corrected idle pose, preventing part-size and pivot jumps when animation slots change.

`devel/retarget_enemy_030_animations.py` records this operation as a repeatable content-authoring step. `devel/build_enemy_030_assets.py` no longer overwrites the user-tuned rig, idle, or enemy catalog during atlas regeneration; it preserves those authoring files and only retargets the derived non-idle clips.


## Revision 368 Human Raider walk, hitbox, attack, and death refinement

Status: implemented.

Revision 368 adopts the user-authored `ct_anim_enemy_030_walk.json` unchanged and keeps the existing user-authored idle clip untouched. The Human Raider collision box in `ct_enemies_001.json` is corrected from 74×166 to 45×118.

The attack and death clips are rebuilt from the tuned idle/walk pose instead of mechanically reusing the Skeleton Guard transforms. The attack remains a 0.46-second overhead sword chop and places the visible impact at the gameplay hit time of 0.35 seconds, with a complete return to the canonical pose at the end. The death keeps the Skeleton Guard's useful idea of releasing the sword, but replaces the loose part scatter with a more coherent backward collapse and grounded final pose.

Atlas regeneration and the default retarget helper now preserve authored idle, walk, attack, and death files. The retarget helper defaults only to the remaining hurt clip so future atlas rebuilds cannot silently erase animation fine-tuning. The level-generator catalog now also carries an explicit, effectively dormant `enemy_030` entry at maximum difficulty, satisfying the one-entry-per-enemy data contract without placing the still-being-tuned Human Raider in ordinary generated caverns.


## Revision 369 parent pivot constraints in Puppet Forge

Status: implemented as a deliberately small editor aid.

Puppet Forge can now pin a rig part's existing pivot to a normalized point on one parent part. The constraint is stored on the child in the rig JSON, with no separate parent anchor registry. The first implementation is positional only: parent rotation and scale move the socket location, while the child keeps independently authored rotation and scale.

Constrained X/Y controls are read-only. Dragging the constrained part moves its cyan parent point rather than creating child position keys, while corner dragging continues to author rotation. Parent choices are cycle-safe, and applying rig JSON rejects missing parents or circular chains.

The runtime format is unchanged. Animation JSON refresh and download adaptively bake the editor constraint into ordinary X/Y tracks with a 0.25 source-pixel error target. No constraint has been added to the Human Raider rig automatically, so the user-authored idle and walk files remain byte-for-byte unchanged. The new aid is available for the author to apply selectively to the head, arms, or weapons.


## Revision 370 modular human frame-swap validation

Revision 370 validates the intended modular-human workflow by creating `enemy_031` / **Human Raider II** from the user-updated Enemy 030 rig and clips. The new enemy has its own character and rig JSON, but the rig differs from Enemy 030 only by selecting `body_01` and `head_01` instead of `body_00` and `head_00`. It keeps the same shared limbs, sword, pivots, parent constraints, offsets, scales, and draw order.

`ct_char_enemy_031.json` deliberately references the existing Enemy 030 idle, walk, attack, hurt, and death files rather than duplicating them. This confirms that animations operate on logical part names and can be reused across atlas-frame variants when replacement body/head frames have identical dimensions and aligned pivots. `devel/build_human_enemy_variant.py` now automates this validation, creates the variant rig/character/catalog records, checks frame compatibility, and records the assembly in `ct_human_parts_030.json`.

Enemy 031 is available in Puppet Forge, the runtime fallback character list, and the enemy catalog. Its procedural-generator metadata remains dormant alongside Enemy 030 until the modular human family is ready for ordinary generated-level weighting.


## Revision 371 cached character-part Color Exchange

Status: implemented as a reversible first pass.

Rig parts may now carry an optional `colorExchange` object using the same channel-threshold convention and additive colour-difference operation as GEGL/GIMP Color Exchange. The source and destination colours are RGB bytes; red, green, and blue thresholds each use the GIMP `0.0..1.0` range. A zero threshold accepts only the exact channel value, while `1.0` accepts the complete channel range. Matching pixels receive the destination-minus-source RGB offset with clamping, and alpha is preserved exactly.

`src/shared/color-exchange-data.js` owns normalization, cache keys, and byte-buffer colour mathematics. `src/presentation/sprite-color-exchange.js` owns one-time Canvas processing. Runtime character loading builds and caches treated part canvases during project preparation; ordinary Canvas2D and WebGL drawing then use the cached sprite rather than scanning pixels per frame. Treated WebGL parts deliberately upload their generated canvas instead of sampling the original atlas rectangle.

Puppet Forge exposes a per-part Color Exchange checkbox, source/destination colour controls, and independent red/green/blue threshold fields. Changing the modifier rebuilds only the in-memory rig-part preview and serializes the modifier in rig JSON. Enemy 031 now applies the screenshot-sampled `#e0945e` to `#8c5126` exchange to both shared arms with all thresholds at `1.0`; Enemy 030 and the atlas remain unchanged.

This revision does not introduce a general filter stack, per-frame processing, shader-only treatment, or atlas expansion. If later art exposes weaknesses in full-range exchange, the existing three thresholds can be tuned without changing the data model.

## Revision 372 enlarged modular humans

Status: implemented.

Enemy 030 and Enemy 031 now use 50-percent larger defaults. Their catalog hitboxes grow exactly from 45×118 to 67.5×177, their character render scale grows from 0.82 to 1.23, and the grounded vertical artwork offset grows from 34 to 51 so the larger figures remain aligned with the same foot position. The Enemy 030 asset builder carries the same defaults so atlas regeneration cannot silently restore the smaller proportions.

Validation note: the supplied revision 371 FULL archive is missing `devel/enemy-hit-effect-lab.html`, `devel/enemy-hit-effect-lab.js`, `level-editor-2.html`, and `src/tools/level-editor-2.js`, although its packaging rules or tests still require them. Revision 372 does not fabricate replacements for those unavailable files; the focused modular-human regression shard passes, while the complete release gate remains blocked by the incomplete input archive.



## Revision 373 accepted long-form jukebox catalog

Status: implemented.

The game soundtrack catalog is replaced by the 18 tunes marked `accept` in the exported selector JSON. Each entry retains its chosen historical engine version and saved whole-octave shift. The two-to-five-minute developed pass, opening-once loop point, repeating-body duration, and section count are measured from the exact selected engine. The Level Editor now offers silence plus only those 18 accepted choices and shows the selected sound style and octave beside each title. Existing levels keep their tune IDs and migrate to music metadata version 2.

Playback now uses the exact version 2, 3, and 4 engines embedded in the long-form selector rather than approximating their arrangements with the game's former short oscillator scheduler. Hidden same-origin `srcdoc` frames preserve local-file compatibility and expose the selector's own `selectTune`, `setOctave`, `setVolume`, `play`, `pause`, and `stop` API. Browser pause/focus muting uses the active engine pause control; resuming invokes the same jukebox play path and therefore begins the selected opening again; level changes stop the previous engine, configure the new accepted version/octave, and begin its opening-once pass.

Regression coverage verifies the exact accepted ID order, representative version/octave choices, long-form timing, level schema migration, hidden-engine host wiring, and director volume/mute behavior. The exact selector export is packaged at `assets/music/ignatius_music_selections.json`, and `MUSIC_SOURCES.md` records the catalog and implementation provenance. Browser verification found that the export timing objects repeat generic values for each version rather than the selected tune's live values; this is fixed in the game catalog by querying the exact embedded engine for every accepted tune.

Revision 373 validation: the focused synthesized-music regression passes, and a headless-browser smoke test loaded the exact version 2, 3, and 4 engines, verified live tune selection, chosen octave, playback state, and tune-specific full-pass/loop timing. Game test shards 2–4 pass. The complete shared/game release gate remains blocked only by four files already absent from the supplied revision 372 archive: `devel/enemy-hit-effect-lab.html`, `devel/enemy-hit-effect-lab.js`, `level-editor-2.html`, and `src/tools/level-editor-2.js`.


## Revision 374 idempotent gameplay music unlock

Status: implemented.

Revision 373 kept permanent capture-phase `keydown` and `pointerdown` listeners as browser-autoplay fallbacks. A bug in the new jukebox music director treated every one of those ordinary gameplay gestures as a fresh playback request, so walking, jumping, firing, or clicking called the embedded engine's `play()` method again and restarted the long-form arrangement from its opening.

Revision 374 fixes the bug at the music-director boundary. `unlock()` now returns immediately when the selected engine/tune/octave configuration is already playing, and simultaneous unlock requests for the same configuration share one in-flight start promise. Deliberate playback transitions still work: tune changes stop and reconfigure, while pause, mute, and zero-volume suspension mark playback inactive so a later resume invokes the jukebox play path and begins the opening again as documented.

Validation: the focused synthesized-music regression passes and now asserts that repeated gameplay unlock requests do not add engine `play()` calls. A separate delayed-host smoke test also verifies that concurrent unlock requests coalesce into one configure/play sequence and that explicit pause/resume still produces a second play. The complete shared gate remains blocked by the same four files absent from the supplied project archive: `devel/enemy-hit-effect-lab.html`, `devel/enemy-hit-effect-lab.js`, `level-editor-2.html`, and `src/tools/level-editor-2.js`.


## Revision 375 cosmetic Background with reciprocal parallax

Status: implemented.

The existing level-placement value `decorBack` is formalized as the user-facing **Background** layer. Level-owned Background artwork is guaranteed to render before terrain and actors even when its authored stack order is high. It is cosmetic by construction: level conversion and atlas-manifest hydration force collision off and discard moving-platform behavior. Entity-local character parts that use the internal `decorBack` role are explicitly excluded from this global layer and remain attached to their actor.

Foreground remains the user-facing name for `caveForeground`; perimeter refers only to the automatic spline decoration process. The Foreground default is adjusted from 1.10 to 1.08. `level.layerVisuals.background.parallax` defaults to the exact reciprocal, `1 / 1.08` (`0.925925…`), producing a balanced slower Background drift. Authors may set either factor to `1.0` for no relative movement.

The runtime and Level Editor now share `computeWorldParallaxOffset`, anchored at the technical world-bounds centre. The editor exposes level-wide Background parallax, friendly layer labels, and direct Background/Foreground placement tools. Background placement preview, hit testing, dragging, selection outlines, labels, and marquee selection invert the same offset used by gameplay, preserving ordinary authored world coordinates.

Validation covers shared defaults, neutral factor 1.0, reciprocal offset direction, level schema values, Background/main/Foreground cache partitioning, entity-local `decorBack` isolation, direct editor placement controls, cave mask behavior, and Canvas world-visual infrastructure.


## Revision 376 unified new-asset layer selection

Status: implemented.

The Level Editor no longer presents separate placement tools for Background and Foreground. The Asset palette now owns one explicit **Layer for new assets** dropdown with **Foreground**, **Terrain**, and **Background**, while the toolbar retains one **Place asset** tool. Selecting an asset card enters that same tool without changing the chosen layer.

Preview and placement share one layer-aware path. Foreground points are converted through the cave parallax inverse, Background points through the reciprocal Background inverse, and Terrain points remain ordinary authored world coordinates. Background and Foreground keep their existing inert collision/platform rules, Foreground keeps its cave-decoration scale and treatment defaults, and the perimeter spline, point editing, population, and generated-art controls remain unchanged.


## Revision 377 Puppet Forge MP4 motion reference

Status: implemented.

Puppet Forge now supports a temporary MP4 reference video behind the rig for manual rotoscoping and poor-man's motion capture. Authors may load one local MP4 and set video-time offset, X/Y alignment, independent width and height, opacity, visibility, and source looping. The animation playhead remains authoritative, so scrubbing, key stepping, pause/play, preview speed, and animation looping select the corresponding video moment.

Playback uses a muted local object URL and periodically corrects drift against the editor playhead. Paused and scrubbed states seek directly. The video draws before the rig in the same preview zoom, pan, facing, and local-ground coordinate system. Numbered image bundles are deliberately excluded to keep the workflow and synchronization model small and clear.

The reference video is strictly editor-session state. It is not serialized into character, rig, atlas, animation, enemy-catalog, level, or game data; it does not touch local storage or project dirty flags; and it is not packaged as an asset. `src/tools/character-editor/reference-plate.js` contains only the pure video-time, fit, and display-normalization helpers.

Validation: the focused MP4-reference regression covers video-time wrapping and clamping, aspect-ratio fit sizing, display normalization, MP4-only input, timeline ownership, preview-speed synchronization, behind-rig draw order, object-URL lifecycle, and the non-serialization contract. The complete two-shard editor gate passes all 24 tests. A live Chromium run was attempted with both loopback HTTP and `file:` navigation, but this environment blocks both with `ERR_BLOCKED_BY_ADMINISTRATOR`; module syntax and headless editor contracts were therefore used instead. This revision also updates one stale test assertion that still expected Level Editor revision 374. The complete release gate remains blocked by the same four files absent from the supplied project archive: `devel/enemy-hit-effect-lab.html`, `devel/enemy-hit-effect-lab.js`, `level-editor-2.html`, and `src/tools/level-editor-2.js`.

## Revision 378 Mountain King melody continuity

Status: implemented.

The orchestrated version of **In the Hall of the Mountain King** contained every encoded melody note in its primary cello-pizzicato voice, but its bassoon support copied only alternating notes plus the final long note. Long-form development then treated that bassoon line as ordinary accompaniment and could thin it further. The resulting uneven octave doubling made the melody's timbre jump between instruments and could be perceived as dropped notes.

Revision 378 keeps jukebox engine 2, the existing cello-pizzicato and bassoon instruments, all melody pitches and note starts, the tempo curve, octave selection, full-pass duration, and musical loop point. The bassoon now shadows every primary melody note at a lower gain, and the long-form builder preserves marked melody-support voices while continuing to thin ordinary accompaniment. This is a tune-specific orchestration repair, not an engine-version change.

Regression coverage decodes the packaged engine-2 source and requires full-note Mountain King support, protection from sparse accompaniment development, and absence of the former alternating-note copy. The wider release gate remains subject to the four developer files absent from the supplied project archive.

## Revision 379 harmonized layer visuals and softer Mountain King support

Status: implemented.

The Level Editor removes the obsolete **Canvas baseline** and **Editor 2 lab** links while retaining the baseline files for posterity. Level metadata now owns matching **Foreground** and **Background** groups. Each group exposes Parallax, Brightness, and Scale. Revision 379 initially represented brightness and scale as neutral layer multipliers; revision 381 supersedes that data shape by folding the existing Foreground treatment into the visible values. Foreground parallax defaults to `1.08`, and Background parallax defaults to the exact reciprocal. The cave window panel is narrowed to cave geometry, feathering, spline editing, and perimeter population. Generated perimeter artwork remains Foreground and therefore receives the same layer-wide visual settings.

The grouped `level.layerVisuals` record is authoritative. Runtime conversion bakes layer scale around every placement centre, carries Background brightness into its atlas rendering pass, multiplies Foreground brightness with any per-placement perimeter treatment, and mirrors the parallax values into the legacy Background and cave-window fields for compatibility. Editor rendering, culling, hit testing, dragging, and placement previews use the same scaled bounds and parallax transforms.

Mountain King remains jukebox engine 2 with the same cello, bassoon, notes, octave, tempo curve, full-pass duration, and loop point. Its complete octave-up bassoon support is reduced from gain `0.18` to `0.13` and receives a tune-specific darker cutoff plus slower attack, decay, and release. The intent is to keep the restored melody continuity while removing the hard, short high-register edge.


## Revision 380 retire the enemy-hit diagnostic laboratory

The enemy-hit browser laboratory has served its purpose and is now retired. Its HTML/module paths are forbidden from reappearing in compact packages, the packager no longer requires them, and the dedicated testbench contract plus manifest entry are removed. Production enemy-hit flashes and impact behavior remain under the normal Canvas/WebGL renderer and portable-simulation tests. This removes the stale missing-file release-gate failure without deleting any production effect implementation.


## Revision 381 make Foreground visual values truthful

The cosmetic-layer panel previously showed Foreground brightness and scale as `1` even though cave-decoration defaults still darkened each placement and authored it at 2× size. This was fixed immediately rather than leaving two competing visual systems. `level.layerVisuals` version 2 now exposes the complete Foreground treatment. Existing shipped levels preserve their exact on-screen rectangles and brightness while showing `0.4 / 2.0` for level 001 and `0.46 / 2.0` for level 002.

Legacy import folds cave-decoration brightness and scale into the visible Foreground controls, converts stored rectangles back to base dimensions around their original centres, and removes per-placement brightness. New manual and generated Foreground records are base-sized. The cave generator still uses effective size for density, protection, and coverage calculations. The explanatory paragraph beneath the controls is removed; native tooltips explain each field without consuming inspector height.

## Revision 382 harmonized Level Editor sidebar

Status: implemented.

The Level Editor right sidebar now follows one deliberate authoring sequence: **Level**, **Metadata**, **Layers**, **Perimeter**, **Colormap**, **Generator**, **Autospawner**, **Navigation graphs**, **Entity palette**, **Asset palette**, **Placed objects**, **Selected object**, and finally **View**. The previous long-form headings are shortened to reduce visual noise while preserving every control and its existing behavior.

Cosmetic-layer controls are no longer nested under Metadata. Foreground and Background Parallax, Brightness, and Scale now occupy their own adjacent **Layers** panel immediately after Metadata. The **Perimeter** panel remains solely responsible for cave-window geometry, spline editing, feathering, gradient behavior, and automatic perimeter decoration. No level schema or runtime behavior changes in this revision.

Validation adds a source-contract regression for the exact panel order, concise headings, dedicated Layers panel, and retirement of the former sidebar labels.

## Revision 383 stable layer controls and scaled Foreground selection

Status: implemented.

The Level Editor was incorrectly feeding the six visible layer controls back through the legacy Foreground migration path without a schema version. Every persistence-triggering action therefore multiplied Foreground brightness by the old cave brightness and Foreground scale by the old cave scale. Repeated perimeter population or clearing drove the visible controls toward their clamps, typically brightness `0.05` and scale `5`. This bug was fixed by committing editor-authored controls as canonical `level.layerVisuals` version 2 values. Revision 384 then removes the old cave-brightness/scale migration entirely; bundled levels are patched rather than translated at load time.

Foreground asset guides and selection outlines also used the authored base rectangle while rendering used the layer-scaled rectangle. Both now use `displayedLayerPlacement`, including its layer scale, parallax offset, centre, and rotation. Hit testing and marquee selection already used this path and remain unchanged. Populate perimeter and Clear generated now change generated records only; they do not alter Foreground or Background parallax, brightness, or scale.


## Revision 384 current-level-only schemas and legacy-level cleanup

Status: implemented.

The project now has an explicit current-level-only policy. Every supported campaign level and test fixture is bundled with the repository, so future schema changes must patch those files atomically instead of teaching runtime or editor code to understand historical formats. `AGENTS.md`, the developer manual, and architecture notes now prohibit old field aliases, compatibility mirrors, import migrations, retired entity translations, and strip-on-load branches for level data.

The remaining concrete old-level support found by the audit is removed. Cosmetic layer visuals are canonical only in `level.layerVisuals`; cave-window and generator records no longer strip or translate retired presentation fields; moving platforms accept only the current scalar fields; and the unused `monsterSpawn` and generic `trigger` records are removed from the Level Editor palette because no bundled level uses them and portable runtime has no behavior for them. All bundled levels and the stress fixture are current-schema records.

Obsolete migration tests are removed or converted into negative source-contract guards. Tests now prove canonical bundled data and verify that retired migration code, mirrored visual fields, retired cavern profiles, and unsupported palette records remain absent. Non-level compatibility, including browser settings and retained entry-page redirects, is intentionally outside this rule.


## Revision 385 perimeter-owned cave fade

Status: implemented.

Foreground frames previously cached an outward-to-black linear gradient using per-placement `foregroundOutwardX`, `foregroundOutwardY`, `foregroundFadeStart`, and `foregroundFadeEnd`. That treatment followed the sprite when it was moved away from the perimeter, and manual Foreground placement could receive the same baked darkness. The result looked useful at the cave edge but incorrect anywhere else.

Revision 385 removes the sprite-local gradient and all four placement fields from the generator, editor, runtime conversion, shipped levels, and stress fixture. `foreground-sprite-treatment.js` now caches only brightness and saturation. The existing cave-window mask remains after Background, actors, and Foreground in the render order and continues to provide the same broad organic transparent-to-black handover in world space. Assets at the perimeter still fade into darkness, while moved assets immediately render without a gradient attached to them. Tests guard both the clean sprite treatment and the absence of the retired placement fields.


## Revision 386 physical grounded character shadows

Status: implemented.

The Human Raider's low shadow was diagnosed before changing its catalog dimensions or rig. Its collision feet were already correct. The renderer computed `characterArtworkOrigin(enemy)` for the composited rig and then reused that shifted point for the shadow. Human enemies currently need `renderOffsetY: 51` to align their artwork with their hitbox, so the shadow inherited the same 51-unit downward shift. This was an origin-ownership bug, not a malformed animation, platform, collision body, or level placement.

The audit found two related defects in the same subsystem. Player shadows were drawn unconditionally, and ground-enemy shadows were suppressed only for `locomotion: "flying"`, not while hunter jumps, drops, falls, or airborne deaths were active. The old defeated-enemy promise was also incomplete: Canvas `drawShadow()` replaced the parent global alpha with `0.26`, while WebGL queued a fixed shadow alpha, so neither backend reliably multiplied the shadow by corpse fade. These were fixed immediately rather than papering over Human Raider data.

`src/presentation/actor-shadow.js` now owns three narrow presentation operations: resolve the physical foot point directly from actor `x / y`, classify ground contact from `player.onGround` or `enemy.airborne` while rejecting flying locomotion, and advance opacity linearly toward the contact target over 0.2 seconds. The renderer updates this state for every character actor during frame preparation, including off-screen actors, then uses the same values in Canvas and WebGL. Artwork offsets continue to move only artwork. Grounded idle, walking, running, attacking, hurt, and grounded death poses retain a shadow; jumping, falling, hovering, flying, and airborne death poses fade it out. Landing fades it back in. Corpse opacity multiplies the contact fade in both backends.

Regression coverage verifies the independent artwork and ground origins, the exact 0.2-second transition, player/enemy/flying contact classification, absence of artwork-origin shadow calls, and corpse-alpha multiplication. No level data, legacy handling, physics state, or character assets changed.

## Revision 387 canonical runtime Foreground parallax

Status: implemented.

Foreground parallax worked in the Level Editor but not in gameplay because the two surfaces no longer read the same owner. Revision 384 correctly removed the retired `caveWindow.parallax` field from level data, and the editor already read `level.layerVisuals.foreground.parallax`. Runtime level conversion briefly copied the grouped value onto `state.world.caveWindow`, but browser presentation synchronization passed the renderer a separately normalized cave-window record made from the raw level. That normalization strips unsupported fields. The renderer then asked its cave-window copy for parallax, received `undefined`, and the generic world-parallax helper fell back to neutral `1.0`. Background continued to work because its pass read `state.world.layerVisuals.background.parallax` directly.

The fix removes the duplicate runtime cave-window property rather than restoring another mirror. `CanvasGameRenderer.prepareFrame` now normalizes `state.world.layerVisuals.foreground.parallax` once and stores one frame value. Foreground spatial queries, Canvas drawing, WebGL drawing, the Canvas cave mask, the geometric WebGL cave mask, and its Canvas fallback all use the resulting offset. `cave-window-mask.js` accepts the factor explicitly, normalizes it through `level-layer-data.js`, and includes it in the reusable mask key so changing the Layers control cannot reuse a mask rendered at the old offset. Regression coverage proves the renderer no longer reads `this.caveWindow.parallax`, runtime cave geometry has no parallax mirror, and custom Foreground values invalidate mask caching.

## Revision 388 readable wrapping debug panel

Status: implemented.

The in-game debug panel no longer treats every diagnostic line as an unbreakable strip. Its monospace text is reduced from 12px to 10px, preserves authored line breaks while wrapping long renderer and gameplay-stat lines, and may break unusually long tokens when necessary. The existing 46vh ceiling remains so the panel cannot consume the whole viewport, but overflow now scrolls instead of clipping the remaining diagnostics. Pointer and overscroll handling are enabled only on the visible debug card so the developer can reach all output without changing the underlying debug data or update cadence.
