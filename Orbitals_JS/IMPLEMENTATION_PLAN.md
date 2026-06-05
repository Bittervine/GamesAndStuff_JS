# Orbitals_JS Implementation Plan

## Goal
Build a browser-based 3D space shooter in HTML + JavaScript using THREE.js, with a chase camera behind `player_spaceship.glb`, 6-9 nearby planets in chaotic but believable orbit, atmospheric flight behavior, and orbiting enemies that can transfer between planets.

## Available Assets
- `assets/player_spaceship.glb`
- `assets/planet_map_01.glb` through `assets/planet_map_21.glb`
- Additional ship models in `assets/`

## Build Order

### 1. Project Skeleton
- [x] Add the Orbitals launcher tile to `GamesAndStuff_JS.html`.
- [x] Create the HTML entrypoint for `Orbitals_JS`.
- [x] Add the main JS boot file and wire THREE.js loading.
- [x] Load the player ship model and a small test scene.
- [x] Add a basic render loop, resize handling, and debug overlay.

### 1.5 Launch Verification
- [ ] Add a browser smoke test that waits for Orbitals ready state and records the seed, planet count, and HUD text.
- [ ] Verify repeated launches with the same seed reproduce the same planet cluster and starting ship orbit.

### 2. Planet Motion First
- [x] Build a deterministic planet system with 6-9 planets.
- [ ] Use orbital paths that look natural but stay stable over time.
- [ ] Add soft separation logic so planets never visibly collide.
- [ ] Verify minimum separation over long simulation runs.

### 3. Camera and Player Flight
- [x] Add a chase camera behind and slightly above the player ship.
- [x] Support yaw, pitch, roll, thrust, and braking.
- [x] Add a target reticle for aiming.
- [ ] Make movement feel consistent in orbit and in upper atmosphere.
- [ ] Verify camera lag, framing, and control responsiveness.

### 3.5 Upper Atmosphere Flight
- [x] Constrain the reticle to a 30 degree cone around the craft's motion.
- [ ] Keep the player ship in a planet-relative orbital frame so it stays attached to the upper atmosphere band.
- [ ] Verify sustained no-input flight remains in the intended upper-atmosphere altitude range.

### 3.6 Planet Scale Tuning
- [x] Enlarge the planet bodies and orbital system substantially so planets dominate the screen.
- [x] Keep the atmosphere visually thin compared with the surface radius.
- [ ] Rebalance motion, gravity, and camera framing for the larger planetary scale.

### 3.7 Ship Alignment
- [x] Flip the player ship model pivot so the nose points in the direction of travel.
- [ ] Verify the ship remains readable in chase-camera views at multiple seeds and flight states.

### 3.8 Input Controls
- [x] Add gamepad input for aim, thrust, roll, boost, and brake.
- [x] Make mouse lock explicit so keyboard and gamepad play do not require pointer capture.
- [x] Verify keyboard and gamepad flight work while pointer lock stays off.

### 3.9 Upper Atmosphere Balance
- [x] Show craft-relative speed in the HUD instead of noisy world-frame cluster speed.
- [ ] Verify the ship stays in a stable upper-atmosphere band across multiple seeds.
- [ ] Verify shallow atmosphere dips lift the ship back out while deep dives still remain possible.

### 3.10 Atmospheric Fighter Reset
- [x] Replace the remaining orbital-style ship motion with atmospheric fighter controls in the local planet frame.
- [x] Verify keyboard steering, thrust, and boost feel responsive without pointer lock.
- [x] Verify the ship can be kept in the upper atmosphere band without drifting into the surface.
- [x] Verify shallow dives skip upward and deliberate dives can still crash.

### 3.11 Atmosphere Presentation and Handling
- [x] Increase the atmosphere shell resolution so the glow reads smooth instead of blocky.
- [x] Keep the chase camera almost straight behind the ship and only slightly above it.
- [x] Make the upper-atmosphere control feel immediate enough to be usable without pointer lock.
- [x] Verify casual drops are caught by the atmosphere before the surface is reached.

### 4. Atmosphere Rules
- [ ] Implement upper-atmosphere fuel particle collection.
- [ ] If the ship dips too low by accident, bounce it back upward.
- [ ] If the player commits to a deep dive, allow a real crash.
- [ ] If the ship pulls too high, reduce thrust so it falls back toward the atmosphere.
- [ ] Diving into the atmosphere should pick up speed - pulling up should reduce speed.
- [ ] When planets are reasonably close a pull upp and a boost on the engine (doubleclicking is played with mouse, seprate button if played with controller, separate key if player with keybaord) would give the player enough speed to reach the gravtational influence of another planet.
- [ ] Verify each atmosphere behavior with scripted movement cases.

### 5. Enemy Orbiting
- [ ] Do not start adding enemies until we have sorted out orbits, athmosphere rules and how to move unto other planets and user has approved and given thumbs up to add enemies.
- [ ] Spawn enemy ships orbiting planets.
- [ ] Make enemies transfer from one planet to another when planets approach.
- [ ] Keep enemy movement separate from planet motion so both systems remain stable.
- [ ] Verify enemies can stay in orbit and transition cleanly.

### 6. Combat Loop
- [ ] Add reticle targeting and shooting.
- [ ] Add enemy damage, destruction, and simple scoring.
- [ ] Add fuel usage, pickups, and basic fail conditions.
- [ ] Add minimal HUD feedback for health, fuel, and target status.

### 7. Content and Polish
- [ ] Add planet variety using the provided planet assets.
- [ ] Add skybox or starfield atmosphere.
- [ ] Add sound, VFX, and impact feedback.
- [ ] Tune the visual style so the orbit-heavy fights are easy to read.

## Acceptance Criteria
- [ ] The game runs in a browser with THREE.js.
- [ ] The player ship uses a chase camera and feels controllable.
- [ ] The player ship stays in the upper atmosphere unless the pilot commits to a dive.
- [ ] Planets move in believable orbit and do not visibly collide.
- [ ] The ship bounces from casual low-altitude dips but can still crash with deliberate diving.
- [ ] Enemies orbit planets and can transfer orbit cleanly.
- [ ] Fuel particles are only collectible in the upper atmosphere.
- [ ] Core systems are verified with deterministic smoke tests.

## Verification Plan
- [ ] Add a deterministic simulation test for planet separation.
- [ ] Add a camera/control smoke test for the player ship.
- [ ] Add atmosphere tests for bounce, stall, and crash behavior.
- [ ] Add enemy orbit-transfer smoke tests later, once the core orbit system is stable.

## Notes
- Start with planet motion and camera only.
- Keep the first implementation lightweight and readable.
- Prefer believable motion over exact physics if the exact solution is too fragile.
- Do not start enemy or combat work until the orbit and atmosphere feel correct.
