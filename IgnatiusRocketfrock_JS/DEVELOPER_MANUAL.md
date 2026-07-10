# Ignatius Rocketfrock Developer Manual

This file holds implementation-facing guidance that would otherwise crowd the Level Editor. The editor UI should favor compact controls, live feedback, and short status messages. Longer behavioral explanations belong here.

## Level Editor loading and navigation

At startup the editor scans `assets/level_001.json`, `assets/level_002.json`, and subsequent numbered files through `level_020`, stopping at the first missing level. Environment atlases are discovered from numbered `assets/at_atlas_###` pairs, while character and independent atlases are loaded through their own manifests.

The right mouse button pans the canvas regardless of the active tool. **Fit** frames authored placements and entities. Shift-drag replaces the current selection with fully enclosed objects. Ctrl-click and Ctrl+Shift-drag toggle objects. The primary selected object is editable; secondary selections move and delete with it.

## Live object inspector

The Selected object panel has no Apply button. Position, dimensions, rotation, and notes update while edited. Selects, checkboxes, IDs, and nonvisual values commit on their normal change event. Enemy scale remains a live uniform multiplier for the Character Editor-authored hitbox, artwork scale, artwork offsets, and projectile radius. Character-enemy W/H fields display the resulting hitbox and remain read-only.

Generated locked records reject inspector changes until unlocked. Changing a wizard door or character enemy may perform the same floor snap that the previous Apply action performed when the field is committed.

## Palette thumbnails

The Entity and Asset palettes use matching two-column scrolling grids. Cards retain fixed useful preview height regardless of result count. Direct atlas assets are cropped to visible alpha before fitting. Composed character previews are first rendered to a temporary surface, cropped from the final combined alpha, then centered and scaled to fill the card. This avoids transparent part padding and rig-space extents making enemies appear small or off-center.

## Automatic enemy spawning

Level-wide automatic spawning rolls once per second. A successful roll creates an already-alert enemy beyond the forward screen edge. The pool uses numeric ranges and `!` exclusions shared with the automatic generator.

A placeable enemy spawner is different: it is invisible during play and advances its timer only while its authored rectangle intersects the camera. A successful roll teleports an already-alert enemy to the authored point. Ground enemies require safe support; blocked, occupied, or unsupported attempts are skipped.

## Hunter navigation graphs

The editor builds one navigation profile for each distinct hunter body size and mobility configuration. Profiles include directed jumps, drops, step transitions, and chasm crossings. Dynamic blocker IDs can disable or penalize affected edges at runtime. Every authored hunter profile used by a packaged level must have an exact bake.

## Automatic Level Generator

Horizontal is the run-and-gun route. It advances steadily toward the exit, favors solid overlapping ground pieces with level walking surfaces, and uses only occasional height changes. A distributed two-step upper lane now covers at least 36 percent of the playable span. Each destination has its own one-way access step and is classified as a combat perch, ordinary reward perch, or dedicated power-up detour. Thin one-way platforms remain separate and never pretend to form a continuous floor.

Standard remains the folded route with broad upper traversal and a nearly continuous lower recovery path. It now creates more detached first-tier side platforms and extends a subset into second-tier branches, using otherwise empty ceiling volume for monsters and rewards. Domed caverns keep the lower perimeter close to the route while expanding that upper volume.

Rewarded levels target roughly one real power-up per 3,000 route pixels at default density. The generated pool is 60 percent random wrench, 30 percent Overdrive, and 10 percent Shield. Dedicated second-tier power-up perches receive Overdrive before ordinary reward slots are filled, so the speed reward is visibly off the main path. Reward-only rerolls retain fixed safe seats and anchored encounters while varying the pickup mix.

Encounter rerolls preserve route, platforms, endpoints, and rewards. Reward rerolls preserve route and terrain while replacing generated rewards and retaining anchored encounters. Validation reports the current generated records. Generator locks prevent direct editing but regeneration still replaces generator-owned records. Converting a generated object to manual ownership detaches it from generator clear and regeneration operations.

## Cave window and foreground

The cyan loop is the cave opening. Feather controls the transparent-to-black width. The dashed magenta outset is the exact full-black boundary. Gradient waviness perturbs opacity contours without moving collision, navigation, decoration normals, or the lethal boundary.

Foreground is inert presentation. It renders after actors with cave parallax, uses depth treatment, fades outward into black, and never has atlas collision. Automatic population derives dense overlap from rendered formation size and covers through the full-black boundary. Manual population intentionally has no gameplay-clearance protection, allowing foreground formations to overlap platforms, doors, actors, and other playable space. The Level Editor applies the same world-bounds-anchored camera offset to the cave opening, its gradient guides, and every `caveForeground` placement. Pan and zoom the editor to the camera region being authored before judging whether a door, platform, or actor remains inside the visible opening.

## Level colour map

Colour mapping never modifies source PNG files. Recolored atlas copies are cached only when settings change. Environment atlas artwork is affected; characters, collision geometry, alpha, and the cave background are not.

## Moving platforms

Shuttle is the safe default and pauses at both endpoints. Vanishing patterns always restore the platform after their hidden reset time. The circular END handle edits the route directly on the canvas.

## Signals, gates, and boss defeat

Nearby levers and keyholes respond to Down, S, Enter, or the equivalent gamepad input. Levers toggle their channel. Keyholes emit once after the required key is available. Signal gates begin closed and raise when their channel activates. Boss enemies may emit a named channel when defeated. Independently, an exit door refuses to open while any living boss remains in the level.

## Mailboxes, treasure, and doors

Each mailbox owns its letter, thought, trigger distance, and timing. Long text scrolls automatically and Jump advances or closes it. Treasure chests open once when Ignatius approaches, award their score, briefly display loot, then remain open and empty.

Entry doors replace the legacy wizard-start marker. Exit doors are mirrored by default. An empty exit destination resolves to the next numbered level; if loading fails, the current level is restored.

## Character enemies

The placement point is the enemy foot position. Awareness uses distance and facing cone rather than line-of-sight collision, although terrain may still block movement and attacks. Simple patrol retains local movement. Hunters leave patrol, choose reachable attack positions, cross gaps with one jump, glare while the target is unreachable, and attempt to return home. A hunter unable to climb home adopts its current support as a temporary patrol and periodically retries.

## Reactive objects

Reactive objects live in authoritative simulation state. Rockets strike them before terrain behind them. Their collision is removed when they enter a nonblocking state such as destroyed.

## Palette placement workflow

Selecting an Asset or Entity palette card activates its placement tool. While the pointer is over the canvas, the editor draws a translucent snapped preview using the same size, visual, anchor, and applicable ground-snap rules as the final record. Clicking places one object and returns to Select. The preview is transient UI state and must never be serialized or consume an ordinary object ID.


## Level Editor rendering performance

The normal editor now uses the production Canvas2D game renderer for the complete base scene. Authored level data is converted through `applyEditorLevelToWorld`; `RocketfrockRenderer.setViewOverride()` supplies the editor's top-left camera and zoom. The separate transparent `#stage-overlay` owns only authoring vectors such as grid lines, collision/manifest guides, labels, cave controls, route diagnostics, selection, and placement previews.

Redraw requests remain coalesced through `requestAnimationFrame`. Pan and zoom are camera-only operations: they reuse the current runtime world, spatial buckets, overlap composites, foreground treatment cache, cave mask cache, and loaded atlases. Do not mark runtime world data dirty merely because the camera moved. Level loads, placement/entity edits, cave edits, colour-map changes, and relevant visibility controls mark it dirty; the next frame performs one conversion and then returns to cheap camera-only rendering.

During a placement or entity move, the base runtime snapshot omits the moving records once. Their live artwork and guides are drawn on the overlay until the drag commits, so ordinary pointer movement does not reconvert the complete level. Camera panning does redraw both canvases directly and keeps artwork and guides in one coordinate system. There is no CSS-translated snapshot, independently moving layer, whole-level bitmap, editor WebGL context, or editor tile cache.

The Level Editor deliberately ignores the game's `?webgl=0` / `?webgl=1` selection and always uses Canvas2D for its base scene. Add `?profile=1` or `?perf=1` to expose animation-frame cadence, queue delay, authored-world synchronization cost, production renderer world/actor/foreground/mask timings, guide-overlay cost, and visual culling counts. The latest values are also available as `globalThis.__ignatiusEditorPerformance`.


## Test gates and release testing

The testbench is divided into named development gates, and every primary test has explicit ownership in `tests/test-gate-manifest.mjs`. Each shard runs in a fresh Node process. This keeps memory bounded and makes the intended scope visible.

Use `npm run test:editor` for Level Editor and Puppet Forge work, `npm run test:game` for simulation and runtime work, `npm run test:shared` for shared data, browser adapters, manifests, and presentation helpers, and `npm run test:generator` for procedural generation. `npm run test:smoke` is a small overlapping cross-system check. A focused development pass should normally run its affected gate plus `shared` and `smoke`; add any neighbouring gate whose contract changed.

`npm test` is the authoritative fresh release gate. It runs twelve sequential fresh-process shards: two shared, two editor, four game, and four generator. The runner continues after a failed shard and prints a final table with passed, failed, timed-out, and skipped groups. Per-shard timeout defaults to five minutes and can be changed with `TEST_SHARD_TIMEOUT_MS`.

After each completed shard, the runner writes `.build/test-gate-report.json`. `.build/` is excluded from releases. `npm run test:release:resume` may skip shards already passed only when the SHA-256 fingerprint of all test-relevant source is identical. Ordinary `npm test` ignores old progress and starts clean. Use `npm run test:list` to inspect gate composition.

Generator boundaries remain foundation, decorated macro, content, and route-seed sweep. They stay sequential because concurrent geometry processes compete for memory. Testbench startup validates that every test has exactly one primary owner, so adding a test also requires an intentional manifest assignment.

`npm run audit:renderer` checks the direct Canvas ownership boundary recorded in `RENDERER_BOUNDARY_AUDIT.md`. `npm run inspect:editor-stress` verifies the frozen dense fixture metrics recorded in `EDITOR_STRESS_BASELINE.md`.

## Fixed-step browser input buffering

The browser loop deliberately separates polling from edge consumption. Call `input.sample({ consumeGameplayEdges: false })` once per animation frame, pass that frame to the first available fixed simulation step, and then call `input.consumeGameplayEdges(stepInput)`. Do not clear press/release fields merely because a rendered frame occurred. A 120 Hz display commonly produces render frames with no 60 Hz simulation step, and consuming there would lose short presses.

Keyboard and pointer transitions are event-latched. Gamepad transitions are latched when the Gamepad API is polled. A quick complete tap may therefore produce both `jumpPressed` and `jumpReleased` in one simulation frame. The jump simulation processes release first so an airborne release-and-repress can arm and start the rocket boost deterministically. `createSubstepInputFrame` remains responsible for stripping edges from the second and later catch-up steps while retaining held controls.

Use plain `input.sample()` only in isolated tests or utilities that intend to consume the returned edges immediately. Menu, focus-loss, level-restart, and title-start paths should continue to call `input.clear()` or `suppressJumpUntilRelease()` as appropriate so buffered gameplay gestures cannot leak across UI boundaries.


## Revision 307 yellow wrench profile note

The canonical yellow wrench remains `POWER_UP_EFFECT_IDS.WRENCH_TRIPLE` for save compatibility, but its visible label is Fivefold. Its current profile is data-driven in `src/shared/power-up-data.js`: `projectileCount: 5`, `damageMultiplier: 1 / 5`, and `initialAnglesDegrees: [-7.5, -3.75, 0, 3.75, 7.5]`. Keep the centre entry at index 2 when tests or tooling inspect the nearest-forward aim line.

## Revision 308 uncapped player rocket launch cadence

Player rocket firing is edge-triggered but has no simulation cooldown. `src/core/simulation.js` should attempt a launch for every delivered `weaponPressed` edge and reject it only when fuel is insufficient or another explicit gameplay rule blocks the action. Do not restore `rocketLaunchCooldown`, `weapons.launchCooldownTimer`, `launchCooldownMultiplier`, or cooldown-based `ROCKET_LAUNCH_BLOCKED` events. Older serialized states may still contain a `launchCooldownTimer` property; it is ignored. Holding a launch key does not invent repeated presses, so automatic fire remains a separate future control decision.


## Revision 310 wrench launch-path tuning

Yellow Fivefold keeps five evenly spaced non-homing rockets in the canonical `[-7.5, -3.75, 0, 3.75, 7.5]` fan around the nearest-forward aim line. Blue Homing Triple keeps its authored `[-12, 0, 12]` fan and standard homing behavior.

Both yellow Fivefold and blue Homing Triple now use a small deterministic shared wedge-direction perturbation bounded by `HOMING_TRIPLE_INITIAL_DIRECTION_JITTER_DEGREES`, currently 2 degrees. `src/core/simulation.js` samples that offset once per volley and applies the same value to every projectile in the volley, so the wedge keeps its internal spacing while rapidly repeated volleys no longer retrace one rigid set of rails. The salt includes the level, level-load count, and volley identity; identical seeded replays therefore remain identical. Keep this randomness in portable simulation data; do not use `Math.random()` or renderer-owned variation.

The lightning pickup is **Overdrive**, with canonical internal IDs `overdrive` and `overdrivePickup`. Its passive fuel recovery is `attachedBoostDrainRate * OVERDRIVE_PASSIVE_FUEL_RECOVERY_DRAIN_FACTOR`, currently 90 percent of hover drain. Apply that rate even during attached boost, while airborne, and during the normal recharge delay. When ordinary recharge is eligible, use the larger rate rather than adding both. This keeps tuning predictable: with the current 40 fuel/second hover drain, Overdrive recovers 36 fuel/second and hovering therefore consumes a net 4 fuel/second.


## Revision 311 WebGL2 rendering guidance

The game canvas is WebGL2-first. `createRenderer` in `src/presentation/canvas-renderer.js` attempts `createWebGL2RendererBackend` and uses the visible canvas as the WebGL target. A separate hidden Canvas 2D surface remains available for procedural drawing and for the complete fallback renderer. Do not request a 2D context from the visible canvas before WebGL2 selection, because a browser canvas cannot switch context families afterward.

Use `WebGL2RendererBackend.queueSprite` or `queueSurface` for stable image-backed visuals. Preserve scene order: the batch only merges adjacent commands that use the same texture, and texture changes flush automatically. Static sources should use cached uploads; the staging surface must be marked dynamic so each changed pass uses `texSubImage2D`. The same staging canvas is uploaded twice per frame, once for actors/effects and once for masks/overlays, so each upload must force a fresh texture update even within one WebGL frame.

Canvas/image sources are uploaded premultiplied and rendered with `ONE, ONE_MINUS_SRC_ALPHA`. Do not change one side of that contract independently. Clear the GPU texture cache after replacing colour-mapped atlas canvases or foreground/overlap caches. Keep gameplay and deterministic simulation completely unaware of the renderer backend. WebGPU should only be reconsidered when a measured workload cannot be served by this WebGL2 batcher and browser/runtime support is acceptable.

## Revision 312 particle-pass migration guidance

When adding or adjusting rocket smoke, projectile explosion, or Ignatius death particles, prefer the dedicated WebGL2 effect helpers in `src/presentation/canvas-renderer.js` (`drawWorldEffectsWebGL`, `drawProjectileExplosionEffectsWebGL`, and `drawPlayerDeathCoverWebGL`) rather than pushing those families back onto the staging canvas. These helpers rely on small cached sprite canvases and backend blend-mode selection, so keep their visuals image-backed and batching-friendly.

Only move an effect family into the direct GPU pass when its ordering relative to staging uploads is explicit. Lower scenery/actor staging uploads happen first, then the direct GPU particle pass, then upper staged actors/UI content. If an effect still needs the full Canvas drawing API or does not justify a dedicated sprite treatment, leave it on the staging canvas and preserve fallback parity.

## Revision 313 enemy projectile migration guidance

With WebGL2 active, launched enemy fireballs, musket balls, and rocks should now be handled by `drawEnemyProjectilesWebGL` in `src/presentation/canvas-renderer.js`. Keep those projectile visuals sprite-oriented so they can stay in the GPU batcher. If a new enemy projectile family is lightweight and image-backed, prefer extending this pass instead of routing it back through the staging canvas.

Preserve scene order carefully. The direct enemy-projectile pass sits after the lower staged world/effect upload and before the staged pass containing player rockets, Ignatius, and score popups. If a projectile depends on complex Canvas drawing semantics or must interleave differently, document that explicitly before changing its pass assignment.

## Revision 314 player rocket migration guidance

With WebGL2 active, launched player rockets should now be rendered by `drawPlayerRocketsWebGL` and `drawProjectileRocketWebGL` in `src/presentation/canvas-renderer.js`. Keep future rocket-visual adjustments sprite-friendly so they can stay in this GPU batch. The helper `queueWebGLAssetSprite` now supports pivot-style local offsets for images whose simulation origin is not the centre of the source bitmap.

The staging Canvas path still owns Ignatius, text, and several other dynamic overlays, so any new projectile-related embellishment should be placed carefully: direct rocket trails, direct rocket bodies, and direct explosion effects happen before the staged player/UI pass. Preserve the pure Canvas fallback behavior when extending these helpers.

## Revision 315 actor rendering guidance

With WebGL2 active, target markers, pickups, enemies, and the player rig should use their direct GPU helpers in `src/presentation/canvas-renderer.js`. Character animation and pose calculation remain shared with the Canvas path; do not fork gameplay or animation state for the GPU renderer. Add image-backed actor details through `queueCharacterProjectPoseWebGL` or adjacent sprite passes whenever their ordering is clear.

The upper staging pass is now primarily for procedural remnants such as the mounted fuel bulb, debug guides, mailbox/story text, and cave masking. Score popups should use `getWebGLTextSpriteCanvas` plus `drawScorePopupsWebGL` rather than returning to the full-screen staging layer. Avoid moving sprite-like actors back into that staging pass. Any new effect that requires Canvas should be isolated so it does not force already-migrated actors to be redrawn there.

## Revision 316 WebGL parity guidance

When changing GPU character ordering, compare it directly with `renderCanvas2D`. Death-cover sparks are intentionally drawn after Ignatius and before score popups. Moving them back into the earlier world-effect pass makes the effect appear behind the player and breaks the original visual contract.

Character damage flashes use the secondary `overlayTintAlpha` / `overlayTintCanvasKey` channel of `queueCharacterProjectPoseWebGL`. Keep that channel separate from the primary shield/low-health tint so simultaneous effects can compose. All character projects must prepare `hitFlashCanvas`; only the player project additionally requires `shieldCanvas` and `lowHealthCanvas`.
 In the Canvas fallback, route both enemy and player injury flashes through the same prepared `hitFlashCanvas` overlay path in `drawCharacterProjectPose`; do not reintroduce live `ctx.filter` flashes on the gameplay canvas.

## Revision 317 fallback and context-loss guidance

Do not probe WebGL2 by requesting it directly from the visible game canvas and then attempting a 2D fallback on that same element. Canvas context families are sticky. Use `probeWebGL2RendererSupport`, which creates and disposes a complete scratch backend, before the visible canvas is committed to WebGL2. If the probe fails, the visible canvas must remain untouched and use the ordinary Canvas 2D renderer.

Once the visible canvas owns WebGL2, a context-loss interval is not a Canvas fallback opportunity because the renderer's 2D canvas is only the hidden staging surface. Keep presentation idle until `webglcontextrestored` rebuilds the GPU resources.

## Revision 356 Level Editor renderer guidance

Treat the production Canvas2D renderer as the only base-scene implementation in the Level Editor. Editor work may add overlay guides or improve dirty-state precision, but it must not fork atlas composition, cave foreground, parallax, actor rendering, or layer ordering into another renderer. Keep the portable conversion seam (`applyEditorLevelToWorld`) and presentation camera seam (`setViewOverride`) narrow and explicit.

When adding an authoring mutation, ensure it marks `editorRuntimeWorldDirty`. When adding camera-only interaction, do not mark that flag. If a live manipulation can be represented transiently on the overlay, omit the manipulated records from the base snapshot once and defer reconversion until commit. Preserve the standalone Canvas baseline as a diagnostic control, not as a separate source of rendering truth.


## Revision 319 Overdrive naming guidance

Use `overdrive` for the portable effect ID, `overdrivePickup` for authored and generated level entities, and `POWER_UP_EFFECT_IDS.OVERDRIVE` in code. Do not reintroduce `speedShot`, `speedShotPickup`, or a translation layer for them. All supported bundled levels were migrated together in revision 319.

The older `rocketOverdrive` experiment remains a retired and rejected identity. Overdrive behavior itself is unchanged: twenty-second refresh duration, half player-rocket fuel cost, and passive fuel recovery at ninety percent of hover drain.

## Revision 320 dynamic WebGL safety rule

Do not reactivate direct WebGL rendering for Ignatius, enemies, or projectiles solely on the strength of headless/source-contract tests. Revision 319 passed the automated suite but failed the first real playtest with all gameplay-critical sprites invisible.

The supported production path now draws the entire dynamic actor stack to the transparent staging canvas and lets WebGL2 composite that layer. Any future direct-sprite reintroduction must be incremental, guarded by a runtime switch, and checked in at least Chromium and Firefox with visible-player, visible-enemy, visible-projectile, hit-flash, death, and context-restoration scenarios.


## Revision 323 WebGL2 resident-texture testing

Canvas 2D remains the normal game renderer. Add `?webgl=1` to `game.html` only when testing the opt-in GPU path. Startup probes WebGL2 on a disposable canvas before the visible canvas is committed, so an unavailable or failed GPU backend still starts through Canvas 2D.

The debug panel identifies the experimental path as `webgl2-resident`. Its GPU line reports draw calls, quads, new uploads, texture updates, full-screen Canvas-layer uploads, texture count, and estimated resident MiB. In ordinary gameplay after startup, `layers:0` is the important revision-323 expectation. A nonzero layer count is legitimate while a story/debug overlay, puppet guide, fallback geometry, or unsupported residual visual is active. Cave-mask camera changes may increment texture updates without incrementing Canvas-layer uploads.

For visual validation, use a real browser configuration with WebGL2 enabled. Some headless Chromium builds disable WebGL entirely and silently exercise the Canvas fallback instead. Confirm both the `webgl2-resident` backend label and visible atlas-backed actors before treating a benchmark as a GPU result.

## Revision 324 WebGL effect and cave-mask validation

Open `game.html?webgl=1` and first confirm that the debug panel says `render:webgl2-resident`; a browser that silently falls back to Canvas is not a valid GPU test. Fire a player rocket along a curved route and verify that the smoky, sparkling path and nozzle flame remain visible, with no large fuzzy orange circle snapping between the newest trail samples near the rocket. Inspect a goblin fireball in both renderer modes: its authored teardrop body should retain the same narrow rear silhouette in WebGL and Canvas, without a circular orange bulb underneath it. Detonate both a player rocket and an enemy fireball, then destroy a reactive crate or barrier. The explosion cores, rings or sparks, impact puffs, goblin-fireball trail, and destruction smoke should all be visible.

On a warmed ordinary frame, the GPU diagnostics should normally read `uploads:0 updates:0 layers:0`. Camera movement should no longer increment `updates`, because the cave opening and feather are resident geometry and the exterior is generated with the stencil buffer. A nonzero `layers` count remains legitimate for mailbox/story presentation, debug or puppet guides, collision-only fallback scenery, or an unsupported residual visual.

WebGL2 is requested with a stencil buffer. If the implementation reports no usable stencil support, the renderer deliberately falls back to the older cached Canvas cave-mask texture while retaining the rest of the GPU path. Canvas 2D behavior is unchanged and remains the default without the URL parameter.


## Temporary enemy balance multipliers

The Game tuning panel begins with a temporary enemy-balance section. Melee and ranged enemies each have independent HP, run-speed, and attack-rate multipliers. Ranged enemies also have a projectile-speed multiplier. `1×` preserves the authored values.

Ranged classification is based on runtime attack mode, not artwork or enemy ID. Any monster whose `attackMode` is `projectile`, including the bombing bat, receives the ranged multipliers. Attack rate accelerates the complete attack cycle, including wind-up/release timing and recovery cooldown. HP changes apply immediately to living monsters while preserving their current health percentage.

These controls deliberately do not modify `ct_enemies_001.json`, level JSON, or generator catalogs. During balancing, copy the tuning JSON to retain a promising combination. Once final factors are chosen, recalculate the authored enemy values and return all seven multipliers to `1×`; this keeps the final data explicit and removes dependence on a global playtest layer.


## Enemy family numbering

The current enemy namespace is grouped by creature family. Skeleton variants use `enemy_001` through `enemy_009`, goblins use `enemy_010` through `enemy_019`, and bats use `enemy_020` through `enemy_029`. The active entries are Skeleton Guard `enemy_001`, Fireball Goblin `enemy_010`, Musket Goblin `enemy_011`, and Bombing Bat `enemy_020`.

The goblins share `ct_atlas_enemy_010.png` but use separate character, rig, and animation stems for `010` and `011`. Bombing Bat uses the `020` stem throughout. Numeric enemy-pool fields refer to these suffixes, so use `10,11` for both ordinary goblins and `20` for the bombing bat. Gaps are valid because catalogs enumerate actual entries. Do not add aliases for the retired live identifiers; update all bundled levels and tools together when a future family migration is intentional.


## Ranged attack validation

Ranged enemies may start attacks well outside their authored `attackRange`; that value now guides preferred approach spacing. They still require Ignatius to be inside the current awareness range and facing cone. A remembered last-seen position keeps pursuit alive but never permits firing by itself.

When testing ranged enemies, place solid cover between the enemy and Ignatius and verify that no wind-up begins. Remove the cover and verify that the enemy may attack immediately even from long range, provided the projectile can reach within its lifetime. Move behind cover or out of the awareness cone during the wind-up and verify that no projectile is released. Bombing bats should only drop when their predicted falling-rock lane overlaps Ignatius and no platform or blocking geometry interrupts the descent.


### Enemy projectile volleys (revision 332)

Projectile enemies may author `projectileVolleyCount` (1-15, default 1) and `projectileVolleyHalfAngle` in degrees (0-180, default 0). The simulation distributes projectiles evenly from negative to positive half-angle around the launch-time aim vector. Straight-volley attack permission succeeds when at least one member's swept circular trajectory intersects the player before terrain or a reactive projectile blocker. Each released projectile remains an independent ordinary projectile and carries `volleyId`, `volleyIndex`, `volleyCount`, and `volleyAngleOffsetDegrees` for diagnostics and presentation.


### Camera-relative cave preview (revision 333)

The cave window is not fixed to ordinary world geometry when `parallax` is above 1. Runtime anchors the effect at the technical world-bounds centre and shifts the opening and cave-foreground artwork according to the current camera centre. The Level Editor now calls the same `computeCaveWindowParallaxOffset` helper, so panning to a room previews the mask position that gameplay will use there. Cave-point and foreground-asset hit testing, placement, dragging, labels, guides, and marquee selection operate on the displayed position while preserving authored world coordinates in level JSON.

## Retired enemy-hit laboratory (revision 380)

The standalone enemy-hit timing laboratory and its dedicated test have been retired. Enemy-hit presentation remains covered by the ordinary Canvas/WebGL renderer and simulation regressions.


### Ordinary-jump height trimming

Keep `ordinaryJumpHeight` as the authored full apex. Down is modeled as a full airborne gravity modifier: whenever it is held, use `2 * gravity` instead of `gravity`, during both ascent and descent. This halves the ordinary jump height when held from takeoff, curbs boost-kick travel, and creates a fast fall. Preserve the independent one-way-platform rule so grounded or descending Down input also grants passage through green walkable lines.

Enemy body contact damage is intentionally independent from ordinary attack invulnerability. Route it through `damagePlayer` with `invulnerabilityTimerKey: "contactInvulnerabilityTimer"`; do not set or consult the ordinary timer for contact hits. This preserves same-frame melee attacks while preventing sustained overlap from applying damage every simulation tick.

Revision 347 re-voices the alternate synthesized tunes rather than applying one blanket lead transpose. Each melody is placed in Level_001's low register according to its original tessitura, and every true bassoon foundation is kept strictly below the lead to prevent accidental voice crossing. Decorative bell accents remain independent of the bass hierarchy.

## Revision 352 cave-warning performance note

Cave geometry warnings depend on authored cave and terrain geometry, not on the camera. The editor therefore caches the sampled cave perimeter and each terrain placement's separation result. Do not invalidate or bypass this cache merely because the viewport pans, zooms, switches renderer, or changes grid/guide visibility. New cave diagnostics should follow the same rule: separate camera-dependent drawing from camera-independent validation.

## Revision 356 Level Editor panning note

Panning changes the editor camera and requests an ordinary production Canvas2D renderer frame. The guide overlay is redrawn in the same animation frame at the same camera, so artwork, boxes, labels, cave controls, and the side panel remain aligned. There is no post-drag catch-up frame and no finite snapshot that can reveal blank edge strips.

## Revision 357 Level Editor browser-timing note

Do not let diagnostics participate in editor viewport sizing. `#workbench`, `#canvas-wrap`, and `#hud-strip` must remain shrinkable inside the fixed main grid. The full profiler string may be clipped or exposed as a tooltip, but it must not widen the canvas row. Leave the visible canvas size to CSS and update only the backing-store width and height in `resizeCanvas()`. Setting an inline CSS width from `getBoundingClientRect()` recreates the resize feedback loop.

During a direct-manipulation gesture, pointer events should only update the latest camera or transient object state. The active requestAnimationFrame chain owns presentation and continues until the drag ends. Do not return to one render request per pointer event, which can phase-lock input and painting to alternate frames. Once idle, stop the chain so ordinary editor use remains event-driven. Wheel input uses the cached editor canvas rectangle and a short continuation window for the same reason.

For a repeatable functional check, serve the project and run `python devel/benchmark_level_editor_playwright.py`. The optional script requires Python Playwright and Chromium. It remains useful for layout, alignment, event wiring, and gross timing regressions, but revision 358 established that a headless or virtual-display compositor can report a healthy editor while physical Chrome and Opera on the target machine stall near one frame per second. Do not use its FPS ratio as final acceptance for Canvas/compositor work.


## Canvas game-renderer baseline

`level-renderer-baseline.html` is retained for posterity and can be opened directly when editor panning measurements become difficult to interpret. The Level Editor no longer links to this diagnostic page; save a browser copy first when the baseline should load current authored data.

This page is intentionally not an editor. It continuously renders the converted level with the production Canvas2D game renderer, including its ordinary spatial culling, environment sprites, runtime entities, actor-front artwork, cave foreground, parallax, and cave mask. It has no editor grid, guides, tile caches, WebGL backend, overlay canvas, or compositor pan preview. Drag anywhere on the canvas to pan, use the wheel to zoom around the pointer, and use **Reset stats** before comparing a representative drag.

Compare its requestAnimationFrame `cadence` and `worst` values with the renderer's synchronous `submit` and layer timings. A smooth baseline with a slow Level Editor points to editor interaction or overlay work. A similarly slow baseline points lower, toward browser rasterization, compositing, driver behavior, or production Canvas rendering at that view and zoom.


## Revision 358 Level Editor 2 structural ladder (retired)

The former `level-editor-2.html` and `src/tools/level-editor-2.js` scaffold was a temporary compositor diagnostic. It has been removed from the active project and must not be treated as a required page, package input, or Canvas owner. Historical revision notes describe its seven-stage experiment, but current editor work uses `level-editor.html` plus the retained posterity-only Canvas baseline.

## Revision 359 lazy Level Editor palettes

The entity and asset palettes deliberately keep their card text and buttons in the DOM, but their Canvas previews are lazy. Off-screen cards have a 1×1 backing store. When a card approaches the browser viewport, IntersectionObserver invokes the ordinary thumbnail renderer, which sizes the backing store from the card's CSS dimensions and device pixel ratio. When the card leaves, its backing store returns to 1×1.

This is not merely a startup optimization. Physical Chromium-family browsers may retain every populated Canvas as an accelerated surface even when it sits far down a nested scrolling sidebar. Level 002 exposes 197 palette choices, which previously meant more than fifteen million retained thumbnail pixels. Keep palette previews virtualized unless a future replacement uses one shared atlas-backed surface or ordinary image elements with demonstrably lower compositor cost.

With `?profile=1`, the Level Editor readout ends with `palette active/total canvases N.NN MP`. During ordinary map editing, the active count should remain small even though the total card count is large. Scrolling a palette into view may raise it temporarily; moving away should reduce it again.

## Revision 360 Export panel and large-level JSON

Do not add a live full-level textarea back to the Level Editor. Level 002 serializes to roughly 2.5 MB and 60,000 indented lines. Physical Chrome and Opera dropped from about 40-45 FPS to about 1.4 FPS when only the old Export panel was expanded, despite renderer submission remaining below 5 ms.

The Export panel now shows only a compact summary. Use `serializeLevelJson()` inside explicit button actions. Copy, download, browser-copy save, playtest, and Canvas-baseline launch generate the string on demand. **Open JSON in new tab** creates a temporary text Blob in another page. Routine `updateJson()` calls synchronize level metadata and refresh the summary but must not call `JSON.stringify()`.

`devel/benchmark_level_editor_playwright.py` expands the Export panel before measuring and reports `exportSurface.textareaCount` and `textareaCharacters`. Both must remain zero.

## Revision 361 Level actions and editor camera alignment

The Level Editor no longer has an Export panel. Use the three controls in **Level**: **Save Level (json)** downloads the current level, **Save in Browser** stores an on-demand browser copy, and **Load in Browser** restores it. Do not reintroduce Copy JSON, Open JSON in new tab, a JSON summary panel, or any persistent serialized text surface.

For static editor and diagnostic cameras, call `renderer.setViewOverride({ x, y, cssZoom })`. Do not multiply editor zoom by `devicePixelRatio` outside the renderer. The renderer resolves CSS zoom after resize from the exact backing/client ratio, and the editor overlay resolves its own backing transform the same way. Ordinary playing-area guides use the unmodified editor camera. Apply `computeCaveWindowParallaxOffset` only to cave-window geometry and `caveForeground` records. Apply `computeWorldParallaxOffset` with `level.layerVisuals.background.parallax` only to level-owned Background placements; entity-local `decorBack` parts remain attached to their actor.

## Revision 362 Level data controls and renderer-cache terminology

The Level panel has two groups. **Existing Level:** is only for choosing and loading a shipped level. **Level data:** owns New, Import, Export, Load from Browser, and Save in Browser. Import uses a hidden file input triggered by the visible button; clear its value before opening the picker so importing the same filename twice still fires `change`.

Do not describe the current Level Editor as tiled. The retired editor tile cache, zoom tiers, WebGL editor backend, and translated pan snapshots are absent from the active path. The production Canvas renderer still keeps normal resource and derived-effect caches, including loaded atlas images, recoloured atlas surfaces, treated cave-foreground frames, cave masks, and spatial-query data. Those caches are expected and should not be removed merely to make the renderer “uncached”; they are not screen-space tiles and panning still redraws the visible viewport directly.

## Revision 363 editor context transforms

The Level Editor's two visible canvases deliberately use different context matrices. The production scene canvas must remain at identity because `canvas-renderer.js` calculates and draws in backing pixels. The guide overlay draws in CSS-pixel editor coordinates, so it uses `overlay.width / viewport.width` and `overlay.height / viewport.height` as its context scale. Do not copy the overlay transform onto the scene context.

This distinction matters on fractional display scaling. At DPR 1.1, pre-scaling the scene context and then supplying renderer backing coordinates enlarges the scene by another ten percent while guides remain correct. The apparent error grows toward the lower-right corner. Use `devel/benchmark_level_editor_playwright.py --device-scale-factor 1.1` when changing canvas sizing or renderer embedding; `stageContextTransform` must remain identity after a rendered frame.


## Revision 364 Android presentation stability

The production game does not request low-latency desynchronized canvas presentation. Keep `desynchronized: false` for both the visible Canvas2D context and the WebGL2 backend. This is deliberate: Android Chromium-family browsers may otherwise expose incomplete Canvas pixels or a discarded WebGL buffer as white or black flashes.

The stage fills `#game-shell` with percentage dimensions. The renderer ignores transient client measurements below two pixels and keeps the previous valid backing size. When investigating future mobile resize problems, do not “fix” this by resetting the canvas on every reported viewport transition; assigning `canvas.width` or `canvas.height` clears the backing store immediately.


## Parent pivot constraints in Puppet Forge

In **Base rig / setup values**, enable **Pin this part's pivot to a parent part** to keep the selected part's existing pivot fixed to a point on another rig part. Choose the parent and edit the normalized parent-point X/Y values, or drag inside the selected constrained part in the preview. The cyan marker shows the resulting joint. Dragging a yellow corner still edits the child's rotation.

A constrained part's X/Y animation tracks are read-only because Puppet Forge calculates them from the parent. Refreshing or downloading animation JSON bakes the calculated positions into ordinary X/Y keys for the game. Rotation and scale remain independent. Disable the constraint to return to ordinary X/Y editing; the latest baked positions remain available as normal keys.

Each child may have only one parent constraint. Puppet Forge prevents self-links and circular chains such as torso to arm to torso.


## Revision 454 OGG music workflow

`assets/music.json` is the active music catalog. Add numbered files such as `music_006.ogg` beside it in `assets/`, then add a matching metadata record with an ID, file name, and title. Levels store only `music.version: 3` and `music.trackId`; the Level Editor populates its selector from this catalog. Runtime playback belongs to `src/browser/music-director.js`, which wraps a looping HTML audio element and obeys pause/focus muting and the persistent music-volume slider. Do not restore the embedded jukebox engines, score-source catalog, or synthesized tune data.

## Revision 373 retired music integration

This historical note described the retired synthesized/jukebox catalog. The active workflow is the revision 454 OGG catalog above.

The selector engines and hidden iframe host have been removed.

When changing playback state, preserve the distinction between track changes and pause/focus muting. Track changes select a new OGG source and reset playback; pause/focus muting pauses the audio element without modifying persisted settings. Never copy browser audio state into simulation data.


## Revision 374 music gesture handling

`game-bootstrap.js` intentionally listens for broad `keydown` and `pointerdown` gestures because browser autoplay policy can reject an earlier non-gesture start. Those listeners may call `musicDirector.unlock()` many times during normal play. Never make `unlock()` directly synonymous with “restart playback.”

The director must first compare the active engine/tune/octave configuration with its playback state. If that configuration is already playing, return success without calling the host. If a start for the same configuration is still pending, return the same promise so key repeat and nearly simultaneous pointer/keyboard input cannot schedule duplicate starts. Clear active playback state when pausing, muting, setting music volume to zero, changing tune, or disposing. This keeps intentional resume behavior distinct from ordinary movement and jump gestures.


### Background and Foreground layers (revisions 375-376)

The Level Editor presents four authoring names: **Background**, **Terrain**, **Decoration**, and **Foreground**. The serialized IDs are `decorBack`, `terrain`, `decorFront`, and `caveForeground`. Do not describe `caveForeground` as the perimeter layer in user-facing controls. The perimeter is one generator that happens to create Foreground records; manually placed Foreground artwork uses the same layer without generator provenance.

The Asset palette has one **Layer for new assets** dropdown with **Foreground**, **Terrain**, and **Background**, plus one shared **Place asset** tool. Selecting an asset card also enters that same placement mode. Do not restore separate Background and Foreground placement tools: preview and placement must read the dropdown and route through the matching authored-coordinate transform.

Choose **Background** for distant cosmetic scenery. Background records never receive atlas collision and cannot be moving platforms. They render in a dedicated pass before all ordinary world artwork regardless of stack order. `level.layerVisuals.background.parallax` controls the entire layer. Its default is the exact reciprocal of the Foreground default: `1 / 1.08`, approximately `0.925926`. Set it to `1.0` when a level should have no Background drift. The allowed editor range is `0.25` through `1.0`.

Choose **Foreground** for inert artwork in front of actors. `level.layerVisuals.foreground.parallax` defaults to `1.08`; `1.0` disables its relative movement. Foreground treatment, the cave opening, feather contours, and generated perimeter art share that offset. Runtime reads the grouped layer value directly every frame and passes the same normalized factor to Foreground culling, drawing, and the Canvas/WebGL cave mask. Do not copy it into `caveWindow`. Choose **Terrain** for ordinary placed artwork whose atlas collision may remain active.

Both layers use world-bounds-centred offsets from `src/presentation/world-parallax.js`. Editor pointer operations add the active offset before storing authored coordinates, while drawing subtracts it. Never save camera-relative coordinates into the level. When adding new editor operations for these layers, pass records through `displayedLayerPlacement` or the equivalent shared transform so selection and rendering remain aligned.


## MP4 motion reference in Puppet Forge (revision 377)

Open **Motion reference video** in Rig and animation mode and choose a local MP4. H.264 video in an MP4 container has the broadest browser support. The video is muted and loaded through a temporary object URL; no reference media is copied into the project.

The animation playhead drives the visible video moment. Scrubbing, stepping, pausing, preview speed, and animation looping keep the MP4 aligned. **Video time offset** adds to animation time, so a positive value looks later in the clip. Use X/Y to align the person, Width/Height for independent scale, Opacity to ghost the plate, and `1.0` animation preview speed when checking source timing most literally. **Reset alignment** preserves the source aspect ratio, centres the video on local X, and bottom-aligns it to local `y = 0`. The plate follows preview zoom, pan, and facing.

The MP4 and its controls are intentionally temporary. They do not mark any project document dirty and are never included in character, rig, atlas, animation, enemy-catalog, or level JSON. Reloading or closing the tab discards them. Puppet Forge does not support image bundles as motion references.

## Mountain King orchestration correction (revision 378)

The embedded orchestrated engine marks Mountain King's quiet bassoon octave double with `followsPrimaryMelody: true`. The long-form arranger must preserve every note in marked voices just as it preserves voice zero. Do not replace this with an alternating `accentedCopy(..., 2)` or allow sparse accompaniment plans to thin it; either change recreates the audible impression that melody notes are missing or being reassigned between instruments.

## Foreground and Background visual groups (revision 379)

Open **Layers** to configure the two inert cosmetic layers. Foreground and Background each expose **Parallax**, **Brightness**, and **Scale**. Parallax `1.0` follows the world. Brightness and scale `1.0` preserve source colour and authored size, but the Foreground defaults intentionally show its complete cave treatment directly: brightness `0.36` and scale `2.0`. Foreground parallax starts at `1.08`; Background starts at `1 / 1.08`, with neutral brightness and scale. These values affect every placement in the layer, including cave-perimeter assets because those are Foreground records.

The **Perimeter** panel is intentionally limited to cave geometry, feather and gradient behavior, spline point editing, population seed, inward coverage, and generated-art management. Do not restore duplicate Foreground scale, brightness, or parallax controls there. `level.layerVisuals` version 2 is the sole level representation of both cosmetic layers; top-level parallax mirrors and cave-decoration brightness/scale fields are unsupported.

Background and Foreground remain inert presentation. They never have atlas collision or moving-platform behavior. Layer scale must be applied around the authored placement centre, and editor culling and pointer geometry must use the same scaled display bounds as rendering.

## Mountain King upper voice treatment (revision 379)

The full bassoon octave double introduced by the revision 378 continuity correction remains marked `followsPrimaryMelody`. Do not thin or alternate it. Its voice-local timbre override lowers the cutoff, slows the envelope, reduces breath noise, extends release, and lowers gain while retaining the bassoon instrument and all note events. Tune-specific timbre overrides belong inside the embedded browser engine and must not enter portable level or shared music schemas.


## Visible Foreground treatment (revision 381)

Foreground artwork is stored at base size. Runtime and editor rendering apply only `level.layerVisuals.foreground.scale`, and foreground sprite treatment receives the layer brightness plus the perimeter decoration saturation. The shipped levels expose their complete treatment directly: level 001 uses brightness `0.4` and scale `2.0`; level 002 uses brightness `0.46` and scale `2.0`. Per-placement brightness, scale, outward-vector, and fade-interval fields are unsupported. The cave-window mask owns the only spatial fade, so moving an asset away from the perimeter immediately reveals its clean colour-treated frame.

The Layers panel contains no persistent defaults paragraph; explanatory copy belongs in native mouse-over tooltips on the controls.

## Level Editor sidebar order (revision 382)

The right sidebar is arranged as **Level**, **Metadata**, **Layers**, **Perimeter**, **Colormap**, **Generator**, **Autospawner**, **Navigation graphs**, **Entity palette**, **Asset palette**, **Placed objects**, **Selected object**, and **View**. This puts file-level actions and compact level identity first, world-construction tools next, object catalogs and inspection after them, and viewport preferences last.

Do not move the six cosmetic-layer fields back into Metadata. **Layers** is the sole user-facing home for Foreground and Background Parallax, Brightness, and Scale. **Perimeter** is reserved for the cave-window spline, mask, feather, gradient, and automatic perimeter decoration workflow.

## Stable layer controls and scaled outlines (revision 383)

**Populate perimeter** and **Clear generated** are record-management commands. They must not modify any value in **Layers**. When reading the layer controls, commit a canonical `level.layerVisuals` version 2 object. There is no cave-decoration migration path; old levels must be patched to current data before they enter the project.

Foreground and Background artwork is stored at base size, then transformed for display. Selection outlines and asset-guide boxes must use the transformed record returned by `displayedLayerPlacement` for centre, width, height, rotation, and parallax position. Using the transformed centre with the unscaled authored dimensions produces the small displaced boxes fixed in this revision.



## Current-level-only schema policy (revision 384)

The repository contains every supported level. Runtime, Level Editor, generator normalization, and tests therefore target only the current bundled schema. When a level format changes, update all shipped levels and fixtures in the same revision. Do not add aliases, mirror fields, import migrations, retired entity translations, or silent old-record stripping. A stale external level may fail validation or lose unsupported records; preserving it is not a project requirement.

Normal current-schema validation, numeric clamping, and defaults used while creating a new level remain appropriate. The prohibition is against alternate historical field names and conversion branches. Tests should verify the canonical schema and guard that retired paths stay absent, not exercise conversions from unsupported old levels.


## Automatic generator upper branches and reward mix (revision 416)

Generator schema version 34 retains the optional secondary supports introduced by version 32 with `secondaryTier` and `powerUpPerch`. Horizontal routes use a two-step ceiling lane with at least 36 percent span coverage. Standard routes create more first-tier branches and extend selected branches into a second tier. Encounter generation may seat monsters on combat perches at either tier.

The reward catalog is version 3. Power-up weights are `randomWrenchPickup: 6`, `overdrivePickup: 3`, and `shieldPickup: 1`. A generated Overdrive with context `detourUpperPerch` must reference an optional second-tier `powerUpPerch`. Fixed seating remains important because encounter reservations are built from reward envelopes before the encounter stage; reward rerolls may change types but must not move those seats.

Level 001 has three baked hunter profiles: goblin, tall human, and Skeleton Caster. Keep the caster profile separate because its 72 by 164 body and movement values do not match either other family. The placed Skeleton Guard should mirror the catalog melee damage of 50.

## Empty Level Editor documents (revision 417)

The **New level** command creates a bounded but otherwise empty authored level. The production runtime converter accepts that document so the editor can render the blank world immediately. Do not add hidden placeholder assets or entities to make the preview work. A payload with neither authored content nor finite positive world bounds is still invalid. The editor continues to discover atlas and numbered-level files through ordinary URL probes, so expected 404 responses at the end of those scans are not conversion failures.

## Generated population density (revision 418)

At a theme's default **Enemy density**, generated levels target one monster per 500 horizontal route units. This is based on left-to-right span rather than winding path length. Long platforms can hold several independently spaced encounters, matching ordinary authored levels; the generator still protects incoming landings, endpoint calm zones, rewards, moving-platform shafts, and unrelated platform artwork. The Enemy density control scales the target and zero disables all generated encounters.

Generated power-ups now target one pickup per 3,000 mandatory-route pixels, one third of the revision 417 count. Their type mix remains 60 percent random wrench, 30 percent Overdrive, and 10 percent Shield, with Overdrive still preferentially assigned to dedicated upper detours. Generator schema version 33 stores the new behavior.


## Generated monster density (revision 419)

At a theme's default **Enemy density**, generated levels now target one monster per 300 horizontal route units. The target remains based on mandatory-route left-to-right span, and the existing Enemy density control still scales it from zero up to the capped double-density rate. Long-support multi-seat placement and all existing calm-zone, reward, collision, cavern-fit, landing, and moving-shaft protections remain active. Generator schema version 34 identifies this denser population contract.

## Revision 435 420-base level-generator backport
- Rebased the project on the original revision 420 codebase while backporting the revision 432 automatic level-generator implementation.
- Retained the Rising Cave rename, Serpentine Cave route, same-flow diagonal Serpentine rise support, and generated horizontal floor-layer logic from the generator line.
- Deliberately excluded cave-window, full-black perimeter, editor rendering, and arc-rounded perimeter experiments after revision 420.

## Revision 420 endpoint population contract

Generator schema version 35 records exact `endpoints.entrance.x/y` and `endpoints.exit.x/y` coordinates. Encounter and reward exclusion must use those portal coordinates, not the centre of the supporting platform.

Endpoint protection is intentionally local. Earth encounters preserve 520 world units around each portal and Ice encounters preserve 540. Do not expand this distance to the largest enemy awareness range; doing so wastes one or more complete screens. Encounter candidate ordering uses a distributed route order and explicit endpoint-local fallback seats so bat groups or a blocked preferred seat cannot exhaust the monster target before the final screen is considered.

Physical rewards may use the complete route progress range. When treasure generation is enabled, the far side of each door platform receives one chest if it clears the theme's endpoint exclusion distance. Earth uses 300 units and Ice uses 320. Upper reward perches may consume only a bounded share of the chest target; all remaining chest targets are spread over the full normalized route range. Reward-only rerolls must preserve the endpoint and encounter streams exactly.

## Runtime transform triplets and interpolation (revisions 504-505)

Simulation-driven actors, projectiles, the camera, the hat, and moving world visuals no longer expose their root position through direct `.x` and `.y` properties. Use `subject.currentTransform` in simulation/gameplay code and `subject.shownTransform` in presentation code. Both records contain `x`, `y`, `angle`, `scaleX`, `scaleY`, and `alpha`; `previousTransform` stores the state immediately before the latest fixed step.

Use the helpers in `src/shared/presentation-transform-data.js` to create, copy, snapshot, interpolate, show, or snap a transform. Never assign one transform object to another variable as a state copy and never replace the persistent records during a frame. `copyTransform(target, source)` and `interpolateTransform(target, previous, current, blend)` mutate six numeric fields in place and avoid garbage collection pressure.

Character-enemy animation time follows the same boundary through `enemy.animationClock.previous/current/shown`. Simulation updates `current`, while the renderer samples `shown`. Articulated limb transforms remain generated presentation data; do not create previous/current/shown copies for every limb unless a limb becomes an independent physics object. When an enemy changes animation slot, reset and snap its animation clock together so the new clip is not sampled at an interpolated time inherited from the old clip.

Revision 505 passes `accumulator / FIXED_DT`, clamped to 0-1, into `preparePresentationFrame(state, blend)`. Position, scale, opacity, and simulation-driven animation time use linear interpolation. Angles use the shortest wrapped path. A scale sign change snaps to the current value rather than collapsing through zero. Paused and single-step presentation uses a full blend so the newest stepped state is visible immediately.

When diagnosing gameplay, inspect current. When diagnosing a drawn position, inspect shown. Level loads, resets, respawns, development pose changes, animation-slot resets, teleports, and camera cuts must call the relevant snap helper so previous, current, and shown agree. Interpolation is presentation-only and must never write shown values back into collision, AI, targeting, or serialization.

## Tiled-bake micro-stutter diagnostics (revision 506)

Start and stop the lower-right profiler button as before. While the profiler is active, tiled baking adds flat `staticTile...` fields to each sample's `renderer` record. Normal play does not collect these subphase timings.

The principal timing fields are `staticTileWorkerCollectMs`, `staticTileCompletedAdoptionMs`, `staticTileAtlasAllocationMs`, `staticTileTextureUploadMs`, `staticTilePlanningMs`, `staticTileEvictionMs`, `staticTileJobSchedulingMs`, `staticTileDiagnosticsMs`, `staticTileCacheEnsureMs`, and `staticTileDrawMs`. Worker collection occurs asynchronously and is charged to the next tiled frame. Texture-upload time measures JavaScript submission around `updateTextureRegion`; it does not prove when the GPU finishes the work.

Upload-bearing samples include `staticTileUploadBurstId`, logical tile coordinates, atlas page/slot coordinates, upload dimensions and bytes, camera coordinates, camera tile coordinates, and tile-to-camera deltas. Consecutive uploads no more than four tiled frames apart share one diagnostic burst ID. The report summary's `staticTile` section totals uploads, bytes, evictions, jobs, and burst count and retains the maximum subphase times.

Use matched routes and settings for comparison. A useful pair is WebGL2 with Baking Off as the control and WebGL2 with Baking Tiles as the experiment. Do not infer GPU completion latency solely from a small `staticTileTextureUploadMs`; the profiler intentionally avoids `gl.finish`, readback, fences, and timer queries because those probes can manufacture or reshape the hitch being investigated.

## Frame-delivery captures (revision 508)

Start **Profiler: off** from the lower-right development tool strip. The profiler records every frame and includes `callbackEntryGapMs`, `callbackLatenessMs`, `renderMode`, and `presentation` on each sample. `rafGapMs` remains the interval between browser-supplied rAF timestamps. `callbackEntryGapMs` is the measured interval between actual JavaScript callback entries and is the better field for detecting a callback that arrived late despite regular rAF timestamps.

After a visible hitch, click **Profiler: on** again as soon as practical. That stops the recording and copies the newest bounded capture to the clipboard. The ring retains the latest 900 frames, about fifteen seconds at 60 Hz, so a hitch remains available when the profiler is stopped within that window. Run one renderer/baking mode per capture.

`presentation.player` and `presentation.camera` contain current and shown coordinates and their deltas. `presentation.playerScreen` subtracts shown camera motion from shown player motion. A whole-world hitch should be visible in camera/world delivery even when the player remains stable on screen; an actor-only discontinuity should appear in player or player-screen deltas. `presentation.snap.events` identifies snap helpers called since the previous sample and includes the latest reason, subject, and kind.

`renderMode.backend` and `renderMode.bakingMode` are repeated per sample rather than inferred from the final report metadata. This matters when a recording accidentally spans a settings change. The profiler still cannot prove whether the desktop compositor displayed or repeated a submitted frame, but callback-entry and shown-motion data can separate application pacing from that remaining blind spot. Revision 508 removes the redundant **Mark stutter** control and its separate clipboard state; the profiler toggle is the sole in-game capture workflow.
