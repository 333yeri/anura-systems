"""
PHASE 2 — FROG MESH REFINEMENT (using boolean union)

Boolean union is the cleanest way to merge overlapping spheres into one
continuous mesh — far better than vertex welding.

This produces ONE merged mesh + small detail objects (eyes, toe pads).
"""

import bpy
import math
import os

OUT_DIR = "/Users/dannykamensky/Desktop/anura-systems-3d/public/assets/textures"
os.makedirs(OUT_DIR, exist_ok=True)
OUT_PATH = os.path.join(OUT_DIR, "frog_phase2.png")

# ====== scene setup ======
bpy.ops.wm.read_factory_settings(use_empty=True)

world = bpy.data.worlds.new("PreviewWorld")
bpy.context.scene.world = world
sky = world.node_tree.nodes["Background"]
sky.inputs["Color"].default_value = (0.06, 0.07, 0.06, 1)
sky.inputs["Strength"].default_value = 0.4

bpy.ops.object.light_add(type='SUN', location=(3, -2, 4))
sun = bpy.context.object; sun.data.energy = 4; sun.data.color = (1.0, 0.95, 0.85)
bpy.ops.object.light_add(type='SUN', location=(-2, 1, 1))
fill = bpy.context.object; fill.data.energy = 1.5; fill.data.color = (0.85, 0.9, 0.7)
bpy.ops.object.light_add(type='SUN', location=(0, 0, -3))
rim = bpy.context.object; rim.data.energy = 2; rim.data.color = (1.0, 0.85, 0.6)

bpy.ops.object.camera_add(location=(2.2, -2.4, 1.3), rotation=(1.05, -0.5, 0.25))
cam = bpy.context.object; bpy.context.scene.camera = cam; cam.data.lens = 50

def pbr_mat(name, base_color, roughness=0.6, metallic=0.0):
    m = bpy.data.materials.new(name=name)
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    return m

GREY_BODY = pbr_mat("phase2_body", (0.55, 0.55, 0.55, 1))
GREY_EYE  = pbr_mat("phase2_eye",  (0.55, 0.55, 0.55, 1))
GREY_PAD  = pbr_mat("phase2_pad",  (0.55, 0.55, 0.55, 1))

def add_sphere(name, loc, radius, scale=(1,1,1), material=None):
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=radius, segments=16, ring_count=12,
        location=loc, scale=scale,
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material or GREY_BODY)
    return obj

# Build all the body parts first
body_parts = []
eye_parts = []
pad_parts = []

# Body — sleeker, more elongated
body_parts.append(add_sphere("body", (0, 0, 0), 0.55, scale=(1.25, 0.55, 1.15)))
# Head — bigger and closer so it merges seamlessly with body
body_parts.append(add_sphere("head", (0, 0.04, -0.46), 0.50, scale=(1.0, 0.85, 1.05)))
# Eye ridges
body_parts.append(add_sphere("eye_ridge_L", (-0.22, 0.20, -0.55), 0.13, scale=(1.0, 0.7, 1.0)))
body_parts.append(add_sphere("eye_ridge_R", ( 0.22, 0.20, -0.55), 0.13, scale=(1.0, 0.7, 1.0)))

# Front legs (continuous hip → leg → foot)
for sign in [-1, 1]:
    body_parts.append(add_sphere(f"leg_F{['L','R'][sign>0]}_upper",
                                  (sign*0.42, -0.05, -0.28), 0.13, scale=(0.9, 1.2, 0.9)))
    body_parts.append(add_sphere(f"leg_F{['L','R'][sign>0]}_fore",
                                  (sign*0.60, -0.22, -0.42), 0.11, scale=(0.8, 1.1, 1.3)))
    body_parts.append(add_sphere(f"foot_F{['L','R'][sign>0]}",
                                  (sign*0.74, -0.34, -0.48), 0.10, scale=(1.4, 0.45, 1.6)))

# Back legs
for sign in [-1, 1]:
    body_parts.append(add_sphere(f"leg_B{['L','R'][sign>0]}_thigh",
                                  (sign*0.45, 0.0, 0.18), 0.18, scale=(0.9, 0.9, 1.4)))
    body_parts.append(add_sphere(f"leg_B{['L','R'][sign>0]}_calf",
                                  (sign*0.60, -0.08, 0.40), 0.13, scale=(0.8, 0.85, 1.3)))
    body_parts.append(add_sphere(f"foot_B{['L','R'][sign>0]}",
                                  (sign*0.74, -0.30, 0.20), 0.13, scale=(1.4, 0.5, 1.4)))

# ====== BOOLEAN UNION via iterative modifiers ======
# Start with the first body part as the base
base = body_parts[0]
base.name = "frog_body"

# Add union modifiers for all other body parts
for other in body_parts[1:]:
    mod = base.modifiers.new(name=f"Union_{other.name}", type='BOOLEAN')
    mod.operation = 'UNION'
    mod.object = other
    # Apply modifier
    bpy.context.view_layer.objects.active = base
    base.select_set(True)
    bpy.ops.object.modifier_apply(modifier=mod.name)
    # Delete the consumed source sphere
    bpy.data.objects.remove(other, do_unlink=True)

# Subsurf for smoothness — light subdivision
mod = base.modifiers.new(name="Subsurf", type='SUBSURF')
mod.levels = 1
mod.render_levels = 2
bpy.ops.object.modifier_apply(modifier=mod.name)

# Smooth shading
bpy.ops.object.select_all(action='DESELECT')
base.select_set(True)
bpy.context.view_layer.objects.active = base
bpy.ops.object.shade_smooth()

# ====== EYES (separate, will be red in phase 4) ======
for sign in [-1, 1]:
    eye_parts.append(add_sphere(f"eye_{['L','R'][sign>0]}",
                                  (sign*0.22, 0.30, -0.55), 0.16, material=GREY_EYE))

# ====== TOE PADS (separate, will be orange in phase 4) ======
for sign in [-1, 1]:
    for i, dx in enumerate([-0.06, -0.02, 0.02, 0.06]):
        pad_parts.append(add_sphere(f"pad_F{['L','R'][sign>0]}_{i}",
                                     (sign*0.78 + dx, -0.34, -0.55),
                                     0.035, scale=(1.0, 0.5, 1.0), material=GREY_PAD))
        pad_parts.append(add_sphere(f"pad_B{['L','R'][sign>0]}_{i}",
                                     (sign*0.78 + dx, -0.30, 0.13),
                                     0.035, scale=(1.0, 0.5, 1.0), material=GREY_PAD))

# ====== Detail geometries (mouth, nostrils) ======
# Mouth groove — flat scaled sphere on the snout
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.20, segments=14, ring_count=10,
                                      location=(0, -0.08, -0.78), scale=(1.4, 0.12, 0.4))
mouth = bpy.context.object; mouth.name = "mouth"; mouth.data.materials.append(GREY_BODY)

# Nostrils
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.025, segments=8, ring_count=6,
                                      location=(-0.10, 0.16, -0.78))
nL = bpy.context.object; nL.name = "nostril_L"; nL.data.materials.append(GREY_BODY)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.025, segments=8, ring_count=6,
                                      location=(0.10, 0.16, -0.78))
nR = bpy.context.object; nR.name = "nostril_R"; nR.data.materials.append(GREY_BODY)

# ====== Parent everything to root empty ======
root = bpy.data.objects.new("FrogRoot", None)
bpy.context.collection.objects.link(root)

detail_objects = [base, mouth, nL, nR] + eye_parts + pad_parts
for obj in detail_objects:
    obj.parent = root
    obj.matrix_parent_inverse = root.matrix_world.inverted()

bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = root
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# ====== render ======
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 32
scene.render.resolution_x = 800
scene.render.resolution_y = 600
scene.render.film_transparent = True
scene.render.filepath = OUT_PATH

bpy.ops.render.render(write_still=True)

body_polys = len(base.data.polygons)
total_polys = sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type == 'MESH')
print(f"✓ Phase 2 rendered: {OUT_PATH}")
print(f"  Body (merged): {body_polys} polys")
print(f"  Total scene: {total_polys} polys")
print(f"  Body meshes: {len(body_parts)} → 1")
print(f"  Eye parts: {len(eye_parts)}")
print(f"  Pad parts: {len(pad_parts)}")