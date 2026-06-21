# Orbitals JS Simulation Subsystems

`../Orbitals_Sim.js` remains the stable public compatibility facade. Implementation is moving into these modules one subsystem at a time, with behavior preserved by `../orbitals_testbench.mjs`.

## Active low-risk modules

- `math.js`: deterministic RNG, scalar helpers, vector bases, and shuffling.
- `events.js`: event-log insertion and combat-log formatting.
- `world.js`: planet creation and motion, atmosphere/gravity helpers, and fuel motes.
- `projectiles.js`: projectile spawning, guidance, movement, and hit checks.
- `effects.js`: simulation-side explosion records and lifetime cleanup.
- `state.js`: gameplay-state factories and reset helpers.

## Partially extracted gameplay modules

- `player.js`, `enemies.js`, and `collisions.js` already own substantial behavior, but Phase D still has to make the central update path and ownership boundaries fully explicit.
- `encounters.js`, `motherships.js`, `physics.js`, `pickups.js`, `weapons.js`, `spatial_hash.js`, and `main.js` remain reserved for later phases.

Keep gameplay tuning in `../orbitals_config.js`. Do not add renderer-owned objects, Three.js groups, DOM nodes, audio nodes, or other presentation handles to simulation state. Use stable gameplay IDs and renderer-side maps instead.
