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
| `level-editor.html` | 98 | Level Editor scene, palette thumbnails, offscreen caches, guides, and overlays. |
| `character-editor.html` | 29 | Puppet Forge atlas, stage, rig, and timeline surfaces. |
| `asset-editor.html` | 12 | Atlas-object authoring surface. |

The counts are lexical audit counts rather than draw calls per frame. They are useful for detecting ownership drift, not for estimating performance.

## Boundary conclusions

`src/core/` and `src/shared/` contain no approved direct Canvas drawing. They remain portable data, simulation, collision, navigation, and geometry code. WebGL2 must consume their ordinary records and must not make GPU buffers authoritative for gameplay or authored level state.

The game renderer should migrate first behind the existing presentation boundary. The HUD minimap may remain Canvas 2D because it is small, infrequently redrawn, and isolated in `game-bootstrap.js`. The three editors are separate tools and do not need to change backend in the first game-renderer slice. Their Canvas caches may later be replaced independently while preserving the same placements, entities, bounds, layer ordering, and transient overlay split.

Texture-producing helpers such as cave masks, colour-map caches, overlap composites, and rocket-glow baking are presentation-owned inputs. A WebGL2 backend may upload their results as textures, replace them with GPU equivalents, or retain Canvas-produced textures during migration. It must not duplicate their gameplay-neutral source data in a second scene model.

## Migration guardrails

The first WebGL2 slice should render a static world through a backend interface while Canvas remains available as a fallback. Camera transforms, layer partitions, visible-record queries, character draw commands, and effect records should be backend inputs. Input, simulation, collision, level loading, editor JSON, and generator output stay unchanged.

Do not combine the initial backend switch with gameplay changes, level-format changes, editor rewrites, or a new asset pipeline. Keep the minimap and editor surfaces on Canvas until the game-world backend is stable and the stress fixture has comparable measurements.

## Revision 323 resident-texture note

The opt-in game renderer now consumes original character atlas images/source rectangles and pins presentation cache surfaces as WebGL textures. This does not change direct-Canvas ownership: cave masks, colour maps, overlap composites, foreground treatments, tint surfaces, text sprites, and particle stamps are still produced inside the approved presentation boundary. Normal WebGL gameplay no longer uploads the complete dynamic actor stack or final cave composition as full-screen Canvas layers; rare overlays and unsupported residual visuals use the existing conditional staging seam.

## Revision 324 geometric cave-mask and effect note

The cave-window source remains presentation-owned, but the opt-in WebGL path no longer rasterizes it into a camera-sized Canvas texture. Authored cave data is compiled into cached world-space feather and exterior geometry, then rendered with blend and stencil passes. The Canvas calls in `cave-window-mask.js` remain required for the default renderer and the explicit WebGL compatibility fallback; their lexical ownership count is therefore not expected to disappear.

Procedural effect stamps are still prepared once inside `canvas-renderer.js`, pinned as textures, and drawn directly by the WebGL batcher. Player rocket trails, goblin-fireball trails, projectile explosions, reactive-object destruction smoke, projectile impact puffs, and teleport effects do not require a full-screen staging layer during normal gameplay. Mailbox/debug overlays and unsupported residual visuals remain the intentionally narrow staging boundary.
