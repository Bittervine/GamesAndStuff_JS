import { normalizeRotationRadians, placementCenter } from "../shared/level-transform.js";

const DEFAULT_CULL_MARGIN_PX = 96;

function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

export function visualSortKey(visual, index = 0) {
    if (Number.isFinite(Number(visual?.order))) {
        return Number(visual.order);
    }
    const layer = visual?.layer || "terrain";
    const layerOrder = layer === "decorBack"
        ? 0
        : layer === "terrain"
            ? 10000
            : layer === "mask"
                ? 20000
                : 30000;
    return layerOrder + index;
}

export function visualWorldBounds(visual) {
    const width = Math.max(0, finiteNumber(visual?.w, 0));
    const height = Math.max(0, finiteNumber(visual?.h, 0));
    if (visual?.kind === "cutoutMask") {
        return {
            minX: finiteNumber(visual.x, 0),
            minY: finiteNumber(visual.y, 0),
            maxX: finiteNumber(visual.x, 0) + width,
            maxY: finiteNumber(visual.y, 0) + height
        };
    }

    const center = placementCenter(visual || {});
    const rotation = normalizeRotationRadians(visual?.rotation, visual?.angle);
    const cosine = Math.abs(Math.cos(rotation));
    const sine = Math.abs(Math.sin(rotation));
    const extentX = cosine * width * 0.5 + sine * height * 0.5;
    const extentY = sine * width * 0.5 + cosine * height * 0.5;
    return {
        minX: center.x - extentX,
        minY: center.y - extentY,
        maxX: center.x + extentX,
        maxY: center.y + extentY
    };
}

export function expandedViewportWorldBounds(view, parallaxOffset = null, marginPixels = DEFAULT_CULL_MARGIN_PX) {
    const zoom = Math.max(0.0001, finiteNumber(view?.zoom, 1));
    const width = Math.max(1, finiteNumber(view?.virtualW, finiteNumber(view?.w, 1) / zoom));
    const height = Math.max(1, finiteNumber(view?.virtualH, finiteNumber(view?.h, 1) / zoom));
    const offsetX = finiteNumber(parallaxOffset?.x, 0);
    const offsetY = finiteNumber(parallaxOffset?.y, 0);
    const margin = Math.max(0, finiteNumber(marginPixels, DEFAULT_CULL_MARGIN_PX)) / zoom;
    return {
        minX: finiteNumber(view?.x, 0) + offsetX - margin,
        minY: finiteNumber(view?.y, 0) + offsetY - margin,
        maxX: finiteNumber(view?.x, 0) + offsetX + width + margin,
        maxY: finiteNumber(view?.y, 0) + offsetY + height + margin
    };
}

export function boundsIntersect(a, b) {
    return Boolean(a && b) &&
        a.maxX >= b.minX &&
        a.minX <= b.maxX &&
        a.maxY >= b.minY &&
        a.minY <= b.maxY;
}

export function visualIntersectsViewport(visualOrBounds, view, parallaxOffset = null, marginPixels = DEFAULT_CULL_MARGIN_PX) {
    const bounds = visualOrBounds && Number.isFinite(Number(visualOrBounds.minX))
        ? visualOrBounds
        : visualWorldBounds(visualOrBounds);
    return boundsIntersect(bounds, expandedViewportWorldBounds(view, parallaxOffset, marginPixels));
}

export function buildWorldVisualCache(visuals = []) {
    const source = Array.isArray(visuals) ? visuals : [];
    const entries = source.map((visual, index) => ({
        visual,
        index,
        bounds: visualWorldBounds(visual),
        sortKey: visualSortKey(visual, index)
    }));
    entries.sort((a, b) => a.sortKey - b.sortKey || a.index - b.index);

    return {
        source,
        sourceLength: source.length,
        main: entries.filter(({ visual }) => visual?.layer !== "actorFront" && visual?.layer !== "caveForeground"),
        actorFront: entries.filter(({ visual }) => visual?.layer === "actorFront"),
        caveForeground: entries.filter(({ visual }) => visual?.layer === "caveForeground")
    };
}
