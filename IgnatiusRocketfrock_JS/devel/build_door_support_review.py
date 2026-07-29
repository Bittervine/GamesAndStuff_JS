#!/usr/bin/env python3
"""Build data for the one-off door-support validation page.

The detector considers only assets tagged ``capability.platform``. It seats the
real ``portal_closed`` asset on authored green walkable lines or top-facing
edges of closed yellow blockable polygons, then measures whether the full
four-corner perspective foundation footprint lands on opaque platform pixels.
A portal whose body would be enclosed by any blockable polygon is always
rejected.

Requires Pillow and NumPy only when regenerating the dataset.
"""

from __future__ import annotations

import json
import math
from collections import defaultdict, deque
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
RESOURCES = ROOT / "resources"
ATLAS_RESOURCES = RESOURCES / "atlases"
ITEM_RESOURCES = RESOURCES / "items"
EDITOR_RESOURCES = RESOURCES / "editor"
GENERATOR_RESOURCES = RESOURCES / "generator"
OUTPUT = Path(__file__).with_name("door-support-review-data.js")

DOOR_ATLAS_ID = "it_atlas_001"
DOOR_ASSET_ID = "portal_closed"
PLATFORM_TAG = "capability.platform"
DOOR_SUPPORT_TAG = "capability.doorSupport"


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


CONFIG = load_json(EDITOR_RESOURCES / "asset-autotagging-config.json")
ALPHA_THRESHOLD = int(CONFIG.get("alphaThreshold", 32))
MAX_COLLISION_SLOPE = float(CONFIG.get("platform", {}).get("maximumSlope", 0.25))
DOOR_CONFIG = CONFIG.get("door", {})
DOOR_RENDER_WIDTH = float(DOOR_CONFIG.get("renderWidth", 125))
DOOR_RENDER_HEIGHT = float(DOOR_CONFIG.get("renderHeight", 164))
DOOR_SOURCE_WIDTH = float(DOOR_CONFIG.get("sourceWidth", 183))
DOOR_SOURCE_HEIGHT = float(DOOR_CONFIG.get("sourceHeight", 263))
DOOR_FLOOR_ANCHOR_Y_SOURCE = float(DOOR_CONFIG.get("floorAnchorYSource", 239))
DOOR_FOOTPRINT_SOURCE = np.asarray(DOOR_CONFIG.get("footprintSource"), dtype=float)
DEFAULT_PASS_COVERAGE = float(DOOR_CONFIG.get("defaultPassCoverage", 0.985))
DEFAULT_PASS_CORNER_COVERAGE = float(DOOR_CONFIG.get("defaultPassCornerCoverage", 0.55))
PLACEMENT_STEP_WORLD = max(1.0, float(DOOR_CONFIG.get("placementStepWorld", 12)))
MAXIMUM_PLACEMENTS = max(1, int(DOOR_CONFIG.get("maximumPlacementsPerSurface", 48)))
CORNER_RADIUS = max(0, int(DOOR_CONFIG.get("cornerRadius", 2)))
SCALE_SAMPLES = max(1, int(DOOR_CONFIG.get("scaleSamples", 7)))


def linspace(start: float, end: float, count: int) -> list[float]:
    if count <= 1 or abs(end - start) < 1e-9:
        return [float(start)]
    return [start + (end - start) * index / (count - 1) for index in range(count)]


def point_in_polygon(point: tuple[float, float], polygon: list[tuple[float, float]]) -> bool:
    x, y = point
    inside = False
    j = len(polygon) - 1
    for i, (ax, ay) in enumerate(polygon):
        bx, by = polygon[j]
        crosses = ((ay > y) != (by > y)) and (x < (bx - ax) * (y - ay) / ((by - ay) or 1e-12) + ax)
        if crosses:
            inside = not inside
        j = i
    return inside


def extract_closed_blockable_polygons(obj: dict[str, Any], nodes: dict[str, tuple[float, float]]) -> list[dict[str, Any]]:
    edges: list[dict[str, str]] = []
    for index, line in enumerate(obj.get("lines", [])):
        if not isinstance(line, dict) or line.get("kind") != "blockable":
            continue
        start_id = str(line.get("from", ""))
        end_id = str(line.get("to", ""))
        if start_id not in nodes or end_id not in nodes:
            continue
        edges.append({
            "id": str(line.get("id", f"blockable_{index + 1}")),
            "from": start_id,
            "to": end_id,
        })

    adjacency: dict[str, list[int]] = defaultdict(list)
    for edge_index, edge in enumerate(edges):
        adjacency[edge["from"]].append(edge_index)
        adjacency[edge["to"]].append(edge_index)

    visited: set[int] = set()
    polygons: list[dict[str, Any]] = []
    for start_edge_index in range(len(edges)):
        if start_edge_index in visited:
            continue
        queue: deque[int] = deque([start_edge_index])
        component_edges: list[int] = []
        component_nodes: set[str] = set()
        while queue:
            edge_index = queue.pop()
            if edge_index in visited:
                continue
            visited.add(edge_index)
            component_edges.append(edge_index)
            edge = edges[edge_index]
            component_nodes.update((edge["from"], edge["to"]))
            for node_id in (edge["from"], edge["to"]):
                for neighbor in adjacency[node_id]:
                    if neighbor not in visited:
                        queue.append(neighbor)

        component_set = set(component_edges)
        if len(component_edges) < 3:
            continue
        if any(len([edge_index for edge_index in adjacency[node_id] if edge_index in component_set]) != 2 for node_id in component_nodes):
            continue

        first_edge = edges[component_edges[0]]
        start_node_id = first_edge["from"]
        current_node_id = start_node_id
        previous_edge_index = -1
        ordered_nodes: list[str] = []
        ordered_edges: list[str] = []
        for _ in range(len(component_edges) + 2):
            ordered_nodes.append(current_node_id)
            candidates = [
                edge_index for edge_index in adjacency[current_node_id]
                if edge_index in component_set and edge_index != previous_edge_index
            ]
            next_edge_index = next(
                (edge_index for edge_index in candidates if edges[edge_index]["id"] not in ordered_edges),
                candidates[0] if candidates else None,
            )
            if next_edge_index is None:
                break
            edge = edges[next_edge_index]
            ordered_edges.append(edge["id"])
            current_node_id = edge["to"] if edge["from"] == current_node_id else edge["from"]
            previous_edge_index = next_edge_index
            if current_node_id == start_node_id:
                break

        if current_node_id != start_node_id or len(ordered_nodes) != len(component_edges):
            continue
        polygons.append({
            "points": [nodes[node_id] for node_id in ordered_nodes],
            "edgeIds": set(ordered_edges),
        })
    return polygons


def candidate_surface_segments(obj: dict[str, Any]) -> tuple[list[dict[str, Any]], list[list[tuple[float, float]]]]:
    nodes = {
        str(node.get("id", "")): (float(node.get("x", 0)), float(node.get("y", 0)))
        for node in obj.get("nodes", [])
        if isinstance(node, dict)
    }
    polygons = extract_closed_blockable_polygons(obj, nodes)
    result: list[dict[str, Any]] = []
    for index, line in enumerate(obj.get("lines", [])):
        if not isinstance(line, dict) or line.get("kind") not in {"walkable", "blockable"}:
            continue
        start = nodes.get(str(line.get("from", "")))
        end = nodes.get(str(line.get("to", "")))
        if start is None or end is None or abs(end[0] - start[0]) < 1.0:
            continue
        slope = abs((end[1] - start[1]) / (end[0] - start[0]))
        if slope > MAX_COLLISION_SLOPE:
            continue
        line_id = str(line.get("id", f"{line.get('kind')}_{index + 1}"))
        polygon = None
        if line.get("kind") == "blockable":
            polygon = next((entry for entry in polygons if line_id in entry["edgeIds"]), None)
            if polygon is None:
                continue
            midpoint = ((start[0] + end[0]) * 0.5, (start[1] + end[1]) * 0.5)
            length = math.hypot(end[0] - start[0], end[1] - start[1])
            probe = max(2.0, min(5.0, length * 0.02))
            if point_in_polygon((midpoint[0], midpoint[1] - probe), polygon["points"]):
                continue
            if not point_in_polygon((midpoint[0], midpoint[1] + probe), polygon["points"]):
                continue
        result.append({
            "id": line_id,
            "kind": str(line.get("kind")),
            "start": start,
            "end": end,
            "slope": slope,
            "polygon": polygon["points"] if polygon else None,
        })
    return result, [entry["points"] for entry in polygons]


def corner_coverage(alpha: np.ndarray, x: float, y: float) -> float:
    center_x = int(round(x))
    center_y = int(round(y))
    minimum_x = max(0, center_x - CORNER_RADIUS)
    maximum_x = min(alpha.shape[1] - 1, center_x + CORNER_RADIUS)
    minimum_y = max(0, center_y - CORNER_RADIUS)
    maximum_y = min(alpha.shape[0] - 1, center_y + CORNER_RADIUS)
    if maximum_x < minimum_x or maximum_y < minimum_y:
        return 0.0
    area = alpha[minimum_y : maximum_y + 1, minimum_x : maximum_x + 1]
    expected = (CORNER_RADIUS * 2 + 1) ** 2
    return float((area >= ALPHA_THRESHOLD).sum() / expected)


def polygon_coverage(alpha: np.ndarray, polygon: np.ndarray) -> tuple[float, int, int]:
    minimum_x = int(math.floor(float(polygon[:, 0].min())))
    maximum_x = int(math.ceil(float(polygon[:, 0].max())))
    minimum_y = int(math.floor(float(polygon[:, 1].min())))
    maximum_y = int(math.ceil(float(polygon[:, 1].max())))
    if maximum_x < minimum_x or maximum_y < minimum_y:
        return 0.0, 0, 0

    mask = Image.new("1", (maximum_x - minimum_x + 1, maximum_y - minimum_y + 1), 0)
    ImageDraw.Draw(mask).polygon(
        [(float(x - minimum_x), float(y - minimum_y)) for x, y in polygon],
        fill=1,
    )
    mask_array = np.asarray(mask, dtype=bool)
    sample_count = int(mask_array.sum())
    if sample_count == 0:
        return 0.0, 0, 0

    overlap_minimum_x = max(0, minimum_x)
    overlap_maximum_x = min(alpha.shape[1] - 1, maximum_x)
    overlap_minimum_y = max(0, minimum_y)
    overlap_maximum_y = min(alpha.shape[0] - 1, maximum_y)
    opaque_count = 0
    if overlap_maximum_x >= overlap_minimum_x and overlap_maximum_y >= overlap_minimum_y:
        alpha_crop = alpha[
            overlap_minimum_y : overlap_maximum_y + 1,
            overlap_minimum_x : overlap_maximum_x + 1,
        ]
        mask_crop = mask_array[
            overlap_minimum_y - minimum_y : overlap_maximum_y - minimum_y + 1,
            overlap_minimum_x - minimum_x : overlap_maximum_x - minimum_x + 1,
        ]
        opaque_count = int(((alpha_crop >= ALPHA_THRESHOLD) & mask_crop).sum())
    return opaque_count / sample_count, opaque_count, sample_count


def platform_scale_range(obj: dict[str, Any], catalog_entry: dict[str, Any] | None) -> tuple[float, float]:
    if catalog_entry is not None:
        minimum = max(0.1, float(catalog_entry.get("scaleMin", 0.5)))
        maximum = max(minimum, float(catalog_entry.get("scaleMax", 2.5)))
        return minimum, maximum
    default_scale = max(0.1, float(obj.get("defaultScale", 1.0)))
    return max(0.5, default_scale * 0.75), min(2.5, default_scale * 1.25)


def line_y_at_x(segment: dict[str, Any], x: float) -> float:
    start_x, start_y = segment["start"]
    end_x, end_y = segment["end"]
    ratio = (x - start_x) / (end_x - start_x)
    return start_y + (end_y - start_y) * ratio


def orientation(a: tuple[float, float], b: tuple[float, float], c: tuple[float, float]) -> int:
    value = (b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) * (c[1] - b[1])
    if abs(value) < 1e-9:
        return 0
    return 1 if value > 0 else 2


def point_on_segment(a: tuple[float, float], b: tuple[float, float], point: tuple[float, float]) -> bool:
    return (
        min(a[0], b[0]) - 1e-9 <= point[0] <= max(a[0], b[0]) + 1e-9
        and min(a[1], b[1]) - 1e-9 <= point[1] <= max(a[1], b[1]) + 1e-9
    )


def segments_intersect(
    a: tuple[float, float],
    b: tuple[float, float],
    c: tuple[float, float],
    d: tuple[float, float],
) -> bool:
    o1 = orientation(a, b, c)
    o2 = orientation(a, b, d)
    o3 = orientation(c, d, a)
    o4 = orientation(c, d, b)
    if o1 != o2 and o3 != o4:
        return True
    return (
        (o1 == 0 and point_on_segment(a, b, c))
        or (o2 == 0 and point_on_segment(a, b, d))
        or (o3 == 0 and point_on_segment(c, d, a))
        or (o4 == 0 and point_on_segment(c, d, b))
    )


def polygon_intersects_rectangle(
    polygon: list[tuple[float, float]],
    rectangle: tuple[float, float, float, float],
) -> bool:
    left, top, right, bottom = rectangle
    corners = [(left, top), (right, top), (right, bottom), (left, bottom)]
    if any(point_in_polygon(point, polygon) for point in corners):
        return True
    if any(left <= point[0] <= right and top <= point[1] <= bottom for point in polygon):
        return True
    for index, a in enumerate(polygon):
        b = polygon[(index + 1) % len(polygon)]
        for corner_index, c in enumerate(corners):
            d = corners[(corner_index + 1) % len(corners)]
            if segments_intersect(a, b, c, d):
                return True
    return False


def door_body_inside_blockable_polygon(
    door_left_native: float,
    door_top_native: float,
    door_width_native: float,
    door_height_native: float,
    floor_anchor_native_y: float,
    polygons: list[list[tuple[float, float]]],
) -> bool:
    rectangle = (
        door_left_native + door_width_native * 0.1,
        door_top_native + door_height_native * 0.06,
        door_left_native + door_width_native * 0.9,
        floor_anchor_native_y - max(4.0, door_height_native * 0.06),
    )
    if rectangle[3] <= rectangle[1]:
        return True
    return any(polygon_intersects_rectangle(polygon, rectangle) for polygon in polygons)


def analyze_candidate(
    alpha: np.ndarray,
    segment: dict[str, Any],
    blockable_polygons: list[list[tuple[float, float]]],
    platform_scale: float,
    door_center_world_x: float,
    footprint_rendered: np.ndarray,
    floor_anchor_rendered_y: float,
) -> dict[str, Any]:
    center_native_x = door_center_world_x / platform_scale
    line_native_y = line_y_at_x(segment, center_native_x)
    line_world_y = line_native_y * platform_scale
    door_left_world = door_center_world_x - DOOR_RENDER_WIDTH * 0.5
    door_top_world = line_world_y - floor_anchor_rendered_y
    footprint_world = footprint_rendered + np.array([door_left_world, door_top_world])
    footprint_native = footprint_world / platform_scale

    coverage, opaque_count, sample_count = polygon_coverage(alpha, footprint_native)
    corner_coverages = [corner_coverage(alpha, float(x), float(y)) for x, y in footprint_native]
    minimum_corner = min(corner_coverages) if corner_coverages else 0.0
    door_left_native = door_left_world / platform_scale
    door_top_native = door_top_world / platform_scale
    door_width_native = DOOR_RENDER_WIDTH / platform_scale
    door_height_native = DOOR_RENDER_HEIGHT / platform_scale
    inside_blockable_polygon = door_body_inside_blockable_polygon(
        door_left_native,
        door_top_native,
        door_width_native,
        door_height_native,
        line_native_y,
        blockable_polygons,
    )
    passes = (
        not inside_blockable_polygon
        and coverage >= DEFAULT_PASS_COVERAGE
        and minimum_corner >= DEFAULT_PASS_CORNER_COVERAGE
    )
    return {
        "pass": passes,
        "insideBlockablePolygon": inside_blockable_polygon,
        "coverage": coverage,
        "minimumCornerCoverage": minimum_corner,
        "cornerCoverages": corner_coverages,
        "opaqueSampleCount": opaque_count,
        "sampleCount": sample_count,
        "platformScale": platform_scale,
        "doorCenterWorldX": door_center_world_x,
        "doorLeftWorld": door_left_world,
        "doorTopWorld": door_top_world,
        "lineWorldY": line_world_y,
        "footprintWorld": footprint_world,
        "score": coverage * 1000.0 + minimum_corner * 10.0 - (10000.0 if inside_blockable_polygon else 0.0),
    }


def build_dataset() -> dict[str, Any]:
    door_manifest = load_json(ITEM_RESOURCES / f"{DOOR_ATLAS_ID}.json")
    door_frame = door_manifest["frames"][DOOR_ASSET_ID]
    footprint_rendered = DOOR_FOOTPRINT_SOURCE * np.array(
        [DOOR_RENDER_WIDTH / DOOR_SOURCE_WIDTH, DOOR_RENDER_HEIGHT / DOOR_SOURCE_HEIGHT]
    )
    floor_anchor_rendered_y = DOOR_FLOOR_ANCHOR_Y_SOURCE * DOOR_RENDER_HEIGHT / DOOR_SOURCE_HEIGHT
    footprint_minimum_x = float(footprint_rendered[:, 0].min())
    footprint_maximum_x = float(footprint_rendered[:, 0].max())

    catalog = load_json(GENERATOR_RESOURCES / "level-generator-platforms.json")
    catalog_by_asset = {
        (str(entry.get("atlasId", "")), str(entry.get("assetId", ""))): entry
        for entry in catalog.get("assets", [])
        if isinstance(entry, dict)
    }

    results: list[dict[str, Any]] = []
    tagged_platform_count = 0
    for manifest_path in sorted(ATLAS_RESOURCES.glob("at_atlas_*.json")):
        manifest = load_json(manifest_path)
        atlas_id = str(manifest.get("atlasId", manifest_path.stem))
        image_name = str(manifest.get("image", f"{atlas_id}.png"))
        atlas_image = Image.open(ATLAS_RESOURCES / image_name).convert("RGBA")
        frames = manifest.get("frames", {})

        for asset_id, obj in manifest.get("objects", {}).items():
            if not isinstance(obj, dict) or PLATFORM_TAG not in obj.get("generationTags", []):
                continue
            tagged_platform_count += 1
            segments, blockable_polygons = candidate_surface_segments(obj)
            if not segments:
                continue
            frame = frames.get(str(obj.get("frame", asset_id)))
            if not isinstance(frame, dict):
                continue

            left = int(frame.get("x", 0))
            top = int(frame.get("y", 0))
            width = int(frame.get("w", 0))
            height = int(frame.get("h", 0))
            frame_image = atlas_image.crop((left, top, left + width, top + height))
            alpha = np.asarray(frame_image, dtype=np.uint8)[:, :, 3]

            catalog_entry = catalog_by_asset.get((atlas_id, str(asset_id)))
            scale_min, scale_max = platform_scale_range(obj, catalog_entry)
            best: dict[str, Any] | None = None
            for segment in segments:
                minimum_native_x = min(segment["start"][0], segment["end"][0])
                maximum_native_x = max(segment["start"][0], segment["end"][0])
                for platform_scale in linspace(scale_min, scale_max, SCALE_SAMPLES):
                    minimum_center = minimum_native_x * platform_scale + DOOR_RENDER_WIDTH * 0.5 - footprint_minimum_x
                    maximum_center = maximum_native_x * platform_scale + DOOR_RENDER_WIDTH * 0.5 - footprint_maximum_x
                    if maximum_center < minimum_center:
                        continue
                    placement_count = max(1, min(MAXIMUM_PLACEMENTS, int((maximum_center - minimum_center) / PLACEMENT_STEP_WORLD) + 1))
                    for door_center in linspace(minimum_center, maximum_center, placement_count):
                        placement = analyze_candidate(
                            alpha,
                            segment,
                            blockable_polygons,
                            platform_scale,
                            door_center,
                            footprint_rendered,
                            floor_anchor_rendered_y,
                        )
                        if best is None or placement["score"] > best["score"]:
                            best = {**placement, "segment": segment}
                        if placement["pass"]:
                            best = {**placement, "segment": segment}
                            break
                    if best and best["pass"]:
                        break
                if best and best["pass"]:
                    break
            if best is None:
                continue

            generation_tags = list(obj.get("generationTags", []))
            results.append({
                "atlasId": atlas_id,
                "assetId": str(asset_id),
                "atlasImage": f"../resources/atlases/{image_name}",
                "frame": {"x": left, "y": top, "w": width, "h": height},
                "generationTags": generation_tags,
                "platformTagged": True,
                "doorCapabilityTagged": DOOR_SUPPORT_TAG in generation_tags,
                "catalogued": catalog_entry is not None,
                "catalogRoles": list(catalog_entry.get("roles", [])) if catalog_entry else [],
                "scaleRange": {"minimum": scale_min, "maximum": scale_max},
                "platformScale": best["platformScale"],
                "coverage": best["coverage"],
                "minimumCornerCoverage": best["minimumCornerCoverage"],
                "cornerCoverages": best["cornerCoverages"],
                "opaqueSampleCount": best["opaqueSampleCount"],
                "sampleCount": best["sampleCount"],
                "insideBlockablePolygon": best["insideBlockablePolygon"],
                "defaultPass": best["pass"],
                "line": {
                    "id": best["segment"]["id"],
                    "kind": best["segment"]["kind"],
                    "start": list(best["segment"]["start"]),
                    "end": list(best["segment"]["end"]),
                    "slope": best["segment"]["slope"],
                },
                "door": {
                    "left": best["doorLeftWorld"],
                    "top": best["doorTopWorld"],
                    "width": DOOR_RENDER_WIDTH,
                    "height": DOOR_RENDER_HEIGHT,
                    "centerX": best["doorCenterWorldX"],
                    "floorAnchorY": best["lineWorldY"],
                },
                "footprintWorld": best["footprintWorld"].tolist(),
            })

    results.sort(key=lambda entry: (
        not bool(entry["defaultPass"]),
        bool(entry["insideBlockablePolygon"]),
        -float(entry["coverage"]),
        -float(entry["minimumCornerCoverage"]),
        str(entry["atlasId"]),
        str(entry["assetId"]),
    ))
    return {
        "meta": {
            "version": 2,
            "note": "Portal support review generated only from assets tagged capability.platform, using top-facing collision surfaces, full footprint alpha coverage, and a hard blockable-polygon veto.",
            "defaultPassCoverage": DEFAULT_PASS_COVERAGE,
            "defaultPassCornerCoverage": DEFAULT_PASS_CORNER_COVERAGE,
            "alphaThreshold": ALPHA_THRESHOLD,
            "maximumCollisionSlope": MAX_COLLISION_SLOPE,
            "candidateCount": sum(1 for result in results if result["defaultPass"]),
            "testedCount": len(results),
            "taggedPlatformCount": tagged_platform_count,
        },
        "door": {
            "atlasId": DOOR_ATLAS_ID,
            "assetId": DOOR_ASSET_ID,
            "atlasImage": f"../resources/items/{door_manifest['image']}",
            "frame": {
                "x": int(door_frame["x"]),
                "y": int(door_frame["y"]),
                "w": int(door_frame["w"]),
                "h": int(door_frame["h"]),
            },
            "renderWidth": DOOR_RENDER_WIDTH,
            "renderHeight": DOOR_RENDER_HEIGHT,
            "floorAnchorYSource": DOOR_FLOOR_ANCHOR_Y_SOURCE,
            "floorAnchorYRendered": floor_anchor_rendered_y,
            "footprintSource": DOOR_FOOTPRINT_SOURCE.tolist(),
            "footprintRendered": footprint_rendered.tolist(),
        },
        "results": results,
    }


def main() -> None:
    dataset = build_dataset()
    OUTPUT.write_text(
        "window.DOOR_SUPPORT_REVIEW_DATA="
        + json.dumps(dataset, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    print(
        f"Wrote {OUTPUT.name}: {dataset['meta']['candidateCount']} default candidates "
        f"from {dataset['meta']['testedCount']} analyzed placements across "
        f"{dataset['meta']['taggedPlatformCount']} tagged platforms."
    )


if __name__ == "__main__":
    main()
