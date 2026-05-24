"""Build textured planet GLB models from assets/planet_map_*.png.

Run with Blender:
  blender --background --python ThoriumGap_JS/devel/build_planet_models.py
"""

from __future__ import annotations

import re
from pathlib import Path

import bpy


# Folder containing ThoriumGap.html. Edit this if the project is moved.
BASE_DIR = Path(r"c:\Portable\0Networkshare\GitHub\GamesAndStuff_JS\ThoriumGap_JS\devel\darker_planets")

ASSETS_DIR = BASE_DIR
MODELS_DIR = BASE_DIR
TEXTURE_PATTERN = "planet_map_*.png"
SPHERE_SEGMENTS = 100
SPHERE_RINGS = 50
SPHERE_RADIUS = 1.0


def clean_name(stem: str) -> str:
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", stem).strip("_")


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()

    for collection in (
        bpy.data.meshes,
        bpy.data.materials,
        bpy.data.images,
        bpy.data.textures,
    ):
        for item in list(collection):
            collection.remove(item)


def make_planet_material(texture_path: Path) -> bpy.types.Material:
    image = bpy.data.images.load(str(texture_path))

    material = bpy.data.materials.new(f"{texture_path.stem}_mat")
    material.use_nodes = True
    material.diffuse_color = (1.0, 1.0, 1.0, 1.0)

    nodes = material.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    texture_node = nodes.new(type="ShaderNodeTexImage")
    texture_node.image = image

    material.node_tree.links.new(texture_node.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.9
    bsdf.inputs["Metallic"].default_value = 0.0

    return material


def build_planet(texture_path: Path) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=SPHERE_SEGMENTS,
        ring_count=SPHERE_RINGS,
        radius=SPHERE_RADIUS,
        location=(0, 0, 0),
    )
    planet = bpy.context.object
    planet.name = clean_name(texture_path.stem)
    planet.data.name = f"{planet.name}_mesh"
    planet.data.materials.append(make_planet_material(texture_path))

    bpy.ops.object.shade_smooth()
    return planet


def export_glb(output_path: Path) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.object.select_set(True)
    bpy.context.view_layer.objects.active = bpy.context.object

    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format="GLB",
        use_selection=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_yup=True,
    )


def main() -> int:
    texture_paths = sorted(ASSETS_DIR.glob(TEXTURE_PATTERN))

    if not texture_paths:
        print(f"No matching textures found in {ASSETS_DIR}: {TEXTURE_PATTERN}")
        return 1

    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    exported = 0
    for texture_path in texture_paths:
        model_name = f"{clean_name(texture_path.stem)}.glb"
        output_path = MODELS_DIR / model_name

        reset_scene()
        planet = build_planet(texture_path)
        bpy.context.view_layer.objects.active = planet
        export_glb(output_path)
        print(f"Exported {output_path}")
        exported += 1

    print(f"Done. Exported {exported}.")
    return 0


if __name__ == "__main__":
    main()
