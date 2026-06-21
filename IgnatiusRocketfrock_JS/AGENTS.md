# INTRO #

This is about a 2D platformer where a catoony wizard as protagonist for a 2D platformer game. 
The game is written in HTML+JS.  
He will usually be running from left to right but we can easily mirror all assets.
He will be animated from a part of assets.

## SOURCE ORGANIZATION RULE ##

Use `ARCHITECTURE.md` as the authoritative module map. Portable gameplay belongs in `src/core/`, engine-neutral cross-layer helpers in `src/shared/`, browser startup/input in `src/browser/`, Canvas and visual runtime code in `src/presentation/`, and editor-only helpers in `src/tools/`. Use lowercase kebab-case and unique descriptive filenames; do not add loose root JavaScript files or several ambiguous files named `app.js`. The future C++ parity commitment applies to `src/core/` and shared runtime data, not to browser, Canvas, or editor implementations. Update tests and all three architecture/planning documents whenever a file moves or changes classification. `src/core/simulation.js` still imports the presentation colour-map normalizer as known temporary debt; do not add further core-to-presentation dependencies.

## VIEWPORT SCALING RULE ##

The game uses a shared virtual viewport. On narrow mobile screens the renderer scales the whole canvas down instead of scaling individual sprites or physics values. Keep gameplay, collision, camera, particle, and level coordinates in virtual game coordinates. Convert mouse, touch, and pointer screen coordinates through the viewport transform before passing them into gameplay controls.


## LEVEL COLOUR-MAP RULE ##

Level-wide environment recolouring is stored in `level.colorMap` and implemented through `src/presentation/level-color-map.js`. Preserve the original atlas image and rebuild an offscreen recoloured atlas only when the normalized colour-map cache key changes. Normal render frames must use the cached image through ordinary `drawImage`; never loop over pixels per frame. Apply the map only to environment atlas artwork, not to the cave background, characters, entities, alpha, or collision data.

## LEVEL PLACEMENT TRANSFORM RULE ##

Level atlas placements may use `mirrorX`, `mirrorY`, and center-based `rotation` in radians. The level editor displays rotation in degrees, but exported/runtime data remains radians. Rendering, editor hit testing, selection outlines, asset guide overlays, and atlas-derived collision must all use `src/shared/level-transform.js`. Never add a separate visual-only rotation or mirror path, because it would desynchronize collision from the art. Right-mouse drag is reserved for panning the level editor regardless of the active placement tool.

## ANIMATION PIPELINE RULE ##

Ground running is data-driven through `assets/ct_anim_wizard_run_1.json` and `src/shared/animation-data.js`. Do not add new run-pose formulas to the renderer or scale animation values per sprite. Animation `x`/`y` values are unscaled rig-space pixels, `rotation` is radians, `scale` multiplies the rig part target height, and `alpha` is scalar opacity. The procedural run and its comparison mode were removed in revision 056. Edit run keyframes in `character-editor.html`; shared keyframe mutations belong in `src/tools/character-editor/animation-editor.js`.

## CHARACTER TOOL DATA-LAYER RULE ##

Do not merge atlas-frame rectangles with rig-part semantics. The atlas manifest identifies reusable pixel rectangles in a PNG. The rig assigns those frames to parts and owns pivots, anchors, draw order, roles, and gameplay/editor tags. Character project selection, blank-template creation, URL loading, and local PNG/JSON workspaces are centralized through `character-editor.html` and `src/tools/character-editor/character-project.js`; do not reintroduce wizard-only hardcoded paths. Atlas rectangle authoring and independent per-document dirty tracking were added in revision 061. Revision 063 added known-project switching for the first enemy plus atlas-frame-to-rig creation with animation synchronization. Revision 064 added its walk clip and records held-equipment grip metadata on the rig; the current clips still author absolute equipment transforms at the animated hand positions. Revision 065 added selected-part **To Back** and **To Front** draw-order controls. Revision 084 added validated clip-metadata editing and in-memory animation duplication that also updates the character animation map; keep shared metadata and duplication mutations in `src/tools/character-editor/animation-editor.js` and stable slot/filename rules in `src/tools/character-editor/character-project.js`. Revision 085 added `src/presentation/character-runtime.js`; all non-tool game loading, arbitrary-rig normalization, animation-slot sampling, and ordered character draw-command creation belong there. `src/presentation/canvas-renderer.js` may select presentation states and execute those commands, but monster behaviour must remain simulation-owned. Revision 093 added an explicit enemy catalog, Level Editor placement/preview, ground snapping, and simulation-owned guard/patrol behaviour for `enemy_001`. Revision 094 added simulation-owned enemy health, swept projectile collision that respects nearer terrain, hurt/death transitions, target deactivation, hit flash, and temporary health-bar feedback. Revision 096 added simulation-owned melee damage, terrain-shielded strike checks, player invulnerability, knockback, and damaging/killable collision surfaces. Revision 097 added patrol-area awareness, faster pursuit, attack lunges, and rapid chained attacks; keep those combat decisions in the simulation while the renderer only presents authored animation slots and feedback timers.


## ENEMY PROJECT NAMING RULE ##

Enemy character projects use stable numbered filenames rather than species-specific filenames: `ct_char_enemy_0XX.json`, `ct_rig_enemy_0XX.json`, `ct_atlas_enemy_0XX.json`, `ct_atlas_enemy_0XX.png`, and `ct_anim_enemy_0XX_<slot>.json`. Keep the human-readable species/name in `displayName`, roles, and tags, not in the filenames. `enemy_001` is currently the Skeleton Guard. Future automatic discovery should use a generated/indexed enemy catalog or numbered probing; browser code must not pretend it can enumerate an arbitrary static asset directory.

## CHARACTER TOOL DIRECT-EDIT RULE ##

Puppet Forge direct transform editing uses the same rig-space animation coordinates as exported JSON. The canvas view zoom is presentation-only. Convert pointer positions through `src/tools/character-editor/character-editor-view.js`; never bake preview zoom, canvas pixels, mirroring, or CSS scale into X/Y/rotation keyframe values. Direct drags must create missing keys at the current playhead before mutation so sampled in-between poses do not masquerade as persistent edits.

Interactive and story props use `assets/it_atlas_001.json` for pixel rectangles and `assets/it_entities_001.json` for editor templates/state-to-visual mappings. Do not hardcode item sprites directly into the Level Editor or renderer. Placed catalog entities copy `visualStates` into level JSON, and entity visuals may use `actorFront` when artwork must be drawn after the player, such as the foreground half of an open portal. Runtime state changes must go through `setWorldEntityState` so the current visuals stay synchronized with entity state. Dedicated `wizard_entry_door` and `wizard_exit_door` entities own level transitions. The entry door replaces `wizardStart`; the exit door replaces the plain `exit` marker and is mirrored by default. Both snap to nearby authored support lines. A doorway entity's `y` is the walkable threshold under the meeting door leaves, not the bottom of its full sprite; preserve `floorAnchorYFactor` in both runtime and editor geometry. Doorway-only wizard scaling is presentation state in `player.renderScale` and must not alter gameplay collision dimensions. Keep transition destination and timing data on the doorway entity, and keep behaviour separate from the visual catalog.

## PLAYER START AND ARTWORK TARGET RULE ##

Authored `wizardStart` coordinates are foot positions. After atlas collision is built, starts within half a wizard height above a `walkable` or `blockable` line are snapped to that support; keep the runtime and Level Editor implementations behaviorally identical. Portal introductions must use the resolved ground Y before control is released. Atlas-backed target entities should expose a normalized `targetAnchor` inside their entity rectangle and may set `showTargetMarker: false`; do not reintroduce a separate visible homing dot when the artwork already contains a clear bullseye.

Closed blockable atlas loops are solid areas, not only boundary hints. After ordinary axis sweeps, the simulation must depenetrate Ignatius from any overlapping solid rectangle or closed collision polygon along the nearest axis exit. This recovery must also work from a stationary or already-invalid embedded state, and must not change the player's authored collision dimensions.


## Mailbox story guardrail

Mailbox letters are entity-authored story data, and a level may contain several mailboxes. Keep trigger distance, durations, atlas frame IDs, editor copy, and Ignatius's thought on each mailbox entity in level JSON. The simulation owns phase progression and input locking; the renderer only draws the active scroll or thought bubble from `state.story.mailboxEvent`. Do not hardcode level-specific prose or trigger coordinates in the renderer.
