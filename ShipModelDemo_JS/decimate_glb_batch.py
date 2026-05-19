#!/usr/bin/env python3
"""
Batch decimate .glb files with per-mesh smart thresholds.

Run with Blender (headless):
  blender --background --python ShipModelDemo_JS/decimate_glb_batch.py -- \
    --dir ShipModelDemo_JS --in-place

Dry-run example (stats only):
  blender --background --python ShipModelDemo_JS/decimate_glb_batch.py -- \
    --dir ShipModelDemo_JS --dry-run
"""

import argparse
import fnmatch
import os
import sys

import bpy


def parse_args() -> argparse.Namespace:
    raw = sys.argv
    args = raw[raw.index("--") + 1 :] if "--" in raw else []

    parser = argparse.ArgumentParser(description="Smart GLB batch decimator")
    parser.add_argument("--dir", default="ShipModelDemo_JS", help="Directory with .glb files")
    parser.add_argument("--pattern", default="*.glb", help="Filename pattern")
    parser.add_argument(
        "--in-place",
        action="store_true",
        help="Overwrite source .glb files (default: False)",
    )
    parser.add_argument(
        "--out-dir",
        default="",
        help="Output directory when not using --in-place (default: <dir>/optimized)",
    )
    parser.add_argument("--suffix", default="_dec", help="Output suffix when not in-place")
    parser.add_argument("--dry-run", action="store_true", help="Only print intended changes")

    parser.add_argument("--small-threshold", type=int, default=100)
    parser.add_argument("--medium-threshold", type=int, default=1000)
    parser.add_argument("--large-threshold", type=int, default=5000)

    parser.add_argument("--medium-ratio", type=float, default=0.80)
    parser.add_argument("--large-ratio", type=float, default=0.40)
    parser.add_argument("--xlarge-ratio", type=float, default=0.10)

    parser.add_argument(
        "--top-heavy-count",
        type=int,
        default=4,
        help="Only decimate this many heaviest mesh objects per model (0 = all)",
    )
    parser.add_argument(
        "--heavy-min-tris",
        type=int,
        default=1200,
        help="Only meshes above this triangle count are eligible for decimation",
    )

    parser.add_argument("--min-tris-keep", type=int, default=32)
    parser.add_argument(
        "--protect-below-tris",
        type=int,
        default=120,
        help="Never decimate meshes below this triangle count",
    )
    parser.add_argument(
        "--thin-ratio-threshold",
        type=float,
        default=0.08,
        help="If smallest_dim/largest_dim is below this, treat as thin part",
    )
    parser.add_argument(
        "--thin-min-ratio",
        type=float,
        default=0.70,
        help="Minimum retained ratio for thin parts",
    )

    return parser.parse_args(args)


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        if block.users == 0:
            bpy.data.materials.remove(block)
    for block in bpy.data.images:
        if block.users == 0:
            bpy.data.images.remove(block)


def tri_count(mesh: bpy.types.Mesh) -> int:
    total = 0
    for poly in mesh.polygons:
        vcount = len(poly.vertices)
        if vcount >= 3:
            total += vcount - 2
    return total


def object_thinness_ratio(obj: bpy.types.Object) -> float:
    dims = [abs(v) for v in obj.dimensions]
    dims = [d for d in dims if d > 1e-9]
    if len(dims) < 2:
        return 1.0
    dims.sort()
    return dims[0] / dims[-1]


def choose_base_ratio(tris: int, cfg: argparse.Namespace) -> float:
    if tris < cfg.small_threshold:
        return 1.0
    if tris < cfg.medium_threshold:
        return cfg.medium_ratio
    if tris < cfg.large_threshold:
        return cfg.large_ratio
    return cfg.xlarge_ratio


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def compute_target_ratio(
    tris: int,
    thinness: float,
    is_heavy_pick: bool,
    cfg: argparse.Namespace,
) -> float:
    if tris < cfg.protect_below_tris:
        return 1.0
    if tris < cfg.heavy_min_tris:
        return 1.0
    if cfg.top_heavy_count > 0 and not is_heavy_pick:
        return 1.0

    ratio = choose_base_ratio(tris, cfg)

    if thinness < cfg.thin_ratio_threshold:
        ratio = max(ratio, cfg.thin_min_ratio)

    min_ratio_from_floor = cfg.min_tris_keep / max(tris, 1)
    ratio = max(ratio, min_ratio_from_floor)
    return clamp(ratio, 0.0, 1.0)


def apply_decimate(obj: bpy.types.Object, ratio: float, dry_run: bool) -> None:
    if ratio >= 0.999:
        return

    if dry_run:
        return

    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    mod = obj.modifiers.new(name="SmartDecimate", type="DECIMATE")
    mod.decimate_type = "COLLAPSE"
    mod.ratio = ratio

    if hasattr(mod, "use_collapse_triangulate"):
        mod.use_collapse_triangulate = True

    bpy.ops.object.modifier_apply(modifier=mod.name)


def export_glb(filepath: str) -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format="GLB",
        use_selection=False,
    )


def process_one_file(src_path: str, dst_path: str, cfg: argparse.Namespace) -> tuple[int, int, int]:
    clear_scene()

    bpy.ops.import_scene.gltf(filepath=src_path)

    mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not mesh_objects:
        print(f"[SKIP] {os.path.basename(src_path)}: no mesh objects")
        return (0, 0, 0)

    tri_info = []
    for obj in mesh_objects:
        tris = tri_count(obj.data)
        thinness = object_thinness_ratio(obj)
        tri_info.append((obj, tris, thinness))

    sorted_by_tris = sorted(tri_info, key=lambda t: t[1], reverse=True)
    heavy_set = set()
    if cfg.top_heavy_count > 0:
        for obj, _, _ in sorted_by_tris[: cfg.top_heavy_count]:
            heavy_set.add(obj.name_full)

    decimated_objects = 0
    tris_before = sum(t[1] for t in tri_info)

    print(f"\n=== {os.path.basename(src_path)} ===")
    for obj, tris, thinness in sorted_by_tris:
        is_heavy_pick = cfg.top_heavy_count == 0 or obj.name_full in heavy_set
        ratio = compute_target_ratio(tris, thinness, is_heavy_pick, cfg)
        target_tris = max(cfg.min_tris_keep, int(round(tris * ratio)))

        if ratio < 0.999 and target_tris < tris:
            decimated_objects += 1
            print(
                f"  DECIMATE {obj.name}: tris={tris}, thin={thinness:.4f}, "
                f"ratio={ratio:.3f}, target~{target_tris}"
            )
            apply_decimate(obj, ratio, cfg.dry_run)
        else:
            reason = "protected"
            if tris >= cfg.heavy_min_tris and cfg.top_heavy_count > 0 and not is_heavy_pick:
                reason = "not-in-top-heavy"
            elif tris < cfg.heavy_min_tris:
                reason = "below-heavy-min"
            elif tris < cfg.protect_below_tris:
                reason = "below-protect-threshold"
            print(
                f"  KEEP     {obj.name}: tris={tris}, thin={thinness:.4f}, reason={reason}"
            )

    tris_after = tris_before
    if not cfg.dry_run:
        tris_after = sum(tri_count(obj.data) for obj in mesh_objects)
        export_glb(dst_path)

    print(
        f"  TOTAL: {tris_before} -> {tris_after} tris, "
        f"objects decimated: {decimated_objects}/{len(mesh_objects)}"
    )

    return tris_before, tris_after, decimated_objects


def main() -> int:
    cfg = parse_args()

    base_dir = os.path.abspath(cfg.dir)
    if not os.path.isdir(base_dir):
        print(f"Directory not found: {base_dir}")
        return 2

    if cfg.in_place:
        out_dir = base_dir
    else:
        out_dir = os.path.abspath(cfg.out_dir) if cfg.out_dir else os.path.join(base_dir, "optimized")
        os.makedirs(out_dir, exist_ok=True)

    files = [
        f
        for f in sorted(os.listdir(base_dir))
        if os.path.isfile(os.path.join(base_dir, f)) and fnmatch.fnmatch(f.lower(), cfg.pattern.lower())
    ]

    if not files:
        print(f"No files matching '{cfg.pattern}' in {base_dir}")
        return 0

    total_before = 0
    total_after = 0
    total_decimated = 0

    print(f"Processing {len(files)} file(s) in: {base_dir}")
    print(
        "Config: "
        f"top_heavy_count={cfg.top_heavy_count}, heavy_min_tris={cfg.heavy_min_tris}, "
        f"ratios=[<{cfg.medium_threshold}:{cfg.medium_ratio}, "
        f"<{cfg.large_threshold}:{cfg.large_ratio}, >=:{cfg.xlarge_ratio}], "
        f"thin_protect={cfg.thin_ratio_threshold}->{cfg.thin_min_ratio}, "
        f"dry_run={cfg.dry_run}, in_place={cfg.in_place}"
    )

    for filename in files:
        src = os.path.join(base_dir, filename)
        if cfg.in_place:
            dst = src
        else:
            name, ext = os.path.splitext(filename)
            dst = os.path.join(out_dir, f"{name}{cfg.suffix}{ext}")

        before, after, decimated = process_one_file(src, dst, cfg)
        total_before += before
        total_after += after
        total_decimated += decimated

    print("\n=== Summary ===")
    print(f"Files: {len(files)}")
    print(f"Triangles: {total_before} -> {total_after}")
    if total_before > 0:
        pct = 100.0 * (1.0 - (total_after / total_before))
        print(f"Reduction: {pct:.2f}%")
    print(f"Objects decimated: {total_decimated}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
