"""
Decimate the Yeri character and 5 tree .glb files for the Anura Systems 3D site.

Target: < 2MB total site load. Yeri is currently 12.7MB and trees are ~7MB each.
Plan: keep visual silhouette, drop redundant geometry, collapse textures to small JPEGs.

Run with:
  /Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/decimate_assets.py

Output: replaces the same filenames in /public/assets/models/ with decimated versions.
"""

import bpy
import os
import sys

PROJECT_ROOT = "/Users/dannykamensky/Desktop/anura-systems-3d"
ASSETS_DIR = os.path.join(PROJECT_ROOT, "public", "assets", "models")

# Targets: (input_filename, output_filename, target_face_count, texture_max_size)
TARGETS = [
    ("char__yeri__v01.glb",  "char__yeri__v01.glb",  8000,  512),
    ("tree__v01.glb",        "tree__v01.glb",        3000,  512),
    ("tree__v02.glb",        "tree__v02.glb",        3000,  512),
    ("tree__v03.glb",        "tree__v03.glb",        3000,  512),
    ("tree__v04.glb",        "tree__v04.glb",        3000,  512),
    ("tree__v05.glb",        "tree__v05.glb",        3000,  512),
]

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def import_glb(path):
    bpy.ops.import_scene.gltf(filepath=path)

def decimate_object(obj, target_faces):
    if obj.type != 'MESH':
        return 0, 0
    before = len(obj.data.polygons)
    mod = obj.modifiers.new(name="Decimate", type='DECIMATE')
    mod.ratio = min(1.0, target_faces / max(before, 1))
    mod.use_collapse_triangulate = True
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=mod.name)
    after = len(obj.data.polygons)
    return before, after

def shrink_textures(max_size):
    for img in bpy.data.images:
        if img.size[0] > max_size or img.size[1] > max_size:
            scale = max_size / max(img.size)
            img.scale(int(img.size[0] * scale), int(img.size[1] * scale))

def export_glb(path):
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format='GLB',
        export_apply=True,
        export_image_format='JPEG',
        export_jpeg_quality=85,
        export_materials='EXPORT',
        export_animations=True,
        export_skins=True,
        export_morph=True,
    )

def process(input_name, output_name, target_faces, tex_max):
    src = os.path.join(ASSETS_DIR, input_name)
    if not os.path.exists(src):
        print(f"  SKIP — not found: {input_name}")
        return

    clear_scene()
    import_glb(src)

    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    total_before = sum(len(o.data.polygons) for o in meshes)
    # distribute target across all meshes by current poly count
    for o in meshes:
        share = int(target_faces * (len(o.data.polygons) / max(total_before, 1)))
        before, after = decimate_object(o, share)
        print(f"  {o.name}: {before} → {after} faces")
    total_after = sum(len(o.data.polygons) for o in meshes)

    shrink_textures(tex_max)

    tmp = os.path.join(ASSETS_DIR, "_tmp_" + output_name)
    export_glb(tmp)
    os.replace(tmp, os.path.join(ASSETS_DIR, output_name))

    new_size = os.path.getsize(os.path.join(ASSETS_DIR, output_name)) / 1024 / 1024
    print(f"  ✓ {output_name}: {total_before}→{total_after} polys, {new_size:.2f} MB")

print("=== Decimating ANURA assets ===")
for inp, outp, faces, tex in TARGETS:
    print(f"\n[{inp}]")
    process(inp, outp, faces, tex)
print("\n=== Done ===")