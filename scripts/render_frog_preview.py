"""Quick visible-angle preview of the frog (front + 3/4)."""
import bpy
import os

FROG = "/Users/dannykamensky/Desktop/anura-systems-3d/public/assets/models/char__frog__v01.glb"
OUT = "/Users/dannykamensky/Desktop/anura-systems-3d/docs-frog-preview.png"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=FROG)

# Set background to dark grey so we can see the green frog
world = bpy.data.worlds.new("PreviewWorld")
bpy.context.scene.world = world

# camera at 3/4 view
bpy.ops.object.camera_add(location=(1.8, -2.0, 1.0), rotation=(1.05, -0.5, 0.3))
cam = bpy.context.object
bpy.context.scene.camera = cam
cam.data.lens = 60

# lights
bpy.ops.object.light_add(type='SUN', location=(3, -2, 4))
sun = bpy.context.object
sun.data.energy = 3
sun.data.color = (1.0, 0.95, 0.85)

bpy.ops.object.light_add(type='SUN', location=(-2, 1, 1))
fill = bpy.context.object
fill.data.energy = 1
fill.data.color = (0.85, 0.9, 0.7)

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 24
scene.render.resolution_x = 800
scene.render.resolution_y = 600
scene.render.film_transparent = True
scene.render.filepath = OUT

bpy.ops.render.render(write_still=True)
print(f"✓ {OUT}")
print(f"  {os.path.getsize(OUT)/1024:.1f} KB")