#!/usr/bin/env python3
"""Deterministically repack Ignatius atlas JSON/PNG pairs without changing frame pixels.

The atlas JSON ``frames`` table is authoritative. Every defined rectangle is
preserved whether or not current game data references it. Reforging may only
change frame x/y coordinates; w/h and the logical decoded pixels remain fixed.

The tool removes pixels that live outside every defined frame and packs
overlap-connected frame clusters tightly. Exact duplicates alias the same target
rectangle; containment and partial/glancing overlaps keep their original relative
geometry inside a cluster, so authored overlap pixels are never duplicated or
reinterpreted.

A transparent padding ring is reserved around every independent packed cluster.
RGB from the nearest visible source pixel is dilated into fully transparent
pixels (alpha remains exactly zero), including that padding ring. This supplies
filter-friendly hidden RGB for linear GPU sampling without changing visible art.

Every output is verified with ``verify_atlas_rect_pixels.py`` by default before
it is considered successful.

Examples:

    # Reforge one atlas into another directory.
    python reference/devel/reforge_atlases.py \\
      reference/resources/atlases/at_atlas_037.json /tmp/reforged/at_atlas_037.json

    # Reforge every environment, character, and item atlas into a mirrored tree.
    python reference/devel/reforge_atlases.py \\
      reference/resources /tmp/reforged-resources --report /tmp/reforge-report.json

    # Explicitly replace the source files only after staged verification succeeds.
    python reference/devel/reforge_atlases.py reference/resources --in-place
"""
from __future__ import annotations

import argparse
import json
import math
import shutil
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Sequence

try:
    import numpy as np
    from PIL import Image, UnidentifiedImageError
except ImportError as exc:  # pragma: no cover - dependency failure only
    raise SystemExit(
        "reforge_atlases.py requires Pillow and NumPy. "
        "Install them with: python -m pip install Pillow numpy"
    ) from exc

# The verifier lives beside this script. Importing it directly keeps the
# acceptance contract in one place rather than reimplementing a looser check.
try:
    import verify_atlas_rect_pixels as verifier
except ImportError:  # pragma: no cover - defensive path for unusual importers
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import verify_atlas_rect_pixels as verifier


class ReforgeError(RuntimeError):
    pass


@dataclass(frozen=True)
class Rect:
    name: str
    x: int
    y: int
    w: int
    h: int
    order: int

    @property
    def right(self) -> int:
        return self.x + self.w

    @property
    def bottom(self) -> int:
        return self.y + self.h

    @property
    def area(self) -> int:
        return self.w * self.h

    @property
    def box(self) -> tuple[int, int, int, int]:
        return (self.x, self.y, self.right, self.bottom)


@dataclass(frozen=True)
class Cluster:
    name: str
    x: int
    y: int
    w: int
    h: int
    order: int
    members: tuple[Rect, ...]

    @property
    def right(self) -> int:
        return self.x + self.w

    @property
    def bottom(self) -> int:
        return self.y + self.h


@dataclass(frozen=True)
class PackRect:
    name: str
    w: int
    h: int
    order: int


@dataclass(frozen=True)
class FreeRect:
    x: int
    y: int
    w: int
    h: int

    @property
    def right(self) -> int:
        return self.x + self.w

    @property
    def bottom(self) -> int:
        return self.y + self.h


@dataclass(frozen=True)
class Placement:
    x: int
    y: int
    w: int
    h: int

    @property
    def right(self) -> int:
        return self.x + self.w

    @property
    def bottom(self) -> int:
        return self.y + self.h


@dataclass
class AtlasStats:
    manifest: str
    atlas_id: str
    frames: int
    unique_rectangles: int
    packed_clusters: int
    exact_alias_frames: int
    contained_rectangles: int
    partial_overlap_pairs: int
    edge_touching_frames: int
    original_size: tuple[int, int]
    rebuilt_size: tuple[int, int]
    original_rgba_bytes: int
    rebuilt_rgba_bytes: int
    hidden_rgb_pixels_changed: int
    layout_mode: str
    padding: int
    bleed_radius: int
    max_dimension: int

    @property
    def saved_rgba_bytes(self) -> int:
        return self.original_rgba_bytes - self.rebuilt_rgba_bytes

    @property
    def saved_percent(self) -> float:
        if self.original_rgba_bytes <= 0:
            return 0.0
        return self.saved_rgba_bytes * 100.0 / self.original_rgba_bytes

    def to_json(self) -> dict:
        return {
            "manifest": self.manifest,
            "atlasId": self.atlas_id,
            "frames": self.frames,
            "uniqueRectangles": self.unique_rectangles,
            "packedClusters": self.packed_clusters,
            "exactAliasFrames": self.exact_alias_frames,
            "containedRectangles": self.contained_rectangles,
            "partialOverlapPairs": self.partial_overlap_pairs,
            "edgeTouchingFrames": self.edge_touching_frames,
            "originalSize": list(self.original_size),
            "rebuiltSize": list(self.rebuilt_size),
            "originalRgbaBytes": self.original_rgba_bytes,
            "rebuiltRgbaBytes": self.rebuilt_rgba_bytes,
            "savedRgbaBytes": self.saved_rgba_bytes,
            "savedPercent": round(self.saved_percent, 4),
            "hiddenRgbPixelsChanged": self.hidden_rgb_pixels_changed,
            "layoutMode": self.layout_mode,
            "padding": self.padding,
            "bleedRadius": self.bleed_radius,
            "maxDimension": self.max_dimension,
        }


def _load_json_text(path: Path) -> tuple[dict, int]:
    try:
        text = path.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        raise ReforgeError(f"manifest not found: {path}") from exc
    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ReforgeError(f"invalid JSON in {path}: {exc}") from exc
    if not isinstance(data, dict):
        raise ReforgeError(f"atlas manifest root must be an object: {path}")

    indent = 2
    for line in text.splitlines()[1:]:
        stripped = line.lstrip(" ")
        if stripped and stripped != line:
            indent = len(line) - len(stripped)
            break
    return data, max(1, indent)


def _load_source_image(path: Path) -> Image.Image:
    try:
        image = Image.open(path)
        image.load()
    except FileNotFoundError as exc:
        raise ReforgeError(f"atlas image not found: {path}") from exc
    except (UnidentifiedImageError, OSError) as exc:
        raise ReforgeError(f"could not decode atlas image {path}: {exc}") from exc
    return image.convert("RGBA")


def _parse_rects(data: dict, manifest_path: Path) -> list[Rect]:
    frames = data.get("frames")
    if not isinstance(frames, dict) or not frames:
        raise ReforgeError(f"atlas manifest has no non-empty object 'frames': {manifest_path}")

    rects: list[Rect] = []
    for order, (name, raw) in enumerate(frames.items()):
        if not isinstance(name, str) or not name:
            raise ReforgeError(f"atlas contains an invalid frame name in {manifest_path}")
        if not isinstance(raw, dict):
            raise ReforgeError(f"frame {name!r} must be an object in {manifest_path}")
        values: dict[str, int] = {}
        for field in ("x", "y", "w", "h"):
            value = raw.get(field)
            if isinstance(value, bool) or not isinstance(value, int):
                raise ReforgeError(
                    f"frame {name!r} field {field!r} must be an integer in {manifest_path}"
                )
            values[field] = value
        if values["w"] <= 0 or values["h"] <= 0:
            raise ReforgeError(
                f"frame {name!r} has invalid size {values['w']}x{values['h']} in {manifest_path}"
            )
        rects.append(Rect(name=name, order=order, **values))
    return rects


def _contains(outer: Rect, inner: Rect) -> bool:
    return (
        outer.x <= inner.x
        and outer.y <= inner.y
        and outer.right >= inner.right
        and outer.bottom >= inner.bottom
    )


def _overlap_area(a: Rect, b: Rect) -> int:
    width = min(a.right, b.right) - max(a.x, b.x)
    height = min(a.bottom, b.bottom) - max(a.y, b.y)
    return max(0, width) * max(0, height)


def _build_containment(
    rects: Sequence[Rect],
) -> tuple[dict[str, Rect], dict[str, Rect], int, int]:
    """Return canonical rect per frame and packed root per canonical frame.

    Exact source rectangles alias their first manifest occurrence. For each
    unique rectangle, the smallest strict containing rectangle is its parent;
    walking those parents yields the packed root. This preserves deliberate
    nested sub-frames while avoiding duplicate storage.
    """
    canonical_by_box: dict[tuple[int, int, int, int], Rect] = {}
    canonical_for_name: dict[str, Rect] = {}
    exact_alias_frames = 0
    for rect in rects:
        existing = canonical_by_box.get(rect.box)
        if existing is None:
            canonical_by_box[rect.box] = rect
            canonical_for_name[rect.name] = rect
        else:
            canonical_for_name[rect.name] = existing
            exact_alias_frames += 1

    unique = sorted(canonical_by_box.values(), key=lambda rect: rect.order)
    parent: dict[str, Rect] = {}
    for inner in unique:
        candidates = [
            outer
            for outer in unique
            if outer.name != inner.name
            and outer.area > inner.area
            and _contains(outer, inner)
        ]
        if candidates:
            parent[inner.name] = min(candidates, key=lambda r: (r.area, r.order, r.name))

    root_for_canonical: dict[str, Rect] = {}
    for rect in unique:
        current = rect
        seen: set[str] = set()
        while current.name in parent:
            if current.name in seen:  # should be impossible with strict area growth
                raise ReforgeError(f"containment cycle involving frame {current.name!r}")
            seen.add(current.name)
            current = parent[current.name]
        root_for_canonical[rect.name] = current

    contained_rectangles = len(parent)
    partial_overlap_pairs = 0
    for index, left in enumerate(unique):
        for right in unique[index + 1 :]:
            if _overlap_area(left, right) <= 0:
                continue
            if _contains(left, right) or _contains(right, left):
                continue
            partial_overlap_pairs += 1

    root_for_name = {
        rect.name: root_for_canonical[canonical_for_name[rect.name].name]
        for rect in rects
    }
    return canonical_for_name, root_for_name, exact_alias_frames, partial_overlap_pairs


def _build_overlap_clusters(
    rects: Sequence[Rect], canonical_for_name: dict[str, Rect]
) -> tuple[list[Cluster], dict[str, Cluster]]:
    # Exact duplicate rectangles were already canonicalized. Any positive-area
    # overlap joins rectangles into one cluster so their relative source geometry
    # survives reforging exactly, including both deliberate containment and old
    # accidental glancing overlaps.
    unique_by_name = {canonical.name: canonical for canonical in canonical_for_name.values()}
    unique = sorted(unique_by_name.values(), key=lambda rect: rect.order)
    parent = {rect.name: rect.name for rect in unique}

    def find(name: str) -> str:
        while parent[name] != name:
            parent[name] = parent[parent[name]]
            name = parent[name]
        return name

    def union(left: str, right: str) -> None:
        left_root = find(left)
        right_root = find(right)
        if left_root == right_root:
            return
        left_rect = unique_by_name[left_root]
        right_rect = unique_by_name[right_root]
        if (left_rect.order, left_rect.name) <= (right_rect.order, right_rect.name):
            parent[right_root] = left_root
        else:
            parent[left_root] = right_root

    for index, left in enumerate(unique):
        for right in unique[index + 1 :]:
            if _overlap_area(left, right) > 0:
                union(left.name, right.name)

    groups: dict[str, list[Rect]] = {}
    for rect in unique:
        groups.setdefault(find(rect.name), []).append(rect)

    clusters: list[Cluster] = []
    cluster_for_canonical: dict[str, Cluster] = {}
    for members in groups.values():
        ordered = tuple(sorted(members, key=lambda rect: rect.order))
        min_x = min(rect.x for rect in ordered)
        min_y = min(rect.y for rect in ordered)
        max_x = max(rect.right for rect in ordered)
        max_y = max(rect.bottom for rect in ordered)
        first = ordered[0]
        cluster = Cluster(
            name=first.name,
            x=min_x,
            y=min_y,
            w=max_x - min_x,
            h=max_y - min_y,
            order=first.order,
            members=ordered,
        )
        clusters.append(cluster)
        for rect in ordered:
            cluster_for_canonical[rect.name] = cluster

    clusters.sort(key=lambda cluster: cluster.order)
    cluster_for_name = {
        rect.name: cluster_for_canonical[canonical_for_name[rect.name].name]
        for rect in rects
    }
    return clusters, cluster_for_name


def _intersects(a: FreeRect, b: Placement) -> bool:
    return not (
        b.x >= a.right or b.right <= a.x or b.y >= a.bottom or b.bottom <= a.y
    )


def _split_free_rect(free: FreeRect, used: Placement) -> list[FreeRect]:
    if not _intersects(free, used):
        return [free]

    pieces: list[FreeRect] = []
    if used.x > free.x:
        pieces.append(FreeRect(free.x, free.y, used.x - free.x, free.h))
    if used.right < free.right:
        pieces.append(FreeRect(used.right, free.y, free.right - used.right, free.h))
    if used.y > free.y:
        pieces.append(FreeRect(free.x, free.y, free.w, used.y - free.y))
    if used.bottom < free.bottom:
        pieces.append(FreeRect(free.x, used.bottom, free.w, free.bottom - used.bottom))
    return [piece for piece in pieces if piece.w > 0 and piece.h > 0]


def _free_contains(outer: FreeRect, inner: FreeRect) -> bool:
    return (
        outer.x <= inner.x
        and outer.y <= inner.y
        and outer.right >= inner.right
        and outer.bottom >= inner.bottom
    )


def _prune_free_rects(free_rects: list[FreeRect]) -> list[FreeRect]:
    # Deduplicate first; MaxRects splitting intentionally creates overlapping
    # free rectangles, but ones wholly contained by another add no opportunity.
    unique = list(dict.fromkeys(free_rects))
    kept: list[FreeRect] = []
    for index, candidate in enumerate(unique):
        if any(
            index != other_index and _free_contains(other, candidate)
            for other_index, other in enumerate(unique)
        ):
            continue
        kept.append(candidate)
    return kept


def _pack_fixed_width(
    rectangles: Sequence[PackRect], width: int, max_height: int
) -> tuple[dict[str, Placement], tuple[int, int]] | None:
    if width <= 0 or max_height <= 0:
        return None
    free_rects = [FreeRect(0, 0, width, max_height)]
    placements: dict[str, Placement] = {}

    # Large/awkward sprites first. Manifest order and name make every tie stable.
    ordered = sorted(
        rectangles,
        key=lambda r: (-max(r.w, r.h), -(r.w * r.h), -min(r.w, r.h), r.order, r.name),
    )

    for rect in ordered:
        best: tuple[tuple[int, ...], FreeRect] | None = None
        for free in free_rects:
            if rect.w > free.w or rect.h > free.h:
                continue
            leftover_w = free.w - rect.w
            leftover_h = free.h - rect.h
            score = (
                min(leftover_w, leftover_h),
                max(leftover_w, leftover_h),
                free.y,
                free.x,
                free.w * free.h,
            )
            if best is None or score < best[0]:
                best = (score, free)
        if best is None:
            return None

        free = best[1]
        used = Placement(free.x, free.y, rect.w, rect.h)
        placements[rect.name] = used
        split: list[FreeRect] = []
        for candidate in free_rects:
            split.extend(_split_free_rect(candidate, used))
        free_rects = _prune_free_rects(split)

    used_width = max((placement.right for placement in placements.values()), default=0)
    used_height = max((placement.bottom for placement in placements.values()), default=0)
    return placements, (used_width, used_height)


def _candidate_widths(rectangles: Sequence[PackRect], max_dimension: int) -> list[int]:
    minimum = max(rect.w for rect in rectangles)
    maximum = min(max_dimension, sum(rect.w for rect in rectangles))
    if minimum > maximum:
        return []

    area = sum(rect.w * rect.h for rect in rectangles)
    sqrt_area = math.sqrt(area)
    values = {minimum, maximum}

    # Dense deterministic sweep. The frame counts are small enough that trying
    # ~65 widths per atlas is cheap, and it finds materially tighter layouts
    # than a fixed shelf width without introducing a packing dependency.
    steps = 64
    span = maximum - minimum
    for index in range(steps + 1):
        values.add(minimum + round(span * index / steps))

    for scale in (0.65, 0.75, 0.85, 0.95, 1.0, 1.05, 1.15, 1.3, 1.5, 1.75, 2.0):
        proposed = round(sqrt_area * scale)
        if minimum <= proposed <= maximum:
            values.add(proposed)
        # Nearby multiples often line up sprite edges and reduce the final crop.
        for quantum in (16, 32, 64, 128, 256):
            rounded = int(math.ceil(max(minimum, proposed) / quantum) * quantum)
            if minimum <= rounded <= maximum:
                values.add(rounded)

    return sorted(values)


def _pack_roots(
    roots: Sequence[Rect], padding: int, max_dimension: int
) -> tuple[dict[str, Placement], tuple[int, int]]:
    pack_rects = [
        PackRect(root.name, root.w + 2 * padding, root.h + 2 * padding, root.order)
        for root in roots
    ]
    if any(rect.w > max_dimension or rect.h > max_dimension for rect in pack_rects):
        oversized = next(
            rect for rect in pack_rects if rect.w > max_dimension or rect.h > max_dimension
        )
        raise ReforgeError(
            f"frame cluster {oversized.name!r} including padding is {oversized.w}x{oversized.h}, "
            f"larger than max dimension {max_dimension}"
        )

    best: tuple[tuple[int, ...], dict[str, Placement], tuple[int, int]] | None = None
    for width in _candidate_widths(pack_rects, max_dimension):
        packed = _pack_fixed_width(pack_rects, width, max_dimension)
        if packed is None:
            continue
        placements, size = packed
        used_w, used_h = size
        if used_w <= 0 or used_h <= 0 or used_w > max_dimension or used_h > max_dimension:
            continue
        score = (
            used_w * used_h,
            max(used_w, used_h),
            abs(used_w - used_h),
            used_h,
            used_w,
        )
        if best is None or score < best[0]:
            best = (score, placements, size)

    if best is None:
        raise ReforgeError(
            f"could not pack {len(roots)} independent overlap cluster(s) within "
            f"{max_dimension}x{max_dimension}; try --max-dimension with a larger value"
        )
    return best[1], best[2]


def _nearest_visible_rgb_dilation(rgba: np.ndarray, radius: int) -> tuple[np.ndarray, int]:
    if radius <= 0:
        return rgba.copy(), 0
    if rgba.ndim != 3 or rgba.shape[2] != 4:
        raise ReforgeError("internal error: dilation expects an RGBA array")

    output = rgba.copy()
    alpha = rgba[..., 3]
    visible = alpha > 0
    transparent = ~visible
    filled = np.zeros(alpha.shape, dtype=bool)
    height, width = alpha.shape

    offsets = [
        (dx * dx + dy * dy, dy, dx)
        for dy in range(-radius, radius + 1)
        for dx in range(-radius, radius + 1)
        if (dx != 0 or dy != 0) and max(abs(dx), abs(dy)) <= radius
    ]
    offsets.sort(key=lambda item: (item[0], item[1], item[2]))

    for _distance_sq, dy, dx in offsets:
        src_y0 = max(0, -dy)
        src_y1 = min(height, height - dy)
        src_x0 = max(0, -dx)
        src_x1 = min(width, width - dx)
        dst_y0 = src_y0 + dy
        dst_y1 = src_y1 + dy
        dst_x0 = src_x0 + dx
        dst_x1 = src_x1 + dx

        source_visible = visible[src_y0:src_y1, src_x0:src_x1]
        target_slice = transparent[dst_y0:dst_y1, dst_x0:dst_x1]
        unfilled_slice = ~filled[dst_y0:dst_y1, dst_x0:dst_x1]
        mask = source_visible & target_slice & unfilled_slice
        if not np.any(mask):
            continue
        target_rgb = output[dst_y0:dst_y1, dst_x0:dst_x1, :3]
        source_rgb = rgba[src_y0:src_y1, src_x0:src_x1, :3]
        target_rgb[mask] = source_rgb[mask]
        filled[dst_y0:dst_y1, dst_x0:dst_x1][mask] = True

    # Alpha is never touched. Count actual hidden RGB changes, not merely filled
    # candidates, so reports remain useful when source transparent RGB was already
    # suitable.
    changed = transparent & np.any(output[..., :3] != rgba[..., :3], axis=2)
    return output, int(np.count_nonzero(changed))


def _frame_touches_visible_edge(image: Image.Image, rect: Rect) -> bool:
    pixels = np.asarray(image.crop(rect.box), dtype=np.uint8)
    alpha = pixels[..., 3]
    if alpha.size == 0:
        return False
    return bool(
        np.any(alpha[0, :] > 0)
        or np.any(alpha[-1, :] > 0)
        or np.any(alpha[:, 0] > 0)
        or np.any(alpha[:, -1] > 0)
    )


def _build_cluster_packed_canvas(
    source_image: Image.Image,
    clusters: Sequence[Cluster],
    cluster_for_name: dict[str, Cluster],
    rects: Sequence[Rect],
    placements: dict[str, Placement],
    size: tuple[int, int],
    padding: int,
    bleed_radius: int,
) -> tuple[np.ndarray, dict[str, tuple[int, int]], int]:
    width, height = size
    canvas = np.zeros((height, width, 4), dtype=np.uint8)
    hidden_rgb_pixels_changed = 0
    for cluster in clusters:
        placement = placements[cluster.name]
        tile = np.zeros(
            (cluster.h + 2 * padding, cluster.w + 2 * padding, 4), dtype=np.uint8
        )
        for member in cluster.members:
            crop = np.asarray(source_image.crop(member.box), dtype=np.uint8)
            offset_x = padding + member.x - cluster.x
            offset_y = padding + member.y - cluster.y
            tile[
                offset_y : offset_y + member.h,
                offset_x : offset_x + member.w,
                :,
            ] = crop
        dilated, changed = _nearest_visible_rgb_dilation(tile, bleed_radius)
        hidden_rgb_pixels_changed += changed
        canvas[
            placement.y : placement.bottom,
            placement.x : placement.right,
            :,
        ] = dilated

    positions = {}
    for rect in rects:
        cluster = cluster_for_name[rect.name]
        placement = placements[cluster.name]
        positions[rect.name] = (
            placement.x + padding + rect.x - cluster.x,
            placement.y + padding + rect.y - cluster.y,
        )
    return canvas, positions, hidden_rgb_pixels_changed


def _logical_bounds(rects: Sequence[Rect]) -> tuple[int, int, int, int]:
    return (
        min(rect.x for rect in rects),
        min(rect.y for rect in rects),
        max(rect.right for rect in rects),
        max(rect.bottom for rect in rects),
    )


def _build_cropped_source_layout_canvas(
    source_image: Image.Image,
    canonical_rects: Sequence[Rect],
    rects: Sequence[Rect],
    *,
    margin: int,
    bleed_radius: int,
) -> tuple[np.ndarray, dict[str, tuple[int, int]], int]:
    min_x, min_y, max_x, max_y = _logical_bounds(rects)
    width = max_x - min_x + 2 * margin
    height = max_y - min_y + 2 * margin
    canvas = np.zeros((height, width, 4), dtype=np.uint8)
    for member in canonical_rects:
        crop = np.asarray(source_image.crop(member.box), dtype=np.uint8)
        target_x = member.x - min_x + margin
        target_y = member.y - min_y + margin
        canvas[
            target_y : target_y + member.h,
            target_x : target_x + member.w,
            :,
        ] = crop
    dilated, changed = _nearest_visible_rgb_dilation(canvas, bleed_radius)
    positions = {
        rect.name: (rect.x - min_x + margin, rect.y - min_y + margin)
        for rect in rects
    }
    return dilated, positions, changed


def _build_original_source_layout_canvas(
    source_image: Image.Image,
    canonical_rects: Sequence[Rect],
    rects: Sequence[Rect],
    *,
    bleed_radius: int,
) -> tuple[np.ndarray, dict[str, tuple[int, int]], int]:
    source = np.asarray(source_image, dtype=np.uint8)
    height, width = source.shape[:2]
    canvas = np.zeros_like(source)
    for rect in canonical_rects:
        left = max(0, rect.x)
        top = max(0, rect.y)
        right = min(width, rect.right)
        bottom = min(height, rect.bottom)
        if right <= left or bottom <= top:
            continue
        canvas[top:bottom, left:right, :] = source[top:bottom, left:right, :]
    dilated, changed = _nearest_visible_rgb_dilation(canvas, bleed_radius)
    positions = {rect.name: (rect.x, rect.y) for rect in rects}
    return dilated, positions, changed


def _write_json(path: Path, data: dict, indent: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=indent) + "\n", encoding="utf-8"
    )


def _save_png(path: Path, image: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    # Fixed settings keep the output deterministic within a Pillow/zlib toolchain.
    image.save(path, format="PNG", optimize=False, compress_level=6)


def reforge_manifest(
    source_manifest_path: Path,
    output_manifest_path: Path,
    *,
    padding: int = 1,
    bleed_radius: int = 1,
    max_dimension: int | None = None,
    manifest_label: str | None = None,
) -> AtlasStats:
    source_manifest_path = source_manifest_path.resolve()
    output_manifest_path = output_manifest_path.resolve()
    data, indent = _load_json_text(source_manifest_path)
    rects = _parse_rects(data, source_manifest_path)

    image_value = data.get("image")
    if not isinstance(image_value, str) or not image_value.strip():
        raise ReforgeError(f"atlas manifest has no usable 'image' path: {source_manifest_path}")
    source_image_path = (source_manifest_path.parent / image_value).resolve()
    output_image_path = (output_manifest_path.parent / image_value).resolve()

    with _load_source_image(source_image_path) as source_image:
        original_size = source_image.size
        canonical_for_name, root_for_name, exact_alias_frames, partial_overlap_pairs = (
            _build_containment(rects)
        )
        canonical_unique = {
            canonical.name: canonical for canonical in canonical_for_name.values()
        }
        contained_rectangles = sum(
            1
            for canonical in canonical_unique.values()
            if root_for_name[canonical.name].name != canonical.name
        )
        clusters, cluster_for_name = _build_overlap_clusters(rects, canonical_for_name)

        effective_max_dimension = (
            max_dimension if max_dimension is not None else max(original_size) + 2 * padding
        )

        # Candidate 1: tightly pack independent overlap clusters with a full
        # transparent gutter around each cluster.
        packed_candidate = None
        try:
            placements, packed_size = _pack_roots(
                clusters, padding=padding, max_dimension=effective_max_dimension
            )
            packed_candidate = (placements, packed_size)
        except ReforgeError:
            if max_dimension is not None:
                # A smaller explicit cap may still be satisfiable by a cropped
                # source-relative layout below, so defer failure until all
                # candidates have been considered.
                packed_candidate = None

        # Candidate 2: preserve every frame's original relative placement but
        # crop away the outer region not covered by the logical frame bounds.
        # This is especially valuable for old atlases with glancing overlaps or
        # layouts that are already denser than a generic rectangle packer.
        min_x, min_y, max_x, max_y = _logical_bounds(rects)
        base_width = max_x - min_x
        base_height = max_y - min_y
        layout_candidates: list[tuple[tuple[int, int, int], str, object]] = []
        original_area = original_size[0] * original_size[1]
        if packed_candidate is not None:
            _placements, packed_size = packed_candidate
            layout_candidates.append(
                ((0, packed_size[0] * packed_size[1], max(packed_size)), "cluster-packed", packed_candidate)
            )

        for preference, margin in ((1, padding), (2, 0)):
            width = base_width + 2 * margin
            height = base_height + 2 * margin
            if width <= effective_max_dimension and height <= effective_max_dimension:
                layout_candidates.append(
                    ((preference, width * height, max(width, height)), f"source-relative-margin-{margin}", margin)
                )

        # Candidate 3: exact original canvas dimensions and coordinates, with
        # all pixels outside defined rectangles cleared. This guarantees that
        # default reforging never increases decoded atlas memory even when a
        # source layout is already unusually efficient.
        if (
            original_size[0] <= effective_max_dimension
            and original_size[1] <= effective_max_dimension
        ):
            layout_candidates.append(
                ((3, original_size[0] * original_size[1], max(original_size)), "source-layout", None)
            )

        if max_dimension is None:
            # Default reforging is a memory optimizer, never a decoded-memory
            # regression. Prefer layouts with a real per-cluster gutter when
            # they fit at or below the original pixel area; otherwise fall back
            # to source-relative/source layouts that preserve all frame pixels
            # without growing the texture.
            no_growth = [candidate for candidate in layout_candidates if candidate[0][1] <= original_area]
            if no_growth:
                layout_candidates = no_growth

        if not layout_candidates:
            raise ReforgeError(
                f"could not produce an atlas within {effective_max_dimension}x{effective_max_dimension}; "
                "try --max-dimension with a larger value"
            )

        _score, layout_mode, layout_payload = min(layout_candidates, key=lambda item: item[0])
        if layout_mode == "cluster-packed":
            placements, rebuilt_size = layout_payload
            canvas, frame_positions, hidden_rgb_pixels_changed = _build_cluster_packed_canvas(
                source_image,
                clusters,
                cluster_for_name,
                rects,
                placements,
                rebuilt_size,
                padding,
                bleed_radius,
            )
        elif layout_mode.startswith("source-relative-margin-"):
            margin = int(layout_payload)
            rebuilt_size = (base_width + 2 * margin, base_height + 2 * margin)
            canvas, frame_positions, hidden_rgb_pixels_changed = _build_cropped_source_layout_canvas(
                source_image,
                sorted(canonical_unique.values(), key=lambda rect: rect.order),
                rects,
                margin=margin,
                bleed_radius=bleed_radius,
            )
        else:
            rebuilt_size = original_size
            canvas, frame_positions, hidden_rgb_pixels_changed = _build_original_source_layout_canvas(
                source_image,
                sorted(canonical_unique.values(), key=lambda rect: rect.order),
                rects,
                bleed_radius=bleed_radius,
            )

        rebuilt_data = json.loads(json.dumps(data))
        rebuilt_frames = rebuilt_data["frames"]
        for rect in rects:
            new_x, new_y = frame_positions[rect.name]
            rebuilt_frames[rect.name]["x"] = int(new_x)
            rebuilt_frames[rect.name]["y"] = int(new_y)
            # w/h are intentionally left untouched.

        edge_touching_frames = sum(
            1 for rect in rects if _frame_touches_visible_edge(source_image, rect)
        )

    _write_json(output_manifest_path, rebuilt_data, indent)
    _save_png(output_image_path, Image.fromarray(canvas, mode="RGBA"))

    atlas_id = data.get("atlasId")
    if not isinstance(atlas_id, str) or not atlas_id:
        atlas_id = source_manifest_path.stem
    original_bytes = original_size[0] * original_size[1] * 4
    rebuilt_bytes = rebuilt_size[0] * rebuilt_size[1] * 4
    return AtlasStats(
        manifest=manifest_label or source_manifest_path.name,
        atlas_id=atlas_id,
        frames=len(rects),
        unique_rectangles=len(canonical_unique),
        packed_clusters=len(clusters),
        exact_alias_frames=exact_alias_frames,
        contained_rectangles=contained_rectangles,
        partial_overlap_pairs=partial_overlap_pairs,
        edge_touching_frames=edge_touching_frames,
        original_size=original_size,
        rebuilt_size=rebuilt_size,
        original_rgba_bytes=original_bytes,
        rebuilt_rgba_bytes=rebuilt_bytes,
        hidden_rgb_pixels_changed=hidden_rgb_pixels_changed,
        layout_mode=layout_mode,
        padding=padding,
        bleed_radius=bleed_radius,
        max_dimension=effective_max_dimension,
    )


def _validate_options(padding: int, bleed_radius: int, max_dimension: int | None) -> None:
    if padding < 0:
        raise ReforgeError("--padding must be non-negative")
    if bleed_radius < 0:
        raise ReforgeError("--bleed-radius must be non-negative")
    if bleed_radius > padding and padding > 0:
        # Dilation inside the logical frame is always fine, but an external ring
        # larger than the reserved padding cannot be guaranteed around root edges.
        raise ReforgeError("--bleed-radius cannot exceed --padding")
    if max_dimension is not None and max_dimension <= 0:
        raise ReforgeError("--max-dimension must be positive")


def _is_relative_to(path: Path, root: Path) -> bool:
    try:
        path.relative_to(root)
        return True
    except ValueError:
        return False


def _reforge_directory(
    source_root: Path,
    output_root: Path,
    *,
    padding: int,
    bleed_radius: int,
    max_dimension: int | None,
) -> list[AtlasStats]:
    source_root = source_root.resolve()
    output_root = output_root.resolve()
    manifests = verifier.discover_atlas_manifests(source_root)
    if not manifests:
        raise ReforgeError(f"no atlas manifests found below {source_root}")

    stats: list[AtlasStats] = []
    for source_manifest in manifests:
        relative = source_manifest.relative_to(source_root)
        output_manifest = output_root / relative
        stats.append(
            reforge_manifest(
                source_manifest,
                output_manifest,
                padding=padding,
                bleed_radius=bleed_radius,
                max_dimension=max_dimension,
                manifest_label=relative.as_posix(),
            )
        )
    return stats


def _verify_output(source: Path, output: Path) -> verifier.VerificationStats:
    try:
        if source.is_dir():
            return verifier.verify_directory_pair(source, output)
        return verifier.verify_manifest_pair(
            verifier.load_manifest(source), verifier.load_manifest(output)
        )
    except verifier.VerificationError as exc:
        raise ReforgeError(f"post-reforge verification failed: {exc}") from exc


def _replace_in_place(staged_root: Path, source: Path) -> None:
    if source.is_dir():
        for manifest in verifier.discover_atlas_manifests(staged_root):
            relative = manifest.relative_to(staged_root)
            source_manifest = source / relative
            data, _indent = _load_json_text(manifest)
            image_value = data.get("image")
            assert isinstance(image_value, str)
            staged_image = (manifest.parent / image_value).resolve()
            source_image = (source_manifest.parent / image_value).resolve()
            source_manifest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(staged_image, source_image)
            shutil.copy2(manifest, source_manifest)
        return

    data, _indent = _load_json_text(staged_root)
    image_value = data.get("image")
    assert isinstance(image_value, str)
    staged_image = (staged_root.parent / image_value).resolve()
    source_image_data, _ = _load_json_text(source)
    source_image_value = source_image_data.get("image")
    assert isinstance(source_image_value, str)
    source_image = (source.parent / source_image_value).resolve()
    shutil.copy2(staged_image, source_image)
    shutil.copy2(staged_root, source)


def _report_payload(stats: Sequence[AtlasStats]) -> dict:
    original_bytes = sum(item.original_rgba_bytes for item in stats)
    rebuilt_bytes = sum(item.rebuilt_rgba_bytes for item in stats)
    saved_bytes = original_bytes - rebuilt_bytes
    return {
        "version": 1,
        "atlases": [item.to_json() for item in stats],
        "summary": {
            "atlasCount": len(stats),
            "frameCount": sum(item.frames for item in stats),
            "packedClusterCount": sum(item.packed_clusters for item in stats),
            "exactAliasFrameCount": sum(item.exact_alias_frames for item in stats),
            "containedRectangleCount": sum(item.contained_rectangles for item in stats),
            "partialOverlapPairCount": sum(item.partial_overlap_pairs for item in stats),
            "edgeTouchingFrameCount": sum(item.edge_touching_frames for item in stats),
            "hiddenRgbPixelsChanged": sum(item.hidden_rgb_pixels_changed for item in stats),
            "originalRgbaBytes": original_bytes,
            "rebuiltRgbaBytes": rebuilt_bytes,
            "savedRgbaBytes": saved_bytes,
            "savedPercent": round(saved_bytes * 100.0 / original_bytes, 4)
            if original_bytes
            else 0.0,
        },
    }


def _print_summary(stats: Sequence[AtlasStats], verification: verifier.VerificationStats) -> None:
    for item in stats:
        print(
            f"{item.manifest}: {item.original_size[0]}x{item.original_size[1]} -> "
            f"{item.rebuilt_size[0]}x{item.rebuilt_size[1]} "
            f"({item.saved_percent:+.1f}% RGBA saved), "
            f"frames={item.frames} clusters={item.packed_clusters} layout={item.layout_mode} "
            f"contained={item.contained_rectangles} aliases={item.exact_alias_frames} "
            f"partial-overlaps={item.partial_overlap_pairs}"
        )
    payload = _report_payload(stats)["summary"]
    mib = 1024 * 1024
    print(
        "PASS: reforged "
        f"{payload['atlasCount']} atlas(es) / {payload['frameCount']} defined frame(s); "
        f"decoded RGBA {payload['originalRgbaBytes'] / mib:.1f} MiB -> "
        f"{payload['rebuiltRgbaBytes'] / mib:.1f} MiB "
        f"({payload['savedPercent']:.1f}% saved); verifier preserved "
        f"{verification.visible_pixels:,} visible frame pixel(s)"
    )


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Repack atlas JSON/PNG pairs while preserving every defined frame and "
            "automatically verifying alpha/visible-RGB equivalence."
        )
    )
    parser.add_argument(
        "source", type=Path, help="source atlas JSON, or a root containing atlas manifests"
    )
    parser.add_argument(
        "output",
        nargs="?",
        type=Path,
        help="rebuilt atlas JSON or mirrored output root (omit only with --in-place)",
    )
    parser.add_argument(
        "--in-place",
        action="store_true",
        help="stage, verify, then replace atlas JSON/PNG files below the source",
    )
    parser.add_argument(
        "--padding",
        type=int,
        default=1,
        help="transparent pixels reserved around each independent packed root (default: 1)",
    )
    parser.add_argument(
        "--bleed-radius",
        type=int,
        default=1,
        help="nearest-visible RGB dilation radius; alpha remains zero (default: 1)",
    )
    parser.add_argument(
        "--max-dimension",
        type=int,
        help=(
            "maximum rebuilt width/height. Default keeps the source maximum where possible and grows only if packing requires it"
        ),
    )
    parser.add_argument(
        "--report",
        type=Path,
        help="write deterministic JSON packing/memory diagnostics",
    )
    return parser


def main(argv: Iterable[str] | None = None) -> int:
    args = _parser().parse_args(list(argv) if argv is not None else None)
    source = args.source.resolve()

    try:
        _validate_options(args.padding, args.bleed_radius, args.max_dimension)
        if not source.exists():
            raise ReforgeError(f"source not found: {source}")
        if args.in_place and args.output is not None:
            raise ReforgeError("do not provide an output path together with --in-place")
        if not args.in_place and args.output is None:
            raise ReforgeError("an output path is required unless --in-place is used")

        if args.in_place:
            with tempfile.TemporaryDirectory(prefix="ignatius_atlas_reforge_") as temp:
                staging_root = Path(temp) / ("resources" if source.is_dir() else source.name)
                if source.is_dir():
                    stats = _reforge_directory(
                        source,
                        staging_root,
                        padding=args.padding,
                        bleed_radius=args.bleed_radius,
                        max_dimension=args.max_dimension,
                    )
                else:
                    stats = [
                        reforge_manifest(
                            source,
                            staging_root,
                            padding=args.padding,
                            bleed_radius=args.bleed_radius,
                            max_dimension=args.max_dimension,
                        )
                    ]
                verification = _verify_output(source, staging_root)
                _replace_in_place(staging_root, source)
        else:
            assert args.output is not None
            output = args.output.resolve()
            # A source directory expects an output directory; a single source
            # manifest expects a JSON destination. Avoid creating surprising
            # trees from a typo.
            if source.is_dir() and output.suffix.lower() == ".json":
                raise ReforgeError("directory sources require a directory output")
            if not source.is_dir() and output.suffix.lower() != ".json":
                raise ReforgeError("JSON sources require a .json output")
            if source.is_dir() and _is_relative_to(output, source):
                raise ReforgeError(
                    "output directory must not be inside the source tree; use --in-place for replacement"
                )
            if source.is_dir():
                output.mkdir(parents=True, exist_ok=True)
                stats = _reforge_directory(
                    source,
                    output,
                    padding=args.padding,
                    bleed_radius=args.bleed_radius,
                    max_dimension=args.max_dimension,
                )
            else:
                stats = [
                    reforge_manifest(
                        source,
                        output,
                        padding=args.padding,
                        bleed_radius=args.bleed_radius,
                        max_dimension=args.max_dimension,
                    )
                ]
            verification = _verify_output(source, output)

        if args.report:
            args.report.parent.mkdir(parents=True, exist_ok=True)
            args.report.write_text(
                json.dumps(_report_payload(stats), indent=2) + "\n", encoding="utf-8"
            )
        _print_summary(stats, verification)
        return 0
    except ReforgeError as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
