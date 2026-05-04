import { polygonSignedArea, surfaceHeightAt } from '../world/spatial.js';
import { isWallBlocking } from '../world/level.js';

function pushVertex(positions, normals, uvs, position, normal, uv) {
  positions.push(position[0], position[1], position[2]);
  normals.push(normal[0], normal[1], normal[2]);
  uvs.push(uv[0], uv[1]);
}

function normalize3(x, y, z) {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

function triangleNormal(a, b, c) {
  const ux = b[0] - a[0];
  const uy = b[1] - a[1];
  const uz = b[2] - a[2];
  const vx = c[0] - a[0];
  const vy = c[1] - a[1];
  const vz = c[2] - a[2];
  return normalize3(
    uy * vz - uz * vy,
    uz * vx - ux * vz,
    ux * vy - uy * vx
  );
}

function pushQuad(mesh, corners, normal, uvScaleX = 1, uvScaleY = 1) {
  const startIndex = mesh.positions.length / 3;
  const uvs = [
    [0, 0],
    [uvScaleX, 0],
    [uvScaleX, uvScaleY],
    [0, uvScaleY]
  ];

  pushVertex(mesh.positions, mesh.normals, mesh.uvs, corners[0], normal, uvs[0]);
  pushVertex(mesh.positions, mesh.normals, mesh.uvs, corners[1], normal, uvs[1]);
  pushVertex(mesh.positions, mesh.normals, mesh.uvs, corners[2], normal, uvs[2]);
  pushVertex(mesh.positions, mesh.normals, mesh.uvs, corners[3], normal, uvs[3]);

  mesh.indices.push(
    startIndex,
    startIndex + 1,
    startIndex + 2,
    startIndex,
    startIndex + 2,
    startIndex + 3
  );
}

function pushTriangle(mesh, a, b, c, uvA, uvB, uvC) {
  const startIndex = mesh.positions.length / 3;
  const normal = triangleNormal(a, b, c);
  pushVertex(mesh.positions, mesh.normals, mesh.uvs, a, normal, uvA);
  pushVertex(mesh.positions, mesh.normals, mesh.uvs, b, normal, uvB);
  pushVertex(mesh.positions, mesh.normals, mesh.uvs, c, normal, uvC);
  mesh.indices.push(startIndex, startIndex + 1, startIndex + 2);
}

function makeMeshData() {
  return {
    positions: [],
    normals: [],
    uvs: [],
    indices: []
  };
}

function buildGridLevelGeometry(level, options = {}) {
  const wallHeight = options.wallHeight ?? 2.8;
  const floorY = options.floorY ?? 0;
  const ceilingY = options.ceilingY ?? wallHeight;
  const wall = makeMeshData();
  const floor = makeMeshData();
  const ceiling = makeMeshData();

  pushQuad(
    floor,
    [
      [0, floorY, 0],
      [level.width, floorY, 0],
      [level.width, floorY, level.height],
      [0, floorY, level.height]
    ],
    [0, 1, 0],
    level.width,
    level.height
  );

  pushQuad(
    ceiling,
    [
      [0, ceilingY, level.height],
      [level.width, ceilingY, level.height],
      [level.width, ceilingY, 0],
      [0, ceilingY, 0]
    ],
    [0, -1, 0],
    level.width,
    level.height
  );

  for (let z = 0; z < level.height; z += 1) {
    for (let x = 0; x < level.width; x += 1) {
      if (level.grid[z][x] !== '#') {
        continue;
      }

      const westOpen = x === 0 || level.grid[z][x - 1] !== '#';
      const eastOpen = x === level.width - 1 || level.grid[z][x + 1] !== '#';
      const northOpen = z === 0 || level.grid[z - 1][x] !== '#';
      const southOpen = z === level.height - 1 || level.grid[z + 1][x] !== '#';

      if (westOpen) {
        pushQuad(
          wall,
          [
            [x, floorY, z],
            [x, floorY, z + 1],
            [x, ceilingY, z + 1],
            [x, ceilingY, z]
          ],
          [-1, 0, 0]
        );
      }

      if (eastOpen) {
        pushQuad(
          wall,
          [
            [x + 1, floorY, z + 1],
            [x + 1, floorY, z],
            [x + 1, ceilingY, z],
            [x + 1, ceilingY, z + 1]
          ],
          [1, 0, 0]
        );
      }

      if (northOpen) {
        pushQuad(
          wall,
          [
            [x + 1, floorY, z],
            [x, floorY, z],
            [x, ceilingY, z],
            [x + 1, ceilingY, z]
          ],
          [0, 0, -1]
        );
      }

      if (southOpen) {
        pushQuad(
          wall,
          [
            [x, floorY, z + 1],
            [x + 1, floorY, z + 1],
            [x + 1, ceilingY, z + 1],
            [x, ceilingY, z + 1]
          ],
          [0, 0, 1]
        );
      }
    }
  }

  return {
    wall,
    floor,
    ceiling
  };
}

function buildBrushLevelGeometry(level, options = {}) {
  const floor = makeMeshData();
  const ceiling = makeMeshData();
  const wall = makeMeshData();
  const floorScale = options.floorTileScale ?? 0.35;
  const ceilingScale = options.ceilingTileScale ?? 0.35;
  const wallUScale = options.wallUScale ?? 0.35;
  const wallVScale = options.wallVScale ?? 0.35;

  for (const sector of level.sectors || []) {
    if (!Array.isArray(sector.loop) || sector.loop.length < 3) {
      continue;
    }

    const floorVertices = sector.loop.map((point) => ([
      point.x,
      surfaceHeightAt(sector.floorSurface, point.x, point.z),
      point.z
    ]));
    const ceilingVertices = sector.loop.map((point) => ([
      point.x,
      surfaceHeightAt(sector.ceilingSurface, point.x, point.z),
      point.z
    ]));
    const flipWinding = polygonSignedArea(sector.loop) >= 0;

    for (let index = 1; index < sector.loop.length - 1; index += 1) {
      const floorA = floorVertices[0];
      const floorB = floorVertices[flipWinding ? index + 1 : index];
      const floorC = floorVertices[flipWinding ? index : index + 1];
      pushTriangle(
        floor,
        floorA,
        floorB,
        floorC,
        [floorA[0] * floorScale, floorA[2] * floorScale],
        [floorB[0] * floorScale, floorB[2] * floorScale],
        [floorC[0] * floorScale, floorC[2] * floorScale]
      );

      const ceilA = ceilingVertices[0];
      const ceilB = ceilingVertices[flipWinding ? index : index + 1];
      const ceilC = ceilingVertices[flipWinding ? index + 1 : index];
      pushTriangle(
        ceiling,
        ceilA,
        ceilB,
        ceilC,
        [ceilA[0] * ceilingScale, ceilA[2] * ceilingScale],
        [ceilB[0] * ceilingScale, ceilB[2] * ceilingScale],
        [ceilC[0] * ceilingScale, ceilC[2] * ceilingScale]
      );
    }

    for (const edge of sector.edges || []) {
      if (!edge.solid || !isWallBlocking(level, edge)) {
        continue;
      }

      const bottomA = [
        edge.ax,
        surfaceHeightAt(sector.floorSurface, edge.ax, edge.az),
        edge.az
      ];
      const bottomB = [
        edge.bx,
        surfaceHeightAt(sector.floorSurface, edge.bx, edge.bz),
        edge.bz
      ];
      const topA = [
        edge.ax,
        surfaceHeightAt(sector.ceilingSurface, edge.ax, edge.az),
        edge.az
      ];
      const topB = [
        edge.bx,
        surfaceHeightAt(sector.ceilingSurface, edge.bx, edge.bz),
        edge.bz
      ];
      const edgeLength = Math.hypot(edge.bx - edge.ax, edge.bz - edge.az) || 1;
      const wallSpan = Math.max(0.01, Math.max(topA[1], topB[1]) - Math.min(bottomA[1], bottomB[1]));
      const uScale = edgeLength * wallUScale;
      const vScale = wallSpan * wallVScale;
      const normal = edge.normal || [0, 0];
      const quadNormal = [normal.x, 0, normal.z];

      pushQuad(
        wall,
        [bottomA, bottomB, topB, topA],
        quadNormal,
        uScale,
        vScale
      );
    }
  }

  return {
    wall,
    floor,
    ceiling
  };
}

export function buildLevelGeometry(level, options = {}) {
  if (Array.isArray(level?.sectors) && level.sectors.length > 0) {
    return buildBrushLevelGeometry(level, options);
  }

  return buildGridLevelGeometry(level, options);
}

export function buildBoxGeometry() {
  const mesh = makeMeshData();
  const faces = [
    {
      normal: [0, 0, 1],
      corners: [
        [-0.5, -0.5, 0.5],
        [0.5, -0.5, 0.5],
        [0.5, 0.5, 0.5],
        [-0.5, 0.5, 0.5]
      ]
    },
    {
      normal: [0, 0, -1],
      corners: [
        [0.5, -0.5, -0.5],
        [-0.5, -0.5, -0.5],
        [-0.5, 0.5, -0.5],
        [0.5, 0.5, -0.5]
      ]
    },
    {
      normal: [1, 0, 0],
      corners: [
        [0.5, -0.5, 0.5],
        [0.5, -0.5, -0.5],
        [0.5, 0.5, -0.5],
        [0.5, 0.5, 0.5]
      ]
    },
    {
      normal: [-1, 0, 0],
      corners: [
        [-0.5, -0.5, -0.5],
        [-0.5, -0.5, 0.5],
        [-0.5, 0.5, 0.5],
        [-0.5, 0.5, -0.5]
      ]
    },
    {
      normal: [0, 1, 0],
      corners: [
        [-0.5, 0.5, 0.5],
        [0.5, 0.5, 0.5],
        [0.5, 0.5, -0.5],
        [-0.5, 0.5, -0.5]
      ]
    },
    {
      normal: [0, -1, 0],
      corners: [
        [-0.5, -0.5, -0.5],
        [0.5, -0.5, -0.5],
        [0.5, -0.5, 0.5],
        [-0.5, -0.5, 0.5]
      ]
    }
  ];

  for (const face of faces) {
    pushQuad(mesh, face.corners, face.normal);
  }

  return mesh;
}

export function meshToBuffers(mesh) {
  return {
    positions: new Float32Array(mesh.positions),
    normals: new Float32Array(mesh.normals),
    uvs: new Float32Array(mesh.uvs),
    indices: mesh.indices.length > 65535 ? new Uint32Array(mesh.indices) : new Uint16Array(mesh.indices)
  };
}
