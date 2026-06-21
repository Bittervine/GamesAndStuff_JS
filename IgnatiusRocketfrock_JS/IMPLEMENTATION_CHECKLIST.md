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

The run clip is loaded through `ct_char_wizard_1.json`, validated by `IgnatiusRocketfrock_ANIMATION.js`, and sampled as rig-space keyframes. The old procedural run, comparison overlay, toolbar button, and <kbd>N</kbd> shortcut have been removed. `ct_anim_wizard_run_1.json` is now the sole ground-run source of truth.

`character_tool.html` now loads and edits mapped animation JSON. It provides playback, pause, loop, speed, scrubbing, stepping between authored key times, a per-part/per-property timeline, draggable key markers, exact key time/value/easing fields, add/delete/copy/paste operations, and animation JSON export. Shared mutation logic is tested through `IgnatiusRocketfrock_ANIMATION_EDITOR.js`.

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

`character_tool.html` can now load a known character project, an arbitrary character-definition URL, a browser-selected group of files, or a selected project directory where the browser supports directory picking. Local files remain in an in-memory workspace and their relative JSON references are resolved without requiring hardcoded wizard paths. Explicit pickers are available for the character definition, rig, atlas manifest, atlas PNG, and one or more animation files.

The “New character” workflow creates consistently named, mutually referenced atlas, rig, character-definition, and idle-animation templates. A placeholder root frame/part keeps the new project structurally valid until real atlas rectangles and rig parts are authored. Character and atlas JSON can now be applied, refreshed, and exported alongside the existing rig and animation exports. Shared project-template, classification, inventory, and path-resolution logic lives in `IgnatiusRocketfrock_CHARACTER_PROJECT.js` and is covered by the headless testbench.

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

* [x] Create `character_tool.html`.
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

### Phase 2 Completion

* [ ] The wizard renders from `ct_atlas_wizard_1.png` and no longer needs individual body-part PNG files.
* [x] The wizard run animation is reproduced by data-driven animation with near pixel-perfect parity.
* [ ] Jump, fall, hover, launch, idle, and landing poses are animation data rather than renderer-specific hardcoding.
* [x] The character tool can edit and export wizard rig and animation data.
* [ ] The generic character renderer is ready to support monsters and other mobs.
* [x] Headless and/or browser tests cover key migration risks.

## Phase 3: Monster and Mob Character Pipeline

Goal: use the Phase 2 character pipeline for enemies and non-wizard creatures.

### Monster Rig Support

* [x] Create a simple humanoid enemy rig (`enemy_001`, Skeleton Guard).
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
* [x] At least one monster has assigned animations for idle/move/attack/hurt (`enemy_001`, with death also authored).
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
* [ ] Implement the mirrored level-exit portal sequence.
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
[x] Prevent placement of more than one editor-letter mailbox per level.

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
[ ] Add a generated enemy index or controlled numbered discovery pass for `ct_char_enemy_0XX.json`.
[ ] Populate future level-editor enemy palettes from that enemy index.

