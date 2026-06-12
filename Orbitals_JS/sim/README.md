# Orbitals JS Simulation Subsystems

These files are scaffolds for the phased refactor in `../DEVELOPMENT_PLAN.md`.

Keep `../Orbitals_Sim.js` as the public compatibility facade while moving one subsystem at a time. Each extraction should preserve behavior, keep gameplay constants in `../orbitals_config.js`, and leave `../orbitals_testbench.mjs` runnable.

Do not add renderer-owned objects, Three.js groups, DOM nodes, audio nodes, or other presentation handles to simulation state. Use stable gameplay IDs and renderer-side maps instead.
