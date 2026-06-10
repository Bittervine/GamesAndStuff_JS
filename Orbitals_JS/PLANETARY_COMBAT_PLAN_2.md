# Orbitals JS Close-Range Planetary Swarm, Power-Up, and Weapon Upgrade Plan

This document replaces and extends `PLANETARY_COMBAT_PLAN.md`.

The previous encounter-director work built useful machinery, but the feel is not yet right. Enemies are presented too far away, the sky is too sparse, and planetary combat does not yet have the arcade pressure/reward loop needed for a dense shoot-em-up.

The new target is:

- A planet invasion should look busy, alive, and dangerous.
- Fighters should often be close enough that they appear roughly 1/3 to 1/5 of the apparent size of the player ship.
- A planet should contain many more enemies, roughly 10x the current mothership fighter population as a starting point.
- Most enemies should not all be active player-facing attackers, but the sky should be visibly crowded.
- Enemies should move rapidly and avoid collisions rather than sitting in distant lanes.
- Destroyed enemies should drop useful power-ups.
- Power-ups should include shield, rapid fire, and weapon upgrades.
- Weapon upgrades should be inspired by ThoriumGap's DART, TWIN, FAN, ROCKET, and BEAM weapon families, adapted to Orbitals' 3D flight model.
- The implementation must remain test-driven.

## Project rules

- Keep game logic and behavior in `Orbitals_Sim.js`.
- Keep rendering and UI behavior in `Orbitals_JS.js` and `Orbitals_JS.html`.
- Keep gameplay constants in `orbitals_config.js`.
- Do not add new gameplay magic numbers directly to `Orbitals_Sim.js`.
- Maintain and expand `orbitals_testbench.mjs`.
- Do not use Playwright unless explicitly authorized.
- Use the testbench as the primary validation path.
- Preserve the existing mothership arrival/drop fantasy unless tests justify a controlled refactor.
- Prefer physics-respecting behavior.
- Do not teleport visible enemies.
- Off-screen spawning, hidden pool refill, and off-camera regrouping may be used only when covered by tests and debug events.
- Keep the encounter director general enough to support later free-space encounters.

## Important correction to the old design

The old plan tried to reduce crowding by showing only a few enemies at once.

That is no longer the desired feel.

The new design separates two ideas:

```text
visual crowd density
```

from:

```text
active threat/presenter budget
```

A planet can have 100 to 150 fighters in the atmosphere, but only a subset should be in the player's immediate firing lane or collision-danger zone at the same time.

The sky should be crowded. The player should not be mathematically suffocated.

## Definitions

### Visible swarm

Enemies that exist physically in the planet arena and are visible as background action.

They should:

- fly fast,
- avoid terrain,
- avoid other enemies,
- avoid the player,
- create motion in the sky,
- sometimes cross the player's view,
- not all become active attackers at once.

### Close presenter

An enemy selected by the encounter director to become a readable target opportunity near the player.

It should:

- enter the player's forward view close enough to look large,
- remain shootable briefly,
- not ram the player,
- escape or return to swarm/cooldown.

### Immediate danger bubble

A spherical or player-frame region around the player where too many enemies would cause chaos or collisions.

This should be controlled by budget and steering, not by deleting enemies.

### Apparent size ratio

A testbench approximation for how large an enemy appears compared with the player ship.

Since the headless testbench does not render the camera, use a geometric approximation:

```js
enemyAngularSize = enemy.visualScaleOrRadius / distanceFromPlayerOrCamera;
playerAngularSize = playerReferenceVisualSize / cameraShipDistance;
apparentRatio = enemyAngularSize / playerAngularSize;
```

The target range is:

```text
0.20 <= apparentRatio <= 0.33
```

This corresponds to the enemy appearing between 1/5 and 1/3 of the player ship's apparent size.

The exact formula may be adjusted after comparing testbench values to browser screenshots, but the test must exist before tuning the distances.

## ThoriumGap weapon reference

ThoriumGap has these weapon families:

- DART
    - Direct forward shots.
    - Higher tiers add extra center and angled side darts.
    - Tier V adds a stronger/piercing center shot.

- TWIN
    - Two side-by-side forward streams.
    - Higher tiers add center and wider side shots.

- FAN
    - A spread weapon.
    - Higher tiers increase spread and shot count.

- ROCKET
    - Slower heavier shots.
    - Uses multiple missiles at higher tiers.
    - Has homing behavior.

- BEAM
    - Fast piercing beam-like shots.
    - Higher tiers increase beam count and piercing power.

ThoriumGap also has:

- shield pickups, capped at 3 shields,
- rapid-fire pickups,
- weapon pickups,
- per-weapon tiers,
- same-family pickup upgrades,
- different-family pickup switches weapon family,
- overflow behavior when already capped.

Orbitals should mirror the spirit, not the 2D coordinates.

## New player combat state

Add these fields to `createShipState()` for the player ship:

```js
ship.shields = 0;
ship.maxShields = config.playerShieldMax;
ship.rapidFireTimer = 0;
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

Only the player needs these fields at first.

If enemy weapons are added later, create separate enemy weapon state rather than reusing the player upgrade rules blindly.

## New pickup state

Add simulation-level pickup state:

```js
state.pickups = [];
state.nextPickupId = 1;
```

Pickup shape:

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
    collected,
    visual
}
```

Power-ups dropped in atmosphere should drift on a valid atmospheric shell instead of falling through terrain or flying into deep space.

## New config values

Add all of these to `orbitals_config.js`.

Suggested first tuning values:

```js
// Dense planetary invasions
mothershipFighterCountMin: 100,
mothershipFighterCountMax: 150,
mothershipFighterReleaseInterval: 0.45,
mothershipFighterBurstSizeMin: 3,
mothershipFighterBurstSizeMax: 7,
mothershipFighterMaxAlivePerMothership: 150,

// Close-range presentation
encounterClosePresentationEnabled: true,
encounterTargetApparentSizeMin: 0.20,
encounterTargetApparentSizeMax: 0.33,
encounterCloseShootableMinDistance: 10,
encounterCloseShootableMaxDistance: 180,
encounterCloseSafetyDistance: 12,
encounterCloseCollisionAvoidDistance: 24,
encounterClosePresentationMaxDuration: 5.5,
encounterClosePresenterCooldown: 2.5,

// Replace the old far-away slots with close slots
encounterBehindStageDistance: -70,
encounterBehindStageUpOffset: 12,
encounterBehindStageSideOffset: 16,
encounterBehindPresentDistance: 55,
encounterBehindPresentUpOffset: 8,
encounterBehindPresentSideOffset: 10,
encounterBehindEscapeDistance: 95,
encounterBehindEscapeUpOffset: 28,
encounterBehindEscapeSideOffset: 70,

encounterSideStageForwardDistance: 45,
encounterSideStageSideDistance: 90,
encounterSideStageUpOffset: 12,
encounterSideCrossForwardDistance: 65,
encounterSideCrossSideDistance: 85,
encounterSideCrossUpOffset: 10,
encounterSideEscapeForwardDistance: 105,
encounterSideEscapeSideDistance: 120,
encounterSideEscapeUpOffset: 32,

// Swarm density and avoidance
planetSwarmEnabled: true,
planetSwarmDesiredVisibleCountMin: 80,
planetSwarmDesiredVisibleCountMax: 150,
planetSwarmMaxImmediateThreats: 8,
planetSwarmMaxClosePresenters: 4,
planetSwarmMaxEnemiesInDangerBubble: 10,
planetSwarmDangerBubbleRadius: 120,
planetSwarmSoftAvoidRadius: 55,
planetSwarmHardAvoidRadius: 18,
planetSwarmAvoidPlayerWeight: 1.0,
planetSwarmAvoidEnemyWeight: 0.75,
planetSwarmAvoidTerrainWeight: 1.5,
planetSwarmLaneNoiseStrength: 0.25,
planetSwarmLaneChangeIntervalMin: 0.8,
planetSwarmLaneChangeIntervalMax: 2.4,
planetSwarmAltitudeBandMinFactor: 0.25,
planetSwarmAltitudeBandMaxFactor: 0.85,

// Fast enemy motion
enemySwarmSpeedMultiplier: 1.85,
enemySwarmTurnMultiplier: 1.45,
enemySwarmPitchMultiplier: 1.35,
enemySwarmBoostBias: 0.18,

// Performance budgets
enemyUpdateBudgetMaxPerFrame: 180,
enemyAvoidanceNeighborLimit: 8,
enemySpatialHashCellSize: 70,

// Pickup drops
pickupEnabled: true,
pickupDropChanceEnemy: 0.16,
pickupDropChancePresenter: 0.24,
pickupDropChanceMothership: 1.0,
pickupLifetime: 18.0,
pickupRadius: 3.2,
pickupMagnetRadius: 55,
pickupMagnetAcceleration: 45,
pickupDriftSpeed: 8,
pickupAtmosphereAltitudeFactor: 0.55,

// Pickup type weights
pickupShieldWeight: 4,
pickupRapidWeight: 3,
pickupWeaponWeight: 5,

// Shields
playerShieldMax: 3,
playerShieldInvulnerabilitySeconds: 1.0,
playerShieldCollisionConsumesShield: true,
playerShieldProjectileConsumesShield: true,
playerShieldOverflowScore: 250,

// Rapid fire
playerRapidFireDuration: 8.0,
playerRapidFireCooldownMultiplier: 0.50,

// Weapon system
playerWeaponModes: ['dart', 'twin', 'fan', 'rocket', 'beam'],
playerWeaponTierMax: 5,
playerWeaponPickupOverflowScore: 250,
playerWeaponBaseCooldownDart: 0.16,
playerWeaponBaseCooldownTwin: 0.17,
playerWeaponBaseCooldownFan: 0.17,
playerWeaponBaseCooldownRocket: 0.27,
playerWeaponBaseCooldownBeam: 0.18,
playerWeaponTierCooldownBonus: 0.012,
playerWeaponMinCooldown: 0.05,
playerWeaponMaxCooldown: 0.42,
playerWeaponDamageBase: 15,
playerWeaponDamageTierScale: 0.35,
playerWeaponDartSpeed: 125,
playerWeaponTwinSpeed: 125,
playerWeaponFanSpeed: 120,
playerWeaponRocketSpeed: 90,
playerWeaponBeamSpeed: 170,
playerWeaponRocketHomingStrength: 1.0,
playerWeaponBeamPierceBase: 2
```

The exact numbers must be tuned by tests and browser feel. The important part is that the constants live in config.

## Inherited unfinished work from the old plan

These items were checked off too early or only partially implemented. Carry them forward.

### Config cleanup

- [ ] Move gameplay-affecting constants from `Orbitals_Sim.js` into `orbitals_config.js`.
- [ ] Move projectile homing constants into `orbitals_config.js`.
- [ ] Move enemy base speed/turn/up ranges into `orbitals_config.js`.
- [ ] Move enemy AI smoothing/wander constants into `orbitals_config.js`.
- [ ] Move enemy hit radius and explosion constants into `orbitals_config.js`.
- [ ] Add a test or static guard that fails if newly introduced gameplay constants appear in `Orbitals_Sim.js`.

### Route anchor support

- [ ] Implement `anchorKind: 'route'`.
- [ ] Add route state:
    - route points,
    - progress,
    - route radius,
    - current segment index.
- [ ] Update `getEncounterAnchorPosition` for route anchors.
- [ ] Update `getEncounterAnchorVelocity` for route anchors.
- [ ] Add route-anchor smoke tests.

### Active threat budget

- [ ] Actually enforce `encounterMaxActiveThreatsNearPlayer`.
- [ ] Define what counts as an active threat:
    - presenter,
    - objective attacker near player,
    - reserve enemy inside danger bubble and in front of player,
    - any enemy on collision course with player.
- [ ] Add `countActiveThreatsNearPlayer(state)` helper.
- [ ] Add test proving the director respects the configured threat budget.

### Head-on breakaway polish

- [ ] Add the missing head-on gentle-turn test.
- [ ] Ensure head-on stops correcting toward the player at commit, not only after breakaway begins.
- [ ] Store a locked commit vector/point.
- [ ] Test that the locked point remains stable while the player turns.

### Transport defense reality check

- [ ] Make transport attackers able to damage the protected entity.
- [ ] Add a configurable attack range and attack cooldown.
- [ ] Add test proving attackers can reduce transport health.
- [ ] Add test proving player presenters in transport defense generate shootable frames, not merely `presentation-start` events.
- [ ] Add test proving transport defense can be lost without manually damaging the transport through a test helper.

### Planet clear proof

- [ ] Add long-running natural planet-invasion test.
- [ ] Verify no fighters die from terrain crash during normal invasion.
- [ ] Verify no fighters escape the planet unintentionally during normal invasion.
- [ ] Verify no enemy-enemy collision damage occurs.
- [ ] Verify clearing depends on player projectile kills or explicit test helper kills only.
- [ ] Verify the player can leave after clear.

### Testbench dependency

- [ ] Ensure the uploaded/testable repo includes `lib/three.module.js` or update imports so the testbench can run in the provided bundle.
- [ ] Add a bootstrap test that fails clearly if Three cannot be loaded.

## Phase 1: Apparent-size metric and close-range tests

Before changing behavior, add measurement helpers.

Add to `orbitals_testbench.mjs`:

```js
estimateApparentSizeRatio(state, enemy)
isEnemyCloseReadableFromPlayer(state, enemy, cfg)
countCloseReadableFramesDuring(sim, enemyId, steps, controls)
```

`estimateApparentSizeRatio` should approximate how large the enemy appears relative to the player ship. Use player camera distance from config as the player reference.

Tests:

- [ ] `runApparentSizeMetricTest`
    - Place enemy at a distance that should be too small.
    - Place enemy at a distance that should be in the 1/3 to 1/5 range.
    - Place enemy at a distance that should be too far.
    - Assert the metric classifies all three cases correctly.

- [ ] `runCloseShootableMetricTest`
    - Place enemy close and in front.
    - Assert it is close-readable and shootable.
    - Place enemy at the old far presentation distance.
    - Assert it is shootable but not close-readable.

Acceptance:

- [ ] The testbench can measure closeness without a browser.
- [ ] The old far-away presentation distances fail the close-readability target.
- [ ] No production behavior is changed yet.

## Phase 2: Retune presentation slots for close passes

Modify behind-catchup, side-cross, and head-on slots to use close-range config values.

Do not solve density yet. First make one fighter pass close.

Tasks:

- [ ] Retune behind-catchup to present in the close-readable apparent-size band.
- [ ] Retune side-cross to present in the close-readable apparent-size band.
- [ ] Retune head-on breakaway to avoid ramming at close range.
- [ ] Add close-range safety constraints:
    - never target inside `encounterCloseSafetyDistance`,
    - escape if distance drops below safety distance,
    - add extra side/up escape offset if collision risk is detected.
- [ ] Add debug event fields:
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

- [ ] Each pattern produces at least the configured close-readable frames.
- [ ] No pattern collides with the player.
- [ ] No pattern causes terrain crash.
- [ ] Debug events record close-readability metrics.

## Phase 3: Dense mothership fighter release

Increase fighter population without instantly choking performance.

The current release model creates one fighter squad at a time. Replace or extend it with burst release.

Tasks:

- [ ] Add burst release config:
    - `mothershipFighterBurstSizeMin`
    - `mothershipFighterBurstSizeMax`
    - `mothershipFighterMaxAlivePerMothership`
- [ ] Modify `spawnFighterSquadFromMothership` or add `spawnFighterBurstFromMothership`.
- [ ] A burst should create several fighters around the mothership using a ring or fan pattern.
- [ ] Each fighter must get:
    - unique ID,
    - correct squad ID or sub-squad ID,
    - correct `encounterId`,
    - correct `parentMothershipId`,
    - correct planet target,
    - correct event log.
- [ ] Ensure `encounter.totalReleased` counts every fighter, not only every squad.
- [ ] Ensure `fightersAlive` counts actual alive fighters, not just active fighter squads.
- [ ] Keep mothership exit logic correct when many fighters are alive.

Tests:

- [ ] `runMothershipFighterBurstReleaseTest`
    - Force mothership hold.
    - Step until one release.
    - Assert burst size is within config.
    - Assert all fighters have encounter IDs.

- [ ] `runDenseMothershipReleaseCountTest`
    - Force full release.
    - Assert total released reaches configured 100 to 150 range.
    - Assert `totalReleased` matches actual spawned fighters.

- [ ] `runDenseMothershipExitAfterClearTest`
    - Kill all spawned fighters through test helper.
    - Assert mothership exits/removes itself correctly.

Acceptance:

- [ ] 100 to 150 fighters can be spawned for one planet invasion.
- [ ] Encounter accounting remains correct.
- [ ] Mothership logic still exits after fighters are gone.

## Phase 4: Planetary swarm roles

Add a new role layer for dense atmospheric traffic.

Roles:

```js
enemy.combatRole =
    'swarm'
    | 'reserve'
    | 'candidate'
    | 'presenter'
    | 'objectiveAttacker'
    | 'cooldown';
```

For planet invasion, most non-presenting fighters should be `swarm`, not passive reserve.

Swarm behavior:

- Maintain altitude band around the planet.
- Move tangentially around the planet.
- Use lane noise so paths are not identical.
- Avoid terrain.
- Avoid player danger bubble.
- Avoid nearby enemies.
- Occasionally cross the player's distant view.
- Yield to presenters.
- Yield to power-up pickup paths.

Tasks:

- [ ] Add `computeEnemySwarmTargetPoint(state, enemy, squad, planet, time)`.
- [ ] Add per-enemy swarm fields:
    - `swarmLaneSide`
    - `swarmLaneAltitudeFactor`
    - `swarmLaneTimer`
    - `swarmAvoidanceVector`
    - `swarmLocalSeed`
- [ ] Assign new fighters to `swarm` after settle.
- [ ] Keep existing patrol mode as fallback or remove it after tests pass.
- [ ] Ensure swarm target points are projected to the valid atmospheric shell.
- [ ] Keep terrain protection active.
- [ ] Avoid using per-frame all-pairs checks for every enemy.

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
- [ ] Swarm enemies remain within a valid altitude band.
- [ ] Swarm enemies stay out of the immediate player danger bubble unless selected as presenters.

## Phase 5: Spatial partition for many enemies

A dense swarm needs efficient neighbor queries.

Add a lightweight spatial hash in simulation logic.

State:

```js
state.enemySpatialHash = {
    cellSize,
    cells: new Map()
};
```

Tasks:

- [ ] Rebuild the spatial hash once per sim step before enemy updates.
- [ ] Add helper:
    - `getNearbyEnemies(state, enemy, radius, limit)`
- [ ] Use it for enemy avoidance.
- [ ] Use it for active-threat counting.
- [ ] Use it for projectile collision broad-phase if needed.

Tests:

- [ ] `runEnemySpatialHashSmokeTest`
- [ ] `runEnemySpatialHashNeighborLimitTest`
- [ ] `runDenseSwarmPerformanceBudgetTest`

Acceptance:

- [ ] 150 enemies can be stepped in the testbench without pathological slowdown.
- [ ] Neighbor lookups return nearby enemies and exclude far enemies.
- [ ] Avoidance does not require full all-pairs loops.

## Phase 6: Collision avoidance and rapid movement

The player wants crowded skies with enemies moving rapidly to avoid collisions.

Do this as steering, not collision damage.

Avoidance rules:

- Enemy-enemy collision damage should remain disabled.
- Enemies should steer away before overlap.
- If two fighters overlap anyway, separate their target steering over time, not by teleporting.
- Presenters have priority over swarm enemies.
- Swarm enemies yield to presenters.
- All enemies avoid the player safety bubble.

Tasks:

- [ ] Add avoidance steering vector to enemy target computation.
- [ ] Add config weights for player/enemy/terrain avoidance.
- [ ] Add debug counters:
    - `nearEnemyAvoidanceCount`
    - `nearPlayerAvoidanceCount`
    - `minEnemySeparation`
    - `minPlayerSeparation`
- [ ] Add event only for serious failures:
    - `enemy-near-collision`
    - `enemy-player-near-miss`
    - `enemy-swarm-overlap-failure`

Tests:

- [ ] `runDenseSwarmNoEnemyOverlapTest`
- [ ] `runDenseSwarmNoPlayerCollisionTest`
- [ ] `runPresenterPriorityAvoidanceTest`
- [ ] `runDenseSwarmRapidMotionTest`

Acceptance:

- [ ] In a 150-enemy scenario, enemies keep minimum separation above configured threshold most of the time.
- [ ] Presenters still complete close-readable passes.
- [ ] No enemy crashes into terrain during the dense swarm test.
- [ ] No player collision occurs in neutral flight unless explicitly tested as a failure case.

## Phase 7: Active presenter and threat budgets for a crowded sky

The old director selected only a few presenters. Keep that idea, but tune it for dense swarms.

Tasks:

- [ ] Replace `encounterMaxActivePresenters` use with:
    - `planetSwarmMaxClosePresenters`
    - `planetSwarmMaxImmediateThreats`
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

- [ ] 100+ enemies can exist.
- [ ] Only configured number become close presenters.
- [ ] Player danger bubble is respected.
- [ ] Background density remains high.

## Phase 8: Power-up state and collection

Add power-ups dropped from destroyed enemies.

Types for first milestone:

```js
'shield'
'rapid'
'weapon'
```

Tasks:

- [ ] Add `createPickupState`.
- [ ] Add `spawnPickup`.
- [ ] Add `maybeDropPickupForEnemy`.
- [ ] Add `updatePickups`.
- [ ] Add pickup collection against player ship.
- [ ] Add magnetic pull when pickup is close to player.
- [ ] Add pickup events:
    - `pickup-spawn`
    - `pickup-collect`
    - `pickup-expire`
- [ ] Add pickup cleanup on respawn/bootstrap.
- [ ] Add `state.pickups` to public/debug snapshot if useful.

Drop behavior:

- Regular enemy: small chance.
- Presenter enemy: slightly higher chance.
- Mothership: guaranteed several drops.
- Weapon pickup should choose a weapon family.
- Avoid spawning pickups inside planet terrain.
- Project pickups to atmosphere shell if needed.

Tests:

- [ ] `runPickupSpawnOnEnemyDeathTest`
- [ ] `runPickupNoTerrainSpawnTest`
- [ ] `runPickupCollectionTest`
- [ ] `runPickupExpirationTest`
- [ ] `runPickupMagnetPullTest`

Acceptance:

- [ ] Pickups spawn from destroyed enemies.
- [ ] Pickups can be collected by the player.
- [ ] Pickups expire.
- [ ] Pickups never spawn under terrain.
- [ ] Pickup logic is pure simulation, not rendering.

## Phase 9: Shield pickup

Shield behavior:

- Player can hold up to 3 shields.
- Each shield absorbs one crash/collision/damage event that would otherwise destroy or damage the player.
- After a shield is consumed, player gets brief invulnerability.
- Extra shield pickup at max shields converts to score or is ignored, depending on config.

Tasks:

- [ ] Add shield fields to player state.
- [ ] Modify `crashPlayerShip`, collision damage, and future enemy projectile damage to consume shield first.
- [ ] Add `playerShieldInvulnerabilityTimer`.
- [ ] Add shield pickup application:
    - if below 3, increment shields;
    - if at 3, overflow behavior.
- [ ] Add event:
    - `player-shield-gained`
    - `player-shield-consumed`
    - `player-shield-overflow`

Tests:

- [ ] `runShieldPickupCapsAtThreeTest`
- [ ] `runShieldPreventsCrashDeathTest`
- [ ] `runShieldConsumedOnCollisionTest`
- [ ] `runShieldInvulnerabilityWindowTest`
- [ ] `runShieldOverflowTest`

Acceptance:

- [ ] Player can hold 0 to 3 shields.
- [ ] A shield prevents one lethal event.
- [ ] Shield count decreases correctly.
- [ ] Overflow is handled deterministically.

## Phase 10: Rapid-fire pickup

Rapid fire behavior:

- Temporary effect.
- Makes the player shoot twice as often.
- Does not permanently change weapon tier.
- Does not stack endlessly; collecting another rapid pickup refreshes duration or extends up to a cap.

Tasks:

- [ ] Add `rapidFireTimer` to player.
- [ ] Decrease timer during sim step.
- [ ] Modify fire cooldown:
    - `effectiveCooldown = weaponCooldown * config.playerRapidFireCooldownMultiplier`
- [ ] Add event:
    - `player-rapid-fire-start`
    - `player-rapid-fire-refresh`
    - `player-rapid-fire-end`

Tests:

- [ ] `runRapidFirePickupStartsTimerTest`
- [ ] `runRapidFireDoublesFireRateTest`
- [ ] `runRapidFireExpiresTest`
- [ ] `runRapidFireRefreshTest`

Acceptance:

- [ ] While rapid fire is active, projectile count over a fixed firing window is about 2x baseline.
- [ ] When rapid fire expires, fire rate returns to normal.

## Phase 11: Weapon framework

Replace `spawnProjectileBurst` with a weapon dispatcher.

New functions:

```js
getPlayerWeaponMode(ship)
getPlayerWeaponTier(ship)
getPlayerWeaponCooldown(ship)
spawnPlayerWeaponBurst(state, ship, fireDirection)
spawnWeaponProjectile(state, options)
```

Projectile state should support:

```js
{
    weaponKind,
    damage,
    pierce,
    homingStrength,
    turnRate,
    radius,
    colorKey,
    visualKind
}
```

Tasks:

- [ ] Preserve existing projectile behavior as DART tier I.
- [ ] Add per-projectile damage instead of always using `config.shipProjectileDamage`.
- [ ] Add pierce support.
- [ ] Add homing strength per projectile.
- [ ] Add projectile visual kind field for renderer.
- [ ] Keep existing homing assist for DART or make it weapon-specific via config.
- [ ] Add weapon mode/tier fields to debug snapshot.

Tests:

- [ ] `runWeaponDefaultIsDartTierOneTest`
- [ ] `runWeaponCooldownByModeTest`
- [ ] `runProjectileDamageFieldTest`
- [ ] `runProjectilePierceTest`
- [ ] `runWeaponStatePersistsAcrossStepsTest`

Acceptance:

- [ ] Existing shooting still works.
- [ ] Weapon mode changes projectile pattern.
- [ ] Projectiles can carry damage/pierce/homing metadata.
- [ ] Tests can count spawned projectiles deterministically.

## Phase 12: DART weapon

DART is the direct forward weapon.

Tier behavior:

- Tier I: one forward projectile.
- Tier II: two close sequential/parallel forward projectiles.
- Tier III: adds two slight angled side darts.
- Tier IV: adds wider side darts.
- Tier V: adds stronger or piercing center dart.

3D adaptation:

- Use player forward as base direction.
- Use player right/up basis for offsets and slight direction spreads.
- Keep it readable and accurate.

Tests:

- [ ] `runDartTierOnePatternTest`
- [ ] `runDartTierThreeAddsSideShotsTest`
- [ ] `runDartTierFiveAddsPierceTest`

Acceptance:

- [ ] DART remains the accurate starter weapon.
- [ ] Higher tiers clearly increase coverage/damage.

## Phase 13: TWIN weapon

TWIN is a paired forward stream.

Tier behavior:

- Tier I: two side-by-side shots.
- Tier II: adds a center piercing shot.
- Tier III+: adds wider paired shots.
- Tier V: strongest center shot plus wide side pattern.

3D adaptation:

- Spawn shots from left/right offsets relative to ship right vector.
- Keep all shots mostly forward.
- Slight convergence is allowed but should be configurable.

Tests:

- [ ] `runTwinTierOnePatternTest`
- [ ] `runTwinTierTwoCenterShotTest`
- [ ] `runTwinTierFiveWidePatternTest`

Acceptance:

- [ ] TWIN feels like a reliable dual cannon.
- [ ] TWIN differs from DART by having parallel lanes.

## Phase 14: FAN weapon

FAN is the spread weapon.

Tier behavior:

- Tier I: 3 shots in a shallow fan.
- Tier II: 4 shots.
- Tier III: 5 shots.
- Tier IV: 7 shots.
- Tier V: 8 shots with wider spread.

3D adaptation:

- Spread around the ship's right axis and possibly slightly around up/right.
- Keep spread mostly horizontal relative to the ship/camera.
- Use current player up/right basis.

Tests:

- [ ] `runFanTierOneSpreadTest`
- [ ] `runFanTierFiveShotCountTest`
- [ ] `runFanDirectionsAreSymmetricTest`

Acceptance:

- [ ] FAN makes close crowded enemies easier to hit.
- [ ] Spread is deterministic enough for tests.

## Phase 15: ROCKET weapon

ROCKET is the slower heavy homing weapon.

Tier behavior:

- Tier I: two rockets.
- Tier II: three rockets.
- Tier III: four rockets.
- Tier IV: five rockets.
- Tier V: six rockets.
- Rockets have stronger homing and more damage but slower speed/cooldown.

3D adaptation:

- Rockets launch forward with slight random or deterministic lateral offsets.
- Rockets use homing against enemies within configurable cone/range.
- Use deterministic seeded jitter in tests, not `Math.random`.

Tests:

- [ ] `runRocketTierOnePatternTest`
- [ ] `runRocketTierFiveCountTest`
- [ ] `runRocketHomingTurnsTowardTargetTest`
- [ ] `runRocketDoesNotTurnTooHardTest`

Acceptance:

- [ ] Rockets are useful against crowded swarms.
- [ ] Rockets do not instantly snap or behave like teleporting bullets.

## Phase 16: BEAM weapon

BEAM is the fast piercing weapon.

Tier behavior:

- Tier I: two narrow beam projectiles.
- Tier II: three.
- Tier III: four.
- Tier IV: five.
- Tier V: six.
- Beam projectiles are fast, narrow, and piercing.

3D adaptation:

- Use fast projectile bodies rather than continuous raycast at first.
- Add pierce count.
- Add short bright visuals in renderer later.
- Consider true ray/segment beam only after projectile version is stable.

Tests:

- [ ] `runBeamTierOnePatternTest`
- [ ] `runBeamPiercesMultipleEnemiesTest`
- [ ] `runBeamFastProjectileLifetimeTest`

Acceptance:

- [ ] BEAM can hit multiple enemies in a line.
- [ ] BEAM is distinct from DART by speed and pierce.

## Phase 17: Weapon pickups and upgrades

Weapon pickup behavior:

- A weapon pickup has a weapon family.
- If pickup family differs from current weapon:
    - switch to that family,
    - use the stored tier for that family,
    - if no stored tier exists, tier I.
- If pickup family matches current weapon:
    - increase that family's tier up to V.
- If current family is already tier V:
    - apply overflow behavior:
        - either upgrade another family,
        - or add score,
        - or refresh rapid fire, depending on config.

Tasks:

- [ ] Add weapon pickup family selection.
- [ ] Add `applyWeaponPickup`.
- [ ] Add per-family stored tiers.
- [ ] Add weapon banner/message state.
- [ ] Add debug events:
    - `player-weapon-switch`
    - `player-weapon-upgrade`
    - `player-weapon-overflow`

Tests:

- [ ] `runWeaponPickupSwitchesFamilyTest`
- [ ] `runWeaponPickupUpgradesSameFamilyTest`
- [ ] `runWeaponTierCapsAtFiveTest`
- [ ] `runWeaponFamilyTierMemoryTest`
- [ ] `runWeaponOverflowTest`

Acceptance:

- [ ] Weapon pickups work like ThoriumGap in spirit.
- [ ] Same-family pickups upgrade.
- [ ] Different-family pickups switch.
- [ ] Tier cap is enforced.

## Phase 18: Pickup visuals and HUD

Rendering changes in `Orbitals_JS.js` and `Orbitals_JS.html`.

Visual requirements:

- Shield pickup should be visibly blue.
- Rapid-fire pickup should be visibly orange/yellow.
- Weapon pickup should identify family:
    - DART
    - TWIN
    - FAN
    - ROCKET
    - BEAM
- Pickups should glow enough to be noticed in a crowded sky.
- Shields on player should be visible, preferably as 1 to 3 subtle rings.
- Rapid fire should have a HUD/timer cue.
- Current weapon and tier should be visible in HUD.

Tasks:

- [ ] Add pickup visuals map.
- [ ] Add `updatePickupVisuals`.
- [ ] Add player shield visual.
- [ ] Add weapon/tier HUD text.
- [ ] Add rapid-fire timer HUD text or bar.
- [ ] Add projectile visual variants for weapon kinds.
- [ ] Keep rendering separate from sim state.

Tests:

- [ ] Rendering is mostly manual/browser-tested unless a pure helper can be tested.
- [ ] Add testbench snapshot fields for weapon/shield/rapid state.

Acceptance:

- [ ] Player can see what they picked up.
- [ ] Player can see current shields.
- [ ] Player can see current weapon family/tier.
- [ ] Projectiles visually differ by weapon kind enough to debug.

## Phase 19: Scoring and reward loop

Add simple score rules if not already sufficient.

Suggested behavior:

- Enemy kill gives score.
- Pickup overflow gives score.
- Mothership kill gives large score.
- Clearing planet gives bonus.
- Weapon upgrade/pickup does not itself need score unless overflow.

Tasks:

- [ ] Add config score constants.
- [ ] Ensure pickup overflow score works.
- [ ] Ensure dense enemies do not inflate score too absurdly unless desired.
- [ ] Add planet-clear score event.

Tests:

- [ ] `runEnemyKillScoreTest`
- [ ] `runPickupOverflowScoreTest`
- [ ] `runPlanetClearBonusScoreTest`

Acceptance:

- [ ] Score is deterministic in tests.
- [ ] Dense swarms feel rewarding without breaking progression.

## Phase 20: Dense planet invasion integration

Combine:

- dense mothership release,
- swarm role,
- close presenters,
- pickups,
- weapons,
- shields,
- rapid fire.

Tasks:

- [ ] Create `createDensePlanetInvasionScenario` test helper.
- [ ] Run simulation with 100+ enemies.
- [ ] Force player firing for a fixed window.
- [ ] Confirm:
    - enemies can be killed,
    - pickups can spawn,
    - pickups can be collected,
    - weapon upgrades affect projectile pattern,
    - shields can be gained,
    - rapid-fire changes fire rate,
    - planet encounter remains active/clearable.

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

## Phase 21: Tuning passes

Do not skip this. The numeric target is the plan's heartbeat.

Tuning questions:

- Are close presenters too close to aim at?
- Do enemies look 1/3 to 1/5 player size often enough?
- Does the player get enough power-ups to survive dense swarms?
- Does rapid fire feel temporary and valuable?
- Does FAN become the best default against dense swarms?
- Does ROCKET overperform due homing?
- Does BEAM overperform due pierce?
- Does the planet feel crowded without becoming visual soup?
- Does performance remain acceptable?

Tasks:

- [ ] Add debug summary for each invasion:
    - total fighters,
    - max alive fighters,
    - presenter count,
    - average apparent size during presentation,
    - pickup drops,
    - pickup collections,
    - player weapon tier progression,
    - player shields gained/consumed,
    - enemy crash count,
    - enemy near-collision count.

- [ ] Add config presets:
    - `debugDenseSwarmPreset`
    - `debugClosePresentationPreset`
    - `debugPickupHeavyPreset`

Acceptance:

- [ ] Testbench metrics support tuning.
- [ ] Browser playtesting has enough HUD/debug feedback to tune quickly.

## Expected file changes

- `orbitals_config.js`
    - Dense swarm constants.
    - Close presentation constants.
    - Spatial hash constants.
    - Pickup constants.
    - Shield constants.
    - Rapid-fire constants.
    - Weapon constants.
    - Score constants.
    - Moved gameplay constants from sim.

- `Orbitals_Sim.js`
    - Dense fighter burst release.
    - Swarm role and target computation.
    - Spatial hash.
    - Collision avoidance steering.
    - Close presentation retuning.
    - Pickup state/update/collection.
    - Shield behavior.
    - Rapid-fire behavior.
    - Weapon framework.
    - DART/TWIN/FAN/ROCKET/BEAM patterns.
    - Projectile damage/pierce/homing metadata.
    - Debug events.
    - Encounter accounting fixes.

- `orbitals_testbench.mjs`
    - Apparent-size helpers.
    - Close presentation tests.
    - Dense spawn tests.
    - Swarm behavior tests.
    - Spatial hash tests.
    - Avoidance tests.
    - Pickup tests.
    - Shield tests.
    - Rapid-fire tests.
    - Weapon pattern tests.
    - Dense integration tests.
    - Previously missing tests carried over from old plan.

- `Orbitals_JS.js`
    - Pickup visuals.
    - Shield visual rings.
    - Weapon projectile visuals.
    - HUD additions for shields, rapid-fire, weapon family/tier.
    - Optional debug display for close presenter apparent size.

- `Orbitals_JS.html`
    - HUD layout additions if needed.
    - No gameplay logic.

- `PLANETARY_COMBAT_PLAN.md`
    - Replace with this plan or save as a new plan file such as `DENSE_PLANETARY_SWARM_PLAN.md`.

## First stable milestone

This milestone should be implemented before the full weapon system.

Complete when:

- [ ] Testbench runs successfully from the provided repo bundle.
- [ ] Existing tests pass.
- [ ] Apparent-size metric exists.
- [ ] Behind-catchup close pass works.
- [ ] Side-cross close pass works.
- [ ] Head-on close pass avoids collision.
- [ ] Mothership can release 100+ fighters through burst spawning.
- [ ] Fighters become swarm-role enemies after settling.
- [ ] Dense swarm stays in atmosphere.
- [ ] Dense swarm does not collapse into a line.
- [ ] Dense swarm avoids player danger bubble.
- [ ] Dense swarm avoids enemy overlap.
- [ ] Active close presenters stay within configured budget.
- [ ] Threat budget is actually enforced.
- [ ] No ordinary invasion fighters die from terrain crashes in dense test.
- [ ] No ordinary invasion fighters escape the planet in dense test.
- [ ] Planet invasion still clears correctly.

## Second stable milestone

Complete when:

- [ ] Pickups spawn from killed enemies.
- [ ] Pickups can be collected.
- [ ] Shield pickup works and caps at 3.
- [ ] Shield prevents one lethal event.
- [ ] Rapid-fire pickup doubles fire rate temporarily.
- [ ] Pickup visuals exist.
- [ ] HUD shows shields and rapid-fire state.

## Third stable milestone

Complete when:

- [ ] Weapon framework replaces single projectile burst.
- [ ] DART works through five tiers.
- [ ] TWIN works through five tiers.
- [ ] FAN works through five tiers.
- [ ] ROCKET works through five tiers.
- [ ] BEAM works through five tiers.
- [ ] Weapon pickups switch/upgrade families.
- [ ] Per-family weapon tiers are remembered.
- [ ] Weapon visuals/HUD exist.
- [ ] Dense planet invasion remains playable with upgraded weapons.

## Final acceptance criteria

The feature is complete when:

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
- [ ] Transport-defense unfinished items from the previous plan are not falsely marked complete.
- [ ] All new behavior is covered by testbench tests.
- [ ] All testbench tests pass.
