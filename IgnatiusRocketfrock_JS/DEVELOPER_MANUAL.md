# Ignatius Rocketfrock Developer Manual

This file holds implementation-facing guidance that would otherwise crowd the Level Editor. The editor UI should favor compact controls, live feedback, and short status messages. Longer behavioral explanations belong here.

## Level Editor loading and navigation

At startup the editor scans `resources/levels/level_001.json`, `resources/levels/level_002.json`, and subsequent numbered files through `level_020`, stopping at the first missing level. Environment atlases are discovered from numbered `resources/atlases/at_atlas_###` pairs, while character and independent atlases are loaded through their own manifests.

The right mouse button pans the canvas regardless of the active tool. **Fit** frames authored placements and entities. Shift-drag replaces the current selection with fully enclosed objects. Ctrl-click and Ctrl+Shift-drag toggle objects. The primary selected object is editable; secondary selections move and delete with it.

## Live object inspector

The Selected object panel has no Apply button. Position, dimensions, and rotation update while edited. Selects, checkboxes, IDs, and nonvisual values commit on their normal change event. Level placements and entities no longer carry free-form `notes` metadata. Timed power-up pickups expose an optional **Custom duration** checkbox; unchecked pickups omit `durationSeconds` and inherit the built-in effect duration, while checking it authors a per-instance override. Enemy scale remains a live uniform multiplier for the Character Editor-authored hitbox, artwork scale, artwork offsets, and projectile radius. Character-enemy W/H fields display the resulting hitbox and remain read-only.

Generated locked records reject inspector changes until unlocked. Changing a wizard door or character enemy may perform the same floor snap that the previous Apply action performed when the field is committed.

## Palette thumbnails

The Entity and Asset palettes use matching two-column scrolling grids. Cards retain fixed useful preview height regardless of result count. Direct atlas assets are cropped to visible alpha before fitting. Composed character previews are first rendered to a temporary surface, cropped from the final combined alpha, then centered and scaled to fill the card. This avoids transparent part padding and rig-space extents making enemies appear small or off-center.

## Automatic enemy spawning

Level-wide automatic spawning rolls once per second. A successful roll creates an already-alert enemy beyond the forward screen edge. The pool uses numeric ranges and `!` exclusions shared with the automatic generator.

A placeable enemy spawner is different: it is invisible during play and advances its timer only while its authored rectangle intersects the camera. A successful roll teleports an already-alert enemy to the authored point. Ground enemies require safe support; blocked, occupied, or unsupported attempts are skipped.

## Hunter navigation graphs

The editor builds one navigation profile for each distinct hunter body size and mobility configuration. Profiles include directed jumps, drops, step transitions, and chasm crossings. Static traversal-policy checks are applied while baking, so the graph shown by the editor should not advertise an edge that the game would reject under unchanged geometry. The runtime applies the same policy again as a defensive backstop for stale or externally-authored graph data. Dynamic blocker IDs can still disable or penalize otherwise-valid edges at runtime. Every authored hunter profile used by a packaged level must have an exact bake.

After changing hunter mobility data, support extraction, or static traversal policy, re-bake the packaged levels with `node reference/devel/rebake_navigation_graphs.mjs --write`. Running the command without `--write` is a dry run; `--check` exits nonzero when any level is stale, and `--level level_004` scopes the operation to one level. The tool deterministically rebuilds only `navigationGraphs`, so a full campaign re-bake does not require manually opening and saving every map in the Level Editor. Machine-generated `level_temp.json` is excluded from bulk bake/check and is only processed when explicitly named with `--level level_temp`.

## Automatic Level Generator

The Generator panel exposes four independent choices: **Theme**, **Colour modifier**, **Recipe**, and **Enemy pool**. A theme is appearance data only. It chooses tagged terrain, moving-platform, foreground, and background asset pools, plus presentation policy such as whether the cave perimeter should be populated. A colour modifier is a separate atlas allowlisted colour map, so Frost can reskin the Cave theme without every cave asset being tagged twice. The current authored themes are Cave, Forest, and Castle.

A **Generator recipe** is the curated level-builder choice. It locks route implementation, cavern implementation, traversal settings, validation profile, and length into one tested combination. The editor therefore does not expose raw Route, Cavern, or Length permutation controls. Domed Compact, Domed Standard, and Domed Long use the established horizontal run-and-gun route with the ordinary Domed cavern. The Cave-only **Domed Grounded** recipe is based on Domed Long but places deep Atlas 035-039 ground runs before tracing the cavern, advances adjacent floor texture bands by at most one atlas step, and anchors most of the lower perimeter to those floors so only sparse stalagmite accents remain. Theme-restricted recipes are hidden when an incompatible biome is selected. New algorithms should be introduced as new recipes and seed-swept against every compatible theme before appearing in the editor.

Asset membership is authored through symbolic generation tags. `resources/editor/asset-generation-tags.json` is the shared valid-tag catalog; atlas objects store readable `generationTags` arrays, and the Asset Editor presents grouped checkboxes from that catalog. Theme pool queries use `all`, `any`, and `none` clauses. The ordinary manual **Populate perimeter** command uses the currently selected Generator theme and therefore admits only objects matching both that theme's biome and its Foreground-layer query. Generator roles and measured collision constraints remain separate from semantic tags.

Horizontal is the current run-and-gun route inside these recipes. It advances steadily toward the exit, favors solid overlapping ground pieces with level walking surfaces, and uses only occasional height changes. A distributed two-step upper lane covers at least 36 percent of the playable span. Theme-specific blockable ground silhouettes are allowed to differ in native width and transparent edge padding, so the final overlap segment is corrected conservatively while preserving at least 72 world units at every seam.

Rewarded levels target roughly one real power-up per 3,000 route pixels at default density. The generated pool is 60 percent authored wrench, 30 percent Overdrive, and 10 percent Shield. Dedicated second-tier power-up perches receive Overdrive before ordinary reward slots are filled, so the speed reward is visibly off the main path. Reward-only rerolls retain fixed safe seats and anchored encounters while varying the pickup mix.

Encounter rerolls preserve route, platforms, endpoints, and rewards. Reward rerolls preserve route and terrain while replacing generated rewards and retaining anchored encounters. Validation reports the current generated records. Generator locks prevent direct editing but regeneration still replaces generator-owned records. Converting a generated object to manual ownership detaches it from generator clear and regeneration operations.

## Cave window and foreground

The cyan loop is the cave opening. Feather controls the transparent-to-black width. The dashed magenta outset is the exact full-black boundary. Gradient waviness perturbs opacity contours without moving collision, navigation, decoration normals, or the lethal boundary.

Foreground is inert presentation. It renders after actors with cave parallax, uses depth treatment, fades outward into black, and never has atlas collision. Automatic population derives dense overlap from rendered formation size and covers through the full-black boundary. Manual population intentionally has no gameplay-clearance protection, allowing foreground formations to overlap platforms, doors, actors, and other playable space. The Level Editor applies the same world-bounds-anchored camera offset to the cave opening, its gradient guides, and every `caveForeground` placement. Pan and zoom the editor to the camera region being authored before judging whether a door, platform, or actor remains inside the visible opening.

## Level colour map

Colour mapping never modifies source PNG files. Recolored atlas copies are cached only when settings change. Environment atlas artwork is affected; characters, collision geometry, alpha, and the cave background are not.

## Moving platforms

Moving platforms have two mutually exclusive motion types. **Translate** is the established endpoint-to-endpoint platform motion. Its **Easing** can be Linear, Ease in, Ease out, or Ease in/out; `speed` continues to define average trip speed, so changing easing changes acceleration character without changing the time required to reach the endpoint. Shuttle is the safe translation default and pauses at both endpoints. Vanishing patterns always restore the platform after their hidden reset time. For Translate motion, the circular END handle edits the route directly on the canvas.

**Swing** rotates the platform as a pendulum around an authored local-space pivot. **Amplitude** is the maximum angular displacement on either side of the placement's ordinary rotation, **Initial angle** chooses the starting displacement, and **Swing period** is the duration of one complete cycle. Swing periods are clamped to a minimum of **2.0 s**, and the local pivot vector is clamped to a maximum length of **800 px**. Pivot X/Y may therefore lie well outside the artwork, which is useful for a hanging blade or chandelier, without permitting pathological pendulum speeds/radii. A positive or negative initial angle starts by moving toward the centre/bottom angle; an initial angle of exactly zero starts counter-clockwise. Automatic, rider, and signal activation plus initial/trigger delays remain available. Swing motion is intrinsically smooth and pendulum-like rather than using the translation easing selector. Atlas-authored collision geometry moves with the platform, so ordinary walkable/blockable geometry remains physical and orange damaging or red killable geometry can make the swinging object hazardous without a separate danger flag. Closed orange and red loops are filled damaging/killable polygons and are preferred for substantial trap bodies; green walkable support remains line-only. Between simulation poses the runtime uses short collision steps and treats each actor response approximately as translational displacement, then applies the authored angular pose to the platform. This deliberately favors stable game collision over exact continuous rigid-body physics.

Enable **Persistent through respawn** when a platform must retain its current position/angle, phase, collision state, and remaining phase timer when Ignatius dies or is otherwise reset; this does not alter its normal motion cycle. Rider activation can trigger again whenever a translating platform returns to `waitForTrigger`; signal activation likewise responds to each newer channel revision. Levers can therefore retrigger eligible translation platforms after being left and approached again, while keyholes and `proximitySignalTrigger` are one-shot emitters.

## Signals, gates, and boss defeat

Levers and keyholes activate automatically when the physical gap between Ignatius and the entity is no more than one wizard width; they do not use the Down/S/Enter interaction input. A lever toggles its named channel only on the outside-to-inside proximity edge, so Ignatius must step away and return before it can toggle again. A keyhole consumes its configured key on that edge, emits its named signal once, then fades away over 0.75 seconds and is removed. `proximitySignalTrigger` remains a separate invisible one-shot emitter: the first time Ignatius's center enters its authored `triggerDistance`, it activates the configured channel automatically, marks itself `triggered`, and never emits again during that level instance. In the Level Editor it appears as a small center-anchored marker with a dashed radius guide when selected. Signal gates begin closed and remain blocking while their closed artwork fades in place over 0.75 seconds. At the end of that fade the runtime gate entity, visual, receiver solid, and all atlas-authored collision segments/polygons owned by its visual are removed together, collision queries are invalidated, and actors standing on removed geometry are detached from that support. Later channel changes do not recreate the gate. A named signal is a broadcast channel, so one emission may activate every gate, moving platform, and other listener assigned to that channel. Boss enemies may emit a named channel when defeated. Independently, an exit door refuses to open while any living boss remains in the level.

## Magic Ring concealment

The `magicRingPickup` grants the timed `magicRing` effect for 30 seconds and refreshes that duration when collected again. Ordinary enemy perception cannot acquire Ignatius while the effect is active. Presentation darkens his RGB output to 50% brightness without changing opacity. A character enemy hit by Ignatius during concealment enters or refreshes a 10-second panic state without being given Ignatius's hidden position: hunters alternate short movement bursts with attacks in arbitrary directions, while other non-passive character strategies use the movement and attack forms their rigs already support. Passive actors remain passive. Ten seconds without another concealed hit ends panic and returns the enemy to its normal unaware activity. Homing projectiles are intentionally exempt from concealment and retain Ignatius as their target.

## Mailboxes, treasure, and doors

Each mailbox owns its letter, thought, trigger distance, and timing. Long text scrolls automatically and Jump advances or closes it. Treasure chests open once when Ignatius approaches, award their score, briefly display loot, then remain open and empty.

Scripted cutscenes accept `GOTO`, `ANIM`, `SAY`, `THINK`, and `DELAY`. `THINK <character> "text"` has the same timing, skip input, and actor anchoring as `SAY`, but uses the shared large thought bubble instead of the speech bubble.

Entry doors replace the legacy wizard-start marker. Exit doors are mirrored by default. An empty exit destination resolves to the next numbered level; if loading fails, the current level is restored. Set an exit entity's destination to the reserved value `credits` to end gameplay and start the shared credits roll instead of loading another level. A cutscene may start immediately from a trigger at the Wizard spawn, and exits remain suppressed while scripted cutscene control is active, so a final cutscene can walk the Wizard onto the exit and release control there. Edit `resources/ui/credits.md` for the roll: `# Heading` is the only heading syntax, every other non-empty line is a centered row, and blank lines add spacing. Completion or a fresh user interruption returns to the title screen; `credits` is never stored as a resume level.


## Character combat sounds (revisions 204-205)

Puppet Forge exposes Attack WAV, Hurt WAV, and Death WAV selectors in a separate collapsible **Character sounds** panel after **Projectile behavior** and before **Animation**. The selected values are written to the character definition as `sounds.attack`, `sounds.hurt`, and `sounds.death`. Choose **None** to remove a slot. URL projects list WAVs registered in the neighbouring `sound-effects.json`; local project loading also discovers every selected `.wav` file and writes a path relative to the character JSON.

The runtime uses the character ID attached to enemy attack, projectile, damage, and defeat events to look up these fields. A missing slot is intentionally silent. The global sound-effects catalog may still define the referenced file so it can reuse tuned volume and voice-count settings, while an unlisted WAV receives a normal dynamic pool.

The wizard character now names its ground animation `walk`, not `run`, and its map includes `hurt` and `death` slots. New character projects should use the same shared animation vocabulary.


## Puppet Forge enemy defaults (revision 353)

For a catalog-backed enemy, Puppet Forge places type-wide tuning in four adjacent panels: **Metadata**, **Movement**, **Attack behavior**, and **Projectile behavior**. Ordinary level placements inherit these catalog values; use Level Editor instance overrides only for intentional one-offs such as bosses. Attack behavior exposes Damage, Cooldown, Vertical reach, Awareness range, Awareness half-angle, Awareness hold, and type-specific engagement geometry. Projectile enemies expose projectile Attack reach plus Preferred attack range / Preferred minimum range. Melee enemies expose `meleeHitRange`, `lungeRangeMin`, `lungeRangeMax`, `lungeSpeed`, and `lungeTargetDist`. Active melee definitions require a positive `meleeHitRange`, measured horizontally from the enemy grounded-base X; the attack handoff owns impact timing and strike Y. Projectile behavior owns kind, launch type, flight parameters, spread, rotation, effects, and AoE presentation.

The old **All defaults JSON** field is intentionally absent. **Enemy Catalog JSON** is the single complete raw JSON surface for `ct_enemies_001.json`; the structured panels edit the selected enemy entry directly. In Character, Level, and Asset tools, a right-side panel with no saved local preference starts collapsed. Opening or closing it records that panel's state for future sessions.

## Puppet Forge project discovery

The Known project dropdown is catalog-driven. At startup Puppet Forge loads `resources/characters/ct_enemies_001.json` and creates one selector entry for every enemy definition that provides `characterId` or `characterUrl`. A normal `characterId` such as `ct_char_enemy_040` resolves to `resources/characters/ct_char_enemy_040.json`; `characterUrl` may override that convention. Adding a new enemy therefore requires only the catalog entry and its referenced character, rig, atlas, image, and animation files. The wizard remains the only built-in non-catalog project.

## Character enemies

The placement point is the enemy foot position. Awareness uses distance and facing cone rather than line-of-sight collision, although terrain may still block movement and attacks. Simple patrol retains local movement. Hunters leave patrol, choose reachable attack positions, cross gaps with one jump, glare while the target is unreachable, and attempt to return home. A hunter unable to climb home adopts its current support as a temporary patrol and periodically retries.

`enemy_901` (**Invisible Cutscene Speaker**) is an ordinary passive Training Dummy-derived enemy intended only as a hidden speech-bubble anchor. Place it like any other catalog enemy and reference that placed enemy ID from cutscene dialogue. Its generic `visualized` catalog default makes the runtime omit its artwork/shadow/health presentation; there is no speaker-specific AI or cutscene behavior. Move or otherwise author it far enough away outside the intended scene when it should not participate in gameplay.

## Reactive objects

Reactive objects live in authoritative simulation state. Rockets strike them before terrain behind them. Their collision is removed when they enter a nonblocking state such as destroyed.

## Palette placement workflow

Selecting an Asset or Entity palette card activates its placement tool. While the pointer is over the canvas, the editor draws a translucent snapped preview using the same size, visual, anchor, and applicable ground-snap rules as the final record. Clicking places one object and returns to Select. The preview is transient UI state and must never be serialized or consume an ordinary object ID.


## Level Editor rendering performance

The normal editor now uses the production Canvas2D game renderer for the complete base scene. Authored level data is converted through `applyEditorLevelToWorld`; `RocketfrockRenderer.setViewOverride()` supplies the editor's top-left camera and zoom. The separate transparent `#stage-overlay` owns only authoring vectors such as grid lines, collision/manifest guides, labels, cave controls, route diagnostics, selection, and placement previews.

Redraw requests remain coalesced through `requestAnimationFrame`. Pan and zoom are camera-only operations: they reuse the current runtime world, spatial buckets, asset-local overlap masks, foreground treatment cache, cave mask cache, and loaded atlases. Do not mark runtime world data dirty merely because the camera moved. Level loads, placement/entity edits, cave edits, colour-map changes, and relevant visibility controls mark it dirty; the next frame performs one conversion and then returns to cheap camera-only rendering.

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

Player-rocket range is distance-driven. `tuning.json` authors 600 world pixels for an ordinary rocket and 1500 world pixels for every wrench rocket; `simulation.js` derives each projectile lifetime from `maxTravelDistance / projectileSpeed`. With the current 500 px/s base speed this yields 1.2 s ordinary, 1.5 s for the double-speed Yellow/Cyan/Green profiles, 3 s for Blue/Magenta, and 6 s for half-speed Red. Do not add per-profile lifetime multipliers. Red Bigbomb uses a 2.0 fuel-cost multiplier, currently 60 fuel.

## Revision 308 uncapped player rocket launch cadence

Player rocket firing is edge-triggered but has no simulation cooldown. `src/core/simulation.js` should attempt a launch for every delivered `weaponPressed` edge and reject it only when fuel is insufficient or another explicit gameplay rule blocks the action. Do not restore `rocketLaunchCooldown`, `weapons.launchCooldownTimer`, `launchCooldownMultiplier`, or cooldown-based `ROCKET_LAUNCH_BLOCKED` events. Older serialized states may still contain a `launchCooldownTimer` property; it is ignored. Holding a launch key does not invent repeated presses, so automatic fire remains a separate future control decision.


## Revision 310 wrench launch-path tuning

Yellow Fivefold keeps five evenly spaced non-homing rockets in the canonical `[-7.5, -3.75, 0, 3.75, 7.5]` fan around the nearest-forward aim line. Cyan Dart launches horizontally and then turns weakly toward the easiest forward target, preferring the smallest angular error over raw distance; its steering is fixed at 0.035° per world pixel actually travelled, independent of camera geometry and the rocket's current angle. Blue Homing Triple keeps its authored `[-12, 0, 12]` fan and standard homing behavior.

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


## Shared game tuning

Both runtimes load `resources/config/tuning.json` as the installed gameplay baseline. The file contains only constants that are consumed with the same meaning by HTML/JS and SDL/C++; compiled values remain emergency fallbacks and regression tests require them to match the shipped JSON. Edit this file for project-wide experiments.

The compact **Development features → Game tuning** menu exposes run speed, jump height, gravity, rocket damage, and **Double jump physics**. User changes are saved automatically as sparse `tuningOverrides`: browser localStorage for HTML/JS and the SDL profile `settings.json` for the native game. Reset clears those overrides and immediately reapplies the installed file. Recordings store the complete resolved tuning so playback does not depend on later file or profile changes.

`doubleJumpPhysics` accepts `fixedImpulse` or `consistentApex`. Fixed impulse preserves the legacy rocket kick. Consistent apex adds one ordinary jump-height of vertical energy while Ignatius is rising; at rest or while falling it cancels vertical speed and starts a new ordinary-height jump.

The file also retains separate melee and ranged HP, run-speed, and attack-rate multipliers, plus ranged projectile speed. Ranged classification uses runtime `attackMode == "projectile"`. These broad multipliers remain useful for project-wide balancing, but they are no longer exposed as individual menu sliders. Per-enemy authored values in character and level data remain authoritative.


## Enemy family numbering

The current enemy namespace is grouped by creature family. Skeletons use `001-009`, goblins `010-019`, bats `020-029`, humans `030-039`, raptors `040-049`, snakes `050-059`, porkers `060-069`, crockers `070-079`, and ogres `080-089`. The latest modular additions are Hobgoblin `enemy_018`, Porker `enemy_060`, Crocker `enemy_070`, and Ogre `enemy_080`.

The three original goblin variants share `ct_atlas_enemy_010.png`. Hobgoblin, Porker, Crocker, and Ogre each own a dedicated atlas and rig, plus isolated copies of the Enemy 010 family animation clips so later tuning cannot disturb another species. Hobgoblin follows the Musket Goblin attack project, while the other three follow the Fireball Goblin caster project. Numeric enemy-pool fields refer to these suffixes. Gaps are valid because catalogs enumerate actual entries. Do not add aliases for retired identifiers; update bundled levels and tools together when a future family migration is intentional.


## Ranged attack validation

Ranged enemies may start attacks well outside their authored `attackRange`; that value now guides preferred approach spacing. They still require Ignatius to be inside the current awareness range and facing cone. A remembered last-seen position keeps pursuit alive but never permits firing by itself.

When testing ranged enemies, place solid cover between the enemy and Ignatius and verify that no wind-up begins. Remove the cover and verify that the enemy may attack immediately even from long range, provided the projectile can reach within its lifetime. Move behind cover or out of the awareness cone during the wind-up and verify that no projectile is released. Bombing bats should only drop when their predicted falling-rock lane overlaps Ignatius and no platform or blocking geometry interrupts the descent.


### Enemy projectile volleys (revision 332)

Projectile enemies may author `projectileVolleyCount` (1-15, default 1) and `projectileVolleyHalfAngle` in degrees (0-180, default 0). The simulation distributes projectiles evenly from negative to positive half-angle around the launch-time aim vector. Straight-volley attack permission succeeds when at least one member's swept circular trajectory intersects the player before terrain or a reactive projectile blocker. Each released projectile remains an independent ordinary projectile and carries `volleyId`, `volleyIndex`, `volleyCount`, and `volleyAngleOffsetDegrees` for diagnostics and presentation.


### Camera-relative cave preview (revision 333)

The cave window is not fixed to ordinary world geometry when either Foreground parallax axis differs from `1`. Runtime anchors the effect at the technical world-bounds centre and shifts the opening and cave-foreground artwork independently from `layerVisuals.foreground.parallaxX` and `parallaxY` according to the current camera centre. The Level Editor calls the same `computeCaveWindowParallaxOffset` helper, so panning to a room previews the mask position that gameplay will use there. Cave-point and foreground-asset hit testing, placement, dragging, labels, guides, and marquee selection operate on the displayed position while preserving authored world coordinates in level JSON.

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

The Level Editor no longer has an Export panel. Use the controls in **Level**: **Save Level (json)** saves the authored level, while **Save temp copy** and **Load temp copy** use the generated `resources/levels/level_temp.json`. Complete level JSON must not be stored in `localStorage`; large authored levels can exceed browser storage quotas. Do not reintroduce Copy JSON, Open JSON in new tab, a JSON summary panel, or any persistent serialized text surface.


**Play** first writes the current editor snapshot to `resources/levels/level_temp.json` through the shared project host, then opens `game.html?level=level_temp&playtest_browser_copy=1` in Chrome or asks IgnatiusDevTool to launch the native game with the same generated level. A successful editor playtest is a direct-play launch: the game must initialize the authored level, finish renderer preparation, and leave the title screen immediately. Do not require a second click on Start, and do not move this decision into portable simulation state. Ordinary `game.html` launches still begin at the title screen.

For static editor and diagnostic cameras, call `renderer.setViewOverride({ x, y, cssZoom })`. Do not multiply editor zoom by `devicePixelRatio` outside the renderer. The renderer resolves CSS zoom after resize from the exact backing/client ratio, and the editor overlay resolves its own backing transform the same way. Ordinary playing-area guides use the unmodified editor camera. Apply `computeCaveWindowParallaxOffset` only to cave-window geometry and `caveForeground` records. Apply `computeWorldParallaxOffset` with `level.layerVisuals.background.parallaxX` and `parallaxY` only to level-owned Background placements; entity-local `decorBack` parts remain attached to their actor.

## Revision 362 Level data controls and renderer-cache terminology

The Level panel has two groups. **Existing Level:** is only for choosing and loading a shipped level. **Level data:** owns New, Import, Export, Load temp copy, and Save temp copy. The temp-copy buttons use the same generated `level_temp.json` file as playtesting. Import uses a hidden file input triggered by the visible button; clear its value before opening the picker so importing the same filename twice still fires `change`.

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

Puppet Forge may therefore add X/Y keys that you did not place manually. They are adaptive samples used to keep the child socket attached while its parent rotates or scales. In looping animations, exported generated tracks end before the clip duration and interpolate back to the time-zero pose; a key exactly at the duration is redundant and must not be emitted. Non-looping animations may end with a generated key at the exact duration.

Each child may have only one parent constraint. Puppet Forge prevents self-links and circular chains such as torso to arm to torso.


## Revision 454 OGG music workflow

`resources/music/music.json` is the active music catalog. Add numbered files such as `music_006.ogg` beside it in `resources/music/`, then add a matching metadata record with an ID, file name, and title. Levels store only `music.version: 3` and `music.trackId`; the Level Editor populates its selector from this catalog. Runtime playback belongs to `src/browser/music-director.js`, which wraps a looping HTML audio element and obeys pause/focus muting and the persistent music-volume slider. Do not restore the embedded jukebox engines, score-source catalog, or synthesized tune data.

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

Choose **Background** for distant cosmetic scenery. Background records never receive atlas collision and cannot be moving platforms. They render in a dedicated pass before all ordinary world artwork regardless of stack order. `level.layerVisuals.background.parallaxX` and `parallaxY` control horizontal and vertical drift independently for the entire layer. Both default to the exact reciprocal of the Foreground default: `1 / 1.08`, approximately `0.925926`. Set an axis to `1.0` when it should have no relative drift. The allowed editor range for each Background axis is `0.01` through `1.0`.

Choose **Foreground** for inert artwork in front of actors. `level.layerVisuals.foreground.parallaxX` and `parallaxY` both default to `1.08`; `1.0` disables relative movement on that axis. Foreground treatment, the cave opening, feather contours, and generated perimeter art share both offsets. Runtime reads the grouped layer values directly every frame and passes the same normalized factors to Foreground culling, drawing, cave interaction, and the Canvas/WebGL cave mask. Each Foreground axis accepts `0.01` through `1.25`. Do not copy either value into `caveWindow`. Choose **Terrain** for ordinary placed artwork whose atlas collision may remain active.

Every atlas placement also supports an optional `onTop: true` presentation flag. The Level Editor exposes it as **On top** beside the compact **Collision** checkbox. Absent or false is the default. Background placements still remain behind Terrain, but `onTop` puts them after ordinary Background artwork. Terrain and Decoration placements with `onTop` render after actors and projectiles. Foreground placements with `onTop` render after ordinary Foreground artwork, while the cave-window black mask remains the final world-space pass. `onTop` is presentation-only: it must not alter atlas collision, moving-platform ownership, obstruction polygons, navigation support, or editor collision guides. Levels using `onTop` bypass browser static-layer baking until the extra partitions gain their own bake surfaces; live Canvas2D and WebGL rendering remain authoritative.

Both layers use world-bounds-centred offsets from `src/presentation/world-parallax.js`. Editor pointer operations add the active offset before storing authored coordinates, while drawing subtracts it. Never save camera-relative coordinates into the level. When adding new editor operations for these layers, pass records through `displayedLayerPlacement` or the equivalent shared transform so selection and rendering remain aligned.


## MP4 motion reference in Puppet Forge (revision 377)

Open **Motion reference video** in Rig and animation mode and choose a local MP4. H.264 video in an MP4 container has the broadest browser support. The video is muted and loaded through a temporary object URL; no reference media is copied into the project.

The animation playhead drives the visible video moment. Scrubbing, stepping, pausing, preview speed, and animation looping keep the MP4 aligned. **Video time offset** adds to animation time, so a positive value looks later in the clip. Use X/Y to align the person, Width/Height for independent scale, Opacity to ghost the plate, and `1.0` animation preview speed when checking source timing most literally. **Reset alignment** preserves the source aspect ratio, centres the video on local X, and bottom-aligns it to local `y = 0`. The plate follows preview zoom, pan, and facing.

The MP4 and its controls are intentionally temporary. They do not mark any project document dirty and are never included in character, rig, atlas, animation, enemy-catalog, or level JSON. Reloading or closing the tab discards them. Puppet Forge does not support image bundles as motion references.

## Mountain King orchestration correction (revision 378)

The embedded orchestrated engine marks Mountain King's quiet bassoon octave double with `followsPrimaryMelody: true`. The long-form arranger must preserve every note in marked voices just as it preserves voice zero. Do not replace this with an alternating `accentedCopy(..., 2)` or allow sparse accompaniment plans to thin it; either change recreates the audible impression that melody notes are missing or being reassigned between instruments.

## Foreground and Background visual groups (revision 379)

Open **Layers** to configure the two inert cosmetic layers. Foreground and Background each expose **Parallax X**, **Parallax Y**, **Brightness**, and **Scale**. Parallax `1.0` follows the world on that axis, while the minimum `0.01` produces almost stationary movement. Brightness and scale `1.0` preserve source colour and authored size, but the Foreground defaults intentionally show its complete cave treatment directly: brightness `0.36` and scale `2.0`. Foreground parallax starts at `1.08` on both axes; Background starts at `1 / 1.08` on both axes, with neutral brightness and scale. These values affect every placement in the layer, including cave-perimeter assets because those are Foreground records.

The **Perimeter** panel is intentionally limited to cave geometry, feather and gradient behavior, spline point editing, population seed, inward coverage, and generated-art management. Do not restore duplicate Foreground scale, brightness, or parallax controls there. `level.layerVisuals` version 3 is the sole level representation of both cosmetic layers, with `parallaxX` and `parallaxY` required for each group. The retired single `parallax` fields, top-level mirrors, and cave-decoration brightness/scale fields are unsupported. All project levels were converted by copying their former scalar to both axes.

Background and Foreground remain inert presentation. They never have atlas collision or moving-platform behavior. Layer scale must be applied around the authored placement centre, and editor culling and pointer geometry must use the same scaled display bounds as rendering.

## Mountain King upper voice treatment (revision 379)

The full bassoon octave double introduced by the revision 378 continuity correction remains marked `followsPrimaryMelody`. Do not thin or alternate it. Its voice-local timbre override lowers the cutoff, slows the envelope, reduces breath noise, extends release, and lowers gain while retaining the bassoon instrument and all note events. Tune-specific timbre overrides belong inside the embedded browser engine and must not enter portable level or shared music schemas.


## Visible Foreground treatment (revision 381)

Foreground artwork is stored at base size. Runtime and editor rendering apply only `level.layerVisuals.foreground.scale`, and foreground sprite treatment receives the layer brightness plus the perimeter decoration saturation. The shipped levels expose their complete treatment directly: level 001 uses brightness `0.4` and scale `2.0`; level 002 uses brightness `0.46` and scale `2.0`. Per-placement brightness, scale, outward-vector, and fade-interval fields are unsupported. The cave-window mask owns the only spatial fade, so moving an asset away from the perimeter immediately reveals its clean colour-treated frame.

The Layers panel contains no persistent defaults paragraph; explanatory copy belongs in native mouse-over tooltips on the controls.

## Level Editor sidebar order (revision 382)

The right sidebar is arranged as **Level**, **Metadata**, **Layers**, **Perimeter**, **Colormap**, **Generator**, **Autospawner**, **Navigation graphs**, **Entity palette**, **Asset palette**, **Placed objects**, **Selected object**, and **View**. This puts file-level actions and compact level identity first, world-construction tools next, object catalogs and inspection after them, and viewport preferences last.

Do not move the eight cosmetic-layer fields back into Metadata. **Layers** is the sole user-facing home for Foreground and Background Parallax X, Parallax Y, Brightness, and Scale. **Perimeter** is reserved for the cave-window spline, mask, feather, gradient, and automatic perimeter decoration workflow.

## Stable layer controls and scaled outlines (revision 383)

**Populate perimeter** and **Clear generated** are record-management commands. They must not modify any value in **Layers**. When reading the layer controls, commit a canonical `level.layerVisuals` version 3 object with independent `parallaxX` and `parallaxY` fields. There is no retired-schema migration path; old levels must be patched to current data before they enter the project.

Foreground and Background artwork is stored at base size, then transformed for display. Selection outlines and asset-guide boxes must use the transformed record returned by `displayedLayerPlacement` for centre, width, height, rotation, and parallax position. Using the transformed centre with the unscaled authored dimensions produces the small displaced boxes fixed in this revision.



## Current-level-only schema policy (revision 384)

The repository contains every supported level. Runtime, Level Editor, generator normalization, and tests therefore target only the current bundled schema. When a level format changes, update all shipped levels and fixtures in the same revision. Do not add aliases, mirror fields, import migrations, retired entity translations, or silent old-record stripping. A stale external level may fail validation or lose unsupported records; preserving it is not a project requirement.

Normal current-schema validation, numeric clamping, and defaults used while creating a new level remain appropriate. The prohibition is against alternate historical field names and conversion branches. Tests should verify the canonical schema and guard that retired paths stay absent, not exercise conversions from unsupported old levels.


## Automatic generator upper branches and reward mix (revision 416)

Generator schema version 34 retains the optional secondary supports introduced by version 32 with `secondaryTier` and `powerUpPerch`. Horizontal routes use a two-step ceiling lane with at least 36 percent span coverage. Standard routes create more first-tier branches and extend selected branches into a second tier. Encounter generation may seat monsters on combat perches at either tier.

The reward catalog is version 3. Power-up weights are `wrenchPickup: 6`, `overdrivePickup: 3`, and `shieldPickup: 1`. A generated Overdrive with context `detourUpperPerch` must reference an optional second-tier `powerUpPerch`. Fixed seating remains important because encounter reservations are built from reward envelopes before the encounter stage; reward rerolls may change types but must not move those seats.

Level 001 has three baked hunter profiles: goblin, tall human, and Skeleton Caster. Keep the caster profile separate because its 72 by 164 body and movement values do not match either other family. The placed Skeleton Guard should mirror the catalog melee damage of 50.

## Empty Level Editor documents (revision 417)

The **New level** command creates a bounded but otherwise empty authored level. The production runtime converter accepts that document so the editor can render the blank world immediately. Do not add hidden placeholder assets or entities to make the preview work. A payload with neither authored content nor finite positive world bounds is still invalid. The editor continues to discover atlas and numbered-level files through ordinary URL probes, so expected 404 responses at the end of those scans are not conversion failures.

## Generated population density (revision 418)

At a theme's default **Enemy density**, generated levels target one monster per 500 horizontal route units. This is based on left-to-right span rather than winding path length. Long platforms can hold several independently spaced encounters, matching ordinary authored levels; the generator still protects incoming landings, endpoint calm zones, rewards, moving-platform shafts, and unrelated platform artwork. The Enemy density control scales the target and zero disables all generated encounters.

Generated power-ups now target one pickup per 3,000 mandatory-route pixels, one third of the revision 417 count. Their type mix remains 60 percent authored wrench, 30 percent Overdrive, and 10 percent Shield, with Overdrive still preferentially assigned to dedicated upper detours. Generator schema version 33 stores the new behavior.


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

## Gameplay recording and playback parity workflow

Revision 511 adds browser-side gameplay recordings for comparing the JavaScript game with the SDL/C++ port. Launching `game.html?level=2` starts `level_002` immediately and skips the title screen. Launching `game.html?level=2&record=1` starts that level and records gameplay from the initial state. The lower-right development strip also includes `Recording: Off/On`; switching it off saves the current recording as JSON through the File System Access API when available, otherwise through a normal download.

A recording can be replayed from the UI with `Playback JSON…`, or by placing it in a hosted `recordings/` folder and launching `game.html?playback=record001.json`. The playback path restores the recording's initial game state and feeds the recorded frame timing and input snapshots into the ordinary fixed-step loop. For screenshot parity checks, add `playback_pause=120.2`; playback pauses after the first recorded frame at or beyond that timestamp and resumes on any key press.

The JSON schema is `ignatius.gameplayRecording` version 1. Each frame records the rAF requested timestamp, callback-arrival timing, real delta used by the accumulator, fixed-step count, input frame, player position, camera visible rectangle in level coordinates, and visible enemy/projectile summaries. This is a browser-adapter diagnostic format and does not add file or DOM dependencies to portable simulation.


SDL build revision 142 groups the most useful diagnostics under **Settings → Development features...** in both implementations. Asset guides show the canonical walkable lines in green and blocking geometry in yellow. Enemy guide shows each visible enemy's hitbox, awareness cone, and current AI state. The native Debug panel is intentionally compact: renderer/FIFO mode, timing and fixed-step information, player/enemy summaries, and recording/playback/logging state. It has no scrolling event log and performs its overlay work only while visible.

**Debug logging** is an explicit session-only toggle. SDL creates `logs/ignatius_debug_rev142_<timestamp>.ndjson` and appends one structured runtime snapshot per second. It flushes periodically and closes cleanly when disabled or when the application exits. The browser follows the same one-second cadence, buffers only while enabled, and downloads the NDJSON when the toggle is switched off because an ordinary page cannot silently maintain an arbitrary writable file handle. Use this low-rate log for timing and state history; use gameplay recording when deterministic input/frame reproduction is required.

### Windows incremental builds

`BUILD_REVISION.txt` at the repository root is the single authored revision source. Change only that file when advancing the build number; CMake derives the native compile-time revision from it, and the build scripts refresh `reference/BUILD_REVISION.txt` as a generated numeric mirror for ordinary static browser servers before packaging the same root value with runtime content. Do not hand-edit revision literals in C++, JavaScript, HTML, or the generated `reference/BUILD_REVISION.txt` mirror.

Run `build.bat` for the normal Windows build. It preserves `build\` and delegates dependency decisions to CMake and Visual Studio/MSBuild, so unchanged C++ translation units are not rebuilt. It also uses `robocopy` to synchronize only changed runtime assets, shader content, reference modules, and development HTML. A packaged ZIP can occasionally carry source timestamps older than existing object files; after the first incremental pass, `build.bat` verifies the executable against `BUILD_REVISION.txt`. Only when that verification fails does it refresh project-source timestamps and retry. If that retry still fails, it performs one clean rebuild. To force a fresh configure and compile manually, delete `build\` before running the script. No custom hash database is involved.


## Revision 532 rocket-fuel Flight governor

The canonical rocket-fuel effect is `POWER_UP_EFFECT_IDS.FLIGHT` with serialized ID `flight`. Authored `fuel` and `fuelPickup` entities normalize to this timed effect rather than immediately adding a fixed fuel amount. The built-in duration is 30 seconds, stacking refreshes the timer, and its Power HUD priority is 190: below every wrench at 200, above Shield at 150 and Overdrive at 100. The HUD icon remains `rocket_fuel_canister`.

While Flight is active, `applyFlightGovernor()` replaces ordinary gravity, jumping, and attached-boost drain. No vertical input targets zero vertical velocity; Up/jump/boost targets `-flightVerticalSpeed`; Down/drop targets `+flightVerticalSpeed`. `flightVerticalAcceleration` approaches those targets so takeoff, stopping, and direction changes have running-like inertia. Horizontal control uses ground acceleration and friction in the air. Holding Down continuously refreshes one-way-platform drop-through grace so a direction reversal cannot outlast the drop window.

Flight itself never calls `markRocketUse()` and never spends hover fuel. `updateFuelRecharge()` treats Flight and Overdrive as the same passive-recovery eligibility, using `attachedBoostDrainRate * OVERDRIVE_PASSIVE_FUEL_RECOVERY_DRAIN_FACTOR` and the full fuel maximum as the cap. Do not add this rate to normal grounded recharge; select the larger rate. Flight keeps the default rocket launch profile, so shooting still spends the full launch cost. Keep the JS and C++ helper names, tuning fields, update order, smoke presentation state, and expiry reset aligned.

## Authoring and tuning water regions (revision 206)

In Atlas Forge, choose **water** from the collision-guide kind selector and draw a closed loop exactly as for a blockable polygon. The editor fills a valid region in translucent blue. Keep the loop closed and non-self-intersecting. Water is invisible during normal play; enable Asset guides to inspect it in the browser or SDL runtime.

Water is a volume, not a surface collider. A wizard whose body overlaps the polygon can swim left, right, up, and down at reduced speed. With no input, gravity and buoyancy leave a slow downward drift. There is currently no breath meter. The water surface itself never deals fall damage. Braking is accumulated while travelling through the volume, so a deeper pool arrests a faster fall and a shallow pool may leave enough downward speed for an underlying blockable floor to cause normal landing damage.

The shared tuning fields are `waterHorizontalSpeedScale`, `waterHorizontalAccelerationScale`, `waterGravityBuoyancyRatio`, `waterSwimAcceleration`, `waterLinearDrag`, `waterQuadraticDrag`, `waterHorizontalLinearDrag`, and `waterHorizontalQuadraticDrag`. Keep JavaScript `DEFAULT_TUNING` and C++ `FGameTuning` values aligned. Test changes with both the deep-pool and shallow-pool parity benches rather than judging only low-speed swimming.

Backpack boost, Flight movement, and player rocket firing are intentionally blocked while submerged. The blocked actions do not consume fuel. Existing enemies regard water as forbidden navigation/collision space; add an explicit aquatic movement capability before introducing swimming enemies such as piranhas.

## Campaign level numbering and test fixtures (revisions 207 and 223)

The ordinary `level_###` namespace contains mutable authored content. `level_001` through `level_020` belong to the campaign, and files that still resemble the original one-floor cave scaffold may be freely expanded as their real terrain, enemies, and story content are authored. Tools and tests must not assume that any numbered campaign level remains a scaffold or retains a particular placement/entity count. Any test, headless smoke run, benchmark, or release verification that loads a level must use a reserved `level_tNN` fixture; an apparently empty campaign level is never a test fixture. Ordinary `level_###` identifiers may be used only by tests of identifier parsing or serialization that do not load the corresponding file.

The 800-series contains playable experiments and preserved authoring work. These files are also mutable content, not regression fixtures. Their current exits may remain sequential within the experimental range, but unit tests must not depend on their exact contents.

Use only `level_t01` through `level_t99` for file-backed tests. The `level_tNN` namespace is intentionally unreachable from normal campaign progression, may be copied from an authored level when a stable snapshot is needed, and may then evolve solely to support deterministic regression coverage.


## Enemy and boss drop tables (revision 210)

Ordinary enemy rewards are authored in the character project's `drops` array. A boss entity owns a complete replacement `drops` array in the level JSON. Do not merge the boss table with the underlying character table: a Fireball Goblin promoted to boss uses only the boss entity table and therefore does not also drop the ordinary goblin coin.

A `drops` array is one ordered weighted table and may emit at most one pickup per death. Each entry uses `{ "itemId": "coin", "chance": 0.5 }`, where `chance` is an absolute probability slice. The first matching slice selected by the deterministic roll wins. If all chances total less than 1.0, the unused remainder means nothing drops. The current boss table contains four permanent upgrades at `chance: 0.25`, so exactly one is guaranteed and all four are equally likely.

Reusable item definitions remain in `resources/items/it_loot_001.json`. Permanent upgrade collection emits `SCREEN_MESSAGE_REQUESTED`, which presentation adapters show as a short centered notice. The current messages are `Max health upgraded!`, `Max fuel upgraded!`, `Regeneration upgraded!`, and `Speed has been upgraded!`. Health and Speed use diminishing permanent gains toward a 2x base-stat ceiling, while Fuel capacity and Regeneration remain uncapped. Regeneration continues to improve both health and fuel regeneration.

## Proximity-triggered world text (revision 220)

The interactive entity catalog exposes `proximityText` as **TEXT**. It is a one-shot, world-space notification whose authored `x`/`y` coordinate is the visual center of the text. The portable simulation owns the trigger and fade state; renderers only consume the resulting opacity.

The schema fields are `text`, `fontSize`, `fontFamily`, `color`, `outlineWidth`, `outlineColor`, `triggerOffsetX`, `triggerOffsetY`, `triggerDistance`, `fadeInDuration`, `displayDuration`, and `fadeOutDuration`. Defaults are exactly `Lorem ipsum`, 100 world units, bundled `inter`, Ignatius purple `#723891` (RGB 114, 56, 145), a 3-pixel very dark purple `#0f0113` outline, a trigger at the text center, a 300-unit trigger radius, one second fade-in, five seconds fully visible, and one second fade-out. The Level Editor exposes only `Inter` and handwriting-style `Caveat`; old generic family values normalize to the closest current choice. Text is always bold.

The expected original font files are `resources/fonts/Inter[opsz,wght].ttf` and `resources/fonts/Caveat[wght].ttf`. Both browser and SDL presentation prefer those bundled files. The complete SIL Open Font License 1.1 texts and copyright notices live under `resources/fonts/licenses/`; `resources/fonts/README.md` records the official sources and exact filenames. The reorganized baseline includes both original font binaries. Development-only system fallbacks remain available for deliberately incomplete local trees, while an unreadable file at an expected path is treated as a resource error.

The trigger point is independent of the artwork position. In the Level Editor, select a TEXT entity and drag its circular trigger handle or edit the X/Y trigger offsets numerically. The dashed trigger guide is editor-only. Runtime distance is measured from the wizard center to the authored trigger point. Once triggered, the notification completes its full timing sequence even if the wizard walks away, marks the entity `complete`, and does not retrigger during that level instance. Native text textures are prewarmed when the level is loaded so first display does not perform synchronous font rasterization on the frame path.


## Deferred level colour treatment (revision 221)

The Level Editor **Colormap** panel has two independent treatments: selective hue rotation and GIMP Color Exchange. Both source/target pairs use native colour inputs, so the host colour picker and sampler are available without permanent help text in the panel. GIMP exchange thresholds default to `1.0` for red, green, and blue in both Level Editor and Character Editor controls.

Changing any Colormap value keeps the preview canvas for the currently selected palette asset, and also redraws every selected atlas placement on the map with the pending treatment. This map preview is transient overlay artwork: it does not alter level JSON, the runtime world, or atlas-wide caches, and it works for multi-selection while the native colour picker remains open. Unselected map artwork and the atlas palette continue showing the last applied settings until **Apply** is pressed. **Reset** loads the default values into the pending controls and both previews; press **Apply** to commit that reset.

The level schema stores the treatments at top level as `colorMap` and `colorExchange`. `colorExchange` uses `enabled`, `fromColor`, `toColor`, `redThreshold`, `greenThreshold`, and `blueThreshold`. Application order is GIMP exchange first, then selective hue rotation. This order is shared by the browser runtime, native SDL atlas loader, foreground brightness/saturation derivatives, and editor preview.

Apply invalidates every loaded atlas treatment cache, eagerly rebuilds atlases referenced by the level plus the active atlas, and leaves the remaining palette atlases lazy. Opening or drawing one of those atlases rebuilds it once with the committed cache key. Do not restore control-change handlers that call the atlas-wide refresh path.

## Projectile-art trail palettes (revision 222)

Ordinary enemy fireball trails derive four representative colours from the projectile frame during character-project loading. The palette is cached on the final projectile asset, after any projectile-part GIMP Color Exchange, and particle rendering only interpolates those cached colours. Keep palette extraction out of simulation and out of gameplay draw/update loops.

When adding a projectile variant, author the projectile frame or recolour its projectile rig part; no separate trail colour field is required. Skeleton Caster undeath orbs intentionally bypass this mechanism and retain their procedural green bubble trail.


## Revision 225 resource organization

Runtime files are organized under `resources/atlases`, `characters`, `editor`, `fonts`, `generator`, `items`, `levels`, `music`, `sfx`, and `ui`. Use category-relative paths in authored JSON and editor code. Run `npm run audit:resources` before committing resource changes; it is also invoked automatically by every browser test gate. Editable XCF source material belongs under `reference/authoring`, not in runtime resources.

## Fullscreen reference presentation (revision 230)

Fullscreen uses a 1920x1080 virtual reference rather than the physical display dimensions as the camera viewport. The shared helper is `src/shared/fullscreen-presentation-data.js` in the reference port and `src/shared/fullscreen-presentation-data.{h,cpp}` in the native port. Use one uniform crop-to-fill scale, `max(outputWidth / 1920, outputHeight / 1080)`. Do not add black bars and do not widen the camera merely because the display has more pixels.

The physical backing surface must remain at the actual output resolution. At 3840x2160 the logical view is still 1920x1080, but textures are rasterized across the complete 4K target. On non-16:9 outputs the visible logical width or height is smaller because the reference frame is center-cropped. Windowed mode intentionally keeps the physical window dimensions as its variable logical viewport. Mouse, touch, and pen input must be transformed back into logical render coordinates before menu or gameplay hit testing.


## Resource inventory (revision 240)

Authoring discovery is controlled by `resources/resources.json`. Add a new environment atlas ID to `assetAtlasIds` and a new authored level ID to `levelIds`; order in the arrays is the order shown by the tools. Atlas IDs may extend beyond `at_atlas_099`. Each listed atlas must have matching JSON and PNG files under `resources/atlases`, and each listed level must have a JSON file under `resources/levels`.

The Asset Tool and Level Editor retry declared files before reporting an error, so a temporary retrieval failure is no longer mistaken for the end of a numbered sequence. Run `npm run audit:resources` after manual additions. The audit rejects missing declarations, stale declarations, duplicates, malformed IDs, and incomplete atlas pairs. `level_temp.json` is generated only for DevTool playtesting and must not be listed.

When saving a genuinely new level or atlas from IgnatiusDevTool, saving into the authoring resource tree automatically appends its ID after the host verifies the file exists. A new atlas is added only when both its JSON and PNG are present. Manual editing of `resources.json` remains the normal and supported path for files added outside the tool.

## Revision 264 Level Editor camera guide ownership

The Level Editor's `drawGameplayCameraFrame` owns the green 1920×1080 viewfinder, rendered at 50% opacity, plus three small screen-space markers. The camera-centre marker is drawn as two one-pixel rectangles, 5×1 and 1×5, overlapping at one centre pixel for exactly nine visible pixels. Two additional five-pixel × markers indicate where a stationary wizard would rest when facing right or left, using the same `updateCameraHint` offsets of 150 world units horizontally and 170 vertically. All three markers are deliberately independent of zoom and have no text annotations. `drawGameplayCameraRulers` adds an optional cyan ruler immediately left and below that frame. It is enabled by default, remains non-serialized view state, and labels a single tick for each key movement measure: `WH`, `JH`, `DH`, `HH` vertically and `WW`, `JW`, `DW`, `HW` horizontally. The ruler distances are derived from the real default movement tuning by stepping a miniature simulation with `stepSimulation`, so the editor overlay stays aligned with gameplay physics. Do not restore the retired red parallax-alignment control or its camera-centre/parallax-zero labels. The gameplay camera frame, gameplay camera rulers, and gameplay perimeter boundary checkboxes are checked by default and remain non-serialized view controls.

## Browser minimap live transforms (revision 266)

`drawMinimap` must use `shownTransformOf(gameState.player)` for Ignatius and `renderer.getLastComputedView()` for the camera rectangle. The latter is the renderer-owned top-left world view after fullscreen crop-to-fill, zoom, and interpolation have been resolved. Keep `getViewportMetrics()` only as a startup fallback. Do not read retired top-level `player.x/y` or `camera.x/y` fields; transform-triplet initialization deliberately removes them. The native SDL minimap's equivalent source of truth is `NativeRenderView` plus `gameState.player.x/y`.



### Level Editor palette thumbnail cache

The Level Editor does not decode every full-resolution asset atlas just to populate its Asset and Entity palettes. `resources/palette/thumbnails.png` is a single compact thumbnail sheet and `resources/palette/thumbnails.json` maps each 64×64 cell to its authoritative asset atlas, item definition, or enemy character project. The sheet is trimmed to the occupied near-square grid and may not exceed 8192×8192.

Revision 272 places the browser-side builder beside the editors at `palette-builder.html`. Start the usual local server, open `devel.html`, choose **Palette Thumbnail Builder**, and click **Build thumbnails**. The development portal routes authoring through `IgnatiusDevTool.html`, whose single project-folder selector owns the resources root for all four tools. The page reuses the JavaScript character runtime, so enemy thumbnails inherit the real layered composition, idle pose sampling, and colour exchange rules instead of showing loose body-part bundles.

When opened through Ignatius Dev Tool, the builder writes `thumbnails.png` and `thumbnails.json` directly to `resources/palette`. Download links remain available for deliberate exports. The Palette Builder no longer owns a second resources-folder selector.

The root `devel.html` page is the development portal. It links to the game, shared Ignatius Dev Tool authoring shell, manuals, and renderer/review utilities so development tools do not require separate bookmarks.

The page also includes **Verify existing cache**, which checks the recorded source inventory and reports whether the committed cache is stale. The committed default is 64px. To evaluate a sharper cache later, simply rebuild at 128px in the page; the JSON records `cellSize`, so the editor requires no code change. Full asset atlas images are loaded lazily when selected or referenced by the open level. Enemy character projects are likewise loaded only for selected or placed enemies, while their palette cards use the generated cache. If the cache is missing, the editor falls back to the legacy full-atlas palette path.

## Revision 303: using IgnatiusDevTool.html

Open `IgnatiusDevTool.html` through the normal local development server in Chrome, or launch `IgnatiusDevTool.exe`. The page presents the Level Editor, Asset Editor, Character Editor, and Palette Builder as tabs while keeping each tool in its existing same-origin page.

In Chrome, press **Select resources folder…** once and choose the project’s `reference/resources` directory. The shell rejects a project root, `reference`, or an unrelated directory that does not contain the expected resource inventory and subdirectories. Chrome stores the directory handle and will normally restore it on a later visit; it may ask for permission again after a browser restart or permission reset.

Project saves are routed automatically:

- Level JSON goes to `resources/levels/`.
- Atlas JSON and PNG go to `resources/atlases/`.
- Character, rig, animation, and related character JSON go to `resources/characters/`.
- Palette thumbnails and metadata go to `resources/palette/`.

A newly saved level is added to `resources.json` after the file has been written. A newly saved atlas is added only when both matching JSON and PNG files exist. Explicit export/download fallbacks remain available where a tool still needs an arbitrary copy outside the project.

Inside `IgnatiusDevTool.exe`, the native host begins with the command-line override or its packaged `content/resources` tree, but the same top-level **Select resources folder…** button remains available. Choosing another valid resources directory updates the native host, reloads all four embedded tools, and makes that folder the sole source and destination for subsequent reads, saves, and Level Editor playtests. Native saves are never mirrored into packaged resources. Text reads use the native project bridge, while Blob/image/media reads use the dedicated `ignatius-project-resources.example` virtual origin mapped directly to that same selected tree. Individual sub-tools no longer own or create project-folder selection state; authoring is supported through the shared Dev Tool shell.


## Revision 304: overriding the native resources root

Both native executables accept `--resources-root <folder>` (or `--resources-root=<folder>`). The folder must be the actual Ignatius `resources` directory, containing `resources.json` and the normal `levels`, `atlases`, and `characters` subdirectories. Relative paths are resolved from the process working directory.

```text
IgnatiusSDL.exe --resources-root "D:\Projects\Ignatius\reference\resources"
IgnatiusDevTool.exe --resources-root "D:\Projects\Ignatius\reference\resources"
```

The Dev Tool uses the override as its sole authoring destination and passes the same absolute folder to every native Level Editor playtest. The shared HTML Level Editor writes the current snapshot to `<resources-root>/levels/level_temp.json` through `IgnatiusProjectHost` before asking the native shell to launch; the shell does not maintain a second JavaScript extraction path. The game then loads that file and every referenced atlas, character, audio, tuning, and other asset from the same root. There is no packaged fallback. A missing or unwritable playtest file therefore produces a visible failure instead of silently mixing resource trees. `level_temp` remains omitted from `resources.json` and is overwritten by the next playtest.


## Revision 309: temporary Character Tool part visibility

The Character Tool toolbar's **Visible / Hidden** action is an editor-only inspection aid. A click hides or shows the selected rig part in the preview without adding, editing, or deleting alpha keyframes and without marking any project document dirty. Hidden parts are omitted from canvas selection and transform handles but remain available in the rig-part selector so they can be shown again. Double-click **Visible / Hidden** to clear the temporary mask and restore every part. Loading or replacing a character or rig also clears the mask.


## Revision 310: packaged resources are the native default

When launched without `--resources-root`, both native executables use the resources copied beside them:

```text
<Release folder>/content/resources
```

`IgnatiusDevTool.exe` also loads the shared HTML tool bundle from `<Release folder>/content`. It does not automatically walk up into a source checkout and select `reference/resources`. To edit source resources directly, use **Select resources folder…** or launch with `--resources-root "..\..\reference\resources"`. The selected folder then becomes the strict read/write/playtest boundary for that session.

This makes a copied or shipped Release folder self-contained. If its `content` or `content/resources` directory is incomplete, startup fails visibly instead of borrowing content from another tree.


## Revision 321 player-rocket distance tuning

Player rocket distance controls are authored in `resources/config/tuning.json`. `rocketProjectileUnwrenchedMaxTravelDistance` is the standard rocket path budget (600 px), `rocketProjectileMaxTravelDistance` is the wrench path budget (1800 px), `rocketTargetSearchDistance` is the fixed radial acquisition limit (1500 px), and `rocketLifetimeExplosionOffscreenMargin` controls how far beyond the visible world rectangle a no-hit lifetime expiry may still create an explosion (100 px). Lifetime remains derived at launch as travel distance divided by the fully speed-scaled projectile velocity. Do not reintroduce viewport-width target range or a wrench lifetime multiplier.

## Revision 354 Power HUD timer selection

When several power-ups are active at once, the Power bar now displays whichever timed effect will expire first. The shared helper is `shortestRemainingActivePowerUpEffect` in JavaScript and C++; do not reproduce the ordering in browser or SDL presentation code. Permanent/no-expiry effects are treated as having infinite remaining time and therefore appear only when there is no active timed effect. Ties use the most recently activated effect and then stable effect ID.

The numeric `hud.priority` values on built-in effect definitions are now legacy metadata. They are intentionally preserved in the schema and authored definitions, but they do not decide which active effect appears in the Power bar. Effect stacking, wrench exclusivity, refresh behavior, expiry, and gameplay multipliers are unchanged.

## Revision 414 native memory-stress loop

The SDL executable has a rendered memory-stress mode intended for long resource-lifetime runs on Windows:

```text
IgnatiusSDL.exe --memory-stress --memory-stress-cycles=500 --memory-stress-csv=logs\memory-stress.csv
```

The mode always starts on reserved fixture `level_t20` and loops through `level_t21` and back. `level_t20` is cave-window content and `level_t21` is forest content; they deliberately use different environment-atlas sets, enemy character projects, and music so ordinary level transitions repeatedly destroy, retain, and allocate real runtime resources. The driver holds right and pulses weapon fire. Ordinary combat damage is suppressed only for this diagnostic mode so the run cannot end because an enemy kills Ignatius. Traversal is not bypassed: if a fixture fails to reach its normal exit portal within the watchdog, the process exits with code 6.

`--memory-stress-cycles=N` means N complete `level_t20 -> level_t21 -> level_t20` loops. `--memory-stress-transitions=N` may be used when an exact transition count is preferable. `--memory-stress-max-ticks=N` changes the per-level watchdog; the default is 3600 simulation ticks. If no CSV path is supplied, the executable writes `logs/ignatius_memory_stress_rev<revision>.csv` beside the executable's local output tree.

The CSV records a row at startup and after every completed transition. On Windows, `private_bytes` is the process's private committed memory and `private_bytes_available` confirms that the operating-system query succeeded. `working_set_bytes` and `peak_working_set_bytes` are also recorded, together with environment-atlas, character-project, sound, treatment-texture, raw-world-cache, visual, enemy, projectile, and smoke-puff counts. Compare repeated checkpoints for the **same level** after the first few warm-up loops. A stable plateau is expected; a persistent same-level upward trend is the signal to investigate. Linux fills the working-set columns from `/proc/self/status` and leaves `private_bytes` at zero; that path exists to smoke-test the harness rather than define Windows leak acceptance.

For memory-corruption investigations, run this same rendered loop under a Windows memory-error detector such as MSVC AddressSanitizer or Page Heap. Playback remains useful for deterministic combat-heavy reproduction, but it intentionally suppresses level transitions and therefore does not replace this fixture loop for resource-allocation/free churn.

## Revision 415 generalized stress backends

Revision 415 keeps the Revision 414 `level_t20 <-> level_t21` driver and exposes it as the `level-cycle` scenario through three explicit native backends:

```text
IgnatiusSDL.exe --stress-sim=level-cycle --stress-cycles=500
IgnatiusSDL.exe --stress-renderer=level-cycle --stress-cycles=500 --windowed
IgnatiusSDL.exe --stress-gpu=level-cycle --stress-cycles=500 --windowed
```

`--stress-sim` performs no SDL video/audio/presentation initialization and runs the C++ simulation/resource-state loop as fast as possible. `--stress-renderer` requires the legacy SDL_Renderer path. `--stress-gpu` is intentionally strict: it requires SDL_GPU, raw-GPU world rendering, raw-GPU presentation, and the offscreen frame FIFO used by the production-oriented GPU stress path. It does not silently fall back to SDL_Renderer or direct-present mode.

The generalized option aliases are `--stress-cycles`, `--stress-transitions`, `--stress-max-ticks`, and `--stress-csv`. The older `--memory-stress*` names remain supported for compatibility. The CSV includes backend/scenario identity, total ticks and elapsed time in addition to the Revision 414 process-memory/resource counters.

The evolving rationale, current measurements, planned scenarios, and Windows validation checklist live in repository-root `STRESS_TEST_PLAN.md`. Do not treat that document as a frozen specification; update it when measurements or discovered bugs change which stress work has the best diagnostic value.

## Revision 432 committed melee lunges

The old short attack-time tracking nudge is retired. A grounded melee enemy becomes lunge-eligible only when its authored `lungeRangeMax`, `lungeSpeed`, and `lungeTargetDist` are all positive and the range band is valid. Inside positive `meleeHitRange` it swings normally without lunging. Active melee enemies are expected to author that positive close-attack reach explicitly; there is no fallback to projectile-only `attackRange`. Between the close range and `lungeRangeMin` it keeps pursuing; between `lungeRangeMin` and `lungeRangeMax` it may commit if the complete grounded path to the target position is traversable. The burst destination is Ignatius's position at lunge launch minus the explicit `lungeTargetDist` in the attack direction, with both melee reach and target separation scaled by enemy instance scale. No target distance is inferred when the authored value is zero. The destination does not home after launch. Full-path validity is checked before commitment and at launch; once moving, the burst advances through small collision/support-aware substeps so newly appearing distant blockers do not freeze it early, while walls and gaps still stop it without tunnelling. The enemy remains at the resulting position after the swing.

Long lunges preserve authored `lungeSpeed` without slowing the attack animation. The attack animation plays at authored speed through its wind-up until the first melee handoff/impact pose. That impact pose is then held while the enemy physically lunges; the handoff is delayed until the burst completes, after which the remaining follow-through resumes at authored speed. Physical lunge speed is world-space px/s and is intentionally independent of the global melee attack-rate scale. If an in-flight lunge physically reaches a newly introduced wall, ledge, or unsupported boundary, that stop position immediately ends the lunge and resolves the delayed handoff there; removing the obstruction later cannot restart the burst.

`meleeHitRange` is a forward horizontal reach measured from the character enemy grounded-base X. At the critical frame, the authored melee handoff supplies strike timing and strike Y; a hit occurs when the grounded-base reach segment at that Y intersects Ignatius's hurt box and terrain does not block the attack. This remains gameplay geometry rather than pixel-alpha weapon collision. A zero reach does not fall back to any legacy radius and therefore provides no ordinary melee reach.

Lunge eligibility is catalog data, not a fixed enemy-family rule. Zero `lungeRangeMax` disables lunging, and a positive maximum below `lungeRangeMin` is treated as an invalid disabled band rather than being silently collapsed. Current playtesting uses 600 px maximum range and 2000 px/s where enabled, but individual Skeleton, Raider, or Pirate variants may enable or disable lunging independently. Tests use synthetic lunge fixtures so balance decisions such as disabling Human Raider lunges do not fail mechanics regressions.


## Revision 515 persistent player ability unlocks

The permanent `playerProgression` payload now owns three independent boolean ability flags: `lungeUnlocked`, `fallImpactExplosionUnlocked`, and `fallDamageReductionUnlocked`. They are serialized through the same campaign/save-game path as the permanent health, fuel, regeneration, speed, and collected-upgrade progression, so autosaves, manual saves, level transitions, browser/native gameplay-state serialization, and playback restore retain the flags.

For compatibility, progression records from revisions before 515 that omit these fields normalize all three flags to `true`, preserving the abilities those saves already had. Revision 517 new games explicitly initialize `lungeUnlocked` and `fallImpactExplosionUnlocked` to `true`, but `fallDamageReductionUnlocked` to `false`. When the gold/talent/pickup unlock mechanism is added later, change the remaining new-game initialization to the desired locked state and grant the relevant flag through the progression system; do not change the missing-field migration default, because legacy saves must continue to retain their previously available abilities.

`lungeUnlocked` gates the charge itself: when false, lunge input has no gameplay effect and must not start the 0.5-second crouch, smoke, reduced hitbox, fuel use, or cooldown. `fallImpactExplosionUnlocked` independently gates the intentional Down-held body-slam/Bigbomb AOE. `fallDamageReductionUnlocked` independently gates the 50-percent fall-damage multiplier. A save may therefore contain any combination of the three abilities.


## Revision 516 committed player body slam

The fall-impact attack is now intentional rather than a side effect of every damaging fall. A body slam may commit only while `fallImpactExplosionUnlocked` is true, its own cooldown is ready, Ignatius is airborne outside water/Flight/lunge states, Down is currently held, and his current downward velocity is already greater than `fallDamageSafeImpactSpeed`. This is a current-state predicate, not a threshold-crossing event: pressing Down after the damaging-speed threshold was crossed commits immediately. A brief Down press used only to drop through a green walkable line does not commit unless Down remains held until the fall is dangerous.

Commitment is a point of no return until landing. It clears ordinary-jump/air-kick eligibility and suppresses later jump/boost/hover recovery, but doubled gravity remains an input effect rather than part of the committed state: holding Down continues to double gravity, while releasing Down returns to ordinary gravity without cancelling the slam. The implementation intentionally does not delay or retrospectively undo damage from the tick immediately before commitment; a contact/projectile/hazard hit that lands just before the fall is fast enough to commit remains valid. Keep the explanatory code comment in both simulations so future reviews do not mistake this known one-tick boundary for a regression. Water, death, reset, and development teleport clear transient slam state.

A committed slam has shield-like ordinary-damage immunity from commitment through landing, represented by the same pulsing blue tint used by Shield/lunge immunity. Fall damage continues to call the damage path with bypass-invulnerability enabled and therefore still applies. On landing, the dedicated `bodySlamImmunityTimer` is set from `playerContactDamageInvulnerabilitySeconds` (currently 0.45 s), and the ordinary contact-invulnerability timer is raised to the same duration. This blocks contact, melee, projectiles/explosions, and damaging-area channels during the grace window without turning the actual Shield pickup on.

Only a committed slam can call the existing Bigbomb-style fall-impact AOE. Its presentation and radius still reuse the red Bigbomb profile, but damage is deliberately independent through `playerFallImpactExplosionDamage`, currently 60 rather than the Bigbomb rocket's 80. Accidental damaging falls still receive the independent `fallDamageReductionUnlocked` multiplier but never explode. Commitment itself requires the AOE cooldown to be ready, so holding Down during cooldown remains an ordinary accelerated fall; if the cooldown expires while the wizard is still airborne, falling fast enough, and holding Down, the current-state predicate may commit on that later tick. The AOE cooldown begins when the slam actually explodes on landing. Revision 546 makes `playerFallImpactExplosionCooldownSeconds` the 2.5-second base cooldown; owning `fallDamageReductionUnlocked` doubles the effective body-slam cooldown to 5.0 seconds as the tradeoff for halved fall damage. `playerLungeCooldownSeconds` remains 5.0 seconds. Revision 517 sets `playerLungeDamage` to 45 and separates slam damage from Bigbomb through `playerFallImpactExplosionDamage = 60`.
