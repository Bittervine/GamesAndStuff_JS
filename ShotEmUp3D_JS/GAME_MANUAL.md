# Thorium Gap Manual

## Goal

Survive each stage, score as much as possible, and defeat the boss at the end of every level.

## Core Flow

- Destroy enemies to score points and make pickups drop.
- Collect weapon wrenches to upgrade or switch weapons.
- Collect shields, bombs, rapid-fire, magnet, and score pickups as they appear.
- Each level ends with a boss battle.

## Weapons

The game has five weapon families. Each family has five tiers: `I`, `II`, `III`, `IIII`, and `V`.

### Dart

- Color: cyan
- Style: fast forward shots
- Tier notes:
  - `I`: basic straight shot
  - `II`: stronger center shot
  - `III`: starts adding side pressure
  - `IIII`: wider and heavier
  - `V`: strongest Dart form

### Twin

- Color: green
- Style: paired forward fire
- Tier notes:
  - `I`: dual shot
  - `II`: tighter and stronger
  - `III`: adds more pressure around center
  - `IIII`: wider spread
  - `V`: strongest Twin form

### Fan

- Color: yellow
- Style: spread shot
- Tier notes:
  - `I`: narrow fan
  - `II`: wider and stronger center
  - `III`: wider spread
  - `IIII`: heavy fan with stronger core
  - `V`: fullest fan pattern

### Rocket

- Color: blue
- Style: homing rockets
- Tier notes:
  - `I`: single guided rocket
  - `II`: adds side rockets
  - `III`: stronger guidance and damage
  - `IIII`: more rockets and wider coverage
  - `V`: strongest rocket pattern

### Beam

- Color: red
- Style: long narrow beam shots
- Tier notes:
  - `I`: single beam line
  - `II`: more beam pressure
  - `III`: heavier beam coverage
  - `IIII`: wider multi-line beam
  - `V`: strongest beam form

## Weapon Upgrades

- Picking up a wrench for the same weapon family upgrades that family by one tier.
- Picking up a wrench for a different family switches to that family and restores the last tier you earned for that family.
- Each weapon family remembers its own tier separately.
- If you have never used a family before, it starts at `I`.
- If a family is already at `V` and you pick up that same family again, one random weapon family is rolled.
- If the rolled family is at `I` or `II`, it gains one tier.
- If the rolled family is already `III` or higher, the overflow becomes a small score bonus.

Example:

- `Dart II -> Beam I`
- later `Beam III -> Dart II`

## Difficulty

### Easy

- This is the reference damage model.
- Player shots use full damage.

### Medium

- Player shots do half the Easy damage.

### Hard

- Player shots do one quarter the Easy damage.

## Weapon Wrench Drop Rate

- Level 1: 500% of the level 5 wrench drop rate.
- Levels 2 to 5: linearly reduce from level 1 down to the level 5 base rate.
- Level 5: the base wrench drop rate.
- Levels 6 to 13: linearly reduce from the level 5 base rate down to 10% of that base rate at level 13.

Weapon wrenches are also more common in the early game because the game is meant to let you build a weapon family faster near the start.

## Weapon Loss On Death

- When a life is lost, only the currently selected weapon family loses one tier.
- The other weapon families keep their stored tiers.
- That means switching back later restores the last tier earned for that family.

## Combo And Overdrive

- The combo counter increases every time you destroy an enemy.
- The combo timer window is short, so you must keep destroying enemies quickly to keep the chain alive.
- If you stop killing enemies for too long, the combo resets to `0`.
- At combo `3` and above, the game briefly shows a `COMBO +N` banner after each kill.
- At combo `9`, Overdrive triggers.
- When Overdrive triggers, the combo counter is cleared and the bonus state begins.
- Overdrive is a temporary power state that makes the game feel more intense and rewarding for a strong kill streak.


## Other Pickups

- `Rapid Fire`: temporarily lowers shot delay.
- `Shield`: adds a shield point, up to three. Each protects from a single hit and is then consumed.
- If you already have three shields, the pickup turns into a small score bonus instead.
- `Bomb`: adds a bomb, up to four.
- `Magnet`: pulls pickups toward the player for a short time.
- `Score`: bonus points.

## Lives And Respawn

- Losing a ship costs one life.
- The active weapon family loses one tier when a life is lost.
- Respawn takes a short time.
- The ship gets a temporary invulnerability window after respawn.
