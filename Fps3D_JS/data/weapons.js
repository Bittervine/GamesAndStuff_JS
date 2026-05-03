export const WEAPON_ORDER = [
  'pistol',
  'shotgun',
  'superShotgun',
  'chaingun',
  'rocketLauncher',
  'plasmaRifle',
  'bfg9000'
];

export const WEAPON_DEFS = {
  pistol: {
    id: 'pistol',
    name: 'Pistol',
    ammoType: 'bullet',
    ammoCost: 1,
    type: 'hitscan',
    pellets: 1,
    damage: 14,
    spread: 0.008,
    fireDelayMs: 220,
    range: 42,
    recoil: 0.05,
    color: '#f0c08a'
  },
  shotgun: {
    id: 'shotgun',
    name: 'Shotgun',
    ammoType: 'shell',
    ammoCost: 1,
    type: 'hitscan',
    pellets: 7,
    damage: 9,
    spread: 0.045,
    fireDelayMs: 750,
    range: 34,
    recoil: 0.16,
    color: '#e0b07f'
  },
  superShotgun: {
    id: 'superShotgun',
    name: 'Super Shotgun',
    ammoType: 'shell',
    ammoCost: 2,
    type: 'hitscan',
    pellets: 14,
    damage: 7,
    spread: 0.058,
    fireDelayMs: 950,
    range: 31,
    recoil: 0.24,
    color: '#cc9871'
  },
  chaingun: {
    id: 'chaingun',
    name: 'Chaingun',
    ammoType: 'bullet',
    ammoCost: 1,
    type: 'hitscan',
    pellets: 1,
    damage: 8,
    spread: 0.024,
    fireDelayMs: 90,
    range: 44,
    recoil: 0.04,
    color: '#c0c0c0'
  },
  rocketLauncher: {
    id: 'rocketLauncher',
    name: 'Rocket Launcher',
    ammoType: 'rocket',
    ammoCost: 1,
    type: 'projectile',
    damage: 95,
    splashRadius: 2.75,
    speed: 14,
    projectileRadius: 0.12,
    lifeMs: 5000,
    fireDelayMs: 1000,
    range: 64,
    recoil: 0.34,
    color: '#ff8a4f'
  },
  plasmaRifle: {
    id: 'plasmaRifle',
    name: 'Plasma Rifle',
    ammoType: 'cell',
    ammoCost: 1,
    type: 'projectile',
    damage: 18,
    splashRadius: 0.3,
    speed: 26,
    projectileRadius: 0.08,
    lifeMs: 2500,
    fireDelayMs: 110,
    range: 52,
    recoil: 0.08,
    color: '#64d8ff'
  },
  bfg9000: {
    id: 'bfg9000',
    name: 'BFG 9000',
    ammoType: 'cell',
    ammoCost: 40,
    type: 'projectile',
    damage: 240,
    splashRadius: 7.5,
    speed: 18,
    projectileRadius: 0.16,
    lifeMs: 3600,
    fireDelayMs: 1450,
    range: 56,
    recoil: 0.45,
    color: '#58ff95'
  }
};

export function getWeaponDef(weaponId) {
  return WEAPON_DEFS[weaponId] || WEAPON_DEFS.pistol;
}
