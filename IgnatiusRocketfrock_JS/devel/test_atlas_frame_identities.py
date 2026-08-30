#!/usr/bin/env python3
"""Regression fingerprints for atlas frames whose identity matters beyond geometry."""
from __future__ import annotations

import hashlib
import json
import unittest
from pathlib import Path

from PIL import Image

RESOURCE_ROOT = Path(__file__).resolve().parents[1] / "resources"
EXPECTED = {
    ("characters/ct_atlas_enemy_010.json", "leftArmOpen"): (408, 192, "00a5e9e1f26fc9b04f45098fcb487d423f1b33295536b880a6e42c9e3a3767a7"),
    ("characters/ct_atlas_enemy_010.json", "leftArmClosed"): (365, 229, "157c66cff9c7adace5bf9d889ce1b43d5ac78a99e17529100754adf2452b95ce"),
    ("characters/ct_atlas_enemy_010.json", "rightArmClosed"): (370, 226, "a142432ecad3b62aaa952062063d0ccc45b2265675fecae2db1dd8a0dff7c5b6"),
    ("characters/ct_atlas_enemy_010.json", "leftLeg"): (208, 269, "cb31f9611ac7da886fbaf56a2e6c675effba5c6afa2c0337d1c25049b733793f"),
    ("characters/ct_atlas_enemy_010.json", "rightLeg"): (226, 284, "9c7de2c41b5f80127a433f9d28601350eb4532019a4e70a71ea71833e00a5a48"),
    ("characters/ct_atlas_enemy_020.json", "rock"): (60, 56, "a615b8bc9e95e4d425bdd8b356f97aad8722e07d0fde1180caa6b9835b8562f0"),
    ("characters/ct_atlas_wizard_1.json", "rocket_projectile"): (196, 509, "67970693a40d3b8398215b4f2aad6804aaebf7bbcf9c6d2e99f33f53cd380ca2"),
    ("items/it_atlas_001.json", "speech_bubble_large"): (397, 241, "85a8e86adfabd1a0f084a495e11a565d1fe489cfa1ee1d4a537604f3753d28a6"),
    ("items/it_atlas_001.json", "rune_marker_inactive"): (98, 123, "2db0347e80b6d4ce138f4d2ba9f9e473c3ec29b823391eefb12bebfe77936821"),
}


def visible_pixel_digest(image: Image.Image, frame: dict[str, int]) -> str:
    crop = image.crop((frame["x"], frame["y"], frame["x"] + frame["w"], frame["y"] + frame["h"])).convert("RGBA")
    pixels = bytearray(crop.tobytes())
    # Transparent RGB is deliberately allowed to change during atlas reforging.
    for offset in range(0, len(pixels), 4):
        if pixels[offset + 3] == 0:
            pixels[offset] = 0
            pixels[offset + 1] = 0
            pixels[offset + 2] = 0
    return hashlib.sha256(pixels).hexdigest()


class AtlasFrameIdentityTests(unittest.TestCase):
    def test_curated_frame_identities(self) -> None:
        manifests: dict[str, dict] = {}
        images: dict[str, Image.Image] = {}
        for (relative, frame_name), (width, height, expected_digest) in EXPECTED.items():
            if relative not in manifests:
                manifest_path = RESOURCE_ROOT / relative
                manifests[relative] = json.loads(manifest_path.read_text(encoding="utf-8"))
                images[relative] = Image.open(manifest_path.parent / manifests[relative]["image"]).convert("RGBA")
            frame = manifests[relative]["frames"][frame_name]
            self.assertEqual((frame["w"], frame["h"]), (width, height), f"{relative}:{frame_name} dimensions")
            self.assertEqual(visible_pixel_digest(images[relative], frame), expected_digest, f"{relative}:{frame_name} visible artwork")


if __name__ == "__main__":
    unittest.main()
