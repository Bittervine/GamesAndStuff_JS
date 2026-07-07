#!/usr/bin/env python3
"""Repack at_atlas_005..014 into larger non-overlapping atlases and update frames.

Strategy:
- Find opaque connected components in each PNG.
- Assign each component to the nearest/most-overlapping existing frame from the JSON.
- Crop each frame to the union of its assigned component masks.
- Pack the resulting sprites into a larger replacement atlas with spacing.
- Update the JSON frame rectangles and translate node coordinates by the crop delta.

This is intentionally conservative: only frame rectangles and node coordinates are
updated. Object ids, tags, lines, pivots, etc. remain unchanged.
"""
from __future__ import annotations

import json
import math
import os
from collections import OrderedDict, deque
from copy import deepcopy
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
from PIL import Image

ATLAS_RANGE = range(5, 15)
ALPHA_THRESHOLD = 1
MIN_COMPONENT_PIXELS = 4
PADDING = 20
GAP_X = 32
GAP_Y = 32
TARGET_WIDTH = 2048

@dataclass
class Component:
    bbox: Tuple[int, int, int, int]  # x1,y1,x2,y2 exclusive
    count: int
    mask_coords: np.ndarray  # Nx2 rows of y,x


def load_json(path: Path):
    with path.open('r', encoding='utf-8') as f:
        return json.load(f, object_pairs_hook=OrderedDict)


def save_json(path: Path, data):
    with path.open('w', encoding='utf-8', newline='\n') as f:
        json.dump(data, f, indent=2)
        f.write('\n')


def find_components(alpha: np.ndarray) -> List[Component]:
    mask = alpha >= ALPHA_THRESHOLD
    h, w = mask.shape
    visited = np.zeros_like(mask, dtype=bool)
    components: List[Component] = []
    dirs = ((1, 0), (-1, 0), (0, 1), (0, -1))
    for y in range(h):
        xs = np.where(mask[y] & (~visited[y]))[0]
        for x in xs:
            if visited[y, x] or not mask[y, x]:
                continue
            q = deque([(x, y)])
            visited[y, x] = True
            pts = []
            minx = maxx = x
            miny = maxy = y
            while q:
                cx, cy = q.popleft()
                pts.append((cy, cx))
                if cx < minx:
                    minx = cx
                if cx > maxx:
                    maxx = cx
                if cy < miny:
                    miny = cy
                if cy > maxy:
                    maxy = cy
                for dx, dy in dirs:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < w and 0 <= ny < h and mask[ny, nx] and not visited[ny, nx]:
                        visited[ny, nx] = True
                        q.append((nx, ny))
            if len(pts) >= MIN_COMPONENT_PIXELS:
                components.append(Component((minx, miny, maxx + 1, maxy + 1), len(pts), np.array(pts, dtype=np.int32)))
    return components


def rect_center(rect):
    return ((rect['x'] + rect['w'] / 2.0), (rect['y'] + rect['h'] / 2.0))


def overlap_area(b1, b2):
    x1 = max(b1[0], b2[0])
    y1 = max(b1[1], b2[1])
    x2 = min(b1[2], b2[2])
    y2 = min(b1[3], b2[3])
    if x2 <= x1 or y2 <= y1:
        return 0
    return (x2 - x1) * (y2 - y1)


def point_rect_distance_sq(px, py, rect):
    rx1, ry1, rw, rh = rect['x'], rect['y'], rect['w'], rect['h']
    rx2, ry2 = rx1 + rw, ry1 + rh
    dx = 0
    if px < rx1:
        dx = rx1 - px
    elif px > rx2:
        dx = px - rx2
    dy = 0
    if py < ry1:
        dy = ry1 - py
    elif py > ry2:
        dy = py - ry2
    return dx * dx + dy * dy


def assign_components(frames: OrderedDict, components: List[Component]) -> Dict[str, List[Component]]:
    assigned: Dict[str, List[Component]] = {name: [] for name in frames.keys()}
    frame_items = list(frames.items())
    for comp in components:
        bbox = comp.bbox
        best_name = None
        best_score = None
        cx = (bbox[0] + bbox[2]) / 2.0
        cy = (bbox[1] + bbox[3]) / 2.0
        for name, fr in frame_items:
            ov = overlap_area(bbox, (fr['x'], fr['y'], fr['x'] + fr['w'], fr['y'] + fr['h']))
            if ov > 0:
                # Prefer overlap heavily, then larger overlap ratio.
                area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
                score = (0, -ov / max(1, area), -ov)  # lower is better
            else:
                dist_sq = point_rect_distance_sq(cx, cy, fr)
                score = (1, dist_sq, 0)
            if best_score is None or score < best_score:
                best_score = score
                best_name = name
        assigned[best_name].append(comp)
    return assigned


def union_bbox(comps: List[Component], fallback_rect):
    if not comps:
        return (fallback_rect['x'], fallback_rect['y'], fallback_rect['x'] + fallback_rect['w'], fallback_rect['y'] + fallback_rect['h'])
    minx = min(c.bbox[0] for c in comps)
    miny = min(c.bbox[1] for c in comps)
    maxx = max(c.bbox[2] for c in comps)
    maxy = max(c.bbox[3] for c in comps)
    return (int(minx), int(miny), int(maxx), int(maxy))


def crop_masked_sprite(rgba: np.ndarray, bbox, comps: List[Component]):
    x1, y1, x2, y2 = bbox
    crop = np.zeros((y2 - y1, x2 - x1, 4), dtype=np.uint8)
    if not comps:
        crop[:, :, :] = rgba[y1:y2, x1:x2, :]
        return crop
    for comp in comps:
        ys = comp.mask_coords[:, 0]
        xs = comp.mask_coords[:, 1]
        crop[ys - y1, xs - x1, :] = rgba[ys, xs, :]
    return crop


def pack_sprites(sprites: List[Tuple[str, np.ndarray]]) -> Tuple[Dict[str, Tuple[int, int]], Tuple[int, int]]:
    # Preserve original order. Simple shelf pack.
    x = PADDING
    y = PADDING
    row_h = 0
    placements: Dict[str, Tuple[int, int]] = {}
    max_w = TARGET_WIDTH
    for name, sprite in sprites:
        h, w = sprite.shape[0], sprite.shape[1]
        if x + w + PADDING > max_w and x > PADDING:
            x = PADDING
            y += row_h + GAP_Y
            row_h = 0
        placements[name] = (x, y)
        x += w + GAP_X
        row_h = max(row_h, h)
    total_h = y + row_h + PADDING
    return placements, (max_w, total_h)


def repack_atlas(base_dir: Path, atlas_no: int):
    png_path = base_dir / 'assets' / f'at_atlas_{atlas_no:03d}.png'
    json_path = base_dir / 'assets' / f'at_atlas_{atlas_no:03d}.json'
    data = load_json(json_path)
    frames: OrderedDict = data['frames']
    objects: OrderedDict = data['objects']

    img = Image.open(png_path).convert('RGBA')
    rgba = np.array(img)
    alpha = rgba[:, :, 3]

    if len(frames) == 1:
        # Single full-image assets stay as-is, but normalize tiny crop if obvious and preserve full asset for background/ledge.
        return {
            'atlas': atlas_no,
            'changed': False,
            'image_size': img.size,
            'frame_count': 1,
            'note': 'single-asset atlas left unchanged',
        }

    comps = find_components(alpha)
    assigned = assign_components(frames, comps)

    sprites = []
    crop_meta = {}
    diagnostics = []
    for name, fr in frames.items():
        frame_comps = assigned.get(name, [])
        bbox = union_bbox(frame_comps, fr)
        sprite = crop_masked_sprite(rgba, bbox, frame_comps)
        sprites.append((name, sprite))
        crop_meta[name] = {'old': deepcopy(fr), 'bbox': bbox, 'components': len(frame_comps)}
        diagnostics.append((name, len(frame_comps), bbox, (fr['x'], fr['y'], fr['x'] + fr['w'], fr['y'] + fr['h'])))

    placements, new_size = pack_sprites(sprites)
    canvas = np.zeros((new_size[1], new_size[0], 4), dtype=np.uint8)

    new_frames = OrderedDict()
    new_objects = deepcopy(objects)

    for name, sprite in sprites:
        px, py = placements[name]
        sh, sw = sprite.shape[0], sprite.shape[1]
        canvas[py:py + sh, px:px + sw, :] = np.maximum(canvas[py:py + sh, px:px + sw, :], sprite)
        new_frames[name] = OrderedDict([('x', int(px)), ('y', int(py)), ('w', int(sw)), ('h', int(sh))])
        old = crop_meta[name]['old']
        bbox = crop_meta[name]['bbox']
        dx = old['x'] - bbox[0]
        dy = old['y'] - bbox[1]
        obj = new_objects[name]
        if obj.get('nodes'):
            for node in obj['nodes']:
                node['x'] = int(node['x'] + dx)
                node['y'] = int(node['y'] + dy)

    data['frames'] = new_frames
    data['objects'] = new_objects

    Image.fromarray(canvas, 'RGBA').save(png_path)
    save_json(json_path, data)

    return {
        'atlas': atlas_no,
        'changed': True,
        'image_size': tuple(map(int, new_size)),
        'frame_count': len(frames),
        'diagnostics': diagnostics,
    }


def main():
    base_dir = Path(__file__).resolve().parents[1]
    results = []
    for atlas_no in ATLAS_RANGE:
        results.append(repack_atlas(base_dir, atlas_no))
    out_path = base_dir / 'devel' / 'atlas_repack_report.json'
    save_json(out_path, results)
    for result in results:
        print(f"at_atlas_{result['atlas']:03d}: {result['image_size']} frames={result['frame_count']} changed={result['changed']}")


if __name__ == '__main__':
    main()
