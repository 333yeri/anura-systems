"""
Sculpt a stylized low-poly tree frog based on the photoreal reference at
~/Downloads/frog.png. Built from primitive spheres (more reliable than
metaballs across Blender versions).
"""

import bpy
import os

PROJECT_ROOT = "/Users/dannykamensky/Desktop/anura-systems-3d"
OUT_PATH = os.path.join(PROJECT_ROOT, "public", "assets", "models", "char__frog__v01.glb")

def hex_to_rgba(hex_str, alpha=1.0):
    h = hex_str.lstrip('#')
    return [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)] + [alpha]

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def mat(name, base_hex, roughness=0.55, metallic=0.0):
    m = bpy.data.materials.new(name=name)
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = hex_to_rgba(base_hex)
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    return m

# Stylized palette
M_BODY   = mat("frog_body",   "#5fa83a")
M_BELLY  = mat("frog_belly",  "#9bc066")
M_EYE    = mat("frog_eye",    "#f0c050", roughness=0.3)
M_PUPIL  = mat("frog_pupil",  "#0a0a0a", roughness=0.2)
M_SPOT   = mat("frog_spot",   "#3d6b22")

# material lookup by name — survives the sphere-add purge
MATERIALS = {m.name: m for m in bpy.data.materials}

def add_sphere(name, loc, radius, segments=14, rings=10, scale=(1,1,1), mat_name=None):
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=radius, segments=segments, ring_count=rings,
        location=loc, scale=scale,
    )
    obj = bpy.context.object
    obj.name = name
    if mat_name:
        # look up by name each call to dodge reference staleness
        m = bpy.data.materials.get(mat_name)
        if m is not None:
            obj.data.materials.append(m)
    return obj

def parent_to(obj, parent):
    obj.parent = parent
    obj.matrix_parent_inverse = parent.matrix_world.inverted()

print("=== Sculpting stylized tree frog ===")
clear_scene()

# Re-create materials after clear_scene
M_BODY   = mat("frog_body",   "#5fa83a")
M_BELLY  = mat("frog_belly",  "#9bc066")
M_EYE    = mat("frog_eye",    "#f0c050", roughness=0.3)
M_PUPIL  = mat("frog_pupil",  "#0a0a0a", roughness=0.2)
M_SPOT   = mat("frog_spot",   "#3d6b22")

root = bpy.data.objects.new("FrogRoot", None)
bpy.context.collection.objects.link(root)
bpy.context.view_layer.objects.active = root

parts = []

# Body, belly, head, mouth, nostrils
parts.append(add_sphere("body",   (0, 0, 0), 0.50, scale=(1.0, 0.85, 1.15), mat_name="frog_body"))
parts.append(add_sphere("belly",  (0, -0.18, 0.05), 0.45, scale=(1.0, 0.7, 1.05), mat_name="frog_belly"))
parts.append(add_sphere("head",   (0, 0.05, 0.42), 0.38, scale=(0.95, 0.85, 0.9), mat_name="frog_body"))
parts.append(add_sphere("mouth",  (0, -0.05, 0.62), 0.18, scale=(1.6, 0.15, 0.3), mat_name="frog_spot"))
parts.append(add_sphere("nostril_L", (-0.08, 0.10, 0.74), 0.025, segments=8, rings=6, mat_name="frog_pupil"))
parts.append(add_sphere("nostril_R", ( 0.08, 0.10, 0.74), 0.025, segments=8, rings=6, mat_name="frog_pupil"))

# Eyes — domes, irises, pupils
parts.append(add_sphere("eye_dome_L", (-0.18, 0.30, 0.40), 0.16, segments=18, rings=14, mat_name="frog_body"))
parts.append(add_sphere("eye_dome_R", ( 0.18, 0.30, 0.40), 0.16, segments=18, rings=14, mat_name="frog_body"))
parts.append(add_sphere("iris_L",     (-0.18, 0.36, 0.48), 0.09, segments=18, rings=14, mat_name="frog_eye"))
parts.append(add_sphere("iris_R",     ( 0.18, 0.36, 0.48), 0.09, segments=18, rings=14, mat_name="frog_eye"))
parts.append(add_sphere("pupil_L",    (-0.16, 0.38, 0.55), 0.038, segments=12, rings=8, mat_name="frog_pupil"))
parts.append(add_sphere("pupil_R",    ( 0.20, 0.38, 0.55), 0.038, segments=12, rings=8, mat_name="frog_pupil"))

# Front legs
for sign in [-1, 1]:
    parts.append(add_sphere(f"leg_F{['L','R'][sign>0]}_upper", (sign*0.42, -0.08, 0.20), 0.13, scale=(0.8, 1.5, 0.8), mat_name="frog_body"))
    parts.append(add_sphere(f"leg_F{['L','R'][sign>0]}_fore",  (sign*0.62, -0.30, 0.30), 0.10, scale=(0.8, 1.3, 0.8), mat_name="frog_body"))
    parts.append(add_sphere(f"foot_F{['L','R'][sign>0]}",      (sign*0.78, -0.42, 0.40), 0.14, scale=(1.2, 0.5, 1.4), mat_name="frog_body"))

# Back legs
for sign in [-1, 1]:
    parts.append(add_sphere(f"leg_B{['L','R'][sign>0]}_thigh", (sign*0.42,  0.05, -0.18), 0.18, scale=(0.8, 0.8, 1.4), mat_name="frog_body"))
    parts.append(add_sphere(f"leg_B{['L','R'][sign>0]}_calf",  (sign*0.58, -0.05, -0.40), 0.13, scale=(0.8, 0.8, 1.2), mat_name="frog_body"))
    parts.append(add_sphere(f"foot_B{['L','R'][sign>0]}",      (sign*0.72, -0.30, -0.20), 0.15, scale=(1.2, 0.5, 1.4), mat_name="frog_body"))

# Toe pads
front_pads = [(-0.86, -0.46,  0.42), (-0.80, -0.46,  0.50), (-0.72, -0.46,  0.50), (-0.66, -0.46,  0.42),
              ( 0.86, -0.46,  0.42), ( 0.80, -0.46,  0.50), ( 0.72, -0.46,  0.50), ( 0.66, -0.46,  0.42)]
back_pads  = [(-0.80, -0.46, -0.20), (-0.74, -0.46, -0.10), (-0.68, -0.46, -0.10), (-0.62, -0.46, -0.20),
              ( 0.80, -0.46, -0.20), ( 0.74, -0.46, -0.10), ( 0.68, -0.46, -0.10), ( 0.62, -0.46, -0.20)]
for i, (x, y, z) in enumerate(front_pads + back_pads):
    parts.append(add_sphere(f"toepad_{i}", (x, y, z), 0.045, segments=10, rings=8, scale=(1.0, 0.5, 1.0), mat_name="frog_body"))

# Dark spots
spots = [(0.05, 0.30, -0.10), (-0.18, 0.28, 0.05), (0.22, 0.28, 0.05),
         (0.0,  0.25, -0.30), (0.15, 0.22, 0.25), (-0.15, 0.22, 0.25)]
for i, (x, y, z) in enumerate(spots):
    parts.append(add_sphere(f"spot_{i}", (x, y, z), 0.06, segments=10, rings=8, scale=(1.0, 0.4, 1.0), mat_name="frog_spot"))

# Parent all parts to root
for p in parts:
    parent_to(p, root)

# Smooth shading
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        for poly in obj.data.polygons:
            poly.use_smooth = True

# Apply transforms
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=OUT_PATH,
    export_format='GLB',
    export_apply=True,
    export_image_format='JPEG',
    export_jpeg_quality=85,
    export_materials='EXPORT',
)

polys = sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type == 'MESH')
size = os.path.getsize(OUT_PATH) / 1024
print(f"✓ Frog: {polys} polys, {size:.1f} KB → {OUT_PATH}")