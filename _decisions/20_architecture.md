---
status: locked
locked-at: 2026-06-19
user-confirmed: true
block: architecture-foundation
replaces: nothing — this is the structural lock
---

# 20 — Architecture Lock (The World Is One)

> **Source:** User clarification 2026-06-19. Q1 + Q3.
> **Status:** ✅ LOCKED
> **Supersedes:** Any earlier assumption about "5 separate scenes" or
> "act transitions as separate states."

---

## USER STATEMENT (verbatim, 2026-06-19, paraphrased for clarity)

> *"only act 1 until act 3 is a cinematic movie and then they scroll
> further to move along the path after landing so you cant scroll back
> to act1 and 2. you can scroll from act 3 until 4 which be a small
> little journey thru the page (jungle) with some lighting coming
> from a far which will be act 4 but you only see a silhouete.
> lighting the last act is basically the main page where different
> items you can click and it will open a hud or window that has
> things for the clients to read for our agency. as an example when
> they click on the fire they click on our why, if they click on the
> yeri character they can contact us, if they click on our tent they
> click on our home and how we work etc. so act 1 is loading
> screeen that loads the world really quickly with a few words on
> whats loading on the gray sony crt tv and on the screeen will be
> a anura mascot and that is the 3d frog and after its loaded the
> camera moves into the screen and transitions into a fall into the
> world like they spawned and then they start the journey scrolling
> from that point until act 4 thats the page. the rest is a loading
> adventure. and during that scroll some other parts off the forest
> have an outline glow like they can click on it like they are
> scanning items. then they read all about us and then act 4."*

---

## ARCHITECTURE — LOCKED

### Single persistent world

```
ONE WORLD. ONE SCENE. ONE CAMERA. ONE SCROLL-DRIVEN TIMELINE.

The user does NOT navigate between "acts" — they scroll through ONE
continuous experience. The "acts" are NAMED WAYPOINTS along a single
scroll-driven camera path through ONE 3D world.

THE WORLD CONTAINS:
  - Frog (Anura mascot, present throughout)
  - Trees (forest)
  - Moss, ferns, rocks, fallen logs
  - Fireflies
  - Path (visible after landing)
  - Dark red tent (Act 4)
  - Campfire (Act 4)
  - Yeri character on log (Act 4)
  - Sony CRT TV (special — exists both as loading screen AND as
    diegetic object in world?)
```

### Scroll timeline (one direction, no backward)

```
SCROLL POSITION 0% — ACT 1: LOADING SCREEN (Sony CRT TV)
  - User lands on the page
  - They see a Sony CRT TV floating in pure black void
  - The TV is gray (not cream — see Block 30 lock for color)
  - Loading bar + a few lines of terminal text on the screen
  - The 3D frog (Anura mascot) is INSIDE the CRT screen, rotating
    slowly — this IS the mascot, this is what tells the user
    "this is Anura"
  - This phase loads the world in the background (assets stream in
    while the user sees the CRT)
  - Loading is FAST — a few seconds, not 7. The world loads in that
    time.
  - Camera position: static, in front of the CRT
  - User CANNOT scroll back from here — it's a one-way loading
    sequence
  - SCROLL LOCKED during this phase

SCROLL POSITION 0-25% — ACT 2: THE FALL (cinematic, autoplay)
  - At 100% load, the CRT screen warps — image stretches outward
  - The camera moves INTO the CRT screen
  - Inside the screen: brief CRT phosphor moment (low-res, scanlines)
  - Then quality ramps up dramatically — emerging into the 3D world
  - Camera is now FALLING through clouds/mist
  - Frog is tumbling beside/with us
  - Mist layers we punch through
  - Glimpses of canopy far below, with a warm amber glow (the
    campfire)
  - This entire fall is AUTOPLAY (cinematic), not scroll-driven
  - Ends with: splash landing in mud, soft thud
  - SCROLL LOCKED during this phase (user just watches)

SCROLL POSITION 25% — LANDING MOMENT
  - Frog shakes off landing, looks around, spots distant glow
  - Frog starts hopping forward
  - Camera stabilizes at ground level, first-person
  - THIS IS WHERE USER TAKES CONTROL OF SCROLL

SCROLL POSITION 25-95% — ACT 3: THE SWAMP DRIFT (interactive scroll)
  - User can now scroll FORWARD to move along the path
  - Camera follows the muddy trail through the dense forest
  - Frog hops ahead of us, leading the way
  - Distant amber glow grows progressively brighter
  - Other items in the forest have OUTLINE GLOW (selectable
    hotspots) — like scanning items
  - User can click these at any scroll position — opens HUD/panel
    with copy about Anura (read all about us)
  - Items they might click: a glowing mushroom, an interesting rock
    formation, a firefly cluster, a hidden symbol, the frog itself
  - These clicks do NOT advance the scroll — they're parallel
    discoveries while traversing
  - Copy fades in word-by-word as scroll progresses (subtle, lower
    third, elegant)
  - Path curves right → fast sharp left turn → trees part → amber
    light floods in → reveal clearing ahead

SCROLL POSITION 95-100% — ACT 4: THE CLEARING (main page, interactive)
  - User arrives at the clearing
  - Camera does slow orbit / pan to reveal the scene
  - Three PRIMARY clickable elements (the "main page" of Anura):
    - **The Campfire** → click → opens HUD with "Why Anura" copy
    - **Yeri character** (on log by fire) → click → opens "Contact
      Us" form / panel
    - **The Tent** (dark red, with open flap) → click → opens "Home"
      and "How We Work" copy
  - Other secondary clickable elements (discoverable, scan-style):
    - The frog (now sitting near the fire, can be clicked for some
      easter egg / about-the-mascot)
    - Specific trees, rocks, mushrooms with their own micro-copy
  - Above the campfire: floating text "IF YOU ARE WORTHY OF OUR
    PROCESS" (pulses gently, clickable → application gate)
  - User can continue to scroll back and forth in this range to
    re-explore the clearing, click different items
  - This IS the page. The rest was the loading adventure.
```

### Critical implications

1. **ONE world, ONE scene, ONE camera.** No scene transitions. No
   separate `Act1Gate.tsx` / `Act2Drift.tsx` / `Act4Clearing.tsx`
   that mount/unmount different geometries. Everything exists in
   the world at all times — the camera's position + scroll progress
   determine what's visible.

2. **CRT TV is special.** It exists both as:
   - The **loading screen** (visible at scroll 0%, no other
     geometry loaded)
   - Potentially as a **diegetic object** in the world (visible in
     Act 4 clearing, like a TV sitting in the swamp — that's a
     separate decision, see below)

3. **"Act" names are milestones, not states.** The code does not
   branch on `if (act === 1)`. The camera position is a continuous
   function of scroll progress, and HUD elements fade in/out based
   on scroll position thresholds.

4. **Loading is a real loading.** The CRT phase loads world assets
   in the background. By the time the camera "enters" the screen,
   the world is fully loaded and the fall is smooth.

5. **The fall is autoplay, not scroll.** The user does NOT scroll
   to fall — they watch it. Scroll only takes over after landing.

6. **Scroll is locked backward.** The user can scroll forward but
   not back to a previous act. This is intentional — it's a
   journey, not a choose-your-own-adventure.

7. **Two kinds of interactivity in Act 3-4:**
   - **Scroll** — moves the camera along the path
   - **Click** — opens HUD/panels about specific items
   - **No scale animations** on hover (per brain rule)
   - **Outline glow only** on hover (per brain rule)

### Click interactions in Act 4 — locked mapping

| Click target | Opens panel with | Panel type |
|---|---|---|
| Campfire | "Why Anura" — agency philosophy, why we exist | Long-form copy + scrollable |
| Yeri character (on log) | "Contact Us" — form or contact info | Form overlay |
| Tent (dark red) | "Home" + "How We Work" — agency process, methodology | Long-form copy + scrollable |
| Frog (near fire) | "About the Mascot" / easter egg | Short copy, playful |
| "IF YOU ARE WORTHY OF OUR PROCESS" (floating above fire) | Application form | Full form overlay |
| Secondary items (Act 3 + Act 4) | Micro-copy about that specific element | Brief tooltip or short panel |

### Scroll-locked phases

```
### Frog as diegetic guide character (LOCKED)

**Status:** ✅ LOCKED 2026-06-19

The frog is NOT a static mascot. It is a **diegetic guide character**
the player follows through the forest. It exists in the world as a
semi-real presence — like a hallucination, a familiar, a guiding
spirit. Specifically:

```
THE FROG IS A HALLUCINATION / GUIDE / WARMTH-LOCATOR
  - The user does not "control" the frog
  - The frog appears just ahead of the camera (always visible,
    always moving forward)
  - The frog makes SOUNDS — croaks, calls, wing-beats, chirps
    (audio design pending Block 60) — that act as audio waypoints
  - The frog SOUNDS are how the user knows where to go in the
    jungle when they can't see clearly through mist/foliage
  - As the camera gets very close to the frog, the frog
    DISAPPEARS (teleports further ahead)
  - The frog reappears slightly further along the path
  - This cycle repeats — the frog is always "just ahead," never
    catchable, always pulling the user forward
  - The user feels: "what is going on? am I imagining this? is
    the frog real?" — this is intentional, creates wonder
  - When the user reaches Act 4 (the clearing), the frog FINALLY
    STOPS. It sits down on the log next to Yeri, calmly, as if
    it was always going to end up here. Job done.

VISUAL TREATMENT OF THE FROG
  - Slightly stylized (NOT photoreal) — like a guiding spirit
    should look slightly otherworldly
  - Green-brown swamp colors (per original script)
  - Subtle bioluminescent glow around it — emits faint cyan
    light, like a will-o'-the-wisp
  - This glow is what makes it visible in the dark forest
  - When the frog disappears, a brief "puff" of bioluminescent
    particles lingers in the air where it was — like it dissolved
  - The frog is NEVER directly lit by the moon — it generates
    its own faint cyan glow
  - When the frog is on the log in Act 4, the glow is dimmer
    (subtle presence, not navigation anymore)

INTERACTION
  - The frog can be CLICKED at any time during Act 3
  - Clicking the frog: opens a short panel "About the Mascot" /
    easter egg / playful copy (per architecture lock, secondary
    clickables)
  - The frog does NOT have outline glow during Act 3 (it's a
    guiding spirit, not a discoverable item — finding it should
    feel serendipitous)
  - In Act 4, the frog has subtle outline glow (now it's
    discoverable / interactable as a settled character)
```

### Fireflies as path lighting system (LOCKED)

**Status:** ✅ LOCKED 2026-06-19

Fireflies are not just ambient atmosphere. They **ARE the path
lighting system** — they light the way forward, like moving
streetlights along a forest trail.

```
FIREFLIES ARE THE PATH
  - Fireflies cluster along the muddy trail
  - They emit faint bioluminescent cyan-green light (#6FCFB8)
  - Density: 8-15 visible fireflies per camera frame during
    Act 3 (a moving constellation of light)
  - They drift slowly, never stationary
  - They form a VISIBLE PATH the eye can follow through the
    dense jungle
  - When the camera passes through a cluster, they briefly
    scatter, then re-form further down the path
  - In dense fog areas, the fireflies become more visible
    (their light cuts through mist)
  - The fireflies are LOWER and CLOSER to the ground than the
    canopy — they're at knee-to-eye height, lighting the path
  - Color: bioluminescent cyan-green (#6FCFB8), matches
    --biolume_cyan from the palette
  - Motion: very slow drift, organic, never perfectly straight
  - They make no sound (they're visual, not audio — the frog
    is audio, fireflies are visual)

INTERACTION
  - Individual firefly clusters can be CLICKED
  - Click opens a brief tooltip / micro-panel
  - Firefly clickable content: theme = "light / guidance /
    warmth / finding your way" — fits the brand metaphor
```

### Clickable discoveries along the path (LOCKED)

**Status:** ✅ LOCKED 2026-06-19

Glowing mushrooms, interesting stones/gems, and other
discoverable items are the **content delivery system** for the
brand. Each one is a micro-piece of "why work with Anura" copy,
discoverable during the journey, never blocking scroll progress.

```
CLICKABLE DISCOVERIES (parallel to scroll, never blocking)
  - Glowing mushrooms (bioluminescent, cyan-green)
  - Interesting stones / gems / rock formations
  - Unusual plants (oversized leaves, exotic flowers)
  - Hidden symbols or markings on trees
  - Water pools with reflective surfaces
  - Bird nests, animal bones (with copy about cycles, growth)
  - Each item has OUTLINE GLOW on hover (per architecture)
  - Click opens HUD/panel with that item's copy
  - Copy themes cycle through brand values:
    - Quality / craftsmanship ("we build like this")
    - Patience / time ("we take the long road")
    - Care / attention ("every detail intentional")
    - Process / methodology ("this is how we work")
    - Results / output ("what you get when you work with us")
  - At Act 4, three PRIMARY clickables with longer copy:
    - Campfire → "Why Anura" (full brand philosophy)
    - Yeri → "Contact Us" (form)
    - Tent → "Home / How We Work" (methodology)
  - All clicks are PARALLEL to scroll — they don't advance the
    camera position
  - User can read all panels, close them, continue scrolling
  - Panels stack (don't replace each other) so user can browse
    multiple discoveries
```

### Updated scroll phases

```
PHASE A: LOADING (scroll position 0%, scroll locked)
  - Sony PVM CRT visible (exact model from reference image)
  - Loading bar + terminal text
  - Frog visible inside CRT screen (rotating, NOT yet the
    guide — it's the loading mascot at this point)
  - World assets load in background

PHASE B: FALL (autoplay, scroll locked, ~5-8 seconds)
  - CRT screen warps — image stretches outward
  - Camera moves INTO the CRT screen
  - Brief CRT phosphor moment (low-res, scanlines, ~1 second)
  - Quality ramps up dramatically
  - Camera FALLS through clouds/mist
  - Frog is tumbling beside us (already in guide-character
    mode now — cyan glow visible)
  - Glimpses of canopy below, warm amber glow
  - Landing: splash in mud, soft thud

PHASE C: SCROLL EXPLORATION (scroll 25-95%, user controls)
  - Camera at ground level, first-person
  - Frog appears just ahead (hallucination/guide)
  - Frog makes sounds (croaks/chirps) as audio waypoint
  - As camera approaches, frog DISAPPEARS (teleports further)
  - Cycle repeats
  - Fireflies light the path (visual navigation)
  - Glowing mushrooms / stones / gems / plants have outline glow
  - User can click ANY of these for micro-copy panels
  - Distant amber glow grows progressively brighter (campfire)
  - Path curves right → fast sharp left turn → trees part →
    amber light floods in → reveal clearing ahead
  - Copy fades in word-by-word in lower third (subtle, elegant)

PHASE D: MAIN PAGE (scroll 95-100%, user controls)
  - User arrives at the clearing
  - Camera does slow orbit / pan to reveal scene
  - Frog FINALLY STOPS, sits on log next to Yeri
  - Frog now has outline glow (interactable in Act 4)
  - Three PRIMARY clickables (fire, Yeri, tent) with outline
    glow + locked copy mapping
  - "IF YOU ARE WORTHY OF OUR PROCESS" floats above fire
  - Sky visible through canopy gap: moon + stars
  - User can scroll back and forth within this range
  - User can click any item to read about Anura
  - User can fill out application form
  - This IS the page. The journey was the loading adventure.
```
```

---

## CRT TV — DECISION LOCKED (Q3)

**Reference image confirmed:** Sony PVM broadcast monitor
(~1990s professional CRT, gray housing, squared shape, "SONY" badge
visible on bezel below screen, control buttons/knobs on lower front).

**Specs locked:**
- **Model class:** Sony PVM (Professional Video Monitor) — broadcast
  monitor, not consumer TV. Distinctly industrial/engineering look
- **Housing color:** dark gray (estimated `#3A3A3A` to `#4A4A4A`,
  matte finish)
- **Shape:** squared, slight taper toward back, NOT rounded
- **Bezel:** thin black bezel around screen, with "SONY" badge in
  white/light gray centered below screen
- **Screen:** CRT-style slightly curved glass (bulge visible on
  reference), tinted slightly darker than pure black when off
- **Controls:** row of buttons + knobs on lower front bezel, below
  SONY badge (visible in reference)
- **Era:** 1990s broadcast/professional
- **Aspect ratio:** ~4:3 (square-ish, more vertical than modern 16:9)
- **Stand:** implied base/feet (the reference shows it on a wooden
  surface; we render it floating in void)

**The CRT TV is:**
- **Loading screen object** (scroll 0%, visible while world loads)
- **NOT a diegetic object in the world** (it's not sitting in the
  swamp — it's purely the loading interface)
- Unmounts after Phase B (fall) completes — user never sees it again

**Why this CRT and not another:**
- Matches the "faceless elite digital studio" aesthetic — it's the
  kind of CRT an engineer or designer would choose
- NOT the family living room TV (consumer Trinitron would feel
  kitsch)
- NOT the 80s bulky TV (too nostalgic)
- Professional broadcast monitor = "we use the right tool for the
  job" signaling

**Implication for code:**
- The CRT (housing, bezel, knobs, screen mesh) is a SEPARATE React
  component from the world
- It mounts in Phase A (loading), animates the warp-out transition
  in Phase B (fall start), then UNMOUNTS
- The frog is INSIDE the CRT screen during Phase A, then becomes
  part of the world geometry (positions itself in the forest as
  the guide character)
- The screen content during loading (loading bar, terminal text,
  frog) is a SEPARATE plane mesh inside the CRT frame, not the
  world geometry

---

## BRAIN FILE RECONCILIATION — ITEMS TO UPDATE

After architecture lock, the brain file `_brain/100_anura-systems.md`
needs these updates (deferred to end-of-session):

1. **Architecture section** — replace "5 acts as separate scenes"
   with "one world + scroll-driven camera path"
2. **File map section** — remove `scenes/Act1Gate.tsx`,
   `scenes/Act2Drift.tsx`, `scenes/Act4Clearing.tsx`,
   `scenes/FrogTest.tsx` references; replace with single
   `src/world/` structure
3. **Scene state section** — update to describe one world
4. **Asset status** — clarify CRT is loading-only (not world object)

These updates will happen in a single batch edit AFTER all
decisions are locked.

---

## FOLDER RESTRUCTURE — PROPOSED

```
src/
├── main.tsx                       # entry
├── App.tsx                        # phase orchestrator
├── world/                         # ONE persistent world
│   ├── World.tsx                  # all geometry, lights, fog
│   ├── camera/
│   │   ├── ScrollCamera.tsx       # scroll-driven CatmullRomCurve3 path
│   │   ├── keyframes.ts           # 5+ keyframes along the path
│   │   └── hotspots.ts            # clickable items in the world
│   ├── environment/
│   │   ├── Sky.tsx                # sky dome + moon
│   │   ├── Terrain.tsx            # ground + path
│   │   ├── Forest.tsx             # trees (instanced)
│   │   ├── Atmosphere.tsx         # fog + god-rays + mist planes
│   │   └── Lighting.tsx           # all lights (moon, fill, fire, etc.)
│   ├── characters/
│   │   ├── Frog.tsx               # Anura mascot
│   │   └── Yeri.tsx               # on log by fire in clearing
│   ├── props/
│   │   ├── Tent.tsx               # dark red tent
│   │   ├── Campfire.tsx           # fire + embers
│   │   └── Log.tsx                # log Yeri sits on
│   └── effects/
│       ├── GodRays.tsx            # volumetric light shafts
│       ├── Fireflies.tsx          # particle system
│       └── PostFX.tsx             # EffectComposer setup
├── loading/                       # Phase A: loading screen
│   ├── CRTScreen.tsx              # the Sony CRT TV
│   ├── LoadingBar.tsx             # chunky pixel-art bar
│   ├── Terminal.tsx               # typewriter text
│   └── FrogOnScreen.tsx           # frog inside CRT screen
├── transition/                    # Phase B: fall cinematic
│   ├── WarpIn.tsx                 # CRT screen pulls camera in
│   ├── Falling.tsx                # autoplay fall through clouds
│   └── Landing.tsx                # splash into mud
├── hud/                           # Phase C-D: scrollable interface
│   ├── ScrollText.tsx             # copy fades in based on scroll
│   ├── HotspotPanel.tsx           # click-to-open info panels
│   └── ApplicationForm.tsx        # "IF YOU ARE WORTHY" gate
├── shared/
│   ├── palette.ts                 # 14-color palette tokens
│   ├── fonts.ts                   # trinity font stack
│   └── animations.ts              # GSAP easings + durations
└── styles/
    └── global.css                 # CSS variables + base styles
```

**This replaces the existing `scenes/` and `r3f/` folders.**

---

## WHAT'S NEXT

Block 5 (Visual Quality Standard) ✅ LOCKED.
Block 20 (Architecture) ✅ LOCKED.

**Next decision block:** **Block 30 — World Contents** (the actual
geometry in the world: trees, frog, tent, campfire, Yeri, path,
etc.) — what each is, where each is positioned, what each looks
like at the locked quality tier.

Then:
- **Block 40** — Scroll path (camera keyframes, timing, easing)
- **Block 50** — HUD/copy (every word that appears on screen, when,
  where, how)
- **Block 60** — Audio (every sound, when, layered)
- **Block 70** — Hotspots (every clickable, what it opens, where
  it's positioned)

**No code yet.** Block 30 is the next lock — pure decisions about
what's in the world and where.

---

## ONE MORE CONFIRMATION NEEDED

I need to confirm one detail before locking Block 30. The user said:

> *"act 1 is loading screeen that loads the world really quickly with
> a few words on whats loading on the gray sony crt tv and on the
> screeen will be a anura mascot and that is the 3d frog"*

**The CRT is specifically a "gray Sony CRT TV"** — this is a
specific brand reference. Sony CRT TVs from the 80s-90s were
distinctive:
- Gray/beige plastic housing (not cream, not black)
- Trinitron-style curved glass screen
- Distinctive Sony badge
- Boxy but slightly tapered design
- Physical knobs and buttons on the front

**Question:** Is this a specific Sony model reference (e.g.,
Trinitron PVM, Sony PVM-20M2U, Sony Watchman), or just "any old
Sony CRT TV"? This affects the geometry we build.

If you have a specific reference image of the Sony CRT you have
in mind, send it. Otherwise I'll default to **Sony Trinitron PVM
(monitor-style, professional broadcast look)** — gray housing,
slightly more squared than consumer TVs, distinctive bezel.

**Confirm Sony model or send reference, and we move to Block 30.**
