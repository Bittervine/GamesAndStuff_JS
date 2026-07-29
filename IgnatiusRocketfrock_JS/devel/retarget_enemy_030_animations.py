#!/usr/bin/env python3
"""Retarget selected Human Raider clips to the user-authored idle pose.

Walk and idle are user-authored, while attack and death are now intentionally
hand-authored from that baseline. The default slot is therefore only hurt;
pass explicit slots only when deliberately rebuilding authored clips.

The first key of each idle transform track is authoritative for placement,
rotation, scale, and alpha. Other clips keep their authored movement deltas,
but are rebased onto that canonical pose. Scale animation is preserved as a
ratio, so a clip that temporarily stretches a part still does so around the
correct Human Raider size.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

TRANSFORM_PROPERTIES = ("x", "y", "rotation", "scale", "alpha")
DEFAULT_SLOTS = ("hurt",)


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data: dict[str, Any]) -> None:
    path.write_text(json.dumps(data, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")


def first_track_value(tracks: dict[str, Any], prop: str, fallback: float) -> float:
    keys = tracks.get(prop)
    if isinstance(keys, list) and keys:
        return float(keys[0].get("value", fallback))
    return float(fallback)


def canonical_pose(idle: dict[str, Any]) -> dict[str, dict[str, float]]:
    pose: dict[str, dict[str, float]] = {}
    idle_reference = idle.get("referencePose", {})
    for part, tracks in idle.get("tracks", {}).items():
        reference = idle_reference.get(part, {})
        pose[part] = {
            prop: first_track_value(tracks, prop, float(reference.get(prop, 1 if prop in {"scale", "alpha"} else 0)))
            for prop in TRANSFORM_PROPERTIES
        }
    return pose


def retarget_property(keys: list[dict[str, Any]], canonical: float, prop: str) -> None:
    if not keys:
        return
    old_base = float(keys[0].get("value", canonical))
    if prop == "scale":
        factor = canonical / old_base if abs(old_base) > 1e-12 else 1.0
        for key in keys:
            key["value"] = float(key.get("value", old_base)) * factor
    elif prop == "alpha":
        # Preserve fades, normalized relative to the old starting opacity.
        factor = canonical / old_base if abs(old_base) > 1e-12 else 1.0
        for key in keys:
            key["value"] = max(0.0, min(1.0, float(key.get("value", old_base)) * factor))
    else:
        for key in keys:
            key["value"] = canonical + (float(key.get("value", old_base)) - old_base)


def retarget_clip(clip: dict[str, Any], idle_pose: dict[str, dict[str, float]], revision: int) -> dict[str, Any]:
    tracks = clip.get("tracks", {})
    clip_reference = clip.setdefault("referencePose", {})

    missing = set(idle_pose) - set(tracks)
    extra = set(tracks) - set(idle_pose)
    if missing or extra:
        raise ValueError(f"Part mismatch. Missing: {sorted(missing)}; extra: {sorted(extra)}")

    for part, canonical in idle_pose.items():
        part_tracks = tracks[part]
        for prop in TRANSFORM_PROPERTIES:
            keys = part_tracks.get(prop)
            if isinstance(keys, list) and keys:
                retarget_property(keys, canonical[prop], prop)
            else:
                part_tracks[prop] = [{"time": 0, "value": canonical[prop], "easing": "linear"}]
        clip_reference[part] = dict(canonical)

    meta = clip.setdefault("meta", {})
    meta["version"] = max(2, int(meta.get("version", 1)))
    slot = str(clip.get("animationId", "animation")).rsplit("_", 1)[-1]
    meta["note"] = (
        f"Revision {revision} Human Raider {slot} clip retargeted to the user-authored idle pose. "
        "Movement deltas are preserved while pivots, placement, and part scales share the idle baseline."
    )
    return clip


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--assets", type=Path, default=Path(__file__).resolve().parents[1] / "resources" / "characters")
    parser.add_argument("--revision", type=int, default=368)
    parser.add_argument("slots", nargs="*", default=list(DEFAULT_SLOTS))
    args = parser.parse_args()

    idle_path = args.assets / "ct_anim_enemy_030_idle.json"
    idle = load_json(idle_path)
    pose = canonical_pose(idle)

    for slot in args.slots:
        path = args.assets / f"ct_anim_enemy_030_{slot}.json"
        clip = retarget_clip(load_json(path), pose, args.revision)
        save_json(path, clip)
        print(f"Retargeted {path.name}")


if __name__ == "__main__":
    main()
