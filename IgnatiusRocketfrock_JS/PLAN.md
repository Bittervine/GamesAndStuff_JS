# Ignatius Rocketfrock Plan

## Files

These files are currently being used (also clarifies which that should be in the assets folder)

assets/at_atlas_001.json
assets/at_atlas_001.png
assets/ct_anim_wizard_run_1.json
assets/ct_atlas_wizard_1.json
assets/ct_atlas_wizard_1.png
assets/ct_char_wizard_1.json
assets/ct_rig_wizard_1.json
assets/level_001.json
assets/title_card.png
AGENTS.md
asset_tool.html
character_tool.html
game.html
IgnatiusRocketfrock_ANIMATION.js
IgnatiusRocketfrock_ANIMATION_EDITOR.js
IgnatiusRocketfrock_ATLAS_EDITOR.js
IgnatiusRocketfrock_CHARACTER_DIRTY.js
IgnatiusRocketfrock_CHARACTER_PROJECT.js
IgnatiusRocketfrock_CHARACTER_RUNTIME.js
IgnatiusRocketfrock_CHARACTER_VIEW.js
IgnatiusRocketfrock_GAME.js
IgnatiusRocketfrock_INPUT.js
IgnatiusRocketfrock_JS.html
IgnatiusRocketfrock_RENDER.js
IgnatiusRocketfrock_SIM.js
IMPLEMENTATION_CHECKLIST.md
level_editor.html
PLAN.md
renderer_smoke.html
testbench.mjs



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

Separate the game into clean layers.

### `IgnatiusRocketfrock_SIM.js`

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

### `IgnatiusRocketfrock_INPUT.js`

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

### `IgnatiusRocketfrock_RENDER.js`

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

### `IgnatiusRocketfrock_GAME.js`

Main browser orchestration.

Responsibilities:

* Load assets.
* Start the game loop.
* Connect input, sim, and renderer.
* Manage fixed timestep simulation.
* Handle pause, restart, debug flags, and dev tools.

### `testbench.mjs`

Headless and integration tests.

The testbench should be able to run the simulation without rendering.

Some integration tests may still use Playwright to verify browser behavior, but most mechanical tests should target the simulation directly.

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
* Camera-relevant world state.
* Deterministic random seed and random generator state.
* Debug flags.
* Recent gameplay events.

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

### State ownership rule

If it affects gameplay, save/load, replay, tests, or debugging, it belongs in `gameState`.

If it only displays, loads, or plays the state, it belongs outside `gameState`.

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

`gameState.debug.lastEvents` should store recent important events.

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

As of revision 056, the ground run is exclusively data-driven. `ct_char_wizard_1.json` maps the `run` slot to `ct_anim_wizard_run_1.json`, and `IgnatiusRocketfrock_ANIMATION.js` validates and samples the clip. Animation transforms use unscaled rig-space pixels for `x` and `y`, radians for `rotation`, a target-height multiplier for `scale`, and a scalar for `alpha`. Clips declare duration, looping, playback cadence, interpolation per keyframe, and optional root-motion metadata.

The obsolete procedural run and `data` / `legacy` / `compare` controls have been removed. The headless testbench now validates clip structure, loop closure, finite sampled poses, editor mutations, and the absence of the retired migration path.

`character_tool.html` loads the mapped animation file and previews it through the same evaluator used by the game. It supports playback, pause, scrubbing, stepping between authored key times, loop and speed controls, per-part/per-property timelines, draggable key markers, exact time/value/easing edits, add/delete/copy/paste operations, and animation JSON export. Shared editing operations live in `IgnatiusRocketfrock_ANIMATION_EDITOR.js`.

Revision 058 removed the tool's hardwired wizard-project assumption. Puppet Forge can now load a known character, an arbitrary character-definition URL, selected local files, or a selected project directory. It can also create a consistently named blank character project containing mutually referenced atlas, rig, character-definition, and idle-animation templates. The local workflow keeps browser-selected files in memory and resolves relative references without pretending the browser can silently access arbitrary folders.

Revision 059 added direct animation-pose manipulation. In the combined `X, Y and Angle` property mode, dragging inside the selected part rectangle authors position keys at the current playhead and dragging a corner handle authors rotation. Missing transform keys are created automatically from the sampled pose so edits cannot disappear between existing keys. Numeric key values now preview immediately and create a key at an unkeyed playhead. The preview supports pointer-anchored mouse-wheel zoom without changing animation or rig coordinates.

Revision 060 made preview zoom use the mouse wheel directly, without requiring Ctrl. Puppet Forge now labels the rig panel as base/setup data and explains the current split: pivot and target height remain shared sprite geometry, while setup offsets and base scale are transitional rig defaults that data-driven clips override with their authored absolute X, Y, and scale values during playback.

Revision 061 added an Atlas Parts workspace. It draws the configured atlas PNG in image-pixel coordinates and supports drawing, selecting, moving, resizing, renaming, duplicating, deleting, and validating frame rectangles. Renaming a frame updates atlas-object and rig-part references. The tool also tracks unsaved character, atlas, rig, and per-animation documents independently, preserves edited clips while switching animation slots, and warns before a project reload discards work.

Revision 063 added the first enemy, now named `enemy_001` and displayed as Skeleton Guard, as a directly selectable known project and connected its atlas, rig, character definition, and idle animation. Atlas Parts mode can now create a rig part from the selected frame or create parts for every unassigned frame; matching animation transforms are added to loaded clips so the parts appear immediately in the rig preview. Atlas 002 and Atlas 003 were segmented into reusable frame rectangles and given closed blockable silhouette traces.

Revision 064 established the Skeleton Guard's equipped rig and editable two-step walk/march clip. Revision 077 later superseded the exact draw order and animation values with the user's revised `enemy_001` files.

Revision 065 added selected-part draw-order authoring directly to Puppet Forge. The Base rig / setup values panel now exposes **To Back** and **To Front**, operating on the rig's shared back-to-front `drawOrder` without changing animation transforms or atlas data.

Revision 084 added direct animation-metadata authoring and clip duplication. Puppet Forge can now edit the animation ID, duration, loop flag, mirrorability, idle threshold, playback cadence, and maximum speed ratio without hand-editing JSON. Shortening a clip below its final authored key is rejected rather than silently deleting or merging keys. **Duplicate current** creates a deep-copied animation under a new character slot, assigns a stable `ct_anim_<character>_<slot>.json` filename, updates the character definition in memory, and tracks the new character and animation documents independently for export.

Revision 085 introduced `IgnatiusRocketfrock_CHARACTER_RUNTIME.js` as the shared browser runtime loader for character definitions, rigs, atlases, atlas PNGs, and mapped animation clips. Runtime rigs no longer assume wizard or humanoid part names. The module normalizes arbitrary draw orders and pivots, samples named animation slots, converts rig-space poses into rendered transforms, and produces a simple ordered draw-command list suitable for the current Canvas 2D renderer and a later WebGL renderer. The game preloads both Ignatius and `enemy_001`; level data can already author a static `characterEnemy` with a `characterId`, animation slot, facing, and render scale. Enemy placement UI and movement behaviour remain the next milestone.

Revision 066 extended level placements with a shared transform pipeline. Atlas assets can be mirrored independently on X and Y and rotated around their center. The level editor preview, selection hit testing, runtime rendering, atlas guide overlays, and atlas-derived collision geometry must all use `IgnatiusRocketfrock_LEVEL_TRANSFORM.js` so visual art and gameplay collision cannot drift apart. Placement `rotation` is stored in radians, while the editor exposes degrees. Right-mouse dragging pans the level view regardless of the selected tool.

Revision 067 streamlined the normal placement workflow: choosing an asset enters Place Asset mode, and a successful placement immediately selects the new object and returns the editor to Select mode for fine positioning. Failed placements must leave the current tool unchanged.

Revision 068 made cutout masks reveal the renderer's opaque deep-blue cave backing instead of erasing canvas alpha, which could appear as pure black. The level editor now also exposes **Copy asset** beside **Place asset**. Copying duplicates every placement property, assigns a fresh ID, offsets the copy slightly up and right, selects it, and returns to Select mode.

Revision 069 added a non-destructive level-wide selective hue rotation for environment atlas artwork. Levels store `colorMap` settings for enablement, source-hue centre, selected hue width, feather, and rotation. The original PNGs are never modified. The editor and runtime build recoloured offscreen atlas copies only when the settings change, then use ordinary cached `drawImage` calls during rendering. The deep-blue background, characters, transparency, and collision geometry remain unaffected. Atlas-backed entity artwork participates in the same cached colour mapping as other level assets.

Revision 070 introduced the interactive/story-item atlas `it_atlas_001`. Its companion catalog `it_entities_001.json` maps stateful level entities to atlas visuals without baking behaviour into the PNG rectangles. The Level Editor can place atlas-backed target dummies, mailboxes, chests, portals, switches, gates, fuel, herbs, keys, checkpoints, and hazards. Entity state definitions are copied into level JSON so levels remain self-contained. The open portal uses a normal world layer plus an `actorFront` visual layer, allowing Ignatius to pass behind the duplicated foreground door edge.

Revision 071 implemented the first scripted story-item behaviour: a portal marked with `portalRole: "entrance"` can own the level-start sequence. The runtime begins with the portal closed and Ignatius hidden, switches the entity to its open visual state, walks Ignatius from inside the doorway to the authored `playerStart` while normal input is locked, draws the portal's `actorFront` half-door after the player, then closes the portal and releases control. Portal timing and walk speed live on the entity, and runtime visual-state changes go through the shared entity-state helper rather than hardcoded renderer sprite swaps. The same portal/state foundation should later support mirrored exits.

The generic runtime character loader and Canvas 2D draw-command renderer arrived in revision 085. Revision 093 completed the first real enemy integration: `enemy_001` is catalogued and placeable in the Level Editor, previews through the generic rig renderer, snaps to authored ground, and uses simulation-owned idle/patrol behaviour. The next major milestone is combat state and projectile interaction for placed enemies. Remaining Puppet Forge rig polish includes part deletion, frame reassignment, role/tag authoring, and direct pivot editing; those improvements should continue without delaying combat integration.

## Character Tool

A dedicated `character_tool.html` should be added for rigging and animation work. It should be separate from the asset tool and level editor.

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

This tool is expected to be used heavily, so it should favor a comfortable editing workflow rather than a minimal debug UI.

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
* Add `character_tool.html` for rigging and animation editing.
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

Placed character enemies now own simulation state for guard and patrol behaviour. Patrols alternate between idle and walk animation slots, follow nearby walkable or blockable support, reverse at their authored limits, ledges, or blocking geometry, and keep their homing target anchor synchronized while moving. `level_001` includes the first Skeleton Guard patrol on the right gallery. Rendering remains presentation-only; enemy movement and animation-state selection live in `IgnatiusRocketfrock_SIM.js`.

