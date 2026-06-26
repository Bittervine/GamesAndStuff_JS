# Ignatius Rocketfrock Plan

## Project Layout

The project uses directory context instead of repeating `IgnatiusRocketfrock_` in every filename.

```text
IgnatiusRocketfrock_JS/
├── index.html
├── game.html
├── asset-editor.html
├── level-editor.html
├── character-editor.html
├── renderer-smoke.html
├── src/
│   ├── core/
│   │   ├── enemy-navigation.js
│   │   └── simulation.js
│   ├── browser/
│   │   ├── browser-input.js
│   │   └── game-bootstrap.js
│   ├── presentation/
│   │   ├── canvas-renderer.js
│   │   ├── character-runtime.js
│   │   └── level-color-map-cache.js
│   ├── shared/
│   │   ├── actor-geometry.js
│   │   ├── animation-data.js
│   │   ├── cave-window-data.js
│   │   ├── level-color-map-data.js
│   │   └── level-transform.js
│   └── tools/
│       └── character-editor/
│           ├── animation-editor.js
│           ├── atlas-editor.js
│           ├── character-dirty-state.js
│           ├── character-editor-view.js
│           ├── character-project.js
│           └── dopesheet-data.js
├── tests/
│   └── testbench.mjs
├── assets/
├── devel/
├── package.json
├── AGENTS.md
├── ARCHITECTURE.md
├── IMPLEMENTATION_CHECKLIST.md
└── PLAN.md
```

`package.json` declares the browser-style ES-module format and provides the dependency-free `npm test` command. `ARCHITECTURE.md` is the authoritative directory, dependency, classification, and JavaScript-to-C++ parity map. The root HTML pages remain stable browser entry points. Their large inline editor applications should be extracted one editor at a time into uniquely named modules such as `level-editor-app.js`; do not use several ambiguous files all named `app.js`.


## Near-Term Cave-Window Authoring Track

The immediate development track is a cave-perimeter and foreground presentation system that can be built from existing atlas art before any new falling-tree asset is required. The visual premise is a window cut through a much larger black rock mass. A closed spline describes the opening, perimeter decorations feather outward into black, and selected stalagmites or other formations may be drawn in front of Ignatius to create depth.

The perimeter is completely inert. It is not a collision boundary, not a platform generator, not a navigation surface, and not a substitute for the playing-area layer. Floors, walls, ceilings, hazards, and platforms remain explicitly authored gameplay geometry. A platform can sit just behind the lower perimeter so Ignatius is partly occluded by foreground stalagmites, but gameplay geometry placed far outside the visible opening should be flagged as confusing authoring.

The foreground perimeter and its decorations should scroll with a subtle, configurable parallax offset relative to the playing area. Foreground placements are automatically non-colliding regardless of their atlas manifest. They are rendered darker and may be slightly desaturated, while the outward side of perimeter artwork fades to opaque black so sprite edges disappear into the implied unseen cavern.

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
* `src/shared/` contains engine-neutral data and mathematics used by multiple layers.
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

`src/shared/cave-window-decoration.js` adds deterministic arc-length placement around the closed spline. The generator classifies each sample from the cave's inward normal, choosing tagged stalagmites/rocks/floor pieces for lower edges, stalactites/ceiling pieces for upper edges, and wall/pillar pieces for sides. Seed, spacing, scale, and brightness are stored under `caveWindow.decoration`. Generated objects are explicit level placements marked `generatedBy: "cavePerimeter"`, so **Populate perimeter** safely replaces only prior generated art while **Clear generated** leaves manual foreground work intact.

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

The next gameplay-safety work remains crushing/depenetration for actors trapped by kinematic platforms, followed by deriving Ignatius's lethal out-of-bounds rule from the cave full-black guide. Flying/bomber code should stay in the portable core for now; extract a dedicated enemy-flight module only when another aerial archetype proves the interface reusable.
