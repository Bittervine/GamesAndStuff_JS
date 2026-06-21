# Orbitals JS Simulation Subsystems

`../Orbitals_Sim.js` remains the stable public compatibility facade. Implementation is moving into these modules one subsystem at a time, with behavior preserved by `../orbitals_testbench.mjs`.

## Active low-risk modules

- `math.js`: deterministic RNG, scalar helpers, vector bases, and shuffling.
- `events.js`: event-log insertion and combat-log formatting.
- `world.js`: planet creation and motion, separation, nearest-planet queries, and fuel motes.
- `projectiles.js`: projectile spawning, guidance, movement, and hit checks.
- `effects.js`: simulation-side explosion records and lifetime cleanup.
- `state.js`: gameplay-state factories and reset helpers.

## Active Phase D modules

- `physics.js`: the single shared implementation for atmosphere lift, free-space gravity, capture transitions, speed limits, terrain guards, steering, and ship integration.
- `player.js`: player lifecycle, respawn, crash handling, and the player-facing flight wrapper.
- `enemies.js`: enemy model-family data and the enemy-facing flight wrapper.
- `collisions.js`: active ship-collision rules.
- `main.js`: the explicit deterministic frame order used by the compatibility facade.

## Remaining Phase D extractions

- `encounters.js` and `motherships.js` are the next large ownership boundaries still implemented in `../Orbitals_Sim.js`.
- `pickups.js`, `weapons.js`, and `spatial_hash.js` remain reserved for their gameplay phases.

Keep gameplay tuning in `../orbitals_config.js`. Do not add renderer-owned objects, Three.js groups, DOM nodes, audio nodes, or other presentation handles to simulation state. Use stable gameplay IDs and renderer-side maps instead.
