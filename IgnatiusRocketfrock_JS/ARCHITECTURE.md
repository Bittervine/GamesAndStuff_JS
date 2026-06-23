# Ignatius Rocketfrock Architecture

This document is the directory and dependency map for the browser reference implementation and the planned C++ / Unreal Engine 5 port.

## Source classifications

Every implementation file belongs to one of these classifications:

* **PORTABLE CORE**: deterministic gameplay logic intended to have a close C++ equivalent.
* **SHARED DATA / MATH**: engine-neutral formats and transforms used by more than one major subsystem.
* **BROWSER ADAPTER**: browser startup, device input, timing, and connection of the core to presentation.
* **PRESENTATION ONLY**: Canvas drawing, visual asset loading, colour treatment, animation playback, and other non-authoritative feedback.
* **EDITOR ONLY**: authoring tools and their helper modules.
* **TEST ONLY**: headless, integration, and future cross-language parity tests.

## Current project layout

```text
IgnatiusRocketfrock_JS/
├── index.html
├── game.html
├── asset-editor.html
├── level-editor.html
├── character-editor.html
├── renderer-smoke.html
├── src/
│   ├── core/
│   │   ├── enemy-navigation.js
│   │   └── simulation.js
│   ├── browser/
│   │   ├── browser-input.js
│   │   └── game-bootstrap.js
│   ├── presentation/
│   │   ├── canvas-renderer.js
│   │   ├── character-runtime.js
│   │   └── level-color-map.js
│   ├── shared/
│   │   ├── animation-data.js
│   │   └── level-transform.js
│   └── tools/
│       └── character-editor/
│           ├── animation-editor.js
│           ├── atlas-editor.js
│           ├── character-dirty-state.js
│           ├── character-editor-view.js
│           └── character-project.js
├── tests/
│   └── testbench.mjs
├── assets/
├── devel/
├── package.json
├── AGENTS.md
├── PLAN.md
├── IMPLEMENTATION_CHECKLIST.md
└── ARCHITECTURE.md
```

The root HTML files are thin browser entry points. Their larger inline editor applications are still scheduled to move into uniquely named modules under `src/tools/level-editor/`, `src/tools/asset-editor/`, and `src/tools/character-editor/`. That extraction should be performed one editor at a time and must not be mixed with gameplay changes.

## Dependency direction

The intended dependency direction is:

```text
shared  ←  core  ←  browser
   ↑          ↑       ↓
   └──── presentation ┘
              ↑
            tools
```

More precisely:

* `src/core/` may import only `src/core/` and engine-neutral `src/shared/` modules.
* `src/shared/` must not import browser, presentation, or editor modules.
* `src/browser/` may import core, shared, and presentation modules.
* `src/presentation/` may import shared modules and read core state, but must not own gameplay decisions.
* `src/tools/` may import shared and presentation helpers, but gameplay code must not import editor code.
* `tests/` may import any layer for verification.

### Known temporary boundary violation

`src/core/simulation.js` currently imports `normalizeLevelColorMap` from `src/presentation/level-color-map.js` while applying editor-authored levels. This is intentionally documented as technical debt, not as an approved dependency. The normalized `LevelDefinition` work must remove this import and keep colour mapping entirely in authoring or presentation data.

## Current module responsibilities

| Module | Classification | Responsibility |
|---|---|---|
| `src/core/enemy-navigation.js` | PORTABLE CORE | Deterministic support extraction, directed step/jump/drop edges, jump-feasibility calculation, and lowest-cost platform routing for character enemies. |
| `src/core/simulation.js` | PORTABLE CORE | Authoritative fixed-step state, player physics, collisions, weapons, enemy strategy state machines, reactive objects, story state, level runtime conversion, serialization, and update order. |
| `src/shared/animation-data.js` | SHARED DATA / MATH | Animation schema normalization, sampling, interpolation, and pose blending. |
| `src/shared/level-transform.js` | SHARED DATA / MATH | Mirroring, rotation, placement geometry, hit testing, and atlas-node conversion shared by runtime and editor. |
| `src/browser/browser-input.js` | BROWSER ADAPTER | Keyboard, gamepad, mouse, and touch state converted into `InputFrame`. |
| `src/browser/game-bootstrap.js` | BROWSER ADAPTER | Asset and level loading, fixed-step loop, connection of input/simulation/renderer, and hydration of plain character combat profiles from loaded character projects. |
| `src/presentation/canvas-renderer.js` | PRESENTATION ONLY | Canvas rendering, camera presentation, HUD, rig drawing, visual effects, and debug overlays. |
| `src/presentation/character-runtime.js` | PRESENTATION ONLY | Browser-side character project loading, rig normalization, animation selection, projectile-release transform compilation, and ordered draw commands. |
| `src/presentation/level-color-map.js` | PRESENTATION ONLY | Normalization and cached selective hue remapping for environment atlases. |
| `src/tools/character-editor/*` | EDITOR ONLY | Reusable Puppet Forge project, animation, atlas, dirty-state, and view operations. |
| `tests/testbench.mjs` | TEST ONLY | Headless simulation tests, data tests, source-boundary checks, and browser-entry integration checks. |



## Enemy strategy and navigation boundary

Revision 115 introduces an explicit enemy strategy layer. `simple_patrol` preserves the earlier local patrol/attack behaviour, `sentry` remains stationary until a target enters awareness range, and `hunter` owns a portable state machine with `patrol`, `pursue`, `position_for_attack`, `jump`, `drop`, `investigate_last_seen`, `unreachable_glare`, `return_home`, and `stranded_patrol` states.

Navigation is deliberately platform-oriented rather than a generic polygon navmesh. `src/core/enemy-navigation.js` extracts upward-facing support intervals from authored collision segments and solid tops, removes floor intervals obstructed by closed collision geometry, and retains obstacle footprints so vertically overlapping tops are entered from a clear side rather than from beneath. It creates directed edges for steps, single jumps, and controlled drops, and rejects edges that exceed the enemy's run speed, jump height, gravity, maximum fall distance, or body-access requirements. Route cost includes the walk from the current position to the launch point. Revision 118 adds physics-guided run-up candidates and trial-runs each jump at the same fixed-step split-axis cadence used by runtime, using the actor's full collision width rather than a narrower navigation proxy. Revision 119 applies the same principle to walk-off drops: launch points sit at the source edge and the chosen horizontal velocity must clear the source obstacle before the actor descends beside its wall. Runtime traversal then uses the same shared swept actor collision queries as Ignatius for solids, segments, and polygons, so an NPC cannot fall through ordinary ground or pass through a pillar merely because a graph edge predicted it.

Hunters remember their original support and patrol interval. Planning first tries to reach the wizard's step-connected support region. Ranged hunters only fall back to another support when that region is genuinely unreachable; the fallback search validates the actual authored projectile origin and either the direct fireball path or solved ballistic musket-ball arc. Once an engaged hunter loses awareness, it records no new hidden information: it keeps the last genuinely seen player foot position, routes to the reachable support point with the smallest remaining world-space distance to that position, and begins the glare delay only after arriving there or proving that no closer route exists. If the original support cannot then be reached, the enemy adopts the reachable support as a bounded temporary patrol and periodically retries the home route. This fallback is deterministic and visible; no enemy despawns merely because it made an unfortunate jump.

Movement capability and behaviour flavour are enemy-archetype/runtime data, not character-art data. The enemy catalog and level entity may author `strategy`, `walkSpeed`, `runSpeed`, `jumpHeight`, `jumpGravity`, `maxFallDistance`, `awarenessRange`, `awarenessViewHalfAngle`, `unreachableGlareDuration`, `routeRepathInterval`, and `homeRetryInterval`. Awareness is independent of collision geometry: blockable and walkable level shapes may obstruct movement or an actual attack, but they do not hide Ignatius. First notice is controlled only by radial distance and the monster's facing cone, which defaults to ±60 degrees. The legacy `awarenessVerticalRange` field remains loadable for old levels but is not a perception gate. Character JSON remains concerned with rig, animation, and projectile handoff, preserving the presentation/gameplay boundary.

## Character ground and editor-guide boundary

Generic runtime characters use local `y = 0` as their support line. Enemy world `y` therefore remains the actual terrain contact coordinate, and the runtime does not carry a goblin-specific vertical correction. Revision 113 bakes the goblin correction into authored rig-space data instead: shared rig anchors and setup offsets, character-level setup overrides, animation reference poses, and all Y tracks move together. Projectile release transforms move with the same translation, preserving hand-to-projectile alignment and release timing.

Puppet Forge renders a cyan `GROUND · y = 0` guide in the animation workspace. Its draggable label changes only `viewPanY`, making it a presentation convenience rather than an authoring transform or gameplay field.

## Animation-authored projectile handoff boundary

Revision 112 keeps authored projectile preparation in character data without moving gameplay into the renderer. Rig parts may carry a `projectile` descriptor with `id`, `launchType`, `animationSlot`, and explicit `releaseTime`; a character sharing that rig selects its active projectile through `projectilePart`. `character-runtime.js` validates that descriptor and samples the projectile part's rig-space transform at release. `game-bootstrap.js` converts loaded projects into plain combat profiles and passes those profiles into the portable simulation. The core uses the sampled local origin plus enemy facing/scale, chooses deterministic launch physics, owns projectile state and collision, and emits firing/impact events. The renderer only hides the still-rigged sprite after handoff and draws the simulation-owned projectile.

The explicit release time is authoritative. The editor displays the selected projectile part's final key time only as an authoring aid, because recoil and recovery keys may continue after launch and the artist may deliberately release before or after a part's final positional key.

## Player homing-target selection boundary

Homing-target priority is simulation-owned. At rocket launch, the core partitions active enemy targets by Ignatius's facing half-plane, chooses the nearest target on the forward side, and consults targets behind him only when the forward set is empty. Distance is measured from the rocket launch point rather than level-authoring order. A live projectile retains its current active target; the same priority function is used only when a replacement target is required.

## Reactive-object runtime boundary

Revision 100 establishes the first authoritative reactive-object path. Editor-authored destructible entities are normalized into `gameState.reactiveObjects`, while their atlas state remains in `world.entities`/`world.visuals` for presentation. A reactive object may contribute a dynamic solid while its current state is listed in `collisionStates`; state changes rebuild only that solid. Projectile movement compares swept impacts against enemies, reactive objects, and terrain and resolves the earliest contact. Health, state, collision flags, damage multipliers, and emitted events are portable-core data. Atlas frame selection and smoke drawing remain presentation concerns.

The first implementation remains inside `src/core/simulation.js` to avoid a behavior-changing extraction. When the core is split, these helpers should move together into the planned `src/core/reactive-objects.js` module and retain parity fixtures for health transitions, collision removal, projectile ordering, and serialization.

## Naming rules

* Use lowercase kebab-case filenames.
* Do not repeat the project name in every source filename. The directory path supplies that context.
* Use unique descriptive filenames rather than repeated generic names such as `app.js`, `view.js`, or `model.js` across multiple tools.
* Future editor entry modules should therefore be named `level-editor-app.js`, `asset-editor-app.js`, and `character-editor-app.js`.
* Keep explicit import paths. Do not hide dependencies behind large barrel files.
* Keep numbered asset filenames such as `ct_char_enemy_001.json`; asset IDs and source module names solve different problems.

## Planned portable core split

`src/core/simulation.js` remains the authoritative facade for now. As systems are next edited, extract them without changing behaviour into modules with clear C++ counterparts:

| Planned JavaScript module | Planned portable C++ counterpart |
|---|---|
| `src/core/core-types.js` | `RocketfrockCore/CoreTypes.h` |
| `src/core/game-state.js` | `RocketfrockCore/GameState.h/.cpp` |
| `src/core/collision.js` | `RocketfrockCore/Collision.h/.cpp` |
| `src/core/player.js` | `RocketfrockCore/Player.h/.cpp` |
| `src/core/weapons.js` | `RocketfrockCore/Weapons.h/.cpp` |
| `src/core/projectiles.js` | `RocketfrockCore/Projectiles.h/.cpp` |
| `src/core/enemies.js` | `RocketfrockCore/Enemies.h/.cpp` |
| `src/core/enemy-navigation.js` | `RocketfrockCore/EnemyNavigation.h/.cpp` |
| `src/core/reactive-objects.js` | `RocketfrockCore/ReactiveObjects.h/.cpp` |
| `src/core/story.js` | `RocketfrockCore/Story.h/.cpp` |
| `src/core/level-runtime.js` | `RocketfrockCore/LevelRuntime.h/.cpp` |
| `src/core/simulation-events.js` | `RocketfrockCore/SimulationEvents.h/.cpp` |
| `src/core/simulation.js` | `RocketfrockCore/Simulation.h/.cpp` |

The JavaScript and C++ implementations should preserve equivalent public functions, data fields, state-machine choices, update order, and fixtures where practical. Browser and Unreal presentation files do not need one-to-one parity.

## Stable parity boundary

The cross-platform contract is:

```text
InputFrame + fixed dt
        ↓
   stepSimulation
        ↓
GameState + SimulationEvent[]
```

The browser renderer and future Unreal presentation adapter may differ completely internally. Neither may become authoritative for gameplay motion, collision, AI, damage, level transitions, or saveable state.

## Tests and fixture direction

The project is explicitly configured as browser-style ES modules through `package.json`. Run the current suite from the project root:

```text
npm test
```

The script executes `node tests/testbench.mjs` and has no package dependencies.

Future language-neutral parity fixtures belong under `tests/fixtures/`. Both the JavaScript runner and standalone C++ runner must consume the same JSON fixtures. Tool-specific tests may later be split into uniquely named files under `tests/core/`, `tests/presentation/`, `tests/tools/`, and `tests/integration/`, while `tests/testbench.mjs` remains the aggregate entry point until that split is useful.

## Baked enemy navigation graph boundary

Revision 117 adds an optional authored cache above the portable navigation core. `src/core/enemy-navigation.js` remains the sole implementation of support extraction, ballistic transition sampling, graph baking, and route search. The Level Editor imports that module directly and stores its output under `level.navigationGraphs`; it does not maintain a second approximation of platform reachability.

A navigation profile is keyed by body width/height, run speed, jump height, gravity, maximum fall distance, maximum step height, and step-gap tolerance. Runtime extracts the current supports cheaply and compares their stable signature with the baked profile. An exact match reuses the baked directed edges. A mismatch, including edited terrain or a different monster movement profile, constructs edges live. The Level Editor also rebuilds all placed hunter profiles automatically before launching a browser playtest, while retaining the explicit Build command for visualization. This gives authored levels predictable cached routes without making stale graph data authoritative over collision geometry.

Graph transitions are directional and preserve action semantics: `step`, `jump`, and `drop`, each with left/right direction where applicable, launch and landing coordinates, launch velocity, flight time, and traversal cost. Revision 118 replaces coarse point-parabola clearance with a fixed-step body trial matching runtime X-then-Y collision order. Physics-guided candidates place takeoff points far enough from raised obstacle sides to preserve a meaningful run-up and cross the lip while rising, while controlled-drop validation permits the same short ledge departure window used by runtime collision samples. Optional blocker IDs and `dynamicCostRules` let simulation disable or penalize edges from authoritative entity state, providing the future seam for closed doors, destructible walls, lifts, and other conditional topology.

## Revision 121 navigation run-up contract

A jump edge is no longer only an airborne parabola. `src/core/enemy-navigation.js` may attach `runUpX`, `runUpY`, `runUpDistance`, `requiredLaunchSpeed`, and `groundAcceleration` to a jump transition. Those fields form a committed traversal contract: simulation approaches the run-up point, accelerates along the source support toward `launchX`, and starts the authored ballistic edge only at takeoff. Search cost begins at `runUpX`, not `launchX`. A baked edge is invalid if the source support cannot provide the physical acceleration distance or if the full-body run-up corridor intersects static blocking geometry.

The graph format is version 2. Mobility identity includes ground acceleration because changing acceleration can invalidate otherwise identical jump edges. Older graphs may still be read structurally, but they will not match a version-2 mobility key and therefore fall back to live construction or editor rebaking.

## Mounted overlay transform rule

Presentation elements mounted on a rig part must use the same final draw-command transform as that part. They must not sample the pre-presentation pose directly, because transient presentation transforms such as doorway scaling are applied after pose sampling. Revision 122 applies this rule to the rocket fuel indicator.

## Player combat-target lifecycle

Player health is a resource value, not the authoritative player lifecycle state. Simulation systems that decide whether Ignatius can be noticed, attacked, or struck must use explicit presentation/lifecycle fields such as `player.visible`, `player.combatState`, and `player.targetable`. Revision 124 deliberately keeps a visible zero-health player targetable because the project does not yet implement the complete player-death transition. When death is added, one authoritative lifecycle transition should disable targeting rather than duplicating `health <= 0` checks across AI and projectile code.
