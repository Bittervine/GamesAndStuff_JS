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

Horizontal is the run-and-gun route. It advances steadily toward the exit, favors solid overlapping ground pieces with level walking surfaces, uses only occasional height changes, and reserves elevated combat perches with open space for homing rockets. Thin one-way platforms remain separate and serve raised positions rather than pretending to form a continuous floor.

Standard remains the folded route with broad upper traversal, a nearly continuous lower recovery path, and occasional upper reward or combat positions. Domed caverns keep the lower perimeter close to the route while expanding ceiling volume. Rewarded levels target roughly one real power-up per 1,000 route pixels at default density, split between random wrenches, Shield, and Overdrive plus contextual rewards.

Encounter rerolls preserve route, platforms, endpoints, and rewards. Reward rerolls preserve route and terrain while replacing generated rewards and retaining anchored encounters. Validation reports the current generated records. Generator locks prevent direct editing but regeneration still replaces generator-owned records. Converting a generated object to manual ownership detaches it from generator clear and regeneration operations.

## Cave window and foreground

The cyan loop is the cave opening. Feather controls the transparent-to-black width. The dashed magenta outset is the exact full-black boundary. Gradient waviness perturbs opacity contours without moving collision, navigation, decoration normals, or the lethal boundary.

Cave foreground is inert presentation. It renders after actors with cave parallax, uses depth treatment, fades outward into black, and never has atlas collision. Automatic population derives dense overlap from rendered formation size and covers through the full-black boundary. Manual population intentionally has no gameplay-clearance protection, allowing foreground formations to overlap platforms, doors, actors, and other playable space.

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

The editor remains Canvas 2D until representative profiling justifies the WebGL2 backend. Pointer events do not render immediately: redraw requests are coalesced through `requestAnimationFrame`.

The canvas is divided conceptually into a static viewport scene and transient overlays. Cursor-following placement ghosts, selection outlines, and Shift-drag marquees can reuse the last static scene. This prevents a mouse move from redrawing every visible cave formation, recomputing cave-geometry warnings, rebuilding overlap bookkeeping, and serializing the whole level.

Cave-foreground artwork also has its own transparent viewport cache. It is safe to reuse while ordinary terrain or entities move because the foreground is a later presentation layer. Editing foreground records, loading atlas artwork, recolouring atlases, or committing structural changes invalidates it. Entity previews are culled against conservative world bounds before expensive character or atlas composition.

These caches contain only rendered editor pixels. Level records, placement ordering, collision, selection, JSON export, and runtime rendering remain authoritative elsewhere. WebGL2 should replace the drawing backend without changing those data contracts.


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

## Revision 317 fallback and context-loss guidance

Do not probe WebGL2 by requesting it directly from the visible game canvas and then attempting a 2D fallback on that same element. Canvas context families are sticky. Use `probeWebGL2RendererSupport`, which creates and disposes a complete scratch backend, before the visible canvas is committed to WebGL2. If the probe fails, the visible canvas must remain untouched and use the ordinary Canvas 2D renderer.

Once the visible canvas owns WebGL2, a context-loss interval is not a Canvas fallback opportunity because the renderer's 2D canvas is only the hidden staging surface. Keep presentation idle until `webglcontextrestored` rebuilds the GPU resources.

## Revision 318 Level Editor WebGL2 guidance

The Level Editor uses WebGL2 as a compositor, not as a second authoring model. Continue implementing placement, entity, cave, navigation, and guide drawing through the existing Canvas functions. Static content belongs in `renderEditorStaticScene`; cursor previews and selection-only visuals belong in `renderEditorTransientOverlay`. The WebGL path retains the static Canvas as a cached texture and uploads only the transient layer during pointer-only frames.

When a static scene surface is redrawn, invalidate its GPU texture with `editorWebGLBackend.invalidateTexture(surface.canvas)`. Never request a 2D context from the visible stage before the disposable WebGL probe has decided the backend. Preserve the direct Canvas path because browsers and embedded runtimes may lack usable WebGL2.

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

Open `game.html?webgl=1` and first confirm that the debug panel says `render:webgl2-resident`; a browser that silently falls back to Canvas is not a valid GPU test. Fire a player rocket along a curved route and verify that the smoky, sparkling path and nozzle flame remain visible, with no large fuzzy orange circle snapping between the newest trail samples near the rocket. Detonate both a player rocket and an enemy fireball, then destroy a reactive crate or barrier. The explosion cores, rings or sparks, impact puffs, goblin-fireball trail, and destruction smoke should all be visible.

On a warmed ordinary frame, the GPU diagnostics should normally read `uploads:0 updates:0 layers:0`. Camera movement should no longer increment `updates`, because the cave opening and feather are resident geometry and the exterior is generated with the stencil buffer. A nonzero `layers` count remains legitimate for mailbox/story presentation, debug or puppet guides, collision-only fallback scenery, or an unsupported residual visual.

WebGL2 is requested with a stencil buffer. If the implementation reports no usable stencil support, the renderer deliberately falls back to the older cached Canvas cave-mask texture while retaining the rest of the GPU path. Canvas 2D behavior is unchanged and remains the default without the URL parameter.
