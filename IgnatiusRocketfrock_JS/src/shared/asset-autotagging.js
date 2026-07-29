const DEFAULT_CONFIG = Object.freeze({
    alphaThreshold: 32,
    platform: Object.freeze({
        maximumSlope: 0.25,
        minimumSurfaceLength: 64,
        minimumTopInset: 10,
        requiredInsetCoverage: 0.72,
        requiredSurfaceCoverage: 0.72,
        surfaceBandAbove: 2,
        surfaceBandBelow: 6,
        sampleSpacing: 3
    }),
    runAndGun: Object.freeze({
        maximumSlope: 0.08,
        minimumWorldLength: 900
    }),
    door: Object.freeze({
        renderWidth: 125,
        renderHeight: 164,
        sourceWidth: 183,
        sourceHeight: 263,
        floorAnchorYSource: 239,
        footprintSource: Object.freeze([
            Object.freeze([0, 227]),
            Object.freeze([58, 261]),
            Object.freeze([182, 219]),
            Object.freeze([124, 185])
        ]),
        defaultPassCoverage: 0.985,
        defaultPassCornerCoverage: 0.55,
        placementStepWorld: 12,
        maximumPlacementsPerSurface: 48,
        cornerRadius: 2,
        scaleSamples: 7
    })
});

export const ASSET_GENERATION_CAPABILITY_TAGS = Object.freeze({
    platform: "capability.platform",
    doorSupport: "capability.doorSupport",
    runAndGunGround: "capability.runAndGunGround",
    movingPlatform: "capability.movingPlatform"
});

function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
}

function normalizeConfig(value = {}) {
    const platform = value.platform && typeof value.platform === "object" ? value.platform : {};
    const runAndGun = value.runAndGun && typeof value.runAndGun === "object" ? value.runAndGun : {};
    const door = value.door && typeof value.door === "object" ? value.door : {};
    const footprintSource = Array.isArray(door.footprintSource) && door.footprintSource.length >= 3
        ? door.footprintSource.map((point) => [finiteNumber(point?.[0]), finiteNumber(point?.[1])])
        : DEFAULT_CONFIG.door.footprintSource.map((point) => [...point]);
    return {
        alphaThreshold: clamp(Math.round(finiteNumber(value.alphaThreshold, DEFAULT_CONFIG.alphaThreshold)), 1, 255),
        platform: {
            maximumSlope: Math.max(0, finiteNumber(platform.maximumSlope, DEFAULT_CONFIG.platform.maximumSlope)),
            minimumSurfaceLength: Math.max(1, finiteNumber(platform.minimumSurfaceLength, DEFAULT_CONFIG.platform.minimumSurfaceLength)),
            minimumTopInset: Math.max(0, finiteNumber(platform.minimumTopInset, DEFAULT_CONFIG.platform.minimumTopInset)),
            requiredInsetCoverage: clamp(finiteNumber(platform.requiredInsetCoverage, DEFAULT_CONFIG.platform.requiredInsetCoverage), 0, 1),
            requiredSurfaceCoverage: clamp(finiteNumber(platform.requiredSurfaceCoverage, DEFAULT_CONFIG.platform.requiredSurfaceCoverage), 0, 1),
            surfaceBandAbove: Math.max(0, Math.round(finiteNumber(platform.surfaceBandAbove, DEFAULT_CONFIG.platform.surfaceBandAbove))),
            surfaceBandBelow: Math.max(0, Math.round(finiteNumber(platform.surfaceBandBelow, DEFAULT_CONFIG.platform.surfaceBandBelow))),
            sampleSpacing: Math.max(1, finiteNumber(platform.sampleSpacing, DEFAULT_CONFIG.platform.sampleSpacing))
        },
        runAndGun: {
            maximumSlope: Math.max(0, finiteNumber(runAndGun.maximumSlope, DEFAULT_CONFIG.runAndGun.maximumSlope)),
            minimumWorldLength: Math.max(1, finiteNumber(runAndGun.minimumWorldLength, DEFAULT_CONFIG.runAndGun.minimumWorldLength))
        },
        door: {
            renderWidth: Math.max(1, finiteNumber(door.renderWidth, DEFAULT_CONFIG.door.renderWidth)),
            renderHeight: Math.max(1, finiteNumber(door.renderHeight, DEFAULT_CONFIG.door.renderHeight)),
            sourceWidth: Math.max(1, finiteNumber(door.sourceWidth, DEFAULT_CONFIG.door.sourceWidth)),
            sourceHeight: Math.max(1, finiteNumber(door.sourceHeight, DEFAULT_CONFIG.door.sourceHeight)),
            floorAnchorYSource: finiteNumber(door.floorAnchorYSource, DEFAULT_CONFIG.door.floorAnchorYSource),
            footprintSource,
            defaultPassCoverage: clamp(finiteNumber(door.defaultPassCoverage, DEFAULT_CONFIG.door.defaultPassCoverage), 0, 1),
            defaultPassCornerCoverage: clamp(finiteNumber(door.defaultPassCornerCoverage, DEFAULT_CONFIG.door.defaultPassCornerCoverage), 0, 1),
            placementStepWorld: Math.max(1, finiteNumber(door.placementStepWorld, DEFAULT_CONFIG.door.placementStepWorld)),
            maximumPlacementsPerSurface: Math.max(1, Math.round(finiteNumber(door.maximumPlacementsPerSurface, DEFAULT_CONFIG.door.maximumPlacementsPerSurface))),
            cornerRadius: Math.max(0, Math.round(finiteNumber(door.cornerRadius, DEFAULT_CONFIG.door.cornerRadius))),
            scaleSamples: Math.max(1, Math.round(finiteNumber(door.scaleSamples, DEFAULT_CONFIG.door.scaleSamples)))
        }
    };
}

function nodeMap(object) {
    return new Map((Array.isArray(object?.nodes) ? object.nodes : [])
        .filter((node) => node && node.id != null)
        .map((node) => [String(node.id), { x: finiteNumber(node.x), y: finiteNumber(node.y) }]));
}

function pointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const a = polygon[i];
        const b = polygon[j];
        const crosses = ((a.y > point.y) !== (b.y > point.y))
            && (point.x < (b.x - a.x) * (point.y - a.y) / ((b.y - a.y) || 1e-12) + a.x);
        if (crosses) inside = !inside;
    }
    return inside;
}

function extractClosedBlockablePolygons(object, nodes) {
    const edges = (Array.isArray(object?.lines) ? object.lines : [])
        .filter((line) => line?.kind === "blockable" && nodes.has(String(line.from)) && nodes.has(String(line.to)))
        .map((line, index) => ({
            index,
            id: String(line.id || `blockable_${index + 1}`),
            from: String(line.from),
            to: String(line.to)
        }));
    const adjacency = new Map();
    const addAdjacency = (nodeId, edgeIndex) => {
        if (!adjacency.has(nodeId)) adjacency.set(nodeId, []);
        adjacency.get(nodeId).push(edgeIndex);
    };
    edges.forEach((edge, index) => {
        addAdjacency(edge.from, index);
        addAdjacency(edge.to, index);
    });

    const visited = new Set();
    const polygons = [];
    for (let startEdgeIndex = 0; startEdgeIndex < edges.length; startEdgeIndex += 1) {
        if (visited.has(startEdgeIndex)) continue;
        const componentEdges = [];
        const componentNodes = new Set();
        const stack = [startEdgeIndex];
        while (stack.length) {
            const edgeIndex = stack.pop();
            if (visited.has(edgeIndex)) continue;
            visited.add(edgeIndex);
            componentEdges.push(edgeIndex);
            const edge = edges[edgeIndex];
            componentNodes.add(edge.from);
            componentNodes.add(edge.to);
            for (const nodeId of [edge.from, edge.to]) {
                for (const neighbor of adjacency.get(nodeId) || []) {
                    if (!visited.has(neighbor)) stack.push(neighbor);
                }
            }
        }
        if (componentEdges.length < 3 || [...componentNodes].some((nodeId) => (adjacency.get(nodeId) || []).filter((edgeIndex) => componentEdges.includes(edgeIndex)).length !== 2)) {
            continue;
        }

        const componentSet = new Set(componentEdges);
        const orderedNodeIds = [];
        const orderedEdgeIds = [];
        const firstEdge = edges[componentEdges[0]];
        const startNodeId = firstEdge.from;
        let currentNodeId = startNodeId;
        let previousEdgeIndex = -1;
        let guard = 0;
        do {
            orderedNodeIds.push(currentNodeId);
            const candidates = (adjacency.get(currentNodeId) || []).filter((edgeIndex) => componentSet.has(edgeIndex) && edgeIndex !== previousEdgeIndex);
            const nextEdgeIndex = candidates.find((edgeIndex) => !orderedEdgeIds.includes(edges[edgeIndex].id)) ?? candidates[0];
            if (nextEdgeIndex == null) break;
            const edge = edges[nextEdgeIndex];
            orderedEdgeIds.push(edge.id);
            currentNodeId = edge.from === currentNodeId ? edge.to : edge.from;
            previousEdgeIndex = nextEdgeIndex;
            guard += 1;
        } while (currentNodeId !== startNodeId && guard <= componentEdges.length + 1);

        if (currentNodeId !== startNodeId || orderedNodeIds.length !== componentEdges.length) continue;
        polygons.push({
            points: orderedNodeIds.map((nodeId) => nodes.get(nodeId)),
            edgeIds: new Set(orderedEdgeIds)
        });
    }
    return polygons;
}

function segmentLength(start, end) {
    return Math.hypot(end.x - start.x, end.y - start.y);
}

function candidateSurfaceSegments(object, config) {
    const nodes = nodeMap(object);
    const polygons = extractClosedBlockablePolygons(object, nodes);
    const surfaces = [];
    for (const [index, line] of (Array.isArray(object?.lines) ? object.lines : []).entries()) {
        if (!line || !["walkable", "blockable"].includes(line.kind)) continue;
        const start = nodes.get(String(line.from));
        const end = nodes.get(String(line.to));
        if (!start || !end || Math.abs(end.x - start.x) < 1) continue;
        const slope = Math.abs((end.y - start.y) / (end.x - start.x));
        const length = segmentLength(start, end);
        if (slope > config.platform.maximumSlope || length < config.platform.minimumSurfaceLength) continue;

        let polygon = null;
        if (line.kind === "blockable") {
            polygon = polygons.find((entry) => entry.edgeIds.has(String(line.id || `blockable_${index + 1}`))) || null;
            if (!polygon) continue;
            const mid = { x: (start.x + end.x) * 0.5, y: (start.y + end.y) * 0.5 };
            const probeDistance = Math.max(2, Math.min(5, length * 0.02));
            const aboveInside = pointInPolygon({ x: mid.x, y: mid.y - probeDistance }, polygon.points);
            const belowInside = pointInPolygon({ x: mid.x, y: mid.y + probeDistance }, polygon.points);
            if (aboveInside || !belowInside) continue;
        }

        surfaces.push({
            id: String(line.id || `${line.kind}_${index + 1}`),
            kind: String(line.kind),
            start,
            end,
            slope,
            length,
            polygon
        });
    }
    return { surfaces, blockablePolygons: polygons.map((entry) => entry.points) };
}

function alphaAt(alpha, width, height, x, y) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= width || iy >= height) return 0;
    return alpha[iy * width + ix] || 0;
}

function columnTopOpaqueY(alpha, width, height, x, maximumY, threshold) {
    const ix = clamp(Math.round(x), 0, width - 1);
    const maximum = clamp(Math.floor(maximumY), 0, height - 1);
    for (let y = 0; y <= maximum; y += 1) {
        let opaque = false;
        for (let dx = -1; dx <= 1; dx += 1) {
            const sx = ix + dx;
            if (sx >= 0 && sx < width && alpha[y * width + sx] >= threshold) {
                opaque = true;
                break;
            }
        }
        if (opaque) return y;
    }
    return null;
}

function localAlphaCoverage(alpha, width, height, x, y, above, below, threshold) {
    let samples = 0;
    let opaque = 0;
    const centerX = Math.round(x);
    const centerY = Math.round(y);
    for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -above; dy <= below; dy += 1) {
            const sx = centerX + dx;
            const sy = centerY + dy;
            samples += 1;
            if (sx >= 0 && sx < width && sy >= 0 && sy < height && alpha[sy * width + sx] >= threshold) opaque += 1;
        }
    }
    return samples ? opaque / samples : 0;
}

function analyzeSurfaceAlpha(surface, alpha, width, height, config) {
    const samples = Math.max(3, Math.floor(surface.length / config.platform.sampleSpacing) + 1);
    let insetPasses = 0;
    let surfaceCoverageSum = 0;
    let minimumInset = Number.POSITIVE_INFINITY;
    for (let index = 0; index < samples; index += 1) {
        const t = samples === 1 ? 0.5 : index / (samples - 1);
        const x = surface.start.x + (surface.end.x - surface.start.x) * t;
        const y = surface.start.y + (surface.end.y - surface.start.y) * t;
        const top = columnTopOpaqueY(alpha, width, height, x, y, config.alphaThreshold);
        if (top != null) {
            const inset = y - top;
            minimumInset = Math.min(minimumInset, inset);
            if (inset >= config.platform.minimumTopInset) insetPasses += 1;
        }
        surfaceCoverageSum += localAlphaCoverage(
            alpha,
            width,
            height,
            x,
            y,
            config.platform.surfaceBandAbove,
            config.platform.surfaceBandBelow,
            config.alphaThreshold
        );
    }
    const insetCoverage = insetPasses / samples;
    const surfaceCoverage = surfaceCoverageSum / samples;
    return {
        ...surface,
        sampleCount: samples,
        insetCoverage,
        surfaceCoverage,
        minimumInset: Number.isFinite(minimumInset) ? minimumInset : 0,
        platformPass: insetCoverage >= config.platform.requiredInsetCoverage
            && surfaceCoverage >= config.platform.requiredSurfaceCoverage
    };
}

function linspace(start, end, count) {
    if (count <= 1 || Math.abs(end - start) < 1e-9) return [start];
    return Array.from({ length: count }, (_, index) => start + (end - start) * index / (count - 1));
}

function polygonBounds(points) {
    return points.reduce((bounds, point) => ({
        minimumX: Math.min(bounds.minimumX, point.x),
        maximumX: Math.max(bounds.maximumX, point.x),
        minimumY: Math.min(bounds.minimumY, point.y),
        maximumY: Math.max(bounds.maximumY, point.y)
    }), { minimumX: Infinity, maximumX: -Infinity, minimumY: Infinity, maximumY: -Infinity });
}

function polygonCoverage(alpha, width, height, polygon, threshold) {
    const bounds = polygonBounds(polygon);
    const minimumX = Math.floor(bounds.minimumX);
    const maximumX = Math.ceil(bounds.maximumX);
    const minimumY = Math.floor(bounds.minimumY);
    const maximumY = Math.ceil(bounds.maximumY);
    if (maximumX < minimumX || maximumY < minimumY) return { coverage: 0, opaqueCount: 0, sampleCount: 0 };
    let sampleCount = 0;
    let opaqueCount = 0;
    for (let y = minimumY; y <= maximumY; y += 1) {
        for (let x = minimumX; x <= maximumX; x += 1) {
            if (!pointInPolygon({ x: x + 0.5, y: y + 0.5 }, polygon)) continue;
            sampleCount += 1;
            if (x >= 0 && x < width && y >= 0 && y < height && alpha[y * width + x] >= threshold) opaqueCount += 1;
        }
    }
    return { coverage: sampleCount ? opaqueCount / sampleCount : 0, opaqueCount, sampleCount };
}

function cornerCoverage(alpha, width, height, point, radius, threshold) {
    const centerX = Math.round(point.x);
    const centerY = Math.round(point.y);
    const expected = (radius * 2 + 1) ** 2;
    let opaque = 0;
    for (let y = centerY - radius; y <= centerY + radius; y += 1) {
        for (let x = centerX - radius; x <= centerX + radius; x += 1) {
            if (x >= 0 && x < width && y >= 0 && y < height && alpha[y * width + x] >= threshold) opaque += 1;
        }
    }
    return expected ? opaque / expected : 0;
}

function lineYAtX(surface, x) {
    const ratio = (x - surface.start.x) / (surface.end.x - surface.start.x);
    return surface.start.y + (surface.end.y - surface.start.y) * ratio;
}

function orientation(a, b, c) {
    const value = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
    if (Math.abs(value) < 1e-9) return 0;
    return value > 0 ? 1 : 2;
}

function pointOnSegment(a, b, point) {
    return point.x <= Math.max(a.x, b.x) + 1e-9
        && point.x >= Math.min(a.x, b.x) - 1e-9
        && point.y <= Math.max(a.y, b.y) + 1e-9
        && point.y >= Math.min(a.y, b.y) - 1e-9;
}

function segmentsIntersect(a, b, c, d) {
    const o1 = orientation(a, b, c);
    const o2 = orientation(a, b, d);
    const o3 = orientation(c, d, a);
    const o4 = orientation(c, d, b);
    if (o1 !== o2 && o3 !== o4) return true;
    return (o1 === 0 && pointOnSegment(a, b, c))
        || (o2 === 0 && pointOnSegment(a, b, d))
        || (o3 === 0 && pointOnSegment(c, d, a))
        || (o4 === 0 && pointOnSegment(c, d, b));
}

function polygonIntersectsRectangle(polygon, rectangle) {
    const corners = [
        { x: rectangle.left, y: rectangle.top },
        { x: rectangle.right, y: rectangle.top },
        { x: rectangle.right, y: rectangle.bottom },
        { x: rectangle.left, y: rectangle.bottom }
    ];
    if (corners.some((point) => pointInPolygon(point, polygon))) return true;
    if (polygon.some((point) => point.x >= rectangle.left && point.x <= rectangle.right && point.y >= rectangle.top && point.y <= rectangle.bottom)) return true;
    for (let polygonIndex = 0; polygonIndex < polygon.length; polygonIndex += 1) {
        const a = polygon[polygonIndex];
        const b = polygon[(polygonIndex + 1) % polygon.length];
        for (let rectangleIndex = 0; rectangleIndex < corners.length; rectangleIndex += 1) {
            const c = corners[rectangleIndex];
            const d = corners[(rectangleIndex + 1) % corners.length];
            if (segmentsIntersect(a, b, c, d)) return true;
        }
    }
    return false;
}

function doorBodyInsideBlockablePolygon(doorNative, blockablePolygons) {
    const rectangle = {
        left: doorNative.left + doorNative.width * 0.1,
        right: doorNative.left + doorNative.width * 0.9,
        top: doorNative.top + doorNative.height * 0.06,
        bottom: doorNative.floorAnchorY - Math.max(4, doorNative.height * 0.06)
    };
    if (rectangle.bottom <= rectangle.top) return true;
    return blockablePolygons.some((polygon) => polygonIntersectsRectangle(polygon, rectangle));
}

function analyzeDoorPlacement(alpha, width, height, surface, blockablePolygons, platformScale, doorCenterWorldX, config) {
    const door = config.door;
    const footprintRendered = door.footprintSource.map(([x, y]) => ({
        x: x * door.renderWidth / door.sourceWidth,
        y: y * door.renderHeight / door.sourceHeight
    }));
    const floorAnchorRenderedY = door.floorAnchorYSource * door.renderHeight / door.sourceHeight;
    const centerNativeX = doorCenterWorldX / platformScale;
    const lineNativeY = lineYAtX(surface, centerNativeX);
    const lineWorldY = lineNativeY * platformScale;
    const doorLeftWorld = doorCenterWorldX - door.renderWidth * 0.5;
    const doorTopWorld = lineWorldY - floorAnchorRenderedY;
    const footprintNative = footprintRendered.map((point) => ({
        x: (doorLeftWorld + point.x) / platformScale,
        y: (doorTopWorld + point.y) / platformScale
    }));
    const coverage = polygonCoverage(alpha, width, height, footprintNative, config.alphaThreshold);
    const cornerCoverages = footprintNative.map((point) => cornerCoverage(
        alpha,
        width,
        height,
        point,
        door.cornerRadius,
        config.alphaThreshold
    ));
    const doorNative = {
        left: doorLeftWorld / platformScale,
        top: doorTopWorld / platformScale,
        width: door.renderWidth / platformScale,
        height: door.renderHeight / platformScale,
        floorAnchorY: lineNativeY
    };
    const insideBlockablePolygon = doorBodyInsideBlockablePolygon(doorNative, blockablePolygons);
    const minimumCornerCoverage = cornerCoverages.length ? Math.min(...cornerCoverages) : 0;
    const pass = !insideBlockablePolygon
        && coverage.coverage >= door.defaultPassCoverage
        && minimumCornerCoverage >= door.defaultPassCornerCoverage;
    return {
        pass,
        insideBlockablePolygon,
        coverage: coverage.coverage,
        opaqueSampleCount: coverage.opaqueCount,
        sampleCount: coverage.sampleCount,
        minimumCornerCoverage,
        cornerCoverages,
        platformScale,
        doorCenterWorldX,
        lineNativeY,
        doorNative,
        footprintNative,
        score: coverage.coverage * 1000 + minimumCornerCoverage * 10 - (insideBlockablePolygon ? 10000 : 0)
    };
}

function bestDoorPlacement(alpha, width, height, surfaces, blockablePolygons, scaleRange, config) {
    const door = config.door;
    const footprintRendered = door.footprintSource.map(([x]) => x * door.renderWidth / door.sourceWidth);
    const footprintMinimumX = Math.min(...footprintRendered);
    const footprintMaximumX = Math.max(...footprintRendered);
    let best = null;
    for (const surface of surfaces) {
        const minimumNativeX = Math.min(surface.start.x, surface.end.x);
        const maximumNativeX = Math.max(surface.start.x, surface.end.x);
        for (const platformScale of linspace(scaleRange.minimum, scaleRange.maximum, door.scaleSamples)) {
            const minimumCenterWorld = minimumNativeX * platformScale + door.renderWidth * 0.5 - footprintMinimumX;
            const maximumCenterWorld = maximumNativeX * platformScale + door.renderWidth * 0.5 - footprintMaximumX;
            if (maximumCenterWorld < minimumCenterWorld) continue;
            const placementCount = clamp(
                Math.floor((maximumCenterWorld - minimumCenterWorld) / door.placementStepWorld) + 1,
                1,
                door.maximumPlacementsPerSurface
            );
            for (const center of linspace(minimumCenterWorld, maximumCenterWorld, placementCount)) {
                const placement = analyzeDoorPlacement(
                    alpha,
                    width,
                    height,
                    surface,
                    blockablePolygons,
                    platformScale,
                    center,
                    config
                );
                if (!best || placement.score > best.score) best = { ...placement, surface };
                if (placement.pass) return { ...placement, surface };
            }
        }
    }
    return best;
}

export function normalizeAutotagScaleRange(value, defaultScale = 1) {
    const fallback = Math.max(0.1, finiteNumber(defaultScale, 1));
    const minimum = Math.max(0.1, finiteNumber(value?.minimum ?? value?.scaleMin, Math.max(0.5, fallback * 0.75)));
    const maximum = Math.max(minimum, finiteNumber(value?.maximum ?? value?.scaleMax, Math.min(2.5, fallback * 1.25)));
    return { minimum, maximum };
}

export function analyzeAssetGenerationCapabilities({ object, frame, alpha, width, height, scaleRange, config } = {}) {
    const normalizedConfig = normalizeConfig(config);
    const frameWidth = Math.max(1, Math.round(finiteNumber(width ?? frame?.w, 1)));
    const frameHeight = Math.max(1, Math.round(finiteNumber(height ?? frame?.h, 1)));
    const alphaBytes = alpha instanceof Uint8Array || alpha instanceof Uint8ClampedArray
        ? alpha
        : new Uint8Array(frameWidth * frameHeight);
    if (alphaBytes.length < frameWidth * frameHeight) throw new Error("Alpha buffer is smaller than the asset frame.");

    const automaticPlatformEligible = String(object?.layer || "terrain") === "terrain"
        && ["platform", "floor"].includes(String(object?.type || "platform"));
    const { surfaces, blockablePolygons } = automaticPlatformEligible
        ? candidateSurfaceSegments(object || {}, normalizedConfig)
        : { surfaces: [], blockablePolygons: extractClosedBlockablePolygons(object || {}, nodeMap(object || {})).map((entry) => entry.points) };
    const analyzedSurfaces = surfaces.map((surface) => analyzeSurfaceAlpha(
        surface,
        alphaBytes,
        frameWidth,
        frameHeight,
        normalizedConfig
    ));
    const platformSurfaces = analyzedSurfaces.filter((surface) => surface.platformPass);
    const normalizedScaleRange = normalizeAutotagScaleRange(scaleRange, object?.defaultScale);
    const longestWorldSurface = platformSurfaces.reduce(
        (maximum, surface) => Math.max(maximum, surface.length * normalizedScaleRange.maximum),
        0
    );
    const runAndGunSurface = platformSurfaces.find((surface) => surface.slope <= normalizedConfig.runAndGun.maximumSlope
        && surface.length * normalizedScaleRange.maximum >= normalizedConfig.runAndGun.minimumWorldLength) || null;
    const doorPlacement = platformSurfaces.length
        ? bestDoorPlacement(alphaBytes, frameWidth, frameHeight, platformSurfaces, blockablePolygons, normalizedScaleRange, normalizedConfig)
        : null;

    return {
        tags: {
            platform: platformSurfaces.length > 0,
            doorSupport: Boolean(doorPlacement?.pass),
            runAndGunGround: Boolean(runAndGunSurface)
        },
        surfaces: analyzedSurfaces,
        platformSurfaces,
        blockablePolygons,
        scaleRange: normalizedScaleRange,
        automaticPlatformEligible,
        longestWorldSurface,
        runAndGunSurface,
        doorPlacement,
        config: normalizedConfig
    };
}

export function applyAutotagCapabilityTags(existingTags, analysis) {
    const managed = new Set([
        ASSET_GENERATION_CAPABILITY_TAGS.platform,
        ASSET_GENERATION_CAPABILITY_TAGS.doorSupport,
        ASSET_GENERATION_CAPABILITY_TAGS.runAndGunGround
    ]);
    const tags = new Set((Array.isArray(existingTags) ? existingTags : []).map(String).filter((tag) => !managed.has(tag)));
    if (analysis?.tags?.platform) tags.add(ASSET_GENERATION_CAPABILITY_TAGS.platform);
    if (analysis?.tags?.doorSupport) tags.add(ASSET_GENERATION_CAPABILITY_TAGS.doorSupport);
    if (analysis?.tags?.runAndGunGround) tags.add(ASSET_GENERATION_CAPABILITY_TAGS.runAndGunGround);
    if (tags.has(ASSET_GENERATION_CAPABILITY_TAGS.movingPlatform)
        || tags.has(ASSET_GENERATION_CAPABILITY_TAGS.doorSupport)
        || tags.has(ASSET_GENERATION_CAPABILITY_TAGS.runAndGunGround)) {
        tags.add(ASSET_GENERATION_CAPABILITY_TAGS.platform);
    }
    return [...tags].sort();
}

export function defaultAssetAutotaggingConfig() {
    return normalizeConfig(DEFAULT_CONFIG);
}
