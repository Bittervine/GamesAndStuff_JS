const EPSILON = 0.001;
const ENEMY_NAVIGATION_STANDABLE_SLOPE_RATIO = 0.75;
const ENEMY_NAVIGATION_MAX_WALKABLE_SLOPE_RATIO = 5.671281819617707; // tan(80 degrees), matches wizard physics
const ENEMY_NAVIGATION_MIN_SUPPORT_SPAN = 0.05; // only rejects numerical slivers; actor clearance decides whether a fragment is usable
const ENEMY_NAVIGATION_DIRECT_SEAM_MIN_TANGENT_DOT = 0.9993908270190958; // cos(2 degrees), matches wizard/enemy walking seam physics
const ENEMY_NAVIGATION_DIRECT_SEAM_MAX_DISTANCE = 1.0; // matches ordinary wizard/enemy seam continuation
const ENEMY_NAVIGATION_ATOMIC_SPLIT_SEAM_MAX_DISTANCE = 0.05; // only exact authored-line split siblings bypass foreign-seam physics
const ENEMY_NAVIGATION_SHORTCUT_MIN_SAVING = 500;
const ENEMY_NAVIGATION_BALLISTIC_PROPOSAL_LIMIT = 3;

export const ENEMY_NAVIGATION_GRAPH_BUILD_METHOD = "atomic_support_fragments_sparse_strides_v15";
export const ENEMY_DROP_SOURCE_CLEARANCE_HEIGHT_FACTOR = 0.45;
export const ENEMY_DROP_SOURCE_CLEARANCE_WIDTH_FACTOR = 0.9;
export const ENEMY_NAVIGATION_VERIFICATION_UNVERIFIED = "unverified";
export const ENEMY_NAVIGATION_VERIFICATION_VERIFIED = "verified";
export const ENEMY_NAVIGATION_VERIFICATION_FAILED = "failed";
export const ENEMY_NAVIGATION_ADVISORY_HEURISTIC_SCHEMA = 13;
export const ENEMY_NAVIGATION_ADVISORY_HEURISTICS = Object.freeze([
    "intervening_walkable_support",
    "intervening_walkable_support_body_span",
    "source_support_recapture",
    "source_support_return"
]);

export function enemyNavigationEdgeVerification(edge) {
    if (edge?.type !== "step" && edge?.type !== "jump" && edge?.type !== "drop") return ENEMY_NAVIGATION_VERIFICATION_VERIFIED;
    const value = String(edge?.verification || "").trim().toLowerCase();
    if (value === ENEMY_NAVIGATION_VERIFICATION_VERIFIED || value === ENEMY_NAVIGATION_VERIFICATION_FAILED) return value;
    return ENEMY_NAVIGATION_VERIFICATION_UNVERIFIED;
}

export function enemyNavigationEdgeRuntimeAllowed(edge, options = {}) {
    if (enemyNavigationEdgeVerification(edge) === ENEMY_NAVIGATION_VERIFICATION_FAILED) return false;
    if (options?.enforceAdvisoryHeuristics === true
        && Array.isArray(edge?.heuristicRejectors)
        && edge.heuristicRejectors.length > 0) {
        const selective = Array.isArray(options?.enforcedAdvisoryHeuristics)
            ? new Set(options.enforcedAdvisoryHeuristics.map((id) => String(id || "")).filter(Boolean))
            : null;
        if (!selective || edge.heuristicRejectors.some((id) => selective.has(String(id || "")))) return false;
    }
    return true;
}

function enemyNavigationEdgeUsesUnverifiedFallback(edge) {
    return enemyNavigationEdgeVerification(edge) === ENEMY_NAVIGATION_VERIFICATION_UNVERIFIED;
}

function finite(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function ballisticTrajectoryDistance(vx, vy, gravity, flightTime) {
    const duration = Math.max(0, finite(flightTime));
    if (duration <= EPSILON) return 0;
    const horizontalSpeed = Math.abs(finite(vx));
    const verticalSpeed = finite(vy);
    const acceleration = finite(gravity);
    if (Math.abs(acceleration) <= EPSILON) {
        return Math.hypot(horizontalSpeed, verticalSpeed) * duration;
    }
    const primitive = (vertical) => {
        if (horizontalSpeed <= EPSILON) return 0.5 * vertical * Math.abs(vertical);
        const speed = Math.hypot(horizontalSpeed, vertical);
        return 0.5 * (vertical * speed + horizontalSpeed * horizontalSpeed * Math.asinh(vertical / horizontalSpeed));
    };
    const endVerticalSpeed = verticalSpeed + acceleration * duration;
    return Math.abs((primitive(endVerticalSpeed) - primitive(verticalSpeed)) / acceleration);
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

function supportTravelDistance(support, fromX, toX) {
    if (!support) return Math.abs(finite(toX) - finite(fromX));
    const a = clamp(finite(fromX), support.xMin, support.xMax);
    const b = clamp(finite(toX), support.xMin, support.xMax);
    return Math.hypot(b - a, supportYAt(support, b) - supportYAt(support, a));
}

function supportYUnclamped(support, x) {
    const span = support.x2 - support.x1;
    if (Math.abs(span) < EPSILON) {
        return Math.min(support.y1, support.y2);
    }
    const ratio = (x - support.x1) / span;
    return support.y1 + (support.y2 - support.y1) * ratio;
}

export function enemyNavigationSupportCollisionId(support) {
    if (!support) return "";
    const polygonId = String(support.sourcePolygonId || "").trim();
    if (polygonId) return polygonId;
    return String(support.id || "").replace(/_nav_\d+$/, "");
}

export function enemyNavigationSupportPhysicalOwnerId(support) {
    if (!support) return "";
    const polygonId = String(support.sourcePolygonId || "").trim();
    if (polygonId) return `polygon:${polygonId}`;
    const id = enemyNavigationSupportCollisionId(support);
    const match = id.match(/^(.*)_(?:walkable|blockable|damaging|killable)_\d+$/);
    return `segment:${match ? match[1] : id}`;
}

export function enemyNavigationSupportsShareEndpoint(left, right, tolerance = 0.75) {
    if (!left || !right) return false;
    const maxDistance = Math.max(0, finite(tolerance, 0.75));
    const leftPoints = [[Number(left.x1), Number(left.y1)], [Number(left.x2), Number(left.y2)]];
    const rightPoints = [[Number(right.x1), Number(right.y1)], [Number(right.x2), Number(right.y2)]];
    return leftPoints.some(([ax, ay]) => rightPoints.some(([bx, by]) => (
        Math.hypot(ax - bx, ay - by) <= maxDistance
    )));
}

function buildEnemyNavigationAdvisoryContext(supports = []) {
    // Advisory traversal checks are intentionally a cheap shadow of runtime.
    // Index supports by horizontal buckets once per graph so each 60 Hz foot
    // sample only considers nearby lines instead of rescanning every support.
    const bucketSize = 128;
    const supportById = new Map();
    const ownerById = new Map();
    const supportBuckets = new Map();
    for (const support of supports || []) {
        if (!support) continue;
        const id = String(support.id || "");
        if (id) {
            supportById.set(id, support);
            ownerById.set(id, enemyNavigationSupportPhysicalOwnerId(support));
        }
        const minX = Number(support.xMin);
        const maxX = Number(support.xMax);
        if (!Number.isFinite(minX) || !Number.isFinite(maxX)) continue;
        // The historical center-only advisory allows a 0.25 px endpoint
        // tolerance, so pad bucket enrollment by that amount as well.
        const firstBucket = Math.floor((minX - 0.25) / bucketSize);
        const lastBucket = Math.floor((maxX + 0.25) / bucketSize);
        for (let bucket = firstBucket; bucket <= lastBucket; bucket += 1) {
            const entries = supportBuckets.get(bucket) || [];
            entries.push(support);
            supportBuckets.set(bucket, entries);
        }
    }
    return { supports, bucketSize, supportById, ownerById, supportBuckets };
}

function discreteFeetCrossings(edge, rawProfile, advisoryContext) {
    const centerById = new Map();
    const bodyById = new Map();
    const fixedStep = 1 / 60;
    const endTime = Math.max(0, finite(edge.flightTime));
    if (endTime <= EPSILON) return { centerById, bodyById };

    const gravity = Math.max(1, finite(rawProfile.gravity, 1200));
    const bodyWidth = Math.max(8, finite(rawProfile.bodyWidth, 48));
    const vx = finite(edge.vx);
    let x = finite(edge.launchX);
    let y = finite(edge.launchY);
    let vy = finite(edge.vy);
    let time = 0;
    let tick = 0;
    const samples = [
        // Keep the center-only Revision-503 tolerance independent from the
        // runtime-shaped body-span samples.
        { id: "center", offsetX: 0, priority: 0, horizontalTolerance: 0.25, destination: centerById },
        { id: "center", offsetX: 0, priority: 0, horizontalTolerance: EPSILON, destination: bodyById },
        { id: "left", offsetX: -bodyWidth * 0.42, priority: 1, horizontalTolerance: EPSILON, destination: bodyById },
        { id: "right", offsetX: bodyWidth * 0.42, priority: 2, horizontalTolerance: EPSILON, destination: bodyById }
    ];

    while (time < endTime - EPSILON) {
        const dt = Math.min(fixedStep, endTime - time);
        const previousY = y;
        vy += gravity * dt;
        x += vx * dt;
        y += vy * dt;
        time += dt;
        tick += 1;
        if (vy <= EPSILON) continue;

        for (const sample of samples) {
            const sampleX = x + sample.offsetX;
            const bucket = Math.floor(sampleX / advisoryContext.bucketSize);
            const nearbySupports = advisoryContext.supportBuckets.get(bucket) || [];
            for (const support of nearbySupports) {
                const id = String(support?.id || "");
                if (!id || sample.destination.has(id)) continue;
                const xTolerance = Math.max(EPSILON, finite(sample.horizontalTolerance, EPSILON));
                if (sampleX < Number(support.xMin) - xTolerance || sampleX > Number(support.xMax) + xTolerance) continue;
                const surfaceY = supportYAt(support, sampleX);
                if (previousY <= surfaceY + 0.5 && y >= surfaceY - 3) {
                    sample.destination.set(id, {
                        tick,
                        contactX: sampleX,
                        surfaceY,
                        centerX: x,
                        feetY: y,
                        previousY,
                        time,
                        sample: sample.id
                    });
                }
            }
        }
    }
    return { centerById, bodyById };
}

function targetSupportResolvableAtLanding(targetSupport, crossing, bodyWidth) {
    if (!targetSupport || !crossing) return false;
    const landingY = Number(crossing.surfaceY);
    const centerX = Number(crossing.centerX);
    const halfProbe = Math.max(8, finite(bodyWidth, 48)) * 0.48;
    const samples = [Number(crossing.contactX), centerX, centerX - halfProbe, centerX + halfProbe];
    for (const sampleX of samples) {
        if (!Number.isFinite(sampleX) || sampleX < Number(targetSupport.xMin) - EPSILON || sampleX > Number(targetSupport.xMax) + EPSILON) continue;
        const delta = supportYAt(targetSupport, sampleX) - landingY;
        if (delta >= -5 && delta <= 5) return true;
    }
    return false;
}

function sourceDepartureIgnoresCrossing(edge, sourceSupport, crossing, rawProfile) {
    if (!sourceSupport || !crossing) return false;
    const bodyWidth = Math.max(8, finite(rawProfile.bodyWidth, 48));
    const bodyHeight = Math.max(24, finite(rawProfile.bodyHeight, 120));
    const centerX = Number(crossing.centerX);
    const nextY = Number(crossing.feetY);
    const airTime = Number(crossing.time);
    const sourcePointY = supportYAt(sourceSupport, clamp(centerX, sourceSupport.xMin, sourceSupport.xMax));
    if (edge.type === "drop") {
        const vx = finite(edge.vx);
        if (Math.abs(vx) <= EPSILON) return false;
        const direction = vx < 0 ? -1 : 1;
        const obstacleEdge = direction < 0
            ? (Number.isFinite(sourceSupport.obstacleXMin) ? Number(sourceSupport.obstacleXMin) : Number(sourceSupport.xMin))
            : (Number.isFinite(sourceSupport.obstacleXMax) ? Number(sourceSupport.obstacleXMax) : Number(sourceSupport.xMax));
        const clearCenterX = obstacleEdge + direction * (bodyWidth * 0.5 + 2);
        const clearedHorizontally = direction < 0 ? centerX <= clearCenterX : centerX >= clearCenterX;
        const departureDrop = Math.max(6, Math.min(bodyHeight * ENEMY_DROP_SOURCE_CLEARANCE_HEIGHT_FACTOR, bodyWidth * ENEMY_DROP_SOURCE_CLEARANCE_WIDTH_FACTOR));
        return !clearedHorizontally && nextY <= sourcePointY + departureDrop + 0.5 && airTime <= 1;
    }
    const departedHorizontally = centerX < Number(sourceSupport.xMin) - bodyWidth * 0.5 || centerX > Number(sourceSupport.xMax) + bodyWidth * 0.5;
    const departedVertically = nextY > sourcePointY + Math.max(4, bodyHeight * 0.08);
    return !departedHorizontally && !departedVertically && airTime <= 1;
}

function interveningWalkableSupportAdvisory(edge, supports, rawProfile, advisoryContext, crossingById, allowTargetResolveRecovery = true) {
    const fromSupport = advisoryContext.supportById.get(String(edge.from || "")) || null;
    const toSupport = advisoryContext.supportById.get(String(edge.to || "")) || null;
    const fromOwnerId = advisoryContext.ownerById.get(String(edge.from || "")) || "";
    const toOwnerId = advisoryContext.ownerById.get(String(edge.to || "")) || "";
    const targetCrossing = toSupport ? crossingById.get(String(toSupport.id || "")) || null : null;
    let best = null;

    for (const support of supports || []) {
        if (!support || support.kind !== "walkable" || support.id === edge.from || support.id === edge.to) continue;
        const ownerId = advisoryContext.ownerById.get(String(support.id || "")) || "";
        // Sibling support segments on the same authored object remain excluded.
        // Revision 502 made support identity much more reliable, but this heuristic
        // is specifically meant to predict interception by a different physical
        // platform rather than adjudicate segmented destination geometry.
        if (ownerId && (ownerId === fromOwnerId || ownerId === toOwnerId)) continue;
        const crossing = crossingById.get(String(support.id || "")) || null;
        if (!crossing || (targetCrossing && crossing.tick >= targetCrossing.tick)) continue;
        // Runtime resolves the preferred target from the snapped landing pose.
        // Touching another line is therefore harmless when the intended target
        // is already within the same landing footprint.
        if (allowTargetResolveRecovery && toSupport && targetSupportResolvableAtLanding(toSupport, crossing, rawProfile.bodyWidth)) continue;
        if (!best || crossing.tick < best.tick) {
            best = { supportId: support.id, ...crossing };
        }
    }
    return best;
}

function sourceSupportReturnAdvisory(edge, supports, rawProfile, advisoryContext, crossingById) {
    const fromSupport = advisoryContext.supportById.get(String(edge.from || "")) || null;
    const toSupport = advisoryContext.supportById.get(String(edge.to || "")) || null;
    if (!fromSupport || !toSupport) return null;
    const targetCrossing = crossingById.get(String(toSupport.id || "")) || null;
    const crossing = crossingById.get(String(fromSupport.id || "")) || null;
    if (!crossing || (targetCrossing && crossing.tick >= targetCrossing.tick)) return null;
    // Mirror the runtime's temporary source-collision ignore window. A jump
    // may cross its departure floor again while that floor is intentionally
    // ignored, just as a drop may still be clearing its departure edge.
    if (sourceDepartureIgnoresCrossing(edge, fromSupport, crossing, rawProfile)) return null;
    if (targetSupportResolvableAtLanding(toSupport, crossing, rawProfile.bodyWidth)) return null;
    // Diagnose the source return only when it is the first actionable landing
    // contact. If another support catches the actor on an earlier (or same)
    // tick, the later source crossing is not the cause of this traversal.
    for (const support of supports || []) {
        if (!support || support.id === fromSupport.id) continue;
        const otherCrossing = crossingById.get(String(support.id || "")) || null;
        if (otherCrossing && otherCrossing.tick <= crossing.tick) return null;
    }
    return { supportId: fromSupport.id, ...crossing };
}

function sourceSupportRecaptureAdvisory(edge, supports, rawProfile, advisoryContext, crossingById) {
    const fromSupport = advisoryContext.supportById.get(String(edge.from || "")) || null;
    const toSupport = advisoryContext.supportById.get(String(edge.to || "")) || null;
    if (!fromSupport || !toSupport) return null;
    const fromOwnerId = advisoryContext.ownerById.get(String(edge.from || "")) || "";
    const toOwnerId = advisoryContext.ownerById.get(String(edge.to || "")) || "";
    if (!fromOwnerId || fromOwnerId === toOwnerId) return null;
    const targetCrossing = crossingById.get(String(toSupport.id || "")) || null;
    let best = null;
    for (const support of supports || []) {
        if (!support || support.kind !== "walkable" || support.id === edge.to) continue;
        if ((advisoryContext.ownerById.get(String(support.id || "")) || "") !== fromOwnerId) continue;
        const crossing = crossingById.get(String(support.id || "")) || null;
        if (!crossing || (targetCrossing && crossing.tick >= targetCrossing.tick)) continue;
        if (sourceDepartureIgnoresCrossing(edge, fromSupport, crossing, rawProfile)) continue;
        if (targetSupportResolvableAtLanding(toSupport, crossing, rawProfile.bodyWidth)) continue;
        if (!best || crossing.tick < best.tick) best = { supportId: support.id, ...crossing };
    }
    return best;
}

export function enemyNavigationAdvisoryHeuristicAssessment(edge, supports = [], rawProfile = {}, sharedContext = null) {
    if (edge?.type !== "jump" && edge?.type !== "drop") {
        return { rejectors: [], diagnostics: {} };
    }

    const advisoryContext = sharedContext?.supports === supports
        ? sharedContext
        : buildEnemyNavigationAdvisoryContext(supports);
    const crossings = discreteFeetCrossings(edge, rawProfile, advisoryContext);
    // Keep the original center-foot signal strict: it had zero verified-edge
    // warnings before target-at-contact recovery was introduced for body-span
    // contacts. The recovery exception belongs only to the wider body probe.
    const centerInterception = interveningWalkableSupportAdvisory(edge, supports, rawProfile, advisoryContext, crossings.centerById, false);
    const bodyInterception = interveningWalkableSupportAdvisory(edge, supports, rawProfile, advisoryContext, crossings.bodyById, true);
    const sourceRecapture = sourceSupportRecaptureAdvisory(edge, supports, rawProfile, advisoryContext, crossings.bodyById);
    const sourceReturn = sourceSupportReturnAdvisory(edge, supports, rawProfile, advisoryContext, crossings.bodyById);
    const rejectors = [];
    const diagnostics = {};
    const record = (id, value) => {
        if (!value) return;
        rejectors.push(id);
        diagnostics[id] = {
            supportId: value.supportId,
            tick: value.tick,
            sample: value.sample,
            contactX: rounded(value.contactX),
            surfaceY: rounded(value.surfaceY),
            centerX: rounded(value.centerX)
        };
    };
    record("intervening_walkable_support", centerInterception);
    record("intervening_walkable_support_body_span", bodyInterception);
    record("source_support_recapture", sourceRecapture);
    record("source_support_return", sourceReturn);
    return { rejectors, diagnostics };
}

export function enemyNavigationAdvisoryHeuristicRejectors(edge, supports = [], rawProfile = {}) {
    return enemyNavigationAdvisoryHeuristicAssessment(edge, supports, rawProfile).rejectors;
}

function navigationGeometryDependencyIds(raw = {}, fallbackKind = "geometry") {
    const ids = new Set(Array.isArray(raw.geometryDependencyIds) ? raw.geometryDependencyIds.map((value) => String(value || "")).filter(Boolean) : []);
    const visualId = String(raw.visualId || raw.sourceVisualId || "").trim();
    const assetId = String(raw.assetId || raw.sourceAssetId || "").trim();
    const atlasId = String(raw.atlasId || raw.sourceAtlasId || "").trim();
    const id = String(raw.id || "").trim();
    if (visualId) ids.add(`visual:${visualId}`);
    else if (assetId) ids.add(`asset:${atlasId ? `${atlasId}:` : ""}${assetId}`);
    else if (!ids.size && id) ids.add(`${fallbackKind}:${id}`);
    return [...ids].sort();
}

function normalizedSupport(raw, index) {
    const x1 = finite(raw.x1);
    const x2 = finite(raw.x2);
    const y1 = finite(raw.y1);
    const y2 = finite(raw.y2);
    const sourceVisualId = String(raw.sourceVisualId || raw.visualId || "").trim() || null;
    const sourceAssetId = String(raw.sourceAssetId || raw.assetId || "").trim() || null;
    const sourceAtlasId = String(raw.sourceAtlasId || raw.atlasId || "").trim() || null;
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
        obstacleXMin: raw.obstacleXMin !== null && raw.obstacleXMin !== undefined && Number.isFinite(Number(raw.obstacleXMin)) ? Number(raw.obstacleXMin) : null,
        obstacleXMax: raw.obstacleXMax !== null && raw.obstacleXMax !== undefined && Number.isFinite(Number(raw.obstacleXMax)) ? Number(raw.obstacleXMax) : null,
        // A virtual support endpoint can be an actor-center clearance boundary
        // rather than the physical step face. Preserve that face separately so
        // the stride-arc solver can project the feet back to the geometry that
        // created the clearance cut without making the support itself unsafe.
        strideBoundaryXMin: raw.strideBoundaryXMin !== null && raw.strideBoundaryXMin !== undefined && Number.isFinite(Number(raw.strideBoundaryXMin)) ? Number(raw.strideBoundaryXMin) : null,
        strideBoundaryXMax: raw.strideBoundaryXMax !== null && raw.strideBoundaryXMax !== undefined && Number.isFinite(Number(raw.strideBoundaryXMax)) ? Number(raw.strideBoundaryXMax) : null,
        sourceVisualId,
        sourceAssetId,
        sourceAtlasId,
        geometryDependencyIds: navigationGeometryDependencyIds({ ...raw, visualId: sourceVisualId, assetId: sourceAssetId, atlasId: sourceAtlasId }, "support")
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
            edges.push({
                x1: finite(a?.x),
                y1: finite(a?.y),
                x2: finite(b?.x),
                y2: finite(b?.y),
                // Slope legality is handled separately. Here we only reject an
                // authored polygon edge whose solid interior lies above it, i.e.
                // an underside. The former 0.25 normal threshold also rejected
                // perfectly legal 76-80 degree walkable surfaces before the
                // actor-clearance pass ever got to inspect them.
                topFacing: upwardFacing > EPSILON,
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
                points: (polygon.points || []).map((point) => ({ x: finite(point?.x), y: finite(point?.y) })),
                visualId: String(polygon.visualId || "") || null,
                assetId: String(polygon.assetId || "") || null,
                atlasId: String(polygon.atlasId || "") || null,
                geometryDependencyIds: navigationGeometryDependencyIds(polygon, "polygon")
            });
        }
    }
    for (const solid of world?.solids || []) {
        const x = finite(solid.x);
        const y = finite(solid.y);
        const w = Math.max(0, finite(solid.w));
        const h = Math.max(0, finite(solid.h));
        if (w >= ENEMY_NAVIGATION_MIN_SUPPORT_SPAN && h >= ENEMY_NAVIGATION_MIN_SUPPORT_SPAN) {
            obstacles.push({
                id: String(solid.id || "solid"),
                minX: x,
                minY: y,
                maxX: x + w,
                maxY: y + h,
                points: [
                    { x, y },
                    { x: x + w, y },
                    { x: x + w, y: y + h },
                    { x, y: y + h }
                ],
                dynamic: Boolean(solid.dynamicNavigationBlocker || solid.navigationBlockerId),
                visualId: String(solid.visualId || "") || null,
                assetId: String(solid.assetId || "") || null,
                atlasId: String(solid.atlasId || "") || null,
                geometryDependencyIds: navigationGeometryDependencyIds(solid, "solid")
            });
        }
    }
    for (const blocker of world?.navigationBlockers || []) {
        const x = finite(blocker.x);
        const y = finite(blocker.y);
        const w = Math.max(0, finite(blocker.w));
        const h = Math.max(0, finite(blocker.h));
        if (w >= ENEMY_NAVIGATION_MIN_SUPPORT_SPAN && h >= ENEMY_NAVIGATION_MIN_SUPPORT_SPAN) {
            obstacles.push({
                id: String(blocker.id || `navigationBlocker_${obstacles.length + 1}`),
                minX: x,
                minY: y,
                maxX: x + w,
                maxY: y + h,
                points: [
                    { x, y },
                    { x: x + w, y },
                    { x: x + w, y: y + h },
                    { x, y: y + h }
                ],
                dynamic: blocker.dynamic !== false,
                closedState: String(blocker.closedState || "closed"),
                geometryDependencyIds: navigationGeometryDependencyIds(blocker, "navigationBlocker")
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
            if (Math.abs(x - a.x) <= tolerance) intersections.push(a.y, b.y);
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

function pointInsideNavigationObstacleGeometry(point, obstacle) {
    const points = Array.isArray(obstacle?.points) ? obstacle.points : [];
    if (points.length < 3) {
        return point.x > obstacle.minX + 0.02 && point.x < obstacle.maxX - 0.02 &&
            point.y > obstacle.minY + 0.02 && point.y < obstacle.maxY - 0.02;
    }
    if (pointOnNavigationObstacleBoundary(point, obstacle)) return false;
    let inside = false;
    for (let index = 0, previous = points.length - 1; index < points.length; previous = index, index += 1) {
        const a = points[index];
        const b = points[previous];
        const crosses = ((a.y > point.y) !== (b.y > point.y)) &&
            (point.x < (b.x - a.x) * (point.y - a.y) / ((b.y - a.y) || 0.0000001) + a.x);
        if (crosses) inside = !inside;
    }
    return inside;
}

function navigationObstacleOverlapsStandingBodyAtX(support, obstacle, actorCenterX, bodyHeight, sideClearance, automaticStepHeight = 0) {
    const groundY = supportYAt(support, actorCenterX);
    const left = actorCenterX - sideClearance;
    const right = actorCenterX + sideClearance;
    // Keep the feet contact itself out of the clearance body. A foreign polygon
    // that simply continues the same floor is therefore harmless, while a step,
    // wall or hanging obstacle that actually enters the torso rectangle blocks.
    const top = groundY - bodyHeight + 0.5;
    const bottom = groundY - 0.5;
    if (bottom <= top + EPSILON || !rectangleIntersectsObstacle(left, top, right, bottom, obstacle, 0.02)) return false;

    // A neighbouring floor polygon can overlap the standing body only because
    // its short side/riser sits under the actor's feet. If the obstacle's local
    // top is within automatic step reach and the feet are not actually buried
    // inside it, this is ordinary walkable continuation rather than headroom
    // blockage. This keeps actor-aware clearance without carving false trenches
    // around overlapping slopes and stair fragments.
    const obstacleSampleX = clamp(actorCenterX, obstacle.minX, obstacle.maxX);
    const localObstacleSpan = obstacleVerticalSpanAtX(obstacle, obstacleSampleX);
    const localStepContinuation = automaticStepHeight >= 0
        && localObstacleSpan.maxY >= groundY - 0.75
        && Math.abs(localObstacleSpan.minY - groundY) <= automaticStepHeight + 0.75
        && !pointStrictlyInsideNavigationObstacle({ x: actorCenterX, y: groundY }, obstacle);
    if (localStepContinuation) return false;

    const points = Array.isArray(obstacle?.points) ? obstacle.points : [];
    if (points.length < 3) return true;
    const corners = [
        { x: left, y: top },
        { x: right, y: top },
        { x: right, y: bottom },
        { x: left, y: bottom }
    ];
    if (corners.some((point) => pointInsideNavigationObstacleGeometry(point, obstacle))) return true;
    if (points.some((point) => point.x > left + 0.02 && point.x < right - 0.02 && point.y > top + 0.02 && point.y < bottom - 0.02)) return true;

    const rectEdges = [
        [corners[0], corners[1]],
        [corners[1], corners[2]],
        [corners[2], corners[3]],
        [corners[3], corners[0]]
    ];
    for (let index = 0; index < points.length; index += 1) {
        const a = points[index];
        const b = points[(index + 1) % points.length];
        if (rectEdges.some(([c, d]) => groundStrideSegmentIntersection(a, b, c, d))) return true;
    }
    return false;
}

function supportBodyBlockedIntervalsByObstacle(support, obstacle, intervalMin, intervalMax, bodyHeight, sideClearance, automaticStepHeight) {
    const candidateMin = Math.max(intervalMin, obstacle.minX - sideClearance);
    const candidateMax = Math.min(intervalMax, obstacle.maxX + sideClearance);
    if (candidateMax - candidateMin <= EPSILON) return [];

    // This is a geometric sweep of the actual standing body, not a movement
    // simulation. The small scan only locates topology changes; each transition
    // is then binary-refined. Because the obstacle is already Minkowski-expanded
    // by the actor half-width, a blocking island is much wider than this step.
    const scanStep = Math.max(0.25, Math.min(1, sideClearance * 0.05));
    const blockedAt = (x) => navigationObstacleOverlapsStandingBodyAtX(
        support, obstacle, clamp(x, intervalMin, intervalMax), bodyHeight, sideClearance, automaticStepHeight
    );
    const xs = [candidateMin];
    for (let x = candidateMin + scanStep; x < candidateMax - EPSILON; x += scanStep) xs.push(x);
    if (candidateMax > candidateMin + EPSILON) xs.push(candidateMax);

    const refineBoundary = (left, right, leftBlocked) => {
        let low = left;
        let high = right;
        for (let iteration = 0; iteration < 14; iteration += 1) {
            const middle = (low + high) * 0.5;
            if (blockedAt(middle) === leftBlocked) low = middle;
            else high = middle;
        }
        return (low + high) * 0.5;
    };

    const blocked = [];
    let previousX = xs[0];
    let previousBlocked = blockedAt(previousX);
    let blockedStart = previousBlocked ? previousX : null;
    for (let index = 1; index < xs.length; index += 1) {
        const x = xs[index];
        const isBlocked = blockedAt(x);
        if (isBlocked !== previousBlocked) {
            const boundary = refineBoundary(previousX, x, previousBlocked);
            if (isBlocked) blockedStart = boundary;
            else if (blockedStart !== null) {
                blocked.push({ min: blockedStart, max: boundary });
                blockedStart = null;
            }
        }
        previousX = x;
        previousBlocked = isBlocked;
    }
    if (blockedStart !== null) blocked.push({ min: blockedStart, max: candidateMax });
    return blocked.filter((cut) => cut.max - cut.min > EPSILON);
}

function pointOnNavigationObstacleBoundary(point, obstacle, tolerance = 0.02) {
    const points = Array.isArray(obstacle?.points) ? obstacle.points : [];
    if (points.length < 2) return false;
    for (let index = 0; index < points.length; index += 1) {
        const a = points[index];
        const b = points[(index + 1) % points.length];
        if (groundStridePointSegmentDistance(point, a, b) <= tolerance) return true;
    }
    return false;
}

function pointStrictlyInsideNavigationObstacle(point, obstacle) {
    if (!point || obstacle?.dynamic) return false;
    if (point.x <= obstacle.minX + 0.000001 || point.x >= obstacle.maxX - 0.000001 ||
        point.y <= obstacle.minY + 0.000001 || point.y >= obstacle.maxY - 0.000001) {
        const points = Array.isArray(obstacle?.points) ? obstacle.points : [];
        if (points.length < 3) return false;
    }
    const points = Array.isArray(obstacle?.points) ? obstacle.points : [];
    if (points.length < 3) {
        return point.x > obstacle.minX + 0.02 && point.x < obstacle.maxX - 0.02 &&
            point.y > obstacle.minY + 0.02 && point.y < obstacle.maxY - 0.02;
    }
    if (pointOnNavigationObstacleBoundary(point, obstacle)) return false;
    let inside = false;
    for (let index = 0, previous = points.length - 1; index < points.length; previous = index, index += 1) {
        const a = points[index];
        const b = points[previous];
        const crosses = ((a.y > point.y) !== (b.y > point.y)) &&
            (point.x < (b.x - a.x) * (point.y - a.y) / ((b.y - a.y) || 0.0000001) + a.x);
        if (crosses) inside = !inside;
    }
    return inside;
}

function supportForeignLineIntersectionXs(support, lineA, lineB) {
    const supportA = { x: support.x1, y: support.y1 };
    const supportB = { x: support.x2, y: support.y2 };
    const xs = [];
    const addX = (x) => {
        if (!Number.isFinite(x) || x <= support.xMin + EPSILON || x >= support.xMax - EPSILON) return;
        if (!xs.some((value) => Math.abs(value - x) <= 0.01)) xs.push(x);
    };
    const hit = groundStrideSegmentIntersection(supportA, supportB, lineA, lineB);
    if (hit) {
        addX(hit.x);
        return xs;
    }

    // Parallel lines can still overlap. In that case the overlap endpoints are
    // virtual nodes too; otherwise a coincident foreign surface can disappear
    // into one unsplit authored support and later topology has no place to
    // classify or join it independently.
    const rx = supportB.x - supportA.x;
    const ry = supportB.y - supportA.y;
    const qx = Number(lineA?.x) - supportA.x;
    const qy = Number(lineA?.y) - supportA.y;
    const sx = Number(lineB?.x) - Number(lineA?.x);
    const sy = Number(lineB?.y) - Number(lineA?.y);
    const scale = Math.max(1, Math.hypot(rx, ry), Math.hypot(sx, sy));
    if (Math.abs(groundStrideCross(rx, ry, sx, sy)) > 0.000001 * scale * scale ||
        Math.abs(groundStrideCross(qx, qy, rx, ry)) > 0.000001 * scale * scale) {
        return xs;
    }
    const overlapMin = Math.max(support.xMin, Math.min(Number(lineA?.x), Number(lineB?.x)));
    const overlapMax = Math.min(support.xMax, Math.max(Number(lineA?.x), Number(lineB?.x)));
    if (overlapMax >= overlapMin - 0.01) {
        addX(overlapMin);
        addX(overlapMax);
    }
    return xs;
}

function supportForeignObstacleIntersectionXs(support, obstacle) {
    const points = Array.isArray(obstacle?.points) ? obstacle.points : [];
    if (points.length < 2 || obstacle?.dynamic) return [];
    const xs = [];
    for (let index = 0; index < points.length; index += 1) {
        for (const x of supportForeignLineIntersectionXs(support, points[index], points[(index + 1) % points.length])) {
            if (!xs.some((value) => Math.abs(value - x) <= 0.01)) xs.push(x);
        }
    }
    return xs;
}

function navigationSplitSegments(world) {
    const allowedKinds = new Set(["walkable", "blockable", "damaging", "killable", "water"]);
    return (world?.segments || []).filter((segment) => (
        !segment?.movingPlatformId &&
        allowedKinds.has(String(segment?.kind || "")) &&
        Number.isFinite(Number(segment?.x1)) && Number.isFinite(Number(segment?.y1)) &&
        Number.isFinite(Number(segment?.x2)) && Number.isFinite(Number(segment?.y2))
    ));
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

function supportBodyBlockingSegmentCut(support, segment, bodyHeight, sideClearance, automaticStepHeight) {
    if (!segment || String(segment.kind || "") === "walkable") return null;
    const x1 = finite(segment.x1, NaN);
    const y1 = finite(segment.y1, NaN);
    const x2 = finite(segment.x2, NaN);
    const y2 = finite(segment.y2, NaN);
    if (![x1, y1, x2, y2].every(Number.isFinite)) return null;
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    if (maxX < support.xMin - EPSILON || minX > support.xMax + EPSILON) return null;
    const headTolerance = 0.5;
    const lowerRelativeY = -bodyHeight + headTolerance;
    const upperRelativeY = -headTolerance;
    const dx = x2 - x1;

    // A vertical wall has no single y(x). Test its span against the actor body
    // slab at the crossing X and reserve half a body-width of approach space.
    if (Math.abs(dx) <= EPSILON) {
        const x = x1;
        if (x < support.xMin - EPSILON || x > support.xMax + EPSILON) return null;
        const groundY = supportYAt(support, clamp(x, support.xMin, support.xMax));
        const segmentMinY = Math.min(y1, y2);
        const segmentMaxY = Math.max(y1, y2);

        // A short upward face is still a real body-clearance boundary: actor
        // centers must remain half a body-width away from it. What makes it
        // different from a wall is that the physical face can be crossed by the
        // circle-arc stride solver. Return that physical X as metadata instead
        // of exempting the face and leaving unsafe actor-center coordinates in
        // the candidate support.
        const touchesSurface = Math.abs(y1 - groundY) <= 0.75 || Math.abs(y2 - groundY) <= 0.75;
        const shortUpwardFace = segmentMinY >= groundY - automaticStepHeight - 0.75 &&
            segmentMaxY <= groundY + 0.75;

        const bodyTop = groundY - bodyHeight + headTolerance;
        const bodyBottom = groundY - headTolerance;
        if (segmentMaxY < bodyTop - EPSILON || segmentMinY > bodyBottom + EPSILON) return null;
        return {
            min: x - sideClearance,
            max: x + sideClearance,
            strideBoundaryX: touchesSurface && shortUpwardFace ? x : null
        };
    }

    const overlapMin = Math.max(support.xMin, minX);
    const overlapMax = Math.min(support.xMax, maxX);
    if (overlapMax < overlapMin + EPSILON) return null;
    const segmentYAt = (x) => y1 + (y2 - y1) * clamp((x - x1) / dx, 0, 1);
    const relativeYAt = (x) => segmentYAt(x) - supportYAt(support, x);

    // A genuinely coincident standable line is another representation of the
    // same exposed floor, not a ceiling. Do not carve a body-width trench out
    // of harmless overlapping terrain pieces.
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    if (enemyNavigationStrideEdgeIsStandable(String(segment.kind || ""), a, b)
        && Math.abs(relativeYAt(overlapMin)) <= 0.75
        && Math.abs(relativeYAt(overlapMax)) <= 0.75) {
        return null;
    }

    const splitXs = [overlapMin, overlapMax];
    const d0 = relativeYAt(overlapMin);
    const d1 = relativeYAt(overlapMax);
    for (const threshold of [lowerRelativeY, upperRelativeY]) {
        const denominator = d1 - d0;
        if (Math.abs(denominator) <= 0.0000001) continue;
        const t = (threshold - d0) / denominator;
        if (t > EPSILON && t < 1 - EPSILON) splitXs.push(overlapMin + (overlapMax - overlapMin) * t);
    }
    splitXs.sort((left, right) => left - right);
    let blockedMin = Number.POSITIVE_INFINITY;
    let blockedMax = Number.NEGATIVE_INFINITY;
    for (let index = 0; index + 1 < splitXs.length; index += 1) {
        const min = splitXs[index];
        const max = splitXs[index + 1];
        if (max - min <= EPSILON) continue;
        const relativeY = relativeYAt((min + max) * 0.5);
        if (relativeY < lowerRelativeY - EPSILON || relativeY > upperRelativeY + EPSILON) continue;
        blockedMin = Math.min(blockedMin, min);
        blockedMax = Math.max(blockedMax, max);
    }
    if (!Number.isFinite(blockedMin) || !Number.isFinite(blockedMax)) return null;

    // A shallow blocker edge can be the sloped form of the same short riser
    // handled above for vertical faces. Preserve the physical X where that
    // face enters the standing-body slab so clearance trimming does not erase
    // the foothold that the circle-arc stride solver is allowed to use. Long
    // walls/ceilings deliberately do not get this metadata.
    const relativeMin = Math.min(d0, d1);
    const relativeMax = Math.max(d0, d1);
    const touchesSurface = relativeMin <= 0.75 && relativeMax >= -0.75;
    const shortUpwardFace = relativeMin >= -automaticStepHeight - 0.75;
    let strideBoundaryX = null;
    if (touchesSurface && shortUpwardFace) {
        const candidates = [blockedMin, blockedMax]
            .filter(Number.isFinite)
            .sort((left, right) => Math.abs(relativeYAt(left)) - Math.abs(relativeYAt(right)));
        if (candidates.length) strideBoundaryX = candidates[0];
    }
    return { min: blockedMin - sideClearance, max: blockedMax + sideClearance, strideBoundaryX };
}

function splitSupportAroundObstacles(support, obstacles, splitSegments, options) {
    const bodyHeight = Math.max(24, finite(options.bodyHeight, 120));
    const bodyWidth = Math.max(8, finite(options.bodyWidth, 48));
    const sideClearance = bodyWidth * 0.5 + 1;
    const automaticStepHeight = Math.max(
        Math.max(0, finite(options.maxStepHeight, 24)),
        bodyHeight * 0.20
    );
    const dependencyUnion = (...collections) => [...new Set(collections.flatMap((values) => Array.isArray(values) ? values : []).map((value) => String(value || "")).filter(Boolean))].sort();
    const sourceDependencies = navigationGeometryDependencyIds(support, "support");
    let intervals = [{
        min: support.xMin,
        max: support.xMax,
        geometryDependencyIds: sourceDependencies,
        virtualFragmentIndex: 0,
        strideBoundaryXMin: Number.isFinite(support.strideBoundaryXMin) ? support.strideBoundaryXMin : null,
        strideBoundaryXMax: Number.isFinite(support.strideBoundaryXMax) ? support.strideBoundaryXMax : null
    }];

    // Revision 527: geometry proposes candidate ground. First split each authored
    // standable line at every crossing with foreign static blocker boundaries.
    // The resulting virtual fragments retain the source-placement/asset identity
    // plus every blocker that caused a split, so later simulation proofs can be
    // reused only while the geometry they actually depend on is unchanged.
    if (enemyNavigationStepMethod(options) !== "legacy") {
        const splitXs = [support.xMin, support.xMax];
        const splitDependencies = [];
        for (const obstacle of obstacles) {
            if (obstacle.dynamic || obstacle.id === support.sourcePolygonId) continue;
            if (obstacle.maxX < support.xMin - EPSILON || obstacle.minX > support.xMax + EPSILON) continue;
            const intersections = supportForeignObstacleIntersectionXs(support, obstacle);
            if (!intersections.length) continue;
            splitXs.push(...intersections);
            splitDependencies.push(...navigationGeometryDependencyIds(obstacle, "obstacle"));
        }
        for (const segment of splitSegments || []) {
            if (String(segment?.id || "") === String(support.id || "")) continue;
            const intersections = supportForeignLineIntersectionXs(
                support,
                { x: finite(segment?.x1), y: finite(segment?.y1) },
                { x: finite(segment?.x2), y: finite(segment?.y2) }
            );
            if (!intersections.length) continue;
            splitXs.push(...intersections);
            splitDependencies.push(...navigationGeometryDependencyIds(segment, "segment"));
        }
        splitXs.sort((left, right) => left - right);
        const uniqueXs = [];
        for (const x of splitXs) {
            if (!uniqueXs.length || Math.abs(x - uniqueXs[uniqueXs.length - 1]) > 0.01) uniqueXs.push(x);
        }
        intervals = [];
        const baseDependencies = dependencyUnion(sourceDependencies, splitDependencies);
        for (let index = 0; index + 1 < uniqueXs.length; index += 1) {
            const min = uniqueXs[index];
            const max = uniqueXs[index + 1];
            if (max - min < EPSILON) continue;
            const sampleX = (min + max) * 0.5;
            const sample = { x: sampleX, y: supportYAt(support, sampleX) };
            const buried = obstacles.some((obstacle) => (
                !obstacle.dynamic &&
                obstacle.id !== support.sourcePolygonId &&
                sample.x >= obstacle.minX - EPSILON && sample.x <= obstacle.maxX + EPSILON &&
                sample.y >= obstacle.minY - EPSILON && sample.y <= obstacle.maxY + EPSILON &&
                pointStrictlyInsideNavigationObstacle(sample, obstacle)
            ));
            if (!buried) intervals.push({
                min,
                max,
                geometryDependencyIds: baseDependencies,
                virtualFragmentIndex: index,
                strideBoundaryXMin: Math.abs(min - support.xMin) <= 0.01 ? support.strideBoundaryXMin : null,
                strideBoundaryXMax: Math.abs(max - support.xMax) <= 0.01 ? support.strideBoundaryXMax : null
            });
        }
    }

    // Apply actor-body clearance by sweeping the actual standing rectangle along
    // each candidate fragment. The previous midpoint/bounding-box test could cut
    // the full X bounds of a sloped or concave obstacle even when only a small
    // part of it hung into the actor's headroom. This pass subtracts only center-X
    // intervals where the real body rectangle overlaps the real obstacle shape.
    for (const obstacle of obstacles) {
        if (obstacle.id === support.sourcePolygonId) continue;
        const obstacleDependencies = navigationGeometryDependencyIds(obstacle, "obstacle");
        const nextIntervals = [];
        for (const interval of intervals) {
            const cuts = supportBodyBlockedIntervalsByObstacle(
                support, obstacle, interval.min, interval.max, bodyHeight, sideClearance,
                enemyNavigationStepMethod(options) === "stride_arc" ? automaticStepHeight : -1
            );
            if (!cuts.length) {
                nextIntervals.push(interval);
                continue;
            }
            const dependencies = dependencyUnion(interval.geometryDependencyIds, obstacleDependencies);
            let cursor = interval.min;
            let preserveMinBoundary = interval.strideBoundaryXMin;
            for (const cut of cuts) {
                const cutMin = clamp(cut.min, interval.min, interval.max);
                const cutMax = clamp(cut.max, interval.min, interval.max);
                if (cutMin > cursor + ENEMY_NAVIGATION_MIN_SUPPORT_SPAN) {
                    nextIntervals.push({
                        min: cursor,
                        max: cutMin,
                        geometryDependencyIds: dependencies,
                        virtualFragmentIndex: interval.virtualFragmentIndex,
                        strideBoundaryXMin: preserveMinBoundary,
                        strideBoundaryXMax: Math.abs(cutMin - interval.max) <= 0.1 ? interval.strideBoundaryXMax : null
                    });
                }
                cursor = Math.max(cursor, cutMax);
                preserveMinBoundary = Math.abs(cursor - interval.min) <= 0.1 ? interval.strideBoundaryXMin : null;
            }
            if (cursor < interval.max - ENEMY_NAVIGATION_MIN_SUPPORT_SPAN) {
                nextIntervals.push({
                    min: cursor,
                    max: interval.max,
                    geometryDependencyIds: dependencies,
                    virtualFragmentIndex: interval.virtualFragmentIndex,
                    strideBoundaryXMin: Math.abs(cursor - interval.min) <= 0.1 ? interval.strideBoundaryXMin : null,
                    strideBoundaryXMax: interval.strideBoundaryXMax
                });
            }
        }
        intervals = nextIntervals;
        if (!intervals.length) break;
    }

    // Closed polygons are not the only body blockers in authored levels. Open
    // yellow collision lines can be walls or ceilings too. Because the first
    // pass already created virtual nodes at their crossings, this pass only
    // needs to trim actor-width/height clearance around the portions that enter
    // the standing body slab. Green one-way lines are intentionally excluded:
    // they support feet from above but do not block a torso from below.
    for (const segment of splitSegments || []) {
        if (String(segment?.id || "") === String(support.id || "") || String(segment?.kind || "") === "walkable") continue;
        const cut = supportBodyBlockingSegmentCut(support, segment, bodyHeight, sideClearance, automaticStepHeight);
        if (!cut) continue;
        const segmentDependencies = navigationGeometryDependencyIds(segment, "segment");
        const nextIntervals = [];
        for (const interval of intervals) {
            if (cut.max <= interval.min + EPSILON || cut.min >= interval.max - EPSILON) {
                const kept = { ...interval };
                // If the body-clearance pass already trimmed exactly to this
                // short riser, retain the real face as endpoint metadata rather
                // than losing it merely because there is no interval left to cut.
                if (Number.isFinite(cut.strideBoundaryX)) {
                    if (Math.abs(cut.max - interval.min) <= 0.1) kept.strideBoundaryXMin = cut.strideBoundaryX;
                    if (Math.abs(cut.min - interval.max) <= 0.1) kept.strideBoundaryXMax = cut.strideBoundaryX;
                }
                nextIntervals.push(kept);
                continue;
            }
            const dependencies = dependencyUnion(interval.geometryDependencyIds, segmentDependencies);
            if (cut.min > interval.min + ENEMY_NAVIGATION_MIN_SUPPORT_SPAN) {
                nextIntervals.push({
                    min: interval.min,
                    max: Math.min(interval.max, cut.min),
                    geometryDependencyIds: dependencies,
                    virtualFragmentIndex: interval.virtualFragmentIndex,
                    strideBoundaryXMin: interval.strideBoundaryXMin,
                    strideBoundaryXMax: Number.isFinite(cut.strideBoundaryX) ? cut.strideBoundaryX : null
                });
            }
            if (cut.max < interval.max - ENEMY_NAVIGATION_MIN_SUPPORT_SPAN) {
                nextIntervals.push({
                    min: Math.max(interval.min, cut.max),
                    max: interval.max,
                    geometryDependencyIds: dependencies,
                    virtualFragmentIndex: interval.virtualFragmentIndex,
                    strideBoundaryXMin: Number.isFinite(cut.strideBoundaryX) ? cut.strideBoundaryX : null,
                    strideBoundaryXMax: interval.strideBoundaryXMax
                });
            }
        }
        intervals = nextIntervals;
        if (!intervals.length) break;
    }

    intervals = intervals
        .sort((left, right) => left.min - right.min)
        .reduce((merged, interval) => {
            const previous = merged[merged.length - 1];
            if (previous && previous.virtualFragmentIndex === interval.virtualFragmentIndex && interval.min <= previous.max + 0.01) {
                if (interval.max > previous.max + EPSILON) {
                    previous.max = interval.max;
                    previous.strideBoundaryXMax = interval.strideBoundaryXMax;
                }
                previous.geometryDependencyIds = dependencyUnion(previous.geometryDependencyIds, interval.geometryDependencyIds);
            } else {
                merged.push({ ...interval, geometryDependencyIds: dependencyUnion(interval.geometryDependencyIds) });
            }
            return merged;
        }, []);

    if (intervals.length === 1 && Math.abs(intervals[0].min - support.xMin) < EPSILON && Math.abs(intervals[0].max - support.xMax) < EPSILON) {
        return [{
            ...support,
            geometryDependencyIds: intervals[0].geometryDependencyIds,
            strideBoundaryXMin: intervals[0].strideBoundaryXMin,
            strideBoundaryXMax: intervals[0].strideBoundaryXMax
        }];
    }
    return intervals
        .filter((interval) => interval.max - interval.min >= ENEMY_NAVIGATION_MIN_SUPPORT_SPAN)
        .map((interval, index) => normalizedSupport({
            ...support,
            id: `${baseNavigationSupportId(support.id)}_nav_${index + 1}`,
            x1: interval.min,
            y1: supportYAt(support, interval.min),
            x2: interval.max,
            y2: supportYAt(support, interval.max),
            geometryDependencyIds: interval.geometryDependencyIds,
            strideBoundaryXMin: interval.strideBoundaryXMin,
            strideBoundaryXMax: interval.strideBoundaryXMax
        }, index));
}

export function buildEnemyNavigationSupports(world, options = {}) {
    const rawSupports = [];
    const polygonEdges = polygonTopEdgeMetadata(world);
    for (const segment of world?.segments || []) {
        // Ground enemies never treat a moving platform as a route support. The
        // platform may still carry an actor who is already physically standing
        // on it, but pathfinding remains entirely on static authored geometry.
        if (segment.movingPlatformId) {
            continue;
        }
        if (segment.kind !== "walkable" && segment.kind !== "blockable") {
            continue;
        }
        if (Math.abs(finite(segment.x2) - finite(segment.x1)) < ENEMY_NAVIGATION_MIN_SUPPORT_SPAN) {
            continue;
        }
        if (!enemyNavigationStrideEdgeIsStandable(
            segment.kind,
            { x: finite(segment.x1), y: finite(segment.y1) },
            { x: finite(segment.x2), y: finite(segment.y2) })) {
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
            obstacleXMax: polygonEdge?.obstacleXMax,
            geometryDependencyIds: navigationGeometryDependencyIds(segment, "segment")
        }, rawSupports.length));
    }
    for (const solid of world?.solids || []) {
        if (solid.kind === "wall") {
            continue;
        }
        const width = Math.max(0, finite(solid.w));
        if (width < ENEMY_NAVIGATION_MIN_SUPPORT_SPAN) {
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
            obstacleXMax: finite(solid.x) + width,
            geometryDependencyIds: navigationGeometryDependencyIds(solid, "solid")
        }, rawSupports.length));
    }

    const obstacles = navigationBlockingObstacles(world);
    const splitSegments = navigationSplitSegments(world);
    return rawSupports.flatMap((support) => splitSupportAroundObstacles(support, obstacles, splitSegments, options));
}

export function findEnemyNavigationSupport(supports, x, y, options = {}) {
    const maxRise = Math.max(0, finite(options.maxRise, 30));
    const maxDrop = Math.max(0, finite(options.maxDrop, 80));
    const sampleHalfWidthFactor = clamp(finite(options.sampleHalfWidthFactor, 0.22), 0, 0.5);
    const halfWidth = Math.max(0, finite(options.width, 1)) * sampleHalfWidthFactor;
    const samples = [];
    const addSample = (sampleX) => {
        if (!Number.isFinite(sampleX) || samples.some((value) => Math.abs(value - sampleX) <= EPSILON)) return;
        samples.push(sampleX);
    };
    addSample(Number(options.contactX));
    addSample(x);
    addSample(x - halfWidth);
    addSample(x + halfWidth);
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
    const gravity = Math.max(1, finite(options.gravity, 1200));
    const runSpeed = Math.max(1, finite(options.runSpeed, 1));
    const maxFallDistance = Math.max(0, finite(options.maxFallDistance, 240));
    const maxStepHeight = Math.max(0, finite(options.maxStepHeight, 24));

    // Landing only needs a stable foothold, not a full body-width of platform
    // on both sides. Runtime checks centre/side feet and the trajectory sweep
    // below validates the full actor body. Keeping the old half-width inset
    // would erase narrow atomic nodes before physics could decide. Match the
    // stable-majority policy used by downward jumps, and avoid double-insetting
    // a side already trimmed to a short-riser stride boundary.
    const targetSpan = Math.max(0, to.xMax - to.xMin);
    const majorityLandingInset = Math.max(4, Math.min(finite(options.edgeInset, 10), bodyWidth * 0.07 + 1));
    const safeInset = Math.min(majorityLandingInset, targetSpan * 0.45);
    const safeMin = Number.isFinite(to.strideBoundaryXMin) ? to.xMin : to.xMin + safeInset;
    const safeMax = Number.isFinite(to.strideBoundaryXMax) ? to.xMax : to.xMax - safeInset;
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

        // A drop begins at the actual exposed support endpoint. Earlier builds
        // nudged launchX a few pixels back onto the floor and then switched the
        // actor to airborne there, which made the graph's "walk off" manoeuvre
        // slightly synthetic. Run-up now earns the horizontal speed physically,
        // so use the real atomic endpoint as the departure pose as well.
        const launchX = clamp(sourceEdge, from.xMin, from.xMax);
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
    const sourceEdge = targetLeft
        ? (Number.isFinite(from.obstacleXMin) ? from.obstacleXMin : from.xMin)
        : (Number.isFinite(from.obstacleXMax) ? from.obstacleXMax : from.xMax);
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

function atomicSupportStableInset(support, options = {}) {
    const span = Math.max(0, finite(support?.xMax) - finite(support?.xMin));
    if (span <= EPSILON) return 0;
    const bodyWidth = Math.max(8, finite(options.bodyWidth, 48));
    return Math.min(
        Math.max(1, Math.min(finite(options.edgeInset, 10), bodyWidth * 0.07 + 1)),
        span * 0.45
    );
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
    const ratio = ascentTime / flightTime;
    // Atomic supports are already actor-centre-safe. Use the same small stable
    // majority inset as the generic/downward jump families instead of applying
    // the old coarse edgeInset a second time. The trajectory body sweep decides
    // whether the actor actually clears the side wall and fits the landing.
    const sourceInset = atomicSupportStableInset(from, options);
    const targetInset = atomicSupportStableInset(to, options);
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

function atomicSupportSampleXs(support, options = {}) {
    const span = Math.max(0, finite(support?.xMax) - finite(support?.xMin));
    if (span <= EPSILON) return [finite(support?.xMin)];
    // Atomic supports are already actor-centre-safe intervals. Do not throw
    // away another legacy edgeInset at both ends before the ballistic solver
    // gets a vote. Keep only a tiny stability inset, capped for very small
    // fragments, and include the centre as a robust fallback sample.
    const stableInset = atomicSupportStableInset(support, options);
    const values = [
        support.xMin + stableInset,
        (support.xMin + support.xMax) * 0.5,
        support.xMax - stableInset
    ];
    const unique = [];
    for (const value of values) {
        const x = clamp(value, support.xMin, support.xMax);
        if (!unique.some((candidate) => Math.abs(candidate - x) < 0.01)) unique.push(x);
    }
    return unique;
}

function directionalTransitionCandidates(from, to, options = {}) {
    const candidates = [];
    const launchXs = atomicSupportSampleXs(from, options);
    const landingXs = atomicSupportSampleXs(to, options);
    const leftLaunch = launchXs[0];
    const rightLaunch = launchXs[launchXs.length - 1];
    const centerLaunch = launchXs[Math.floor(launchXs.length / 2)];
    const leftLanding = landingXs[0];
    const rightLanding = landingXs[landingXs.length - 1];
    const centerLanding = landingXs[Math.floor(landingXs.length / 2)];

    // Keep the specialised physics-guided families first. The small generic
    // sample set below is deliberately permissive and exists mainly for plain
    // gaps and one-way target lines that do not expose polygon side metadata.
    // Full ballistic body-sweep validation remains authoritative.
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
        addUniqueTransition(candidates, { launchX: rightLaunch, landingX: leftLanding });
        addUniqueTransition(candidates, { launchX: rightLaunch, landingX: centerLanding });
        addUniqueTransition(candidates, { launchX: centerLaunch, landingX: leftLanding });
    } else if (to.xMax <= from.xMin + EPSILON) {
        addUniqueTransition(candidates, { launchX: leftLaunch, landingX: rightLanding });
        addUniqueTransition(candidates, { launchX: leftLaunch, landingX: centerLanding });
        addUniqueTransition(candidates, { launchX: centerLaunch, landingX: rightLanding });
    } else {
        const overlapMin = Math.max(from.xMin, to.xMin);
        const overlapMax = Math.min(from.xMax, to.xMax);
        if (overlapMax >= overlapMin - EPSILON) {
            const overlapSpan = Math.max(0, overlapMax - overlapMin);
            const overlapSamples = overlapSpan <= EPSILON
                ? [(overlapMin + overlapMax) * 0.5]
                : [
                    overlapMin + overlapSpan * 0.20,
                    (overlapMin + overlapMax) * 0.5,
                    overlapMax - overlapSpan * 0.20
                ];
            for (const x of overlapSamples) {
                addUniqueTransition(candidates, {
                    launchX: clamp(x, from.xMin, from.xMax),
                    landingX: clamp(x, to.xMin, to.xMax)
                });
            }
        }
    }

    return candidates;
}

function solveDropTransitionCandidate(from, to, points, options) {
    // Every ballistic drop is a physical ledge exit. Atomic support fragments
    // may come from blockable tops, one-way walkable lines, or clearance cuts,
    // but none of those may launch a fall through the middle of their support.
    // Generic transition samples remain useful for jumps; drops are generated
    // only by physicsGuidedDropCandidates(), which marks exposed-edge exits.
    if (points.walkOff !== true) {
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
        cost: ballisticTrajectoryDistance(requiredVx, 0, gravity, flightTime)
    };
}

function navigationSupportsFormDirectWalkingContinuation(left, right) {
    if (!left || !right) return false;
    // Match the wizard's runtime support-continuation rule: adjacent authored
    // line segments from the same collision family are one physical surface,
    // even when the local tangent changes by more than the generic seam angle.
    // This is what lets a curved mushroom cap remain walkable both ways rather
    // than turning each authored polyline vertex into a one-way stride.
    if (navigationSupportFamilyId(left.id) === navigationSupportFamilyId(right.id)) return true;
    const leftDx = finite(left.x2) - finite(left.x1);
    const leftDy = finite(left.y2) - finite(left.y1);
    const rightDx = finite(right.x2) - finite(right.x1);
    const rightDy = finite(right.y2) - finite(right.y1);
    const leftLength = Math.hypot(leftDx, leftDy);
    const rightLength = Math.hypot(rightDx, rightDy);
    if (leftLength <= EPSILON || rightLength <= EPSILON) return false;
    const tangentDot = Math.abs((leftDx * rightDx + leftDy * rightDy) / (leftLength * rightLength));
    return tangentDot >= ENEMY_NAVIGATION_DIRECT_SEAM_MIN_TANGENT_DOT;
}

function runUpChainSupportAtX(chain, x) {
    const candidates = (chain || []).filter((support) =>
        support && x >= support.xMin - ENEMY_NAVIGATION_DIRECT_SEAM_MAX_DISTANCE &&
        x <= support.xMax + ENEMY_NAVIGATION_DIRECT_SEAM_MAX_DISTANCE);
    if (!candidates.length) return null;
    candidates.sort((left, right) => {
        const leftDistance = x < left.xMin ? left.xMin - x : (x > left.xMax ? x - left.xMax : 0);
        const rightDistance = x < right.xMin ? right.xMin - x : (x > right.xMax ? x - right.xMax : 0);
        return leftDistance - rightDistance || left.xMin - right.xMin;
    });
    return candidates[0];
}


function groundedRunUpX(chain, desiredX, direction) {
    const supports = (chain || []).filter(Boolean);
    if (!supports.length) return desiredX;
    const containing = supports.filter((support) => desiredX >= support.xMin - EPSILON && desiredX <= support.xMax + EPSILON);
    if (containing.length) return clamp(desiredX, containing[0].xMin, containing[0].xMax);

    const runDirection = direction < 0 ? -1 : 1;
    const candidates = supports.map((support) => ({
        x: clamp(desiredX, support.xMin, support.xMax),
        support
    }));
    const fartherBack = candidates.filter((candidate) => runDirection > 0
        ? candidate.x <= desiredX + EPSILON
        : candidate.x >= desiredX - EPSILON);
    const pool = fartherBack.length ? fartherBack : candidates;
    pool.sort((left, right) => {
        const distanceDelta = Math.abs(left.x - desiredX) - Math.abs(right.x - desiredX);
        if (Math.abs(distanceDelta) > EPSILON) return distanceDelta;
        return runDirection > 0 ? left.x - right.x : right.x - left.x;
    });
    return pool[0].x;
}

function runUpChainYAt(chain, x, fallback) {
    const support = runUpChainSupportAtX(chain, x) || fallback;
    return support ? supportYUnclamped(support, clamp(x, support.xMin, support.xMax)) : 0;
}

function contiguousRunUpSupportChain(from, supports = [], direction = 1) {
    const chain = [from];
    const supportList = supports || [];
    const runDirection = direction < 0 ? -1 : 1;
    let cursor = from;
    const visited = new Set([from.id]);

    // Run-up extends opposite the eventual jump direction. Prefer an adjacent
    // sibling of the same authored support at an intersection; otherwise cross
    // a foreign authored seam only when ordinary navigation sees one unique
    // forward continuation. This preserves real polyline/floor continuity but
    // refuses to choose a branch at X/Y junctions.
    for (let hops = 0; hops < supportList.length; hops += 1) {
        const endpointX = runDirection > 0 ? cursor.xMin : cursor.xMax;
        const endpointY = supportYAt(cursor, endpointX);
        const candidates = supportList.filter((candidate) => {
            if (!candidate || visited.has(candidate.id)) return false;
            const candidateEndpointX = runDirection > 0 ? candidate.xMax : candidate.xMin;
            const candidateEndpointY = supportYAt(candidate, candidateEndpointX);
            if (Math.hypot(candidateEndpointX - endpointX, candidateEndpointY - endpointY) >
                ENEMY_NAVIGATION_DIRECT_SEAM_MAX_DISTANCE + EPSILON) return false;
            const backwardSpan = runDirection > 0
                ? endpointX - candidate.xMin
                : candidate.xMax - endpointX;
            return backwardSpan > 0.05;
        });
        if (!candidates.length) break;

        const sameBase = candidates.filter((candidate) => {
            if (baseNavigationSupportId(candidate.id) !== baseNavigationSupportId(cursor.id)) return false;
            const candidateEndpointX = runDirection > 0 ? candidate.xMax : candidate.xMin;
            const candidateEndpointY = supportYAt(candidate, candidateEndpointX);
            return Math.hypot(candidateEndpointX - endpointX, candidateEndpointY - endpointY) <=
                ENEMY_NAVIGATION_ATOMIC_SPLIT_SEAM_MAX_DISTANCE + EPSILON;
        });
        let predecessor = null;
        if (sameBase.length === 1) {
            predecessor = sameBase[0];
        } else if (sameBase.length > 1) {
            break;
        } else {
            const physicallyUnique = candidates.filter((candidate) =>
                baseNavigationSupportId(candidate.id) !== baseNavigationSupportId(cursor.id) &&
                navigationSupportsFormDirectWalkingContinuation(candidate, cursor) &&
                endpointStrideUniqueSharedEndpointContinuation(
                    candidate, cursor, supportList, runDirection, endpointX, endpointY));
            if (physicallyUnique.length !== 1) break;
            predecessor = physicallyUnique[0];
        }

        visited.add(predecessor.id);
        if (runDirection > 0) chain.unshift(predecessor);
        else chain.push(predecessor);
        cursor = predecessor;
    }
    return chain;
}

function runUpCorridorClear(chain, runUpX, launchX, options = {}, fallbackSupport = null) {
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
    const sampleCount = Math.max(2, Math.ceil(distance / Math.max(4, bodyWidth * 0.12)));
    for (let index = 0; index <= sampleCount; index += 1) {
        const ratio = index / sampleCount;
        const x = runUpX + (launchX - runUpX) * ratio;
        const support = runUpChainSupportAtX(chain, x) || fallbackSupport;
        if (!support) return false;
        for (const obstacle of obstacles) {
            if (obstacle.dynamic || obstacle.id === support.sourcePolygonId) continue;
            if (navigationObstacleOverlapsStandingBodyAtX(support, obstacle, x, bodyHeight, halfWidth)) {
                return false;
            }
        }
    }
    return true;
}

function jumpRunUpDistanceForSpeed(requiredSpeed, acceleration) {
    const target = Math.max(0, finite(requiredSpeed, 0));
    const accel = Math.max(1, finite(acceleration, 950));
    if (target <= EPSILON) return 0;
    const fixedStep = 1 / 60;
    let speed = 0;
    let distance = 0;
    for (let guard = 0; guard < 4096 && speed < target - EPSILON; guard += 1) {
        speed = Math.min(target, speed + accel * fixedStep);
        distance += speed * fixedStep;
    }
    return distance;
}

function attachBallisticRunUp(edge, from, options = {}) {
    if (!edge || (edge.type !== "jump" && edge.type !== "drop") || Math.abs(edge.vx) <= EPSILON) {
        return edge;
    }

    const direction = edge.vx < 0 ? -1 : 1;
    const acceleration = Math.max(1, finite(options.groundAcceleration, 950));
    const requiredSpeed = Math.abs(edge.vx);
    // Match the runtime's fixed-step acceleration exactly. Atomic supports have
    // already been carved to actor-safe centre intervals, so no extra body-width
    // runway or endpoint inset is needed here. The graph asks for precisely the
    // horizontal distance required to earn the validated takeoff speed.
    const minimumDistance = jumpRunUpDistanceForSpeed(requiredSpeed, acceleration);

    const supports = options.navigationSupports || [];
    const runUpChain = contiguousRunUpSupportChain(from, supports, direction);
    const runUpMin = Math.min(...runUpChain.map((support) => support.xMin));
    const runUpMax = Math.max(...runUpChain.map((support) => support.xMax));
    const availableDistance = direction > 0
        ? edge.launchX - runUpMin
        : runUpMax - edge.launchX;
    if (availableDistance + EPSILON < minimumDistance) {
        return null;
    }

    const desiredRunUpDistance = minimumDistance;
    const desiredRunUpX = edge.launchX - direction * desiredRunUpDistance;
    const runUpX = groundedRunUpX(runUpChain, desiredRunUpX, direction);
    const runUpDistance = Math.abs(edge.launchX - runUpX);
    if (runUpDistance + EPSILON < minimumDistance ||
        !runUpCorridorClear(runUpChain, runUpX, edge.launchX, options, from)) {
        return null;
    }

    return {
        ...edge,
        runUpX,
        runUpY: runUpChainYAt(runUpChain, runUpX, from),
        runUpDistance,
        runUpSupportIds: runUpChain.map((support) => support.id),
        requiredLaunchSpeed: requiredSpeed,
        groundAcceleration: acceleration,
        // Route cost is physical travel distance: the proven acceleration
        // corridor plus the airborne trajectory. This keeps shortcut scoring
        // in the same pixel-distance units as ordinary walking.
        cost: edge.cost + runUpDistance
    };
}

function solveJumpTransitionCandidate(from, to, points, options) {
    const launchY = supportYAt(from, points.launchX);
    const landingY = supportYAt(to, points.landingX);
    const deltaY = landingY - launchY;
    // One-way (green) supports use the same ballistic jump rules as every
    // other support. A downward jump may intentionally pass back through its
    // source one-way line; runtime collision already treats that line as
    // one-way during the committed jump. "drop" remains the distinct
    // exposed-endpoint walk-off manoeuvre.
    const rise = Math.max(0, -deltaY);
    const jumpHeight = Math.max(0, finite(options.jumpHeight, 0));
    const gravity = Math.max(1, finite(options.gravity, 1200));
    const runSpeed = Math.max(1, finite(options.runSpeed, 1));
    const maxFallDistance = Math.max(0, finite(options.maxFallDistance, jumpHeight * 2 + 80));
    // A profile with no jump capability must not receive the solver's tiny
    // synthetic non-zero hop. Falling transitions are handled by the drop
    // solver; jump edges require an authored positive jump height.
    if (jumpHeight <= EPSILON) {
        return null;
    }
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
        cost: ballisticTrajectoryDistance(requiredVx, jumpVelocity, gravity, flightTime)
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
        cost: Math.hypot(points.dx, landingY - launchY),
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
    if (kind !== "walkable" && kind !== "blockable" && kind !== "damaging" && kind !== "killable") return false;
    const dx = Number(b.x) - Number(a.x);
    const dy = Number(b.y) - Number(a.y);
    if (Math.abs(dx) <= 0.001) return false;
    const slopeRatio = kind === "walkable"
        ? ENEMY_NAVIGATION_MAX_WALKABLE_SLOPE_RATIO
        : ENEMY_NAVIGATION_STANDABLE_SLOPE_RATIO;
    return Math.abs(dy) <= Math.abs(dx) * slopeRatio;
}

function enemyNavigationStrideCandidateEdges(world = {}, navigationSupports = []) {
    const edges = [];
    const seen = new Set();
    const add = (support, a, b, standable, blocksBody, edgeKey = "") => {
        if (![a.x, a.y, b.x, b.y].every(Number.isFinite)) return;
        if (Math.hypot(b.x - a.x, b.y - a.y) <= 0.000001) return;
        const key = `${support.source}|${support.id}|${edgeKey}|${a.x.toFixed(6)}|${a.y.toFixed(6)}|${b.x.toFixed(6)}|${b.y.toFixed(6)}|${standable ? 1 : 0}`;
        if (seen.has(key)) return;
        seen.add(key);
        edges.push({ key, support, a, b, standable, blocksBody });
    };

    const exposedSupports = Array.isArray(navigationSupports) ? navigationSupports : [];
    for (const navigationSupport of exposedSupports) {
        const a = { x: finite(navigationSupport.x1), y: finite(navigationSupport.y1) };
        const b = { x: finite(navigationSupport.x2), y: finite(navigationSupport.y2) };
        const support = {
            id: String(navigationSupport.id || "support"),
            kind: String(navigationSupport.kind || "blockable"),
            source: "navigation",
            x1: a.x,
            y1: a.y,
            x2: b.x,
            y2: b.y
        };
        add(support, a, b, true, navigationSupport.kind !== "walkable", "exposed");

        // Clearance trimming moves an actor-centre support endpoint away from a
        // short physical riser. The actor's feet may still use the floor strip
        // between that safe centre boundary and the real yellow face during an
        // automatic stride. Add that strip only to the stride solver; it never
        // becomes ordinary cyan standing space.
        const leftBoundary = Number.isFinite(navigationSupport.strideBoundaryXMin) ? Number(navigationSupport.strideBoundaryXMin) : null;
        if (Number.isFinite(leftBoundary) && leftBoundary < navigationSupport.xMin - 0.01) {
            add(
                support,
                { x: leftBoundary, y: supportYUnclamped(navigationSupport, leftBoundary) },
                { x: navigationSupport.xMin, y: supportYAt(navigationSupport, navigationSupport.xMin) },
                true,
                false,
                "stride_apron_left"
            );
        }
        const rightBoundary = Number.isFinite(navigationSupport.strideBoundaryXMax) ? Number(navigationSupport.strideBoundaryXMax) : null;
        if (Number.isFinite(rightBoundary) && rightBoundary > navigationSupport.xMax + 0.01) {
            add(
                support,
                { x: navigationSupport.xMax, y: supportYAt(navigationSupport, navigationSupport.xMax) },
                { x: rightBoundary, y: supportYUnclamped(navigationSupport, rightBoundary) },
                true,
                false,
                "stride_apron_right"
            );
        }
    }

    // When exposed navigation supports are present, raw authored collision is
    // still useful as transient physical footing during endpoint discovery.
    // It is never promoted to a cyan waypoint here: target resolution must map
    // the contact back onto a persistent exposed support. This lets the stride
    // probe traverse a tiny exposed slope that body-clearance trimming removed
    // as a standalone support.
    const rawEdgesMayBeStandable = true;
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
        add(
            support,
            a,
            b,
            rawEdgesMayBeStandable && enemyNavigationStrideEdgeIsStandable(segment.kind, a, b),
            segment.kind !== "walkable",
            "segment"
        );
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
        add(support, { x: left, y: top }, { x: right, y: top }, rawEdgesMayBeStandable, true, "top");
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
            add(
                support,
                a,
                b,
                rawEdgesMayBeStandable && enemyNavigationStrideEdgeIsStandable(polygon.kind, a, b),
                true,
                `polygon:${index}`
            );
        }
    }

    // Static navigation-only blockers are real topology barriers even though
    // they are not collision solids. Include their rectangle edges in this
    // physical endpoint probe so transient footholds cannot sneak through a
    // permanently closed gate. Dynamic blockers stay runtime-only.
    for (const blocker of world?.navigationBlockers || []) {
        if (blocker?.dynamic !== false) continue;
        const left = finite(blocker.x);
        const top = finite(blocker.y);
        const right = left + Math.max(0, finite(blocker.w));
        const bottom = top + Math.max(0, finite(blocker.h));
        if (right - left <= 0.000001 || bottom - top <= 0.000001) continue;
        const support = {
            id: String(blocker.id || "navigationBlocker"),
            kind: "blockable",
            source: "navigationBlocker",
            x1: left, y1: top, x2: right, y2: top
        };
        add(support, { x: left, y: top }, { x: right, y: top }, false, true, "top");
        add(support, { x: right, y: top }, { x: right, y: bottom }, false, true, "right");
        add(support, { x: right, y: bottom }, { x: left, y: bottom }, false, true, "bottom");
        add(support, { x: left, y: bottom }, { x: left, y: top }, false, true, "left");
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

function navigationSupportFamilyId(id) {
    const value = baseNavigationSupportId(id);
    const match = value.match(/^(.*)_(?:walkable|blockable|damaging|killable)_\d+$/);
    return match ? match[1] : value;
}

function groundStrideFootholdMatchesNavigationSupport(sweepResult, to, bodyWidth) {
    const point = sweepResult?.foothold;
    const targetSupport = sweepResult?.targetSupport;
    if (!point || !targetSupport) return false;
    void bodyWidth;
    // strideBoundaryXMin/Max now records the real physical face whenever a
    // virtual actor-center clearance cut belongs to a short strideable riser.
    // Therefore a foothold must actually belong to that physical interval; the
    // old body-width padding could assign a foothold in a blocked gap to the
    // neighboring node and fabricate a cyan connection.
    const ownershipTolerance = 0.1;
    const physicalMin = Number.isFinite(to.strideBoundaryXMin) ? Math.min(to.xMin, to.strideBoundaryXMin) : to.xMin;
    const physicalMax = Number.isFinite(to.strideBoundaryXMax) ? Math.max(to.xMax, to.strideBoundaryXMax) : to.xMax;
    if (point.x < physicalMin - ownershipTolerance || point.x > physicalMax + ownershipTolerance) return false;
    const supportY = supportYUnclamped(to, point.x);
    if (Math.abs(point.y - supportY) > 0.25) return false;
    if (to.sourcePolygonId && targetSupport.id === to.sourcePolygonId) return true;
    return targetSupport.id === to.id || baseNavigationSupportId(to.id) === targetSupport.id;
}


function resolveGroundStrideEndpointTargetSupport(sweepResult, from, supports, bodyWidth) {
    if (!sweepResult?.foothold || !sweepResult?.targetSupport) return null;
    const targetId = String(sweepResult.targetSupport.id || "");
    const exact = (supports || []).find((support) => String(support.id || "") === targetId && String(support.id || "") !== String(from?.id || ""));
    if (exact && groundStrideFootholdMatchesNavigationSupport(sweepResult, exact, bodyWidth)) return exact;

    const matches = (supports || []).filter((support) => (
        String(support.id || "") !== String(from?.id || "") &&
        groundStrideFootholdMatchesNavigationSupport(sweepResult, support, bodyWidth)
    ));
    if (!matches.length) return null;
    const point = sweepResult.foothold;
    matches.sort((left, right) => {
        const spanDistance = (support) => {
            if (point.x < support.xMin) return support.xMin - point.x;
            if (point.x > support.xMax) return point.x - support.xMax;
            return 0;
        };
        const leftDistance = spanDistance(left);
        const rightDistance = spanDistance(right);
        if (Math.abs(leftDistance - rightDistance) > 0.000001) return leftDistance - rightDistance;
        const leftSpan = Math.max(0, left.xMax - left.xMin);
        const rightSpan = Math.max(0, right.xMax - right.xMin);
        if (Math.abs(leftSpan - rightSpan) > 0.000001) return rightSpan - leftSpan;
        return String(left.id || "").localeCompare(String(right.id || ""));
    });
    return matches[0];
}

function groundStrideEndpointLanding(from, direction, options) {
    if (!from || !options?.world || !direction) return null;
    const supports = Array.isArray(options.navigationSupports) ? options.navigationSupports : [];
    const bodyWidth = Math.max(8, finite(options.bodyWidth, 48));
    const bodyHeight = Math.max(24, finite(options.bodyHeight, 120));
    const maximumReach = Math.max(Math.max(0, finite(options.maxStepHeight, 24)), bodyHeight * 0.20);
    if (maximumReach <= EPSILON) return null;

    const fromEndpointX = direction > 0 ? from.xMax : from.xMin;
    const splitClearance = bodyWidth * 0.5 + 1.05;
    const rawSourceBoundaryX = direction > 0
        ? (Number.isFinite(from.strideBoundaryXMax) ? from.strideBoundaryXMax : (Number.isFinite(from.obstacleXMax) ? from.obstacleXMax : from.xMax))
        : (Number.isFinite(from.strideBoundaryXMin) ? from.strideBoundaryXMin : (Number.isFinite(from.obstacleXMin) ? from.obstacleXMin : from.xMin));
    const sourceExtension = Number.isFinite(rawSourceBoundaryX)
        ? (rawSourceBoundaryX - fromEndpointX) * direction
        : Number.POSITIVE_INFINITY;
    // obstacleXMin/XMax describes the whole authored obstacle and may be far
    // beyond this particular virtual fragment. Only a boundary local to this
    // endpoint is meaningful stride evidence; otherwise use the exposed end.
    const sourceBoundaryX = Number.isFinite(rawSourceBoundaryX) && sourceExtension >= -0.05 && sourceExtension <= splitClearance
        ? rawSourceBoundaryX
        : fromEndpointX;
    const footOrigin = {
        x: sourceBoundaryX,
        y: supportYAt(from, clamp(sourceBoundaryX, from.xMin, from.xMax))
    };

    const halfWidth = bodyWidth * 0.5;
    const contactActorX = footOrigin.x - direction * halfWidth;
    const candidateBounds = {
        minX: contactActorX - halfWidth - maximumReach,
        minY: footOrigin.y - bodyHeight - maximumReach,
        maxX: contactActorX + halfWidth + maximumReach,
        maxY: footOrigin.y + maximumReach
    };
    const allCandidateEdges = Array.isArray(options.strideCandidateEdges)
        ? options.strideCandidateEdges
        : enemyNavigationStrideCandidateEdges(options.world, supports);
    const candidateEdges = allCandidateEdges.filter((edge) => {
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
    const to = resolveGroundStrideEndpointTargetSupport(sweepResult, from, supports, bodyWidth);
    if (!sweepResult || !to) return null;

    const toEndpointX = direction > 0 ? to.xMin : to.xMax;
    const rawTargetBoundaryX = direction > 0
        ? (Number.isFinite(to.strideBoundaryXMin) ? to.strideBoundaryXMin : (Number.isFinite(to.obstacleXMin) ? to.obstacleXMin : to.xMin))
        : (Number.isFinite(to.strideBoundaryXMax) ? to.strideBoundaryXMax : (Number.isFinite(to.obstacleXMax) ? to.obstacleXMax : to.xMax));
    const targetExtension = Number.isFinite(rawTargetBoundaryX)
        ? (toEndpointX - rawTargetBoundaryX) * direction
        : Number.POSITIVE_INFINITY;
    const targetBoundaryX = Number.isFinite(rawTargetBoundaryX) && targetExtension >= -0.05 && targetExtension <= splitClearance
        ? rawTargetBoundaryX
        : toEndpointX;

    const foothold = sweepResult.foothold;
    // A one-way support does not automatically imply a ballistic drop. If the
    // next exposed foothold is inside the same automatic stride envelope, the
    // ground locomotion can use an ordinary step and the reciprocal proof may
    // keep both pieces in one cyan walk region. Larger ledges never reach this
    // branch and continue through the ordinary drop planner.
    const start = { x: footOrigin.x - direction * halfWidth, y: footOrigin.y };
    const corner = {
        x: (sweepResult.clearancePoint?.x ?? footOrigin.x) - direction * halfWidth,
        y: Math.min(footOrigin.y, foothold.y, sweepResult.clearancePoint?.y ?? footOrigin.y)
    };
    const target = { x: foothold.x - direction * halfWidth, y: foothold.y };
    if ((target.x - start.x) * direction < Math.min(maximumReach, 0.05) - 0.000001) return null;
    if (groundStrideBodyPathBlocked(candidateEdges, { start, corner, target }, bodyWidth, bodyHeight, maximumReach)) return null;
    return {
        kind: "step",
        direction,
        from: from.id,
        to: to.id,
        footOrigin,
        foothold: { ...foothold },
        start,
        corner,
        target,
        sourceBoundaryX,
        targetBoundaryX
    };
}

export function buildEnemyNavigationStrideEndpointLinks(supports, options = {}) {
    const normalizedOptions = { ...normalizeEnemyNavigationProfile(options), ...options };
    normalizedOptions.navigationSupports = supports || [];
    normalizedOptions.strideCandidateEdges = enemyNavigationStrideCandidateEdges(normalizedOptions.world || {}, supports || []);
    const links = [];
    for (const support of supports || []) {
        for (const direction of [-1, 1]) {
            const link = groundStrideEndpointLanding(support, direction, normalizedOptions);
            if (link) links.push(link);
        }
    }
    return links;
}

function strideArcDirectTransition(from, to, options) {
    if (!options.world) return legacyDirectTransition(from, to, options);
    const overlapMin = Math.max(from.xMin, to.xMin);
    const overlapMax = Math.min(from.xMax, to.xMax);
    // Overlap in X is not proof that two surfaces form one floor. Revision 526
    // exposed a case where a lower authored edge continued inside a foreign
    // blockable polygon and the old shortcut manufactured a zero-time vertical
    // step through solid terrain. Only preserve an overlapping direct seam when
    // the exposed surfaces themselves are effectively coincident throughout the
    // overlap. Vertically distinct overlapping surfaces belong to separate walk
    // regions and must use an ordinary ballistic transition if one is possible.
    if (overlapMax - overlapMin > EPSILON) {
        const sampleXs = [overlapMin, (overlapMin + overlapMax) * 0.5, overlapMax];
        const maximumSeparation = Math.max(...sampleXs.map((x) => Math.abs(supportYAt(from, x) - supportYAt(to, x))));
        return maximumSeparation <= 0.75
            ? legacyDirectTransition(from, to, options)
            : null;
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
    // Support extraction reserves half an actor width beside blocking faces.
    // Let the stride solver project the foot origin back to the physical target
    // boundary across that exact clearance, otherwise virtual splitting can
    // manufacture a gap that is wider than the automatic-step arc itself.
    const splitClearance = bodyWidth * 0.5 + 1.05;
    // The expensive arc sweep can only reach a foothold within maximumReach.
    // A split support may move the foot origin toward the target by at most the
    // splitter's side clearance, so anything farther away cannot possibly be a
    // stride. Reject those pairs before filtering collision edges or sweeping.
    if (rawGap > maximumReach + splitClearance + 0.05) return null;
    // Two support fragments that meet at the same physical endpoint are a
    // continuous seam, not a step discontinuity. Keep the old direct seam so
    // the arc solver does not turn harmless polyline joints into tiny jumps.
    if (rawGap <= 0.05 && Math.abs(toEndpointY - fromEndpointY) <= 0.05 &&
        baseNavigationSupportId(from.id) === baseNavigationSupportId(to.id)) {
        return legacyDirectTransition(from, to, options);
    }
    const targetBoundaryX = direction > 0
        ? (Number.isFinite(to.strideBoundaryXMin) ? to.strideBoundaryXMin : (Number.isFinite(to.obstacleXMin) ? to.obstacleXMin : to.xMin))
        : (Number.isFinite(to.strideBoundaryXMax) ? to.strideBoundaryXMax : (Number.isFinite(to.obstacleXMax) ? to.obstacleXMax : to.xMax));
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
        : enemyNavigationStrideCandidateEdges(options.world, options.navigationSupports || [])).filter((edge) => {
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
        cost: Math.hypot(corner.x - start.x, corner.y - start.y) + Math.hypot(target.x - corner.x, target.y - corner.y),
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

export function enemyNavigationWalkOffEndpointExposed(sourceSupport, direction, supports = [], options = {}) {
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
    const bodyWidth = Math.max(8, finite(options.bodyWidth, 48));
    const sideFootOffset = bodyWidth * 0.42;
    const gravity = Math.max(1, finite(options.gravity, 1200));
    const launchX = Number.isFinite(Number(options.launchX)) ? Number(options.launchX) : sourceEdgeX;
    const launchY = Number.isFinite(Number(options.launchY)) ? Number(options.launchY) : sourceEdgeY;
    const vx = Number.isFinite(Number(options.vx)) ? Number(options.vx) : direction * Math.max(1, finite(options.runSpeed, 120));
    const vy = Number.isFinite(Number(options.vy)) ? Number(options.vy) : 0;
    const intendedSupportId = String(options.intendedSupportId || "");

    const neighbourDepartureCatchStep = (support) => {
        // Enemy vertical collision samples the centre foot and side feet at
        // +/-0.42 body widths. During a walk-off the source support is ignored
        // briefly, but any neighbouring support remains live. Trial the first
        // few fixed ticks with the same semi-implicit vertical cadence. Return
        // the first interception tick so an intended early landing can end the
        // departure before a lower support that would only be encountered later.
        const fixedStep = 1 / 60;
        let x = launchX;
        let y = launchY;
        let velocityY = vy;
        for (let step = 0; step < 8; step += 1) {
            const previousY = y;
            x += vx * fixedStep;
            velocityY += gravity * fixedStep;
            y += velocityY * fixedStep;
            const footSamples = [x, x - sideFootOffset, x + sideFootOffset];
            for (const sampleX of footSamples) {
                if (sampleX < Number(support.xMin) - EPSILON || sampleX > Number(support.xMax) + EPSILON) {
                    continue;
                }
                const supportY = supportPoint(support, sampleX, 0).y;
                const previousDelta = previousY - supportY;
                const nextDelta = y - supportY;
                if (previousDelta <= 0.5 && nextDelta >= -3) {
                    return step + 1;
                }
            }
        }
        return null;
    };

    const intendedSupport = supports.find((support) => String(support?.id || "") === intendedSupportId) || null;
    const intendedCatchStep = intendedSupport ? neighbourDepartureCatchStep(intendedSupport) : null;

    for (const support of supports) {
        if (!support || support.id === sourceSupport.id) {
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
        if (!extendsPastEdge) {
            continue;
        }
        const reachesSeam = xMin <= sourceEdgeX + seamXTolerance && xMax >= sourceEdgeX - seamXTolerance;
        if (reachesSeam) {
            const continuationPoint = supportPoint(support, sourceEdgeX, 0);
            if (Math.abs(continuationPoint.x - sourceEdgeX) <= seamXTolerance &&
                Math.abs(continuationPoint.y - sourceEdgeY) <= seamYTolerance) {
                return false;
            }
        }
        if (support.id !== intendedSupportId) {
            const catchStep = neighbourDepartureCatchStep(support);
            if (catchStep !== null && (intendedCatchStep === null || catchStep < intendedCatchStep)) {
                return false;
            }
        }
    }
    return true;
}

export function enemyNavigationTraversalAllowedFromSupport(edge, sourceSupport, supports = [], options = {}) {
    if (!enemyNavigationEdgeRuntimeAllowed(edge)) {
        return false;
    }
    if (!edge || !sourceSupport) {
        return true;
    }

    // A drop always means walking physically off an exposed source endpoint.
    // This rule applies equally to one-way lines and blockable/solid tops.
    // Without it, generic pairwise candidates could create a fall from the
    // middle of a blockable floor and rely on trajectory tolerances to rescue
    // an impossible plan.
    if (edge.type === "drop") {
        if (edge.walkOff !== true) return false;
        const vx = Number(edge.vx) || 0;
        const launchX = Number(edge.launchX);
        const landingX = Number(edge.landingX);
        if (Math.abs(vx) <= 0.001 || !Number.isFinite(launchX) || !Number.isFinite(landingX)) {
            return false;
        }
        const direction = vx < 0 ? -1 : 1;
        const sourceEdgeX = direction < 0 ? Number(sourceSupport.xMin) : Number(sourceSupport.xMax);
        const endpointTolerance = 1.0;
        if (!Number.isFinite(sourceEdgeX) || Math.abs(launchX - sourceEdgeX) > endpointTolerance) {
            return false;
        }
        if (!enemyNavigationWalkOffEndpointExposed(sourceSupport, direction, supports, {
            ...options,
            launchX: edge.launchX,
            launchY: edge.launchY,
            vx: edge.vx,
            vy: edge.vy,
            intendedSupportId: edge.to
        })) {
            return false;
        }
        return direction < 0
            ? landingX < launchX - 0.001
            : landingX > launchX + 0.001;
    }

    if (sourceSupport.kind !== "walkable") {
        return true;
    }
    const launchY = Number(edge.launchY);
    const landingY = Number(edge.landingY);
    if (!Number.isFinite(launchY) || !Number.isFinite(landingY) || landingY <= launchY + 0.001) {
        return true;
    }
    // Deliberate jumps from a one-way support remain valid ballistic
    // manoeuvres even when the target is lower. During a committed downward
    // jump the runtime ignores only the source one-way support, allowing the
    // actor to pass back through that green line and land on the intended
    // lower support. This preserves the accepted WIP16 policy; ordinary drop
    // edges remain exposed-endpoint walk-offs.
    if (edge.type === "jump") return true;
    // A short downward ground step may remain ordinary walking when it is
    // inside the same automatic stride envelope. This is important for steep
    // green seams whose two authored lines locally meet. Larger one-way ledges
    // still require a real exposed-edge walk-off drop.
    if (edge.type === "step") {
        const bodyWidth = Math.max(8, finite(options.bodyWidth, 48));
        const automaticStepHeight = Math.max(
            Math.max(0, finite(options.maxStepHeight, 24)),
            Math.max(24, finite(options.bodyHeight, 120)) * 0.20
        );
        const targetSupport = (supports || []).find((support) => support?.id === edge.to);
        if (!targetSupport) return false;
        const overlapMin = Math.max(sourceSupport.xMin, targetSupport.xMin);
        const overlapMax = Math.min(sourceSupport.xMax, targetSupport.xMax);
        if (overlapMax > overlapMin + EPSILON) {
            return supportOverlapMinimumSeparation(sourceSupport, targetSupport, overlapMin, overlapMax).separation
                <= automaticStepHeight + 0.75;
        }
        const sourceCenter = (sourceSupport.xMin + sourceSupport.xMax) * 0.5;
        const targetCenter = (targetSupport.xMin + targetSupport.xMax) * 0.5;
        const direction = targetCenter >= sourceCenter ? 1 : -1;
        const sourceBoundaryX = localStrideBoundaryX(sourceSupport, direction, "from", bodyWidth);
        const targetBoundaryX = localStrideBoundaryX(targetSupport, direction, "to", bodyWidth);
        const horizontalGap = (targetBoundaryX - sourceBoundaryX) * direction;
        const physicalDrop = supportYUnclamped(targetSupport, targetBoundaryX)
            - supportYUnclamped(sourceSupport, sourceBoundaryX);

        // Cyan continuity is bidirectional. For a downward one-way step, ask
        // whether ordinary ground locomotion could climb the same seam in the
        // reverse direction. Runtime's automatic-step probe looks 0.14 body
        // widths ahead and then samples a foot another 0.24 body widths ahead.
        // Sampling the higher support at that same 0.38-width reach avoids an
        // endpoint-only false negative on short upward slopes (the level_003
        // forest-rock seam is 31 px at the endpoint but only ~29 px at the
        // actual forward foot sample for the 99x149 profile).
        const reverseDirection = -direction;
        const reciprocalLowBoundaryX = localStrideBoundaryX(targetSupport, reverseDirection, "from", bodyWidth);
        const reciprocalHighBoundaryX = localStrideBoundaryX(sourceSupport, reverseDirection, "to", bodyWidth);
        const reciprocalHighProbeX = clamp(
            reciprocalHighBoundaryX + reverseDirection * bodyWidth * (0.14 + 0.24),
            sourceSupport.xMin,
            sourceSupport.xMax
        );
        const reciprocalRise = supportYUnclamped(targetSupport, reciprocalLowBoundaryX)
            - supportYUnclamped(sourceSupport, reciprocalHighProbeX);
        return horizontalGap >= -0.05
            && horizontalGap <= automaticStepHeight + 0.05
            && physicalDrop > 0.001
            && reciprocalRise <= automaticStepHeight + 0.75;
    }
    return false;
}

export function filterEnemyNavigationEdgesByTraversalPolicy(edgeMap, supports = [], options = {}) {
    const filtered = new Map();
    const supportById = new Map((supports || []).map((support) => [support.id, support]));
    for (const support of supports || []) {
        filtered.set(support.id, []);
    }
    for (const [supportId, edgeList] of edgeMap?.entries?.() || []) {
        const sourceSupport = supportById.get(supportId);
        filtered.set(supportId, (edgeList || []).filter((edge) =>
            !sourceSupport || enemyNavigationTraversalAllowedFromSupport(edge, sourceSupport, supports, options)));
    }
    return filtered;
}


function endpointStrideEdgeFromLink(link, from, to, options) {
    if (!link || link.kind !== "step" || !from || !to) return null;
    const launchX = Number(link.start?.x);
    const launchY = Number(link.start?.y);
    const landingX = Number(link.target?.x);
    const landingY = Number(link.target?.y);
    if (![launchX, launchY, landingX, landingY].every(Number.isFinite)) return null;
    const cornerX = Number(link.corner?.x);
    const cornerY = Number(link.corner?.y);
    const pathLength = Number.isFinite(cornerX) && Number.isFinite(cornerY)
        ? Math.hypot(cornerX - launchX, cornerY - launchY) + Math.hypot(landingX - cornerX, landingY - cornerY)
        : Math.hypot(landingX - launchX, landingY - launchY);
    return {
        type: "step",
        direction: link.direction < 0 ? "left" : "right",
        from: from.id,
        to: to.id,
        launchX,
        launchY,
        landingX,
        landingY,
        vx: 0,
        vy: 0,
        flightTime: 0,
        fromObstacleId: from.sourcePolygonId,
        toObstacleId: to.sourcePolygonId,
        cost: pathLength,
        blockerIds: []
    };
}

function endpointStrideUniqueSharedEndpointContinuation(from, to, supports, direction, endpointX, endpointY) {
    const candidates = (supports || []).filter((support) => {
        if (!support || support.id === from.id) return false;
        const candidateEndpointX = direction > 0 ? support.xMin : support.xMax;
        const candidateEndpointY = supportYAt(support, candidateEndpointX);
        if (Math.hypot(candidateEndpointX - endpointX, candidateEndpointY - endpointY) >
            ENEMY_NAVIGATION_DIRECT_SEAM_MAX_DISTANCE + EPSILON) return false;
        const forwardSpan = direction > 0
            ? support.xMax - endpointX
            : endpointX - support.xMin;
        return forwardSpan > 0.05;
    });
    return candidates.length === 1 && candidates[0].id === to.id;
}

function endpointStrideCoincidentTransition(from, to, options, supports = []) {
    const overlapMin = Math.max(from.xMin, to.xMin);
    const overlapMax = Math.min(from.xMax, to.xMax);
    if (overlapMax - overlapMin > EPSILON) {
        const sampleXs = [overlapMin, (overlapMin + overlapMax) * 0.5, overlapMax];
        const maximumSeparation = Math.max(...sampleXs.map((x) => Math.abs(supportYAt(from, x) - supportYAt(to, x))));
        return maximumSeparation <= 0.75 ? legacyDirectTransition(from, to, options) : null;
    }
    const fromCenter = (from.xMin + from.xMax) * 0.5;
    const toCenter = (to.xMin + to.xMax) * 0.5;
    const direction = toCenter >= fromCenter ? 1 : -1;
    const fromEndpointX = direction > 0 ? from.xMax : from.xMin;
    const toEndpointX = direction > 0 ? to.xMin : to.xMax;
    const fromEndpointY = supportYAt(from, fromEndpointX);
    const toEndpointY = supportYAt(to, toEndpointX);
    const endpointDistance = Math.hypot(toEndpointX - fromEndpointX, toEndpointY - fromEndpointY);
    const sameBase = baseNavigationSupportId(from.id) === baseNavigationSupportId(to.id);
    if (sameBase) {
        // Same-base fragments may also have been separated by body-clearance
        // carving. Only the essentially exact seam created by intersection
        // splitting is free; never bridge a real blocked gap just because the
        // fragments share their authored source ID.
        if (endpointDistance > ENEMY_NAVIGATION_ATOMIC_SPLIT_SEAM_MAX_DISTANCE + EPSILON) return null;
    } else {
        if (endpointDistance > ENEMY_NAVIGATION_DIRECT_SEAM_MAX_DISTANCE + EPSILON) return null;
        // An essentially exact authored endpoint is local walking topology, not
        // a tangent-identity contract. Preserve it even when the neighboring
        // segments change slope: ordinary locomotion/step clearance is allowed
        // to negotiate that corner. The stricter continuation/uniqueness rule
        // remains for small non-zero seam gaps, where treating unrelated nearby
        // endpoints as one floor would create false topology.
        if (endpointDistance > ENEMY_NAVIGATION_ATOMIC_SPLIT_SEAM_MAX_DISTANCE + EPSILON &&
            (!navigationSupportsFormDirectWalkingContinuation(from, to) ||
             !endpointStrideUniqueSharedEndpointContinuation(
                 from, to, supports, direction, fromEndpointX, fromEndpointY))) return null;
    }
    return legacyDirectTransition(from, to, options);
}


function localStrideBoundaryX(support, direction, side, bodyWidth) {
    const endpointX = side === "from"
        ? (direction > 0 ? support.xMax : support.xMin)
        : (direction > 0 ? support.xMin : support.xMax);
    const rawBoundaryX = side === "from"
        ? (direction > 0
            ? (Number.isFinite(support.strideBoundaryXMax) ? support.strideBoundaryXMax : support.xMax)
            : (Number.isFinite(support.strideBoundaryXMin) ? support.strideBoundaryXMin : support.xMin))
        : (direction > 0
            ? (Number.isFinite(support.strideBoundaryXMin) ? support.strideBoundaryXMin : support.xMin)
            : (Number.isFinite(support.strideBoundaryXMax) ? support.strideBoundaryXMax : support.xMax));
    const splitClearance = bodyWidth * 0.5 + 1.05;
    const extension = side === "from"
        ? (rawBoundaryX - endpointX) * direction
        : (endpointX - rawBoundaryX) * direction;
    return Number.isFinite(rawBoundaryX) && extension >= -0.05 && extension <= splitClearance
        ? rawBoundaryX
        : endpointX;
}

function supportOverlapMinimumSeparation(from, to, overlapMin, overlapMax) {
    const differenceAt = (x) => supportYAt(from, x) - supportYAt(to, x);
    const left = differenceAt(overlapMin);
    const right = differenceAt(overlapMax);
    let x = Math.abs(left) <= Math.abs(right) ? overlapMin : overlapMax;
    let separation = Math.min(Math.abs(left), Math.abs(right));
    if ((left < 0 && right > 0) || (left > 0 && right < 0)) {
        const denominator = right - left;
        if (Math.abs(denominator) > 0.0000001) {
            const t = clamp(-left / denominator, 0, 1);
            x = overlapMin + (overlapMax - overlapMin) * t;
            separation = Math.abs(differenceAt(x));
        }
    }
    return { x, separation };
}



// Endpoint circle geometry remains the precise proposal path. This deliberately
// broader local fallback exists for recall: runtime ground movement can bridge
// tiny authored gaps, locally crossing one-way slopes, and actor-clearance gaps
// between fragments of the same physical floor. Simulation still has veto
// authority, so the fallback must stay local rather than attempt to prove the
// transition geometrically.
function localWalkingTransitionProposal(from, to, options) {
    const fromCenter = (from.xMin + from.xMax) * 0.5;
    const toCenter = (to.xMin + to.xMax) * 0.5;
    const direction = toCenter >= fromCenter ? 1 : -1;
    const bodyWidth = Math.max(8, finite(options.bodyWidth, 48));
    const bodyHeight = Math.max(24, finite(options.bodyHeight, 120));
    const automaticStepHeight = Math.max(Math.max(0, finite(options.maxStepHeight, 24)), bodyHeight * 0.20);
    const overlapMin = Math.max(from.xMin, to.xMin);
    const overlapMax = Math.min(from.xMax, to.xMax);

    let launchX;
    let landingX;
    if (overlapMax >= overlapMin - EPSILON) {
        if (overlapMax < overlapMin + EPSILON) return null;
        const local = supportOverlapMinimumSeparation(from, to, overlapMin, overlapMax);
        const overlapTolerance = from.kind === "walkable" || to.kind === "walkable"
            ? automaticStepHeight + 0.75
            : 0.75;
        if (local.separation > overlapTolerance) return null;
        launchX = clamp(local.x, from.xMin, from.xMax);
        landingX = clamp(local.x, to.xMin, to.xMax);
    } else {
        const fromBoundaryX = localStrideBoundaryX(from, direction, "from", bodyWidth);
        const toBoundaryX = localStrideBoundaryX(to, direction, "to", bodyWidth);
        const horizontalGap = (toBoundaryX - fromBoundaryX) * direction;
        if (horizontalGap < -0.05) return null;
        const fromBoundaryY = supportYUnclamped(from, fromBoundaryX);
        const toBoundaryY = supportYUnclamped(to, toBoundaryX);
        const verticalGap = Math.abs(toBoundaryY - fromBoundaryY);
        const samePhysicalLine = baseNavigationSupportId(from.id) === baseNavigationSupportId(to.id);
        const localGapReach = automaticStepHeight + Math.max(0, finite(options.maxStepGap, 0));
        const ordinaryGap = horizontalGap <= localGapReach + 0.05
            && verticalGap <= (from.kind === "walkable" || to.kind === "walkable"
                ? Math.max(automaticStepHeight, bodyHeight * 0.60)
                : automaticStepHeight + 0.05);
        const samePhysicalGap = samePhysicalLine
            && horizontalGap <= bodyWidth + 6.1
            && verticalGap <= automaticStepHeight + 0.75;
        if (!ordinaryGap && !samePhysicalGap) return null;
        launchX = direction > 0 ? from.xMax : from.xMin;
        landingX = direction > 0 ? to.xMin : to.xMax;
    }

    const launchY = supportYAt(from, launchX);
    const landingY = supportYAt(to, landingX);
    const sweptLeft = Math.min(launchX, landingX) - bodyWidth * 0.5;
    const sweptRight = Math.max(launchX, landingX) + bodyWidth * 0.5;
    const sweptTop = Math.min(launchY, landingY) - bodyHeight + 0.5;
    const sweptBottom = Math.max(launchY, landingY) - 0.5;
    for (const obstacle of options.obstacles || []) {
        if (obstacle?.dynamic || !obstacle?.closedState) continue;
        if (rectangleIntersectsObstacle(sweptLeft, sweptTop, sweptRight, sweptBottom, obstacle)) return null;
    }

    return {
        type: "step",
        direction: direction < 0 ? "left" : "right",
        from: from.id,
        to: to.id,
        launchX,
        launchY,
        landingX,
        landingY,
        vx: 0,
        vy: 0,
        flightTime: 0,
        fromObstacleId: from.sourcePolygonId,
        toObstacleId: to.sourcePolygonId,
        cost: Math.abs(landingX - launchX) + Math.abs(landingY - launchY) * 0.5 + 4,
        blockerIds: []
    };
}

function enemyNavigationIntentionalDropLimit(options = {}) {
    const jumpHeight = Math.max(0, finite(options.jumpHeight, 0));
    // maxFallDistance is the authored navigation contract for deliberate
    // walk-off descents. Do not silently shrink it to jump/step reach: a
    // non-jumping ground enemy can still intentionally walk off a safe ledge.
    return Math.max(0, finite(options.maxFallDistance, jumpHeight));
}

function enemyNavigationBallisticPairInsidePlanningEnvelope(from, to, options = {}) {
    const jumpHeight = Math.max(0, finite(options.jumpHeight, 0));
    const intentionalDrop = enemyNavigationIntentionalDropLimit(options);
    if (jumpHeight <= EPSILON && intentionalDrop <= EPSILON) return false;

    const fromMinY = Math.min(finite(from?.y1), finite(from?.y2));
    const fromMaxY = Math.max(finite(from?.y1), finite(from?.y2));
    const toMinY = Math.min(finite(to?.y1), finite(to?.y2));
    const toMaxY = Math.max(finite(to?.y1), finite(to?.y2));
    const minimumRise = Math.max(0, fromMinY - toMaxY);
    const minimumDrop = Math.max(0, toMinY - fromMaxY);
    if (minimumRise > jumpHeight + EPSILON || minimumDrop > intentionalDrop + EPSILON) return false;

    const horizontalGap = to.xMin > from.xMax
        ? to.xMin - from.xMax
        : from.xMin > to.xMax
            ? from.xMin - to.xMax
            : 0;
    const gravity = Math.max(1, finite(options.gravity, 1200));
    const runSpeed = Math.max(0, finite(options.runSpeed, 0));
    const jumpVelocityMagnitude = jumpHeight > EPSILON
        ? Math.sqrt(2 * gravity * Math.max(1, jumpHeight))
        : 0;
    const maximumFlightTime = jumpVelocityMagnitude > EPSILON
        ? (jumpVelocityMagnitude + Math.sqrt(jumpVelocityMagnitude * jumpVelocityMagnitude + 2 * gravity * intentionalDrop)) / gravity
        : Math.sqrt(2 * intentionalDrop / gravity);
    const maximumHorizontalReach = runSpeed * Math.max(0, maximumFlightTime);
    return horizontalGap <= maximumHorizontalReach + EPSILON;
}

function enemyNavigationBallisticProposalWorthwhile(edge, from, to, supports, edgeMap, options = {}) {
    if (!edge) return false;
    const route = planEnemyNavigationRoute(supports, from.id, to.id, {
        ...options,
        edgeMap,
        // Compare from the actual launch point. runUpX may live on an adjacent
        // support in a proven run-up chain and is therefore not necessarily a
        // legal coordinate on edge.from for the ordinary route planner.
        startX: edge.launchX,
        targetX: edge.landingX
    });
    if (!route) return true;
    // The comparison begins at launchX, while a running jump may first need
    // to move backward to runUpX and then traverse that runway back to launchX.
    // edge.cost already includes the forward runway plus the full parabolic
    // flight distance, so add only the initial backtrack here. A 600 px jump
    // therefore competes as a ~600 px maneuver, never as a zero-cost shortcut.
    const initialRunUpBacktrack = Number.isFinite(Number(edge.runUpX))
        ? Math.abs(Number(edge.runUpX) - finite(edge.launchX))
        : 0;
    const maneuverCost = initialRunUpBacktrack + Math.max(0, finite(edge.cost));
    return route.cost - maneuverCost >= ENEMY_NAVIGATION_SHORTCUT_MIN_SAVING - EPSILON;
}

function enemyNavigationBestValuableBallisticTransition(from, to, supports, edgeMap, options, obstacles) {
    if (!enemyNavigationBallisticPairInsidePlanningEnvelope(from, to, options)) return null;

    const proposals = [];
    for (const candidate of directionalTransitionCandidates(from, to, options)) {
        const solvedDrop = solveDropTransitionCandidate(from, to, candidate, options);
        const drop = attachBallisticRunUp(solvedDrop, from, options);
        if (drop && enemyNavigationTraversalAllowedFromSupport(drop, from, supports, options)) {
            addBestEdge(proposals, drop);
        }
        const solvedJump = solveJumpTransitionCandidate(from, to, candidate, options);
        const jump = attachBallisticRunUp(solvedJump, from, options);
        if (jump && enemyNavigationTraversalAllowedFromSupport(jump, from, supports, options)) {
            addBestEdge(proposals, jump);
        }
    }
    proposals.sort((left, right) => finite(left.cost) - finite(right.cost));

    let checked = 0;
    for (const proposal of proposals) {
        if (checked >= ENEMY_NAVIGATION_BALLISTIC_PROPOSAL_LIMIT) break;
        if (!enemyNavigationBallisticProposalWorthwhile(proposal, from, to, supports, edgeMap, options)) continue;
        checked += 1;
        const validation = transitionTrajectoryClear(proposal, { ...options, obstacles, fromSupport: from, toSupport: to });
        if (!validation.clear) continue;
        return { ...proposal, blockerIds: validation.blockerIds };
    }
    return null;
}

function enemyNavigationStepRouteSupportIds(fromId, toId, edgeMap) {
    if (!fromId || !toId) return null;
    if (fromId === toId) return [fromId];
    const visited = new Set([fromId]);
    const pending = [fromId];
    const parent = new Map();
    while (pending.length) {
        const current = pending.shift();
        for (const edge of edgeMap.get(current) || []) {
            if (edge?.type !== "step" || !enemyNavigationEdgeRuntimeAllowed(edge)) continue;
            const next = String(edge.to || "");
            if (!next || visited.has(next)) continue;
            visited.add(next);
            parent.set(next, current);
            if (next === toId) {
                const route = [toId];
                let cursor = toId;
                while (cursor !== fromId) {
                    cursor = parent.get(cursor);
                    if (!cursor) return null;
                    route.push(cursor);
                }
                route.reverse();
                return route;
            }
            pending.push(next);
        }
    }
    return null;
}

function enemyNavigationStepProposalWorthwhile(edge, from, to, supports, edgeMap, options = {}) {
    if (!edge || !from || !to) return false;
    // Never prune a physically local authored seam merely because another path
    // already reaches the same support. Those local connections define walking
    // topology and are what walk-region collapse is meant to simplify at the
    // planner layer.
    if (enemyNavigationSupportsShareEndpoint(from, to, 0.75)) return true;

    const routeIds = enemyNavigationStepRouteSupportIds(from.id, to.id, edgeMap);
    if (!routeIds) return true;

    // Same-family polyline fragments are already represented faithfully by
    // their adjacent seams, so actor-sized circle probes that skip one or more
    // pieces are visual/graph noise rather than useful alternatives.
    const fromFamily = navigationSupportFamilyId(from.id);
    const toFamily = navigationSupportFamilyId(to.id);
    if (fromFamily === toFamily) return false;

    // A very short foreign support can be real collision geometry without being
    // a useful executable waypoint for an actor whose body is wider than it.
    // Preserve a verified physical stride around such a lip even though the
    // seam topology technically supplies an alternate route. This is the
    // narrow-lip case that motivated endpoint stride discovery in the first
    // place; broad intermediate terrain remains eligible for route pruning.
    const supportById = new Map((supports || []).map((support) => [support.id, support]));
    const bodyWidth = Math.max(8, finite(options.bodyWidth, 48));
    for (const supportId of routeIds.slice(1, -1)) {
        const support = supportById.get(supportId);
        if (!support) continue;
        const family = navigationSupportFamilyId(support.id);
        const span = Math.max(0, finite(support.xMax) - finite(support.xMin));
        if (family !== fromFamily && family !== toFamily && span < bodyWidth * 0.5 - EPSILON) {
            return true;
        }
    }
    return false;
}

function pruneEnemyNavigationRedundantBallistics(supports, edgeMap, options = {}) {
    for (const from of supports || []) {
        const edgeList = edgeMap.get(from.id) || [];
        const candidates = edgeList.filter((edge) => edge.type === "jump" || edge.type === "drop");
        for (const candidate of candidates) {
            const currentIndex = edgeList.indexOf(candidate);
            if (currentIndex < 0) continue;
            edgeList.splice(currentIndex, 1);
            const to = navigationSupportById(supports, candidate.to);
            const stillValuable = to && enemyNavigationBallisticProposalWorthwhile(candidate, from, to, supports, edgeMap, options);
            if (stillValuable) {
                edgeList.splice(Math.min(currentIndex, edgeList.length), 0, candidate);
            }
        }
    }
}

export function buildEnemyNavigationEdgesByEndpointStride(supports, options = {}) {
    const normalizedOptions = { ...normalizeEnemyNavigationProfile(options), ...options };
    const obstacles = Array.isArray(options.obstacles)
        ? options.obstacles
        : navigationBlockingObstacles(options.world || {});
    normalizedOptions.obstacles = obstacles;
    normalizedOptions.navigationSupports = supports || [];
    normalizedOptions.strideCandidateEdges = normalizedOptions.world
        ? enemyNavigationStrideCandidateEdges(normalizedOptions.world, supports || [])
        : [];

    const endpointLinks = normalizedOptions.world
        ? buildEnemyNavigationStrideEndpointLinks(supports || [], normalizedOptions)
        : [];
    const endpointStepByPair = new Map();
    for (const link of endpointLinks) {
        if (link.kind !== "step") continue;
        const key = `${link.from}\u0000${link.to}`;
        if (!endpointStepByPair.has(key)) endpointStepByPair.set(key, link);
    }

    // Phase 1a: build the directed seam graph first. These are the authored or
    // atomically split floor continuations that ordinary walking already owns.
    const walkingEdges = new Map();
    for (const support of supports || []) walkingEdges.set(support.id, []);
    const strideProposals = [];
    for (const from of supports || []) {
        const edgeList = walkingEdges.get(from.id);
        for (const to of supports || []) {
            if (from.id === to.id) continue;
            const seam = endpointStrideCoincidentTransition(from, to, normalizedOptions, supports);
            if (seam) {
                addBestEdge(edgeList, seam);
                continue;
            }
            const link = endpointStepByPair.get(`${from.id}\u0000${to.id}`) || null;
            const step = endpointStrideEdgeFromLink(link, from, to, normalizedOptions)
                || localWalkingTransitionProposal(from, to, normalizedOptions);
            if (step && enemyNavigationTraversalAllowedFromSupport(step, from, supports, normalizedOptions)) {
                strideProposals.push({ from, to, edge: step });
            }
        }
    }
    let edges = filterEnemyNavigationEdgesByTraversalPolicy(walkingEdges, supports, normalizedOptions);

    // Phase 1b: circle-arc strides exist only to add directed walking
    // reachability. Cheapest proposals get first chance to connect otherwise
    // disconnected walking components. If A can already walk/stride to B, an
    // additional direct stride is redundant; shortcut edges belong to the
    // ballistic phase and must satisfy its explicit ~500 px benefit rule.
    strideProposals.sort((left, right) => {
        const costDelta = finite(left.edge?.cost) - finite(right.edge?.cost);
        if (Math.abs(costDelta) > EPSILON) return costDelta;
        const fromDelta = String(left.from?.id || "").localeCompare(String(right.from?.id || ""));
        if (fromDelta) return fromDelta;
        return String(left.to?.id || "").localeCompare(String(right.to?.id || ""));
    });
    for (const proposal of strideProposals) {
        if (!enemyNavigationStepProposalWorthwhile(
            proposal.edge, proposal.from, proposal.to, supports, edges, normalizedOptions
        )) continue;
        addBestEdge(edges.get(proposal.from.id), proposal.edge);
    }
    // Do not run a second destructive stride-pruning pass here. Every skipped
    // proposal was redundant against edges that are guaranteed to remain, so
    // reachability is preserved by construction. Removing accepted bridges
    // later can create mutually-dependent deletions and split walk regions.

    // Phase 2: ballistic edges must earn their place. A pair outside the
    // absolute physical jump/fall envelope is never sampled. For a nearby pair,
    // candidate arcs remain private proposals; full-body trajectory validation
    // is only paid for when the current directed graph cannot already reach the
    // destination or the proposed maneuver saves at least ~500 route-cost px.
    // At most one jump/drop representative survives for an ordered node pair.
    for (const from of supports || []) {
        const edgeList = edges.get(from.id);
        for (const to of supports || []) {
            if (from.id === to.id) continue;
            const ballistic = enemyNavigationBestValuableBallisticTransition(
                from,
                to,
                supports,
                edges,
                normalizedOptions,
                obstacles
            );
            if (ballistic) edgeList.push(ballistic);
        }
    }

    // Addition order should not fossilize an early bridge after a later bridge
    // makes it redundant. Re-test every retained ballistic edge against the
    // finished graph with that edge temporarily removed.
    pruneEnemyNavigationRedundantBallistics(supports, edges, normalizedOptions);
    return filterEnemyNavigationEdgesByTraversalPolicy(edges, supports, normalizedOptions);
}

export function buildEnemyNavigationEdges(supports, options = {}) {
    const normalizedOptions = { ...normalizeEnemyNavigationProfile(options), ...options };
    if (enemyNavigationStepMethod(normalizedOptions) === "stride_arc" && normalizedOptions.world) {
        return buildEnemyNavigationEdgesByEndpointStride(supports, normalizedOptions);
    }
    const obstacles = Array.isArray(options.obstacles)
        ? options.obstacles
        : navigationBlockingObstacles(options.world || {});
    normalizedOptions.obstacles = obstacles;
    normalizedOptions.navigationSupports = supports || [];
    normalizedOptions.strideCandidateEdges = enemyNavigationStepMethod(normalizedOptions) === "stride_arc" && normalizedOptions.world
        ? enemyNavigationStrideCandidateEdges(normalizedOptions.world, supports || [])
        : [];

    const walkingEdges = new Map();
    for (const support of supports || []) walkingEdges.set(support.id, []);
    for (const from of supports || []) {
        const edgeList = walkingEdges.get(from.id);
        for (const to of supports || []) {
            if (from.id === to.id) continue;
            const direct = directTransition(from, to, normalizedOptions);
            if (direct) addBestEdge(edgeList, direct);
        }
    }
    const edges = filterEnemyNavigationEdgesByTraversalPolicy(walkingEdges, supports, normalizedOptions);
    for (const from of supports || []) {
        const edgeList = edges.get(from.id);
        for (const to of supports || []) {
            if (from.id === to.id) continue;
            const ballistic = enemyNavigationBestValuableBallisticTransition(
                from,
                to,
                supports,
                edges,
                normalizedOptions,
                obstacles
            );
            if (ballistic) edgeList.push(ballistic);
        }
    }
    pruneEnemyNavigationRedundantBallistics(supports, edges, normalizedOptions);
    return filterEnemyNavigationEdgesByTraversalPolicy(edges, supports, normalizedOptions);
}

export function enemyNavigationSupportsSignature(supports = []) {
    return (supports || [])
        .map((support) => [
            String(support.id || ""),
            rounded(support.x1),
            rounded(support.y1),
            rounded(support.x2),
            rounded(support.y2),
            support.strideBoundaryXMin !== null && support.strideBoundaryXMin !== undefined && Number.isFinite(Number(support.strideBoundaryXMin)) ? rounded(support.strideBoundaryXMin) : "",
            support.strideBoundaryXMax !== null && support.strideBoundaryXMax !== undefined && Number.isFinite(Number(support.strideBoundaryXMax)) ? rounded(support.strideBoundaryXMax) : "",
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

export function buildEnemyNavigationWalkRegions(supports = [], edgeMap = new Map()) {
    const supportIds = (supports || []).map((support) => String(support.id || ""));
    const supportById = new Map((supports || []).map((support) => [String(support.id || ""), support]));

    // A walk region is a strongly connected component of the directed step
    // graph: every support in the region can be reached from every other by
    // grounded locomotion. Direct reciprocal pairs are not enough once sparse
    // atomic nodes route through intermediate seams/strides.
    const usableStepEdges = [];
    const adjacency = new Map(supportIds.map((id) => [id, []]));
    const reverseAdjacency = new Map(supportIds.map((id) => [id, []]));
    for (const edgeList of edgeMap?.values?.() || []) {
        for (const edge of edgeList || []) {
            if (edge?.type !== "step" || !enemyNavigationEdgeRuntimeAllowed(edge)) continue;
            const from = String(edge.from || "");
            const to = String(edge.to || "");
            if (!adjacency.has(from) || !adjacency.has(to)) continue;
            usableStepEdges.push(edge);
            adjacency.get(from).push(to);
            reverseAdjacency.get(to).push(from);
        }
    }

    const visited = new Set();
    const order = [];
    const visitForward = (id) => {
        if (visited.has(id)) return;
        visited.add(id);
        for (const next of adjacency.get(id) || []) visitForward(next);
        order.push(id);
    };
    for (const id of supportIds) visitForward(id);

    visited.clear();
    const components = [];
    const visitReverse = (id, component) => {
        if (visited.has(id)) return;
        visited.add(id);
        component.push(id);
        for (const next of reverseAdjacency.get(id) || []) visitReverse(next, component);
    };
    for (let index = order.length - 1; index >= 0; index -= 1) {
        const id = order[index];
        if (visited.has(id)) continue;
        const component = [];
        visitReverse(id, component);
        component.sort();
        components.push(component);
    }

    const orderedGroups = components.sort((left, right) =>
        String(left[0] || "").localeCompare(String(right[0] || "")));
    const regionBySupportId = new Map();
    const walkRegions = orderedGroups.map((supportIdsInRegion, index) => {
        const id = `walk_region_${String(index + 1).padStart(3, "0")}`;
        const supportSet = new Set(supportIdsInRegion);
        for (const supportId of supportIdsInRegion) regionBySupportId.set(supportId, id);
        const internalSteps = usableStepEdges.filter((edge) => supportSet.has(String(edge.from || "")) && supportSet.has(String(edge.to || "")));
        const verification = internalSteps.some((edge) => enemyNavigationEdgeVerification(edge) === ENEMY_NAVIGATION_VERIFICATION_UNVERIFIED)
            ? ENEMY_NAVIGATION_VERIFICATION_UNVERIFIED
            : ENEMY_NAVIGATION_VERIFICATION_VERIFIED;
        const geometryDependencyIds = [...new Set([
            ...supportIdsInRegion.flatMap((supportId) => supportById.get(supportId)?.geometryDependencyIds || []),
            ...internalSteps.flatMap((edge) => edge?.geometryDependencyIds || [])
        ].map((value) => String(value || "")).filter(Boolean))].sort();
        return {
            id,
            supportIds: [...supportIdsInRegion],
            geometryDependencyIds,
            verification
        };
    });
    const annotatedSupports = (supports || []).map((support) => ({
        ...support,
        walkRegionId: regionBySupportId.get(String(support.id || "")) || null
    }));
    return { supports: annotatedSupports, walkRegions };
}

export function rebuildEnemyNavigationWalkRegions(graph = {}) {
    const supports = Array.isArray(graph?.supports) ? graph.supports : [];
    const edgeMap = enemyNavigationEdgeMapFromFlat(graph?.edges || [], supports);
    const build = buildEnemyNavigationWalkRegions(supports, edgeMap);
    return { ...graph, supports: build.supports, walkRegions: build.walkRegions };
}

export function bakeEnemyNavigationGraph(world, rawProfile = {}, metadata = {}) {
    const stepTransitionMethod = enemyNavigationStepMethod({
        stepTransitionMethod: metadata.stepTransitionMethod ?? rawProfile.stepTransitionMethod
    });
    const profile = { ...normalizeEnemyNavigationProfile(rawProfile), stepTransitionMethod };
    const supports = buildEnemyNavigationSupports(world, profile);
    const edgeMap = buildEnemyNavigationEdges(supports, { ...profile, world, stepTransitionMethod });
    const walkRegionBuild = buildEnemyNavigationWalkRegions(supports, edgeMap);
    const advisoryContext = buildEnemyNavigationAdvisoryContext(supports);
    const supportById = new Map(supports.map((support) => [String(support.id || ""), support]));
    const candidateRegionBySupportId = new Map(walkRegionBuild.supports.map((support) => [String(support.id || ""), String(support.walkRegionId || "")]));
    const candidateRegionById = new Map(walkRegionBuild.walkRegions.map((region) => [String(region.id || ""), region]));
    const edges = flattenEnemyNavigationEdges(edgeMap).map((edge, index) => {
        const bakedEdge = {
            id: edge.id || `nav_edge_${index + 1}`,
            ...edge,
            verification: edge.type === "step" || edge.type === "jump" || edge.type === "drop"
                ? ENEMY_NAVIGATION_VERIFICATION_UNVERIFIED
                : undefined,
            verificationFailure: undefined,
            verificationDiagnostics: undefined,
            geometryDependencyIds: [...new Set([
                ...(supportById.get(String(edge.from || ""))?.geometryDependencyIds || []),
                ...(supportById.get(String(edge.to || ""))?.geometryDependencyIds || []),
                ...(Array.isArray(edge.runUpSupportIds)
                    ? edge.runUpSupportIds.flatMap((supportId) =>
                        supportById.get(String(supportId || ""))?.geometryDependencyIds || [])
                    : [])
            ])].sort(),
            candidateWalkRegionId: candidateRegionBySupportId.get(String(edge.from || "")) === candidateRegionBySupportId.get(String(edge.to || ""))
                ? (candidateRegionBySupportId.get(String(edge.from || "")) || undefined)
                : undefined,
            walkRegionDependencyIds: (() => {
                const regionId = candidateRegionBySupportId.get(String(edge.from || ""));
                if (!regionId || regionId !== candidateRegionBySupportId.get(String(edge.to || ""))) return undefined;
                return [...(candidateRegionById.get(regionId)?.geometryDependencyIds || [])];
            })(),
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
        };
        if (edge.type === "jump" || edge.type === "drop") {
            const advisory = enemyNavigationAdvisoryHeuristicAssessment(bakedEdge, supports, profile, advisoryContext);
            bakedEdge.heuristicRejectors = advisory.rejectors;
            bakedEdge.heuristicDiagnostics = advisory.diagnostics;
        }
        return bakedEdge;
    });
    return {
        version: 2,
        id: String(metadata.id || enemyNavigationProfileKey(profile)),
        label: String(metadata.label || `Run ${profile.runSpeed}, jump ${profile.jumpHeight}`),
        profile,
        supports: walkRegionBuild.supports,
        walkRegions: walkRegionBuild.walkRegions,
        supportSignature: enemyNavigationSupportsSignature(supports),
        edges,
        dynamicCostRules: Array.isArray(metadata.dynamicCostRules) ? metadata.dynamicCostRules.map((rule) => ({ ...rule })) : [],
        build: {
            method: ENEMY_NAVIGATION_GRAPH_BUILD_METHOD,
            stepTransitionMethod,
            samplesPerSecond: 60,
            generatedBy: String(metadata.generatedBy || "Ignatius Rocketfrock Level Editor"),
            advisoryHeuristicSchema: ENEMY_NAVIGATION_ADVISORY_HEURISTIC_SCHEMA,
            advisoryHeuristics: [...ENEMY_NAVIGATION_ADVISORY_HEURISTICS]
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

function routePendingLess(left, right) {
    const leftTier = left.usesUnverified ? 1 : 0;
    const rightTier = right.usesUnverified ? 1 : 0;
    if (leftTier !== rightTier) return leftTier < rightTier;
    const leftBallisticTier = left.usesSameWalkRegionBallistic ? 1 : 0;
    const rightBallisticTier = right.usesSameWalkRegionBallistic ? 1 : 0;
    if (leftBallisticTier !== rightBallisticTier) return leftBallisticTier < rightBallisticTier;
    return left.cost < right.cost;
}

function routePendingPush(heap, item) {
    heap.push(item);
    let index = heap.length - 1;
    while (index > 0) {
        const parent = Math.floor((index - 1) / 2);
        if (routePendingLess(heap[parent], item) || (!routePendingLess(item, heap[parent]) && !routePendingLess(heap[parent], item))) {
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
        if (right < heap.length && routePendingLess(heap[right], heap[left])) {
            child = right;
        }
        if (!routePendingLess(heap[child], tail)) {
            break;
        }
        heap[index] = heap[child];
        index = child;
    }
    heap[index] = tail;
    return root;
}

function enemyNavigationEdgeUsesSameWalkRegionBallistic(edge, supportById) {
    if (edge?.type !== "jump" && edge?.type !== "drop") return false;
    const sourceRegionId = String(supportById.get(String(edge.from || ""))?.walkRegionId || "");
    if (!sourceRegionId) return false;
    return sourceRegionId === String(supportById.get(String(edge.to || ""))?.walkRegionId || "");
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
    const supportById = new Map((supports || []).map((support) => [String(support.id || ""), support]));
    const states = [{
        supportId: startSupportId,
        arrivalX: startX,
        cost: 0,
        usesUnverified: false,
        usesSameWalkRegionBallistic: false,
        previousIndex: -1,
        viaEdge: null
    }];
    const stateLookupKey = (arrivalX, usesUnverified, usesSameWalkRegionBallistic) => `${routeStateArrivalMilli(arrivalX)}:${usesUnverified ? 1 : 0}:${usesSameWalkRegionBallistic ? 1 : 0}`;
    const stateIndexBySupportAndArrival = new Map([[startSupportId, new Map([[stateLookupKey(startX, false, false), 0]])]]);
    const stateIndicesBySupport = new Map([[startSupportId, [0]]]);
    const pending = [];
    routePendingPush(pending, { index: 0, cost: 0, usesUnverified: false, usesSameWalkRegionBallistic: false });
    const targetX = Number.isFinite(Number(options.targetX)) ? Number(options.targetX) : null;
    let bestStopCost = Number.POSITIVE_INFINITY;
    let bestStopUsesUnverified = true;
    let bestStopUsesSameWalkRegionBallistic = true;

    while (pending.length) {
        const queued = routePendingPop(pending);
        const current = queued ? states[queued.index] : null;
        if (!current || current.usesUnverified !== queued.usesUnverified
            || current.usesSameWalkRegionBallistic !== queued.usesSameWalkRegionBallistic
            || Math.abs(current.cost - queued.cost) > EPSILON) {
            continue;
        }
        if (Number.isFinite(bestStopCost)) {
            if (!bestStopUsesUnverified && current.usesUnverified) break;
            if (current.usesUnverified === bestStopUsesUnverified) {
                if (!bestStopUsesSameWalkRegionBallistic && current.usesSameWalkRegionBallistic) break;
                if (current.usesSameWalkRegionBallistic === bestStopUsesSameWalkRegionBallistic
                    && current.cost >= bestStopCost - EPSILON) break;
            }
        }
        if (stopSupportId && current.supportId === stopSupportId) {
            const currentSupport = supportById.get(current.supportId);
            const goalCost = current.cost + (targetX === null ? 0 : supportTravelDistance(currentSupport, current.arrivalX, targetX));
            if (!current.usesUnverified || bestStopUsesUnverified) {
                if (current.usesUnverified !== bestStopUsesUnverified) {
                    bestStopUsesUnverified = current.usesUnverified;
                    bestStopUsesSameWalkRegionBallistic = current.usesSameWalkRegionBallistic;
                    bestStopCost = goalCost;
                } else if ((!current.usesSameWalkRegionBallistic && bestStopUsesSameWalkRegionBallistic)
                    || (current.usesSameWalkRegionBallistic === bestStopUsesSameWalkRegionBallistic && goalCost < bestStopCost)) {
                    bestStopUsesSameWalkRegionBallistic = current.usesSameWalkRegionBallistic;
                    bestStopCost = goalCost;
                }
            }
            if (targetX === null) break;
        }

        for (const edge of edgeMap.get(current.supportId) || []) {
            if (!enemyNavigationEdgeRuntimeAllowed(edge)) continue;
            const approachX = Number.isFinite(Number(edge.runUpX)) ? Number(edge.runUpX) : edge.launchX;
            const currentSupport = supportById.get(current.supportId);
            const approachCost = supportTravelDistance(currentSupport, current.arrivalX, approachX);
            const usesUnverified = current.usesUnverified || enemyNavigationEdgeUsesUnverifiedFallback(edge);
            const usesSameWalkRegionBallistic = current.usesSameWalkRegionBallistic
                || enemyNavigationEdgeUsesSameWalkRegionBallistic(edge, supportById);
            const nextCost = current.cost + approachCost + Math.max(0, finite(edge.cost));
            const nextLookupKey = stateLookupKey(edge.landingX, usesUnverified, usesSameWalkRegionBallistic);
            const stateIndicesByArrival = stateIndexBySupportAndArrival.get(edge.to);
            const knownIndex = stateIndicesByArrival?.get(nextLookupKey);
            if (knownIndex !== undefined && nextCost + EPSILON >= states[knownIndex].cost) {
                continue;
            }
            if (knownIndex !== undefined) {
                states[knownIndex] = {
                    supportId: edge.to,
                    arrivalX: edge.landingX,
                    cost: nextCost,
                    usesUnverified,
                    usesSameWalkRegionBallistic,
                    previousIndex: queued.index,
                    viaEdge: edge
                };
                routePendingPush(pending, { index: knownIndex, cost: nextCost, usesUnverified, usesSameWalkRegionBallistic });
                continue;
            }
            const nextIndex = states.length;
            states.push({
                supportId: edge.to,
                arrivalX: edge.landingX,
                cost: nextCost,
                usesUnverified,
                usesSameWalkRegionBallistic,
                previousIndex: queued.index,
                viaEdge: edge
            });
            if (stateIndicesByArrival) {
                stateIndicesByArrival.set(nextLookupKey, nextIndex);
            } else {
                stateIndexBySupportAndArrival.set(edge.to, new Map([[nextLookupKey, nextIndex]]));
            }
            if (!stateIndicesBySupport.has(edge.to)) {
                stateIndicesBySupport.set(edge.to, []);
            }
            stateIndicesBySupport.get(edge.to).push(nextIndex);
            routePendingPush(pending, { index: nextIndex, cost: nextCost, usesUnverified, usesSameWalkRegionBallistic });
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
    let bestUsesUnverified = true;
    let bestUsesSameWalkRegionBallistic = true;
    for (const index of targetIndices) {
        const state = search.states[index];
        const support = navigationSupportById(search.supports || [], targetSupportId);
        const cost = state.cost + (resolvedTargetX === null ? 0 : supportTravelDistance(support, state.arrivalX, resolvedTargetX));
        if (bestIndex < 0
            || (bestUsesUnverified && !state.usesUnverified)
            || (state.usesUnverified === bestUsesUnverified
                && bestUsesSameWalkRegionBallistic && !state.usesSameWalkRegionBallistic)
            || (state.usesUnverified === bestUsesUnverified
                && state.usesSameWalkRegionBallistic === bestUsesSameWalkRegionBallistic
                && cost < bestCost)) {
            bestCost = cost;
            bestIndex = index;
            bestUsesUnverified = state.usesUnverified;
            bestUsesSameWalkRegionBallistic = state.usesSameWalkRegionBallistic;
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
        const support = navigationSupportById(supports, startSupportId);
        const startX = Number.isFinite(Number(options.startX))
            ? Number(options.startX)
            : (support ? (support.xMin + support.xMax) * 0.5 : 0);
        const targetX = Number.isFinite(Number(options.targetX)) ? Number(options.targetX) : startX;
        return { edges: [], cost: supportTravelDistance(support, startX, targetX), supportIds: [startSupportId] };
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
