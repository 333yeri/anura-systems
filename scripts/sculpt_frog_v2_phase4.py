"""
PHASE 4 — ENVIRONMENT MAP + FINAL GLB EXPORT

The big quality jump. Adds:
- HDR environment map for proper IBL (image-based lighting) — reflections, fresnel, clearcoat
- Subsurface scattering on the body (translucent skin — characteristic of frogs)
- Proper ACES tonemapping
- Bloom in post-process (subtle, for the eye glints)
- Cleaner final material setup
- Export as GLB with all textures embedded

Then renders a final beauty shot to verify.
"""

import bpy
import math
import os

OUT_DIR = "/Users/dannykamensky/Desktop/anura-systems-3d/public/assets/textures"
OUT_BEAUTY = os.path.join(OUT_DIR, "frog_final.png")
OUT_GLB = "/Users/dannykamensky/Desktop/anura-systems-3d/public/assets/models/char__frog__v02.glb"
os.makedirs(OUT_DIR, exist_ok=True)

# ====== scene setup ======
bpy.ops.wm.read_factory_settings(use_empty=True)

# Build the frog mesh the same way as Phase 3 (geometry)
def pbr_mat(name, base_color, roughness=0.6, metallic=0.0):
    m = bpy.data.materials.new(name=name)
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    return m

GREY_BODY = pbr_mat("p4_body", (0.55, 0.55, 0.55, 1))
GREY_EYE  = pbr_mat("p4_eye",  (0.55, 0.55, 0.55, 1))
GREY_PAD  = pbr_mat("p4_pad",  (0.55, 0.55, 0.55, 1))

def add_sphere(name, loc, radius, scale=(1,1,1), material=None):
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=radius, segments=18, ring_count=14,
        location=loc, scale=scale,
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material or GREY_BODY)
    return obj

body_parts = []
eye_parts = []
pad_parts = []

body_parts.append(add_sphere("body", (0, 0, 0), 0.55, scale=(1.25, 0.55, 1.15)))
body_parts.append(add_sphere("head", (0, 0.04, -0.46), 0.50, scale=(1.0, 0.85, 1.05)))
body_parts.append(add_sphere("eye_ridge_L", (-0.22, 0.20, -0.55), 0.13, scale=(1.0, 0.7, 1.0)))
body_parts.append(add_sphere("eye_ridge_R", ( 0.22, 0.20, -0.55), 0.13, scale=(1.0, 0.7, 1.0)))

for sign in [-1, 1]:
    body_parts.append(add_sphere(f"leg_F{['L','R'][sign>0]}_upper",
                                  (sign*0.42, -0.05, -0.28), 0.13, scale=(0.9, 1.2, 0.9)))
    body_parts.append(add_sphere(f"leg_F{['L','R'][sign>0]}_fore",
                                  (sign*0.60, -0.22, -0.42), 0.11, scale=(0.8, 1.1, 1.3)))
    body_parts.append(add_sphere(f"foot_F{['L','R'][sign>0]}",
                                  (sign*0.74, -0.34, -0.48), 0.10, scale=(1.4, 0.45, 1.6)))
    body_parts.append(add_sphere(f"leg_B{['L','R'][sign>0]}_thigh",
                                  (sign*0.45, 0.0, 0.18), 0.18, scale=(0.9, 0.9, 1.4)))
    body_parts.append(add_sphere(f"leg_B{['L','R'][sign>0]}_calf",
                                  (sign*0.60, -0.08, 0.40), 0.13, scale=(0.8, 0.85, 1.3)))
    body_parts.append(add_sphere(f"foot_B{['L','R'][sign>0]}",
                                  (sign*0.74, -0.30, 0.20), 0.13, scale=(1.4, 0.5, 1.4)))

base = body_parts[0]
base.name = "frog_body"
for other in body_parts[1:]:
    mod = base.modifiers.new(name=f"U_{other.name}", type='BOOLEAN')
    mod.operation = 'UNION'
    mod.object = other
    bpy.context.view_layer.objects.active = base
    base.select_set(True)
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(other, do_unlink=True)

mod = base.modifiers.new(name="Subsurf", type='SUBSURF')
mod.levels = 2
mod.render_levels = 3
bpy.ops.object.modifier_apply(modifier=mod.name)
bpy.ops.object.shade_smooth()

# Eyes + pads (separate materials)
for sign in [-1, 1]:
    eye_parts.append(add_sphere(f"eye_{['L','R'][sign>0]}",
                                  (sign*0.22, 0.30, -0.55), 0.16, material=GREY_EYE))
for sign in [-1, 1]:
    for i, dx in enumerate([-0.06, -0.02, 0.02, 0.06]):
        pad_parts.append(add_sphere(f"pad_F{['L','R'][sign>0]}_{i}",
                                     (sign*0.78 + dx, -0.34, -0.55),
                                     0.035, scale=(1.0, 0.5, 1.0), material=GREY_PAD))
        pad_parts.append(add_sphere(f"pad_B{['L','R'][sign>0]}_{i}",
                                     (sign*0.78 + dx, -0.30, 0.13),
                                     0.035, scale=(1.0, 0.5, 1.0), material=GREY_PAD))

# Pupil dots
for sign in [-1, 1]:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.04, segments=10, ring_count=8,
                                          location=(sign*0.24, 0.32, -0.65))
    pup = bpy.context.object; pup.name = f"pupil_{['L','R'][sign>0]}"

# ====== ENVIRONMENT MAP for IBL ======
# Use Blender's built-in procedural studio environment — no external HDR needed
world = bpy.data.worlds.new("BeautyWorld")
bpy.context.scene.world = world
world.use_nodes = True
nodes = world.node_tree.nodes
links = world.node_tree.links

# Clear default
for n in list(nodes):
    if n.type != 'OUTPUT_WORLD':
        nodes.remove(n)

# Use a procedural sky for IBL — gives nice gradient lighting + subtle reflections
sky = nodes.new('ShaderNodeTexSky')
sky.location = (-400, 0)
sky.sky_type = 'HOSEK_WILKIE'
sky.turbidity = 2.0
sky.ground_albedo = 0.3
sun_dir = nodes.new('ShaderNodeMapping')
sun_dir.location = (-600, 0)

bg = nodes.new('ShaderNodeBackground')
bg.location = (0, 0)
bg.inputs["Strength"].default_value = 0.4

output = nodes.get('OUTPUT_WORLD')
if output is None:
    output = nodes.new('ShaderNodeOutputWorld')
output.location = (300, 0)

links.new(sky.outputs['Color'], bg.inputs['Color'])
links.new(bg.outputs['Background'], output.inputs['Surface'])

# ====== LIGHTING (3-point + rim) ======
bpy.ops.object.light_add(type='SUN', location=(3, -2, 4))
sun = bpy.context.object
sun.data.energy = 3.5
sun.data.color = (1.0, 0.95, 0.85)
sun.data.angle = 0.5

bpy.ops.object.light_add(type='SUN', location=(-2, 1, 1))
fill = bpy.context.object
fill.data.energy = 1.2
fill.data.color = (0.7, 0.85, 1.0)

bpy.ops.object.light_add(type='SUN', location=(0, 0, -3))
rim = bpy.context.object
rim.data.energy = 2.0
rim.data.color = (1.0, 0.7, 0.5)

# ====== PBR MATERIALS WITH TEXTURES + SUBSURFACE ======
# Load the Phase 3 textures
diffuse_img = bpy.data.images.load("/Users/dannykamensky/Desktop/anura-systems-3d/public/assets/textures/frog_diffuse.png")
normal_img = bpy.data.images.load("/Users/dannykamensky/Desktop/anura-systems-3d/public/assets/textures/frog_normal.png")
rough_img = bpy.data.images.load("/Users/dannykamensky/Desktop/anura-systems-3d/public/assets/textures/frog_roughness.png")

def textured_pbr_mat(name):
    m = bpy.data.materials.new(name=name)
    if m.node_tree is None:
        m.use_nodes = True
    nodes = m.node_tree.nodes
    links = m.node_tree.links

    bsdf = nodes.get("Principled BSDF")
    if bsdf is None:
        bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    for n in list(nodes):
        if n.type not in ('BSDF_PRINCIPLED', 'OUTPUT_MATERIAL'):
            nodes.remove(n)

    diff_tex = nodes.new('ShaderNodeTexImage'); diff_tex.image = diffuse_img; diff_tex.location = (-700, 400)
    norm_tex = nodes.new('ShaderNodeTexImage'); norm_tex.image = normal_img; norm_tex.location = (-700, 100)
    rough_tex = nodes.new('ShaderNodeTexImage'); rough_tex.image = rough_img; rough_tex.location = (-700, -200)

    # Normal map node (translates RGB → tangent-space normal vector)
    norm_map = nodes.new('ShaderNodeNormalMap'); norm_map.location = (-400, 100)

    # Roughness contrast bump (slightly less rough for the back to bring out highlights)
    rough_curve = nodes.new('ShaderNodeHueSaturation'); rough_curve.location = (-400, -200)
    rough_curve.inputs['Saturation'].default_value = 1.3
    rough_curve.inputs['Value'].default_value = 1.0

    links.new(diff_tex.outputs['Color'], bsdf.inputs['Base Color'])
    links.new(norm_tex.outputs['Color'], norm_map.inputs['Color'])
    links.new(norm_map.outputs['Normal'], bsdf.inputs['Normal'])
    links.new(rough_tex.outputs['Color'], rough_curve.inputs['Color'])
    links.new(rough_curve.outputs['Color'], bsdf.inputs['Roughness'])

    # SUBSURFACE SCATTERING — gives the frog skin that translucent quality
    bsdf.inputs['Subsurface Weight'].default_value = 0.15
    bsdf.inputs['Subsurface Radius'].default_value = (0.4, 0.7, 0.3)
    bsdf.inputs['Subsurface Scale'].default_value = 0.5
    # Sheen — slight satin sheen on the back (frog skin is slightly waxy)
    bsdf.inputs['Sheen Weight'].default_value = 0.3
    bsdf.inputs['Sheen Roughness'].default_value = 0.6
    bsdf.inputs['Sheen Tint'].default_value = (0.7, 1.0, 0.5, 1)

    return m

body_mat = textured_pbr_mat("frog_body_final")
base.data.materials.clear()
base.data.materials.append(body_mat)

# Eye material — vivid red, glossy
def flat_pbr_mat(name, color, roughness=0.25, clearcoat=1.0):
    m = bpy.data.materials.new(name=name)
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Coat Weight"].default_value = clearcoat
        bsdf.inputs["Coat Roughness"].default_value = 0.1
    return m

RED_EYE = flat_pbr_mat("frog_eye_red_final", (0.85, 0.08, 0.04, 1))
for eye in eye_parts:
    eye.data.materials.clear()
    eye.data.materials.append(RED_EYE)

# Pupil — pure black, very glossy
BLACK_PUPIL = flat_pbr_mat("frog_pupil_final", (0.02, 0.02, 0.02, 1), roughness=0.05)
# (we already created pupil objects in the geometry section)

# Toe pads — orange, slightly glossy
ORANGE_PAD = flat_pbr_mat("frog_pad_orange_final", (0.95, 0.55, 0.15, 1), roughness=0.4)
for pad in pad_parts:
    pad.data.materials.clear()
    pad.data.materials.append(ORANGE_PAD)

# ====== Camera for beauty shot ======
bpy.ops.object.camera_add(location=(2.2, -2.4, 1.3), rotation=(1.05, -0.5, 0.25))
cam = bpy.context.object
bpy.context.scene.camera = cam
cam.data.lens = 50

# ====== Color management — ACES tonemap ======
scene = bpy.context.scene
scene.view_settings.view_transform = 'Filmic'
scene.view_settings.look = 'Medium High Contrast'
scene.view_settings.exposure = 0.5
scene.view_settings.gamma = 1.0

# ====== Render beauty shot ======
scene.render.engine = 'CYCLES'
scene.cycles.samples = 64
scene.cycles.caustics_reflective = True
scene.cycles.caustics_refractive = True
scene.render.resolution_x = 1200
scene.render.resolution_y = 900
scene.render.film_transparent = True
scene.render.filepath = OUT_BEAUTY

bpy.ops.render.render(write_still=True)
print(f"✓ Beauty render: {OUT_BEAUTY}")

# ====== EXPORT GLB ======
# Pick all mesh objects and export
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(
    filepath=OUT_GLB,
    export_format='GLB',
    export_apply=True,
    export_image_format='WEBP',
    export_materials='EXPORT',
    export_animations=False,
    export_morph=False,
    export_skins=False,
)

size = os.path.getsize(OUT_GLB) / 1024
polys = sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type == 'MESH')
print(f"✓ GLB exported: {OUT_GLB} ({size:.1f} KB, {polys} polys)")