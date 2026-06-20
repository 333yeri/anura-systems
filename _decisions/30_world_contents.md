---
status: drafting
started-at: 2026-06-19
block: 30-world-contents
---

# 30 — World Contents (Lock Log)

> **Purpose:** Lock every piece of geometry that exists in the
> single persistent world. What it is, where it sits, what it looks
> like at the locked quality tier.
> **Status:** DRAFTING — item by item
> **Rule:** Lock in order. No skipping. Don't advance until current is locked.

---

## WHAT'S IN THE WORLD (the complete inventory)

The world contains exactly these elements:

```
LOADING PHASE (Phase A) — separate from world, but lives in same file tree
  1. Sony PVM CRT (housing, bezel, screen plane)
  2. Frog (loading mascot, inside CRT screen, rotates slowly)

WORLD GEOMETRY (everything below is in the SAME world, visible at different scroll positions)
  3. Sky dome + moon (visible through canopy gap in Act 4)
  4. Ground / mud terrain (the floor of the jungle)
  5. Muddy path (the trail the camera follows through Act 3)
  6. Trees (hero + background tiers)
  7. Moss patches on rocks and trunks
  8. Ferns + undergrowth
  9. Fallen logs
 10. Rocks
 11. Fireflies (path lighting system)
 12. Glowing mushrooms (clickable content)
 13. Clickable stones / gems / rocks
 14. Clickable plants / exotic flowers
 15. Clickable hidden symbols / water pools
 16. Frog (guide character, Act 3 + Act 4)
 17. Dark red tent (Act 4 hero)
 18. Campfire (Act 4 hero)
 19. Yeri character (Act 4, on log)
 20. Log (Yeri sits on it, Act 4)

ATMOSPHERE & FX
 21. Volumetric fog
 22. God-rays (through canopy gap)
 23. Fireflies (particle system)
 24. Post-processing chain
```

That's 24 distinct elements. Each gets locked individually below.

---

## LOCK LOG

### Item 1 — Sony PVM CRT

**Status:** ✅ LOCKED 2026-06-19 — see `_decisions/20_architecture.md`

**Spec:** Sony PVM broadcast monitor, ~1990s, dark gray matte
housing, squared shape, SONY badge below screen, control buttons
on lower front, 4:3 aspect ratio, slightly curved CRT glass.
Exists ONLY during Phase A (loading). Unmounts after fall.

**Poly budget:** 15,000-25,000 tris (it's a hero prop but it's
small and only visible briefly — medium-detail)
**Texture:** 2048² diffuse + 1024² normal + 512² packed
**Position:** centered in viewport, floating in pure black void
**Animation:** subtle Y-bob + Z-rotation drift while loading
(breathe effect — see existing `FloatingCRT` component in
`Act1Gate.tsx`)

**Implementation note:** the existing `CRTFrame.tsx` is wrong
(it uses cream color, not Sony gray). Replace housing color.
Replace geometry with PVM-specific shape.

---

### Item 2 — Frog (loading mascot, inside CRT screen)

**Status:** 🔓 NEEDS LOCK

**Position:** inside CRT screen plane, centered, rotates slowly
around Y-axis while loading
**Poly budget:** same as the world frog (locked with item 16)
**Texture:** same as the world frog (same asset)
**Animation:** slow Y-rotation, subtle breathing scale (1.0 → 1.02 → 1.0)

**What needs your decision:**
- [ ] Frog rotation speed (1 full rotation per 8s? 12s? 16s?)
- [ ] Frog scale inside CRT (how big relative to screen height)
- [ ] Frog glow inside CRT — does it have cyan glow while loading,
      or only in the world?
- [ ] Frog color inside CRT — same green-brown swamp colors, or
      tinted slightly different (more saturated) for the "mascot
      on screen" feel?

---

### Item 3 — Sky dome + moon

**Status:** 🔓 NEEDS LOCK

**Position:** large sphere/skydome surrounding the world, moon
positioned in upper area (visible through canopy gap in Act 4)
**Poly budget:** skydome = simple sphere, 32 segments × 16 rings
(~1000 tris); moon = icosphere or sphere with detail
**Texture:**
- Skydome: procedural shader OR HDRI from Poly Haven
  - Dark night sky gradient (deep blue-black at zenith, warmer
    brown-black near horizon — matches reference image)
  - Subtle star field (procedural, ~200-400 stars visible)
  - NO moon glow on sky itself (moon is a separate object)
- Moon: detailed sphere with crater texture
  - Crater texture from NASA public domain or procedural
  - Emissive material (it generates its own light)
  - Subtle warm-yellow tint (matches `--moonlight` `#F5EDD8`)

**What needs your decision:**
- [ ] Sky: HDRI from Poly Haven, or procedural shader? (procedural
      gives more control, HDRI gives instant realism)
- [ ] Stars: visible or omitted? (omitted = more focused on moon)
- [ ] Moon position in sky: high overhead, upper-left, upper-right?
- [ ] Moon size relative to viewport: large (dominant) or small
      (atmospheric)?
- [ ] Moon phase: full, gibbous (per original script), or other?

**My recommendation:**
- Procedural sky shader (more control over darkness/color)
- Stars: minimal, just ~50-100 faint ones (visible but not
  dominant — matches reference image)
- Moon: upper-center, slightly right (matches your reference image)
- Moon size: large enough to be the focal point, ~5-8% of
  viewport height
- Moon phase: gibbous (3/4 full — per original script, looks more
  dramatic than full)

---

### Item 4 — Ground / mud terrain

**Status:** 🔓 NEEDS LOCK

**Position:** large flat-ish terrain, slightly uneven, the entire
forest floor
**Poly budget:** 80,000-150,000 tris (large terrain, displaced for
unevenness)
**Texture:** 2048²-4096² tiled, mud with grass patches + small
puddles
**Material:** PBR — basecolor mud, normal map for ruts/wet areas,
roughness 0.7-0.9 (wet = lower), metalness 0 (mud is not metal)
**Subsurface:** no (mud is opaque)
**Clearcoat:** yes on puddle areas (wet sheen)

**What needs your decision:**
- [ ] Terrain shape: completely flat with displacement, or rolling
      hills (subtle)?
- [ ] Color variation: uniform dark brown, or visible patches
      (mud/grass/dirt)?
- [ ] Puddles: how many, how large, do they reflect environment?
- [ ] Ground extends: only under the path, or fills entire world
      (extending beyond camera view)?

**My recommendation:**
- Subtle rolling hills (very gentle, ±0.5m elevation)
- Color variation: dark mud base with patches of darker/wetter mud
  and lighter grass tufts (varied per reference images)
- Puddles: 5-10 visible at any camera position, each 0.5-2m wide,
  reflecting sky (using `MeshReflectorMaterial` from drei or custom
  planar reflection)
- Extends: large, beyond camera view (don't see edges — infinite
  illusion)

---

### Item 5 — Muddy path (the trail)

**Status:** 🔓 NEEDS LOCK

**Position:** winding curve through the forest, ~100-150m long
**Poly budget:** ~20,000-40,000 tris (curved strip mesh, displaced)
**Texture:** 2048² mud path texture, different from ground (worn,
more compact, slight water staining)
**Material:** PBR, slightly more wet/glossy than ground (lower
roughness)
**Width:** ~1-1.5m (single-person-wide trail)
**Path shape:** CatmullRomCurve3 with 5-8 control points (matches
camera path)

**What needs your decision:**
- [ ] Path material: pure mud, or mud with embedded stones / leaves?
- [ ] Path edges: hard (defined edge) or soft (blends into ground)?
- [ ] Path lighting from fireflies — should path texture show
      firefly-lit highlights baked in, or live from particles?
- [ ] Path direction: leading to clearing always, or with minor
      loops/misdirection that resolve to the clearing?

**My recommendation:**
- Pure mud with subtle stone fragments (procedural placement)
- Soft edges (path blends into ground over ~0.3m)
- Firefly highlights live (from particle system, not baked)
- Path leads directly to clearing (no misdirection — this is a
  comfortable journey, not a maze)

---

### Item 6 — Trees

**Status:** 🔓 NEEDS LOCK

**This is the BIG one — the forest IS the world.**

**Tree tiers:**
- **Hero trees (1-3 in close camera):** 80,000-150,000 tris each
  - Full detail, custom trunks with bark variation, branches with
    leaf clusters
  - Position: framing the camera in Act 3 (foreground silhouette
    on left/right)
- **Mid trees (5-15 in scene):** 30,000-80,000 tris each
  - Mid-poly with believable silhouettes
  - Position: dense forest around the path, both sides
- **Background trees (20-50 visible):** 5,000-15,000 tris each
  - Low-poly silhouettes
  - Position: backdrop, atmospheric depth
- **Distant trees (hundreds, fog card):** flat planes with tree
  silhouette texture
  - Position: extreme distance, fog-blurred

**Texture:**
- Hero: 2048²-4096² bark + 2048² leaf atlas per tree species
- Mid: 1024²-2048²
- Background: 512²-1024²
- Distant: 256² silhouette card

**Species:** all trees should be the SAME species or 2-3 species
max — creating a consistent jungle feel, not a botanical garden.
Looking at your reference images: large canopy trees with hanging
vines, possibly banyan-style with aerial roots, dense foliage.

**What needs your decision:**
- [ ] Species: banyan (hanging aerial roots), kapok (large canopy),
      ceiba (similar), or other? Or mix of 2-3?
- [ ] Canopy: dense closed canopy (dark forest) or open (more sky
      visible)?
- [ ] Leaf color: dark green (per reference), or with seasonal
      variation?
- [ ] Hanging vines: yes (per reference) or no (cleaner trunks)?
- [ ] Moss on trunks: heavy moss coverage (per reference) or
      minimal?
- [ ] Tree placement: procedurally placed, or hand-placed along
      the path?

**My recommendation:**
- Species: banyan + kapok mix (2 species, both with hanging
  elements for that "tangled jungle" feel)
- Canopy: dense closed canopy (very dark, dramatic — moon only
  visible through one gap in Act 4)
- Leaf color: dark green with subtle variation
- Hanging vines: yes, multiple vines per hero tree
- Moss on trunks: heavy (matches reference images)
- Placement: procedurally placed with seeded RNG (consistent
  between sessions), hand-tuned along path

---

### Item 7 — Moss patches on rocks and trunks

**Status:** 🔓 NEEDS LOCK

**Position:** on rocks, fallen logs, tree trunks — wherever natural
**Poly budget:** 5,000-15,000 tris per patch (low-poly moss clumps
on surfaces)
**Texture:** 1024²-2048² moss with multiple green tones
**Material:** PBR with subsurface scattering (moss has slight
backlight glow)
**Density:** heavy on lower trunk + rock surfaces, lighter on
upper trunk (matches reference)

**What needs your decision:**
- [ ] Moss style: smooth velvety moss, or chunky clumpy moss with
      visible texture?
- [ ] Coverage: 80-100% (heavy), 50-70% (medium), or sparse?
- [ ] Color variation: all same green, or varied (yellow-green,
      blue-green, dark green)?
- [ ] Glow: bioluminescent in some patches (matches firefly
      aesthetic) or no glow?

**My recommendation:**
- Chunky clumpy moss with visible texture (more visual interest)
- Coverage: heavy on rocks/logs (~80%), medium on trunk bases
  (~60%), light on upper trunks (~30%)
- Color variation: 3-4 greens mixed (yellow-green highlights,
  blue-green shadows)
- Subtle bioluminescent glow on some patches (matches firefly
  aesthetic, ties together with `--biolume_cyan`)

---

### Item 8 — Ferns + undergrowth

**Status:** 🔓 NEEDS LOCK

**Position:** ground cover, especially at path edges
**Poly budget:** 2,000-5,000 tris per fern cluster
**Texture:** 1024² fern texture (alpha-blended leaves)
**Material:** PBR with subsurface (leaves have backlight glow)
**Density:** heavy near path edges, sparse in distance
**Animation:** subtle sway (vertex shader wind effect)

**What needs your decision:**
- [ ] Fern style: tropical (large fronds), or ferny (smaller,
      more delicate)?
- [ ] Density: very dense jungle floor, or sparse?
- [ ] Color: dark green only, or with autumn/orange tints?

**My recommendation:**
- Tropical large fronds (matches reference images — large leaves)
- Dense jungle floor (heavy coverage near path)
- Dark green with subtle variation, no autumn colors (keep
  consistent with moonlit-night palette)

---

### Item 9 — Fallen logs

**Status:** 🔓 NEEDS LOCK

**Position:** scattered through forest, framing path
**Poly budget:** 5,000-15,000 tris per log
**Texture:** 1024²-2048² bark + moss texture
**Material:** PBR with heavy moss coverage + wet patches
**Special:** ONE log in Act 4 is Yeri's seat (separate decision in
item 20)

**What needs your decision:**
- [ ] Log style: smooth-bark, rough-bark, or split/decayed?
- [ ] Moss coverage: heavy, medium, or light?
- [ ] Wet sheen: yes (per reference), no (drier look)?

**My recommendation:**
- Rough-bark with significant decay/moss coverage
- Heavy moss (matches reference)
- Subtle wet sheen on top (recent rain feel)

---

### Item 10 — Rocks

**Status:** 🔓 NEEDS LOCK

**Position:** scattered through forest, path-edge framing
**Poly budget:** 1,000-5,000 tris per rock
**Texture:** 512²-1024² rock texture with moss patches
**Material:** PBR with moss patches + wet sheen
**Density:** ~3-8 visible rocks per camera frame during Act 3

**What needs your decision:**
- [ ] Rock style: smooth river stones, jagged rocks, moss-covered
      boulders?
- [ ] Size variation: small (hand-sized) to large (boulder)?

**My recommendation:**
- Mix: 70% moss-covered boulders, 30% smaller stones
- Wide size variation (creates visual interest)
- Heavy moss on boulders, lighter on small stones

---

### Item 11 — Fireflies (path lighting system)

**Status:** ✅ LOCKED — see `_decisions/20_architecture.md`

**Spec:** 8-15 visible fireflies per camera frame during Act 3,
drifting slowly along path, emitting `#6FCFB8` cyan-green light,
positioned at knee-to-eye height, scattered/reformed by camera
proximity, NO outline glow, clickable for micro-copy panel.

---

### Item 12 — Glowing mushrooms (clickable content)

**Status:** 🔓 NEEDS LOCK

**Position:** scattered through forest, 3-8 visible per Act 3
camera frame
**Poly budget:** 500-2,000 tris per mushroom cluster
**Texture:** 512²-1024² mushroom texture (with emissive)
**Material:** PBR with strong emissive bioluminescence
**Color:** `#6FCFB8` cyan-green, matching fireflies
**Interaction:** outline glow on hover, clickable, opens panel
with copy theme

**What needs your decision:**
- [ ] Mushroom style: small bioluminescent mushrooms, large flat
      fungi, or variety?
- [ ] Glow intensity: strong (dominant light source) or subtle
      (just enough to read as glowing)?
- [ ] Quantity per cluster: 1-2 per clickable or 5-10?
- [ ] Cluster arrangement: at base of tree, on rock, in path-
      adjacent grass?

**My recommendation:**
- Variety: small bioluminescent mushrooms in clusters (3-8 per
  cluster)
- Glow: medium (visible but doesn't blow out the scene)
- Each clickable = 1 cluster
- Arrangement: at base of trees, on rocks, in path-adjacent grass

---

### Item 13 — Clickable stones / gems / rocks

**Status:** 🔓 NEEDS LOCK

**Position:** scattered through forest, path-edge or center
**Poly budget:** 1,000-5,000 tris per clickable
**Texture:** 512²-1024² with slight emissive highlight
**Material:** PBR with subtle emissive accent (catches eye)
**Interaction:** outline glow on hover, clickable, opens panel
with copy theme

**What needs your decision:**
- [ ] Stone style: river-smooth, crystal-faceted, geode-like (with
      glowing interior), or simple unusual-shape?
- [ ] Glow: subtle warm accent (like a small ember) or cold blue
      (mineral feel)?
- [ ] Size: hand-sized, head-sized, or larger?

**My recommendation:**
- Mix: 60% smooth river stones with subtle warm accent, 40%
  crystal/geode with cool blue interior glow
- Size: mostly hand-to-head sized (visible but not dominating)
- Variety per type keeps the discoveries fresh

---

### Item 14 — Clickable plants / exotic flowers

**Status:** 🔓 NEEDS LOCK

**Position:** forest floor, path edges
**Poly budget:** 2,000-5,000 tris per plant
**Texture:** 1024² plant texture with alpha
**Material:** PBR with subtle glow on flowers
**Interaction:** outline glow on hover, clickable, opens panel

**What needs your decision:**
- [ ] Plant style: large tropical leaves, exotic flowers, or
      unusual shapes?
- [ ] Flower color: muted dark (per moonlit reference, NOT bright),
      or occasional bright accent?
- [ ] Glow: on flowers only, on whole plant, or none?

**My recommendation:**
- Large tropical leaves (monstera-style, per reference images)
- Occasional small exotic flowers (muted colors per `--flower_pink`
  / `--flower_white`)
- Subtle glow on flowers only (not on leaves)

---

### Item 15 — Clickable hidden symbols / water pools

**Status:** 🔓 NEEDS LOCK

**Position:** varied — symbols on tree trunks, water pools in
forest floor depressions
**Poly budget:** varies (1,000-5,000 tris)
**Texture:** varies
**Material:** varies
**Interaction:** outline glow on hover, clickable, opens panel

**What needs your decision:**
- [ ] Symbols: carved into bark, glowing on rocks, projected by
      something, or moss-shape (only visible from specific
      angle)?
- [ ] Water pools: how reflective? Real reflections (planar) or
      simple (envmap)?
- [ ] Are these clickable AT ALL? They might be ambient-only
      (decoration, no copy attached)

**My recommendation:**
- Symbols: carved into bark (subtle, low-glow, almost missable)
- Water pools: planar reflections of moon/fireflies/sky (using
  drei `MeshReflectorMaterial`)
- These are ambient-only (not all clickables need copy — some
  are pure atmosphere)

---

### Item 16 — Frog (guide character, Act 3 + Act 4)

**Status:** ✅ LOCKED (behavior) — 🔓 NEEDS LOCK (visual specs)

**Behavior:** ✅ LOCKED — see `_decisions/20_architecture.md`
- Hallucination / guide / warmth-locator
- Always just ahead of camera, never catchable
- Teleports further when camera gets close
- Makes sounds (audio waypoints)
- Has subtle cyan glow
- Finally stops in Act 4, sits on log next to Yeri

**Visual specs to lock:**
- [ ] Species design: realistic frog, stylized frog, abstract
      frog-spirit?
- [ ] Size: small (hand-sized), medium (cat-sized), or larger?
- [ ] Color: green-brown swamp, all-green, or with cyan glow
      integrated?
- [ ] Glow intensity: faint (like a candle), medium (visible in
      dark forest), strong (dominant light)?
- [ ] Eye color: standard, glowing, or other?
- [ ] When on log in Act 4: same appearance, or "settled"
      (dimmer glow, more relaxed pose)?

**My recommendation:**
- Stylized frog — not photoreal (it should feel slightly
  otherworldly as a guide character)
- Medium size (cat-sized, ~30cm long) — visible but not
  dominating
- Color: green-brown base + cyan bioluminescent patches
  (especially on the back/spine)
- Glow: medium (visible in dark forest, casts faint light on
  nearby ferns)
- Eyes: glowing cyan (matches the bioluminescent patches)
- In Act 4: glow is dimmer, pose is "settled" (sitting calmly
  on log), eyes still slightly glowing

**Poly budget:** 30,000-50,000 tris (it's a hero character,
visible throughout)

---

### Item 17 — Dark red tent

**Status:** 🔓 NEEDS LOCK

**Position:** Act 4 clearing, left side (per original script)
**Poly budget:** 50,000-100,000 tris
**Texture:** 2048²-4096² tent canvas texture, weathered
**Material:** PBR fabric with subtle wear, slight subsurface
(warm amber light spilling out through open flap)
**Color:** maroon/dark red per script, weathered (NOT bright
red)
**Special:** open flap reveals cozy sleeping bag + warm interior
glow
**Interaction:** outline glow, clickable, opens "Home / How We
Work" panel

**What needs your decision:**
- [ ] Tent style: classic A-frame camping tent, canvas expedition
      tent, or modern dome tent?
- [ ] Size: 1-person, 2-person, or larger?
- [ ] Weathering: heavy (old/expedition), medium (well-used),
      light (new)?
- [ ] Interior visible: yes (open flap shows sleeping bag) or
      just suggested (closed flap)?
- [ ] Color: classic dark red (per script) or other?

**My recommendation:**
- Canvas expedition tent (matches "weathered camping tent"
  description, fits the brand aesthetic)
- 2-person size
- Heavy weathering (looks lived-in, expedition-style)
- Open flap revealing cozy interior (warm amber glow visible)
- Classic dark red, muted to match night palette

---

### Item 18 — Campfire

**Status:** 🔓 NEEDS LOCK

**Position:** Act 4 clearing, center (per original script)
**Poly budget:** 30,000-80,000 tris
**Texture:** 2048²-4096² wood + embers + flames (procedural
shader)
**Material:** PBR with strong emissive (the flames)
**Color:** amber/orange core `#FFB84D`, warm yellow glow
**Animation:** flickering (vertex shader or per-frame noise),
embers rising
**Light:** PointLight `#FFB84D` intensity 4-8, distance 8-12,
casts shadows
**Interaction:** outline glow, clickable, opens "Why Anura"
panel

**What needs your decision:**
- [ ] Fire style: contained fire ring with logs, bonfire (large
      wood pile), or fire pit (stone ring)?
- [ ] Size: small personal fire, medium campfire, large bonfire?
- [ ] Flames: tall and dramatic, or contained/realistic?
- [ ] Embers: many (active fire) or few (settled fire)?

**My recommendation:**
- Contained fire ring with stacked logs (classic campfire look)
- Medium campfire (1m diameter fire, 0.5m flame height)
- Tall, dramatic flames (this is a focal point, make it sing)
- Active fire with rising embers (lots of movement, life)

---

### Item 19 — Yeri character

**Status:** 🔓 NEEDS LOCK

**Position:** Act 4 clearing, on log by fire
**Poly budget:** 200,000-500,000 tris (per VQS lock — hero
character)
**Texture:** 4096² diffuse + 4096² normal + 2048² packed
**Material:** PBR with subsurface (skin), fabric for clothing
**Pose:** sitting on log, looking into flames, calm
**Animation:** subtle breathing, occasional head turn toward fire
**Interaction:** outline glow, clickable, opens "Contact Us" form

**What needs your decision:**
- [ ] Style: realistic human, stylized (per GTA IV-era reference
      but upgraded to photoreal tier per VQS), cartoon, abstract?
- [ ] Gender presentation: male, female, androgynous, or faceless
      (per brand rule "faceless elite")?
- [ ] Clothing: expedition/outdoor gear, casual, formal, or
      robe-like?
- [ ] Pose: sitting forward (engaged with fire), reclining
      (relaxed), or cross-legged?
- [ ] Facial details: visible face, partially shadowed face, or
      silhouetted (back to camera)?
- [ ] Animation level: subtle idle only, or more (shifts position,
      adds wood to fire, looks up)?

**My recommendation:**
- Stylized realism (matches VQS tier, not photoreal human — that
  would be uncanny)
- ANDROGYNOUS / partially obscured (firelight from side, slight
  back-of-head angle — face not fully visible, matches "faceless
  brand" rule)
- Casual expedition wear (jacket, sturdy pants, boots)
- Sitting forward, looking into flames, calm
- Subtle breathing animation, occasional shift of gaze
- NO scale animation on hover (per brand rule)

---

### Item 20 — Log (Yeri sits on it)

**Status:** 🔓 NEEDS LOCK

**Position:** Act 4 clearing, in front of fire, frog sits at one
end, Yeri at other end
**Poly budget:** 5,000-15,000 tris
**Texture:** 2048² bark + moss
**Material:** PBR with heavy moss, weathered, wet sheen

**What needs your decision:**
- [ ] Log orientation: horizontal (Yeri sitting on top), or angled
      (casual lean)?
- [ ] Length: ~2m, ~3m, or longer?
- [ ] Moss coverage: heavy (matches forest) or light (sitting
      surface cleared)?

**My recommendation:**
- Horizontal, comfortable sitting orientation
- ~3m long (room for Yeri + frog + slight extra)
- Heavy moss on sides, slight cleared area on top where Yeri
  sits (footprints in moss?)

---

### Items 21-24 — Atmosphere & FX

**Status:** ✅ LOCKED (per VQS lock + architecture lock)

- Volumetric fog: ✅ VQS Decision D
- God-rays: ✅ VQS Decision E
- Fireflies particle system: ✅ Architecture lock (item 11)
- Post-processing chain: ✅ VQS Decision E

---

## WHAT I NEED FROM YOU

The above is 20 items. **9 are locked** (1, 11, 16 behavior,
21-24). **11 need visual decisions** (2, 3, 4, 5, 6, 7, 8, 9, 10,
12, 13, 14, 15, 16 visual, 17, 18, 19, 20).

That's a lot. Let me prioritize:

**HIGHEST priority** (these define the world):
- Item 3 (sky + moon) — affects every frame
- Item 6 (trees) — the forest IS the world
- Item 16 (frog) — the guide character
- Item 18 (campfire) — Act 4 hero, primary clickable
- Item 19 (Yeri) — Act 4 hero, primary clickable

**MEDIUM priority** (these affect the atmosphere):
- Item 4 (ground)
- Item 5 (path)
- Item 17 (tent)
- Item 20 (log)

**LOWER priority** (these are decoration):
- Item 7 (moss)
- Item 8 (ferns)
- Item 9 (logs)
- Item 10 (rocks)
- Item 12 (mushrooms)
- Item 13 (stones/gems)
- Item 14 (plants)
- Item 15 (symbols/water)

**My recommendation:** lock the 5 HIGHEST first, then the 4
MEDIUM, then the 8 LOWER. We don't need to lock every decoration
to perfection — we can use my recommendations as defaults and
adjust if anything feels wrong.

**Answer my "what needs your decision" questions for the 5
HIGHEST items, and we lock them. Then move to MEDIUM. Then
LOWER. Or just say "use your recommendations for everything
except X" and we lock with that.**

**Still no code.** Just decisions, locked in writing.
