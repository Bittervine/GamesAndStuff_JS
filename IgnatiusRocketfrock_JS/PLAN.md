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

Ignatius is the calibration character for this system. The first goal is not to invent a new run, but to reproduce the current hardcoded wizard run as closely as possible using atlas frames, rig data, and keyframed animation. A temporary comparison mode should allow the old run pose and new animation pose to be compared until parity is good enough.

The current hardcoded jump, hover, launch, and airborne poses should eventually move into animation data. The simulation should describe gameplay state and relevant parameters; the animation system should choose, play, and blend poses for display.

## Character Tool

A dedicated `character_tool.html` should be added for rigging and animation work. It should be separate from the asset tool and level editor.

The asset tool is for world and character atlas frames, nodes, and collision data.

The level editor is for placing world assets and entities.

The character tool is for assembling character rigs and editing animation sequences.

The character tool should support:

* Loading atlas images and atlas JSON.
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
* A wizard run comparison mode against the current hardcoded run.

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
* `Space`, `GamepadB`: weapon / rocket launch.

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
* Fall damage is based on vertical impact speed, not fall distance, so rocket braking can reduce or prevent damage.
* The quick jump-plus-rocket-kick arc is the safe no-damage impact reference.
* Excess impact energy above that reference deals `10 HP` per wizard-height equivalent.
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
* Move jump, fall, hover, launch, idle, and landing poses into animation data.
* Add `character_tool.html` for rigging and animation editing.
* Support duplicate/edit workflows for animation sequences.
* Prepare the renderer data model for later WebGL2 batching.

This milestone is successful when the wizard renders from `ct_atlas_wizard_1.png`, the run animation is near pixel-perfect compared with the current version, and the character tool can edit and export the wizard rig and animations.

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
