---
status: decisions-locked
locked-at: 2026-06-19
user-confirmed: true
block: 5-visual-quality-standard
replaces: original-block-5 (older-counter-strike-era)
---

# 10 — Visual Quality Standard (Lock Log)

> **Source block:** Block 5 of `_decisions/00_script_verbatim.md`
> **Status:** ✅ FULLY LOCKED 2026-06-19 (all 8 decisions)
> **Result:** Photoreal immersive dark jungle tier. Matches user
> reference images and "most immersion" directive.

---

## USER CONFIRMATIONS (verbatim, 2026-06-19)

> *"1=the colors from the images given thats what it will be u for the
> world atleast. 2=yes good 3= good 4=good 5=good 6=good 7=we will
> fully match the new tier and complete it from hair to hair 8= we
> need a mobile version to"*

**Translation:**
- 1 (palette): Approve the extracted palette as starting point
- 2 (lighting model): Approve
- 3 (post-processing): Approve
- 4 (polygon budget): Approve
- 5 (texture strategy): Approve
- 6 (render pipeline): Approve
- 7 (brain file reconciliation): Rewrite the brain file to match new
  tier. "Hair to hair" = full quality, no shortcuts.
- 8 (mobile support): Mobile version required (with LOD)

**Plus:** brightness reference image provided — moonlit night scene
with pure silhouettes + moon as hero light + small lit foreground
patch. Final product is THIS dark, not "darker than reference." This
image IS the reference.

---

## REFERENCE IMAGE — Forensic Breakdown (the brightness target)

**Image:** `e6bc323d9dad8f84a55487e6f0bf4133.jpg` — moonlit forest
path with pink flowers, signed "Gina"

### Composition
- Full moon upper-center, slightly right
- Path winding from foreground bottom-center into middle distance
- Trees framing both sides as pure silhouettes
- Foreground grass and wildflowers (pink/white) lit by something
  other than moon
- Mist in middle distance obscures the path
- Eye travels: foreground flowers → path → mist → moon → silhouettes

### Palette (estimated hex)
- **Sky around moon:** `#1F1A12` (very dark warm brown-black)
- **Moon core:** `#F5EDD8` (warm pale yellow-white)
- **Moon glow halo:** `#A89870` (warm amber-brown)
- **Tree silhouettes:** `#0A0A0A` (near pure black)
- **Background mist:** `#2A2818` (dark warm brown)
- **Mid-distance fog:** `#3D3825` (slightly lighter warm brown)
- **Foreground grass (lit):** `#4A5A28` (saturated dark green)
- **Foreground grass (shadow):** `#1A2418`
- **Path stones (silhouetted):** `#1A1812`
- **Pink flowers:** `#A8485E` (muted dark pink, not bright)
- **White flowers:** `#9A9080` (warm cream-grey, not bright white)
- **Tree trunks (faintly visible):** `#2A2218`

### Lighting (this is the CRITICAL detail)
- **KEY:** the moon. Position upper-center. Color temperature WARM
  (yellow-white, ~3500K). Acts as the only "natural" light source.
- **FILL on foreground:** there's a SEPARATE light source lighting
  the foreground grass and flowers. It's NOT moonlight — moonlight
  from above wouldn't light foreground grass this bright. It looks
  like either (a) a low warm fill light, (b) the photographer's
  post-processing, or (c) reflected light off something not visible.
  This is an INTENTIONAL artistic choice that makes the foreground
  readable while the rest stays dark.
- **RIM:** none visible
- **Shadow color:** near-black with subtle warm tint (`#0A0A0A`)
- **Shadow softness:** hard silhouettes (no fill, no ambient)
- **Specular:** none on trees (they're pure silhouettes), subtle on
  foreground wet grass

### Atmosphere/Fog
- **Heavy volumetric mist** in middle distance
- Color: warm brown-grey (`#2A2818` to `#3D3825`)
- Density: thick enough to obscure path and distant trees
- Light source interaction: mist is LIT BY THE MOON, creating a
  visible halo around it
- Particles: visible dust/mist particles catching moonlight

### Texture detail
- **Trees (silhouettes):** ZERO visible detail — pure black masses
- **Foreground grass:** HIGH detail (individual blades, varied greens)
- **Flowers:** visible detail (petals, stems)
- **Path stones:** LOW detail (silhouetted, hard to read texture)
- **Sky:** smooth gradient (no visible stars or texture)

### What makes it immersive
1. **Pure silhouettes** — the trees have NO detail. They're mass. This
   is what makes the moon feel bright.
2. **Single bright source** — the moon is the only thing with high
   brightness. Everything else is dark. Eye has nowhere else to go.
3. **Foreground/background contrast** — foreground grass is lit
   (readable), background is pure black. Creates depth.
4. **Pink flowers as accent** — small pops of muted color in an
   otherwise dark/warm frame. Draws eye to the path.
5. **Mist gradient** — the further into the scene, the warmer and
   softer the mist gets. Creates real atmospheric depth.

### Art-direction choices
- Heavy warm color grade (whole image leans warm)
- Pure black shadows (this is one of the FEW cases where pure black
  is intentional — silhouettes need it)
- Vignette: subtle dark corners
- DOF: foreground sharp, misty middle-distance soft
- No chromatic aberration
- No film grain visible (smooth image)

### What this image TEACHES about the brief
- The script says "Dim. Shafts of pale moonlight cut through gaps in
  the canopy." — THIS image is the moonlight aesthetic
- The script says "creepy tension" in Act 3 — THIS image IS that
  tension. Dark. Watched. Alive but not safe.
- The script says "warm amber glow. Flickering. The campfire" in
  Act 4 — the foreground fill light in this image hints at how the
  campfire light should read against the dark forest. Subtle, warm,
  local. NOT lighting everything.
- The brain file said `--void_000 #080808` — but this image's
  shadows are darker than that, more like `#0A0A0A`. Update.

---

## LOCKED DECISIONS (final)

### ✅ Decision A — Darkness level — LOCKED

**Final spec:**
- Reference: user-provided moonlit forest path image is THE target
- Shadow color: `#0A0A0A` (was `#060A07` — user wants darker)
- Shadow color tint: warm-brown when in moonlight areas, cool-green
  when in canopy-shadow areas
- Moon/light source brightness: `#F5EDD8` core, `#A89870` halo
- Foreground fill light: separate warm fill, intensity 0.3-0.5, to
  make foreground grass readable while background stays dark
- Brightness range: shadow at #0A0A0A, key light at #F5EDD8 — extreme
  contrast (intentional, like the reference)
- Pure silhouettes: ALLOWED for distant trees (this is the
  immersive choice, not a limitation)

### ✅ Decision B — Quality tier — LOCKED

**Final spec:**
- Photoreal / immersive / cinematic / Awwwards-tier
- NOT old game era, NOT stylized
- Industry references: Apple Vision Pro / Active Theory / Wokine /
  Resn 2024-2026
- Per-character budget: 200k-500k tris
- Texture res: 4096² for heroes
- Full PBR + IBL + post-processing chain
- "Hair to hair" quality — no shortcuts

### ✅ Decision C — Palette — LOCKED (extracted from all 4 reference
images + final spec)

**Final 14-color palette:**

```
WORLD SHADOWS & DARKS (the foundation)
  --void_000     #0A0A0A   deepest shadow, near-pure-black
                             (was #080808 / #060A07 — user wants
                             darker)
  --shadow_warm  #15110D   shadow with warm tint (moonlit areas)
  --shadow_cool  #0E1F12   shadow with cool green tint (canopy shadow)

WORLD MID-TONES (the body)
  --moss_shadow    #142A18   moss in deep shadow
  --moss_mid       #2D4A2A   moss in mid light
  --moss_highlight #5C7E3E   moss in direct light
  --stone_base     #2A2520   wet stone shadow
  --stone_mid      #4A4138   stone in mid light
  --stone_highlight #7A6B5E  stone in direct light

ATMOSPHERE (the depth)
  --mist_cool      #6A7868   cool grey-green atmospheric fog
  --mist_warm      #8A8270   warm-tinted mist (moonlit halo areas)

LIGHT SOURCES (the accents)
  --moonlight      #F5EDD8   warm pale moonlight core
  --moonlight_halo #A89870   moon glow halo
  --ember_warm     #D4A02A   fire light, warm amber-gold (Act 4)
  --ember_glow     #FFB84D   hot ember orange (Act 4 fire center)
  --biolume_cyan   #6FCFB8   bioluminescent green-blue accent
  --flower_pink    #A8485E   muted dark pink (like the reference
                             flowers — NOT bright pink)
  --flower_white   #9A9080   warm cream-white (NOT bright white)
```

**Rules:**
- Use `--void_000` for actual deepest darks (was wrong in brain as
  `#080808` — too light for the new tier)
- Use `--shadow_warm` in moonlit areas, `--shadow_cool` in canopy
  shadow
- Use `--mist_warm` near light sources, `--mist_cool` elsewhere
- The bright colors (`--moonlight`, `--ember_*`) are ACCENTS only —
  most of the frame is in shadow tones
- No pure white, no pure black beyond `--void_000`

### ✅ Decision D — Lighting model — LOCKED

**Final spec:**

```
HDRI / ENVIRONMENT MAP
  - Source: procedural night sky with moon, OR downloaded HDRI from
    Poly Haven CC0 ("night", "moon", "dark forest")
  - Intensity multiplier: 0.15 (very dim ambient)
  - Tint: warm shift toward `#A89870` for moonlit feel
  - Used for: subtle reflection on wet surfaces, no direct lighting

KEY LIGHT (DirectionalLight — THE MOON)
  - Position: high in sky, slightly behind camera (like reference
    image)
  - Color: #F5EDD8 (warm moonlight)
  - Intensity: 0.6-1.2 (varies by scene — 0.6 in Act 3 forest, 1.2
    in Act 4 when moon visible through canopy gap)
  - Cast shadows: yes, soft (PCFSoft, radius 4-8)
  - Shadow map size: 2048² minimum
  - Shadow bias: -0.0005
  - Shadow color: tint toward #15110D (warm-shadow)

FILL LIGHT (DirectionalLight — opposite key)
  - Color: #2A4530 (dark moss-green tint)
  - Intensity: 0.1-0.2 (very subtle)
  - No shadow casting
  - Purpose: subtle bounce from canopy, prevents pure black

FOREGROUND ACCENT (DirectionalLight or SpotLight)
  - Position: low angle, warm color, pointing at foreground
  - Color: #4A3A28 (warm amber-tinted)
  - Intensity: 0.3-0.5
  - Purpose: make foreground grass/path readable (per reference
    image), keep background dark
  - Tight cone (SpotLight) for selective illumination

RIM LIGHT (per-scene)
  - Act 3 Swamp Drift: #4A6878 (cool blue-grey rim from moonlight
    through canopy)
  - Act 4 Clearing: #D4A02A (warm amber rim from campfire behind
    subject)
  - Intensity: 0.3-0.5

LOCAL LIGHTS (PointLights — scene-specific)
  - Campfire: PointLight, #FFB84D, intensity 4-8, distance 8-12,
    casts shadows (1024² shadow map)
  - Bioluminescent mushrooms: PointLight each, #6FCFB8, intensity
    0.4-0.8, distance 1-2, no shadows
  - Lanterns (if any): PointLight, #D4A02A, intensity 1-2, distance
    3-5

GOD-RAYS (post-processing — see Decision E)
  - Only present in specific scenes (canopy gap moonlight, Act 4
    fire)

VOLUMETRIC FOG
  - THREE.FogExp2
  - Color: #2A2818 (matches reference mist) in moonlight areas,
    #3D3825 in mid-distance, #2A2520 in foreground shadow
  - Density: 0.06-0.10 (heavier than original spec — matches
    reference image)
  - Per-scene variation
  - Plus: 3-5 large semi-transparent fog planes at depth for
    layered fog (especially in Act 3 forest)

TONE MAPPING
  - THREE.ACESFilmicToneMapping
  - Exposure: 0.5-0.7 (much darker than original 0.85 — matches
    reference image)
  - Per-scene: Act 3 darkest (0.5), Act 4 slightly brighter due to
    fire (0.7)

COLOR SPACE
  - THREE.SRGBColorSpace output
  - Linear lighting pipeline internally
```

### ✅ Decision E — Post-processing chain — LOCKED

**Final spec (in render order):**

```
1. SSAO (Screen Space Ambient Occlusion)
   - Intensity: 2.0-3.0 (heavy contact shadows, like reference)
   - Radius: 0.5-1.0
   - Samples: 24-32
   - Color: tinted toward #15110D (warm shadow)
   - Purpose: deep contact shadows under leaves, in moss crevices

2. Bloom (selective, on bright sources only)
   - Intensity: 0.6-1.0 (strong — moon and fire should feel bright)
   - Luminance threshold: 0.85
   - Luminance smoothing: 0.4
   - Radius: 0.8
   - Mipmap blur: true
   - Purpose: moon halo, fire glow, bioluminescence

3. GodRays (volumetric light shafts)
   - Source: moon (Act 3 + Act 4 through canopy), fire (Act 4)
   - Density: 0.92-0.96 (very dense, like reference)
   - Decay: 0.94-0.97
   - Weight: 0.5-0.7
   - Exposure: 0.5-0.7
   - Samples: 80-100 (high quality)
   - Color: tinted by source (moon = warm, fire = amber)
   - Purpose: the visible halo around the moon in reference image,
     the canopy gap shafts

4. DepthOfField (selective)
   - Focus distance: matches focal subject
   - Focal length: 0.02-0.04 (tight focus on subject)
   - Bokeh scale: 2-3
   - Purpose: cinematic eye-direction

5. Chromatic Aberration (very subtle)
   - Offset: [0.0005, 0.0005]
   - Purpose: subtle lens realism

6. Vignette (moderate — stronger than original spec)
   - Offset: 0.3
   - Darkness: 0.6-0.8 (creates the dark frame around reference
     image)
   - Purpose: eye centers, intensifies dark jungle feel

7. Film Grain (subtle)
   - Intensity: 0.08-0.15 (slightly more than original spec — kills
     banding in dark areas)
   - Purpose: organic texture

8. Color Grading (custom shader or LUT)
   - Lift shadows: slight warm-brown shift toward #15110D
   - Crush midtones: moderate (creates depth)
   - Warm highlights: very subtle
   - Saturation: slightly reduced in shadows, slightly increased in
     midtones (selective saturation)
   - Purpose: cohesive dark-jungle color grade across all acts

9. Noise (very subtle)
   - Opacity: 0.03-0.05
   - Purpose: organic texture breakup
```

### ✅ Decision F — Polygon budget — LOCKED

**Final spec (with mobile LOD):**

```
DESKTOP TARGET (primary)
  - Yeri character: 200,000-500,000 tris
  - Frog (hero, Act 2-3): 30,000-50,000 tris
  - Tent (hero, Act 4): 50,000-100,000 tris
  - Campfire + logs (Act 4): 30,000-80,000 tris
  - Hero trees (1-3 in close camera): 80,000-150,000 tris each
  - Environment trees (5-15 in scene): 30,000-80,000 tris each
  - Moss patches on rocks: 5,000-15,000 tris each
  - Ferns: 2,000-5,000 tris each
  - Background trees (far): 5,000-15,000 tris each (low LOD)
  - Distant fog cards: simple textured planes

  PER-SCENE (desktop):
    - Act 1 (CRT screen content): 50,000-100,000 tris total
    - Act 2 (falling): 30,000-60,000 tris
    - Act 3 (forest path): 400,000-800,000 tris total visible
    - Act 4 (clearing): 500,000-1,000,000 tris total visible

MOBILE TARGET (with aggressive LOD)
  - All hero objects reduced by 60-70%
  - Yeri mobile: 80,000-150,000 tris
  - Hero trees mobile: 30,000-50,000 tris each
  - Background culling: aggressive (anything beyond 30m uses low LOD)
  - Per-scene mobile:
    - Act 1: 30,000-60,000 tris
    - Act 2: 20,000-40,000 tris
    - Act 3: 150,000-300,000 tris visible
    - Act 4: 200,000-400,000 tris visible
  - Mobile does NOT use god-rays (too expensive)
  - Mobile DOES use SSAO + Bloom (essential)

ASSET FILE SIZES (Draco + KTX2 compressed)
  - Yeri: 5-15MB GLB
  - Hero trees: 2-5MB each
  - Background trees: 500KB-1MB each
  - Frog: 1-3MB
  - Tent: 2-5MB
  - TOTAL scene assets: 30-50MB (streamed progressively)

INITIAL PAYLOAD
  - Desktop first frame: 5-10MB (code + initial assets)
  - Mobile first frame: 2-5MB
  - Progressive streaming: hero assets load first, background
    streams in as user moves through scene
```

### ✅ Decision G — Texture strategy — LOCKED

**Final spec:**

```
RESOLUTION (per asset tier)
  - Hero characters (Yeri): 4096² diffuse + 4096² normal + 2048²
    packed (rough/metal/AO)
  - Frog: 2048² - 4096²
  - Hero props (tent, campfire): 2048² - 4098²
  - Hero trees: 2048² - 4096²
  - Background trees: 1024² - 2048²
  - Small props: 512² - 1024²
  - TOTAL texture weight (all assets): 50-120MB

COMPRESSION
  - KTX2 / Basis Universal for GPU-native (50% smaller than PNG)
  - Mipmaps: enabled, all assets
  - Anisotropic filtering: 16x
  - Transcoding: UASTC for color, ETC1S for normal/AO

WORKFLOW
  - Source: photogrammetry (Sketchfab CC0, Quaternius, Poly Haven)
    + hand-painted detail pass for hero assets
  - PBR maps generated in Substance Painter OR Material Maker
  - Bake AO + curvature for hero assets
  - Subsurface for organic materials (skin, leaves, tent fabric)
  - Clearcoat for wet surfaces

PBR MAP SET per material
  - BaseColor (sRGB)
  - Normal (OpenGL convention — consistent)
  - Roughness (linear)
  - Metalness (linear)
  - AO (linear, multiplied into BaseColor in shader)
  - Optional: Subsurface (leaves, skin)
  - Optional: Clearcoat (wet leaves, wet stones)
  - Optional: Emissive (bioluminescence, campfire, moon)

MOBILE TEXTURE OVERRIDE
  - Mobile uses half-resolution textures (2048² hero → 1024², etc.)
  - KTX2 transcoded to ETC1S for older mobile GPUs
  - Anisotropic filtering reduced to 4x on mobile
```

### ✅ Decision H — Render pipeline — LOCKED

**Final spec:**

```
RENDERER
  - WebGLRenderer
  - Antialias: true (desktop), false on mobile (use FXAA instead)
  - Power preference: high-performance
  - Stencil: true
  - Depth: true
  - Logarithmic depth buffer: true (for fog correctness at depth)
  - Tone mapping: ACES Filmic, exposure 0.5-0.7 per scene
  - Output color space: SRGB

SHADOWS
  - THREE.PCFSoftShadowMap
  - Key light shadow map: 2048²
  - Fill/rim: no shadows (perf)
  - Campfire shadow map: 1024²
  - Shadow bias: -0.0005
  - Normal bias: 0.02
  - Shadow radius: 4-8

POST-PROCESSING (see Decision E for full chain)
  - EffectComposer (R3F + @react-three/postprocessing)
  - Order: SSAO → Bloom → GodRays → DoF → Chromatic → Vignette →
    Grain → ColorGrade

LEVEL OF DETAIL (LOD)
  - Three.js LOD system per object
  - 4 levels: hero, high, mid, background
  - Switch distances: 20m, 50m, 100m
  - Mobile: switch distances tighter (10m, 25m, 50m)

FRUSTUM CULLING: enabled
OCCLUSION CULLING: needed for forest scenes
  - Use three-mesh-bvh or simple distance-based culling
  - Mobile uses simpler distance culling

DRAW CALL BUDGET
  - Desktop target: <250 draw calls per frame
  - Mobile target: <120 draw calls per frame
  - Use instancing for trees, rocks, mushrooms
  - Use atlas for small props
  - Merge static geometry where possible
  - Aggressive batching on mobile

PERFORMANCE TARGETS
  - Desktop: 60 fps at 1920x1080
  - Desktop: 30 fps at 4K
  - Mobile (mid-tier, iPhone 12 / Pixel 6): 30-60 fps at native
    resolution
  - Mobile (low-tier, iPhone 8 / Pixel 3): 30 fps at 75%
    resolution
  - Fallback: if fps drops below threshold, reduce post-processing
    chain (disable GodRays first, then reduce SSAO samples)
```

---

## BRAIN FILE RECONCILIATION — DECISION 7 LOCKED

User: *"we will fully match the new tier and complete it from hair to hair"*

**Action items (to be done after block 5 is fully locked):**
1. Rewrite `_brain/100_anura-systems.md` to reflect new tier
2. Update palette tokens to match new 14-color palette
3. Update performance budget section
4. Update "Visual style" section — remove "Hybrid Realistic"
5. Add tier reference (Apple / Active Theory)
6. Update "Don't-do list" — add "don't ship below photoreal tier"
7. Update asset status table — Yeri 200k-500k tris, not 317k

**This is a one-shot rewrite of the brain file.** Will be done
in a separate file change after this block is signed off.

---

## MOBILE SUPPORT — DECISION 8 LOCKED

User: *"we need a mobile version to"*

**Mobile-specific requirements:**
1. Separate mobile renderer config (lower res, no AA, lower post)
2. Aggressive LOD (3 levels minimum)
3. Reduced texture resolution (half-res)
4. Disabled god-rays on mobile
5. Reduced SSAO samples (16 instead of 24)
6. Reduced draw call budget (120 max)
7. Touch-optimized controls (vs mouse hover for hotspots)
8. Mobile-specific performance monitor with auto-fallback

**Mobile tier targets:**
- **High-tier mobile** (iPhone 14+, Pixel 7+): full experience minus
  god-rays, 50% texture resolution
- **Mid-tier mobile** (iPhone 11-13, Pixel 5-6): mobile LOD, half
  texture res, no SSAO, only bloom + DoF + vignette
- **Low-tier mobile** (iPhone 8-XR, Pixel 2-4): static fallback
  scene with image pre-render + hotspots + form overlay (skip the
  real-time 3D entirely on these)

---

## VISUAL QUALITY STANDARD — FINAL LOCKED TEXT

**Block 5 of `_decisions/00_script_verbatim.md` is REPLACED with:**

> **VISUAL QUALITY STANDARD (applies to all 3D acts):**
> Photoreal immersive tier. Modern PBR. Full HDRI + IBL. Real-time
> soft shadows. Heavy SSAO. Volumetric fog matching the moonlit
> reference image — most of the frame in deep shadow, with
> silhouettes, warm mist halos around the moon, and small warm
> focal points (campfire, bioluminescence) as the only bright
> accents. God-rays through canopy gaps and around the moon.
> Per-character poly budget 200k-500k. Hero textures 4096². Initial
> payload 5-10MB desktop, 2-5MB mobile. Target: Apple Vision Pro /
> Active Theory / Wokine 2024-2026 tier. Mobile version required
> with aggressive LOD.

---

## WHAT'S NEXT

Block 5 (Visual Quality Standard) is FULLY LOCKED. All 8 decisions
sealed.

**Next decision in this block:** the user originally picked B =
"camera" as the second decision to lock inside Block 5. But Block 5
is now more of a global standard than a per-scene block. Camera is
actually per-scene (each act has its own camera).

**Better flow:**
1. ✅ Block 5 locked (global tier) ← we are here
2. NEXT: Move to **Block 4 (Act 4 — The Clearing)** and lock its
   decisions scene-by-scene (palette already global, but camera,
   lighting positions, material specs, motion, copy all per-scene)
3. Then Block 3 (Act 3), Block 2 (Act 2), Block 1 (Act 1)

OR

1. ✅ Block 5 locked
2. NEXT: Move to **Block 1 (Act 1 — The Gate)** since it's the
   user's first impression and locks the brand tone for everything
   after

**My recommendation: Block 4 (Act 4 — The Clearing) first.** It's
the heart of the experience — the destination. If we know exactly
what the clearing looks like (the dark red tent, the campfire,
Yeri character, the moon through canopy), every other act is
shaped by what we're moving TOWARD. Act 1 is a transition, Act 2
is a transition, Act 3 is a journey. Act 4 is the arrival.

**Confirm:** do we move to Block 4 next, or do you want Block 1
(Act 1 — The Gate) first because it's what users see first?

Also: I will rewrite the brain file `_brain/100_anura-systems.md`
to reflect the new tier as soon as you confirm we're moving on
from Block 5.
