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
│   │   ├── rocket-glow-cache.js
│   │   └── world-visual-cache.js
│   ├── shared/
│   │   ├── actor-geometry.js
│   │   ├── animation-data.js
│   │   ├── cave-kill-boundary-data.js
│   │   ├── cave-window-data.js
│   │   ├── cave-window-decoration.js
│   │   ├── game-settings-data.js
│   │   ├── level-color-map-data.js
│   │   ├── level-transform.js
│   │   ├── moving-platform-data.js
│   │   ├── music-data.js
│   │   ├── power-up-data.js
│   │   ├── signal-channel-data.js
│   │   └── story-reading.js
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
| `src/shared/cave-kill-boundary-data.js` | SHARED DATA / MATH | Portable derivation of the player lethal loop from the same sampled cave full-black outset, plus camera-independent polygon/actor overlap tests. It creates no collision or navigation geometry. |
| `src/shared/power-up-data.js` | SHARED DATA / MATH | Versioned power-up definitions, duration/permanence, refresh/extend/ignore stacking rules, active-effect normalization, HUD composition metadata, and deterministic rocket multipliers. |
| `src/shared/story-reading.js` | SHARED DATA / MATH | Shared character-count reading speed, start delay, and duration helpers for letters and thought bubbles. |
| `src/shared/cave-window-decoration.js` | SHARED DATA / MATH | Deterministic arc-length sampling and tagged atlas-asset selection for explicit non-colliding `caveForeground` placement records. |
| `src/browser/browser-input.js` | BROWSER ADAPTER | Keyboard, gamepad, mouse, and touch state converted into `InputFrame`. |
| `src/browser/game-bootstrap.js` | BROWSER ADAPTER | Asset and level loading, fixed-step loop, menu/settings coordination, fullscreen control, top-left DOM HUD binding, connection of input/simulation/renderer, and hydration of plain character combat profiles from loaded character projects. |
| `src/browser/game-settings-store.js` | BROWSER ADAPTER | Safe local-storage load/save for normalized game-facing settings. |
| `src/browser/electron-window-bridge.js` | BROWSER ADAPTER | Detection and normalization of the optional sandboxed Electron preload API for quit/fullscreen operations. |
| `electron/main.cjs` / `electron/preload.cjs` | DESKTOP HOST | Optional native window, secure preload boundary, desktop quit, and fullscreen IPC. No gameplay ownership. |
| `src/presentation/rocket-glow-cache.js` | PRESENTATION ONLY | One-time separable alpha dilation and Gaussian blur for wrench-coloured rocket silhouettes, cached by source sprite and tint for ordinary per-frame `drawImage` composition. |
| `src/presentation/canvas-renderer.js` | PRESENTATION ONLY | Canvas world rendering, camera presentation, rig drawing, visual effects, cave-mask composition, story overlays, and debug overlays. |
| `src/presentation/cave-window-mask.js` | PRESENTATION ONLY | Reduced-resolution reusable offscreen black cave mask, stable render keys, spline-to-screen tracing, outward feathering, and camera-relative foreground parallax. |
| `src/presentation/foreground-sprite-treatment.js` | PRESENTATION ONLY | Cached Canvas preparation for dark/desaturated cave foreground frames, world-to-local outward vectors, and a linear handover to opaque black at the sprite's exterior edge. |
| `src/presentation/character-runtime.js` | PRESENTATION ONLY | Browser-side character project loading, rig normalization, animation selection, projectile-release transform compilation, and ordered draw commands. |
| `src/presentation/level-color-map-cache.js` | PRESENTATION ONLY | Offscreen Canvas generation and image-pixel application for cached environment-atlas recolouring. |
| `src/presentation/world-visual-cache.js` | PRESENTATION ONLY | Cached static-layer partitioning/sort keys, conservative rotated world bounds, parallax-aware viewport bounds, and Canvas draw rejection helpers. |
| `src/tools/character-editor/*` | EDITOR ONLY | Reusable Puppet Forge project, animation, atlas, dirty-state, view, and dopesheet operations. |
| `tests/testbench.mjs` | TEST ONLY | Headless simulation tests, data tests, source-boundary checks, and browser-entry integration checks. |




## Cave-window presentation boundary

The cave perimeter is deliberately not gameplay geometry. Revision 136 adds a closed editor spline in top-level `level.caveWindow`; revision 137 turns that data into a visual opening through a foreground rock mass using a reusable offscreen black mask. It may scroll with a subtle foreground parallax offset and may occlude actors, but it must not create solids, walkable supports, hazards, navigation edges, or projectile collision. Authoritative collision and platforms remain ordinary playing-area data in the portable level definition.

`src/shared/cave-window-data.js` owns schema, decoration settings, and curve mathematics so the Level Editor and renderer share deterministic points. `src/shared/cave-window-decoration.js` samples that spline by arc length, classifies inward normals as floor, wall, or ceiling, and selects tagged atlas assets deterministically from the authored seed. It returns ordinary explicit placement records on the `caveForeground` layer; it does not mutate gameplay geometry. `src/presentation/cave-window-mask.js` owns Canvas composition, outward feathering, and camera-relative parallax anchored around the technical world bounds. Revision 211 adds one deliberately narrow gameplay use through `src/shared/cave-kill-boundary-data.js`: portable core derives a lethal player loop from the same full-black outset. That loop is a defeat threshold only. It never becomes collision, a support, navigation, projectile geometry, or an editable second spline.

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

Revision 167 adds `locomotion: "flying"` as an orthogonal movement qualifier rather than a new strategy. Portable simulation owns the deterministic horizontal patrol, vertical bobbing, target synchronization, and death fly-off distance. Flying enemies do not ground-snap, acquire moving-platform support IDs, use terrain sweeps for voluntary patrol motion, or enter the support-graph navigation system. The Level Editor preserves the authored field and exempts these records from its automatic ground snap. Rendering only suppresses the ordinary ground shadow and presents the same character-project draw commands as every other enemy.

## Enemy Puppet Guide boundary

Revision 126 adds an off-by-default game-view Puppet Guide for enemies. It is presentation-only and may visualize the movement body, projectile hurtbox, awareness cone, melee or ranged attack window, target anchor, patrol span, remembered last-seen position, route, and current AI state. The toggle lives in `gameState.debug.showPuppetGuide`; it must not alter simulation decisions.

Exact collision rectangles shared with gameplay come from `src/shared/actor-geometry.js`. `src/core/simulation.js` uses the same helpers for projectile impacts and melee reach that `src/presentation/canvas-renderer.js` uses for the overlay. Awareness and route visuals read authoritative enemy state but remain diagnostic drawings.

## Character rig ownership boundary

A rig JSON file is the sole authority for its parts, pivots, anchors, draw order, setup offsets, scale, and tags. Character definitions reference one rig and may map animation slots or select an active projectile part, but they do not patch rig geometry. Variants that require different pivots or setup data use distinct numbered rig files, even when they reuse the same atlas. Puppet Forge and the browser runtime both load the referenced rig directly, so saved pivot values cannot be silently replaced by character data.

The retained Atlas 004 and Atlas 005 bats use still-frame animation inside this existing boundary. Each isolated atlas frame is an ordinary rig part, all parts share a stable eye registration point, and a looping clip uses step-keyed alpha tracks so one part is visible at a time. Atlas 005 preserves all 22 supplied frames in authored row order. No renderer special case or second animation format is involved.

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

Dynamic platform geometry is deliberately excluded from the baked enemy navigation graph. Enemies may collide with it, while predictable shuttle endpoints are added only as runtime navigation supports. Signal-channel activation, switch/keyhole emitters, enemy carrying, and conservative player crushing are portable-core behavior. The gameplay death boundary beyond the cave's full-black guide remains a separate follow-up rather than hidden presentation behavior.

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

## Player combat-target and death lifecycle

Player health is a resource value, not the authoritative player lifecycle state. Simulation systems that decide whether Ignatius can be noticed, attacked, or struck must use `player.combatState` and `player.targetable`; `player.visible` remains a presentation gate. Revision 196 implements the authoritative transition that revision 124 reserved: any HP-zero condition enters `cover`, then `burst`, then the ordinary reset path. The transition freezes player control, disables targeting once, and prevents scattered `health <= 0` checks from leaking into AI or projectile code. During `cover` the rig remains visible beneath simulation-owned sparks. During `burst` the rig is hidden while particles continue, and reset restores `alive`, targetability, visibility, and health together.

## Browser startup loading boundary

`src/browser/game-bootstrap.js` owns visible startup and level-transition loading state. The static loading surface is present in `game.html` before module evaluation, so a slow server never presents an unexplained black canvas. Startup applies the selected level before renderer creation and passes `world.atlasManifests` into `createRenderer`; environment discovery is level-authored rather than a sequential scan of speculative filenames.

`src/presentation/canvas-renderer.js` coordinates concurrent character-project and environment-atlas loading and reports normalized progress, while `src/presentation/character-runtime.js` reports the internal character definition, rig, atlas manifest, decoded image, and animation stages. The renderer owns loaded presentation resources and exposes `ensureEnvironmentAtlases` for later levels. Portable simulation remains unaware of browser progress UI and receives only the completed manifest map through `applyAtlasManifestsToWorld`.


## Cave full-black outset boundary

Revision 147 gives `caveWindow.feather` a precise authoring interpretation while preserving the existing level schema. It is the world-space distance from the authored cave-opening spline to the boundary at which the exterior must be completely opaque black. `src/shared/cave-window-data.js` owns `sampleCaveWindowOutset`, which samples the closed Bezier perimeter and constructs a winding-independent, bounded-miter offset loop. The outset is derived data and is never stored as a second editable spline.

`level-editor.html` draws the derived loop as an optional dashed guide. `src/presentation/cave-window-mask.js` consumes the same helper and restores solid black outside that loop after applying the reduced-resolution feather blur. This shared geometry prevents the editor preview and runtime mask from disagreeing about where full black begins. Revision 211 also derives `world.caveKillBoundary` from that exact loop. Ignatius is defeated only once his complete authoritative body rectangle no longer intersects the loop. The test is fixed-step and camera-independent, and it routes into the shared spark-death/reset lifecycle. The outset still never contributes collision or navigation geometry.

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

## Revision 158 responsive thought presentation, early music attempt, and runtime lift navigation

Thought-bubble placement remains presentation-only. `src/presentation/canvas-renderer.js` anchors the artwork's known lower-left tail to Ignatius's screen-space head point, uses the shared viewport `zoom` for both artwork and typography, and reduces wrapped font size until authored text fits the usable interior. `src/core/simulation.js` only supplies story phase and a temporary camera target that leaves screen room for the bubble; it does not know atlas-frame dimensions or typography.

`src/browser/game-bootstrap.js` asks `src/browser/music-director.js` to unlock immediately after the first level frame is visible and after transition frames become visible. A rejected autoplay attempt is harmless and the existing pointer/keyboard listeners retry from a qualifying gesture. AudioContext creation, scheduling, and autoplay policy remain browser-adapter concerns.

Enemy-platform interaction is portable core state. Character enemies now retain a physical collision `supportId` separately from navigation `currentSupportId`; this lets kinematic translation carry them by the exact platform delta and lets rider activation treat player and enemy riders uniformly. Runtime navigation leaves the editor-baked static graph untouched, then adds virtual start/end supports only for predictable automatic or rider-activated shuttle platforms. Static-to-platform and platform-to-static links are deliberate `step` edges, while endpoint travel is an explicit `ride` edge. During a ride, the platform collision ID is authoritative and the hunter may reposition toward its next disembark edge. Signal platforms and disappearing patterns are not inferred by this graph augmentation. Crushing response is handled independently by portable collision recovery, and lethal cave-boundary rules remain separate.

## Revision 159 thought-tail visual anchor

`computeThoughtBubblePlacement()` treats the speaker anchor as a point just outside the bubble frame, extrapolated beyond the lower-left puff sequence. The renderer still owns this artwork-specific geometry; simulation state remains independent of atlas composition.


## Revision 162 cave perimeter coverage and entry routing

Revision 162 makes both root entry pages redirect directly to `game.html`. Cave-window creation from world bounds now produces a denser, gently irregular outside loop rather than a flat rounded rectangle. New cave points are inserted on the nearest edge between authored control points, including the closing last-to-first edge. Automatic perimeter decoration places roughly two thirds of the primary rock row inside the cave opening, then emits half-overlapped radial rows outward until artwork reaches beyond the derived full-black boundary. All generated rows remain presentation-only, collisionless, deterministic, and replaceable through the existing `generatedBy: "cavePerimeter"` contract.

## Revision 163 perimeter coverage ordering

The cave decoration generator treats the band between the editable opening and the derived Full black outset as a continuously tiled presentation region. Tangential placement and radial rows deliberately overlap rather than merely touch, and every radial stack extends past the full-opacity boundary by a safety fraction of the selected sprite depth. Placement order increases from the opening outward. Since `caveForeground` is painter-ordered, farther-out rows cover the broad bases of inward formations while leaving their inward-pointing tips visually exposed.

Revision 164 varies primary cave-perimeter penetration deterministically between 50% and 75% of each formation's normal depth. The variation is derived from the existing decoration seed and arc index, so regeneration remains stable. Radial coverage geometry and painter ordering are unchanged.

- Enemy combat awareness: player-owned projectile damage immediately alerts and engages surviving character enemies, records Ignatius's impact-time position, and forces hunter AI back into pursuit.

## Revision 168 articulated bat data

The wing parts use explicit `leftWing` and `rightWing` names but carry arm-like roles and tags so Puppet Forge can treat them as manipulable limb controls without imposing humanoid animation inheritance. Flying movement and death escape remain portable state in `src/core/simulation.js`; the character files contain only visual identity and animation mapping. The renderer's known-project list merely ensures the character is decoded before first use.

## Revision 170 enemy type defaults and bomber strategy
`character-editor.html` loads `assets/ct_enemies_001.json` alongside known enemy character projects and exposes both common type fields and the complete defaults object. Browser security means saving is an explicit JSON download rather than silent source-tree mutation. Portable bomber movement and projectile release live in `src/core/simulation.js`; catalogs select the behavior with `defaults.strategy = "bomber"` and `defaults.locomotion = "flying"`.

## Revision 171 perched bomber lifecycle
Flying enemies using `strategy: "bomber"` store their spawn point as `bomberPerchX/Y`. Their runtime state cycles between `perched`, `bomber`, and `return_to_perch`, using the same authored awareness range and view cone as grounded enemies. Dropped rocks use the normal projectile collision pipeline with the dedicated `enemyRock` kind and a procedural renderer, so no additional image asset is required.

## Revision 184 exclusive frame-part animation contract

Frame-swapped characters remain ordinary rigged character projects. A still-frame atlas sequence may stack each source frame as a rig part and animate only alpha, which preserves the shared renderer, mirroring, scaling, projectile handoff, editor loading, and future engine-port boundary. Such clips now declare `presentation.mode: "exclusive_frame_parts"` and list the participating parts in authored order. `src/shared/animation-data.js` validates that every listed part exists, has step-keyed alpha, and that exactly one listed part is visible throughout the clip. This is an animation-data invariant, not a bat renderer special case. Ordinary articulated clips continue to normalize as `presentation.mode: "rig"`. Character Editor support is operational rather than descriptive: a frame-based checkbox enables an exclusive-frame workflow, derives or edits the ordered frame-part list, owns the participating alpha tracks, and authors one-hot step keys at the playhead. Direct alpha editing is disabled for managed frame parts so the invariant cannot be broken through the ordinary track UI.

Flying locomotion and bomber strategy remain separate portable gameplay qualifiers. The visual frame-sequence contract must not contain flight AI, collision, awareness, or projectile decisions, and character-art files must not become enemy-behaviour catalogs.

## Revision 190 unified character artwork placement

Character-enemy `renderOffsetX` is a character-local offset from the gameplay hitbox anchor, so it mirrors with facing; `renderOffsetY` remains downward-positive. The hitbox itself always remains at the authoritative entity position. `src/presentation/character-runtime.js` owns the offset and render-origin calculations. Runtime and Level Editor use the same `characterArtworkOrigin()` helper, while Puppet Forge uses the same local offset helper and the same `animationPoseToRuntimeTransforms()` path as runtime. Preview zoom and Puppet Forge's display-only world scale multiply artwork, offsets, and hitbox dimensions together, preserving both aspect ratio and artwork-to-hitbox alignment in either facing direction.

## Revision 194 bomber approach and release altitude

The retained bomber still lives entirely in portable `src/core/simulation.js`. Its attack target is the authored `bomberHoverHeight` above the player, with a small screen-edge clamp, a deterministic `bomberApproachArcHeight`, persistent low-amplitude lateral wander, and arrival-speed easing. `bomberDropHeightTolerance` forms an explicit vertical release band, so horizontal alignment alone cannot trigger a rock while the bat is still climbing. The first level bakes the revised 280-unit station and matching steering values directly into its placed bat, while `ct_enemies_001.json` supplies the same defaults for newly placed bats.


## Revision 195 conservative crush-detection boundary

Moving-platform crushing is a portable collision-recovery decision, not a renderer deformation effect. `src/core/simulation.js` records each kinematic platform's exact fixed-step delta, then runs the ordinary nearest-distance depenetration rule first. A crush candidate exists only when that nearest correction would enter a distinct blocking body and the relative platform motion is closing the gap along the same axis. Farther exits, including sideways ejection, are deliberately ignored once the nearest exit is blocked.

The candidate must remain stable for three consecutive physics ticks. Tick two emits `PLAYER_CRUSH_WARNING`; if the condition clears after reaching that threshold, `PLAYER_CRUSH_NEAR_MISS` remains in the authoritative debug-event stream so regression tests can expose a last-ditch recovery instead of silently treating it as healthy behavior. A confirmed crush hides the wizard sprite, emits simulation-owned purple/yellow burst particles, pauses briefly, and then uses the ordinary player reset path. Rendering owns only the shard appearance.

## Revision 196 unified Ignatius spark-death lifecycle

All lethal player outcomes now use one portable lifecycle in `src/core/simulation.js`. `damagePlayer` enters it when HP reaches zero, the fixed-step loop also catches externally restored or assigned zero-HP states, and confirmed moving-platform crushing calls the same transition with a different cause and reset reason. The cover phase keeps the frozen rig visible and emits progressively delayed purple, yellow, and white spark records over the body. The burst transition removes those cover records, hides the rig, and emits outward-moving three-colour particles before the ordinary reset restores the player.

Presentation remains renderer-owned. `src/presentation/canvas-renderer.js` draws body-cover sparks after the player rig so they actually obscure it, while burst particles stay in the ordinary world-effects pass. Enemy awareness, attacks, and projectiles respect `player.combatState` and `player.targetable`, so zero health no longer leaves a visually dying wizard available as a combat target.


## Revision 211 portable power-up and effect boundary

`src/shared/power-up-data.js` owns effect identity, labels, timed versus permanent lifetime, refresh/extend/ignore stacking semantics, clear-on-death policy, HUD icon/glow metadata, explicit HUD display priority, and multiplicative rocket tuning. Portable state stores normalized active records under `statusEffects.active`, including remaining time, source, activation time, and refresh count, so ordinary cloning and serialization preserve effects without browser objects.

The first concrete effect is `rocketOverdrive`. It was introduced at 12 seconds in revision 211 and shortened to 8 seconds in revision 212. It refreshes to a full duration when collected again, clears on player reset after death, halves projectile-rocket fuel cost, and halves launch cooldown. It does not alter backpack boost drain or physics. `src/core/simulation.js` alone activates, advances, expires, and applies those multipliers. `src/presentation/canvas-renderer.js` reads effect metadata to tint `powerup_glow_white`, place `powerup_icon_lightning` above it, and animate the world pickup. `game.html` and `src/browser/game-bootstrap.js` present one prioritized active effect in the top-left Power bar. The Level Editor previews the same composite metadata but owns no effect behavior.

## Revision 212 power-up HUD presentation

Portable effect definitions now include a numeric `hud.priority`. `prioritizedActivePowerUpEffect` ignores expired records and selects by descending priority, then descending activation time, then stable ID. This is shared deterministic policy, not a DOM heuristic, so later browser or native HUDs can make the same choice when several effects coexist.

World pickup composition remains Canvas-owned. The active-effect timer is now part of the existing DOM HUD in `game.html`, bound from `src/browser/game-bootstrap.js`; the renderer no longer draws a second screen-space badge. Health, fuel, and Power bars are presentation-only projections of portable state and never feed values back into simulation.

## Revision 213 Speed Shot and randomized wrench arsenal

The former `rocketOverdrive` effect is now canonically `speedShot`; the shared normalizer still accepts the old ID for revision-211/212 snapshots. Speed Shot remains an independent eight-second effect with HUD priority 100, half projectile fuel cost, and half launch cooldown. The inactive Power label is now simply `Powerup:`.

Five fifteen-second wrench effects share the exclusive `wrench` group and HUD priority 50. Collecting Triple, Dart, Twin, Bigbomb, or Boomerang removes any other active wrench but leaves Speed Shot untouched. Triple launches three half-standard-damage, small homing rockets with distinct initial fan angles and separate target assignment when possible, for 45 total damage if all hit. Twin launches two two-thirds-standard-damage medium rockets, for 40 total damage if both hit. Dart launches one normal-sized, non-homing rocket straight along Ignatius's facing direction, deals standard rocket damage, and costs two-thirds standard fuel. Bigbomb costs triple fuel, travels at half speed, turns with half homing response, renders at 1.7× scale, deals triple damage, and applies full damage in a radius of 1.5 wizard heights. Boomerang uses standard rocket damage and cost; a miss or a destroyed target sends it back toward Ignatius, and a successful catch refunds half the launch fuel.

Power-up pickup runtime records now carry `respawnSeconds`, `respawnTimer`, and optional `randomEffectIds` plus `randomRollCount`. Browser startup supplies a fresh session seed, while portable core derives deterministic per-level and per-respawn rolls from that seed, pickup identity, level-load count, and roll count. All power-up pickups default to a sixty-second respawn. A random wrench rerolls before becoming available again. Level 1 keeps Speed Shot at x=800 and adds a random wrench at x=1400.



## Revision 214 cached wrench-rocket glow sprites

Wrench identity and tint are copied onto each projectile at launch so an in-flight rocket keeps the visual language of the payload that created it, even if Ignatius collects another wrench before impact. `src/presentation/rocket-glow-cache.js` reads the projectile rocket frame's alpha once per source-sprite/tint pair, expands the silhouette with horizontal and vertical sliding-window maximum passes, softens it with horizontal and vertical Gaussian passes, and writes a padded tinted offscreen surface. `canvas-renderer.js` draws that cached surface additively behind the ordinary rocket sprite. No pixel loop, blur, hue operation, or temporary surface allocation occurs during later draws of the same wrench colour. Standard and Speed Shot-only rockets do not request a glow.


## Revision 215 larger cached wrench-rocket glow sprites

`src/presentation/rocket-glow-cache.js` now applies a default `glowSizeMultiplier` of 3 when generating wrench-rocket glow sprites. This scales both the silhouette expansion radius and the blur radius before caching, producing a much broader halo without changing the per-frame renderer path. The multiplier is included in the cache key so alternate future glow scales can coexist safely.


## Revision 216 softer cached wrench-rocket halo blur

`src/presentation/rocket-glow-cache.js` now guarantees a minimum blur radius based on `sourceWidth * 0.2`, in addition to the existing scaled silhouette expansion. A wider default Gaussian sigma is derived from that blur radius so the coloured halo extends outward as a softer fuzzy aura rather than a relatively sharp rim. The cache key now includes the blur-outset fraction so future tuning variants remain isolated.


## Revision 217 exact wrench-glow colour contract

Wrench effect metadata now owns exact pure RGB tint values, copied into pickup presentation and projectile launch-time state. Canvas presentation uses normal alpha compositing for these coloured glow surfaces instead of additive blending, preventing the cached tint from being driven toward white. The rocket glow generator uses a default width-relative blur outset of 0.25 with a broader sigma. Dart carries an explicit `piercesEnemies: false` projectile contract and the ordinary first-impact explosion path remains authoritative.


## Revision 218 Boomerang return collision contract

The Boomerang return phase remains part of the ordinary portable projectile simulation. Its steering target changes to the player, but collision is never disabled. Each fixed step compares the swept player-catch impact with swept enemy, reactive-object, and terrain impacts, resolves the earliest contact, and only grants the fuel refund when the player catch occurs first. Return-path obstacle impacts use the normal explosion lifecycle and carry `boomerangReturning: true` in deterministic diagnostics.


## Revision 219 rocket damage balance contract

`DEFAULT_TUNING.rocketProjectileDamage` is now 30 and remains the single base value used when a player rocket is created. Wrench modes continue to derive projectile damage through their shared multipliers rather than duplicated absolute constants: Triple `1/3`, Twin `1/2`, Dart `2`, Bigbomb `3`, and Boomerang `1`. Enemy damage resolution clamps health to zero and marks an enemy defeated whenever `health <= 0`, so exact-zero hits are lethal without requiring negative health.


## Revision 220 canonical monster-health fallback

Sixty HP is the canonical fallback for a newly authored `characterEnemy`. Catalog defaults should normally store an explicit value, but `level-editor.html`, `character-editor.html`, and `src/core/simulation.js` all use 60 when health is omitted so tool-created and externally supplied monsters agree. Enemy-specific exceptions remain plain authored data in `ct_enemies_001.json` and are copied into level placements; no character artwork file owns combat durability. The current explicit balance is Skeleton Guard 90, Fireball Goblin 60, Musket Goblin 60, and Bombing Bat 1.


## Revision 221 multiplier-derived wrench damage rebalance

Wrench projectile damage continues to use multipliers against `DEFAULT_TUNING.rocketProjectileDamage`, currently 30. Triple uses `0.5` per projectile for three 15-damage rockets and a 45-damage maximum volley. Twin uses `2 / 3` per projectile for two 20-damage rockets and a 40-damage maximum volley. Dart uses `1.0`, so its advantage is its straight, fast, inexpensive and predictable flight rather than extra impact damage. Bigbomb remains `3.0`, and Boomerang remains `1.0`.


## Revision 222 archive repack boundary

Revision 222 is a packaging-only handoff of revision 221 and does not alter any source, runtime, data, editor, or presentation contract.


## Revision 223 Shield invulnerability contract

Shield is an ordinary normalized timed effect owned by `src/shared/power-up-data.js`, with canonical ID `shield`, five-second duration, refresh stacking, clear-on-death behavior, no exclusive group, and HUD priority above Speed Shot and wrench effects. The Shield effect must not alter rocket multipliers, movement, fuel, collision, or enemy behavior. Catalog and level entities author only normalized pickup metadata: the shield icon, shared white glow, blue tint, duration, and respawn time.

Damage authority remains in `src/core/simulation.js`. `damagePlayer` checks the active Shield through the shared effect API and blocks ordinary incoming damage before health, regeneration interruption, knockback, or post-hit invulnerability are changed. Callers that explicitly request `bypassInvulnerability` bypass both the short post-hit timer and Shield; this preserves intentionally lethal rules without adding hazard-specific Shield exceptions. Shield lifetime continues to advance through the generic status-effect update path and is serialized with the rest of portable state.

The blue flash is presentation-only. `src/presentation/canvas-renderer.js` prepares reusable blue-tinted wizard-part canvases at character load, selects them while Shield is active, and varies only overlay alpha per frame. It must not create temporary tint surfaces or process pixels in the draw loop. The Shield tint applies to all wizard parts, including the backpack rocket, and takes precedence over the low-health red tint. Neither tint affects simulation or authored character assets.


## Revision 224 grounded enemy death-on-landing contract

Ground-locomotion character enemies now separate a lethal combat result from the start of their death presentation when the hit occurs during a jump or drop. `src/core/simulation.js` records zero health immediately, removes the enemy from the homing-target pool, and marks `deathPendingLanding`, but preserves the current airborne velocity, traversal metadata, collision sweep, and non-death animation. Ordinary portable enemy air traversal remains authoritative until collision reports a landing.

On the landing tick, core clears the pending flag, zeroes residual velocity, preserves the physical support identity, and starts the full authored death duration from its beginning. The corpse therefore never freezes in a death pose in midair and never performs a second gravity-driven drop after the clip. Grounded lethal hits retain the immediate death path. Flying-locomotion enemies retain their separate fly-loop and fly-off death contract. The renderer owns no death timing or landing decision.
