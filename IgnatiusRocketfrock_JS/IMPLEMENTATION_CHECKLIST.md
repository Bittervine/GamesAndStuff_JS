# Ignatius Rocketfrock Implementation Checklist

This document augments `PLAN.md`.

`PLAN.md` describes the game design. This document describes the implementation order and provides checkable development tasks.

The old Phase 1 physics arena is complete enough to serve as the mechanical foundation. Character tooling, the first enemy pipeline, and a reasonable navigation baseline are operational. The falling-tree bridge remains in Phase 4 but is postponed until suitable art is ready. The active near-term track is **cave-window authoring and foreground presentation**, while unfinished Phase 2 animation-authoring work remains on the backlog.

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
* [x] Do not let `src/core/` import browser, presentation, or editor modules. Revision 135 moved colour-map data normalization into `src/shared/` and added a boundary regression.

## Current Status

The project now has a working browser game loop, deterministic simulation layer, asset-atlas based level construction, atlas and level editor tools, atlas-derived collision lines and filled collision loops, detached rocket terrain impacts, health/fuel HUD, and headless tests. Revision 099 also places implementation modules under explicit core, shared, browser, presentation, and tool directories, with `ARCHITECTURE.md` serving as the dependency and future C++ parity map.

Revision 100 provides the first destructible/reactive-world slice: an editor-placeable breakable crate with authoritative health/state, dynamic collision, rocket interception, state-authored visuals, destruction smoke, events, and serialization. Revision 126 adds the second shape class, a tall destructible iron barrier, and an off-by-default Puppet Guide that exposes exact enemy hitboxes, awareness, attack windows, routes, target anchors, patrol spans, and last-seen state. Exact projectile and melee rectangles now live in shared actor geometry used by both core and renderer. The falling-tree bridge remains the next reactive-world target, but it is postponed until its artwork can be authored and reviewed. The immediate track is a presentation-only cave perimeter, whole-level spline editing, black exterior mask, and dark non-colliding foreground formations using existing atlas material. In parallel, portability preparation should continue establishing language-neutral schemas and parity fixtures before Phase 8 procedural generation expands the simulation surface.


## Near-Term Cave-Window Authoring Track

Goal: make each level read as a window into a larger cavern without coupling presentation framing to gameplay collision.

* [x] Add whole-level zoom-out and fit controls to the Level Editor. Revision 136 adds 0.02× zoom plus Fit world/content/cave.
* [x] Add closed spline authoring with selectable smooth/corner control points. Revision 136 adds insertion, dragging, mode changes, deletion, and bounds initialization.
* [x] Store the cave perimeter as visual authoring data only. Revision 136 adds normalized `caveWindow` data and shared spline math.
* [x] Never derive solids, walkable supports, hazards, navigation edges, or projectile collision from the perimeter. Revision 137 passes cave data directly from the browser adapter to presentation and keeps portable core unaware of the mask.
* [x] Keep all authoritative platforms and collision in the playing-area layer.
* [x] Warn when gameplay geometry sits far outside the visible cave opening. Revision 145 flags collision-bearing atlas placements only when they are completely exterior and beyond a safe edge margin, and outlines them in the editor.
* [x] Render a black exterior with a feathered opening. Revision 137 uses a reusable offscreen destination-out mask; future perimeter artwork will share its opaque-black outward fade.
* [x] Give the perimeter a subtle configurable foreground parallax offset. Revision 137 anchors the extra scroll around the technical world centre; generated foreground formations will use the same setting.
* [x] Add deterministic perimeter decoration using tagged floor, wall, ceiling, stalagmite, and stalactite atlas assets. Revision 138 samples the spline by arc length and selects assets deterministically from an authored seed.
* [x] Add a foreground placement layer drawn after actors. Revision 138 adds manual and generated `caveForeground` placements before the cave mask.
* [x] Force manifest collision and gameplay attributes off for every foreground placement. Revision 138 enforces this in editor normalization, inspector edits, runtime conversion, and atlas collision hydration.
* [x] Darken and slightly desaturate foreground artwork so occlusion reads as depth rather than a gameplay obstacle. Revision 138 applies authored brightness and saturation with shared cave parallax; revision 140 caches the treatment and adds an outward fade to opaque black.
* [x] Let the Level Editor hide generated perimeter art without deleting it, while keeping shown art responsive through culling, frame caches, cached ordering/bounds, and deferred JSON serialization. Revision 140.
* [x] Derive perimeter density from sprite coverage so floor and ceiling decorations overlap instead of leaving visible gaps. Revision 140 introduced the adaptive rule; revision 279 removes the now-redundant authored maximum.
* [x] Default new cave windows to 1.1 parallax and 2× generated asset scale. Parallax was tuned in revision 141; scale returned to 2× in revision 142.
* [x] Shift generated perimeter decorations inward across the spline and use a broad eased fade with a fully black outward cap. Revision 141.
* [x] Clamp smooth spline handles and regress the wide world-bounds starter loop against self-intersection. Revision 141.

Revisions 137–145 complete runtime masking, deterministic inert decoration, performance work, tuning, editor ergonomics, and hidden-gameplay-geometry warnings. The remaining cave-track gate is representative target-browser validation before any WebGL2 decision.

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
* [x] Add an optional full dopesheet with one row per rig-part property that has at least two authored keys. Revision 146.
* [x] Make the playback button toggle visibly between PLAY and PAUSE, and place Cykle animation plus Show full dopesheet beneath the timeline. Revision 146.
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
* [x] Polish fuel and health HUD.
* [x] Keep the score/bars and optional minimap panels viewport-fitted, and let either panel open the pause menu.
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

### Revision 146 Puppet Forge full dopesheet

* [x] Replace the static PLAY/PAUSE caption with a stateful PLAY or PAUSE label.
* [x] Remove the redundant Playhead text beside the time range control.
* [x] Move the existing loop/export flag beneath the timeline as Cykle animation.
* [x] Add a Show full dopesheet checkbox beneath the timeline.
* [x] Open the dopesheet as a left-side panel in animation mode.
* [x] Include only supported rig-part properties with at least two finite keyframe times.
* [x] Show a shared playhead and clickable key diamonds for every included track.
* [x] Let row labels select a part/property and let empty row space scrub the shared animation time.
* [x] Add headless regression coverage for row filtering, ordering, controls, and panel wiring.

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

## Revision 135 cleanup audit and cave-window boundary

- [x] Audit current source, catalog, level, editor, and tests for obsolete enemy-data aliases.
- [x] Make `strategy` the only current authored/runtime behaviour field.
- [x] Make `runSpeed` the only current authored/runtime pursuit-speed field.
- [x] Remove unused `awarenessVerticalRange` from current data and runtime state.
- [x] Preserve one-way import compatibility for older `behavior` and `chaseSpeed` values.
- [x] Normalize old aliases once and omit them from current runtime state and editor exports.
- [x] Split engine-neutral colour-map data/math into `src/shared/level-color-map-data.js`.
- [x] Keep offscreen Canvas recolouring in `src/presentation/level-color-map-cache.js`.
- [x] Remove the documented core-to-presentation dependency and enforce the boundary in tests.
- [x] Remove two repository-wide unreferenced public helpers.
- [x] Record the cave perimeter as an inert, parallaxed foreground mask with collision forcibly disabled.
- [x] Keep the falling-tree bridge planned but postponed until its graphical asset is ready.


### Revision 136 cave-window authoring foundation

- [x] Add `src/shared/cave-window-data.js` for normalized inert perimeter data, closed cubic sampling, nearest-segment insertion, and fit bounds.
- [x] Lower the Level Editor minimum zoom to 0.02×.
- [x] Add separate Fit world, Fit content, and Fit cave commands.
- [x] Add smooth/corner cave control points with selection, snapped dragging, insertion, deletion, and world-bounds initialization.
- [x] Add an editor-only flat exterior shade preview without changing runtime presentation.
- [x] Add the disabled `caveWindow` schema to `level_001` without changing collision or navigation.
- [x] Add regression coverage for curve closure, corner semantics, insertion lookup, editor controls, schema adoption, and the core/presentation boundary.
- [x] Render the runtime black exterior with a feathered opening and subtle foreground parallax. Revision 137 adds `src/presentation/cave-window-mask.js` and browser-to-presentation cave-data synchronization.

### Revision 137 runtime cave-window mask

- [x] Add a reusable offscreen black mask that clears the authored spline opening and feathers outward into opaque black.
- [x] Render the mask after actors and actor-front scenery, while leaving story overlays and debug information readable above it.
- [x] Apply camera-relative foreground parallax from the authored `caveWindow.parallax` value.
- [x] Keep cave-window data out of portable gameplay and synchronize it in `src/browser/game-bootstrap.js`.
- [x] Reuse one resized mask canvas instead of allocating a new surface every frame.
- [x] Add regression coverage for parallax math, render order, startup/transition synchronization, and the core/presentation boundary.
- [x] Add deterministic perimeter decoration using tagged atlas assets. Revision 138 added deterministic decoration controls, replaceable generated records, and manual foreground placement; revision 279 removes the redundant spacing control.

### Revision 138 deterministic perimeter decoration and inert foreground

- [x] Move Edit perimeter and Add perimeter point controls from the global toolbar into the cave panel.
- [x] Add a dedicated manual foreground-placement tool using the currently selected atlas asset.
- [x] Add `src/shared/cave-window-decoration.js` for deterministic arc-length sampling, orientation classification, and tagged asset selection.
- [x] Store seed, scale, brightness, saturation, and inward-coverage tuning under `caveWindow.decoration`; discard obsolete spacing values. Revision 279.
- [x] Add Populate perimeter and Clear generated commands; regeneration removes only records marked `generatedBy: "cavePerimeter"`.
- [x] Render `caveForeground` after actors with the same cave parallax and dark/desaturated treatment, then apply the feathered black mask.
- [x] Force foreground collision off in editor output, inspector conversion, runtime level conversion, and manifest collision hydration.
- [x] Add deterministic generator, render-order, toolbar-placement, and collision-boundary regression coverage.


### Revision 139 Canvas 2D cave-scene performance

- [x] Add `src/presentation/world-visual-cache.js` for one-time layer partitioning/sorting and conservative rotated placement bounds.
- [x] Cull terrain, cutout masks, actor-front visuals, and cave-foreground visuals against an expanded viewport before Canvas transforms and image submission.
- [x] Include the cave parallax offset when culling foreground records.
- [x] Cull off-screen targets, pickups, enemies, smoke puffs, and projectiles; include projectile trails in conservative bounds.
- [x] Stop allocating and sorting ordinary, actor-front, and cave-foreground visual arrays every frame.
- [x] Cache darkened/desaturated foreground atlas frames by frame, treatment, and colour-map key instead of applying a filter per placement per frame.
- [x] Invalidate foreground frame caches when environment atlases or the level colour map change.
- [x] Render the blurred cave mask at 35% linear resolution and upscale during composition.
- [x] Reuse the cave mask while camera, viewport, world bounds, perimeter, feather, parallax, and render scale are unchanged.
- [x] Add renderer stage timings, real render-to-render FPS, static/dynamic cull/draw counts, foreground-cache counts, and mask reuse status to the debug panel.
- [x] Add regression coverage for layer partitioning, rotated bounds, parallax-aware culling, mask render-key invalidation, reduced mask resolution, and diagnostic integration.
- [ ] Validate a representative populated cave on the user's target browsers and record the achieved frame rate before beginning WebGL2 work.
- [ ] If Canvas 2D still misses the target, design the WebGL2 backend around the same cached visual records, bounds, and layer partitions rather than duplicating scene organization.

### Revision 140 Level Editor cave-performance and visual handover

- [x] Add a UI-only checkbox that hides generated `cavePerimeter` placements in the Level Editor without mutating level data.
- [x] Cache Level Editor placement ordering and layer partitioning between structural edits.
- [x] Cache conservative rotated placement bounds and reject off-screen assets before Canvas transforms or image submission.
- [x] Stop applying `ctx.filter` per foreground placement in the Level Editor; reuse cached treated frame canvases.
- [x] Suppress guides and labels for generated perimeter objects unless the object is selected.
- [x] Defer full pretty-printed level JSON serialization until interaction pauses.
- [x] Supersede authored maximum spacing with density derived entirely from chosen sprite coverage. Revision 279.
- [x] Use denser overlap on floor and ceiling runs than on walls.
- [x] Allow large tagged floor and ceiling panels to participate in deterministic generation.
- [x] Store an outward fade vector and fade interval on generated foreground placements.
- [x] Add `src/presentation/foreground-sprite-treatment.js` and share cached brightness, saturation, and outward-to-black treatment between game and editor.
- [x] Preserve backward compatibility for earlier/manual foreground placements through a cave-centre outward-vector fallback.
- [x] Add regressions for dense horizontal coverage, deterministic output, fade metadata, editor visibility controls, viewport culling, frame caching, and deferred serialization.


### Revision 141 cave-window tuning and starter-spline safety

- [x] Change the normalized cave-window parallax default from 1.035 to 1.1.
- [x] Tune automatic perimeter decoration scale, then restore the practical default to 2× after playtesting. Revision 142.
- [x] Update the disabled `level_001` cave schema to carry the new defaults without enabling or inventing a perimeter.
- [x] Place generated foreground art 8–14% of its normal depth inside the spline rather than outside it.
- [x] Broaden generated/manual foreground fade defaults to 5–92% of sprite depth.
- [x] Replace the two-stop linear black overlay with a smootherstep-style multi-stop gradient and retain a fully black outer cap.
- [x] Increase the starter rounded-corner radius and clamp smooth Bezier handles to the shorter adjacent segment.
- [x] Add regression coverage proving the wide default starter spline does not cross itself.
- [x] Preserve deterministic generation and the non-colliding cave-foreground contract.

### Revision 142 outside-bounds starter perimeter

- [x] Restore the automatic cave-perimeter asset-scale default to 2×.
- [x] Create the starter cave spline outside the technical world bounds with a 96-pixel margin on every side.
- [x] Keep the rounded starter loop smooth, non-self-intersecting, and entirely outside the declared world area.
- [x] Update `level_001`, editor status text, architecture notes, and regression coverage.


### Revision 143 collapsible editor inspectors

- [x] Add per-panel collapse controls to the Level Editor right-side inspector.
- [x] Add per-panel collapse controls to the Asset Tool right-side inspector.
- [x] Remember collapse state independently for each editor through local storage.
- [x] Keep only the primary heading and accessible expand button visible while collapsed.
- [x] Preserve all authored data and exported JSON regardless of inspector visibility.
- [x] Add regression coverage for all three editors' collapse controls and persistence hooks.


### Revision 145 hidden gameplay-geometry warnings and archive cleanup

- [x] Remove the accidentally packaged retired `src/presentation/level-color-map.js` duplicate so the source-organization regression passes again.
- [x] Add engine-neutral polygon-versus-cave separation math to `src/shared/cave-window-data.js`.
- [x] Warn only for collision-bearing atlas placements that are completely outside the cave opening and farther away than the conservative edge margin.
- [x] Draw orange dashed warning outlines above the editor cave shade and list affected placement IDs in the cave panel.
- [x] Preserve intentional near-edge and edge-crossing gameplay platforms without warnings.
- [x] Add regression coverage for inside, crossing, and fully exterior placement geometry plus Level Editor warning integration.

### Revision 147 visible full-black cave boundary

- [x] Reuse the existing `caveWindow.feather` world-space value as the configurable distance from the cave-opening spline to full opaque black.
- [x] Add winding-independent sampled outset generation to `src/shared/cave-window-data.js`.
- [x] Draw the derived outset as an optional dashed magenta guide in the Level Editor and label it `FULL BLACK`.
- [x] Rename the editor control from `Feather px` to `Full black distance px` without breaking existing level JSON.
- [x] Clamp the runtime cave mask to opaque black outside the same sampled outset, eliminating browser-dependent ambiguity in the blur extent.
- [x] Add regression coverage for corner offsets, reversed spline winding, editor controls, and runtime mask clamping.

### Revision 148 safe moving-platform foundation

- [x] Add `src/shared/moving-platform-data.js` with versioned normalization and a safe automatic shuttle default.
- [x] Store the endpoint as a relative X/Y offset so repositioning the platform carries its route with it.
- [x] Support automatic and wizard-rider activation.
- [x] Implement shuttle, move/fade/respawn, and vanish/fade/respawn patterns as portable-core kinematic state machines.
- [x] Default shuttle platforms to 120 px/s with 0.75-second pauses at both endpoints.
- [x] Guarantee every vanishing pattern a positive timed hidden interval and automatic restoration at the start.
- [x] Translate authored segment/polygon collision with the platform visual.
- [x] Detach collision when fading begins and restore it only after fade-in completes.
- [x] Track the player's authoritative support ID and carry a standing rider by exact platform delta.
- [x] Exclude moving-platform supports and obstacles from baked enemy navigation graphs.
- [x] Add Level Editor enable/pattern/activation/timing controls with irrelevant fields hidden by mode.
- [x] Draw START/END route guides, a ghost endpoint, and a draggable endpoint handle.
- [x] Include endpoints in editor fit-to-content bounds and provide a start/end swap command.
- [x] Add regression coverage for defaults, rider triggering/carrying, shuttling, collision detachment, and automatic recovery.
- [x] Add named signal-channel activation and reusable switch/keyhole emitters.
- [x] Add enemy riding and deliberate moving-platform navigation semantics.
- [x] Add conservative nearest-exit crushing/depenetration rules for actors trapped by kinematic platforms.
- [x] Derive a gameplay kill boundary from the cave full-black guide and defeat Ignatius after crossing it.


## Revision 158 thought bubble, visible-level music, and enemy lift navigation

- [x] Anchor the thought-bubble artwork's lower-left tail to Ignatius rather than offsetting the cloud from his facing.
- [x] Recenter the thought-phase camera so the tail can remain attached without making the mailbox appear to speak.
- [x] Make the thought bubble slightly smaller and scale its typography with the shared responsive viewport transform.
- [x] Fit wrapped thought text to the bubble interior before falling back to timed scrolling.
- [x] Attempt soundtrack playback immediately after the first visible frame of startup and every level transition.
- [x] Preserve pointer/keyboard AudioContext unlocking as the browser-autoplay fallback.
- [x] Give character enemies authoritative physical support and moving-platform rider identity.
- [x] Carry living grounded enemies by the platform's exact kinematic delta.
- [x] Allow enemies to trigger rider-activated platforms.
- [x] Add runtime-only endpoint supports and explicit ride edges for predictable automatic/rider shuttle platforms.
- [x] Restrict boarding and disembarking to deliberate step transfers and position riders for their planned exit while travelling.
- [x] Keep signal-triggered and disappearing platforms outside autonomous hunter route planning.
- [x] Add regressions for tail anchoring, narrow-screen text scaling, visible-frame music attempts, enemy carrying/activation, and hunter boarding/ride/disembark behaviour.


### Revision 149 earthy game menu, settings, Electron shell, and sharper rockets

- [x] Add persistent versioned game settings with effects volume 80%, music volume 10%, Normal difficulty, and Medium rendering quality defaults.
- [x] Add an earthy pause-menu presentation with direct MENU and FULLSCREEN controls.
- [x] Add Resume, Settings, Restart level, Exit to main menu, and Electron-only Exit to desktop actions.
- [x] Pause simulation while the menu is open and restore the previous pause state on close.
- [x] Add Easy/Normal/Hard difficulty presets that scale only incoming player damage to 75%/100%/150%.
- [x] Preserve explicitly lethal hazards through a difficulty-bypass option.
- [x] Add Low/Medium/High rendering-quality presets that scale rocket-trail and explosion particle density to 50%/100%/150%.
- [x] Add a FULLSCREEN/WINDOWED toggle for browsers and the Electron bridge.
- [x] Add `electron/main.cjs` and `electron/preload.cjs` with a narrow quit/fullscreen API, context isolation, sandboxing, and Node integration disabled.
- [x] Hide desktop exit outside Electron.
- [x] Reserve and persist music volume without pretending the music system has already been implemented.
- [x] Record *In the Hall of the Mountain King* as the first planned newly synthesized background piece.
- [x] Increase homing-rocket steering strength from 3.2 to 4.8.
- [x] Add regression coverage for settings, menu integration, Electron bridge operations, damage scaling, particle scaling, and sharper homing.
- [x] Implement the music engine and an original synthesized arrangement of *In the Hall of the Mountain King*.
- [ ] Select an Electron packaging tool, add icons/metadata, and produce signed platform installers when distribution work begins.

### Revision 150 automatic fullscreen and keyboard-accessible purple menu

- [x] Add `autoFullscreen` to the versioned persisted settings schema with migration for revision 149 settings.
- [x] Replace the Settings fullscreen action button with **Automatically switch to fullscreen**.
- [x] Exit fullscreen whenever the menu or debug pause is active and request it again when play resumes.
- [x] Request initial browser fullscreen from the first eligible gameplay gesture, respecting browser security requirements.
- [x] Hide the automatic fullscreen preference in Electron and launch the Electron host fullscreen-only.
- [x] Change the Electron top-right fullscreen control to EXIT rather than offering a nonexistent windowed mode.
- [x] Add wrapped keyboard navigation and activation for menu buttons, sliders, option groups, and checkbox controls.
- [x] Restyle the menu and settings with the deep-purple palette used by `index.html`.
- [x] Add regression coverage for settings migration, checkbox semantics, keyboard navigation wiring, purple styling, and Electron fullscreen-only startup.

### Revision 151 compact menu and synthesized music

- [x] Remove the duplicate top-level Resume/Back menu action and retain the header BACK control.
- [x] Remove explanatory paragraphs from Settings.
- [x] Use a compact two-column settings layout with a one-column narrow-screen fallback.
- [x] Keep music volume defaulted to 10% and apply it live to a master Web Audio gain.
- [x] Add a shared, stable tune catalog and level-music schema.
- [x] Synthesize music from authored pitch/duration events; package no recording or MIDI files.
- [x] Unlock AudioContext only from a valid player gesture.
- [x] Switch tunes when default, browser-copy, or portal-transition levels load.
- [x] Add a Level Editor soundtrack selector.
- [x] Assign *In the Hall of the Mountain King* to `level_001`.
- [x] Add *March of the Dwarfs*, *Anitra's Dance*, and *Night on Bald Mountain* as additional selectable public-domain compositions.
- [x] Add schema, source-wiring, menu-compaction, and level-round-trip regressions.
- [ ] Add musical crossfades and scene-specific layers only after the base looping arrangements are playtested.


### Revision 152 Mountain King correction

- [x] Verify the opening theme against Mutopia and an independent Edition Peters score scan hosted by IMSLP.
- [x] Correct the chromatic pitches and preserve the score's quarter- and half-note rhythm.
- [x] Restate the compact loop a perfect fifth above rather than using the previous incorrect transposition.
- [x] Add source-faithful `E#` pitch parsing and regression-lock the opening pitch/beat sequence.
- [x] Replace the bright lead with low double-bass and tuba oscillator profiles.
- [x] Continue packaging no recordings, samples, MIDI, LilyPond, MusicXML, or score PDFs.

### Revision 154 unified dark-purple overlays

- [x] Remove the remaining brown/earth root palette from the game page.
- [x] Share one deep-purple surface family across loading, HUD, help, debug, tuning, menu controls, pause menu, and Settings.
- [x] Replace the loading progress fill's earth/brass colours with a lavender-purple progression.
- [x] Remove the pause-menu card's radial glow and repeating near-vertical stripe texture.
- [x] Use solid dark-purple menu and solid raised-purple Settings backgrounds.
- [x] Add regression coverage preventing the brown palette and repeating stripe texture from returning.



## Revision 155 focus and audio safety

- [x] Keep the effects default at 80% and change the music default to 10% in both schema and Settings UI.
- [x] Migrate version-2 settings that still contain the former exact 60% music default while preserving other saved values.
- [x] Pause and clear held input when the page loses focus or becomes hidden.
- [x] Leave gameplay paused after focus returns until the player explicitly resumes.
- [x] Mute scheduled music and master gain during every paused state without overwriting persisted volume.
- [x] Expose zero effective sound-effects volume while paused for current diagnostics and future SFX emitters.
- [x] Restore the latest configured music/effects levels after resuming.
- [x] Lower the Mountain King lead by one octave while preserving verified melody intervals and rhythm.
- [x] Darken the double-bass oscillator profile with a low-pass cutoff and subharmonic reinforcement.
- [x] Add regressions for defaults, focus/visibility pause wiring, transient mute behavior, and low-register note data.


## Revision 156 named signal activation

- [x] Merge the user-authored revision of `assets/level_001.json` without replacing its placements, entities, cave perimeter, music, or moving-platform settings.
- [x] Add a shared, version-independent named-channel normalizer and reusable lever/keyhole emitter schema.
- [x] Add `signal` as a moving-platform activation mode with an authored channel.
- [x] Emit discrete channel revisions from nearby lever interaction and one-shot keyhole unlocking.
- [x] Add a serializable item inventory and collectible key handling, including optional key consumption.
- [x] Hide collected key visuals through the generic pickup presentation path.
- [x] Add keyboard and gamepad interaction input without leaking browser or editor state into portable simulation.
- [x] Add Level Editor controls for signal-platform channels, lever/keyhole channels, key requirements, consumption, and interaction distance.
- [x] Draw selected signal links and flag channels with no matching emitter.
- [x] Keep moving-platform geometry out of editor-baked enemy navigation while preserving runtime collision IDs.
- [x] Rebuild `level_001` hunter navigation against the updated static-support contract.
- [x] Add regressions for signal-triggered platforms, lever toggling, key collection/consumption, one-shot keyholes, interaction bindings, and editor wiring.
- [x] Add enemy riding and deliberate moving-platform navigation semantics.
- [x] Add conservative nearest-exit crushing/depenetration rules for actors trapped by kinematic platforms.
- [x] Derive a gameplay kill boundary from the cave full-black guide and defeat Ignatius after crossing it.

## Revision 159 thought-tail direction correction

- [x] Anchor Ignatius at the extrapolated end of the painted thought-puff trail.
- [x] Preserve responsive clamping and text fitting while correcting the bubble's visual direction.

## Revision 161 enemy corpse gravity and moving support

* [x] Keep a newly defeated airborne character enemy fixed while its authored death clip plays.
* [x] After the death clip, apply gravity and ordinary actor sweep collision to the corpse.
* [x] Preserve ballistic momentum without allowing dead-enemy AI, navigation, attacks, or voluntary movement.
* [x] Settle landed corpses on walkable/blockable geometry and retain authoritative support identity.
* [x] Carry grounded corpses with moving platforms without allowing them to trigger rider activation.
* [x] Preserve existing corpse hold, fade, target removal, and despawn presentation timing.
* [x] Add a headless regression test for mid-air defeat, delayed gravity, landing, and support identity.


## Revision 162 cave perimeter coverage and entry routing

Revision 162 makes both root entry pages redirect directly to `game.html`. Cave-window creation from world bounds now produces a denser, gently irregular outside loop rather than a flat rounded rectangle. New cave points are inserted on the nearest edge between authored control points, including the closing last-to-first edge. Automatic perimeter decoration places roughly two thirds of the primary rock row inside the cave opening, then emits half-overlapped radial rows outward until artwork reaches beyond the derived full-black boundary. All generated rows remain presentation-only, collisionless, deterministic, and replaceable through the existing `generatedBy: "cavePerimeter"` contract.

## Revision 163 gapless radial perimeter stacking

- [x] Densely overlap generated assets tangentially around curved perimeter sections.
- [x] Overlap radial rows by roughly sixty percent and extend each stack safely beyond the Full black boundary.
- [x] Draw inward rows first and farther-out rows afterward so outer bases cover inner bases without covering inward tips.
- [x] Add deterministic regression checks for radial overlap, full-black reach, and draw order.

- [x] Randomize each innermost generated perimeter formation to place 50-75% of its normal depth inside the opening, deterministically from the existing seed. Revision 164.

## Revision 166 damage-triggered awareness

- [x] Damage from Ignatius immediately alerts the damaged enemy, even outside its normal awareness cone or range.

## Revision 167 experimental frame-swapped flying bats

- [x] Isolate every substantial transparent component in candidate atlases 004-007, remove neighboring-frame bleed, and repack the cleaned images as numbered atlas frames.
- [x] Register each candidate frame on the visible eye so wing motion does not drag the bat's head around the screen.
- [x] Build numbered rig projects that stack atlas frames as ordinary parts.
- [x] Build looping `fly` clips with step-keyed alpha tracks and exactly one visible frame at a time.
- [x] Reorder candidate sequences and omit obvious duplicates/disruptive frames where atlas order is unsuitable.
- [x] Add `enemy_004` through `enemy_007` to the explicit enemy catalog and Puppet Forge known-project selector.
- [x] Add portable `locomotion: "flying"` patrol and bobbing without ground snapping or support-graph navigation.
- [x] Add flying-enemy death escape that continues flapping, travels away from Ignatius, and hides after an authored fly-off distance.
- [x] Suppress the grounded character shadow for flying enemies.
- [x] Add regression coverage for all four runtime projects, single-frame visibility, flying patrol, no support identity, and death fly-off.
- [x] Narrow the original four-candidate trial by retaining Atlas 004 and removing discarded Atlas 006 and Atlas 007 projects.
- [ ] Add a dedicated still-frame animation authoring mode only if the retained result proves the workflow will be reused.

## Revision 168 four-part rigged bat puppet

- [x] Crop `ct_atlas_enemy_008.png` into transparent head, body, left-wing, and right-wing atlas frames without altering the supplied pixels.
- [x] Build `ct_rig_enemy_008.json` with a deliberate rear-to-front draw order and shoulder-claw wing pivots.
- [x] Classify the two wings as wing parts and arm-like puppet controls while retaining explicit left/right wing names.
- [x] Author a looping `ct_anim_enemy_008_fly.json` clip with opposing wing rotations plus small head/body recoil.
- [x] Register `enemy_008` in Puppet Forge, the runtime character preload list, and the enemy catalog.
- [x] Reuse portable flying patrol, bobbing, one-hit health, and death fly-off behaviour rather than adding bat-specific simulation code.
- [x] Add regression coverage for four-part loading, authored pivots, opposing flap rotations, recoil, draw order, and non-alpha-swapped rendering.
- [ ] Playtest the rigged bat beside the frame-swapped candidates and decide which animation approach to retain.
- [ ] Refine the retained bat's pivots, timing, scale, and silhouette before authoring any attack animation.

## Revision 169 replacement Atlas 005 frame animation

- [x] Replace the previous `ct_atlas_enemy_005.png` with the supplied 22-frame source atlas.
- [x] Extract every substantial frame directly in left-to-right, top-to-bottom source order.
- [x] Register all 22 rig parts on the visible orange eye.
- [x] Build a 20 FPS looping fly clip using ordinary step-keyed alpha tracks with exactly one visible frame.
- [x] Remove enemy projects 006, 007, and 008 from assets, preload lists, Puppet Forge, and the enemy catalog.
- [x] Replace obsolete four-candidate and articulated-bat regression coverage with retained-project and 22-frame-order coverage.
- [ ] Playtest Atlas 004 beside the replacement Atlas 005 and choose the better gameplay-scale result.

## Revision 170
- [x] Puppet Forge loads the matching `ct_enemies_001.json` entry for known enemy projects and edits label, description, default hitbox, render scale, health, locomotion, AI strategy, and the complete defaults object.
- [x] Puppet Forge downloads the updated enemy catalog as `ct_enemies_001.json`.
- [x] Added the `bomber` flying strategy: move above Ignatius, maintain an authored hover height, and drop gravity-driven enemy projectiles on a cooldown.
- [x] Enemy 005 now demonstrates the bomber strategy with a falling bomb projectile.

## Revision 171
- [x] Bomber enemies now treat their placed position as a perch and remain there until Ignatius enters their awareness cone.
- [x] Active bombers fly toward a point above Ignatius, drop a gravity-driven rock when aligned, and return to their perch after awareness expires.
- [x] Added a dedicated procedural rock projectile rendering path, without introducing a new PNG dependency.


## Revision 172

- [x] Promote `enemy_005` from candidate to retained bombing bat.
- [x] Remove `enemy_004` project and catalog references.
- [x] Use the rock embedded in Atlas 005 for dropped projectiles.
- [x] Give inactive bombers a small perch patrol and normal visual awareness.

## Revision 173

- [x] Show the selected enemy type's default gameplay hitbox directly in Puppet Forge's animation preview.
- [x] Make default hitbox width, height, and render scale update the preview live while editing.
- [x] Add type-wide artwork X/Y offsets so a puppet can be centered relative to its gameplay hitbox without rewriting animation keys.
- [x] Apply artwork offsets in the runtime renderer and initialize the Bombing Bat with a better-centered visual offset.

## Revision 174

- [x] Move `ct_enemies_001.json` saving into a full JSON editor directly above Character JSON.
- [x] Give the enemy catalog the same Apply JSON, Reset, and Download workflow as the character, atlas, animation, and rig documents.
- [x] Keep the visual Enemy type defaults controls synchronized with the applied full catalog JSON.
- [x] Remove the separate catalog-download button from the defaults form.

## Revision 175

- [x] Keep hitbox dimensions, labels, scale, offsets, health, locomotion, and strategy synchronized into the in-memory enemy catalog as soon as their form fields change.
- [x] Refresh the full Enemy Catalog JSON editor immediately after type-default field edits.
- [x] Make Download apply the current type-default form before generating `ct_enemies_001.json`, preventing unapplied hitbox values from reverting after reload.

## Revision 178

- [x] Restore the player rocket projectile renderer accidentally removed while adding the enemy rock renderer.
- [x] Add a regression test ensuring the rocket draw method and dispatch call remain paired.


## Revision 179

- [x] Remove stale discarded enemy 006, 007, and 008 JSON assets that were accidentally reintroduced into the update archive.
- [x] Verify no runtime or editor references remain outside historical planning notes and regression assertions.

## Revision 181

- [x] Drop bomber projectiles from the bat's feet rather than the generic ranged-weapon origin.
- [x] Keep an alerted bomber hunting and repeatedly dropping rocks until awareness expires.
- [x] Raise the bomber's preferred hover height while clamping it below the visible top edge.
- [x] Replace straight-line pursuit with eased curved steering and subtle authored wander.
- [x] Probe terrain ahead and steer away with an authored clearance margin.
- [x] Include the supplied enemy catalog and level, rebaking the edited level's hunter navigation graph.

## Revision 182

- Fixed perched bomber take-off: obstacle probes now use the flying enemy body centre and a compact collision radius, preventing the platform under a bat from blocking every upward movement.
- Added a regression test for a bomber leaving a platform directly beneath its perch.

## Revision 184 bat architecture kindness pass

- [x] Keep the retained bat on the ordinary character-project and renderer path rather than adding a bat-only drawing system.
- [x] Add an explicit `exclusive_frame_parts` animation presentation contract for still-frame atlas sequences.
- [x] Validate that every declared frame part exists, uses step-keyed alpha, and leaves exactly one frame visible across the complete clip.
- [x] Mark the retained 22-frame bat clip with the new contract and preserve its authored source order.
- [x] Update the portable game-state build label and regression coverage.
- [ ] Consider extracting flying/bomber strategy updates from `simulation.js` into a dedicated portable enemy-flight module when a second flying enemy or a second aerial strategy is introduced. Do not split it merely to reduce line count before a reusable interface is clear.
- [x] Expose frame-based animation in Puppet Forge with conversion repair, ordered frames, and exclusive playhead authoring.

## Revision 190 unified character artwork placement

- [x] Define horizontal character artwork offsets in character-local space so facing mirrors the offset and artwork together.
- [x] Share runtime artwork-origin calculation between gameplay and Level Editor previews.
- [x] Make Puppet Forge use the runtime pose-to-transform path and scale artwork offsets with its display-only world scale.
- [x] Verify the retained bat in both facings in Puppet Forge, Level Editor, and gameplay using browser screenshots.

## Revision 193 prepared composite power-up artwork

- [x] Isolate the eight newly supplied icon sprites in `it_atlas_001.json`: coin, star, bomb, magnet, lightning, spark, wrench, and shield.
- [x] Isolate the full soft-alpha extent of the white glow sprite as `powerup_glow_white`.
- [x] Register centred, non-mirrored presentation objects and tags for later composite pickup/HUD use.
- [x] Reserve the wrench as the generic rocket-upgrade emblem over blue, green, yellow, red, or cyan glow tints.
- [x] Reserve the lightning emblem for a yellow-orange overdrive effect that later permits rockets twice as often for half the fuel.
- [x] Keep this revision data-only: do not add entity-catalog entries, collection logic, effect timers, HUD state, or save serialization yet.
- [x] Add regression coverage for all nine frame rectangles and the two reserved rocket-power-up meanings.
- [x] Define the portable power-up/effect schema after the crushing/depenetration and full-black kill-boundary safety work.
- [x] Add the first atlas-backed Rocket Overdrive pickup with renderer tint/composition, HUD feedback, serialization, and rocket tuning effects.


## Revision 194 higher, more organic bomber runs

- [x] Replace the first level's stale 190-unit bat hover override with the revised 280-unit attack station.
- [x] Add an explicit `bomberDropHeightTolerance` and require the bat to enter that vertical band before releasing a rock.
- [x] Add deterministic approach-arc lift so a bombing run bends upward instead of following a direct line.
- [x] Preserve restrained lateral wander near the final station instead of fading it to zero directly above Ignatius.
- [x] Ease maximum speed near the station so the bat settles into position rather than snapping or overshooting at full speed.
- [x] Update the retained bat catalog defaults and bake matching values into `level_001.json`.
- [x] Add regression coverage for curved approach motion, release altitude, catalog defaults, and the placed first-level bat.
- [x] Update the browser debug build label to revision 194.
- [ ] Keep watch for the rare green awareness-cone non-alert state and capture a repeatable save/state snapshot before changing perception logic.


## Revision 195 conservative moving-platform crushing

- [x] Preserve nearest-distance depenetration as the authoritative recovery rule.
- [x] Treat a crush as valid only when that nearest correction enters a distinct blocker and relative kinematic motion is closing the gap on the same axis.
- [x] Refuse farther sideways ejection when the nearest top/bottom or left/right exit is blocked.
- [x] Require three consecutive fixed-step crush candidates before defeat.
- [x] Emit `PLAYER_CRUSH_WARNING` on tick two and `PLAYER_CRUSH_NEAR_MISS` when a two-or-more-tick candidate resets.
- [x] Assert that ordinary moving-platform riding produces no crush warnings or near-miss diagnostics.
- [x] Route confirmed crushing into the shared player-death presentation instead of deforming the rig.
- [x] Respawn through the ordinary reset path after the shared death presentation completes.
- [x] Add deterministic regression coverage for three-tick confirmation, nearest-exit behavior, warning recovery, particles, and clean respawn.
- [x] Update the browser debug build label and portable game-state build label to revision 195.
- [x] Derive a gameplay kill boundary from the cave Full black guide and defeat Ignatius after crossing it.


## Revision 196 unified Ignatius spark death

- [x] Add one authoritative `cover` → `burst` → reset lifecycle for Ignatius.
- [x] Start the lifecycle whenever `damagePlayer` reduces HP to zero.
- [x] Detect externally assigned or restored zero HP at the fixed-step boundary.
- [x] Keep the frozen rig visible while progressively delayed purple, yellow, and white sparks cover the body.
- [x] Draw cover sparks after the player rig so they obscure rather than sit behind it.
- [x] Hide the rig only when the spark field explodes outward.
- [x] Use the same lifecycle for confirmed moving-platform crushing.
- [x] Disable enemy and projectile targeting through `combatState` and `targetable` during death.
- [x] Restore visibility, targeting, health, and spawn state together through `resetPlayer`.
- [x] Add regression coverage for HP-zero entry, three-colour cover/burst particles, outward movement, renderer order, crush integration, targeting, and respawn.
- [x] Update browser and portable build labels to revision 196.
- [x] Derive the gameplay kill boundary from the cave Full black guide and route it through the shared death lifecycle.


## Revision 197 separated projectile rocket and lightened FX

- [x] Increase Ignatius death-cover spark density and keep the camera on the death site for three additional seconds before respawn.
- [x] Register the separate wizard projectile rocket frame from the updated atlas and use it when firing rockets as weapons while retaining the backpack rocket on the character rig.
- [x] Reduce the everyday cost of rocket trails and impact bursts.
- [x] Use much more economical enemy projectile trails and explosions, including a short red fading trail for goblin fireballs.
- [x] Update browser and portable build labels to revision 197.


## Revision 198 enemy projectile visual language

- [x] Render the goblin fireball tail over the projectile bitmap so its broad root masks part of the authored rear flame.
- [x] Taper the short red trail from a broad fireball root to a thin fading tail and cap it to roughly two or three sprite lengths.
- [x] Keep non-player enemy projectile impacts visually separate from Ignatius rocket technology by using dark economical puffs without magical spark bursts.
- [x] Allow only a tiny yellow-purple magical accent when an enemy projectile actually hits Ignatius.
- [x] Update browser and portable build labels to revision 198.


## Revision 199 circular fireball tail and gamepad title start

- [x] Replace goblin fireball trail strokes with a compact chain of overlapping circles.
- [x] Keep circles opaque and near core width while they cover the authored rear flame, then progressively shrink and fade.
- [x] Continue drawing the procedural tail after the fireball bitmap.
- [x] Start the game from the title screen when the sampled gamepad jump action produces a press edge.
- [x] Consume the title-start edge so it does not also make Ignatius jump immediately.
- [x] Add regression coverage for gamepad jump edge handling and the circular trail renderer contract.
- [x] Update browser and portable build labels to revision 199.


## Revision 200 procedural goblin fireball

- [x] Replace the gameplay fireball sprite render with a procedural glowing fireball that visually matches the authored art more closely.
- [x] Rework the fireball trail so it tapers immediately and is composed of fiery circles rather than a hard red bar.
- [x] Preserve gamepad start support on the title screen.
- [x] Update browser and portable build labels to revision 200.


## Revision 201 implemented the chosen E1 procedural fireball

- [x] Replace the gameplay goblin fireball with the E1-style circle-based procedural fireball.
- [x] Keep the fireball fully procedural rather than returning to the static sprite.
- [x] Update browser and portable build labels to revision 201.


## Revision 202 animated enemy fireball emitter

- [x] Replace the static procedural goblin fireball body with a live emitter-style particle trail.
- [x] Emit small red, orange, and yellow circles from the projectile core over time.
- [x] Let emitted circles drift, shrink, and fade as the projectile moves onward.
- [x] Keep a compact bright core so the projectile remains readable.
- [x] Update browser and portable build labels to revision 202.


## Revision 203 tightened animated fireball particles

- [x] Cap newly emitted fireball circles so none visually rival the full authored fireball sprite.
- [x] Make emitted-circle radius decrease linearly from its initial size to zero.
- [x] Preserve the existing trail length and live-emitter behavior.
- [x] Update browser and portable build labels to revision 203.


## Revision 204 final fireball fallback strategy

- [x] Always render the authored fireball sprite as the projectile body.
- [x] Show animated circle particles only on High graphics quality.
- [x] Show only the sprite on Low and Medium quality.
- [x] Reduce newly emitted particle size to at most 18% of projectile radius.
- [x] Preserve linear particle shrink and the established trail length.
- [x] Update build labels to revision 204.


## Revision 205 polished fireball, story pacing, and death burst

- [x] Show the animated fireball trail on Medium and High graphics quality.
- [x] Keep Low graphics quality sprite-only.
- [x] Halve automatic letter and thought-bubble scrolling speed.
- [x] Remove visible skip-control instructions from story overlays.
- [x] Let either jump or fire advance story text.
- [x] Slow Ignatius death-burst particle launch speed by 25%.
- [x] Halve death-burst particle lifetime.
- [x] Update build labels to revision 205.


## Revision 206 story text pacing adjustment

- [x] Increase mailbox-letter scrolling speed by 25% relative to revision 205.
- [x] Increase thought-bubble scrolling speed by 25% relative to revision 205.
- [x] Preserve jump and fire as skip controls.
- [x] Update build labels to revision 206.


## Revision 207 character-paced story reading

- [x] Derive a shared reading speed from 482 characters over 36.9 seconds.
- [x] Calculate letter and thought duration from their actual character counts.
- [x] Add the 0.5-second assumed reading-start delay to each overlay.
- [x] Delay scrolling until the reader reaches the midpoint of the initial viewport.
- [x] End scrolling at the midpoint of the final viewport and hold until reading completes.
- [x] Update browser and portable build labels to revision 207.


## Revision 208 reading speed calibration

- [x] Set the shared story reading speed to 16 characters per second.
- [x] Preserve the 0.5-second start delay and midpoint-based scroll timing.
- [x] Update browser and portable build labels to revision 208.


## Revision 209 reading speed and blank letter heading

- [x] Change the shared letter and thought-bubble reading speed to 18 characters per second.
- [x] Remove the visible letter heading.
- [x] Preserve the existing blank title band so body-text spacing remains unchanged.
- [x] Update browser and portable build labels to revision 209.


## Revision 210 archive handoff checkpoint

- [x] Verify the supplied revision-210 ZIP is structurally readable and contains the expected project files.
- [x] Record that embedded build labels and planning history still ended at revision 209 rather than inventing an unverifiable revision-210 behavior.


## Revision 211 full-black death boundary and Rocket Overdrive

- [x] Add `src/shared/cave-kill-boundary-data.js` and derive a portable lethal loop from the exact sampled Full black outset.
- [x] Store normalized `caveWindow` and derived `caveKillBoundary` records in the runtime world during editor-level conversion.
- [x] Keep near-boundary and partial-body crossings safe; defeat Ignatius only when his complete body no longer intersects the lethal loop.
- [x] Make the decision fixed-step and camera-independent.
- [x] Emit a dedicated boundary-crossing event and route the outcome through the shared spark-death lifecycle and ordinary respawn.
- [x] Add deterministic coverage for shared outset identity, near-boundary survival, camera independence, death phases, and respawn.
- [x] Add `src/shared/power-up-data.js` with duration/permanence, refresh/extend/ignore stacking, serialization, HUD metadata, and rocket multipliers.
- [x] Implement the original 12-second refreshable Rocket Overdrive effect.
- [x] Halve projectile-rocket launch cooldown and fuel cost while Overdrive is active without changing backpack boost drain.
- [x] Add the Rocket Overdrive entity to the interactive catalog and preview its composite in the Level Editor.
- [x] Tint `powerup_glow_white`, draw `powerup_icon_lightning` above it, animate the pickup, and show remaining effect time in the HUD.
- [x] Place one Overdrive pickup on level 1's early main floor for immediate playtesting.
- [x] Preserve active effect state through serialization and expire it deterministically at the fixed-step boundary.
- [x] Clear the effect on death/reset according to its schema.
- [x] Update browser and portable build labels to revision 211.
- [x] Pass the complete aggregate headless test suite.

## Revision 212 eight-second Overdrive and three-bar HUD

- [x] Reduce Rocket Overdrive from 12 seconds to 8 seconds in shared defaults, catalog data, and the level-1 playtest pickup.
- [x] Put Health first and Rocket fuel second in the top-left HUD.
- [x] Round health and fuel labels to whole values and remove recharge/regeneration developer annotations.
- [x] Add a third Power bar with `Powerup: None` when inactive and remaining/total seconds when active.
- [x] Add deterministic shared HUD priority selection for future simultaneous effects.
- [x] Remove the overlapping top-right Canvas power-up badge.
- [x] Update browser and portable build labels to revision 212.
- [x] Pass the complete aggregate headless test suite.

## Revision 213 Overdrive and randomized wrench arsenal

- [x] Change the empty HUD label from `Powerup: None` to `Powerup:`.
- [x] Rename the lightning effect and catalog pickup to Overdrive while normalizing legacy `rocketOverdrive` IDs.
- [x] Keep Overdrive at eight seconds, half rocket fuel cost, double firing cadence, and higher HUD priority than wrenches.
- [x] Add a shared mutually exclusive `wrench` effect group with fifteen-second durations.
- [x] Implement Triple as three small one-third-damage homing rockets with distinct fan angles and separate target selection when possible.
- [x] Implement Dart as one normal-sized, forward, non-homing, double-damage rocket costing two-thirds standard fuel.
- [x] Implement Twin as two medium half-damage homing rockets with distinct launch angles.
- [x] Implement Bigbomb as a 1.7× rocket with triple fuel cost, triple damage, half speed, half homing response, and AoE radius of 1.5 wizard heights.
- [x] Implement Boomerang return after misses or destroyed targets and refund half launch fuel when caught.
- [x] Ensure collecting a wrench replaces only the active wrench and never cancels Overdrive.
- [x] Add deterministic shared HUD priority when Overdrive and a wrench coexist.
- [x] Add sixty-second respawn timers to all power-up pickups.
- [x] Add deterministic session-seeded random wrench selection at level start and reroll on respawn.
- [x] Preserve selected effect, respawn timer, and reroll count through state serialization.
- [x] Add Overdrive and random-wrench catalog entities and Level Editor composite previews.
- [x] Keep Overdrive at x=800 and add a random wrench at x=1400 in level 1.
- [x] Render per-mode projectile scale and a visible Bigbomb AoE pulse.
- [x] Update the game manual with durations, stacking, respawns, random wrench behavior, HUD priority, and all five wrench modes.
- [x] Update browser and portable build labels to revision 213.
- [x] Pass the complete aggregate headless test suite.



## Revision 214 cached wrench-rocket glow sprites

- [x] Store the launch-time wrench effect ID and glow tint on every wrench-modified projectile.
- [x] Keep standard and Overdrive-only rockets free of wrench glow metadata.
- [x] Add a presentation-only source-sprite/tint cache for precomposited rocket glows.
- [x] Expand the alpha silhouette with separable horizontal and vertical maximum-filter passes.
- [x] Blur the expanded silhouette with separable horizontal and vertical Gaussian passes.
- [x] Draw the cached tinted surface additively behind the authored rocket before the nozzle flame.
- [x] Preserve the correct tint for Triple, Dart, Twin, Bigbomb, and Boomerang rockets after launch.
- [x] Update the manual with the wrench-colour projectile cue.
- [x] Update browser and portable build labels to revision 214.
- [x] Add deterministic kernel, colour, projectile-metadata, cache-contract, and full-suite regression coverage.


## Revision 215 larger cached wrench-rocket outlines

- [x] Increase cached wrench-rocket glow size to three times the revision-214 default.
- [x] Include the glow-size multiplier in the rocket glow cache key.
- [x] Update browser and portable build labels to revision 215.
- [x] Pass the complete aggregate headless test suite.


## Revision 216 softer cached wrench-rocket glow blur

- [x] Increase the cached wrench-rocket blur kernel so the soft halo extends roughly 20% of rocket width beyond the sprite.
- [x] Use a correspondingly broader default Gaussian sigma for the halo blur.
- [x] Include the blur-outset fraction in the rocket glow cache key.
- [x] Update browser and portable build labels to revision 216.
- [x] Pass the complete aggregate headless test suite.


## Revision 217 pure wrench glows and Dart impact balance

- [x] Increase the cached wrench-rocket blur outset from 20% to about 25% of rocket width.
- [x] Broaden the Gaussian sigma for a softer fuzzy falloff.
- [x] Use exact pure yellow, cyan, green, red, and magenta for wrench pickup and rocket glows.
- [x] Remove additive and untinted-white glow paths that could wash wrench hues toward white.
- [x] Make Dart explicitly non-piercing and verify that it damages only the first enemy in line.
- [x] Update the game manual, browser revision, and portable build label to revision 217.
- [x] Pass the complete aggregate headless test suite.


## Revision 218 physical Boomerang return path

- [x] Keep Boomerang homing toward Ignatius when no valid enemy target remains.
- [x] Apply swept enemy, reactive-object, and terrain collision checks during the return phase.
- [x] Explode without refund when a return-path obstacle is encountered before Ignatius.
- [x] Make outbound terrain impacts explode rather than trigger a terrain-phasing return.
- [x] Add a deterministic blocked-return regression test.
- [x] Update the game manual and build labels to revision 218.
- [x] Pass the complete aggregate headless test suite.


## Revision 219 thirty-damage standard rocket balance

- [x] Reduce the standard Ignatius rocket from 55 damage to 30 damage.
- [x] Preserve multiplier-derived wrench damage: Triple 10 each, Twin 15 each, Dart 60, Bigbomb 90, and Boomerang 30.
- [x] Verify both 80-HP and 90-HP goblins survive two standard rockets and die on the third.
- [x] Verify exact zero HP is lethal.
- [x] Update the game manual and build labels to revision 219.
- [x] Pass the complete aggregate headless test suite.


## Revision 220 enemy-health defaults and rebalance

- [x] Establish 60 HP as the fallback for newly authored character enemies in runtime, Level Editor, and Puppet Forge catalog editing.
- [x] Set Skeleton Guard catalog and level health to 90 HP.
- [x] Set Fireball Goblin catalog and level health to 60 HP.
- [x] Set Musket Goblin catalog and level health to 60 HP.
- [x] Preserve Bombing Bat catalog and level health at 1 HP.
- [x] Add regressions for catalog values, baked level values, runtime fallback, and exact standard-rocket hit counts.
- [x] Update browser and portable build labels to revision 220.
- [x] Pass the complete aggregate headless test suite.


## Revision 221 wrench volley damage rebalance

- [x] Set Triple projectile damage to one-half standard damage: 15 each, 45 total.
- [x] Set Twin projectile damage to two-thirds standard damage: 20 each, 40 total.
- [x] Reduce Dart to standard rocket damage: 30.
- [x] Keep Bigbomb at 90 and Boomerang at 30.
- [x] Update the game manual and architecture documentation.
- [x] Update browser and portable build labels to revision 221.
- [x] Pass the complete aggregate headless test suite.


## Revision 222 archive repack

- [x] Record revision 222 as an unchanged repack of revision 221 with no invented feature delta.


## Revision 223 Shield power-up

- [x] Define a five-second refreshable Shield effect with the reserved shield icon and a blue pickup glow.
- [x] Let Shield coexist with Overdrive and one active wrench while taking highest priority in the Power HUD.
- [x] Block ordinary incoming damage in portable simulation while Shield is active.
- [x] Preserve explicit `bypassInvulnerability` rules for intentionally lethal damage.
- [x] Flash all wizard artwork blue while protected, including the backpack rocket.
- [x] Suppress the red critical-health tint whenever the blue Shield flash is active.
- [x] Add the Shield pickup to the interactive entity catalog and place it in level 1 at x=1900.
- [x] Keep Shield pickup respawn at sixty seconds.
- [x] Document that bomb, magnet, and spark remain intentionally unused and the current power-up milestone is complete.
- [x] Update the game manual, architecture contract, plan, tests, and build labels to revision 223.
- [x] Pass the complete aggregate headless test suite.


## Revision 224 defer grounded mob death until landing

- [x] Add an explicit portable `death_pending_landing` combat state and serialized `deathPendingLanding` flag for ground-locomotion character enemies.
- [x] Record lethal health and remove the enemy from targeting immediately without selecting the death animation in midair.
- [x] Preserve the existing jump/drop velocity, traversal metadata, and ordinary swept collision until the enemy lands.
- [x] Start the complete authored death animation only on the landing tick, with zero residual velocity and retained support identity.
- [x] Keep immediate grounded deaths and flying-enemy fly-off deaths unchanged.
- [x] Replace the obsolete airborne-corpse regression with a lethal-hit test that proves continued jump motion, no midair death clip, grounded death start, and no second corpse drop.
- [x] Update architecture guidance, plan history, tests, and build labels to revision 224.


## Revision 225 roadmap definition

- [x] Record Score and treasure chests as the first new gameplay milestone.
- [x] Keep Score explicitly separate from any future Gold currency or upgrade economy.
- [x] Define the weak standard-rocket splash as a pre-generator crowd-control milestone.
- [x] Record location-triggered thoughts, basic boss support, and water volumes as ordinary authored systems before richer generator use.
- [x] Define Earth Cavern and Ice Cavern as JSON theme presets with Level Editor overrides and no Theme Editor requirement.
- [x] Define registered Route Planner, Cavern Envelope Builder, Traversal Builder, Endpoint Placer, Encounter Populator, Reward/Prop Populator, Decorator, and Validator stages.
- [x] Record deterministic named seed streams, generated-object provenance, undo/clear safeguards, and validation reporting.
- [x] Record that generated entrance and exit doors must use whitelisted visually substantial `doorSupport` platforms.
- [x] Split automatic generation into infrastructure/preview, playable empty cavern, encounters, rewards, and richer-world refinement slices.
- [x] Update portable and browser build labels to revision 225 without changing gameplay behavior.


# Upcoming implementation checklist

## Milestone A: Score and treasure chests

- [x] Add authoritative non-negative integer Score to portable game state.
- [x] Preserve Score across ordinary death/respawn, level transitions, and save/restore; reset it only for a genuinely new game/full-session reset.
- [x] Add Score to the HUD as a read-only projection of portable state.
- [x] Emit deterministic score-change events for temporary presentation feedback.
- [x] Add editable `scoreValue` and collection-distance fields to treasure-chest level data and the Level Editor inspector.
- [x] Use the matched `chest_open_loot` and `chest_open_empty` visuals for automatic proximity collection; keep the differently angled closed artwork out of the normal state flow.
- [x] Award each chest exactly once and serialize its collected/open state.
- [x] Show brief `+N` and restrained collection effects without introducing a Gold counter.
- [x] Add headless and browser regressions for duplicate prevention, save/restore, death/respawn, HUD projection, and chest-state transitions.
- [x] Update the manual, architecture contract, plan history, and build labels for the implementation revision.

## Milestone B: weak standard-rocket splash

- [ ] Add a one-damage secondary-enemy splash to the standard projectile mode.
- [ ] Keep direct-hit damage at 30 with no extra splash point on the directly struck enemy.
- [ ] Use an initial splash diameter of approximately two wizard heights, subject to playtest.
- [ ] Trigger the splash on standard-rocket impacts with enemies, blockers, and terrain.
- [ ] Affect enemies only and leave Ignatius, chests, doors, switches, and reactive scenery untouched.
- [ ] Preserve the splash under Overdrive and Shield, but exclude all wrench projectile modes.
- [ ] Add a restrained visual pulse distinct from Bigbomb.
- [ ] Add deterministic regressions for range, direct-hit exclusion, multiple secondaries, Overdrive, Shield, and wrench exclusion.
- [ ] Playtest clustered Bombing Bats and tune diameter/line-of-effect behavior if necessary.

## Milestone C: location-triggered thought bubbles

- [ ] Add an editor-placeable rectangular thought trigger with text, bounds, one-shot policy, and stable ID.
- [ ] Trigger only on entry and serialize consumed state.
- [ ] Reuse the existing 18-characters-per-second reader, scrolling, final hold, input lock, and Jump/Fire advance behavior.
- [ ] Refactor mailbox and location triggers through a shared generic thought-sequence entry point.
- [ ] Render trigger bounds in the Level Editor while keeping them invisible in gameplay.
- [ ] Add deterministic and browser-assisted trigger/serialization regressions.

## Milestone D: basic boss encounters

- [x] Add `isBoss` and `bossName` to enemy placements and Level Editor controls.
- [x] Show one current/max-health boss bar for the actively engaged boss.
- [x] Activate the bar through awareness or damage and hide it after defeat.
- [ ] Add an explicit encounter activation/reset hook if a later arena controller needs one.
- [x] Emit a deterministic boss-defeated event and optional named signal.
- [x] Preserve ordinary enemy scale, health, movement, and attack overrides as the boss implementation foundation.
- [x] Add regressions for identity, health projection, defeat, signal gates, serialization, and ordinary non-boss enemies.
- [x] Let hanging/spiked gates remove their blocking collision when a matching signal activates.
- [x] Let placeable enemy spawners stop on an optional named signal.

## Milestone E: rectangular water volumes

- [ ] Add editor-placeable rectangular water-volume data and preview.
- [ ] Detect body overlap and nose/breathing-point submersion deterministically.
- [ ] Slow movement in water and tune reduced jump/backpack-rocket effectiveness.
- [ ] Apply deterministic continuous health loss while the nose is submerged.
- [ ] Let Shield block ordinary water damage unless later design explicitly changes that rule.
- [ ] Preserve ordinary submerged terrain collision so Ignatius walks on the bottom.
- [ ] Add entry/exit ripple presentation without simulation ownership.
- [ ] Serialize any water-damage accumulator and add movement/damage/save regressions.

## Automatic Level Generator 0: infrastructure and route preview

- [x] Add data-driven Earth Cavern and Ice Cavern theme preset JSON.
- [x] Add environment-atlas allowlisting to colour-map data so Ice does not recolour doors, chests, mailboxes, or power-up icons.
- [x] Add registries for route, cavern, traversal, endpoints, encounters, rewards, decoration, and validation implementations.
- [x] Add a dedicated Automatic Level Generator panel with theme, seed, size, verticality, winding, branching, difficulty, safety, density, and enemy-filter controls.
- [x] Add advanced generator-implementation dropdowns populated from the registries.
- [x] Add deterministic named random streams for each generation stage.
- [x] Add enemy-selection range/exclusion parsing and resolved-enemy preview.
- [x] Generate and display a progression-ordered abstract route beginning right and ending right at a right-side exit.
- [x] Support optional branches and merges while retaining one identifiable mandatory route.
- [x] Add generation-run provenance and a visible route overlay.
- [x] Make a generation run one undoable operation and support clearing generated content without deleting manual content.

## Automatic Level Generator 1: playable empty cavern

- [x] Add an overlapping-ellipse/capsule occupancy-mask cavern envelope builder.
- [x] Trace, simplify, smooth, and convert the connected envelope into existing cave-window data.
- [x] Add generation-role metadata/catalog data for floors, landings, recovery platforms, walls, ceilings, bridges, decoration, and `doorSupport`.
- [x] Add a forgiving traversal builder using conservative measured Ignatius movement envelopes.
- [x] Build wide landings, generous headroom, selected double-jump/hover transitions, and recovery platforms.
- [x] Reserve safe entrance and exit chambers on the left and right.
- [x] Place doors only on whitelisted visually substantial `doorSupport` assets or validated support assemblies.
- [x] Derive world bounds and reset boundary from generated envelope and traversal.
- [x] Validate every mandatory transition, endpoint support, spawn, landing, and world-bound condition.

## Automatic Level Generator 2: encounters

- [x] Add enemy-generation metadata for placement class, group range, difficulty cost, clearance, patrol room, and other hints.
- [x] Add difficulty-budgeted, locomotion-aware encounter placement with calm entrance/exit zones.
- [x] Place Bombing Bats in groups of two or three.
- [x] Build or refresh navigation data required by generated hunter enemies.
- [x] Validate that ground, ranged, and flying enemies have appropriate space and cannot create unavoidable spawn damage.
- [x] Require the weak standard-rocket splash milestone before considering clustered bats balanced enough for routine generation.

## Automatic Level Generator 3: rewards and props

- [x] Require completed Score/treasure behavior before chest generation.
- [x] Prefer treasure at optional branch destinations and meaningful detours.
- [x] Place contextual, restrained power-ups rather than uniform random pickups.
- [x] Add optional location-triggered thought placement through explicit theme/settings rules.
- [x] Keep beginning/end doors under Endpoint Placer ownership rather than treating them as generic props.
- [x] Validate reward accessibility and avoid overcrowding endpoint chambers.

## Automatic Level Generator 4: richer world features and editing refinement

- [ ] Add water basins only after rectangular water behavior is stable.
- [ ] Add boss-arena landmarks only after boss support is stable.
- [x] Add stage-specific regeneration without perturbing unrelated named random streams.
- [x] Add locking and converting generated objects to manual ownership.
- [x] Improve route diagnostics and validation visualization.
- [ ] Later evaluate moving platforms, signal mechanisms, required rocket sections, reactive-world solutions, and additional route/cavern/traversal implementations.

## Content production and renderer decision

- [ ] Use generated drafts plus new enemy assets to begin real level production and manual refinement.
- [ ] Profile representative densely decorated real levels in target browsers and Electron.
- [ ] Add WebGL2 only if measurements identify Canvas presentation as the material bottleneck.
- [ ] Preserve engine-neutral level, generation, validation, and portable-state contracts so Electron and a possible Unreal Engine 5 port remain viable options.


## Revision 226 Score HUD and treasure-chest implementation

- [x] Add authoritative portable Score state with deterministic `SCORE_CHANGED` events.
- [x] Preserve Score through ordinary death/respawn, level transitions, and save/restore.
- [x] Project `Level N: <title>` and `Score: N` above the Health bar.
- [x] Rename level 1 to `The Introductory Cave of Training`.
- [x] Implement proximity-opened treasure chests with editable Score value and collection distance.
- [x] Begin chests open with visible loot, swap to the matched empty-open visual, and prevent duplicate awards.
- [x] Keep chest collision disabled while preserving it as an ordinary editor entity.
- [x] Add the first 100-point chest and later move it onto the substantial exit-door platform.
- [x] Add presentation-only `+N` feedback and deterministic regression coverage.
- [x] Advance portable and browser build labels to revision 226.


## Revision 227 treasure-chest presentation refinement

- [x] Reduce the default chest footprint to 72 by 84 world units for broad ledge compatibility. Later refined to 68 by 80 with a 4-pixel lower visual seat on narrow ledges.
- [x] Normalize open-loot and open-empty atlas cutouts to matched dimensions and alignment.
- [x] Start uncollected chests visibly open with loot and remove the mismatched closed artwork from the normal flow.

## Revision 228 Level Editor snap and demonstration placement

- [x] Change the Level Editor default and fallback Snap grid from 32 to 16 world units.
- [x] Move the level-1 demonstration chest to `(4768, 512)` on `exit_ground`, beside the exit door.
- [x] Verify the compact chest footprint is fully over the platform's drawn walkable top and does not float or hang past an edge.
- [x] Add regressions for the 16-pixel Snap default and authored chest support placement.

## Revision 229 wrench-glow preload and gamepad haptics

- [x] Pre-generate all registered wrench rocket glow surfaces during renderer startup.
- [x] Keep the first powered projectile draw on the same cached glow path used by later shots.
- [x] Show wrench-glow preparation through the existing loading progress callback.
- [x] Track meaningful gamepad input using mapped buttons and analog movement beyond deadzones.
- [x] Give gamepad ownership a short idle grace period and revoke it immediately when keyboard or pointer gameplay input takes over.
- [x] Rumble strongly on actual player damage and more gently on successful rocket launch, double-jump boost start, and sustained hover.
- [x] Consume events received while gamepad haptics are inactive so they are never replayed later.
- [x] Rate-limit hover pulses and fail silently when vibration APIs are unavailable.
- [x] Add regression coverage for preload wiring, input-device ownership, haptic strengths, event deduplication, and hover rate limiting.


## Revisions 230-232 powered projectile presentation

- [x] Load a supplemental wizard atlas through the runtime character project.
- [x] Store one authored powered-rocket frame for every wrench effect.
- [x] Precompose the base projectile and coloured halo so powered rockets require one sprite draw.
- [x] Preserve the ordinary rocket frame and the separate procedural flame path.
- [x] Carry the launch-time wrench colour into persistent rocket trail puffs.
- [x] Use the colour as a restrained smoke/sparkle accent without recolouring ordinary trails.
- [x] Add regression coverage for supplemental atlas loading, one-draw powered sprites, and tinted-versus-neutral trail records.

## Immediate readiness before Automatic Level Generator 0

- [x] Complete the weak standard-rocket secondary splash before Generator 0.
- [x] Treat deterministic RNG, theme JSON, generator registries, generation provenance, undo grouping, and route overlay as Generator 0 work rather than a separate prerequisite refactor.
- [x] Keep boss support, water, and location-triggered thoughts non-blocking for Generator 0 and Generator 1; integrate them only in the later slices already named in the plan.

## Revision 233 standard-rocket secondary splash

- [x] Give standard rockets exactly 1 damage against nearby secondary enemies.
- [x] Use a one-wizard-height radius, equivalent to a diameter of roughly two wizard heights.
- [x] Exclude the directly struck enemy so normal direct damage remains exactly 30.
- [x] Trigger the enemy-only splash on enemy, terrain, and reactive-object impacts.
- [x] Keep reactive scenery immune to the weak secondary splash.
- [x] Preserve the splash for Overdrive while disabling it for every wrench mode.
- [x] Add deterministic diagnostics and regression coverage for direct, nearby, distant, Overdrive, and wrench cases.
- [x] Mark the pre-generator prerequisite list complete.

## Revision 234 Automatic Level Generator 0 route foundation

- [x] Add versioned Earth Cavern and Ice Cavern theme presets.
- [x] Scope Ice recolouring to environment atlases and leave interactive/story artwork untouched.
- [x] Add deterministic named random streams and stage implementation registries.
- [x] Add a Level Editor generator panel with ordinary and advanced controls.
- [x] Parse enemy ranges and exclusions and show the resolved catalog selection.
- [x] Generate several deterministic candidates per seed, reject invalid candidates, and retain the strongest route.
- [x] Guarantee one mandatory start-to-exit route with optional branches that rejoin it.
- [x] Draw route ownership, direction, branch structure, start, and exit in the editor overlay.
- [x] Preserve generation provenance and support guarded one-step generation undo/redo.
- [x] Clear generated records without deleting manually authored level content.
- [x] Add deterministic, stress-matrix, crossing, provenance, theme, and editor-contract regressions.
- [x] Validate 12,000 generated theme/size/shape combinations and inspect representative route renders before handoff.

## Revision 235 Automatic Level Generator 1 playable empty cavern

- [x] Convert the selected abstract route into one connected cave-window envelope using deterministic overlapping chamber and corridor samples.
- [x] Materialize ordinary collision-bearing atlas placements for the guaranteed mandatory spine.
- [x] Preserve optional branch nodes and edges as explicit preview reservations instead of pretending unpopulated detours are already useful gameplay.
- [x] Add a versioned platform-generation catalog with explicit roles, native dimensions, scale ranges, surface heights, door-support rules, mirroring, and authored walkable-edge insets.
- [x] Measure generated jumps between authored collision-bearing walkable edges rather than transparent frame bounds.
- [x] Keep mandatory gaps, rises, and drops inside conservative traversal limits and add recovery ledges without allowing them to obstruct the spine.
- [x] Place entrance and exit doors on wide validated supports inside calm endpoint chambers.
- [x] Derive cave bounds, world bounds, reset height, ownership markers, and reversible replacement of the previous generated shell.
- [x] Evaluate several deterministic route-and-geometry candidates for each seed and retain the strongest complete valid cavern.
- [x] Add regressions for deterministic drafts, ownership, platform metadata, walkable widths, endpoint support, cave containment, transition limits, and editor contracts.
- [x] Stress-test 800 theme, length, shape, and seed combinations without a validation failure.
- [x] Headlessly traverse 24 representative generated levels through the real atlas collision, completing 867 mandatory transitions, including 190 transitions that used Ignatius's second-jump rocket kick.
- [x] Render and inspect representative Earth and Ice cavern overviews before handoff.
- [x] Run persistent-state entrance-to-exit pilots across all eight rendered levels, preserving momentum, fuel use, recharge delay, and prior landing position between transitions.

## Revision 236 Automatic Level Generator 2 encounters

- [x] Add `assets/level-generator-enemies.json` as a versioned behavior and placement metadata catalog for every currently supported generated enemy.
- [x] Keep encounter randomness on its own named deterministic stream so population changes do not perturb route or cavern selection.
- [x] Compute a difficulty budget from route scale, enemy density, difficulty, and safety, while preserving a genuinely empty zero-density result.
- [x] Guarantee entrance and exit calm zones at least as large as the maximum selected enemy awareness range plus a safety buffer.
- [x] Place ground enemies only on mandatory supports with sufficient authored walkable collision width, edge clearance, protected incoming landing space, headroom, and patrol room.
- [x] Generate Bombing Bats only in compact groups of two or three with non-overlapping hitboxes and sufficient flying airspace.
- [x] Rebuild existing hunter navigation graphs after generated Fireball or Musket Goblins are applied, and include those graphs in generation replacement, undo, redo, and clear snapshots.
- [x] Add combined cavern-and-encounter validation for calm zones, terrain embedding, support, spacing, group size, airspace, and hunter navigation requirements.
- [x] Preserve generator run ownership and stage provenance on every generated enemy and report budget, spend, class counts, bat groups, hunters, calm distance, and warnings.
- [x] Add deterministic, filtering, zero-density, bat-only, ownership, navigation-preservation, and 160-case built-in stress regressions.
- [x] Run an additional 800-case encounter stress matrix without an accepted-draft validation failure.
- [x] Hydrate representative drafts through real atlas collision, bake hunter navigation, and verify every tested hunter has a navigation support.
- [x] Simulate Ignatius stationary at the entrance for 360 fixed steps in four populated representative caverns with zero alerts and zero player damage.
- [x] Render and visually inspect eight populated Earth and Ice caverns across Compact through Grand before handoff.

## Revision 237 Automatic Level Generator 3 rewards and props

- [x] Add `assets/level-generator-rewards.json` as a versioned catalog for branch treasure, contextual power-ups, utility pickups, narrative triggers, spacing, progression ranges, and per-draft limits.
- [x] Keep branch and reward selection on the independent rewards random stream so tuning rewards does not perturb route, cavern, or encounter streams.
- [x] Prefer reward-rich candidates that materialize eligible branches instead of accepting a marginally higher-scoring branchless draft.
- [x] Materialize selected branches as lower returnable detours rather than upper shelves that create accidental ceilings.
- [x] Reserve a collision-open 116-unit shaft with a catalogued `shaftBridge` support assembly.
- [x] Begin each shaft with two alternating `branchStep` footholds that leave player-width entry space and enough walkable width to stand and turn.
- [x] Use broad lower supports for the reward alcove and keep the abstract merge edge preview-only.
- [x] Place exactly one positive-Score treasure chest at every materialized branch destination.
- [x] Place progression-aware contextual pickups sparingly, prevent repeated pickup types in one draft, and avoid endpoint and enemy crowding.
- [x] Add the opt-in invisible one-shot `thoughtTrigger` entity and keep generated location thoughts disabled by default.
- [x] Preserve Endpoint Placer ownership for entrance and exit doors and preserve generation run, stage, route, support, and branch provenance on reward records.
- [x] Extend generation clear, replacement, undo, and redo to affect only generator-owned reward and narrative records.
- [x] Draw actual materialized branch traversal separately from reservations and preview-only merge hints in the Level Editor overlay.
- [x] Add combined validation for branch shafts, foothold and alcove widths, bidirectional transitions, branch treasure, accessibility, endpoint calm space, enemy overlap, and thought opt-in.
- [x] Add deterministic, zero-density, thought opt-in, ownership, branch geometry, reward accessibility, and 80-case built-in stress regressions.
- [x] Run an additional 800-case reward stress matrix with 963 materialized detours, zero accepted-draft validation failures, and a minimum quality score of 93.5.
- [x] Verify all 11 representative branch entries through real atlas collision and sweep 110 branch transition directions without an invalid landing.
- [x] Render and visually inspect eight rewarded Earth and Ice caverns across Compact through Grand before handoff.



## Revision 238 Automatic Level Generator 4 editor refinement

- [x] Add normalized per-stage revision counters and derive independent revision-specific named random streams without changing the base seed.
- [x] Preserve the accepted route attempt during encounter and reward rerolls.
- [x] Regenerate encounters without changing terrain, cave envelope, endpoints, rewards, or non-encounter entities.
- [x] Regenerate rewards and materialized detours while preserving and support-reanchoring the existing encounter population.
- [x] Skip identical deterministic candidates so a successful reroll represents an actual stage change.
- [x] Validate every combined reroll before applying it and rebuild existing hunter navigation after accepted population-affecting changes.
- [x] Add generated-object locking that blocks drag, delete, copy, and inspector mutation.
- [x] Add conversion to manual ownership with a compact provenance receipt understood by validation.
- [x] Prevent stage regeneration from silently replacing manualized dependent records.
- [x] Add validation-only reruns that detect support geometry drifting out of sync with traversal metadata.
- [x] Add editor overlays for walkable spans, mandatory and optional transitions, branch shafts, calm zones, encounter anchors, reward anchors, and invalid records.
- [x] Preserve lock and manualization state through guarded generator undo and redo.
- [x] Add deterministic refinement regressions covering stage isolation, reward re-anchoring, support drift, manual replacements, finite overlay geometry, and editor controls.
- [x] Stress 200 complete caverns across both themes and every length: 199 changed encounter alternatives, one genuinely constrained population, 110 changed reward alternatives, 310 combined validation checks, 40 deliberate drift detections, and zero failures.
- [x] Render and inspect paired before/after rerolls, clean/invalid validation overlays, locking, and manual ownership before handoff.
- [ ] Keep water basins deferred until rectangular water volumes have a stable generated-level contract.
- [ ] Keep boss landmarks deferred until boss runtime and arena validation contracts exist.

## Revision 239 generated perimeter readability and spatial culling

- [x] Invoke deterministic Populate perimeter automatically for generated caverns unless the selected theme suppresses decoration.
- [x] Preserve cave-foreground records as inert ordinary placements with automatic-generator run and decoration-stage ownership.
- [x] Add theme-normalized support, endpoint, and reward protection padding for perimeter decoration.
- [x] Validate and shift the complete radial decoration stack rather than only its inward sprite.
- [x] Guarantee zero generated-foreground overlap with padded entrance, exit, and reward regions.
- [x] Prevent ordinary decoration stacks from overlapping padded traversal supports.
- [x] Limit rare occlusion accents to at most eight-percent protected-support coverage and omit stacks that cannot be made safe.
- [x] Recognize automatic-generator-owned foreground in Level Editor visibility, counting, clear, and guide paths.
- [x] Partition cached static world visuals into stable X buckets while preserving painter order.
- [x] Query camera-local main, actor-front, and parallax-adjusted cave-foreground candidates before exact viewport culling.
- [x] Keep dynamic-position visuals outside static bins and recalculate their current bounds on every query.
- [x] Add spatial-cull counts to renderer diagnostics and the browser debug panel.
- [x] Add a WeakMap-backed X-bucket broadphase for static solids, collision segments, and collision polygons.
- [x] Keep moving-platform, reactive, and explicitly dynamic collision records live and preserve source-order collision precedence.
- [x] Add regression coverage for theme suppression, endpoint protection, support coverage, visual order, dynamic candidates, and collision broadphase behavior.
- [x] Stress 160 generated caverns across both themes and all four lengths with zero failures, zero endpoint overlaps, and zero supports above ten-percent foreground coverage.
- [x] Measure a representative Grand cavern: 93.7-percent foreground and 92.1-percent other-static spatial rejection before exact culling; 851 collision segments reduced to 71.1 average local candidates.
- [x] Render and inspect authentic 1280-by-720 camera crops for Earth and Ice Standard and Grand caverns, including entrance, middle, and exit views.
- [x] Keep WebGL2 deferred until representative profiling shows local drawing or composition, rather than global scanning, is the remaining bottleneck.

## Revision 240 macro rooms, grounded endpoints, and guaranteed walls

- [x] Add deterministic ascending/descending Z, ascending/descending L, valley, stepped-terrace, and rolling macro route plans.
- [x] Record the accepted macro pattern, anchors, vertical span, and room reservations in normalized generation provenance.
- [x] Reserve one through four macro rooms by level length, commonly larger than one screen and capped at four by three screens.
- [x] Increase current-theme macro vertical spans so high-verticality Standard through Grand routes produce meaningful climbs and descents rather than near-horizontal chains.
- [x] Build the cave opening from explicit tunnel, chamber, endpoint-chamber, and macro-room stamps around traversal supports.
- [x] Guarantee platform wall, ceiling, and floor clearance across the complete authored support width.
- [x] Place entrance and exit doors inward on wide door supports, with exact floor anchoring and substantial distance from the dark boundary.
- [x] Require a non-empty perimeter-decoration catalog for final Level Editor generation whenever the theme requests populated walls.
- [x] Validate non-empty perimeter output, strict endpoint/reward exclusion, maximum support coverage, cave clearances, endpoint side clearance, door floor error, and room dimensions.
- [x] Re-run presentation validation when validating an edited generated snapshot whose perimeter stage was active.
- [x] Strengthen the manual Populate perimeter protection regions to match current generated-cavern readability rules.
- [x] Correct encounter endpoint-distance metrics so calm-zone diagnostics report their intended value.
- [x] Reduce cave-profile sample density while retaining support centres, macro-room shoulders, endpoint shoulders, and a bounded global grid.
- [x] Add regression coverage for v2 theme defaults, missing required perimeter catalogs, grounded doors, wall clearances, room bounds, Z/L pattern distribution, and Level Editor enforcement.
- [x] Stress 320 complete caverns across both themes and all four lengths with zero failures, 181–512 perimeter placements, at most 5.02-percent platform coverage, and all seven macro patterns represented.
- [x] Render and inspect authentic-atlas overviews plus entrance and exit camera crops for six Z, L, valley, and terrace caverns before handoff.


## Revision 241 grounded portal anchors, vertical route rhythm, and moving supports

- [x] Fix generated entrance and exit entity Y coordinates so the runtime/editor floor anchor equals the support collision surface.
- [x] Update both standalone and presentation validation to compare the portal anchor directly with `support.surfaceY`.
- [x] Replace the previous shallow macro Y modulation with explicit Z, L, valley, terrace, and rolling vertical phases.
- [x] Preserve conservative mandatory rise/drop limits while increasing whole-level vertical span.
- [x] Add deterministic automatic shuttle platforms: one in Standard, two in Extended, and three in Grand when suitable intermediate supports exist.
- [x] Add regression assertions for exact portal anchoring, moving-platform counts, and substantial Grand-route vertical span.
- [x] Run the complete regression suite after the correction.

## Revision 242 folded spatial routes and occupancy contours

- [x] Split the Route implementation conceptually into topology planning and two-dimensional spatial embedding.
- [x] Generate a fresh macro spatial plan for every deterministic candidate attempt rather than jittering one shared plan.
- [x] Add genuine mandatory leftward phases and horizontal reversals to Z, L, valley, terrace, and rolling route families.
- [x] Preserve a deliberately simpler compact low-winding arc while requiring folded Standard through Grand routes to backtrack.
- [x] Add route metrics and ranking for backtracks, horizontal and vertical direction changes, longest eastward run, travel expansion, occupied lanes, and bounding-box aspect ratio.
- [x] Reject folded routes that remain too wide and shallow or fail to occupy the requested vertical lanes.
- [x] Remove one-jump rise/drop clamps from macro route-node placement and leave local movement limits to Traversal Realization.
- [x] Add conservative staircase realization for steep macro edges and alternating shaft landings for near-vertical edges.
- [x] Use shallower landing supports around major vertical connections and retain a calm horizontal final approach to the exit.
- [x] Allow encounter placement on safe mandatory node landings as well as broad route-floor supports.
- [x] Add `contour-cavern-v3`, rasterizing expanded room and corridor stamps into an occupancy mask and tracing its connected boundary.
- [x] Simplify arbitrary closed contours without accepting self-intersections.
- [x] Replace single top/bottom vertical-range assumptions with interval selection inside the arbitrary cave polygon.
- [x] Preserve separated upper and lower tunnels at the same X instead of filling the rock between them.
- [x] Reorder the documented generator dependency sequence to Route, Traversal, Endpoints, Cavern, Encounters, Rewards, Decoration, Validation.
- [x] Preserve spatial-lane and intended-direction provenance through generation normalization.
- [x] Update Earth and Ice themes to `spatial-lane-route-v3`, `contour-cavern-v3`, and `folded-cavern-validation-v3`.
- [x] Add regression coverage for implementation IDs, real backtracking, direction changes, lane count, aspect-ratio ceilings, occupancy diagnostics, and multi-interval cave contours.

## Revision 243 ThePath74 route and ellipse-room cavern integration

- [x] Preserve the experimentally selected ThePath algorithm as the legacy `ThePath` backup and adopt the horizontal-7/vertical-4 variant as `the-path74-route-v4`.
- [x] Generate the protected route on an unbounded integer grid with cardinal-only movement.
- [x] Request horizontal leg lengths from 1–7 and vertical leg lengths from 1–4.
- [x] Check both the next cell and one-cell look-ahead before every committed route step.
- [x] Preserve a complete eight-neighbour one-cell margin from older non-local route cells while allowing ordinary corners near the current and previous cells.
- [x] Force the final leg Right and accept only candidates whose exit is the rightmost route point.
- [x] Store the complete numbered cell path, segment directions, requested/actual leg lengths, cell scale, bounds, and room reservations in generation provenance.
- [x] Emit abstract route nodes only at endpoints, turns, and selected room anchors.
- [x] Select two to four well-separated room anchors on the route or its nearest-labelled boundary.
- [x] Use independent horizontal and vertical room semi-axes of 2–4 cells.
- [x] Add the selected ellipse rooms to traversal and endpoint stamps before occupancy-contour tracing.
- [x] Register and make current `the-path74-route-v4`, `the-path74-contour-cavern-v4`, and `the-path74-cavern-validation-v4` while retaining revision-242 IDs as legacy alternatives.
- [x] Increase the deterministic near-vertical shaft-zigzag offset so pure vertical legs expose valid landing width.
- [x] Update Earth and Ice themes, Level Editor copy, build labels, architecture, plan, and regression expectations.
- [ ] Continue playtesting room placement and add shortcut-aware room rejection only after the desired visual shape is confirmed in the integrated editor/runtime.

## Revision 244 spaced platforms and moving vertical shafts

- [x] Register `spaced-platform-traversal-v2` and make it the Earth and Ice default while retaining `forgiving-traversal-v1` as a legacy alternative.
- [x] Treat ThePath74 as a macroscopic guide rather than placing one continuous floor directly on the route.
- [x] Split horizontal route edges into authored landing platforms separated by visible air gaps measured from real walkable collision edges.
- [x] Apply bounded vertical offsets to horizontal intermediate platforms so mandatory play includes local jumps both above and below the planned route line.
- [x] Preserve broad, shallow landings at chamber and recovery nodes so doors and encounter groups still have usable space.
- [x] Realize every mandatory climb and descent with exactly one automatic vertically shuttling platform.
- [x] Remove static staircase and shaft-zigzag intermediate supports from mandatory vertical route edges.
- [x] Validate safe boarding at both moving-platform endpoints and require pure vertical movement over the complete route-node height difference.
- [x] Add moving-platform travel-shaft stamps to the cavern occupancy contour so rock cannot close through the lift path or destination.
- [x] Reduce recovery-platform generation so it does not recreate a continuous secondary floor beneath the spaced route.
- [x] Add traversal metrics and regression checks for moving vertical platform count, forbidden static vertical supports, horizontal jump-gap count, minimum gap, and maximum vertical route offset.
- [x] Update generator IDs, theme selections, Level Editor copy, build revision, plan, and architecture documentation.

## Revision 245 layered recovery traversal and stalactite/stalagmite perimeter

- [x] Inspect the manually authored `assets/level_001.json` platform structure as the reference for a vertically varied upper route and a broad lower recovery path.
- [x] Register `layered-recovery-traversal-v3` and make it the Earth and Ice default while retaining `spaced-platform-traversal-v2` and `forgiving-traversal-v1` as legacy alternatives.
- [x] Increase deterministic vertical variation among horizontal upper-route platforms while keeping every local transition inside the conservative movement envelope.
- [x] Keep explicit collision-edge jump gaps between upper-route platforms.
- [x] Generate level lower recovery lanes beneath suitable horizontal route edges.
- [x] Place recovery supports under every upper jump gap so a missed upper jump has a landing below it.
- [x] Add deliberate gaps to the recovery lane and guarantee that those gaps do not overlap upper-route gaps.
- [x] Reserve the thin `rubble_long` asset exclusively for the new `movingPlatform` generation role.
- [x] Move `shaftBridge` responsibility to a non-moving static platform family.
- [x] Continue realizing every mandatory climb and descent with exactly one vertical shuttle and no static intermediate staircase.
- [x] Restrict automatic cave-perimeter population to stalactite- and stalagmite-tagged assets only.
- [x] Allow rotated stalactites/stalagmites to cover vertical wall directions without admitting generic wall or pillar art.
- [x] Regenerate the authored `level_001` cave foreground under the formation-only perimeter rule.
- [x] Add validation metrics and regressions for recovery lanes, staggered gaps, upper-gap coverage, thin moving-platform style, and formation-only foreground assets.
- [ ] Continue playtesting recovery-lane density and vertical separation in the real runtime before changing the conservative jump envelope.

## Revision 246 Atlas 004 long platforms

- [x] Add `assets/at_atlas_004.json` with frames for all sixteen uploaded platform islands.
- [x] Give every platform a closed blockable collision polygon.
- [x] Place the upper blockable surface through the middle of the visible walkway rather than on the alpha fringe.
- [x] Register every Atlas 004 platform in generation catalog version 2.
- [x] Expose the family to static landing, route-floor, bridge, and recovery-floor roles without changing the exclusive thin moving-platform style.
- [x] Let broad horizontal route edges request longer authored landing assets while preserving validated jump gaps.
- [x] Add Atlas 004 to Earth and Ice environment colour-map allowlists.
- [x] Add regression coverage for manifest completeness, collision-surface placement, catalog roles, generated selection, and moving-platform exclusivity.
- [x] Keep the PNG separate from the no-PNG revision archive.


## Revision 247 organic upper traversal

- [x] Register `organic-layered-traversal-v4` and make it the Earth and Ice default.
- [x] Retain `layered-recovery-traversal-v3`, `spaced-platform-traversal-v2`, and `forgiving-traversal-v1` as legacy implementations.
- [x] Keep ThePath74 as a loose guide rather than a platform centreline.
- [x] Search horizontal platform profiles with visible height changes between every neighbouring landing in chains of three or more.
- [x] Reject generated same-height platform rows and insufficient vertical range.
- [x] Bound organic departures around the abstract route while retaining conservative jump, rise, drop, and landing validation.
- [x] Use Atlas 004 long static platforms more readily on broad horizontal legs.
- [x] Preserve `rubble_long` as the exclusive thin moving-platform family.
- [x] Measure vertical-shuttle travel between realized support surfaces after route-anchor offsets.
- [x] Record organic-height and long-platform metrics in generation validation.

## Revision 248 aggregate test-runner investigation

- [x] Reproduce the reported aggregate-suite behavior outside the foreground command timeout.
- [x] Confirm that the Node test process exits normally with status 0 and does not remain alive on an asynchronous handle.
- [x] Profile every test with high-resolution elapsed time and resident-memory measurements.
- [x] Identify the generator regressions as the source of approximately 74 of 76 seconds of aggregate runtime.
- [x] Print `RUN` before each aggregate test so long CPU-bound cases do not appear frozen.
- [x] Report total test count and elapsed time for every suite invocation.
- [x] Add `npm run test:profile` for per-test timings, slow-test reporting, and peak RSS.
- [x] Add `npm run test:generator` and `npm run test:fast` for isolated fresh-process diagnostics.
- [x] Keep `npm test` as the authoritative complete 141-test release gate.
- [x] Complete the aggregate suite in 76.33 seconds with exit code 0.

## Revision 249 longform organic platforms and fail-safe gaps

- [x] Register `longform-organic-traversal-v5` and make it the Earth and Ice default while retaining v4 as legacy.
- [x] Treat ThePath74 as a loose spatial guide rather than a platform centreline.
- [x] Search horizontal support counts from fewest to most so broad authored platforms are preferred.
- [x] Derive requested platform widths from the available span after reserving all jump gaps.
- [x] Use Atlas 004 long platforms for a substantial share of horizontal route-span supports.
- [x] Reject adjacent upper platforms whose surface heights differ by less than the organic threshold.
- [x] Keep every upper gap inside the conservative collision-edge movement envelope.
- [x] Create one recovery support for every upper jump gap.
- [x] Require each recovery support to cover the fall centre and expose a valid backtracking return to the lower main landing.
- [x] Let a reward-branch shaft foothold fulfil the recovery contract for its own upper gap.
- [x] Keep lower recovery gaps staggered away from all upper fall lines.
- [x] Generate optional secondary platforms above suitable long main platforms.
- [x] Mark secondary platforms as bidirectionally reachable reward perches.
- [x] Include secondary reward perches in contextual reward support candidates.
- [x] Keep `rubble_long` exclusive to automatic moving lifts.
- [x] Preserve exactly one moving lift and no static staircase on every mandatory vertical edge.
- [x] Advance run provenance to the `alg9_` prefix.
- [x] Add validation metrics for long-platform share, average width, secondary perches, recovery coverage, return reachability, and unprotected gaps.

## Revision 250 layered safety-network traversal

- [x] Register `layered-safety-network-traversal-v6` and make it the Earth/Ice default while retaining v5 and earlier traversal IDs as legacy implementations.
- [x] Keep ThePath74 as a loose guide rather than a collision line.
- [x] Preserve long Atlas 004 upper-route platforms and mandatory visible height changes between adjacent jump targets.
- [x] Build a connected, sloping lower recovery route beneath every horizontal upper-route gap.
- [x] Add one thin automatic return lift from each lower recovery route to the upper route.
- [x] Stagger lower-route gaps away from upper-route gaps.
- [x] Place a wider tertiary recovery platform beneath every lower-route gap.
- [x] Add a thin automatic return lift from each tertiary platform to the lower route.
- [x] Reserve complete lower-route, tertiary, and moving-lift envelopes in the cavern contour.
- [x] Require at least 112 world units of static headroom wherever platform bodies overlap horizontally.
- [x] Place the entry door at the far-left usable edge of the starting platform.
- [x] Keep detached secondary platforms as reward perches and allow the Rewards stage to place treasure there.
- [x] Preserve legacy optional branch treasure for legacy traversal implementations.
- [x] Extend validation and headless tests for layered-lane completeness, lower-gap protection, return lifts, headroom, reward perches, and entrance placement.


## Revision 251 minimap, perimeter orientation, and overlap blending

- [x] Replace the two upper-right HUD buttons with one clickable minimap panel.
- [x] Share one CSS width variable between the top-left meter panel and upper-right minimap.
- [x] Use `ResizeObserver` to keep the minimap's rendered width and height exactly matched to the meter panel.
- [x] Draw cave outline, collision surfaces, camera viewport, player, and exit marker into the minimap at a throttled rate.
- [x] Open the existing pause menu when the minimap is clicked or tapped.
- [x] Retain Escape navigation and automatic fullscreen policy without a permanent fullscreen HUD button.
- [x] Derive cave-formation rotation from the inward perimeter normal and the authored stalactite/stalagmite tip direction.
- [x] Snap preliminary tip angles within 45 degrees of straight down or straight up to the corresponding vertical direction.
- [x] Share the corrected orientation between Level Editor perimeter population and automatic generator decoration.
- [x] Add `src/presentation/overlap-blend-cache.js` for consecutive overlapping static atlas groups.
- [x] Bake overlap groups once into off-screen bitmaps rather than compositing them every frame.
- [x] Blend incoming assets across the central 50 percent of the overlap around its midpoint.
- [x] Reuse overlap composites in both runtime and Level Editor drawing.
- [x] Preserve individual placement/collision records and exclude moving, entity-bound, actor-front, and cave-foreground visuals.
- [x] Add regression coverage for minimap wiring/sizing, formation rotation, overlap grouping, and central-half blending constants.

## Revision 252 perimeter, minimap, endpoint, and Atlas 004 corrections

- [x] Replace the 45-degree vertical perimeter snap with a nearest-cardinal 20-degree snap.
- [x] Preserve the unsnapped inward perpendicular angle outside the cardinal tolerance.
- [x] Keep stalactite and stalagmite authored tip-direction compensation.
- [x] Keep minimap height exactly matched to the top-left meter panel.
- [x] Derive minimap width from padded level-bounds aspect ratio instead of the HUD width variable.
- [x] Re-evaluate minimap size after window, HUD, and level-bounds changes.
- [x] Reuse the entrance door-support asset and scale for the exit support.
- [x] Force the entrance support to authored orientation and the exit support to mirrored orientation.
- [x] Place grounded entrance and exit doors at corresponding far-left and far-right usable positions.
- [x] Retain closed blockable collision only on `earth_long_platform_r1_a`.
- [x] Convert the other fifteen Atlas 004 objects to one horizontal `walkable` edge each.
- [x] Extend headless regressions for 20-degree snapping, aspect-fit minimap sizing, mirrored endpoints, and mixed Atlas 004 collision.

## Revision 253 smoothed contour perimeter coverage

- [x] Simplify traced occupancy contours more aggressively before exposing them as cave-window control points.
- [x] Serialize traced automatic cave perimeters as smooth editable points instead of raw corner-only stair steps.
- [x] Keep folded multi-interval cavern shapes while removing most grid-step artifacts from the visible perimeter.
- [x] Increase tangential overlap density for automatic stalactite/stalagmite perimeter decoration.
- [x] Add regressions for smoothed contour-point output and curved full-black coverage.

## Revision 254 contour smoothing and simplified minimap

- [x] Heavily simplify traced automatic cave contours before serializing the editable perimeter.
- [x] Shorten smooth-spline handles automatically around sharp turns to reduce loopback risk in the full-black outset.
- [x] Remove the minimap's click-for-menu caption.
- [x] Remove the minimap's internal yellow world-geometry lines and blocks.
- [x] Extend regressions for heavier contour simplification and the simplified minimap rendering contract.

## Revision 255 compatible generator variants and run-and-gun ground paths

- [x] Remove retired route, cavern, traversal, endpoint, encounter, reward, decoration, and validation choices from the editor-facing registries.
- [x] Rename every single current implementation to `Standard`.
- [x] Keep only `Standard` and `Mostly horizontal` as selectable route variants.
- [x] Keep only `Standard` and `Wide, upward-expanding` as selectable cavern variants.
- [x] Migrate old saved implementation IDs to compatible current IDs without re-exposing them in the UI.
- [x] Add a monotonic mostly-horizontal route planner with long rightward runs and only occasional one- or two-cell vertical changes.
- [x] Realize horizontal run-and-gun legs with overlapping solid blockable Atlas 004 platforms and zero ordinary jump gaps.
- [x] Reserve the fifteen thin one-way Atlas 004 platforms from the overlapping run-and-gun ground family.
- [x] Make the Standard lower recovery route continuous by filling wide lower gaps with overlapping bridge platforms.
- [x] Add a wide cavern variant with broader, shallower ellipse rooms whose extra volume expands predominantly upward.
- [x] Keep the wide cavern floor boundary within the normal platform-clearance tolerance.
- [x] Simplify the Level Editor variant panel to Route and Cavern only.
- [x] Add compatibility, migration, continuous-ground, room-proportion, and upward-expansion regressions.
- [x] Pass a 96-draft Earth/Ice matrix across both routes, both caverns, all four lengths, and three deterministic seeds.

## Revision 256 collision-aware platform placement and wider upper rooms

- [x] Add normalized `blockable` versus `oneWay` collision metadata to generation assets and supports.
- [x] Make the thick blockable Atlas 004 platform the only overlapping run-and-gun ground asset.
- [x] Remove all fifteen thin green one-way Atlas 004 platforms from the overlapping ground role.
- [x] Require blockable assets for overlapping Standard lower-route bridge construction.
- [x] Reject any generated platform pair where a one-way platform overlaps another platform body in both X and Y.
- [x] Keep intentional blockable lower-ground overlap exempt from vertical-sandwich validation.
- [x] Add two to four broad auxiliary upper-room ellipses to every Wide, upward-expanding cavern.
- [x] Keep auxiliary room bottoms near the ground while expanding most room volume upward.
- [x] Update editor guidance and generator regressions for collision-aware overlap and enlarged wide caverns.
- [x] Pass the 133-test fast suite, all nine generator regressions, and a 96-draft route/cavern compatibility matrix.

## Revision 257 automatic-generator legacy cleanup

- [x] Advance the automatic generator schema to version 19 and runtime revision to 257.
- [x] Physically remove retired route and cavern builders rather than leaving unreachable dispatch branches.
- [x] Rename the surviving traversal builder to `buildStandardTraversal` and collapse it to current Standard/Mostly-horizontal behavior.
- [x] Remove optional-branch route planning, shaft construction, reward-destination, preview, and validation plumbing.
- [x] Remove retired `branchStep`/`shaftBridge` platform roles and branch-only reward contexts from data catalogs.
- [x] Replace branch-era reward reroll rebuilding with reward-entity-only regeneration that preserves terrain and encounters exactly.
- [x] Remove the now-unused encounter re-anchoring helper.
- [x] Rename stale branch/longform metrics and treasure-score fields while retaining old-input normalization where needed.
- [x] Remove branch controls, legends, status text, and transition colouring from the Level Editor.
- [x] Prune branch-only assertions and repeated legacy-validation fixtures from generator tests.
- [x] Retain one focused migration test for old saved implementation IDs.
- [x] Add regressions proving retired functions, catalog roles, reward contexts, and editor controls remain absent.

## Revision 258 current-schema-only generator cleanup

- [x] Remove the retired implementation-ID migration table.
- [x] Reject unsupported explicit generator implementation IDs with a clear stage-specific error.
- [x] Keep omitted implementation stages defaulting to the current registry choice.
- [x] Remove the `branchChestScore` normalization fallback.
- [x] Remove route-node and route-edge `branchId` normalization.
- [x] Remove the Level Editor `automaticGeneration`, nested generation-run, prefix-owner, and `generationBranchId` fallbacks.
- [x] Require current generator identity and matching route implementation when normalizing generator metadata.
- [x] Replace migration tests with strict-rejection and source-absence regressions.

## Revision 259 minimap, content density, platform seams, and small-step traversal

- [x] Restore horizontal walkable and blockable platform surfaces to the minimap.
- [x] Cap minimap width at the rendered width of the top-left meter panel.
- [x] Add a persisted Settings checkbox that hides and restores the minimap.
- [x] Keep Escape-menu access available while the minimap is hidden.
- [x] Reject visual overlap involving generated one-way green-line platforms.
- [x] Reject static blockable-platform overlap when their walking surfaces differ in height.
- [x] Keep equal-height blockable overlap legal for continuous run-and-gun floors.
- [x] Add more broad, shallow upward room stamps to the Wide cavern variant.
- [x] Add reachable second-tier upper combat and reward perches where continuous ground leaves few exposed side edges.
- [x] Allow encounter generation to use upper combat perches.
- [x] Guarantee genuine power-up pickups at nontrivial reward density.
- [x] Let grounded Ignatius and grounded walking enemies step over rises below one eighth of actor height.
- [x] Keep taller ledges blocking and covered by movement regressions.

## Revision 260 cleaner minimap overlay and denser horizontal upper lanes

- [x] Remove the minimap's opaque rectangular background patch so the overlay blends into gameplay cleanly.
- [x] Keep the minimap frame clickable while making its shell transparent.
- [x] Increase Mostly horizontal upper-platform density to roughly one quarter of the route span.
- [x] Bias the extra raised platforms toward combat perches so monsters occupy the upper lane more often.
- [x] Add regression coverage for transparent minimap rendering and horizontal upper-platform coverage.

## Revision 261 mostly-horizontal playability audit

- [x] Generate and visually inspect twelve Mostly-horizontal Earth cavern drafts across Standard/Grand lengths and both cavern variants.
- [x] Replace opportunistic upper-perch clustering with a distributed upper lane covering at least roughly 25% of route width.
- [x] Bias the upper lane toward combat perches while retaining occasional reward perches.
- [x] Require each upper one-way platform to have validated bidirectional access from its ground parent.
- [x] Give Skeleton Guards hunter navigation, jump height, fall tolerance, and repathing so upper encounters can pursue Ignatius.
- [x] Reject generated upper ground enemies that lack a reachable parent transition or jumping hunter mobility.
- [x] Increase downward camera anticipation to reveal landing space during fast falls.
- [x] Reserve collision-safe moving-platform shafts in Mostly-horizontal drafts and reject later platform or enemy intrusion.
- [x] Add regressions for upper-lane coverage, shaft clearance, upper-enemy mobility, and downward camera lead.

## Revision 262 hunter re-engagement and raised upper platforms

- [x] Keep same-height overlapping blockable platform tops connected in enemy navigation.
- [x] Add a regression proving hunters can route across the composed run-and-gun floor.
- [x] Let stranded melee hunters re-engage through local same-floor pursuit when Ignatius is visibly nearby.
- [x] Preserve real ledge and wall blocking during local pursuit.
- [x] Raise Mostly-horizontal combat and reward platforms to a second tier.
- [x] Add an offset one-way access step for every raised upper destination.
- [x] Require at least 170 world units of open rocket-turning clearance beneath each upper destination.
- [x] Validate upper access support count, references, and rocket clearance across all route/cavern combinations.

## Revision 263 geometry-calibrated rocket launch turn

- [x] Preserve normal mid-flight homing at 4.8.
- [x] Add a launch-only homing strength of 6.95 during the existing 0.32-second initial-turn window.
- [x] Begin homing during the launch window instead of locking the rocket vertically until the timer expires.
- [x] Measure the actual fixed-step height of one unboosted jump in the regression fixture.
- [x] Verify the standard rocket only just clears a platform at that height while aiming toward a distant same-level target.
- [x] Verify a slightly weaker 6.9 launch turn still hits the platform, pinning the threshold.
- [x] Expose initial and normal homing separately in Game Tuning.

## Revision 264 generated enemy platform clearance

- [x] Search each ground-enemy support for body-clear spawn positions instead of using one right-biased point.
- [x] Keep an 18-unit side margin and 14-unit vertical margin from every unrelated generated platform.
- [x] Preserve overlapping same-height floor pieces as one legal standing surface.
- [x] Reject encounter groups when no collision- and artwork-clear spawn slot exists.
- [x] Add independent validation and seeded regressions for enemy/platform intrusion.

## Revision 265 flying-enemy clearance and unambiguous ground seams

- [x] Apply platform and moving-shaft clearance to flying encounter groups as well as ground enemies.
- [x] Search multiple horizontal and vertical spawn slots for each complete bat group.
- [x] Reject generated and manually perturbed flying encounters that intersect platform artwork.
- [x] Increase automatic step traversal from one eighth to one fifth of actor height for Ignatius and grounded enemies.
- [x] Deepen same-height run-and-gun platform overlap so ordinary seams form a clearly continuous floor.
- [x] Require at least 72 world units of walkable overlap at every generated run-and-gun seam.

## Revision 266 thin-platform collision audit

- [x] Review every `at_atlas_XXX.json` environment manifest for thin versus substantial collision geometry.
- [x] Replace Atlas 001 shallow ledge and rubble silhouettes with a single green walkable top line.
- [x] Replace the four Atlas 002 shallow horizontal floor-strip silhouettes with a single green walkable top line.
- [x] Preserve yellow blockable collision on Atlas 003 and on all substantial assets in Atlases 001, 002, and 004.
- [x] Keep the established Atlas 004 split of one deep blockable platform and fifteen thin one-way platforms.
- [x] Rebuild the `level_001` baked hunter navigation graph after reclassifying its `rubble_skull` placement.
- [x] Add a headless test covering the complete four-atlas collision policy.


## Revision 268 automatic enemy spawning

- [x] `autoSpawnEnemies.enabled` defaults to `false`.
- [x] `autoSpawnEnemies.probabilityPercent` is normalized to 0-100 and defaults to `0`.
- [x] `autoSpawnEnemies.enemyPool` defaults to `1-999`.
- [x] Pool parsing is shared with generator `allowedEnemies`, including comma-separated numbers, ranges, and `!` exclusions.
- [x] The Level Editor stores, restores, previews, imports, exports, and browser-playtests the settings.
- [x] Browser startup loads the enemy-definition catalog before applying a level.
- [x] Runtime chance checks occur at one-second fixed-step intervals.
- [x] Spawn selection and position sampling are deterministic for the level seed/load and roll number.
- [x] Direction prefers the current player-to-exit horizontal sign and falls back to authored entry-to-exit direction, then right.
- [x] Spawn X lies outside the current viewport by 10-100 percent of viewport width.
- [x] Ground spawns require a safe support and no living-enemy body overlap.
- [x] New enemies are immediately aware, engaged, facing the player, and remember the player's current coordinates.
- [x] Fully faded dead automatic enemies and their target records are pruned.
- [x] Existing fast tests and the new automatic-spawn test pass.

## Revision 269 route-scaled power-ups and one-way enemy clearance

- [x] Target approximately one generated power-up per 5,000 pixels of mandatory-route travel at default reward density.
- [x] Preserve zero rewards at 0 percent density and scale the target within bounded limits at other density settings.
- [x] Store the target in reward-plan/population schema version 3 and generator diagnostics.
- [x] Reject generated reward populations that fail to meet their recorded power-up target.
- [x] Keep generated power-ups off supports occupied by generated encounters.
- [x] Let grounded enemies walk beneath green one-way lines without treating them as torso-height walls.
- [x] Preserve full-body blocking for yellow blockable, damaging, and killable terrain.
- [x] Add focused and fast-suite regressions for route-scaled power-up counts and under-platform enemy movement.

## Revision 270 exact jump and generated-layout geometry

- [x] Author the ordinary jump directly as 200 world pixels.
- [x] Derive launch velocity from gravity and jump height instead of tuning a sampled velocity.
- [x] Use constant-acceleration displacement and split the apex-crossing collision sweep at the analytical apex.
- [x] Verify an exact 200-pixel apex at 30, 60, and 120 simulation steps per second.
- [x] Preserve 1,490 gravity and expose jump height in browser Game Tuning.
- [x] Recalibrate launch-only rocket homing to 6.7, with 6.65 retained as the clipping-side regression boundary.
- [x] Target approximately one generated power-up per 2,000 pixels of mandatory-route travel at default Reward density.
- [x] Permit additional pickups on long eligible supports only when normal reward-spacing and safety exclusions remain valid.
- [x] Require at least 180 pixels between the walking surfaces of horizontally overlapping generated static platforms.
- [x] Apply the same 180-pixel contract to Mostly-horizontal lane spacing, upper access tiers, recovery placement, and validation diagnostics.
- [x] Preserve separate moving-platform shaft validation rather than applying a static snapshot rule to moving supports.
## Revision 271 generated lift safety

- [x] Treat generated deathtraps as invalid output rather than intentional level design.
- [x] Reserve 180 pixels of rider clearance above every Mostly-horizontal vertical shuttle throughout its complete travel.
- [x] Open a dedicated docking slot between the lower and upper ground sections before horizontal chains are materialized.
- [x] Reject lift positions whose rider corridor intersects yellow blockable geometry.
- [x] Reject lift travel whose artwork sweeps through a green one-way platform.
- [x] Reserve accepted lift corridors against later raised-platform placement.
- [x] Recompute and validate crush hazards independently from the final movement record.
- [x] Record zero-required `movingPlatformCrushHazardCount`, `movingPlatformSweepOverlapCount`, and `movingShaftIntrusionCount` diagnostics.
- [x] Add a synthetic overhead-yellow-platform regression and the default `rocketfrock` Mostly horizontal plus Wide seed regression.


## Revision 272 grounded power-ups and one-way enemy floors

- [x] Normalize generated `powerUp` vertical offsets to zero so bottom-center entity anchors rest on their support surfaces.
- [x] Update the reward catalog's three genuine power-up definitions to use ground seating.
- [x] Reject generated power-ups that are not seated on their recorded support surface.
- [x] Keep invisible thought triggers out of visual reward-spacing calculations while preserving all other safety checks.
- [x] Treat the authored ends of a green one-way line as its only legal monster walk-off edges.
- [x] Reject every non-walk-off navigation drop whose source is a green `walkable` support.
- [x] Refuse zero-horizontal source-support bypasses at runtime so stale graph data cannot push monsters through a one-way line.
- [x] Rebuild `level_001` hunter navigation data under the new one-way descent contract.
- [x] Add regression coverage for ground-seated generated power-ups, legal edge walk-offs, and malformed direct-drop rejection.

## Revision 273 player drop-through and generator naming

- [x] Add an independent player `dropHeld`/`dropPressed`/`dropReleased` input action.
- [x] Bind Down/S and gamepad down to player drop-through.
- [x] Convert a downward mouse or touch gesture into a retained one-frame pulse when released before sampling.
- [x] Allow Ignatius to ignore green `walkable` lines while standing or falling during the short drop window.
- [x] Keep every yellow `blockable` line, area, and polygon solid during drop input.
- [x] Keep enemy one-way behavior unchanged: no through-the-middle drops and only real edge walk-offs.
- [x] Rename the route label “Mostly horizontal” to “Horizontal” without changing its stable implementation ID.
- [x] Rename the cavern label “Wide, upward-expanding” to “Domed” without changing its stable implementation ID.
- [x] Make Horizontal and Domed the explicit Earth and Ice theme defaults.
- [x] Expand eligible Domed room stamps upward by a factor of 1.5 while retaining every source stamp's lower edge.
- [x] Reserve one eligible quiet route support when generated narrative thoughts are enabled, so dense power-ups cannot consume every thought location.
- [x] Update Level Editor guidance, in-game controls, the manual, and regression coverage.

## Revision 274 one-way hunter jump-loop fix

- [x] Reject every downward `jump` edge whose source support is a green `walkable` line.
- [x] Reject overlapping downward `step` edges from green supports.
- [x] Represent even small legal descents from green lines as endpoint `drop` edges marked `walkOff`.
- [x] Filter stale baked edges unless they are outward-moving endpoint walk-offs.
- [x] Recheck the same invariant immediately before a hunter begins traversal.
- [x] Rebuild `level_001` hunter navigation with the corrected edge policy.
- [x] Add a regression reproducing the repeated jump-and-reland loop with Ignatius below, then verify ordinary pursuit beside Ignatius after the legal descent.

## Revision 275 small input, weapon, and cave-editor tuning

- [x] Prefill new Level Editor automatic-enemy probability at 10 percent while keeping the switch off.
- [x] Preserve zero-percent normalization for absent runtime settings and the `1-999` pool.
- [x] Map both standard gamepad triggers, including analog values, to weapon fire.
- [x] Reduce each green Twin rocket from 20 to 10 damage.
- [x] Store Twin obstacle phasing on portable projectile state.
- [x] Let phased Twin rockets ignore green/yellow lines, solids, blocking polygons, and reactive obstacles while retaining enemy collision.
- [x] Raise the new cave-window Full black default from 180 to 200 pixels.
- [x] Move automatic perimeter formations farther inward by default.
- [x] Add a Level Editor **Inward coverage %** control that persists through the existing decoration schema.
- [x] Add regressions for editor defaults, both gamepad triggers, Twin damage/phasing, and cave defaults.



## Revision 276 denser and balanced generated power-ups

- [x] Target approximately one generated power-up per 1,000 pixels of mandatory-route travel at default Reward density.
- [x] Cap upward Reward-density scaling at 1.5× so Grand routes remain placeable.
- [x] Set generated Random Wrench, Shield, and Overdrive shares to 2:1:1.
- [x] Use a deterministic running-deficit selector so each draft stays near the requested 50/25/25 mix.
- [x] Pack dense pickups from safe platform edges inward while preserving ordinary reward spacing and endpoint clearance.
- [x] Use common placement constraints so reward-only rerolls vary pickup types without moving their slots.
- [x] Resolve reward slots before encounters and reserve fixed pickup-clearance envelopes so generated monsters never overlap them.
- [x] Update the Level Editor guidance and game manual.
- [x] Extend reward-density and generated-mix regression coverage.


## Revision 277 organic cave fade and rocket-impact performance

- [x] Normalize cave-gradient noise seed, amplitude, and scale in shared cave-window data. Superseded by revision 278 period semantics.
- [x] Derive deterministic cyclic broad/fine perturbations along closed spline arc length.
- [x] Keep the authored opening and exact full-black outset unperturbed.
- [x] Overlay low-alpha wavy opacity bands only inside the presentation feather.
- [x] Expose amplitude, scale, and seed in the Level Editor with a representative guide contour.
- [x] Give generated caverns seed-derived gradient-noise settings.
- [x] Cache reusable neutral and wrench-tinted smoke stamps in the Canvas renderer.
- [x] Remove per-frame radial-gradient creation and per-puff sparkle loops from Ignatius impact smoke.
- [x] Halve the default impact puff count, shorten impact lifetime, and shorten the central explosion hold without changing gameplay damage.
- [x] Cover normalization, deterministic perturbation, exact outset preservation, editor controls, mask-cache invalidation, generated cave data, and smoke-cache contracts in tests.

## Revision 278 full-width organic cave feather

- [x] Keep the authored cave perimeter smooth so automatic formation normals remain stable.
- [x] Replace gradient-noise scale with a 10-500 pixel period and default it to 50 pixels.
- [x] Default gradient amplitude to 50 pixels.
- [x] Remove the smooth Canvas shadow blur that made the cave edge dark immediately and concealed the waviness.
- [x] Build the complete feather from twenty-four ordered perturbed opacity contours.
- [x] Use a smoother-step opacity curve that is exactly transparent at the opening and opaque at the full-black outset.
- [x] Adapt contour sampling to short wave periods while keeping geometry cached.
- [x] Restore discoverable **Feather to full black px** wording in the Level Editor.
- [x] Preview multiple opacity contours without perturbing the cyan authored perimeter.
- [x] Give generated caves the same 200-pixel feather, 50-pixel amplitude, and 50-pixel period defaults.
- [x] Preserve the unperturbed full-black lethal boundary and all collision/navigation contracts.
- [x] Add regression coverage for defaults, period range, gradual opacity, generated settings, editor controls, and mask-cache invalidation.


## Revision 279 perimeter decoration simplification

- [x] Remove **Max spacing px** from the Level Editor.
- [x] Remove `spacing` from normalized and generated `caveWindow.decoration` records.
- [x] Ignore stale spacing values when older level data is loaded.
- [x] Derive tangential placement steps from actual rendered formation spans with guaranteed strong overlap.
- [x] Set generated perimeter asset scale to 2.0, matching the manual cave-window default.
- [x] Add regression coverage for the simplified schema, editor controls, generated defaults, and perimeter continuity.


## Revision 280 longer power-up durations

- [x] Set Overdrive to a 30-second refreshable duration.
- [x] Set every wrench rocket mode to a 30-second refreshable duration.
- [x] Set Shield to a 10-second refreshable duration.
- [x] Synchronize catalog defaults, level-1 examples, tests, and the game manual.
- [x] Fix the stale Level Editor revision label and stale current architecture timing/Twin descriptions discovered during the change, then record them in the plan.
- [x] Codify the rule that discovered bugs/deprecations are noted in the plan and manual-covered changes update the manual.


## Revision 281 current-schema-only saved-level cleanup

- [x] Remove runtime and Level Editor migration for root-level player starts, `magicPortal`, and plain `exit` records.
- [x] Remove revision-075 mailbox `thoughts` array import handling; retain only `thoughtText`, and strip unsupported retired fields during editor import.
- [x] Remove enemy `behavior`, `chaseSpeed`, and `awarenessVerticalRange` compatibility paths.
- [x] Remove Rocket Overdrive effect, pickup, and active-state aliases; retain only Overdrive.
- [x] Remove top/bottom cavern-profile generation, serialization, and containment fallback.
- [x] Remove the legacy raw `jumpVelocity` tuning migration.
- [x] Delete the lingering obsolete cave-decoration `spacing` property from `level_001`.
- [x] Synchronize game/editor revision labels to 281 and add current-schema regressions.
- [x] Pass the 148-test fast suite, all 9 generator tests, and the complete 157-test headless suite.


## Revision 282 shorter post-death camera hold

- [x] Reduce `playerDeathAfterglowSeconds` from 3 seconds to 2 seconds.
- [x] Keep cover, burst, targeting suppression, and ordinary respawn behavior unchanged.
- [x] Add an explicit regression assertion for the new default.
- [x] Update the Game Manual, architecture notes, plan, and packaged revision labels to 282.
- [x] Pass the complete 157-test headless suite and verify the release archive excludes PNG and XCF files.

## Revision 283 dead-code and release-packaging housekeeping

- [x] Remove unused collision-index, cave-window, generator, power-up, and story-reading exports with no project callers.
- [x] Remove the obsolete runtime `RocketGlowCache` class superseded by authored powered-rocket atlas frames.
- [x] Rename the retained offline image-processing utility to `rocket-glow-baking.js` and update architecture/tests.
- [x] Correct current architecture and agent guidance that still described runtime wrench-glow generation.
- [x] Delete discarded Enemy 004 candidate JSON files from `devel/old`.
- [x] Add `devel/package_update.py` to verify revision labels, required files, archive integrity, and PNG/XCF exclusion.
- [x] Synchronize game/editor revision labels to 283 and add housekeeping regressions.
- [x] Pass the complete 157-test headless suite and audit the revision 283 archive.



## Revision 285 Burst spacing tweak

- [x] Double the time spacing between the three green Burst rockets from 0.09 to 0.18 seconds so the rockets spread out more clearly in flight.
- [x] Preserve Burst damage, fuel cost, projectile size, and unguided forward behavior.
- [x] Pass the relevant automated tests and package revision 285 without PNG or XCF files.

## Revision 284 editor Fit simplification and six-wrench rebalance

- [x] Remove **Fit World** and **Fit Cave** and rename the authored-content control to **Fit**.
- [x] Launch red Bigbomb and magenta Boomerang rockets horizontally along Ignatius's facing direction before homing.
- [x] Raise Bigbomb damage from 90 to 120 without changing its triple fuel cost.
- [x] Replace green Twin with green Burst: three small unguided forward rockets, 0.18 seconds apart, 15 damage each, paid as one standard launch.
- [x] Add blue Phase as a mutually exclusive thirty-second wrench with standard damage/fuel and obstacle-phasing homing behavior.
- [x] Remove support for the superseded `wrenchTwin` saved-level identity, including embedded pickup definitions and active-effect snapshots.
- [x] Add and register a sixth pure-blue precomposited powered-rocket frame in `ct_atlas_wizard_2`.
- [x] Synchronize level-1 examples, entity-catalog defaults, manual, architecture, plan, and regression coverage.
- [x] Pass the complete 157-test headless suite and audit the revision 284 archive plus separately distributed atlas PNG.

## Revision 287 treasure-chest seating refinement

- [x] Shrink treasure chests slightly from 72×84 to 68×80 world units.
- [x] Lower treasure-chest visuals by 4 pixels so the visible base corners sit on narrow ledges more convincingly.
- [x] Relax generated chest metadata slightly for the smaller art: 180 minimum support width and 40 edge clearance.
- [x] Update the level 1 demonstration chest, entity catalog, plan, architecture notes, and regression checks.

## Revision 286 denser generated treasure

- [x] Replace the one-to-four chest length cap with a route-scaled target averaging one chest per 500 pixels.
- [x] Keep generated power-ups at one per 1,000 route pixels at default Reward density.
- [x] Permit chests on safe main-route supports, upper-access steps, detached reward perches, and reachable static upper perches.
- [x] Advance reward plan/population records to schema version 4 and expose chest targets in diagnostics.
- [x] Reject generated drafts that miss either the chest or power-up target.
- [x] Update the Game Manual, plan, architecture, agent guidance, and regression coverage.
- [x] Pass all 148 fast tests and all 9 generator tests, then audit revision 286 packaging.



## Revision 288 shorter Overdrive and wrench durations

- [x] Reduce Overdrive duration from 30 seconds to 20 seconds.
- [x] Reduce every current wrench-upgrade duration from 30 seconds to 20 seconds.
- [x] Keep Shield at 10 seconds and preserve refresh, exclusivity, HUD priority, and sixty-second pickup respawns.
- [x] Synchronize the entity catalog, level-1 examples, manual, plan, architecture guidance, revision labels, and regression tests.


## Revision 289 placeable on-screen enemy spawners

- [x] Add a catalogued `enemySpawner` entity with a visible Level Editor marker and no gameplay artwork or collision.
- [x] Reuse Automatic enemy spawning's 0–100 percent once-per-second chance and numbered range / exclusion enemy-pool grammar.
- [x] Keep each spawner completely dormant while off screen, including resetting its timer so off-screen time cannot be banked.
- [x] Spawn selected enemies at the authored point, snap ground enemies safely, reject blocked or occupied attempts, and start arrivals already alerted and engaged.
- [x] Add a compact procedural teleport flash and preserve source-spawner identity for diagnostics and serialization.
- [x] Update the Level Editor inspector, entity catalog, Game Manual, architecture notes, plan, and automated regression coverage.
- [x] Pass all 149 fast tests and all 9 generator regressions, then audit revision 289 packaging.


## Revision 290 code audit and release housekeeping

- [x] Verify the revision-289 archive contains the expected game, editor, source, asset-data, Electron, documentation, and test files.
- [x] Run syntax checks for JavaScript/ES modules, compile the development Python scripts, validate every JSON document, and verify local imports plus HTML file references.
- [x] Remove the accidentally reintroduced retired `src/presentation/rocket-glow-cache.js` file.
- [x] Make `devel/package_update.py` reject known retired files before packaging.
- [x] Refresh the stale project-layout diagram and record every discovered defect in the plan and architecture notes.
- [x] Synchronize game and Level Editor revision labels to 290.
- [x] Pass all 149 fast tests and all 9 generator regressions, then audit the compact update archive for integrity and PNG/XCF exclusion.


## Revision 291 level_002 and first boss encounter

- [x] Generate a reproducible default-style Earth cavern foundation with seed `cinder-vault-291-8f6c2b`.
- [x] Restrict every authored and spawned enemy in `level_002` to Fireball Goblins (`enemy_002`).
- [x] Hand-author a large final cavern with four staggered fighting platforms on each side.
- [x] Add the gigantic 900-HP Fireball Goblin boss **Gorblax the Incandescent**.
- [x] Add six on-screen-only goblin spawners and four arena wrench pickups.
- [x] Block the exit behind an iron gate until `BOSS_002_DEFEATED` activates.
- [x] Disable all arena spawners on the same boss-defeat signal.
- [x] Add focused runtime and level-contract regressions.
- [x] Browser-playtest the complete route; this exposed the missing navigation bake, oversized arena, sparse route population, and unattractive gate presentation addressed in revision 292.

- [x] Run each geometry-heavy generator contract in a fresh sequential Node process so temporary drafts cannot accumulate or compete for memory.

## Revision 292 level_002 performance repair and compact boss encounter

- [x] Reproduce the 4 to 5 FPS browser collapse and identify missing baked hunter navigation profiles as the simulation bottleneck.
- [x] Bake ordinary-goblin and boss-sized navigation profiles into `level_002`.
- [x] Cache live fallback supports and edges once per world topology and mobility profile.
- [x] Make release packaging reject hunter levels with no baked navigation profiles.
- [x] Remove and deny the temporary root-level `generate_level002_temp.mjs` helper.
- [x] Make every wizard exit door remain closed while any living boss exists in the level.
- [x] Remove the level-2 iron gate and keep `BOSS_002_DEFEATED` for reinforcement shutdown.
- [x] Compact the boss chamber, platform columns, cavern outline, boss, pickups, spawners, and exit into a standard wide viewport.
- [x] Reduce Gorblax to 1.55 scale and 750 HP while retaining oversized boss presentation.
- [x] Add four Musket Goblins and three two-bat groups, retain Fireball Goblins, and include no Skeleton Guards.
- [x] Allow arena spawners to select Fireball or Musket Goblins while preserving strict off-screen dormancy.
- [x] Update the Game Manual, plan, architecture notes, revision labels, package checks, and focused regression tests.
- [x] Make `npm test` run the fast suite and isolated generator runner in separate processes so the authoritative release gate completes reliably.
- [x] Browser-playtest revision 292; retain remaining encounter tuning under the revision-293 playtest item after the editor and unified-scale changes.

## Revision 293 Level Editor workflow and unified enemy scale

- [x] Add shared normalization for one character-enemy `scale` multiplier.
- [x] Multiply runtime enemy hitbox dimensions, rendered character scale, local artwork offsets, and projectile radius by the same value.
- [x] Use scaled dimensions for Level Editor previews, hit testing, ground snapping, and hunter navigation profiles.
- [x] Make Enemy scale apply live while typing and make character-enemy W/H fields read-only effective dimensions.
- [x] Migrate Gorblax to Fireball Goblin base geometry plus a 2.8 uniform scale and synchronize the baked boss mobility profile.
- [x] Make packaging reject a hunter level when any scaled mobility profile lacks an exact bake.
- [x] Add Shift-drag box selection, Ctrl-click toggling, and Ctrl+Shift-drag toggling.
- [x] Preserve one primary white selection and gray secondary selections; support group move and delete.
- [x] Convert the Delete toolbar control from a persistent tool into an immediate selection action.
- [x] Remove the atlas dropdown and aggregate all loaded atlas frames in one searchable palette.
- [x] Remove manual perimeter-population gameplay-clearance protection so foreground rock may intentionally cover playable space.
- [x] Update the Game Manual, plan, architecture, agent guidance, revision labels, and regression coverage.
- [x] Browser-playtest revision 293; the editor pass exposed the need for standard clipboard commands, addressed in revision 294, while remaining `level_002` encounter tuning moves forward.


## Revision 294 standard Level Editor clipboard

- [x] Remove the asset-only Copy asset toolbar action.
- [x] Add Cut, Copy, Paste, and Delete command buttons without changing the active tool.
- [x] Support complete single- and multi-selection clipboard payloads for both entities and placements.
- [x] Preserve group spacing, generate unique IDs for copied records, and select the pasted group.
- [x] Make copied generated records manual on paste instead of duplicating generator ownership.
- [x] Make Cut reject locked generated records and restore the first paste at the original coordinates when possible.
- [x] Add Ctrl/Cmd+X, Ctrl/Cmd+C, Ctrl/Cmd+V, Delete, and Backspace shortcuts while preserving native text-field editing.
- [x] Restore the generator release runner to concurrent core and macro processes so the isolated suite completes reliably.
- [x] Update the Game Manual, plan, architecture notes, revision labels, and regression coverage.
- [ ] Browser-playtest revision 294, including clipboard cascades, multi-object Cut/Paste, locked generated selections, and the remaining `level_002` encounter tuning.

## Revision 295 Level Editor box-selection repair

- [x] Reproduce the revision-294 symptom where Shift-drag drew a marquee but atlas placements inside it were not selected.
- [x] Remove the duplicate, incompatible `placementWorldBounds` declaration.
- [x] Compare placements and entities through one canonical min/max bounds schema.
- [x] Add regression checks for one bounds helper and compatible asset/entity box-selection comparisons.
- [ ] Browser-playtest revision 295 with rotated assets, cave-foreground assets, entities, replacement selection, and Ctrl+Shift toggle selection.
- [ ] Continue hands-on `level_002` boss encounter tuning after the editor selection pass.

## Revision 296 Entity picker cleanup

- [x] Remove the top-toolbar entity dropdown.
- [x] Make the Entity palette the sole owner of the active entity placement type.
- [x] Keep the Place entity toolbar button as a shortcut that reuses the current palette selection.
- [x] Remove all `quick-entity` and `els.quickEntity` wiring.
- [x] Add regression checks preventing the duplicate picker from returning.
- [ ] Browser-playtest palette selection followed by repeated Place entity toolbar use.

## Revision 297 full-height palette grids

- [x] Replace the Asset palette's text rows and single preview with two-column thumbnail cards for every loaded atlas frame.
- [x] Make the Asset palette panel viewport-height with a dedicated internal scrollbar.
- [x] Give the Entity palette the same two-column card layout, viewport-height scrolling, and visual selection treatment.
- [x] Render catalog-entity default visuals, character-enemy idle poses, and icon fallbacks for invisible/editor entities.
- [x] Add compact filter fields to both palettes and keep atlas reload beside the Asset filter.
- [x] Keep palette selection as the sole source of active asset/entity placement choices.
- [x] Remove the obsolete one-at-a-time asset preview canvas and wiring.
- [ ] Browser-playtest long palette scrolling, filtering, selection persistence, and thumbnail readability at common editor window sizes.

## Revision 298 readable palette thumbnails

- [x] Reproduce the revision-297 symptom where unfiltered palettes compressed thumbnail canvases into horizontal slits.
- [x] Use max-content grid rows and non-shrinking card/preview heights so long palettes scroll instead of squeezing.
- [x] Increase thumbnail backing resolution and visible preview height.
- [x] Crop atlas previews to cached non-transparent bounds and center them.
- [x] Use alpha-aware bounds for catalog composites and character idle-pose previews.
- [x] Update the Game Manual, plan, architecture guidance, revision labels, and regression coverage.
- [ ] Browser-playtest unfiltered and filtered palettes at common browser zoom levels.

## Revision 299 compact live Level Editor inspector

- [x] Remove the Selected object Apply button.
- [x] Apply X, Y, W, H, rotation, and Notes live while editing.
- [x] Commit remaining inspector controls on their normal change event.
- [x] Replace the oversized Notes textarea with one line.
- [x] Compact non-palette right-hand panels without changing Entity or Asset palette margins.
- [x] Move long static editor explanations into `DEVELOPER_MANUAL.md`.
- [x] Rasterize composed enemy previews before alpha cropping so they fill and center correctly.
- [x] Match palette canvas backing aspect ratio to its displayed card before fitting previews.

## Revision 300 cursor placement previews

- [x] Show the selected asset or entity at its snapped canvas position while the pointer moves in placement mode.
- [x] Reuse normal asset/entity rendering and enemy/door ground snapping for the transient preview.
- [x] Keep preview state out of level JSON and avoid consuming an authored ID.
- [x] Return to Select after placing either an asset or an entity.
- [x] Clear the preview when the pointer leaves the canvas or another tool is selected.


## Revision 301 Level Editor Canvas performance bridge

- [x] Coalesce editor redraw requests through `requestAnimationFrame`.
- [x] Split the static viewport scene from cursor previews, selection outlines, and marquee overlays.
- [x] Reuse the static scene for placement-preview and selection-box pointer movement.
- [x] Cache dense cave-foreground artwork in a transparent viewport layer with explicit invalidation.
- [x] Cull entities against conservative editor world bounds before expensive preview composition.
- [x] Replace per-render overlap signature construction with stable-array caching and explicit invalidation.
- [x] Remove full-level JSON serialization scheduling from the render loop and attach it to authoring mutations.
- [x] Remove the retired `generate_level002_temp.mjs` and duplicate `src/presentation/rocket-glow-cache.js` files found by the release audit.
- [x] Synchronize revision labels, architecture guidance, developer guidance, plan notes, and regression coverage.
- [ ] Browser-profile revision 301 in a densely populated cave at placement-preview, object-drag, pan, and whole-level Fit zoom levels; record the achieved frame rates before deciding the first WebGL2 migration slice.


## Revision 302 compact editor controls and reliable generator gate

- [x] Add a reusable compact button-stack layout with a visible five-pixel vertical gap.
- [x] Apply it to generator ownership, generator history/actions, and cave-perimeter action groups.
- [x] Reduce only those grouped button labels to 14 pixels so spacing does not cause unnecessary wrapping.
- [x] Add a source regression check requiring the compact button-stack contract.
- [x] Split generator release coverage into foundation, decorated-macro, content, and route-seed-sweep groups.
- [x] Run the four generator groups sequentially in fresh `--expose-gc` Node processes to avoid heap retention and concurrent memory contention.
- [x] Preserve the complete decorated macro matrix and 48-route seed sweep after splitting their process boundary.
- [x] Run the complete `npm test` gate successfully: 154 fast tests and 10 generator tests.
- [x] Keep gameplay, level schema, and Game Manual unchanged for this presentation/test-harness revision.

## Revision 303 named test gates and WebGL2 runway

- [x] Give every headless test exactly one explicit primary owner under shared, editor, game, or generator.
- [x] Add a small overlapping smoke gate for source organization, dense editor fixture integrity, editor/runtime transformation, serialization, headless stepping, and reset.
- [x] Split shared and editor into two fresh-process shards, game into four, and generator into four.
- [x] Add one common sequential runner with pass, fail, timeout, skip, duration, and final gate reporting.
- [x] Continue remaining shards after an individual failure so earlier and later results remain visible.
- [x] Persist fingerprinted shard progress only under excluded `.build/` and add an explicit release-resume command.
- [x] Make ordinary `npm test` start a fresh complete release gate.
- [x] Freeze a deterministic Level Editor stress fixture with 1,039 placements, 986 cave-foreground records, and 68 entities.
- [x] Add structural fixture inspection, a recorded hash, and a repeatable browser profiling protocol.
- [ ] Record hands-on Canvas frame timings for the five stress scenarios before selecting the first performance-sensitive WebGL2 slice.
- [x] Audit and document every direct production Canvas owner.
- [x] Add an automated renderer-boundary audit that rejects new unapproved direct Canvas owners.
- [x] Strengthen compact release validation for revision notes, required infrastructure, archive naming, generated artifacts, unsafe/duplicate members, and excluded artwork.
- [x] Keep gameplay, level schema, editor workflow, and Game Manual unchanged.
- [x] Complete the revision-303 release gate: 165 unique primary tests across all twelve shards passed; the outer command wrapper interruption was resumed from the fingerprinted checkpoint without rerunning completed shards.

## Revision 304 fixed-step input edge buffering

- [x] Reproduce the lost-input path where a browser render frame samples jump but runs zero fixed simulation steps.
- [x] Latch keyboard and pointer gameplay press/release transitions independently from current held state.
- [x] Preserve sampled gamepad transitions until a fixed step consumes them.
- [x] Allow press and release to coexist in one `InputFrame` for complete taps and release-plus-repress gestures.
- [x] Sample without consuming gameplay edges in the browser animation loop.
- [x] Consume delivered gameplay edges only after the first fixed step runs.
- [x] Retain held state across catch-up substeps while preventing edge reuse.
- [x] Preserve title-screen jump suppression and one-frame pointer drop pulses.
- [x] Add regression coverage for render-only frames, complete taps, airborne release-plus-repress, and exactly-once boost activation.
- [x] Update revision labels, architecture, developer guidance, plan notes, player manual, and stable test ownership.

## Revision 305 projectile and wrench checks

- [x] Make player rockets ignore green `walkable` collision segments.
- [x] Make enemy projectiles ignore green `walkable` collision segments through the same terrain-impact query.
- [x] Keep solids, yellow `blockable` lines, and blocking areas authoritative for both projectile owners.
- [x] Export one `NON_HOMING_ROCKET_SPEED_FACTOR` and set it to 2.
- [x] Rebuild yellow Triple as three non-homing one-third-damage rockets at -15, 0, and +15 degrees around the nearest-forward launch-time aim.
- [x] Rebuild green Target as one non-homing standard-damage rocket aimed at the nearest forward enemy when launched.
- [x] Give cyan Dart half fuel cost, standard damage, and the shared double-speed factor.
- [x] Rebuild blue Homing Triple as three homing one-third-damage rockets in the former yellow fan, with separate targets when possible.
- [x] Give magenta Boomerang half fuel cost while preserving standard damage, standard speed, homing, return, and catch refund behavior.
- [x] Leave red Bigbomb tuning unchanged.
- [x] Preserve stable serialized effect IDs while updating misleading visible labels.
- [x] Add regressions for forward target selection, fan angles, speed, fuel, damage, homing state, projectile ownership, walkable passage, and blockable impacts.
- [x] Update the Game Manual, architecture, plan, checklist, and packaged revision labels.

## Revision 306 wrench-first Power HUD priority

- [x] Raise every built-in wrench effect HUD priority above Shield and Overdrive.
- [x] Keep Shield above Overdrive when no wrench is active.
- [x] Preserve simultaneous effect timers, stacking, exclusivity, and gameplay behavior.
- [x] Make the selector honor current built-in priority when an older saved active-effect definition embeds the retired wrench priority.
- [x] Update player guidance, architecture rules, project instructions, revision labels, and regression expectations.


## Revision 307 yellow Fivefold volley

- [x] Expand the yellow wrench volley from three rockets to five.
- [x] Keep every launch direction inside the existing +/-15-degree cone.
- [x] Space the five launch angles evenly at -15, -7.5, 0, +7.5, and +15 degrees.
- [x] Give each projectile one fifth standard damage so the complete volley retains standard total damage.
- [x] Preserve half fuel cost, double non-homing speed, nearest-forward aim, collision behavior, and stable serialized ID.
- [x] Rename the visible yellow mode from Triple to Fivefold and update player guidance and regression coverage.

## Revision 308 remove player rocket firing cooldown

- [x] Remove the 0.35-second player rocket launch cooldown from portable tuning and simulation.
- [x] Permit consecutive fixed-step weapon presses to launch whenever fuel is sufficient.
- [x] Ignore legacy serialized `launchCooldownTimer` values rather than letting them block firing.
- [x] Remove cooldown multipliers from built-in and normalized power-up rocket profiles.
- [x] Keep Overdrive's twenty-second duration and half-fuel benefit without a retired cadence claim.
- [x] Preserve edge-triggered controls, fuel accounting, recharge delay, wrench behavior, and enemy cooldowns.
- [x] Add regression coverage and update the Game Manual, developer guidance, architecture, plan, and revision labels.


## Revision 310 wrench volley wedge-direction jitter

- [x] Keep yellow Fivefold and blue Homing Triple internal launch spacing unchanged within each wedge.
- [x] Add a small deterministic shared wedge-direction jitter to yellow Fivefold as well as blue Homing Triple.
- [x] Apply the same sampled jitter to every projectile in a volley rather than perturbing individual rockets separately.
- [x] Keep successive rapidly fired volleys from reusing one identical overall fan direction.
- [x] Preserve deterministic replay by deriving the wedge offset from the portable simulation seed and volley identity.
- [x] Retain the applied shared offset as `launchAngleJitterDegrees` on each projectile for diagnostics.
- [x] Preserve fuel cost, damage, speed, homing, target selection, and collision behavior for both affected wrench modes.
- [x] Add regression coverage for yellow and blue wedge spacing, successive-volley variation, and deterministic replay.
- [x] Update player guidance, developer notes, architecture, plan, and revision labels.


## Revision 311 WebGL2 renderer conversion

- [x] Prefer a high-performance WebGL2 context for the visible game canvas.
- [x] Retain a Canvas 2D startup fallback when WebGL2 is unavailable.
- [x] Add a dedicated presentation-only WebGL2 backend module.
- [x] Batch textured quads through one dynamic interleaved vertex buffer.
- [x] Cache static atlas, foreground-treatment, and overlap-composite textures.
- [x] Draw main scenery, actor-front scenery, cave foreground, and cutout masks directly with WebGL2.
- [x] Composite procedural actors/effects and mask/overlay passes through transparent reusable Canvas staging textures.
- [x] Update dynamic staging textures with `texSubImage2D` rather than reallocating each frame.
- [x] Use premultiplied-alpha upload and blending rules compatible with Canvas sources.
- [x] Handle WebGL context loss/restoration and rebuild GPU resources.
- [x] Invalidate GPU textures when colour maps, cave windows, or atlas sets change.
- [x] Expose backend, draw-call, quad, upload, update, layer, and texture diagnostics.
- [x] Add source-contract regression coverage and update documentation and revision labels.

## Revision 312 direct WebGL2 effect migration

- [x] Keep the Canvas 2D fallback renderer unchanged.
- [x] Add per-sprite alpha vs additive blend selection in the WebGL2 backend.
- [x] Reuse cached particle sprite canvases for GPU-friendly glow, ring, diamond, and cross-spark quads.
- [x] Draw rocket smoke trails directly in WebGL2 instead of through the staging canvas.
- [x] Draw projectile explosion spark bursts and radius rings directly in WebGL2.
- [x] Draw Ignatius death burst/cover particles directly in WebGL2.
- [x] Preserve ordered composition by inserting dedicated GPU particle passes between staging uploads.
- [x] Leave non-migrated procedural effects on the staging canvas.
- [x] Extend renderer source-contract coverage and bump packaged revision labels.

## Revision 313 direct WebGL2 enemy projectile migration

- [x] Add a dedicated direct WebGL2 pass for launched enemy projectile families.
- [x] Keep ordering between enemies, projectiles, Ignatius, and staged overlays intact.
- [x] Render enemy fireball trail particles through the same GPU pass.
- [x] Prefer atlas sprite rendering for fireballs, musket balls, and rocks.
- [x] Provide small cached fallback canvases for musket-ball and rock rendering when needed.
- [x] Continue using the Canvas fallback renderer unchanged when WebGL2 is unavailable.
- [x] Extend renderer source-contract coverage and bump packaged revision labels.

## Revision 314 direct WebGL2 player rocket migration

- [x] Add a dedicated direct WebGL2 pass for launched player rockets.
- [x] Preserve rocket ordering relative to direct trails/explosions and the staged player draw pass.
- [x] Render rocket body sprites through the GPU batcher with pivot-aware offset handling.
- [x] Add a lightweight GPU rocket-flame treatment using cached sprite art.
- [x] Skip WebGL-handled player rockets in the staged Canvas projectile pass.
- [x] Keep the Canvas fallback renderer unchanged when WebGL2 is unavailable.
- [x] Extend renderer source-contract coverage and bump packaged revision labels.

## Revision 315 direct WebGL2 actor migration

- [x] Render target markers directly through cached WebGL sprite quads.
- [x] Render ordinary pickups and power-up glow/icon composites directly through WebGL2.
- [x] Convert runtime character enemy draw commands into direct GPU quads.
- [x] Render enemy shadows and health bars directly with the WebGL backend.
- [x] Convert the Ignatius rig parts to direct WebGL2 while preserving animation sampling and facing.
- [x] Preserve shield and low-health tint overlays through cached tint textures.
- [x] Render score popups through cached WebGL text sprites.
- [x] Render portal-intro glow directly through an additive WebGL sprite.
- [x] Keep the mounted fuel bulb and debug/story overlays on the Canvas staging pass.
- [x] Preserve the complete Canvas fallback renderer.
- [x] Extend renderer source-contract coverage and bump packaged revision labels.

## Revision 316 WebGL parity audit

- [x] Compare the WebGL2 draw order against the revision 310 Canvas renderer.
- [x] Move Ignatius death-cover sparks after the GPU player rig.
- [x] Generate cached white hit-flash canvases for all loaded character projects.
- [x] Add an independent secondary tint overlay channel to GPU character rendering.
- [x] Restore enemy hit flashes in the WebGL path.
- [x] Restore player hit flashes without suppressing shield or low-health overlays.
- [x] Add regression source checks for ordering and hit-flash support.
- [x] Package without transient `.build` output.

## Revision 317 WebGL2 fallback review

- [x] Recompare the hybrid renderer with revision 310 Canvas draw order and fallback behavior.
- [x] Probe full WebGL2 backend initialization on a disposable scratch canvas before touching the visible canvas.
- [x] Preserve direct Canvas 2D startup when WebGL2 is unavailable or initialization fails.
- [x] Avoid rendering into the invisible staging canvas during transient WebGL context loss.
- [x] Add regression coverage for unavailable-context probing and successful scratch-backend initialization/disposal.
- [x] Keep gameplay, simulation, Canvas fallback draw order, and asset contracts unchanged.

## Revision 318 WebGL2 Level Editor compositor

- [x] Probe WebGL2 backend initialization on a disposable canvas before committing the visible editor stage.
- [x] Keep a complete visible Canvas 2D fallback when WebGL2 is unavailable.
- [x] Retain the existing cached Canvas static-scene renderer as the authoring source of truth.
- [x] Upload the static editor scene only when it is invalidated.
- [x] Draw placement previews, selection outlines, and marquees into a separate transparent transient surface.
- [x] Composite static and transient editor surfaces through the shared WebGL2 sprite backend.
- [x] Invalidate the retained static GPU texture whenever the Canvas scene cache is rebuilt.
- [x] Rebuild editor scene caches after WebGL context restoration.
- [x] Preserve editor data, hit testing, serialization, and Canvas fallback behavior.
- [x] Add source-contract coverage and bump packaged revision labels.

## Revision 319 canonical Overdrive identity

- [x] Rename the built-in effect constant to `POWER_UP_EFFECT_IDS.OVERDRIVE`.
- [x] Rename the portable effect ID from `speedShot` to `overdrive`.
- [x] Rename the entity type from `speedShotPickup` to `overdrivePickup`.
- [x] Update every bundled level and generated reward metadata record.
- [x] Update the entity catalog, reward catalog, editor stress fixture, tests, manuals, and project rules.
- [x] Remove all Speed Shot compatibility names rather than adding another alias.
- [x] Keep the retired `rocketOverdrive` identity unsupported.
- [x] Preserve Overdrive duration, half-fuel launch cost, passive recovery, stacking, and HUD priority.

## Revision 320 live-playtest visibility correction

- [x] Reproduce the reported failure from render-path inspection: static GPU scenery visible while direct dynamic sprites can vanish.
- [x] Restore all gameplay-critical dynamic visuals to one Canvas staging pass under WebGL2.
- [x] Preserve pre-WebGL2 draw order for targets, pickups, enemies, effects, projectiles, player, death cover, and score popups.
- [x] Keep static scenery, foreground, cave composition, and final presentation on WebGL2.
- [x] Leave pure Canvas fallback behavior unchanged.
- [x] Make Canvas 2D the default renderer and keep WebGL2 available through `game.html?webgl=1` and equivalent opt-in URL switches.
- [x] Benchmark dense and explosion-seeded level_002 viewports; both paths held 60 fps, but forced Canvas was slightly cheaper than the current staged WebGL2 hybrid path.
- [x] Record that direct dynamic GPU helpers require real-browser visual validation before reactivation.
- [x] Bump revision labels and regression coverage.

## Revision 323 opt-in resident-texture WebGL2 migration

- [x] Treat the supplied archive as revision 322 by user decree without inventing missing 321/322 history.
- [x] Synchronize the game and Level Editor labels to revision 323.
- [x] Keep Canvas 2D as the default and require the existing explicit WebGL URL parameter.
- [x] Retain original character atlas images and frame source rectangles in runtime assets.
- [x] Draw atlas-backed player, enemy, and projectile sprites directly from shared atlas textures.
- [x] Preload and pin known static environment, character, tint, smoke, and particle sources in WebGL2.
- [x] Re-upload pinned sources after WebGL context restoration.
- [x] Draw power-up glows by tinting their resident atlas frame instead of baking another Canvas texture.
- [x] Draw the mounted rocket fuel bulb through cached GPU sprites.
- [x] Restore direct GPU passes for targets, pickups, enemies, effects, projectiles, Ignatius, death cover, and score popups.
- [x] Give the cave mask its own reduced-resolution texture and update it only when the mask key changes.
- [x] Avoid ordinary full-screen Canvas-layer uploads during a warm gameplay frame.
- [x] Keep conditional Canvas staging for story/debug tooling and unsupported residual visuals.
- [x] Preserve WebGL context-loss behavior and the complete Canvas fallback path.
- [x] Expose resident texture memory and staging-layer counts in renderer diagnostics.
- [x] Validate the direct atlas path in real headed Chromium with visible Ignatius and zero warm-frame staging uploads.
- [x] Extend source-contract coverage and run game/smoke regression gates.
- [ ] Later: move CPU-generated cave masks, colour maps, overlap/foreground treatments, tint surfaces, and generated text/effect stamps into shaders or GPU render targets where measurements justify it.

## Revision 324 GPU effects and geometric cave mask

- [x] Increment game and Level Editor revision labels to 324.
- [x] Fix full-texture WebGL sprites so omitted source rectangles span the complete texture instead of a transparent corner texel.
- [x] Add a UV regression test for procedural resident textures.
- [x] Draw the player rocket's curved path trail directly through WebGL.
- [x] Keep goblin-fireball trail particles visible through the direct GPU path.
- [x] Give player and enemy projectile explosions visible GPU glow, disc, ring, and spark passes.
- [x] Draw reactive-object destruction smoke directly from the resident smoke stamp.
- [x] Keep rocket impact, enemy impact, teleport flash, and teleport spark records in the direct effect set.
- [x] Compile cave opening and feather contours into reusable world-space GPU geometry.
- [x] Draw the full-black cave exterior with an odd-even stencil pass.
- [x] Keep camera, zoom, and parallax changes uniform-only so they do not update a cave-mask texture.
- [x] Retain the Canvas cave-mask route as compatibility fallback and leave Canvas 2D as the default renderer.
- [x] Validate the headed Chromium WebGL2 frame with visible effects and `uploads:0 updates:0 layers:0` after warm-up.
- [x] Validate camera movement without texture uploads or updates.
- [x] Update architecture, developer guidance, renderer audit, plan, and automated contracts.

- [x] Remove the WebGL-only 40-pixel soft-glow core that snapped to the newest rocket-trail sample and looked like an intermittent orange warning beacon.


## Revision 327 temporary enemy balance controls

- [x] Add separate melee and ranged HP multipliers to Game tuning.
- [x] Preserve living enemies' current health percentage when an HP multiplier changes.
- [x] Add separate melee and ranged run-speed multipliers.
- [x] Add separate melee and ranged attack-rate multipliers that scale the complete attack cadence.
- [x] Add a ranged projectile-speed multiplier, including ballistic, homing, and dropped projectiles.
- [x] Apply ranged movement and attack-rate tuning to flying bombers.
- [x] Keep all multiplier defaults at 1 and leave authored enemy/level values untouched.
- [x] Add regression coverage for classification, live HP rescaling, movement, firing cadence, projectile speed, and the tuning UI.


## Revision 328 favicon and enemy-ID planning

- [x] Add a multi-resolution `favicon.ico` based on the authored Ignatius projectile rocket.
- [x] Reference the shared favicon from the game, redirects, manual, and browser authoring tools.
- [x] Require the favicon in packaging and source-organization regression checks.
- [x] Audit sparse enemy-number handling and confirm that holes do not break catalog enumeration.
- [ ] After the final mapping is approved, migrate goblins into `enemy_010`–`enemy_019` and bats into `enemy_020`–`enemy_029` in one coordinated revision.
