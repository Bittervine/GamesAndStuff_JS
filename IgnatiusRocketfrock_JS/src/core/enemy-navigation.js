const EPSILON = 0.001;

export const ENEMY_DROP_SOURCE_CLEARANCE_HEIGHT_FACTOR = 0.45;
export const ENEMY_DROP_SOURCE_CLEARANCE_WIDTH_FACTOR = 0.9;

function finite(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function rounded(value, digits = 3) {
    const scale = 10 ** digits;
    return Math.round(finite(value) * scale) / scale;
}

function stableProfileNumber(value, fallback = 0) {
    return rounded(finite(value, fallback), 3);
}

export function normalizeEnemyNavigationProfile(raw = {}) {
    return {
        bodyWidth: Math.max(8, stableProfileNumber(raw.bodyWidth, 48)),
        bodyHeight: Math.max(24, stableProfileNumber(raw.bodyHeight, 120)),
        runSpeed: Math.max(1, stableProfileNumber(raw.runSpeed, 120)),
        groundAcceleration: Math.max(1, stableProfileNumber(raw.groundAcceleration, 950)),
        jumpHeight: Math.max(0, stableProfileNumber(raw.jumpHeight, 0)),
        gravity: Math.max(1, stableProfileNumber(raw.gravity, 1200)),
        maxFallDistance: Math.max(0, stableProfileNumber(raw.maxFallDistance, Math.max(160, finite(raw.jumpHeight, 0) * 2 + 80))),
        maxStepHeight: Math.max(0, stableProfileNumber(raw.maxStepHeight, 24)),
        maxStepGap: Math.max(0, stableProfileNumber(raw.maxStepGap, 18)),
        edgeInset: Math.max(2, stableProfileNumber(raw.edgeInset, Math.max(8, finite(raw.bodyWidth, 48) * 0.22))),
        bodyClearance: Math.max(4, stableProfileNumber(raw.bodyClearance, Math.max(10, finite(raw.bodyWidth, 48) * 0.34)))
    };
}

export function enemyNavigationProfileKey(raw = {}) {
    const profile = normalizeEnemyNavigationProfile(raw);
    return [
        `w${profile.bodyWidth}`,
        `h${profile.bodyHeight}`,
        `r${profile.runSpeed}`,
        `a${profile.groundAcceleration}`,
        `j${profile.jumpHeight}`,
        `g${profile.gravity}`,
        `f${profile.maxFallDistance}`,
        `s${profile.maxStepHeight}`,
        `q${profile.maxStepGap}`
    ].join("_");
}

function supportYAt(support, x) {
    const span = support.x2 - support.x1;
    if (Math.abs(span) < EPSILON) {
        return Math.min(support.y1, support.y2);
    }
    const ratio = clamp((x - support.x1) / span, 0, 1);
    return support.y1 + (support.y2 - support.y1) * ratio;
}

function normalizedSupport(raw, index) {
    const x1 = finite(raw.x1);
    const x2 = finite(raw.x2);
    const y1 = finite(raw.y1);
    const y2 = finite(raw.y2);
    return {
        id: String(raw.id || `support_${index + 1}`),
        kind: String(raw.kind || "walkable"),
        x1,
        y1,
        x2,
        y2,
        xMin: Math.min(x1, x2),
        xMax: Math.max(x1, x2),
        sourcePolygonId: raw.sourcePolygonId ? String(raw.sourcePolygonId) : null,
        obstacleXMin: Number.isFinite(Number(raw.obstacleXMin)) ? Number(raw.obstacleXMin) : null,
        obstacleXMax: Number.isFinite(Number(raw.obstacleXMax)) ? Number(raw.obstacleXMax) : null
    };
}

function polygonSignedArea(points) {
    let area = 0;
    for (let index = 0; index < points.length; index += 1) {
        const a = points[index];
        const b = points[(index + 1) % points.length];
        area += finite(a?.x) * finite(b?.y) - finite(b?.x) * finite(a?.y);
    }
    return area * 0.5;
}

function polygonBounds(points) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const point of points || []) {
        minX = Math.min(minX, finite(point?.x));
        minY = Math.min(minY, finite(point?.y));
        maxX = Math.max(maxX, finite(point?.x));
        maxY = Math.max(maxY, finite(point?.y));
    }
    return Number.isFinite(minX) && Number.isFinite(minY) && Number.isFinite(maxX) && Number.isFinite(maxY)
        ? { minX, minY, maxX, maxY }
        : null;
}

function matchingPolygonEdge(edgesByVisualId, segment) {
    const candidates = edgesByVisualId.get(String(segment.visualId || "")) || [];
    const tolerance = 0.05;
    const samePoint = (a, b, x, y) => Math.abs(a - x) <= tolerance && Math.abs(b - y) <= tolerance;
    return candidates.find((edge) => (
        samePoint(edge.x1, edge.y1, finite(segment.x1), finite(segment.y1)) &&
        samePoint(edge.x2, edge.y2, finite(segment.x2), finite(segment.y2))
    ) || (
        samePoint(edge.x1, edge.y1, finite(segment.x2), finite(segment.y2)) &&
        samePoint(edge.x2, edge.y2, finite(segment.x1), finite(segment.y1))
    )) || null;
}

function polygonTopEdgeMetadata(world) {
    const metadata = new Map();
    for (const polygon of world?.collisionPolygons || []) {
        if (polygon.movingPlatformId || polygon.kind === "water") {
            continue;
        }
        const points = Array.isArray(polygon.points) ? polygon.points : [];
        if (points.length < 3) {
            continue;
        }
        const area = polygonSignedArea(points);
        const bounds = polygonBounds(points);
        if (!bounds || Math.abs(area) < EPSILON) {
            continue;
        }
        const visualId = String(polygon.visualId || "");
        const edges = metadata.get(visualId) || [];
        for (let index = 0; index < points.length; index += 1) {
            const a = points[index];
            const b = points[(index + 1) % points.length];
            const dx = finite(b?.x) - finite(a?.x);
            const dy = finite(b?.y) - finite(a?.y);
            const length = Math.hypot(dx, dy);
            if (length < EPSILON) {
                continue;
            }
            const outwardY = area > 0 ? -dx : dx;
            const upwardFacing = -outwardY / length;
            const horizontalShare = Math.abs(dx) / length;
            edges.push({
                x1: finite(a?.x),
                y1: finite(a?.y),
                x2: finite(b?.x),
                y2: finite(b?.y),
                topFacing: upwardFacing >= 0.25 && horizontalShare >= 0.25,
                polygonId: String(polygon.id || "collisionPolygon"),
                obstacleXMin: bounds.minX,
                obstacleXMax: bounds.maxX
            });
        }
        metadata.set(visualId, edges);
    }
    return metadata;
}

function navigationBlockingObstacles(world) {
    const obstacles = [];
    for (const polygon of world?.collisionPolygons || []) {
        if (polygon.movingPlatformId) {
            continue;
        }
        if (polygon.kind !== "blockable" && polygon.kind !== "damaging" && polygon.kind !== "killable" && polygon.kind !== "water") {
            continue;
        }
        const bounds = polygonBounds(polygon.points || []);
        if (bounds) {
            obstacles.push({
                id: String(polygon.id || "collisionPolygon"),
                ...bounds,
                points: (polygon.points || []).map((point) => ({ x: finite(point?.x), y: finite(point?.y) }))
            });
        }
    }
    for (const solid of world?.solids || []) {
        const x = finite(solid.x);
        const y = finite(solid.y);
        const w = Math.max(0, finite(solid.w));
        const h = Math.max(0, finite(solid.h));
        if (w >= 4 && h >= 4) {
            obstacles.push({
                id: String(solid.id || "solid"),
                minX: x,
                minY: y,
                maxX: x + w,
                maxY: y + h,
                dynamic: Boolean(solid.dynamicNavigationBlocker || solid.navigationBlockerId)
            });
        }
    }
    for (const blocker of world?.navigationBlockers || []) {
        const x = finite(blocker.x);
        const y = finite(blocker.y);
        const w = Math.max(0, finite(blocker.w));
        const h = Math.max(0, finite(blocker.h));
        if (w >= 4 && h >= 4) {
            obstacles.push({
                id: String(blocker.id || `navigationBlocker_${obstacles.length + 1}`),
                minX: x,
                minY: y,
                maxX: x + w,
                maxY: y + h,
                dynamic: blocker.dynamic !== false,
                closedState: String(blocker.closedState || "closed")
            });
        }
    }
    return obstacles;
}

function obstacleVerticalSpanAtX(obstacle, x) {
    const points = Array.isArray(obstacle?.points) ? obstacle.points : [];
    if (points.length < 3) return { minY: obstacle.minY, maxY: obstacle.maxY };
    const intersections = [];
    const tolerance = 0.000001;
    for (let index = 0; index < points.length; index += 1) {
        const a = points[index];
        const b = points[(index + 1) % points.length];
        const minX = Math.min(a.x, b.x);
        const maxX = Math.max(a.x, b.x);
        if (x < minX - tolerance || x > maxX + tolerance) continue;
        const dx = b.x - a.x;
        if (Math.abs(dx) <= tolerance) {
            if (Math.abs(x - a.x) <= tolerance) {
                intersections.push(a.y, b.y);
            }
            continue;
        }
        const t = (x - a.x) / dx;
        if (t < -tolerance || t > 1 + tolerance) continue;
        intersections.push(a.y + (b.y - a.y) * clamp(t, 0, 1));
    }
    if (intersections.length < 2) return { minY: obstacle.minY, maxY: obstacle.maxY };
    return { minY: Math.min(...intersections), maxY: Math.max(...intersections) };
}

function rectangleIntersectsObstacle(left, top, right, bottom, obstacle, epsilon = 0.5) {
    return right > obstacle.minX + epsilon && left < obstacle.maxX - epsilon &&
        bottom > obstacle.minY + epsilon && top < obstacle.maxY - epsilon;
}

function transitionTrajectoryClear(edge, options = {}) {
    const obstacles = Array.isArray(options.obstacles)
        ? options.obstacles
        : navigationBlockingObstacles(options.world || {});
    if (!obstacles.length || edge.type === "step") {
        return { clear: true, blockerIds: [] };
    }
    const bodyWidth = Math.max(8, finite(options.bodyWidth, 48));
    const bodyHeight = Math.max(24, finite(options.bodyHeight, 120));
    const halfWidth = bodyWidth * 0.5;
    const gravity = Math.max(1, finite(options.gravity, 1200));
    const blockerIds = new Set();

    const endpointSurfaceAllows = (obstacle, x, feetY) => {
        const isSource = obstacle.id === edge.fromObstacleId;
        const endpointSupport = isSource
            ? options.fromSupport
            : obstacle.id === edge.toObstacleId
                ? options.toSupport
                : null;
        if (!endpointSupport) {
            return false;
        }
        // Contact with the source or destination obstacle is only harmless
        // while the actor centre is actually over that support. A target
        // support can be a tiny ledge on a much larger polygon; allowing every
        // collision with that polygon made wall-clipping arcs look valid to
        // the baker even though runtime horizontal collision stopped them.
        const sourceDrop = isSource && edge.type === "drop";
        const sourceDeparture = isSource && (edge.type === "drop" || edge.type === "jump");
        const allowedMin = sourceDeparture && Number.isFinite(Number(endpointSupport.obstacleXMin))
            ? Number(endpointSupport.obstacleXMin) - halfWidth - 2
            : endpointSupport.xMin;
        const allowedMax = sourceDeparture && Number.isFinite(Number(endpointSupport.obstacleXMax))
            ? Number(endpointSupport.obstacleXMax) + halfWidth + 2
            : endpointSupport.xMax;
        if (x < allowedMin - EPSILON || x > allowedMax + EPSILON) {
            return false;
        }
        const surfaceX = clamp(x, endpointSupport.xMin, endpointSupport.xMax);
        const collisionSampleY = isSource && edge.type === "drop"
            ? feetY - bodyHeight * ENEMY_DROP_SOURCE_CLEARANCE_HEIGHT_FACTOR
            : feetY;
        return collisionSampleY <= supportYAt(endpointSupport, surfaceX) + 0.25;
    };
    const checkPose = (x, y) => {
        const left = x - halfWidth;
        const right = x + halfWidth;
        const top = y - bodyHeight;
        const bottom = y;
        for (const obstacle of obstacles) {
            if (!rectangleIntersectsObstacle(left, top, right, bottom, obstacle)) {
                continue;
            }
            if (endpointSurfaceAllows(obstacle, x, bottom)) {
                continue;
            }
            if (obstacle.dynamic) {
                blockerIds.add(obstacle.id);
                continue;
            }
            return false;
        }
        return true;
    };

    // Trial-run the trajectory at the same 60 Hz split-axis cadence used by the
    // simulation. Horizontal collision is tested at the previous vertical position,
    // then vertical collision at the new position. This deliberately rejects a jump
    // that is mathematically clear as a point parabola but clips a wall because the
    // actor's full body reaches the wall one simulation step before its feet clear the top.
    const fixedStep = 1 / 60;
    let time = 0;
    let previousY = edge.launchY;
    while (time < edge.flightTime - EPSILON) {
        const nextTime = Math.min(edge.flightTime, time + fixedStep);
        const nextX = edge.launchX + edge.vx * nextTime;
        if (!checkPose(nextX, previousY)) {
            return { clear: false, blockerIds: [] };
        }
        const nextY = edge.launchY + edge.vy * nextTime + 0.5 * gravity * nextTime * nextTime;
        if (!checkPose(nextX, nextY)) {
            return { clear: false, blockerIds: [] };
        }
        time = nextTime;
        previousY = nextY;
    }
    return { clear: true, blockerIds: [...blockerIds] };
}

function splitSupportAroundObstacles(support, obstacles, options) {
    const bodyHeight = Math.max(24, finite(options.bodyHeight, 120));
    const bodyWidth = Math.max(8, finite(options.bodyWidth, 48));
    const sideClearance = bodyWidth * 0.3 + 2;
    let intervals = [{ min: support.xMin, max: support.xMax }];

    for (const obstacle of obstacles) {
        if (obstacle.id === support.sourcePolygonId) {
            continue;
        }
        const overlapMin = Math.max(support.xMin, obstacle.minX);
        const overlapMax = Math.min(support.xMax, obstacle.maxX);
        if (overlapMax - overlapMin < EPSILON) {
            continue;
        }
        const sampleX = (overlapMin + overlapMax) * 0.5;
        const groundY = supportYAt(support, sampleX);
        const localObstacleSpan = enemyNavigationStepMethod(options) === "legacy"
            ? { minY: obstacle.minY, maxY: obstacle.maxY }
            : obstacleVerticalSpanAtX(obstacle, sampleX);
        if (localObstacleSpan.minY > groundY + 3) {
            continue;
        }
        const sameHeightContinuationTolerance = Math.max(2, finite(options.maxStepHeight, 24));
        const obstacleContinuesFloor = localObstacleSpan.maxY >= groundY - EPSILON
            && Math.abs(localObstacleSpan.minY - groundY) <= sameHeightContinuationTolerance;
        if (obstacleContinuesFloor) {
            // Overlapping platform polygons can be sloped or stepped. Compare the
            // neighbouring polygon at the actual overlap X rather than using its
            // global bounding-box top; otherwise a high point elsewhere in the
            // polygon falsely chops a perfectly traversable support into islands.
            continue;
        }
        const clearanceUnderObstacle = groundY - localObstacleSpan.maxY;
        if (clearanceUnderObstacle >= bodyHeight * 0.88) {
            continue;
        }
        const cutMin = obstacle.minX - sideClearance;
        const cutMax = obstacle.maxX + sideClearance;
        const next = [];
        for (const interval of intervals) {
            if (cutMax <= interval.min + EPSILON || cutMin >= interval.max - EPSILON) {
                next.push(interval);
                continue;
            }
            if (cutMin > interval.min + 4) {
                next.push({ min: interval.min, max: Math.min(interval.max, cutMin) });
            }
            if (cutMax < interval.max - 4) {
                next.push({ min: Math.max(interval.min, cutMax), max: interval.max });
            }
        }
        intervals = next;
        if (!intervals.length) {
            break;
        }
    }

    if (intervals.length === 1 && Math.abs(intervals[0].min - support.xMin) < EPSILON && Math.abs(intervals[0].max - support.xMax) < EPSILON) {
        return [support];
    }
    return intervals
        .filter((interval) => interval.max - interval.min >= 4)
        .map((interval, index) => normalizedSupport({
            ...support,
            id: `${support.id}_nav_${index + 1}`,
            x1: interval.min,
            y1: supportYAt(support, interval.min),
            x2: interval.max,
            y2: supportYAt(support, interval.max)
        }, index));
}

export function buildEnemyNavigationSupports(world, options = {}) {
    const rawSupports = [];
    const polygonEdges = polygonTopEdgeMetadata(world);
    for (const segment of world?.segments || []) {
        if (segment.movingPlatformId) {
            continue;
        }
        if (segment.kind !== "walkable" && segment.kind !== "blockable") {
            continue;
        }
        if (Math.abs(finite(segment.x2) - finite(segment.x1)) < 4) {
            continue;
        }
        const polygonEdge = matchingPolygonEdge(polygonEdges, segment);
        if (polygonEdge && !polygonEdge.topFacing) {
            continue;
        }
        rawSupports.push(normalizedSupport({
            ...segment,
            sourcePolygonId: polygonEdge?.polygonId || null,
            obstacleXMin: polygonEdge?.obstacleXMin,
            obstacleXMax: polygonEdge?.obstacleXMax
        }, rawSupports.length));
    }
    for (const solid of world?.solids || []) {
        if (solid.kind === "wall") {
            continue;
        }
        const width = Math.max(0, finite(solid.w));
        if (width < 4) {
            continue;
        }
        rawSupports.push(normalizedSupport({
            id: `${solid.id || "solid"}_top`,
            kind: "solidTop",
            x1: finite(solid.x),
            y1: finite(solid.y),
            x2: finite(solid.x) + width,
            y2: finite(solid.y),
            sourcePolygonId: String(solid.id || "solid"),
            obstacleXMin: finite(solid.x),
            obstacleXMax: finite(solid.x) + width
        }, rawSupports.length));
    }

    const obstacles = navigationBlockingObstacles(world);
    return rawSupports.flatMap((support) => splitSupportAroundObstacles(support, obstacles, options));
}

export function findEnemyNavigationSupport(supports, x, y, options = {}) {
    const maxRise = Math.max(0, finite(options.maxRise, 30));
    const maxDrop = Math.max(0, finite(options.maxDrop, 80));
    const sampleHalfWidthFactor = clamp(finite(options.sampleHalfWidthFactor, 0.22), 0, 0.5);
    const halfWidth = Math.max(0, finite(options.width, 1)) * sampleHalfWidthFactor;
    const samples = [x, x - halfWidth, x + halfWidth];
    if (options.preferredSupportId) {
        const preferredSupport = navigationSupportById(supports, String(options.preferredSupportId));
        if (preferredSupport) {
            let preferredBest = null;
            for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
                const sampleX = samples[sampleIndex];
                if (sampleX < preferredSupport.xMin - EPSILON || sampleX > preferredSupport.xMax + EPSILON) {
                    continue;
                }
                const supportY = supportYAt(preferredSupport, sampleX);
                const delta = supportY - y;
                if (delta < -maxRise || delta > maxDrop) {
                    continue;
                }
                const score = Math.abs(delta) + sampleIndex * 0.25 - 0.5;
                if (!preferredBest || score < preferredBest.score) {
                    preferredBest = { support: preferredSupport, y: supportY, x: sampleX, delta, score };
                }
            }
            if (preferredBest) {
                return preferredBest;
            }
        }
    }

    let best = null;
    for (const support of supports || []) {
        for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
            const sampleX = samples[sampleIndex];
            if (sampleX < support.xMin - EPSILON || sampleX > support.xMax + EPSILON) {
                continue;
            }
            const supportY = supportYAt(support, sampleX);
            const delta = supportY - y;
            if (delta < -maxRise || delta > maxDrop) {
                continue;
            }
            const preferredBonus = options.preferredSupportId === support.id ? 0.5 : 0;
            const score = Math.abs(delta) + sampleIndex * 0.25 - preferredBonus;
            if (!best || score < best.score) {
                best = { support, y: supportY, x: sampleX, delta, score };
            }
        }
    }
    return best;
}

function basicTransitionCandidate(from, to, inset) {
    const overlapMin = Math.max(from.xMin, to.xMin);
    const overlapMax = Math.min(from.xMax, to.xMax);
    if (overlapMin <= overlapMax) {
        const x = (overlapMin + overlapMax) * 0.5;
        return { launchX: x, landingX: x, dx: 0 };
    }
    if (to.xMin > from.xMax) {
        const launchX = Math.max(from.xMin, from.xMax - inset);
        const landingX = Math.min(to.xMax, to.xMin + inset);
        return { launchX, landingX, dx: landingX - launchX };
    }
    const launchX = Math.min(from.xMax, from.xMin + inset);
    const landingX = Math.max(to.xMin, to.xMax - inset);
    return { launchX, landingX, dx: landingX - launchX };
}

function addUniqueTransition(candidates, candidate) {
    if (!candidate || !Number.isFinite(candidate.launchX) || !Number.isFinite(candidate.landingX)) {
        return;
    }
    if (candidates.some((item) => Math.abs(item.launchX - candidate.launchX) < 0.01 && Math.abs(item.landingX - candidate.landingX) < 0.01)) {
        return;
    }
    candidates.push({
        ...candidate,
        dx: candidate.landingX - candidate.launchX
    });
}

function overlappingTransitionCandidates(from, to, options) {
    const candidates = [];
    const inset = Math.max(4, finite(options.edgeInset, 10));
    const bodyWidth = Math.max(8, finite(options.bodyWidth, 48));
    const clearance = Math.max(inset + 2, bodyWidth * 0.5 + 4, finite(options.bodyClearance, inset + 4));
    const overlapMin = Math.max(from.xMin, to.xMin);
    const overlapMax = Math.min(from.xMax, to.xMax);
    if (overlapMin > overlapMax) {
        addUniqueTransition(candidates, basicTransitionCandidate(from, to, inset));
        return candidates;
    }

    const overlapX = (overlapMin + overlapMax) * 0.5;
    const fromY = supportYAt(from, overlapX);
    const toY = supportYAt(to, overlapX);
    const targetAbove = toY < fromY - EPSILON;
    const targetBelow = toY > fromY + EPSILON;

    if (targetAbove && Number.isFinite(to.obstacleXMin) && Number.isFinite(to.obstacleXMax)) {
        const leftLaunch = to.obstacleXMin - clearance;
        const rightLaunch = to.obstacleXMax + clearance;
        if (leftLaunch >= from.xMin - EPSILON && leftLaunch <= from.xMax + EPSILON) {
            addUniqueTransition(candidates, {
                launchX: clamp(leftLaunch, from.xMin, from.xMax),
                landingX: clamp(Math.max(to.xMin, to.obstacleXMin + inset), to.xMin, to.xMax)
            });
        }
        if (rightLaunch >= from.xMin - EPSILON && rightLaunch <= from.xMax + EPSILON) {
            addUniqueTransition(candidates, {
                launchX: clamp(rightLaunch, from.xMin, from.xMax),
                landingX: clamp(Math.min(to.xMax, to.obstacleXMax - inset), to.xMin, to.xMax)
            });
        }
    } else if (targetBelow && Number.isFinite(from.obstacleXMin) && Number.isFinite(from.obstacleXMax)) {
        const leftLanding = from.obstacleXMin - clearance;
        const rightLanding = from.obstacleXMax + clearance;
        if (leftLanding >= to.xMin - EPSILON && leftLanding <= to.xMax + EPSILON) {
            addUniqueTransition(candidates, {
                launchX: clamp(Math.max(from.xMin, from.obstacleXMin + inset), from.xMin, from.xMax),
                landingX: clamp(leftLanding, to.xMin, to.xMax)
            });
        }
        if (rightLanding >= to.xMin - EPSILON && rightLanding <= to.xMax + EPSILON) {
            addUniqueTransition(candidates, {
                launchX: clamp(Math.min(from.xMax, from.obstacleXMax - inset), from.xMin, from.xMax),
                landingX: clamp(rightLanding, to.xMin, to.xMax)
            });
        }
    } else {
        addUniqueTransition(candidates, basicTransitionCandidate(from, to, inset));
    }

    return candidates;
}

function physicsGuidedDropCandidates(from, to, options = {}) {
    const candidates = [];
    const bodyWidth = Math.max(8, finite(options.bodyWidth, 48));
    const bodyHeight = Math.max(24, finite(options.bodyHeight, 120));
    const halfWidth = bodyWidth * 0.5;
    const edgeNudge = Math.max(0.75, Math.min(2.5, finite(options.edgeInset, 10) * 0.12));
    const gravity = Math.max(1, finite(options.gravity, 1200));
    const runSpeed = Math.max(1, finite(options.runSpeed, 1));
    const maxFallDistance = Math.max(0, finite(options.maxFallDistance, 240));
    const maxStepHeight = Math.max(0, finite(options.maxStepHeight, 24));

    const safeMin = to.xMin + halfWidth + 2;
    const safeMax = to.xMax - halfWidth - 2;
    if (safeMin > safeMax + EPSILON) {
        return candidates;
    }

    const addSide = (direction) => {
        // Area-backed supports use the obstacle wall as their true ledge edge.
        // A green one-way line has no polygon obstacle, so its own authored end
        // is the only legal place from which a monster may walk off. Falling
        // vertically through the middle of that line is never a valid route.
        const sourceEdge = direction < 0
            ? (Number.isFinite(from.obstacleXMin) ? from.obstacleXMin : from.xMin)
            : (Number.isFinite(from.obstacleXMax) ? from.obstacleXMax : from.xMax);
        if (!Number.isFinite(sourceEdge)) {
            return;
        }

        const clearCenterX = direction < 0
            ? sourceEdge - halfWidth - 2
            : sourceEdge + halfWidth + 2;
        const landingMin = direction < 0 ? safeMin : Math.max(safeMin, clearCenterX);
        const landingMax = direction < 0 ? Math.min(safeMax, clearCenterX) : safeMax;
        if (landingMin > landingMax + EPSILON) {
            return;
        }

        const launchX = direction < 0
            ? clamp(sourceEdge + edgeNudge, from.xMin, from.xMax)
            : clamp(sourceEdge - edgeNudge, from.xMin, from.xMax);
        const launchY = supportYAt(from, launchX);
        const probeLandingX = direction < 0 ? landingMax : landingMin;
        const landingY = supportYAt(to, probeLandingX);
        const deltaY = landingY - launchY;
        const minimumDrop = from.kind === "walkable" ? EPSILON : maxStepHeight + EPSILON;
        if (deltaY <= minimumDrop || deltaY > maxFallDistance + EPSILON) {
            return;
        }

        const flightTime = Math.sqrt(2 * deltaY / gravity);
        if (!Number.isFinite(flightTime) || flightTime <= EPSILON) {
            return;
        }

        // A deliberate walk-off keeps ignoring only the source obstacle while
        // the actor's rectangular body swings clear of the ledge. The allowed
        // vertical departure window matches runtime collision handling. This
        // is wider than the old foot-only window, which made broad actors at
        // modest run speeds physically incapable of stepping off a ledge.
        const verticalAllowance = Math.max(
            6,
            Math.min(bodyHeight * ENEMY_DROP_SOURCE_CLEARANCE_HEIGHT_FACTOR, bodyWidth * ENEMY_DROP_SOURCE_CLEARANCE_WIDTH_FACTOR)
        );
        const clearanceTime = Math.sqrt(2 * verticalAllowance / gravity);
        const minimumClearSpeed = Math.abs(clearCenterX - launchX) / Math.max(EPSILON, clearanceTime);
        if (minimumClearSpeed > runSpeed + EPSILON) {
            return;
        }

        const preferredSpeeds = [
            Math.min(runSpeed, Math.max(minimumClearSpeed * 1.08, runSpeed * 0.72)),
            Math.min(runSpeed, Math.max(minimumClearSpeed * 1.03, runSpeed * 0.9)),
            runSpeed
        ];
        for (const speed of preferredSpeeds) {
            const landingX = clamp(launchX + direction * speed * flightTime, landingMin, landingMax);
            addUniqueTransition(candidates, { launchX, landingX, walkOff: true });
        }

        const nearEdge = direction < 0 ? landingMax : landingMin;
        const deeper = direction < 0
            ? Math.max(landingMin, landingMax - bodyWidth * 0.8)
            : Math.min(landingMax, landingMin + bodyWidth * 0.8);
        addUniqueTransition(candidates, { launchX, landingX: nearEdge, walkOff: true });
        addUniqueTransition(candidates, { launchX, landingX: deeper, walkOff: true });
    };

    // A destination may sit entirely to one side, or it may be the broad floor
    // directly beneath the source ledge. Test both source edges and keep only
    // sides where the destination contains a full-body landing interval beyond
    // the obstacle wall.
    addSide(-1);
    addSide(1);
    return candidates;
}

function physicsGuidedDownwardJumpCandidates(from, to, options = {}) {
    const candidates = [];
    const targetRight = to.xMin >= from.xMax - EPSILON;
    const targetLeft = to.xMax <= from.xMin + EPSILON;
    if (!targetLeft && !targetRight) {
        return candidates;
    }

    const inset = Math.max(4, finite(options.edgeInset, 10));
    const bodyWidth = Math.max(8, finite(options.bodyWidth, 48));
    const halfWidth = bodyWidth * 0.5;
    const edgeNudge = Math.max(0.75, Math.min(2.5, inset * 0.12));
    const jumpHeight = Math.max(0, finite(options.jumpHeight, 0));
    const gravity = Math.max(1, finite(options.gravity, 1200));
    const runSpeed = Math.max(1, finite(options.runSpeed, 1));
    const maxFallDistance = Math.max(0, finite(options.maxFallDistance, jumpHeight * 2 + 80));
    const direction = targetLeft ? -1 : 1;
    const sourceEdge = targetLeft ? from.obstacleXMin : from.obstacleXMax;
    if (!Number.isFinite(sourceEdge) || jumpHeight <= EPSILON) {
        return candidates;
    }

    // Downward jumps are committed ledge exits. Launch beside the actual
    // obstacle wall rather than an ordinary interior edge inset; narrow ledges
    // otherwise waste enough horizontal range to make a physically possible
    // retreat look unreachable. The landing requires a stable majority body
    // overlap, not a full-body fit, matching ordinary collision recovery.
    const launchX = targetLeft
        ? clamp(sourceEdge + edgeNudge, from.xMin, from.xMax)
        : clamp(sourceEdge - edgeNudge, from.xMin, from.xMax);
    const launchY = supportYAt(from, launchX);
    const majorityLandingInset = Math.max(4, Math.min(inset, bodyWidth * 0.07 + 1));
    const safeInset = Math.min(
        majorityLandingInset,
        Math.max(0, (to.xMax - to.xMin) * 0.45)
    );
    const safeMin = to.xMin + safeInset;
    const safeMax = to.xMax - safeInset;
    if (safeMin > safeMax + EPSILON) {
        return candidates;
    }

    const probeLandingX = targetLeft ? safeMax : safeMin;
    const landingY = supportYAt(to, probeLandingX);
    const deltaY = landingY - launchY;
    if (deltaY <= EPSILON || deltaY > maxFallDistance + EPSILON) {
        return candidates;
    }

    const jumpVelocity = -Math.sqrt(2 * gravity * Math.max(1, jumpHeight));
    const discriminant = jumpVelocity * jumpVelocity + 2 * gravity * deltaY;
    if (discriminant < 0) {
        return candidates;
    }
    const flightTime = (-jumpVelocity + Math.sqrt(discriminant)) / gravity;
    const sourceReturnTime = -2 * jumpVelocity / gravity;
    if (!(flightTime > sourceReturnTime + EPSILON)) {
        return candidates;
    }

    // A downward jump must carry the full body beyond the source wall before
    // the feet descend below the source surface again. The old edge-only
    // candidates often produced a very slow arc that clipped the wall on the
    // way down, leaving no usable transition for slower, smaller enemies.
    const clearCenterX = targetLeft
        ? sourceEdge - halfWidth - 2
        : sourceEdge + halfWidth + 2;
    const minimumClearSpeed = Math.abs(clearCenterX - launchX) / Math.max(EPSILON, sourceReturnTime);
    if (minimumClearSpeed > runSpeed + EPSILON) {
        return candidates;
    }

    const preferredSpeeds = [
        Math.min(runSpeed, Math.max(minimumClearSpeed * 1.18, runSpeed * 0.32)),
        Math.min(runSpeed, Math.max(minimumClearSpeed * 1.1, runSpeed * 0.5)),
        Math.min(runSpeed, Math.max(minimumClearSpeed * 1.05, runSpeed * 0.72)),
        runSpeed
    ];
    for (const speed of preferredSpeeds) {
        const landingX = clamp(launchX + direction * speed * flightTime, safeMin, safeMax);
        addUniqueTransition(candidates, { launchX, landingX });
    }
    return candidates;
}

function physicsGuidedJumpCandidates(from, to, options = {}) {
    const candidates = [];
    const overlapMin = Math.max(from.xMin, to.xMin);
    const overlapMax = Math.min(from.xMax, to.xMax);
    const targetRight = to.xMin >= from.xMax - EPSILON;
    const targetLeft = to.xMax <= from.xMin + EPSILON;
    const probeFromX = targetRight
        ? from.xMax
        : targetLeft
            ? from.xMin
            : (overlapMin + overlapMax) * 0.5;
    const probeToX = targetRight
        ? to.xMin
        : targetLeft
            ? to.xMax
            : (overlapMin + overlapMax) * 0.5;
    const launchY = supportYAt(from, probeFromX);
    const landingY = supportYAt(to, probeToX);
    const rise = launchY - landingY;
    const jumpHeight = Math.max(0, finite(options.jumpHeight, 0));
    const gravity = Math.max(1, finite(options.gravity, 1200));
    if (rise <= EPSILON || rise > jumpHeight + EPSILON) {
        return candidates;
    }

    const jumpVelocityMagnitude = Math.sqrt(2 * gravity * Math.max(1, jumpHeight));
    const discriminant = jumpVelocityMagnitude * jumpVelocityMagnitude - 2 * gravity * rise;
    if (discriminant < 0) {
        return candidates;
    }
    const root = Math.sqrt(discriminant);
    const ascentTime = (jumpVelocityMagnitude - root) / gravity;
    const flightTime = (jumpVelocityMagnitude + root) / gravity;
    if (!(ascentTime > EPSILON) || !(flightTime > ascentTime + EPSILON)) {
        return candidates;
    }

    const bodyWidth = Math.max(8, finite(options.bodyWidth, 48));
    const halfWidth = bodyWidth * 0.5;
    const inset = Math.max(4, finite(options.edgeInset, 10));
    const ratio = ascentTime / flightTime;
    const sourceInset = Math.min(inset, Math.max(0, (from.xMax - from.xMin) * 0.45));
    // Upward landings only need a stable majority overlap with the target
    // surface; requiring the entire body to fit before the first contact can
    // make tall, narrow pillars unreachable for slower actors. Trajectory
    // validation still uses the full body and rejects any side-wall clipping.
    const targetInset = Math.min(
        Math.max(inset, bodyWidth * 0.18 + 2),
        Math.max(0, (to.xMax - to.xMin) * 0.45)
    );
    const launchMin = from.xMin + sourceInset;
    const launchMax = from.xMax - sourceInset;
    const landingMin = to.xMin + targetInset;
    const landingMax = to.xMax - targetInset;

    const addSide = (side) => {
        const obstacleEdge = side === "left" ? to.obstacleXMin : to.obstacleXMax;
        if (!Number.isFinite(obstacleEdge)) {
            return;
        }
        const landingX = side === "left"
            ? Math.min(landingMax, Math.max(landingMin, obstacleEdge + targetInset))
            : Math.max(landingMin, Math.min(landingMax, obstacleEdge - targetInset));
        const edgeClearX = side === "left"
            ? obstacleEdge - halfWidth - 2
            : obstacleEdge + halfWidth + 2;
        const idealLaunchX = (edgeClearX - landingX * ratio) / Math.max(EPSILON, 1 - ratio);
        if (idealLaunchX >= launchMin - EPSILON && idealLaunchX <= launchMax + EPSILON) {
            addUniqueTransition(candidates, {
                launchX: clamp(idealLaunchX, launchMin, launchMax),
                landingX
            });
        }
        for (const multiplier of [0.55, 0.9, 1.25, 1.7]) {
            const runUpX = side === "left"
                ? obstacleEdge - halfWidth - bodyWidth * multiplier
                : obstacleEdge + halfWidth + bodyWidth * multiplier;
            if (runUpX >= launchMin - EPSILON && runUpX <= launchMax + EPSILON) {
                addUniqueTransition(candidates, {
                    launchX: clamp(runUpX, launchMin, launchMax),
                    landingX
                });
            }
        }
    };

    if (!targetLeft) {
        addSide("left");
    }
    if (!targetRight) {
        addSide("right");
    }
    return candidates;
}

function directionalTransitionCandidates(from, to, options = {}) {
    const candidates = [];
    const inset = Math.max(4, finite(options.edgeInset, 10));
    const centerFrom = (from.xMin + from.xMax) * 0.5;
    const centerTo = (to.xMin + to.xMax) * 0.5;
    const launchXs = [
        clamp(from.xMin + inset, from.xMin, from.xMax),
        centerFrom,
        clamp(from.xMax - inset, from.xMin, from.xMax)
    ];
    const landingXs = [
        clamp(to.xMin + inset, to.xMin, to.xMax),
        centerTo,
        clamp(to.xMax - inset, to.xMin, to.xMax)
    ];

    for (const candidate of overlappingTransitionCandidates(from, to, options)) {
        addUniqueTransition(candidates, candidate);
    }
    for (const candidate of physicsGuidedDropCandidates(from, to, options)) {
        addUniqueTransition(candidates, candidate);
    }
    for (const candidate of physicsGuidedDownwardJumpCandidates(from, to, options)) {
        addUniqueTransition(candidates, candidate);
    }
    for (const candidate of physicsGuidedJumpCandidates(from, to, options)) {
        addUniqueTransition(candidates, candidate);
    }

    if (to.xMin >= from.xMax - EPSILON) {
        addUniqueTransition(candidates, { launchX: launchXs[2], landingX: landingXs[0] });
        addUniqueTransition(candidates, { launchX: launchXs[2], landingX: landingXs[1] });
    } else if (to.xMax <= from.xMin + EPSILON) {
        addUniqueTransition(candidates, { launchX: launchXs[0], landingX: landingXs[2] });
        addUniqueTransition(candidates, { launchX: launchXs[0], landingX: landingXs[1] });
    } else {
        const overlapMin = Math.max(from.xMin, to.xMin);
        const overlapMax = Math.min(from.xMax, to.xMax);
        const overlapCenter = (overlapMin + overlapMax) * 0.5;
        addUniqueTransition(candidates, { launchX: clamp(overlapCenter, from.xMin, from.xMax), landingX: clamp(overlapCenter, to.xMin, to.xMax) });

        const fromY = supportYAt(from, overlapCenter);
        const toY = supportYAt(to, overlapCenter);
        if (toY > fromY + EPSILON) {
            const leftLaunch = Number.isFinite(from.obstacleXMin) ? from.obstacleXMin - inset : from.xMin + inset;
            const rightLaunch = Number.isFinite(from.obstacleXMax) ? from.obstacleXMax + inset : from.xMax - inset;
            if (leftLaunch >= from.xMin - EPSILON && leftLaunch <= from.xMax + EPSILON) {
                addUniqueTransition(candidates, { launchX: clamp(leftLaunch, from.xMin, from.xMax), landingX: landingXs[0] });
            }
            if (rightLaunch >= from.xMin - EPSILON && rightLaunch <= from.xMax + EPSILON) {
                addUniqueTransition(candidates, { launchX: clamp(rightLaunch, from.xMin, from.xMax), landingX: landingXs[2] });
            }
            addUniqueTransition(candidates, { launchX: launchXs[0], landingX: landingXs[0] });
            addUniqueTransition(candidates, { launchX: launchXs[2], landingX: landingXs[2] });
        }
    }

    return candidates;
}

function solveDropTransitionCandidate(from, to, points, options) {
    if (from.kind === "walkable" && points.walkOff !== true) {
        return null;
    }
    const launchY = supportYAt(from, points.launchX);
    const landingY = supportYAt(to, points.landingX);
    const deltaY = landingY - launchY;
    const gravity = Math.max(1, finite(options.gravity, 1200));
    const runSpeed = Math.max(1, finite(options.runSpeed, 1));
    const maxFallDistance = Math.max(0, finite(options.maxFallDistance, 240));
    const maxStepHeight = Math.max(0, finite(options.maxStepHeight, 24));
    if (deltaY <= maxStepHeight + EPSILON || deltaY > maxFallDistance + EPSILON) {
        return null;
    }
    const flightTime = Math.sqrt(2 * deltaY / gravity);
    if (!Number.isFinite(flightTime) || flightTime <= EPSILON) {
        return null;
    }
    const requiredVx = points.dx / flightTime;
    if (Math.abs(requiredVx) > runSpeed + EPSILON) {
        return null;
    }
    return {
        type: "drop",
        direction: requiredVx < -EPSILON ? "left" : (requiredVx > EPSILON ? "right" : "down"),
        from: from.id,
        to: to.id,
        launchX: points.launchX,
        launchY,
        landingX: points.landingX,
        landingY,
        vx: requiredVx,
        vy: 0,
        flightTime,
        fromObstacleId: from.sourcePolygonId,
        toObstacleId: to.sourcePolygonId,
        walkOff: points.walkOff === true,
        cost: Math.abs(points.dx) + deltaY * 0.45 + 42
    };
}

function runUpCorridorClear(from, runUpX, launchX, options = {}) {
    const obstacles = Array.isArray(options.obstacles)
        ? options.obstacles
        : navigationBlockingObstacles(options.world || {});
    if (!obstacles.length || Math.abs(runUpX - launchX) <= EPSILON) {
        return true;
    }

    const bodyWidth = Math.max(8, finite(options.bodyWidth, 48));
    const bodyHeight = Math.max(24, finite(options.bodyHeight, 120));
    const halfWidth = bodyWidth * 0.5;
    const distance = Math.abs(launchX - runUpX);
    const sampleCount = Math.max(2, Math.ceil(distance / Math.max(6, bodyWidth * 0.18)));
    for (let index = 0; index <= sampleCount; index += 1) {
        const ratio = index / sampleCount;
        const x = runUpX + (launchX - runUpX) * ratio;
        const feetY = supportYAt(from, x);
        const left = x - halfWidth;
        const right = x + halfWidth;
        const top = feetY - bodyHeight;
        const bottom = feetY;
        for (const obstacle of obstacles) {
            if (!rectangleIntersectsObstacle(left, top, right, bottom, obstacle)) {
                continue;
            }
            if (obstacle.id === from.sourcePolygonId) {
                const surfaceX = clamp(x, from.xMin, from.xMax);
                if (bottom <= supportYAt(from, surfaceX) + 0.5) {
                    continue;
                }
            }
            // A run-up may span overlapping platform polygons that form one
            // continuous floor. Navigation support extraction already treats
            // these same-height neighbours as floor continuations, so the
            // acceleration corridor must not reinterpret their rock bodies as
            // a wall merely because the actor overlaps both polygons. Keep the
            // tolerance tight: this is not permission to run through a real
            // step or raised obstacle.
            const floorContinuationTolerance = 3;
            if (obstacle.maxY >= bottom - EPSILON
                && Math.abs(obstacle.minY - bottom) <= floorContinuationTolerance) {
                continue;
            }
            if (obstacle.dynamic) {
                continue;
            }
            return false;
        }
    }
    return true;
}

function attachJumpRunUp(edge, from, options = {}) {
    if (!edge || edge.type !== "jump" || Math.abs(edge.vx) <= EPSILON) {
        return edge;
    }

    const direction = edge.vx < 0 ? -1 : 1;
    const bodyWidth = Math.max(8, finite(options.bodyWidth, 48));
    const inset = Math.max(4, finite(options.edgeInset, 10));
    const acceleration = Math.max(1, finite(options.groundAcceleration, 950));
    const requiredSpeed = Math.abs(edge.vx);
    const accelerationDistance = requiredSpeed * requiredSpeed / (2 * acceleration);
    const minimumDistance = accelerationDistance + Math.max(4, bodyWidth * 0.18);
    const downwardJump = edge.landingY > edge.launchY + EPSILON;
    const preferredDistance = downwardJump
        ? Math.max(
            minimumDistance,
            Math.min(bodyWidth * 0.9, bodyWidth * 0.28 + requiredSpeed * 0.16)
        )
        : Math.max(minimumDistance, bodyWidth * 1.65);
    const safeMin = from.xMin + Math.min(inset, Math.max(0, (from.xMax - from.xMin) * 0.45));
    const safeMax = from.xMax - Math.min(inset, Math.max(0, (from.xMax - from.xMin) * 0.45));
    const availableDistance = direction > 0
        ? edge.launchX - safeMin
        : safeMax - edge.launchX;
    if (availableDistance + EPSILON < minimumDistance) {
        return null;
    }

    const runUpDistance = Math.min(preferredDistance, availableDistance);
    const runUpX = edge.launchX - direction * runUpDistance;
    if (!runUpCorridorClear(from, runUpX, edge.launchX, options)) {
        return null;
    }

    return {
        ...edge,
        runUpX,
        runUpY: supportYAt(from, runUpX),
        runUpDistance,
        requiredLaunchSpeed: requiredSpeed,
        groundAcceleration: acceleration,
        cost: edge.cost + runUpDistance * 0.35
    };
}

function solveJumpTransitionCandidate(from, to, points, options) {
    const launchY = supportYAt(from, points.launchX);
    const landingY = supportYAt(to, points.landingX);
    const deltaY = landingY - launchY;
    // Green walkable lines are one-way floors for monsters. A lower target must
    // be reached by a deliberate edge walk-off, never by an upward jump arc
    // launched through the middle of the source line. Such arcs return to the
    // same one-way surface before the body clears it and create a jump loop.
    if (from.kind === "walkable" && deltaY > EPSILON) {
        return null;
    }
    const rise = Math.max(0, -deltaY);
    const jumpHeight = Math.max(0, finite(options.jumpHeight, 0));
    const gravity = Math.max(1, finite(options.gravity, 1200));
    const runSpeed = Math.max(1, finite(options.runSpeed, 1));
    const maxFallDistance = Math.max(0, finite(options.maxFallDistance, jumpHeight * 2 + 80));
    if (rise > jumpHeight + EPSILON || deltaY > maxFallDistance + EPSILON) {
        return null;
    }

    const jumpVelocity = -Math.sqrt(2 * gravity * Math.max(1, jumpHeight));
    const discriminant = jumpVelocity * jumpVelocity + 2 * gravity * deltaY;
    if (discriminant < 0) {
        return null;
    }
    const flightTime = (-jumpVelocity + Math.sqrt(discriminant)) / gravity;
    if (!Number.isFinite(flightTime) || flightTime <= EPSILON) {
        return null;
    }
    const requiredVx = points.dx / flightTime;
    if (Math.abs(requiredVx) > runSpeed + EPSILON) {
        return null;
    }
    const bodyWidth = Math.max(8, finite(options.bodyWidth, 48));
    const halfWidth = bodyWidth * 0.5;
    const targetLeft = to.xMax <= from.xMin + EPSILON;
    const targetRight = to.xMin >= from.xMax - EPSILON;
    let takeoffClearance = null;
    if (rise > EPSILON && targetLeft && Number.isFinite(to.obstacleXMax)) {
        takeoffClearance = points.launchX - (to.obstacleXMax + halfWidth);
    } else if (rise > EPSILON && targetRight && Number.isFinite(to.obstacleXMin)) {
        takeoffClearance = (to.obstacleXMin - halfWidth) - points.launchX;
    }
    const preferredTakeoffClearance = Math.max(8, bodyWidth * 0.55);
    const takeoffClearancePenalty = Number.isFinite(takeoffClearance)
        ? Math.max(0, preferredTakeoffClearance - takeoffClearance) * 2.5
        : 0;

    return {
        type: "jump",
        direction: requiredVx < -EPSILON ? "left" : (requiredVx > EPSILON ? "right" : "up"),
        from: from.id,
        to: to.id,
        launchX: points.launchX,
        launchY,
        landingX: points.landingX,
        landingY,
        vx: requiredVx,
        vy: jumpVelocity,
        flightTime,
        fromObstacleId: from.sourcePolygonId,
        toObstacleId: to.sourcePolygonId,
        takeoffClearance: Number.isFinite(takeoffClearance) ? takeoffClearance : undefined,
        cost: Math.abs(points.dx) + Math.abs(deltaY) * 0.7 + 90 + takeoffClearancePenalty
    };
}

function legacyDirectTransition(from, to, options) {
    const maxStepHeight = Math.max(0, finite(options.maxStepHeight, 24));
    const maxStepGap = Math.max(0, finite(options.maxStepGap, 18));
    const points = basicTransitionCandidate(from, to, Math.max(4, finite(options.edgeInset, 10)));
    const launchY = supportYAt(from, points.launchX);
    const landingY = supportYAt(to, points.landingX);
    // A downward overlapping step from a green line would teleport the monster
    // through its support. Even tiny descents must use the authored endpoint
    // walk-off path generated by physicsGuidedDropCandidates.
    if (from.kind === "walkable" && landingY > launchY + EPSILON) {
        return null;
    }
    const gap = Math.max(0, Math.max(to.xMin - from.xMax, from.xMin - to.xMax));
    if (gap > maxStepGap + EPSILON || Math.abs(landingY - launchY) > maxStepHeight + EPSILON) {
        return null;
    }
    return {
        type: "step",
        direction: points.dx < -EPSILON ? "left" : (points.dx > EPSILON ? "right" : "overlap"),
        from: from.id,
        to: to.id,
        launchX: points.launchX,
        launchY,
        landingX: points.landingX,
        landingY,
        vx: 0,
        vy: 0,
        flightTime: 0,
        fromObstacleId: from.sourcePolygonId,
        toObstacleId: to.sourcePolygonId,
        cost: Math.abs(points.dx) + Math.abs(landingY - launchY) * 0.5 + 4,
        blockerIds: []
    };
}

function enemyNavigationStepMethod(options = {}) {
    return String(options.stepTransitionMethod || "stride_arc").trim().toLowerCase() === "legacy"
        ? "legacy"
        : "stride_arc";
}

function groundStrideSamePoint(a, b, tolerance = 0.08) {
    return Math.abs(Number(a?.x) - Number(b?.x)) <= tolerance &&
        Math.abs(Number(a?.y) - Number(b?.y)) <= tolerance;
}

function groundStrideCross(ax, ay, bx, by) {
    return ax * by - ay * bx;
}

function groundStrideSegmentIntersection(a, b, c, d) {
    const rx = b.x - a.x;
    const ry = b.y - a.y;
    const sx = d.x - c.x;
    const sy = d.y - c.y;
    const denominator = groundStrideCross(rx, ry, sx, sy);
    if (Math.abs(denominator) <= 0.0000001) return null;
    const qpx = c.x - a.x;
    const qpy = c.y - a.y;
    const t = groundStrideCross(qpx, qpy, sx, sy) / denominator;
    const u = groundStrideCross(qpx, qpy, rx, ry) / denominator;
    if (t < -0.000001 || t > 1.000001 || u < -0.000001 || u > 1.000001) return null;
    const clampedT = clamp(t, 0, 1);
    return { x: a.x + rx * clampedT, y: a.y + ry * clampedT };
}

function groundStridePointSegmentDistance(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq <= 0.0000001) return Math.hypot(point.x - a.x, point.y - a.y);
    const t = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSq, 0, 1);
    return Math.hypot(point.x - (a.x + dx * t), point.y - (a.y + dy * t));
}

function groundStrideCircleIntersections(a, b, center, radius) {
    const dx = Number(b.x) - Number(a.x);
    const dy = Number(b.y) - Number(a.y);
    const fx = Number(a.x) - Number(center.x);
    const fy = Number(a.y) - Number(center.y);
    const aa = dx * dx + dy * dy;
    if (!Number.isFinite(aa) || aa <= 0.0000001) return [];
    const bb = 2 * (fx * dx + fy * dy);
    const cc = fx * fx + fy * fy - radius * radius;
    const discriminant = bb * bb - 4 * aa * cc;
    if (!Number.isFinite(discriminant) || discriminant < -0.000001) return [];
    const root = Math.sqrt(Math.max(0, discriminant));
    const roots = [(-bb - root) / (2 * aa), (-bb + root) / (2 * aa)];
    const out = [];
    for (const t of roots) {
        if (t < -0.000001 || t > 1.000001) continue;
        const clampedT = clamp(t, 0, 1);
        const point = { x: Number(a.x) + dx * clampedT, y: Number(a.y) + dy * clampedT };
        if (!out.some((candidate) => groundStrideSamePoint(candidate, point, 0.001))) out.push(point);
    }
    return out;
}

function groundStrideArcSweepParameter(point, center, direction) {
    const forward = (Number(point.x) - Number(center.x)) * direction;
    if (forward < -0.05) return null;
    const vertical = Number(point.y) - Number(center.y);
    const sweep = Math.atan2(Math.max(0, forward), -vertical);
    return sweep <= Math.PI + 0.0001 ? sweep : null;
}

function enemyNavigationStrideEdgeIsStandable(kind, a, b) {
    if (kind === "walkable") return true;
    if (kind !== "blockable" && kind !== "damaging" && kind !== "killable") return false;
    const dx = Number(b.x) - Number(a.x);
    const dy = Number(b.y) - Number(a.y);
    return Math.abs(dx) > 0.001 && Math.abs(dy) <= Math.abs(dx) * 0.75;
}

function enemyNavigationStrideCandidateEdges(world = {}) {
    const edges = [];
    const seen = new Set();
    const add = (support, a, b, standable, blocksBody, edgeKey = "") => {
        if (![a.x, a.y, b.x, b.y].every(Number.isFinite)) return;
        if (Math.hypot(b.x - a.x, b.y - a.y) <= 0.000001) return;
        const key = `${support.source}|${support.id}|${edgeKey}|${a.x.toFixed(6)}|${a.y.toFixed(6)}|${b.x.toFixed(6)}|${b.y.toFixed(6)}`;
        if (seen.has(key)) return;
        seen.add(key);
        edges.push({ key, support, a, b, standable, blocksBody });
    };

    for (const segment of world?.segments || []) {
        if (segment.movingPlatformId) continue;
        if (segment.kind !== "walkable" && segment.kind !== "blockable" && segment.kind !== "damaging" && segment.kind !== "killable") continue;
        const a = { x: finite(segment.x1), y: finite(segment.y1) };
        const b = { x: finite(segment.x2), y: finite(segment.y2) };
        const support = {
            id: String(segment.id || "segment"),
            kind: String(segment.kind || "blockable"),
            source: "segment",
            x1: a.x,
            y1: a.y,
            x2: b.x,
            y2: b.y
        };
        add(support, a, b, enemyNavigationStrideEdgeIsStandable(segment.kind, a, b), segment.kind !== "walkable", "segment");
    }

    for (const solid of world?.solids || []) {
        const left = finite(solid.x);
        const top = finite(solid.y);
        const right = left + Math.max(0, finite(solid.w));
        const bottom = top + Math.max(0, finite(solid.h));
        if (right - left <= 0.000001 || bottom - top <= 0.000001) continue;
        const solidId = String(solid.id || "solid");
        const support = {
            id: `${solidId}_top`,
            kind: String(solid.kind || "blockable"),
            source: "solid",
            x1: left,
            y1: top,
            x2: right,
            y2: top
        };
        add(support, { x: left, y: top }, { x: right, y: top }, true, true, "top");
        const bodySupport = { ...support, id: solidId };
        add(bodySupport, { x: right, y: top }, { x: right, y: bottom }, false, true, "right");
        add(bodySupport, { x: right, y: bottom }, { x: left, y: bottom }, false, true, "bottom");
        add(bodySupport, { x: left, y: bottom }, { x: left, y: top }, false, true, "left");
    }

    for (const polygon of world?.collisionPolygons || []) {
        if (polygon.movingPlatformId || !Array.isArray(polygon.points) || polygon.points.length < 2) continue;
        if (polygon.kind !== "blockable" && polygon.kind !== "damaging" && polygon.kind !== "killable") continue;
        for (let index = 0; index < polygon.points.length; index += 1) {
            const a = { x: finite(polygon.points[index]?.x), y: finite(polygon.points[index]?.y) };
            const b = { x: finite(polygon.points[(index + 1) % polygon.points.length]?.x), y: finite(polygon.points[(index + 1) % polygon.points.length]?.y) };
            const support = {
                id: String(polygon.id || "collisionPolygon"),
                kind: String(polygon.kind || "blockable"),
                source: "polygon",
                x1: a.x,
                y1: a.y,
                x2: b.x,
                y2: b.y
            };
            add(support, a, b, enemyNavigationStrideEdgeIsStandable(polygon.kind, a, b), true, `polygon:${index}`);
        }
    }
    return edges;
}

function groundStrideEdgeParameter(edge, point) {
    const dx = edge.b.x - edge.a.x;
    const dy = edge.b.y - edge.a.y;
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq <= 0.0000001) return 0;
    return clamp(((point.x - edge.a.x) * dx + (point.y - edge.a.y) * dy) / lengthSq, 0, 1);
}

function groundStrideGlideFoothold(edges, blockerContacts, contactPoint, footOrigin, maximumReach, direction, minimumForward) {
    const startRadius = Math.hypot(contactPoint.x - footOrigin.x, contactPoint.y - footOrigin.y);
    const candidates = [];
    for (const blockerContact of blockerContacts) {
        const blocker = blockerContact.edge;
        const dx = blocker.b.x - blocker.a.x;
        const dy = blocker.b.y - blocker.a.y;
        const lengthSq = dx * dx + dy * dy;
        if (lengthSq <= 0.0000001) continue;
        const startT = groundStrideEdgeParameter(blocker, contactPoint);
        const closestT = clamp(-((blocker.a.x - footOrigin.x) * dx + (blocker.a.y - footOrigin.y) * dy) / lengthSq, 0, 1);
        for (const edge of edges) {
            if (!edge.standable) continue;
            const hit = groundStrideSegmentIntersection(blocker.a, blocker.b, edge.a, edge.b);
            if (!hit) continue;
            const point = { x: hit.x, y: hit.y };
            const forward = (point.x - footOrigin.x) * direction;
            const radius = Math.hypot(point.x - footOrigin.x, point.y - footOrigin.y);
            if (forward < minimumForward - 0.000001 || radius > maximumReach + 0.05 || radius > startRadius + 0.05) continue;
            const candidateT = groundStrideEdgeParameter(blocker, point);
            const towardClosest = closestT - startT;
            const towardCandidate = candidateT - startT;
            if (Math.abs(towardClosest) > 0.000001 && towardCandidate * towardClosest < -0.000001) continue;
            if (Math.abs(towardCandidate) > Math.abs(towardClosest) + 0.0001) continue;
            candidates.push({ point, support: edge.support, radius, forward });
        }
    }
    candidates.sort((left, right) => {
        if (Math.abs(left.radius - right.radius) > 0.000001) return right.radius - left.radius;
        return right.forward - left.forward;
    });
    return candidates[0] || null;
}

function groundStrideSweepFootholdFromCandidates(edges, footOrigin, maximumReach, direction, minimumForward = 0.05) {
    const contacts = [];
    for (const edge of edges) {
        for (const point of groundStrideCircleIntersections(edge.a, edge.b, footOrigin, maximumReach)) {
            const sweep = groundStrideArcSweepParameter(point, footOrigin, direction);
            if (sweep === null) continue;
            contacts.push({ point, edge, sweep });
        }
    }
    contacts.sort((left, right) => left.sweep - right.sweep);
    if (!contacts.length) return null;

    let index = 0;
    while (index < contacts.length) {
        const sweep = contacts[index].sweep;
        const group = [];
        while (index < contacts.length && Math.abs(contacts[index].sweep - sweep) <= 0.000001) {
            group.push(contacts[index]);
            index += 1;
        }
        const point = group[0].point;
        const forward = (point.x - footOrigin.x) * direction;
        const standable = group.filter((contact) => contact.edge.standable);
        const blockers = group.filter((contact) => !contact.edge.standable && contact.edge.blocksBody);
        if (standable.length && forward >= minimumForward - 0.000001) {
            standable.sort((left, right) => {
                const extent = (contact) => Math.max(
                    (contact.edge.a.x - contact.point.x) * direction,
                    (contact.edge.b.x - contact.point.x) * direction
                );
                return extent(right) - extent(left);
            });
            return {
                foothold: { ...standable[0].point },
                targetSupport: standable[0].edge.support,
                clearancePoint: { ...standable[0].point }
            };
        }
        if (blockers.length) {
            const glide = groundStrideGlideFoothold(edges, blockers, point, footOrigin, maximumReach, direction, minimumForward);
            if (!glide) return null;
            return {
                foothold: { ...glide.point },
                targetSupport: glide.support,
                clearancePoint: { ...point }
            };
        }
    }
    return null;
}

function groundStrideConvexHull(points) {
    const sorted = [...points]
        .filter((point) => Number.isFinite(point?.x) && Number.isFinite(point?.y))
        .sort((left, right) => left.x - right.x || left.y - right.y);
    const unique = [];
    for (const point of sorted) {
        if (!unique.length || !groundStrideSamePoint(unique[unique.length - 1], point, 0.000001)) unique.push(point);
    }
    if (unique.length <= 2) return unique;
    const turn = (a, b, c) => groundStrideCross(b.x - a.x, b.y - a.y, c.x - a.x, c.y - a.y);
    const lower = [];
    for (const point of unique) {
        while (lower.length >= 2 && turn(lower[lower.length - 2], lower[lower.length - 1], point) <= 0.0000001) lower.pop();
        lower.push(point);
    }
    const upper = [];
    for (let index = unique.length - 1; index >= 0; index -= 1) {
        const point = unique[index];
        while (upper.length >= 2 && turn(upper[upper.length - 2], upper[upper.length - 1], point) <= 0.0000001) upper.pop();
        upper.push(point);
    }
    lower.pop();
    upper.pop();
    return lower.concat(upper);
}

function groundStridePointInsideConvexHull(point, hull, tolerance = 0.02) {
    if (!Array.isArray(hull) || hull.length < 3) return false;
    let sign = 0;
    for (let index = 0; index < hull.length; index += 1) {
        const a = hull[index];
        const b = hull[(index + 1) % hull.length];
        const value = groundStrideCross(b.x - a.x, b.y - a.y, point.x - a.x, point.y - a.y);
        if (Math.abs(value) <= tolerance) continue;
        const nextSign = Math.sign(value);
        if (!sign) sign = nextSign;
        else if (nextSign !== sign) return false;
    }
    return true;
}

function groundStrideSegmentsIntersectInclusive(a, b, c, d, tolerance = 0.02) {
    if (groundStrideSegmentIntersection(a, b, c, d)) return true;
    return groundStridePointSegmentDistance(a, c, d) <= tolerance ||
        groundStridePointSegmentDistance(b, c, d) <= tolerance ||
        groundStridePointSegmentDistance(c, a, b) <= tolerance ||
        groundStridePointSegmentDistance(d, a, b) <= tolerance;
}

function groundStrideSweptBodyHull(bodyWidth, bodyHeight, from, to, automaticStepHeight) {
    const inset = 0.35;
    const halfWidth = Math.max(0.5, bodyWidth * 0.5 - inset);
    const topOffset = -bodyHeight + inset;
    const bottomOffset = -Math.max(inset, Number(automaticStepHeight) || 0) - inset;
    const cornersAt = (pose) => [
        { x: pose.x - halfWidth, y: pose.y + topOffset },
        { x: pose.x + halfWidth, y: pose.y + topOffset },
        { x: pose.x + halfWidth, y: pose.y + bottomOffset },
        { x: pose.x - halfWidth, y: pose.y + bottomOffset }
    ];
    return groundStrideConvexHull([...cornersAt(from), ...cornersAt(to)]);
}

function groundStrideEdgeIntersectsSweptBody(edge, hull) {
    if (!Array.isArray(hull) || hull.length < 3) return false;
    if (groundStridePointInsideConvexHull(edge.a, hull) || groundStridePointInsideConvexHull(edge.b, hull)) return true;
    for (let index = 0; index < hull.length; index += 1) {
        if (groundStrideSegmentsIntersectInclusive(edge.a, edge.b, hull[index], hull[(index + 1) % hull.length])) return true;
    }
    return false;
}

function groundStrideEdgeSupportsPose(edge, pose, bodyWidth, tolerance = 3.05) {
    if (!edge?.standable || !pose) return false;
    const probe = { x1: edge.a.x, y1: edge.a.y, x2: edge.b.x, y2: edge.b.y };
    for (const x of [pose.x, pose.x - bodyWidth * 0.42, pose.x + bodyWidth * 0.42]) {
        const span = probe.x2 - probe.x1;
        if (Math.abs(span) <= EPSILON) continue;
        const t = (x - probe.x1) / span;
        if (t < -EPSILON || t > 1 + EPSILON) continue;
        const y = probe.y1 + (probe.y2 - probe.y1) * clamp(t, 0, 1);
        if (Math.abs(y - pose.y) <= tolerance) return true;
    }
    return false;
}

function groundStrideBodyPathBlocked(candidateEdges, path, bodyWidth, bodyHeight, automaticStepHeight) {
    const bodyLegs = [
        [path.start, path.corner],
        [path.corner, path.target]
    ];
    for (const edge of candidateEdges || []) {
        if (!edge.blocksBody) continue;
        if (groundStrideEdgeSupportsPose(edge, path.start, bodyWidth) || groundStrideEdgeSupportsPose(edge, path.target, bodyWidth)) continue;
        for (const [from, to] of bodyLegs) {
            const hull = groundStrideSweptBodyHull(bodyWidth, bodyHeight, from, to, automaticStepHeight);
            if (groundStrideEdgeIntersectsSweptBody(edge, hull)) return true;
        }
    }
    return false;
}

function baseNavigationSupportId(id) {
    return String(id || "").replace(/_nav_\d+$/, "");
}

function groundStrideFootholdMatchesNavigationSupport(sweepResult, to, bodyWidth) {
    const point = sweepResult?.foothold;
    const targetSupport = sweepResult?.targetSupport;
    if (!point || !targetSupport) return false;
    const splitPadding = /_nav_\d+$/.test(String(to.id || "")) ? bodyWidth * 0.3 + 2.1 : 3.1;
    if (point.x < to.xMin - splitPadding || point.x > to.xMax + splitPadding) return false;
    const supportY = supportYAt(to, clamp(point.x, to.xMin, to.xMax));
    if (Math.abs(point.y - supportY) > Math.max(3.1, splitPadding * 0.25)) return false;
    if (to.sourcePolygonId && targetSupport.id === to.sourcePolygonId) return true;
    return targetSupport.id === to.id || baseNavigationSupportId(to.id) === targetSupport.id;
}

function strideArcDirectTransition(from, to, options) {
    if (!options.world) return legacyDirectTransition(from, to, options);
    // Moving-platform boarding/disembarking is handled by a separate dynamic
    // support system. Those supports are intentionally excluded from the
    // static stride candidate geometry, so retain the established direct test.
    if (from.movingPlatformId || to.movingPlatformId) {
        return legacyDirectTransition(from, to, options);
    }

    const overlapMin = Math.max(from.xMin, to.xMin);
    const overlapMax = Math.min(from.xMax, to.xMax);
    // Continuous/overlapping support seams do not require a discontinuity
    // stride. Preserve the established direct connection for those cases.
    if (overlapMax - overlapMin > EPSILON) {
        return legacyDirectTransition(from, to, options);
    }

    const fromCenter = (from.xMin + from.xMax) * 0.5;
    const toCenter = (to.xMin + to.xMax) * 0.5;
    const direction = toCenter >= fromCenter ? 1 : -1;
    const bodyWidth = Math.max(8, finite(options.bodyWidth, 48));
    const bodyHeight = Math.max(24, finite(options.bodyHeight, 120));
    const maximumReach = Math.max(
        Math.max(0, finite(options.maxStepHeight, 24)),
        bodyHeight * 0.20
    );
    if (maximumReach <= EPSILON) return null;

    const fromEndpointX = direction > 0 ? from.xMax : from.xMin;
    const toEndpointX = direction > 0 ? to.xMin : to.xMax;
    const fromEndpointY = supportYAt(from, fromEndpointX);
    const toEndpointY = supportYAt(to, toEndpointX);
    const rawGap = Math.abs(toEndpointX - fromEndpointX);
    const splitClearance = bodyWidth * 0.3 + 2.05;
    // The expensive arc sweep can only reach a foothold within maximumReach.
    // A split support may move the foot origin toward the target by at most the
    // splitter's side clearance, so anything farther away cannot possibly be a
    // stride. Reject those pairs before filtering collision edges or sweeping.
    if (rawGap > maximumReach + splitClearance + 0.05) return null;
    // Two support fragments that meet at the same physical endpoint are a
    // continuous seam, not a step discontinuity. Keep the old direct seam so
    // the arc solver does not turn harmless polyline joints into tiny jumps.
    if (rawGap <= 0.05 && Math.abs(toEndpointY - fromEndpointY) <= 0.05) {
        return legacyDirectTransition(from, to, options);
    }
    const samePhysicalSupport = baseNavigationSupportId(from.id) === baseNavigationSupportId(to.id);
    if (!samePhysicalSupport && rawGap > 0.05 && Math.abs(toEndpointY - fromEndpointY) <= 0.05) {
        // Ignatius does not auto-stride an ordinary same-height chasm. Keep
        // those crossings in the ballistic jump planner.
        return null;
    }

    const targetBoundaryX = direction > 0 ? to.obstacleXMin : to.obstacleXMax;
    const extension = Number.isFinite(targetBoundaryX)
        ? (targetBoundaryX - fromEndpointX) * direction
        : Number.POSITIVE_INFINITY;
    const footOriginX = Number.isFinite(targetBoundaryX) && extension >= -0.05 && extension <= splitClearance
        ? targetBoundaryX
        : fromEndpointX;
    const footOrigin = {
        x: footOriginX,
        y: supportYAt(from, clamp(footOriginX, from.xMin, from.xMax))
    };

    const halfWidth = bodyWidth * 0.5;
    const contactActorX = footOrigin.x - direction * halfWidth;
    const candidateBounds = {
        minX: contactActorX - halfWidth - maximumReach,
        minY: footOrigin.y - bodyHeight - maximumReach,
        maxX: contactActorX + halfWidth + maximumReach,
        maxY: footOrigin.y + maximumReach
    };
    const candidateEdges = (Array.isArray(options.strideCandidateEdges)
        ? options.strideCandidateEdges
        : enemyNavigationStrideCandidateEdges(options.world)).filter((edge) => {
        const minX = Math.min(edge.a.x, edge.b.x);
        const maxX = Math.max(edge.a.x, edge.b.x);
        const minY = Math.min(edge.a.y, edge.b.y);
        const maxY = Math.max(edge.a.y, edge.b.y);
        return maxX >= candidateBounds.minX - EPSILON && minX <= candidateBounds.maxX + EPSILON &&
            maxY >= candidateBounds.minY - EPSILON && minY <= candidateBounds.maxY + EPSILON;
    });
    const sweepResult = groundStrideSweepFootholdFromCandidates(
        candidateEdges,
        footOrigin,
        maximumReach,
        direction,
        Math.min(maximumReach, 0.05)
    );
    if (!sweepResult || !groundStrideFootholdMatchesNavigationSupport(sweepResult, to, bodyWidth)) return null;

    const foothold = sweepResult.foothold;
    // Green one-way supports must descend through the ordinary exposed-edge
    // drop planner. Returning a downward step here would later be filtered by
    // traversal policy after it had already suppressed generation of the real
    // drop edge.
    if (from.kind === "walkable" && foothold.y > footOrigin.y + EPSILON) return null;
    const start = { x: footOrigin.x - direction * halfWidth, y: footOrigin.y };
    const corner = {
        x: (sweepResult.clearancePoint?.x ?? footOrigin.x) - direction * halfWidth,
        y: Math.min(footOrigin.y, foothold.y, sweepResult.clearancePoint?.y ?? footOrigin.y)
    };
    const target = { x: foothold.x - direction * halfWidth, y: foothold.y };
    if ((target.x - start.x) * direction < Math.min(maximumReach, 0.05) - 0.000001) return null;
    if (groundStrideBodyPathBlocked(candidateEdges, { start, corner, target }, bodyWidth, bodyHeight, maximumReach)) return null;

    return {
        type: "step",
        direction: direction < 0 ? "left" : "right",
        from: from.id,
        to: to.id,
        launchX: start.x,
        launchY: start.y,
        landingX: target.x,
        landingY: target.y,
        vx: 0,
        vy: 0,
        flightTime: 0,
        fromObstacleId: from.sourcePolygonId,
        toObstacleId: to.sourcePolygonId,
        cost: Math.abs(target.x - start.x) + Math.abs(target.y - start.y) * 0.5 + 4,
        blockerIds: []
    };
}

function directTransition(from, to, options) {
    return enemyNavigationStepMethod(options) === "legacy"
        ? legacyDirectTransition(from, to, options)
        : strideArcDirectTransition(from, to, options);
}

function addBestEdge(edgeList, edge) {
    if (!edge) {
        return;
    }
    const existingIndex = edgeList.findIndex((item) => (
        item.type === edge.type && item.to === edge.to && item.direction === edge.direction &&
        Math.abs(item.launchX - edge.launchX) < 0.05 && Math.abs(item.landingX - edge.landingX) < 0.05
    ));
    if (existingIndex < 0) {
        edgeList.push(edge);
        return;
    }
    if (edge.cost < edgeList[existingIndex].cost) {
        edgeList[existingIndex] = edge;
    }
}

export function enemyNavigationWalkOffEndpointExposed(sourceSupport, direction, supports = []) {
    if (!sourceSupport || !Array.isArray(supports) || supports.length === 0) {
        return true;
    }
    const sourceEdgeX = direction < 0 ? Number(sourceSupport.xMin) : Number(sourceSupport.xMax);
    if (!Number.isFinite(sourceEdgeX)) {
        return true;
    }
    const sourceEdgeY = supportPoint(sourceSupport, sourceEdgeX, 0).y;
    const seamXTolerance = 0.75;
    const seamYTolerance = 1.0;
    for (const support of supports) {
        if (!support || support.id === sourceSupport.id) {
            continue;
        }
        if (support.movingPlatformId && support.movingPlatformId !== sourceSupport.movingPlatformId) {
            continue;
        }
        const xMin = Number(support.xMin);
        const xMax = Number(support.xMax);
        if (!Number.isFinite(xMin) || !Number.isFinite(xMax)) {
            continue;
        }
        const extendsPastEdge = direction < 0
            ? xMin < sourceEdgeX - 0.001
            : xMax > sourceEdgeX + 0.001;
        const reachesSeam = xMin <= sourceEdgeX + seamXTolerance && xMax >= sourceEdgeX - seamXTolerance;
        if (!extendsPastEdge || !reachesSeam) {
            continue;
        }
        const continuationPoint = supportPoint(support, sourceEdgeX, 0);
        if (Math.abs(continuationPoint.x - sourceEdgeX) <= seamXTolerance &&
            Math.abs(continuationPoint.y - sourceEdgeY) <= seamYTolerance) {
            return false;
        }
    }
    return true;
}

export function enemyNavigationTraversalAllowedFromSupport(edge, sourceSupport, supports = []) {
    if (!edge || sourceSupport?.kind !== "walkable") {
        return true;
    }
    const launchY = Number(edge.launchY);
    const landingY = Number(edge.landingY);
    if (!Number.isFinite(launchY) || !Number.isFinite(landingY) || landingY <= launchY + 0.001) {
        return true;
    }
    // Static traversal policy: monsters may currently descend from a green
    // one-way support only through a real exposed-edge walk-off. Keeping this
    // rule in the portable navigation module means the Level Editor baker and
    // both runtimes agree about which authored edges are executable.
    if (edge.type !== "drop" || edge.walkOff !== true) {
        return false;
    }
    const vx = Number(edge.vx) || 0;
    const launchX = Number(edge.launchX);
    const landingX = Number(edge.landingX);
    if (Math.abs(vx) <= 0.001 || !Number.isFinite(launchX) || !Number.isFinite(landingX)) {
        return false;
    }
    const direction = vx < 0 ? -1 : 1;
    const sourceEdgeX = direction < 0 ? Number(sourceSupport.xMin) : Number(sourceSupport.xMax);
    const span = Math.max(0, Number(sourceSupport.xMax) - Number(sourceSupport.xMin));
    const endpointTolerance = Math.max(3, Math.min(8, span * 0.04));
    if (!Number.isFinite(sourceEdgeX) || Math.abs(launchX - sourceEdgeX) > endpointTolerance) {
        return false;
    }
    if (!enemyNavigationWalkOffEndpointExposed(sourceSupport, direction, supports)) {
        return false;
    }
    return direction < 0
        ? landingX < launchX - 0.001
        : landingX > launchX + 0.001;
}

export function filterEnemyNavigationEdgesByTraversalPolicy(edgeMap, supports = []) {
    const filtered = new Map();
    const supportById = new Map((supports || []).map((support) => [support.id, support]));
    for (const support of supports || []) {
        filtered.set(support.id, []);
    }
    for (const [supportId, edgeList] of edgeMap?.entries?.() || []) {
        const sourceSupport = supportById.get(supportId);
        filtered.set(supportId, (edgeList || []).filter((edge) =>
            !sourceSupport || enemyNavigationTraversalAllowedFromSupport(edge, sourceSupport, supports)));
    }
    return filtered;
}

export function buildEnemyNavigationEdges(supports, options = {}) {
    const normalizedOptions = { ...normalizeEnemyNavigationProfile(options), ...options };
    const obstacles = Array.isArray(options.obstacles)
        ? options.obstacles
        : navigationBlockingObstacles(options.world || {});
    normalizedOptions.obstacles = obstacles;
    normalizedOptions.strideCandidateEdges = enemyNavigationStepMethod(normalizedOptions) === "stride_arc" && normalizedOptions.world
        ? enemyNavigationStrideCandidateEdges(normalizedOptions.world)
        : [];
    const edges = new Map();
    for (const support of supports || []) {
        edges.set(support.id, []);
    }
    for (const from of supports || []) {
        for (const to of supports || []) {
            if (from.id === to.id) {
                continue;
            }
            const edgeList = edges.get(from.id);
            const direct = directTransition(from, to, normalizedOptions);
            if (direct) {
                addBestEdge(edgeList, direct);
                continue;
            }
            for (const candidate of directionalTransitionCandidates(from, to, normalizedOptions)) {
                const drop = solveDropTransitionCandidate(from, to, candidate, normalizedOptions);
                if (drop) {
                    const validation = transitionTrajectoryClear(drop, { ...normalizedOptions, fromSupport: from, toSupport: to });
                    if (validation.clear) {
                        drop.blockerIds = validation.blockerIds;
                        addBestEdge(edgeList, drop);
                    }
                }
                const solvedJump = solveJumpTransitionCandidate(from, to, candidate, normalizedOptions);
                const jump = attachJumpRunUp(solvedJump, from, normalizedOptions);
                if (jump) {
                    const validation = transitionTrajectoryClear(jump, { ...normalizedOptions, fromSupport: from, toSupport: to });
                    if (validation.clear) {
                        jump.blockerIds = validation.blockerIds;
                        addBestEdge(edgeList, jump);
                    }
                }
            }
        }
    }
    return filterEnemyNavigationEdgesByTraversalPolicy(edges, supports);
}

export function enemyNavigationSupportsSignature(supports = []) {
    return (supports || [])
        .map((support) => [
            String(support.id || ""),
            rounded(support.x1),
            rounded(support.y1),
            rounded(support.x2),
            rounded(support.y2),
            String(support.sourcePolygonId || "")
        ].join(":"))
        .sort()
        .join("|");
}

export function flattenEnemyNavigationEdges(edgeMap) {
    const flat = [];
    for (const edgeList of edgeMap?.values?.() || []) {
        for (const edge of edgeList || []) {
            flat.push({ ...edge });
        }
    }
    return flat;
}

export function enemyNavigationEdgeMapFromFlat(edges = [], supports = []) {
    const map = new Map((supports || []).map((support) => [support.id, []]));
    for (const raw of edges || []) {
        if (!raw?.from || !raw?.to) {
            continue;
        }
        if (!map.has(raw.from)) {
            map.set(raw.from, []);
        }
        map.get(raw.from).push({ ...raw });
    }
    return map;
}

export function bakeEnemyNavigationGraph(world, rawProfile = {}, metadata = {}) {
    const stepTransitionMethod = enemyNavigationStepMethod({
        stepTransitionMethod: metadata.stepTransitionMethod ?? rawProfile.stepTransitionMethod
    });
    const profile = { ...normalizeEnemyNavigationProfile(rawProfile), stepTransitionMethod };
    const supports = buildEnemyNavigationSupports(world, profile);
    const edgeMap = buildEnemyNavigationEdges(supports, { ...profile, world, stepTransitionMethod });
    const edges = flattenEnemyNavigationEdges(edgeMap).map((edge, index) => ({
        id: edge.id || `nav_edge_${index + 1}`,
        ...edge,
        launchX: rounded(edge.launchX),
        launchY: rounded(edge.launchY),
        runUpX: Number.isFinite(Number(edge.runUpX)) ? rounded(edge.runUpX) : undefined,
        runUpY: Number.isFinite(Number(edge.runUpY)) ? rounded(edge.runUpY) : undefined,
        runUpDistance: Number.isFinite(Number(edge.runUpDistance)) ? rounded(edge.runUpDistance) : undefined,
        requiredLaunchSpeed: Number.isFinite(Number(edge.requiredLaunchSpeed)) ? rounded(edge.requiredLaunchSpeed) : undefined,
        groundAcceleration: Number.isFinite(Number(edge.groundAcceleration)) ? rounded(edge.groundAcceleration) : undefined,
        takeoffClearance: Number.isFinite(Number(edge.takeoffClearance)) ? rounded(edge.takeoffClearance) : undefined,
        landingX: rounded(edge.landingX),
        landingY: rounded(edge.landingY),
        vx: rounded(edge.vx),
        vy: rounded(edge.vy),
        flightTime: rounded(edge.flightTime, 6),
        cost: rounded(edge.cost)
    }));
    return {
        version: 2,
        id: String(metadata.id || enemyNavigationProfileKey(profile)),
        label: String(metadata.label || `Run ${profile.runSpeed}, jump ${profile.jumpHeight}`),
        profile,
        supports: supports.map((support) => ({ ...support })),
        supportSignature: enemyNavigationSupportsSignature(supports),
        edges,
        dynamicCostRules: Array.isArray(metadata.dynamicCostRules) ? metadata.dynamicCostRules.map((rule) => ({ ...rule })) : [],
        build: {
            method: "ballistic_graph_with_run_up",
            stepTransitionMethod,
            samplesPerSecond: 60,
            generatedBy: String(metadata.generatedBy || "Ignatius Rocketfrock Level Editor")
        }
    };
}

export function findBakedEnemyNavigationGraph(graphCollection, rawProfile = {}) {
    if (graphCollection?.stale === true) {
        return null;
    }
    const graphs = Array.isArray(graphCollection)
        ? graphCollection
        : (Array.isArray(graphCollection?.profiles) ? graphCollection.profiles : []);
    const key = enemyNavigationProfileKey(rawProfile);
    return graphs.find((graph) => graph?.id === key || enemyNavigationProfileKey(graph?.profile || {}) === key) || null;
}

function routeStateArrivalMilli(arrivalX) {
    return Math.round(finite(arrivalX) * 1000);
}

function routePendingPush(heap, item) {
    heap.push(item);
    let index = heap.length - 1;
    while (index > 0) {
        const parent = Math.floor((index - 1) / 2);
        if (heap[parent].cost <= item.cost) {
            break;
        }
        heap[index] = heap[parent];
        index = parent;
    }
    heap[index] = item;
}

function routePendingPop(heap) {
    if (!heap.length) {
        return null;
    }
    const root = heap[0];
    const tail = heap.pop();
    if (!heap.length) {
        return root;
    }
    let index = 0;
    while (true) {
        const left = index * 2 + 1;
        const right = left + 1;
        if (left >= heap.length) {
            break;
        }
        let child = left;
        if (right < heap.length && heap[right].cost < heap[left].cost) {
            child = right;
        }
        if (heap[child].cost >= tail.cost) {
            break;
        }
        heap[index] = heap[child];
        index = child;
    }
    heap[index] = tail;
    return root;
}

function buildEnemyNavigationRouteSearch(supports, startSupportId, options = {}, stopSupportId = null) {
    if (!startSupportId) {
        return null;
    }
    const edgeMap = options.edgeMap instanceof Map
        ? options.edgeMap
        : buildEnemyNavigationEdges(supports, options);
    if (!edgeMap.has(startSupportId) || (stopSupportId && !edgeMap.has(stopSupportId))) {
        return null;
    }

    const startSupport = navigationSupportById(supports, startSupportId);
    const startX = Number.isFinite(Number(options.startX))
        ? clamp(Number(options.startX), startSupport?.xMin ?? Number(options.startX), startSupport?.xMax ?? Number(options.startX))
        : (startSupport ? (startSupport.xMin + startSupport.xMax) * 0.5 : 0);
    const states = [{
        supportId: startSupportId,
        arrivalX: startX,
        cost: 0,
        previousIndex: -1,
        viaEdge: null
    }];
    const stateIndexBySupportAndArrival = new Map([[startSupportId, new Map([[routeStateArrivalMilli(startX), 0]])]]);
    const stateIndicesBySupport = new Map([[startSupportId, [0]]]);
    const pending = [];
    routePendingPush(pending, { index: 0, cost: 0 });
    const targetX = Number.isFinite(Number(options.targetX)) ? Number(options.targetX) : null;
    let bestStopCost = Number.POSITIVE_INFINITY;

    while (pending.length) {
        const queued = routePendingPop(pending);
        const current = queued ? states[queued.index] : null;
        if (!current || Math.abs(current.cost - queued.cost) > EPSILON) {
            continue;
        }
        if (current.cost >= bestStopCost - EPSILON) {
            break;
        }
        if (stopSupportId && current.supportId === stopSupportId) {
            const goalCost = current.cost + (targetX === null ? 0 : Math.abs(targetX - current.arrivalX));
            bestStopCost = Math.min(bestStopCost, goalCost);
            if (targetX === null) {
                break;
            }
        }

        for (const edge of edgeMap.get(current.supportId) || []) {
            const approachX = Number.isFinite(Number(edge.runUpX)) ? Number(edge.runUpX) : edge.launchX;
            const approachCost = Math.abs(approachX - current.arrivalX);
            const nextCost = current.cost + approachCost + Math.max(0, finite(edge.cost));
            const nextArrivalMilli = routeStateArrivalMilli(edge.landingX);
            const stateIndicesByArrival = stateIndexBySupportAndArrival.get(edge.to);
            const knownIndex = stateIndicesByArrival?.get(nextArrivalMilli);
            if (knownIndex !== undefined && nextCost + EPSILON >= states[knownIndex].cost) {
                continue;
            }
            if (knownIndex !== undefined) {
                states[knownIndex] = {
                    supportId: edge.to,
                    arrivalX: edge.landingX,
                    cost: nextCost,
                    previousIndex: queued.index,
                    viaEdge: edge
                };
                routePendingPush(pending, { index: knownIndex, cost: nextCost });
                continue;
            }
            const nextIndex = states.length;
            states.push({
                supportId: edge.to,
                arrivalX: edge.landingX,
                cost: nextCost,
                previousIndex: queued.index,
                viaEdge: edge
            });
            if (stateIndicesByArrival) {
                stateIndicesByArrival.set(nextArrivalMilli, nextIndex);
            } else {
                stateIndexBySupportAndArrival.set(edge.to, new Map([[nextArrivalMilli, nextIndex]]));
            }
            if (!stateIndicesBySupport.has(edge.to)) {
                stateIndicesBySupport.set(edge.to, []);
            }
            stateIndicesBySupport.get(edge.to).push(nextIndex);
            routePendingPush(pending, { index: nextIndex, cost: nextCost });
        }
    }

    return { startSupportId, states, stateIndicesBySupport };
}

export function planEnemyNavigationRoutesFrom(supports, startSupportId, options = {}) {
    return buildEnemyNavigationRouteSearch(supports, startSupportId, options, null);
}

export function enemyNavigationRouteFromSearch(search, targetSupportId, targetX = null) {
    if (!search || !targetSupportId) {
        return null;
    }
    if (search.startSupportId === targetSupportId) {
        return { edges: [], cost: 0, supportIds: [targetSupportId] };
    }
    const targetIndices = search.stateIndicesBySupport.get(targetSupportId) || [];
    const resolvedTargetX = Number.isFinite(Number(targetX)) ? Number(targetX) : null;
    let bestIndex = -1;
    let bestCost = Number.POSITIVE_INFINITY;
    for (const index of targetIndices) {
        const state = search.states[index];
        const cost = state.cost + (resolvedTargetX === null ? 0 : Math.abs(resolvedTargetX - state.arrivalX));
        if (cost < bestCost) {
            bestCost = cost;
            bestIndex = index;
        }
    }
    if (bestIndex < 0) {
        return null;
    }
    const routeEdges = [];
    let cursorIndex = bestIndex;
    while (cursorIndex >= 0) {
        const cursor = search.states[cursorIndex];
        if (!cursor || cursor.previousIndex < 0) {
            break;
        }
        routeEdges.push(cursor.viaEdge);
        cursorIndex = cursor.previousIndex;
    }
    routeEdges.reverse();
    return {
        edges: routeEdges,
        cost: bestCost,
        supportIds: [search.startSupportId, ...routeEdges.map((edge) => edge.to)]
    };
}

export function planEnemyNavigationRoute(supports, startSupportId, targetSupportId, options = {}) {
    if (!startSupportId || !targetSupportId) {
        return null;
    }
    if (startSupportId === targetSupportId) {
        return { edges: [], cost: 0, supportIds: [startSupportId] };
    }
    const search = buildEnemyNavigationRouteSearch(supports, startSupportId, options, targetSupportId);
    return enemyNavigationRouteFromSearch(search, targetSupportId, options.targetX);
}

export function supportPoint(support, x, inset = 0) {
    const safeInset = Math.min(Math.max(0, inset), Math.max(0, (support.xMax - support.xMin) * 0.45));
    const clampedX = clamp(x, support.xMin + safeInset, support.xMax - safeInset);
    return { x: clampedX, y: supportYAt(support, clampedX) };
}

export function navigationSupportById(supports, id) {
    return (supports || []).find((support) => support.id === id) || null;
}
