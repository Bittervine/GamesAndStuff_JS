export const LEVEL_ALPHA01 = {
  id: 'alpha01',
  name: 'Foundry Labyrinth',
  ambientLight: 0.22,
  skyColor: '#4d6f96',
  spawnYaw: 0.2,
  spawn: {
    x: 4.0,
    z: 36.0,
    yaw: 0.2,
    sector: 'west-room'
  },
  exit: {
    x: 82.0,
    z: 36.0
  },
  sectors: [
    {
      id: 'west-room',
      name: 'West Antechamber',
      floor: 0,
      ceiling: 3.05,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [8, 24],
        [8, 48],
        [2, 52],
        [0, 36],
        [2, 20]
      ],
      portals: [
        { edge: 0, to: 'west-corridor-2' }
      ]
    },
    {
      id: 'west-corridor-2',
      name: 'West S-curve',
      floor: 0,
      ceiling: 3.12,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [8, 24],
        [16, 28],
        [16, 44],
        [8, 48]
      ],
      portals: [
        { edge: 1, to: 'west-corridor-1' },
        { edge: 3, to: 'west-room' }
      ]
    },
    {
      id: 'west-corridor-1',
      name: 'West Connector',
      floor: 0,
      ceiling: 3.2,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [16, 28],
        [24, 32],
        [24, 40],
        [16, 44]
      ],
      portals: [
        { edge: 1, to: 'central-nexus' },
        { edge: 3, to: 'west-corridor-2' }
      ]
    },
    {
      id: 'central-nexus',
      name: 'Central Nexus',
      floor: 0,
      ceiling: 3.4,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [32, 24],
        [48, 24],
        [56, 32],
        [56, 40],
        [48, 48],
        [32, 48],
        [24, 40],
        [24, 32]
      ],
      portals: [
        { edge: 0, to: 'north-corridor-1' },
        { edge: 2, to: 'east-corridor-1' },
        { edge: 4, to: 'south-corridor-1' },
        { edge: 6, to: 'west-corridor-1' }
      ]
    },
    {
      id: 'north-corridor-1',
      name: 'North Connector',
      floor: 0,
      ceiling: 3.18,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [32, 24],
        [48, 24],
        [46, 16],
        [34, 16]
      ],
      portals: [
        { edge: 0, to: 'central-nexus' },
        { edge: 2, to: 'north-corridor-2' }
      ]
    },
    {
      id: 'north-corridor-2',
      name: 'North S-curve',
      floor: 0,
      ceiling: 3.12,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [34, 16],
        [46, 16],
        [50, 10],
        [30, 10]
      ],
      portals: [
        { edge: 0, to: 'north-corridor-1' },
        { edge: 2, to: 'north-room' }
      ]
    },
    {
      id: 'north-room',
      name: 'North Workshop',
      floor: 0,
      ceiling: 3.08,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [30, 10],
        [50, 10],
        [46, 2],
        [38, 0],
        [26, 2]
      ],
      portals: [
        { edge: 0, to: 'north-corridor-2' }
      ]
    },
    {
      id: 'east-corridor-1',
      name: 'East Connector',
      floor: 0,
      ceiling: 3.18,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [56, 32],
        [64, 28],
        [64, 44],
        [56, 40]
      ],
      portals: [
        { edge: 2, to: 'central-nexus' },
        { edge: 1, to: 'east-corridor-2' }
      ]
    },
    {
      id: 'east-corridor-2',
      name: 'East S-curve',
      floor: 0,
      ceiling: 3.12,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [64, 28],
        [72, 24],
        [72, 46],
        [64, 44]
      ],
      portals: [
        { edge: 1, to: 'east-round-room' },
        { edge: 3, to: 'east-corridor-1' }
      ]
    },
    {
      id: 'east-round-room',
      name: 'East Reactor',
      floor: 0,
      ceiling: 3.25,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [72, 24],
        [72, 46],
        [80, 52],
        [88, 46],
        [90, 36],
        [88, 26],
        [80, 20]
      ],
      portals: [
        { edge: 0, to: 'east-corridor-2' }
      ]
    },
    {
      id: 'south-corridor-1',
      name: 'South Connector',
      floor: 0,
      ceiling: 3.15,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [32, 48],
        [48, 48],
        [46, 56],
        [34, 56]
      ],
      portals: [
        { edge: 0, to: 'central-nexus' },
        { edge: 2, to: 'south-corridor-2' }
      ]
    },
    {
      id: 'south-corridor-2',
      name: 'South S-curve',
      floor: 0,
      ceiling: 3.1,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [34, 56],
        [46, 56],
        [50, 64],
        [30, 64]
      ],
      portals: [
        { edge: 0, to: 'south-corridor-1' },
        { edge: 2, to: 'south-room' }
      ]
    },
    {
      id: 'south-room',
      name: 'South Vault',
      floor: 0,
      ceiling: 3.05,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [30, 64],
        [50, 64],
        [46, 72],
        [38, 74],
        [26, 72]
      ],
      portals: [
        { edge: 0, to: 'south-corridor-2' }
      ]
    }
  ],
  doors: [
    {
      id: 'east-gate',
      name: 'East Gate',
      edge: {
        sectorId: 'east-corridor-2',
        edgeIndex: 1
      }
    }
  ],
  enemySpawns: [
    { kind: 'zombie', x: 4.0, z: 36.0 },
    { kind: 'imp', x: 12.0, z: 36.0 },
    { kind: 'demon', x: 20.0, z: 36.0 },
    { kind: 'chaingunner', x: 40.0, z: 36.0 },
    { kind: 'imp', x: 40.0, z: 20.0 },
    { kind: 'cacodemon', x: 40.0, z: 6.0 },
    { kind: 'baron', x: 68.0, z: 36.0 },
    { kind: 'zombie', x: 82.0, z: 36.0 },
    { kind: 'demon', x: 40.0, z: 60.0 },
    { kind: 'baron', x: 40.0, z: 70.0 }
  ],
  pickups: [
    { kind: 'health', amount: 25, x: 4.8, z: 34.0 },
    { kind: 'armor', amount: 25, x: 20.0, z: 34.0 },
    { kind: 'ammo', ammoType: 'shell', amount: 8, x: 40.0, z: 36.0 },
    { kind: 'ammo', ammoType: 'rocket', amount: 4, x: 40.0, z: 6.0 },
    { kind: 'ammo', ammoType: 'cell', amount: 24, x: 82.0, z: 36.0 },
    { kind: 'key', key: 'yellow', x: 40.0, z: 70.0 },
    { kind: 'health', amount: 25, x: 40.0, z: 20.0 },
    { kind: 'ammo', ammoType: 'bullet', amount: 40, x: 12.0, z: 40.0 }
  ]
};
