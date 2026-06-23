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

Revision 100 provides the first destructible/reactive-world slice: an editor-placeable breakable crate with authoritative health/state, dynamic collision, rocket interception, state-authored visuals, destruction smoke, events, and serialization. Revision 126 adds the second shape class, a tall destructible iron barrier, and an off-by-default Puppet Guide that exposes exact enemy hitboxes, awareness, attack windows, routes, target anchors, patrol spans, and last-seen state. Exact projectile and melee rectangles now live in shared actor geometry used by both core and renderer. The immediate reactive-world target is moving geometry, beginning with a falling-tree bridge. In parallel, portability preparation should remove renderer-owned gameplay data and establish language-neutral schemas and parity fixtures before Phase 8 procedural generation expands the simulation surface.

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
* [x] Add destructible barrier.
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
* [x] Define animation-authored projectile-part metadata with stable ID, launch type, animation slot, explicit release time, and sampled launch origin.
* [x] Use an explicit user-authored projectile release time while showing the part's final keyed time as an editor reference.
* [x] Transfer the sampled projectile world transform from animation ownership to simulation ownership at release.
* [x] Support deterministic `ballistic`, `straight`, `homing_lo`, and `homing_hi` launch behaviour.
* [ ] Add true deterministic obstacle planning for `pathing_lo` and `pathing_hi`.
* [ ] Add independent character/enemy damage fields for projectile, melee, and touch/contact damage.
* [ ] Add quick launch mode.
* [ ] Add held aimed launch mode.
* [ ] Add homing launch mode.
* [x] Add ballistic launch mode for the Musket Goblin.
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

* [x] Add the shared goblin atlas and numbered character rigs under the enemy project convention.
* [x] Add Fireball Goblin (`enemy_002`) and Musket Goblin (`enemy_003`) character definitions and catalog entries.
* [x] Load the dedicated rig referenced by each character definition as the authoritative geometry source.
* [x] Add simulation-owned ranged enemy attacks and enemy projectile ownership.
* [x] Implement weakly homing fireballs and gravity-driven ballistic musket shots.
* [x] Add renderer presentation and headless regression coverage for both projectile types.

### Revision 102 Puppet Forge goblin project loading fix

* [x] Map the visible `enemy_002` selector entry to `assets/ct_char_enemy_002.json`.
* [x] Map the visible `enemy_003` selector entry to `assets/ct_char_enemy_003.json`.
* [x] Guard against future known-project selector entries without a corresponding URL mapping.
* [x] Load each known project's referenced rig directly in Puppet Forge.
* [x] Add source regression checks for the goblin mappings and direct rig-loading path.

### Revision 103 corrected goblin rig and animation pass

* [x] Swap the mislabeled closed left/right arm frames while preserving the correctly identified open left arm.
* [x] Swap the mislabeled left/right leg frames.
* [x] Rebuild the goblin rigs in rear-to-front depth order with corrected shoulder and hip pivots.
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

### Animation-authored projectile handoff

* [x] Add explicit projectile metadata to rig parts; do not infer gameplay from part names.
* [x] Add an explicit release-time field and show the projectile part's final key only as a reference.
* [x] Add projectile launch-type metadata for ballistic, straight, low/high homing, and reserved low/high obstacle-pathing shots.
* [ ] Add projectile, melee, and touch/contact damage fields to character-level combat data.
* [x] Update the simulation to consume explicit animation release metadata and take ownership at the sampled world transform.
* [x] Add deterministic tests for explicit release timing, sampled ownership transfer, low-homing fireballs, and ballistic cannonballs.
* [ ] Extend handoff tests to true pathing modes and character-level damage-source metadata.

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
### Revision 112 explicit projectile handoff and level placement

* [x] Add projectile tagging, launch-type selection, animation-slot selection, explicit release-time editing, and per-character active-projectile selection to Puppet Forge.
* [x] Show the selected projectile part's final keyed time as a non-authoritative reference.
* [x] Tag the Fireball Goblin fireball as `homing_lo` and the Musket Goblin cannonball as `ballistic`.
* [x] Compile the projectile part's sampled release transform while loading the character project.
* [x] Hydrate character combat profiles into portable enemy state after each level load.
* [x] Launch simulation-owned projectiles from the sampled animated world position and hide the rig copy at release.
* [x] Add both goblin variants to `level_001`.
* [x] Add regression coverage for metadata, release timing, origin transfer, visibility handoff, and level placement.

### Revision 113 visible character ground and baked goblin normalization

* [x] Draw the authoritative local `y = 0` ground line in Puppet Forge's Rig and animation workspace.
* [x] Make the ground-guide label vertically draggable as a view-only operation.
* [x] Bake a one-time `+52` rig-space Y correction into both goblin rigs' anchors and setup offsets.
* [x] Apply the same correction to both Enemy 002/003 rig files, reference poses, and every animation Y keyframe.
* [x] Preserve projectile release times and translate projectile preparation/release positions with the character.
* [x] Keep runtime `groundOffset` and `rootYOffsetFromGround` at zero.
* [x] Add regression checks for the editor guide, normalized goblin feet, zero runtime offset, and shifted projectile release positions.


### Revision 114 defeated-monster linger and fade

* [x] Keep defeated character enemies fully opaque for two seconds.
* [x] Fade defeated character enemies linearly to zero opacity over the following three seconds.
* [x] Fade the character shadow together with the defeated monster.
* [x] Keep dead enemies stationary, untargetable, and on their authored death animation.
* [x] Add deterministic simulation regression coverage for the hold, partial fade, and fully transparent states.

### Revision 115 strategy-driven hunter AI and platform routing

* [x] Preserve the existing local behaviour as the `simple_patrol` strategy.
* [x] Add stationary `sentry` and roaming `hunter` strategy values.
* [x] Add enemy-archetype/runtime fields for run speed, jump height, jump gravity, fall limit, glare duration, repath cadence, and home retry cadence.
* [x] Extract walkable supports and directed step/jump/drop edges into `src/core/enemy-navigation.js`.
* [x] Reject routes that exceed the enemy's authored single-jump capability.
* [x] Select reachable melee or projectile attack positions using preferred range and line of sight.
* [x] Add deterministic airborne traversal and landing for ordinary single jumps and drops.
* [x] Add unreachable glare, return-home, and stranded temporary-patrol states.
* [x] Periodically retry the original home route from a stranded patrol.
* [x] Expose strategy, run speed, jump height, awareness, and glare controls in the Level Editor.
* [x] Configure the Skeleton Guard as `simple_patrol` and both goblins as `hunter` in the catalog and `level_001`.
* [x] Add debug route/state visualization and deterministic graph, jump, positioning, and stranded-fallback tests.
### Revision 116 hunter jump-route and ranged-fallback fixes

* [x] Classify only upward-facing closed-polygon edges as walkable navigation supports.
* [x] Split broad floor supports around blocking polygon and solid footprints using enemy body dimensions.
* [x] Generate side-entry jump and side-exit drop transitions for vertically overlapping obstacle tops.
* [x] Include current-position-to-launch walking distance in route selection.
* [x] Preserve support identity at shared vertices while traversing segmented platform tops.
* [x] Prefer a reachable wizard support region over opportunistic attacks from a lower support.
* [x] Search all reachable supports for a projectile position before entering unreachable glare.
* [x] Validate fireball lines and musket-ball ballistic arcs from the authored projectile origin.
* [x] Sample the complete usable firing window densely enough to find narrow clear-shot positions.
* [x] Add a regression test using the real `level_001` arch and a 555-pixel hunter jump.
* [x] Add a regression test requiring repositioning to a reachable firing fallback before glare.


### Revision 117 baked directed navigation graphs

* [x] Add a Level Editor command that bakes graphs for every distinct placed hunter mobility profile.
* [x] Store baked support nodes and directed transitions in `level.navigationGraphs`.
* [x] Preview a selected graph in the Level Editor with distinct support, step, jump, and drop rendering.
* [x] Generate explicit jump-left, jump-right, drop-left, drop-right, chasm-left, and chasm-right edges.
* [x] Classify downward transitions as genuine drops even when the monster has a very large jump-height setting.
* [x] Validate sampled jump/drop trajectories against static obstacle geometry while baking.
* [x] Carry dynamic blocker IDs and dynamic edge-cost rules for future doors and destructible passages.
* [x] Add a support signature and reject stale baked graphs when level geometry changes.
* [x] Fall back to live graph construction when no exact baked mobility profile exists.
* [x] Bake both hunter-goblin profiles into `level_001`.
* [x] Add a directional-edge regression test covering all required left/right jump and fall cases.
* [x] Add a long detour-maze fixture whose valid route begins by moving away from Ignatius and includes climbs, drops, reversals, and gaps in both directions.
* [x] Prevent a deliberate drop from immediately re-landing on its source support, and ignore that source surface only during the departure window.
* [x] Add a runtime regression with a 555-pixel jump setting that must still choose and complete a zero-upward-impulse drop.

## Revision 118 hunter traversal corrections

- [x] Set Fireball Goblin and Musket Goblin defaults to `runSpeed: 200` and `jumpHeight: 200`.
- [x] Update the placed `level_001` goblins to those mobility values.
- [x] Re-bake both `level_001` navigation profiles for the new mobility settings.
- [x] Generate physics-guided run-up candidates for raised obstacle jumps.
- [x] Validate baked arcs at the same fixed-step X-then-Y cadence used at runtime.
- [x] Use the actor's complete collision width when checking navigation clearance.
- [x] Route both Ignatius and airborne enemies through shared swept actor collision queries.
- [x] Preserve source-platform departure without disabling side or destination collision.
- [x] Land controlled drops on ordinary solid, segment, and polygon geometry.
- [x] Make hunter awareness-range behavior consistent behind initial occluders.
- [x] Prevent return-home enemies from immediately re-engaging before completing the fallback state.
- [x] Add regression coverage for first-attempt run-up jumps, polygon-ground drops, and occluded hunter awareness consistency.

## Revision 119 walk-off drop completion and playtest graph baking

- [x] Generate physics-guided walk-off drop candidates at solid platform edges.
- [x] Require enough horizontal velocity to clear the source obstacle with the actor's full collision width.
- [x] Preserve ordinary destination collision and landing behavior.
- [x] Re-bake both `level_001` goblin navigation profiles with the corrected drop transitions.
- [x] Rebuild placed hunter navigation graphs automatically whenever the Level Editor Play button is pressed.
- [x] Keep the explicit graph-builder command for preview and inspection.
- [x] Add a regression where a hunter must leave a pillar and land on a horizontally offset lower floor.
- [x] Add a regression check that Play invokes graph rebuilding before serialization.


## Revision 120 distance-and-facing monster awareness

- [x] Remove terrain occlusion from monster awareness checks.
- [x] Keep terrain collision and line-of-fire checks for movement and actual attacks.
- [x] Add configurable `awarenessViewHalfAngle` enemy data.
- [x] Default all catalog enemies and `level_001` monsters to a ±60 degree cone.
- [x] Expose the view half-angle in the Level Editor.
- [x] Add regression coverage for occluded awareness, wrong-facing rejection, and cone boundaries.

## Revision 121

- [x] Support authored monster awareness half-angles, including the ±90° forward-half-plane case.
- [x] Preserve distance and facing as the only first-notice gates.
- [x] Add ground acceleration to enemy navigation mobility profiles and baked-profile keys.
- [x] Bake explicit run-up start, distance, acceleration, and required launch speed into jump edges.
- [x] Reject jump edges without a clear and sufficiently long source-support run-up corridor.
- [x] Route toward the run-up point rather than directly toward takeoff.
- [x] Commit runtime traversal through approach, acceleration, takeoff, and airborne phases without periodic repathing resetting the maneuver.
- [x] Show dashed run-up segments in the Level Editor graph preview.
- [x] Rebuild both `level_001` goblin graphs using graph format version 2.
- [x] Add regressions for left-to-right and right-to-left pillar jumps, including visible backing away before the reverse jump.
- [x] Add ±90° awareness boundary regressions while allowing narrower catalog tuning.

## Revision 122 doorway fuel-indicator transform

- [x] Draw the mounted fuel indicator from the rendered rocket command transform.
- [x] Preserve the indicator's local attachment, rotation, and facing while the wizard scales through doors.
- [x] Add a regression guard preventing the indicator from using the unscaled source pose.

## Revision 123 last-seen investigation and rocket target priority

- [x] Store each hunter's last genuinely seen player foot position and support ID.
- [x] Preserve a brief awareness hold so planned backpedalling does not instantly discard contact.
- [x] Add the `investigate_last_seen` hunter state.
- [x] Search all reachable supports and choose the point closest in world space to the last seen position.
- [x] Route to that closest reachable point before entering unreachable glare.
- [x] Aim the glare at the last seen position rather than the hidden current player.
- [x] Reacquire and resume ordinary pursuit when Ignatius becomes visible during investigation or glare.
- [x] Prioritize the nearest active rocket target in Ignatius's facing half-plane.
- [x] Fall back to the nearest rear target only when no forward target exists.
- [x] Add deterministic regressions for closest-reachable last-seen pursuit and forward-side rocket targeting.

## Revision 124 visible-player combat-target stability

- [x] Decouple player targetability from the raw health amount.
- [x] Keep a visible player targetable until an explicit dead or untargetable lifecycle state is set.
- [x] Preserve hunter awareness and engagement after the health display reaches zero.
- [x] Allow enemy projectiles to keep colliding and producing impacts against the visible zero-health player.
- [x] Add a prolonged ranged-combat regression that reaches zero health, moves Ignatius slightly, and verifies the hunter never enters investigate, glare, return-home, or stranded states.
## Revision 126 Puppet Guide and destructible barrier

- [x] Add a dedicated `Puppet guide` game button that is off by default.
- [x] Keep Puppet Guide independent from the existing player/projectile hitbox toggle.
- [x] Draw enemy movement bodies and exact projectile hurtboxes.
- [x] Draw awareness cones, melee reach or ranged attack windows, target anchors, patrol spans, routes, current AI state, and last-seen markers.
- [x] Move shared actor body, projectile hurtbox, and melee rectangle math into `src/shared/actor-geometry.js`.
- [x] Use the same geometry helpers in portable simulation and Canvas diagnostics.
- [x] Add a placeable destructible iron barrier using the generic reactive-object pipeline and existing atlas artwork.
- [x] Keep intact and damaged barrier states solid and projectile-blocking; remove collision and visuals on destruction.
- [x] Keep `IgnatiusRocketfrock_JS.html` as a backwards-compatible redirect to `index.html` and cover it with a source-organization regression.
- [x] Add regressions for Puppet Guide defaults/shared geometry and the complete barrier damage lifecycle.
## Revision 128 authoritative rig ownership

- [x] Confirm that no current character definition contains character-level rig-part or pivot replacement data.
- [x] Remove character-level rig replacement logic from the runtime character loader.
- [x] Remove the corresponding merge path from Puppet Forge.
- [x] Keep Enemy 002 and Enemy 003 on distinct numbered rig files while reusing their shared atlas.
- [x] Add regressions proving that each goblin's right-arm pivot comes directly from its own rig.
- [x] Reject the removed character-level rig patch fields in source and asset checks.
- [x] Preserve `IgnatiusRocketfrock_JS.html` as a backwards-compatible entry link.

## Revision 129 downward traversal and early takeoff recovery

- [x] Generate deliberate downward-jump candidates for lower supports beyond a source obstacle.
- [x] Require downward jumps to clear the hunter's full body past the source wall before descent.
- [x] Add a takeoff-clearance preference so route search favours earlier obstacle-clear ascent launches.
- [x] Detect landed supports using near-full-body sampling after airborne traversal.
- [x] Accept a safe neighbouring-support landing and replan without incrementing navigation failure state.
- [x] Rebuild `level_001` for the current shared 70×105, 200 px/s goblin profile.
- [x] Add graph and full-simulation regressions for the central-pillar climb and downward exit.

## Revision 130 early pillar ascent and loading progress

- [x] Reject navigation arcs that clip an unrelated wall or ledge on the destination polygon.
- [x] Permit stable partial-overlap first contact on narrow upward landing supports.
- [x] Rebuild `level_001` with direct early jumps onto the central pillar from both sides.
- [x] Add a full-simulation regression for the left-side pillar climb succeeding on the first jump.
- [x] Paint a loading surface before the game module executes.
- [x] Show monotonic loading text, percentage, and progress-bar updates.
- [x] Load only the active level's referenced environment atlases during initial startup.
- [x] Load independent character projects, animations, and environment atlases concurrently.
- [x] Wait for atlas image decoding before reporting the resource ready.
- [x] Load newly referenced atlases during level transitions before applying collision.
- [x] Keep startup failure messages visible above or instead of the loading surface.


## Revision 131 immediate ledge exit after cone loss

- [x] Continue any active tactical route while an engaged hunter is briefly outside its facing cone.
- [x] Begin last-seen routing immediately when no active route exists instead of idling for the awareness-hold duration.
- [x] Keep the awareness hold as a delay before glare/give-up rather than a delay before movement.
- [x] Size downward-jump run-ups from required acceleration distance plus a modest stability margin.
- [x] Retain the longer body-width run-up for upward obstacle-clearing jumps.
- [x] Rebuild `level_001` navigation with the shorter ledge-exit run-ups.
- [x] Add a full-simulation regression for the screenshot scenario: wizard below-right, goblin on the central pillar, and the target just outside the ±45° cone.

## Revision 132 wider authored awareness cone

- [x] Increase the enemy-catalog awareness half-angle from 45 to 60 degrees.
- [x] Update current `level_001` enemy placements to use the 60-degree half-angle.
- [x] Align simulation and Level Editor fallback values with the authored default.
- [x] Preserve configurable narrower and wider cones for individual enemies and tests.
- [x] Update architecture notes and regression expectations.

## Revision 133 controlled ledge walk-offs

- [x] Generate controlled drops from either physical edge when a broad lower floor overlaps the source ledge horizontally.
- [x] Require a stable full-body landing interval beyond the source obstacle wall.
- [x] Mark ordinary ledge exits as gravity-driven `walkOff` transitions with zero initial vertical velocity.
- [x] Ignore only the complete source polygon/segment set during a bounded departure window, then restore ordinary swept collision.
- [x] Preserve straight drops through one-way walkable supports without allowing them to reland immediately on their source.
- [x] Raise the current goblin fall capability to 600 pixels and rebake `level_001` for the new mobility profile.
- [x] Add screenshot-scale regression coverage for leaving the left ledge and landing on the lower floor without navigation failure.
- [x] Retain regressions for ordinary shared collision landings and offset source-wall clearance.

## Revision 134 slope-aware grounded traversal

- [x] Reproduce the `hunter:unreachable_glare` failure on the real multi-segment `arch_ruin_001` blockable polygon.
- [x] Confirm that the route graph already contains the connected slope steps and preferred right-hand walk-off.
- [x] Carry the selected ground segment slope through local grounded-support queries.
- [x] Raise only the body-occupancy probe's foot clearance by the support rise across half its width.
- [x] Preserve the actor foot position, rendered pose, navigation graph, and shared airborne collision geometry.
- [x] Apply the same slope-aware occupancy check to pursuit, patrol, attack-position sampling, last-seen sampling, and step landings.
- [x] Add a regression using the actual `level_001` arch geometry that crosses the downhill segments, walks off, lands on the lower floor, and never enters glare.
