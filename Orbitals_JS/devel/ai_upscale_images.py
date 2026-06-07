from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


MODELS = {
    "x4plus": {
        "name": "RealESRGAN_x4plus",
        "url": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth",
        "num_block": 23,
    },
    "anime6b": {
        "name": "RealESRGAN_x4plus_anime_6B",
        "url": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth",
        "num_block": 6,
    },
}


class DependencyError(RuntimeError):
    pass


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "AI-upscale PNG files with preserved alpha "
            "(transparent background)."
        )
    )
    parser.add_argument(
        "--assets-dir",
        type=Path,
        default=Path(__file__).resolve().parent,
        help="Directory containing source PNG files.",
    )
    parser.add_argument(
        "--pattern",
        default="planet_map_*.png",
        help="Glob pattern for candidate files inside assets dir.",
    )
    parser.add_argument(
        "--scale",
        type=float,
        default=4.0,
        help=(
            "Upscale factor. The Real-ESRGAN model itself is 4x; values above "
            "that will be resized after enhancement."
        ),
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=None,
        help=(
            "Output directory. Defaults to an 'upscaled' subfolder inside "
            "assets dir."
        ),
    )
    parser.add_argument(
        "--alpha-interpolation",
        choices=["lanczos", "cubic", "nearest"],
        default="lanczos",
        help="Interpolation used for alpha channel upscaling.",
    )
    parser.add_argument(
        "--model",
        choices=sorted(MODELS.keys()),
        default="x4plus",
        help="Real-ESRGAN model to use. x4plus is the safer choice for terrain.",
    )
    parser.add_argument(
        "--cpu",
        action="store_true",
        help="Force CPU inference (slower).",
    )
    parser.add_argument(
        "--tile",
        type=int,
        default=256,
        help="Tile size for inference. Smaller values use less memory.",
    )
    parser.add_argument(
        "--tile-pad",
        type=int,
        default=10,
        help="Padding in pixels applied around each tile.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="List what would be processed without writing files.",
    )
    return parser.parse_args()


def load_realesrgan(model_key: str, force_cpu: bool, tile: int, tile_pad: int):
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

    model_info = MODELS[model_key]
    model_dir = Path(__file__).resolve().parent / "models"
    model_dir.mkdir(parents=True, exist_ok=True)
    model_path = load_file_from_url(
        url=model_info["url"],
        model_dir=str(model_dir),
        progress=True,
        file_name=f'{model_info["name"]}.pth',
    )

    model = RRDBNet(
        num_in_ch=3,
        num_out_ch=3,
        num_feat=64,
        num_block=model_info["num_block"],
        num_grow_ch=32,
        scale=4,
    )

    use_half = (not force_cpu) and torch.cuda.is_available()
    device = "cpu" if force_cpu or not torch.cuda.is_available() else None

    upsampler = RealESRGANer(
        scale=4,
        model_path=model_path,
        model=model,
        tile=max(0, tile),
        tile_pad=max(0, tile_pad),
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


def list_targets(assets_dir: Path, pattern: str) -> list[Path]:
    files = sorted(assets_dir.glob(pattern))
    return [path for path in files if path.is_file()]


def upscale_rgba(
    img: Image.Image,
    upsampler,
    scale: float,
    alpha_interp: int,
) -> Image.Image:
    rgba = np.array(img.convert("RGBA"), dtype=np.uint8)
    rgb = rgba[..., :3]
    alpha = rgba[..., 3]

    h, w = rgb.shape[:2]
    if max(h, w) <= 0:
        raise ValueError("Invalid image size")

    rgb_bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    up_bgr, _ = upsampler.enhance(rgb_bgr, outscale=scale)
    up_rgb = cv2.cvtColor(up_bgr, cv2.COLOR_BGR2RGB)

    out_h, out_w = up_rgb.shape[:2]
    alpha_up = cv2.resize(alpha, (out_w, out_h), interpolation=alpha_interp)

    out = np.dstack([up_rgb, alpha_up]).astype(np.uint8)

    return Image.fromarray(out, mode="RGBA")


def main() -> int:
    args = parse_args()

    assets_dir = args.assets_dir.resolve()
    if not assets_dir.exists():
        raise FileNotFoundError(f"assets directory not found: {assets_dir}")

    targets = list_targets(assets_dir, args.pattern)
    if not targets:
        print(f"No matching files found in {assets_dir} for pattern {args.pattern}.")
        return 0

    out_dir = (args.out_dir or (assets_dir / "upscaled")).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"Found {len(targets)} files to upscale.")
    for p in targets:
        print(f"  - {p.name}")

    if args.dry_run:
        print("Dry run complete. No files written.")
        return 0

    upsampler = load_realesrgan(
        model_key=args.model,
        force_cpu=args.cpu,
        tile=args.tile,
        tile_pad=args.tile_pad,
    )
    alpha_interp = alpha_interp_mode(args.alpha_interpolation)

    for idx, src in enumerate(targets, start=1):
        dst = out_dir / src.name
        with Image.open(src) as im:
            out_im = upscale_rgba(
                img=im,
                upsampler=upsampler,
                scale=args.scale,
                alpha_interp=alpha_interp,
            )
            out_im.save(dst, format="PNG")
        print(f"[{idx}/{len(targets)}] saved {dst}")

    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
