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

Standard remains the folded route with broad upper traversal, a nearly continuous lower recovery path, and occasional upper reward or combat positions. Domed caverns keep the lower perimeter close to the route while expanding ceiling volume. Rewarded levels target roughly one real power-up per 1,000 route pixels at default density, split between random wrenches, Shield, and Speed Shot plus contextual rewards.

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
