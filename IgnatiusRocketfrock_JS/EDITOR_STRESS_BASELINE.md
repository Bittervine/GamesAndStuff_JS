# Level Editor Stress Baseline

Revision 303 freezes `tests/fixtures/level-editor-stress.json` as the permanent dense-editor comparison level. It is not a campaign level. It is a compact JSON snapshot of the revision-302 dense `level_002` authoring workload, renamed and marked as a fixture so later gameplay edits cannot quietly move the performance goalposts.

Run `npm run inspect:editor-stress` to verify its structural baseline.

| Metric | Frozen value |
| --- | ---: |
| SHA-256 | `01189546893648d250968add6c0320d6e5bb8a14e97eb98f2251c27e1e0642ea` |
| JSON bytes | 1,487,002 |
| Placements | 1,039 |
| Terrain placements | 53 |
| Cave-foreground placements | 986 |
| Entities | 68 |
| Character enemies | 16 |
| Treasure chests | 32 |
| Enemy spawners | 6 |
| Cave spline points | 43 |
| Baked navigation profiles | 2 |

The fixture deliberately exercises dense foreground art, ordinary terrain, overlap composites, composed character previews, invisible/editor-only markers, reward visuals, cave masking, colour mapping, and baked navigation metadata in one document.

## Browser profiling protocol

Use the same browser, display scale, window size, and revision for every comparison. Load the fixture through the Level Editor JSON loader and record these scenarios after the first complete draw has settled:

1. Whole-level Fit view while idle.
2. Whole-level Fit while moving an asset placement preview continuously for ten seconds.
3. Whole-level Fit while panning continuously for ten seconds.
4. A normal editing zoom while dragging one terrain placement.
5. A normal editing zoom while dragging one cave-foreground placement.

Record average frame time, worst visible hitch, and whether input remains visually attached to the pointer. Browser profiling remains a hands-on task because the current virtual environment does not provide a trustworthy loaded-page timing run. The structural fixture and procedure are now fixed, so Canvas and WebGL2 measurements will still be comparable when collected.

Do not casually edit this fixture. A deliberate replacement must update the hash, counts, revision marker, regression test, and this document in the same revision.
