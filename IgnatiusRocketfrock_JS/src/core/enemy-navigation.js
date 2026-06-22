const EPSILON = 0.001;

function finite(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
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
                maxY: y + h
            });
        }
    }
    return obstacles;
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
    const halfWidth = Math.max(0, finite(options.width, 1)) * 0.22;
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
    const clearance = Math.max(inset + 2, finite(options.bodyClearance, inset + 4));
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

    if (deltaY > jumpHeight * 0.55 && rise <= EPSILON) {
        const flightTime = Math.sqrt(2 * Math.max(1, deltaY) / gravity);
        const requiredVx = points.dx / flightTime;
        if (!Number.isFinite(flightTime) || flightTime <= EPSILON || Math.abs(requiredVx) > runSpeed + EPSILON) {
            return null;
        }
        return {
            type: "drop",
            from: from.id,
            to: to.id,
            launchX: points.launchX,
            launchY,
            landingX: points.landingX,
            landingY,
            vx: requiredVx,
            vy: 0,
            flightTime,
            cost: Math.abs(points.dx) + Math.abs(deltaY) * 0.55 + 55
        };
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
    return {
        type: "jump",
        from: from.id,
        to: to.id,
        launchX: points.launchX,
        launchY,
        landingX: points.landingX,
        landingY,
        vx: requiredVx,
        vy: jumpVelocity,
        flightTime,
        cost: Math.abs(points.dx) + Math.abs(deltaY) * 0.7 + 90
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
        from: from.id,
        to: to.id,
        launchX: points.launchX,
        launchY,
        landingX: points.landingX,
        landingY,
        vx: 0,
        vy: 0,
        flightTime: 0,
        cost: Math.abs(points.dx) + Math.abs(landingY - launchY) * 0.5 + 4
    };
}

export function buildEnemyNavigationEdges(supports, options = {}) {
    const edges = new Map();
    for (const support of supports || []) {
        edges.set(support.id, []);
    }
    for (const from of supports || []) {
        for (const to of supports || []) {
            if (from.id === to.id) {
                continue;
            }
            const direct = directTransition(from, to, options);
            if (direct) {
                edges.get(from.id).push(direct);
                continue;
            }
            for (const candidate of overlappingTransitionCandidates(from, to, options)) {
                const edge = solveJumpTransitionCandidate(from, to, candidate, options);
                if (edge) {
                    edges.get(from.id).push(edge);
                }
            }
        }
    }
    return edges;
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
            const approachCost = Math.abs(edge.launchX - current.arrivalX);
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
