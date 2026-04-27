from __future__ import annotations

import argparse
import re
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


FILENAME_REGEX = re.compile(r"^Enemy_00\d{3}a\.png$", re.IGNORECASE)
MODEL_NAME = "RealESRGAN_x4plus_anime_6B"
MODEL_URL = (
    "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/"
    "RealESRGAN_x4plus_anime_6B.pth"
)


class DependencyError(RuntimeError):
    pass


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "AI-upscale Enemy_00XXXa.png files to 512x512 with preserved alpha "
            "(transparent background)."
        )
    )
    parser.add_argument(
        "--assets-dir",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "assets",
        help="Directory containing Enemy_00XXXa.png files.",
    )
    parser.add_argument(
        "--pattern",
        default="Enemy_00*a.png",
        help="Glob pattern for candidate files inside assets dir.",
    )
    parser.add_argument(
        "--target-size",
        type=int,
        default=512,
        help="Target output size in pixels (square canvas).",
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=None,
        help="Output directory. Defaults to an 'out' subfolder inside assets dir.",
    )
    parser.add_argument(
        "--alpha-interpolation",
        choices=["lanczos", "cubic", "nearest"],
        default="lanczos",
        help="Interpolation used for alpha channel upscaling.",
    )
    parser.add_argument(
        "--cpu",
        action="store_true",
        help="Force CPU inference (slower).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="List what would be processed without writing files.",
    )
    return parser.parse_args()


def load_realesrgan(force_cpu: bool):
    try:
        import torch
        from basicsr.archs.rrdbnet_arch import RRDBNet
        from basicsr.utils.download_util import load_file_from_url
        from realesrgan import RealESRGANer
    except Exception as exc:
        raise DependencyError(
            "Missing dependencies. Install with:\n"
            "  c:/Portable/WinPython/python/python.exe -m pip install "
            "torch torchvision --index-url https://download.pytorch.org/whl/cpu\n"
            "  c:/Portable/WinPython/python/python.exe -m pip install realesrgan basicsr "
            "facexlib gfpgan"
        ) from exc

    model_dir = Path(__file__).resolve().parent / "models"
    model_dir.mkdir(parents=True, exist_ok=True)
    model_path = load_file_from_url(
        url=MODEL_URL,
        model_dir=str(model_dir),
        progress=True,
        file_name=f"{MODEL_NAME}.pth",
    )

    model = RRDBNet(
        num_in_ch=3,
        num_out_ch=3,
        num_feat=64,
        num_block=6,
        num_grow_ch=32,
        scale=4,
    )

    use_half = (not force_cpu) and torch.cuda.is_available()
    device = "cpu" if force_cpu or not torch.cuda.is_available() else None

    upsampler = RealESRGANer(
        scale=4,
        model_path=model_path,
        model=model,
        tile=0,
        tile_pad=10,
        pre_pad=0,
        half=use_half,
        gpu_id=None,
        device=device,
    )
    return upsampler


def alpha_interp_mode(name: str) -> int:
    if name == "nearest":
        return cv2.INTER_NEAREST
    if name == "cubic":
        return cv2.INTER_CUBIC
    return cv2.INTER_LANCZOS4


def list_targets(assets_dir: Path, pattern: str, target_size: int) -> list[Path]:
    files = sorted(assets_dir.glob(pattern))
    out: list[Path] = []
    for path in files:
        if not FILENAME_REGEX.match(path.name):
            continue
        with Image.open(path) as img:
            w, h = img.size
        if w == target_size and h == target_size:
            continue
        out.append(path)
    return out


def upscale_rgba(
    img: Image.Image,
    upsampler,
    target_size: int,
    alpha_interp: int,
) -> Image.Image:
    rgba = np.array(img.convert("RGBA"), dtype=np.uint8)
    rgb = rgba[..., :3]
    alpha = rgba[..., 3]

    h, w = rgb.shape[:2]
    if max(h, w) <= 0:
        raise ValueError("Invalid image size")

    outscale = float(target_size) / float(max(h, w))
    rgb_bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    up_bgr, _ = upsampler.enhance(rgb_bgr, outscale=outscale)
    up_rgb = cv2.cvtColor(up_bgr, cv2.COLOR_BGR2RGB)

    out_h, out_w = up_rgb.shape[:2]
    alpha_up = cv2.resize(alpha, (out_w, out_h), interpolation=alpha_interp)

    out = np.dstack([up_rgb, alpha_up]).astype(np.uint8)

    if out_w != target_size or out_h != target_size:
        scale = min(target_size / out_w, target_size / out_h)
        resized_w = max(1, int(round(out_w * scale)))
        resized_h = max(1, int(round(out_h * scale)))
        out = cv2.resize(out, (resized_w, resized_h), interpolation=cv2.INTER_LANCZOS4)
        canvas = np.zeros((target_size, target_size, 4), dtype=np.uint8)
        ox = (target_size - resized_w) // 2
        oy = (target_size - resized_h) // 2
        canvas[oy : oy + resized_h, ox : ox + resized_w] = out
        out = canvas

    return Image.fromarray(out, mode="RGBA")


def main() -> int:
    args = parse_args()

    assets_dir = args.assets_dir.resolve()
    if not assets_dir.exists():
        raise FileNotFoundError(f"assets directory not found: {assets_dir}")

    targets = list_targets(assets_dir, args.pattern, args.target_size)
    if not targets:
        print("No matching non-512 files found.")
        return 0

    out_dir = (args.out_dir or (assets_dir / "out")).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"Found {len(targets)} files to upscale.")
    for p in targets:
        print(f"  - {p.name}")

    if args.dry_run:
        print("Dry run complete. No files written.")
        return 0

    upsampler = load_realesrgan(force_cpu=args.cpu)
    alpha_interp = alpha_interp_mode(args.alpha_interpolation)

    for idx, src in enumerate(targets, start=1):
        dst = out_dir / src.name
        with Image.open(src) as im:
            out_im = upscale_rgba(
                img=im,
                upsampler=upsampler,
                target_size=args.target_size,
                alpha_interp=alpha_interp,
            )
            out_im.save(dst, format="PNG")
        print(f"[{idx}/{len(targets)}] saved {dst}")

    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
