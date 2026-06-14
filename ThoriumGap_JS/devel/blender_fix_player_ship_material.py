#!/usr/bin/env python3
"""
Fix player_spaceship.glb material wiring for Unreal.

This script:
- Imports player_spaceship.glb into Blender.
- Finds the texture/image named "shaded".
- Connects that texture to Principled BSDF Base Color.
- Keeps optional low-strength emission.
- Sets sane metallic/roughness values.
- Exports a corrected GLB.

Run with:
    blender --background --python fix_player_spaceship_glb_material.py -- player_spaceship.glb player_spaceship_fixed.glb

Or run from a repository/root folder with no arguments and it will search for player_spaceship.glb:
    blender --background --python fix_player_spaceship_glb_material.py
"""

from pathlib import Path
import sys
import bpy


def script_args() -> list[str]:
    if "--" in sys.argv:
        return sys.argv[sys.argv.index("--") + 1:]
    return []


def find_default_input() -> Path:
    matches = sorted(Path.cwd().rglob("player_spaceship.glb"))
    if not matches:
        raise SystemExit("ERROR: Could not find player_spaceship.glb under the current directory.")
    if len(matches) > 1:
        print("ERROR: Found multiple player_spaceship.glb files:")
        for match in matches:
            print(f"    {match}")
        raise SystemExit("Please pass the input path explicitly.")
    return matches[0]


def find_socket(node, names: list[str]):
    wanted = {name.lower() for name in names}
    for socket in node.inputs:
        if socket.name.lower() in wanted:
            return socket
    return None


def set_socket_value(node, names: list[str], value) -> bool:
    socket = find_socket(node, names)
    if socket is None:
        return False

    try:
        socket.default_value = value
        return True
    except Exception:
        return False


def remove_links_to_input(node_tree, input_socket):
    for link in list(node_tree.links):
        if link.to_socket == input_socket:
            node_tree.links.remove(link)


def find_principled_bsdf(node_tree):
    for node in node_tree.nodes:
        if node.type == "BSDF_PRINCIPLED":
            return node

    bsdf = node_tree.nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (250, 100)

    output = None
    for node in node_tree.nodes:
        if node.type == "OUTPUT_MATERIAL":
            output = node
            break

    if output is None:
        output = node_tree.nodes.new(type="ShaderNodeOutputMaterial")
        output.location = (550, 100)

    surface_input = find_socket(output, ["Surface"])
    bsdf_output = bsdf.outputs.get("BSDF")
    if surface_input and bsdf_output:
        remove_links_to_input(node_tree, surface_input)
        node_tree.links.new(bsdf_output, surface_input)

    return bsdf


def image_score(image) -> int:
    name = (image.name or "").lower()
    path = (image.filepath or "").lower()
    score = 0
    if "shaded" in name:
        score += 100
    if "shaded" in path:
        score += 100
    if "player" in name or "spaceship" in name:
        score += 10
    if "player" in path or "spaceship" in path:
        score += 10
    return score


def find_shaded_image():
    images = list(bpy.data.images)
    scored = [(image_score(image), image) for image in images]
    scored.sort(key=lambda item: item[0], reverse=True)

    if scored and scored[0][0] > 0:
        return scored[0][1]

    print("ERROR: Could not find an image whose name or filepath contains 'shaded'.")
    print("Images found in imported GLB:")
    for image in images:
        print(f"    name={image.name!r}, filepath={image.filepath!r}")
    raise SystemExit("No suitable shaded texture found.")


def find_or_create_image_node(node_tree, image):
    for node in node_tree.nodes:
        if node.type == "TEX_IMAGE" and node.image == image:
            return node

    node = node_tree.nodes.new(type="ShaderNodeTexImage")
    node.name = "TG_Shaded_BaseColor_Texture"
    node.label = "TG shaded texture"
    node.image = image
    node.location = (-350, 100)
    return node


def material_uses_mesh(mat) -> bool:
    return mat is not None and isinstance(mat, bpy.types.Material)


def fix_material(mat, shaded_image) -> dict:
    mat.use_nodes = True
    mat.blend_method = "OPAQUE"
    mat.use_screen_refraction = False
    mat.diffuse_color = (1.0, 1.0, 1.0, 1.0)

    node_tree = mat.node_tree
    bsdf = find_principled_bsdf(node_tree)
    tex_node = find_or_create_image_node(node_tree, shaded_image)

    color_output = tex_node.outputs.get("Color")
    if color_output is None:
        raise RuntimeError(f"Texture node in material {mat.name} has no Color output.")

    base_color_input = find_socket(bsdf, ["Base Color"])
    if base_color_input is None:
        raise RuntimeError(f"Principled BSDF in material {mat.name} has no Base Color input.")

    remove_links_to_input(node_tree, base_color_input)
    node_tree.links.new(color_output, base_color_input)

    set_socket_value(bsdf, ["Base Color"], (1.0, 1.0, 1.0, 1.0))
    set_socket_value(bsdf, ["Metallic"], 0.0)
    set_socket_value(bsdf, ["Roughness"], 0.55)
    set_socket_value(bsdf, ["Alpha"], 1.0)

    emission_connected = False
    emission_input = find_socket(bsdf, ["Emission Color", "Emission"])
    if emission_input is not None:
        remove_links_to_input(node_tree, emission_input)
        node_tree.links.new(color_output, emission_input)
        emission_connected = True

    emission_strength_set = set_socket_value(bsdf, ["Emission Strength"], 0.35)

    return {
        "material": mat.name,
        "base_color_connected": True,
        "emission_connected": emission_connected,
        "emission_strength_set": emission_strength_set,
    }


def main():
    args = script_args()

    if len(args) >= 1:
        input_path = Path(args[0]).expanduser().resolve()
    else:
        input_path = find_default_input().resolve()

    if len(args) >= 2:
        output_path = Path(args[1]).expanduser().resolve()
    else:
        output_path = input_path.with_name(input_path.stem + "_fixed.glb")

    if not input_path.exists():
        raise SystemExit(f"ERROR: Input file does not exist: {input_path}")

    if output_path == input_path:
        raise SystemExit("ERROR: Refusing to overwrite the input GLB. Choose a different output path.")

    print(f"Importing: {input_path}")

    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()

    bpy.ops.import_scene.gltf(filepath=str(input_path))

    mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not mesh_objects:
        raise SystemExit("ERROR: No mesh objects were imported from the GLB.")

    shaded_image = find_shaded_image()
    print(f"Selected shaded texture: name={shaded_image.name!r}, filepath={shaded_image.filepath!r}")

    materials = []
    seen = set()
    for obj in mesh_objects:
        for slot in obj.material_slots:
            mat = slot.material
            if material_uses_mesh(mat) and mat.name not in seen:
                seen.add(mat.name)
                materials.append(mat)

    if not materials:
        raise SystemExit("ERROR: Imported mesh has no materials to fix.")

    print("Materials found:")
    for mat in materials:
        print(f"    {mat.name}")

    reports = []
    for mat in materials:
        reports.append(fix_material(mat, shaded_image))

    print("Material fix report:")
    for report in reports:
        print(
            "    "
            f"material={report['material']!r}, "
            f"base_color_connected={report['base_color_connected']}, "
            f"emission_connected={report['emission_connected']}, "
            f"emission_strength_set={report['emission_strength_set']}"
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"Exporting corrected GLB: {output_path}")
    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format="GLB",
        export_materials="EXPORT",
        export_texcoords=True,
        export_normals=True,
        export_yup=True,
        export_apply=False,
    )

    print("Done.")
    print(f"Corrected GLB written to: {output_path}")


if __name__ == "__main__":
    main()
