/*
 * Central deterministic simulation update order.
 *
 * Each subsystem callback receives the shared game state. The compatibility
 * facade supplies the current subsystem implementations while extraction
 * continues, keeping this file free of browser and renderer dependencies.
 */
export function stepGame(state, dt, controls, systems) {
  state.time += dt;
  state.frameIndex += 1;

  systems.updateWorld(state, dt, state.time);
  systems.updatePlayer(state, dt, controls);
  systems.updateEncounters(state, dt, state.time);
  systems.updateEnemies(state, dt, state.time);
  systems.updateMotherships(state, dt, state.time);
  systems.updateShipCollisions(state);
  systems.updateProjectiles(state, dt);
  systems.updatePickups(state, dt);
  systems.updateEffects(state, dt);
  systems.updateFuelMotes(state, dt, state.time);

  return state;
}
