"""
PHASE 1 — FROG BLOCK-OUT
Red-Eyed Tree Frog (Agalychnis callidryas), stylized GTA IV-era, item-hover pose.

Goal: rough proportions + silhouette approval BEFORE adding detail.
- Body: flattened sphere
- Head: distinct bump forward, slightly smaller than body
- Eyes: large dome bumps (signature red-eyed trait)
- Front legs: angled out + forward, splayed
- Back legs: folded Z-shape, larger, toe pads visible
- Mouth line: visible at front
- Total: ~200 polys at this phase (block-out), will subdivide in Phase 2

This is just a SCULPT. No UV, no textures, no materials yet. Just shape.
Render shows silhouette + proportion.
"""

import bpy
import math
import os

OUT_DIR = "/Users/dannykamensky/Desktop/anura-systems-3d/public/assets/textures"
os.makedirs(OUT_DIR, exist_ok=True)
OUT_PATH = os.path.join(OUT_DIR, "frog_blockout.png")

# ====== scene setup ======
bpy.ops.wm.read_factory_settings(use_empty=True)

# world background — dark warm so silhouette is readable
world = bpy.data.worlds.new("PreviewWorld")
bpy.context.scene.world = world
sky = world.node_tree.nodes["Background"]
sky.inputs["Color"].default_value = (0.06, 0.07, 0.06, 1)
sky.inputs["Strength"].default_value = 0.4

# ====== lights ======
bpy.ops.object.light_add(type='SUN', location=(3, -2, 4))
sun = bpy.context.object
sun.data.energy = 4
sun.data.color = (1.0, 0.95, 0.85)

bpy.ops.object.light_add(type='SUN', location=(-2, 1, 1))
fill = bpy.context.object
fill.data.energy = 1.5
fill.data.color = (0.85, 0.9, 0.7)

bpy.ops.object.light_add(type='SUN', location=(0, 0, -3))
rim = bpy.context.object
rim.data.energy = 2
rim.data.color = (1.0, 0.85, 0.6)

# ====== camera ======
bpy.ops.object.camera_add(location=(2.2, -2.4, 1.3), rotation=(1.05, -0.5, 0.25))
cam = bpy.context.object
bpy.context.scene.camera = cam
cam.data.lens = 50

# ====== FROG BLOCK-OUT ======
# All meshes get a neutral grey material so we see pure form
def grey_mat(name):
    m = bpy.data.materials.new(name=name)
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.55, 0.55, 0.55, 1)
        bsdf.inputs["Roughness"].default_value = 0.7
    return m

GREY = grey_mat("blockout_grey")

def add_sphere(name, loc, radius, scale=(1,1,1), material=None):
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=radius, segments=14, ring_count=10,
        location=loc, scale=scale,
    )
    obj = bpy.context.object
    obj.name = name
    mat = material or GREY
    obj.data.materials.append(mat)
    return obj

# root empty for grouping
root = bpy.data.objects.new("FrogRoot", None)
bpy.context.collection.objects.link(root)
bpy.context.view_layer.objects.active = root

parts = []

# BODY — flattened, broader than tall (red-eyed tree frogs are wider than tall)
# Item-hover: head faces -Z (camera), so positive Z = rear, negative Z = front/face
parts.append(add_sphere("body", (0, 0, 0), 0.55, scale=(1.4, 0.55, 1.0)))

# HEAD — distinct bump forward (-Z direction = toward camera)
parts.append(add_sphere("head", (0, 0.05, -0.50), 0.42, scale=(1.1, 0.85, 0.85)))

# EYE DOMES — prominent (red-eyed tree frog trait)
parts.append(add_sphere("eye_L", (-0.25, 0.22, -0.62), 0.18))
parts.append(add_sphere("eye_R", ( 0.25, 0.22, -0.62), 0.18))

# FRONT LEGS — splayed forward + outward
for sign in [-1, 1]:
    parts.append(add_sphere(f"leg_F{['L','R'][sign>0]}_upper",
                            (sign*0.42, -0.05, -0.30), 0.12, scale=(0.8, 1.3, 0.8)))
    parts.append(add_sphere(f"leg_F{['L','R'][sign>0]}_fore",
                            (sign*0.65, -0.25, -0.42), 0.10, scale=(0.8, 1.0, 1.3)))
    parts.append(add_sphere(f"foot_F{['L','R'][sign>0]}",
                            (sign*0.80, -0.35, -0.40), 0.13, scale=(1.2, 0.5, 1.4)))

# BACK LEGS — folded Z-shape, larger than front, angled out
for sign in [-1, 1]:
    parts.append(add_sphere(f"leg_B{['L','R'][sign>0]}_thigh",
                            (sign*0.45, 0.0, 0.20), 0.18, scale=(0.9, 0.9, 1.4)))
    parts.append(add_sphere(f"leg_B{['L','R'][sign>0]}_calf",
                            (sign*0.65, -0.10, 0.45), 0.13, scale=(0.8, 0.8, 1.3)))
    parts.append(add_sphere(f"foot_B{['L','R'][sign>0]}",
                            (sign*0.80, -0.32, 0.20), 0.16, scale=(1.3, 0.5, 1.4)))

# TOE PADS — sticky disc pads on each foot (signature tree-frog trait)
for sign in [-1, 1]:
    for i, (dx, dz) in enumerate([(-0.04, -0.05), (0, 0.05), (0.04, -0.05)]):
        # front foot pads
        parts.append(add_sphere(f"pad_FL_{sign}_{i}",
                                (sign*0.85 + dx, -0.36, -0.45 + dz), 0.04, scale=(1.0, 0.4, 1.0)))
        parts.append(add_sphere(f"pad_FR_{sign}_{i}",
                                (sign*0.85 + dx, -0.36, -0.45 + dz), 0.04, scale=(1.0, 0.4, 1.0)))
        # back foot pads
        parts.append(add_sphere(f"pad_BL_{sign}_{i}",
                                (sign*0.85 + dx, -0.33, 0.18 + dz), 0.04, scale=(1.0, 0.4, 1.0)))
        parts.append(add_sphere(f"pad_BR_{sign}_{i}",
                                (sign*0.85 + dx, -0.33, 0.18 + dz), 0.04, scale=(1.0, 0.4, 1.0)))

# parent all to root
for p in parts:
    p.parent = root
    p.matrix_parent_inverse = root.matrix_world.inverted()

# apply transforms
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# ====== render ======
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 16
scene.render.resolution_x = 800
scene.render.resolution_y = 600
scene.render.film_transparent = True
scene.render.filepath = OUT_PATH

bpy.ops.render.render(write_still=True)

# stats
polys = sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type == 'MESH')
print(f"✓ Block-out rendered: {OUT_PATH}")
print(f"  Parts: {len(parts)} meshes, {polys} polys total")