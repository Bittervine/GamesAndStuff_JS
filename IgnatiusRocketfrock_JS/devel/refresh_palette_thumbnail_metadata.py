#!/usr/bin/env python3
"""Safely refresh palette metadata after pixel-equivalent atlas relocation.

This helper is intentionally narrower than Palette Builder. It may update source
hashes and atlas frame coordinates only when the changed sources are atlas
JSON/PNG pairs whose *old* files are supplied and whose frame-local visible
pixels pass verify_atlas_rect_pixels.py. Any other source change, including a
resources.json inventory change, requires rebuilding the palette thumbnails.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

from verify_atlas_rect_pixels import load_manifest, verify_manifest_pair

BUILDER_ID = "browser-html-js"
BUILDER_VERSION = 3
REFERENCE_ROOT = Path(__file__).resolve().parents[1]
RESOURCE_ROOT = REFERENCE_ROOT / "resources"
CATALOG_PATH = RESOURCE_ROOT / "palette" / "thumbnails.json"
ATLAS_SOURCE_RE = re.compile(
    r"^(?:atlases/at_atlas_[^/]+|characters/ct_atlas_[^/]+|items/it_atlas_[^/]+)\.(?:json|png)$"
)


def sha256_bytes(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def source_path(relative: str, resource_root: Path, reference_root: Path) -> Path:
    resource_candidate = resource_root / relative
    if resource_candidate.is_file():
        return resource_candidate
    reference_candidate = reference_root / relative
    if reference_candidate.is_file():
        return reference_candidate
    raise FileNotFoundError(f"palette source not found: {relative}")


def atlas_manifest_relative(relative: str) -> str:
    path = Path(relative)
    return str(path.with_suffix(".json")).replace("\\", "/")


def source_digest(records: list[dict], cell_size: int, max_size: int) -> str:
    lines = [
        f"builder={BUILDER_ID}",
        f"version={BUILDER_VERSION}",
        f"cell={int(cell_size)}",
        f"max={int(max_size)}",
    ]
    lines.extend(f"{record['path']}\0{record['sha256']}" for record in records)
    return hashlib.sha256("\n".join(lines).encode("utf-8")).hexdigest()


def refresh_catalog(
    catalog_path: Path,
    resource_root: Path,
    reference_root: Path,
    *,
    original_resources: Path | None = None,
) -> tuple[int, int, int]:
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    old_records = sorted(catalog.get("sources", []), key=lambda item: str(item.get("path", "")))
    if not old_records:
        raise ValueError("palette cache has no source inventory")

    current_records: list[dict] = []
    changed: list[tuple[str, str, str]] = []
    for record in old_records:
        relative = str(record.get("path", ""))
        old_hash = str(record.get("sha256", ""))
        if not relative or not old_hash:
            raise ValueError("palette source record must contain path and sha256")
        current_hash = sha256_bytes(source_path(relative, resource_root, reference_root))
        current_records.append({"path": relative, "sha256": current_hash})
        if current_hash != old_hash:
            changed.append((relative, old_hash, current_hash))

    unsafe = [relative for relative, _, _ in changed if not ATLAS_SOURCE_RE.fullmatch(relative)]
    if unsafe:
        raise ValueError(
            "metadata-only palette refresh is unsafe because non-atlas sources changed: "
            + ", ".join(unsafe)
            + ". Rebuild thumbnails with Palette Builder instead."
        )

    if changed:
        if original_resources is None:
            raise ValueError(
                "atlas sources changed; --original-resources is required so old hashes and frame pixels can be verified"
            )
        original_resources = original_resources.resolve()
        manifests_to_verify: set[str] = set()
        for relative, old_hash, _ in changed:
            original_source = original_resources / relative
            if not original_source.is_file():
                raise ValueError(f"original palette source is missing: {original_source}")
            actual_old_hash = sha256_bytes(original_source)
            if actual_old_hash != old_hash:
                raise ValueError(
                    f"original source does not match the cache's prior hash: {relative} "
                    f"({actual_old_hash} != {old_hash})"
                )
            manifests_to_verify.add(atlas_manifest_relative(relative))

        for relative in sorted(manifests_to_verify):
            original_manifest_path = original_resources / relative
            rebuilt_manifest_path = resource_root / relative
            if not original_manifest_path.is_file() or not rebuilt_manifest_path.is_file():
                raise ValueError(f"atlas manifest pair is incomplete for metadata refresh: {relative}")
            verify_manifest_pair(
                load_manifest(original_manifest_path),
                load_manifest(rebuilt_manifest_path),
            )

    catalog["sources"] = current_records

    manifest_cache: dict[str, dict] = {}
    refreshed_frames = 0
    for entry in catalog.get("entries", []):
        frame = entry.get("frame")
        source = entry.get("source") or {}
        manifest_relative = source.get("manifest")
        asset_id = source.get("assetId")
        if not isinstance(frame, dict) or not manifest_relative or not asset_id:
            continue
        manifest_relative = str(manifest_relative)
        manifest = manifest_cache.get(manifest_relative)
        if manifest is None:
            manifest = json.loads((resource_root / manifest_relative).read_text(encoding="utf-8"))
            manifest_cache[manifest_relative] = manifest
        obj = (manifest.get("objects") or {}).get(str(asset_id)) or {}
        frame_name = str(obj.get("frame") or asset_id)
        authored = (manifest.get("frames") or {}).get(frame_name)
        if not isinstance(authored, dict):
            raise ValueError(
                f"palette entry {entry.get('key')} references missing frame {frame_name} in {manifest_relative}"
            )
        entry["frame"] = {key: int(authored[key]) for key in ("x", "y", "w", "h")}
        refreshed_frames += 1

    catalog["sourceDigest"] = source_digest(current_records, catalog["cellSize"], catalog["maxSize"])
    catalog_path.write_text(json.dumps(catalog, indent=2) + "\n", encoding="utf-8")
    return len(current_records), refreshed_frames, len(changed)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--original-resources",
        type=Path,
        help=(
            "resources root containing the exact pre-change atlas files recorded by the current cache; "
            "required when any atlas source hash changed"
        ),
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    sources, frames, changed = refresh_catalog(
        CATALOG_PATH,
        RESOURCE_ROOT,
        REFERENCE_ROOT,
        original_resources=args.original_resources,
    )
    print(
        f"PASS: refreshed {sources} palette source hashes and {frames} atlas frame records "
        f"after verifying {changed} changed atlas source file(s)"
    )


if __name__ == "__main__":
    main()
