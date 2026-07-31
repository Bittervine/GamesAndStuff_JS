# Level Editor Stress Baseline

Revision 303 froze `tests/fixtures/level-editor-stress.json` as the permanent dense-editor comparison level. Revision 329 performs an identifier-only migration to the goblin and bat family number ranges while preserving the same geometry, entity counts, and workload. It is not a campaign level. It is a compact JSON snapshot of the revision-302 dense `level_002` authoring workload, renamed and marked as a fixture so later gameplay edits cannot quietly move the performance goalposts.

Run `npm run inspect:editor-stress` to verify its structural baseline.

| Metric | Frozen value |
| --- | ---: |
| SHA-256 | `6fbd44374bb29fd8a9338af724b255e69b7f3fc8fbff1f67064d0377110d5993` |
| JSON bytes | 1,487,044 |
| Placements | 1,039 |
| Terrain placements | 53 |
| Cave-foreground placements | 986 |
| Entities | 68 |
| Character enemies | 16 |
| Treasure chests | 32 |
| Enemy spawners | 6 |
| Cave spline points | 43 |
| Baked navigation profiles | 2 |

The fixture deliberately exercises dense foreground art, ordinary terrain, asset-local overlap masks, composed character previews, invisible/editor-only markers, reward visuals, cave masking, colour mapping, and baked navigation metadata in one document.

## Browser profiling protocol

Use the same browser, display scale, window size, and revision for every comparison. Load the fixture through the Level Editor JSON loader and record these scenarios after the first complete draw has settled:

1. Whole-level Fit view while idle.
2. Whole-level Fit while moving an asset placement preview continuously for ten seconds.
3. Whole-level Fit while panning continuously for ten seconds.
4. A normal editing zoom while dragging one terrain placement.
5. A normal editing zoom while dragging one cave-foreground placement.

Record average frame time, worst visible hitch, and whether input remains visually attached to the pointer. Use `devel/benchmark_level_editor_playwright.py` for the first loaded-page comparison when Python Playwright and Chromium are available. Manual browser profiling remains the final visual check, but it is no longer the first diagnostic step. The structural fixture and procedure are fixed so the production-renderer editor can be compared consistently with the standalone Canvas baseline and later overlay changes.

Do not casually edit this fixture. A deliberate replacement must update the hash, counts, revision marker, regression test, and this document in the same revision.


Revision 356 retires the editor-specific Canvas/WebGL tile comparison. The normal editor and the standalone baseline now share the production Canvas2D base renderer; the editor adds its transparent authoring overlay and dirty-state synchronization. For performance investigations, compare the normal editor against the baseline at the same camera and zoom, then disable guide categories one at a time only if the shared base remains smooth.


## Revision 357 automated comparison

A Chromium run at 1749×926 CSS pixels, DPR 1, level 002, and zoom 0.365 measured 58.1 FPS in the standalone production-renderer baseline and 51.9 FPS in the full editor, including the grid, manifest lines, labels, cave guides, and side panels. The editor/baseline cadence ratio was 0.89. These numbers are comparative rather than universal hardware targets.

The same probe verified that `document.body.scrollWidth === innerWidth`, the stage width equals both the canvas viewport and workbench width, and the stage/overlay backing dimensions match. A failure in those layout checks is more important than a small FPS difference because it indicates the profiler-driven resize loop that caused revision 356 to wobble and fall to roughly 1-2 FPS under automation.


## Revision 358 physical-browser structural sweep

The revision 357 Playwright ratio is not a release target. On the target machine, physical Chrome and Opera reported roughly 1.3 FPS in the full editor while the same level and zoom stayed near 40 FPS in the standalone baseline, despite low synchronous submission timings. A headless or virtual-display run can therefore verify layout and JavaScript boundaries while completely missing the relevant raster/compositor stall.

The former Editor 2 stage-sweep scaffold has been removed from the active project. For posterity-only renderer comparison, open `level-renderer-baseline.html` directly and compare it with the Level Editor using the existing Playwright benchmark or manual camera movement. The Level Editor no longer links to either diagnostic surface.

## Revision 359 palette-surface check

The revision 358 structural sweep showed no large penalty from static sidebar DOM, toolbar chrome, an untouched transparent canvas, or clearing that canvas. The grid cost was measurable but modest and nearly identical on the scene and overlay canvases. The functional editor differs because it populates approximately 197 entity and asset thumbnail canvases for level 002.

Revision 359 virtualizes those backing stores. In profile mode, record the final `palette active/total canvases MP` fields together with cadence. At ordinary sidebar positions, only thumbnails near the physical viewport should have more than a 1×1 backing store. A performance comparison is invalid if nearly all palette canvases are active, because that indicates observer or clipping behavior has regressed.

## Revision 360 expanded-Export check

A physical-browser comparison found that the old Export textarea, not the renderer, caused the catastrophic cadence collapse. Level 002's pretty JSON is approximately 2.5 MB across 60,000 lines. All panels collapsed yielded about 45 FPS; expanding only Export yielded about 1.4 FPS.

For future stress checks, leave Export expanded. The panel must contain only the compact `export-json-summary`; it must contain no textarea and no serialized level text. The Playwright report now includes `exportSurface`, whose textarea and character counts must both be zero. Copying, downloading, saving, playtesting, or opening JSON may briefly serialize the level, but ordinary pan/zoom frames must not retain that string in the editor DOM.
