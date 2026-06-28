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
* [x] Treat perimeter spacing as a maximum and adapt it to sprite coverage so floor and ceiling decorations overlap instead of leaving visible gaps. Revision 140.
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
- [x] Add deterministic perimeter decoration using tagged atlas assets. Revision 138 adds seed/spacing/scale/brightness controls, replaceable generated records, and manual foreground placement.

### Revision 138 deterministic perimeter decoration and inert foreground

- [x] Move Edit perimeter and Add perimeter point controls from the global toolbar into the cave panel.
- [x] Add a dedicated manual foreground-placement tool using the currently selected atlas asset.
- [x] Add `src/shared/cave-window-decoration.js` for deterministic arc-length sampling, orientation classification, and tagged asset selection.
- [x] Store seed, spacing, scale, brightness, and saturation under `caveWindow.decoration`.
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
- [x] Reinterpret authored perimeter spacing as a maximum and reduce actual spacing according to chosen sprite coverage.
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

## Revision 213 Speed Shot and randomized wrench arsenal

- [x] Change the empty HUD label from `Powerup: None` to `Powerup:`.
- [x] Rename the lightning effect and catalog pickup to Speed Shot while normalizing legacy `rocketOverdrive` IDs.
- [x] Keep Speed Shot at eight seconds, half rocket fuel cost, double firing cadence, and higher HUD priority than wrenches.
- [x] Add a shared mutually exclusive `wrench` effect group with fifteen-second durations.
- [x] Implement Triple as three small one-third-damage homing rockets with distinct fan angles and separate target selection when possible.
- [x] Implement Dart as one normal-sized, forward, non-homing, double-damage rocket costing two-thirds standard fuel.
- [x] Implement Twin as two medium half-damage homing rockets with distinct launch angles.
- [x] Implement Bigbomb as a 1.7× rocket with triple fuel cost, triple damage, half speed, half homing response, and AoE radius of 1.5 wizard heights.
- [x] Implement Boomerang return after misses or destroyed targets and refund half launch fuel when caught.
- [x] Ensure collecting a wrench replaces only the active wrench and never cancels Speed Shot.
- [x] Add deterministic shared HUD priority when Speed Shot and a wrench coexist.
- [x] Add sixty-second respawn timers to all power-up pickups.
- [x] Add deterministic session-seeded random wrench selection at level start and reroll on respawn.
- [x] Preserve selected effect, respawn timer, and reroll count through state serialization.
- [x] Add Speed Shot and random-wrench catalog entities and Level Editor composite previews.
- [x] Keep Speed Shot at x=800 and add a random wrench at x=1400 in level 1.
- [x] Render per-mode projectile scale and a visible Bigbomb AoE pulse.
- [x] Update the game manual with durations, stacking, respawns, random wrench behavior, HUD priority, and all five wrench modes.
- [x] Update browser and portable build labels to revision 213.
- [x] Pass the complete aggregate headless test suite.



## Revision 214 cached wrench-rocket glow sprites

- [x] Store the launch-time wrench effect ID and glow tint on every wrench-modified projectile.
- [x] Keep standard and Speed Shot-only rockets free of wrench glow metadata.
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
- [x] Let Shield coexist with Speed Shot and one active wrench while taking highest priority in the Power HUD.
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
- [ ] Preserve the splash under Speed Shot and Shield, but exclude all wrench projectile modes.
- [ ] Add a restrained visual pulse distinct from Bigbomb.
- [ ] Add deterministic regressions for range, direct-hit exclusion, multiple secondaries, Speed Shot, Shield, and wrench exclusion.
- [ ] Playtest clustered Bombing Bats and tune diameter/line-of-effect behavior if necessary.

## Milestone C: location-triggered thought bubbles

- [ ] Add an editor-placeable rectangular thought trigger with text, bounds, one-shot policy, and stable ID.
- [ ] Trigger only on entry and serialize consumed state.
- [ ] Reuse the existing 18-characters-per-second reader, scrolling, final hold, input lock, and Jump/Fire advance behavior.
- [ ] Refactor mailbox and location triggers through a shared generic thought-sequence entry point.
- [ ] Render trigger bounds in the Level Editor while keeping them invisible in gameplay.
- [ ] Add deterministic and browser-assisted trigger/serialization regressions.

## Milestone D: basic boss encounters

- [ ] Add `isBoss` and `bossName` to enemy placements and Level Editor controls.
- [ ] Show one current/max-health boss bar for the actively engaged boss.
- [ ] Activate the bar through awareness, damage, or explicit encounter activation and hide it after defeat/reset.
- [ ] Emit a deterministic boss-defeated event.
- [ ] Preserve ordinary enemy scale, health, movement, and attack overrides as the boss implementation foundation.
- [ ] Add regressions for activation, health projection, defeat, serialization, and ordinary non-boss enemies.

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

- [x] Reduce the default chest footprint to 72 by 84 world units for broad ledge compatibility.
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
- [x] Preserve the splash for Speed Shot while disabling it for every wrench mode.
- [x] Add deterministic diagnostics and regression coverage for direct, nearby, distant, Speed Shot, and wrench cases.
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
