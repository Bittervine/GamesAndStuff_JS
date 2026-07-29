import { normalizeRotationRadians, placementCenter } from "../shared/level-transform.js";
import { visualWorldBounds } from "./world-visual-cache.js";

export const OVERLAP_BLEND_CENTRAL_START = 0.25;
export const OVERLAP_BLEND_CENTRAL_END = 0.75;
export const DEFAULT_OVERLAP_BLEND_MAX_DIMENSION = 4096;
export const DEFAULT_OVERLAP_BLEND_MAX_AREA = 12_000_000;

function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function unionBounds(a, b) {
    return {
        minX: Math.min(a.minX, b.minX),
        minY: Math.min(a.minY, b.minY),
        maxX: Math.max(a.maxX, b.maxX),
        maxY: Math.max(a.maxY, b.maxY)
    };
}

export function overlapIntersectionBounds(a, b) {
    const minX = Math.max(a?.minX ?? 0, b?.minX ?? 0);
    const minY = Math.max(a?.minY ?? 0, b?.minY ?? 0);
    const maxX = Math.min(a?.maxX ?? 0, b?.maxX ?? 0);
    const maxY = Math.min(a?.maxY ?? 0, b?.maxY ?? 0);
    if (maxX <= minX || maxY <= minY) return null;
    return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY
    };
}

export function overlapBlendVisualEligible(visual) {
    if (!visual || (visual.kind !== "atlasSprite" && visual.kind !== "atlasAsset")) return false;
    if (visual.dynamicPosition || visual.movingPlatformId || visual.movement || visual.entityId || visual.onTop === true) return false;
    if (visual.blendMode === "brightenOnly") return false;
    if (visual.layer === "actorFront" || visual.layer === "caveForeground") return false;
    if (visual.blendOverlaps === false) return false;
    if (!(finiteNumber(visual.w, 0) > 0) || !(finiteNumber(visual.h, 0) > 0)) return false;
    return true;
}

function groupCanvasFits(bounds, maxDimension, maxArea) {
    const width = Math.ceil(bounds.maxX - bounds.minX);
    const height = Math.ceil(bounds.maxY - bounds.minY);
    return width > 0 && height > 0 && width <= maxDimension && height <= maxDimension && width * height <= maxArea;
}

/**
 * Finds consecutive, same-layer static atlas visuals whose transformed world
 * bounds overlap. Consecutive ordering is deliberate: a blended group may not
 * jump across an unrelated draw-order record and silently reorder the scene.
 */
export function buildOverlapBlendGroups(entries = [], options = {}) {
    const minimumOverlap = Math.max(0.5, finiteNumber(options.minimumOverlap, 4));
    const maxMembers = Math.max(2, Math.floor(finiteNumber(options.maxMembers, 12)));
    const maxDimension = Math.max(256, finiteNumber(options.maxDimension, DEFAULT_OVERLAP_BLEND_MAX_DIMENSION));
    const maxArea = Math.max(65_536, finiteNumber(options.maxArea, DEFAULT_OVERLAP_BLEND_MAX_AREA));
    const groups = [];
    let active = null;

    const finish = () => {
        if (active?.members?.length >= 2 && groupCanvasFits(active.bounds, maxDimension, maxArea)) {
            active.id = `overlap_blend_${groups.length + 1}`;
            groups.push(active);
        }
        active = null;
    };

    for (const entry of Array.isArray(entries) ? entries : []) {
        const visual = entry?.visual;
        if (!overlapBlendVisualEligible(visual)) {
            finish();
            continue;
        }
        const bounds = entry.bounds || visualWorldBounds(visual);
        if (!active) {
            active = {
                layer: visual.layer || "terrain",
                bounds: { ...bounds },
                members: [{ ...entry, bounds }]
            };
            continue;
        }
        const sameLayer = active.layer === (visual.layer || "terrain");
        const overlap = overlapIntersectionBounds(active.bounds, bounds);
        const sufficientlyOverlapping = overlap && overlap.width >= minimumOverlap && overlap.height >= minimumOverlap;
        const prospectiveBounds = sameLayer ? unionBounds(active.bounds, bounds) : null;
        if (
            sameLayer &&
            sufficientlyOverlapping &&
            active.members.length < maxMembers &&
            groupCanvasFits(prospectiveBounds, maxDimension, maxArea)
        ) {
            active.members.push({ ...entry, bounds });
            active.bounds = prospectiveBounds;
        } else {
            finish();
            active = {
                layer: visual.layer || "terrain",
                bounds: { ...bounds },
                members: [{ ...entry, bounds }]
            };
        }
    }
    finish();
    return groups;
}

function createCanvasSurface(ownerDocument, width, height) {
    const safeWidth = Math.max(1, Math.ceil(width));
    const safeHeight = Math.max(1, Math.ceil(height));
    if (typeof OffscreenCanvas !== "undefined") {
        return new OffscreenCanvas(safeWidth, safeHeight);
    }
    const documentRef = ownerDocument || (typeof document !== "undefined" ? document : null);
    const surface = documentRef?.createElement?.("canvas");
    if (!surface) return null;
    surface.width = safeWidth;
    surface.height = safeHeight;
    return surface;
}

function drawVisualIntoGroup(layerContext, visual, atlas, frame, groupBounds) {
    const center = placementCenter(visual);
    const localX = center.x - groupBounds.minX;
    const localY = center.y - groupBounds.minY;
    layerContext.save();
    layerContext.globalAlpha = finiteNumber(visual.alpha, 1);
    layerContext.translate(localX, localY);
    layerContext.rotate(normalizeRotationRadians(visual.rotation));
    layerContext.scale(visual.mirrorX ? -1 : 1, visual.mirrorY ? -1 : 1);
    layerContext.drawImage(
        atlas.renderImage || atlas.image,
        frame.x,
        frame.y,
        frame.w,
        frame.h,
        -finiteNumber(visual.w, frame.w) * 0.5,
        -finiteNumber(visual.h, frame.h) * 0.5,
        finiteNumber(visual.w, frame.w),
        finiteNumber(visual.h, frame.h)
    );
    layerContext.restore();
}

function applyOverlapGradientMask(layerContext, groupBounds, previousBounds, memberBounds) {
    const overlap = overlapIntersectionBounds(previousBounds, memberBounds);
    if (!overlap) return;

    const previousCenterX = (previousBounds.minX + previousBounds.maxX) * 0.5;
    const previousCenterY = (previousBounds.minY + previousBounds.maxY) * 0.5;
    const memberCenterX = (memberBounds.minX + memberBounds.maxX) * 0.5;
    const memberCenterY = (memberBounds.minY + memberBounds.maxY) * 0.5;
    const horizontal = Math.abs(memberCenterX - previousCenterX) >= Math.abs(memberCenterY - previousCenterY);
    const forward = horizontal ? memberCenterX >= previousCenterX : memberCenterY >= previousCenterY;

    let startX;
    let startY;
    let endX;
    let endY;
    if (horizontal) {
        startX = overlap.minX - groupBounds.minX;
        endX = overlap.maxX - groupBounds.minX;
        startY = endY = 0;
    } else {
        startY = overlap.minY - groupBounds.minY;
        endY = overlap.maxY - groupBounds.minY;
        startX = endX = 0;
    }
    if (!forward) {
        [startX, endX] = [endX, startX];
        [startY, endY] = [endY, startY];
    }

    const gradient = layerContext.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(OVERLAP_BLEND_CENTRAL_START, "rgba(255,255,255,0)");
    gradient.addColorStop(OVERLAP_BLEND_CENTRAL_END, "rgba(255,255,255,1)");
    gradient.addColorStop(1, "rgba(255,255,255,1)");
    layerContext.globalCompositeOperation = "destination-in";
    layerContext.fillStyle = gradient;
    layerContext.fillRect(0, 0, layerContext.canvas.width, layerContext.canvas.height);
    layerContext.globalCompositeOperation = "source-over";
}

/**
 * Bakes a connected overlap group into one reusable off-screen bitmap. The
 * incoming member crossfades over the central 50% of the overlap, so the seam
 * is paid once when the level visual cache changes rather than every frame.
 */
export function createOverlapBlendSurface({ ownerDocument, group, environmentAtlases }) {
    if (!group?.members?.length || group.members.length < 2) return null;
    const width = Math.ceil(group.bounds.maxX - group.bounds.minX);
    const height = Math.ceil(group.bounds.maxY - group.bounds.minY);
    const surface = createCanvasSurface(ownerDocument, width, height);
    const context = surface?.getContext?.("2d");
    if (!context) return null;
    context.clearRect(0, 0, width, height);

    let previousBounds = null;
    for (const member of group.members) {
        const visual = member.visual;
        const atlas = environmentAtlases?.get?.(visual.atlasId);
        const frameName = visual.frame || visual.assetId;
        const frame = (atlas?.frames || atlas?.manifest?.frames)?.[frameName];
        if (!atlas?.image || !frame) return null;

        const layer = createCanvasSurface(ownerDocument, width, height);
        const layerContext = layer?.getContext?.("2d");
        if (!layerContext) return null;
        layerContext.clearRect(0, 0, width, height);
        drawVisualIntoGroup(layerContext, visual, atlas, frame, group.bounds);
        if (previousBounds) {
            applyOverlapGradientMask(layerContext, group.bounds, previousBounds, member.bounds);
        }
        context.drawImage(layer, 0, 0);
        previousBounds = previousBounds ? unionBounds(previousBounds, member.bounds) : { ...member.bounds };
    }

    return {
        canvas: surface,
        bounds: { ...group.bounds },
        width,
        height,
        members: group.members.map((member) => member.visual)
    };
}
