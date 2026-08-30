#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
import sys
from pathlib import Path

from PIL import Image

SCRIPT_PATH = Path(__file__).with_name("reforge_atlases.py")
SPEC = importlib.util.spec_from_file_location("reforge_atlases", SCRIPT_PATH)
assert SPEC is not None and SPEC.loader is not None
reforger = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = reforger
# The reforger imports the verifier beside itself.
sys.path.insert(0, str(SCRIPT_PATH.parent))
SPEC.loader.exec_module(reforger)


def write_manifest(path: Path, frames: dict[str, dict[str, int]], *, indent: int = 2) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(
            {
                "meta": {"version": 1, "note": "synthetic atlas test"},
                "atlasId": path.stem,
                "image": "atlas.png",
                "frames": frames,
            },
            indent=indent,
        )
        + "\n",
        encoding="utf-8",
    )


class AtlasReforgerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tempdir = tempfile.TemporaryDirectory()
        self.root = Path(self.tempdir.name)
        self.source = self.root / "source"
        self.output = self.root / "output"
        self.source.mkdir()
        self.output.mkdir()

    def tearDown(self) -> None:
        self.tempdir.cleanup()

    def _save(self, image: Image.Image) -> None:
        image.save(self.source / "atlas.png")

    def _verify(self, source_json: Path, output_json: Path) -> None:
        reforger.verifier.verify_manifest_pair(
            reforger.verifier.load_manifest(source_json),
            reforger.verifier.load_manifest(output_json),
        )

    def test_reforge_preserves_all_defined_frames_and_drops_unreferenced_pixels(self) -> None:
        image = Image.new("RGBA", (18, 12), (201, 17, 99, 0))
        image.putpixel((1, 1), (10, 20, 30, 255))
        image.putpixel((12, 8), (40, 50, 60, 180))
        # Visible garbage outside every authored frame must not survive.
        image.putpixel((17, 11), (250, 1, 2, 255))
        self._save(image)
        source_json = self.source / "atlas.json"
        output_json = self.output / "atlas.json"
        write_manifest(
            source_json,
            {
                "defined_but_unused": {"x": 0, "y": 0, "w": 4, "h": 4},
                "used_or_future": {"x": 10, "y": 6, "w": 4, "h": 4},
            },
        )

        stats = reforger.reforge_manifest(source_json, output_json)
        self.assertEqual(stats.frames, 2)
        self.assertEqual(stats.packed_clusters, 2)
        self.assertLess(stats.rebuilt_rgba_bytes, stats.original_rgba_bytes)
        rebuilt = json.loads(output_json.read_text(encoding="utf-8"))
        self.assertEqual(set(rebuilt["frames"]), {"defined_but_unused", "used_or_future"})
        self._verify(source_json, output_json)

        with Image.open(self.output / "atlas.png") as out:
            self.assertNotIn((250, 1, 2, 255), set(out.convert("RGBA").get_flattened_data()))

    def test_exact_duplicate_rectangles_alias_same_target_pixels(self) -> None:
        image = Image.new("RGBA", (8, 8), (0, 0, 0, 0))
        image.putpixel((3, 3), (80, 90, 100, 255))
        self._save(image)
        source_json = self.source / "atlas.json"
        output_json = self.output / "atlas.json"
        frame = {"x": 2, "y": 2, "w": 3, "h": 3}
        write_manifest(source_json, {"axe": frame, "axe_copy": dict(frame)})

        stats = reforger.reforge_manifest(source_json, output_json)
        rebuilt = json.loads(output_json.read_text(encoding="utf-8"))["frames"]
        self.assertEqual(stats.exact_alias_frames, 1)
        self.assertEqual(stats.packed_clusters, 1)
        self.assertEqual(rebuilt["axe"], rebuilt["axe_copy"])
        self._verify(source_json, output_json)

    def test_contained_frame_stays_inside_parent_without_duplicate_storage(self) -> None:
        image = Image.new("RGBA", (14, 7), (0, 0, 0, 0))
        for x in range(2, 12):
            image.putpixel((x, 3), (x, 100, 150, 255))
        self._save(image)
        source_json = self.source / "atlas.json"
        output_json = self.output / "atlas.json"
        write_manifest(
            source_json,
            {
                "parent": {"x": 1, "y": 1, "w": 12, "h": 5},
                "blend_1": {"x": 4, "y": 1, "w": 5, "h": 5},
            },
        )

        stats = reforger.reforge_manifest(source_json, output_json)
        rebuilt = json.loads(output_json.read_text(encoding="utf-8"))["frames"]
        self.assertEqual(stats.contained_rectangles, 1)
        self.assertEqual(stats.packed_clusters, 1)
        self.assertEqual(rebuilt["blend_1"]["x"] - rebuilt["parent"]["x"], 3)
        self.assertEqual(rebuilt["blend_1"]["y"] - rebuilt["parent"]["y"], 0)
        self._verify(source_json, output_json)

    def test_partial_overlap_is_preserved_inside_one_cluster(self) -> None:
        image = Image.new("RGBA", (8, 5), (0, 0, 0, 0))
        for x in range(1, 7):
            image.putpixel((x, 2), (20 * x, 30, 40, 255))
        self._save(image)
        source_json = self.source / "atlas.json"
        output_json = self.output / "atlas.json"
        write_manifest(
            source_json,
            {
                "left": {"x": 0, "y": 0, "w": 5, "h": 5},
                "right": {"x": 3, "y": 0, "w": 5, "h": 5},
            },
        )

        stats = reforger.reforge_manifest(source_json, output_json)
        self.assertEqual(stats.partial_overlap_pairs, 1)
        self.assertEqual(stats.packed_clusters, 1)
        rebuilt = json.loads(output_json.read_text(encoding="utf-8"))["frames"]
        self.assertEqual(rebuilt["right"]["x"] - rebuilt["left"]["x"], 3)
        self.assertEqual(rebuilt["right"]["y"] - rebuilt["left"]["y"], 0)
        self._verify(source_json, output_json)

    def test_padding_receives_nearest_visible_rgb_with_zero_alpha(self) -> None:
        image = Image.new("RGBA", (5, 5), (0, 0, 0, 0))
        # Visible art touches the logical frame's left edge.
        image.putpixel((1, 2), (77, 88, 99, 255))
        self._save(image)
        source_json = self.source / "atlas.json"
        output_json = self.output / "atlas.json"
        write_manifest(source_json, {"sprite": {"x": 1, "y": 1, "w": 3, "h": 3}})

        stats = reforger.reforge_manifest(source_json, output_json, padding=1, bleed_radius=1)
        frame = json.loads(output_json.read_text(encoding="utf-8"))["frames"]["sprite"]
        with Image.open(self.output / "atlas.png") as rebuilt:
            rgba = rebuilt.convert("RGBA")
            outside = rgba.getpixel((frame["x"] - 1, frame["y"] + 1))
            self.assertEqual(outside, (77, 88, 99, 0))
            self.assertEqual(rgba.getpixel((frame["x"], frame["y"] + 1)), (77, 88, 99, 255))
        self.assertGreater(stats.hidden_rgb_pixels_changed, 0)
        self._verify(source_json, output_json)

    def test_out_of_bounds_source_frame_is_repacked_logically(self) -> None:
        image = Image.new("RGBA", (2, 2), (0, 0, 0, 0))
        image.putpixel((0, 0), (9, 8, 7, 255))
        self._save(image)
        source_json = self.source / "atlas.json"
        output_json = self.output / "atlas.json"
        write_manifest(source_json, {"legacy": {"x": -1, "y": 0, "w": 2, "h": 1}})
        reforger.reforge_manifest(source_json, output_json)
        rebuilt = json.loads(output_json.read_text(encoding="utf-8"))["frames"]["legacy"]
        self.assertGreaterEqual(rebuilt["x"], 0)
        self.assertGreaterEqual(rebuilt["y"], 0)
        self._verify(source_json, output_json)


    def test_default_reforge_never_increases_decoded_area(self) -> None:
        image = Image.new("RGBA", (7, 5), (0, 0, 0, 0))
        image.putpixel((0, 0), (11, 22, 33, 255))
        image.putpixel((6, 4), (44, 55, 66, 255))
        self._save(image)
        source_json = self.source / "atlas.json"
        output_json = self.output / "atlas.json"
        write_manifest(
            source_json,
            {
                "full": {"x": 0, "y": 0, "w": 7, "h": 5},
            },
        )
        stats = reforger.reforge_manifest(source_json, output_json)
        self.assertLessEqual(stats.rebuilt_rgba_bytes, stats.original_rgba_bytes)
        self.assertIn(stats.layout_mode, {"source-layout", "source-relative-margin-0"})
        self._verify(source_json, output_json)

    def test_output_is_deterministic(self) -> None:
        image = Image.new("RGBA", (16, 10), (0, 0, 0, 0))
        for point, color in [((1, 1), (1, 2, 3, 255)), ((10, 5), (4, 5, 6, 255))]:
            image.putpixel(point, color)
        self._save(image)
        source_json = self.source / "atlas.json"
        write_manifest(
            source_json,
            {
                "a": {"x": 0, "y": 0, "w": 5, "h": 5},
                "b": {"x": 9, "y": 4, "w": 5, "h": 5},
            },
            indent=4,
        )
        first = self.root / "first" / "atlas.json"
        second = self.root / "second" / "atlas.json"
        reforger.reforge_manifest(source_json, first)
        reforger.reforge_manifest(source_json, second)
        self.assertEqual(first.read_bytes(), second.read_bytes())
        self.assertEqual((first.parent / "atlas.png").read_bytes(), (second.parent / "atlas.png").read_bytes())
        # Preserve the source manifest's indentation convention.
        self.assertIn('\n    "meta"', first.read_text(encoding="utf-8"))

    def test_directory_mode_handles_mirrored_atlas_tree(self) -> None:
        nested = self.source / "resources" / "atlases"
        nested.mkdir(parents=True)
        image = Image.new("RGBA", (6, 6), (0, 0, 0, 0))
        image.putpixel((2, 2), (10, 11, 12, 255))
        image.save(nested / "atlas.png")
        write_manifest(nested / "atlas.json", {"future": {"x": 1, "y": 1, "w": 4, "h": 4}})
        output_root = self.root / "rebuilt-tree"
        stats = reforger._reforge_directory(
            self.source,
            output_root,
            padding=1,
            bleed_radius=1,
            max_dimension=None,
        )
        self.assertEqual(len(stats), 1)
        verification = reforger._verify_output(self.source, output_root)
        self.assertEqual(verification.frames, 1)


if __name__ == "__main__":
    unittest.main()
