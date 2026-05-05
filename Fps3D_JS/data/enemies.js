export const ENEMY_CHAR_MAP = {
  z: 'zombie',
  i: 'imp',
  d: 'demon',
  c: 'cacodemon',
  b: 'baron',
  g: 'chaingunner',
  m: 'boss'
};

export const ENEMY_DEFS = {
  zombie: {
    id: 'zombie',
    name: 'Trooper',
    model: 'humanoid',
    weaponModel: 'pistol',
    rig: {
      variant: 'humanoid',
      pose: {
        widthScale: 0.92,
        heightScale: 0.98
      }
    },
    hp: 36,
    radius: 0.34,
    height: 1.5,
    speed: 2.2,
    visionRange: 18,
    attackRange: 14,
    attackCooldownMs: 900,
    attackWindupMs: 150,
    behavior: 'hitscan',
    damage: 8,
    projectileSpeed: 0,
    color: '#8fb0ff',
    dropChance: 0.2
  },
  imp: {
    id: 'imp',
    name: 'Imp',
    model: 'humanoid',
    weaponModel: 'caster',
    rig: {
      variant: 'humanoid',
      pose: {
        widthScale: 0.88,
        heightScale: 1.05
      }
    },
    hp: 54,
    radius: 0.36,
    height: 1.65,
    speed: 1.85,
    visionRange: 20,
    attackRange: 16,
    attackCooldownMs: 1000,
    attackWindupMs: 190,
    behavior: 'projectile',
    damage: 10,
    projectileSpeed: 8.8,
    projectileRadius: 0.1,
    color: '#f3a06d',
    dropChance: 0.16
  },
  demon: {
    id: 'demon',
    name: 'Demon',
    model: 'quadruped',
    rig: {
      variant: 'quadruped',
      pose: {
        widthScale: 0.96,
        depthScale: 1.06,
        heightScale: 0.78
      }
    },
    hp: 80,
    radius: 0.52,
    height: 1.25,
    speed: 3.0,
    visionRange: 14,
    attackRange: 1.15,
    attackCooldownMs: 850,
    attackWindupMs: 0,
    behavior: 'melee',
    damage: 18,
    projectileSpeed: 0,
    color: '#d96ad9',
    dropChance: 0.14
  },
  cacodemon: {
    id: 'cacodemon',
    name: 'Cacodemon',
    model: 'floating',
    weaponModel: 'orb',
    rig: {
      variant: 'floating',
      pose: {
        widthScale: 1.04,
        heightScale: 0.96
      }
    },
    hp: 130,
    radius: 0.62,
    height: 1.6,
    speed: 1.35,
    visionRange: 22,
    attackRange: 18,
    attackCooldownMs: 1150,
    attackWindupMs: 220,
    behavior: 'projectile',
    damage: 14,
    projectileSpeed: 7.5,
    projectileRadius: 0.12,
    color: '#f05c63',
    dropChance: 0.24
  },
  baron: {
    id: 'baron',
    name: 'Baron',
    model: 'humanoid',
    weaponModel: 'cannon',
    rig: {
      variant: 'humanoid',
      pose: {
        widthScale: 1.08,
        heightScale: 1.14
      },
      mesh: {
        torso: {
          sides: 12,
          subdivisions: 4
        },
        head: {
          sides: 12
        }
      }
    },
    hp: 240,
    radius: 0.6,
    height: 1.95,
    speed: 1.4,
    visionRange: 24,
    attackRange: 19,
    attackCooldownMs: 1200,
    attackWindupMs: 240,
    behavior: 'projectile',
    damage: 22,
    projectileSpeed: 6.5,
    projectileRadius: 0.12,
    color: '#66d48d',
    dropChance: 0.3
  },
  chaingunner: {
    id: 'chaingunner',
    name: 'Chaingunner',
    model: 'humanoid',
    weaponModel: 'chaingun',
    rig: {
      variant: 'humanoid',
      pose: {
        widthScale: 0.95,
        heightScale: 1.0
      },
      weapon: {
        attackReachScale: 0.38,
        armLiftScale: 0.11
      }
    },
    hp: 66,
    radius: 0.33,
    height: 1.6,
    speed: 2.4,
    visionRange: 21,
    attackRange: 17,
    attackCooldownMs: 260,
    attackWindupMs: 90,
    behavior: 'hitscan',
    damage: 6,
    projectileSpeed: 0,
    color: '#dadada',
    dropChance: 0.25
  },
  boss: {
    id: 'boss',
    name: 'Boss',
    model: 'humanoid',
    weaponModel: 'bossCannon',
    rig: {
      variant: 'humanoid',
      pose: {
        widthScale: 1.16,
        heightScale: 1.30
      },
      mesh: {
        torso: {
          sides: 12,
          subdivisions: 4
        },
        head: {
          sides: 12
        }
      },
      weapon: {
        attackReachScale: 0.40,
        weaponLiftScale: 0.05
      }
    },
    hp: 1200,
    radius: 0.9,
    height: 2.55,
    speed: 1.0,
    visionRange: 28,
    attackRange: 24,
    attackCooldownMs: 850,
    attackWindupMs: 280,
    behavior: 'boss',
    damage: 24,
    projectileSpeed: 8.5,
    projectileRadius: 0.14,
    color: '#ffad3c',
    dropChance: 1
  }
};

export function getEnemyDef(kind) {
  return ENEMY_DEFS[kind] || ENEMY_DEFS.zombie;
}
