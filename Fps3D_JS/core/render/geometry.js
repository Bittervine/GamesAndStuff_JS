import { polygonSignedArea, segmentKey, surfaceHeightAt } from '../world/spatial.js';
import { isWallBlocking } from '../world/level.js';

const GEOMETRY_EPSILON = 1e-6;

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

function pushSmoothQuad(mesh, corners, normals, uvs) {
  const startIndex = mesh.positions.length / 3;
  for (let index = 0; index < 4; index += 1) {
    pushVertex(mesh.positions, mesh.normals, mesh.uvs, corners[index], normals[index], uvs[index]);
  }

  mesh.indices.push(
    startIndex,
    startIndex + 1,
    startIndex + 2,
    startIndex,
    startIndex + 2,
    startIndex + 3
  );
}

function pushBridgeQuad(mesh, ax, az, bx, bz, a0, a1, b1, b0, normal, uvScaleX = 1, uvScaleY = 1) {
  pushQuad(
    mesh,
    [
      [ax, a0, az],
      [bx, a1, bz],
      [bx, b1, bz],
      [ax, b0, az]
    ],
    normal,
    uvScaleX,
    uvScaleY
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

function getMaterialGroup(groupMap, material, fallbackMaterial) {
  const key = typeof material === 'string' && material.length > 0 ? material : fallbackMaterial;
  let group = groupMap.get(key);
  if (!group) {
    group = {
      material: key,
      mesh: makeMeshData()
    };
    groupMap.set(key, group);
  }
  return group;
}

function pushTriangleToMeshes(meshes, a, b, c, uvA, uvB, uvC) {
  for (const mesh of meshes) {
    pushTriangle(mesh, a, b, c, uvA, uvB, uvC);
  }
}

function pushQuadToMeshes(meshes, corners, normal, uvScaleX = 1, uvScaleY = 1) {
  for (const mesh of meshes) {
    pushQuad(mesh, corners, normal, uvScaleX, uvScaleY);
  }
}

function pushBridgeQuadToMeshes(meshes, ax, az, bx, bz, a0, a1, b1, b0, normal, uvScaleX = 1, uvScaleY = 1) {
  for (const mesh of meshes) {
    pushBridgeQuad(mesh, ax, az, bx, bz, a0, a1, b1, b0, normal, uvScaleX, uvScaleY);
  }
}

function buildGridLevelGeometry(level, options = {}) {
  const wallHeight = options.wallHeight ?? 2.8;
  const floorY = options.floorY ?? 0;
  const ceilingY = options.ceilingY ?? wallHeight;
  const wall = makeMeshData();
  const floor = makeMeshData();
  const ceiling = makeMeshData();
  const floorGroups = new Map();
  const ceilingGroups = new Map();
  const wallGroups = new Map();
  const floorMaterial = level.floorMaterial || 'floor';
  const ceilingMaterial = level.ceilingMaterial || 'ceiling';
  const wallMaterial = level.wallMaterial || 'wall';
  const floorGroup = getMaterialGroup(floorGroups, floorMaterial, 'floor');
  const ceilingGroup = getMaterialGroup(ceilingGroups, ceilingMaterial, 'ceiling');
  const wallGroup = getMaterialGroup(wallGroups, wallMaterial, 'wall');

  pushQuadToMeshes(
    [floor, floorGroup.mesh],
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

  pushQuadToMeshes(
    [ceiling, ceilingGroup.mesh],
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
        pushQuadToMeshes(
          [wall, wallGroup.mesh],
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
        pushQuadToMeshes(
          [wall, wallGroup.mesh],
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
        pushQuadToMeshes(
          [wall, wallGroup.mesh],
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
        pushQuadToMeshes(
          [wall, wallGroup.mesh],
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
    ceiling,
    floorGroups: Array.from(floorGroups.values()),
    ceilingGroups: Array.from(ceilingGroups.values()),
    wallGroups: Array.from(wallGroups.values())
  };
}

function buildBrushLevelGeometry(level, options = {}) {
  const floor = makeMeshData();
  const ceiling = makeMeshData();
  const wall = makeMeshData();
  const floorGroups = new Map();
  const ceilingGroups = new Map();
  const wallGroups = new Map();
  const floorScale = options.floorTileScale ?? 0.35;
  const ceilingScale = options.ceilingTileScale ?? 0.35;
  const wallUScale = options.wallUScale ?? 0.35;
  const wallVScale = options.wallVScale ?? 0.35;
  const seenPortalTransitions = new Set();

  for (const sector of level.sectors || []) {
    if (!Array.isArray(sector.loop) || sector.loop.length < 3) {
      continue;
    }

    const floorGroup = getMaterialGroup(floorGroups, sector.floorMaterial, 'floor');
    const ceilingGroup = getMaterialGroup(ceilingGroups, sector.ceilingMaterial, 'ceiling');
    const wallGroup = getMaterialGroup(wallGroups, sector.wallMaterial, 'wall');
    const floorTargets = [floor, floorGroup.mesh];
    const ceilingTargets = [ceiling, ceilingGroup.mesh];
    const wallTargets = [wall, wallGroup.mesh];

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
      pushTriangleToMeshes(
        floorTargets,
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
      pushTriangleToMeshes(
        ceilingTargets,
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
        const neighbor = edge.portalTo ? level.sectorById?.get(edge.portalTo) ?? null : null;
        if (!neighbor) {
          continue;
        }

        const transitionKey = `${segmentKey(edge.ax, edge.az, edge.bx, edge.bz)}:${[sector.id, neighbor.id].sort().join('|')}`;
        if (seenPortalTransitions.has(transitionKey)) {
          continue;
        }
        seenPortalTransitions.add(transitionKey);

        const edgeLength = Math.hypot(edge.bx - edge.ax, edge.bz - edge.az) || 1;
        const uScale = edgeLength * wallUScale;
        const normal = edge.normal || { x: 0, z: 1 };
        const quadNormal = [normal.x, 0, normal.z];

        const floorA0 = surfaceHeightAt(sector.floorSurface, edge.ax, edge.az);
        const floorA1 = surfaceHeightAt(sector.floorSurface, edge.bx, edge.bz);
        const floorB0 = surfaceHeightAt(neighbor.floorSurface, edge.ax, edge.az);
        const floorB1 = surfaceHeightAt(neighbor.floorSurface, edge.bx, edge.bz);
        const lowFloorA = Math.min(floorA0, floorB0);
        const lowFloorB = Math.min(floorA1, floorB1);
        const highFloorA = Math.max(floorA0, floorB0);
        const highFloorB = Math.max(floorA1, floorB1);
        const floorSpan = Math.max(highFloorA, highFloorB) - Math.min(lowFloorA, lowFloorB);
        if (floorSpan > GEOMETRY_EPSILON) {
          pushBridgeQuadToMeshes(
            wallTargets,
            edge.ax,
            edge.az,
            edge.bx,
            edge.bz,
            lowFloorA,
            lowFloorB,
            highFloorB,
            highFloorA,
            quadNormal,
            uScale,
            Math.max(0.01, floorSpan) * wallVScale
          );
        }

        const ceilA0 = surfaceHeightAt(sector.ceilingSurface, edge.ax, edge.az);
        const ceilA1 = surfaceHeightAt(sector.ceilingSurface, edge.bx, edge.bz);
        const ceilB0 = surfaceHeightAt(neighbor.ceilingSurface, edge.ax, edge.az);
        const ceilB1 = surfaceHeightAt(neighbor.ceilingSurface, edge.bx, edge.bz);
        const lowCeilA = Math.min(ceilA0, ceilB0);
        const lowCeilB = Math.min(ceilA1, ceilB1);
        const highCeilA = Math.max(ceilA0, ceilB0);
        const highCeilB = Math.max(ceilA1, ceilB1);
        const ceilSpan = Math.max(highCeilA, highCeilB) - Math.min(lowCeilA, lowCeilB);
        if (ceilSpan > GEOMETRY_EPSILON) {
          pushBridgeQuadToMeshes(
            wallTargets,
            edge.ax,
            edge.az,
            edge.bx,
            edge.bz,
            lowCeilA,
            lowCeilB,
            highCeilB,
            highCeilA,
            quadNormal,
            uScale,
            Math.max(0.01, ceilSpan) * wallVScale
          );
        }

        continue;
      }

      if (!edge.solid) {
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

      pushQuadToMeshes(
        wallTargets,
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
    ceiling,
    floorGroups: Array.from(floorGroups.values()),
    ceilingGroups: Array.from(ceilingGroups.values()),
    wallGroups: Array.from(wallGroups.values())
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

function spherePoint(radius, phi, theta) {
  const sinPhi = Math.sin(phi);
  return [
    Math.cos(theta) * sinPhi * radius,
    Math.cos(phi) * radius,
    Math.sin(theta) * sinPhi * radius
  ];
}

export function buildSkyDomeGeometry(options = {}) {
  const mesh = makeMeshData();
  const radius = options.radius ?? 220;
  const longitudeSegments = Math.max(8, Math.floor(options.longitudeSegments ?? 24));
  const latitudeSegments = Math.max(4, Math.floor(options.latitudeSegments ?? 12));

  for (let lat = 0; lat < latitudeSegments; lat += 1) {
    const v0 = lat / latitudeSegments;
    const v1 = (lat + 1) / latitudeSegments;
    const phi0 = v0 * Math.PI;
    const phi1 = v1 * Math.PI;

    for (let lon = 0; lon < longitudeSegments; lon += 1) {
      const u0 = lon / longitudeSegments;
      const u1 = (lon + 1) / longitudeSegments;
      const theta0 = u0 * Math.PI * 2;
      const theta1 = u1 * Math.PI * 2;

      const p00 = spherePoint(radius, phi0, theta0);
      const p10 = spherePoint(radius, phi0, theta1);
      const p11 = spherePoint(radius, phi1, theta1);
      const p01 = spherePoint(radius, phi1, theta0);
      const n00 = normalize3(-p00[0], -p00[1], -p00[2]);
      const n10 = normalize3(-p10[0], -p10[1], -p10[2]);
      const n11 = normalize3(-p11[0], -p11[1], -p11[2]);
      const n01 = normalize3(-p01[0], -p01[1], -p01[2]);

      pushSmoothQuad(
        mesh,
        [p00, p10, p11, p01],
        [n00, n10, n11, n01],
        [
          [u0, v0],
          [u1, v0],
          [u1, v1],
          [u0, v1]
        ]
      );
    }
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
