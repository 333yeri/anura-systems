---
status: locked
locked-at: 2026-06-19
species: Red-Eyed Tree Frog (Agalychnis callidryas)
---

# 42 — Frog Spec (LOCKED)

> **Species:** Red-Eyed Tree Frog (*Agalychnis callidryas*)
> **Source reference:** `31ef797fb1b8de930186910e6db89fe8.jpg`
> (Andrés Morya photography)
> **Status:** ✅ LOCKED — ready to build
> **Build path:** Headless Blender (Path 1) — I write Python script,
> Blender runs locally, exports GLB. You don't touch Blender.

---

## SPECIES — RED-EYED TREE FROG

This is one of the most iconic and photogenic frogs in the world.
The combination of bright green body + red eyes + blue side flanks
+ orange toes makes it instantly recognizable. Perfect for the
"realistic frog with a little outline glow" direction — the colors
are already so vivid that the glow will read as part of the
creature's natural bioluminescence rather than added FX.

**Real-world size:** males 5-6cm, females 7-8cm. We render at
~12-15cm scale in-scene (slightly larger than life so it's a
visible guide character).

---

## ANATOMICAL SPEC — from forensic image analysis

### Body proportions (relative units, total body length = 10)

| Element | Length | Notes |
|---|---|---|
| Head (snout to back of skull) | 3.0 | Slightly wedge-shaped |
| Body (back of skull to vent) | 4.5 | Smoothly rounded |
| Hind legs (extended) | 8.0 | Folded when sitting |
| Front legs (extended) | 5.5 | Bent when sitting |
| Toe pads (front) | 0.6 diameter | Round, suction-cup |
| Toe pads (back) | 0.7 diameter | Slightly larger |
| Eye diameter | 1.0 | Proportionally huge |
| Pupil | 0.5 vertical | Distinctive vertical slit |

### Color zones (hex estimates from reference)

| Zone | Hex | Notes |
|---|---|---|
| Body top (head, back, top of legs) | `#7BC242` | Bright leaf green |
| Body sides (flanks) | `#3B6BB8` | Vivid blue with darker stripes |
| Side stripes (vertical bars on blue flanks) | `#1A2A4A` | Dark navy/almost black, 4-5 visible per side |
| Belly | `#F5E8C8` | Cream/light yellow |
| Eye iris | `#E84A1A` | Bright orange-red |
| Eye pupil | `#0A0A0A` | Near-pure-black vertical slit |
| Toes/feet | `#F08020` | Vivid orange |
| Toe pads | `#FFA040` | Slightly lighter orange |
| Inner thigh (visible when leg folded) | `#FFB84D` | Bright warm orange |
| Mouth line | `#5A4A2A` | Subtle brown line along jaw |
| Lateral skin fold (line along body side) | `#4A6A8A` | Subtle blue-grey line where flank meets back |

### Skin texture

- **Top surfaces (green)**: smooth with subtle bumpy texture
  (very fine granular, not warty)
- **Side flanks (blue)**: smoother, slightly glossy
- **Belly**: smoothest, slightly translucent appearance
- **Toes**: smooth, slight sheen
- **Eyes**: highly glossy (clear coat + slight reflection)

### Lighting on the frog (from reference image)

- KEY light from upper-right (warm, slightly yellow)
- FILL light from camera-side (cooler, dim)
- RIM light from behind (cool blue-grey)
- Highlights: bright specular on top of head, eye shine (catch
  light), wet sheen on back, toe pad shine

### Pose (default "sitting/alert")

- Front legs: bent at elbow, hands flat on surface, fingers spread
- Back legs: folded tightly against body, knees up, feet tucked
  beside hips
- Head: slightly raised, looking forward
- Eyes: open, alert, with vertical pupils
- Body: low to ground, not crouched in defense — relaxed but
  alert

---

## BUILD METHOD — HEADLESS BLENDER

I will write a Python script (`/scripts/blender/build_frog.py`)
that runs Blender on your Mac, builds the frog procedurally, bakes
textures, exports GLB. No Blender UI interaction required from you.

### Why this approach

1. **You don't know Blender** — this gets the frog built without
   requiring you to learn
2. **Total control** — every color, every proportion is specified
   in the script
3. **Reproducible** — if we need to regenerate, just run the script
4. **Asset pipeline compatible** — outputs GLB that drops into the
   project immediately
5. **Matches your vision** — the colors and anatomy are exactly
   what you sent in the reference

### Build stages (script does all of this)

```
STAGE 1 — Base mesh (5-8k tris total)
  - Body: subdivided sphere, scaled and shaped
  - Head: smaller subdivided sphere, blended into body
  - Eyes: 2 spheres, scaled + placed, with iris+pupil texture
  - Legs: cylinders, tapered, with knee bend
  - Feet: cylinders with toe spheres at end
  - Toe pads: small flattened spheres at toe tips
  - Merge all into single mesh
  - Total: ~8,000 tris

STAGE 2 — UV unwrapping
  - Smart UV project for main body
  - Separate UV islands for: body top, body sides, belly, eyes,
    legs (front), legs (back), feet, toe pads
  - Pack UVs to 0-1 space efficiently

STAGE 3 — Vertex colors / texture baking
  - Use Vertex Colors to paint the color zones directly:
    - Top: bright green
    - Sides: blue
    - Belly: cream
    - Toes: orange
    - Eyes: orange-red with black pupil
  - Bake vertex colors → diffuse texture map
  - Generate normal map from subdivided mesh
  - Generate roughness map (toes/eyes shiny, belly smooth,
    body slightly rough)

STAGE 4 — Materials (PBR per VQS)
  - Body: baseColor from baked texture, normal, roughness,
    slight subsurface scattering (green light through thin skin)
  - Eyes: separate material, more glossy, slight emissive
    (the red is bright)
  - Toe pads: slightly different roughness, more glossy

STAGE 5 — Bioluminescent glow effect
  - Add small emissive patches on:
    - Spine ridge (faint cyan-green strip)
    - Eye rims (very faint cyan rim around red iris)
    - Toe pad edges (very faint)
  - Emissive color: #6FCFB8 (matches --biolume_cyan from palette)
  - Emissive intensity: 0.3-0.5 (subtle, visible in dark)

STAGE 6 — Pose + export
  - Apply default "sitting/alert" pose
  - Optional: add armature for future animation (idle bob, croak)
  - Export as GLB → /public/assets/models/char__frog__v03.glb

STAGE 7 — Verify
  - Load GLB in three.js / R3F test scene
  - Render at 1080p, screenshot
  - Show user
  - User approves or requests tweaks
```

### Time estimate

- Script writing: 4-6 hours (one session)
- Blender rendering: 5-15 minutes per run
- Iteration: 2-4 rounds (build → screenshot → tweak)
- **Total: 2-3 days** to Awwwards-quality frog

---

## INTEGRATION WITH ARCHITECTURE LOCK

Once the frog GLB is built, it integrates with the locked
architecture:

| Phase | Frog behavior |
|---|---|
| Phase A (loading) | Frog inside CRT screen, slow Y-rotation + gentle bob (same as existing `Frog.tsx` behavior — keep this for loading screen) |
| Phase B (fall) | Frog tumbling beside camera, glow visible in mist |
| Phase C (drift) | Frog appears 5-8m ahead of camera, makes sounds, cyan glow visible, teleports when camera gets close (~2-3m distance) |
| Phase D (clearing) | Frog settles on log next to Yeri, glow dimmer, outline glow enabled, clickable |

**Animation states for the frog:**
- `idle-bob` (subtle Y movement + breathing)
- `croak` (mouth open, body compress, then release)
- `hop` (forward leap with arc)
- `teleport-dissolve` (when frog disappears ahead, brief particle puff)
- `teleport-appear` (when frog reappears further ahead, brief particle puff)
- `settle` (sit down on log, used in Act 4)

**Outfitting in code:**
- `useGLTF('/assets/models/char__frog__v03.glb')`
- Animation mixer for state transitions
- Outline glow via OutlinePass (drei) when in Act 4
- Emissive material respects time-of-day (dimmer in moonlight, brighter in dark)
- Cyan glow flicker: subtle intensity variation 0.8x-1.2x over 2-3 seconds

---

## WHAT I NEED FROM YOU TO START THE BUILD

**Nothing additional.** The frog spec is locked. I have everything
needed:

- ✅ Species: Red-Eyed Tree Frog
- ✅ Reference image (with hex-level color breakdown)
- ✅ Proportions documented
- ✅ Pose specified
- ✅ Materials specified (PBR per VQS)
- ✅ Glow effect specified (emissive cyan patches)
- ✅ Build method locked (headless Blender)
- ✅ Animation states planned

**I will start the build now.** Step 1: write the Blender Python
script that procedurally generates the frog. Step 2: run it on your
Mac via Blender command line. Step 3: export GLB. Step 4: render a
test screenshot to verify. Step 5: show you, react, iterate.

**After the frog GLB is approved, we move to:**
1. World skeleton (sky + moon + ground + first tree + lighting +
   fog) — 3-5 days
2. Yeri textures + animations — 3-5 days (can run in parallel)
3. Hotspot + HUD system — 3-5 days
4. Scroll-driven camera — 2-3 days
5. Polish — 3-5 days

**Total: 3-4 weeks to Awwwards-quality MVP.**

---

## DENSE RAINFOREST SECTION — LOCKED

**Decision:** Option B — 30-40% of Act 3 scroll

**Position in scroll:**
- Act 3 starts (25% scroll): open canopy, scattered trees
- 35-45% scroll: entry into dense rainforest section
- 45-75% scroll: DENSE RAINFOREST (canopy closed, mushrooms,
  gems, fireflies lighting path)
- 75-95% scroll: opening up, fewer trees, more sky visible
- 95-100% scroll: Act 4 clearing reveal

**Tree density values:**
- Open section (25-35% scroll): 4-6m spacing between trees
- Dense section (45-75% scroll): 1-2m spacing, overlapping canopies
- Opening section (75-95% scroll): 3-5m spacing
- Clearing (95-100% scroll): 8-12m spacing, framing only

**Lighting transitions:**
- Open section: more moonlight visible
- Dense section: mostly dark, lit by fireflies + mushrooms + gems
- Opening section: moonlight returns, distant campfire glow visible
- Clearing: full fire light + moonlight

---

## IMMEDIATE NEXT STEP

I start building the frog. Specifically:

1. **Now**: write `scripts/blender/build_frog.py` (procedural
   Red-Eyed Tree Frog from primitives, with materials + glow)
2. **Next**: verify Blender is installed on your Mac
   (`which blender` — should return a path)
3. **Then**: run the script via headless Blender
4. **Then**: export GLB
5. **Then**: load GLB in a test R3F scene, screenshot
6. **Then**: show you, react

Let me check Blender availability first:
