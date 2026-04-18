from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

### SOURCE AND INDEX ###

INPUT_FILENAME_TEMPLATE = "enemy_fighters_{index}.png"
INPUT_FIRST_INDEX = 11
INPUT_LAST_INDEX = 13
INPUT_NUM_COLUMNS = None  # Optional
TARGET_SIZE = 128
FRAME_PAD = 4
INNER_SIZE = TARGET_SIZE - FRAME_PAD * 2

GRID_THRESHOLDS = [96, 80, 64, 48, 32, 24, 16, 12, 8, 6, 5, 4, 3, 2, 1]
MIN_COL_RUN = 40
MIN_ROW_RUN = 60
CELL_PAD_X = 12
CELL_PAD_Y = 18
CROP_ALPHA_THRESH = 8
ALIGN_ALPHA_THRESH = 24
ERODE_ITERATIONS = 1
SEARCH_RADIUS = 10
CORE_ALPHA_THRESH = 0.35
EDGE_ALPHA_THRESH = 0.08


def contiguous_runs(projection: np.ndarray, min_len: int) -> list[tuple[int, int]]:
    indices = np.flatnonzero(projection > 0)
    if indices.size == 0:
        return []

    runs: list[tuple[int, int]] = []
    start = prev = int(indices[0])
    for cur in indices[1:]:
        cur = int(cur)
        if cur == prev + 1:
            prev = cur
            continue
        if prev - start + 1 >= min_len:
            runs.append((start, prev))
        start = prev = cur

    if prev - start + 1 >= min_len:
        runs.append((start, prev))
    return runs


def peak_segments(projection: np.ndarray, count: int, min_gap: int, pad: int) -> list[tuple[int, int]]:
    work = projection.astype(np.float32).copy()
    segments: list[tuple[int, int]] = []
    for _ in range(count):
        peak = int(np.argmax(work))
        if work[peak] <= 0:
            break
        left = peak
        while left > 0 and work[left - 1] > 0:
            left -= 1
        right = peak
        while right + 1 < work.size and work[right + 1] > 0:
            right += 1
        segments.append((left, right))
        kill_left = max(0, left - min_gap)
        kill_right = min(work.size, right + min_gap + 1)
        work[kill_left:kill_right] = 0
    if len(segments) != count:
        raise RuntimeError("Could not infer atlas structure from alpha projection")
    segments.sort()
    return [(max(0, s - pad), min(projection.size - 1, e + pad)) for s, e in segments]


def peak_centers(projection: np.ndarray, min_sep: int, min_prominence: float) -> list[int]:
    work = projection.astype(np.float32).copy()
    centers: list[int] = []
    limit = float(work.max()) * float(min_prominence)
    while True:
        peak = int(np.argmax(work))
        if work[peak] <= limit:
            break
        centers.append(peak)
        kill_left = max(0, peak - min_sep)
        kill_right = min(work.size, peak + min_sep + 1)
        work[kill_left:kill_right] = 0
    centers.sort()
    return centers


def detect_grid(alpha: np.ndarray) -> tuple[list[tuple[int, int]], list[tuple[int, int]], int]:
    best: tuple[list[tuple[int, int]], list[tuple[int, int]], int] | None = None
    for thr in GRID_THRESHOLDS:
        active = alpha >= thr
        col_runs = contiguous_runs(active.sum(axis=0), MIN_COL_RUN)
        row_runs = contiguous_runs(active.sum(axis=1), MIN_ROW_RUN)
        if len(row_runs) == 2 and len(col_runs) >= 3:
            return col_runs, row_runs, thr
        if len(row_runs) == 2 and len(col_runs) > 0:
            if best is None or len(col_runs) > len(best[0]):
                best = (col_runs, row_runs, thr)
    if best is not None:
        return best
    active = alpha >= 1
    col_proj = active.sum(axis=0)
    row_proj = active.sum(axis=1)
    row_runs = peak_segments(row_proj, 2, min_gap=40, pad=8)
    if len(row_runs) != 2:
        raise RuntimeError("Could not infer atlas rows from alpha projection")
    row_masks = []
    for y0, y1 in row_runs:
        band = alpha[y0 : y1 + 1, :]
        band_score = band.max(axis=0)
        band_score = np.array(Image.fromarray(band_score.astype(np.uint8), mode="L").filter(ImageFilter.GaussianBlur(4.0)))
        row_masks.append(band_score)

    combined_score = row_masks[0].astype(np.float32) + row_masks[1].astype(np.float32)
    centers = peak_centers(combined_score, min_sep=max(42, alpha.shape[1] // 20), min_prominence=0.22)
    if len(centers) < 2:
        raise RuntimeError("Could not infer atlas structure from alpha projection")
    centers = sorted(centers)
    gaps = [b - a for a, b in zip(centers, centers[1:])]
    step = int(round(float(np.median(gaps)))) if gaps else max(64, alpha.shape[1] // max(1, len(centers)))
    half_width = max(24, int(round(step * 0.40)))
    col_runs = []
    for c in centers:
        x0 = max(0, c - half_width)
        x1 = min(alpha.shape[1] - 1, c + half_width)
        col_runs.append((x0, x1))
    return col_runs, row_runs, 1


def fallback_nine_columns(width: int) -> list[tuple[int, int]]:
    centers = np.linspace(width * 0.09, width * 0.88, 7)
    step = float(centers[1] - centers[0]) if len(centers) > 1 else width / 7.0
    half_width = int(round(step * 0.42))
    runs = []
    for c in centers:
        c = int(round(c))
        runs.append((max(0, c - half_width), min(width - 1, c + half_width)))
    return runs


def expand_box(box: tuple[int, int, int, int], pad_x: int, pad_y: int, width: int, height: int) -> tuple[int, int, int, int]:
    x0, y0, x1, y1 = box
    return (
        max(0, x0 - pad_x),
        max(0, y0 - pad_y),
        min(width, x1 + pad_x),
        min(height, y1 + pad_y),
    )


def centered_bounds(center: float, size: int, limit: int) -> tuple[int, int]:
    start = int(round(center - size / 2.0))
    start = max(0, min(limit - size, start))
    return start, start + size


def bbox_from_mask(mask: np.ndarray) -> tuple[int, int, int, int]:
    ys, xs = np.nonzero(mask)
    if xs.size == 0:
        return 0, 0, mask.shape[1], mask.shape[0]
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def bbox_center(mask: np.ndarray) -> tuple[float, float]:
    x0, y0, x1, y1 = bbox_from_mask(mask)
    return (x0 + x1) / 2.0, (y0 + y1) / 2.0


def center_of_mass(mask: np.ndarray) -> tuple[float, float]:
    total = float(mask.sum())
    if total <= 0.0:
        return mask.shape[1] / 2.0, mask.shape[0] / 2.0
    ys, xs = np.indices(mask.shape, dtype=np.float32)
    return float((xs * mask).sum() / total), float((ys * mask).sum() / total)


def erode_mask(mask: np.ndarray, iterations: int = 1) -> np.ndarray:
    img = Image.fromarray((mask.astype(np.uint8) * 255), mode="L")
    for _ in range(iterations):
        img = img.filter(ImageFilter.MinFilter(3))
    return np.array(img, dtype=np.uint8) > 0


def resize_rgba(arr: np.ndarray, size: tuple[int, int]) -> np.ndarray:
    img = Image.fromarray(arr, mode="RGBA").resize(size, Image.Resampling.LANCZOS)
    return np.array(img, dtype=np.uint8)


def resize_mask(mask: np.ndarray, size: tuple[int, int]) -> np.ndarray:
    img = Image.fromarray((mask.astype(np.uint8) * 255), mode="L").resize(size, Image.Resampling.LANCZOS)
    return np.array(img, dtype=np.float32) / 255.0


def blur_mask(mask: np.ndarray, radius: float) -> np.ndarray:
    img = Image.fromarray(np.clip(mask * 255.0, 0, 255).astype(np.uint8), mode="L")
    img = img.filter(ImageFilter.GaussianBlur(radius))
    return np.array(img, dtype=np.float32) / 255.0


def rgba_to_gray(arr: np.ndarray) -> np.ndarray:
    rgb = arr[..., :3].astype(np.float32)
    alpha = arr[..., 3].astype(np.float32) / 255.0
    gray = rgb @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    gray *= alpha
    img = Image.fromarray(np.clip(gray, 0, 255).astype(np.uint8), mode="L")
    img = img.filter(ImageFilter.GaussianBlur(0.8))
    return np.array(img, dtype=np.float32)


def place_on_canvas(sprite: np.ndarray, offset_x: int, offset_y: int) -> np.ndarray:
    canvas = np.zeros((TARGET_SIZE, TARGET_SIZE, 4), dtype=np.uint8)
    h, w = sprite.shape[:2]

    dx0 = max(0, offset_x)
    dy0 = max(0, offset_y)
    dx1 = min(TARGET_SIZE, offset_x + w)
    dy1 = min(TARGET_SIZE, offset_y + h)
    if dx1 <= dx0 or dy1 <= dy0:
        return canvas

    sx0 = dx0 - offset_x
    sy0 = dy0 - offset_y
    sx1 = sx0 + (dx1 - dx0)
    sy1 = sy0 + (dy1 - dy0)
    canvas[dy0:dy1, dx0:dx1] = sprite[sy0:sy1, sx0:sx1]
    return canvas


def score_shift(
    gray_a: np.ndarray,
    mask_a: np.ndarray,
    gray_b: np.ndarray,
    mask_b: np.ndarray,
    dx: int,
    dy: int,
) -> float:
    h, w = gray_a.shape
    x0a = max(0, dx)
    y0a = max(0, dy)
    x1a = min(w, w + dx)
    y1a = min(h, h + dy)
    x0b = max(0, -dx)
    y0b = max(0, -dy)
    x1b = x0b + (x1a - x0a)
    y1b = y0b + (y1a - y0a)

    overlap = mask_a[y0a:y1a, x0a:x1a] * mask_b[y0b:y1b, x0b:x1b]
    weight = float(overlap.sum())
    if weight <= 1e-6:
        return float("inf")

    diff = np.abs(gray_a[y0a:y1a, x0a:x1a] - gray_b[y0b:y1b, x0b:x1b])
    return float((diff * overlap).sum() / weight)


def best_shift(
    gray_a: np.ndarray,
    mask_a: np.ndarray,
    gray_b: np.ndarray,
    mask_b: np.ndarray,
    radius: int,
) -> tuple[int, int, float]:
    best_dx = 0
    best_dy = 0
    best_score = float("inf")
    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            score = score_shift(gray_a, mask_a, gray_b, mask_b, dx, dy)
            if score < best_score:
                best_score = score
                best_dx = dx
                best_dy = dy
    return best_dx, best_dy, best_score


def build_pair_sprite(
    top_rgba: np.ndarray,
    bottom_rgba: np.ndarray,
) -> tuple[np.ndarray, np.ndarray, dict[str, float]]:
    top_crop_mask = top_rgba[..., 3] >= CROP_ALPHA_THRESH
    bottom_crop_mask = bottom_rgba[..., 3] >= CROP_ALPHA_THRESH
    union_crop_mask = top_crop_mask | bottom_crop_mask
    crop_box = expand_box(
        bbox_from_mask(union_crop_mask),
        CELL_PAD_X,
        CELL_PAD_Y,
        top_rgba.shape[1],
        top_rgba.shape[0],
    )
    x0, y0, x1, y1 = crop_box

    top_crop = top_rgba[y0:y1, x0:x1]
    bottom_crop = bottom_rgba[y0:y1, x0:x1]
    top_mask_src = erode_mask(top_crop[..., 3] >= ALIGN_ALPHA_THRESH, ERODE_ITERATIONS)
    bottom_mask_src = erode_mask(bottom_crop[..., 3] >= ALIGN_ALPHA_THRESH, ERODE_ITERATIONS)

    crop_w = x1 - x0
    crop_h = y1 - y0
    scale = min(1.0, INNER_SIZE / max(crop_w, crop_h))
    scaled_size = (
        max(1, int(round(crop_w * scale))),
        max(1, int(round(crop_h * scale))),
    )

    top_scaled = resize_rgba(top_crop, scaled_size)
    bottom_scaled = resize_rgba(bottom_crop, scaled_size)
    top_mask = resize_mask(top_mask_src, scaled_size)
    bottom_mask = resize_mask(bottom_mask_src, scaled_size)

    stable_mask = np.minimum(top_mask, bottom_mask)
    if float(stable_mask.sum()) <= 1e-6:
        stable_mask = np.maximum(top_mask, bottom_mask)
    stable_core = erode_mask(stable_mask > CORE_ALPHA_THRESH, 1)
    if float(stable_core.sum()) <= 1e-6:
        stable_core = stable_mask > 0.2

    # Trim away the fuzzy fringe so nearby ships do not leak into the crop.
    top_cut = blur_mask(top_mask > EDGE_ALPHA_THRESH, 0.8)
    bottom_cut = blur_mask(bottom_mask > EDGE_ALPHA_THRESH, 0.8)
    stable_soft = np.maximum(top_cut, bottom_cut)
    stable_soft = np.clip(stable_soft * 1.2, 0.0, 1.0)

    if float(stable_core.sum()) <= 16.0:
        raise RuntimeError("Could not isolate a stable ship core from the source atlas")

    anchor_x, anchor_y = bbox_center(stable_core)
    center_x = TARGET_SIZE / 2.0
    center_y = TARGET_SIZE / 2.0
    base_offset_x = int(round(center_x - anchor_x))
    base_offset_y = int(round(center_y - anchor_y))

    top_gray = rgba_to_gray(top_scaled)
    bottom_gray = rgba_to_gray(bottom_scaled)
    shift_dx, shift_dy, shift_score = best_shift(
        top_gray, stable_core.astype(np.float32), bottom_gray, stable_core.astype(np.float32), SEARCH_RADIUS
    )

    top_scaled[..., 3] = np.clip(top_scaled[..., 3].astype(np.float32) * stable_soft, 0, 255).astype(np.uint8)
    bottom_scaled[..., 3] = np.clip(bottom_scaled[..., 3].astype(np.float32) * stable_soft, 0, 255).astype(np.uint8)
    a_canvas = place_on_canvas(top_scaled, base_offset_x, base_offset_y)
    b_canvas = place_on_canvas(bottom_scaled, base_offset_x + shift_dx, base_offset_y + shift_dy)

    return a_canvas, b_canvas, {
        "scale": scale,
        "offset_x": float(base_offset_x),
        "offset_y": float(base_offset_y),
        "shift_dx": float(shift_dx),
        "shift_dy": float(shift_dy),
        "shift_score": float(shift_score),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Split input into 128x128 aligned sprite frames."
    )
    return parser.parse_args()


def main() -> int:
    parse_args()
    for input_index in range(INPUT_FIRST_INDEX, INPUT_LAST_INDEX + 1):
        source = Path(__file__).with_name(
            INPUT_FILENAME_TEMPLATE.format(index=input_index)
        )
        if not source.exists():
            print(f"skip: missing {source.name}")
            continue

        outdir = source.parent
        outdir.mkdir(parents=True, exist_ok=True)

        atlas = np.array(Image.open(source).convert("RGBA"), dtype=np.uint8)
        alpha = atlas[..., 3]
        col_runs, row_runs, grid_thr = detect_grid(alpha)

        print(f"source: {source.name}")
        print(f"grid threshold: {grid_thr}")
        print(f"columns: {col_runs}")
        print(f"rows: {row_runs}")

        if source.name == "enemy_fighters_9.png" and len(col_runs) < 3:
            print("note: applying fallback 7-slot split for enemy_fighters_9.png")
            col_runs = fallback_nine_columns(atlas.shape[1])
            print(f"fallback columns: {col_runs}")

        if INPUT_NUM_COLUMNS is not None and len(col_runs) != INPUT_NUM_COLUMNS:
            raise RuntimeError(
                f"Expected {INPUT_NUM_COLUMNS} columns but detected {len(col_runs)}"
            )

        row_height = max((row[1] - row[0] + 1) for row in row_runs) + 2 * CELL_PAD_Y
        output_start_index = input_index * 100

        if row_height <= 0:
            raise RuntimeError(f"Invalid row height detected for {source.name}")

        for column_index, col_run in enumerate(col_runs, start=output_start_index):
            col_width = (col_run[1] - col_run[0] + 1) + 2 * CELL_PAD_X
            col_center = (col_run[0] + col_run[1] + 1) / 2.0
            x0, x1 = centered_bounds(col_center, col_width, atlas.shape[1])

            top_run = row_runs[0]
            bottom_run = row_runs[1]
            top_center = (top_run[0] + top_run[1] + 1) / 2.0
            bottom_center = (bottom_run[0] + bottom_run[1] + 1) / 2.0
            top_y0, top_y1 = centered_bounds(top_center, row_height, atlas.shape[0])
            bottom_y0, bottom_y1 = centered_bounds(bottom_center, row_height, atlas.shape[0])

            top_rgba = atlas[top_y0:top_y1, x0:x1]
            bottom_rgba = atlas[bottom_y0:bottom_y1, x0:x1]

            if top_rgba.size == 0 or bottom_rgba.size == 0:
                raise RuntimeError(f"Empty crop detected for {source.name} column {column_index}")
            if top_rgba.shape != bottom_rgba.shape:
                raise RuntimeError(
                    f"Row crop mismatch for {source.name} column {column_index}: "
                    f"{top_rgba.shape} vs {bottom_rgba.shape}"
                )

            sprite_a, sprite_b, info = build_pair_sprite(top_rgba, bottom_rgba)

            path_a = outdir / f"Enemy_{column_index:05d}a.png"
            path_b = outdir / f"Enemy_{column_index:05d}b.png"
            Image.fromarray(sprite_a, mode="RGBA").save(path_a)
            Image.fromarray(sprite_b, mode="RGBA").save(path_b)

            print(
                f"{column_index:05d}: {path_a.name}, {path_b.name} "
                f"scale={info['scale']:.3f} shift=({int(info['shift_dx'])}, {int(info['shift_dy'])}) "
                f"score={info['shift_score']:.2f}"
            )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
