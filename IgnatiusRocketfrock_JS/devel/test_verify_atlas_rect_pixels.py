#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
import sys
from pathlib import Path

from PIL import Image

SCRIPT_PATH = Path(__file__).with_name("verify_atlas_rect_pixels.py")
SPEC = importlib.util.spec_from_file_location("verify_atlas_rect_pixels", SCRIPT_PATH)
assert SPEC is not None and SPEC.loader is not None
verifier = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = verifier
SPEC.loader.exec_module(verifier)


def write_manifest(path: Path, image: str, frames: dict[str, dict[str, int]]) -> None:
    path.write_text(
        json.dumps({"atlasId": path.stem, "image": image, "frames": frames}, indent=2)
        + "\n",
        encoding="utf-8",
    )


class AtlasRectPixelVerifierTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tempdir = tempfile.TemporaryDirectory()
        self.root = Path(self.tempdir.name)
        self.old = self.root / "old"
        self.new = self.root / "new"
        self.old.mkdir()
        self.new.mkdir()

    def tearDown(self) -> None:
        self.tempdir.cleanup()

    def _base_pair(self) -> tuple[Path, Path]:
        old_image = Image.new("RGBA", (6, 4), (3, 4, 5, 0))
        old_image.putpixel((1, 1), (10, 20, 30, 255))
        old_image.putpixel((2, 1), (40, 50, 60, 127))
        old_image.putpixel((4, 2), (70, 80, 90, 255))
        old_image.save(self.old / "atlas.png")

        # Repack the two frames to different coordinates while preserving their
        # dimensions and decoded pixels.
        new_image = Image.new("RGBA", (8, 5), (111, 112, 113, 0))
        frame_a = old_image.crop((0, 0, 3, 3))
        frame_b = old_image.crop((3, 1, 6, 4))
        new_image.paste(frame_b, (0, 0))
        new_image.paste(frame_a, (4, 2))
        new_image.save(self.new / "atlas.png")

        old_json = self.old / "atlas.json"
        new_json = self.new / "atlas.json"
        write_manifest(
            old_json,
            "atlas.png",
            {
                "defined_but_unused": {"x": 0, "y": 0, "w": 3, "h": 3},
                "contained_or_overlap_safe": {"x": 3, "y": 1, "w": 3, "h": 3},
            },
        )
        write_manifest(
            new_json,
            "atlas.png",
            {
                "defined_but_unused": {"x": 4, "y": 2, "w": 3, "h": 3},
                "contained_or_overlap_safe": {"x": 0, "y": 0, "w": 3, "h": 3},
            },
        )
        return old_json, new_json

    def test_repacked_frames_pass(self) -> None:
        old_json, new_json = self._base_pair()
        stats = verifier.verify_manifest_pair(
            verifier.load_manifest(old_json), verifier.load_manifest(new_json)
        )
        self.assertEqual(stats.frames, 2)
        self.assertEqual(stats.visible_pixels, 3)

    def test_hidden_rgb_dilation_is_allowed(self) -> None:
        old_json, new_json = self._base_pair()
        with Image.open(self.new / "atlas.png") as image:
            changed = image.convert("RGBA")
        # Frame A's source pixel (0,0) is fully transparent.  Change hidden RGB
        # at its rebuilt location while keeping alpha zero.
        changed.putpixel((4, 2), (222, 33, 44, 0))
        changed.save(self.new / "atlas.png")
        verifier.verify_manifest_pair(
            verifier.load_manifest(old_json), verifier.load_manifest(new_json)
        )

    def test_visible_rgb_change_fails(self) -> None:
        old_json, new_json = self._base_pair()
        with Image.open(self.new / "atlas.png") as image:
            changed = image.convert("RGBA")
        # Old frame-A visible pixel (1,1) moved to rebuilt (5,3).
        changed.putpixel((5, 3), (11, 20, 30, 255))
        changed.save(self.new / "atlas.png")
        with self.assertRaisesRegex(verifier.VerificationError, "visible RGB differs"):
            verifier.verify_manifest_pair(
                verifier.load_manifest(old_json), verifier.load_manifest(new_json)
            )

    def test_alpha_change_fails(self) -> None:
        old_json, new_json = self._base_pair()
        with Image.open(self.new / "atlas.png") as image:
            changed = image.convert("RGBA")
        changed.putpixel((5, 3), (10, 20, 30, 254))
        changed.save(self.new / "atlas.png")
        with self.assertRaisesRegex(verifier.VerificationError, "alpha differs"):
            verifier.verify_manifest_pair(
                verifier.load_manifest(old_json), verifier.load_manifest(new_json)
            )

    def test_missing_defined_frame_fails_even_if_unused(self) -> None:
        old_json, new_json = self._base_pair()
        data = json.loads(new_json.read_text(encoding="utf-8"))
        del data["frames"]["defined_but_unused"]
        new_json.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        with self.assertRaisesRegex(verifier.VerificationError, "missing rebuilt frames"):
            verifier.verify_manifest_pair(
                verifier.load_manifest(old_json), verifier.load_manifest(new_json)
            )

    def test_frame_dimension_change_fails(self) -> None:
        old_json, new_json = self._base_pair()
        data = json.loads(new_json.read_text(encoding="utf-8"))
        data["frames"]["defined_but_unused"]["w"] = 2
        new_json.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        with self.assertRaisesRegex(verifier.VerificationError, "frame dimensions changed"):
            verifier.verify_manifest_pair(
                verifier.load_manifest(old_json), verifier.load_manifest(new_json)
            )

    def test_out_of_bounds_source_frame_can_be_repacked_inside_image(self) -> None:
        old_image = Image.new("RGBA", (2, 2), (0, 0, 0, 0))
        old_image.putpixel((0, 0), (9, 8, 7, 255))
        old_image.save(self.old / "atlas.png")
        new_image = Image.new("RGBA", (3, 2), (0, 0, 0, 0))
        # Logical source frame x=-1,w=2 is [transparent OOB, source x=0].
        new_image.putpixel((2, 0), (9, 8, 7, 255))
        new_image.save(self.new / "atlas.png")
        old_json = self.old / "atlas.json"
        new_json = self.new / "atlas.json"
        write_manifest(old_json, "atlas.png", {"legacy": {"x": -1, "y": 0, "w": 2, "h": 1}})
        write_manifest(new_json, "atlas.png", {"legacy": {"x": 1, "y": 0, "w": 2, "h": 1}})
        verifier.verify_manifest_pair(
            verifier.load_manifest(old_json), verifier.load_manifest(new_json)
        )

    def test_directory_mode_verifies_mirrored_tree(self) -> None:
        self._base_pair()
        stats = verifier.verify_directory_pair(self.old, self.new)
        self.assertEqual(stats.manifests, 1)
        self.assertEqual(stats.frames, 2)


if __name__ == "__main__":
    unittest.main()
