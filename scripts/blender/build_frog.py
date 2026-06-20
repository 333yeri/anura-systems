#!/usr/bin/env python3
"""
Procedural Red-Eyed Tree Frog builder for Anura Systems.

This script builds a realistic Red-Eyed Tree Frog (Agalychnis callidryas)
from Blender primitives, with PBR materials, vertex-color painting,
and bioluminescent emissive patches. Designed to run headless via:

    blender --background --python scripts/blender/build_frog.py

Outputs: public/assets/models/char__frog__anura_v01.glb

Spec source: _decisions/42_frog_spec.md
"""

import bpy
import bmesh
import math
from mathutils import Vector
import os

# =================================================================
# CONFIG
# =================================================================

OUTPUT_PATH = "/Users/dannykamensky/Desktop/anura-systems-3d/public/assets/models/char__frog__anura_v01.glb"

# Color palette (from frog reference)
COLORS = {
    "body_green":   (0.482, 0.761, 0.259),  # #7BC242
    "side_blue":    (0.231, 0.420, 0.722),  # #3B6BB8
    "side_dark":    (0.102, 0.165, 0.290),  # #1A2A4A
    "belly_cream":  (0.961, 0.910, 0.784),  # #F5E8C8
    "eye_red":      (0.910, 0.290, 0.102),  # #E84A1A
    "pupil_black":  (0.039, 0.039, 0.039),  # #0A0A0A
    "toe_orange":   (0.941, 0.502, 0.125),  # #F08020
    "pad_lighter":  (1.000, 0.627, 0.251),  # #FFA040
    "thigh_orange": (1.000, 0.722, 0.302),  # #FFB84D
    "biolume_cyan": (0.435, 0.812, 0.722),  # #6FCFB8 (subtle glow)
}

# =================================================================
# CLEAN SCENE
# =================================================================

def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    # Set render engine to Cycles for baking
    bpy.context.scene.render.engine = 'CYCLES'

clean_scene()

# =================================================================
# HELPER FUNCTIONS
# =================================================================

def create_subdivided_uv_sphere(name, radius, segments, rings):
    """Create a UV sphere with smooth shading, then subdivide."""
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=radius,
        segments=segments,
        ring_count=rings,
    )
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.shade_smooth()
    return obj

def apply_subsurf_modifier(obj, levels=2):
    """Add subdivision surface modifier."""
    mod = obj.modifiers.new(name="Subsurf", type='SUBSURF')
    mod.levels = levels
    mod.render_levels = levels
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=mod.name)

def create_metaball_leg(name, length, thickness, bend_angle=0):
    """Create a tapered, slightly bent limb."""
    # Use a curve-extruded approach for nice taper
    bpy.ops.mesh.primitive_cylinder_add(
        radius=thickness,
        depth=length,
        vertices=12,
    )
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.shade_smooth()
    # Add slight bend via proportional editing simulation (we'll just rotate joints later)
    return obj

def merge_objects(objs):
    """Join multiple mesh objects into one."""
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objs:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    return bpy.context.active_object

def set_vertex_colors(obj, color, face_filter=None):
    """Set vertex colors on object. color = (r, g, b)."""
    mesh = obj.data
    color_layer = mesh.vertex_colors.new(name="Color")
    for poly in mesh.polygons:
        if face_filter and not face_filter(poly):
            continue
        for loop_idx in poly.loop_indices:
            color_layer.data[loop_idx].color = (*color, 1.0)

# =================================================================
# BUILD BODY
# =================================================================

print("Building frog body...")

# Main body — slightly squashed sphere
body = create_subdivided_uv_sphere("Body", radius=1.0, segments=32, rings=24)
body.scale = (1.0, 1.4, 0.7)  # Wider than tall, slightly flat
bpy.ops.object.transform_apply(scale=True)
apply_subsurf_modifier(body, levels=2)

# Position body slightly down so head sits on top
body.location = (0, 0, 0)

# Head — merged into body via smaller sphere offset upward
head = create_subdivided_uv_sphere("Head", radius=0.7, segments=24, rings=18)
head.scale = (1.0, 1.1, 0.85)
head.location = (0, 0.85, 0.1)
bpy.ops.object.transform_apply(scale=True)
apply_subsurf_modifier(head, levels=2)

# Merge body + head
frog = merge_objects([body, head])
frog.name = "Frog_Mesh"
bpy.context.view_layer.objects.active = frog

# Apply boolean union to merge cleanly
bpy.ops.object.modifier_add(type='BOOLEAN')
mod = frog.modifiers[-1]
# Use the second object as target — but since we already joined, the geometry should overlap
# Let's instead use sculpt/merge approach: select all verts and weld
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.remove_doubles(threshold=0.05)
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.object.mode_set(mode='OBJECT')

# Apply the boolean modifier (after we already have joined mesh, this might no-op safely)
try:
    bpy.ops.object.modifier_apply(modifier=mod.name)
except Exception:
    pass  # Boolean may fail on already-merged mesh — that's OK

print(f"  Body+Head merged. Vertices: {len(frog.data.vertices)}")

# =================================================================
# BUILD LEGS
# =================================================================

print("Building legs...")

leg_objects = []

# Front legs (4 total: 2 front + 2 back, but we'll build 4 visible)
# Each leg: 2 segments (upper + lower) for natural bend

def build_frog_leg(name, base_pos, segment_lengths, segment_thicknesses, rotation, side="right"):
    """Build a frog leg with thigh + shin + foot."""
    objs = []
    current_pos = Vector(base_pos)
    current_rot = rotation

    for i, (seg_len, seg_thick) in enumerate(zip(segment_lengths, segment_thicknesses)):
        seg = create_metaball_leg(f"{name}_seg{i}", seg_len, seg_thick)
        # Position
        seg.location = current_pos + Vector((0, seg_len/2 * math.cos(current_rot), seg_len/2 * math.sin(current_rot)))
        seg.rotation_euler = (0, 0, current_rot)
        bpy.ops.object.transform_apply(location=True, rotation=True)
        objs.append(seg)
        # Next segment starts at end of current
        current_pos = seg.location + Vector((0, seg_len * math.cos(current_rot), seg_len * math.sin(current_rot)))
        current_rot += 0.4 if i == 0 else 0.2  # Slight bend at joints

    # Merge segments
    leg = merge_objects(objs)
    leg.name = name
    return leg

# Front legs — shorter, bent forward, hands flat
front_left = build_frog_leg(
    "FrontLegL",
    base_pos=(-0.85, 0.4, -0.3),
    segment_lengths=[0.4, 0.5],
    segment_thicknesses=[0.18, 0.15],
    rotation=math.radians(60),
)
leg_objects.append(front_left)

front_right = build_frog_leg(
    "FrontLegR",
    base_pos=(0.85, 0.4, -0.3),
    segment_lengths=[0.4, 0.5],
    segment_thicknesses=[0.18, 0.15],
    rotation=math.radians(60),
)
leg_objects.append(front_right)

# Back legs — longer, folded tightly against body (frog sitting pose)
back_left = build_frog_leg(
    "BackLegL",
    base_pos=(-0.7, -0.6, -0.2),
    segment_lengths=[0.5, 0.6, 0.4],
    segment_thicknesses=[0.22, 0.18, 0.14],
    rotation=math.radians(45),
)
leg_objects.append(back_left)

back_right = build_frog_leg(
    "BackLegR",
    base_pos=(0.7, -0.6, -0.2),
    segment_lengths=[0.5, 0.6, 0.4],
    segment_thicknesses=[0.22, 0.18, 0.14],
    rotation=math.radians(45),
)
leg_objects.append(back_right)

# Merge legs into main frog mesh
frog = merge_objects([frog] + leg_objects)
frog.name = "Frog_Mesh"
bpy.context.view_layer.objects.active = frog

# Weld overlapping vertices
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.remove_doubles(threshold=0.08)
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.object.mode_set(mode='OBJECT')

print(f"  Legs merged. Total vertices: {len(frog.data.vertices)}")

# =================================================================
# BUILD EYES
# =================================================================

print("Building eyes...")

# Eyes are large bulges on top of head — spheres positioned high on head
# Reference shows eyes with vertical pupils, bright red iris

eye_left = create_subdivided_uv_sphere("EyeL", radius=0.32, segments=20, rings=16)
eye_left.location = (-0.35, 0.95, 0.55)
eye_left.scale = (0.9, 0.9, 1.1)  # Slightly egg-shaped, taller
bpy.ops.object.transform_apply(scale=True)
apply_subsurf_modifier(eye_left, levels=2)

eye_right = create_subdivided_uv_sphere("EyeR", radius=0.32, segments=20, rings=16)
eye_right.location = (0.35, 0.95, 0.55)
eye_right.scale = (0.9, 0.9, 1.1)
bpy.ops.object.transform_apply(scale=True)
apply_subsurf_modifier(eye_right, levels=2)

# Merge eyes into frog
frog = merge_objects([frog, eye_left, eye_right])
frog.name = "Frog_Mesh"
bpy.context.view_layer.objects.active = frog

# Weld
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.remove_doubles(threshold=0.08)
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.object.mode_set(mode='OBJECT')

# =================================================================
# BUILD TOE PADS
# =================================================================

print("Building toe pads...")

# Toe pads are flattened spheres at the tip of each foot
# Each foot has 4 toes (front) or 5 toes (back) — we'll do 4 front + 5 back per foot for simplicity

toe_pad_positions = [
    # Front left foot (relative to front_left tip)
    (-1.1, 1.2, -0.3), (-1.0, 1.3, -0.3), (-0.9, 1.35, -0.3), (-0.8, 1.3, -0.3),
    # Front right foot
    (1.1, 1.2, -0.3), (1.0, 1.3, -0.3), (0.9, 1.35, -0.3), (0.8, 1.3, -0.3),
    # Back left foot
    (-1.0, -0.5, -0.3), (-0.9, -0.4, -0.3), (-0.8, -0.3, -0.3), (-0.7, -0.2, -0.3), (-0.6, -0.1, -0.3),
    # Back right foot
    (1.0, -0.5, -0.3), (0.9, -0.4, -0.3), (0.8, -0.3, -0.3), (0.7, -0.2, -0.3), (0.6, -0.1, -0.3),
]

pads = []
for i, pos in enumerate(toe_pad_positions):
    pad = create_subdivided_uv_sphere(f"ToePad_{i}", radius=0.08, segments=10, rings=8)
    pad.location = pos
    pad.scale = (1.2, 1.2, 0.6)  # Flattened
    bpy.ops.object.transform_apply(scale=True)
    pads.append(pad)

frog = merge_objects([frog] + pads)
frog.name = "Frog_Mesh"
bpy.context.view_layer.objects.active = frog

# Weld
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.remove_doubles(threshold=0.05)
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.object.mode_set(mode='OBJECT')

print(f"  All merged. Total vertices: {len(frog.data.vertices)}")
print(f"  Total triangles: {len(frog.data.polygons)}")

# =================================================================
# UV UNWRAP
# =================================================================

print("UV unwrapping...")

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.02)
bpy.ops.object.mode_set(mode='OBJECT')

# =================================================================
# MATERIALS — Multi-material with vertex colors + per-material PBR
# =================================================================

print("Creating materials...")

# Create the materials
def create_pbr_material(name, base_color, roughness=0.6, metallic=0.0, emission=None, emission_strength=0.0):
    """Create a PBR material with optional emission + vertex color multiplier."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links

    # Clear default nodes
    for node in nodes:
        nodes.remove(node)

    # Vertex color node
    vcol = nodes.new(type='ShaderNodeVertexColor')
    vcol.layer_name = "Color"

    # Output
    output = nodes.new(type='ShaderNodeOutputMaterial')

    # Principled BSDF — Base Color will be set by linking from mix
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic

    # MixRGB: multiply vertex color with base color
    mix = nodes.new(type='ShaderNodeMixRGB')
    mix.blend_type = 'MULTIPLY'
    mix.inputs['Color1'].default_value = (*base_color, 1.0)
    mix.inputs['Color2'].default_value = (1.0, 1.0, 1.0, 1.0)  # placeholder
    links.new(vcol.outputs['Color'], mix.inputs['Color2'])
    links.new(mix.outputs['Color'], bsdf.inputs['Base Color'])

    # Emission (Blender 5.x: 'Emission Color')
    if emission:
        bsdf.inputs['Emission Color'].default_value = (*emission, 1.0)
        bsdf.inputs['Emission Strength'].default_value = emission_strength

    # Surface link
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    return mat

# Body material (green base with vertex color zones)
body_mat = create_pbr_material(
    "Frog_Body",
    base_color=COLORS["body_green"],
    roughness=0.55,
    metallic=0.0,
    emission=COLORS["biolume_cyan"],
    emission_strength=0.15,  # Subtle
)

# Assign body material to all faces
frog.data.materials.clear()
frog.data.materials.append(body_mat)

# =================================================================
# PAINT VERTEX COLORS BY POSITION
# =================================================================

print("Painting vertex colors by zone...")

# Vertex colors map body regions to color zones
# ZONES based on position:
#   - Top (high Z): green body
#   - Side (mid Z, away from center on X): blue
#   - Belly (low Z): cream
#   - Eye region (high Y + high Z): bright red
#   - Toe pads (low Y): orange
#   - Side stripes (random sampling on side): dark navy

mesh = frog.data
color_layer = mesh.vertex_colors.new(name="Color")

# Get world-space coords
mw = frog.matrix_world
verts = mesh.vertices
polys = mesh.polygons

# Helper: classify a vertex's zone based on its position relative to frog center
def classify_vertex(co_local):
    x, y, z = co_local
    # Eyes: high y, high z, on sides
    if y > 0.9 and z > 0.5:
        if abs(x) > 0.3:
            return "eye_red"
    # Toe pads: low y (front)
    if y > 1.0:
        return "toe_orange"
    # Toe pads: very low y (back)
    if y < -0.4:
        return "toe_orange"
    # Belly: low z (underside)
    if z < -0.05:
        return "belly_cream"
    # Sides: away from center
    if abs(x) > 0.55 and z > -0.05:
        # Could be side blue, with stripes
        # Add stripes based on Y position (vertical bars)
        stripe_index = int((y + 1.0) * 4) % 2  # Alternate stripes
        if stripe_index == 0:
            return "side_dark"
        else:
            return "side_blue"
    # Top: default green
    return "body_green"

for poly in polys:
    for loop_idx in poly.loop_indices:
        vert = verts[mesh.loops[loop_idx].vertex_index]
        zone = classify_vertex(vert.co)
        col = COLORS[zone]
        color_layer.data[loop_idx].color = (*col, 1.0)

# Mark UV layer
if mesh.uv_layers:
    mesh.uv_layers.active = mesh.uv_layers[0]

# =================================================================
# POSE: TUCK LEGS UNDER BODY (sitting pose)
# =================================================================

print("Applying sitting pose...")

# After merge, the legs are already placed in sitting position
# (we built them that way). Just need to ensure frog is centered and oriented correctly.

frog.location = (0, 0, 0)
frog.rotation_euler = (0, 0, 0)
bpy.ops.object.transform_apply(location=True, rotation=True)

# Scale to reasonable size
frog.scale = (0.5, 0.5, 0.5)
bpy.ops.object.transform_apply(scale=True)

print(f"  Frog final vertex count: {len(frog.data.vertices)}")
print(f"  Frog final triangle count: {len(frog.data.polygons)}")

# =================================================================
# EXPORT
# =================================================================

print(f"Exporting to {OUTPUT_PATH}...")

os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

# Select only the frog
bpy.ops.object.select_all(action='DESELECT')
frog.select_set(True)
bpy.context.view_layer.objects.active = frog

bpy.ops.export_scene.gltf(
    filepath=OUTPUT_PATH,
    export_format='GLB',
    export_materials='EXPORT',
    export_texcoords=True,  # Blender 5.x: was 'export_uv'
    export_normals=True,
    export_vertex_color='MATERIAL',  # Blender 5.x enum: 'MATERIAL' | 'ACTIVE' | 'NAME' | 'NONE'
    export_attributes=True,  # Includes all vertex attributes (color, etc.)
    export_morph=True,
    export_apply=True,
    export_yup=True,  # Three.js uses Y-up by default
    export_animations=False,  # No animations yet
)

print(f"  ✅ Exported: {OUTPUT_PATH}")
print(f"  File size: {os.path.getsize(OUTPUT_PATH) / 1024:.1f} KB")
