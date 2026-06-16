# Ignatius Rocketfrock: Phase 1.002 Physics Arena

This bundle is a second small Phase 1 patch, not Phase 2. It keeps the project focused on the physics arena and tuning tools.

## Run

Use a local static server from this folder:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/game.html
```

The rig reference page is available at:

```text
http://localhost:8000/wizard_rig_runner.html
```

## Controls

- Move: Left/Right arrows or A/D
- Jump: Up arrow, W, or Z
- Rocket double-jump / hover: press jump again while airborne and hold
- Launch homing test rocket: Space, X, or K
- Pause: P
- Single-frame step: O
- Reset: R
- Toggle hitboxes: H
- Toggle velocity vector: V
- Toggle collision drawing: C
- Export `gameState`: E
- Toggle debug panel: F1

## What changed in Phase 1.001

- The attached rocket boost now starts with a stronger kick, then decays into a gentler sustained thrust.
- Boost power also tapers as fuel runs down, so high fuel gives stronger lift and low fuel becomes more hover/slow-fall than full lift.
- Ignatius now stands still when idle: both feet stay on the ground and the arm/leg run cycle stops.
- Ignatius stands nearly upright when idle and leans a little more when running.
- The tuning panel is collapsible.
- The current tuning block is shown as editable JSON in a textbox, with Apply, Copy, and Refresh buttons.
- A temporary homing target dot was added for Phase 1 rocket testing.
- Pressing Space launches a simple homing rocket toward the dot.
- The rocket sprite is drawn in flight.
- Rocket flame and spark particles are drawn during attached boost and launched rocket flight.

## Tuning JSON

The JSON textarea shows only `gameState.tuning`. This is usually the part you want to copy when you find a feel that works. The full game state can still be exported with `E`.

## OCR note

The available image in this run was a blank white image with a red square, so no slider numbers could be extracted from it. The Phase 1.001 defaults therefore start from the previous tuned values and add the new boost / homing fields.

## Phase 1.002 changes

- The boost kick is now a separate charge on `gameState.equipment.rocket.boostKickCharge`.
- Starting the attached rocket consumes the kick charge immediately.
- Rapid tap/restart attempts can sustain boost if fuel remains, but do not receive another full kick or charged burst.
- The kick charge recharges first after `rechargeDelayAfterUse` reaches zero.
- The launched test rocket starts straight upward for `rocketProjectileUpLaunchSeconds`, then homes toward the debug dot.
- The launched rocket now draws a long sparkling trail, roughly one third of the screen.
- Tuning JSON remains available in the collapsible panel.

## Test

```bash
node testbench.mjs
```
