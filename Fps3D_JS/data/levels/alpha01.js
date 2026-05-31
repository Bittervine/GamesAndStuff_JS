import { createSeededRng, normalizeSeed } from '../../core/random/seededRng.js';

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
      locked: true,
      requiredKey: 'yellow',
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

export const LEVEL_TRAINING01 = {
  id: 'training01',
  name: 'Training Arena',
  ambientLight: 0.26,
  skyColor: '#6a7f9a',
  theme: 'tech',
  spawn: { x: 3.0, z: 3.0, yaw: 0 },
  exit: { x: 13.5, z: 13.5 },
  sectors: [
    {
      id: 'training-room',
      name: 'Training Room',
      floor: 0,
      ceiling: 4.5,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'tech',
      loop: [
        [0, 0],
        [16, 0],
        [16, 16],
        [0, 16]
      ]
    }
  ],
  props: [
    { id: 'training-console', kind: 'console', x: 8.0, z: 2.0, width: 0.9, height: 1.0, depth: 0.38, rotation: 0, color: '#7d8d9a' },
    { id: 'training-crate-a', kind: 'crate', x: 2.8, z: 11.4, width: 0.72, height: 0.78, depth: 0.72, rotation: 0.18, color: '#8c6546' },
    { id: 'training-crate-b', kind: 'crate', x: 12.8, z: 11.0, width: 0.68, height: 0.74, depth: 0.68, rotation: -0.22, color: '#7f5d3d' }
  ],
  lights: [
    { id: 'training-light-a', kind: 'light', x: 4.0, z: 4.0, y: 3.0, width: 0.22, height: 0.16, depth: 0.22, color: '#dff5ff', intensity: 1.2, pulse: 0.2 },
    { id: 'training-light-b', kind: 'light', x: 12.0, z: 12.0, y: 3.0, width: 0.22, height: 0.16, depth: 0.22, color: '#ffe4b6', intensity: 1.05, pulse: 0.16 }
  ],
  decals: [
    { id: 'training-warning', kind: 'warning', x: 8.0, z: 8.0, width: 1.5, height: 0.02, depth: 0.22, rotation: 0.12, color: '#e7c65d', alpha: 0.65 }
  ],
  enemySpawns: [
    { kind: 'zombie', x: 6.0, z: 6.0 },
    { kind: 'imp', x: 11.0, z: 6.0 }
  ],
  pickups: [
    { kind: 'health', amount: 25, x: 3.5, z: 12.0 },
    { kind: 'ammo', ammoType: 'bullet', amount: 40, x: 12.0, z: 3.5 }
  ]
};

export const LEVEL_COMBAT01 = {
  id: 'combat01',
  name: 'Combat Barracks',
  ambientLight: 0.21,
  skyColor: '#526472',
  theme: 'industrial',
  spawn: { x: 4.0, z: 9.0, yaw: 0 },
  exit: { x: 27.0, z: 9.0 },
  sectors: [
    {
      id: 'combat-bay',
      name: 'Combat Bay',
      floor: { base: 0.18, slopeX: 0.01 },
      ceiling: 5.0,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'industrial',
      loop: [
        [0, 6],
        [4, 0],
        [20, 0],
        [26, 6],
        [26, 12],
        [20, 18],
        [4, 18],
        [0, 12]
      ],
      portals: [
        { edge: 3, to: 'combat-wing' }
      ]
    },
    {
      id: 'combat-wing',
      name: 'Combat Wing',
      floor: { base: 0.32, slopeX: 0.01 },
      ceiling: 5.2,
      floorMaterial: 'metalFloor',
      ceilingMaterial: 'concreteCeiling',
      wallMaterial: 'steelWall',
      theme: 'industrial',
      loop: [
        [26, 6],
        [34, 6],
        [34, 12],
        [26, 12]
      ],
      portals: [
        { edge: 3, to: 'combat-bay' }
      ]
    }
  ],
  props: [
    { id: 'combat-machine-a', kind: 'machine', x: 8.4, z: 9.0, width: 1.4, height: 1.3, depth: 1.4, rotation: 0.14, color: '#5e6d7b' },
    { id: 'combat-machine-b', kind: 'machine', x: 21.0, z: 4.8, width: 1.2, height: 1.0, depth: 1.2, rotation: -0.16, color: '#677681' },
    { id: 'combat-crate-a', kind: 'crate', x: 30.2, z: 10.5, width: 0.74, height: 0.78, depth: 0.74, rotation: 0.22, color: '#8d6742' }
  ],
  lights: [
    { id: 'combat-light-a', kind: 'light', x: 6.0, z: 6.0, y: 3.5, width: 0.24, height: 0.16, depth: 0.24, color: '#b7f0ff', intensity: 1.2, pulse: 0.3 },
    { id: 'combat-light-b', kind: 'light', x: 18.0, z: 12.0, y: 3.6, width: 0.24, height: 0.16, depth: 0.24, color: '#ffe4b6', intensity: 1.1, pulse: 0.24 },
    { id: 'combat-light-c', kind: 'light', x: 30.0, z: 8.0, y: 3.7, width: 0.24, height: 0.16, depth: 0.24, color: '#dff5ff', intensity: 1.15, pulse: 0.26 }
  ],
  decals: [
    { id: 'combat-scorch-a', kind: 'scorch', x: 9.0, z: 10.0, width: 1.3, height: 0.022, depth: 0.88, rotation: -0.28, color: '#31262a', alpha: 0.74 },
    { id: 'combat-scorch-b', kind: 'scorch', x: 22.0, z: 9.0, width: 1.1, height: 0.022, depth: 0.72, rotation: 0.18, color: '#372c2d', alpha: 0.7 },
    { id: 'combat-warning', kind: 'warning', x: 28.0, z: 8.0, width: 1.5, height: 0.02, depth: 0.22, rotation: 0.04, color: '#f0b64f', alpha: 0.62 }
  ],
  enemySpawns: [
    { kind: 'zombie', x: 5.0, z: 9.0 },
    { kind: 'zombie', x: 8.5, z: 13.0 },
    { kind: 'imp', x: 12.0, z: 6.0 },
    { kind: 'imp', x: 16.0, z: 14.0 },
    { kind: 'demon', x: 10.0, z: 4.5 },
    { kind: 'demon', x: 14.0, z: 15.0 },
    { kind: 'chaingunner', x: 4.0, z: 15.0 },
    { kind: 'chaingunner', x: 29.0, z: 8.0 },
    { kind: 'cacodemon', x: 31.0, z: 10.0 },
    { kind: 'baron', x: 23.0, z: 9.5 },
    { kind: 'boss', x: 32.0, z: 9.0 }
  ],
  pickups: [
    { kind: 'health', amount: 25, x: 3.5, z: 3.5 },
    { kind: 'health', amount: 25, x: 13.0, z: 13.0 },
    { kind: 'ammo', ammoType: 'bullet', amount: 60, x: 18.0, z: 9.0 },
    { kind: 'ammo', ammoType: 'shell', amount: 12, x: 28.0, z: 6.0 },
    { kind: 'ammo', ammoType: 'cell', amount: 32, x: 28.0, z: 12.0 }
  ]
};

const ROGUE_CELL_SIZE = 4;
const ROGUE_GRID_WIDTH = 40;
const ROGUE_GRID_HEIGHT = 34;
const ROGUE_LAYOUT_RETRIES = 16;
const ROGUE_MAIN_ROOM_COUNT = 6;
const ROGUE_BRANCH_ROOM_COUNT = 3;
const ROGUE_MIN_PATH_LENGTH = 18;

const ROGUE_DIRECTIONS = [
  { name: 'north', dx: 0, dz: -1, edge: 0 },
  { name: 'east', dx: 1, dz: 0, edge: 1 },
  { name: 'south', dx: 0, dz: 1, edge: 2 },
  { name: 'west', dx: -1, dz: 0, edge: 3 }
];

const ROGUE_THEME_VARIANTS = [
  {
    theme: 'tech',
    skyColor: '#546f95',
    ambientLight: 0.24,
    roomMaterials: {
      floor: 'stoneFloor',
      ceiling: 'stoneCeiling',
      wall: 'stoneWall'
    },
    corridorMaterials: {
      floor: 'metalFloor',
      ceiling: 'concreteCeiling',
      wall: 'steelWall'
    },
    specialMaterials: {
      floor: 'organicFloor',
      ceiling: 'emissiveCeiling',
      wall: 'damageWall'
    }
  },
  {
    theme: 'industrial',
    skyColor: '#5a6672',
    ambientLight: 0.22,
    roomMaterials: {
      floor: 'metalFloor',
      ceiling: 'concreteCeiling',
      wall: 'steelWall'
    },
    corridorMaterials: {
      floor: 'stoneFloor',
      ceiling: 'stoneCeiling',
      wall: 'stoneWall'
    },
    specialMaterials: {
      floor: 'metalFloor',
      ceiling: 'emissiveCeiling',
      wall: 'damageWall'
    }
  },
  {
    theme: 'hell',
    skyColor: '#67484f',
    ambientLight: 0.18,
    roomMaterials: {
      floor: 'organicFloor',
      ceiling: 'organicCeiling',
      wall: 'organicWall'
    },
    corridorMaterials: {
      floor: 'liquidFloor',
      ceiling: 'emissiveCeiling',
      wall: 'emissiveWall'
    },
    specialMaterials: {
      floor: 'stoneFloor',
      ceiling: 'emissiveCeiling',
      wall: 'damageWall'
    }
  }
];

function rogueCellKey(x, z) {
  return `${x},${z}`;
}

function rogueWithinBounds(x, z) {
  return x >= 1 && z >= 1 && x < (ROGUE_GRID_WIDTH - 1) && z < (ROGUE_GRID_HEIGHT - 1);
}

function rogueClamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rogueRotateOffset(offset, turns) {
  const normalized = ((turns % 4) + 4) % 4;
  const dx = offset[0];
  const dz = offset[1];
  if (normalized === 0) {
    return [dx, dz];
  }
  if (normalized === 1) {
    return [dz, -dx];
  }
  if (normalized === 2) {
    return [-dx, -dz];
  }
  return [-dz, dx];
}

function rogueRotateDirection(direction, turns) {
  const order = ['north', 'east', 'south', 'west'];
  const normalized = ((turns % 4) + 4) % 4;
  const index = order.indexOf(direction);
  if (index < 0) {
    return direction;
  }
  return order[(index + normalized) % order.length];
}

function rogueDirectionVector(direction) {
  return ROGUE_DIRECTIONS.find((entry) => entry.name === direction) || ROGUE_DIRECTIONS[0];
}

function rogueOppositeDirection(direction) {
  return rogueRotateDirection(direction, 2);
}

function rogueEdgeIndex(direction) {
  return rogueDirectionVector(direction).edge;
}

function rogueCellCenter(x, z) {
  return {
    x: (x * ROGUE_CELL_SIZE) + (ROGUE_CELL_SIZE * 0.5),
    z: (z * ROGUE_CELL_SIZE) + (ROGUE_CELL_SIZE * 0.5)
  };
}

function rogueCellLoop(x, z) {
  const px = x * ROGUE_CELL_SIZE;
  const pz = z * ROGUE_CELL_SIZE;
  const s = ROGUE_CELL_SIZE;
  return [
    [px, pz],
    [px + s, pz],
    [px + s, pz + s],
    [px, pz + s]
  ];
}

function rogueBuildRectCells(width, height) {
  const cells = [];
  const halfWidth = Math.floor(width / 2);
  const halfHeight = Math.floor(height / 2);
  for (let dz = -halfHeight; dz <= halfHeight; dz += 1) {
    for (let dx = -halfWidth; dx <= halfWidth; dx += 1) {
      cells.push([dx, dz]);
    }
  }
  return cells;
}

function rogueBuildOctagonCells(radius = 2) {
  const cells = [];
  for (let dz = -radius; dz <= radius; dz += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      if (Math.abs(dx) === radius && Math.abs(dz) === radius) {
        continue;
      }
      cells.push([dx, dz]);
    }
  }
  return cells;
}

function rogueBuildCrossCells(radius = 2) {
  const cells = [];
  for (let dz = -radius; dz <= radius; dz += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      if (dx === 0 || dz === 0) {
        cells.push([dx, dz]);
      }
    }
  }
  return cells;
}

function rogueBuildCardinalConnectors(radiusX, radiusZ) {
  return [
    { direction: 'north', offset: [0, -radiusZ] },
    { direction: 'east', offset: [radiusX, 0] },
    { direction: 'south', offset: [0, radiusZ] },
    { direction: 'west', offset: [-radiusX, 0] }
  ];
}

function rogueMakeTemplate(id, cells, connectors, axis = 'any') {
  return {
    id,
    cells,
    connectors,
    axis
  };
}

const ROGUE_ROOM_TEMPLATE_LIBRARY = {
  start: [
    rogueMakeTemplate('start-square', rogueBuildRectCells(3, 3), rogueBuildCardinalConnectors(1, 1), 'any'),
    rogueMakeTemplate('start-octagon', rogueBuildOctagonCells(2), rogueBuildCardinalConnectors(2, 2), 'any')
  ],
  main: [
    rogueMakeTemplate('main-hall', rogueBuildRectCells(5, 3), rogueBuildCardinalConnectors(2, 1), 'horizontal'),
    rogueMakeTemplate('main-needle', rogueBuildRectCells(3, 5), rogueBuildCardinalConnectors(1, 2), 'vertical'),
    rogueMakeTemplate('main-octagon', rogueBuildOctagonCells(2), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('main-cross', rogueBuildCrossCells(2), rogueBuildCardinalConnectors(2, 2), 'any')
  ],
  branch: [
    rogueMakeTemplate('branch-needle', rogueBuildRectCells(3, 5), rogueBuildCardinalConnectors(1, 2), 'vertical'),
    rogueMakeTemplate('branch-square', rogueBuildRectCells(3, 3), rogueBuildCardinalConnectors(1, 1), 'any'),
    rogueMakeTemplate('branch-cross', rogueBuildCrossCells(2), rogueBuildCardinalConnectors(2, 2), 'any')
  ],
  key: [
    rogueMakeTemplate('key-octagon', rogueBuildOctagonCells(2), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('key-cross', rogueBuildCrossCells(2), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('key-square', rogueBuildRectCells(3, 3), rogueBuildCardinalConnectors(1, 1), 'any')
  ],
  treasure: [
    rogueMakeTemplate('treasure-vault', rogueBuildRectCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('treasure-octagon', rogueBuildOctagonCells(2), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('treasure-cross', rogueBuildCrossCells(2), rogueBuildCardinalConnectors(2, 2), 'any')
  ],
  combat: [
    rogueMakeTemplate('combat-cross', rogueBuildCrossCells(2), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('combat-octagon', rogueBuildOctagonCells(2), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('combat-vault', rogueBuildRectCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any')
  ],
  exit: [
    rogueMakeTemplate('exit-vault', rogueBuildRectCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('exit-octagon', rogueBuildOctagonCells(2), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('exit-cross', rogueBuildCrossCells(2), rogueBuildCardinalConnectors(2, 2), 'any')
  ]
};

function rogueTemplatesForRole(role) {
  return ROGUE_ROOM_TEMPLATE_LIBRARY[role] || ROGUE_ROOM_TEMPLATE_LIBRARY.main;
}

function rogueMaterialSetForRole(themeVariant, role, isCorridor) {
  if (isCorridor) {
    return themeVariant.corridorMaterials;
  }
  if (role === 'key' || role === 'treasure' || role === 'combat' || role === 'exit') {
    return themeVariant.specialMaterials;
  }
  return themeVariant.roomMaterials;
}

function rogueClonePoint(point) {
  return {
    x: Number(point.x) || 0,
    z: Number(point.z) || 0
  };
}

export function createRogueStyleLevel(seedInput = 0xC0FFEE01) {
  const seed = normalizeSeed(seedInput);
  const rootRng = createSeededRng(seed);
  let lastError = null;

  for (let attempt = 0; attempt < ROGUE_LAYOUT_RETRIES; attempt += 1) {
    try {
      const layoutRng = rootRng.fork(`rogue-layout-${attempt}`);
      const themeVariant = layoutRng.pick(ROGUE_THEME_VARIANTS) || ROGUE_THEME_VARIANTS[0];
      const built = buildRogueLayout(layoutRng, seed, themeVariant, attempt);
      if (built) {
        return built;
      }
      lastError = new Error('buildRogueLayout returned null');
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw new Error(`Failed to build a rogue-style level: ${lastError ? lastError.message : 'unknown error'}`);
}

function buildRogueLayout(rng, seed, themeVariant, attempt) {
  const layout = {
    seed,
    attempt,
    themeVariant,
    roomCells: new Set(),
    roomBuffer: new Set(),
    corridorCells: new Set(),
    cellInfo: new Map(),
    nodes: [],
    edges: [],
    doorLinks: [],
    spawnNodeId: null,
    exitNodeId: null
  };

  function keyOf(x, z) {
    return rogueCellKey(x, z);
  }

  function addRoomBuffer(cellX, cellZ) {
    for (const dir of ROGUE_DIRECTIONS) {
      const nx = cellX + dir.dx;
      const nz = cellZ + dir.dz;
      if (!rogueWithinBounds(nx, nz)) {
        continue;
      }
      const key = keyOf(nx, nz);
      if (!layout.roomCells.has(key)) {
        layout.roomBuffer.add(key);
      }
    }
  }

  function canPlaceTemplate(anchor, template, rotation) {
    for (const offset of template.cells) {
      const [dx, dz] = rogueRotateOffset(offset, rotation);
      const x = anchor.x + dx;
      const z = anchor.z + dz;
      const key = keyOf(x, z);
      if (!rogueWithinBounds(x, z)) {
        return false;
      }
      if (layout.roomCells.has(key) || layout.roomBuffer.has(key)) {
        return false;
      }
    }
    return true;
  }

  function installNode(node, template, rotation) {
    node.templateId = template.id;
    node.rotation = rotation;
    node.cells = [];
    node.connectors = [];

    for (const offset of template.cells) {
      const [dx, dz] = rogueRotateOffset(offset, rotation);
      const x = node.anchor.x + dx;
      const z = node.anchor.z + dz;
      const key = keyOf(x, z);
      const center = rogueCellCenter(x, z);
      const cellMaterials = rogueMaterialSetForRole(themeVariant, node.role, false);
      const info = {
        id: `rogue-${x}-${z}`,
        x,
        z,
        center,
        nodeId: node.id,
        role: node.role,
        theme: themeVariant.theme,
        floor: 0,
        ceiling: 3.55,
        floorMaterial: cellMaterials.floor,
        ceilingMaterial: cellMaterials.ceiling,
        wallMaterial: cellMaterials.wall
      };
      layout.roomCells.add(key);
      layout.cellInfo.set(key, info);
      node.cells.push({ x, z, key });
    }

    for (const connector of template.connectors) {
      const [dx, dz] = rogueRotateOffset(connector.offset, rotation);
      const x = node.anchor.x + dx;
      const z = node.anchor.z + dz;
      const direction = rogueRotateDirection(connector.direction, rotation);
      const delta = rogueDirectionVector(direction);
      const outside = {
        x: x + delta.dx,
        z: z + delta.dz
      };
      node.connectors.push({
        direction,
        x,
        z,
        key: keyOf(x, z),
        outside,
        outsideKey: keyOf(outside.x, outside.z)
      });
    }

    for (const cell of node.cells) {
      addRoomBuffer(cell.x, cell.z);
    }
  }

  function layoutRngShuffle(localRng, items) {
    return localRng.shuffle(items);
  }

  function buildNode(id, role, anchor, depth) {
    return {
      id,
      role,
      anchor: rogueClonePoint(anchor),
      depth: Number(depth) || 0,
      templateId: null,
      rotation: 0,
      cells: [],
      connectors: []
    };
  }

  function placeNode(node, flowVector) {
    const templates = layoutRngShuffle(rng, rogueTemplatesForRole(node.role));
    for (const template of templates) {
      const axis = template.axis || 'any';
      const rotations = layoutRngShuffle(rng, [0, 1, 2, 3]);
      for (const rotation of rotations) {
        if (axis === 'horizontal' && Math.abs(flowVector.x) < Math.abs(flowVector.z)) {
          continue;
        }
        if (axis === 'vertical' && Math.abs(flowVector.z) < Math.abs(flowVector.x)) {
          continue;
        }
        if (!canPlaceTemplate(node.anchor, template, rotation)) {
          continue;
        }
        installNode(node, template, rotation);
        return true;
      }
    }
    return false;
  }

  function chooseConnector(node, toward) {
    const ordered = node.connectors
      .map((connector) => {
        const vector = rogueDirectionVector(connector.direction);
        const score = (vector.dx * toward.x) + (vector.dz * toward.z);
        return { connector, score };
      })
      .sort((a, b) => b.score - a.score);

    for (const entry of ordered) {
      const { connector } = entry;
      if (!rogueWithinBounds(connector.outside.x, connector.outside.z)) {
        continue;
      }
      return connector;
    }

    return null;
  }

  function routePath(start, goal, mode = 'direct') {
    const allowed = new Set([
      keyOf(start.x, start.z),
      keyOf(goal.x, goal.z)
    ]);

    function passable(x, z) {
      if (!rogueWithinBounds(x, z)) {
        return false;
      }
      const key = keyOf(x, z);
      if (allowed.has(key)) {
        return true;
      }
      if (layout.roomCells.has(key)) {
        return false;
      }
      return true;
    }

    function aStar(from, to, localMode) {
      const open = [{
        x: from.x,
        z: from.z,
        g: 0,
        f: Math.abs(to.x - from.x) + Math.abs(to.z - from.z),
        dir: null
      }];
      const best = new Map([[keyOf(from.x, from.z), 0]]);
      const cameFrom = new Map();

      while (open.length > 0) {
        let bestIndex = 0;
        for (let index = 1; index < open.length; index += 1) {
          if (open[index].f < open[bestIndex].f) {
            bestIndex = index;
          }
        }

        const current = open.splice(bestIndex, 1)[0];
        if (current.x === to.x && current.z === to.z) {
          const path = [{ x: current.x, z: current.z }];
          let cursor = keyOf(current.x, current.z);
          while (cameFrom.has(cursor)) {
            const prev = cameFrom.get(cursor);
            path.push(prev);
            cursor = keyOf(prev.x, prev.z);
          }
          path.reverse();
          return path;
        }

        for (const step of ROGUE_DIRECTIONS) {
          const nx = current.x + step.dx;
          const nz = current.z + step.dz;
          if (!passable(nx, nz)) {
            continue;
          }

          const nextKey = keyOf(nx, nz);
          const turnPenalty = current.dir && current.dir !== step.name
            ? (localMode === 'drift' ? 0.32 : localMode === 'elbow' ? 0.18 : 0.08)
            : 0;
          const corridorBonus = layout.corridorCells.has(nextKey) ? -0.04 : 0;
          const nextG = current.g + 1 + turnPenalty + corridorBonus;
          const bestKnown = best.get(nextKey);
          if (Number.isFinite(bestKnown) && bestKnown <= nextG) {
            continue;
          }

          best.set(nextKey, nextG);
          cameFrom.set(nextKey, { x: current.x, z: current.z });
          open.push({
            x: nx,
            z: nz,
            g: nextG,
            f: nextG + Math.abs(to.x - nx) + Math.abs(to.z - nz),
            dir: step.name
          });
        }
      }

      return null;
    }

    const modes = mode === 'drift' ? ['drift', 'elbow', 'direct'] : mode === 'elbow' ? ['elbow', 'direct'] : ['direct', 'elbow'];
    for (const localMode of modes) {
      if (localMode === 'direct') {
        const path = aStar(start, goal, localMode);
        if (path) {
          return path;
        }
        continue;
      }

      const center = {
        x: Math.round((start.x + goal.x) * 0.5),
        z: Math.round((start.z + goal.z) * 0.5)
      };
      const horizontal = Math.abs(goal.x - start.x) >= Math.abs(goal.z - start.z);
      const offset = horizontal
        ? { x: 0, z: (rng.nextFloat() < 0.5 ? -1 : 1) * rng.nextRange(2, 5) }
        : { x: (rng.nextFloat() < 0.5 ? -1 : 1) * rng.nextRange(2, 5), z: 0 };
      const via = {
        x: rogueClamp(center.x + offset.x, 1, ROGUE_GRID_WIDTH - 2),
        z: rogueClamp(center.z + offset.z, 1, ROGUE_GRID_HEIGHT - 2)
      };
      if (!passable(via.x, via.z)) {
        continue;
      }

      const first = aStar(start, via, localMode);
      const second = aStar(via, goal, localMode);
      if (!first || !second) {
        continue;
      }

      return first.concat(second.slice(1));
    }

    return null;
  }

  function connectNodes(sourceNode, targetNode, mode = 'direct') {
    const towardTarget = {
      x: targetNode.anchor.x - sourceNode.anchor.x,
      z: targetNode.anchor.z - sourceNode.anchor.z
    };
    const towardSource = {
      x: -towardTarget.x,
      z: -towardTarget.z
    };

    const sourceConnector = chooseConnector(sourceNode, towardTarget);
    const targetConnector = chooseConnector(targetNode, towardSource);
    if (!sourceConnector || !targetConnector) {
      throw new Error(`Rogue layout failed: no connector between ${sourceNode.id} and ${targetNode.id}`);
    }

    const path = routePath(sourceConnector.outside, targetConnector.outside, mode);
    if (!path) {
      throw new Error(`Rogue layout failed: corridor path between ${sourceNode.id} and ${targetNode.id}`);
    }

    for (const cell of path) {
      const key = keyOf(cell.x, cell.z);
      if (layout.roomCells.has(key)) {
        continue;
      }
      if (!layout.corridorCells.has(key)) {
        layout.corridorCells.add(key);
        const corridorMaterials = rogueMaterialSetForRole(themeVariant, 'main', true);
        layout.cellInfo.set(key, {
          id: `rogue-${cell.x}-${cell.z}`,
          x: cell.x,
          z: cell.z,
          center: rogueCellCenter(cell.x, cell.z),
          nodeId: null,
          role: 'corridor',
          theme: themeVariant.theme,
          floor: 0,
          ceiling: 3.55,
          floorMaterial: corridorMaterials.floor,
          ceilingMaterial: corridorMaterials.ceiling,
          wallMaterial: corridorMaterials.wall
        });
      }
    }

    const link = {
      sourceNodeId: sourceNode.id,
      targetNodeId: targetNode.id,
      sourceConnector,
      targetConnector,
      path,
      mode
    };
    layout.edges.push(link);
    return link;
  }

  const mainNodes = [];
  const startAnchor = {
    x: 5 + rng.nextInt(2),
    z: 6 + rng.nextInt(ROGUE_GRID_HEIGHT - 12)
  };
  const startNode = buildNode('start', 'start', startAnchor, 0);
  if (!placeNode(startNode, { x: 1, z: 0 })) {
    throw new Error('Rogue layout failed: could not place start room');
  }
  mainNodes.push(startNode);

  let heading = (rng.nextFloat() * 0.7) - 0.35;
  for (let index = 1; index < ROGUE_MAIN_ROOM_COUNT; index += 1) {
    const role = index === (ROGUE_MAIN_ROOM_COUNT - 1) ? 'exit' : 'main';
    let placed = false;
    const previous = mainNodes[index - 1];
    for (let attempt = 0; attempt < 48; attempt += 1) {
      const turn = attempt < 16 ? ((rng.nextFloat() * 1.6) - 0.8) : ((rng.nextFloat() * 2.7) - 1.35);
      const angle = heading + turn;
      const step = index === (ROGUE_MAIN_ROOM_COUNT - 1) ? rng.nextRange(5, 7) : rng.nextRange(6, 9);
      const candidate = {
        x: Math.round(previous.anchor.x + (Math.cos(angle) * step)),
        z: Math.round(previous.anchor.z + (Math.sin(angle) * step))
      };
      if (!rogueWithinBounds(candidate.x, candidate.z)) {
        continue;
      }
      let tooClose = false;
      for (const existing of mainNodes) {
        const dx = candidate.x - existing.anchor.x;
        const dz = candidate.z - existing.anchor.z;
        if ((dx * dx) + (dz * dz) < 25) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) {
        continue;
      }

      const node = buildNode(role === 'exit' ? 'exit' : `main-${index}`, role, candidate, index);
      const flowVector = {
        x: candidate.x - previous.anchor.x,
        z: candidate.z - previous.anchor.z
      };
      if (!placeNode(node, flowVector)) {
        continue;
      }

      mainNodes.push(node);
      heading = angle;
      placed = true;
      break;
    }

    if (!placed) {
      throw new Error(`Rogue layout failed: could not place ${role} room ${index}`);
    }
  }

  layout.nodes.push(...mainNodes);
  layout.spawnNodeId = startNode.id;
  layout.exitNodeId = mainNodes[mainNodes.length - 1].id;

  const branchRoles = ['key', 'treasure', 'combat'];
  const branchAnchors = [1, 2, 3];
  const branches = [];
  for (let index = 0; index < ROGUE_BRANCH_ROOM_COUNT; index += 1) {
    const anchorNode = mainNodes[branchAnchors[index]];
    const forwardNode = mainNodes[Math.min(branchAnchors[index] + 1, mainNodes.length - 1)];
    const backwardNode = mainNodes[Math.max(branchAnchors[index] - 1, 0)];
    const forwardVector = {
      x: forwardNode.anchor.x - backwardNode.anchor.x,
      z: forwardNode.anchor.z - backwardNode.anchor.z
    };
    const forwardLength = Math.hypot(forwardVector.x, forwardVector.z) || 1;
    const forwardUnit = {
      x: forwardVector.x / forwardLength,
      z: forwardVector.z / forwardLength
    };
    const sideSign = rng.nextFloat() < 0.5 ? -1 : 1;
    const sideVector = {
      x: -forwardUnit.z * sideSign,
      z: forwardUnit.x * sideSign
    };
    let placed = false;
    for (let attempt = 0; attempt < 48; attempt += 1) {
      const lateral = rng.nextRange(4, 7);
      const along = rng.nextRange(-1, 2);
      const candidate = {
        x: Math.round(anchorNode.anchor.x + (sideVector.x * lateral) + (forwardUnit.x * along)),
        z: Math.round(anchorNode.anchor.z + (sideVector.z * lateral) + (forwardUnit.z * along))
      };
      if (!rogueWithinBounds(candidate.x, candidate.z)) {
        continue;
      }
      let tooClose = false;
      for (const existing of mainNodes.concat(branches)) {
        const dx = candidate.x - existing.anchor.x;
        const dz = candidate.z - existing.anchor.z;
        if ((dx * dx) + (dz * dz) < 18) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) {
        continue;
      }

      const node = buildNode(branchRoles[index], branchRoles[index], candidate, anchorNode.depth + 1);
      const flowVector = {
        x: anchorNode.anchor.x - candidate.x,
        z: anchorNode.anchor.z - candidate.z
      };
      if (!placeNode(node, flowVector)) {
        continue;
      }

      node.depth = anchorNode.depth + 1;
      branches.push(node);
      placed = true;
      break;
    }

    if (!placed) {
      throw new Error(`Rogue layout failed: could not place branch room ${branchRoles[index]}`);
    }
  }

  layout.nodes.push(...branches);

  for (const branch of branches) {
    const anchorIndex = branchRoles.indexOf(branch.role);
    const parentNode = mainNodes[branchAnchors[anchorIndex]];
    const link = connectNodes(parentNode, branch, 'elbow');
    if (!link) {
      return null;
    }
  }

  for (let index = 1; index < mainNodes.length; index += 1) {
    const sourceNode = mainNodes[index - 1];
    const targetNode = mainNodes[index];
    const mode = index % 2 === 0 ? 'elbow' : 'direct';
    const link = connectNodes(sourceNode, targetNode, mode);
    if (!link) {
      return null;
    }
  }

  const loopCandidates = [
    [mainNodes[1], mainNodes[3], 'drift'],
    [mainNodes[2], mainNodes[4], 'elbow'],
    [mainNodes[1], mainNodes[4], 'drift']
  ];
  let loopAdded = false;
  for (const [sourceNode, targetNode, mode] of loopCandidates) {
    const link = connectNodes(sourceNode, targetNode, mode);
    if (link) {
      loopAdded = true;
      break;
    }
  }

  const degreeByNodeId = new Map();
  for (const node of layout.nodes) {
    degreeByNodeId.set(node.id, 0);
  }
  for (const edge of layout.edges) {
    degreeByNodeId.set(edge.sourceNodeId, (degreeByNodeId.get(edge.sourceNodeId) || 0) + 1);
    degreeByNodeId.set(edge.targetNodeId, (degreeByNodeId.get(edge.targetNodeId) || 0) + 1);
  }

  const leafCount = [...degreeByNodeId.values()].filter((value) => value === 1).length;
  if (leafCount < 4) {
    throw new Error(`Rogue layout failed: only ${leafCount} room leaves`);
  }

  const pathDistance = computeCellDistance(layout, mainNodes[0], mainNodes[mainNodes.length - 1]);
  if (!Number.isFinite(pathDistance) || pathDistance < ROGUE_MIN_PATH_LENGTH) {
    throw new Error(`Rogue layout failed: start-to-exit path too short (${pathDistance})`);
  }

  const doorEdgeLink = layout.edges.find((edge) => edge.sourceNodeId === mainNodes[mainNodes.length - 2].id && edge.targetNodeId === mainNodes[mainNodes.length - 1].id)
    || layout.edges.find((edge) => edge.sourceNodeId === mainNodes[mainNodes.length - 1].id && edge.targetNodeId === mainNodes[mainNodes.length - 2].id);
  if (!doorEdgeLink) {
    throw new Error('Rogue layout failed: missing exit gate corridor');
  }

  const exitConnector = doorEdgeLink.targetNodeId === mainNodes[mainNodes.length - 1].id
    ? doorEdgeLink.targetConnector
    : doorEdgeLink.sourceConnector;
  const exitRoomConnector = {
    roomCell: {
      x: exitConnector.x,
      z: exitConnector.z
    },
    corridorCell: {
      x: exitConnector.outside.x,
      z: exitConnector.outside.z
    },
    direction: exitConnector.direction
  };
  layout.doorLinks.push({
    id: 'yellow-gate',
    name: 'Yellow Gate',
    locked: true,
    requiredKey: 'yellow',
    leftCell: exitRoomConnector.roomCell,
    rightCell: exitRoomConnector.corridorCell,
    direction: exitRoomConnector.direction
  });

  const startCenter = rogueCellCenter(mainNodes[0].anchor.x, mainNodes[0].anchor.z);
  const exitCenter = rogueCellCenter(mainNodes[mainNodes.length - 1].anchor.x, mainNodes[mainNodes.length - 1].anchor.z);

  const enemySpawns = [];
  const pickups = [];
  const props = [];
  const lights = [];
  const decals = [];
  const triggers = [];
  const scriptedEvents = [];

  function pushEnemy(kind, x, z) {
    enemySpawns.push({ kind, x, z });
  }

  function pushPickup(kind, x, z, extra = {}) {
    pickups.push({
      kind,
      x,
      z,
      ...extra
    });
  }

  function pushProp(kind, x, z, extra = {}) {
    props.push({
      id: `${kind}-${props.length + 1}`,
      kind,
      x,
      z,
      width: extra.width ?? 0.72,
      height: extra.height ?? 0.82,
      depth: extra.depth ?? 0.72,
      rotation: extra.rotation ?? 0,
      color: extra.color ?? '#7d8d9a'
    });
  }

  function pushLight(x, z, color, intensity = 1.15, pulse = 0.2) {
    lights.push({
      id: `light-${lights.length + 1}`,
      kind: 'light',
      x,
      z,
      y: 2.85,
      width: 0.22,
      height: 0.16,
      depth: 0.22,
      color,
      intensity,
      pulse
    });
  }

  function pushDecal(kind, x, z, rotation = 0, color = '#e7c65d', alpha = 0.68) {
    decals.push({
      id: `${kind}-${decals.length + 1}`,
      kind,
      x,
      z,
      width: 1.2,
      height: 0.02,
      depth: 0.22,
      rotation,
      color,
      alpha
    });
  }

  for (const node of layout.nodes) {
    const center = rogueCellCenter(node.anchor.x, node.anchor.z);
    const roomCells = node.cells.slice();
    const spawnCells = rng.shuffle(roomCells);
    const safeCount = node.role === 'start' ? 0 : node.role === 'exit' ? 2 : 1;
    const enemyKindsByRole = {
      main: ['zombie', 'imp'],
      key: ['zombie', 'imp'],
      treasure: ['zombie', 'demon'],
      combat: ['imp', 'chaingunner', 'demon'],
      exit: ['chaingunner', 'baron']
    };

    if (node.role === 'start') {
      pushProp('console', center.x - 0.4, center.z - 1.1, {
        width: 0.95,
        height: 1.0,
        depth: 0.38,
        rotation: 0.1,
        color: '#8293a3'
      });
      pushLight(center.x, center.z, '#dff5ff', 1.15, 0.18);
      pushLight(center.x + 1.1, center.z - 0.6, '#ffe4b6', 1.0, 0.14);
      pushDecal('warning', center.x, center.z, 0.08, '#e7c65d', 0.62);
    } else if (node.role === 'key') {
      pushPickup('key', center.x, center.z, { key: 'yellow' });
      pushPickup('health', center.x + 1.0, center.z - 0.8, { amount: 25 });
      pushProp('crate', center.x - 1.0, center.z + 0.8, {
        width: 0.7,
        height: 0.74,
        depth: 0.7,
        rotation: 0.18,
        color: '#8d6742'
      });
      pushLight(center.x, center.z, '#fff1c9', 1.1, 0.22);
      pushLight(center.x - 1.2, center.z + 0.8, '#dff5ff', 1.0, 0.18);
      scriptedEvents.push({
        id: `event-${scriptedEvents.length + 1}`,
        kind: 'event',
        x: center.x,
        z: center.z,
        action: 'message',
        payload: { text: 'Find the yellow gate.' }
      });
    } else if (node.role === 'treasure') {
      pushPickup('health', center.x, center.z, { amount: 25 });
      pushPickup('ammo', center.x + 1.0, center.z, { ammoType: 'bullet', amount: 40 });
      pushPickup('ammo', center.x - 1.0, center.z + 0.8, { ammoType: 'cell', amount: 24 });
      pushProp('machine', center.x + 0.9, center.z - 0.8, {
        width: 1.15,
        height: 1.0,
        depth: 1.15,
        rotation: 0.12,
        color: '#677681'
      });
      pushLight(center.x, center.z, '#ffe4b6', 1.05, 0.18);
      pushLight(center.x + 1.0, center.z + 0.9, '#dff5ff', 1.0, 0.16);
      pushDecal('warning', center.x + 0.7, center.z - 0.6, -0.2, '#f0b64f', 0.56);
    } else if (node.role === 'combat') {
      pushPickup('ammo', center.x, center.z + 0.8, { ammoType: 'shell', amount: 12 });
      pushProp('machine', center.x - 1.0, center.z - 0.8, {
        width: 1.25,
        height: 1.1,
        depth: 1.25,
        rotation: -0.16,
        color: '#5e6d7b'
      });
      pushProp('barrel', center.x + 1.2, center.z + 0.9, {
        width: 0.78,
        height: 0.92,
        depth: 0.78,
        rotation: 0.12,
        color: '#7d5239'
      });
      pushLight(center.x, center.z, '#b7f0ff', 1.15, 0.26);
      pushLight(center.x + 1.1, center.z - 0.6, '#ffe4b6', 1.1, 0.22);
    } else if (node.role === 'exit') {
      pushPickup('armor', center.x - 1.0, center.z + 0.8, { amount: 25 });
      pushProp('console', center.x + 1.0, center.z - 0.8, {
        width: 0.92,
        height: 1.0,
        depth: 0.4,
        rotation: -0.2,
        color: '#94a3af'
      });
      pushProp('column', center.x - 1.2, center.z - 0.9, {
        width: 0.52,
        height: 2.05,
        depth: 0.52,
        rotation: 0,
        color: '#495866'
      });
      pushLight(center.x, center.z, '#dff5ff', 1.2, 0.2);
      pushLight(center.x + 1.2, center.z - 0.8, '#ffe4b6', 1.1, 0.2);
      pushDecal('warning', center.x, center.z, 0.1, '#f0b64f', 0.64);
      scriptedEvents.push({
        id: `event-${scriptedEvents.length + 1}`,
        kind: 'event',
        x: center.x,
        z: center.z,
        action: 'levelExit',
        payload: { exit: true }
      });
    } else {
      pushLight(center.x, center.z, '#dff5ff', 1.1, 0.18);
      pushLight(center.x + 0.8, center.z - 0.8, '#ffe4b6', 1.0, 0.15);
    }

    if (node.role !== 'start') {
      const roles = enemyKindsByRole[node.role] || enemyKindsByRole.main;
      const spawnCount = node.role === 'exit' ? 2 : node.role === 'combat' ? 3 : node.role === 'treasure' ? 2 : 1;
      for (let index = 0; index < spawnCount; index += 1) {
        const cell = spawnCells[index % spawnCells.length];
        const point = rogueCellCenter(cell.x, cell.z);
        pushEnemy(roles[index % roles.length], point.x, point.z);
      }
    }

    if (node.role === 'key') {
      triggers.push({
        id: `trigger-${triggers.length + 1}`,
        kind: 'trigger',
        x: center.x,
        z: center.z,
        radius: 1.1,
        action: 'message',
        payload: { text: 'Key room' }
      });
    }
  }

  for (const link of layout.edges) {
    if (link.sourceNodeId === layout.exitNodeId || link.targetNodeId === layout.exitNodeId) {
      continue;
    }
    if (rng.nextFloat() < 0.16) {
      const mid = link.path[Math.floor(link.path.length / 2)];
      const point = rogueCellCenter(mid.x, mid.z);
      pushDecal('warning', point.x, point.z, (rng.nextFloat() * 0.8) - 0.4, '#e7c65d', 0.5);
    }
  }

  function buildSectors() {
    const sectors = [];
    const sectorLookup = new Map();
    for (const [key, info] of layout.cellInfo.entries()) {
      sectorLookup.set(key, info);
      sectors.push({
        id: info.id,
        name: info.role === 'corridor' ? `Corridor ${info.x},${info.z}` : `${info.roomId || 'room'} ${info.x},${info.z}`,
        floor: info.floor,
        ceiling: info.ceiling,
        floorMaterial: info.floorMaterial,
        ceilingMaterial: info.ceilingMaterial,
        wallMaterial: info.wallMaterial,
        theme: themeVariant.theme,
        loop: rogueCellLoop(info.x, info.z),
        portals: []
      });
    }

    const sectorByCell = new Map();
    for (const sector of sectors) {
      const parts = sector.id.split('-');
      const x = Number(parts[1]);
      const z = Number(parts[2]);
      sectorByCell.set(rogueCellKey(x, z), sector);
    }

    for (const sector of sectors) {
      const parts = sector.id.split('-');
      const x = Number(parts[1]);
      const z = Number(parts[2]);
      for (const dir of ROGUE_DIRECTIONS) {
        const nx = x + dir.dx;
        const nz = z + dir.dz;
        const neighbor = sectorByCell.get(rogueCellKey(nx, nz));
        if (!neighbor) {
          continue;
        }
        sector.portals.push({ edge: dir.edge, to: neighbor.id });
      }
    }

    return { sectors, sectorByCell };
  }

  function buildDoors(sectorByCell) {
    const doors = [];
    for (const doorLink of layout.doorLinks) {
      const leftKey = rogueCellKey(doorLink.leftCell.x, doorLink.leftCell.z);
      const rightKey = rogueCellKey(doorLink.rightCell.x, doorLink.rightCell.z);
      const leftSector = sectorByCell.get(leftKey);
      const rightSector = sectorByCell.get(rightKey);
      if (!leftSector || !rightSector) {
        continue;
      }
      doors.push({
        id: doorLink.id,
        name: doorLink.name,
        locked: doorLink.locked,
        requiredKey: doorLink.requiredKey,
        open: false,
        edges: [
          {
            sectorId: leftSector.id,
            edgeIndex: rogueEdgeIndex(doorLink.direction)
          },
          {
            sectorId: rightSector.id,
            edgeIndex: rogueEdgeIndex(rogueOppositeDirection(doorLink.direction))
          }
        ]
      });
    }
    return doors;
  }

  function computeRoomGraphDepths() {
    const adjacency = new Map();
    for (const node of layout.nodes) {
      adjacency.set(node.id, []);
    }
    for (const link of layout.edges) {
      adjacency.get(link.sourceNodeId).push(link.targetNodeId);
      adjacency.get(link.targetNodeId).push(link.sourceNodeId);
    }

    const depths = new Map();
    const queue = [layout.spawnNodeId];
    depths.set(layout.spawnNodeId, 0);
    while (queue.length > 0) {
      const current = queue.shift();
      const depth = depths.get(current) || 0;
      for (const next of adjacency.get(current) || []) {
        if (depths.has(next)) {
          continue;
        }
        depths.set(next, depth + 1);
        queue.push(next);
      }
    }
    return depths;
  }

  function computeCellDistance(layoutState, startNode, endNode) {
    const startKey = rogueCellKey(startNode.anchor.x, startNode.anchor.z);
    const endKey = rogueCellKey(endNode.anchor.x, endNode.anchor.z);
    const queue = [startKey];
    const distance = new Map([[startKey, 0]]);
    while (queue.length > 0) {
      const currentKey = queue.shift();
      const currentDistance = distance.get(currentKey) || 0;
      if (currentKey === endKey) {
        return currentDistance;
      }
      const [xText, zText] = currentKey.split(',');
      const x = Number(xText);
      const z = Number(zText);
      for (const dir of ROGUE_DIRECTIONS) {
        const nx = x + dir.dx;
        const nz = z + dir.dz;
        const neighborKey = rogueCellKey(nx, nz);
        if (!layoutState.roomCells.has(neighborKey) && !layoutState.corridorCells.has(neighborKey)) {
          continue;
        }
        if (distance.has(neighborKey)) {
          continue;
        }
        distance.set(neighborKey, currentDistance + 1);
        queue.push(neighborKey);
      }
    }
    return Infinity;
  }

  const depths = computeRoomGraphDepths();
  for (const node of layout.nodes) {
    node.depth = depths.get(node.id) || node.depth;
  }

  const { sectors, sectorByCell } = buildSectors();
  const doors = buildDoors(sectorByCell);

  const walkableCells = new Set([...layout.roomCells, ...layout.corridorCells]);
  const startKey = rogueCellKey(startNode.anchor.x, startNode.anchor.z);
  const exitKey = rogueCellKey(mainNodes[mainNodes.length - 1].anchor.x, mainNodes[mainNodes.length - 1].anchor.z);
  const reachable = new Set([startKey]);
  const queue = [startKey];
  while (queue.length > 0) {
    const currentKey = queue.shift();
    const [xText, zText] = currentKey.split(',');
    const x = Number(xText);
    const z = Number(zText);
    for (const dir of ROGUE_DIRECTIONS) {
      const neighborKey = rogueCellKey(x + dir.dx, z + dir.dz);
      if (!walkableCells.has(neighborKey) || reachable.has(neighborKey)) {
        continue;
      }
      reachable.add(neighborKey);
      queue.push(neighborKey);
    }
  }
  if (!reachable.has(exitKey)) {
    throw new Error('Rogue layout failed: exit not reachable');
  }
  if (reachable.size !== walkableCells.size) {
    throw new Error(`Rogue layout failed: disconnected walkable cells (${reachable.size}/${walkableCells.size})`);
  }

  const level = {
    id: 'rogue01',
    name: 'Rogue Labyrinth',
    ambientLight: themeVariant.ambientLight,
    skyColor: themeVariant.skyColor,
    theme: themeVariant.theme,
    spawn: {
      x: startCenter.x,
      z: startCenter.z,
      yaw: 0,
      sector: `rogue-${startNode.anchor.x}-${startNode.anchor.z}`
    },
    exit: {
      x: exitCenter.x,
      z: exitCenter.z
    },
    sectors,
    doors,
    enemySpawns,
    pickups,
    props,
    lights,
    decals,
    triggers,
    scriptedEvents
  };

  if (layout.doorLinks.length === 0 || doors.length === 0) {
    throw new Error('Rogue layout failed: no door links were created');
  }

  return level;
}
