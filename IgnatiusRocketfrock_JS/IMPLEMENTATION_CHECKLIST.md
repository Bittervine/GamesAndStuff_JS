# Ignatius Rocketfrock Implementation Checklist

This document augments `PLAN.md`.

`PLAN.md` describes the game design. This document describes the implementation order and provides checkable development tasks.

The old Phase 1 physics arena is complete enough to serve as the mechanical foundation. Character tooling and the first enemy pipeline are operational, so the active gameplay target is now **Phase 4: Combat, Destructibles, and Reactive Objects**, while unfinished Phase 2 animation-authoring work remains on the backlog.

## Always Remember: Responsive Viewport Scaling

The browser game uses a shared virtual viewport. On screens narrower than the mobile minimum width, the whole canvas render is scaled down, while gameplay continues in virtual game coordinates.

* [ ] When adding new drawing code, confirm it uses the shared render transform / virtual viewport system rather than its own mobile scale.
* [ ] When adding new input code, confirm screen coordinates are converted into virtual canvas/game coordinates before gameplay or virtual joystick code uses them.
* [ ] Do not add separate per-sprite mobile scaling unless there is a deliberate special-case reason documented next to the code.
* [ ] Keep physics, collisions, particles, camera math, and level geometry in virtual game coordinates.

## Always Remember: Future C++ and Unreal Portability

The HTML and JavaScript game remains the reference implementation, but new gameplay work must preserve a clean path to an engine-neutral C++ core and a thin Unreal presentation adapter.

* [ ] Keep gameplay logic independent of DOM, Canvas, browser events, asset objects, audio objects, Unreal Actors, UObjects, Character Movement, and Chaos physics.
* [ ] Pass gameplay only normalized plain data, fixed `dt`, and an `InputFrame`.
* [ ] Keep gameplay coordinates X-right, Y-down, baseline-anchored, and radians-based.
* [ ] Use finite double-precision-compatible values and named collision tolerances.
* [ ] Use shared constants for gameplay states, entity kinds, event types, and collision kinds instead of scattered string literals.
* [ ] Do not add gameplay dependencies on renderer-owned manifests, PNG contents, editor DOM structures, or visual colour mapping.
* [ ] Keep presentation interpolation, particles, flashes, UI timers, and colour treatment from writing back into authoritative gameplay.
* [ ] Add or update headless tests whenever simulation update order, collision tie-breaking, or a shared schema changes.

## Always Remember: Source Organization

`ARCHITECTURE.md` defines the source classifications, dependency direction, and future JavaScript/C++ mapping.

* [ ] Put portable gameplay logic in `src/core/` and engine-neutral cross-layer helpers in `src/shared/`.
* [ ] Put browser startup and device adaptation in `src/browser/`, Canvas and visual runtime code in `src/presentation/`, and editor-only code in `src/tools/`.
* [ ] Use lowercase kebab-case and unique descriptive filenames; do not create several ambiguous `app.js`, `view.js`, or `model.js` files.
* [ ] Keep root HTML files as stable entry points and move reusable implementation into modules rather than adding more loose root JavaScript files.
* [ ] Update imports, HTML links, tests, `ARCHITECTURE.md`, `PLAN.md`, `IMPLEMENTATION_CHECKLIST.md`, and `AGENTS.md` whenever a module moves or changes architectural classification.
* [ ] Do not let `src/core/` import browser, presentation, or editor modules. The existing colour-map import is documented temporary debt to remove at the runtime-level checkpoint.

## Current Status

The project now has a working browser game loop, deterministic simulation layer, asset-atlas based level construction, atlas and level editor tools, atlas-derived collision lines and filled collision loops, detached rocket terrain impacts, health/fuel HUD, and headless tests. Revision 099 also places implementation modules under explicit core, shared, browser, presentation, and tool directories, with `ARCHITECTURE.md` serving as the dependency and future C++ parity map.

Revision 100 now provides the first destructible/reactive-world slice: an editor-placeable breakable crate with authoritative health/state, dynamic collision, rocket interception, state-authored visuals, destruction smoke, events, and serialization. Revision 101 adds the first ranged enemy variants, revision 103 corrects their semantic part identities and projectile presentation, revision 105 adopts the user's compact goblin rig/idle as the canonical animation foundation, and revision 106 makes Puppet Forge substantially faster to operate. The immediate gameplay direction is to keep widening enemy/reactive interactions, then generalize the reactive foundation into barriers and moving geometry such as a falling-tree bridge. Animation-authored projectile handoff is recorded as a dedicated future gameplay slice rather than being mixed into the editor ergonomics revision. In parallel, portability preparation should remove renderer-owned gameplay data and establish language-neutral schemas and parity fixtures before Phase 8 procedural generation expands the simulation surface.

## Phase 1: Completed Physics, Level, and Atlas Foundation

Goal: establish a playable and testable foundation for movement, rocket behavior, level loading, and atlas-based environment construction.

### Completed Foundation

* [x] Create `game.html` and main browser entry points.
* [x] Create `src/core/simulation.js` for deterministic simulation.
* [x] Create `src/browser/browser-input.js` for keyboard/gamepad input mapping.
* [x] Create `src/presentation/canvas-renderer.js` for state-driven rendering.
* [x] Create `src/browser/game-bootstrap.js` for orchestration and fixed timestep loop.
* [x] Create `tests/testbench.mjs` for headless and integration tests.
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
* [x] Support horizontal and vertical mirroring for placed atlas assets.
* [x] Support center-based rotation for placed atlas assets.
* [x] Apply the same placement transform to rendering, guide overlays, hit testing, and atlas-derived collision.
* [x] Pan the level editor canvas by holding the right mouse button.
* [x] After placing an atlas asset, keep it selected and automatically return to the Select tool for fine-tuning.
* [x] Store a selective level-wide environment-asset hue rotation in level JSON.
* [x] Cache recoloured atlas copies only when level colour-map settings change; never process pixels every frame.
* [x] Keep colour mapping visual-only so collision, entities, characters, transparency, and the level background are unchanged.
* [x] Create an asset tool for defining frames, nodes, and collision lines.
* [x] Make the hardcoded simulation arena explicitly a headless test fixture.
* [x] Remove large hardcoded level and atlas fallbacks from the runtime path.

### Phase 1 Rule Going Forward

The browser game should load real level and atlas files from `assets/`. It is acceptable for the game to fail loudly if `assets/level_001.json` or referenced atlas files are missing or invalid.

Hardcoded test data may remain only when it is explicitly used as a test fixture or blank editor starting state.

## Phase 2: Character Atlas, Rigging, and Animation Tooling

Goal: replace custom wizard body-part loading and hardcoded character posing with a data-driven character pipeline. This phase starts with Ignatius and must preserve the current wizard run animation as the visual ground truth.

### Phase 2 Design Rules

* [x] Load Ignatius from `ct_atlas_wizard_1.png` rather than individual body-part PNG files.
* [x] Use a separate asset manifest for character part frames.
* [x] Use a separate rig JSON to define how frames become a character body.
* [x] Use separate animation JSON files for reusable or character-specific motion.
* [x] Use a character definition JSON to assign a rig and animation set to a character.
* [x] Keep rendering resources outside `gameState`.
* [ ] Keep animation state in or derivable from `gameState` when it affects gameplay, replay, debugging, or deterministic state transitions.
* [ ] Keep character rendering data compatible with a later WebGL2 renderer.
* [x] Treat reusable animations as templates that can be duplicated and tweaked per character.
* [ ] Do not force every character to use every animation.

### File Format Targets

* [x] Create `ct_atlas_wizard_1.json` for frames inside `ct_atlas_wizard_1.png`.
* [x] Create `ct_rig_wizard_1.json` converted from the current wizard rig settings.
* [x] Create `ct_anim_wizard_run_1.json` that reproduces the current hardcoded run.
* [x] Create `ct_char_wizard_1.json` that maps gameplay animation states to the wizard rig and animation files.
* [x] Define a character asset manifest format that can later be shared with monsters.
* [x] Define a rig format with part IDs, frame IDs, parent anchors, pivots, offsets, scale, rotation, draw order, roles, and tags.
* [x] Define an animation format with duration, looping, tracks, keyframes, interpolation, and optional root motion flags.
* [x] Define a character format that maps animation states such as `idle`, `run`, `jump`, `fall`, `hover`, `launch`, `hurt`, and `attack`.

### Rig Roles and Retargeting Preparation

* [ ] Add optional rig roles such as `root`, `torso`, `head`, `leftArm`, `rightArm`, `leftLeg`, `rightLeg`, `leftWing`, `rightWing`, `hat`, and `weaponMount`.
* [ ] Allow non-humanoid rigs to map parts to broad roles where useful.
* [ ] Allow bats to classify wings as arm-like controls without pretending every bat animation is a humanoid run.
* [ ] Let each animation declare required and optional roles.
* [ ] Let each character explicitly choose which animations it uses for each gameplay state.
* [x] Support duplicated/forked animations so shared templates can become character-specific animations.

### Animation Data

* [x] Prefer keyframes over JavaScript expressions for the first animation system.
* [x] Support interpolation modes: `step`, `linear`, `easeIn`, `easeOut`, and `easeInOut`.
* [x] Support tracks for position, rotation, scale, and alpha.
* [ ] Add optional visibility tracks when the first animation actually needs them.
* [x] Support looped animations.
* [x] Support one-shot animations.
* [x] Support per-animation playback speed.
* [x] Support mirrored playback when the character faces left.
* [ ] Support paired limb helpers such as left/right copy, mirror, and phase offset.
* [x] Defer procedural modifiers until keyframed animation is stable.
* [ ] Later support procedural modifiers for beard, hair strands, robe edges, wings, dangling parts, and rocket bob.

### Generic Character Renderer

* [x] Create a generic character renderer that draws parts from atlas frames.
* [x] Remove direct dependency on individual wizard body-part image files.
* [x] Keep the existing canvas renderer working first.
* [x] Return a simple draw-command list that can later be used by WebGL2.
* [x] Draw character parts by atlas frame, transform, pivot, alpha, and draw order.
* [x] Support mirroring without duplicating art.
* [x] Support frame-local pivots.
* [ ] Support optional trim metadata if atlas-frame padding causes alignment drift.
* [x] Keep the mounted rocket or weapon as a rig part or equipment mount, not as a special renderer island.

### Wizard Migration

* [x] Create frame definitions in `ct_atlas_wizard_1.json` matching current wizard parts.
* [x] Convert current `wizard_rig_config.json` values into `ct_rig_wizard_1.json`.
* [x] Render the wizard from `ct_atlas_wizard_1.png` with no visible pose regression.
* [x] Remove the temporary run comparison path after parity was confirmed.
* [x] Verify draw order matches the old wizard renderer.
* [x] Verify pivots and offsets match the old wizard renderer.
* [x] Verify left/right mirroring matches the old wizard renderer.
* [x] Remove individual body-part loading only after the atlas version is visually equivalent.

### Wizard Run Ground Truth

* [x] Treat the current wizard run animation as ground truth.
* [x] Recreate the current hardcoded run as `ct_anim_wizard_run_1.json`.
* [x] Add a comparison mode that can overlay or toggle between legacy run pose and new keyframed run pose.
* [x] Sample the run cycle at 16 or 24 points and compare part transforms.
* [x] Tune keyframes until the new run is near pixel-perfect.
* [x] Preserve the current run timing and stride unless deliberately retuned.
* [x] Add a headless or browser-assisted regression test for sampled run-pose parity.

### Revision 056 Animation Baseline

The run clip is loaded through `ct_char_wizard_1.json`, validated by `src/shared/animation-data.js`, and sampled as rig-space keyframes. The old procedural run, comparison overlay, toolbar button, and <kbd>N</kbd> shortcut have been removed. `ct_anim_wizard_run_1.json` is now the sole ground-run source of truth.

`character-editor.html` now loads and edits mapped animation JSON. It provides playback, pause, loop, speed, scrubbing, stepping between authored key times, a per-part/per-property timeline, draggable key markers, exact key time/value/easing fields, add/delete/copy/paste operations, and animation JSON export. Shared mutation logic is tested through `src/tools/character-editor/animation-editor.js`.

### Character Project and Atlas Authoring

Complete this structural tool work before adding the larger set of wizard and monster animations. It prevents the editor from becoming a polished wizard-only special case.

* [x] Add a character-project selector that can switch between available character definitions.
* [x] Add a “New character” workflow that creates blank, consistently named atlas, rig, character-definition, and animation templates.
* [x] Allow the user to choose an atlas PNG, atlas JSON, rig JSON, character JSON, and animation JSON through explicit browser file pickers.
* [x] Retain URL-based loading for assets served beside the tool.
* [x] Support directory/project selection where the browser permits it, with ordinary multi-file selection as the portable fallback.
* [x] Track unsaved changes independently for atlas, rig, character definition, and each animation clip.
* [x] Add an atlas-parts mode that displays the selected PNG at pixel-accurate scale.
* [x] Allow drawing, selecting, moving, resizing, renaming, duplicating, and deleting atlas frame rectangles.
* [x] Validate frame rectangles for duplicate IDs, invalid dimensions, and pixels outside the image.
* [ ] Allow creating and deleting rig parts, then assigning each rig part to an atlas frame. Creation and frame assignment are implemented; deletion remains.
* [ ] Keep atlas-frame identity separate from rig-part semantics: rectangles identify reusable pixels; rig parts carry body roles, tags, pivots, anchors, and draw order.
* [ ] Add rig-part role and tag editing, including broad roles such as head, torso, left/right arm, left/right leg, wing, hat, and weapon mount.
* [ ] Add searchable optional frame labels for organization without treating them as gameplay roles.
* [ ] Add character-definition editing for rig references and animation-slot mappings.
* [x] Export atlas, rig, character definition, and animations individually.
* [ ] Provide a project-bundle export when practical.
* [ ] Add validation that reports missing files, missing frame references, duplicate part IDs, invalid pivots, and broken animation mappings before export.

### Revision 058 Character Workspace Baseline

`character-editor.html` can now load a known character project, an arbitrary character-definition URL, a browser-selected group of files, or a selected project directory where the browser supports directory picking. Local files remain in an in-memory workspace and their relative JSON references are resolved without requiring hardcoded wizard paths. Explicit pickers are available for the character definition, rig, atlas manifest, atlas PNG, and one or more animation files.

The “New character” workflow creates consistently named, mutually referenced atlas, rig, character-definition, and idle-animation templates. A placeholder root frame/part keeps the new project structurally valid until real atlas rectangles and rig parts are authored. Character and atlas JSON can now be applied, refreshed, and exported alongside the existing rig and animation exports. Shared project-template, classification, inventory, and path-resolution logic lives in `src/tools/character-editor/character-project.js` and is covered by the headless testbench.

The next tool slice is atlas rectangle authoring plus independent dirty-state tracking. Do not begin the larger wizard animation set until the editor can visibly own and edit the PNG frame definitions that those rigs depend on.

### Revision 059 Direct Animation Editing Baseline

Puppet Forge now has a combined `X, Y and Angle` animation property mode. Dragging inside the selected yellow part rectangle edits X/Y keys, while dragging a corner handle edits rotation. Direct manipulation pauses playback and creates missing transform keys at the current playhead from the sampled pose before applying the edit. Mouse-wheel zooms the preview around the pointer, with a Reset View control. Scalar numeric editing remains available for every property; typing now previews immediately and creates a key at an unkeyed playhead instead of snapping back.

### Revision 060 Rig Value Clarification

Puppet Forge now zooms the preview with the mouse wheel alone. The rig panel is labeled as base/setup data and explains that pivot and target height remain shared geometry, while setup offsets and base scale currently support procedural airborne poses and fallback rig setup. Data-driven clips author absolute X, Y, and scale values that take precedence during their playback.

### Revision 061 Atlas Authoring Baseline

Puppet Forge now has separate Rig/Animation and Atlas Parts workspace modes. Atlas Parts displays the configured PNG in image-pixel coordinates: at 100% view zoom, one image pixel is one preview-canvas coordinate. Empty-space drags draw new rectangles, rectangle interiors move frames, selected corner handles resize them, and Shift-drag or middle-drag pans the image. Frames can also be selected numerically, renamed, duplicated, deleted, and validated for invalid dimensions, out-of-image bounds, exact duplicate rectangles, and broken rig references. Frame renaming updates atlas objects and any rig parts that reference the old frame ID.

Character, atlas, rig, and animation documents now have independent dirty states. Multiple edited animation slots remain cached in memory while switching clips, and downloading one JSON document marks only that document as saved. Project reloads warn before discarding unsaved work.

The next structural slice is rig-part creation/deletion, frame assignment, draw-order editing, and role/tag authoring. Complete that before migrating the remaining wizard airborne animations.

### Revision 063 Skeleton Project and Rig Assignment Baseline

Puppet Forge now lists both Ignatius Rocketfrock and Enemy 001: Skeleton Guard in the known-project selector. Atlas Parts mode can promote the selected frame, or every currently unassigned frame, into rig parts. The first real part removes the blank placeholder; loaded animation documents receive matching default transform tracks so the new part appears immediately in Rig and animation mode instead of remaining an atlas-only rectangle.

The skeleton project now uses semantic atlas frame IDs, a complete eight-part rig, and an editable idle animation. Its character definition points to the correct idle filename. Atlas 002 and Atlas 003 now contain cyan frame rectangles for every alpha-isolated visual asset and closed blockable collision traces generated from each sprite silhouette.

The remaining rig-authoring work is deletion, frame reassignment, draw-order controls, role/tag editing, and direct pivot editing.

### Revision 064 Skeleton Equipment and Walk Baseline

The Enemy 001 Skeleton Guard has an authored back-to-front layer order plus editable idle and walk clips. Revision 077 preserves the user's revised rig and animation data under `ct_anim_enemy_001_walk.json` and the other numbered enemy filenames.

The remaining rig-authoring work is still deletion, frame reassignment, role/tag editing, and direct pivot editing.

### Revision 065 Draw-Order Controls

Puppet Forge now provides **To Back** and **To Front** buttons in the Base rig / setup values panel. They move the selected rig part to the first or last position of the shared back-to-front `drawOrder`, refresh the preview and rig JSON immediately, preserve the selection, and mark only the rig document dirty.

### Revision 084 Animation Metadata and Duplication

Puppet Forge now edits clip metadata directly: animation ID, duration, loop flag, mirrorability, idle threshold, base and movement playback cadence, and maximum speed ratio. Duration cannot be shortened past the final existing key. The **Duplicate current** workflow deep-copies the selected animation, creates a stable filename from the character ID and requested slot, adds the slot to the in-memory character definition, and marks both resulting documents as changed for individual download.

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

* [x] Create `character-editor.html`.
* [x] Select which character project to edit.
* [x] Create a new character project from blank templates.
* [x] Load the wizard character atlas image from its configured project URL.
* [x] Load the wizard character atlas JSON from its configured project URL.
* [x] Load the wizard rig JSON from its configured project URL.
* [x] Load the wizard animation JSON from its configured project URL.
* [x] Load the wizard character definition JSON from its configured project URL.
* [x] Choose arbitrary PNG and JSON files through browser file selection rather than requiring hardcoded paths.
* [ ] Provide tabs or modes for project, atlas parts, rig, animation, preview, validation, and export.
* [x] Show a rig preview canvas.
* [x] Allow click-and-drag editing of animation part X/Y position and rotation.
* [ ] Allow click-and-drag editing of rig pivots, offsets, and anchors.
* [x] Provide exact numeric fields for all important rig values.
* [x] Provide draw-order controls with selected-part **To Back** and **To Front** actions.
* [ ] Provide part role/tag editing.
* [x] Provide animation playback controls: play, pause, loop, frame step, speed, and scrubber.
* [x] Edit animation ID, duration, loop flag, mirrorability, idle threshold, playback cadence, and maximum speed ratio.
* [x] Provide a timeline with keyframes.
* [x] Allow adding, moving, deleting, copying, and pasting keyframes.
* [x] Allow duplicating an animation.
* [ ] Allow copying a pose and pasting it mirrored.
* [ ] Allow paired-limb phase offset helpers.
* [ ] Show ghost previous/next poses while animating.
* [x] Remove the no-longer-needed legacy comparison mode after run parity was accepted.
* [x] Export atlas, rig, animation, and character JSON individually. Project-bundle export remains a later convenience.
* [ ] Keep the tool pleasant enough for long manual tuning sessions.


### Revision 085 Generic Runtime Characters

* [x] Add a shared runtime loader for character, rig, atlas, image, and animation files.
* [x] Normalize arbitrary rig part names and back-to-front draw order without wizard assumptions.
* [x] Generate Canvas 2D draw commands from atlas frames, pivots, pose transforms, alpha, and facing.
* [x] Load `enemy_001` alongside Ignatius without adding enemy AI to the renderer.
* [x] Accept data-authored static `characterEnemy` entities with character ID, animation slot, facing, and scale.
* [x] Keep gameplay behaviour outside the runtime character loader and renderer.
* [x] Add `enemy_001` to the Level Editor palette and implement simulation-owned idle/walk behaviour.

### Phase 2 Completion

* [x] The wizard renders from `ct_atlas_wizard_1.png` and no longer needs individual body-part PNG files.
* [x] The wizard run animation is reproduced by data-driven animation with near pixel-perfect parity.
* [ ] Jump, fall, hover, launch, idle, and landing poses are animation data rather than renderer-specific hardcoding.
* [x] The character tool can edit and export wizard rig and animation data.
* [x] The generic character renderer is ready to support monsters and other mobs.
* [x] Headless and/or browser tests cover key migration risks.

## Phase 3: Monster and Mob Character Pipeline

Goal: use the Phase 2 character pipeline for enemies and non-wizard creatures.

### Monster Rig Support

* [x] Create a simple humanoid enemy rig (`enemy_001`, Skeleton Guard).
* [ ] Create a simple bat rig.
* [x] Support rigs with fewer or different parts than Ignatius.
* [x] Support mirrored monster rendering.
* [ ] Support non-humanoid role mappings.
* [x] Support per-character animation state assignment.
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

* [x] At least one non-wizard character uses the generic rig renderer.
* [x] At least one monster has assigned animations for idle/move/attack/hurt (`enemy_001`, with death also authored).
* [x] Monster visuals remain renderer-owned while monster gameplay state remains simulation-owned.

## Phase 4: Combat, Destructibles, and Reactive Objects

Goal: make rockets and future weapons interact with enemies and world objects.

### Combat

* [x] Add monster health and hurt/death state to `gameState`.
* [x] Add projectile collision with monsters.
* [x] Add projectile collision with terrain.
* [x] Add projectile collision with destructible objects.
* [x] Add player damage from hazards and enemies.
* [x] Add enemy awareness, pursuit, melee attack, and rapid repeat-attack behaviour.
* [x] Add health regeneration delay and feedback.
* [x] Add hit flash and impact feedback.

### Destructible and Reactive Objects

* [x] Define reactive world object data format.
* [x] Add reactive objects to `gameState`.
* [x] Add object health or trigger state.
* [ ] Add object state transitions: `intact`, `damaged`, `breaking`, `falling`, `fallen`, `destroyed`, `inactive`.
* [x] Allow reactive objects to change collision geometry when their state changes.
* [ ] Add destructible barrier.
* [x] Add breakable crate or obstacle.
* [ ] Add falling tree prototype that can become a bridge.
* [ ] Add projectile and explosion interaction with reactive objects.
* [x] Add smoke-heavy destruction effects.
* [x] Add tests for object state, collision updates, and serialization.

### Phase 4 Completion

* [x] Ignatius can damage enemies.
* [x] Ignatius can damage or alter reactive world objects.
* [x] Destructible and reactive changes are serialized in `gameState`.
* [x] Rocket impacts no longer pass through gameplay-relevant objects.

## Phase 5: Weapon Framework

Goal: turn the current rocket behavior into a flexible weapon system.

* [ ] Define weapon data format.
* [ ] Define launch mode data format.
* [ ] Define projectile data format.
* [ ] Define animation-authored projectile-part metadata with stable ID, launch type, and launch origin.
* [ ] Derive projectile release from the final key belonging to the tagged projectile part in the attack clip.
* [ ] Transfer the sampled projectile world transform from animation ownership to simulation ownership at release.
* [ ] Support `ballistic`, `straight`, `homing_lo`, `homing_hi`, `pathing_lo`, and `pathing_hi` launch types deterministically.
* [ ] Add independent character/enemy damage fields for projectile, melee, and touch/contact damage.
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

## Portability Preparation Checkpoint

Goal: remove browser-presentation coupling and prove that the gameplay model can be translated into a standalone C++ core before procedural generation multiplies the amount of simulation and level data.

This checkpoint should be completed before or during the start of Phase 8. It does not require beginning the full Unreal port.

### Runtime Level Boundary

* [ ] Define and document a versioned normalized `LevelDefinition` format.
* [ ] Split authored-level processing into `normalizeLevelDefinition(...)` and `applyLevelDefinition(...)`.
* [ ] Move atlas-collision loading or compilation out of the renderer.
* [ ] Supply normalized collision data directly to the simulation.
* [ ] Supply visual placements, atlas resources, and colour mapping independently to the renderer.
* [ ] Remove the simulation dependency on presentation-only colour-map code.
* [ ] Confirm that a normalized level can load and run headlessly without PNG files or renderer resources.

### Authoritative State Audit

* [ ] Inventory every `gameState` field and classify it as authoritative gameplay, presentation, authoring, cache, or debug.
* [ ] Move environment visual placements and colour-map processing outside authoritative gameplay state.
* [ ] Derive doorway-only wizard scaling from transition state or move it to presentation state.
* [ ] Derive low-health pulsing from health and time rather than storing pulse intensity as gameplay state.
* [ ] Move decorative smoke and other non-gameplay particles to presentation state driven by simulation events.
* [ ] Move hit flashes and temporary health-bar display timers to presentation state.
* [ ] Separate gameplay animation intent from renderer animation playback clocks.
* [ ] Decide which camera targets are authoritative and keep smoothing/interpolation presentation-owned.
* [ ] Ensure save data, replay data, and state hashes exclude presentation-only fields.

### Runtime Schemas and Validation

* [ ] Assign schema names and versions to `GameState`, `InputFrame`, `LevelDefinition`, tuning, enemies, weapons, projectiles, reactive objects, and simulation events.
* [ ] Document units, defaults, required fields, optional fields, valid ranges, and canonical wire strings.
* [ ] Add normalization and validation functions for shared runtime schemas.
* [ ] Reject or repair `NaN`, infinity, invalid dimensions, duplicate IDs, and unknown required state values.
* [ ] Add explicit migration functions before changing existing persisted runtime formats.
* [ ] Define stable ID-generation rules that do not depend on array position.
* [ ] Document collision boundary inclusion, epsilon values, tie-breaking, and update order.

### Simulation Modules and Events

* [x] Establish `src/core/`, `src/shared/`, `src/browser/`, `src/presentation/`, `src/tools/`, and `tests/` as explicit architectural boundaries.
* [x] Add `ARCHITECTURE.md` with module classifications, dependency direction, unique naming rules, and the planned JavaScript/C++ mapping.
* [ ] Extract shared core math, vector, rectangle, clamp, approach, and geometry helpers.
* [ ] Extract collision construction and collision resolution from `src/core/simulation.js`.
* [ ] Extract player movement, fuel, health, hat, and equipment updates.
* [ ] Extract weapon and projectile updates.
* [ ] Extract enemy state and AI updates.
* [ ] Add a dedicated reactive-object module before destructible behavior becomes large.
* [ ] Extract story, doorway, mailbox, and level-transition state machines.
* [ ] Keep `stepSimulation(...)` as a small facade with an explicitly documented update order.
* [ ] Define a versioned `SimulationEvent` schema and expose each tick's events separately from the capped debug history.
* [ ] Drive transient smoke, impacts, flashes, health bars, sounds, and camera impulses from simulation events.
* [ ] Ensure events contain stable IDs and gameplay positions, but no Canvas, sprite, audio, browser, or Unreal asset references.
* [ ] Run the complete headless suite after every extraction without changing expected behavior.

### Shared Parity Fixtures

* [ ] Define a language-neutral JSON fixture format containing initial state or level, tuning overrides, tick-numbered input frames, expected events, expected checkpoints, and numeric tolerances.
* [ ] Convert representative existing headless tests into shared fixture files.
* [ ] Add fixtures for movement symmetry, jumping, boost, fuel, slopes, wall collision, polygon collision, depenetration, door transitions, projectile sweeps, homing, enemy damage, death, and save/restore.
* [ ] Add a canonical authoritative-state summary function.
* [ ] Add a deterministic state hash that excludes presentation, caches, and debug prose.
* [ ] Confirm that fixtures produce the same result after serialize/restore at an intermediate tick.
* [ ] Store failed procedural seeds and input traces in the same fixture format once procedural generation begins.

### Early C++ and Unreal Spike

* [ ] Create a small standalone `RocketfrockCore` C++ test project before the full game is ported.
* [ ] Keep the standalone core free of Unreal headers and libraries.
* [ ] Port core numeric types, `InputFrame`, a minimal `GameState`, and one representative movement/collision fixture.
* [ ] Use `double` for gameplay numeric values.
* [ ] Load the same JSON fixture used by the JavaScript testbench.
* [ ] Compare discrete state and events exactly, and floating-point values using documented tolerances.
* [ ] Create a thin experimental Unreal module that advances the portable core and moves a visual Actor without making Character Movement or Chaos authoritative.
* [ ] Record any naming, schema, coordinate, or update-order corrections revealed by the spike in `PLAN.md` before continuing into large procedural systems.

### Checkpoint Completion

* [ ] The renderer is no longer the owner or provider of gameplay collision manifests.
* [ ] The simulation no longer imports presentation-only colour-map code.
* [ ] A normalized level runs headlessly without images or renderer resources.
* [ ] Authoritative and presentation state have an explicit documented boundary.
* [ ] Shared runtime schemas are validated and versioned.
* [ ] Important scenarios exist as language-neutral parity fixtures.
* [ ] A minimal standalone C++ core passes at least one shared fixture.
* [ ] An Unreal presentation spike displays C++ simulation state without replacing the custom gameplay simulation.

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

### Revision 068 level-editor workflow

- [x] Cutout masks cover earlier visuals with the shared opaque cave background rather than erasing canvas alpha to black.
- [x] Add **Copy asset** immediately before **Place asset** in the level-editor toolbar.
- [x] Copy all placement transform and rendering attributes, changing only ID and the small up-right position offset.
- [x] Select the copied asset and keep the Select tool active for immediate positioning.

### Revision 069 level colour mapping

- [x] Add the Level colour map panel between Level metadata and Entity palette.
- [x] Support source hue, selected hue width, feather, and hue rotation.
- [x] Save normalized `colorMap` settings in the level JSON.
- [x] Preview the same cached recoloured atlases in the level editor and game runtime.
- [x] Rebuild atlas pixel caches only when settings change, while retaining normal per-frame sprite drawing.

### Revision 070 interactive/story items

* [x] Define `it_atlas_001.json` for the mixed interactive-item PNG.
* [x] Add `it_entities_001.json` as a stateful entity-to-visual catalog.
* [x] Auto-load the interactive atlas in the Level Editor and runtime renderer.
* [x] Let entity palette placements carry self-contained visual states.
* [x] Add editable entity-state selection in the inspector.
* [x] Support an `actorFront` visual pass for portal foreground layering.
* [x] Implement the scripted level-start entrance portal: closed, open, masked walk-out, close, then release controls.
* [x] Implement the mirrored level-exit portal sequence with destination-level fallback.
* [ ] Implement mailbox letters, chest loot, switch channels, gates, herbs, keys, and hazards as gameplay systems.

### Revision 071 scripted portal entrance

* [x] Let a `magicPortal` entity opt into the entrance sequence with `portalRole: "entrance"`.
* [x] Keep Ignatius hidden while the portal is initially closed and opening.
* [x] Lock normal controls while moving Ignatius to the authored `playerStart`.
* [x] Use the open portal's `actorFront` half-door to mask the emerging wizard.
* [x] Close the portal after Ignatius clears it and then restore player control.
* [x] Make entity visual-state changes rebuild runtime visuals through a shared helper.
* [x] Add a large entrance portal to `level_001.json`.

### Revision 072 revised portal atlas alignment

* [x] Update closed, open, and foreground portal frame rectangles for the revised `it_atlas_001.png`.
* [x] Preserve one common source-pixel scale across all three portal visuals.
* [x] Align the open portal and actor-front foreground layer to the closed portal's left and bottom edges.
* [x] Add regression assertions for the authored frame rectangles and visual factors.


### Revision 073 grounded starts and artwork targets

* [x] Snap `wizardStart` to a nearby `walkable` or `blockable` collision line when it is no more than half a wizard height below the authored point.
* [x] Apply the same snapping rule in the Level Editor after load, placement, drag, and numeric edits.
* [x] Update the portal intro, current player Y, and respawn Y to the resolved grounded start.
* [x] Let target-dummy entities define a normalized bullseye anchor and target radius.
* [x] Aim rockets at the straw dummy's belly bullseye.
* [x] Suppress the legacy target dot and pulse for atlas-backed target artwork.


### Revision 074 mailbox letter event

[x] Pixel-align the revised mailbox-with-letter and empty-mailbox atlas frames.
[x] Trigger the editor mailbox sequence at a configurable proximity distance.
[x] Replace the mailbox artwork with its empty state when the letter is collected.
[x] Display the scroll and editor text, advancing by timeout or Jump.
[x] Display Ignatius's thought bubble and text, advancing by timeout or Jump.
[x] Lock movement, jump, boost, and weapon input until the sequence completes.
[x] Expose mailbox trigger distance, timings, title, letter text, and thought text in the Level Editor inspector.
[x] Add headless regression coverage for state changes, input locking, and control return.

### Revision 075 mailbox script authoring (historical; multi-bubble format superseded by revision 076)

[x] Copy-edit and store Wilfred of Bittervine's introductory letter in `level_001.json`.
[x] Make the letter title, body, timing, and ordered thought bubbles editable in the Level Editor.
[x] Serialize thought bubbles as an ordered array while retaining compatibility with the older single `thoughtText` field.
[x] Auto-scroll letter text vertically when it exceeds the visible parchment area.
[x] Let Jump or timeout advance through every thought bubble before returning control.
[x] Historical revision-075 restriction: prevented more than one mailbox. Superseded in revision 086 by independent per-mailbox story records.

### Revision 076 unified story text

[x] Use the thought-bubble typeface for the letter body.
[x] Replace the multi-bubble thought sequence with one editable thought.
[x] Retain backward compatibility by joining older `thoughts` arrays when loading.
[x] Auto-scroll overflowing thought text and display a scrollbar.
[x] Vertically center letter and thought text when it fits without scrolling.
[x] Keep Jump progression as letter → thought → control returned.

### Revision 077 numbered enemy projects

[x] Rename the first enemy project stem from `skeleton_1` to `enemy_001`.
[x] Update character, rig, atlas, PNG, idle, and walk references to the `ct_*_enemy_001` convention.
[x] Update Puppet Forge's known-project selector to load `ct_char_enemy_001.json`.
[x] Preserve `Skeleton Guard` as the human-readable display name rather than encoding the species in filenames.
[x] Add regression coverage for the numbered IDs, filenames, layer order, and animation sampling.
[x] Add a generated enemy index or controlled numbered discovery pass for `ct_char_enemy_0XX.json` (implemented as the explicit `ct_enemies_001.json` catalog in revision 093).
[x] Populate the Level Editor enemy palette from that enemy index/catalog (revision 093).



### Revision 086 entry/exit doorway transition model

* [x] Replace editor `wizardStart` and plain `exit` markers with `wizard_entry_door` and `wizard_exit_door`.
* [x] Snap both doorway baselines to nearby walkable/blockable collision.
* [x] Derive player spawn and respawn from the entry doorway and its emergence distance.
* [x] Mirror exit-door artwork by default.
* [x] Open the exit on proximity, walk Ignatius through its actor-front layer, close it, and request a level transition.
* [x] Default empty destinations to the next numbered level and fall back to the current level when the requested JSON is missing.
* [x] Permit multiple mailboxes and keep story text/timings on each mailbox entity.
* [x] Preserve Level Editor import migration for legacy `magicPortal`, `wizardStart`, and `exit` records.

### Revision 088 compact threshold-aligned doorways

* [x] Halve the catalog default width and height of both wizard doorway entities.
* [x] Halve the authored entry and exit doorway dimensions in `level_001.json`.
* [x] Align doorway artwork so the authored floor line passes through the door-leaf threshold rather than the sprite bottom.
* [x] Use the same doorway floor anchor in runtime rendering, Level Editor drawing, selection, hit testing, and ground snapping.
* [x] Scale Ignatius smoothly from the reduced inside-door size to full size during entry.
* [x] Scale Ignatius smoothly down while entering the exit doorway without changing his physics dimensions.
* [x] Add headless regression coverage for doorway dimensions, floor anchoring, and both scale transitions.

### Revision 090 doorway seam threshold correction

* [x] Align the authored doorway floor line to the point where the central seam between the two wooden door leaves reaches the threshold.
* [x] Apply the corrected anchor consistently to entry and exit doors in runtime, level data, catalog defaults, and Level Editor geometry.
* [x] Preserve the existing doorway-only wizard scaling and verify the transition tests still pass.

### Revision 091 solid-area depenetration

* [x] Detect player overlap with closed blockable collision polygons after the normal X/Y collision sweeps.
* [x] Push shallow corner impacts back outside even when the three side samples miss the collision edge.
* [x] Recover an already embedded wizard through the nearest axis-aligned exit from the solid area.
* [x] Apply the same recovery to fallback rectangle solids and cancel velocity that points back into the obstacle.
* [x] Add headless regression coverage for corner entry and nearest-edge downward recovery.

### Revision 092 Ctrl weapon binding

* [x] Map both `ControlLeft` and `ControlRight` to weapon launch.
* [x] Update the in-game controls help.
* [x] Add headless regression coverage for both physical Control keys.

### Revision 093 enemy catalog, placement, and patrol

* [x] Add an explicit enemy catalog suitable for static browser hosting.
* [x] Add the Skeleton Guard to the Level Editor entity palette.
* [x] Preview placed character enemies through the generic runtime rig renderer.
* [x] Snap character-enemy foot positions to nearby authored support lines.
* [x] Add editor controls for guard/patrol behaviour, facing, patrol span, speed, pauses, and visual scale.
* [x] Implement deterministic simulation-owned idle/walk patrol state.
* [x] Follow sloped support and turn at patrol limits, ledges, and blocking geometry.
* [x] Keep homing target anchors synchronized with moving enemies.
* [x] Place the first Skeleton Guard patrol in `level_001`.
* [x] Add headless coverage for catalog/editor integration, patrol movement, turning, target synchronization, and stand-guard behaviour.



### Revision 094 enemy rocket combat

* [x] Give placed enemies serializable current/max health and explicit alive, hurt, and dead combat state.
* [x] Store rocket damage on each launched projectile.
* [x] Sweep rockets against enemy bodies so fast projectiles cannot tunnel through them.
* [x] Resolve the earliest enemy or terrain hit so walls shield enemies.
* [x] Select the authored hurt clip for surviving Skeleton Guards and pause patrol movement during recoil.
* [x] Select the authored non-looping death clip, stop movement, and deactivate defeated homing targets.
* [x] Add simulation-timed hit flash and temporary health-bar feedback.
* [x] Expose enemy health in the Level Editor inspector.
* [x] Add headless regression coverage for damage, hurt recovery, death, retargeting, and terrain interception.

### Revision 095 future C++ and Unreal portability roadmap

* [x] Assess the current simulation, renderer, level-loading, data, and test boundaries for a future Unreal Engine port.
* [x] Define the intended split between an engine-neutral `RocketfrockCore` and a thin Unreal presentation adapter.
* [x] Document the gameplay coordinate and double-precision numeric contract.
* [x] Add permanent portability guardrails for future gameplay changes.
* [x] Add a pre-procedural-generation checkpoint covering normalized levels, state ownership, schemas, module extraction, simulation events, parity fixtures, and an early C++/Unreal spike.
* [x] Keep revision 095 documentation-only so runtime behavior remains unchanged.

### Revision 096 enemy melee attacks and player damage

* [x] Add a deterministic Skeleton Guard melee attack state that interrupts guard or patrol movement.
* [x] Face the player, play the authored attack clip, and apply damage once at the authored hit time.
* [x] Prevent melee attacks from reaching through blocking terrain.
* [x] Add configurable attack damage, reach, cooldown, timing, and knockback to enemy runtime data.
* [x] Expose Skeleton Guard attack damage, reach, and cooldown in the Level Editor inspector.
* [x] Add player damage invulnerability and knockback so overlapping attacks or hazards cannot drain health every tick.
* [x] Make `damaging` collision hurt the player and `killable` collision defeat the player.
* [x] Emit player-damage, defeat, enemy-attack, hazard-contact, and health-regeneration events.
* [x] Add player hit flash plus HUD feedback for recent damage, regeneration delay, and active regeneration.
* [x] Add headless regression coverage for melee damage, attack timing, invulnerability, hazards, and regeneration.

### Revision 097 aggressive Skeleton Guard pursuit and rapid sword combo

* [x] Alert patrolling Skeleton Guards when Ignatius enters their authored patrol span.
* [x] Give stationary guards a configurable awareness range and all guards a short awareness hold timer.
* [x] Add a separate alerted chase speed that is substantially faster than patrol movement.
* [x] Reuse support, ledge, patrol-limit, and blocking-geometry checks during pursuit.
* [x] Shorten the Skeleton Guard attack animation and align the gameplay strike with the visible downstroke.
* [x] Extend the authored sword follow-through and add a bounded pre-strike lunge so the blade reaches Ignatius.
* [x] Reduce attack recovery enough to produce repeated chop-chop-chop pressure.
* [x] Expose chase speed and stationary-guard awareness range in the Level Editor.
* [x] Update the placed `level_001` Skeleton Guard to the new aggression and attack defaults.
* [x] Add headless regression coverage for awareness, chase speed, attack lunge, strike timing, and rapid repeat attacks.

### Revision 099 source organization and architecture map

* [x] Move deterministic simulation to `src/core/simulation.js`.
* [x] Move browser input and startup orchestration to `src/browser/`.
* [x] Move Canvas, character-runtime, and colour-map code to `src/presentation/`.
* [x] Move engine-neutral animation and level-transform helpers to `src/shared/`.
* [x] Move reusable Puppet Forge helpers to `src/tools/character-editor/`.
* [x] Rename browser entry pages to concise kebab-case names and use `index.html` as the project landing page.
* [x] Move the aggregate headless runner to `tests/testbench.mjs`.
* [x] Add a dependency-free `package.json` that declares ES modules and exposes the suite through `npm test`.
* [x] Update every module import, HTML link, source-inspection test, manifest note, and revision label.
* [x] Add a regression test that verifies the new source tree and rejects the retired loose filenames.
* [x] Add `ARCHITECTURE.md` with source classifications, dependency rules, unique filename guidance, known boundary debt, and future C++ counterparts.
* [x] Update `PLAN.md`, `IMPLEMENTATION_CHECKLIST.md`, and `AGENTS.md` to use the new paths.
* [x] Keep the restructuring behavior-neutral and pass the complete headless suite.


### Revision 100 first reactive object and breakable crate

* [x] Add `breakableCrate` to the interactive entity catalog with intact, damaged, and destroyed visual states.
* [x] Expose reactive-object health, damaged threshold, projectile multiplier, and blocking flags in the Level Editor.
* [x] Normalize authored destructible entities into serializable `gameState.reactiveObjects`.
* [x] Add state-dependent dynamic player collision and remove it when the object is destroyed.
* [x] Sweep rockets against reactive-object bodies and resolve the earliest enemy/object/terrain contact.
* [x] Apply projectile damage, transition intact → damaged → destroyed, and synchronize state-authored visuals.
* [x] Emit reactive-object state, damage, and destruction events plus a smoke-heavy destruction burst.
* [x] Add headless regression coverage for catalog/editor integration, collision, projectile ordering, state transitions, visuals, smoke, events, and serialization.

### Revision 101 first ranged goblin variants

* [x] Add the shared goblin atlas and rig under the numbered enemy project convention.
* [x] Add Fireball Goblin (`enemy_002`) and Musket Goblin (`enemy_003`) character definitions and catalog entries.
* [x] Support character-level rig part and pivot overrides in the runtime character loader.
* [x] Add simulation-owned ranged enemy attacks and enemy projectile ownership.
* [x] Implement weakly homing fireballs and gravity-driven ballistic musket shots.
* [x] Add renderer presentation and headless regression coverage for both projectile types.

### Revision 102 Puppet Forge goblin project loading fix

* [x] Map the visible `enemy_002` selector entry to `assets/ct_char_enemy_002.json`.
* [x] Map the visible `enemy_003` selector entry to `assets/ct_char_enemy_003.json`.
* [x] Guard against future known-project selector entries without a corresponding URL mapping.
* [x] Apply character-level rig part and pivot overrides when Puppet Forge loads a project.
* [x] Add source regression checks for the goblin mappings and editor override path.

### Revision 103 corrected goblin rig and animation pass

* [x] Swap the mislabeled closed left/right arm frames while preserving the correctly identified open left arm.
* [x] Swap the mislabeled left/right leg frames.
* [x] Rebuild the shared rig in rear-to-front depth order with corrected shoulder and hip pivots.
* [x] Remove the fireball from the Fireball Goblin rig and keep it simulation-owned.
* [x] Add dedicated Fireball Goblin idle, walk, cast, hurt, and death clips.
* [x] Add dedicated Musket Goblin weapon-aware idle, walk, fire, hurt, and death clips.
* [x] Expose unattached character-atlas frames as runtime atlas assets.
* [x] Render fireball and cannonball projectiles from their supplied atlas frames with procedural fallbacks.
* [x] Add regression checks for corrected frame identities, draw order, hidden fireball rig slot, and projectile atlas access.

### Revision 104 Puppet Forge alpha preview and hidden-part editing

* [x] Add an Animation preview checkbox that switches between edit visibility and effective alpha preview.
* [x] Keep alpha-zero parts visible by default so hidden equipment can still be selected and positioned.
* [x] Fill animation poses from rig setup values when a clip intentionally omits a part.
* [x] Allow direct X/Y/rotation editing to create tracks for previously omitted rig parts.
* [x] Record the Fireball Goblin's hidden weapon-slot offset explicitly in its character override.
* [x] Add regression checks for the alpha toggle, setup-pose fallback, and movable hidden weapon slot.

### Revision 105 user-corrected compact goblin animation foundation

* [x] Replace the project copies of the shared goblin atlas, rig, Fireball Goblin character definition, and Enemy 002 idle clip with the user's corrected files.
* [x] Preserve the user-authored depth order, pivots, alternate `leftArmClosed` rig part, and pulled-in dwarfish leg placement.
* [x] Rebuild Enemy 003 idle from the corrected Enemy 002 body and leg pose.
* [x] Stop Enemy 003 from duplicating the closed left arm through the ordinary `leftArm` slot; use the dedicated alternate part instead.
* [x] Rebuild both goblin walk cycles around the compact stance.
* [x] Rebuild Fireball Goblin casting with closed/open arm alpha replacement while keeping the fireball simulation-owned.
* [x] Rebuild Musket Goblin firing so both hands and the musket raise, recoil, and settle together.
* [x] Rebuild both hurt and death clips so connected body groups remain joined.
* [x] Add regression checks for compact leg placement, alternate-arm visibility, complete rig-part reference poses, corrected draw order, and Enemy 003 idle inheritance.

### Revision 106 Puppet Forge editing ergonomics

* [x] When final alpha preview is off, draw the selected part fully opaque and clamp unselected parts to 5–25% opacity.
* [x] Add right-button drag panning to both rig/animation and atlas workspaces while suppressing the browser context menu.
* [x] Add a Rig and animation toolbar with Select, Adjust, Visible/Hidden, To Bottom, and To Front shortcuts.
* [x] Make canvas Select choose the frontmost rig rectangle and automatically return to Adjust mode.
* [x] Make Visible/Hidden author a step alpha key at the current playhead.
* [x] Move previous/play-next, the playhead slider, and key timeline into a wide dock below the canvas.
* [x] Allow grouped X/Y/rotation timeline markers to be dragged together to a new key time.
* [x] Add independent collapse controls to right-side panels and persist their state through browser local storage.
* [x] Add source regression checks for all new editor controls and behaviours.

### Deferred animation-authored projectile handoff

* [ ] Add explicit projectile metadata to rig parts or character attack definitions; do not infer gameplay from part names.
* [ ] Treat the final key on the tagged projectile part as its release time even when other body parts have later recoil/recovery keys.
* [ ] Add projectile launch-type metadata for ballistic, straight, low/high homing, and low/high obstacle-pathing shots.
* [ ] Add projectile, melee, and touch/contact damage fields to character-level combat data.
* [ ] Update the simulation to consume animation release events and take ownership of the projectile at its sampled world transform.
* [ ] Add deterministic tests for release timing, ownership transfer, obstacle interception, launch modes, and damage sources.

### Revision 108 user-refined goblin joints and animation rebuild

* [x] Adopt the user's latest Enemy 002 rig, atlas, character definition, and idle clip as authoritative.
* [x] Preserve the revised compact proportions, head frame, pivots, and depth order.
* [x] Rebuild Enemy 002 walk, attack, hurt, and death from the corrected idle pose.
* [x] Rebuild Enemy 003 idle, walk, attack, hurt, and death from the same corrected body pose.
* [x] Keep neck, shoulder, and hip pivots rigidly attached to torso motion throughout authored clips.
* [x] Preserve closed/open arm swapping for fireball casting and coordinated musket recoil.
* [x] Add regression checks for shoulder-to-torso attachment at authored torso keyframes.

### Revision 110 accepted authored goblin animations

* [x] Replace Enemy 002 idle, walk, attack, hurt, and death with the user's accepted files unchanged.
* [x] Replace Enemy 003 idle, walk, attack, hurt, and death with the user's accepted files unchanged.
* [x] Replace the shared goblin atlas manifest, rig, and both character definitions unchanged.
* [x] Include the supplied Enemy 001 hurt and death updates unchanged.
* [x] Update regression checks to accept optional projectile-preview parts while retaining runtime and finite-sampling validation.
### Revision 111 finalized goblin animation bundle restored verbatim

* [x] Replace the goblin rig, atlas manifest, character definitions, and Enemy 002/003 animation clips from the user-supplied ZIP without rewriting them.
* [x] Preserve the Fireball Goblin attack's animated fireball part and the Musket Goblin attack's animated cannonball part.
* [x] Verify every supplied JSON file remains byte-identical inside the packaged revision.

