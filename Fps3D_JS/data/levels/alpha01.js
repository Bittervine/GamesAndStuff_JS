export const LEVEL_ALPHA01 = {
  id: 'alpha01',
  name: 'Foundry Labyrinth',
  theme: 'tech',
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
      floorMaterial: 'stoneFloor',
      ceilingMaterial: 'stoneCeiling',
      wallMaterial: 'stoneWall',
      theme: 'tech',
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
      floor: {
        base: 0.12,
        slopeZ: 0.015
      },
      ceiling: 3.42,
      floorMaterial: 'liquidFloor',
      ceilingMaterial: 'emissiveCeiling',
      wallMaterial: 'emissiveWall',
      theme: 'tech',
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
      floor: {
        base: 0.3,
        slopeX: 0.01
      },
      ceiling: 3.58,
      floorMaterial: 'stoneFloor',
      ceilingMaterial: 'stoneCeiling',
      wallMaterial: 'stoneWall',
      theme: 'tech',
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
      floor: {
        base: 0.58,
        slopeX: 0.01,
        slopeZ: 0.01
      },
      ceiling: 4.1,
      floorMaterial: 'organicFloor',
      ceilingMaterial: 'organicCeiling',
      wallMaterial: 'organicWall',
      theme: 'tech',
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
      floor: {
        base: 0.76,
        slopeZ: -0.02
      },
      ceiling: 4.08,
      floorMaterial: 'organicFloor',
      ceilingMaterial: 'emissiveCeiling',
      wallMaterial: 'damageWall',
      theme: 'tech',
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
      floor: {
        base: 1.0,
        slopeZ: -0.035
      },
      ceiling: 4.3,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'tech',
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
      floor: {
        base: 1.28,
        slopeX: -0.01,
        slopeZ: -0.02
      },
      ceiling: 4.62,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'tech',
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
      floor: {
        base: 0.5,
        slopeX: 0.01
      },
      ceiling: 4.9,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'industrial',
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
      floor: {
        base: 0.82,
        slopeX: 0.02,
        slopeZ: 0.01
      },
      ceiling: 5.4,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'industrial',
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
      floor: {
        base: 1.18,
        slopeX: 0.01,
        slopeZ: -0.01
      },
      ceiling: 5.95,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'industrial',
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
      floor: {
        base: 0.16,
        slopeZ: 0.02
      },
      ceiling: 4.9,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'industrial',
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
      floor: {
        base: 0.36,
        slopeZ: 0.04
      },
      ceiling: 5.3,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'industrial',
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
      floor: {
        base: 0.74,
        slopeX: -0.01,
        slopeZ: 0.03
      },
      ceiling: 5.8,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'industrial',
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
    },
    {
      id: 'maze-entry',
      name: 'Maze Entry',
      floor: {
        base: 0.92
      },
      ceiling: 5.98,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'industrial',
      loop: [
        [26, 72],
        [38, 74],
        [44, 82],
        [34, 88],
        [22, 82]
      ],
      portals: [
        { edge: 0, to: 'south-room' },
        { edge: 2, to: 'maze-bend-1' }
      ]
    },
    {
      id: 'maze-bend-1',
      name: 'Maze Bend One',
      floor: {
        base: 1.02
      },
      ceiling: 6.12,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'hell',
      loop: [
        [34, 88],
        [44, 82],
        [58, 86],
        [60, 96],
        [48, 100],
        [38, 98]
      ],
      portals: [
        { edge: 0, to: 'maze-entry' },
        { edge: 2, to: 'maze-switchback' }
      ]
    },
    {
      id: 'maze-switchback',
      name: 'Maze Switchback',
      floor: {
        base: 1.08
      },
      ceiling: 6.22,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'hell',
      loop: [
        [60, 96],
        [58, 86],
        [72, 88],
        [78, 98],
        [74, 108],
        [64, 110]
      ],
      portals: [
        { edge: 0, to: 'maze-bend-1' },
        { edge: 1, to: 'maze-side-nook' },
        { edge: 3, to: 'maze-turn-west' }
      ]
    },
    {
      id: 'maze-side-nook',
      name: 'Maze Nook',
      floor: {
        base: 1.14
      },
      ceiling: 6.28,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'hell',
      loop: [
        [58, 86],
        [72, 88],
        [68, 78],
        [58, 74],
        [50, 80]
      ],
      portals: [
        { edge: 0, to: 'maze-switchback' }
      ]
    },
    {
      id: 'maze-turn-west',
      name: 'Maze Turn West',
      floor: {
        base: 1.24
      },
      ceiling: 6.46,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'hell',
      loop: [
        [74, 108],
        [78, 98],
        [90, 100],
        [94, 110],
        [84, 118],
        [72, 114]
      ],
      portals: [
        { edge: 0, to: 'maze-switchback' },
        { edge: 3, to: 'maze-core' }
      ]
    },
    {
      id: 'maze-core',
      name: 'Maze Core',
      floor: {
        base: 1.34
      },
      ceiling: 7.92,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'hell',
      loop: [
        [94, 110],
        [84, 118],
        [90, 126],
        [100, 124],
        [104, 114]
      ],
      portals: [
        { edge: 0, to: 'maze-turn-west' }
      ]
    },
    {
      id: 'maze-stair-1',
      name: 'Maze Stair One',
      floor: {
        base: 1.48,
        slopeX: 0.01,
        slopeZ: 0.02
      },
      ceiling: 7.92,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'hell',
      loop: [
        [100, 124],
        [90, 126],
        [94, 134],
        [104, 136],
        [108, 130]
      ],
      portals: [
        { edge: 0, to: 'maze-core' },
        { edge: 2, to: 'maze-stair-2' }
      ]
    },
    {
      id: 'maze-stair-2',
      name: 'Maze Stair Two',
      floor: {
        base: 1.72,
        slopeX: 0.01,
        slopeZ: 0.02
      },
      ceiling: 8.24,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'hell',
      loop: [
        [104, 136],
        [94, 134],
        [96, 142],
        [106, 146],
        [114, 140]
      ],
      portals: [
        { edge: 0, to: 'maze-stair-1' },
        { edge: 2, to: 'maze-stair-3' }
      ]
    },
    {
      id: 'maze-stair-3',
      name: 'Maze Upper Landing',
      floor: {
        base: 1.98,
        slopeX: -0.01,
        slopeZ: 0.02
      },
      ceiling: 8.56,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      loop: [
        [106, 146],
        [96, 142],
        [94, 150],
        [102, 158],
        [112, 160],
        [120, 154]
      ],
      portals: [
        { edge: 0, to: 'maze-stair-2' }
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
  props: [
    { id: 'west-console', kind: 'console', x: 5.7, z: 36.0, width: 0.95, height: 1.05, depth: 0.42, rotation: Math.PI * 0.5, color: '#8b97a5', alpha: 1 },
    { id: 'west-crates-a', kind: 'crate', x: 2.8, z: 32.6, width: 0.68, height: 0.72, depth: 0.68, rotation: 0.28, color: '#7f5d3d' },
    { id: 'west-crates-b', kind: 'crate', x: 4.4, z: 41.2, width: 0.72, height: 0.78, depth: 0.72, rotation: -0.34, color: '#9a6e48' },
    { id: 'central-column-a', kind: 'column', x: 30.4, z: 33.4, width: 0.58, height: 2.15, depth: 0.58, rotation: 0, color: '#4f5f6d' },
    { id: 'central-reactor', kind: 'machine', x: 44.2, z: 36.0, width: 1.65, height: 1.5, depth: 1.65, rotation: 0.12, color: '#56707d' },
    { id: 'central-terminal', kind: 'console', x: 48.4, z: 28.8, width: 0.92, height: 1.0, depth: 0.38, rotation: -0.18, color: '#7d8f9d' },
    { id: 'north-pipes', kind: 'pipe', x: 39.8, z: 7.0, width: 1.45, height: 0.68, depth: 0.36, rotation: 0.05, color: '#6b7280' },
    { id: 'north-crates', kind: 'crate', x: 32.2, z: 4.1, width: 0.7, height: 0.74, depth: 0.7, rotation: -0.08, color: '#8d6742' },
    { id: 'east-turbine', kind: 'machine', x: 69.1, z: 35.8, width: 1.55, height: 1.35, depth: 1.55, rotation: 0.22, color: '#5e6d7b' },
    { id: 'east-console', kind: 'console', x: 80.0, z: 34.2, width: 0.9, height: 1.0, depth: 0.4, rotation: -0.2, color: '#94a3af' },
    { id: 'south-barrels', kind: 'barrel', x: 40.0, z: 52.9, width: 0.78, height: 0.92, depth: 0.78, rotation: 0.1, color: '#7d5239' },
    { id: 'south-spool', kind: 'machine', x: 44.7, z: 58.5, width: 1.0, height: 0.92, depth: 1.0, rotation: -0.12, color: '#677681' },
    { id: 'maze-column-a', kind: 'column', x: 36.6, z: 80.2, width: 0.52, height: 2.0, depth: 0.52, rotation: 0, color: '#495866' },
    { id: 'maze-column-b', kind: 'column', x: 63.2, z: 98.4, width: 0.52, height: 2.05, depth: 0.52, rotation: 0, color: '#495866' },
    { id: 'maze-core-statue', kind: 'statue', x: 93.6, z: 118.2, width: 0.9, height: 1.9, depth: 0.9, rotation: 0.4, color: '#6f4a60' },
    { id: 'maze-core-machine', kind: 'machine', x: 99.2, z: 120.2, width: 1.2, height: 1.2, depth: 1.2, rotation: -0.18, color: '#7b4350' }
  ],
  lights: [
    { id: 'west-light-a', kind: 'light', x: 6.4, z: 28.4, y: 2.65, width: 0.22, height: 0.14, depth: 0.22, color: '#ffe8ab', intensity: 1.15, pulse: 0.22 },
    { id: 'west-light-b', kind: 'light', x: 6.2, z: 44.8, y: 2.62, width: 0.22, height: 0.14, depth: 0.22, color: '#ffe8ab', intensity: 1.15, pulse: 0.28 },
    { id: 'nexus-light-a', kind: 'light', x: 31.8, z: 28.0, y: 3.15, width: 0.24, height: 0.16, depth: 0.24, color: '#a9dfff', intensity: 1.35, pulse: 0.35 },
    { id: 'nexus-light-b', kind: 'light', x: 48.6, z: 44.0, y: 3.18, width: 0.24, height: 0.16, depth: 0.24, color: '#a9dfff', intensity: 1.35, pulse: 0.48 },
    { id: 'north-light-a', kind: 'light', x: 39.2, z: 18.0, y: 3.4, width: 0.22, height: 0.16, depth: 0.22, color: '#f4efcf', intensity: 1.1, pulse: 0.16 },
    { id: 'north-light-b', kind: 'light', x: 40.2, z: 4.8, y: 3.4, width: 0.22, height: 0.16, depth: 0.22, color: '#ffb67d', intensity: 1.0, pulse: 0.24 },
    { id: 'east-light-a', kind: 'light', x: 66.2, z: 34.8, y: 4.1, width: 0.24, height: 0.16, depth: 0.24, color: '#b7f0ff', intensity: 1.35, pulse: 0.32 },
    { id: 'east-light-b', kind: 'light', x: 82.0, z: 36.6, y: 4.15, width: 0.24, height: 0.16, depth: 0.24, color: '#ffe4b6', intensity: 1.1, pulse: 0.41 },
    { id: 'south-light-a', kind: 'light', x: 40.2, z: 52.2, y: 4.0, width: 0.22, height: 0.16, depth: 0.22, color: '#ffd49b', intensity: 1.05, pulse: 0.18 },
    { id: 'maze-light-a', kind: 'light', x: 56.2, z: 88.2, y: 4.2, width: 0.22, height: 0.16, depth: 0.22, color: '#ffad74', intensity: 1.2, pulse: 0.55 },
    { id: 'maze-light-b', kind: 'light', x: 78.4, z: 106.4, y: 4.55, width: 0.22, height: 0.16, depth: 0.22, color: '#ff8f5d', intensity: 1.25, pulse: 0.65 },
    { id: 'maze-core-light', kind: 'light', x: 97.0, z: 118.0, y: 4.95, width: 0.26, height: 0.18, depth: 0.26, color: '#ff5e66', intensity: 1.45, pulse: 0.78 },
    { id: 'stair-light', kind: 'light', x: 105.2, z: 148.0, y: 5.55, width: 0.22, height: 0.16, depth: 0.22, color: '#dbf5ff', intensity: 1.1, pulse: 0.3 }
  ],
  decals: [
    { id: 'west-warning', kind: 'warning', x: 7.2, z: 35.0, width: 1.5, height: 0.02, depth: 0.24, rotation: 0.12, color: '#e7c65d', alpha: 0.68 },
    { id: 'central-scorch-a', kind: 'scorch', x: 39.8, z: 34.6, width: 1.35, height: 0.022, depth: 0.86, rotation: -0.32, color: '#3b2d2e', alpha: 0.72 },
    { id: 'central-scorch-b', kind: 'scorch', x: 44.0, z: 39.6, width: 1.1, height: 0.022, depth: 0.76, rotation: 0.38, color: '#372c2d', alpha: 0.66 },
    { id: 'north-sign', kind: 'warning', x: 40.0, z: 9.6, width: 1.7, height: 0.022, depth: 0.22, rotation: 0, color: '#f0b64f', alpha: 0.58 },
    { id: 'east-rust', kind: 'rust', x: 70.6, z: 37.6, width: 1.45, height: 0.02, depth: 0.56, rotation: 0.24, color: '#7a4633', alpha: 0.72 },
    { id: 'south-blood', kind: 'blood', x: 40.2, z: 61.6, width: 1.1, height: 0.02, depth: 0.76, rotation: -0.18, color: '#782828', alpha: 0.7 },
    { id: 'maze-warning-a', kind: 'warning', x: 34.2, z: 82.8, width: 1.6, height: 0.02, depth: 0.28, rotation: 0.26, color: '#e7c65d', alpha: 0.68 },
    { id: 'maze-scorch-a', kind: 'scorch', x: 57.0, z: 97.0, width: 1.24, height: 0.022, depth: 0.92, rotation: 0.14, color: '#31262a', alpha: 0.72 },
    { id: 'maze-glyph', kind: 'glyph', x: 95.0, z: 116.8, width: 1.48, height: 0.022, depth: 1.0, rotation: 0.38, color: '#7a2f43', alpha: 0.66 },
    { id: 'maze-stair-mark', kind: 'warning', x: 104.0, z: 137.6, width: 1.6, height: 0.02, depth: 0.3, rotation: -0.16, color: '#d6e6ef', alpha: 0.62 }
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
    { kind: 'baron', x: 40.0, z: 70.0 },
    { kind: 'imp', x: 50.0, z: 84.0 },
    { kind: 'demon', x: 76.0, z: 112.0 },
    { kind: 'chaingunner', x: 94.0, z: 120.0 }
  ],
  pickups: [
    { kind: 'health', amount: 25, x: 4.8, z: 34.0 },
    { kind: 'armor', amount: 25, x: 20.0, z: 34.0 },
    { kind: 'ammo', ammoType: 'shell', amount: 8, x: 40.0, z: 36.0 },
    { kind: 'ammo', ammoType: 'rocket', amount: 4, x: 40.0, z: 6.0 },
    { kind: 'ammo', ammoType: 'cell', amount: 24, x: 82.0, z: 36.0 },
    { kind: 'key', key: 'yellow', x: 40.0, z: 70.0 },
    { kind: 'health', amount: 25, x: 40.0, z: 20.0 },
    { kind: 'ammo', ammoType: 'bullet', amount: 40, x: 12.0, z: 40.0 },
    { kind: 'health', amount: 25, x: 56.0, z: 80.0 },
    { kind: 'ammo', ammoType: 'cell', amount: 24, x: 98.0, z: 122.0 },
    { kind: 'health', amount: 25, x: 106.0, z: 154.0 }
  ]
};
