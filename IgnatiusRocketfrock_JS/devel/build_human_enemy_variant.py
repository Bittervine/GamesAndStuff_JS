#!/usr/bin/env python3
"""Create a modular human enemy variant by swapping torso/head atlas frames.

The generated character reuses the source character's animationMap verbatim. This is
safe because the animation files address logical rig part names rather than atlas
frame IDs. A separate rig stores only the variant's selected torso/head artwork.
"""

from __future__ import annotations

import argparse
import copy
import json
from pathlib import Path
from typing import Any


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: dict[str, Any]) -> None:
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def frame_size(frame: dict[str, Any]) -> tuple[int, int]:
    return int(frame["w"]), int(frame["h"])


def parse_hex_color(value: str) -> list[int]:
    text = value.strip().lstrip("#")
    if len(text) != 6 or any(ch not in "0123456789abcdefABCDEF" for ch in text):
        raise argparse.ArgumentTypeError(f"Expected a six-digit RGB hex color, got {value!r}")
    return [int(text[index:index + 2], 16) for index in (0, 2, 4)]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", default="030", help="Source enemy suffix, for example 030")
    parser.add_argument("--target", required=True, help="Target enemy suffix, for example 031")
    parser.add_argument("--body", required=True, help="Torso frame ID, for example body_01")
    parser.add_argument("--head", required=True, help="Head frame ID, for example head_01")
    parser.add_argument("--label", required=True, help="Enemy display label")
    parser.add_argument("--revision", required=True, type=int)
    parser.add_argument("--arm-from", type=parse_hex_color, help="Optional GIMP Color Exchange source color, for example #e0945e")
    parser.add_argument("--arm-to", type=parse_hex_color, help="Optional GIMP Color Exchange destination color, for example #8c5126")
    parser.add_argument("--arm-threshold", type=float, default=1.0, help="Linked RGB threshold in the GIMP 0..1 convention")
    parser.add_argument("--force", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    root = Path(__file__).resolve().parents[1]
    assets = root / "resources" / "characters"

    source_rig_path = assets / f"ct_rig_enemy_{args.source}.json"
    source_char_path = assets / f"ct_char_enemy_{args.source}.json"
    target_rig_path = assets / f"ct_rig_enemy_{args.target}.json"
    target_char_path = assets / f"ct_char_enemy_{args.target}.json"

    if not args.force:
        existing = [path for path in (target_rig_path, target_char_path) if path.exists()]
        if existing:
            raise SystemExit(f"Refusing to overwrite: {', '.join(str(path) for path in existing)}")

    source_rig = read_json(source_rig_path)
    source_char = read_json(source_char_path)
    atlas_path = assets / source_rig.get("atlasManifest", f"{source_rig['atlasId']}.json")
    atlas = read_json(atlas_path)
    frames = atlas.get("frames", {})

    source_body = source_rig["parts"]["torso"]["frame"]
    source_head = source_rig["parts"]["head"]["frame"]
    for frame_id in (source_body, source_head, args.body, args.head):
        if frame_id not in frames:
            raise SystemExit(f"Atlas {atlas_path.name} has no frame {frame_id}")

    if frame_size(frames[source_body]) != frame_size(frames[args.body]):
        raise SystemExit(
            f"Body frame {args.body} size {frame_size(frames[args.body])} does not match "
            f"source {source_body} size {frame_size(frames[source_body])}"
        )
    if frame_size(frames[source_head]) != frame_size(frames[args.head]):
        raise SystemExit(
            f"Head frame {args.head} size {frame_size(frames[args.head])} does not match "
            f"source {source_head} size {frame_size(frames[source_head])}"
        )

    rig = copy.deepcopy(source_rig)
    rig["meta"] = {
        "version": int(source_rig.get("meta", {}).get("version", 1)) + 1,
        "note": (
            f"Revision {args.revision} modular human variant. Cloned from enemy_{args.source}; "
            f"only torso/head frames change to {args.body} and {args.head}."
        ),
    }
    rig["rigId"] = f"ct_rig_enemy_{args.target}"
    rig["parts"]["torso"]["frame"] = args.body
    rig["parts"]["head"]["frame"] = args.head
    if bool(args.arm_from) != bool(args.arm_to):
        raise SystemExit("--arm-from and --arm-to must be supplied together")
    if args.arm_from and args.arm_to:
        threshold = max(0.0, min(1.0, float(args.arm_threshold)))
        modifier = {
            "fromColor": args.arm_from,
            "toColor": args.arm_to,
            "redThreshold": threshold,
            "greenThreshold": threshold,
            "blueThreshold": threshold,
        }
        for part_name in ("leftArm", "rightArm"):
            rig["parts"][part_name]["colorExchange"] = copy.deepcopy(modifier)
        rig["meta"]["note"] += (
            f" Arm frames use GIMP-compatible Color Exchange {args.arm_from} -> {args.arm_to} "
            f"with threshold {threshold:g}."
        )
    write_json(target_rig_path, rig)

    character = copy.deepcopy(source_char)
    character["meta"] = {
        "version": int(source_char.get("meta", {}).get("version", 1)) + 1,
        "note": (
            f"Revision {args.revision} modular human variant using {args.body}/{args.head}. "
            f"All animations are shared directly with ct_char_enemy_{args.source}."
        ),
    }
    character["characterId"] = f"ct_char_enemy_{args.target}"
    character["displayName"] = args.label
    character["rig"] = target_rig_path.name
    # animationMap deliberately remains unchanged and points to the source clips.
    write_json(target_char_path, character)

    catalog_path = assets / "ct_enemies_001.json"
    catalog = read_json(catalog_path)
    source_enemy_id = f"enemy_{args.source}"
    target_enemy_id = f"enemy_{args.target}"
    if source_enemy_id not in catalog.get("enemies", {}):
        raise SystemExit(f"Enemy catalog has no {source_enemy_id}")
    enemy = copy.deepcopy(catalog["enemies"][source_enemy_id])
    enemy["label"] = args.label
    enemy["characterId"] = character["characterId"]
    enemy["description"] = (
        f"A modular human sword enemy using {args.body} and {args.head}, "
        f"with the shared enemy_{args.source} animation set."
    )
    catalog["enemies"][target_enemy_id] = enemy
    catalog.setdefault("meta", {})["revision"] = args.revision
    catalog["meta"]["version"] = int(catalog["meta"].get("version", 0)) + 1
    catalog["meta"]["note"] = (
        f"Revision {args.revision} adds {target_enemy_id}, a frame-swapped modular human "
        f"that shares enemy_{args.source}'s sword animations."
    )
    write_json(catalog_path, catalog)

    generator_path = assets / "level-generator-enemies.json"
    if generator_path.exists():
        generator = read_json(generator_path)
        generator_entries = generator.get("enemies") if isinstance(generator.get("enemies"), dict) else generator
        if source_enemy_id in generator_entries:
            generator_entries[target_enemy_id] = copy.deepcopy(generator_entries[source_enemy_id])
            generator_entries[target_enemy_id]["notes"] = (
                f"Dormant metadata for {args.label}. It shares the human sword animation set "
                "and remains excluded from ordinary generated levels until the human family is tuned."
            )
            if isinstance(generator.get("version"), int):
                generator["version"] += 1
            write_json(generator_path, generator)

    parts_path = assets / "ct_human_parts_030.json"
    if parts_path.exists():
        parts = read_json(parts_path)
        assemblies = parts.setdefault("assemblies", {})
        assemblies[source_enemy_id] = {
            "body": source_body,
            "head": source_head,
            "rearArm": source_rig["parts"]["leftArm"]["frame"],
            "frontArm": source_rig["parts"]["rightArm"]["frame"],
            "rearLeg": source_rig["parts"]["leftLeg"]["frame"],
            "frontLeg": source_rig["parts"]["rightLeg"]["frame"],
            "weapon": source_rig["parts"]["weapon"]["frame"],
        }
        assemblies[target_enemy_id] = {
            **assemblies[source_enemy_id],
            "body": args.body,
            "head": args.head,
        }
        parts.setdefault("meta", {})["version"] = int(parts["meta"].get("version", 1)) + 1
        parts["meta"]["note"] = (
            f"Revision {args.revision} records reusable modular assemblies for "
            f"{source_enemy_id} and {target_enemy_id}."
        )
        write_json(parts_path, parts)

    print(
        f"Created {target_enemy_id}: {args.body} + {args.head}; "
        f"animations shared from enemy_{args.source}."
    )


if __name__ == "__main__":
    main()
