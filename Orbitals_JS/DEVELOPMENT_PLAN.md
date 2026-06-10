# Orbitals JS Development Plan

This document supersedes `PLANETARY_COMBAT_PLAN.md` and `PLANETARY_COMBAT_PLAN_2.md` as the working development plan for Orbitals JS.

The old plans remain useful historical notes, but this file is now the main road map. It combines:

- the already implemented encounter-director foundation,
- the unfinished items from the planetary combat plans,
- the dense close-range planetary swarm goal,
- shields, rapid fire, pickups, and ThoriumGap-inspired weapons,
- and a structural refactor toward clean simulation subsystems.

The purpose is not only to add features. The purpose is to make the codebase easier to understand, test, extend, and hand to new coders.

## 1. Current codebase diagnosis

The current project has a mostly correct top-level split:

```text
Orbitals_JS.html      Browser shell and HUD markup.
Orbitals_JS.js        Three.js rendering, camera, input, audio, HUD, browser loop.
Orbitals_Sim.js       Game rules, physics, encounters, enemies, projectiles, motherships.
orbitals_config.js    Gameplay tuning constants.
orbitals_testbench.mjs
                      Headless regression tests.
```

This is the right broad direction. The problem is that `Orbitals_Sim.js` has grown into a very large multi-subsystem file, and the sim/presentation boundary is not as clean as the filename split suggests.

As inspected in the current zip:

- `Orbitals_Sim.js` is roughly 4,700+ lines.
- `Orbitals_JS.js` is roughly 2,500+ lines.
- The testbench is large and valuable, with active tests passing.
- Several free-space gravity tests are intentionally skipped while free-space gravity is being reworked.
- The encounter director exists and already supports planetary invasion, free-space ambush, transport defense, convoy escort, and boss support wave scenarios.
- Presentation patterns exist for behind-catchup, side-cross, and head-on breakaway.
- Mothership arrival, fighter launch, fighter patrol, encounter clearing, and several transport defense behaviors are covered by tests.

The architecture is therefore not broken. It is becoming too dense. It needs to be divided before the next large gameplay layer is added.

## 2. Primary development objectives

### 2.1 Keep presentation separate from working code

The simulation must own gameplay state and deterministic behavior.

The renderer must own Three.js objects, HUD elements, audio nodes, DOM nodes, visual effects, model loading, and camera behavior.

The simulation should not know that an enemy has a `THREE.Group`, a model pivot, a glow mesh, or an engine effect. It should know only about gameplay-relevant state such as position, velocity, health, role, target, weapon, pickup, shield, encounter ID, and event records.

### 2.2 Make the design easy to see

A new coder should be able to open the project and quickly answer:

- Where does player movement live?
- Where does enemy AI live?
- Where do motherships live?
- Where do pickups live?
- Where does the encounter director live?
- Where does rendering for enemies live?
- Where are constants defined?
- Where are tests for a subsystem located?

The desired structure should be diagrammable. Each subsystem should be a box. Each box should have its own state, helpers, update function, and tests.

### 2.3 Prefer subsystem design over classical inheritance

Do not move toward a deep object-oriented actor hierarchy.

Avoid this as the central design:

```js
class Actor {
    update(dt) {}
}

class Enemy extends Actor {
    update(dt) {}
}

class Mothership extends Enemy {
    update(dt) {}
}
```

This game has cross-cutting systems: planets, atmosphere, gravity, encounters, presentation slots, motherships, pickups, projectiles, HUD priority, player-relative target opportunities, entity-relative attack runs, and future objective scenarios. Deep inheritance would hide update order and make dependencies harder to reason about.

Prefer plain state objects plus subsystem functions.

Example target style:

```js
GameStep.update(game, dt, controls) {
    World.update(game, dt);
    Player.update(game, dt, controls);
    Encounters.update(game, dt);
    Enemies.update(game, dt);
    Motherships.update(game, dt);
    Collisions.update(game, dt);
    Projectiles.update(game, dt);
    Pickups.update(game, dt);
    Effects.update(game, dt);
}
```

A subsystem may expose functions and local helpers, but the central update order must remain visible.

## 3. Target mental model

The game should be understandable as this pipeline:

```text
Input
  -> controls object
  -> simulation step
  -> mutated GAME state and event log
  -> renderer observes state
  -> HUD, audio, and visuals react
```

The simulation is the source of truth for gameplay.

The renderer is the source of truth for visual objects.

The event log is the bridge for one-shot presentation effects, messages, sounds, explosions, pickup notifications, and debug records.

## 4. Target project structure

The final file layout should move toward this shape:

```text
src/
├─ main.js
│  Browser entrypoint and render loop.
│
├─ config.js
│  All gameplay-tuning constants.
│
├─ sim/
│  ├─ sim.js
│  │  createOrbitalsSim(), bootstrapWorld(), stepGame(), public test/debug API.
│  │
│  ├─ game_state.js
│  │  createGameState(), resetGameState(), top-level nested GAME shape.
│  │
│  ├─ math.js
│  │  clamp, smoothstep, easing, seeded RNG, basis helpers, vector helpers.
│  │
│  ├─ world.js
│  │  planets, planet motion, fuel mote simulation, star/planet separation.
│  │
│  ├─ flight_physics.js
│  │  shared atmosphere, bound/free flight, capture, lift, stall, terrain guard.
│  │
│  ├─ player.js
│  │  player ship state, player movement, fuel, firing requests, crash/respawn.
│  │
│  ├─ enemies.js
│  │  enemy state, enemy squads, fighter AI, swarm behavior, enemy damage.
│  │
│  ├─ motherships.js
│  │  mothership squads, arrival, hold, reorientation, release, exit.
│  │
│  ├─ encounters.js
│  │  encounter director, presenter assignment, objective attackers, missions.
│  │
│  ├─ projectiles.js
│  │  projectile spawning, homing, piercing, collision, lifetime.
│  │
│  ├─ pickups.js
│  │  power-up spawning, drifting, magnet pull, collection, expiration.
│  │
│  ├─ weapons.js
│  │  DART, TWIN, FAN, ROCKET, BEAM pattern generation and upgrade rules.
│  │
│  ├─ collisions.js
│  │  ship/ship, projectile/enemy, projectile/entity, terrain and sun crashes.
│  │
│  ├─ spatial_hash.js
│  │  broad-phase enemy lookup for dense swarms.
│  │
│  ├─ effects.js
│  │  simulation-side records for explosions and temporary gameplay effects.
│  │
│  └─ events.js
│     event log helpers and combat-log formatting.
│
├─ render/
│  ├─ renderer.js
│  │  Three.js scene setup and render loop integration.
│  │
│  ├─ assets.js
│  │  GLB loading, fallback models, asset cache.
│  │
│  ├─ world_view.js
│  │  planet, star, fuel mote visuals.
│  │
│  ├─ player_view.js
│  │  player ship visuals, engine effects, shield rings.
│  │
│  ├─ enemies_view.js
│  │  enemy and encounter-entity visuals.
│  │
│  ├─ projectiles_view.js
│  │  projectile meshes and weapon-specific visuals.
│  │
│  ├─ pickups_view.js
│  │  pickup glow, labels, drift visuals.
│  │
│  ├─ effects_view.js
│  │  explosions, flashes, transient visual effects.
│  │
│  ├─ hud.js
│  │  HUD markers, shield display, weapon display, mission messages.
│  │
│  ├─ camera.js
│  │  camera follow, free-flight roll alignment, atmospheric camera behavior.
│  │
│  ├─ audio.js
│  │  sound generation and event-driven sound triggers.
│  │
│  └─ input.js
│     mouse, keyboard, gamepad, pointer lock, controls object.
│
└─ tests/
   └─ orbitals_testbench.mjs
```

This layout is a target, not a mandatory one-patch change. The current import path may stay stable while modules are introduced.

## 5. Target top-level game state

The current state is mostly flat:

```js
state.planets
state.fuelMotes
state.enemies
state.enemySquads
state.mothershipSquads
state.projectiles
state.encounterDirector
state.encounterEntities
state.ship
state.eventLog
```

That should evolve toward a nested subsystem state:

```js
const GAME = {
    seed,
    rng,
    time: 0,
    frameIndex: 0,
    loaded: false,

    world: {
        planets: [],
        fuelMotes: [],
        nearestPlanet: null,
        nearestAltitude: 0,
        nearestDistance: 0
    },

    player: {
        ship: null,
        fuel: 100,
        maxFuel: 100,
        score: 0,
        crashed: false,
        crashTimer: 0,
        crashRespawnReady: false,
        respawnPlanetIndex: 0,
        gamepadRespawnHeld: false
    },

    enemies: {
        nextId: 1,
        nextSquadId: 1,
        items: [],
        squads: [],
        explosions: []
    },

    motherships: {
        squads: [],
        spawnTimer: 0,
        rng: null
    },

    encounters: {
        director: null,
        entities: []
    },

    projectiles: {
        nextId: 1,
        items: []
    },

    pickups: {
        nextId: 1,
        items: []
    },

    spatial: {
        enemyHash: null
    },

    events: {
        log: []
    }
};
```

Do not migrate to this shape all at once. Use compatibility helpers during the transition.

Example transitional helpers:

```js
function getEnemyItems(state) {
    return state.enemies?.items || state.enemies || [];
}

function getProjectileItems(state) {
    return state.projectiles?.items || state.projectiles || [];
}
```

Once all callers use the new subsystem fields, remove the old flat fields.

## 6. Presentation boundary cleanup

Current sim state includes presentation fields on gameplay objects, including fields such as:

```js
root
visual
modelPivot
model
engineEffects
```

These should be removed from simulation objects over time.

Simulation objects should contain only gameplay state:

```js
enemy.id
enemy.position
enemy.previousPosition
enemy.velocity
enemy.forward
enemy.up
enemy.health
enemy.radius
enemy.visualScale
enemy.kind
enemy.family
enemy.assetFile
enemy.combatRole
enemy.presentation
enemy.objectiveAttack
enemy.encounterId
```

The renderer should maintain visual maps:

```js
const planetViews = new Map();
const enemyViews = new Map();
const mothershipViews = new Map();
const encounterEntityViews = new Map();
const projectileViews = new Map();
const pickupViews = new Map();
const explosionViews = new Map();
```

The renderer may read stable IDs and asset metadata from sim objects, but it must not write Three.js objects back into sim state.

This is one of the highest-priority structural improvements because dense swarms, pickups, shields, and weapons will otherwise add many more visual fields to sim objects.

## 7. Constants rule

All gameplay-affecting constants must live in `orbitals_config.js` or its eventual replacement `src/config.js`.

Do not add magic numbers inside subsystem update code.

Allowed exceptions:

- obvious mathematical constants such as `0`, `1`, `2`, `Math.PI`, or vector normalization fallbacks,
- test-only values inside `orbitals_testbench.mjs`, where a test deliberately overrides config,
- rendering-only values in render files, if they do not affect gameplay.

Add a static test or script guard that flags newly introduced gameplay constants in simulation modules. It does not need to be perfect at first. It should catch the obvious cases.

## 8. Current completed foundation from the old plans

The following old-plan items appear to have a real implementation in the current codebase and should be preserved:

- Generic encounter director state and update logic.
- `planetInvasion` encounter support.
- `freeSpaceAmbush` test coverage.
- `transportDefense` test coverage.
- `convoyEscort` test coverage.
- `bossSupportWave` test coverage.
- Player-relative presentation slots:
    - behind catch-up,
    - side cross,
    - head-on breakaway.
- Entity-relative attack slots for objective encounters.
- Mission messages exposed through encounter state and rendered by the UI.
- Mothership arrival, hold, smooth reorientation, fighter drop, and exit behavior.
- Fighter patrol after atmospheric settle.
- Disabled enemy-enemy collision damage for invasion-style combat.
- HUD priority reduction for non-presenting enemies.
- Testbench coverage for current presenter budgets and encounter rotation.

Do not discard this work during refactor. The first refactor acceptance rule is: existing active tests must still pass.

## 9. Known unfinished or partially finished work to carry forward

These items are inherited from `PLANETARY_COMBAT_PLAN.md` and `PLANETARY_COMBAT_PLAN_2.md`. They must not be treated as complete until they have explicit tests and acceptance evidence.

### 9.1 Config cleanup

- [ ] Move remaining gameplay-affecting constants from `Orbitals_Sim.js` into `orbitals_config.js`.
- [ ] Move projectile homing constants into config.
- [ ] Move enemy base speed, turn, and up-scale ranges into config.
- [ ] Move enemy AI smoothing and wander constants into config.
- [ ] Move enemy hit radius and explosion constants into config.
- [ ] Add a static guard that fails when new gameplay constants appear inside simulation files.

### 9.2 Route anchor support

- [ ] Implement `anchorKind: 'route'`.
- [ ] Add route points.
- [ ] Add route progress.
- [ ] Add route radius.
- [ ] Add current segment index.
- [ ] Update `getEncounterAnchorPosition` for route anchors.
- [ ] Update `getEncounterAnchorVelocity` for route anchors.
- [ ] Add route-anchor smoke tests.

### 9.3 Active threat budget

The current code has `encounterMaxActiveThreatsNearPlayer`, but the dense swarm plan requires stronger proof that the immediate danger budget is actually enforced.

- [ ] Define active threat precisely.
- [ ] Count presenters near the player.
- [ ] Count objective attackers near the player.
- [ ] Count reserve or swarm enemies inside the danger bubble and in front of the player.
- [ ] Count any enemy on a collision course with the player.
- [ ] Add `countActiveThreatsNearPlayer(state)`.
- [ ] Add tests proving the director respects the configured threat budget.

### 9.4 Head-on breakaway polish

- [ ] Add the missing head-on gentle-turn test.
- [ ] Ensure head-on stops correcting toward the player at commit, not only after breakaway begins.
- [ ] Store a locked commit vector or commit point.
- [ ] Test that the locked point remains stable while the player turns.

### 9.5 Transport defense reality check

Some transport defense tests exist. Keep these items open until tested through natural gameplay, not only helpers.

- [ ] Confirm transport attackers can damage the protected entity through normal update logic.
- [ ] Add or verify configurable attack range.
- [ ] Add or verify attack cooldown.
- [ ] Add test proving attackers can reduce transport health naturally.
- [ ] Add test proving player presenters in transport defense generate shootable frames.
- [ ] Add test proving transport defense can be lost without direct test-helper damage.

### 9.6 Planet clear proof

- [ ] Add long-running natural planet-invasion test.
- [ ] Verify no fighters die from terrain crash during normal invasion.
- [ ] Verify no fighters escape the planet unintentionally during normal invasion.
- [ ] Verify no enemy-enemy collision damage occurs.
- [ ] Verify clearing depends on player projectile kills or explicit test-helper kills only.
- [ ] Verify the player can leave after clear.

### 9.7 Testbench dependency

- [ ] Ensure the uploaded/testable repo includes `lib/three.module.js`, or update imports so the testbench runs from the provided bundle.
- [ ] Add a bootstrap test that fails clearly if Three.js cannot be loaded.

### 9.8 Free-space gravity rework

The testbench currently skips several free-space gravity/orbit tests. This should remain tracked.

- [ ] Decide final free-space gravity model.
- [ ] Re-enable `free-moves-along-nose` once model is ready.
- [ ] Re-enable free approach/gravity/orbit tests.
- [ ] Preserve the desired arcade orbit behavior if that remains the design.
- [ ] Preserve no free-space drag if that remains the design.

## 10. Dense planetary combat goal

The old director reduced dashboard chaos by showing only a few enemies at once. That remains good for active threats, but it is not enough for the desired game feel.

The new goal separates:

```text
visual crowd density
```

from:

```text
active player-facing threat budget
```

A planet invasion should feel crowded and fast. The sky should contain many enemies. But only a few should become immediate, readable, close-range targets at the same time.

Target behavior:

- A planet invasion should eventually field about 100 to 150 fighters.
- Close presenters should often appear about 1/3 to 1/5 the apparent size of the player ship.
- Most enemies should be background swarm traffic, not direct attackers.
- Enemies should fly rapidly and avoid one another.
- Enemies should avoid the player danger bubble unless selected as a presenter.
- Dense swarms should not collapse into one line or one lane.
- Destroyed enemies should drop power-ups.
- Pickups should include shield, rapid fire, and weapon upgrades.
- Weapon upgrades should mirror the spirit of ThoriumGap's DART, TWIN, FAN, ROCKET, and BEAM weapon families.

## 11. Dense swarm definitions

### 11.1 Visible swarm

Enemies that exist physically in the planet arena and create background motion.

They should:

- fly fast,
- stay in a valid atmospheric altitude band,
- avoid terrain,
- avoid other enemies,
- avoid the player danger bubble,
- sometimes cross the player's view,
- yield to presenters,
- not all become direct attackers at once.

### 11.2 Close presenter

An enemy selected by the director to become a readable target opportunity near the player.

It should:

- enter the player's forward view,
- appear in the target apparent-size range,
- remain shootable briefly,
- avoid ramming the player,
- escape or return to swarm/cooldown.

### 11.3 Immediate danger bubble

A player-centered region where too many enemies would cause chaos or unavoidable collisions.

This must be controlled by steering and budgets, not by deleting enemies.

### 11.4 Apparent size ratio

The headless testbench cannot render the real camera, so it needs a geometric approximation.

Suggested metric:

```js
enemyAngularSize = enemy.visualScaleOrRadius / distanceFromPlayerOrCamera;
playerAngularSize = playerReferenceVisualSize / cameraShipDistance;
apparentRatio = enemyAngularSize / playerAngularSize;
```

Target range:

```text
0.20 <= apparentRatio <= 0.33
```

The formula may be tuned after comparing testbench values to browser screenshots, but the metric must exist before tuning distances.

## 12. Development sequence

The order matters. Do not bolt the dense swarm onto the current monolith and then refactor afterward. That would multiply the tangle.

Use this sequence:

1. Stabilize architecture boundaries.
2. Extract low-risk subsystems.
3. Add missing test metrics and unfinished proof tests.
4. Add dense swarm mechanics.
5. Add pickups and player survival systems.
6. Add weapon framework and ThoriumGap-inspired weapons.
7. Integrate, tune, and document.

Each phase must leave the testbench runnable.

## 13. Phase A: Architecture safety rails

Goal: make future changes safer without changing gameplay.

Tasks:

- [ ] Create a short architecture header comment in `Orbitals_Sim.js` describing the intended subsystem split.
- [ ] Add a subsystem map to this development plan or `AGENTS.md`.
- [ ] Add an update-order comment above `step()`.
- [ ] Add a testbench smoke test that validates the public sim API still exists:
    - `state`,
    - `bootstrapWorld`,
    - `step`,
    - `respawnShip`,
    - `createEncounter`,
    - `createEncounterEntity`,
    - `forceEnemyPresentation`,
    - `destroyEnemy`,
    - `damageEncounterEntity`.
- [ ] Add a static or semi-static test that searches for obvious new gameplay magic numbers in sim files.
- [ ] Add a static or semi-static test that warns if Three.js visual fields are added to new sim state objects.

Acceptance:

- [ ] No gameplay behavior changes.
- [ ] Existing active tests pass.
- [ ] New guard tests pass.
- [ ] Future coding agents have a visible structural target.

Expected files:

- `Orbitals_Sim.js`
- `orbitals_testbench.mjs`
- `AGENTS.md` or `DEVELOPMENT_PLAN.md`

## 14. Phase B: Presentation ownership cleanup

Goal: make renderer-owned data live in the renderer.

Tasks:

- [ ] Identify all sim fields used only for presentation:
    - `root`,
    - `visual`,
    - `modelPivot`,
    - `model`,
    - `engineEffects`,
    - any future pickup/projectile visual handles.
- [ ] Introduce renderer-side maps for visual bundles:
    - `shipView`,
    - `planetViews`,
    - `enemyViews`,
    - `mothershipViews`,
    - `encounterEntityViews`,
    - `projectileViews`,
    - `pickupViews`,
    - `explosionViews`.
- [ ] Update renderer creation and cleanup to use IDs and maps.
- [ ] Remove visual object fields from sim state factories after renderer maps are working.
- [ ] Keep gameplay metadata in sim when needed by renderer:
    - `assetFile`,
    - `family`,
    - `visualScale`,
    - `radius`,
    - `kind`,
    - `id`.
- [ ] Verify sim state can be stepped in the testbench without any visual fields.

Acceptance:

- [ ] No Three.js object reference is stored in sim gameplay objects.
- [ ] Browser still renders planets, player, enemies, projectiles, explosions, and encounter entities.
- [ ] Testbench still passes.
- [ ] Renderer cleanup removes orphan visuals when sim objects disappear.

Expected files:

- `Orbitals_JS.js`
- `Orbitals_Sim.js`
- `orbitals_testbench.mjs`

## 15. Phase C: Extract low-risk simulation modules

Goal: begin splitting `Orbitals_Sim.js` without changing behavior.

Start with low-dependency helpers, not enemy AI.

Suggested first extractions:

1. `sim/math.js`
2. `sim/events.js`
3. `sim/world.js`
4. `sim/projectiles.js`
5. `sim/effects.js`

Tasks:

- [ ] Create a `src/sim/` directory, or a flat `sim_*.js` transition if changing paths is too disruptive.
- [ ] Move helpers one group at a time.
- [ ] Keep exports small and explicit.
- [ ] Run the testbench after each extraction.
- [ ] Avoid circular imports.
- [ ] Keep `createOrbitalsSim()` as the compatibility facade.

Acceptance:

- [ ] Testbench passes after each extracted module.
- [ ] No behavior changes.
- [ ] The main sim file becomes shorter and more navigable.
- [ ] The extracted modules have obvious ownership.

Expected files:

- `Orbitals_Sim.js`
- new `src/sim/*.js` files or transitional module files
- `orbitals_testbench.mjs` if imports need updating

## 16. Phase D: Extract high-value gameplay subsystems

Goal: turn the current monolith into visible gameplay districts.

Suggested extraction order:

1. `flight_physics.js`
2. `player.js`
3. `encounters.js`
4. `enemies.js`
5. `motherships.js`
6. `collisions.js`
7. `pickups.js`
8. `weapons.js`
9. `spatial_hash.js`

Important dependency rule:

- `enemies.js` may call shared flight helpers.
- `motherships.js` may create enemy/fighter state through an enemy subsystem API.
- `encounters.js` may assign roles and request presentations, but should not directly mutate visual state.
- `projectiles.js` may query enemies and encounter entities, but should not know about renderer objects.
- `pickups.js` may apply player effects, but should not create HUD text directly.

Acceptance:

- [ ] `stepGame()` reads as the central table of contents.
- [ ] Each subsystem has a single obvious update function.
- [ ] New coders can locate enemy, mothership, pickup, projectile, and encounter behavior without search spelunking.
- [ ] Existing active tests pass.

## 17. Phase E: Nested subsystem state migration

Goal: move from flat `state` arrays to a nested `GAME` object.

Do this only after the subsystems are mostly extracted.

Tasks:

- [ ] Introduce nested state while retaining compatibility helpers.
- [ ] Migrate one subsystem at a time:
    - `state.planets` -> `state.world.planets`,
    - `state.fuelMotes` -> `state.world.fuelMotes`,
    - `state.ship`, `state.fuel`, `state.score` -> `state.player.*`,
    - `state.enemies`, `state.enemySquads` -> `state.enemies.items`, `state.enemies.squads`,
    - `state.mothershipSquads` -> `state.motherships.squads`,
    - `state.projectiles` -> `state.projectiles.items`,
    - `state.encounterDirector`, `state.encounterEntities` -> `state.encounters.*`,
    - `state.eventLog` -> `state.events.log`.
- [ ] Update renderer and tests using helper functions first.
- [ ] Remove old aliases only after all tests and browser visuals are stable.

Acceptance:

- [ ] Top-level state is grouped by subsystem.
- [ ] Public API remains stable or has a deliberate migration note.
- [ ] Testbench passes.
- [ ] Renderer still displays all existing gameplay objects.

## 18. Phase F: Apparent-size metrics and close-range proof tests

Goal: define what “close enough” means before tuning behavior.

Add helpers to the testbench:

```js
estimateApparentSizeRatio(state, enemy)
isEnemyCloseReadableFromPlayer(state, enemy, cfg)
countCloseReadableFramesDuring(sim, enemyId, steps, controls)
```

Tests:

- [ ] `runApparentSizeMetricTest`
    - too close,
    - desired 1/3 to 1/5 range,
    - too far.
- [ ] `runCloseShootableMetricTest`
    - close and in front is close-readable,
    - old far presentation can be shootable but not close-readable.

Acceptance:

- [ ] Testbench can measure closeness without browser rendering.
- [ ] Old far-away presentation distances fail the close-readability target.
- [ ] No production behavior changes yet.

Expected files:

- `orbitals_testbench.mjs`
- `orbitals_config.js`

## 19. Phase G: Close presenter retuning

Goal: make one fighter at a time pass close enough to look large.

Tasks:

- [ ] Add close presentation config values:
    - `encounterClosePresentationEnabled`,
    - `encounterTargetApparentSizeMin`,
    - `encounterTargetApparentSizeMax`,
    - `encounterCloseSafetyDistance`,
    - `encounterCloseReadableRequiredFrames`,
    - close offsets for behind, side, and head-on passes.
- [ ] Retune behind-catchup to enter the close-readable band.
- [ ] Retune side-cross to enter the close-readable band.
- [ ] Retune head-on breakaway so it does not ram at close range.
- [ ] Add close-range safety constraints:
    - never target inside safety distance,
    - escape if distance drops below safety distance,
    - add side/up escape offset when collision risk is detected.
- [ ] Add debug fields to presentation events:
    - `apparentSizeRatio`,
    - `minDistanceToPlayer`,
    - `maxReadableFrames`,
    - `closeReadableFrames`.

Tests:

- [ ] `runCloseBehindCatchupPresentationTest`
- [ ] `runCloseSideCrossPresentationTest`
- [ ] `runCloseHeadOnBreakawayPresentationTest`
- [ ] `runClosePresentationAvoidsPlayerCollisionTest`

Acceptance:

- [ ] Each pattern produces configured close-readable frames.
- [ ] No pattern collides with the player.
- [ ] No pattern causes terrain crash.
- [ ] Debug events record close-readability metrics.

## 20. Phase H: Dense mothership fighter release

Goal: increase planet invasion population without spawning everything in one choking burst.

Current config is closer to 10 to 15 fighters per mothership. The desired dense invasion is roughly 100 to 150 fighters.

Tasks:

- [ ] Add burst release config:
    - `mothershipFighterBurstSizeMin`,
    - `mothershipFighterBurstSizeMax`,
    - `mothershipFighterMaxAlivePerMothership`,
    - `mothershipDenseFighterCountMin`,
    - `mothershipDenseFighterCountMax`.
- [ ] Modify `spawnFighterSquadFromMothership` or add `spawnFighterBurstFromMothership`.
- [ ] Spawn fighters around the mothership using a ring, fan, or staggered cloud pattern.
- [ ] Ensure every fighter receives:
    - unique ID,
    - correct squad ID or sub-squad ID,
    - correct encounter ID,
    - correct parent mothership ID,
    - correct target planet,
    - correct event records.
- [ ] Ensure `encounter.totalReleased` counts fighters, not only squads.
- [ ] Ensure alive count is based on actual alive fighters.
- [ ] Keep mothership exit logic correct with many fighters alive.

Tests:

- [ ] `runMothershipFighterBurstReleaseTest`
- [ ] `runDenseMothershipReleaseCountTest`
- [ ] `runDenseMothershipExitAfterClearTest`

Acceptance:

- [ ] 100 to 150 fighters can be spawned for one planet invasion.
- [ ] Encounter accounting remains correct.
- [ ] Mothership still exits after fighters are gone.
- [ ] Testbench performance remains acceptable.

## 21. Phase I: Planetary swarm roles

Goal: make most dense invasion fighters active background traffic rather than passive reserves.

Target roles:

```js
enemy.combatRole =
    'swarm' |
    'reserve' |
    'candidate' |
    'presenter' |
    'objectiveAttacker' |
    'cooldown';
```

Swarm behavior:

- Maintain an atmospheric altitude band.
- Move tangentially around the planet.
- Use per-enemy lane variation.
- Avoid terrain.
- Avoid the player danger bubble.
- Avoid nearby enemies.
- Occasionally cross the player's view.
- Yield to presenters.
- Return to swarm after presentation cooldown.

Tasks:

- [ ] Add `computeEnemySwarmTargetPoint(state, enemy, squad, planet, time)`.
- [ ] Add per-enemy swarm fields:
    - `swarmLaneSide`,
    - `swarmLaneAltitudeFactor`,
    - `swarmLaneTimer`,
    - `swarmAvoidanceVector`,
    - `swarmLocalSeed`.
- [ ] Assign new fighters to `swarm` after settle.
- [ ] Keep existing patrol mode as fallback until swarm tests pass.
- [ ] Project all swarm targets to a valid atmospheric shell.
- [ ] Preserve terrain protection.

Tests:

- [ ] `runSwarmRoleAssignmentAfterSettleTest`
- [ ] `runSwarmAltitudeBandTest`
- [ ] `runSwarmAvoidsPlayerDangerBubbleTest`
- [ ] `runSwarmAvoidsTerrainTest`
- [ ] `runSwarmDoesNotCollapseIntoLineTest`
- [ ] `runSwarmUsesManyHeadingsTest`

Acceptance:

- [ ] Fighters settle into atmosphere and become swarm enemies.
- [ ] Swarm enemies do not all fly in one line.
- [ ] Swarm enemies stay in a valid altitude band.
- [ ] Swarm enemies avoid the immediate player danger bubble unless selected as presenters.

## 22. Phase J: Spatial hash and dense performance

Goal: support 100+ enemies without all-pairs steering becoming the hidden monster under the bed.

State:

```js
state.spatial.enemyHash = {
    cellSize,
    cells: new Map()
};
```

Tasks:

- [ ] Rebuild the enemy spatial hash once per sim step before enemy steering.
- [ ] Add `getNearbyEnemies(state, enemy, radius, limit)`.
- [ ] Use nearby lookup for enemy avoidance.
- [ ] Use nearby lookup for threat counting.
- [ ] Optionally use nearby lookup for projectile collision broad phase if needed.

Tests:

- [ ] `runEnemySpatialHashSmokeTest`
- [ ] `runEnemySpatialHashNeighborLimitTest`
- [ ] `runDenseSwarmPerformanceBudgetTest`

Acceptance:

- [ ] 150 enemies can be stepped in the testbench without pathological slowdown.
- [ ] Neighbor lookups return nearby enemies and exclude far enemies.
- [ ] Avoidance no longer depends on full all-pairs loops for every enemy.

## 23. Phase K: Collision avoidance and rapid motion

Goal: make the sky crowded and fast without turning it into a blender.

Rules:

- Enemy-enemy collision damage should remain disabled for invasion swarms.
- Enemies should steer away before overlap.
- If overlap occurs, separate steering targets over time. Do not teleport visible enemies.
- Presenters have priority over swarm enemies.
- Swarm enemies yield to presenters.
- All enemies avoid the player safety bubble unless explicitly selected for close presentation.

Tasks:

- [ ] Add avoidance steering vector to enemy target computation.
- [ ] Add config weights:
    - `swarmEnemyAvoidanceWeight`,
    - `swarmPlayerAvoidanceWeight`,
    - `swarmTerrainAvoidanceWeight`,
    - `swarmPresenterYieldWeight`,
    - `swarmMinEnemySeparation`,
    - `swarmMinPlayerSeparation`.
- [ ] Add debug counters:
    - `nearEnemyAvoidanceCount`,
    - `nearPlayerAvoidanceCount`,
    - `minEnemySeparation`,
    - `minPlayerSeparation`.
- [ ] Add rare failure events:
    - `enemy-near-collision`,
    - `enemy-player-near-miss`,
    - `enemy-swarm-overlap-failure`.

Tests:

- [ ] `runDenseSwarmNoEnemyOverlapTest`
- [ ] `runDenseSwarmNoPlayerCollisionTest`
- [ ] `runPresenterPriorityAvoidanceTest`
- [ ] `runDenseSwarmRapidMotionTest`

Acceptance:

- [ ] In a 150-enemy scenario, enemies keep minimum separation above configured threshold most of the time.
- [ ] Presenters still complete close-readable passes.
- [ ] No enemy crashes into terrain during dense swarm tests.
- [ ] No neutral-flight player collisions occur unless intentionally forced.

## 24. Phase L: Active presenter and threat budgets for crowded skies

Goal: keep dense swarms readable.

Tasks:

- [ ] Replace or supplement `encounterMaxActivePresenters` with:
    - `planetSwarmMaxClosePresenters`,
    - `planetSwarmMaxImmediateThreats`.
- [ ] Keep 2 to 4 close presenters active.
- [ ] Allow many background swarm enemies.
- [ ] Count active threats near player separately from total enemies.
- [ ] If threat budget is exceeded:
    - stop selecting new presenters,
    - make nearby swarm enemies veer outward,
    - push low-priority debug event if persistent.

Tests:

- [ ] `runCrowdedSkyPresenterBudgetTest`
- [ ] `runCrowdedSkyThreatBudgetTest`
- [ ] `runCrowdedSkyStillHasManyVisibleEnemiesTest`

Acceptance:

- [ ] 100+ enemies can exist around a planet.
- [ ] Only configured number become close presenters.
- [ ] Player danger bubble is respected.
- [ ] Background density remains high.

## 25. Phase M: Pickup simulation

Goal: enemies drop useful rewards that can be collected during atmospheric combat.

Pickup types:

```js
'shield'
'rapid'
'weapon'
```

Target state shape:

```js
{
    id,
    type: 'shield' | 'rapid' | 'weapon',
    weaponMode: 'dart' | 'twin' | 'fan' | 'rocket' | 'beam' | '',
    position,
    previousPosition,
    velocity,
    boundPlanet,
    age,
    lifetime,
    radius,
    magnetized,
    collected
}
```

Tasks:

- [ ] Add `state.pickups` or nested `state.pickups.items`.
- [ ] Add `createPickupState`.
- [ ] Add `spawnPickup`.
- [ ] Add `maybeDropPickupForEnemy`.
- [ ] Add `updatePickups`.
- [ ] Add pickup collection against player ship.
- [ ] Add magnetic pull near the player.
- [ ] Add pickup cleanup on respawn and bootstrap.
- [ ] Add events:
    - `pickup-spawn`,
    - `pickup-collect`,
    - `pickup-expire`.
- [ ] Atmospheric pickups should drift on a valid shell rather than falling through terrain or flying into deep space.

Drop rules:

- Regular enemy: small chance.
- Close presenter: slightly higher chance.
- Mothership: guaranteed several drops.
- Weapon pickup chooses a weapon family.
- Avoid spawning pickups inside terrain.

Tests:

- [ ] `runPickupSpawnFromEnemyKillTest`
- [ ] `runPickupDoesNotSpawnInsidePlanetTest`
- [ ] `runPickupAtmosphereDriftTest`
- [ ] `runPickupCollectionTest`
- [ ] `runPickupMagnetPullTest`
- [ ] `runPickupExpirationTest`
- [ ] `runPickupCleanupOnRespawnTest`

Acceptance:

- [ ] Pickups spawn deterministically under seeded tests.
- [ ] Pickups can be collected.
- [ ] Pickups do not enter invalid terrain states.
- [ ] Pickup events are available to renderer and HUD.

## 26. Phase N: Shields

Goal: shield pickups let the player absorb damage, capped at 3 shields.

Player state:

```js
ship.shields = 0;
ship.maxShields = config.playerShieldMax;
```

Tasks:

- [ ] Add config:
    - `playerShieldMax: 3`,
    - `shieldPickupValue`,
    - `shieldDamageAbsorbCount`,
    - `shieldInvulnerabilitySecondsAfterHit`.
- [ ] Add `applyShieldPickup`.
- [ ] Shield pickup increases shield count up to max.
- [ ] Shield prevents one lethal or damaging event, depending on selected design.
- [ ] Shield hit should push event:
    - `player-shield-hit`.
- [ ] Shield capped pickup overflow should either score or do nothing, controlled by config.

Tests:

- [ ] `runShieldPickupIncreasesShieldTest`
- [ ] `runShieldCapAtThreeTest`
- [ ] `runShieldAbsorbsEnemyCollisionTest`
- [ ] `runShieldAbsorbsTerrainCrashOrDoesNotDependingOnDesignTest`
- [ ] `runShieldOverflowBehaviorTest`

Acceptance:

- [ ] Player can hold up to 3 shields.
- [ ] Shield count is deterministic and testable.
- [ ] Shield behavior is visible through events.

## 27. Phase O: Rapid fire

Goal: rapid-fire pickup temporarily increases player fire rate.

Player state:

```js
ship.rapidFireTimer = 0;
```

Tasks:

- [ ] Add config:
    - `rapidFireDuration`,
    - `rapidFireCooldownMultiplier`,
    - `rapidFireStackMode`.
- [ ] Add `applyRapidFirePickup`.
- [ ] Update player firing cooldown calculation.
- [ ] Decide stacking behavior:
    - refresh duration,
    - extend duration,
    - cap duration.
- [ ] Push events:
    - `player-rapid-start`,
    - `player-rapid-refresh`,
    - `player-rapid-end`.

Tests:

- [ ] `runRapidFirePickupStartsTimerTest`
- [ ] `runRapidFireDoublesFireRateTest`
- [ ] `runRapidFireExpiresTest`
- [ ] `runRapidFireStackModeTest`

Acceptance:

- [ ] Rapid fire approximately doubles shooting frequency by default.
- [ ] Effect expires cleanly.
- [ ] Testbench can prove projectile count difference.

## 28. Phase P: Weapon framework

Goal: replace single fixed projectile burst with configurable weapon families and tiers.

Player state:

```js
ship.weaponMode = 'dart';
ship.weaponTier = 1;
ship.weaponTiers = {
    dart: 1,
    twin: 1,
    fan: 1,
    rocket: 1,
    beam: 1
};
```

Weapon families:

- DART: direct forward shots. Higher tiers add center and angled darts. Tier V may add a stronger or piercing center shot.
- TWIN: side-by-side forward streams. Higher tiers add center and wider side shots.
- FAN: spread weapon. Higher tiers increase spread and shot count.
- ROCKET: slower heavier shots with homing behavior.
- BEAM: fast narrow piercing shots or beam-like projectiles.

Tasks:

- [ ] Add `weapons.js` or equivalent subsystem.
- [ ] Add `buildWeaponPattern(ship, fireDirection, config)`.
- [ ] Add weapon metadata to projectiles:
    - `weaponMode`,
    - `weaponTier`,
    - `damage`,
    - `pierceRemaining`,
    - `homingStrength`,
    - `splashRadius`,
    - `visualKind`.
- [ ] Modify `spawnProjectileBurst` to delegate to weapon pattern builder.
- [ ] Keep existing weapon feel as DART tier I.

Tests:

- [ ] `runDefaultWeaponIsDartTierOneTest`
- [ ] `runWeaponPatternDeterminismTest`
- [ ] `runProjectileMetadataForWeaponTest`
- [ ] `runWeaponFireDoesNotBreakExistingProjectileTests`

Acceptance:

- [ ] Existing firing behavior still works as DART tier I.
- [ ] Weapon pattern generation is deterministic.
- [ ] Projectiles carry enough metadata for damage and visuals.

## 29. Phase Q: DART, TWIN, FAN, ROCKET, BEAM

Implement one weapon family at a time. Do not implement all five in a single patch.

### 29.1 DART

Tests:

- [ ] `runDartTierOnePatternTest`
- [ ] `runDartTierFivePatternTest`
- [ ] `runDartPiercingCenterTest`

Acceptance:

- [ ] DART is the reliable forward weapon.
- [ ] Higher tiers materially increase forward firepower.

### 29.2 TWIN

Tests:

- [ ] `runTwinTierOnePatternTest`
- [ ] `runTwinTierFivePatternTest`
- [ ] `runTwinProjectileOffsetsRemainParallelTest`

Acceptance:

- [ ] TWIN fires two distinct parallel streams.
- [ ] Higher tiers add center or wider side streams.

### 29.3 FAN

Tests:

- [ ] `runFanTierOnePatternTest`
- [ ] `runFanTierFivePatternTest`
- [ ] `runFanSpreadAnglesTest`

Acceptance:

- [ ] FAN is visibly and mechanically different from DART.
- [ ] FAN is useful against dense swarms.

### 29.4 ROCKET

Tests:

- [ ] `runRocketTierOnePatternTest`
- [ ] `runRocketHomingBehaviorTest`
- [ ] `runRocketDamageIsHigherThanDartTest`
- [ ] `runRocketTierFivePatternTest`

Acceptance:

- [ ] ROCKET is slower, heavier, and homing.
- [ ] ROCKET does not make normal homing projectiles obsolete through excessive tuning.

### 29.5 BEAM

Tests:

- [ ] `runBeamTierOnePatternTest`
- [ ] `runBeamPiercesMultipleEnemiesTest`
- [ ] `runBeamFastProjectileLifetimeTest`

Acceptance:

- [ ] BEAM can hit multiple enemies in a line.
- [ ] BEAM is distinct from DART by speed and pierce behavior.

## 30. Phase R: Weapon pickups and upgrades

Goal: mirror ThoriumGap's upgrade spirit in 3D Orbitals combat.

Rules:

- A weapon pickup has a weapon family.
- If pickup family differs from current weapon:
    - switch to that family,
    - use stored tier for that family,
    - default to tier I if no stored tier exists.
- If pickup family matches current weapon:
    - increase that family's tier up to V.
- If already at tier V:
    - apply overflow behavior controlled by config.

Tasks:

- [ ] Add weapon pickup family selection.
- [ ] Add `applyWeaponPickup`.
- [ ] Add per-family stored tiers.
- [ ] Add weapon banner/message state or events.
- [ ] Push events:
    - `player-weapon-switch`,
    - `player-weapon-upgrade`,
    - `player-weapon-overflow`.

Tests:

- [ ] `runWeaponPickupSwitchesFamilyTest`
- [ ] `runWeaponPickupUpgradesSameFamilyTest`
- [ ] `runWeaponTierCapsAtFiveTest`
- [ ] `runWeaponFamilyTierMemoryTest`
- [ ] `runWeaponOverflowTest`

Acceptance:

- [ ] Same-family pickups upgrade.
- [ ] Different-family pickups switch.
- [ ] Tier cap is enforced.
- [ ] Per-family tier memory works.

## 31. Phase S: Pickup, shield, weapon, and projectile visuals

Goal: make rewards readable in a crowded sky while keeping presentation separate from sim.

Rendering tasks:

- [ ] Add `pickupViews` map.
- [ ] Add `updatePickupVisuals`.
- [ ] Add shield visual rings on the player.
- [ ] Add weapon/tier HUD display.
- [ ] Add rapid-fire timer HUD display.
- [ ] Add projectile visual variants by `weaponMode` or `visualKind`.
- [ ] Add optional debug readout for apparent-size and close-presenter metrics.
- [ ] Keep all visual objects out of sim state.

HUD requirements:

- [ ] Player can see shield count.
- [ ] Player can see rapid-fire time remaining.
- [ ] Player can see current weapon family and tier.
- [ ] Player can distinguish weapon pickups from shield and rapid-fire pickups.

Suggested visual language:

- Shield pickup: blue/cyan glow.
- Rapid-fire pickup: warm yellow/orange glow.
- Weapon pickup: family label or distinct symbol.
- Shields: 1 to 3 subtle rings or ticks around player/HUD.

Tests:

- [ ] Rendering is mostly manual/browser-tested.
- [ ] Add testbench snapshot fields for weapon, shield, rapid-fire, and pickup state.
- [ ] Add pure helper tests for HUD formatting if helpers exist.

Acceptance:

- [ ] Player can see what they picked up.
- [ ] Player can see current survival and weapon state.
- [ ] Projectiles visually differ enough to debug weapon behavior.

## 32. Phase T: Scoring and reward loop

Goal: dense combat should feel rewarding without breaking progression.

Suggested scoring:

- enemy kill gives score,
- pickup overflow gives score,
- mothership kill gives larger score,
- clearing a planet gives bonus,
- weapon pickup does not score unless overflow.

Tasks:

- [ ] Add score constants.
- [ ] Ensure score is updated through sim events or player state.
- [ ] Ensure dense enemies do not inflate score absurdly unless intended.
- [ ] Add planet-clear score event.

Tests:

- [ ] `runEnemyKillScoreTest`
- [ ] `runPickupOverflowScoreTest`
- [ ] `runPlanetClearBonusScoreTest`

Acceptance:

- [ ] Score is deterministic in tests.
- [ ] Dense swarms feel rewarding.
- [ ] Score does not depend on renderer behavior.

## 33. Phase U: Dense planet invasion integration

Goal: combine all planetary combat systems.

Tasks:

- [ ] Create `createDensePlanetInvasionScenario` test helper.
- [ ] Run a simulation with 100+ enemies.
- [ ] Force player firing for a fixed window.
- [ ] Confirm:
    - enemies can be killed,
    - pickups can spawn,
    - pickups can be collected,
    - weapon upgrades affect projectile pattern,
    - shields can be gained,
    - rapid-fire changes fire rate,
    - planet encounter remains active and clearable.

Tests:

- [ ] `runDensePlanetInvasionSmokeTest`
- [ ] `runDensePlanetInvasionPickupLoopTest`
- [ ] `runDensePlanetInvasionClosePresenterLoopTest`
- [ ] `runDensePlanetInvasionClearTest`

Acceptance:

- [ ] A planet invasion is a crowded arcade combat arena.
- [ ] Enemies pass close enough to look large.
- [ ] Many enemies remain visible in the sky.
- [ ] Power-ups create a reward loop.
- [ ] Weapon upgrades materially change combat.
- [ ] Encounter accounting remains correct.

## 34. Phase V: Free-space encounter extensibility

Goal: keep the encounter director general enough for future scenarios.

Future scenario examples:

- free-space fighter ambush,
- defense of a transport ship,
- convoy escort,
- attack on a protected objective,
- boss support wave,
- route-based patrol or convoy.

Tasks:

- [ ] Complete route anchors.
- [ ] Ensure transport/convoy/boss encounter logic does not depend on planet-only assumptions.
- [ ] Separate planet-invasion swarm roles from free-space encounter roles.
- [ ] Allow objective attackers to operate against moving route entities.
- [ ] Keep presentation patterns reusable where possible.
- [ ] Add a small scenario factory layer for tests.

Acceptance:

- [ ] New encounter types do not require rewriting enemy update from scratch.
- [ ] Route-based entities can be used as anchors.
- [ ] Planetary swarm code does not pollute free-space encounter logic.

## 35. Phase W: Tuning and debug tools

Goal: make the game easy to tune after all mechanics exist.

Add debug summaries for each invasion:

- total fighters,
- max alive fighters,
- active presenter count,
- active threat count,
- average apparent size during presentation,
- close-readable frames,
- pickup drops,
- pickup collections,
- player weapon tier progression,
- player shields gained and consumed,
- enemy crash count,
- enemy near-collision count,
- minimum enemy separation,
- minimum player separation,
- planet clear time.

Add config presets:

- `debugDenseSwarmPreset`,
- `debugClosePresentationPreset`,
- `debugPickupHeavyPreset`,
- `debugWeaponUpgradePreset`.

Acceptance:

- [ ] Testbench outputs useful tuning metrics.
- [ ] Browser debug HUD can show selected metrics without cluttering normal play.
- [ ] Tuning can happen mostly through config.

## 36. Milestones

### 36.1 Milestone 1: Clean architecture baseline

Complete when:

- [ ] Active testbench tests pass.
- [ ] Public sim API smoke test exists.
- [ ] Presentation fields are removed from sim state or isolated behind renderer maps.
- [ ] At least math/events/world/projectiles/effects are extracted or clearly sectioned.
- [ ] The central update order is explicit and documented.
- [ ] No new gameplay constants are added outside config.

### 36.2 Milestone 2: Close presenters proven

Complete when:

- [ ] Apparent-size metric exists.
- [ ] Behind-catchup close pass works.
- [ ] Side-cross close pass works.
- [ ] Head-on close pass avoids collision.
- [ ] Close presenter debug metrics exist.

### 36.3 Milestone 3: Dense swarm foundation

Complete when:

- [ ] Mothership can release 100+ fighters through burst spawning.
- [ ] Fighters become swarm-role enemies after settling.
- [ ] Dense swarm stays in atmosphere.
- [ ] Dense swarm does not collapse into a line.
- [ ] Dense swarm avoids player danger bubble.
- [ ] Dense swarm avoids enemy overlap.
- [ ] Active close presenters stay within configured budget.
- [ ] Threat budget is actually enforced.
- [ ] Planet invasion still clears correctly.

### 36.4 Milestone 4: Pickups and survival loop

Complete when:

- [ ] Pickups spawn from killed enemies.
- [ ] Pickups can be collected.
- [ ] Shield pickup works and caps at 3.
- [ ] Shield prevents one configured damage event.
- [ ] Rapid-fire pickup doubles fire rate temporarily.
- [ ] Pickup visuals exist.
- [ ] HUD shows shields and rapid-fire state.

### 36.5 Milestone 5: Weapon upgrade loop

Complete when:

- [ ] Weapon framework replaces single projectile burst.
- [ ] DART works through five tiers.
- [ ] TWIN works through five tiers.
- [ ] FAN works through five tiers.
- [ ] ROCKET works through five tiers.
- [ ] BEAM works through five tiers.
- [ ] Weapon pickups switch and upgrade families.
- [ ] Per-family weapon tiers are remembered.
- [ ] Weapon visuals and HUD exist.
- [ ] Dense planet invasion remains playable with upgraded weapons.

### 36.6 Milestone 6: Extensible encounter system

Complete when:

- [ ] Route anchors are implemented.
- [ ] Transport defense can be won and lost through natural update logic.
- [ ] Free-space encounters remain supported.
- [ ] Planet-specific swarm logic is isolated from general encounter machinery.
- [ ] New encounter scenario factories can be added without reshaping the whole codebase.

## 37. Final acceptance criteria

The overall plan is complete when:

- [ ] The codebase has a clear presentation/simulation split.
- [ ] The simulation is divided into obvious subsystems.
- [ ] The top-level game state is grouped by subsystem or has a clear migration path.
- [ ] New coders can draw a subsystem diagram from the file structure.
- [ ] Active testbench tests pass.
- [ ] Previously skipped free-space tests are either restored or explicitly replaced by new accepted tests.
- [ ] A planet invasion can field roughly 100 to 150 fighters.
- [ ] The sky visibly feels crowded.
- [ ] Enemies move rapidly and avoid collisions.
- [ ] Close presenters often appear between 1/3 and 1/5 of the player ship's apparent size.
- [ ] The player can shoot down close enemies reliably.
- [ ] Destroyed enemies can drop shield, rapid-fire, and weapon pickups.
- [ ] Player can hold up to 3 shields.
- [ ] Rapid fire temporarily doubles shooting frequency.
- [ ] Weapon upgrades mirror ThoriumGap's DART, TWIN, FAN, ROCKET, and BEAM structure in 3D form.
- [ ] The encounter director remains general enough for later free-space encounters.
- [ ] Transport-defense unfinished items from the previous plans are not falsely marked complete.
- [ ] All new behavior is covered by testbench tests.

## 38. Design warnings

### 38.1 Do not refactor everything at once

Large behavior-preserving refactors are safer than mixed refactor-feature patches, but only if they are sliced carefully. Extract one subsystem, run tests, then continue.

### 38.2 Do not hide update order behind actor polymorphism

An `actor.update()` design will look clean until encounter roles, objective attackers, presenter slots, swarm yielding, weapon pickups, and planet capture all need to coordinate. Keep update order explicit.

### 38.3 Do not add visual fields back into sim objects

It will be tempting when adding pickups, shield rings, and weapon projectiles. Resist it. Use renderer maps.

### 38.4 Do not use all-pairs avoidance for dense swarms

It may pass at 20 enemies and collapse at 150. Add the spatial hash before dense avoidance becomes central.

### 38.5 Do not confuse visible density with threat density

The sky can be packed with enemies, but the active danger budget must stay controlled. The player should feel pressure, not arithmetic doom.

### 38.6 Do not mark natural gameplay complete using only helper-driven tests

Helper tests are useful, but planet clear, transport failure, pickup loops, and dense swarm survival need natural update-path tests too.

## 39. Suggested coding-agent prompt for future implementation

When handing this to a coding agent, use a prompt like this:

```text
Read AGENTS.md and DEVELOPMENT_PLAN.md first.
Use orbitals_testbench.mjs as the primary validation path.
Do not use Playwright.
Do not add gameplay constants outside orbitals_config.js.
Preserve separation between simulation and presentation.
Keep renderer-owned Three.js objects out of simulation state.
Implement only the requested phase or subphase.
Add or update tests before behavior changes whenever possible.
Run node orbitals_testbench.mjs before reporting completion.
List changed files and summarize which acceptance criteria are now satisfied.
```

## 40. Immediate recommended next patch

The next practical patch should be Phase A plus a small part of Phase B:

1. Add architecture comments and update-order documentation.
2. Add testbench smoke guard for the public sim API.
3. Add a simple guard against new sim visual fields.
4. Create renderer-owned maps for one object class, preferably projectiles or explosions, because they are simpler than enemies.
5. Run the testbench.

This keeps the first step small, verifies the direction, and avoids opening the dense swarm floodgate while the codebase is still wearing one giant `Orbitals_Sim.js` coat.
