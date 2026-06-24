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
│   │   ├── electron-window-bridge.js
│   │   ├── game-bootstrap.js
│   │   ├── game-settings-store.js
│   │   └── music-director.js
│   ├── presentation/
│   │   ├── canvas-renderer.js
│   │   ├── cave-window-mask.js
│   │   ├── character-runtime.js
│   │   ├── foreground-sprite-treatment.js
│   │   ├── level-color-map-cache.js
│   │   └── world-visual-cache.js
│   ├── shared/
│   │   ├── actor-geometry.js
│   │   ├── animation-data.js
│   │   ├── cave-window-data.js
│   │   ├── cave-window-decoration.js
│   │   ├── game-settings-data.js
│   │   ├── level-color-map-data.js
│   │   ├── level-transform.js
│   │   ├── moving-platform-data.js
│   │   ├── music-data.js
│   │   └── signal-channel-data.js
│   └── tools/
│       └── character-editor/
│           ├── animation-editor.js
│           ├── atlas-editor.js
│           ├── character-dirty-state.js
│           ├── character-editor-view.js
│           ├── character-project.js
│           └── dopesheet-data.js
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


Revision 143 aligns editor inspector ergonomics across all three authoring tools. Puppet Forge, the Level Editor, and the Asset Tool attach an accessible expand/collapse control to each right-side panel heading and remember each tool's state under its own local-storage key. This is UI-only state: collapsing a panel never removes controls, mutates project data, or affects exported JSON.

Revision 146 adds a left-side full dopesheet to Puppet Forge. Dopesheet row discovery and ordering live in the editor-only `src/tools/character-editor/dopesheet-data.js`; DOM construction, selection, and scrubbing remain in `character-editor.html`. The helper reads animation authoring data but does not participate in runtime sampling, simulation, exported schemas, or future C++ parity.

Revision 145 adds an editor-only authoring diagnostic without moving cave semantics into gameplay. `src/shared/cave-window-data.js` can classify a placement polygon against the sampled closed cave spline and report exterior separation distance. The Level Editor applies that neutral geometry helper only to collision-bearing atlas placements, warns when they are completely exterior beyond a conservative margin, and draws the warning above the preview shade. The diagnostic does not alter level data, collision, navigation, rendering order, or runtime simulation.

Revision 149 adds a browser-owned pause menu and persistent settings shell without moving browser APIs into portable core. `src/shared/game-settings-data.js` owns normalized volume, difficulty, and rendering-quality presets. `src/browser/game-settings-store.js` owns local-storage persistence, while `src/browser/electron-window-bridge.js` normalizes the optional preload contract. Core reads the normalized difficulty damage multiplier only inside `damagePlayer`, and uses the normalized rendering-quality particle multiplier only for visual smoke emission. The current default music volume is 10% and effects volume is 80%. The browser music engine added later remains separate from the portable simulation.

The prepared Electron host lives under `electron/`. Its main process loads the same `game.html`; the sandboxed preload exposes only quit and fullscreen operations. Browser, presentation, shared, and core modules never import Electron. Ordinary browsers retain the same menu and fullscreen controls but hide Exit to desktop.

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

### Boundary status

Revision 135 removed the last documented core-to-presentation dependency. Colour-map normalization and colour mathematics now live in shared code, while browser canvas generation remains presentation-only. Source-boundary tests reject any future `src/core/` import from browser, presentation, or editor modules.

## Current module responsibilities

| Module | Classification | Responsibility |
|---|---|---|
| `src/core/enemy-navigation.js` | PORTABLE CORE | Deterministic support extraction, directed step/jump/drop edges, jump-feasibility calculation, and lowest-cost platform routing for character enemies. |
| `src/core/simulation.js` | PORTABLE CORE | Authoritative fixed-step state, player physics, collisions, weapons, enemy strategy state machines, reactive objects, story state, level runtime conversion, serialization, and update order. |
| `src/shared/signal-channel-data.js` | SHARED DATA / MATH | Named-channel normalization and reusable lever/keyhole emitter normalization shared by editor and portable core. |
| `src/shared/moving-platform-data.js` | SHARED DATA / MATH | Versioned moving-platform patterns, activations, safe defaults, and relative endpoint calculations. |
| `src/shared/actor-geometry.js` | SHARED DATA / MATH | Shared baseline-anchored actor rectangles, enemy projectile hurtboxes, and melee reach rectangles used by simulation and debug presentation. |
| `src/shared/animation-data.js` | SHARED DATA / MATH | Animation schema normalization, sampling, interpolation, and pose blending. |
| `src/shared/level-transform.js` | SHARED DATA / MATH | Mirroring, rotation, placement geometry, hit testing, and atlas-node conversion shared by runtime and editor. |
| `src/shared/level-color-map-data.js` | SHARED DATA / MATH | Level colour-map normalization, cache keys, hue-selection mathematics, and RGB/HSL conversion without browser objects. |
| `src/shared/game-settings-data.js` | SHARED DATA / MATH | Versioned game-facing settings defaults, preset normalization, incoming-damage scale, and visual particle-density scale without browser storage or DOM objects. |
| `src/shared/cave-window-data.js` | SHARED DATA / MATH | Inert cave-window schema normalization, decoration settings, closed smooth/corner spline sampling, point-insertion lookup, and authoring bounds. It contains no collision or navigation generation. |
| `src/shared/cave-window-decoration.js` | SHARED DATA / MATH | Deterministic arc-length sampling and tagged atlas-asset selection for explicit non-colliding `caveForeground` placement records. |
| `src/browser/browser-input.js` | BROWSER ADAPTER | Keyboard, gamepad, mouse, and touch state converted into `InputFrame`. |
| `src/browser/game-bootstrap.js` | BROWSER ADAPTER | Asset and level loading, fixed-step loop, menu/settings coordination, fullscreen control, connection of input/simulation/renderer, and hydration of plain character combat profiles from loaded character projects. |
| `src/browser/game-settings-store.js` | BROWSER ADAPTER | Safe local-storage load/save for normalized game-facing settings. |
| `src/browser/electron-window-bridge.js` | BROWSER ADAPTER | Detection and normalization of the optional sandboxed Electron preload API for quit/fullscreen operations. |
| `electron/main.cjs` / `electron/preload.cjs` | DESKTOP HOST | Optional native window, secure preload boundary, desktop quit, and fullscreen IPC. No gameplay ownership. |
| `src/presentation/canvas-renderer.js` | PRESENTATION ONLY | Canvas rendering, camera presentation, HUD, rig drawing, visual effects, cave-mask composition, and debug overlays. |
| `src/presentation/cave-window-mask.js` | PRESENTATION ONLY | Reduced-resolution reusable offscreen black cave mask, stable render keys, spline-to-screen tracing, outward feathering, and camera-relative foreground parallax. |
| `src/presentation/foreground-sprite-treatment.js` | PRESENTATION ONLY | Cached Canvas preparation for dark/desaturated cave foreground frames, world-to-local outward vectors, and a linear handover to opaque black at the sprite's exterior edge. |
| `src/presentation/character-runtime.js` | PRESENTATION ONLY | Browser-side character project loading, rig normalization, animation selection, projectile-release transform compilation, and ordered draw commands. |
| `src/presentation/level-color-map-cache.js` | PRESENTATION ONLY | Offscreen Canvas generation and image-pixel application for cached environment-atlas recolouring. |
| `src/presentation/world-visual-cache.js` | PRESENTATION ONLY | Cached static-layer partitioning/sort keys, conservative rotated world bounds, parallax-aware viewport bounds, and Canvas draw rejection helpers. |
| `src/tools/character-editor/*` | EDITOR ONLY | Reusable Puppet Forge project, animation, atlas, dirty-state, view, and dopesheet operations. |
| `tests/testbench.mjs` | TEST ONLY | Headless simulation tests, data tests, source-boundary checks, and browser-entry integration checks. |




## Cave-window presentation boundary

The cave perimeter is deliberately not gameplay geometry. Revision 136 adds a closed editor spline in top-level `level.caveWindow`; revision 137 turns that data into a visual opening through a foreground rock mass using a reusable offscreen black mask. It may scroll with a subtle foreground parallax offset and may occlude actors, but it must not create solids, walkable supports, hazards, navigation edges, or projectile collision. Authoritative collision and platforms remain ordinary playing-area data in the portable level definition.

`src/shared/cave-window-data.js` owns schema, decoration settings, and curve mathematics so the Level Editor and renderer share deterministic points. `src/shared/cave-window-decoration.js` samples that spline by arc length, classifies inward normals as floor, wall, or ceiling, and selects tagged atlas assets deterministically from the authored seed. It returns ordinary explicit placement records on the `caveForeground` layer; it does not mutate gameplay geometry. `src/presentation/cave-window-mask.js` owns Canvas composition, outward feathering, and camera-relative parallax anchored around the technical world bounds. Portable core does not import cave-window curve or generator modules and must never interpret the perimeter as physics.

Foreground cave placements are presentation records drawn after actors and before the black cave mask. Runtime and editor both force manifest collision off for this layer, even when a malformed level requests collision. The renderer applies the same cave parallax and uses cached darkened/desaturated frame canvases, avoiding an expensive Canvas filter for every placement on every frame. Revision 140 moves that preparation into `src/presentation/foreground-sprite-treatment.js`, which rotates each authored world-outward vector back into sprite-local space and bakes a transparent-to-black eased multi-stop overlay into the cached frame. Generated records are marked `generatedBy: "cavePerimeter"`; regeneration replaces only those records, leaving manual foreground formations untouched. The per-sprite fade reaches black before the reduced-resolution cave mask becomes fully opaque, so the rock frame hands over continuously to unseen darkness rather than exposing sprite rectangles. The editor should warn when authoritative platforms are placed so far outside the visible opening that their gameplay purpose would be hidden.

Revision 139 adds a presentation-only performance boundary around dense cave scenery. `src/presentation/world-visual-cache.js` partitions and sorts the static visual list only when the array identity changes, precomputes conservative rotated bounds, and culls terrain, actor-front, cutout-mask, and cave-foreground records before Canvas state changes or image submission. Cave-foreground culling includes the authored parallax offset. The renderer also conservatively culls off-screen targets, pickups, enemies, smoke puffs, and projectiles, with projectile trails included in their bounds. `src/presentation/cave-window-mask.js` renders its blur at 35% linear resolution, reuses the result while all render inputs remain unchanged, and upscales during final composition. The debug panel reports renderer stage timings, real render-to-render FPS, static/dynamic draw-cull counts, foreground-cache activity, and cave-mask reuse. These caches and bounds remain useful if a later WebGL2 backend is required.

Revision 140 applies the same discipline to the Level Editor. Static placements are sorted and partitioned once between structural edits, rotated world bounds are cached per placement and used for viewport rejection, and treated foreground frames share the runtime sprite-treatment helper. Generated perimeter guides and labels are suppressed unless selected. Full JSON serialization is deferred until interaction pauses instead of running on every pan or drag redraw. A UI-only checkbox hides generated perimeter records without deleting or changing exported level data. The generator now treats authored spacing as a maximum: actual step distance is reduced according to the chosen asset's tangent coverage, with denser floor/ceiling overlap than side walls.

Revision 141 tunes the cave foreground toward its intended cutaway-window look. New cave records default to 1.1 parallax. Generated sprites are centred 8–14% of their normal depth inside the authored spline, then use a broad smootherstep-style fade from 5% to 92% of their inward-to-outward span, leaving a fully black outer cap for the mask handover. Smooth spline controls retain Catmull-Rom-like direction but clamp each Bezier handle to 45% of the shorter adjacent segment. This prevents the very long straight runs of a wide world-bounds starter loop from pulling short rounded-corner segments into self-intersecting curls.

Revision 142 restores the automatic perimeter-decoration scale default to 2×. **Create from world bounds** now places eight smooth tangent points around, rather than inside, the technical bounds. The straight runs sit 96 world pixels outside each side and the rounded corner curves join around the original corners without entering the declared area or crossing themselves.

## Enemy strategy and navigation boundary

Revision 115 introduces an explicit enemy strategy layer. `simple_patrol` preserves the earlier local patrol/attack behaviour, `sentry` remains stationary until a target enters awareness range, and `hunter` owns a portable state machine with `patrol`, `pursue`, `position_for_attack`, `jump`, `drop`, `investigate_last_seen`, `unreachable_glare`, `return_home`, and `stranded_patrol` states.

Navigation is deliberately platform-oriented rather than a generic polygon navmesh. `src/core/enemy-navigation.js` extracts upward-facing support intervals from authored collision segments and solid tops, removes floor intervals obstructed by closed collision geometry, and retains obstacle footprints so vertically overlapping tops are entered from a clear side rather than from beneath. It creates directed edges for steps, single jumps, and controlled drops, and rejects edges that exceed the enemy's run speed, jump height, gravity, maximum fall distance, or body-access requirements. Route cost includes the walk from the current position to the launch point. Revision 118 adds physics-guided run-up candidates and trial-runs each jump at the same fixed-step split-axis cadence used by runtime, using the actor's full collision width rather than a narrower navigation proxy. Revision 119 applies the same principle to walk-off drops: launch points sit at the source edge and the chosen horizontal velocity must clear the source obstacle before the actor descends beside its wall. Runtime traversal then uses the same shared swept actor collision queries as Ignatius for solids, segments, and polygons, so an NPC cannot fall through ordinary ground or pass through a pillar merely because a graph edge predicted it. Revision 129 extends this to lower separated supports with deliberate downward-jump candidates that clear the source wall before descent, and adds a takeoff-clearance cost so feasible early launches outrank wall-hugging alternatives. A valid full-body landing on a neighbouring support is treated as a recoverable topology observation: simulation snaps to that support's usable interval and replans rather than declaring the edge failed. Revision 130 tightens endpoint validation so a destination support exempts collision only while the actor centre is over that exact support, not merely touching another wall on the same polygon. Upward candidates require stable majority overlap at first contact rather than complete body containment, which preserves full-body wall clearance while allowing slower actors to land near the edge of narrow tops. Revision 131 sizes downward-jump run-ups from the required acceleration distance plus a small stability margin, avoiding a theatrical trek across an entire narrow ledge when only a modest launch speed is needed. Upward obstacle-clearing jumps retain the longer body-width run-up. Revision 133 adds true ledge-walk-off edges for broad lower floors that overlap the source horizontally. The baker tests both source obstacle edges, requires a full-body landing interval beyond the wall, and gives the edge gravity-only initial vertical motion. Runtime temporarily exempts only the complete source polygon/segment set during a bounded departure window, then returns immediately to ordinary swept collision for the fall and landing. The current goblin archetypes allow controlled falls up to 600 pixels, which covers the authored left-step descent in `level_001` without turning arbitrary bottomless falls into routes. Revision 134 makes grounded body-occupancy probes slope-aware. The actor still follows the authored support at its foot point, but the non-physical clearance rectangle raises its lower edge by the terrain rise across half the probe width. This prevents a downhill segment of the same blockable polygon from being mistaken for a wall while retaining ordinary polygon, segment, and solid blocking above the support.

Hunters remember their original support and patrol interval. Planning first tries to reach the wizard's step-connected support region. Ranged hunters only fall back to another support when that region is genuinely unreachable; the fallback search validates the actual authored projectile origin and either the direct fireball path or solved ballistic musket-ball arc. Once an engaged hunter loses current cone contact, it records no new hidden information: it keeps the last genuinely seen player foot position and immediately continues an already selected route or begins routing to the reachable support point with the smallest remaining world-space distance to that position. The awareness-hold timer keeps the engagement alive and delays glare/give-up, but does not impose an idle pause. Glare begins only after the remembered point is reached, no closer route exists, and the hold has expired. If the original support cannot then be reached, the enemy adopts the reachable support as a bounded temporary patrol and periodically retries the home route. This fallback is deterministic and visible; no enemy despawns merely because it made an unfortunate jump.

Movement capability and behaviour flavour are enemy-archetype/runtime data, not character-art data. The enemy catalog and level entity may author `strategy`, `walkSpeed`, `runSpeed`, `jumpHeight`, `jumpGravity`, `maxFallDistance`, `awarenessRange`, `awarenessViewHalfAngle`, `unreachableGlareDuration`, `routeRepathInterval`, and `homeRetryInterval`. Awareness is independent of collision geometry: blockable and walkable level shapes may obstruct movement or an actual attack, but they do not hide Ignatius. First notice is controlled only by radial distance and the monster's facing cone, which currently defaults to ±60 degrees in the enemy catalog. Older `behavior` and `chaseSpeed` inputs are normalized once into `strategy` and `runSpeed`; current authored data and runtime state do not retain them. Legacy `awarenessVerticalRange` is ignored and discarded. Character JSON remains concerned with rig, animation, and projectile handoff, preserving the presentation/gameplay boundary.

## Enemy Puppet Guide boundary

Revision 126 adds an off-by-default game-view Puppet Guide for enemies. It is presentation-only and may visualize the movement body, projectile hurtbox, awareness cone, melee or ranged attack window, target anchor, patrol span, remembered last-seen position, route, and current AI state. The toggle lives in `gameState.debug.showPuppetGuide`; it must not alter simulation decisions.

Exact collision rectangles shared with gameplay come from `src/shared/actor-geometry.js`. `src/core/simulation.js` uses the same helpers for projectile impacts and melee reach that `src/presentation/canvas-renderer.js` uses for the overlay. Awareness and route visuals read authoritative enemy state but remain diagnostic drawings.

## Character rig ownership boundary

A rig JSON file is the sole authority for its parts, pivots, anchors, draw order, setup offsets, scale, and tags. Character definitions reference one rig and may map animation slots or select an active projectile part, but they do not patch rig geometry. Variants that require different pivots or setup data use distinct numbered rig files, even when they reuse the same atlas. Puppet Forge and the browser runtime both load the referenced rig directly, so saved pivot values cannot be silently replaced by character data.

## Character ground and editor-guide boundary

Generic runtime characters use local `y = 0` as their support line. Enemy world `y` therefore remains the actual terrain contact coordinate, and the runtime does not carry a goblin-specific vertical correction. Revision 113 bakes the goblin correction into authored rig-space data instead: rig anchors and setup offsets, animation reference poses, and all Y tracks move together in each affected rig project. Projectile release transforms move with the same translation, preserving hand-to-projectile alignment and release timing.

Puppet Forge renders a cyan `GROUND · y = 0` guide in the animation workspace. Its draggable label changes only `viewPanY`, making it a presentation convenience rather than an authoring transform or gameplay field.

## Animation-authored projectile handoff boundary

Revision 112 keeps authored projectile preparation in character data without moving gameplay into the renderer. Rig parts may carry a `projectile` descriptor with `id`, `launchType`, `animationSlot`, and explicit `releaseTime`; a character sharing that rig selects its active projectile through `projectilePart`. `character-runtime.js` validates that descriptor and samples the projectile part's rig-space transform at release. `game-bootstrap.js` converts loaded projects into plain combat profiles and passes those profiles into the portable simulation. The core uses the sampled local origin plus enemy facing/scale, chooses deterministic launch physics, owns projectile state and collision, and emits firing/impact events. The renderer only hides the still-rigged sprite after handoff and draws the simulation-owned projectile.

The explicit release time is authoritative. The editor displays the selected projectile part's final key time only as an authoring aid, because recoil and recovery keys may continue after launch and the artist may deliberately release before or after a part's final positional key.

## Player homing-target selection boundary

Homing-target priority is simulation-owned. At rocket launch, the core partitions active enemy targets by Ignatius's facing half-plane, chooses the nearest target on the forward side, and consults targets behind him only when the forward set is empty. Distance is measured from the rocket launch point rather than level-authoring order. A live projectile retains its current active target; the same priority function is used only when a replacement target is required.

## Moving-platform runtime boundary

Revision 148 adds optional `movement` data to ordinary collision-bearing atlas placements. `src/shared/moving-platform-data.js` owns the versioned schema, safe defaults, normalization, and relative endpoint calculation. The authored placement remains the start position; `endOffsetX` and `endOffsetY` move with it, preventing routes from being accidentally left behind when a platform is repositioned. The default is an automatic `shuttle` at 120 pixels per second with a 0.75-second pause at both start and end.

`src/core/simulation.js` converts these records into deterministic kinematic state machines and updates them before actors. The first slice supports automatic or rider activation and three patterns: `shuttle`, `loopRespawn`, and `vanishRespawn`. A rider standing on a moving platform is carried by the platform's exact frame delta through an authoritative support ID. Collision geometry moves with the visual, detaches as soon as fading begins, and is restored only after fade-in completes. Every vanishing pattern has a normalized positive `hiddenDuration` and automatically returns to its start position; authored levels must never require the player to die merely to restore a platform.

Dynamic platform geometry is deliberately excluded from the baked enemy navigation graph. Enemies may collide with it, but the current planner does not intentionally route across changing supports. Signal-channel activation, switch/keyhole emitters, enemy carrying, crushing rules, and the gameplay death boundary beyond the cave's full-black guide remain later phases rather than hidden presentation behavior.

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

A jump edge is no longer only an airborne parabola. `src/core/enemy-navigation.js` may attach `runUpX`, `runUpY`, `runUpDistance`, `requiredLaunchSpeed`, and `groundAcceleration` to a jump transition. Those fields form a committed traversal contract: simulation approaches the run-up point, accelerates along the source support toward `launchX`, and starts the authored ballistic edge only at takeoff. Search cost begins at `runUpX`, not `launchX`. A baked edge is invalid if the source support cannot provide the physical acceleration distance or if the full-body run-up corridor intersects static blocking geometry. Revision 129 may also attach `takeoffClearance`; it is a planning preference, not a collision exemption, and penalizes launches that leave too little body clearance from the obstacle being climbed.

The graph format is version 2. Mobility identity includes ground acceleration because changing acceleration can invalidate otherwise identical jump edges. Older graphs may still be read structurally, but they will not match a version-2 mobility key and therefore fall back to live construction or editor rebaking.

## Mounted overlay transform rule

Presentation elements mounted on a rig part must use the same final draw-command transform as that part. They must not sample the pre-presentation pose directly, because transient presentation transforms such as doorway scaling are applied after pose sampling. Revision 122 applies this rule to the rocket fuel indicator.

## Player combat-target lifecycle

Player health is a resource value, not the authoritative player lifecycle state. Simulation systems that decide whether Ignatius can be noticed, attacked, or struck must use explicit presentation/lifecycle fields such as `player.visible`, `player.combatState`, and `player.targetable`. Revision 124 deliberately keeps a visible zero-health player targetable because the project does not yet implement the complete player-death transition. When death is added, one authoritative lifecycle transition should disable targeting rather than duplicating `health <= 0` checks across AI and projectile code.

## Browser startup loading boundary

`src/browser/game-bootstrap.js` owns visible startup and level-transition loading state. The static loading surface is present in `game.html` before module evaluation, so a slow server never presents an unexplained black canvas. Startup applies the selected level before renderer creation and passes `world.atlasManifests` into `createRenderer`; environment discovery is level-authored rather than a sequential scan of speculative filenames.

`src/presentation/canvas-renderer.js` coordinates concurrent character-project and environment-atlas loading and reports normalized progress, while `src/presentation/character-runtime.js` reports the internal character definition, rig, atlas manifest, decoded image, and animation stages. The renderer owns loaded presentation resources and exposes `ensureEnvironmentAtlases` for later levels. Portable simulation remains unaware of browser progress UI and receives only the completed manifest map through `applyAtlasManifestsToWorld`.


## Cave full-black outset boundary

Revision 147 gives `caveWindow.feather` a precise authoring interpretation while preserving the existing level schema. It is the world-space distance from the authored cave-opening spline to the boundary at which the exterior must be completely opaque black. `src/shared/cave-window-data.js` owns `sampleCaveWindowOutset`, which samples the closed Bezier perimeter and constructs a winding-independent, bounded-miter offset loop. The outset is derived data and is never stored as a second editable spline.

`level-editor.html` draws the derived loop as an optional dashed guide. `src/presentation/cave-window-mask.js` consumes the same helper and restores solid black outside that loop after applying the reduced-resolution feather blur. This shared geometry prevents the editor preview and runtime mask from disagreeing about where full black begins. The outset remains presentation-only and must never contribute collision or navigation geometry.

### Revision 148 safe moving-platform foundation

Ordinary atlas placements may now opt into a normalized moving-platform component. New platforms default to the common automatic shuttle loop, moving between a start placement and relative endpoint and pausing for 0.75 seconds before each reversal. The Level Editor exposes only controls relevant to the chosen pattern, draws an interactive START-to-END route with a draggable endpoint, and keeps the endpoint relative when the start placement moves.

Portable simulation owns the kinematic state machine, translated collision geometry, rider support identity, exact player carrying, fades, despawn timing, and timed restoration. `loopRespawn` moves to its endpoint before fading and returning to the start; `vanishRespawn` fades in place as a trap. Both always restore after `hiddenDuration`, which is normalized to a positive minimum, so a vanished platform cannot permanently strand the level. Automatic and rider activation are included in this first slice. Signal channels, switches, keyholes, enemy riding, crushing, and lethal full-black traversal remain explicit follow-up work.


## Revision 149 menu, settings, and desktop-host boundary

The menu is browser UI, not gameplay state. Opening it sets the existing simulation pause flag and records the prior pause state; closing it restores that prior state. Settings data itself is plain and serializable so the portable simulation can consume the two values that currently matter: incoming damage scale and visual particle-density scale. Difficulty is intentionally centralized in `damagePlayer`; outgoing weapon damage and enemy behaviour remain unchanged. Explicit kill semantics can opt out of scaling with `bypassDifficulty`.

Rendering quality currently changes smoke-particle generation for homing-rocket trails and impact explosions. It must not alter fixed-step timing or collision. Volume sliders are persisted browser preferences. Music defaults to 10% and effects to 80%; pause muting is transient and must not rewrite those values. The synthesized classical-music system uses authored note events rather than packaged recordings, since a public-domain composition does not automatically make every performance public domain.

The Electron shell is optional. `game.html` runs unchanged in normal browsers. In Electron, `preload.cjs` exposes an immutable `electronWindow` object through `contextBridge`; the game reveals Exit to desktop and routes fullscreen through IPC. The renderer process has no Node integration and cannot access Electron directly.

## Revision 150 fullscreen policy and menu input boundary

`autoFullscreen` is a persisted browser preference, not a simulation rule. `src/browser/game-bootstrap.js` applies it at transitions between active play and pause-menu/debug-pause states. Browser Fullscreen API entry is requested only from an eligible user gesture; leaving fullscreen does not require one. Opening the menu always requests windowed mode, while resuming requests fullscreen when the preference is enabled. A manual browser FULLSCREEN/WINDOWED control remains available.

The Electron host is fullscreen-only and therefore does not expose this preference in the Settings view. Its top-right display control becomes EXIT, while the menu retains the explicit Exit to desktop action. The compatibility fullscreen IPC endpoint may report or restore fullscreen but must never create an Electron windowed gameplay mode.

Keyboard menu handling remains browser-owned. The adapter enumerates only visible, enabled controls in the active dialog view and provides wrapped traversal, slider and option adjustment, activation, and back navigation. It clears gameplay input when opening and closing the dialog so menu keystrokes cannot leak into the next simulation frame.

## Revision 151 synthesized music boundary

Level soundtrack choice is ordinary authored data: `music.version` and `music.tuneId`. `src/shared/music-data.js` owns normalization and the immutable catalog, so the Level Editor and browser runtime present the same IDs and labels. Portable simulation retains normalized music metadata in `state.world.music` but never creates audio nodes or advances musical time.

`src/browser/music-director.js` is the sole Web Audio owner. It converts note names to frequencies, maps beats through fixed or accelerating tempo, schedules short oscillator voices ahead of the audio clock, loops the selected arrangement, and routes every voice through one master gain controlled by persisted settings. Browser bootstrap selects the active tune whenever presentation-level data is synchronized and unlocks the AudioContext from pointer or keyboard gestures to comply with autoplay restrictions. Level transitions therefore change music without introducing browser APIs into `src/core/`.

The initial catalog contains original compact oscillator arrangements of public-domain compositions rather than imported performances, samples, or MIDI files. Score-source research is recorded in `MUSIC_SOURCES.md`; source notation files are not runtime dependencies.


## Revision 152 score verification and instrument profiles

Authored music events may preserve source spellings such as `E#` when they are meaningful to score review; pitch parsing maps those spellings to equal-tempered oscillator frequencies. Variable rhythmic steps and sounding durations are represented separately so a staccato quarter note advances one beat without sustaining for the entire beat. Regression coverage locks the verified opening pitch order and beat positions for Mountain King.

Browser synthesis now includes dedicated `doubleBass` and `tuba` profiles with lower filter cutoffs, slower brass attack where appropriate, and profile-specific harmonic levels. The Mountain King lead is transposed one octave down while preserving the verified intervals, and its double-bass profile reinforces the fundamental with a subharmonic instead of a bright octave harmonic. These remain presentation-only oscillator recipes. Portable simulation and level data continue to know only the stable tune ID.

## Revision 154 unified game-overlay palette

`game.html` now owns one shared deep-purple surface palette for all game-facing browser overlays. The loading card, HUD meters, help/debug panels, tuning pane, compact top-right controls, pause menu, and Settings derive their surfaces and border accents from the same root variables. The menu card is a solid dark-purple surface rather than a layered radial/repeating-linear texture, and Settings uses a related solid raised surface. This is presentation-only CSS and does not alter simulation, settings data, renderer output, or Electron boundaries.



## Revision 155 focus-safe pause audio and lower Mountain King register

The browser adapter now treats window blur and `document.visibilitychange` as pause requests. Focus loss opens the existing pause menu when possible, clears held input, applies the automatic fullscreen pause policy, and never resumes gameplay merely because focus returns. This remains browser state; portable simulation sees only its existing pause flag.

Audio muting is derived from pause/focus state rather than persisted settings. `src/browser/music-director.js` exposes a transient `setMuted` control that stops scheduled oscillators and drives its master gain to zero while preserving the configured music volume. Browser bootstrap also computes an effective sound-effects volume of zero during pause so future effect emitters share the same rule. Resuming restores the latest configured volumes. Defaults are now 80% effects and 10% music. Storage migration changes only version-2 records that still carry the former exact 60% default; other user-authored values survive normalization.

The verified Mountain King melody retains the same pitch classes and rhythm but is voiced one octave lower. The double-bass oscillator profile uses a lower cutoff and a subharmonic reinforcement, keeping the foreground line in the intended subterranean register while the tuba pulse remains underneath.


## Revision 156 signal-channel and inventory boundary

Named channels are plain portable data, not DOM events. `src/shared/signal-channel-data.js` normalizes stable channel names and lever/keyhole emitter records. `src/shared/moving-platform-data.js` stores only the selected activation mode and channel on a platform. `src/core/simulation.js` owns the channel revision counter, nearest-emitter interaction, entity-state transition, inventory mutation, optional key consumption, and listener trigger. A listener responds once per newer channel revision, so a held switch input or permanently active lever cannot retrigger every fixed step.

Collectible item state belongs to `state.pickups` plus the serializable `state.inventory.items` count map. Presentation hides an item after the core marks its pickup record collected; it does not decide collection or key ownership. The current inventory is intentionally minimal and has no HUD yet. Future inventory presentation must read this state rather than create a second browser-owned key list.

The Level Editor authors channels on both listeners and emitters and may visualize their relationship. It does not execute signal logic. During navigation baking, moving geometry remains present long enough to preserve the same segment and polygon IDs as runtime, but carries `movingPlatformId`; the shared navigation builder excludes those records. This keeps baked signatures stable while preventing hunters from planning across kinematic supports.
