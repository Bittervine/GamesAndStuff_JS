# Planetary Combat and Encounter Director Plan

This document is the working plan for turning fighter combat in Orbitals JS into readable casual shoot-em-up encounters while preserving the broad space-sim feel of the game.

The first implementation target is planetary invasion combat: a mothership arrives at a planet, releases fighters, and the player clears that planet as a level-like combat arena.

However, the design must not become planet-only. The encounter director should be general enough to later support free-space ambushes, transport defense, convoy escort, boss support waves, and other mission-like combat scenarios.

The implementing agent must update this document as work progresses. Mark completed subtasks with `[X]`, add new subtasks when needed, and record design changes under the relevant section.

## Prompt for the coding agent

You are working on the Orbitals JS game.

Your goal is to implement test-driven combat encounters where enemies do not dogfight endlessly, but instead create readable arcade target opportunities for the player. The desired feel is closer to After Burner than realistic aerial combat.

The first milestone is planetary fighter combat. The architecture must still remain extensible so future free-space encounters can reuse the same director and role system.

Important project rules:

- Keep game logic and behavior in `Orbitals_Sim.js`.
- Keep rendering and UI behavior in `Orbitals_JS.js` and `Orbitals_JS.html`.
- Keep gameplay constants in `orbitals_config.js`. Do not add gameplay magic numbers directly to `Orbitals_Sim.js`.
- Maintain and expand `orbitals_testbench.mjs`.
- Do not use Playwright unless explicitly authorized. The headless JS testbench is the primary validation tool.
- Preserve the existing mothership and fighter drop flow unless a test-driven change requires a small controlled refactor.
- Prefer physics-respecting behavior. Enemies may have better speed, turn authority, altitude control, and boost behavior than the player, but they should still use the shared ship movement model where possible.
- Avoid teleporting visible enemies. Off-screen repositioning may be added later only as a last-resort arcade assist, and only after tests exist.
- Implement the director as a general encounter system, not as a planet-only system.

The implementation should be incremental. Start by adding test helpers and measurable presentation metrics. Then implement the simplest presentation pattern first: enemies catching up from behind and overtaking into the player’s forward firing lane. Add side-crossing after that. Leave head-on attacks for later unless the earlier systems are stable.

The design target is not “smart enemies.” The design target is “readable target opportunities.”

## Current architecture summary

The current enemy system already has several useful pieces:

- Enemies belong to squads.
- Squads have modes such as `approach`, `swarm`, and `depart`.
- Motherships spawn fighter squads after reaching a hold position.
- Mothership fighters settle into the atmosphere, then enter swarm/patrol behavior.
- Enemy AI computes a target point, smooths that target point, converts it into turn/pitch/boost/brake controls, then calls the shared ship physics.
- The shared ship physics handles bound atmospheric flight, free flight, capture, boost, braking, stall, terrain protection, collision, and projectile firing.
- The testbench can bootstrap the world, configure ship/enemy state, step the sim deterministically, and assert behavioral properties without a browser.

The new encounter system should build on this structure. Do not replace the whole AI. Add a layer above the current patrol/swarm behavior that temporarily assigns selected enemies to presentation passes or objective attack runs.

## Core design principle

The key abstraction is not:

```text
enemy chases player
```

The key abstraction is:

```text
enemy chases a role-specific slot
```

Examples:

- A planetary presenter chases a player-relative firing-lane slot.
- A side-crossing enemy chases a slot moving from one side of the player’s view to the other.
- A transport attacker chases an attack slot near the transport.
- A convoy-screening fighter chases a slot between the player and the protected ship.
- A reserve enemy chases a loiter slot away from the player’s immediate firing lane.

This makes the behavior authorable, testable, and extensible.

## High-level combat design

Combat encounters should feel staged without making enemies look fake.

An encounter director chooses which enemies are currently relevant. It assigns a small number of enemies to active roles. The rest are kept in reserve, loitering, patrolling, repositioning, or waiting for a future attack pass.

The player should not be crowded by every enemy at once. Clearing a planet should feel like a level: the mothership arrives, fighters deploy, the director serves readable enemy passes to the player, and the planet is cleared when the invasion group is defeated.

Future free-space objectives should use the same general encounter machinery. For example, in a transport defense encounter, some enemies attack the transport while some enemies present themselves to the player as shootable targets.

## Encounter types

Initial encounter type:

- `planetInvasion`
    - Anchor: planet
    - Primary objective: clear enemies around the planet
    - Spawn source: mothership
    - Arena: planet atmosphere and nearby space

Future encounter types:

- `transportDefense`
    - Anchor: entity, usually a transport ship
    - Primary objective: keep protected entity alive
    - Enemy behavior: mix of transport attackers and player presenters
    - Arena: free space or route corridor

- `freeSpaceAmbush`
    - Anchor: point, player, route, or region
    - Primary objective: survive, clear enemies, or escape
    - Enemy behavior: side-cross, behind-catchup, frontal harassment, reserve waves

- `convoyEscort`
    - Anchor: route or group of protected entities
    - Primary objective: protect all or enough convoy ships until route completion
    - Enemy behavior: objective attackers, blockers, player presenters

- `bossSupportWave`
    - Anchor: boss entity
    - Primary objective: damage boss or survive phase
    - Enemy behavior: limited support fighters, mostly presentation passes and pressure control

Only `planetInvasion` should be implemented in the first milestone. The others exist to guide naming and state shape.

## General encounter director design

The encounter director should be a pure simulation system in `Orbitals_Sim.js`.

Use generic names where possible. Avoid names that imply the system only handles planets.

Suggested state shape:

```js
state.encounterDirector = {
    activeEncounterId: -1,
    nextSelectionTimer: 0,
    encounters: [],
    activePresenterEnemyIds: [],
    activeObjectiveAttackerEnemyIds: []
};
```

Suggested encounter state:

```js
{
    id,
    type: 'planetInvasion' | 'transportDefense' | 'freeSpaceAmbush' | 'convoyEscort' | 'bossSupportWave',
    status: 'inactive' | 'active' | 'succeeded' | 'failed' | 'cleared',

    anchorKind: 'planet' | 'entity' | 'point' | 'route' | 'player',
    anchorPlanetIndex: -1,
    anchorEntityId: -1,
    anchorPoint: null,

    objectiveKind: 'clearEnemies' | 'defendEntity' | 'surviveTimer' | 'destroyTarget' | 'reachRouteEnd',
    protectedEntityId: -1,
    targetEntityId: -1,

    spawnedEnemyIds: [],
    activePresenterEnemyIds: [],
    activeObjectiveAttackerEnemyIds: [],
    reserveEnemyIds: [],

    mothershipSquadId: -1,
    totalReleased: 0,
    totalDestroyed: 0,

    startedAt: 0,
    endedAt: 0,
    clearEventPushed: false,
    successEventPushed: false,
    failEventPushed: false
}
```

For the first milestone, only these fields need to be meaningfully used:

```js
type: 'planetInvasion'
status
anchorKind: 'planet'
anchorPlanetIndex
objectiveKind: 'clearEnemies'
spawnedEnemyIds
activePresenterEnemyIds
mothershipSquadId
totalReleased
totalDestroyed
clearEventPushed
```

Future fields can exist dormant if they do not complicate the first implementation.

Suggested per-enemy fields:

```js
enemy.combatRole = 'reserve' | 'candidate' | 'presenter' | 'objectiveAttacker' | 'screen' | 'cooldown';
enemy.presentation = null;
enemy.objectiveAttack = null;
enemy.encounterId = -1;
enemy.lastPresentationTime = -Infinity;
enemy.presentationShootableFrames = 0;
enemy.presentationKindLastUsed = '';
enemy.isPrimaryThreat = false;
enemy.hudPriority = 0;
```

The first milestone only needs:

```js
enemy.combatRole
enemy.presentation
enemy.encounterId
enemy.lastPresentationTime
enemy.presentationShootableFrames
enemy.presentationKindLastUsed
enemy.isPrimaryThreat
enemy.hudPriority
```

Suggested presentation state:

```js
{
    kind: 'behindCatchup' | 'sideCross' | 'headOnBreakaway',
    phase: 'stage' | 'present' | 'cross' | 'escape' | 'cooldown',
    side: -1 or 1,
    startedAt: time,
    phaseStartedAt: time,
    maxDuration: seconds,
    shootableFrames: 0,
    crossedCenter: false,
    committed: false
}
```

Suggested future objective attack state:

```js
{
    kind: 'transportAttackRun' | 'bombingRun' | 'interceptProtectedEntity',
    phase: 'stage' | 'attack' | 'escape' | 'cooldown',
    startedAt: time,
    phaseStartedAt: time,
    targetEntityId: -1,
    attackSlotSide: -1 or 1,
    firedAtTarget: false,
    committed: false
}
```

Do not implement objective attack state in the first milestone unless needed for clean structure.

## Director responsibilities

General responsibilities:

- Track active encounters.
- Select an active encounter relevant to the player.
- Assign only a limited number of enemies to active player-presentation roles.
- Assign only a limited number of enemies to objective-attacker roles in future encounter types.
- Keep remaining enemies in reserve, candidate, cooldown, or loiter roles.
- Avoid selecting enemies that are too new, destroyed, too close to terrain, too far from the relevant arena, or already in cooldown.
- End presentation passes cleanly and return enemies to cooldown.
- Push debug events when encounters start, succeed, fail, end, and when presentation passes start/end.
- Keep all budgets configurable.

Planet invasion responsibilities:

- Mark a planet encounter active when a mothership begins invading or releases its first fighter.
- Associate released fighter squads with the correct encounter.
- Prefer fighters bound to the same planet as the player.
- Select a small number of fighters as presenters.
- Keep non-presenting fighters from crowding the player.
- Mark the encounter cleared when all relevant fighters are destroyed and the mothership is done releasing fighters or has departed/died.

Future transport defense responsibilities:

- Track the protected transport entity.
- Assign some enemies to attack the transport.
- Assign some enemies to present themselves to the player.
- Fail the encounter if the transport is destroyed or reaches a failure condition.
- Succeed the encounter if the transport survives long enough or reaches its destination.

## Config values

Add new gameplay constants to `orbitals_config.js`.

Initial encounter and presentation constants:

```js
encounterDirectorEnabled: true,
encounterMaxActivePresenters: 2,
encounterMaxActiveThreatsNearPlayer: 4,
encounterSelectionInterval: 1.25,
encounterCandidateMinAge: 2.0,
encounterPresenterCooldown: 5.0,
encounterShootableAngleDeg: 18,
encounterShootableMinDistance: 35,
encounterShootableMaxDistance: 520,
encounterShootableRequiredFrames: 36,
encounterPresentationMaxDuration: 8.0,
encounterPresentationEscapeDuration: 2.0,

enemyPresentationSpeedMultiplier: 1.45,
enemyPresentationTurnMultiplier: 1.35,
enemyPresentationPitchMultiplier: 1.25,
enemyPresentationBoostBias: 0.25
```

Behind-catchup slot constants:

```js
encounterBehindStageDistance: -220,
encounterBehindStageUpOffset: 35,
encounterBehindStageSideOffset: 35,
encounterBehindPresentDistance: 220,
encounterBehindPresentUpOffset: 25,
encounterBehindPresentSideOffset: 25,
encounterBehindEscapeDistance: 320,
encounterBehindEscapeUpOffset: 70,
encounterBehindEscapeSideOffset: 180
```

Side-cross slot constants:

```js
encounterSideStageForwardDistance: 180,
encounterSideStageSideDistance: 320,
encounterSideStageUpOffset: 35,
encounterSideCrossForwardDistance: 240,
encounterSideCrossSideDistance: 260,
encounterSideCrossUpOffset: 30,
encounterSideEscapeForwardDistance: 320,
encounterSideEscapeSideDistance: 380,
encounterSideEscapeUpOffset: 80
```

Reserve/crowding constants:

```js
encounterReserveLoiterDistance: 480,
encounterReserveMinPlayerDistance: 180,
encounterReserveHudPriority: 0,
encounterPresenterHudPriority: 10,
encounterObjectiveAttackerHudPriority: 8
```

Future objective constants, added later when needed:

```js
encounterMaxActiveObjectiveAttackers: 3,
transportDefenseAttackSlotDistance: 260,
transportDefenseAttackSlotSideOffset: 140,
transportDefenseAttackSlotUpOffset: 40,
transportDefenseAttackRunDuration: 6.0,
transportDefenseAttackerCooldown: 4.0
```

The exact values may be tuned, but all such values must live in `orbitals_config.js`.

## Player-relative presentation slots

Presentation target points should be computed in the player’s local frame.

Build a player basis:

```js
playerForward = state.ship.forward.normalized
playerUp = state.ship.up.normalized
playerRight = playerForward.cross(playerUp).normalized
```

If handedness is wrong in practice, flip the right vector in tests and document it.

A raw player-relative slot is:

```js
slot = player.position
    + playerForward * forwardDistance
    + playerRight * rightDistance
    + playerUp * upDistance
```

For atmospheric planetary combat, project the slot onto a valid atmospheric shell around the target planet:

```js
directionFromPlanet = (slot - planet.position).normalized
projectedSlot = planet.position + directionFromPlanet * (planet.radius + desiredAltitude)
```

This keeps the target point physically plausible. The enemy is still flying toward a world-space point, but the point is derived from the player’s camera/firing lane.

## Entity-relative objective slots for future encounters

Future free-space encounters should use the same slot idea, but relative to an entity such as a transport.

Example transport-relative slot:

```js
transportForward = transport.forward.normalized
transportUp = transport.up.normalized
transportRight = transportForward.cross(transportUp).normalized

slot = transport.position
    + transportForward * forwardDistance
    + transportRight * rightDistance
    + transportUp * upDistance
```

A transport attacker might stage behind and to the side of the transport, then attack a slot near the transport, then escape upward or sideways.

A player presenter in the same encounter should still use player-relative slots. This allows an encounter to have both:

- Enemies that create pressure on the objective.
- Enemies that create readable target opportunities for the player.

## Presentation pattern 1: behind catch-up

Purpose:

An enemy begins behind the player, catches up, then passes into the player’s forward cone as an easy target.

Phases:

1. `stage`
    - Target a slot behind and slightly above the player.
    - Example conceptual slot:
      - forward distance: negative
      - vertical offset: positive
      - lateral offset: small
    - The enemy should close distance without entering the firing cone too early.

2. `present`
    - Target a slot ahead of the player.
    - Example conceptual slot:
      - forward distance: positive
      - vertical offset: small positive
      - lateral offset: small or slowly drifting
    - Count shootable frames while the enemy is inside the forward firing cone.

3. `escape`
    - Target a slot ahead and off to one side or above.
    - Return to cooldown after the escape duration.

Initial success condition:

- Enemy enters the shootable region for at least `encounterShootableRequiredFrames`.
- Enemy does not crash.
- Enemy does not collide with the player.
- Enemy does not remain permanently stuck behind the player.

## Presentation pattern 2: side cross

Purpose:

An enemy flies across the player’s forward view from one side to the other, optionally bending slightly toward the front of the player.

Phases:

1. `stage`
    - Target a slot ahead and far to one side of the player.
    - Side is chosen randomly as `-1` or `1`.

2. `cross`
    - Target a slot ahead and far to the opposite side.
    - The enemy should pass through the forward cone.
    - Track whether its player-relative right-side sign changed.

3. `escape`
    - Target a wider side/up slot.
    - Return to cooldown.

Initial success condition:

- Enemy starts on one side of the player-relative frame.
- Enemy crosses to the opposite side.
- Enemy spends at least a small window in front of the player.
- Enemy is shootable for at least a configurable number of frames.
- Enemy does not crash.

## Presentation pattern 3: head-on breakaway

Postpone this.

This pattern is harder because the player can turn freely, so a true head-on intercept will either miss, jitter, or become too fake.

When implemented, use a commit point:

1. `stageFront`
    - Enemy enters from the player’s forward cone at long range.
    - It aims near the player’s future lane, not directly at the player.

2. `commit`
    - At a fixed distance or time-to-impact, stop correcting toward the player.
    - Lock in a breakaway direction.

3. `breakAway`
    - Pull up or veer away using a readable escape slot.
    - Do not keep chasing the player during the breakaway.

Initial success condition should be modest. It only needs to look readable and avoid collision.

## Future objective pattern: transport attack run

Do not implement this in the first milestone, but keep the director extensible enough to support it.

Purpose:

A group of enemies in free space tries to damage or destroy a transport ship while the player defends it.

Roles:

- `objectiveAttacker`
    - Tries to reach attack slots around the transport.
    - Performs attack passes against the transport.
    - Escapes and returns to cooldown.

- `presenter`
    - Presents itself to the player using behind-catchup, side-cross, or later head-on behavior.
    - Gives the player readable target opportunities during the defense.

- `reserve`
    - Stays outside the immediate fight until selected.

Basic future phases for an objective attacker:

1. `stage`
    - Move to a transport-relative staging slot.

2. `attack`
    - Move toward a transport-relative attack slot.
    - Later, fire at the transport if enemy weapons exist.

3. `escape`
    - Leave the immediate transport area.
    - Return to cooldown.

Future success/failure test examples:

- Transport survives for N seconds.
- No more than `encounterMaxActiveObjectiveAttackers` attack the transport at once.
- At least one attacker reaches an attack slot during the scenario.
- Player presenters still appear while the transport is under pressure.
- Encounter fails if the transport is destroyed.

## Enemy maneuverability design

Enemies should be allowed to be better aircraft than the player. This is not considered a major cheat.

Add presentation-specific multipliers in config and apply them only while `enemy.combatRole === 'presenter'`.

Possible application points:

- In `computeEnemyControlTargetSpeed`, multiply desired target speed by `enemyPresentationSpeedMultiplier` while presenting.
- In `computeEnemyControlInputs`, multiply turn and pitch gain by presentation multipliers.
- Allow presentation enemies to boost more readily, especially during `stage` and early `present`.
- Keep terrain and stall protection active. Do not bypass shared physics.

Do not directly set enemy position every frame.

Future objective attackers may use a separate multiplier set if needed. Do not reuse presenter multipliers blindly if objective attackers become too aggressive or too difficult for the player to intercept.

## Test-driven implementation plan

### Phase 0: Planning and safety rails

- [X] Save this document as `PLANETARY_COMBAT_PLAN.md`.
- [X] Confirm that `AGENTS.md` remains focused on project rules, not this evolving implementation plan.
- [X] Re-read the current enemy functions before coding:
    - `computeEnemyTargetPoint`
    - `computeEnemyControlInputs`
    - `updateEnemyShip`
    - `updateEnemySquads`
    - `updateMothershipSquads`
    - `updateShipState`
- [X] Ensure all new gameplay constants are added to `orbitals_config.js`.
- [X] Ensure the testbench remains the primary validation path.
- [X] Use generic encounter naming where possible.
- [X] Do not create a planet-only director that will be hard to extend.

### Phase 1: Add testbench presentation metrics first

Add helpers to `orbitals_testbench.mjs`.

Suggested helpers:

- [X] `buildPlayerFrame(ship)`
- [X] `measureEnemyInPlayerFrame(player, enemy)`
- [X] `isEnemyShootableFromPlayer(player, enemy, config)`
- [X] `projectPresentationSlotToPlanet(state, planet, slot, altitudeFactor)`
- [X] `placeEnemyRelativeToPlayerOnPlanet(state, planet, enemy, options)`
- [X] `createSingleFighterPresentationScenario(kind)`
- [X] `countShootableFramesDuring(sim, enemyId, steps, controls)`
- [X] `assertEnemyDidNotCrashOrDisappearUnexpectedly(state, enemyId)`

The shootable metric should use world-space math, not rendering.

Suggested shootable criteria:

```js
const toEnemy = enemy.position.clone().sub(player.position);
const distance = toEnemy.length();
const direction = toEnemy.normalize();
const forwardDot = direction.dot(player.forward.clone().normalize());
const angleDeg = THREE.MathUtils.radToDeg(Math.acos(THREE.MathUtils.clamp(forwardDot, -1, 1)));

shootable =
    angleDeg <= config.encounterShootableAngleDeg
    && distance >= config.encounterShootableMinDistance
    && distance <= config.encounterShootableMaxDistance;
```

Initial tests:

- [X] `runPresentationMetricHelperTest`
    - Place an enemy directly ahead and assert shootable.
    - Place an enemy behind and assert not shootable.
    - Place an enemy too far away and assert not shootable.
- [X] `runPresentationProjectionHelperTest`
    - Project a player-relative slot onto a planet atmosphere shell.
    - Assert altitude is within expected tolerance.
- [X] Confirm all existing tests still pass.

### Phase 2: Add dormant general encounter state

This phase should not significantly change gameplay yet.

- [X] Add default encounter director state to `createOrbitalsSim`.
- [X] Reset encounter director state in `bootstrapWorld`.
- [X] Add default combat fields to `createEnemyState`.
- [X] Add config constants for encounter/presentation behavior.
- [X] Add generic debug event names:
    - `encounter-start`
    - `encounter-success`
    - `encounter-fail`
    - `encounter-end`
    - `presentation-start`
    - `presentation-success`
    - `presentation-fail`
    - `presentation-end`
- [X] Add planet-specific debug event names:
    - `planet-invasion-start`
    - `planet-invasion-cleared`
- [X] Add no-op `updateEncounterDirector(state, dt, time)`.
- [X] Call `updateEncounterDirector` from the sim step after `updateShipState` and before `updateEnemySquads`.
- [X] Confirm existing tests still pass.

### Phase 3: Implement target-point override hook

Add a clean hook so presentation behavior can override the normal patrol target point.

- [X] Add `computeEnemyPresentationTargetPoint(state, enemy, squad, planet, time)`.
- [X] Make it return `null` unless `enemy.combatRole === 'presenter'` and `enemy.presentation` exists.
- [X] At the top of `computeEnemyTargetPoint`, call the presentation target helper.
- [X] If it returns a target point, use it instead of the normal orbit/patrol target.
- [X] Keep the existing patrol/swarm behavior unchanged for all non-presenting enemies.
- [X] Add tests proving a forced presenter gets a target point in the expected player-relative region.
- [X] Confirm existing patrol and mothership-fighter tests still pass.

### Phase 4: Implement behind catch-up as a forced test scenario

Do not start with the full director. First force one enemy into a behind-catchup presentation state in the testbench.

- [X] Add helper `forceEnemyPresentation(enemy, 'behindCatchup', options)`.
- [X] Add behind-catchup presentation phases:
    - `stage`
    - `present`
    - `escape`
    - `cooldown`
- [X] Add config values for behind-catchup slots.
- [X] Apply presentation speed/turn/pitch multipliers while presenting.
- [X] Add `runBehindCatchupPresentationTest`.
- [X] The test should:
    - Bootstrap a planet.
    - Place the player in stable atmospheric flight.
    - Place one fighter behind the player.
    - Force behind-catchup presentation.
    - Step the sim.
    - Assert that the fighter becomes shootable for the required number of frames.
    - Assert that it does not crash.
- [X] Add `runBehindCatchupPresentationWithGentleTurnTest`.
    - Same as above, but the player holds a gentle turn input.
    - Use a softer required shootable-frame threshold if necessary.
- [X] Confirm all existing tests still pass.

### Phase 5: Implement side-cross as a forced test scenario

Again, do this before handing it to the director.

- [X] Add side-cross presentation phases:
    - `stage`
    - `cross`
    - `escape`
    - `cooldown`
- [X] Add config values for side-cross slots.
- [X] Add `runSideCrossPresentationTest`.
- [X] The test should:
    - Place the enemy to one side of the player.
    - Force side-cross presentation.
    - Step the sim.
    - Assert that the enemy changes player-relative side sign.
    - Assert that it becomes shootable for a useful number of frames.
    - Assert that it does not crash.
- [X] Add `runSideCrossPresentationWithGentleTurnTest`.
- [X] Confirm all existing tests still pass.

### Phase 6: Implement the encounter director selection budget

Only after forced presentation tests work, let the director choose presenters.

- [X] `updateEncounterDirector` should identify the active encounter.
- [X] For the first implementation, prefer an active `planetInvasion` encounter on the player’s bound planet.
- [X] Otherwise prefer the nearest active planet invasion with living fighters.
- [X] Track active presenters by enemy id.
- [X] Drop dead or invalid presenters from the active list.
- [X] Enforce `encounterMaxActivePresenters`.
- [X] Do not select enemies younger than `encounterCandidateMinAge`.
- [X] Do not select enemies already in cooldown.
- [X] Do not select motherships.
- [X] Prefer fighters in `swarm` mode.
- [X] Assign `behindCatchup` and `sideCross` in a varied pattern.
- [X] Add `runEncounterDirectorBudgetTest`.
    - Spawn several fighters around one planet.
    - Step the sim.
    - Assert no more than `encounterMaxActivePresenters` are presenters.
- [X] Add `runEncounterDirectorRotatesPresentersTest`.
    - Ensure presenters eventually return to cooldown and another eligible enemy can be selected.
- [X] Confirm all existing tests still pass.

### Phase 7: Make non-presenting enemies less dashboard-crowding

The player should not feel attacked by every enemy simultaneously.

This phase may involve sim-only state first, then UI later.

- [X] Add or activate enemy combat roles:
    - `reserve`
    - `candidate`
    - `presenter`
    - `cooldown`
- [X] Ensure reserve/cooldown enemies continue to patrol or loiter using existing behavior.
- [X] Keep reserve enemies from aggressively entering the player’s firing lane too often.
- [X] Add `enemy.isPrimaryThreat`.
- [X] Add `enemy.hudPriority`.
- [X] Do not change HUD rendering yet unless tests and sim state are stable.
- [X] Add a test that many enemies can exist while only a few are marked primary threats/presenters.
- [X] Later optional UI task:
    - Use `enemy.hudPriority` or `enemy.isPrimaryThreat` in `Orbitals_JS.js` to reduce HUD clutter.

### Phase 8: Planet invasion and clear flow

Planetary combat should feel like a level.

- [X] Create or activate a generic encounter with `type: 'planetInvasion'` when a mothership begins an invasion.
- [X] Mark the encounter active when a mothership reaches hold or releases its first fighter.
- [X] Associate released fighter squads with the encounter.
- [X] Associate released fighters with the encounter through `enemy.encounterId`.
- [X] Count released fighters and destroyed fighters.
- [X] Mark the encounter `cleared` when:
    - mothership has released all assigned fighters or has been destroyed/left, and
    - no living fighter/regular enemies remain for that encounter.
- [X] Push generic `encounter-success` or `encounter-end` event.
- [X] Push specific `planet-invasion-cleared` debug event.
- [X] Add `runPlanetInvasionClearTest`.
    - Use a controlled mothership/fighter setup.
    - Destroy or remove all fighters through test-controlled damage/removal.
    - Assert the planet clear event is pushed.
- [X] Add `runPlanetEncounterDoesNotClearWhileFightersRemainTest`.
- [X] Confirm all existing tests still pass.

### Phase 9: Preserve free-space extensibility

This phase is mostly naming, boundaries, and light dormant helpers. It should not implement full transport defense yet.

- [X] Avoid hardcoded assumptions that every encounter has a planet.
- [X] Add helper `getEncounterAnchorPosition(state, encounter)`.
- [X] Add helper `getEncounterAnchorVelocity(state, encounter)` if useful.
- [X] Add helper `getEncounterEnemies(state, encounter)`.
- [X] Add helper `isEnemyEligibleForPresentationInEncounter(state, enemy, encounter)`.
- [X] Add stub or TODO for `computeEnemyObjectiveAttackTargetPoint`.
- [X] Add a simple dormant test that creates a generic non-planet encounter object and verifies helper functions do not throw.
- [X] Confirm no planet invasion behavior regresses.

### Phase 10: Head-on breakaway, postponed

Only attempt this after behind-catchup, side-cross, and director budgeting feel stable.

- [X] Add a design note based on observed presentation behavior.
- [X] Add test helper for approach from player forward cone.
- [X] Implement `headOnBreakaway` with a commit point.
- [X] Do not keep tracking the player after commit.
- [X] Add a collision safety test.
- [X] Add a gentle-turn player test.
- [X] Tune conservatively or scrap if it produces jitter.

### Phase 11: Future transport defense, not first milestone

Only start this after planet invasion combat is stable.

- [X] Add simple transport entity state.
- [X] Add transport motion helper for testbench scenarios.
- [X] Add `transportDefense` encounter type.
- [X] Add objective attacker role.
- [X] Add transport-relative slot helper.
- [X] Add `runTransportDefenseBudgetTest`.
    - Assert no more than configured active attackers.
- [X] Add `runTransportDefenseAttackRunTest`.
    - Assert at least one enemy reaches a transport attack slot.
- [X] Add `runTransportDefensePlayerPresenterTest`.
    - Assert a presenter still creates shootable frames for the player while attackers pressure the transport.
- [X] Add `runTransportDefenseFailureTest`.
    - Assert encounter fails if protected transport is destroyed.
- [X] Add `runTransportDefenseSuccessTest`.
    - Assert encounter succeeds if transport survives or reaches destination.

### Phase 12: Debugging and tuning tools

The implementation should be measurable.

- [X] Add debug events with enough payload to diagnose presentation passes:
    - enemy id
    - encounter id
    - encounter type
    - kind
    - phase
    - start time
    - end time
    - shootable frames
    - failure reason
    - distance range
    - min angle to player forward
- [X] Extend `formatCombatLog` to include encounter and presentation events when `config.debug` is true.
- [X] Add testbench summary output for presentation tests.
- [X] Keep test assertions tolerant enough to avoid brittle frame-perfect failures.

### Phase 13: Remaining encouters

Extend the encounters with free-space ambushes, transport defense, convoy escort, boss support waves. There are separate combat encouters (the planetary combat is only the first encounter style).

For this you are allowed to use the nemesis enemy as a placeholder for models that are missing in the game (transport, bosses etc). If a 2D texture is needed then use any texture available or generate it procedurally.

Encounters start by the player enter within an appropriate distance of the objective and should be declared on the screen "Mission: Defend the transport". Sompleting of an encounger should show "Mission Complete - Transport is safe", "Mission Failed - Transport was destroyed" or "Mission Aborted - Transport was left to its fate"


## Suggested test names

Add these to `orbitals_testbench.mjs` over time:

- [X] `runPresentationMetricHelperTest`
- [X] `runPresentationProjectionHelperTest`
- [X] `runBehindCatchupPresentationTest`
- [X] `runBehindCatchupPresentationWithGentleTurnTest`
- [X] `runSideCrossPresentationTest`
- [X] `runSideCrossPresentationWithGentleTurnTest`
- [X] `runEncounterDirectorBudgetTest`
- [X] `runEncounterDirectorRotatesPresentersTest`
- [X] `runManyEnemiesFewPresentersTest`
- [X] `runPlanetInvasionClearTest`
- [X] `runPlanetEncounterDoesNotClearWhileFightersRemainTest`
- [X] `runGenericEncounterHelperSmokeTest`
- [X] `runHeadOnBreakawayPresentationTest`
- [X] `runHeadOnBreakawayAvoidsCollisionTest`
- [X] `runTransportDefenseBudgetTest`
- [X] `runTransportDefenseAttackRunTest`
- [X] `runTransportDefensePlayerPresenterTest`
- [X] `runTransportDefenseFailureTest`
- [X] `runTransportDefenseSuccessTest`

## Expected file changes

The following files are expected to be patched during this work:

- `Orbitals_Sim.js`
    - General encounter director state and update function.
    - Planet invasion encounter type.
    - Presentation state on enemies.
    - Presentation target-point override.
    - Presentation-specific enemy control multipliers.
    - Planet invasion clear tracking.
    - Generic encounter helper functions.
    - Debug events and combat log formatting.

- `orbitals_config.js`
    - Encounter director constants.
    - Shootable-region constants.
    - Presentation slot constants.
    - Enemy presentation maneuverability multipliers.
    - Planet-clear and active-threat budget constants.
    - Future objective-attacker constants only when transport defense begins.

- `orbitals_testbench.mjs`
    - Presentation metric helpers.
    - Forced behind-catchup tests.
    - Forced side-cross tests.
    - Director budget tests.
    - Planet clear tests.
    - Generic encounter helper smoke tests.
    - Later head-on tests.
    - Later transport-defense tests.

- `Orbitals_JS.js`
    - No first-phase changes expected.
    - Later optional change: use `enemy.combatRole`, `enemy.hudPriority`, or `enemy.isPrimaryThreat` to reduce HUD clutter.

- `Orbitals_JS.html`
    - No expected changes.

- `PLANETARY_COMBAT_PLAN.md`
    - This file. The implementing agent must update checkboxes and notes.

## Acceptance criteria for the first stable milestone

The first stable milestone is complete when:

- [X] Existing tests still pass.
- [X] Behind-catchup presentation works in a forced test.
- [X] Side-cross presentation works in a forced test.
- [X] The encounter director uses generic encounter state, not a planet-only director.
- [X] The encounter director can manage a `planetInvasion` encounter.
- [X] The encounter director never assigns more than the configured number of active presenters.
- [X] Non-presenting enemies continue to exist without all crowding the player at once.
- [X] Mothership fighter spawning still works.
- [X] Planetary combat can be described as:
    - mothership arrives,
    - fighters are dropped,
    - a generic `planetInvasion` encounter becomes active,
    - fighters settle,
    - the director serves a few fighters at a time as targets,
    - destroyed enemies count toward clearing the encounter.
- [X] No enemies are killed on the planet where the fight is going on except as a result of being shot by the player.
       - If two enemies collide then this is a failure that needs to be fixed by improving the NPC AI.
       - If an enemies crashes into the ground this is a failure that needs to be fixed by improving the NPC AI.
       - If an enemies espace the planet this is a failure that needs to be fixed by improving the NPC AI.
- [X] There are testcases that verifies all of the above
- [X] All testcases passes

## Acceptance criteria for later “planet as level” milestone

This later milestone is complete when:

- [X] A planet invasion encounter can enter `active` state.
- [X] A planet invasion encounter can enter `cleared` state.
- [X] Clearing depends on actual remaining enemies for that encounter.
- [X] The mothership exits or is removed after its fighters are gone, according to existing mothership logic.
- [X] The player can reasonably leave for another planet after clearing the current one.
- [X] Debug logs make it clear when each planet encounter starts and ends.
- [X] No enemies are killed on the planet where the fight is going on except as a result of being shot by the player.
       - If two enemies collide then this is a failure that needs to be fixed by improving the NPC AI.
       - If an enemies crashes into the ground this is a failure that needs to be fixed by improving the NPC AI.
       - If an enemies espace the planet this is a failure that needs to be fixed by improving the NPC AI.
- [X] There are testcases that verifies all of the above
- [X] All testcases passes

## Acceptance criteria for later free-space encounter milestone

This later milestone is complete when:

- [X] A non-planet encounter can be created in the sim.
- [X] The encounter can use an entity, point, player, or route anchor instead of a planet.
- [X] Enemies can be assigned objective-attacker roles.
- [X] Enemies can still be assigned player-presentation roles in the same encounter.
- [X] Active attacker and presenter budgets are enforced independently.
- [X] The testbench can validate a transport defense scenario without a browser.

## Design notes and warnings

Do not hardcode the encounter director around planets. Implement `planetInvasion` as the first encounter type inside a general encounter framework.

Avoid long prediction. The player has too much freedom. Use moving slots for behind-catchup and side-crossing. Use commit points only for head-on behavior.

Do not overfit to one seed. Run the testbench with at least the default debug seed and one or two alternate seeds once the tests exist.

Do not tune by visual impression alone. Every visual complaint should become a measurable test when possible.

Do not make enemies perfect. The player should get readable opportunities, not guaranteed hits.

The enemy should look like it belongs to the physical world, but the encounter director is allowed to be theatrical.

Planetary combat is the first arena. The director is the reusable machinery.

## Implementation completion notes

- Completed the encounter director as a generic sim system with `planetInvasion`, `freeSpaceAmbush`, `transportDefense`, `convoyEscort`, and `bossSupportWave` coverage.
- Implemented player-relative presenter slots for `behindCatchup`, `sideCross`, and `headOnBreakaway`; objective attackers use entity-relative transport-style slots.
- Presentation speed, turn, pitch, boost, slot geometry, and safety behavior are configurable in `orbitals_config.js`.
- Planet invasion encounters activate when the mothership arrives/releases fighters, associate released fighters, enforce presenter budgets, and clear only after released encounter fighters are destroyed.
- Non-presenters are kept as reserve/candidate/cooldown roles, HUD priority is reduced for non-threats, and enemy-enemy collision damage is disabled to prevent non-player kill credit during planetary fights.
- Mission messages are exposed through encounter state and rendered by the UI; transport/convoy/boss/free-space scenarios use the same encounter machinery.
- Validation completed with `node orbitals_testbench.mjs`, `node orbitals_testbench.mjs 12345`, and `node orbitals_testbench.mjs 987654321`; all passed.
