#!/usr/bin/env python3
"""
Batch-replace only bright saturated red/green/yellow GLB material colors.

Default targets:
  bright green  -> military green
  bright yellow -> khaki
  bright red    -> dark red

Usage examples:
  python tone_glb_colors_batch.py --dir . --pattern "Ship_*.glb" --in-place
  python tone_glb_colors_batch.py --dir . --pattern "Ship_*.glb" --out-dir toned
"""

import argparse
import colorsys
import json
from pathlib import Path


JSON_CHUNK_TYPE = 0x4E4F534A


def clamp01(value: float) -> float:
    if value < 0.0:
        return 0.0
    if value > 1.0:
        return 1.0
    return value


def classify_bright_color(
    rgb,
    sat_min_red: float,
    sat_min_yellow: float,
    sat_min_green: float,
    max_min_red: float,
    max_min_yellow: float,
    max_min_green: float,
):
    r = clamp01(float(rgb[0]))
    g = clamp01(float(rgb[1]))
    b = clamp01(float(rgb[2]))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    v = max(r, g, b)
    # Hue bands in [0..1] for red, yellow, green.
    is_red = h <= 0.04 or h >= 0.96
    is_yellow = 0.11 <= h <= 0.19
    is_green = 0.24 <= h <= 0.42

    if is_red and s >= sat_min_red and v >= max_min_red:
        return "red"
    if is_yellow and s >= sat_min_yellow and v >= max_min_yellow:
        return "yellow"
    if is_green and s >= sat_min_green and v >= max_min_green:
        return "green"
    return None


def parse_glb_chunks(data: bytes):
    if len(data) < 12 or data[0:4] != b"glTF":
        raise ValueError("Not a GLB file")
    if int.from_bytes(data[4:8], "little") != 2:
        raise ValueError("Unsupported GLB version")
    if int.from_bytes(data[8:12], "little") != len(data):
        raise ValueError("GLB length mismatch")

    chunks = []
    offset = 12
    while offset + 8 <= len(data):
        chunk_len = int.from_bytes(data[offset : offset + 4], "little")
        chunk_type = int.from_bytes(data[offset + 4 : offset + 8], "little")
        offset += 8
        end = offset + chunk_len
        if end > len(data):
            raise ValueError("Invalid GLB chunk bounds")
        chunks.append([chunk_type, data[offset:end]])
        offset = end
    if offset != len(data):
        raise ValueError("Trailing bytes in GLB")
    return chunks


def rebuild_glb(chunks) -> bytes:
    out = bytearray()
    out += b"glTF"
    out += (2).to_bytes(4, "little")
    out += (0).to_bytes(4, "little")
    for chunk_type, chunk_data in chunks:
        out += len(chunk_data).to_bytes(4, "little")
        out += int(chunk_type).to_bytes(4, "little")
        out += chunk_data
    out[8:12] = len(out).to_bytes(4, "little")
    return bytes(out)


def recolor_triplet_in_place(
    rgb,
    sat_min_red: float,
    sat_min_yellow: float,
    sat_min_green: float,
    max_min_red: float,
    max_min_yellow: float,
    max_min_green: float,
    targets: dict,
    counts: dict,
):
    color_key = classify_bright_color(
        rgb,
        sat_min_red,
        sat_min_yellow,
        sat_min_green,
        max_min_red,
        max_min_yellow,
        max_min_green,
    )
    if not color_key:
        return False
    target = targets[color_key]
    rgb[0], rgb[1], rgb[2] = target[0], target[1], target[2]
    counts[color_key] += 1
    return True


def patch_gltf_json(
    gltf: dict,
    sat_min_red: float,
    sat_min_yellow: float,
    sat_min_green: float,
    max_min_red: float,
    max_min_yellow: float,
    max_min_green: float,
    targets: dict,
):
    materials = gltf.get("materials") or []
    changed_materials = 0
    changed_fields = 0
    counts = {"red": 0, "yellow": 0, "green": 0}

    for material in materials:
        before = changed_fields

        pbr = material.get("pbrMetallicRoughness")
        if isinstance(pbr, dict):
            base = pbr.get("baseColorFactor")
            if isinstance(base, list) and len(base) >= 3:
                if recolor_triplet_in_place(
                    base,
                    sat_min_red,
                    sat_min_yellow,
                    sat_min_green,
                    max_min_red,
                    max_min_yellow,
                    max_min_green,
                    targets,
                    counts,
                ):
                    changed_fields += 1

        emissive = material.get("emissiveFactor")
        if isinstance(emissive, list) and len(emissive) >= 3:
            if recolor_triplet_in_place(
                emissive,
                sat_min_red,
                sat_min_yellow,
                sat_min_green,
                max_min_red,
                max_min_yellow,
                max_min_green,
                targets,
                counts,
            ):
                changed_fields += 1

        if changed_fields > before:
            changed_materials += 1

    return len(materials), changed_materials, changed_fields, counts


def process_one_file(
    src_path: Path,
    dst_path: Path,
    sat_min_red: float,
    sat_min_yellow: float,
    sat_min_green: float,
    max_min_red: float,
    max_min_yellow: float,
    max_min_green: float,
    targets: dict,
):
    data = src_path.read_bytes()
    chunks = parse_glb_chunks(data)
    json_index = next((i for i, (chunk_type, _) in enumerate(chunks) if chunk_type == JSON_CHUNK_TYPE), -1)
    if json_index < 0:
        return 0, 0, 0

    text = chunks[json_index][1].rstrip(b"\x00 \t\r\n").decode("utf-8")
    gltf = json.loads(text)

    mats, changed_mats, changed_fields, counts = patch_gltf_json(
        gltf,
        sat_min_red,
        sat_min_yellow,
        sat_min_green,
        max_min_red,
        max_min_yellow,
        max_min_green,
        targets,
    )
    if changed_fields == 0:
        return mats, 0, 0, counts

    new_json = json.dumps(gltf, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
    padding = (-len(new_json)) % 4
    if padding:
        new_json += b" " * padding
    chunks[json_index][1] = new_json

    out_data = rebuild_glb(chunks)
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = dst_path.with_suffix(dst_path.suffix + ".tmp_tone")
    temp_path.write_bytes(out_data)
    temp_path.replace(dst_path)
    return mats, changed_mats, changed_fields, counts


def parse_args():
    parser = argparse.ArgumentParser(description="Batch tone GLB material colors")
    parser.add_argument("--dir", default=".", help="Directory containing GLB files")
    parser.add_argument("--pattern", default="Ship_*.glb", help="Glob pattern for files")
    parser.add_argument("--in-place", action="store_true", help="Overwrite original files")
    parser.add_argument("--out-dir", default="", help="Output directory if not in-place")
    parser.add_argument("--suffix", default="_toned", help="Suffix for output files when not in-place")
    parser.add_argument("--sat-min-red", type=float, default=0.60, help="Minimum saturation for red replacement")
    parser.add_argument("--sat-min-yellow", type=float, default=0.60, help="Minimum saturation for yellow replacement")
    parser.add_argument("--sat-min-green", type=float, default=0.60, help="Minimum saturation for green replacement")
    parser.add_argument("--max-min-red", type=float, default=0.82, help="Minimum max RGB channel for red replacement")
    parser.add_argument("--max-min-yellow", type=float, default=0.82, help="Minimum max RGB channel for yellow replacement")
    parser.add_argument("--max-min-green", type=float, default=0.82, help="Minimum max RGB channel for green replacement")

    parser.add_argument("--target-red", default="0.45,0.12,0.12", help="Replacement for bright red (r,g,b)")
    parser.add_argument("--target-yellow", default="0.62,0.57,0.40", help="Replacement for bright yellow (r,g,b)")
    parser.add_argument("--target-green", default="0.33,0.40,0.22", help="Replacement for bright green (r,g,b)")
    return parser.parse_args()


def main():
    args = parse_args()
    def parse_rgb(text: str):
        parts = [p.strip() for p in text.split(",")]
        if len(parts) != 3:
            raise ValueError(f"Expected 3 comma-separated values, got: {text}")
        return [clamp01(float(parts[0])), clamp01(float(parts[1])), clamp01(float(parts[2]))]

    targets = {
        "red": parse_rgb(args.target_red),
        "yellow": parse_rgb(args.target_yellow),
        "green": parse_rgb(args.target_green),
    }

    root = Path(args.dir).resolve()
    files = sorted(root.glob(args.pattern))
    if not files:
        print("No files matched.")
        return

    changed_files = 0
    total_mats = 0
    total_changed_mats = 0
    total_changed_fields = 0
    total_counts = {"red": 0, "yellow": 0, "green": 0}

    for src in files:
        if args.in_place:
            dst = src
        else:
            out_dir = Path(args.out_dir) if args.out_dir else root / "toned"
            dst = out_dir / (src.stem + args.suffix + src.suffix)

        mats, changed_mats, changed_fields, counts = process_one_file(
            src,
            dst,
            args.sat_min_red,
            args.sat_min_yellow,
            args.sat_min_green,
            args.max_min_red,
            args.max_min_yellow,
            args.max_min_green,
            targets,
        )

        total_mats += mats
        total_changed_mats += changed_mats
        total_changed_fields += changed_fields
        total_counts["red"] += counts["red"]
        total_counts["yellow"] += counts["yellow"]
        total_counts["green"] += counts["green"]
        if changed_fields > 0:
            changed_files += 1

    print(f"Processed files: {len(files)}")
    print(f"Changed files: {changed_files}")
    print(f"Materials seen: {total_mats}")
    print(f"Materials changed: {total_changed_mats}")
    print(f"Fields changed: {total_changed_fields}")
    print(f"Replaced bright red: {total_counts['red']}")
    print(f"Replaced bright yellow: {total_counts['yellow']}")
    print(f"Replaced bright green: {total_counts['green']}")


if __name__ == "__main__":
    main()
