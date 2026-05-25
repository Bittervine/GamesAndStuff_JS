# Quaternius Character Foundation

Source packs:

- Universal Base Characters, Standard free version
- Universal Animation Library, Standard free version
- Universal Animation Library 2, Standard free version

License: CC0 1.0 Universal. See `LICENSE_Quaternius_CC0.txt`.

Imported slice:

- `base/Superhero_Male_FullBody.gltf` plus its buffer and referenced textures.
- `animations/UAL1_Standard.glb`
- `animations/UAL2_Standard.glb`

Import notes:

- The base mesh is a source/reference asset at 14,318 triangles, so it still needs decimation or LOD work before it meets the current 7k runtime budget.
- The animation GLBs use the same Quaternius humanoid bone names as the base character and should be retargeted onto derived enemy meshes.
- The copied glTF has two texture URI aliases normalized to local file names: `T_Hair_1_Normal.png` and `T_Eye_Normal.png`.
