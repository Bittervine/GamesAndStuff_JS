import { createSeededRng, deriveSeed, normalizeSeed } from '../../core/random/seededRng.js';
import { distanceSqPointToSegment, segmentKey } from '../../core/world/spatial.js';

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
const ROGUE_WORLD_SHEAR_X = 0.92;
const ROGUE_WORLD_SHEAR_Z = 0.46;
const ROGUE_GRID_WIDTH = 40;
const ROGUE_GRID_HEIGHT = 34;
const ROGUE_LAYOUT_RETRIES = 64;
const ROGUE_MAIN_ROOM_COUNT = 6;
const ROGUE_BRANCH_ROOM_COUNT = 3;
const ROGUE_MIN_PATH_LENGTH = 18;

const ROGUE_DIRECTIONS = [
  { name: 'north', dx: 0, dz: -1, edge: 0 },
  { name: 'east', dx: 1, dz: 0, edge: 1 },
  { name: 'south', dx: 0, dz: 1, edge: 2 },
  { name: 'west', dx: -1, dz: 0, edge: 3 }
];

const ROGUE_ROUTE_STEPS = [
  ...ROGUE_DIRECTIONS.map((step) => ({
    ...step,
    cost: 1
  })),
  { name: 'northEast', dx: 1, dz: -1, cost: 1.42 },
  { name: 'southEast', dx: 1, dz: 1, cost: 1.42 },
  { name: 'southWest', dx: -1, dz: 1, cost: 1.42 },
  { name: 'northWest', dx: -1, dz: -1, cost: 1.42 }
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
    transitionMaterials: {
      floor: 'stoneFloor',
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
    transitionMaterials: {
      floor: 'metalFloor',
      ceiling: 'concreteCeiling',
      wall: 'steelWall'
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
    transitionMaterials: {
      floor: 'organicFloor',
      ceiling: 'organicCeiling',
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

function rogueGeometryPhase(seed, offset = 0) {
  return ((normalizeSeed(seed) % 104729) * 0.000031) + offset;
}

function rogueGeometryNoise(x, z, seed, offset = 0) {
  const phase = rogueGeometryPhase(seed, offset);
  return (Math.sin((x * 0.29) + (z * 0.17) + phase) * 0.65) + (Math.cos((x * 0.11) - (z * 0.31) + (phase * 1.41)) * 0.35);
}

function rogueCellCenter(x, z, seed = 0) {
  return rogueGridToWorld(x + 0.5, z + 0.5, seed);
}

function rogueCellLoop(x, z, seed = 0) {
  const topLeft = rogueGridToWorld(x, z, seed);
  const topRight = rogueGridToWorld(x + 1, z, seed);
  const bottomRight = rogueGridToWorld(x + 1, z + 1, seed);
  const bottomLeft = rogueGridToWorld(x, z + 1, seed);
  return [
    [topLeft.x, topLeft.z],
    [topRight.x, topRight.z],
    [bottomRight.x, bottomRight.z],
    [bottomLeft.x, bottomLeft.z]
  ];
}

function rogueGridToWorld(x, z, seed = 0) {
  const baseX = (x * ROGUE_CELL_SIZE) + (z * ROGUE_WORLD_SHEAR_X);
  const baseZ = (z * ROGUE_CELL_SIZE) + (x * ROGUE_WORLD_SHEAR_Z);
  const centerGridX = (ROGUE_GRID_WIDTH - 1) * 0.5;
  const centerGridZ = (ROGUE_GRID_HEIGHT - 1) * 0.5;
  const centerWorldX = (centerGridX * ROGUE_CELL_SIZE) + (centerGridZ * ROGUE_WORLD_SHEAR_X);
  const centerWorldZ = (centerGridZ * ROGUE_CELL_SIZE) + (centerGridX * ROGUE_WORLD_SHEAR_Z);
  const centeredX = baseX - centerWorldX;
  const centeredZ = baseZ - centerWorldZ;
  const lowWarp = rogueGeometryNoise(x * 0.12, z * 0.12, seed, 0.0);
  const midWarp = rogueGeometryNoise((x * 0.23) + 11.7, (z * 0.21) - 7.3, seed, 1.7);
  const highWarp = rogueGeometryNoise((x * 0.41) - 4.3, (z * 0.37) + 3.1, seed, 3.4);
  const curlWarp = rogueGeometryNoise((x * 0.08) + 2.1, (z * 0.08) - 1.4, seed, 5.8);
  const localAngle = (lowWarp * 0.18) + (midWarp * 0.11) + (highWarp * 0.05);
  const rotationCos = Math.cos(localAngle);
  const rotationSin = Math.sin(localAngle);
  const rotatedX = (centeredX * rotationCos) - (centeredZ * rotationSin);
  const rotatedZ = (centeredX * rotationSin) + (centeredZ * rotationCos);
  const radialX = x - centerGridX;
  const radialZ = z - centerGridZ;
  const radialLength = Math.hypot(radialX, radialZ) || 1;
  const radialBias = rogueClamp(radialLength / Math.max(ROGUE_GRID_WIDTH, ROGUE_GRID_HEIGHT), 0, 1);
  const curlStrength = (0.18 + (Math.abs(lowWarp) * 0.12) + (radialBias * 0.18));
  const curlX = (-radialZ / radialLength) * curlStrength * 1.4;
  const curlZ = (radialX / radialLength) * curlStrength * 1.4;
  const waveX = (lowWarp * 0.64) + (midWarp * 0.28) + (highWarp * 0.18);
  const waveZ = (midWarp * 0.52) - (highWarp * 0.24) + (curlWarp * 0.18);
  return {
    x: centerWorldX + rotatedX + (waveX * 0.92) + curlX,
    z: centerWorldZ + rotatedZ + (waveZ * 0.92) + curlZ
  };
}

function rogueBoundaryCornerKey(x, z) {
  return `${x},${z}`;
}

function rogueBoundaryEdgeKey(ax, az, bx, bz) {
  return segmentKey(ax, az, bx, bz);
}

function rogueSideForDirection(x, z, direction) {
  if (direction === 'north') {
    return {
      ax: x,
      az: z,
      bx: x + 1,
      bz: z
    };
  }

  if (direction === 'east') {
    return {
      ax: x + 1,
      az: z,
      bx: x + 1,
      bz: z + 1
    };
  }

  if (direction === 'south') {
    return {
      ax: x + 1,
      az: z + 1,
      bx: x,
      bz: z + 1
    };
  }

  return {
    ax: x,
    az: z + 1,
    bx: x,
    bz: z
  };
}

function rogueBuildBoundaryLoopFromCells(cells, seed = 0) {
  const edgeMap = new Map();
  const edgesByStart = new Map();
  const edgeIndexByKey = new Map();
  const addEdge = (ax, az, bx, bz) => {
    const key = rogueBoundaryEdgeKey(ax, az, bx, bz);
    if (edgeMap.has(key)) {
      edgeMap.delete(key);
      return;
    }
    edgeMap.set(key, {
      ax,
      az,
      bx,
      bz
    });
  };

  for (const cell of cells) {
    addEdge(cell.x, cell.z, cell.x + 1, cell.z);
    addEdge(cell.x + 1, cell.z, cell.x + 1, cell.z + 1);
    addEdge(cell.x + 1, cell.z + 1, cell.x, cell.z + 1);
    addEdge(cell.x, cell.z + 1, cell.x, cell.z);
  }

  if (edgeMap.size < 3) {
    const fallback = cells[0] || { x: 0, z: 0 };
    return {
      loop: rogueCellLoop(fallback.x, fallback.z, seed),
      edgeIndexByKey
    };
  }

  for (const edge of edgeMap.values()) {
    edgesByStart.set(rogueBoundaryCornerKey(edge.ax, edge.az), edge);
  }

  let startEdge = null;
  for (const edge of edgeMap.values()) {
    if (!startEdge || edge.ax < startEdge.ax || (edge.ax === startEdge.ax && edge.az < startEdge.az)) {
      startEdge = edge;
    }
  }

  const orderedEdges = [];
  const visited = new Set();
  let current = startEdge;
  while (current) {
    const currentKey = rogueBoundaryEdgeKey(current.ax, current.az, current.bx, current.bz);
    if (visited.has(currentKey)) {
      break;
    }

    visited.add(currentKey);
    orderedEdges.push(current);
    const next = edgesByStart.get(rogueBoundaryCornerKey(current.bx, current.bz));
    if (!next) {
      break;
    }
    current = next;
    if (current === startEdge) {
      break;
    }
  }

  if (orderedEdges.length < 3 || orderedEdges.length !== edgeMap.size) {
    const fallback = cells[0] || { x: 0, z: 0 };
    return {
      loop: rogueCellLoop(fallback.x, fallback.z, seed),
      edgeIndexByKey
    };
  }

  const loop = orderedEdges.map((edge) => {
    const point = rogueGridToWorld(edge.ax, edge.az, seed);
    return [point.x, point.z];
  });

  orderedEdges.forEach((edge, index) => {
    edgeIndexByKey.set(rogueBoundaryEdgeKey(edge.ax, edge.az, edge.bx, edge.bz), index);
  });

  return {
    loop,
    edgeIndexByKey
  };
}

function rogueWorldSegmentForSide(x, z, direction, seed = 0) {
  const side = rogueSideForDirection(x, z, direction);
  const a = rogueGridToWorld(side.ax, side.az, seed);
  const b = rogueGridToWorld(side.bx, side.bz, seed);
  return {
    ax: a.x,
    az: a.z,
    bx: b.x,
    bz: b.z
  };
}

function rogueFindNearestLoopEdgeIndex(loop, segment, epsilon = 1e-6) {
  if (!Array.isArray(loop) || loop.length < 2) {
    return 0;
  }

  const midpoint = {
    x: (segment.ax + segment.bx) * 0.5,
    z: (segment.az + segment.bz) * 0.5
  };
  let bestIndex = 0;
  let bestDistance = Infinity;

  for (let index = 0; index < loop.length; index += 1) {
    const current = loop[index];
    const next = loop[(index + 1) % loop.length];
    const currentX = Number(current?.x ?? current?.[0] ?? 0) || 0;
    const currentZ = Number(current?.z ?? current?.[1] ?? 0) || 0;
    const nextX = Number(next?.x ?? next?.[0] ?? 0) || 0;
    const nextZ = Number(next?.z ?? next?.[1] ?? 0) || 0;
    const distance = distanceSqPointToSegment(midpoint.x, midpoint.z, currentX, currentZ, nextX, nextZ);
    if (distance < bestDistance - epsilon) {
      bestDistance = distance;
      bestIndex = index;
    }
  }

  return bestIndex;
}

function rogueLoopPoint(point) {
  return {
    x: Number(point?.x ?? point?.[0] ?? 0) || 0,
    z: Number(point?.z ?? point?.[1] ?? 0) || 0
  };
}

function roguePolygonSignedArea(loop) {
  if (!Array.isArray(loop) || loop.length < 3) {
    return 0;
  }

  let area = 0;
  for (let index = 0; index < loop.length; index += 1) {
    const current = rogueLoopPoint(loop[index]);
    const next = rogueLoopPoint(loop[(index + 1) % loop.length]);
    area += (current.x * next.z) - (next.x * current.z);
  }

  return area * 0.5;
}

function rogueNormalizeVector(x, z, fallbackX = 1, fallbackZ = 0) {
  const length = Math.hypot(x, z);
  if (length <= 1e-6) {
    return { x: fallbackX, z: fallbackZ };
  }
  return { x: x / length, z: z / length };
}

function rogueWobbleLoop(loop, seed, options = {}) {
  const points = Array.isArray(loop) ? loop.map(rogueLoopPoint) : [];
  if (points.length < 3) {
    return points;
  }

  const orientation = roguePolygonSignedArea(points) >= 0 ? 1 : -1;
  const centroid = points.reduce((accumulator, point) => {
    accumulator.x += point.x;
    accumulator.z += point.z;
    return accumulator;
  }, { x: 0, z: 0 });
  centroid.x /= points.length;
  centroid.z /= points.length;

  const cornerAmplitude = Number(options.cornerAmplitude ?? 0.24) || 0;
  const edgeAmplitude = Number(options.edgeAmplitude ?? 0.14) || 0;
  const tangentAmplitude = Number(options.tangentAmplitude ?? 0.07) || 0;
  const radialAmplitude = Number(options.radialAmplitude ?? 0.05) || 0;
  const seedBias = Number(options.seedBias ?? 0) || 0;

  return points.map((current, index) => {
    const prev = points[(index + points.length - 1) % points.length];
    const next = points[(index + 1) % points.length];
    const prevEdge = {
      x: current.x - prev.x,
      z: current.z - prev.z
    };
    const nextEdge = {
      x: next.x - current.x,
      z: next.z - current.z
    };
    const prevNormal = rogueNormalizeVector(
      orientation >= 0 ? prevEdge.z : -prevEdge.z,
      orientation >= 0 ? -prevEdge.x : prevEdge.x,
      0,
      1
    );
    const nextNormal = rogueNormalizeVector(
      orientation >= 0 ? nextEdge.z : -nextEdge.z,
      orientation >= 0 ? -nextEdge.x : nextEdge.x,
      0,
      1
    );
    const bisector = rogueNormalizeVector(prevNormal.x + nextNormal.x, prevNormal.z + nextNormal.z, prevNormal.x, prevNormal.z);
    const tangent = rogueNormalizeVector(prevEdge.x + nextEdge.x, prevEdge.z + nextEdge.z, nextEdge.x || prevEdge.x || 1, nextEdge.z || prevEdge.z || 0);
    const radial = rogueNormalizeVector(current.x - centroid.x, current.z - centroid.z, bisector.x, bisector.z);

    const wave = rogueGeometryNoise(current.x + (index * 0.37) + seedBias, current.z - (index * 0.41) - seedBias, seed, index * 0.9);
    const wobble = rogueGeometryNoise(current.x - (index * 0.21) + seedBias, current.z + (index * 0.29) - seedBias, seed, 4.1);
    const lift = rogueGeometryNoise(current.x + (index * 0.13), current.z + (index * 0.19), seed, 7.3);
    const cornerPush = cornerAmplitude * wave;
    const edgePush = edgeAmplitude * wobble;
    const tangentPush = tangentAmplitude * Math.sin((index * 1.27) + (seed * 0.0001));
    const radialPush = radialAmplitude * lift;

    return {
      x: current.x
        + (bisector.x * (cornerPush + edgePush))
        + (tangent.x * tangentPush)
        + (radial.x * radialPush),
      z: current.z
        + (bisector.z * (cornerPush + edgePush))
        + (tangent.z * tangentPush)
        + (radial.z * radialPush)
    };
  });
}

function rogueSurfaceProfile(role, node, x, z, seed, isCorridor = false) {
  const roleName = typeof role === 'string' && role.startsWith('key-') ? 'key' : role;
  const depth = Number(node?.depth ?? 0) || 0;
  const origin = rogueCellCenter(x, z, seed);
  const roomBase = {
    start: { floor: 0.08, ceiling: 3.60 },
    main: { floor: 0.12, ceiling: 3.72 },
    treasure: { floor: 0.18, ceiling: 3.96 },
    combat: { floor: 0.14, ceiling: 3.78 },
    exit: { floor: 0.20, ceiling: 4.02 },
    hazard: { floor: 0.26, ceiling: 3.36 },
    key: { floor: 0.18, ceiling: 3.86 },
    corridor: { floor: 0.04, ceiling: 3.30 },
    transition: { floor: 0.08, ceiling: 3.46 }
  };

  const profileKey = isCorridor ? (roleName === 'transition' ? 'transition' : 'corridor') : (roomBase[roleName] ? roleName : 'main');
  const baseProfile = roomBase[profileKey] || roomBase.main;
  const floorNoise = rogueGeometryNoise(x + 0.25, z - 0.5, seed, 2.1);
  const ceilingNoise = rogueGeometryNoise(x - 0.75, z + 0.5, seed, 4.3);
  let floorBase = rogueClamp(baseProfile.floor + (depth * 0.024) + (floorNoise * 0.05), -0.12, 0.88);
  let ceilingBase = rogueClamp(baseProfile.ceiling - (depth * 0.010) + (ceilingNoise * 0.06), 2.90, 4.40);
  if (isCorridor) {
    floorBase = rogueClamp(floorBase - 0.08, -0.20, 0.60);
    ceilingBase = rogueClamp(Math.max(ceilingBase, floorBase + 4.10), 4.10, 4.80);
  } else {
    ceilingBase = rogueClamp(Math.max(ceilingBase, floorBase + 2.15), 2.90, 4.50);
  }
  const floorSlopeX = rogueClamp(rogueGeometryNoise(x, z, seed, 5.5) * (isCorridor ? 0.0009 : 0.0035), -0.008, 0.008);
  const floorSlopeZ = rogueClamp(rogueGeometryNoise(x, z, seed, 6.9) * (isCorridor ? 0.0009 : 0.0035), -0.008, 0.008);
  const ceilingSlopeX = rogueClamp(rogueGeometryNoise(x + 1.0, z - 0.5, seed, 8.1) * (isCorridor ? 0.0007 : 0.0025), -0.007, 0.007);
  const ceilingSlopeZ = rogueClamp(rogueGeometryNoise(x - 0.5, z + 1.0, seed, 9.7) * (isCorridor ? 0.0007 : 0.0025), -0.007, 0.007);

  return {
    floor: {
      base: floorBase,
      slopeX: floorSlopeX,
      slopeZ: floorSlopeZ,
      originX: origin.x,
      originZ: origin.z
    },
    ceiling: {
      base: ceilingBase,
      slopeX: ceilingSlopeX,
      slopeZ: ceilingSlopeZ,
      originX: origin.x,
      originZ: origin.z
    }
  };
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

function rogueBuildTaperCells(width, height) {
  const cells = [];
  const halfHeight = Math.floor(height / 2);
  const maxHalfWidth = Math.max(1, Math.floor(width / 2));

  for (let dz = -halfHeight; dz <= halfHeight; dz += 1) {
    const blend = Math.abs(dz) / Math.max(1, halfHeight || 1);
    const rowHalfWidth = Math.max(1, Math.round(maxHalfWidth - (blend * Math.max(0, maxHalfWidth - 1))));
    for (let dx = -rowHalfWidth; dx <= rowHalfWidth; dx += 1) {
      cells.push([dx, dz]);
    }
  }

  return cells;
}

function rogueBuildNotchedCells(width, height, notchSide = 'north') {
  const cells = [];
  const halfWidth = Math.floor(width / 2);
  const halfHeight = Math.floor(height / 2);
  const notchWidth = Math.max(1, Math.floor(width / 3));
  const notchHeight = Math.max(1, Math.floor(height / 3));

  for (let dz = -halfHeight; dz <= halfHeight; dz += 1) {
    for (let dx = -halfWidth; dx <= halfWidth; dx += 1) {
      const onNorth = dz <= -halfHeight + notchHeight && Math.abs(dx) <= Math.floor(notchWidth / 2);
      const onSouth = dz >= halfHeight - notchHeight && Math.abs(dx) <= Math.floor(notchWidth / 2);
      const onWest = dx <= -halfWidth + notchHeight && Math.abs(dz) <= Math.floor(notchWidth / 2);
      const onEast = dx >= halfWidth - notchHeight && Math.abs(dz) <= Math.floor(notchWidth / 2);
      const remove =
        (notchSide === 'north' && onNorth) ||
        (notchSide === 'south' && onSouth) ||
        (notchSide === 'west' && onWest) ||
        (notchSide === 'east' && onEast);
      if (!remove) {
        cells.push([dx, dz]);
      }
    }
  }

  return cells;
}

function rogueBuildChamferCells(width, height) {
  const cells = [];
  const cut = Math.max(1, Math.min(width, height) >= 6 ? 2 : 1);
  const halfWidth = Math.floor(width / 2);
  const halfHeight = Math.floor(height / 2);

  for (let dz = -halfHeight; dz <= halfHeight; dz += 1) {
    for (let dx = -halfWidth; dx <= halfWidth; dx += 1) {
      const corner = Math.abs(dx) > halfWidth - cut && Math.abs(dz) > halfHeight - cut;
      if (corner) {
        continue;
      }
      cells.push([dx, dz]);
    }
  }

  return cells;
}

function rogueBuildLShapeCells(width, height, corner = 'nw') {
  const cells = [];
  const halfWidth = Math.floor(width / 2);
  const halfHeight = Math.floor(height / 2);
  const cutWidth = Math.max(2, Math.floor(width / 2));
  const cutHeight = Math.max(2, Math.floor(height / 2));

  for (let dz = -halfHeight; dz <= halfHeight; dz += 1) {
    for (let dx = -halfWidth; dx <= halfWidth; dx += 1) {
      const removeNW = corner === 'nw' && dx < -halfWidth + cutWidth && dz < -halfHeight + cutHeight;
      const removeNE = corner === 'ne' && dx > halfWidth - cutWidth && dz < -halfHeight + cutHeight;
      const removeSW = corner === 'sw' && dx < -halfWidth + cutWidth && dz > halfHeight - cutHeight;
      const removeSE = corner === 'se' && dx > halfWidth - cutWidth && dz > halfHeight - cutHeight;
      if (removeNW || removeNE || removeSW || removeSE) {
        continue;
      }
      cells.push([dx, dz]);
    }
  }

  return cells;
}

function rogueBuildTwinCells(width, height) {
  const cells = new Set();
  const leftWidth = Math.max(2, Math.floor(width * 0.58));
  const rightWidth = Math.max(2, width - Math.floor(width * 0.42));
  const leftHalfWidth = Math.floor(leftWidth / 2);
  const rightHalfWidth = Math.floor(rightWidth / 2);
  const halfHeight = Math.floor(height / 2);
  const leftOffset = -Math.max(1, Math.floor(width / 4));
  const rightOffset = Math.max(1, Math.floor(width / 4));

  for (let dz = -halfHeight; dz <= halfHeight; dz += 1) {
    for (let dx = -leftHalfWidth; dx <= leftHalfWidth; dx += 1) {
      cells.add(`${dx + leftOffset},${dz}`);
    }
    for (let dx = -rightHalfWidth; dx <= rightHalfWidth; dx += 1) {
      cells.add(`${dx + rightOffset},${dz}`);
    }
  }

  return [...cells].map((entry) => entry.split(',').map((value) => Number(value)));
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
    rogueMakeTemplate('start-chamfer', rogueBuildChamferCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('start-taper', rogueBuildTaperCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('start-twin', rogueBuildTwinCells(5, 3), rogueBuildCardinalConnectors(2, 1), 'any'),
    rogueMakeTemplate('start-octagon', rogueBuildOctagonCells(2), rogueBuildCardinalConnectors(2, 2), 'any')
  ],
  main: [
    rogueMakeTemplate('main-hall', rogueBuildRectCells(5, 3), rogueBuildCardinalConnectors(2, 1), 'horizontal'),
    rogueMakeTemplate('main-needle', rogueBuildRectCells(3, 5), rogueBuildCardinalConnectors(1, 2), 'vertical'),
    rogueMakeTemplate('main-taper', rogueBuildTaperCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('main-octagon', rogueBuildOctagonCells(2), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('main-cross', rogueBuildCrossCells(2), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('main-chamfer', rogueBuildChamferCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('main-lshape', rogueBuildLShapeCells(5, 5, 'ne'), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('main-notch', rogueBuildNotchedCells(5, 5, 'north'), rogueBuildCardinalConnectors(2, 2), 'any')
  ],
  branch: [
    rogueMakeTemplate('branch-needle', rogueBuildRectCells(3, 5), rogueBuildCardinalConnectors(1, 2), 'vertical'),
    rogueMakeTemplate('branch-square', rogueBuildRectCells(3, 3), rogueBuildCardinalConnectors(1, 1), 'any'),
    rogueMakeTemplate('branch-taper', rogueBuildTaperCells(3, 5), rogueBuildCardinalConnectors(1, 2), 'any'),
    rogueMakeTemplate('branch-cross', rogueBuildCrossCells(2), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('branch-chamfer', rogueBuildChamferCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('branch-twin', rogueBuildTwinCells(5, 3), rogueBuildCardinalConnectors(2, 1), 'any')
  ],
  key: [
    rogueMakeTemplate('key-square', rogueBuildRectCells(3, 3), rogueBuildCardinalConnectors(1, 1), 'any'),
    rogueMakeTemplate('key-taper', rogueBuildTaperCells(3, 5), rogueBuildCardinalConnectors(1, 2), 'any'),
    rogueMakeTemplate('key-chamfer', rogueBuildChamferCells(3, 3), rogueBuildCardinalConnectors(1, 1), 'any'),
    rogueMakeTemplate('key-octagon', rogueBuildOctagonCells(1), rogueBuildCardinalConnectors(1, 1), 'any')
  ],
  'key-red': [
    rogueMakeTemplate('key-red-square', rogueBuildRectCells(3, 3), rogueBuildCardinalConnectors(1, 1), 'any'),
    rogueMakeTemplate('key-red-taper', rogueBuildTaperCells(3, 5), rogueBuildCardinalConnectors(1, 2), 'any'),
    rogueMakeTemplate('key-red-chamfer', rogueBuildChamferCells(3, 3), rogueBuildCardinalConnectors(1, 1), 'any'),
    rogueMakeTemplate('key-red-octagon', rogueBuildOctagonCells(1), rogueBuildCardinalConnectors(1, 1), 'any')
  ],
  'key-blue': [
    rogueMakeTemplate('key-blue-square', rogueBuildRectCells(3, 3), rogueBuildCardinalConnectors(1, 1), 'any'),
    rogueMakeTemplate('key-blue-taper', rogueBuildTaperCells(3, 5), rogueBuildCardinalConnectors(1, 2), 'any'),
    rogueMakeTemplate('key-blue-chamfer', rogueBuildChamferCells(3, 3), rogueBuildCardinalConnectors(1, 1), 'any'),
    rogueMakeTemplate('key-blue-octagon', rogueBuildOctagonCells(1), rogueBuildCardinalConnectors(1, 1), 'any')
  ],
  'key-yellow': [
    rogueMakeTemplate('key-yellow-square', rogueBuildRectCells(3, 3), rogueBuildCardinalConnectors(1, 1), 'any'),
    rogueMakeTemplate('key-yellow-taper', rogueBuildTaperCells(3, 5), rogueBuildCardinalConnectors(1, 2), 'any'),
    rogueMakeTemplate('key-yellow-chamfer', rogueBuildChamferCells(3, 3), rogueBuildCardinalConnectors(1, 1), 'any'),
    rogueMakeTemplate('key-yellow-octagon', rogueBuildOctagonCells(1), rogueBuildCardinalConnectors(1, 1), 'any')
  ],
  treasure: [
    rogueMakeTemplate('treasure-vault', rogueBuildRectCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('treasure-bulge', rogueBuildTaperCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('treasure-octagon', rogueBuildOctagonCells(2), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('treasure-cross', rogueBuildCrossCells(2), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('treasure-chamfer', rogueBuildChamferCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('treasure-galleria', rogueBuildTwinCells(5, 3), rogueBuildCardinalConnectors(2, 1), 'any')
  ],
  combat: [
    rogueMakeTemplate('combat-cross', rogueBuildCrossCells(2), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('combat-taper', rogueBuildTaperCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('combat-octagon', rogueBuildOctagonCells(2), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('combat-vault', rogueBuildRectCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('combat-chamfer', rogueBuildChamferCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('combat-arena', rogueBuildLShapeCells(5, 5, 'nw'), rogueBuildCardinalConnectors(2, 2), 'any')
  ],
  exit: [
    rogueMakeTemplate('exit-vault', rogueBuildRectCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('exit-taper', rogueBuildTaperCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('exit-octagon', rogueBuildOctagonCells(2), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('exit-cross', rogueBuildCrossCells(2), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('exit-chamfer', rogueBuildChamferCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any')
  ],
  hazard: [
    rogueMakeTemplate('hazard-vault', rogueBuildRectCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('hazard-taper', rogueBuildTaperCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('hazard-octagon', rogueBuildOctagonCells(2), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('hazard-cross', rogueBuildCrossCells(2), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('hazard-chamfer', rogueBuildChamferCells(5, 5), rogueBuildCardinalConnectors(2, 2), 'any'),
    rogueMakeTemplate('hazard-twin', rogueBuildTwinCells(5, 3), rogueBuildCardinalConnectors(2, 1), 'any')
  ]
};

function rogueTemplatesForRole(role) {
  return ROGUE_ROOM_TEMPLATE_LIBRARY[role] || ROGUE_ROOM_TEMPLATE_LIBRARY.main;
}

function rogueMaterialSetForRole(themeVariant, role, isCorridor) {
  if (role === 'transition') {
    return themeVariant.transitionMaterials || themeVariant.corridorMaterials;
  }
  if (isCorridor) {
    return themeVariant.corridorMaterials;
  }
  if (role === 'hazard') {
    return {
      floor: 'liquidFloor',
      ceiling: themeVariant.specialMaterials.ceiling,
      wall: themeVariant.specialMaterials.wall
    };
  }
  if (role === 'key' || (typeof role === 'string' && role.startsWith('key-')) || role === 'treasure' || role === 'combat' || role === 'exit') {
    return themeVariant.specialMaterials;
  }
  return themeVariant.roomMaterials;
}

function rogueKeyColorForRole(role) {
  if (role === 'key-red') {
    return 'red';
  }
  if (role === 'key-blue') {
    return 'blue';
  }
  if (role === 'key-yellow') {
    return 'yellow';
  }
  return role === 'key' ? 'yellow' : null;
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

export function createRogueStyleCampaignLevel(options = {}) {
  const baseSeed = normalizeSeed(options.seed ?? 0xC0FFEE01);
  const levelIndex = Number(options.levelIndex ?? 0) || 0;
  const runIndex = Number(options.runIndex ?? options.campaignRunIndex ?? 0) || 0;
  const maxAttempts = Math.max(1, Number(options.attempts ?? 64) || 64);
  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidateSeed = deriveSeed(baseSeed, `rogue-campaign:${runIndex}:${levelIndex}:${attempt}`);
    try {
      return createRogueStyleLevel(candidateSeed);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw new Error(`Failed to build a rogue-style campaign level: ${lastError ? lastError.message : 'unknown error'}`);
}

function buildRogueLayout(rng, seed, themeVariant, attempt) {
  const geometrySeed = deriveSeed(seed, 'rogue-geometry');
  const layout = {
    seed,
    attempt,
    geometrySeed,
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
      const center = rogueCellCenter(x, z, geometrySeed);
      const cellMaterials = rogueMaterialSetForRole(themeVariant, node.role, false);
      const surfaces = rogueSurfaceProfile(node.role, node, x, z, geometrySeed, false);
      const info = {
        id: `rogue-${x}-${z}`,
        x,
        z,
        center,
        world: center,
        loop: rogueCellLoop(x, z, geometrySeed),
        nodeId: node.id,
        role: node.role,
        theme: themeVariant.theme,
        floor: surfaces.floor,
        ceiling: surfaces.ceiling,
        floorMaterial: cellMaterials.floor,
        ceilingMaterial: cellMaterials.ceiling,
        wallMaterial: cellMaterials.wall,
        hazardDamagePerSecond: node.role === 'hazard' ? 8 : 0,
        hazardType: node.role === 'hazard' ? 'lava' : null
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
    const horizontalFlow = Math.abs(flowVector.x) >= Math.abs(flowVector.z);
    const allowAnchorShift = typeof node.role === 'string' && (node.role === 'key' || node.role.startsWith('key-') || node.role === 'branch');
    const anchorOffsets = allowAnchorShift
      ? layoutRngShuffle(rng, [
        { x: 0, z: 0 },
        { x: horizontalFlow ? 0 : 1, z: horizontalFlow ? 1 : 0 },
        { x: horizontalFlow ? 0 : -1, z: horizontalFlow ? -1 : 0 },
        { x: horizontalFlow ? 0 : 2, z: horizontalFlow ? 2 : 0 },
        { x: horizontalFlow ? 0 : -2, z: horizontalFlow ? -2 : 0 },
        { x: 1, z: 0 },
        { x: -1, z: 0 },
        { x: 0, z: 1 },
        { x: 0, z: -1 },
        { x: 1, z: 1 },
        { x: -1, z: 1 },
        { x: 1, z: -1 },
        { x: -1, z: -1 }
      ])
      : [{ x: 0, z: 0 }];

    const originalAnchor = rogueClonePoint(node.anchor);
    for (const offset of anchorOffsets) {
      const trialAnchor = {
        x: originalAnchor.x + offset.x,
        z: originalAnchor.z + offset.z
      };
      if (!rogueWithinBounds(trialAnchor.x, trialAnchor.z)) {
        continue;
      }

      node.anchor = trialAnchor;
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
    }
    node.anchor = originalAnchor;
    return false;
  }

  function removeNode(node) {
    for (const cell of node.cells) {
      layout.roomCells.delete(cell.key);
      layout.cellInfo.delete(cell.key);
    }
    node.cells = [];
    node.connectors = [];

    layout.roomBuffer.clear();
    for (const key of layout.roomCells) {
      const [xText, zText] = key.split(',');
      addRoomBuffer(Number(xText), Number(zText));
    }
  }

  function orderedConnectors(node, toward) {
    return node.connectors
      .map((connector) => {
        const vector = rogueDirectionVector(connector.direction);
        const score = (vector.dx * toward.x) + (vector.dz * toward.z);
        return { connector, score };
      })
      .filter(({ connector }) => rogueWithinBounds(connector.outside.x, connector.outside.z))
      .sort((a, b) => b.score - a.score)
      .map(({ connector }) => connector);
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

    function expandDiagonalPath(path) {
      if (!Array.isArray(path) || path.length < 2) {
        return path;
      }

      const expanded = [path[0]];
      for (let index = 1; index < path.length; index += 1) {
        const previous = expanded[expanded.length - 1];
        const next = path[index];
        const dx = next.x - previous.x;
        const dz = next.z - previous.z;
        if (Math.abs(dx) === 1 && Math.abs(dz) === 1) {
          const firstOption = { x: previous.x + dx, z: previous.z };
          const secondOption = { x: previous.x, z: previous.z + dz };
          let inserted = false;
          if (passable(firstOption.x, firstOption.z)) {
            expanded.push(firstOption);
            inserted = true;
          } else if (passable(secondOption.x, secondOption.z)) {
            expanded.push(secondOption);
            inserted = true;
          }

          if (!inserted) {
            return null;
          }
        }
        expanded.push(next);
      }

      return expanded;
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
          return expandDiagonalPath(path);
        }

        for (const step of ROGUE_ROUTE_STEPS) {
          const nx = current.x + step.dx;
          const nz = current.z + step.dz;
          if (!passable(nx, nz)) {
            continue;
          }
          if (Math.abs(step.dx) === 1 && Math.abs(step.dz) === 1) {
            if (!passable(current.x + step.dx, current.z) || !passable(current.x, current.z + step.dz)) {
              continue;
            }
          }

          const nextKey = keyOf(nx, nz);
          const turnPenalty = current.dir && current.dir !== step.name
            ? (localMode === 'drift' ? 0.32 : localMode === 'elbow' ? 0.18 : 0.08)
            : 0;
          const corridorBonus = layout.corridorCells.has(nextKey) ? -0.04 : 0;
          const nextG = current.g + (step.cost || 1) + turnPenalty + corridorBonus;
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

    const sourceCandidates = orderedConnectors(sourceNode, towardTarget);
    const targetCandidates = orderedConnectors(targetNode, towardSource);
    if (sourceCandidates.length === 0 || targetCandidates.length === 0) {
      throw new Error(`Rogue layout failed: no connector between ${sourceNode.id} and ${targetNode.id}`);
    }

    let chosenSourceConnector = null;
    let chosenTargetConnector = null;
    let chosenPath = null;

    for (const sourceConnector of sourceCandidates) {
      for (const targetConnector of targetCandidates) {
        const path = routePath(sourceConnector.outside, targetConnector.outside, mode);
        if (!path) {
          continue;
        }
        chosenSourceConnector = sourceConnector;
        chosenTargetConnector = targetConnector;
        chosenPath = path;
        break;
      }
      if (chosenPath) {
        break;
      }
    }

    if (!chosenPath || !chosenSourceConnector || !chosenTargetConnector) {
      throw new Error(`Rogue layout failed: corridor path between ${sourceNode.id} and ${targetNode.id}`);
    }

    for (const cell of chosenPath) {
      const key = keyOf(cell.x, cell.z);
      if (layout.roomCells.has(key)) {
        continue;
      }
      if (!layout.corridorCells.has(key)) {
        layout.corridorCells.add(key);
        const cellRole = cell === chosenPath[0] || cell === chosenPath[chosenPath.length - 1] ? 'transition' : 'corridor';
        const corridorMaterials = rogueMaterialSetForRole(themeVariant, cellRole, true);
        const surfaces = rogueSurfaceProfile(cellRole, null, cell.x, cell.z, geometrySeed, true);
        const center = rogueCellCenter(cell.x, cell.z, geometrySeed);
        layout.cellInfo.set(key, {
          id: `rogue-${cell.x}-${cell.z}`,
          x: cell.x,
          z: cell.z,
          center,
          world: center,
          loop: rogueCellLoop(cell.x, cell.z, geometrySeed),
          nodeId: null,
          role: cellRole,
          theme: themeVariant.theme,
          floor: surfaces.floor,
          ceiling: surfaces.ceiling,
          floorMaterial: corridorMaterials.floor,
          ceilingMaterial: corridorMaterials.ceiling,
          wallMaterial: corridorMaterials.wall
        });
      }
    }

    const link = {
      sourceNodeId: sourceNode.id,
      targetNodeId: targetNode.id,
      sourceConnector: chosenSourceConnector,
      targetConnector: chosenTargetConnector,
      path: chosenPath,
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

  const mainNodeRoles = ['start', 'main', 'treasure', 'hazard', 'combat', 'exit'];
  let heading = (rng.nextFloat() * 0.7) - 0.35;
  for (let index = 1; index < ROGUE_MAIN_ROOM_COUNT; index += 1) {
    const role = mainNodeRoles[index] || 'main';
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

  const branchSpecs = [
    { role: 'key-red', candidateAnchors: [0, 1, 2] },
    { role: 'key-blue', candidateAnchors: [1, 2, 3] },
    { role: 'key-yellow', candidateAnchors: [2, 3, 4] }
  ];
  const branches = [];
  for (const spec of branchSpecs) {
    const anchorChoices = layoutRngShuffle(rng, spec.candidateAnchors.slice());
    let placed = false;

    for (const branchAnchorIndex of anchorChoices) {
      const anchorNode = mainNodes[branchAnchorIndex];
      const forwardNode = mainNodes[Math.min(branchAnchorIndex + 1, mainNodes.length - 1)];
      const backwardNode = mainNodes[Math.max(branchAnchorIndex - 1, 0)];
      const forwardVector = {
        x: forwardNode.anchor.x - backwardNode.anchor.x,
        z: forwardNode.anchor.z - backwardNode.anchor.z
      };
      const forwardLength = Math.hypot(forwardVector.x, forwardVector.z) || 1;
      const forwardUnit = {
        x: forwardVector.x / forwardLength,
        z: forwardVector.z / forwardLength
      };
      const sideSigns = layoutRngShuffle(rng, [-1, 1]);
      for (const sideSign of sideSigns) {
        const sideVector = {
          x: -forwardUnit.z * sideSign,
          z: forwardUnit.x * sideSign
        };

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

          const node = buildNode(spec.role, spec.role, candidate, anchorNode.depth + 1);
          const flowVector = {
            x: anchorNode.anchor.x - candidate.x,
            z: anchorNode.anchor.z - candidate.z
          };
          if (!placeNode(node, flowVector)) {
            continue;
          }

          try {
            connectNodes(anchorNode, node, 'elbow');
          } catch (error) {
            removeNode(node);
            continue;
          }

          node.depth = anchorNode.depth + 1;
          node.branchAnchorIndex = branchAnchorIndex;
          branches.push(node);
          placed = true;
          break;
        }

        if (placed) {
          break;
        }
      }

      if (placed) {
        break;
      }
    }

    if (!placed) {
      throw new Error(`Rogue layout failed: could not place branch room ${spec.role}`);
    }
  }

  layout.nodes.push(...branches);

  const mainLinks = [];
  for (let index = 1; index < mainNodes.length; index += 1) {
    const sourceNode = mainNodes[index - 1];
    const targetNode = mainNodes[index];
    const mode = index % 2 === 0 ? 'elbow' : 'direct';
    const link = connectNodes(sourceNode, targetNode, mode);
    if (!link) {
      return null;
    }
    mainLinks.push(link);
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

  function addGateLink(link, doorId, name, requiredKey) {
    if (!link || !link.sourceConnector) {
      throw new Error(`Rogue layout failed: missing ${doorId} gate corridor`);
    }

    const gateConnector = link.sourceConnector;
    layout.doorLinks.push({
      id: doorId,
      name,
      locked: true,
      requiredKey,
      leftCell: {
        x: gateConnector.x,
        z: gateConnector.z
      },
      rightCell: {
        x: gateConnector.outside.x,
        z: gateConnector.outside.z
      },
      direction: gateConnector.direction,
      sourceNodeId: link.sourceNodeId,
      targetNodeId: link.targetNodeId
    });
  }

  addGateLink(mainLinks[2], 'red-gate', 'Red Gate', 'red');
  addGateLink(mainLinks[3], 'blue-gate', 'Blue Gate', 'blue');
  addGateLink(mainLinks[4], 'yellow-gate', 'Yellow Gate', 'yellow');

  const startCenter = rogueCellCenter(mainNodes[0].anchor.x, mainNodes[0].anchor.z, geometrySeed);
  const exitCenter = rogueCellCenter(mainNodes[mainNodes.length - 1].anchor.x, mainNodes[mainNodes.length - 1].anchor.z, geometrySeed);

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
    const center = rogueCellCenter(node.anchor.x, node.anchor.z, geometrySeed);
    const roomCells = node.cells.slice();
    const spawnCells = rng.shuffle(roomCells);
    const safeCount = node.role === 'start' ? 0 : node.role === 'exit' ? 2 : 1;
    const enemyKindsByRole = {
      main: ['zombie', 'imp'],
      key: ['zombie', 'imp'],
      'key-red': ['zombie', 'imp'],
      'key-blue': ['zombie', 'imp'],
      'key-yellow': ['zombie', 'imp'],
      treasure: ['zombie', 'demon'],
      hazard: ['zombie', 'imp'],
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
    } else if (node.role === 'key' || node.role.startsWith('key-')) {
      const keyColor = rogueKeyColorForRole(node.role) || 'yellow';
      const accentColor = keyColor === 'red' ? '#ff7a7a' : keyColor === 'blue' ? '#7ab6ff' : '#ffe08a';
      pushPickup('key', center.x, center.z, { key: keyColor });
      pushPickup('health', center.x + 1.0, center.z - 0.8, { amount: 25 });
      pushProp('crate', center.x - 1.0, center.z + 0.8, {
        width: 0.7,
        height: 0.74,
        depth: 0.7,
        rotation: 0.18,
        color: '#8d6742'
      });
      pushLight(center.x, center.z, accentColor, 1.12, 0.22);
      pushLight(center.x - 1.2, center.z + 0.8, '#dff5ff', 1.0, 0.18);
      scriptedEvents.push({
        id: `event-${scriptedEvents.length + 1}`,
        kind: 'event',
        x: center.x,
        z: center.z,
        action: 'message',
        payload: { text: `Find the ${keyColor} gate.` }
      });
    } else if (node.role === 'hazard') {
      pushPickup('health', center.x - 1.0, center.z + 0.8, { amount: 25 });
      pushProp('machine', center.x + 0.9, center.z - 0.8, {
        width: 1.2,
        height: 1.0,
        depth: 1.2,
        rotation: -0.14,
        color: '#7b4350'
      });
      pushProp('barrel', center.x - 1.1, center.z + 0.9, {
        width: 0.75,
        height: 0.9,
        depth: 0.75,
        rotation: 0.2,
        color: '#8f563f'
      });
      pushLight(center.x, center.z, '#ff8b7a', 1.22, 0.48);
      pushLight(center.x + 1.0, center.z - 0.8, '#ffb57d', 1.1, 0.38);
      pushDecal('warning', center.x, center.z, 0.05, '#ff6f61', 0.72);
      node.hazardDamagePerSecond = 8;
      node.hazardType = 'lava';
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
      const spawnCount = node.role === 'exit' ? 2 : node.role === 'combat' ? 3 : node.role === 'treasure' ? 2 : node.role === 'hazard' ? 1 : 1;
      for (let index = 0; index < spawnCount; index += 1) {
        const cell = spawnCells[index % spawnCells.length];
        const point = rogueCellCenter(cell.x, cell.z, geometrySeed);
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
      const point = rogueCellCenter(mid.x, mid.z, geometrySeed);
      pushDecal('warning', point.x, point.z, (rng.nextFloat() * 0.8) - 0.4, '#e7c65d', 0.5);
    }
  }

  function buildSectors() {
    const sectors = [];
    const sectorByCell = new Map();
    const sectorEdgeIndexById = new Map();
    let explicitPortalCount = 0;
    const corridorCellKeys = Array.from(layout.corridorCells).sort((a, b) => a.localeCompare(b));
    const corridorComponents = [];
    const visitedCorridorCells = new Set();

    for (const startKey of corridorCellKeys) {
      if (visitedCorridorCells.has(startKey)) {
        continue;
      }

      const component = [];
      const queue = [startKey];
      visitedCorridorCells.add(startKey);

      while (queue.length > 0) {
        const currentKey = queue.shift();
        const currentInfo = layout.cellInfo.get(currentKey);
        if (!currentInfo) {
          continue;
        }

        component.push(currentInfo);

        for (const dir of ROGUE_DIRECTIONS) {
          const neighborKey = keyOf(currentInfo.x + dir.dx, currentInfo.z + dir.dz);
          if (!layout.corridorCells.has(neighborKey) || visitedCorridorCells.has(neighborKey)) {
            continue;
          }
          visitedCorridorCells.add(neighborKey);
          queue.push(neighborKey);
        }
      }

      if (component.length > 0) {
        corridorComponents.push(component);
      }
    }

    function distanceSqPointToLoop(x, z, loop) {
      if (!Array.isArray(loop) || loop.length < 2) {
        return Infinity;
      }

      let best = Infinity;
      for (let index = 0; index < loop.length; index += 1) {
        const current = loop[index];
        const next = loop[(index + 1) % loop.length];
        const currentX = Number(current?.x ?? current?.[0] ?? 0) || 0;
        const currentZ = Number(current?.z ?? current?.[1] ?? 0) || 0;
        const nextX = Number(next?.x ?? next?.[0] ?? 0) || 0;
        const nextZ = Number(next?.z ?? next?.[1] ?? 0) || 0;
        const distance = distanceSqPointToSegment(x, z, currentX, currentZ, nextX, nextZ);
        if (distance < best) {
          best = distance;
        }
      }

      return best;
    }

    function findNearestSectorToPoint(point, excludedIds = []) {
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.z)) {
        return null;
      }

      const excluded = new Set(excludedIds);
      let bestSector = null;
      let bestDistance = Infinity;
      for (const sector of sectors) {
        if (excluded.has(sector.id)) {
          continue;
        }
        const distance = distanceSqPointToLoop(point.x, point.z, sector.loop);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestSector = sector;
        }
      }
      return bestSector;
    }

    function findNearestCorridorSectorToPoint(point, excludedIds = []) {
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.z)) {
        return null;
      }

      const excluded = new Set(excludedIds);
      let bestSector = null;
      let bestDistance = Infinity;
      for (const sector of sectors) {
        if (sector.nodeId !== null || excluded.has(sector.id)) {
          continue;
        }
        const distance = distanceSqPointToLoop(point.x, point.z, sector.loop);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestSector = sector;
        }
      }
      return bestSector;
    }

    for (const node of layout.nodes) {
      const cells = node.cells.map((cell) => layout.cellInfo.get(cell.key)).filter(Boolean);
      if (cells.length === 0) {
        continue;
      }

      const roomSurface = rogueSurfaceProfile(node.role, node, node.anchor.x, node.anchor.z, geometrySeed, false);
      const roomMaterials = rogueMaterialSetForRole(themeVariant, node.role, false);
      const boundary = rogueBuildBoundaryLoopFromCells(node.cells, geometrySeed);
      const loop = rogueWobbleLoop(boundary.loop, deriveSeed(geometrySeed, `${node.id}:${node.role}`), {
        cornerAmplitude: node.role === 'start' ? 0.16 : node.role === 'exit' ? 0.18 : node.role === 'hazard' ? 0.21 : 0.19,
        edgeAmplitude: node.role === 'hazard' ? 0.15 : 0.11,
        tangentAmplitude: 0.05,
        radialAmplitude: 0.03
      });
      const sector = {
        id: node.id,
        name: `${node.role === 'start' ? 'Start Room' : node.role === 'exit' ? 'Exit Room' : node.role === 'treasure' ? 'Treasure Room' : node.role === 'hazard' ? 'Hazard Room' : node.role === 'combat' ? 'Combat Room' : node.role === 'key-red' ? 'Red Key Room' : node.role === 'key-blue' ? 'Blue Key Room' : node.role === 'key-yellow' ? 'Yellow Key Room' : 'Room'} ${node.anchor.x},${node.anchor.z}`,
        nodeId: node.id,
        role: node.role,
        floor: roomSurface.floor,
        ceiling: roomSurface.ceiling,
        floorMaterial: roomMaterials.floor,
        ceilingMaterial: roomMaterials.ceiling,
        wallMaterial: roomMaterials.wall,
        theme: themeVariant.theme,
        hazardDamagePerSecond: node.hazardDamagePerSecond || 0,
        hazardType: node.hazardType || null,
        loop,
        portals: []
      };
      sectors.push(sector);
      sectorEdgeIndexById.set(sector.id, boundary.edgeIndexByKey);
      for (const cell of node.cells) {
        sectorByCell.set(cell.key, sector);
      }
    }

    for (const [key, info] of layout.cellInfo.entries()) {
      if (!sectorByCell.has(key)) {
        const boundary = rogueBuildBoundaryLoopFromCells([{ x: info.x, z: info.z }], geometrySeed);
        const sector = {
          id: info.id,
          name: `${info.role === 'transition' ? 'Transition' : 'Corridor'} ${info.x},${info.z}`,
          nodeId: null,
          role: info.role || 'corridor',
          floor: info.floor,
          ceiling: info.ceiling,
          floorMaterial: info.floorMaterial,
          ceilingMaterial: info.ceilingMaterial,
          wallMaterial: info.wallMaterial,
          theme: themeVariant.theme,
          hazardDamagePerSecond: info.hazardDamagePerSecond || 0,
          hazardType: info.hazardType || null,
          loop: rogueWobbleLoop(boundary.loop, deriveSeed(geometrySeed, `corridor-cell:${info.x},${info.z}`), {
            cornerAmplitude: info.role === 'transition' ? 0.20 : 0.18,
            edgeAmplitude: info.role === 'transition' ? 0.10 : 0.08,
            tangentAmplitude: 0.04,
            radialAmplitude: 0.03
          }),
          centroid: rogueClonePoint(info.center || rogueCellCenter(info.x, info.z, geometrySeed)),
          portals: []
        };
        sectors.push(sector);
        sectorByCell.set(key, sector);
        sectorEdgeIndexById.set(sector.id, boundary.edgeIndexByKey);
      }
    }

    const seenPortalRefs = new Set();
    for (const [key, info] of layout.cellInfo.entries()) {
      const sector = sectorByCell.get(key);
      if (!sector) {
        continue;
      }

      const [xText, zText] = key.split(',');
      const x = Number(xText);
      const z = Number(zText);
      const sectorEdgeMap = sectorEdgeIndexById.get(sector.id);
      for (const dir of ROGUE_DIRECTIONS) {
        const neighborKey = rogueCellKey(x + dir.dx, z + dir.dz);
        const neighbor = sectorByCell.get(neighborKey);
        if (!neighbor || neighbor.id === sector.id) {
          continue;
        }

        const neighborEdgeMap = sectorEdgeIndexById.get(neighbor.id);
        const side = rogueSideForDirection(x, z, dir.name);
        const sideKey = rogueBoundaryEdgeKey(side.ax, side.az, side.bx, side.bz);
        const worldSegment = rogueWorldSegmentForSide(x, z, dir.name, geometrySeed);
        const edgeIndex = sectorEdgeMap?.get(sideKey) ?? rogueFindNearestLoopEdgeIndex(sector.loop, worldSegment);
        const neighborEdgeIndex = neighborEdgeMap?.get(sideKey) ?? rogueFindNearestLoopEdgeIndex(neighbor.loop, worldSegment);
        if (edgeIndex === undefined || neighborEdgeIndex === undefined) {
          continue;
        }
        const forwardKey = `${sector.id}:${edgeIndex}:${neighbor.id}`;
        const reverseKey = `${neighbor.id}:${neighborEdgeIndex}:${sector.id}`;

        if (!seenPortalRefs.has(forwardKey)) {
          sector.portals.push({ edge: edgeIndex, to: neighbor.id });
          seenPortalRefs.add(forwardKey);
        }

        if (!seenPortalRefs.has(reverseKey)) {
          neighbor.portals.push({ edge: neighborEdgeIndex, to: sector.id });
          seenPortalRefs.add(reverseKey);
        }
      }
    }

    for (const link of layout.edges) {
      const sourceRoomSector = sectorByCell.get(rogueCellKey(link.sourceConnector.x, link.sourceConnector.z)) || null;
      const targetRoomSector = sectorByCell.get(rogueCellKey(link.targetConnector.x, link.targetConnector.z)) || null;
      const sourceSegment = rogueWorldSegmentForSide(link.sourceConnector.x, link.sourceConnector.z, link.sourceConnector.direction, geometrySeed);
      const targetSegment = rogueWorldSegmentForSide(link.targetConnector.x, link.targetConnector.z, link.targetConnector.direction, geometrySeed);
      const sourcePoint = {
        x: (sourceSegment.ax + sourceSegment.bx) * 0.5,
        z: (sourceSegment.az + sourceSegment.bz) * 0.5
      };
      const targetPoint = {
        x: (targetSegment.ax + targetSegment.bx) * 0.5,
        z: (targetSegment.az + targetSegment.bz) * 0.5
      };
      const sourcePathCell = Array.isArray(link.path)
        ? link.path.find((cell) => !layout.roomCells.has(rogueCellKey(cell.x, cell.z))) || null
        : null;
      const targetPathCell = Array.isArray(link.path)
        ? [...link.path].reverse().find((cell) => !layout.roomCells.has(rogueCellKey(cell.x, cell.z))) || null
        : null;
      const sourceCorridorSector = sourcePathCell ? sectorByCell.get(rogueCellKey(sourcePathCell.x, sourcePathCell.z)) || null : null;
      const targetCorridorSector = targetPathCell ? sectorByCell.get(rogueCellKey(targetPathCell.x, targetPathCell.z)) || null : null;
      const resolvedSourceCorridor = sourceCorridorSector || findNearestCorridorSectorToPoint(sourcePoint, sourceRoomSector ? [sourceRoomSector.id] : []);
      const resolvedTargetCorridor = targetCorridorSector || findNearestCorridorSectorToPoint(targetPoint, targetRoomSector ? [targetRoomSector.id] : []);

      const addExplicitPortal = (aSector, bSector, x, z, direction, corridor = false) => {
        if (!aSector || !bSector || aSector.id === bSector.id) {
          return;
        }

        const segment = rogueWorldSegmentForSide(x, z, direction, geometrySeed);
        const aSide = rogueSideForDirection(x, z, direction);
        const bDirection = rogueOppositeDirection(direction);
        const bSide = rogueSideForDirection(x, z, bDirection);
        const aKey = rogueBoundaryEdgeKey(aSide.ax, aSide.az, aSide.bx, aSide.bz);
        const bKey = rogueBoundaryEdgeKey(bSide.ax, bSide.az, bSide.bx, bSide.bz);
        const aEdgeIndex = sectorEdgeIndexById.get(aSector.id)?.get(aKey) ?? rogueFindNearestLoopEdgeIndex(aSector.loop, segment);
        const bEdgeIndex = sectorEdgeIndexById.get(bSector.id)?.get(bKey) ?? rogueFindNearestLoopEdgeIndex(bSector.loop, segment);
        if (aEdgeIndex === undefined || bEdgeIndex === undefined) {
          return;
        }

        const forwardKey = `${aSector.id}:${aEdgeIndex}:${bSector.id}:${corridor ? 'corridor' : 'room'}`;
        const reverseKey = `${bSector.id}:${bEdgeIndex}:${aSector.id}:${corridor ? 'corridor' : 'room'}`;
        if (!seenPortalRefs.has(forwardKey)) {
          aSector.portals.push({ edge: aEdgeIndex, to: bSector.id });
          seenPortalRefs.add(forwardKey);
          explicitPortalCount += 1;
        }
        if (!seenPortalRefs.has(reverseKey)) {
          bSector.portals.push({ edge: bEdgeIndex, to: aSector.id });
          seenPortalRefs.add(reverseKey);
          explicitPortalCount += 1;
        }
      };

      addExplicitPortal(sourceRoomSector, resolvedSourceCorridor, link.sourceConnector.x, link.sourceConnector.z, link.sourceConnector.direction, true);
      addExplicitPortal(targetRoomSector, resolvedTargetCorridor, link.targetConnector.x, link.targetConnector.z, link.targetConnector.direction, true);
    }

    layout.portalBridgeCount = explicitPortalCount;
    return { sectors, sectorByCell, sectorEdgeIndexById };
  }

  function buildDoors(sectorByCell, sectorEdgeIndexById) {
    const doors = [];
    for (const doorLink of layout.doorLinks) {
      let leftCell = { x: doorLink.leftCell.x, z: doorLink.leftCell.z };
      let rightCell = { x: doorLink.rightCell.x, z: doorLink.rightCell.z };
      let leftSector = sectorByCell.get(rogueCellKey(leftCell.x, leftCell.z));
      let rightSector = sectorByCell.get(rogueCellKey(rightCell.x, rightCell.z));

      if (leftSector && rightSector && leftSector.id === rightSector.id) {
        const step = rogueDirectionVector(doorLink.direction);
        let previousCell = { ...leftCell };
        for (let attempt = 0; attempt < 6; attempt += 1) {
          const probeKey = rogueCellKey(rightCell.x, rightCell.z);
          const probeSector = sectorByCell.get(probeKey);
          if (!probeSector || probeSector.id !== leftSector.id) {
            break;
          }
          previousCell = { ...rightCell };
          rightCell = {
            x: rightCell.x + step.dx,
            z: rightCell.z + step.dz
          };
          rightSector = sectorByCell.get(rogueCellKey(rightCell.x, rightCell.z));
          leftCell = previousCell;
        }
        leftSector = sectorByCell.get(rogueCellKey(leftCell.x, leftCell.z)) || leftSector;
      }

      if (!leftSector || !rightSector) {
        continue;
      }
      const side = rogueSideForDirection(leftCell.x, leftCell.z, doorLink.direction);
      const sideKey = rogueBoundaryEdgeKey(side.ax, side.az, side.bx, side.bz);
      const worldSegment = rogueWorldSegmentForSide(leftCell.x, leftCell.z, doorLink.direction, geometrySeed);
      const leftEdgeIndex = sectorEdgeIndexById.get(leftSector.id)?.get(sideKey) ?? rogueFindNearestLoopEdgeIndex(leftSector.loop, worldSegment);
      const rightEdgeIndex = sectorEdgeIndexById.get(rightSector.id)?.get(sideKey) ?? rogueFindNearestLoopEdgeIndex(rightSector.loop, worldSegment);
      if (leftEdgeIndex === undefined || rightEdgeIndex === undefined) {
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
            edgeIndex: leftEdgeIndex
          },
          {
            sectorId: rightSector.id,
            edgeIndex: rightEdgeIndex
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

  const { sectors, sectorByCell, sectorEdgeIndexById } = buildSectors();
  const doors = buildDoors(sectorByCell, sectorEdgeIndexById);

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
      sector: startNode.id
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
    scriptedEvents,
    campaignLayout: {
      version: 2,
      seed,
      attempt,
      theme: themeVariant.theme,
      mainRoomCount: mainNodes.length,
      branchRoomCount: branches.length,
      roomCount: layout.nodes.length,
      nodes: layout.nodes.map((node) => ({
        id: node.id,
        role: node.role,
        templateId: node.templateId,
        rotation: node.rotation,
        depth: node.depth,
        anchor: rogueClonePoint(node.anchor),
        world: rogueCellCenter(node.anchor.x, node.anchor.z, geometrySeed),
        keyColor: rogueKeyColorForRole(node.role),
        hazardDamagePerSecond: Number(node.hazardDamagePerSecond || 0) || 0,
        hazardType: node.hazardType || null
      })),
      doorLinks: layout.doorLinks.map((door) => ({
        id: door.id,
        name: door.name,
        requiredKey: door.requiredKey,
        sourceNodeId: door.sourceNodeId || null,
        targetNodeId: door.targetNodeId || null
      })),
      portalBridgeCount: Number(layout.portalBridgeCount || 0) || 0
    }
  };

  const lockedDoorKeys = doors.filter((door) => door.locked).map((door) => door.requiredKey).sort();
  const expectedDoorKeys = ['blue', 'red', 'yellow'];
  if (layout.doorLinks.length !== 3 || doors.length !== 3 || JSON.stringify(lockedDoorKeys) !== JSON.stringify(expectedDoorKeys)) {
    throw new Error(`Rogue layout failed: invalid gate set (${JSON.stringify({ doorLinks: layout.doorLinks.length, doors: doors.length, lockedDoorKeys })})`);
  }

  return level;
}
