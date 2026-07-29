# Ignatius Rocketfrock Architecture

## Revision 210 weighted enemy and replacement boss drop tables

Enemy loot belongs directly to authored enemy data. Character projects provide the ordinary species-wide `drops` table. A boss entity provides its own replacement `drops` table, so promoting a goblin to a boss does not also preserve the goblin coin table.

Every `drops` array is one deterministic ordered weighted choice and can emit at most one pickup. Each entry's `chance` is an absolute probability slice. A table totaling 1.0 always selects one item; a table totaling 0.6 leaves a 0.4 no-drop outcome. Reusable item presentation and reward definitions remain in `resources/items/it_loot_001.json`. Simulation owns selection and pickup creation; presentation draws the resulting atlas-backed item.

Permanent-upgrade collection also emits the portable `SCREEN_MESSAGE_REQUESTED` event. Browser Canvas/WebGL2 and SDL presentation adapters consume that event to show reusable centered notices without moving message policy into rendering code.

## Revision 204 character-owned combat audio

Character definitions may contain a `sounds` object with optional `attack`, `hurt`, and `death` WAV references. The browser and SDL character loaders preserve/resolve these fields, simulation combat events carry `characterId`, and presentation audio directors select the cue from the loaded character project. Catalogued WAV definitions may still provide shared pool volume and instance limits, but enemy events never choose a global `enemyDamage`, `enemyDeath`, `bossDeath`, or `enemyProjectile` cue directly. Puppet Forge discovers WAVs from `sound-effects.json` for URL projects and from selected `.wav` files for local workspaces.

The wizard character map uses `walk` as its ground-motion slot and declares `hurt` and `death` setup-pose slots for schema symmetry with monsters.

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
│   │   ├── webgl2-renderer.js
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
│   │   ├── enemy-pool-data.js, enemy-drop-data.js
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
│           ├── enemy-project-catalog.js
│           ├── dopesheet-data.js
│           ├── parent-constraint-data.js
│           └── reference-plate.js
├── tests/
│   └── testbench.mjs
├── resources/
│   ├── atlases/, characters/, items/, levels/
│   ├── music/, sfx/, fonts/, ui/
│   ├── generator/themes/
│   └── editor/
├── devel/
├── package.json
├── AGENTS.md
├── DEVELOPER_MANUAL.md
├── PLAN.md
├── IMPLEMENTATION_CHECKLIST.md
└── ARCHITECTURE.md
```

The root HTML files are thin browser entry points. Their larger inline editor applications are still scheduled to move into uniquely named modules under `src/tools/level-editor/`, `src/tools/asset-editor/`, and `src/tools/character-editor/`. That extraction should be performed one editor at a time and must not be mixed with gameplay changes.


Revision 143 aligns editor inspector ergonomics across all three authoring tools. Puppet Forge, the Level Editor, and the Asset Tool attach an accessible expand/collapse control to each right-side panel heading and remember each tool's state under its own local-storage key. This is UI-only state: collapsing a panel never removes controls, mutates project data, or affects exported JSON.

Revision 146 adds a left-side full dopesheet to Puppet Forge. Dopesheet row discovery and ordering live in the editor-only `src/tools/character-editor/dopesheet-data.js`; DOM construction, selection, and scrubbing remain in `character-editor.html`. The helper reads animation authoring data but does not participate in runtime sampling, simulation, exported schemas, or future C++ parity.

SDL build revision 138 removes Puppet Forge's hardcoded enemy-project registry. `src/tools/character-editor/enemy-project-catalog.js` converts each loaded `ct_enemies_001.json` definition with a `characterId` or explicit `characterUrl` into a selector entry. The editor owns DOM option construction, while this helper remains pure editor-only catalog normalization.

SDL build revision 139 fixes combined-transform key easing in Puppet Forge. A selected transform diamond can represent X, Y, and rotation keys at one time, or only rotation for a parent-constrained part. Changing the interpolation selector now updates every editable key represented by that diamond and the Apply Selected button remains available. The easing value continues to describe interpolation after the selected key, including the final-to-first segment of a looping clip.


SDL build revision 140 keeps browser Level Editor playtesting inside the browser startup layer. `playBrowserCopy()` serializes the current level to the editor storage key and opens `game.html?playtest_browser_copy=1`; `game-bootstrap.js` applies that level before renderer creation and now treats a successfully loaded browser copy as a direct-play launch condition. The title screen remains the default for ordinary game launches, while explicit level, recording, playback, and editor-playtest launches retain their specialized startup behavior.


SDL build revision 142 adds a shared user-facing Development features concept while retaining platform-specific presentation. The browser submenu delegates to its existing guide, tuning, recording, playback, and debug-panel machinery. SDL owns equivalent menu entries and lightweight native drawing in `src/runtime/ignatius-app.cpp`: green/yellow asset collision guides, enemy hitbox/FOV/state guides, and a compact fixed-text panel. Native and browser verbose logging both sample structured runtime snapshots no more than once per second and perform no snapshot work while disabled. SDL writes NDJSON under `logs/`; the browser buffers rows only while enabled and downloads the NDJSON when logging stops. These diagnostics remain presentation/runtime-adapter facilities and do not enter portable simulation decisions.

SDL build revision 143 makes raw GPU resize recovery transactional. `scenePresentationSizeDirty` is set by logical resize, pixel-size, display-scale, and fullscreen events. Normal acquisition and render checks return through one cached branch; transition frames query the current output, rebuild both scene textures before swapchain acquisition, suppress stale queued presentation, and reacquire if texture recreation invalidated an earlier target. A transient fullscreen resize must never call the permanent renderer fallback merely because the old acquisition was released.

SDL build revision 144 treats native file-dialog callbacks as foreign-thread adapters. The callback may copy callback-owned strings and package a result, but it must not touch menu state, recordings, simulation objects, renderer resources, or diagnostic streams. `SDL_RunOnMainThread` transfers the owned result to the event-processing thread, where playback loading and level reconstruction proceed through the ordinary runtime path.

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
| `src/core/simulation.js` | PORTABLE CORE | Authoritative fixed-step state, player physics, collisions, weapons, enemy strategy state machines, optional one-second off-screen enemy spawning, placeable on-screen enemy spawners, reactive objects, story state, level runtime conversion, serialization, and update order. |
| `src/shared/signal-channel-data.js` | SHARED DATA / MATH | Named-channel normalization and reusable lever/keyhole emitter normalization shared by editor and portable core. |
| `src/shared/moving-platform-data.js` | SHARED DATA / MATH | Versioned moving-platform patterns, activations, safe defaults, and relative endpoint calculations. |
| `src/shared/actor-geometry.js` | SHARED DATA / MATH | Shared baseline-anchored actor rectangles, enemy projectile hurtboxes, and melee reach rectangles used by simulation and debug presentation. |
| `src/shared/enemy-scale-data.js` | SHARED DATA / MATH | Uniform character-enemy placement scale normalization and derivation of scaled hitbox dimensions, artwork scale, and projectile radius for core and authoring tools. |
| `src/shared/animation-data.js` | SHARED DATA / MATH | Animation schema normalization, sampling, interpolation, and pose blending. |
| `src/shared/level-transform.js` | SHARED DATA / MATH | Mirroring, rotation, placement geometry, hit testing, and atlas-node conversion shared by runtime and editor. |
| `src/shared/level-color-map-data.js` | SHARED DATA / MATH | Level colour-map normalization, cache keys, hue-selection mathematics, and RGB/HSL conversion without browser objects. |
| `src/shared/enemy-pool-data.js` | SHARED DATA / MATH | Shared numeric enemy-pool expression parsing for inclusive ranges and `!` exclusions, used by both automatic level generation and runtime auto-spawn authoring. |
| `src/shared/auto-spawn-enemy-data.js` | SHARED DATA / MATH | Normalized level-owned auto-spawn settings, placeable enemy-spawner settings, enemy-catalog normalization, shared pool resolution, and construction of plain catalog-backed enemy entity records. |
| `src/shared/level-generator-data.js` | SHARED DATA / MATH | Versioned generator settings, named deterministic random streams, implementation registries, shared enemy-pool parsing, abstract route candidate generation, validation, quality selection, provenance, and generated-state normalization. It creates no Canvas objects or playable cave geometry. |
| `src/shared/game-settings-data.js` | SHARED DATA / MATH | Versioned game-facing settings defaults, preset normalization, incoming-damage scale, and visual particle-density scale without browser storage or DOM objects. |
| `src/shared/level-layer-data.js` | SHARED DATA / MATH | Canonical user-facing level-layer IDs, inert cosmetic-layer classification, and shared Foreground/Background parallax defaults. |
| `src/shared/cave-window-data.js` | SHARED DATA / MATH | Inert cave-window schema normalization, decoration and gradient-noise settings, closed smooth/corner spline sampling, deterministic perturbed-outset sampling, point-insertion lookup, and authoring bounds. It contains no collision or navigation generation. |
| `src/shared/cave-kill-boundary-data.js` | SHARED DATA / MATH | Portable derivation of the player lethal loop from the same sampled cave full-black outset, plus camera-independent polygon/actor overlap tests. It creates no collision or navigation geometry. |
| `src/shared/power-up-data.js` | SHARED DATA / MATH | Versioned power-up definitions, duration/permanence, refresh/extend/ignore stacking rules, active-effect normalization, HUD composition metadata, and deterministic rocket multipliers. |
| `src/shared/story-reading.js` | SHARED DATA / MATH | Shared character-count reading speed, start delay, and duration helpers for letters and thought bubbles. |
| `src/shared/cave-window-decoration.js` | SHARED DATA / MATH | Deterministic arc-length sampling and tagged atlas-asset selection for explicit non-colliding `caveForeground` placement records. |
| `src/browser/browser-input.js` | BROWSER ADAPTER | Keyboard, gamepad, mouse, and touch state converted into `InputFrame`. |
| `src/browser/game-bootstrap.js` | BROWSER ADAPTER | Asset, enemy-catalog, and level loading; fixed-step loop; menu/settings coordination; fullscreen policy; top-left HUD and upper-right minimap binding; viewport-size projection into portable camera state; connection of input/simulation/renderer; optional haptic projection; and hydration of plain character combat profiles from loaded character projects. |
| `src/browser/gameplay-recording.js` | BROWSER ADAPTER | Gameplay-recording schema helpers, hosted playback URL normalization, input snapshots, replay-frame reconstruction, and visual debug snapshots used by browser playback and SDL/C++ parity checks. |
| `src/browser/hud-panel-layout.js` | BROWSER ADAPTER | Pure viewport-fit calculation for the natural-size meter panel and optional upper-right minimap. It owns no DOM, Canvas, game state, or portable simulation behavior. |
| `src/browser/gamepad-haptics.js` | BROWSER ADAPTER | Optional active-controller vibration driven from portable simulation events and current boost state. It owns no gameplay decisions and silently degrades when haptics are unavailable. |
| `src/browser/game-settings-store.js` | BROWSER ADAPTER | Safe local-storage load/save for normalized game-facing settings. |
| `src/browser/electron-window-bridge.js` | BROWSER ADAPTER | Detection and normalization of the optional sandboxed Electron preload API for quit/fullscreen operations. |
| `electron/main.cjs` / `electron/preload.cjs` | DESKTOP HOST | Optional native window, secure preload boundary, desktop quit, and fullscreen IPC. No gameplay ownership. |
| `src/presentation/rocket-glow-baking.js` | PRESENTATION ONLY | Separable alpha dilation, Gaussian blur, and padded tinted-surface construction retained for offline powered-rocket atlas preparation and deterministic kernel tests. Runtime rendering does not import this module. |
| `src/presentation/canvas-renderer.js` | PRESENTATION ONLY | Canvas world rendering, camera presentation, rig drawing, visual effects, cave-mask composition, story overlays, and debug overlays. It caches 64×64 neutral or wrench-tinted smoke stamps for scaled `drawImage` reuse and avoids per-puff impact sparkle loops. |
| `src/presentation/actor-shadow.js` | PRESENTATION ONLY | Physical actor-foot shadow anchors, grounded-contact classification, and renderer-time 0.2-second opacity transitions shared by Canvas and WebGL drawing. |
| `src/presentation/webgl2-renderer.js` | PRESENTATION ONLY | WebGL2 context, shader, sprite-batch, texture-cache, Canvas-layer upload, blend, context-recovery, and GPU diagnostic ownership for the visible game canvas. |
| `src/presentation/world-parallax.js` | PRESENTATION ONLY | World-bounds-centred parallax offset shared by the ordinary cosmetic Background and the cave Foreground wrapper. |
| `src/presentation/cave-window-mask.js` | PRESENTATION ONLY | Reduced-resolution reusable offscreen black cave mask, stable render keys, spline-to-screen tracing, deterministic wavy opacity bands inside the feather, exact full-black clamping, and camera-relative foreground parallax. |
| `src/presentation/foreground-sprite-treatment.js` | PRESENTATION ONLY | Cached Canvas preparation for brightness and saturation treatment of cave foreground frames. Spatial fading belongs exclusively to the cave-window mask. |
| `src/presentation/character-runtime.js` | PRESENTATION ONLY | Browser-side character project loading, rig normalization, animation selection, projectile-release transform compilation, and ordered draw commands. |
| `src/presentation/level-color-map-cache.js` | PRESENTATION ONLY | Offscreen Canvas generation and image-pixel application for cached environment-atlas recolouring. |
| `src/presentation/world-visual-cache.js` | PRESENTATION ONLY | Cached static-layer partitioning/sort keys, conservative rotated world bounds, parallax-aware viewport bounds, and Canvas draw rejection helpers. |
| `src/presentation/overlap-blend-cache.js` | PRESENTATION ONLY | Detection of consecutive overlapping static atlas visuals and one-time off-screen bitmap composition with a central-half transparency crossfade. Runtime and Level Editor reuse the cached bitmap through ordinary `drawImage`; collision records remain separate and unchanged. |
| `src/tools/character-editor/*` | EDITOR ONLY | Reusable Puppet Forge project, animation, atlas, dirty-state, view, dopesheet, and tab-local motion-reference operations. |
| `tests/testbench.mjs` | TEST ONLY | Headless simulation tests, data tests, source-boundary checks, and browser-entry integration checks. |




## Cave-window presentation boundary

The cave perimeter is deliberately not gameplay geometry. Revision 136 adds a closed editor spline in top-level `level.caveWindow`; revision 137 turns that data into a visual opening through a foreground rock mass using a reusable offscreen black mask. It may scroll with a subtle foreground parallax offset and may occlude actors, but it must not create solids, walkable supports, hazards, navigation edges, or projectile collision. Authoritative collision and platforms remain ordinary playing-area data in the portable level definition.

`src/shared/cave-window-data.js` owns schema, decoration settings, and curve mathematics so the Level Editor and renderer share deterministic points. `src/shared/cave-window-decoration.js` samples that spline by arc length, classifies inward normals as floor, wall, or ceiling, and selects tagged atlas assets deterministically from the authored seed. It returns ordinary explicit placement records on the `caveForeground` layer; it does not mutate gameplay geometry. `src/presentation/cave-window-mask.js` owns Canvas composition, outward feathering, and camera-relative parallax anchored around the technical world bounds. Revision 211 adds one deliberately narrow gameplay use through `src/shared/cave-kill-boundary-data.js`: portable core derives a lethal player loop from the same full-black outset. That loop is a defeat threshold only. It never becomes collision, a support, navigation, projectile geometry, or an editable second spline.

Foreground cave placements are presentation records drawn after actors and before the black cave mask. Runtime and editor both force manifest collision off for this layer, even when a malformed level requests collision. The renderer applies the same cave parallax and uses cached darkened/desaturated frame canvases, avoiding an expensive Canvas filter for every placement on every frame. Revision 333 makes the Level Editor consume the renderer's `computeCaveWindowParallaxOffset` calculation for its viewport preview as well: the spline, feather guides, full-black boundary, and foreground placements move together as the editor camera pans. Editor pointer operations invert that display offset before writing coordinates, so the JSON remains ordinary authored world data. Revision 385 makes `src/presentation/foreground-sprite-treatment.js` colour-only: it caches brightness and saturation but never bakes a black gradient into a sprite. The world-space cave-window mask, drawn after every Foreground and Background asset, is the sole transparent-to-black handover. Therefore the fade stays attached to the authored perimeter when an asset is moved. Generated records are marked `generatedBy: "cavePerimeter"`; regeneration replaces only those records, leaving manual foreground formations untouched. The editor should warn when authoritative platforms are placed so far outside the visible opening that their gameplay purpose would be hidden.

Revision 139 adds a presentation-only performance boundary around dense cave scenery. `src/presentation/world-visual-cache.js` partitions and sorts the static visual list only when the array identity changes, precomputes conservative rotated bounds, and culls terrain, actor-front, cutout-mask, and cave-foreground records before Canvas state changes or image submission. Cave-foreground culling includes the authored parallax offset. The renderer also conservatively culls off-screen targets, pickups, enemies, smoke puffs, and projectiles, with projectile trails included in their bounds. `src/presentation/cave-window-mask.js` renders its blur at 35% linear resolution, reuses the result while all render inputs remain unchanged, and upscales during final composition. The debug panel reports renderer stage timings, real render-to-render FPS, static/dynamic draw-cull counts, foreground-cache activity, and cave-mask reuse. These caches and bounds remain useful if a later WebGL2 backend is required.

Revision 140 applies the same discipline to the Level Editor. Static placements are sorted and partitioned once between structural edits, rotated world bounds are cached per placement and used for viewport rejection, and treated foreground frames share the runtime sprite-treatment helper. Generated perimeter guides and labels are suppressed unless selected. Full JSON serialization is deferred until interaction pauses instead of running on every pan or drag redraw. A UI-only checkbox hides generated perimeter records without deleting or changing exported level data. Revision 279 removes the authored maximum-spacing field entirely. Tangential step distance is now a fixed overlapping fraction of the chosen formation's actual rendered span, with slightly denser floor/ceiling overlap than side walls. This matches the invariant that generated formations must cover continuously through the full-black boundary.

Revision 141 tunes the cave foreground toward its intended cutaway-window look. New cave records default to 1.1 parallax. Generated sprites are centred 8–14% of their normal depth inside the authored spline, then use a broad smootherstep-style fade from 5% to 92% of their inward-to-outward span, leaving a fully black outer cap for the mask handover. Smooth spline controls retain Catmull-Rom-like direction but clamp each Bezier handle to 45% of the shorter adjacent segment. This prevents the very long straight runs of a wide world-bounds starter loop from pulling short rounded-corner segments into self-intersecting curls.

Revision 142 restores the automatic perimeter-decoration scale default to 2×. **Create from world bounds** now places eight smooth tangent points around, rather than inside, the technical bounds. The straight runs sit 96 world pixels outside each side and the rounded corner curves join around the original corners without entering the declared area or crossing themselves.

## Enemy strategy and navigation boundary

Revision 115 introduces an explicit enemy strategy layer. `simple_patrol` preserves the earlier local patrol/attack behaviour, `sentry` remains stationary until a target enters awareness range, and `hunter` owns a portable state machine with `patrol`, `pursue`, `position_for_attack`, `jump`, `drop`, `investigate_last_seen`, `unreachable_glare`, `return_home`, and `stranded_patrol` states.

Navigation is deliberately platform-oriented rather than a generic polygon navmesh. `src/core/enemy-navigation.js` extracts upward-facing support intervals from authored collision segments and solid tops, removes floor intervals obstructed by closed collision geometry, and retains obstacle footprints so vertically overlapping tops are entered from a clear side rather than from beneath. It creates directed edges for steps, single jumps, and controlled drops, and rejects edges that exceed the enemy's run speed, jump height, gravity, maximum fall distance, or body-access requirements. Route cost includes the walk from the current position to the launch point. Revision 118 adds physics-guided run-up candidates and trial-runs each jump at the same fixed-step split-axis cadence used by runtime, using the actor's full collision width rather than a narrower navigation proxy. Revision 119 applies the same principle to walk-off drops: launch points sit at the source edge and the chosen horizontal velocity must clear the source obstacle before the actor descends beside its wall. Runtime traversal then uses the same shared swept actor collision queries as Ignatius for solids, segments, and polygons, so an NPC cannot fall through ordinary ground or pass through a pillar merely because a graph edge predicted it. Revision 129 extends this to lower separated supports with deliberate downward-jump candidates that clear the source wall before descent, and adds a takeoff-clearance cost so feasible early launches outrank wall-hugging alternatives. A valid full-body landing on a neighbouring support is treated as a recoverable topology observation: simulation snaps to that support's usable interval and replans rather than declaring the edge failed. Revision 130 tightens endpoint validation so a destination support exempts collision only while the actor centre is over that exact support, not merely touching another wall on the same polygon. Upward candidates require stable majority overlap at first contact rather than complete body containment, which preserves full-body wall clearance while allowing slower actors to land near the edge of narrow tops. Revision 131 sizes downward-jump run-ups from the required acceleration distance plus a small stability margin, avoiding a theatrical trek across an entire narrow ledge when only a modest launch speed is needed. Upward obstacle-clearing jumps retain the longer body-width run-up. Revision 133 adds true ledge-walk-off edges for broad lower floors that overlap the source horizontally. The baker tests both source obstacle edges, requires a full-body landing interval beyond the wall, and gives the edge gravity-only initial vertical motion. Runtime temporarily exempts only the complete source polygon/segment set during a bounded departure window, then returns immediately to ordinary swept collision for the fall and landing. The current goblin archetypes allow controlled falls up to 600 pixels, which covers the authored left-step descent in `level_001` without turning arbitrary bottomless falls into routes. Revision 134 makes grounded body-occupancy probes slope-aware. The actor still follows the authored support at its foot point, but the non-physical clearance rectangle raises its lower edge by the terrain rise across half the probe width. This prevents a downhill segment of the same blockable polygon from being mistaken for a wall while retaining ordinary polygon, segment, and solid blocking above the support.

Hunters remember their original support and patrol interval. Planning first tries to reach the wizard's step-connected support region. Ranged hunters only fall back to another support when that region is genuinely unreachable; the fallback search validates the actual authored projectile origin and either the direct fireball path or solved ballistic musket-ball arc. Once an engaged hunter loses current cone contact, it records no new hidden information: it keeps the last genuinely seen player foot position and immediately continues an already selected route or begins routing to the reachable support point with the smallest remaining world-space distance to that position. The awareness-hold timer keeps the engagement alive and delays glare/give-up, but does not impose an idle pause. Glare begins only after the remembered point is reached, no closer route exists, and the hold has expired. If the original support cannot then be reached, the enemy adopts the reachable support as a bounded temporary patrol and periodically retries the home route. This fallback is deterministic and visible; no enemy despawns merely because it made an unfortunate jump.

Movement capability and behaviour flavour are enemy-archetype/runtime data, not character-art data. The enemy catalog and level entity may author `strategy`, `walkSpeed`, `runSpeed`, `jumpHeight`, `jumpGravity`, `maxFallDistance`, `awarenessRange`, `awarenessViewHalfAngle`, `unreachableGlareDuration`, `routeRepathInterval`, and `homeRetryInterval`. Awareness is independent of collision geometry: blockable and walkable level shapes may obstruct movement or an actual attack, but they do not hide Ignatius. First notice is controlled only by radial distance and the monster's facing cone, which currently defaults to ±60 degrees in the enemy catalog. `strategy` and `runSpeed` are the only supported behaviour and pursuit-speed fields; retired `behavior`, `chaseSpeed`, and `awarenessVerticalRange` records are not migrated. Character JSON remains concerned with rig, animation, projectile handoff, and presentation-only combat sound references, preserving the presentation/gameplay boundary.

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

`src/browser/game-bootstrap.js` owns visible startup and level-transition loading state. The static loading surface is present in `game.html` before module evaluation, so a slow server never presents an unexplained black canvas. Startup applies the selected level before renderer creation and passes `world.atlasManifests` into `createRenderer`; environment discovery is level-authored rather than a sequential scan of speculative filenames. The loading surface remains visible through active colour-map synchronization and level-presentation cache prewarming, including every unique treated `caveForeground` sprite and its WebGL texture when hardware rendering is active.

`src/presentation/canvas-renderer.js` coordinates concurrent character-project and environment-atlas loading and reports normalized progress, while `src/presentation/character-runtime.js` reports the internal character definition, rig, atlas manifest, decoded image, and animation stages. The renderer owns loaded presentation resources and exposes `ensureEnvironmentAtlases` for later levels. Level transitions and restarts must prewarm presentation caches only after required atlases and the active colour map are ready, so derived sprite canvases are never created or uploaded for the first time inside active gameplay. Portable simulation remains unaware of browser progress UI and receives only the completed manifest map through `applyAtlasManifestsToWorld`.


## Cave full-black outset boundary

Revision 147 gives `caveWindow.feather` a precise authoring interpretation while preserving the existing level schema. It is the world-space distance from the authored cave-opening spline to the boundary at which the exterior must be completely opaque black. `src/shared/cave-window-data.js` owns `sampleCaveWindowOutset`, which samples the closed Bezier perimeter and constructs a winding-independent, bounded-miter offset loop. The outset is derived data and is never stored as a second editable spline.

Revision 278 replaces the initial revision 277 mask composition with normalized `caveWindow.gradientNoise` (`seed`, `amplitude`, and `period`). The period is authored from 10 to 500 world units and defaults to 50. `sampleCaveWindowPerturbedOutset` derives cyclic, deterministic broad-plus-detail noise along perimeter arc length while preserving the smooth authored perimeter and exact outer outset. `src/presentation/cave-window-mask.js` now builds the entire feather from at least twenty ordered perturbed opacity contours following a smoother-step opacity curve. It is exactly transparent at the opening and reaches opaque black only at the shared outset, rather than applying a smooth shadow blur that darkened too quickly and concealed the perturbation. The Level Editor restores discoverable feather wording and previews three representative opacity contours. This remains presentation-only: the full-black lethal boundary continues to consume the unperturbed exact outset.

`level-editor.html` draws the derived loop as an optional dashed guide. `src/presentation/cave-window-mask.js` consumes the same helper and restores solid black outside that loop after applying the reduced-resolution layered feather. This shared geometry prevents the editor preview and runtime mask from disagreeing about where full black begins. Revision 211 also derives `world.caveKillBoundary` from that exact loop. Ignatius is defeated only once his complete authoritative body rectangle no longer intersects the loop. The test is fixed-step and camera-independent, and it routes into the shared spark-death/reset lifecycle. The outset still never contributes collision or navigation geometry.

### Revision 148 safe moving-platform foundation

Ordinary atlas placements may now opt into a normalized moving-platform component. New platforms default to the common automatic shuttle loop, moving between a start placement and relative endpoint and pausing for 0.75 seconds before each reversal. The Level Editor exposes only controls relevant to the chosen pattern, draws an interactive START-to-END route with a draggable endpoint, and keeps the endpoint relative when the start placement moves.

Portable simulation owns the kinematic state machine, translated collision geometry, rider support identity, exact player carrying, fades, despawn timing, and timed restoration. `loopRespawn` moves to its endpoint before fading and returning to the start; `vanishRespawn` fades in place as a trap. Both always restore after `hiddenDuration`, which is normalized to a positive minimum, so a vanished platform cannot permanently strand the level. Automatic and rider activation are included in this first slice. Signal channels, switches, keyholes, enemy riding, crushing, and lethal full-black traversal remain explicit follow-up work.


## Revision 149 menu, settings, and desktop-host boundary

The menu is browser UI, not gameplay state. Opening it sets the existing simulation pause flag and records the prior pause state; closing it restores that prior state. Settings data itself is plain and serializable so the portable simulation can consume the two values that currently matter: incoming damage scale and visual particle-density scale. Difficulty is intentionally centralized in `damagePlayer`; outgoing weapon damage and enemy behaviour remain unchanged. Explicit kill semantics can opt out of scaling with `bypassDifficulty`.

Rendering quality currently changes smoke-particle generation for homing-rocket trails and impact explosions. It must not alter fixed-step timing or collision. Volume sliders are persisted browser preferences. Music defaults to 10% and effects to 80%; pause muting is transient and must not rewrite those values. The current music system plays imported OGG tracks listed in `resources/music/music.json`; only the browser adapter owns audio playback.

The Electron shell is optional. `game.html` runs unchanged in normal browsers. In Electron, `preload.cjs` exposes an immutable `electronWindow` object through `contextBridge`; the game reveals Exit to desktop and routes fullscreen through IPC. The renderer process has no Node integration and cannot access Electron directly.

## Revision 150 fullscreen policy and menu input boundary

`autoFullscreen` is a persisted browser preference, not a simulation rule. `src/browser/game-bootstrap.js` applies it at transitions between active play and pause-menu/debug-pause states. Browser Fullscreen API entry is requested only from an eligible user gesture; leaving fullscreen does not require one. Opening the menu always requests windowed mode, while resuming requests fullscreen when the preference is enabled. A manual browser FULLSCREEN/WINDOWED control remains available.

The Electron host is fullscreen-only and therefore does not expose this preference in the Settings view. Its top-right display control becomes EXIT, while the menu retains the explicit Exit to desktop action. The compatibility fullscreen IPC endpoint may report or restore fullscreen but must never create an Electron windowed gameplay mode.

Keyboard menu handling remains browser-owned. The adapter enumerates only visible, enabled controls in the active dialog view and provides wrapped traversal, slider and option adjustment, activation, and back navigation. It clears gameplay input when opening and closing the dialog so menu keystrokes cannot leak into the next simulation frame.

## Revision 454 OGG music reset

Level soundtrack choice remains ordinary authored data, but the current schema is `music.version: 3` plus `music.trackId`. The shared `src/shared/music-data.js` module normalizes only numbered OGG track IDs such as `music_001` and the explicit `none` option. Older synthesized `tuneId` values normalize to the first imported track rather than silently restoring the retired catalog.

`resources/music/music.json` is the sole runtime metadata catalog. It lists the numbered `.ogg` files stored beside it in `resources/music/`, including display titles and import provenance. The Level Editor fetches this catalog to populate the music selector, and browser bootstrap fetches it before handing the catalog to `src/browser/music-director.js`. Portable simulation stores the normalized track metadata in `state.world.music` but never creates audio elements, decodes files, or advances music time.

`src/browser/music-director.js` now wraps a normal looping HTML audio element. It handles selected track changes, persisted music volume, pause/focus muting, user-gesture autoplay unlocking, and cleanup. The retired embedded jukebox path is removed: no hidden engine host, source bundle, accepted-selection JSON, score-source notes, oscillator scheduler, or iframe API is part of the active architecture.

## Revision 151 retired synthesized music boundary

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
`character-editor.html` loads `resources/characters/ct_enemies_001.json` alongside known enemy character projects and exposes both common type fields and the complete defaults object. Browser security means saving is an explicit JSON download rather than silent source-tree mutation. Portable bomber movement and projectile release live in `src/core/simulation.js`; catalogs select the behavior with `defaults.strategy = "bomber"` and `defaults.locomotion = "flying"`.

## Revision 171 perched bomber lifecycle
Flying enemies using `strategy: "bomber"` store their spawn point as `bomberPerchX/Y`. Their runtime state cycles between `perched`, `bomber`, and `return_to_perch`, using the same authored awareness range and view cone as grounded enemies. Dropped rocks use the normal projectile collision pipeline with the dedicated `enemyRock` kind and a procedural renderer, so no additional image asset is required.

## Revision 184 exclusive frame-part animation contract

Frame-swapped characters remain ordinary rigged character projects. A still-frame atlas sequence may stack each source frame as a rig part and animate only alpha, which preserves the shared renderer, mirroring, scaling, projectile handoff, editor loading, and future engine-port boundary. Such clips now declare `presentation.mode: "exclusive_frame_parts"` and list the participating parts in authored order. `src/shared/animation-data.js` validates that every listed part exists, has step-keyed alpha, and that exactly one listed part is visible throughout the clip. This is an animation-data invariant, not a bat renderer special case. Ordinary articulated clips continue to normalize as `presentation.mode: "rig"`. Character Editor support is operational rather than descriptive: a frame-based checkbox enables an exclusive-frame workflow, derives or edits the ordered frame-part list, owns the participating alpha tracks, and authors one-hot step keys at the playhead. Direct alpha editing is disabled for managed frame parts so the invariant cannot be broken through the ordinary track UI.

Flying locomotion and bomber strategy remain separate portable gameplay qualifiers. The visual frame-sequence contract must not contain flight AI, collision, awareness, or projectile decisions, and character-art files must not become enemy-behaviour catalogs.

## Revision 190 unified character artwork placement

Character-enemy `renderOffsetX` is a character-local offset from the gameplay hitbox anchor, so it mirrors with facing; `renderOffsetY` remains downward-positive. The hitbox itself always remains at the authoritative entity position. `src/presentation/character-runtime.js` owns the offset and render-origin calculations. Runtime and Level Editor use the same `characterArtworkOrigin()` helper, while Puppet Forge uses the same local offset helper and the same `animationPoseToRuntimeTransforms()` path as runtime. Preview zoom and Puppet Forge's display-only world scale multiply artwork, offsets, and hitbox dimensions together, preserving both aspect ratio and artwork-to-hitbox alignment in either facing direction.

Revision 386 separates that artwork origin from ground-shadow placement. `src/presentation/actor-shadow.js` reads the authoritative actor foot point directly from `x / y`, derives contact from `player.onGround` or `enemy.airborne`, rejects flying locomotion, and advances a renderer-owned opacity toward the contact target over 0.2 seconds. `canvas-renderer.js` updates every character actor each prepared frame, so culling cannot freeze a transition. Both Canvas and WebGL draw at the physical foot point, and corpse opacity multiplies rather than replaces the contact fade. No shadow state enters portable simulation or level data.

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

The first concrete effect was `rocketOverdrive`. It was introduced at 12 seconds in revision 211 and shortened to 8 seconds in revision 212. At that milestone it refreshed to a full duration when collected again, cleared on player reset after death, halved projectile-rocket fuel cost, and halved the then-existing launch cooldown. It did not alter backpack boost drain or physics. The identity was later retired in favor of Overdrive, and revision 308 removed player rocket launch cooldown entirely. `src/core/simulation.js` alone activates, advances, expires, and applies those multipliers. `src/presentation/canvas-renderer.js` reads effect metadata to tint `powerup_glow_white`, place `powerup_icon_lightning` above it, and animate the world pickup. `game.html` and `src/browser/game-bootstrap.js` present one prioritized active effect in the top-left Power bar. The Level Editor previews the same composite metadata but owns no effect behavior.

## Revision 212 power-up HUD presentation

Portable effect definitions now include a numeric `hud.priority`. `prioritizedActivePowerUpEffect` ignores expired records and selects by descending priority, then descending activation time, then stable ID. This is shared deterministic policy, not a DOM heuristic, so later browser or native HUDs can make the same choice when several effects coexist.

World pickup composition remains Canvas-owned. The active-effect timer is now part of the existing DOM HUD in `game.html`, bound from `src/browser/game-bootstrap.js`; the renderer no longer draws a second screen-space badge. Health, fuel, and Power bars are presentation-only projections of portable state and never feed values back into simulation.

## Revision 213 Overdrive and randomized wrench arsenal

The lightning effect is canonically `overdrive`. The shared normalizer accepts current built-ins and complete explicit custom effects, but it explicitly rejects the retired Rocket Overdrive identity even when an old snapshot embeds a full definition; retired IDs and pickup types are not translated. Overdrive remains an independent twenty-second effect with HUD priority 100 and half projectile fuel cost. Revision 308 removed the global player rocket launch cooldown, so Overdrive no longer carries or applies a cadence multiplier. The inactive Power label is now simply `Powerup:`.

Six twenty-second wrench effects share the exclusive `wrench` group and HUD priority 200, above Shield at 150 and Overdrive at 100. Collecting Triple, Dart, Burst, Bigbomb, Boomerang, or Phase removes any other active wrench but leaves Overdrive untouched. Triple launches three half-standard-damage small homing rockets with distinct initial fan angles and separate target assignment when possible, for 45 total damage if all hit. Dart launches one normal-sized non-homing rocket straight along Ignatius's facing direction, deals standard rocket damage, and costs two-thirds standard fuel. Burst commits three small half-standard-damage unguided rockets for one standard fuel payment and activates them forward at 0.18-second intervals, for 45 total damage if all hit. Bigbomb launches forward before homing, costs triple fuel, travels at half speed, turns with half homing response, renders at 1.7× scale, deals four times standard damage, and applies full damage in a radius of 1.5 wizard heights. Boomerang also launches forward before homing; it uses standard damage and cost, returns toward Ignatius after a miss or destroyed target, and refunds half the launch fuel on a successful catch. Phase uses standard damage, cost, speed, and homing, but ignores ordinary level and reactive-obstacle geometry while still colliding with enemy targets.

Power-up pickup runtime records now carry `respawnSeconds`, `respawnTimer`, and optional `randomEffectIds` plus `randomRollCount`. Browser startup supplies a fresh session seed, while portable core derives deterministic per-level and per-respawn rolls from that seed, pickup identity, level-load count, and roll count. All power-up pickups default to a sixty-second respawn. A random wrench rerolls before becoming available again. Level 1 keeps Overdrive at x=800 and adds a random wrench at x=1400.



## Revision 214 cached wrench-rocket glow sprites

Wrench identity and tint are copied onto each projectile at launch so an in-flight rocket keeps the visual language of the payload that created it, even if Ignatius collects another wrench before impact. `src/presentation/rocket-glow-cache.js` reads the projectile rocket frame's alpha once per source-sprite/tint pair, expands the silhouette with horizontal and vertical sliding-window maximum passes, softens it with horizontal and vertical Gaussian passes, and writes a padded tinted offscreen surface. `canvas-renderer.js` draws that cached surface additively behind the ordinary rocket sprite. No pixel loop, blur, hue operation, or temporary surface allocation occurs during later draws of the same wrench colour. Standard and Overdrive-only rockets do not request a glow.


## Revision 215 larger cached wrench-rocket glow sprites

`src/presentation/rocket-glow-cache.js` now applies a default `glowSizeMultiplier` of 3 when generating wrench-rocket glow sprites. This scales both the silhouette expansion radius and the blur radius before caching, producing a much broader halo without changing the per-frame renderer path. The multiplier is included in the cache key so alternate future glow scales can coexist safely.


## Revision 216 softer cached wrench-rocket halo blur

`src/presentation/rocket-glow-cache.js` now guarantees a minimum blur radius based on `sourceWidth * 0.2`, in addition to the existing scaled silhouette expansion. A wider default Gaussian sigma is derived from that blur radius so the coloured halo extends outward as a softer fuzzy aura rather than a relatively sharp rim. The cache key now includes the blur-outset fraction so future tuning variants remain isolated.


## Revision 217 exact wrench-glow colour contract

Wrench effect metadata now owns exact pure RGB tint values, copied into pickup presentation and projectile launch-time state. Canvas presentation uses normal alpha compositing for these coloured glow surfaces instead of additive blending, preventing the cached tint from being driven toward white. The rocket glow generator uses a default width-relative blur outset of 0.25 with a broader sigma. Dart carries an explicit `piercesEnemies: false` projectile contract and the ordinary first-impact explosion path remains authoritative.


## Revision 218 Boomerang return collision contract

The Boomerang return phase remains part of the ordinary portable projectile simulation. Its steering target changes to the player, but collision is never disabled. Each fixed step compares the swept player-catch impact with swept enemy, reactive-object, and terrain impacts, resolves the earliest contact, and only grants the fuel refund when the player catch occurs first. Return-path obstacle impacts use the normal explosion lifecycle and carry `boomerangReturning: true` in deterministic diagnostics.


## Revision 219 rocket damage balance contract

`DEFAULT_TUNING.rocketProjectileDamage` is 30 and remains the single base value used when a player rocket is created. Wrench modes derive projectile damage through shared multipliers rather than duplicated absolute constants: Triple `0.5` for each of three projectiles, Dart `1`, Burst `0.5` for each of three sequenced projectiles, Bigbomb `4`, Boomerang `1`, and Phase `1`. Enemy damage resolution clamps health to zero and marks an enemy defeated whenever `health <= 0`, so exact-zero hits are lethal without requiring negative health.


## Revision 220 canonical monster-health fallback

Sixty HP is the canonical fallback for a newly authored `characterEnemy`. Catalog defaults should normally store an explicit value, but `level-editor.html`, `character-editor.html`, and `src/core/simulation.js` all use 60 when health is omitted so tool-created and externally supplied monsters agree. Enemy-specific exceptions remain plain authored data in `ct_enemies_001.json` and are copied into level placements; no character artwork file owns combat durability. The current explicit balance is Skeleton Guard 90, Fireball Goblin 60, Musket Goblin 60, and Bombing Bat 1.


## Revision 221 multiplier-derived wrench damage rebalance

Wrench projectile damage uses multipliers against `DEFAULT_TUNING.rocketProjectileDamage`, currently 30. Triple uses `0.5` per projectile for three 15-damage homing rockets and a 45-damage maximum volley. Dart uses `1.0`; its advantage is straight, predictable flight and a two-thirds fuel cost rather than extra impact damage. Burst uses `0.5` per projectile for three 15-damage unguided rockets launched in quick succession and a 45-damage maximum burst. Bigbomb uses `4.0` for 120 damage across its authored AoE. Boomerang and Phase each use `1.0`.


## Revision 222 projectile-art fireball trail palettes

Ordinary enemy projectile trails use a four-colour palette sampled from the authored projectile frame when the character project loads. Transparent and near-black pixels are ignored, representative colours are ordered from dark to bright, and the cached palette is interpolated by particle heat in Canvas, WebGL2, SDL_Renderer, and SDL_GPU presentation. No atlas scan, pixel readback, or palette extraction occurs on the gameplay frame path.

Projectile-part GIMP Color Exchange is applied before native sampling and is already present in the final browser part canvas, so a recoloured projectile core and its trail remain coupled. The projectile draw path selects the same final part asset used for palette lookup. Skeleton Caster undeath orbs are an explicit exception: they bypass artwork palette lookup and keep their procedural green bubble particles.


## Revision 223 Shield invulnerability contract

Shield is an ordinary normalized timed effect owned by `src/shared/power-up-data.js`, with canonical ID `shield`, ten-second duration, refresh stacking, clear-on-death behavior, no exclusive group, and HUD priority above Overdrive but below every wrench effect. The Shield effect must not alter rocket multipliers, movement, fuel, collision, or enemy behavior. Catalog and level entities author only normalized pickup metadata: the shield icon, shared white glow, blue tint, duration, and respawn time.

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

The normal chest state pair is `openLoot` to `openEmpty`. Both atlas frames use identical cutout dimensions and the entity defaults to a compact 68 by 80 world-unit footprint with a 4-pixel downward visual offset. The separate closed artwork remains catalogued but is deliberately excluded from normal state progression because its perspective is not pixel-compatible with the open pair.

The Level Editor initializes Snap to 16 world units and uses 16 as the grid fallback. Level 1 places the demonstration chest on `exit_ground` at a 16-unit-aligned coordinate, providing a thick, visibly supported foundation beside the exit door.


## Revision 229 preload and haptic projection contract

Wrench projectile glows remain presentation-only cached surfaces. `createRenderer` reserves the final portion of startup progress for `RocketfrockRenderer.prewarmWrenchRocketGlows`, which enumerates the shared wrench effect registry, resolves the already-loaded projectile frame, and populates `RocketGlowCache` before gameplay begins. Rendering still calls the same cache lookup, so startup and draw-time keys cannot drift.

Revision 230 superseded this runtime cache contract with authored combined frames in `ct_atlas_wizard_2`. Current startup only verifies those supplemental atlas frames, and each powered rocket is drawn once from the authored combined sprite. Revision 283 removes the now-unused cache class and renames the remaining offline kernel utility to `rocket-glow-baking.js`.

Input-device ownership belongs to `src/browser/browser-input.js`. Meaningful mapped gamepad button or deadzone-cleared axis activity records the active pad index. A three-second grace window supports damage feedback between control presses, while fresh keyboard or pointer gameplay input revokes gamepad ownership immediately. The portable simulation neither queries controllers nor requests vibration.

`src/browser/gamepad-haptics.js` consumes deterministic `PLAYER_DAMAGED`, `ROCKET_LAUNCHED`, and `PLAYER_BOOST_STARTED` events plus the portable `attachedBoosting` state. Events are marked consumed even while haptics are inactive, preventing stale pulses when the player later picks up a controller. Hover feedback is rate-limited. Browser `playEffect("dual-rumble")` is preferred with a `pulse` fallback; all failures are ignored so haptic support can never interrupt the fixed-step loop.

### Revision 233: standard projectile secondary splash

The portable projectile state now stores `secondaryEnemySplashDamage` and `secondaryEnemySplashRadius` at launch time. Standard rockets and Overdrive populate these values from tuning; wrench projectiles store zero. Impact handling applies the splash only to enemy hitboxes, excludes the direct enemy, and emits `STANDARD_ROCKET_SECONDARY_SPLASH_APPLIED`. Presentation does not own or reconstruct this damage rule.

## Revision 234 generator-route architecture

Automatic Level Generator 0 is a shared-data foundation plus an editor projection. Portable generator contracts live in `src/shared/level-generator-data.js`; theme choices live in `resources/generator/themes/*.json`; and `level-editor.html` supplies controls, history guarding, status text, and the route overlay. The simulation and runtime renderer do not import the generator and do not interpret the abstract graph as collision or navigation.

Randomness is divided into stable named stage streams. Adding or regenerating a later stage must not perturb the route stream or unrelated stages. Route generation evaluates a deterministic candidate set and selects by validation and quality rather than accepting the first graph. Provenance records generator ID/version, seed, selected attempt, implementation IDs, normalized settings, resolved enemy IDs, diagnostics, and a run ID.

Generated ownership is explicit. `level.generation` stores the abstract route and current run metadata, while any future materialized placement or entity must carry the matching generated ownership marker. Editor undo/redo for generation restores only generator-owned state and the generator-applied theme colour map; it must refuse to overwrite generator state that has since been changed. Clear generated must never remove manual content.

Ice theme recolouring demonstrates the presentation boundary: shared colour-map data may restrict treatment through `atlasIds`, the presentation cache receives the atlas ID, and Canvas recolouring occurs only for allowlisted environment atlases. Interactive and story atlases remain authored presentation.

Generator 1 may consume the route, but it must materialize ordinary existing cave-window, placement, entity, collision, and world-bound records. The route graph remains provenance and diagnostics, not a second runtime physics format.

## Revision 235 playable-cavern architecture

Automatic Level Generator 1 consumes the accepted abstract route and emits only ordinary existing level records. `src/shared/level-generator-data.js` builds deterministic cavern, traversal, endpoint, and world records. `level-editor.html` applies those records through the same placement, entity, cave-window, colour-map, and world-bound fields used by manual authoring. Runtime physics remains unaware of generator algorithms and sees ordinary atlas collision.

The cavern is a connected sampled envelope formed from overlapping route chambers and corridor capsules, then projected into the existing closed cave-window spline contract. Sample positions include generated support centers so a visually valid support cannot drift outside the opening between sparse route nodes. The derived world bounds and reset height surround the complete envelope rather than the abstract graph alone.

Traversal geometry is collision aware. `resources/generator/level-generator-platforms.json` is the versioned allowlist and role catalog for generated supports. Each entry declares native dimensions, valid generation roles, scaling, surface height, door suitability, mirroring, and left/right walkable-edge insets measured from authored atlas collision. The planner measures gaps from those walkable edges, not from transparent frame rectangles or decorative overhangs. `floor_long_terrace` remains bridge-only because its top collision is split, and `ledge_small_flat` remains recovery-only because its true landing width is too narrow for a mandatory destination.

The mandatory spine is the only collision-bearing route materialized in Generator 1. Optional branch nodes and edges remain under `level.generation.route` and are copied into traversal reservation IDs for overlay and later-stage planning. This prevents purposeless branch platforms from becoming low ceilings or obstructing the guaranteed path before rewards and encounters give those detours a reason to exist.

A generation run evaluates multiple deterministic complete geometry candidates, validates cave containment, endpoint support, world bounds, authored walkable widths, transition gaps, rises, drops, and support interference, then selects the strongest valid result. Generation ownership covers placements, endpoint entities, cave data, world data, and the theme colour map. Guarded generation undo, redo, clear, and regeneration restore only the previous generator-owned shell and preserve manual records.


## Revision 236 encounter-generation architecture

Automatic Level Generator 2 adds a deterministic population stage without teaching runtime simulation about procedural generation. `resources/generator/level-generator-enemies.json` is the versioned generation catalog. It maps existing enemy IDs to placement class, group range, difficulty cost, selection weight, difficulty and progression ranges, walkable-width needs, edge and landing clearances, headroom, patrol room, group spacing, flying spawn height, and navigation requirements. The shared generator consumes this data together with the ordinary enemy catalog; display names and DOM labels are never treated as behavior metadata.

Encounter generation uses its own named random stream, so adding or tuning population does not perturb the accepted route or cavern geometry for the same seed. A normalized difficulty budget combines route size, enemy density, difficulty, and safety. Candidate encounter anchors come from collision-bearing mandatory supports. The endpoint calm distance is at least the theme value and at least the largest selected awareness range plus the configured spawn-safety buffer.

Ground enemies are placed only when the authored walkable collision interval can supply the catalogued edge clearance, protected incoming landing strip, patrol room, and headroom. Ranged hunter enemies retain ordinary entity behavior and trigger a rebuild of the existing baked hunter navigation graphs after the generated entities are applied. The generator does not invent a parallel navigation format. Flying bombers are emitted only as compact groups of two or three, with catalogued vertical airspace and separation chosen to make the standard rocket's one-damage secondary splash tactically relevant without overlapping enemy hitboxes.

Generated population records carry the same run ownership and stage provenance as the cavern shell. Generation undo, redo, clear, and replacement snapshots include the navigation graphs that the population stage rebuilt, preserving pre-existing manually authored navigation data. Encounter diagnostics record budget, spent cost, counts by placement class, bat groups, hunter count, calm distance, and warnings.

The combined validator checks the complete playable cavern plus population. It rejects endpoint calm-zone violations, terrain-embedded or unsupported enemies, insufficient walkable room, unsafe incoming landings, flying groups outside their allowed size or airspace, excessive group overlap, and missing generated hunter navigation support. In revision 236, optional route branches remained reservations and Generator 2 populated only the mandatory cavern.


## Revision 237 reward-generation architecture

Automatic Level Generator 3 adds rewards without coupling reward choices back into route or encounter randomness. `resources/generator/level-generator-rewards.json` is the versioned reward-generation catalog. It describes branch treasure, contextual power-ups, utility pickups, and optional narrative triggers through stable IDs, placement contexts, progression ranges, spacing, edge clearances, and per-draft limits. Branch selection uses the dedicated rewards random stream. Traversal consumes only the selected branch IDs and remains the sole owner of physical branch geometry, so reward tuning cannot silently redraw the accepted mandatory route.

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

Moving-platform visual identity is data-driven. `resources/generator/level-generator-platforms.json` reserves `rubble_long` exclusively for the `movingPlatform` role. Mandatory vertical edges select that role but retain ordinary landing-support traversal semantics, automatic shuttle movement, and complete travel-shaft cave stamps. Static branch bridges use a separate catalog role and cannot accidentally acquire the thin moving-platform visual.

`src/shared/cave-window-decoration.js` now builds perimeter catalogs only from entries tagged `stalactite` or `stalagmite`. Floor normals select stalagmites, ceiling normals select stalactites, and side-wall normals may rotate either family. The generated foreground remains inert presentation data with the same protection, radial stacking, ownership, and world-space perimeter-mask fade contract; only the admitted visual vocabulary changed.

## Revision 246 Atlas 004 platform-manifest architecture

`resources/atlases/at_atlas_004.json` is a normal environment-atlas manifest with sixteen platform objects. Each object owns a padded frame and ordinary platform metadata. The thick upper platform, `earth_long_platform_r1_a`, retains a closed sequence of `blockable` edges because its visible rock mass is intended to obstruct movement from every side. The fifteen thinner platforms expose only one inset horizontal `walkable` line, making them one-way platforms that Ignatius can jump through from below while using the existing line-collision contract without renderer or simulation special cases.

`resources/generator/level-generator-platforms.json` version 2 registers the Atlas 004 family for static landing, bridge, route-floor, and recovery-floor selection. It does not grant the family the `movingPlatform` role; `rubble_long` remains the exclusive thin shuttle visual. `layered-recovery-traversal-v3` may increase the requested width of a horizontal intermediate support only on broad edges and within the existing maximum-width fit loop, so collision-edge gaps and transition validation remain authoritative.

Atlas loading remains placement-driven at runtime and sequentially discoverable in the Level Editor. Theme colour-map allowlists include Atlas 004 so Earth and Ice recolouring treats it consistently with the existing environment atlases.


## Revision 247 organic layered traversal

`organic-layered-traversal-v4` is the current Earth and Ice traversal implementation. It inherits the broad lower recovery lane and thin vertical-shuttle contracts from `layered-recovery-traversal-v3`, but replaces the upper platform profile with a constrained organic search.

For each horizontal macro edge, the builder chooses a small set of authored static landing assets, including Atlas 004 long platforms when a broad single landing reduces visual repetition. It then searches surface heights inside the local jump envelope. Every adjacent landing in a chain of three or more must differ visibly in Y, the complete chain must occupy a useful vertical range, and the resulting transitions must still pass the shared collision-edge gap, rise, drop, and exposed-landing checks. The abstract route is used only as a bounded envelope and provenance guide.

Ordinary mandatory route anchors may receive a small deterministic Y offset before edge realization. Intermediate supports may deviate farther, but remain bounded around the macro guide. Vertical moving-platform travel is measured between the realized support surfaces rather than the unadjusted route-node coordinates.

The validator exposes `minimumOrganicHeightDelta`, `organicSameHeightAdjacentCount`, `organicHeightDirectionChangeCount`, `longStaticPlatformCount`, and `maximumHorizontalRouteOffset`. Current-theme generation rejects any multi-platform horizontal chain with same-height neighbours or insufficient total vertical range. `layered-recovery-traversal-v3`, `spaced-platform-traversal-v2`, and `forgiving-traversal-v1` remain registered for legacy records.

## Revision 248 headless test-runner diagnostics

`tests/testbench.mjs` remains the dependency-free aggregate headless runner. It now accepts `--progress`, `--profile`, `--filter=<text>`, and `--group=<all|fast|generator>`. Progress mode prints the test name before execution so CPU-heavy generator regressions remain visibly active. Profile mode uses `process.hrtime.bigint()` and `process.memoryUsage()` only in the test layer; these diagnostics do not enter portable gameplay, browser startup, or presentation modules.

`npm test` remains the release gate, but it composes a fast process with the isolated generator runner rather than retaining the complete suite in one Node heap. `npm run test:fast` excludes the generator-heavy group, `npm run test:generator` launches fresh generator processes, and `npm run test:profile` reports slow tests and peak resident memory. Grouping is test-harness metadata based on stable test names and does not alter production code or test assertions.

The revision-247 timeout report was a command-wrapper timeout rather than a leaked asynchronous handle. Later generator growth nevertheless made heap isolation necessary; the current runner topology is documented in revision 302 below.

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

The browser adapter loads `resources/characters/ct_enemies_001.json` and projects the renderer's current virtual viewport dimensions into camera state. The portable simulation owns the one-second clock, deterministic chance and selection rolls, route-direction estimate, off-screen placement, spawn safety checks, authoritative enemy creation, immediate awareness, and cleanup. Ground enemies enter hunter pursuit with the player's current position as their last-seen location. Flying catalog types retain the flying strategy required by their locomotion but begin already alerted and engaged toward the player. Spawn positions lie 10-100 percent of one current viewport width beyond the forward screen edge, preferring the horizontal direction of the exit door and falling back to the right.

## Revision 269 route-distance reward density and one-way actor probes

`src/shared/level-generator-data.js` records `powerUpTarget` in reward-plan and reward-population schema version 3. `generatedPowerUpTargetForRoute` sums the mandatory route in progression order and uses a 5,000-world-unit default spacing. Reward density scales the result around the authored default, with a bounded multiplier so the slider remains useful without exploding pickup counts. `buildBasicRewards` fills unoccupied, non-encounter supports until the target is reached, and `validateGeneratedRewards` treats a shortfall as invalid. The target and realized count are both exposed in generator diagnostics.

In `src/core/simulation.js`, grounded enemy body occupancy distinguishes one-way support from area-blocking terrain. Green `walkable` segments participate in floor selection and downward landing, but are excluded from the rectangular torso obstruction probe used during horizontal ground movement. Blockable, damaging, and killable lines and polygons remain full-body obstacles. Airborne actor sweep logic already followed the same one-way rule, so this change aligns grounded movement with the established collision contract.

## Revision 270 exact ordinary-jump and generated-layout contracts

### Authoritative jump height in the deterministic core

`src/core/simulation.js` treats `ordinaryJumpHeight` and `gravity` as the only authored ordinary-jump parameters. `ordinaryJumpVelocity(gravity, height)` derives the internal launch velocity; state initialization no longer accepts a raw `jumpVelocity` override. During an unboosted ordinary jump, vertical displacement uses the constant-acceleration equation rather than semi-implicit Euler integration. A step that crosses zero vertical velocity is divided at the analytical apex: collision is swept upward to that exact point, `PLAYER_JUMP_APEX` is recorded, and the remaining portion is swept downward. Ceiling contact, landing, reset, and rocket boost leave the analytical ordinary-jump mode immediately. Consequently the open-air apex is exactly 200 world pixels at 30, 60, or 120 Hz while gravity remains 1,490.

`src/browser/game-bootstrap.js` exposes the authored jump height in Game Tuning rather than a timestep-sensitive raw launch velocity. Rocket launch steering remains a separate gameplay contract; its launch-only homing value is 6.7 after recalibration against the exact 200-pixel apex fixture.

### Route-scaled rewards and vertical platform separation

`src/shared/level-generator-data.js` defines `GENERATED_POWER_UP_SPACING_PX = 1000`. The reward planner computes its target from mandatory-route distance and the existing density multiplier, capped at 1.5× the default rate. The placement pass first distributes pickups across distinct safe supports, then packs additional floor-seated pickups from platform ends inward at normal reward-spacing intervals so long routes can satisfy the target without weakening endpoint, encounter, or geometry exclusions.

Power-up catalog weights are 2:1:1 for Random Wrench, Shield, and Overdrive. Selection uses a running weighted-deficit calculation rather than independent random rolls, keeping each generated draft close to a 50/25/25 mix while remaining deterministic for its seed.

The same module defines `GENERATED_MINIMUM_VERTICAL_PLATFORM_SEPARATION = 180`. Candidate placement and independent validation reject horizontally overlapping, non-moving static supports whose walking surfaces differ by less than that amount. Generator diagnostics record the minimum realized separation. Mostly-horizontal route cells, upper access steps, destination tiers, recovery supports, and rendered-under-platform clearance all consume the same constant, preventing narrow vertical sandwiches from reappearing through a secondary placement path. Moving platforms are excluded from this static surface metric and continue to use reserved travel-shaft validation.
## Revision 271 generated-lift rider-safety contract

`src/shared/level-generator-data.js` now treats a Mostly-horizontal vertical shuttle as a moving rider corridor rather than as a thin line sampled at its endpoints. `GENERATED_MOVING_PLATFORM_RIDER_CLEARANCE` reserves 180 world units above the highest platform position, the full platform body at the lowest position, and half a wizard body beyond either side. Yellow blockable support bodies may not intersect this envelope. Green one-way support artwork may not cross the lift's visual sweep.

At a vertical junction, the route realizer opens a dedicated docking slot between the lower and upper ground sections before it materializes the horizontal chains. The complete horizontal path is built first, then the lift searches both sides and the junction slot for a boardable position whose full travel remains clear. The accepted envelope is stored as `movementShaft` and `movementSafetyEnvelope`, reserved against later upper-platform placement, and independently rechecked by validation. `movingPlatformCrushHazardCount`, `movingPlatformSweepOverlapCount`, and `movingShaftIntrusionCount` must all remain zero. Generator version 28 rejects the cavern candidate when this safety contract cannot be satisfied.

This is a generator invariant, not a request to author lethal moving-platform puzzles. Generated levels may challenge timing and navigation, but they must not intentionally crush the player or enemies.


## Revision 272 grounded reward anchors and one-way enemy descent contract

### Generated reward seating

`src/shared/level-generator-data.js` treats the interactive entity `x,y` coordinate as a bottom-center floor anchor. `normalizeRewardGenerationCatalog` therefore forces the normalized vertical offset of the `powerUp` category to zero regardless of stale catalog values. `buildBasicRewards` continues to select safe authored walkable spans and now emits power-ups with `entity.y === support.surfaceY`. `validateGeneratedRewards` independently recomputes that relation and marks a floating power-up inaccessible. `resources/generator/level-generator-rewards.json` records zero offsets for Overdrive, Shield, and Random Wrench pickups. Narrative thought triggers are invisible activation regions and do not participate in visual reward-spacing metrics, though they still require a distinct support and all endpoint/cavern clearances.

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

`src/core/simulation.js` applies the same invariant while consuming navigation. Before route search, it filters both live and baked edges so a downward transition from a green support is accepted only when it is a horizontally moving `drop` explicitly marked `walkOff`, launched at the authored endpoint and moving outward. The executor repeats that check immediately before traversal. This makes old baked graphs safe and removes the loop where a hunter repeatedly launched upward toward a player below, landed back on the source line, and selected the same invalid jump again. `resources/levels/level_001.json` was rebaked with the corrected graph builder.

## Revision 275 input, Twin phasing, and cave-authoring defaults

Browser input now treats standard Gamepad API buttons 6 and 7 as weapon controls. Both digital `pressed` state and analog values above the trigger threshold feed the same portable held/pressed/released weapon frame as keyboard and pointer input.

The green Twin wrench profile now launches two 10-damage homing rockets. Each projectile stores `phasesThroughObstacles` at launch. Portable projectile simulation continues to sweep enemy hitboxes, but omits terrain and reactive-object impacts for phased rockets, allowing them to cross green walkable lines, yellow blockable lines, solids, and closed blocking polygons without losing their target.

New Level Editor levels keep automatic enemy spawning disabled but prefill its one-second probability at 10 percent. Runtime normalization of absent older level data remains disabled at zero percent. New cave windows use a 200-pixel full-black distance. Automatic perimeter decoration defaults to a 30-50 percent deterministic inward-coverage range, and the editor exposes its 40-percent midpoint as one configurable **Inward coverage %** control.



## Revision 276 denser generated power-ups and balanced pickup mix

Generated reward planning now targets one genuine power-up per 1,000 pixels of mandatory-route travel at the default Reward density. Density scaling remains available, with the upper multiplier capped at 1.5 so high-density Grand routes remain placeable without crowding rewards into unsafe geometry.

`resources/generator/level-generator-rewards.json` version 2 assigns Random Wrench twice the share of Shield or Overdrive. `buildBasicRewards` tracks the current generated counts and selects the type with the largest weighted deficit, producing approximately 50 percent wrenches and 25 percent each Shield and Overdrive within each individual draft rather than only across a large statistical sample. Dense placement scans eligible supports from their safe edges inward and preserves ordinary reward spacing and endpoint clearance.

All three generated power-up types share the same support, edge, and progression constraints. Reward-only rerolls can therefore change pickup types without moving their slots. Rewards are resolved before encounters, and fixed non-narrative pickup-clearance envelopes are supplied to the encounter populator. Monsters avoid pickups while the encounter and reward stages retain independent deterministic random streams.


## Revision 279 perimeter density simplification

Automatic cave-perimeter decoration no longer stores or edits `decoration.spacing`. The full-black coverage contract already requires strong overlap, so a large maximum had no effect while a small maximum merely added extra density. `caveDecorationStep` now derives spacing only from rendered tangent span, making scale and asset choice the authoritative inputs. Stale `spacing` values are discarded during normalization. Both manual defaults and generated cavern output use a 2.0 asset scale.


## Revision 280 longer power-up windows

The shared built-in durations in `src/shared/power-up-data.js` are now authoritative at 20 seconds for Overdrive and every wrench mode, and 10 seconds for Shield. Catalog defaults and the authored level-1 demonstration pickups use the same values. Collection still refreshes rather than accumulates duration, wrench effects remain mutually exclusive, Overdrive remains independent, and an active wrench retains highest HUD priority.


## Revision 281 current-schema-only level cleanup

Revision 281 removes the remaining compatibility paths explicitly retained for retired level and snapshot records. Runtime and the Level Editor recognize the current wizard portal family: animated `wizard_entry_door` / `wizard_exit_door` entities and the later invisible immediate `wizard_entry_point` / `wizard_exit_point` alternatives. Root-level player-start fields, `magicPortal`, and plain `exit` entities are no longer migrated. Mailbox entities use only `thoughtText`. Character enemies use only `strategy` and `runSpeed`, and the old vertical-awareness field has no import path. Overdrive uses only the `overdrive` identity and `overdrivePickup` type.

Automatic cavern records now contain the arbitrary closed polygon, stamps, rooms, bounds, and contour metadata without the old top/bottom `profile`. Every containment query uses polygon intersections. State tuning likewise accepts only `ordinaryJumpHeight` plus gravity and derives `jumpVelocity` internally. The lingering `caveWindow.decoration.spacing` property found in `resources/levels/level_001.json` was removed. These are schema cleanups rather than player-facing gameplay changes, so current authored levels, controls, timing, damage, and the Game Manual remain unchanged.


## Revision 282 shorter post-death camera hold

The portable player-death lifecycle keeps its existing cover and burst timing, but `DEFAULT_TUNING.playerDeathAfterglowSeconds` is reduced from 3 seconds to 2 seconds. `src/core/simulation.js` remains the sole timing authority, so HP loss, crushing, and cave-boundary defeats all use the same shorter pause before ordinary respawn. The renderer and camera code require no special-case change.

## Revision 283 dead-code and release-packaging housekeeping

Revision 283 removes internal APIs that had no caller anywhere in the game, editors, tests, or build tools: the collision-index invalidation export, the aggregate cave-window default, unused generator registry/revision exports, the unused wrench-effect classifier, and historical story-reading derivation constants. Their authoritative active helpers and normalized schemas are unchanged.

The obsolete runtime `RocketGlowCache` class is removed because revision 230 already replaced runtime glow generation with authored combined powered-rocket frames in `ct_atlas_wizard_2`. The remaining separable dilation, Gaussian blur, and surface-construction helpers are renamed to `src/presentation/rocket-glow-baking.js` and are retained only for offline atlas work and deterministic kernel tests. Runtime code does not import this module. Discarded Enemy 004 candidate JSON files under `devel/old` are deleted.

`devel/package_update.py` now owns compact revision handoffs. It verifies required project files and synchronized game/editor revision labels, excludes PNG and XCF files plus generated build directories, creates the zip, and performs an integrity and forbidden-extension audit. These changes do not alter gameplay, saved-level interpretation, rendering output, controls, or editor behavior.



## Revision 284 forward-launch rockets, Burst, Phase, and editor Fit cleanup

## Revision 285 Burst spacing tweak

Green Burst now spaces its three forward rockets at 0.18-second intervals instead of 0.09 seconds, doubling the visual gap between rockets while preserving the same damage, fuel cost, and unguided forward behavior.


The Level Editor now exposes one `Fit` control, retaining the former authored-content framing behavior. The broad world-bounds and cave-only fit controls are removed, reducing three overlapping camera actions to the one useful authoring action.

The mutually exclusive wrench group now contains six modes. Green Burst replaces Twin and commits three small unguided forward rockets for one standard fuel payment, activating them at 0.18-second intervals; each deals the same 15 damage as one yellow Triple rocket. Blue Phase inherits the former obstacle-phasing role as one standard-cost, standard-damage homing rocket. Red Bigbomb and magenta Boomerang now launch horizontally along Ignatius's facing direction before homing, reducing immediate roof impacts. Bigbomb damage rises from 90 to 120 while its triple fuel cost, half speed, half homing response, scale, and AoE radius remain unchanged.

Powered rocket artwork remains a one-draw path through `ct_atlas_wizard_2`. The supplemental manifest now has a sixth pure-blue Phase frame, and the image grows vertically by one row while preserving all earlier frame coordinates. Green Twin is not migrated from saved data; `wrenchTwin` is unsupported, consistent with the current-schema-only policy.

## Revision 287 treasure-chest seating refinement

Treasure chests shrink slightly from 72×84 to 68×80 world units and their artwork is drawn 4 pixels lower relative to the authored support point. This keeps the visible base corners seated on narrow bright ledge tops without changing collection behavior, generation ownership, or support-surface validation. The reward metadata also trims chest support requirements slightly, reducing the minimum support width to 180 and edge clearance to 40 so narrow ledges can host the smaller chest more naturally.

## Revision 286 route-scaled treasure density

Generated treasure is no longer capped at one to four chests by level-length preset. `GENERATED_TREASURE_CHEST_SPACING_PX` is 500, and `generatedTreasureChestTargetForRoute` derives a deterministic target from mandatory-route travel. The Reward-density control scales low-density drafts downward, while default and higher values retain the one-per-500-pixel target rather than crowding chests more tightly. Power-ups remain independently targeted by `GENERATED_POWER_UP_SPACING_PX = 1000`, including their existing 1.5× upper density multiplier.

Reward plan and population schema advance to version 4 and record both chest and power-up targets. Chests first use detached reward perches, then distribute across safe main-route supports, upper-access steps, and other reachable static upper perches. Local chest separation may be smaller than 500 pixels because 500 is an average route-density target, not a rigid exclusion radius; placement still preserves entity width, edge clearance, endpoint calm zones, cave containment, and category-aware spacing. Rewards remain generated before encounters, so their reservation envelopes keep enemies away. Validation rejects either chest or power-up target shortfalls and verifies every chest is seated, reachable, and worth positive Score.


## Revision 288 shorter Overdrive and wrench windows

Overdrive and all six mutually exclusive wrench modes now last 20 seconds instead of 30. Shield remains at 10 seconds. The shared definitions, entity-catalog defaults, authored level-1 pickups, manual, and regression expectations use the same values. Refresh behavior, wrench exclusivity, Overdrive coexistence, clear-on-death policy, and sixty-second pickup respawns are unchanged; revision 306 later raises wrench HUD priority above Shield and Overdrive.

## Revision 289 placeable on-screen enemy spawners

`enemySpawner` is an editor-placeable, collision-free entity with no runtime visual. Its compact 64×64 authoring box defines whether it is inside the current camera view, while its bottom-center point defines the attempted enemy arrival location. Each spawner owns an independent one-second timer, `probabilityPercent`, and `enemyPool`; the probability and pool grammar are the same as level-wide Automatic enemy spawning. Off-screen spawners reset their timer and perform no rolls, so time outside the camera cannot accumulate into an immediate arrival when the player scrolls back.

A successful deterministic roll resolves one catalog enemy, requires an unoccupied and collision-safe arrival point, and snaps ground enemies to nearby walkable geometry. Flying enemies use the authored point directly. Arrivals are already alerted and engaged, retain their source spawner identity, enter the ordinary target/combat/cleanup systems, and receive a short procedural purple-blue teleport flash plus the existing temporary bright actor flash. Blocked, occupied, or unsupported attempts create no enemy and wait for the next on-screen roll. The editor renders a procedural marker for authoring only; exported gameplay contains no spawner artwork.


## Revision 290 audit and release-test boundary

Revision 290 restores the revision-283 presentation boundary by removing the accidentally reintroduced `src/presentation/rocket-glow-cache.js`. Runtime powered rockets continue to use authored combined frames from `ct_atlas_wizard_2`; `rocket-glow-baking.js` remains the only offline image-processing utility in that family.

Release validation now has both an allow-side and a deny-side contract. `devel/package_update.py` verifies required project files and synchronized game/Level Editor revision labels, excludes source artwork and generated directories, checks zip integrity, and rejects any known retired path before writing an update archive. This prevents a post-test copy or merge from silently resurrecting deprecated source.

## Revision 291 boss identity, signal receivers, and level_002

Bosses remain ordinary `characterEnemy` runtime records. `applyEditorLevelToWorld` carries `isBoss`, `bossName`, `bossDefeatSignalChannel`, and a one-shot `bossDefeatEmitted` latch into simulation state. Projectile defeat continues through the normal enemy damage lifecycle, then emits `BOSS_DEFEATED` once and activates the optional named channel. The browser presentation selects at most one living boss that is engaged, alerted, or damaged and projects its current/max health into the top-center HUD. No separate boss AI, damage path, or arena controller exists.

Signal-controlled gates are normalized by `src/shared/signal-channel-data.js` and owned by simulation through `world.signalReceivers`. Receiver records keep visual dimensions separate from optional `collisionWidth`, `collisionHeight`, `collisionOffsetX`, and `collisionOffsetY`. While closed and blocking, `syncSignalReceiverCollision` contributes one `signalGate` solid tagged by `signalReceiverId`; activation switches the entity visual state and removes that solid. Atlas-manifest rebuilding preserves receiver-owned solids. Hanging and spiked gates therefore use the same signal channels as levers, keyholes, moving platforms, and boss defeat.

Placeable enemy-spawner runtime records may carry `disableSignalChannel`. `updateEnemySpawners` checks that channel before camera visibility or timing, resets the one-second timer while disabled, and performs no further rolls. This keeps the existing off-screen dormancy and deterministic spawn sequence intact.

`resources/levels/level_002.json` is explicit authored level data produced from generator seed `cinder-vault-291-8f6c2b` and then manually refined. It contains only Fireball Goblin enemy identities, a large final arena, six signal-disabled reinforcement spawners, four wrench pickups, one 900-HP boss, and a full-height collision gate listening to `BOSS_002_DEFEATED`. Runtime does not know or care that the route began as generated content.

Generator regression execution is owned by `devel/run_generator_tests.mjs`. It starts each geometry-heavy contract in a fresh sequential Node child with inherited output and explicit GC support, failing immediately if any child fails. Process isolation prevents temporary drafts from accumulating between tests, while sequential execution avoids concurrent memory contention. This is test infrastructure only; production generation remains synchronous and deterministic.

## Revision 292 cached hunter topology, global boss exit lock, and compact level_002

Hunter navigation has two release layers. Authored levels should carry exact baked profiles in `navigationGraphs.profiles`. `characterEnemyNavigationContext` still validates a baked graph against the current support signature, but static support extraction and edge construction are now cached per world object and normalized mobility-profile key. The cache records the solid, segment, and collision-polygon array identities plus their lengths. Replacing or resizing one of those topology arrays creates a fresh profile cache. Moving-platform endpoint supports and ride edges remain outside this static cache and continue through `MOVING_PLATFORM_NAVIGATION_CACHE`, preserving dynamic boarding and disembarking behavior.

This fallback cache prevents missing or stale baked data from multiplying full graph construction by enemy count and simulation tick. It does not replace release baking. `devel/package_update.py` scans each `resources/levels/level_*.json` and refuses to package a level containing hunter enemies when `navigationGraphs.profiles` is empty. `level_002` now contains two baked profiles: the shared 70 by 105, run-200 goblin profile and the uniformly scaled 196 by 294, run-170 boss profile.

Boss exit locking is a general simulation rule rather than an authored gate convention. Before an inactive `portalExit` measures player proximity, `updatePortalExit` checks the authoritative runtime enemy list. If any record has `isBoss === true` and positive health, the exit remains closed and the sequence does not activate. Once no living boss remains, the unchanged opening, walking, closing, and level-transition sequence proceeds. Boss defeat signals remain independent event channels for spawners, gates, moving platforms, rewards, and later music or story systems.

`resources/levels/level_002.json` retains generator seed `cinder-vault-291-8f6c2b` but replaces its oversized manual arena with a compact authored chamber. Four staggered platforms on each side, six camera-bound spawners, four wrench pickups, the boss, and the exit occupy less than one standard wide viewport. The old signal gate is absent. The route and arena contain Fireball Goblins, Musket Goblins, and three two-bat groups, with no Skeleton Guard records. The spawners use pool `2,3`, remain dormant outside the camera rectangle, and disable when `BOSS_002_DEFEATED` becomes active.

The authoritative `npm test` command now composes `test:fast` and `test:generator` as separate processes. This retains the complete assertion set while preventing the generator macro contracts from inheriting the fast suite's accumulated geometry heap.

## Revision 293 unified enemy scale and Level Editor multi-selection

`src/shared/enemy-scale-data.js` is the single engine-neutral authority for character-enemy placement scale. Level JSON stores base `w`, `h`, `renderScale`, render offsets, and `projectileRadius` plus an optional uniform `scale` that defaults to 1. Portable simulation derives runtime body dimensions, presentation scale, local artwork offsets, and projectile radius from that multiplier. The Level Editor uses the same helper for hit testing, selection bounds, previews, ground-snap sampling, effective W/H display, and navigation-profile baking. Do not add a second Level Editor-only hitbox scale or a renderer-only enemy scale. Character Editor enemy defaults remain the source of base hitbox dimensions.

A scale change does not alter movement speeds, jump height, damage, health, awareness, attack range, or projectile speed. Those remain explicit gameplay attributes. It does alter projectile collision/render radius and the actor body, which in turn changes support clearance and the hunter mobility-profile key. Baked hunter graphs therefore require an exact profile match. The packaging gate independently reconstructs each hunter's scaled profile and rejects stale or missing bakes.

Level Editor multi-selection is authoring UI state only. `selectedId` names the primary editable record and `selectedIds` contains the complete movement/deletion set. Shift-drag performs replacement box selection; Ctrl-click and Ctrl+Shift-drag toggle membership. Only the primary object is exposed to the property inspector. Group movement computes a snapped delta from the primary object and applies that unchanged delta to every member. No multi-selection metadata is serialized into level JSON.

The Asset palette is atlas-agnostic at the UI layer: it enumerates all loaded atlas manifests and stores the chosen atlas in `activeAtlasId` before placement. Runtime level records still carry explicit `atlasId` and `assetId`; the palette merge does not merge manifests or make frame IDs globally unique.

Manual cave-perimeter population intentionally supplies no protected gameplay regions. It remains an inert `caveForeground` presentation operation and may visually occlude gameplay objects. Automatic generator decoration retains its own endpoint, reward, traversal, and cave-containment protections. Foreground overlap must never create collision or navigation geometry.


## Revision 294 Level Editor clipboard model

The Level Editor clipboard is transient authoring state in `state.objectClipboard`; it is not part of the level schema. Each clipboard item records whether it belongs in `entities` or `placements` plus a deep clone of the source record. Multi-object order and relative coordinates are preserved. Copy paste creates fresh IDs, strips automatic-generation provenance from clones, and offsets the group by one snapped diagonal step per paste. Cut removes only unlocked selections; its first paste may restore the original IDs and coordinates, after which the payload behaves like an ordinary copied group.

Cut, Copy, Paste, and Delete are commands rather than tools. The toolbar and keyboard shortcuts call the same functions. Shortcut handling must not intercept keystrokes from text-editing controls. Pasted records become the active selection and the editor returns to Select mode. Selection and clipboard state remain editor-only and must never appear in exported level JSON.

## Revision 295 canonical Level Editor selection bounds

Level Editor placement bounds have one representation and one implementation. The cached `placementWorldBounds(placement)` helper returns `{ minX, minY, maxX, maxY }` and is shared by viewport culling, overlap work, and Shift-drag selection. Entity hit rectangles remain `{ x, y, w, h }` at their local API boundary and are converted through `rectToBounds` before containment tests. Duplicate function declarations are forbidden because JavaScript hoisting silently lets the later declaration replace the earlier one, which previously made atlas placements impossible to box-select.

## Revision 296 Level Editor entity-palette authority

The Level Editor keeps the active entity placement type in transient `state.selectedEntityType`. The right-side Entity palette is the only control that changes that value. Palette buttons also activate Place Entity mode; the toolbar Place entity command only activates the tool and reuses the existing selection. Do not restore a second dropdown or other parallel entity-type state, because duplicate pickers can drift apart and consume scarce toolbar width.

## Revision 297 Level Editor palette presentation

The Level Editor's Asset and Entity palettes share one editor-only card-grid presentation contract. Each panel occupies the available viewport height, keeps search and status controls outside an internally scrolling two-column grid, and draws thumbnails into small per-card canvases. Asset thumbnails crop directly from the already loaded atlas image. Interactive catalog entities compose their default-state visuals from existing atlas frames, while character enemies sample the already loaded idle rig through the ordinary character-runtime helpers. Invisible or legacy editor entities use icon fallbacks. Palette filters and card state are transient UI data and never enter exported level JSON.

## Revision 298 Level Editor palette fitting

Palette grids use `grid-auto-rows: max-content`; cards and thumbnail canvases have explicit minimum/flex heights and may never shrink merely because more results exist. The internal grid owns overflow scrolling. `paletteOpaqueBounds` samples and caches source alpha bounds per image/canvas rectangle. Direct atlas previews crop to those bounds; catalog composites map each crop back into its authored destination rectangle; character previews use alpha-aware transformed command bounds before fitting. This is editor presentation only and does not alter atlas manifests, runtime rendering, or serialized level data.

## Revision 299 editor inspector and preview composition

`level-editor.html` owns transient Level Editor inspector and palette behavior. Visual inspector fields mutate the selected record immediately, invalidate editor placement caches, redraw, and schedule JSON refresh without resynchronizing the focused input on every keystroke. Nonvisual inspector controls use their normal change event and the shared full inspector commit path. The inspector has no Apply command.

Character palette cards must not fit from theoretical rig extents alone. Render the complete idle-pose command list to an editor-only temporary canvas, compute visible alpha bounds from the composited result, then center and contain that crop in the card. This stays editor-only and does not alter runtime character rendering.

Long implementation explanations belong in `DEVELOPER_MANUAL.md`, not inside persistent Level Editor panels. Palette panels are exempt from the compact non-palette panel spacing rules because they need stable wheel-scroll margins and viewport-height card areas.

Palette canvas backing dimensions are derived from the displayed CSS box and a bounded device-pixel ratio before drawing. Fitting calculations must use those prepared dimensions; never calculate against the old fixed 320×240 fallback and resize afterward.

## Revision 300 palette-driven placement preview

The Level Editor keeps `placementPreviewPoint` as transient UI state. Pointer movement over the canvas updates that point only while Place Asset, Place Cave Foreground, or Place Entity is active. `drawPlacementPreview()` builds an unsaved record with the reserved `__placement_preview__` ID and sends it through the normal placement/entity rendering path with preview opacity and a dashed outline. Character enemies and wizard doors use the same nearby-ground snap calculation as final placement. The preview is never inserted into `level.placements` or `level.entities`, never serialized, and never advances authored IDs. A successful asset or entity placement switches immediately to Select mode.


## Revision 351 Level Editor resident world tiles

`draw()` remains a requestAnimationFrame scheduler, but camera movement no longer rebuilds a viewport-sized scene. Ordinary placements, entities, and cave foreground are separate world-space tile layers. Each layer uses 1024-world-pixel tiles, spatial queries avoid empty tile allocation, and zoom tiers reduce tile resolution for distant whole-level views. Tiles are invalidated by artwork mutations, not by pan or zoom.

The WebGL2 path uploads each populated tile as a static texture and repositions resident quads while panning. The Canvas fallback draws the same tile canvases directly. No full-window Canvas layer is uploaded during an ordinary pan frame. A bounded working set prunes old tiles so traversing a large level cannot grow texture memory without limit.

Editor-only vectors live on the transparent `#stage-overlay` Canvas above the world stage. Grid lines, labels, collision guides, cave controls, route diagnostics, selection outlines, placement previews, and marquees are redrawn there directly. A record being moved is temporarily omitted from its resident tile and drawn on the overlay until commit, avoiding tile rebuilds for every pointer event.

Entities and placements retain conservative cached world bounds and are rejected before expensive preview composition. Overlap composites rely on explicit invalidation and stable placement-array identity. Full level JSON serialization is scheduled only by authoring mutations and metadata commits, never by the render loop.


## Revision 302 compact Level Editor controls and generator release topology

Adjacent Level Editor action rows use the editor-only `.compact-button-stack` presentation container. It supplies a five-pixel grid gap and slightly smaller 14-pixel button text while preserving the ordinary two-column `.row` width contract. The generator ownership controls, generator fit/clear/undo/redo controls, and cave-perimeter action controls use this container. It changes neither command wiring nor serialized level data.

Generator release tests are split into four stable groups: `generator-foundation`, `generator-macro`, `generator-content`, and `generator-macro-sweep`. `devel/run_generator_tests.mjs` executes those groups sequentially in four fresh Node processes with `--expose-gc`. The split keeps route/empty-cavern foundations, decorated macro drafts, encounter/reward/perimeter contracts, and the route-only 48-seed macro sweep from retaining each other's temporary geometry. Sequential execution is intentional: concurrent generator children were observed competing for memory and extending the release run beyond the command wrapper's useful window. The macro seed sweep remains a complete 24-seed pass for each of the Earth and Ice themes; only its process boundary changed.

## Revision 303 named test gates, fixed stress fixture, and renderer boundary map

The aggregate testbench now has explicit primary ownership metadata in `tests/test-gate-manifest.mjs`. Every test belongs to exactly one primary shard under `shared`, `editor`, `game`, or `generator`; the overlapping `smoke` selection is intentionally small. Testbench startup validates the manifest, so a new test cannot silently fall into an arbitrary default group. Shared and editor gates each use two fresh Node processes, the game gate uses four, and the generator gate retains its four geometry-isolated processes.

`devel/test-gate-runner.mjs` is the common sequential runner. It reports every shard as passed, failed, timed out, or skipped and continues to the gate summary rather than obscuring earlier results after a late failure. Completed results are written under excluded `.build/test-gate-report.json` with a SHA-256 fingerprint of test-relevant source. `npm run test:release:resume` may skip only shards that already passed against the identical fingerprint. Ordinary `npm test` always starts a fresh complete release gate.

The permanent `tests/fixtures/level-editor-stress.json` workload freezes 1,039 placements and 68 entities, including 986 cave-foreground records. `EDITOR_STRESS_BASELINE.md` records its hash, structural metrics, and browser comparison procedure. It is fixture data rather than a shipped level and must not be scanned as campaign navigation content by the release packager.

`devel/audit_renderer_boundary.mjs` and `RENDERER_BOUNDARY_AUDIT.md` record every approved production owner of direct Canvas 2D calls. The main game backend remains `src/presentation/`; `src/browser/game-bootstrap.js` has one narrow minimap exception, while each editor owns its standalone authoring surfaces. Core and shared modules have no approved direct drawing. The first WebGL2 backend must consume existing camera, layer, bounds, visual-command, and level-record contracts rather than introducing a GPU-authoritative scene model.

Release packaging now also validates the project directory and output archive names, named gate scripts, synchronized documentation notes, required infrastructure files, safe unique ZIP paths, and absence of transient coverage, test-result, log, backup, temporary, nested ZIP, PNG, and XCF artifacts. Gameplay, level schema, and editor behavior are unchanged.

## Revision 304 browser input edge buffer

`src/browser/browser-input.js` owns both current digital held state and a pending edge buffer for `jump`, `boost`, `weapon`, `interact`, and `drop`. Keyboard and pointer events latch aggregate action transitions when they occur. Gamepad transitions are latched when the Gamepad API is polled. Multiple physical bindings for one action are combined before transition detection, so releasing one jump key while another remains held does not invent a release.

The browser animation frame calls `input.sample({ consumeGameplayEdges: false })`. Sampling refreshes held state and exposes every pending press/release without clearing it. If the fixed-step accumulator runs no simulation step, those edges remain pending. After the first fixed step, `game-bootstrap.js` calls `input.consumeGameplayEdges(stepInput)` and clears only edge fields actually delivered in that frame. Later catch-up substeps still receive held state through `createSubstepInputFrame` but no repeated edges.

This is a browser-adapter responsibility. `src/core/simulation.js` remains event-source agnostic and receives ordinary `InputFrame` snapshots. A frame may validly contain both an action press and release when a complete tap occurred between fixed steps. Jump handling intentionally processes release before press, allowing a quick airborne release-and-repress to arm and start the attached boost in one deterministic simulation step. Renderer frame rate must never determine whether a digital gameplay transition reaches simulation.

## Revision 305 projectile collision and wrench profiles

`findProjectileTerrainImpact` is the shared terrain boundary for player and enemy projectiles. It deliberately excludes collision segments whose kind is `walkable`, so one-way green standing lines do not intercept shots from either owner. Rectangular solids, `blockable` segments, and blocking collision polygons remain candidates in the same swept-circle query. This changes projectile interaction only and does not change actor support or one-way platform physics.

`src/shared/power-up-data.js` exports `NON_HOMING_ROCKET_SPEED_FACTOR`, currently 2, and owns the complete built-in profile data. Yellow Fivefold and green Target set `aimAtNearestForwardTarget`; simulation resolves the nearest active target in the player's facing half-plane at launch time, converts that line to a base direction, then applies the profile fan. The rockets remain non-homing afterward. With no forward target they use their ordinary facing direction. Cyan Dart also uses the shared speed factor but keeps direct facing aim.

Blue Homing Triple keeps normal homing target selection and uses the former yellow -12, 0, and +12 degree fan, assigning separate targets when available. Blue and yellow both apply a small deterministic shared wedge-direction jitter of at most 2 degrees per volley so repeated volleys do not share one rigid fan direction, while the authored internal spacing of each wedge stays unchanged. Yellow uses five evenly spaced launch angles at -7.5, -3.75, 0, +3.75, and +7.5 degrees. Its five rockets deal one-fifth standard damage each. Blue creates three one-third-damage projectiles. Yellow, cyan, green, blue, and magenta use a 0.5 launch-fuel multiplier and one standard rocket of nominal total damage. Magenta's catch refund is still calculated from its actual reduced launch cost. Red Bigbomb is unchanged. The internal effect IDs remain stable for saved data; `wrenchYellow`, `wrenchGreen`, and `wrenchBlue` present the labels Fivefold, Target, and Homing Triple.

## Revision 306 wrench-first Power HUD selection

Built-in wrench effects use Power HUD priority 200, Shield uses 150, and Overdrive uses 100. `prioritizedActivePowerUpEffect` still sorts active effects deterministically by priority, activation time, and stable ID, but for a canonical built-in effect it uses at least the current built-in priority. This is a small save-compatibility migration: active records serialized before revision 306 may embed the former wrench priority 50, yet an active wrench must still be displayed ahead of Shield and Overdrive after restoration. The selection rule affects presentation only; all compatible effects continue ticking and applying gameplay simultaneously.


## Revision 307 yellow Fivefold volley

The yellow wrench profile keeps its stable serialized ID `wrenchYellow` but now presents the label Fivefold. One launch creates five non-homing rockets at -15, -7.5, 0, +7.5, and +15 degrees around the nearest-forward launch-time aim. Each rocket uses a `1 / 5` damage multiplier, so a complete five-hit volley still delivers exactly one standard rocket's nominal damage. Half fuel cost, shared double non-homing speed, radius, visual scale, collision, and target-selection rules are unchanged.

## Revision 308 player rocket launch admission

Player rocket launch admission is fuel-gated and input-edge-driven, not timer-gated. `src/browser/browser-input.js` buffers each `weaponPressed` transition until a fixed simulation step consumes it; `src/core/simulation.js` then attempts one launch for that edge and may accept another edge on the very next fixed step. There is no `rocketLaunchCooldown` tuning value, weapon cooldown timer, or power-up cooldown multiplier. This keeps firing cadence independent of renderer frame rate and lets fuel remain the primary limiter.

Legacy save objects are plain JSON and may carry surplus `weapons.launchCooldownTimer` or embedded `launchCooldownMultiplier` properties. Runtime and shared normalization deliberately ignore them. Holding a key still produces held state rather than synthetic repeated press edges, so automatic fire is not part of this contract. Enemy melee and projectile cooldowns are separate AI pacing data and remain unchanged.


## Revision 310 shared wrench wedge-direction variation

Rocket profiles normalize an optional non-negative `initialAngleJitterDegrees`. `src/core/simulation.js` now samples it once per volley, before any projectiles in that volley are created, and applies the same resulting angular offset to every projectile in the volley. The random unit is derived from the simulation seed plus stable level-load and volley salts, preserving deterministic replay and future C++ parity. Projectiles retain the applied `launchAngleJitterDegrees` as portable diagnostic state even though the value is shared across the volley.

Yellow Fivefold and blue Homing Triple both enable this field with the shared 2-degree bound. Their authored internal fans remain unchanged at `[-7.5, -3.75, 0, 3.75, 7.5]` and `[-12, 0, 12]` respectively, so the wedge spacing stays stable while successive volleys no longer retrace one identical set of paths. Fuel, damage, speed, target selection, homing, and collision rules are unchanged.

The same revision renamed the visible lightning effect to Overdrive. Revision 319 later made `overdrive` its canonical serialization ID. `OVERDRIVE_PASSIVE_FUEL_RECOVERY_DRAIN_FACTOR`, currently `0.9`, defines a separate passive recovery floor relative to `attachedBoostDrainRate`. `updateFuelRecharge` uses the greater of this floor and any currently eligible ordinary recharge rate, never their sum. Overdrive recovery ignores the ordinary ground latch and recharge delay, remains active during attached boost, and may refill to `fuel.max`; the authored boost drain itself is unchanged, producing a net hover drain of 10 percent while Overdrive is active. The Canvas fuel bulb treats this passive flow as active recharging even while the rocket is firing.


## Revision 311 WebGL2 presentation backend

`src/presentation/webgl2-renderer.js` is the GPU boundary for the game canvas. It owns WebGL2 context creation, shader compilation, one dynamic interleaved sprite vertex buffer, texture caching, premultiplied-alpha blending, solid-colour quads, dynamic Canvas texture updates, context-loss recovery, and GPU diagnostics. It must not import portable core code or own gameplay state.

`src/presentation/canvas-renderer.js` remains the scene coordinator and compatibility renderer. At startup it prefers WebGL2. When available, the visible canvas is WebGL2 and a hidden transparent Canvas 2D surface becomes a staging layer. Main world atlas visuals, cached overlap groups, actor-front visuals, cave foreground visuals, and cutout rectangles are queued directly as GPU quads. Procedural actors/effects and mask/overlay content are drawn into the staging surface in two ordered passes and uploaded into a reusable dynamic texture. If WebGL2 is unavailable at startup, the visible canvas uses the original Canvas 2D path without changing simulation or asset contracts.

The backend uses `UNPACK_PREMULTIPLY_ALPHA_WEBGL` with `ONE, ONE_MINUS_SRC_ALPHA` blending so staged Canvas content and atlas textures compose consistently. Texture uploads are static after first use except for the staging canvas, which updates with `texSubImage2D`. Colour-map changes, cave-window changes, and newly loaded atlases invalidate the GPU texture cache deliberately. WebGL context restoration recreates programs, buffers, and textures from the retained browser image/canvas sources.

## Revision 312 direct WebGL2 particle-effect pass

Revision 312 keeps the hybrid Canvas/WebGL2 presentation split but moves three high-frequency effect families out of the staging canvas and into direct GPU sprite batches: rocket smoke trails, projectile explosion flashes, and Ignatius death particles. `src/presentation/canvas-renderer.js` now performs an extra ordered WebGL pass between the lower scenery/actor staging upload and the upper actor staging upload so these effects still sort correctly around scenery, projectiles, and the player.

`src/presentation/webgl2-renderer.js` now supports per-sprite blend selection between ordinary premultiplied alpha compositing and additive blending. The Canvas renderer uses cached white particle sprites (soft glow, ring, diamond, and cross spark) plus the existing smoke stamp cache to render these effects without regenerating Canvas gradients per particle. Unported dynamic effects still use the staging canvas, so the fallback contract and the rest of the hybrid renderer remain unchanged.

## Revision 313 direct WebGL2 enemy projectile pass

Revision 313 extends the hybrid renderer by moving the launched enemy projectile families themselves into a direct WebGL2 pass. Fireballs, musket balls, and thrown rocks now render as GPU sprite batches in `src/presentation/canvas-renderer.js`, ordered after lower staged actors/effects and before the upper staged pass that still contains player rockets, Ignatius, score popups, and other Canvas-driven content.

Fireball trail particles now also use the dedicated GPU pass, reusing cached soft-glow sprites and additive blending. Musket-ball and rock projectiles prefer their character-atlas sprites and fall back to small cached baked canvases if an atlas frame is unavailable. The pure Canvas fallback path and the remaining hybrid-staging contracts stay intact.

## Revision 314 direct WebGL2 player-rocket pass

Revision 314 extends the hybrid presentation stack with a dedicated direct WebGL2 pass for launched player rockets. `src/presentation/canvas-renderer.js` now draws rocket projectile bodies and their simple flame treatment as GPU quads, reusing cached particle sprites for the exhaust and applying pivot-aware offsets so the atlas artwork stays aligned with the simulation projectile origin.

This pass sits alongside the existing direct world-effect and enemy-projectile passes. The renderer merges the handled projectile IDs before the upper staging pass so player rockets are not redundantly redrawn on Canvas. Player-specific rig animation, HUD-adjacent overlays, and other remaining dynamic presentation still stay on the staging path.

## Revision 315 direct WebGL2 actor and pickup passes

Revision 315 extends the GPU boundary to dynamic world actors. `src/presentation/canvas-renderer.js` now has direct WebGL2 paths for target markers, pickups, power-up composites, runtime character enemies, enemy health bars, and the player rig. Runtime character animation remains CPU-authored and deterministic; only rasterization and blending move to the GPU.

`queueCharacterProjectPoseWebGL` consumes the same `buildRuntimeCharacterDrawCommands` output used by the Canvas renderer and converts each part into a rotated, mirrored textured quad. Tint canvases remain cached image sources for shield and low-health overlays. The player fuel bulb, debug guides, mailbox text, cave mask, and miscellaneous procedural geometry still use the staging canvas. Score popups are cached into small reusable text textures and portal-intro glow is drawn as a direct additive GPU sprite.

## Revision 316 WebGL parity corrections

A direct comparison with the revision 310 Canvas path identified two ordering/effect mismatches in the later GPU actor pass. Revision 316 restores the original semantic order by drawing `drawPlayerDeathCoverWebGL` after `drawPlayerWebGL`, then score popups. It also gives every loaded character atlas asset a cached white `hitFlashCanvas`.

`queueCharacterProjectPoseWebGL` now supports a secondary additive overlay channel in addition to the existing shield/low-health tint channel. Runtime enemies use that channel for their damage flash, and Ignatius uses it without suppressing shield or low-health treatment. Simulation, animation sampling, bounds, and fallback Canvas rendering remain unchanged.

## Revision 317 renderer selection and context-loss boundary

Before revision 317, a failed WebGL2 backend initialization could theoretically acquire the visible canvas context and then return `null`, after which the same canvas could no longer become a 2D context. `probeWebGL2RendererSupport` now initializes and disposes the complete backend on a scratch canvas first. Only a successful probe allows the visible canvas to request WebGL2; otherwise `createRenderer` uses the original visible Canvas 2D path.

A renderer instance that already owns a WebGL canvas no longer redirects to `renderCanvas2D` while its context is lost, because that Canvas target is the hidden staging surface. It pauses presentation until restoration recreates GPU resources. This keeps startup compatibility fallback and runtime context restoration as separate, explicit states.

## Revision 351 Level Editor WebGL2 composition boundary (superseded by revision 356)

The Level Editor uses the shared `src/presentation/webgl2-renderer.js` backend as a resident world-tile compositor. Canvas drawing helpers remain authoritative for producing tile artwork, but the visible WebGL stage receives only static tile textures. The changing authoring overlay is a separate DOM Canvas and is never round-tripped through a full-window GPU texture upload.

WebGL2 capability and backend initialization are tested on a disposable probe canvas before the visible editor stage acquires a context. `?webgl=1` requests this path and `?webgl=0` forces the direct Canvas tile path. The GPU backend owns no level records, selection state, transforms, or editor commands.

## Revision 319 Overdrive identity cleanup

The lightning power-up now has one canonical portable identity across shared data, runtime state, level JSON, the entity catalog, generated reward metadata, and the Level Editor: effect ID `overdrive` and entity type `overdrivePickup`. `src/shared/power-up-data.js` exposes it as `POWER_UP_EFFECT_IDS.OVERDRIVE`; runtime pickup discovery in `src/core/simulation.js` and generated reward accounting in `src/shared/level-generator-data.js` use the same names directly.

There is no `speedShot` compatibility translation. Bundled levels and fixtures were migrated in the same revision, so retaining a second accepted identity would only preserve unnecessary serialization debt. The historically retired `rocketOverdrive` identity is still rejected.

## Revision 320 browser-validated hybrid rollback

Live browser testing revealed that the direct WebGL2 dynamic-sprite pass could produce invisible character and projectile textures while static atlas scenery and Canvas-composited HUD layers remained healthy. Revision 320 therefore changes the production render graph to a conservative hybrid boundary.

Static atlas scenery and foreground layers still use direct WebGL2 batches. Dynamic actors and gameplay effects are drawn in their established Canvas order onto a transparent staging canvas, then uploaded and composited once by WebGL2. This preserves GPU acceleration for dense static scenery and final composition without risking missing gameplay-critical visuals. The direct actor/projectile methods are retained as experimental code, not as the active production path.


## Revision 323 opt-in GPU-resident render graph

The renderer now has two intentionally separate production paths. `createRenderer(canvas, { preferWebGL2: true })` is the only route that may acquire WebGL2; omission or a failed scratch-canvas probe leaves the visible game canvas on the unchanged Canvas 2D renderer. `game.html` supplies that option only for the existing `?webgl=1`-style opt-in switch.

In the WebGL2 path, `src/presentation/character-runtime.js` keeps both the cropped compatibility Canvas and the original atlas image/source rectangle for every runtime frame. `src/presentation/canvas-renderer.js` queues atlas-backed character and projectile quads from the original image, while cropped tint canvases remain optional overlay textures. `src/presentation/webgl2-renderer.js` pins known static sources, restores them after context restoration, batches source rectangles from shared atlases, and reports estimated resident texture bytes.

The normal opt-in frame graph is:

1. Direct resident static-world atlas/cutout batches, with a conditional Canvas layer only for collision/asset guides or artless fallback geometry.
2. Direct portal, target, pickup, enemy, supported effect, projectile, player, fuel-bulb, death-cover, and score-popup batches.
3. Conditional transparent staging layers only for unsupported residual effects/projectiles and the puppet guide.
4. Direct actor-front and cave-foreground batches.
5. A dedicated reduced-resolution cave-mask texture, refreshed only when its render key changes.
6. A final conditional transparent layer for active story or debug overlays.

Canvas-produced colour maps, overlap composites, foreground treatments, masks, tint surfaces, text sprites, and particle stamps are presentation caches, not authoritative scene data. Their pixels may be uploaded and retained by WebGL2, but gameplay state, level records, collision, navigation, and camera transforms remain CPU-owned portable data. A future GPU-only preparation phase can replace individual cache producers without changing those boundaries.

## Revision 324 procedural-sprite and cave-mask GPU contracts

A queued WebGL sprite with no explicit atlas rectangle means “use the complete source texture.” `WebGL2RendererBackend.queueSprite` must distinguish omitted `sourceWidth` / `sourceHeight` values from numeric zero. Coercing `null` with `Number(null)` collapses UVs onto one texel and is especially destructive for procedural textures whose upper-left pixel is transparent. Atlas-backed calls may continue to provide their own source rectangles.

The direct WebGL effect pass consumes the same portable projectile and `effects.smokePuffs` records as Canvas. Player rocket path samples, enemy-fireball particles, projectile explosion state, impact puffs, reactive-object destruction smoke, and teleport effects remain simulation-owned data. Presentation converts them to batches of pinned smoke, glow, ring, disc, diamond, and flame textures. No GPU-only effect state is authoritative.

The WebGL cave window is geometry, not a screen texture. `buildCaveWindowGpuMaskGeometry` compiles the authored cave spline, organic feather bands, and outer contour into cached world-space arrays. `WebGL2RendererBackend.drawCaveMaskGeometry` uploads those arrays only when the cave definition changes. Each frame it applies camera, zoom, and parallax uniforms, draws the feather mesh, writes the outer contour with odd-even stencil inversion, and paints black only where the stencil indicates the exterior. A stencil-capable context is requested explicitly. The existing Canvas mask remains a presentation fallback, preserving the default Canvas renderer and unusual WebGL implementations without usable stencil support.


## Revision 327 temporary melee/ranged tuning layer

Gameplay balance experiments use seven neutral multipliers in `DEFAULT_TUNING`: separate melee and ranged health, run-speed, and attack-rate scales, plus a ranged projectile-speed scale. An enemy is classified as ranged when its runtime `attackMode` is `projectile`; all other character enemies use the melee group. This includes flying bombers in the ranged group.

The authored enemy values remain authoritative. Health stores an unscaled `tuningBaseMaxHealth` and an applied scale so changing the slider can preserve the current health percentage of already living enemies. Run speed and projectile launch speed are multiplied only when consumed. Attack rate changes the rate at which attack wind-up, attack animations, post-attack cooldowns, and bomber drop timers advance, so a factor of 2 represents approximately twice the complete attack cadence rather than merely shortening one recovery delay.

The browser Game tuning panel exposes these as temporary multiplier sliders. Defaults are exactly `1`, serialization keeps the chosen test values, and level/catalog JSON is not rewritten. After balance testing, the accepted factors can be baked into each enemy definition and level override, then the multipliers can be reset to `1` or removed without changing the resulting gameplay.


## Revision 328 browser identity and enemy namespace notes

All browser-facing tools now share the root `favicon.ico`, a multi-resolution icon built from the authored projectile rocket. It is presentation metadata only and has no runtime loading or renderer dependency. The compact release packager retains ICO files while continuing to omit PNG and XCF source artwork.

Enemy catalogs are sparse-key maps rather than numeric arrays, so missing numbers do not affect runtime enumeration. Family-range renumbering remains a coordinated data migration because known character-project preload lists, authoring-tool project lists, generator special cases, levels, and regression fixtures contain explicit IDs.


## Revision 329 enemy family namespaces

Enemy catalog IDs are sparse keyed identifiers, not array positions. Revision 329 formalizes family ranges without changing catalog lookup semantics: skeleton variants occupy `001-009`, goblin variants occupy `010-019`, and bat variants occupy `020-029`. The active projects are `enemy_001`, `enemy_010`, `enemy_011`, and `enemy_020`. Selection expressions continue to resolve by the numeric suffix of actual catalog keys, so holes are valid and do not create placeholder enemies.

A family migration must update the catalog ID, character ID, rig ID, animation IDs, atlas ID and image filename, explicit renderer preloads, editor project tables, generator special cases, level placements, numeric spawn filters, and tests as one atomic change. Revision 329 does this with no legacy aliases. The two goblins share `ct_atlas_enemy_010` while retaining separate `ct_rig_enemy_010` and `ct_rig_enemy_011` geometry.


## Revision 330 ranged attack permission model

For projectile attackers, authored `attackRange` and `preferredAttackRange` describe tactical positioning rather than a hard maximum firing distance. Actual fire permission is simulation-owned and requires a current `characterEnemyCanNoticePlayer` result, which enforces awareness range and facing cone, plus a projectile-specific reach and trajectory check. Awareness memory may sustain pursuit but cannot authorize a shot.

`characterEnemyProjectilePathClearFromPoint` is the common trajectory validator. Straight and homing projectiles test lifetime and a swept direct lane; ballistic projectiles solve and sample their arc; dropped projectiles solve vertical flight time, projected horizontal landing position, lifetime, and the sampled fall path. Shot-planning probes include reactive obstacles even though ordinary projectile resolution handles those objects separately. The same validator runs at attack release so a wind-up cannot fire through newly intervening cover.


## Revision 331 authored fireball ownership

When an authored enemy-fireball atlas frame is available, that frame owns the projectile body in both rendering backends. The WebGL2 path may draw the simulation-owned emitted particles behind it, but it must not add a separate circular core glow beneath the atlas sprite. The procedural circular body is retained solely as a missing-art fallback, matching Canvas 2D and preserving the authored teardrop silhouette.


## Revision 332 Tri-fireball Goblin and generic straight volleys

Revision 332 adds `enemy_012`, the Tri-fireball Goblin. It shares `ct_atlas_enemy_010` with the other goblins, owns a copied `ct_rig_enemy_012` project, and uses copied Fireball Goblin idle, walk, attack, hurt, and death clips so later visual tuning can remain isolated. The new catalog entry keeps the ordinary Fireball Goblin damage per projectile, uses slightly smaller radius-12 fireballs, disables homing, and launches three shots at -15, 0, and +15 degrees around the launch-time line to Ignatius.

Portable enemy projectile state now supports `projectileVolleyCount` and `projectileVolleyHalfAngle`. The release path creates one ordinary projectile record per angle and tags each with stable volley metadata, leaving projectile kind, frame, straight travel, homing, collision, damage, and future presentation choices independent. This is the reusable seam for later single, triple, and quintuple straight arrows, spinning axes, and other authored projectile families without adding enemy-specific launch branches.

Shot validation evaluates the actual trajectory of every straight volley member against Ignatius's body, projectile lifetime, radius, blocking solids, blockable lines and polygons, and reactive obstacles. A volley may begin and release when any one member has a plausible unobstructed hit; it is not incorrectly rejected merely because another member will strike scenery. The same any-member rule is rechecked at the authored release frame.


## Revision 333 camera-relative cave preview

The Level Editor no longer draws the cave perimeter at its unshifted authored coordinates while gameplay draws it with foreground parallax. `editorCaveParallaxOffset` constructs a renderer-compatible view from the editor camera and CSS viewport, then delegates to `computeCaveWindowParallaxOffset`. The cave spline, organic gradient guides, exact full-black boundary, point handles, and all `caveForeground` placements are rendered at authored position minus that offset.

Editor interactions remain coordinate-safe. Cave-point insertion and foreground placement add the offset before storing a record; hit testing, guides, labels, selection outlines, and marquee selection use the displayed placement. Drag deltas remain valid because the camera offset is constant during a drag. This keeps portable level data camera-independent while making the authoring viewport an honest preview of what a play camera centred on the same area will reveal or cover.

## Revision 334 development-only enemy-hit effect laboratory

`devel/enemy-hit-effect-lab.html` and `devel/enemy-hit-effect-lab.js` form a standalone browser diagnostic, not a production rendering layer. The lab imports `loadRuntimeCharacterProject`, animation sampling/draw-command helpers, and `createWebGL2RendererBackend`; it therefore exercises the actual Fireball Goblin character data and the production resident-texture batching seam. It intentionally owns direct Canvas calls inside `devel/`, which remains excluded from the production renderer-boundary audit.

The diagnostic keeps no gameplay-authoritative state. Its local effect envelopes reproduce the browser primitives used by an enemy hit and report requestAnimationFrame delay, synchronous draw time, late-frame count, and WebGL texture uploads. Resetting and prewarming the WebGL texture cache are explicit diagnostic operations on the lab-owned backend only. They must not be wired into the game loop or used to mutate portable simulation behavior. A future production fix should be made in `src/presentation/` and verified both in the game and in this lab.

Revision 334 also replaces `resources/levels/level_002.json` with the supplied authored update. Level JSON remains portable input data and is not coupled to the diagnostic page.

## Revision 335 enemy-hit diagnostic attribution and presentation seam

The enemy-hit laboratory now separates scheduling, synchronous action, renderer submission, long-task, and texture-upload signals. Measurements are baseline-relative and invalidated by visibility/focus pauses. Its production probes may instantiate portable simulation state from `resources/levels/level_002.json`, but remain development-only and must not mutate campaign data or become a second gameplay implementation.

Canvas and WebGL character hit flashes now share the same prepared-surface architecture. `canvas-renderer.js` creates `hitFlashCanvas` once during character loading; the Canvas path composites it with `lighter`, while the WebGL path queues the same source as an additive resident sprite. Live enemy-hit rendering must not reintroduce per-frame `ctx.filter` changes.

Revision 340 extends that rule to Ignatius in the Canvas renderer as well. `drawPlayer()` now uses the same prepared additive `hitFlashCanvas` overlay as enemy hits instead of setting `ctx.filter` on the live world context. This keeps wizard injury feedback visually aligned with enemy injuries while avoiding Chrome's deferred filter/compositing hitch.

Damage awareness remains portable simulation state. The projectile-impact helper records last-seen player coordinates, awareness, engagement, facing, and route-repath intent, but does not build a second navigation context after the normal enemy update has already run. Current support discovery and route planning remain owned by the ordinary hunter update on the next fixed step.

## Revision 336 asynchronous presentation attribution

Enemy-hit diagnostics must not place a permanent CSS backdrop filter over the canvas under test. The laboratory control panel is opaque and unfiltered; CSS blur is represented by a separate timed probe. Combined visual definitions are component sets, and `componentProgress` applies the individual component duration rather than stretching every component to the enclosing measurement window.

The laboratory separates synchronous renderer time from the remainder of the requestAnimationFrame interval with `maxDeferredMs`. This is an attribution aid, not a promise that all remainder is GPU time: browser scheduling, rasterization, compositing, presentation, and operating-system pauses can all live there. Production fixed-step probes remain separate from visual probes. The live `hudblur=0`/`backdrop=0` developer query only toggles a root CSS class and must not alter portable state, serialized levels, or renderer selection.

## Revision 337 damage presentation audition boundary

`devel/damage-effect-showcase.html` and `devel/damage-effect-showcase.js` are browser-only diagnostic surfaces. They may import presentation character-runtime helpers and load authored character projects, but they do not define portable gameplay behavior or production effect policy. The page intentionally uses prepared tinted sprite surfaces, ordinary alpha/additive compositing, geometric pulses, and cached particle canvases; live Canvas filters are excluded so Chrome's deferred filter rasterization cannot contaminate candidate comparisons. Its measurements separate synchronous action and draw work from subsequent requestAnimationFrame delay.

## Revision 341 desktop renderer and packaging defaults

The renderer preference remains environment-sensitive rather than globally changing browser behavior. `shouldPreferWebGL2Renderer()` honors an explicit `webgl`/`webgl2` query value first, then chooses WebGL2 when the narrow Electron preload bridge is available and Canvas 2D otherwise. Electron packaging stages the project-root `favicon.ico`, supplies it to both `BrowserWindow` and electron-builder's Windows icon setting, and disables signing through `win.signExecutable: false` so executable resource editing remains available under electron-builder 26 while still allowing resource editing.


## Revision 342 upward-only ordinary-jump braking

Ordinary jump height remains authored as `ordinaryJumpHeight` and launch velocity remains derived analytically from gravity. Revision 344 makes Down a full-airborne gravity modifier: whenever Down is held, the simulation uses `2 * gravity` during both ascent and descent. Because launch velocity is unchanged, holding Down from takeoff still halves the ordinary 200-pixel jump to an exact 100-pixel apex at 30, 60, or 120 Hz, while pressing it later yields an intermediate apex. The same force curbs boost-kick travel and accelerates falling. Independently, the existing input rule grants one-way-platform drop-through while grounded or descending, so holding Down during a fall both doubles gravity and passes through green walkable lines.

The analytical apex split uses the braking acceleration only for the upward segment. If a fixed step crosses the apex, its remaining downward segment immediately returns to normal gravity. Down while level or falling never becomes a fast-fall force and continues to own the existing one-way-platform drop-through timer. Rocket-assisted motion also bypasses ordinary-jump braking.

Revision 345 adds enemy contact damage as a separate damage channel. Overlap damage is `0.25 * max(attackDamage, projectileDamage)` for the strongest overlapping living enemy. It uses `health.contactInvulnerabilityTimer` rather than the ordinary `health.invulnerabilityTimer`, so contact cannot suppress a melee or projectile hit on the same or adjacent frame, and ordinary attack invulnerability cannot suppress contact damage. Shield protection still applies to both channels.

Revision 347 re-voices the alternate synthesized tunes rather than applying one blanket lead transpose. Each melody is placed in Level_001's low register according to its original tessitura, and every true bassoon foundation is kept strictly below the lead to prevent accidental voice crossing. Decorative bell accents remain independent of the bass hierarchy.

Revision 349 gives the Level Editor cave-foreground preview a spatial broad phase. Dense generated perimeter decoration is partitioned into world bins and each camera redraw queries only nearby entries after accounting for cave parallax. Hidden generated foreground is filtered before artwork and detail passes, so a level with more than a thousand perimeter sprites no longer scans and processes the full layer on every pan frame.

## Revision 352 cave-warning geometry cache

The Level Editor's cave-geometry warning pass is camera-independent and must not be recomputed because the camera pans. `gameplayGeometryCaveWarnings()` now owns a two-level cache:

- A cave signature contains enabled state, feather distance, and every authored point's position and smoothing mode. A signature change rebuilds one sampled cave polygon with `sampleClosedCaveSpline(..., 20)`.
- A `WeakMap` stores each relevant terrain placement's separation result under a transform signature containing position, dimensions, rotation, and angle. Editing one placement invalidates only its entry naturally; replacing a placement object also misses the weak cache safely.

`src/shared/cave-window-data.js` exposes `cavePolygonSeparation(sampledPolygon, polygon)` for callers that already own sampled geometry. `caveWindowPolygonSeparation(points, polygon, steps)` remains the convenience wrapper and preserves its existing contract.

This cache belongs to editor diagnostics rather than the resident tile caches. Camera position, zoom, renderer choice, grid visibility, labels, and guide switches do not affect warning geometry and therefore do not invalidate it.

## Revision 354 editor pan presentation boundary (superseded by revision 356)

Level Editor pan gestures are presentation-only previews. `#stage` and `#stage-overlay` are siblings inside `#stage-pan-layer`, which is paint-contained by `#canvas-wrap`. While a pan is active, camera state follows the pointer but no Canvas or WebGL render frame is submitted. The complete existing scene is translated through one CSS transform, preserving artwork/guide registration and preventing either surface from independently escaping the viewport. The first post-pan render draws the authoritative final camera and then clears the temporary transform before presentation. Authoring data, world-space coordinates, tile caches, cave parallax math, hit testing, and exported levels remain unchanged.

## Revision 355 level-renderer baseline boundary

`level-renderer-baseline.html` is a development-facing root surface whose implementation lives in `src/tools/level-renderer-baseline.js`. The tool owns input, camera inspection, cadence sampling, and diagnostics only. It must render authored levels by calling portable `applyEditorLevelToWorld` and the production `src/presentation/canvas-renderer.js`; it may not grow a second atlas, entity, cave, or layer renderer.

`RocketfrockRenderer.setViewOverride()` is a presentation-only diagnostic seam. The override supplies a top-left world position and backing-pixel zoom to `computeView()`, while normal gameplay continues to derive its view from portable camera state and responsive viewport metrics. The override must never be serialized, copied into simulation state, or used by browser gameplay startup. Passing `null` restores the normal camera path.


## Revision 356 shared runtime renderer in the Level Editor

Live browser testing of revision 355 established the clean boundary: the isolated production Canvas2D game renderer panned and zoomed level 002 smoothly, while the Level Editor's tile/WebGL/compositor variants remained slow or visually unstable. Revision 356 therefore removes the editor-specific base renderer rather than adding another cache layer.

`level-editor.html` now owns two presentation surfaces only:

- `#stage` is rendered by the ordinary `src/presentation/canvas-renderer.js` instance with `preferWebGL2: false`. The editor converts its authored level through portable `applyEditorLevelToWorld`, loads the same environment and character resources, and supplies a top-left view through `RocketfrockRenderer.setViewOverride()`.
- `#stage-overlay` remains an editor-only transparent Canvas for the grid, manifest lines, labels, cave controls, selection, route diagnostics, placement ghosts, and transient moving artwork.

Camera pan and zoom never rebuild portable world data. They change only the view override and submit another production renderer frame. Authored mutations set one runtime-world dirty flag. The next frame reconverts the level, synchronizes cave-window and colour-map presentation state, and then resumes camera-only rendering against the stable runtime arrays and caches. While records are dragged, the runtime snapshot excludes them once and the overlay draws their live artwork until commit, avoiding a full level conversion for every pointer event.

The revision removes the editor's world-tile caches, tile resolution tiers, visible WebGL context, `?webgl` editor selection, and CSS-transformed pan layer. Those were presentation experiments, never authoritative data, and must not be restored alongside the shared runtime path. The standalone baseline remains as a diagnostic page, but it now validates the same base renderer used by the normal editor rather than a competing implementation.

## Revision 357 editor viewport and interaction scheduler

Playwright comparison exposed a layout boundary rather than another renderer boundary. The profiling string in `#hud-strip` was a non-shrinking grid item. It enlarged the workbench's implicit grid track beyond the fixed `main` column, and `resizeCanvas()` then copied that oversized width into both canvases as inline CSS. Every changing diagnostic value could therefore resize and clear the canvases, retrigger the `ResizeObserver`, and move the production scene and editor overlay through different transient sizes.

The workbench, canvas row, and HUD are now explicitly shrinkable and overflow-contained. The diagnostics cells ellipsize without changing track width, while the complete string remains in the element title. CSS alone owns the visible `#stage` and `#stage-overlay` dimensions; `resizeCanvas()` updates only their matching backing stores. The cached viewport/client rectangles remain the sole camera and pointer coordinate boundary.

Direct manipulation now uses the same scheduling shape as the successful baseline. Pointer events update camera or authored transient state, while one requestAnimationFrame chain renders the newest state for the duration of a pan, move, marquee, cave-point drag, or moving-platform-handle drag. The chain stops after the gesture and ordinary editor changes remain event-driven. A short wheel deadline keeps rapid zoom input on the same presentation cadence. No CSS scene translation, tile cache, alternate renderer, or authoritative state was introduced.

`devel/benchmark_level_editor_playwright.py` is an optional loaded-page comparison probe. It opens level 002 in the baseline and editor at the same zoom, performs a timed pan, records each page's own cadence diagnostics, verifies that the editor stage does not exceed the workbench, and verifies equal stage/overlay backing dimensions. It is a development aid and not part of the release test gate.


## Revision 358 Level Editor 2 migration boundary (retired)

The former `level-editor-2.html` and `src/tools/level-editor-2.js` migration scaffold has been removed from the active project. It is not an authoritative surface, required package file, renderer-audit owner, or supported link target. Historical notes remain useful context for the physical-browser compositor investigation, while current editor architecture is defined by `level-editor.html`, portable `applyEditorLevelToWorld`, and the shared production Canvas renderer.

## Revision 359 Level Editor palette-surface boundary

Palette thumbnails are editor presentation resources, not persistent renderer surfaces. `level-editor.html` retains the complete entity and asset card DOM for search, selection, and accessibility, but off-screen thumbnail canvases must use a 1×1 backing store. An IntersectionObserver promotes only cards near the actual browser viewport to their CSS-sized, DPR-aware backing dimensions and redraws their preview; leaving the viewport demotes the backing store again. Do not restore eager per-card canvases or pre-render every loaded atlas frame into independent retained surfaces.

This boundary is intentionally separate from the production scene renderer. The main scene and guide overlay remain fixed viewport canvases. Palette virtualization must not mutate authored level state, runtime visual caches, atlas source images, or palette ordering. The profiler may inspect aggregate palette backing pixels, but diagnostics must not change layout.

## Revision 360 Level Editor export-surface boundary

The Level Editor must not retain a complete serialized level inside an editable DOM control during ordinary editing. Dense authored levels can exceed 2.5 MB and 60,000 pretty-printed lines. On physical Chrome and Opera, merely displaying that text in the Export textarea delayed requestAnimationFrame by hundreds of milliseconds while Canvas submission remained inexpensive.

`level-editor.html` now treats JSON as an ephemeral export artifact. `prepareLevelForExport()` synchronizes metadata and atlas references, `serializeLevelJson()` materializes the string only for an explicit export/playtest operation, and `refreshExportSummary()` keeps a tiny DOM summary. The editor page contains no `#level-json` textarea. Full text inspection opens a separate Blob-backed tab so its text layout and backing surfaces cannot throttle the editing canvas.

## Revision 361 Level Editor action and camera-scale boundary

The Level Editor has no separate Export panel. Its Level panel owns JSON download and browser-copy save/load actions; `serializeLevelJson()` is invoked only by explicit operations and runtime handoffs.

Static tools use `setViewOverride({ x, y, cssZoom })` on the production Canvas renderer. `cssZoom` is converted to backing-space zoom from the renderer's measured `backingWidth / clientWidth`, making the rendered world and CSS-space editor overlay share one camera scale across fractional DPR and browser zoom. Cave parallax remains restricted to cave-window geometry and visuals whose layer is `caveForeground`.

## Revision 362 Level data action layout and active editor render path

`level-editor.html` groups level actions into two explicit boundaries. The shipped-level selector and **Load** action form **Existing Level**. New/import/export and browser-copy persistence form **Level data**. The import file control is hidden behind the dedicated button so native filename chrome does not consume panel width.

The editor base scene is still rendered directly by `src/presentation/canvas-renderer.js` with `preferWebGL2: false` and `setViewOverride`. No editor-owned screen/world tile cache or pan bitmap is active. Keep ordinary renderer resource caches, spatial indexes, colour-map canvases, cave-mask caches, and treated foreground frames distinct from the retired level-tile architecture: they avoid rebuilding reusable source/effect data but do not substitute a tiled image of the viewport while panning.

## Revision 363 Canvas embedding transform contract

The production Canvas renderer owns the complete transform of its target context. Its draw coordinates are backing pixels, including the CSS-zoom-to-backing conversion performed by `computeView()`. Embedding tools may size the canvas backing store, but they must not leave a DPR, CSS, camera, or other transform active on the renderer's 2D context. `renderCanvas2D()` defensively restores identity, normal alpha, source-over composition, and no filter before clearing and drawing.

The Level Editor therefore has asymmetric context ownership: `#stage` stays at identity for `src/presentation/canvas-renderer.js`, while `#stage-overlay` uses its exact backing-width/CSS-width and backing-height/CSS-height transform for editor guides expressed in CSS pixels. This is intentional. Applying the overlay transform to `#stage` double-scales artwork on fractional-DPR displays and causes alignment error that grows away from the upper-left origin.


## Revision 364 synchronized mobile canvas presentation

The visible production canvas must use ordinary compositor-synchronized presentation. Do not enable the Canvas or WebGL `desynchronized` context hint for the game surface without a new physical-device validation pass. On affected Android Chromium/driver combinations, low-latency presentation can reveal a Canvas2D buffer while it is incomplete or a WebGL drawing buffer after it has been discarded, appearing respectively as white garbage or black flashes.

`#game-shell` is the viewport owner. `#stage` fills that fixed shell with percentage sizing instead of independently resolving viewport units. `RocketfrockRenderer.resize()` may update backing dimensions only from a usable CSS client box; a transient measurement below two CSS pixels retains the last valid dimensions so browser chrome and fullscreen transitions cannot clear the visible backing store to 1×1.


## Revision 365 modular human enemy atlas contract

`ct_atlas_enemy_030.png` is now treated as a single-source modular character sheet rather than a loose art reference. `ct_atlas_enemy_030.json` defines the runtime extraction rectangles for every retained body, head, limb, and weapon part. `ct_human_parts_030.json` sits one layer higher: it groups those atlas frames into semantic variant families and records the shared extraction geometry used for body/head swapping.

The important boundary is that future human variants should be produced by swapping frame names over the same rig topology, not by baking separate per-enemy atlases. Bodies share one common extraction cell and one first-pass shoulder/neck placement; heads share one common extraction cell and one shared neck pivot contract. Shared arms, legs, and weapons remain single-instance atlas parts reused by every assembled human.

`ct_rig_enemy_030.json` is intentionally a first-pass content rig built on that modular contract. It assembles `body_00` + `head_00` into the initial Human Raider and reuses cloned baseline melee animations. Gameplay weighting and automated level-generation participation are a separate concern: the catalog entry belongs in `ct_enemies_001.json`, while `level-generator-enemies.json` should only be updated after the modular family and combat tuning are ready.


## Revision 366 Character Editor project-URL resolution

Puppet Forge's URL entry point is a project resolver, not an atlas-only editor entry. A character definition remains the authoritative project root because it names the rig and animation map. For convenience, the editor may accept a rig or atlas manifest URL when its ID follows the standard `ct_rig_*` / `ct_atlas_*` naming convention; it resolves the sibling `ct_char_*` definition and then loads through the ordinary character-project path. This keeps atlas manifests free of reverse dependencies while making direct atlas URLs useful to authors.

The known-project dropdown remains an explicit curated list, so every newly shipped character project must be added there as part of its integration revision. Renderer startup normally receives catalog-derived enemy character URLs, but its fallback list should include all shipped standalone enemy projects for tools and smoke pages that do not supply a catalog.


## Revision 367 Human Raider canonical-pose contract

For modular Human Raider animation, the corrected idle clip is the canonical transform contract. The first key in each idle part track defines that part's baseline x/y placement, rotation, scale, and alpha. Walk, attack, hurt, and death clips may author independent motion curves, but they must be retargeted so their first transform matches the idle baseline. Translation and rotation curves preserve additive deltas; scale curves preserve ratios. This prevents animation changes from silently restoring the original Skeleton Guard proportions.

The Human Raider rig and enemy catalog are user-authored content inputs, not disposable products of atlas extraction. Atlas regeneration may rebuild `ct_atlas_enemy_030.json` and `ct_human_parts_030.json`, but it must preserve the tuned `ct_rig_enemy_030.json`, corrected idle clip, and `enemy_030` runtime settings. `devel/retarget_enemy_030_animations.py` is the repeatable bridge from the canonical idle pose to the derived clips.


## Revision 368 Human Raider authored-animation ownership

The Human Raider's idle and walk clips are user-authored source data and must not be regenerated or automatically retargeted. Its attack and death clips are also authored content from revision 368 onward: they share the idle/walk reference pose and scales, but their motion is deliberately designed rather than inherited blindly from the Skeleton Guard.

`devel/build_enemy_030_assets.py` may create a missing fallback animation in a clean checkout, but it must never rewrite an existing Human Raider clip. `devel/retarget_enemy_030_animations.py` defaults only to `hurt`; passing walk, attack, or death must be an explicit destructive authoring choice. Runtime collision remains separate from render geometry, and the Human Raider catalog entry owns the corrected 45×118 gameplay body. The generation catalog includes a maximum-difficulty, minimum-weight metadata record only to maintain catalog completeness while this enemy family is still under authoring.


## Revision 369 editor-only parent pivot constraints

Puppet Forge supports one optional positional parent constraint on each rig part. The relationship is stored on the child part as `parts.<child>.parentConstraint`, containing `parentPart` and a normalized `parentPoint` in the parent sprite frame. The child side of the relationship is always the child's existing rig pivot. This keeps the model small: a child has zero or one positional parent, the parent has no separately managed anchor list, and parent chains must remain acyclic.

Constraint mathematics and adaptive X/Y baking live in `src/tools/character-editor/parent-constraint-data.js`. The editor evaluates parent chains in parent-first order. Parent translation, rotation, target-height scaling, and animation scale move the socket point. Child rotation and child scale remain independent and are not inherited. The editor greys out direct X/Y authoring for constrained parts, permits ordinary rotation editing, and lets an interior canvas drag move the normalized parent point instead of writing child position keys.

This is an authoring-only boundary. Runtime character rendering and animation sampling remain unchanged. Before animation JSON is refreshed or downloaded, Puppet Forge replaces constrained child X/Y tracks with ordinary linear keyframes. Adaptive midpoint subdivision adds keys where a rotating or scaling parent would otherwise make straight X/Y interpolation visibly leave the socket. The rig constraint remains the source of truth; baked tracks are disposable runtime-compatible output.

For a looping clip, the baker treats `duration` as an internal boundary equivalent to time zero. It samples and refines the final-to-first interval, but must not serialize an X/Y key exactly at `duration`; the runtime loop endpoint is the first key. Non-looping clips may serialize their final-duration key normally. This prevents editor-generated terminal keys from creating hidden loop seams or failing the shipped-animation endpoint contract.

Rig JSON application must reject missing parents and circular links. The parent picker excludes the child and its descendants. Disabling a constraint leaves the most recently baked X/Y tracks as normal editable animation data, providing a non-destructive escape route.


## Revision 370 shared-animation modular human variants

The modular human contract now has a proven variant boundary. A visual variant receives a separate rig JSON whose torso and head `frame` fields select different equal-sized atlas cells, while all logical part names, pivots, constraints, and animation tracks remain unchanged. Its character JSON may point directly to another human variant's animation files because animation data addresses rig roles (`torso`, `head`, `leftArm`, and so on), not atlas frame IDs.

`devel/build_human_enemy_variant.py` is the authoring utility for this boundary. It rejects missing or dimension-mismatched body/head frames, clones the source rig and enemy defaults, changes only the selected visual frames and IDs, preserves the shared sword and limb frames, and records the resulting assembly in `ct_human_parts_030.json`. This keeps visual combinatorics out of runtime code and avoids redundant animation JSON.


## Revision 371 character sprite Color Exchange boundary

Character complexion treatment is rig assembly data, not atlas data. A part may define `colorExchange` with `fromColor`, `toColor`, and independent `redThreshold`, `greenThreshold`, and `blueThreshold` values. The atlas continues to describe only source rectangles, allowing several characters to reuse one arm frame with different cached treatments.

Engine-neutral normalization and the GEGL-compatible byte transformation live in `src/shared/color-exchange-data.js`. Browser Canvas extraction and `ImageData` processing live in `src/presentation/sprite-color-exchange.js`. `src/presentation/character-runtime.js` applies the modifier during project loading, caches identical treated canvases for the project, and exposes them as ordinary character assets. Normal render frames must never read or rewrite sprite pixels. Canvas2D draws the cached canvas directly; WebGL must upload that canvas and must not retain the original atlas image pointer for a treated asset.

Puppet Forge uses the same shared and presentation helpers as runtime, so its preview is not an approximation. Modifier editing rebuilds the current part cache and remains independent of animation tracks, pivots, parent constraints, and draw order. This is intentionally one optional operation per part rather than a general effects graph.

## Revision 372 modular-human sizing contract

The modular human family keeps size authoring in the enemy catalog rather than altering shared rig geometry or animation coordinates. Enemy 030 and descendants cloned from it use catalog `defaultSize`, `renderScale`, and grounded render offsets as one proportional set. Revision 372 establishes the current 1.5× set at 67.5×177 collision dimensions, 1.23 render scale, and a 51-unit vertical artwork offset. This preserves animation reuse and keeps generator/editor placement dimensions truthful without introducing a hidden runtime species multiplier.



## Revision 373 retired accepted jukebox music boundary

Level music schema version 2 keeps the portable authored surface intentionally small: a level stores only `music.version` and one accepted `music.tuneId`. `src/shared/music-data.js` now owns the immutable 18-tune accepted catalog plus silence, including the chosen jukebox engine version and saved whole-octave shift. Full-pass duration, loop point, repeating-body duration, and developed-section count are measured from that exact live engine API. Rejected and unreviewed selector entries are not editor choices and unknown legacy IDs normalize to the default Mountain King selection.

`src/browser/music-director.js` remains the browser-facing control boundary, but revision 373 supersedes its original short-loop oscillator scheduler. It now coordinates tune changes, persisted volume, transient pause/focus muting, and resume state through `src/browser/music-engine-host.js`. The host mounts only the three historical engines actually used by accepted tunes, versions 2, 3, and 4. Their exact HTML sources are embedded as base64 in `src/browser/music-engine-sources.js` and loaded into hidden same-origin `srcdoc` frames. This preserves the jukebox's own synthesizers, instrument renderers, long-form arrangement development, opening-once pass, and musical return point even when the project runs from local files.

The selected source-of-truth export is retained at `resources/music/ignatius_music_selections.json`. Its accepted IDs, versions, and octave choices are authoritative. Its timing objects contain repeated per-version template values, so revision 373 records the tune-specific values reported by the embedded engine instead of copying those stale templates. The browser host calls each engine's existing API in this order: select the tune, apply the saved octave, apply the current effective game volume, then play. Pause/focus mute calls the engine pause operation. The embedded jukebox player resets its long-form phase on pause, so resuming through `play` begins the selected opening again exactly as the selector does. Tune changes and the explicit silence choice stop all engines. No iframe, AudioContext, or scheduling object enters portable core state.


## Revision 374 music unlock idempotency boundary

The browser may keep broad user-gesture listeners for autoplay recovery, but ordinary gameplay input must never become a transport command. `src/browser/music-director.js` owns this distinction. For one active engine/tune/octave configuration, repeated `unlock()` calls are idempotent and concurrent calls share one start attempt. The host's `play()` method may be called again only after playback has deliberately become inactive through tune change, pause/mute, zero volume, disposal, or a failed prior start.

Treat the director's `unlocked` flag as active playback state, not merely proof that audio succeeded once in the past. Pause and zero-volume paths clear it without discarding the configured tune, allowing resume to reuse configuration while following the embedded jukebox's opening-restart behavior. Tune changes also clear it and invalidate older asynchronous starts through the generation token. Do not solve autoplay restrictions by removing all fallback gesture listeners or by letting browser input code inspect iframe engine state directly.


## Revision 375 cosmetic Background and reciprocal parallax boundary

Level-authored `decorBack` placements are now the explicit **Background** layer. This classification applies only to ordinary level placements. Character and entity visuals may still use the internal `decorBack` draw role inside their own assembled actor and remain in the ordinary non-parallax world pass while following their entity state. `src/presentation/world-visual-cache.js` distinguishes the two through the absence or presence of `entityId`, preventing an enemy's rear arm or equipment from drifting with level parallax.

Background placements are presentation-only records. Portable conversion strips moving-platform behavior and forces manifest collision off even when imported JSON asks for either. Presentation partitions them before terrain, cutout masks, entities, and actor-front artwork, so a high authored stack order cannot pull Background art into the playable scenery. The dedicated partition is spatially culled with its own camera offset in both Canvas2D and WebGL2 paths.

`src/shared/level-layer-data.js` owns the layer constants and defaults. Foreground now defaults to `1.08`; Background defaults to the exact reciprocal, `1 / 1.08` (`0.925925…`). `1.0` is neutral for either direction. `src/presentation/world-parallax.js` computes both offsets around the technical world-bounds centre. Factors above one move faster than the playing layer; factors below one move more slowly. The Level Editor uses that same helper and inverse transform for preview, placement, hit testing, dragging, labels, guides, and marquee selection. A level stores both factors only in `level.layerVisuals`; Background uses `layerVisuals.background.parallax` and Foreground uses `layerVisuals.foreground.parallax`.


## Revision 376 Level Editor placement-layer UI boundary

The Level Editor uses one placement tool for atlas assets. `state.newAssetLayer` and the Asset palette's `#new-asset-layer` control select `caveForeground`, `terrain`, or `decorBack`; they are editor UI state and are not serialized as level metadata. A placed record still stores its ordinary `layer` field.

Preview and commit must both call the same layer-aware placement constructor. The selected layer decides the inverse display-to-authored transform before snapping: Foreground uses the cave-window transform, Background uses the world Background transform, and Terrain uses the unshifted world point. Keep these decisions in the editor and continue to rely on shared layer normalization and renderer partitions at runtime. Separate `placeBackground` or `placeCaveForeground` tools would duplicate this decision and should not be reintroduced.


## Revision 377 Puppet Forge MP4 motion reference

Puppet Forge may load one browser-local MP4 reference video behind the rig. `src/tools/character-editor/reference-plate.js` owns pure playhead-to-video-time mapping, aspect-ratio fit sizing, and display normalization. DOM file access, object URLs, MP4 decoding, seeking, playback, and Canvas drawing remain editor-only inside `character-editor.html`.

The animation playhead is authoritative. Scrubbing, key stepping, preview speed, pause, animation looping, video-time offset, and optional video looping all resolve the displayed reference moment. The video is muted and drawn before rig parts in the same zoom, pan, facing, and local-ground transform, with independent X/Y, width/height, opacity, visibility, clear, and reset-alignment controls.

The MP4 file and all reference settings are deliberately tab-session state. They never enter character, rig, atlas, animation, enemy-catalog, local-storage, level, or game-runtime schemas and must not affect any project dirty flag. Numbered image bundles are intentionally not supported.

## Revision 378 embedded-music arrangement correction boundary

`src/browser/music-engine-sources.js` remains the browser-owned package of synthesized jukebox engines. Engines 3 and 4 are unchanged selector exports. Engine 2 is now a documented derivative: its Mountain King arrangement retains the same synthesis profiles, instrument set, score pitches, beat positions, tempo curve, and loop timing, while correcting melody-support routing.

A voice may set `followsPrimaryMelody: true` inside an embedded engine arrangement. Long-form development treats voice zero and any such marked voice as melody material: it never applies sparse accompaniment omission to them and applies register-development shifts consistently. This marker is private to the embedded browser engine and must not enter portable level, simulation, or shared music metadata.

## Revision 379 grouped cosmetic-layer presentation data

`level.layerVisuals` is the sole level-wide presentation record for the two inert cosmetic layers. Version 2 has `background` and `foreground` objects, each containing normalized `parallax`, `brightness`, and `scale`. `src/shared/level-layer-data.js` owns defaults and clamps. Top-level Background parallax, cave-window parallax, and cave-decoration brightness/scale mirrors are unsupported.

Scale is applied around each authored placement centre during runtime level conversion and through the editor's display-placement path, so spatial culling, selection, guides, dragging, and rendering agree. Background brightness is represented on runtime visuals and rendered through cached brightness-adjusted atlas surfaces in both Canvas2D and WebGL2. Foreground brightness is taken directly from the grouped layer record; there is no second per-placement brightness multiplier. Neither visual multiplier changes collision because both layers remain inert by construction.

The cave-window subsystem owns only the opening, feather, gradient noise, spline, lethal full-black boundary, and perimeter generator. Perimeter-generated placements are ordinary Foreground records and inherit the Foreground layer visual settings rather than maintaining a second user-facing scale or brightness control.

Engine 2 may define a non-percussion voice-local `timbre` object. The scheduler merges it over the selected instrument profile for that voice only, preserving instrument identity and global profile behavior. Revision 379 uses this narrow hook solely for Mountain King's octave-up bassoon support.


## Revision 380 retired enemy-hit laboratory

The standalone `devel/enemy-hit-effect-lab.html` and `devel/enemy-hit-effect-lab.js` diagnostic paths are retired and listed as forbidden retired files by the compact packager. Their dedicated source-contract test and test-gate manifest entry are removed. This does not remove or weaken production enemy-hit behavior: prepared additive hit-flash surfaces, projectile-impact effects, damage awareness, and Canvas/WebGL parity remain covered by the ordinary simulation and renderer regressions.


## Revision 381 visible Foreground visual authority

`src/shared/level-layer-data.js` defines grouped cosmetic-layer schema version 2. Foreground defaults are `brightness: 0.36` and `scale: 2`; Background remains neutral at `1` for both fields. Foreground rectangles are authored at base size and transformed once by the visible layer values. No version-1 level migration exists.

Manual placement and `src/shared/cave-window-decoration.js` now author Foreground records at base dimensions. The perimeter generator still calculates spacing, protection, overlap, and radial depth from effective scaled dimensions, but emits base rectangles. Generator validation receives the visible Foreground scale when calculating bounds. Per-placement `foregroundBrightness` is retired from canonical level data; `src/core/simulation.js` and the editor pass only the layer-wide brightness to `foreground-sprite-treatment.js`. Cave-decoration scale and brightness are synchronized compatibility/generation mirrors and are not a second rendering stage.

## Revision 382 Level Editor sidebar information architecture

The Level Editor sidebar order is a UI contract: **Level**, **Metadata**, **Layers**, **Perimeter**, **Colormap**, **Generator**, **Autospawner**, **Navigation graphs**, **Entity palette**, **Asset palette**, **Placed objects**, **Selected object**, **View**. Keep this sequence unless an explicit editor-information-architecture change supersedes it.

`level.layerVisuals` remains the authoritative data source, but its six controls live in a dedicated **Layers** panel rather than inside Metadata. The **Perimeter** panel owns only cave-window and perimeter-generation controls. This revision changes presentation structure and labels only; element IDs, serialization paths, generator behavior, and runtime data remain unchanged.

## Revision 383 canonical layer-control commits

`level.layerVisuals` version 2 is the sole canonical representation of Background and Foreground parallax, brightness, and scale. Editor control commits include that schema version. `normalizeLevelLayerVisuals` clamps only the current grouped fields and contains no historical conversion branch. This prevents unrelated editor actions from multiplying visible layer settings.

All asset overlay geometry must follow the same display pipeline as artwork. For Background and Foreground records, selection outlines, asset guides, hit testing, marquee bounds, and culling use `displayedLayerPlacement`, which applies layer-wide scale around the authored centre and then the matching parallax transform. Never mix a displayed centre with authored width and height.



## Revision 384 current-level-only data architecture

All supported levels and level fixtures ship in this repository. The portable loader, Level Editor, and automatic-generator metadata normalizer read only the current schema. Schema changes are atomic repository migrations: patch every bundled level and fixture, then remove the former fields and conversion code in the same revision. Do not preserve old aliases, compatibility mirrors, retired entity palette records, or strip-on-import branches.

This policy does not forbid ordinary validation, clamping, defaults for newly created records, or compatibility outside level data such as the old root-page redirect and browser-settings migration. Regression tests for old-level conversion are obsolete. Keep negative source-contract tests that ensure retired fields and migration branches do not return.

## Revision 386 physical grounded character shadows

Status: implemented.

The Human Raider exposed a presentation-boundary error rather than a bad character asset. Enemy shadows were positioned at `characterArtworkOrigin()`, which intentionally includes character-local `renderOffsetX / renderOffsetY`. The Human Raider's required 51-unit downward artwork correction therefore moved its shadow 51 world units below the authoritative collision feet. The same renderer path also drew shadows for every non-flying enemy regardless of jump state, and the player shadow was unconditional.

Revision 386 introduces `src/presentation/actor-shadow.js` as the single presentation helper for physical foot anchors, grounded-contact classification, and the 0.2-second opacity transition. Canvas and WebGL now draw the player and character-enemy shadow at actor `x / y`, never at the shifted artwork origin. `player.onGround`, `enemy.airborne`, and flying locomotion determine the target opacity. Renderer-time state is updated for all actors before culling, preserving smooth transitions when an actor leaves and re-enters the viewport. Canvas global alpha and WebGL sprite alpha both multiply the contact fade by corpse opacity, repairing the previously inconsistent defeated-enemy behavior without adding simulation or level fields.

## Revision 387 canonical runtime Foreground parallax

Status: implemented.

Foreground parallax worked in the Level Editor but not in gameplay because the two surfaces no longer read the same owner. Revision 384 correctly removed the retired `caveWindow.parallax` field from level data, and the editor already read `level.layerVisuals.foreground.parallax`. Runtime level conversion briefly copied the grouped value onto `state.world.caveWindow`, but browser presentation synchronization passed the renderer a separately normalized cave-window record made from the raw level. That normalization strips unsupported fields. The renderer then asked its cave-window copy for parallax, received `undefined`, and the generic world-parallax helper fell back to neutral `1.0`. Background continued to work because its pass read `state.world.layerVisuals.background.parallax` directly.

The fix removes the duplicate runtime cave-window property rather than restoring another mirror. `CanvasGameRenderer.prepareFrame` now normalizes `state.world.layerVisuals.foreground.parallax` once and stores one frame value. Foreground spatial queries, Canvas drawing, WebGL drawing, the Canvas cave mask, the geometric WebGL cave mask, and its Canvas fallback all use the resulting offset. `cave-window-mask.js` accepts the factor explicitly, normalizes it through `level-layer-data.js`, and includes it in the reusable mask key so changing the Layers control cannot reuse a mask rendered at the old offset. Regression coverage proves the renderer no longer reads `this.caveWindow.parallax`, runtime cave geometry has no parallax mirror, and custom Foreground values invalidate mask caching.

## Revision 388 debug-panel overflow policy

The browser debug surface remains a presentation-only `<pre>` inside the fixed HUD stack. Diagnostic producers continue to emit newline-delimited plain text through `updateDebugText`; layout responsibility stays in `game.html`. The panel uses compact 10px monospace text, `pre-wrap`, arbitrary-token wrapping, and scrollable overflow under its 46vh cap. Do not solve future diagnostic-width growth by deleting fields or truncating producer strings when CSS wrapping can preserve the complete data.

## Revision 389 scale-aware pixmap pyramids

Revision 389 adds a small first-party presentation helper in `src/presentation/pixmap-pyramid.js`; no external dependency or licence is required. Runtime character atlas frames are already isolated into individual canvases, so the loader now prepares half-width and half-height copies of each part until the dimensions become negligible. The complete chain approaches only four-thirds of the original pixel area and therefore stays comfortably below the agreed two-times memory ceiling.

Canvas character, projectile, powered-rocket, hit-flash, shield, and low-health sprite draws now use one scale-aware quad-copy routine. It measures the effective destination size after the current Canvas transform and selects the smallest cached level that remains at least two times larger than the destination in both dimensions. Thus a 330×330 part drawn at 28×28 uses the 83×83 level rather than either the original or the barely larger 42×42 level. The chosen source is still drawn into the original logical rectangle, so pivots, rotations, mirroring, rig geometry, and collision remain unchanged.

Packed environment atlases are intentionally not downsampled by this helper yet. Their neighbouring frames need explicit edge padding before reduced atlas levels can be sampled without colour bleeding. The resident WebGL path likewise keeps its existing atlas-texture route for now; this revision targets the repeated large-to-small Canvas character-part sampling that motivated the change. Focused tests cover halving, the memory ceiling, two-times oversampling selection, transformed drawing, loader preparation, and the updated runtime draw paths.

## Revision 390 renderer preference ownership

Persisted renderer preferences live in `src/shared/game-settings-data.js` and are read before `createRenderer` is called. `useHardwareRendering` supplies the ordinary default, but explicit `webgl`/`webgl2` URL parameters override it. `usePixmapPyramids` controls both character-frame pyramid construction and Canvas draw selection, so disabling it avoids the extra bitmap memory rather than merely bypassing selection. These are startup-only presentation choices and do not enter simulation or level data.

`src/presentation/pixmap-pyramid.js` selects a level by direct base-2 index estimation from the original-to-required size ratio, with bounded correction only for rounded odd dimensions. It must not restore a per-draw linear walk through all levels.

## Revision 391 pixmap selection invariant

`choosePixmapLevel()` is regression-tested against its semantic invariant rather than only a few examples: it returns the smallest pyramid level whose width and height both meet the requested source-to-destination margin. If the original itself cannot meet that margin, it remains the safest available fallback. This coverage includes odd rounding and strongly non-square assets, where checking only one dimension would be incorrect.

## Revision 392 flat interface rendering rule

All HTML interfaces now use borders, solid or gradient fills, and explicit outlines for separation. CSS `box-shadow`, `text-shadow`, and `filter: drop-shadow(...)` are prohibited because their large soft compositor footprints created visible halos around panels. This is a project-wide visual invariant rather than a component-specific exception.

## Revision 393 split-limb modular human variant

The modular human family now has a second animation boundary in addition to body/head frame swapping: it can branch into a split-limb rig while retaining the same torso, head, weapon family, and gameplay defaults. `ct_atlas_enemy_030.json` therefore preserves the original monolithic limb frames for compatibility and adds dedicated `arm_upper_*`, `arm_lower_*`, `leg_upper_*`, `leg_lower_*`, and `foot_*` frames for articulated variants.

`ct_rig_enemy_032.json` demonstrates the contract. Upper limbs and upper legs remain the authored motion drivers, while lower arms, lower legs, feet, and the sword are linked by parent-pivot constraints and then baked into explicit animation tracks for gameplay use. This keeps compact archives self-sufficient without requiring the runtime to solve parent constraints on the fly.

## Revision 394 corrected anatomical naming and walk retarget boundary

Enemy 032 now uses anatomical left/right names as the sole public contract for its split rig. The revision performs a complete data migration across rig keys, pivots, anchors, roles, draw order, parent constraints, and all animation pose/track maps. Runtime and editor code must not support the reversed revision-393 names.

The corrected rig remains the source of positional truth. Puppet Forge parent-pivot constraints describe the attachment graph, while shipped gameplay clips contain baked X/Y tracks. `devel/build_enemy_032_walk.mjs` samples the corrected idle pose, authors the stride in rotations and torso movement, then bakes every constrained child chain using the same editor helper. This keeps runtime rendering generic and avoids a second constraint solver in presentation code.

The human atlas builder has two distinct geometry sources: connected-component extraction for the original left-side sheet region and explicit authored rectangles for the appended split-limb region beyond `LEGACY_ATLAS_WIDTH`. The latter must never be inferred from component ordering because their semantic joint roles are authored data.

## Revision 395 refreshed Enemy 032 combat clips
Revision 395 keeps Enemy 032's user-authored rig, idle, and walk data authoritative and extends the articulated split-limb treatment into the remaining combat clips. The refreshed attack, hurt, and death JSON now derive from the same corrected parent-pivot graph, so future runtime/editor debugging can treat the entire Enemy 032 set as one coherent articulation baseline.


## Revision 396 raised Enemy 032 combat baselines
Revision 396 treats Enemy 032's user-authored idle and walk as the height baseline for the whole articulated set. The remaining combat clips are rebuilt from that baseline so a taller split-limb rig does not silently inherit an older lower-torso assumption.


## Revision 397 offline ragdoll authoring for Enemy 032
Enemy 032 now has an offline physics-authoring path for death motion. `devel/simulate_enemy_032_ragdoll.mjs` reads the authoritative rig and idle pose, simulates an articulated fall with deterministic angular dynamics and soft joint limits, samples the result, and bakes parent-pivot X/Y tracks into `ct_anim_enemy_032_death.json`. This is an authoring tool only: no live ragdoll solver or new runtime dependency is introduced. Ankles are intentionally rigid, so each foot retains a constant rotation offset from its lower leg.

## Revision 399 Enemy 032 back-fall death showcase refresh
Revision 399 keeps the shipped Enemy 032 death clip unchanged but replaces the temporary selection page with a new authored showcase focused on readable backward falls. `enemy-032-death-showcase.html` now compares twelve deterministic candidates generated by `devel/build_enemy_032_death_showcase.mjs`. The new variants deliberately avoid the earlier ragdoll-style leg-folding silhouette and instead explore clean back-falls, short staggers, brace-and-fail beats, and sink-then-back-collapse options while reusing the authoritative split-limb idle pose, rig, and baked parent-pivot constraints.

## Revision 400 Enemy 032 death showcase pose overhaul
Revision 400 treats the temporary Enemy 032 death showcase as an authored comparison harness rather than a near-automatic variation generator. The showcase builder now bakes deliberately different end-pose silhouettes into the generated JSON clips so animation review can compare substantive corpse-pose alternatives instead of only timing adjustments.

## Revision 401 concept-driven death showcase authoring
The temporary Enemy 032 death showcase is now generated from semantic, joint-relative key poses rather than a parameter sweep. Upper limbs are authored relative to the torso, lower limbs relative to their parent segments, feet retain their ankle relationship, and all constrained X/Y tracks are baked through the ordinary parent-pivot authoring helper. Source-derived concepts retarget motion from Enemy 030, the Goblin, and the Skeleton without copying incompatible absolute coordinates or detaching Enemy 032 body parts.

## Revision 402 floor-locked authored-to-ragdoll hand-off
The temporary Enemy 032 showcase now demonstrates a hybrid authoring path. Concept-specific keyed motion supplies the readable setup, then deterministic articulated dynamics take over from a seeded hand-off point between one-third and two-thirds of the clip. A geometry pass resolves all parent constraints, measures the complete sprite bounds against the original idle floor, and lifts any penetrating pose before it is baked. This keeps the comparison reproducible and prevents animation-local root motion from placing a corpse below the gameplay surface.

## Revision 403 physical-support floor contact for showcase ragdolls
The temporary Enemy 032 showcase no longer treats the union of every rotated sprite rectangle as one monolithic floor collider. Its offline hybrid simulation uses explicit physical support shapes, retains continuous downward gravity, and resolves a crossing by rolling the timestep back to first contact. This prevents visual-only transparent padding, hands, weapons, and limb corners from translating the entire articulated root upward. Ground restitution is zero; limb angular velocities are damped independently after contact.

## Revision 404 promotes Enemy 032 death candidate 06
Enemy 032’s production death asset is now an explicit promoted copy of showcase candidate 06 rather than the earlier standalone ragdoll experiment. Provenance is stored in `meta.promotedFromShowcase`, while the runtime contract remains the normal `ct_anim_enemy_032_death` animation id referenced by `ct_char_enemy_032.json`.

## Revision 405 articulated human family and authored knife projectile

The human family now shares one articulated limb contract across Enemy 030, Enemy 031, and Enemy 032. Separate character and animation files remain authoritative, but 030/031 are generated from the same refined sword-motion source while selecting different torso/head frames. This removes the old monolithic-arm/leg runtime boundary completely.

Enemy 032 demonstrates a ranged variant without a visible held projectile. Its rig contains an alpha-zero `throwingKnife` launch marker tagged with projectile metadata. `compileRuntimeCharacterProjectiles()` samples that marker at the authored release time and supplies the local launch point to simulation. The simulation emits a three-member `enemyKnife` volley, while Canvas and WebGL resolve `frameId: dagger` from the character atlas and draw the projectile through dedicated knife paths.

Dense baked animation tracks may be cleaned only by the zero-error simplifier in `devel/clean_animation_keyframes.mjs`; it removes a key only when the remaining linear segment reproduces its value within floating-point epsilon.

## Revision 406 velocity-aligned knife rendering and cloned human variant

`enemyKnife` presentation now has one orientation rule across both renderer backends: the authored right-facing dagger frame rotates to the projectile velocity angle and receives no time-based spin. Simulation continues to own velocity and the three-member volley offsets; presentation does not maintain an independent projectile angle or angular velocity.

Enemy 033 is a separate character-project identity, not a runtime skin alias. `ct_char_enemy_033.json`, `ct_rig_enemy_033.json`, and the five `ct_anim_enemy_033_*` clips are complete self-contained project data. Their motion is an exact copy of the current Enemy 032 assets, while the rig selects `body_03` and `head_03` from the existing shared human atlas. This preserves the generic character loader and lets either thrower be edited independently later without adding variant branches to simulation or rendering.

## Revision 407 Puppet Forge document-export surface

Puppet Forge continues to use `src/tools/character-editor/character-dirty-state.js` as the document-change authority. The root editor surface now presents those states as conditional export buttons: saved records are inert, while changed Character, Atlas, Rig, and Enemy catalog records delegate to their canonical JSON download actions. The Animations record enumerates the dirty-slot set, serializes every corresponding editable clip from `state.animationCache`, bakes parent constraints through the existing editor helper, and downloads each clip under its character-map filename. This remains editor-only browser behavior and introduces no runtime or portable-core dependency.

The right-side DOM order now follows authoring flow while retaining all existing panels. Atlas parts remains mode-specific, Rig JSON remains a first-class document alongside the other JSON editors, and Status remains the final feedback surface. Instructional copy removed from Workspace and Metadata is represented by native `title` tooltips rather than additional persistent UI state.



## Revision 408 committed ledge-departure navigation

`src/core/enemy-navigation.js` remains the sole source of hunter ledge reachability. Downward jumps are treated as committed edge departures: their takeoff point is sampled beside the source obstacle wall rather than at the ordinary interior edge inset, and the target requires stable majority overlap rather than a complete-body fit at first contact. Trajectory validation permits the jumping body to move just beyond its source support while its feet remain above the source surface, matching the runtime's committed traversal instead of falsely classifying the first horizontal substep as wall penetration.

Walk-off baking and runtime collision share both clearance factors. Vertical source forgiveness remains capped by `ENEMY_DROP_SOURCE_CLEARANCE_HEIGHT_FACTOR`; the horizontal-body cap is now `ENEMY_DROP_SOURCE_CLEARANCE_WIDTH_FACTOR` at 0.9. The broader cap is still bounded by the one-second departure window, requires nonzero outward velocity, and ignores only the authored source obstacle until the complete body clears it. It does not permit falling through the middle of one-way platforms.

The articulated human family uses a 600-pixel `maxFallDistance`. This is gameplay mobility data shared by Enemies 030-033 and is reproduced by `devel/build_enemy_030_assets.py`. Level 001 carries an exact rebake for that profile, including both the left jump to the starter platform and the right walk-off to the lower floor.


## Revision 411 undeath trail layering

Undeath trail particles remain simulation-owned records in `projectile.trail`. Presentation classifies the projectile by `visualStyle`, then uses a cached procedural `undeathBubble` sprite. The sprite is alpha blended rather than additive so its black-green core survives compositing. Render ordering is style-specific: ordinary fire particles precede the projectile core, while undeath particles follow it in both Canvas and WebGL queues.

Skeleton damage remains ordinary authored combat data. Enemy 001 melee and Enemy 002 projectile damage are both 50 before the shared difficulty scaling function is applied.


## Revision 412 fractional undeath-trail emission

Undeath trail density remains simulation-owned. A per-projectile fractional remainder accumulates the 3.75-bubble target per fixed update and emits integer counts in a deterministic 3/4/4/4 cadence. This gives an exact 25 percent long-run density increase over the revision 411 base count of three without using nondeterministic random calls.

Bubble size variation is hash-derived from the existing stable particle seed. The multiplier spans 0.75 through 1.25, so replays and tests remain deterministic while the cloud avoids visibly uniform bubble sizing.

## Revision 413 target-priority and pathing-hunter policy

Hunter navigation keeps physical reachability in `src/core/enemy-navigation.js`, while tactical destination choice remains in `chooseCharacterEnemyAttackPlan`. The runtime flag `hunterPursuePlayerSupport` tells a hunter to prefer the player's exact support whenever a route exists. Pathing projectile launch types enable this policy automatically, and Enemy 002 authors it explicitly in the catalog. This avoids special-case geometry while preventing obstacle-aware ranged attacks from making a hunter camp indefinitely below its target.

Rocket target ordering remains centralized in `orderedHomingTargets` and `orderedForwardTargets`. A zero-radius terrain visibility query classifies each target from Ignatius's launch origin. Sorting then uses line-of-sight first, forward-facing status second where applicable, distance third, and stable target ID as the deterministic tie-breaker. The same ordering feeds initial homing assignments, separate-target volleys, aimed straight rockets, and later homing retargets.

## Revision 414 bubble-only undeath presentation

Simulation continues to own the undeath projectile as a normal collidable pathing projectile. Presentation suppresses only its atlas-backed core when `visualStyle` is `undeath`; Canvas and WebGL render the procedural bubble records as the complete visible body. This preserves gameplay geometry while making the visual experiment easy to revert. Undeath particles bypass the ordinary Low-quality trail suppression because hiding them would make the hazard invisible.

`UNDEATH_TRAIL_WIDTH_SCALE` controls both radial spawn distance and outward drift, keeping trail width independent from individual bubble radius. Fractional deterministic emission remains simulation-owned.


## Revision 415 undeath trail lifecycle

Undeath particles remain owned by their projectile record. On impact the projectile leaves the collision simulation and transitions from `exploding` to `trailFading` while its particle array remains renderable. `pruneEnemyFireballTrail` is shared by active, exploding, and fading states, separating particle expiry from particle emission. Canvas and WebGL accept the fading state for undeath rendering, while gameplay collision continues to process only `launched` projectiles.

Low-quality density is simulation-owned through `UNDEATH_TRAIL_LOW_QUALITY_DENSITY_SCALE`, preserving deterministic fractional emission and avoiding an invisible bubble-only missile.


## Revision 416 optional upper-branch topology

Traversal generation now records `secondaryTier` on optional branch supports and marks dedicated reward branches with `powerUpPerch`. Mostly-horizontal routes build each upper destination through an intermediate `upperAccessPlatform`, producing a two-step detour while preserving the continuous ground route. Standard routes may chain a tier-two one-way platform from an existing tier-one secondary support. Combat and reward classifications remain mutually exhaustive; power-up perches are a specialized reward-perch subset.

Reward generation selects dedicated tier-two power-up perches before ordinary contextual placement and seats Overdrive there with `generationContext: "detourUpperPerch"`. The catalog weights are 6:3:1 for authored wrench, Overdrive, and Shield. Pickup type variation uses fixed support seats so reward-stage rerolls do not perturb the reward exclusion envelopes already used by encounter generation.

Level 001 currently owns three exact hunter navigation profiles: goblin, tall human, and Skeleton Caster. The caster profile is not redundant with the goblin profile because its body dimensions and movement values differ. The placed Skeleton Guard is patched to the same 50-damage value as the current enemy catalog.

## Revision 417 bounded empty editor worlds

`src/core/simulation.js` treats explicit finite positive `world.bounds` as enough structural data for `applyEditorLevelToWorld` to construct a runtime world even when placements and entities are still empty. This supports the Level Editor's New level workflow without editor-only placeholder geometry. Payloads with no renderable content and no usable bounds still fail conversion.

## Revision 418 horizontal-span encounter targets

Encounter population remains portable in `src/shared/level-generator-data.js`. `generatedMonsterTargetForRoute()` measures only the mandatory route's horizontal span and targets one monster per 500 units at the selected theme's default Enemy density. The density slider scales that target up or down, while the placement pass still enforces calm endpoint zones, reward reservations, cavern fit, platform-body clearance, and deterministic spacing.

A support is no longer a single encounter slot. Long walkable supports expose multiple deterministic seat candidates, and each accepted encounter retains its own support ID and anchor. Ground and flying group placement receives the selected seat as its preferred center, allowing several encounters on one platform without overlapping bodies. Power-up planning now uses a one-per-3,000-route-pixel target. Generator schema version 33 and encounter record version 2 identify this contract.


## Revision 419 denser horizontal-span encounter targets

`generatedMonsterTargetForRoute()` now uses a 300-unit baseline at each theme's default Enemy density. The density slider continues to scale relative to that baseline, with zero disabling encounters and the upper multiplier capped at two. The existing long-support seat subdivision supplies the additional candidates; encounter placement still applies deterministic minimum spacing, endpoint calm zones, reward reservations, cavern fit, body clearance, and moving-shaft safety. Generator schema version 34 identifies the revised target.

## Revision 435 420-base level-generator backport
- Rebased the project on the original revision 420 codebase while backporting the revision 432 automatic level-generator implementation.
- Retained the Rising Cave rename, Serpentine Cave route, same-flow diagonal Serpentine rise support, and generated horizontal floor-layer logic from the generator line.
- Deliberately excluded cave-window, full-black perimeter, editor rendering, and arc-rounded perimeter experiments after revision 420.

## Revision 420 generated endpoint coordinates and population

`src/shared/level-generator-data.js` now treats generated portal positions as authoritative endpoint coordinates. `buildSafeEndpoints()` emits endpoint record version 2 with `x` and `y` values for both doors. Encounter population, reward population, standalone validators, and the editor validation overlay all read those coordinates with support-centre fallback only for older normalized records.

The encounter calm-zone contract protects immediate portal footing only and is independent of actor awareness. Candidate selection keeps deterministic global distribution, then prioritizes several nearest candidates at each endpoint before the remaining route order. This gives the encounter builder local retries when a reward reservation or enemy-fit rule rejects the nominal endpoint seat without weakening collision or spacing checks.

Reward generation treats door supports as ordinary mandatory route surfaces outside the portal exclusion radius. Endpoint chests are placed at the far walkable edge, preferred upper perches are capped to a share of the treasure target, and the residual target is allocated over the entire route-progress interval. Generator schema version 35 identifies these endpoint-coordinate and content-distribution changes.


## Revision 454 OGG music reset release note

Revision 454 removes the failed synthesized/jukebox music path from the active source tree and switches levels, editor selection, runtime playback, and regression coverage to the numbered OGG tracks described by `resources/music/music.json`. Packaged update archives now exclude OGG files alongside PNG and XCF assets.

## Revision 456 title resume save release note

Revision 456 keeps the OGG-only music contract intact while accepting the new `music_001` default track order from `resources/music/music.json`. The browser shell now owns a tiny resume-save record in `localStorage`, keyed by the next level id reached after a completed portal transition. Title-screen layout is updated with Start and Resume in the primary action row and a smaller Game manual link beneath them.

## Revision 457 editor music labels and package exclusion release note

Revision 457 keeps numbered OGG music as the active music contract but makes the editor-facing selector shorter and stable: tracks display as `<nnn>: <title>` using the numeric suffix from `music_###`. Compact update archives now treat `.exe` as excluded heavyweight tooling alongside `.png`, `.xcf`, and `.ogg`, with the packager validating that forbidden extensions are absent from the final zip.

## Revision 458 generator release gate repair release note

Revision 458 tightens the generator's route-and-traversal contract rather than deleting tests. ThePath74 folded routes now keep their non-compact vertical rhythm by requiring at least one vertical direction change when verticality is active, which makes the macro-room test's climbing-plus-descending assertion part of candidate selection instead of a lucky afterthought. Mandatory lift placement now probes deterministic positions on both usable sides of the paired landings, accepts only positions that are boardable at both endpoints, and skips positions where the moving-platform sweep would overlap green one-way support artwork.

The project root now includes `run_full_tests.bat` for Windows release-gate runs. It invokes the same `npm test` sequence used by the package scripts, captures the complete transcript in `.build/full-test-output.txt`, and can resume passed shards with `run_full_tests.bat resume`.

## Revision 459 release-gate revision contract follow-up release note

Revision 459 is a narrow release-gate housekeeping pass. It aligns the game bootstrap debug revision, editor/tool labels, renderer-baseline label, and their tests to the same packaged revision. The test-gate runner now retains its shard timeout timer as an active handle, making per-shard timeout reporting more robust if a future generator or simulation shard truly stalls.


## Revision 460 castle and forest atlas manifest pass

Revision 460 extends the ordinary numbered environment-atlas discovery path with manifests for `at_atlas_005` through `at_atlas_014`. No special level binding or decoration-specific runtime path was added. These assets use the same manifest schema as the earlier cave atlases: frames identify alpha-isolated sprites, ordinary decorative props have empty node/line graphs, one-way platforms use `walkable` line segments, and solid props use closed `blockable` loops. The atlas IDs remain discoverable through the existing numbered environment-atlas loader.

Because update packages intentionally omit heavyweight image files, these manifests are packaged separately from their matching PNGs. A full working tree must still contain the matching `resources/atlases/at_atlas_###.png` images for the editor and browser renderer to display the art.

## Revision 461 asset forge atlas loader and title manual button polish

Revision 461 streamlines the Asset Tool file panel for the growing numbered atlas library. The old hard-coded `at_atlas_001` image and JSON buttons are replaced by a numbered atlas selector and a single load action that loads both `resources/atlases/at_atlas_<nnn>.json` and its referenced image. The custom PNG and JSON pickers remain underneath for one-off imports. The Asset Tool canvas also now matches the Level Editor navigation feel: holding the right mouse button while dragging pans the viewport, and the mouse wheel zooms around the cursor.

The title screen keeps Start and Resume as the primary actions, while the Game manual link now uses a quieter pill-shaped secondary style so it reads as supporting documentation rather than another main launch button.

## Revision 462 atlas PNG separation and manifest realignment

Revision 462 repacks the authored environment atlases `at_atlas_005` through `at_atlas_014` so the individual sprites no longer crowd or overlap one another inside the atlas images. A helper script, `devel/separate_environment_atlases.py`, finds opaque connected components in each atlas, assigns those components back to the existing manifest frames, crops each asset down to its true occupied pixels, and repacks the results into larger replacement PNGs with clean spacing.

The corresponding JSON manifests are updated in lockstep: each frame rectangle now points at the new packed location, and any authored node coordinates are translated to account for the new crop origin. Decorative assets remain inert, while existing walkable and blockable annotations are preserved. Single-asset atlases such as `at_atlas_009` and `at_atlas_011` are left unchanged because they did not have overlap problems.

## Revision 463 asset forge viewport navigation fix

Revision 463 corrects the Asset Tool viewport sizing and zoom anchoring so large atlases can be inspected and edited comfortably. The left editor pane now owns a bounded scrollable viewport instead of letting the page grow around the canvas, which makes right-mouse panning reach the lower parts of large atlases. Mouse-wheel zoom now preserves the image point under the cursor, and the toolbar zoom controls preserve the viewport center instead of snapping the canvas back toward the top.

## Revision 464 Asset Tool file-panel save polish

Revision 464 reshapes the Asset Tool Files panel so numbered atlas loading and the common save actions live together at the top of the side panel. The panel now presents an atlas selector plus a Load button, followed by Load from Browser, Save in Browser, and Save buttons. The visible custom PNG/JSON import pickers are retired from the primary workflow, while the browser-local save/load loop remains available for quick undo-style checkpoints.

The Asset Tool Save button exports the current manifest JSON from the Files panel. When the browser exposes the File System Access API, Save opens a native save-file picker and writes the selected JSON file directly; otherwise it falls back to the normal browser download flow.

## Revision 465 editor save picker rollout and Asset Tool node splitting

Revision 465 extends the save-file-picker export path beyond the Asset Tool. Level Editor level exports and Puppet Forge JSON exports now try Chromium's File System Access API first, allowing the user to choose and overwrite the file they are actively editing when the browser supports it. Unsupported browsers, cancelled picker operations, or denied writes fall back to the previous download-based export path where appropriate.

The Asset Tool also gains a faster line-editing gesture: in Add Node Mode, clicking essentially on an existing feature line inserts the new node into that line, splits the original segment into two same-kind segments, selects the new node, and immediately switches into Move Mode so the node can be dragged into its final position without extra clicks.

## Revision 467 wizard-sized manual doors

Interactive doorway placement remains catalog-driven. The `wizard_entry_door` and `wizard_exit_door` definitions in `resources/items/it_entities_001.json` now author 125×164 as their default size, aligning manual Level Editor placement with generated endpoint doors while preserving the existing floor-anchor factor and transition behaviour.

## Revision 468 editable thought triggers

Location thoughts remain ordinary `thoughtTrigger` entities with `interaction: "locationThought"` and authored `thoughtText`. The Level Editor inspector treats them as story records alongside editor-letter mailboxes, but exposes only the trigger distance and thought text controls for thought-only triggers. Runtime story handling remains unchanged.

## Revision 470 testbench level fixtures

Revision 470 stops regression tests from depending on mutable campaign level numbers. The authored-level contracts that previously inspected `resources/levels/level_001.json` and `resources/levels/level_002.json` now read reserved testbench fixtures instead: `resources/levels/level_t01.json` for the old introductory cave/navigation fixture and `resources/levels/level_t02.json` for the goblin boss arena fixture. The `level_tNN` namespace is reserved for tests only; those files may be edited freely to satisfy regression coverage and must not be linked from normal campaign progression.

## Revision 471 Level Editor inspector precommit

Revision 471 adds a capture-phase pointer precommit around the selected-object inspector. When an editable inspector control has focus and the next pointer action targets another editor surface, the editor calls the same inspector save path before selection state can change and before `syncInspector()` can repaint the controls. This preserves multiline story fields for mailboxes and thought triggers while keeping the existing explicit `change` handlers as the canonical persistence path.


## Revision 472 entity-only atlas visibility

The Level Editor distinguishes loaded atlases from atlases that should be presented as plain placeable assets. `it_atlas_` manifests are entity-only: they remain loaded because catalog entities use them for previews and runtime visuals, but `renderAssetList()` filters them with `isAssetPaletteAtlasId()` before building the Asset palette. This preserves entity rendering while preventing editor confusion between functional catalog entities and their decorative source sprites.

## Revision 473 grounded slope following

Revision 473 adds a grounded slope-follow pass to the player collision pipeline. Horizontal movement still resolves walls first, but when no horizontal blocker is found and the player was standing on terrain, the simulation probes the authored support at the new X coordinate and snaps to nearby walkable or blockable segment height within the existing automatic step envelope. This keeps steep segmented walkable platforms stable at run speed while preserving deliberate drop-through behaviour on green lines.

## Revision 474 swept grounded support crossing

Revision 474 extends the player collision pipeline with a grounded swept-foot support pass. Horizontal movement records the previous foot position and tests each sampled old-foot-to-new-foot segment against nearby authored supports. A support catches the player only when the old foot is on the standing/up side of that line and the new foot ends on the down side; smaller screen Y remains the geometric upper support when more than one valid crossed line is available. Green walkable lines are still one-way and are skipped while the player is deliberately dropping through, but they do not receive priority over yellow blockable geometry.

Vertical sweeps now use the same one-way-side rule for green walkables, so a player who is slightly below a green line inside the collision skin is not snapped upward from the underside. The penetration solver keeps a narrow authored-support override only for the line the player is already standing on, and only when no physically upper support supersedes it, preventing bridge endpoints that overlap grass ground from depenetrating Ignatius off the authored ramp.

## Revision 475 hidden debug diagnostics gate

The browser bootstrap treats the debug panel as an opt-in diagnostics surface. Because the panel starts hidden, `updateDebugText()` performs an early visibility guard before assembling high-churn strings or querying renderer diagnostics. Panel toggle handlers call `updateDebugText()` after making the panel visible so the first visible frame is current, while hidden frames skip the diagnostic path entirely. Gameplay, rendering, physics, and HUD update cadence are unchanged.

## Revision 476 low-churn HUD and cleanup pass

The browser bootstrap keeps HUD rendering on the normal animation-frame cadence, but revision 476 treats DOM writes as change-triggered side effects. `updateHud()` computes the same displayed strings and meter percentages as before, then writes only values that differ from the cached last render. This preserves visible HUD behaviour while avoiding unnecessary per-frame text, title, style-width, hidden, and class updates on machines where DOM churn can show up as micro-stutter.

The fixed-step simulation now records `state.debug.lastInputFrame` with a purpose-built input-frame copy instead of the general JSON deep clone. This keeps the debug state isolated from the live input object without allocating JSON strings every simulation tick. Dead Level Editor helper functions and the obsolete spaced Human Raider rig duplicate are removed from the active project tree; the canonical `resources/characters/ct_rig_enemy_030.json` remains authoritative.


## Revision 477 reachable approach plans for blocked hunters

Hunter routing now separates target awareness from attack-position availability more clearly. `chooseCharacterEnemyReachableApproachPlan()` scores every currently reachable navigation support by the support point closest to the target coordinate, then returns a normal `pursue` or `last_seen` plan for that support. The attack planner still prefers exact player-support routes and valid attack positions, but if no shot or melee point is reachable it falls back to this approach plan before glare.

This preserves the collision-aware projectile lane rules: hunters still do not shoot through yellow blockable pillars. The change only affects the state decision after awareness succeeds, ensuring a blocked hunter continues to move toward the best reachable investigating position rather than treating a blocked shot as a globally unreachable target.

## Revision 478 blocked hunter route purpose and health defaults

Revision 478 separates visible-but-blocked hunter movement from ordinary pursuit by recording the nearest-reachable fallback as `blocked_approach`. The simulation still uses the same baked navigation graph and support-point clamping, but arrival at that route now resolves to idle/glare when no projectile or melee lane is available. This keeps awareness terrain-independent without leaving a hunter in a perpetual walk cycle against blocked geometry.

Enemy health defaults are now consistent across catalog, editor, generator, runtime fallback, and authored levels: goblins 60, humans 90, skeletons 120, bats 1, target dummies 90, and uncatalogued future character enemies 90. Boss-authored health remains level data.

## Revision 479 human mobility profiles and blocked-glare stability

Revision 479 treats the modular human raider family as a 200 px jump-height mobility class. The enemy catalog defaults, authored level entities, and baked hunter navigation profiles now agree on `jumpHeight: 200`, preserving the exact-profile lookup contract used by `findBakedEnemyNavigationGraph`.

The hunter glare state now filters out `blocked_approach` fallback plans during its periodic visible-target retry. That keeps the state machine stable after a hunter has already reached the nearest reachable approach point and discovered that terrain still blocks the attack lane, while still allowing reengagement when the planner finds a real attack or pursuit route.

## Revision 480 human run profile and recovery reacquisition

Revision 480 keeps enemy mobility profiles authored, baked, and runtime-matched as a single contract. Modular human enemies now share the goblin `runSpeed: 200` and `jumpHeight: 200` mobility class while retaining their larger body dimensions, so profile keys change from `r152` to `r200` and the affected campaign/test levels ship freshly baked navigation graphs for that exact tall-human shape.

Hunter recovery now has a small explicit anti-flicker state variable, `unreachableReengageCooldownTimer`, used only after an unreachable glare times out into `return_home`. The cooldown prevents immediate blocked-approach retry chatter, but the return-home branch continues checking visible targets and can re-enter pursuit or attack once a non-blocked plan exists.

## Revision 481 regular-goblin mobility profile

Revision 481 splits ordinary goblin mobility from human mobility again. Regular goblin enemies use a nimble `runSpeed: 250` and `jumpHeight: 250` profile, while modular humans remain at their authored `runSpeed: 200` and `jumpHeight: 200` profile and the scaled boss goblin retains his custom boss profile. Level navigation graph metadata continues to be an exact contract: every shipped level with regular goblin hunters now carries a baked `w70_h105_r250_a950_j250_g1250_f600_s26_q22.4` graph.

## Revision 482 micro-stutter profiling contract

Revision 482 adds `src/browser/micro-stutter-profiler.js` as a browser orchestration diagnostic, not as simulation state. It records wall-clock frame slices around input, fixed-step simulation, post-simulation services, renderer, HUD, and debug text while preserving the deterministic core boundary. The profiler is opt-in through the lower-right game tool-strip button or `window.__rocketfrockDev.profiler` and exports compact JSON intended for offline review. It is not auto-started from URL parameters, keeping the default runtime path profiler-free.

The renderer hot path now treats frame-local collections as reusable scratch: entity visibility Sets, visual query Sets and candidate arrays, overlap-blend group Sets, projectile skip Sets, visual counters, and parallax offsets are cleared or overwritten instead of recreated on every animation frame. `world-visual-cache.js` exposes reusable query scratch and `Into` bounds helpers for callers that need broadphase culling without feeding the garbage collector.

## Revision 483 profiler activation boundary

Revision 483 makes micro-stutter profiling an explicit user gesture instead of a startup mode. The browser bootstrap owns the lower-right `Profiler: off` button, starts `MicroStutterProfiler` only when that button is clicked, and stops/export-copies the captured JSON on the next click. This keeps ordinary play free from profiler overhead while preserving the diagnostics contract introduced in revision 482. Clipboard failures are surfaced in the console and the latest JSON is kept on `window.__rocketfrockLastMicroStutterProfile` for manual recovery.

## Revision 484 canvas stutter diagnostics and cave-mask scroll cache

Revision 484 keeps the micro-stutter profiler browser-owned, but expands the renderer diagnostics contract. `CanvasGameRenderer` now reports world sub-phase timings for clear/backdrop, background visuals, ordered world visuals, fallback geometry, and portal glow in addition to the existing world/actor/foreground/mask buckets. These fields are presentation diagnostics only and do not cross into the portable simulation core.

The Canvas cave-window mask remains an inert presentation layer. Its CPU path now caches a padded, reduced-resolution mask surface around the viewport and scrolls that surface for small camera movement before rebuilding the organic feather. Cave shape, gradient settings, viewport size, zoom, parallax, or movement beyond the padding still invalidate the cache. The WebGL2 path continues to prefer resident world-space cave-mask geometry.


## Revision 485 static-layer bake POC boundary

Revision 485 keeps the static-layer bake experiment inside `src/presentation/canvas-renderer.js`. It is an alternate Canvas2D presentation path, not portable simulation state. The simulation continues to expose the same world visual records, entities, projectiles, enemies, pickups, and effects; the renderer chooses whether eligible static records are replayed each frame or precomposited into background, terrain, and foreground canvases.

The POC is intentionally guarded: it is disabled by default, uses authored world bounds, refuses single canvases above the configured dimension guard, and refuses three RGBA layers whose estimated footprint exceeds 2 GiB. Entity-bound and movement-tagged visual records remain live-rendered so gameplay state changes are not baked into immutable imagery. WebGL resident-texture parity is left for a future chunked implementation because full-level canvases can exceed common GPU texture-size limits.


## Revision 486 WebGL static-layer bake boundary

Revision 486 keeps the WebGL static-layer bake behind the existing presentation renderer boundary. The portable simulation and level data remain unchanged: no baked image becomes authoritative gameplay data. The WebGL backend only receives the renderer-owned bake canvases as texture sources, rejects sources larger than the reported `MAX_TEXTURE_SIZE`, and releases stale bake textures when caches are invalidated. This preserves the ordinary WebGL2-resident renderer as the default path while giving the brute-force static-layer experiment a GPU-backed mode for profiling.

## Revision 487 chunked WebGL bake boundary

Revision 487 keeps static-layer chunking inside the presentation renderer. When a baked level exceeds the GPU max texture size, `CanvasGameRenderer` builds renderer-owned chunk canvases for background, terrain, and foreground rather than changing level or simulation data. The WebGL backend treats each chunk canvas as an ordinary resident texture source and the renderer draws only chunks intersecting the current camera view. Cache invalidation releases every chunk texture, preserving the same renderer-boundary contract as the single-texture proof of concept while avoiding the GPU single-texture dimension limit.

## Revision 488 experimental static bake boundary

The static-layer bake renderer is an experimental alternate presentation path, not a supported design constraint for normal rendering. Its shared `ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER` flag hides the game-page toggle and makes the renderer refuse activation when disabled. The mode is allowed to consume ordinary renderer data and accelerate static layers, but future Canvas2D/WebGL features should be implemented cleanly for the normal path first. If baked/chunked compatibility would require extra abstraction, invalidation rules, or special cases, stop and ask before changing the architecture.

## Revision 489 Electron builder Windows signing config

Revision 489 updates the portable Electron packaging configuration for electron-builder 26.15.x. The staged app package now uses `win.signExecutable: false` instead of the retired `win.sign: false`, which keeps Windows code signing disabled without disabling executable resource editing for the favicon and metadata. The staged package also declares the project author so the builder does not emit the missing-author warning during local Windows builds.

## Revision 490 development settings and baked renderer containment

Revision 490 makes development-tool visibility a persisted browser setting rather than an Electron build special case. `game-bootstrap.js` reads `settings.developmentMode` to show or hide the lower-right tool strip for every host. The experimental static-layer bake renderer is now toggled by the Settings dialog through `settings.useBakedLayers`; the old game-screen `Baked` button has been removed. The `ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER` flag remains the build-level availability boundary and hides the Settings row when disabled.

The static bake renderer remains presentation-only and experimental. Its bake surface bounds are derived from the authored world bounds plus eligible static visual bounds, preserving parallaxed perimeter artwork without changing simulation or level authority. Terrain baking now reuses the normal overlap-blend cache so visual seam treatment stays downstream of existing renderer data rather than introducing a second blending model.


## Revision 491 baked perimeter bounds boundary

Revision 491 keeps the static-layer bake perimeter fix inside the presentation renderer. The ordinary cave-window mask still renders as a viewport overlay; only the experimental baked path expands its finite cache rectangle to include the full-black cave extent plus a viewport/parallax safety skirt. This prevents baked chunks from exposing clear texture edges outside the authored play area without making the simulation or normal renderer aware of baked-layer storage.


## Revision 492 baked renderer failure boundary

Revision 492 keeps the experimental baked renderer subordinate to the normal presentation pipeline by adding a hard failure boundary. Static bake allocation, canvas creation, and WebGL texture uploads are treated as optional cache construction; if any of them fail, the renderer releases partial baked resources, disables baked mode, and falls back to live rendering. The browser bootstrap owns the user-facing notification and clears the persisted Use baked layers setting so the renderer does not repeatedly retry after an out-of-memory condition.


## Revision 493 default baked presentation cache

Revision 493 keeps the experimental static-layer bake renderer isolated behind the same Settings and kill-switch boundaries, but changes the default user setting to enabled. This is a default preference change rather than a renderer ownership change: the normal live renderer remains the required fallback, and a bake allocation/upload failure disables the stored Use baked layers setting for that profile. The settings migration intentionally re-enables baked layers once for settings written by pre-493 builds, because those profiles frequently contain the old false default even when the user never made an architectural choice about the baked path.


## Revision 494 baked-layer load safety

Revision 494 tightens the experimental baked static-layer renderer boundary after a large generated level exposed a memory-pressure freeze during default-on baking. The normal renderer remains the fallback. In WebGL, baked layers are budgeted below the theoretical 2 GiB full-layer estimate because resident texture memory and temporary Canvas2D build memory overlap with the rest of the game. Oversized bakes fail fast through the existing notification/fallback path. Successful WebGL baked chunks upload to resident textures and then shrink their canvas backing stores while preserving the canvas object as the texture-cache key.

## Revision 495 baked-layer backend budgets

Revision 495 keeps the experimental static baked-layer renderer behind the ordinary renderer boundary, but separates the safety budgets by backend. WebGL now assumes a 3 GiB VRAM test budget before attempting chunked baked-layer textures. Canvas2D keeps a smaller RAM preflight budget because its baked layer canvases remain CPU-side and can freeze browsers before JavaScript receives a useful allocation exception. When either backend exceeds its configured budget, baked layers disable themselves and live rendering remains the fallback.

## Revision 496 baked-layer default rollback

Revision 496 keeps the experimental static baked-layer renderer isolated behind the existing Settings toggle and fallback paths, but restores the fresh-profile default to off. Stored preferences remain authoritative: profiles that explicitly enabled baked layers continue to do so, while profiles with no baked-layer setting normalize to ordinary live rendering. No renderer budget, resource-release, chunking, or fallback behavior changes in this revision.

## Revision 497 settings reload-note cleanup

Revision 497 keeps the Settings dialog's reload semantics explicit without reintroducing browser-query help text into the compact UI. Hardware-renderer selection is still resolved when the renderer is created, and pixmap-pyramid selection is still applied during asset/runtime preparation, so both rows carry the short "Applied after reloading." note. Dynamic options, including development tools and experimental baked layers, remain note-free because their handlers update the live runtime.

## Revision 498 renderer-setting state and host parity

Revision 498 keeps renderer selection under the persisted game-settings boundary for every host. Electron no longer changes the renderer preference merely by exposing its window bridge; browser and packaged builds both resolve hardware rendering from `settings.useHardwareRendering`, with explicit URL parameters retained only as a development override. The Settings dialog compares the saved request with the renderer and pixmap-pyramid modes latched during startup, so it can distinguish the active state from a pending reload without attempting to rebuild renderer-owned resources in place.

## Revision 499 static tile-cache architecture

Static scenery reuse now has three explicitly separate renderer modes owned by `CanvasRenderer`: `off`, `tiles`, and `full`. The shared settings schema stores `bakingMode`; revision-8 migration maps the removed `useBakedLayers` boolean to `full` only when it was explicitly true. `game-bootstrap.js` owns the Settings selector, persists changes immediately, and routes renderer failures back to the safe `off` mode for browser and Electron hosts alike.

`src/shared/static-tile-cache-data.js` contains the host-independent tile geometry and scheduling policy: 256×256 logical tiles, one-pixel gutters, one-screen request margins, two-screen retention margins, velocity prediction, sparse keys, rectangle tests, and deterministic priority scoring. `src/presentation/static-tile-bake-worker.js` owns CPU-side rasterization. It caches transferred source crops, draws serial command lists into an `OffscreenCanvas`, and transfers one completed `ImageBitmap` back to the renderer. Only one worker task and one completed-but-not-uploaded tile are allowed at a time, preventing an unbounded RAM queue.

The renderer keeps background, terrain, and foreground caches independent. Completely empty layer tiles are recorded without allocating image or texture storage. Under WebGL2, completed 258×258 guttered tiles are placed into recyclable atlas-page slots through `texSubImage2D`; drawing can therefore batch many logical tiles against a small number of texture pages. Canvas2D stores the transferred ImageBitmap directly. Cache eviction is distance/priority driven and subordinate to a strict memory budget. A layer uses tiled drawing only when all tiles touching the current view are ready or empty; otherwise the existing live layer renderer remains authoritative for that frame. This all-or-live layer boundary avoids alpha doubling and visual cracks during warm-up or invalidation.

The `full` path remains architecturally independent for profiling comparisons and still builds complete/chunked static layers. Both baking paths are optional caches rather than world state: dynamic visuals, actors, effects, cave masks, collision/debug guides, and simulation behavior never depend on them. Releasing or failing a cache must always leave the normal live renderer capable of producing the complete frame.

## Revision 500 transferred tile-atlas orientation

Rolling WebGL tiles remain worker-produced `ImageBitmap` objects packed into reusable atlas pages. Their sub-upload row order differs from the renderer's ordinary image/canvas texture uploads, so `queueStaticTileLayerWebGL` owns the required vertical UV compensation when it queues an atlas-backed tile. Do not move this correction into the general sprite path: ordinary resident textures, dynamic canvases, Full baking, and atlas artwork already use the established top-left source-coordinate convention. The browser Settings UI exposes the same `off | tiles | full` enum through a single select element; renderer ownership and persistence remain unchanged by that presentation choice.

## Revision 501 compact Settings placement

The Baking selector remains owned by `game-bootstrap.js` and the shared `bakingMode` setting. Its Settings card now occupies the second grid column beside **Use pixmap pyramids** rather than spanning both columns. This is presentation-only and does not alter renderer mode ownership, persistence, migration, or resource lifetimes.

## Revision 502 tile-atlas orientation boundary

Worker-baked tiles have one canonical orientation before they enter WebGL atlas storage. `static-tile-bake-worker.js` creates an upload-oriented copy only when the task is destined for WebGL; the complete guttered tile is flipped as one unit so later clipping can use normal top-left source rectangles. `webgl2-renderer.js` accepts an explicit `unpackFlipY` option for subregion uploads, and the tile path disables unpack flipping because the worker has already normalized the bitmap. `queueStaticTileLayerWebGL` no longer owns a special `mirrorY` rule. This keeps clipped edge tiles, full tiles, and ordinary resident textures on one sampling convention without altering Canvas2D or Full baking.


## Revision 504 simulation/presentation transform boundary

`src/shared/presentation-transform-data.js` owns engine-neutral transform storage and in-place copy helpers. A simulation-driven root has three persistent records: `previousTransform`, `currentTransform`, and `shownTransform`. Each record contains `x`, `y`, `angle`, `scaleX`, `scaleY`, and `alpha`. These records are allocated when the runtime object is created or first normalized, then mutated in place. Per-frame transform cloning or replacement is prohibited.

Portable core owns `currentTransform`. At the beginning of every fixed simulation step, `snapshotSimulationPresentation` copies current into previous for the player, camera, hat, enemies, projectiles, and moving world visuals. Gameplay geometry, collision, AI, targeting, scripted movement, and serialization use current. Before each requested render, the browser adapter calls `preparePresentationFrame` with the clamped fixed-step accumulator fraction. Presentation-only code reads the interpolated shown record for actor roots, camera projection, projectile orientation and scale, moving-visual placement, actor shadows, and presentation culling. It must not temporarily overwrite current or expose shown values to gameplay.

Simulation-driven articulated enemies use the parallel `animationClock` record with `previous`, `current`, and `shown` scalars. Presentation samples the character pose at `shown`; individual limb transforms remain presentation output and are not triplicated in portable state. Discrete fields such as facing, sprite choice, visibility, attack state, and collision state remain ordinary state rather than continuous transform channels.

Legacy direct root properties (`x`, `y`, `angle`, `renderScale`, `renderOpacity`, and simulation-owned `animationTime`) are unsupported on migrated runtime actors and projectiles. Static authored level placements, target points, particles, editor handles, geometry points, and other non-migrated records may still legitimately use ordinary x/y fields. The regression suite therefore guards specific runtime access paths rather than banning coordinate property names globally.

Revision 504 intentionally set shown equal to current to validate the boundary. Revision 505 changes only the current-to-shown preparation stage: x/y, scale, alpha, and articulated animation time interpolate linearly; angles use the shortest wrapped path; scale sign changes snap; and explicit snap helpers reset history at discontinuities. The authoritative fixed-step state and renderer read boundary remain unchanged.

## Revision 505 fixed-step presentation interpolation

`game-bootstrap.js` derives one presentation blend per requested frame from `accumulator / FIXED_DT`. Normal play uses that fraction, while paused or development single-step frames use a full blend so the newest state is visible immediately. `src/shared/presentation-transform-data.js` mutates each persistent shown record in place, preserving the no-per-frame-allocation contract established by revision 504.

Spawned objects begin with previous, current, and shown equal because their triplets are initialized on first normalization. Level application, player reset, camera reset, and development pose changes explicitly snap existing triplets. Character animation-slot changes snap the animation clock when its current time resets to zero, preventing a new clip from inheriting an old clip's interpolation history. Static scenery and baked tiles remain outside this system; smooth camera interpolation moves them on screen without creating transform records for static placements.

## Revision 506 tiled-bake profiler boundary

Revision 506 keeps rolling tile baking owned by `CanvasGameRenderer` and keeps the profiler owned by the browser bootstrap. While `MicroStutterProfiler` is recording, the bootstrap enables renderer-local tile diagnostics through `setStaticTileDiagnosticsEnabled(true)`; normal play leaves that path inactive. The renderer owns one reusable synchronous frame record plus one reusable asynchronous worker-result accumulator. Worker message handling deposits only numeric counts and elapsed time into the accumulator, and the next tiled render consumes those values without creating a separate diagnostic collection.

The reported subphases cover camera-velocity bookkeeping, completed-tile adoption, atlas allocation, `texSubImage2D` submission, visible-region planning, distant/budget eviction, job selection, cache diagnostics, and baked-tile drawing. Upload metadata remains presentation-only and includes logical tile coordinates, atlas page and slot coordinates, byte dimensions, camera tile coordinates, and a diagnostic burst ID. None of these fields enter portable core state, level data, cache priority calculations, or renderer decisions.

This diagnostic boundary must remain observational. It may not introduce GPU synchronization, readback, fences, timer-query extensions, console logging in the frame loop, altered worker concurrency, larger prediction margins, different upload budgets, extra completed-tile adoption, or page-buffering experiments. Any such intervention belongs in a later separately measured revision.

## Revision 507 frame-delivery diagnostic boundary

`MicroStutterProfiler` now distinguishes three timelines without changing any of them: the rAF timestamp sequence supplied by the browser, the actual JavaScript callback-entry sequence measured with `performance.now()`, and the presentation sequence represented by shown player/camera transforms. The browser bootstrap owns callback-entry measurement and samples transform records after `preparePresentationFrame` has populated shown values. The profiler owns delta calculation, ring-buffer retention, mark metadata, and summary maxima. Renderer and portable simulation modules do not depend on profiler state.

Presentation snap diagnostics remain module-local to `src/core/simulation.js`. Snap helpers increment a monotonically increasing diagnostic sequence and retain only the latest reason, subject label, and snap kind. These values are observational and are read only while profiling. They are not serialized into game state, do not affect transform copying, and do not allocate during ordinary unprofiled frames.

A marked capture uses the existing bounded profiler ring. The mark records the current frame, requested/available pre-roll, and a fixed post-roll. Once the post-roll completes, the browser stops both the profiler and tile-specific diagnostics. No timers, sleeps, GPU fences, readbacks, alternate rendering paths, or presentation-clock changes are introduced by this boundary.

## Revision 508 profiler-control simplification

The lower-right development strip exposes one micro-stutter control only. The first click starts the existing all-frame bounded ring; the second click stops profiling, disables tile-specific diagnostics, and copies the retained report. The manual mark/post-roll state machine and its browser-facing API are removed. The exported schema keeps an empty `marks` array for compatibility with revision-507 reports, but no runtime mark state exists.

This revision does not alter callback timing, fixed-step accumulation, interpolation, camera motion, renderer selection, baking, or presentation transforms. The revision-507 player/camera reversal seen in one capture is not treated as the reported hitch because the user observes the target symptom during long, uninterrupted runs in one direction. Future analysis must therefore focus on steady-direction samples and must not infer the hitch from input reversals.



## Revision 510 foreground prewarm and Full-bake ceiling

Revision 510 keeps treated cave-foreground cache construction inside `CanvasGameRenderer` and schedules it only while the browser loading surface is active. Every unique colour-map-aware treatment referenced by the loaded level is built once, and hardware rendering uploads those derived surfaces through the ordinary WebGL texture cache before gameplay resumes. This is optional presentation preparation only; level data, simulation, culling, parallax, and draw order remain unchanged, and a failed texture creation still leaves the normal live renderer available.

The experimental WebGL Full-bake path now rejects estimates above 2 GiB of three-layer RGBA storage before allocating chunk canvases or textures. Canvas2D retains its 1.5 GiB RAM ceiling because its full bake remains CPU-resident, and rolling Tiles retains its independent budgets. All Full-bake budget failures continue to disable the optional cache and fall back to complete live rendering rather than becoming a gameplay or level-authoring constraint.

## Revision 511 deterministic gameplay recording and playback

Revision 511 adds `src/browser/gameplay-recording.js` as a browser-adapter diagnostic boundary for parity work. It owns gameplay recording JSON normalization, input-frame snapshots, replay-frame reconstruction, hosted `recordings/*.json` URL normalization, and lightweight per-frame debug snapshots of player, camera viewport, visible enemies, and visible projectiles. Portable simulation remains unchanged: playback feeds ordinary `InputFrame` values and recorded fixed-loop deltas back into the existing browser loop rather than adding file, DOM, or network behavior to `src/core/`.

`src/browser/game-bootstrap.js` owns the launch wiring: `?level=2` loads `level_002` and skips the title screen, `?record=1` starts recording from the initial level state, `?playback=record001.json` loads `recordings/record001.json`, and `?playback_pause=120.2` freezes replay after the first recorded frame at or beyond that recording time until a key press resumes it. The same controls are exposed through the development tool strip and `window.__rocketfrockDev.gameplayRecording` / `window.__rocketfrockDev.gameplayPlayback`. Recording export uses the File System Access API when available and falls back to a normal JSON download.


## Revision 521 pathing debug naming and package hygiene

Revision 521 is a cleanup revision after the undeath-orb steering rewrite. It does not replace the obstacle-aware guidance helper: pathing projectiles still use the same direct blocked-path probe, short-range danger probes, persistent avoidance side, and normal homing velocity blend from revision 520.

The debug contract is now clearer. `src/core/simulation.js` emits only `upClearDistance`, `downClearDistance`, `upBeatsForward`, `downBeatsForward`, `upBias`, and `downBias` for pathing guidance capture. The shared regression summarizer in `tests/testbench.mjs` prints the same up/down terminology, avoiding stale left/right aliases that obscured the actual vertical avoidance behavior. The Character Editor presents the pathing launch modes as obstacle-aware choices rather than reserved slots.

Compact update archives continue to exclude `.build`, PNG, XCF, OGG, and EXE outputs, preventing stale local test-gate reports from being mistaken for source truth.

## Revision 512 undeath projectile presentation boundary

Skeleton Caster projectiles remain ordinary portable enemy projectiles in `src/core/simulation.js`: their `projectileKind` is `undeathOrb`, their renderer-facing `kind` remains `enemyFireball`, and `visualStyle: "undeath"` selects the green bubble presentation. Collision, damage, homing/pathing, lifetime, impact, and trail-emission state stay core-owned and unchanged.

`src/presentation/canvas-renderer.js` owns the visual guarantee. Canvas2D and WebGL both render emitted undeath bubbles from the projectile trail and also draw an explicit `undeathBubble` core at the current shown projectile transform. The core is presentation-only and exists to keep the projectile visible even if no transient bubble particle is alive during a particular render frame. WebGL texture prewarming includes this sprite in the resident direct-effect source list, keeping it out of mid-combat first-use uploads.

## Revision 520 undeath-orb steering and trail-only presentation

Revision 520 finalizes the replacement for the old brittle `pathing_lo` projectile behavior in `src/core/simulation.js`. Pathing projectiles remain ordinary fixed-step enemy projectiles, but their desired heading is now selected by a portable obstacle-aware homing helper that performs a true direct blocked-path probe toward the player plus three short danger probes around the current heading. A persistent avoidance side prevents frame-to-frame oscillation, and blocked direct-path impacts bias ground-obstacle escapes upward unless the opposite side has a decisively better clearance score. The helper continues to use the normal homing velocity blend and does not introduce browser or renderer dependencies.

The presentation layer in `src/presentation/canvas-renderer.js` again treats undeath shots as trail-only visuals. Canvas2D and WebGL draw the emitted `undeathBubble` particles at all quality levels, but do not draw a separate large projectile core.


## Revision 522 gameplay recording bundle export

Revision 522 keeps the existing gameplay recording JSON schema and adds optional screenshot metadata plus a browser-side export bundle path. The browser bootstrap now samples the rendered stage canvas at 1 Hz while recording is active, stores metadata on the recording object, and writes the JSON plus PNGs together when recording stops.


## Revision 523 removable Node capture island

Revision 523 keeps browser gameplay untouched and adds a small removable island in `devel/`: `node-canvas-adapters.mjs` provides only the browser APIs needed by the existing Canvas2D renderer in Node, while `capture_recording_frame.mjs` imports the real simulation, gameplay-recording normalizer, cave-window data, and production renderer. The helper replays recorded inputs through `stepSimulation`, prepares the presentation frame, renders with Canvas2D, and writes a PNG. No production module imports the helper.


## Revision 524 fixed wrench pickup identity

Revision 524 keeps the six wrench rocket effects but moves pickup identity from deterministic random rolling to authored data. `wrenchPickup` records use `effectId` as their selected mode; legacy `randomWrenchPickup` records still load but resolve through the same fixed path, defaulting to `wrenchCyan` when no valid wrench type is present. The Level Editor owns the authoring UI and the browser/gameplay runtime remains free of editor-only code.


## Revision 525 wrench default colour

Revision 525 keeps fixed authored wrench pickups and changes only the fallback/default identity: any wrench pickup without a valid authored `effectId` resolves to cyan Dart (`wrenchCyan`). The bundled authored levels and editor stress fixture use that same cyan identity for their fixed wrench pickups.


## Revision 526 color-coded wrench definitions

Revision 526 keeps fixed authored wrench pickups, but renames the actual effect definition IDs to color-coded values such as `wrenchCyan`, `wrenchYellow`, `wrenchGreen`, `wrenchRed`, `wrenchMagenta`, and `wrenchBlue`. Runtime normalization no longer maps old short-lived IDs from revision 524/525; authored level data must use the current IDs.


## Revision 527 hover-governor direction

Revision 527 keeps the attached rocket governor in core simulation but changes its sustain target from positive slow-fall velocity to the matching negative slow-climb velocity. The existing tuning field remains the speed magnitude so gameplay data and editor/runtime boundaries do not change.


## Revision 528 recording/capture split

Revision 528 keeps gameplay recording and visual capture separated. The browser runtime records JSON inputs and debug state only, while screenshot production lives in the removable `devel` Node capture utility that replays recordings through shared simulation and renderer code.

## Revision 530 package revision synchronization

Revision 530 makes no architecture changes; it only synchronizes the active package revision labels.

## Revision 145 menu navigation presentation contract

Non-title game menus own one presentation-layer Back action in their header. Browser views share `#game-menu-back`; SDL views retain a `back` menu entry but layout excludes it from ordinary rows and places it in the panel's upper-right corner. Back from the pause root closes the menu and resumes gameplay. Back from nested views returns to the owning parent view. The title screen remains a separate horizontal action strip and does not receive this header control.



## Revision 159 per-placement On top ordering and themed perimeter population

Atlas placements may author `onTop: true`; omission remains the canonical false/default form. Browser level conversion and native `FWorldVisual` preserve the flag. Presentation caches partition authored Background, ordinary world/Terrain, and cave Foreground visuals into ordinary and On-top buckets. The final order is Background, Background On top, ordinary Terrain/Decoration, actors and projectiles, actor-front entity visuals, Terrain/Decoration On top, Foreground, Foreground On top, then the cave-window black mask. Entity-local `actorFront` visuals remain part of the actor presentation contract rather than the placement flag. Browser static baking is bypassed for levels containing On-top placements so an old three-surface bake cannot flatten the new actor boundary.

The Level Editor manual perimeter command now calls `caveDecorationCatalog(currentGeneratorTheme())`. The selected theme's `assetPools.foreground` query requires the appropriate biome and `layer.foreground` tags, replacing the previous unfiltered manual catalog. Generated placements remain ordinary Foreground records unless explicitly edited later.

## Revision 160 On top collision-guide parity

`onTop` remains a presentation-only placement flag. Atlas-manifest collision extraction in both JavaScript and C++ ignores the flag, so stationary platforms, moving platforms, and blockable obstructions keep their gameplay geometry when drawn after actors. The Level Editor overlay now merges ordinary and On-top spatial partitions for Background, Terrain/Decoration, and Foreground guide queries; toggling **On top** therefore no longer hides green/yellow lines, collision areas, labels, or placement guides.


## Development exception alert boundary

The shared settings-data modules expose a product-wide `DEVELOPMENT` constant. It is deliberately separate from compiler build type and from the persisted `developmentMode` UI preference. Simulation code never performs file or UI work directly. Instead, rare invariant-recovery paths append structured records to `state.debug.exceptionAlerts` and increment `exceptionAlertSequence`. Presentation/runtime hosts consume each sequence exactly once.

Hunter watchdog incidents are captured before recovery changes navigation state, preserving enemy identity, position and velocity, watchdog anchor and elapsed time, support and route state, traversal state, target information, player position, timeout count, and selected recovery action. SDL writes an append-only NDJSON exception log in the ordinary `logs` directory and flushes every incident. Browser builds create an equivalent NDJSON download because the browser sandbox cannot guarantee silent filesystem writes. Under `DEVELOPMENT`, the host also forces the opt-in debug panel visible and applies a latched red alert surface. Disabling `DEVELOPMENT` suppresses only that intrusive visual presentation, not the incident record.


## SDL build revision 191 invisible portal points and collision utilities

SDL build revision 191 adds `wizard_entry_point` and `wizard_exit_point` as catalogued alternatives to the animated portal doors. The entry point owns the level's initial floor-anchored player position and leaves Ignatius visible and controllable immediately. The exit point retains the normal destination-level, boss-lock, save, and transition request path, but requests the transition as soon as Ignatius enters its trigger volume. Neither point creates runtime visuals or doorway phases. The Level Editor renders distinct editor-only vector markers and exposes only the fields meaningful to each point.

Atlas 001 contains the editor utilities `horizontal_blocker` and `vertical_blocker`. Their frame rectangles reference genuinely transparent unused regions of the existing PNG, while closed yellow `blockable` loops provide solid collision in every direction. Explicit negative `paletteOrder` values place them first without naming conventions, and empty `generationTags` keep them out of decoration and level-generation catalogs. Transparent frames with collision receive collision-derived palette thumbnails, and invisible blocker placements retain editor-only collision guides even when ordinary asset guides are disabled. Gameplay presentation remains fully transparent.

## SDL build revision 193 persistent player progression

SDL build revision 193 introduces one portable `playerProgression` record shared by the browser/reference and SDL/C++ simulations. It stores schema version 1, four integer upgrade levels (`healthLevel`, `fuelLevel`, `regenLevel`, and `speedLevel`), and a sorted set of stable `collectedUpgradeIds`. Save schema version 2 carries that record under `campaign.playerProgression`. Application-level playthrough ownership preserves it while disposable level state is rebuilt for transitions, restarts, and save loading. New games begin with an empty progression record.

Base tuning remains the authority for unupgraded rules. `playerProgressionStats()` derives effective maximum Health, maximum fuel, fuel recharge cap, both regeneration rates, and the player movement-speed scale from base tuning plus upgrade levels. `applyPlayerProgression()` is the only path that installs those derived values into runtime state. Capacity collection adds only the newly earned capacity to the current resource, while normal level entry and save restore refill to the upgraded maxima. Low-health and fuel-bulb presentation remain ratio-based, so increased capacity does not distort warning thresholds.

The shared interactive catalog exposes art-neutral `healthUpgrade`, `fuelUpgrade`, `regenUpgrade`, and `speedUpgrade` entity types with the palette labels `UpgradeHealth`, `UpgradeFuel`, `UpgradeRegen`, and `UpgradeSpeed`. Their current purple, blue, yellow herb and red mushroom visuals are presentation data only. A level-scoped collection identity (`levelId:entityId`) is committed to `collectedUpgradeIds` on collection; subsequent construction of that level begins the entity in its empty `collected` visual state and prevents duplicate rewards, while another level may safely reuse the same local entity ID.



## SDL build revision 194 rocket-relative homing envelope

Player homing target eligibility is simulation-owned and camera-independent. The portable rule uses a circular world-space envelope centered on each rocket with radius equal to the current virtual viewport width. Candidate rejection uses squared distance before line-of-sight work. A locked target is cheaply revalidated each fixed tick. Presentation camera framing may change without dropping a valid lock at the screen edge.

## SDL build revision 195 staggered homing search budget

Unlocked homing rockets gate complete target acquisition behind a 0.25-second per-projectile timer. `updateProjectiles()` also owns one transient search token per fixed update, so no more than one due rocket performs candidate filtering, line-of-sight ranking, and sorting in the same simulation tick. Due rockets that do not receive the token keep a zero timer and naturally advance on following ticks in stable projectile order. The token is deliberately local to the update call and adds no serialized state. Initial volley targeting remains one shared acquisition pass before projectile creation.

## Revision 197 sound-effect layer

Short gameplay effects use individual 48 kHz, 16-bit mono PCM WAV files under `resources/sfx/`; music and long ambience remain OGG. `resources/sfx/sound-effects.json` names the browser-facing files, volume trims, and small voice-pool limits. The browser `sound-effects-director.js` and native SDL_mixer voice pools consume portable simulation events rather than owning gameplay decisions. Retained debug events are de-duplicated before playback, settings SFX volume is applied independently of music volume, and replacement artwork/content may swap a WAV without changing simulation code.

### Sound-effect cue arbitration and reaction-symbol triggers

Sound effects remain presentation-owned and data-driven through `resources/sfx/sound-effects.json`. Simulation debug events are grouped by simulation tick only to coalesce duplicate mappings to the same cue; distinct cues are never suppressed and may mix through their independent voice pools. Looping reading/thinking/rocket-boost cues use presentation-side envelopes and the same persisted Effects-volume multiplier as one-shot cues. `devel/sound-synthesizer.html` is an isolated authoring helper: its compact single-screen DSP workbench renders two oscillators, coloured noise, envelopes, modulation, filters, EQ, texture effects, and echo into previewable/exportable WAV data, but it is not imported by runtime code and owns no gameplay decisions.

The simulation owns transient `story.overheadSymbol` state and one-shot symbol-trigger records. Rendering resolves `thought_bubble_question` or `thought_bubble_exclamation` from `it_atlas_001` above the current player position; the trigger itself has no gameplay visual and does not interrupt movement.


## Rocket sound identity boundary

Rocket launch, sustained boost, and explosion remain independent replaceable WAV assets. Their placeholder synthesis is content-only: simulation emits the existing portable events, presentation resolves the catalog entry, and the global Effects-volume multiplier is applied after the per-cue trim. The jump cue intentionally reuses the former launch sample, while rocket cues use newly shaped white-noise-based content without changing event semantics.

## SDL build revision 206 water-region fluid model

Water is authored as a closed atlas-guide loop with kind `water`. Atlas Forge and the optional runtime asset-guide overlays render it in blue, but ordinary gameplay presentation never draws the guide. Hydration creates a `world.collisionPolygons` entry whose kind remains `water`; its edges do not become solid collision segments, walkable supports, or ordinary platform geometry.

The browser and native simulations derive a continuous `waterSubmersion` value from three vertical body samples rather than switching at a single point. Horizontal and vertical drag increase with both submersion and speed. Gravity remains active but is opposed by near-neutral buoyancy, producing a slow idle sink, while directional input supplies reduced horizontal acceleration and explicit upward/downward swim acceleration. The model is intentionally game-scale rather than computational fluid dynamics, but preserves the requested depth relationship: entering faster takes more water depth to remove the velocity. Crossing the surface never causes damage. If a submerged blockable floor is reached before drag has arrested the fall, the ordinary landing system evaluates the remaining vertical speed and may still inflict damage.

Submersion is portable simulation state (`inWater`, `waterSubmersion`, and `waterRegionId`) and is included in native recording/playback snapshots. While submerged, Flight control, attached backpack boost, and player rocket launch are unavailable and do not spend fuel. Ordinary enemies treat water polygons as navigation obstacles and as blocked body/swept space, reserving true aquatic movement for a future character capability rather than silently changing every existing enemy.

## Revision 223 reserved level-test isolation

Revision 223 enforces the existing `level_tNN` test-fixture boundary across both test suites. Browser and native unit tests no longer load ordinary campaign or 800-series level files. Stable snapshots needed for collision, item, boss, dependency, and full-level loader coverage live under `resources/levels/level_t03.json` through `resources/levels/level_t07.json`; their portal destinations remain inside the test namespace.

Production `level_###` files are mutable authored content. Tests may exercise level IDs as ordinary strings or construct focused levels in memory, but file-backed regression data must come from `level_tNN`. This prevents legitimate level editing from breaking the release gate through stale entity-count or scaffold assumptions.


## Revision 224 bundled proximity-text typography

Proximity-triggered TEXT typography remains presentation-owned while the portable simulation carries only the normalized family ID and styling fields. The authored family domain is now exactly `inter` or `caveat`; legacy generic values normalize deterministically. Browser Canvas resolves those IDs through local `@font-face` declarations, and SDL loads the same original TTF assets into cached memory before prewarming per-entity text textures. The runtime frame path performs no file access or font discovery.

The expected files are `resources/fonts/Inter[opsz,wght].ttf` and `resources/fonts/Caveat[wght].ttf`. Their unmodified OFL 1.1 notices travel beside them under `resources/fonts/licenses/`, and the proprietary copyright notice explicitly excludes licensed third-party material. Missing font binaries are tolerated only as a development staging state and fall back to system candidates; present but unreadable files fail loading rather than silently substituting. New TEXT entities default to `Lorem ipsum`, `#723891`, a 3-pixel `#0f0113` outline, and Inter.


## Revision 225 resource-root architecture

Runtime data is rooted at `reference/resources` in the browser source tree and `content/resources` in packaged native builds. Authored JSON stores resource-root-relative category paths such as `levels/level_001.json`, `atlases/at_atlas_001.json`, and `characters/ct_char_enemy_010.json`. Browser adapters prepend `resources/` through `src/shared/resource-paths.js`; native adapters join the same logical paths to the detected resource root. Relative character dependencies remain local to `characters/`, while known category prefixes and filename families resolve cross-category references without filesystem searching. `devel/audit_resource_layout.mjs` validates the entire graph before browser test gates.

## Revision 227 generated DevTool level contract

The Windows DevTool writes the current Level Editor browser copy into packaged resources at `content/resources/levels/level_temp.json`, then starts the SDL game with `--level level_temp --start-in-game`. This deliberately uses the same level-resource loader as authored levels. The generated filename is not an authored campaign level or a `level_tNN` test fixture, and the source resource audit rejects it under `reference/resources/levels`. Browser-only playtesting continues to use local storage because a normal browser cannot write into the source tree.

## SDL build revision 230 fullscreen presentation boundary

`src/shared/fullscreen-presentation-data.js` and `src/shared/fullscreen-presentation-data.cpp` define the common 1920x1080 fullscreen reference and the crop-to-fill metric calculation. This helper is presentation data only. Simulation continues to operate in world units and receives only the resulting virtual camera dimensions.

Fullscreen scale is `max(targetWidth / 1920, targetHeight / 1080)`. The visible logical viewport is the physical target divided by that uniform scale, so a 16:9 target remains exactly 1920x1080 and a different aspect ratio crops one axis. Browser Canvas2D/WebGL2 and native SDL_GPU render directly into the physical-resolution backing target. SDL_Renderer uses the same scale on its window render target. Windowed mode bypasses the reference transform and preserves its variable viewport. Input adapters must invert the active transform before gameplay consumes pointer coordinates.


## SDL build revision 231 rocket exhaust presentation offsets

Rocket exhaust alignment remains presentation-only. The browser renderer exposes `rocketPresentationOffsets()` with a two-reference-pixel local-right trail offset and a six-reference-pixel forward-only flame offset. Canvas2D, WebGL2, and SDL apply the same rocket-relative vectors after world-to-screen conversion; simulation-owned projectile positions, velocities, homing, collision, and serialized trail samples remain unchanged.
