#!/usr/bin/env python3
"""
Render a preview of the frog to verify it looks right.
Outputs: /tmp/frog_preview.png
"""

import bpy
import os
import math

FROG_PATH = "/Users/dannykamensky/Desktop/anura-systems-3d/public/assets/models/char__frog__anura_v01.glb"
OUTPUT_PATH = "/tmp/frog_preview.png"

# Clean scene
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.render.engine = 'CYCLES'

# Load frog
bpy.ops.import_scene.gltf(filepath=FROG_PATH)

# Get the imported frog object
frog = None
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        frog = obj
        break

if not frog:
    print("ERROR: Frog not loaded!")
    exit(1)

# Set up scene: dark moody lighting matching Anura aesthetic
world = bpy.data.worlds.new("DarkWorld")
bpy.context.scene.world = world
world.use_nodes = True
nodes = world.node_tree.nodes
links = world.node_tree.links
nodes.clear()
bg = nodes.new(type='ShaderNodeBackground')
bg.inputs['Color'].default_value = (0.04, 0.05, 0.04, 1.0)  # Near-black green
bg.inputs['Strength'].default_value = 0.3
output = nodes.new(type='ShaderNodeOutputWorld')
links.new(bg.outputs['Background'], output.inputs['Surface'])

# Key light (moon, warm) — create light object directly
key_light_data = bpy.data.lights.new(name="KeyLight", type='POINT')
key_light_data.energy = 200
key_light_data.color = (1.0, 0.96, 0.85)  # Warm pale moonlight
key_light_data.shadow_soft_size = 0.5
key = bpy.data.objects.new(name="Key", object_data=key_light_data)
bpy.context.collection.objects.link(key)
key.location = (3, 3, 4)

# Fill light (cool, from opposite)
fill_light_data = bpy.data.lights.new(name="FillLight", type='POINT')
fill_light_data.energy = 60
fill_light_data.color = (0.3, 0.45, 0.6)
fill = bpy.data.objects.new(name="Fill", object_data=fill_light_data)
bpy.context.collection.objects.link(fill)
fill.location = (-3, -2, 2)

# Rim light (warm amber, like fire)
rim_light_data = bpy.data.lights.new(name="RimLight", type='POINT')
rim_light_data.energy = 80
rim_light_data.color = (1.0, 0.65, 0.2)
rim = bpy.data.objects.new(name="Rim", object_data=rim_light_data)
bpy.context.collection.objects.link(rim)
rim.location = (0, -3, 1.5)

# Camera
cam_data = bpy.data.cameras.new("Camera")
cam_data.lens = 50
cam = bpy.data.objects.new("Camera", cam_data)
bpy.context.collection.objects.link(cam)
bpy.context.scene.camera = cam
cam.location = (2.5, -2.5, 1.5)
cam.rotation_euler = (math.radians(60), 0, math.radians(45))

# Render settings
bpy.context.scene.render.resolution_x = 1280
bpy.context.scene.render.resolution_y = 720
bpy.context.scene.render.film_transparent = True
bpy.context.scene.cycles.samples = 64
bpy.context.scene.cycles.device = 'CPU'

# Render
bpy.context.scene.render.filepath = OUTPUT_PATH
bpy.ops.render.render(write_still=True)

print(f"✅ Rendered: {OUTPUT_PATH}")
print(f"  Size: {os.path.getsize(OUTPUT_PATH) / 1024:.1f} KB")
