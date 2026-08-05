import { deriveCaveFullBlackKillBoundary, pointInClosedPolygon } from "../shared/cave-kill-boundary-data.js";
import { normalizeForegroundParallax } from "../shared/level-layer-data.js";
import { computeWorldParallaxOffsetAtPoint } from "./world-parallax.js";

function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function emptyBounds() {
    return {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
}

function includePoint(bounds, x, y) {
    const px = Number(x);
    const py = Number(y);
    if (!Number.isFinite(px) || !Number.isFinite(py)) return;
    bounds.minX = Math.min(bounds.minX, px);
    bounds.minY = Math.min(bounds.minY, py);
    bounds.maxX = Math.max(bounds.maxX, px);
    bounds.maxY = Math.max(bounds.maxY, py);
}

function validBounds(bounds) {
    return [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY].every(Number.isFinite)
        && bounds.maxX > bounds.minX
        && bounds.maxY > bounds.minY;
}


function gameplayPerimeterPoints(world = {}, caveWindow = null) {
    const runtimeBoundary = world?.caveKillBoundary;
    if (runtimeBoundary?.enabled
        && Array.isArray(runtimeBoundary.points)
        && runtimeBoundary.points.length >= 3) {
        return runtimeBoundary.points;
    }
    const cave = caveWindow && typeof caveWindow === "object" ? caveWindow : world?.caveWindow;
    const derived = deriveCaveFullBlackKillBoundary(cave);
    return derived?.enabled && Array.isArray(derived.points) && derived.points.length >= 3
        ? derived.points
        : [];
}

export function minimapTeleportAllowed(development, editorPlaytest) {
    return Boolean(development || editorPlaytest);
}

export function minimapPointInsideGameplayPerimeter(world = {}, caveWindow = null, point = null) {
    const x = Number(point?.x);
    const y = Number(point?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    const perimeter = gameplayPerimeterPoints(world, caveWindow);
    if (perimeter.length >= 3) return pointInClosedPolygon({ x, y }, perimeter);
    const bounds = world?.bounds || {};
    const left = finiteNumber(bounds.x);
    const top = finiteNumber(bounds.y);
    const right = left + Math.max(0, finiteNumber(bounds.w));
    const bottom = top + Math.max(0, finiteNumber(bounds.h));
    return right > left && bottom > top && x >= left && x <= right && y >= top && y <= bottom;
}

export function minimapSegmentIsStaticPlatform(segment) {
    if (!segment || (segment.kind !== "walkable" && segment.kind !== "blockable")) return false;
    if (segment.movingPlatformId || segment.dynamicPosition || segment.runtimeDynamic) return false;
    const x1 = finiteNumber(segment.x1);
    const y1 = finiteNumber(segment.y1);
    const x2 = finiteNumber(segment.x2);
    const y2 = finiteNumber(segment.y2);
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.abs(dx) >= 8 && Math.abs(dy) <= Math.abs(dx) * 0.45;
}

export function computeMinimapGeometry({ world = {}, caveWindow = null, player = null } = {}) {
    const staticSegments = (Array.isArray(world?.segments) ? world.segments : [])
        .filter(minimapSegmentIsStaticPlatform);
    const terrainBounds = emptyBounds();
    for (const segment of staticSegments) {
        includePoint(terrainBounds, segment.x1, segment.y1);
        includePoint(terrainBounds, segment.x2, segment.y2);
    }

    const cave = caveWindow && typeof caveWindow === "object" ? caveWindow : world?.caveWindow;
    const authoredGameplayBoundary = gameplayPerimeterPoints(world, cave);
    const authoredGameplayBoundaryBounds = emptyBounds();
    for (const point of authoredGameplayBoundary) {
        includePoint(authoredGameplayBoundaryBounds, point.x, point.y);
    }

    let anchorX;
    let anchorY;
    if (validBounds(terrainBounds)) {
        anchorX = (terrainBounds.minX + terrainBounds.maxX) * 0.5;
        anchorY = (terrainBounds.minY + terrainBounds.maxY) * 0.5;
    } else if (validBounds(authoredGameplayBoundaryBounds)) {
        anchorX = (authoredGameplayBoundaryBounds.minX + authoredGameplayBoundaryBounds.maxX) * 0.5;
        anchorY = (authoredGameplayBoundaryBounds.minY + authoredGameplayBoundaryBounds.maxY) * 0.5;
    } else {
        anchorX = finiteNumber(player?.x, finiteNumber(world?.bounds?.x) + finiteNumber(world?.bounds?.w, 1) * 0.5);
        anchorY = finiteNumber(player?.y, finiteNumber(world?.bounds?.y) + finiteNumber(world?.bounds?.h, 1) * 0.5);
    }

    const foreground = world?.layerVisuals?.foreground || {};
    const gameplayBoundaryParallaxOffset = computeWorldParallaxOffsetAtPoint(
        { x: anchorX, y: anchorY },
        world?.bounds,
        normalizeForegroundParallax(foreground.parallaxX),
        normalizeForegroundParallax(foreground.parallaxY),
        { minX: 0.01, maxX: 1.25, minY: 0.01, maxY: 1.25 }
    );
    const gameplayBoundaryOutline = authoredGameplayBoundary.map((point) => ({
        x: finiteNumber(point.x) - gameplayBoundaryParallaxOffset.x,
        y: finiteNumber(point.y) - gameplayBoundaryParallaxOffset.y
    }));

    const contentBounds = emptyBounds();
    for (const segment of staticSegments) {
        includePoint(contentBounds, segment.x1, segment.y1);
        includePoint(contentBounds, segment.x2, segment.y2);
    }
    for (const point of gameplayBoundaryOutline) includePoint(contentBounds, point.x, point.y);
    for (const visual of Array.isArray(world?.visuals) ? world.visuals : []) {
        if (visual?.entityType !== "wizard_exit_door") continue;
        includePoint(
            contentBounds,
            finiteNumber(visual.x) + finiteNumber(visual.w) * 0.5,
            finiteNumber(visual.y) + finiteNumber(visual.h) * 0.5
        );
    }
    for (const entity of Array.isArray(world?.entities) ? world.entities : []) {
        if (entity?.type !== "wizard_exit_point") continue;
        includePoint(contentBounds, entity.x, entity.y);
    }
    includePoint(contentBounds, player?.x, player?.y);

    if (!validBounds(contentBounds)) {
        const bounds = world?.bounds || {};
        const x = finiteNumber(bounds.x);
        const y = finiteNumber(bounds.y);
        const w = Math.max(1, finiteNumber(bounds.w, 1600));
        const h = Math.max(1, finiteNumber(bounds.h, 1000));
        contentBounds.minX = x;
        contentBounds.minY = y;
        contentBounds.maxX = x + w;
        contentBounds.maxY = y + h;
    }

    const padX = Math.max(80, (contentBounds.maxX - contentBounds.minX) * 0.035);
    const padY = Math.max(80, (contentBounds.maxY - contentBounds.minY) * 0.05);
    return {
        staticSegments,
        gameplayBoundaryOutline,
        gameplayBoundaryParallaxOffset,
        anchor: { x: anchorX, y: anchorY },
        bounds: {
            minX: contentBounds.minX - padX,
            minY: contentBounds.minY - padY,
            maxX: contentBounds.maxX + padX,
            maxY: contentBounds.maxY + padY
        }
    };
}
