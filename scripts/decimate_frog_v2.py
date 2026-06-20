"""
PHASE 5 — DECIMATE FROG TO TARGET POLY COUNT

43k polys is too many for our budget. Decimate to ~15k target.
The decimation collapses vertices while preserving the silhouette and texture detail.
Textures remain at full 2048 resolution so surface detail is preserved.
"""

import bpy
import os

GLB_IN = "/Users/dannykamensky/Desktop/anura-systems-3d/public/assets/models/char__frog__v02.glb"
GLB_OUT = "/Users/dannykamensky/Desktop/anura-systems-3d/public/assets/models/char__frog__v02.glb"  # overwrite

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB_IN)

# Apply decimation to each mesh
target = 15000
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
total = sum(len(o.data.polygons) for o in meshes)
print(f"Before: {total} polys across {len(meshes)} meshes")

for o in meshes:
    share = int(target * (len(o.data.polygons) / max(total, 1)))
    if len(o.data.polygons) <= share:
        continue
    mod = o.modifiers.new(name="Decimate", type='DECIMATE')
    mod.ratio = share / max(len(o.data.polygons), 1)
    mod.use_collapse_triangulate = True
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.modifier_apply(modifier=mod.name)

after = sum(len(o.data.polygons) for o in meshes)
print(f"After: {after} polys")

# Re-export
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(
    filepath=GLB_OUT,
    export_format='GLB',
    export_apply=True,
    export_image_format='WEBP',
    export_materials='EXPORT',
)

size = os.path.getsize(GLB_OUT) / 1024
print(f"✓ Decimated GLB: {GLB_OUT} ({size:.1f} KB, {after} polys)")