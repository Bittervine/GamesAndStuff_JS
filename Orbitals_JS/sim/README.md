# Orbitals JS Simulation Subsystems

`../Orbitals_Sim.js` remains the stable public compatibility facade. Implementation is moving into these modules one subsystem at a time, with behavior preserved by `../orbitals_testbench.mjs`.

## Active low-risk modules

- `math.js`: deterministic RNG, scalar helpers, vector bases, and shuffling.
- `events.js`: event-log insertion and combat-log formatting.
- `world.js`: planet creation and motion, separation, nearest-planet queries, and fuel motes.
- `projectiles.js`: projectile spawning, guidance, movement, and hit checks.
- `effects.js`: simulation-side explosion records and lifetime cleanup.
- `state.js`: gameplay-state factories and reset helpers.
- `spatial_hash.js`: broad-phase cell lookup used by dense fighter patrol queries.

## Active Phase D modules

- `physics.js`: the single shared implementation for atmosphere lift, free-space gravity, capture transitions, speed limits, terrain guards, steering, and ship integration.
- `player.js`: player lifecycle, respawn, crash handling, and the player-facing flight wrapper.
- `enemies.js`: enemy model-family data, enemy damage, squad transitions, patrol steering, and presentation/objective flight.
- `collisions.js`: active ship-collision rules.
- `encounters.js`: encounter creation, route entities, activation, missions, presenter/objective budgets, outcomes, and encounter bookkeeping.
- `motherships.js`: mothership squad construction, deterministic spawning, approach, hold reorientation, fighter release, exit, and mothership-specific event records.
- `main.js`: the explicit deterministic frame order used by the compatibility facade.

## Remaining Phase D extractions

- `pickups.js` and `weapons.js` remain reserved for their gameplay phases.

Keep gameplay tuning in `../orbitals_config.js`. Do not add renderer-owned objects, Three.js groups, DOM nodes, audio nodes, or other presentation handles to simulation state. Use stable gameplay IDs and renderer-side maps instead.
