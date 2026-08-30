#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image

SCRIPT_PATH = Path(__file__).with_name("refresh_palette_thumbnail_metadata.py")
sys.path.insert(0, str(SCRIPT_PATH.parent))
SPEC = importlib.util.spec_from_file_location("refresh_palette_thumbnail_metadata", SCRIPT_PATH)
assert SPEC is not None and SPEC.loader is not None
refresh = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = refresh
SPEC.loader.exec_module(refresh)


def sha(path: Path) -> str:
    return refresh.sha256_bytes(path)


def write_atlas(root: Path, *, x: int, pixel=(20, 30, 40, 255)) -> None:
    atlas_dir = root / "atlases"
    atlas_dir.mkdir(parents=True, exist_ok=True)
    image = Image.new("RGBA", (8, 4), (0, 0, 0, 0))
    image.putpixel((x + 1, 1), pixel)
    image.save(atlas_dir / "at_atlas_test.png")
    (atlas_dir / "at_atlas_test.json").write_text(json.dumps({
        "atlasId": "at_atlas_test",
        "image": "at_atlas_test.png",
        "frames": {"future": {"x": x, "y": 0, "w": 3, "h": 3}},
        "objects": {"future": {"frame": "future"}},
    }, indent=2) + "\n", encoding="utf-8")


def write_catalog(path: Path, old_root: Path, extra_sources: list[str] | None = None) -> None:
    sources = ["atlases/at_atlas_test.json", "atlases/at_atlas_test.png", *(extra_sources or [])]
    records = []
    for relative in sorted(sources):
        records.append({"path": relative, "sha256": sha(old_root / relative)})
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({
        "formatVersion": 1,
        "image": "thumbnails.png",
        "cellSize": 32,
        "maxSize": 256,
        "sources": records,
        "entries": [{
            "key": "asset:at_atlas_test:future",
            "kind": "asset",
            "frame": {"x": 0, "y": 0, "w": 3, "h": 3},
            "source": {
                "manifest": "atlases/at_atlas_test.json",
                "assetId": "future",
            },
        }],
    }, indent=2) + "\n", encoding="utf-8")


class PaletteMetadataRefreshTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tempdir = tempfile.TemporaryDirectory()
        self.root = Path(self.tempdir.name)
        self.old = self.root / "old"
        self.current = self.root / "current"
        write_atlas(self.old, x=0)
        write_atlas(self.current, x=4)
        self.catalog = self.current / "palette" / "thumbnails.json"
        write_catalog(self.catalog, self.old)

    def tearDown(self) -> None:
        self.tempdir.cleanup()

    def test_changed_atlas_requires_original_resources(self) -> None:
        with self.assertRaisesRegex(ValueError, "--original-resources"):
            refresh.refresh_catalog(self.catalog, self.current, self.current)

    def test_pixel_equivalent_atlas_relocation_is_accepted(self) -> None:
        sources, frames, changed = refresh.refresh_catalog(
            self.catalog,
            self.current,
            self.current,
            original_resources=self.old,
        )
        self.assertEqual((sources, frames, changed), (2, 1, 2))
        catalog = json.loads(self.catalog.read_text(encoding="utf-8"))
        self.assertEqual(catalog["entries"][0]["frame"], {"x": 4, "y": 0, "w": 3, "h": 3})

    def test_visible_artwork_change_is_rejected(self) -> None:
        write_atlas(self.current, x=4, pixel=(99, 30, 40, 255))
        with self.assertRaisesRegex(Exception, "visible-pixel verification failed"):
            refresh.refresh_catalog(
                self.catalog,
                self.current,
                self.current,
                original_resources=self.old,
            )

    def test_non_atlas_source_change_requires_full_palette_rebuild(self) -> None:
        (self.old / "resources.json").write_text('{"assetAtlasIds":[]}\n', encoding="utf-8")
        (self.current / "resources.json").write_text('{"assetAtlasIds":["at_atlas_test"]}\n', encoding="utf-8")
        write_catalog(self.catalog, self.old, ["resources.json"])
        with self.assertRaisesRegex(ValueError, "non-atlas sources changed"):
            refresh.refresh_catalog(
                self.catalog,
                self.current,
                self.current,
                original_resources=self.old,
            )

    def test_supplied_original_must_match_cached_hash(self) -> None:
        write_atlas(self.old, x=0, pixel=(1, 2, 3, 255))
        with self.assertRaisesRegex(ValueError, "prior hash"):
            refresh.refresh_catalog(
                self.catalog,
                self.current,
                self.current,
                original_resources=self.old,
            )


if __name__ == "__main__":
    unittest.main()
