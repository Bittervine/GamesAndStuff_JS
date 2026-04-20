# ShotEmUp3D_JS Layout

- Game manual: `GameManual.html`
- `ShotEmUp3D_JS.html` and `ShotEmUp_JS.js` stay in the project root.
- Runtime art and models live in `assets/`.
- Development-only source art and scripts live in `devel/`.
- Implementation plan and progress tracking: `IMPLEMENTATION_PLAN.md`

Runtime asset paths used by the game:
- `assets/players_spaceship.png`
- `assets/player_spaceship.glb`
- `assets/Thorium_Gap_title.png`
- `assets/Enemy_*.png`
- `assets/Boss_*.png`
- `assets/glow_e_*.png`

Development files:
- `devel/enemy_fighters_*.png`
- `devel/unpack_enemy_images.py`

You can paste this in the console for debugging weapons etc:
window.__shotemup.debugGiveWeapon('ROCKET', 5)
window.__shotemup.debugGiveWeapon('FAN', 5)
window.__shotemup.debugGiveWeapon('TWIN', 5)
window.__shotemup.debugGiveWeapon('DART', 5)
window.__shotemup.debugGiveWeapon('BEAM', 5)

Glow note for later:
- The effect that looked closest was drawn with `drawLayeredFalloffGlow()` in `ShotEmUp_JS.js`.
- It builds the glow from many concentric `drawSpriteCircle()` layers, not a single blur.
- The useful shape was made with a radius around `96 px`, `42` layers, a curve around `4.2`, and a small noise value around `1.0`.
- The actual structure was a very dim center and many thin outer rings, with each ring getting lower alpha as it moved outward.
- If we need to reproduce it later, start from `drawLayeredFalloffGlow(x, y, r, color, alpha, layers, curve, noise)` instead of the older broad halo helpers.

Glow candidate note:
- Pre-rendered PNG glow assets are generated from `devel/generate_glow_candidates.py`.
- They are 256x256 sprites stored directly under `assets/`.
- The script currently emits only the `E` falloff family in white, red, green, and pure-blue variants.
