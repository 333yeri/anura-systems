"""
PHASE 3 — UV UNWRAP + TEXTURE PAINT

Builds the PBR textures for the Phase 2 merged frog mesh:
- Diffuse (color): bright green body, lighter belly, dark spots, blue side stripes,
  red eyes, orange toe pads
- Normal: subtle skin bumps (raised mottling, toe ridges)
- Roughness: matte belly, slightly glossier back

Process:
1. Re-create Phase 2 frog mesh
2. UV unwrap with seams along belly line + back center line + leg boundaries
3. Project from a top-down view (best for body texture mapping)
4. Create 2048x2048 blank textures
5. Paint diffuse using projected UVs as guides (we'll draw colored regions
   matching the UV island positions)
6. Bake normal map by computing vertex normals then displacing
7. Build final material with all three textures
8. Render

Real production studios use Substance Painter for this step. We're doing
it in pure Blender Python — slower but gets the job done.
"""

import bpy
import math
import os
import sys
# Ensure Pillow is importable inside Blender's Python (it lives at user site-packages)
sys.path.append("/Users/dannykamensky/.local/lib/python3.13/site-packages")

OUT_DIR = "/Users/danny-systems-3d/public/assets/textures" if False else "/Users/dannykamensky/Desktop/anura-systems-3d/public/assets/textures"
os.makedirs(OUT_DIR, exist_ok=True)
OUT_PATH = os.path.join(OUT_DIR, "frog_phase3.png")
TEX_DIFFUSE = os.path.join(OUT_DIR, "frog_diffuse.png")
TEX_NORMAL = os.path.join(OUT_DIR, "frog_normal.png")
TEX_ROUGHNESS = os.path.join(OUT_DIR, "frog_roughness.png")

# ====== scene setup ======
bpy.ops.wm.read_factory_settings(use_empty=True)

world = bpy.data.worlds.new("PreviewWorld")
bpy.context.scene.world = world
sky = world.node_tree.nodes["Background"]
sky.inputs["Color"].default_value = (0.10, 0.12, 0.10, 1)
sky.inputs["Strength"].default_value = 0.5

bpy.ops.object.light_add(type='SUN', location=(3, -2, 4))
sun = bpy.context.object; sun.data.energy = 4.5; sun.data.color = (1.0, 0.95, 0.85)
bpy.ops.object.light_add(type='SUN', location=(-2, 1, 1))
fill = bpy.context.object; fill.data.energy = 1.8; fill.data.color = (0.85, 0.9, 0.7)
bpy.ops.object.light_add(type='SUN', location=(0, 0, -3))
rim = bpy.context.object; rim.data.energy = 2.5; rim.data.color = (1.0, 0.85, 0.6)

bpy.ops.object.camera_add(location=(2.2, -2.4, 1.3), rotation=(1.05, -0.5, 0.25))
cam = bpy.context.object; bpy.context.scene.camera = cam; cam.data.lens = 50

# ====== Re-create the frog mesh from Phase 2 ======
def pbr_mat(name, base_color, roughness=0.6, metallic=0.0):
    m = bpy.data.materials.new(name=name)
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    return m

GREY_BODY = pbr_mat("phase3_body", (0.55, 0.55, 0.55, 1))
GREY_EYE  = pbr_mat("phase3_eye",  (0.55, 0.55, 0.55, 1))
GREY_PAD  = pbr_mat("phase3_pad",  (0.55, 0.55, 0.55, 1))

def add_sphere(name, loc, radius, scale=(1,1,1), material=None):
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=radius, segments=16, ring_count=12,
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

# Boolean union into single mesh
base = body_parts[0]
base.name = "frog_body"
for other in body_parts[1:]:
    mod = base.modifiers.new(name=f"Union_{other.name}", type='BOOLEAN')
    mod.operation = 'UNION'
    mod.object = other
    bpy.context.view_layer.objects.active = base
    base.select_set(True)
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(other, do_unlink=True)

mod = base.modifiers.new(name="Subsurf", type='SUBSURF')
mod.levels = 1
mod.render_levels = 2
bpy.ops.object.modifier_apply(modifier=mod.name)
bpy.ops.object.shade_smooth()

# Eyes & pads (same as phase 2)
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

# ====== UV UNWRAP the body mesh ======
bpy.context.view_layer.objects.active = base
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='DESELECT')

# Mark seam along the belly (bottom, where the green body meets lighter belly)
# — easiest: select bottom edge loop via Y axis
bpy.ops.object.mode_set(mode='OBJECT')
import bmesh
bm = bmesh.new()
bm.from_mesh(base.data)
bm.verts.ensure_lookup_table()

# Mark all bottom-facing edges as seams (y < -0.05)
for edge in bm.edges:
    verts = edge.verts
    if all(v.co.y < -0.05 for v in verts):
        edge.seam = True

# Also mark a seam down the back (z > 0.15)
for edge in bm.edges:
    verts = edge.verts
    if all(v.co.z > 0.15 for v in verts):
        edge.seam = True

bm.to_mesh(base.data)
bm.free()

# Unwrap with seams considered
bpy.context.view_layer.objects.active = base
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.02, area_weight=0)
bpy.ops.object.mode_set(mode='OBJECT')

# ====== CREATE TEXTURES ======
TEX_SIZE = 2048

def make_image(name, width, height, fill_color=(0,0,0,0)):
    img = bpy.data.images.new(name, width=width, height=height)
    img.generated_type = 'COLOR_GRID'  # placeholder, we'll overwrite via PIL
    return img

diffuse_img = make_image("frog_diffuse", TEX_SIZE, TEX_SIZE, (0.36, 0.66, 0.21, 1))  # green base
normal_img = make_image("frog_normal", TEX_SIZE, TEX_SIZE, (0.5, 0.5, 1.0, 1))  # flat normal = (0.5, 0.5, 1.0)
rough_img = make_image("frog_roughness", TEX_SIZE, TEX_SIZE, (0.6, 0.6, 0.6, 1))

# Save initial textures so we can paint on them
diffuse_img.filepath_raw = TEX_DIFFUSE
diffuse_img.file_format = 'PNG'
diffuse_img.save()
normal_img.filepath_raw = TEX_NORMAL
normal_img.save()
rough_img.filepath_raw = TEX_ROUGHNESS
rough_img.save()

# ====== PAINT DIFFUSE TEXTURE using UV coordinates ======
# We'll use PIL to paint directly into the texture images
# PIL gives us precise per-pixel control, which is what production tools do

try:
    from PIL import Image, ImageDraw, ImageFilter
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("WARN: PIL not available — falling back to flat color textures")

if HAS_PIL:
    # === DIFFUSE ===
    img = Image.new("RGBA", (TEX_SIZE, TEX_SIZE), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)

    # Color palette (matches Agalychnis callidryas)
    BACK = (95, 168, 58, 255)      # bright lime green back
    BELLY = (155, 192, 102, 255)   # lighter cream-green belly
    SIDE_BLUE = (35, 90, 165, 255) # vivid blue side stripes
    SPOT_DARK = (45, 95, 35, 255)  # dark mottling spots
    WHITE_BELLY = (240, 245, 235, 255)  # near-white throat

    # Fill back region (upper half = above midline)
    draw.rectangle([0, 0, TEX_SIZE, TEX_SIZE // 2], fill=BACK)
    # Fill belly region (lower half = below midline)
    draw.rectangle([0, TEX_SIZE // 2, TEX_SIZE, TEX_SIZE], fill=BELLY)

    # Side blue stripes — vertical bands on left + right edges
    draw.rectangle([0, TEX_SIZE // 4, TEX_SIZE // 12, 3 * TEX_SIZE // 4], fill=SIDE_BLUE)
    draw.rectangle([11 * TEX_SIZE // 12, TEX_SIZE // 4, TEX_SIZE, 3 * TEX_SIZE // 4], fill=SIDE_BLUE)

    # White throat patch (center of belly, near front)
    cx, cy = TEX_SIZE // 2, int(TEX_SIZE * 0.78)
    draw.ellipse([cx - 100, cy - 60, cx + 100, cy + 60], fill=WHITE_BELLY)

    # Dark mottling spots scattered on the back
    import random
    random.seed(42)  # deterministic
    for _ in range(80):
        x = random.randint(TEX_SIZE // 12, 11 * TEX_SIZE // 12)
        y = random.randint(0, TEX_SIZE // 2)
        r = random.randint(15, 45)
        # Only on the back, not over side stripes
        if 11 * TEX_SIZE // 12 > x > TEX_SIZE // 12:
            draw.ellipse([x - r, y - r, x + r, y + r], fill=SPOT_DARK)

    # Add subtle gradient between back and belly (smooth transition)
    for y in range(TEX_SIZE // 2 - 40, TEX_SIZE // 2 + 40):
        blend = (y - (TEX_SIZE // 2 - 40)) / 80.0
        for x in range(0, TEX_SIZE, 1):
            r1, g1, b1, a1 = BACK
            r2, g2, b2, a2 = BELLY
            r = int(r1 * (1 - blend) + r2 * blend)
            g = int(g1 * (1 - blend) + g2 * blend)
            b = int(b1 * (1 - blend) + b2 * blend)
            draw.point((x, y), fill=(r, g, b, 255))

    # Slight blur for organic feel
    img = img.filter(ImageFilter.GaussianBlur(radius=3))
    img.save(TEX_DIFFUSE)
    print(f"✓ Diffuse painted: {TEX_DIFFUSE}")

    # === NORMAL ===
    # Flat normal = (0.5, 0.5, 1.0) blue. Add subtle bumps where spots are.
    nimg = Image.new("RGBA", (TEX_SIZE, TEX_SIZE), (128, 128, 255, 255))
    ndraw = ImageDraw.Draw(nimg)
    # bump up mottling spots — make them slightly raised
    random.seed(42)
    for _ in range(80):
        x = random.randint(TEX_SIZE // 12, 11 * TEX_SIZE // 12)
        y = random.randint(0, TEX_SIZE // 2)
        r = random.randint(15, 45)
        # bump = lighter in the center, darker at edges
        for ring_r in range(r, 0, -2):
            intensity = 255 - int((ring_r / r) * 30)
            ndraw.ellipse([x - ring_r, y - ring_r, x + ring_r, y + ring_r],
                          fill=(128, 128, min(255, intensity), 255))
    nimg.save(TEX_NORMAL)
    print(f"✓ Normal painted: {TEX_NORMAL}")

    # === ROUGHNESS ===
    # Matte belly (high roughness 0.85), slightly glossier back (0.55)
    rimg = Image.new("L", (TEX_SIZE, TEX_SIZE), 200)
    rdraw = ImageDraw.Draw(rimg)
    # Belly area — high roughness (matte)
    rdraw.rectangle([0, TEX_SIZE // 2, TEX_SIZE, TEX_SIZE], fill=217)  # ~0.85
    # Back area — lower roughness (slight gloss)
    rdraw.rectangle([0, 0, TEX_SIZE, TEX_SIZE // 2], fill=140)  # ~0.55
    rimg.save(TEX_ROUGHNESS)
    print(f"✓ Roughness painted: {TEX_ROUGHNESS}")

    # Reload images into Blender
    for img_obj, path in [(diffuse_img, TEX_DIFFUSE), (normal_img, TEX_NORMAL), (rough_img, TEX_ROUGHNESS)]:
        img_obj.reload()

# ====== BUILD FINAL MATERIAL with textures ======
def textured_mat(name):
    m = bpy.data.materials.new(name=name)
    # Ensure material has a node tree
    if m.node_tree is None:
        m.use_nodes = True
    nodes = m.node_tree.nodes
    links = m.node_tree.links

    # Find or create Principled BSDF
    bsdf = nodes.get("Principled BSDF")
    if bsdf is None:
        bsdf = nodes.new('ShaderNodeBsdfPrincipled')
        # remove default if it exists
        for n in list(nodes):
            if n.type == 'BSDF_PRINCIPLED' and n.name != "Principled BSDF":
                nodes.remove(n)

    # Remove non-essential default nodes (keep BSDF and output)
    for n in list(nodes):
        if n.type not in ('BSDF_PRINCIPLED', 'OUTPUT_MATERIAL'):
            nodes.remove(n)

    # Add image texture nodes
    diff_tex = nodes.new('ShaderNodeTexImage')
    diff_tex.image = diffuse_img
    diff_tex.location = (-600, 300)

    norm_tex = nodes.new('ShaderNodeTexImage')
    norm_tex.image = normal_img
    norm_tex.location = (-600, 0)

    rough_tex = nodes.new('ShaderNodeTexImage')
    rough_tex.image = rough_img
    rough_tex.location = (-600, -300)

    # Normal map node
    norm_map = nodes.new('ShaderNodeNormalMap')
    norm_map.location = (-350, 0)

    # Links
    links.new(diff_tex.outputs['Color'], bsdf.inputs['Base Color'])
    links.new(norm_tex.outputs['Color'], norm_map.inputs['Color'])
    links.new(norm_map.outputs['Normal'], bsdf.inputs['Normal'])
    links.new(rough_tex.outputs['Color'], bsdf.inputs['Roughness'])

    return m

# Replace grey body material with textured material
body_mat = textured_mat("frog_body_textured")
base.data.materials.clear()
base.data.materials.append(body_mat)

# Separate materials for eyes (red) and pads (orange) — flat colors, no texture
def flat_mat(name, color):
    m = bpy.data.materials.new(name=name)
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = 0.35  # glossy eyes
    return m

RED_EYE = flat_mat("frog_eye_red", (0.78, 0.10, 0.06, 1))
ORANGE_PAD = flat_mat("frog_pad_orange", (0.95, 0.55, 0.15, 1))
BLACK_PUPIL = flat_mat("frog_pupil_black", (0.02, 0.02, 0.02, 1))

for eye in eye_parts:
    eye.data.materials.clear()
    eye.data.materials.append(RED_EYE)

for pad in pad_parts:
    pad.data.materials.clear()
    pad.data.materials.append(ORANGE_PAD)

# Add small pupil dots on each eye (separate black spheres)
for sign in [-1, 1]:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.04, segments=10, ring_count=8,
                                          location=(sign*0.24, 0.32, -0.65))
    pup = bpy.context.object; pup.data.materials.append(BLACK_PUPIL)

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
print(f"✓ Phase 3 rendered: {OUT_PATH}")
print(f"  Body (merged): {body_polys} polys, {total_polys} total")
print(f"  Textures: {TEX_DIFFUSE}, {TEX_NORMAL}, {TEX_ROUGHNESS}")