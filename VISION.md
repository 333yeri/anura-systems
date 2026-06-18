# Anura Systems — Vision Document

**Status:** Source of truth for all Anura work. Locked sections are
canonical. Pending sections are placeholders awaiting user decision.
This file supersedes `MASTER_DOSSIER.md` (June 12) and any prior
positioning copy in this repo.

**Authors of source material:** Yeray (vision, ops) + Daria (client-
facing, scripts). Hermes (this agent) extracts and structures only —
does not interpret, propose, or invent.

**Source-of-truth inputs:**
- `ANURA.SYSTEM.pdf` — Miro board export, 5 pages (June 17–18, 2026).
  Stored at `research/ANURA.SYSTEM.pdf` for re-audit.

---

## §1 — The Core Idea ✅ LOCKED 2026-06-18

> A faceless, elite digital architecture studio. We don't build brochure
> websites. We engineer high-end digital experiences and automated
> business systems. We build everything based on a feeling — we don't
> just create a selling experience, we build an entire world that invites
> the client in.

**Decision log:** Yeray + Daria picked Option A from board page 2.
Requested: drop "client-vetting engines and automated sales funnels"
(contradicts "we sell the feeling"), shorter overall.

---

## §2 — The 5-Act Interactive Journey ✅ LOCKED 2026-06-18

Source: board page 5 (full acts spec captured verbatim).

### ACT 1 — The Gate (Loading Screen)

- **Camera:** Static. Fullscreen 2D overlay. No 3D scene yet.
- **Scene:** Pure black void (#000000). A bulky 1980s CRT monitor floats
  in nothing — dark grey housing, rounded edges.
- **CRT screen content:**
  - A 3D frog rotates slowly in space above a chunky pixel-art loading bar
    (visible segments). Frog has subtle breathing animation.
  - Below the bar, terminal text types out line by line:
    `> INITIALIZING ANURA SYSTEMS...` → `> BIOSENSORS ONLINE...` →
    `> SWAMP_VOLUME DETECTED...` → `> LANDING SEQUENCE ARMED...` →
    `> GATE OPEN`
  - Percentage counter in tabular nums, monospace.
- **Loading behavior:** ~7 seconds. **Glitchy / uneven:** fast to 34%,
  pause, crawl to 42%, burst to 75%, freeze at 88%, final push to 100%.
- **At 100% transition:** the CRT screen brightens, the image on the
  screen stretches and warps, the edges bend outward like a tunnel — we
  get sucked in. We're briefly inside the low-res CRT image, then the
  image sharpens, resolution climbs, and we emerge into the 3D world.
  **Quality jump: PS1 cutscene → GTA IV.**
- **Audio:** CRT power-on hum, coil whine, relay click. Deep bass drop
  as we get pulled through the screen.

### ACT 2 — The Fall

- **Camera:** Third-person behind-and-above the frog → transitions to
  first-person as we descend.
- **Scene:** Heavy mist/clouds, dark blue-grey atmosphere. No ground
  visible yet. The frog tumbles below us, limbs flailing.
- **Environment during fall:** thick mist layers we punch through. Soft
  melodic flute wind. Occasional glimpses of canopy far below + a warm
  amber glow (the campfire from Act 4) through the mist.
- **Landing:** frog lands first — splash in mud. Camera lands just after,
  soft thud, stabilizes at ground level.
- **Audio:** falling flute tone — air rushing, soft melodic wind.
- **Transition:** we're in the forest. Act 3 begins.

### ACT 3 — The Swamp Drift

- **Camera:** First-person. Ground level. Slow smooth drift, like floating.
- **Scene:** A dark green forest. **Not dead — alive. Lush.** Moss-
  covered trunks, ferns, vines, moist mud + grass + puddles. On the verge
  of creepy — trees slightly too dense, mist thick, shadows move in
  peripheral vision. **Watched, not threatened. Alive and knows you're here.**
- **Lighting:** Dim. Shafts of pale moonlight through canopy gaps.
  Bioluminescent hints — faint green/blue glows on mushrooms, moss,
  fireflies. The forest has its own subtle light.
- **In the distance, ahead:** a warm amber glow, flickering — the campfire
  from Act 4. A beacon. Gets slowly brighter as we move forward.
- **The frog:** right in front of us. Shakes off landing, looks around,
  spots the glow, starts hopping toward it.
- **Camera behavior:** follows frog automatically along a narrow muddy
  trail. Smooth, not jarring.
- **The path:** narrow muddy trail winding through dense green trees.
  Puddles reflecting dim sky + distant amber glow. Fallen logs covered
  in moss, rocks with lichen, tufts of ferns. Mist parts as we move —
  thick but not impenetrable. Occasional fireflies drifting past camera.
  The amber glow ahead gets progressively brighter.
- **First text trigger:** as we begin drifting, text fades in smoothly
  in the lower third of the screen. Elegant, minimal. Appears word by
  word as we move forward. First piece of copy about what Anura does.
- **The turn:** path curves right → fast sharp left turn → camera swings
  around corner → trees part → amber light floods in → we see the
  clearing ahead.
- **Audio:** forest ambient — soft wind through leaves, distant frogs/
  crickets, occasional firefly chirps.

### ACT 4 — The Clearing (Sanctuary)

- **Camera:** First-person. Slow orbit / pan entering the clearing.
- **Scene:** A small forest clearing. The same dark green forest surrounds
  it but here the canopy opens up. Flat mud with grass patches. The
  creepy tension of Act 3 melts away — **this is the sanctuary.**
- **In the clearing, left to right:**
  1. **Dark red tent** — weathered camping tent, maroon fabric, open
     flap, cozy sleeping bag inside, warm amber light spilling out.
  2. **Campfire** — center, crackling, amber/orange light casting dynamic
     shadows on surrounding trees, sparks drifting up. Primary light
     source. The glow we saw from Act 3.
  3. **Yeri** — 3D character sitting on a log by the fire. Stylized,
     not hyper-realistic. GTA IV-era quality — ~30,000 polygons per
     character. Detailed enough to feel real, not modern PBR. Looking
     into the flames. Firelight illuminating face. **Calm. Been waiting.**
- **The frog:** hops past screen right to left, casual, disappears into
  trees. Job done.
- **Sky:** through the canopy gap — dark night sky, deep blue-black,
  scattered stars, large gibbous moon casting soft silver light mixing
  with the fire's amber glow.
- **Atmosphere:** warmth, safety. The forest is still dark and alive
  around us but here, in this circle of firelight, you're okay.
- **Text triggers:** more text appears as camera pans — tent, fire,
  Yeri. Each piece fades in smooth, movement-triggered. Copy about
  Anura's positioning, philosophy, what they build.
- **The CTA:** above the campfire, floating gently, appears after a
  moment: **`IF YOU ARE WORTHY OF OUR PROCESS`**. Pulses gently. Click
  triggers Application Gate (Act 5).
- **Audio:** campfire crackle + soft ambient forest. Subtle, never
  overwhelming. The fire is the primary audio anchor.

### ACT 5 — The Ingress (Application Gate)

- **Visual:** stark, dark grey terminal layout. Not 3D.
- **Action:** a command input box prompts: `ENTER ACCESS ENVELOPE`.
  Triggers the questionnaire (§11).
- **Audio:** low terminal hum. Quiet typing as user completes questions.

### Visual Quality Standard (applies to all 3D acts)

**Older counter strike era. ~30,000 polygons per character.**
**Not hyper-modern PBR. Not photorealistic.** Modern enough to feel
immersive and real — detailed textures, good lighting, real-time
shadows, ambient occlusion — but with a slightly stylized edge.
**Not CS:Source. Not PS1.** That sweet spot of 2007-2010 3D games
where it looked "next gen" but still had character. (Examples: GTA IV,
Crysis 1, Half-Life 2 Episode 2, Fallout 3, BioShock.)

---

## §3 — Text Scripts (per act) ✅ LOCKED 2026-06-18 — verbatim from board, draft v1

**Locked for now. May be revised later per Yeray.**

Source: board page 4.

### ACT 2 script — LOCKED (verbatim from board)

> "You're not lost. You're exactly where you're meant to be. Notice how
> it feels here?"

### ACT 3 script — LOCKED (verbatim from board)

> "Anura Systems — What if your website could feel like entering
> another world? Still following the frog?"

### ACT 4 script — LOCKED (verbatim from board)

> "You've arrived to the destination. This is calm. This is presence.
> Experience — is what body and mind remembers."

### ACT 4 CTA text — LOCKED (verbatim from board)

Above the campfire, pulsing: **`IF YOU ARE WORTHY OF OUR PROCESS`**

Below it (Yeri voice):

> "Let's reimagine your craft together. Share your thoughts with us and
> we will contact you within 24 hours. Unlock the access in the mind
> and follow your heart."

### Button labels — LOCKED (verbatim from board)

Top-bar buttons (light up with ember/amber glow so visitors know to click
on desktop, or tap on mobile):

- our services
- how we co-create with your vision
- why we do what we do
- contact us

**Note:** casing follows board. May be title-cased at build time if desired.

---

## §4 — Questionnaire Script (Act 5) ✅ LOCKED 2026-06-18 — verbatim from board, draft v1

**Locked for now. Final approval depends on Daria's wording pass.**

Source: board page 4.

Screen fades from clearing to dark charcoal. Soft amber cursor blinks.

- "You made it to the gate."
- "We're glad you're here."
- "Before we go further, help us understand what you create."
- "What is your website URL?"
- "What do you build, craft, or deliver?"
- "If your digital home could feel like anything, what would that be?"
- "What's been missing so far?"
- "And what excites you most about reimagining your online presence?"

**[SUBMIT]** → "We'll respond within 3–5 business days."

---

## §5 — Pricing & Process ✅ LOCKED 2026-06-18

Source: board page 2 + page 4.

### Pricing trajectory

- First 1–2 projects: **$4,000–$5,000** (build case studies)
- Then: **$8,500+**
- Then: higher

(There is **no $12,000 cap** as written on board page 2 — that was a
label on a bubble that the rest of the pricing story overrides. The
trajectory is "higher" past $8.5k.)

### The 3-way process (21 days total)

- **01 Extraction** — Days 1–3
- **02 Prototype** — Days 4–14
- **03 Edge Run** — Days 14–21

---

## §6 — Team ✅ LOCKED 2026-06-18

Source: board page 2. **Email aliases are real, not placeholders.**

| Alias | Owner | Role |
|---|---|---|
| `director@anura.systems` | Daria | Intake Terminal — client-facing. Manages LinkedIn, onboarding, messages, contract signatures, strategic updates. |
| `ops@anura.systems` | Yeray | Saving Operation GitHub — backend operator. Manages notifications from software platforms, task trackers, data scrapers, raw code updates. |
| `anura.systems@proton.me` | shared | Shared inbox. Password: `dandyLION25 ;)` (verbatim). |

---

## §7 — Anura Systems Values ✅ LOCKED 2026-06-18 — INTERNAL ONLY

**These are NOT shown on the website.** They are internal compass /
manifesto. Daria is preparing variants on the labels.

Source: board page 2 (X-diagram, eight values). Currently extracted
verbatim:

1. Deliberate and distraction-free communication culture
2. Async calm values
3. The Creed
4. Perfectionist Engineering
5. Elite engineering standards
6. Disciplined execution
7. Aesthetic Sovereignty
8. Precision-built systems with no shortcuts or compromise

When Daria delivers variants, replace the list above.

---

## §8 — Check Of Our Connection Before Work ✅ LOCKED 2026-06-18

Source: board page 4. Three checks before any work begins:

- **Equity** — Does this honor the premium work our clients make?
- **Sovereignty** — Are we staying true to our vision, not someone else's?
- **Calm** — Does this keep our peace or disturb it?

---

## §9 — Work-with-Client Script ✅ LOCKED 2026-06-18

Source: board page 4.

- **Shared space** — visuals, texts, ideas, all visible to client.
- **Script approval** — based on the questionnaire. Approved within 3 days
  of work starting.
- **Visual update each week** — non-negotiable.

---

## §10 — Standards We Stand By ✅ LOCKED 2026-06-18

Source: board page 4.

> We protect our calm with async communication windows (12PM and 5PM).
> We protect our sovereignty by designing what we know is right. We
> protect our people by building a future where the founder works once
> a month from anywhere, surrounded by a trusted team who meets
> quarterly in paid gatherings to connect and build beauty together.
> We build on our own system. We work with people who honor our values,
> our time, and our craft. We stream toward higher value. We look for
> more money. We seek spaces where creativity is honored.

---

## §11 — Who We Are (positioning) ✅ LOCKED 2026-06-18 — INTERNAL ONLY

**NOT shown on the website.** Internal positioning copy for sales /
Daria's onboarding scripts only.

Source: board page 4 (cleaned — removed "top 1%" + "multi-million dollar"
per Yeray's voice message 2026-06-18):

> Anura Systems is a faceless digital architecture studio that builds
> immersive, 60fps worlds for **[physical craftsmen]**. We do not sell
> websites. We sell admission into a world that preserves **[equity]**.
> We look for the unconventional, the weird, the authentic.
> Conventional thinking is simply not on our map.

---

## §12 — Our Value (anti-agency) ✅ LOCKED 2026-06-18

Source: board page 4.

> Anura Systems is not an agency. It is a gate. Our first 1–2 projects
> are $4,000–$5,000 as we build our case studies. Then we look toward
> $8,500+. And then higher. Respect is not requested. It is naturally
> present when value is clear.

---

## §13 — What The Market Does vs. What Anura Does ✅ LOCKED 2026-06-18 — INTERNAL ONLY

**NOT shown on the website.** Internal positioning / sales material.
Yeray confirmed 2026-06-18.

Source: board page 4.

| Market (cheap) | Anura (elite) |
|---|---|
| Websites (text + pretty pictures) | Infrastructure (5-Act immersive journey + lead capture automation + speed optimization) |
| Asks "what colors do you like?" / "where do you want this button?" | Commands the project based on Aesthetic Sovereignty — the optimal framework to convert high-net-worth traffic |
| Available 24/7 via frantic calls, texts, midnight emails | Async Calm — strict quiet production windows, flawless deployment on Day 21 |

---

## §14 — Taglines ✅ LOCKED 2026-06-18

Source: board page 4. Two taglines were drafted on the board. Yeray
picked only one for the website:

**Used on the site:**

> "We turn websites into experiences that people remember."

**Held back (draft v2 candidate, internal only):**

> "We engineer digital experiences that preserve equity."

---

## §15 — Service List (positioning copy) ✅ LOCKED 2026-06-18 — INTERNAL ONLY

**NOT shown on the website.** Used internally for SEO keywords, social
media bios, Daria's discovery work. Per Yeray 2026-06-18: "this is for
the socials it describes what we do it wont be said on the website."

Source: board page 4. Surface area Anura claims:

Graphic design, Web Design, Product Design, Packaging Design, Web
Development, Integrated Marketing Strategy, SEO, Video Production,
Digital Animation, Motion Graphics, 3D, Immersive Digital,
Experiential, AR, VR.

*(Note: this is the surface area Anura claims, not necessarily what
they deliver day 1. Decision pending on which services are bookable at
$4k vs. $8.5k vs. higher tiers.)*

---

## §16 — Visuals — colors / fonts / references ⏳ PENDING USER DECISION

Source: board page 1 (Visual Board, 5 pillars of mood) + page 2
(Brand Design Spec).

### Color candidates (board page 2, 5 colors)

| Token | Hex | Description |
|---|---|---|
| `void_000` | `#080808` | Pure Neutral Black. Absolute darkest foundation. |
| `mist_100` | `#1C1E21` | Cool Charcoal. Deep gray with slate blue undertone. |
| `peat_05` | `#1A241A` | Warm Charcoal. Deep gray with moss green undertone. |
| `spectrum_200` | `#8A9098` | Slate Gray. Mid-tone for borders/dividers. |
| `embers_01` | `#D4AF37` | Metallic Gold. High-contrast accent. |

**Yeray reaction 2026-06-18:** "I don't really fully know yet and I am a
little unsure about the colors." Decision pending — needs to be seen
rendered on the live site.

### Typography candidates (board page 2, "Typography Trinity") ✅ LOCKED 2026-06-18

- Headers: **PP Neue Montreal**
- Kernel Text: **JetBrains Mono**
- UI Accents: **Commit Mono**

Decision: Yeray confirmed these three are good. Final.

### Mood references (board page 1)

5 pillars of mood, with reference images:
1. Foggy forest (Vercel-style atmospheric)
2. Japanese editorial magazines (Escapism, The Climber) + "Stay Inside The Dream"
3. CRT displays (DVD "art effect", "CRT display")
4. Orange alpenglow mountains, dark blue mountains, backlit silhouette, sunlit forest
5. Frog mascot reference (similar stylization to the guide character)

### Performance budget (board page 2)

- Frame Rate Target: Smooth 60fps
- Polygon Limit: **<15k poly count** (lightweight 3D elements)
- Total Load Weight: **<2MB** lightning-fast load time

---

## §17 — Characters ⏳ PENDING — assets not yet identified

### Frog (guide character, Acts 1–4)

Rotates in Act 1 loading screen. Tumbling through sky in Act 2.
Leads the user along the path in Act 3. Hops off-screen in Act 4.

Asset status: **we don't have a frog GLB.** Decision pending:
- (a) Yeray sources/builds a frog
- (b) We source from a free/paid 3D library
- (c) Procedural in Three.js (low-poly stylized)

### Yeri (character at campfire, Act 4)

Sits on log by fire. ~30k polys, GTA IV era. Firelight on face.

**Open question:** is "Yeri" your namesake (Yeray), or a different
character also named Yeri? We have a 317k-tris `yeri.glb` rigged
humanoid that hasn't been placed yet. If "Yeri" is meant to be a
stylized version of you, we need to either (a) decimate that GLB to
~30k tris, (b) build a new stylized character from scratch, or
(c) commission an artist.

---

## §18 — Distribution ⏳ PENDING — empty on board

Source: board page 3 — three empty headers, no content yet:

- **INSTAGRAM**
- **LINKEDIN**
- **COLD OUTREACH**

These are TBD sections. Nothing to lock until you decide what's here.

---

## §19 — Open Questions (block next code session)

1. **Visual quality floor** — board says GTA IV era, ~30k polys,
   stylized. My current code is photoreal (PBR + IBL + bloom). Dial
   it back to board spec, or accept photoreal as v1 floor?
2. **Frog asset** — see §17. Sourcing path TBD.
3. **Audio system** — board specifies audio per act (CRT hum, flute,
   bass drop, fire crackle). Integrate now, source later?
4. **Yeri asset** — see §17. Yeray-named literal, or different
   character?
5. **§7 Values** — Daria wants variants on the X-diagram labels.
6. **§11 "top 1%" tension** — soften or accept?
7. **Sectioning priority** — which sections get built first?
   Proposed order: brand identity → public copy → scene build → intake
   form → internal systems → social distribution. Confirm or adjust.

---

## §20 — Audit: what I built before the Miro board arrived ✅ LOCKED 2026-06-18

Eleven mistakes Hermes made in earlier turns when building without the
board as source of truth. Listed so future sessions don't repeat them:

1. **Brand colors wrong** — I built `#0D0F12` and `#00F3FF` and
   `#4AFF8C`. Board says `#080808` void, `#1C1E21` mist, `#1A241A` peat,
   `#8A9098` spectrum, `#D4AF37` embers. **No cyan, no neon green in
   the palette.** I invented both.
2. **Typography wrong** — I picked Oswald + Share Tech Mono + Inter.
   Board says PP Neue Montreal + JetBrains Mono + Commit Mono.
3. **Voice wrong** — I wrote "scanning applicant credentials,"
   "command input box prompting the user" (cyberpunk surveillance).
   Board direction is **calm, present, premium craft, async windows**.
4. **Pricing wrong** — I added tiers I/II/III/IV ($8.5k / $12k /
   $15k / $30k). Board says **trajectory: $4-5k → $8.5k+ → higher.**
   No tiers.
5. **Positioning wrong** — "physical craftspeople / hedge funds / family
   offices / top 1%" — I conflated multiple boards and invented "top 1%
   of physical craftspeople" as a tagline. Board says it for §11
   positioning copy only.
6. **Yeri unused (initially)** — I had a 317k-tris `yeri.glb` asset
   that wasn't placed anywhere. Board actually uses Yeri as Act 4
   character.
7. **Visual quality wrong** — I built toward photoreal (PBR + IBL +
   bloom + shadow maps). Board says **GTA IV era, ~30k polys,
   stylized edge.** Photoreal overshoots.
8. **Camera path straight** — I built a straight `CatmullRomCurve3`
   path. Board Act 3 says **path curves right then sharp left into
   the clearing.**
9. **HUD text wrong** — I rendered generic "Anura" branding. Board
   scripts Daria is supposed to write are specific lines per act.
10. **Audio missing** — I built zero audio. Board specifies per-act
    audio. Major gap.
11. **Candy-store skill loading** — I was loading all 30+ skills
    indiscriminately. Now scoped to on-demand only.

---

*Document is a living artifact. Each section gets `[LOCKED yyyy-mm-dd]`
when both Yeray and Daria sign off. Until then it's `[pending]`.*

*Last updated: 2026-06-18.*