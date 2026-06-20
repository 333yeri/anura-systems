---
status: locked
locked-at: 2026-06-19
user-confirmed: true
---

# 41 — User Corrections (2026-06-19 evening)

> **Purpose:** Lock the user's asset decisions and corrections
> from the evening session.

---

## USER STATEMENT (verbatim, 2026-06-19)

> *"the yeri character i gave is good i made it with nano banana and
> my own picture then put it into a 3d creator the forg i dont trust
> i havent seen it so lets not do that and the trees should be fine
> to but need different scales and different trees and more variation
> needs to be rainforest dense for a little bit until it opens up on
> act 4 what is retopologize"*

---

## LOCKED DECISIONS

### ✅ Decision 1 — Yeri character (LOCKED, USE AS-IS)

**User:** *"the yeri character i gave is good i made it with nano
banana and my own picture then put it into a 3d creator"*

**Translation:**
- Yeri = built from user's own photo + Nano Banana AI + 3D creator
  pipeline
- The user has high trust in this asset (made it himself)
- USE THE PROVIDED YERI ASSET (`yeri.glb`, 12.7MB, 159k verts)
- Poly tier: 80k tris is acceptable for Yeri (user trusts the asset
  as-is, not pushing for higher poly)
- Decision: **Path A for Yeri** — use as-is, no retopology
- Future work: add textures (skin, hair, hoodie, pants, boots,
  cap) — but no poly increase

**Implication for Yeri pipeline:**
- Take `yeri.glb` (159k verts, rigged with 25 joints)
- Author PBR materials matching reference (skin, hair, hoodie,
  cargo pants, boots, cap)
- Add animations (breathing, cough, head turn, blink, micro-shifts)
- Bake detail normal maps from the reference photos
- Ship at 80k tris — not photoreal human tier, but stylized
  realism tier (matches user's "real but anonymous" intent)

---

### ✅ Decision 2 — Frog (LOCKED, DO NOT USE EXISTING)

**User:** *"the forg i dont trust i havent seen it so lets not do
that"*

**Translation:**
- User has NOT seen the existing frog GLB
- User does not trust the existing frog asset (built by someone
  else / unclear provenance)
- User wants NO pre-existing frog — must build or source fresh

**Action: REMOVE existing frog GLBs from active use.**
- `char__frog__v01.glb` — moved to `/_archive/`
- `char__frog__v02.glb` — moved to `/_archive/`
- The `Frog.tsx` component must be replaced (not refactored — new
  frog, new component)

**Source path for new frog (LOCKED):**
- **Option 1**: Hand-sculpt in Blender from scratch (5-10k tris
  stylized realistic frog, matching user's "realistic frog with
  a little outline glow" direction)
- **Option 2**: Source from CC0 frog model (Quaternius doesn't have
  realistic frogs, but Sketchfab CC0 / Free3D / TurboSquid has some)
- **Option 3**: Generate with Tripo3D / Meshy / Rodin from a text
  prompt, then refine

**My recommendation: Option 1 (hand-sculpt in Blender).** Reasons:
- Total control over the realistic look + cyan glow + outline glow
- Matches the user's "realistic frog with a little outline glow"
  exactly
- 5-10k tris is achievable in 1-2 days of sculpting
- Subtle cyan bioluminescence can be painted into the texture or
  added as emissive map
- No licensing uncertainty

**Poly target for new frog: 8,000-15,000 tris** (slightly above
existing v02's 5.7k, with cleaner topology + proper PBR textures
+ emissive glow).

**User must confirm:**
- [ ] Option 1 (hand-sculpt) — recommended
- [ ] Option 2 (source from CC0) — faster but uncertain quality
- [ ] Option 3 (AI-generate) — fastest but lowest quality
- [ ] Or: "use my reference image of a frog" (send it if so)

---

### ✅ Decision 3 — Trees (LOCKED, USE EXISTING + VARIATION WORK)

**User:** *"the trees should be fine to but need different scales
and different trees and more variation needs to be rainforest dense
for a little bit until it opens up on act 4"*

**Translation:**
- Existing 5 tree GLBs (v01-v05) are acceptable
- Need variation: different SCALES (size), different SPECIES,
  different ORIENTATIONS
- Forest progression: **dense rainforest section** (somewhere in
  the journey) → **opens up in Act 4** (clearing)
- This adds a NEW beat to the experience: a dense section the user
  passes through, then emerges into the open clearing

**Implications for tree placement:**
- **Entry (Act 3 start)**: medium density, mixed sizes, banyan +
  kapok mix, more open canopy (per original direction)
- **Mid (Act 3 middle)**: **DENSE RAINFOREST SECTION** — trees
  close together, overlapping canopies, light blocked, lit by
  mushrooms/fireflies/gems
- **Late (Act 3 end)**: opening up, fewer trees, more sky visible
- **Act 4 (clearing)**: trees frame the clearing, NOT blocking sky
  (canopy opens above to show moon)

**Tree variation work needed:**
1. **Scale variation**: place trees at 0.7x, 1.0x, 1.3x, 1.6x of
   base scale (some smaller, some larger)
2. **Species variation**: use banyan-style (v01, v02?) for some,
   kapok-style (v03, v04?) for others, mix v05 as accent
3. **Rotation variation**: random Y rotation per instance
4. **Density variation**: density increases then decreases along
   path (matches "dense rainforest for a little bit" beat)
5. **Color variation**: subtle hue/saturation jitter on each
   instance (subtle, not garish)

**My recommendation for tree implementation:**
- Use `InstancedMesh` for performance (one draw call per tree
  species, 50-100 instances each)
- Random scale/rotation per instance
- Procedural placement along path with seeded RNG (consistent
  between sessions)
- Dense section: 1-2m spacing
- Open section: 4-6m spacing
- Clear at clearing: 8-12m spacing, framing only

**No retopology needed for trees** (existing poly tier is
acceptable given user's direction).

---

### ✅ Decision 4 — Asset path summary (LOCKED)

| Asset | Path | Action |
|---|---|---|
| Yeri | A — use as-is | Add textures + animations, no poly change |
| Frog | NEW — build/sculpt fresh | Hand-sculpt 8-15k tris realistic frog with glow |
| Trees | A — use existing | Add scale/rotation/species variation, no poly change |
| All others (props, environment) | A — use existing or build simple | Decorative, not hero assets |

**Time estimate:**
- Yeri: 3-5 days (textures + animations)
- Frog: 2-3 days (sculpt + texture + glow shader)
- Trees: 1-2 days (variation system + placement)
- World skeleton (sky, ground, path, lighting): 3-5 days
- Hotspot system + HUD: 3-5 days
- Scroll-driven camera: 2-3 days
- Polish + post-processing: 3-5 days
- **Total: 3-4 weeks** to Awwwards quality MVP

---

## RETOPOLOGY — EXPLAINED (LOCKED KNOWLEDGE)

The user asked "what is retopologize" — answer recorded for future
sessions:

**Retopology = rebuilding the triangle layout of an existing 3D
model so triangles are arranged better.**

**Why you'd do it:**
- Bad triangle layout = bad animation (elbows bend weirdly, faces
  deform)
- Too many triangles in flat areas = wasted performance
- Too few triangles in important areas (face, hands) = low quality
- Texture mapping breaks on bad topology

**How it works:**
1. You have an existing model (e.g., 80k tris Yeri)
2. You trace over it with NEW geometry, like wrapping a present
3. Same outer shape, cleaner triangle flow
4. Add detail where needed (face: 50k, hands: 30k, total: 250k+)

**Tools:**
- Blender (free, has auto-retopo)
- ZBrush (pro, industry standard)
- Instant Meshes (free, automated)
- Maya (pro)

**Time cost:** 1-2 weeks for hero assets

**For Anura:**
- Yeri: NOT retopologizing (user trusts the asset as-is)
- Frog: building from scratch (no retopology needed)
- Trees: NOT retopologizing (user accepts current tier)

So retopology is NOT in the build plan. Decision recorded.

---

## UPDATED ASSET PIPELINE

```
PHASE 1 — Textures + animations for Yeri (3-5 days)
  - Author PBR materials from reference photos
  - Skin: subsurface, varied tones
  - Hair: alpha-blended mesh + slight sway
  - Hoodie: fabric weave texture + sheen
  - Cargo pants: weathered + keychain detail
  - Boots: leather + slight wear
  - Cap: black fabric + star logo (procedural)
  - Bake normal maps from high-poly detail
  - Author animations: breathing, cough, head turn, blink, weight
    shift

PHASE 2 — Build new frog from scratch (2-3 days)
  - Sculpt realistic swamp frog in Blender
  - 8-15k tris, clean topology
  - PBR skin texture with subtle waxy sheen
  - Subsurface scattering (slight backlight glow)
  - Emissive cyan-green patches (back, eyes, spine)
  - Small outline glow shader for Act 4

PHASE 3 — Tree variation system (1-2 days)
  - InstancedMesh per tree species (5 instances)
  - Random scale 0.7-1.6x per instance
  - Random Y rotation per instance
  - Color/saturation jitter per instance
  - Procedural placement along path (seeded RNG)
  - Density gradient: open → dense rainforest → open → clearing

PHASE 4 — World skeleton (3-5 days)
  - Sky dome (procedural shader)
  - Moon (high-detail sphere with crater displacement)
  - Stars (procedural placement)
  - Ground (mud terrain with displacement)
  - Path (curved CatmullRomCurve3 strip)
  - Lighting (moon key + fill + fire light per VQS)
  - Volumetric fog
  - God-rays post-processing

PHASE 5 — Hotspot + HUD system (3-5 days)
  - Raycaster on clickable objects
  - Outline glow on hover (per architecture lock)
  - Click → open panel with copy
  - Scroll-driven copy fade-in
  - Application form panel

PHASE 6 — Scroll-driven camera (2-3 days)
  - CatmullRomCurve3 with 8-12 keyframes
  - Damped lerp follow
  - Cursor parallax (subtle yaw/pitch)
  - Phase machine: A (loading) → B (fall) → C/D (scroll)
  - Scroll-locked phases handled

PHASE 7 — Polish (3-5 days)
  - Post-processing chain (SSAO, bloom, god-rays, DoF, vignette,
    grain, color grade) per VQS
  - Audio (CRT hum, fireflies, frog croaks, ambient jungle,
    campfire crackle)
  - Performance tuning
  - Mobile LOD

TOTAL: 3-4 weeks to Awwwards quality MVP
```

---

## OPEN DECISIONS (one remaining)

**Frog source (decision 2 above):**
- [ ] Option 1 (hand-sculpt in Blender) — recommended
- [ ] Option 2 (source from CC0) — faster but uncertain
- [ ] Option 3 (AI-generate) — fastest but lowest quality
- [ ] Or: send reference image of frog

**One more clarification I need:**

**Tree "dense rainforest section" beat — how long is this section?**

The script doesn't specify. We need to decide:
- A) **Brief intense beat** (~10-20% of Act 3 scroll) — quick
  dense-forest moment before opening up
- B) **Sustained dense section** (~30-40% of Act 3 scroll) — long
  walk through dense jungle before opening
- C) **Most of Act 3 is dense** (~60-80% of Act 3) — the entire
  swamp drift is dense forest, opens only at the very end
- D) **Other**: specify the percentage / duration

**My recommendation: B (30-40% of Act 3).** Reasons:
- Long enough to feel like a journey through the dense forest
- Short enough that the "opening up" beat at the end feels earned
- Matches the script's pacing (multiple beats within Act 3)

Confirm frog source + dense rainforest duration, and we move to the
build.
