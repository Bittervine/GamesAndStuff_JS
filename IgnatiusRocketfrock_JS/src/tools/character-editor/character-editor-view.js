export const TRANSFORM_EDIT_PROPERTY = "transform";

export function characterViewTransform({
    canvasWidth,
    canvasHeight,
    zoom = 1,
    panX = 0,
    panY = 0,
    facing = 1,
    originXRatio = 0.5,
    originYRatio = 0.78
}) {
    return {
        originX: Number(canvasWidth) * Number(originXRatio) + Number(panX),
        originY: Number(canvasHeight) * Number(originYRatio) + Number(panY),
        zoom: positiveFinite(zoom, 1),
        facing: Number(facing) < 0 ? -1 : 1
    };
}

export function canvasPointFromClient(clientX, clientY, rect, canvasWidth, canvasHeight) {
    const width = Math.max(1, Number(rect?.width) || 1);
    const height = Math.max(1, Number(rect?.height) || 1);
    return {
        x: (Number(clientX) - Number(rect?.left || 0)) * Number(canvasWidth) / width,
        y: (Number(clientY) - Number(rect?.top || 0)) * Number(canvasHeight) / height
    };
}

export function previewToCanvasPoint(point, view) {
    return {
        x: Number(view.originX) + Number(view.facing) * Number(view.zoom) * Number(point.x),
        y: Number(view.originY) + Number(view.zoom) * Number(point.y)
    };
}

export function canvasToPreviewPoint(point, view) {
    const zoom = positiveFinite(view?.zoom, 1);
    const facing = Number(view?.facing) < 0 ? -1 : 1;
    return {
        x: (Number(point.x) - Number(view?.originX || 0)) / (zoom * facing),
        y: (Number(point.y) - Number(view?.originY || 0)) / zoom
    };
}

export function canvasToCharacterWorldPoint(point, view, previewWorldScale = 1) {
    const zoom = positiveFinite(view?.zoom, 1);
    const scale = positiveFinite(previewWorldScale, 1);
    return {
        x: (Number(point.x) - Number(view?.originX || 0)) / (zoom * scale),
        y: (Number(point.y) - Number(view?.originY || 0)) / (zoom * scale)
    };
}

export function zoomCharacterViewAtCanvasPoint(viewState, canvasPoint, zoomFactor, options = {}) {
    const minZoom = positiveFinite(options.minZoom, 0.25);
    const maxZoom = Math.max(minZoom, positiveFinite(options.maxZoom, 6));
    const currentZoom = positiveFinite(viewState?.zoom, 1);
    const newZoom = clamp(currentZoom * positiveFinite(zoomFactor, 1), minZoom, maxZoom);
    const view = characterViewTransform({
        canvasWidth: options.canvasWidth,
        canvasHeight: options.canvasHeight,
        zoom: currentZoom,
        panX: viewState?.panX || 0,
        panY: viewState?.panY || 0,
        facing: options.facing,
        originXRatio: options.originXRatio,
        originYRatio: options.originYRatio
    });
    const previewPoint = canvasToPreviewPoint(canvasPoint, view);
    const baseOriginX = Number(options.canvasWidth) * Number(options.originXRatio ?? 0.5);
    const baseOriginY = Number(options.canvasHeight) * Number(options.originYRatio ?? 0.78);
    const facing = Number(options.facing) < 0 ? -1 : 1;
    return {
        zoom: newZoom,
        panX: Number(canvasPoint.x) - facing * newZoom * previewPoint.x - baseOriginX,
        panY: Number(canvasPoint.y) - newZoom * previewPoint.y - baseOriginY
    };
}

export function partRectangleGeometry(transform, asset, pivot) {
    const width = Math.max(1, Number(asset?.width) || 1);
    const height = Math.max(1, Number(asset?.height) || 1);
    const targetHeight = Math.max(0.000001, Number(transform?.targetHeight) || height);
    const spriteScale = targetHeight / height;
    const pivotX = Number(pivot?.x ?? 0.5);
    const pivotY = Number(pivot?.y ?? 0.5);
    const localCorners = [
        { x: -pivotX * width * spriteScale, y: -pivotY * height * spriteScale },
        { x: (1 - pivotX) * width * spriteScale, y: -pivotY * height * spriteScale },
        { x: (1 - pivotX) * width * spriteScale, y: (1 - pivotY) * height * spriteScale },
        { x: -pivotX * width * spriteScale, y: (1 - pivotY) * height * spriteScale }
    ];
    const angle = Number(transform?.angle) || 0;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const origin = {
        x: Number(transform?.x) || 0,
        y: Number(transform?.y) || 0
    };
    const corners = localCorners.map((corner) => ({
        x: origin.x + corner.x * cos - corner.y * sin,
        y: origin.y + corner.x * sin + corner.y * cos
    }));
    return {
        pivot: origin,
        center: averagePoints(corners),
        corners,
        spriteScale
    };
}

export function geometryToCanvas(geometry, view) {
    return {
        pivot: previewToCanvasPoint(geometry.pivot, view),
        center: previewToCanvasPoint(geometry.center, view),
        corners: geometry.corners.map((corner) => previewToCanvasPoint(corner, view))
    };
}

export function hitTestPartGeometry(canvasPoint, canvasGeometry, cornerRadius = 16) {
    const radius = Math.max(1, Number(cornerRadius) || 16);
    let nearestCorner = -1;
    let nearestDistance = Infinity;
    for (let index = 0; index < canvasGeometry.corners.length; index += 1) {
        const distance = pointDistance(canvasPoint, canvasGeometry.corners[index]);
        if (distance <= radius && distance < nearestDistance) {
            nearestCorner = index;
            nearestDistance = distance;
        }
    }
    if (nearestCorner >= 0) {
        return { mode: "rotate", cornerIndex: nearestCorner };
    }
    if (pointInPolygon(canvasPoint, canvasGeometry.corners)) {
        return { mode: "move", cornerIndex: -1 };
    }
    return null;
}

export function rotationFromPointerDrag(startRotation, pivotPoint, startPointerPoint, currentPointerPoint) {
    const startAngle = Math.atan2(
        Number(startPointerPoint.y) - Number(pivotPoint.y),
        Number(startPointerPoint.x) - Number(pivotPoint.x)
    );
    const currentAngle = Math.atan2(
        Number(currentPointerPoint.y) - Number(pivotPoint.y),
        Number(currentPointerPoint.x) - Number(pivotPoint.x)
    );
    return Number(startRotation) + shortestAngleDelta(startAngle, currentAngle);
}

export function pointInPolygon(point, polygon) {
    let inside = false;
    for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
        const a = polygon[index];
        const b = polygon[previous];
        const intersects = ((a.y > point.y) !== (b.y > point.y))
            && (point.x < (b.x - a.x) * (point.y - a.y) / ((b.y - a.y) || 0.0000001) + a.x);
        if (intersects) {
            inside = !inside;
        }
    }
    return inside;
}

function averagePoints(points) {
    const total = points.reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), { x: 0, y: 0 });
    return {
        x: total.x / Math.max(1, points.length),
        y: total.y / Math.max(1, points.length)
    };
}

function pointDistance(a, b) {
    return Math.hypot(Number(a.x) - Number(b.x), Number(a.y) - Number(b.y));
}

function shortestAngleDelta(from, to) {
    const tau = Math.PI * 2;
    let delta = (Number(to) - Number(from) + Math.PI) % tau - Math.PI;
    if (delta < -Math.PI) {
        delta += tau;
    }
    return delta;
}

function positiveFinite(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
