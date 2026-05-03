from PIL import Image
import numpy as np
import cv2

# Algorithm overview:
# 1) Load white-matte and black-matte renders of the same subject.
# 2) Build edge-feature maps and estimate global subpixel translation
#    (phase correlation), then refine translation with ECC.
# 3) Resample the black-matte render into white-matte coordinates and
#    compute a validity mask for in-bounds samples.
# 4) Estimate actual matte background colors from border pixels
#    (important for JPEGs where white is not exactly 255).
# 5) Solve per-pixel alpha from the two compositing equations:
#      W = A*F + (1-A)*Wbg
#      B = A*F + (1-A)*Bbg
# 6) Calibrate background alpha bias and clamp tiny alpha noise.
# 7) Solve foreground color F (using both equations for stability),
#    combine with alpha, and save RGBA PNG.
#
# Build RGBA from two renders of the same subject:
# one over white background and one over black background.
WHITE_PATH = r"A_white.jpg"
BLACK_PATH = r"A_black.jpg"
OUT_PATH = r"A_transparent.png"

EPS = 1e-6
ALPHA_FLOOR = 1.0 / 255.0


def load_rgb(path):
    """Load an image file as float32 RGB array."""
    return np.asarray(Image.open(path).convert("RGB"), dtype=np.float32)


def edge_feature(rgb):
    """Create a smoothed edge-magnitude feature map for alignment."""
    gray = cv2.cvtColor(rgb.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32) / 255.0
    gray = cv2.GaussianBlur(gray, (0, 0), 1.0)
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    mag = cv2.magnitude(gx, gy)
    mag = cv2.GaussianBlur(mag, (0, 0), 1.0)
    return mag


def place_center(img, h, w):
    """Center an image inside a zero-padded (h, w) canvas."""
    ih, iw = img.shape[:2]
    out = np.zeros((h, w) + img.shape[2:], dtype=img.dtype)
    y0 = (h - ih) // 2
    x0 = (w - iw) // 2
    out[y0:y0 + ih, x0:x0 + iw] = img
    return out, x0, y0


def estimate_translation(white_rgb, black_rgb):
    """Estimate subpixel translation between white and black renders."""
    wh, ww = white_rgb.shape[:2]
    bh, bw = black_rgb.shape[:2]

    h = max(wh, bh)
    w = max(ww, bw)

    ew = edge_feature(white_rgb)
    eb = edge_feature(black_rgb)

    ew_c, wx0, wy0 = place_center(ew[..., None], h, w)
    eb_c, bx0, by0 = place_center(eb[..., None], h, w)
    ew_c = ew_c[..., 0]
    eb_c = eb_c[..., 0]

    # Shift that best aligns black-edge map to white-edge map.
    (sx, sy), _ = cv2.phaseCorrelate(eb_c, ew_c)

    # Convert centered-canvas shift to original image sample offset.
    dx = float((bx0 - wx0) - sx)
    dy = float((by0 - wy0) - sy)
    return dx, dy


def sample_black_to_white(black_rgb, wh, ww, dx, dy):
    """Resample black render into white-render coordinates using translation."""
    m = np.array([[1.0, 0.0, dx], [0.0, 1.0, dy]], dtype=np.float32)
    aligned = cv2.warpAffine(
        black_rgb,
        m,
        (ww, wh),
        flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(0, 0, 0),
    )

    # Build a validity mask for pixels that come from real source data.
    ones = np.ones(black_rgb.shape[:2], dtype=np.float32)
    valid = cv2.warpAffine(
        ones,
        m,
        (ww, wh),
        flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=0.0,
    )
    return aligned, valid > 0.999


def estimate_background_rgb(img_rgb, border=24):
    """Estimate matte color from border pixels (median per channel)."""
    h, w = img_rgb.shape[:2]
    b = int(max(1, min(border, h // 4, w // 4)))
    m = np.zeros((h, w), dtype=bool)
    m[:b, :] = True
    m[-b:, :] = True
    m[:, :b] = True
    m[:, -b:] = True
    vals = img_rgb[m].reshape(-1, 3)
    return np.median(vals, axis=0).astype(np.float32)


def refine_translation_ecc(white_rgb, black_rgb, dx_init, dy_init):
    """Refine translation using ECC optimization on edge features."""
    wh, ww = white_rgb.shape[:2]

    ew = edge_feature(white_rgb)
    eb = edge_feature(black_rgb)

    warp = np.array([[1.0, 0.0, dx_init], [0.0, 1.0, dy_init]], dtype=np.float32)
    criteria = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6)

    try:
        # Start from phase-correlation estimate and improve it iteratively.
        _, warp = cv2.findTransformECC(
            ew,
            eb,
            warp,
            cv2.MOTION_TRANSLATION,
            criteria,
            None,
            5,
        )
    except cv2.error:
        pass

    aligned, valid = sample_black_to_white(black_rgb, wh, ww, float(warp[0, 2]), float(warp[1, 2]))
    return aligned, valid, float(warp[0, 2]), float(warp[1, 2])


def solve_rgba(white_rgb, black_aligned, valid_mask, white_bg_rgb, black_bg_rgb):
    """Solve alpha + foreground color from black/white matte equations."""
    bg_span = np.maximum(white_bg_rgb - black_bg_rgb, 1.0)[None, None, :]
    alpha_rgb = 1.0 - (white_rgb - black_aligned) / bg_span

    # Median over channels reduces color-channel compression noise.
    alpha = np.median(alpha_rgb, axis=2)
    alpha = np.clip(alpha, 0.0, 1.0)

    # Remove background alpha bias caused by imperfect matte/JPEG artifacts.
    h, w = alpha.shape
    b = int(max(1, min(24, h // 4, w // 4)))
    border = np.zeros_like(alpha, dtype=bool)
    border[:b, :] = True
    border[-b:, :] = True
    border[:, :b] = True
    border[:, -b:] = True
    border &= valid_mask
    if np.any(border):
        bg_bias = float(np.percentile(alpha[border], 95))
        if bg_bias > 0.0:
            alpha = np.clip((alpha - bg_bias) / max(1.0 - bg_bias, EPS), 0.0, 1.0)

    alpha[alpha < ALPHA_FLOOR] = 0.0
    alpha[~valid_mask] = 0.0

    a = np.maximum(alpha, EPS)[..., None]

    # Solve foreground from both equations and blend for better stability.
    c_from_black = (black_aligned - (1.0 - alpha[..., None]) * black_bg_rgb[None, None, :]) / a
    c_from_white = (white_rgb - (1.0 - alpha[..., None]) * white_bg_rgb[None, None, :]) / a

    w_black = np.clip(alpha[..., None], 0.0, 1.0)
    w_white = np.clip(alpha[..., None], 0.0, 1.0)
    rgb = (w_black * c_from_black + w_white * c_from_white) / np.maximum(w_black + w_white, EPS)

    # Guard against unstable unpremultiply in near-transparent pixels.
    low = alpha < 0.03
    rgb[low] = 0.0

    rgb = np.clip(rgb, 0, 255)
    rgba = np.dstack([rgb, alpha[..., None] * 255.0]).astype(np.uint8)
    return rgba


def main():
    """Run full pipeline: load, align, solve RGBA, and save output."""
    white = load_rgb(WHITE_PATH)
    black = load_rgb(BLACK_PATH)
    white_bg = estimate_background_rgb(white)
    black_bg = estimate_background_rgb(black)

    dx0, dy0 = estimate_translation(white, black)
    aligned, valid, dx, dy = refine_translation_ecc(white, black, dx0, dy0)

    rgba = solve_rgba(white, aligned, valid, white_bg, black_bg)
    Image.fromarray(rgba, "RGBA").save(OUT_PATH)

    print(f"Estimated white matte RGB: {white_bg.tolist()}")
    print(f"Estimated black matte RGB: {black_bg.tolist()}")
    print(f"Estimated translation white->black sample offset: dx={dx:.3f}, dy={dy:.3f}")
    print(f"Saved: {OUT_PATH}")


if __name__ == "__main__":
    main()
