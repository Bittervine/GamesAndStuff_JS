import {
    applyAtlasManifestsToWorld,
    applyEditorLevelToWorld,
    createInitialGameState,
    DEFAULT_TUNING,
    enemyNavigationRunUpFirstStepAdvisory,
    verifyEnemyNavigationGraphBySimulation
} from "../core/simulation.js";
import {
    bakeEnemyNavigationGraph,
    enemyNavigationProfileKey,
    normalizeEnemyNavigationProfile,
    rebuildEnemyNavigationWalkRegions
} from "../core/enemy-navigation.js";

const NAVIGATION_VERIFICATION_INPUT_SCHEMA = 13;
const NAVIGATION_LOCAL_PROOF_CACHE_SCHEMA = 3;
const NAVIGATION_LOCAL_PROOF_CHUNK_SIZE = 512;
const NAVIGATION_LOCAL_PROOF_MARGIN = 32;

function finite(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function cloneData(value) {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
}

function stableJsonValue(value) {
    if (Array.isArray(value)) return value.map(stableJsonValue);
    if (!value || typeof value !== "object") return value;
    const result = {};
    for (const key of Object.keys(value).sort()) result[key] = stableJsonValue(value[key]);
    return result;
}

function stableJson(value) {
    return JSON.stringify(stableJsonValue(value));
}

function fnv1a64(text) {
    let hash = 0xcbf29ce484222325n;
    const prime = 0x100000001b3n;
    for (let i = 0; i < text.length; i += 1) {
        hash ^= BigInt(text.charCodeAt(i));
        hash = BigInt.asUintN(64, hash * prime);
    }
    return hash.toString(16).padStart(16, "0");
}

function navigationWorldFromRuntimeWorld(world = {}) {
    return {
        segments: (world.segments || []).filter((segment) => !segment?.movingPlatformId).map((segment) => ({ ...segment })),
        collisionPolygons: (world.collisionPolygons || []).filter((polygon) => !polygon?.movingPlatformId).map((polygon) => ({
            ...polygon,
            points: (polygon.points || []).map((point) => ({ ...point })),
            lineIds: Array.isArray(polygon.lineIds) ? polygon.lineIds.slice() : []
        })),
        solids: [],
        navigationBlockers: cloneData(world.navigationBlockers || []),
        bounds: cloneData(world.bounds || { x: 0, y: 0, w: 0, h: 0 })
    };
}

function hunterNavigationProfile(enemy) {
    const width = Math.max(8, finite(enemy?.width, 48));
    const height = Math.max(24, finite(enemy?.height, 120));
    return normalizeEnemyNavigationProfile({
        bodyWidth: width,
        bodyHeight: height,
        runSpeed: Math.max(1, finite(enemy?.runSpeed, 160)),
        groundAcceleration: Math.max(1, finite(enemy?.runAcceleration, 950)),
        jumpHeight: Math.max(0, finite(enemy?.jumpHeight, 120)),
        gravity: Math.max(1, finite(enemy?.jumpGravity, 1200)),
        maxFallDistance: Math.max(0, finite(enemy?.maxFallDistance, 320)),
        maxStepHeight: Math.max(0, finite(enemy?.maxStepHeight, 28)),
        maxStepGap: Math.max(10, Math.min(28, width * 0.32 || 18)),
        edgeInset: Math.max(6, width * 0.22 || 10),
        bodyClearance: Math.max(10, width * 0.34 || 12)
    });
}

function wizardNavigationProfile(tuning = DEFAULT_TUNING) {
    const width = Math.max(8, finite(tuning.playerWidth, DEFAULT_TUNING.playerWidth));
    const height = Math.max(24, finite(tuning.playerHeight, DEFAULT_TUNING.playerHeight));
    const gravity = Math.max(1, finite(tuning.gravity, DEFAULT_TUNING.gravity));
    const safeImpactSpeed = Math.max(0, finite(tuning.fallDamageSafeImpactSpeed, DEFAULT_TUNING.fallDamageSafeImpactSpeed));
    return normalizeEnemyNavigationProfile({
        bodyWidth: width,
        bodyHeight: height,
        runSpeed: Math.max(1, finite(tuning.maxRunSpeed, DEFAULT_TUNING.maxRunSpeed)),
        groundAcceleration: Math.max(1, finite(tuning.groundAcceleration, DEFAULT_TUNING.groundAcceleration)),
        jumpHeight: Math.max(0, finite(tuning.ordinaryJumpHeight, DEFAULT_TUNING.ordinaryJumpHeight)),
        gravity,
        maxFallDistance: safeImpactSpeed > 0 ? safeImpactSpeed * safeImpactSpeed / (2 * gravity) : 0,
        maxStepHeight: height * 0.20,
        maxStepGap: Math.max(10, Math.min(28, width * 0.32 || 18)),
        edgeInset: Math.max(6, width * 0.22 || 10),
        bodyClearance: Math.max(10, width * 0.34 || 12)
    });
}

function navigationProfilesForState(state, options = {}) {
    const profiles = new Map();
    if (options.includeWizard !== false) profiles.set("wizard", wizardNavigationProfile(state.tuning || DEFAULT_TUNING));
    for (const enemy of state.enemies || []) {
        if (String(enemy?.strategy || "simple_patrol") !== "hunter") continue;
        const profile = hunterNavigationProfile(enemy);
        profiles.set(enemyNavigationProfileKey(profile), profile);
    }
    return profiles;
}

function normalizeManifestMap(manifestByAtlasId) {
    const entries = manifestByAtlasId instanceof Map
        ? [...manifestByAtlasId.entries()]
        : Object.entries(manifestByAtlasId || {});
    return new Map(entries.map(([atlasId, value]) => [
        atlasId,
        value?.manifest ? value : { manifest: value }
    ]));
}

export function navigationSimulationCandidateCount(profiles = []) {
    return profiles.reduce((sum, graph) => sum + (graph?.edges || []).reduce(
        (edgeSum, edge) => edgeSum + ((edge?.type === "step" || edge?.type === "jump" || edge?.type === "drop") ? 1 : 0),
        0
    ), 0);
}

export function buildCanonicalNavigationWorld(levelDocument, context = {}) {
    const source = levelDocument?.level && typeof levelDocument.level === "object" ? levelDocument.level : levelDocument;
    const state = createInitialGameState({
        tuning: context.tuning || {},
        enemyCatalog: context.enemyCatalog || {}
    });
    if (!applyEditorLevelToWorld(state, levelDocument)) {
        throw new Error("The level could not be applied to the navigation baking world.");
    }
    // Navigation is authored from static terrain only. Entity artwork is dynamic
    // gameplay content and moving-platform collision is deliberately excluded.
    state.world.visuals = (state.world.visuals || []).filter((visual) => !visual?.entityId);
    const manifests = normalizeManifestMap(context.manifestByAtlasId);
    const requiredAtlasIds = new Set((source?.placements || [])
        .filter((placement) => placement?.kind === "atlasAsset" && placement?.collisionFromManifest !== false)
        .map((placement) => String(placement.atlasId || "at_atlas_001")));
    for (const atlasId of requiredAtlasIds) {
        if (!manifests.get(atlasId)?.manifest) {
            throw new Error(`Navigation rebake is missing the manifest for ${atlasId}.`);
        }
    }
    applyAtlasManifestsToWorld(state, manifests);
    return { state, world: navigationWorldFromRuntimeWorld(state.world) };
}

function graphWithoutVerification(value, key = "") {
    if (key === "verification" || key === "verificationFailure" || key === "verificationDiagnostics" || key === "verificationInputHash" || key === "simulationCheck") return undefined;
    if (Array.isArray(value)) return value.map((entry) => graphWithoutVerification(entry));
    if (!value || typeof value !== "object") return value;
    const result = {};
    for (const childKey of Object.keys(value).sort()) {
        const child = graphWithoutVerification(value[childKey], childKey);
        if (child !== undefined) result[childKey] = child;
    }
    return result;
}


function geometryBounds(value) {
    if (!value || typeof value !== "object") return null;
    if (Array.isArray(value.points) && value.points.length) {
        const xs = value.points.map((point) => finite(point?.x, NaN)).filter(Number.isFinite);
        const ys = value.points.map((point) => finite(point?.y, NaN)).filter(Number.isFinite);
        if (!xs.length || !ys.length) return null;
        return { xMin: Math.min(...xs), yMin: Math.min(...ys), xMax: Math.max(...xs), yMax: Math.max(...ys) };
    }
    const x1 = finite(value.x1, NaN);
    const y1 = finite(value.y1, NaN);
    const x2 = finite(value.x2, NaN);
    const y2 = finite(value.y2, NaN);
    if ([x1, y1, x2, y2].every(Number.isFinite)) {
        return { xMin: Math.min(x1, x2), yMin: Math.min(y1, y2), xMax: Math.max(x1, x2), yMax: Math.max(y1, y2) };
    }
    const x = finite(value.x, NaN);
    const y = finite(value.y, NaN);
    const w = finite(value.w, NaN);
    const h = finite(value.h, NaN);
    if ([x, y, w, h].every(Number.isFinite)) {
        return { xMin: Math.min(x, x + w), yMin: Math.min(y, y + h), xMax: Math.max(x, x + w), yMax: Math.max(y, y + h) };
    }
    return null;
}

function navigationCollisionProofRecord(kind, value) {
    if (!value || typeof value !== "object") return null;
    // Keep the complete static collision record. This intentionally errs on the
    // side of invalidating too much if a future collision flag is introduced;
    // it can never let a physics-relevant edit slip through the cache.
    return { kind, value: stableJsonValue(value) };
}

function navigationProofDependencyIds(kind, value = {}) {
    const visualId = String(value?.visualId || value?.sourceVisualId || "").trim();
    const assetId = String(value?.assetId || value?.sourceAssetId || "").trim();
    const atlasId = String(value?.atlasId || value?.sourceAtlasId || "").trim();
    const id = String(value?.id || "").trim();
    if (visualId) return [`visual:${visualId}`];
    if (assetId) return [`asset:${atlasId ? `${atlasId}:` : ""}${assetId}`];
    return id ? [`${kind}:${id}`] : [];
}

function buildNavigationLocalProofIndex(world = {}) {
    const chunkSize = NAVIGATION_LOCAL_PROOF_CHUNK_SIZE;
    const recordsByChunk = new Map();
    const recordsByDependency = new Map();
    const addRecord = (kind, value) => {
        const bounds = geometryBounds(value);
        const record = navigationCollisionProofRecord(kind, value);
        if (!record) return;
        for (const dependencyId of navigationProofDependencyIds(kind, value)) {
            const records = recordsByDependency.get(dependencyId) || [];
            records.push(record);
            recordsByDependency.set(dependencyId, records);
        }
        if (!bounds) return;
        const firstX = Math.floor(bounds.xMin / chunkSize);
        const lastX = Math.floor(bounds.xMax / chunkSize);
        const firstY = Math.floor(bounds.yMin / chunkSize);
        const lastY = Math.floor(bounds.yMax / chunkSize);
        for (let cy = firstY; cy <= lastY; cy += 1) {
            for (let cx = firstX; cx <= lastX; cx += 1) {
                const key = `${cx},${cy}`;
                const list = recordsByChunk.get(key) || [];
                list.push(record);
                recordsByChunk.set(key, list);
            }
        }
    };
    for (const segment of world?.segments || []) addRecord("segment", segment);
    for (const polygon of world?.collisionPolygons || []) addRecord("polygon", polygon);
    for (const solid of world?.solids || []) addRecord("solid", solid);
    for (const blocker of world?.navigationBlockers || []) addRecord("navigationBlocker", blocker);
    const canonicalHashMap = (recordsMap) => new Map([...recordsMap.entries()].map(([key, records]) => {
        const canonical = records.map((record) => stableJson(record)).sort();
        return [key, fnv1a64(JSON.stringify(canonical))];
    }));
    return {
        chunkSize,
        chunkHashes: canonicalHashMap(recordsByChunk),
        dependencyHashes: canonicalHashMap(recordsByDependency)
    };
}

function navigationSimulationInfluenceRegion(edge, profile = {}) {
    const bodyWidth = Math.max(8, finite(profile.bodyWidth, 48));
    const bodyHeight = Math.max(24, finite(profile.bodyHeight, 120));
    const gravity = Math.max(1, finite(profile.gravity, 1200));
    const runSpeed = Math.max(1, finite(profile.runSpeed, 160));
    const flightTime = Math.max(0, finite(edge?.flightTime, 0));
    const launchX = finite(edge?.launchX, 0);
    const launchY = finite(edge?.launchY, 0);
    const landingX = finite(edge?.landingX, launchX);
    const landingY = finite(edge?.landingY, launchY);
    const runUpX = Number.isFinite(Number(edge?.runUpX)) ? Number(edge.runUpX) : launchX;
    const runUpY = Number.isFinite(Number(edge?.runUpY)) ? Number(edge.runUpY) : launchY;
    const diagnostics = edge?.verificationDiagnostics || {};
    const finalX = Number.isFinite(Number(diagnostics.finalX)) ? Number(diagnostics.finalX) : landingX;
    const finalY = Number.isFinite(Number(diagnostics.finalY)) ? Number(diagnostics.finalY) : landingY;
    const simulatedAirTime = Math.max(0, finite(diagnostics.airTicks, 0)) / 60;
    const envelopeTime = Math.max(flightTime, simulatedAirTime);
    let minFeetY = Math.min(runUpY, launchY, landingY, finalY);
    let maxFeetY = Math.max(runUpY, launchY, landingY, finalY);
    if (envelopeTime > 0) {
        const vy = finite(edge?.vy, 0);
        const apexTime = Math.max(0, Math.min(envelopeTime, -vy / gravity));
        const apexY = launchY + vy * apexTime + 0.5 * gravity * apexTime * apexTime;
        minFeetY = Math.min(minFeetY, apexY);
        const endY = launchY + vy * envelopeTime + 0.5 * gravity * envelopeTime * envelopeTime;
        maxFeetY = Math.max(maxFeetY, endY);
    }
    // Runtime penetration recovery is bounded to half the actor diagonal. Include
    // that entire possible displacement so the proof hash remains conservative
    // even for a collision seam or deep body contact during a failed traversal.
    const recoveryMargin = Math.hypot(bodyWidth, bodyHeight) * 0.5 + NAVIGATION_LOCAL_PROOF_MARGIN;
    const horizontalMargin = bodyWidth * 0.5 + recoveryMargin + runSpeed / 30;
    const upperMargin = bodyHeight + recoveryMargin;
    const lowerMargin = recoveryMargin;
    return {
        xMin: Math.min(runUpX, launchX, landingX, finalX) - horizontalMargin,
        xMax: Math.max(runUpX, launchX, landingX, finalX) + horizontalMargin,
        yMin: minFeetY - upperMargin,
        yMax: maxFeetY + lowerMargin
    };
}

function navigationSimulationEdgeIdentity(edge) {
    const value = {
        type: String(edge?.type || ""),
        from: String(edge?.from || ""),
        to: String(edge?.to || ""),
        direction: String(edge?.direction || ""),
        launchX: finite(edge?.launchX),
        launchY: finite(edge?.launchY),
        runUpX: Number.isFinite(Number(edge?.runUpX)) ? Number(edge.runUpX) : null,
        runUpY: Number.isFinite(Number(edge?.runUpY)) ? Number(edge.runUpY) : null,
        runUpDistance: Number.isFinite(Number(edge?.runUpDistance)) ? Number(edge.runUpDistance) : null,
        runUpSupportIds: Array.isArray(edge?.runUpSupportIds) ? edge.runUpSupportIds.map(String) : [],
        requiredLaunchSpeed: Number.isFinite(Number(edge?.requiredLaunchSpeed)) ? Number(edge.requiredLaunchSpeed) : null,
        groundAcceleration: Number.isFinite(Number(edge?.groundAcceleration)) ? Number(edge.groundAcceleration) : null,
        landingX: finite(edge?.landingX),
        landingY: finite(edge?.landingY),
        vx: finite(edge?.vx),
        vy: finite(edge?.vy),
        flightTime: finite(edge?.flightTime),
        walkOff: edge?.walkOff === true
    };
    return fnv1a64(stableJson(value));
}

function navigationSupportProofRecord(support) {
    if (!support || typeof support !== "object") return null;
    // walkRegionId is a presentation/topology label assigned after candidate
    // construction.  Adding an unrelated disconnected region can renumber it
    // without changing this support or anything the traversal simulation can
    // touch.  Keep the rest of the support record conservative, but exclude
    // that volatile label so local proof reuse follows geometry dependencies
    // rather than incidental region numbering.
    const { walkRegionId: _walkRegionId, ...record } = support;
    return record;
}

function navigationSimulationProofHash(world, graph, edge, proofIndex) {
    if (edge?.type !== "step" && edge?.type !== "jump" && edge?.type !== "drop") return "";
    const region = navigationSimulationInfluenceRegion(edge, graph?.profile || {});
    const chunkSize = proofIndex.chunkSize;
    const firstX = Math.floor(region.xMin / chunkSize);
    const lastX = Math.floor(region.xMax / chunkSize);
    const firstY = Math.floor(region.yMin / chunkSize);
    const lastY = Math.floor(region.yMax / chunkSize);
    const chunks = [];
    for (let cy = firstY; cy <= lastY; cy += 1) {
        for (let cx = firstX; cx <= lastX; cx += 1) {
            const key = `${cx},${cy}`;
            chunks.push([key, proofIndex.chunkHashes.get(key) || "empty"]);
        }
    }
    const supportById = new Map((graph?.supports || []).map((support) => [String(support?.id || ""), support]));
    const dependencyIds = [...new Set([
        ...(edge?.geometryDependencyIds || []),
        ...(edge?.walkRegionDependencyIds || []),
        ...(supportById.get(String(edge?.from || ""))?.geometryDependencyIds || []),
        ...(supportById.get(String(edge?.to || ""))?.geometryDependencyIds || []),
        ...(Array.isArray(edge?.runUpSupportIds)
            ? edge.runUpSupportIds.flatMap((supportId) =>
                supportById.get(String(supportId || ""))?.geometryDependencyIds || [])
            : [])
    ].map((value) => String(value || "")).filter(Boolean))].sort();
    const dependencyHashes = dependencyIds.map((id) => [id, proofIndex.dependencyHashes?.get(id) || "missing"]);
    const payload = {
        cacheSchema: NAVIGATION_LOCAL_PROOF_CACHE_SCHEMA,
        simulationSchema: NAVIGATION_VERIFICATION_INPUT_SCHEMA,
        chunkSize,
        region,
        chunks,
        dependencyHashes,
        worldBounds: world?.bounds || null,
        profile: graph?.profile || {},
        stepTransitionMethod: graph?.build?.stepTransitionMethod || "stride_arc",
        edgeIdentity: navigationSimulationEdgeIdentity(edge),
        sourceSupport: navigationSupportProofRecord(supportById.get(String(edge?.from || ""))),
        targetSupport: navigationSupportProofRecord(supportById.get(String(edge?.to || ""))),
        runUpSupports: (Array.isArray(edge?.runUpSupportIds) ? edge.runUpSupportIds : [])
            .map((id) => [String(id || ""), navigationSupportProofRecord(supportById.get(String(id || "")))]),
        diagnosticSupports: [
            String(edge?.verificationDiagnostics?.landedSupportId || ""),
            String(edge?.verificationDiagnostics?.resolvedSupportId || "")
        ].filter(Boolean).map((id) => [id, navigationSupportProofRecord(supportById.get(id))])
    };
    return `navproof-v${NAVIGATION_LOCAL_PROOF_CACHE_SCHEMA}-${fnv1a64(stableJson(payload))}`;
}

function navigationWalkRegionProofHash(graph, region, proofIndex) {
    const dependencyIds = [...new Set((region?.geometryDependencyIds || []).map((value) => String(value || "")).filter(Boolean))].sort();
    const dependencyHashes = dependencyIds.map((id) => [id, proofIndex.dependencyHashes?.get(id) || "missing"]);
    const supportById = new Map((graph?.supports || []).map((support) => [String(support?.id || ""), support]));
    const payload = {
        cacheSchema: NAVIGATION_LOCAL_PROOF_CACHE_SCHEMA,
        simulationSchema: NAVIGATION_VERIFICATION_INPUT_SCHEMA,
        profile: graph?.profile || {},
        stepTransitionMethod: graph?.build?.stepTransitionMethod || "stride_arc",
        supportIds: [...(region?.supportIds || [])].map(String).sort(),
        supports: [...(region?.supportIds || [])].map((id) => navigationSupportProofRecord(supportById.get(String(id || "")))),
        dependencyHashes
    };
    return `navwalkproof-v${NAVIGATION_LOCAL_PROOF_CACHE_SCHEMA}-${fnv1a64(stableJson(payload))}`;
}

export function stampNavigationLocalProofHashes(world, graph, proofIndex = buildNavigationLocalProofIndex(world)) {
    return {
        ...graph,
        walkRegions: (graph?.walkRegions || []).map((region) => ({
            ...region,
            verificationInputHash: navigationWalkRegionProofHash(graph, region, proofIndex)
        })),
        edges: (graph?.edges || []).map((edge) => {
            if (edge?.type !== "step" && edge?.type !== "jump" && edge?.type !== "drop") return edge;
            return { ...edge, verificationInputHash: navigationSimulationProofHash(world, graph, edge, proofIndex) };
        })
    };
}

function reusableVerificationState(edge) {
    const state = String(edge?.verification || "").trim().toLowerCase();
    return state === "verified" || state === "failed" ? state : "";
}

function copyVerificationProof(freshEdge, existingEdge) {
    const verification = reusableVerificationState(existingEdge);
    if (!verification) return freshEdge;
    return {
        ...freshEdge,
        verification,
        verificationFailure: verification === "failed" ? String(existingEdge?.verificationFailure || "simulation_failed") : undefined,
        verificationDiagnostics: verification === "failed" && existingEdge?.verificationDiagnostics
            ? cloneData(existingEdge.verificationDiagnostics)
            : undefined
    };
}

function verificationInputSignature(world, graph) {
    const payload = {
        schema: NAVIGATION_VERIFICATION_INPUT_SCHEMA,
        world,
        profile: graph?.profile || {},
        stepTransitionMethod: graph?.build?.stepTransitionMethod || "stride_arc"
    };
    return `navverify-v${NAVIGATION_VERIFICATION_INPUT_SCHEMA}-${fnv1a64(stableJson(payload))}`;
}

function stampVerificationInputSignature(world, graph) {
    return {
        ...graph,
        build: {
            ...(graph?.build || {}),
            verificationInputSignature: verificationInputSignature(world, graph)
        }
    };
}

function isSimulationSalvageEdge(edge) {
    return String(edge?.simulationSalvage?.kind || "").trim().toLowerCase() === "landed_wrong_support";
}

function preserveMatchingVerification(freshGraph, existingGraph, world, proofIndex = buildNavigationLocalProofIndex(world)) {
    const stampedFreshGraph = stampNavigationLocalProofHashes(world, freshGraph, proofIndex);
    if (!existingGraph) return { graph: stampedFreshGraph, reused: false, reusedEdges: 0, reusedSalvageEdges: 0, localReuseEdges: 0, globalReuseEdges: 0 };

    const oldEdges = Array.isArray(existingGraph.edges) ? existingGraph.edges : [];
    const oldBaseEdges = oldEdges.filter((edge) => !isSimulationSalvageEdge(edge));
    const oldSalvageEdges = oldEdges.filter(isSimulationSalvageEdge);
    const existingBaseGraph = { ...existingGraph, edges: oldBaseEdges };
    const freshSignature = String(stampedFreshGraph?.build?.verificationInputSignature || "");
    const existingSignature = String(existingGraph?.build?.verificationInputSignature || "");
    const exactGraphReuse = Boolean(
        freshSignature
        && freshSignature === existingSignature
        && stableJson(graphWithoutVerification(stampedFreshGraph)) === stableJson(graphWithoutVerification(existingBaseGraph))
    );

    const oldByIdentity = new Map();
    for (const edge of oldBaseEdges) {
        if (edge?.type !== "step" && edge?.type !== "jump" && edge?.type !== "drop") continue;
        const key = navigationSimulationEdgeIdentity(edge);
        const list = oldByIdentity.get(key) || [];
        list.push(edge);
        oldByIdentity.set(key, list);
    }
    const oldBaseById = new Map(oldBaseEdges.map((edge) => [String(edge?.id || ""), edge]));
    const freshSourceForOldId = new Map();
    let reusedEdges = 0;
    let localReuseEdges = 0;
    let globalReuseEdges = 0;
    const edges = (stampedFreshGraph.edges || []).map((edge) => {
        if (edge?.type !== "step" && edge?.type !== "jump" && edge?.type !== "drop") return edge;
        const key = navigationSimulationEdgeIdentity(edge);
        const candidates = oldByIdentity.get(key) || [];
        const previous = candidates.find((candidate) => reusableVerificationState(candidate)) || null;
        if (!previous) return edge;
        const proofEnvelopeEdge = copyVerificationProof(edge, previous);
        const currentProofHash = navigationSimulationProofHash(world, stampedFreshGraph, proofEnvelopeEdge, proofIndex);
        const localReusable = Boolean(
            previous.verificationInputHash
            && String(previous.verificationInputHash) === currentProofHash
        );
        if (!localReusable && !exactGraphReuse) return edge;
        reusedEdges += 1;
        if (localReusable) localReuseEdges += 1;
        else globalReuseEdges += 1;
        const reusedEdge = { ...proofEnvelopeEdge, verificationInputHash: currentProofHash };
        freshSourceForOldId.set(String(previous?.id || ""), reusedEdge);
        return reusedEdge;
    });

    const preservedById = new Map(edges.map((edge) => [String(edge?.id || ""), edge]));
    const preservedSalvageEdges = [];
    const usedIds = new Set(preservedById.keys());
    for (const oldSalvage of oldSalvageEdges) {
        if (reusableVerificationState(oldSalvage) !== "verified") continue;
        const oldSourceId = String(oldSalvage?.simulationSalvage?.sourceEdgeId || "");
        const oldSource = oldBaseById.get(oldSourceId) || null;
        const freshSource = freshSourceForOldId.get(oldSourceId) || (oldSource
            ? edges.find((edge) => navigationSimulationEdgeIdentity(edge) === navigationSimulationEdgeIdentity(oldSource))
            : null);
        if (!freshSource
            || reusableVerificationState(freshSource) !== "failed"
            || String(freshSource.verificationFailure || "").trim().toLowerCase() !== "landed_wrong_support") continue;
        const salvageMetadata = {
            ...(cloneData(oldSalvage.simulationSalvage) || {}),
            sourceEdgeId: String(freshSource.id || oldSourceId)
        };
        const salvageCandidate = { ...cloneData(oldSalvage), simulationSalvage: salvageMetadata };
        const freshHash = navigationSimulationProofHash(world, stampedFreshGraph, salvageCandidate, proofIndex);
        const localReusable = Boolean(
            oldSalvage.verificationInputHash
            && String(oldSalvage.verificationInputHash) === freshHash
        );
        if (!localReusable && !exactGraphReuse) continue;
        let id = String(salvageCandidate.id || "");
        if (!id || usedIds.has(id)) {
            const base = `${String(freshSource.id || "nav_edge")}_simulation_salvage_${String(salvageMetadata.landedSupportId || salvageCandidate.to || "support").replace(/[^A-Za-z0-9_-]+/g, "_")}`;
            id = base;
            let suffix = 2;
            while (usedIds.has(id)) id = `${base}_${suffix++}`;
        }
        usedIds.add(id);
        preservedSalvageEdges.push({
            ...salvageCandidate,
            id,
            verification: "verified",
            verificationFailure: undefined,
            verificationDiagnostics: undefined,
            verificationInputHash: freshHash
        });
    }

    const candidateEdges = navigationSimulationCandidateCount([{ edges }]);
    const build = { ...(stampedFreshGraph.build || {}) };
    if (reusedEdges === candidateEdges && existingGraph?.build?.simulationCheck?.enabled === true) {
        build.simulationCheck = cloneData(existingGraph.build.simulationCheck);
    }
    return {
        reused: reusedEdges > 0 || preservedSalvageEdges.length > 0,
        reusedEdges,
        reusedSalvageEdges: preservedSalvageEdges.length,
        localReuseEdges,
        globalReuseEdges,
        graph: { ...stampedFreshGraph, edges: [...edges, ...preservedSalvageEdges], build }
    };
}

function verificationStateCounts(profiles) {
    let verifiedEdges = 0;
    let failedEdges = 0;
    let unverifiedEdges = 0;
    for (const graph of profiles || []) {
        for (const edge of graph?.edges || []) {
            if (edge?.type !== "step" && edge?.type !== "jump" && edge?.type !== "drop") continue;
            if (isSimulationSalvageEdge(edge)) continue;
            const state = String(edge.verification || "unverified").trim().toLowerCase();
            if (state === "verified") verifiedEdges += 1;
            else if (state === "failed") failedEdges += 1;
            else unverifiedEdges += 1;
        }
    }
    return { verifiedEdges, failedEdges, unverifiedEdges };
}

function graphLabel(id, profile) {
    return id === "wizard"
        ? `Wizard · body ${profile.bodyWidth}×${profile.bodyHeight} · stride ${profile.maxStepHeight}`
        : `Run ${profile.runSpeed}, jump ${profile.jumpHeight}, body ${profile.bodyWidth}×${profile.bodyHeight}`;
}

const RUN_UP_FIRST_STEP_HEURISTIC = "run_up_first_step_blocked";

function annotateRuntimeCheapNavigationAdvisories(world, graph) {
    const supports = graph.supports || [];
    const supportById = new Map(supports.map((support) => [String(support?.id || ""), support]));
    const edges = (graph?.edges || []).map((edge) => {
        if (edge?.type !== "jump" && edge?.type !== "drop") return edge;
        const rejectors = [...(edge.heuristicRejectors || [])];
        const diagnostics = { ...(edge.heuristicDiagnostics || {}) };
        if (edge.type === "jump") {
            // This advisory is intentionally economical. Across the calibrated
            // corpus every immediate runtime run-up failure starts on a
            // blockable support; probing walkable sources bought no catches but
            // consumed nearly half of the run-up bake time. False negatives are
            // acceptable here because production graphs are simulation-verified.
            const sourceSupport = supportById.get(String(edge.from || "")) || null;
            if (sourceSupport?.kind === "blockable") {
                const runUpDiagnostic = enemyNavigationRunUpFirstStepAdvisory(world, edge, supports, graph.profile || {});
                if (runUpDiagnostic) {
                    rejectors.push(RUN_UP_FIRST_STEP_HEURISTIC);
                    diagnostics[RUN_UP_FIRST_STEP_HEURISTIC] = runUpDiagnostic;
                }
            }
        }
        return {
            ...edge,
            heuristicRejectors: [...new Set(rejectors)],
            heuristicDiagnostics: diagnostics
        };
    });
    return {
        ...graph,
        edges,
        build: {
            ...(graph?.build || {}),
            advisoryHeuristics: [...new Set([
                ...(graph?.build?.advisoryHeuristics || []),
                RUN_UP_FIRST_STEP_HEURISTIC
            ])]
        }
    };
}

function bakeProfiles(world, state, options, stepTransitionMethod) {
    const nrOfAltJumps = Math.max(0, Math.floor(Number(options.nrOfAltJumps ?? 6) || 0));
    return [...navigationProfilesForState(state, options).entries()].map(([id, profile]) => {
        const graph = bakeEnemyNavigationGraph(world, profile, {
            id,
            label: graphLabel(id, profile),
            stepTransitionMethod,
            nrOfAltJumps
        });
        return stampVerificationInputSignature(world, annotateRuntimeCheapNavigationAdvisories(world, graph));
    });
}

function semanticEdgeKey(profileId, edge) {
    return `${String(profileId || "")}|${String(edge?.type || "")}|${String(edge?.from || "")}|${String(edge?.to || "")}|${String(edge?.direction || "")}`;
}

function compareGraphMethods(selectedProfiles, alternateProfiles, selectedMethod, alternateMethod) {
    const selectedEdges = selectedProfiles.flatMap((graph) => (graph.edges || []).map((edge) => ({ profileId: graph.id, edge })));
    const alternateEdges = alternateProfiles.flatMap((graph) => (graph.edges || []).map((edge) => ({ profileId: graph.id, edge })));
    const selectedKeys = new Set(selectedEdges.map(({ profileId, edge }) => semanticEdgeKey(profileId, edge)));
    const alternateKeys = new Set(alternateEdges.map(({ profileId, edge }) => semanticEdgeKey(profileId, edge)));
    return {
        selectedMethod,
        alternateMethod,
        selectedEdges: selectedEdges.length,
        alternateEdges: alternateEdges.length,
        selectedOnly: [...selectedKeys].filter((key) => !alternateKeys.has(key)).length,
        alternateOnly: [...alternateKeys].filter((key) => !selectedKeys.has(key)).length,
        selectedStepEdges: selectedEdges.filter(({ edge }) => edge.type === "step").length,
        alternateStepEdges: alternateEdges.filter(({ edge }) => edge.type === "step").length
    };
}

export function rebakeAndVerifyNavigation(levelDocument, context = {}, options = {}) {
    const source = levelDocument?.level && typeof levelDocument.level === "object" ? levelDocument.level : levelDocument;
    if (!source || typeof source !== "object") throw new Error("Level document is missing.");
    const verifyBySimulation = options.verifyBySimulation === true;
    const stepTransitionMethod = options.stepTransitionMethod === "legacy" ? "legacy" : "stride_arc";
    const { state, world } = buildCanonicalNavigationWorld(levelDocument, context);
    const heuristicStartedAt = globalThis.performance?.now?.() ?? Date.now();
    let candidateProfiles = bakeProfiles(world, state, options, stepTransitionMethod);
    const heuristicElapsedMs = Math.max(0, (globalThis.performance?.now?.() ?? Date.now()) - heuristicStartedAt);
    const existingProfiles = Array.isArray(source?.navigationGraphs?.profiles) ? source.navigationGraphs.profiles : [];
    const existingById = new Map(existingProfiles.map((graph) => [String(graph?.id || ""), graph]));
    const proofIndex = buildNavigationLocalProofIndex(world);
    let reusedVerifiedProfiles = 0;
    let reusedVerificationEdges = 0;
    let reusedSalvageEdges = 0;
    let locallyReusedVerificationEdges = 0;
    let globallyReusedVerificationEdges = 0;
    const reuseSimulationProofs = verifyBySimulation
        ? options.reuseSimulationProofs !== false
        : options.preserveMatchingVerification !== false;

    candidateProfiles = candidateProfiles.map((graph) => {
        if (!reuseSimulationProofs) return stampNavigationLocalProofHashes(world, graph, proofIndex);
        const preserved = preserveMatchingVerification(graph, existingById.get(String(graph.id || "")), world, proofIndex);
        if (preserved.reused) reusedVerifiedProfiles += 1;
        reusedVerificationEdges += preserved.reusedEdges || 0;
        reusedSalvageEdges += preserved.reusedSalvageEdges || 0;
        locallyReusedVerificationEdges += preserved.localReuseEdges || 0;
        globallyReusedVerificationEdges += preserved.globalReuseEdges || 0;
        return stampNavigationLocalProofHashes(world, rebuildEnemyNavigationWalkRegions(preserved.graph), proofIndex);
    });

    const comparison = options.compareStepMethods === true
        ? compareGraphMethods(
            candidateProfiles,
            bakeProfiles(world, state, options, stepTransitionMethod === "stride_arc" ? "legacy" : "stride_arc"),
            stepTransitionMethod,
            stepTransitionMethod === "stride_arc" ? "legacy" : "stride_arc"
        )
        : null;

    const totalEdges = navigationSimulationCandidateCount(candidateProfiles);
    const totalSimulationEdges = candidateProfiles.reduce((sum, graph) => sum + (graph?.edges || []).reduce((edgeSum, edge) => {
        if (edge?.type !== "step" && edge?.type !== "jump" && edge?.type !== "drop") return edgeSum;
        return edgeSum + (reusableVerificationState(edge) ? 0 : 1);
    }, 0), 0);
    const onProgress = typeof options.onProgress === "function" ? options.onProgress : null;
    const outputProfiles = [];
    const failures = [];
    let checkedEdges = 0;
    let failedDuringRun = 0;
    let elapsedMs = 0;
    let salvageProofChecks = 0;
    let salvagedEdges = 0;

    if (verifyBySimulation) {
        for (let profileIndex = 0; profileIndex < candidateProfiles.length; profileIndex += 1) {
            const graph = candidateProfiles[profileIndex];
            const profileTotalEdges = (graph?.edges || []).reduce((sum, edge) => {
                if (edge?.type !== "step" && edge?.type !== "jump" && edge?.type !== "drop") return sum;
                return sum + (reusableVerificationState(edge) ? 0 : 1);
            }, 0);
            onProgress?.({
                phase: "verify",
                profileIndex,
                profileCount: candidateProfiles.length,
                profileId: graph.id,
                checkedEdges,
                totalEdges: totalSimulationEdges,
                candidateEdges: totalEdges,
                reusedEdges: reusedVerificationEdges + reusedSalvageEdges,
                failedEdges: failedDuringRun,
                profileCheckedEdges: 0,
                profileTotalEdges
            });
            const verification = verifyEnemyNavigationGraphBySimulation(world, graph, {
                progressInterval: Math.max(1, Math.floor(Number(options.progressInterval) || 20)),
                reuseExistingVerification: reuseSimulationProofs,
                onProgress(progress) {
                    onProgress?.({
                        phase: "verify",
                        profileIndex,
                        profileCount: candidateProfiles.length,
                        profileId: graph.id,
                        checkedEdges: checkedEdges + progress.checkedEdges,
                        totalEdges: totalSimulationEdges,
                        candidateEdges: totalEdges,
                        reusedEdges: reusedVerificationEdges + reusedSalvageEdges,
                        failedEdges: failedDuringRun + progress.rejectedEdges,
                        profileCheckedEdges: progress.checkedEdges,
                        profileTotalEdges: progress.totalCheckedEdges
                    });
                }
            });
            outputProfiles.push(stampNavigationLocalProofHashes(world, rebuildEnemyNavigationWalkRegions(verification.graph), proofIndex));
            for (const failure of verification.failures) failures.push({ profileId: graph.id, ...failure });
            checkedEdges += verification.summary.checkedEdges;
            failedDuringRun += verification.summary.failedEdges ?? verification.summary.rejectedEdges;
            elapsedMs += verification.summary.elapsedMs;
            salvageProofChecks += verification.summary.salvageProofChecks || 0;
            salvagedEdges += verification.summary.salvagedEdges || 0;
        }
    } else {
        outputProfiles.push(...candidateProfiles);
    }

    const stateCounts = verificationStateCounts(outputProfiles);
    const navigationGraphs = { version: 2, profiles: outputProfiles };
    const updatedSource = { ...cloneData(source), navigationGraphs };
    const updatedLevel = levelDocument?.level && typeof levelDocument.level === "object"
        ? { ...cloneData(levelDocument), level: updatedSource }
        : updatedSource;
    return {
        level: updatedLevel,
        profiles: outputProfiles,
        failures,
        comparison,
        summary: {
            profiles: outputProfiles.length,
            supports: outputProfiles.reduce((sum, graph) => sum + (graph.supports?.length || 0), 0),
            edges: outputProfiles.reduce((sum, graph) => sum + (graph.edges?.length || 0), 0),
            candidateSimulationEdges: totalEdges,
            simulationRan: verifyBySimulation,
            checkedEdges,
            simulatedEdges: checkedEdges + salvageProofChecks,
            reusedSimulationEdges: reusedVerificationEdges + reusedSalvageEdges,
            locallyReusedVerificationEdges,
            globallyReusedVerificationEdges,
            verifiedEdges: stateCounts.verifiedEdges,
            failedEdges: stateCounts.failedEdges,
            unverifiedEdges: stateCounts.unverifiedEdges,
            reusedVerifiedProfiles,
            reusedVerificationEdges,
            reusedSalvageEdges,
            salvageProofChecks,
            salvagedEdges,
            elapsedMs,
            heuristicElapsedMs,
            nrOfAltJumps: Math.max(0, Math.floor(Number(options.nrOfAltJumps ?? 6) || 0))
        }
    };
}
