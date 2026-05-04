export const LEVEL_ALPHA01 = {
  id: 'alpha01',
  name: 'Foundry Crossroads',
  ambientLight: 0.24,
  skyColor: '#4d6f96',
  spawnYaw: 0.2,
  spawn: {
    x: 2.2,
    z: 10.0,
    yaw: 0.2
  },
  exit: {
    x: 18.0,
    z: 10.0
  },
  sectors: [
    {
      id: 'west-room',
      name: 'West Room',
      floor: 0,
      ceiling: 3.2,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [0, 8],
        [4, 8],
        [4, 14],
        [0, 14]
      ],
      portals: [
        { edge: 1, to: 'west-hall' }
      ]
    },
    {
      id: 'west-hall',
      name: 'West Hall',
      floor: 0,
      ceiling: 3.25,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [4, 8],
        [8, 8],
        [8, 14],
        [4, 14]
      ],
      portals: [
        { edge: 1, to: 'hub' },
        { edge: 3, to: 'west-room' }
      ]
    },
    {
      id: 'hub',
      name: 'Central Hub',
      floor: 0,
      ceiling: 3.4,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [8, 8],
        [12, 8],
        [12, 14],
        [8, 14]
      ],
      portals: [
        { edge: 0, to: 'north-hall' },
        { edge: 1, to: 'east-hall' },
        { edge: 2, to: 'south-hall' },
        { edge: 3, to: 'west-hall' }
      ]
    },
    {
      id: 'east-hall',
      name: 'East Hall',
      floor: 0,
      ceiling: 3.25,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [12, 8],
        [16, 8],
        [16, 14],
        [12, 14]
      ],
      portals: [
        { edge: 1, to: 'east-room' },
        { edge: 3, to: 'hub' }
      ]
    },
    {
      id: 'east-room',
      name: 'East Foundry',
      floor: 0,
      ceiling: 3.25,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [16, 8],
        [20, 8],
        [20, 14],
        [16, 14]
      ],
      portals: [
        { edge: 3, to: 'east-hall' }
      ]
    },
    {
      id: 'north-hall',
      name: 'North Hall',
      floor: 0,
      ceiling: 3.15,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [8, 4],
        [12, 4],
        [12, 8],
        [8, 8]
      ],
      portals: [
        { edge: 0, to: 'north-room' },
        { edge: 2, to: 'hub' }
      ]
    },
    {
      id: 'north-room',
      name: 'North Office',
      floor: 0,
      ceiling: 3.05,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [8, 0],
        [12, 0],
        [12, 4],
        [8, 4]
      ],
      portals: [
        { edge: 2, to: 'north-hall' }
      ]
    },
    {
      id: 'south-hall',
      name: 'South Hall',
      floor: 0,
      ceiling: 3.1,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [8, 14],
        [12, 14],
        [12, 18],
        [8, 18]
      ],
      portals: [
        { edge: 0, to: 'hub' },
        { edge: 2, to: 'south-room' }
      ]
    },
    {
      id: 'south-room',
      name: 'South Reactor',
      floor: 0,
      ceiling: 3.0,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [8, 18],
        [12, 18],
        [12, 22],
        [8, 22]
      ],
      portals: [
        { edge: 0, to: 'south-hall' }
      ]
    }
  ],
  doors: [
    {
      id: 'east-gate',
      name: 'East Gate',
      edge: {
        sectorId: 'east-hall',
        edgeIndex: 1
      }
    }
  ],
  enemySpawns: [
    { kind: 'zombie', x: 5.4, z: 10.0 },
    { kind: 'imp', x: 9.2, z: 10.1 },
    { kind: 'demon', x: 10.0, z: 19.0 },
    { kind: 'chaingunner', x: 10.0, z: 2.0 },
    { kind: 'cacodemon', x: 18.0, z: 10.0 },
    { kind: 'baron', x: 10.0, z: 16.0 }
  ],
  pickups: [
    { kind: 'health', amount: 25, x: 2.0, z: 9.2 },
    { kind: 'armor', amount: 25, x: 6.5, z: 12.0 },
    { kind: 'ammo', ammoType: 'shell', amount: 8, x: 10.6, z: 9.2 },
    { kind: 'ammo', ammoType: 'rocket', amount: 4, x: 10.0, z: 15.4 },
    { kind: 'ammo', ammoType: 'cell', amount: 24, x: 18.0, z: 12.0 },
    { kind: 'key', key: 'yellow', x: 10.0, z: 19.0 }
  ]
};
