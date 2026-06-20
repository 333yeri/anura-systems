# 00 — ACTS Script (Verbatim Transcript + Architecture Lock)

> **Source:** `00_script.pdf` (single page, image-only, 1759×2273 px)
> **Created:** 2026-06-19
> **Last updated:** 2026-06-19 (architecture clarification)
> **Status:** CANONICAL for blocks 1-4. Block 5 PRESERVED but
> SUPERSEDED by `_decisions/10_vqs_lock_log.md`.
> **Architecture lock:** see `_decisions/20_architecture.md` — the
> "acts" are named camera waypoints along ONE scroll-driven path
> through ONE world, not separate scenes.

---

## VISUAL DESIGN (for reference, not decisions)

- **Background:** pure black (#000000)
- **Text:** white
- **Headers (e.g. "ACT 1 — THE GATE", etc.):** bold, white
- **Field labels inside paragraphs (italicized):** see highlights
- **Highlighted words (pink/magenta):** `(#000000)`, `copy///`,
  `Environment during fall:`, `Camera behavior:`, `First text
  trigger:`, `The turn:`, `In the clearing, left to right:`,
  `Dark red tent`, `Campfire`, `Yeri`, `Text triggers:`,
  `"IF YOU ARE WORTHY OF OUR PROCESS"`
- **Layout:** 5 vertical blocks, single column, no images/charts/

---

## BLOCK 1 — ACT 1

> **ACT 1 — THE GATE (Loading Screen)** *Camera:* Static. Fullscreen
> 2D overlay. No 3D scene yet. *Scene:* Pure black void (#000000). A
> CRT monitor centered in frame — bulky 1980s TV set, dark grey
> housing, rounded edges, floating in nothing. *CRT Screen content:*
> - Thick chunky loading bar (pixel-art style, visible segments)
> - Above the bar: 3D frog rotating slowly in space — stylized,
>   green-brown swamp colors, subtle breathing animation
> - Below the bar: terminal text types out line by line:
>
> **copy///**
> > INITIALIZING ANURA SYSTEMS…
> > BIOSENSORS ONLINE…
> > SWAMP_VOLUME DETECTED…
> > LANDING SEQUENCE ARMED…
> > GATE OPEN
>
> - Percentage counter (tabular nums, monospace)
>
> *Loading behavior:* ~7 seconds. Glitchy/uneven — fast to 34%,
> pause, crawl to 42%, burst to 75%, freeze at 88%, final push to
> 100%. *At 100%:* The CRT screen brightens. The image on the screen
> starts to stretch and warp — the screen is pulling us IN. The
> edges of the CRT bend outward like a tunnel. We're being sucked
> into the monitor. *Transition:* The CRT screen fills our entire
> view. For a brief moment we're inside the low-res CRT image — then
> the image sharpens, resolution climbs, and we emerge into the 3D
> world. The quality jump is dramatic: from fuzzy CRT phosphor to a
> rich, detailed 3D environment. Like going from a 1998 PS1 cutscene
> into a 2007 GTA IV game. *Audio:* CRT power-on hum. Coil whine.
> Relay click. Then a deep bass drop as we're pulled through the
> screen. —

**⚠️ Architecture correction (2026-06-19):** the "1980s TV set, dark
grey housing" in this block was later specified as a "gray Sony CRT
TV" — see architecture lock for the new spec. The "dark grey" is
contradicted by the user's later Sony reference.

---

## BLOCK 2 — ACT 2

> **ACT 2 — THE FALL** *Camera:* Follows frog from above →
> transitions to first-person falling. *Scene:* We emerge from the
> CRT into the sky. Heavy mist/clouds. Dark blue-grey atmosphere.
> No ground visible yet. *The frog:* Tumbling through the air,
> limbs flailing. Same 3D frog from loading screen. *Camera
> behavior:* Third-person (behind and above) → transitions to
> first-person. We fall together with the frog below us.
> **Environment during fall:**
> - Thick mist layers we punch through
> - Sound: falling flute tone — air rushing, soft melodic wind
> - Occasional glimpses of canopy far below — and through the mist,
>   far below, a warm amber glow. That's the campfire. That's where
>   we're going.
>
> *Landing:* Frog lands first — splash in mud. Camera lands just
> after — soft thud, stabilizes at ground level. *Transition:* We're
> in the forest. Act 3 begins. —

**⚠️ Architecture correction (2026-06-19):** This entire fall is
AUTOPLAY (cinematic, scroll-locked). User does NOT scroll to fall —
they watch it. Scroll only takes over after landing.

---

## BLOCK 3 — ACT 3

> **ACT 3 — THE SWAMP DRIFT** *Camera:* First-person. Ground level.
> Slow smooth drift, like floating. *Scene:* A dark green forest.
> Not dead — alive. Lush. Dark green leaves, moss-covered trunks,
> ferns, vines. The forest floor is moist mud with patches of grass
> and small puddles. But it's on the verge of creepy — the trees
> are slightly too dense, the mist is thick, the shadows move in
> peripheral vision. You feel watched but not threatened. It's
> alive and it knows you're here. *Lighting:* Dim. Shafts of pale
> moonlight cut through gaps in the canopy. Bioluminescent hints
> — faint green/blue glows on mushrooms, moss, fireflies. The
> forest has its own subtle light. *In the distance, ahead:* A warm
> amber glow. Flickering. The campfire from Act 4. It's visible
> through the trees — a beacon. That's where we're drifting toward.
> The glow gets slowly brighter as we move forward. *The frog:*
> Right in front of us. Shakes off landing, looks around, spots the
> glow ahead, starts hopping toward it. *Camera behavior:* Follows
> frog automatically along a narrow muddy trail. Smooth, not
> jarring. The frog is leading us to the light. *The path:*
> - Narrow muddy trail winding through dense green trees
> - Puddles reflecting the dim sky and the distant amber glow
> - Fallen logs covered in moss, rocks with lichen, tufts of ferns
> - Mist parts as we move — it's thick but not impenetrable
> - Occasional fireflies drifting past the camera
> - The amber glow ahead gets progressively brighter (1/2)
>
> **First text trigger:** As we begin drifting, text fades in
> smoothly — lower third of screen, elegant, minimal. Appears word
> by word as we move forward. First piece of copy about what ANURA
> does. *The turn:* Path curves right → fast sharp left turn →
> camera swings around corner → trees part — the amber light floods
> in — we see the clearing ahead. *Transition:* We enter the
> clearing. Act 4 begins. —

**⚠️ Architecture correction (2026-06-19):** This is the
SCROLL-DRIVEN phase (user controls scroll, not autoplay). User
scrolls FORWARD only — no backward scroll to earlier acts.
Clickable hotspots (outline glow) are present along the path —
parallel discoveries, do not advance scroll.

---

## BLOCK 4 — ACT 4

> **ACT 4 — THE CLEARING (Sanctuary)** *Camera:* First-person. Slow
> orbit/pan entering the clearing. *Scene:* A small forest clearing.
> The same dark green forest surrounds it but here the canopy opens
> up. Flat mud with grass patches. The creepy tension of Act 3
> melts away — this is the sanctuary. *In the clearing, left to
> right:*
> 1. **Dark red tent** — weathered camping tent, maroon fabric,
>    open flap, cozy sleeping bag inside, warm amber light spilling
>    out
> 2. **Campfire** — center, crackling, amber/orange light casting
>    dynamic shadows on surrounding trees, sparks drifting up,
>    primary light source, the glow we saw from Act 3
> 3. **Yeri** — 3D character sitting on a log by the fire.
>    Stylized, not hyper-realistic. GTA IV-era quality — ~30,000
>    polygons per character, detailed enough to feel real, not
>    modern PBR. Looking into the flames. Firelight illuminating
>    face. Calm. Been waiting.
>
> *The frog:* Hops past screen right to left, casual, disappears
> into trees. Job done. *Sky:* Through the canopy gap — dark night
> sky, deep blue-black, scattered stars, large gibbous moon casting
> soft silver light mixing with the fire's amber glow. *Atmosphere:*
> Warmth. Safety. The forest is still dark and alive around us but
> here, in this circle of firelight, you're okay. *Text triggers:*
> More text appears as camera pans — tent, fire, Yeri. Each piece
> fades in smooth, movement-triggered. Copy about ANURA's
> positioning, philosophy, what they build. *The CTA:* Above the
> campfire, floating gently — appears after a moment:
> **"IF YOU ARE WORTHY OF OUR PROCESS"**
> Pulses gently. Click triggers Application Gate. *Mood:* Arrival.
> You've made it. This is the heart. —

**⚠️ Architecture correction (2026-06-19):** This is the MAIN PAGE
of the site. Three primary clickables with locked mapping (see
`_decisions/20_architecture.md`):
- **Campfire** → "Why Anura" panel
- **Yeri** → "Contact Us" panel/form
- **Tent** → "Home / How We Work" panel
- **Floating CTA "IF YOU ARE WORTHY OF OUR PROCESS"** → Application form
- **Frog + secondary items** → micro-copy / easter eggs

The "GTA IV-era quality — ~30,000 polygons per character" reference
is SUPERSEDED by Block 10 (Visual Quality Standard locked at
photoreal tier, 200k-500k tris per character).

---

## BLOCK 5 — VISUAL QUALITY STANDARD (CONTRADICTED, SUPERSEDED)

> ⚠️ **2026-06-19 — Block 5 of the original PDF was a contradiction.**
> The user reversed its direction (2026-06-19):
> *"i realize that i dont want it to look like a old game i want the
> most immersion so remove anything that has to do with games as
> high quality as possible"*
>
> Block 5 is preserved below for reference but is **NOT canonical**.
> The actual Visual Quality Standard is derived from user-provided
> reference images and is locked at `_decisions/10_vqs_lock_log.md`.

> **Original Block 5 text (preserved, not canonical):**
> **VISUAL QUALITY STANDARD (applies to all 3D acts):** older counter
> strike game era. ~30,000 polygons per character. Not hyper-modern
> PBR. Not photorealistic. But modern enough to feel immersive and
> real. Think: detailed textures, good lighting, real-time shadows,
> ambient occlusion — but with a slightly stylized edge. Not
> CS:Source. Not PS1. That sweet spot of 2007-2010 3D games where it
> looked "next gen" but still had character. —

---

## WORD COUNT CHECK

- Act 1: ~230 words
- Act 2: ~140 words
- Act 3: ~340 words
- Act 4: ~330 words
- Visual Quality Standard (superseded): ~80 words
- Total: ~1,120 words

---

## LOCK STATE — 2026-06-19

| Item | Status | Lock location |
|---|---|---|
| Block 1 (Act 1 — Gate) | Locked (script text); implementation details pending | `_decisions/30_world_contents.md` (next) |
| Block 2 (Act 2 — Fall) | Locked (script text); implementation details pending | `_decisions/30_world_contents.md` |
| Block 3 (Act 3 — Swamp Drift) | Locked (script text); implementation details pending | `_decisions/30_world_contents.md` |
| Block 4 (Act 4 — Clearing) | Locked (script text); click mapping locked | `_decisions/20_architecture.md` |
| Block 5 (VQS) | SUPERSEDED | `_decisions/10_vqs_lock_log.md` |
| Architecture (single world, scroll-driven) | ✅ LOCKED | `_decisions/20_architecture.md` |
| Visual Quality Standard (tier) | ✅ LOCKED | `_decisions/10_vqs_lock_log.md` |

---

## NEXT STEP

Block 5 ✅ locked (superseded to image-derived standard)
Block 20 ✅ locked (architecture: one world, scroll-driven)

**Next decision block:** **Block 30 — World Contents** — what
geometry exists in the world (frog, trees, tent, campfire, Yeri,
path), where it's positioned, what it looks like at the locked
quality tier. This is pure decisions — no code yet.

After Block 30:
- Block 40 — Scroll path (camera keyframes, timing, easing)
- Block 50 — HUD/copy (every word, when, where)
- Block 60 — Audio (every sound, when)
- Block 70 — Hotspots (every clickable, what it opens)

---

## ONE MORE CONFIRMATION NEEDED (Sony CRT TV)

User said: *"the gray sony crt tv"*

**Question:** Is this a specific Sony model (Trinitron PVM,
Watchman, etc.) or just "any old Sony CRT TV"?

If you have a specific reference image of the Sony CRT you have
in mind, send it. Otherwise I'll default to **Sony Trinitron PVM
(broadcast monitor style)** — gray housing, slightly squared,
distinctive bezel.

**Confirm Sony model or send reference, and we move to Block 30.**
