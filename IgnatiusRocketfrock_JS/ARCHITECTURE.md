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
│   │   ├── hud-panel-layout.js
│   │   ├── gamepad-haptics.js
│   │   ├── game-settings-store.js
│   │   └── music-director.js
│   ├── presentation/
│   │   ├── canvas-renderer.js
│   │   ├── cave-window-mask.js
│   │   ├── character-runtime.js
│   │   ├── foreground-sprite-treatment.js
│   │   ├── level-color-map-cache.js
│   │   ├── rocket-glow-baking.js
│   │   └── world-visual-cache.js
│   ├── shared/
│   │   ├── actor-geometry.js
│   │   ├── animation-data.js
│   │   ├── auto-spawn-enemy-data.js
│   │   ├── cave-kill-boundary-data.js
│   │   ├── cave-window-data.js
│   │   ├── cave-window-decoration.js
│   │   ├── game-settings-data.js
│   │   ├── level-color-map-data.js
│   │   ├── enemy-pool-data.js
│   │   ├── level-generator-data.js
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
│   └── level-generator-themes/
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
| `src/core/simulation.js` | PORTABLE CORE | Authoritative fixed-step state, player physics, collisions, weapons, enemy strategy state machines, optional one-second off-screen enemy spawning, reactive objects, story state, level runtime conversion, serialization, and update order. |
| `src/shared/signal-channel-data.js` | SHARED DATA / MATH | Named-channel normalization and reusable lever/keyhole emitter normalization shared by editor and portable core. |
| `src/shared/moving-platform-data.js` | SHARED DATA / MATH | Versioned moving-platform patterns, activations, safe defaults, and relative endpoint calculations. |
| `src/shared/actor-geometry.js` | SHARED DATA / MATH | Shared baseline-anchored actor rectangles, enemy projectile hurtboxes, and melee reach rectangles used by simulation and debug presentation. |
| `src/shared/animation-data.js` | SHARED DATA / MATH | Animation schema normalization, sampling, interpolation, and pose blending. |
| `src/shared/level-transform.js` | SHARED DATA / MATH | Mirroring, rotation, placement geometry, hit testing, and atlas-node conversion shared by runtime and editor. |
| `src/shared/level-color-map-data.js` | SHARED DATA / MATH | Level colour-map normalization, cache keys, hue-selection mathematics, and RGB/HSL conversion without browser objects. |
| `src/shared/enemy-pool-data.js` | SHARED DATA / MATH | Shared numeric enemy-pool expression parsing for inclusive ranges and `!` exclusions, used by both automatic level generation and runtime auto-spawn authoring. |
| `src/shared/auto-spawn-enemy-data.js` | SHARED DATA / MATH | Normalized level-owned auto-spawn settings, enemy-catalog normalization, pool resolution, and construction of plain catalog-backed enemy entity records. |
| `src/shared/level-generator-data.js` | SHARED DATA / MATH | Versioned generator settings, named deterministic random streams, implementation registries, shared enemy-pool parsing, abstract route candidate generation, validation, quality selection, provenance, and generated-state normalization. It creates no Canvas objects or playable cave geometry. |
| `src/shared/game-settings-data.js` | SHARED DATA / MATH | Versioned game-facing settings defaults, preset normalization, incoming-damage scale, and visual particle-density scale without browser storage or DOM objects. |
| `src/shared/cave-window-data.js` | SHARED DATA / MATH | Inert cave-window schema normalization, decoration and gradient-noise settings, closed smooth/corner spline sampling, deterministic perturbed-outset sampling, point-insertion lookup, and authoring bounds. It contains no collision or navigation generation. |
| `src/shared/cave-kill-boundary-data.js` | SHARED DATA / MATH | Portable derivation of the player lethal loop from the same sampled cave full-black outset, plus camera-independent polygon/actor overlap tests. It creates no collision or navigation geometry. |
| `src/shared/power-up-data.js` | SHARED DATA / MATH | Versioned power-up definitions, duration/permanence, refresh/extend/ignore stacking rules, active-effect normalization, HUD composition metadata, and deterministic rocket multipliers. |
| `src/shared/story-reading.js` | SHARED DATA / MATH | Shared character-count reading speed, start delay, and duration helpers for letters and thought bubbles. |
| `src/shared/cave-window-decoration.js` | SHARED DATA / MATH | Deterministic arc-length sampling and tagged atlas-asset selection for explicit non-colliding `caveForeground` placement records. |
| `src/browser/browser-input.js` | BROWSER ADAPTER | Keyboard, gamepad, mouse, and touch state converted into `InputFrame`. |
| `src/browser/game-bootstrap.js` | BROWSER ADAPTER | Asset, enemy-catalog, and level loading; fixed-step loop; menu/settings coordination; fullscreen policy; top-left HUD and upper-right minimap binding; viewport-size projection into portable camera state; connection of input/simulation/renderer; optional haptic projection; and hydration of plain character combat profiles from loaded character projects. |
| `src/browser/hud-panel-layout.js` | BROWSER ADAPTER | Pure viewport-fit calculation for the natural-size meter panel and optional upper-right minimap. It owns no DOM, Canvas, game state, or portable simulation behavior. |
| `src/browser/gamepad-haptics.js` | BROWSER ADAPTER | Optional active-controller vibration driven from portable simulation events and current boost state. It owns no gameplay decisions and silently degrades when haptics are unavailable. |
| `src/browser/game-settings-store.js` | BROWSER ADAPTER | Safe local-storage load/save for normalized game-facing settings. |
| `src/browser/electron-window-bridge.js` | BROWSER ADAPTER | Detection and normalization of the optional sandboxed Electron preload API for quit/fullscreen operations. |
| `electron/main.cjs` / `electron/preload.cjs` | DESKTOP HOST | Optional native window, secure preload boundary, desktop quit, and fullscreen IPC. No gameplay ownership. |
| `src/presentation/rocket-glow-baking.js` | PRESENTATION ONLY | Separable alpha dilation, Gaussian blur, and padded tinted-surface construction retained for offline powered-rocket atlas preparation and deterministic kernel tests. Runtime rendering does not import this module. |
| `src/presentation/canvas-renderer.js` | PRESENTATION ONLY | Canvas world rendering, camera presentation, rig drawing, visual effects, cave-mask composition, story overlays, and debug overlays. It caches 64×64 neutral or wrench-tinted smoke stamps for scaled `drawImage` reuse and avoids per-puff impact sparkle loops. |
| `src/presentation/cave-window-mask.js` | PRESENTATION ONLY | Reduced-resolution reusable offscreen black cave mask, stable render keys, spline-to-screen tracing, deterministic wavy opacity bands inside the feather, exact full-black clamping, and camera-relative foreground parallax. |
| `src/presentation/foreground-sprite-treatment.js` | PRESENTATION ONLY | Cached Canvas preparation for dark/desaturated cave foreground frames, world-to-local outward vectors, and a linear handover to opaque black at the sprite's exterior edge. |
| `src/presentation/character-runtime.js` | PRESENTATION ONLY | Browser-side character project loading, rig normalization, animation selection, projectile-release transform compilation, and ordered draw commands. |
| `src/presentation/level-color-map-cache.js` | PRESENTATION ONLY | Offscreen Canvas generation and image-pixel application for cached environment-atlas recolouring. |
| `src/presentation/world-visual-cache.js` | PRESENTATION ONLY | Cached static-layer partitioning/sort keys, conservative rotated world bounds, parallax-aware viewport bounds, and Canvas draw rejection helpers. |
| `src/presentation/overlap-blend-cache.js` | PRESENTATION ONLY | Detection of consecutive overlapping static atlas visuals and one-time off-screen bitmap composition with a central-half transparency crossfade. Runtime and Level Editor reuse the cached bitmap through ordinary `drawImage`; collision records remain separate and unchanged. |
| `src/tools/character-editor/*` | EDITOR ONLY | Reusable Puppet Forge project, animation, atlas, dirty-state, view, and dopesheet operations. |
| `tests/testbench.mjs` | TEST ONLY | Headless simulation tests, data tests, source-boundary checks, and browser-entry integration checks. |




## Cave-window presentation boundary

The cave perimeter is deliberately not gameplay geometry. Revision 136 adds a closed editor spline in top-level `level.caveWindow`; revision 137 turns that data into a visual opening through a foreground rock mass using a reusable offscreen black mask. It may scroll with a subtle foreground parallax offset and may occlude actors, but it must not create solids, walkable supports, hazards, navigation edges, or projectile collision. Authoritative collision and platforms remain ordinary playing-area data in the portable level definition.

`src/shared/cave-window-data.js` owns schema, decoration settings, and curve mathematics so the Level Editor and renderer share deterministic points. `src/shared/cave-window-decoration.js` samples that spline by arc length, classifies inward normals as floor, wall, or ceiling, and selects tagged atlas assets deterministically from the authored seed. It returns ordinary explicit placement records on the `caveForeground` layer; it does not mutate gameplay geometry. `src/presentation/cave-window-mask.js` owns Canvas composition, outward feathering, and camera-relative parallax anchored around the technical world bounds. Revision 211 adds one deliberately narrow gameplay use through `src/shared/cave-kill-boundary-data.js`: portable core derives a lethal player loop from the same full-black outset. That loop is a defeat threshold only. It never becomes collision, a support, navigation, projectile geometry, or an editable second spline.

Foreground cave placements are presentation records drawn after actors and before the black cave mask. Runtime and editor both force manifest collision off for this layer, even when a malformed level requests collision. The renderer applies the same cave parallax and uses cached darkened/desaturated frame canvases, avoiding an expensive Canvas filter for every placement on every frame. Revision 140 moves that preparation into `src/presentation/foreground-sprite-treatment.js`, which rotates each authored world-outward vector back into sprite-local space and bakes a transparent-to-black eased multi-stop overlay into the cached frame. Generated records are marked `generatedBy: "cavePerimeter"`; regeneration replaces only those records, leaving manual foreground formations untouched. The per-sprite fade reaches black before the reduced-resolution cave mask becomes fully opaque, so the rock frame hands over continuously to unseen darkness rather than exposing sprite rectangles. The editor should warn when authoritative platforms are placed so far outside the visible opening that their gameplay purpose would be hidden.

Revision 139 adds a presentation-only performance boundary around dense cave scenery. `src/presentation/world-visual-cache.js` partitions and sorts the static visual list only when the array identity changes, precomputes conservative rotated bounds, and culls terrain, actor-front, cutout-mask, and cave-foreground records before Canvas state changes or image submission. Cave-foreground culling includes the authored parallax offset. The renderer also conservatively culls off-screen targets, pickups, enemies, smoke puffs, and projectiles, with projectile trails included in their bounds. `src/presentation/cave-window-mask.js` renders its blur at 35% linear resolution, reuses the result while all render inputs remain unchanged, and upscales during final composition. The debug panel reports renderer stage timings, real render-to-render FPS, static/dynamic draw-cull counts, foreground-cache activity, and cave-mask reuse. These caches and bounds remain useful if a later WebGL2 backend is required.

Revision 140 applies the same discipline to the Level Editor. Static placements are sorted and partitioned once between structural edits, rotated world bounds are cached per placement and used for viewport rejection, and treated foreground frames share the runtime sprite-treatment helper. Generated perimeter guides and labels are suppressed unless selected. Full JSON serialization is deferred until interaction pauses instead of running on every pan or drag redraw. A UI-only checkbox hides generated perimeter records without deleting or changing exported level data. Revision 279 removes the authored maximum-spacing field entirely. Tangential step distance is now a fixed overlapping fraction of the chosen formation's actual rendered span, with slightly denser floor/ceiling overlap than side walls. This matches the invariant that generated formations must cover continuously through the full-black boundary.

Revision 141 tunes the cave foreground toward its intended cutaway-window look. New cave records default to 1.1 parallax. Generated sprites are centred 8–14% of their normal depth inside the authored spline, then use a broad smootherstep-style fade from 5% to 92% of their inward-to-outward span, leaving a fully black outer cap for the mask handover. Smooth spline controls retain Catmull-Rom-like direction but clamp each Bezier handle to 45% of the shorter adjacent segment. This prevents the very long straight runs of a wide world-bounds starter loop from pulling short rounded-corner segments into self-intersecting curls.

Revision 142 restores the automatic perimeter-decoration scale default to 2×. **Create from world bounds** now places eight smooth tangent points around, rather than inside, the technical bounds. The straight runs sit 96 world pixels outside each side and the rounded corner curves join around the original corners without entering the declared area or crossing themselves.

## Enemy strategy and navigation boundary

Revision 115 introduces an explicit enemy strategy layer. `simple_patrol` preserves the earlier local patrol/attack behaviour, `sentry` remains stationary until a target enters awareness range, and `hunter` owns a portable state machine with `patrol`, `pursue`, `position_for_attack`, `jump`, `drop`, `investigate_last_seen`, `unreachable_glare`, `return_home`, and `stranded_patrol` states.

Navigation is deliberately platform-oriented rather than a generic polygon navmesh. `src/core/enemy-navigation.js` extracts upward-facing support intervals from authored collision segments and solid tops, removes floor intervals obstructed by closed collision geometry, and retains obstacle footprints so vertically overlapping tops are entered from a clear side rather than from beneath. It creates directed edges for steps, single jumps, and controlled drops, and rejects edges that exceed the enemy's run speed, jump height, gravity, maximum fall distance, or body-access requirements. Route cost includes the walk from the current position to the launch point. Revision 118 adds physics-guided run-up candidates and trial-runs each jump at the same fixed-step split-axis cadence used by runtime, using the actor's full collision width rather than a narrower navigation proxy. Revision 119 applies the same principle to walk-off drops: launch points sit at the source edge and the chosen horizontal velocity must clear the source obstacle before the actor descends beside its wall. Runtime traversal then uses the same shared swept actor collision queries as Ignatius for solids, segments, and polygons, so an NPC cannot fall through ordinary ground or pass through a pillar merely because a graph edge predicted it. Revision 129 extends this to lower separated supports with deliberate downward-jump candidates that clear the source wall before descent, and adds a takeoff-clearance cost so feasible early launches outrank wall-hugging alternatives. A valid full-body landing on a neighbouring support is treated as a recoverable topology observation: simulation snaps to that support's usable interval and replans rather than declaring the edge failed. Revision 130 tightens endpoint validation so a destination support exempts collision only while the actor centre is over that exact support, not merely touching another wall on the same polygon. Upward candidates require stable majority overlap at first contact rather than complete body containment, which preserves full-body wall clearance while allowing slower actors to land near the edge of narrow tops. Revision 131 sizes downward-jump run-ups from the required acceleration distance plus a small stability margin, avoiding a theatrical trek across an entire narrow ledge when only a modest launch speed is needed. Upward obstacle-clearing jumps retain the longer body-width run-up. Revision 133 adds true ledge-walk-off edges for broad lower floors that overlap the source horizontally. The baker tests both source obstacle edges, requires a full-body landing interval beyond the wall, and gives the edge gravity-only initial vertical motion. Runtime temporarily exempts only the complete source polygon/segment set during a bounded departure window, then returns immediately to ordinary swept collision for the fall and landing. The current goblin archetypes allow controlled falls up to 600 pixels, which covers the authored left-step descent in `level_001` without turning arbitrary bottomless falls into routes. Revision 134 makes grounded body-occupancy probes slope-aware. The actor still follows the authored support at its foot point, but the non-physical clearance rectangle raises its lower edge by the terrain rise across half the probe width. This prevents a downhill segment of the same blockable polygon from being mistaken for a wall while retaining ordinary polygon, segment, and solid blocking above the support.

Hunters remember their original support and patrol interval. Planning first tries to reach the wizard's step-connected support region. Ranged hunters only fall back to another support when that region is genuinely unreachable; the fallback search validates the actual authored projectile origin and either the direct fireball path or solved ballistic musket-ball arc. Once an engaged hunter loses current cone contact, it records no new hidden information: it keeps the last genuinely seen player foot position and immediately continues an already selected route or begins routing to the reachable support point with the smallest remaining world-space distance to that position. The awareness-hold timer keeps the engagement alive and delays glare/give-up, but does not impose an idle pause. Glare begins only after the remembered point is reached, no closer route exists, and the hold has expired. If the original support cannot then be reached, the enemy adopts the reachable support as a bounded temporary patrol and periodically retries the home route. This fallback is deterministic and visible; no enemy despawns merely because it made an unfortunate jump.

Movement capability and behaviour flavour are enemy-archetype/runtime data, not character-art data. The enemy catalog and level entity may author `strategy`, `walkSpeed`, `runSpeed`, `jumpHeight`, `jumpGravity`, `maxFallDistance`, `awarenessRange`, `awarenessViewHalfAngle`, `unreachableGlareDuration`, `routeRepathInterval`, and `homeRetryInterval`. Awareness is independent of collision geometry: blockable and walkable level shapes may obstruct movement or an actual attack, but they do not hide Ignatius. First notice is controlled only by radial distance and the monster's facing cone, which currently defaults to ±60 degrees in the enemy catalog. `strategy` and `runSpeed` are the only supported behaviour and pursuit-speed fields; retired `behavior`, `chaseSpeed`, and `awarenessVerticalRange` records are not migrated. Character JSON remains concerned with rig, animation, and projectile handoff, preserving the presentation/gameplay boundary.

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

Player health is a resource value, not the authoritative player lifecycle state. Simulation systems that decide whether Ignatius can be noticed, attacked, or struck must use `player.combatState` and `player.targetable`; `player.visible` remains a presentation gate. Revision 196 implements the authoritative transition that revision 124 reserved: any HP-zero condition enters `cover`, then `burst`, then `afterglow`, then the ordinary reset path. The transition freezes player control, disables targeting once, and prevents scattered `health <= 0` checks from leaking into AI or projectile code. During `cover` the rig remains visible beneath simulation-owned sparks. During `burst` the rig is hidden while particles continue. The camera then remains on the death site during `afterglow`; revision 282 reduces that hold from three seconds to two seconds. Reset restores `alive`, targetability, visibility, and health together.

## Browser startup loading boundary

`src/browser/game-bootstrap.js` owns visible startup and level-transition loading state. The static loading surface is present in `game.html` before module evaluation, so a slow server never presents an unexplained black canvas. Startup applies the selected level before renderer creation and passes `world.atlasManifests` into `createRenderer`; environment discovery is level-authored rather than a sequential scan of speculative filenames.

`src/presentation/canvas-renderer.js` coordinates concurrent character-project and environment-atlas loading and reports normalized progress, while `src/presentation/character-runtime.js` reports the internal character definition, rig, atlas manifest, decoded image, and animation stages. The renderer owns loaded presentation resources and exposes `ensureEnvironmentAtlases` for later levels. Portable simulation remains unaware of browser progress UI and receives only the completed manifest map through `applyAtlasManifestsToWorld`.


## Cave full-black outset boundary

Revision 147 gives `caveWindow.feather` a precise authoring interpretation while preserving the existing level schema. It is the world-space distance from the authored cave-opening spline to the boundary at which the exterior must be completely opaque black. `src/shared/cave-window-data.js` owns `sampleCaveWindowOutset`, which samples the closed Bezier perimeter and constructs a winding-independent, bounded-miter offset loop. The outset is derived data and is never stored as a second editable spline.

Revision 278 replaces the initial revision 277 mask composition with normalized `caveWindow.gradientNoise` (`seed`, `amplitude`, and `period`). The period is authored from 10 to 500 world units and defaults to 50. `sampleCaveWindowPerturbedOutset` derives cyclic, deterministic broad-plus-detail noise along perimeter arc length while preserving the smooth authored perimeter and exact outer outset. `src/presentation/cave-window-mask.js` now builds the entire feather from at least twenty ordered perturbed opacity contours following a smoother-step opacity curve. It is exactly transparent at the opening and reaches opaque black only at the shared outset, rather than applying a smooth shadow blur that darkened too quickly and concealed the perturbation. The Level Editor restores discoverable feather wording and previews three representative opacity contours. This remains presentation-only: the full-black lethal boundary continues to consume the unperturbed exact outset.

`level-editor.html` draws the derived loop as an optional dashed guide. `src/presentation/cave-window-mask.js` consumes the same helper and restores solid black outside that loop after applying the reduced-resolution layered feather. This shared geometry prevents the editor preview and runtime mask from disagreeing about where full black begins. Revision 211 also derives `world.caveKillBoundary` from that exact loop. Ignatius is defeated only once his complete authoritative body rectangle no longer intersects the loop. The test is fixed-step and camera-independent, and it routes into the shared spark-death/reset lifecycle. The outset still never contributes collision or navigation geometry.

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

The lightning effect is canonically `speedShot`. The shared normalizer accepts current built-ins and complete explicit custom effects, but it explicitly rejects the retired Rocket Overdrive identity even when an old snapshot embeds a full definition; retired IDs and pickup types are not translated. Speed Shot remains an independent thirty-second effect with HUD priority 100, half projectile fuel cost, and half launch cooldown. The inactive Power label is now simply `Powerup:`.

Five thirty-second wrench effects share the exclusive `wrench` group and HUD priority 50. Collecting Triple, Dart, Twin, Bigbomb, or Boomerang removes any other active wrench but leaves Speed Shot untouched. Triple launches three half-standard-damage, small homing rockets with distinct initial fan angles and separate target assignment when possible, for 45 total damage if all hit. Twin launches two one-third-standard-damage medium rockets, for 20 total damage if both hit; those rockets phase through ordinary level and reactive-obstacle geometry while still colliding with enemy targets. Dart launches one normal-sized, non-homing rocket straight along Ignatius's facing direction, deals standard rocket damage, and costs two-thirds standard fuel. Bigbomb costs triple fuel, travels at half speed, turns with half homing response, renders at 1.7× scale, deals triple damage, and applies full damage in a radius of 1.5 wizard heights. Boomerang uses standard rocket damage and cost; a miss or a destroyed target sends it back toward Ignatius, and a successful catch refunds half the launch fuel.

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

Shield is an ordinary normalized timed effect owned by `src/shared/power-up-data.js`, with canonical ID `shield`, ten-second duration, refresh stacking, clear-on-death behavior, no exclusive group, and HUD priority above Speed Shot and wrench effects. The Shield effect must not alter rocket multipliers, movement, fuel, collision, or enemy behavior. Catalog and level entities author only normalized pickup metadata: the shield icon, shared white glow, blue tint, duration, and respawn time.

Damage authority remains in `src/core/simulation.js`. `damagePlayer` checks the active Shield through the shared effect API and blocks ordinary incoming damage before health, regeneration interruption, knockback, or post-hit invulnerability are changed. Callers that explicitly request `bypassInvulnerability` bypass both the short post-hit timer and Shield; this preserves intentionally lethal rules without adding hazard-specific Shield exceptions. Shield lifetime continues to advance through the generic status-effect update path and is serialized with the rest of portable state.

The blue flash is presentation-only. `src/presentation/canvas-renderer.js` prepares reusable blue-tinted wizard-part canvases at character load, selects them while Shield is active, and varies only overlay alpha per frame. It must not create temporary tint surfaces or process pixels in the draw loop. The Shield tint applies to all wizard parts, including the backpack rocket, and takes precedence over the low-health red tint. Neither tint affects simulation or authored character assets.


## Revision 224 grounded enemy death-on-landing contract

Ground-locomotion character enemies now separate a lethal combat result from the start of their death presentation when the hit occurs during a jump or drop. `src/core/simulation.js` records zero health immediately, removes the enemy from the homing-target pool, and marks `deathPendingLanding`, but preserves the current airborne velocity, traversal metadata, collision sweep, and non-death animation. Ordinary portable enemy air traversal remains authoritative until collision reports a landing.

On the landing tick, core clears the pending flag, zeroes residual velocity, preserves the physical support identity, and starts the full authored death duration from its beginning. The corpse therefore never freezes in a death pose in midair and never performs a second gravity-driven drop after the clip. Grounded lethal hits retain the immediate death path. Flying-locomotion enemies retain their separate fly-loop and fly-off death contract. The renderer owns no death timing or landing decision.


## Revision 225 planning boundary

Revision 225 changes no runtime, simulation, renderer, data-normalization, or editor behavior. It advances the visible build label and records the next architecture sequence in `PLAN.md` and `IMPLEMENTATION_CHECKLIST.md`: portable Score and treasure first, weak standard-projectile splash, authored thought/boss/water systems, then an editor-only deterministic Automatic Level Generator whose output is baked into ordinary level records. Generated endpoints must use explicit `doorSupport` asset metadata because arbitrary thin platforms are not visually valid door foundations.


## Revision 226 Score and treasure-chest contract

`src/core/simulation.js` owns authoritative non-negative integer `score` state. `addScore` is the only ordinary award path and emits deterministic `SCORE_CHANGED` diagnostics containing the previous value, new value, and delta. Score remains part of the portable snapshot, survives ordinary player reset and level application, and is never derived from browser DOM or renderer state. A genuinely new simulation state or explicit full-level restart begins at zero.

Treasure chests remain ordinary level-editor entities. Runtime normalization identifies chest-like records, copies their authored `scoreValue`, `collectionDistance`, and loot-display duration into portable chest state, and explicitly excludes their visual bounds from collision. The fixed-step proximity test treats uncollected `openLoot` as the authored starting state, awards its Score exactly once, then advances it to `openEmpty`. The corresponding world entity visual state is updated from portable state so save/restore and deterministic replay preserve the opened chest.

Browser HUD presentation reads `story.levelTitle` and portable `score` to render `Level N: <title>` and `Score: N` above the Health bar. The renderer may consume `SCORE_CHANGED` to create a temporary floating `+N`, but that animation is presentation-only. Level 1's authored title is `The Introductory Cave of Training`, and its initial test chest awards 100 Score.


## Revision 227-228 chest presentation and editor grid contract

The normal chest state pair is `openLoot` to `openEmpty`. Both atlas frames use identical cutout dimensions and the entity defaults to a compact 72 by 84 world-unit footprint. The separate closed artwork remains catalogued but is deliberately excluded from normal state progression because its perspective is not pixel-compatible with the open pair.

The Level Editor initializes Snap to 16 world units and uses 16 as the grid fallback. Level 1 places the demonstration chest on `exit_ground` at a 16-unit-aligned coordinate, providing a thick, visibly supported foundation beside the exit door.


## Revision 229 preload and haptic projection contract

Wrench projectile glows remain presentation-only cached surfaces. `createRenderer` reserves the final portion of startup progress for `RocketfrockRenderer.prewarmWrenchRocketGlows`, which enumerates the shared wrench effect registry, resolves the already-loaded projectile frame, and populates `RocketGlowCache` before gameplay begins. Rendering still calls the same cache lookup, so startup and draw-time keys cannot drift.

Revision 230 superseded this runtime cache contract with authored combined frames in `ct_atlas_wizard_2`. Current startup only verifies those supplemental atlas frames, and each powered rocket is drawn once from the authored combined sprite. Revision 283 removes the now-unused cache class and renames the remaining offline kernel utility to `rocket-glow-baking.js`.

Input-device ownership belongs to `src/browser/browser-input.js`. Meaningful mapped gamepad button or deadzone-cleared axis activity records the active pad index. A three-second grace window supports damage feedback between control presses, while fresh keyboard or pointer gameplay input revokes gamepad ownership immediately. The portable simulation neither queries controllers nor requests vibration.

`src/browser/gamepad-haptics.js` consumes deterministic `PLAYER_DAMAGED`, `ROCKET_LAUNCHED`, and `PLAYER_BOOST_STARTED` events plus the portable `attachedBoosting` state. Events are marked consumed even while haptics are inactive, preventing stale pulses when the player later picks up a controller. Hover feedback is rate-limited. Browser `playEffect("dual-rumble")` is preferred with a `pulse` fallback; all failures are ignored so haptic support can never interrupt the fixed-step loop.

### Revision 233: standard projectile secondary splash

The portable projectile state now stores `secondaryEnemySplashDamage` and `secondaryEnemySplashRadius` at launch time. Standard rockets and Speed Shot populate these values from tuning; wrench projectiles store zero. Impact handling applies the splash only to enemy hitboxes, excludes the direct enemy, and emits `STANDARD_ROCKET_SECONDARY_SPLASH_APPLIED`. Presentation does not own or reconstruct this damage rule.

## Revision 234 generator-route architecture

Automatic Level Generator 0 is a shared-data foundation plus an editor projection. Portable generator contracts live in `src/shared/level-generator-data.js`; theme choices live in `assets/level-generator-themes/*.json`; and `level-editor.html` supplies controls, history guarding, status text, and the route overlay. The simulation and runtime renderer do not import the generator and do not interpret the abstract graph as collision or navigation.

Randomness is divided into stable named stage streams. Adding or regenerating a later stage must not perturb the route stream or unrelated stages. Route generation evaluates a deterministic candidate set and selects by validation and quality rather than accepting the first graph. Provenance records generator ID/version, seed, selected attempt, implementation IDs, normalized settings, resolved enemy IDs, diagnostics, and a run ID.

Generated ownership is explicit. `level.generation` stores the abstract route and current run metadata, while any future materialized placement or entity must carry the matching generated ownership marker. Editor undo/redo for generation restores only generator-owned state and the generator-applied theme colour map; it must refuse to overwrite generator state that has since been changed. Clear generated must never remove manual content.

Ice theme recolouring demonstrates the presentation boundary: shared colour-map data may restrict treatment through `atlasIds`, the presentation cache receives the atlas ID, and Canvas recolouring occurs only for allowlisted environment atlases. Interactive and story atlases remain authored presentation.

Generator 1 may consume the route, but it must materialize ordinary existing cave-window, placement, entity, collision, and world-bound records. The route graph remains provenance and diagnostics, not a second runtime physics format.

## Revision 235 playable-cavern architecture

Automatic Level Generator 1 consumes the accepted abstract route and emits only ordinary existing level records. `src/shared/level-generator-data.js` builds deterministic cavern, traversal, endpoint, and world records. `level-editor.html` applies those records through the same placement, entity, cave-window, colour-map, and world-bound fields used by manual authoring. Runtime physics remains unaware of generator algorithms and sees ordinary atlas collision.

The cavern is a connected sampled envelope formed from overlapping route chambers and corridor capsules, then projected into the existing closed cave-window spline contract. Sample positions include generated support centers so a visually valid support cannot drift outside the opening between sparse route nodes. The derived world bounds and reset height surround the complete envelope rather than the abstract graph alone.

Traversal geometry is collision aware. `assets/level-generator-platforms.json` is the versioned allowlist and role catalog for generated supports. Each entry declares native dimensions, valid generation roles, scaling, surface height, door suitability, mirroring, and left/right walkable-edge insets measured from authored atlas collision. The planner measures gaps from those walkable edges, not from transparent frame rectangles or decorative overhangs. `floor_long_terrace` remains bridge-only because its top collision is split, and `ledge_small_flat` remains recovery-only because its true landing width is too narrow for a mandatory destination.

The mandatory spine is the only collision-bearing route materialized in Generator 1. Optional branch nodes and edges remain under `level.generation.route` and are copied into traversal reservation IDs for overlay and later-stage planning. This prevents purposeless branch platforms from becoming low ceilings or obstructing the guaranteed path before rewards and encounters give those detours a reason to exist.

A generation run evaluates multiple deterministic complete geometry candidates, validates cave containment, endpoint support, world bounds, authored walkable widths, transition gaps, rises, drops, and support interference, then selects the strongest valid result. Generation ownership covers placements, endpoint entities, cave data, world data, and the theme colour map. Guarded generation undo, redo, clear, and regeneration restore only the previous generator-owned shell and preserve manual records.


## Revision 236 encounter-generation architecture

Automatic Level Generator 2 adds a deterministic population stage without teaching runtime simulation about procedural generation. `assets/level-generator-enemies.json` is the versioned generation catalog. It maps existing enemy IDs to placement class, group range, difficulty cost, selection weight, difficulty and progression ranges, walkable-width needs, edge and landing clearances, headroom, patrol room, group spacing, flying spawn height, and navigation requirements. The shared generator consumes this data together with the ordinary enemy catalog; display names and DOM labels are never treated as behavior metadata.

Encounter generation uses its own named random stream, so adding or tuning population does not perturb the accepted route or cavern geometry for the same seed. A normalized difficulty budget combines route size, enemy density, difficulty, and safety. Candidate encounter anchors come from collision-bearing mandatory supports. The endpoint calm distance is at least the theme value and at least the largest selected awareness range plus the configured spawn-safety buffer.

Ground enemies are placed only when the authored walkable collision interval can supply the catalogued edge clearance, protected incoming landing strip, patrol room, and headroom. Ranged hunter enemies retain ordinary entity behavior and trigger a rebuild of the existing baked hunter navigation graphs after the generated entities are applied. The generator does not invent a parallel navigation format. Flying bombers are emitted only as compact groups of two or three, with catalogued vertical airspace and separation chosen to make the standard rocket's one-damage secondary splash tactically relevant without overlapping enemy hitboxes.

Generated population records carry the same run ownership and stage provenance as the cavern shell. Generation undo, redo, clear, and replacement snapshots include the navigation graphs that the population stage rebuilt, preserving pre-existing manually authored navigation data. Encounter diagnostics record budget, spent cost, counts by placement class, bat groups, hunter count, calm distance, and warnings.

The combined validator checks the complete playable cavern plus population. It rejects endpoint calm-zone violations, terrain-embedded or unsupported enemies, insufficient walkable room, unsafe incoming landings, flying groups outside their allowed size or airspace, excessive group overlap, and missing generated hunter navigation support. In revision 236, optional route branches remained reservations and Generator 2 populated only the mandatory cavern.


## Revision 237 reward-generation architecture

Automatic Level Generator 3 adds rewards without coupling reward choices back into route or encounter randomness. `assets/level-generator-rewards.json` is the versioned reward-generation catalog. It describes branch treasure, contextual power-ups, utility pickups, and optional narrative triggers through stable IDs, placement contexts, progression ranges, spacing, edge clearances, and per-draft limits. Branch selection uses the dedicated rewards random stream. Traversal consumes only the selected branch IDs and remains the sole owner of physical branch geometry, so reward tuning cannot silently redraw the accepted mandatory route.

A selected optional reservation becomes a lower returnable detour rather than an upper parallel shelf. The outgoing mandatory edge uses a catalogued `shaftBridge` assembly that leaves a real 116-unit collision opening. Two alternating `branchStep` footholds descend through that opening, after which broad lower supports form the reward alcove. The first foothold must fit entirely inside the shaft and leave at least one player-width side opening. The abstract merge edge remains a muted preview-only hint because materializing it as a solid platform would create an accidental ceiling over the main route. Branch transitions are recorded as ordinary traversal transitions and must validate bidirectionally.

Every materialized branch receives exactly one generated treasure chest at its authored optional-reward destination. Contextual support rewards are selected sparingly, do not repeat within one draft, stay away from endpoint chambers, and avoid generated enemies. Entrance and exit doors remain Endpoint Placer-owned rather than becoming generic reward props. Generated rewards carry run ownership, generation stage, route support, and branch provenance so clear, regeneration, undo, and redo affect only generator-owned records.

Location thoughts are opt-in. The ordinary interactive entity catalog now includes an invisible one-shot `thoughtTrigger` using the existing portable story-event path. Themes default to thoughts disabled; the Level Editor must explicitly enable them, and the reward planner may place at most one on a quiet suitable support.

The Generator 3 validator combines route, cavern, traversal, endpoint, encounter, and reward checks. It rejects missing branch shafts, shafts narrower than Ignatius, footholds without turn room, lower alcoves without broad walkable surfaces, invalid return transitions, inaccessible rewards, missing branch treasure, endpoint crowding, reward-enemy overlap, and unrequested narrative additions. The Level Editor overlay draws the real materialized support path in orange while retaining unmaterialized reservations and abstract merge hints as planning information.



## Revision 238 generator editor-refinement architecture

Generator stage revisions are portable provenance, not editor-local counters. `level.generation.stageRevisions` contains a normalized non-negative integer for every registered stage. `generatorStageStreamName` preserves the original stream name at revision zero and derives a stable revision-qualified stream only for the selected stage. Stage-specific generation pins `preferredRouteAttempt`, preventing later-stage work from changing candidate selection.

Encounter rerolls use a strict isolation fingerprint covering traversal, endpoints, cavern, world, rewards, placements, and non-encounter entities. The editor accepts only a changed encounter fingerprint whose reconstructed complete snapshot validates. Reward rerolls are allowed to rebuild reward-dependent branch traversal. `reanchorGeneratedEncounterStage` translates existing encounter entities and encounter records by the delta between old and new supports with the same stable support ID. The editor then validates the mixed snapshot before replacing any records. Active-run generated and manualized records are replaced atomically to prevent duplicate IDs.

Editor locking is an authoring guard, represented by `editorLocked`; it is not simulation state and does not pin a record across regeneration. Direct mutation paths must consult the lock. Manualization removes active `generatedBy`, run, and stage ownership and writes `manualizedFromGeneration` with the former generator, run, stage, role, support, branch, and route provenance. Shared validation recognizes this receipt as an intentional replacement and emits a warning rather than a missing-record error. Regeneration of a dependent stage must stop when such a replacement exists instead of silently consuming manual work.

`validateAutomaticLevelDraftSnapshot` is the authoritative reconstruction boundary for edited generated content. It combines current placements and entities with normalized generation metadata and reruns traversal, endpoint, encounter, and reward validation. Traversal validation compares each generated placement against its support metadata, including position, dimensions, atlas, and asset. `buildAutomaticLevelValidationOverlay` converts validation-relevant data into renderer-neutral primitives for walkable spans, transitions, calm zones, shafts, encounters, rewards, and bounds. The Level Editor draws those primitives, but the shared module owns their meaning.

The runtime remains generator-unaware. Locks, manualization receipts, stage counters, and overlays exist for authoring, provenance, validation, and deterministic reproduction. Generated output continues to be ordinary portable level records consumed by the existing simulation and renderer.

## Revision 239 generated perimeter and spatial broadphase architecture

Automatic cavern generation now owns a decoration stage instead of requiring a separate manual Populate perimeter pass. `src/shared/level-generator-data.js` invokes the existing deterministic cave-perimeter generator after route, traversal, endpoint, encounter, and reward selection. Themes opt in through `decoration.populatePerimeter`; a theme may deliberately suppress this stage through its registered decoration implementation. Generated foreground records remain inert ordinary `caveForeground` placements, carry the active generator run and `generationStage: "decoration"`, and never contribute collision, navigation, support, or route authority.

Decoration protection is geometric and applies to the complete radial sprite stack. Entrance doors, exit doors, and generated rewards use strict padded exclusion regions. Ordinary perimeter stacks may not overlap padded traversal-support regions at all. A deliberately rare occlusion-accent stack may intrude into a support region only within the configured small area allowance, currently eight percent, and must still avoid strict regions. If translating the complete stack outward cannot satisfy those constraints, the stack is omitted rather than hiding gameplay. This preserves occasional atmospheric near-occlusion while keeping the overwhelming majority of platforms and both endpoints readable.

`src/presentation/world-visual-cache.js` is the static visual broadphase. It preserves the existing global painter order but partitions the sorted main, actor-front, and cave-foreground entries into fixed X buckets whenever the visual cache is rebuilt. Each frame queries only buckets intersecting the expanded camera bounds, including the real foreground parallax offset, then retains the existing exact rotated-bounds viewport check as a second guard. Dynamic-position visuals remain outside static bins and are tested from their current bounds on every query. Renderer diagnostics distinguish spatially rejected visuals from exact per-candidate culling.

`src/core/world-collision-index.js` supplies the matching simulation broadphase for solids, segments, and collision polygons. Static records are indexed into X buckets and queried by conservative swept or occupancy bounds in hot collision paths. Moving-platform, reactive, and explicitly dynamic records remain live entries whose current bounds are recalculated for every query. Candidate results preserve source order, so the broadphase changes workload rather than collision precedence. Array replacement or length changes rebuild the WeakMap-backed index, and callers may explicitly invalidate it when needed.

Canvas 2D remains the active renderer. Revision 239 addresses the measured large-level pathology, global per-frame scans, before considering WebGL2. A renderer change should be reconsidered only after representative profiling shows that local candidate drawing, alpha composition, or fill rate remains the dominant cost after these spatial broadphases and existing caches are active.

## Revision 240 macro cavern planning and presentation validation

`macro-room-route-v2` owns the large-scale authoring plan. It selects a deterministic pattern from Z, L, valley, terrace, and rolling families, then records normalized vertical anchors and macro-room reservations before traversal geometry exists. The route remains an authoring graph, not runtime collision. `forgiving-traversal-v1` continues to be the only stage that converts that graph into ordinary collision-bearing atlas placements, splitting macro movement into conservative gaps, rises, drops, and recovery supports where needed.

`room-and-tunnel-cavern-v2` stamps an opening around each generated support. Tunnel, chamber, endpoint, and macro-room stamps use different radii. Each stamp is expanded so the complete authored support width, including its visual depth below the walkable surface, retains configured horizontal, ceiling, and floor clearance. The cave profile is the smoothed union of those stamps. Sampling uses support centres, macro-room and endpoint shoulders, and a bounded global grid; it does not create three permanent profile samples for every ordinary support. Rooms are capped at four screens by three screens.

`grounded-chamber-endpoints-v2` treats doors as chamber anchors. It seats each door through its authored floor-anchor factor on a catalogued `doorSupport`, clamps the door inside the authored walkable span, and places it toward the interior of its endpoint chamber. Presentation validation measures both floor error and distance to the cave bounds, so a technically supported but visually perimeter-adjacent doorway is invalid.

Final editor generation passes `requirePopulatedPerimeter: true`. When the theme enables `perimeter-decoration-v1`, missing decoration metadata or a zero-placement result is a generation failure rather than a suppressed optional stage. `validateGeneratedCavernPresentation` is the shared post-decoration boundary. It checks strict foreground exclusion around endpoints and rewards, support foreground coverage, platform clearances, endpoint side clearance, door floor error, macro-room existence, and the four-by-three room ceiling. `validateAutomaticLevelDraftSnapshot` reruns that validation for edited levels whenever their saved decoration stage was active.

The runtime remains unaware of macro rooms and generation stamps. It consumes the resulting cave-window points, atlas placements, entities, world bounds, and navigation graphs through existing portable schemas. The revision-239 visual and collision broadphases remain authoritative for large-world scaling.


## Revision 241 generated endpoint anchors and route rhythm

Generated portal entity coordinates are floor anchors, not sprite top-left coordinates. `buildSafeEndpoints` stores `entity.y === support.surfaceY`; presentation and runtime subtract the visual floor-anchor factor exactly once. Generator validation compares the entity anchor directly with the authored support surface.

The macro route implementation now maps Z, L, valley, terrace, and rolling families into explicit multi-phase vertical rhythms instead of applying only a small sinusoidal offset to a monotonic corridor. Mandatory nodes remain collision-buildable, while Standard, Extended, and Grand drafts receive a restrained deterministic set of automatic shuttle platforms that begin at valid static traversal positions.

## Revision 242 folded spatial-layout and contour-cavern architecture

`spatial-lane-route-v3` replaces the old interpretation of a macro route as a monotonic X sequence with small Y modulation. It has two internal passes. The topology pass owns progression order, mandatory/optional connectivity, macro-room purpose, and pattern family. The spatial-layout pass embeds that topology into world-space lanes and footprints, including true leftward mandatory edges, horizontal reversals, vertical phases, lane identity, final approach direction, and an overall aspect-ratio target. Keeping these passes inside one registered Route implementation preserves the current stage-revision contract while making their responsibilities explicit.

A macro edge is not a single jump. Spatial route nodes are no longer clamped by `mandatoryRise` or `mandatoryDrop`; those values belong to `forgiving-traversal-v1`. Traversal may split a macro edge into many ordinary atlas supports, use conservative staircases for large vertical changes, and alternate shaft landings when a nearly vertical edge would otherwise leave too little exposed landing width. Mandatory route nodes adjoining major vertical edges use shallower landing assets so a deep room-floor sprite cannot bury the next staircase. The final route phase remains a calm left-to-right approach to the exit support.

Candidate diversity is architectural rather than decorative. Each deterministic attempt receives its own macro plan, so candidate selection compares different pattern families and room allocations. Route validation records and ranks mandatory backtrack count, horizontal and vertical direction changes, longest eastward run, horizontal and vertical travel, occupied lane count, route width and height, aspect ratio, and travel expansion. Standard through Grand folded routes are invalid when they contain no mandatory leftward phase, remain too wide and shallow, or fail to occupy enough vertical lanes for the requested verticality.

`contour-cavern-v3` is the authoritative cave-envelope implementation. After traversal and endpoint placement, it expands tunnel, support, macro-room, and endpoint stamps into a low-resolution occupancy mask, retains the primary connected component, traces its boundary, and simplifies the closed polygon while rejecting self-intersecting simplifications. The resulting ordinary cave-window corner points may be non-X-monotone. A vertical line can therefore cross several separate interior ranges, preserving solid rock between stacked passages instead of opening the full distance between one global ceiling and floor.

All cave containment and vertical-clearance queries use the arbitrary polygon. `cavernVerticalRangeAt` finds every intersection interval at the requested X and selects the interval containing the relevant support or entity Y. Current cavern generation emits no top/bottom profile metadata and has no profile fallback. The runtime remains generator-unaware and consumes the resulting cave-window points, atlas placements, entities, and world bounds through existing schemas.

The actual dependency order is Route topology/spatial layout, Traversal, Endpoints, Cavern contour, Encounters, Rewards, Decoration, then Validation. This order is reflected by `LEVEL_GENERATOR_STAGE_ORDER`; it avoids the former documentation fiction in which a tight cavern supposedly existed before the supports that determine its required opening.

## Revision 243 ThePath74 route and ellipse-room cavern architecture

`the-path74-route-v4` is now the default shared Route implementation. It grows a cardinal-only protected polyline on an unbounded integer grid, starting Right, using horizontal requested leg lengths of 1–7 cells and vertical requested leg lengths of 1–4 cells. Before every committed step it validates both the candidate and one-cell look-ahead against occupancy and the eight-neighbour margin of older non-local path cells. The complete cell path and segment list remain provenance data. Ordinary abstract route nodes are emitted only at endpoints, turns, and selected room anchors, so the selected Traversal implementation remains responsible for local support realization.

The room-selection subpass numbers the route cells, labels the immediate boundary by nearest route index, and selects two to four well-separated anchors on either the path or that labelled boundary. Each room stores independent 2–4-cell horizontal and vertical semi-axes. `the-path74-contour-cavern-v4` converts those reservations into theme-scaled ellipse stamps and combines them with support, tunnel, platform-clearance, and endpoint stamps before tracing the connected occupancy contour. The runtime still receives only ordinary cave-window points, world bounds, placements, entities, and navigation records.

Revision 243 initially retained the forgiving staircase and shaft-zigzag traversal implementation while the cavern shape was stabilized. Revision-242 route and cavern IDs remain registered as legacy alternatives.

## Revision 244 spaced-platform traversal architecture

`spaced-platform-traversal-v2` is now the default Traversal implementation for both Earth and Ice themes. ThePath74 route nodes remain macroscopic authoring guides rather than a collision polyline. For a horizontal route edge, traversal selects authored landing-platform assets, distributes them between the endpoint supports, and leaves explicit collision-edge-to-collision-edge air gaps. Intermediate surfaces receive deterministic bounded Y offsets, producing local rises and drops while remaining inside the conservative jump envelope. Chamber and recovery route nodes keep broader but shallow landing surfaces where encounter capacity or endpoint readability requires them.

Mandatory vertical route edges have a stricter contract. Each climb or descent owns exactly one generated support whose placement uses an automatic `shuttle` movement with `endOffsetX === 0` and `endOffsetY` equal to the complete support-surface height difference. Two generated transition records describe boarding at the start and leaving at the end. No static intermediate support may carry that route-edge ID. This makes the moving platform the traversal mechanism rather than decorative motion layered onto a static staircase.

The Cavern stage consumes moving-platform travel as geometry input. Each vertical shuttle contributes a tall shaft occupancy stamp covering its complete motion path, in addition to the normal endpoint and support-clearance stamps. Consequently, cave contour tracing cannot close rock through the platform's destination or travel corridor. Legacy `forgiving-traversal-v1` drafts remain readable, but new `spaced-platform-traversal-v2` drafts are validated against implementation-specific metrics: moving-platform count, static vertical intermediate count, horizontal jump-gap count, minimum horizontal gap, and maximum support offset from the abstract route line.


## Revision 245 layered recovery traversal architecture

`layered-recovery-traversal-v3` supersedes revision 244 as the default Traversal implementation. ThePath74 remains an abstract macro guide. Horizontal edges are materialized as an upper sequence of static authored landing assets whose collision-edge gaps and local height changes remain validated, but whose surfaces may depart much farther from the route line. This keeps the macro route legible without turning it into a visible platform polyline.

Each suitable horizontal edge may also own one `recoveryLane` record. The lane is generated after mandatory-edge and branch-shaft geometry has stabilized. Its level supports are centred beneath upper jump gaps, so every dangerous opening in the upper sequence has collision below it. Gaps between recovery supports consequently fall beneath upper platforms rather than beneath upper gaps. Recovery supports remain optional collision geometry and are excluded from the mandatory support path; they provide a recoverable lower route without changing the authoritative progression chain.

Moving-platform visual identity is data-driven. `assets/level-generator-platforms.json` reserves `rubble_long` exclusively for the `movingPlatform` role. Mandatory vertical edges select that role but retain ordinary landing-support traversal semantics, automatic shuttle movement, and complete travel-shaft cave stamps. Static branch bridges use a separate catalog role and cannot accidentally acquire the thin moving-platform visual.

`src/shared/cave-window-decoration.js` now builds perimeter catalogs only from entries tagged `stalactite` or `stalagmite`. Floor normals select stalagmites, ceiling normals select stalactites, and side-wall normals may rotate either family. The generated foreground remains inert presentation data with the same protection, radial stacking, ownership, and fade contracts; only the admitted visual vocabulary changed.

## Revision 246 Atlas 004 platform-manifest architecture

`assets/at_atlas_004.json` is a normal environment-atlas manifest with sixteen platform objects. Each object owns a padded frame and ordinary platform metadata. The thick upper platform, `earth_long_platform_r1_a`, retains a closed sequence of `blockable` edges because its visible rock mass is intended to obstruct movement from every side. The fifteen thinner platforms expose only one inset horizontal `walkable` line, making them one-way platforms that Ignatius can jump through from below while using the existing line-collision contract without renderer or simulation special cases.

`assets/level-generator-platforms.json` version 2 registers the Atlas 004 family for static landing, bridge, route-floor, and recovery-floor selection. It does not grant the family the `movingPlatform` role; `rubble_long` remains the exclusive thin shuttle visual. `layered-recovery-traversal-v3` may increase the requested width of a horizontal intermediate support only on broad edges and within the existing maximum-width fit loop, so collision-edge gaps and transition validation remain authoritative.

Atlas loading remains placement-driven at runtime and sequentially discoverable in the Level Editor. Theme colour-map allowlists include Atlas 004 so Earth and Ice recolouring treats it consistently with the existing environment atlases.


## Revision 247 organic layered traversal

`organic-layered-traversal-v4` is the current Earth and Ice traversal implementation. It inherits the broad lower recovery lane and thin vertical-shuttle contracts from `layered-recovery-traversal-v3`, but replaces the upper platform profile with a constrained organic search.

For each horizontal macro edge, the builder chooses a small set of authored static landing assets, including Atlas 004 long platforms when a broad single landing reduces visual repetition. It then searches surface heights inside the local jump envelope. Every adjacent landing in a chain of three or more must differ visibly in Y, the complete chain must occupy a useful vertical range, and the resulting transitions must still pass the shared collision-edge gap, rise, drop, and exposed-landing checks. The abstract route is used only as a bounded envelope and provenance guide.

Ordinary mandatory route anchors may receive a small deterministic Y offset before edge realization. Intermediate supports may deviate farther, but remain bounded around the macro guide. Vertical moving-platform travel is measured between the realized support surfaces rather than the unadjusted route-node coordinates.

The validator exposes `minimumOrganicHeightDelta`, `organicSameHeightAdjacentCount`, `organicHeightDirectionChangeCount`, `longStaticPlatformCount`, and `maximumHorizontalRouteOffset`. Current-theme generation rejects any multi-platform horizontal chain with same-height neighbours or insufficient total vertical range. `layered-recovery-traversal-v3`, `spaced-platform-traversal-v2`, and `forgiving-traversal-v1` remain registered for legacy records.

## Revision 248 headless test-runner diagnostics

`tests/testbench.mjs` remains the dependency-free aggregate headless runner. It now accepts `--progress`, `--profile`, `--filter=<text>`, and `--group=<all|fast|generator>`. Progress mode prints the test name before execution so CPU-heavy generator regressions remain visibly active. Profile mode uses `process.hrtime.bigint()` and `process.memoryUsage()` only in the test layer; these diagnostics do not enter portable gameplay, browser startup, or presentation modules.

`npm test` executes all tests in one Node process and remains the release gate. `npm run test:fast` excludes the generator-heavy group, `npm run test:generator` isolates that group in a fresh process, and `npm run test:profile` reports slow tests and peak resident memory. Grouping is test-harness metadata based on stable test names and does not alter production code or test assertions.

The revision-247 timeout report was a command-wrapper timeout rather than a Node deadlock. The aggregate process exits normally after the generator regressions finish; no explicit `process.exit()` or leaked asynchronous handle is required to terminate it.

## Revision 249 longform organic traversal architecture

`longform-organic-traversal-v5` is the current Earth and Ice traversal implementation. It keeps ThePath74 and its ellipse rooms in the Route stage, then interprets each horizontal route edge as a packing problem rather than a request for evenly spaced stepping stones.

For each horizontal edge, Traversal Realization considers the fewest intermediate supports first. It budgets explicit physical gaps, authored walkable insets, and any reward-branch shaft reservation before selecting platform assets. The target width is derived from the remaining span after gap budgets, which naturally favours Atlas 004's longest fitting platform instead of choosing a short platform and repeating it. The final physical gap allocation is capped below the movement limit after collision-manifest insets are included.

Surface heights are searched independently from X placement. Every adjacent main landing must differ vertically by at least the organic threshold while remaining within rise, drop, exposed-landing, and route-envelope constraints. The abstract route Y is therefore guidance, not a collision centreline.

Recovery is a per-gap contract. Every accepted upper jump gap receives a support below its fall centre and an explicit `recoveryBacktrack` transition to the lower neighbouring main landing. The recovery support is positioned to expose enough floor for a short backtrack before the return jump. A materialized reward-branch foothold can serve as the recovery support for its reserved shaft, avoiding two platforms occupying the same fall line. Validation compares mandatory upper-gap count, registered recovery-gap count, geometric coverage, and valid return-transition count exactly.

Secondary reward perches are optional child supports of broad Atlas 004 main platforms. They sit above and partly overhang the parent so that the transition has a readable exposed landing. They are non-mandatory, bidirectionally reachable, tagged `rewardPerch`, and are eligible for contextual reward placement. The cavern occupancy pass includes main supports, complete lift shafts, recovery supports, branch geometry, and secondary perches before tracing the final contour.

Vertical route edges remain structurally separate: one thin `rubble_long` shuttle spans the complete realized surface difference, while static long-platform assets are never used as lift visuals.

## Revision 250 layered safety-network traversal architecture

`layered-safety-network-traversal-v6` is an engine-neutral traversal-realization policy in `src/shared/level-generator-data.js`. It consumes the accepted ThePath74 route graph and emits ordinary platform placements, support records, traversal transitions, moving-platform records, and validation metadata. The route graph is not rewritten and remains a loose spatial/provenance guide.

The implementation produces three explicit strata:

1. **Upper route:** long static route platforms with mandatory height changes between neighbouring jump targets.
2. **Lower recovery route:** a sloping, connected route beneath every upper horizontal gap, with one thin automatic lift back to the upper route.
3. **Tertiary recovery:** wider catch platforms below lower-route gaps, each paired with a thin return lift to the lower route.

All three strata are ordinary generated supports. Moving recovery lifts use the existing `rubble_long`-only moving-platform contract and normal shuttle movement data. Static overlap validation measures the lower surface against the rendered body bottom of the upper platform and requires 112 world units of headroom. Cavern occupancy includes all lower routes, tertiary platforms, and complete moving-lift travel envelopes before the contour is traced.

Secondary upper platforms are tagged `secondaryPlatform` and `rewardPerch`. Under v6, the Rewards stage may select those supports for treasure chests through the `secondaryPerch` context. The older branch-destination contract remains valid for legacy traversal implementations. Endpoint placement uses the left usable edge for the entrance and the inward usable edge for the exit.


## Revision 251 minimap, inward-pointing formations, and cached overlap blending

The upper-right browser HUD is now a minimap rather than a pair of textual controls. `game.html` gives the top-left meters and top-right minimap one shared width variable, while `src/browser/game-bootstrap.js` uses `ResizeObserver` to match the minimap's rendered outer dimensions to the meter panel exactly. The minimap is presentation-only: it projects the cave outline, collision supports, camera viewport, player, and exit marker from existing state. Clicking the minimap invokes the existing pause-menu path, and fullscreen remains governed by the persisted automatic policy, keyboard handling, and Electron bridge rather than a permanent HUD button.

Automatic cave-perimeter orientation is owned by `src/shared/cave-window-decoration.js`. A sampled inward normal is the preliminary tip direction. Normals within 45 degrees of straight down or straight up snap to that vertical direction; all other normals remain perpendicular to the perimeter. Rotation is derived from the authored source orientation of the chosen formation, so stalactite and stalagmite tips point into the play area and their broad bases remain outside it. This rule applies equally to editor population and automatic generator decoration because both call the same shared function.

`src/presentation/overlap-blend-cache.js` adds a presentation-only seam cache for consecutive, same-layer, static atlas visuals that overlap in world space. Each eligible group is baked once into an off-screen bitmap after atlas colour mapping. When a new member overlaps the existing composite, its alpha rises from zero to one across the central 50 percent of the overlap, centred on the overlap midpoint. Runtime and Level Editor draw the resulting bitmap once and retain separate placement and collision data for selection, editing, physics, and navigation. Moving platforms, entity-bound visuals, actor-front art, and cave foreground art are excluded from static blending.

## Revision 252 perimeter angles, aspect-fit minimap, mirrored endpoints, and Atlas 004 one-way collision

`src/shared/cave-window-decoration.js` continues to derive each formation tip from the inward sampled perimeter normal, but cardinal snapping is now deliberately narrow and symmetric. The preliminary perpendicular angle is compared with right, down, left, and up; it snaps only when the nearest cardinal lies within 20 degrees. All other angles remain perpendicular to the local perimeter. The authored downward stalactite and upward stalagmite source orientations are still compensated before the placement rotation is serialized.

The upper-right minimap keeps the exact rendered height of the top-left meter panel. `src/browser/game-bootstrap.js` computes its width from the padded level-bounds aspect ratio, so the panel contains no unnecessary horizontal letterboxing. A `ResizeObserver` follows meter-panel height changes, while normal minimap draws also re-evaluate the level aspect ratio after level transitions. The clickable menu behavior and throttled drawing remain unchanged.

Current generated endpoint supports form a mirrored pair. Traversal still selects an ordinary catalogued `doorSupport`, but the exit reuses the entrance asset and scale, forces the entrance to authored orientation, and forces the exit to `mirrorX`. Grounded endpoint placement uses the far-left usable point for the entrance and the geometrically corresponding far-right usable point for the exit. Door anchors remain exactly on the support standing surfaces.

Atlas 004 keeps ordinary manifest-driven collision. Only `earth_long_platform_r1_a` has a closed blockable silhouette; all thinner Atlas 004 objects have two standing-line nodes and one `walkable` edge. No runtime exception identifies Atlas 004 by name.

## Revision 253 smoothed contour perimeter coverage

Automatic contour caverns in `src/shared/level-generator-data.js` still originate from an occupancy-mask trace around traversal-support chambers, route tunnels, branch shafts, recovery lanes, and endpoint chambers. The trace, however, is an internal technical loop. Before it becomes `caveWindow.points`, the loop is simplified more aggressively and serialized entirely as `smooth` points so the author-facing and runtime perimeter is a curved editable spline instead of a visibly stepped orthogonal outline. The contour metadata keeps the raw traced-point count for diagnostics.

`src/shared/cave-window-decoration.js` continues to own all automatic cave-foreground placement. Revision 253 tightens presentation coverage by reducing the tangential step between neighbouring placements, especially on horizontal runs, so rotated stalactite/stalagmite stacks overlap enough to hide the full-black boundary on smooth curves. This remains presentation-only data: no collision, navigation, or gameplay geometry is created from the perimeter art.

## Revision 254 contour smoothing and simplified minimap

Automatic contour caverns still originate from an occupancy trace in `src/shared/level-generator-data.js`, but revision 254 increases the simplification budget substantially before the trace becomes `caveWindow.points`. The resulting authored/runtime perimeter is therefore a much smoother spline with far fewer control points. `src/shared/cave-window-data.js` also shortens smooth Bezier handles automatically around sharp turns, which keeps folded silhouettes readable while reducing self-crossing risk in the derived full-black outset.

`src/browser/game-bootstrap.js` keeps the minimap's panel-sizing and click-to-open-menu behavior, but the minimap rendering itself is now intentionally minimal: cave outline fill/stroke, camera rectangle, exit marker, and player marker. It no longer overlays internal yellow world-geometry guides or a textual click hint.

## Revision 255 generator registry cleanup and horizontal combat architecture

`LEVEL_GENERATOR_REGISTRIES` in `src/shared/level-generator-data.js` describes only supported editor choices. Route owns `the-path74-route-v4` (**Standard**) and `mostly-horizontal-route-v1` (**Mostly horizontal**). Cavern owns `the-path74-contour-cavern-v4` (**Standard**) and `wide-upper-contour-cavern-v1` (**Wide, upward-expanding**). Every other stage owns one **Standard** implementation. Retired IDs are not normalized or migrated; an explicit unsupported ID raises a clear error. Internal no-content sentinels remain available only to tests and deliberate stage-suppression workflows.

The mostly-horizontal route remains an engine-neutral deterministic graph. Its grid plan uses long rightward segments, a bounded number of vertical connectors, and one- or two-cell vertical lengths. `layered-safety-network-traversal-v6` detects this route contract and materializes horizontal edges with the `runAndGunGround` asset role. That role belongs only to the thick Atlas 004 blockable platform. Solid platform bodies may overlap while transitions report zero horizontal gap. Thin Atlas 004 one-way platforms carry explicit `oneWay` generation metadata and are not eligible for the overlapping ground role. Vertical connectors continue through the existing validated shuttle mechanism, so no second traversal implementation is required.

For Standard folded routes, the same traversal implementation now closes lower recovery-lane spans with overlapping recovery bridges. The bridge list is built without mutating the source lane list during iteration, preventing accidental bridge-to-old-pair comparisons and preserving deterministic painter/support order. The result is a low, mostly continuous route beneath the more demanding upper path.

`wide-upper-contour-cavern-v1` calls the same occupancy contour builder as Standard. It widens support and macro-room stamps, reduces ellipse height, shifts the room mass upward, and retains enough lower margin to satisfy authored floor-clearance validation after contour simplification. Because the variant changes only cavern parameters, it combines with either route and the same endpoint, encounter, reward, decoration, and validation stages.

## Revision 256 collision-aware ground paths and auxiliary upper rooms

Generation asset metadata now includes `collisionMode`, normalized to either `blockable` or `oneWay`. Support records preserve that value through traversal and validation. Selection calls that construct continuous run-and-gun floors or lower recovery bridges require `blockable` candidates. Validation computes rendered platform rectangles from support surface anchors, dimensions, and `surfaceYRatio`; if either member of a pair is `oneWay`, simultaneous X and Y overlap invalidates the draft. Blockable supports marked as one continuous lower-ground composition may overlap without being mistaken for a vertical headroom sandwich.

`wide-upper-contour-cavern-v1` still shares the Standard occupancy-contour builder, but it now adds two to four auxiliary room stamps selected along mandatory ground supports. Their horizontal radius is deliberately large, their vertical radius remains below the wide-variant height ceiling, and their centre is shifted upward while retaining a small floor margin. The auxiliary rooms are ordinary cavern stamps and metadata only; traversal, collision, and enemy placement remain authoritative elsewhere.

## Revision 257 current-only generator architecture

Revision 257 reduced the executable automatic generator to two route policies, two cavern policies, and one implementation for every other stage. At that revision, retired IDs still passed through a small normalization alias table while their former function bodies were already absent. Revision 258 removes that final alias layer. `buildStandardTraversal` owns both supported route realizations and carries no version tests for v1-v5 traversal algorithms.

Optional branch geometry is no longer part of the current generator architecture. Route graphs contain the mandatory progression spine, Traversal may add lower recovery networks and detached upper combat/reward perches, and Rewards selects existing `rewardPerch` supports without changing geometry. Catalog schemas therefore contain no branch-step, shaft-bridge, branch-destination, or branch-bonus entries. Older normalized records may retain inert `branchId` fields for file compatibility, but current generation never emits them.

Stage regeneration follows strict ownership. Encounter rerolls replace encounters only. Reward rerolls replace reward metadata and generator-owned reward entities only. They validate against the existing placements, cave, endpoints, and encounters rather than regenerating terrain and compensating with an encounter re-anchor pass. This removes a cross-stage dependency and makes the independent named random streams visible in the editor behavior as well as in headless generation.

## Revision 258 current-schema-only generator metadata

The automatic level generator no longer contains a compatibility layer for retired implementation IDs or branch-era generated-record fields. `normalizeGeneratorImplementations` accepts current registry IDs, current internal suppression sentinels, or omitted stages that resolve to the current defaults. Any other explicit ID is rejected. `normalizeLevelGeneration` requires the current automatic-generator identity and requires the route record to agree with the selected route implementation.

The Level Editor likewise reads only `generation`, exact current generator ownership, direct `generationRunId`, and current provenance fields. The former `automaticGeneration`, nested generation-run, broad generator-prefix, `generationBranchId`, route-node `branchId`, route-edge `branchId`, and `branchChestScore` fallbacks are removed.

## Revision 259 run-and-gun floor safety and upper-hall population

The browser minimap remains presentation-only in `src/browser/game-bootstrap.js`. It derives its world projection from the active cave and collision state, draws horizontal walkable/blockable support segments, and sizes itself to the meter panel height with a hard width cap equal to that panel. `showMinimap` is normalized and persisted through the ordinary game-settings layer; hiding the panel does not alter simulation, level data, or menu keyboard handling.

Traversal realization records platform collision mode on every generated support. Validation rejects any body overlap involving a `oneWay` support and rejects different-height overlap between static blockable supports. Equal-surface blockable overlaps remain legal for continuous ground compositions. Wide caverns may add reachable second-tier secondary supports from first-tier perches; each support remains an ordinary placement with explicit bidirectional transitions and either `combatPerch` or `rewardPerch` purpose. Encounter and reward stages consume those existing supports without mutating terrain.

Small-step traversal stays in portable simulation. The player horizontal sweep and grounded enemy support selection may resolve a higher floor only up to the actor-relative one-fifth-height threshold. The resolution adopts the raised support directly and does not synthesize a jump, while larger ledges retain normal collision blocking.

## Revision 260 transparent minimap shell and denser horizontal upper-platform coverage

The minimap overlay in `src/browser/game-bootstrap.js` remains a lightweight Canvas rendering of cave outline, authored walkable surfaces, camera box, exit, and player. Revision 260 removes the explicit background fill and relies on a transparent panel shell in `game.html`, so only the actual minimap content appears over gameplay.

In `src/shared/level-generator-data.js`, horizontal run-and-gun drafts now treat upper content density as a coverage target rather than just a small fixed perch count. Secondary-platform generation continues until it satisfies both count and approximate span coverage goals, and it biases those extra placements toward combat perches so the mostly-horizontal variant produces a sustained upper monster lane.

## Revision 261 audited upper lanes, mobile skeletons, and safe descents

`buildStandardTraversal` now has a dedicated Mostly-horizontal upper-lane subpass. It samples evenly distributed targets along the completed blockable ground run, places separate Atlas 004 one-way platforms, validates jump-through transitions in both directions, and requires their union to cover approximately 25% of the route span. This is a traversal contract rather than an encounter-side decoration, so cavern occupancy and later stages see the final geometry.

Generated upper ground encounters are accepted only when their support has a valid parent transition and the enemy uses jumping hunter navigation. `enemy_001` therefore now uses the hunter strategy with authored jump and fall parameters. Encounter validation reports stranded upper enemies explicitly.

Mostly-horizontal mandatory vertical shuttles reserve a rectangular travel envelope after both endpoint supports are known. Secondary platforms and encounter entities reject that envelope, and final traversal/encounter validation independently verifies zero intrusion. Standard folded-route lift behavior is unchanged.

`updateCameraHint` remains fixed-step simulation state, but falling now adds a bounded downward lead of up to 260 world units and blends faster while descending. Upward lead remains conservative, preserving the existing view above Ignatius during jumps.

## Revision 262 overlapping-floor navigation and two-step upper lanes

`src/core/enemy-navigation.js` now distinguishes an obstruction from a same-height floor continuation while splitting supports around blockable geometry. When an overlapping polygon begins at the same walkable height within the actor's step tolerance, it is treated as another floor piece rather than a blocker. This preserves enemy routes across the deliberately overlapping blockable platforms used by the Mostly-horizontal ground path.

`src/core/simulation.js` adds a narrow local-ground fallback for melee hunters. If Ignatius is visible and both actors are supported at the same physical height, a hunter may chase and attack through ordinary collision movement even when the navigation graph cannot currently produce a route. This does not permit blind gap crossing; normal support and horizontal collision checks still stop the enemy at real ledges and walls.

Mostly-horizontal upper content in `src/shared/level-generator-data.js` now has two layers per destination. An `upperAccessPlatform` sits within one optional jump of the ground parent. The actual `secondaryPlatform` sits another optional jump above that access step and retains its combat/reward classification. Validation requires every upper destination to reference both its ground parent and access support and enforces at least 170 world units of clear rocket-turning space between ground and the upper platform's rendered underside.

## Revision 263 launch-only homing assist

Rocket steering remains portable simulation behavior in `src/core/simulation.js`. Each homing projectile stores both its ordinary `homingStrength` and a launch-only `initialHomingStrength`. While the existing `upLaunchTimer` is positive, steering uses the larger launch value; once the timer reaches zero, the update path automatically returns to the projectile's ordinary homing strength. The timer no longer suppresses targeting, so the curve starts immediately while launch velocity remains predominantly upward.

The regression in `tests/testbench.mjs` derives one-jump height through the same fixed-step simulation, creates a platform at that exact elevation, and uses the rocket radius in its clearance assertion. This makes the launch-turn value depend on actual player and projectile geometry instead of a duplicated hand-entered distance.

## Revision 264 generated enemy terrain-clearance contract

`src/shared/level-generator-data.js` now owns a deterministic ground-enemy spawn-clearance pass. It derives visual rectangles from generated support geometry, expands unrelated platforms by a small side and vertical margin, and samples candidate group centres across the assigned support. A ground encounter is emitted only when every body rectangle clears those obstacles and all reserved moving shafts. Same-height overlapping ground pieces are exempt because they form one continuous standing surface. The encounter validator recomputes this contract from serialized support and enemy data and records `platformEnemyIntrusionCount`.

## Revision 265 flying encounter clearance and continuous-floor seams

`src/shared/level-generator-data.js` now uses full feet-anchored body rectangles for both ground and flying generated enemies. Flying groups are accepted only when every member clears platform visual rectangles, strict moving-platform shafts, and the local cavern interval. The independent encounter validator repeats the platform-clearance check for all locomotion classes.

`src/core/simulation.js` centralizes automatic step tolerance at 20 percent of actor height. The Mostly horizontal traversal continues to use only solid blockable Atlas 004 ground assets, but their generated walkable spans now overlap deeply enough to form an unmistakable continuous floor rather than a tiny collision lip.

## Revision 266 thin environment-platform collision contract

Environment atlas collision is classified by the visible depth of the authored asset, not merely by an object's broad `platform` metadata label. A thin floating platform owns exactly two standing endpoints and one `walkable` line, with no closed collision area or blockable side and underside edges. A substantial ledge, floor mass, wall, ceiling, pillar, rock formation, rubble obstacle, corner, or hazard retains at least one `blockable` edge and may retain a closed blockable silhouette.

The current one-way set consists of five Atlas 001 shallow ledge or rubble assets, four Atlas 002 horizontal floor strips, and the fifteen already-established thin Atlas 004 platforms. Atlas 003 has no one-way entries. Runtime collision remains authoritative from each placement's atlas-manifest lines. Any baked navigation graph whose level uses a reclassified asset must be rebuilt from the resulting live world supports.


## Revision 267 viewport-fitted dual menu panels

`src/browser/hud-panel-layout.js` computes a single capped scale from the current viewport, panel natural size, safe edge insets, and whether the minimap is visible. `src/browser/game-bootstrap.js` applies that scale to the top-left HUD stack before sizing the aspect-fitted minimap from the meter panel's rendered rectangle. With the minimap visible, the calculation reserves space for two natural-width panels plus a gap; when it is hidden, the meter panel immediately reclaims the released width. Very short viewports also constrain the scale vertically.

The top-left meter panel is now an accessible browser menu trigger alongside the upper-right minimap. Pointer activation is excluded from gameplay input, Enter/Space keyboard activation follows button semantics, and both surfaces project the same menu-expanded state without moving menu behavior into the simulation.


## Revision 268 level-owned automatic enemy spawning

Revision 268 adds a level-owned `autoSpawnEnemies` record with `enabled`, `probabilityPercent`, and `enemyPool`. `src/shared/enemy-pool-data.js` owns the exact numeric range/exclusion grammar shared with the automatic level generator. `src/shared/auto-spawn-enemy-data.js` owns schema defaults and conversion from the browser-loaded enemy catalog into plain entity data. The Level Editor only authors and previews those values.

The browser adapter loads `assets/ct_enemies_001.json` and projects the renderer's current virtual viewport dimensions into camera state. The portable simulation owns the one-second clock, deterministic chance and selection rolls, route-direction estimate, off-screen placement, spawn safety checks, authoritative enemy creation, immediate awareness, and cleanup. Ground enemies enter hunter pursuit with the player's current position as their last-seen location. Flying catalog types retain the flying strategy required by their locomotion but begin already alerted and engaged toward the player. Spawn positions lie 10-100 percent of one current viewport width beyond the forward screen edge, preferring the horizontal direction of the exit door and falling back to the right.

## Revision 269 route-distance reward density and one-way actor probes

`src/shared/level-generator-data.js` records `powerUpTarget` in reward-plan and reward-population schema version 3. `generatedPowerUpTargetForRoute` sums the mandatory route in progression order and uses a 5,000-world-unit default spacing. Reward density scales the result around the authored default, with a bounded multiplier so the slider remains useful without exploding pickup counts. `buildBasicRewards` fills unoccupied, non-encounter supports until the target is reached, and `validateGeneratedRewards` treats a shortfall as invalid. The target and realized count are both exposed in generator diagnostics.

In `src/core/simulation.js`, grounded enemy body occupancy distinguishes one-way support from area-blocking terrain. Green `walkable` segments participate in floor selection and downward landing, but are excluded from the rectangular torso obstruction probe used during horizontal ground movement. Blockable, damaging, and killable lines and polygons remain full-body obstacles. Airborne actor sweep logic already followed the same one-way rule, so this change aligns grounded movement with the established collision contract.

## Revision 270 exact ordinary-jump and generated-layout contracts

### Authoritative jump height in the deterministic core

`src/core/simulation.js` treats `ordinaryJumpHeight` and `gravity` as the only authored ordinary-jump parameters. `ordinaryJumpVelocity(gravity, height)` derives the internal launch velocity; state initialization no longer accepts a raw `jumpVelocity` override. During an unboosted ordinary jump, vertical displacement uses the constant-acceleration equation rather than semi-implicit Euler integration. A step that crosses zero vertical velocity is divided at the analytical apex: collision is swept upward to that exact point, `PLAYER_JUMP_APEX` is recorded, and the remaining portion is swept downward. Ceiling contact, landing, reset, and rocket boost leave the analytical ordinary-jump mode immediately. Consequently the open-air apex is exactly 200 world pixels at 30, 60, or 120 Hz while gravity remains 1,490.

`src/browser/game-bootstrap.js` exposes the authored jump height in Game Tuning rather than a timestep-sensitive raw launch velocity. Rocket launch steering remains a separate gameplay contract; its launch-only homing value is 6.7 after recalibration against the exact 200-pixel apex fixture.

### Route-scaled rewards and vertical platform separation

`src/shared/level-generator-data.js` defines `GENERATED_POWER_UP_SPACING_PX = 1000`. The reward planner computes its target from mandatory-route distance and the existing density multiplier, capped at 1.5× the default rate. The placement pass first distributes pickups across distinct safe supports, then packs additional floor-seated pickups from platform ends inward at normal reward-spacing intervals so long routes can satisfy the target without weakening endpoint, encounter, or geometry exclusions.

Power-up catalog weights are 2:1:1 for Random Wrench, Shield, and Speed Shot. Selection uses a running weighted-deficit calculation rather than independent random rolls, keeping each generated draft close to a 50/25/25 mix while remaining deterministic for its seed.

The same module defines `GENERATED_MINIMUM_VERTICAL_PLATFORM_SEPARATION = 180`. Candidate placement and independent validation reject horizontally overlapping, non-moving static supports whose walking surfaces differ by less than that amount. Generator diagnostics record the minimum realized separation. Mostly-horizontal route cells, upper access steps, destination tiers, recovery supports, and rendered-under-platform clearance all consume the same constant, preventing narrow vertical sandwiches from reappearing through a secondary placement path. Moving platforms are excluded from this static surface metric and continue to use reserved travel-shaft validation.
## Revision 271 generated-lift rider-safety contract

`src/shared/level-generator-data.js` now treats a Mostly-horizontal vertical shuttle as a moving rider corridor rather than as a thin line sampled at its endpoints. `GENERATED_MOVING_PLATFORM_RIDER_CLEARANCE` reserves 180 world units above the highest platform position, the full platform body at the lowest position, and half a wizard body beyond either side. Yellow blockable support bodies may not intersect this envelope. Green one-way support artwork may not cross the lift's visual sweep.

At a vertical junction, the route realizer opens a dedicated docking slot between the lower and upper ground sections before it materializes the horizontal chains. The complete horizontal path is built first, then the lift searches both sides and the junction slot for a boardable position whose full travel remains clear. The accepted envelope is stored as `movementShaft` and `movementSafetyEnvelope`, reserved against later upper-platform placement, and independently rechecked by validation. `movingPlatformCrushHazardCount`, `movingPlatformSweepOverlapCount`, and `movingShaftIntrusionCount` must all remain zero. Generator version 28 rejects the cavern candidate when this safety contract cannot be satisfied.

This is a generator invariant, not a request to author lethal moving-platform puzzles. Generated levels may challenge timing and navigation, but they must not intentionally crush the player or enemies.


## Revision 272 grounded reward anchors and one-way enemy descent contract

### Generated reward seating

`src/shared/level-generator-data.js` treats the interactive entity `x,y` coordinate as a bottom-center floor anchor. `normalizeRewardGenerationCatalog` therefore forces the normalized vertical offset of the `powerUp` category to zero regardless of stale catalog values. `buildBasicRewards` continues to select safe authored walkable spans and now emits power-ups with `entity.y === support.surfaceY`. `validateGeneratedRewards` independently recomputes that relation and marks a floating power-up inaccessible. `assets/level-generator-rewards.json` records zero offsets for Speed Shot, Shield, and Random Wrench pickups. Narrative thought triggers are invisible activation regions and do not participate in visual reward-spacing metrics, though they still require a distinct support and all endpoint/cavern clearances.

### One-way support ownership for monsters

`src/core/enemy-navigation.js` distinguishes a legal ledge exit from a one-way drop-through. Polygon-backed supports use their obstacle bounds as ledge edges; a bare green `walkable` segment uses its own `xMin/xMax`. Drop candidates from a `walkable` source are accepted only when marked `walkOff`, which guarantees horizontal movement toward an authored end. The baker no longer emits zero-horizontal or through-the-middle descent edges from one-way platforms.

`src/core/simulation.js` preserves this as a runtime invariant. During an airborne drop, the source support may be ignored only while a horizontally moving actor clears an actual edge. A zero-horizontal drop never receives source-support immunity, so downward collision immediately returns the monster to the green line even if stale baked data requests an illegal fall. This complements the existing grounded-body rule: one-way lines support feet from above but do not block a monster's torso while it walks underneath them.

## Revision 273 player one-way drop input and current generator defaults

### Player-only one-way descent

`src/browser/browser-input.js` exposes `dropHeld`, `dropPressed`, and `dropReleased` independently from jump and weapon input. Down/S and gamepad down hold the action. A pointer or touch gesture crossing the downward threshold also records a one-frame `dropPulse`, so a completed swipe is not lost when press, movement, and release occur between two simulation samples. Down/S may continue to serve nearby interaction prompts, but drop-through remains a separate sampled action owned by portable simulation.

`src/core/simulation.js` stores a short `player.dropThroughTimer`. Pressing or holding drop refreshes that timer while standing or falling. Player vertical sweeps and automatic step probes skip only green `walkable` lines while the timer is active; yellow `blockable` segments, closed areas, polygons, hazards, and reactive solids remain authoritative. Enemy movement never receives this option, preserving the revision-272 contract that monsters can leave a one-way support only by walking off an actual edge.

### Horizontal and Domed defaults

The current generator registry presents `mostly-horizontal-route-v1` as **Horizontal** and `wide-upper-contour-cavern-v1` as **Domed**. They are first in their registries and are the explicit defaults in both Earth and Ice theme JSON. Existing stable implementation IDs remain unchanged so generated provenance and deterministic fixtures do not require migration.

Domed cavern output version 6 adds an upward-expansion stamp for every eligible base room. Each expansion keeps the source stamp's lower edge fixed while multiplying its vertical radius by `DOMED_CAVERN_UPWARD_EXPANSION_FACTOR` (`1.5`). Consequently the extra contour volume grows upward, while the route-facing floor and reasonably flat lower perimeter retain their previous placement. When narrative thoughts are enabled, the denser reward pass reserves one eligible quiet route support before distributing pickups, then uses it only if the independent thought roll succeeds; this prevents default Horizontal drafts from consuming every valid thought location.

## Revision 274 one-way hunter descent planning

`src/core/enemy-navigation.js` now treats every lower destination from a green `walkable` source as an endpoint walk-off problem. It no longer emits downward jump arcs or overlapping downward step transitions from a one-way support. Small descents below the ordinary automatic-step threshold are also represented as gravity-driven walk-offs, preserving valid routes without ever asking a monster to pass through the line.

`src/core/simulation.js` applies the same invariant while consuming navigation. Before route search, it filters both live and baked edges so a downward transition from a green support is accepted only when it is a horizontally moving `drop` explicitly marked `walkOff`, launched at the authored endpoint and moving outward. The executor repeats that check immediately before traversal. This makes old baked graphs safe and removes the loop where a hunter repeatedly launched upward toward a player below, landed back on the source line, and selected the same invalid jump again. `assets/level_001.json` was rebaked with the corrected graph builder.

## Revision 275 input, Twin phasing, and cave-authoring defaults

Browser input now treats standard Gamepad API buttons 6 and 7 as weapon controls. Both digital `pressed` state and analog values above the trigger threshold feed the same portable held/pressed/released weapon frame as keyboard and pointer input.

The green Twin wrench profile now launches two 10-damage homing rockets. Each projectile stores `phasesThroughObstacles` at launch. Portable projectile simulation continues to sweep enemy hitboxes, but omits terrain and reactive-object impacts for phased rockets, allowing them to cross green walkable lines, yellow blockable lines, solids, and closed blocking polygons without losing their target.

New Level Editor levels keep automatic enemy spawning disabled but prefill its one-second probability at 10 percent. Runtime normalization of absent older level data remains disabled at zero percent. New cave windows use a 200-pixel full-black distance. Automatic perimeter decoration defaults to a 30-50 percent deterministic inward-coverage range, and the editor exposes its 40-percent midpoint as one configurable **Inward coverage %** control.



## Revision 276 denser generated power-ups and balanced pickup mix

Generated reward planning now targets one genuine power-up per 1,000 pixels of mandatory-route travel at the default Reward density. Density scaling remains available, with the upper multiplier capped at 1.5 so high-density Grand routes remain placeable without crowding rewards into unsafe geometry.

`assets/level-generator-rewards.json` version 2 assigns Random Wrench twice the share of Shield or Speed Shot. `buildBasicRewards` tracks the current generated counts and selects the type with the largest weighted deficit, producing approximately 50 percent wrenches and 25 percent each Shield and Speed Shot within each individual draft rather than only across a large statistical sample. Dense placement scans eligible supports from their safe edges inward and preserves ordinary reward spacing and endpoint clearance.

All three generated power-up types share the same support, edge, and progression constraints. Reward-only rerolls can therefore change pickup types without moving their slots. Rewards are resolved before encounters, and fixed non-narrative pickup-clearance envelopes are supplied to the encounter populator. Monsters avoid pickups while the encounter and reward stages retain independent deterministic random streams.


## Revision 279 perimeter density simplification

Automatic cave-perimeter decoration no longer stores or edits `decoration.spacing`. The full-black coverage contract already requires strong overlap, so a large maximum had no effect while a small maximum merely added extra density. `caveDecorationStep` now derives spacing only from rendered tangent span, making scale and asset choice the authoritative inputs. Stale `spacing` values are discarded during normalization. Both manual defaults and generated cavern output use a 2.0 asset scale.


## Revision 280 longer power-up windows

The shared built-in durations in `src/shared/power-up-data.js` are now authoritative at 30 seconds for Speed Shot and every wrench mode, and 10 seconds for Shield. Catalog defaults and the authored level-1 demonstration pickups use the same values. Collection still refreshes rather than accumulates duration, wrench effects remain mutually exclusive, Speed Shot remains independent, and Shield retains highest HUD priority.


## Revision 281 current-schema-only level cleanup

Revision 281 removes the remaining compatibility paths explicitly retained for retired level and snapshot records. Runtime and the Level Editor now recognize only `wizard_entry_door` and `wizard_exit_door`; root-level player-start fields, `magicPortal`, and plain `exit` entities are no longer migrated. Mailbox entities use only `thoughtText`. Character enemies use only `strategy` and `runSpeed`, and the old vertical-awareness field has no import path. Speed Shot uses only the `speedShot` identity and `speedShotPickup` type.

Automatic cavern records now contain the arbitrary closed polygon, stamps, rooms, bounds, and contour metadata without the old top/bottom `profile`. Every containment query uses polygon intersections. State tuning likewise accepts only `ordinaryJumpHeight` plus gravity and derives `jumpVelocity` internally. The lingering `caveWindow.decoration.spacing` property found in `assets/level_001.json` was removed. These are schema cleanups rather than player-facing gameplay changes, so current authored levels, controls, timing, damage, and the Game Manual remain unchanged.


## Revision 282 shorter post-death camera hold

The portable player-death lifecycle keeps its existing cover and burst timing, but `DEFAULT_TUNING.playerDeathAfterglowSeconds` is reduced from 3 seconds to 2 seconds. `src/core/simulation.js` remains the sole timing authority, so HP loss, crushing, and cave-boundary defeats all use the same shorter pause before ordinary respawn. The renderer and camera code require no special-case change.

## Revision 283 dead-code and release-packaging housekeeping

Revision 283 removes internal APIs that had no caller anywhere in the game, editors, tests, or build tools: the collision-index invalidation export, the aggregate cave-window default, unused generator registry/revision exports, the unused wrench-effect classifier, and historical story-reading derivation constants. Their authoritative active helpers and normalized schemas are unchanged.

The obsolete runtime `RocketGlowCache` class is removed because revision 230 already replaced runtime glow generation with authored combined powered-rocket frames in `ct_atlas_wizard_2`. The remaining separable dilation, Gaussian blur, and surface-construction helpers are renamed to `src/presentation/rocket-glow-baking.js` and are retained only for offline atlas work and deterministic kernel tests. Runtime code does not import this module. Discarded Enemy 004 candidate JSON files under `devel/old` are deleted.

`devel/package_update.py` now owns compact revision handoffs. It verifies required project files and synchronized game/editor revision labels, excludes PNG and XCF files plus generated build directories, creates the zip, and performs an integrity and forbidden-extension audit. These changes do not alter gameplay, saved-level interpretation, rendering output, controls, or editor behavior.

