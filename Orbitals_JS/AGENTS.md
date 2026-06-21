- Maintain clean separation between presentaion layer (Orbitals_JS.html and Orbitals_JS.js) and game logic/behavior (Orbitals_Sim.js)
- Renderer-owned Three.js objects must live in renderer-side view maps; never attach `root`, `visual`, `model`, `modelPivot`, `engineEffects`, `glow`, or similar handles to simulation state.
- Maintain the testbench orbitals_testbench.mjs
- For this folder, Playwright may only be used on expressed permission. The testbench shall be used instead.
- No magic numbers! All constants that accept gameplay shall be in orbitals_config.js and this shall be the only definition! If individual testcases makes it absolutely neccesary to be able to change the parameters for a test, then go ahead and let the testcase reassign the values (then the config does not have to be const).

## Planned simulation subsystem map
- `sim/main.js`: future compatibility facade and explicit update order.
- `sim/state.js`: game-state shape, creation, and reset helpers.
- `sim/math.js`: shared math, RNG, basis, and vector helpers.
- `sim/world.js`: planets, fuel motes, and world motion.
- `sim/physics.js`: shared flight, atmosphere, capture, and terrain helpers.
- `sim/player.js`: player ship state, movement, fuel, firing, crash, and respawn.
- `sim/enemies.js`: enemy state, squads, AI, swarm behavior, and enemy damage.
- `sim/motherships.js`: mothership arrival, hold, release, exit, and squad helpers.
- `sim/encounters.js`: encounter director, presenters, objectives, and missions.
- `sim/projectiles.js`: projectile spawning, homing, collisions, and lifetime.
- `sim/pickups.js`: pickup spawning, drifting, collection, and expiration.
- `sim/weapons.js`: weapon pattern generation and upgrade rules.
- `sim/collisions.js`: ship, projectile, entity, terrain, and sun collision rules.
- `sim/spatial_hash.js`: dense-swarm broad-phase lookup helpers.
- `sim/effects.js`: simulation-side effect records.
- `sim/events.js`: event-log helpers and combat-log formatting.


## Current extraction status
- `sim/main.js` owns the deterministic update order through `stepGame()`.
- `sim/physics.js` is the sole shared ship-flight implementation. Do not duplicate flight integration in `player.js` or `enemies.js`.
- `sim/player.js` owns player lifecycle hooks; `sim/enemies.js` owns enemy family data and its flight wrapper.
- `sim/encounters.js` owns encounter creation, route entities, activation, presenter/objective budgets, mission outcomes, and encounter bookkeeping. Detailed presenter flight geometry remains behind its explicit service interface.
- The next Phase D ownership boundary is `sim/motherships.js`.
