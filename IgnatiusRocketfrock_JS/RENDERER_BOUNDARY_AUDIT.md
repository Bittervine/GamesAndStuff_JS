# Renderer Boundary Audit

Revision 303 records the direct Canvas 2D ownership map immediately before the WebGL2 phase. Run `npm run audit:renderer` after adding or moving rendering code. The audit scans production HTML and JavaScript and fails when a new direct Canvas owner appears outside the approved boundary.

## Current direct Canvas owners

| Owner | Revision-303 direct-call count | Responsibility |
| --- | ---: | --- |
| `src/presentation/canvas-renderer.js` | 142 | Main game world, actors, particles, HUD-facing world presentation, and debug drawing. This is the primary WebGL2 replacement seam. |
| `src/presentation/cave-window-mask.js` | 5 | Cave opening mask and feather preparation. |
| `src/presentation/character-runtime.js` | 1 | Character visual composition helper. |
| `src/presentation/foreground-sprite-treatment.js` | 3 | Foreground treatment cache preparation. |
| `src/presentation/level-color-map-cache.js` | 3 | Recoloured atlas cache preparation. |
| `src/presentation/overlap-blend-cache.js` | 5 | Static overlap-composite preparation. |
| `src/presentation/rocket-glow-baking.js` | 5 | Offline-style glow texture baking. |
| `src/browser/game-bootstrap.js` | 8 | The small HUD minimap only. Gameplay world rendering must not migrate into browser startup code. |
| `level-editor.html` | 97 | Level Editor palette/preview canvases and transparent authoring overlay; the base scene is delegated to the production presentation renderer. |
| `character-editor.html` | 29 | Puppet Forge atlas, stage, rig, and timeline surfaces. |
| `asset-editor.html` | 12 | Atlas-object authoring surface. |

The counts are lexical audit counts rather than draw calls per frame. They are useful for detecting ownership drift, not for estimating performance.

## Boundary conclusions

`src/core/` and `src/shared/` contain no approved direct Canvas drawing. They remain portable data, simulation, collision, navigation, and geometry code. WebGL2 must consume their ordinary records and must not make GPU buffers authoritative for gameplay or authored level state.

The game renderer should migrate first behind the existing presentation boundary. The HUD minimap may remain Canvas 2D because it is small, infrequently redrawn, and isolated in `game-bootstrap.js`. The three editors are separate tools. Revision 356 makes the Level Editor delegate its base scene to the production Canvas renderer while retaining editor-owned palette/preview canvases and the transparent authoring overlay. Character and asset editors remain standalone Canvas tools.

Texture-producing helpers such as cave masks, colour-map caches, overlap composites, and rocket-glow baking are presentation-owned inputs. A WebGL2 backend may upload their results as textures, replace them with GPU equivalents, or retain Canvas-produced textures during migration. It must not duplicate their gameplay-neutral source data in a second scene model.

## Migration guardrails

The first WebGL2 slice should render a static world through a backend interface while Canvas remains available as a fallback. Camera transforms, layer partitions, visible-record queries, character draw commands, and effect records should be backend inputs. Input, simulation, collision, level loading, editor JSON, and generator output stay unchanged.

Do not combine the initial backend switch with gameplay changes, level-format changes, or a new asset pipeline. The minimap and editor-owned overlays remain Canvas; the Level Editor base scene now deliberately reuses the stable production Canvas renderer rather than maintaining a separate backend.

## Revision 323 resident-texture note

The opt-in game renderer now consumes original character atlas images/source rectangles and pins presentation cache surfaces as WebGL textures. This does not change direct-Canvas ownership: cave masks, colour maps, overlap composites, foreground treatments, tint surfaces, text sprites, and particle stamps are still produced inside the approved presentation boundary. Normal WebGL gameplay no longer uploads the complete dynamic actor stack or final cave composition as full-screen Canvas layers; rare overlays and unsupported residual visuals use the existing conditional staging seam.

## Revision 324 geometric cave-mask and effect note

The cave-window source remains presentation-owned, but the opt-in WebGL path no longer rasterizes it into a camera-sized Canvas texture. Authored cave data is compiled into cached world-space feather and exterior geometry, then rendered with blend and stencil passes. The Canvas calls in `cave-window-mask.js` remain required for the default renderer and the explicit WebGL compatibility fallback; their lexical ownership count is therefore not expected to disappear.

Procedural effect stamps are still prepared once inside `canvas-renderer.js`, pinned as textures, and drawn directly by the WebGL batcher. Player rocket trails, goblin-fireball trails, projectile explosions, reactive-object destruction smoke, projectile impact puffs, and teleport effects do not require a full-screen staging layer during normal gameplay. Mailbox/debug overlays and unsupported residual visuals remain the intentionally narrow staging boundary.

## Revision 334 diagnostic-page note

`devel/enemy-hit-effect-lab.html` and `devel/enemy-hit-effect-lab.js` deliberately contain direct Canvas drawing for a standalone performance probe. The audit script excludes the complete `devel/` directory, so this does not add a production Canvas owner or weaken the game-renderer boundary. The lab imports production character-command and WebGL backend seams, but its local effect state, timing graph, and cache controls are diagnostic-only.

## Revision 335 enemy-hit flash note

The Canvas character-enemy hit flash now uses the presentation-owned prepared `hitFlashCanvas` surfaces instead of changing `ctx.filter` on the live world context. This adds no renderer owner and no authoritative state. The development lab still contains an explicit filter-only button as a diagnostic comparison, but production enemy rendering uses additive prepared surfaces in both Canvas and WebGL modes.

## Revision 336 diagnostic boundary note

The new HUD-blur comparison is a DOM/CSS diagnostic controlled by a root class and does not enter portable simulation or renderer modules. The laboratory's component sets and outside-draw timing remain development-only. Canvas and WebGL production boundaries are unchanged in this revision.


## Revision 356 Level Editor delegation note

The Level Editor remains an approved direct-Canvas owner because its grid, collision/manifest guides, selection graphics, palette thumbnails, and transient placement previews are editor-only drawing. Its scenery, actors, cave foreground, parallax, and cave mask are no longer locally composed: `level-editor.html` delegates that base scene to `src/presentation/canvas-renderer.js` through `applyEditorLevelToWorld` and `setViewOverride`. This reduces renderer duplication without moving authoring state or Canvas ownership into portable modules.

## Revision 358 Editor 2 scaffold note

`src/tools/level-editor-2.js` is an approved development-only direct Canvas owner. It renders the shared production scene through `src/presentation/canvas-renderer.js`; its five direct calls are limited to the structural comparison layers that clear or draw the same simple grid on either a transparent overlay or the scene canvas. The scaffold owns no authoritative level data, atlas renderer, character renderer, or gameplay presentation path. Its direct Canvas use exists specifically to identify the browser/GPU boundary before full editor functionality is migrated.
