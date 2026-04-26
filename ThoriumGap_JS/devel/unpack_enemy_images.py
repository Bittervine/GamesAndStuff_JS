from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

# Requested tuning parameters. Keep the original names, typos included, so they
# are easy to adjust later without hunting through the code.
MIN_WIDTH = 64
MIN_HEIGH = 64
MAX_GAP_TRANSPARANCY = 0.001
MIN_GAP_WIDTH = 10
INPUT_FILE = "enemy_fighters_19d.png"
OUTPUT_FILE = "Enemy_019"
OUTPUT_FIILE_STARTINDEX = 0
EXPECTED_IMAGE_COUNT = 12
SATURATION_THRESHOLDS = [x / 1000.0 for x in range(10, 151, 5)]

OUTPUT_EXTENSION = ".png"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Split a transparency-separated atlas into individual images."
    )
    parser.add_argument("--input", default=INPUT_FILE, help="Input atlas file stem or filename.")
    parser.add_argument("--output", default=OUTPUT_FILE, help="Output filename prefix.")
    parser.add_argument("--start-index", type=int, default=OUTPUT_FIILE_STARTINDEX, help="First output index.")
    parser.add_argument("--expected-count", type=int, default=EXPECTED_IMAGE_COUNT, help="Expected number of extracted images.")
    return parser.parse_args()


def resolve_input_path(stem: str) -> Path:
    path = Path(__file__).with_name(stem)
    if path.suffix:
      return path
    png_path = path.with_suffix(".png")
    if png_path.exists():
        return png_path
    return path


def load_rgba(path: Path) -> np.ndarray:
    return np.array(Image.open(path).convert("RGBA"), dtype=np.uint8)


def alpha_to_mask(alpha: np.ndarray) -> np.ndarray:
    normalized = alpha.astype(np.float32) / 255.0
    return normalized > MAX_GAP_TRANSPARANCY


def saturation_map(rgb: np.ndarray) -> np.ndarray:
    rgb = rgb.astype(np.float32) / 255.0
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    sat = np.zeros_like(mx, dtype=np.float32)
    nonzero = mx > 1e-6
    sat[nonzero] = (mx[nonzero] - mn[nonzero]) / mx[nonzero]
    return sat


def close_small_gaps(mask: np.ndarray) -> np.ndarray:
    if MIN_GAP_WIDTH <= 1:
        return mask.copy()
    kernel_size = max(1, int(MIN_GAP_WIDTH) | 1)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
    work = (mask.astype(np.uint8)) * 255
    closed = cv2.morphologyEx(work, cv2.MORPH_CLOSE, kernel)
    return closed > 0


def bbox_from_mask(mask: np.ndarray) -> tuple[int, int, int, int]:
    ys, xs = np.nonzero(mask)
    if xs.size == 0:
        return 0, 0, 0, 0
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def extract_components_from_mask(mask: np.ndarray) -> list[dict[str, object]]:
    remaining = mask.copy()
    extracted: list[dict[str, object]] = []

    while remaining.any():
        closed = close_small_gaps(remaining)
        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(
            closed.astype(np.uint8), connectivity=8
        )
        if num_labels <= 1:
            break

        current_round: list[dict[str, object]] = []
        for label in range(1, num_labels):
            component_closed = labels == label
            component_original = remaining & component_closed
            if not component_original.any():
                continue

            x0, y0, x1, y1 = bbox_from_mask(component_original)
            width = x1 - x0
            height = y1 - y0
            area = int(component_original.sum())
            current_round.append(
                {
                    "label": label,
                    "mask": component_original,
                    "x0": x0,
                    "y0": y0,
                    "x1": x1,
                    "y1": y1,
                    "width": width,
                    "height": height,
                    "area": area,
                    "top": int(stats[label, cv2.CC_STAT_TOP]),
                    "left": int(stats[label, cv2.CC_STAT_LEFT]),
                }
            )

        if not current_round:
            break

        current_round.sort(key=lambda item: (item["top"], item["left"], -item["area"]))
        for item in current_round:
            mask = item["mask"]
            remaining[mask] = False
            extracted.append(item)

    return extracted


def choose_components(atlas: np.ndarray) -> tuple[list[dict[str, object]], str]:
    alpha = atlas[..., 3]
    if int(alpha.min()) != int(alpha.max()):
        alpha_components = extract_components_from_mask(alpha_to_mask(alpha))
        alpha_components = [
            item
            for item in alpha_components
            if int(item["width"]) >= MIN_WIDTH and int(item["height"]) >= MIN_HEIGH
        ]
        if len(alpha_components) == EXPECTED_IMAGE_COUNT:
            return alpha_components, f"alpha>{MAX_GAP_TRANSPARANCY}"

    sat = saturation_map(atlas[..., :3])
    for threshold in SATURATION_THRESHOLDS:
        components = extract_components_from_mask(sat >= threshold)
        components = [
            item
            for item in components
            if int(item["width"]) >= MIN_WIDTH and int(item["height"]) >= MIN_HEIGH
        ]
        if len(components) == EXPECTED_IMAGE_COUNT:
            return components, f"saturation>={threshold:.3f}"

    best: tuple[int, int, list[dict[str, object]], str] | None = None
    for threshold in SATURATION_THRESHOLDS:
        components = extract_components_from_mask(sat >= threshold)
        components = [
            item
            for item in components
            if int(item["width"]) >= MIN_WIDTH and int(item["height"]) >= MIN_HEIGH
        ]
        score = abs(len(components) - EXPECTED_IMAGE_COUNT)
        label = f"saturation>={threshold:.3f}"
        if best is None or score < best[0]:
            best = (score, len(components), components, label)
    if best is None:
        raise RuntimeError("Could not derive any components from the atlas")
    return best[2], best[3]


def save_crops(atlas: np.ndarray, components: list[dict[str, object]], outdir: Path) -> int:
    def center_on_square(rgba: np.ndarray) -> np.ndarray:
        h, w = rgba.shape[:2]
        side = max(w, h)
        square = np.zeros((side, side, 4), dtype=np.uint8)
        ox = (side - w) // 2
        oy = (side - h) // 2
        square[oy:oy + h, ox:ox + w] = rgba
        return square

    saved = 0
    out_index = OUTPUT_FIILE_STARTINDEX
    for item in components:
        width = int(item["width"])
        height = int(item["height"])
        if width < MIN_WIDTH or height < MIN_HEIGH:
            print(
                f"skip: component {saved + 1} too small "
                f"({width}x{height}, need at least {MIN_WIDTH}x{MIN_HEIGH})"
            )
            continue

        x0 = int(item["x0"])
        y0 = int(item["y0"])
        x1 = int(item["x1"])
        y1 = int(item["y1"])
        crop = atlas[y0:y1, x0:x1].copy()
        square = center_on_square(crop)
        out_path = outdir / f"{OUTPUT_FILE}{out_index:02d}{OUTPUT_EXTENSION}"
        Image.fromarray(square, mode="RGBA").save(out_path)
        print(
            f"saved {out_path.name} from bbox ({x0}, {y0})-({x1}, {y1}) "
            f"as centered square {square.shape[1]}x{square.shape[0]}"
        )
        saved += 1
        out_index += 1
    return saved


def main() -> int:
    args = parse_args()
    global INPUT_FILE, OUTPUT_FILE, OUTPUT_FIILE_STARTINDEX, EXPECTED_IMAGE_COUNT
    INPUT_FILE = args.input
    OUTPUT_FILE = args.output
    OUTPUT_FIILE_STARTINDEX = args.start_index
    EXPECTED_IMAGE_COUNT = args.expected_count

    source = resolve_input_path(INPUT_FILE)
    if not source.exists():
        raise FileNotFoundError(f"Missing input atlas: {source.name}")

    atlas = load_rgba(source)
    outdir = source.parent

    components, mode = choose_components(atlas)
    print(f"segmentation mode: {mode}")
    saved = save_crops(atlas, components, outdir)

    print(f"finished: saved {saved} images from {source.name}")
    if saved != EXPECTED_IMAGE_COUNT:
        print(
            f"warning: expected {EXPECTED_IMAGE_COUNT} images, got {saved}. "
            "Tune MIN_GAP_WIDTH / MAX_GAP_TRANSPARANCY if needed."
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
