#!/usr/bin/env python3
"""Verify that atlas reforging preserves every defined frame's visible pixels.

The atlas JSON is authoritative.  A rebuilt atlas may move frames and may change
RGB values of pixels that remain fully transparent (for example, alpha-safe RGB
edge dilation), but it must preserve:

* the complete set of defined frame names;
* each frame's width and height;
* every alpha value inside every frame; and
* RGB exactly wherever either corresponding pixel is visible (alpha > 0).

This intentionally checks defined frames whether or not any current object,
character, animation, or level references them.  Unused-but-authored frames are
therefore protected for future use.

Examples:

    # One atlas pair.  PNG paths are read from each JSON's ``image`` field.
    python reference/devel/verify_atlas_rect_pixels.py \
        old/at_atlas_037.json new/at_atlas_037.json

    # Explicit PNG overrides for a single JSON pair.
    python reference/devel/verify_atlas_rect_pixels.py \
        old/atlas.json new/atlas.json \
        --original-image old/source.png --rebuilt-image new/repacked.png

    # Mirrored directory trees.  Every atlas manifest below the original root
    # must exist at the same relative path below the rebuilt root.
    python reference/devel/verify_atlas_rect_pixels.py old/resources new/resources

Exit status is 0 only when every checked atlas/frame is equivalent under the
rules above.
"""
from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

try:
    import numpy as np
    from PIL import Image, UnidentifiedImageError
except ImportError as exc:  # pragma: no cover - exercised only on missing deps
    raise SystemExit(
        "verify_atlas_rect_pixels.py requires Pillow and NumPy. "
        "Install them with: python -m pip install Pillow numpy"
    ) from exc


@dataclass(frozen=True)
class FrameRect:
    name: str
    x: int
    y: int
    w: int
    h: int

    @property
    def box(self) -> tuple[int, int, int, int]:
        return (self.x, self.y, self.x + self.w, self.y + self.h)


@dataclass(frozen=True)
class AtlasManifest:
    path: Path
    image_path: Path
    frames: dict[str, FrameRect]


@dataclass
class VerificationStats:
    manifests: int = 0
    frames: int = 0
    frame_pixels: int = 0
    visible_pixels: int = 0

    def add(self, other: "VerificationStats") -> None:
        self.manifests += other.manifests
        self.frames += other.frames
        self.frame_pixels += other.frame_pixels
        self.visible_pixels += other.visible_pixels


class VerificationError(RuntimeError):
    pass


def _load_json(path: Path) -> dict:
    try:
        with path.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
    except FileNotFoundError as exc:
        raise VerificationError(f"manifest not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise VerificationError(f"invalid JSON in {path}: {exc}") from exc
    if not isinstance(data, dict):
        raise VerificationError(f"atlas manifest root must be an object: {path}")
    return data


def _require_int(frame_name: str, field: str, value: object, path: Path) -> int:
    # bool is an int subclass, but accepting true/false as coordinates would hide
    # malformed atlas data.
    if isinstance(value, bool) or not isinstance(value, int):
        raise VerificationError(
            f"frame {frame_name!r} field {field!r} must be an integer in {path}"
        )
    return value


def load_manifest(path: Path, image_override: Path | None = None) -> AtlasManifest:
    path = path.resolve()
    data = _load_json(path)
    frames_data = data.get("frames")
    if not isinstance(frames_data, dict):
        raise VerificationError(f"atlas manifest has no object 'frames': {path}")

    image_value = data.get("image")
    if image_override is None:
        if not isinstance(image_value, str) or not image_value.strip():
            raise VerificationError(f"atlas manifest has no usable 'image' path: {path}")
        image_path = (path.parent / image_value).resolve()
    else:
        image_path = image_override.resolve()

    frames: dict[str, FrameRect] = {}
    for name, raw in frames_data.items():
        if not isinstance(name, str) or not name:
            raise VerificationError(f"atlas contains an invalid frame name in {path}")
        if not isinstance(raw, dict):
            raise VerificationError(f"frame {name!r} must be an object in {path}")
        try:
            x = _require_int(name, "x", raw["x"], path)
            y = _require_int(name, "y", raw["y"], path)
            w = _require_int(name, "w", raw["w"], path)
            h = _require_int(name, "h", raw["h"], path)
        except KeyError as exc:
            raise VerificationError(
                f"frame {name!r} is missing field {exc.args[0]!r} in {path}"
            ) from exc
        # Existing authored atlases contain a few legacy rectangles that begin
        # just outside the bitmap or extend a pixel past its edge.  Preserve
        # those coordinates: Pillow crop semantics pad the absent source area
        # with transparent black, which gives the verifier a stable logical
        # w x h frame to compare after repacking.
        if w <= 0 or h <= 0:
            raise VerificationError(
                f"frame {name!r} has invalid rectangle x={x} y={y} w={w} h={h} in {path}"
            )
        frames[name] = FrameRect(name=name, x=x, y=y, w=w, h=h)

    return AtlasManifest(path=path, image_path=image_path, frames=frames)


def _open_rgba(path: Path) -> Image.Image:
    try:
        image = Image.open(path)
        image.load()
    except FileNotFoundError as exc:
        raise VerificationError(f"atlas image not found: {path}") from exc
    except (UnidentifiedImageError, OSError) as exc:
        raise VerificationError(f"could not decode atlas image {path}: {exc}") from exc
    return image.convert("RGBA")


def _format_first_mismatch(mask: np.ndarray) -> str:
    points = np.argwhere(mask)
    if points.size == 0:
        return ""
    y, x = points[0]
    return f" at frame pixel ({int(x)}, {int(y)})"


def verify_manifest_pair(
    original: AtlasManifest,
    rebuilt: AtlasManifest,
    *,
    max_reported_frame_errors: int = 20,
) -> VerificationStats:
    original_names = set(original.frames)
    rebuilt_names = set(rebuilt.frames)
    missing = sorted(original_names - rebuilt_names)
    extra = sorted(rebuilt_names - original_names)
    if missing or extra:
        details: list[str] = []
        if missing:
            details.append("missing rebuilt frames: " + ", ".join(missing))
        if extra:
            details.append("unexpected rebuilt frames: " + ", ".join(extra))
        raise VerificationError(
            f"frame set differs between {original.path} and {rebuilt.path}: "
            + "; ".join(details)
        )

    size_errors = []
    for name in original.frames:
        source = original.frames[name]
        target = rebuilt.frames[name]
        if source.w != target.w or source.h != target.h:
            size_errors.append(
                f"{name}: {source.w}x{source.h} -> {target.w}x{target.h}"
            )
    if size_errors:
        raise VerificationError(
            f"frame dimensions changed between {original.path} and {rebuilt.path}: "
            + "; ".join(size_errors[:max_reported_frame_errors])
            + (
                f"; ... {len(size_errors) - max_reported_frame_errors} more"
                if len(size_errors) > max_reported_frame_errors
                else ""
            )
        )

    with _open_rgba(original.image_path) as original_image, _open_rgba(
        rebuilt.image_path
    ) as rebuilt_image:
        stats = VerificationStats(manifests=1)
        frame_errors: list[str] = []

        # Preserve manifest order in diagnostics.  This also means deliberately
        # authored-but-unused frames are checked just like currently referenced
        # ones; usage is never consulted here.
        for name, source in original.frames.items():
            target = rebuilt.frames[name]
            source_pixels = np.asarray(
                original_image.crop(source.box), dtype=np.uint8
            )
            target_pixels = np.asarray(
                rebuilt_image.crop(target.box), dtype=np.uint8
            )

            source_alpha = source_pixels[..., 3]
            target_alpha = target_pixels[..., 3]
            alpha_diff = source_alpha != target_alpha

            # A future reforger is allowed to fill hidden RGB under alpha==0.
            # Everywhere either side is visible, however, RGB remains exact.
            visible = (source_alpha != 0) | (target_alpha != 0)
            rgb_diff = np.any(
                source_pixels[..., :3] != target_pixels[..., :3], axis=2
            ) & visible

            alpha_count = int(np.count_nonzero(alpha_diff))
            rgb_count = int(np.count_nonzero(rgb_diff))
            if alpha_count or rgb_count:
                fragments = [name]
                if alpha_count:
                    fragments.append(
                        f"alpha differs at {alpha_count} pixel(s)"
                        + _format_first_mismatch(alpha_diff)
                    )
                if rgb_count:
                    fragments.append(
                        f"visible RGB differs at {rgb_count} pixel(s)"
                        + _format_first_mismatch(rgb_diff)
                    )
                frame_errors.append(": ".join((fragments[0], "; ".join(fragments[1:]))))

            stats.frames += 1
            stats.frame_pixels += source.w * source.h
            stats.visible_pixels += int(np.count_nonzero(source_alpha))

        if frame_errors:
            shown = frame_errors[:max_reported_frame_errors]
            suffix = ""
            if len(frame_errors) > len(shown):
                suffix = f"\n  ... {len(frame_errors) - len(shown)} more frame(s) differ"
            raise VerificationError(
                f"visible-pixel verification failed for {original.path}:\n  "
                + "\n  ".join(shown)
                + suffix
            )

        return stats


def _looks_like_atlas_manifest(path: Path) -> bool:
    try:
        data = _load_json(path)
    except VerificationError:
        return False
    return isinstance(data.get("frames"), dict) and isinstance(data.get("image"), str)


def discover_atlas_manifests(root: Path) -> list[Path]:
    return sorted(
        path
        for path in root.rglob("*.json")
        if path.is_file() and _looks_like_atlas_manifest(path)
    )


def verify_directory_pair(
    original_root: Path,
    rebuilt_root: Path,
    *,
    max_reported_frame_errors: int = 20,
) -> VerificationStats:
    original_root = original_root.resolve()
    rebuilt_root = rebuilt_root.resolve()
    originals = discover_atlas_manifests(original_root)
    rebuilt_manifests = discover_atlas_manifests(rebuilt_root)

    original_rel = {path.relative_to(original_root): path for path in originals}
    rebuilt_rel = {path.relative_to(rebuilt_root): path for path in rebuilt_manifests}

    missing = sorted(set(original_rel) - set(rebuilt_rel), key=str)
    extra = sorted(set(rebuilt_rel) - set(original_rel), key=str)
    if missing or extra:
        details: list[str] = []
        if missing:
            details.append(
                "missing rebuilt manifests: " + ", ".join(str(path) for path in missing)
            )
        if extra:
            details.append(
                "unexpected rebuilt manifests: " + ", ".join(str(path) for path in extra)
            )
        raise VerificationError("atlas manifest set differs: " + "; ".join(details))

    if not originals:
        raise VerificationError(f"no atlas manifests found below {original_root}")

    total = VerificationStats()
    for relative in sorted(original_rel, key=str):
        original = load_manifest(original_rel[relative])
        rebuilt = load_manifest(rebuilt_rel[relative])
        total.add(
            verify_manifest_pair(
                original,
                rebuilt,
                max_reported_frame_errors=max_reported_frame_errors,
            )
        )
    return total


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Verify that a rebuilt atlas preserves all defined frame rectangles' "
            "alpha and visible RGB pixels."
        )
    )
    parser.add_argument(
        "original",
        type=Path,
        help="original atlas JSON, or a root directory containing atlas manifests",
    )
    parser.add_argument(
        "rebuilt",
        type=Path,
        help="rebuilt atlas JSON, or a mirrored root directory",
    )
    parser.add_argument(
        "--original-image",
        type=Path,
        help="override the original JSON's image path (single-file mode only)",
    )
    parser.add_argument(
        "--rebuilt-image",
        type=Path,
        help="override the rebuilt JSON's image path (single-file mode only)",
    )
    parser.add_argument(
        "--max-reported-frame-errors",
        type=int,
        default=20,
        help="maximum differing frame diagnostics to print per atlas (default: 20)",
    )
    return parser


def main(argv: Iterable[str] | None = None) -> int:
    args = _parser().parse_args(list(argv) if argv is not None else None)
    if args.max_reported_frame_errors <= 0:
        print("error: --max-reported-frame-errors must be positive", file=sys.stderr)
        return 2

    original = args.original
    rebuilt = args.rebuilt
    if original.is_dir() != rebuilt.is_dir():
        print("error: original and rebuilt must both be JSON files or both be directories", file=sys.stderr)
        return 2

    try:
        if original.is_dir():
            if args.original_image is not None or args.rebuilt_image is not None:
                raise VerificationError(
                    "--original-image/--rebuilt-image are only valid in single-file mode"
                )
            stats = verify_directory_pair(
                original,
                rebuilt,
                max_reported_frame_errors=args.max_reported_frame_errors,
            )
        else:
            original_manifest = load_manifest(original, args.original_image)
            rebuilt_manifest = load_manifest(rebuilt, args.rebuilt_image)
            stats = verify_manifest_pair(
                original_manifest,
                rebuilt_manifest,
                max_reported_frame_errors=args.max_reported_frame_errors,
            )
    except VerificationError as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1

    print(
        "PASS: "
        f"{stats.manifests} atlas manifest(s), "
        f"{stats.frames} defined frame(s), "
        f"{stats.frame_pixels:,} frame pixel(s), "
        f"{stats.visible_pixels:,} visible pixel(s) preserved"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
