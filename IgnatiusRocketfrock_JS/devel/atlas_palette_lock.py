#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
import numpy as np
from PIL import Image

# --- sRGB / OKLab ---------------------------------------------------------
def srgb_to_linear(rgb: np.ndarray) -> np.ndarray:
    rgb = np.asarray(rgb, dtype=np.float32)
    return np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)


def linear_to_srgb(rgb: np.ndarray) -> np.ndarray:
    rgb = np.asarray(rgb, dtype=np.float32)
    return np.clip(
        np.where(
            rgb <= 0.0031308,
            12.92 * rgb,
            1.055 * np.maximum(rgb, 0.0) ** (1.0 / 2.4) - 0.055,
        ),
        0.0,
        1.0,
    )


def linear_rgb_to_oklab(rgb: np.ndarray) -> np.ndarray:
    r, g, b = np.moveaxis(rgb, -1, 0)
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_, m_, s_ = np.cbrt(l), np.cbrt(m), np.cbrt(s)
    L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    return np.stack((L, a, bb), axis=-1)


def oklab_to_linear_rgb(lab: np.ndarray) -> np.ndarray:
    L, a, b = np.moveaxis(lab, -1, 0)
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_**3, m_**3, s_**3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    return np.stack((r, g, bb), axis=-1)


def rgb_to_oklab(rgb: np.ndarray) -> np.ndarray:
    return linear_rgb_to_oklab(srgb_to_linear(rgb))


def oklab_to_rgb(lab: np.ndarray) -> np.ndarray:
    return linear_to_srgb(oklab_to_linear_rgb(lab))


# --- I/O -----------------------------------------------------------------
def load_rgba(path: Path) -> np.ndarray:
    with Image.open(path) as image:
        return np.array(image.convert("RGBA"), dtype=np.uint8)


def save_rgba(path: Path, rgba: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, "RGBA").save(path)


# --- Distribution matching ----------------------------------------------
def fit_samples(
    rgba: np.ndarray,
    alpha_min: int = 224,
    chroma_max: float = 0.26,
    max_samples: int = 350_000,
) -> np.ndarray:
    mask = rgba[..., 3] >= alpha_min
    rgb = rgba[..., :3][mask].astype(np.float32) / 255.0
    lab = rgb_to_oklab(rgb)
    chroma = np.linalg.norm(lab[:, 1:3], axis=1)
    keep = (
        (lab[:, 0] >= 0.035)
        & (lab[:, 0] <= 0.93)
        & (chroma <= chroma_max)
    )
    lab = lab[keep]
    if len(lab) > max_samples:
        indices = np.linspace(0, len(lab) - 1, max_samples, dtype=np.int64)
        lab = lab[indices]
    return lab.astype(np.float64)


def make_quantile_curve(source: np.ndarray, target: np.ndarray, points: int = 1025):
    q = np.linspace(0.0005, 0.9995, points)
    sx = np.quantile(source, q)
    tx = np.quantile(target, q)
    sx, unique_indices = np.unique(sx, return_index=True)
    tx = tx[unique_indices]
    return sx, tx


def apply_curve(values: np.ndarray, sx: np.ndarray, tx: np.ndarray) -> np.ndarray:
    flat = values.reshape(-1)
    mapped = np.interp(flat, sx, tx)
    low = flat < sx[0]
    high = flat > sx[-1]
    if low.any():
        mapped[low] = tx[0] + (flat[low] - sx[0])
    if high.any():
        mapped[high] = tx[-1] + (flat[high] - sx[-1])
    return mapped.reshape(values.shape)


def random_rotation(rng: np.random.Generator) -> np.ndarray:
    matrix = rng.normal(size=(3, 3))
    q, r = np.linalg.qr(matrix)
    signs = np.sign(np.diag(r))
    signs[signs == 0] = 1
    q *= signs
    if np.linalg.det(q) < 0:
        q[:, 0] *= -1
    return q


def sliced_palette_transfer(
    all_lab: np.ndarray,
    source_fit: np.ndarray,
    reference_fit: np.ndarray,
    iterations: int = 8,
) -> np.ndarray:
    rng = np.random.default_rng(20260620)
    transformed = all_lab.astype(np.float64, copy=True)
    moving_fit = source_fit.astype(np.float64, copy=True)

    # Start with identity axes to lock lightness and the two chromatic channels,
    # then use rotated axes to match their joint distribution.
    rotations = [np.eye(3)]
    rotations.extend(random_rotation(rng) for _ in range(max(0, iterations - 1)))

    for rotation in rotations:
        fit_projected = moving_fit @ rotation
        ref_projected = reference_fit @ rotation
        all_projected = transformed @ rotation

        for channel in range(3):
            sx, tx = make_quantile_curve(
                fit_projected[:, channel], ref_projected[:, channel]
            )
            fit_projected[:, channel] = apply_curve(
                fit_projected[:, channel], sx, tx
            )
            all_projected[:, channel] = apply_curve(
                all_projected[:, channel], sx, tx
            )

        moving_fit = fit_projected @ rotation.T
        transformed = all_projected @ rotation.T

    return transformed.astype(np.float32)


def harmonize_rgba(
    source: np.ndarray,
    reference: np.ndarray,
    iterations: int = 8,
    strength: float = 1.0,
) -> np.ndarray:
    source_fit = fit_samples(source)
    reference_fit = fit_samples(reference)

    output = source.copy()
    visible = source[..., 3] > 0
    visible_rgb = source[..., :3][visible].astype(np.float32) / 255.0
    original_lab = rgb_to_oklab(visible_rgb)
    matched_lab = sliced_palette_transfer(
        original_lab, source_fit, reference_fit, iterations=iterations
    )

    # Keep vivid crystals and flames recognizable, but still grade them enough
    # that their glow does not repaint the surrounding rock in the old palette.
    chroma = np.linalg.norm(original_lab[:, 1:3], axis=1)
    accent = np.clip((chroma - 0.20) / 0.18, 0.0, 1.0)
    per_pixel_strength = strength * (1.0 - 0.25 * accent)
    final_lab = original_lab + per_pixel_strength[:, None] * (matched_lab - original_lab)

    graded_rgb = np.rint(oklab_to_rgb(final_lab) * 255.0).astype(np.uint8)
    output[..., :3][visible] = graded_rgb
    return output


# --- Alpha-safe transparent RGB bleed -----------------------------------
def bleed_transparent_rgb(rgba: np.ndarray, radius: int) -> np.ndarray:
    if radius <= 0:
        return rgba.copy()

    height, width, _ = rgba.shape
    rgb = rgba[..., :3].astype(np.float32)
    alpha = rgba[..., 3].astype(np.float32)
    transparent = alpha == 0.0
    accum = np.zeros((height, width, 3), dtype=np.float32)
    weight_sum = np.zeros((height, width), dtype=np.float32)
    sigma = max(radius / 1.5, 0.75)

    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            if dx == 0 and dy == 0:
                continue
            spatial_weight = np.exp(
                -(dx * dx + dy * dy) / (2.0 * sigma * sigma)
            )
            src_y0 = max(0, -dy)
            src_y1 = min(height, height - dy)
            src_x0 = max(0, -dx)
            src_x1 = min(width, width - dx)
            dst_y0 = src_y0 + dy
            dst_y1 = src_y1 + dy
            dst_x0 = src_x0 + dx
            dst_x1 = src_x1 + dx

            source_alpha = alpha[src_y0:src_y1, src_x0:src_x1]
            valid = (
                (source_alpha > 0.0)
                & transparent[dst_y0:dst_y1, dst_x0:dst_x1]
            )
            weights = spatial_weight * (source_alpha / 255.0) * valid
            accum[dst_y0:dst_y1, dst_x0:dst_x1] += (
                rgb[src_y0:src_y1, src_x0:src_x1] * weights[..., None]
            )
            weight_sum[dst_y0:dst_y1, dst_x0:dst_x1] += weights

    output = rgba.copy()
    fillable = transparent & (weight_sum > 0.0)
    filled = np.zeros_like(rgb)
    np.divide(
        accum,
        weight_sum[..., None],
        out=filled,
        where=weight_sum[..., None] > 0.0,
    )
    output[..., :3][fillable] = np.rint(filled[fillable]).astype(np.uint8)
    return output


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--reference", type=Path)
    parser.add_argument("--iterations", type=int, default=8)
    parser.add_argument("--strength", type=float, default=1.0)
    parser.add_argument("--bleed-radius", type=int, default=1)
    args = parser.parse_args()

    source = load_rgba(args.input)
    original_alpha = source[..., 3].copy()
    if args.reference:
        result = harmonize_rgba(
            source,
            load_rgba(args.reference),
            iterations=args.iterations,
            strength=args.strength,
        )
    else:
        result = source.copy()

    result = bleed_transparent_rgb(result, args.bleed_radius)
    if not np.array_equal(result[..., 3], original_alpha):
        raise RuntimeError("Alpha channel changed")
    save_rgba(args.output, result)
    print(f"Saved {args.output}")
    print("Alpha preserved exactly: yes")


if __name__ == "__main__":
    main()
