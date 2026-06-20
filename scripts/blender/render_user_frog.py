#!/usr/bin/env python3
"""Render user's frog from GLB for preview."""

import bpy
import os
import math

FROG_PATH = "/Users/dannykamensky/Downloads/sample_2026-06-19T232009.452.glb"
OUTPUT_PATH = "/tmp/frog_user_preview.png"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.render.engine = 'CYCLES'

bpy.ops.import_scene.gltf(filepath=FROG_PATH)

frog = None
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        frog = obj
        break

if not frog:
    print("ERROR: Frog not loaded!")
    exit(1)

print(f"Frog loaded: {len(frog.data.vertices)} verts, {len(frog.data.polygons)} polys")
print(f"Bounding box: {[v for v in frog.dimensions]}")

# Center frog at origin, scale to reasonable size
bpy.ops.object.select_all(action='DESELECT')
frog.select_set(True)
bpy.context.view_layer.objects.active = frog
bpy.ops.object.transform_apply(location=True)

# Scale to ~1 unit if it's huge
max_dim = max(frog.dimensions)
print(f"Max dimension: {max_dim:.3f}")
if max_dim > 5:
    frog.scale = (1.0/max_dim, 1.0/max_dim, 1.0/max_dim)
    bpy.ops.object.transform_apply(scale=True)

# Dark moonlit scene
world = bpy.data.worlds.new("DarkWorld")
bpy.context.scene.world = world
world.use_nodes = True
nodes = world.node_tree.nodes
links = world.node_tree.links
nodes.clear()
bg = nodes.new(type='ShaderNodeBackground')
bg.inputs['Color'].default_value = (0.04, 0.05, 0.04, 1.0)
bg.inputs['Strength'].default_value = 0.5
output = nodes.new(type='ShaderNodeOutputWorld')
links.new(bg.outputs['Background'], output.inputs['Surface'])

# 3-point lighting (moonlit forest aesthetic)
key_data = bpy.data.lights.new(name="Key", type='POINT')
key_data.energy = 500
key_data.color = (1.0, 0.96, 0.85)
key_data.shadow_soft_size = 0.3
key = bpy.data.objects.new(name="Key", object_data=key_data)
bpy.context.collection.objects.link(key)
key.location = (3, 3, 4)

fill_data = bpy.data.lights.new(name="Fill", type='POINT')
fill_data.energy = 150
fill_data.color = (0.3, 0.45, 0.6)
fill = bpy.data.objects.new(name="Fill", object_data=fill_data)
bpy.context.collection.objects.link(fill)
fill.location = (-3, -2, 2)

rim_data = bpy.data.lights.new(name="Rim", type='POINT')
rim_data.energy = 200
rim_data.color = (1.0, 0.65, 0.2)
rim = bpy.data.objects.new(name="Rim", object_data=rim_data)
bpy.context.collection.objects.link(rim)
rim.location = (0, -3, 1.5)

# Camera — side view to see the blue side stripes
cam_data = bpy.data.cameras.new("Camera")
cam_data.lens = 50
cam = bpy.data.objects.new("Camera", cam_data)
bpy.context.collection.objects.link(cam)
bpy.context.scene.camera = cam
cam.location = (2.0, 0, 0.5)
cam.rotation_euler = (math.radians(85), 0, math.radians(-90))

bpy.context.scene.render.resolution_x = 1280
bpy.context.scene.render.resolution_y = 720
bpy.context.scene.render.film_transparent = True
bpy.context.scene.cycles.samples = 64

bpy.context.scene.render.filepath = OUTPUT_PATH
bpy.ops.render.render(write_still=True)
print(f"✅ Rendered: {OUTPUT_PATH} ({os.path.getsize(OUTPUT_PATH)/1024:.1f} KB)")
