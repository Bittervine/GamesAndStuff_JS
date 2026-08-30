#!/usr/bin/env python3
"""Create an articulated modular human enemy variant from authored atlas frames.

The generated character reuses the source character's animationMap verbatim. This is
safe because animation files address logical rig part names rather than atlas frame
IDs. Human skin-tone variants are authored pixels: if the selected body has matching
``*_body_XX`` arm frames, those are selected automatically; otherwise the canonical
fair-skin articulated arm frames are used. Runtime character Color Exchange is not
part of this authoring path.
"""

from __future__ import annotations

import argparse
import copy
import json
from pathlib import Path
from typing import Any


ARM_FRAME_BY_PART = {
    "leftUpperArm": "arm_upper_01",
    "leftLowerArm": "arm_lower_01",
    "rightUpperArm": "arm_upper_00",
    "rightLowerArm": "arm_lower_00",
}

ASSEMBLY_PARTS = {
    "body": "torso",
    "head": "head",
    "leftArmUpper": "leftUpperArm",
    "leftArmLower": "leftLowerArm",
    "rightArmUpper": "rightUpperArm",
    "rightArmLower": "rightLowerArm",
    "leftLegUpper": "leftUpperLeg",
    "leftLegLower": "leftLowerLeg",
    "leftFoot": "leftFoot",
    "rightLegUpper": "rightUpperLeg",
    "rightLegLower": "rightLowerLeg",
    "rightFoot": "rightFoot",
    "weapon": "weapon",
}


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: dict[str, Any]) -> None:
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def frame_size(frame: dict[str, Any]) -> tuple[int, int]:
    return int(frame["w"]), int(frame["h"])


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", default="030", help="Source enemy suffix, for example 030")
    parser.add_argument("--target", required=True, help="Target enemy suffix, for example 031")
    parser.add_argument("--body", required=True, help="Torso frame ID, for example body_01")
    parser.add_argument("--head", required=True, help="Head frame ID, for example head_01")
    parser.add_argument("--label", required=True, help="Enemy display label")
    parser.add_argument("--revision", required=True, type=int)
    parser.add_argument("--force", action="store_true")
    return parser.parse_args()


def authored_arm_frames(body_frame: str, frames: dict[str, Any]) -> dict[str, str]:
    baked = {part_name: f"{base_frame}_{body_frame}" for part_name, base_frame in ARM_FRAME_BY_PART.items()}
    present_baked = [frame_id for frame_id in baked.values() if frame_id in frames]
    if len(present_baked) == len(baked):
        return baked
    if present_baked:
        missing_baked = [frame_id for frame_id in baked.values() if frame_id not in frames]
        raise SystemExit(
            f"Atlas has a partial baked arm set for {body_frame}; "
            f"missing frame(s): {', '.join(missing_baked)}"
        )
    missing_base = [frame_id for frame_id in ARM_FRAME_BY_PART.values() if frame_id not in frames]
    if missing_base:
        raise SystemExit(f"Atlas is missing canonical articulated arm frame(s): {', '.join(missing_base)}")
    return dict(ARM_FRAME_BY_PART)


def assembly_from_rig(rig: dict[str, Any]) -> dict[str, str]:
    parts = rig.get("parts", {})
    assembly: dict[str, str] = {}
    for assembly_name, part_name in ASSEMBLY_PARTS.items():
        part = parts.get(part_name)
        if isinstance(part, dict) and isinstance(part.get("frame"), str):
            assembly[assembly_name] = part["frame"]
    return assembly


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

    required_articulated_parts = set(ARM_FRAME_BY_PART) | {
        "torso", "head", "leftUpperLeg", "leftLowerLeg", "leftFoot",
        "rightUpperLeg", "rightLowerLeg", "rightFoot",
    }
    missing_parts = sorted(required_articulated_parts - set(source_rig.get("parts", {})))
    if missing_parts:
        raise SystemExit(
            f"Source rig {source_rig_path.name} is not an articulated human rig; missing: {', '.join(missing_parts)}"
        )
    stale_parts = [part_name for part_name, part in source_rig.get("parts", {}).items()
                   if isinstance(part, dict) and "colorExchange" in part]
    if stale_parts:
        raise SystemExit(
            f"Source rig {source_rig_path.name} uses removed character-part colorExchange on: {', '.join(stale_parts)}"
        )

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
            f"Revision {args.revision} modular articulated human variant. Cloned from enemy_{args.source}; "
            f"torso/head use {args.body}/{args.head}, and arm artwork is selected from authored atlas pixels."
        ),
    }
    rig["rigId"] = f"ct_rig_enemy_{args.target}"
    rig["parts"]["torso"]["frame"] = args.body
    rig["parts"]["head"]["frame"] = args.head
    for part_name, frame_id in authored_arm_frames(args.body, frames).items():
        rig["parts"][part_name]["frame"] = frame_id
    write_json(target_rig_path, rig)

    character = copy.deepcopy(source_char)
    character["meta"] = {
        "version": int(source_char.get("meta", {}).get("version", 1)) + 1,
        "note": (
            f"Revision {args.revision} modular articulated human variant using {args.body}/{args.head}. "
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
        f"A modular articulated human enemy using {args.body} and {args.head}, "
        f"with the shared enemy_{args.source} animation set."
    )
    catalog["enemies"][target_enemy_id] = enemy
    catalog.setdefault("meta", {})["revision"] = args.revision
    catalog["meta"]["version"] = int(catalog["meta"].get("version", 0)) + 1
    catalog["meta"]["note"] = (
        f"Revision {args.revision} adds {target_enemy_id}, an authored-frame modular human "
        f"that shares enemy_{args.source}'s animations."
    )
    write_json(catalog_path, catalog)

    generator_path = root / "resources" / "generator" / "level-generator-enemies.json"
    if generator_path.exists():
        generator = read_json(generator_path)
        generator_entries = generator.get("enemies") if isinstance(generator.get("enemies"), dict) else generator
        if source_enemy_id in generator_entries:
            generator_entries[target_enemy_id] = copy.deepcopy(generator_entries[source_enemy_id])
            generator_entries[target_enemy_id]["notes"] = (
                f"Dormant metadata for {args.label}. It shares enemy_{args.source}'s articulated animation set "
                "and remains excluded from ordinary generated levels until the human family is tuned."
            )
            if isinstance(generator.get("version"), int):
                generator["version"] += 1
            write_json(generator_path, generator)

    parts_path = assets / "ct_human_parts_030.json"
    if parts_path.exists():
        parts = read_json(parts_path)
        assemblies = parts.setdefault("assemblies", {})
        assemblies[source_enemy_id] = assembly_from_rig(source_rig)
        assemblies[target_enemy_id] = assembly_from_rig(rig)
        parts.setdefault("meta", {})["version"] = int(parts["meta"].get("version", 1)) + 1
        parts["meta"]["note"] = (
            f"Revision {args.revision} records articulated authored-frame assemblies for "
            f"{source_enemy_id} and {target_enemy_id}."
        )
        write_json(parts_path, parts)

    selected_arms = authored_arm_frames(args.body, frames)
    print(
        f"Created {target_enemy_id}: {args.body} + {args.head}; "
        f"arms={','.join(selected_arms.values())}; animations shared from enemy_{args.source}."
    )


if __name__ == "__main__":
    main()
