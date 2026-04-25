export const LEVEL_ALPHA01 = {
  id: 'alpha01',
  name: 'Foundry Breach',
  ambientLight: 0.24,
  skyColor: '#4d6f96',
  spawnYaw: 0.2,
  spawn: {
    x: 4.2,
    z: 4.0,
    yaw: 0.2
  },
  exit: {
    x: 17.2,
    z: 8.5
  },
  sectors: [
    {
      id: 'main-floor',
      name: 'Main Foundry Floor',
      floor: {
        base: 0,
        slopeX: 0.02,
        slopeZ: -0.01
      },
      ceiling: {
        base: 3.2,
        slopeX: 0.005,
        slopeZ: 0.0
      },
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [0, 0],
        [8, -2],
        [16, 0],
        [21, 5],
        [18, 12],
        [10, 15],
        [3, 13],
        [-2, 7]
      ]
    }
  ],
  enemySpawns: [
    { kind: 'zombie', x: 7.4, z: 4.6 },
    { kind: 'imp', x: 11.2, z: 6.2 },
    { kind: 'demon', x: 14.0, z: 8.7 },
    { kind: 'chaingunner', x: 9.4, z: 10.8 },
    { kind: 'cacodemon', x: 16.1, z: 5.7 },
    { kind: 'baron', x: 13.6, z: 11.8 }
  ],
  pickups: [
    { kind: 'health', amount: 25, x: 5.4, z: 9.2 },
    { kind: 'armor', amount: 25, x: 12.2, z: 3.8 },
    { kind: 'ammo', ammoType: 'shell', amount: 8, x: 15.4, z: 9.8 },
    { kind: 'ammo', ammoType: 'rocket', amount: 4, x: 8.8, z: 12.2 },
    { kind: 'ammo', ammoType: 'cell', amount: 24, x: 17.4, z: 7.2 }
  ]
};

