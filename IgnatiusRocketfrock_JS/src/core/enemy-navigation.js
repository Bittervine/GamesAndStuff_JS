const EPSILON = 0.001;

export const ENEMY_DROP_SOURCE_CLEARANCE_HEIGHT_FACTOR = 0.45;

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
        if (polygon.movingPlatformId) {
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
        if (polygon.kind !== "blockable" && polygon.kind !== "damaging" && polygon.kind !== "killable") {
            continue;
        }
        const bounds = polygonBounds(polygon.points || []);
        if (bounds) {
            obstacles.push({ id: String(polygon.id || "collisionPolygon"), ...bounds });
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
        const allowedMin = sourceDrop && Number.isFinite(Number(endpointSupport.obstacleXMin))
            ? Number(endpointSupport.obstacleXMin) - halfWidth - 2
            : endpointSupport.xMin;
        const allowedMax = sourceDrop && Number.isFinite(Number(endpointSupport.obstacleXMax))
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
        if (obstacle.minY > groundY + 3) {
            continue;
        }
        const sameHeightContinuationTolerance = Math.max(2, finite(options.maxStepHeight, 24));
        const obstacleContinuesFloor = obstacle.maxY >= groundY - EPSILON
            && Math.abs(obstacle.minY - groundY) <= sameHeightContinuationTolerance;
        if (obstacleContinuesFloor) {
            // Generated run-and-gun floors intentionally overlap solid platform
            // polygons at the same walking height. Treat the neighbour's top as a
            // continuation of the floor instead of cutting both navigation supports
            // apart with each other's rock body.
            continue;
        }
        const clearanceUnderObstacle = groundY - obstacle.maxY;
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
        const sourceEdge = direction < 0 ? from.obstacleXMin : from.obstacleXMax;
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
        if (deltaY <= maxStepHeight + EPSILON || deltaY > maxFallDistance + EPSILON) {
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
            Math.min(bodyHeight * ENEMY_DROP_SOURCE_CLEARANCE_HEIGHT_FACTOR, bodyWidth * 0.8)
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
    const jumpHeight = Math.max(0, finite(options.jumpHeight, 0));
    const gravity = Math.max(1, finite(options.gravity, 1200));
    const runSpeed = Math.max(1, finite(options.runSpeed, 1));
    const maxFallDistance = Math.max(0, finite(options.maxFallDistance, jumpHeight * 2 + 80));
    const direction = targetLeft ? -1 : 1;
    const sourceEdge = targetLeft ? from.obstacleXMin : from.obstacleXMax;
    if (!Number.isFinite(sourceEdge) || jumpHeight <= EPSILON) {
        return candidates;
    }

    const launchX = targetLeft
        ? clamp(from.xMin + inset, from.xMin, from.xMax)
        : clamp(from.xMax - inset, from.xMin, from.xMax);
    const launchY = supportYAt(from, launchX);
    const safeInset = Math.min(
        Math.max(inset, halfWidth + 2),
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

function directTransition(from, to, options) {
    const maxStepHeight = Math.max(0, finite(options.maxStepHeight, 24));
    const maxStepGap = Math.max(0, finite(options.maxStepGap, 18));
    const points = basicTransitionCandidate(from, to, Math.max(4, finite(options.edgeInset, 10)));
    const launchY = supportYAt(from, points.launchX);
    const landingY = supportYAt(to, points.landingX);
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

export function buildEnemyNavigationEdges(supports, options = {}) {
    const normalizedOptions = { ...normalizeEnemyNavigationProfile(options), ...options };
    const obstacles = Array.isArray(options.obstacles)
        ? options.obstacles
        : navigationBlockingObstacles(options.world || {});
    normalizedOptions.obstacles = obstacles;
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
    return edges;
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
    const profile = normalizeEnemyNavigationProfile(rawProfile);
    const supports = buildEnemyNavigationSupports(world, profile);
    const edgeMap = buildEnemyNavigationEdges(supports, { ...profile, world });
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

function routeStateKey(supportId, arrivalX) {
    return `${supportId}@${finite(arrivalX).toFixed(3)}`;
}

export function planEnemyNavigationRoute(supports, startSupportId, targetSupportId, options = {}) {
    if (!startSupportId || !targetSupportId) {
        return null;
    }
    if (startSupportId === targetSupportId) {
        return { edges: [], cost: 0, supportIds: [startSupportId] };
    }
    const edgeMap = options.edgeMap instanceof Map
        ? options.edgeMap
        : buildEnemyNavigationEdges(supports, options);
    if (!edgeMap.has(startSupportId) || !edgeMap.has(targetSupportId)) {
        return null;
    }

    const startSupport = navigationSupportById(supports, startSupportId);
    const startX = Number.isFinite(Number(options.startX))
        ? clamp(Number(options.startX), startSupport?.xMin ?? Number(options.startX), startSupport?.xMax ?? Number(options.startX))
        : (startSupport ? (startSupport.xMin + startSupport.xMax) * 0.5 : 0);
    const targetX = Number.isFinite(Number(options.targetX)) ? Number(options.targetX) : null;
    const startKey = routeStateKey(startSupportId, startX);
    const states = new Map([[startKey, {
        key: startKey,
        supportId: startSupportId,
        arrivalX: startX,
        cost: 0,
        previousKey: null,
        viaEdge: null
    }]]);
    const pending = [{ key: startKey, cost: 0 }];
    let bestGoal = null;

    while (pending.length) {
        pending.sort((a, b) => a.cost - b.cost);
        const queued = pending.shift();
        const current = queued ? states.get(queued.key) : null;
        if (!current || Math.abs(current.cost - queued.cost) > EPSILON) {
            continue;
        }
        if (bestGoal && current.cost >= bestGoal.cost - EPSILON) {
            break;
        }
        if (current.supportId === targetSupportId) {
            const goalCost = current.cost + (targetX === null ? 0 : Math.abs(targetX - current.arrivalX));
            if (!bestGoal || goalCost < bestGoal.cost) {
                bestGoal = { key: current.key, cost: goalCost };
            }
            if (targetX === null) {
                break;
            }
        }

        for (const edge of edgeMap.get(current.supportId) || []) {
            const approachX = Number.isFinite(Number(edge.runUpX)) ? Number(edge.runUpX) : edge.launchX;
            const approachCost = Math.abs(approachX - current.arrivalX);
            const nextCost = current.cost + approachCost + Math.max(0, finite(edge.cost));
            const nextKey = routeStateKey(edge.to, edge.landingX);
            const known = states.get(nextKey);
            if (known && nextCost + EPSILON >= known.cost) {
                continue;
            }
            states.set(nextKey, {
                key: nextKey,
                supportId: edge.to,
                arrivalX: edge.landingX,
                cost: nextCost,
                previousKey: current.key,
                viaEdge: edge
            });
            pending.push({ key: nextKey, cost: nextCost });
        }
    }

    if (!bestGoal) {
        return null;
    }
    const routeEdges = [];
    let cursor = states.get(bestGoal.key);
    while (cursor && cursor.previousKey) {
        routeEdges.push(cursor.viaEdge);
        cursor = states.get(cursor.previousKey);
    }
    routeEdges.reverse();
    const supportIds = [startSupportId, ...routeEdges.map((edge) => edge.to)];
    return { edges: routeEdges, cost: bestGoal.cost, supportIds };
}

export function supportPoint(support, x, inset = 0) {
    const safeInset = Math.min(Math.max(0, inset), Math.max(0, (support.xMax - support.xMin) * 0.45));
    const clampedX = clamp(x, support.xMin + safeInset, support.xMax - safeInset);
    return { x: clampedX, y: supportYAt(support, clampedX) };
}

export function navigationSupportById(supports, id) {
    return (supports || []).find((support) => support.id === id) || null;
}
