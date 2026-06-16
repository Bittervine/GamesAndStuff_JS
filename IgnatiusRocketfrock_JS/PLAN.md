# Ignatius Rocketfrock Plan

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

* Use WebGL for performance when practical.
* The renderer should remain a thin presentation layer.
* The renderer should support sprite-based rigging for Ignatius.
* Ignatius is built from separate parts:

  * robe/body
  * head
  * hat
  * left arm
  * right arm
  * left leg/foot sprite
  * right leg/foot sprite
  * rocket or mounted weapon
* Assets should be mirrorable.
* Beard, hair, and robe details may later use simple physics or secondary animation.
* The body should use relatively short hair and a short full beard in-game, with longer simulated strands added as separate animated details.

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
* Later levels may be procedurally generated.
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

## First Milestone

Build a calibration arena.

Include:

* Fullscreen play area.
* Single hierarchical `gameState`.
* Fixed timestep simulation.
* Ignatius movement.
* Running.
* Jumping.
* Attached vertical rocket boost.
* Fuel gauge.
* Fuel recharge.
* Basic health.
* Low health reddish pulse.
* Simple hat state support, even if not fully used yet.
* Stationary target monsters.
* One simple detachable rocket weapon mode.
* Debug overlay.
* Headless movement, fuel, and game-state tests.

Do not build complicated levels yet.

The first milestone is successful when Ignatius is fun to run, jump, and boost around an empty arena.

## Second Milestone

Add detached weapon behavior properly.

Include:

* Weapon button input interpretation.
* Quick launch.
* Held aimed launch.
* Homing launch.
* Ballistic launch if still desired.
* Launch clearance.
* Explosion.
* Enemy hit detection.
* Fuel costs.
* Tests for all launch modes.
* Generic weapon framework that can support many future weapon modes.

## Third Milestone

Add level structure and story wrapper.

Include:

* Mailbox.
* Editor letter scroll.
* Thought bubbles.
* First themed level.
* Title revision gag.
* Basic pickups.
* Simple enemy placement.
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

## Current Open Questions

* How exactly does the hat fly off?
* How does the hat return?
* Does losing the hat have gameplay effects or is it visual/comedic?
* What happens at zero health?
* Should jump height vary depending on button hold duration?
* Should attached boost require the rocket to be visually mounted?
* Can Ignatius use detached weapons while boosting?
* Can the rocket be unavailable while reforming?
* Should weapon mode be selected by input gesture, equipped mode, pickups, or upgrades?
* Should fuel and health pickups be separate?
* Should explosions knock Ignatius back?
* How much slow-motion is used during aimed launch?
* Should the editor comment on repeated deaths, hat loss, or weapon misuse?
* How much of the camera state belongs in `gameState` versus renderer-only presentation?
* Should debug event history be capped by event count, time, or both?
