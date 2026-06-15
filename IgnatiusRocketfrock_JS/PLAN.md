# Ignatius Rocketfrock Plan

This is the punch list of things from the chat that are still only partially done or still need final cleanup.

- [ ] Rebuild the rocket system from a clean state machine.
  - The current rocket implementation is too tangled and should be replaced instead of patched further.
  - Use explicit phases: `attached`, `inactive/respawning`, `aiming`, `boosting`, `projectile`.
  - The rocket must never keep flaming or previewing when it is idle.

- [ ] Make wizard motion Newtonian.
  - The wizard should move with mass, inertia, and gravity.
  - Rocket thrust should act like a force on the wizard, not a fake one-off launch.
  - Firing at jump apex should still add velocity naturally.


- [ ] Rebuild controls around the intended rocket jump behavior.
  - `Up`: jump when grounded; while airborne and the rocket is attached, it should act like a double-jump style rocket boost.
  - The boost should require a release and press again to ignite.
  - Releasing the jump button while boosting will stop the boost (and conserve any rocket fuel that is left). It shall be possible to press `Up` again and switch the rocket back on provided there is fuel left.

- [ ] Rebuild controls around the intended rocket launch behavior.
  - `Space`: works from the ground, slows time, and enters rocket targeting mode.
  - While targeting draw an parabola represenging eh path the rocket will take.
  - The parabola will start narrow and low and widen as long as `Space` is held.
  - Releasing `Space` fires the rocket as a projectile along the path
  - Gamepad `A` maps to `Up`, `B` maps to `Space`.

- [ ] Fix the targeting arc and projectile flight.
  - The arc should start straight up.
  - Longer `Space` holds should move the landing point farther away.
  - The preview arc and the real projectile path should match closely.
  - The rocket nose should always point along its current travel direction.

- [ ] Fix rocket respawn and fuel timing.
  - The rocket should not respawn immediately after use.
  - The fuel gauge should stay empty right after use and only start filling after about 2 seconds of rocket inactivity.
  - The gauge should represent real rocket availability.

- [ ] Remove the leftover hidden UI/panel markup from `game.html`.
  - The page is fullscreen now, but the old sidebar and control blocks still live in the DOM and styles.

- [ ] Finalize movement feel.
  - The ground speed, inertia, and foot cadence are close, but still need playtest tuning so the wizard feels fast without sliding.

- [ ] Verify gamepad input in-browser.
  - Confirm left, right, and primary-action mapping on a real controller.
  - Check d-pad and button edge cases.
