---
status: locked
locked-at: 2026-06-19
user-confirmed: true
block: 40-assets-and-yoni-spec
---

# 40 — Assets + Yeri Spec (Lock Log)

> **Purpose:** Lock the actual asset inventory, poly counts, Yeri
> character appearance, frog appearance, tree appearance, and moon.
> **Source:** user-provided images + GLB inspection 2026-06-19
> **Status:** ✅ LOCKED with one open decision (poly-tier trade-off)

---

## USER STATEMENT (verbatim, 2026-06-19)

> *"so the moon will be like the reference image full moon on top with
> no clouds full sky with stars the full power off nature i have a
> reference off the character and a build with a rig for yeri so he
> can sit there breathing and sometimes coughing moving like a real
> person because the person is me but hidden like he is real but he
> isnt i work anonymously no one knows im the character the builder
> behind everything, yes banyak kapok mix it will be more open at
> the start and it leads into a closed forest so it gets dense and
> lit up by some mushrooms gems and fireflies realistic frog with a
> little outline glow its in act 4 you can finally click its a
> typical campfire with stones around in a circle with tipi stacked
> small logs"*

**Translation (key points):**
- Moon = full moon, top of frame, no clouds, full starry sky,
  "full power of nature"
- Yeri = user himself, hidden as character, real-looking but
  anonymous, must animate (breathing, occasional cough, "real
  person" movement)
- Trees = banyan + kapok mix
- Forest progression: open at start → leads into closed dense forest
  → lit by mushrooms/gems/fireflies
- Frog = REALISTIC (not stylized), small outline glow (subtle
  visible edge), clickable in Act 4
- Campfire = typical campfire: stones in circle, teepee-stacked
  small logs

---

## REFERENCE IMAGES — LOCKED SOURCES

Saved to `_decisions/_refs/`:

1. **Yeri character reference** (3 images):
   - `ChatGPT_Image_Jun_11,_2026,_07_54_58_PM_1.png` — real photo of
     Yeri (the user)
   - `Gemini_Generated_Image_b9vlqub9vlqub9vl.png` — character render,
     A-pose front view, transparent background
   - `Gemini_Generated_Image_vnl17svnl17svnl1.png` — NANO BANANA
     Character Reference Sheet: front, side, back views

2. **Sony CRT PVM reference**: `crt_.jpeg`

3. **Jungle/scene references** (4 images):
   - `b16c775f0083b0f133355454f25df3e3.jpg` — mossy stone arch
   - `36bd8d2569bb8835d589f1d1919e7916.jpg` — jungle temple
   - `9fcce3dfc0738e55c95666ece58a0f08.jpg` — moss canyon path
   - `e6bc323d9dad8f84a55487e6f0bf4133.jpg` — moonlit forest path
     (the brightness target)

---

## YERI CHARACTER SPEC — LOCKED

**Identity:** the user (Danny/Yeray) himself, anonymized as a
character. "He is real but he isn't" — no one knows the operator
behind it.

**Physical appearance (per reference images):**
- Male, ~early-mid 20s appearance
- Build: medium, slim
- Hair: shoulder-length, dark, slightly wavy
- Facial hair: light mustache + chin-strap/goatee
- Expression: contemplative, calm, slightly brooding

**Outfit (per reference images, MUST match):**
- Black baseball cap with white STAR logo (Converse-style 5-point
  star, slightly off-center)
- Oversized gray hoodie (heather gray, drawstrings visible, with
  cross/keys pendant on chain)
- White t-shirt underneath (visible at hem)
- Olive-green / dark khaki cargo pants (with side pockets, slight
  distressing, keychain hanging from belt loop — 2 keys)
- Dark boots (timberland-style, work boot, slight wear)
- Accessories: silver bracelet on left wrist, ring on right hand
- Cross/keys pendant on chain around neck

**Pose in Act 4:**
- Sitting on log by fire
- Facing the fire (slightly angled toward camera, not directly
  facing)
- Body language: relaxed, contemplative, "been waiting"
- Hands: resting on knees or in hoodie pocket (decided by animation)

**Animation requirements:**
- **Breathing**: continuous idle breathing (chest rise/fall ~16
  breaths/min, subtle)
- **Occasional cough**: every 30-90 seconds, realistic cough
  animation (chest compress, head tilt forward, slight body shake)
- **Head turns**: occasional subtle head turn toward fire, then
  back, like a real person watching flames
- **Micro-shifts**: occasional weight shift on log, hand move,
  shoulder settle
- **Eyes blink**: ~15-20 blinks/min (realistic rate)
- **Hair physics**: subtle movement with head turns (if budget
  allows)

**Poly count:**
- Existing `yeri.glb` is 159k verts (~80k tris) — below VQS locked
  200-500k tris
- Two options (see OPEN DECISION below):
  - A) Ship at 80k tris, accept lower quality tier
  - B) Retopologize up to 250-350k tris + bake detail textures

---

## YERI GLB ASSETS — INVENTORY

| File | Size | Verts | Detail | Status |
|---|---|---|---|---|
| `char__yeri__v01.glb` | 272KB | 3,976 | Early prototype, 1 skin | Archive only |
| `char__yeri-skeleton__v01.glb` | 188KB | 4,866 | Skeleton only | Use for rig |
| `yeri.glb` (new upload) | 12.7MB | 158,876 | High-detail, 25 joints, no textures | **Primary** |
| `yeri_skeleton.glb` (new upload) | 188KB | 4,866 | Skeleton only | Use for rig |

**Primary asset: `yeri.glb`** — 12.7MB GLB with 159k verts, 25-joint
skeleton, no textures, no baked animations.

**What's needed before Yeri renders correctly in the world:**
1. **Textures**: skin (face, hands, neck), hair (with alpha),
   hoodie (with fabric weave + drawstrings + logo), pants (with
   weathering + keychain), boots (with wear), cap (with star
   logo)
2. **Material setup**: PBR per the locked VQS — baseColor + normal
   + roughness + metalness + subsurface (skin) + sheen (hoodie
   fabric)
3. **Animations**: breathing loop, idle loop, cough animation,
   head turn, blink, weight shift (all to be authored in Blender
   or sourced from Mixamo)
4. **Poly decision**: 80k tris (use as-is) vs 250-350k tris
   (retopologize) — see OPEN DECISION

---

## FROG SPEC — LOCKED

**Realism tier:** realistic (not stylized), per user direction
"realistic frog with a little outline glow"

**Appearance:**
- Realistic swamp frog: green-brown coloration, mottled skin
  texture, waxy sheen
- Slight bioluminescent glow (subtle, cyan-green tint, integrated
  with skin)
- Small outline glow effect when in Act 4 (subtle edge highlight,
  not the brighter hotspot outline glow)

**Behavior (per architecture lock):**
- Acts 1-3: guide character, teleporting ahead of camera
- Act 4: settles on log next to Yeri, clickable
- Throughout: emits subtle cyan glow, makes sound (croaks/chirps)

**Poly count:**
- Existing `char__frog__v02.glb` is 11.5k verts (~5.7k tris) — way
  below VQS locked 30-50k tris
- Realistic frog tier typically needs 30-80k tris
- Options: A) use as-is, B) retopologize up

---

## TREE SPEC — LOCKED

**Species mix:** banyan + kapok (per user direction)

**Progression through the experience:**
- **Act 3 entry (open)**: more open canopy, scattered trees,
  bigger spacing
- **Act 3 mid (transitioning)**: canopy closing in, trees denser
- **Act 3 deep (closed forest)**: dense, overlapping canopies,
  shadow-heavy, lit by mushrooms/gems/fireflies
- **Act 4 (clearing)**: trees frame the clearing, not blocking sky
  (canopy opens to show moon)

**Existing tree assets (5 versions, ~500KB each):**
- `tree__v01.glb`: 4,538 verts (2,269 tris) — branches + leaves
- `tree__v02.glb`: 3,845 verts
- `tree__v03.glb`: 3,857 verts
- `tree__v04.glb`: 4,353 verts
- `tree__v05.glb`: 3,882 verts

**Poly count: ~2-3k tris per tree** — way below VQS locked 80-150k
tris for hero trees, 30-80k for mid, 5-15k for background. **Will
need to either retopologize or accept lower tier.**

**Visual:** existing trees have branches + leaves materials with
4 textures each (probably diffuse, normal, roughness, etc.). The
visual quality is "stylized mid-poly" not "photoreal high-poly."

---

## MOON + SKY SPEC — LOCKED

**Moon:**
- **Phase**: FULL (per user direction, not gibbous)
- **Position**: top of frame, upper-center (per user reference
  style — like the moonlit forest image)
- **Size**: large enough to be a focal point, but not dominating
  (~5-8% of viewport height)
- **Color**: warm pale yellow-white (`#F5EDD8` core)
- **Halo**: warm amber-brown (`#A89870`) glow around it
- **Crater detail**: visible (using NASA public domain crater
  texture OR procedural shader)

**Sky:**
- **NO clouds** (per user direction)
- **Full starry sky** — visible stars throughout, varying sizes
  and brightness
- **Gradient**: deep blue-black at zenith (`#0A0F12`), warmer
  brown-black near horizon (`#2A2818` — matches reference mist)
- **Atmosphere**: subtle haze near horizon, clear above
- **Stars**: ~200-500 visible, procedural placement, varied
  brightness (some bright, mostly faint)

**Mood:** "full power of nature" — vast, awe-inspiring, the kind
of sky that makes you feel small. The moon is the protagonist of
the sky.

**Poly count:** skydome = 1,000 tris (low-poly sphere), moon =
8,000-15,000 tris (high-detail sphere with crater displacement)

---

## CAMPFIRE SPEC — LOCKED

**Style:** "typical campfire with stones around in a circle with
tipi stacked small logs"

**Components:**
1. **Stone ring** — 8-12 stones arranged in circle, varying sizes
   (15-30cm), irregular spacing, natural look
2. **Logs** — teepee/tipi stacked: 6-10 small logs leaning against
   each other, meeting at top
3. **Kindling** — small twigs/sticks at base, visible between logs
4. **Embers** — glowing red-orange pieces at base of logs
5. **Flames** — main fire above kindling, 30-60cm tall, dynamic
6. **Sparks** — rising particles, slowly drifting up and out
7. **Smoke** — subtle smoke wisp rising from flames (volumetric or
   billboard)

**Materials:**
- Stones: rough texture, dark grey with subtle highlights
- Logs: charred black outside, glowing red-orange interior
- Flames: emissive shader (animated noise) in amber-orange gradient
- Sparks: glowing point particles
- Smoke: transparent gray-white particles

**Light:**
- PointLight at center of fire, `#FFB84D` warm amber
- Intensity 5-8 (per VQS)
- Distance 8-12
- Casts shadows (1024² shadow map)
- Flickers subtly (intensity varies ±5% over time)

**Poly count:** ~15,000-30,000 tris (stones + logs + flames as
geometry; embers/sparks/smoke as particles)

---

## ASSET POLY-COUNT DECISION — ⚠️ OPEN

**The conflict:**

| Asset | VQS locked tier | Existing asset | Gap |
|---|---|---|---|
| Yeri character | 200k-500k tris | 80k tris | -60% to -84% |
| Hero tree | 80k-150k tris | 2-3k tris | -97% to -98% |
| Mid tree | 30k-80k tris | 2-3k tris | -92% to -96% |
| Frog | 30-50k tris | 5.7k tris | -81% to -89% |

**The VQS locked "photoreal / immersive" tier requires high-poly
assets. The existing assets are at the OLD "stylized mid-poly"
tier from before the VQS lock was reversed.**

**Three paths forward:**

### Path A — Ship at existing poly counts (FASTEST)
- Use existing assets as-is
- Accept lower visual fidelity than VQS locked tier
- Quality will be "stylized mid-poly" not "photoreal"
- Time to ship: 1-2 weeks
- Worth: maybe €2-5k, not €10k+

### Path B — Retopologize existing assets up (MIDDLE)
- Take existing Yeri (80k tris) and add detail meshes for face,
  hands, fabric folds, hair — bring total to 250-350k tris
- Take trees (2-3k) and add leaf detail, bark variation — bring to
  60-100k tris
- Bake normal maps from high-poly sources OR hand-paint
- Time: 3-4 weeks
- Worth: €8-12k — matches VQS lock

### Path C — Source new photoreal assets (BEST, SLOWEST)
- Source from Sketchfab CC0 / Quaternius / Kenney / custom
  photogrammetry
- Hand-paint all PBR textures
- Time: 6-8 weeks
- Worth: €15k+

**My recommendation: Path B for the main 3-4 hero assets (Yeri,
frog, 1-2 hero trees), Path A for everything else (background
trees, props, decorations).**

This gives you:
- Hero assets at photoreal tier (where the camera spends time)
- Background at mid-tier (where it doesn't matter as much)
- 3-4 week timeline
- €10k+ worth

**Which path? A, B, or C? Or "A for now, retopologize later"?**

---

## IMPLICATIONS FOR EXISTING CODE

The current `src/scenes/Act1Gate.tsx`, `Act2Drift.tsx`,
`Act4Clearing.tsx`, and `r3f/Frog.tsx` are based on the OLD
architecture (5 separate scenes). Per architecture lock, these will
be REPLACED with the new structure:

```
src/
├── loading/      ← Phase A: CRT + loading (refactor from Act1Gate)
├── transition/   ← Phase B: fall cinematic (new)
├── world/        ← single persistent world (NEW — replaces scenes/)
├── hud/          ← Phase C/D: scroll text + hotspot panels
└── shared/       ← palette, fonts, animations
```

The existing `Frog.tsx` can be MOVED into `world/characters/` with
minimal changes (just remove the rotation behavior — in the world,
frog doesn't constantly rotate, it guides).

The existing `char__frog__v02.glb` and `yeri.glb` can be USED
immediately (Path A or B depending on your decision).

The existing `tree__v01-v05.glb` can be USED immediately as
mid/background trees.

---

## NEXT STEP

1. **Confirm asset path: A, B, or C** (or hybrid)
2. Lock the brain file update with the new tier
3. Refactor the folder structure (rename scenes/ to loading/
   transition/, create world/, hud/, shared/)
4. Update the Frog component for new behavior
5. Start world skeleton build (one tree + ground + sky + moon)
6. Screenshot, react, iterate

**Still no code until path is chosen.** Path decides everything.
