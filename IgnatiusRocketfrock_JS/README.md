
# Ignatius Rocketfrock Theme A 002

This build does two things:

1. Rebuilds the test arena around the actual whole-island blocks available in `theme_A_atlas_1.png` instead of trying to force the atlas to mimic the earlier abstract calibration arena.
2. Adds a real `atlas_manifest_tool.html` editor so atlas sheets can be annotated by hand.

## What changed in the arena

The new Theme A arena is a fresh cave/ruin courtyard layout with:

- a left start courtyard
- a broad central terrace for running and jumping
- an upper route across whole ledges
- a ruin gallery / hanging walkway section
- a right-side vertical boost pocket for rocket-hover testing
- existing test dummies, pickups, and homing dot repositioned into the new space

The environment art is still treated as **whole placeable chunks**. Collision remains simple and simulation-owned.

## Atlas data editor

Open `atlas_manifest_tool.html` in a browser.

It supports:

- loading an atlas image
- loading/saving manifest JSON
- drawing object frame rectangles
- drawing local regions such as walkable, solid, destructible, oneway, hazard, decor, and weakpoint
- per-object metadata: type, layer hint, mirrorable, default scale, pivot, tags, notes
- per-region metadata: id, kind, x/y/w/h, tags
- copy/download JSON export
- browser-local save/load for work in progress

The exported JSON format is intended to be editable and future-friendly. The current renderer only needs `frames`, but the richer `objects` block is there for later gameplay use.
